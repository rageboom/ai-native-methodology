# 현재 상태 (Live Snapshot)

> 휘발성 진행 상태. 영속 컨텍스트는 [`/CLAUDE.md`](../../CLAUDE.md), 결정 이력은 [INDEX.md](INDEX.md).
> 본 파일은 phase / sprint 종결 시 갱신.

**기준일**: 2026-05-13 (★ ★ ★ **session 7차 — v2.3.7 PATCH release — rules.schema.json BR pattern 4토막 strict 정합 + id-conventions.md enforcement label 강화** — 8/8 schema-validator test pass / 6 PoC 일시 fail 허용 carry / chain harness 5 요소 변경 ❌ / DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7 신설)

**v2.3.7 PATCH release** (★ session 7차 / commit pending / git tag v2.3.7 pending)
**v2.3.6 PATCH release 보존** (★ session 6차 / commit pending / git tag v2.3.6 pending / findings-aggregator)
**v2.3.5 PATCH release 보존** (★ session 4차 / commit `bbe27ab` / git tag `v2.3.5` / origin push ✅ / chain 2 4 UC 종결)
**v2.3.4 PATCH release 보존** (★ session 2차 / commit `e298bb4` / git tag `v2.3.4` / F-015 finding 정정)

**v2.3.4 PATCH release 보존** (★ session 2차 / 2026-05-13 / commit `e298bb4` / git tag `v2.3.4` / origin push ✅ / Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 / sub-rule v1.1.1 → v1.1.2 PATCH)
**v2.3.3 PATCH release 보존** (★ session 1차 / 2026-05-13 / commit `6ab26b6` / git tag `v2.3.3` / origin push ✅ / R1' axis 본체 명문화 + sub-rule v1.1 → v1.1.1 PATCH / industry first paradigm-cross axis quantification)
**v2.3.2 PATCH release 보존** (2026-05-12 / commit `ba3ed82` / git tag `v2.3.2` / sub-rule v1.0 → v1.1 minor 갱신)
**v2.3.1 PATCH release 보존** (2026-05-12 / commit `bc48477` / git tag `v2.3.1` / origin push ✅ 2026-05-12)

---

★ ★ ★ ★ ★ **본 session 2026-05-13 session 7차 — v2.3.7 PATCH release — BR ID 4토막 schema enforcement**:

- ✅ **사용자 점검 질의** "지금 우리 프로젝트 점검" → 프로젝트 현황 / 산출물 / 검증 절차 / 한계 carry 보고
- ✅ **사용자 결단** "BR 표기법 도메인-카테고리-번호로 하자" → 4토막 정식 표준 채택
- ✅ **영향 범위 조사** — id-conventions.md 가 이미 4토막 정식 표준 명시 사실 확보 (★ 표준 vs schema enforcement 분리 잔존 패턴 발견) / 11 PoC rules.json BR 형식 전수 조사 (정합 5 + 위반 6)
- ✅ **사용자 결단 2 question** — Q1 (a) PoC #11 즉시 재라벨 + 5 PoC carry / Q2 (a) PoC #11 카테고리 = 도메인 전문가 위임
- ✅ **4원칙 plan** `~/.claude/plans/l-br-id-4-segment-enforcement.md` (7절) + "Plan 원안 승인 + 즉시 착수" 결단
- ✅ **schema enforcement 변경**:
  - `rules.schema.json` BR pattern → `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` (4토막+ strict / 5토막+ 자연 허용)
  - `domain.schema.json` + `state-map.schema.json` + `meta-confidence.schema.json` description 예시 4토막 정합
  - `id-conventions.md` § 규칙 4 항목 ★ ★ v2.3.7 enforcement label + 신규 마이그레이션 carry 절 (영향 6 PoC 명시)
- ✅ **schema-validator unit test 3 신규** — 3토막 fail / 4토막 pass / 5토막 pass / ★ **8/8 pass ✅**
- ✅ **★ ★ 6 PoC 일시 fail 허용 carry 명시** — PoC #11 (BILLING) + PoC #06 (EXCHANGE) + PoC #07 (CAPITAL) + PoC #08 (PETSTORE) + PoC #09 (RW) + PoC #10 (RAE)

### resolved by 본 session (★ session 7차)

- ★ **C-schema-br-pattern-fix** (★ session 3차 발견 trigger)

### 신규 carry (★ ★ session 7차)

- ★ ★ **C-rules-BR-id-relabel-PoC-11** (★ critical / 도메인 전문가 위임 / chain 3+4 진입 전 결단 의무 후보)
- ★ **C-rules-BR-id-relabel-5PoC** (★ PoC #06+#07+#08+#09+#10 일괄 재라벨 별도 sprint)

### Lessons Learned 신규 (★ session 7차)

- ★ **LL-i-19** (★ "id-conventions 표준 vs schema enforcement 3 layer 정합 의무"): 문서 명시 + schema 강제 + unit test 검증 = 3 layer 정합 의무 / 향후 동일 패턴 (UC/BHV/AC ID) 점검 의무
- ★ ★ **LL-i-20** (★ "schema strict 화 → 기존 PoC fail = 표준 enforcement 자연 결과 / 도메인 전문가 위임 = F-015 한계 회피")
- ★ **LL-i-21** (★ "scope 최소화 + 영향 정직 보고 정합" — plan 6 schema → 실제 1 strict + 3 description 정합 축소)

### ★ ★ 다음 step

- ★ ★ **C-rules-BR-id-relabel-PoC-11** = 도메인 전문가 결단 sprint (★ PoC #11 chain 3+4 진입 전 의무)
- ★ **C-rules-BR-id-relabel-5PoC** = 별도 sprint (★ v2.4.0 MINOR 자격 잠재)
- ★ §8.1 strict 검증 + build + git tag v2.3.7 (★ 본 session 마무리)

---

★ ★ ★ ★ ★ ★ **본 session 2026-05-13 session 3차 — B sprint chain 2 UC #1 partial 자산화 (★ ★ Agent 3 STOP 2 + REVISE 5 흡수)**:

- ✅ **B 본격 진입** — 사용자 결단 "풀가동 해줘" → 4원칙 3원칙 4 question 결단 (Q1 PoC #11 사내 ROI / Q2 4 stage 풀가동 / Q3 3 sub-agent / Q4 chain 2 본 session)
- ✅ **자산 전수 조사** — PoC #11 chain 1 planning-spec 보유 + PoC #05 sample chain 2 모범 예시 + chain 2 schema (behavior-spec + acceptance-criteria)
- ✅ **3 sub-agent 병렬 research** — Agent 1 공식문서 (Gherkin/SBE/MoSCoW/Use Case 2.0 + ★ Spring 4.1+iBATIS 2+egov chain 2 OSS 사례 부재 = original empirical finding 자격) + Agent 2 Big-tech (★ GitHub Spec Kit 90K star = chain harness ★ 4단계 동형 / Amazon Q SWE-bench 66% R1' Modern 자릿수 정합 / TDAD arxiv 2603.17973 chain 3 RED→4 GREEN 권위) + Agent 3 Senior critique (★ ★ STOP 2 + REVISE 5)
- ✅ **★ ★ Agent 3 Senior critique 흡수** — STOP signal 2 (cycle feasibility + v2.4.0 자격 부재) + REVISE 5 (PoC #08 carry + Legacy stack + expert 게이트 + scope UC #1 + 결단 burst) ★ 메인 cross-check 검증 (★ ADR-CHAIN-008 + PoC #05 = 4 file = sample ≠ realworld 정확)
- ✅ **4 question 사용자 결단** — Q1 PATCH v2.3.5 (chain 2 종결 후) / Q2 UC #1 만 본 session / Q3 (b) characterization mode 현 behavior 보존 / Q4 carry 2건 신설 (C-stack-결단-chain-3-4-plan + C-OSS-Modern-chain-2-4-PoC08)
- ✅ **k-plan 작성** — `~/.claude/plans/k-poc-11-chain-2-plan.md` (8절 / chain 2 UC #1 한정 / characterization mode 명시 / scope OUT 명확)
- ✅ **★ ★ chain 2 UC #1 자산화 (4 file)** — `examples/poc-11-efiweb-billing-spring41/.aimd/output/`:
  - `behavior-spec.json` (★ 1 BHV-BILLING-001 / UC #1 → BHV 1:1 / 3 AC forward / characterization mode invariants 명시 / schema strict ✅)
  - `behavior-spec.md` (★ 사람 읽기 / 두 렌더링 / characterization mode 사상 + schema mismatch carry 명시)
  - `acceptance-criteria.json` (★ 3 AC-BILLING-001/002/003 / Gherkin BDD / must×2 + should×1 / verifiable=true + test_case_refs TC-* placeholder / schema strict ✅)
  - `acceptance-criteria.md` (★ Gherkin .feature 렌더 / Better Gherkin 사상 정합)
- ✅ **chain-coverage-validator 검증** — ★ ★ 4 high findings expected (UC #2~#4 no BHV / coverage 0.25 < 0.85 threshold) — ★ ★ 본 session = UC #1 만 결단 정합 사실 (Agent 3 signal 4 정합)
- ✅ **planning-extraction-validator 검증** — 0 findings + use_case coverage = 1 ✅
- ✅ **schema-validator 검증** — behavior-spec ✅ + acceptance-criteria ✅ (★ schema strict pass)
- ✅ **★ critical schema pattern mismatch 발견** — rules.json BR ID 형식 (`BR-BILLING-005` 3 segment) vs behavior-spec.schema.json `br_refs` pattern (`^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 4 segment) 불일치 → ★ ★ br_refs 빈 array + carry C-schema-br-pattern-fix 신설 / BR 매핑 fact = description + invariants + source_grounded_evidence 자연 보존

### resolved by 본 session (★ session 3차)

- C-r1-prime-자격-Modern-corroboration (★ session 1차 v2.3.3 / 보존)
- C-not-all-code-검증 (★ session 2차 v2.3.4 / 보존)
- C-poc-11-0-satd-해석-정정 (★ session 2차 / 보존)
- C-poc-11-source-디렉토리-cleanup (★ session 2차 / 보존)

### 신규 carry (★ ★ session 3차)

- ★ ★ ★ **C-stack-결단-chain-3-4-plan** (★ critical / Agent 3 signal 5 STOP / chain 3+4 진입 전 4원칙 1원칙 재실행 의무 / option (i) Legacy / (ii) Modern 마이그레이션 / (iii) characterization 만 결단)
- ★ ★ **C-OSS-Modern-chain-2-4-PoC08** (★ critical / Agent 3 signal 6 STOP / PoC #08 jpetstore-6 chain 2~4 후속 sprint = ≥ 2 realworld PoC corroboration 자격 trigger / v2.4.0 MINOR 자격 활성)
- ★ **C-schema-br-pattern-fix** (★ chain 2 발견 / behavior-spec.json br_refs schema pattern vs rules.json 형식 불일치 / 본 PoC + PoC #06+#07 모두 정합 / 별도 sprint = schema 수정 또는 rules.json 형식 정합 결단)
- ★ ★ **C-chain-2-UC-2-3-4-진입** (★ chain 2 다음 session / 본 session UC #1 만 / UC #2 + UC #3 (★ ★ critical BHV-BILLING-003) + UC #4 진입)
- ★ **C-PoC-11-chain-2-PATCH-v2.3.5-trigger** (★ chain 2 4 UC 모두 종결 후 PATCH v2.3.5 release 결단 / 사용자 결단 Q1 정합)

### 보존 carry (★ 본 작업 후)

- ★ ★ C-모던-stack-사내-측정 (★ critical / Agent 3 REVISE #1 / 사내 Modern stack PoC)
- ★ ★ C-사내-chain-2-4 (★ ★ resolved partial — 본 session = PoC #11 chain 2 UC #1 진입)
- ★ ★ C-egovframework-chain-2-4 (★ ★ resolved partial — 본 session = PoC #11 chain 2 UC #1 진입)
- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (★ 결제 도메인 expert 위임)
- C-PoC07-1~3 (★ chain 3 영역 retrofit / ★ B sprint 안 자연 흡수 후보)
- C-v2.2.0-1 (★ NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

### ★ ★ 4원칙 Lessons Learned (본 session 3차 신규)

- ★ LL-i-8 (★ ★ critical / Agent 3 Senior critique = STOP signal 2건 + REVISE 5건 = ★ ★ critical) — "풀가동" 사용자 결단 직후 Senior critique = STOP signal 발견 → ★ ★ 사용자 결단 ★ 100% Agent 3 권고 흡수 = 4원칙 §3 + Agent 3 정신 정합 (★ 사용자 명시 결단 + Senior critique 양쪽 모두 정합 가능)
- ★ LL-i-9 (★ chain 2 schema mismatch 발견) — rules.json 형식 vs behavior-spec.schema.json br_refs pattern 불일치 = ★ ★ ★ PoC #11 chain 2 첫 적용 시 발견 / ★ ★ ★ 본 발견 자체 = PoC 가치 / chain 2 첫 적용 = ★ ★ ★ critical lesson = 본 방법론 schema fix 의무
- ★ LL-i-10 (★ chain 2 = paradigm-agnostic 정합 사실 확인) — Legacy Spring 4.1 + iBATIS 2 + egov stack 안에서도 chain 2 (behavior + AC) 작성 자체는 ★ ★ feasible / paradigm-agnostic 정합 ✅ (★ chain 3+4 = stack 결단 의무 / chain 2 ❌)

### ★ ★ ★ 다음 step

- ★ ★ ★ chain 2 다음 session = UC #2 (조회 계열 / dataConfirmListAjax) + UC #3 (★ ★ ★ critical BHV-BILLING-003 atomicity / expert 게이트 의무) + UC #4 (Qlik View)
- ★ ★ chain 2 4 UC 모두 종결 → PATCH v2.3.5 release 결단 (★ Q1 정합)
- ★ ★ ★ chain 3 + chain 4 진입 전 = ★ stack 결단 plan 신설 (C-stack-결단-chain-3-4-plan)
- ★ ★ ★ chain 2~4 본격 종결 후 = ★ PoC #08 chain 2~4 후속 sprint (C-OSS-Modern-chain-2-4-PoC08) = ≥ 2 realworld PoC 자격 → v2.4.0 MINOR 자격 trigger

---

---

★ ★ ★ ★ ★ ★ **본 session 2026-05-13 session 5차 — chain-driver retroactive gate 정식 통과 (★ critical lesson "양심 의존 차단" 정합 강화)**:

- ✅ **사용자 질문 "chain1→2 검증 과정?"** — ★ critical 발견 trigger
- ✅ **솔직 보고** — chain-driver state.json 모든 PoC (PoC #11 + PoC #03~#10) ★ ★ ★ 부재 사실 / validator 사후 검증 ✅ / chain-driver state machine ❌ 양심 의존 패턴 가능성 보고
- ✅ **사용자 결단** — "즉시 chain-driver init + gate retroactive 실행 (추천)"
- ✅ **PoC #11 chain-driver init + 2 next 실행**: analysis → planning (go) + spec (go) gate 정식 통과 / state.json 작성 / planning + spec stage_progress="complete"
- ✅ **.gitignore 정책 확인** — `examples/**/.aimd/state.json` + `intervention-log.jsonl` = ★ git ignored (★ "PoC 별 영속 / 사용자 local runtime artifact" 정합 / sub-plan-5+ 결단)
- ✅ **★ ★ "양심 의존 차단" 정책 정정 자산화** — chain-driver tool 직접 실행 = ★ "양심 의존" 차단 / state.json git 공유 ❌ = local runtime / ★ session 5차 = ★ "양심 의존 → tool 정식 실행" 전환 ✅

### ★ ★ critical lesson

- ★ ★ chain-driver next = `--findings <path>` 옵션 ❌ = validator findings 자동 입력 ❌ → 암묵 0 findings 가정으로 pass (★ 양심 의존 잔존 패턴)
- ★ 단 실 validator (chain-coverage + planning-extraction + schema + release-readiness §8.1 strict) 모두 ✅ = cross-link 자연 정합

### 신규 carry (★ session 5차)

- ★ ★ **C-chain-driver-findings-integration** (★ critical / chain-driver next --findings 옵션 정식 통합 / validator JSON 자동 변환 + 입력 의무)
- ★ **C-chain-driver-state-retroactive-all-PoC** (★ 다른 PoC chain-driver retroactive 실행 의무)

### Lessons Learned 신규 (★ session 5차)

- ★ ★ ★ LL-i-14 (★ critical): "양심 의존 차단" 정책 = chain-driver tool 직접 실행 의무 / state.json git ignored = local runtime / validator 사후 + chain-driver retroactive 통과 = 양심 의존 → tool 정식 통과 전환 / --findings 옵션 통합 carry
- ★ ★ ★ LL-i-15 (★ critical): 사용자 질문 = critical 발견 trigger / 정직 솔직 보고 의무

### /doctor figma plugin warning (★ session 5차 추가)

- informational warning / 작동 영향 ❌ / 사용자 결단 (a) 무시

---

★ ★ ★ ★ ★ ★ **이전 session 2026-05-13 session 2차 v2.3.4 PATCH release**:

---

★ ★ ★ ★ ★ ★ **본 session 2026-05-13 session 2차 v2.3.4 PATCH release (★ Agent 1 F-015 finding 정정 + critical lesson)**:

- ✅ **D 작업 종결** — PoC #11 satd 해석 정정 (`examples/poc-11-efiweb-billing-spring41/sql-inventory/sql-inventory.json` summary.self_recognized_interpretation 절 신설 / "Modern OSS reference 정합" 단순 결론 ❌ / single-case + 작은 모듈 + 잠복 기간 미경과 명시) + 빈 source 디렉토리 4 + parent 제거 (in-place read 정책 정합)
- ✅ **E 작업 종결** — ★ ★ ★ 메인 WebFetch + WebSearch 직접 검증 = arxiv 2601.21894 정확 사실 확보 (★ Twist et al. 2026 "Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning" / First author Lukas Twist / 2026-01-29 submission / 83% experiments structural complexity restrict outperforms)
- ✅ **★ ★ DEC-2026-05-13-not-all-code-인용-복원 신설** — ★ Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 (메인 cross-check 의무) + sub-rule v1.1.1 → v1.1.2 PATCH trigger
- ✅ **★ ★ sub-rule v1.1.1 → v1.1.2 PATCH** — Twist et al. 정확 인용 복원 (§X-C #7 신설 + §6 carry resolved + §7 참조 정확 인용 복원 + frontmatter v1.1.2 추가)
- ✅ **★ ★ ★ memory `feedback_sub_agent_validation.md` v2.3.4 보강 절 추가** — F-015 한계 패턴 명시 + 적용 4 항목 (★ "확인 불가" 결단 시 메인 WebFetch + WebSearch 즉시 cross-check 의무)
- ✅ **DEC-2026-05-13-r1-prime-본체-명문화 §5.1 갱신** — C-not-all-code-검증 ✅ resolved 표기
- ✅ **★ B 진입 plan 작성** (4원칙 1원칙 / `~/.claude/plans/j-chain-2-4-풀가동.md` / 10절 / PoC 대상 결단 후보 5종 + 4 chain × stage 분해 + release v2.4.0 MINOR 자격)
- ✅ **CHANGELOG + version bump** — v2.3.3 → v2.3.4 (plugin.json + package.json + scripts/version-check.js 3 source sync)
- ✅ **build dist** — `scripts/build-plugin.js`
- ✅ **회귀 unit test** — schema 변경 ❌ → 변동 ❌ expected
- ✅ **release-readiness §8.1 strict 7/7** — `--target v2.3.4`
- ✅ **git tag v2.3.4 + commit + origin push**

### resolved by 본 session (★ session 2차)

- ~~**C-not-all-code-검증**~~ ✅ resolved by DEC-2026-05-13-not-all-code-인용-복원 (★ ★ critical / 메인 cross-check)
- ~~**C-poc-11-0-satd-해석-정정**~~ ✅ resolved (★ D 작업 / sql-inventory.json summary.self_recognized_interpretation 절 신설)
- ~~**C-poc-11-source-디렉토리-cleanup**~~ ✅ resolved (★ D 작업 / 빈 디렉토리 4 + parent 제거)
- DEC-2026-05-13-r1-prime-본체-명문화 §5.1 신규 carry 1건 ✅ resolved 갱신

### 신규 carry (★ ★ v2.3.4 PATCH 후)

- ★ ★ **C-사내-chain-2-4** (★ critical / B plan §8 / 사내 ROI axis / PoC #11 billing chain 2~4 별도 sprint / B 종결 후 자격 트리거)
- ★ ★ **C-egovframework-chain-2-4** (★ 사내 Spring 4.1 + iBATIS 2 + egov stack chain 2~4 / B plan §8)

### 보존 carry (★ 본 작업 후)

- ★ ★ C-모던-stack-사내-측정 (★ critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)
- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (★ 결제 도메인 expert 위임)
- C-PoC07-1~3 (★ chain 3 영역 retrofit / B sprint 안 자연 흡수 후보)
- C-v2.2.0-1 (★ NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

### ★ ★ 4원칙 Lessons Learned (본 session 2차 신규)

- ★ LL-i-5 (★ critical / DEC-2026-05-13-not-all-code-인용-복원 §8): F-015 cross-validation 한계 — 가벼운 sub-agent + 시간 cap 10분 = WebFetch fail / "확인 불가" 단순 결단 = ★ ★ critical risk → ★ ★ 메인 cross-check 의무 (memory `feedback_sub_agent_validation.md` 갱신)
- ★ LL-i-6: 사용자 명시 결단 우선 (Agent 3 REVISE #2 결단 burst 정신 vs 사용자 명시) — Agent 정신만 흡수 (★ "최소 변경" + scope creep 회피) / 형식 권고 (24h cooling) ❌
- ★ LL-i-7: 같은 session 2차 = 자연 발견 burst 회피 (Agent 1 finding 정정 + 메인 cross-check 결과 → 의도 burst ❌ / Agent 3 정신 정합)

### ★ ★ ★ 다음 step

- ★ ★ ★ B 본격 진입 = ★ ★ 별도 multi-day session (★ 4원칙 2원칙 research + 3원칙 사용자 결단 PoC 대상 / PoC #08 jpetstore-6 추천)
- ★ B plan `~/.claude/plans/j-chain-2-4-풀가동.md` 안 모든 결단 후보 명시

---

★ ★ ★ ★ ★ ★ **본 session 2026-05-13 session 1차 v2.3.3 PATCH release (★ R1' axis 본체 명문화)**:

- ✅ **4원칙 1원칙** — plan 자산화 (`~/.claude/plans/i-r1-prime-ceiling-본체.md` / 10절 / scope IN 13항)
- ✅ **4원칙 2원칙** — research 자산화 (`~/.claude/plans/i-r1-prime-research.md` / 3 sub-agent 병렬 / 가벼운 sub-agent 전략 / 시간 cap 10분/agent / 실측 ~76~80초/agent)
- ✅ **4원칙 3원칙** — 사용자 결단 4 question 묶음 일괄 (★ 풍성한 옵션 4건 모두 채택)
- ✅ **★ ★ ★ 3 layer 본체 가치 명세 갱신** — CLAUDE.md L36~ + ai-native-methodology/README.md L34~ + memory project_methodology_scope.md "scope OUT" 절 / R1' axis 분리 + metric semantics 차이 + Modern OSS 한정 + 외부 권위 cross-link
- ✅ **★ ★ sub-rule v1.1 → v1.1.1 PATCH** — Agent 1 인용 정정 3건 (Wang/LongCodeBench 2025/Not All Code 제거) + Agent 2 외부 권위 보강 (AWS SCT + Amazon Q + ThoughtWorks) + §X-C-2 신설 (Big-tech industry isomorphic corroboration) + Modern OSS 한정 명시 + metric semantics 차이 명시
- ✅ **DEC 신설 + 갱신** — DEC-2026-05-13-r1-prime-본체-명문화 신설 + DEC-2026-05-12-r1-가설-revisit §5 resolved 갱신
- ✅ **CHANGELOG + version bump** — v2.3.2 → v2.3.3 (plugin.json + package.json + scripts/version-check.js 3 source sync)
- ✅ **build dist** — `scripts/build-plugin.js` (artifact 검증)
- ✅ **회귀 unit test** — schema 변경 ❌ → 변동 ❌ expected
- ✅ **release-readiness §8.1 strict 7/7** — `--target v2.3.3`
- ✅ **git tag v2.3.3 + commit**

### resolved by 본 session

- ~~**C-r1-prime-자격-Modern-corroboration**~~ ✅ resolved by DEC-2026-05-13 (★ ★ critical)
- ~~DEC-2026-05-12-r1-가설-revisit §5 본체 영향 5행 모두~~ ✅ resolved (★ 갱신)
- ~~Zhang → Wang 인용 정정~~ ✅ resolved (sub-rule v1.1.1 + DEC + plan 모두)
- ~~LongCodeBench 2026 → 2025 정정~~ ✅ resolved (sub-rule v1.1.1 + DEC)
- ~~Modern OSS 한정 명시 부재~~ ✅ resolved (Agent 3 REVISE #1 흡수 / 3 layer + sub-rule §X-E)
- ~~metric semantics 차이 명시 부재~~ ✅ resolved (Agent 3 강화 흡수 / 3 layer + sub-rule §X-F.3)

### 신규 carry (★ ★ v2.3.3 PATCH 후)

- ★ **C-not-all-code-검증** (★ Agent 1 F-015 / arxiv 2601.21894 별도 검증 후 인용 재개 vs 영구 제거)
- ★ ★ **C-모던-stack-사내-측정** (★ critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)

### 보존 carry (★ 본 작업 후)

- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (★ 결제 도메인 expert 위임)
- C-PoC07-1~3 (★ chain 3 영역 retrofit)
- C-poc-11-0-satd-해석-정정 (★ Agent 1 cross-validation 흡수 잔존)
- C-poc-11-source-디렉토리-cleanup (★ 낮은 우선)
- C-v2.2.0-1 (★ NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

### ★ ★ 4원칙 Lessons Learned (본 session)

- ★ LL-i-1: 가벼운 sub-agent 전략 (Agent 3 case 생략) 도 ★ critical findings 5건 확보 → "scope 작은 작업" 도 4원칙 2원칙 진행 정당성 입증
- ★ LL-i-2: Senior critique REVISE 2 (Modern OSS 한정 + 결단 burst) = 본문 표현 보강 단순 인식 → critical context 명시 누락 위험 회피
- ★ LL-i-3: 사용자 결단 "풍성한 옵션" 채택 → 자동 scope 확장 / "최소 변경" 원칙 strict + scope creep 회피 의무
- ★ ★ LL-i-4: cooling-off 영구 폐기 정합 강화 = Senior critique 권고 vs 사용자 명시 결단 충돌 시 → 사용자 명시 결단 우선 (4원칙 §3) + Senior critique 정신만 흡수 (★ 결단 burst 의식 + 최소 변경 강 적용)

---

★ ★ ★ ★ ★ ★ **이전 session 2026-05-12 PoC #11 (EFI-WEB billing) Day 0.5~3.5 종결 + v2.3.2 PATCH release**:

★ ★ ★ ★ ★ ★ **본 session 2026-05-12 PoC #11 Day 0.5 진입 (★ 사용자 결단 α #1 진입 + 결단 β 정책 변경)**:

- ✅ **origin push 동기화** — main + 3 tag (v2.3.0-rc1 / v2.3.0 / v2.3.1) origin 동기화 (4 commits / `8941726..bc48477`)
- ✅ **사용자 결단 (β) 흡수** — "복사하지말고 해당 프로젝트 들어가서 읽었으면 좋겠어" → in-place read 정책 채택
- ✅ **DEC-2026-05-12-in-place-read-정책-채택 등재** — 사본 패턴 폐기 + 사내 PoC 정합 의무
- ✅ **source path 위임** — `/Users/sangcl/Documents/Development/Study/EFI-WEB/ifrs` (사내 EFI-WEB 코드베이스)
- ✅ **billing 모듈 LOC 정탐** — 7 file / 257 Java + 77 sqlmap + 269 JSP = **603 LOC** (★ PoC #06 345 vs PoC #07 5509+ 사이 / scale-cross floor)
- ✅ **plan 2차 작성** — `~/.claude/plans/d-poc-11-billing-2.md` (19절 / ~310 lines / in-place 정책 + 정탐 결과 + Day 1~3.5 시퀀스 + ★ §5-A+§5-B+§19 R1 revisit)
- ✅ **4원칙 3원칙 사용자 승인** — plan 2차 + Day 1 본 session 즉시 진입
- ✅ **Day 1.0 source 7 file in-place read** — BillingController + Service IF + Impl + DAO + billing.xml + dataConfirm.jsp + qlikView.jsp
- ✅ **Day 1.1 analysis 4종 작성** — rules.json (8 BR) + domain.json (4 UC / 2 BC) + antipatterns.json (13 AP / 5종 isomorphic + 8종 novel) + inventory.json (Spring 4.1+iBATIS 2+egov + cross-DB 3 / Qlik BI)
- ✅ **Day 1.5 SQL Inventory 11+1 컬럼 + §3-A 측정**:
  - SQL Inventory 6 SQL / **auto_ratio_external_6 = 66.7%** (★ ★ ★ 3 사내 PoC isomorphic 자격 ★ 충족) / validator 0 findings pass / migration_priority P0×3+P1×2+P2×1
  - §3-A 자동화율 = **52.5%** (★ inventory 70% + domain 50% + rules 50% + antipatterns 40%) — ★ ★ ★ plan 2차 expectation 25~40% +12.5%p ★ 초과
- ✅ **★ ★ ★ R1 가설 ★ ★ 반증 사실 확보** — DEC-2026-05-12-r1-가설-revisit 등재 (★ critical methodology finding)
- ✅ **★ ★ ★ ★ sub-rule v1.1 본체 보강** — DEC-2026-05-12-sub-rule-v1.1-갱신 (PoC #11 Day 2.0~3.5 suspend 후 본체 우선 / 사용자 결단 정합):
  - ★ KL-SATD 인용 정정 (Korean Language → Keyword-Labeled / SQJ 2024 DOI)
  - ★ §3 ≥ 3 사내 PoC isomorphic 표 강화 (scale-cross 3 spectrum)
  - ★ ★ §X 신규 — automation ceiling R1' (Zhang ICSE 2025 + LongCodeBench 외부 권위 STRONG / 정량 ceiling = original empirical finding)
  - 4원칙 1+2+3 완료 (plan h + research + 사용자 결단 γ)
- ✅ **★ ★ ★ ★ PoC #11 Day 2.0~3.5 정식 등재 + 종결** — DEC-2026-05-12-poc-11-종결 / 4축 4/4 pass / 3 사내 PoC isomorphic 자격 ★ 충족 / R1 가설 ★ 반증 critical finding:
  - phase 4.7 = 4 snapshot + 6 scenario + ratchet baseline write + 14/15 = 93.3% (★ Day 2.5 ambiguous BR-BILLING-006 유지 / 사용자 결단 δ)
  - chain 1 planning-spec = 0 findings + UC coverage 100% (planning-extraction-validator pass)
  - REPORT-day3-measurement.md 작성
  - C-v2.2.0-spring41-ibatis2-subrule ✅ resolved (★ 3 사내 PoC isomorphic 자격 충족)

### 신규 정탐 (★ 본 session)

- ★ ★ **egovframework** layer 발견 (`src/main/resources/egovframework/sqlmap/ifrs/billing.xml`) — 행정안전부 전자정부 표준 프레임워크 / Spring 4.1 + iBATIS 2 위 추가 layer / PoC #06+#07 동일 가능성 (Day 1 검증 의무)
- ★ **Qlik BI 연동** 신규 차원 (qlikView.jsp 60 LOC) — PoC #06+#07 미보유 spectrum
- billing 모듈 = Spring 4.1 standard 3-layer (Controller + Service IF + Service Impl + DAO + sqlmap + JSP)

### resolved by 본 session

- ~~C-in-place-read-policy~~ ✅ DEC-2026-05-12-in-place-read-정책-채택
- ~~**C-r1-hypothesis-revisit**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 (★ ★ §X 등재로 resolved)
- ~~**C-automation-ceiling-paradigm**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 (★ §X 등재로 resolved)
- ~~**KL-SATD 인용 오류**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 (★ §AP-005 정정 / Agent 1 research 기반)
- ~~**iBATIS 2 dynamic tag sub-classification carry**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 (★ v2.3.1 PATCH 정합 / §6 갱신)
- ~~**C-v2.2.0-spring41-ibatis2-subrule**~~ ✅ DEC-2026-05-12-sub-rule-v1.1-갱신 (★ ★ ★ 3 사내 PoC isomorphic 자격 ★ 충족 / sub-rule v1.1 강 등급)

### 신규 carry (★ ★ PoC #11 Day 3.5 종결 후)

- ★ ★ ★ **C-domain-PoC11-1** (★ critical / 결제 도메인 expert / BR-BILLING-006 ambiguous COM_NO==2 hardcoded 재검증 의무)
- ★ ★ C-domain-PoC11-2 (BR-BILLING-005 시작년도 2015 의미 확인)
- ★ C-domain-PoC11-3 (Qlik Sense appid/sheet 운영 체계 expert)
- ★ ★ C-poc-11-0-satd-해석-정정 (★ Agent 1 cross-validation 기반 / single-case + 잠복 기간 미경과 해석 명시)
- ★ C-poc-11-source-디렉토리-cleanup (낮은 우선순위)
- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화 시)
- C-PoC07-1~3 (chain 3 영역 / billing 도 동일 carry 정합)
- C-r1-prime-자격-Modern-corroboration (★ Modern stack sub-rule 자산화 시 R1' Modern ceiling ~60~67% 명문화)

---

★ ★ ★ ★ ★ ★ **이전 session 2026-05-12 v2.3.1 PATCH release**:

**v2.3.0 MINOR FINAL release 보존** (같은 날 2026-05-12 / commit `fd603bd` / git tag `v2.3.0` / Phase 1 + Phase 2 / ADR-CHAIN-009 + ADR-CHAIN-010)

**v2.3.0-rc1 prerelease 보존** (2026-05-12 같은 날 / commit `de1bae1` / git tag `v2.3.0-rc1` / Phase 1 single)
**v2.2.0 MINOR FINAL release 보존** (2026-05-08 / commit `8941726` / git tag `v2.2.0` / DEC-2026-05-08-v2.2.0-final / 5 PoC SQL Inventory isomorphic robust + ADR-CHAIN-008 paradigm-cross 정책 완화 + cooling-off 영구 폐기)

---

★ ★ ★ ★ ★ ★ ★ **본 session 2026-05-12 진행 (v2.3.0 minor sprint Phase 1 + Phase 2 일괄)**:

- ✅ **4원칙 1원칙** — plan 정식 격상 (`~/.claude/plans/g-v2.3.0-minor-plan.md` / 사용자 승인 Tier 1+2 = 3 항목 묶음)
- ✅ **4원칙 2원칙** — research 자산화 (`~/.claude/plans/g-v2.3.0-minor-research.md` / 3 sub-agent 병렬 / 가벼운 sub-agent 전략)
- ✅ **4원칙 3원칙** — 사용자 결단 옵션 D (Senior critique REVISE 완전 흡수)
- ✅ **Phase 1 산출 7/7** — DEC + ADR-CHAIN-009 + schema 12번째 컬럼 + validator + 2 신규 fixture + 3 신규 test + deliverable §1.1+§1.2+§3+§4+§13 갱신 + version bump
- ✅ **v2.3.0-rc1 prerelease** — commit `de1bae1` + git tag `v2.3.0-rc1` (build 272 files / CHECKSUMS 271 OK)
- ✅ **Phase 2 산출 6/6** — ADR-CHAIN-010 + sub-rule deliverable (`methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` / 신규 디렉토리) + schema patterns_extension_v3 + deliverable 24 보강 + 신규 fixture 1 + 신규 test 1 + version bump rc1 → final
- ✅ **회귀 fixture 통과** — 기존 PoC #06+#07 11 컬럼 row test pass (backward-compat 의무 ✅)
- ✅ **workspace test 237 pass** (47+11+15+16+5+5+6+5+6+25+68+14+14 / 0 fail)
- ✅ **release-readiness §8.1 strict 7/7** (ADR-CHAIN 10 dynamic 인식)

### resolved by 본 session

- ~~C-v2.2.0-3~~ patterns_extension_v3 → ✅ ADR-CHAIN-010
- ~~C-v2.2.0-4~~ Spring 4.1 + iBATIS 2 spectrum sub-rule → ✅ ADR-CHAIN-010
- ~~C-v2.2.0-2~~ sql-inventory baseline ratchet → ✅ v2.3.1 PATCH (auto_ratio_external_6 trend flag)
- ~~C-v2.2.0-7~~ iBATIS 2 dynamic 태그 sub-classification → ✅ v2.3.1 PATCH (tag_type enum 26종)

### 별도 sprint carry (v2.4 / v3.0)

- C-v2.3.0-gartner-time-application-level — `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 (★ ADR-CHAIN-009 §2)

---

★ ★ ★ ★ ★ ★ ★ **본 session 2026-05-07~08 종결 (β 결단 + "나머지 진행해줘" + "남근거 다 실행" 일괄 처리)**:
- ✅ **PoC #08 (jpetstore-6) Day 1~3.5 종결** — paradigm-cross MEDIUM #1 / commit `da1a0ab`
- ✅ **PoC #09 (lujakob TypeORM) Day 1~3.5 종결** — paradigm + platform-cross MEDIUM #2 / ★ raw query() strong ❌ 솔직 / commit `2af3772`
- ✅ **PoC #10 (raeperd Spring Data JPA) Day 1~3.5 종결 (★ ★ reframe)** — DSL builder QueryDSL ❌ 솔직 → Spring Data JPA method name derived paradigm 측정 / paradigm-cross MEDIUM #3 / v2.3.0 minor trigger ❌
- ✅ **★ ★ ★ ★ ★ ★ 5 PoC SQL Inventory isomorphic 자격 사실 확보** (66.7% × 5 / iBATIS 2 + MyBatis 3 + TypeORM + Spring Data JPA / paradigm + ORM + platform-cross 모두 robust 강 입증)
- ✅ **★ ★ ★ ★ ★ N+1 AP = 5 PoC 공통 일반성 robust 입증**
- ~~⏳ **★ ★ ★ v2.2.0 final 격상 trigger ❌** (★ Senior STOP signal / PoC #08+#09+#10 모두 MEDIUM corroboration / strong 의무 vs 실측)~~ ✅ **resolved 2026-05-08** — ADR-CHAIN-008 신정책 (MEDIUM × ≥ 5 PoC = strong) + cooling-off 폐기 + v2.2.0 MINOR FINAL release (commit `8941726`)
- ~~⏳ **★ ★ ★ ★ 신규 carry 2** = ★ 사용자 결단 의무~~ ✅ **resolved 2026-05-08** (ADR-CHAIN-008 §1 신정책 / 2026년 realworld OSS 부재 사실 정탐 흡수 → 둘 다 obsolete)
  - ~~C-paradigm-cross-strong-raw-sql~~ ✅ obsolete
  - ~~C-paradigm-cross-DSL-builder-querydsl~~ ✅ obsolete
- ⏳ **PoC #11 (EFI-WEB billing)** = 사용자 결단 α 우선순위 #1 / source 위임 도착 시 복귀

~~★ ★ §8.1 strict 본체 격상 ❌. ★ ★ Senior STOP signal 강화 (★ 2 carry 사용자 결단 의존).~~ ✅ **superseded** by Auto Mode (B) 결단 + ADR-CHAIN-008 + v2.2.0 MINOR FINAL release (line 24+ 참조 / commit `8941726`).

★ ★ ★ ★ ★ **본 session 추가 진행 (Auto Mode (A) 결단)**: PoC #12 (raw query()) + PoC #13 (DSL builder QueryDSL) prelim 일괄 신설 (DEC-2026-05-08-poc-12-13-prelim-신설). ★ ★ ★ ★ 2 추가 정탐 결과 = ★ ★ realworld OSS 부재 사실 확보.

★ ★ ★ ★ ★ ★ **본 session 정점 (Auto Mode (B) 결단)** — DEC-2026-05-08-paradigm-cross-policy-완화 + ★ ★ ADR-CHAIN-008 신설. ★ "MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 충족" 신정책. 근거: 5 PoC + 2 정탐 사실 + 6 차원 corroboration sum (paradigm + ORM + platform + language + responsibility + scale) + Senior critique 재검토. ★ ★ ★ ★ resolved carry 4 (C-v2.2.0-6 + C-paradigm-cross-strong-raw-sql obsolete + C-paradigm-cross-DSL-builder-querydsl obsolete + C-ADR-2026-OSS-paradigm-reality). ★ ★ v2.2.0 final 격상 trigger ★ 활성 (cooling-off 7d minimum 후 2026-05-15+ 별도 결단 의무). PoC #12+#13 prelim 자산 보존 (★ 사용자 source 도입 시 진입 가능 / 의무 ❌).

**v2.2.0-rc1 PRERELEASE** (2026-05-08 / 같은 날 — DEC-2026-05-08-v2.2.0-rc1-prerelease / ★ ★ ★ ★ phase 4.8 (sql-inventory) 본체 격상 prerelease / SQL 단위 11 컬럼 인벤토리 + extraction_automation + RDB 한정 sub-phase / ADR-CHAIN-007 / ★ ★ scale-cross corroboration ✅ + paradigm-cross ❌ → ★ Modern ORM PoC #08 carry / 본체 자산 7 + workflow + ADR / unit test 232 → 233 (+1 / sql-inventory-extractor workspace 14번째) / Senior cooling-off (b) v2.2.0-rc1 prerelease 7d minimum / chain harness 5 요소 변경 ❌)

**★ ★ research-v220 후 결단 흡수**:
- ★ ★ ★ Senior STOP signal (paradigm-cross 부재) → v2.2.0-rc1 prerelease + 7d minimum cooling-off + Modern ORM PoC #08 carry C-v2.2.0-6
- ★ Agent 1 (공식 docs) 빈틈 4건 모두 흡수 → statement_type 11번째 컬럼 + patterns_extension_v3 carry + iBATIS 2 전용 enum carry + Feathers/Gartner TIME 인용 ADR 명문화
- ★ Big-tech (Agent 2) 권고 흡수 → "Why not AWS SCT" 차별화 절 + 자체 baseline 정립 + Gartner TIME 12번째 컬럼 carry

**★ 본체 격상 자산 7 + workflow** (v2.2.0-rc1):
1. ✅ `methodology-spec/deliverables/24-sql-inventory.md` (★ #23 사용 / #24 신규)
2. ✅ `schemas/sql-inventory.schema.json` (★ 31번째 schema)
3. ✅ `schemas/meta-confidence.schema.json` `inputs_used` enum 13 → 14 (`sql_inventory` 추가)
4. ✅ `skills/analysis/phase-4-8-sql-inventory/SKILL.md` (★ skills 20 → 21)
5. ✅ `tools/sql-inventory-extractor/` (★ workspace 14번째 / 10 unit test)
6. ✅ `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0-rc1 (phase 4.8 entry)
7. ✅ `methodology-spec/workflow/phase-4-8-sql-inventory.md`
8. ✅ `docs/adr/ADR-CHAIN-007-phase-4-8-sql-inventory.md`

**release commit cadence (C1~C7)**:
- C1 (`f64e0b2`) — deliverable 24 + schema 31번째 + meta-confidence enum
- C2 (`4d87416`) — skill phase-4-8-sql-inventory
- C3 (`e4b0143`) — tool sql-inventory-extractor + 10 unit test + workspace 14번째
- C4 (`7b39cfb`) — flow + ADR-CHAIN-007 + workflow
- C5 (`4b26d0e`) — version bump + build + CHANGELOG
- C6 (`3e973ce`) — DEC + STATUS + INDEX + CLAUDE.md
- C7 ✅ git tag v2.2.0-rc1 (★ prerelease / `3e973ce` 기준 / Tagger Rageboom 2026-05-07)
- C8 (현재) — plan/research 4건 자산화 + STATUS C7 ✅

**★ ★ ★ v2.2.0 final 격상 trigger 의무 + 사내 ROI axis 분리 (★ ★ ★ ★ 사용자 결단 (α) 2026-05-07)**:

★ ★ ★ ★ **사용자 결단 (α) 2026-05-07 = "EFI-WEB 가장 우선순위 높다"** → **PoC 우선순위 재정렬**:
- ★ **PoC #11 (EFI-WEB billing) = 우선 진입** (사내 ROI axis / scale + domain-cross / paradigm-cross 자격 ❌ → v2.2.0 final 격상 trigger 와 별도)
- **PoC #08 (jpetstore-6) = 보류** (Day 0+0.5 commit `a27dfb0` + `a60404c` 자산 보존 / 후순위 진입)
- **PoC #09 (TypeORM raw SQL) = 별도 axis 후속** (★ v2.2.0 final 격상 trigger 핵심 / paradigm-cross strong)

**axis 분리** (★ 본 방법론 일반화 vs 사내 ROI):

| axis | 목표 | PoC | 자격 |
|---|---|---|---|
| **사내 ROI axis** (★ 사용자 우선) | 사내 적용 직접 검증 + scale/domain-cross + sub-rule 강화 | PoC #06+#07+**#11** = 3 사내 PoC isomorphic | C-v2.2.0-spring41-ibatis2-subrule resolve trigger |
| **본 방법론 일반화 axis** (★ ~~paradigm-cross corroboration / Senior STOP~~ → ★ ADR-CHAIN-008 정책 완화) | 여러 ORM/프레임워크 동작 입증 | PoC #08 + PoC #09 + PoC #10 (★ 5 PoC isomorphic / 모두 MEDIUM 측정) | ✅ resolved (★ ★ MEDIUM × 5 PoC isomorphic = strong 자격 / v2.2.0 final 격상 trigger 활성) |

★ ★ ★ 사용자 결단 = "우선 순위 대로 다 진행". paradigm-cross corroboration carry C-v2.2.0-6 = ★ 분해 (3 PoC 단계화) — ★ ★ ★ ★ ★ **ADR-CHAIN-008 (2026-05-08) 채택 후 모두 resolved / historical 기록 보존**:

| 우선순위 | PoC | stack | 14d cap | paradigm 거리 (vs iBATIS 2 XML) | 사내 정합 | trigger 자격 | ★ resolved 상태 |
|---|---|---|---|---|---|---|---|
| #1 | **PoC #08** | **MyBatis 3 XML** (★ ★ source = `mybatis/jpetstore-6` ★ Spring 6.2.18 + Stripes 1.6.0 + MyBatis 3.5.19 + Java 17 + Test 17 classes / 7 mapper / 25 SQL / pet store 4 BC) | 14d | ★★ medium (XML continuity 5/6 reuse / iBATIS 2 evolved tag 부재 + annotation 별도) | ❌ (★ ★ 사용자 정정 2026-05-07: 사내 = iBATIS 2 단일 / MyBatis ❌) | ★ ★ ★ MEDIUM corroboration (★ ★ 정탐 흡수 weak → medium 강화 / standard-MyBatis floor 입증 / evolved-tag ceiling + annotation paradigm 입증 ❌ 솔직) | ✅ Day 1~3.5 종결 (commit `da1a0ab`) |
| #2 | **PoC #09** | **TypeORM raw SQL** (TS / Node.js / `query()` + `createQueryBuilder()`) | 14d | ★★★ 강 (Java→TS / paradigm + platform-cross) | ❌ (사내 ❌) | ★ ~~paradigm-cross 자격 ★ 강~~ → ★ ★ ★ MEDIUM 측정 (raw query() OSS 부재 정탐 사실 정합) | ✅ Day 1~3.5 종결 (commit `2af3772`) / raw query() strong ❌ 솔직 |
| #3 | PoC #10 | Spring Data JPA method name derived (★ reframe / DSL builder QueryDSL ❌) | 14d | ★★ 중간 | ❓ | ★ ★ ★ MEDIUM corroboration / ~~v2.3.0 minor trigger~~ | ✅ Day 1~3.5 종결 (commit `759cdf1`) / v2.3.0 minor trigger ❌ |

→ ~~v2.2.0 final 격상 = PoC #08 + PoC #09 둘 다 종결 후~~ → ★ ★ ★ ★ ★ ADR-CHAIN-008 채택 (2026-05-08) — **5 PoC + 2 정탐 사실 + 6 차원 corroboration sum = MEDIUM × ≥ 5 PoC isomorphic = strong 자격 충족** 신정책 → ~~v2.2.0 final 격상 trigger 활성 (cooling-off 7d minimum 후 2026-05-15+ 별도 결단)~~ ✅ **resolved 2026-05-08** — cooling-off 영구 폐기 (commit `f78be2b`) + v2.2.0 MINOR FINAL release (commit `8941726` / git tag `v2.2.0` / DEC-2026-05-08-v2.2.0-final).

**개별 carry 분해 (★ historical 기록 / ADR-CHAIN-008 채택 후 모두 resolved)**:
- ~~C-v2.2.0-6a~~ ✅ resolved (PoC #08 종결 / MEDIUM × 5 PoC 합산)
- ~~C-v2.2.0-6b~~ ✅ resolved (PoC #09 종결 / raw query() strong ❌ → MEDIUM × 5 PoC 합산)
- ~~C-v2.2.0-6c~~ ✅ resolved (PoC #10 종결 / DSL builder QueryDSL OSS 부재 정탐 사실)
- ~~C-paradigm-cross-strong-raw-sql~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책)
- ~~C-paradigm-cross-DSL-builder-querydsl~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책)
- ~~C-ADR-2026-OSS-paradigm-reality~~ ✅ resolved (ADR-CHAIN-008 채택)

**진입 정책**:
- ~~7d minimum cooling-off (2026-05-08 ~ 2026-05-15)~~ ✅ ★ ★ ★ ★ ★ **폐기** (DEC-2026-05-08-cooling-off-7d-폐기 / 사용자 결단 "패기해줘" / ADR-CHAIN-008 absorption + D 검증 4종 ✅ + carry burst 0 + npm test 280 pass = ★ Senior F4 검증대 통과 / DEC-2026-05-06-cooling-off-정책-폐기 정합 강화)
- ~~★ ★ ★ ★ ★ **v2.2.0 final 격상 = ★ 즉시 진행 자격 ★ 활성** (★ 사용자 별도 결단 의뢰 의무 잔존)~~ ✅ **resolved 2026-05-08** — commit `8941726` / git tag `v2.2.0` / DEC-2026-05-08-v2.2.0-final 종결
- ★ 각 PoC = 별도 session + plan/research + 사용자 정식 결단 (4원칙 1~3원칙)
- ★ ★ PoC #08 사용자 confirm 2건 ★ resolved (2026-05-07): (i) 사내 양식 = ★ source 자체로 자동 처리 (jpetstore-6 = XML 위주) (ii) source = ★ (b) `mybatis/jpetstore-6` 공식 reference webapp
- ★ ★ ★ 사용자 정정 (2026-05-07): "MyBatis 는 내가 잘못 넣은 것 같다" → 사내 = iBATIS 2 단일 / MyBatis ❌ → PoC #08 사내 정합 ❌ / 본 방법론 일반화 자격 입증 용 + sub-rule 자격 + weak corroboration
- ~~v2.2.0 final 격상 timing (PoC #08 + PoC #09 합산 / 또는 PoC #09 단독 / 또는 v3.0 일괄) = PoC #08 종결 시점 사용자 결단~~ ✅ **resolved 2026-05-08** — ADR-CHAIN-008 채택 후 5 PoC (#06+#07+#08+#09+#10) 합산 자격 충족 → v2.2.0 MINOR FINAL 격상 (commit `8941726`)

**Day 0~3.5 종결 — PoC #08 (jpetstore-6) ★ ★ ★ ★ 정식 등재 + 종결 (2026-05-07~08)**:
- ✅ Day 0 (commit `a27dfb0`) — DEC prelim + skeleton
- ✅ Day 0.5 (commit `a60404c`) — plan 2차 + research 자산화 (★ 3 sub-agent 병렬 정탐)
- ✅ Day 1 (commit `6d96218`) — 보류 해제 + source clone (141 files) + analysis 4종 (8 BR + 19 UC + 8 AP)
- ✅ **Day 1.5~3.5 (★ 본 session 종결)** — sql-inventory 11 컬럼 (25 SQL × 0 findings / 66.7%) + phase 4.7 (6 snapshot + intent-vs-bug + coverage / 100%) + D2.5 결단 + chain 1 planning-spec (UC 100% / 0 findings) + ratchet baseline write + REPORT + DEC 종결
- ★ ★ ★ ★ **4축 모두 pass**:
  - §3-A 자동화율 = **66.7%** (+27.9%p vs PoC #06 / R2 가설 입증)
  - §3-B chain 1 UC **100%** + 0 findings
  - phase 4.7 oracle = **16/16 = 100%** (D2 즉시 / D2.5 변동 없이 유지)
  - SQL Inventory = **4/6 = 66.7%** (★ ★ 3 PoC isomorphic / paradigm shift robust)
- ★ ★ ★ paradigm-cross corroboration #1 MEDIUM 자격 사실 확보 = standard-MyBatis floor 입증 / evolved-tag ceiling + annotation paradigm 입증 ❌ 솔직 (non-isomorphic in the hard direction)
- ★ AP isomorphic 5 (Anemic 2 + N+1 2 + HashMap) + novel 3 (★ critical 평문 password + Stripes convention + 자체 sequence)
- ★ SATD 0건 (Modern OSS reference 정합 / vs PoC #07 11 SATD)
- ★ ★ DEC-CHAIN-006 §2 "spectrum 4번째 적용 강화" (Modern + Stripes paradigm)
- ★ ★ ★ **본체 격상 ❌** (§8.1 strict / paradigm-cross strong 의무 = PoC #09 TypeORM raw SQL ★ 핵심)
- carry resolved 3 + 잔존 4 + 신규 3
- DEC-2026-05-07-poc-08-종결.md 등재

**Day 0 진입 (★ 본 session 2026-05-07) — PoC #11 (EFI-WEB billing) ★ 우선**:
- ✅ DEC prelim — `decisions/DEC-2026-05-07-poc-11-prelim-신설.md` (★ 사용자 결단 (α) 정합)
- ✅ skeleton — `examples/poc-11-efiweb-billing-spring41/{source,input,sql-inventory,characterization}/` + README
- ✅ plan 1차 — `~/.claude/plans/d-poc-11-billing.md`
- ⏳ Day 0.5~ = 별도 session 첫 진입 — ★ ★ **사용자 source 위임 의무** (billing 모듈 ~257 LOC) + plan 2차 + 4원칙 3원칙 승인 → Day 1 진입
- ⏳ Day 1~3.5 = ★ 14~18h (~2~3일 실측 / 14d cap ★ 충분 여유)

**★ 정탐 결과 흡수** (★ ★ paradigm-cross weak → MEDIUM 강화 + 신규 carry 4건):
- §3-A 자동화율 expectation: **62~72%** (PoC #06 38.75% / #07 53.8% 대비 ↑↑)
- SQL Inventory coverage expectation: **75~83%** (66.7% baseline ↑ / statementType 11번째 default-injection + namespace FQCN 100% + dynamic_branches `<bind>` extractable)
- phase 4.7 named_classified_ratio expectation: 88~95% Day 1 / 100% 가능 (★ ★ pet store CRUD trivially deterministic / D2 trivially empty risk = oracle 신호 약화 의무 명시)
- 적대성 5축: PoC #06+#07 baseline ★ ↓↓ (Spring 6 modern / MyBatis 3 standard / Test 17 / 다중책임 4 BC)
- ★ ★ 신규 risks: (a) Stripes framework drag (예상 외 / `@HandlesEvent` + `@UrlBinding` ≠ Spring `@Controller` / +1~2d) (b) Domain ambiguity-deficit (★ phase 4.7 oracle 신호 약화 risk)
- ★ 신규 carry 4건: C-poc-08-{stripes-adapter, mybatis3-schema-gap, domain-ambiguity-deficit, chain3-retrofit}

---

**★ PoC #07 정식 등재 + Day 3.5 종결** (2026-05-08 / DEC-2026-05-08-poc-07-종결 / EFI-WEB capital 모듈 다중책임 chain 1 측정 / 4축 모두 pass)

**v2.1.1 PATCH release** (2026-05-07 / DEC-2026-05-07-v2.1.1-ratchet-trend / phase 4.7 ratchet trend baseline 자동 검증 / C-v2.1.0-5 carry resolved / `_shared/baseline.js` coverageTrendCheck 신설 + characterization-coverage-validator `--coverage-baseline` + `--write-coverage-baseline` flag + 4 unit test / unit test 228 → **232** / §8.1 strict 7/7 ✅ / 3 source version sync v2.1.1 / build `ai-native-methodology-v2.1.1/` 264 files / git tag v2.1.1 / chain harness 5 요소 변경 ❌ / 본체 schema 변경 ❌ / **carry 잔존: C-v2.1.0-1~4, 6~7** / ★ ratchet trend production 첫 사용 = PoC #07 capital `.aimd/baseline/characterization-coverage.json` 2026-05-08)

**★ ★ ★ ★ PoC #07 정식 등재 + 종결** (2026-05-08 / DEC-2026-05-08-poc-07-종결 / EFI-WEB capital 모듈 / Spring 4.1 + iBATIS 2 + JSP / **3752 Java LOC + 1757 sqlmap LOC + 87 endpoint + 71 SQL operations** / 다중책임)

**4축 측정 결과 (사용자 D10 = 3/4 pass + 미달 1축 carry / 실제 = 4/4 pass)**:

| 축 | metric | PoC #06 baseline | **PoC #07 측정** | 자격 |
|---|---|---|---|---|
| §3-A 자동화율 | 평균 auto_ratio | 38.75% | **53.8%** (+15%p) | ✅ pass (in range 50% ± 10%p) |
| §3-B 설계 자동화율 | planning-extraction-validator | (없음) | **0 findings / UC coverage 94.1%** | ✅ pass |
| phase 4.7 acceptance oracle | named_classified_ratio | 94% (D2 후) | **87.5% Day 2 / 100% Day 2.5** | ✅ pass (≥ 80%) |
| ★ SQL Inventory coverage | auto extraction ratio | 66.7% (PoC #06 retrofit) | **66.7%** (corroboration #2 isomorphic) | ✅ pass (≥ 50%) |

**★ ★ ★ phase 4.7 두 번째 적용 — 단일 prompt 양 spectrum 동작 입증 강화 (3 spectrum)**:

| spectrum | named_classified_ratio (D2.5 후) |
|---|---|
| Modern (PoC #03 NestJS retrofit) | 30/30 = 100% |
| Legacy 단일책임 (PoC #06 exchange) | 17/18 = 94% |
| **Legacy 다중책임 (PoC #07 capital)** | **27/27 = 100%** |

→ ★ ★ ★ ★ ★ DEC-CHAIN-006 §결정 §2 "단일 prompt 양 spectrum 동작" 정합 강화.

**★ ★ ★ SQL Inventory ≥ 2 PoC isomorphic 자격 충족 (★ v2.2.0 본체 격상 trigger 자격)**:

| metric | corroboration #1 (PoC #06) | corroboration #2 (PoC #07) | 정합 |
|---|---|---|---|
| 외부 6 컬럼 자동화 | 4/6 = 66.7% | 4/6 = 66.7% | ★ scale 무관 isomorphic |
| 본 추가 4 컬럼 + patterns_extension_v2 | ✅ | ✅ | ✅ schema isomorphic |
| AP-{X}-011/012 신규 등재 | AP-EXCHANGE-011 (0건) | AP-CAPITAL-012 (0건) | ★ ★ Spring 4.1 + iBATIS 2 spectrum 공통 |

**carry 신규 (★ ★ v2.2.0 본체 격상 trigger 자격 충족 / ≥ 2 PoC isomorphic)**:
- ~~**C-v2.2.0-sql-inventory** — `methodology-spec/deliverables/24-sql-inventory.md` 신설~~ ✅ **resolved 2026-05-08** (v2.2.0-rc1 commit `f64e0b2`)
- ~~**C-v2.2.0-sql-schema** — `schemas/sql-inventory.schema.json` 신설~~ ✅ **resolved 2026-05-08** (v2.2.0-rc1 commit `f64e0b2` / 31번째 schema)
- ~~**C-v2.2.0-sql-tool** — `tools/sql-inventory-extractor/` 신설 (workspace 14번째)~~ ✅ **resolved 2026-05-08** (v2.2.0-rc1 commit `e4b0143` / 10 unit test)
- C-v2.2.0-spring41-ibatis2-subrule (≥ 2 PoC corroboration 자격 충족 / PoC #11 종결 후 trigger)
- C-v2.2.0-phase-4-7-multiresponsibility-subrule (단일 PoC / ≥ 2 다중책임 PoC 후 trigger)
- C-domain-PoC07-1~3 (도메인 expert IFRS 회계 담당자 재검증)
- C-PoC07-1~3 (chain 3 영역 — Testcontainers / MockMvc / DBUnit)

**carry resolved (2026-05-07 / C9 closure)**:
- ~~C-v2.2.0-9~~ "Why not AWS SCT" 차별화 절 → ✅ rc1 시점 deliverable §1.2 4 도구 비교 표 + Big-tech 입증 흡수 완료 (★ trigger "v2.2.0 final 시" 사실상 implicit 처리 완료 / 추가 보강 ❌)

**★ ★ ★ ★ ★ carry resolved (2026-05-08 / ADR-CHAIN-008 채택 후 4건)**:
- ~~C-v2.2.0-6~~ ✅ resolved (★ Modern ORM PoC #08+#09+#10 종결 + 5 PoC isomorphic 합산 / paradigm-cross MEDIUM 자격 충족)
- ~~C-paradigm-cross-strong-raw-sql~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책 / 2026년 OSS 부재 사실 정탐)
- ~~C-paradigm-cross-DSL-builder-querydsl~~ ✅ obsolete (ADR-CHAIN-008 §1 신정책 / 2026년 OSS 부재 사실 정탐)
- ~~C-ADR-2026-OSS-paradigm-reality~~ ✅ resolved (ADR-CHAIN-008 채택)

**★ ratchet baseline write 첫 진입** — `examples/poc-07-efiweb-capital-spring41/.aimd/baseline/characterization-coverage.json` (coverage_strategy: ratchet / coverage_ratio: 0.4375 / v2.1.1 PATCH production 첫 사용 케이스).

**no release / no tag** — D11 (b) ≥ 2 PoC isomorphic 후 v2.2.0 본체 격상 별도 plan + 사용자 결단.



**v2.1.0 MINOR release** (2026-05-07 / 같은 날 — DEC-2026-05-07-v2.1.0-release / phase 4.7 (characterization) 본체 격상 / 의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle / ADR-CHAIN-006 / ≥ 2 PoC corroboration (PoC #06 Spring 4.1 Legacy 17/18=94% + PoC #03 NestJS Modern retrofit 30/30=100%) / 본체 자산 6 + workflow + ADR / unit test 218 → 228 (+10 / characterization-coverage-validator 신설 workspace 13번째) / Senior cooling-off (a) 즉시 final / chain harness 5 요소 변경 ❌ — analysis stage 내부 phase 추가만)

**v2.0.0 MAJOR FINAL release** ¹ (2026-05-07 / 같은 날 — DEC-2026-05-07-v2.0.0-final / chain harness validated 정식 / git tag v2.0.0 / clean clone 재실행 통과 / Senior F4 24h+ cooling-off 통과 / chain 1 planning-spec → chain 2 behavior-spec + acceptance-criteria + 7대 통합 → chain 3 test-spec + 실 test (RED) → chain 4 impl-spec + 실 impl (GREEN / 100% test pass) / 4 gate + revisit loop + ★ ★ ★ chain-driver mechanical enforcement / 218 unit test pass / §8.1 strict 7/7 ✅ / 3 PoC corroboration ✅ / cleanup round 1 + 2-A ~ 2-E 모두 종결 (327 → 256 files / paradigm v2.0.0 정합))

> ¹ ★ ★ ★ **호칭 전환** (DEC-2026-05-06-sub-plan-6-종결 / 2026-05-06): 현 단계 = **chain harness validated** — §8.1 strict 7/7 + ≥ 2 PoC corroboration. sub-plan-1~4 = scaffolding / sub-5 = harness-complete / sub-6 = harness-validated. v2.0.0-rc1 prerelease (Senior F4 / 24h+ 후 final / 같은 날 final tag ❌).

## ★ ★ ★ v2.0 진행 (sub-plan 6 sprint)

| Sprint | Sub-plan | 산출 | 상태 |
|---|---|---|---|
| M+1 | sub-plan-1 (scope) | DEC 3 + lifecycle-contract / CLAUDE.md / skills-axis / agents / STATUS / INDEX | ✅ commit `b466e51` |
| M+2 | sub-plan-2 (schemas + deliverables + ADR) | 6 schema + 6 deliverable + 3 신규 ADR + 3 ADR v2 + UC-* 통일 | ✅ commit `811ea45` |
| **M+3a** | **sub-plan-3a (chain validator + workspace)** | 4 신규 chain validator + 기존 6 도구 chain 모드 확장 + npm workspace + chain-check.yml + ADR-CHAIN-004 + ★ ★ **110 unit test pass** | ✅ DEC-2026-05-06-sub-plan-3a-종결 |
| **M+3b** | **sub-plan-3b (test-impl-pass-validator)** | ★ ★ ★ test-impl-pass-validator 신설 (5 framework adapter / result_hash SARIF Appendix F / --allow-execute / flaky retry / 25 unit test) + test-cmd.schema 신설 + flaky_retries_count schema 보강 + chain-check.yml gate #3-4 활성 + workspace **135 unit test pass** | ✅ DEC-2026-05-06-sub-plan-3b-종결 |
| **M+4** | **sub-plan-4 (skills + flows)** | ★ ★ ★ 13 chain skill 신설 (_base 2 + planning 3 + spec 3 + test 3 + implement 2 / skills/spec 신규 디렉토리) + 4 chain stage flow ({planning,spec,test,implement}.phase-flow.{json,mermaid}) + ★ ★ ★ flows/sdlc-4stage-flow.{json,mermaid} (master plan SSOT — stages + revisit_edges + 4 gate + cross_cutting + release_eligibility) + agents 4 README placeholder → 정식 채움 ✅ + drift-validator `--check-chain-layout` flag + 3 신규 unit test (★ 4 stages / 26 phases / 13 skills / 0 orphans) + workspace **138 unit test pass** | ✅ DEC-2026-05-06-sub-plan-4-종결 |
| **M+5** | **sub-plan-5 (chain harness driver — 호칭 자격 확보)** | ★ ★ ★ ★ ★ 5 요소 모두 본격 구현 — tools/chain-driver/ workspace 12번째 + schemas/state.schema.json + intervention-log.schema.json + ADR-CHAIN-005 + hooks/hooks.json + flows/sdlc-4stage-flow.json `harness_status`: scaffolding → harness-complete + workspace **198 unit test pass**. | ✅ DEC-2026-05-06-sub-plan-5-종결 |
| **M+6** | **sub-plan-6 (PoC + §8.1 strict + v2.0.0-rc1 prerelease)** | ★ ★ ★ ★ ★ PoC #05 sample-user-register e2e (vitest 6/6 GREEN) + PoC #03 NestJS retrofit (chain 1~3 RED dry-run) + scripts/release-readiness.js (§8.1 7/7 자동 검사 + 9 self-test) + drift `--check-state-flow-consistency` + MIGRATION-v1-to-v2.md + version 1.5.0 → 2.0.0-rc1 + flows harness_status: harness-complete → **harness-validated** + workspace **210 test** (201 + 9 release-readiness). | ✅ DEC-2026-05-06-sub-plan-6-종결 |

## ★ ★ ★ ★ v2.1.0 MINOR release (2026-05-07 / 같은 날 v2.0.0 final 후)

DEC-2026-05-07-v2.1.0-release.

★ ★ phase 4.7 (characterization) 본체 격상. ≥ 2 PoC corroboration 사실 확보 (PoC #06 Spring 4.1 Legacy + PoC #03 NestJS Modern retrofit) → 본체 6 자산 + workflow + ADR 격상.

| 검증 항목 | 결과 |
|---|---|
| `npm test --workspaces` 219 pass / 0 fail (★ +10 vs v2.0.0) | ✅ characterization-coverage-validator 10 신설 / drift-validator 47 변경 없음 / phase 4.7 entry 자동 인식 |
| release-readiness §8.1 strict 7/7 (target v2.1.0) | ✅ "v2.1.0 = release-ready" |
| version-check 3 source sync at v2.1.0 | ✅ plugin.json + package.json + CHANGELOG |
| build dist `ai-native-methodology-v2.1.0/` | ✅ 264 files / shasum 263 OK |
| chain harness 5 요소 변경 ❌ | ✅ analysis stage 내부 phase 추가만 |

**v2.1.0 본체 격상 자산 (6 + 1 workflow + 1 ADR)**:
1. ✅ `methodology-spec/deliverables/23-characterization-spec.md` (★ #16~22 사용 중 / 23 신규)
2. ✅ `schemas/characterization-spec.schema.json` (★ 30번째 schema)
3. ✅ `schemas/meta-confidence.schema.json` `inputs_used` enum 12 → 13 (`characterization` 추가)
4. ✅ `skills/analysis/phase-4-7-characterization/SKILL.md` (★ skills 19 → 20)
5. ✅ `tools/characterization-coverage-validator/` (★ workspace 13번째 / 10 unit test)
6. ✅ `flows/analysis.phase-flow.{json,mermaid}` v1.5.0 → v2.1.0 (phase 4.7 entry + 5-x depends_on 갱신)
7. ✅ `methodology-spec/workflow/phase-4-7-characterization.md` (drift-validator 3-way 회귀 통과)
8. ✅ `docs/adr/ADR-CHAIN-006-phase-4-7-characterization.md` (4 정책 명문화)

**release commit cadence (C1~C7)**:
- C1 (`21d0e4f`) — deliverable + schema + meta-confidence
- C2 (`8a48fb7`) — skill
- C3 (`0209381`) — tool + 10 unit test + workspace 13번째
- C4+5 (`eb4f0e2`) — flow + ADR + workflow + version + CHANGELOG
- C6 (현재) — DEC + STATUS + INDEX
- C7 — git tag `v2.1.0`

**v2.1.x patch trigger (Senior F7 정합)**: release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3건 / 사용자 finding burst.

**Carry (v2.1.x patch / v2.x)**:

| ID | 항목 | trigger |
|---|---|---|
| C-v2.1.0-1 | snapshot Gherkin (.feature) 변환 출력 | v2.1.x patch / 사용자 finding |
| C-v2.1.0-2 | Modern 환경 명확 비율 ≥ 95% 자동 detect | v2.2+ |
| C-v2.1.0-3 | acceptance oracle threshold dashboard | v2.x |
| C-v2.1.0-4 | F-PHASE7-001~004 일반화 검토 (≥ 3 PoC corroboration 후) | ≥ 3 PoC corroboration |
| C-v2.1.0-5 | ratchet `trend_required=true` 자동 검증 (baseline.js 통합) | v2.1.x patch |
| C-v2.1.0-6 | ts-morph + 실 환경 (DB) snapshot 자동 추출 | v2.x |
| C-v2.1.0-7 | sub-rule 추가 (Spring Boot 3 / FastAPI / Express 등 다른 spectrum) | 사용자 PoC corroboration |

---

## ★ ★ ★ ★ ★ ★ v2.0.0 MAJOR FINAL release (2026-05-07)

DEC-2026-05-07-v2.0.0-final.

| 검증 항목 | 결과 |
|---|---|
| clean clone 추출 (`/tmp/aimd-clean-clone.*/`) | ✅ git archive |
| `npm install` (12 workspace) | ✅ 83 packages / 0 vulnerabilities |
| `version-check` (3 source) | ✅ all v2.0.0-rc1 → v2.0.0 |
| `npm test` 218 pass | ✅ chain-driver 68 + 그 외 |
| `release:check --target v2.0.0` (clean clone) | ✅ §8.1 strict **7/7** / "release-ready" |
| PoC #05 vitest e2e | ✅ **6/6 GREEN** |
| Senior F4 24h+ cooling-off | ✅ rc1 (2026-05-06) → final (2026-05-07) |
| 본체 환경 release:check 재검증 | ✅ 7/7 |
| build dist | ✅ 256 files / shasum 255 OK / `dist/ai-native-methodology-v2.0.0/` |

**v2.0.0 final 자격 7/7**:
1. ✅ chain harness 5 요소 enforcement (sub-plan-5)
2. ✅ ≥ 2 PoC corroboration (3 = poc-03 + poc-04 + poc-05)
3. ✅ §8.1 strict 7/7
4. ✅ 218 unit test pass
5. ✅ clean clone 재실행 통과
6. ✅ Senior F4 24h+ cooling-off
7. ✅ cleanup round 1 ~ 2-E 모두 종결

**git tag**: `v2.0.0` ★ 의무.

**v2.0.0 → v2.0.x patch trigger** (Senior F7 정합):
- release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3건 / 사용자 finding burst

---

## ★ cleanup round 2-E (2026-05-06) — build artifact path 정합

DEC-2026-05-06-cleanup-round-2-E.

`dist/internal-v<version>/` → **`dist/ai-native-methodology-v<version>/`** (사용자 명시 결단 / v1.4.3 시점 prefix 가 v2.0 paradigm + plugin user 환경 path 와 stale).

| 영역 | before | after |
|---|---|---|
| build artifact path | `dist/internal-v2.0.0-rc1/` | `dist/ai-native-methodology-v2.0.0-rc1/` |
| plugin user 환경 path 정합 | ❌ | ✅ (`~/claude-plugins/ai-native-methodology-v<version>/` 일치) |
| dist file count | 256 | 256 (변경 0 / path rename) |
| shasum | — | 255 OK |

7 자산 갱신 (build-plugin.js + README + guides/common-errors + templates/adoption/CLAUDE + templates/README + project root CLAUDE) / historical (archive + DEC + CHANGELOG entry) 보존.

★ no release / no tag / v2.0.0 final 자격 영향 ❌.

---

## ★ ★ ★ cleanup round 2-C / 2-D (2026-05-06) — journey 자산 + project root sync (★ cleanup round 2 series 종결)

DEC-2026-05-06-cleanup-round-2-C-D.

**Round 2-C — guides/ 디렉토리 신설 (5 file)**:

| 자산 | 의도 |
|---|---|
| `guides/getting-started.md` | install 직후 첫 100 line / 시나리오 A/B/C + 10분 walkthrough |
| `guides/chain-harness-guide.md` | chain-driver mental model + state.json + mechanical gate trio + revisit detector |
| `guides/common-errors.md` | FAQ 14건 (install / hook / version / state.blocked / RED-GREEN / build / prompt) |
| `guides/first-prompt-cookbook.md` | 자연어 → skill 34 매핑 |
| `guides/README.md` | 4 자산 navigation + 호출 cadence |

★ build-plugin.js INCLUDE 에 'guides' 추가.

**Round 2-D — project root CLAUDE.md sync**:
- v1.4.3 → v2.0.0-rc1 라벨
- guides/ 항목 추가 (LLM 자동 컨텍스트 / dist 미포함)

**dist file count**: 251 → **256** (+5) / shasum 255 OK.

**cleanup round 2 series 종결**:

| Round | commit | 핵심 |
|---|---|---|
| 1 | `80cb783` | docs/ 9 archive 격리 |
| 2-A | `b25a8ad` | paradigm sync (327 → 241) |
| 2-B | `307f55b` | 10 신설 (사용자 진짜 핵심) |
| 2-B 후속 | `8b7effe` | 9 도구 표준화 + 10 placeholder + schemas/README |
| **2-C / 2-D** | (현재) | **journey 자산 4 + project root sync** |

사용자 진짜 의도 ("정돈 + 각 폴더 visible + journey friction 해소") 모두 정합.

**Carry (v2.1+)**:
- v1.4.0-dev 3 entry CHANGELOG-HISTORY 추가 격리 (CHANGELOG 1060 → ~700 line)
- guides 보강 (사용자 finding 등재 후)
- chain-harness-guide RED→GREEN mermaid 시각화
- v2.0.0 final tag (2026-05-07~ + clean clone PoC #05 e2e 재실행 통과)

★ no release / no tag / v2.0.0 final 자격 영향 ❌.

---

## ★ ★ cleanup round 2-B 후속 (2026-05-06) — 9 도구 표준화 + 10 placeholder 정돈 + schemas/README 갱신

DEC-2026-05-06-cleanup-round-2-B-followup.

| 영역 | 처리 |
|---|---|
| 9 도구 README 표준 schema 통일 | Purpose / When / In / Out / Exit / Siblings / 참조 (cleanup round 2-B 신설 4 도구 README 와 동일 형식) |
| 10 placeholder README 정돈 | (1) skills/{test,planning,implement} 활성 채움 / (2) skills/design + agents/design + templates/design = v2.x carry / (3) agents/analysis 활성 + templates/{test,planning,implement} lifecycle 정합 |
| schemas/README 갱신 | 11 → **29 schema** (chain v2 6 + state 3 + BE 5 + FE 8 + cross-cutting 4 + 메타 + 유틸) / 5종 물증 if/then 의무 + Ajv 8 strict mode |
| dist file count | 251 (변경 없음 / 모두 갱신) |
| 변경 file 수 | 20 (9 tool + 10 placeholder + 1 schemas/README) |
| Sibling cross-link 그래프 | ★ 각 도구 README 4+ sibling 명시 |

stale 메시지 제거 ("v1.4.x analysis only" / "v2.0+ scope" → v2.0.0-rc1 chain harness validated 정합).

**Carry (Round 2-C / 2-D)**:
- 2-C: 사용자 journey 자산 신설 (getting-started / chain-harness-guide / common-errors / first-prompt-cookbook)
- 2-D: project root CLAUDE.md sync + v1.4.0-dev 3 entry CHANGELOG-HISTORY 추가 격리 검토

★ no release / no tag / v2.0.0-rc1 → final 자격 영향 ❌.

---

## ★ ★ ★ cleanup round 2-B (2026-05-06) — 각 폴더 README 정돈 / 사용자 진짜 핵심

DEC-2026-05-06-cleanup-round-2-B.

| 영역 | before | after |
|---|---|---|
| dist files | 241 | **251** (+10 신설) |
| 부재 폴더 README | 6 | 0 (★ 모두 채움) |
| 부재 도구 README | 4 | 0 (★ 모두 채움) |
| 도달 path "각 폴더 자산 어떻게 정돈?" | ❌ | ✅ |
| 도달 path "어디서 참조됨?" | ❌ | ✅ (각 README "참조" / "Sibling" 섹션) |
| 도달 path "언제 호출됨?" | ❌ | ✅ (각 README "When to call" / "호출 cadence") |

**6 폴더 README 신설**: tools/ (★ 12 도구 cadence table) / methodology-spec/ (★ phase × deliverable × schema 매트릭스) / agents/ / skills/ / hooks/ / templates/

**4 도구 README 신설**: chain-driver/ (★ 5 요소 enforcement) / _shared/ / schema-validator/ / test-impl-pass-validator/ (★ no-simulation 핵심)

표준 schema 통일 = Purpose / When / In / Out / Exit / Siblings / 참조.

**Carry (Round 2-B 후속 + 2-C / 2-D)**:
- Round 2-B 후속: 9 도구 README 표준 schema 통일 + 10 placeholder (agents/{design,analysis} + skills/{design,test,planning,implement} + templates/{design,test,planning,implement}) 정돈 + schemas/README 갱신 검토
- Round 2-C: 사용자 journey 자산 신설 (getting-started / chain-harness-guide / common-errors / first-prompt-cookbook)
- Round 2-D: project root CLAUDE.md sync

★ no release / no tag / v2.0.0 final 자격 영향 ❌.

---

## ★ ★ ★ cleanup round 2-A (2026-05-06) — plugin artifact paradigm sync + 자산 정돈

DEC-2026-05-06-cleanup-round-2-A.

| 영역 | before | after |
|---|---|---|
| dist files | 327 | **241** (-86 / -26%) |
| paradigm version (CLAUDE/README/marketplace) | v1.3.0 / v1.4.2 / v1.x stale | ★ all **v2.0.0-rc1** |
| `CHANGELOG.md` | 1865 line | **1060 line** (v1.4+ 만) + `CHANGELOG-HISTORY.md` 820 line (신규) |
| dist 안 test/corpus/fixtures | 80+ files | **0** (workspace developer only) |
| `ADOPTION-README.md` (dist root) | 1 (별칭) | 0 (단일 entry-point 정합) |
| paradigm 명시 | "한 방향 추출기" 만 | chain harness 4 stage + analysis 범위 한정 |

**갱신된 자산** (7 항목 / 1 신규):
- `marketplace.json` — description chain harness 정합
- `templates/adoption/CLAUDE.md` (dist root alias) — v2.0.0-rc1 rewrite (chain 4 stage + 12 도구 + 5 요소 mechanical enforcement + 자연어 prompt → skill 표)
- `README.md` — v2.0.0-rc1 rewrite (시나리오 A/B/C + dist 실제 디렉토리 구조 + 12 도구 호출 cmd)
- `flows/README.md` — sdlc-4stage SSOT 명시
- `scripts/build-plugin.js` — EXCLUDE_BASENAMES + INCLUDE 갱신 + ADOPTION-README 별칭 비활성
- `CHANGELOG.md` — split (v1.4+ 만)
- `CHANGELOG-HISTORY.md` — 신규 (v1.0~v1.3.1 archive)

**검증**: version-check ✅ / build 241 files ✅ / shasum -c 240 OK ✅ / EXCLUDE 0 hit ✅ / INCLUDE 정합 ✅.

**Carry (Round 2-B / 2-C / 2-D)**:
- 2-B (★ ★ 각 폴더 README 정돈) — agents/skills/hooks/flows/tools/templates/methodology-spec/schemas — **사용자 진짜 핵심** "각 폴더 자산 정돈 + 참조 + 호출 visible"
- 2-C (사용자 journey 자산) — getting-started / chain-harness-guide / common-errors / first-prompt-cookbook
- 2-D (선택) — project root CLAUDE.md sync + v1.4.0-dev 3 entry 압축

★ no release / no tag / 본체 commit 만 / v2.0.0-rc1 → v2.0.0 final 자격 영향 ❌.

---

## ★ ★ cleanup round 1 (2026-05-06) — docs/ 9 파일 archive 격리

DEC-2026-05-06-cleanup-round-1.

| 영역 | before | after |
|---|---|---|
| `docs/` | 39 | **30** (-9 archive 이동) |
| `archive/` | 13 | **22** (+9 격리 / `v1.3-adoption/` 6 + `v1.4-evaluation/` 1 + `phase-a-iteration/` 2) |
| 가독성 | 활성 + 폐기 혼재 | 활성만 ★ |

**B 진행 (9 파일 git mv)**:
- `docs/adoption/{README,v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02}.md` (5) → `archive/v1.3-adoption/`
- `docs/v1.3-promotion-report.md` → `archive/v1.3-adoption/`
- `docs/v1.4-evaluation-report.md` → `archive/v1.4-evaluation/`
- `docs/phase-a-iteration-{guide,0-preflight}.md` (2) → `archive/phase-a-iteration/`
- `rmdir docs/adoption/`

**Link rot 차단 (11건 갱신)**: project root `CLAUDE.md` 4 + `README.md` 4 + `STATUS.md` 2 + `flows/README.md` 1 = 활성 hub 옛 경로 → archive 경로.

**Skip per 사용자**:
- A. PoC 진행 로그 17 (PROGRESS / SESSION-WRAPUP) — "poc 쪽은 신경 안써도 됨"
- C. PoC plan-phase 13 — A 와 동상

**Carry (cleanup round 2 / v2.0.0 final 후)**:
- E. 4 hub (CLAUDE / STATUS / CHANGELOG / INDEX) v2.0 정보 3중 누적 통합

★ no release / no tag / 본체 commit 만 / v2.0.0-rc1 → final 자격에 영향 ❌.

---

## ★ ★ ★ ★ ★ sub-plan-6 종결 (2026-05-06) — chain harness validated / v2.0.0-rc1

**§8.1 strict 7/7 통과** (DEC-2026-05-06-sub-plan-6-종결 + release-readiness.js):

```
✅ 1. poc_corroboration: 2 PoC (poc-05 + poc-03 retrofit)
✅ 2. real_tool_evidence: 5종 물증 7 필드 (10 fields) all present / sha256 valid
✅ 3. validators_violation: 4 validators 0 critical/high
✅ 4. chain_coverage: 1.0 / threshold 0.85
✅ 5. adr_registry: 5 ADR-CHAIN status: 승인됨 + 결정 section (content-aware)
✅ 6. matrix_greenness: forward=1 / backward=1 / cells=2 / green=2
✅ 7. e2e_cycle_pass: pass=6 / fail=0 (vitest 1.6.1 chain 4 GREEN)
```

### PoC corroboration (≥ 2)

| PoC | scope | 결과 |
|---|---|---|
| **PoC #05 sample-user-register** (★ corroboration #1 / e2e 단독 책임) | 2 UC + 2 BR + 2 TC + 2 IMPL / vitest 1.6.1 / RED→GREEN | ★ ★ ★ chain 1~4 e2e GREEN / matrix 100% / 5종 물증 정합 |
| **PoC #03 NestJS retrofit** (corroboration #2) | chain 1~2 + chain 3 RED dry-run / signup + login subset | retrofit 정합 / chain 1~3 schema + validator pass |
| **PoC #04 mini FE retrofit** (corroboration #3) | chain 1~2 + chain 3 RED dry-run / PAGE-LOGIN 1 UC subset / Zod | retrofit 정합 / chain 1~3 schema + validator pass / FE 트랙 |
| **★ PoC #06 efiweb-exchange-spring41** (corroboration #4 / 신규 axis — chain 1 + phase 4.7) | chain 1 PASS (validator 0 findings + 100% UC) + ★ phase 4.7 (characterization) 정식 첫 적용 (94% acceptance oracle / D2 후) | ★ ★ 4중 적대성 (Spring 4.1.2 Boot❌ + iBATIS 2 + JSP 248 + 테스트 0) 환경에서 chain 1 + phase 4.7 정합 입증. plan §3-A 38.75% / §3-B 75% 사실 확보. DEC-2026-05-07-poc-06-종결 + DEC-2026-05-07-poc-06-domain-결단. |
| **★ ★ ★ PoC #03 NestJS phase 4.7 retrofit** (corroboration #5 / phase 4.7 ≥2 PoC 충족 #2) | characterization 3 자산 (intent-vs-bug + snapshot signup + coverage) | ★ ★ Modern NestJS spectrum 입증 (30/30 = 100% 명확) — PoC #06 Legacy + PoC #03 Modern 두 spectrum 으로 phase 4.7 v2.1.0 본체 격상 자격 ★ 사실 확보. DEC-2026-05-07-poc-07-poc03-phase7-retrofit. |

### ★ PoC #06 종결 (2026-05-07 / DEC-2026-05-07-poc-06-종결 / prelim → 정식)

EFI-WEB 사내 IFRS 회계 시스템 `smilegate.ifrs.exchange` 모듈 한정 평가. v2.0.0 final release 후 첫 PoC. ★ 신규 axis (적대성 + phase 4.7 corroboration).

| 항목 | 내용 |
|---|---|
| 모듈 | smilegate.ifrs.exchange (345 Java LOC + 130 SQL XML / 7 Controller endpoint / 3 DB 테이블 + 1 함수 + 1 프로시저) |
| 적대성 | 4중 극상 (Spring 4.1.2 Boot❌ + iBATIS 2 + JSP 248 + 테스트 0) — PoC #01~#05 어떤 것보다 검증 스택에서 멂 |
| scope | analysis 4종 + ★ phase 4.7 (characterization / 정식 단계 첫 적용) + chain 1 만 |
| 측정 결과 | (a) §3-A 38.75% (단일책임 정합 / 다중책임 -10%p 가능) (b) §3-B **75% 정합** (validator PASS) (c) **phase 4.7 82% acceptance oracle** |
| 산출 | input 4종 / characterization 5종 (snapshot 3 + coverage + intent-vs-bug) / .aimd/output planning-spec.{json,md} / REPORT-day3-measurement.md / PROGRESS-2026-05-07.md |
| 시간 | 4.5시간 (plan 추정 3~4일 대비 ~5배 빠름) |
| Finding | F-PHASE7-001~004 (phase 4.7 본질) + carry 13종 (C-1~C-13) |
| §8.1 명시 | ★ 본 PoC 1개 결과로 본체 격상 결단 ❌ / phase 4.7 v2.1.0 격상 = ≥2 PoC corroboration 후 (PoC #07 또는 retrofit) |
| 위치 | `examples/poc-06-efiweb-exchange-spring41/` |

### Senior critique (sub-plan-6-research §F) 흡수

- F1 BLOCKER ✅ D25' UC-002 추가 (PoC #05 = 2 UC)
- F2 HIGH ✅ D26' PoC #03 retrofit chain 3 RED dry-run 강제
- F3 HIGH ✅ release-readiness 7 criterion content-aware + 9 self-test (file presence ❌)
- F4 HIGH ✅ D29' v2.0.0-rc1 prerelease / 24h+ 후 final (14차 retract burst 차단)
- F5 HIGH ⏳ sp6-c8 carry (chaos test) — release block ❌
- F6 MED ✅ D27' vitest 채택 (PoC #05 = vitest 1.6.1)
- F7 MED ✅ MIGRATION-v1-to-v2.md + v2.0.1 trigger 명문화

### unit test 회귀 (210 = 201 workspace + 9 release-readiness)

| 영역 | 직전 (sub-plan-5) | 현재 (sub-plan-6) |
|---|---|---|
| drift-validator | 44 | **47** (+3 state-flow) |
| 그 외 10 도구 | 94 | 94 |
| chain-driver | 60 | 60 |
| **workspace 합계** | 198 | **★ 201** |
| release-readiness self-test | — | **9** |
| **총 합계** | 198 | **★ ★ ★ ★ ★ 210** |

### chain harness 호칭 전환 (master plan §H)

| 시점 | 호칭 | 자격 |
|---|---|---|
| sub-plan-1~4 | chain harness scaffolding | 부품 |
| sub-plan-5 | chain harness | 5 요소 코드 enforcement |
| **★ ★ ★ ★ ★ sub-plan-6 (현재) / v2.0.0-rc1** | **chain harness validated** | **§8.1 strict 7/7 + ≥ 2 PoC corroboration** |

### v2.0.0-rc1 → v2.0.0 final 정책 (Senior F4)

- 같은 날 final tag ❌ — 14차 retract pattern 차단
- final = 2026-05-07~ + clean clone 1회 PoC #05 e2e 재실행 통과 시
- v2.0.1 hot-fix trigger: release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3건

### ★ ★ ★ sp6-c4 PoC #04 mini FE retrofit 진행 (2026-05-06 / Senior F7 부분 closure)

- ✅ chain 1~2 + chain 3 RED dry-run (PAGE-LOGIN 1 use case subset / Zod validation BR-FE)
- ✅ schema-validator 4 file ✅ / chain-coverage 0 findings (UC→BHV 100% / BHV→AC 100%)
- ✅ traceability-matrix 1 cell / forward=0% (impl OUT) / backward=100%
- **§8.1 #1 corroboration 3 PoC** 인식 (release-readiness): poc-03 BE retrofit / **poc-04 FE retrofit (신규)** / poc-05 BE e2e
- Senior F7 (v2.0 = BE-only) 부분 closure → "BE e2e + BE retrofit + FE retrofit"
- sp6-c4 carry → resolved (v2.1+ → v2.0.x 안에서 처리)

### ★ ★ ★ sp6-c8 chaos test 진행 (2026-05-06 / Senior F5)

- ✅ **CAS race detection** — writeStateCAS 에 `options.expectedVersion` 추가 (caller-supplied baseline). 진짜 버그 (함수 내부 read 만으로 외부 race 미검출) 발견 + fix.
- ✅ **intervention-log JSONL** single-writer 가정 하 small/large line 정합 입증 (다중 writer = sp6-c6 carry).
- ✅ **interrupted mid-stage recovery** — `recoverTmpFiles` 검증 + `initState` 재실행 거부 + CLI exit 4 surface.
- 8 chaos test 추가 (chain-driver 60 → **68**) / workspace 201 → **209** / total 210 → **218**.
- ★ Senior F5#1 sp6-c8 carry → resolved (release block 부재 / fix in-place / v2.0.0 final 자격 강화).

---

## ★ ★ ★ ★ ★ sub-plan-5 종결 (2026-05-06) — chain harness 호칭 전환

**5 요소 모두 코드 enforcement 도달** (DEC-2026-05-06-sub-plan-5-종결 + ADR-CHAIN-005):

1. ✅ **Driver / Orchestrator** — `tools/chain-driver/` workspace 12번째 (cli + 6 module: state-store / stage-graph / invoke-skill / gate-eval / revisit-detect / hooks-bridge)
2. ✅ **State 영속** — `schemas/state.schema.json` + state-store.js (atomic write tmp+fdatasync+rename / CAS version compare / Windows fallback / lock 5분 stale auto-release / forward-only migration)
3. ✅ **Mechanical gate** — gate-eval.js + cli `next` — trio 차단: (i) state.blocked 영속 / (ii) cli exit 2 + 동일 메시지 / (iii) PreToolUse permissionDecision=deny. Auto Mode 도 critical/high 위반 시 user 'go' 거부.
4. ✅ **자동 전이 (skill auto-invoke)** — hooks/hooks.json (UserPromptSubmit + PreToolUse) → cli `hooks-bridge`. ★ D21' suppressOutput=true + additionalContext 차단 문구 ("LLM SHALL NOT auto-invoke") / stderr only / LLM 컨텍스트 격리.
5. ✅ **Chain-revisit detector** — revisit-detect.js (`git diff --numstat baseline..HEAD` + path-to-chain whitelist 9 pattern + LOC threshold ≥ 5 + revisit_ignore_globs 학습)

### Senior critique (sub-plan-5-research §F) 흡수

- **F1 BLOCKER** ✅ D21 retract → D21' (hooks stdout LLM context 재주입 차단)
- **F2~F5 HIGH** ✅ trio enforcement / state CAS / revisit LOC threshold / forward-only migration
- **F6~F7 MED** ✅ tmp recovery + intervention-log schema / exit code matrix + dry-run
- **F8 MED** ⏳ sp5-c7 carry (drift `--check-state-flow-consistency`)
- **F9~F10 LOW** ✅ module ≤ 250 LOC / hooks-contract.test.js 5 case

### unit test 회귀 (198 / 12 workspace)

| 도구 | 직전 (sub-plan-4) | 현재 (sub-plan-5) |
|---|---|---|
| drift-validator | 44 | 44 |
| decision-table-validator | 11 | 11 |
| formal-spec-link-validator | 15 | 15 |
| static-runner | 16 | 16 |
| schema-validator | 5 | 5 |
| planning-extraction-validator | 5 | 5 |
| chain-coverage-validator | 6 | 6 |
| spec-test-link-validator | 5 | 5 |
| traceability-matrix-builder | 6 | 6 |
| test-impl-pass-validator | 25 | 25 |
| **chain-driver** | — | ★ ★ ★ **60** |
| **합계** | **138** | ★ ★ ★ ★ ★ **198** |

★ master plan §release 자격 80+ → 138 → ★ ★ ★ **198 pass** (sub-plan-5 D24 162+ + Senior F10 165+ 모두 +33 초과 충족).

### no-simulation 정책 강화

- LLM "gate 통과한 척" → trio (i+ii+iii) 봉쇄
- LLM "RED/GREEN 확인한 척" → gate-eval `tests_failed` 자동 검증 (test=0 강제, impl>0 거부)
- LLM "권고 skill 즉시 invoke" → D21' suppressOutput=true + additionalContext 차단 문구로 LLM 컨텍스트 격리

### chain harness 호칭 전환

| 시점 | 호칭 | 자격 |
|---|---|---|
| sub-plan-4 종결 | chain harness scaffolding | 사양 + validator + skills + flows + agents + schemas (부품) |
| **★ ★ ★ sub-plan-5 종결 (현재)** | **chain harness** | **5 요소 모두 코드 enforcement 도달** |
| sub-plan-6 종결 | chain harness validated | + ≥ 2 PoC corroboration / §8.1 strict 7/7 |

### Carry (sub-plan-5)

- sp5-c1 tree-sitter semantic diff (v2.x)
- sp5-c2 다중 사용자 driver state 동시성 (v2.x)
- sp5-c3 hooks 진짜 LLM auto-invoke (v2.x / D21 옵션 B)
- sp5-c4 intervention-log dashboard (sub-plan-6)
- sp5-c5 driver e2e cycle PoC #05 (sub-plan-6)
- sp5-c6 Auto Mode 차단 임계 분포 분석 (sub-plan-6)
- ★ sp5-c7 신설 — drift-validator `--check-state-flow-consistency` (sub-plan-6)

---

## ★ ★ ★ sub-plan-4 종결 (2026-05-06)

**10 항목 모두 통과** (DEC-2026-05-06-sub-plan-4-종결):

1. ✅ 2 _base skills (build-traceability-matrix + invoke-go-stop-gate)
2. ✅ 3 planning skills (extract-from-legacy / decompose-use-cases / identify-business-intent)
3. ✅ 3 spec skills (★ skills/spec/ 신규 디렉토리 / compose-behavior-spec / derive-acceptance-criteria / integrate-7대-deliverables)
4. ✅ 3 test skills (generate-test-spec / run-test-evidence / verify-coverage)
5. ✅ 2 implement skills (generate-impl-spec / verify-test-pass)
6. ✅ agents/{planning,spec,test,implement}/README placeholder → 정식 채움 ✅
7. ✅ 4 chain stage flow ({planning,spec,test,implement}.phase-flow.{json,mermaid})
8. ✅ ★ ★ ★ flows/sdlc-4stage-flow.{json,mermaid} 통합 SSOT (stages + revisit_edges + 4 gate + cross_cutting + release_eligibility)
9. ✅ drift-validator `--check-chain-layout` flag + 3 신규 unit test (★ 4 stages / 26 phases / 13 skills / 0 orphans / 0 missing)
10. ✅ DEC-2026-05-06-sub-plan-4-종결 + STATUS / INDEX 갱신

### unit test 회귀 (138/138 / 11 workspace)

| 도구 | 직전 (3b) | 현재 (sub-plan-4) |
|---|---|---|
| drift-validator | 41 | **44** (+3 chain layout) |
| 그 외 10 도구 | 94 | 94 |
| **합계** | **135** | **★ 138** |

★ master plan H §release 자격 80+ → ★ ★ **138 pass = 73%p 초과 달성**.

### chain stage 운영 인터페이스 정식 등재

| 영역 | 수량 | 위치 |
|---|---|---|
| chain skill | ★ **13** | skills/{_base,planning,spec,test,implement}/ |
| chain stage flow | ★ **4** | flows/{planning,spec,test,implement}.phase-flow.{json,mermaid} |
| master SSOT | ★ **1** | flows/sdlc-4stage-flow.{json,mermaid} |
| chain agent README (정식 채움) | ★ **4** | agents/{planning,spec,test,implement}/README.md |

★ skills-axis chain stage axis 정책 (★ §4 v2.0 신설) 운영 입증 — 디렉토리 분리 ❌ + SKILL.md 본문 분기 + manifest SSOT + drift-validator 자동 회귀.

---

## ★ ★ ★ sub-plan-3b 종결 (2026-05-06)

**9 항목 모두 통과** (DEC-2026-05-06-sub-plan-3b-종결):

1. ✅ test-cmd.schema.json 신설 (★ ADR-CHAIN-004 §1 contract / framework enum 11종 / shell:true ❌ array argument / if/then for `other`)
2. ✅ test-impl-pass-validator skeleton (workspace 11번째 / package.json + bin)
3. ✅ result-hash 정규화 모듈 (SARIF Appendix F / sha256(sorted_test_names + counts + framework) / 7 unit test)
4. ✅ runner adapter 4종 + other (jest/vitest/junit-xml/pytest/other / fixture-based / 10 unit test)
5. ✅ CLI --allow-execute / --dry-run / --timeout / --flaky-retry (8 unit test)
6. ✅ test-spec / impl-spec schema flaky_retries_count 추가 (★ ADR-CHAIN-004 §5)
7. ✅ chain-check.yml gate #3-4 활성 (dry-run only step + strict opt-in step / sub-plan-3a placeholder 교체)
8. ✅ workspace test ★ 110 → **135 pass / 0 fail / 11 workspace** (test-impl-pass-validator +25)
9. ✅ DEC-2026-05-06-sub-plan-3b-종결 등재 + STATUS / INDEX 갱신

### unit test 회귀 (135/135 / 11 workspace)

| 도구 | 직전 (3a) | 현재 (3b) |
|---|---|---|
| drift-validator | 41 | 41 |
| decision-table-validator | 11 | 11 |
| formal-spec-link-validator | 15 | 15 |
| static-runner | 16 | 16 |
| schema-validator | 5 | 5 |
| spectral-runner | 0 (passthrough) | 0 |
| planning-extraction-validator | 5 | 5 |
| chain-coverage-validator | 6 | 6 |
| spec-test-link-validator | 5 | 5 |
| traceability-matrix-builder | 6 | 6 |
| **test-impl-pass-validator** | — | **★ 25** |
| **합계** | **110** | **★ 135** |

★ master plan H §release 자격 80+ → **135 pass = 69%p 초과 달성**.

---

## ★ ★ sub-plan-3a 종결 (2026-05-06)

**9 항목 모두 통과** (DEC-2026-05-06-sub-plan-3a-종결):

1. ✅ npm workspace root (10 도구 단일 workspace / S1)
2. ✅ drift-validator chain 2 corpus 5쌍 신규 (BHV-* state-machine + sequence)
3. ✅ formal-spec-link-validator `--chain-mode` (planning ↔ behavior ↔ acceptance ↔ test ↔ impl backward link + ID pattern)
4. ✅ static-runner lint-no-simulation.sh chain 3/4 evidence 7 필드 + impl-spec source_files commit_hash 의무
5. ✅ schema-validator 6 chain schema 자동 등록 + Ajv 8 if/then 지원 (5 신규 test)
6. ✅ chain-check.yml 별도 워크플로우 (★ S2 / workflow_dispatch only / 4 gate step)
7. ✅ --dry-run 의미 3 조합 명문화 (4 신규 도구 README / S3)
8. ✅ ADR-CHAIN-004 신설 (Test Runner Invocation Contract / Aider 패턴 / 5 정책)
9. ✅ unit test ★ 88 → **110 pass** / 0 fail / 9 workspace (master plan H §release 자격 80+ → 38%p 초과 달성)

### unit test 회귀 (110/110)

| 도구 | 직전 | 현재 |
|---|---|---|
| drift-validator | 36 | 41 |
| decision-table-validator | 11 | 11 |
| formal-spec-link-validator | 8 | 15 |
| static-runner | 11 | 16 |
| schema-validator | 0 | 5 |
| spectral-runner | 0 | 0 (passthrough) |
| planning-extraction-validator | 5 | 5 |
| chain-coverage-validator | 6 | 6 |
| spec-test-link-validator | 5 | 5 |
| traceability-matrix-builder | 6 | 6 |
| **합계** | **88** | **110** |

## ★ ★ sub-plan-3 carry (sub-plan-3b 진입 시)

**사용자 결단 cluster** (sub-plan-3-research.md ★ ★ ★ Senior blocker 3건):
- Blocker 1 (D9 invocation matrix) — ✅ **ADR-CHAIN-004 채택** (Aider 패턴 / `.aimd/config/test-cmd.json` + phase-1-inventory 자동 추론 + override)
- Blocker 2 (test-impl-pass 5 sub-spec) — sub-plan-3b 진입 시점 적용 (Senior + Industry default 모두)
- Blocker 3 (chain-revisit-detector) — **sub-plan-5 (hooks) carry**

### sub-plan-3b carry 항목

| # | 항목 | 비고 |
|---|---|---|
| sp3b-1 | `test-impl-pass-validator` 신규 도구 (★ 진짜 runner / 5종 물증 7 필드 / SARIF 2.1.0 / result_hash 정규화) | ADR-CHAIN-004 §5 정합 |
| sp3b-2 | `schemas/test-cmd.schema.json` 신설 (ADR-CHAIN-004 §1) | — |
| sp3b-3 | `--allow-execute` flag + sandbox 정책 (Senior Blocker 2) | — |
| sp3b-4 | flaky retry policy per-test cap 2 + `flaky_retries_count` 필드 | Playwright 정합 |
| sp3b-5 | coverage threshold 검증 (chain-coverage-validator 책임 분리) | — |
| sp3b-6 | JUnit XML / pytest JSON output adapter | Official research |
| sp3-c1 | mermaid graph view ≥ 100 cell subgraph 분할 정책 | sub-plan-3b 또는 sub-plan-6 |
| sp3-c2 | chain-revisit-detector AI ML 정확도 개선 | v2.x carry |
| sp3-c3 | CI 본격 활성 (PoC #05 데이터 후) | sub-plan-6 |

### commit history (★ 6단계 누적)

`b466e51` (sub-plan-1) → `811ea45` (sub-plan-2) → `ccb3f0a` (sub-plan-3a partial) → `edbdd4d` (sub-plan-3a 종결) → `c364c05` (sub-plan-3b 종결) → 본 commit (sub-plan-4 종결).

## ★ ★ sub-plan-5 진입 prerequisite (★ 다음 sprint)

| # | 항목 | 상태 |
|---|---|---|
| 1 | ADR-CHAIN-001~004 | ✅ 4건 등재 |
| 2 | 7 신규 schema | ✅ 등재 |
| 3 | 11 chain validator | ✅ unit test 138 |
| 4 | chain-check.yml CI infra | ✅ gate #1~#4 모두 step 정의 |
| 5 | 13 chain skill + 5 chain flow + 4 chain agent | ✅ (sub-plan-4) |
| 6 | ★ ★ ★ harness 호칭 자격 정의 (5 요소) | ✅ DEC-2026-05-06-harness-호칭-엄밀화 |

## ★ ★ ★ harness 호칭 단계 (DEC-2026-05-06-harness-호칭-엄밀화 정합)

| 단계 | 정확한 호칭 | 보유 자산 | 상태 |
|---|---|---|---|
| sub-plan-1~4 종결 (현재) | **chain harness scaffolding** | 사양 + validator + skills + flows + agents + schemas | ✅ 도달 |
| sub-plan-5 종결 후 | **chain harness** (정식 호칭) | + driver + state.json + mechanical gate + skill auto-invoke + revisit-detector | 🔜 next |
| sub-plan-6 종결 + v2.0.0 release 후 | **chain harness** (★ §8.1 strict 입증) | + ≥ 2 PoC corroboration + e2e cycle pass | ⏳ |

### 5 요소 (★ harness 엄밀 정의)

| # | 요소 | 의미 | 현 (sub-plan-4) |
|---|---|---|---|
| 1 | Driver / Orchestrator | "지금 stage X" → "skill Y 호출" → "validator 실행" → "gate 평가" → "next/revisit" 자동 loop | ❌ |
| 2 | State 영속 | `.aimd/state.json` 추적 | ❌ |
| 3 | Mechanical gate | gate 미통과 시 다음 stage 차단 (skip 불가) | ❌ |
| 4 | 자동 전이 | 산출물 완성 → validator 자동 → 다음 skill 자동 호출 | ❌ |
| 5 | Chain-revisit detector | impl 변경 → 영향 chain 자동 감지 → 사용자 prompt | ❌ |

### sub-plan-5 carry (hooks + harness)

| # | 항목 | 비고 |
|---|---|---|
| sp5-1 | hooks/hooks.json 확장 (PostToolUse + PreToolUse + UserPromptSubmit) | master plan §B |
| sp5-2 | chain-revisit-detector 구현 (path-to-chain whitelist + 사용자 prompt) | sub-plan-3 carry |
| sp5-3 | go/stop gate UX 입증 (자연어 prompt → skill 매칭 → cluster 결단) | sub-plan-4 skill 운영 |
| sp5-4 | intervention_log 분석 dashboard prototype | sub-plan-5 또는 sub-plan-6 |
| sp5-5 | hooks 의 skill auto-invoke (gate 자동 호출 / Auto Mode 호환) | — |

## ★ ★ v2.0 carry (master plan §K)

| # | 항목 | 시점 |
|---|---|---|
| K-1 | use case 4종 entry flow 분기 | v2.1+ |
| K-2 | impl 70~80% 한계 closure 옵션 B | v2.x |
| K-3 | design stage skill 본격 채움 | v2.x |
| K-4 | external orchestrator integration | v2.x |
| K-5 | impl runner multi-framework parallel | v2.x |
| K-6 | tools/ node_modules 경량화 | v2.0.0 후 |
| K-7 | 기술 스택 분기 디렉토리 | (영구 — SKILL.md 본문 분기) |
| K-8 | adoption 외부 워크스페이스 | (영구 — DEC-2026-05-02-adoption-carry-OFF) |
| K-9 | `plugin/` 디렉토리 의도 확인 | sub-plan 진행 중 별도 결단 시 |

---

## ★ ★ 직전 진행 (2026-05-05 ~ 5-3 / 보존)

★ 2026-05-05 v1.4 프로젝트 적합성 평가 보고서 산출 (`archive/v1.4-evaluation/v1.4-evaluation-report.md` 713 line / cleanup round 1 격리) + v2.0 결단 carry 등재. ★ 직전 v1.5.0 MINOR release (2026-05-03 / 98998d5) — ADR-BE-001 negative-space corroboration 정식화 + §8.1 strict 정합 검증대 두 번째 통과 보존.

---

## 방법론 본체 버전

- **★ ★ ★ ★ ★ v1.5.0 MINOR release (2026-05-03) ✅ 현재** — ★ ★ ★ ★ ADR-BE-001 (★ negative-space corroboration 정식화) 신설 + schemas/error-mapping-spec.schema.json (deliverable 16) 신설 + skills/analysis/phase-5-error-mapping/SKILL.md 신설. ★ ★ ★ §8.1 strict 정합 검증대 ★ 두 번째 통과 (★ ADR-FE-007 positive-space 와 ★ 대칭 — ★ 4 PoC 모두 anti-pattern 보유 ↔ ★ 3 BE PoC 모두 contract 부재). ★ AP-API-001 본체 antipattern 카탈로그 negative-space 첫 등재 (3 BE PoC isomorphic / Spring 2.5 + Spring 3 + NestJS framework 무관). ★ flows/analysis.phase-flow.json v1.4.4 → v1.5.0 (phase 5-1 outputs + error-mapping-spec.json / skills 3 → 4). ★ methodology-spec/skills-axis.md §5 매핑 표 갱신. ★ 검증: drift-validator --check-layout 9 phases / **19 skills** (★ 18 → 19) / 0 orphans / 0 missing / 4 tool 회귀 66/66 pass / version-check 3-source sync at v1.5.0 / build 224 files dist/internal-v1.5.0/ + CHECKSUMS. ★ ★ b87cec5 + v1.4.5 흡수. ★ retract risk 명시 (negative-space 정의 v1.6+ 외부 사용 시 재검토 / mapping_mechanism enum framework 추가 시 확장). ★ Cooling-off ❌ (★ ADR + schema 신설 = 적용 대상이나 ★ 사용자 명시 결단 "나머지 진행" → memory edge case 정합). ★ carry → v1.5.1+ PATCH (ts-morph decorator semantic / AP-API-001 PoC #01 evidence 보강 / antipatterns.schema 본체 카탈로그 / drift-validator BE corpus / extractor agent / deliverable 16 full spec / migration-cautions BE). git tag `v1.5.0`. commit `98998d5`.
- **★ ★ ★ v1.4.5 PATCH release (2026-05-03) ✅ 보존** — ★ ★ ★ AP-API-001 자동 회귀 도구 BE 트랙 첫 진입. NestJS sub-rule (`internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`) 신규 — `@Delete + @ApiResponse({status: 201, ...})` decorator drift detect (4 분기 / 순서 양방향 + async 변형) / PoC #03 article.controller.ts:65,68 + 81,85 + 97,99 ★ 4 op 정확 매칭. ★ AP-API-001 cross-PoC base 정합 — PoC #03 ap.json 에 static_rule_link 추가 (★ PoC #02 mirror + ts-morph carry 명시). ★ 직전 b87cec5 (옵션 2′ / no release / Spring rule + AP-API-001 PoC #02 cross-link / drift-check.yml body scan 통합) ★ 정식 release 통합. ★ ★ §8.1 strict 평가 — patterns ≥ 2 PoC isomorphic + 2 framework (Spring + NestJS) 자연 충족 → static-runner quality 격상 자격. release note = CHANGELOG entry. git tag `v1.4.5`. commit `4dcace9`.
- **★ ★ ★ v1.4.4 PATCH release (2026-05-02) ✅ 보존** — ★ ★ ★ manifest SSOT 정식 승격 (`flows/analysis.phase-flow.json` v1.2.2 → v1.4.4 / 9 phase + skills 매핑 + cross_cutting.aspects). `methodology-spec/skills-axis.md` 신설 (★ phase ID + skills 디렉토리 axis 분리 정책). drift-validator 0.2.0 → 0.3.0 (★ check-phase-skills.js + cli `--check-layout` flag + test 3건 / 36 pass). `.github/workflows/drift-check.yml` 신설 (★ CHANGELOG v1.2.1 entry 의 plan 정의만 → 실 구현 흡수). ★ ★ ★ b (rename) carry → v2.0 (★ §8.1 corroboration 0 = 본 plugin 의 정책이 본 plugin 자신의 변경 차단 메타 정합 첫 입증). git tag `v1.4.4`. commit `bac7c5d`.
- **★ ★ ★ ★ v1.4.3 PATCH release (2026-05-02) ✅ 보존** — ★ ★ ★ 14차 결단 (DEC-2026-05-02-plugin-first) 1일 retract / adoption 분리 워크스페이스 폐기 / workspace 단일 통합 + build script 1차 도입 (★ Phase A). ★ 신규 자산: `package.json` (workspace root / private:true / type:module / devDeps only) + `scripts/build-plugin.js` (Official + Industry + Senior 보강 7건 — explicit allow-list / Windows long-path 검증 / SHA256 CHECKSUMS / Agent 4 발견 templates/adoption/ → dist root 동시 복사) + `scripts/version-check.js` (3 source 정합 / source-of-truth = plugin.json) + `.gitignore`. ★ 흡수 자산: `templates/adoption/CLAUDE.md` (★ ★ ★ 사용자 직접 편집 / 정책 23 inline / NestJS 4 + Spring 5 PoC #02 추출) + `templates/adoption/README.md` + `archive/methodology-v1.1/` + `docs/adoption/{v1.3-plan,v1.3-status,v1.3-decisions-index,lessons-learned-2026-05-02,README}.md`. ★ 검증: version-check ✅ / build:check 211 files ✅ / build 214 files + CHECKSUMS ✅ / build:diff-check (Senior gate) source mutation 0 ✅ / sha256sum -c 213/213 OK ✅ / `claude plugin install` Version 1.4.3 / Scope user / Status enabled ✅. ★ Phase A 운영: marketplace.json `"source": "./"` 그대로 / dist 부가 출력. ★ Phase B carry: `"source"` → `"./dist/internal-v1.4.3/"` 전환 / release.yml CI / 사내 ADR 1호. ★ Lessons: cadence ≥ 24h cooling-off (Senior / memory 자산화 carry) + 별도 dist sync 함정 (Babel/Yarn/Sentry) + 사용자 직접 편집 silent loss risk (★ Agent 4) + §8.1 일반화 ❌ (본 retract specific). carry 5 → 7 → ★ ★ **5** (★ DEC-2026-05-02-adoption-carry-OFF 후속 결단 / F4+F5+rename = ★ 본 프로젝트 backlog 제거 / 외부 워크스페이스 = 사용자 자체 영역 / ★ workspace 본체 단일 focus). release note = `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md` + `docs/adoption/lessons-learned-2026-05-02.md`. git tag `v1.4.3`. DEC-2026-05-02-adoption-폐기-build-step-신설 + ★ ★ DEC-2026-05-02-adoption-carry-OFF (★ no release / no tag / 본체 commit 만).
- **★ ★ ★ v1.4.2 PATCH release (2026-05-02) ✅ 보존** — ★ ★ ★ ★ AP-FE-SECURITY-001 (FE applies_to "localStorage 저장") ★ 진짜 도구 직접 confirm 도달 (★ implicit 목표 종결). ★ ★ ★ custom Semgrep rule 첫 실현 (`tools/static-runner/rules/jwt-localstorage.yml` / fully qualified slug `internal.fe.security.jwt-localstorage` / 4 분기 pattern / metavariable-regex / Sprint 4 README "별도" carry 의 1년 long-tail 종결). ★ ★ static-runner 0.1.1 → 0.1.2 (★ `--extra-rules` 옵션 신규 / multi-config / Semgrep `--config` 멀티 정합) / unit test 9 → 11. ★ ★ drift-check.yml CI ratchet 통합 (★ PoC #04 full FE 트랙 신규 step + `--baseline --ratchet` + custom rule 적용 / ADR-010 §2.3 첫 운영 입증 / ratchet dry trial: novel 1 → blocked → exit 1). ★ Official research Q4 carry 해소 (★ `--rewrite-rule-ids` default ON 실측). ★ ★ 같은 날 v1.4.0 + v1.4.1 + v1.4.2 = 3 release 빠른 carry resolve cadence 입증. release note = `docs/v1.4.2-release-note.md`. git tag `v1.4.2`. carry 5 → 5 (★ 보존 3 + 신규 2: severity 변환 검토 + RSA/JWT 길이 custom rule). DEC-2026-05-02-v1.4.2-carry-2-3-종결.
- **★ ★ v1.4.1 PATCH release (2026-05-02) ✅ 보존** — ★ release 같은 날 carry 1 즉시 종결. ★ Semgrep 1.161.0 진짜 실행 (★ pip 채널 / Python 3.14 공식 지원 / Docker 가정 깨짐) → ★ 진짜 도구 6 → **7종** + ★ -5%p 패널티 제거 + ★ baseline 첫 작성 (0 findings) + ★ ratchet dry trial pass + ★ ADR-010 외부 적용 첫 입증 (PoC #04 full). ★ ★ ★ 본체 도구 격상 1건 부수 산출 — static-runner 0.1.0 → 0.1.1 (`result_hash: null` + `source_commit_sha: unknown` bug 2건 fix / ★ ★ ★ no-simulation 정책 핵심 필드 위조 차단 효과 복구). release note = `docs/v1.4.1-release-note.md`. git tag `v1.4.1`. ★ ★ implicit 목표 (JWT XSS 4 PoC isomorphic 직접 confirm) = 미달 → carry 2 신규 분리 (custom Semgrep rule 작성 / v1.4.2 또는 v1.5). DEC-2026-05-02-v1.4.1-Semgrep-carry-종결.
- **★★★★★★★ v1.4.0 MINOR release (2026-05-02) ✅ 보존** — ★ ★ ★ 사내 표준 v1.3.1 → v1.4.0 격상. ★ FE 트랙 정식 진입 + §8.1 strict 검증대 첫 통과. release 자격 7/7 충족 + 4 carry 명시 (Semgrep / F-FE-006 / i18n / v1.5). release note = `docs/v1.4-release-note.md`. git tag `v1.4.0`. ADR-FE 7건 + schemas 13종 + tools 6종 (★ schema-validator 신설) + 4 PoC. DEC-2026-05-02-v1.4.0-release.
- **★★★★★ v1.4.0-dev 라인 (2026-05-02) — Stage 5 본격 PoC #04 종결 ✅** — ★ ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과. yurisldk/realworld-react-fsd 4 Sprint × 4 sprint 게이트 + Stage 5 종결. ★ ★ ★ ★ 본체 격상 3건: drift-validator FE 모드 신설 + schema-validator (Ajv 8) 신설 + ★ ADR-FE-007 신설 (★ 본체 antipattern 카탈로그 첫 등재 / AP-FE-SECURITY-001 4 PoC isomorphic + AP-FE-OPTIMISTIC-DRY 3 컴포넌트). ★ 진짜 도구 6종 (ts-morph + Playwright + axe + drift-FE + schema-validator + formal-spec-link FE) + Semgrep carry. ★ Phase 5-2-c 32 snapshot + 16 a11y scan (★ 8 page × 4 viewport). ★ form-validation 90/77 BR + URL params validation 2 page isomorphic 정식화. ★ rules.json 80 BR. ★ IR 4계층 정합도 0.99 ratchet 단조 비감소. ★ 신뢰도 0.92 (ADR-009 단계 5). 6 finding (F-FE-001~006). ★ Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족 + 4 carry 명시 (Semgrep / F-FE-006 / i18n / v1.5). DEC-2026-05-02-v1.4-Stage-5-종결.
- **★★★ v1.4.0-dev 라인 (2026-05-02) — Stage 4 mini-PoC 종결 ✅** — RealWorld React fork (yurisldk/realworld-react-fsd / 527 stars / FSD 약식 / Zod / TanStack Query / react-router v7 / orval+OpenAPI) 1주 fail-fast 검증. ★ 진짜 도구 3종 실행 (ts-morph 24 + Playwright Chromium + axe-core 4.10) → ★ no-simulation 정책 단계 4 도달. ★ form-validation-spec.json 85 validation / ★ 72 BR 자동 등록 (★ Stage 7-pre 신설 deliverable 14 핵심 입증 / OpenAPI 67 + Zod-mini URL 5 + HTML5 13). ★ type-spec.json 46 type / framework_neutrality_score 1.0. ★ visual-manifest.json 2 viewport binary 진실. ★ a11y-spec.json WCAG 2.2 AA / 1 unique violation (html-has-lang). ★ IR 4계층 정합도 overall_framework_neutrality_score = ★ 0.99 (target 0.90 / 9%p 초과 / react_idiom_count_in_IR = 0). ★ 4 finding (F-FE-001~004 / 모두 candidate / mini scope 정합). 사상 위반 0. ★ Stage 5 진입 자격 5/5 충족 (사상 + IR + 도구 + finding + 신뢰도) + carry 2건 (Semgrep 환경 + drift-validator FE / Senior 재분류 i18n = 적용 대상 부재 ≠ carry). ★ §8.1 정합 strict — 본체 격상 0건. DEC-2026-05-02-v1.4-Stage-4-mini-PoC-종결.
- **★ v1.4.0-dev 라인 (2026-05-01) — BE Sprint 5+ carry-over (환경 무관 부분) 종결 ✅** — drift-validator v0.1.0 → ★ **v0.2.0** 격상 (corpus 14쌍 → ★ 19쌍 / self-test 15 → ★ 25 test) + ★ phase-flow 비교기 신설 (★★★ 본체 phase-flow drift 0 자가 입증) + ★ tools/_shared/baseline.js 공용 이동 + DTV/static-runner --baseline/--ratchet 통합 + static-runner SARIF→finding 어댑터. 3 도구 unit test 합계 ★ **53/53 pass** ✅. ADR-010 §2.5 정합 도달. 환경 의존 (Semgrep/PMD 진짜 실행) 만 carry. DEC-2026-05-01-Sprint-5-carryover-종결.
- **v1.4.0-dev Stage 7-pre (2026-05-01) ✅** — 본체 격상 8 항목 (ADR-FE-005 보강 [매개체 12 → ★ 13 / Zod 추가] + ADR-FE-006 갱신 [§5.2 carry → ★ resolved] + schema 2 신설 [form-validation-spec / type-spec] + schema 1 확장 [rules source_format/auto_extracted] + deliverable 2 신설 [14 form-validation-spec / 15 type-spec] + workflow 보강 1 [phase-5-2-b §3.1 form_state cross-link]). ★★★ 외부 LLM 검증 빈틈 5/5 = 100% 해소. DEC-2026-05-01-v1.4-Stage-7-pre-종결.
- **v1.4.0-dev Stage 6 (2026-05-01) ✅** — 본체 격상 8 항목 (ADR-FE-004 + ★ ADR-FE-006 신설 + be-fe-separation.md + ADR-FE-001/003 carry → resolved + deliverable 7 §6.5 + phase-0 §3.4 + legacy-spectrum.schema). ★★★ 사용자 7 요구사항 7/7 = 100% 도달. 외부 LLM 검증 빈틈 #3/#4/#5 해소. DEC-2026-05-01-v1.4-Stage-6-종결.
- **v1.4.0-dev Stage 3-2 (2026-05-01) ✅** — 본체 격상 2차 12+ 항목 (ADR 2 + schema 5 + deliverable 4 + migration-cautions-fe + phase-6 보강 + 도구 확장 1). ★ G2-1+G2-2+G2-4 정식 반영. Strangler Pattern 채택. schema if/then 강제 4 영역. formal-spec-link-validator FE 4→8 pass. DEC-2026-05-01-v1.4-Stage-3-2-종결.
- **v1.4.0-dev Stage 3-1 (2026-05-01) ✅** — 본체 격상 16+ 항목 (ADR 4 + schema 3 + deliverable 3 + workflow 4 + 도구 시범 1). ★ 사상 기둥 3 (ADR-FE-001/002/005) + ★ 정량 모델 격상 (ADR-009 §2.4) + ★ no-simulation 정책 강화 (visual schema 강제). cross-check 권고 3건 반영 (DTCG / WCAG 2.2 / ICU MF2). drift-validator FE corpus 14→15 pass. DEC-2026-05-01-v1.4-Stage-3-1-종결.
- **v1.4.0-dev Stage 2 (2026-05-01) ✅** — Gate 1/2/3 × 4 = **12 결정 모두 Senior 권고 채택**. spectrum (Modern+jQuery+JSP 예외) / 시나리오 B-Lite / schema 분리 / 매개체 12 / 비기능 a11y+i18n+정적보안 v1.4 / legacy Tier 1~4 / BE/FE 분리 + ADR-FE-004 / ADR-001 갱신 / mini-PoC Stage 3-1 후 / PoC RealWorld only / 신뢰도 0.80 / Sprint mini 1주 + 본격 4-6. DEC-2026-05-01-v1.4-Stage-2-Gate-결단.
- **v1.4.0-dev Stage 1 (2026-05-01) ✅** — research × 3 (공식문서 / 산업 / Senior) 완료. 3 에이전트 합의: Scenario B-Lite / 권위 매개체 12 채택 / 빈틈 Top 5. DEC-2026-05-01-v1.4-Stage-1-research-종결.
- **v1.4.0-dev Stage 0 (2026-05-01) ✅** — FE 트랙 정식 시작. 사용자 진단 "FE 분석 방법이 없잖아" → research-first. 8 Stage 분할. 외부 plan = `~/.claude/plans/be-foamy-jellyfish.md` (3 에이전트 점검 v2). DEC-2026-05-01-v1.4-FE-트랙-진입.
- **★★★ v1.3.0 MINOR release (2026-05-01) ✅ 보존** — 사내 표준 채택 가능 시점 도달. **11 묶음 통합** (C+I+H+K + R+D+§8.1 + L+M+N+O) + Sprint 5 Node 도구 부분 종결 (spectral). ★★★ no-simulation 정책 첫 실현. 신뢰도 85-92% (★ ADR-009 단계 4 — 진짜 도구 1회 실행).
- v1.2.3 PATCH (★ v1.3.0 에 흡수) — 본체 격상 7 묶음 (C+I+H+K + R+D+§8.1).
  - C: Phase 4.5 cross-link 의무화 schema
  - I: AP-PERFORMANCE 3 PoC 권위 격상
  - H: Positive finding 패턴 schema (severity:positive + learning_effect_type 4종 + status:logged)
  - K: Lifecycle BR 패턴 (decision_tables required 분리 + br_type enum + current_state_note)
  - **R: NestJS 4 ADR 신설** (Auth-scope / Validation / HttpCode / TypeORM-Integrity)
  - **D: ADR-006 final 격상 + ADR-010 (Baseline + Ratchet) 신규**
  - **§8.1 cross-platform 입증 정식 등재** (README "Platform-Agnostic 입증" 섹션)
  - 본체 갭 closure 7 → 11. ADR 9 → 13개 (★ ADR-NEST 4 + ADR-010 1). v1.3.0 release 진입 직전.
- v1.2.2 PATCH — 묶음 M-P2-3 5건 (본체 갭 7건 모두 closed).
- **v1.2.1 PATCH** — drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 강제.
- **v1.2.0 MINOR** — 14 묶음 (A~M+P) 통합. ADR-008 + Phase 4.5 정식 + finding-system schema + migration-cautions 의무.
- v1.1.2 PATCH (high 4건 closed) → v1.2.0 흡수

## 시퀀스 진행률

| 시점 | 작업 | 상태 |
|---|---|---|
| PoC #01 Phase 0~6 | RealWorld Spring Boot 2.5 | ✅ 종결 (2026-04-29) |
| PoC #02 Phase 1~6 | 1chz/realworld-java21-springboot3 | ✅ 종결 (2026-04-29) |
| C-Sprint 1 | F-074 단방향 round-trip + BR 1건 형식화 시범 | ✅ |
| C-Sprint 1.5 | 다이어그램 신뢰도 강화 + cross-validation | ✅ |
| C-Sprint 2 | BR 5건 형식화 + cross-validation 의무 + F-074 우선 | ✅ |
| C-Sprint 3 | Phase 4.5 정식 명세화 + JSON 짝 + α+β + M-P1 병행 | ✅ |
| C-Sprint 4 | drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 + PoC #02 자가 검증 (★ 7+3 finding 자동 검출) | ✅ |
| **묶음 M-P2-3** | 본체 갭 5건 — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml | ✅ **본 세션** |
| **C-Sprint 5** | (carry-over) (1) drift-validator transitionFuzzyMatch 보완 ✅ DEC-A (2026-04-30) / (2) corpus 4쌍→★ 19쌍 ✅ Sprint 5+ Phase A / (3) ★ phase-flow 비교기 ✅ Sprint 5+ Phase B / (4) ADR-010 baseline 3 도구 통합 ✅ Sprint 5+ Phase C+D / (5) static tool 실 실행 1회 ⏳ 환경 의존 carry | ★ 환경 무관 부분 종결 / 환경 의존 1 항목만 carry |
| **시퀀스 B — PoC #03 NestJS** | Phase 0~4 종결 (Phase 4.5+ carry) | 🔄 **진행 중** |
| 시퀀스 B Phase 4.5 산출 | 5 산출물 37 파일 (state-machine 6 + sequence 12 + decision-table 12 + invariants 3 + property 3 + manifest 1) + PROGRESS — D1~D6 권고 안 채택 (BR 6 / AR 3 / UC 6 / Sairyss antipattern 권고 / 신뢰도 70-77% / false negative 우선) | ✅ (2026-04-30 직전 세션) |
| 시퀀스 B Phase 4.5 검증 | drift-validator (9 짝 / 20 breaking → 진짜 8 + 도구 한계 12) + decision-table-validator (6 → 0 enum fix) + DEC 종결 + finding F-145~**F-156** 통합 (★ F-154 transitionFuzzyMatch 60% false positive — F-117 재발 입증) + 신뢰도 0.70 → 0.77 (단계 2 → 2.5) | ✅ (2026-04-30 본 세션) |
| **시퀀스 B Phase 4.5+1** | **다이어그램 mermaid 보강 (진짜 drift 8 → 0 ✅) — Article persistingArticle compound + User validatingLogin compound + Article 3 self-loop + Follows self-loop + sequence 2 message** + drift 재실행 (breaking 20 → 8 / 진짜 drift 0 / 도구 한계 100%) + 신뢰도 0.77 → **0.80** (★ 단계 3 자동 검증 통과 도달 ✅) | ✅ **본 세션 (2026-04-30)** |
| **시퀀스 B Phase 5-1** | **api 산출 4종 — openapi.yaml (21 endpoint / 14 schemas / Bearer JWT) + api-extension.json (★ Phase 4.5 cross-link 9/21) + api.md (12 REC-API-*) + _manifest. ★★★ F-164 critical 신규 (Article 4 endpoint Auth 부재) + F-161 positive (Bearer 표준 ✅ = PoC #02 F-084 학습 효과) + F-157~F-166 10건. 신뢰도 0.90 / 7대 산출물 5/7** | ✅ **본 세션 (2026-04-30)** |
| **시퀀스 B Phase 6** | **antipatterns final 4종 — antipatterns.json (11 AP / critical 2 + high 3 + medium 4 + low 2) + avoid-list.md + ★ migration-cautions.md (NestJS 특이 8 함정 + 학습 효과 3건) + _manifest. 4 composite view + Phase 4.5 cross-link 4/11 AP + ★★ F-161 positive (Bearer 학습 효과) + AP-PERFORMANCE-001 medium → high 격상 (3 PoC 재현). 신뢰도 0.94 / 7대 산출물 6/7** | ✅ **본 세션 (2026-04-30)** |
| **★★★ PoC #03 종결** | **★★ 전체 7대 산출물 6/7 도달** (UI/UX 만 N/A) — 사내 표준 v1.3 격상 데이터 완비 | ✅ (2026-04-30) |
| v1.3.0 MINOR + v1.3.1 PATCH release | 사내 표준 채택 가능 시점 도달 / D3.2 파일명 컨벤션 정리 (12 rename, c72d29c) | ✅ (2026-05-01 보존) |
| v1.4.0-dev Stage 0 | freeze 해제 + FE 트랙 진입 + 8 Stage 분할 합의 + plan/DEC/STATUS/INDEX/CHANGELOG/memory | ✅ (2026-05-01) |
| v1.4.0-dev Stage 1 | research × 3 (공식/산업/Senior) — 9Q × 27 답 + 진단 보고서 + Stage 2 Gate 입력 12 결정 | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 2** | Gate 1/2/3 × 4 = 12 결정 모두 Senior 권고 채택 / Stage 3-1 진입 자료 확정 | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 3-1** | 본체 격상 1차 — ADR-FE-001/002/005 신설 + ADR-009 §2.4 갱신 + state-map/visual-manifest schema 신설 + ui-spec.schema 확장 + deliverable 8/9 신설 + 7 보강 + phase-5-2 분할 (a/b/c) + ★ drift-validator FE corpus 14→15 pass + ★ formal-spec-link-validator FE 진단 (Stage 3-2 carry). cross-check 1차 사료 권고 3건 반영 (DTCG 정확한 인용 / WCAG 2.2 ratchet / ICU MF2 단계). | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 3-2** | 본체 격상 2차 — ADR-FE-003 신설 + ADR-001 §명시적 제외 갱신 + a11y-spec/i18n-spec/static-security-spec/legacy-spectrum schema 신설 + rules.schema 확장 + deliverable 10/11/12/13 신설 + migration-cautions-fe 신설 + phase-6 보강 + ★ formal-spec-link-validator FE 모드 확장 (4→8 pass). G2-1+G2-2+G2-4 정식 반영. Strangler Pattern 채택. schema if/then 강제 4 영역 (a11y/i18n/security/legacy). | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 6** | 횡단 정책 — ADR-FE-004 (BE/FE 분리 3 Scenario) + ★ ADR-FE-006 (framework-neutral IR / IR 4계층) 신설 + be-fe-separation.md 신설 + Tier 4 carry 종결 + deliverable 7 §6.5 Screen+Journey 우선. 사용자 요구 7/7 = 100% 도달. 외부 LLM 검증 빈틈 #3/#4/#5 해소. | ✅ (2026-05-01) |
| **v1.4.0-dev Stage 7-pre** | release 전 마지막 quality 격상 — ★ ADR-FE-005 매개체 12 → 13 (Zod 추가) + form-validation-spec / type-spec schema 신설 + rules.schema source_format/auto_extracted 확장 + deliverable 14/15 신설 + ADR-FE-006 §5.2 carry → resolved + phase-5-2-b §3.1 form_state cross-link. ★★★ 외부 LLM 검증 빈틈 5/5 = 100% 해소. | ✅ (2026-05-01) |
| **★★★ BE Sprint 5+ carry-over (환경 무관)** | drift-validator v0.1.0 → ★ v0.2.0 / corpus 14 → 19쌍 / self-test 15 → 25 test (Phase A) + ★ phase-flow 비교기 신설 + ★★★ 본체 phase-flow drift 0 자가 입증 (Phase B) + tools/_shared/baseline.js 공용 이동 + DTV --baseline/--ratchet 통합 (Phase C) + static-runner SARIF→finding 어댑터 + baseline-mode (Phase D) + DEC + STATUS + INDEX + CHANGELOG + memory (Phase F). 3 도구 합계 53/53 test pass (drift 33 + DTV 11 + static-runner 9). ADR-010 §2.5 정합 도달. 환경 의존 (Semgrep/PMD 진짜 실행 + vacuum/openapi-changes) 만 carry. | ✅ **본 세션 (2026-05-01)** |
| **★ methodology-spec doc 압축 정비** | LLM hot path 정보 농도 격상 — deliverables 1~9 + 4-5 (`8cf8a4d` -533) + workflow phase-0~5-1 (`474d36c` -244) + phase-5-2-a/b (`412d117` -60) + phase-5-2-c/5-2-ui/6 (`9b1c45c` -114) + 잔여 4 파일 (`68ae3df` -18). 누적 5404 → 4422 line (-18% / -982 line). 검증: cross-reference 1건 + ADR 인용 4 파일 보강. ★ 압축 ROI 분류 — placeholder 견본 (templates) 원복 / 사람 hot path (ADR/decisions) 미진행 결정. | ✅ (2026-05-01) |
| **★★★ v1.4.0-dev Stage 4 mini-PoC** | RealWorld React fork (yurisldk) 1주 fail-fast / no-simulation 단계 4 / IR 0.99 / 신뢰도 0.85 / 4 finding / Stage 5 진입 자격 충족 / §8.1 — 본체 격상 0건 | ✅ (2026-05-02) |
| **★★★★★ v1.4.0-dev Stage 5 본격 PoC #04** | yurisldk/realworld-react-fsd 4 Sprint × 5 sprint 게이트. ★ ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과. ★ ★ ★ ★ 본체 격상 3건 (drift-validator FE 모드 + schema-validator Ajv 8 + ★ ★ ADR-FE-007 신설 / 본체 antipattern 카탈로그 첫 등재). ★ AP-FE-SECURITY-001 (★ ★ ★ ★ 4 PoC isomorphic / Java + Hexagonal + NestJS + React) + AP-FE-OPTIMISTIC-DRY (★ 3 컴포넌트). 진짜 도구 6종 + Semgrep carry. 32 snapshot + 16 a11y scan / form-validation 90/77 BR / rules.json 80 BR / 9 SM / 8 page / 19 op + 25 schemas / IR 0.99 단조 비감소 / 신뢰도 0.92 (ADR-009 단계 5) / 6 finding. ★ Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족 + 4 carry 명시. | ✅ (2026-05-02) |
| **★ ★ ★ v1.4.2 PATCH release** | ★ ★ AP-FE-SECURITY-001 진짜 도구 직접 confirm + custom Semgrep rule 첫 실현 + drift-check.yml CI ratchet. Custom rule (`jwt-localstorage.yml`) 4 분기 pattern (string vs identifier × bare vs window. prefix) / 545 rules loaded / 77 rules run / 66 files / 1 finding / `auth-storage.ts:20` 매칭. ★ ★ static-runner 0.1.1 → 0.1.2 (★ `--extra-rules` 옵션 신규) / unit test 9 → 11 pass. ratchet dry trial: novel 1 / blocked 1 / exit 1 ★ ADR-010 §2.3 CI fail trigger 첫 운영 입증. ★ Official research Q4 carry 해소 (★ `--rewrite-rule-ids` default ON 실측 — SARIF ruleId = `<cwd-relative-path>.<rule-id>`). DEC-2026-05-02-v1.4.2-carry-2-3-종결. | ✅ **본 세션 (2026-05-02)** |
| **★ ★ v1.4.1 PATCH release** | ★ release 같은 날 carry 1 즉시 종결. ★ Semgrep 1.161.0 ★ pip 채널 (Python 3.14 공식 / Docker 가정 깨짐) PoC #04 full INPUT/src/ 진짜 실행 (544 rules / 76 run / 66 files / 0 findings / 6293 ms / 5종 물증 7 필드 모두 정상). ★ ★ ★ 본체 도구 bug 2건 발견 + 즉시 fix (★ static-runner 0.1.0 → 0.1.1) — `result_hash: null` (★★★ no-simulation 핵심 필드 위배 / runner.js:71 `require('node:fs')` ESM throw → catch swallow) + `source_commit_sha: unknown` (cli.js writeBaseline 호출 시 sourceCommitSha 인자 누락) → readFileSync import 추가 + detectGitSha 함수 신설. 9/9 unit test pass. baseline 첫 작성 (0 findings) + ratchet dry trial pass (0/0/0/exit 0) — ★ ADR-010 외부 적용 첫 입증. ★ implicit 목표 (JWT XSS 4 PoC isomorphic 직접 confirm) = 미달 (Semgrep `react-jwt-in-localstorage` 룰 = jwt_decode 임포트 부재로 매칭 0건 / Senior research Q2 정확 입증) → carry 2 신규 분리 (custom Semgrep rule 작성). 진짜 도구 6 → **7종** / -5%p 패널티 제거 / 신뢰도 0.92 → 0.92~0.95 (단계 5 강화). DEC-2026-05-02-v1.4.1-Semgrep-carry-종결. | ✅ **본 세션 (2026-05-02)** |

---

## PoC #01 종결 (2026-04-29)

- Phase 0~6 완료 — 7대 산출물 6/7 (UI/UX 제외 100%)
- finding **33건** (closed 10 / promoted 10 / deferred 13)
- AP **15건** (critical 2 / high 2 / medium 7 / low 4)
- raw confidence: Phase 6 0.96
- 핵심 결함: AP-DOMAIN-001 (De Morgan critical) + AP-SECURITY-001 (JWT 21byte critical) + AP-DOMAIN-002 (email/username unique 3중 부재)

## PoC #02 종결 (2026-04-29)

분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e` / Spring Boot 3.3 + Java 21 + Multi-module Hexagonal)

### Phase 1~6 산출

| Phase | 산출 | raw conf | 핵심 |
|---|---|---|---|
| 1 (init) | inventory.json + stack-detection.md + tree.md + stats.json + _manifest.yml | 0.93 | Hexagonal Modular Monolith hybrid 0.65 cap |
| 2 (db) | schema.json + schema.sql + erd.mermaid + 정합성-검증-보고서.md + _manifest.yml | 0.85 | F-048 critical (TagJpaRepository 타입 오류 ★ Senior 발견) |
| 3 (arch) | architecture.json + architecture.md + architecture.mermaid + dependency-graph.mermaid + circular-dependencies.md + _manifest.yml | 0.92 | LV/CIRCULAR 0건 / F-068 critical (RSA git commit ★ Senior 발견) |
| 4 (domain+rules+AP partial) | domain/* + rules/* + antipatterns-partial/* | 0.83 | 4 Aggregate Root + 25 UC + 14 BR + 6 AP partial |
| 5-1 (api) | openapi.yaml + api-extension.json + api.md + _manifest.yml | 0.93 | 19 op / openapi.yaml ground truth 802 line 사용자 작성 |
| 6 (antipatterns final) | antipatterns.json (21 AP) + avoid-list.md + _manifest.yml | 0.96 | **3 critical: AP-API-001 / AP-DB-001 / AP-SECURITY-001** |

### PoC #02 핵심 결함 (사내 적용 시 즉시 수정 critical 3건)

- **AP-API-001 critical** — F-070+F-079+F-085 spec/runtime drift 묶음 (RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 위반)
- **AP-DB-001 critical** — F-048 TagJpaRepository<Tag, Integer> 타입 오류 (1글자 fix: Integer → String)
- **AP-SECURITY-001 critical** — F-068 RSA private key (`server/api/src/main/resources/app.key`) git 직접 commit (PoC #01 isomorphic ★)

### PoC #02 finding 통계

- finding **43건** (F-042~F-087 / F-079 → F-070 merged)
- promoted 31 / candidate 8 / deferred 4 / closed 0
- F-070 high → critical 격상 (Phase 5-1)
- F-085 low → medium 격상 (Phase 5-1)
- F-081 medium → low 강등 (Phase 5-1)

### PoC #02 5 핵심 결정 (Phase 6 — 윤주스 일괄 승인)

- DEC-001 — AP-API-001 critical 단일 등록 (Phase 5-1 정합)
- DEC-002 ★ — Phase 1-3 누락 candidate 5건 등록 (F-048 / F-068 / F-051 / F-053 / F-069)
- DEC-003 — ID 정규화 6건 (multi-prefix → single)
- DEC-004 — composite view 4건 도입 (PoC #01 1건 → 4건 확장)
- DEC-005 — low candidate 3건 등록 (F-058 / F-076 / F-078)

### PoC #01 ↔ PoC #02 cross-validation (15 AP 외부 검증)

- **비재현 8건 (53%)** — Hexagonal 분리 + Spring Boot 3.x 효과 (학습 효과 입증)
- **재현 4건 (27%)** — v1.2.0 합산 격상 강한 권위 (AP-PERFORMANCE-001 medium → high 격상 / AP-API-001~002 + AP-DB-001 재현)
- **변형 재현 3건 (20%)** — AP-SECURITY-001 (JWT 21byte → RSA git commit isomorphic ★) + AP-DOMAIN-002 + AP-ARCH-002

---

## 누적 통계 (PoC #03 Phase 4.5 검증 종결 시점 / 2026-04-30)

```yaml
finding_total: 168         # 158 + Phase 5-1 신규 10 (F-157~F-166)
finding_closed: 10
finding_promoted: 41
finding_deferred: 18
finding_candidate: 60      # +41 (PoC #03 + Phase 4.5)
finding_merged: 1
finding_rejected: 0
finding_phase45_new: 53    # 41 (PoC #02 시퀀스 C) + 12 (PoC #03 Phase 4.5 형식화 9 + 검증 3)

ap_total: 36              # PoC #03 final (Phase 6) 후 +8~12 예상
ap_with_migration_advice: 21

formal_spec_artifacts: 69  # 29 (PoC #02 + sprint) + 40 (PoC #03 — 37 + .validation 3)
methodology_body_tools_added: 3  # drift-validator + decision-table-validator + static-runner

v120_bundles: 16           # A~P
v120_bundles_ready: 16     # ★ A~P 전체 — Sprint 4 N+O 인프라 산출 완료
이중_렌더링_정합_검증_도구: ✅   # drift-validator 자동화 / 본 세션 PoC #03 첫 외부 적용 ★
이중_렌더링_드리프트_자동검출: PoC #02 → state-machine 7 breaking / PoC #03 → state-machine 17 breaking + sequence 3 breaking
신뢰도_정직표기:
  poc03_phase45: 0.80     # ★ 단계 3 (자동 검증 통과 ✅ — drift 진짜 drift 0 + dmn 0)
  poc02_phase6: 0.96
  방법론_본체: 80-87%      # 시뮬 패널티 유지 (실 static tool Sprint 5 carry-over)
신뢰도_목표_after_sprint5: 90-95%  # 진짜 Semgrep/PMD 1회 실행 시

unit_tests_passing: 17/17  # drift-validator 6 + dmn-check 7 + static-runner 4
poc03_validation_first_external_application: ✅  # ★★ 본 세션 — drift 60% false positive (F-117 재발 = F-154) + dmn 5종 0 hit (BR 표 모두 통과)
poc03_phase_45_plus_1_diagram_fix: ✅  # ★★ 다이어그램 보강 8건 — 진짜 drift 0 도달 + 도구 한계 100% (Sprint 5 carry-over)
poc03_phase_5_1_api_complete: ✅       # ★★ 21 endpoint + Phase 4.5 cross-link 9/21 + F-164 critical (★★★ Article 4 endpoint Auth 부재 신규)
poc03_phase_6_antipatterns_complete: ✅  # ★★★ 11 AP + 4 composite view + Phase 4.5 cross-link 4/11 + F-161 positive
poc03_artifacts_progress: 6/7            # ★★ 7대 산출물 종결 — UI/UX 만 N/A / BE only

# ★★★ 3 PoC 통합 (사내 표준 v1.3 격상 데이터 완비)
all_3_pocs_complete: ✅
cumulative_ap_3_pocs: 47   # PoC #01 15 + PoC #02 21 + PoC #03 11
v13_promotion_data_status: "★★★ 완비 — 통합 보고서 archive/v1.3-adoption/v1.3-promotion-report.md (cleanup round 1 격리) + DEC-v1.3-격상-데이터-완비"
v13_promotion_candidates_count: 6  # AP-PERFORMANCE / Positive finding / NestJS 4 ADR / Phase 4.5 cross-link / migration-cautions NestJS / §8.1 정식
saa_application_ready: ✅  # ★★ 사내 적용 시작 가능 시점 v1.2.2
v13_release_blocker: "Sprint 5 진입 의무 (★ 환경 의존)"
ci_workflow_files: 1       # .github/workflows/drift-check.yml (drift + static dual mode)
```

---

## Phase 4.5 형식화 시범 (시퀀스 C) 핵심 결과

| Sprint | 핵심 | 정량 |
|---|---|---|
| 1 | BR-EMAIL-UNIQUE 4 산출물 / self-reference 함정 자가 시인 | drift 4건 |
| 1.5 | Cross-validation + Static Analyzer **시뮬레이션** + Property test 명세 | drift +11건 / 신뢰도 60-70% → 80-87% |
| **2** | **★★★ F-074 단방향 round-trip 검증 — 자연어 빈약성 44% → 100%** | drift +19건 / **양쪽 발견 ★★ 2건 (F-097 high `@Transactional` 부재 / F-098 high Equality on transient)** |

→ **묶음 L (Phase 4.5 정식 도입) 데이터 100% 충분 ✅**.

## v1.2.0 격상 묶음 합산 데이터 (16 묶음 A~P)

| 묶음 | 영역 | 외부 검증 |
|---|---|---|
| A | cross-validation (F-015) | F-044 보강 ★ |
| B | 정정 트레이스 (F-022 + F-024) | PoC #01 단독 |
| C | severity 표준 (F-018) | PoC #01 단독 |
| D | schema 진화 (F-025) | multi-module + Hexagonal 모듈 분리 |
| E | quality-extraction | PoC #01 단독 |
| F | 신뢰도 공식 보강 | PoC #01 단독 |
| **G** | OpenAPI x-extension (ADR-007) | **PoC #02 외부 검증 ✅** |
| **H** | multi-module 환경 / **Auth/Crypto 검증** | **PoC #01+#02 isomorphic ★★★** (AP-SECURITY-001 양 PoC 재현) |
| I | finding-system 정식화 | PoC #02 메타 finding |
| **J** | Hexagonal port-adapter 가이드 | **PoC #02 단독 신규** (F-075) |
| **K** | multi-module Outside-in 모범 사례 | **PoC #02 신규** (F-064/F-065/F-066 positive findings) |
| **★ L** | **Phase 4.5 형식화 정식 도입 (ADR-008/009)** | **C-Sprint 1~3 누적 ✅ 100% — 정식 명세화 완료** |
| **M** | 방법론 본체 이중 렌더링 갭 해소 | **★ 갭 7건 모두 closed ✅** (P1 2건 Sprint 3 + P2-3 5건 v1.2.2) — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml |
| **N** | Drift 자동 검증 도구 (CI) | **Sprint 4 적용 ✅** (drift-validator + decision-table-validator + drift-check.yml + 17/17 test pass + PoC #02 자가 검증으로 7+3 finding 자동 검출) |
| **O** | 진짜 외부 도구 실행 의무화 (★★★) | **Sprint 4 인프라 적용 ✅** (static-runner Plugin host + Semgrep/PMD plugin + 5종 물증 schema enforcement + lint-no-simulation.sh). 실행은 Sprint 5 carry-over (Java/Semgrep/PMD 환경 부재) |
| **P** | 안티패턴 migration_advice + migration-cautions.md | **Sprint 3 적용 ✅** |
