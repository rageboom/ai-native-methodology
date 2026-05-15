# DEC-2026-05-15 — Plugin Charter 17 요구사항 채택

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 채택

## 결정

사내 표준 AI-Native 개발 방법론 플러그인의 **단일 요구사항 SSOT** 로
`methodology-spec/plugin-charter.md` 신설 + 17 요구사항 채택.

## 배경

v3.1.0 시점까지 plugin 의 must-have 능력이 흩어져 있음:
- `CLAUDE.md` 가치 명세 (chain harness 4단계 / §3-A automation axis)
- `methodology-spec/lifecycle-contract.md` (SDLC contract)
- `methodology-spec/workflow/input.md` (입력 5종)
- `flows/*.phase-flow.json` (phase 의존 그래프)

다발 자산을 한 곳에 합치고 외부 가시성 확보 필요.

## 17 요구사항 (요약)

R1~R5 (분석 입력 + plan-driven + 작업단위 + 산출물 재사용/위치) /
R6 (Claude Code 디폴트) /
R7 (작업단위 폴더화) /
R8 (입력 5종 — 코드/Figma/Swagger/문서경로/자연어) /
R9~R11 (chain 2~4 = 스펙 / 테스트 / 구현) /
R12 (단계별 agent/skill/hook 매핑) /
R13 (revisit loop) /
R14 (BE/FE 분기) /
R15 (정적 도구 의무) /
R16~R17 (MCP 티켓화 / 모든 단계 발행)

상세 = `methodology-spec/plugin-charter.md` §1.

## 검증 결과 (v3.1.0 기준)

- ✅ 11 항목 — chain harness / flows / schemas / static-tool / be-fe-separation 자산 완비
- ⚠️ 4 항목 — R5(산출물 자동 폴더), R7(work-unit 컨벤션), R8(Figma/Swagger skill), R14(FE skill 불균형)
- ❌ 2 항목 — R16/R17 ITSM/Jira 자동 티켓화 (실현 미완)

## 후속 작업

| Gap | 후속 산출물 |
|-----|-----------|
| G1 (R16/R17) | `plan-itsm-jira-chain-integration.md` 실현 + skill `itsm-ticket-emit` + Stop hook |
| G2 (R8) | skill `analysis-from-figma` + `analysis-from-swagger` |
| G3 (R5/R7) | SessionStart hook + `.aimd/chain-N/<work-unit-id>/` 자동 생성 |
| G4 (R14) | FE skill 보강 (FE-impl / FE-test / design-html-template) |
| G5 (R12) | `lifecycle-contract.md` stage × asset 매핑표 신설 |

추가 권장 8건 (P1~P8) 은 charter §5 backlog 보관.

## 정합 관계

- 본 결정 채택 시 `CLAUDE.md` 핵심 디렉토리 섹션에 `methodology-spec/plugin-charter.md` 추가 의무
- `decisions/INDEX.md` 한 줄 추가 의무
- 메모리 `project_plugin_charter.md` 신설

## 근거 자산

- `methodology-spec/plugin-charter.md` (본 결정의 산출물)
- 외부 인용: docs.claude.com hooks / agent-teams / plugin-marketplaces (2026-05 기준)
