# 플러그인 사용현황 대시보드 (거버넌스)

플러그인 총괄 관점에서 "무엇이 쓰이고, 무엇이 안 쓰이고, 무엇을 고쳐야 하는지"를 Claude Code 텔레메트리로 판단한다.

- 대시보드: DEV Grafana `Claude Code 플러그인 사용현황` (uid `claude-code-plugins`, AI-Tooling 폴더)
- 정본: `MIS-DevOps/platform-observability/.../dashboards/json/AI-Tooling/claude-code-plugins.json`
- 수집 설정: `MIS-DevOps/platform-automation/claude-code-telemetry/` (managed-settings 배포 템플릿)

## 텔레메트리가 플러그인에 대해 자동으로 남기는 것

플러그인에 계측 코드를 넣을 필요가 없다. Claude Code 가 이벤트를 Loki 로 보내고, 아래 속성으로 플러그인 귀속이 된다.

| 이벤트 | 귀속 키 | 내용 |
|---|---|---|
| `plugin_loaded` | `plugin_name`, `plugin_version`, `marketplace_name` | 세션 시작마다 로드 기록 — 설치/버전 파편화 파악 |
| `skill_activated` | `skill_name`(`<plugin>:<skill>` 형), `plugin_name`, `invocation_trigger`, `skill_source` | 스킬·커맨드 발동. 트리거가 user-slash / claude-proactive / nested-skill 로 나뉜다 |
| `api_request` | `agent_name`, `query_source`, 토큰/비용/시간, `prompt_id` | 서브에이전트 LLM 호출과 턴 비용 |
| `tool_result` | `tool_name=Skill`, `success`, `duration_ms`, `prompt_id` | 스킬 실행 성패 |
| `hook_execution_*` | `hook_name`(`Event:Matcher` 형) | 훅 실행 빈도. 플러그인 단위 귀속은 안 된다(merged) — 한계 |

`prompt_id` 가 한 턴의 user_prompt → skill_activated → api_request → tool_result 를 묶는다. 대시보드의 "프롬프트 상관" 행이 이 조인으로 "어떤 프롬프트에서 어떤 항목이 발동됐고 그 턴이 토큰/비용/시간을 얼마나 썼는지"를 보여준다.

## 개선 루프 (플러그인 오너 플레이북)

| 신호 (대시보드 패널) | 해석 | 조치 |
|---|---|---|
| 카탈로그에 있는데 발동 표에 없음 | 미사용 항목 | description 재작성 또는 폐기. 다음 릴리스 후 추이 재확인 |
| user-slash 일변도, claude-proactive 0 | 자동 트리거 부전 | 스킬 description 을 트리거 문구 중심으로 수정 |
| 로드수 많고 발동 적음 | 설치만 되고 안 쓰임 | 온보딩 가이드·데모, 팀원 채택 매트릭스로 대상 특정 |
| 같은 플러그인 버전 2개 이상 | 파편화 | 구버전 사용자 재설치 안내 |
| Skill 실행 실패율 상승 | frontmatter/스크립트 오류 | prompt_id drilldown 으로 원인 추적 후 패치 |
| 스킬별 평균 턴 비용 상위 | 참조 파일 과대, 불필요 컨텍스트 | 스킬 본문 슬림화, 릴리스 전후 비교 |
| tool_decision reject 증가 | permission 마찰 | allowlist·훅 차단 규칙 조정 |
| compaction 빈발 | 세션 과길이 — 산출물 부정확 재시도 의심 | 해당 시간대 발동 스킬을 프롬프트 상관 행에서 대조 |

릴리스(버전 업) 시점을 기억해 두고 발동 추이·실패율·평균 턴 비용을 전후 비교하는 것이 기본 사이클이다.

## 한계 (수집 스키마 기인)

- 로그 이벤트에 session.id 가 없다 (공통 속성은 prompt.id / event.timestamp / event.sequence). "플러그인 사용 세션이 더 긴가"는 직접 조인이 안 되고, 세션별 토큰·활성시간 메트릭(`OTEL_METRICS_INCLUDE_SESSION_ID=true` 배포 후)과 compaction 빈도로 근사한다.
- 프롬프트 본문은 `OTEL_LOG_USER_PROMPTS=0` 정책으로 `<REDACTED>` — 분석은 prompt_id·명령어·길이로 한다.
- `event_name` 은 Claude Code 버전에 따라 `claude_code.` 접두사 유무가 혼재한다. 쿼리는 `(claude_code\.)?` 허용 정규식 필수.
- 훅은 `hook_name` 이 `Event:Matcher` 뿐이라 어느 플러그인의 훅인지 구분되지 않는다.
- 에이전트 귀속은 `agent_name` 문자열뿐이므로 플러그인 간 에이전트 이름이 겹치지 않게 짓는다.
