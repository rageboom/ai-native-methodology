# plan — ep-be-gea context-ops 최초 정식 적용 (analysis 부터 깨끗하게)

> 목표: ep-be-gea(6307 Java / Spring Boot / 클린아키텍처 지향하나 decay)에 context-ops 를 **최초 정식 적용** — analysis 부터 산출물 생성. 사내 소스 = 외부격리(`ep-be-gea/.ai-context/` / commit ❌).
> scenario = **S2 (AX전환 / 주 타깃)** — legacy 코드 + intent → verified intent → AX 운영 수렴.

## 1. "깨끗하게" 의미 — 현 ad-hoc 정리

| 현 파일 | 정식성 | 처분 |
|---|---|---|
| inventory.json | 손작성 / scope_candidates source=codegraph_measured (pre-v0.26.0 dedup) | **재생성** (source=scope_carve / 정식 pipeline) |
| architecture.json | analysis-architecture skill 절차 / 실 layer / violates_layer 100 | 정식 ✅ 유지 |
| scope-carve.json | 도구 출력 / real_tool | 정식 ✅ 유지 |
| code-graph.json (+logs) | codegraph-runner / real_tool | 정식 ✅ 유지 |

## 2. 대형 전략 (내 v0.25~0.27 자산 적용 = dogfood 의 정식화)

```
[bootstrap] chain-driver init ep-be-gea --scenario S2
[Phase 1 — global backbone / scope 무관 / 1회]
  inventory.json (codegraph stats + module tree + scope_candidates[source=scope_carve])
  code-graph.json ✅ / scope-carve.json ✅ / architecture.json ✅ (재사용)
  schema.json (DB 266 DDL / 3 스키마 admin·user·if / db-assets-always-on)
  findings.md (violates_layer 100 / SCC 137-cycle / decay 등)
[Phase 2 — first feature scope full 11-phase]  ← scope 결단 필요
  scope-carve 가 추천: resve(hotspot 1위) / biztrip(cohesion 깨끗) / external(연계)
  domain·business-rules·openapi·antipatterns·characterization·sql-inventory ...
```

## 3. 핵심 결정 (사용자)
- D1: scenario = S2 (AX전환) 기본 — 확인.
- D2: 첫 feature scope = resve(가장 hot / 손댈 곳) vs biztrip(가장 깨끗 / merge 명확) vs external(연계/if). scope-carve·violates_layer 데이터로 추천.
- D3: 이번 세션 깊이 = global backbone 까지 vs backbone + 첫 scope 일부.

## 4. 이번 세션 = Phase 1 (global backbone)
deterministic 위주 (codegraph·scope-carve 재사용 + inventory 재생성 + schema.json from DDL + findings). 깊은 LLM 분석(domain/BR)은 Phase 2 per-scope.

## 5. 정직 caveat
- scope_candidates·architecture = codegraph-grounded 결정론 생성 (LLM 분석 보완 아니라 결정론 추출 / granularity 선택값).
- schema.json = 266 DDL 정적 추출 (RDB / FK relationship_label).
- 사내 소스 = commit ❌ / 본 plan 은 방법론 repo(.claude/plans) 에 남김.

## Lessons Learned
- (작성 예정)
