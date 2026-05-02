# Phase A Self-Iteration Guide

> ★ ★ ★ DEC-2026-05-02-plugin-first / 12차 결단 정합. Phase A = self-iteration 무기한 / 사내 배포 (Phase B) 진입 전 의무 단계.
>
> 본 가이드 = 사용자가 본인 다른 프로젝트 (사내 legacy 코드베이스 1개) 에서 본 plugin 을 install + 1회 self-iteration 돌릴 때 절차 + 마찰점 등재 패턴.

---

## 0. 사전 조건

- Claude Code 설치 (★ 본 plugin 은 Claude Code plugin 시스템 기반)
- 분석 대상 사내 legacy 프로젝트 1개 선정 (★ 본 레포 자체로 self-iteration ❌ — 의미 약함)
- 본 레포 git clone 또는 absolute path 확보
- (★ 권장) Windows 한국어 환경에서 Semgrep 사용 시 `PYTHONUTF8=1` 환경변수 설정

---

## 1. Plugin install (marketplace 부재 시)

★ Phase B 미진입 = `marketplace.json` 부재 = local path 또는 git URL 직접 등록.

### 1.1 Local path install (★ 권장 — Phase A iteration 빠른 cadence)

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology/ai-native-methodology
/plugin install ai-native-methodology@ai-native-methodology
```

★ 두 번째 인자 (`@ai-native-methodology`) = marketplace 명 = directory 명 기본값.

### 1.2 Git URL install (사내 git 사용 시)

```bash
/plugin marketplace add https://<사내-git>/aimd/ai-native-methodology.git
/plugin install ai-native-methodology@ai-native-methodology
```

### 1.3 Reload + 확인

```bash
/reload-plugins
/plugin                  # 대화형 plugin manager — Installed 탭에 ai-native-methodology v1.4.2 표시
```

---

## 2. SessionStart 검증

분석 대상 사내 legacy 프로젝트 디렉토리에서 새 Claude Code 세션 시작:

```bash
cd <legacy-repo>
claude code
```

★ ★ 정상 동작 시 SessionStart hook 메시지:
```
[ai-native-methodology] Plugin loaded. Read CLAUDE.md for the 23 policies + 4원칙 + ★★★ no-simulation. Stage = analysis (v1.4.x default). See methodology-spec/lifecycle-contract.md for SDLC stage interfaces.
```

★ 메시지 부재 / 다른 hook 출력 = ★ 마찰점 #1 finding 등재 (§5).

---

## 3. Skill description trigger 검증

Claude 에게 다음 자연어 prompt:

```
이 코드베이스 분석 시작. legacy Spring Boot 또는 NestJS 또는 React 프로젝트야.
phase 0 input 부터 가자.
```

★ ★ 정상 동작 시 `phase-0-input` skill 자동 발동 (description trigger 매칭). Bash + Glob + Grep + Read 사용해서 input 메타 추출 → `<legacy-repo>/.aimd/phase-0-input.json` 산출.

★ skill 미발동 / 잘못된 skill 발동 = ★ 마찰점 finding 등재.

---

## 4. PostToolUse hook 검증

Claude 가 어떤 파일 Write 또는 Edit 후 (예: `.aimd/output/inventory.json` 작성):

★ ★ hooks.json 의 PostToolUse trigger:
```
[hook] node ${CLAUDE_PLUGIN_ROOT}/tools/drift-validator/src/cli.js .aimd/output 2>&1 || true
```

★ ★ ★ 검증 항목:
- `${CLAUDE_PLUGIN_ROOT}` 변수 해석 정상? (★ Claude Code 자동 치환 / 미해석 시 ENOENT — F-PA-002 후보)
- user project cwd 에 `.aimd/output/` 디렉토리 존재 시 — drift-validator 가 정상 실행 + json/mermaid 짝 발견 → drift 체크
- `.aimd/output/` 부재 시 — `path not found` → exit 2 → `|| true` 로 무시 (★ silent fail-soft)
- drift ≥ 1 시 — Claude Code 가 hook 출력 표시 (★ 사용자 인지 가능)

★ ★ 위 4건 중 하나라도 실패 = ★ 마찰점 finding (★ 도구 격상 trigger 가능성 높음).

### 4.1 ★ 도구 격상 carry — drift-validator graceful 모드

본 hook command 는 ★ 단순 fail-soft 패턴. 본격 hook 통합 = drift-validator 격상 carry:
- ★ `.aimd/output` 부재 시 silent exit 0 (★ "path not found" stderr 출력 안 함)
- ★ `--plugin-mode` 옵션 신설 — 점진/빠른 hook 반응 모드 (recently edited 파일만 비교)
- ★ `--recently-edited` 옵션 신설 — git 또는 mtime 기반 최근 N분 파일 필터

→ ★ Phase A.1 carry 등재 (★ feedback_methodology_body_priority — 본체 도구 격상 후 plugin sync).

---

## 5. 마찰점 finding 등재 패턴

★ 모든 마찰점은 `<legacy-repo>/.aimd/findings.md` 에 누적 (★ skills/_base/log-finding 정합):

### finding template

```markdown
## F-PA-NNN — <한 줄 요약>

- **Type**: gap / bug / quality / methodology-violation
- **Severity**: critical / high / medium / low
- **Phase A iteration**: #N
- **Date**: 2026-MM-DD
- **Reproduction**: <steps>
- **Expected**: <기대 동작>
- **Actual**: <실제 동작>
- **Plugin asset 영향**: <skill/agent/hook/tool 명>
- **본체 영향**: <schemas/methodology-spec/docs/adr/tools 중>
- **Action**: <plugin 즉시 수정 / 본체 격상 후보 / Phase B carry / v2.0 carry>
- **Confidence**: high / medium / low
```

### 예시 — `${CLAUDE_PLUGIN_ROOT}` 변수 해석 실패 (가설)

```markdown
## F-PA-001 — PostToolUse drift-validator hook ${CLAUDE_PLUGIN_ROOT} 미해석

- **Type**: bug
- **Severity**: high
- **Phase A iteration**: #1
- **Date**: 2026-05-03
- **Reproduction**: 사내 legacy Spring Boot 프로젝트에서 plugin install 후 Claude 가 .aimd/phase-0-input.json Write → PostToolUse hook 실행 시 `node ${CLAUDE_PLUGIN_ROOT}/tools/drift-validator/src/cli.js` 가 literal 문자열로 실행 → ENOENT
- **Expected**: ${CLAUDE_PLUGIN_ROOT} 가 plugin 절대경로로 자동 치환 → drift-validator 정상 실행
- **Actual**: 변수 미치환 / ENOENT
- **Plugin asset 영향**: hooks/hooks.json
- **본체 영향**: 없음 (plugin 자산만)
- **Action**: hooks.json command 갱신 — `${CLAUDE_PLUGIN_ROOT}` 가 미해석 환경이면 `node tools/drift-validator/src/cli.js` (cwd 기반) 로 fallback
- **Confidence**: high
```

---

## 6. 재시도 cadence (4원칙 §4 정합)

마찰점 발견 → plugin 즉시 수정 → 재시도. 한 iteration 종료 조건:

| 종료 조건 | 다음 단계 |
|---|---|
| ★ 7대 산출물 1개 이상 정상 산출 + 마찰점 0~3건 (모두 plugin 즉시 수정 완료) | ★ Phase A iteration #N+1 진입 (★ 다른 사내 프로젝트 또는 다른 phase) |
| ★ ★ 마찰점 4건+ 또는 본체 격상 trigger 1건 + | ★ Phase A iteration 일시 중단 → 본체 격상 → plugin sync → iteration #N 재시도 |
| ★ ★ ★ Phase A 전체 자격 충족 (사용자 만족 결단 + 7대 산출물 안정 동작 + G1/G2 v2.0 carry 결단 검증) | ★ ★ ★ Phase B 진입 (release.yml + marketplace.json + LICENSE 정식 + InfoSec audit + BE 1팀 pilot) |

---

## 7. Phase A iteration 결과 보고 패턴

★ 한 iteration 종료 시 본 레포에 commit:

```
git checkout -b phase-a-iteration-N
# .aimd/findings.md 또는 docs/phase-a-iteration-N-report.md 작성
git add ai-native-methodology/docs/phase-a-iteration-N-report.md
git commit -m "Phase A iteration N — <대상 프로젝트> / 마찰점 X건 / plugin 수정 Y건"
```

보고서 핵심 항목:
- 대상 사내 프로젝트 (★ 익명화 가능 / project_alias)
- iteration 일자 + 소요 시간
- 발견 마찰점 (F-PA-NNN 목록 + severity 분포)
- plugin 즉시 수정 (★ commit hash)
- 본체 격상 trigger (★ 별도 commit / DEC 등재)
- 산출 7대 산출물 중 정상 작동 항목
- 다음 iteration 권고 (다른 phase / 다른 stack / Phase B 진입 자격 평가)

---

## 8. 의도적 carry (★ Phase A iteration 중 만나면 즉시 종료 ❌ — Phase B 또는 v2.0 carry 등재)

| carry | 분류 | 사유 |
|---|---|---|
| `tools/*/cli.mjs` MCP wrapper | Phase A.1 | 현재 standalone CLI (`src/cli.js`) 직접 호출 fallback / MCP 미사용 |
| **★ drift-validator graceful 모드 + `--plugin-mode` + `--recently-edited`** | Phase A.1 | ★ ★ ★ F-PA-001 즉시 fix 시 발견 / 본체 도구 격상 후 hooks.json command 강화 |
| `adoption/dist/internal-v1.4/` 빌드 | Phase B | release.yml 자동화 후 |
| `marketplace.json` | Phase B | 사내 marketplace 진입점 |
| LICENSE 정식 | Phase B | 현재 placeholder |
| InfoSec audit | Phase B | 사내 보안팀 결단 |
| BE 1팀 pilot | Phase B | 사용자 만족 결단 후 |
| G1 `.aimd/state.json` (사용자 프로젝트 stage 추적) | v2.0 | analysis stage only / lifecycle 확장 시 |
| G2 stage-aware hook routing | v2.0 | analysis stage only |
| `enter-stage` skill | v2.0 | lifecycle 확장 시 |
| `lifecycle-contract-validator` runtime | v2.0 | lifecycle 확장 시 |

---

## 9. 본 가이드 변경 이력

- v1.4.2 (2026-05-02): 신설. Phase A iteration 0회 → 1회 진입 자격 충족 시 갱신.

---

## 10. 관련 자산

- `methodology-spec/lifecycle-contract.md` — SDLC 단계 간 data contract
- `decisions/DEC-2026-05-02-plugin-first.md` — 14차 누적 결단
- memory `project_plugin_first_distribution.md` — Phase A 정의
- memory `feedback_methodology_body_priority.md` — 본체 + plugin sync 우선원칙
- `.claude-plugin/plugin.json` — plugin manifest (v1.4.2)
- `hooks/hooks.json` — SessionStart + PostToolUse hook
- `skills/_base/log-finding/SKILL.md` — finding 등재 메커니즘

**End of Phase A Self-Iteration Guide.**
