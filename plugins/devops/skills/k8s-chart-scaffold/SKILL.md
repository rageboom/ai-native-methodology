---
name: k8s-chart-scaffold
description: |
  개발자가 MIS-GitOps에 신규 Helm chart(신규 앱 또는 Compose→K8s 전환 대상)를 추가할 때 쓰는 스캐폴딩 가이드. 다음 요청 시 사용:
  - "새 앱 K8s에 추가해줘", "차트 만들어줘", "신규 chart 스캐폴드"
  - "이 서비스 쿠버네티스로 옮기고 싶어" (전환 계획 수립이 아니라 실제 chart 파일 생성 단계)
  - "ArgoCD Application 등록해줘", "이 앱 Envoy Gateway로 노출해줘"
  `k8s-migration` skill과 다르다 — 그건 Compose→K8s 전환 "계획·매핑"이고, 이 skill은 MIS-GitOps 레포에 실제로 커밋할 chart 파일을 만드는 "실행" 단계다.
---

# MIS-GitOps 신규 Chart/App 스캐폴딩

MIS-GitOps는 umbrella+9-subchart 구조가 아니다 (2026-06 이전 문서에 그렇게 남아있으면 stale). `apps/mis-platform`이 parent chart이고, 워크로드는 `charts/<name>/` 아래 **standalone chart**로 각각 분해되어 있다. 새 앱을 추가할 때도 이 패턴을 따른다.

## 0. 착수 전 확인

- `rule-infra-decision-gate` skill의 8조 레드라인을 먼저 점검한다 (특히 air-gap Harbor mirror, secret 평문, rollback 계획).
- DEV만 K8s 게이트가 실질적이다. STG/LIVE 매니페스트도 함께 만들되, 클러스터 미배정 상태라 실 배포 영향은 0임을 인지한다(향후 Task 6 대비).
- 기존 standalone chart(예: `charts/backend-eam`)를 템플릿으로 삼는다 — 새 chart를 무에서 설계하지 않는다.

## 1. Chart 디렉토리 생성

```
MIS-GitOps/charts/<name>/
├── Chart.yaml
├── values.yaml               # 기본값 (환경 무관 공통)
├── values-dev.yaml
├── values-stg.yaml
├── values-live.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── (필요 시 configmap.yaml, hpa.yaml, pdb.yaml)
```

## 2. `templates/deployment.yaml` 필수 항목 (SRE + DevSecOps lens)

- `resources.requests`+`limits.memory` 설정. **CPU limit는 설정하지 않는다** — 이 레포는 CFS throttle 회피를 위해 CPU limit을 전사적으로 안 쓰는 게 의도된 설계다(`clusters/*/core-config/limitrange.yaml` 주석 참조). CPU limit을 넣고 싶으면 왜 필요한지 먼저 근거를 남긴다.
- `startupProbe` + `livenessProbe` + `readinessProbe` 모두 정의. **values로 빼서 env별 override 가능하게 한다** — `frontend-bo`처럼 template에 하드코딩하면 env별 조정이 안 된다(알려진 실수 사례).
- `PodDisruptionBudget` 정의, 다중 레플리카면 `podAntiAffinity`.
- `terminationGracePeriodSeconds` + `lifecycle.preStop` (graceful shutdown).
- Pod Security: `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`, `capabilities.drop: ["ALL"]`, `seccompProfile.type: RuntimeDefault`. namespace가 이미 PSA `restricted`이므로 위반 시 admission에서 즉시 거부된다.
- CronJob이면 `concurrencyPolicy`/`activeDeadlineSeconds`/`successfulJobsHistoryLimit`·`failedJobsHistoryLimit` 명시.

## 3. `values.yaml` / `values-{env}.yaml`

- 이미지 태그 기본값에 **`kubernetes-v1.0.0prev` 같은 mutable placeholder를 쓰지 않는다**. `scripts/set-image-tag.sh`가 write-back 시점엔 이 태그를 거부하지만, base `values.yaml` 자체에 이런 값이 관행적으로 남아있는 chart가 많다 — 새 chart는 이 관행을 반복하지 않는다. 실제 배포 전에는 git SHA 기반 immutable tag로 채운다.
- `image.registry`는 `globalOverrides.imageRegistry`(부모 차트 `apps/mis-platform/values-{env}.yaml`)로 상속되는 패턴을 따른다 — chart 자체에 환경별 Harbor 도메인을 하드코딩하지 않는다. Harbor는 dev/stg/live 도메인 자체가 분리되어 있다(`dev-mis-registry.smiledev.net` 등).
- Secret은 Infisical ExternalSecret 참조로 — values/ConfigMap에 평문 금지.

## 4. ArgoCD Application 등록

`apps/mis-platform/templates/applications.yaml`에 새 Application 항목을 추가한다.

- **알려진 불일치**: 이 템플릿은 환경 무관하게 `syncPolicy.automated: {prune: true, selfHeal: true}`를 하드코딩한다. 반면 LIVE parent(`bootstrap/live/20-mis-platform.yaml`)는 `automated: false`(수동)다. Task 6(LIVE K8s 배정) 전엔 영향이 없지만, LIVE용 Application을 추가한다면 이 불일치를 인지하고 팀에 확인한다.
- 이 chart가 stateful(PV/PVC)이면 `apps/cluster-addons/{env}/applicationset-manifest.yaml`의 prune 정책을 확인한다 — 현재 스토리지 관련 element들이 `prune:true`를 공유하고 있어 README가 주장하는 격리(`Prune=false`)와 실제 매니페스트가 다르다. 신규 stateful 리소스를 추가하기 전 이 파일을 직접 확인한다.

## 5. Envoy Gateway 노출 (외부/내부 라우팅 필요 시)

- HTTPRoute + (필요 시) SecurityPolicy를 `charts/mis-platform-gateway/`에 추가한다. Kong이 아니라 **Envoy Gateway**다.
- 새 SecurityPolicy는 `_helpers.tpl`의 `corsSpec` named template을 **반드시 include**한다 — Envoy Gateway는 route-level SecurityPolicy가 attach되면 Gateway-level policy를 통째로 override하므로, 이 include를 빠뜨리면 CORS 정책이 통째로 사라진다.
- `maxAge`는 `30m`처럼 string + h/m/s/ms 단위로 쓴다. 정수를 넣으면 YAML이 float으로 직렬화해 reject된다.
- CORS `origins`에 와일드카드 `*` 금지.

## 6. Kyverno 정책 준수 확인

- `allowed-registries` 정책(`00-allowed-registries.yaml`)이 Harbor prefix만 허용한다 — 다른 registry를 참조하면 admission에서 거부된다.
- Enforce 정책(00~04, `background: true`)은 grandfather trap이 있다: 정책 활성화 전부터 떠 있던 Pod는 봐주지만, 신규 chart의 첫 rollout은 정책을 통과해야 한다. 배포 전 로컬에서 재현한다.

## 7. 로컬 검증 (커밋 전 필수)

```bash
cd MIS-GitOps
scripts/kubeconform.sh                      # 전 chart × dev/stg/live K8s/CRD schema 검증
scripts/policy-sweep.sh                     # Kyverno admission 정적 재현 (globalOverrides 주입)
scripts/validate-cross-chart-refs.sh        # gateway ↔ workload 참조(HTTPRoute/SecurityPolicy targetRefs) 정합
scripts/values-sync-check.sh                # cross-chart 공유 키 동기화
```

세 검증 스크립트의 렌더링 방식이 다르다는 점에 주의한다: `policy-sweep.sh`만 `globalOverrides`를 주입해서 렌더하고, `kubeconform.sh`/`validate-cross-chart-refs.sh`는 chart를 단독으로 렌더한다. 결과가 스크립트마다 다르게 나와도 이 차이 때문일 수 있다.

## 8. 이미지 promote (배포 시점)

```bash
scripts/set-image-tag.sh <env> <repository> <new-tag>   # git SHA 기반 immutable tag만 허용
```

## 9. PR 생성 후

- `devops-toolkit`의 `infra-reviewer` agent에게 "이 PR 리뷰해줘"라고 요청하면 GHE PR을 직접 fetch해 5-lens(SRE/DevSecOps/AIOps/FinOps/DevOps) 리뷰 + 코멘트까지 자동 처리한다.
- MIS-GitOps `charts/`·`clusters/` 경로 정밀 리뷰(2-pass 보안→신뢰성)는 그 레포의 `manifest-security-reviewer`→`manifest-reliability-reviewer`가 자동으로 이어받는다.

## 완료 체크리스트

- [ ] Chart.yaml / values.yaml / values-{env}.yaml 3종 작성, mutable tag 미사용
- [ ] deployment.yaml: probe 3종 + PDB + memory limit(only) + Pod Security restricted 필드
- [ ] ArgoCD Application 등록 (`apps/mis-platform/templates/applications.yaml`), syncPolicy 불일치 인지
- [ ] (필요 시) HTTPRoute + SecurityPolicy(`corsSpec` include 확인)
- [ ] `kubeconform.sh` / `policy-sweep.sh` / `validate-cross-chart-refs.sh` 통과
- [ ] Infisical ExternalSecret 참조 정합 (평문 시크릿 없음)
- [ ] PR 생성 후 `infra-reviewer` 또는 `manifest-security-reviewer`→`manifest-reliability-reviewer` 리뷰 완료
