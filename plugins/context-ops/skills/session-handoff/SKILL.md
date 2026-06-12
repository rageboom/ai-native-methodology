---
name: session-handoff
description: Use when a session is ending or starting to persist/restore cross-session working context. 사용자가 "세션 정리" / "세션 마무리" / "인계 문서" / "내일 계속" / "handoff" 류 발화를 하면 .ai-context/HANDOFF.md 를 고정 6절 형식으로 갱신하고, 새 세션 시작 시 그 파일을 최우선으로 읽어 "다음 작업"부터 이어서 진행한다. 산출물(artifact) 상태는 state.json/manifest 가 SSOT — 본 스킬은 그것이 못 담는 전략·합의 컨텍스트(왜/다음/제약)를 담당. Stage = cross-cutting (모든 stage / chain 무관).
allowed-tools: Read, Glob, Bash, Edit, Write
---

# session-handoff — 세션 간 운영 컨텍스트 인계

대화·태스크 리스트는 세션 종료 시 휘발된다. 산출물 상태(state.json / work-unit-manifest / artifact-graph)는 영속하지만, **"왜 이걸 하고 있고, 다음이 뭐고, 무엇을 바꾸면 안 되는지"** 는 어디에도 남지 않는다. 본 스킬이 그 격차를 고정 형식으로 메운다 — P0 가치("산출물 = LLM 운영 컨텍스트, 평생 유지·동기화")의 시간축(세션 간) 연속성.

## 파일 위치 (단일)

`<user-project>/.ai-context/HANDOFF.md` — repo 루트 단일 (멀티모듈 분산 ❌ / `.ai-context` 배치 컨벤션 정합). **커밋 대상 ⭕** — state.json(런타임 상태 / gitignore)과 달리 HANDOFF 는 다른 PC·팀원 이식이 목적 (living-sync git 위생 정합: artifact 류 = 커밋).

## 세션 시작 시 (restore)

1. `.ai-context/HANDOFF.md` 존재 시 **최우선으로 읽는다** (SessionStart hook 이 존재를 additionalContext 로 표면화).
2. §3 "다음 작업"의 최상위 항목부터 이어서 시작 — 단, §4 "휘발성 상태"를 먼저 실제와 대조 (브랜치/미커밋/원격 상태는 사용자가 세션 밖에서 바꿨을 수 있음 — 기록은 작성 시점 사실).
3. 실제와 어긋난 항목 발견 시 사용자에게 표면화 후 HANDOFF 갱신.

## 세션 종료 신호 시 (persist)

트리거: "세션 정리" / "세션 마무리" / "인계 (문서) 갱신" / "내일 계속" / "여기까지" / "handoff" / 사용량 한계 언급. **큰 발견·방향 전환 시에는 신호를 기다리지 말고 즉시 갱신.**

고정 6절 형식 (절 추가/생략 ❌ — 형식 고정이 세션 간 일관 파싱의 전제):

```markdown
# HANDOFF — <project> (최종 갱신: <YYYY-MM-DD>)

## 1. 북극성 (프로젝트 큰 목표)
<불변에 가까운 한 문단 — 매 세션 같은 방향을 보게 하는 기준>

## 2. 현재 위치 (완료 — 증거 포인터)
<완료 항목 + 증거(커밋 해시 / 파일 경로 / gate 통과 기록). 주장만 ❌>

## 3. 다음 작업 (우선순위)
<바로 시작 가능한 단위로. 사용자 결단 대기 항목은 "(사용자 결단)" 표시>

## 4. 휘발성 상태 (작성 시점)
<브랜치 / 미커밋 / 원격 동기 / 외부 시스템 상태 — 다음 세션이 가장 재구성 못 하는 정보>

## 5. 제약·합의 (바꾸면 안 됨)
<세션 중 사용자와 합의한 경계 — 위반 시 재작업 발생하는 것들>

## 6. 핵심 포인터
<재개에 필요한 경로·명령어·관련 문서>
```

작성 규율:

- **§2 는 증거 의무** — 커밋 해시/파일경로 없는 "완료" 주장 금지 (no-simulation 정합).
- **§3 은 실행 가능 단위** — "계속 진행" 같은 모호 항목 ❌ / 다음 세션이 그대로 첫 행동으로 옮길 수 있게.
- **§4 는 갱신 시점 스냅샷** — 세션 밖 변경을 따라가지 못함을 전제로 작성 (시작 시 대조 의무가 짝).
- 길이 절제 — HANDOFF 는 인덱스+인계지 아카이브가 아님. 상세는 §6 포인터로 위임 (STATUS.md lean 정책 동형).
- 산출물 상태와 중복 금지 — chain stage 진행도는 `chain-driver state` 가 SSOT / HANDOFF 는 그 위의 전략 층만.

## state.json 과의 관계 (역할 분담)

| 층 | SSOT | 담는 것 |
| --- | --- | --- |
| artifact 상태 | `.ai-context/state.json` + work-unit-manifest (+artifact-graph) | stage 진행도 / gate / scope / 산출물 |
| **세션 전략 컨텍스트** | **`.ai-context/HANDOFF.md` (본 스킬)** | 북극성 / 다음 작업 / 합의·제약 / 휘발성 환경 상태 |

## When NOT to invoke

- 한 세션 안에서 끝나는 단발 작업 (인계할 다음이 없음).
- chain stage 전환 기록 목적 — 그건 state.json/intervention-log 소관 (중복 기록 ❌).

## 인용

- 정책: `methodology-spec/lifecycle-contract.md` (파일 위치 컨벤션 — `.ai-context/` repo 루트 단일)
- 결단: DEC-2026-06-11-session-handoff-convention (본 스킬 도입 / §8.1 draft — 1st arm = ep-fe-mis dogfood)
- 결단: DEC-2026-06-08-living-sync-adopter-git-hygiene (커밋 대상 분류 — 런타임 상태만 제외)
- 선례: 본 repo `decisions/STATUS.md` "다음 세션 인계" + `SESSION-WRAPUP-*` (방법론 자신의 거버넌스 관행을 채택자 자산으로 승격)
