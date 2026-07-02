---
description: MIS 플랫폼 K8s 배포 가이드 (DEV ArgoCD)
---
# Kubernetes 배포

MIS 플랫폼을 Kubernetes에 배포합니다.

## 사용자 입력
- $ARGUMENTS: 환경 (dev, stg, live)

## 지침

1. 작업 디렉토리: `${user_config.workspace_root}/devops/MIS-DevOps/kubernetes`

2. 사전 검사:
   - kubectl 연결 확인: `kubectl cluster-info`
   - helm 설치 확인: `helm version`
   - 현재 context 확인: `kubectl config current-context`

3. 배포 스크립트 실행:
   ```bash
   ./deploy-all.sh {환경}
   ```

4. 배포 순서:
   - Gateway API CRDs
   - Namespace 생성
   - Registry Secret
   - Kong Gateway
   - MIS Platform (eam, tlm, gea, common, frontends)

5. 배포 후 검증:
   - Pod 상태 확인: `kubectl get pods -n mis-{환경}`
   - Service 확인: `kubectl get svc -n mis-{환경}`
   - HTTPRoute 확인: `kubectl get httproute -n mis-{환경}`

6. 문제 발생 시:
   - Pod 로그 확인: `kubectl logs -f <pod-name> -n mis-{환경}`
   - Describe: `kubectl describe pod <pod-name> -n mis-{환경}`
