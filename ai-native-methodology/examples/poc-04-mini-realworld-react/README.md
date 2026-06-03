# PoC #04 mini — RealWorld React FSD (Stage 4 mini-PoC)

> v1.4.0-dev Stage 4 — RealWorld React fork 1주 fail-fast mini-PoC
> 분석 대상: [`yurisldk/realworld-react-fsd`](https://github.com/yurisldk/realworld-react-fsd) HEAD `963b303` (2026-04-25 push)
> 시작일: 2026-05-02

---

## 1. 목적

Stage 7-pre 까지 격상된 v1.4 본체 (FE ADR 6 + schema 12 + deliverable 15) 의 **fail-fast 1주 검증**.

종결 조건 (성공):

- 9 deliverable 중 mini scope 6+ 종 산출 1회
- 진짜 도구 ≥ 3종 (Playwright / axe-core / ts-morph) 실행
- IR 4계층 정합도 baseline 측정 ( Stage 5 ratchet)
- 신뢰도 0.75+
- finding ≤ 10
- 사상 위반 0

종결 조건 (실패 → Stage 3 revert):

- 사상 위반 (round-trip 시도 / framework-coupling IR / drift breaking ≠ 0)

---

## 2. 결단 변경 (research → 실행)

| 항목       | research                          | 실행                                                                       |
| ---------- | --------------------------------- | -------------------------------------------------------------------------- |
| fork 후보  | Erikvdv 1순위 (404 부재)          | **yurisldk/realworld-react-fsd** ( 527 stars / FSD / Zod / TanStack Query) |
| mini scope | 7/8/9/10/14/15 필수 + 11/12 carry | 7/8/9/10/14/15 필수 + 11 N/A (i18n 부재) + 12 부분 (grep + Semgrep carry)  |
| 외         | research 결단 동일                | —                                                                          |

---

## 3. 워크스페이스 구조

```
poc-04-mini-realworld-react/
├── INPUT/                    #  git clone --depth 1 (분석 대상 / 코드 수정 ❌)
├── analysis/
│   ├── 0-init/              # ✅ tree.md + inventory.json + stack-detection.md
│   ├── 5-2-a-ui-base/       # ⏳ ui-spec + component-tree
│   ├── 5-2-b-state/         # ⏳ state-map (SCXML+XState)
│   ├── 5-2-c-visual/        # ⏳ visual-manifest (Playwright)
│   └── 6-quality/           # ⏳ a11y / i18n / sec / form-val / type-spec
├── findings/                # F-FE-XXX (mini scope ≤ 10)
├── ir-4layer-matrix.md     # ⏳ ADR-FE-006 정합도
├── confidence-meta.yaml    # ⏳ 신뢰도 0.75+ 산출
└── README.md (본 문서)
```

---

## 4. 진행 상태

| Day    | 작업                                                            | 상태              |
| ------ | --------------------------------------------------------------- | ----------------- |
| **D1** | fork 결단 + 환경 + Phase 0 (tree / inventory / stack-detection) | ✅ **2026-05-02** |
| D2-3   | Phase 5-2-a (ui-base) + 5-2-b (state)                           | ⏳                |
| D3-4   | Phase 5-2-c (visual) + Phase 6 quality 6종                      | ⏳                |
| D5     | V1 (drift / formal-spec-link) + V2 (IR 4계층 매트릭스)          | ⏳                |
| D6     | Phase F 메타 (DEC + STATUS + INDEX + CHANGELOG + memory)        | ⏳                |
| D7     | 예비 (도구 환경 issue 흡수)                                     | —                 |

---

## 5. §8.1 정합 (memory `feedback_methodology_body_priority.md`)

> Stage 4 finding → **본체 격상 ❌ 절대**.

mini-PoC = 단일 분석 대상 1개 → 패턴 입증 ❌ / 사상 정합 1차 검증만 ✅. 본체 격상 = Stage 5 PoC #04 + adoption 트랙 합산 ≥ 2 PoC 일치 시점.

---

## 6. no-simulation 정책

- ✅ Phase 0 = 직접 read (file system + curl GitHub API) / 시뮬 0
- ⏳ Phase 5-2-c = Playwright 진짜 실행 의무
- ⏳ Phase 6 a11y = @axe-core/playwright 진짜 실행 의무
- ⏳ Phase 6 form-validation = openapi.yaml + Zod schema 직접 분석
- ⏳ Phase 6 type-spec = ts-morph 진짜 실행 의무
- ⏳ Phase 6 static-security = Semgrep carry (Windows 환경 부재 / 사용자 위임)

---

**End of README.**
