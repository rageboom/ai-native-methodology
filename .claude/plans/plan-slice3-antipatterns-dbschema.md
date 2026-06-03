# plan — Living-graph Slice 3 (재조정): antipatterns 앵커 + db-schema 파일명 drift fix

> carry: C-codepointer-analysis-aspect-enrich 후속 (Slice 3) — 단, Phase 1 정직 평가로 **재조정**.
> 작성: session 61차 (계속) / 2026-06-01 / "진행" → AskUserQuestion "Slice 3" → Phase 1 정직 평가 → AskUserQuestion 재조정 "antipatterns 앵커 + db-schema 파일명 drift fix".

## 0. 한 줄 요약 + 재조정 근거

"나머지 kind 일괄 앵커"는 Phase 1 정직 평가 결과 실 yield 가 작음: antipatterns 만 RealWorld dogfoodable(1 anchor) / formal-spec·characterization·db-schema·state-map·visual-manifest = code-file 필드 없음(na 유지 정직) / type-spec·ui-ux·form-validation = FE source_file 보유하나 RealWorld(BE) 부재 = speculative. 대신 **antipatterns 앵커(실측) + db-schema 파일명 drift fix(진짜 latent 버그)** 로 재조정.

## 1. Phase 1 깊은 숙지 결과 (전수 확인)

- **antipatterns**: `antipatterns[].evidence[].file` (full repo-relative path / 예: `src/main/resources/db/migration/V1__create_tables.sql`). `.sql`=code 확장자. RealWorld antipatterns 노드 = active/na/0 → 앵커 가능. distinct evidence file = **1개**(DDL). 같은 mechanism = business-rules.
- **db-schema 파일명 drift (진짜 버그)**: 산출물 canonical 출력명 = `schema.json` (skill `analysis-db-schema-erd` + poc-01/02/03/14 output/db/schema.json + RealWorld output/schema.json). 그러나 builder `ANALYSIS_FILENAMES['db-schema']='db-schema.json'` (cli.js:28) + hooks-bridge `'db-schema.json':'db-schema'` (hooks-bridge.js:107) → **db-schema 노드가 어떤 그래프에도 안 로드** (RealWorld 그래프 db-schema ABSENT 확인). `db-schema.json` = poc-16 **input** 일 뿐(analysis output 아님) → rename 으로 깨지는 output 0.
- **db-schema.schema.json**: code-file 필드 없음 (`tables[]` 구조 / source/file/path/evidence 부재) → db-schema 노드는 로드돼도 **na** (앵커 X). fix 가치 = 노드가 그래프에 **나타남**(현재 누락) = Tier-1 deliverable correctness.
- **#16 무영향 확인**: release-readiness #16 = `POC05_GRAPH_PATH` static committed 그래프 read (재합성 X) + poc-05 schema.json 부재 → fix 무영향 (Slice 2 동형).

## 2. 설계 (additive / graph-synthesizer.js + cli.js + hooks-bridge.js)

### 2.1 antipatterns 앵커 (graph-synthesizer.js)

`ANALYSIS_TO_CODE_POINTERS` 에 추가:

```
antipatterns: { mode:'file', prefixes:[''], accessor:(d)=>(d?.antipatterns??[]).flatMap(ap=>(ap?.evidence??[]).map(e=>e?.file)) }
```

- prefixes=[''] (evidence file = 이미 full repo-relative / resource-prefix 불요). business-rules 와 동형. strict_path + commit_hash 스탬프 → **A2 가 DDL/schema migration 변경 탐지** (실 P0 가치).

### 2.2 db-schema 파일명 drift fix (multi-candidate / Senior 사실 정정 후 rename→multi-candidate 전환)

- **Senior GO(@0.84)는 "db-schema.json producer 0건 → 단일 rename" 전제였으나, broader grep 으로 반증** (`feedback_senior_fact_check_supplement` / Senior 권위 ≠ 사실 정합 보증):
  - **CHANGELOG:627**: PoC #15(poc-16) 가 과거 `schema.json → db-schema.json` **의도적 migration**(ANALYSIS_FILENAMES 정합) — 미완성 표준화(skill·타 PoC 미반영).
  - **poc-16 artifact-graph.json:9,392**: `input/db-schema.json` 을 source_path 로 로드 = **poc-16 은 db-schema.json producer**.
  - → ecosystem split: schema.json(skill+poc-01/02/03/14+RealWorld) vs db-schema.json(poc-16). **단일 rename = poc-16 re-synth 깸 / db-schema.json 유지 = 나머지 미로드** → **multi-candidate 가 유일 zero-breakage 해**.
- `cli.js:28` `'db-schema': 'db-schema.json'` → `'db-schema': ['schema.json', 'db-schema.json']` (schema.json 우선=canonical skill output / db-schema.json fallback=poc-16 compat) + scan loop 을 string|array 정규화(첫 존재 채택). 다른 kind 는 string 유지.
- `hooks-bridge.js:107` — `'db-schema.json': 'db-schema'` **유지** + `'schema.json': 'db-schema'` **추가** (둘 다 db-schema 매핑 / zero-breakage).
- 재작업 최소화(2순위): producer(skill/poc-16) 무변경 — multi-candidate 가 양 convention 흡수.

## 3. 테스트 계획

- **graph-synthesizer.test.js** (+~3): ① antipatterns evidence[].file → strict_path 앵커 + na 미설정 ② antipatterns 확장자외(없는 file) → na ③ antipatterns commit_hash 스탬프(A2 참여).
- **cli.test 또는 builder.test** (db-schema 파일명): schema.json 이 db-schema kind 로 로드됨 검증 (또는 ANALYSIS_FILENAMES 단언). hooks-bridge 가 test 있으면 schema.json→db-schema 매핑 단언.
- 회귀: 기존 graph-synthesizer/validator test 무회귀.

## 4. dogfood (no-simulation / 실 CLI·실 git)

- RealWorld 재합성(`--repo-root <RW> --commit-hash ee17e31` / probe dir):
  - **antipatterns** na→covered (1 strict_path DDL anchor / commit_hash 스탬프 → A2 참여).
  - **db-schema** ABSENT→present (analysis 8→9 / schema.json 로드 / na = code-file 필드 없음 정직).
  - coverage covered 30→31 / na 85→? (db-schema na +1 → 86) / missing 0 / glob_no_match 0.
- A2 demo (선택): antipatterns DDL 앵커 baseline=root → content_drift 발화 (DDL 변경 탐지).

## 5. §8.1 / 정직

- antipatterns = read-class·additive (Slice 2 동급) / db-schema fix = correctness 버그 수정. gate-class 아님 → MINOR(또는 PATCH? — feature 추가 antipatterns + bug fix db-schema = MINOR 적정). 단일 RealWorld 도메인 = mechanism 입증.
- 정직 표기: antipatterns RealWorld 앵커 = **1개**(작음 / 과대표기 ❌). db-schema = na 로 로드(앵커 아님 / 노드 존재 correctness).
- speculative FE 앵커 = **carry** (실 FE 프로젝트 dogfood 시 / Type 2 / FE-dogfood 연계).

## 6. STOP-3

workspace test +N green / release-readiness 26/26 (#16 static 무영향) / skill-citation 0 stale / version 3-way bump (11.23.0 → 11.24.0 MINOR) / breaking 0.

## 7. carry (이 슬라이스 후)

- FE kinds 앵커 (type-spec/ui-ux/form-validation source_file) = 실 FE 프로젝트 dogfood 시 (speculative 회피).
- db-schema → DDL 앵커 (schema 에 source 필드 추가 = 접근 C / A 가치 입증 후).
- formal-spec/characterization/state-map/visual-manifest = code-file 필드 부재 = 영구 na (정직 / 앵커 대상 아님).

## 8. Lessons Learned

- (착수 후 채움 / Phase 1 정직 평가로 chosen agenda scope 축소 = self-referential drift 회피 사례 후보)
