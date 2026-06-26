# DEC-2026-06-25-session-resume-summary

**세션 시작 시 "현재 stage + 잔여작업" 자동 요약 — additionalContext + 첫 응답 렌더(Option B) / stderr·systemMessage 폐기 (v0.80.0 MINOR / MIS-428 [OP-SESSION-001])**

**상태**: 승인·시행 (plugin.json 0.79.0 → 0.80.0)

## 맥락 (사용자 발화)

"세션 최초 시작 시 지금 어느 stage 인지, 잔여 작업이 뭔지 볼 수 있는 요약이 있었으면 한다."

분해: "세션 최초 시작"=SessionStart 훅 / "현재 stage"=chain stage 위치 / "잔여 작업"=남은 chain 단계 + 대기 항목(blocked·pending_revisit·current_task).

## 진단 (조사로 확인 — 재발명 ❌)

데이터(state.json)·합성 로직(`getActiveScopeChain`/`renderStatusline`)·상시 표시(statusLine)·수동 조회(`/chain-status`)·전략 컨텍스트(session-handoff)는 **이미 다 있다**. 비어 있던 건 **"세션 시작 시점에 stage+잔여작업을 합성 표출"하는 한 조각**뿐. 특히 **"현재 stage"는 statusLine(`📍 spec 2/5 · BC-FOO`)이 블랭크 화면부터 상시 담당** → 신규 작업은 "잔여 단계 + 대기 항목"만.

## 채널 사실 — 재논의에서 교정 (공식문서 직접 fetch / 2026-06-25)

1차 plan/research(`research-session-resume-summary.md`)는 **"stderr=유일 사용자 가시 채널"**로 전제하고 기존 `cli.js`의 drift-stderr 를 정상 선례로 인용했다. 그러나 공식문서(code.claude.com/docs/en/hooks.md) 직접 fetch 결과:

| 채널 (SessionStart, exit 0) | 실제 동작 |
| --- | --- |
| **stderr** | exit 0 = debug 로그行 / **사용자 트랜스크립트 미표출**. "Shows stderr to user" 는 **exit 2 또는 `--verbose`** 한정. → plan 전제 **거짓**. |
| `hookSpecificOutput.additionalContext` | system reminder 로 모델 컨텍스트 주입(chat 메시지 ❌) / **Anthropic 이 세션 상태 컨텍스트 권장 패턴으로 명시** → 어시스턴트 첫 응답 렌더. |
| `systemMessage` | 사용자 표출되나 정의가 "**Warning** message" + 시각 렌더 미명세(라벨/색/멀티라인 불확정) → 중립 요약을 경고로 오해 위험. |
| plain stdout | SessionStart 특례 모델 컨텍스트行(사용자 배너 ❌). |

→ 부수 발견: 기존 `cli.js`의 drift/unbaselined **stderr write(exit 0)는 사용자 미표출 = 죽은 코드**(latent bug). drift 정보는 이미 `additionalContext`(parts)로 모델에 전달 중이라 가시성 무손실.

## 결정 (Option B / 사용자 확정)

세션 시작 시 활성 chain 이 있으면 "남은 단계 + 대기 항목" 컴팩트 블록을 **`additionalContext` 최상단에 prepend** → 어시스턴트가 첫 응답에서 중립 톤 렌더. **`systemMessage`·stderr 폐기.** "현재 stage"는 statusLine 이 상시 담당하므로 중복 안 함.

```
🧭 세션 재개 — spec 2/5 · BC-FOO
   남은 단계: plan → test → implement
   대기: ⛔ blocked: <reason> · ↩ revisit: <stage> · 🔖 task: OP-X(branch)
```

① **순수 helper** `tools/chain-driver/src/session-resume.js` — `buildSessionResumeSummary(state)`. `CHAIN_ORDER`/`renderStatusline` 을 `chain-statusline.js` 에서 import(단일 소스 / 사본 ❌ / statusline self-contained 불변식 보존 — 의존 방향 cli.js→leaf statusline 정상). 남은 단계 = `CHAIN_ORDER.indexOf(current_chain)` **전방 slice**(status 문자열 필터 ❌ — enum 은 `'complete'`/`'in_progress'`라 필터 시 전부 미완 오판). 대기 = blocked/pending_revisit/current_task **있는 것만**(빈 항목 suppress). 활성 chain 없으면(idle/null/비-chain) `null` = 전체 침묵.
② **배선** `cli.js` SessionStart 분기 — `readState`(read-only/try-catch 비-fatal)로 state 읽어 helper 호출 → `additionalContext` 최상단 prepend. **reference-lens·display-only — evaluateGate/cmdNext 등 어떤 결정적 gate 에도 inject ❌**(STRONG-STOP 결정론 axis 보존 / `feedback_chain_driver_deterministic_axis`).
③ **dead stderr 제거** — drift/unbaselined stderr write 삭제(exit 0 미표출). `hooks-contract.test.js` 단언을 stderr → `additionalContext` 로 정정 + `doesNotMatch(stderr)` 회귀 가드.
④ **Senior 적대검토 보존**: LLM 하드 지시문 ❌(기존 handoffNudge 수준 소프트) / HANDOFF §3 파싱 ❌(SKILL 중복금지 / nudge 유지) / Jira 조회 ❌(세션 시작 원격 호출 금지).
⑤ **display-only / §8.1**: 격상·schema·gate 변경 0 → ≥2 PoC corroboration 불요. 순수 helper 단위테스트 + statusline 무회귀는 의무.

## 검증

- `session-resume.test.js` 12 (활성/analysis/idle/null/blocked/revisit/task/last-stage/복합/no-scope) + chain-driver 715/715(회귀 0 / hooks-contract 정정 포함).
- 라이브 SessionStart 스모크(spec 2/5 · 남은 단계 plan→test→implement · 대기 revisit+task 렌더 확인).
- version 3-way 0.80.0 + release-readiness.

## 본체 격상 / 잔여 (§8.1 / carry)

- LLM 첫 응답 richer 렌더형(포맷 풍부화) — 현 컴팩트 블록으로 충분하면 불요.
- 블랭크 화면 즉시 표출이 후속 요구로 발생 시 `systemMessage` 1줄 재검토 — 단 warning 톤·렌더 미명세 trade-off 명시.
- HANDOFF §3 "다음 작업" 표면화 강화 = 현 nudge 로 충분 / 파싱은 SKILL 중복금지로 영구 컷.

## 교훈 (Lessons Learned)

- **§2 적대검토 결론도 1차 문서 재fetch 없이 액면 수용 ❌.** plan+research 가 stderr 가시성을 거짓 전제했고(선례로 인용한 cli.js drift-stderr 자체가 깨진 코드), 재논의 + 공식문서 직접 fetch 가 교정. (1차 교정=stage 매핑 공유 가정 / 본 건=2번째 self-기록 사실 교정.) `feedback_self_recorded_fact_validation` + `feedback_research_fact_validation`.
- **statusLine 재프레이밍이 설계를 단순화**했다 — "현재 stage"는 이미 상시 표시 중이라 systemMessage warning-톤 리스크를 떠안을 필요가 없었다.

Relates: DEC-2026-06-24-chain-stage-awareness(statusLine + /chain-status sibling) + feedback_chain_driver_deterministic_axis(STRONG-STOP) + DEC-2026-06-11-session-handoff-convention(handoffNudge sibling) + DEC-2026-06-25-state-model-simplify(state schema 2.0 / current_chain·current_task·pending_revisit 필드).
