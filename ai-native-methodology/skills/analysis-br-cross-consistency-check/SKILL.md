---
name: analysis-br-cross-consistency-check
description: ★ ★ ★ v2.5.0 Phase C — BR (Business Rule) 의 두 표현 (natural_language ↔ given/when/then) 의 ★ ★ semantic 정합 cross-consistency 검증 skill. Layer 1 결정적 (structural sanity check / br-cross-consistency-validator) + Layer 2 LLM mandatory (★ ★ Claude Code Task tool / Sonnet 4.6 / batch paradigm). Adzic 10년 SBE 폐기 함정 회피 도구 (LL-i-26 정합). industry-first 자격 (Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT 모두 부재).
allowed-tools: Read, Glob, Grep, Bash, Write, Agent
---

# br-cross-consistency-check

★ ★ ★ ★ ★ v2.5.0 Phase C 의 **★ Layer 2 LLM mandatory 본격 paradigm skill**. ★ ★ Q-C-trigger (d) skill trigger paradigm 정합.

## 언제 사용

- ★ ★ business-rules.json 안 BR 의 NL ↔ GWT 정합 본격 검증 시
- ★ ★ ★ Adzic SBE 폐기 함정 회피 도구 사용 시
- 사용자 자연어 trigger:
  - "★ BR cross consistency check"
  - "Layer 2 검증"
  - "★ BR semantic 정합 검증"
  - "★ br-cross-consistency-validator 시행"
  - "★ NL ↔ GWT 정합 검증"

## ★ ★ ★ ★ paradigm 본질 (★ session 11차 patch v5 + session 12차 paradigm 회복)

★ ★ ★ ★ ★ ★ Layer 2 LLM 호출 paradigm = **Claude Code sub-agent (Task tool / Agent tool) invocation paradigm**:
- ★ Claude (호출자) 가 ★ Task tool 호출 (★ Sonnet 4.6 권장 / ★ STOP-1 echo chamber 약화)
- ★ ★ Anthropic API key 의무 ❌ / OpenAI API ❌ / 외부 SDK 의존 ❌
- ★ Claude Code subscription 자체 영역
- ★ Static Tool 시뮬레이션 ❌ 정합

## 입력

- ★ ★ `<project>/.aimd/output/business-rules.json` 또는 `<project>/output/rules/business-rules.json` (★ analysis stage 산출물)
- ★ ★ business-rules.json 안 BR 의 ★ natural_language + given/when/then 양쪽 보유 (★ Phase B + Phase C 마이그레이션 후)

## ★ ★ ★ ★ ★ ★ 시행 paradigm (★ ★ 4 step)

### Step 1 — Layer 1 결정적 영역 사전 시행

```bash
node tools/br-cross-consistency-validator/src/cli.js --target <business-rules.json>
```

★ ★ Layer 1 만 시행 (★ structural sanity check / BR id 4토막 / overlap > 0 등) — ★ ★ Layer 1 fail 시 = Layer 2 진입 자격 ❌.

### Step 2 — ★ ★ ★ Layer 2 sub-agent 본격 호출 (★ ★ batch paradigm)

★ Claude (호출자) 가 ★ Agent tool 호출:

```
Agent({
  description: "Layer 2 BR semantic 검증",
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: <prompt 본문 — tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md §3 정합>
})
```

★ ★ ★ ★ prompt 영역 = `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` §3 정합:
- ★ system prompt — Adzic 함정 회피 도구 명시 + Layer 1 ★ 별도 axis 명시 + confidence cap 0.85 명시
- ★ user prompt — scoring rubric 5 단계 + 응답 JSON schema + BR list inline (★ batch paradigm)

★ ★ ★ ★ sub-agent 응답 schema:
```json
{
  "$schema_version": "v2.5.0-phase-c",
  "model": "claude-sonnet-4-6",
  "invoked_at": "<ISO 8601>",
  "batch_size": <int>,
  "poc_id": "<...>",
  "results": [
    { "br_id": "...", "semantic_score": <0..1>, "rationale": "...", "confidence": <0..0.85> }
  ]
}
```

### Step 3 — 결과 JSON 파일 저장

★ ★ sub-agent 가 ★ ★ Write 도구로 `<project>/.aimd/output/layer-2-results/<poc_id>-layer-2-results.json` 또는 `/tmp/<poc_id>-layer-2-results.json` 저장.

### Step 4 — validator 본격 재실측 (★ Layer 1 + Layer 2 통합)

```bash
node tools/br-cross-consistency-validator/src/cli.js \
  --target <business-rules.json> \
  --strict \
  --llm-results <path-to-layer-2-results.json>
```

★ ★ ★ ★ 통합 영역:
- ★ Layer 1 deterministic_score (★ structural sanity)
- ★ ★ Layer 2 llm_consistency_score (★ semantic 정합)
- ★ ★ overall_score = (L1 + L2) / 2
- ★ ★ ★ gate_status = (L1 ≥ 0.85 AND L2 ≥ 0.7) ★ Q-C4 (a) 결단 정합

## 산출물

- ★ ★ `<project>/.aimd/output/layer-2-results/<poc_id>-layer-2-results.json` (★ Layer 2 결과 보존)
- ★ ★ validator 본격 재실측 결과 (★ console 또는 JSON 출력)
- ★ ★ semantic_drift_detected finding 영역 (★ score < 0.7 시) → ★ Phase D 도메인 전문가 검토 carry

## ★ ★ ★ ★ ★ 한계 / 정직 영역

- ★ ★ ★ ★ same-model self-evaluation bias 위험 — ★ ★ NL/GWT 합성 sub-agent + Layer 2 검증 sub-agent 모두 Sonnet 4.6 시 ★ self-consistency bias / ★ Phase D retrospect 의무 (★ Opus / Haiku 교차 검증 carry)
- ★ ★ confidence cap 0.85 의무 (★ Static Tool 시뮬레이션 금지 정책 정합)
- ★ ★ ★ LLM advisory = 사람 검토 대체 ❌ / Phase D 도메인 전문가 검토 의무 보존 (★ LL-i-31 정합)

## ★ ★ ★ ★ Adzic SBE 함정 회피 자격

- ★ Layer 1 단독 = ★ ★ "★ 형식 통과 = 의미 정합 착각" 함정 재현 위험
- ★ ★ Layer 1 + Layer 2 양쪽 = ★ ★ ★ Adzic 함정 회피 자격 본격 도달 (LL-i-26 정합)
- ★ ★ 본 skill = ★ industry-first 자격 (★ Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT / TestFlow / IBM ODM 모두 부재 / LL-i-35 정합)

## ★ ★ 참조

- `tools/br-cross-consistency-validator/docs/layer-2-prompt-spec.md` — ★ ★ Layer 2 prompt 본격 spec
- `tools/br-cross-consistency-validator/PHASE-C-2026-05-14-re-measurement.md` — ★ session 13차 본격 재실측 보고
- `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` — ★ paradigm 본질 + LL-i-26~38
