# AI-Native 방법론 — 리팩토링 감사 리포트

> **생성**: 2026-05-30 (multi-agent audit workflow `methodology-tooling-audit`, 12 agent / 195 asset / 42 verified finding)
> **대상**: `ai-native-methodology/` (tools 24 / skills 57 / schemas 47 / agents + flows + hooks / scripts + release-readiness 22 / templates / plugin-charter R1~R21)
> **목적**: 별도 브랜치 리팩토링을 위한 정직(비대화) 감사 — "이 없는 기계(machinery without teeth)" + "선언↔실상 drift" 색출.
> **방법**: Inventory 6 병렬 → Gap finder 5 병렬(각 단정 전 재-grep 검증) → Synthesize. 근거는 실제 grep/read/node 재현만.
> **상태**: 브랜치 미생성(사용자 결단 "리포트만"). 착수 우선순위는 사용자가 본 문서를 보고 결정.

---

## 0. 메인 에이전트 독립 재검증 (가장 시급한 4개 주장)

리팩토링은 "실제로 쓰이는 것을 지우지 않는다"는 프로젝트 norm이 강하므로, headline 결론을 떠받치는 4개를 메인이 직접 재확인함:

| 검증 항목 | 결과 |
|---|---|
| `check21` 죽은 regex | `skills/_base-apply-template/SKILL.md:11` = `"인식 artifact list 27종"` — 숫자가 `artifact` **뒤** + 한글 `종`. regex `/(\d+)\s*artifact/i`는 숫자가 앞이어야 매치 → **NULL → 항상 skip 분기 `pass:true`** ✓ |
| `findings-aggregator` 호출처 | repo-wide 26 참조 전부 산문(CHANGELOG/guides/briefing/DEC) + 자기 dir + workspace 멤버십. `scripts/`·`flows/`·`hooks/`·`chain-driver/src/`·`ci/` 프로그래밍 호출 **0** ✓ |
| `planning-spec.json` 잔존 | `examples/**` = **0개** → rename sweep 완료 → 관련 `--planning`/fallback이 존재하지 않는 산출물을 지킴 ✓ |
| `scripts/baseline-data/` | **부재** → check22 baseline=0 vacuous pass ✓ |

---

## 1. 목적 대비 기능 지도 (Feature → Purpose map)

실제로 일을 하는(load-bearing) 자산만, 목적별로 묶음.

### (a) analysis 산출물 생성 — 16 emitter skill + 1 deterministic helper
- `analysis-*` 15 skill = 7대 BE + 8 FE + formal-spec/characterization/sql-inventory 산출물의 1:1 emitter. 각각 `analysis.phase-flow.json` phase에 등록(실 wiring).
- `analysis-quality-antipattern` = antipatterns.json + migration-cautions.md 최종 consolidator.
- `greenfield-bootstrap`(도구) = swagger-extract → openapi.yaml 결정적 elevation + legacy-only 산출물 N/A 생성. greenfield 분기에서 `analysis-greenfield-bootstrap` skill이 위임.

### (b) chain gate 결정성/검증 — 핵심 enforcement layer
- `chain-driver` = 유일하게 hooks.json에 wiring된 harness 코어. state.json CAS + gate trio + skill auto-invoke + revisit detector + `gate-eval.js`(런타임 gate 강제).
- gate validator(`gate-eval.js` `REQUIRED_VALIDATORS_PER_STAGE`로 프로그래밍 강제): `discovery-extraction-validator`(#1) / `chain-coverage-validator`(#2) / `plan-coverage-validator`(#3) / `spec-test-link-validator` + `test-impl-pass-validator`(#4 RED) / `test-impl-pass-validator` + `static-runner` + `traceability-matrix-builder`(#5 GREEN) + 전 stage `schema-validator`.
- `drift-validator` = SSOT 이중 렌더링(.mermaid↔.json) 등가 + phase-flow 산출물명 비교. 자체 CI(`drift-check.yml`) 보유 — 가장 강하게 wiring된 검증기.
- analysis-stage 검증기: `decision-table-validator`(DMN 5-check) / `characterization-coverage-validator` / `sql-inventory-validator` / `br-cross-consistency-validator`(Layer1 결정적). 모두 flow/skill 실 wiring.
- `spectral-runner` = 외부 Spectral CLI passthrough wrapper(OpenAPI lint). 자체 src 없음 — 외부 도구 가교.

### (c) traceability / dep-graph
- `traceability-matrix-builder` = UC→BHV→AC→TC→IMPL matrix + `artifact-graph.json` 합성기. gate #5 + release-readiness #6/#15/#16의 입력원.
- `graph-integrity-validator`(#15) + `code-pointer-validator`(#16) = artifact-graph 무결성/코드앵커. release-readiness 단일 소비자(실).
- `dep-graph-navigator` skill = chain-driver `navigate` CLI에 위임. user-invocable 유틸(실 소비자 존재).

### (d) input adapters
- `analysis-from-{prompt,swagger,plan-doc,figma}` + `analysis-input-orchestrate` = analysis baseline(1회) 입력 흡수.
- `discovery-from-{analysis-output,swagger,figma,nl-md}` + `discovery-decompose-use-cases` + `discovery-identify-business-intent` = chain-1 scope 진입 UC/intent 추출 → discovery-spec.json.
- 두 family는 채널이 겹치나 **timing+책임+산출물이 다름**(문서화된 의도적 분리 / §2 "keep" 참조) — 중복 아님.

### (e) self-validation / drift-guard
- `release-readiness.js` = 22-criterion 수동 release ceremony(**CI 미연동**).
- 실제 자동 CI gate = `version-check.js`(3-way 버전 sync) + `build-plugin.js`(stale-dist guard) + `drift-validator` test — `drift-check.yml`(push:main)에서 자동 실행.
- `skill-citation-validator`(#13) / `inflation-lint`(agent 지시 only, 경고 전용).

### (f) plugin packaging
- `build-plugin.js`(workspace→dist) / `preflight-check.js`(환경 probe) / `install-static-tools.sh`(SessionStart Tier-1 semgrep) — 모두 실존 + wiring 확인.

---

## 2. 불필요 (제거/병합/단순화 후보) — ranked

(severity, confidence) 내림차순. verified=true 또는 high-confidence만. **핵심: 불필요의 대부분이 `planning→discovery` rename(v11.0.0)의 코드/스키마 미완 cascade 잔재.**

| # | 자산 | 분류 | 근거 | 권고 | conf |
|---|------|------|------|------|------|
| 1 | `release-readiness.js check21_templateCountDrift` | **dead gate** | regex `/(\d+)\s*artifact/i`가 SKILL.md `'artifact list 27종'`(숫자 후위+한글 종)에 영구 미매치 → 항상 skip `pass:true`. node 재현 match=NULL. "template drift 차단" 게이트가 비기능인데 22/22에 green 계상. | **complete**(regex 교정 후 실 비교 복구) | high ✓ |
| 2 | `findings-aggregator`(도구 전체) | dead/redundant | scripts/·flows/·hooks/·chain-driver/src/·ci/ programmatic invoker 0. 모든 ref 산문. `gate-eval.js` `REQUIRED_VALIDATORS_PER_STAGE`를 중복 재구현. "mandatory 양심차단 auto-feeder" 선언과 달리 operator 수동 실행만. cli.js usage가 아직 stale `planning` stage 명명. | **investigate→merge**(chain-driver `next`가 직접 호출하게 통합 or deprecate) | high ✓ |
| 3 | charter §4.1 Stop-hook ITSM + §4.6 `itsm-ticket-emit` skill | redundant(vestigial) | R16/R17 v3.6.0 영구 scope-out(`재제안 ❌`)인데 §4.1 "Stop hook→ITSM 자동등록(R16/R17 연동)", §4.6 전체 subsection "skill itsm-ticket-emit 신설" 명령. `skills/itsm-ticket-emit/**` 미존재. hooks.json엔 Stop hook 없음. 실 대체=R20 ticket-sync. | **delete** | high |
| 4 | `--planning` flag(chain-coverage-validator/src/cli.js:14) | redundant(stale) | discovery-spec 입력의 **유일** flag명이 `--planning`(--discovery 부재). live skill이 `--planning discovery-spec.json` 전달. 내부 var `chain.planning`이 builder.js까지 전파. | **simplify**(`--discovery` 추가 + `--planning` alias화) | medium |
| 5 | `--planning` alias + `validatePlanningExtraction`(discovery-extraction-validator) | redundant(dead-target) | "deprecated / Phase4 sweep 후 제거" 주석. sweep 완료(planning-spec.json 0). 더 이상 없는 산출물을 지키는 alias. | **delete** | high ✓ |
| 6 | release-readiness `planning-spec.json` legacy fallback(84, 273행) | redundant(dead branch) | check1 OR절 + ANALYSIS_VALIDATOR_TARGETS 잔존. planning-spec.json 0 → vacuous OR / dead Set 원소. | **simplify** | medium ✓ |
| 7 | formal-spec-link-validator `CHAIN_ARTIFACT_BY_NAME`/`CHAIN_TARGETS`=`planning-spec.json` | redundant→복구필요 | chain-mode가 죽은 이름만 인식, `discovery-spec.json` 항목 부재 → 실 chain-1 산출물 silent skip. derivation 경로는 이미 `discovery_spec_path`(키만 누락). CHANGELOG/DEC가 "실효 영향≈0"으로 일축. | **complete**(artifact-name 키 교정) | medium |
| 8 | `dispatchValidator` case `'planning-extraction-validator'`(aggregator.js:177) | dead | 동일 transform 매핑 backward-compat이나 live caller 0. host 도구(findings-aggregator)도 invoker 부재. | **delete** | medium |
| 9 | `inflation-lint`(도구 전체) | self-referential | 자기 sub-agent 보고서의 ★남용/과대형용("본격 release 자격","영구 입증","gold standard") lint. 경고 전용/exit 0 고정/blocking 없음. 소비자=4 stage-agent .md 산문뿐. INFLATION_PHRASES=본 코드베이스 자체 자축 어휘. | **investigate**(가치 있으나 prod 산출물 무관 — keep-as-warning 명시 or drop) | high |
| 10 | charter 요구사항 개수 자기모순(21/19/18/17/16) | self-referential | "사용자 요구사항 단일 SSOT" 문서가 5개 숫자 혼재. 정작 charter 카운트 지키는 기준 없음(반면 SKILL.md용 check21은 존재하나 죽음). | **simplify**(카운트 단일화) | high |
| 11 | release-readiness 헤더 주석 `'13 자격'` | self-referential(doc drift) | 헤더는 1~13만 열거, main()은 check1~22 실행. v8.1.0 이후 미갱신. cosmetic. | **simplify** | high ✓ |
| 12 | `sql-inventory-extractor` bin alias | redundant(vestigial) | v8.7 rename 호환 bin. 구명 live invoker 0. 무해하나 ID 연속성 외 가치 없음. | **keep**(저비용) / 차기 정리 | high |
| 13 | `traceability-matrix-builder --planning` alias | redundant(harmless) | `--discovery` primary + 정상 fallback alias지만 지킬 planning-spec.json 0 + 내부 var 여전히 `planning`. 저가치 잔존. | **keep** | medium |

### 추가 조사 필요 (사용자 결단 종속)
- `check22_beTaskOpenapiRefRatchet` + `scripts/baseline-data/` — 현재 vacuous pass(§3 hole). "삭제 vs 완성"은 Phase-4 PoC sweep 의지에 종속.
- `release-readiness.js`가 CI 미연동인 채 22 기준 유지가 맞는지 — 수동 ceremony 유지 vs CI 승격 정책 결단.
- schema `ui-spec.schema.json` — 전용 emitter skill 없음(15 analysis 산출물 중 유일). 실 artifact 존재(poc-04/16) → orphan 아님, emitter-less. 정리 대상 아님.

---

## 3. 구멍 (gaps / holes) — ranked

placeholder를 complete로 위장 / broken ref / 양심 의존 강제 / gate 없는 stage 포함.

| # | 영역 | 구멍 | 근거 | 권고 | sev |
|---|------|------|------|------|-----|
| 1 | release gate 신뢰성 | **check21이 죽은 채 22/22 green 계상** + 카운트 자체도 이미 drift | regex NULL 재현. SKILL.md enum=27(chain '11') vs 실제 chain 13/grand 34. 두 drift가 죽은 regex 뒤에 은폐. | **complete**(regex 교정 + SKILL.md 카운트 실측 동기화) | high ✓ |
| 2 | release gate 진실성 | **22/22 headline 부분 hollow** | check21(dead) + check22(vacuous ratchet, baseline=0/be-task 2개 전부 ref 보유) 두 기준이 일 안 하고 green. 코드베이스 자체 문서화된 'self-referential corrective drift' 안티패턴과 합치. | **fix**(두 기준 실효화 or headline에서 분리 표기) | medium ✓ |
| 3 | analysis source-grounded 강제 | `analysis-extraction-validator`가 **양심(skill-instruction) 레벨만** | flows/·scripts/·gate-eval.js·ci/ grep 0. 오직 2 SKILL.md(from-figma/from-plan-doc). 쌍둥이 discovery-extraction-validator는 gate-eval+release-readiness+CI 전부 wiring → 비대칭 약함. | **complete**(analysis gate validators[] 또는 release-readiness 승격) | medium |
| 4 | BR 의미정합 강제 | `br-cross-consistency-validator` **Layer2가 런타임 silent skip** | `--llm-results` 입력 시만 시행, 부재 시 skipped. gate-eval.js가 discovery에 wiring하나 Layer2 발화는 operator가 먼저 sub-agent 돌려 저장해야 함=양심 의존.(release check9는 poc committed 결과 요구 → hollow window는 live chain run.) | **fix**(Layer2 미수행 시 hard-stop or 명시 WARN 승격) | medium |
| 5 | intent over-attribution 가드 | `intent_certainty` enum + prose marker `[관찰]/[결과]/[미검증]` **양심 의존** | validator.js: 부재 시 `severity:'low'` non-blocking WARN. SKILL.md:59 "prose marker는 검증 불가". schema는 present 시 enum만 검사(presence 미강제). | **investigate**(구조화 강제 vs WARN 유지 결단) | medium |
| 6 | check22 ratchet | `scripts/baseline-data/be-task-openapi-ref-baseline.json` **디렉토리 미존재** → baseline=0 vacuous pass | `ls scripts/baseline-data` 없음. PoC be-task 2개 전부 ref 보유 → 영구 통과. 미래(Phase-4)용 기계. | **fix**(baseline 생성 후 의미부여 or 명시 skip 처리) | medium ✓ |
| 7 | design stage | flow/template/gate 부재 — **placeholder 집합** | `flows/design.phase-flow.json` 미존재. `templates/design/`=README만. `agents/design-agent.md`=`skills:[]`+"dispatch 무의미". check21 TEMPLATE_DIRS는 여전히 'design' 순회(0 기여). | **keep**(의도적 v12.x carry — orphan 아님 / doc에 "미구현" 명확화) | low |
| 8 | S2(주 타깃) test gate | `s2_outcome_mismatch` = **설계상 양심 의존(rank-2 WARN)** | gate-eval.js "corroboration 0 동안 WARN / go-with-warnings 허용". 주 시나리오 S2 gate가 아직 hard-block 안 함. 지원 파일 s2-outcome-check.js + test가 **uncommitted**(working tree only). | **keep**(corroboration 누적 후 승격 예정 — commit 누락 해소 필요) | low |
| 9 | analysis BR-id strict | analysis 방출 시점엔 **skill-instruction only** | SKILL.md:43 regex 지시뿐, 실 강제는 chain 경계(schema/chain-coverage)에서만. malformed BR-id는 downstream에서만 차단. | **keep**(chain 경계 강제로 실효 차단 / 정직 표기만) | low |

---

## 4. 자기참조 비대화 평가

22 release-readiness 기준 중 **사용자 산출물 품질 검증 ≈ 12개**, **방법론 자기 문서/매니페스트 정합 ≈ 9개**. 후자가 "내부 정돈을 product 품질인 양 22/22 headline에 합산". `feedback_self_referential_corrective_drift.md` 안티패턴과 정확히 합치.

| 기준 | 무엇을 지키나 | 판정 | 이유 |
|------|--------------|------|------|
| check21 template-count-drift | SKILL.md 카운트 ↔ templates/ 파일 수 | **fix(현재 drop 가치)** | 죽은 regex. 고치거나, 못 고치면 22에서 빼라(현재 green이 거짓). |
| check22 be-task-openapi-ratchet | PoC task-plan ref 누락 ratchet | **simplify/defer** | baseline 부재 vacuous. Phase-4 전까지 "deferred(미발화)" 표기, headline 제외. |
| check10 claude-md-version-sync | CLAUDE.md ↔ plugin.json 버전 | **keep** | content-aware, 저비용, 실제 stale 사고(LL-session-20) 차단 이력. |
| check12 authoring-spec-staleness | 외부 docs pin ≤60d + digest | **keep** | content 검증(presence 아님), 외부 docs 변화 추적 — 정당. |
| check13 skill-citation-integrity | SKILL.md 인용 dead-link | **keep** | doc 재구조화 후 dead-link 실차단. |
| check5 adr-registry | ADR-CHAIN 상태/결정 섹션 | **keep** | content-aware('승인'+섹션 grep), file-presence 아님. |
| check17 marketplace-stage-sync | marketplace.json 설명 stage명 | **simplify** | 순수 산문 동기화 — cosmetic 묶음 강등 가능. |
| check18 gate-enum-consistency | stage-graph.js ↔ state.schema.json | **keep** | "chain N = gate #N" 불변식 cross-check — 런타임 영향. |
| check19 legacy-'4단계'-prose-absent | 사용자향 산문 옛 표현 부재 | **simplify/drop** | 순수 doc-hygiene. 1회 청소 후 회귀 낮음 — 상시 gate 가치 낮음. |
| check20 plan-gate-operational | sdlc-flow plan gate=#3 + validator≥1 | **keep** | flow SSOT wiring 불변식 — gate 작동 보장 직결. |
| `inflation-lint`(도구) | 자기 보고서 ★/과대형용 | **drop-or-warn-only** | prod 산출물 무관. 유지 시 "warning-only, non-product" 명시. |

> `drift-validator`는 자기참조 **아님** — SSOT 이중 렌더링 등가는 산출물 신뢰 토대 + 자체 CI 보유. keep.

**핵심 권고**: 22 headline을 **"product 12 + internal 9"로 분리 표기**하면 self-celebration 인플레가 즉시 가시화되고, check21/22의 거짓 green이 headline을 오염시키지 않음.

---

## 5. 리팩토링 실행 순서 (브랜치용 / 사용자 우선순위 결정 후)

**안전 삭제 → 병합 → 구멍 메우기** 순. 각 삭제 전 confirm grep 명시.

### Phase A — 안전 삭제 (dead, 확인 후)
1. `dispatchValidator` case `'planning-extraction-validator'` 삭제(aggregator.js:177).
   - confirm: `Grep "planning-extraction-validator" path:tools,scripts,flows,hooks,ci` → src wiring 0(산문만).
2. discovery-extraction-validator `--planning` alias + `validatePlanningExtraction` export 삭제.
   - confirm: `find examples -name planning-spec.json`=0(확인됨) + caller 0.
3. charter §4.1 ITSM 줄 + §4.6 subsection 삭제(R16/R17 vestigial).
   - confirm: `Grep "itsm-ticket-emit"` → charter + 1 DEC뿐. 삭제 후 §1 카운트도 단일화(C-10과 묶음).

### Phase B — 병합/단순화
4. `findings-aggregator` 결단: chain-driver `next`가 직접 호출하게 통합(권장 — 선언된 "auto-feeder" 실현) or deprecate.
   - 위험: `REQUIRED_VALIDATORS_PER_STAGE` 중복 제거 시 두 표 어긋나면 불일치. 통합 시 단일 SSOT로.
5. `--planning` → `--discovery` 정규화(chain-coverage + traceability + builder.js 내부 var).
   - `--discovery` primary 추가 + `--planning` alias 강등. live skill 호출(`spec-compose-behavior-spec/SKILL.md:71`)도 갱신.
6. formal-spec-link-validator artifact-name 키 교정: `planning-spec.json`→`discovery-spec.json`(check-links.js:176 + cli.js:30).
7. release-readiness `planning-spec.json` fallback 제거(84/273행) + 헤더 `'13 자격'`→`'22 자격'`.
8. `sql-inventory-extractor` bin alias 제거(선택, 저우선).

### Phase C — 구멍 메우기 (complete / fix)
9. **check21 regex 교정**(`'artifact list (\d+)종'` 등 실제 표기 매칭) **+ SKILL.md 카운트 실측 동기화**(chain 13, grand 34). 카운팅 기준(.json/.md only vs 전 확장자)도 코드/문서 일치.
   - **위험**: 교정 즉시 죽어있던 게이트가 살아나 현존 카운트 drift(27 vs 34)를 fail로 보고 → release gate가 처음 빨개질 수 있음. **카운트 동기화를 같은 PR에 묶을 것.**
10. charter 요구사항 카운트 단일화(§1/§6/요약 동일 숫자).
11. analysis-extraction-validator 승격: analysis gate validators[] 또는 release-readiness 추가(discovery 쌍둥이 대칭화).
12. br-cross-consistency Layer2 / s2_outcome_mismatch / intent_certainty: "양심 의존 → 명시 WARN or hard-stop" 정책 결단. 결단 전엔 정직 표기 유지.
13. check22: baseline-data 생성 후 의미부여 or Phase-4 전까지 headline "deferred" 분리.
14. release-readiness headline 분리 표기: `product N/12 + internal M/9`.

### 워크스페이스 / release gate 깨짐 위험 노트
- **#9(check21 교정)**: 워크스페이스 test 무영향이나 `release:check` 자체가 처음 fail날 수 있음 — 카운트 동기화 동반 필수.
- **#4(findings-aggregator)**: 자체 test + 통합 시 chain-driver test 영향 — `npm test --workspaces` 재확인.
- **#5(flag rename)**: skill SKILL.md 호출문 갱신 누락 시 chain run 깨짐. live emitter skill 동반 수정 + skill-citation-validator(#13) 재확인.
- **버전 drift**: `package.json`=11.11.0인데 CLAUDE.md/CHANGELOG=11.10.1 — `version-check.js`가 다음 release에서 잡을 사항(리팩토링과 별개 인지).
- **working tree 미커밋**(다른 CLI 작업): `test-spec.schema.json`·`gate-eval.js`·`scenario.test.js`(M) + `s2-outcome-check.js/.test.js`(??) — 브랜치 시작 전 commit/stash 정리 필요.

---

## Bottom line (정직)

24 도구·57 skill·47 schema·5 gate는 **대부분(≈80~85%) load-bearing**. 단:
- **cruft ≈10%** — 절대다수가 `planning→discovery` rename 미완 잔재(6종) + vestigial R16/R17 spec + self-referential lint
- **hole ≈5~8%** — 가장 시급: **"이 없는 게이트가 green으로 계상되는" check21 + 22/22 headline 진실성**

사용자 직감("필요없거나 구멍")은 정확. "필요없음"은 기능 과잉이 아니라 *rename 미완 + 자기 문서 정합용 기계*에 몰려 있고, "구멍"은 *양심 의존(코드 아닌 지시로만 강제)* 지점들임.

---

## 부록 — 본 브랜치 실행 기록 (refactor/tooling-audit-cleanup)

> 2026-05-31 / base main v11.14.0. 검증 = 실제 `npm test --workspaces` 879/879 + `release-readiness` 22/22 + `test:release` 14/14 (no-simulation).

| Phase | 커밋 | 내용 |
|---|---|---|
| A+B | `9b3dec9` | planning→discovery rename 잔재 정리 (alias/dispatch/flag 정규화) + R16/R17 vestigial §4.1/§4.6 제거(retarget) — 18 files |
| C | `a3776f4` | check21 dead-gate 복구(machine marker + .template.* 전수 + fail-closed) + check22 baseline broken-ref 해소 + self-test 17→22(5 fail→14 pass) + charter 카운트 21/19 단일화 — 5 files |
| B4 | `ac7f12d` | findings-aggregator = **① 주장 교정** (도구 유지 / "mandatory 자동 auto-feeder" 거짓 선언 정정 → "선택적 operator 보조") — cli.js/aggregator.js header + guides + tools/README |
| F-SOFTGATE | `04a6a0b` | **F-AUDIT-SOFTGATE-001(=C-13) fail-closed — Option C**: findings 미제출 시 `next` block(reason=findings_unverified, rank 2) + `--user-decision go` 명시 ack(intervention-log actor:user) escape. gate-eval 순수성 보존(sentinel in, reason out). chain-driver cli.js+gate-eval.js + 5 test (255/255) |
| CI-GATE | (본 커밋) | **release-readiness CI 미연동 해소 — git pre-push hook** (사내 GitHub Actions 부재 / 사용자 결정 G): `scripts/githooks/pre-push`(npm run test:release) + `setup-git-hooks.js`(core.hooksPath 설정). git push 시 self-test+게이트+workspace(879) 자동 강제. e2e smoke exit 0. 한계: 클론마다 1회 install / `--no-verify` 우회 / 터미널 push 포함(Claude Code PreToolUse hook 무관 / §4.1 "빠를 것" 무관) |

### 신규 발견 (audit 후속)

- **F-AUDIT-SOFTGATE-001 — `chain-driver next` 의 finding-count 게이트가 soft (양심 의존)**: `loadFindings`(chain-driver/src/cli.js:188) 가 `--findings` 미입력 시 `{critical:0,...}` 반환 → finding-count 차원이 0 findings 로 무조건 통과. 즉 finding 기반 차단은 "operator 가 findings 를 넣어줄 때만" 작동. 실 enforcement 는 gate-eval(coverage/state) + CI(각 validator 직접 실행)에 의존. findings-aggregator 가 거의 안 쓰이는(11 PoC 중 1) 근본 원인. ✅ **RESOLVED (본 브랜치 / Option C — 3-agent fail-closed 수렴 + Senior minimal-diff)**: `loadFindings` 가 미제출 시 `__findings_absent` sentinel 반환 → `evaluateGate` 가 `findings_unverified` block(rank 2). 통과 = 진짜 `--findings` 공급 OR `--user-decision go` 명시 ack(intervention-log actor:user 기록). silent soft-pass 제거 / gate-eval 순수성 보존 / 기존 테스트 0 깨짐 + 5 신규 test. **C-13**(2026-05-07 PoC-06 PROGRESS:252 carry) 동시 해소.

### 잔여 (deferred / 사용자 판단)

- CHANGELOG 의 phantom alias 주장("transformPlanningExtraction 보존") — 역사 기록이라 미수정 / 향후 release writeup 시 정정.
- `tools/README.md` gate 번호 표기 (spec-test-link "gate #3" 등) v10 재번호 미반영 의심 — 별도 doc-sync.
- 라인엔딩(CRLF/LF) 노이즈 ~20 파일 — repo `.gitattributes` 정규화 별건.
