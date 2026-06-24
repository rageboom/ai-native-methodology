# DEC-2026-06-24-discovery-enhance-mis373

**결정**: MIS-373 discovery 강화 5슬라이스(S1 난이도 reference-lens / S2 스키마 additive / S3 멀티입력 수렴 / S4 UC 의존성 dep-consult / S5 clarify 패스)를 **≥2 PoC corroboration 완료 후 v0.71.0 으로 본체 격상**. corroboration 과정에서 S4 dep-consult `shared_ref` 가 실 산출물 포맷을 못 읽어 0건을 내던 갭을 발견·수정(closed)하고, `graph_impact` 의 위상 한계는 **옵션 A**(shared_ref 로 커버 / 그래프 신호 보강 보류)로 정직 기록(deferred). reference-lens·verdict ❌·STRONG-STOP 불변. (MIS-373 / discovery 강화)

## 배경

MIS-373 S1~S5 는 `feat(...)` 커밋으로 main 에 머지됐으나 **자체 release·CHANGELOG 항목·DEC 없이 0.70.0(MIS-371 / `DEC-2026-06-24-complexity-tier-fastpath`) 릴리스에 무임승차**한 상태였다. 본체 격상의 전제 게이트 = ≥2 PoC corroboration(§8.1 단일 PoC 과적합 회피).

이번 세션에서 committed example 로 corroboration 을 실측하니(`feedback_codegraph_step_dogfood_examples` — examples/ committed PoC 로 dogfood 가능) 슬라이스별로 갈렸다.

## corroboration 결과

| 대상 | 결과 | 입증 |
|------|------|------|
| **S1 난이도** (`plan-review-server/src/difficulty.js`) | poc-16 10 UC bucket `{M:9,L:1}` + L review item 1 / `degraded:false` | ✅ 실 자산 작동 |
| **S4 shared_ref** (`chain-driver/src/dep-consult.js`) | poc-16 수정 전 **0건** (실제 공유 3쌍 존재) | ❌ → 수정 후 **3건** |
| **S4 graph_impact** | poc-16 0건 (UC↔UC 직접 엣지 부재 위상) | △ 위상 한계 |
| greenfield degrade (graph=null) | `degraded:true` 정직 마커 + shared_ref 산출 | ✅ degrade 경로 |
| modern poc-18 (별개 코드베이스) | shared_ref 0건 (실제 evidence 공유 0쌍) | ✅ precision 유지 |
| **ep-be-gea 35 BC** (사내 / 마스킹 집계) | shared_ref **368건**(33/35 scope 산출) / graph_impact **0** / UC↔UC 직접엣지 **0**(5천+ 엣지 전수 / 위상 체인형 `UC→BHV→AC→TASK→TC→IMPL`) | shared_ref 대규모 recall ✅ / graph_impact 위상 부재 **확정** |

**S4 shared_ref 근본 원인**: `refSet()` 이 스키마에 없는 `br_refs`/`api_refs` 필드 + `source_grounded_evidence` 중 `#` 포함 토큰만 결합 신호로 인식. 그런데 모든 실 PoC(poc-03/08/11/16)는 `br_refs` 미사용 + 베어 `BR-…`/콜론 `sqlmap:…` 포맷(`#` 전무). `dep-consult.test.js` fixture 가 도구 기대 포맷으로 작성돼 4/4 통과하면서 실전 0건을 못 잡은 drift(`feedback_self_recorded_fact_validation`).

## 옵션 (graph_impact 처리)

- **옵션 A (채택)**: shared_ref 만 실 포맷에 맞춰 수정, `graph_impact` 의 UC↔UC 위상 한계는 정직 finding 으로 기록. §8.1 과적합 회피·작고 솔직.
- **옵션 B**: `graph_impact` 를 "공유 analysis 조상" 기반으로 재구현. shared_ref(공유 evidence)와 의미 중복 + 변경 큼. 비채택.
- **옵션 C**: 둘 다 수정 + 한계 명시 병행. 과대. 비채택.

사용자(TF Lead) 결정 2026-06-24: **옵션 A**.

## 결정 (시행)

- **코드**: `dep-consult.js` `refSet()` — evidence 토큰 전체를 정확일치 공유 신호로(베어 `BR-*`→`br:` SHOULD 정규화 / `api|openapi:`→`api:` / 그 외→`src:`). `#` 제약 제거. 하위호환(`br_refs`/`api_refs`) 보존.
- **테스트**: `dep-consult.test.js` 실 산출물 포맷 회귀 케이스 추가(베어 BR 공유 1쌍 SHOULD 단언).
- **문서**: v0.71.0 bump(plugin.json/package.json/CHANGELOG 3-way) + 본 DEC + finding `F-POC15-DC-001`(closed)·`F-POC15-DC-002`(deferred).
- **무변경**: `graph_impact` 코드 / gate evaluator(STRONG-STOP) / 스키마 / discovery-spec `uc_dependencies` 필드.

## 검증

- 단위: `dep-consult.test.js` 5 GREEN(신규 회귀 케이스 포함).
- 실측: poc-16 shared_ref 3 / poc-18 0 / greenfield degrade `degraded:true`.
- release gate: `version-check --plugin context-ops`(3-way) + `test:release` 무회귀 + `build:diff-check` drift 0.

## graph_impact 처분 (rejected / 2026-06-24 추가)

ep-be-gea **35 BC 전수 corroboration**(사내 / 마스킹 집계 / commit ❌)이 graph_impact 잉여를 확정:
- UC↔UC 직접 엣지 = **0** (35 scope · 5천+ 엣지 전수). 위상은 전 scope 동일 체인형(`UC→BHV→AC→TASK→TC→IMPL` + `analysis→*` backward + `TASK→contract:openapi`).
- 즉 graph_impact 는 본 방법론 graph-synthesizer 가 산출하는 artifact-graph 위상에서 **구조적으로 영구 0** — 살릴 신호가 그래프 모델에 부재.
- 동일 35 BC 에서 shared_ref **368건**(33/35 scope) 추출 = UC 결합 표면화 목적을 shared_ref 단독으로 완전 달성.

→ `F-POC15-DC-002` **deferred → rejected** (현 artifact-graph 위상 모델 한정 / 영구 폐기 ❌). graph_impact 코드는 무변경(다른 위상 그래프 입력 시 동작 / `degraded` 마커 정상).
- **재검토 단서**: graph-synthesizer 가 UC↔UC 의존 엣지(예: UC 가 다른 UC output 소비)를 도입하는 위상 변경이 생기면 그 위상 ≥2 PoC corroboration 후 재평가.

## Relates

`project_mis373_discovery_enhance`(설계 SSOT) · `DEC-2026-06-24-complexity-tier-fastpath`(0.70.0 sibling / discovery 입구 강화) · `feedback_self_recorded_fact_validation`(fixture drift) · `feedback_chain_driver_deterministic_axis`(STRONG-STOP) · `DEC-2026-05-28-codegraph-probe-결과` §4.2(reference-lens trust 모델) · `feedback_diagnose_before_design_check_existing`(갭 액면 수용 금지).
