# plan — Slice 4: db-schema → DDL 앵커 (접근 C / carry ③)

> 4원칙 §1. 사용자 승인(§3) 후 착수. session 62차 후속 — 사용자 "DB 스키마 문서 → DDL 연결" 선택.

## 목표 (1줄)

db-schema 분석 문서가 지금 어떤 코드에도 연결 안 됨(na). 실제 DDL/migration 파일(.sql)에 앵커 → DDL 바뀌면 db-schema 노드가 drift 로 잡힘 (A2 가 schema 정의 변경 탐지 / db-schema 가 의미상 DDL 의 owner).

## 현 상태 (깊은 숙지)

- `db-schema.schema.json`: top-level `additionalProperties:false` / required=`[meta,tables]`. 기존 필드 = meta·database_type·schema_name·tables·stored_procedures·views·consistency_report_file·diagram_files. **DDL 파일 경로를 담는 필드 없음.** 단 `tables[].sources` enum 에 `"migration"` 존재(= DDL 에서 추출됨을 기록하나 파일 미지정).
- `graph-synthesizer.js` `ANALYSIS_TO_CODE_POINTERS` (L253-297): kind→{mode,accessor,prefixes?}. db-schema 미등록 → `deriveAnalysisCodePointers` 가 anchor 0 → `defaultNaForIntentNodes` 가 na 처리. node id=`analysis-db-schema` / 분석객체 key=`'db-schema'` (cli.js `ANALYSIS_FILENAMES['db-schema']=['schema.json','db-schema.json']`).
- skill `analysis-db-schema-erd/SKILL.md` L55: "code_pointers = N/A" 명시 (현 상태) → 본 작업이 해소.
- RealWorld `schema.json`: 7 tables 전부 `sources:["migration"]` (= V1__create_tables.sql 에서 추출). DDL 실파일 = `src/main/resources/db/migration/V1__create_tables.sql` 존재. `source_files` 필드 없음.
- template = `templates/analysis/db-schema.template.md` (1). poc schema.json = 4 (전부 source_files 없음 → additive optional 이면 valid 유지).

## 설계 (접근 C / additive / breaking 0)

1. **schema** — `db-schema.schema.json` top-level **optional** `source_files`: `{ type:'array', items:{type:'string'}, description:'스키마가 추출된 DDL/migration 파일의 repo-relative 경로 (dep-graph 앵커 + A2 DDL 변경 탐지 / 미DDL 출처는 비움)' }`. required 에 미추가 → 4 poc + RealWorld 무회귀.
2. **synthesizer** — `ANALYSIS_TO_CODE_POINTERS` 에 `'db-schema': { mode:'file', prefixes:[''], accessor:(d)=>d?.source_files ?? [] }` 추가. → strict_path + commit_hash 스탬프 → A2 참여. `.sql` ∈ CODE_FILE_EXTENSIONS ✓ / `.mmd`(erd) 등 비코드 = 확장자 게이트 skip / 미존재 = existence-gate skip → 0 해소 시 na.
3. **skill** — `analysis-db-schema-erd/SKILL.md`: step4 schema.json 예시에 `source_files` 추가 + 지시("DDL/migration 파일에서 추출 시 그 repo-relative 경로를 `source_files` 에 나열 → dep-graph 앵커 + A2 가 DDL 변경 탐지 / 기존 N/A 해소"). L55 greenfield 절 = "DDL 부재 → source_files 비움 → na 유지" 정직 갱신.
4. **template** — `db-schema.template.md` 에 source_files 예시 1줄 (있으면).

### 의도적 scope (재작업 최소화)
- `source_files` = **DDL/migration 정의 파일 한정** (.sql). ORM entity(.java/.ts)는 domain.json evidence 가 이미 앵커 → 중복 회피로 db-schema scope-out. erd .mmd = 확장자 게이트가 자동 skip(코드 아님). live operational_db = 파일 없음 → 미나열.
- 단일 string[] (kind 분해 ❌ — `tables[].sources` 가 이미 kind 기록 / Senior 과적합 회피 정합).

## 검증 (no-simulation)
- graph-synthesizer **+≥3 test**: db-schema source_files → strict_path 앵커 / source_files 부재 → na / .sql 외 확장자(.mmd) skip / commit_hash 스탬프 / existence-gate(미존재 skip). 기존 6 kind 무회귀.
- schema additive 무회귀: 4 poc + RealWorld schema.json (source_files 없음) 여전히 schema-valid.
- RealWorld dogfood (외부 repo / 실 git): probe schema.json 복사본에 `source_files:["src/main/resources/db/migration/V1__create_tables.sql"]` 추가(실파일 존재) → 재합성 → db-schema 노드 **na→covered 1 strict_path DDL @commit_hash** / A2 demo(DDL 앵커 → content_drift 탐지). **정직**: RealWorld 선 Slice 3 antipatterns 가 이미 같은 DDL 앵커 = A2 탐지 일부 겹침 / db-schema = 의미상 owner + 일반(antipatterns-DDL 없는 프로젝트)엔 독립 가치. field 채움은 skill 책임(지시 추가) / probe 는 hand-populate(synthesizer 앵커 메커니즘 실증).
- evidence = `_dogfood-realworld/.../.aimd/slice4-dbschema-ddl-probe.md`.

## §8.1 (정직)
read-class·additive·결정론 infra (Slice 2/3 동급) → gate-class 아님. 단일 RealWorld = mechanism 입증 (RealWorld 앵커는 antipatterns 와 겹침 / 과대표기 ❌). ≥2 distinct 도메인 A2 usability = carry 유지.

## STOP-3
workspace 1013→+N pass + release-readiness 26/26 + skill-citation 0 stale + version 3-way + breaking 0 = MINOR (v11.25.0→v11.26.0).

## Lessons Learned (실패 시)
(미발생)
