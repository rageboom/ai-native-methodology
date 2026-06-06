# ADR-FE-006: 프레임워크 중립 IR 사상 — Screen+Journey 우선 / JSX 트리 IR 금지

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-01
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001 (사상적 기반), ADR-008 (이중 렌더링 사상), ADR-FE-001 (FE 추출기 가정 — 짝), ADR-FE-002 (이중 렌더링 FE 적용), ADR-FE-004 (BE/FE 분리 운영 — 짝), ADR-FE-005 (권위 매개체 12), DEC-2026-04-29-round-trip-스코프-아웃, **외부 LLM 검증 (2026-05-01) — IR 4계층 권고**

> **본 ADR 의 위치** — v1.4 FE 트랙의 **횡단 사상 2** (ADR-FE-004 = 운영 분리 / ADR-FE-006 = IR 형식 중립). 외부 LLM 검증 (2026-05-01 사용자 제시 — IR 4계층 권고) 의 사상적 빈틈 (#3/#4/#5) 통합 해소.

---

## 1. 컨텍스트

본 방법론 v1.4 의 "코드 → 형식 명세 + 위험 기록 한 방향 추출기" 사상 (DEC-round-trip-스코프-아웃 + ADR-FE-001 명제 1) 은 **추출 산출물의 framework 중립성** 을 암묵적으로 가정. 그러나 **명시적 ADR 부재**.

### 1.1 외부 LLM 검증 (2026-05-01 사용자 제시)

다른 LLM 의 권고:

> "목표 스택 미정 → 스펙은 **프레임워크 중립적**이어야 함. React 관용구(JSX, 훅 패턴)에 종속된 IR은 금물."
>
> ❌ 나쁜 IR: useState, useEffect, props.onClick, JSX 트리
> ✅ 좋은 IR: "이 화면은 X 데이터를 표시하고, Y 이벤트가 발생하면 Z 상태로 전이한다"
>
> "**컴포넌트 단위가 아니라 '화면(Screen) + 사용자 여정(Journey)' 단위로 IR을 구성**해야 합니다. 컴포넌트 분해는 새 스택이 정해진 후에 그 스택의 관용구로 다시 하면 됩니다."
>
> IR 4계층:
>
> - L1 Domain (엔티티 / 비즈니스 규칙 / 검증)
> - L2 Interaction (화면별 시나리오 / 상태 머신)
> - L3 Contract (API / 라우팅 / 외부 의존성)
> - L4 Presentation (레이아웃 / 시각 baseline)

### 1.2 본 방법론과의 매핑

| 다른 LLM        | 본 방법론                                                                                                      | 정합                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| L1 Domain       | BE deliverable 2 (domain) + 5 (rules) + Stage 3-2 fe_validation/authorization/a11y/i18n + 12 (static-security) | ✅ 80% (Zod / .d.ts 추출 절차 미명시) |
| L2 Interaction  | deliverable 7.scenarios + deliverable 8 state-map (SCXML+XState)                                               | 100%                                  |
| L3 Contract     | ui-spec.pages.route + api_calls + MSW+OAS (ADR-FE-005 #4)                                                      | 100%                                  |
| L4 Presentation | ui-spec.components + deliverable 9 visual-manifest (binary 진실)                                               | 100%                                  |

**프레임워크 중립 원칙 정합도**:

| 원칙                                 | 본 방법론                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| ❌ JSX 트리 IR                       | ✅ component-tree.mermaid = "의미적 구조 트리" / JSX ❌                               |
| ❌ useState / useEffect / onClick IR | ✅ state-map = SCXML+XState (framework-neutral) / event_handlers.event = generic name |
| ✅ Screen + Journey 단위             | ✅ deliverable 7.pages (PAGE-XXX) + scenarios (SCN-XXX)                               |
| ✅ XState JSON / SCXML               | ✅ ADR-FE-005 #2 채택                                                                 |

→ **본 방법론은 외부 LLM 권고 정합도 90%+ 이미 도달**. 단 **명시적 ADR 부재** 가 빈틈.

### 1.3 빈틈 5건 (외부 LLM 검증)

| #   | 빈틈                                      | 본 ADR 처리                                |
| --- | ----------------------------------------- | ------------------------------------------ |
| 1   | Zod / Yup / RHF rules → BR 자동 추출 절차 | ❌ Stage 7-pre carry (별도 deliverable)    |
| 2   | TypeScript .d.ts 산출 절차                | ❌ Stage 7-pre carry (별도 deliverable 14) |
| 3   | "프레임워크 중립 IR" 사상 명시화          | ✅ **본 ADR 핵심**                         |
| 4   | component 분해 framework-coupling 위험    | ✅ 본 ADR §3 + deliverable 7 §6 보강       |
| 5   | Screen+Journey 우선 / Component 후순위    | ✅ 본 ADR §2.2 + deliverable 7 §6 보강     |

→ 본 ADR = 빈틈 #3/#4/#5 통합 해소. #1/#2 = Stage 7-pre carry.

---

## 2. 결정

**프레임워크 중립 IR 사상을 본 방법론의 사상적 기반으로 공식 명시화.**

### 2.1 핵심 명제 (3개)

```yaml
명제 1 (프레임워크 중립 IR 의무):
  본 방법론의 모든 추출 산출물 (deliverable 1~13) =
    목표 스택 미정 가정 — IR 자체는 framework-neutral 의무
    ❌ React 관용구 (JSX 트리 / useState / useEffect / props.onClick) 직접 IR ❌
    ❌ Vue 관용구 (template / ref / setup / v-model) 직접 IR ❌
    ❌ Angular 관용구 (decorator / RxJS Observable / DI) 직접 IR ❌
    ✅ 권위 매개체 12 (ADR-FE-005) 정합 — SCXML / XState / DTCG / .d.ts / OpenAPI 등 산업 표준

명제 2 (Screen + Journey 우선 / Component 분해 후순위):
  IR 우선 단위 = Screen (PAGE-XXX) + Journey (SCN-XXX)
  Component 분해 (CMP-XXX) = 보조 산출물 / framework-coupling 위험 인지 의무
  → 사람이 신규 시스템 구축 시:
    - Screen + Journey + state-map = 즉시 활용 가능 (framework-neutral)
    - Component-tree = 참고용 / 새 스택 정해진 후 재분해 의무

명제 3 (4계층 IR 매핑 정식):
  L1 Domain      = deliverable 2 (domain) + 5 (rules) + 10 (a11y) + 11 (i18n) + 12 (static-security)
  L2 Interaction = deliverable 7.scenarios + 8 (state-map)
  L3 Contract    = deliverable 3 (api) + ui-spec.pages.route + api_calls
  L4 Presentation = ui-spec.components (보조) + deliverable 9 (visual-manifest)
```

### 2.2 IR 4계층 정식 매트릭스 (외부 LLM 권고 정합)

| 계층                | 본 방법론 산출물                                                        | framework 중립성                                                           | 매개체 (ADR-FE-005)                        |
| ------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| **L1 Domain**       | domain.json + rules.json + a11y-spec / i18n-spec / static-security-spec | 100% (DDD-Lite + ICU + WCAG + axe-core JSON)                               | DTCG / WCAG / WAI-ARIA / ICU MF / axe-core |
| **L2 Interaction**  | ui-spec.scenarios + state-map.json (SCXML+XState)                       | 100% (W3C SCXML 1.0 = framework-neutral spec)                              | SCXML / XState                             |
| **L3 Contract**     | openapi.yaml + ui-spec.pages.route + api_calls + msw handler            | 100% (OpenAPI 3.1 = framework-neutral spec)                                | OpenAPI 3.1 + MSW + Pact v4                |
| **L4 Presentation** | ui-spec.components + design-tokens.json + visual-manifest.json          | 95% (component-tree 보조 / DTCG + Playwright snapshot = framework-neutral) | DTCG / Playwright / CEM / Storybook CSF v3 |

→ component-tree (L4) = framework-coupling 위험 ↑ → 보조 산출물 / 신규 스택 결정 후 재분해 의무 (명제 2 정합).

### 2.3 컴포넌트 분해의 framework-coupling 위험 (빈틈 #4 해소)

본 방법론은 ADR-FE-001 §FSD + Atomic Design 채택. 그러나 **component 분해 자체가 framework-coupling 을 유발**:

| 분해 패턴                   | framework 정합                  | framework 중립성                                             |
| --------------------------- | ------------------------------- | ------------------------------------------------------------ |
| Atomic (Brad Frost)         | React / Vue / Angular 모두 적용 | 90% (분류 어휘는 중립 / 단 atom/molecule 경계는 분해자 주관) |
| FSD (Feature-Sliced Design) | React 진영 산업 표준            | 80% (feature/entity/shared 경계는 React 패턴 정합 ↑)         |
| Custom Elements (CEM)       | Web Components (vanilla)        | 95% (Web standard)                                           |

**결론**:

- ✅ component-tree 산출 자체는 유지 (이식성 )
- ✅ 단 "컴포넌트 분해는 새 스택 정해진 후 재분해" 권고 의무 (deliverable 7 §6 보강)
- ✅ Screen + Journey + state-map = framework-neutral 우선 산출 (Component = 보조)

---

## 3. 사상 정합 — ADR 누적 매트릭스

본 ADR 은 본 방법론의 사상 누적과 짝:

| ADR                                                      | 사상                                   | 본 ADR 과의 관계                                                                |
| -------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| ADR-001 (Schema-First / Contract-First / DDD-Lite / FSD) | 4 사상 stack                           | Schema-First / Contract-First 가 framework-neutral IR 사상의 모체               |
| ADR-008 (이중 렌더링 사상)                               | AI 눈 + 사람 눈                        | "단일 진실 → 이중 렌더링" = framework 도 "단일 진실 → 다중 framework" 동일 사상 |
| ADR-FE-001 (FE 추출기 가정)                              | 한 방향 추출 / spectrum Tier 1~4       | "한 방향 추출" = round-trip ❌ = framework-neutral IR 의 자연스러운 결론        |
| ADR-FE-002 (이중 렌더링 FE 적용)                         | AI 눈 + 사람 눈 + visual 예외          | binary 진실 (snapshot PNG) 자체가 framework-neutral                             |
| ADR-FE-004 (BE/FE 분리 운영)                             | 3 Scenario                             | Scenario A 분리 → framework-neutral IR 의무 강 / B 통합 → IR 자체는 여전히 중립 |
| ADR-FE-005 (권위 매개체 12)                              | SCXML / DTCG / OpenAPI / Playwright 등 | 12 매개체 모두 산업 표준 spec = framework-neutral 보장                          |
| ADR-FE-006 (본)                                          | framework 중립 IR                      | 위 모든 ADR 의 사상적 종합 / 외부 LLM 검증 직접 대응                            |

→ ADR-FE-006 = 본 방법론 사상 stack 의 명시적 종결.

---

## 4. 결과 (Consequences)

### 4.1 좋은 점

- **외부 LLM 검증 정면 대응** — IR 4계층 권고 매핑 명시 + 빈틈 #3/#4/#5 해소.
- **사용자 사내 환경 정합** — React (Tier 1) 분석 후 신규 스택 (Vue / Solid / Astro) 으로 이식 가능.
- **사상 stack 종결** — ADR-001/008/FE-001/002/004/005 의 사상적 기둥을 본 ADR 로 통합.
- **Component 분해 위험 인지 명시** — deliverable 7 §6 보강 + Screen+Journey 우선 명시.

### 4.2 나쁜 점

- Component-tree 산출이 보조로 강등 = 일부 사용자 (FE 개발자) 불만 가능 → "보조 / 신규 스택 정해진 후 재분해" 명시로 완화.
- 명제 1 (framework 관용구 IR 금지) = 검증 자동화 어려움 → Stage 5+ drift-validator FE 패턴 검증 도구 carry.
- L1 의 #1 (Zod/Yup/RHF) + #2 (.d.ts) 산출 = Stage 7-pre carry → 본 ADR 사상은 명시 / 절차는 carry.

### 4.3 무시한 다른 옵션

- **React 관용구 IR 채택** — 거부. 사용자 "목표 스택 미정" 진단 + framework-neutral 사상 깸.
- **L1~L4 모두 deliverable 신설** — 거부. 기존 deliverable (1~13) 이 이미 매핑 가능 / 매트릭스 명시로 충분.
- **Component-tree 산출 폐지** — 거부. 이식성 (CLAUDE.md 가치 명세) 정합 — 보조 산출물로 유지 + 위험 명시 권고.

---

## 5. 적용 (Implementation)

### 5.1 본 Stage 6

- `methodology-spec/deliverables/7-ui-ux.md` §6 보강 — component 분해 framework-coupling 위험 명시 + Screen+Journey 우선 명시
- `methodology-spec/be-fe-separation.md` 신설 — Scenario × IR 4계층 매트릭스 inline

### 5.2 carry-over → resolved (Stage 7-pre 종결 / 2026-05-01)

**Stage 7-pre 종결로 carry 해소**:

- 빈틈 #1 (Zod / Yup / RHF rules → BR 자동 추출) → deliverable 14 (form-validation-spec) 신설 / form-validation-spec.schema.json + ADR-FE-005 §2.1.1 Zod 매개체 13 추가 / rules.schema source_format enum + auto_extracted boolean 추가
- 빈틈 #2 (TypeScript .d.ts 산출 절차) → deliverable 15 (type-spec) 신설 / type-spec.schema.json + framework_neutrality_score 정량 metric

→ 외부 LLM 검증 빈틈 5/5 = 100% 해소.

DEC-2026-05-01-v1.4-Stage-7-pre-종결 참조.

### 5.3 Stage 4 mini-PoC 검증

- Stage 4 mini-PoC 시 IR 4계층 매트릭스 정합도 검증 의무
- 추출 IR 에 React 관용구 (useState / useEffect / props) 잔존 여부 finding 등록

---

## 6. 참조

### ADR

- ADR-001 (사상적 기반)
- ADR-008 (이중 렌더링 사상)
- ADR-FE-001 (FE 추출기 가정 — 짝)
- ADR-FE-002 (이중 렌더링 FE 적용)
- ADR-FE-004 (BE/FE 분리 운영 — 짝)
- ADR-FE-005 (권위 매개체 12)

### DEC

- DEC-2026-04-29-round-trip-스코프-아웃 (한 방향 추출 사상 모체)
- DEC-2026-05-01-v1.4-Stage-3-2-종결

### Sources (외부 LLM 검증 — 2026-05-01)

- 사용자 제시 IR 4계층 권고 (다른 LLM)
- 본 ADR 작성 시 cross-validation = 본 방법론 ADR-FE-001/002/005 + deliverable 7~13 자료와 매핑 검증

### Memory

- `project_v140_fe_track.md`
- `feedback_methodology_body_priority.md`

**End of ADR-FE-006.**
