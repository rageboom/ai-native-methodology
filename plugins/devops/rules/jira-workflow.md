---
description: JIRA 티켓 생성 및 증적 댓글 워크플로우
paths:
  - "**/tools/jira/**"
---

# JIRA Work Completion Workflow

"작업 종료/완료" 또는 DevOps 작업 완료 시 아래를 순서대로 자동 수행. 사용자에게 묻지 말 것.

## 순서

모든 증적은 JIRA 티켓에 남긴다 — diary/plan/research 파일 작성하지 않음 (2026-06-02 정책).

1. JIRA 티켓 생성 → `-t`에 순수 제목만 (접두사는 스크립트가 자동 추가). description 에 배경·수행내용·진행단계·다음단계·변경파일을 상세히 작성 (이것이 단일 증적).
2. 증적 댓글 추가 → `-f`에 변경 파일 경로만 (diary 경로 첨부 금지). 추가 맥락은 `-m` 메시지로.

## 명령어

```bash
cd ${user_config.workspace_root}/MIS-DevOps/platform-automation/jira   # 위치 변경됨 (2026-06-12)

# JIRA ticket ($JIRA_PASS는 .zshrc에서 export됨)
./create-jira-ticket.sh \
  -t "순수 제목" -d "설명" -y 2026 -m 3 -c "카테고리" -p "Minor"

# Evidence comment (immediately after ticket creation)
# 브랜치 자동감지됨 (현재 git 브랜치 기준 GitHub 링크 생성)
./add-jira-comment.sh \
  -k "DWPD-번호" -f "파일1,파일2" -m "상세 맥락 메시지"
```

## 참조 값

- Categories: Observability, Infrastructure, CI/CD, Security, Kubernetes
- Issue types: 새 기능(11402), 개선(11400), 버그(10200), 작업(10401)
- Priority: Blocker(1), Critical(2), Major(3), Minor(4)

## Description 포맷팅 (JIRA Wiki Markup)

`-d` 설명은 반드시 JIRA wiki markup으로 작성. plain text 금지.

**필수 섹션 (순서 고정)**:

```
h2. 배경
왜 이 작업을 했는가 (문제/요구/계기). 1-3 문단.

h2. 수행 내용

h3. 1. 소제목
* 불릿 항목
* {{파일명}} 또는 {{설정값}} 인라인 코드

{code}
코드 블록
{code}

h2. 개선 효과 (해당 시에만)
* *Before*: 변경 전 상태 (수치/현상 포함)
* *After*: 변경 후 상태 (수치/현상 포함)
* 사용자/시스템 측면에서 무엇이 좋아졌는가 (1-2줄)

(참고) "기존에 어떤 문제가 있었고 그걸 해결한" 맥락이 명확할 때만 작성. 신규 추가/단순 설정 같이 비교 대상이 없는 경우엔 이 섹션 통째로 생략. 억지로 채우면 보고 신뢰도가 떨어짐.

h2. 진행 단계
* KPI 큰 과제: {{KPI 이름}} (예: DevOps 자동화 및 플랫폼 전환, 고유업무)
** 에픽: {{에픽 이름}} (예: 쿠버네티스 구축, OSS 모니터링 스택 PoC)
* 현재 위치: 전체 N단계 중 X단계 ({{단계명}})
* 선행: 이 작업이 어느 작업 이후 가능했는지

h2. 다음 단계
* 바로 이어서 할 일: 이 작업 직후 PR/작업 (티켓 또는 작업명)
* 같은 에픽 내 다음 단계: 무엇을 향해 가는가

h2. 변경 파일
* {{경로/파일명}} (신규 또는 수정)
```

**포맷 규칙**:

| 문법 | 용도 |
|------|------|
| `h2.` | 섹션 헤더 (필수 섹션 6개 모두 사용) |
| `h3.` | 서브 섹션 |
| `* ` | 불릿 리스트 |
| `{{텍스트}}` | 인라인 코드 (파일명, 설정값, 티켓 ID) |
| `{code}...{code}` | 코드 블록 |
| `*텍스트*` | 볼드 강조 |

**섹션별 작성 원칙** (사용자 강조 2026-05-04 / 2026-05-06 보강):
- "개선 효과" — *조건부*. "기존에 X 문제가 있었고 → Y로 해결" 또는 "기존 대비 N% 빠름" 같이 명확한 Before/After 맥락이 있을 때만 작성. 신규 추가/단순 설정처럼 비교 대상이 없으면 섹션 통째로 생략. 어거지로 채우면 신뢰도 깎임 — 강제 금지 (사용자 강조 2026-05-06).
- "진행 단계" — *필수*. **KPI 큰 과제 → 에픽** 두 단계 모두 명시. KPI 큰 과제는 본인 KPI 카테고리 명칭 (예: "DevOps 자동화 및 플랫폼 전환", "고유업무"). 그 아래 에픽은 JIRA 에픽 이름과 일치 (예: "쿠버네티스 구축", "OSS 모니터링 스택 PoC"). KPI 안에 에픽이 들어있는 계층 관계가 보여야 함. 단계 인용은 Confluence K8s 단계 정리(pageId=699777523) 또는 해당 에픽의 단계 정리 문서 참조.
- "다음 단계" — *필수*. 후속 작업이 있어야 에픽이 진전됨을 보여줌. 없으면 "후속 없음 (단발 작업)" 명시.

## 주의사항

- `-t` 옵션에 `[년도][월][카테고리]` 접두사 넣지 말 것 (스크립트가 자동 추가)
- diary/plan/research 파일 작성·첨부 금지 — 모든 상세 증적은 티켓 description + 댓글에
- JIRA 티켓 생성 및 증적 댓글도 사용자 확인 후 실행. 자동 실행 금지

## K8s 카테고리 티켓 — 단계 정리 panel 자동 삽입 (2026-05-06 추가)

K8s/Kubernetes/쿠버네티스/ArgoCD/Helm/Envoy Gateway/Cilium 키워드의 티켓은 description 끝에 다음 panel을 반드시 포함시킬 것. 단일 인용처 페이지에서 진행도/단계 정보를 자동 인용.

```
{panel:title=📍 K8s 전환 단계 정리 (단일 인용처)|borderStyle=solid|borderColor=#3572b0|titleBGColor=#deebff|bgColor=#f4f5f7}
* *에픽*: 쿠버네티스 구축 (KPI: DevOps 자동화 및 플랫폼 전환)
* *현재 단계*: 4/8단계 (DEV 안정화) 진행 중 — 세부 11/19 작업 완료 (58%)
* *다음 단계*: 5단계 DEV 검증 테스트 (10항목, 0/10)
* *KPI 마감*: 2026-12
* *단계 정리 (단일 인용처)*: [쿠버네티스 구축 단계 정리|https://wiki.smilegate.net/pages/viewpage.action?pageId=699777523]
{panel}
```

- 단일 인용처 페이지 ID: 699777523 (Confluence DWPDEV space)
- 단계 변경 시 갱신 도구: `MIS-DevOps/platform-automation/jira/update-k8s-roadmap-blurb.sh` (스크립트의 STAGE_* 변수 수정 후 재실행 → 모든 K8s 티켓 description 일괄 갱신, 멱등)
- 신규 K8s 티켓 생성 시 description에 위 panel을 마지막 섹션으로 포함 (수동 또는 추후 create-jira-ticket.sh에 옵션 추가)
