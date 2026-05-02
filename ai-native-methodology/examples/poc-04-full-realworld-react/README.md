# PoC #04 full — RealWorld React (Stage 5 본격 PoC)

> v1.4.0-dev Stage 5 본격 PoC #04 — 4-6 sprint
> 분석 대상: [`yurisldk/realworld-react-fsd`](https://github.com/yurisldk/realworld-react-fsd) HEAD `963b303` (★ Stage 4 mini-PoC 와 동일 fork / ★ 산출물 재사용 ❌ / 새 IR 신설)
> 시작일: 2026-05-02

---

## 1. ★ G1 결단 (★ research B strict + R1 위험 처리)

### 1.1 R1 위험 발생 + D 옵션 채택

★ research G1 = "B (새 RealWorld i18n fork strict)" 채택 직후 ★ R1 위험 발생 — GitHub 직접 검색 시 **RealWorld + i18n 활성 fork = 0 hit**:
- `realworld+react+typescript+i18n` → 0 hit
- `conduit+react+i18n` → 0 hit
- `realworld+react+lingui` → 0 hit
- `realworld+react+i18next` → 0 hit
- 3/3 research 합의 (공식 + 산업 + Senior) "RealWorld + i18n 활성 fork 부재"

→ ★ D 옵션 채택 (★ Senior strict 유지 + i18n carry 명시 + Stage 7 release note carry-over 명시).

### 1.2 fork 재해석

★ Senior Q1 strict 정밀 재해석: "재선정 시 ★ i18n + TanStack Query + Zustand + Zod 4종 동시 충족 fork" — 4 PoC 중 ★ i18n 만 부재 시 carry 명시 + 다른 3종 충족 fork 인정 가능.

| 후보 | i18n | TanStack Query | Zustand | Zod | 평가 |
|---|---|---|---|---|---|
| **yurisldk/realworld-react-fsd** | ❌ carry | ✅ 5.90 | ❌ (자체 패턴) | ✅ 4.3 | ★ 3/4 충족 (★ ★ 본 PoC 채택) |
| jiheon788/react-query-realworld | TBD | ✅ | ❌ | ❌ | React 18 / Stage 4 React 19 회귀 |
| Bulletproof React | ✅ | ✅ | ❌ | ✅ | RealWorld 외 → adoption 트랙 carry |

→ ★ ★ **yurisldk 재선정 + 산출물 재사용 ❌ (analysis/ 새 신설) + i18n carry 명시**.

### 1.3 Stage 5 의무 deliverable 갱신

★ research G3 = Senior 권고 5 sprint + Sprint 5-6 carry / 12 의무 → ★ ★ ★ **11 의무 + 1 carry (i18n)**:

| # | deliverable | Stage 5 |
|---|---|---|
| 1 | architecture | ✅ 의무 |
| 2 | domain | △ 부분 (FE entity) |
| 3 | api | ✅ 의무 |
| 5 | rules | ✅ 의무 (★ form-validation 통합) |
| 6 | antipatterns | ✅ 의무 (★ cross-PoC isomorphic AP-FE-* 정식) |
| 7 | ui-ux | ✅ ★ 본격 (전체 page) |
| 8 | state-map | ✅ ★ 본격 (전체 component) |
| 9 | visual-manifest | ✅ ★ 본격 (전체 page × 4 viewport) |
| 10 | a11y-spec | ✅ ★ 본격 (전체 page) |
| **11** | **i18n-spec** | ★ ★ ★ **carry (★ Stage 7 release note 명시)** |
| 12 | static-security-spec | ✅ ★ 의무 (★ Semgrep Docker 진짜 실행) |
| 14 | form-validation-spec | ✅ ★ 본격 (URL params 신규 패턴 정식) |
| 15 | type-spec | ✅ ★ 본격 (ratchet 정식화) |

---

## 2. ★ Stage 4 mini-PoC vs Stage 5 본격 비교

| 항목 | Stage 4 mini | Stage 5 full |
|---|---|---|
| 대상 | yurisldk (동일) | yurisldk (동일 코드 / 새 분석) |
| Cap | 1주 fail-fast | ★ 4-6 sprint × 2주 = 8-12주 |
| Scope | 3 page (Login + Home + Article) | ★ 전체 page (8) + 전체 component |
| Sprint | Day 1~6 | Sprint 5-1~5-5 + Sprint 5-6 carry |
| 진짜 도구 | 3종 (ts-morph + Playwright + axe) | ★ 5종+ (★ + Semgrep + ICU MF) |
| 신뢰도 | 0.85 | ★ 0.90+ target |
| Finding | 4 (모두 candidate) | ★ 5~15 건강 / 16+ 결함 의심 |
| 본체 격상 | 0건 (★ §8.1 strict) | ★ patterns ≥ 3 시 격상 결단 |
| Stage 4 산출물 재사용 | — | ★ ★ ❌ (★ Senior strict / 새 IR 신설) |

---

## 3. 워크스페이스 구조

```
poc-04-full-realworld-react/
├── INPUT/                    # ★ git clone --depth 1 (★ Stage 4 와 동일 HEAD 963b303)
├── analysis/
│   ├── 0-init/              # ⏳ Sprint 5-1 산출
│   ├── 1-architecture/      # ⏳ Sprint 5-3
│   ├── 5-1-api/             # ⏳ Sprint 5-2
│   ├── 5-2-a-ui-base/       # ⏳ Sprint 5-2
│   ├── 5-2-b-state/         # ⏳ Sprint 5-2
│   ├── 5-2-c-visual/        # ⏳ Sprint 5-3
│   └── 6-quality/           # ⏳ Sprint 5-3
├── findings/                # F-FE-* (Stage 5 신설 / Stage 4 finding 별도 carry)
├── _tools/                  # ⏳ ts-morph + Playwright + axe + Semgrep + ICU MF + Ajv
├── ir-4layer-matrix.md     # ⏳ Sprint 5-4 (★ ratchet 0.95+ target)
├── confidence-meta.yaml    # ⏳ Sprint 5-5 (★ 0.90+ target)
└── README.md (본 문서)
```

---

## 4. ★ research 권고 6건 일괄 채택 (★ Senior strict)

| G | 결단 | 구현 |
|---|---|---|
| G1 | B strict + D 옵션 (★ i18n carry) | ★ 본 README 적용 |
| G2 | B (Sprint 5-3 본체 도구 격상 / patterns ≥ 2 확인 후) | Sprint 5-3 진입 시 |
| G3 | C (5 sprint + Sprint 5-6 carry) | Sprint 5-1~5-5 + 5-6 carry |
| G4 | B (cross-PoC patterns ≥ 3 strict) | Sprint 5-3 cross-PoC 평가 |
| G5 | A (사용자 승인 묶음 5건) | Sprint 종결 마다 게이트 |
| G6 | C (Sprint 5-6 carry / 0.85 회귀 시만 revert) | Sprint 5-5 종결 시 평가 |

---

## 5. ★ no-simulation 정책 단계 5 target

★ Stage 4 단계 4 → Stage 5 단계 5 target:
- ✅ ts-morph 24 (Stage 4 검증 / Stage 5 본격 적용)
- ✅ Playwright + Chromium (★ 4 viewport 의무 — ADR-FE-002)
- ✅ @axe-core/playwright 4.10 (★ 전체 page WCAG 2.2 AA)
- ✅ ★ Semgrep CLI Docker (★ Sprint 5-3 진짜 실행 의무)
- ✅ ★ Ajv 8 + ajv-formats (★ schema validator 신설 / Sprint 5-3)
- △ ICU MF (★ i18n carry — i18n-spec 부재 / N/A)

→ 진짜 도구 ≥ 5종 의무 (★ Stage 5 자격 #3).

---

## 6. ★ §8.1 정합 strict (★ 본체 격상 정책)

★ Stage 5 본체 격상 임계 = ★ patterns ≥ 3 strict (★ G4 결단):
- JWT localStorage XSS = ★ ★ PoC #01/02/04-mini = 3 patterns 도달 → ★ Stage 5 4 patterns 시 ★ AP-SECURITY-001-FE 본체 격상 결단 시점
- URL params validation = 1 patterns → candidate (adoption 추가 시 격상)
- drift-validator FE 도구 한계 = Q2 본체 도구 격상 (Sprint 5-3) → F-FE-004 closed
- html-has-lang a11y = 1 patterns → candidate

---

**End of README.**
