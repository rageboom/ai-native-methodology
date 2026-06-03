# DEC-2026-06-01-slice3-antipatterns-dbschema

> v11.24.0 MINOR release SSOT. Living-graph Slice 3 — antipatterns code-pointer enrich + db-schema 파일명 drift fix.
> 상태: **승인 + 시행 완료** (2026-06-01 / session 61차 계속). "진행" → AskUserQuestion "Slice 3" → **Phase 1 정직 평가로 재조정** → AskUserQuestion "antipatterns 앵커 + db-schema 파일명 drift fix". plan `.claude/plans/plan-slice3-antipatterns-dbschema.md`.

## 배경 + Phase 1 정직 재조정

v11.23.0 후속 "나머지 kind 일괄 앵커"를 Phase 1 전수 평가 → 실 yield 작음:

- formal-spec / characterization-spec / state-map / visual-manifest = **code-file 필드 없음** → na 유지가 정직(앵커 불가).
- type-spec / ui-ux / form-validation = `source_file` 보유하나 **RealWorld(BE) 부재** → synthetic test only = speculative carry.
- 실 RealWorld dogfoodable = **antipatterns 뿐**.
- → 재조정: antipatterns 앵커(실측) + **db-schema 파일명 drift fix(진짜 latent 버그)**. "나머지 kind 일괄"은 §8.1 단일 PoC 과적합 + self-referential 점진 도구 강화로 회피 (feedback_self_referential_corrective_drift).

## §2 research (Senior 단일 review + 사실 정정)

- **Senior GO@0.84** (코드라인 cross-check): antipatterns accessor byte-clean / #16 static 무영향 / MINOR 정합 / §8.1 FE carry 옳음.
- ** Senior 사실 정정** (feedback_senior_fact_check_supplement / Senior 권위 ≠ 사실 정합 보증): Senior 는 "db-schema.json producer 0건 → 단일 rename" 권고. broader grep 으로 반증:
  - **CHANGELOG:627** — PoC#15(poc-16) 과거 `schema.json → db-schema.json` 의도적 migration(ANALYSIS_FILENAMES 정합 / 미완성 표준화).
  - **poc-16 artifact-graph.json:9,392** — `input/db-schema.json` source_path 로드 = poc-16 = db-schema.json producer.
  - → ecosystem split (schema.json: skill+poc-01/02/03/14+RealWorld vs db-schema.json: poc-16). 단일 rename = poc-16 깸 → **multi-candidate 가 유일 zero-breakage 해**.

## 결정 — antipatterns 앵커 + db-schema multi-candidate (additive)

1. **antipatterns** (graph-synthesizer.js): `ANALYSIS_TO_CODE_POINTERS.antipatterns = { mode:'file', prefixes:[''], accessor:(d)=>(d?.antipatterns??[]).flatMap(ap=>(ap?.evidence??[]).map(e=>e?.file)) }`. business-rules 동형 / strict_path + commit_hash → A2 schema migration·DDL 변경 탐지.
2. **db-schema multi-candidate**: `cli.js ANALYSIS_FILENAMES['db-schema'] = ['schema.json','db-schema.json']`(첫 존재 채택 / schema.json 우선=canonical) + scan loop string|array 정규화 + `hooks-bridge.js` `'schema.json':'db-schema'` 추가(`'db-schema.json'` 유지). producer 무변경 = 재작업 최소화.
3. db-schema.schema.json = code-file 필드 부재 → 노드는 na 로 로드. **가치 = Tier-1 deliverable 노드가 그래프에 등장**(이전 ABSENT = false topology / Layer-3 cross_ref dangling-prune 해소).

## 검증 (no-simulation / 실 CLI·실 git)

- graph-synthesizer +4 + graph-policy-bridge +1 test. workspace 1003→**1008** / 0 fail / release-readiness **26/26**.
- **RealWorld dogfood** (`--commit-hash ee17e31`): antipatterns na→**covered 1 strict_path DDL** + db-schema **ABSENT→present(na)** / analysis 8→9 / covered **30→31** / na 85 / missing 0 / **glob_no_match 0** / 신규앵커 0 finding.
- **A2 demo**: antipatterns DDL 앵커 baseline=root → content_drift 발화 = A2 schema migration 탐지. evidence = `_dogfood-realworld/.../.aimd/slice3-antipatterns-dbschema-probe.md`.

## STOP-3

workspace **1008/1008** ✅ + release-readiness **26/26** ✅ + skill-citation 0 stale + version 3-way **11.24.0** + breaking 0 = **MINOR**.

## §8.1

antipatterns = read-class·additive (Slice 2 동급) / db-schema fix = correctness. gate-class 아님. 단일 RealWorld = mechanism 입증(antipatterns 1 anchor = 작음). FE kinds 앵커 = 실 FE dogfood carry / formal-spec·characterization·state-map·visual-manifest = code-file 필드 부재 영구 na.

## carry

1. FE kinds(type-spec/ui-ux/form-validation source_file) 앵커 = 실 FE 프로젝트 dogfood 시 (Type 2 / FE-dogfood 연계).
2. db-schema → DDL 앵커 (schema 에 source 필드 추가 = 접근 C / A 가치 입증 후).
3. ≥2 distinct domain A2 usability corroboration (gate-class).

## paradigm 정합

- **정직 재조정** — chosen agenda("나머지 kind 일괄")의 실 yield 를 Phase 1 에서 정직 평가 → 과적합 범위 축소 (self-referential drift 회피).
- **Senior 사실검증 보강** — Senior GO 의 전제(db-schema.json producer 0건)를 broader grep 으로 반증 → 단일 rename→multi-candidate 정정 (LL-fsim-11).
- **재작업 최소화** — multi-candidate 가 producer(skill/poc-16) 무변경으로 양 convention 흡수.
- **no-simulation** — 실 git·실 CLI·실 그래프 / persona ❌.
  Extends DEC-2026-06-01-slice2-codepointer-enrich.
