# PoC #21 — greenfield designed_from_spec (money allocation)

> **목적**: unit-layer HARD flip GATED 5조건 중 **①designed_from_spec greenfield RED→GREEN 실코드 E2E** + **②in-repo 재현가능 2nd 도메인** 실증. (SSOT = `decisions/DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating.md`)
> plan = `.claude/plans/plan-poc21-greenfield-designed-from-spec.md`. 시나리오 = **greenfield**(PRD only / 코드 from-zero).

## 왜 신규 도메인인가 (정직성 핵심)

레포 전체에서 `provenance=designed_from_spec` 실 인스턴스 = **0건이었음**(poc-18=S2 characterization / poc-19=S1 "재생성된 원 구현" / poc-20=S2 characterization — 전부 코드 선존재). poc-19/20 을 재라벨하면 "원본 비운 stub"을 designed_from_spec 로 **위장**하는 self-deception(no-simulation 위반). 따라서 **코드가 처음부터 없던 신규 도메인**(통화 분할 / Fowler Money)이 유일하게 정직한 길. RED stub 은 "원본 비움"이 아니라 "아직 설계 안 된 신규 코드".

## designed_from_spec RED→GREEN 증거

| 단계 | runner | tests | result_hash | impl 상태 |
| ---- | ------ | ----- | ----------- | --------- |
| RED | node:test | 7 / **0 pass / 7 fail** (exit 1) | `7cea62db…` | throw stub (코드 미설계) |
| GREEN | node:test | 7 / **7 pass / 0 fail** (exit 0) | `85f0cbe9…` | spec invariant 로부터 구현 |

evidence = `evidence/test-impl-{red,green}.json`. **동일 test 파일 불변**(`502278e7…` / i-strict — impl 만 변경).

### RED→GREEN 순서를 무엇이 증명하나 (senior 검토 명시)

- **tool-결정론 증거 (게이트로 신뢰 가능)**: ① 두 실 runner run 의 `result_hash` 차이(`7cea62db…` ≠ `85f0cbe9…`) + ② test 파일 sha256 불변(impl 만 RED→GREEN 전이). poc-19 가 쓴 메커니즘과 동형.
- **human-review carry (게이트 강제 ❌)**: git commit 순서(test commit 이 impl 보다 선행) + 본 README prose. ⚠️ formal-spec/unit-spec schema 에 `test_first`/temporal/order 필드 = **없음**. gate-eval 은 시간 순서를 검증하지 않는다. "RED 가 GREEN 보다 먼저였다"는 **결정론 게이트가 아니라 사람 검토 신뢰**다 — 이를 결정론 보증으로 위장하지 않는다.

## §8.1 과적합 가드 (반드시 읽을 것)

본 PoC = designed_from_spec 의 **단일 datapoint**. 통과해도 designed_from_spec 는 정확히 1개 실코드 사례뿐.
- ❌ "designed_from_spec paradigm 이 검증됨" 주장 금지. ✅ 이 **좁은 DB-free 순수함수 best-case** 에서 조건① 충족만 주장.
- HARD flip(LEVER A/B)은 여전히 **별도 promotion DEC + DEC 자체의 ≥2 도메인 논리** 필요. 본 PoC 가 flip 을 여는 게 아님.
- legacy/stateful designed_from_spec 경로로 일반화 ❌(순수함수 best-case 의 성공은 stateful 에 전이 안 됨).

## 닫은 조건 / 미룬 조건

- ✅ **①** designed_from_spec greenfield RED→GREEN 실코드 E2E (위 증거).
- ✅ **②** in-repo 재현가능 2nd 도메인 (본 committed PoC = ep-be-gea 외부·재현0 다리를 끊음).
- ⏸ **③** mutation_score(Stryker) — 후속 증분(senior fix #3 = ① 희석 회피로 분리).
- ✅ **④** mock-soundness breadth — 실 `validateMockSoundness`(no-simulation)로 **≥2 협력자**(UNIT-ALLOC-001 sound + UNIT-FORMAT-001 RED→GREEN) + **1 waived**(UNIT-RECEIPT-DTO-001 면제) 실증. composition `allocateReceipt` 가 DI 로 3 협력자 mock. evidence = `evidence/mock-soundness-{RED,GREEN}.json` / 재현기 `evidence/run-mock-soundness.mjs`. ※ full UC→BHV→AC SDLC chain 은 unit-layer scope 밖(fixture=mock-soundness 입력 test_layer/class_ref/mocks 만).
- ⏸ **⑤** promotion DEC + criteria_total 42→43 + HARD flip 시행 — PoC 외부 본체 작업.

## 산출물 / 검증

- `PRD.md`(greenfield 입력) + `.ai-context/output/{domain,formal-spec,unit-spec}.json`(**3종 schema-valid**) + `target/`(src+test+package.json) + `evidence/`.
- **unit-spec.json = designed_from_spec 첫 schema-valid 실 인스턴스**(레포 0건이던 provenance). code_pointer 추이: spec 단계 doc_link/stale(코드 미존재) → GREEN 후 `ast_symbol`(symbol=allocate).
- 본체(schema/tool/gate/release-readiness) **무수정** = examples/ 산출물만.

## carry / finding

- **F-POC21-001** (`findings/`): formal-spec.schema 의 `language` enum `[typescript,java]` + `framework` enum 이 JavaScript(node:test)·Python 을 배제 → JS/Python greenfield 가 `formal-spec.invariants`/`property_tests` 를 못 채움. 본 PoC 는 빈 배열 + $comment 로 정직 표기, 실 invariants 는 PRD(`BR-ALLOC-*`)+test 로 표현. 본체 enum 확장은 별도 결단(carry).

## 재현

```sh
cd target && node --test                 # GREEN: 12 pass / 0 fail (7 allocate + 3 formatMoney + 2 composition)
node ../evidence/run-mock-soundness.mjs   # 조건④: RED 1 unsound → GREEN 0 (sound)
```

> UNIT: UNIT-ALLOC-001(required)·UNIT-FORMAT-001(required)·UNIT-RECEIPT-DTO-001(waived) — 전부 `designed_from_spec`. composition `allocateReceipt` = 빌딩블록 조합(UNIT 아님).
