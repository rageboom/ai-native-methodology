# 산출물 #15: Type Spec (v1.4 Stage 7-pre 신설 — TypeScript .d.ts 추출)

> **사상**: ADR-FE-005 매개체 #6 (TypeScript .d.ts) 산출 절차 정식 + ADR-FE-006 (L1 Domain framework-neutral IR) + 외부 LLM 검증 빈틈 #2 해소
> **schema**: `schemas/type-spec.schema.json`
> **생성 phase**: `business-logic` phase (`/analyze-business-logic` 의 sub) 또는 `ui` phase 5-2-a 의 sub

---

## 1. 목적

**답하는 질문**: "TypeScript 타입 정의는? framework-neutral 하게 추출 가능한가?"

**AI 재구현 시 활용**: 타입 정의 framework-neutral 형식으로 추출 → 신규 스택 (Vue / Solid / Astro) 이식 시 직접 입력

### 1.1 framework-neutrality_score (핵심 metric)

ADR-FE-006 정합 — TS 타입 자체가 framework-neutral 인지 정량:

- **1.0** = React import / Vue setup / Angular decorator 직접 참조 ❌ → 신규 스택 즉시 활용
- **0.0** = `React.FC<Props>` / `@types/react` 직접 참조 → 신규 스택 정해진 후 재추출 의무

→ Stage 4 mini-PoC + Stage 5 본격 PoC 에서 정량 검증 의무.

---

## 2. 형식

```
output/type-spec/
├── type-spec.json              # AI 눈
├── types.d.ts                  # 사람 눈 — 통합 .d.ts (재추출 의무)
├── framework-coupling-list.md  # framework_coupling_score > 0 타입 목록
└── _manifest.yml
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                                    | 출처                                    | 도구               | 신뢰도 (단계 5) |
| --------------------------------------- | --------------------------------------- | ------------------ | --------------- |
| types (interface / type / enum / class) | TS 소스                                 | ts-morph / typedoc | 90-95%          |
| declaration (.d.ts 형식)                | tsc --emitDeclarationOnly 또는 ts-morph | 결정적             | 95%             |
| domain_entity_id cross-link             | LLM + name 매칭                         | LLM                | 70%             |
| framework_coupling_score                | import 그래프                           | 결정적             | 95%             |
| framework_coupling_reasons              | enum (8종)                              | 결정적 + LLM       | 90%             |

**입력**: TS 소스
**scope 한정**: 기본값 = exported_only=true (private internal type 제외 / 비대 회피)
**no-simulation 정책**: simulation 시 -5%p 패널티

### 3.1 미추출 (의도적)

- runtime type info (Zod schema 같은 runtime 검증) — deliverable 14 (form-validation-spec) 영역
- type narrowing 경로 (control flow) — 정적 분석 한계
- generic instantiation 시점 type — TS compiler 영역

---

## 4. framework-neutrality 평가

```yaml
framework_coupling_reasons enum (8종):
  - react_fc_import # import { FC } from 'react'
  - react_node_import # import { ReactNode } from 'react'
  - react_props_pattern # interface Props { children: ReactNode }
  - vue_setup_helper # defineProps / defineEmits macro
  - vue_defineProps_macro # Vue 3 SFC macro
  - angular_decorator # @Component / @Input
  - angular_observable # Observable<T>
  - rxjs_import # import { ... } from 'rxjs'
```

**예시**:

```typescript
// ❌ framework_coupling_score = 0.8
import { FC } from 'react';
interface UserCardProps {
  user: User;
  onClick: (id: string) => void;
}
const UserCard: FC<UserCardProps> = ...

// ✅ framework_coupling_score = 0.0 (framework-neutral)
interface User {
  id: string;
  email: string;
  name: string;
}
interface UserCardEvents {
  onClick: (id: string) => void;
}
```

→ Props 패턴은 framework-coupled / Entity / Event 분리 추출 권장.

---

## 5. cross-link

```yaml
cross_links:
  - { to_artifact: domain, link_type: represents_entity } # E-XXX 매핑 (L1 Domain 정합)
  - { to_artifact: rules, link_type: constrains_field } # BR field type 제약
  - { to_artifact: state-map, link_type: constrains_state } # state 진실 type
  - { to_artifact: form-validation-spec, link_type: matches_zod_schema } # Zod ↔ TS 정합
  - { to_artifact: api, link_type: matches_openapi_schema } # OpenAPI 3.1 schema ↔ TS
  - { to_artifact: ui-spec, link_type: props_of_component } # 컴포넌트 props
```

---

## 6. 신뢰도 (ADR-009 §2.4 정합)

| 단계 | 조건                                      | 신뢰도 |
| ---- | ----------------------------------------- | ------ |
| 1    | LLM 추론                                  | 60-70% |
| 3    | + ts-morph 정적 분석                      | 78-85% |
| 5    | + ts-morph / typedoc 진짜 실행 + 5종 물증 | 90-95% |

---

## 7. 검증 체크리스트

```
□ schema 검증 통과
□ scope.exported_only 명시 (default true 권장)
□ 모든 type 에 id / name / kind / source_file 명시
□ framework_coupling_score 명시 (0.0~1.0)
□ framework_coupling_score > 0 시 framework_coupling_reasons enum 명시
□ domain_entity_id cross-link (E-XXX 매칭 시)
□ summary.framework_neutrality_score 정량 (핵심 metric)
□ summary.framework_coupled_count > 0 시 신규 스택 재추출 권장 표기
□ summary.captured_by ∈ [ts_morph_real, tsc_real, typedoc_real]
□ simulation 시 simulation_reason 의무
□ real 도구 시 5종 물증
```

---

## 8. 산출물 간 참조

| 방향        | 의미                                        |
| ----------- | ------------------------------------------- |
| TS → Domain | represents_entity (L1 Domain 핵심)          |
| TS → Rules  | constrains_field (BR ↔ TS field type 정합)  |
| TS → SM     | constrains_state                            |
| TS → FV     | matches_zod_schema (Zod `z.infer<>` 정합)   |
| TS → API    | matches_openapi_schema                      |
| TS → UI     | props_of_component (framework-coupled 위험) |

---

## 9. 흔한 함정

### 9.1 React.FC props 의존

- 증상: `const X: FC<Props>` 패턴 / framework_coupling_score=0.8+
- 대응: Entity / Event 분리 추출 + props_of_component cross-link 보조

### 9.2 @types/react 직접 import

- 증상: `import { ReactNode } from 'react'` 가 entity 타입에 침투
- 대응: framework_coupling_reasons=react_node_import 등록

### 9.3 generic over-use

- 증상: `T extends Record<string, unknown>` 같이 generic 남발 / 신뢰도 ↓
- 대응: generic_params 명시 + 단순화 가능 case finding 등록

### 9.4 namespace pollution

- 증상: `namespace Foo { ... }` 안에 모든 타입 packing / 분해 어려움
- 대응: 개별 type 추출 + namespace 메타만 보존

### 9.5 implicit any

- 증상: `tsconfig.json strict=false` / type 추출 신뢰도 ↓
- 대응: AP-FE-TYPE-IMPLICIT-ANY 자동 등록 + tsconfig strict=true 권장

### 9.6 framework_coupling 누락

- 증상: `React.FC<Props>` 추출 시 framework_coupling_score=0 표기
- 대응: schema if/then 강제 (Stage 5+ drift-validator 검증 검토)
