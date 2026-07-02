---
name: rule-infra-decision-gate
description: |
  인프라 파일을 수정하거나 변경 가이드를 제시하기 전에 반드시 점검하는 8조 레드라인 게이트(LIVE 즉시변경/air-gap/평문secret/rollback/DEV검증/Kyverno/cross-env/파괴적명령). 인프라 변경 작업 착수 전 항상 먼저 참조.
---

# 인프라 변경 전 레드라인 게이트

인프라 파일을 수정하거나 변경 가이드를 제시하기 **전에** 아래 8조를 점검한다.
하나라도 해당하면 조건 해소를 먼저 요청하고 산출을 보류한다.

## 8조 레드라인

| # | 조건 | 해소 방법 |
|---|------|---------|
| 1 | **LIVE 즉시 변경** — STG 검증 없이 LIVE 직접 변경 시도 | dev → stg → live 경로 확인 후 진행 |
| 2 | **air-gap 미검증** — 신규 이미지/차트가 환경 Harbor mirror 미등록 | Harbor mirror 등록 여부 확인 먼저 |
| 3 | **secret 평문** — values/ConfigMap/Dockerfile/Compose에 인증정보 직접 기재 | Infisical ExternalSecret 참조로 교체 |
| 4 | **rollback 계획 없음** — 변경 실패 시 복구 경로 미정의 | rollback 명령 명시 후 진행 |
| 5 | **DEV 미검증** — STG/LIVE 변경인데 DEV 검증 이력 없음 | DEV 먼저 검증 (K8s 미배정이면 유사 검증) |
| 6 | **Kyverno 위반 미평가** — Pod spec 변경인데 Kyverno admission 점검 생략 | `kyverno apply <policy> --resource <rendered.yaml>` 사전 검증 |
| 7 | **cross-env 혼용** — STG/LIVE 매니페스트에 DEV 전용 ns/registry/URL 참조 | 환경별 값 분리 확인 |
| 8 | **파괴적 명령 미확인** — `kubectl delete ns/pv`, `helm uninstall`, `argocd app sync --prune`, `docker compose down` 포함 | 사용자 명시 승인 후에만 가이드 출력 |

## 역검증 요구 (변경 제안 전 필수)

산출물을 제시하기 전에 반드시 아래 두 가지에 답한다:

1. **영향 범위**: 이 변경이 실패한다면 어느 서비스/환경에 영향이 가는가?
2. **복구 경로**: 이전 상태로 되돌리는 명령이 있는가? (없으면 변경 제안 금지)

## 정보 신뢰도 선언 (인프라 작업 착수 전)

| 등급 | 기준 | 대응 |
|---|---|---|
| A | 대상 파일 직접 확인 + 환경 컨텍스트 실측 | 정상 작업 |
| B | 파일 일부 또는 diff 만 확보 | 미확인 항목에 `[추측]` 라벨 |
| C | 대상 파일/환경 미확인 | 파일 먼저 Read. 추측으로 산출 금지 |
