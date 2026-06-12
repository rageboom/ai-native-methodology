# plan — poc-21 greenfield designed_from_spec PoC (GATED 조건①②)

> 4원칙 1원칙 산출물. workflow(wf_fb407019 진단+설계) + senior REVISE 반영. SSOT = DEC-2026-06-12-unit-layer-soft-surface-and-promotion-gating §flip 5조건.

## 목적

unit-layer HARD flip GATED 5조건 중 **①designed_from_spec greenfield RED→GREEN 실코드 E2E** + **②in-repo 재현가능 2nd 도메인** 을 한 신규 PoC 로 동시 충족. ③Stryker·④breadth 는 후속(senior fix #3 = ① 희석 회피).

## 진단 확정 (diagnose-before-design)

- designed_from_spec provenance UNIT 의 실 인스턴스 = **레포 전체 0건**(확정). 현존 full-chain PoC 전부 코드 선존재: poc-18=S2 characterization / poc-19=S1 원본 재생성("재생성된 원 구현") / poc-20=S2 characterization.
- schema·도구·게이트 = 전부 RESOLVED: unit-spec.schema designed_from_spec 브랜치 / code-pointer stale·doc_link / chain-driver `--scenario greenfield` / gate-eval greenfield={test:all_fail, implement:all_pass}. **신규 schema·도구 0** — PoC 가 빈 브랜치를 정직하게 채우기만.

## 타깃

`plugins/context-ops/examples/poc-21-greenfield-money-allocation/` — 통화 분할(Fowler Money.allocate 동형) 순수함수. node --test(zero-install 결정론 / repo 도구 동형) / DB·네트워크 0. **코드 0에서 시작**(poc-19/20 코드 선존재 위장 위험 회피 = 유일 정직 경로).

## designed_from_spec 정직성 (senior fix #2 — 핵심)

RED→GREEN 순서의 **tool-결정론 증거** = (a) 실 runner result_hash 두 run 차이(RED report ↔ GREEN report) + (b) i-strict test-파일-불변 델타(같은 test, impl 만 변경). git commit 순서·README prose = **human-review carry 로 명시**(결정론 게이트로 위장 ❌). 도메인이 code-from-zero 라 RED stub = "원본 비움"이 아니라 "아직 설계 안 된 코드" = poc-19 함정 회피.

code_pointer 추이: spec 단계 `stale=true`/`doc_link`(코드 미존재) → implement 후 `ast_symbol`(symbol='allocate') = designed_from_spec 결정론 굳힘 신호(schema:68 허용).

## §8.1 가드 (senior fix #4)

단일 datapoint = "designed_from_spec paradigm 검증" 주장 ❌. 이 좁은 DB-free 순수함수 best-case 에서 조건① 충족만 주장. HARD flip 은 여전히 별도 promotion DEC + 자체 ≥2 도메인 논리 필요. legacy/stateful designed_from_spec 일반화 ❌.

## 도메인 spec (formal invariants)

- `allocate(amount, ratios)` — 정수 amount(cents)를 ratios 비율로 분배.
- INV-1 보존: `sum(result) === amount`.
- INV-2 잔돈-앞쪽: 나머지 cent 를 앞 버킷부터 1씩(`allocate(100,[1,1,1])=[34,33,33]`).
- INV-3 검증: amount 음수/비정수, ratios 빈배열/비양수 → throw.
- INV-4 비례 floor: 각 버킷 = `floor(amount*r/Σr)` + 잔돈 분배.

## stages (senior-fixed / ①② only)

0. plan(본 파일) + 도메인 동결(코드 0 확인).
1. PRD.md + 디렉토리(poc-19 레이아웃 복제) + target(package.json·src·test).
2. **test-first**: allocate.unit.test.mjs 작성(INV-1~4) → src/allocate.mjs = throw stub.
3. **genuine RED**: node --test → tests_failed>0 실측 → evidence/test-impl-red.json(result_hash A).
4. **GREEN**: src/allocate.mjs 실 구현(spec invariant 로부터 / 원본 베끼기 ❌) → node --test → tests_failed=0 → evidence/test-impl-green.json(result_hash B≠A).
5. 산출물: formal-spec.json(invariants) + unit-spec.json(designed_from_spec / code_pointer doc_link→ast_symbol) + README(provenance·정직 carry 명시).
6. 검증: unit-spec schema-valid + RED/GREEN result_hash 차이 + i-strict test 불변. release-readiness 42/42 무회귀(examples/ 산출물만 / 본체 무수정).

## scope 경계

- 본 PoC = examples/ 산출물. 본체(schema/tool/gate/release-readiness) **무수정**.
- 조건③(Stryker)·④(≥2 collaborator+waived breadth) = 후속 증분(별도).
- 조건⑤(promotion DEC + criteria_total 42→43 + HARD flip 시행) = PoC 외부 본체 작업 / 5조건 충족 후.

## carry (senior fixes)

- greenfield-bootstrap md↔json drift(cli.js:100 migration-cautions.md vs ADR-011 .json) = 별도 finding 후보(본 PoC 가 고칠 의무 ❌).
- `--scenario greenfield` manifest 안착 live 검증(greenfield E2E count=0이라 구조지원≠실증).
