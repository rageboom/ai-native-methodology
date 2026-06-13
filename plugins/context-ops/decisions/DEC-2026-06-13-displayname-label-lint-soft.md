# DEC-2026-06-13 — code @DisplayName ↔ test-spec 라벨 정합 lint (SOFT / opt-in) + canonical 라벨 grammar 문서화

- **일자**: 2026-06-13 (본체 MINOR v0.44.0 / additive · SOFT · opt-in — 기존 동작·exit-code·gate 무변경)
- **카테고리**: 본체 기능 추가 (test-stage 검증 / dogfood-found gap) — 코드 라벨 ↔ 산출물 SSOT 정합 결정론 검사
- **상태**: 승인·시행 (사용자[TF Lead] AskUserQuestion "문법문서 + SOFT 확장 (권장)" / 4원칙 3)
- **관련**: 연구 패널 `wf_40ab04b1-fda` (4원칙 §2 = official-docs + industry-cases + senior + 기존자산감사) · `DEC-2026-06-12-unit-layer-hard-flip`(SOFT→HARD ratchet 선례) · `DEC-2026-05-30-s2-exec-corroboration`(TC-id-in-name 규약 모) · memory `feedback_chain_driver_deterministic_axis`·`feedback_diagnose_before_design_check_existing`·`feedback_self_recorded_fact_validation`·`feedback_quality_priority`

---

## 1. 배경 (dogfood 노출 갭)

ep-be-gea characterization 테스트의 `@DisplayName` BR/AC/TC 토큰이 test-spec SSOT 와 drift(golf 6 / event 13 / resv 5 / cal·2 resv clean) + **날조 BR id**(BR-RESVGOLF-DUR-001·FEE-001 = 비실재). 기존 검증기 어느 것도 코드 라벨을 안 봄: `spec-test-link-validator`=JSON↔JSON, `test-impl-pass-validator`=runner XML 출력만, `code-pointer-validator`=ast_symbol warn-only. → in-code 추적 라벨은 **무방비**.

## 2. 연구 패널 + diagnose-before-design

- 수렴(3/4 build): already_covered=NO / @DisplayName=free-text(표준 검증도구 0 = 커스텀 유일경로) / 업계 선례(OpenFastTrace orphaned-ID·JetBrains TMS·ArchUnit·Reqflow) / 결정론 feasible.
- **Senior 교정**: ① join 은 라벨 아닌 구조 anchor(code_pointers.symbol) 권장 ② §8.1 단일 datapoint = SOFT only(HARD 는 ≥2 distinct 도메인) ③ @DisplayName=Java-only → body 하드게이트 ❌(per-framework extractor) ④ 신규 도구 ❌ → spec-test-link-validator 확장.
- **deep-study 반증(중요)**: 실 golf test-spec 에서 `code_pointers`·`class_ref` = **0/25 미populated** → code_pointers join 불가. source_evidence(free-text `Main$Nested (real JUnit)`)의 **클래스/메서드명**(라벨 아님 = 안정)으로 best-effort join. → **결정론 lint 의 실제 범위 = 구조적 subset** 으로 정직 한정.

## 3. 결정 (구현)

`spec-test-link-validator` 에 **opt-in `--test-source <root>` SOFT 모드** + sibling export `validateCodeLabelConsistency` 추가(validateMockSoundness 선례). 검사(결정론 / LLM 판단 0 / STRONG-STOP 준수):
- **A. 날조 id**: 라벨 BR ∉ business-rules → `code_label.br_fabricated`(critical) / AC ∉ acceptance → `ac_unknown`(high) / TC ∉ test-spec → `tc_unknown`(high).
- **B. join mismatch**: source_evidence/code_pointers 의 class·method 명으로 그 @DisplayName 의 TC/AC 토큰을 해당 TC.id/ac_ref 와 대조 → `tc_join_mismatch`·`ac_join_mismatch`(high). anchor 없으면 `join_anchor_absent` **정직 skip**(오탐 ❌).
- **C. intra-label**: 한 @DisplayName 이 AC+TC 동시 보유 시 라벨 AC == 라벨-TC 의 spec ac_ref → `ac_tc_mismatch`(high).
- short(`AC-007`)↔full(`AC-<scope>-007`) 정규화. Java/JUnit5 extractor 만(TS/React carry / non-Java skip).

**SOFT 보장 메커니즘**: cli 가 결과를 **별도 키 `result.code_label_consistency`** 로만 attach — `result.findings`/`summary` 병합 ❌ → exit-code(critical|high 차단) + aggregator `transformGeneric`(summary.high) + gate #4 **무영향** = 진짜 advisory. `--test-source` 부재 시 기존 JSON-only 동작 **100% 불변**. REQUIRED-validator map(aggregator·gate-eval) **무변경** → gate·release-readiness count coupling 회피.

**canonical 라벨 grammar 문서화**: `skills/test-generate-test-spec/SKILL.md` TC-id-in-name 규약 확장 — `(BR-<full> / AC-<id> / TC-<id>)` 정규문법 + 일관성 3조건(TC=구현 TC / AC=ac_ref / BR=실재) + class_ref·code_pointers populate 권장.

## 4. §8.1 ratchet (SOFT only / 과적합 회피)

golf/event/resv = **단일 마스킹 Java 프로젝트 = 1 datapoint**(3 도메인 아님). unit-층 SOFT→HARD flip 은 3 distinct 도메인(S2 Java + S2 TS + greenfield JS) 요구 선례. → 본 lint 은 **SOFT/advisory 시작**. HARD flip(result.findings 병합 + gate #4 차단)은 ≥2 distinct 도메인(이상적으로 non-Java extractor 동반) corroboration 후 별도 DEC.

## 5. 검증 (실측)

- `spec-test-link-validator` **19 tests pass**(신규 code-label 8: clean / 날조BR critical / TC join mismatch high / unknown AC high / join_anchor_absent skip / non-Java carry / normalize / extract).
- **실 dogfood**: 수정된 golf 에 `--test-source` 실행 = **0 findings**(라벨 수정 정합 독립 확인) / checked 6 / skipped 19(carry TC = join_anchor_absent 정직 skip / 오탐 0).
- release-readiness **42/42**(신 check 무 → criteria_total 무변 / 신규 8 test 는 workspace-test #11 에 포함).

## 6. carry / 비범위

- ~~TS/React extractor~~ → **v0.45.0 해소 (§7)**.
- HARD flip (≥2 distinct 도메인 후).
- codegen(@DisplayName 자동생성 = drift class 근절) — harness-internal 경계 / human-authored legacy 미해결 → 별도.
- class_ref·code_pointers 강제(현 권장) — populate 시 join 검사 강화.
- "실재 id·오의미" drift(event 식) = 의미 판단 = 결정론 비대상(semantic 영역 / 정직 명시).

## 7. v0.45.0 — JS/TS extractor (carry TS/React 해소 / MINOR / 2026-06-13)

§6 carry "TS/React extractor" 시행. **per-framework extractor 패러다임**(Senior 권고: generic core + 어댑터) 실현 — 메커니즘(check A 날조 id / C intra-label / tokensIn 정규화)은 Java 와 100% 공유, **parser 만 언어별**.
- `extractJsDisplayNames`(jest/vitest `describe`·`it`·`test` 문자열 1st arg → 토큰) + `extractorFor(path)` dispatch(`.java`→Java / `.ts·tsx·js·jsx·mjs·cjs`→JS / 그 외 `unsupported_extractor_carry` 정직 skip — pytest 등). React(.tsx jest/vitest)=동일 extractor 커버.
- **JS 정직 한계**: JS `describe` 는 (Java nested class 와 달리) 독립 식별자명 부재 → **check B(join) skip**(name=null) / **check A(날조 id)+C(intra-label AC↔TC)만 유효**. 명시 표기(차이=언어 구조).
- **실 dogfood 2 (committed)**: poc-05(vitest / `describe('TC-USER-001 — register (UC/AC/BHV-USER-001)')`+`it('… (BR-USER-DATA-001)')` / checked 4·0 finding) + poc-20(js / `describe('AC-NOTES-001 …')` / checked 3·0 finding) = **no-false-positive 2 datapoint** (clean PoC라 drift-catching 은 synthetic unit-test 입증). 둘 다 join_anchor_absent skip(JS 구조 정직).
- 검증: spec-test-link **23 test**(JS 4 추가: extract/clean/날조BR critical/intra-label mismatch high + 기존 carry 테스트를 pytest .py `unsupported_extractor_carry` 로 갱신) / release-readiness 42/42.
- **§8.1 불변**: SOFT 유지. multi-language 커버(Java+JS/TS)는 HARD flip 전제(≥2 distinct **도메인**) 충족 아님 — poc-05/20 은 clean(실 drift 부재) + 동류 PoC. HARD flip 은 여전히 ≥2 distinct 도메인 **실 drift** corroboration 후 별도 결정. carry 잔여: pytest/기타 extractor · HARD flip · codegen.

## 8. v0.46.0 — Python/pytest extractor (carry 해소 / MINOR / 2026-06-13)

§6 carry "기타 extractor" 의 pytest 시행 — per-framework extractor 3번째 언어. **기존 examples/ PoC 2종이 실 dogfood 타깃**(섣불리 "타깃 없음" 결론 회피 = `feedback_codegraph_step_dogfood_examples` 선례): poc-14(FastAPI todos/users / **docstring idiom** `def test_x():\n  """TC-X / AC-X."""`) + poc-19(numpy-financial 대출상환 / **주석 idiom** `# TC-X <- AC-X / BR-X\ndef test_x():`).

- `extractPyDisplayNames`(+ `captureDocstring`) + `extractorFor` `.py` dispatch. 토큰 출처 2 idiom union(주석+docstring) / **모듈 docstring 미캡처**(def 선행 아님).
- **capability gain (JS 대비)**: pytest `def test_*` 함수명 = **독립 식별자** → JS describe(name 부재 → join skip)와 달리 **check B(join) 가능**. `joinIdentifiers` 가 source_evidence 의 bare `test_*` 명을 anchor 로 추출(class_ref·code_pointers 미populated 현실 = ep-be-gea·poc-14 공통). 실측: poc-14 **checked 7 / skipped 0**, poc-19 **checked 5 / skipped 0** = 모든 TC 가 fn 명으로 join 성립(join_anchor_absent 0 / JS 의 skip 대조).
- **cli brIds union**: flat `business_rules[].id`(poc-14) + split `bc_files[].rule_ids[]`(poc-19 / v0.43.0 bc-accumulator-rollup canonical) — 한쪽만 읽으면 split-form BR 프로젝트 check A 침묵 강등(`feedback_diagnose_before_design_check_existing`).
- **실 dogfood 2 distinct Python 도메인(committed)**: poc-14(web-CRUD) + poc-19(financial) = **0 finding / no-false-positive**. 둘 다 clean → drift-catching 은 synthetic unit-test(비-vacuous: 적대검증 독립 mutation A/B/C 전부 discriminate 확인).

**적대검증 패널 `wf_f649f1d7-f9a`(3 lens: false-pos/neg + governance + 독립 재도출) = go / blocker 0**. SOFT/determinism/§8.1/brIds-union 전부 pass + 0-finding 독립 재도출(non-vacuous) 확인. 패널이 적발한 false-**negative** 3건 **선반영**(품질 1순위·재작업 최소화 2순위 / 전부 결정론·FP-safe):
- **async def**(major): `def` regex 가 `async def test_*`(pytest-asyncio 주류) 미스 → `(?:async\s+)?` 추가.
- **cross-idiom conflict**(major): 한 fn 의 주석↔docstring TC/AC **불일치** 시 dedup+OR-semantics 가 은폐 → extractor 가 per-source 토큰셋 비교(`setEq`) → 두 idiom 공존+상이일 때만 `code_label.py_idiom_conflict`(high) / **composite(한 idiom 내 다중 TC)는 미플래그 = 오탐 회피**.
- **multi-fn join**(minor): source_evidence 2+ fn 나열 시 `find`(첫-매치)→`filter`(전수) → 비-첫 fn drift 은폐 차단(poc-14 TC-USER-FSIM-001 = 2 fn 실사례).

검증: spec-test-link **35 test**(pytest 12: extract/clean 2 idiom/날조BR critical/join mismatch/intra-label + async 2/conflict 2/multi-fn 1/module-docstring) / 기존 carry 테스트 `.py`→`.rb`(Ruby = genuinely-unsupported) 이전 / 4 PoC 무회귀(poc-14·19·05·20) / release-readiness 42/42.

**§8.1 불변 / SOFT 유지**: poc-14·19 = 2 distinct Python 도메인이나 **둘 다 clean(실 drift 부재)**. multi-language 커버(Java+JS/TS+Python)는 HARD flip 전제(≥2 distinct **도메인 실 drift**) 충족 아님(실 drift = ep-be-gea 1 프로젝트 한정). HARD flip 여전히 별도 결정. **잔여 carry**: pytest 외 extractor(unittest 메서드/Ruby 등) · HARD flip · codegen · same-idiom 다중-TC 의미판정(composite vs drift = 결정론 비대상 / semantic).

---

> **보안**: 본 DEC = 본체 기능 기술만 / 사내 식별자 0(golf/event/resv = 마스킹 codename). 노출 컨텍스트 산출물 = ep-be-gea GHE only.
