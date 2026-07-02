# devops

MIS 빌드/배포 자동화 + Kubernetes 생태계 구축. 역할별 5개 플러그인(devops/sre/devsecops/finops/aiops)의 base — MIS 공통 워크플로우 rule-skill을 이 플러그인이 보유한다.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install devops@mis-plugins
```

설치 후 `workspace_root`(회사 GHE 레포들을 클론해 둔 최상위 디렉토리, 예: `MIS-DevOps`/`MIS-GitOps`/`eam`이 나란히 있는 폴더)를 설정해야 한다 — 활성화 시 Claude Code가 자동으로 물어본다. 각자 폴더 구조가 달라도 이 값 하나만 설정하면 동일하게 동작한다.

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

## Hooks (6)

| Hook | 이벤트 | 기능 |
|---|---|---|
| env-check | SessionStart | 브랜치/미커밋/Docker 상태 + workspace_root 실값 출력 |
| auto-formatter | PostToolUse (Edit\|Write) | java/kt/ts 파일 저장 시 포맷터 자동 실행 |
| kubeconform-validator | PostToolUse (Edit\|Write) | MIS-GitOps yaml 저장 시 kubeconform 검증 |
| compaction-reminder | PostCompact | 배포 원칙/포맷 순서/승인 규칙 재주입 |
| desktop-notify-start | Notification | macOS 알림 |
| desktop-notify-stop | Stop | 작업 완료 macOS 알림 |

## MCP (1) — illuminati 동봉

| Server | 기능 |
|---|---|
| `illuminati` | MIS 운영 조회/쓰기 53-tool ("모든 것을 보는 눈") — grafana LGTM(metric/logs/trace/alert) 8, jira 11, confluence 6, jenkins 5, GHE PR 6, harbor 3, gitops 6, backend/frontend 정적분석 7, inventory 1. 쓰기 도구는 전부 `confirm` 게이트 |

sre 진단 agent의 라이브 텔레메트리 조회, infra-reviewer의 FinOps 실사용률·Harbor CVE 실측, finops-review의 PromQL 실측이 전부 이 서버를 쓴다. 서버 소스 정본은 `MIS-DevOps/platform-automation/mcp/infra-ops` — 플러그인은 launcher만 동봉한다.

**설정은 개인 토큰/계정 export가 전부다.** venv는 첫 실행 시 launcher가 자동 부트스트랩하고(수십 초, 타임아웃 시 `/mcp` 재연결), 회사 공통 URL은 launcher가 기본값으로 제공한다. `~/.zshrc`에:

```bash
export GRAFANA_API_KEY=...        # LIVE Grafana
export GRAFANA_DEV_API_KEY=...    # DEV Grafana
export JIRA_TOKEN=... JIRA_USER=<계정>
export WIKI_TOKEN=...             # Confluence Bearer
export JENKINS_USER=<계정> JENKINS_TOKEN=...
# harbor tool 사용 시: HARBOR_{DEV,STG,LIVE}_{URL,USER,PASS}
# github tool 사용 시: gh auth login --hostname github.smilegate.net
```

전제조건은 `workspace_root`에 `MIS-DevOps`가 clone 되어 있는 것 하나다(서버 소스). 기존처럼 `platform-automation/.env` 파일을 쓰는 머신도 그대로 동작한다 — 서버가 `os.environ.setdefault`로 읽어 **export된 env가 항상 .env보다 우선**한다. `claude mcp add -s user`로 이미 등록해 둔 머신에서는 launcher가 중복을 감지해 no-op 한다 (강제 비활성화: `ILLUMINATI_DISABLE=1`).

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
