# 현재 상태 (Live Snapshot)

> 휘발성 진행 상태. 영속 컨텍스트는 [`/CLAUDE.md`](../../CLAUDE.md), 결정 이력은 [INDEX.md](INDEX.md).
> 본 파일은 phase / sprint 종결 시 갱신.

**기준일**: 2026-05-17 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 25차 (현 session) — v4.1.0 MINOR (Phase 2 ⑤) + v4.1.1 PATCH (묶음 Q ④ severity cross-stage mapping) — 2 release** — ★ v4.1.1 추가 = 사용자 "1"(묶음 Q) → risk 비균등 실측 (① 2 PoC / ② poc-06 7 BR 합성 / ④ additive / ⑦ 265 file) → "④만 먼저 (additive)" 결단 → `methodology-spec/severity-cross-stage-mapping.md` 신설 (rules 5종↔ratchet 4종↔MoSCoW 3종 단일 SSOT / 사용자 매핑 3결단 high→must·info→nice·신규 doc SSOT) + rules.schema·acceptance-criteria.schema $comment cross-ref (ajv inert) + glossary pointer + DEC-2026-05-17-severity-cross-stage-mapping + CHANGELOG v4.1.1 + plugin.json 4.1.0→4.1.1. ①②⑦ = breaking → 별도 session+ cooling-off carry. 회귀 0 (workspace 381/381 / release-readiness 11/11 / schema 기능·데이터 변경 ❌). ───── [v4.1.0] session 25차 진입 시 STATUS drift 청산 (session 20→24 stale / LL-i-46+47 ADR §9 자산화 / ADR §11 후속 list sync carry 등재) → 사용자 "Phase 2 ⑤ 진입". 4원칙 — plan + 3-에이전트 research (Senior CONCUR+조건2+STOP-1 / official-docs if/then VERIFIED / industry-case SARIF·Semgrep·OPA·Spectral 분리 우세 + intent-vs-bug 강제 보존 precedent 부재=novelty) + 사용자 결단 4건 추천안 묶음 + 시행. **결단** — #1 정제된 옵션 C (heavy 실행데이터 layer-2-results/ 분리=산업표준 + BR 안 slim provenance-tagged marker=Semgrep metadata: 패턴) / #2 schema if/then 강제 (★ 코드 착수 전 실측 both=0 → 전 PoC vacuous = 회귀 풀이 0 수학 보장 / Senior 조건2 해소) / #3 v4.1.0 MINOR / #4 ⑤ 단독. **시행** — rules.schema.json 2변경 (cross_consistency_check slim 객체 + is_intent⇔classification 양방향 동치 if/then 2블록) + test 17 신설 (★ schema-validator functional 11 = if/then 모순 실제 거부 입증 / drift-validator 구조 6) + ADR §5.9 patch v12 + §9 LL-i-51 + DEC-2026-05-17-phase-2-5-cross-consistency-check + INDEX + CHANGELOG v4.1.0 + plugin.json 4.0.1→4.1.0 + CLAUDE.md + deliverables 5 §4.2. **회귀** — workspace 364→**381/381 pass** (신규 17 / 0 fail) + release-readiness **11/11 release-ready** + chain harness validated 본질 보존 / 0 회귀. STOP-1 advisory 해소 (verdict consumer unknown-fatal 부재).

**기준일 보존**: 2026-05-17 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 24차 — 묶음 P prereq 전 chain 종결 (★ no version bump / carry only / push)** — 사용자 결단 "묶음 P 해줘" → Sprint 1~3 자율 시행 + gate 결단 3건. **Sprint 1** (schema cleanup / 10 sub-sprint) = 전체 11 PoC rules.json schema VALID + release-readiness `analysis_validator_violation` criterion PoC #01+#05 한정 → ★ 전체 11 PoC auto-discover 전수 격상 (Sprint 1-J = pre-pre-prereq 사각지대 PoC #03 76 errors 계획 외 발견 즉시 보정 / LL-i-46). **Sprint 2** (dual representation / 4 PoC 30 BR) = #02·#04 GWT→NL + #08·#10 NL→GWT additive. **Sprint 3** (Layer 2 LLM / 4 PoC 8 dispatch) = Sonnet 4.6 phase-c + Haiku 4.5 blind retrospect → ★ ★ ★ Layer 2 corroboration **7 PoC 도달** (poc-01/02/03/04/05/08/10 / Phase 2 prereq ≥7 충족). ★ ★ ★ **핵심 발견 = PoC #08 echo-chamber drift** (Sprint 2 GWT 합성 Sonnet 이 is_likely_bug 무시 → PASSWD-006 보안버그 + ORDQRY-005 N+1 정상규칙 정규화 / 동일모델 Sonnet Layer 2 미검출 0.93·0.90 / 독립 Haiku blind 검출 0.55·0.58 = industry-first + Adzic SBE 함정 회피 자격 본격 실측 / LL-i-47 / 처분 = rules.json 변경 ❌ / C-poc08-drift carry). ★ ★ Phase 2 ⑤ 사용자 결단 3건 (#1 보류·별도 session / #2 ★ 확정 제약 "분류 보존 강제 포함" 재논의 ❌ / #3 push carry only 18 commit / version bump ❌). DEC-2026-05-17-묶음-P-prereq-종결-phase2-5-보류 + INDEX 등재 + LL-i-46+47 자산화. release-readiness **11/11** + workspace **364/364** + chain harness validated 본질 보존 / 0 회귀.

**기준일 보존**: 2026-05-17 (★ ★ ★ **session 23차 — Sprint 1-A 시범 진입 (★ no release / carry only)** — 사용자 STRONG-STOP 점검 발화 "drift 없이 가고 있는가? 최초 목적?" 흡수 → 회고 후 "continue — Sprint 1-A" 결단. PoC #06 7 BR ID 4토막 strict 마이그레이션 (BR-EXCHANGE-NNN → BR-EXCHANGE-{KRW/COMPLETE/DECIMAL/COMMA/ANNUAL/GUBUN/CALCFN}-NNN / sub-domain 토막 Sonnet 4.6 sub-agent 자동 합성) + cross-ref 13 file 일괄 갱신 (old ID 잔존 0) + PoC #06 schema-validator INVALID 7 → VALID. ★ ★ ★ ★ ★ 사용자 의제 본격 재정의 — 본 plugin 본격 정체성 = ★ paradigm 자체 입증 (industry-first claim 강화) / 본격 사용자 부재·사용 시점 멀음 / 본격 의제 = Layer 2 LLM corroboration ≥ 7 PoC 도달 (Adzic SBE 함정 회피 자격) / "P 먼저" 결단. commit 70704c2.

**기준일 보존**: 2026-05-17 (★ ★ ★ ★ **session 22차 — v4.0.1 PATCH release — rules schema enforcement 강화** — 3-에이전트 research 후 사용자 "추천으로 해줘" 4 결단 묶음. ③ source_grounded_evidence required (auto_extracted=true 한정 / if-then schema) + ⑥ intent_vs_bug_classification 공유 $ref SSOT 신설 (schemas/intent-classification.schema.json) + H-1 (Gherkin tag 표기 수정) + H-2 (Maldonado 인용 오류 수정 / SATD 5 분류 명시). ⑤ cross_consistency_check inline = carry (PoC 적용률 3/14 시기상조 / ≥7 PoC 후 재평가 → 묶음 P prereq source). additive only / breaking change ❌. DEC-2026-05-17-rules-schema-enforcement-strengthen + ADR-CHAIN-011 §5.8 patch v11. drift-validator 신규 5 test (57/57) / workspace 359 → 364/364 / release-readiness 11/11 / chain harness validated 본질 보존. commit 02258da.

**기준일 보존**: 2026-05-17 (★ ★ ★ ★ ★ **session 21차 — v4.0.0 MAJOR release — multi-agent paradigm 본격 채택 / DEC-2026-05-15-g5 retract** — plan-skill-invocation-guarantee §B5 옵션 A (사용자 "A로 해줘"). stage 별 sub-agent 5종 신설 (agents/{analysis,planning,spec,test,implement}-agent.md) + 3 base agent 병존 + spike agent archive 이동 (C-3 carry). main agent = orchestrator (skill 직접 호출 ❌ 권고 / Task tool 로 stage agent dispatch) / frontmatter `skills:[...]` 사전 주입 paradigm. lifecycle-contract §Agent column 재작성 + chain-driver hooks-bridge 격상 + agents/README 정책 재작성. ★ ★ DEC-2026-05-15-g5 retract. DEC-2026-05-17-v4-multi-agent-paradigm-채택 (source = DEC-2026-05-17-spike-planning-agent-실험 / archive/v4-spike/). C-1+C-3 본격 흡수 / C-2 (PoC 재실행) + C-4 (design agent) = 후속 carry. plugin.json 3.6.9 → 4.0.0.

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.9 PATCH release — A3 시행 / README.md + guides/ 외부 인지 자산 본격 sync (v2.5.1 → v3.6.9)** — 옵션 3 (A2 + A3 묶음) 2번째 / 본 session 마지막 release / 핵심 헤더 갱신 우선 + 본격 본문 재작성 carry / README.md (version 헤더 + 현재 사실 + §8.1 strict 자격 7 → 11 + 자격 목록 4 추가 + install URL + dist artifact path + CHANGELOG cross-link) + guides/ 4 file (README + chain-harness-guide + common-errors + getting-started) 헤더 + 갱신 이력 라인 v3.6.9 entry 추가 / guides/first-prompt-cookbook = paradigm 진화 영향 적음 / plugin.json 3.6.8 → 3.6.9 + CLAUDE.md sync + CHANGELOG v3.6.9 entry + LL-session-20-A3-1 자산화 (외부 인지 자산 drift 누적 잠재 / 12th criterion 후보 `external_doc_version_sync`) / ★ ★ ★ ★ ★ ★ session 20차 = R1+R2+R3+R4+A1+A2+A3 = 7 잔여 결단 + 다음 의제 모두 시행 완료 / v3.6.3~v3.6.9 = **7 release 묶음**

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.8 PATCH release — A2 시행 / INDEX.md 본격 archive (session 14차 이전 의사결정 분리)** — 다음 의제 옵션 3 (A2 + A3 둘 다 진행) 2개 묶음 / A2 = INDEX.md cutoff 결단 (session 14차 이하 111 DEC → INDEX-HISTORY.md 137 라인 신설 / session 15차 이후 4 DEC = R4 + G3 + plugin-charter + v2.5.0 final 보존) + INDEX.md 149 → 31 라인 (79% 절감) + Archive cross-link section 신설 / CHANGELOG.md 추가 archive 보류 (이미 v2.4 이전 = CHANGELOG-HISTORY.md 안 archive / v2.6~v3.6.x 사용자 가시화 자산 보존) / plugin.json 3.6.7 → 3.6.8 + CLAUDE.md sync + CHANGELOG v3.6.8 entry + workspace test 359/359 ✅ + release-readiness 11/11 ✅

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.7 PATCH release — A1 시행 / release-readiness 11th criterion 신설 (workspace test 회귀 자동 차단) + R2 test 회귀 동시 fix** — 다음 의제 R1 ("release-readiness 11th criterion 신설") 채택 / session 20차 v3.6.3 P0 회귀 (chain-driver Windows path 2 fail) = 본 criterion 부재 = drift 누적 사례 정합 / `scripts/release-readiness.js` 안 `check11_workspaceTestPass` 신설 + `--skip-workspace-test` flag (test cadence 안 사용 / release 본격 시행 시 본 flag ❌ 의무) + Windows EINVAL fix (shell:true) + NODE_TEST_CONTEXT env 제거 (child inherit 회피) + timeout 600s / 동시 R2 회귀 fix (`release-readiness.test.js` 안 9 → 11 expectation 갱신 + ids array 신규 2 추가 + SKIP_WS flag + 신규 A1 본격 spawn case 1) / plugin.json 3.6.6 → 3.6.7 + CLAUDE.md sync + CHANGELOG v3.6.7 entry + LL-session-20-A1-1+2+3 자산화 / workspace test 359/359 ✅ + release-readiness 11/11 ✅ + release-readiness test 11/11 ✅

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.6 PATCH release — R4 시행 / PoC #12 + #13 보류 처분 자산화** — 잔여 결단 R4 (session 20차 carry / 마지막 잔여 결단) 시행. 사실 확인 = 둘 다 README.md 만 존재 / `.aimd/` 부재 / chain harness output 0 / prelim 자산 + README 안 ★ ★ ★ ★ ★ "(B) 정책 완화 회귀" 추천 명시 → 옵션 (c) "보류 + (B) 정책 완화 회귀 처분 자산화" 채택 (옵션 (a) 본격 시행 plan + (b) 사내 적용 가이드 + (d) 별도 session 거절) / 근거 4종 (정탐 결과 정합 + ADR-CHAIN-008 strong corroboration 자격 도달 / PoC #06~#11 6 PoC 누적 + 비용 vs 가치 + paradigm 진화 안정점 정합) / `examples/poc-12-rawsql-userdecided/README.md` + `examples/poc-13-querydsl-userdecided/README.md` status = "보류" 명시 + `decisions/DEC-2026-05-16-r4-poc-12-13-보류-자산화.md` 신설 (SSOT) + `decisions/INDEX.md` 역시간순 가장 위 entry 추가 + plugin.json 3.6.5 → 3.6.6 + CLAUDE.md 라인 99 sync + CHANGELOG v3.6.6 entry / ★ ★ ★ ★ ★ **session 20차 = R1+R2+R3+R4 4 잔여 결단 모두 시행 완료** / v3.6.3 + v3.6.4 + v3.6.5 + v3.6.6 = 4 release 묶음 (모두 tag + push 완료)

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.5 PATCH release — R3 시행 / STATUS.md 본격 archive (session 14차 이전 분리)** — 잔여 결단 R3 (session 20차 carry / STATUS.md 1871 → 80 라인 / 95.7% 절감) 시행. 옵션 (a) "session 15차 이전 archive / paradigm 진화 분기 cutoff" 채택 (옵션 (b) 강력 + (c) v3.x 기준 + (d) 별도 session 거절) / `decisions/STATUS-HISTORY.md` 신설 (1807 라인 / intro + session 14차 header 23 + session 14차 이전 body 1769) / `decisions/STATUS.md` cleanup (라인 1~22 보존 header + Archive cross-link + 라인 50~101 session 15차 body = 80 라인) / context load 비용 ~96K → ~4K 토큰 절감 / plugin.json 3.6.4 → 3.6.5 + CLAUDE.md 라인 99 v3.6.5 sync (R2 cadence 정합) + CHANGELOG v3.6.5 entry + LL-session-20-06+07 자산화 (STATUS 비대화 = 매 conversation context load 누적 비용 / archive cutoff = paradigm 진화 안정점 자연 분기 활용)

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.4 PATCH release — R2 시행 / release-readiness 10th criterion 신설 (CLAUDE.md drift enforcement)** — 잔여 결단 R2 (LL-session-20-02 정합 / CLAUDE.md drift 회피 cadence 정식화) 시행. 옵션 (a) release-readiness 10th criterion 신설 채택 (옵션 (b) PostCommit hook 자동 commit risk + (c) 매뉴얼 양심 의존 거절) / `scripts/release-readiness.js` 안 `check10_claudeMdVersionSync` 신설 + main results array 등록 + header 명세 9→10 자격 갱신 / 즉시 검증 = drift 즉시 검출 (`"plugin.json v3.6.2" ↔ plugin.json=3.6.3`) → CLAUDE.md 라인 99 + plugin.json 3.6.3→3.6.4 sync → ★ ★ ★ **10/10 release-ready** ✅ / 별도 plan-mode plan 자산 (`~/.claude/plans/keen-sleeping-dragonfly.md`) = R1 plan (commit 후 carry) / R2 = direct 진행 (사용자 결단 위임) / LL-session-20-04+05 자산화 (drift enforcement criterion paradigm + paradigm 진화 안정점 후 enforcement cadence 진입 자격)

**기준일 보존**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 — v3.6.3 PATCH release — 점검 + P0 회귀 2건 복구 + CLAUDE.md drift 갱신 + INDEX.md 진행중 결정 2건 이전** — 사용자 명시 "점검해 보자" → 4 영역 점검 (본체 자가 정합 + CLAUDE.md drift + STATUS/INDEX 비대화 + 잔여 carry/다음 의제) / ★ ★ ★ critical 회귀 2건 발견 + 즉시 복구: (1) release-readiness `analysis_validator_violation` ❌ (PoC #01 + #05 rules.json /meta `additionalProperties` violations) → `meta-confidence.schema.json` 안 v3.x 진화 필드 10종 (`source_branch` / `extraction_env` / `raw_confidence` / `expected_confidence_average` / `sample_mode` / `corroboration_eligible` / `sample_mode_rationale` / `phase_b_migration_note` / `phase_d_meta_recovery_note`) 정식 등록 → ✅ 9/9 release-ready 회복 (2) `tools/chain-driver/test/scope-dir.test.js` Windows path 회귀 (Unix `/` 하드코딩 vs Windows `\`) → `join('/root', '.aimd', ...)` platform-aware fix → ✅ 114/114 회복 / ★ workspace 전체 test 359/359 ✅ + release-readiness 9/9 ✅ / CLAUDE.md 본격 갱신 (★ v2.6.0 시점 → v3.6.2 / schemas 13 → 39 / tools 12 → 16 / PoC 4 → 14 / plugin-charter SSOT + lifecycle 매트릭스 + FE skill 4종 + orchestrate 5종 + scope/stage 폴더 신설 자산 반영) / INDEX.md "진행중 결정" 2건 (DEC-2026-04-30-v1.2.3 + DEC-2026-04-29-phase-4-5) 모두 후속 release 안 흡수 완료 명시 → "(없음)" 표기 + 사유 명시 / ★ ★ ★ session 20차 = 점검 carry session = v3.6.3 PATCH 자격 (사용자 결단 영역))

**기준일 보존**: 2026-05-15 (★ ★ ★ ★ ★ ★ ★ ★ ★ **session 19차 (paradigm 진화 완료점) — v3.6.2 PATCH release — 잔여 carry 묶음 정리** — 사용자 명시 결단 "carry 다 제거" / C1 G6 영구 scope-out (G1 sibling) + C2/C3/C4 라벨 제거 (paradigm history DEC+LL 보존) + C5/C6/C7 PoC 라벨 제거 (PoC session 진입 시 새 결단) / DEC-2026-05-15-carry-cleanup-paradigm-종결 + LL-cleanup-01~02 자산화 / plugin.json 3.6.1 → 3.6.2 + CHANGELOG v3.6.2 entry / ★ ★ ★ ★ ★ ★ plugin must-have 자산 + paradigm 진화 **안정점 도달 명시** / session 19차 = 3 release (v3.6.0 G1 scope-out + v3.6.1 cross-link 보강 + v3.6.2 carry 정리))

**기준일 보존**: 2026-05-15 (★ ★ ★ ★ ★ **session 19차 — v3.6.1 PATCH release — carry C10+C8+C9 묶음 (cross-link 문서 보강)** — G5 paradigm 강화 / `tools/spectral-runner/README.md` 호출자 정정 (auto-invoke ❌ / G2 LL-G2-06 정합) + `agents/README.md` 신설 (3 base agent persona 책임 명시 + 본 매트릭스 §Agent column cross-link) + `tools/README.md` 본 매트릭스 §Tool/Validator column cross-link 1줄 + plugin.json 3.6.0 → 3.6.1 + CHANGELOG v3.6.1 entry — ★ ★ ★ session 19차 = v3.6.0 MINOR (G1 영구 scope-out) + v3.6.1 PATCH (cross-link 보강) 2 release)

**기준일 보존**: 2026-05-15 (★ ★ ★ ★ ★ ★ ★ ★ **session 19차 — v3.6.0 MINOR release — G1 영구 scope-out / charter Gap 모두 청산** — R16/R17 ITSM/Jira 자동 티켓화 영구 폐기 (사용자 명시 결단 "G1 안해도 됨 잊어줘") / charter §1 R16/R17 strikethrough + scope-out (번호 보존) / §2 요약 활성 15/15 자산 대칭 + scope-out 2 / §3 G1 strikethrough + 영구 폐기 / plugin.json 3.5.0 → 3.6.0 / CHANGELOG v3.6.0 entry / DEC-2026-05-15-g1-itsm-permanent-scope-out + memory feedback_itsm_g1_permanent_scope_out 자산화 (향후 재제안 회피 의무) / LL-G1-01~02 / ★ ★ ★ charter §3 활성 Gap **모두 청산** = plugin must-have 자산 대칭 본격 도달)

**기준일 보존**: 2026-05-15 (★ ★ ★ ★ ★ ★ **session 18차 — v3.5.0 MINOR release — G5 종결 (lifecycle 자산 매핑 매트릭스 단일 SSOT)** — charter §3 G5 (R12 lifecycle stage↔asset 매핑표 부재) 종결 / `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 신설 (본 매트릭스 stage × asset 5 column × 8 row + 부 매트릭스 R8 입력 6 row + Scenario cross-link + 사용 가이드) + 사용자 결단 (column 5 OK / row = 단일 + 부 매트릭스 분리 / v3.5.0 MINOR) + plugin.json 3.4.0 → 3.5.0 + CHANGELOG v3.5.0 entry + DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 + plugin-charter §1 R12 ⚠️→✅ + §2 요약 ✅ 14 / ⚠️ 1 / ❌ 2 + §3 G5 종결 (잔여 charter Gap = **G1 단독 / 후순위**) + LL-G5-01~02 자산화 / **★ 본 session = charter §3 활성 Gap 모두 종결 / G1 만 후순위로 잔존**)

**기준일 보존**: 2026-05-15 (★ ★ ★ ★ ★ ★ ★ ★ **session 17차 — v3.4.0 MINOR release — G4 종결 (FE skill 보강) — 후보 C 채택** — charter §3 G4 (R14 BE/FE 자산 비대칭) 종결 / `implement-react` + `implement-vue` + `test-playwright` + `analysis-html-template` 4 skill 신설 + `html-template-extract.schema.json` 신설 + 5 test pass (workspace 45/45) + `test-generate-test-spec` 본문 분기 추가 (RTL React 19 / Vue Test Utils Vue 3 / Playwright 위임 reference) + Senior critique STOP-2 (B4 진짜 도구 의무 + LL-G4-03 schema marker) 흡수 + 2원칙 research 4 정정 (React 19 forwardRef / class 분기 보존 / userEvent v14 async / Playwright POM assertion 분리) + 사용자 결단 (후보 C / Vue 3 only / scriptlet 0 absolute / 신규 phase template-analyze) + plugin.json 3.3.0 → 3.4.0 + CHANGELOG v3.4.0 entry + DEC-2026-05-15-g4-fe-skill-track-종결 + plugin-charter §2 R14 ⚠️→✅ + §3 G4 종결 (잔여 G5 > G1) + skills-axis analysis 27→28, implement 2→4, test 3→4 + flows 3 갱신 — LL-G4-01~05 자산화)

**기준일 보존**: 2026-05-15 (★ ★ ★ ★ ★ ★ ★ **session 16차 — v3.3.0 MINOR release — G2 종결 + G3 사후 정식 entry** — charter §3 G2 (R8 입력 5종 중 BCDE 미지원) 종결 / `analysis-input-orchestrate` + `analysis-from-{prompt,swagger,plan-doc,figma}` 5 skill + 5 schema 신설 + 25 test pass (workspace 40/40) + orchestrator paradigm (Hybrid 2-B + 2-A escalate / cross-ref + conflict 3-tier 정량 산식) + Senior critique STOP-1 (chain-driver dispatch STRONG-STOP 회피) + REVISE-3 본격 흡수 (escalate rule + schema contract + conflict 정량) + 사용자 3 메타 지적 흡수 (LL-G2-01/02/03 + LL-G2-04 chain-driver axis 오염 회피 + LL-G2-05 LLM 양심 회피 + LL-G2-06 auto-invoke 정책) + plugin.json 3.1.0 → 3.3.0 (v3.2 G3 + v3.3 G2 통합 bump) + CHANGELOG v3.2.0 (G3 사후 정식) + v3.3.0 (G2) entry + DEC-2026-05-15-g2-orchestrate-skill-분리-채택 + plugin-charter §2 R8 ⚠️→✅ + §3 G2 종결 표기 (잔여 G4 > G5 > G1) + skills-axis analysis 22 → 27 + workflow/input.md 3중 양립 paradigm + flows/analysis.phase-flow.json phase 0 skill mapping)

**기준일 보존**: 2026-05-14 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 15차 — v2.5.0 MINOR FINAL release — Phase D 본격 종결 ✅ — ≥ 2 PoC corroboration 본격 입증 + Adzic SBE 함정 회피 자격 본격 도달 + industry-first paradigm 본격 입증 + chain harness validated 본질 보존 ✅** — release-readiness 8/8 → 9/9 격상 (★ layer_2_consistency criterion 신설 / per-PoC mean ≥ 0.7 + critical/high drift 0 / additive change paradigm) + regression 회복 (★ session 11차 phase B `input/ → output/rules/` 회귀 회복 / release-readiness.js 3 경로 갱신 + PoC #05 rules.json meta 표준 필드 회복) + ≥ 2 PoC corroboration 자산화 (★ PHASE-D-2026-05-14-corroboration-final.md / 31 BR / overall_score mean 0.921) + drift BR 2건 DRIFT 격상 자산 (★ PHASE-D-2026-05-14-drift-domain-review.md / BR-AUTH-JWT-002 + BR-USER-DELETE-AUTH-001 / 사용자 결단 (2) / rules.json 변경 ❌ / Senior REVISE-3) + plugin.json 2.4.1 → 2.5.0 + br-cross-consistency-validator 0.1.0 → 0.2.0 + chain-driver 0.1.0 → 0.2.0 + CHANGELOG v2.5.0 entry + DEC-2026-05-14-v2.5.0-minor-final + ADR §9 LL-i-44+45 + §11 patch v9 + workspace 312/0 + scripts/test 10/10 = 322/0 pass — ★ ★ ★ ★ ★ ★ v2.5.0 release commit + git tag v2.5.0 + origin push)

## Archive

> session 14차 이전 entry + 그 이전 session body 모두 → [`STATUS-HISTORY.md`](STATUS-HISTORY.md) 이전 (★ R3 / v3.6.5 / paradigm 진화 안정점 분기 cutoff).

---
★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **본 session 2026-05-17 session 25차 — v4.1.0 MINOR release — Phase 2 ⑤ cross_consistency_check 신설**:

- ✅ **carry trigger** = DEC-2026-05-17-묶음-P §3 #1 (⑤ 보류·별도 session / ≥7 PoC 재평가 trigger 충족) + 사용자 결단 "Phase 2 ⑤ 진입"
- ✅ **선행 = STATUS drift 청산** (사용자 결단 "STATUS drift 먼저 청산") — STATUS.md session 20→24 stale sync + ADR-CHAIN-011 §9 LL-i-46+47 자산화 + ADR §11 후속 list sync = carry 등재 (`C-adr-chain-011-§11-후속-list-sync`)
- ✅ **★ 4원칙 1단계 plan** = `.claude/plans/plan-phase2-5-cross-consistency-check-inline.md`
- ✅ **★ ★ 4원칙 2단계 3-에이전트 research** = `.claude/research/research-phase2-5-cross-consistency-check.md`:
  - Senior — CONCUR + 조건1(provenance discriminator) + 조건2(both=0 grep 실측) + STOP-1 advisory(verdict enum) + Q5(⑤ 단독)
  - official-docs — if/then+properties = 값 기반 cross-field 유일 공식 메커니즘 VERIFIED / SARIF result↔rule 분리 표준 VERIFIED
  - industry-case — SARIF·Semgrep·OPA·Spectral 분리 우세 / OpenSpec #666 inline 강제 역사례 / intent-vs-bug 강제 보존 precedent 부재 = novelty
- ✅ **★ ★ ★ 코드 착수 전 실측 (Senior 조건2 + STOP-1 해소)** — both=0 (전 11 PoC) → if/then vacuous = 회귀 풀이 0 수학 보장 / is_intent 단독 43 / intent_vs_bug_classification 실사용 0 / verdict consumer unknown-fatal 부재
- ✅ **★ ★ ★ ★ 사용자 결단 4건 (추천안 묶음)** = #1 정제된 옵션 C / #2 schema if/then 강제 / #3 v4.1.0 MINOR / #4 ⑤ 단독

### resolved by 본 session (★ session 25차)

- ★ ★ ★ ★ **C-phase-2-5-cross-consistency-check** (★ session 24차 carry / 1순위) → ★ ★ ★ ★ **resolved** (v4.1.0 MINOR release 본격 시행)
- ★ ★ **STATUS drift (session 20→24 stale)** → ★ ★ **resolved** (STATUS sync + LL-i-46+47 자산화 + INDEX 점검)
- ★ ★ **DEC-2026-05-17-묶음-P §3 #2 "분류 보존 강제 포함" 확정 제약** → ★ ★ **resolved** (intent_classification_preserved + classification_drift verdict + is_intent⇔classification if/then 구현)
- ★ ★ ★ **묶음 Q ④ severity cross-stage mapping** (★ 사용자 "1"→"④만 먼저") → ★ ★ ★ **resolved** (v4.1.1 PATCH / severity-cross-stage-mapping.md SSOT 신설 + 2 schema $comment / additive / DEC-2026-05-17-severity-cross-stage-mapping)

### 신규 carry (★ session 25차)

- ★ ★ ★ **묶음 Q 잔여 ①②⑦ (★ breaking / cooling-off)** = ① alias 4중첩 폐기 (실측 2 PoC: poc-01 `rules`→`business_rules` / poc-04 manual+auto→business_rules) / ② BR 표현 4→2 단일화 (★ poc-06 7 BR desc-only → NL/GWT 합성 의무 + poc-03 TCA 제거 안전) / ⑦ rules.json→business-rules.json rename (★ 265 file blast radius). 각각 별도 plan + Senior critique + 사용자 결단 의무
- ★ ★ **C-poc08-drift-passwd-ordqry** (★ Phase D 도메인 전문가 검토 / rules.json 변경 ❌ — 변경 없음 / ⑤ schema = 향후 검출 infra)
- ★ ★ **C-cross-consistency-validator-inline-emit** (★ ⑤ schema 신설됨 / br-cross-consistency-validator 가 slim marker 를 BR 에 실제 기록하는 emit path = forward 구현 carry / 현재 both=0·intent_vs_bug 실사용 0 = 데이터 부재로 미발동)
- ★ **C-adr-chain-011-§11-후속-list-sync** (session 25차 식별 / §11 후속 list = v2.5.1까지만 / v2.6~v4.1.0 미기재)
- ★ **C-poc05-haiku-retrospect** (★ session 13차 carry / Phase D self-eval-bias 완성)

### Lessons Learned 신규 (★ session 25차 / ADR-CHAIN-011 §9)

- ★ ★ ★ ★ ★ ★ **LL-i-46** (pre-pre-prerequisite 사각지대 재현 / Sprint 1-J PoC #03 — session 25차 자산화)
- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-47** (echo-chamber self-eval bias 실측 / PoC #08 — session 25차 자산화)
- ★ ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-51** (★ "양심 의존 → schema enforcement 결정화 paradigm — 단 실측(both=0) 선행 + functional(모순 거부) test 동반 의무" / Phase 2 ⑤)

### ★ ★ ★ ★ release-readiness 11/11 실측 결과

```
node scripts/release-readiness.js --target v4.1.0
✅ 11/11 criteria passed.
★ ★ ★ v4.1.0 = release-ready.
workspace test 381/381 pass (364 baseline + 17 신규 / 0 fail) / analysis_validator_violation = 11 PoC 전수 violations 0
```

★ functional test 4·5 = if/then 이 모순 BR (is_intent=true+classification="bug" / 역방향) 실제 INVALID = vacuous-everywhere 아님 입증

### 다음 session entry-point (★ session 26차+)

1. **묶음 Q 잔여 ①②⑦** (1순위 / ④ 종결됨) — ★ breaking / cooling-off → 각각 별도 plan + Senior critique + 사용자 결단. risk 오름차순 권고 = ① alias(2 PoC) → ② BR 표현(poc-06 7 BR 합성) → ⑦ rename(265 file)
2. **별도 carry** — C-poc08-drift Phase D 검토 / C-cross-consistency-validator-inline-emit / §11 후속 list sync / PoC #05 Haiku retrospect

---
★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **본 session 2026-05-17 session 24차 — 묶음 P prereq 전 chain 종결 (★ no version bump / carry only / 18 commit push)**:

- ✅ **carry trigger** = ★ ★ ★ ★ DEC-2026-05-17-rules-schema-enforcement-strengthen §⑤ carry ("≥ 7 PoC 도달 후 재평가") + 사용자 결단 "묶음 P 해줘" (자율 시행 위임)
- ✅ **★ 묶음 P 정의** = Sprint 1 (schema cleanup / pre-pre-prereq) → Sprint 2 (NL/GWT dual representation / pre-prereq) → Sprint 3 (Layer 2 LLM corroboration) → Phase 2 본격 (⑤)
- ✅ **★ ★ Sprint 1~3 자율 종결 (18 commit b96fb84~85f1e6a)**:
  - Sprint 1 (10 sub-sprint) = 전체 11 PoC rules.json schema VALID + `analysis_validator_violation` criterion PoC #01+#05 한정 → 전체 11 PoC auto-discover 전수 격상
  - ★ Sprint 1-J = pre-pre-prereq 사각지대 PoC #03 (NestJS) INVALID 76 errors 계획 외 발견 → 사각지대 carry 거부 + 즉시 보정 (LL-i-46 자산화)
  - Sprint 2 (4 PoC 30 BR) = #02·#04 GWT→NL + #08·#10 NL→GWT dual representation additive
  - Sprint 3 (4 PoC 8 dispatch) = Sonnet 4.6 phase-c + Haiku 4.5 blind retrospect → ★ ★ ★ Layer 2 corroboration 7 PoC 도달 (poc-01/02/03/04/05/08/10)
- ✅ **★ ★ ★ 핵심 발견 — PoC #08 echo-chamber drift 본격 실측** (LL-i-47 자산화):
  - Sprint 2 GWT 합성 (Sonnet 4.6) 이 is_intent=false / is_likely_bug=true 무시 → BR-PETSTORE-PASSWD-006 (평문 password 보안버그) + BR-PETSTORE-ORDQRY-005 (N+1) 정상규칙 정규화
  - 동일 모델 Sonnet 4.6 Layer 2 = 미검출 (0.93·0.90 / echo chamber) / 독립 Haiku 4.5 blind retrospect = 검출 (0.55·0.58 / 2 critical drift)
  - → industry-first paradigm + Adzic SBE 10년 폐기 함정 회피 자격 **본격 실측 입증**
- ✅ **★ ★ ★ ★ 사용자 결단 3건 (session 24차 gate)** = #1 Phase 2 ⑤ 보류·별도 session / #2 ★ 확정 제약 "분류 보존 강제 포함" (재논의 ❌) / #3 push carry only (version bump ❌)

### resolved by 본 session (★ session 24차)

- ★ ★ ★ ★ **묶음 P prerequisite 전 chain** (Sprint 1+2+3) → ★ ★ ★ ★ **resolved** (자율 시행 종결 / Layer 2 corroboration 7 PoC 도달 / Phase 2 prereq ≥7 충족)
- ★ ★ **Sprint 1-I `analysis_validator_violation` criterion = PoC #01+#05 한정 사각지대** → ★ ★ **resolved** (전체 11 PoC auto-discover 전수 격상 / `feedback_pre_pre_prerequisite_lacuna` 정합)
- ★ ★ **4 PoC dual representation 부재** (#02·#04·#08·#10) → ★ ★ **resolved** (Sprint 2 / 30 BR additive 합성)

### 신규 carry (★ ★ session 24차)

- ★ ★ ★ ★ **C-phase-2-5-cross-consistency-check** (★ 1순위 / 별도 session / 진입 자격 충족 — ≥7 PoC + "분류 보존 강제 포함" 확정 제약 + inline(CodeQL) vs 분리(Spec-Kit) 결단 + v4.1.0 MINOR bump)
- ★ ★ ★ **C-poc08-drift-passwd-ordqry** (★ Phase D 도메인 전문가 검토 / rules.json 변경 ❌ / release-readiness check9 poc-08 미산입 의도된 carry)
- ★ ★ **묶음 Q** (P 종결 후) = ① alias 4중첩 폐기 / ② BR 표현 4→2 단일화 / ④ severity cross-stage mapping / ⑦ rules.json → business-rules.json rename
- ★ **C-poc05-haiku-retrospect** (★ session 13차 carry / Phase D self-eval-bias 완성) + **C-version-bump-sprint1i-criterion** (Sprint 1-I criterion 격상 = 다음 release v4.1.0 MINOR 후보 일괄)
- ★ **C-adr-chain-011-§11-후속-list-sync** (★ session 25차 식별 / §11 후속 list = v2.5.1까지만 / v2.6~v4.0.1 미기재 — 별도 doc sync carry)

### Lessons Learned 신규 (★ session 24차 / ADR-CHAIN-011 §9 / session 25차 자산화)

- ★ ★ ★ ★ ★ ★ **LL-i-46** (★ "pre-pre-prerequisite 사각지대 재현 — criterion 부분 적용이 잔여 PoC drift 은폐 / 계획 외 발견 즉시 보정 paradigm" / Sprint 1-J PoC #03)
- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-47** (★ "echo-chamber self-eval bias 실측 + cross-model blind retrospect 가 dual-representation drift 본격 검출 / industry-first + Adzic SBE 함정 회피 자격 본격 실측" / PoC #08)

### ★ ★ ★ ★ release-readiness 11/11 실측 결과

```
node scripts/release-readiness.js
✅ 11/11 criteria passed.
★ workspace test 364/364 / chain harness validated 본질 보존 / 0 회귀.
```

★ Layer 2 corroboration: poc-01/02/03/04/05/08/10 = **7 PoC** (Phase 2 prereq ≥7 충족) / poc-08 = echo-chamber drift carry (check9 미산입)

### 다음 session entry-point (★ session 25차+)

1. **Phase 2 ⑤** (1순위 / 진입 자격 충족) — inline(CodeQL) vs 분리(Spec-Kit) 결단 + "분류 보존 강제 포함" 확정 제약 (재논의 ❌) + v4.1.0 MINOR / 4원칙 (plan + 3-에이전트 research + 사용자 결단 + 시행)
2. **묶음 Q** (P 종결 후 / 4건)
3. **별도 carry** — PoC #05 Haiku retrospect / C-poc08-drift Phase D 검토 / §11 후속 list sync / version 결단

---
★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **본 session 2026-05-14 session 15차 — v2.5.0 MINOR FINAL release — Phase D 본격 종결**:

- ✅ **carry trigger** = ★ ★ ★ ★ ★ ★ C-v2.5.0-minor-final-release (★ session 14차 carry / critical)
- ✅ **★ 4원칙 1단계 plan 자산** = `~/.claude/plans/u-v2.5.0-phase-d-release-final.md` (§0~§9 / Plan U)
- ✅ **★ ★ 4원칙 2단계 Senior critique sub-agent (★ ★ Sonnet 4.6 / 가벼운 sub-agent / 시간 cap 20분)**:
  - ★ ★ ★ ★ **STOP-1** (Q-D1 (c) per-BR vs per-PoC 집계 단위 모호 / BR-AUTH-JWT-002 L2=0.65 위반) 발행
  - ★ REVISE 4건 (REVISE-1 check9 집계 단위 명시 + REVISE-2 verification gate + REVISE-3 DRIFT 격상 자산 + REVISE-4 package.json version bump)
  - ★ ★ ★ 자격 검증 4/4 모두 ✅ (≥ 2 PoC corroboration + Adzic 회피 + industry-first + chain harness 본질 보존)
- ✅ **★ ★ ★ ★ 사용자 결단** "옵션 A" (Phase D 1 session 전 영역) + "옵션 2" (drift BR 검토 먼저) + ★ ★ 두 BR 모두 (2) DRIFT 격상 자산 채택
- ✅ **★ ★ ★ ★ ★ ★ ★ 4원칙 4단계 본격 시행 — 4 단계 통합**:

### resolved by 본 session (★ session 15차)

- ★ ★ ★ ★ ★ ★ **C-v2.5.0-minor-final-release** (★ session 14차 carry / critical) → ★ ★ ★ ★ **resolved** (★ v2.5.0 MINOR FINAL release 본격 시행 / git tag + origin push)
- ★ ★ ★ ★ ★ **Phase D 본격 종결** → ★ ★ ★ ★ **resolved** (★ ★ release-readiness 9/9 + ≥ 2 PoC corroboration + drift BR 처분 + release 모두 시행)
- ★ ★ ★ ★ **C-phase-d-domain-expert-review-3-drift** (★ session 14차 carry / Phase D / 도메인 전문가 검토) → ★ ★ **resolved** (★ ★ 사용자 자신 검토 / 두 BR 모두 DRIFT 격상 자산 / rules.json 변경 ❌)
- ★ ★ ★ ★ **C-phase-d-domain-expert-review-2-drift** (★ session 13차 carry) → ★ ★ **resolved** (★ 위와 동일)
- ★ ★ **C-overall-threshold-redesign-phase-c** (★ session 11차 carry / Phase C carry) → ★ **resolved** (★ release-readiness check9 안 per-PoC mean ≥ 0.7 + chain-driver overall_score (L1+L2)/2 ≥ 0.85 = session 14차 정합)
- ★ ★ **C-release-readiness-9-9-격상** (★ session 14차 implicit) → ★ ★ **resolved** (★ ★ check9 layer_2_consistency 신설 + scripts/test 10/10)

### 신규 carry (★ ★ session 15차)

- ★ ★ **C-jwt-secret-hardcoded-fix** (★ Phase D+ / 사내 적용 시 1줄 fix / BR-AUTH-JWT-002 human_review_note 정합)
- ★ ★ **C-nestjs-auth-middleware-delete-fix** (★ Phase D+ / 사내 적용 시 1줄 fix / BR-USER-DELETE-AUTH-001 F-140 critical resolved 자격)
- ★ ★ ★ **C-absent-br-gwt-nl-paradigm 보강** (★ session 13차 carry / PHASE-D-2026-05-14-drift-domain-review.md = 본격 paradigm 사례 / Phase D+ 본격 명세 작성)
- ★ ★ **C-self-evaluation-bias-retrospect 보존** (★ session 13차 carry / Opus/Haiku 교차 검증 별도 session)

### Lessons Learned 신규 (★ session 15차 / ADR-CHAIN-011 §9 patch v9)

- ★ ★ ★ ★ ★ ★ ★ ★ **LL-i-44** (★ "drift BR DRIFT 격상 자산 paradigm = rules.json 변경 ❌ 본격 본질 / Phase D session 15차 정합")
- ★ ★ ★ ★ ★ ★ **LL-i-45** (★ "absent BR semantic_inversion 본격 검출 = 본 방법론 가치 본격 입증 / industry-first paradigm 본격 보강")

### ★ ★ 자격 본격 입증 4종 ✅ (★ ★ ★ session 15차 결단 핵심)

| 자격 | 본격 입증 |
|---|---|
| ≥ 2 PoC corroboration | ★ ★ ✅ 31 BR (PoC #01 13 + PoC #03 18) / Layer 1 + Layer 2 양쪽 통과 / cross-language + cross-platform diversity |
| Adzic SBE 10년 폐기 함정 회피 | ★ ★ ✅ Layer 1 + Layer 2 hybrid paradigm 본격 동작 입증 / dual representation + cross-consistency validator + drift carry paradigm |
| industry-first | ★ ★ ✅ Spec Kit (90K) / AWS Q / DMN / Spectral / Drools / AutoUAT 모두 cross-consistency validator 부재 |
| chain harness validated 본질 보존 | ★ ★ ✅ release-readiness 9th criterion = additive change paradigm / no-simulation trio + D21' + content-aware 비손상 |

### ★ ★ ★ ★ release-readiness 9/9 실측 결과

```
node scripts/release-readiness.js --target v2.5.0
✅ 9/9 criteria passed.
★ ★ ★ v2.5.0 = release-ready.
```

★ Layer 2 per-PoC mean: PoC #01=0.848 (n=13) / PoC #03=0.914 (n=18) / PoC #05=0.970 (n=2, sample)

---
