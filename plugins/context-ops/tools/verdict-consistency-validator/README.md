# verdict-consistency-validator

analysis stage(gate#0) 등록 validator. BC 분류 **verdict**(`domain.json#bounded_contexts[].verdict`)의 정합을 결정론으로 검사한다.

## 판별 칼
`verdict`는 **소유한 쓰기 aggregate** 로 갈린다 — `sql-inventory summary.by_type` 의 `insert+update+delete = write_ops`:
- `core` / `supporting` ⟺ `write_ops > 0` (per-BC, `domains/<BC>/`)
- `cross_cutting` / `read_model` / `operational` ⟺ `write_ops == 0` (소유 없음)

## 검사 (severity)
- **high (HARD block)**: 이중분류(`shared/cross-cutting/<mod>` 또는 `*-cross-cutting.json` concern + 등록 BC 동시), `verdict↔write_ops` 모순, `verdict_basis.write_ops` ≠ 실제.
- **medium (advisory)**: read-only인데 verdict 부재(사람 판정 필요), stale concern.
- **low**: 미등록 dir, verdict 백필 필요.
- **info (N/A)**: `domains/` 부재 = 도메인 샤딩 분석 산출물 아님 → verdict 검사 무의미(비차단 / advisory·enforce 양쪽). base REQUIRED 라 비-샤딩 PoC 도 매 analysis gate 에서 돌지만 게이트 영향 0.

## 토글 (기본 advisory)
**기본 = advisory**: high → medium 강등(게이트 비차단). `--enforce` 또는 `CONTEXT_OPS_VERDICT_ENFORCE=1` 일 때만 high 유지(gate HARD block). 병렬 dogfood 중 타 세션 게이트 영향 0 → 머지 후 enforce 로 승격.

## 사용
```bash
node tools/verdict-consistency-validator/src/cli.js --root <project>/.ai-context/base --json            # advisory(기본)
CONTEXT_OPS_VERDICT_ENFORCE=1 node tools/verdict-consistency-validator/src/cli.js --root <…> --json        # enforce(HARD)
```
exit 0(clean / advisory 는 항상 0) / 1(enforce + critical|high) / 2(usage).

## 게이트 연결
`findings-aggregator` 가 analysis stage에서 자동 실행 → `dispatchValidator`(transformGeneric) → `gate-eval` 가 `high>0` 이면 analysis→discovery 전이를 **STOP**(anti-bypass). `chain-driver/gate-eval` 와 `findings-aggregator` 의 `REQUIRED_VALIDATORS_PER_STAGE['analysis']` 양쪽에 등록(sync 의무).

SSOT: `decisions/DEC-2026-06-15-bc-verdict-classification.md` · schema: `schemas/domain.schema.json#bounded_contexts[].verdict`.
