---
name: k8s-migration
description: "Docker Compose에서 Kubernetes로 전환 가이드. 서비스 마이그레이션 계획, 매핑, 보안 하드닝 포함."
when_to_use: "Compose 서비스를 K8s 로 옮기는 계획·매핑·매니페스트 변환 요청 시"
argument-hint: "[마이그레이션 대상 서비스 또는 질문]"
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - WebFetch
  - WebSearch
  - Bash(kubectl *)
  - Bash(helm *)
  - Bash(docker *)
effort: high
---

# Docker Compose -> K8s Migration

$ARGUMENTS

## 현재 상태 (AS-IS)

- 배포: Docker Compose (`deployments/compose/overlays/{dev,stg,live}/`)
- K3s 일부 적용, 본격 K8s 운영 아님
- 서버 77대, Docker Compose 37대 -> K8s 22대 전환 목표

## 마이그레이션 매핑

| Docker Compose | Kubernetes | 보안 고려사항 |
|----------------|-----------|-------------|
| `docker-compose.yml` | `Deployment` + `Service` | securityContext, PDB 설정 |
| `environment:` | `ConfigMap` / `Secret` | Secret은 etcd 암호화, ESO/Infisical 연동 |
| `.env` 파일 | `Secret` (외부 Secret Manager 권장) | Git에 커밋 금지, Infisical 연동 |
| `ports:` | `Service` (ClusterIP/NodePort) | ClusterIP 우선, NodePort 최소화 |
| `volumes:` | `PVC` + `StorageClass` | reclaimPolicy: Retain, 접근 모드 최소화 |
| `mem_limit/cpus` | `resources.requests/limits` | LimitRange/ResourceQuota 네임스페이스 수준 |
| `healthcheck:` | `startup/liveness/readinessProbe` | JVM 앱은 startupProbe 필수 |
| `restart: always` | `restartPolicy: Always` (Pod spec) | PDB로 가용성 보장 |
| `depends_on:` | `initContainers` 또는 Helm dependency | init 컨테이너도 securityContext 적용 |
| `networks:` | `NetworkPolicy` | Default Deny + 명시적 허용 |
| `logging:` | OTEL Collector / Loki | 로그 내 PII 마스킹 |

## 전환 순서

1. **Helm Chart 설계**: `helm/charts/mis-platform/`
2. **ConfigMap/Secret 분리**: 환경별 `values-{env}.yaml`
3. **네임스페이스 설계**: `mis-dev`, `mis-stg`, `mis-live`
4. **보안 기반 설정** (마이그레이션 전 필수):
   - Pod Security Admission 라벨 적용 (`restricted`)
   - NetworkPolicy Default Deny 배포
   - RBAC 정책 (서비스별 SA, 최소 권한 Role)
   - ResourceQuota / LimitRange 설정
5. **서비스별 전환** (우선순위):
   - 1순위: Stateless 앱 (EAM, TLM, GEA, Common)
   - 2순위: Observer (Kotlin)
   - 3순위: LGTM 스택
   - 4순위: Kafka, Redis (StatefulSet)
6. **Kong Gateway**: Gateway API + KIC (KongPlugin CRD)
7. **CI/CD**: Jenkins → ArgoCD (GitOps)

## compose -> manifest 변환 체크리스트

### 기능 전환
- [ ] 이미지/태그 매핑 (Harbor 레지스트리 주소 환경별 확인)
- [ ] 환경변수 -> ConfigMap/Secret
- [ ] 볼륨 -> PVC (StorageClass, accessMode 설계)
- [ ] 네트워크 -> Service + NetworkPolicy
- [ ] 리소스 제한 -> resources (requests + limits)
- [ ] 헬스체크 -> startup/liveness/readiness Probe
- [ ] 로그 수집 -> OTEL 연동 유지
- [ ] 모니터링 -> ServiceMonitor (Mimir)

### 보안 하드닝 (전환 시 필수)
- [ ] Pod SecurityContext 적용 (runAsNonRoot, capabilities.drop, readOnlyRootFilesystem)
- [ ] ServiceAccount 전용 생성 + automountServiceAccountToken 관리
- [ ] NetworkPolicy 작성 (서비스 간 통신 매트릭스 기반)
- [ ] Secret 외부 관리 (Infisical Operator 연동)
- [ ] imagePullSecrets 설정 (Harbor 인증)
- [ ] RBAC Role/RoleBinding 정의
- [ ] PDB(PodDisruptionBudget) 설정
- [ ] Admission Controller 정책 (OPA Gatekeeper/Kyverno)
  - 허용 레지스트리 화이트리스트
  - latest 태그 차단
  - privileged 컨테이너 차단
  - runAsNonRoot 강제

### 운영 준비
- [ ] `helm template` + `kubeconform` 검증
- [ ] `helm diff upgrade` 로 변경 사항 확인
- [ ] 롤백 절차 문서화 (`helm rollback`)
- [ ] 모니터링 알림 전환 (Compose → K8s 메트릭)
- [ ] 장애 대응 런북 K8s 버전 작성

## 서비스 간 통신 매트릭스 (NetworkPolicy 설계 기반)

```
Kong (kong-system) → EAM, TLM, GEA, Common, Observer (mis-{env})
EAM/TLM/GEA/Common → Redis, Kafka, MSSQL(외부)
Observer → Elasticsearch, Redis, Kafka
OTel Collector → Tempo, Loki, Mimir
모든 Pod → CoreDNS (kube-system)
```

## 참고 경로

- Helm charts: `deployments/helm/charts/`
- Helm envs: `deployments/helm/envs/{dev,stg,live}/`
- 현재 Compose: `deployments/compose/overlays/`
- Infisical: `security/Infisical/`
- Ansible: `iac/ansible/`
