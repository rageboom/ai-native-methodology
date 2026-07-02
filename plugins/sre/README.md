# sre

MIS 관측성·트러블슈팅. 진단 agent는 전부 read-only이며 경계가 겹치지 않게 잘랐다 — 증상이 여러 층에 걸치면 메인 세션이 둘 이상을 병렬 fan-out 한다.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install sre@mis-plugins
```

## Agents (8)

| Agent | 기능 |
|---|---|
| `linux-diagnostician` | Linux 호스트 진단 (systemd/커널/디스크/inode/OOM killer/node pressure), read-only |
| `k8s-diagnostician` | K8s 워크로드 진단 (CrashLoop/Pending/OOMKilled/probe/스케줄링/ArgoCD 동기), read-only |
| `network-diagnostician` | 네트워크 진단 (CoreDNS/Cilium/Envoy Gateway/L4/NetworkPolicy/mTLS/503·504), read-only |
| `data-diagnostician` | Stateful 미들웨어 진단 (Redis/Kafka/MySQL/Infisical), read-only |
| `observability-investigator` | LGTM 텔레메트리 교차조사, 노이즈 알림 원인 진단, read-only |
| `incident-log-investigator` | 붙여넣은 로그에서 타임라인/근본원인 추출, read-only |
| `observability-architect` | SLO/alert/OTel 파이프라인 설계 |
| `postmortem-writer` | 장애 포스트모템 작성 (5 Whys, 무비난) |

## Commands (1)

| Command | 기능 |
|---|---|
| `/triage` | cross-layer 장애 분류 — 증상을 받아 적합한 진단 agent로 라우팅 |

## 라이브 텔레메트리 (grafana metric/logs/trace)

`observability-investigator` 등의 실측 조회는 illuminati MCP(`grafana_promql_query`/`grafana_loki_query`/`grafana_tempo_search` 등)를 쓴다 — **`devops` 플러그인이 동봉**하므로 함께 설치한다 (전제조건·설치법은 `plugins/devops/README.md` 'MCP' 절). MCP가 없으면 agent는 사용자가 붙여넣은 출력 기반으로만 진단한다.

## 형제 플러그인

빌드/배포·공통 룰은 `devops`, 보안은 `devsecops`, 비용은 `finops`, AI 자동화는 `aiops`. 통합 PR 리뷰(5-lens)는 `devops`의 `infra-reviewer`.
