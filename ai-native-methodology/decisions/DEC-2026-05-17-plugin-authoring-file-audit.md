# DEC-2026-05-17-plugin-authoring-file-audit

- **상태**: 승인 (★ 사용자 "각 영역 별 파일별 품질 검증" → "진행" → "커밋 릴리즈" / corrective / v8.2.2 PATCH)
- **일자**: 2026-05-17 (★ session 26차 후속 / v8.2.2 PATCH)
- **결정자**: 윤주스 (TF Lead) — AskUserQuestion ×3 (범위=plugin-authoring 4영역 / 깊이=L1+L2+L3 / 처분=finding 기록+보고서 → 후속 "진행" 수정 cycle / F-PA-005·007 설계분기 2건 = (a)/(a))
- **관련**: ADR-PLUGIN-001 §7 patch v6 + §8 LL-plugin-04 / DEC-2026-05-17-base-prefix-documented-exception (직전 v8.2.1) / DEC-2026-05-17-plugin-authoring-docs-drift (v8.2.0 / §9 Layer i) / `methodology-spec/finding-system.md` Body Finding Ledger (F-PA-NNN 신설) / `examples/_audits/2026-05-17-plugin-authoring-file-level-audit.md` (disposable working artifact) / ADR-009 (no-simulation / F-015 dogfood) / `feedback_sub_agent_validation` (ground-truth-before-edit)

---

## 컨텍스트

v8.2.0 의 F-015 ×5 = **영역(area) 단위 digest 대조**. plugin-authoring-spec §7 = area-level 매트릭스("47 skills → S6 ✅"). 개별 파일 합부 + L2 의미(주장 ↔ 실제 코드/스키마 일치, description 트리거 현실성, 단일책임) + L3(§8.1 과적합·no-simulation) = **결정적 검증 부재 사각**. 사용자가 4영역 60 단위(47 SKILL.md + 9 agents + README + hooks.json + 2 manifests) 파일별 품질 감사를 요청.

## 결정

### §1. 감사 (4원칙 / no-simulation / F-015 dogfood)

- 10 sub-agent 배치 (skills 5 + agents 2 + hooks 1 + manifests 1 + XV 1) / area별 게이트 / verdict JSON 스키마 / L2-claim = **실 인용 파일 read 의무 (기억 ❌ / 못 찾으면 UNVERIFIED≠PASS)**.
- **결과: L1 구조 60/60 PASS** (frontmatter·body 길이·name charset(+`_base-*` 8 allowlist)·단일책임 위반 0). 결함 전부 **L2 인용 drift**. overall GREEN 39 / YELLOW 10 / RED 11.
- 근본원인 = v7.0.0(rules.json→business-rules.json)·v8.0.0(skill rename)·v5~6(BR schema 단일화) rename 후속 전파 누락.
- post-dedupe 고유 finding **10건** → `finding-system.md` **Body Finding Ledger `F-PA-NNN` namespace 신설** (PoC F-NNN 시퀀스와 분리 / 첫 body-level ledger). F-021 band = **5~15 "건강한 검증"** (명세 부실 ❌).
- XV 독립 재검증(1차 verdict 무열람 실파일 재read) = systemic finding 전부 확인 + 1차 오탐 1건(FP-1 `_base-apply-template`) 적발 + 신규 1건(F-PA-009 schema $id) 발견.

### §2. corrective sweep (사용자 "진행" / F-PA-005·007 = (a)/(a))

- **resolved 8** — F-PA-001(spec-compose:53 `integrate-7대-deliverables`→`spec-integrate-deliverables`) / F-PA-002(13 SKILL.md + **5 workflow SSOT doc** business-logic·characterization·formal-spec·quality·sql-inventory `rules.json`→`business-rules.json` / perl 3-step 안전치환 — `business-rules.json` 이중치환 방지) / F-PA-003(5 chain skill ADR-CHAIN-001 §3↔§6 정정 — 매핑표 L82-87 ground-truth: §3=no-sim·§6=revisit / test-type 분포는 ADR 무관 → test pyramid 재귀속) / F-PA-004(analysis-business-rules inline 예제 = 현 canonical `required:[business_rules]`+`additionalProperties:false` / step2 중간 DMN form 명시) / F-PA-005=(a)심화(react/vue_version 거부키 제거 → 실재 schema 필드 `modules[].framework:"react-19"/"vue-3"` redirect = 모순 제거 + drift-추적 의도 보존 + schema 무변경) / F-PA-006(analysis-architecture 산출물 2→1·domain-model 3→2) / F-PA-008(hooks-bridge buildBlockOutput `hookEventName` 추가 / default 'PreToolUse' + 호출부 실 event 전달 / property-level test 무회귀) / F-PA-009(business-rules.schema.json:3 `$id` rules→business-rules / grep 활성 $ref 의존 0 = 안전 / CHANGELOG v7.0.0 "$id 변경" 주장 실 미적용 보정).
- **wontfix 2** — F-PA-007=(a)wontfix-document (ground-truth: ADR-FE-005 본문 title="매개체 13"·L4 "12→13 갱신" → skill 인용 "13" **정확** / stale = ADR **파일명** "...12" / ADR 파일명 = immutable-history·skill-citation EXCLUDE → skill 무변경) / F-PA-010 (design-agent 의도된 placeholder / 규칙 무위반 / DEC C-4).
- **scope 확대 사실** — F-PA-002 sweep 이 XV 시점(13 skill+formal-spec.md)보다 넓은 5 workflow SSOT doc 포함 = drift 근원 동반 해소 ("표면 아닌 근원 차단").

### §3. P2′ 판정 = PATCH

산출물 파일명 rename ❌ / command-surface(skill name) 변경 ❌ / schema 계약(property·required·type) 변경 ❌. schema $id = identity metadata($ref 의존 0 / 검증 동작 무변 / v7.0.0 미완 보정) / chain-driver `hookEventName` = additive optional default. 전부 corrective doc + 무해 보정 → **PATCH (8.2.1→8.2.2)** (선례 v8.1.1·v8.2.1 corrective PATCH 동형).

---

## 회귀 검증 (STOP-3 hard gate — 전부 통과)

- 잔여 grep **0**: standalone `rules.json`(skill+workflow) / §6-no-sim·§3-test-type miscite / react·vue_version 의무 / integrate-7대
- `skill-citation-validator` **finding 0** (207 active doc) — ★ 자가 회귀 1건(ledger 내 죽은 `*.schema.json` 토큰이 schema-class 트립 / validator 가 ABSENCE_CTX 를 schema-class 에 미적용 확인 → 비리터럴 재기술로 즉시 교정 = 발견 즉시 차단)
- `release-readiness --target 8.2.2` **13/13 ready:true** (workspace test **395+ pass** / chain-driver hookEventName 변경 무회귀 / validators_violation·analysis_validator·skill_citation green)
- `version-check` 3-way **8.2.2** (plugin.json SSOT ↔ CHANGELOG.md top ↔ package.json) + CLAUDE.md marker(check #10) sync
- `drift-validator` 3-way **불변** (skill/agent/flow 무편집 = SKILL.md 본문·workflow doc·schema $id·tool code·decisions·CLAUDE.md 만 / chain harness §1 비범위 safety property)
- breaking **0** = PATCH

---

## Lessons Learned

- **LL-plugin-04** (ADR-PLUGIN-001 §8) — 결정적 validator 의 "green" 은 그 validator citation **class 정의 표면**에 한정 (skill-citation check #13 "0 stale" 인데 bare artifact 파일명 `rules.json` 은 schema/repo-path/ADR/DEC 4 class 미해당 → 13 skill+5 workflow doc stale 미탐). L2 의미 감사(LLM 판단 + 실파일 ground-truth)가 보완 axis. ★ ground-truth-before-edit 가 재작업 2건 차단 (FP-1 `_base-apply-template` 오탐 / F-PA-007 1차 오진 = skill 정확·ADR 파일명 stale — 맹신 시 정확한 인용 파괴) = LL-plugin-01·02 "verdict 수렴 ≠ 사실 / 1차 출처 독립 read 의무" 재확인. body finding = `finding-system.md` Body Finding Ledger F-PA(PoC F-NNN 분리) durable / disposable audit artifact 와 SSOT 분리 (LL-audit-04). corrective scope 가 SSOT 근원(workflow doc + schema $id)까지 확대 = "drift 는 표면 아닌 근원 차단".
- **LL-audit (감사 방법론 자산화)** — 영역 digest 대조(F-015 ×5)는 파일-level L2 의미 drift 를 못 본다. 파일별 감사 = 10 sub-agent 배치 + 균일 verdict 스키마 + systemic dedupe(F-021 과대계상 차단) + XV 독립 재검(F-015 dogfood)으로 sound. disposable working artifact + durable ledger 분리.

---

## 출처

- 사용자 요청 + 결단 (session 26차 후속 / "각 영역 별 파일별 품질 검증" → AskUserQuestion ×3 → "진행" → "커밋 릴리즈" / 2026-05-17)
- 감사 물증 — `examples/_audits/2026-05-17-plugin-authoring-file-level-audit.md` (파일별 매트릭스·XV·roll-up / disposable) + `methodology-spec/finding-system.md` Body Finding Ledger F-PA-001~010 (durable 처분 SSOT)
- ground-truth read — ADR-CHAIN-001 매핑표 L82-87 / business-rules.schema.json L3·L8 / ADR-FE-005 L1·L4 / impl-spec.schema.json 전수 / 활성 $ref grep
- 선례 — DEC-2026-05-17-base-prefix-documented-exception (v8.2.1 corrective PATCH) / DEC-2026-05-17-repo-wide-citation-scan (v8.1.1 corrective PATCH 동형) / ADR-009 no-simulation·F-015 / LL-audit-01~08 (plan 사전 기록)
