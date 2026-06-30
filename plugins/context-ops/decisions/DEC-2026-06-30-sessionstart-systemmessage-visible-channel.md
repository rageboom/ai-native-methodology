# DEC-2026-06-30-sessionstart-systemmessage-visible-channel

**SessionStart 세션 재개 요약 사용자-가시 채널 복구 — additionalContext(모델 전용) → systemMessage(결정론 가시) 하이브리드 (v0.89.0 MINOR / 버그픽스 성격 / dead-on-display / MIS-366 하위)**

**상태**: 승인·시행 (plugin.json 0.88.0 → 0.89.0)

## 맥락 (사용자 신고)

MIS-428(v0.80.0)으로 "SessionStart 시점 세션 재개 요약(`🧭 남은 단계 + 대기 항목`)"을 도입했으나, 사용자가 **실제 플러그인 설치 후 진행하면 요약이 보이지 않는다**고 반복 신고. "개발할 땐 되는데 설치하면 안 된다."

## 진단 (실측)

배제부터 — 원인 아님:
- 파일 누락 ❌: `package.json` files 에 `tools/` 전체 + `scripts/chain-statusline.js` 포함 → `session-resume.js` 출하됨.
- Nexus 미publish ❌: `repo.smiledev.net` latest 0.88.0, 0.80.0(기능 도입)도 존재 → 설치본은 기능 보유.
- 함수 결함 ❌: 유효 live state 로 hooks-bridge 재현 시 `buildSessionResumeSummary` 가 올바른 문자열 반환.

진짜 원인 = **출력 채널**. SessionStart hook 의 사용자-대상 표면이 전부 `additionalContext` 단일 채널로만 나갔다. claude-code-guide 가 공식 문서(claude.ai code docs, 2026-06-27 확인)로 확정한 채널 시맨틱:

| 채널 | 사용자 가시 | 결정론 |
| --- | --- | --- |
| stdout / stderr(exit 0) | ❌ (디버그 로그) | ❌ |
| `additionalContext` | ❌ (모델 자발 렌더 시만) | ❌ |
| **`systemMessage`** | ✅ | ✅ (warning 톤) |

`additionalContext` 는 시스템 리마인더로 **모델 컨텍스트에만** 주입 — 사용자 트랜스크립트엔 안 보인다. 모델이 첫 응답에서 자발적으로 echo 할 때만 보이는데, 첫 프롬프트가 구체적 작업이면 모델은 배경정보로 흡수하고 echo 하지 않는다 → **dead-on-display**. `session-resume.js` 주석의 "어시스턴트가 첫 응답에서 중립 톤 렌더(Anthropic 권장 패턴)" 전제가 틀렸다.

같은 버그가 resume 요약뿐 아니라 `drift`/`unbaselined` 경고, `state.json 손상`(corrupt fail-closed), cold-start 안내 전부에 해당 — 특히 corrupt 경고가 안 보여 'ready' 처럼 잠복하던 게 더 위험.

테스트는 함수 반환 문자열(`session-resume.test.js`)·additionalContext 내용(`hooks-contract`)만 검증 → 영원히 GREEN, 실사용 가시성 무검증. (cf. DEC-2026-06-24-hook-script-shipping-guard 의 dead-on-install 변종 = dead-on-**display** / 교훈: 메모리 아닌 결정론 가드 + 채널 전수.)

## 결정

SessionStart 의 사용자-대상 표면을 **`systemMessage`(유일한 결정론 가시 채널)로도 발행**한다. `additionalContext` 는 모델 grounding 으로 full 유지(graph reference 포함) = **하이브리드**.

- **중립 톤 + 결정론 가시 동시 만족 채널은 SessionStart 에 부재** → 가시성 > 톤. 사용자 결단(2026-06-30 "systemMessage(결정론) 채택").
- 과거 "systemMessage 는 warning 톤이라 기각, additionalContext 채택"(reference_sessionstart_hook_channels 에 기록) 결정을 **명시 역전**. 레포 철학 정합(결정론 > LLM 양심 의존 / feedback_chain_driver_deterministic_axis).
- **노이즈 가드**: `systemMessage` 는 보여줄 내용이 있을 때만 채운다 — clean-idle(`current_chain=null` + drift 무 / 'ready' fallback 단독)은 미발행 → 매 세션 배너 노이즈 회귀 차단. additionalContext 는 grounding 으로 'ready' 유지.

## 시행

- `tools/chain-driver/src/cli.js` SessionStart 분기:
  - live 경로: `visibleLines`(resume + handoff + drift/unbaselined) → `systemMessage`, 없으면 미발행. additionalContext 무변(full).
  - `emitSurface`(absent/corrupt/cold-start): text 있으면 `systemMessage: text` 병발, 없으면 현행대로 완전 침묵.
- `tools/chain-driver/src/session-resume.js`: 헤더 주석 정정(채널 사실).
- `tools/chain-driver/test/hooks-contract.test.js`: 결정론 가시 회귀 가드 +5.
- 신규 스크립트 0 / 새 release-readiness check 0(카운트 무변 / 출하 가드 check #43 채널 무변).

## 검증

- chain-driver 782/782 pass(신규 5: live→systemMessage 세션 재개 / corrupt→손상 / unbaselined→경고 / clean-idle→미발행 / absent→미발행·pass-through).
- 라이브 재현: live+chain → `out.systemMessage` 에 `🧭 세션 재개` / corrupt → 손상 경고 가시 / absent → undefined(침묵).
- 3-way 0.89.0 + release-readiness 무회귀.

## 관련

- MIS-428 / project_mis428_session_resume_summary (원조 기능 / Option B 실패 기록)
- reference_sessionstart_hook_channels (채널 사실 정정 — systemMessage 채택)
- DEC-2026-06-24-hook-script-shipping-guard (dead-on-install 동류 / 채널 전수 교훈)
- feedback_chain_driver_deterministic_axis (결정론 > LLM 양심) + feedback_quality_priority
