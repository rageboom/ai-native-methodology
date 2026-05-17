# research — 묶음 Q ⑦: rules.json → business-rules.json 산출물 파일명 rename

> 4원칙 2단계 산출. session 26차 연속 (2026-05-17). 3-에이전트 full research (official-docs / industry-case / Senior) + Senior caveat close round (hardcoded literal 전수 grep).
> 입력 plan = `.claude/plans/plan-q7-rules-json-rename.md` (Senior REVISE-3 정정 반영).

## 1. official-docs-checker (json-schema.org / semver.org)

| # | 검증 | 판정 |
|---|---|---|
| 1 | $id ↔ 파일명 독립 / rename 시 $id 불변 합법 | **VERIFIED** — $id = network-independent 식별자. $id 변경 시 그 schema 를 `$ref` 하는 schema 영향 (⑦: 다른 schema 가 rules.schema.json 을 $ref ❌ / $comment·description 텍스트만 → $id 변경 영향 0) |
| 2 | 파일명 기반 resolution = 표준? | **VERIFIED (비표준)** — JSON Schema 표준 = `$schema`/`$id` URI 기반. "basename+.schema.json" = 이 도구 고유 구현. 영향 = 도구 내부 한정 |
| 3 | 산출물 파일명 rename = semver MAJOR? | **UNCLEAR (조건부)** — semver public API = 프로젝트 선언. 외부 consumer 0 + public API 선언 밖 = MAJOR 미충족 가능 / 단 broad internal = MINOR 도 부정확. ★ 프로젝트가 산출물 파일명을 계약으로 처우(11 PoC + tooling literal resolution)하면 MAJOR |

## 2. industry-case-researcher

- **파일명 rename = MAJOR 트리거 우세** (ESLint v9 `.eslintrc`→`eslint.config.js` = MAJOR). phased rollout 기간 = ★ **외부 consumer 수 정비례** → 외부 consumer 0 = 유예 없이 **즉시 MAJOR + 동시 rename = 가장 가벼운 패턴**. TypeScript tsconfig rename 기각 = tooling breadth(IDE/CI) 광대 시 cost 지수적 — ★ 단일 내부 repo dogfooding 은 역으로 rename 실행 가능 근거.
- **대규모 occurrence rename = codemod/script 자동화 산업 통념** (Airbnb 50K line/1K files 1일 / Webflow fixture-test 선작성). ★ 단 본 레포 = ① bulk script auto-mode classifier 차단 선례 (산업 통념 ≠ 본 레포 제약 / Senior 제약 우선).
- **역사 보존 분리 통념** — "왜"(ADR/CHANGELOG) vs "어디"(git diff/script) 분리. 단일 문서 혼합 사례 ❌.
- ⇒ 4-piece (MAJOR 1회 + rename + ADR 1 + CHANGELOG breaking) 선례 정합. ESLint 식 단계 유예 = 적용 근거 없음.

## 3. Senior — REVISE-3 (★ 핵심 사실 정정) + close round

### 3.1 ★ ★ ★ 사실 정정 (no-simulation 실측)

- 11 PoC schema key: **3 `$schema_ref`(poc-01/02/03)** / **1 `$schema_origin`(poc-04)** / **7 무키(poc-05~11)**
- inferSchemaName(cli.js:57-70) = `$schema_origin`·`$schema` 만 읽음 (`$schema_ref` ❌) → poc-01/02/03 도 이미 fallback path 3 / rename 후 `business-rules.json`→`business-rules.schema.json` **auto-correct**. 7 무키 = pure fallback auto-correct.
- ⇒ ★ 실제 value-edit 의무 = **poc-04 `$schema_origin` 1개만** + poc-01/02/03 `$schema_ref` stale dangling honesty-update (resolution 안 깨짐). plan §1.2 "11 동시 갱신" = ~7 과대 (정정 완료).

### 3.2 D1 version v7.0.0 MAJOR → CONCUR (confidence 0.82)

- Q-①-followup(MINOR) 과 ★ 결정적 차이 = property rename(co-migrated atomic / zero stranded) vs **파일 artifact rename(deliverable contract surface)**. hardcoded literal consumers (`discoverPocRulesJson` release-readiness:266 `e.name==='rules.json'` / findings-aggregator:83 `input/rules.json`) = resolution-by-literal-filename / co-located ❌. atomicity 가 published name 변경 사실 못 지움. LL-i-56 real-tier = MAJOR sound (selector-inertia ❌).

### 3.3 D5 mechanism → CONCUR + 제약 (confidence 0.80)

- 안전 = (a) 12 git mv 명령 (history-preserving / content 무손) (b) 코드·schema-xref·활성 SSOT = 분류별 **Read-then-Edit** (script ❌ / classifier gate 보존) (c) 역사/archive(decisions/CHANGELOG/dist) 무수정. ★ sed/script bulk-replace 거부 (① §2 no-simulation/classifier discipline 선례). 252 = 과장 (대부분 doc prose / classification-bounded).

### 3.4 STOP (Senior 재판정)

- **STOP-1 → advisory 강등**: 10/11 fallback auto-correct / poc-04만 value-edit. blocking ❌ = post-mv dry-run checklist.
- **★ ★ STOP-3 (신규)**: hardcoded literal 3곳 = 실제 fragile resolution. post-rename **workspace test + release-readiness 11/11 통과 or revert** = hard go/no-go.
- caveat close (본 round grep) — br-cross-consistency·planning-extraction·chain-coverage src literal = **0** (Senior 우려 de-risked) / 실제 = findings-aggregator:83 + release-readiness:111,266 = 3곳만.

### 3.5 process → 1-session 시행 (confidence 0.75)

- grep 실측 de-risked (auto-correct dominant) / LL-i-54 cost asymmetry = hot context 완료 (split = 252 re-survey 재지불) / memory cooling-off = unvalidated breaking 한정 (본 건 validated). ★ 단 post-mv dry-run hard gate 필수.

## 4. 종합 — 사용자 결단 (D1 사실 확정 / D2~D6 추천안)

| D | 결론 | 근거 수렴 |
|---|---|---|
| D1 version | ★ **v7.0.0 MAJOR** (사실 확정) | official-docs(파일명=계약 처우 시 MAJOR) + industry(파일명 rename=MAJOR 우세 / 외부 consumer 0 = 즉시 MAJOR 가장 가벼움) + Senior CONCUR(artifact contract + literal consumers / Q-①-followup 과 결정적 차이 / LL-i-56 real-tier). ★ Q-①-followup MINOR 와 대조 = "property/zero-consumer atomic" vs "파일 artifact/literal-resolution broad" |
| D2 schema 파일명 | Option A (`rules.schema.json`→`business-rules.schema.json` 동시 rename) | filename resolution 정합 (regex 하이픈 수용) / value-edit = poc-04 1 + poc-01/02/03 honesty + 7 auto-correct |
| D3 $id | `$id` 도 `business-rules.schema.json` 정합 (파일명+$id 일관) | official-docs#1 — 다른 schema 가 rules.schema.json $ref ❌ ($comment 텍스트만) → $id 변경 영향 0 / 일관성 우선 |
| D4 역사 보존 | decisions 역사 DEC + CHANGELOG + dist/internal-v* = 무수정 / 활성 SSOT(ADR §5 신규 + deliverables 5 + skills + 8 schema cross-ref + 최상단) 갱신 | LL-i-52 silent 재작성 ❌ / industry "왜 vs 어디" 분리 |
| D5 mechanism | git mv 12 명령 + 분류별 Read-then-Edit + 역사 무수정 (sed/script ❌) | Senior 제약 (① classifier 선례) |
| D6 cooling-off / process | 1-session 시행 (cooling-off 별도 session 불요) + ★ post-mv dry-run hard gate (schema-validator 11/11 + workspace + release-readiness 11/11 or revert) | Senior(validated / LL-i-54 hot context) — 사용자 명시 결단 |

## 5. 잔존 STOP / 위험

- STOP-3 (hardcoded literal 3곳) = blocking gate (post-mv 11/11 or revert / 코드 착수 후 즉시 검증). 그 외 blocking 없음.
- ★ 신규 LL 후보 = LL-i-57 ("파일명 rename = artifact contract 변경 = MAJOR (property rename/MINOR 와 tier 분리 / LL-i-56 확장) — 단 비표준 filename-based resolution 의 fallback 자동정합 비중을 코드 착수 전 grep 실측해야 실제 edit scope 확정 (양심 추정 시 ~7배 과대) / hardcoded literal consumer = 실제 fragile resolution = post-mv hard gate").

## 6. 다음 단계

사용자 결단 (D1 v7.0.0 MAJOR 사실 확정 보고 + D2~D6 추천안 묶음) → 4원칙 3단계 승인 후 시행 (plan §3 + STOP-3 post-mv hard gate).
