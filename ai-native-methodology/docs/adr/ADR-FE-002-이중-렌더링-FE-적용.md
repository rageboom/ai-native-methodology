# ADR-FE-002: 이중 렌더링 사상 FE 적용 — AI 눈 + 사람 눈 + visual 예외

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-01
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001, ADR-008 (이중 렌더링 사상 — 모체), ADR-009 (다이어그램 신뢰 모델), ADR-FE-001 (FE 추출기 가정 — 짝), ADR-FE-005 (권위 매개체 12 채택), DEC-2026-05-01-v1.4-Stage-2-Gate-결단 (G1-3 schema 분리)

> **본 ADR 의 위치** — ADR-008 의 FE 영역 적용. ADR-FE-001 과 짝. ADR-008 = "AI 눈 + 사람 눈" 사상 / ADR-FE-002 = FE 영역의 정합 매트릭스 + ★ visual 예외.

---

## 1. 컨텍스트

ADR-008 (이중 렌더링 사상) = "단일 진실 + AI 눈 + 사람 눈". BE 영역에서:
- AI 눈 = `.json` / `.yaml` / `.schema.json`
- 사람 눈 = `.md` / `.mermaid`
- drift 자동 검증 (drift-validator) 으로 일치 강제 ✅

그러나 FE 영역 격상 시 **3가지 갭** 발생:

### 1.1 갭 1 — 5 진실 분산 (deliverable 8 state-map)

FE 의 비즈니스 로직 = **5 source of truth** 에 분산:

| # | source | 형태 |
|---|---|---|
| 1 | server cache | TanStack Query / SWR / Apollo Cache |
| 2 | client state | Zustand / Redux / Jotai / Recoil |
| 3 | URL state | router params / query string |
| 4 | form state | React Hook Form / Formik / native form |
| 5 | DOM state | input value / focus / scroll |

→ 단일 진실 사상 적용 시 **machine-readable 형식 = SCXML+XState** / **사람-readable = mermaid state-map**.

### 1.2 갭 2 — 시각 산출 binary 진실 (deliverable 9 visual-manifest)

사용자 요구 3 ("UI visible 차원") = "그림 자체" 가 진실. 그러나:
- AI 눈 형식 (JSON) 으로는 픽셀 표현 불가능
- 사람 눈 형식 (mermaid) 으로도 픽셀 표현 불가능
- → **★ 이중 렌더링 사상이 visual 영역에서는 불완전 적용**

ADR-008 의 단일 진실 = `.json` (AI) → `.mermaid` (사람) 두 형식 동시 산출. 그러나 visual = **binary (PNG)** 가 진실 → 별도 진실 모델 필요.

### 1.3 갭 3 — drift 자동 검증 적용 가능성 차이

| FE 산출물 | drift-validator 적용 | 진실 모델 |
|---|---|---|
| state-map.json ↔ state-map.mermaid | ✅ 적용 가능 (state element 일치) | JSON 진실 |
| component-tree.json ↔ component-tree.mermaid | ✅ 적용 가능 (node 일치) | JSON 진실 |
| user-flows.json ↔ user-flows.mermaid | ✅ 적용 가능 (transition 일치) | JSON 진실 |
| **visual-manifest.json ↔ snapshot.png** | ❌ 적용 불가 | **★ snapshot hash 진실** |

→ visual 영역은 drift-validator 대신 **snapshot diff (Playwright/Percy/Chromatic)** 가 진실 모델.

본 ADR = 위 3 갭의 사상 명세 격상.

---

## 2. 결정

**ADR-008 의 이중 렌더링 사상을 FE 영역에 적용. 단 visual 영역은 별도 진실 모델 (snapshot hash) 채택.**

### 2.1 핵심 명제 (3개)

```yaml
명제 1 (state 영역 — ADR-008 정합):
  AI 눈 = state-map.json (W3C SCXML 1.0 + XState 호환)
  사람 눈 = state-map.mermaid (state diagram)
  drift 자동 검증 = drift-validator FE 적용 ✅

명제 2 (UI 구조 영역 — ADR-008 정합):
  AI 눈 = ui-spec.json
  사람 눈 = component-tree.mermaid + user-flows.mermaid + scenarios.md + Storybook static
  drift 자동 검증 = drift-validator FE 적용 ✅ (component / flow)

명제 3 (visual 영역 — ★ ADR-008 예외 적용):
  진실 = snapshot PNG (binary)
  AI 눈 = visual-manifest.json (snapshot path + hash + viewport matrix + a11y inline)
  사람 눈 = (★ 별도 mermaid 산출 ❌) — Storybook static + GitHub PNG 직접 렌더가 사람 눈
  drift 자동 검증 = ★ drift-validator ❌ / Playwright snapshot diff ✅
```

### 2.2 ADR-008 영역별 적용 매트릭스 (FE 확장)

ADR-008 §3 의 매트릭스를 FE 영역으로 확장:

| 산출물 (v1.4 신규) | AI 눈 | 사람 눈 | 진실 | drift 검증 |
|---|---|---|---|---|
| **state-map** (deliverable 8) | state-map.json (SCXML) | state-map.mermaid | JSON | drift-validator ✅ |
| **visual-manifest** (deliverable 9) | visual-manifest.json | (Storybook + PNG 직접 렌더) | ★ snapshot hash | Playwright snapshot diff ✅ |
| **component-tree** (기존) | components[] in ui-spec.json | component-tree.mermaid | JSON | drift-validator ✅ |
| **user-flows** (기존) | user_flows[] in ui-spec.json | user-flows.mermaid | JSON | drift-validator ✅ |
| **design-tokens** (기존) | design-tokens.json (DTCG) | design-tokens.md | JSON | (drift-validator 적용 검토 — Stage 3-2) |
| **scenarios** (기존) | scenarios[] in ui-spec.json | scenarios.md | JSON | drift-validator (text 비교) |
| **pages** (기존) | pages[] in ui-spec.json | pages.md | JSON | drift-validator ✅ |

→ visual 만 ★ 예외. 다른 6 산출물은 ADR-008 정합 100%.

### 2.3 ★ visual 예외 명세 (snapshot hash 진실 모델)

```yaml
visual_truth_model:
  primary_truth: "snapshot PNG (binary)"
  hash_algorithm: "SHA-256"

  manifest_role: "binary 메타 + viewport matrix + a11y violations inline"
  manifest_NOT: "진실 / 진실의 일부 / 진실의 cache"

  diff_strategy:
    tool: ["playwright_real", "percy_real", "chromatic_real"]
    method: "pixel diff + threshold + region exclusion"
    NOT: "drift-validator (semantic comparison)"

  baseline_management:
    storage: "git-lfs 또는 별도 baseline branch"
    update: "사람 승인 후 baseline_hash 갱신"

  NO-simulation:
    captured_by enum:
      - playwright_real    # ★ 진짜 도구
      - percy_real
      - chromatic_real
      - simulation         # ★ -5%p 패널티 (DEC-static-tool-실행-의무화)
    simulation_reason: required if captured_by="simulation"
```

→ ADR-009 §2.2 도구 enum 갱신 의무 (Stage 3-1 Phase A4).

---

## 3. 사상 정합 — Knuth Literate Programming 의 FE 재해석

ADR-008 §학문적 계보 의 Knuth (1984) 인용:
> "concentrate rather on explaining to human beings what we want a computer to do."

FE 영역 적용:
- **state-map** = "5 진실 분산을 사람과 AI 모두에게 설명" (ADR-008 정합)
- **visual-manifest** = "그림 자체가 진실 / 메타는 그림을 사람과 AI 모두에게 설명" (★ Knuth 의 미해결 영역 — 픽셀은 텍스트로 설명 불가능)

→ visual 예외 = **Knuth Literate Programming 사상의 한계점**. 본 방법론은 이 한계를 명시하고 별도 진실 모델 (snapshot hash) 로 보강.

---

## 4. 결과 (Consequences)

### 4.1 좋은 점

- **ADR-008 사상 90% 재사용** — 6/7 산출물에서 이중 렌더링 정합. drift-validator FE 시범 (Stage 3-1 Phase E1) 의 사상 근거 확립.
- **★ visual 예외 사상 명시** — 사용자 요구 3 (UI visible) 정면 해소. snapshot hash 진실 모델 = 산업 사례 (Percy/Chromatic) 정합.
- **no-simulation 정책 강화** — `captured_by` enum 의 `simulation` -5%p 패널티 = ADR-009 §2.2 정합.

### 4.2 나쁜 점

- visual 영역 drift-validator 적용 ❌ → Stage 3-1 도구 시범 시 visual-manifest 검증 carry-over (Stage 4 mini-PoC Playwright 진짜 실행 의무).
- baseline 관리 비용 (git-lfs 또는 별도 branch) — 본 방법론 범위 밖 (사용자 책임).
- 5 진실 분산 (state-map) 의 SCXML 변환 비용 ↑ — 산업 사례 (XState) 의 SCXML import 도구 의존.

### 4.3 무시한 다른 옵션

- **visual 영역도 drift-validator 적용 시도** — 거부. 픽셀 비교는 semantic 비교가 아님 (ADR-008 §3.1 정합 깸).
- **visual-manifest 의 mermaid 산출 의무** — 거부. 픽셀 표현 불가능 → 의미 없는 산출 강제.
- **state-map 을 ADR-008 적용 ❌ 예외 처리** — 거부. SCXML+XState 변환 도구 (XState v5+ 의 SCXML import) 산업 표준 = 변환 비용 mitigated.

---

## 5. 적용 (Implementation)

### 5.1 schema 변경 (Stage 3-1 Phase B)

- `schemas/state-map.schema.json` 신설 — `cross_links[]` 필드 (ADR-008 정합)
- `schemas/visual-manifest.schema.json` 신설 — `captured_by` enum + simulation 패널티 명시 (★ 본 ADR §2.3)

### 5.2 deliverable 변경 (Stage 3-1 Phase C)

- `deliverables/8-state-map.md` §11 (산출물 간 참조) — ADR-008 + ADR-FE-002 인용 의무
- `deliverables/9-visual-manifest.md` §6 (no-simulation 정책 강제) — 본 ADR §2.3 인용 의무

### 5.3 workflow 변경 (Stage 3-1 Phase D)

- `phase-5-2-c-visual.md` — Playwright/axe-core 진짜 실행 절차 + simulation 패널티 명시

### 5.4 도구 시범 (Stage 3-1 Phase E)

- drift-validator FE = state-map / component-tree / user-flows 만 적용 ✅
- visual-manifest = drift-validator ❌ → Stage 4 mini-PoC Playwright 진짜 실행 검증

### 5.5 ADR-009 갱신 (Stage 3-1 Phase A4)

- §2.1 신뢰도 표 — FE 영역 행 추가 (state-map / visual-manifest 별도)
- §2.2 도구 enum — `playwright_real` / `axe_core_real` / `storybook_csf_real` / `msw_handler_check` 추가

---

## 6. 참조

### ADR
- ADR-001 (사상적 기반)
- ADR-008 (이중 렌더링 사상 — 모체)
- ADR-009 (다이어그램 신뢰 모델 — 짝)
- ADR-FE-001 (FE 추출기 가정 — 짝)
- ADR-FE-005 (권위 매개체 12 채택)

### DEC
- DEC-2026-04-29-이중-렌더링-사상-명시화 (ADR-008 모체)
- DEC-2026-04-29-static-tool-실행-의무화 (no-simulation 정책)
- DEC-2026-05-01-v1.4-Stage-2-Gate-결단 (G1-3 schema 분리 + cross-link)

### Memory
- `feedback_no_simulation_realized.md`
- `feedback_diagram_trust_model.md`

### Sources (research)
- ADR-008 §학문적 계보 (Knuth Literate Programming)
- W3C SCXML 1.0 (https://www.w3.org/TR/scxml/) — Stage 3-1 cross-check 1차 사료
- DTCG 2025.10 (https://www.designtokens.org/TR/2025.10/format/) — Stage 3-1 cross-check 1차 사료

**End of ADR-FE-002.**
