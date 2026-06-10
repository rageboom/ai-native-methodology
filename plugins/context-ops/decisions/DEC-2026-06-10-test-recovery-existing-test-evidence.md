# DEC-2026-06-10-test-recovery-existing-test-evidence

**결단**: 역공학 델타 **#5 test-recovery** — characterization-spec `data_source_status` enum 에 **`existing_test_file`** 추가. **R15 정책**: 기존 테스트가 행위 증거가 되려면 **그 테스트를 실제 실행(`real_tool` invocation / 5종 물증)했을 때만** `existing_test_file` 사용. 이 status 는 `REAL_SOURCE_STATUSES` 에 편입 → characterization-coverage-validator Layer 3 evidence cross-check 대상(claim ≤ evidence_tool_count). 테스트 파일을 **읽기만** 하고 안 돌렸으면 `code_only`(silent simulation 차단).

**작성일**: 2026-06-10 (사용자 결단: "역공학 델타 #5 진행" → R15 정책 강도 = **RUN 의무(real_tool 증거)** 채택).

**relates to**:
- `DEC-2026-06-09-reverse-eng-methodology-gap` §3 델타 #5 (test-recovery / plan-reverse-engineering-methodology.md §4-b 가 "R15 결단 격상"으로 보류)
- `methodology-spec/policies/no-simulation.md` §2 Tier 1 (test stack runner) (테스트 단계 stack runner = Tier 1 in-plugin 실행 / `evidence_trust=real_tool`)
- charter R15 (정적/실행 도구 검증 필수 / silent-simulation 차단)
- `feedback_axis_split_severity_reevaluation` (plan 이 "additive enum" 으로 오분류 → 실측 시 R15 가드 결합 발견 / 액면 분류도 검증)

---

## 1. 배경 — "additive enum" 이 아니었다 (plan §4-b 보류 사유)

역공학 갭분석 plan 이 #5 를 처음 "characterization `existing_test_file` enum = 저리스크 additive" 로 분류했으나 **되돌림**: `characterization-coverage-validator/src/validator.js` 의 `REAL_SOURCE_STATUSES` 하드코딩 set 발견 — enum 만 추가하면 `existing_test_file` 스냅샷이 (a) `code_only` 검증(domain expert carry HIGH) 도, (b) Layer 3 real_* evidence cross-check 도 **둘 다 우회 = R15 silent-simulation 가드 구멍**. → 정책 결정 + validator 동시 변경 필요(M-size).

**diagnose-before-design 실측**: 증거 메커니즘은 **이미 존재** — no-simulation.md §2 Tier 1 (test stack runner) 가 "테스트 단계 stack runner(Gradle·JUnit/vitest)"를 Tier 1 실행(`evidence_trust=real_tool` + 5종 물증)으로 인정. 즉 #5 = 새 증거 채널 빌드 ❌ / **의미 tier(existing_test_file) 추가 + 가드 구멍 차단**.

## 2. R15 정책 (사용자 채택 = RUN 의무)

- `existing_test_file` = 기존 테스트가 행위 증거 — **그 테스트를 실제 실행한 경우만**(real_tool invocation 증거). `REAL_SOURCE_STATUSES` 편입 → Layer 3 cross-check: 그 status claim 수 ≤ evidence_tool_count(실 invocation unique tool 수). 미충족 = critical(silent simulation 의심).
- 테스트 파일을 읽기만 하고 안 돌림 = `code_only`(stale/skip/broken 테스트의 검증 안 된 증거 주장 차단).
- no-simulation.md §2 Tier 1 (test stack runner) "test stack runner = Tier 1" 와 **정합**(별도 정책 신설 ❌ / 기존 Tier 1 실행 + 5종 물증 모델 재사용).

## 3. 변경 내용

- `schemas/characterization-spec.schema.json` — `data_source_status` enum 에 `existing_test_file` 추가 + description(RUN 의무·읽기만은 code_only).
- `tools/characterization-coverage-validator/src/validator.js` — `REAL_SOURCE_STATUSES` 에 `existing_test_file` 추가(Layer 3 evidence cross-check 대상).
- `methodology-spec/deliverables/23-characterization-spec.md` — data_source_status 목록 + test-recovery 대응 설명.
- test +2: ① existing_test_file claim + 0 invocation → invocation_count_mismatch **critical**(가드 발화) ② existing_test_file + 실 테스트 러너 invocation → cross-check **ok** + code_only finding 미발생(우회 ❌·정확 분류). 검증기 20→22.

## 4. 검증 / 정직 경계

- 가드 = 단위 테스트로 입증(critical/ok 양 경로). R15 더 **엄격**해짐(additive 가 아니라 enforcement 강화) → 기존 동작 무회귀(code_only check 무영향 / 기존 real_* cross-check 무변경).
- **§8.1 corroboration**: 가드 정확성=unit-test. existing_test_file **usage** 의 ≥2 distinct 도메인 dogfood = carry(ep-be-gea characterization JUnit 실행 = 1 live 시나리오 / 2nd 도메인[JS vitest 등] carry). 가드 자체는 도메인 무관 결정론.
- cross-schema: data_source_status enum 을 하드코딩/cross-ref 하는 다른 validator·schema 0(grep 확인) → 등록 추가 불요.

## 5. Non-goal

- 자동 테스트 실행 ❌ — 사용자/CI 가 실행한 invocation 증거를 cross-check 만(no-simulation = plugin 이 임의 실행 강제 안 함 / 환경 의존).
- "테스트 파일 존재만으로 증거" ❌ (Option B 비채택 / 가드 구멍 회피).
