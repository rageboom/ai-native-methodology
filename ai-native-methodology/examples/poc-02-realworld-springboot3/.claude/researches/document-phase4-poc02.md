# Document Research — PoC #02 Phase 4 (가벼움)

> sub-agent 산출 (Document Researcher 가벼운 변형)
> 작성: 2026-04-29 / 권위 6건 / 약 2분 32초 / 시간 cap 8분 준수 ✅

## 1. 메인 1차 추정 검증 (간략)

| 영역 | 메인 1차 | Document 검증 |
|---|---|---|
| 25 UC (Service 1:1) | ✅ | ✅ confirmed |
| 14 BR | 의미 단위 ✅ | ✅ Given/When/Then 형식 변환만 권고 |
| Rich Domain Model | ✅ | ✅ Vernon §5 정합 |
| BR-USER-FOLLOW-IDEMPOTENT | low | **medium 권고** (RFC 7231 §4.2.2 정합 ★) |
| BR-ARTICLE-FAVORITE-NON-IDEMPOTENT | medium ★ | **high 권고 ⬆️** (RFC 7231 위반) |
| AP-DOMAIN-001 비재현 | ✅ | ✅ confirmed |
| F-027 비재현 | ✅ | ✅ |
| PF-P4-002 (Hexagonal violation) | medium | **high 권고 ⬆️** (Wikipedia Hex Arch 명시 위반) |

→ **정정 2건** (severity 격상): PF-P4-001 / PF-P4-002.

---

## 2. DDD-Lite Aggregate 정의 (Vernon IDDD)

### 본 PoC fit
- **User** ✅ Aggregate Root (UUID + lifecycle + 전역 진입점)
- **Article** ✅ Aggregate Root (slug + addTag/setTitle 도메인 행동)
- **ArticleComment** ✅ Aggregate Root (독립 lifecycle + isNotAuthor)
- **Tag** ⚠️ Reference Entity / small Aggregate (Vernon §10 권고 정합)
- **UserFollow / ArticleFavorite** = small Aggregate (Vernon "Small Aggregates" 가이드)
- **VO**: UserRegistry / ArticleFacets (Java 21 record)

→ 4 Aggregate Root + 2 small Aggregate = Vernon IDDD §10 정합

---

## 3. Bounded Context 단일 vs 분리

### Fowler 정의
> "models act as Ubiquitous Language, you need a different model when the language changes"

### 본 PoC 권고
- **BC-CONTENT 단일 + BC-AUTH cross-cutting** (PoC #01 정합)
- multi-module(`api/auth/core/persistence`) = **physical 분리** ≠ Bounded Context
- 양쪽 모듈 모두 같은 user/article/favorite 언어 사용

→ Evans Blue Book Ch. 14 — BC = conceptual / module = physical

---

## 4. BR Given/When/Then 형식 표준

### 패턴
```
Given <초기 상태>
When <트리거>
Then <기대 결과>
```

### 예시 — BR-ARTICLE-FAVORITE-NON-IDEMPOTENT (PF-P4-001)
```
Given 사용자가 article 을 이미 favorite 한 상태일 때
When favorite 요청이 다시 들어오면
Then IllegalArgumentException 발생
※ caveat: RFC 7231 §4.2.2 idempotency 위반
```

### BR-USER-FOLLOW-IDEMPOTENT (정합)
```
Given follower 가 following 을 이미 follow 한 상태일 때
When follow 요청이 다시 들어오면
Then 아무 변화 없이 silent return (RFC 7231 §4.2.2 idempotent ✅)
```

---

## 5. favorite vs follow idempotency (PF-P4-001 권위 ★)

### RFC 7231 §4.2.2 / RFC 9110 §9.2.2
> "A request method is considered 'idempotent' if the intended effect on the server of multiple identical requests with that method is the same as the effect for a single such request."
> "PUT, DELETE, and safe request methods are idempotent."

### 본 PoC 비대칭

| 동작 | HTTP method | 코드 동작 | RFC 정합? |
|---|---|---|---|
| favorite | POST | 이미 favorited → throw | POST non-idempotent — 형식상 OK / 의미 비대칭 |
| **unfavorite** | **DELETE** | 이미 unfavorited → throw | ❌ **DELETE idempotent MUST 위반** |
| follow | POST | 이미 following → silent return | ✅ idempotent |
| unfollow | DELETE | 이미 unfollowing → silent return | ✅ idempotent |

### 권고
- **PF-P4-001 severity medium → high 격상** (Document)
- 핵심 위반: `unfavorite (DELETE)` 의 IllegalArgumentException = RFC 7231 §4.2.2 명시 위반
- 권고: favorite/unfavorite 모두 silent return + 200 OK (follow/unfollow 패턴 정합)

### 업계 사례
- ✅ GitHub: `PUT /user/starred/:owner/:repo` (idempotent 204)
- ❌ Twitter: `POST favorites/create.json` (이미 favorite 시 403 — **2018 deprecated**) — 본 PoC 와 동일 안티패턴

---

## 6. Hexagonal Service vs Adapter 검증 위치 (PF-P4-002 권위 ★)

### Wikipedia Hexagonal Architecture
> "Adapters are the glue between components and the outside world. They tailor the exchanges between the external world and the ports..."
> Inside (core): Business rules and domain validation
> Outside (adapters): Technical protocol adaptation

### 본 PoC 위반 — UserRepositoryAdapter:65~83

```java
@Override @Transactional
public User updateUserDetails(UUID userId, PasswordEncoder passwordEncoder, ...) {
    return this.findById(userId)
        .map(user -> {
            if (!user.equalsEmail(email) && this.existsByEmail(email)) {
                throw new IllegalArgumentException(...);  // ★ 도메인 규칙
            }
            ...
            user.encryptPassword(passwordEncoder, password);  // ★ application 책임
            ...
        });
}
```

### 위반 3건
1. email/username unique 도메인 검증 → core 격리 위반
2. PasswordEncoder 인자 전달 → adapter 가 application 책임 흡수
3. TOCTOU race condition (F-058 합산)

### 권고
- **PF-P4-002 severity medium → high 격상**
- UserService.updateUserDetails 가 도메인 검증 + encryptPassword 호출, Adapter 는 단순 save 만

→ Cockburn (2005) + Vernon IDDD Ch. 4 — adapter = protocol translation only.

---

## 7. 신규 finding 권고

| ID | 제목 | severity |
|---|---|---|
| PF-P4-DOC-001 | DELETE 메서드 idempotency RFC 7231 위반 (unfavorite) | **high** (PF-P4-001 sub) |
| PF-P4-DOC-002 | Hexagonal port-adapter 책임 분리 가이드 부재 (방법론 본체) | medium (방법론 격상 후보) |

---

## 8. 종합

본 PoC #02 의 25 UC / 4 Aggregate Root / BC-CONTENT 단일 = Vernon IDDD + Fowler + Wikipedia Hex Arch 권위 정합. 메인 8건 중 6건 정합 / **2건 severity 격상** (PF-P4-001 / PF-P4-002 → high).

## 출처 (6 URL)
1. RFC 7231 §4.2.2 — https://www.rfc-editor.org/rfc/rfc7231
2. RFC 9110 §9.2.2 — https://www.rfc-editor.org/rfc/rfc9110
3. Fowler BoundedContext — https://martinfowler.com/bliki/BoundedContext.html
4. Wikipedia Hexagonal — https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)
5. Vernon IDDD (2013) Ch. 10
6. Evans Blue Book (2003) Ch. 14

**END Document Phase 4**
