# Plan — TDD/unit 층 §8.1 2nd-도메인 corroboration (poc-18)

> 4원칙 #1(plan) 산출물. research = 워크플로우 `wf_ffc462dd-95f`(7 agents: 5 readers → synthesis → Senior REVISE@0.82). 결정 = 사용자 승인(2026-06-11).
> **목표**: v0.36.0 출하된 unit 층(SOFT/opt-in)의 mock-soundness·unit-coverage 하드게이트 격상을 위한 **§8.1 corroboration DATA 생산**. 하드게이트 flip 코드(LEVER A/B/C)는 **본 세션 작성 ❌** (별도 promotion DEC + 사용자 결단).

## 결정 묶음 (사용자 승인 완료)

1. **2nd distinct 도메인 = poc-18 확장** (ep-be-gea = 도메인 #1 확정·불변). 근거: in-repo committable + 실 vitest + mock-soundness 실증 가능한 유일 후보 → unit 층 **최초의 재현가능 in-repo 증거**.
2. **mock-soundness 실증 = RED→GREEN unsound 데모** (검증기가 불건전을 **실제로 잡고**, 고치면 풀림 = 양방향 입증). ep-be-gea(sound 방향)와 상보 → 검증기 발화 방향을 채움.
3. **STOP-at-preparation** (Senior B4): corroboration DATA + DEC 초안까지만. 하드게이트 flip 코드 미작성.

## Senior 반영 사항 (REVISE@0.82 → GO-as-PREPARATION)

- **B1/B3 (MAJOR)**: poc-18 `auth.service.test.ts`는 real-collaborator(mock 0). 그대로면 `validateMockSoundness`=0건=**공허 통과**. → 데모용 **신규 mockist composition 테스트**를 작성(기존 테스트 왜곡 ❌). RED→GREEN으로 검증기 비-공허 입증.
- **B2 (MINOR)**: 커밋된 `test-cmd.json`은 post.service(Docker integration) 슬라이스. unit 슬라이스 실행 = **신규 명령 + `pnpm install` 선행** 필수 → README/DEC에 정직 명문화 + unit-test-cmd 분리.
- **B3 정직 GAP**: ep-be-gea 외부·commit❌ → 격상 증거 셋 재현성 비대칭(s2 선례 `DEC-2026-06-01`은 양쪽 in-corpus 실행). DEC에 정직 기록.
- **trust 불변식 보존**: 하드게이트 후보 = **spec 파생 UNIT(provenance=designed_from_spec/characterized_from_code)만**. code-graph method-axis = reference-lens 영구 비-게이트(DEC-2026-05-28). release check34/36/37/39 무수정. `unit-spec.coverage.method_axis_corroboration.reference_lens=const:true` 보존.
- **무회귀**: 전부 additive·optional·default behavior-only. 기존 PoC 25/25 schema-valid 무회귀. test-spec `allOf if/then`(test_layer 부재→ac_ref 강제) 보존. AC→TC 하드게이트 #4 불변.

## Ground truth (실측 / poc-18 target)

- `target/test/shared/utils/encryption.test.ts` — 순수 unit(DB·mock 0 / encryptPassword·isPasswordMatch / 10 TC). **test_layer=unit 후보**. Docker 불요.
- `target/test/shared/utils/{pick,exclude}.test.ts` — 순수함수 unit. test_layer=unit 후보.
- `target/test/modules/auth/auth.service.test.ts` — 실 encryptPassword(L20)+실 prisma. real-collaborator·mock 0. **건드리지 않음**.
- `target/.ai-context/config/test-cmd.json` — post.service(Docker) 가리킴. unit 슬라이스 별도 명령 필요.
- `target/.ai-context/output/` — test-spec.json / behavior-spec.json / task-plan.json / matrix.json / domain.json 전부 존재(behavior-only / test_layer·class_ref·mocks 0건 확인됨).

## 실행 단계 (additive)

1. **`unit-spec.json` 저작** (poc-18 신규 additive 파일 / .ai-context/output).
   - units: `encryption`(kind=function, provenance=designed_from_spec, code_pointer=ast_symbol 재사용), `pick`, `exclude`.
   - unit_test_obligation 명시. derivation_source.domain_path → poc-18 domain.json.
   - schema-validator로 valid 확인.
2. **신규 mockist composition 테스트 작성** (`target/test/modules/auth/*.unit.test.ts` 또는 유사 / encryptPassword+prisma `vi.mock` → Docker-free). 실 vitest GREEN. 기존 테스트 무변경.
3. **test-spec.json additive 주석**:
   - encryption(+pick/exclude) TC → `test_layer=unit` + `class_ref=UNIT-*`.
   - 신규 mockist TC → `test_layer=composition` + `mocks[].collaborator_unit_ref=encryption UNIT`.
4. **RED→GREEN 데모** (실 검증기 2회 실행):
   - RED: encryption TC를 test_layer=unit으로 핀하기 **전** 상태 → `spec-test-link-validator --unit-spec` → `unit.mock.unsound` 1건 기대.
   - GREEN: encryption TC test_layer=unit 핀 → 재실행 → 0 unsound = sound.
   - 두 상태 모두 evidence 캡처(no-simulation / simulated_evidence_count=0). 최종 커밋 상태 = GREEN.
5. **behavior-spec / task-plan** additive `unit_refs`(+task obligation) 부착.
6. **실 vitest 실행**: `pnpm install` → unit 슬라이스 실행 → vitest-report.json evidence.
7. **matrix `--unit-spec` 재빌드** → `coverage_summary.unit_coverage{obligation_satisfied_ratio}` 산출.
8. **DEC 초안** `DEC-2026-06-1x-unit-layer-corroboration-poc18` + STATUS.md unit-layer evidence 갱신. 정직 GAP(ep-be-gea 재현성 비대칭) 기록. flip 코드 분리 명시.

## 검증 (verification gate)

- 실 Tier-1 runner: `pnpm exec vitest run` unit 슬라이스 GREEN + vitest-report.json (no-simulation).
- schema-validator: poc-18 unit-spec.json valid + 기존 PoC 25/25 무회귀.
- spec-test-link-validator --unit-spec: RED 1건 → GREEN 0건 (검증기 발화 입증).
- traceability-matrix-builder --unit-spec: unit_coverage 산출(unit-spec 부재 PoC는 객체 부재 유지).
- release-readiness 무회귀(현 카운트) + reference-lens 가드 check34/36/37/39 무수정.
- behavior 체인 forward/backward coverage 무회귀.

## 금지선

- 하드게이트 flip 코드(findings-aggregator buildValidatorArgs --unit-spec 배선 / cli.js advisory 격리 해제 / plan-coverage severity medium→high / aggregator transformTraceabilityMatrix unit_coverage 매핑) **미작성** — 별도 promotion DEC.
- code-graph method-axis를 게이트/REQUIRED_VALIDATORS_PER_STAGE에 추가 ❌.
- `flows/*.phase-flow.json` 편집 ❌ (drift-validator carry hazard).
- 기존 auth.service.test.ts / 25개 PoC 산출물 변경 ❌.

## Lessons Learned (4원칙 #4)

- **mock-soundness 데모는 RED→GREEN 이어야 비-공허**: poc-18 기존 테스트는 전부 real-collaborator(mock 0 / `grep vi.mock`=0). sound-only 데모는 "0 findings"가 sound인지 vacuous인지 구분 불가(no-op 검증기도 통과). 신규 mockist TC + RED(unsound 발화)→GREEN(핀 후 해소)로 검증기 발화 입증. Senior B1 적중.
- **schema 필드명 실측 의무**: `mock_type`(추측)→`mock_kind`(실제) / `traceability-matrix.schema.json`은 builder 출력용이 아님(원본도 fail / matrix.json은 schema 미검증 skip). 추측 금지 — 실 schema·실 검증기로 확인.
- **additive 가 숫자를 바꿔도 무회귀일 수 있다**: composition TC 추가가 matrix forward 0.833→0.714 하락시켰으나 **기존 셀 status 변경 0**(diff로 입증). 날조 IMPL로 숫자 방어 = no-simulation 위반 → 정직 수용 + 문서화가 정답. USER 슬라이스는 원래 미구현(poc-18 forward 원래 <0.85).
- **provenance 정직 분류**: vendored OSS 기존 코드+기존 테스트 = `characterized_from_code`(designed_from_spec 아님). 워크플로우 synthesis의 "poc-18=designed_from_spec" 편의 framing 거부 → 정직. 결과: designed_from_spec 브랜치 미실증 = 향후 greenfield carry.
- **§8.1 corroboration ≠ 자동 flip**: ≥2 distinct 도메인 충족이 하드게이트 flip을 강제하지 않음. flip은 GAP(재현성 비대칭·provenance 편중) 고려한 별도 의도적 결단(promotion DEC). corroboration DATA 생산과 flip 분리 = §8.1·4원칙 #3 규율.
