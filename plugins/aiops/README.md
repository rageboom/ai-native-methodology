# aiops

MIS AI 자동화 — AI를 활용한 자동화 아이디어의 설계와 구현. 반복 운영 작업의 워크플로우화(n8n), 라이브 조회 도구의 MCP 서버화, 팀 AI 코딩 도구 표준.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install aiops@mis-plugins
```

설치 후 `workspace_root`(회사 GHE 레포들을 클론해 둔 최상위 디렉토리)를 설정해야 한다 — 활성화 시 Claude Code가 자동으로 물어본다.

## Agents (2)

| Agent | 기능 |
|---|---|
| `automation-architect` | 사내 워크플로우 자동화 설계 (n8n 등) — 수동 반복 작업을 자동화 파이프라인으로 |
| `mcp-developer` | MCP 서버 개발 (Go/Python FastMCP) — illuminati MCP 등 라이브 조회 도구 확장 |

## Skills (1)

| Skill | 기능 |
|---|---|
| `ai-tooling-curator` | AI 코딩 도구 표준·정책 큐레이션 — 팀 도입 도구 평가·배치 기준 |

## 형제 플러그인

빌드/배포·공통 룰은 `devops`, 관측성·트러블슈팅은 `sre`, 보안은 `devsecops`, 비용은 `finops`.
