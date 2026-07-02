# finops

MIS 리소스 효율. request/limit right-sizing, resourcequota 산정 근거, overcommit·환경별 자원 비대칭 점검. 주장 대신 Grafana PromQL 실측을 우선한다.

## 설치

```
/plugin marketplace add SGH-ISD/ai-native-methodology
/plugin install finops@mis-plugins
```

## Skills (1)

| Skill | 기능 |
|---|---|
| `finops-review` | 비용 리뷰 체크리스트 — right-sizing, quota 근거, overcommit, kafka/frontend 자원 함정, PromQL 실사용률 실측 패턴 |

## 형제 플러그인

통합 PR 리뷰(5-lens)는 `devops`의 `infra-reviewer` — 이 플러그인의 `finops-review`는 그중 FinOps lens의 독립 실행 버전이다 (체크리스트 수정 시 양쪽 갱신). 실사용률 실측에 쓰는 illuminati MCP(`grafana_promql_query`)는 `devops` 플러그인이 동봉 — 함께 설치한다 (`plugins/devops/README.md` 'MCP' 절). 없으면 사용자 제공 데이터로 판단.
