---
name: finops-review
description: 리소스 효율(비용) 리뷰 체크리스트 — request/limit right-sizing, resourcequota 산정 근거, overcommit, 환경별 자원 비대칭. resources/quota/replica 변경 리뷰, 비용 점검 요청 시 사용. devops 플러그인 infra-reviewer 5-lens 중 FinOps lens의 독립 실행 버전.
---

# finops-review

인프라 변경의 리소스 효율을 checklist 기반으로 점검한다. finding은 `[SEVERITY] file:line — 제목 / Why / Evidence(1~3줄 인용) / Fix(최소 diff)` 형식. probe·limit·threshold에 근거 없으면 "why this number?"를 지적한다.

항목 뒤 "(실측: ...)"는 2026-07-02 레포 전수 조사로 확인된 사실 — 범용 원칙보다 이 레포에서 실제 반복되는 함정을 먼저 본다.

## 실사용률 실측 (가능하면 주장 대신 측정)

illuminati MCP 사용 가능 시 request 대비 실사용률을 실측한다 (grafana env는 `dev`|`prod`만 — STG는 LGTM 미구축):

```
grafana_promql_query(env, 'rate(container_cpu_usage_seconds_total{...}[5m])')
grafana_promql_query(env, 'kube_pod_container_resource_requests{resource="cpu"}')
```

## MIS-GitOps (K8s/Helm)

- [ ] request/limit right-sizing — 실사용률 대비 과대 request는 스케줄링 낭비, 과소 limit은 OOMKill
- [ ] resourcequota 근거 확인: LIVE quota(35cpu/168Gi/336Gi/140pods)가 "7×8C/32G worker 기준" 주석으로 산정 근거 명시(실측) — quota 변경은 이 근거 갱신 여부 확인
- [ ] limits.cpu 미설정이 전사 정책(CFS throttle 회피)이라 requests.cpu만이 유일한 cost/scheduling 가드 — 신규 backend/replica 증가는 quota deadlock 여부 재확인
- [ ] STG/LIVE 대부분 placeholder 태그로 promote 파이프라인 미가동(실측) — "K8s 미배정=영향 0" 판단 근거로 계속 사용

## MIS-DevOps (Compose)

- [ ] overcommit 자인 사례: LIVE 모니터링 서버 compose 주석이 "limits 합 > 16G overcommit — 서버 이전 또는 32G 증설 필요"라고 명시(실측) — 그 서버에 컨테이너 추가하는 변경은 여유 없음 재확인
- [ ] CPU 상한 비대칭: eam-api만 LIVE에 cpus 설정, dev/stg는 memory만 있고 cpus 누락(gea/observer/checkin 동일, 실측) — 하위환경 신규 서비스도 이 누락 반복 여부
- [ ] kafka-broker(`-Xmx16g`, 20G/7cpu)가 dev/stg/live 공용 파일로 트래픽 차이(주석 "DEV는 1/5~1/10 수준") 무시(실측) — kafka 설정 변경은 이 규모 불일치 인지 여부
- [ ] frontend 26개 compose에 `mem_limit` 전무(실측) — 신규 frontend 서비스도 이 누락 패턴 반복 여부

## 유지보수 규칙

이 체크리스트는 devops 플러그인 `agents/infra-reviewer.md` §4(FinOps lens)와 같은 내용이다. 항목을 고치면 두 곳 모두 갱신한다.
