# research summary — Phase A self-iteration (lightweight 3 agent / 2026-05-02)

> ★ ★ NOTE — 본 research 는 ★ iter 0 (commits `520166d` / `29f040e` / `ebb9a0d` / 2026-05-02 17:18-17:58) 이 ★ 다른 세션에서 종결된 후, 동일 일자 별도 conversation 에서 ★ post-hoc cross-check 목적으로 진행됨. iter 0 결과 (`docs/phase-a-iteration-0-preflight.md` + `docs/phase-a-iteration-guide.md`) 가 ★ source of truth. 본 파일은 iter 1+ 진입 시 ★ Senior R1~R5 권고 + 산업 패턴 + Phase A/B 병행 결단 에 사용.
> 4원칙 §2 산출.

---

## 1. 공식 — Claude Code plugin 메커니즘 (claude-code-guide agent)

### 정합 ✅
- 본 plugin 구조 (agents/_base + skills/analysis + hooks/hooks.json) = 공식 권고 정합
- hooks matcher 형식 `"Write|Edit"` (pipe-delimited string, NOT array) 정합
- agents frontmatter `name` 필드 = 파일명 정합 의무 (검증 필요)

### L1 검증 명령 (★ iter#1 핵심 명령 시퀀스)
```bash
# local dev install
claude --plugin-dir <absolute-path-to-this-repo>

# verify load
/context     # 전체 컨텍스트
/skills      # skills 18종 + ai-native-methodology: prefix 확인
/agents      # agents 3종
/hooks       # hooks SessionStart + PostToolUse 활성화 확인
/doctor      # 검증 오류

# hot reload
/reload-plugins

# hook trace (★ SessionStart 검증)
claude --debug hooks

# skill 수동 호출
/ai-native-methodology:phase-0
```

### ★ 갭 (undocumented)
- **skill matching trace** — 명시적 debug mode 부재. workaround = description 명료성 + manual invoke.
- **agent subagent_type 형식** — 추정 `plugin-name:agent-name` (공식 명시 부재)

### Common 실패 원인 (★ iter#1 사전 점검)
1. components in `.claude-plugin/` instead of plugin root → ★ 본 repo는 plugin root에 위치 ✅
2. plugin.json schema 오류 → `/plugin validate` 또는 `/doctor`
3. hooks matcher = array (잘못) vs string (올바름) → 검증 필요
4. hook script `${CLAUDE_PLUGIN_ROOT}` 변수 누락 → 본 repo hooks/hooks.json 검증 필요
5. shebang 또는 chmod +x 누락

---

## 2. 산업 — plugin self-iteration 패턴 (general-purpose agent)

### 정합 ✅
- **L1/L2 split** = compiler self-hosting + VSCode Extension Development Host 패턴과 ★ 구조 동형. **인정 — 본 plan 의 자기 발명 ✅**
- Semgrep "test rule on one repo → broader corpus → registry validation" = 동형 패턴

### ★ ★ 추가 권장 (D5/D6 보강)
- **(a) regression/snapshot count** — iter#5에서 iter#2 fix가 다시 깨지나? metric 추가 의무
- **(b) per-iteration time-box ≤ 2 days** — D4 "1-day cap"는 너무 짧음 (2-day 가 산업 평균)
- **(c) close-rate on F-PA-NNN** — finding 누적 vs 실제 종결 비율
- **(d) ★ ≥ 2 structurally different external codebases** (D5의 "≥ 1" → "≥ 2" 보강)

### ★ 비표준 신호
- "0 finding for N iterations" exit = ★ **비표준**. Atlassian 입장: "zero-bug 추구 ❌ — feedback 너무 지연". 본 plan 의 D5 = 산업 평균보다 ★ strict.

### 안티패턴
- sample bias / internal-only blindness (★ 외부 codebase 의무로 mitigated)
- infinite dogfooding (cadence 최적화 → 진짜 마찰점 외면)
- friction catalog rot (finding 등록만 하고 종결 ❌)
- premature ship (반대 실패 — D5로 mitigated)

---

## 3. Senior 권고 (Plan agent — ★ ★ ★ 강한 redirect 5건)

### ✅ 정합
- **L1/L2 split = ✅** (keep), 단 L1 iter ≤ 1 cap 의무

### ★ ★ ★ redirect 5건

**(R1) D5 "3 consecutive 0 friction" = ★ ★ gameable**:
- 같은 codebase / 같은 prompt → trivially converge
- ★ redirect: **"3 iterations × 0 high-severity friction × structurally varied inputs"**
  - 다른 repo size / 다른 언어 / adversarial repo / greenfield repo
- novelty requirement: iter N의 input distribution이 N-1과 overlap이면 count 안 됨

**(R2) severity-weighted, NOT raw count**:
- 1 P0 > 10 P3 nits
- finding count = 의미 약함 / severity-weighted 의무

**(R3) "no fix needed" judgment = ★ 가장 gameable line (D4)**:
- escape hatch 없는 rubric 의무
- 명시적 기준: (i) reproducibility (다른 환경에서 재현 ❌) (ii) frequency (1회 발생) (iii) severity (low) (iv) workaround 존재

**(R4) ∆LOC = weak metric**:
- 5 line fix > 200 line refactor 가능
- ★ redirect: **touched-surface (files × subsystems)**

**(R5) regression guard 부재**:
- F-PA-001 fixed in iter#2 → iter#5 재발 검증 부재
- ★ corpus self-test 패턴 적용 의무 (drift-validator 이미 corpus self-test 있음 — 패턴 재사용)

### ★ ★ ★ biggest risk (사용자 ★ 정면 응답 의무)
- **"same-day release momentum이 목표 자체화"** → ★ 인지 (★ feedback `feedback_carry_environment_assumption.md` 정합 — 이미 자각)
- ★ 강제 stop condition: iter#4+ 모두 severity ≤ low이면 강제 exit (cadence streak 의존 ❌)

### ★ ★ Phase B 병행 권고 (★ 본 plan §5 D9 신규)
- Phase A iter#2 시작 시점부터 1-person Phase B pilot 동시 시작
- ★ 이유: 순차 ❌ — Phase A 합성 loop이 발견 못 하는 문제를 Phase B 실 사용이 발견
- 본 plan 의 sequential 가정 = ★ 재고 의무

### external observer 부재 (D8 신규)
- ★ 모든 friction = same agent stack 자기 보고
- closed loop self-grading → ★ 약함
- Phase A exit 전 ≥ 1 human checkpoint 또는 다른 model reviewer 의무

---

## 4. 통합 결단 의뢰 — D1~D6 보강 + D7~D9 신규

### D1~D4 ★ 유지 (변경 없음)

### D5 ★ ★ ★ 결정적 redirect (Senior R1 + 산업 a/d)
**전**: "3 consecutive 0 friction + ≥ 1 external codebase"
**후**: ★ "3 iterations × 0 high-severity friction × **structurally varied inputs** (다른 size + 다른 언어 또는 adversarial) + **≥ 2 structurally different external codebases** + iter#4+ all severity ≤ low → 강제 exit"

### D6 ★ ★ 보강 (Senior R2/R4 + 산업 a/c)
**전**: friction count + deliverable rate + ∆LOC
**후**: ★ **severity-weighted friction** + deliverable rate + **touched-surface (files × subsystems)** + **close-rate** + **regression count** (iter N에서 iter <N fix 재발 0)

### D4 ★ 보강 (Senior R3)
**전**: "수정 불필요" 판단 자유
**후**: ★ rubric 4 조건 AND — (i) reproducibility ❌ (ii) frequency 1회 (iii) severity low (iv) workaround 존재

### D7 신규 — novelty requirement
- iter N의 input/scenario distribution이 N-1과 overlap이면 exit count 무효
- iter target diversity catalog 사전 작성 의무

### D8 신규 — external observer
- Phase A exit 전 ≥ 1 human checkpoint 또는 다른 model (Sonnet 4.6 또는 Opus 4.6) reviewer 의무
- closed loop self-grading 회피

### D9 신규 — Phase B 병행 결단 (★ ★ Senior 권고)
- (a) sequential — Phase A 종결 후 Phase B 진입 (현 plan)
- (b) ★ **parallel** — Phase A iter#2 시작 시점부터 1-person Phase B pilot 동시 시작 (Senior 권고)
- (c) hybrid — Phase A L1 통과 후 Phase B pilot 시작 / Phase A L2 병행

---

## 5. 권장

★ **D1~D4 유지 + D5/D6 redirect/보강 + D4 rubric 추가 + D7/D8 신규 + D9 = (b) parallel** = "B" 결단 묶음.

★ ★ Senior R5 (regression guard) = drift-validator corpus self-test 패턴 재사용 — iter#1 시점에 plugin self-test corpus 신설 의무 (★ 본체 도구 quality 격상 동반).

★ 시간 cap: iter#1 ≤ 1 day → ★ 2 day 보강 권고 (산업 평균).

---

## 6. 결단 의뢰 패턴

- **B (전체 채택)**: D5 redirect + D6 보강 + D4 rubric 추가 + D7~D9 모두 (a 또는 권장 default) + ★ ★ D9 = parallel
- **부분 채택**: 항목별 redirect (예: "D9 sequential 유지" / "D8 외부 observer 부재 유지" 등)
- **추가 의문**: 어느 항목이든 추가 검증 의뢰 가능
