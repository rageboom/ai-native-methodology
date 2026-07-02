---
description: cross-layer 장애 분류 — 증상을 여러 진단 전문가에게 동시 투입하고 종합. 어느 계층인지 모호한 504/지연/장애 시.
argument-hint: [증상 설명]
---

# Triage: $ARGUMENTS

증상이 어느 계층인지 단정하기 어려운 cross-layer 장애를 분류한다. 단일 진단 agent 의 오라우팅·핸드오프 지연을 피하려고, 후보 계층을 동시에 투입하고 종합한다.

## 절차

1. 증상에서 후보 계층을 식별한다 (보통 2~4개):
   - 호스트/노드/커널/디스크/swap → linux-diagnostician
   - Pod/워크로드/스케줄링/probe/OOMKilled/ArgoCD → k8s-diagnostician
   - DNS/Cilium/Envoy GW/L4/503·504/NetworkPolicy → network-diagnostician
   - Redis/Kafka/MySQL/Infisical → data-diagnostician
   - LGTM 텔레메트리 상관·JVM GC/heap → observability-investigator
2. 후보 계층의 진단 agent 를 **한 메시지에서 병렬로 동시 투입**한다. 각 agent 에 동일 증상 + 가진 입력(붙여넣은 출력·로그)을 전달한다.
3. 각 agent 가 read-only 로 자기 계층 관찰값·가설을 반환하면 종합한다.

## 종합 출력 (4-Block)

```
[결론] 가장 유력한 근본원인 계층 + 한 줄 판단
[근거] 계층별 관찰값 요약 (어느 agent 가 무엇을 봤는지)
[리스크] 교차 영향·놓친 계층
[실행안] HIWARE iTerm2 에서 확인할 한 줄 명령(계층별) + 다음 깊은 진단 대상
```

## 규칙

- 후보가 1개로 명확하면 triage 쓰지 말고 그 agent 를 직접 부른다.
- 투입 agent 는 전부 read-only. 변경 실행 금지, 가이드만.
- 계층 간 상관(예: swap → GC → 504 연쇄)을 명시적으로 연결한다.
