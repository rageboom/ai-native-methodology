# devops

MIS 빌드/배포 자동화 + Kubernetes 생태계 구축. 역할별 5개 플러그인(devops/sre/devsecops/finops/aiops)의 base — MIS 공통 워크플로우 rule-skill과 illuminati MCP(운영 조회/쓰기 53-tool)를 이 플러그인이 보유한다.

## 설치 (4단계)

### 1단계 — 플러그인 설치

Claude Code에서:

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install devops@mis-plugins
```

### 2단계 — workspace_root 입력

활성화 시 Claude Code가 자동으로 물어본다. 회사 GHE 레포들을 클론해 둔 최상위 디렉토리를 입력한다 (예: `MIS-DevOps`/`MIS-GitOps`/`eam`이 나란히 있는 폴더). 각자 폴더 구조가 달라도 이 값 하나만 맞추면 동일하게 동작한다.

### 3단계 — 환경변수 입력 (개인 토큰/계정)

`~/.zshrc`에 아래 블록을 복붙하고 본인 값을 채운 뒤 `source ~/.zshrc`. **쓰는 도메인 것만 채워도 된다** — 비워둔 도메인의 tool만 동작하지 않고 나머지는 전부 정상이다.

```bash
# ── illuminati MCP 자격증명 (빈 값 = 본인 토큰/계정만 채우면 됨) ──────
# Grafana API Key — 각 Grafana UI > Administration > Service accounts 에서 발급
export GRAFANA_URL=http://mis-manage.smilegate.net:3000
export GRAFANA_API_KEY=
export GRAFANA_STG_URL=https://stg-mis-grafana.smiledev.net
export GRAFANA_STG_API_KEY=
export GRAFANA_DEV_URL=https://dev-mis-grafana.smiledev.net
export GRAFANA_DEV_API_KEY=
# JIRA — Personal Access Token (프로필 > 개인 액세스 토큰)
export JIRA_URL=https://jira.smilegate.net
export JIRA_TOKEN=
export JIRA_USER=
# Confluence — Bearer PAT
export CONFLUENCE_URL=https://wiki.smilegate.net
export WIKI_TOKEN=
# Jenkins — API 토큰은 인스턴스별 발급 (각 Jenkins > 내 계정 > API Token)
export JENKINS_USER=
export JENKINS_DEV_URL=https://dev-mis-jenkins.smiledev.net
export JENKINS_DEV_TOKEN=
export JENKINS_STG_URL=https://stg-mis-jenkins.smiledev.net
export JENKINS_STG_TOKEN=
export JENKINS_LIVE_URL=https://mis-jenkins.smilegate.net
export JENKINS_LIVE_TOKEN=
# Harbor — robot account (harbor tool 사용 시에만)
export HARBOR_DEV_URL=https://dev-mis-registry.smiledev.net
export HARBOR_DEV_USER=
export HARBOR_DEV_PASS=
export HARBOR_STG_URL=https://stg-mis-registry.smiledev.net
export HARBOR_STG_USER=
export HARBOR_STG_PASS=
export HARBOR_LIVE_URL=https://mis-registry.smilegate.net
export HARBOR_LIVE_USER=
export HARBOR_LIVE_PASS=
```

- URL은 회사 고정값으로 미리 채워져 있다(launcher 기본값과 동일) — **빈 값인 본인 토큰/계정만 채우면 된다**.
- github tool(6종)은 env 대신 gh CLI 인증: `gh auth login --hostname github.smilegate.net`
- 뭘 빠뜨렸는지 몰라도 된다 — **새 세션을 열면 SessionStart hook이 미설정 키 목록을 바로 알려준다** (키 이름만, 값 미노출).

### 4단계 — 동작 확인

새 세션을 열면 첫 실행에서 서버 venv가 자동 구성된다(수십 초, 타임아웃 시 `/mcp`에서 재연결). `/mcp`에서 `illuminati`가 connected면 끝. 다른 레포 clone·수동 설치는 필요 없다 — 서버 소스(Python)가 플러그인에 동봉되어 있고(`server/`) python3만 있으면 된다.

## Agents (2)

| Agent | 기능 |
|---|---|
| `infra-reviewer` | 인프라 코드 + GHE PR 리뷰 (5-lens: SRE/DevSecOps/AIOps/FinOps/DevOps), PR 코멘트 자동 게시 |
| `devops-researcher` | 기술 조사 (공식문서 + 사례 병렬 조사) |

## Skills (13)

| Skill | 기능 |
|---|---|
| `k8s-chart-scaffold` | MIS-GitOps 신규 chart/app 스캐폴딩 실행 — ArgoCD Application 등록, Envoy Gateway 노출, Kyverno 준수, 로컬 검증까지 |
| `k8s-migration` | Compose→K8s 전환 계획·매핑 수립 (실제 chart 생성은 `k8s-chart-scaffold`) |
| `infra-design` | 인프라 설계 가이드 |
| `arch-review` | 아키텍처 설계 결정 멀티렌즈 리뷰 (신뢰성/보안/운영복잡도/비용) |
| `api-docs` | API 문서(Swagger/OpenAPI) 생성·검토 |
| `spec-write` | Given-When-Then 기능 명세서 작성 |
| `rule-architecture` | Clean Architecture 의존성 방향 |
| `rule-backend-oo-ddd` | 백엔드 OO/DDD 설계 원칙 (SOLID/GRASP/GoF/DDD) |
| `rule-backend-testing` | 백엔드 테스트 컨벤션 (given-when-then, 계층 전략) |
| `rule-doc-conventions` | 증적 정책 (diary/plan/research 안 만듦, JIRA 단일 증적) |
| `rule-infra-decision-gate` | 인프라 변경 전 8조 레드라인 게이트 |
| `rule-jira-workflow` | JIRA 티켓 생성·증적 워크플로우 |
| `rule-project-paths` | 키워드 ↔ 레포 경로 매핑 |

## Commands (12)

| Command | 기능 |
|---|---|
| `/analyze-project` | 프로젝트 구조·의존성·설정 분석 |
| `/ansible-run` | Ansible 실행 가이드 (HIWARE 경유) |
| `/build-backend` | 백엔드 Gradle 빌드 |
| `/build-frontend` | 프론트엔드 pnpm/turbo 빌드 |
| `/check-code` | 코드 품질 검사 (Format/Compile/Lint) |
| `/deploy-k8s` | K8s 배포 가이드 (DEV ArgoCD) |
| `/docker-status` | Docker/Compose 상태 조회 |
| `/jenkins` | Jenkins 파이프라인 작업 가이드 |
| `/project-status` | 프로젝트 상태 종합 점검 |
| `/run-local` | 로컬 실행 가이드 |
| `/start-infra` | 인프라 컴포넌트 시작 가이드 |
| `/test` | 테스트 실행 가이드 |

## Hooks (7)

| Hook | 이벤트 | 기능 |
|---|---|---|
| env-check | SessionStart | 브랜치/미커밋/Docker 상태 + workspace_root 실값 출력 |
| illuminati-env-check | SessionStart | 미설정 자격증명 키 안내 (값 미노출) — 설치 직후 설정 가이드 |
| auto-formatter | PostToolUse (Edit\|Write) | java/kt/ts 파일 저장 시 포맷터 자동 실행 |
| kubeconform-validator | PostToolUse (Edit\|Write) | MIS-GitOps yaml 저장 시 kubeconform 검증 |
| compaction-reminder | PostCompact | 배포 원칙/포맷 순서/승인 규칙 재주입 |
| desktop-notify-start | Notification | macOS 알림 |
| desktop-notify-stop | Stop | 작업 완료 macOS 알림 |

## MCP (1) — illuminati 동봉

| Server | 기능 |
|---|---|
| `illuminati` | MIS 운영 조회/쓰기 53-tool ("모든 것을 보는 눈") — grafana LGTM(metric/logs/trace/alert) 8, jira 11, confluence 6, jenkins 5, GHE PR 6, harbor 3, gitops 6, backend/frontend 정적분석 7, inventory 1. 쓰기 도구는 전부 `confirm` 게이트 |

sre 진단 agent의 라이브 텔레메트리 조회, infra-reviewer의 FinOps 실사용률·Harbor CVE 실측, finops-review의 PromQL 실측이 전부 이 서버를 쓴다. 서버 소스(Python)는 이 플러그인이 통째로 동봉하며(`server/`), venv는 첫 실행 시 플러그인 데이터 디렉토리에 자동 구성되고 서버 버전이 바뀌면 자동 재설치된다. 설정 절차는 위 "설치 (4단계)".

grafana tool은 `env='prod'|'stg'|'dev'`, jenkins tool은 `env='dev'|'stg'|'live'` 파라미터로 대상 환경을 고른다 — 환경마다 인스턴스가 분리되어 있다(공용 가정 금지).

### 전체 환경변수 레퍼런스

| 변수 | 용도 | launcher 기본값 | 언제 필요 |
|---|---|---|---|
| `GRAFANA_URL` | prod(LIVE) Grafana 주소 | `http://mis-manage.smilegate.net:3000` | grafana tool `env='prod'` |
| `GRAFANA_API_KEY` | prod API Key | — (**export 필수**) | 〃 |
| `GRAFANA_STG_URL` | STG Grafana 주소 | `https://stg-mis-grafana.smiledev.net` | grafana tool `env='stg'` |
| `GRAFANA_STG_API_KEY` | STG API Key | — (**export 필수**) | 〃 |
| `GRAFANA_DEV_URL` | DEV Grafana 주소 | `https://dev-mis-grafana.smiledev.net` | grafana tool `env='dev'` |
| `GRAFANA_DEV_API_KEY` | DEV API Key | — (**export 필수**) | 〃 |
| `JIRA_URL` | JIRA 주소 | `https://jira.smilegate.net` | jira tool 전부 |
| `JIRA_TOKEN` | JIRA PAT (Bearer) | — (**export 필수**) | 〃 |
| `JIRA_USER` | JIRA 계정명 | — (권장) | silence 작성자·담당자 기본값 |
| `CONFLUENCE_URL` | Confluence 주소 | `https://wiki.smilegate.net` | confluence tool 전부 |
| `WIKI_TOKEN` | Confluence Bearer PAT | — (**export 필수**) | 〃 |
| `JENKINS_DEV_URL` | DEV Jenkins 주소 | `https://dev-mis-jenkins.smiledev.net` | jenkins tool `env='dev'` |
| `JENKINS_STG_URL` | STG Jenkins 주소 | `https://stg-mis-jenkins.smiledev.net` | jenkins tool `env='stg'` |
| `JENKINS_LIVE_URL` | LIVE Jenkins 주소 | `https://mis-jenkins.smilegate.net` | jenkins tool `env='live'` |
| `JENKINS_{DEV,STG,LIVE}_USER` | 환경별 계정 | — (`JENKINS_USER` 폴백) | 계정이 환경별로 다를 때만 |
| `JENKINS_{DEV,STG,LIVE}_TOKEN` | 환경별 API 토큰 | — (**export 필수**, `JENKINS_TOKEN` 폴백) | 토큰은 인스턴스별 발급 |
| `HARBOR_DEV_URL`/`HARBOR_STG_URL`/`HARBOR_LIVE_URL` | 환경별 Harbor 주소 | `dev-mis-registry.smiledev.net` / `stg-mis-registry.smiledev.net` / `mis-registry.smilegate.net` | harbor tool |
| `HARBOR_{DEV,STG,LIVE}_USER`/`_PASS` | Harbor robot 계정 | — (**export 필수**) | harbor tool 사용 시 |
| `ILLUMINATI_DISABLE` | `1`이면 플러그인 동봉 서버 비활성 | — | 수동 등록과 충돌 시 |
| `ILLUMINATI_CODE_ROOT` | 레포 워크스페이스 루트 재지정 | `workspace_root` 값 | 정적분석 tool 경로가 어긋날 때 |
| `ILLUMINATI_ENV_FILE` | 자격증명 .env 파일 경로 재지정 | — | .env 파일 방식을 쓸 때 |
| `ILLUMINATI_INSECURE` | `1`이면 TLS 검증 skip | — | 사설 인증서 문제 시에만 |

### 세부 동작 (참고)

- 로컬 파일 정적분석 tool은 대상 레포가 `workspace_root`에 clone 되어 있어야 한다 — gitops_*(MIS-GitOps), inventory_query(MIS-DevOps), backend_*/frontend_*(각 앱 레포). HTTP API tool(grafana/jira/confluence/jenkins/GHE/harbor)은 레포 불필요.
- 자격증명은 쉘 export가 기본. `.env` 파일 방식도 지원 — `<workspace_root>/MIS-DevOps/platform-automation/.env`가 있으면 자동 폴백으로 읽는다(export env가 항상 우선, `ILLUMINATI_ENV_FILE`로 경로 재지정 가능).
- `claude mcp add -s user`로 직접 등록해 둔 머신에서는 launcher가 중복을 감지해 no-op 한다.
- 서버 코드를 고칠 땐 `server/pyproject.toml`의 version을 올려야 사용자 venv가 재설치된다.

## 형제 플러그인 (역할 분리)

| 플러그인 | 역할 |
|---|---|
| `sre` | 관측성·트러블슈팅 (진단 agent 8종 + /triage) |
| `devsecops` | 보안 (security-policy-analyst + 보안 리뷰 skill + 가드 hook) |
| `finops` | 리소스 효율 (비용 리뷰 skill) |
| `aiops` | AI 자동화 (automation-architect, mcp-developer, ai-tooling-curator) |

`infra-reviewer`는 5-lens 전체를 한 번에 보는 통합 리뷰어다. 보안·비용 lens만 따로 쓰려면 devsecops/finops 플러그인의 `devsecops-review`/`finops-review` skill을 쓴다.

## rules/ 폴더

`rules/`는 Claude Code 플러그인 컴포넌트가 아니다(공식 스펙에 없음) — workspace `.claude/rules/*.md`(path-scoped 자동 로드)가 심볼릭 링크로 참조하는 원본 보관 폴더다. 내용은 `skills/rule-*/SKILL.md`(marketplace 배포용)와 같다 — 바꿀 땐 두 곳 모두 갱신한다.
