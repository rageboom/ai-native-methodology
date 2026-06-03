# DEC-2026-05-15 — G1 ITSM/Jira 자동 티켓화 영구 scope-out

- **결정일**: 2026-05-15
- **결정자**: 윤주스 (TF Lead)
- **상태**: 영구 폐기 (v3.6.0)

## 결정

charter §1 R16 / R17 (ITSM/Jira 자동 티켓화) 영구 scope-out.

**사용자 명시 결단 (2026-05-15)**: "G1 안해도 됨 잊어줘"

- charter §1 R16/R17 = strikethrough + scope-out 표기 (번호 보존 / cross-reference drift 회피)
- charter §2 R16/R17 ❌ → scope-out
- charter §3 G1 = strikethrough + 영구 폐기 표기 (잔여 Gap 없음 / 모두 청산)
- charter §2 요약 = 활성 요구 **15/15 자산 대칭** + scope-out 2
- `mcp__wiki-jira-assistant__*` MCP 도구로 사용자 수동 처리 가능 (`reference_confluence_tool` 정합)
- plan-itsm-jira-chain-integration.md 이미 폐기 (session 16차 / 2026-05-15)

## 근거

1. **가치 < 비용** — 자동 티켓화 skill/hook 신설 비용 대비 사용자 가치 ↓ (사용자 1인 dogfooding 단계 / 다른 사람과 협업 부담 ↓ / 수동 MCP 호출로 충분)
2. **MCP 자산 가용** — `mcp__wiki-jira-assistant__jira_*` (create / comment / transition / link / search / update) 13 도구 모두 가용 / 사용자 명시 호출 paradigm 정합 (no-simulation / auto-invoke ❌)
3. **paradigm 정합** — chain harness gate 통과 시 자동 티켓 transition = LLM 양심 의존 risk + chain-driver 결정론 axis 오염 risk ([[feedback_chain_driver_deterministic_axis]] 정합)
4. **paradigm 단순화** — charter Gap 모두 청산 = plugin must-have 자산 대칭 본격 도달 / 신규 paradigm 진화에 charter 부담 ↓

## 향후 재제안 ❌

본 결단 = 영구 폐기. 향후 session 에서 G1 재제안 ❌ ([[feedback_itsm_g1_permanent_scope_out]] 의무 / memory 자산화).

만약 사용자가 미래에 자동 티켓화 가치 재평가하면 별도 charter 요구 신설 (R18+) — R16/R17 부활 ❌.

## 수정 자산

- `methodology-spec/plugin-charter.md` §1 R16/R17 strikethrough + scope-out / §2 요약 갱신 / §3 G1 strikethrough
- `.claude-plugin/plugin.json` 3.5.0 → 3.6.0 (charter 정의 변경 = MINOR)
- `CHANGELOG.md` v3.6.0 entry
- `decisions/STATUS.md` session 19차 entry

## 정합 관계

- DEC-2026-05-15-plugin-charter-17-requirements-채택 — 원안 charter R16/R17 영구 폐기
- DEC-2026-05-15-g{2,3,4,5}-\* — 활성 Gap 모두 종결 sibling
- `reference_confluence_tool` memory — `mcp__wiki-jira-assistant` 수동 처리 paradigm
- [[feedback_chain_driver_deterministic_axis]] — 결정론 axis 오염 회피 (자동 티켓 transition 회피)

## Lessons Learned

- **LL-G1-01**: charter §1 must-have 요구는 사용자 결단으로 영구 scope-out 가능. paradigm 정합 + 비용/가치 평가 변화 시 단순 폐기 결단도 정합. 번호 보존 (R 번호 재정렬 ❌) = cross-reference drift 회피.
- **LL-G1-02**: 자동화 ROI 평가 시 "사용자 1인 dogfooding vs 사내 배포 후" 두 시기 구분 의무. 1인 단계 = 수동 호출 비용 ↓ / 자동화 ROI ↓ / scope-out 정합. 배포 후 사용자 다수 시 재평가 가능 (새 R 요구로 재진입).
