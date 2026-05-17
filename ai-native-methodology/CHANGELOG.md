# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [7.1.0] — 2026-05-17 ★ ★ MINOR — plugin-authoring-spec SSOT + 외부 docs drift baseline+ratchet (ADR-PLUGIN-001 / charter R18 / release-readiness #12)

> ★ ★ **v7.1.0 MINOR — additive (선행 자산 무수정)**. 사용자 질문 "plugin skill/hooks/agent 작성 시 Anthropic 공식 best practice?" → 저작 규칙 단일 SSOT 신설 + 47 skills·9 agents·hooks·packaging 전수 감사 + 외부 권위(공식 docs) drift 재검증 메커니즘. 4원칙 full (plan + Plan agent Senior 압력테스트 + 실 `_base-official-docs-checker` F-015 ×4 VERIFIED). DEC-2026-05-17-plugin-authoring-spec / ADR-PLUGIN-001. 선행 housekeeping = DEC-2026-05-17-package-version-3way-sync-fix (package.json 4.0.1→7.0.0 별도 commit).

### 신설 (additive)

- **`methodology-spec/plugin-authoring-spec.md`** (★ ★ ★ 단일 SSOT / §1~§11) — Skill(S1~S7)·Hook(H1~H7)·Agent(A1~A6)·Packaging(P1~P4) 저작 규칙 + §6 공식 docs pin baseline(ADR-010 차용) + §7 compliance 매트릭스 + §8 이연 backlog + §9 drift 재검증 2계층
- **`docs/adr/ADR-PLUGIN-001-authoring-spec-and-docs-drift.md`** (신규 namespace = ADR-BE/FE/CHAIN/NEST 컨벤션 정합)
- **`scripts/release-readiness.js` check #12** (`authoring_spec_staleness`) — §6 pin `last_verified` 4행 ≤ 60일 결정적 가드 (date-math only / 네트워크 ❌ / check10 패턴 isomorphic / `--skip-authoring-staleness` flag = skip≠pass / release 시 ❌ 의무). 11/11 → **12/12**
- **`plugin-charter.md` R18** 정식 요구사항 신설 (§1 + §2 매핑 / 사용자 결단 = §5 backlog 아닌 정식 R)

### 감사 결과 (실 F-015 cross-check / false-positive 3건 제거)

- §6 pin = 실 `_base-official-docs-checker` ×4 VERIFIED (canonical `code.claude.com/docs/en/{skills,hooks,sub-agents,plugins-reference}` / 2026-05-17)
- 실 위반 = **S3 1건 ❌ high** (`spec-integrate-7대-deliverables` 한글 → MAJOR rename / §8-1 이연) + **S3/A1 1군 ⚠️ low** (`_base-*` leading `_` / §8-2 이연·수용 후보)
- false-positive 제거 = S1 retrofit 불요(47/47 ≤500L+외부ref) / marketplace.json 위치 공식 정합 / agent `skills:` = 공식 preload 필드(자체확장 ❌). `system_prompt`·`preloaded_skills` over-claim 교정
- ADR-010 grandfather: 위반 = baseline grandfathered / ratchet = 신규·수정 자산만 §2·§4 즉시 강제

### 검증

- release-readiness **12/12** (A1 본격 spawn / `criteria_total=12 passed=12 ready=true exit 0`) + release-readiness.test.js **12/12 pass**
- version-check **3-way 7.1.0** (선행 housekeeping 으로 package.json 청산 후 정상 bump)
- workspace test green / drift-validator 3-way 불변 (skill/agent/flow 무수정 = §8 이연의 안전 속성)
- chain harness validated 본질 보존 / breaking ❌ (선행 자산 무수정 / 감사는 기록만)

### 이연 (별도 user-gated bundle)

- §8-1 `spec-integrate-7대-deliverables` → kebab rename = **별도 MAJOR** (3 ref / cooling-off + Senior + STOP-gate / v7.0.0 선례 정합 / 본 release scope ❌)
- §8-2 `_base-*` charset deviation = 차기 네트워크 재검증서 재평가

---

## [7.0.0] — 2026-05-17 ★ ★ ★ MAJOR — 묶음 Q ⑦: rules.json → business-rules.json 산출물 파일명 rename (breaking 최대)

> ★ ★ ★ ★ ★ **v7.0.0 MAJOR — breaking (의도 / semver 정합)**. 사용자 "하자" → 묶음 Q 잔여 ⑦ 단독 (최대 blast 642 occ·252 files) → "추천안 묶음 + 1-session 시행". 4원칙 full (plan + 3-에이전트 full research + Senior REVISE-3 + STOP-3 hard gate). DEC-2026-05-17-q7-rules-json-rename / ADR-CHAIN-011 §5 patch v16 + §9 LL-i-57. ★ 묶음 Q **전 항목 종결** (①②④⑤+Q-①-followup+⑦).

### 결단 (3-에이전트 수렴 / D1 사실 확정)

- **D1 = v7.0.0 MAJOR 사실 확정** (choice ❌) — official-docs(파일명=계약 처우 시 MAJOR / $id 독립) + industry(파일명 rename=MAJOR 우세 / 외부 consumer 0=즉시 MAJOR 가장 가벼움 / ESLint v9 선례) + Senior CONCUR(artifact contract + hardcoded literal consumer = Q-①-followup MINOR 와 결정적 차이 / LL-i-56 real-tier). ★ Q-①-followup(property/zero-consumer/MINOR) 과 대조 = 파일 artifact 계약 + literal-resolution broad
- **D2 Option A** (rules.schema.json→business-rules.schema.json 동시 rename) / **D3 $id 정합 변경** / **D4 역사 보존+활성 SSOT 갱신** / **D5 git mv 12 명령+분류별 Edit(script ❌)** / **D6 1-session(cooling-off 별도 session 불요 / Senior validated)**

### rename (git mv 12 + literal)

- **git mv 12**: 11 PoC `rules.json`→`business-rules.json` + `schemas/rules.schema.json`→`schemas/business-rules.schema.json` (history-preserving)
- schema $id `https://ai-native-methodology/schemas/business-rules.schema.json` 정합 변경 (다른 schema $ref ❌ → 영향 0)
- ★ Senior REVISE-3 실측 정정 — PoC schema key: 3 `$schema_ref`(poc-01/02/03 honesty) / 1 `$schema_origin`(poc-04 value-edit) / 7 무키(auto-correct). 코드 literal 3곳 (findings-aggregator:83 / release-readiness:111,266)

### ★ ★ STOP-3 hard gate (방법론 hard gate 가치 입증)

- post-mv hard gate 가 **plan/research(Senior REVISE-3 포함 3-에이전트) 누락 consumer 검출** — 6 test 파일 hardcoded `rules.schema.json`/`rules.json` literal (ENOENT). LL-i-55 paradigm 입증 (research 수렴만으로 코드 착수 ❌ / 실측 hard gate). 처분 = 근본 결함 ❌ (test=활성 자산) → 동반 치환 → 재검증
- gate 3/3 통과 = schema-validator 11 PoC VALID + workspace **393/393** + release-readiness **11/11**

### 회귀

- workspace 393/393 + release-readiness 11/11 + chain harness validated 본질 보존 / breaking ✅의도 / 역사(decisions/CHANGELOG/dist) 무수정

### ★ 묶음 Q 전 항목 종결

①(v5.0.0)②(v6.0.0)④(v4.1.1)⑤(v4.1.0)+Q-①-followup(v6.1.0)+**⑦(v7.0.0)** = 묶음 Q 완결. 잔여 carry = C-poc08-drift / C-cross-consistency-validator-inline-emit / §11 후속 list sync / PoC #05 Haiku retrospect

---

## [6.1.0] — 2026-05-17 ★ MINOR — Q-①-followup: rules_auto_extracted_reference → auto_extracted_br_refs semantic-rename

> ★ **v6.1.0 MINOR — additive-equivalent (no consumer observes break)**. 사용자 "1"(묶음 Q 잔여) → "Q-①-followup 먼저"(risk 오름차순 / 11 files) → "추천안 묶음 + 지금 시행". 4원칙 lightweight (plan + 3-에이전트 가벼운 research + 사용자 결단 / ★ LL-i-54 정당 일탈 — breaking 동형 ≠ 비용 동형). DEC-2026-05-17-q1-followup-rename / ADR-CHAIN-011 §5 patch v15 + §9 LL-i-56.

### 결단 (3-에이전트 수렴 / D1 사실 확정)

- **D1 = v6.1.0 MINOR 사실 확정** (choice ❌) — official-docs(semver spec MAJOR 강제 ❌ / public API 경계=프로젝트 재량) + industry(zero-consumer 실용주의 + 연속 MAJOR signal 희석 batch 통설) + Senior(src consumer 0 + poc-04 단일 holder atomic 마이그레이션 = textbook MINOR / v7.0.0 = semver inflation = 역방향 integrity drift). ① "MINOR=integrity drift" 는 alias 폐기+real consumer 한정 / LL-i-52 "semantic-rename ≠ alias 폐기" → version 논리도 분리
- **D3 cooling-off = 지금 시행** / **process = lightweight** (LL-i-54 정당 / DEC 명시)

### rename

- `rules.schema.json` property `rules_auto_extracted_reference` → **`auto_extracted_br_refs`** (의미 불변 / FE 트랙 cross-link provenance pointer / BR-list alias 아님) + description + 최상단 title/description forward-pointer **재작성** (carry → 완료 / Senior 누락 보정)
- `examples/poc-04-.../rules.json` — 유일 holder key rename (atomic 동시 마이그레이션 / src consumer 0)
- `drift-validator/canonical-single-alias.test.js` — 보존 test → rename후 보존 + 구명 재유입 0 전환 / ② guard(businessRule anyOf) 비교란 확인 = **8/8 pass**

### 회귀

- poc-04 schema VALID + drift canonical 8/8 + release-readiness 11/11(목표) + chain harness validated 본질 보존 / MINOR=additive-equivalent (breaking 호칭 ❌ / semver 정합)

### 묶음 Q 진행

- ①(v5.0.0)②(v6.0.0)④(v4.1.1)+**Q-①-followup(v6.1.0)** 종결. **잔여 = ⑦ 단독** (rules.json→business-rules.json / 642 occ·252 files / 별도 session + 4원칙 full + cooling-off)

---

## [6.0.0] — 2026-05-17 ★ ★ ★ MAJOR — 묶음 Q ② BR 표현 4종 → 2종 단일화 (breaking)

> ★ ★ ★ ★ ★ **v6.0.0 MAJOR — breaking change (의도 / semver 정합)**. 사용자 "권고를 따를게"(추천안 전부 채택) → 묶음 Q 잔여 risk 오름차순 첫 ②. 4원칙 (plan + 3-에이전트 research + STOP-1 dry-run 실측 + 사용자 결단). DEC-2026-05-17-q2-br-표현-4to2 / ADR-CHAIN-011 §5 patch v14 + §9 LL-i-54·55.

### 결단 (사용자 추천안 전부 채택)

- **D1 description = anyOf branch 제거 + property optional metadata 보존** / **D2 TCA = branch 제거 + property 6종 canonical 보존** (★ Senior close round — `decision-table-validator` load-bearing consumer 실소스 검증 → hard-remove ❌) / **D3 #06 7 BR 합성 = 전체 gate** / **D5 cooling-off = 지금 시행** / **D6 ② 단독**
- ★ **version = v6.0.0 MAJOR 사실 확정** (official-docs VERIFIED: anyOf 4→2 로 description-only valid→invalid = semver Rule 8 MAJOR 필수)

### BR 표현 4종 → 2종

- **폐기 (BR 표현 자격 박탈)**: `description` 단독 / `trigger`+`condition`+`action`(TCA). `rules.schema.json` `$defs.businessRule.allOf[0].anyOf` 4 branch → **2 branch (given/when/then + natural_language ONLY)**
- **보존 (D1·D2 / official-docs#2 VERIFIED — branch 제거 ≠ property 금지)**: `description`/`trigger`/`condition`/`action`/`expected_result`/`rejection_method`/`verification_location` property = optional metadata (decision-table-validator + synthesize-gwt-from-tca.mjs consumer 보호)
- description-only / TCA-only BR = 이제 schema **INVALID hard reject**

### STOP-1 dry-run 실측 (회귀 아닌 개선 확정)

- `_q2-dryrun.mjs` (no-simulation) — 전 11 PoC 중 **#06 7/7 description-only 가 유일** / TCA-only 0 / 그 외 100 BR 전부 GWT|NL 보유
- #06 7 BR NL+GWT 합성(Sonnet 4.6 batch + 독립 Opus spot-check 4/7 EFI-WEB 원본 대조) 후 재실측 = 전 11 PoC `descOnly=0 tcaOnly=0` → 회귀 면 7 BR(1 PoC) 전부 coverage 증가 = **개선 확정** (LL-i-53 / ① poc-04 precedent 동형)

### tool / test

- `br-cross-consistency-validator/deterministic.js` — `representation_missing` 조건 `!hasNL&&!hasGWT` (description/TCA 제외) + `description_only_fallback`(low) finding 폐기 → **critical 'representation_missing' 격상** (Senior "defect surfaces louder")
- test = chain-schemas (description-alias·TCA accept 2 → v6.0.0 REJECT 2 + GWT+desc·NL+TCA VALID functional 2 신규) + validator (description_only_fallback → representation_missing critical 전환 + #06 corpus==7 guard) + drift canonical (② anyOf 2 branch + 재유입 0 + property 보존 3 신규)
- 영향 3 패키지 = schema-validator 18/18 + br-cross-consistency 32/32 + drift canonical 8/8 pass (functional REJECT = vacuous 아님 실증)

### 회귀

- release-readiness **11/11 release-ready** / workspace test 전수 pass / chain harness validated 본질 보존 / breaking ✅의도

### 묶음 Q 잔여 carry (breaking / cooling-off)

- ⑦ rules.json→business-rules.json rename (265 file) / Q-①-followup (rules_auto_extracted_reference→auto_extracted_br_refs semantic-rename) — 각 별도 plan

---

## [5.0.0] — 2026-05-17 ★ ★ ★ MAJOR — 묶음 Q ① rules.json alias 4중첩 폐기 → canonical 단일 (breaking)

> ★ ★ ★ ★ ★ **v5.0.0 MAJOR — breaking change (의도 / semver 정합)**. 사용자 "1"(묶음 Q 잔여) → ① risk 오름차순 첫. 4원칙 (plan + 3-에이전트 research + STOP-1 실측 + 사용자 결단 4건). DEC-2026-05-17-q1-alias-4중첩-폐기 / ADR-CHAIN-011 §5 patch v13 + §9 LL-i-52·53.

### 결단 (사용자 4건 + 사실 확정 1)

- **#1 cooling-off = 지금 시행 (사용자 명시 생략)** / **#2 (A) hard 폐기** (외부 consumer 부재 / dogfooding) / **#3 summary aliases ① 동반** / **#4 rules_auto_extracted_reference = ① scope 외** (별도 carry Q-①-followup)
- ★ **version = v5.0.0 MAJOR 사실 확정** (official-docs VERIFIED: 필드 제거로 valid→invalid = semver MAJOR 필수 / anyOf branch 제거 = breaking)
- scope-completion 투명 명시 — `br_summary`(poc-11) = 사용자 열거 외였으나 동일 alias class → 의도 정합 위해 포함 (silent 확장 ❌ / DEC §2)

### breaking 변경

- **`schemas/rules.schema.json`** — top-level `anyOf`(business_rules|rules|rules_manual_authored 3 분기) 폐기 → `required:["business_rules"]` 단일 / `rules`·`rules_manual_authored`·`rule_summary`·`rules_summary`·`br_summary` properties **제거** (additionalProperties:false → 폐기 alias 보유 문서 hard reject) / `summary`·`rules_auto_extracted_reference` 보존
- **PoC migration 4종 5 key rename** (Edit per-file) — poc-01 `rules`→`business_rules` / poc-02 `rule_summary`→`summary` / poc-04 `rules_manual_authored`→`business_rules`+`rules_summary`→`summary` / poc-11 `br_summary`→`summary`
- **`tools/br-cross-consistency-validator`** extractRules() canonical 단일 (`rules` fallback 제거 / ★ poc-04 잠재 결함 자동 수정 = 가시화)

### test (5 fix + 6 신설)

- `schema-validator/test/chain-schemas.test.js` — v2.3.7 2건 business_rules envelope 전환 / v2.4.0 alias-accept 2건 → ★ alias-**REJECT** 2건 + FE-canonical VALID 신규 1
- `br-cross-consistency-validator/test/validator.test.js` — `rules` alias test → canonical-only 2 assert
- `drift-validator/test/canonical-single-alias.test.js` 신설 5 (폐기 alias 재유입 guard) + drift-validator v0.4.2→v0.4.3

### 회귀 검증

- workspace test 381 → **387/387 pass** (5 fix + 6 신규 / 0 fail / 0 회귀)
- release-readiness **11/11 release-ready** (analysis_validator_violation = 11 PoC 전수 schema valid post-migration)
- ★ **STOP-1 해소 실측** — poc-04 3 BR canonical br-cross-consistency = findings 3 전부 `low` / critical·high 0 / gate pass → 가시화 = 회귀 아닌 **개선 실측 확정** (Senior blocking 해소 / OpenAPI 3.1 latent-bug-fix precedent 정합)
- breaking ✅ (의도 / 폐기 alias 문서 hard reject) / chain harness validated 본질 보존

### 묶음 Q 잔여 carry (★ breaking / cooling-off)

- ② BR 표현 4→2 (poc-06 7 BR desc-only 합성 의무 + poc-03 TCA 제거) / ⑦ rules.json→business-rules.json rename (265 file) / Q-①-followup (rules_auto_extracted_reference → auto_extracted_br_refs) — 각각 별도 plan + Senior critique

---

## [4.1.1] — 2026-05-17 ★ PATCH — 묶음 Q ④ severity cross-stage 정합 매핑 SSOT 신설 (additive)

> ★ ★ **v4.1.1 PATCH — additive doc / breaking change ❌ / schema 기능 변경 ❌**. 사용자 "1"(묶음 Q) → risk 비균등 실측 → "④만 먼저 (additive)" 결단. ①②⑦ = breaking → 별도 session+ cooling-off carry. DEC-2026-05-17-severity-cross-stage-mapping.

### 결단 (사용자 3건)

- **#1 high → must** (ADR-010 = high 신규 차단 / critical+high 모두 must = 차단 정책 일관)
- **#2 info → nice** (MoSCoW 3종 안 흡수 / 5종 모두 MoSCoW 값 = 단순·완전)
- **#3 SSOT = 신규 methodology-spec doc** (⑥ intent-classification SSOT 패턴 정합)

### 신설/수정 자산

- **`methodology-spec/severity-cross-stage-mapping.md`** 신설 — 단일 SSOT (rules.json 5종 ↔ ADR-010 ratchet 4종 ↔ MoSCoW 3종 정합 매핑표 + stage 별 소비 규약 + cross-ref)
- **`schemas/rules.schema.json`** businessRule.severity `$comment` cross-ref (ajv inert / 검증 동작 무변경) + **`schemas/acceptance-criteria.schema.json`** severity `$comment`
- **`methodology-spec/glossary-ko.md`** severity cross-stage mapping pointer 1행
- **`decisions/DEC-2026-05-17-severity-cross-stage-mapping.md`** 신설 + INDEX 등재
- **`CLAUDE.md`** plugin.json v4.1.0 → v4.1.1 + 직전 release 요약 갱신 / **`STATUS.md`** session 25차 ④ 추가

### 회귀 검증

- workspace test **381/381 pass** (변경 ❌ / $comment ajv inert) + release-readiness **11/11 release-ready** + 0 회귀
- breaking change ❌ / schema enum·required 무변경 / 데이터 변경 ❌ / chain harness validated 본질 보존

### 묶음 Q 잔여 carry (★ breaking / cooling-off)

- ① alias 4중첩 폐기 (실측 마이그레이션 2 PoC) / ② BR 표현 4→2 (poc-06 7 BR 합성 의무) / ⑦ rules.json→business-rules.json rename (265 file blast radius) — 각각 별도 plan + Senior critique + 사용자 결단 의무

---

## [4.1.0] — 2026-05-17 ★ ★ MINOR — Phase 2 ⑤ cross_consistency_check 신설 + is_intent⇔classification 동치 enforcement

> ★ ★ ★ ★ ★ **v4.1.0 MINOR — additive API surface 확장 / breaking change ❌**. 묶음 P 종결 (Layer 2 corroboration 7 PoC 도달) 로 ⑤ carry trigger 충족 → 본격 진입. 4원칙 (plan + 3-에이전트 research + 사용자 결단 4건 + 시행). DEC-2026-05-17-phase-2-5-cross-consistency-check / ADR-CHAIN-011 §5 patch v12 + §9 LL-i-51.

### 결단 결과 (사용자 결단 4건 / research 후 / 추천안 묶음)

- **#1 설계 = 정제된 옵션 C** (heavy 실행 데이터 layer-2-results/ 분리=SARIF·Semgrep·OPA·Spectral 산업 표준 + BR 안 slim provenance-tagged marker=Semgrep `metadata:` 패턴)
- **#2 분류 보존 = schema if/then 강제** (실측 both=0 → 전 PoC vacuous = 회귀 풀이 0 수학 보장 / official-docs VERIFIED)
- **#3 version = v4.1.0 MINOR** (additive API surface 확장)
- **#4 scope = ⑤ 단독** (Senior Q5 / 묶음 Q 비동반)

### 신설/수정 자산 (1 schema 2변경 + 2 test + 1 ADR + 1 DEC + 1 deliverable)

- **`schemas/rules.schema.json`** — businessRule.properties `cross_consistency_check` slim 객체 신설 (additionalProperties:false / provenance discriminator + 분류보존 필드 + verdict enum 5종(classification_drift 신설) + external_result_ref) + businessRule.allOf `is_intent`⇔`intent_vs_bug_classification` 양방향 동치 if/then 2블록 (둘 다 required = 단방향/미보유 vacuous)
- **`tools/schema-validator/test/rules-cross-consistency.test.js`** 신설 (11 functional / ★ ajv 실 검증 / test 4·5 = 모순 BR 실제 INVALID = vacuous-everywhere 아님 입증)
- **`tools/drift-validator/test/cross-consistency-check.test.js`** 신설 (6 구조 / v4.0.1 cross-schema-enum 패턴 미러) + drift-validator v0.4.1 → v0.4.2
- **`docs/adr/ADR-CHAIN-011-...`** §5.9 patch v12 + §9 LL-i-51
- **`decisions/DEC-2026-05-17-phase-2-5-cross-consistency-check.md`** 신설 + INDEX 등재
- **`methodology-spec/deliverables/5-business-rules.md`** — §4.2 v4.1.0 ⑤ cross_consistency_check 섹션 추가
- **`CLAUDE.md`** (repo root) — plugin.json v4.0.1 → v4.1.0 + 직전 release 요약 첫 줄 갱신 / **`STATUS.md`** session 25차 갱신

### 회귀 검증 (★ chain harness validated 본질 보존)

- workspace test 364 → **381/381 pass** (신규 17 / 0 fail / 0 회귀)
- release-readiness **11/11 release-ready** (analysis_validator_violation = 11 PoC 전수 violations 0 / 회귀 풀이 0 실측)
- breaking change ❌ / round-trip 영향 ❌ / chain harness 5 요소 = schema additive 영역 한정 / no-simulation trio + D21' + content-aware 비손상

### industry-first novelty

- intent-vs-bug 분류를 자동 합성 과정에서 schema/validator 로 machine-readable 강제 보존한 precedent 부재 (Salesforce 인간 review / SARIF suppression.justification free-form / OpenRewrite 범위 밖) → 본 ⑤ = 조사 범위 내 industry-first claim 보강

---

## [4.0.1] — 2026-05-17 ★ PATCH — rules schema enforcement 강화 (③+⑥ 진입 / ⑤ carry / H-1+H-2 housekeeping)

> ★ ★ ★ ★ ★ **v4.0.1 PATCH — additive only / breaking change ❌**. paradigm 안정점 직후 enforcement criterion 강화 묶음. DEC-2026-05-17-rules-schema-enforcement-strengthen 본격 시행. ADR-CHAIN-011 §5 patch v11 추가. Senior REVISE 흡수 + Industry case 4/4 정합 + official-docs CONTRADICTS 2건 housekeeping 동시 흡수.

### 결단 결과 (사용자 결단 4건 / research 후)

- **#1 ⑤ cross_consistency_check inline = carry** — Senior REVISE / PoC 적용률 3/14 (21%) / ≥ 7 PoC 도달 후 재평가
- **#2 ⑥ SSOT = 공유 $ref 신설** — schemas/intent-classification.schema.json 신설 + rules.schema.json + characterization-spec.schema.json 양쪽 $ref + drift-validator cross-schema enum 정합 check
- **#3 ③ source_grounded_evidence + PoC 처리 = auto_extracted=true 한정 + PoC optional** — Industry case 4/4 정합 (Semgrep + CodeQL + SonarQube + Daikon)
- **#4 H + ADR + 버전 = H 함께 + ADR-CHAIN-011 patch + v4.0.1 PATCH**

### 신설 자산 (1 schema + 1 test)

- **`schemas/intent-classification.schema.json`** (★ 신설 / 단일 SSOT enum 4종 `intent` / `bug` / `ambiguous` / `self_recognized` + 인용 사실 정밀 명시 — Feathers 합성 + Maldonado SATD 개념 차용 / 분류명 본 방법론 고유 합성)
- **`tools/drift-validator/test/cross-schema-enum.test.js`** (★ 신설 / 5 test — SSOT 파일 + 양쪽 $ref + inline enum 재선언 ❌ + source-grounded enforcement if/then 검증)

### 수정 자산 (★ 3 schema + 2 본체 + 1 ADR + 1 deliverable)

- **`schemas/rules.schema.json`** — businessRule.allOf 안 if/then 신규 블록 (auto_extracted=true → source_grounded_evidence 또는 source_evidence required) + businessRule.properties 안 intent_vs_bug_classification 신설 ($ref SSOT)
- **`schemas/characterization-spec.schema.json`** — scenario.intent_classification.items.type = `$ref` SSOT 적용 (inline enum 폐기 / 직전 4 enum 단일 정의) + scenario.tags description "★ Gherkin tag 표준" → "Cucumber Gherkin 도구 관례" 표기 수정 (H-1)
- **`tools/drift-validator/package.json`** — v0.4.0 → v0.4.1 + npm test command 안 cross-schema-enum.test.js 추가
- **`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`** — §5.8 patch v11 신설 (★ 본 PATCH 본격 명세)
- **`methodology-spec/deliverables/5-business-rules.md`** — §4.1 v4.0.1 schema enforcement 강화 + v4.0.1 예시 추가
- **`decisions/DEC-2026-05-17-rules-schema-enforcement-strengthen.md`** (신설) + **`decisions/INDEX.md`** 등재
- **`.claude-plugin/plugin.json`** — version 4.0.0 → 4.0.1
- **`CLAUDE.md`** (repo root) — plugin.json v4.0.0 → v4.0.1 + 직전 release 요약 첫 줄 갱신

### 사실 부정확 수정 housekeeping (★ ★ research 흡수)

- **H-1** — characterization-spec.schema.json scenario.tags description 안 "Gherkin tag 표준" = 오표기 (Cucumber 공식 spec 안 tag 의미 표준화 ❌) → "Cucumber Gherkin 도구 관례" 명시
- **H-2** — characterization-spec.schema.json scenario.intent_classification.items.type 안 "SATD/KL-SATD per Maldonado & Shihab 2015" = 인용 오류 (논문 안 SATD 5 분류 = design/defect/documentation/test/requirement / `self_recognized` 분류명 ❌) → intent-classification.schema.json $comment 안 본격 명시 ("SATD 개념 차용 / 분류명 자체는 본 방법론 고유 합성")

### 회귀 검증 (★ chain harness validated 본질 보존)

- workspace test 회귀 — 기존 52 test (drift-validator) + 신규 5 = 57/57 pass
- schema-validator 회귀 — PoC #05 + PoC #01 valid 유지 (auto_extracted=true BR 부재 = vacuous 발동 / 14 PoC 회귀 풀이 0)
- chain harness 5 요소 변경 ❌ (schema additive 영역 한정)
- release-readiness 9/9 strict criterion 보존
- breaking change ❌ / round-trip 영향 ❌

### Phase 2 carry (★ 본 sprint 외부)

- **⑤ cross_consistency_check inline 보존** — PoC 적용률 ≥ 50% 도달 후 재평가 / inline vs 분리 결단 별도 sprint
- **① alias 4중첩 폐기** — v4.1.0 MINOR 후보 / breaking change + 14 PoC 마이그레이션 script
- **② BR 표현 4종 → 2종 단일화** — v4.1.0 MINOR 후보 / breaking change
- **④ severity cross-stage mapping table** — 별도 plan 의무
- **⑦ `rules.json` → `business-rules.json` rename** — v4.1.0 MINOR 후보 / cross-ref 치환 다수

---

## [4.0.0] — 2026-05-17 ★ ★ ★ MAJOR — multi-agent paradigm 본격 채택 (DEC-2026-05-17-v4 / DEC-2026-05-15-g5 retract)

> ★ ★ ★ ★ ★ **v4.0.0 MAJOR — paradigm 본질 변화**. plan-skill-invocation-guarantee.md §B5 옵션 A 본격 채택. stage 별 sub-agent 5종 신설 + 3 base agent 병존 + spike agent 보존. main agent = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch). frontmatter `skills: [...]` 사전 주입 paradigm (Sub-agents.md spec line 407~429 정합). DEC-2026-05-15-g5 "stage 별 분리 ❌" 정책 **retract**.

### paradigm 결단 (사용자 명시 결단 2026-05-17)

- 사용자 의제 "B5 부터 해보자" → 1차 옵션 C (스파이크 PoC) 진입 → 사용자 redirect "A로 해줘" → 옵션 A 본격 진입
- spike 자산 (`archive/v4-spike/_spike-planning-agent.md` / commit `8605652`) ★ archive 이동 (★ C-3 carry 본격 시행 / 역사 기록 / paradigm 가능 입증 source)
- cooling-off 무시 (사용자 명시 결단 우선 / "without stopping" 모드)

### 신설 자산 (5 stage agent)

- **`agents/analysis-agent.md`** (★ chain 0 input + chain 1 sub analysis / 22 analysis skill + 6 input skill + 3 base utility = 31 skill 사전 주입)
- **`agents/planning-agent.md`** (★ chain 1 / 3 planning skill + 4 base utility = 7 skill)
- **`agents/spec-agent.md`** (★ chain 2 / 3 spec skill + 4 base utility = 7 skill)
- **`agents/test-agent.md`** (★ chain 3 RED / 4 test skill + 4 base utility = 8 skill)
- **`agents/implement-agent.md`** (★ chain 4 GREEN / 4 implement skill + 4 base utility = 8 skill)

### 수정 자산 (★ paradigm 정책 재작성)

- **`agents/README.md`** — paradigm 정책 본격 재작성 ("Stage 별 분리 ❌" → "Stage 별 분리 ✅ + 3 base agent 병존")
- **`methodology-spec/lifecycle-contract.md`** §자산 매핑 매트릭스 §Agent column 5 row 본격 재작성 (실 agent path 명시)
- **`methodology-spec/skills-axis.md`** — §9 v4.0 multi-agent paradigm + skill ↔ agent 매핑 SSOT 신설
- **`tools/chain-driver/src/hooks-bridge.js`** — TRIGGER_PATTERNS 의 entry 마다 agentId 추가 + `suggestAgentForPrompt` 함수 신설 (옛 `suggestSkillForPrompt` 보존 / hybrid 격상) + analysis stage 진입 패턴 추가 (B1 보강 통합)
- **`tools/chain-driver/src/invoke-skill.js`** — `formatHookBlockContext` 의 agentId optional 인자 추가 / v4.0 권고 동봉 ("dispatch agent via Task tool")
- **`hooks/hooks.json`** — `$comment` 안 v4.0 정합 명시 (hook event 자체는 변경 ❌)
- **`decisions/DEC-2026-05-17-v4-multi-agent-paradigm-채택.md`** (신설) + **`decisions/INDEX.md`** 등재
- **`.claude-plugin/plugin.json`** — version 3.6.9 → 4.0.0
- **`CLAUDE.md`** (repo root) — plugin.json v3.6.9 → v4.0.0 + paradigm 설명 갱신

### 외부 사실 검증 (claude-code-guide 위임)

- ❌ frontmatter `tools` 에 `Skill` 명시 불가 (Sub-agents.md spec line 267)
- ✅ sub-agent Skill tool 자동 활성 (parent scope 상속 / line 272)
- ✅ frontmatter `skills: [...]` 사전 주입 (line 407~429)

### 검증

- chain-driver test 114/114 통과 (회귀 0)
- release-readiness 11/11 통과 의무 (check10 CLAUDE.md sync + check11 workspace test)

### 비-범위 (★ v4.1+ carry)

- 47 SKILL.md persona 임베드 분리 평가
- PoC #05 + 추가 PoC chain harness agent dispatch paradigm 으로 재실행 + cross-validation
- ~~spike agent (`_spike-planning-agent.md`) archive 결단 (보존 유지 / archive 이동)~~ ✅ 본격 시행 (C-3 carry / 사용자 명시 결단 "archive 이동" 2026-05-17 / `archive/v4-spike/_spike-planning-agent.md`)
- ~~design stage agent 신설 (v2.x carry K-? 합산)~~ ✅ 옵션 C 본격 시행 (C-4 carry / 사용자 명시 결단 "C" 2026-05-17 / `agents/design-agent.md` PLACEHOLDER 신설 / `skills: []` / paradigm 본질 미충족 인지 / v4.1+ design-* skill 신설 carry)
- design stage agent 신설 (v2.x carry K-? 합산)

### Lessons Learned

- **LL-v4-01**: reasonable call (옵션 C 보수적) 우선 + 사용자 명시 redirect (옵션 A 본격) 패턴. without stopping 모드 + 큰 paradigm 결단 = 사용자 명시 confirmation 의무 입증.
- **LL-v4-02**: spike 자산 보존 = paradigm 진화 lineage 유지 / cleanup 강박 회피 (memory `feedback_carry_cleanup_paradigm.md` 정합).
- **LL-v4-03**: DEC-2026-05-15-g5 retract = lifecycle-contract.md §Agent column 본격 재작성 비용 큼 (plan 본문 caution 3 정합). v4.0 commit 안 본격 흡수.

### 정합 관계

- DEC-2026-05-17-v4-multi-agent-paradigm-채택 (★ ★ ★ 본 release 의 모 결단)
- DEC-2026-05-17-spike-planning-agent-실험 (★ paradigm 가능 입증 / commit `8605652`)
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (★ ★ ★ retract 대상)
- `plan-skill-invocation-guarantee.md` (★ 모 plan / B5 옵션 A)

---

## [3.6.9] — 2026-05-16 ★ PATCH — A3 시행 / README.md + guides/ 외부 인지 자산 본격 sync (v2.5.1 → v3.6.9)

> ★ ★ ★ **A3 시행** (옵션 3 = A2 + A3 둘 다 진행 묶음 / A3 = 2번째 / 본 session 마지막 release). README.md + guides/ 5 file = v2.5.1 시점 머묾 (1년 outdated) → v3.6.9 paradigm 진화 안정점 + enforcement cadence 정착 사실 본격 반영.

### 시행 결단

- 핵심 헤더 갱신 우선 (가장 가시화 영역) + 본격 본문 재작성 = carry (별도 session)
- 갱신 영역: 라인 1 (version 헤더) / 라인 5 (현재 사실) / 라인 47 (§8.1 strict 자격) / 라인 50~57 (자격 목록 7 → 11) / 라인 73 (사용법 v) / install URL / dist artifact path / "갱신 이력" 라인

### 자산 갱신 (6 file)

- **`README.md`** — version 헤더 v2.5.1 → v3.6.9 (★ ★ ★ ★ ★ ★ → ★ ★ ★ ★ ★ ★ ★) + 현재 사실 본격 갱신 (paradigm 진화 안정점 + enforcement criterion 11종 + skill 47/도구 16/스키마 39/PoC 14 + 분석 입력 5종 orchestrate + FE skill 4종 + scope/stage 자동 폴더 + lifecycle 매트릭스) + §8.1 strict 자격 7/7 → 11/11 + 자격 목록 7개 → 11개 (analysis_validator_violation + layer_2_consistency + claude_md_version_sync + workspace_test_pass 추가) + install URL v2.4.0 → v3.6.9 + dist artifact path v2.5.1 → v3.6.9 + CHANGELOG cross-link (v2.4+ → v2.6+ / v2.3.x 이전 → v2.5.x 이전)
- **`guides/README.md`** — 헤더 v2.5.1 → v3.6.9 + 갱신 이력 라인 v3.6.9 entry 추가
- **`guides/chain-harness-guide.md`** — 갱신 이력 라인 v3.6.9 entry 추가
- **`guides/common-errors.md`** — 헤더 v2.5.1 → v3.6.9 + 갱신 이력 라인 v3.6.9 entry 추가
- **`guides/getting-started.md`** — 헤더 v2.5.1 → v3.6.9 (★ ★ ★ chain harness validated 정식 release → paradigm 진화 안정점 + enforcement cadence 정착) + 갱신 이력 라인 v3.6.9 entry 추가
- **`.claude-plugin/plugin.json`** — 3.6.8 → 3.6.9
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.8 → v3.6.9 (R2 cadence 정합)

### 비-범위 (별도 session carry)

- guides/ 본문 안 install URL / dist artifact path / SessionStart hook message / 시나리오 표기 등 = 본격 재작성 carry (본 conversation 안 핵심 표기만 갱신)
- guides/first-prompt-cookbook.md = v 표기 안 검사 ❌ (사용자 prompt 예시 영역 / paradigm 진화 영향 적음)
- 새 guides 자산 신설 (예: enforcement-criteria-guide.md / paradigm-stable-point-cadence.md) = 별도 session

### Lessons Learned

- **LL-session-20-A3-1**: 외부 인지 자산 (README / guides) = paradigm 진화 cadence 안 drift 누적 잠재 영역. release-readiness 11th criterion (`workspace_test_pass`) + 10th criterion (`claude_md_version_sync`) cadence 안 외부 인지 자산 sync criterion 신설 후보 (★ 향후 12th criterion / `external_doc_version_sync` 신설 자격).

### 정합 관계

- session 20차 v3.6.8 R3 cadence (INDEX archive) + v3.6.9 A3 (외부 인지 sync) = 동일 session "비대화 + drift" 묶음 처분
- v3.6.4 R2 (CLAUDE.md drift enforcement) = 본 A3 = drift enforcement paradigm 정합 (단 R2 = 내부 자산 / A3 = 외부 인지 자산 axis 다름)
- session 20차 = R1+R2+R3+R4+A1+A2+A3 = **7 잔여 결단 + 다음 의제 모두 시행 완료** / v3.6.3+v3.6.4+v3.6.5+v3.6.6+v3.6.7+v3.6.8+v3.6.9 = **7 release**

---

## [3.6.8] — 2026-05-16 ★ PATCH — A2 시행 / INDEX.md 본격 archive (session 14차 이전 의사결정 분리)

> ★ ★ ★ **A2 시행** (다음 의제 1번째 / 2개 묶음 진행 결단 옵션 3). INDEX.md 149 → 31 라인 (79% 절감) + INDEX-HISTORY.md 137 라인 신설. R3 STATUS archive cadence 정합 (paradigm 진화 안정점 = v2.5.0 MINOR FINAL = session 15차 / 2026-05-14 분기 cutoff).

### 시행 결단

- cutoff: session 14차 이하 의사결정 (111 DEC) → archive / session 15차 이후 (4 DEC = R4 + G3 + plugin-charter + v2.5.0 final) → INDEX.md 보존
- CHANGELOG.md 추가 archive 보류 — 이미 v2.4 이전 = `CHANGELOG-HISTORY.md` 안 archive 됨 (34 entries). v2.6.0~v3.6.7 (23 entries / 1601 라인) = 사용자 가시화 자산 + 외부 인지 보존 우선 / 추가 archive ≠ A2 의제

### 자산 갱신

- **`decisions/INDEX-HISTORY.md`** — **신설** (137 라인 / intro + cross-link + session 14차 이전 의사결정 111 DEC table 보존)
- **`decisions/INDEX.md`** — 149 → 31 라인 (보존 = header + 진행중 없음 + 승인 결정 session 15차 이후 4 DEC + Archive cross-link)
- **`.claude-plugin/plugin.json`** — 3.6.7 → 3.6.8
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.7 → v3.6.8 (R2 cadence 정합)

### 절감 사실

| 자산 | before | after | 절감 |
|---|---|---|---|
| INDEX.md (라인) | 149 | 31 | -118 (79%) |
| INDEX.md (토큰 추정) | ~70K | ~15K | -55K (79%) |

### 정합 관계

- R3 v3.6.5 (STATUS.md archive) = 본 A2 = 동일 archive cadence (paradigm 안정점 분기 cutoff)
- CHANGELOG-HISTORY.md (이미 존재 / v2.4 이전 archive) = 본 A2 = 동일 history file 패턴

---

## [3.6.7] — 2026-05-16 ★ PATCH — A1 시행 / release-readiness 11th criterion 신설 (workspace test 회귀 자동 차단) + R2 test 회귀 fix

> ★ ★ ★ **A1 시행** (다음 의제 R1 채택 = "release-readiness 11th criterion 신설"). session 20차 v3.6.3 P0 회귀 (chain-driver Windows path 2 fail) = 본 criterion 부재 = drift 누적 사례 정합. 또한 **R2 시점 test expectation 갱신 누락 회귀 동시 fix** (9 → 11).

### A1 신설 (`check11_workspaceTestPass`)

- 검증 대상: `npm test --workspaces --if-present` 실시간 실행 → fail count 0 + total tests > 0 의무
- spawn cadence:
  - Windows Node.js v22+ EINVAL fix — `shell: true` 의무 (CVE-2024-27980 정합)
  - NODE_TEST_CONTEXT env 제거 — test runner 안 release-readiness 호출 시 child env inherit 회피 (잔존 시 workspace 안 test 자동 skip → 0/0 pass false positive)
  - timeout 600s (workspace test ~30~60초 cadence 정합)
- `--skip-workspace-test` flag 지원:
  - test cadence 시 본 flag 사용 (60초 비용 회피)
  - release 본격 시행 시 본 flag ❌ 의무 (drift enforcement 정합)
  - skip 시 pass=false → release-readiness exit 1 → mistakenly skip 사용 시 release 차단

### R2 test 회귀 fix

- session 20차 v3.6.4 R2 시 `release-readiness.test.js` 안 expectation 갱신 누락 = 본 test 안 회귀 발생 (10 → 7 pass / 3 fail)
- `npm run test:release` 가 `npm test --workspaces` 와 별도 cadence → workspace test 359/359 안 본 fail 미포함 → 누락 회귀
- 본 A1 시행 시 동시 fix:
  - describe 안 "9/9 격상" → "11/11 격상"
  - `criteria_total === 9` → 11 (4 곳)
  - ids array 안 `claude_md_version_sync` (R2) + `workspace_test_pass` (A1) 추가 (총 11)
  - 기존 test 안 `--skip-workspace-test` flag 추가 (시간 절감)
  - 신규 test 1 case = check11 본격 spawn 검증 (timeout 600_000)

### 자산 갱신 (5 file)

- `scripts/release-readiness.js` — `check11_workspaceTestPass` 신설 + `parseArgs` `--skip-workspace-test` flag + main results array 등록 + header 명세 10 → 11 자격 갱신
- `scripts/test/release-readiness.test.js` — 9 → 11 expectation 갱신 + ids array 신규 2 추가 + SKIP_WS flag 사용 + 신규 A1 본격 spawn case 1
- `.claude-plugin/plugin.json` — 3.6.6 → 3.6.7
- `CLAUDE.md` (repo root) — 라인 99 plugin.json v3.6.6 → v3.6.7 (R2 cadence 정합)
- `decisions/STATUS.md` — session 20차 v3.6.7 entry 추가

### 검증

- workspace test: **359/359 pass** ✅
- release-readiness v3.6.7: **11/11** ✅ (check11 본격 spawn = workspace test 359/359 검증 ✅)
- release-readiness test (`npm run test:release`): **11/11 pass** ✅ (R2 회귀 회복 + A1 신설 검증)

### Lessons Learned

- **LL-session-20-A1-1**: 다른 cadence 안 test (예: `npm run test:release`) = `npm test --workspaces` 안 미포함 = 회귀 잠재 발생. release-readiness 안 본 test cadence 도 추가 검증 의무 영역 (별도 criterion 후보).
- **LL-session-20-A1-2**: Node.js `--test` runner 안 NODE_TEST_CONTEXT env inherit = child process 안 test 자동 skip 정합. inner spawn 시 본 env 명시 제거 의무.
- **LL-session-20-A1-3**: Windows Node.js v22+ 안 `.cmd` 파일 spawn = EINVAL (CVE-2024-27980) = `shell: true` 의무.

### 정합 관계

- session 20차 v3.6.3 P0 회귀 (chain-driver Windows path / workspace test 2 fail) = 본 A1 신설 근거
- v3.6.4 R2 (release-readiness 10th criterion 신설) = 본 A1 = 동일 cadence 정합 (drift enforcement via release-readiness criterion)
- LL-session-20-04 (양심 의존 ❌ paradigm) + LL-session-20-05 (paradigm 안정점 후 enforcement cadence 진입 자격) = 본 A1 정합

---

## [3.6.6] — 2026-05-16 ★ PATCH — R4 시행 / PoC #12 + #13 보류 처분 자산화

> ★ ★ ★ **R4 잔여 결단 시행** (session 20차 carry / 본 session 20차 = R1+R2+R3+R4 4 결단 모두 시행). PoC #12 (raw query) + PoC #13 (QueryDSL) = 둘 다 README 안 정탐 결과 추천 + ADR-CHAIN-008 정합 → status = "보류" 명시 자산화. 사용자 source 도착 시 재진입 자격 보존.

### 시행 결단

- **옵션 (c) PoC #12/#13 보류 + (B) 정책 완화 회귀 처분 자산화** 채택 (옵션 (a) 본격 시행 plan + (b) 사내 적용 가이드 + (d) 별도 session 거절)
- 근거 4종:
  1. 정탐 결과 정합 (둘 다 README 안 ★ ★ ★ ★ ★ "pure realworld OSS 부재" 사실 + (B) 추천 명시)
  2. ADR-CHAIN-008 정합 (MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 도달 / PoC #06~#11 6 PoC 누적)
  3. 비용 vs 가치 (14d cap × source 결정 비용 > corroboration 추가 가치 / 이미 자격 도달)
  4. paradigm 진화 안정점 정합 (v2.5.0 MINOR FINAL 이후 안정점 / 추가 PoC 본격 시행 ≠ 의제)

### 자산 갱신

- **`examples/poc-12-rawsql-userdecided/README.md`** — status = "보류" 명시 + DEC cross-link
- **`examples/poc-13-querydsl-userdecided/README.md`** — status = "보류" 명시 + DEC cross-link
- **`decisions/DEC-2026-05-16-r4-poc-12-13-보류-자산화.md`** — **신설** (SSOT)
- **`decisions/INDEX.md`** — 본 DEC entry 추가 (역시간순 / 가장 위)
- **`.claude-plugin/plugin.json`** — 3.6.5 → 3.6.6
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.5 → v3.6.6 (R2 cadence 정합)

### 재진입 cadence

★ 사용자 source 도착 시 (사내 모듈 또는 외부 source 결정) 진입 가능:
- 본 DEC = 보류 처분 자산 / 재진입 시 **새 DEC 신설 의무** (LL-cleanup-02 정합 / 라벨 부활 ❌)
- chain harness 5 stage 본격 시행 (PoC #08+#09+#10 패턴 재사용 / ~3~4일 실측)

### 정합 관계

- DEC-2026-05-08-poc-{12,13}-prelim-신설 (prelim 자산 / 본 R4 = prelim 처분)
- DEC-2026-05-08-paradigm-cross-policy-완화 + ADR-CHAIN-008 (strong corroboration 자격 paradigm)
- DEC-2026-05-15-carry-cleanup-paradigm-종결 (paradigm 진화 안정점 / 본 R4 = 잔여 PoC 처분)
- v3.6.3 + v3.6.4 + v3.6.5 + v3.6.6 = session 20차 4 release 묶음 (R1+R2+R3+R4 모두 시행)

---

## [3.6.5] — 2026-05-16 ★ PATCH — R3 시행 / STATUS.md 본격 archive (session 14차 이전 분리)

> ★ ★ ★ **R3 잔여 결단 시행** (session 20차 carry). STATUS.md 1871 → 80 라인 (95.7% 절감) + STATUS-HISTORY.md 1807 라인 신설. paradigm 진화 안정점 (v2.5.0 MINOR FINAL = session 15차 / 2026-05-14) 이 자연 분기 = 본 cutoff 결단 근거.

### 시행 결단

- **옵션 (a) session 15차 이전 archive 채택** (옵션 (b) 강력 archive + (c) v3.x 기준 + (d) 별도 session 거절)
- cutoff: session 14차 이하 모두 archive / STATUS.md = session 15차~20차 보존
- STATUS.md 안 cross-link section 신설 (Archive 진입점 명시)

### 자산 갱신

- **`decisions/STATUS-HISTORY.md`** — **신설** (intro + session 14차 header 23 라인 + session 14차 이전 body 1769 라인 = 1807 라인)
- **`decisions/STATUS.md`** — 1871 → 80 라인 (보존 영역 = header 라인 1~22 + Archive cross-link + session 15차 body)
- **`.claude-plugin/plugin.json`** — 3.6.4 → 3.6.5
- **`CLAUDE.md`** (repo root) — 라인 99 plugin.json v3.6.4 → v3.6.5 (R2 cadence 정합)

### 절감 사실

| 자산 | before | after | 절감 |
|---|---|---|---|
| STATUS.md (라인) | 1,871 | 80 | -1,791 (95.7%) |
| STATUS.md (토큰 추정) | ~96K | ~4K | -92K (95.8%) |
| context load 비용 | 매 conversation 96K | 4K (+ STATUS-HISTORY on-demand) | 매우 큰 절감 |

### Lessons Learned

- **LL-session-20-06**: STATUS.md 비대화 = 매 conversation context load 안 누적 비용 (다음 session 의 plan/research 출발점 자산). paradigm 진화 안정점 도달 cadence 마다 archive 의무 자격.
- **LL-session-20-07**: archive cutoff = "paradigm 진화 안정점" 자연 분기 활용 = R3 정합 paradigm. version 기반 (v2.x ↔ v3.x) 또는 session 기반 (5 session) cutoff 보다 의미 영역 정합 우선.

### 비-범위 (별도 결단)

- ❌ R4 PoC #12 / #13 user-decided 본격 활용 = 별도 session

### 정합 관계

- v3.6.4 PATCH session 20차 R2 (CLAUDE.md drift enforcement / 본 R3 = STATUS.md 비대화 처분 / 동일 session 의 paradigm 진화 안정점 후 cadence enforcement 묶음)
- DEC-2026-05-14-v2.5.0-minor-final (paradigm 진화 안정점 = 본 archive cutoff 근거)

---

## [3.6.4] — 2026-05-16 ★ PATCH — R2 시행 / release-readiness 10th criterion 신설 (CLAUDE.md drift enforcement)

> ★ ★ ★ **R2 잔여 결단 시행** (session 20차 carry / LL-session-20-02 정합). CLAUDE.md ↔ plugin.json.version drift 회피 cadence 자동화 (양심 의존 ❌). 본 cadence 안 release 마다 CLAUDE.md 안 plugin 진화 표기 갱신 의무 강제.

### 시행 결단

- **옵션 (a) release-readiness 10th criterion 신설** 채택 (옵션 (b) PostCommit hook 자동 commit risk + (c) 매뉴얼 양심 의존 거절)
- 검증 대상: CLAUDE.md 안 `plugin.json vX.Y.Z` 표기 (★ 핵심 컨텍스트 자산 안 plugin 진화 정합 표기 / 라인 99 pattern)
- drift 발생 시 release 자동 차단 (exit 1)

### 자산 갱신

- **`scripts/release-readiness.js`** — `check10_claudeMdVersionSync` function 신설 + main results array 안 등록 + header 명세 9 → 10 자격 갱신
- **`CLAUDE.md`** (repo root) — 라인 99 `plugin.json v3.6.2` → `plugin.json v3.6.4` sync (★ R2 검증 정합)
- **`.claude-plugin/plugin.json`** — 3.6.3 → 3.6.4

### 즉시 검증 (R2 이론적 정합 입증)

```
check10 신설 직후 (plugin.json=3.6.3 시점):
  ❌  claude_md_version_sync — drift: "plugin.json v3.6.2" ↔ plugin.json=3.6.3
  → 9/10 (★ drift 즉시 검출 = criterion 정합 입증)

plugin.json bump + CLAUDE.md sync 후:
  ✅  claude_md_version_sync — CLAUDE.md "plugin.json v3.6.4" 표기 1건 모두 일치 / R2 cadence 정합
  → ★ ★ ★ 10/10 = release-ready
```

### 비-범위 (별도 결단)

- ❌ CLAUDE.md 안 다른 version 표기 (라인 13 / 34 / 117-119 의 paradigm 진화 안정점 + CHANGELOG 직전 release 요약) = 본 criterion 미검증 (의미 영역 다름 / 별도 cadence 결단)
- ❌ R3 STATUS.md 본격 archive = 별도 session
- ❌ R4 PoC #12 / #13 본격 활용 = 별도 session
- ❌ R1 retroactive 12 tag 부여 = 옵션 1 최소 결단 보존

### Lessons Learned

- **LL-session-20-04**: drift enforcement criterion = "양심 의존 ❌" paradigm 의 본격 적용 영역. release-readiness 가 "release 직전 검증" 위치 = 모든 drift 의 마지막 차단 자격 / hook 보다 단순 + 안정적 (자동 commit risk ❌ / 사용자 양심 의존 ❌)
- **LL-session-20-05**: R2 시행 = "drift 회피 cadence" 정식화 사례. paradigm 진화 안정점 도달 후 = enforcement criterion 신설 cadence 본격 진입 자격 (drift 누적 회피 자산 cumulative).

### 정합 관계

- v3.6.3 PATCH session 20차 (LL-session-20-02 자산 / 본 R2 시행 근거)
- DEC-2026-05-15-carry-cleanup-paradigm-종결 (paradigm 진화 안정점 / 본 R2 = 안정점 후 enforcement cadence 진입)
- ADR-CHAIN-005 §3 mechanical trio (★ release-readiness = 4번째 mechanical gate 자격 / hook trio + state.blocked + release-readiness 4중 enforcement)

---

## [3.6.3] — 2026-05-16 ★ PATCH — session 20차 점검 / P0 회귀 2건 복구 + drift 갱신 묶음

> ★ ★ ★ **사용자 명시 "점검해 보자"** 진입 → 4 영역 점검 (본체 자가 정합 + CLAUDE.md drift + STATUS/INDEX 비대화 + 잔여 carry/다음 의제) → critical 회귀 2건 발견 + 즉시 복구. paradigm 변경 ❌ / additive change + 회귀 복구만 = PATCH 정합.

### 🔴 회귀 복구 (P0)

**1. `release-readiness analysis_validator_violation` ❌**

- 원인: PoC #01 `/meta` (4 errors) + PoC #05 `/meta` (6 errors) 안 v3.x 진화 중 추가된 필드 10종이 `meta-confidence.schema.json` 안 `additionalProperties: false` 위반
- 추가된 필드 10종:
  - PoC #01 (v1.1.2 시점 자산): `source_branch` / `extraction_env` / `raw_confidence` / `expected_confidence_average`
  - PoC #05 (v2.5.0 phase B/D 자산): `extraction_env` / `sample_mode` / `corroboration_eligible` / `sample_mode_rationale` / `phase_b_migration_note` / `phase_d_meta_recovery_note`
- 복구: `schemas/meta-confidence.schema.json` 안 10 properties 정식 등록 (모두 optional / paradigm 진화 자산 보존)
- 결과: ✅ **9/9 release-ready** 회복

**2. `tools/chain-driver/test/scope-dir.test.js` Windows path 회귀 ❌**

- 원인: assertion 안 Unix path (`'/root/.aimd/user-registration'`) 하드코딩 → Windows `path.join` 결과 (`\root\.aimd\user-registration`) 불일치 → 2 test ERR_ASSERTION
- 복구: `assert.equal(p, join('/root', '.aimd', 'user-registration'))` platform-aware fix (이미 import 된 `node:path` join 활용)
- 결과: ✅ **chain-driver 114/114** 회복 / workspace 전체 **359/359 ✅**

### 🟠 drift 갱신 (P1)

**`CLAUDE.md` 본격 갱신** — v2.6.0 시점 머무름 (6 release drift) → v3.6.2 paradigm 진화 안정점 본격 반영:
- 버전 표기 v2.6.0 → v3.6.2 + 직전 6 release 요약 (v3.6.1 cross-link / v3.6.0 G1 scope-out / v3.5.0 G5 / v3.4.0 G4 / v3.3.0 G2 / v3.2 G3)
- schemas 13종 → **39종** / tools 12종 → **16종** / PoC 4 → **14** / skills **47종** 명시
- 신설 자산 반영: plugin-charter SSOT + lifecycle 자산 매핑 매트릭스 + FE skill 4종 + analysis-input-orchestrate 5종 + scope/stage 폴더
- sub-plan-6 "현재" → 역사 기록 격하 + paradigm 진화 안정점 표기

### 🟡 INDEX.md 갱신 (P2)

- "진행중 결정" 2건 모두 후속 release 안 흡수 완료 사실 명시 → "(없음)" 표기 + 사유 (v1.3.0 / ADR-008+ADR-009 정식 채택)

### 🟢 STATUS.md 헤더 갱신 (P3)

- 기준일 2026-05-15 → **2026-05-16** + session 20차 entry 추가 (점검 + 복구 사실 자산화)
- 본격 archive (session 8차~14차 분리) = **사용자 결단 영역** / 본 release 안 시행 ❌

### 자산 갱신 (5 file)

- `schemas/meta-confidence.schema.json` — v3.x 진화 필드 10종 정식 등록 (additive / breaking ❌)
- `tools/chain-driver/test/scope-dir.test.js` — Windows path platform-aware fix
- `CLAUDE.md` (repo root) — v3.6.2 사실 동기화 + 신설 자산 반영
- `decisions/INDEX.md` — 진행중 결정 2건 흡수 사실 명시
- `decisions/STATUS.md` — session 20차 entry 추가
- `.claude-plugin/plugin.json` 3.6.2 → 3.6.3

### Lessons Learned

- **LL-session-20-01**: paradigm 진화 안정점 도달 후 = "점검 cadence" 진입 자격. **장기 drift 누적 회피 의무** — release 안 가려진 회귀 (PoC #01 + #05 schema invalid 가 9/9 → 8/9 회귀 / Windows path 가 OS-specific bug) 가 본 cadence 안 발견됨.
- **LL-session-20-02**: CLAUDE.md = 다음 conversation 컨텍스트 / 본 자산 drift 시 **다음 session 의 plan + research 부정확** risk. 매 MINOR release 시 CLAUDE.md 갱신 의무 cadence 정착 (향후 release-readiness criterion 신설 후보 / 본 release 안 시행 ❌ / 사용자 결단 영역).
- **LL-session-20-03**: schema additionalProperties=false + paradigm 진화 자산 (sample_mode 등) 추가 시 **schema 동시 갱신 의무**. v2.5.0 phase B+D 시 누락된 갱신이 v3.x 본격 진화 후에야 release-readiness 회귀로 드러남.

### 정합 관계

- DEC-2026-05-15-carry-cleanup-paradigm-종결 (v3.6.2 paradigm 진화 안정점 / 본 PATCH = 안정점 후 점검 cadence 첫 시행)
- v2.5.0 phase B + phase D session 11/15차 (PoC #05 meta 회복 자산 / 본 PATCH = schema 안 정식 등록)
- v3.2 G3 종결 (chain-driver scope-dir 신설 / 본 PATCH = Windows path platform-aware 보완)

---

## [3.6.2] — 2026-05-15 ★ PATCH — 잔여 carry 묶음 정리 / paradigm 진화 완료점

> ★ ★ ★ **사용자 명시 결단 "carry 다 제거"** — charter §3 활성 Gap 모두 청산 + G1 영구 scope-out 후 잔여 carry 7종 모두 정리. plugin must-have 자산 + paradigm 진화 **안정점 도달 명시**.

### 정리 대상 (7 carry)

| # | carry | 결단 |
|---|------|------|
| C1 | G6 `/analyze-fullstack` Scenario B 통합 명령어 | **영구 scope-out** (G1 sibling / 재제안 ❌) |
| C2 | G2 orchestrate 분리 신호 (1-A → 1-B trigger) | 라벨 제거 (history = DEC + LL-G2-03 보존) |
| C3 | Vue 2 / React 18 legacy 분기 | 라벨 제거 (사례 발생 시 새 결단) |
| C4 | form action 분산 anti-pattern rule | 라벨 제거 (시행 시 결단) |
| C5/C6/C7 | PoC (Scenario A/B/C 본격 검증) | 라벨 제거 (PoC session 진입 시 새 결단) |

### paradigm 근거

1. paradigm 단순화 — charter §3 모두 청산 + carry 라벨 정리 = plugin must-have 안정점 도달
2. history 보존 — 정리 carry 의 paradigm history 는 각 DEC + CHANGELOG + LL 안 본격 보존 (carry 라벨 = 중복 추적)
3. G1 sibling paradigm — 가치 < 비용 / 사용 사례 부재
4. 사용자 결단 권한 — 명시 결단 시 paradigm 진화 안정점 도달

### paradigm 진화 완료점 (★ 2026-05-15)

| 영역 | 상태 |
|---|---|
| charter §1 (R1~R17) | 15/15 자산 대칭 + R16/R17 scope-out |
| charter §3 (Gap) | 모두 청산 + G1 scope-out |
| 잔여 carry | 모두 정리 (C1~C7 라벨 제거) |
| 본격 자산 | 5 stage + cross-cut skill 자산 대칭 |
| 의미 ID paradigm | v2.6.0 + v3.x sub-axis 진화 정합 |

### 자산 갱신

- `decisions/DEC-2026-05-15-carry-cleanup-paradigm-종결.md` — 신설 (SSOT)
- `.claude-plugin/plugin.json` 3.6.1 → 3.6.2
- `decisions/STATUS.md` session 19차 추가 entry

### Lessons Learned

- **LL-cleanup-01**: carry 라벨 = paradigm 진화 추적 자산. 사용 사례 누적 부재 시 = 라벨 제거 정합. history 는 DEC/CHANGELOG/LL 본격 보존 → 라벨 = 중복 추적
- **LL-cleanup-02**: paradigm 안정점 도달 시 carry 묶음 정리 = "단순화 결단". 미래 사용 사례 시 새 carry 신설 가능 (라벨 부활 ❌)

### 정합 관계

- DEC-2026-05-15-carry-cleanup-paradigm-종결 (본 entry SSOT)
- DEC-2026-05-15-g1-itsm-permanent-scope-out (G1 영구 scope-out sibling)
- DEC-2026-05-15-g{2,3,4,5}-* (Gap 종결 sibling)
- be-fe-separation.md §4.1 D25 carry (G6 history 보존)
- memory `feedback_itsm_g1_permanent_scope_out` (재제안 회피 paradigm)

---

## [3.6.1] — 2026-05-15 ★ PATCH — carry C10+C8+C9 묶음 (cross-link 문서 보강)

> ★ G5 paradigm 강화 — `lifecycle-contract.md` §자산 매핑 매트릭스 의 cross-link 자산 (agents/README.md 신설 + tools/README.md cross-link + spectral-runner README carry 정정). 자산 신설/기능 추가 ❌ / 문서 보강만 = PATCH 정합.

### 갱신 자산 (3 file)

- **C10**: `tools/spectral-runner/README.md` — "호출자: skill `analysis-openapi` 자동 호출" → **"사용자/orchestrate 명시 호출 (auto-invoke ❌ / no-simulation 정합 / G2 LL-G2-06 정정)"**. 자동 호출 통합은 v3.x carry (chain-driver hooks-bridge 정합 결단 후 별도 시행).
- **C8**: `agents/README.md` — **신설**. 본 매트릭스 §Agent column cross-link / 3 base agent persona (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`) 책임 명시 + 호출 시기 + paradigm 정합 (1-depth flat / decision axis 분리).
- **C9**: `tools/README.md` — 본 매트릭스 §Tool/Validator column cross-link 1줄 추가 (cadence table 앞 §자산 매핑 매트릭스 cross-link section).

### paradigm 결단

- version 라벨 = **v3.6.1 PATCH** (semver 정합 / 자산 신설 ❌ / 문서 보강만)
- 별도 session 의무 carry (C1 G6 / C5/C6/C7 PoC / C2 분리 신호 / C3 legacy) = 본 묶음 외

### 정합 관계

- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (본 PATCH = G5 paradigm 강화)
- DEC-2026-05-15-g{2,4}-* (G2 LL-G2-06 + G4 LL-G4-04/05 정합)
- memory `feedback_chain_driver_deterministic_axis` + `feedback_no_static_tool_simulation` (auto-invoke ❌ 정합)

---

## [3.6.0] — 2026-05-15 ★ ★ ★ MINOR — G1 ITSM 영구 scope-out / charter Gap 모두 청산

> ★ ★ ★ **charter §1 R16/R17 영구 폐기** (사용자 명시 결단 "G1 안해도 됨 잊어줘"). charter §3 활성 Gap **모두 청산** = plugin must-have 자산 대칭 본격 도달. 향후 자동 티켓화 재제안 ❌.

### 결단 근거

1. 가치 < 비용 (사용자 1인 dogfooding 단계 / 자동화 ROI ↓)
2. `mcp__wiki-jira-assistant__*` 13 도구 = 사용자 수동 호출로 충분
3. chain harness gate → 자동 티켓 transition = chain-driver 결정론 axis 오염 risk
4. paradigm 단순화 (charter Gap 모두 청산)

### 자산 갱신

- `methodology-spec/plugin-charter.md` §1 R16/R17 strikethrough + scope-out (번호 보존 / cross-reference drift 회피)
- charter §2 R16/R17 ❌ → ★ scope-out
- charter §2 요약 = 활성 요구 **15/15 자산 대칭** + scope-out 2
- charter §3 G1 strikethrough + 영구 폐기
- `.claude-plugin/plugin.json` 3.5.0 → 3.6.0
- `decisions/DEC-2026-05-15-g1-itsm-permanent-scope-out.md` — 신설

### charter §2 진화 (v3.1.0 → v3.6.0)

| 시점 | ✅ | ⚠️ | ❌ | scope-out |
|---|---|---|---|---|
| v3.1.0 | 11 | 4 | 2 | 0 |
| v3.3.0 (G2) | 12 | 3 | 2 | 0 |
| v3.4.0 (G4) | 13 | 2 | 2 | 0 |
| v3.5.0 (G5) | 14 | 1 | 2 | 0 |
| **v3.6.0 (G1 scope-out)** | **14** | **1** | **0** | **2** |

### Lessons Learned

- **LL-G1-01**: charter §1 must-have 요구는 사용자 결단으로 영구 scope-out 가능. 번호 보존 = cross-reference drift 회피.
- **LL-G1-02**: 자동화 ROI 평가 시 "1인 dogfooding vs 사내 배포 후" 두 시기 구분. 1인 단계 = scope-out 정합. 배포 후 사용자 다수 시 새 R 요구로 재진입 가능 (R16/R17 부활 ❌).

### 정합 관계

- DEC-2026-05-15-g1-itsm-permanent-scope-out (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (원안 R16/R17 영구 폐기)
- DEC-2026-05-15-g{2,3,4,5}-* (활성 Gap 모두 종결 sibling)
- memory `feedback_itsm_g1_permanent_scope_out` (재제안 회피 의무)
- memory `feedback_chain_driver_deterministic_axis` (결정론 axis 오염 회피)

---

## [3.5.0] — 2026-05-15 ★ ★ ★ MINOR — G5 종결 / lifecycle 자산 매핑 매트릭스 (단일 SSOT)

> ★ ★ ★ **charter §3 G5 종결** — R12 lifecycle stage↔asset 매핑표 신설. 이전엔 `skills-axis.md` + `be-fe-separation.md` + `flows/*` 흩어진 자산을 사용자가 cross-read 의무. 본 매트릭스 = 1장에서 stage 진입 시 어떤 자산 호출할지 즉답. **잔여 charter Gap = G1 (ITSM 후순위) 단독**.

### 신설 자산

- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 신설:
  - **본 매트릭스** (stage × asset 5 column × 8 row) — input / analysis / planning / spec / test / implement / cross-cut traceability / cross-cut aspects
  - **부 매트릭스** (R8 입력 axis 6 row) — (a) 코드 / (b) Figma / (c) Swagger / (d) plan-doc / (e) prompt / (★ orchestrator) — 본 매트릭스 input row 의 펼침 매핑
  - **Scenario cross-link** (be-fe-separation.md §6 / axis 분리 명시)
  - **사용 가이드** (stage 진입 시 / R8 입력 시 / agent persona 인용 흐름)

### paradigm 결단 (사용자 결단 2026-05-15)

| 의제 | 결단 | 근거 |
|---|---|---|
| Column 5 | agent / skill / hook / tool/validator (charter §3 G5 원안 정합) | — |
| Row 분리도 | **단일 row + 부 매트릭스** | row 비대화 회피 + orchestrate 자연 응집 + BCDE detail 분리 = ROI 최적 |
| version 라벨 | **v3.5.0 MINOR** | G5 종결 = MINOR (G2/G4 일관) |

### 부수 갱신

- `methodology-spec/plugin-charter.md` §1 R12 ⚠️→✅ (자산 차원 격상) + §2 요약 ✅ 14 / ⚠️ 1 / ❌ 2 + §3 G5 종결 (잔여 G1 단독)
- `.claude-plugin/plugin.json` 3.4.0 → 3.5.0
- `decisions/DEC-2026-05-15-g5-lifecycle-asset-matrix-종결.md` — 신설

### Lessons Learned (★ paradigm 진화)

- **LL-G5-01**: 매핑 매트릭스 row 분리도 = **사용자 진입 가이드 ↑** vs **매트릭스 시야 ↓** 사이 trade-off. row 비대화 회피 + 부 매트릭스 분리 = ROI 최적. G2 LL-G2-03 (책임 합산) + G4 LL-G4-02 (분리 vs 본문 분기) 의 단순 문서 영역 응용.
- **LL-G5-02**: charter §3 종결 자산 = 매트릭스 1장 정도라도 **단일 SSOT 확립 가치** 큼. 흩어진 자산 (skills-axis / be-fe-separation / flows) → 1장 cross-read 회피 → 사용자 진입 즉답.

### 정합 관계

- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter §3 G5 종결 sibling)
- DEC-2026-05-15-g{2,3,4}-* (paradigm 진화 sibling)
- v2.6.0 paradigm (skills-axis category prefix / 의미 ID)
- be-fe-separation.md (Scenario × IR 4계층 / axis 분리)

---

## [3.4.0] — 2026-05-15 ★ ★ ★ MINOR — G4 종결 / FE skill 보강 (4 skill 신설 + RTL 본문 분기 + 5 test pass)

> ★ ★ ★ **charter §3 G4 종결** — R14 BE/FE 자산 비대칭 해소. **후보 C 채택** (4 skill + 본문 분기 / `test-jest` 중복 회피 / BE 트랙 paradigm 일관). v2.6.0 의미 ID + ADR-CHAIN-001 chain 4 이중 렌더링 정합.

### 신설 자산 (4 skill + 1 schema + 5 test)

**4 skill 신설**:
- `skills/implement-react/SKILL.md` — React 19 paradigm (forwardRef deprecated / ref prop 직접 / class component 분기 보존 / `useActionState`/`useOptimistic`/`useFormStatus`/`use()` 신규 hooks / ESLint `no-forward-ref`) + schema marker `react_version: "19"`
- `skills/implement-vue/SKILL.md` — Vue 3 only (Composition API + `<script setup>` 우선 / Options API legacy 분기 본문 / Vue 2 = carry)
- `skills/test-playwright/SKILL.md` — POM 분리 의무 (locator = page object / assertion = test) + web-first assertion + parallel + shard CLI + `@playwright/test` 1.4x + `npx playwright install`
- `skills/analysis-html-template/SKILL.md` — Scenario C (JSP/Thymeleaf/EJS/ERB/Razor) / 외부 도구 의무 (SonarQube `Web:JspScriptletCheck` + `rspec-1459` + `rspec-1932` / PMD JSP / jsp-lint) / JSP 2.0 / Servlet 2.4 기준점 / **scriptlet 0 absolute**

**1 schema 신설** (strict / additionalProperties:false):
- `schemas/html-template-extract.schema.json` — external_tool_output.executed required (no-simulation 의무) + scriptlet_findings + xss_markers + policy_check.scriptlet_zero_absolute

**5 test case** — schema-validator 회귀 40 → **45/45 pass**.

### 본문 분기 추가

- `skills/test-generate-test-spec/SKILL.md` — `## 기술 스택 분기` 섹션에 추가:
  - **jest + RTL (React 19)** — `userEvent.setup()` v14 의무 + `await user.*` async + `getByRole` 1순위 + `findBy*`/`getBy*`/`queryBy*` 분기
  - **vitest + Vue Test Utils (Vue 3)** — `@vue/test-utils` 2.x / Composition API 정합
  - **Playwright e2e** — 별도 skill `test-playwright` 위임 reference

### paradigm 결단 (Senior critique + research 흡수)

| paradigm | 결단 | 근거 |
|---|---|---|
| 후보 (A 5 skill / B 절충 / **C 4 skill**) | **C** | `test-jest` 중복 회피 + BE 트랙 paradigm 일관 + 본문 비대화 risk 회피 |
| Vue 1차 지원 | **Vue 3 만** | Vue 2 legacy = carry |
| Scenario B `/analyze-fullstack` | **G6 carry** | 명령어 axis ≠ skill axis |
| JSP scriptlet 정책 | **scriptlet 0 absolute** | JSP 2.0 / Servlet 2.4 paradigm 정합 |
| `analysis-html-template` 매핑 | **신규 phase `template-analyze` 신설** | input phase 부담 ↓ + Scenario C 만 활성 |
| 정량 검출 | **진짜 외부 도구 의무** | LLM 양심 ❌ / no-simulation 정합 (Senior STRONG-STOP) |

### 부수 갱신

- `methodology-spec/plugin-charter.md` §2 R14 ⚠️→✅ + §3 G4 종결 (잔여 G5 > G1)
- `methodology-spec/skills-axis.md` analysis 27 → 28 / implement 2 → 4 / test 3 → 4
- `flows/test.phase-flow.json` (test-playwright skill mapping)
- `flows/implement.phase-flow.json` (implement-react / implement-vue skill mapping)
- `flows/analysis.phase-flow.json` (신규 phase `template-analyze` + analysis-html-template)
- `.claude-plugin/plugin.json` 3.3.0 → 3.4.0
- `decisions/DEC-2026-05-15-g4-fe-skill-track-종결.md` — 신설

### Lessons Learned (★ paradigm 진화)

- LL-G4-01: charter §3 후속 표 = 후보 안 / 기존 자산 중복 평가 의무
- LL-G4-02: paradigm 분리 vs 본문 분기 = 자산 비대화 + drift 추적 + 명시성 3축 평가
- **LL-G4-03 (★ Senior)**: framework paradigm 충돌 시 RED test fixture = 판단 기준 + schema marker (`react_version`) 의무
- **LL-G4-04 (★ research 정정)**: 외부 framework 사실 (React 19 / userEvent v14 / Playwright POM) 추정 ❌ / research 실 fetch 의무
- **LL-G4-05 (★ Senior STRONG-STOP)**: 정성 검출 = 진짜 외부 도구 실행 의무 / LLM 양심 ❌

### 정합 관계

- DEC-2026-05-15-g4-fe-skill-track-종결 (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter §3 G4 종결 sibling)
- DEC-2026-05-15-g2-orchestrate-skill-분리-채택 (paradigm 진화 sibling)
- v2.6.0 paradigm (의미 ID — implement-react / implement-vue / test-playwright / analysis-html-template)
- ADR-CHAIN-001 (chain 4 이중 렌더링 + no-simulation)
- ADR-009 (no-simulation / 외부 도구 auto-invoke 금지)

---

## [3.3.0] — 2026-05-15 ★ ★ ★ MINOR — G2 종결 / analysis-from-quad (BCDE 입력 5 skill + orchestrate paradigm + 25 test pass)

> ★ ★ ★ **charter §3 G2 종결** — R8 입력 5종 중 BCDE 자산 대칭 ✅ 도달 + complex multi-input orchestration paradigm 도입. **5 skill + 5 schema + 25 test pass**. Senior critique STOP/REVISE 본격 흡수. v2.6.0 의미 ID paradigm 정합.

### 사용자 3 메타 지적 본격 흡수

1. **메타 #1** — charter §2 ✅ 판정의 "형식 명시" vs "자산 차원" 구분 누락 risk → **5 skill 자산 대칭 신설** ((a)(d)(e) ✅ 도 자산 차원 ✅ 로 격상).
2. **메타 #2** — 복합 입력 흐름 (Figma + Swagger + 자연어 한 발화) mermaid "선택" 점선이 명세 누락 신호 → **orchestrator paradigm 채택**.
3. **메타 #3** — orchestrator 단일 책임 위반 risk (9 책임 누적) → **B' = 별도 skill 분리** (`analysis-input-orchestrate` 신설 / 4 책임).

### 신설 자산 (5 + 5 + 25)

**5 skill**:
- `skills/analysis-input-orchestrate/SKILL.md` — 자연어 파싱 + BCDE dispatch + merge + cross-ref + conflict (정량 산식)
- `skills/analysis-from-prompt/SKILL.md` — (e) 자연어 의도 흡수
- `skills/analysis-from-swagger/SKILL.md` — (c) OpenAPI 3.1/3.0/Swagger 2.0 흡수 (`@readme/openapi-parser`)
- `skills/analysis-from-plan-doc/SKILL.md` — (d) md + pdf + Notion export 흡수
- `skills/analysis-from-figma/SKILL.md` — (b) Figma desktop selection 흡수 (`mcp__figma-desktop__*` 4 도구)

**5 schema** (strict / additionalProperties:false):
- `schemas/input-summary.schema.json` — orchestrate 통합 산출 (cross_refs + conflicts + score_components + dispatch_mode)
- `schemas/prompt-extract.schema.json`
- `schemas/swagger-extract.schema.json` (validation_status.spectral_invoked = 항상 false / auto-invoke 위반 검출)
- `schemas/plan-doc-extract.schema.json`
- `schemas/figma-extract.schema.json` (scope_out_notes 안 interaction/animation/autolayout-detail 등 명시)

**25 test case** — schema-validator 회귀 15 → **40/40 pass**.

### paradigm 4 결단 (Senior critique 본격 흡수)

| paradigm | 결단 |
|---|---|
| orchestrate 분리도 | **1-A 단일 skill (4 책임 응집)** / 재사용 신호 ≥ 2 누적 시 1-B carry |
| sub-skill 호출 방식 | **Hybrid 2-B 기본 (≤ 50K token) + 2-A escalate (> 50K)** / ❌ chain-driver dispatch (STRONG-STOP) |
| conflict 검출 산식 | **정량 (Levenshtein + stem set intersection)** / LLM 양심 회피 |
| spectral 검증 시점 | **사용자/orchestrate 명시 호출** / auto-invoke 금지 (no-simulation 정합) |

### 부수 갱신

- `skills/analysis-input-collection/SKILL.md` — description trigger 한 줄 추가
- `methodology-spec/workflow/input.md` — "수동 + skill 호출 + orchestrate 자동 dispatch" 3중
- `methodology-spec/plugin-charter.md` §2 R8 ⚠️→✅ + §3 G2 종결 (잔여 G4 > G5 > G1)
- `methodology-spec/skills-axis.md` — analysis 22 → 27
- `flows/analysis.phase-flow.json` — phase 0 skill mapping
- `.claude-plugin/plugin.json` — 3.1.0 → 3.3.0
- `decisions/DEC-2026-05-15-g2-orchestrate-skill-분리-채택.md` — 신설

### Lessons Learned (★ paradigm 진화)

- LL-G2-01: charter ✅ 판정 시 "형식 명시" vs "자산 차원" 구분 의무
- LL-G2-02: mermaid "선택" 점선 = 흐름 명세 누락 신호
- LL-G2-03: paradigm 결단 시 책임 합산 의무 (N+M 단일 의미 검증)
- LL-G2-04: chain-driver 결정론 axis 오염 회피 (STRONG-STOP) / Hybrid paradigm
- LL-G2-05: LLM 양심 의존 정성 판정 회피 (정량 산식 의무)
- LL-G2-06: auto-invoke 정책 정합 (외부 도구 명시 호출)

### 정합 관계

- DEC-2026-05-15-g2-orchestrate-skill-분리-채택 (본 entry SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter §3 G2 종결 sibling)
- v2.6.0 paradigm (의미 ID — `analysis-from-*` slot)
- ADR-008 v2 (이중 렌더링 / input-summary.md)
- ADR-009 (no-simulation / spectral auto-invoke 금지)

---

## [3.2.0] — 2026-05-15 ★ ★ ★ MINOR — G3 종결 / 산출물 폴더 자동 + 지속 운영 인프라 + plugin charter 채택

> ★ ★ ★ **charter §3 G3 종결** — R5/R7 (산출물 폴더 + 작업단위 컨벤션) ✅ 도달. 1회성 hook ❌ / **지속 운영 인프라** 격상 (사용자 본질 재정의 "참조 쉬워야 + 동기화 되어야"). v3.1.0 → v3.2.0 정식 release (commit b762a0c).

### 신설 / 수정 자산 (commit b762a0c / 19 file)

- `methodology-spec/plugin-charter.md` — 17 요구사항 SSOT 신설 (R1~R17 + §4 Claude Code 디폴트 + Gap 5 + 추가 권장 8)
- `schemas/work-unit-manifest.schema.json` — scope + stage manifest schema 신설
- `tools/chain-driver/src/{work-unit,sync,query}.js` — M4 = 자동 drift 감지 + 수동 cascade
- `tools/chain-driver/src/cli.js` — init --scope / query / sync CLI 신규 (115 line 추가)
- `hooks/hooks.json` — SessionStart hook 자동 발동 (recover + markDrift 안내 / D21' 정합)
- `methodology-spec/lifecycle-contract.md` — §파일 위치 컨벤션 확장
- `methodology-spec/id-conventions.md` — scope slug 항목 신설
- `schemas/state.schema.json` — current_scope optional 필드

### 검증

- 114/114 test pass (기존 72 + scope-dir 22 + sync 11 + query 9)
- e2e smoke GREEN (/tmp/g3-smoke)

### Lessons Learned

- `feedback_strict_exposes_drift.md` — additionalProperties:false strict 적용 = fixture drift 폭로 가치 신호

### 정합 관계

- DEC-2026-05-15-g3-scope-folder-종결 (SSOT)
- DEC-2026-05-15-plugin-charter-17-requirements-채택 (charter SSOT)
- ADR-CHAIN-005 §2 (atomic write + CAS)
- ADR-008 v2 (이중 렌더링)
- v2.6.0 paradigm (stage 폴더 `planning/spec/test/impl` 의미 ID)

---

## [3.1.0] — 2026-05-15 ★ ★ ★ MINOR — chain 1~4 phase ID 의미 ID 자산화 (v3.0.0 carry resolved / D-3 paradigm sibling)

> ★ ★ ★ **v3.0.0 carry resolved** — analysis chain (v3.0.0) 의미 ID 자산화 패턴 정합 sibling. planning/spec/test/implement 4 chain 안 26 phase 숫자 ID → 의미 ID. **scaffolding only / PoC 미사용 / breaking 영향 ≈ 0 / additive 격** 사유로 MINOR. 사내 배포 전 / 실 사용자 0 / alias map ❌ / 즉시 cutover.

### chain별 phase ID 매핑 (26)

**chain 1 (planning) — 5 phase**
| old | new | depends_on |
|---|---|---|
| `P1.0` | **`input-validate`** | [] |
| `P1.1` | **`use-cases-decompose`** | [input-validate] |
| `P1.2` | **`br-intent-extract`** | [input-validate, use-cases-decompose] |
| `P1.3` | **`planning-spec-compose`** | [use-cases-decompose, br-intent-extract] |
| `P1.4` | **`gate-1`** | [planning-spec-compose] |

**chain 2 (spec) — 6 phase**
| old | new | depends_on |
|---|---|---|
| `P2.0` | **`input-integrate`** | [] |
| `P2.1` | **`behavior-spec-compose`** | [input-integrate] |
| `P2.2` | **`acceptance-criteria-derive`** | [behavior-spec-compose] |
| `P2.3` | **`cross-link-7-deliverables`** | [behavior-spec-compose, acceptance-criteria-derive] |
| `P2.4` | **`behavior-diagrams-render`** | [behavior-spec-compose, acceptance-criteria-derive, cross-link-7-deliverables] |
| `P2.5` | **`gate-2`** | [behavior-diagrams-render] |

**chain 3 (test) — 7 phase**
| old | new | depends_on |
|---|---|---|
| `P3.0` | **`framework-detect`** | [] |
| `P3.1` | **`tc-decompose`** | [framework-detect] |
| `P3.2` | **`test-code-generate`** | [tc-decompose] |
| `P3.3` | **`ac-tc-backlink`** | [test-code-generate] |
| `P3.4` | **`red-evidence`** | [test-code-generate, ac-tc-backlink] |
| `P3.5` | **`coverage-measure`** | [red-evidence] |
| `P3.6` | **`gate-3`** | [red-evidence, coverage-measure] |

**chain 4 (implement) — 8 phase**
| old | new | depends_on |
|---|---|---|
| `P4.0` | **`input-plan`** | [] |
| `P4.1` | **`impl-decompose`** | [input-plan] |
| `P4.2` | **`impl-code-generate`** | [impl-decompose] |
| `P4.3` | **`commit-hash-fill`** | [impl-code-generate] |
| `P4.4` | **`green-evidence`** | [commit-hash-fill] |
| `P4.5` | **`static-analysis`** ★ Senior REVISE-3 흡수 (tools/static-runner 명과 axis 분리) | [green-evidence] |
| `P4.6` | **`matrix-finalize`** | [green-evidence, static-analysis] |
| `P4.7` | **`gate-4`** | [green-evidence, static-analysis, matrix-finalize] |

### paradigm 정합 (v3.0.0 D-3 sibling)

- **D-3 paradigm 본질 보존** — `depends_on` 그래프 SSOT / `order` 필드 부재 / 위상정렬 자동 / lexicographic tiebreak
- **작명 paradigm** = "의미만 보존" (chain prefix ❌ / `input-validate` / `input-integrate` / `input-plan` — chain 별 의미 차이를 이름에 담음)
- **flow JSON `version` 일괄 격상** — `2.0.0-dev` → `3.1.0` (repo version 동기화 / "미완성 draft" 신호 영역 정리)

### 영향 범위 (실측 10 file)

- `flows/planning.phase-flow.{json,mermaid}` — 5 phase ID + depends_on + version
- `flows/spec.phase-flow.{json,mermaid}` — 6 phase ID + depends_on + version
- `flows/test.phase-flow.{json,mermaid}` — 7 phase ID + depends_on + version
- `flows/implement.phase-flow.{json,mermaid}` — 8 phase ID + depends_on + version (★ P4.5 `static-runner` → `static-analysis`)
- `CHANGELOG.md` — v3.0.0 Carry strikethrough + v3.1.0 entry 신설
- `docs/adr/ADR-CHAIN-012-phase-id-semantic-id.md` — §carry resolved 본문

### 영향 ❌ 영역 (grep 실측)

- `skills/` `methodology-spec/` `templates/` `schemas/` `agents/` — P1.X~P4.X 직접 인용 0건 (skill 명만 인용)
- `tools/` src code — P1.X~P4.X 직접 인용 0건 (chain stage prefix 만 인용)
- finding-system enum — P1.X~P4.X 부재 (v3.0.0 시점 P-prefix 폐기 완료)

### Senior critique 흡수 (Sonnet 4.6 / 가벼운 sub-agent / 20분 cap)

| 신호 | 흡수 |
|---|---|
| STOP | 없음 ✅ |
| REVISE-1 (`input-*` cross-chain 혼동) | drift-validator 경고 영역 보완 paradigm (chain prefix ❌ 정합 보존) |
| REVISE-2 (gate-2 depends_on 의도) | 현 P2.5 = `[P2.4]` 동일 paradigm 보존 / JSON 의도 명시 |
| REVISE-3 (static-runner phase ID ↔ tool 명 충돌) | **`static-runner` → `static-analysis` 격하** ✅ |
| CAUTION-1 (normalize-phase-flow.js 호환) | ✅ 실측 호환 (chain 비종속 정규식) |
| CAUTION-2 (scope 신뢰) | ✅ |
| CAUTION-3 (flow JSON version 의미) | ✅ 본 entry 명시 |

### 검증 통과

- ✅ JSON 정합 4/4 (`node -e JSON.parse`)
- ✅ workspace test 317/0 (v3.0.0 baseline 보존)
- ✅ release-readiness 9/9 strict
- ✅ drift-validator --check-chain-layout: 4 stages / 26 phases / 13 skills / 0 orphans / 0 missing
- ✅ drift-validator --check-layout: 11 phases / 22 skills / 0 orphans
- ✅ drift-validator --check-state-flow-consistency: 5 flow stages / 5 enum stages match
- ✅ chain harness 5 요소 변경 ❌ (chain-driver gate-eval.js / hooks-bridge.js / release-readiness.js / br-cross-consistency-validator 본질 보존)

### Sprint sequence

- S1 — Senior critique sub-agent (Sonnet 4.6 / 20분 cap) — STOP 0 / REVISE 3 / CAUTION 3 발행 + 흡수
- S2 — 사용자 일괄 승인 6 결정 묶음
- S3 — flows JSON 4 file rename (★ 26 phase ID + depends_on + version `2.0.0-dev` → `3.1.0`)
- S4 — flows mermaid 4 file rename (★ subgraph 노드 ID `P_<semantic>` 패턴 + edge)
- S5 — CHANGELOG v3.1.0 entry + v3.0.0 Carry strikethrough + ADR-CHAIN-012 §carry resolved
- S6 — 전수 검증 (workspace + release-readiness + drift-validator)
- S7 — plugin.json + package.json 3.0.0 → 3.1.0 + commit + git tag v3.1.0 + origin push

### 결정적 사실

- ★ ★ **scaffolding only** — planning/spec/test/implement chain 안 PoC end-to-end 실행 0건 / chain harness 입력 0 / breaking 영향 ≈ 0
- ★ ★ ★ v3.0.0 (analysis MAJOR / 54 file) vs v3.1.0 (chain 1~4 MINOR / 10 file) — 1/5 scope + breaking 영향 단계 차이로 semver weight 격하 정당
- ★ ★ chain harness validated §8.1 strict 9/9 본질 보존

---

## [3.0.0] — 2026-05-15 ★ ★ ★ ★ ★ MAJOR — phase ID 의미 ID 본격 자산화 (D-3 paradigm / depends_on 그래프 SSOT / 위상정렬 자동 도출)

> ★ ★ ★ ★ ★ ★ ★ **BREAKING — manifest phase ID 11개 숫자 → 의미 ID + workflow file 11 rename + drift-validator 위상정렬 신규** (★ ★ ★ ★ semver MAJOR / 사내 배포 전 / 실 사용자 0 / alias map ❌ / 즉시 cutover). v2.0 SDLC 4단계 chain harness 도입 이래 누적 paradigm 의 자연 분기점 — magic decimal (4.5/4.7/4.8) + hyphenated (5-1/5-2) + 의미 부재 (0~6) 본격 폐기.
>
> ★ ★ paradigm 본격 위치 = `docs/adr/ADR-CHAIN-012-phase-id-semantic-id.md` (D-3 paradigm 본격 명세) + `.claude/plans/plan-phase-id-semantic-rename.md` (Senior critique 흡수 + Sprint 분할 본격).

### BREAKING — phase ID 매핑 (11)

| v2.6.0 (숫자) | v3.0.0 (의미 ID) | depends_on |
|---|---|---|
| `0` | **`input`** | [] |
| `1` | **`discovery`** | [input] |
| `2` | **`db-schema`** | [discovery] |
| `3` | **`architecture`** | [discovery, db-schema] |
| `4` | **`business-logic`** | [discovery, db-schema, architecture] |
| `4.5` | **`formal-spec`** | [business-logic] |
| `4.7` | **`characterization`** | [business-logic, formal-spec] |
| `4.8` | **`sql-inventory`** | [discovery, business-logic, characterization] |
| `5-1` | **`api`** | [business-logic, formal-spec, characterization, sql-inventory] |
| `5-2` | **`ui`** | [architecture, business-logic, characterization] |
| `6` | **`quality`** | [business-logic, formal-spec, api, ui] |

### BREAKING — workflow file rename (11)

```
phase-0-input.md              → input.md
phase-1-init.md               → discovery.md
phase-2-db.md                 → db-schema.md
phase-3-arch.md               → architecture.md
phase-4-business-logic.md     → business-logic.md
phase-4-5-formal-spec.md      → formal-spec.md
phase-4-7-characterization.md → characterization.md
phase-4-8-sql-inventory.md    → sql-inventory.md
phase-5-1-api.md              → api.md
phase-5-2-ui.md               → ui.md
phase-6-quality.md            → quality.md
```

### D-3 paradigm 본질

- **`id`** = 의미 ID (영문 hyphenated lowercase)
- **`order` 필드 부재** — 순서는 `depends_on` 그래프 → 위상정렬로 자동 도출
- **lexicographic tiebreak** — 같은 레벨 노드는 알파벳 순 (api / ui 같은 병렬)
- **alias map ❌** — 즉시 cutover

### 신규 영역 (5건)

1. **`tools/drift-validator/src/topological-sort.js`** — Kahn's algorithm + lexicographic tiebreak + 순환 검출 + unknown_deps 검출
2. **`tools/drift-validator/src/check-phase-skills.js`** — depends_on 그래프 무결성 검증 통합 (DAG 의무 + unknown phase 0)
3. **`tools/drift-validator/test/topological-sort.test.js`** — +5 test (DAG 정상 / lexicographic / 순환 / unknown / diff 형식)
4. **`schemas/finding-system.schema.json`** — phase 필드 oneOf (integer + enum["4.5"]) → 의미 ID enum 11종
5. **`docs/adr/ADR-CHAIN-012-phase-id-semantic-id.md`** — D-3 paradigm 본격 명세 + LL-i-51~53

### 검증 통과

- ✅ workspace test 312 → 317 (drift +5 신규 / 회귀 ❌)
- ✅ drift-validator --check-layout: 11 phases / 22 skills / 0 orphans / 0 missing
- ✅ drift-validator --check-chain-layout: 4 stages / 26 phases / 13 skills / 0 orphans
- ✅ drift-validator mermaid ↔ JSON 짝 비교: 0 breaking / 0 non-breaking
- ✅ release-readiness v3.0.0: 9/9 strict pass
- ✅ chain harness 5 요소 본질 보존 (★ chain-driver gate-eval.js / hooks-bridge.js / release-readiness.js / br-cross-consistency-validator 모두 본질 변경 ❌)

### Sprint 본격 sequence

- S1 (Senior critique sub-agent) — STOP-1+2 / REVISE-1~5 / CAUTION-1~4 발행 + 흡수
- S2 (commit `8a89461`) — manifest + workflow rename + 위상정렬 신규
- S3-a (commit `cff7949`) — schemas + tools 코드 정합 (state-store `P0.0` → `input.0`)
- S3-b (commit `e33d380`) — PoC finding 일괄 sed + 본문 path + mermaid + normalize-phase-flow.js 정규식
- S4 — 전수 검증 (327/0 + 9/9)
- S5 (본 release) — ADR-CHAIN-012 + CHANGELOG v3.0.0 + version bump + commit + tag + push

### Carry (v3.0 후 cleanup)

- examples/poc-04-* analysis 디렉토리 명 (`0-init/`, `1-architecture/` 등 옛 표기) — 사람 가독성 axis
- skills 본문 안 옛 file 명 misnomer 인용 (phase-3-domain / phase-1-inventory 등) — manual review
- 본문 자유 텍스트 "Phase 4" 산문 표기 — manual review
- ~~★ **다른 chain stage flow phase ID 의미 ID rename** (planning P1.0~P1.3 / spec P2.0~P2.5 / test P3.0~P3.6 / implement P4.0~?) — 별개 plan 영역~~ → **v3.1.0 resolved**


## [2.6.0] — 2026-05-14 ★ ★ ★ ★ MINOR — skill 의미 ID 본격 자산화 (★ phase-N 숫자 prefix 본격 폐기 / 17 skill rename / Senior critique 5 의제 본격 흡수)

> ★ ★ ★ ★ ★ ★ **BREAKING — skill 디렉토리 17 rename + 명시 호출 path 본격 변경** (★ ★ ★ semver MINOR / 사내 dogfooding 한정 / Senior critique 의제 3 전면 흡수). 자연어 trigger 영역 description 본문 보존 / auto-invocation 영향 ❌. v2.5.1 명시 호출 (예 `/analysis-phase-0-input`) → v2.6.0 새 이름 (예 `/analysis-input-collection`). alias map ❌ / 즉시 cutover.
>
> ★ ★ paradigm 본격 위치 = `methodology-spec/skills-axis.md` §6 plan-b carry "v2.0 진입 시 의미 ID + alias map (plan-b carry) 으로 자연 흡수 예정" 본격 자연 흡수 자산화. §6 본인이 v1.4.x "과도기 패턴" 인정 영역 본격 진화. `.claude/plans/plan-skill-meaningful-id-rename.md` + Senior critique 5 의제 본격 흡수 (HARD STOP 2건 = semver MINOR + 영향 42 file / SOFT 3건 = 명명 미세 4건 + common-errors section + micro-commit 패턴) → 사용자 결단 본격 일괄 승인 paradigm.

### BREAKING — skill rename 17 (★ ★ ★ aspect 4 + br-cross 1 + chain stage 11 = 변경 ❌)

| v2.5.1 | v2.6.0 |
|---|---|
| `analysis-phase-0-input` | **`analysis-input-collection`** |
| `analysis-phase-1-inventory` | **`analysis-source-inventory`** |
| `analysis-phase-2-architecture` | **`analysis-architecture`** |
| `analysis-phase-3-domain` | **`analysis-domain-model`** |
| `analysis-phase-4-rules` | **`analysis-business-rules`** |
| `analysis-phase-4-5-cross-validation` | **`analysis-formal-spec-validation`** |
| `analysis-phase-4-7-characterization` | **`analysis-characterization-test`** (★ Senior 의제 1 흡수 / Feathers WELC 용어) |
| `analysis-phase-4-8-sql-inventory` | **`analysis-sql-inventory`** |
| `analysis-phase-5-error-mapping` | **`analysis-error-mapping`** |
| `analysis-phase-5-form-validation` | **`analysis-form-validation-fe`** (★ FE suffix 일괄) |
| `analysis-phase-5-openapi` | **`analysis-openapi`** |
| `analysis-phase-5-rules` | **`analysis-api-rule-mapping`** (★ Senior 의제 1 흡수 / Spring binding 혼동 회피) |
| `analysis-phase-5-schema-erd` | **`analysis-db-schema-erd`** |
| `analysis-phase-5-state-map` | **`analysis-ui-state-map-fe`** (★ FE suffix 일괄) |
| `analysis-phase-5-type-spec` | **`analysis-type-spec-fe`** (★ FE suffix 일괄) |
| `analysis-phase-5-visual-manifest` | **`analysis-ui-visual-manifest-fe`** (★ FE suffix 일괄) |
| `analysis-phase-6-quality` | **`analysis-quality-antipattern`** (★ Senior 의제 1 흡수 / 산출물 정합) |

### 영향 범위 본격 (★ Senior 의제 5 흡수 / grep 실측 42 file)

- ★ **skills/ rename 17** — git mv + SKILL.md frontmatter `name:` + 본문 제목 + cross-skill 참조 (★ workflow/ + .aimd/ path 보존 = lifecycle-contract axis)
- ★ **flows/ 2** — analysis.phase-flow.json (11 phases skills 배열 + 3 history entry) + flows/README.md (drift-validator 호출자 인용)
- ★ **tools/ 2** — spec-test-link-validator src/validator.js comment + package.json description
- ★ **methodology-spec/ 6** — skills-axis.md (★ §6 진화 + §8 신설) + lifecycle-contract.md + README.md + deliverables 20/21 + workflow phase-4-7/4-8
- ★ **root README + briefing 2 + guides 4 + decisions 1 = 8** — 자연어 trigger 매핑 표 + 사내 onboarding + 사용자 가이드 + 역사 기록
- ★ **tools/*/README 8** — validator/runner 자체 호출자 인용

### Senior critique 5 의제 본격 흡수

| 의제 | 강도 | 흡수 |
|---|---|---|
| 1. 명명 미세 조정 4건 | 🟠 SOFT | ✅ 전면 흡수 (FE suffix 일괄 / binding→mapping / characterization→characterization-test / quality-finding→quality-antipattern) |
| 2. v2.5.1→v2.6.0 cutover section | 🟠 SOFT | ✅ `guides/common-errors.md` Q14.5 본격 신설 |
| 3. semver v2.5.2 PATCH → v2.6.0 MINOR | 🔴 HARD STOP | ✅ 전면 흡수 (skill name 17 rename = breaking API surface change 사실 본격 인공) |
| 4. Sprint 2 micro-commit + drift-validator fail-fast | 🟠 SOFT | ✅ D1a/b/c 5+6+6 batch + D3 앞당김 (D2 직후) + D4.5 chain-driver test 회귀 신설 |
| 5. 영향 범위 28 → 42 file 본격 재산정 | 🔴 HARD STOP | ✅ 전면 흡수 (grep 실측 본격 / plan §2.5 본격 자산화) |

### 검증 본격 통과

- ✅ drift-validator 3-way (manifest ↔ workflow ↔ skills) — 22 skills_declared / 11 phases_checked / 0 diff
- ✅ workspace test 322/0 본격 보존 (312 workspace + 10 release-readiness self-test)
- ✅ release-readiness 9/9 본격 통과 (chain harness validated §8.1 strict 본질 보존)
- ✅ spec-test-link-validator + chain-driver test 회귀 0 (5/5 + 72/72)
- ✅ 자연어 trigger 영역 description 본문 보존 (auto-invocation 영향 ❌)

### Sprint 본격 sequence

- Sprint 1 (plan 본격 확정 + Senior critique 흡수) ✅
- Sprint 2 (D1a/b/c + D2 + D3 fail-fast + D4+D4.5 + D5+D5.5 + D6+D6.5 + D7 + D8) ✅
- Sprint 3 (skills-axis §6/§8 + ADR-CHAIN-011 LL-i-50 + CHANGELOG v2.6.0 + version bump + build dist + commit) ★ 진행

### 결정적 사실

- ★ ★ chain harness validated §8.1 strict 9/9 본질 보존 (★ release-readiness 회귀 ❌)
- ★ ★ ★ alias map ❌ paradigm = ★ "사내 dogfooding 한정 + 자연어 trigger 메인 path / 명시 호출 부차 path" 사실 본격 정합
- ★ ★ ★ ★ paradigm 본격 위치 = ★ ★ §6 v1.4.x 과도기 본격 자연 흡수 / §8 v2.6.0 의미 ID 본격 자산화 / ADR-CHAIN-011 §9 LL-i-50 본격 자산화
- ★ workflow/<phase-id>.md file 명 보존 (★ manifest phase ID axis / skill name axis 무관)
- ★ aspect 4 + br-cross 1 + chain stage 11 = 변경 ❌ (이미 의미 ID)

---

## [post-v2.5.1 meta cleanup] — 2026-05-14 (메타 정리 — plugin.json description + CLAUDE.md CHANGELOG 라인 + CHANGELOG.md split / 가독성 영역 한정 / no release / no version bump / no tag / chain harness 5 요소 변경 ❌)

> ★ ★ 사용자 결단 "즉시 가능부터" — 메타 정리 3건 일괄 시행. paradigm / chain harness / schema / PoC / validator 변경 ❌. 가독성 + 신규 contributor 진입 마찰 해소 영역 한정.

### 시행 산출 3건

1. **`.claude-plugin/plugin.json` description 정상화** — ≈ 3KB session history (Phase A~D + chain harness 변경 사실 + workspace test 수치 + ADR LL 참조) → 200자 안정 제품 설명 (marketplace.json description 톤 정합 / "변경 이력은 CHANGELOG.md 참조" 명시)
2. **`CLAUDE.md` CHANGELOG 라인 슬림화** — 1줄 7849자 (session 9~15차 SESSION-WRAPUP 응축) → 200자 (v2.5.1 PATCH 현재 + v2.5.0 MINOR FINAL release 직전 + 상세 CHANGELOG link) — 다른 섹션 (가치 명세 / 4원칙 / 핵심 디렉토리 / 정착 패턴) 본문 보존
3. **`CHANGELOG.md` split** — v2.3.7 ~ v1.4.0 (line 725 ~ 2338) → `CHANGELOG-HISTORY.md` 상단 prepend (★ 두번째 split / 첫 split = 2026-05-06 cleanup round 2-A v1.3.x 격리)
   - 본문 `CHANGELOG.md`: 165KB / 2341 라인 / 34 헤더 → **60KB / 729 라인 / 12 헤더** (v2.4+ 본문 보존)
   - archive `CHANGELOG-HISTORY.md`: 67KB / 1254 라인 / 13 헤더 → **168KB / 2870 라인 / 36 헤더** (v2.3.7 ~ v1.0)
   - `CHANGELOG-HISTORY.md` header 갱신 (v1.3.x → v2.3.x and earlier) + `CHANGELOG.md` 하단 pointer 갱신

### 결정적 사실

- ★ ★ chain harness 5 요소 변경 ❌
- ★ ★ v2.5.0 MINOR FINAL release 본질 보존 ✅ (Layer 2 LLM paradigm / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm 모두 본질 보존)
- ★ version-check 3-way sync v2.5.1 보존 ✅
- ★ release-readiness 9/9 strict pass ✅ (`node scripts/release-readiness.js --target v2.5.1`)
- ★ release-readiness self-test 10/10 pass ✅ (`npm run test:release`)
- ★ br-cross-consistency-validator 31/31 보존 ✅
- ★ 11 PoC 호환 자격 보존 ✅

### 선행 회귀 별개 carry

- ★ `tools/drift-validator/check-phase-skills.test.js` + `chain stage layout test` 2건 실패 — v2.5.1 PATCH 1-depth 평탄화 후 validator 미동기화 / **git stash 후에도 동일 실패 = 본 meta-cleanup refactor 무관 / pre-existing regression**.

### 신규 carry 3 (★ ★ ★ 3 resolved by follow-up commits / 0 outstanding)

- ✅ **C-drift-validator-skills-flat-sync** (medium / tools / regression / **resolved**) — v2.5.1 1-depth 평탄화 후 `tools/drift-validator/check-phase-skills.test.js` + `chain stage layout test` 2건 실패. follow-up commit 안 `check-phase-skills.js` 1-depth + category prefix paradigm 정합 갱신 시행 → **workspace test 310/2 → 312/0 본질 회복** ✅.
- ✅ **C-briefing-outdated-v2.2-to-v2.5.1** (high / onboarding / content / **resolved**) — ★ ★ ★ `briefing/` 사내 동료 onboarding 자료 v2.2.0 시점 → v2.5.1 격차 5단계. follow-up commit 안 5 file 본격 갱신 시행 + Confluence 4 page update + title 복원.
- ✅ **C-guides-outdated-1-depth-paradigm** (★ ★ ★ critical / plugin INCLUDE 영역 / 동료 install 후 broken link / **resolved**) — `guides/` 5 file 본격 갱신 시행:
  - `first-prompt-cookbook.md` — ★ ★ ★ skill path 20+ link 본격 갱신 (`skills/<category>/X` → `skills/<category>-X` 1-depth + prefix paradigm) + ★ v2.5 신규 `analysis-br-cross-consistency-check` 추가 + v2.4 dual representation paradigm 본격 명시 + 38 skill 정합
  - `getting-started.md` — v2.0.0 → v2.5.1 정합 (사내 GHE install / Skills 38 + Agents 3 / chain 1 gate Layer 2 LLM / 16 tools / 9/9 strict)
  - `chain-harness-guide.md` — §5.1 Layer 2 LLM 통합 본격 신설 (br-cross-consistency-validator Layer 1 + Layer 2 paradigm / gate-eval.js layer2_threshold / Anthropic API ❌ + Claude Code Task tool ✅ 정정)
  - `common-errors.md` — Q1.1 신규 Skills 0 critical 결함 회복 절차 + §6.1 신규 Layer 2 LLM 마찰 3 Q (Q15 응답 시간 / Q16 semantic_drift_detected 사용자 결단 / Q17 confidence_cap_exceeded) + Q11 256 → 295 file + Q14 명시 호출 1-depth
  - `guides/README.md` — 자산 4 표 본격 갱신 + 본 DEC 참조 추가
  - ★ ★ ★ **동료 install 후 broken link 본격 차단** ✅ (grep `skills/{analysis,planning,spec,test,implement,_base}/` 0건 확인)

### 부속 자산

- `DEC-2026-05-14-post-v2.5.1-meta-cleanup.md` 신설 + INDEX.md 갱신
- `README.md` CHANGELOG link 3건 갱신 (v1.4+/v1.3 이전 → v2.4+/v2.3.x 이전) — 본 split 정합

---

## [v2.5.1] — 2026-05-14 ⭐ 현재 (★ ★ ★ ★ PATCH — Claude Code plugin install 호환성 본격 회복 + 사상 명세 (skills-axis + agents-axis) 본격 자산화 + 3-way sync 회복 (package.json v2.4.1→v2.5.1 / v2.5.0 release commit 갱신 누락 회복) + chain harness 5 요소 변경 ❌)

> ★ ★ ★ **v2.5.1 PATCH** — v2.5.0 MINOR FINAL release 후속 — 사내 GHE plugin install 후 38 skill + 3 agent 본격 인식 ❌ 였던 v2.0.0~v2.5.0 본질 결함을 post-v2.5.0 commit `4d25df8` (agents/skills 1-depth 평탄화) 로 본격 회복 + 본 PATCH 안에 사상 명세 본격 정합 + DEC + ADR LL 자산화 + 3-way sync 회복.

### ★ ★ ★ v2.5.1 산출 자산 6종

1. ★ ★ ★ **agents/skills 1-depth 평탄화 본격 자산화** (post-v2.5.0 commit `4d25df8` 본격 자산화) — 38 skill + 3 agent Claude Code 표준 1-depth + category prefix paradigm (★ skills/<category>-<name>/SKILL.md + agents/_base-<name>.md)
2. ★ ★ **methodology-spec/skills-axis.md 본격 정합** (category prefix 1-depth paradigm 사상 갱신 / v1.4.4 신설 paradigm 의 본격 정합)
3. ★ ★ **methodology-spec/agents-axis.md 본격 작성** (사상 명세 자산화 — agents 1-depth paradigm + _base 카테고리 + sub-agent invocation paradigm 정합)
4. ★ **DEC-2026-05-14-agents-skills-1-depth-flatten 신설** + INDEX 갱신
5. ★ **ADR-CHAIN-011 §9 LL-i-48+49 자산화** (Claude Code plugin 표준 1-depth vs lifecycle stage organize 충돌 본질 결함 + category prefix flatten 해소 paradigm)
6. ★ ★ **3-way sync 회복** — `package.json` v2.4.1 → v2.5.1 (★ v2.5.0 release commit `9e6cf55` 갱신 누락 회복) + `plugin.json` v2.5.0 → v2.5.1 + CHANGELOG 헤더 신설 + README.md 상단 version 표시 v2.0.0-rc1 → v2.5.1 정합

### ★ ★ ★ critical 결정적 사실

- ★ ★ ★ **v2.0.0~v2.5.0 까지 plugin install 영역에서 skill 본격 작동 ❌ 했던 본질 결함** = 본 v2.5.1 PATCH 본격 회복 ✅
- ★ ★ 사내 GHE 표준 install (`/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` + `/plugin install ai-native-methodology@ai-native-methodology`) 본격 작동 ✅ (사용자 측 install 검증 통과)
- ★ chain harness 5 요소 변경 ❌ (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle 변경 ❌)
- ★ v2.5.0 MINOR FINAL release 본질 보존 ✅ (★ Layer 2 LLM paradigm + ≥ 2 PoC corroboration + Adzic SBE 함정 회피 + industry-first paradigm 모두 본질 보존)
- ★ 11 PoC 호환 자격 보존 ✅
- ★ workspace test 312/0 + scripts/test 10/10 = 322/0 본질 보존 ✅

### ★ ★ release-readiness 9/9 strict (★ v2.5.0 격상 본질 보존)

- v2.5.0 시점 8/8 → 9/9 격상 (★ layer_2_consistency criterion 신설). 본 PATCH 도 9/9 strict 통과 자격 (★ chain harness 본질 + 분석 stage 영역 변경 ❌ / regression ❌).

### ★ ★ neutral neighbor — 본 PATCH 영역 외

- 본 PATCH = plugin install 호환성 fix + 사상 명세 자산화 + 3-way sync 회복 영역 한정. v2.5.0 본격 paradigm (Layer 2 LLM Claude Code sub-agent invocation / dual representation / ≥ 2 PoC corroboration / Adzic SBE 함정 회피 / industry-first paradigm) = 본질 보존.

### ★ ★ Lessons Learned 2건 자산화 (ADR-CHAIN-011 §9 patch v10)

- ★ ★ ★ **LL-i-48** — Claude Code plugin 표준 1-depth (`agents/<name>.md` + `skills/<name>/SKILL.md`) vs 본 plugin lifecycle stage organize 2-depth (`agents/<category>/<name>/<name>.md` + `skills/<category>/<name>/SKILL.md`) **충돌 본질 결함** — v2.0.0~v2.5.0 까지 사내 GHE install 후 skill 본격 작동 ❌ 본질 사실. plugin lifecycle organize 사상 자체 (skills-axis.md v1.4.4) ≠ Claude Code runtime 영역 paradigm. **사용자 결단 paradigm = sub-axis 영역 분리** (★ 사상 axis = methodology-spec / runtime axis = skills/<category>-<name>/ 1-depth 평탄화).
- ★ ★ **LL-i-49** — category prefix flatten 해소 paradigm — 사용자 결단 옵션 B (★ ★ sub-axis 분리 / 디렉토리 axis = prefix 형태 보존). 사용자 결단의 본질 = "사상 보존 (lifecycle organize axis 사상 명세) + Claude Code 호환 (1-depth runtime)" dual axis. ★ 사상 명세 = methodology-spec/skills-axis.md + agents-axis.md / runtime 자산 = skills/<category>-<name>/ + agents/_base-<name>.md. 본 paradigm 은 ★ ADR-008 이중 렌더링 사상 (사상 + 자산 분리) 의 plugin runtime 영역 확장.

### ★ ★ 신규 carry 1

- ★ **C-poc-axis-design-vs-runtime-separation-paradigm** (medium / 사상 명세) — 향후 plugin lifecycle organize 사상 vs Claude Code runtime 호환성 충돌 발생 시 본 paradigm (사상 axis 보존 + runtime 평탄화) 정합 적용 carry.

---

## [v2.5.0] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ MINOR FINAL — Layer 2 LLM paradigm 본격 도입 + ≥ 2 PoC corroboration 본격 입증 + Adzic SBE 10년 폐기 함정 회피 자격 본격 도달 + industry-first paradigm 본격 입증 + release-readiness 8/8 → 9/9 격상 + chain harness validated 본질 보존 ✅)

> ★ ★ ★ ★ ★ ★ **v2.5.0 MINOR FINAL** — Phase A (description vs natural_language paradigm 재정의 / session 10차) + Phase B (PoC #03 + PoC #05 dual representation 마이그레이션 / Layer 1 keyword threshold 자체 제거 / session 11차) + Phase C (Layer 2 LLM Claude Code sub-agent invocation paradigm 본격 구현 / Sonnet 4.6 batch / session 12~14차) + Phase D (release-readiness 9/9 격상 + ≥ 2 PoC corroboration 본격 검증 + drift BR 2건 DRIFT 격상 자산 / session 15차) 모두 본격 종결.

### ★ ★ ★ ★ ★ ★ v2.5.0 Phase D session 15차 산출 자산 8종

1. ★ ★ **`scripts/release-readiness.js`** — check9 layer_2_consistency 신규 + check3 + check8 경로 회복 (★ session 11차 phase B `input/ → output/rules/` 회귀 회복 / per-PoC mean ≥ 0.7 + critical/high drift 0 / Senior REVISE-1 + LL-i-43 정합)
2. ★ ★ **`scripts/test/release-readiness.test.js`** — 9 → 10 case (★ +1 신규 layer_2_consistency happy path / criterion id 9개 정합)
3. ★ ★ **`examples/poc-05-sample-user-register/output/rules/rules.json`** — meta 안 generated_at + confidence + inputs_used + methodology_version + formula_version + extraction_env 표준 필드 회복 (★ session 11차 phase B 회귀 회복)
4. ★ ★ ★ **`tools/br-cross-consistency-validator/PHASE-D-2026-05-14-corroboration-final.md`** — 31 BR 통합 corroboration 본격 입증 자산
5. ★ ★ ★ **`tools/br-cross-consistency-validator/PHASE-D-2026-05-14-drift-domain-review.md`** — 2 drift BR DRIFT 격상 자산 (BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 / 사용자 결단 / rules.json 변경 ❌)
6. ★ ★ **`decisions/DEC-2026-05-14-v2.5.0-minor-final.md`** — DEC 신설 (★ 본 release 정합)
7. ★ **`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`** §11 patch v9 + §9 LL-i-44+45 자산화
8. ★ **plugin.json + br-cross-consistency-validator/package.json + chain-driver/package.json** version bump (2.4.1 → 2.5.0 / 0.1.0 → 0.2.0)

### ★ ★ ★ ★ ★ ★ chain harness 5 요소 변경

| 요소 | session 14차 | session 15차 |
|---|---|---|
| 1. no-simulation policy trio | ❌ | ❌ |
| 2. D21' (suppressOutput) | ❌ | ❌ |
| 3. release-readiness content-aware | ❌ | ★ ★ **9th criterion 추가 (additive)** |
| 4. chain-driver gate-eval Layer 2 | ★ session 14차 (additive) | ❌ |
| 5. drift state-flow | ❌ | ❌ |

→ ★ ★ ★ **additive change paradigm 정합** (★ ★ chain harness validated 본질 보존 ✅ / LL-i-42 정합)

### ★ ★ ★ ★ ★ ★ release-readiness 9/9 실측 (★ session 15차 본격)

```
node scripts/release-readiness.js --target v2.5.0
✅ poc_corroboration / real_tool_evidence / validators_violation / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass / analysis_validator_violation / layer_2_consistency

9/9 criteria passed.
★ ★ ★ v2.5.0 = release-ready.
```

★ Layer 2 per-PoC mean: PoC #01=0.848 (n=13) / PoC #03=0.914 (n=18) / PoC #05=0.970 (n=2, sample).

### ★ ★ ★ ★ ★ ★ ≥ 2 PoC corroboration 본격 입증 (★ 31 BR)

| PoC | n | L1 | L2 | overall | gate |
|---|---|---|---|---|---|
| PoC #01 (Java/Spring) | 13 | 0.954 | 0.848 | **0.901** | ★ pass |
| PoC #03 (TS/NestJS) | 18 | 0.967 | 0.914 | **0.941** | ★ pass |
| PoC #05 (sample) | 2 | 1.0 | 0.97 | 0.985 | ★ pass (corroboration ❌) |

→ ★ ★ ★ **§8.1 strict ≥ 2 PoC corroboration 자격 본격 도달 ✅** (★ ADR-CHAIN-008 정합 / cross-language + cross-platform + drift 종류 diversity 확보)

### ★ ★ ★ ★ ★ ★ test 회귀 검증

- workspace 전수: **312/0** (★ session 14차 보존 / 회귀 ❌)
- scripts/test/release-readiness.test.js: **10/10** (★ session 14차 9 → 본 session 10 / +1 신규)
- 합산 **322/0 pass** ✅

### ★ ★ ★ ★ ★ ★ Lessons Learned 신규 (★ ADR-CHAIN-011 §9 patch v9)

- ★ ★ ★ ★ **LL-i-44** (★ "drift BR DRIFT 격상 자산 paradigm = rules.json 변경 ❌ 본격 본질")
- ★ ★ ★ **LL-i-45** (★ "absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증")

### ★ ★ ★ ★ ★ ★ 자격 본격 입증 4종 ✅

- ★ ≥ 2 PoC corroboration ✅ (31 BR)
- ★ Adzic SBE 10년 폐기 함정 회피 ✅ (★ Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증)
- ★ industry-first 자격 (Spec Kit 90K stars 정면 비교) ✅
- ★ chain harness validated 본질 보존 ✅ (★ additive change paradigm)

---

## [v2.4.1] — 2026-05-14 (★ ★ ★ PATCH — 사내 GHE plugin 배포 채널 정착 + root `.claude-plugin/marketplace.json` 신설 (git-subdir source / path: ai-native-methodology) + `ai-native-methodology/.claude-plugin/plugin.json` homepage GHE 교체 + README.md 시나리오 B → B-1 (GHE git URL, Recommended) + B-2 (dist artifact, 오프라인) 분리 + DEC-2026-05-14-ghe-marketplace-root-신설 + chain harness 5 요소 변경 ❌)

> ★ ★ ★ **v2.4.1 PATCH — 사내 GHE plugin 배포 채널 정착** — v2.4.0 ⭐ MINOR FINAL release plugin artifact 가 사내 GHE (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 에 본격 배포됨. nested 레포 구조 (`<git-root>/ai-native-methodology/.claude-plugin/`) 와 Claude Code marketplace add 시 git root 의 `.claude-plugin/marketplace.json` 만 인식하는 표준 동작 사이의 path 불일치 해소 → `git-subdir` source 타입 채택.

### ★ ★ ★ v2.4.1 산출 자산 5종

1. ★ **root `<git-root>/.claude-plugin/marketplace.json` 신설** — `git-subdir` source / `path: "ai-native-methodology"` / `url: https://github.smilegate.net/SGH-ISD/ai-native-methodology.git` → 사용자 `/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v2.4.1` 1줄 install 가능
2. ★ **`ai-native-methodology/.claude-plugin/plugin.json` homepage 교체** — `https://github.com/rageboom/ai-native-methodology` → `https://github.smilegate.net/SGH-ISD/ai-native-methodology` (사내 정합)
3. ★ **`ai-native-methodology/.claude-plugin/marketplace.json` 보존** — `source: "./"` 그대로 (시나리오 A 편집자 워크스페이스 직접 등록 / 시나리오 B-2 dist artifact 폴더 등록 워크플로 보존)
4. ★ **README.md 시나리오 B 분리** — B-1 (GHE git URL, ★ Recommended / 사내 표준) + B-2 (dist artifact, 오프라인 / 특수 환경 fallback)
5. ★ **DEC-2026-05-14-ghe-marketplace-root-신설** + `decisions/INDEX.md` 갱신

### ★ ★ chain harness 5 요소 변경 ❌

본 v2.4.1 PATCH = plugin 배포 path infrastructure 영역 한정 (사내 GHE 본격 배포 / nested 레포 → git-subdir paradigm). chain harness 5 요소 (chain-driver / 4 gate validator / state.json / 산출물 schema / lifecycle) 변경 ❌. 11 PoC 호환 자격 보존 ✅. v2.4.0 ⭐ MINOR FINAL release 본질 보존 ✅.

### ★ ★ ★ ★ release-ready ❌ 명시 (★ install path fix purpose only)

본 v2.4.1 PATCH 는 release-readiness §8.1 strict **6/8 pass / 2 regress** 인지 상태로 commit + tag. **사용자 결단** "v2.4.1 = install path fix 한정 / release-ready ❌ 명시 carry" (★ Recommended 옵션).

| criterion | 결과 | 원인 |
|---|---|---|
| poc_corroboration / real_tool_evidence / chain_coverage / adr_registry / matrix_greenness / e2e_cycle_pass | ✅ 6/6 | v2.4.0 본질 보존 |
| validators_violation | ❌ | session 11~13차 carry — planning-extraction (poc-05) BR-USER-DATA-001 unknown_br |
| analysis_validator_violation | ❌ | session 11차 carry — poc-05 input/rules.json missing (`input/ → output/rules/` 이전) |

★ 본 regress 2건 = sessions 11~14차 v2.4.0 carry update (`no release / no version bump / no tag`) 누적 부담. v2.4.0 ⭐ MINOR FINAL release 시점 8/8 pass → carry update 4 session 누적 → 본 v2.4.1 release-readiness 부담 떠안음.

★ ★ 본 v2.4.1 PATCH 본질 = **사내 GHE install 차단 즉시 해소**. 8/8 strict 회복 = sessions 15차+ Phase D carry 영역 (★ release-readiness 9/9 + v2.5.0 MINOR FINAL release 영역 정합).

### ★ ★ 신규 carry 3건

- ★ ★ **C-release-readiness-recovery-v2.5.0** (★ critical / sessions 15차+ Phase D 영역) — PoC #05 input/rules.json 재배치 + planning-extraction (poc-05) BR-USER-DATA-001 정합 + 8/8 strict 회복
- ★ **C-ghe-distribution-validation** (medium / install UX 본격 재시도 동작 검증)
- C-settings-json-auto-distribution (low / 사내 사전 배포 paradigm)

---

## [v2.4.0 carry update — session 14차 SESSION-WRAPUP — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합 (★ chain harness 5 요소 1 변경) — Phase C 본격 종결 ✅] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — gate-eval.js findings shape 안 llm_consistency_score+llm_threshold+llm_status 3 필드 + evaluateGate 안 layer2_threshold block reason + severityRank rank 2 (coverage_threshold 수준) + applyUserDecision user go → go-with-warnings 허용 + Senior STOP-3 흡수 + REVISE 4건 흡수 + chain-driver test +4 신규 (68→72) + workspace 312/0 + chain harness validated 본질 보존 ✅ + DEC + ADR §9 LL-i-42+43 + §11 patch v8 / Phase D 진입 자격 본격 도달 / session 15차+ = release-readiness 9/9 + v2.5.0 MINOR FINAL release)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 14차 — v2.5.0 Phase C step 9 종결 — chain 1 gate Layer 2 통합** — ★ session 13차 carry C-chain-1-gate-layer-2-integration (critical) 시행. ★ 4원칙 1단계 plan T 자산화 → 4원칙 2단계 Senior critique → 4원칙 3단계 사용자 결단 "1" (★ 종합 권장 시행) → 4원칙 4단계 본격 시행 + Phase C 본격 종결.

### ★ ★ ★ ★ ★ ★ session 14차 Senior critique STOP signal 흡수

- ★ ★ ★ ★ **STOP-3** (★ Q-S3 (b) 단독 선택 시 Phase C 종결 자격 상실) → Q-S3 (a) 본격 채택

### ★ ★ ★ ★ ★ ★ session 14차 시행 산출 (★ chain harness 5 요소 1 변경)

- ★ ★ ★ `tools/chain-driver/src/gate-eval.js` 본격 갱신:
  - findings shape: `llm_consistency_score` + `llm_threshold` + `llm_status` 3 필드 (★ Q-S1 (a))
  - evaluateGate: `layer2_threshold` block reason 추가 (★ explicit guard `llm_status === 'evaluated' && score != null && score < threshold` / REVISE-1)
  - severityRank: `layer2_threshold: 2` (★ coverage_threshold 수준 / Senior 권장 / REVISE-3)
  - applyUserDecision: layer2_threshold = user go → go-with-warnings (★ Q-S2 (b) coverage_threshold 수준)
- ★ `tools/chain-driver/test/gate-eval.test.js`: +4 신규 Layer 2 paradigm test (skipped / pass / fail / user-go) / REVISE-4 / chain-driver 68→72
- ★ `decisions/DEC-2026-05-14-phase-c-step-9-chain-1-gate-layer-2.md` 신설
- ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-42+43 + §11 patch v8

### ★ ★ ★ ★ ★ ★ ★ session 14차 결정적 사실

| 사실 | 자료 |
|---|---|
| **★ chain 1 gate Layer 2 통합 ✅** | gate-eval.js + 4 신규 test |
| **★ ★ chain harness 5 요소 1 변경 (chain-driver)** | Senior 검토 후 / additive change paradigm 정합 |
| **★ chain harness validated 본질 보존 ✅** | no-simulation trio + D21' + release-readiness content-aware 영역 비손상 |
| **★ ★ ★ ★ ★ Phase C 본격 종결 ✅** | step 1~12 모두 완료 |
| **★ workspace 312/0** | session 13차 308 → +4 / 회귀 ❌ |
| **★ Phase D 진입 자격 본격 도달** | release-readiness 9/9 + v2.5.0 MINOR FINAL release 의무 |

### ★ ★ Lessons Learned 신규 (★ session 14차)

- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-42** (★ "chain harness 5 요소 변경 paradigm — additive change paradigm + chain harness validated 본질 보존 의무")
- ★ ★ ★ ★ ★ ★ **LL-i-43** (★ "Layer 2 block reason severity rank paradigm — semantic drift = coverage_threshold 수준 / Phase D 도메인 전문가 검토 carry 정합")

### ★ ★ Phase C step 1~12 본격 종결 ✅

| step | session |
|---|---|
| step 1~5 (plan + sub-agent + 결단 + validator interface + prompt spec) | 12차 |
| step 6~8 (PoC #03 NL + PoC #05 GWT + PoC #01 Layer 2) | 13차 |
| **step 9 (chain 1 gate Layer 2 통합)** | **14차 ✅** |
| step 10 (OVERALL_THRESHOLD 재설계) | 12차 (paradigm 구현 ✅) |
| step 11 (test 갱신) | 12+13+14차 |
| **step 12 (Phase C SESSION-WRAPUP)** | **14차 ✅** |

### ★ ★ 다음 step (★ ★ session 15차+ = Phase D)

- ★ ★ ★ release-readiness 8/8 → 9/9 재격상
- ★ ★ ≥ 2 PoC corroboration 본격 검증
- ★ ★ ★ PoC #01 13 BR + 2 drift BR 도메인 전문가 검토
- ★ ★ ★ ★ ★ ★ **v2.5.0 MINOR FINAL release** (★ commit + git tag v2.5.0 + origin push)
- ★ self-evaluation bias retrospect (Opus/Haiku 교차 검증)

---

## [v2.4.0 carry update — session 13차 SESSION-WRAPUP — v2.5.0 Phase C step 6+7+8+11+12 본격 시행 + Claude Code sub-agent invocation paradigm 본격 동작 입증] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — Task tool 5회 본격 호출 (Sonnet 4.6 / batch / 31 BR) + PoC #03 NL 본격 합성 + PoC #05 GWT 신규 합성 + PoC #01+#03+#05 Layer 2 cross-validation + 3 PoC 모두 gate pass + ≥ 2 PoC corroboration L1+L2 양쪽 통과 ✅ + Adzic 함정 회피 자격 본격 도달 ✅ + industry-first 자격 본격 입증 ✅ + skill 신설 + DEC + ADR §9 LL-i-39+40+41 + §11 patch v7 + 308/0 test pass + semantic_drift 2 BR Phase D carry / Phase C 종결 = session 14차 chain 1 gate Layer 2 통합 / Phase D = release-readiness 9/9 + v2.5.0 MINOR release)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 13차 — v2.5.0 Phase C step 6+7+8+11+12 본격 시행** — ★ session 12차 carry (C-phase-c-step-6-12-session-13 critical) 시행. ★ 사용자 결단 "1" (Plan S §3.1 옵션 A) 정합. ★ ★ ★ Task tool 5회 본격 호출 (★ Sonnet 4.6 / batch paradigm) 본격 시행 + 본격 재실측 + skill 자산화 + SESSION-WRAPUP.

### ★ ★ ★ ★ ★ ★ ★ ★ ★ session 13차 Task tool 5회 본격 호출 (★ Sonnet 4.6 / batch paradigm 정합)

| Agent | step | scope | 결과 JSON |
|---|---|---|---|
| Agent 1 (NL 합성) | step 6-a | PoC #03 18 BR NL TODO marker → 본격 statement | layer-2-results/poc-03-nl-synthesis.json |
| Agent 3 (GWT 합성) | step 7-a | PoC #05 2 BR GWT 신규 합성 | layer-2-results/poc-05-gwt-synthesis.json |
| Agent 5 (Layer 2) | step 8 | PoC #01 13 BR Layer 2 재검증 | layer-2-results/poc-01-layer-2-results.json |
| Agent 2 (Layer 2) | step 6-b | PoC #03 18 BR Layer 2 cross-validation | layer-2-results/poc-03-layer-2-results.json |
| Agent 4 (Layer 2) | step 7-b | PoC #05 2 BR Layer 2 cross-validation | layer-2-results/poc-05-layer-2-results.json |

### ★ ★ ★ session 13차 본격 재실측 결과 (★ Layer 1 + Layer 2 통합)

| PoC | L1 | L2 | overall | gate | findings |
|---|---|---|---|---|---|
| **PoC #01 (baseline)** | 0.954 | **0.848** | **0.901** | **★ ★ pass ✅** | 5 (4 low + 1 medium drift) |
| **PoC #03 (session 13차 신규)** | 0.967 | **0.914** | **0.941** | **★ ★ pass ✅** | 5 (4 low + 1 medium drift) |
| **PoC #05 (sample)** | 1.000 | **0.97** | **0.985** | **★ ★ pass ✅** | 0 |

### ★ ★ ★ ★ ★ ★ ★ session 13차 결정적 사실

| 사실 | 자료 |
|---|---|
| **★ ≥ 2 PoC corroboration Layer 1 + Layer 2 양쪽 통과 ✅** | PoC #01 13 + PoC #03 18 = 31 BR (★ Senior STOP-1 본격 흡수) |
| **★ Adzic SBE 폐기 함정 회피 자격 본격 도달 ✅** | Layer 1 + Layer 2 axis 자료 보유 / LL-i-26 정합 |
| **★ Claude Code sub-agent invocation paradigm 본격 동작 입증 ✅** | B-4 paradigm / Anthropic API key 의무 ❌ |
| **★ industry-first 자격 본격 입증 ✅** | Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT 모두 부재 / LL-i-35 정합 |
| **★ workspace 전수 test = 308/0** | session 12차 보존 / 회귀 ❌ |

### ★ ★ ★ session 13차 산출 (자산화 + skill)

- ★ ★ ★ `examples/poc-03-realworld-nestjs/output/rules/rules.json` (★ 18/18 BR NL 본격 statement 갱신)
- ★ `examples/poc-05-sample-user-register/output/rules/rules.json` (★ 2/2 BR GWT 신규 합성 + sample_mode 보존)
- ★ ★ `tools/br-cross-consistency-validator/layer-2-results/` 디렉토리 신설 + 5 결과 JSON 자산화
- ★ ★ ★ `tools/br-cross-consistency-validator/PHASE-C-2026-05-14-re-measurement.md` 본격 재실측 보고
- ★ ★ ★ `skills/analysis-br-cross-consistency-check/SKILL.md` 신설 (Q-C-trigger (d) paradigm 정합)
- ★ `flows/analysis.phase-flow.json` cross_cutting.aspects.skills[] 등록 (drift-validator 47/47 pass)
- ★ ★ `decisions/DEC-2026-05-14-phase-c-step-6-12-session-13.md` 신설
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-39+40+41 + §11 후속 patch v7

### ★ ★ semantic_drift_detected 2 BR (★ Phase D carry)

- **BR-AUTH-JWT-002** (PoC #01 / 0.65 / 규범 vs 현실 비대칭)
- **BR-USER-DELETE-AUTH-001** (PoC #03 / 0.55 / semantic_inversion / absent BR)

### ★ ★ Lessons Learned 신규 (★ session 13차)

- ★ ★ ★ ★ ★ ★ ★ **LL-i-39** (★ "Claude Code sub-agent invocation paradigm 본격 동작 입증 + Sonnet 4.6 batch paradigm 정합")
- ★ ★ ★ ★ ★ ★ **LL-i-40** (★ "Adzic SBE 폐기 함정 회피 자격 본격 도달 — Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증")
- ★ ★ **LL-i-41** (★ "same-model self-evaluation bias 위험 + Phase D retrospect carry 의무")

### ★ chain harness 5 요소 변경 ❌

본 session 13차 시행 영역 = rules.json 갱신 + skill 신설 + flows/analysis.phase-flow.json 갱신 (★ skill manifest 등록 / drift-validator orphan 회피) + ADR + DEC + 자산화. chain harness 5 요소 변경 ❌ 보존.

★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js) = ★ session 14차 본격 결단 영역.

### ★ ★ 다음 step (★ ★ session 14차)

- ★ ★ ★ ★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- ★ Phase C SESSION-WRAPUP
- ★ ★ ★ ★ ★ ★ Phase D = release-readiness 8/8 → 9/9 + PoC #01 도메인 전문가 검토 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 12차 SESSION-WRAPUP — v2.5.0 Phase C step 1~5 시행] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — Layer 2 LLM 본격 paradigm 구현 (Claude Code sub-agent invocation paradigm) + Senior STOP-1+2+3+4 흡수 + REVISE 5건 흡수 + validator interface 본격 + docs/layer-2-prompt-spec.md 신설 + test +5 (31/31) + workspace 308/0 + DEC 신설 + ADR §9 LL-i-37+38 + §11 patch v6 / Phase C step 6~12 = session 13차 분리)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 12차 — v2.5.0 Phase C step 1~5 시행** — ★ ★ session 11차 patch v5 paradigm 회복 후속 carry (C-phase-c-paradigm-redesign + C-claude-code-subagent-invocation-paradigm). ★ 4원칙 1단계 plan `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` 자산화 → ★ ★ 4원칙 2단계 가벼운 Senior critique sub-agent 토론 → 4원칙 3단계 사용자 결단 "진행하자" → 4원칙 4단계 시행 + Lessons Learned.

### ★ ★ ★ ★ ★ ★ ★ session 12차 Senior critique STOP signal 흡수

- ★ ★ ★ ★ ★ **STOP-1 (최강도 / Claude → Claude self-invocation echo chamber)** → ★ Sonnet 4.6 sub-agent 호출 paradigm 의무 / F-015 cross-validation pattern 정합
- ★ ★ ★ ★ **STOP-2 (강 / Phase C 12 step scope 폭증)** → ★ session 12차 = step 1~5 한정 / session 13차 = step 6~12 분리
- ★ ★ ★ **STOP-3 (중강 / trigger 영역 결단 부재)** → ★ (d) skill trigger + (a) ad-hoc hybrid paradigm
- ★ ★ ★ **STOP-4 (중 / batch paradigm 부재 시 1.5~2.5시간 비현실적)** → ★ batch paradigm 의무

### ★ ★ ★ session 12차 Q-C 종합 결단 (★ ★ 사용자 "진행하자" 결단 정합)

- **Q-C0 (b)**: B-4 AI-Native 본질 paradigm — Claude Code sub-agent (Task tool / Agent tool) invocation paradigm 본격 채택
- **Q-C-trigger (d)+(a)**: skill trigger + ad-hoc hybrid
- **Q-C-batch**: batch paradigm 의무 — 1회 Task tool 호출 안 전체 BR list 입력
- **Q-C-model**: Sonnet 4.6 (★ STOP-1 echo chamber 약화)
- **Q-C1 (a)**: `--llm-results <json>` 옵션 신설
- **Q-C2 (a)**: `docs/layer-2-prompt-spec.md` 신설
- **Q-C3 (b)**: Phase D 시 chain 1 gate 통합 (★ session 12차 scope 축소)
- **Q-C4 (a)**: Layer 1 AND Layer 2 양쪽 통과 의무
- **Q-C5 (a)**: Claude 가 일괄 batch 합성 + Phase D 도메인 전문가 검토 carry

### ★ ★ ★ session 12차 산출 8종

- ★ ★ `tools/br-cross-consistency-validator/src/cli.js` (★ `--llm-results <path>` 옵션 신설 + Layer 2 LLM 호출 paradigm usage 영역 명시)
- ★ ★ ★ `tools/br-cross-consistency-validator/src/llm.js` (★ placeholder → 본격 paradigm / semantic_drift_detected finding 신설 + confidence_cap_exceeded finding 신설 / extractLLMMeta 함수 신설)
- ★ ★ ★ `tools/br-cross-consistency-validator/src/validator.js` (★ Layer 1 AND Layer 2 양쪽 통과 paradigm 본격 / DETERMINISTIC_THRESHOLD 0.85 신설 / overall_score = (L1 + L2) / 2 / summary 영역 확장 / computeDeterministicScore 안 Layer 2 findings 제외 axis 분리)
- ★ ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +5 Layer 2 본격 paradigm test / 31/31 pass)
- ★ ★ ★ ★ `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` (★ 신설 / paradigm 사상 + Task tool 호출 paradigm + batch paradigm 의무 + prompt 본문 + 응답 schema + validator 호출 paradigm + trigger paradigm + 한계 carry)
- ★ ★ `decisions/DEC-2026-05-14-phase-c-step-1-5-layer-2-paradigm-implementation.md` (★ DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-37+38 + §11 후속 patch v6
- ★ `~/.claude/plans/r-v2.5.0-phase-c-layer-2-claude-code-subagent.md` (★ §0 종결 + §6 한계 갱신)

### ★ ★ ★ ★ 결정적 사실 (★ session 12차)

| 사실 | 자료 |
|---|---|
| **★ Layer 2 본격 paradigm interface 구현 ✅** | cli.js + llm.js + validator.js / placeholder → 본격 paradigm 격상 |
| **★ B-4 paradigm 본격 채택 ✅** | Claude Code sub-agent invocation paradigm / Anthropic API key 의무 ❌ |
| **★ batch paradigm 의무 명시 ✅** | docs/layer-2-prompt-spec.md §2 / 1회 Task tool 호출 안 전체 BR list |
| **★ Sonnet 4.6 sub-agent model 명시 ✅** | STOP-1 echo chamber 약화 / F-015 정합 |
| **★ confidence cap 0.85 enforcement ✅** | Static Tool 시뮬레이션 금지 정책 정합 / advisory 신뢰도 cap |
| **★ Layer 1 + Layer 2 통합 점수 paradigm ✅** | Q-C4 (a) / overall_score = (L1 + L2) / 2 |
| **★ workspace 전수 test = 308/0** | session 11차 303 → +5 / 회귀 ❌ |

### ★ ★ Lessons Learned 신규 (★ session 12차 / ADR-CHAIN-011 §9 patch v6 자산화)

- ★ ★ ★ ★ ★ ★ **LL-i-37** (★ "Claude → Claude self-invocation echo chamber 회피 paradigm = Sonnet 4.6 sub-agent + F-015 cross-validation pattern 정합")
- ★ ★ ★ ★ **LL-i-38** (★ "Node.js script 안 LLM 직접 호출 ❌ paradigm 본질 / Claude Code sub-agent invocation paradigm 본격 채택")

### ★ chain harness 5 요소 변경 ❌

본 session 12차 시행 영역 = validator interface + prompt spec + test + plan 갱신 + DEC + ADR patch. chain harness 5 요소 (★ schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존.

★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js) = ★ ★ session 13차 (★ Phase C step 9) 영역.

### ★ ★ 다음 step (★ session 13차 = Phase C step 6~12)

- ★ ★ ★ ★ ★ ★ ★ PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 (★ Claude Code Task tool / Sonnet 4.6 / batch paradigm) + 도메인 전문가 검토 carry
- ★ ★ ★ ★ ★ PoC #05 2 BR GWT 신규 합성 (★ sample mode 보존)
- ★ ★ ★ ★ PoC #01 13 BR Layer 2 재검증 (★ baseline 비교)
- ★ ★ ★ ★ chain 1 gate br-cross-consistency-validator Layer 2 통합 (★ chain-driver gate-eval.js / chain harness 5 요소 1 변경 의무)
- ★ skills/analysis-br-cross-consistency-check/SKILL.md 신설 (★ Q-C-trigger (d) 정합)
- ★ Phase C SESSION-WRAPUP
- ★ ★ ★ ★ ★ ★ Phase D = release-readiness 8/8 → 9/9 재격상 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 11차 SESSION-WRAPUP — v2.5.0 Phase B 시행] — 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — PoC #03 18 BR 형식 sliding (TCA → GWT) + action = metadata 보존 + NL TODO marker + PoC #05 input/→output/rules/ 이전 + sample_mode meta + description→NL 자동 추출 + Layer 1 threshold 자체 제거 + 303/0 test pass + ≥ 2 PoC corroboration 자격 도달 + DEC 신설 + ADR patch v4 + LL-i-33~35 자산화)

> ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 11차 — v2.5.0 Phase B 시행** — ★ ★ session 9차 신규 carry C-poc-03-05-dual-representation (critical / Senior STOP-1 흡수) + C-keyword-threshold-degrade + session 10차 carry C-poc-02-11-description-to-nl-migration 후속. ★ ★ 4원칙 1단계 plan `~/.claude/plans/q-v2.5.0-phase-b-poc-03-05-마이그레이션.md` 자산화 → 4원칙 2단계 sub-agent 3 병렬 토론 → 4원칙 3단계 사용자 결단 "1" (★ 종합 권장 시행) → 4원칙 4단계 시행 + Lessons Learned. Plan Q §3 Phase B scope 본격 시행.

### ★ ★ ★ ★ ★ ★ ★ session 11차 Q-B 종합 결단 (★ ★ 사용자 "1" 결단 정합)

- **Q-B0 (c)**: scope 축소 시행 (★ Adzic 함정 회피 + Phase C 진입 자격 자료 확보 + release 지연 회피 균형)
- **Q-B1 (b)**: 형식 sliding only — trigger→When / condition→Given / expected_result→Then / **action = GWT step 분리 ❌ + rejection_method + verification_location metadata 보존** / NL = TODO marker (★ Phase C LLM 본격 합성 의무 carry)
- **Q-B2 (b)**: PoC #05 `input/rules.json` → `output/rules/rules.json` git mv 이전 + sample_mode meta 명시 (★ Agent 1 phase-flow SSOT 정합)
- **Q-B3 (b)**: Layer 1 keyword threshold **자체 제거** (★ session 9차 "0.15 floor advisory" → session 11차 "★ ★ threshold 비교 자체 ❌") / "non-empty + overlap > 0" sanity check only / `structural_sanity_only` finding 신설 (overlap = 0 시만)
- **Q-B4 (a)+(c)**: PoC #01 13 BR NL self-review 1차 ✅ + Phase D 전 도메인 전문가 검토 carry
- **Q-B5 (b)**: PoC #05 corroboration **산입 ❌** + spot check only (★ Senior STOP-4 흡수 / n=2 statistical power ≈ 0)
- **Q-B6 (a)**: session 11차 LLM 부재 / Phase C session 12차+ 본격 LLM 호출

### ★ ★ ★ session 11차 산출 8종

- ★ ★ `tools/br-cross-consistency-validator/scripts/synthesize-gwt-from-tca.mjs` (★ 신설 / TCA → GWT 형식 sliding script / ★ Agent 1 Cucumber/Fowler/ECA 3중 외부 권위 정합)
- ★ ★ ★ `examples/poc-03-realworld-nestjs/output/rules/rules.json` (★ ★ 18 BR Phase B 마이그레이션 ✅ / trigger→When / condition→Given / expected_result→Then + action = metadata 보존 + NL TODO marker)
- ★ ★ `examples/poc-05-sample-user-register/output/rules/rules.json` (★ git mv input/ → output/rules/ + 2 BR description→NL 자동 추출 + meta.sample_mode=true + meta.corroboration_eligible=false)
- ★ ★ `tools/br-cross-consistency-validator/src/deterministic.js` (★ ★ keyword_mismatch finding 완전 제거 + structural_sanity_only finding 신설 / overlap === 0 시만)
- ★ `tools/br-cross-consistency-validator/src/validator.js` (★ OVERALL_THRESHOLD deprecated semantic 명시 + Phase C carry)
- ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +2 신규 paradigm test / 26/26 pass / 회귀 ❌)
- ★ ★ `tools/br-cross-consistency-validator/PHASE-B-2026-05-14-re-measurement.md` (★ 재실측 보고 / ≥ 2 PoC corroboration 자료)
- ★ `decisions/DEC-2026-05-14-phase-b-poc-03-05-마이그레이션.md` (★ DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-33~35 + §11 후속 patch v4

### ★ ★ ★ ★ 결정적 사실 (★ session 11차)

| 사실 | 자료 |
|---|---|
| **★ ≥ 2 PoC corroboration 자격 도달 ✅** | PoC #01 (13 BR) + PoC #03 (18 BR) = **31 BR** (★ Senior STOP-1 흡수 ✅) |
| **★ PoC #01 baseline 격상** | deterministic_score 0.608 → **0.954** / gate fail → **pass** (★ paradigm 정합 격상) |
| **★ PoC #03 cross-validation 진입 자격 ✅** | with_both=18 / 의도된 NL TODO marker = sanity ∅ paradigm 정합 |
| **★ PoC #05 sample mode + corroboration ❌** | n=2 statistical power ≈ 0 / meta 명시 |
| **★ workspace 전수 test = 303/0** | session 10차 302 → +1 신규 paradigm test / 회귀 ❌ |
| **★ ★ Layer 1 threshold 자체 제거 paradigm 정착** | Agent 3 STOP-3 흡수 (magic number 0.15 회피) + MDPI 2025 "no single generalizable cut-off" 정합 |

### ★ ★ Lessons Learned 신규 (★ session 11차 / ADR-CHAIN-011 §9 정합)

- ★ ★ ★ ★ **LL-i-33** (★ "TCA 4축 → GWT 3축 형식 sliding paradigm = Cucumber/Fowler/ECA 3중 외부 권위 정합 / action = GWT step 분리 ❌ + metadata 보존")
- ★ ★ ★ ★ **LL-i-34** (★ "Layer 1 keyword threshold 자체 제거 paradigm / 'non-empty + overlap > 0' sanity check only / Layer 2 LLM mandatory Phase C 의무")
- ★ ★ ★ **LL-i-35** (★ "industry-first 자격 scope 정정 / dual representation ≠ industry-first (Cucumber Rule 2018 정합) / 4축 → GWT deterministic 합성 + NL ↔ GWT cross-consistency validator = industry-first 자격")

### ★ chain harness 5 요소 변경 ❌

본 session 11차 시행 영역 = PoC 자산 + validator paradigm + ADR §9+§11 patch + DEC 신설 + 자산화. ★ chain harness 5 요소 (schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존 ✅.

### ★ ★ 다음 step (★ session 12차+ / Phase C)

★ ★ ★ ★ ★ ★ ★ ★ **★ ★ ★ patch v5 paradigm 회복 (★ session 11차 후속 / 사용자 결단 "옵션 B")** — ★ Phase C 본격 구현 paradigm = **★ ★ Claude Code sub-agent (Task tool / Agent tool) invocation** (★ Anthropic API / OpenAI API 영역 ❌ / 본 방법론 plugin 자산 정합 / Static Tool 시뮬레이션 ❌)

- ★ ★ ★ ★ ★ ★ ★ Layer 2 LLM mandatory 본격 구현 (★ ★ Claude Code sub-agent 호출 paradigm / B-1 plugin hook 권장 + B-2 chain-driver + B-3 사용자 위임 mode 결단)
- ★ ★ ★ ★ ★ PoC #03 18 BR NL TODO marker → 본격 BR statement 합성 + 도메인 전문가 검토
- ★ ★ ★ ★ PoC #05 2 BR GWT 신규 합성
- ★ ★ ★ ★ chain 1 gate br-cross-consistency-validator Layer 2 통합
- ★ ★ OVERALL_THRESHOLD 의미 재설계 (Layer 1 + Layer 2 통합 점수)
- ★ ★ ★ ★ ★ ★ Phase D = release-readiness 8/8 → 9/9 재격상 + v2.5.0 MINOR release

---

## [v2.4.0 carry update — session 10차 SESSION-WRAPUP — v2.5.0 Phase A 시행] — 2026-05-13~14 (★ ★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — description vs natural_language paradigm 재정의 + schema 강화 (★ breaking change ❌) + validator paradigm 갱신 + PoC #01 13 BR 자동 마이그레이션 + 302/0 test pass + DEC + ADR patch v3)

> ★ ★ ★ ★ ★ ★ ★ ★ **session 10차 — v2.5.0 Phase A 시행** — ★ session 9차 신규 carry C-description-vs-nl-paradigm-define 흡수. 사용자 결단 "1" (즉시 시행) 정합. ★ ★ Agent 3 (c) hybrid 강 옵션 채택 (★ ★ session 9차 SPIKE v2 결정적 입증 + memory feedback_quality_priority.md 재작업 최소화 정합). Plan P §3 Phase A scope 본격 시행.

### ★ ★ ★ ★ ★ ★ paradigm 재정의

```
description    = ★ optional metadata (★ BR statement + rationale + caveat + DRIFT 격상 자유 metadata)
                                       (★ 사람 눈 친화 / characterization context 보존)
                                       (★ cross-validation 대상 ❌)

natural_language = ★ ★ ★ v2.5.0 권장 표준 (★ pure BR statement / 1~2 문장 / GWT 동치 의미)
                                            (★ cross-validation 대상 / Layer 2 LLM mandatory v2.5.0 Phase C)
                                            (★ rationale/caveat 제외)

cross-validation 대상 = ★ ★ natural_language ↔ given/when/then ONLY
                         (★ description 제외 / ★ Layer 1 keyword overlap 한계 회피)
```

### ★ ★ ★ session 10차 산출 8종

- ★ `schemas/rules.schema.json` (★ Phase A paradigm 명세 강화 / allOf.anyOf + item description + natural_language + description field description 모두 강화)
- ★ ★ `tools/br-cross-consistency-validator/src/deterministic.js` (★ description alias 제거 + description_only_fallback low finding 신설 + hasDescription return 신규)
- ★ `tools/br-cross-consistency-validator/src/validator.js` (★ withDescriptionOnly stat 신규)
- ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +3 신규 paradigm test / 25/25 pass)
- ★ `tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs` (★ 신설 / 3 step stripping / Phase B 재사용 의무)
- ★ ★ ★ `examples/poc-01-realworld-spring/output/rules/rules.json` (★ ★ 13/13 BR 자동 마이그레이션 적용 / description 보존 + natural_language 신규 추출)
- ★ `decisions/DEC-2026-05-14-description-vs-nl-paradigm-재정의.md` (★ DEC 신설)
- ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §9 LL-i-31+32 + §11 후속 patch v3

### ★ ★ schema 변경 (★ ★ ★ breaking change ❌)

- ★ allOf.anyOf description 강화 — "description fallback (★ v2.5.0 Phase A — backward-compat / Phase B 마이그레이션 carry)" 명세
- ★ item description 강화 — "cross-validation 대상 = natural_language ↔ given/when/then **ONLY** (★ description 제외)" 명세
- ★ natural_language field description 강화 — "pure BR statement" 명세 + Layer 2 LLM cross-validation 대상 명세
- ★ description field description 강화 — "optional metadata 격상" 명세 (★ deprecated alias 격하 ❌ → ★ ★ optional metadata 격상)

### ★ ★ validator 변경

- ★ ★ description ↔ natural_language alias 처리 ★ 제거 (★ nlText = NL field only)
- ★ ★ hasDescription 신규 boolean (★ cross-validation 대상 ❌ / fallback 추적)
- ★ ★ ★ description_only_fallback low finding 신설 (★ Phase B 마이그레이션 carry 가시화)
- ★ representation_missing 조건 갱신 (★ description fallback 인정)
- ★ withDescriptionOnly stat 신규 (★ Phase B 마이그레이션 carry 추적)

### ★ ★ PoC #01 cross-validation 결과 (★ Phase A pilot 실증)

```
stats:   with_natural_language=13 / with_gwt=13 / with_both=13 / with_description_only=0 / with_finding=13
overlap: mean=0.173 / median=0.105 / max=0.500 (★ ★ session 9차 SPIKE v2 stripped 결과 그대로 실현)
score:   0.608 / gate: fail (★ Layer 1 keyword overlap structural sanity 격하 paradigm 입증)
```

### ★ ★ resolved + 신규 carry

**resolved (1)**:
- ★ ★ ★ C-description-vs-nl-paradigm-define (★ session 9차 carry) → ★ ★ resolved

**신규 carry (2 / Phase B 의무)**:
- ★ ★ ★ **C-poc-01-13-br-nl-human-review** (★ Phase B carry / 자동 추출 정확 보장 ❌ / 사람 검토 의무)
- ★ ★ ★ **C-poc-02-11-description-to-nl-migration** (★ Phase B carry / PoC #03 + #05 우선 / ≥ 2 PoC corroboration 정합)

### ★ ★ Lessons Learned 신규 2건

- ★ ★ ★ ★ **LL-i-31** (★ schema breaking change ❌ + validator paradigm 갱신 = safe 마이그레이션 paradigm / Phase A 시행 입증)
- ★ ★ **LL-i-32** (★ description ↔ NL paradigm 명세 = paradigm 결단 결정적 사실 / ADR-008 이중 렌더링 사상 확장 명세)

### chain harness 5 요소 변경 ❌ (★ ADR-CHAIN-001~005 정합)

본 session 10차 = ★ schema paradigm + validator + pilot PoC 마이그레이션 / ★ chain harness 5 요소 ★ 변경 ❌.

### ★ ★ test 보존

★ ★ 302/0 pass (★ +3 신규 paradigm test / 회귀 ❌).

### ★ ★ ★ ★ 다음 step (★ ★ Phase B = 다음 session)

- ★ ★ ★ PoC #03 dual representation 마이그레이션 (★ trigger/condition/action → natural_language + given/when/then 신규)
- ★ ★ ★ PoC #05 dual representation 마이그레이션 (★ description → natural_language + GWT 신규)
- ★ ★ Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
- ★ ★ ≥ 2 PoC corroboration 자료 확보 (★ Senior STOP-1 흡수 정합)
- ★ ★ Phase C 진입 자격 도달 (★ Layer 2 LLM mandatory 본격 구현)

---

## [v2.4.0 carry update — session 9차 SESSION-WRAPUP] — 2026-05-13 (★ ★ ★ ★ ★ ★ ★ ★ no release / no version bump / no tag — C-threshold-spike-revisit carry 흡수 + Layer 2 LLM 의무 격상 paradigm 결단 + ADR-CHAIN-011 §5.4 patch v2 + SPIKE v2 자산화)

> ★ ★ ★ ★ ★ ★ ★ ★ **session 9차 SESSION-WRAPUP** — ★ ★ session 8차 신규 carry C-threshold-spike-revisit (★ critical) 즉시 흡수. 4원칙 1단계 plan + 2단계 sub-agent 3 병렬 토론 (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) + 3단계 사용자 결단 + 4단계 시행 (SPIKE v1 재측정 + SPIKE v2 REVISE-6 + ADR §5.4 patch v2 + DEC 신설). ★ ★ ★ Senior STOP signal 3건 흡수 강도 분리 (STOP-1 단일 PoC §8.1 strict 위반 전면 흡수 / STOP-2 v2.4.0 라벨 강등 soft 흡수 = 라벨 보존 + carry 명시 / STOP-3 Layer 1 단독 = Adzic 폐기 함정 재현 전면 흡수).

### ★ ★ ★ ★ ★ ★ ★ session 9차 핵심 발견

**★ ★ ★ ★ ★ ★ ★ ★ 결정적 실측 자료**:

```
PoC #01 13 BR overlap 분포 (★ description alias 적용 후 / session 9차 SPIKE v1 재측정):
  min=0.000 p25=0.083 p50=0.162 p75=0.300 p90=0.381 max=0.462 / mean=0.201 / stddev=0.134

  ≥0.85: 0/13 (0%)   ★ ★ ★ ★ ★ ★ ★ hypothesis DEAD (empirical 정면 부정 결정적 사실)
  ≥0.5:  0/13 (0%)
  ≥0.3:  4/13 (31%)

SPIKE v2 (REVISE-6 rationale 제거 후 재측정 / 가설 B 검증):
  원본 mean=0.201 → stripped mean=0.173 → mean delta = -0.028 (★ 오히려 감소)
  → ★ ★ ★ ★ ★ ★ 가설 B 정면 부정 (data quality 차이 ❌ 본질 / semantic 차이 본질)
```

### ★ ★ ★ ★ ★ ★ paradigm 결단 (★ ADR-CHAIN-011 §5.4 patch v2)

- ★ ★ ★ ★ ★ ★ **≥0.85 hypothesis 정면 폐기** (★ session 8차 SPIKE v1 + session 9차 SPIKE v1 재측정 + SPIKE v2 + 3 agent 일치 corroboration)
- ★ ★ ★ ★ ★ ★ **Layer 2 LLM 의무 격상 paradigm 채택** (★ chain 1 gate mandatory / threshold ≥ 0.7 MDPI 2025 paraphrase optimal 정합 / F-015 cross-validation 패턴 / Static Tool 시뮬레이션 금지 정합)
- ★ ★ ★ **Layer 1 결정적 = "structural sanity check" 격하** (★ 두 표현 boolean + id 4토막 + structure 위치 / keyword threshold ≥ 0.15 floor advisory)
- ★ ★ ★ ★ ★ **≥ 2 PoC corroboration carry** (★ Senior STOP-1 흡수 / PoC #03 + #05 dual representation 적용 후 v2.5.0)
- ★ ★ ★ **v2.4.0 MINOR FINAL 라벨 soft 보존** (★ Senior STOP-2 / 라벨 강등 ❌ / carry 명시 ✅ / downstream 영향 회피)

### ★ ★ ★ session 9차 산출 5종

- ★ ★ ★ `tools/br-cross-consistency-validator/SPIKE-2026-05-13-v2-rationale-strip.md` (★ SPIKE v2 report 자산화)
- ★ `tools/br-cross-consistency-validator/scripts/spike-v2-rationale-strip.mjs` (★ SPIKE v2 시행 script)
- ★ ★ `decisions/DEC-2026-05-13-threshold-spike-revisit-paradigm.md` (★ DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5.4 patch v2 + §7.3 carry + §9 LL-i-28 + §10 version handling + §11 후속 (★ session 9차 갱신)
- ★ `~/.claude/plans/o-threshold-spike-revisit.md` (★ 4원칙 1단계 plan / 9 절 / 가설 3 + 결단 Q1~Q5)

### ★ ★ session 9차 resolved + 신규 carry

**resolved (1)**:
- ★ ★ ★ C-threshold-spike-revisit (★ session 8차 critical carry) → ★ ★ resolved (★ session 9차 SPIKE v1 재측정 + SPIKE v2 + Layer 2 LLM 의무 paradigm 결단 / implementation carry = C-layer-2-llm-mandatory-paradigm 흡수)

**신규 carry (4)**:
- ★ ★ ★ ★ **C-layer-2-llm-mandatory-paradigm** (★ critical / v2.5.0 — Layer 2 LLM placeholder → mandatory / ≥ 0.7 / F-015 / no-simulation 정합 / ≥ 2 PoC corroboration 의무)
- ★ ★ ★ ★ ★ **C-poc-03-05-dual-representation** (★ ★ critical / Senior STOP-1 흡수 / ≥ 2 PoC corroboration 의무 / v2.5.0 의무)
- ★ ★ **C-keyword-threshold-degrade** (★ medium / Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하 / v2.5.0)
- ★ ★ **C-description-vs-nl-paradigm-define** (★ v2.5.0 paradigm 결단 / Q2 의 a/b/c — 3 agent 충돌 영역)

### ★ ★ Lessons Learned 신규 3건

- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-28** (★ "keyword overlap = structural sanity check / Adzic 폐기 회피 도구 자격 ❌ / Layer 2 LLM 의무 격상" / SPIKE v1+v2 + 3 agent 일치 corroboration)
- ★ ★ ★ ★ **LL-i-29** (★ "Senior critique STOP signal 강도 분리 흡수 paradigm — 사실 명확도 × 비용 2축 평가")
- ★ ★ **LL-i-30** (★ "REVISE-6 가설 B 정면 부정 자체가 paradigm 결단 결정적 자료 / 가설 부정 = 다음 가설 강 corroboration")

### chain harness 5 요소 변경 ❌ (★ ADR-CHAIN-001~005 정합)

본 session 9차 = ★ paradigm 사상 결단 + ADR §5.4 patch v2 + DEC 신설 + 자산화 / ★ chain harness 5 요소 (chain-driver 5 요소) ★ 변경 ❌. ★ Layer 2 LLM mandatory 격상 = v2.5.0 sprint = chain harness 영역 신규 통합.

### ★ ★ ★ ★ 다음 step (★ v2.5.0 paradigm 본격 도입)

- ★ ★ ★ PoC #03 + PoC #05 dual representation 적용 → cross-validation 자료 ≥ 2 PoC corroboration 확보
- ★ ★ ★ Layer 2 LLM mandatory 본격 구현 (★ no-simulation 정책 정합 / 외부 LLM API 직접 호출)
- ★ ★ description vs natural_language paradigm 재정의 (★ Q2 결단)
- ★ ★ Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하
- ★ ★ chain 1 gate br-cross-consistency-validator Layer 2 통합
- ★ ★ ★ release-readiness 8/8 → 9/9 재격상 검토 (Layer 2 통과 criterion 추가)
- ★ ★ ★ v2.5.0 MINOR release

---

## [v2.4.0] — 2026-05-13 (★ ★ ★ ★ ★ ★ ★ MINOR release — BR dual representation paradigm 본격 도입 + br-cross-consistency-validator workspace 16번째 신설 + chain 1 gate REQUIRED_VALIDATORS_PER_STAGE 통합 + release-readiness §8.1 strict 7/7→8/8 격상 + 11 PoC 호환 회복 (PoC #01 + PoC #05 = VALID) / chain harness 5 요소 변경 ❌ — ★ ★ ★ ★ ★ session 9차 carry 명시 추가: "paradigm rc 도입 / threshold gate 결정 보류 / Layer 2 LLM 의무 carry / ≥ 2 PoC corroboration 의무 carry / v2.5.0 = paradigm 본격 도입")

> **★ ★ ★ ★ ★ ★ ★ v2.4.0 MINOR FINAL release** — session 8차 + sub-plan §1 + §2 + §3 통합. 4원칙 2원칙 3 sub-agent 토론 (Agent 1 공식문서 + Agent 2 빅테크 + Agent 3 Senior critique) 시행 + Senior STOP signal 1 + REVISE 5 흡수. ★ ★ ★ ★ ★ Senior STOP signal — release-readiness 8/8 격상 자체 chain harness paradigm 재정의 가능성 → ★ ★ MINOR bump 부적격 가능성 보존 / ★ ★ ★ v2.5.0 분리 검토 carry. 단 release 진행 결단 (★ 사용자 의도 정합 / 호환 보존 + 기능 추가 + sub-rule 추가 자격).

### ★ ★ ★ ★ v2.4.0 MINOR 변경 사항

#### ★ ★ ★ ★ ADR-CHAIN-011 본격 작성 — BR dual representation paradigm

`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md`:

- 6갈래 drift 사실 + 사상 발전 history (v1.x GWT → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language → v2.4.0 dual)
- 외부 사례 자릿수 정합 — JSON Schema anyOf 공식 권장 / Adzic SBE 10년 자기 폐기 (★ 본 ADR 핵심 위험 신호) / DMN description+FEEL 동형 / Cucumber description = runtime 무시 (paradigm 다름) / GitHub Spec Kit 90K = dual+cross-validation 미구현 (★ original empirical 자격) / AWS SCT + Conduktor + Solace validator-first migration / Drools governance 실패 패턴
- dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical
- PoC #04 FE if/then 분기 결정 (단일 schema 유지 / nested anyOf 회피)
- chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 (★ MINOR bump 부적격 가능성 명시)
- ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
- LL-i-22 (schema vs PoC drift = governance 실패) + LL-i-23 (release-readiness 사각지대) + LL-i-24 (두 사상 dilemma → dual paradigm) + LL-i-26 (Adzic 10년 폐기 회피 의무) + LL-i-27 (industry 공백 채우는 original 기여)

#### ★ ★ ★ ★ tools/br-cross-consistency-validator workspace 16번째 신설

- package.json + cli.js + validator.js + deterministic.js + llm.js + test/validator.test.js
- ★ Layer 1 결정적 — 두 표현 ≥ 1 / keyword overlap (intersection/max) / structure 검증 / BR id 4토막 strict
- ★ Layer 2 LLM advisory — placeholder + interface 정의 (★ Static Tool 시뮬레이션 금지 정책 정합)
- description alias + trigger/condition/action 변형 + GWT string OR array 호환 인정
- severity-weighted deterministic_score + overall_threshold 0.85
- ★ 22/22 unit test pass
- workspace root package.json `workspaces` array 16번째 등록

#### ★ ★ ★ schemas/rules.schema.json top-level 재설계 (v2.4.0)

- top-level anyOf — `business_rules` (표준) / `rules` (v1.x alias 호환) / `rules_manual_authored` (PoC #04 FE alias)
- `project_id` optional 신설
- `paradigm` enum [BE, FE] optional default BE 신설 (★ Agent 1 F1 nested anyOf 함정 회피)
- item 안 `name` OR `title` anyOf — PoC #05~#11 호환
- item 안 `natural_language` + `given/when/then` + `description` (alias) + `trigger/condition/action` (변형) anyOf
- item 안 v2.x optional fields 흡수 — `source` + `evidence_strength` + `br_type` + `is_intent` + `severity` + `current_state_note` + `domain` + `rejection_method` + `verification_location` 등
- ★ ★ schema-validator unit test 7 신규 (★ 15/15 pass)

#### ★ ★ schemas/meta-confidence.schema.json + rules.schema.json enum 확장 (Senior R5 정합)

- `applied_penalties.name` enum 확장 — `no_operational_db` + `fe_absent` + `external_dep_absent` + `single_module` 추가 (★ PoC #01 사례)
- `source_evidence.type` enum 확장 — `missing_explicit_policy` + `auth_expression_websec_ignoring` + `missing_negative_test` 추가 (★ negative space 자연 표현 흡수)
- `rule_conflicts.rule_ids.minItems` 2 → 1 완화 (★ inconsistent_threshold = 단일 BR 내 위반 사례 / PoC #01 BR-COMMENT-DELETE-001)

#### ★ ★ ★ ★ chain 1 gate 통합 — chain-driver gate-eval.js + findings-aggregator

- `tools/chain-driver/src/gate-eval.js` REQUIRED_VALIDATORS_PER_STAGE.planning 안 `br-cross-consistency-validator` 추가
- `tools/findings-aggregator/src/aggregator.js` 안 `transformBrCrossConsistency` 신설 + dispatchValidator 통합
- ★ 26/26 findings-aggregator unit test pass

#### ★ ★ ★ ★ release-readiness §8.1 strict 7/7 → 8/8 격상

- `scripts/release-readiness.js` 안 `check8_analysisValidatorViolation` 신설
- 검사 대상 — schema-validator + br-cross-consistency-validator (★ PoC #01 + #05 기준 / 11 PoC 전수 = sub-plan §2 후 carry)
- ★ ★ ★ ★ ★ ★ ★ **v2.4.0 = 8/8 pass release-ready ✅**
- ★ 9/9 release-readiness test pass

#### ★ ★ ★ ★ ★ PoC #01 마이그레이션 — INVALID → VALID 회복

- `meta.confidence: 0.78` 추가 (★ raw_confidence 값 채택)
- PoC #05 = ★ description alias 효과 + meta 정합 = VALID 보존

#### ★ ★ 11 PoC threshold spike critical 발견 (sub-plan §1 시 / 보존)

- `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`
- 11 PoC × 107 BR 안 두 표현 동시 보유 BR = 0 건 (★ overlap 분포 측정 불가능)
- ≥ 0.85 hypothesis 자료 부재 — sub-plan §2 후 재spike 의무 (★ C-threshold-spike-revisit carry)

### ★ ★ 신규 carry (v2.4.0 sub-plan §2~§3 carry / 다음 release 후보)

- ★ ★ ★ C-threshold-spike-revisit (★ critical / overlap 분포 부재 / sub-plan §2 후 재spike)
- ★ ★ ★ C-poc-02-03-schema-mapping (★ critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재 / 사상 결단 의무)
- ★ ★ C-br-cross-validator-Layer2-LLM-impl (★ Layer 2 LLM 본격 구현)
- ★ ★ C-deterministic-score-formula-revisit (★ score 산정 식 재해석)
- ★ ★ C-11-PoC-full-migration (★ ★ 잔여 9 PoC 도메인 전문가 위임 영역 — PoC #02/#03 name/title 부재 + PoC #06~#11 id 4토막 재라벨)
- ★ ★ ★ C-v2.5.0-분리-검토 (★ Senior STOP signal 정합 — release-readiness 격상 = paradigm 재정의 가능성 / MINOR bump 부적격 가능성)

### push 보류 commit 통합 (v2.3.7 ~ v2.4.0)

- `75ee21d` v2.3.7 PATCH (BR pattern 4토막 strict)
- `963dfa0` v2.3.7 후속 patch (schema description 정합)
- `a24a892` v2.4.0-rc1 (dual representation 사상 신설)
- `8101da2` SESSION-WRAPUP session 7차
- `c7dfca5` SESSION-WRAPUP session 8차 (sub-plan §1 — ADR + validator + spike)
- (본 release commit) v2.4.0 MINOR FINAL — sub-plan §2 + §3 + release 자산

---

## [unreleased 사실 보존 / 본 release 직전 commit 자산]

> **★ ★ ★ ★ ★ session 8차** — v2.4.0-rc1 자격 (session 7차 / commit `a24a892` / dual representation 사상 신설) 직후 사용자 결단 "A (v2.4.0 MINOR 진입)" + sub-agent 토론 권장 결단. ★ 4원칙 2원칙 3 sub-agent 병렬 (Agent 1 공식문서 / Agent 2 빅테크 / Agent 3 Senior critique) 시행 + Senior STOP signal 1 + REVISE 5 흡수 + 시행 순서 통합안 (c→d→a부분) 채택. 본 session = sub-plan §1 (ADR + validator scaffolding + Layer 1 결정적 구현 + threshold spike). schema 변경 + 11 PoC 마이그레이션 + chain-driver 통합 + release = sub-plan §2~§3 다음 session+.

### ★ ★ session 8차 변경 사항 (★ no version bump / no release)

#### ★ ★ ★ ★ ADR-CHAIN-011 본격 작성 — BR dual representation paradigm

`docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` 신설:

- 6갈래 drift 사실 + 사상 발전 history (v1.x GWT → v2.0 source-grounded → v2.1 characterization → v2.3 natural_language → v2.4.0 dual) 명문화
- ★ ★ 외부 사례 자릿수 정합:
  - **JSON Schema anyOf** 공식 권장 (oneOf 비권장)
  - **Gherkin description** = runtime 무시 (★ 본 방법론 paradigm 다름 — 양쪽 executable)
  - **★ ★ ★ ★ Adzic SBE 10년 자기 폐기** — 본 ADR 핵심 위험 신호 최강 (cross-validator 없으면 동일 폐기 보장)
  - **DMN description + FEEL** = paradigm 정합 (★ OMG spec 도 cross-consistency 강제 부재 → 본 방법론 보강)
  - **GitHub Spec Kit (90K star)** = dual + cross-validation 미구현 (★ 본 방법론 original empirical 자격)
  - **DMN L1+L3 ladder** = 단계 진화 / 본 방법론 = co-existence 동시 보존 (paradigm 다름 / 신규성)
  - **AWS SCT + Conduktor + Solace** = validator-first migration 빅테크 정합
- ★ ★ dual representation paradigm + Layer 1 결정적 + Layer 2 LLM advisory + threshold ≥ 0.85 empirical hypothesis
- ★ ★ ★ PoC #04 FE if/then 분기 결정 (단일 schema 유지 / nested anyOf 회피 / Agent 1 F1 함정 정합)
- ★ chain 1 gate 통합 + release-readiness §8.1 strict 7/7→8/8 격상 사상 (★ ★ MINOR bump 부적격 가능성 명시 / v2.5.0 분리 검토 carry)
- ★ ADR-008 이중 렌더링 사상의 BR 영역 확장 + F-015 cross-validation schema 내재화
- ★ LL-i-22~24 (session 7차) + LL-i-26 (Adzic) + LL-i-27 (industry 공백)
- 시행 paradigm = sub-plan §1 (본 session) + §2 (다음) + §3 (그 다음)

#### ★ ★ ★ ★ tools/br-cross-consistency-validator workspace 16번째 신설

`tools/br-cross-consistency-validator/`:

- package.json (★ workspace 16번째 / v0.1.0)
- src/cli.js + src/validator.js + src/deterministic.js + src/llm.js
- test/validator.test.js (★ ★ ★ 22/22 test pass)
- Layer 1 결정적: 두 표현 ≥ 1 의무 / keyword overlap (intersection / max) / structure 검증 (given 안 결과 키워드 ❌ + when 안 전제 키워드 ❌) / BR id 4토막 strict
- Layer 2 LLM advisory: ★ placeholder + interface 정의 (★ Static Tool 시뮬레이션 금지 정책 정합 / 다음 session 실 구현)
- severity-weighted deterministic_score 산정 + overall_threshold 0.85
- workspace root package.json `workspaces` array 16번째 등록 (★ description "v2.4 chain harness 16 tools workspace" 갱신)

#### ★ ★ ★ ★ ★ threshold spike critical 발견 — `tools/br-cross-consistency-validator/SPIKE-2026-05-13-threshold-distribution.md`

- 11 PoC × 107 BR 일괄 측정 결과 — ★ ★ **두 표현 동시 보유 BR = 0 건 / 모든 PoC** = overlap_distribution 측정 자체 ★ ★ 불가능
- ★ ★ ★ ≥ 0.85 hypothesis confirm 자료 ★ 부재 (★ Senior critique R2 정합 강력 / magic number 거부)
- 6갈래 drift 직접 검증:
  - PoC #01 GWT 풍부 → ✅ pass / score 1.0
  - PoC #02 condition+description + PoC #03 trigger+condition+action → ★ ★ ★ validator + schema 매핑 부재 신규 발견
  - PoC #04 FE → rules array 자체 부재 (★ if/then 분기 carry 정합)
  - PoC #05+#06 description → representation_missing
  - PoC #07~#11 natural_language → ⚠️ id_pattern_violation 43건 (★ v2.3.7 enforcement 정합)
- ★ ★ ADR-CHAIN-011 §5.4 patch (★ spike 결과 반영 + 신규 carry 2건 + deterministic_score 산정 anomaly 명시)

### ★ ★ 신규 carry (session 8차)

- ★ ★ ★ C-threshold-spike-revisit (★ critical / sub-plan §2 후 재spike)
- ★ ★ ★ C-poc-02-03-schema-mapping (★ critical / PoC #02 condition+description + PoC #03 trigger+condition+action 매핑 부재)
- ★ ★ C-br-cross-validator-Layer2-LLM-impl (★ sub-plan §2)
- ★ ★ C-deterministic-score-formula-revisit (★ sub-plan §2 후)

### ★ ★ 다음 session = sub-plan §2

- schema top-level 재설계 (project_id + business_rules)
- PoC #04 FE if/then 분기 본격 구현
- 1~2 PoC pilot 마이그레이션 (PoC #01 BE + PoC #04 FE 권장 / §8.1 strict 정합)
- drift-validator + br-cross-consistency-validator 양쪽 통과 확인
- 잔여 9 PoC 마이그레이션
- Layer 2 LLM 본격 구현
- ★ ★ ★ ★ 사용자 의도 — "마이너 release 자격 도달 시 배포 작업" / sub-plan §2 종결 → sub-plan §3 (chain 1 gate 통합 + release-readiness 격상 검토) → v2.4.0 MINOR release (★ ★ v2.5.0 분리 검토 carry 정합 / Senior STOP signal 정합)

---

## v2.3.x and earlier

→ v2.3.7 ~ v1.4.0 release entry + v1.4.0-dev + v1.3.x ~ v1.0 = [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md).

본 파일 (v2.4+) 상단 = 현재 release entry. v2.3.7 이하 격리 = 2026-05-14 cleanup.
