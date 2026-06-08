# plan — business-rules 영구 분할 (항상 split / subset 폐기 / SSOT 단일)

> Work Principles 4원칙. 1원칙(깊은 숙지) = 2-agent 블래스트 반경 조사 완료. 작성 2026-06-07.
> 사용자 결단: **A(split-ready 본체화) + 수정 "크기 무관 무조건 분할"** / subset 개념 영구 폐기 / SSOT 단일 유지.

## 0. 목적 / 동기

- **동기 (SSOT 무결성)**: subset(canonical 사본 + 역동기화)은 SSOT를 깨는 부채. 원본을 BC별로 영구 분할하면 사본 없이 SSOT 1개 유지 + 토큰도 work-unit 비례.
- **결정**: business-rules 산출물을 **항상 BC별 파일 + index 로 분할**(크기 게이트 ❌ / 단일 canonical 포맷). subset 개념은 spec/도구에서 제거.

## 1. 깊은 숙지 결과 (2-agent)

- **선례 답습** (새 발명 ❌): formal-spec 이 이미 `decision-tables/*.json`(BR별)·`state-machines/*.json` + 디렉토리+glob+manifest 정착. phase-flow 가 `state-machines/*.json` glob output 지원. characterization `snapshots/UC-*.json`.
- **schema**: top-level `{ business_rules: [...] }` 배열 / `additionalProperties:false` / 각 rule 에 `bounded_context`(optional string) **이미 존재**.
- **하드코딩 15+ 지점** (분할 시 전부 영향): tools(findings-aggregator cli 101·109 / traceability-matrix-builder cli 39 ANALYSIS_FILENAMES / chain-driver hooks-bridge 140 ANALYSIS_FILENAME_TO_SUBKIND) + flows(analysis.phase-flow 60·68·80·91 / discovery.phase-flow 20·28 / artifact-registry 11) + schema(top-level required) + 의존 schema 6(behavior/discovery/acceptance/characterization/form-validation/db-schema 의 BR-* backward-link = id 참조라 무영향 / 경로 참조만 점검).
- **마이그레이션 부담 작음**: 실 사용자 0 / 사내 미배포 / examples=시점 기록물. BR 개수 적음(poc 2~15개).

## 2. 설계 (핵심 — 승인 대상)

### 2.1 포맷: `business-rules.json` 을 **index** 로 전환 (파일명 보존 = 하드코딩 churn 최소화)

```
.aimd/output/
├── business-rules.json              ← INDEX (meta + bc_files[] + 통계 / 기존 파일명 유지)
└── business-rules/
    ├── <bc-slug-1>.json             ← 해당 BC 의 business_rules[] 만
    ├── <bc-slug-2>.json
    └── _uncategorized.json          ← bounded_context 미지정 rule 버킷
```

- **핵심 영리함**: `business-rules.json` 이 사라지지 않고 **index 로 의미 전환** → 15 하드코딩 중 다수가 "파일 존재"는 유지, "내용 해석"만 index 로. 전체 로드 needs = index 따라 전부 / scope needs = 해당 BC 파일만.
- granularity = **per-BC**(rule 단위 ❌ — formal-spec decision-table 은 per-BR 이나 BR 목록은 BC 가 자연 모듈 경계 / scope=BC 매핑). 미정 BC = `_uncategorized.json` 버킷.

### 2.2 schema (breaking)

- 신규 `business-rules-index.schema.json`: `{ meta, bc_files: [{ bounded_context, file, rule_count, rule_ids[] }], total_rules }` / `additionalProperties:false`.
- `business-rules.schema.json` = **per-BC 파일 schema** 로 재정의 (top-level `{ bounded_context, business_rules: [businessRule] }` / `$defs.businessRule` 재사용 / 기존 rule 형식 불변).
- rule 의 `bounded_context` = **여전히 rule 내부 보존**(파일명과 이중化 = self-describing / drift 검출 용이).

### 2.3 writer

- `skills/analysis-business-rules/SKILL.md`: 단일 파일 산출 → **BC 그룹핑 후 per-BC 파일 + index 산출** 지시. BC 미정 rule = `_uncategorized`.

### 2.4 readers (15+ 지점)

- well-known filename `business-rules.json` 로드 → **index 로 파싱 후 bc_files 따라 per-BC 로드**(전체 필요 시) 또는 scope BC 만(선택 로드). helper 함수 1개(`loadBusinessRules(dir, {bcFilter})`)로 일원화 권장.
- traceability/dep-graph: 노드 단위 = 현행 파일 단위 → **index = 1 노드 + per-BC = child** 또는 BC 단위 노드. (graph-synthesizer 영향 — research 확인.)
- br-cross-consistency-validator: 전체 rule 대상이므로 index 경유 전체 로드.

### 2.5 subset 폐기

- `baseline-delta-operating-model.md`: `*.subset.json` / scope-local subset 행 **제거** → "BC 분할 = 자연 scope 슬라이스" 로 대체 서술. `work-unit-manifest.schema.json` `analysis_refs` = BC 파일 참조로 의미 정합(스키마 필드 변경 최소).

### 2.6 examples (마이그레이션)

- 즉시 cutover (v3.0.0 paradigm = alias ❌ / 실 사용자 0). **canonical reference PoC(poc-01)만 신포맷 재생성**으로 입증 + 나머지는 시점 기록물 as-is(옛 포맷). 단 schema-validator 가 옛 포맷 reject 시 = 재생성 필요 PoC 식별 → 최소 재생성. (research 로 validator 영향 확인.)

## 3. 작업 스코프

- schema: business-rules-index.schema.json 신설 + business-rules.schema.json 재정의 + 의존 schema 경로 참조 점검.
- writer skill: analysis-business-rules.
- readers/tools: findings-aggregator / traceability-matrix-builder / chain-driver hooks-bridge / br-cross-consistency-validator / discovery-extraction-validator + shared loader helper.
- flows: analysis.phase-flow / discovery.phase-flow / artifact-registry (glob 또는 index 표기).
- spec doc: baseline-delta-operating-model(subset 제거) / lifecycle-contract / deliverables/5-business-rules / id-conventions(파일명 규칙).
- examples: poc-01 재생성(입증) + validator 영향 PoC.
- DEC + INDEX + STATUS + CHANGELOG + version(0.2.0 → 0.3.0 breaking).
- test: 신규 loader/index 단위 test + 기존 validator test 갱신.

## 4. 검증 기준

- schema-validator green (index + per-BC).
- 영향 tool test green (findings-aggregator / traceability / br-cross).
- release-readiness 통과(이 환경 39/40 = workspace_test env artifact 기지).
- poc-01 신포맷 schema-valid + dep-graph 합성 정상.

## 5. Risk / 주의

- **R-1 blast radius**: 15+ 하드코딩 → loader helper 일원화로 회귀면 축소. 누락 시 chain 깨짐 → 전수 grep 가드.
- **R-2 graph/traceability 노드 모델**: 파일 단위 노드가 index/BC 로 바뀌면 artifact-graph 합성 영향 → research 필수.
- **R-3 small-scale 오버헤드**: 사용자 결단(무조건 분할) — 5-rule 프로젝트도 디렉토리+index. 일관성/SSOT 우선 수용(설계 단순화 = dual-mode 회피).
- **R-4 §8.1**: 본 변경 = 구조 리팩터(자동화율 axis 무관). 단 ≥1 PoC(poc-01) 신포맷 실 산출 입증 의무.
- **R-5 domain/antipatterns 확장**: 본 plan = business-rules 한정. domain.json(41KB)·antipatterns(72KB) 동일 분할 = follow-on(별도 결정 / 본 plan scope-out).

## 6b. REVISED (2-agent research 후 / 2026-06-07) — 순차 4스텝으로 전환

**research 가 "무조건 분할 now" 전제를 반증** (Senior STOP 3 blocker + 데이터):
- **bounded_context 채움률 7/8 PoC = 0%** (poc-01 만 13/13 = BC-AUTH 5 + BC-CONTENT 8). writer SKILL 이 채우기 지시 안 함 → 분할하면 7/8 이 `_uncategorized` 단일파일 = 분할 무의미.
- **blocker #1**: `discovery-extraction-validator` 는 BR 을 4 shape 로만 로드 → index 포맷 미매칭 → 빈 Set → `unknown_br` 오탐 = chain #1 gate 깨짐.
- **blocker #2**: `analysis_refs.rules[]` = **BR-id 문자열** 배열(파일경로 ❌) → plan §2.5 "BC 파일 참조 최소변경" 오류. context-federator 조인도 BR-id 기준.
- **blocker #3**: 경로 3종 공존(`output/rules/` / `input/` / flat `.aimd/output/`) + 누락 reader(drift-validator·chain-coverage-validator·context-federator).
- **graph 노드 모델**: business-rules = **파일1=노드1**(BR-id 단위 ❌ / graph-synthesizer.js:109,619-630). 분할 시 index 1노드 + per-BC subkind 권장.
- **v12 정합**: index = **json**(`business-rules.json` 자체) / `_manifest.yml` yaml = v10 유산 폐기 (ADR-011).

**결론 — 순차 4스텝** (각 스텝 독립 검증·release / 사용자 승인 2026-06-07):

| STEP | 내용 | blocker 해소 |
| --- | --- | --- |
| **0** | subset 개념 폐기 (baseline-delta 문서 + 잔여 참조) | SSOT 부채 제거 (분할 무관 독립 달성) |
| **1** | bounded_context 의무화 (schema required + writer SKILL domain.json BC 매핑 + 예제 백필) | #2(분할 무의미) 토대 |
| **2** | 경로 3종 통일 + reader 공용 loader 도입 | #1(silent mis-fire) + #3(경로) |
| **3** | 포맷 분할 (index + per-BC + schema 2종 + 노드모델 + examples 재생성) | 분할 본체 (토대 위) |

STEP 마다 멈춰 재판단. STEP 3(분할) = STEP 1 후 BC 채움률 실측 후 최종 결정. **현 착수 = STEP 0 + STEP 1.**

## 6c. STEP 1 백필 범위 (정밀화 필요 — grep 후 확정)
- schema `bounded_context` required → 0% PoC business-rules.json 전부 schema-invalid 화 → 백필 의무.
- 백필 대상 = gate/test 가 검증하는 예제 한정인지 전수인지 grep 으로 확정.

## 8. STEP 2 상세설계 (2026-06-07 / 3-Explore 실측 후 / 승인 대상)

> STEP 0+1 시행·커밋·push 완료(`5e4d1257`) 후 STEP 2 착수. 3 Explore agent 가 plan §1 의 STEP-0+1-이전 blast-radius 를 재실측 → **가정 2건 정정**.

### 8.1 실측 정정 (plan §1·§2.5 대비)
- **공용 모듈 이미 존재**: `tools/_shared/` (ESM / `../../_shared/X.js` import / baseline.js·evidence-cross-check.js 등 / 9 도구 사용 / dist 의무 포함). → loader 신규 위치 = `tools/_shared/load-business-rules.js` (새 컨벤션 발명 ❌ / 선례 답습).
- **"경로 3종" = 대부분 doc/fixture, reader 대수술 아님**:
  - `.aimd/output/business-rules.json` = **canonical output** (SKILL.md:55 + baseline-delta + lifecycle-contract + deliverables/17 선언 / writer 이미 여기 산출).
  - `input/business-rules.json` = **수동 입력 fixture** (analysis 산출물 ❌ / chain-1 baseline 입력 = 별개의 정당한 역할 / findings-aggregator 가 discovery gate 입력으로 하드코딩 = 맞음).
  - `output/rules/` · `analysis/6-quality/` = **legacy 예제 시점기록물** (pre-표준화).
  - 실 reader 대부분 caller `--target` 경로 수령 → "통일" = canonical 명시(doc) + loader 일원화. **예제 파일 이동 ❌**(시점 기록물 보존).
- **silent mis-fire(blocker #1) 실재 확인**: `discovery-extraction-validator/src/validator.js:32-45` — `analysis`(이미 파싱된 객체)에서 4 shape(`rules.business_rules`/`business_rules`/`rules`/`rules_step_4c_carcost`)만 인식. 미인식 shape → `analysisBrs` 빈 Set → L47-55 모든 BR-INTENT 가 false `unknown_br` **critical** → gate #1 차단.

### 8.2 STEP 2 설계 (포맷 무변경 / 순수 loader 중앙화 + mis-fire fix + 경로 doc)
- **신규 `tools/_shared/load-business-rules.js`** (ESM / 2 진입점):
  - `normalizeBusinessRules(parsed)` → `business_rules[]` — 현존 전 shape 흡수(4 + top-level `{business_rules:[]}` + `{rules:{business_rules}}` + `{rules:[]}`). **이 함수 = STEP 3 포맷전환(index+per-BC) 단일 변경 지점.**
  - `loadBusinessRules(target, {bcFilter})` — target=파일경로 OR 디렉토리(canonical 파일명 resolve) → readFileSync+JSON.parse → `normalizeBusinessRules` → `bcFilter` 적용 → 배열. 실패=fail-closed(`[]`) + 진단 객체(별도 반환).
  - **mis-fire fix**: parsed 가 non-empty 인데 known shape 0건 → `{ rules:[], unrecognizedShape:true }` 신호. discovery-extraction-validator 는 이 신호 시 N 개 false `unknown_br` 대신 **단일 진단 finding** `discovery.br_source.shape_unrecognized`(high) emit.
- **reader 재배선(로딩하는 것만 / 4종)**: discovery-extraction-validator(`normalizeBusinessRules(analysis)` + mis-fire 신호) · br-cross-consistency-validator(cli.js:88) · context-federator(federator.js:164 `brById`) · traceability-matrix-builder(builder.js:68). **filename 매핑 상수**(hooks-bridge:140 / graph-synthesizer:109 / drift-validator handoff / traceability cli:39 ANALYSIS_FILENAMES)는 **로더 아님**(파일명→subkind 매핑) → STEP 2 scope-out(별도 상수 중앙화 = 선택적 follow-on).
- **경로 doc**: baseline-delta / lifecycle-contract 에 "canonical output=`.aimd/output/` vs input fixture=`input/`" 역할 구분 1~2줄 명시(STEP 0 subset 폐기 서술과 정합). 예제 파일 무이동.
- **버전**: 포맷·schema 무변경 / tool 내부 리팩터 + gate 버그 fix → **PATCH 0.3.1** 후보(유효 입력 동작 불변 / mis-fire = 버그수정). loader=신규 infra지만 외부 계약 무변경.

### 8.3 검증 기준 (STEP 2)
- 신규 `_shared/load-business-rules` 단위 test(전 shape + bcFilter + unrecognizedShape 신호 + fail-closed).
- 재배선 4 reader 기존 test green(회귀 0) + discovery-extraction-validator mis-fire 신규 test(미인식 shape → 단일 진단 1건, N criticals 아님).
- release-readiness 통과(이 환경 기준 = v0.3.0 커밋 시 40/40).
- 예제 전수 schema-valid 유지(포맷 무변경이라 자동).

### 8.4 STEP 2 Risk
- **R2-1 회귀**: 4 reader 가 자체 readFileSync→loader 로 바뀜 → 동작 동치 보장 위해 reader별 기존 test 먼저 green 확인 후 교체(샌드위치).
- **R2-2 over-strict mis-fire fix**: 정당한 "BR 0건" 프로젝트(numpy-financial 류)와 "shape 미인식"을 구분해야 false alarm 재발 안 함 → `unrecognizedShape` 는 parsed 가 **객체이고 키 보유**인데 known shape 0건일 때만. 빈 파일/부재 = 정당한 0건.
- **R2-3 Senior 적대검토 의무**: plan LL 이력상 Senior 가 전제 반복 반증 → STEP 2 코드 착수 전 design 적대검토 1회(loader 흡수 shape 누락 / mis-fire 구분 경계 / scope-out 한 상수 중앙화가 STEP 3 에서 부메랑 되는지).

### 8.5 REVISED (Senior 적대검토 REVISE@0.82 / 2026-06-07 / 결함 5건 코드확인 후)

> §8.2 naive 설계의 6 결함을 Senior 가 적출 → 직접 코드확인(br-cross validator.js:19-26 alias hard-kill 주석 / traceability cli.js:110-117 businessRules unset / federator.js:129 주입 readJson seam) → 전부 사실. 수정 설계:

- **[정정 1 — 단일 normalizer ❌ → 2 함수]**:
  - `normalizeBusinessRules(parsed)` = **strict canonical** (`Array.isArray(parsed?.business_rules) ? parsed.business_rules : []`). canonical output 소비 3 reader(br-cross / federator / traceability-graph)용. **이것이 STEP 3 분할 단일 변경 지점.** ← 4-shape 로 넓히면 v5.0.0 이 hard-kill 한 `rules`/`rules_manual_authored` alias 부활(br-cross 회귀).
  - `normalizeAnalysisBusinessRules(analysis)` = 4 legacy shape(rules.business_rules / business_rules / rules / rules_step_4c_carcost). **discovery-extraction-validator 전용**(analysis-stage raw 객체 = canonical output 과 다른 입력 / STEP 3 분할 무영향).
- **[정정 2 — mis-fire 판별 경계]**: `shape_unrecognized`(high 단일) emit 조건 = **인식 BR-container 키 중 ≥1 이 present 인데 array/id 0** 일 때만. "BR 키 자체 부재" = 정당한 0-rules(numpy-financial 류) → 무알람. "객체 non-empty"(domain 키 등 보유)로 판별하면 정당 빈 BR 을 오탐. typo'd id 는 union-then-check 라 여전히 critical(보존 확인).
- **[정정 3 — 주입 seam 보존]**: federator 는 file-loading `loadBusinessRules` 주입 ❌ → **자기 `readJson` 주입을 그대로 살린 path 기반 호출** `loadBusinessRules(brPath, {readJson})`(seam 보존 + STEP 3 자동 확장). traceability-graph 는 cli 루프에서 business-rules kind 만 `analysis['business-rules'] = {business_rules: loadBusinessRules(p)}` 로 정규화(graph-synthesizer:280 `(d?.business_rules ?? [])` 무변경 / STEP 3 단일점). br-cross 는 `--target` path → `loadBusinessRules(target)`.
- **[정정 4 — 위치 resolution 을 STEP 2 에 / HIGH]**: `loadBusinessRules(target,{readJson,bcFilter})` 가 **파일위치 resolve + 배열추출** 둘 다 `_shared` 경유 → STEP 3 가 single-point. (index 가 파일명 `business-rules.json` 유지[plan §2.1] → existsSync 통과 / loadBusinessRules 가 dir 보유 → index 감지 후 per-BC sibling 확장은 STEP 3 에서 이 함수 내부만 수정.) graph-synthesizer:109/280 + traceability cli:154 가 하드코딩 `business-rules.json` 직접 존재검사 → STEP 3 서브디렉토리화 시 BR 노드 silent drop 방지 위해 본 seam 도입 필수.
- **[정정 5 — 버전 0.4.0 MINOR]**: PATCH ❌. 신규 finding kind `discovery.br_source.shape_unrecognized` + gate #1 verdict 변화(N critical-block → 1 high non-block) = 호환 기능추가. CHANGELOG SemVer 표 + v0.2.0(PmdPlugin MINOR) 선례.
- **[정정 6 — 5번째 consumer 명시]**: `graph-synthesizer.js:280` `(d?.business_rules ?? [])` = traceability-graph 의 실 BR 소비점(builder.js:68 `chain.businessRules` 는 cli 에서 unset = latent gap / 본 STEP 2 에서 BR 을 buildMatrix 에도 흘릴지 = 점검 항목, 무행동이면 명시).

**재배선 최종 목록**(4 reader → 정정 반영): br-cross(`loadBusinessRules(target)`) / federator(`loadBusinessRules(brPath,{readJson})`) / traceability-graph(cli 루프 business-rules kind 정규화) / discovery-extraction(`normalizeAnalysisBusinessRules` + mis-fire 판별). 필명매핑 상수(hooks-bridge:140 등)는 여전히 scope-out(STEP 3 index 가 파일명 유지 → 매핑 무영향 / Senior 점검결과 안전).

## 7. Lessons Learned
- **Senior 사실검증이 plan 전제를 뒤집음** (bounded_context 0% 실측): "무조건 분할" 은 toolless 욕구였고, SSOT 목표는 subset 폐기로 분리 달성 가능. 데이터 없이 구조 결정 ❌ ([[feedback_senior_fact_check_supplement]] [[feedback_zero_base_no_carry_anchor]]).
- **파일명 보존 ≠ churn 최소**: top-level shape 가 바뀌면 "내용 파싱" reader 전부 영향 = silent break. 영리함 환상.
- 큰 breaking 은 **토대(데이터 채움 + 경로통일 + loader) 먼저, 포맷전환 마지막** 순서가 gate 안전.
- **STEP 1 실행 — "예제는 gate 검증 안 됨" 가정이 또 틀림**: release-readiness `analysis_validator_violation` 이 예제 business-rules.json 을 **전수 schema 검증** → `required` 승격이 14 예제(113 rule) 즉시 invalid 화 = 백필 의무. schema 자체 test(schema-validator 픽스처)도 14건 깨짐. **"required 만들면 그 필드 없는 모든 것이 깨진다"** — 당연하나 blast 반경(예제+픽스처)을 사전 정확 측정 필요. id-prefix derive 스크립트로 일괄 백필(시점 기록물 = 정밀 domain 매핑은 STEP 3 재생성).
- **pre-existing fail 분리 검증 의무**: findings-aggregator 7 fail + workspace_test = clean 트리 stash 에서 동일 재현 → 내 회귀 아님(정직 표기). 게이트 빨강 = 항상 "내 변경 vs 환경/기존" 분리.

## 9. STEP 3 상세설계 (2026-06-08 / 현재 코드 재실측 후 / 승인 대상)

> STEP 0+1+2 시행·커밋 완료 후 STEP 3 착수. 2 Explore + 직접 코드확인으로 **plan §2(원설계, living-sync 이전 작성)를 현재 코드 기준 재실측 → 가정 2건 정정**. 측정: BC 채움률 = **8/8 PoC 100%**(STEP 1 백필 효과 / distinct BC 1~5). plan §6b 가 STEP 3 보류 근거로 든 "7/8 PoC 0% → 분할 무의미" = **해소됨**.

### 9.1 실측 정정 (plan §2 대비)

- **[정정 A — 그래프 노드 모델은 이미 per-BC/per-BR 분할 인지(living-sync S5/S6 효과)]**: plan §2.4/§5 R-2 가 "파일=노드 → 분할 시 graph-synthesizer 재설계 필요"로 봤으나, **현 graph-synthesizer.js:687-729 는 이미 index 1-parent + per-BC child(`analysis-business-rules-<bc>`) + per-BR child(`analysis-business-rules-<brId>`) 를 합성**(Phase 4 + S5 + S6). 입력은 `analysis['business-rules'].business_rules` **전체 배열**(L690). → **STEP 3 가 graph 노드모델을 건드릴 필요 없음.** loadBusinessRules 가 index→per-BC sibling 을 재조립해 전체 배열을 돌려주면 graph 는 물리 파일레이아웃과 무관하게 그대로 동작. (원설계 대비 대폭 단순화.)
- **[정정 B — living-sync sync.js 가 loader 우회 = 신규 blast point]**: `chain-driver/src/sync.js` 의 `subsetRules`(L34-38) + `diffBusinessRulesByRule`(L50-68) 는 **loadBusinessRules 를 안 쓰고 직접 readFileSync→strict `normalizeBusinessRules`**. business-rules.json 이 index(=`{bc_files:[...]}`, `business_rules` 키 부재) 가 되면 둘 다 **`[]` 반환 → living-sync S2 subset-hash + per-BR diff 가 조용히 0건**(drift 미발화 / per-BR origin 미시드). **이 2 함수 = STEP 3 필수 재배선 지점**(plan §2 미인지 / living-sync 가 STEP 2 이후 추가됨).
  - `brDiffOrigins`(cli.js:1813): `oldParsed = git show ref:business-rules.json` (단일 blob) + `newParsed = readFileSync(working business-rules.json)`. index 전환 시 **old·new 모두 index blob** → per-BR diff 0. old 재구성은 git 에서 **index blob + 각 per-BC blob(`git show ref:business-rules/<bc>.json`) N+1 호출** 필요 = STEP 3 최난도.

### 9.2 STEP 3 설계 (승인 대상)

**(a) loader — 단일 변경 지점 (`_shared/load-business-rules.js`)**
- `loadBusinessRules(target, opts)` 내부에 index 감지 분기 추가: parsed 가 `Array.isArray(parsed.bc_files)` 면(=index) → index 의 dir(`dirname(resolvedIndexPath)`) 기준 `business-rules/<file>` 형제들을 readJson → 각 per-BC 파일의 `business_rules[]` 를 concat → 전체 배열. 일반 `{business_rules:[]}`(분할 전 옛 포맷) 도 그대로 수용(backward-compat = 마이그레이션 안 한 시점기록 예제 보존). bcFilter 는 재조립 후 적용(또는 index 의 bc_files 로 필요한 per-BC 파일만 선택 로드 = 토큰 절약 / 선택적).
- `normalizeBusinessRules`(strict canonical, 이미-파싱 객체 전용) = **무변경**(graph-synthesizer:280, sync.js 가 직접 호출). 단 sync.js 는 (b) 에서 loader 경유로 재배선.

**(b) living-sync 재배선 (`chain-driver/src/sync.js` + `cli.js`)**
- `subsetRules(absPath, bcs)` → `loadBusinessRules(absPath, {bcFilter: r => set.has(r.bounded_context)})` 로 교체(index 재조립 자동). hashBusinessRulesSubset 결정성 불변(재조립 배열 → 동일 canonicalStringify+sort).
- `brDiffOrigins`(cli.js): old/new 를 **full-rule 배열로 재구성 후** diff. new = `loadBusinessRules(brAbs)`. old = 신규 helper `reconstructBrFromGit(git, ref, indexRelPosix)`: index blob 파싱 → `bc_files[].file` 순회하며 `git show ref:business-rules/<file>` blob 파싱·concat → 전체 배열. ref 에 index 부재 = 신규(전 rule added). per-BC blob 부재 = 그 BC skip(부분). diffBusinessRulesByRule 시그니처를 **parsed-object → rule-array** 로 바꿀지(권장: `diffRuleArrays(oldArr, newArr)`) 또는 wrapper `{business_rules:oldArr}` 주입할지 = 적대검토 항목.

**(c) schema (breaking)**
- 신규 `schemas/business-rules-index.schema.json`: `{ $schema_ref?, meta?, bc_files: [{ bounded_context, file, rule_count, rule_ids[] }], total_rules }` / `additionalProperties:false` / `$schema_ref` 허용(라우팅).
- `schemas/business-rules.schema.json` = **per-BC 파일 schema 로 재정의**: top-level `{ $schema_ref?, bounded_context(required), business_rules: [businessRule] }`. `$defs.businessRule` 재사용(rule 형식 불변). rule 내부 bounded_context 보존(self-describing / file↔rule drift 검출).
- **라우팅**(schema-validator inferSchemaName): index 파일은 basename `business-rules.json` → 파일명 fallback 이 `business-rules.schema.json`(=per-BC schema) 로 **오라우팅**. ∴ index 파일은 **`$schema_ref:"…/business-rules-index.schema.json"` 명시 필수**. per-BC 파일(basename `<bc>.json`) 도 파일명 fallback 부정합 → **`$schema_ref:"…/business-rules.schema.json"` 명시 필수**. writer 가 둘 다 emit.

**(d) writer (`skills/analysis-business-rules/SKILL.md`)**
- "단일 business-rules.json 산출"(L54-56) → "BC 그룹핑 → `business-rules/<bc-slug>.json` per-BC(각 `$schema_ref`+`bounded_context`+`business_rules[]`) + `business-rules.json` index(`$schema_ref`+`bc_files`+통계) 산출". BC 미정 = `business-rules/_uncategorized.json`(단 STEP 1 로 bounded_context required → 실무상 미발생 / 안전망).

**(e) release-readiness check8 + flows + docs**
- `discoverPocSchemaArtifacts`(release-readiness.js:371): 현재 basename∈TARGETS 만 발견 → per-BC 파일(`business-rules/<bc>.json`) **미발견**. → `business-rules/` 디렉토리 하위 `*.json` 도 발견·schema-validate 추가(또는 $schema_ref 보유 파일 일반 스캔). index 파일은 계속 발견(basename 일치) → index schema 검증 + br-cross 는 index 경유(loader 재조립 → rule 전수). br-cross-consistency-validator 무변경(loadBusinessRules 경유라 자동).
- flows: `analysis.phase-flow.json:60` outputs + `discovery.phase-flow.json:20` inputs 의 `business-rules.json` → `business-rules.json`(index 유지) + `business-rules/*.json` glob 표기. artifact-registry 동일.
- docs: `deliverables/5-business-rules.md`(파일위치) / `lifecycle-contract.md:290`(경로 컨벤션) / `id-conventions.md`(파일명 규칙 — BR id 형식은 불변). subset 서술은 STEP 0 에서 이미 제거됨(재확인).

**(f) examples 마이그레이션 — 전수 필요(부분 ❌)**
- business-rules.schema.json 을 per-BC 로 재정의하면 **현 단일파일 예제 8개 전부 schema-invalid**(top-level `{business_rules:[]}` = 신 per-BC schema 의 `bounded_context` required 미충족) → release-readiness check8 즉시 빨강. ∴ plan §2.6 "poc-01 만 재생성" = **오판**(STEP 1 의 "required → 전부 깨짐" LL 재현). **8 PoC canonical output 전수 마이그레이션**(index+per-BC dir) = 결정적 스크립트(BC 그룹핑 + $schema_ref 주입)로 일괄. input/ fixture·legacy output/rules/·analysis/6-quality/ = 시점기록물 → loader backward-compat(옛 단일포맷 수용)로 무이동 보존(단 release-readiness 가 검증하는 canonical 경로만 마이그레이션).

### 9.3 검증 기준 (STEP 3)
- 신규 loader index 재조립 단위 test(index→full array / bcFilter 선택로드 / 옛 단일포맷 backward-compat / per-BC blob 부재 부분로드).
- sync.js: hashBusinessRulesSubset 결정성 불변 test(단일↔index 동일 hash) + brDiffOrigins git 재구성 test(index 분할에서 per-BR diff 정확).
- graph-synthesizer: poc-01 분할 후 per-BC/per-BR 노드 수·cross_reference 무회귀(분할 전후 그래프 동형).
- schema-validator: index + per-BC 양 schema green. release-readiness check8 통과(8 PoC 마이그레이션 후 전수 valid + br-cross 0 critical).
- release-readiness 전체 통과(이 환경 baseline = 40/40 또는 기지 env artifact 분리).

### 9.4 STEP 3 Risk
- **R3-1 living-sync 회귀(최우선)**: subsetRules/brDiffOrigins 재배선 누락 시 drift·per-BR 조용히 死. → sync.test.js 기존 green 확인 후 교체(샌드위치) + index 분할 신규 fixture test.
- **R3-2 git old 재구성 복잡도**: brDiffOrigins old = N+1 git show. ref 에 일부 per-BC 파일만 존재(과거 비분할 시점)면? → index 부재 시 단일파일 fallback(`git show ref:business-rules.json` 을 옛 포맷으로 normalize) = 분할 도입 경계 commit 넘는 diff 안전. 적대검토 항목.
- **R3-3 8 예제 전수 마이그레이션 blast**: 결정적 스크립트 + schema-valid 사후검증. 시점기록(input/·legacy) 무이동 경계 명확화.
- **R3-4 §8.1**: 구조 리팩터(자동화율 axis 무관). poc-01 + ≥1 추가 도메인(poc-02 5-BC 또는 poc-19 4-BC) 분할 실산출로 멀티-BC 입증.
- **R3-5 Senior 적대검토 의무**(R2-3 동형): 코드착수 전 1회 — (i) loader index 분기 backward-compat 경계, (ii) brDiffOrigins git 재구성 ref-경계(분할 도입 commit 전후), (iii) diffBusinessRulesByRule 시그니처 변경 vs wrapper, (iv) schema 재정의로 인한 8 예제 전수 마이그레이션이 시점기록 보존 원칙과 충돌 안 하는지, (v) bcFilter 선택로드가 br-cross 전수검사(전체 필요)와 모순 안 하는지.
- **R3-6 버전**: 산출물 포맷 breaking(단일→index+per-BC) + schema 재정의 + 신규 schema = **MINOR 0.x(0.5.0 후보)**. 0.x 라 breaking 도 MINOR 관행(SemVer 0.x) / CHANGELOG breaking 명시.

### 9.5 scope-out (본 STEP 3 제외 / follow-on)
- domain.json(41KB)·antipatterns.json(72KB) 동일 분할 = 별도 결정(plan §5 R-5 유지).
- bcFilter 기반 **선택 로드 최적화**(scope 단계가 해당 BC per-BC 파일만 로드 = 토큰 절약)는 index 가 깔리면 가능해지나, 본 STEP 3 = "전체 재조립 정합" 우선. 선택로드 소비처 배선 = follow-on(YAGNI 경계).

### 9.6 REVISED (Senior 적대검토 REVISE@0.83 / 2026-06-08 / BLOCKER 3건 코드확인 후)

> §9 설계 골격(loader single-point / graph 무회귀 / schema 라우팅)은 코드 정합 확인. BLOCKER 3건 반영:

- **[BLOCKER-1 — `--git` brChanged path-partition / cli.js:1934]**: `--git` 모드(carry 1b)는 `brChanged = changed.includes('.ai-context/output/business-rules.json')` 정확매치. 분할 후 실 rule 편집은 `business-rules/<bc>.json` 에서 발생 → index(`business-rules.json`)는 통계 변경 시에만 갱신 → **per-BC 만 수정한 흔한 케이스에서 brChanged=false → per-BR origin 死 + nonBr 에 per-BC 경로 섞여 오라우팅**. **수정**: brChanged 판정을 `changed.some(p => p === brRelPosix || p.startsWith('.ai-context/output/business-rules/'))` 로 확장. brAbs/brRelPosix 는 index 경로 유지(old 재구성 anchor). nonBr 에서 per-BC 경로 제외. (--git test 신규 fixture 의무.)
- **[BLOCKER-2 — examples 19개 전수 / schema oneOf 보존안 / release-readiness.js:371-401]**: check8 `discoverPocSchemaArtifacts` 는 `examples/` 재귀 + basename==`business-rules.json` 전수 수집 = **19개**(canonical `.ai-context/output/` + legacy `output/rules/` + input fixture 9 + `analysis/6-quality/`). `$schema_ref` 보유는 3개뿐. business-rules.schema.json 을 per-BC 로 파괴적 재정의하면 나머지 16개 파일명-fallback → 신 per-BC schema invalid 폭발(STEP 1 LL 재현). **수정 = 시점기록물 보존 정합**:
  - **`business-rules.schema.json`(well-known 파일명) = `oneOf[ indexShape, legacySingleFileShape ]`** 로 정의. indexShape=`{bc_files[], total_rules, meta?}`, legacySingleFileShape=`{business_rules[]}`(현행). → index 신산출 valid + 옛 단일파일 시점기록(input fixture·legacy output/rules) **무이동 valid 유지**. 두 branch 는 required 키(`bc_files` vs `business_rules`)로 disjoint = oneOf 안전.
  - **per-BC 파일 schema = 신규 `business-rules-bc.schema.json`**(`{bounded_context(required), business_rules[]}` / `$defs.businessRule` 재사용). per-BC 파일(basename `<bc>.json`)은 `$schema_ref` 명시로 라우팅. business-rules-index 별도 schema 불요(index branch 를 well-known schema 의 oneOf 에 흡수 = 파일 1개 절약 / 라우팅 단순).
  - **마이그레이션 실대상 = canonical output 보유 PoC 만**(poc-05/18/19 = `.ai-context/output/business-rules.json` / poc-01·02·03·14 의 `output/rules/`·`analysis/6-quality/` = legacy 시점기록 → oneOf legacy branch 로 무이동 valid). "8개 전수" → **canonical 3개 마이그레이션 + 16개 무이동 보존**으로 정정. (release-readiness 무회귀: 16 legacy = legacy branch valid / 3 canonical = index+per-BC valid.)
- **[BLOCKER-3 — baseline hash 무효화 / sync.js register·detect·cascade]**: 분할은 BR byte-hash·subset-hash 전부 변경 → 기존 채택자/dogfood manifest `sync_sources[].version` stale → 분할 직후 전 scope drift 오발화. 실사용자 0·미배포라 prod 영향 ❌. **수정**: §9.3 검증기준에 "분할 도입 후 dogfood(poc-20 등) manifest `registerCanonicalSources` 재실행 = baseline 재정렬" 절차 추가. subsetRules 단일 교체로 register/detect/cascade 3 호출점 자동 수복(sync.js:108/141/211 가 전부 subsetRules 경유 = 단일 변경점 정합 / Senior 확인).
- **[minor — diffBusinessRulesByRule wrapper 유지]**: 시그니처(parsed-object 2개) 변경 시 sync.test.js:397-422 충돌 → **시그니처 보존 + brDiffOrigins 가 재조립 배열을 `{business_rules: arr}` wrapper 로 주입**(무회귀). reconstructBrFromGit 도 `{business_rules: concat}` 반환.
- **[minor — br-cross 는 index 1회만(의도) 명문화]**: per-BC 개별 파일엔 br-cross 미적용 = 전수 일관성은 index 재조립 1회로 충분(의도). §9.2(e) 에 1줄 명시.
- **[미확인 carry]**: reconstructBrFromGit 의 Windows per-BC blob 경로(posix 정규화) = 구현 시 brRelPosix 동형 정규화 확인. domain/antipatterns 동일소비 = §9.5 scope-out 유지.
