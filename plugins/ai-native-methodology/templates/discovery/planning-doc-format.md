# 기획서 입력 형식 — 설계 노트

> **STATUS**: **design notes** — 가치 경계 외부 (analysis stage only).
> 본 문서는 **미래 기획서 템플릿 툴** 요구사항 source. 활성 template / schema / skill 없음.
> 가치 경계 충돌 deferral 근거: `methodology-spec/lifecycle-contract.md` §가치 경계 충돌 deferral.

---

## 가치 명세

```
INPUT:  기획자가 작성한 기획서 (PRD / story / 도메인 정의)
USE:    analysis stage 의 7대 산출물 빈칸 채우기 / LLM 직접 소비
원칙:   "기획서 = 7대 산출물의 빈칸 버전"
```

planner 가 본 형식으로 입력하면 → analysis stage 진입 시 LLM 추론 비용 급감 / 환각 차단 / downstream phase 매끄러움.

---

## LLM 이해도 형식 우선순위

| 형식                         | LLM 이해도 | 사람 가독성 | 권장 위치                      |
| ---------------------------- | ---------- | ----------- | ------------------------------ |
| 마크다운 표 / decision table |            |             | **SSOT 권장**                  |
| JSON / YAML                  |            |             | downstream tool 입력           |
| 번호 step list               |            |             | flow / sequence                |
| 자연어 산문 (항목별 분리)    |            |             | why / NFR / 예외               |
| Mermaid / 다이어그램         |            |             | 사람 검토 보조 (SSOT ❌)       |
| 이미지 / PPT / wireframe     | ❌         |             | 사람 검토만 (별도 vision 필요) |

**Mermaid 한계**: 렌더링된 그림을 LLM 이 못 봄 (텍스트 토큰만 읽음) → 공간 정보 손실 + 토큰 낭비 + 노드 많을 때 trace 실패. 보조용만.

---

## 6 component 형식 (analysis stage 7대 산출물 매핑)

### C1. 비즈니스 규칙 → Decision Table

```markdown
| Rule ID | 조건                               | 결과     | 예외             |
| ------- | ---------------------------------- | -------- | ---------------- |
| BR-001  | 주문금액 ≥ 50,000                  | 무료배송 | 제주/도서 제외   |
| BR-002  | 회원등급 = VIP AND 결제수단 = 카드 | 5% 할인  | 할인쿠폰 중복 ❌ |
```

매핑: `rules.json` (BR-\* ID 컨벤션 정합) + 본 레포 `decision-table-validator` 호환 (DMN 5-check).

### C2. 도메인 엔티티 → 표 + 관계 명시

```markdown
## Entity: Order

| 속성    | 타입          | 제약          | 비고 |
| ------- | ------------- | ------------- | ---- |
| id      | UUID          | PK            |      |
| user_id | UUID          | FK→User       |      |
| total   | decimal(10,2) | NOT NULL, ≥ 0 |      |

## 관계

- Order ─ many → User (user_id)
- Order ─ has many → OrderItem
```

매핑: `domain.json` + `schema.json` 직접. ERD `.mermaid` 는 보조 (사람 검토용 / SSOT ❌).

### C3. API / 유스케이스 → input/output 표

```markdown
## UC-001: 주문 생성

- Actor: 로그인 사용자
- Input: { items: [{sku, qty}], shipping_address }
- Output (성공): { order_id, total, eta }
- Output (실패):
  - INSUFFICIENT_STOCK (재고 부족)
  - INVALID_ADDRESS (배송 불가 지역)
- 사전조건: 장바구니 비어있지 않음
- 사후조건: 재고 차감 / 결제 hold
```

매핑: `openapi.yaml` + `error-mapping-spec.schema.json`.

### C4. 화면 / 플로우 → 번호 step + 분기

```markdown
## Flow: 결제

1. 사용자가 [결제하기] 클릭
2. 시스템이 재고 재확인
   - 부족 → INSUFFICIENT_STOCK 표시 → step 1 복귀
3. PG 호출 (timeout 10s)
   - 성공 → step 4
   - 실패 → 재시도 버튼 노출 (max 3회)
4. 주문 확정 / 재고 차감
```

매핑: `state-map.json` (FE 동적 행동) + `openapi.yaml` (BE 호출 순서). 자연어 산문 ❌ / Mermaid sequence diagram 은 보조만.

### C5. 비기능 / 제약 / Why → 자연어 (항목별 분리)

```markdown
- 응답시간: 결제 API p95 < 500ms (PG 제외)
  - Why: 사용자 이탈률 분석 결과 500ms 초과 시 12% drop
- 데이터 보존: 주문 데이터 7년 (전자상거래법)
  - Why: 법적 의무 / 변경 시 법무팀 승인 필수
```

매핑: `migration-cautions.json` + `architecture.json`. **why 는 자연어가 우월** (구조화 못 함 / 의사결정 맥락 보존).

### C6. 회피 / 비범위 → 명시 list

```markdown
## 명시적 비범위 (Out of Scope)

- 다국어 (v2 carry)
- 정기 결제 (v2 carry)

## 회피 패턴 (이전 시스템 교훈)

- 세션 토큰 localStorage 저장 ❌ (XSS, 본 레포 AP-FE-SECURITY-001 4 PoC isomorphic)
- N+1 쿼리 발생 가능 구조 ❌
- 정수 → enum 매직 넘버 ❌ (AP-CFG-001 가능성)
```

매핑: `antipatterns.json` + `migration-cautions.json`. **본 레포 누적 antipattern 카탈로그 재활용** (4 PoC 누적 finding 카탈로그 → 기획 단계 회피 가이드 역제공).

---

## 7대 산출물 traceability

| 기획서 component  | analysis 산출물                             | schema                                                             | 우선순위 |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------ | -------- |
| C1 decision table | business-rules.json                         | `business-rules.schema.json`                                       |          |
| C2 entity table   | domain.json + schema.json                   | `domain.schema.json` + `db-schema.schema.json`                     |          |
| C3 use case       | openapi.yaml + error-mapping                | `openapi-extension.schema.json` + `error-mapping-spec.schema.json` |          |
| C4 flow           | state-map.json                              | `state-map.schema.json`                                            |          |
| C5 NFR / why      | migration-cautions.json + architecture.json | `architecture.schema.json`                                         |          |
| C6 비범위 / 회피  | antipatterns.json + migration-cautions.json | `antipatterns.schema.json`                                         |          |

---

## 절대 회피 형식

| 형식                          | 이유                                                |
| ----------------------------- | --------------------------------------------------- |
| PPT / 이미지 wireframe        | LLM vision 별도 비용 / 텍스트 추출 손실             |
| 긴 산문 한 덩어리             | ambiguity / 추출 비용 폭발 / decision boundary 흐림 |
| Mermaid SSOT                  | 토큰 낭비 / 노드 많을 때 trace 실패 (보조 OK)       |
| "~할 수도 있고 ~할 수도 있고" | 의사결정 미완 → AI 가 환각으로 메움                 |

**모호함 = 결정 미완**. "TBD" 명시 의무 (AI 환각 차단). TBD 토큰 카운트 = 기획서 성숙도 KPI 후보.

---

## 미래 템플릿 툴 요구사항 체크리스트

### 기능 (UI)

- [ ] 기획자가 6 component 빈칸 채우기 wizard
- [ ] decision table editor (조건/결과/예외 행 추가)
- [ ] entity table builder (속성 + FK 관계 시각화)
- [ ] use case input/output schema editor
- [ ] flow step + branch editor (sub-bullet 분기 자동화)
- [ ] NFR 자연어 input + **Why 분리 enforce** (Why 빈 채로 제출 차단)
- [ ] 비범위 + 회피 패턴 list editor

### 본 레포 자산 통합

- [ ] **antipattern 카탈로그 import** — 4 PoC 누적 AP-\* 카탈로그를 회피 가이드 옵션으로 제공
- [ ] BR-\* ID 컨벤션 자동 부여 (`id-conventions.md` 정합)
- [ ] schema 검증 (`schemas/` 13종 정합)

### Export

- [ ] export → analysis stage `.aimd/output/` 하위 7대 산출물 빈칸 매핑
- [ ] markdown SSOT + JSON downstream 이중 export
- [ ] Mermaid 보조 자동 렌더링 (사람 검토용 / SSOT ❌ 강제 표시)

### 품질 게이트

- [ ] **TBD 토큰 추적** (resolve 안 된 모호성 카운트 / 0 = 성숙)
- [ ] LLM 이해도 형식 검증 (회피 형식 사용 시 경고 — 산문 한 덩어리, 이미지 첨부 등)
- [ ] decision table DMN 5-check 사전 통과 (`decision-table-validator` 재활용)

---

## 인용

- 본 문서 = 미래 기획서 템플릿 툴 요구사항 source (design notes / 활성 template·schema·skill 없음).
- 변경 이력: `CHANGELOG.md` · `decisions/INDEX.md`
