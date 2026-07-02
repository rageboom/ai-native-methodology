---
name: infra-design
description: "MIS 인프라 아키텍처 설계 리뷰. Docker Compose/K8s 전환, 보안 아키텍처, 가용성, 확장성 검토."
when_to_use: "아키텍처 변경 제안, K8s 전환 설계, 가용성·확장성·보안 설계 검토 요청 시"
argument-hint: "[아키텍처 설명 또는 요구사항]"
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

# MIS 인프라 설계 리뷰

$ARGUMENTS 를 다음 관점에서 검토합니다.

## 현재 아키텍처 (AS-IS)

```
사내 사용자 -> L4/L7 -> Frontend -> Kong Gateway -> Backend -> DB/Redis/Kafka
                                          |
                                OTel Collector -> LGTM Stack
```

- 배포: Docker Compose (dev/stg/live 3개 환경) → K8s 전환 진행 중
- 서버: 77대, 1인 DevOps 운영
- Observability: LGTM + OTEL (Dynatrace 전환 완료)
- Cache: Redis Cluster, Messaging: Kafka

## 검토 항목

### 1. 가용성 (Availability)

- 단일 장애점(SPOF) 식별
- Redis Cluster 페일오버 전략
- Kafka replication factor / ISR 설정
- OTel Collector HA 구성 여부
- Kong Gateway 이중화
- K8s: PDB(PodDisruptionBudget) 설정 여부
- K8s: Pod Anti-Affinity로 노드 분산 배치
- K8s: 다중 레플리카 + HPA 설정 적절성

### 2. 확장성 (Scalability)

- Docker Compose 수평 확장 제약 -> K8s HPA 전환 계획
- Kafka 파티션 전략 / consumer group 관리
- Redis 메모리 관리 / eviction 정책
- Tempo/Loki 스토리지 확장 방안
- K8s: HPA 메트릭 소스 (CPU/Memory/Custom)
- K8s: Cluster Autoscaler 또는 노드 추가 전략
- K8s: StatefulSet 스케일링 전략 (Redis, Kafka)

### 3. 보안 아키텍처 (Security)

- **네트워크 격리**: NetworkPolicy Default Deny + 명시적 허용
- **Zero Trust**: 서비스 간 인증 (mTLS, JWT, apikey)
- **Secret 관리**: Infisical/ESO → K8s Secret 자동 동기화
- **이미지 공급망**: Harbor → Trivy 스캔 → Admission 정책 → 배포
- **RBAC 설계**:
  - 네임스페이스별 Role/RoleBinding (mis-dev, mis-stg, mis-live)
  - CI/CD SA: 배포 권한만 (create, update deployment/service)
  - 개발자: read-only (get, list, watch)
  - DevOps: namespace admin
  - cluster-admin: 최소 인원만
- **Pod Security**: PSA restricted 프로파일 전 네임스페이스 적용
- **Admission Control**: OPA Gatekeeper 또는 Kyverno
  - 허용 레지스트리 제한
  - latest 태그 차단
  - privileged 컨테이너 차단
  - runAsNonRoot 강제
  - 리소스 제한 필수화
- **감사 로깅**: API Server Audit Log → Loki 수집
- **인증서 관리**: cert-manager 또는 수동 관리 + 만료 알림

### 4. 운영 효율 (Operability)

- 1인 운영 기준 자동화 수준 적절성
- Ansible 플레이북 재사용성
- Jenkins CI/CD 파이프라인 효율 → ArgoCD GitOps 전환 계획
- 모니터링 알림 (99개 rules) 노이즈 여부
- 장애 대응 런북 존재 여부
- K8s: GitOps 워크플로 (ArgoCD + Helm)
- K8s: `helm diff` → approve → `helm upgrade` 파이프라인

### 5. 마이그레이션 계획

- Docker Compose -> K8s 전환 우선순위
- K3s -> K8s 전환 경로
- Helm chart 설계 (mis-platform, kong-gateway)
- 무중단 마이그레이션 전략
- 상태 유지 서비스(Redis, Kafka) StatefulSet 전환
- 보안 기반 선행 작업 (PSA, NetworkPolicy, RBAC, Admission)

### 6. 비용/리소스

- 서버 리소스 활용률
- 불필요한 서비스/컨테이너
- 로그/메트릭 보존 기간 적정성
- K8s: ResourceQuota로 네임스페이스별 리소스 제한

## TO-BE 보안 아키텍처 (K8s)

```
                        ┌─ OPA/Kyverno (Admission)
                        │
사내 사용자 → L4/L7 → Kong (Gateway API, TLS) → Backend Pods
                        │                          │
                   NetworkPolicy              SecurityContext
                   (Default Deny)             (restricted PSS)
                        │                          │
                   ┌────┴────┐              ┌──────┴──────┐
                   │ RBAC    │              │ Secret Mgmt │
                   │ per-NS  │              │ (Infisical) │
                   └─────────┘              └─────────────┘
                        │
                   Audit Log → Loki → Grafana Alert
```

## 출력 형식

항목별: 현재 상태 -> 개선 제안 -> 근거 (CIS/NIST 참조)
Mermaid 다이어그램으로 AS-IS / TO-BE 비교
