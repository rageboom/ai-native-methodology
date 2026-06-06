# 산출물 #3: API 계약 (API Contract)

> **사상**: Contract-First (OpenAPI 3.1 산업 표준 그대로, 분석 메타는 별도 파일로 분리)
> **schema**: `schemas/openapi-extension.schema.json` · **표준**: OpenAPI 3.1
> **생성 phase**: `api` phase (`/analyze-api`)

---

## 1. 목적

**답하는 질문**: "이 시스템에서 무엇을 호출할 수 있는가? 입력/출력은?"

**AI 재구현 시 활용**: 계약 테스트 자동 생성 / FE-BE 인터페이스 매핑

---

## 2. 형식

```
output/api/
├── openapi.yaml                     # 표준 OpenAPI 3.1 (산업 표준 그대로)
├── api-extension.json               # AI 분석 메타 (operationId ↔ UC 매핑 등 / json 단독 SSOT)
└── (선택) swagger-ui-build/          # Swagger UI 정적 빌드
```

**핵심 결정 — 산업 표준 유지**:
OpenAPI 자체는 변형 없이 표준대로. 분석 메타는 `api-extension.json` 별도 파일. → 기존 OpenAPI 도구체인 (codegen, mock server) 그대로 사용 가능.

---

## 3. 추출 범위

### 3.1 추출 대상 (출처 / 방법 / 신뢰도)

| 항목 | 추출 출처 | 방법 | 신뢰도 |
|---|---|---|---|
| 엔드포인트 (path/method) | Controller/Router 어노테이션 (AST) | 결정적 | 0.95 |
| 요청/응답 스키마 | DTO 클래스 + ORM 매핑 | 결정적 + LLM | 0.85 |
| 에러 코드 | 예외 클래스 + 핸들러 매핑 | 결정적 + LLM | 0.70 |
| 인증/권한 | `@PreAuthorize`, security config | 결정적 + LLM | 0.75 |
| operationId | 메서드명 또는 LLM 생성 | 결정적 + LLM | 0.90 |
| operationId ↔ UC 매핑 | LLM 의미 매칭 | LLM | 0.65 |

**입력**: 소스 코드 + 프레임워크 어노테이션 (Spring `@RestController` / Express router / Nest `@Controller`)
**사람 검토 필수**: operationId ↔ UC 매핑

### 3.2 미추출 (의도적)

- API 사용 빈도, 응답시간 → NFR 영역
- 비즈니스 정책 description (긴 설명) → 비즈니스 규칙 산출물(#5) 로 분리

---

## 4. 책임 분담 — API 에 안 담기는 것

책임 분담 원칙. API 에는 **인터페이스 형식만**, 정책은 비즈니스 규칙으로:

```yaml
# ❌ 안 좋은 예 (API 에 정책 박힘)
post:
  description: |
    주문을 생성합니다. 주류는 19세 이상만 가능하고,
    재고 부족 시 거부되며, 5만원 이상은 무료배송이고...

# ✅ 좋은 예 (API 는 형식만, 정책은 분리)
post:
  operationId: createOrder
  responses:
    '201': { ... }
    '403':
      description: '권한/정책 거부'
      content:
        application/json:
          schema:
            example: { code: 'AGE_RESTRICTED' }
  x-related-rules: [BR-ORDER-007, BR-ORDER-008, BR-ORDER-009]
  x-related-use-cases: [UC-ORDER-001]
```

`x-related-rules`, `x-related-use-cases` 는 OpenAPI 확장 (`x-` prefix). 비즈니스 규칙 산출물에 자세히.

---

## 5. 검증 체크리스트

```
□ OpenAPI 3.1 lint 통과 (spectral 등)
□ 모든 operationId 가 unique
□ DTO 스키마가 JSON Schema 호환
□ 에러 응답 표준화 (4xx/5xx)
□ 인증/권한 명시 (security 섹션)
□ x-related-rules, x-related-use-cases 메타 있음
□ Swagger UI 렌더링 검증
```

---

## 6. 산출물 간 참조

| 방향 | 의미 |
|---|---|
| API → UC (도메인) | operationId 매칭 |
| API → RULES | x-related-rules |
| API → DOM | DTO 스키마 ↔ 엔티티 |
| EXT (5.D) → API | 외부 호출 인터페이스 |

---

## 7. 흔한 함정

### 7.1 description 에 정책 박기
- 증상: API description 에 비즈니스 규칙 줄줄이
- 대응: 정책은 BR-XXX 로 분리, API 는 `x-related-rules` 로 참조

### 7.2 표준 미준수
- 증상: REST 원칙 위반, HTTP 동사 잘못 사용
- 대응: AP-API-XXX 로 등록

### 7.3 Swagger annotation 부재
- 증상: Spring `@Operation` 등 없어서 추출 어려움
- 대응: LLM 이 메서드명/파라미터로 추론, 신뢰도↓ 표기

---

## 인용

- ADR: ADR-001 (Contract-First OpenAPI 3.1 표준 유지)
- ADR: ADR-002 (책임 분담 — API 형식 / 정책 분리)
- schema: `schemas/openapi-extension.schema.json`
- 표준: OpenAPI 3.1
