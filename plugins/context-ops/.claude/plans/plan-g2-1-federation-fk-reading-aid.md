# plan — G2-1: federation FK 읽기-aid (table↔table 위상 reference-lens 노출)

> DEC-2026-06-08 갭 2 잔존 carry G2-1 시행. **상태: 시행완료 (2026-06-08 / 미릴리스)**. 검증 = federator 34/34(+2) + poc-16 실 dogfood(FK 2건) + cache schema-valid + release-readiness 40/40 무회귀. 버전/CHANGELOG = merge/release 시.
> 한 줄: federator `data_refs[].dependent_tables[]` 에 그 테이블의 **FK 관계**(references_table·relationship_label)를 reference-lens 로 추가 노출 → "어느 테이블이 어느 테이블을 참조하나(table↔table 위상)" 를 운영 컨텍스트에서 회수 가능. **결정론·non-gating·additive.**

## 1. 깊은 숙지 (코드 실측)

- **현재**: `buildDataRefs`(federator.js:202-240) 가 `dependent_tables[]` 를 `{name, columns[]}` 로 만들 때 `dataSource.tableByName.get(t)?.columns` 만 보강. **FK 는 안 읽음** (조사 grep 0건 — `foreign_keys`/`relationship_label` 미소비).
- **소스 가용**: db-schema 테이블 객체에 `foreign_keys[]` = `{name?, columns[], references_table, references_columns[], on_delete?, on_update?, relationship_label?}` 이미 존재(`db-schema.schema.json:98-127` / ADR-011 relationship_label). `tableByName.get(t)` 로 같은 객체 이미 접근 중 → **새 IO 0**.
- **출력 스키마**: `context-cache.schema.json:81-103` `dependent_tables[].items` = strict(`additionalProperties:false` / required `[name, columns]`). 컨벤션 = "필드 항상 emit / 없으면 빈 배열·null".

## 2. 설계

### 2-1. 코어 (federator.js buildDataRefs)

`dependent_tables` 매핑에 `foreign_keys` 필드 추가 (table-centric / columns 보강과 동형):

```js
dependent_tables: (e?.dependent_tables ?? []).map((t) => {
  const tbl = dataSource.tableByName.get(t);
  return {
    name: t,
    columns: (tbl?.columns ?? []).map((c) => ({ name: c?.name ?? null, type: c?.type ?? null })),
    foreign_keys: (tbl?.foreign_keys ?? []).map((fk) => ({
      references_table: fk?.references_table ?? null,
      local_columns: fk?.columns ?? [],           // ← FK 의 출발 컬럼 (rename: dependent_table.columns 와 혼동 회피)
      references_columns: fk?.references_columns ?? [],
      relationship_label: fk?.relationship_label ?? null,
    })),
  };
}),
```

- 결정론: db-schema 데이터 직읽기 (LLM·휴리스틱 0 / codegraph 함정 무관).
- table 부재(tableByName miss)·FK 부재 → `[]` (columns 동형 graceful).
- on_delete/on_update 는 읽기-aid 핵심 아님 → 제외(YAGNI / 폭증 회피). **`references_table` = 위상 1차 / `relationship_label` = 2차 보조**(db-schema 에서 OPTIONAL=자주 null 가능 / Senior 정정).
- **`local_columns` rename**(Senior CONCERN): FK 의 `columns`(string[]) ↔ dependent_table 의 `columns`(객체배열) 같은 이름·다른 shape 혼동 회피.

### 2-2. 스키마 (context-cache.schema.json)

`dependent_tables[].items.properties` 에 `foreign_keys` 추가 — **required 제외 / optional**(★ Senior BLOCKER-1 / `callers`·`callees`·`impact` reading-aid 선례 동형 = L170 required 미포함 / 항상-emit 컨벤션은 structural core[columns]에만 적용 / reading-aid 축은 optional):

```json
"foreign_keys": {
  "type": "array",
  "description": "G2-1 — 이 테이블의 FK 관계(table↔table 위상). db-schema foreign_keys 직읽기 / references_table(1차)·relationship_label(2차 ERD 동사). reference-lens / non-gating / reading-aid (callees 동형 optional).",
  "items": {
    "type": "object", "additionalProperties": false,
    "required": ["references_table", "local_columns", "references_columns", "relationship_label"],
    "properties": {
      "references_table": { "type": ["string", "null"] },
      "local_columns": { "type": "array", "items": { "type": "string" } },
      "references_columns": { "type": "array", "items": { "type": "string" } },
      "relationship_label": { "type": ["string", "null"] }
    }
  }
}
```
+ `dependent_tables[].items.required` 는 **불변**(`[name, columns]` 그대로 / `foreign_keys` 미합류). federator 는 항상 `[]`라도 emit 하되 스키마는 optional 허용 → 외부·구버전 산출물 strict-fail 회피.

### 2-3. trust 경계 (불변)

- `data_refs` = 이미 reference-lens / non-gating (DEC-2026-06-02 §9). FK 도 같은 분류 — gate inject ❌ / release-readiness 미배선 유지.
- meta.trust_note 불변. graph_stamp/anchor_stamp 무관(data_refs 는 sql-inventory/db-schema 소스 / 기존 델타 축 그대로).

## 3. 검증 계획 (no-simulation)

- **단위 테스트**(federator.test.js): db-schema fixture 에 `foreign_keys` 있는 테이블 추가 → data_refs.dependent_tables[].foreign_keys 가 references_table·relationship_label 정확 노출 / FK 없는 테이블 = `[]` / 테이블 db-schema 부재 = `[]` graceful. schema top-level lockstep 가드 동반.
- **schema-validator**: context-cache 픽스처 strict 통과 (additionalProperties:false / required 합류).
- **≥2 도메인 dogfood**: poc-16(efiweb-car / FK 보유 가능) + 1 추가(FK 있는 sql-inventory+db-schema 보유 PoC). FK 부재 도메인은 `[]` 정직.
- **무회귀**: federator 기존 테스트 + workspace + release-readiness(federator non-gating = 무변경 확인).

## 4. 버전 / 영향

- additive(기존 data_refs 소비자 무파괴 / 새 필드 추가) → **MINOR**. federator 도구 + context-cache.schema 동시. plugin.json lockstep 확인 후 결정(현 0.x).
- 영향 파일: `tools/context-federator/src/federator.js`(buildDataRefs ~8줄) + `schemas/context-cache.schema.json`(+1 필드) + `tools/context-federator/test/federator.test.js`(+케이스) + (선택) SKILL/DEC 정합 한 줄.

## 5. 4원칙 추적

1. 숙지 = 본 plan (§1 실측).
2. research = Senior 적대검토(필드 shape table-centric 적정성 / strict lockstep 트랩 / trust 경계 / YAGNI). 가벼운 sub-agent.
3. 승인 = 본 plan + research 후 사용자.
4. 실패 시 = Lessons 기록.

## 6. 정합 self-check

| 제약 | 정합 |
|---|---|
| 결정론 axis (STRONG-STOP) | ✓ db-schema 데이터 직읽기 / 휴리스틱 0 |
| trust 모델 (gate inject ❌) | ✓ data_refs reference-lens 분류 유지 / non-gating |
| 그래프 폭증 회피 | ✓ SSOT 그래프 노드/엣지 무신설 (cache 필드만) |
| json 단독 SSOT | ✓ artifact-graph.json 무변경 (context-cache = 파생 reference-lens) |
| navigate 재발명 ❌ | ✓ 기존 data_refs 보강만 |
| no-engineification | ✓ 순수 데이터 join ~8줄 |

## 6-R. Research 결과 (Senior REVISE@0.82 / 전건 실측 반영)

- **BLOCKER-1 (수용)**: `foreign_keys` required 합류 ❌ → optional. 같은 스키마 reading-aid 선례 `callers`/`callees`/`impact` 가 L13/L170 required 미포함 = optional 실측 확인. "항상 emit" 컨벤션은 structural core(columns)에만 — reading-aid 축은 optional(외부·구버전 산출물 strict-fail 회피).
- **CONCERN (수용)**: FK `columns` → `local_columns` rename(dependent_table.columns 와 shape 충돌 혼동 회피).
- **정정 (수용)**: `references_table` = 위상 1차 / `relationship_label` = 2차(db-schema OPTIONAL=null 잦음).
- **확인**: examples/ committed `context-cache.json` **0건** → 기존 PoC 재합성 불요(grep 실측). table-centric FK = GO(별도 SSOT 블록 신설 = 폭증 거부 타당).
- 나머지 설계(db-schema 직읽기·reference-lens·~8줄·on_delete 제외) = Senior GO.

## 7. Lessons Learned

- G2-1 = 갭 2 조사에서 "유일 즉시후보" 로 도출. 기존 buildDataRefs 자산 위 최소 보강 — per-table SSOT 노드 분해(폭증)·FK 엣지 승격(등급규칙)은 의도적으로 보류.
- Senior 가 "신규 reading-aid 필드는 기존 reading-aid(callees) 선례대로 optional" 트랩을 잡음 → required 합류는 strict lockstep 함정. self-recorded 컨벤션("항상 emit")을 structural core 와 reading-aid 에 무차별 적용하면 안 됨(축별 구분).

## 참고

- DEC-2026-06-08-dep-graph-dependency-axis-gaps 갭 2 carry G2-1
- DEC-2026-06-02-context-federation §9 (data_refs / Phase 1.5 / trust)
- `tools/context-federator/src/federator.js:202-240` + `schemas/context-cache.schema.json:81-103` + `schemas/db-schema.schema.json:98-127`
