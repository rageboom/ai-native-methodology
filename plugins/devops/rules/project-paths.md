---
description: 프로젝트 키워드별 경로 매핑
---

# Project Path Mapping

All paths relative to `${user_config.workspace_root}/`

| Keyword | Path |
|---------|------|
| devops, 인프라, ansible, compose | `MIS-DevOps` (2026-06-12 devops-core 에서 회귀. 통합 표준) |
| gitops, helm, argocd app | `MIS-GitOps` |
| envoy gateway, gateway api | `MIS-GitOps/infra/envoy-gateway` (helm values) + `MIS-GitOps/charts/mis-platform/templates/{httproutes,envoy-policies}.yaml` |
| mis-platform helm | `MIS-GitOps/charts/mis-platform` (umbrella + 9 subchart) |
| postmortem (장애 회고만) | `MIS-DevOps/document/claude/review/postmortem-{주제}.md` |
| ~~plan/research/diary 증적~~ | 작성 안 함 — 증적은 JIRA 티켓에 (2026-06-02 정책) |
| jira, scripts | `MIS-DevOps/platform-automation/jira` |
| k8s bootstrap (air-gap 설치) | `MIS-DevOps/platform-kubernetes/bootstrap` |
| jenkins 파이프라인 | `MIS-DevOps/platform-jenkins` (kubernetes=K8s CI 정본, compose=Compose 잡, release-mgmt, plugin-maint) |
| lgtm, 모니터링 compose | `MIS-DevOps/platform-observability/grafana-stack` |
| kafka, redis, kong, elastic, harbor, infisical, garage, proxy | `MIS-DevOps/platform-<name>` |
| 앱 compose (<app>/<env>/<server>) | `MIS-DevOps/application-{api,batch,frontend}` |
| illuminati MCP, aiops, 자동화 도구 | `MIS-DevOps/platform-automation` |
| 서버 인벤토리 | `MIS-DevOps/document/inventory/server-{env}.md` |
| ~~devops-core~~ | 폐기 트랙 (2026-06-12). 새 작업 금지 |
| eam, 권한, 인증 | `eam/ep-be-eam` (Java) |
| itg, 119, 긴급문의 | `ep-be-itg` (Java) |
| gea, 총무, 복지 | `gea` (Java) |
| tlm, 근태, 휴가 | `tlm/ep-be-tlm` (Java) |
| observer, 로그 | `sgh-mis-observer` (Kotlin) |
| front, fo (gea/tlm/hrm) | `front` (React/TS, Turborepo) |
| bo, admin, 어드민 frontend | `mis-fe-admin` (React/TS, Module Federation) |
| 119-fe | `119-fe` (React/TS) |
| blog | `k-diger.github.io` (Jekyll) |

## 주요 레포 (2026-06-12 갱신)

- `MIS-DevOps`: **인프라 구축/운영 통합 레포 (표준)**. Compose, K8s Bootstrap, Ansible, Jenkins 파이프라인, 자동화 도구, 문서. `platform-*`/`application-*` 폴더링.
- `MIS-GitOps`: K8s 배포 선언 (Helm + ArgoCD Application + Envoy Gateway values)
- `mis-fe-admin`: BO 어드민 frontend (Module Federation, 별도 레포)
- ~~`devops-core`~~: **폐기 트랙** (2026-05-06 분리 시도 → 2026-06-12 MIS-DevOps 회귀). 새 작업 금지.

API Gateway는 **Envoy Gateway** (K8s). Kong은 K8s 에서 2026-04-22 폐기 (KIC 3.10+ 라이선스 이슈), LIVE Compose 는 아직 Kong 운영.
