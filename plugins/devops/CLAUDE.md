# devops 플러그인 — 작업 컨텍스트

`mis-plugins` 마켓플레이스 모노레포의 플러그인. 마켓플레이스-레벨 규약(빌드·배포·티켓)은 레포 루트 `CLAUDE.md` 참조.

## 무엇

dohyeonkim(Smilegate MIS DevOps)의 Claude Code 설정을 역할별 5개 플러그인(devops/sre/devsecops/finops/aiops)으로 분리 배포한 것의 **base 플러그인**. 빌드/배포 자동화 + K8s 생태계 구축 + MIS 공통 워크플로우 rule-skill 보유. 나머지 4개 역할 플러그인의 관계는 `README.md` "형제 플러그인" 절 참조.

## 이식성 — `userConfig.workspace_root`

이 플러그인은 dohyeonkim 개인 머신뿐 아니라 **다른 개발자도 그대로 설치해 쓸 수 있어야 한다**. 회사 레포 경로는 하드코딩 대신 `${user_config.workspace_root}` 치환을 쓴다(공식: plugins-reference #user-configuration). 새 asset을 추가하거나 고칠 때 **절대경로(`/Users/xxx/...`)를 다시 넣지 않는다** — `grep -rn "/Users/" plugins/ --include="*.md"`로 회귀 여부를 확인한다. `~/.claude/...`는 Claude Code 표준 경로라 예외.

공식 문서 기준 `${user_config.KEY}` 치환 보장 범위는 MCP/LSP 설정·hook 명령·skill/agent 본문이다. **command 본문 치환은 미보장** — 그래서 SessionStart hook(env-check)이 workspace_root 실값을 세션 컨텍스트에 출력해 command가 그 값을 참조할 수 있게 한다.

## 심볼릭 링크 단일 소스 구조 (2026-07-02)

이 레포가 dohyeonkim 로컬 Claude Code 설정의 유일한 편집 지점이다.

```
code/.claude/skills/{devops,sre,devsecops,finops,aiops}  →  (symlink)  →  plugins/<name>/
code/.claude/rules/*.md      →  (symlink, 개별)  →  plugins/devops/rules/*.md
code/.claude/commands/*.md   →  (symlink, 개인 3종)  →  <repo>/personal/commands/*.md
~/.claude/{agents,skills,commands,rules,hooks}/*, AGENTS.md  →  (symlink, 개별)  →  <repo>/personal/*
```

- `.claude-plugin/plugin.json`이 있는 폴더를 skills 디렉토리에 두면 마켓플레이스 설치 없이 `<name>@skills-dir`로 자동 로드된다(공식: plugins-reference #skills-directory-plugins). skill 변경은 즉시, agents/hooks 변경은 `/reload-plugins` 필요.
- 이관 전 workspace 원본은 `code/.claude/.migrated-to-devops-toolkit-backup/`에 보관.
- 개인 전용 자산(다른 사람에게 이식 불가·개인정보 포함)은 레포 루트 `personal/`에 보관 — `.gitignore` 처리로 **git 커밋·push 안 됨** + npm `files` allowlist 밖이라 배포에서도 제외. 상세는 `personal/README.md`.

## rules/ 이중 관리

`rules/*.md`(workspace symlink 원본)와 `skills/rule-*/SKILL.md`(marketplace 배포용)는 내용이 같다 — **바꿀 땐 두 곳 모두 갱신**. devsecops/finops의 `devsecops-review`/`finops-review` skill은 `agents/infra-reviewer.md` §2/§4와 같은 내용 — 동일 규칙.

## 알려진 후속 (carry)

- MIS-GitOps/MIS-DevOps 등 project-scope `.claude/` 자산은 각 레포가 정본, 이 플러그인 범위 밖.
- illuminati MCP는 **서버 소스까지 이 플러그인이 정본**(`server/` — 2026-07-02 MIS-DevOps에서 이관, 구명 infra-ops). launcher(`scripts/illuminati-mcp-launch.sh`)가 CLAUDE_PLUGIN_DATA에 venv를 자동 부트스트랩하고 `server/pyproject.toml` version이 바뀌면 재설치한다 — **서버 코드 수정 시 그 version을 반드시 bump**. user-scope 중복/`ILLUMINATI_DISABLE=1`/python3 부재 시 조용히 no-op. 서버 테스트: `python -m pytest server/tests/`. codegraph MCP는 미동봉(머신별 인덱스).
- 버전 3-way 정합: `node scripts/version-check.js --plugin devops`. 배포: `node scripts/publish.js --plugin devops` (Node 22 필요).
