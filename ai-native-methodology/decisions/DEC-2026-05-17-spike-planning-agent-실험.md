# DEC-2026-05-17 — _spike-planning-agent 실험 자산화 (B5 multi-agent paradigm 1 stage spike)

- **결정일**: 2026-05-17 (session 21차 / paradigm 안정점 직후 실험)
- **결정자**: 윤주스 (TF Lead) — 사용자 명시 의제 "★ B5. multi-agent 협업 paradigm 으로 전환 부터 해보자"
- **상태**: ★ ★ ★ 종결 (2026-05-17 / v4.0 옵션 A 본격 채택 + spike archive 이동 본격 시행) — 사용자 명시 결단 source 자격 본격 달성 / 본 spike 자산 = `archive/v4-spike/_spike-planning-agent.md` 이동 (역사 기록)

## 결정

`plan-skill-invocation-guarantee.md` §B5 옵션 C (스파이크 PoC) 채택. agents/_spike-planning-agent.md 단일 파일 실험 자산 신설.

- **본체 paradigm (DEC-2026-05-15-g5 "stage 별 분리 ❌") retract ❌** — 본 spike = 실험 / 본체 자산 미오염
- **본 spike 자산 = `agents/_spike-planning-agent.md` 단일 파일** — `_` prefix + EXPERIMENTAL 표기
- **산출 경로 분리** = `examples/<poc>/.aimd/output/_spike/` (본체 `.aimd/output/` 미오염)
- **chain-driver / hooks-bridge.js / agents/README.md 변경 ❌** — 본체 enforcement + 정책 SSOT 보존
- **release-readiness 검증 대상 ❌** — EXPERIMENTAL 자산 / v3.x release 자격 부재

## paradigm 결단 (사용자 결단 2026-05-17)

| 의제 | 결단 | 근거 |
|---|---|---|
| paradigm 변화 진입 | **B5 paradigm 본격 검증 진입** ✅ | 사용자 명시 의제 / multi-agent 협업 vision |
| 진입 옵션 (A 전면 / B 부분 / C 스파이크) | **옵션 C 스파이크** ✅ | plan 본문 추천 / CLAUDE.md "재작업 최소화 2순위" + "§8.1 단일 PoC 과적합 회피" 정합 |
| 24h cooling-off 면제 근거 | **PoC 자체는 실험 / 본체 자산 변경 ❌** ✅ | memory `feedback_decision_cadence_24h_cooling_off.md` cosmetic 4 기준 = "구조 변경 ❌" 충족 / 실험 자산만 신설 |
| spike 범위 | **chain 1 (planning) 1 stage 만** ✅ | fail-fast cadence / Stage 4 mini-PoC 패턴 정합 |
| version label | **none — EXPERIMENTAL** ✅ | release-readiness 대상 ❌ / 본체 release 영향 없음 |

## 외부 사실 (claude-code-guide 검증 — 2026-05-17)

본 spike paradigm 가능성 입증:
- ❌ agent frontmatter `tools` 에 `Skill` 명시 불가 (공식 문서 명시 금지 / line 267)
- ✅ sub-agent 의 Skill tool 자동 활성 (parent scope 상속 / line 272)
- ✅ frontmatter `skills: [...]` 필드 = startup 시 사전 주입 (line 407~429)

본 spike agent frontmatter:
```yaml
tools: Read, Glob, Grep, Bash, Write
skills: [planning-extract-from-legacy, planning-decompose-use-cases, planning-identify-business-intent, _base-invoke-go-stop-gate, _base-log-finding]
```

## 신설 자산

- `agents/_spike-planning-agent.md` (★ EXPERIMENTAL / 단일 파일)

## 수정 자산

- `decisions/INDEX.md` — 본 DEC 등재 (진행중 결정 row)
- (★ ★ ★ 본체 자산 변경 ❌ — paradigm 보존 의무)

## 검증 (1주 후 corroboration source)

본 spike 가 다음을 입증해야 v3.7 (옵션 B) 또는 v4.0 (옵션 A) 결단 자격:

1. **산출물 일치** — spike 결과 (`_spike/planning-spec.json`) vs 기존 paradigm 결과 (`.aimd/output/planning-spec.json`) = source_grounded_evidence + UC/BR-INTENT 의미 일치 ≥ 90%
2. **신뢰도 동등 이상** — planning-extraction-validator critical/high finding 0 동일 충족
3. **context 사용량 비교** — main agent 단독 vs agent dispatch 사용량 차이 정량 측정
4. **≥ 2 PoC corroboration** — PoC #05 1개만 ≠ §8.1 strict 자격 / 추가 PoC (예: #01 또는 #03) 후속 carry

부족 시 = 본체 paradigm 보존 결단 / `_spike-planning-agent.md` archive 또는 제거.

## 후속 (carry)

- **C-spike-poc-05-dispatch** — PoC #05 에서 본 spike agent dispatch 실시도 + cross-validation report 자산화. 본 session 또는 후속 session.
- **C-spike-poc-corroboration-2nd** — ≥ 2 PoC corroboration 충족용 2nd PoC 선정 + 동일 spike dispatch. v3.7/v4.0 결단 source 의무.
- **C-spike-result-decision** — corroboration ≥ 2 PoC 충족 후 사용자 결단: v3.7 옵션 B (chain 1~4 만 agent 화 MINOR) / v4.0 옵션 A (전면 retract MAJOR) / 본체 paradigm 보존 (spike archive).
- **C-spike-chain2-4-agents** — chain 2~4 (spec / test / implement) spike agent 동등 검증 carry. corroboration 결과 우호 시 진입.

## 정합 관계

- `plan-skill-invocation-guarantee.md` (★ 본 결단의 모 plan / B5 옵션 C 진입 권고)
- DEC-2026-05-15-g5-lifecycle-asset-matrix-종결 (★ 본체 paradigm — retract ❌ 보존)
- memory `feedback_decision_cadence_24h_cooling_off.md` (★ cooling-off cosmetic 4 기준 충족 / 본 spike 면제 근거)
- memory `feedback_paradigm_stable_point_cadence.md` (★ paradigm 안정점 직후 새 feature ≠ default / 단 실험 paradigm 허용)
- memory `feedback_stage_4_mini_poc_assets.md` (★ 1주 fail-fast cadence 패턴 정합)
- ADR-CHAIN-001~005 (chain harness paradigm — 본 spike 가 chain harness gate 안 동작 의무)

## Lessons Learned (★ paradigm 진화)

- **LL-B5-spike-01**: 본 spike paradigm 가능 입증을 위해 **외부 사실 fetch 의무화** (claude-code-guide agent 위임). 본체 paradigm 의 caution 4 정합 — 추측 paradigm 진입 차단. F-015 cross-validation 패턴 정합.
- **LL-B5-spike-02**: `_` prefix + EXPERIMENTAL 표기 + 별도 산출 디렉토리 (`.aimd/output/_spike/`) = 본체 자산 미오염 보장 paradigm. 본체 paradigm retract ❌ + 실험 paradigm 병존 가능. v2.0 sub-plan-6 carry-over 패턴 응용 (paradigm 진입 시 본체 보호 의무).
