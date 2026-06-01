# decision-table → clean JSON SSOT migration (v12 DT-json slice)

> 사용자 결단: "decision-table은 json으로 하자 / 권고대로 해줘" (2026-06-01).
> v12 원 plan(`serialized-exploring-stonebraker.md`)의 decision-table 처리 **정정** — 원 plan은 decision-table `.md`를 deletable twin 으로 오분류(§C3-h + §10 BLOCKER B). 실측 결과 twin 아님 → 본 slice 로 대체.
> 경로 기준: inner repo `ai-native-methodology/` (cwd 기준 `ai-native-methodology/...`).

## 1. Context — 왜 (검증된 사실)

P0 = "산출물 = LLM 운영 컨텍스트 / json 단독 완전 AX". decision-table 현 상태 실측:

- **`.md` ≠ `.json` (twin 아님)**: `.md`는 결정 grid(§3/§4) + 형식화 결단(§2) + Refinement code(§5) + 코드생성안(§6) + **방법론-자기검증 narrative**(§1 빈약성%, §7 Direction A/B drift, §8 finding, §10 가치입증, PoC cross-val)를 담음. `.json`은 BR 요약 + (poc-02/03) 이미 구조화된 `formalization_decisions`/`natural_language_gap_quantified`/`related_findings`. **빠진 핵심 = 결정 grid (0/25 파일)**.
- **두 소비자 분리**: CLI 도구(검증/링크) = json만 읽음(decision-table-validator만 .md 읽고 그마저 release gate 밖). LLM(운영) = 풍부한 추론자료 필요. → `.md`/`.json`은 다른 소비자용 다른 산출물.
- **결정**: decision-table를 **clean 결정-명세 json** 으로 통합 (grid + 결단 + 검증 + 코드 *참조*) → json 완전 SSOT → `.md` 진짜 twin 화 → 삭제. **방법론-자기검증 cruft 는 옮기지 않음**(genuine finding 은 finding-system 이관 / 나머지 narrative 제거). DMN 5종 검사는 `decision_grids[].rows` 에서 수행.

## 2. Decisions locked (★ Senior REVISE @0.88 반영 — 2026-06-01)

> ★ Senior 사실검증(LL-fsim-11)이 초기 "facts" 3건 정정: ① json 이질적(27키 / formalization_decisions=13파일·code_generation_result=1파일·natural_language_gap vs _quantified 혼재·race_safety_layers/uq_analysis/layered_defense/isomorphic_* 등) — "grid만 빠짐"은 거짓. ② 사람-grid는 UNIQUE-hit-policy 아님 → 자동 DMN 검사 시 rule.overlap/type.mixed-column **breaking 오발(spurious RED)**. ③ natural_language_gap_quantified 는 CLAUDE.md·schema desc 인용 "빈약성 44%" 증거(구조화 / raw narrative 아님). ④ poc-16 br_type:"authorization" = 이미 enum 위반 → 이 파일들 현재 어떤 gate 도 schema 검증 안 함.

| # | 결정 (수정) | 근거 |
|---|---|---|
| DT-1 | decision-table = **json 결정-명세 (grid 데이터 흡수)**. `.md` 삭제. | 사용자 "json으로" |
| DT-2 | **grid = `decision_grids[]` 데이터** — **자동 DMN 검사 ❌** (사람-grid 비-UNIQUE-hit-policy / spurious RED 회피). dmn-check.js = dormant 유지(향후 `hit_policy:"unique"` grid 한정 선택 적용). | ★ Senior Risk(c) |
| DT-3 | **드롭 = `.md` narrative만** (§7 drift / PoC cross-val / §10 가치입증 prose = 사용자가 실제 가리킨 것 / .md 에만 존재) + json `rendered_md_path`(md 삭제 정합). | 사용자 "drift/poc" 지적 = .md narrative |
| DT-4 | **기존 구조화 json 필드 전부 유지** (formalization_decisions / natural_language_gap_quantified / related_findings / race_safety_layers / uq_analysis 등) — 도구 소비자 0, AX-consumable, 인용됨. **drop ❌**. | ★ Senior Risk(b) |
| DT-5 | **code 비-embed**: Refinement(§5)·코드생성안(§6)은 기존 `invariants/`·`generated-code/` 파일 **참조**(`refinement_ref`/`generated_code_refs[]`). | 가독·중복 회피 |
| DT-6 | **validator**: cli.js findTargets `.json` 스캔 + processOne json-sanity. `.md` 파싱·missing-md-link 제거. dmn-check.js/parse-md-table.js/dmn-check.test.js **무변경**(dormant). | grid=데이터 / DMN 미가동 |
| DT-7 | **schema additive only**: `decision_grids[]`/`formalization_decisions[]`/`related_findings[]`/`refinement_ref`/`generated_code_refs[]` 추가 + `br_type` enum `authorization` 추가. **`additionalProperties:false` ❌**(이질적·미-gate·실익0). natural_language_gap vs _quantified 는 schema 에 둘 다 허용(데이터 일괄 rename ❌ — churn 회피). | ★ Senior Risk(a) |

**정직 한계**: ① v12 원 scope("twin 제거")를 넘는 deliverable 재설계 — v12 내 정정 흡수(1-MAJOR) / self-celebration ❌. ② poc-16(input/) thin → grid 만 추가. ③ §7/§10 narrative 제거 = 의도적(genuine finding 은 finding-system 보존 / 방법론 history 는 CHANGELOG/DEC). ④ 본 설계는 grid 를 **검증 안 하는 데이터**로 흡수 — "json SSOT 가독" 달성이 목적이지 형식 DMN 검증 아님(사람-grid 부적합). ⑤ ★ 초기 facts 오류 = 2파일 표본 과일반화 / Senior 27키 census 가 정정 (LL-fsim-11 재발 — Senior 권위 ≠ 사실, 단 본건 Senior 가 사실 정정자).

## 3. decision_grids 설계 (DMN / GoRules JDM 표준 정합 — ★ 파일럿 입증)

★ 사용자 지적("json key 이름은 포맷과 같아도 되지 않나") 반영 — ad-hoc `input_headers/output_headers/rows` 대신 **DMN/JDM 표준 key**(inputs/outputs/rules[]/when/then + hit_policy). 단어 단일 key(inputs/outputs/rules/when/then)는 표준과 동일, `hit_policy`만 methodology snake_case(표준 camelCase hitPolicy).

```jsonc
"decision_grids": [
  {
    "context": "follow",                     // 시점/분기 (signup / unfollow / create / race-window / 역방향-일관성)
    "hit_policy": "first",                   // 선택 (unique/first/priority/any/collect) — DMN hitPolicy
    "inputs":  ["follower null", "following null", "follower.id==following.id", "이미 isFollowing"],
    "outputs": ["결과", "http", "검증 위치"],
    "rules": [                               // 각 rule = 한 행 (when=입력 entry / then=출력 entry)
      { "when": ["O","*","*","*"], "then": ["IAE follower is null", 400, "UserFollow 생성자"] },
      { "when": ["X","X","O","*"], "then": ["IAE follower and following must be different", 400, "UserFollow 생성자(NEW)"] }
    ]
  }
]
```

★ **grid = 데이터** (자동 DMN 검사 ❌ / DT-2). validator 는 grid 를 카운트만(`grids_found`), checkDecisionTable 미호출 — 사람-grid 비-UNIQUE-hit-policy 라 결정적 DMN 오발(spurious RED). 향후 `hit_policy:"unique"` 명시 grid 한정 선택 검사 가능(dmn-check.js dormant 보존). §4 "역방향 일관성 점검" grid 는 별 context(예: `unfollow-consistency`)로 동일 구조. ★ 파일럿(BR-USER-EMAIL-UNIQUE-001) = ajv valid + validator 0 findings + 2 grid 실측 green.

## 4. Sequenced steps (GREEN 보존)

> 순서 불변식: 스키마 → validator → 파일럿 검증 → 25파일 마이그레이션 → finding 이관 → .md 삭제 → 검증. 각 단계 후 schema-validator + decision-table-validator + npm test green.

### S1 — 스키마 (additive + clean 강제)
`schemas/formal-spec.schema.json` decision_tables.items: `decision_grids[]`(context/input_headers/output_headers/rows) + `formalization_decisions[]`(item/decision/rationale) + `related_findings[]`(F-id pattern) + `refinement_ref`(string) + `generated_code_refs[]` 추가. `additionalProperties:false` 추가(cruft 차단). 기존 필드 유지. `rendered_md_path` 제거(.md 삭제 정합). ajv2020-regression count 확인.
- green: schema-validator (단 25 데이터가 아직 cruft 보유 → 마이그레이션 전이라 additionalProperties:false 가 기존 데이터 reject 가능 → **S1 schema + S3 데이터 마이그레이션 = 같은 commit** 또는 schema 먼저 느슨히→S3 후 strict. **결정: S1 schema 작성하되 additionalProperties:false 는 S3 데이터 정리 후 같은 step 에 적용**).

### S2 — validator json 배선 (DMN 미가동)
`tools/decision-table-validator/src/cli.js`: findTargets `.json` 스캔 / processOne 가 `.json` → checkJsonSanity (필드 sanity). `.md` 파싱 경로 제거(parseMarkdownTables/checkDecisionTable 호출 drop). `json-sanity.js` `missing-md-link`(rendered_md_path) finding 제거. **dmn-check.js/parse-md-table.js/dmn-check.test.js 무변경(dormant)** — grid 는 검사 안 하는 데이터. test: 기존 유지 + cli json 스캔 경로 test 신설(선택).
- green: decision-table-validator test.

### S3 — 25파일 마이그레이션 (파일럿 1 → 나머지 24)
**파일럿**: BR-USER-EMAIL-UNIQUE-001.json — `decision_grids[]`(signup/update 2 grid) 추출 + `rendered_md_path` 제거 + refs(invariants/generated-code 존재 시). **schema-validator + decision-table-validator(json-sanity) green = 실제 stdout 확인**(no-simulation / Senior 요구) → shape 입증.
**나머지 24** (workflow 병렬): 각 .md → enriched .json. **decision_grids[] 추가**(§3/§4 표 1:1 / context+input_headers+output_headers+rows) / 기존 구조화 필드 전부 유지 / `rendered_md_path` 제거 / refs 추가(존재 파일만). poc-16 = grid 1 추가만. **drop ❌**(formalization_decisions/gap_quantified/race_safety_layers 등 유지).
- ★ 충실성: grid rows 는 .md 표 1:1 (LLM 이 읽는 SSOT). 검증 = 전 25 json schema-valid + decision-table-validator 0 breaking(json-sanity 만).

### S4 — finding 이관
poc-findings.md 미등재 F (F-088/089/090/158 + 기타) = §8 표 기반 등재(finding-system schema). 이미 등재분(F-074/126/135/120/124)은 skip.

### S5 — .md 삭제 + 검증
25 `.md` 삭제. flows/templates 의 decision-tables/*.md 참조 정리(스킬/플로우가 decision-table .md emit 지시 시 — C2 영역 확인). `decision-table.template.md` → clean json template 로 대체 or 정리(별도 판단). 전체: schema-validator + decision-table-validator(DMN green) + npm test 0 fail + skill-citation(decision-tables/*.md dead-link 0) + grep(잔존 decision-tables/*.md 0).

## 5. Risks & Lessons
- **[충실성]** grid rows 1:1 정확(DMN source). 파일럿으로 shape 검증 후 일괄.
- **[schema↔data 동시]** additionalProperties:false 는 데이터 정리(S3) 완료 후 적용(분할 RED 회피 / 같은 commit).
- **[poc-16 input/]** thin / formalization_decisions 0 — grid 만 추가, 과설계 ❌.
- **[skill/flow 참조]** flows/*.json·skill 이 decision-tables/*.md 를 outputs/emit 로 언급 시 정리(C2/C4 영역과 조율).
- **[cruft 제거 = content 삭제]** §7/§10 narrative 제거는 의도적 — genuine finding 만 finding-system 보존, 방법론-eval 은 history(CHANGELOG/DEC)로 충분.
- **[v12 scope]** 1-MAJOR 유지 — 원 plan decision-table 처리 정정으로 흡수, 별도 MAJOR ❌.

## 6. Findings 등재 (S4 동반)
- F-DT-001: v12 원 plan 이 decision-table.md 를 deletable twin 으로 오분류 (실측 = grid+code+analysis 보유 / twin 아님). 사용자 메타점검("1:1 아니잖아")으로 발견.
- F-DT-002: decision-table.template.md 가 결정-명세 + 방법론-자기검증(빈약성%/drift/가치입증)을 혼합 → deliverable 설계 결함. clean json 으로 분리.

## 7. v12 전체 재구성 (decision-table 정정 반영)
- **C3 (원 atomic tool-cut)**: drift 모듈 삭제 + handoff detector + builder + manifest + characterization(C3-g) + tests. decision-table-validator 는 **본 DT-json slice 가 처리**(원 C3-h 대체). → C3 는 decision-table 빼고 진행 가능(독립).
- **DT-json slice (본 plan)**: S1~S5.
- **C4 이후**: decision-table .md 삭제는 DT-json S5 에서 처리(C4 의 decision-table 항목 제거).
