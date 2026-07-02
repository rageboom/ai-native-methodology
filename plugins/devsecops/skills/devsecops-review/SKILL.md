---
name: devsecops-review
description: K8s 매니페스트/Helm/Compose/Ansible/Jenkinsfile 보안 리뷰 체크리스트 (CIS K8s Benchmark v1.8+, NSA·CISA Hardening, Pod Security Standards Restricted). 매니페스트·compose·secret·이미지 변경 리뷰, 보안 점검 요청 시 사용. devops 플러그인 infra-reviewer 5-lens 중 DevSecOps lens의 독립 실행 버전.
---

# devsecops-review

인프라 변경의 보안 리스크를 checklist 기반으로 점검한다. finding은 `[SEVERITY] file:line — 제목 / Why / Evidence(1~3줄 인용) / Fix(최소 diff)` 형식, BLOCKER > MAJOR > MINOR 순 정렬. 범용 best-practice 인용 금지 — 이 변경의 구체 리스크에 묶인 항목만.

항목 뒤 "(실측: ...)"는 2026-07-02 레포 전수 조사로 확인된 사실 — 범용 원칙보다 이 레포에서 실제 반복되는 함정을 먼저 본다.

## MIS-GitOps (K8s/Helm)

**Pod Security**
- [ ] namespace PSA 라벨 restricted, `runAsNonRoot`/`allowPrivilegeEscalation:false`/`readOnlyRootFilesystem`/`capabilities.drop:["ALL"]`/`privileged:false`/`seccompProfile.type:RuntimeDefault`/`hostNetwork·hostPID·hostIPC:false`

**RBAC**
- [ ] 와일드카드(`verbs/resources:["*"]`) 금지, ClusterRoleBinding 대신 RoleBinding, `default` SA 금지·Pod 전용 SA

**Network / Envoy Gateway (Kong 폐기됨)**
- [ ] Default Deny NetworkPolicy, HTTPRoute 불필요 노출, TLS termination
- [ ] corsSpec 헬퍼 include 컨벤션: `charts/mis-platform-gateway/templates/security/securitypolicy-{apikey,jwt}-*.yaml` 8개 전부 `_helpers.tpl`의 `corsSpec`을 include(실측) — 새 SecurityPolicy가 이 include를 빠뜨리면 CORS 정책 누락
- [ ] Envoy GW SecurityPolicy override 룰(구체적 레벨 attach 시 상위 통째 override), maxAge는 string h/m/s/ms 표기

**Secrets (Infisical — 전 환경 적용 완료)**
- [ ] 금지 mutable tag가 base values 기본값으로 실존: `kubernetes-v1.0.0prev`가 backend 5종·frontend 2종·batch의 `values.yaml` 기본값(실측) — 신규 chart가 이 기본값을 복붙하지 않는지 확인
- [ ] 평문 시크릿 3환경 동일값: `infra/falco/values-{dev,stg,live}.yaml`가 동일 admin 패스워드를 하드코딩(실측, `detect-private-key` hook은 일반 패스워드 문자열을 못 잡음) — 애드온 values 변경은 이 패턴 최우선 확인
- [ ] Infisical ExternalSecret/SecretStore reference 정합, `helm.sh/resource-policy: keep`

**Image / Supply Chain (per-env Harbor)**
- [ ] 태그 `latest` 금지, `image.registry` 환경 Harbor 정확성(globalOverrides.imageRegistry로 도메인 root까지 분리, 실측)
- [ ] 신규/변경 이미지 tag는 Harbor 스캔으로 HIGH/CRITICAL CVE 실측 (illuminati MCP `harbor_artifact_scan` 사용 가능 시)

## MIS-DevOps (Compose/Ansible/Jenkins)

- [ ] 크리덴셜 재사용 패턴: Harbor DB 비밀번호가 dev/stg/live 동일값, admin 비밀번호도 stg/live 동일(실측) — "환경별 분리"는 인스턴스 단위일 뿐. 신규 secret은 값 재사용 여부까지 확인(존재 여부만 보면 놓침)
- [ ] Infisical 도입 취지 위반 실사례: `platform-kubernetes/k3s/master/pods/live/batch/*/manifests/secret.yaml` 7개에 `INFISICAL_CLIENT_SECRET` 평문 리터럴 커밋(실측) — 새 secret 매니페스트는 반드시 ExternalSecret 참조인지 확인
- [ ] 미들웨어 인증 부재: Redis 3환경 전부 `requirepass` 없음, Kong `KONG_TRUSTED_IPS:0.0.0.0/0`+healthcheck disable(실측) — 관련 변경이 이 상태를 유지/확산하는지, 최소 신규 배포엔 인증 요구
- [ ] Jenkins Slack webhook/ClientSecret 평문이 `.jenkinsfile`마다 중복(LIVE 13개, 실측) — 신규 Jenkinsfile도 이 패턴 복붙하지 않는지
- [ ] LIVE batch 스크립트의 harbor 로그인 비밀번호 하드코딩(dev/stg는 env+stdin으로 개선됨, 실측) — LIVE 관련 변경은 리팩터링 기회로 지적

## 유지보수 규칙

이 체크리스트는 devops 플러그인 `agents/infra-reviewer.md` §2(DevSecOps lens)와 같은 내용이다. 항목을 고치면 두 곳 모두 갱신한다.
