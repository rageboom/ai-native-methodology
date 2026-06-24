---
description: 4개 백엔드 레포 횡단 기술부채 스캔 — core 추출·버전·쿼리 안티패턴 agent 병렬 fan-out 후 P0~P3 체크리스트 종합
argument-hint: "[tlm|eam|gea|observer|all]"
---

# 백엔드 기술부채 횡단 스캔

TLM/EAM/GEA/OBSERVER 4개 레포의 기술부채를 전문 agent 에 병렬 위임해 조사하고, 결과를 우선순위 체크리스트로 종합한다.

## 대상 레포 (경로)

- TLM: `tlm/ep-be-tlm` · EAM: `eam/ep-be-eam` · GEA: `gea` · OBSERVER: `sgh-mis-observer`

## 입력

- `$ARGUMENTS`: 대상 레포. 비었거나 `all` 이면 4개 전부.

## 절차

1. 세 agent 를 한 메시지에서 병렬 dispatch 한다(독립 작업이므로 동시 실행):
   - `core-extraction-analyst` — 중복/유사 코드 추출 후보 (카테고리 A)
   - `dependency-upgrade-analyst` — 의존성/버전 staleness·영향도 (카테고리 B)
   - `query-antipattern-reviewer` — 쿼리 안티패턴·잠재 버그 (카테고리 C)
   - 대상 레포가 지정되면 각 agent 프롬프트에 범위를 그 레포로 한정한다.
2. 각 agent 가 보고한 경로·라인·카운트는 그대로 신뢰하지 않는다. 의심스러운 항목은 Read/Grep 으로 재확인한 뒤 체크리스트에 올린다(subagent 출력 1차 출처 교차검증).
3. 결과를 카테고리별로 종합한다:
   - **A. core 추출 후보** — 중복 코드·추출 대상·예상 영향 범위
   - **B. 버전/성능** — stale 의존성·업그레이드 가능 버전·성능 개선 여지
   - **C. 쿼리/버그** — 안티패턴·잠재 버그·누수·예외처리 미흡
   - **D. 기타** — 위 3개에 안 들어가는 백엔드 관점 부채
4. 각 항목에 우선순위(P0~P3)와 예상 난이도(상/중/하)를 매긴다. 증적이 없으면 `[미확인]` 라벨.

## 산출 규칙

- 체크리스트를 **파일로 만들지 않는다**(증적 정책: 증적은 JIRA 티켓). 채팅으로 정리한다.
- JIRA 티켓화가 필요한 항목은 `→ JIRA` 로 표시한다. 실제 티켓 생성은 사용자 승인 후 `tools/jira` 스크립트로.
- 모든 항목에 `repo/path/File:line` 또는 구체 증적을 붙인다.
