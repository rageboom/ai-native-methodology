# 비즈니스 규칙 카탈로그 — PoC #01 RealWorld (Phase 4)

> **방법론**: AI-Native v1.1.2
> **작성일**: 2026-04-28
> **신뢰도**: 0.78 (5.A 가중)
> **스키마**: `schemas/rules.schema.json`
> **총 13건** — 5.A db_logic 11 + 5.C config_policy 2

---

## 0. ID 체계 (research → 산출물 매핑)

| research-phase4 ID | rules.json ID | 카테고리 |
|---|---|---|
| BR-USER-EMAIL-UNIQUE-001 | BR-USER-EMAIL-001 | validation |
| BR-USER-USERNAME-UNIQUE-001 | BR-USER-USERNAME-001 | validation |
| BR-USER-FOLLOW-DIRECTIONAL-001 | BR-USER-FOLLOW-001 | policy |
| BR-USER-FOLLOW-NO-SELF-001 | BR-USER-FOLLOW-002 | policy |
| BR-AUTH-PASSWORD-BCRYPT-001 | BR-AUTH-PASSWORD-001 | policy |
| BR-AUTH-STATELESS-001 | BR-AUTH-STATELESS-001 | policy |
| BR-AUTH-PUBLIC-ENDPOINTS-001 | BR-AUTH-PUBLIC-001 | authorization |
| BR-ARTICLE-AUTHOR-ONLY-EDIT-001 | BR-ARTICLE-AUTHOR-001 | authorization |
| BR-ARTICLE-AUTHOR-ONLY-DELETE-001 | BR-ARTICLE-AUTHOR-002 | authorization |
| BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 | BR-COMMENT-DELETE-001 | authorization |
| BR-DOMAIN-AUDITING-001 | BR-DOMAIN-AUDITING-001 | policy |
| BR-AUTH-JWT-EXPIRE-001 | BR-AUTH-JWT-001 | policy |
| BR-AUTH-JWT-SECRET-LENGTH-001 | BR-AUTH-JWT-002 | policy |

---

## 1. 카테고리별 분포

| 카테고리 | 개수 | 비고 |
|---|---|---|
| validation | 2 | DRIFT-010 격상 (App+DB 이중 부재) |
| policy | 6 | follow / password / auditing / JWT / stateless |
| authorization | 5 | article author + comment delete (F-027) + public endpoints |
| **합계** | **13** | |

## 2. 영역별 분포 (Phase 4 4영역)

| 영역 | 추출 BR | 비고 |
|---|---|---|
| **5.A db_logic** | 11 | Service/Entity raw fetch + ORM 검증 |
| **5.B fe_logic** | 0 | FE 부재 (BE only) — F-029 |
| **5.C config_policy** | 2 | application.properties + JWTConfiguration 매직 넘버 |
| **5.D external_dep** | 0 | 외부 의존성 0건 — F-026 |

---

## 3. 사람 검토 필수 (human_review_required) 6건

| BR ID | 사유 | 검토자 |
|---|---|---|
| BR-USER-EMAIL-001 | DRIFT-010 격상 — App+DB 이중 부재. 의도 명확하나 구현 부재. | domain_expert |
| BR-USER-USERNAME-001 | 동일 (DRIFT-010 부속) | domain_expert |
| BR-USER-FOLLOW-002 | self-follow 금지 — 코드 미명시 | domain_expert |
| BR-COMMENT-DELETE-001 | De Morgan 버그 — rule(의도) ≠ actual_behavior(구현). F-027 | domain_expert |
| BR-AUTH-JWT-001 | 2시간 매직 넘버 — RFC 권장 15min~1h 차이 | tech_lead |
| BR-AUTH-JWT-002 | 21byte SECRET — RFC 7515 §5.2.2 위반. AP critical 동시 | tech_lead |

---

## 4. ⚠️ rule vs actual_behavior 불일치 (F-027)

### BR-COMMENT-DELETE-001 — Comment 삭제 권한

| 측면 | 내용 |
|---|---|
| **의도 (rule)** | comment 작성자 OR article 작성자 → 삭제 가능 |
| **실제 동작** | comment 작성자 AND article 작성자 → 둘 다 충족 시만 삭제 가능 |
| **코드** | `domain/article/Article.java:86` |
| **버그 형태** | De Morgan 변환: `!A \|\| !B` ≡ `!(A && B)` |
| **수정 방향** | `\|\|` → `&&` 변경 (혹은 부정 제거: `if (user.equals(author) \|\| user.equals(commentsToDelete.getAuthor())) { ... 삭제 } else throw`) |
| **AP 동시 등록** | AP-DOMAIN-LOGIC-BUG-001 (critical) |
| **신규 finding** | F-027 — 잠재 버그 처리 가이드 부재 (BR vs actual_behavior 분리) |

> **격리 원칙**: BR 은 *의도* 만 기록. actual_behavior 는 별도 메모(human_review_note + AP) 로 분리. v1.2.0 격상 시 명세화 (F-027 promoted).

---

## 5. DRIFT-010 격상 — BR + AP 이중 등록 (App+DB 이중 부재)

### 검증 결과 (Phase 4 5.A)

```
domain/user/UserService.java:22
  signUp(SignUpRequest request) {
      User user = ...
      return userRepository.save(user);  // existsByEmail 부재 / try-catch 부재
  }

src/main/resources/schema.sql
  users.email VARCHAR(255) NOT NULL  // UNIQUE 부재
  users.name  VARCHAR(100) NOT NULL  // UNIQUE 부재

domain/user/Email.java
  @Column(name="email", nullable=false)  // unique=false 기본
```

### 격상 결정

| 단계 | severity | 처분 |
|---|---|---|
| Phase 2 발견 (DRIFT-010) | medium | 윤주스 결정: Phase 4 검증 라우팅 |
| Phase 4 검증 결과 | **high** | App+DB 이중 부재 → 격상 |
| 등록 산출물 | rules.json + antipatterns-partial.json | BR + AP 이중 |

### 사내 적용 권고 (REC-EMAIL-UNIQUE-DOUBLE)

1. **Application 레벨**: `userRepository.existsByEmail(email)` 사전 검사 + race condition 시 try-catch (DataIntegrityViolationException → 사용자 친화 에러)
2. **DB 레벨**: `ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email)` (운영 시 분산락 + 중복 cleanup 후)
3. **JPA 레벨**: `@Column(name="email", nullable=false, unique=true)` + `@Table(uniqueConstraints={@UniqueConstraint(columnNames="email")})`

→ 3중 방어 (한국 분산락 패턴 — case-phase4 인용).

---

## 6. JWT 보안 BR 2건 — Critical AP 동반

### BR-AUTH-JWT-001 — 만료 시간 (2시간)

```java
// infrastructure/jwt/JWTConfiguration.java:13
private static final long JWT_DURATION_SECONDS = 2 * 60 * 60;  // 매직 넘버
```

- 사내 적용 시 권고: 환경변수 분리 + short access token (15min) + refresh token 패턴
- 한국 권장 (case-phase4): 15min ~ 1h

### BR-AUTH-JWT-002 — SECRET 길이

```java
// infrastructure/jwt/JWTConfiguration.java:12
private static final String SECRET = "SOME_SIGNATURE_SECRET";  // 21 byte = 168 bit
```

- **위반**: RFC 7515 §5.2.2 (HMAC-SHA256 ≥ 256 bit)
- **격상**: AP-CONFIG-HARDCODED-SECRET-001 critical 동시 등록
- **사내 적용 권고**: 환경변수 + Vault/Parameter Store + 256bit ≥ random secret 강제

---

## 7. DRIFT 결정 후속 (Phase 2 → Phase 4)

| DRIFT | 결정 | rules.json 후속 |
|---|---|---|
| DRIFT-002 (단방향 follow) | A | BR-USER-FOLLOW-001 등록 |
| DRIFT-003 (권장만) | B | BR 영향 없음 (recommendations[REC-001] 만) |
| DRIFT-007 (NO ACTION 유지) | A | BR 영향 없음 (AP-DB-CASCADE-MISSING-001 만) |
| DRIFT-010 (Phase 4 검증) | C → 격상 | BR-USER-EMAIL-001 + BR-USER-USERNAME-001 + AP-VALIDATION-MISSING-EMAIL-UNIQUE-001 (high) |

---

## 8. 한계

- **5.B FE 부재**: form validation / multi-step wizard / permission UI 추출 0건 (F-029)
- **5.D 0건**: integration BR (외부 API contract / webhook 검증) 0건
- **5.C 빈약**: application.properties 8 lines + JWTConfiguration — 본격 운영 환경 다름
- **신뢰도 0.78**: 5.A 가중 (11/13). 명세 가이드 ~0.70 와 정합 (단 5.B/5.D 부재 패널티 -0.05 적용 후) — F-029 격상 후보

---

## 9. 참조

- 산출물: `rules.json` / 본 파일
- 입력: `.claude/researches/research-phase4.md` §3 + senior-phase4 §1.A/§1.C
- 결정: `output/architecture/architecture.json` (ARCH-STYLE/CIRCULAR-001) + `output/db/schema.json` (DRIFT 4건)
- 명세: `methodology-spec/workflow/phase-4-비즈니스로직.md`, `methodology-spec/finding-system.md`
