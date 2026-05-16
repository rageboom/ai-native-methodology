# 현재 상태 (Live Snapshot)

> 휘발성 진행 상태. 영속 컨텍스트는 [`/CLAUDE.md`](../../CLAUDE.md), 결정 이력은 [INDEX.md](INDEX.md).
> 본 파일은 phase / sprint 종결 시 갱신.

**기준일**: 2026-05-16 (★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ **session 20차 (현 session) — v3.6.6 PATCH release — R4 시행 / PoC #12 + #13 보류 처분 자산화** — 잔여 결단 R4 (session 20차 carry / 마지막 잔여 결단) 시행. 사실 확인 = 둘 다 README.md 만 존재 / `.aimd/` 부재 / chain harness output 0 / prelim 자산 + README 안 ★ ★ ★ ★ ★ "(B) 정책 완화 회귀" 추천 명시 → 옵션 (c) "보류 + (B) 정책 완화 회귀 처분 자산화" 채택 (옵션 (a) 본격 시행 plan + (b) 사내 적용 가이드 + (d) 별도 session 거절) / 근거 4종 (정탐 결과 정합 + ADR-CHAIN-008 strong corroboration 자격 도달 / PoC #06~#11 6 PoC 누적 + 비용 vs 가치 + paradigm 진화 안정점 정합) / `examples/poc-12-rawsql-userdecided/README.md` + `examples/poc-13-querydsl-userdecided/README.md` status = "보류" 명시 + `decisions/DEC-2026-05-16-r4-poc-12-13-보류-자산화.md` 신설 (SSOT) + `decisions/INDEX.md` 역시간순 가장 위 entry 추가 + plugin.json 3.6.5 → 3.6.6 + CLAUDE.md 라인 99 sync + CHANGELOG v3.6.6 entry / ★ ★ ★ ★ ★ **session 20차 = R1+R2+R3+R4 4 잔여 결단 모두 시행 완료** / v3.6.3 + v3.6.4 + v3.6.5 + v3.6.6 = 4 release 묶음 (모두 tag + push 완료)

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
