# ADR-CHAIN-017 — BC verdict 결정론 분류 (write_ops 판별 / gate#0 fail-closed)

- 상태: 승인됨 (Accepted) — 사용자 결단 (2026-06-15)
- **결정 시각**: 2026-06-15
- **연관 결정**: DEC-2026-06-15-bc-verdict-classification
- **연관 트리거**: ep-be-gea (Spring Boot, MyBatis/MSSQL) `.ai-context` 점검 — athrt/base 이중분류 + read-only BC(EMPLOYEE rd66/wr0·RESV-HLUM·BATCH-BIRTHDAY) per-BC 누수
- **연관 schema**: schemas/domain.schema.json (`bounded_contexts[].verdict`+`verdict_basis` / required 승격) · schemas/{bc-scope,findings-analysis}.schema.json (schema-less 해소)
- **연관 skill**: analysis-domain-model (§7-1 verdict 자동 emit 의무) · analysis-source-inventory (verdict 입력 = sql-inventory)
- **연관 도구**: tools/verdict-consistency-validator (VC1~VC4) · tools/chain-driver/gate-eval · tools/findings-aggregator
- **버전**: MINOR (additive)

## Context

BC 분류(core / supporting / cross_cutting / read_model / operational)는 분석 품질의 1급 결정이나, 결정론·강제된 단계 없이 scope-carve(reference-lens, gate inject ❌)의 domain-model 판단 + soft gate#0 사람 확정에 **흩어져** 있었다. `domain.json#bounded_contexts[]` 에 분류를 담는 필드가 부재 → 기계가 core ↔ cross-cutting 을 가를 수 없었다.

ep-be-gea dogfood 에서 이 흩어짐이 2건의 구조적 결함을 노출:

- **이중분류**: `athrt`/`base` 가 cross-cutting(2026-06-12) → per-BC(`BC-RESV-ATHRT`/`BC-RESV-BASE`, 2026-06-14) 로 승격됐는데 옛 cross-cutting 쌍둥이(`shared/cross-cutting/{athrt,base}/`)가 안 지워져 한 개념이 양쪽 등재.
- **read-only BC 누수**: `BC-EMPLOYEE`(rd66/wr0)·`BC-RESV-HLUM`(read-model)·`BC-BATCH-BIRTHDAY`(batch)가 **소유 쓰기 aggregate 0인데 per-BC 등재**.

판별 근거는 이미 산출물에 있었다 — `sql-inventory summary.by_type` 의 `insert+update+delete = write_ops`. 신규 추출 0(기존 데이터 재사용). 35 BC 전수 적용 시 core 26 / supporting 6 / write_ops==0 3 → **32/35 가 주관 0으로 결정론 분리**.

## 산업 선례 (research grounded)

- **DDD bounded-context 분류**: core / supporting / generic subdomain 구분은 표준 — 본 ADR 은 "쓰기 소유"라는 **결정론 proxy** 로 그 구분을 기계화(추정 ❌).
- **read-model / CQRS**: 읽기 전용 투영(read_model)은 쓰기 aggregate 를 소유하지 않는다 = write_ops==0 신호와 정합.
- **dependency-cruiser severity (ADR-CHAIN-016 동형)**: 같은 검사가 advisory(warn) / enforced(error) 분리 → 기본 advisory + `--enforce` HARD 동형.
- **fail-closed 게이트**: 분류 모순(이중등재·verdict↔write_ops 불일치)을 분석 전이에서 STOP 시키는 것이 누락 후 사후검증보다 안전.

## 결정 (Decision)

BC verdict 를 **소유 쓰기 aggregate(write_ops) 기반 결정론 판별**로 채택하고, gate#0 에서 fail-closed 로 강제하며, cross-cutting 은 단일 home 만 갖도록 한다.

### 1. verdict = write_ops 결정론 판별

`domain.json#bounded_contexts[].verdict` ∈ `{core, supporting, cross_cutting, read_model, operational}` 를 신설(additive)하고 `verdict_basis`(write_ops / read_ops / owned_aggregates / decided_by) 로 재현 근거를 동반한다. 규칙:

- `write_ops > 0` → `core | supporting` (소유 쓰기 aggregate 보유 = per-BC, `domains/<BC>/`)
- `write_ops == 0` → `cross_cutting | read_model | operational` (최종택 = fan-in·역할 human-override, `decided_by=rule|human-override`)

`verdict_basis.write_ops` 는 **실제 `sql-inventory summary.by_type` 와 일치**해야 한다(basis ≠ 실제 = HARD). `analysis-domain-model` 스킬 §7-1 이 sql-inventory 에서 verdict+basis 를 자동 산출(의무·required 필드)한다.

### 2. gate#0 fail-closed 강제

`tools/verdict-consistency-validator/`(VC1 미등록 / VC2 verdict↔write_ops 모순·needs-verdict / VC3 이중분류 / VC4 stale concern)를 analysis gate#0 의 REQUIRED validator 로 등록한다. gate-eval · findings-aggregator 양쪽 `REQUIRED_VALIDATORS_PER_STAGE['analysis']` 와 `flows/analysis.phase-flow.json` gate#0 validators 를 sync(6종). 기본은 advisory(high→medium 비차단)이나 `--enforce`(또는 `CONTEXT_OPS_VERDICT_ENFORCE=1`) 시 high 유지 → **HARD STOP(fail-closed)**. findings-aggregator 가 `buildValidatorArgs` 양 경로에서 `--enforce` 를 전달해 gate#0 enforce 를 배선한다. 도메인 샤딩 산출물이 아닌 비-샤딩 PoC(`domains/` 부재)는 `info` N/A 로 비차단(타 세션 게이트 영향 0).

### 3. cross-cutting 단일 home

`cross_cutting` verdict 의 BC 는 **소유 쓰기 aggregate 가 없으므로 per-BC 샤드를 갖지 않는다**(불변식: `cross_cutting ⟺ 샤드 없음`). cross-cutting 기능은 단일 home `shared/cross-cutting/<module>/` 에만 등재한다. 한 개념이 per-BC 와 cross-cutting 에 동시 등재(이중분류)되면 VC3 가 HARD 로 차단 → athrt/base 류 재발 방지.

### 4. tier 명시 선언 + 산출물 무결성 lane

BC 분석 깊이(`tier` = `baseline|characterized|full-leaf`)는 `domain.schema.json#bounded_contexts[].tier`(optional)에 **명시 선언**한다. validator 의 C4 lane 은 **선언 tier 의 mandatory 산출물 보유만 advisory(low) 검사**하고 미선언 BC 는 skip — **파일 유무로 tier 를 추론하지 않는다**. 추론 방식은 `use_cases`-backfill leaf(`domain.json` 1개)를 full-leaf 로 오판해 거짓 미충족을 냈으나(프로젝트-로컬 포크 `verify.mjs` 의 결함), 명시-tier 로 구조적으로 차단. 더불어 C5 lane 이 `business-rules.json`(canonical) + `business-rules/` dir 동시 존재(stale 중복 표현)를 high 로 차단한다. 이 두 lane 으로 과거 프로젝트가 별도 유지하던 whole-tree integrity 포크를 canonical validator 로 흡수 — 포크 드리프트 제거. (`$schema_origin` resolve 검사(C1)는 `$schema_ref` basename 컨벤션이 무력화하므로 별도 lane 으로 두지 않고 컨벤션 가드로 대체.)

## 적용 절차

```
[1] analysis sql-inventory — BC 별 summary.by_type (write_ops/read_ops) 산출 (선행)
[2] analysis-domain-model — bounded_contexts[].verdict + verdict_basis 자동 emit (§7-1, required)
[3] gate#0 — verdict-consistency-validator (VC1~VC4)
      ├ advisory(기본) : high→medium surface, 비차단
      └ --enforce      : high 유지 → HARD STOP (이중분류·verdict↔write_ops 모순 차단)
[4] cross-cutting 은 shared/cross-cutting/<module>/ 단일 home (per-BC 샤드 ❌)
```

**§8.1 carry**: verdict 판별의 결정론 신호(write_ops)는 ep-be-gea 1-PoC(MyBatis/MSSQL 단일 스택) dogfood — 비-XML SQL 경로(jdbcTemplate/@Query/Prisma/TypeORM)에서의 write_ops 추출 정합은 ≥2 distinct 스택 corroboration 후 재확인. 규칙(쓰기 소유 → core/supporting) 자체는 paradigm-grounded(DDD subdomain) codify.

## Consequences

- (+) 분류가 "흩어진 판단"에서 **domain-model 산출물 + write_ops 결정론 근거 + gate 강제**로 승격 → athrt/base 이중분류·read-only 누수를 분석 전이에서 자동 차단(STOP).
- (+) 35 BC 중 32/35 가 주관 0으로 결정론 분리(나머지 3 = write_ops==0 의 cross_cutting/read_model/operational 최종택만 human-override).
- (+) `verdict` required 승격 → verdict 부재 산출물은 schema-validator 단계에서 차단(점진 권장 → 의무).
- (+) 기본 advisory 설계 → 병렬 dogfood 타 세션 게이트 영향 0 / `--enforce` 시만 HARD (저위험 격상).
- (−) write_ops 신호는 sql-inventory 정확도에 의존 — MyBatis XML 외 경로는 정직 carry(§8.1).
- backward-compat: 신규 schema 2종(bc-scope·findings-analysis)은 permissive(`additionalProperties` 허용) → 기존 인스턴스 무효화 ❌.

## 인용
- 결단: DEC-2026-06-15-bc-verdict-classification (verdict 어휘·write_ops 판별·gate#0 enforce·cross-cutting 단일 home)
- 관련: ADR-CHAIN-016-measured-coupling-scope-derivation(scope-carve reference-lens — verdict 는 그 advisory carve 위에 결정론 분류 강제를 얹음) / ADR-CHAIN-014(db-assets-always-on) / DEC-2026-06-06-analysis-exit-gate(gate#0 모) / DEC-2026-06-12-parallel-bc-accumulator-rollup(샤딩) / DEC-2026-06-12-sql-inventory-extractor(write_ops 입력 SSOT)
- memory: feedback_strict_exposes_drift / feedback_diagnose_before_design_check_existing / feedback_quality_priority(§8.1) / feedback_research_fact_validation
