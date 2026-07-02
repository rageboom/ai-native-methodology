---
name: ai-tooling-curator
description: Claude Code/Cursor/Copilot/Gemini CLI 회사 운영 표준 큐레이션. settings.json deny·CLAUDE.md/AGENTS.md 패턴·skill description cap·멀티툴 호환·onboarding 가이드·보안 정책.
when_to_use: AI 코딩 도구 회사 도입·표준 정책 수립, skill·agent 라이브러리 큐레이션, AGENTS.md 멀티툴 호환 검토, 신규 직원 onboarding 가이드 요청 시
---

# ai-tooling-curator

AI 코딩 도구를 회사 환경(HIWARE 제약·DEV/STG/LIVE·Infisical·Harbor)에 맞춰 운영하는 표준을 만들고 유지한다. 정책·가이드 산출.

## 컨텍스트 (회사)

- Claude Code (전사 표준), Cursor·Copilot·Gemini CLI 혼재 가능성
- HIWARE 게이트 — 로컬에서 cluster/server 직접 접근 불가
- 정기배포 LIVE 수요일·팀장 승인, dev→stg→live 강제

## 표준 영역

### 1. Permission 정책 (`settings.json` deny)

핵심 차단 (현재 보유):
- `rm -rf /*` 계열
- `git push --force*`, `git reset --hard*`
- `kubectl apply|delete|edit|patch|scale|rollout*`
- `helm install|upgrade|uninstall|rollback*`
- `argocd app sync|delete|set*`
- `terraform destroy|apply|state rm*`
- `ssh|scp|rsync*` (HIWARE 우회 차단)

추가 권고:
- `docker compose down*` (LIVE Compose 서비스 중단 방지)
- `mkfs*`, `dd if=*`

### 2. CLAUDE.md ↔ AGENTS.md ↔ GEMINI.md 패턴

```
~/.claude/CLAUDE.md  ←  '@AGENTS.md' 한 줄
~/.claude/AGENTS.md  →  본문 (Codex/Cursor/Cline 직접 읽음)
~/.claude/GEMINI.md  →  symlink → AGENTS.md
```

- 본문은 200줄 cap (공식 권장, 초과 시 adherence 감소)
- walk-up concatenate — 중복은 토큰 낭비, 상충은 임의 채택

### 3. Skill 라이브러리 큐레이션

- 한 도메인 = 한 skill (단일 정본)
- `description` + `when_to_use` 합쳐 1,536 자 cap
- 동명 skill 다른 위치 금지 (drift 위험)
- agent 와 동명 skill: `skills: <name>` preload 패턴 (Phase 7)

### 4. Hook 가이드

| Hook | 용도 |
|---|---|
| PreToolUse `Bash` | 위험 명령 차단 (rm -rf, force push 등) |
| PreToolUse `Edit\|Write` | 시크릿 파일(`.env`, `*.key`) 쓰기 차단 |
| PostToolUse `Edit\|Write` | 자동 포맷 (gradle/pnpm) |
| SessionStart | 환경 컨텍스트 출력 (branch, uncommitted, docker count) |
| PostCompact | 압축 후 핵심 룰 재주입 |

### 5. MCP 정책

- 시크릿: env block 평문 OK (`~/.claude/.mcp.json`) — 회사 결정. git 추적 차단 필수
- per-repo 선택: `code/.mcp.json` 은 시크릿 없는 버전, 글로벌이 실값
- 사내 MCP (infra-ops): Grafana/Jenkins/JIRA/Confluence 통합

## Onboarding 체크리스트 (신규 직원)

- [ ] Claude Code 설치 + 로그인
- [ ] `~/.claude/` 사용자 설정 배포 (settings.json deny 룰 받기)
- [ ] AGENTS.md 사본 받기 (회사 컨텍스트)
- [ ] HIWARE 접속 흐름 숙지
- [ ] illuminati MCP 인증 (env 받기, 보안 채널 통해)
- [ ] 1주차: skill 목록 한 번 훑기 (`/help` + `What skills are available?`)

## 멀티툴 호환 산출 권장

| 자산 | Claude Code | Codex/Cursor/Cline | Gemini CLI |
|---|---|---|---|
| CLAUDE.md | ✓ | ✗ | ✗ |
| AGENTS.md | ✓ (import) | ✓ | ✗ |
| GEMINI.md | ✗ | ✗ | ✓ |
| SKILL.md | ✓ | ✓ (Agent Skills 표준) | ✓ |
| `.mcp.json` | ✓ | ✓ | ✓ |

→ AGENTS.md 본문 + CLAUDE.md/GEMINI.md import/symlink 패턴이 최대 공통

## 참고

- Claude Code docs: https://code.claude.com/docs
- Agent Skills 표준: https://agentskills.io
- AGENTS.md 컨벤션: https://agents.md
- Cursor Rules: https://docs.cursor.com/context/rules
