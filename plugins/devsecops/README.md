# devsecops

MIS 보안. 정책 엔진(Kyverno)·스캐너(Trivy)·런타임 탐지(Falco) 현황 분석과 CIS/NSA/PSS 기준 보안 리뷰, 세션 안전 가드 hook.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install devsecops@mis-plugins
```

## Agents (1)

| Agent | 기능 |
|---|---|
| `security-policy-analyst` | Kyverno/Trivy/Falco 현황 분석 및 조치 가이드, read-only |

## Skills (1)

| Skill | 기능 |
|---|---|
| `devsecops-review` | K8s/Compose/Jenkins 보안 리뷰 체크리스트 (CIS K8s Benchmark v1.8+, NSA·CISA, PSS Restricted) — Pod Security/RBAC/Network/Secrets/Supply Chain |

## Hooks (2)

| Hook | 이벤트 | 기능 |
|---|---|---|
| protected-file-guard | PreToolUse (Edit\|Write) | .env/.key/.pem 편집 차단 |
| dangerous-command-guard | PreToolUse (Bash) | rm -rf, force push, reset --hard, kubectl delete --all 등 차단/경고 |

## 형제 플러그인

통합 PR 리뷰(5-lens)는 `devops`의 `infra-reviewer` — 이 플러그인의 `devsecops-review`는 그중 DevSecOps lens의 독립 실행 버전이다 (체크리스트 수정 시 양쪽 갱신).
