# DEC-2026-05-30-use-scenario-impl-slice1

**결단**: `C-use-scenario-taxonomy-impl` (DEC-2026-05-30-use-scenario-taxonomy §6) carry 의 **Slice 1 시행** — 시나리오 선언 plumbing(work-unit-manifest.scenario + chain-driver init --scenario) + scenario-aware gate matrix(gate-eval). taxonomy 의 원인 **F-DOGFOOD-007(brownfield RED 오관측) 구조 해소**. **greenfield 산출물 bootstrap 은 Slice 2 carry**. v11.9.0 MINOR.

**작성일**: 2026-05-30 (session 55차 — 사용자 "추천대로 해줘" / codegraph Slice 1 corroboration 직후).

**relates to**:
- `DEC-2026-05-30-use-scenario-taxonomy.md` §6 (carry 출처)
- `DEC-2026-05-30-fdogfood-003-intent-certainty.md` §3 (F-007 brownfield RED — RED enforcement 비파괴 유지 요구)
- `~/.claude/plans/cheeky-strolling-stearns.md` (Slice 1 설계 plan / 사용자 승인)

---

## 1. 배경

v11.7.0 = use-scenario taxonomy 형식화(설계 SSOT). codegraph Slice 1 corroboration 으로 실 prod 가치 입증 후 use-scenario impl 진입. **Slice 1 선정 이유**: taxonomy 의 *원인* = F-DOGFOOD-007 (gate-eval 이 시나리오 모른 채 test→all_fail 하드코딩 → brownfield 에서 RED 오관측). Slice 1 이 (a) 시나리오를 선언·전파하고 (b) gate 를 scenario-aware 로 만들어 F-007 을 구조적으로 닫음. greenfield 산출물 생성(사용자 1차 want)은 §8.1 ≥2 채널 필요한 더 큰 작업 → Slice 2.

## 2. 시행 (additive / breaking 0)

| 영역 | 변경 |
|---|---|
| `schemas/work-unit-manifest.schema.json` | top-level optional `scenario` enum `[S1,S2,S3,greenfield]` (scope manifest only / required ❌ / additionalProperties:false 정합). |
| `tools/chain-driver/src/work-unit.js` | `SCENARIOS` const + `createScopeManifest(scope, scenario)` optional param(invalid → throw) + `renderManifestMd` Scenario 줄. |
| `tools/chain-driver/src/state-store.js` | `ensureScopeDir(root, scope, scenario)` passthrough. |
| `tools/chain-driver/src/cli.js` | `init --scenario` flag(parseArgs + usage) + cmdInit ensureScopeDir 전달 + cmdNext 가 manifest.scenario 읽어 evaluateGate 전달. |
| `tools/chain-driver/src/gate-eval.js` | `evaluateGate(stage, findings, scenario='S1')` + `SCENARIO_EXPECTED` 매트릭스. |
| `tools/chain-driver/test/scenario.test.js` | 신규 14 test (plumbing + schema enum + gate matrix). |

### 2.1 SCENARIO_EXPECTED 매트릭스
- **S1(재생성) / greenfield(신규)** = forward: test=all_fail(RED / "생성될 코드 부재" — F-007 교정: RED 대상=생성될 코드, legacy 아님) → implement=all_pass(GREEN).
- **S3(특성화/문서화만)** = snapshot: test RED 강제 ❌ (기존 동작 snapshot GREEN / S3 mis-gate 수정).
- **S2(AX전환)** = Slice 1 = S1 fallback (characterization GREEN + augmentation RED 분리 enforcement = Slice 3 carry / test-intent labeling 필요). **정직 표기**.

### 2.2 backward-compat (무회귀)
scenario 미지정 → manifest 부재 → `evaluateGate` default 'S1' → 기존 동작 동일. 기존 PoC manifest 무영향. 6/6 e2e + gate-eval/state-store test 무회귀 확인.

## 3. Slice 2+ deferral
- `C-use-scenario-greenfield-bootstrap` — greenfield 산출물 생성 (analysis-from-* 재사용 orchestration + `.aimd/<scope>/planning/`→`.aimd/output/` elevation + legacy-only 산출물 N/A + lifecycle-contract greenfield 경로 명문화). §8.1 ≥2 greenfield 입력 채널(swagger + figma/PRD) corroboration 의무. = 사용자 1차 want.
- `C-use-scenario-s2-gate` — S2 characterization GREEN + augmentation RED 분리 enforcement (test-impl-pass-validator 확장 / test-intent labeling).

## 4. STOP-3
- workspace test 804 → **818 (+14)** ✅ (chain-driver scenario.test 14 / 기존 무회귀)
- release-readiness **22/22 ready** ✅
- skill-citation **0 stale**
- version 3-way **11.9.0**
- breaking **0** (scenario optional / gate default 'S1' / 기존 동작 보존) = MINOR

## 5. Lessons Learned

### LL-usc-impl-01 — taxonomy 의 "원인 finding" 부터 닫는 슬라이싱
큰 taxonomy 구현을 슬라이스할 때, 그 taxonomy 를 *촉발한 finding*(F-DOGFOOD-007)을 먼저 닫는 슬라이스가 자연스러운 1순위 — 가치가 명확하고(원인 해소) 토대(manifest.scenario)를 동시에 놓는다. greenfield(사용자 1차 want)는 §8.1 채널 필요로 분리.

### LL-usc-impl-02 — gate critical-path 변경은 default-fallback 으로 무회귀
gate-eval(체인 critical path)에 scenario 분기 추가 시, `scenario='S1'` default + `|| SCENARIO_EXPECTED.S1` fallback 으로 기존 호출자(2-arg) 무영향. data-driven 매트릭스라 if/else 분기 폭발 없이 S2/S3/greenfield 확장.

## 6. carry
- `C-use-scenario-greenfield-bootstrap` (Slice 2) + `C-use-scenario-s2-gate` (Slice 3) — §3.
- `C-use-scenario-runtime-corroboration` — manifest.scenario + gate matrix 를 실 PoC chain 에서 ≥2 사용 (현 = 단위 test / 실 chain 사용 누적 시 자격 강화).

## 7. 한 줄 결론
> use-scenario impl Slice 1 = 시나리오 선언 plumbing(manifest.scenario + init --scenario) + scenario-aware gate matrix(S1/greenfield forward / S3 snapshot mis-gate 수정 / S2 fallback) = F-DOGFOOD-007 구조 해소. backward-compat S1 default. greenfield bootstrap=Slice 2. v11.9.0 MINOR / 818 test / 22/22.
