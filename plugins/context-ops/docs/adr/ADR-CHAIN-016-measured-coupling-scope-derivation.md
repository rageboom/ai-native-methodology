# ADR-CHAIN-016 — 측정 기반 scope 도출 (decayed-architecture / advisory)

- 상태: 승인됨 (Accepted) — 사용자 결단 D1~D5 (2026-06-09)
- **결정 시각**: 2026-06-09
- **연관 결정**: DEC-2026-06-09-measured-coupling-scope-derivation
- **연관 트리거**: ep-be-gea (Spring Boot, 6307 Java, 클린아키텍처 *지향*하나 decay) analysis 점검
- **연관 schema**: schemas/inventory.schema.json (`scope_candidates` 신설 + `modules_for_priority_analysis` coupling 보강)
- **연관 skill**: analysis-source-inventory (scope 도출 단계) / analysis-code-graph (coupling 집계 + 위반 라우팅)
- **버전**: v0.25.0 MINOR (additive)

## Context

대형·복잡 코드베이스의 최초 analysis 는 단일 패스 불가 — 방법론은 `scope` 단위로 슬라이스해 분석한다(work-unit-manifest.scope). scope 절취선을 어떻게 긋느냐가 분석 품질을 좌우한다.

기존 `modules_for_priority_analysis` 는 "LOC/파일 수 기준 큰 모듈 또는 핵심 도메인 **추정**" — 즉 **명목 패키지 트리**를 절취선으로 가정한다. 트리거 프로젝트(ep-be-gea) 실측이 이 가정을 반증했다:

- 구조 = `core/<BC>/<feature>/{domain,application,infrastructure}` — 클린아키텍처 + feature-slice 지향.
- 그러나 **decay 실측**: domain→infrastructure/application 역참조 45건 / frontoffice↔backoffice 교차 import 514건(123 고유 클래스).
- 누수가 **feature 축 정렬**: frontoffice/biztrip↔backoffice/biztrip 등 — front/back office 의 *같은 feature 가 한 업무의 두 얼굴*. 진짜 응집 단위 = **feature-across-BC**.
- 결론: **명목 패키지 트리(BC/레이어) ≠ 실제 응집(feature).** LOC 추정으로 scope 를 끊으면(backoffice 1843 = 큰 모듈이지만 scope 단위 아님) decayed-architecture 에서 오답.

기존 자산 정밀 대조(diagnose-before-design): `analysis-code-graph`(CodeGraph OSS)는 존재하나 **"측정→scope 도출"로 배선 안 됨** — symbol 단위 수동 질의 + reference-lens 일 뿐. `dep-graph-navigator`/`context-federator`는 artifact-graph(산출물 *후*) 용도. = 도구는 있는데 갭.

## 산업 선례 (research grounded / 5/5 지지)

- **CodeScene temporal-coupling**: "layered architecture will lead you to exactly those expensive change patterns" — 명목 레이어가 아니라 실측 coupling 이 진짜 응집을 폭로. 도구출력 = 진단신호(advisory).
- **Vertical Slice Architecture (Bogard)**: "minimize coupling between slices, maximize coupling in a slice, couple along the axis of change." feature 가 layer/BC 관통 = 정상.
- **dependency-cruiser severity**: 같은 도구가 warn(advisory)/error(enforced) 분리 → codegraph→warn=advisory 동형.
- **advisory vs authoritative**: 학술(Koschke)·상용(vFunction) 모두 클러스터링 출력 = 제안(advisory)→사람 승인이 표준.
- ⚠️ **Louvain/Leiden community detection**: SW 아키텍처 적용은 연구 단계 → "업계 표준" 인용 ❌. **"coupling 측정 기반 경계 도출" 일반 원칙으로만** 인용 (과장 회피 / research-fact-validation).

## 결정 (Decision)

대형/decayed 코드베이스의 analysis scope 후보를 **codegraph 실측 coupling 의 결정론 집계**로 도출한다. 3원칙:

### 1. 패키지 경로 ≠ 경계, 측정된 coupling = 경계
`analysis-code-graph` 의 code-graph.json edge 를 모듈간 coupling 행렬로 **결정론 집계**(LLM 추정 ❌ / 단순 정적 의존성 집계 — 특정 community-detection 알고리즘 미주장). 고결합 쌍 = 응집 클러스터 후보 → `inventory.json#scope_candidates[]`. members 는 명목 BC 경계를 관통할 수 있음.

### 2. scope 후보 = advisory (reference-lens)
codegraph 출력은 **어떤 gate 에도 inject ❌ / 최종 scope 절단은 사용자 결단** (DEC-2026-05-28 §4.2 codegraph trust 모델 + feedback_chain_driver_deterministic_axis + dependency-cruiser severity=warn 선례). `scope_candidates[].source` = codegraph_measured | loc_estimate | manual 로 trust provenance 정직 표기. codegraph 환경 부재 시 loc_estimate fallback + meta.warnings (no-simulation / codegraph_measured 표기 ❌).

### 3. 경계 위반 = 1급 산출물
의존성 규칙 위반(domain→infra 역참조, feature 축 벗어난 교차참조)은 버그가 아니라 분석 가치 출력 → **antipatterns.json(category=ARCH) + migration-cautions.json + finding** 3곳 라우팅. decay 정도는 `decay_grade`(clean/moderate/entangled / legacy-spectrum 정합)로 §3-A 자동화 천장 보정(정직 하향 / over-claim ❌).

## 적용 절차 (대형 코드베이스 — backbone-first)

```
[0] 글로벌 inventory       : 전 repo 파일/모듈 지도
[1] 글로벌 codegraph 실측   : coupling 행렬 → scope_candidates 도출 + 경계위반 hotspot  ← 본 ADR 핵심
[2] 글로벌 backbone 분리    : ⓐ DB(schema.json / db-assets-always-on / ADR-CHAIN-014)
                              ⓑ shared-kernel = Martin afferent-hub(공통 유틸/코드: cache·base·utils 등)
                              → backbone = scope 아님 / 1회 분석 / 모든 scope 가 참조 (role=backbone)
[3] scope = 측정 feature 클러스터 단위 full 11-phase (advisory → 사용자 soft gate #0 절단)
```

### shared-kernel factoring 규칙 (backbone-first 핵심)

- **규칙**: afferent-hub(Martin Ca 높음 = 만물이 의존) + DB-adjacent 공통 코드는 **개별 scope 가 아니라 global backbone** 으로 빼고 1회 분석. `inventory.json#scope_candidates[].role=backbone` 로 표식.
- **근거 (paradigm-grounded)**: Martin "hub 를 쪼개면 파편화" + DDD shared-kernel + 기존 db-assets-always-on(DB 이미 backbone) 동형 확장. backbone 을 빼면 **feature 간 결합이 급감**(feature 의 external coupling 상당분이 kernel 행) → feature 가 깨끗한 scope 로 분리됨 (Vertical Slice "slice 간 결합 최소").
- **정직 carry (§8.1)**: "external coupling 의 kernel 비중 %"는 ep-be-gea 1-PoC 실측(81~88%) — **일반 임계 수치 미주장** / ≥2 distinct 도메인 corroboration 후 확정. 규칙(hub→backbone) 자체는 paradigm-grounded 로 codify.

## Consequences

- (+) decayed-architecture 에서 scope 절취선 오답 회피 — 측정 기반.
- (+) 경계 위반이 누락 대신 1급 산출물로 흡수 = 분석 가치 증대.
- (+) advisory 설계 → trust 모델 위배 0 / gate 무영향 (저위험 격상).
- (−) codegraph 환경 의존 — 부재 시 loc_estimate fallback (정직 degrade).
- carry: **§8.1 단일 PoC 과적합** — 트리거 = ep-be-gea 1 PoC. 설계 자체는 paradigm-grounded(5 외부 선례)라 advisory 격상은 정당하나, **"자동화 천장 수치"는 ep-be-gea 실측 전 미주장**. poc-17 + ep-be-gea ≥2 corroboration 후 천장 보정 수치 확정.

## 인용
- 결단: DEC-2026-06-09-measured-coupling-scope-derivation (D1~D5)
- 관련: ADR-CHAIN-014(db-assets-always-on) / ADR-FE-003(legacy-spectrum) / DEC-2026-05-28-codegraph-probe-결과(trust §4.2) / DEC-2026-05-30-codegraph-essential
- memory: feedback_diagnose_before_design_check_existing / feedback_chain_driver_deterministic_axis / feedback_research_fact_validation / feedback_quality_priority(§8.1)
