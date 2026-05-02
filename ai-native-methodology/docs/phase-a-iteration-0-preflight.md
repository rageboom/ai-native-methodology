# Phase A iteration 0 — Pre-flight 점검 보고

> 사용자 self-iteration #1 진입 직전 본 세션 (2026-05-02 / Claude Opus 4.7) 사전 마찰점 검출.
> 의도: 사용자가 본인 사내 legacy 프로젝트에서 self-iteration #1 시작 시 ★ 알려진 마찰점 0개로 시작.

---

## 점검 범위

본 레포 자체 (★ self-iteration ❌) — 단, plugin 자산 (`.claude-plugin/` + `skills/` + `agents/` + `hooks/` + `flows/`) 의 sanity 만 검증. 실 plugin install + user project 실행은 사용자 self-iteration #1 영역.

| 점검 항목 | 결과 |
|---|---|
| `plugin.json` v1.4.2 + 필수 필드 (name / version / description / author / homepage / license / keywords) | ✅ pass |
| `hooks/hooks.json` syntax + SessionStart command (echo) + PostToolUse command | ✅ pass (★ F-PA-001 fix 후) |
| `agents/_base/{senior-engineer,official-docs-checker,industry-case-researcher}/<name>.md` frontmatter | ✅ description / tools / model 명시 (★ Claude Code agent spec 정합 미검증 — 사용자 검증 영역) |
| `skills/_base/{apply-template,log-finding,apply-baseline-ratchet}/SKILL.md` frontmatter | ✅ name / description / allowed-tools 명시 |
| `skills/analysis/<phase>/SKILL.md` 18종 frontmatter | ✅ 본 세션 plugin sync 후 ADR-009 단계 5 정합 (★ aspect-static-security + phase-5-openapi) |
| `flows/analysis.phase-flow.{json,mermaid}` 짝 존재 | ✅ pass |
| `methodology-spec/lifecycle-contract.md` SDLC 5 stage 명세 | ✅ pass |
| `tools/static-runner/rules/jwt-localstorage.{yml,ts}` (v1.4.2) | ✅ pass + npm test 11/11 + semgrep --test 1/1 |

---

## ★ 사전 마찰점 발견 (3건 / 모두 즉시 fix — 사용자 plugin install 명령 시도 중 라이브 발견)

### F-PA-001 — drift-validator `--plugin-mode --recently-edited` 옵션 부재

- **Type**: bug
- **Severity**: high (★ hooks.json 직접 영향 / PostToolUse hook 모든 호출 fail trigger)
- **Phase A iteration**: 0 (pre-flight)
- **Date**: 2026-05-02
- **Reproduction**: `node ai-native-methodology/tools/drift-validator/src/cli.js --plugin-mode --recently-edited` 실행 → `path not found: --plugin-mode` 에러 → exit 2
- **Expected**: PostToolUse hook 이 user project 의 `.aimd/output/` drift 체크 silent 실행
- **Actual**: 옵션 미지원 → exit 2 → hooks.json `|| true` 로 silent 처리되지만 의미 부재 (drift 체크 자체 불가)
- **Plugin asset 영향**: `hooks/hooks.json` (PostToolUse Write|Edit matcher)
- **본체 영향**: `tools/drift-validator/src/cli.js` (★ 옵션 신설 carry — Phase A.1)
- **Action**: ★ 즉시 fix 1건 + Phase A.1 carry 1건
  - **즉시 fix**: `hooks/hooks.json` command → `node ${CLAUDE_PLUGIN_ROOT}/tools/drift-validator/src/cli.js .aimd/output 2>&1 || true` (★ user project cwd `.aimd/output/` 에 짝 발견 시 drift 체크 / 부재 시 silent fail-soft)
  - **Phase A.1 carry**: drift-validator graceful 모드 격상 (★ `.aimd/output` 부재 시 silent exit 0 + `--plugin-mode` + `--recently-edited` 신설)
- **Confidence**: high

### F-PA-007 — marketplace.json 부재 (★ Phase A 진입 자체 차단)

- **Type**: bug (★ documentation gap)
- **Severity**: ★ ★ ★ critical (★ Phase B carry 로 분류했으나 실은 Phase A 진입 의무)
- **Phase A iteration**: 0 (★ 사용자 `claude plugin marketplace add` 명령 시도 중 발견)
- **Date**: 2026-05-02
- **Reproduction**: `claude plugin marketplace add /local/path/to/plugin-dir` → `Failed to add marketplace: Marketplace file not found at <plugin-dir>/.claude-plugin/marketplace.json`
- **Expected**: phase-a-iteration-guide.md §1.1 의 명령이 그대로 작동
- **Actual**: marketplace.json 파일 부재 = local path 등록도 차단 (★ Phase B carry 가정 무효)
- **Plugin asset 영향**: `.claude-plugin/marketplace.json` (★ 신규 파일)
- **본체 영향**: 없음
- **Action**: ★ 즉시 fix — minimal marketplace.json 작성 (name + owner + plugins[] / source 표기 핵심)
- **★ 메타 lesson**: Phase B carry 로 분류했던 marketplace.json 이 ★ Phase A self-iteration 진입 의무 = ★ Phase A/B 경계 재분류 필요. release.yml + LICENSE + InfoSec 등은 여전히 Phase B 이지만 marketplace.json 은 Phase A.0 (★ Phase A 시작 자격) 으로 격상.
- **Confidence**: high

### F-PA-008 — marketplace.json source `"."` (단순 문자열) v2.1.126 미지원

- **Type**: bug (★ documentation gap / Claude Code version compatibility)
- **Severity**: ★ ★ high
- **Phase A iteration**: 0 (★ F-PA-007 fix 직후 install 명령 재시도 중 발견)
- **Date**: 2026-05-02
- **Reproduction**: marketplace.json 의 plugin source = `"."` (단순 문자열 / claude-code-guide 1차 답변 권장) → `claude plugin install` 시 `Failed to install plugin: This plugin uses a source type your Claude Code version does not support. Update Claude Code and try again.`
- **Expected**: `"."` 또는 `"./"` 어느쪽이든 작동
- **Actual**: Claude Code v2.1.126 에서 `"."` 미지원 / `"./"` 만 지원 (★ trailing slash 의무 / claude-code-guide 2차 답변에서 정정)
- **Plugin asset 영향**: `.claude-plugin/marketplace.json` (source 필드)
- **본체 영향**: 없음
- **Action**: ★ 즉시 fix — `"source": "."` → `"source": "./"`. marketplace remove + re-add + install 재시도 → ★ ★ ★ 성공 (`Successfully installed plugin: ai-native-methodology@ai-native-methodology / Version: 1.4.2 / Scope: user / Status: ✔ enabled`)
- **★ 메타 lesson**: 1차 source 표기 시 trailing slash 정합 의무 — 가이드 §1.1 example 보강 필요
- **Confidence**: high

---

## ★ ★ ★ Plugin install 성공 (2026-05-02 / 본 세션)

```
$ claude plugin list
Installed plugins:

  ❯ ai-native-methodology@ai-native-methodology
    Version: 1.4.2
    Scope: user
    Status: ✔ enabled
```

★ ★ Phase A.0 진입 자격 (Phase A self-iteration 시작 가능 상태) ★ 도달.

★ ★ ★ 단, 본 세션은 plugin install **이전** 시작된 세션이라 SessionStart hook 메시지 미표시 — ★ 사용자가 새 Claude Code 세션 시작 시 hook 검증 가능 (F-PA-002 후보 메커니즘 검증 영역).

---

## ☐ 사용자 self-iteration #1 검증 영역 (본 세션 검증 ❌)

### F-PA-002 후보 — `${CLAUDE_PLUGIN_ROOT}` 변수 해석

- **Reproduction**: 사용자 본인 사내 legacy 프로젝트에서 plugin install 후 Claude 가 `.aimd/output/<deliverable>.json` Write → PostToolUse hook 실행
- **Expected**: `${CLAUDE_PLUGIN_ROOT}` 자동 치환 → drift-validator 정상 실행
- **Actual (★ 사용자 검증)**: 변수 미치환 시 ENOENT
- **검증 영역**: Claude Code plugin 시스템의 환경변수 해석 메커니즘 — 본 세션에선 검증 불가

### F-PA-003 후보 — Skill description trigger 정밀도

- **Reproduction**: 사용자가 자연어 prompt ("이 코드베이스 분석 시작") 입력 → 의도한 `phase-0-input` skill 자동 발동?
- **Actual (★ 사용자 검증)**: 다른 skill 발동 또는 미발동 시 description 정밀화 carry

### F-PA-004 후보 — Agent frontmatter Claude Code spec 정합 (★ ★ resolved / 2026-05-02 별도 conversation)

- **Reproduction**: `agents/_base/senior-engineer/senior-engineer.md` 가 Claude Code subagent 시스템에서 정상 인식?
- **★ ★ 결과**: ★ static check 결과 — 3 agent 모두 frontmatter `name` 필드 ★ 부재. research (claude-code-guide) §1 의 "name 필드 의무 + 파일명 매칭" 권고 정합 ❌.
- **★ ★ 즉시 fix 적용 (별도 conversation)**:
  - `agents/_base/industry-case-researcher/industry-case-researcher.md` — `name: industry-case-researcher` 추가
  - `agents/_base/official-docs-checker/official-docs-checker.md` — `name: official-docs-checker` 추가
  - `agents/_base/senior-engineer/senior-engineer.md` — `name: senior-engineer` 추가
- **status**: ★ resolved (★ 사용자 dynamic 검증 시 추가 마찰 가능 — agents 디렉토리 nesting 자체는 별도 검증 의무)

### F-PA-005 후보 — Bash 도구 cwd 가정 (plugin root vs user project)

- **Reproduction**: skill 안의 Bash 호출 시 cwd 가 user project root 인가 plugin root 인가?
- **Actual (★ 사용자 검증)**: cwd 차이 시 file 경로 가정 깨짐

### F-PA-006 후보 — Windows 한국어 환경 cp949 (★ 본 세션 동급 사례)

- **Reproduction**: 사용자가 Windows 한국어 환경에서 plugin 사용 + Semgrep 호출 시 yml 한글 message 처리
- **Mitigation 사전 등재**: `PYTHONUTF8=1` 환경변수 의무 (★ phase-a-iteration-guide.md §0 + skills/analysis/aspect-static-security/SKILL.md §4 명시)
- **★ 본 세션 발견 + 가이드 등재 완료** = 사용자 검증 시 추가 마찰점 없을 것 예상

---

## ★ Pre-flight 결과 진술

- **즉시 fix 1건** — F-PA-001 / hooks.json command 변경 (★ 본 commit 포함)
- **Phase A.1 carry 1건 신설** — drift-validator graceful 모드 + `--plugin-mode` + `--recently-edited`
- **사용자 self-iteration 검증 영역** — F-PA-002~006 후보 5건 (★ 본 세션 검증 불가)

→ ★ ★ 사용자가 self-iteration #1 시작 시 알려진 마찰점 = **0건** (F-PA-001 fix 후). F-PA-002~006 은 **사용자 검증 결과 따라** 즉시 fix / Phase A.1 carry / Phase B carry / v2.0 carry 분류.

---

## 다음 세션 가이드

사용자가 self-iteration #1 진행 후 본 레포로 돌아와:

1. `<user-project>/.aimd/findings.md` 의 F-PA-NNN 등재 내용을 본 레포 `docs/phase-a-iteration-1-report.md` 로 옮김
2. plugin 즉시 수정 / 본체 격상 / Phase A.1 carry / Phase B carry / v2.0 carry 분류
3. 즉시 수정 항목 commit
4. carry 등재 항목 → `decisions/STATUS.md` 갱신 + INDEX.md DEC entry
5. iteration #2 진입 자격 평가

---

**End of Phase A iteration 0 pre-flight report.**

---

## ★ Post-flight 보강 (★ 2026-05-02 별도 conversation 신규 발견 / iter 0 commit 후)

> ★ 본 섹션 = ★ iter 0 종결 후 별도 conversation 에서 lightweight research × 3 진행 중 ★ static check 추가 발견. iter 0 commit `29f040e` 의 hooks.json fix 후에도 ★ 잔존하는 마찰점.

### F-PA-009 — PostToolUse hook **매 Write/Edit 마다 Node startup** (medium)

- **Type**: performance / UX
- **Severity**: medium (★ 매 호출 200-500ms 지연 / 사용자 작업 마찰 / 모든 plugin 사용자 영향)
- **Phase A iteration**: 0 post-flight
- **Date**: 2026-05-02
- **Reproduction**: 사용자 plugin install 후 임의 파일 Write/Edit → PostToolUse hook trigger → `node ${CLAUDE_PLUGIN_ROOT}/tools/drift-validator/src/cli.js .aimd/output 2>&1 || true` 매번 Node startup
- **Expected**: drift 검증 의도가 있는 경우만 trigger (예: `.aimd/output/` 내부 Write 만)
- **Actual**: matcher `"Write|Edit"` = tool-level 만 / path-level filter 없음 → ★ 모든 Write/Edit trigger
- **Root cause**: Claude Code hook matcher = tool name 단위 (path 단위 ❌) — 매 호출 trigger 불가피
- **fix 후보**:
  - (A) ★ hook command 내부 path check — `[ -d .aimd/output ] && node ... || exit 0` (POSIX) / Windows 호환 분기 의무
  - (B) ★ hook 제거 — drift 검증을 manual skill 호출 (`apply-baseline-ratchet` 또는 신설 `validate-drift` skill) 으로 이전 / on-demand 검증
  - (C) hook 유지 + Node script 내부 fast-path — readdirSync 미존재 시 즉시 exit (★ 현재도 try/catch 로 처리되지만 Node startup 자체 200-500ms 비용 잔존)
- **권장**: ★ ★ (B) — manual skill 호출로 이전. drift 검증은 사용자 의도된 시점만 / 매 Write/Edit UX 마찰 0.
- **Phase A.1 carry 후보**: hook 재설계 결단 (B 채택 시 hooks.json PostToolUse 제거)
- **Confidence**: high

### F-PA-010 — PostToolUse `|| true` silent error masking (medium / no-simulation 정책 위배)

- **Type**: bug (★ silent failure / no-simulation 정책 위배)
- **Severity**: medium (★ ★ ★ no-simulation 정책 핵심 위배 — 도구 결과 위조 효과)
- **Phase A iteration**: 0 post-flight
- **Date**: 2026-05-02
- **Reproduction**: 사용자 `.aimd/output/` 내부에 ★ ★ 진짜 drift 가 발생한 .json/.mermaid 짝 Write/Edit → drift-validator exit 1 → `2>&1 || true` 가 stderr+stdout 모두 마스킹 → 사용자 무지각
- **Expected**: drift 발견 시 사용자에게 명시적 경고 표시 (statusMessage 또는 stderr)
- **Actual**: silent fail / 사용자가 drift 발생 자체 인지 ❌
- **★ 메타 lesson**: ★ ★ ★ v1.4.1 carry-1 의 `result_hash: null` bug 동급 패턴 — silent fail = no-simulation 정책 핵심 (★ ★ 도구 결과 위조 차단) 위배
- **Root cause**: iter 0 commit `29f040e` 의 hook command 변경 시 `|| true` ★ 보존. 의도 = ".aimd/output 부재 시 silent fail-soft" 였으나 ★ ★ 실제 drift 발생 시도 같이 silent fail.
- **fix**: F-PA-009 (B) 채택 시 자동 해소 (manual skill 호출 시 stderr 자연 노출). F-PA-009 (A) 채택 시 path check + drift 발견 시 stderr 조건부 노출 의무.
- **Confidence**: high

---

## ★ Post-flight 결과 진술

- **iter 0 자체 fix** = F-PA-001 / F-PA-007 / F-PA-008 (★ 3건 / install 성공 도달)
- **별도 conversation 즉시 fix** = F-PA-004 후보 resolved (agents 3종 name 필드)
- **신규 마찰점 등재** = F-PA-009 (medium / Node startup 마찰) + F-PA-010 (medium / silent fail)
- **사용자 self-iteration #1 검증 영역 잔존** = F-PA-002 / F-PA-003 / F-PA-005 / F-PA-006 (4건 / 사용자 검증 대기)

→ ★ ★ iter 1 진입 자격 = ★ F-PA-009/010 결단 (manual skill 이전 vs path check 보강) + 사용자 self-iteration 검증 4건 진행 후 평가.

---

## ★ ★ ★ 메타 lesson (★ 2026-05-02 본 conversation slop 발견)

★ ★ ★ ★ ★ 별도 conversation 에서 본 plan-phase-a-self-iteration.md + iter#1 friction-findings.md ★ duplicate 작업 → ★ ★ revert + salvage 진행.

★ ★ slop 원인:
- 본 conversation 시작 시 `git log --oneline -30` 만 보고 commit `f223880` 까지만 인지
- ★ memory + STATUS + INDEX 어디에도 iter 0 commit (`520166d` / `29f040e` / `ebb9a0d` / 같은 날 17:18-17:58) ★ 미반영
- ★ 다른 세션 commit 인지 의무 검사 누락

★ ★ 해소 (본 conversation salvage):
- duplicate revert (plan + iter#1 디렉토리)
- 가치 있는 부분 keep (★ research-phase-a-summary.md / agents 3종 name 필드 fix)
- 신규 발견 통합 (★ F-PA-009 / F-PA-010 본 섹션)
- ★ memory 신규 등재 의무 — "다른 세션 commit 인지 / git log 깊이 검사 / memory + STATUS 동기화"
