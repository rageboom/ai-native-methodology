# Common Errors — FAQ (★ chain harness 운영)

본 가이드 = plugin user 가 install 후 자주 마주칠 마찰점 + 해결 방법.

## 1. Install / Hook

### Q1. Plugin install 후 SessionStart hook 메시지 안 뜸

**증상**: 세션 시작 시 `[ai-native-methodology] Plugin loaded...` 메시지 부재.

**원인** + **해결**:
- (a) `marketplace add` path 잘못 — `/plugin marketplace list` 로 확인 / 절대경로 의무
- (b) `/reload-plugins` 안 함 — install 후 reload 명령 실행
- (c) hooks.json 부재 — dist 안 `hooks/hooks.json` 존재 확인 (`find ~/.claude/plugins/ai-native-methodology -name hooks.json`)
- (d) Claude Code 버전 < hooks 지원 — 업그레이드

### Q2. UserPromptSubmit hook 발동 안 함 (chain-driver 권고 stderr 안 뜸)

**증상**: "기획 단계 시작" 같은 prompt 입력했는데 chain-driver 가 권고 안 함.

**원인** + **해결**:
- (a) matcher 패턴 미스 — hooks.json 의 `matcher: "(planning|기획|spec|명세|behavior|test|테스트|implement|구현)"` 확인. 한국어/영어 alias 외 keyword 는 자동 매칭 ❌
- (b) `${CLAUDE_PLUGIN_ROOT}` 환경변수 inject 안 됨 — Claude Code 버전 확인
- (c) chain-driver hooks-bridge 실행 실패 — stderr 확인 (`tail -f ~/.claude/logs/...`)

## 2. Version mismatch

### Q3. README v1.4.2 / CLAUDE v1.3.0 / plugin.json v2.0.0-rc1 — 어느 게 맞나?

★ ★ cleanup round 2-A 직전 (2026-05-06 b25a8ad commit 전) build 받은 사용자만 해당. 본 commit 이후 = 모두 v2.0.0 정합 (★ v2.0.0 final 2026-05-07~).

**해결**: 최신 dist artifact 재다운로드 + reinstall.

### Q4. plugin.json 과 CHANGELOG / package.json 의 version mismatch

**해결**: `npm run version:check` → 3 source 정합 검증. 차이 발견 시 plugin.json 기준 (★ source-of-truth = ADR-010 정합) sync.

## 3. Chain harness state.blocked 풀이

### Q5. `chain-driver next` 가 exit 2 (blocked) — 풀이 절차?

```bash
# 1. 현재 state 확인
node tools/chain-driver/src/cli.js state

# 2. block_reason 식별:
#    "validator_critical" / "validator_high"  → finding fix 필요
#    "user_intervention"                      → 사용자 명시 결단 입력
#    "tmp_files_pending"                      → recoverTmpFiles 호출
#    "schema_migration"                       → chain-driver migrate

# 3. validator finding fix
#    각 finding 의 file/line + kind 확인
#    source 수정 후 chain-driver next 재시도
```

### Q6. validator finding 이 너무 많아 fix 끝이 안 보임

**원인**: legacy 도입 시 결함 폭증 (특히 정적 분석 / drift / coverage). zero-defect 즉시 강제 ❌.

**해결** (★ ADR-010 baseline + ratchet):
```bash
# baseline 작성 (현재 결함 수)
node tools/<validator>/src/cli.js ... --write-baseline .baseline.json

# ratchet mode (신규 결함만 차단)
node tools/<validator>/src/cli.js ... --baseline .baseline.json --ratchet
```

→ 매 sprint baseline 1~5% 축소 의무 (점진 quality gate).

### Q7. PreToolUse hook 이 Write/Edit 차단 — 우회 방법?

★ ★ ★ 우회 ❌. mechanical gate trio (iii) 의 의도 = LLM "통과한 척" 시뮬 차단. fix 의무.

만약 정말 우회 필요 시 (예: hook 자체 디버그):
- chain-driver hooks-bridge 명령에 `--dry-run` 추가 (현재 미지원 / sub-plan 후속 carry)
- 또는 `<project>/.aimd/state.json` 의 `blocked` 필드 직접 false (★ 위험 / no-simulation 정책 위배 의도가 있을 시 finding 으로 등재)

## 4. RED / GREEN 의무

### Q8. chain 3 (test) 종결 — RED 가 진짜 RED 인가?

**검증**:
- `<project>/.aimd/output/test/result_hash.json` 의 `pass_count: 0` + `fail_count: N` 확인
- `tool_stdout_path` 의 raw log 직접 확인 (test runner 출력)
- `result_hash` 가 sha256 valid (★ SARIF Appendix F 정합 / framework_neutral)

**Q**: AI 가 "RED 확인했다" 라고만 답하면?
**A**: 5종 물증 7 필드 부재 시 schema if/then 의무 위반 → schema-validator finding → state.blocked=true.

### Q9. chain 4 (impl) 종결 — GREEN 100% pass 가 진짜인가?

**검증** (Q8 와 동일 + 추가):
- `pass_count` = `total_count` / `fail_count: 0`
- `--allow-execute` flag 사용됨 (test-impl-pass-validator 의무)
- chain 3 의 test code 가 변경 안 됨 (★ git diff `<project>/.aimd/output/test/` 확인)

## 5. Build / dist artifact

### Q10. `npm run build` 실패 — version-check failed

**해결**: `npm run version:check` 단독 실행 → 3 source 차이 식별 후 plugin.json 기준 sync.

### Q11. dist artifact size — file count 너무 많지 않나?

★ cleanup round 2 series 종결 후 v2.0.0 = **256 files**. workspace developer only 자료 (test/corpus/fixtures) 모두 EXCLUDE / guides/ 5 자산 + 각 폴더 README 정합 / paradigm v2.0.0 정식.

### Q12. CHECKSUMS.txt 무결성 검증 fail

```bash
cd dist/ai-native-methodology-v2.0.0
shasum -a 256 -c CHECKSUMS.txt | grep -v "OK$"
# → 어느 파일 hash mismatch 인지 확인
```

원인: dist 안 file 수동 편집됨 (build script 외 변경). `npm run build` 재실행으로 refresh.

## 6. 자연어 prompt 매칭

### Q13. 자연어 prompt → skill 매칭 안 됨

**해결**: [first-prompt-cookbook.md](./first-prompt-cookbook.md) 의 prompt 표 확인 / 명시적 키워드 사용. 매칭 폭 좁다면 finding 등재 (skill description 보강 carry).

### Q14. Skill 가 발동했는데 의도와 다른 동작

**원인**: skill description 매칭이 다른 skill 과 겹침.

**해결**: 명시 호출 — `@skills/analysis/phase-N-NAME/SKILL.md`.

## 7. 참조

- [`getting-started.md`](./getting-started.md) — 10분 walkthrough
- [`chain-harness-guide.md`](./chain-harness-guide.md) — chain harness mental model + state.json
- [`first-prompt-cookbook.md`](./first-prompt-cookbook.md) — 자연어 → skill 매핑

## 8. Finding 등재 (사용자 피드백 자산화)

본 가이드에 없는 마찰점 발견 시 — 사용자 자체 프로젝트의 `findings/` 디렉토리에 등재 + 본 plugin 의 GitHub Issue 또는 사내 wiki 에 보고. v2.0.x 후속 patch / round cleanup 시 본 가이드 보강.
