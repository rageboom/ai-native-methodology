# Research — PoC #02 Phase 4 (Document + Senior 통합)

> 작성: 2026-04-29 / 메인 통합 — 4원칙 2원칙 결산
> 입력: document-phase4-poc02.md / senior-phase4-poc02.md
> 가벼운 전략 효과 — Document 2분 32초 + Senior 1분 6초 = 약 4분 (Phase 3 Senior 30+분 대비 7배 단축)

---

## 0. 메인 1차 추정 검증 종합 ( 학습 효과 영역 진입 정합)

### 0.1 합치율

- Senior: 8/8 (100%)
- Document: 6/8 + 2건 severity 격상 권고
- → **메인 추정 정확도 양호** (Phase 3 와 동일 패턴)

### 0.2 F-044/F-048 패턴 — Phase 4 결과

- 메인 정정 사례: 0건 (Senior + Document 합의)
- **Senior 신규 발견 2건 ** (F-068 / F-069) — 단편 fetch 함정 회피 가치 입증
- → **방법론 학습 효과 영역 진입 (Phase 3 와 동일) + Senior 의 multi-file cross-check 가치 잔존**

---

## 1. 3-합의 영역

### A. PoC #01 critical 결함 해소 ✅

- AP-DOMAIN-001 (De Morgan) **비재현 확정** — ArticleCommentService.delete 단순 isNotAuthor
- F-027 (BR ≠ actual) **비재현 확정**
- AP-PERFORMANCE-002 (Pageable cap) **재현 + 회피** — ArticleFacets:21 size cap 50

### B. Aggregate / BC 정합

- 4 Aggregate Root (User / Article / ArticleComment / Tag — Vernon §10 정합)
- BC-CONTENT 단일 + BC-AUTH cross-cutting (PoC #01 정합)
- multi-module ≠ Bounded Context (Fowler / Evans)

### C. Hexagonal "naming hybrid" 재확인

- Phase 3 의 modular_monolith primary + hexagonal partial 재확인
- **단 port-adapter 경계 misuse** (PF-P4-002 + F-068) — 새 안티패턴 등장

---

## 2. 충돌 해소

### 2.1 PF-P4-001 severity 충돌

- Senior: medium 유지 (high 격상 검토 가치)
- Document: **high 격상** (RFC 7231 §4.2.2 명시 위반)
- **메인 결정: high 채택** — RFC 권위 + GitHub/Twitter 사례 + Senior production 트라우마 확실

### 2.2 PF-P4-002 severity 충돌

- Senior: high 유지
- Document: high 격상 (Wikipedia Hex Arch 명시 위반)
- **메인 결정: high 채택** (양자 합의)

### 2.3 BR-USER-FOLLOW-IDEMPOTENT severity

- 메인: low
- Document: medium 권고 (RFC 7231 정합 명시 가치)
- **메인 결정: low 유지** (RFC 정합 자체는 finding 가치 낮음 — 문서화만)

---

## 3. 14 BR 최종 표 (Given/When/Then 변환)

| ID                                     | 제목                                                      | severity        |
| -------------------------------------- | --------------------------------------------------------- | --------------- |
| BR-USER-EMAIL-UNIQUE-001               | email DB unique + JPA + App TOCTOU (race-safe DB UQ 1중)  | high            |
| BR-USER-USERNAME-UNIQUE-001            | username 동일 패턴                                        | high            |
| BR-USER-PASSWORD-ENCRYPTED-001         | encryptPassword 강제 (BCrypt)                             | high            |
| BR-USER-FOLLOW-DIRECTIONAL-001         | 단방향 follower → following                               | medium          |
| BR-USER-FOLLOW-IDEMPOTENT-001          | follow/unfollow silent return (RFC 7231 정합)             | low             |
| BR-USER-FOLLOW-NO-SELF-001             | self-follow 금지 (RealWorld 묵시 / 코드 부재 — PF-P4-006) | medium          |
| BR-ARTICLE-TITLE-UNIQUE-001            | 글로벌 unique (F-052 over-constraint caveat)              | high            |
| BR-ARTICLE-SLUG-UNIQUE-001             | RealWorld spec 정합                                       | medium          |
| BR-ARTICLE-AUTHOR-EDIT-ONLY-001        | isNotAuthor 검증 — edit/delete                            | high            |
| BR-ARTICLE-FAVORITE-NON-IDEMPOTENT-001 | favorite 이미 시 throw (RFC 7231 위반 — PF-P4-001)        | **high (격상)** |
| BR-COMMENT-AUTHOR-DELETE-ONLY-001      | isNotAuthor 검증 (PoC #01 De Morgan 비재현)               | high            |
| BR-LOGIN-EMAIL-PASSWORD-MATCH-001      | findByEmail + passwordEncoder.matches                     | high            |
| BR-PAGINATION-SIZE-CAP-50-001          | size 0~50 cap (PoC #01 부재 — 본 PoC 회피)                | medium          |
| BR-PAGINATION-PAGE-ZERO-BASED-001      | 0-based                                                   | low             |

---

## 4. 신규 finding 통합 (Phase 4)

### 4.1 메인 추정 6 candidate

| ID        | 제목                                                | 최종 severity               | status    |
| --------- | --------------------------------------------------- | --------------------------- | --------- |
| PF-P4-001 | favorite throw vs follow idempotent (RFC 7231 위반) | **high** ⬆️ (Document 정정) | promoted  |
| PF-P4-002 | UserRepositoryAdapter 도메인 검증 (Hexagonal 위반)  | **high** ⬆️ (Document 정정) | promoted  |
| PF-P4-003 | Article.setTitle race                               | **low** ⬇️ (Senior 강등)    | candidate |
| PF-P4-004 | UserRegistry + User redundancy                      | low + 의도 조사             | candidate |
| PF-P4-005 | Article delete CASCADE 부재                         | medium                      | promoted  |
| PF-P4-006 | self-follow 부재                                    | medium                      | promoted  |

### 4.2 sub-agent 신규 발견 (F-044/F-048 패턴 재현 )

| ID                | 출처     | 제목                                                                                                           | severity |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| **F-068**         | Senior   | ArticleRepositoryAdapter multi-aggregate delete orchestration (Adapter 도메인 책임 침범 — PF-P4-002 같은 줄기) | medium   |
| **F-069**         | Senior   | editTitle/Description/Content DRY 위반                                                                         | low      |
| **PF-P4-DOC-001** | Document | DELETE unfavorite RFC 7231 §4.2.2 명시 위반 (PF-P4-001 sub)                                                    | high     |
| **PF-P4-DOC-002** | Document | Hexagonal port-adapter 책임 분리 가이드 부재 (방법론 본체)                                                     | medium   |

### 4.3 정식 ID 부여 (F-070~F-075)

| 정식 ID | 통합 ID                   | 제목                                                                                | severity | status    |
| ------- | ------------------------- | ----------------------------------------------------------------------------------- | -------- | --------- |
| F-070   | PF-P4-001 + PF-P4-DOC-001 | favorite/unfavorite throw — RFC 7231 §4.2.2 위반 (DELETE idempotent MUST)           | **high** | promoted  |
| F-071   | PF-P4-002                 | UserRepositoryAdapter 도메인 검증 — Hexagonal port-adapter 경계 위반                | **high** | promoted  |
| F-072   | F-068                     | ArticleRepositoryAdapter multi-aggregate delete orchestration (PF-P4-002 같은 줄기) | medium   | promoted  |
| F-073   | PF-P4-005                 | Article delete CASCADE 부재 + favorite/tag orphan row 잠재                          | medium   | promoted  |
| F-074   | PF-P4-006                 | self-follow 금지 코드 부재                                                          | medium   | promoted  |
| F-075   | PF-P4-DOC-002             | Hexagonal port-adapter 책임 분리 가이드 부재 (방법론 본체)                          | medium   | promoted  |
| F-076   | PF-P4-003                 | Article.setTitle TOCTOU race (low 강등)                                             | low      | candidate |
| F-077   | PF-P4-004                 | UserRegistry + User 양쪽 검증 redundancy                                            | low      | candidate |
| F-078   | F-069                     | editTitle/Description/Content DRY 위반                                              | low      | candidate |

→ **9 신규 finding** (promoted 6 + candidate 3).

---

## 5. PoC #01 finding 외부 검증 (Phase 4 영역)

| PoC #01 ID                            | 본 PoC 결과                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **AP-DOMAIN-001** (De Morgan)         | ❌ **비재현 (해소)** — ArticleCommentService 깔끔                                              |
| **F-027** (BR ≠ actual)               | ❌ **비재현**                                                                                  |
| **AP-PERFORMANCE-002** (Pageable cap) | ✅ **재현 + 회피** — ArticleFacets:21 size cap 50 명시 (PoC #01 부재)                          |
| **F-052** (article.title unique)      | (Phase 2 신규) — Phase 4 검증: 도메인 의미 위반 confirmed (BR-ARTICLE-TITLE-UNIQUE-001 caveat) |
| **F-053** (titleToSlug 8 함정)        | (Phase 2 신규) — Phase 4 검증: 도메인 메서드 분석 합산                                         |
| **F-058** (TOCTOU race-prone)         | (Phase 2 신규) — Phase 4: PF-P4-002 (F-071) 추가 위치 발견                                     |

---

## 6. §8.1 강제 평가

### 6.1 격상 매트릭스

| 패턴                                   | PoC #01                  | PoC #02       | 외부 사례                 | 격상 가부                              |
| -------------------------------------- | ------------------------ | ------------- | ------------------------- | -------------------------------------- |
| AP-DOMAIN-001 (De Morgan) 비재현       | 발생                     | 비재현        | (구현 차이)               | promoted (개선 권위)                   |
| F-070 favorite RFC 7231 위반           | (없음)                   | 있음          | RFC + GitHub/Twitter 사례 | promoted                               |
| F-071 Hexagonal port-adapter 위반      | (없음)                   | 있음          | Cockburn / Vernon 권위    | promoted (PoC #03 검증 후 묶음 D 격상) |
| F-072 Adapter delete orchestration     | (없음)                   | 있음          | (Senior 권위)             | promoted                               |
| F-073 CASCADE 부재 + Service 부분 처리 | (PoC #01 AP-DB-001 동일) | 있음          | 일반                      | promoted (PoC #01 AP-DB-001 합산)      |
| F-074 self-follow 부재                 | (PoC #01 동일)           | 있음          | RealWorld 묵시            | promoted (PoC #01 동일 패턴 합산)      |
| F-075 Hexagonal port-adapter 가이드    | (방법론 본체)            | (방법론 본체) | Vernon Ch. 4              | promoted (메타 finding)                |

### 6.2 §8.1 결론

- 격상 적합: 6건 (F-070~F-075)
- candidate (PoC #03 검증): 3건 (F-076~F-078)
- 본 PoC 특이: 0건 (모든 finding 이 일반 패턴)

---

## 7. 6 핵심 결정 (DEC-PHASE4-POC02-XXX)

### DEC-PHASE4-POC02-001 — F-070 (favorite RFC 7231 위반) high promoted

- 결정: PF-P4-001 + PF-P4-DOC-001 통합 high promoted
- 근거: RFC 7231 §4.2.2 명시 (DELETE idempotent MUST) + GitHub PUT 정합 / Twitter POST 2018 deprecated
- 적용: 사내 적용 시 favorite/unfavorite 모두 silent return + 200 OK

### DEC-PHASE4-POC02-002 — F-071 + F-072 (port-adapter 경계 위반) high/medium 묶음

- 결정: PF-P4-002 high + F-068 medium 통합 묶음 처리 (같은 줄기)
- 근거: Wikipedia Hex Arch + Vernon IDDD Ch. 4 명시 위반
- 적용: UserService.updateUserDetails 가 도메인 검증 + encryptPassword / Adapter 단순 save / ArticleService.delete 가 multi-aggregate orchestration

### DEC-PHASE4-POC02-003 — F-075 (Hexagonal 가이드 방법론 본체) medium promoted

- 결정: 방법론 본체 Hexagonal port-adapter 책임 분리 가이드 신설 권고
- 근거: PF-P4-002 (PoC #02) + Phase 1/2/3 의 Hexagonal naming hybrid 영역 누적
- 적용: v1.2.0 ADR 후보 (묶음 D 또는 신규)

### DEC-PHASE4-POC02-004 — Phase 4 raw confidence 0.83

- 결정: PoC #01 0.83 정합 (5.B FE 부재 + 5.D 외부 0건 패널티)
- F-026 (5.B/5.D 부재 패널티) PoC #02 재현

### DEC-PHASE4-POC02-005 — 4 Aggregate Root + BC-CONTENT 단일 채택

- 결정: User / Article / ArticleComment / Tag (Vernon §10 정합)
- BC-CONTENT 단일 + BC-AUTH cross-cutting (PoC #01 정합 / Fowler "multi-module ≠ BC")

### DEC-PHASE4-POC02-006 — 9 finding 등록 (F-070~F-078)

- 결정: 6 promoted + 3 candidate
- §8.1: 본 PoC 특이 0건 (모든 finding 일반 패턴) — v1.2.0 격상 적합

---

## 8. 4단계 진입 권고

### 8.1 Auto Mode 자율 적용 6건

- DEC-001 ~ DEC-006 모두 자율 적용

### 8.2 4단계 산출 9 파일

```
output/domain/
├── domain.json
├── domain.md
├── domain.mermaid
├── use-cases.md
├── ubiquitous-language.md
└── _manifest.yml

output/rules/
├── rules.json
├── rules.md
└── _manifest.yml

output/antipatterns-partial/
├── antipatterns-partial.json
└── _manifest.yml
```

### 8.3 finding 등록

- `findings/poc-findings.md` 갱신 (F-070~F-078)
- 누적: PoC #02 35 / 누적 68

---

## 9. 다음 단계

1. ✅ 1원칙 (plan)
2. ✅ 2원칙 (Document + Senior)
3. ⏳ 3원칙 — 6 핵심 결정 일괄 (Auto Mode)
4. ⏳ 4원칙 — 산출 9 파일 + finding 등록
5. ⏳ Phase 4 마감 → Phase 5-1 (API) 또는 PoC #03 분기 결정 (윤주스)

**END Research Phase 4 (가벼운 통합)**
