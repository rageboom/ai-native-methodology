# Research Phase 5-1 (API 계약) — 통합 결론

> 작성일: 2026-04-29
> 작성자: 메인 에이전트 (3 sub-agent 산출 + 메인 cross-validation 통합)
> 방법론 버전: v1.1.2
> Phase: PoC #01 RealWorld Spring Boot — Phase 5-1 (API 계약)
> 상위 plan: `.claude/plans/plan-phase5.md`
> 입력: `document-phase5.md` (1,232 line) / `case-phase5.md` (1,261 line) / `senior-phase5.md` (1,956 line) + 메인 사전 raw fetch 9회

---

## 0. 본 문서 사용법

본 문서는 **Phase 5-1 4단계 (산출 작성)** 의 **의사결정 가이드**. 본문 인용은 3 sub-agent 산출에 위임 (각 절에 reference 표기). 본 문서는 **합의/충돌 + 결론 + 4단계 작성 인덱스** 만 정리.

- **합의 사항** (3/3 동의): 본 문서 §2 / §3
- **충돌 사항** (sub-agent 간 의견 차): 본 문서 §4 (해당 없음 — 모두 합의)
- **결론** (메인 채택): 본 문서 §5
- **4단계 작성 인덱스** (T+0~T+12 단계 별 인용 파일/§): 본 문서 §6
- **신규 finding 등록 후보**: 본 문서 §7
- **Phase 6 AP candidate**: 본 문서 §8
- **v1.2.0 격상 묶음 추가**: 본 문서 §9

---

## 1. 입력 정합성 확인 (메인 cross-validation)

### 1.1 메인 사전 raw fetch 9건 (T+1 PROGRESS-poc01-phase5.md)

| # | 출처 | URL | 결과 |
|---|---|---|---|
| 1 | application/ 디렉토리 + 4 subdir | github raw | RestController 9건 위치 확정 |
| 2 | doc/Conduit.postman_collection.json | github raw | 22 endpoint ground truth |
| 3 | application/security/SecurityConfiguration.java | github raw | JWT filter / WebSecurity ignoring / permitAll 정책 |
| 4-7 | ArticleRestController / UserRestController / ProfileRestController / TagRestController | github raw | 어노테이션 / DTO / LV-001 |
| 8-9 | application/article/comment/* (4 files) | github raw | Comment endpoint 3건 |

### 1.2 22 endpoint 결정적 확정 (재확인)

| 영역 | 개수 | endpoint |
|---|---|---|
| User | 4 | POST /users / POST /users/login / GET /user / PUT /user |
| Profile | 3 | GET /profiles/{username} / POST + DELETE /profiles/{username}/follow |
| Article | 11 | POST + GET (4 query 변형 통합 = 1 operationId) + GET /feed + GET/PUT/DELETE /{slug} + POST/DELETE /favorite |
| Comment | 3 | POST + GET + DELETE /articles/{slug}/comments[/{id}] |
| Tag | 1 | GET /tags |

### 1.3 3 sub-agent cross-validation 결과

| 검증 항목 | Document | Case | Senior | 메인 결론 |
|---|---|---|---|---|
| 22 endpoint | ✅ 정합 | ✅ 정합 (RealWorld 공식 spec WebFetch) | ✅ 정합 | **확정** |
| `Authorization: Token <jwt>` apiKey 채택 | ✅ RFC 6750 §3 + OpenAPI 3.1 apiKey | ✅ 카카오 KakaoAK ★ + GitHub | ✅ 영역 14 | **확정** |
| wrapper schema 분리 | ✅ OpenAPI 3.1 components | ✅ Stripe·GitHub | ✅ 영역 2 | **확정** |
| F-027 De Morgan 표기 | ✅ description + x-extension 허용 | ✅ GitHub `x-github` 모방 | ★ **3중 표기 권고** (description + x-warning + x-known-bug) | **확정 — Senior 3중 표기 채택** |
| LV-001 노출 | ✅ x-extension 분리 모범 | ✅ GitHub `x-github` 모방 ★★★ | ✅ 영역 14 | **확정** |
| 4 GET /articles 단일 operationId | ✅ Spectral operation-operationId-unique | ✅ RealWorld 공식 spec | ✅ 영역 14 | **확정** |

### 1.4 잠재 불일치 3건 검증 결과

| 항목 | Document | Case | Senior | 메인 결론 |
|---|---|---|---|---|
| `sessionCreationPolicy(STATELESS)` 명시 부재 | ⚠️ Spring Security Javadoc IF_REQUIRED default → JWT 의도 충돌 | ⚠️ F-XXX-1 후보 | **F-034 (medium)** behavior.imperfect_intent | **F-034 등록 + BR-AUTH-STATELESS-001 source_evidence 정밀화** |
| GET /user (Current User) — system internal 분류 | (영역 외) | ⚠️ F-XXX-2 후보 | **`system_internal=false` 갱신 + operationId `GetCurrentUser`** | **F-035 등록 + domain.json 갱신** |
| `WebSecurity#ignoring` vs `permitAll` | ⚠️ Spring Security 6 권고는 permitAll | ⚠️ F-XXX-3 후보 | **Phase 6 AP 후보** | **F-036 등록 + rules.json source_evidence 정밀화 + Phase 6 AP candidate** |

---

## 2. 5 핵심 결정 — 합의 사항 ✅

3 sub-agent 모두 합의. Phase 5 산출에 그대로 채택.

### 2.1 결정 1 — `Authorization: Token <jwt>` → OpenAPI `apiKey` security scheme

**결론**: ✅ 채택.

**근거**:
- Document §2.4 / §9.1 — RFC 6750 §3 "Bearer" 강제는 challenge 한정. OpenAPI 3.1 `apiKey + in:header + name:Authorization` 가 모든 헤더 토큰 수용.
- Case 토픽 6 — 카카오 KakaoAK ★★ (한국 5사 중 유일한 비표준 prefix 채택 사례 — 본 PoC 의 `Token` prefix 와 동일 패턴)
- Senior 영역 14 — Swagger UI 의 "Authorize" 버튼 호환성 + openapi-generator client codegen 호환

**산출 stub**:
```yaml
components:
  securitySchemes:
    TokenAuth:
      type: apiKey
      in: header
      name: Authorization
      description: |
        RealWorld 표준 JWT 인증.
        헤더 형식: `Authorization: Token <jwt>` (Bearer 아님 — RFC 6750 비표준).
        Spring Security `JWTFilter` 가 `Token ` prefix 를 stripping 후 JWT 파싱.
```

→ **인용 위치**: openapi.yaml `components.securitySchemes` (T+5)

### 2.2 결정 2 — Wrapped DTO (`{"user": {...}}`) → wrapper schema 분리

**결론**: ✅ 채택. **3-tier 명명** (Senior 권고).

**근거**:
- Document §2.2 — OpenAPI 3.1 components.schemas 다수 사용 가능
- Case 토픽 4 — Stripe / GitHub 의 wrapper 패턴
- Senior 영역 2 — components.schemas 명명 충돌 회피 (User Aggregate vs UserResponse wrapper)

**3-tier 명명 규칙**:
- **Inner schema**: `User`, `Article`, `Comment`, `Profile` (Phase 4 domain.json Aggregate 와 동일)
- **Wrapper response**: `UserResponse`, `ArticleResponse`, `CommentResponse`, `ProfileResponse`
- **Wrapper request**: `LoginUserRequest`, `NewUserRequest`, `UpdateUserRequest`, `NewArticleRequest`, `UpdateArticleRequest`, `NewCommentRequest`

**충돌 회피**: components.schemas 의 `User` 는 inner schema 만 — Aggregate 정의는 domain.json 에 있음 (Phase 4 cross-link 보전).

→ **인용 위치**: openapi.yaml `components.schemas` (T+5)

### 2.3 결정 3 — F-027 De Morgan 명시 → **3중 표기**

**결론**: ✅ Senior 권고 (3중 표기) 채택.

**근거**:
- Document §2.3 — operation `description` 표준 + `x-` vendor extension 허용
- Case 토픽 8 — GitHub `x-github` extension 의 `triggersNotification` 류 메타 노출 패턴
- Senior 영역 6 critical ★ — `description` 만 표기 시 client codegen 누락. `x-warning` + `x-known-bug` 병행 + Phase 6 critical AP cross-link 필수

**3중 표기 위치**: `paths./articles/{slug}/comments/{commentId}.delete`

**산출 stub**:
```yaml
paths:
  /articles/{slug}/comments/{commentId}:
    delete:
      operationId: DeleteComment
      summary: Delete a comment from an article
      description: |
        ⚠️ **F-027 KNOWN BUG** — De Morgan 법칙 위반 (intended OR vs implemented AND)

        **의도** (BR-COMMENT-DELETE-001): 댓글 작성자 OR 게시글 작성자가 삭제 가능
        **실제 동작** (Article.java:86): 댓글 작성자 AND 게시글 작성자 모두 일치해야 삭제 (사실상 삭제 거의 불가)

        사내 적용 시 즉시 수정 필요. AP-DOMAIN-001 critical 참조.
      x-warning:
        type: known-bug
        severity: critical
        finding_id: F-027
        related_anti_pattern: AP-DOMAIN-001
      x-known-bug:
        id: F-027
        location: domain/article/Article.java:86
        intended_logic: "comment.getAuthor() == loginUser OR article.getAuthor() == loginUser"
        actual_logic: "!(comment.getAuthor() != loginUser && article.getAuthor() != loginUser)"
        impact: "댓글 삭제 거의 불가 (작성자 ≠ 게시글 저자 케이스에서 실패)"
        recommendation: "BR-COMMENT-DELETE-001 의 의도대로 OR 변경. AP-DOMAIN-001 critical 참조."
```

→ **인용 위치**: openapi.yaml `paths./articles/{slug}/comments/{commentId}.delete` (T+5) + api.md warning 표 (T+8)

### 2.4 결정 4 — LV-001 → api-extension.json `extracted_from.controller_file` 만

**결론**: ✅ 채택. openapi.yaml 표준 보전.

**근거**:
- Document §7.4 — x-extension 분리 = OpenAPI 3.1 vendor extension 모범
- Case 토픽 8 ★★★ — GitHub `x-github` extension 패턴 isomorphic 모방 (사내 의미 노출이 본 PoC 의 `x-architectural-debt` / `x-known-bug` / `x-related-rules` 와 동일)
- Senior 영역 14 — 사내 메타 노출 vs 표준 spec 보전 분리 정책

**산출 stub** (api-extension.json):
```json
{
  "operations": [
    {
      "operationId": "CreateArticle",
      "extracted_from": {
        "controller_file": "application/article/ArticleApi.java",
        "controller_method": "createArticle",
        "framework": "Spring MVC",
        "annotation": "@PostMapping(\"\")"
      },
      "x-architectural-debt": {
        "id": "LV-001",
        "description": "Layer Violation — application/article/ArticleApi.java 가 infrastructure/jwt/UserJWTPayload 를 직접 import",
        "related_anti_pattern": "AP-ARCH-001",
        "severity": "medium",
        "remediation": "사내 적용 시 application 레이어에 AuthContext 추상화 도입"
      },
      "x-related-use-cases": ["UC-ARTICLE-CREATE"],
      "x-related-rules": ["BR-AUTHOR-001", "BR-AUDITING-001"]
    }
  ]
}
```

→ **인용 위치**: api-extension.json `operations[].x-architectural-debt` (T+7)

### 2.5 결정 5 — 4 GET /articles 변형 → 단일 operationId `GetArticles` + query parameters

**결론**: ✅ 채택. UC 4건 (LIST + LIST-BY-AUTHOR/TAG/FAVORITED) 은 `x-related-use-cases` 배열로 통합.

**근거**:
- Document §6 (Spectral operation-operationId-unique 룰) — 같은 path+method 는 단일 operation 강제
- Case 토픽 1 — RealWorld 공식 spec 도 단일 operation
- Senior 영역 14 — UC 4건 매핑 시 query 파라미터 표기

**산출 stub**:
```yaml
paths:
  /articles:
    get:
      operationId: GetArticles
      summary: List articles globally
      parameters:
        - name: tag
          in: query
          schema: {type: string}
          description: Filter by tag (UC-ARTICLE-LIST-BY-TAG)
        - name: author
          in: query
          schema: {type: string}
          description: Filter by author username (UC-ARTICLE-LIST-BY-AUTHOR)
        - name: favorited
          in: query
          schema: {type: string}
          description: Filter by favorited username (UC-ARTICLE-LIST-BY-FAVORITED)
        - name: limit
          in: query
          schema: {type: integer, default: 20, maximum: 100}
        - name: offset
          in: query
          schema: {type: integer, default: 0, minimum: 0}
      x-related-use-cases:
        - UC-ARTICLE-LIST
        - UC-ARTICLE-LIST-BY-AUTHOR
        - UC-ARTICLE-LIST-BY-TAG
        - UC-ARTICLE-LIST-BY-FAVORITED
```

⚠️ **Senior 영역 5 추가 권고**: `limit` `maximum: 100` cap 추가 (RealWorld 코드는 cap 없음 — DoS 위험). 사내 적용 권고로 spec 에 명시.

→ **인용 위치**: openapi.yaml `paths./articles.get` (T+5) + api-extension.json `x-related-use-cases` (T+7)

---

## 3. 잠재 불일치 3건 — 결론

3 sub-agent 모두 신규 finding 등록 합의.

### 3.1 F-034 (medium) — `sessionCreationPolicy(STATELESS)` 명시 부재

**결론**: 신규 finding 등록 + BR-AUTH-STATELESS-001 source_evidence 정밀화.

**근거**:
- Document §3.5 — Spring Security Javadoc default = IF_REQUIRED. 명시 부재 시 IF_REQUIRED 적용 → JWT 의도 충돌 (사실상 STATELESS 동작이지만 명시 부재 = 사내 적용 위험)
- Case §1.2 — `sessionManagement().sessionCreationPolicy(STATELESS)` 명시 권고 (Spring Security 표준 가이드)
- Senior 영역 14 — `behavior.imperfect_intent` finding 분류 + `architecture.json auth_authorization confidence 0.95 → 0.85` 하향 권고

**Phase 4 갱신**:
- `output/rules/rules.json` BR-AUTH-STATELESS-001 의 `source_evidence` 정밀화:
  ```diff
  - source_evidence: ["sessionCreationPolicy(STATELESS) in SecurityConfiguration"]
  + source_evidence: [
  +   "csrf().disable() + formLogin().disable() + httpBasic().disable() + JWTFilter only in SecurityConfiguration",
  +   "사실상 STATELESS 동작 — 단 sessionCreationPolicy(STATELESS) 명시 부재 (Spring 5.x default = IF_REQUIRED)",
  +   "F-034 (신규) — 사내 적용 시 명시 필수"
  + ]
  ```

### 3.2 F-035 (high) — `GET /user` UC 매핑 갱신

**결론**: 신규 finding 등록 + domain.json 갱신.

**근거**:
- Senior 영역 14 — UC-USER-FIND-BY-ID 의 `system_internal=false` 갱신 + `related_api_operation_id: "GetCurrentUser"` 추가
- Case 토픽 1 — RealWorld 공식 spec 의 `GET /user` (Current User) 명확

**Phase 4 갱신**:
- `output/domain/domain.json` UC-USER-FIND-BY-ID 갱신:
  ```diff
  - system_internal: true
  + system_internal: false
  + related_api_operation_id: "GetCurrentUser"
  + note: "Phase 5-1 cross-validation 으로 system internal 재분류 — F-035 참조"
  ```

### 3.3 F-036 (low~medium) — `WebSecurity#ignoring` vs `permitAll`

**결론**: 신규 finding 등록 + Phase 6 AP candidate + rules.json source_evidence 정밀화.

**근거**:
- Document §3.4 — Spring Security 6 reference 명시 권고 = `permitAll` (HSTS/CSRF/security headers/HTTP firewall 보전)
- Case 토픽 1 — `WebSecurity#ignoring` 은 filter 자체 우회 — 보안 hole 위험
- Senior 영역 14 — Phase 6 신규 AP 등록 (AP-SECURITY-CONFIG-WEBSEC-IGNORING-001)

**Phase 4 갱신**:
- `output/rules/rules.json` BR-AUTH-PUBLIC-001 의 `source_evidence` 정밀화 — POST /users / POST /users/login 의 `WebSecurity#ignoring` (filter 자체 우회) 명시. Phase 6 AP candidate 표기.

---

## 4. 충돌 사항 — 없음

3 sub-agent 모두 합의. 메인 결론 채택.

---

## 5. 메인 결론

### 5.1 Phase 5 산출 작성 가능 (T+5 ~ T+12)

**전제 조건**:
- ✅ 1원칙 (plan-phase5.md) 완료
- ✅ 메인 사전 raw fetch 9회 (F-015 cross-validation) 완료
- ✅ 2원칙 — 3 sub-agent 산출 (4,449 line) 완료
- ✅ 통합 research-phase5.md (본 문서) 완료
- ⏳ **3원칙** — 윤주스 승인 대기

### 5.2 산출 작성 시 결정 항목 5건 (모두 합의)

| 결정 | 결과 | 인용 위치 |
|---|---|---|
| 1 | `apiKey + Authorization` (Bearer 아님) | openapi.yaml components.securitySchemes |
| 2 | Wrapper schema 분리 (3-tier 명명) | openapi.yaml components.schemas |
| 3 | F-027 De Morgan **3중 표기** (description + x-warning + x-known-bug) | openapi.yaml paths./articles/{slug}/comments/{commentId}.delete |
| 4 | LV-001 → api-extension.json `x-architectural-debt` | api-extension.json operations[] |
| 5 | 4 GET /articles 단일 operationId `GetArticles` + UC 4건 매핑 + `limit` cap 100 | openapi.yaml paths./articles.get |

### 5.3 신규 finding 등록 (윤주스 결정 대기 — 본 문서 §7)

7건 후보. 임계 25 → 32 도달.

### 5.4 Phase 6 신규 AP candidate (Senior 발굴 — 본 문서 §8)

6건. final 통합 시 등록. 12 AP 최종 예상.

### 5.5 v1.2.0 격상 묶음 G 추가 (본 문서 §9)

OpenAPI x-extension 표준 가이드 ADR-007 신설 후보.

---

## 6. 4단계 작성 인덱스 (T+0 ~ T+12)

각 단계 별 인용 파일/§. plan-phase5.md §8 시퀀스 그대로 적용.

| T+ | 작업 | 인용 자료 |
|---|---|---|
| T+0 | output/api/ 디렉토리 생성 | (없음) |
| T+1 | RestController 9건 raw fetch — 메인 사전 fetch 결과 재활용 | PROGRESS T+1 / `inputs/_manifest.yml` |
| T+2 | DTO/Model/ViewModel 추출 | senior-phase5.md §2 (Lombok 함정) / document-phase5.md §3 (Spring REST) |
| T+3 | SecurityConfiguration → security scheme + public endpoint 5개 | document-phase5.md §3.3-3.5 / case-phase5.md 토픽 6 / senior-phase5.md 영역 14 |
| T+4 | Postman collection raw fetch — ground truth cross-check | case-phase5.md 토픽 1 / 메인 사전 fetch |
| T+5 | **openapi.yaml v1 작성** | 본 문서 §2 stub 5건 + document-phase5.md §9.1~9.6 |
| T+6 | Spectral lint 검증 (manual fallback) | document-phase5.md §6 (30 룰 매트릭스) |
| T+7 | api-extension.json 작성 (operations[] x-related-* 매핑) | 본 문서 §2.4 stub + case-phase5.md 토픽 8 |
| T+8 | api.md 사람용 요약 (운영 시나리오 + warning 표 + F-027) | senior-phase5.md 영역 6 / 부록 B |
| T+9 | _manifest.yml 작성 (신뢰도 산정 v1) | plan-phase5.md §5.3 (raw confidence 0.92 예상) |
| T+10 | domain.json / rules.json UC pre-매핑 검증 + 갱신 | 본 문서 §3.1~3.3 |
| T+11 | findings/poc-findings.md 갱신 (F-034 ~ F-040 등록) | 본 문서 §7 |
| T+12 | PROGRESS-poc01-phase5.md 시간순 마감 | (없음) |

---

## 7. 신규 finding 등록 후보 (윤주스 결정 대기)

| ID | severity | 출처 | 설명 | 예상 처분 |
|---|---|---|---|---|
| **F-034** | medium | Document §3.5 / Case §1.2 / Senior 영역 14 | `sessionCreationPolicy(STATELESS)` 명시 부재 — Spring 5.x default IF_REQUIRED 와 JWT 의도 충돌 | promoted → v1.2.0 묶음 (Phase 1/SecurityConfig 명세 보강) |
| **F-035** | high | Senior 영역 14 / Case 토픽 1 | `GET /user` UC 매핑 갱신 — Phase 4 system_internal=true 오분류 | closed (Phase 5 갱신으로 즉시 종결) |
| **F-036** | low~medium | Document §3.4 / Case 토픽 1 / Senior 영역 14 | `WebSecurity#ignoring` vs `permitAll` 차이 — Phase 6 AP candidate | promoted → v1.2.0 묶음 + Phase 6 AP 등록 |
| **F-037** | low | Document §4.5 | JWT iss/aud/iat/jti 4 claim 부재 (RFC 7519 §4.1 권고 위반) | deferred → PoC #02 후 v1.2.0 합산 |
| **F-038** | medium | Senior 영역 9 | API 버저닝 부재 (`/api` only / `info.version` 부재) | promoted → v1.2.0 묶음 (deliverable 03 보강) |
| **F-039** | medium | Senior 영역 8 | WebSecurityConfigurerAdapter deprecated (Spring Security 5.7+) | deferred → 사내 코드만 영향 (PoC 분석에는 무영향) |
| **F-040** | medium | Senior 영역 10 | HTTP status code 일관성 (@ResponseStatus 부재 → default 200 일괄) | deferred → PoC #02 후 합산 |

**임계 영향**: 25 → 32 (F-021 임계 20+ 초과 — 윤주스 절대 우선순위 PoC #02 후 v1.2.0 합산 격상 유지).

**예상 분포**:
- closed: 9 → 10 (F-035)
- promoted: 7 → 10 (F-034 / F-036 / F-038)
- deferred: 9 → 12 (F-037 / F-039 / F-040)
- rejected: 0

---

## 8. Phase 6 신규 AP candidate (Senior 발굴 — final 통합 시 등록)

6건. Phase 4 partial 6 + Phase 5 6 = **12 AP 최종**.

| AP ID 후보 | severity | 출처 | finding link |
|---|---|---|---|
| AP-PERFORMANCE-001 | high | Senior 영역 5 | (Pageable / limit cap 부재 → DoS) |
| AP-SECURITY-CONFIG-IMPLICIT-001 | medium | Senior 영역 14 | F-034 |
| AP-SECURITY-CONFIG-WEBSEC-IGNORING-001 | medium | Senior 영역 14 / Document §3.4 | F-036 |
| AP-ARCH-DEPRECATED-001 | medium | Senior 영역 8 | F-039 |
| AP-API-VERSIONING-001 | medium | Senior 영역 9 | F-038 |
| AP-API-STATUS-INCONSISTENT-001 | low | Senior 영역 10 | F-040 |

→ Phase 6 final merge 시 antipatterns-partial.json (6 AP) + 본 candidate (6 AP) = antipatterns.json (12 AP 최종).

---

## 9. v1.2.0 격상 묶음 추가 (G)

| 묶음 | 내용 | 출처 finding |
|---|---|---|
| A | cross-validation (F-015) — Work Principles 2원칙 명세화 | 기존 |
| B | 정정 트레이스 (F-022 + F-024) | 기존 |
| C | severity 표준 (F-018) — phase-2-db.md §4.2 | 기존 |
| D | schema 진화 (F-025) — architecture.schema.json hybrid | 기존 |
| E | quality-extraction (Phase 4 신규) | 기존 |
| F | 신뢰도 공식 보강 (Phase 4 신규) | 기존 |
| **G (NEW)** | **OpenAPI x-extension 표준 가이드** — ADR-007 신설 | F-034 / F-036 / F-038 / Case 토픽 8 (GitHub `x-github` 패턴) |

→ 6 → **7 묶음**. PoC #02 후 v1.2.0 합산 격상 시 일괄 처리.

---

## 10. 사내 적용 시 즉시 수정 권고 (Senior 41 REC 통합)

Phase 5 산출 시 api.md / api-extension.json 의 `recommendations[]` 에 다음 통합:

### 10.1 critical 7개 (즉시 수정)

| REC ID | 영역 | 권고 |
|---|---|---|
| REC-AUTH-002 | Authorization | RFC 6750 Bearer 표준 마이그레이션 (사내 적용 시) |
| REC-DOS-001 | Pageable | `limit` `maximum: 100` cap 추가 (모든 list endpoint) |
| REC-DOS-002 | Pageable | `Pageable` parameter 의 size cap 명시 |
| REC-F027-001 | F-027 | description 표기 |
| REC-F027-002 | F-027 | x-warning + x-known-bug 표기 |
| REC-JWT-001 | JWT | SECRET 256bit (HS256) + 환경변수 분리 |
| REC-JWT-002 | JWT | Spring Security `OAuth2ResourceServerConfigurer.jwt()` 표준 마이그레이션 |

### 10.2 high 26개 / medium 8개

(senior-phase5.md 부록 B 참조)

---

## 11. 신뢰도 산정 (T+9 _manifest.yml 입력)

plan-phase5.md §5.3 의 0.92 예상치 검증:

```
base 0.75
+ orm_full          0.10    (Spring Data JPA + DTO 결정적 추출)
+ domain_context_md 0.03    (inputs/domain-context.md)
+ postman_or_api_test 0.05  (doc/Conduit.postman_collection.json — ground truth)
+ diagrams_other    0.02    (drawio 3개)
─ no_operational_db -0.03   (5.D 0건 + 5.B 부재)
─────────────────────────
raw confidence:     0.92
```

**3 sub-agent cross-validation 후 modifier**:
- F-015 적용 + 22 endpoint 100% 합의 → +0.02
- 잠재 불일치 3건 발견 + 즉시 처리 → -0.01 (Phase 4 갱신 필요)

→ **수정 raw confidence: 0.93**

영역 별:
- 엔드포인트 식별: 0.97 (어노테이션 결정적 + Postman cross-check)
- 요청/응답 스키마: 0.85 (DTO + Lombok)
- 에러 코드: 0.65 (Spring default 추정)
- 인증/권한: 0.92 (SecurityConfiguration raw fetch + F-034 보정)
- operationId ↔ UC 매핑: 0.90 (Phase 4 pre-매핑 + F-035 갱신)
- x-related-rules: 0.78 (rules.json 역매핑)

---

## 12. 다음 단계

1. ✅ 본 research-phase5.md 작성 완료 (T+4)
2. ⏳ **3원칙 — 윤주스 승인** (T+5) — 5 결정 + 신규 finding 7건 + v1.2.0 묶음 G + Phase 6 AP candidate 6
3. ⏳ 4단계 산출 (T+5 ~ T+12)

---

## 부록 A — 3 sub-agent 산출 인덱스

### document-phase5.md (1,232 line)
- §0 출처/메타 (17 URL)
- §1 핵심 결론 요약 TL;DR
- §2 OpenAPI 3.1 — 8 영역 정밀 인용
- §3 Spring REST + Security
- §4 JWT 표준 (RFC 7519/7515/8725)
- §5 Spring Pageable
- §6 spectral lint 30 룰 매트릭스 ★
- §7 잠재 불일치 3건 검증
- §8 Authorization 표준
- §9 직접 인용 stub 6건 ★

### case-phase5.md (1,261 line)
- §0 범위/한계
- 토픽 1 RealWorld 공식 spec ★★★
- 토픽 2 Netflix
- 토픽 3 Stripe
- 토픽 4 GitHub `x-github` 패턴 ★★★
- 토픽 5 한국 5사 (카카오 KakaoAK ★★)
- 토픽 6 Authorization 비표준 사례
- 토픽 7 Postman → OpenAPI 변환
- 토픽 8 API ↔ UC 매핑 패턴
- 직접 인용 stub 4건 ★

### senior-phase5.md (1,956 line)
- §0 메타/관점 (5축 평가 기준)
- 영역 1 OpenAPI 추출 함정
- 영역 2 Wrapped DTO 함정
- 영역 3 Authorization `Token` 함정
- 영역 4 Lombok DTO 함정
- 영역 5 Pageable DoS 함정 ★
- 영역 6 F-027 De Morgan 표기 함정 ★
- 영역 7 JWT 자체 구현 위험 ★
- 영역 8 WebSecurityConfigurerAdapter deprecated
- 영역 9 API 버저닝 함정
- 영역 10 HTTP status code 함정
- 영역 11 operationId 명명 함정
- 영역 12 WebSecurity#ignoring vs permitAll
- 영역 13 잠재 불일치 3건 평가
- 영역 14 5 핵심 결정 + critical/high 4건 노출 정책 ★
- 부록 A 5축 × 12 영역 평가 표
- 부록 B 41 REC 통합 표 ★
- 부록 C 출처 인용 정리

---

**END OF RESEARCH-PHASE5.md**
