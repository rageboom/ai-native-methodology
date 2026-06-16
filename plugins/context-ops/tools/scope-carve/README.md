# scope-carve

역공학 scope-carve 3 결정론 신호 **reference-lens** 도구. 대형 legacy 코드베이스를 "어떤 경계로 쪼갤지" 돕는 구조 신호를 산출한다. (DEC-2026-06-09-scope-carve-3signal-reference-lens / 모DEC = DEC-2026-06-09-reverse-eng-methodology-gap 델타 #1)

## When to call

analysis 단계, scope 분해 진입 시. `analysis-scope-carve` skill 이 호출. 출력 `scope-carve.json` 은 사용자가 **soft gate #0** 에서 scope 를 확정하기 위한 **evidence-only** — 어떤 결정적 gate 에도 inject 되지 않는다 (DEC-2026-05-28 §4.2).

## 3 신호 (모두 결정론)

| 신호 | 입력 | 역할 |
|------|------|------|
| **Tarjan SCC** (`scc.js`) | architecture.json deps | multi-node SCC = 분할 불가 atomic 단위 / condensation topo = 안전 추출 순서 |
| **Martin Ca/Ce/I** (`martin.js`) | architecture.json deps | sink(깨끗 추출)·hub(shared kernel)·unstable 랭킹 / **A·D abstain**(입력 부재 / no-simulation) |
| **VCS co-change** (`co-change.js`) | target git 이력 | logical coupling(함께 변경) — 정적 그래프 비가시 결합(config↔code / mapper↔DAO) / 유일 git-only |

## Inputs

```bash
scope-carve --architecture <architecture.json> [--repo <dir>] [--output <dir>]
  [--since <date>] [--min-support N] [--min-confidence F] [--window N]
  [--max-transaction-size N] [--unstable-instability F] [--hub-afferent N] [--stdout]
```

- `--architecture` (필수) — SCC + Martin 입력. 부재 시 **exit 3** (no-simulation 정직 신호).
- `--repo` (선택) — co-change git 이력. 생략 = SCC+Martin 만. git 이력 부재 = `co_change.status:no_git_history` honest skip.
- co-change 파라미터(min-support/min-confidence/window/max-transaction-size/since) + Martin 임계(unstable-instability/hub-afferent) = **soft-gate 노출**(출력 `params` 에 기록 / 'deterministic'은 pin 이후 성립).

## Outputs

- `<output|repo|cwd>/.ai-context/base/scope-carve.json` (`schemas/scope-carve.schema.json` / reference-lens / NOT gate-injected). `evidence.evidence_trust=real_tool` / `result_hash` = timestamp 제외 결정론 payload sha256(재현 witness).

## Exit codes

- `0` — 정상 (co-change honest skip 포함).
- `2` — usage / architecture.json 파싱 실패.
- `3` — architecture.json 부재 (환경 부재 / no-simulation — `analysis-architecture` 선행 필요).

## Determinism / no-simulation

- Tarjan SCC = iterative O(V+E) / 노드·이웃 정렬로 traversal tiebreak 고정.
- Martin = distinct module→module edge 카운트(weight 합산 ❌ / double-count 회피).
- co-change = `git log --no-merges --name-only` 결정론 mining (파라미터 pin 후 완전 재현). bulk 이력용 mining-grade git runner(64MB/30s — `_shared` makeGitRunner 의 1MB/5s 는 small-query 용이라 ENOBUFS).
- Bunch MQ(확률적 비재현) / EventStorming(human-judgment) = **미포함**.

## Tests

```bash
node --test test/scc.test.js test/martin.test.js test/co-change.test.js test/carve.test.js
```

co-change 는 synthetic git fixture(fake gitRunner)로 결정성·파라미터 동작을 입증한다(PoC target `.git` 부재 대응 / DEC §2.6).

## Sibling tools

- `tools/codegraph-runner/` — code↔code 구조 reference-lens (동일 trust 모델 선례).
- `tools/_shared/code-pointer-git.js` — git 결정론 plumbing 선례(makeGitRunner / gitDiffNumstat).
