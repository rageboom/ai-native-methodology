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

- TS/React extractor (jest/vitest describe/it 라벨) — Java extractor 만 now.
- HARD flip (≥2 distinct 도메인 후).
- codegen(@DisplayName 자동생성 = drift class 근절) — harness-internal 경계 / human-authored legacy 미해결 → 별도.
- class_ref·code_pointers 강제(현 권장) — populate 시 join 검사 강화.
- "실재 id·오의미" drift(event 식) = 의미 판단 = 결정론 비대상(semantic 영역 / 정직 명시).

> **보안**: 본 DEC = 본체 기능 기술만 / 사내 식별자 0(golf/event/resv = 마스킹 codename). 노출 컨텍스트 산출물 = ep-be-gea GHE only.
