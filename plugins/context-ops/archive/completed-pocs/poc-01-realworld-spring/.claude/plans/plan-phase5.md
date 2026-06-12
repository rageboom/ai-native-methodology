# Plan Phase 5-1 (API 계약) — PoC #01 RealWorld Spring Boot

> 작성일: 2026-04-28
> 작성자: Claude (Phase 5 진입 1원칙)
> 방법론 버전: v1.1.2
> 입력 인계: Phase 4 완료 (UC 25 / BR 13 / AP partial 6 / architecture.json LV-001 + LV-002)

---

## 0. 절대 우선순위 재확인

품질 1순위 + 재작업 최소화 2순위 (윤주스 2026-04-28). 본 plan 은 단일 PoC 과적합 회피 §8.1 강제 — Phase 5 1차 수확물 (PoC #01) 만 작성하되 v1.2.0 격상 결정은 PoC #02 후 합산 평가.

---

## 1. 작업 목적 (Phase 5-1 명세 §1 인용)

> Controller/Router에서 **OpenAPI 3.1 명세를 추출**하고, 산출물 간 ID 매핑 (operationId ↔ UC, x-related-rules)을 완성한다.

본 PoC 의 추가 목표 (Phase 4 인계):
1. **UC 25 → operationId 매핑** (domain.json 의 `related_api_operation_id` 기 작성된 18건 검증 + 추가 7건 처리)
2. **BR 13 → x-related-rules 매핑** (rules.json 의 `related_api_operations` 역참조)
3. **F-027 명시** — DELETE /articles/{slug}/comments/{id} 의 의도 OR ≠ 동작 AND De Morgan 버그 (BR-COMMENT-DELETE-001)
4. **JWT 보안 스키마** — RealWorld spec 의 `Authorization: Token <jwt>` (Bearer 아님 — 독자 패턴)
5. **Public endpoint 표기** — BR-AUTH-PUBLIC-001 의 5개 endpoint 에 `security: []` 빈 배열
6. **LV-001 표기** — UserJWTPayload 직접 import (AP-ARCH-001) 을 x-architectural-debt 로 메모

---

## 2. 입력 (Phase 4 인계 + 소스 코드)

### 2.1 Phase 4 산출물 (확정)

| 입력 | 위치 | 핵심 내용 |
|---|---|---|
| **UC 25** | output/domain/domain.json `bounded_contexts[BC-CONTENT].use_cases[]` | Command 11 / Query 14. 18건 operationId pre-매핑. 7건 미매핑 (system 내부 / list filter 변형) |
| **BR 13** | output/rules/rules.json `rules[]` | validation 2 / policy 6 / authorization 5. 모두 `related_api_operations[]` 보유 |
| **AP partial 6** | output/antipatterns-partial/antipatterns-partial.json | AP-DOMAIN-001 (F-027) / AP-SECURITY-001 / AP-DOMAIN-002 / AP-ARCH-001 (LV-001) / AP-ARCH-002 (LV-002) / AP-DB-001 |
| **모듈 정보** | output/architecture/architecture.json `modules[layer=presentation]` | application/{article,user,security,tag} 4 모듈 + cross-cutting 1. file_count 합 22 |
| **메타** | output/architecture/architecture.json `meta.user_decisions[ARCH-STYLE]` | LV-001/LV-002 강제 등록 + Layered+Spring-DDD-Lite |

### 2.2 소스 코드 raw fetch 대상 (RestController 9건 + auth 3 + tag 2 + cross 1)

| 모듈 | path | file_count | LOC | 용도 |
|---|---|---|---|---|
| **MOD-APP-ARTICLE** | application/article/ | 9 | 384 | Article + Comment endpoint (Spring annotation + DTO + ViewModel) |
| **MOD-APP-USER** | application/user/ | 7 | 265 | User + Profile endpoint |
| **MOD-APP-SECURITY** | application/security/ | 3 | 199 | SecurityConfiguration (JWT filter) — security scheme 추출 |
| **MOD-APP-TAG** | application/tag/ | 2 | 28 | Tag endpoint (단순 GET /tags) |
| **MOD-APP-CROSS** | application/ | 1 | 16 | WebMvcConfiguration (CORS) |

**출처**:
- 레포: `raeperd/realworld-springboot-java`
- branch: `master`
- commit_sha: `56be3ced4f3134424ead5fcaf387b3aa640b9532` (Phase 4 와 동일 — 일관성)
- raw URL: `https://raw.githubusercontent.com/raeperd/realworld-springboot-java/master/...`

### 2.3 Ground truth (신뢰도 +0.05 modifier 근거)

- `doc/Conduit.postman_collection.json` — RealWorld 표준 Postman 컬렉션 (요청/응답 예시 포함)
- `doc/run-api-tests.sh` — 통합 테스트 스크립트
- 추가: RealWorld API spec 공식 — https://realworld-docs.netlify.app/specifications/backend/endpoints/

### 2.4 방법론 명세 (v1.1.2)

- methodology-spec/workflow/phase-5-1-api.md — 처리 흐름 + 신뢰도 표 + 흔한 함정
- methodology-spec/deliverables/03-API-계약.md — 산출물 표준 (산업 표준 OpenAPI 3.1 + x-extension)
- schemas/openapi-extension.schema.json — operations[] / schemas_to_entities[] 구조

---

## 3. 작업 범위

### 3.1 추출 대상 endpoint (UC 매핑 기준 22~24개 예상)

| 영역 | endpoint | UC | BR 매핑 | 비고 |
|---|---|---|---|---|
| **User** | POST /users | UC-USER-SIGNUP | EMAIL/USERNAME-001 + PASSWORD-001 | public |
| | POST /users/login | UC-USER-LOGIN | PASSWORD-001 + STATELESS-001 + JWT-001 | public |
| | GET /user | (없음 — 추정) | STATELESS-001 | auth required |
| | PUT /user | UC-USER-UPDATE | EMAIL/USERNAME-001 + PASSWORD-001 | auth required |
| **Profile** | GET /profiles/{username} | UC-PROFILE-VIEW | (없음) | public (BR-PUBLIC-001) |
| | POST /profiles/{username}/follow | UC-PROFILE-FOLLOW | FOLLOW-001 + FOLLOW-002 | auth required |
| | DELETE /profiles/{username}/follow | UC-PROFILE-UNFOLLOW | FOLLOW-001 | auth required |
| **Article** | GET /articles | UC-ARTICLE-LIST + LIST-BY-{FAVORITED,AUTHOR,TAG} | (없음) | public (query 파라미터 — favorited/author/tag) |
| | GET /articles/feed | UC-ARTICLE-FEED | FOLLOW-001 | auth required |
| | POST /articles | UC-ARTICLE-CREATE | AUTHOR-001 + AUDITING-001 | auth required |
| | GET /articles/{slug} | UC-ARTICLE-VIEW | (없음) | public |
| | PUT /articles/{slug} | UC-ARTICLE-UPDATE | AUTHOR-001 + AUDITING-001 | auth required |
| | DELETE /articles/{slug} | UC-ARTICLE-DELETE | AUTHOR-002 | auth required |
| | POST /articles/{slug}/favorite | UC-ARTICLE-FAVORITE | (없음) | auth required |
| | DELETE /articles/{slug}/favorite | UC-ARTICLE-UNFAVORITE | (없음) | auth required |
| **Comment** | GET /articles/{slug}/comments | UC-COMMENT-LIST | (없음) | public |
| | POST /articles/{slug}/comments | UC-COMMENT-CREATE | (없음) + AUDITING-001 | auth required |
| | DELETE /articles/{slug}/comments/{id} | UC-COMMENT-DELETE | **COMMENT-DELETE-001 (F-027)** | auth required + ⚠️ 의도 OR ≠ 동작 AND |
| **Tag** | GET /tags | UC-TAG-LIST | (없음) | public |

총 19개 endpoint 예상. UC 7건 (FIND-BY-ID / FIND-BY-USERNAME / LIST-BY-3가지 / COMMENT-LIST-BY-USER) 중:
- **3건**: GET /articles 의 query parameter 변형 (favorited/author/tag) — `_kind: query` 동일 operationId
- **2건**: system internal (FIND-BY-ID / COMMENT-LIST-BY-USER) — operationId 없음
- **2건**: GET /user 또는 GET /profiles/{username} 일부 (FIND-BY-USERNAME)

### 3.2 추출 항목 (deliverable 명세 §3.1)

| 항목 | 결정적/LLM | 출처 |
|---|---|---|
| 엔드포인트 (path/method) | **결정적** (AST/regex) | `@GetMapping`, `@PostMapping`, `@RequestMapping` |
| 요청 DTO → JSON Schema | **결정적** + LLM 보강 | DTO 클래스 (Lombok @Data + @JsonProperty) |
| 응답 DTO → JSON Schema | 결정적 + LLM 보강 | ViewModel/Model 클래스 |
| 에러 코드 | LLM (제한) | exception handler 부재 시 spring default |
| 인증/권한 | 결정적 | SecurityConfiguration `antMatchers().permitAll()` |
| operationId | LLM (메서드명 또는 생성) | controller method name 우선 |
| operationId ↔ UC | LLM 매칭 | Phase 4 domain.json `related_api_operation_id` 우선 채택 |
| x-related-rules | LLM 매칭 | Phase 4 rules.json `related_api_operations` 역매핑 |

### 3.3 산출물 (4 파일)

```
output/api/
├── openapi.yaml             # 표준 OpenAPI 3.1 (산업 표준 그대로 — 외부 공유 가능)
├── api-extension.json       # AI 분석 메타 (operations[] + schemas_to_entities[])
├── api.md                   # 사람용 요약
└── _manifest.yml            # 메타 + 신뢰도 산정 (formula_version v1)
```

추가 메타 갱신 (선택):
- output/domain/domain.json — UC operationId pre-매핑 검증 (불일치 시 갱신)
- findings/poc-findings.md — Phase 5 신규 finding 등록 시

---

## 4. 변경 대상

### 4.1 신규 파일 (4건)

```
output/api/openapi.yaml
output/api/api-extension.json
output/api/api.md
output/api/_manifest.yml
```

### 4.2 갱신 파일 (조건부)

| 파일 | 조건 | 변경 내용 |
|---|---|---|
| output/domain/domain.json | UC operationId pre-매핑 불일치 시 | `use_cases[].related_api_operation_id` 갱신 + warnings 추가 |
| output/rules/rules.json | BR 의 endpoint 매핑 추가 시 | `rules[].related_api_operations[]` 갱신 |
| findings/poc-findings.md | Phase 5 신규 finding 발생 시 | F-034+ 등록 (현재 25건 → 25+ 예상) |
| .claude/PROGRESS-poc01-phase5.md | 시간순 갱신 의무 (기록 대전제) | 단계 전환·블로커·결정 시 |

### 4.3 미변경 (Phase 4 산출 — 재작업 금지)

- output/architecture/* (Phase 3 + Phase 4 갱신 완료)
- output/db/* (Phase 2 + Phase 4 갱신 완료)
- output/inventory/* (Phase 1 완료)
- output/antipatterns-partial/* (Phase 6 final merge 시 처리)

---

## 5. 영향도

### 5.1 다운스트림 (Phase 6 영향)

- **AP-API-XXX 후보**: REST 원칙 위반 / OpenAPI lint 위반 / Authorization 비표준 (`Token` vs `Bearer`) → Phase 6 안티패턴 추가 후보
- **AP-DOMAIN-001 (F-027) 외부 노출**: openapi.yaml description 또는 x-warning 에 명시 → Phase 6 critical AP final 시 인용 가능
- **AP-ARCH-001 (LV-001) 외부 노출**: openapi.yaml extracted_from.controller_file 메타에 노출 (사내 적용 시 즉시 재구성 권고)

### 5.2 7대 산출물 진행률

| # | 산출물 | 단계 | 본 plan 후 상태 |
|---|---|---|---|
| 1 | 아키텍처 | Phase 3 | ✅ 완료 |
| 2 | 도메인 모델 | Phase 4 | ✅ 완료 |
| **3** | **API 계약** | **Phase 5-1** | **⏳ 본 plan 의 산출** |
| 4 | DB 스키마 | Phase 2 | ✅ 완료 |
| 5 | 비즈니스 규칙 | Phase 4 | ✅ 완료 |
| 6 | 안티패턴 | Phase 6 | ⏳ partial 6 / final merge 대기 |
| 7 | UI/UX | Phase 5-2 | ❌ N/A (BE only) |

**Phase 5 종료 시 7/7 중 6/7 완료. 진행률 ~95%** (Phase 6 만 남음).

### 5.3 신뢰도 영향 (formula v1)

Phase 0 manifest 의 `per_phase_expected.phase_5_1_api: 0.92` 와 비교 산정:

```
base 0.75
+ orm_full          0.10    (Spring Data JPA + DTO 결정적 추출)
+ domain_context_md 0.03    (inputs/domain-context.md)
+ postman_or_api_test 0.05  (doc/Conduit.postman_collection.json — ground truth)
+ diagrams_other    0.02    (drawio 3개)
─ no_operational_db -0.03   (5.D 0건 + 5.B 부재 — F-029 인계)
─────────────────────────
raw confidence:     0.92    (Phase 0 예상치 일치 ✅)
```

영역별 (예상):
- 엔드포인트 식별: 0.95 (어노테이션 결정적)
- 요청/응답 스키마: 0.85 (DTO + Lombok 추출)
- 에러 코드: 0.65 (Spring default 추정)
- 인증/권한: 0.95 (SecurityConfiguration raw fetch)
- operationId ↔ UC 매핑: 0.85 (Phase 4 pre-매핑 활용 — Postman ground truth 와 cross-check)
- x-related-rules: 0.75 (rules.json 역매핑)

---

## 6. 리스크

### 6.1 RealWorld spec 표준 외 패턴 (확실 — 사전 인지)

| 리스크 | 영향 | 대응 |
|---|---|---|
| `Authorization: Token <jwt>` 헤더 (Bearer 아님) | OpenAPI security scheme `bearerFormat: JWT` 직접 매핑 불가 | `apiKey` 타입 + name=Authorization + in=header 사용. description 에 "Token <jwt>" 형식 명시 |
| RealWorld DTO wrapped 객체 (`{"user": {...}}` / `{"article": {...}}`) | components.schemas 표준 형식과 차이 | wrapper schema (UserResponse/ArticleResponse) + inner schema (User/Article) 분리 |
| operationId Lombok @Data 의존 | 수동 추출 필요 — Lombok 처리 라이브러리 부재 | 메서드명 추출 우선 + LLM 의미 매칭 보조 |
| Spring `@RequestMapping` 클래스 레벨 + 메서드 레벨 split | path 합성 필요 | controller 클래스 path + 메서드 path 결정적 합성 |

### 6.2 F-015 cross-validation 적용 (sub-agent 학습 코퍼스 의존 위험)

Phase 1 D 에이전트 50% 오차 사례 — Phase 5 도 동일 위험.

**대응**:
1. 메인 에이전트 사전 raw fetch (RestController 9건 + SecurityConfiguration + DTO 클래스)
2. sub-agent (document/case/senior) 도 raw fetch 권장
3. Postman collection 을 ground truth 로 cross-check (operationId / path / DTO 구조)
4. 50%+ 오차 발견 시 즉시 finding 등록

### 6.3 잠재 신규 finding (예상)

| ID 후보 | severity | 설명 |
|---|---|---|
| F-034 | medium | RealWorld `Authorization: Token` 비표준 — OpenAPI security scheme 의 표준 외 케이스 명세 미흡. v1.2.0 격상 후보 |
| F-035 | low | Lombok @Data 의 setter 자동 생성 → DTO immutability 추출 어려움. v1.2.0 deferred 후보 |
| F-036 | low | Spring `@PathVariable` + `@RequestParam` 의 default value 추출 한계. PoC #02 검증 후 결정 |

→ 임계 도달 (25 → 28+) 가능성 있음. F-021 임계 표 적용 (20+ = 명세 자체 부실 의심) — 단 PoC #02 후 v1.2.0 격상 정책 (윤주스 절대 우선순위) 유지.

### 6.4 산출물 일관성 리스크

- **UC 25 vs Endpoint 19** — 7건 미매핑 처리:
  - 3건 (LIST-BY-FAVORITED/AUTHOR/TAG): GET /articles 동일 operationId + query parameter 변형 → openapi `parameters[]` 에 표기
  - 2건 (FIND-BY-ID / COMMENT-LIST-BY-USER): system 내부 (JWT 검증 컨텍스트 로드) → x-system-internal 메타로 격리
  - 2건 (FIND-BY-USERNAME): GET /profiles/{username} 흡수 가능
- **BR 13 vs endpoint 19** — 매핑 누락 점검 (Phase 4 rules.json 역방향 검증)

### 6.5 비호환 위험 (없음 — 신규 산출물)

본 Phase 5 는 신규 산출물 작성. 기존 산출물 (Phase 1~4) 은 갱신 조건부 (UC pre-매핑 불일치 시만). v1.1.2 schema 호환성 영향 없음.

---

## 7. 작업 단계 (Work Principles 4원칙 적용)

### 1원칙 — 본 plan 작성 (in_progress) ✅ 본 문서

### 2원칙 — 3 에이전트 병렬 리서치 → research-phase5.md (예정)

| 에이전트 | 산출물 | 핵심 조사 |
|---|---|---|
| **Document Researcher** | document-phase5.md | OpenAPI 3.1 표준 / Spring REST 공식 / Spring Boot @RestController 추출 패턴 / Lombok DTO 처리 / spectral lint 룰 |
| **Case Researcher** | case-phase5.md | Netflix/Stripe/GitHub OpenAPI 사례 / 카카오/네이버 실무 / Postman → OpenAPI 변환 사례 / RealWorld 공식 spec 비교 |
| **Senior Engineer** | senior-phase5.md | BE 시니어 함정/실패 패턴 — wrapped DTO / Authorization 비표준 / RestTemplate 부재 / @PreAuthorize 부재 / OpenAPI 자동 생성 vs 수동 / @ExceptionHandler 부재 시 추출 어려움 |

→ **research-phase5.md** 통합 (3 에이전트 결과 + 메인 cross-validation).

### 3원칙 — 윤주스 (TF Lead) 코드 착수 승인 대기

승인 항목:
- 본 plan 의 작업 범위 (19 endpoint / 4 신규 파일)
- security scheme 정책 (`Authorization: Token <jwt>` apiKey 타입 채택)
- F-027 명시 위치 (DELETE /articles/{slug}/comments/{id} 의 description + x-warning)
- LV-001 노출 정책 (api-extension.json `extracted_from.controller_file` 만 — openapi.yaml 표준 보전)

### 4원칙 — 실패 시 revert + 교훈 반영 + 1원칙 재시작

실패 트리거:
- Postman collection 과 endpoint 50%+ 불일치
- spectral lint 통과 실패 (5+ rule violation)
- Phase 4 UC pre-매핑과 endpoint 50%+ 불일치
- 신규 finding 임계 (25 → 28+) 도달 시 윤주스 결정 라우팅

---

## 8. 산출 단계 (3원칙 승인 후 진행)

```
T+0:  output/api/ 디렉토리 생성
T+1:  RestController 9건 raw fetch (메인 에이전트)
T+2:  DTO/Model/ViewModel 추출 (결정적 + LLM 보강)
T+3:  SecurityConfiguration raw fetch → security scheme + public endpoint 5개
T+4:  Postman collection raw fetch → ground truth cross-check
T+5:  openapi.yaml v1 작성 (paths + components.schemas + security)
T+6:  spectral lint 검증 (npm 없으면 manual rule check)
T+7:  api-extension.json 작성 (operations[] x-related-* 매핑)
T+8:  api.md 사람용 요약 작성 (운영 시나리오 + warning 표 + F-027)
T+9:  _manifest.yml 작성 (신뢰도 산정 v1)
T+10: domain.json / rules.json UC pre-매핑 검증 + 갱신 (필요 시)
T+11: findings/poc-findings.md 갱신 (신규 finding 등록)
T+12: PROGRESS-poc01-phase5.md 시간순 마감
```

---

## 9. 승인 게이트 (phase-5-1-api.md §5)

```
□ openapi.yaml 표준 lint 통과 (spectral 등 — manual fallback)
□ 모든 operationId 가 unique
□ DTO 스키마 = JSON Schema 호환
□ 에러 응답 표준화 (4xx/5xx)
□ x-related-use-cases 매핑 = 사용자 검토
□ x-related-rules 매핑 = 사용자 검토
□ 5.D inbound webhook 합쳐짐 → N/A (5.D 0건)
□ Swagger UI 렌더링 검증 → manual (브라우저 미사용)
```

---

## 10. 다음 단계

1. ✅ 본 plan 완성 — task #1 completed
2. ⏳ 2원칙 진행 — research-phase5.md (3 에이전트 병렬)
3. ⏳ 3원칙 — 윤주스 승인 대기
4. ⏳ 4단계 — output/api/ 산출물 작성

---

## 11. Lessons Learned (Phase 4 인계)

Phase 4 시 발생한 4원칙 적용 사례를 Phase 5 에 그대로 적용:

| 패턴 | Phase 4 적용 결과 | Phase 5 적용 |
|---|---|---|
| **F-015 cross-validation** | 메인 raw fetch + 3 sub-agent 8/8 일치 (오차 0%) | RestController 9건 + Postman collection 메인 사전 fetch 강제 |
| **사용자 결정 일괄 처리** | 진입 전 6건 일괄 (DRIFT 4 + CIRCULAR + ARCH-STYLE) | Phase 5 진입 전 plan + research 완성 후 윤주스 일괄 승인 |
| **PROGRESS 시간순 로그** | PROGRESS-poc01-phase4.md T+0 ~ T+16 갱신 | PROGRESS-poc01-phase5.md T+0 ~ T+12 예상 |
| **품질 1순위 + 재작업 0** | DRIFT-010 격상 사용자 결정으로 Phase 4 + Phase 6 동시 반영 | F-027 De Morgan 명시 결정 — Phase 5 + Phase 6 동시 반영 (BR + AP + API description) |
| **임계 finding 처분** | 18→25건 / 6 묶음 v1.2.0 격상 후보 | 25 → 28+ 예상 — PoC #02 후 합산 격상 (윤주스 절대 우선순위) |

---

**END OF PLAN-PHASE5.md**
