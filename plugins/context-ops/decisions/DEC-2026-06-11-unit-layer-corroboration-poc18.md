# DEC-2026-06-11-unit-layer-corroboration-poc18

- **일자**: 2026-06-11 (corroboration only / **버전 bump 없음** — 본체 schema/gate 무변경 / examples + docs additive)
- **카테고리**: corroboration / §8.1 ratchet — TDD/unit 층 **2nd distinct 도메인** (poc-18 Express+Prisma+TS) + mock-soundness RED→GREEN 실증
- **상태**: 승인 (사용자[TF Lead] AskUserQuestion — 2nd domain=**poc-18 확장** + mock-soundness=**RED→GREEN unsound 데모** / plan `.claude/plans/plan-unit-layer-corroboration-poc18.md`)
- **관계**: `DEC-2026-06-11-tdd-unit-layer-thread` 결정 2(§8.1 ratchet)의 후속 corroboration. **하드게이트 격상(LEVER A/B/C flip) = 본 DEC 아님 / 별도 promotion DEC(미래)**.

## 맥락 (왜)

v0.36.0 가 TDD/unit 층(`UNIT-*` / mock-soundness / unit-coverage)을 **스캐폴딩 + 검증기 SOFT** 로 출하. §8.1 ratchet = mock-soundness·unit-coverage **하드게이트 격상은 ≥2 distinct 도메인 PoC corroboration 후 별도 DEC**. PoC #1 = ep-be-gea(Java/Spring/event/S2). 단 ep-be-gea = 외부·commit❌ → **in-repo 재현 unit-layer 증거 0건**(`git ls-files examples/**/unit-spec.json` = empty). 본 세션 = §8.1 의 **2번째 distinct 도메인 corroboration DATA 생산** (in-repo 재현가능) + 그것이 정직하게 무엇을 입증/미입증하는지 기록.

워크플로우 조사(7 agents: 5 readers → synthesis → Senior REVISE@0.82): poc-18 = in-repo committable + 실 vitest 배선 + 격리 unit test 기존 존재 = mock-soundness·unit-coverage 둘 다 in-repo 재현가능하게 실증하는 유일 후보(poc-19=협력자 부재로 mock-soundness 미실증+Windows 경로 / 사내=재현성 0). Senior B1: poc-18 `auth.service`는 real-collaborator(mock 0) → 그대로면 mock-soundness 공허 통과 → **신규 mockist TC 저작 + RED→GREEN 으로 비-공허 입증** 필요(기존 테스트 왜곡 ❌).

## 결정

poc-18 을 **TDD/unit 층 2번째 distinct 도메인 corroboration** 으로 채택. **additive·무회귀**(본체 schema/gate/tool 무변경 / examples + docs 만). mock-soundness = **RED→GREEN unsound 데모**(검증기 발화→해소 양방향 = 공허 통과 의혹 제거). 하드게이트 flip = 별도 promotion DEC(아래 §정직 GAP 가 flip 시점 판단 입력).

## 시행 (무엇 — 전부 additive)

- **신규**: `unit-spec.json`(2 UNIT — `UNIT-ENCRYPTION-001`·`UNIT-PICK-001` / provenance=characterized_from_code / code_pointer ast_symbol / obligation=required) + 신규 실 mockist 테스트 `test/modules/user/user.service.unit.test.ts`(createUser 가 `encryptPassword`·`userRepository` mock → 평문이 절대 저장 안 되고 해시만 저장됨 단언 / Docker 불요).
- **test-spec.json**(additive 3 TC): `TC-ENC-001`(test_layer=unit, class_ref=UNIT-ENCRYPTION-001 → encryption.test.ts) · `TC-PICK-001`(test_layer=unit, class_ref=UNIT-PICK-001 → pick.test.ts) · `TC-USER-002`(test_layer=composition, mocks[].collaborator_unit_ref=UNIT-ENCRYPTION-001 → 신규 mockist 테스트).
- **behavior-spec.json**: BHV-USER-001.unit_refs=[UNIT-ENCRYPTION-001] · BHV-POST-002.unit_refs=[UNIT-PICK-001] (BHV→UNIT join). **task-plan.json**: TASK-USER-001·TASK-POST-002 unit_refs + unit_test_obligation=required (TASK→UNIT binding).
- **matrix.json** 재빌드(`--unit-spec`): `coverage_summary.unit_coverage{obligation_satisfied_ratio:1, unit_total:2, unit_tested:2, threshold:0.85}`.

## mock-soundness RED→GREEN (검증기 비-공허 입증)

- **RED** (encryption unit TC 부재): `spec-test-link-validator --unit-spec` → `unit.mock.unsound` **1 finding(high)** — "TC-USER-002 mocks UNIT-ENCRYPTION-001 but UNIT-ENCRYPTION-001 has no test_layer=unit TC". evidence = `evidence/mock-soundness-RED.json`.
- **GREEN** (TC-ENC-001 추가 → UNIT-ENCRYPTION-001 핀): 재실행 → **0 findings**(sound). evidence = `evidence/mock-soundness-GREEN.json`.
- 검증기가 불건전을 **실제로 잡고**(RED) 고치면 **풀림**(GREEN) = no-op 검증기와 구분 = ep-be-gea(sound 방향 단독)가 못 본 **발화 방향** 보완.

## STOP (검증 — no-simulation)

- 실 vitest **18/18 GREEN**(encryption 9 + pick 7 + user.service.unit 2 / no Docker / `evidence/unit-layer-vitest-report.json` success:true / simulated_evidence_count=0).
- schema-valid: unit-spec·test-spec·behavior-spec·task-plan 전부 valid + poc-18 output 산출물 14/14 valid.
- matrix 무회귀: **기존 셀 status 변경 0**(POST 5/5 green intact / backward 1.0 unchanged) — 신규 셀은 (AC-USER-001,TC-USER-002) yellow 1개(아래 GAP).
- plan-coverage **0 findings**(task unit_test_obligation 설정 → spurious medium 없음).
- 도구 테스트: spec-test-link 11/11 · plan-coverage 47/47 · matrix-builder 172/172 · schema-validator 111/111. **release-readiness 42/42**. 본체 코드 무변경.

## 정직 GAP (flip 판단 입력 / Senior B1·B2·B3)

1. **재현성 비대칭(B3)**: 2 distinct 도메인 = ep-be-gea(외부·commit❌·재현 0) + poc-18(in-repo·재현가능). poc-18 = **unit 층 최초의 재현가능 in-repo 증거**. 단 s2 격상 선례(DEC-2026-06-01)는 **양쪽 in-corpus** 였음 → 보수적 readers 는 flip 전 2nd in-repo 도메인 또는 greenfield 를 더 요구할 수 있음.
2. **provenance 편중**: 두 PoC 모두 unit 층에서 **characterized_from_code**(poc-18 utils = vendored OSS 기존 코드·기존 테스트 핀). **designed_from_spec(RED→GREEN test-first) 브랜치는 schema 구조 지원 / 실 코드 미실증** → 향후 greenfield PoC.
3. **breadth 보통**: poc-18 = 2 UNIT(encryption·pick). exclude util 은 대응 BHV 부재로 제외(인위 매핑 회피). mock-soundness 실증 = 1 협력자(encryption).
4. **matrix forward 하락(additive)**: 0.833→0.714 — composition TC(TC-USER-002)가 **이미 미구현인 USER 슬라이스**(chain5 implement = POST scoped / impl-spec=IMPL-POST-001 only)에 yellow 셀 1개 추가. 기존 green 셀 무회귀·날조 IMPL 미생성(no-simulation). poc-18 은 원래 forward 0.833<0.85(USER 슬라이스 linkage-only).

## carry

- **하드게이트 flip = 별도 promotion DEC**(미래): LEVER A(mock-soundness findings-aggregator `--unit-spec` 배선 + cli advisory 격리 해제) · B(plan-coverage severity medium→high) · C(aggregator transformTraceabilityMatrix unit_coverage 매핑). §8.1 precondition(≥2 distinct 도메인) = **충족됐으나** flip 은 위 GAP(특히 designed_from_spec 미실증·재현성 비대칭) 고려한 **별도 의도적 결단**. 본 세션 코드 미작성.
- trust 불변식 보존: spec 파생 UNIT 만 게이트 후보 / code-graph method-axis = 영구 비-게이트(DEC-2026-05-28 / check34/36/37/39 무수정 확인).
- designed_from_spec RED→GREEN 브랜치 실증 = greenfield 신규 예제(향후).

DEC-2026-06-11-unit-layer-corroboration-poc18. Corroborates `DEC-2026-06-11-tdd-unit-layer-thread` 결정 2(§8.1 ratchet).
