# DEC-2026-06-12-resve-multidomain-corroboration

**상태**: 채택 (corroboration / 버전 bump 없음 — additive skill prose only / breaking 0)
**일자**: 2026-06-12
**유형**: corroboration / §8.1 ratchet — 2-zone 레이아웃 + bc_scope 를 ≥2 도메인(resve 하위 4 BC 추가)으로 실증 + sub-agent schema-fidelity 결함(신규) 표면화
**SSOT runbook**: `<ep-be-gea>/RESVE-DOMAINS-RUNBOOK.md` (resve 하위 도메인 순차 분석 / METHODOLOGY-ADDENDUM)

## 맥락

ep-be-gea campaign 에서 예약(resve) 메뉴그룹의 하위 도메인을 **격리 worktree**(`ep-be-gea-resve-domains` / branch `feat/resve-domains-analysis`)에서 분석. golf 는 다른 CLI 가 진행 중이라 mtrm 부터 helium·healing·hlum·base·athrt 순서로 진행.

본 세션이 새로 분석한 것 = **mtrm(1) + helium·healing·hlum(3 워크플로우 팬아웃)** = 4 BC, 그리고 **base·athrt 2건의 BC-vs-cross-cutting 판정**. 기존 event·golf 와 합쳐 **canonical 카탈로그에 6 BC** 누적.

이로써 `DEC-2026-06-12-artifact-zone` 이 명시한 **"정직 GAP"** — *"디렉토리 zone = 1-domain(BC-EVENT) exercised(degenerate) / bc_scope = 0-datapoint / ≥2 도메인 corroboration 전까지 paradigm·'검증됨' 주장 ❌"* — 의 corroboration 전제가 충족됨. 본 DEC 는 그 GAP 을 데이터로 갱신하고, 병렬 추출 과정에서 표면화된 **신규 결함(sub-agent schema-fidelity)** 을 등재한다.

> §8.1 정합: 단일 PoC 과적합 아님. zone 무충돌·append-only 는 **2 run × 6 BC** 에서 동일하게 재현됐고, schema-fidelity 결함도 **3개 독립 sub-agent run 에서 동형**으로 나타남(구조적).

## 1. 2-zone worktree 무충돌 — **검증됨** (artifact-zone GAP 해소)

artifact-zone DEC §52 GAP "디렉토리 zone 1-domain degenerate" → 본 run 으로 **다중 도메인 + 격리 worktree 무충돌 실증**:

- **shared/ read-only 재사용 입증**: 분석 2회(mtrm run + helium/healing/hlum run) 전 구간에서 repo-wide 8개 산출물(`inventory·architecture·schema·scope-carve·code-graph·recovered-adr·error-mapping-spec·run-manifest`) **SHA-256 byte-identical**(재생성 0). codegraph 는 메인 레포 인덱스를 `--codegraph` 로 read-only 재사용.
- **domains/<BC>/ 격리 write**: 각 BC 가 자기 폴더(`business-rules.json`·`openapi.yaml`·`sql-inventory/`)만 write. 기존 leaf(event·golf·mtrm) **무변경**(checksum 불변).
- **append-only 카탈로그 머지**: well-known top-level(`domain.json`·`business-rules.json` index·`migration-cautions.json`)에 **새 BC 엔트리만 append**. 최종 diff = **raw == `-w`**(공백무시 동일) → 순수 append, reformat noise 0.
  - **단, 전제조건**: append 시 `json.dump` indent 를 **기존 파일과 동일(2-space)** 로 맞춰야 함. 1-space 로 덤프하면 전 파일 reformat → +2622 deletions 의 가짜 diff → append-only 머지 약속 붕괴(병렬 CLI 와 충돌면 폭증). **본 run 에서 1회 발생 후 교정**. → 아래 §시행에 규약화.

**결론**: 2-zone + 격리 worktree 의 "병렬 CLI no-collision" 주장을 **SOFT → 검증됨** 으로 승격(단 indent-match 전제 명시). artifact-zone DEC §52 의 "≥2 도메인 corroboration 전까지 검증됨 주장 ❌" 조건 충족.

## 2. bc_scope — **0-datapoint → 14 datapoint**

artifact-zone DEC: bc_scope 필드는 SOFT·optional 도입됐으나 **0-datapoint**(어떤 live 산출물도 값 미설정). 본 run 에서 migration-cautions 의 preservation caution 에 `bc_scope` 를 실제 부여:

- mtrm 4 + helium 4 + healing 4 + hlum 2 = **14 cautions 에 bc_scope=BC-RESV-\*** 부여.
- 관측: (a) **자동 분리 신뢰성** — 본 run 은 사람(오케스트레이터)이 BC 단위로 명시 부여 → 정확. **자동(validator) 분리는 아직 미실증**(여전히 deferred). (b) **cross_cutting 기본값 타당** — base·athrt 가 실제 cross_cutting 으로 판정(§3)되어, "미지정=cross_cutting 안전 기본값"이 실데이터와 정합.
- **갱신**: bc_scope = 0-datapoint → **14-datapoint(수동 부여 / 4 BC)**. 단 **auto-split·HARD-gate 는 여전히 deferred**(자동 분리 미실증 / F14 불변 유지).

## 3. base/athrt = cross_cutting → resve 내부 cross-cutting zone 규약

bo-only 2개 모듈을 BC-vs-cross-cutting 판정(source-grounded):

- **BC-RESV-BASE → cross_cutting**: 자체 USR_\* 트랜잭션 테이블·aggregate 라이프사이클 없음. `ADM_RESVE_ASSET_BASE`·`ADM_ASSET_RESVE_TIME_LIST`·`ADM_ASSET_RESVE_EXCLSN_TIME_STND_BASE` 공유 자산 마스터를 `RESVE_ASSET_TYPE_CODE`(METRM/ICAST/SGOLF/HEALM/HEALR) 디스크리미네이터로 **전 예약유형 가로질러** 운영. golf/mtrm/helium/healing 이 동일 테이블 read(mtrm 은 일부 CUD).
- **BC-RESV-ATHRT → cross_cutting**: `ADM_ASSET_{COMP,PSTN,DEPT,EMP}_ATHRT_BASE` 자산 접근권한 마스터의 **유일 writer**. golf/helium/healing/mtrm 은 `getAuthorizedReservationAssets` read-only 소비자. 변경 시 mtrm 즐겨찾기(RAF)를 직접 동기화(타 BC 영속 reach-in).

**규약(신설)**: resve 내부 cross-cutting(공유 자산 마스터·접근권한)은 **독립 `domains/<BC>/` 생성 금지** → `output/shared/` 의 reservation-asset-master / reservation-access-authority 공통 산출물로 흡수하고, 각 예약 BC 는 이를 **참조 컨슈머**로 매핑. (현재는 미생성 — shared 흡수 산출물 스키마/슬롯은 carry.)

## 4. sub-agent schema-fidelity 결함 + validate-repair 게이트 (**신규**)

병렬 워크플로우로 BC당 3 sub-agent(domain+BR / openapi / sql) dispatch 시, **agent 산출물이 schema-invalid 한 채로 작성됨**. schema-validator 를 **수동 실행해서야** 검출(미실행 시 invalid 산출물 그대로 ship). 9개 산출물 중 위반 분포:

| 위반 | 발생 | enum/규칙 |
| --- | --- | --- |
| `meta.methodology_version` `v` 누락 ("0.41.0") | mtrm leaf | `^v\d+\.\d+...` |
| `carry_flags` 비-enum ("external-integration"·"BO-FO-boundary") | mtrm sql | enum 8종 |
| external/out-of-scope `confidence > 0.8` | mtrm sql | if(carry_flags⊇external/DBA-read) then ≤0.8 |
| `business_rules[].category` 비-enum ("process"·"concurrency"·"transformation") | helium·hlum leaf | enum 10종 |
| `source_evidence[].type` 비-enum ("sql_update") | helium leaf | enum 17종 |
| `human_review_required[].reviewer_role` 비-enum ("security_reviewer") | hlum leaf | enum 5종 |
| `entities[].persisted_to` = 배열(스키마는 string) | healing domain | type string |
| `aggregates[].invariants[].enforced_by` 비-enum ("sql_predicate") | hlum domain | enum 5종 |
| migration-cautions `affected_scope` 비-enum / `evidence` additionalProperties | (오케스트레이터 작성분) | enum 8종 / closed object |

**근인**: analysis 스킬(prose)이 **enum 제약을 LLM-agent 에게 노출하지 않음**. golf/mtrm 템플릿 미러만으로는 템플릿에 안 나타난 enum 값(category=process 등)을 agent 가 자유 생성.

**중요**: **schema·validator 는 결함 아님** — enum 은 정확했고 9/9 위반을 정밀 검출. 결함은 (a) 스킬 prose 의 enum 미고지, (b) 병렬/worktree 분석 플로우에서 **validate→repair 게이트가 절차로 명시 안 됨**(schema-validator README 는 "skill auto-invoke" 라 하나 multi-agent fan-out 컨텍스트에선 누락되기 쉬움).

**교정(본 run)**: 모든 산출물에 schema-validator 실행 → 위반 enum 을 결정론 매핑으로 repair → **9/9 ✅**. sql-inventory-validator 0 findings, br-cross-consistency 49건 전부 LOW(기존 도메인과 동질). 즉 **validate-repair 게이트가 품질을 실제로 막아줌**(비-공허).

## 시행 (additive / breaking 0 / 버전 bump 없음)

1. **스킬 enum 힌트 추가** (prose only): `analysis-business-rules`(category·source_evidence.type·meta.methodology_version `v`접두·reviewer_role) · `analysis-sql-inventory`(carry_flags enum + external confidence≤0.8) · `analysis-domain-model`(enforced_by enum·persisted_to=string). agent 가 템플릿에 없는 enum 값을 자유 생성하지 않도록 "schema enum 주의" 블록 명시.
2. **append indent-match 규약**: 위 §1 — well-known 카탈로그 append 시 기존 파일 indent(2-space) 유지 의무(reformat-as-append 금지). lifecycle-contract zone 규약에 한 줄.
3. **validate-repair 게이트 명문화**: multi-agent/worktree 분석 후 `schema-validator <domains/<BC>>` + 도메인 validator(sql-inventory/br-cross) 실행 → 위반 repair 를 **per-BC 완료 정의(DoD)** 로. (스킬 "다음" 체이닝에 반영 — carry.)

## STOP / 검증 (데이터 레포 측)

- schema-validator: 9/9 ✅ (3 leaf + 3 sql + domain.json + index + migration-cautions)
- sql-inventory-validator: 3 BC 모두 0 findings
- br-cross-consistency: 49 findings **전부 LOW**(구조 스타일 / event·golf·mtrm 동질 / HIGH·MEDIUM·CRITICAL 0)
- zone: shared 8 repo-wide byte-identical · 기존 leaf 무변경 · diff 순수 append(raw==`-w`)
- 데이터 커밋: `826f7c57`(mtrm) + `3937a9ad`(helium/healing/hlum + base/athrt 판정) on `feat/resve-domains-analysis`

## carry

- **shared 흡수 산출물 신설**: reservation-asset-master(base) + reservation-access-authority(athrt) 를 `output/shared/` 에 둘 스키마/슬롯 정의 + 예약 BC 의 컨슈머 매핑(§3).
- **validate-repair 게이트 자동화**: 스킬 "다음" 체이닝 또는 chain-driver gate 에 analysis-output schema-validate 묶기(§4-3) + 회귀 테스트(explore.js 패턴 = 순수 매핑 로직 분리).
- **bc_scope auto-split**: 수동 14-datapoint 확보 → 자동(validator) 분리 신뢰성은 여전히 미실증(deferred 유지 / F14 불변).
- **버전 bump**: 본 DEC 의 스킬 prose 변경을 release(v0.42.1 PATCH)로 승격할지 = 사용자 결정(release-readiness ceremony 동반).

## 인용

- `DEC-2026-06-12-artifact-zone` — 2-zone 레이아웃 + bc_scope SOFT 도입 + "0-datapoint/1-domain degenerate" GAP (본 DEC 가 corroboration)
- `DEC-2026-06-10-validator-path-convention-unify` §F14 — bc_scope narrow (auto-split·HARD-gate deferred 불변)
- `DEC-2026-06-12-golf-chain-validator-wiring` — 동일 campaign 의 검증기 wiring dogfood (v0.42.0)
- `DEC-2026-06-11-unit-layer-corroboration-poc18` — corroboration DEC 선례(버전 bump 없음 형식)
- schema: `business-rules.schema.json`($defs.businessRule category·source_evidence.type) · `sql-inventory.schema.json`(carry_flags·confidence if/then) · `domain.schema.json`(enforced_by·persisted_to) · `migration-cautions.schema.json`(affected_scope·evidence) · `meta-confidence.schema.json`(reviewer_role)
- skills: `analysis-business-rules` · `analysis-sql-inventory` · `analysis-domain-model`
