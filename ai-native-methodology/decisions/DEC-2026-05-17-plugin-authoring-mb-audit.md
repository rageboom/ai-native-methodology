# DEC-2026-05-17-plugin-authoring-mb-audit

- **상태**: 승인 (★ 사용자 "다른 영역은 뭐가 있나" → "1,2,3 다하자 순서대로" → "전체 corrective sweep + 릴리즈" / corrective / v8.2.3 PATCH)
- **일자**: 2026-05-17 (★ session 26차 후속 / v8.2.3 PATCH / DEC-2026-05-17-plugin-authoring-file-audit 직속 후속)
- **결정자**: 윤주스 (TF Lead) — AskUserQuestion ×3 (다음 감사 범위=1,2,3 전부 순서대로 / F-MB 처분=전체 corrective sweep+릴리즈)
- **관련**: ADR-PLUGIN-001 §7 patch v7 + §8 LL-plugin-05 / DEC-2026-05-17-plugin-authoring-file-audit (직전 v8.2.2 / F-PA) / `finding-system.md` Body Finding Ledger F-MB namespace / `examples/_audits/2026-05-17-plugin-authoring-file-level-audit.md` (disposable) / ADR-009 no-simulation·F-015 / `feedback_sub_agent_validation` ground-truth-before-edit

---

## 컨텍스트

F-PA cycle(plugin-authoring 4영역) 종결 후 사용자 "다른 영역은 뭐가 있나" → 비-plugin-authoring 저작 자산 분류 제시 → **"1,2,3 다하자 순서대로"** (Area E deliverables 25 + Area F schemas 39 + Area G tools 18 = 82 단위). F-PA-002 가 skills+5 workflow 만 sweep 한 미완 + Area E·F·G 의 파일별 L2 의미·claim·no-simulation 미검증 사각.

## 결정

### §1. 확장 감사 (F-PA 동형 paradigm / 8 sub-agent + ground-truth XV)

- **결과**: GREEN 74 / RED 8 (RED 전부 Area G tools README↔cli.js 문서 drift / 코드·테스트·no-simulation 정상). Area E·F 구조 거의 완벽 — **$id↔filename 0 불일치** (★ F-PA-009 = singleton 확인 / 나머지 38 정합) / $ref 0 broken / intent-classification addProps 부재 = 정당(scalar enum SSOT).
- post-dedupe **F-MB 9건** / F-021 band 5~15 "건강한 검증" / `finding-system.md` **Body Finding Ledger F-MB namespace 신설** (F-PA 와 분리 / methodology-body).
- 실 가치 = ① F-PA-002 미완(deliverables/schemas 에 rename drift 잔존) ② tools README 가 cli.js 권위와 drift (특히 F-MB-004 chain-driver consumer-facing) — 결정적 validator(skill-citation)가 README 산문·exit 표를 안 보는 사각.

### §2. corrective sweep (사용자 "전체 corrective sweep + 릴리즈")

- **resolved 8** — F-MB-001(활성 DOC 표면 안전 3-step sweep: flows json+mermaid + guides + methodology-spec docs + deliverables 6 + schemas 2 / ★ 5-business-rules.md "(구 rules.json)" 의도적 annotation 제외) / F-MB-002(form-validation-spec:130 + formal-spec:117,198 BR-id 3-seg→canonical 4-seg) / F-MB-003(legacy-spectrum:192·static-security-spec:90 property 키 `★ ` 제거 + :136 desc) / F-MB-004(chain-driver README exit 표 → cli.js 권위) / F-MB-005(chain-coverage·schema-validator·test-impl-pass README exit 표) / F-MB-006(decision-table·drift-validator·sql-inventory README 구현표면 보강) / F-MB-007(spec-test-link README finding-kind → validator.js emit underscore + chain.tc.no_ac_ref) / F-MB-008(test-impl-pass README src/adapters→src/runners).
- **deferred 1** — F-MB-009(tool src·test·scripts·PHASE/SPIKE/layer-2-results history 의 `rules.json` literal = test fixture·migration script·역사 측정기록 가능성 / blanket sweep 시 workspace 395+ release gate 자해 = v7.0.0 LL-i-55·57 hidden test literal class 정확 재현 → 파일별 forensic disposition 별건 revisit / history 부분 wontfix immutable).
- **★ ground-truth-before-edit 가 재작업 1건 추가 차단** — sub-agent 가 cross_links `to_artifact: rules` 를 F-MB-001 변종으로 과탐했으나 lifecycle-contract SSOT(:207 + 7대 table) = **logical 자산명 `rules` 불변** (파일만 v7.0.0 rename) → blanket 변경 시 6 deliverable logical id 파괴. 무변경 (3번째 위생 적발 / FP-1·F-PA-007 에 이은 LL-plugin-04 재확인).

### §3. P2′ 판정 = PATCH (F-MB-002/003 schema-touch 명시 분석)

F-MB-002(BR-id 패턴 tighten) + F-MB-003(property 키 rename) = 문자적 schema-contract touch (P2′ MAJOR 후보). 그러나 — (a) **0 PoC consumer** 결정적 검증 (form-validation-spec.json 2 PoC 에 3-seg br_id 0 / formal-spec.json PoC 0 / ★-key examples/ 0) (b) F-MB-002 = id-conventions v2.3.7 가 이미 강제하는 canonical 4-seg 로의 cross-ref **정렬** (신 제약 추가 아님 — 잠재 불일치 제거) (c) **schema-validator 전 11 PoC 0-regression** release-readiness 결정적 입증. → F-PA-009($id 정합 = $ref 의존 0 PATCH) 선례 동형 / v6.0.0(실 PoC 깨짐 MAJOR)와 결정적 차이 / semver inflation 회피. 나머지 6 = 순수 doc-corrective. **PATCH (8.2.2→8.2.3) / breaking 0**.

---

## 회귀 검증 (STOP-3 hard gate — 전부 통과)

- 잔여 grep 0: safe-tier `rules.json` / ★-prefixed property KEY / 3-seg BR pattern
- `skill-citation-validator` finding **0** (207 active doc / 자가트립 없음 = ledger 죽은 토큰 비리터럴 유지)
- `release-readiness --target 8.2.3` **13/13 ready:true** — ★ `analysis_validator_violation` = **schema-validator 전 11 PoC pass** (F-MB-002/003 schema 변경 PoC 회귀 0 결정적) + `workspace_test_pass` 395+ + `validators_violation`(drift-validator 3-way / flows json+mermaid 정합) + `claude_md_version_sync`
- `version-check` 3-way **8.2.3** (plugin.json SSOT ↔ CHANGELOG ↔ package.json) + CLAUDE.md marker(check #10)
- `drift-validator` 3-way 정합 — flows analysis/planning.phase-flow.json + analysis.phase-flow.mermaid 동반 sweep (json↔mermaid 짝 무결)
- breaking **0** = PATCH

---

## Lessons Learned

- **LL-plugin-05** (ADR-PLUGIN-001 §8) — corrective sweep 의 안전 경계 = **활성 DOC 표면 vs 실행 코드/test/history**. 동일 drift class(`rules.json`)라도 doc 은 안전 3-step sweep, **tool src·test fixture·migration script·dated history(PHASE/SPIKE/layer-2-results)** 는 blanket ❌ (intentional fixture / 구-format 대상 / immutable history 가능 → release gate 자해 = LL-i-55·57 정확 재현). F-MB-009 로 분리·forensic-defer 가 품질 1순위·재작업 최소화 정합. ground-truth-before-edit 가 3번째 재작업 차단(`to_artifact: rules`=logical 자산명 불변 / sub-agent verdict 맹신 ❌ / 1차 출처 SSOT 독립 read 의무 = LL-plugin-01·02·04 누적 강화). schema-contract touch(F-MB-002/003)의 P2′ 판정 = 0-consumer 결정적 검증 + canonical 정렬 + 전 PoC 0-regression 입증 시 PATCH (F-PA-009 선례 / v6.0.0 실-break MAJOR 와 분리) — "schema 변경 = 무조건 MAJOR" 기계적 적용이 아닌 실 consumer-impact + 결정적 입증 기반 등급.
- **LL-audit 확장** — 영역 digest 대조는 파일-level 못 봄(F-PA) + 결정적 validator green 은 그 validator class 표면 한정(F-PA LL-plugin-04) + corrective sweep 범위는 doc↔code/history 경계로 분기(F-MB LL-plugin-05). disposable working artifact(`examples/_audits/`) + durable Body Finding Ledger(F-PA/F-MB namespace) 분리 패턴 정착.

---

## 출처

- 사용자 요청 + 결단 (session 26차 후속 / "다른 영역" → "1,2,3 다하자 순서대로" → "전체 corrective sweep + 릴리즈" / 2026-05-17)
- 감사 물증 — `examples/_audits/2026-05-17-plugin-authoring-file-level-audit.md` (Area E/F/G 매트릭스·roll-up / disposable) + `methodology-spec/finding-system.md` Body Finding Ledger F-MB-001~009 (durable 처분 SSOT)
- ground-truth read — lifecycle-contract.md:207 + 7대 table (logical 자산명 `rules` 불변) / business-rules.schema.json:159 (canonical 4-seg) / chain-driver cli.js:16-21,62 / 각 tool cli.js header / PoC form-validation-spec.json ×2 / examples/ ★-key 0
- 선례 — DEC-2026-05-17-plugin-authoring-file-audit (v8.2.2 F-PA / 직속 선행) / F-PA-009 ($id 정합 PATCH) / v7.0.0 LL-i-55·57 (hidden test literal hard gate) / ADR-009 no-simulation·F-015
