# research-v14-stage-4-mini-poc

> v1.4.0-dev Stage 4 (mini-PoC — RealWorld React fork 1주 fail-fast) 3 에이전트 research 종합
> 4원칙 2번 산출
> 일자: 2026-05-01
> Trigger: plan-v14-stage-4-mini-poc.md §1.2 — research 후 사용자 승인 게이트 입력

---

## 0. research 패턴

- 가벼운 sub-agent 전략 (memory `feedback_lightweight_sub_agent.md`) — Case 생략 / 시간 cap 15분 / 우선순위 read.
- 3 에이전트 병렬 (공식문서 / 산업 사례 / Senior).
- 각 에이전트 9 질문 / 답변 200~400자.
- ★ 시뮬레이션 ❌ / 추측 ❌ / 출처 URL 의무.

---

## 1. 3 에이전트 합의 (★★★)

### 1.1 진짜 도구 3종 의무 (Windows 환경 충족 가능)

| 도구 | Windows 환경 | 1주 setup 비용 | 합의도 |
|---|---|---|---|
| **Playwright** | ✅ native 지원 | 0.5일 (browser download) | ★ 3/3 의무 합의 |
| **@axe-core/playwright** | ✅ npm install | 즉시 | ★ 3/3 의무 합의 |
| **ts-morph** | ✅ npm install | 0.5일 (AST 학습) | ★ 3/3 의무 합의 |
| Semgrep | ❌ WSL/Docker 필요 | 1일 | ★ 3/3 carry 합의 |
| ICU MF / @formatjs | ✅ npm install | 즉시 | ★ 3/3 권장 (carry 가능) |

### 1.2 zod-to-json-schema = 사실상 표준 (form-validation IR)

- 공식: Zod 정적 추출 공식 도구 부재 / `zod-to-json-schema` 다운로드 주간 200만+ (산업).
- ★ 합의: deliverable 14 form-validation-spec 산출 시 zod-to-json-schema 우선 / ts-morph AST 보조.

### 1.3 SCXML ↔ XState 공식 호환 부재 (★ 위험 발견)

- 공식: `@xstate/scxml` 패키지가 XState v5 에서 제거. Stately Studio 도 SCXML export 공식 불보장.
- 산업: XState v5 SCXML export 베타.
- Senior: state-map.json = XState 단일 진실 + SCXML 호환 subset (states/transitions/events/guards) 별도 export / round-trip 보장 ❌ 명시 의무.
- ★ ADR-FE-005 매개체 13 중 SCXML+XState 의 호환 명시 보강 필요 (★ Stage 5 carry).

### 1.4 React 컴포넌트 → 8 deliverable IR 자동 추출 = industry-first

- 공식: react-docgen + ts-morph 수준 / 직접 도구 부재.
- 산업: Storybook CSF + react-docgen 가 가장 근접. **"React 컴포넌트 → 7대 산출물 IR 추출" 직접 산업 사례 부재**.
- Senior: 본 방법론이 industry-first 영역 — Stage 4 = fail 가능성 실재 (★ Stage 4 의의).

---

## 2. ★ 핵심 충돌 / 결단 입력

### 2.1 fork 후보 (★ 결단 의무)

| # | 후보 | 공식 | 산업 | Senior | 종합 |
|---|---|---|---|---|---|
| **A1** | `Erikvdv/realworldreactaddtypescript` | TS 충족 / Vite 미적용 가능성 / RHF/Zod 미사용 가능성 | ★ stale | 1순위 (사상 정합 ts-morph 가능) | ★ 1순위 — package.json 직접 확인 의무 |
| **A2** | `khaledosman/react-redux-realworld-example-app` | JS (TS 아님) / Redux | 인기 fork | 2순위 (redux idiom 누출 위험) | ★ 2순위 carry |
| **A3** | `Sebastian-Nielsen/full-realworld-example-app` (산업 추천) | (확인 필요) | Vite+React 18+TS 최신 1.5k+ stars | (보류) | ★ 검토 후보 |
| **A4** | ★ **`alan2207/bulletproof-react`** | (RealWorld 아님) | ★★ Vite+TS+RHF+Zod+TanStack Query / 26k stars / **사내 FE 스택 100% 일치** (memory `project_adoption_workspace.md`) | (보류 — RealWorld scope 외) | ★★★ **★ adoption 트랙 우선 후보** |

**충돌**:
- 산업 = Bulletproof React 가 사내 스택 일치 + Zod/RHF 충족 → 가장 강력. 단 RealWorld 아님.
- Stage 2 G3-2 결단 = "**RealWorld FE only**" 명시 — Bulletproof = adoption 트랙 (v1.4 release 후 별도).
- ★ ★ Senior = Erikvdv 1순위 (단 확인 의무) — 사상 정합 우선.

**결단 입력**:
- ★ Stage 2 G3-2 정합 = Erikvdv 1순위 / Sebastian-Nielsen 2순위 검토 / Bulletproof = adoption 트랙 carry.
- Stage 4 plan §2.1 후보 표 갱신 의무 (A2 = Erikvdv 1순위 / A3 = Sebastian-Nielsen 추가).

### 2.2 mini scope 8 deliverable 우선순위 (★ 결단 의무)

★ Senior 권고 + 본 방법론 deliverable 번호 매핑:

| Deliverable | Senior 권고 | 진짜 도구 의존 | 본 권고 |
|---|---|---|---|
| 7 ui-ux (PAGE/SCN/CMP) | ★ 필수 | 수동 + ts-morph 보조 | ★ 필수 |
| 8 state-map (SCXML+XState) | ★ 필수 | 수동 (1 컴포넌트) | ★ 필수 |
| 9 visual-manifest | ★ 필수 | Playwright | ★ 필수 |
| 10 a11y-spec | carry 가능 (axe raw 만) | axe-core 진짜 실행 | ★ 필수 (★ no-simulation 의무 입증) |
| 11 i18n-spec | carry (i18n key 부재 시 N/A) | ICU MF | carry (★ fork 가 i18n 미사용 시 N/A 명시) |
| 12 static-security-spec | carry (Windows Semgrep 부재) | Semgrep | carry (★ 환경 부재 → 사용자 위임 명시) |
| 14 form-validation-spec | ★ 필수 (BR 자동 등록 1회 입증) | zod-to-json-schema + ts-morph | ★ 필수 |
| 15 type-spec | ★ 필수 (framework_neutrality_score) | ts-morph | ★ 필수 |

→ ★ **필수 6** (7/8/9/10/14/15) + carry 가능 2 (11/12).

### 2.3 react_idiom_count baseline vs ratchet (★ 결단 의무)

★ Senior 권고: **Stage 4 = baseline 측정 / Stage 5 = ratchet (ADR-010 패턴)**.

근거:
- 공식: 본 방법론 선례 부재 (90% 임계 baseline 무근거).
- 산업: react-docgen + ts-morph AST grep 가능성 입증.
- ★ Senior = Stage 4 종결 조건 "react_idiom_count = 0" 임계는 Stage 5 ratchet 후 정식화 권고.

**결단 입력**:
- plan.md §1.2 종결 조건 갱신 — "react_idiom_count = 0" → ★ "react_idiom_count = baseline 측정 / Stage 5 ratchet 정식화".
- IR 4계층 정합도 90% 임계 → ★ "baseline 측정 / Stage 5 ratchet".

자동 grep 대상 9 키워드 (ts-morph AST):
- `useState`, `useEffect`, `useContext`, `useReducer`, `useMemo`, `useCallback`, `props.children`, `React.FC`, `JSX.Element`

### 2.4 revert vs carry 결단 기준 (★ 결단 의무)

★ Senior 권고:

**revert 의무 임계 (★ 4원칙 4번 발동)**:
1. react_idiom_count > 0 **in IR 산출물** (deliverable 7/8/15 — 분석 코드 자체는 idiom 허용)
2. drift-validator breaking change ≠ 0 (도구 한계 finding 등록 후 해결 안 됨 시)
3. round-trip 검증 시도 흔적 발견 (DEC-2026-04-29-round-trip-스코프-아웃 정면 위반)

**carry 가능 임계 (★ STATUS.md 명시 후 Stage 5)**:
1. framework_neutrality_score 80~89% (90% 미달이지만 baseline 단계)
2. finding 11~19 (★ §8.1 정합 — 5~15 건강 / 20+ 결함 임계)

**결단 입력**:
- revert 결단은 LLM 단독 ❌ → ★ 사용자 승인 의무 (Work Principle 3원칙).
- carry 결단도 STATUS.md 명시 + Stage 5 합산 검토.

---

## 3. ★ 1주 cadence 권고 (산업 + Senior 합의)

### 3.1 cadence 갱신 (산업 ThoughtWorks Spike + Google Design Sprint 정합)

| Day | 작업 (산업 권고) | Senior 위험 |
|---|---|---|
| **D1** | 환경 (Playwright / axe / ts-morph install) + fork clone + package.json 직접 확인 (★ Erikvdv vs Sebastian-Nielsen 결단) | 환경만 0.5~1일 소진 |
| **D2-3** | 8 deliverable 산출 (자동 추출 우선 / 수동 보조) | 산출 부담 16시간 |
| **D4** | 진짜 외부 도구 실행 + IR 4계층 매트릭스 | ★ no-simulation 의무 검증 |
| **D5** | gap 분석 + finding ≤ 15 + meta | finding 16+ → ★ Stage 5 carry |
| **D6** | Phase F 메타 (DEC + STATUS + INDEX + CHANGELOG + memory + commit) | |
| **D7** | 예비일 (도구 환경 issue 흡수) | cap 초과 시 revert vs 연장 사용자 결단 |

### 3.2 1주 cap 초과 위험 — Senior 권고

★ Senior: cap 초과 = ★ **사상 위반 신호** — 연장보다 revert 우선 검토.

**완화 우선순위**:
1. ★ §8.1 정합 finding 16+ 즉시 산출 중단
2. carry 우선순위 = 11 i18n / 12 static-security
3. 1주 cap 초과 시 ★ Stage 5 진입 ❌ / Stage 4 연장 vs revert 사용자 결단 의뢰

---

## 4. ★ Stage 5 진입 자격 (Senior 권고 우선순위)

★ Senior 결단:

| # | 자격 | 임계 | 미달 시 결단 |
|---|---|---|---|
| **1 (절대)** | 사상 정합 (round-trip ❌ / framework-neutral / 이중 렌더링) | 위반 0 | ★ revert 의무 (carry 불가) |
| **2** | IR 4계층 정합도 | 90% (baseline) | carry 가능 (Stage 5 ratchet) |
| **3** | 진짜 도구 3종 실행 | Playwright + axe + ts-morph | carry 가능 (-5%p 패널티) |
| **4** | finding | ≤ 10 (mini scope) | 11~19 carry / 20+ revert 검토 |
| **5** | 신뢰도 | 0.75+ | 0.70~0.74 carry / 0.69 이하 revert |

**결단 룰**:
- 사상(1) 미달 = ★ revert 의무 (절대).
- 2~5 carry 시 STATUS.md 명시 의무. **carry 항목 ≥ 3 = Stage 5 진입 ❌**.

---

## 5. ★ §8.1 정합 (모든 에이전트 합의)

★ **단일 PoC 과적합 회피 강제**:
- Stage 4 = 단일 분석 대상 1개 (RealWorld React fork) → ★ 패턴 입증 ❌ / 사상 정합 1차 검증만.
- ★ Stage 4 finding → **본체 격상 ❌ 절대** (memory `feedback_methodology_body_priority.md`).
- Stage 4 finding 등록 위치 — `examples/poc-04-mini/` 산출물 + STATUS.md 휘발성 누적만.
- 본체 격상 = Stage 5 PoC #04 + adoption 트랙 합산 ≥ 2 PoC 패턴 일치 시점.

---

## 6. ★ 핵심 위험 (3 에이전트 종합)

| # | 위험 | 출처 | 영향 | 완화 |
|---|---|---|---|---|
| **R1** | RealWorld fork 후보가 Vite+RHF+Zod 동시 충족 부재 | 공식 | 중 | ★ Day 1 package.json 직접 확인 + Sebastian-Nielsen 검토 + fork+자체 마이그레이션 1~2일 budget |
| **R2** | Semgrep Windows 미지원 | Senior | 중 | carry + 사용자 위임 명시 (CLAUDE.md no-simulation 정합) |
| **R3** | SCXML ↔ XState 공식 호환 부재 | 공식 + 산업 | 중 | XState 단일 진실 + SCXML 호환 subset 별도 export + round-trip 불보장 명시 |
| **R4** | React 컴포넌트 → 8 deliverable IR 자동 추출 = industry-first | 산업 | 고 | ★ Stage 4 fail 가능성 실재 / 사상 정합 1차 검증만 / Stage 5 + adoption 합산 |
| **R5** | mini-PoC 1주 cap 초과 | Senior | 고 | finding 16+ 즉시 중단 / cap 초과 = 사상 위반 신호 / revert 우선 검토 |
| **R6** | Stage 4 finding 본체 격상 충동 | Senior | 고 | ★ §8.1 정합 강제 / 본체 격상 ❌ 절대 / Stage 5 합산 후 격상 |

---

## 7. ★ 사용자 승인 게이트 (3원칙) 입력 — 5 핵심 결정

★ Senior 권고 5건을 사용자에게 일괄 승인 요청 의무:

### G1. fork 후보 결단

```
A. Erikvdv 1순위 + Sebastian-Nielsen 2순위 검토 + Day 1 package.json 직접 확인
B. Sebastian-Nielsen 1순위 (Vite+React18+TS 최신)
C. Bulletproof React (★ 사내 스택 일치 — 단 RealWorld 외 → adoption 트랙 carry)
```

★ Senior 권고: **A** (Stage 2 G3-2 RealWorld only 정합).

### G2. mini scope 8 deliverable 우선순위 결단

```
A. 필수 6 (7/8/9/10/14/15) + carry 가능 2 (11/12) — Senior 권고
B. 필수 5 (7/8/9/14/15) + carry 가능 3 (10/11/12) — a11y carry 허용
C. 모두 8 종 의무 (carry 0) — 1주 cap 초과 위험 ↑
```

★ Senior 권고: **A** (★ no-simulation 의무 — axe 진짜 실행).

### G3. react_idiom_count 임계 결단

```
A. Stage 4 = baseline 측정 / Stage 5 = ratchet (ADR-010 패턴) — Senior 권고
B. Stage 4 = react_idiom_count = 0 의무 (★ 사상 위반 시 즉시 revert)
```

★ Senior 권고: **A** (선례 부재 baseline 우선).

### G4. revert vs carry 결단 기준 결단

```
A. revert 의무 3 (Q6 답변) + carry 가능 2 — Senior 권고 / 사용자 승인 의무
B. revert 결단 LLM 단독 가능 (Auto Mode 정합)
```

★ Senior 권고: **A** (revert 결단 = 사용자 승인 의무 — 4원칙 4번 신중 적용).

### G5. Stage 5 진입 자격 결단

```
A. 5 자격 우선순위 = 사상 > IR > 도구 > finding > 신뢰도 (Senior 권고)
   - 사상 미달 = revert 의무
   - 2~5 carry ≤ 2 = Stage 5 진입 / carry ≥ 3 = Stage 5 진입 ❌
B. 5 자격 모두 의무 (carry 0) — Stage 5 자격 strict
```

★ Senior 권고: **A** (현실적 carry 허용 / 사상 정합 절대 비협상).

---

## 8. 종결 진술

> 본 research = v1.4.0-dev Stage 4 mini-PoC 4원칙 2번 산출.
> 3 에이전트 합의 (진짜 도구 3종 / SCXML 호환 부재 / industry-first 위험) + 충돌 (fork 후보 / mini scope / 임계) 결단 입력 5건 추출.
> ★ Senior 권고 우선 (본 방법론 사상 정합 강함).
> 다음 trigger = 사용자 일괄 승인 (3원칙 G1~G5) → Phase 0 즉시 진입.

**End of research-v14-stage-4-mini-poc.**
