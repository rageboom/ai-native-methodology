---
name: discovery-dep-consult
description: chain (discovery) 공통 sub-skill. UC 간 의존성 reference-lens 를 결정론 도구(dep-consult-cli)로 산출 → discovery-spec.uc_dependencies 기록. 하이브리드 2신호 — shared_ref(UC 가 br/api/source 공유 / 그래프 무관 / discovery 즉시) + graph_impact(artifact-graph analyzeImpact 보강). non-gating / verdict ❌. 사용자 (자연어 직접 호출 시): "UC 의존성" / "dep consult" / "어떤 UC끼리 엮였나". S4 (MIS-373).
allowed-tools: Read, Glob, Grep, Bash
---

# discovery-dep-consult

discovery-spec 의 UC 간 의존성을 **결정론 도구**로 산출해 `uc_dependencies[]` 에 기록하는 sub-skill. 사용자의 "지식 그래프로 의존성이 나온다" 를 discovery 시점에 실현하되, 그래프 부재에도 동작하는 하이브리드.

> **결정론 only / verdict ❌** — 의존성은 객관적 산식(공유 참조 / 그래프 영향)이지 통과·차단 판정이 아니다. gate blocking[] inject 금지 (STRONG-STOP / feedback_chain_driver_deterministic_axis). UC 분해·순서 검토 보조.

## 언제 사용

- discovery-spec-compose phase 에서 use_cases 합성 직후 자동 호출.
- 사용자 직접 호출 (의존성 검토 시).

## 동작 (LLM 추론 ❌ — 도구 실행)

`chain-driver/src/dep-consult-cli.js` 를 실행한다:

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/dep-consult-cli.js \
  --spec <project>/.ai-context/output/discovery-spec.json --write
```

- `--graph` 미지정 시 spec 옆 `artifact-graph.json` 자동 탐색.
- `--write` 로 `uc_dependencies[]` 를 discovery-spec 에 병합 기록.
- spec 부재 = **exit 3** (정직 신호 / 추론 대체 ❌). 그래프·UC 부재 = graph_impact degraded (shared_ref 만).

## 2 신호 (하이브리드 C)

| signal | 조건 | grade | discovery 시점 |
| --- | --- | --- | --- |
| `shared_ref` | 두 UC 가 `br_refs`/`api_refs`/source(analysis artifact) 공유 | br·api 공유 SHOULD / source-only FYI | 항상 동작 (그래프 무관) |
| `graph_impact` | artifact-graph 존재 + UC 노드 합성됨 | analyzeImpact 감쇠 등급 | 그래프 있을 때 보강 |

artifact-graph 는 analysis/traceability 합성 후 생기므로 discovery 1차 패스에선 graph_impact 가 degraded 일 수 있다(정직 표기) — shared_ref 가 1차 신호.

## 산출

discovery-spec 의 `uc_dependencies[]` (각 entry: from_uc/to_uc/signal/grade/edge_type?/direction/shared?). reference-lens — chain-coverage 강제 ❌. plan-review-server / dep-graph-navigator 가 표시·탐색에 활용.

## 인용

- discovery-spec.schema.json `uc_dependencies[]` 정합
- chain-driver impact-analyzer (analyzeImpact 재사용)
- DEC-2026-05-28-codegraph-probe-결과 §4.2 (그래프 = reference-lens / gate inject ❌)
- DEC-2026-06-09-scope-carve-3signal-reference-lens (결정론 reference-lens 신호 paradigm)
