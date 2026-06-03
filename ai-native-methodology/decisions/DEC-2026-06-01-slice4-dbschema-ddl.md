# DEC-2026-06-01-slice4-dbschema-ddl

> dep-graph Slice 4 — db-schema 분석 노드를 DDL/migration 파일에 앵커 (접근 C / carry ③). v11.26.0 MINOR.

## 맥락

session 62차 후속 — 사용자 "계속 이어 진행" → dep-graph 남은 carry 중 "DB 스키마 문서 → DDL 연결" 선택. db-schema 노드는 한 번도 코드에 앵커된 적 없음(항상 na / skill 이 `code_pointers=N/A` 명시). 스키마에 추출 DDL 경로를 담는 필드 부재 (단 `tables[].sources` enum 에 `"migration"` 만 기록).

## 결정

접근 C (additive / breaking 0):

1. `db-schema.schema.json` optional top-level `source_files: string[]` (스키마가 추출된 DDL/migration .sql repo-relative 경로 / required 미추가). ERD=diagram_files.erd, live DB·ORM entity 미나열(ORM=domain.json 앵커) — description 제약 (Senior REVISE-2).
2. `graph-synthesizer.js` `ANALYSIS_TO_CODE_POINTERS['db-schema'] = { mode:'file', prefixes:[''], accessor:(d)=>d?.source_files ?? [] }` (business-rules 동형 / existence-gate + CODE_FILE_EXTENSIONS + commit_hash strict_path 스탬프 재사용).
3. skill `analysis-db-schema-erd` step4 + greenfield 절 갱신.

## 근거 (4원칙)

- §1 plan = `.claude/plans/plan-slice4-dbschema-ddl.md`. §2 Senior **GO_WITH_REVISE@0.82** (REVISE-1 schema-validation 우회 사실 / REVISE-2 string[] + description / **CONCERN-D RealWorld A2 redundant**). §3 사용자 승인 "진행 (정직 modest 버전)".
- Senior 사실 검증 (feedback_senior_fact_check_supplement): inferSchemaName($schema_origin→$schema→filename) + RealWorld schema.json($schema\* 부재 → schema.schema.json infer → db-schema.schema.json 미검증) 직접 확인 → "additive vacuously safe" 정직 framing.

## 검증 (no-simulation)

- graph-synthesizer +5 test (139→144) / workspace 1013→**1018** / schema-validator 35/35 / release-readiness **26/26**. additive: source_files 있음·없음 둘 다 valid.
- RealWorld dogfood: BEFORE db-schema na=true → AFTER covered 1 strict_path DDL @ee17e31 / code-pointer covered 6→7·missing 0. evidence = `_dogfood-realworld/.../.aimd/slice4-dbschema-ddl-probe.md`.

## §8.1 (정직 / Senior CONCERN-D 채택)

ship = 메커니즘 + coverage gap 해소 (db-schema 이제 DDL 앵커 가능 = 일반-케이스 독립 가치). **RealWorld A2 가치 = antipatterns(Slice 3)와 같은 DDL 겹침 = redundant → 부풀리기 ❌ / 독립 A2 가치 = ≥2번째 distinct 도메인 carry**. read-class·additive → gate-class 아님.

## 잔여 carry

① source_files `[{path,kind}]` 분해 (2nd 도메인 mixed-kind 입증 시 / REVISE-2 defer) ② ≥2 distinct 도메인 A2 usability ③ FE kinds 앵커 ④ A3 relocation dogfood ⑤ committed↔uncommitted 분해(v11.25.0).

Extends DEC-2026-06-01-a2-worktree-mode.
