# Layer 2 LLM Prompt Spec (★ ★ ★ v2.5.0 Phase C session 12차 / Claude Code sub-agent invocation paradigm)

> 2026-05-14 / session 12차 / B-4 paradigm 정합 (★ Claude Code sub-agent invocation paradigm) / STOP-1+2+3+4 흡수 / Q-C0+Q-C-trigger+Q-C-batch+Q-C-model 결단 정합

## 1. paradigm 사상 (★ ★ ★ session 11차 patch v5 paradigm 회복 정합)

★ ★ ★ Layer 2 LLM semantic 검증 paradigm:
- **호출 주체** = ★ ★ Claude Code 안 ★ Claude (호출자 / Opus 4.7) — ★ ★ Node.js script (validator) 가 직접 호출 ❌
- **호출 도구** = ★ ★ Claude Code Task tool (Agent tool) — ★ ★ Anthropic API SDK / OpenAI API SDK 의무 ❌
- **호출 model** = ★ ★ ★ ★ **Sonnet 4.6** (★ ★ STOP-1 echo chamber 약화 paradigm / F-015 cross-validation pattern 정합)
- **호출 paradigm** = ★ ★ ★ batch (★ STOP-4 흡수) — 1회 Task tool 호출 안 전체 BR list 입력 + 전체 결과 JSON 반환
- **trigger** = ★ ★ ★ skill trigger (자연어 prompt 매칭) + ad-hoc (사용자 명시 prompt) hybrid (★ Q-C-trigger (d)+(a))

## 2. ★ ★ ★ Task tool 호출 paradigm 의 자세 시행 영역

### 2.1. 호출 인자 (★ Claude 가 ★ Task tool 호출 시)

```python
Agent({
    description: "Layer 2 BR semantic 검증",
    subagent_type: "general-purpose",
    model: "sonnet",                    # ★ ★ ★ STOP-1 흡수 — Sonnet 4.6 사용 (echo chamber 약화)
    prompt: <prompt 본문>,              # ★ §3 참조
    run_in_background: false            # ★ ★ batch paradigm 정합 / 동기 호출
})
```

### 2.2. ★ ★ batch paradigm 의무 (★ STOP-4 흡수)

- ★ 1회 Task tool 호출 안 ★ ★ ★ 전체 BR list 입력 (★ 31 BR 또는 PoC 별 18 BR)
- ★ ★ ★ context window 한계 = 1M context (Sonnet 4.6) / 31 BR × 평균 ~500 token = ~15.5K token / 충분 자격
- ★ ★ ★ 결과 JSON 반환 paradigm — single message 안 전체 결과
- ★ ★ ★ 매 BR 별 Task tool 호출 ❌ (★ ★ 31 BR × 1.5~2.5시간 회피)

## 3. ★ ★ Prompt 본문 (★ batch paradigm 정합)

### 3.1. ★ ★ system prompt 영역

```
당신은 ★ ★ ★ BR (Business Rule) semantic 정합 검증 전문가 sub-agent.

★ ★ 목적 = ★ ★ 각 BR 의 두 표현 — `natural_language` (자연어 BR statement) ↔ `given/when/then` (Gherkin GWT 3축) — 의 ★ ★ semantic 정합 자체 검증.

★ ★ ★ 본 검증 = ★ ★ ★ Adzic 10년 SBE 폐기 함정 회피 도구 (★ LL-i-26 정합).
★ ★ ★ Layer 1 (keyword overlap = structural sanity check / session 9차 paradigm) 정합 영역과 ★ 별도 axis.

★ ★ ★ ★ 결과 신뢰도 cap = 0.85 (★ Static Tool 시뮬레이션 금지 정책 정합 / LLM advisory = decision-making 대체 ❌).
```

### 3.2. ★ ★ ★ user prompt 영역 (★ batch paradigm)

```
다음 BR list 를 ★ ★ semantic 정합 검증한다. 각 BR 의 natural_language ↔ given/when/then 의미 정합을 0~1 score 로 평가하라.

★ ★ scoring rubric:
  - 1.0 = ★ ★ 완전 동치 (NL 과 GWT 가 같은 의미 / 단어 다름 인정)
  - 0.85~0.99 = ★ 거의 동치 (★ NL 안 1 가지 의미 영역만 GWT 미포함 또는 반대)
  - 0.7~0.84 = ★ 부분 정합 (★ NL ↔ GWT 본질 정합 ✅ but 상세 영역 차이)
  - 0.5~0.69 = ★ ★ 약 정합 (★ NL ↔ GWT 부분 정합만 / 본질 차이 일부)
  - 0.0~0.49 = ★ ★ ★ 정합 부재 (★ NL ↔ GWT 본질 차이 / 다른 BR 영역 또는 명세 결함)

★ ★ 각 BR 별 응답 schema:
{
  "br_id": "<BR id>",
  "semantic_score": <0..1>,
  "rationale": "<단문 1~3 문장 / 이유 + 근거>",
  "confidence": <0..0.85>            // ★ ★ 신뢰도 cap 0.85 의무 (★ Static Tool 시뮬레이션 금지 정합)
}

★ 응답 = ★ ★ ★ 단일 JSON object (★ batch paradigm):
{
  "$schema_version": "v2.5.0-phase-c",
  "model": "claude-sonnet-4-6",
  "invoked_at": "<ISO 8601>",
  "batch_size": <int / BR 수>,
  "results": [
    { "br_id": "...", "semantic_score": ..., "rationale": "...", "confidence": ... },
    ...
  ]
}

★ ★ ★ BR list (★ batch):

<BR list 본문 — 각 BR 마다 id + natural_language + given/when/then 직렬화>
```

### 3.3. ★ ★ BR 직렬화 영역 (★ batch input)

```
--- BR #1 ---
id: BR-USER-EMAIL-FORMAT-001
natural_language: "사용자 등록 시 이메일은 RFC 5322 형식 정합 필수."
given: ["사용자가 회원가입 페이지 진입"]
when: ["이메일 입력 + 제출"]
then: ["RFC 5322 형식 위반 시 400 BadRequest"]

--- BR #2 ---
id: BR-USER-PASSWORD-HASH-001
natural_language: "..."
given: [...]
when: [...]
then: [...]

...
```

## 4. ★ ★ 응답 schema (★ ★ ★ JSON 본격)

### 4.1. 최상위 영역

| 필드 | 타입 | 의무 | 의미 |
|---|---|---|---|
| `$schema_version` | string | ★ | "v2.5.0-phase-c" |
| `model` | string | ★ | "claude-sonnet-4-6" (★ STOP-1 흡수 paradigm) |
| `invoked_at` | string (ISO 8601) | ★ | sub-agent 호출 시점 |
| `batch_size` | int | ★ | results array 길이 |
| `results` | array | ★ ★ ★ | BR 별 결과 |

### 4.2. results 영역 (★ BR 별)

| 필드 | 타입 | 의무 | 의미 |
|---|---|---|---|
| `br_id` | string | ★ ★ | BR 4토막 id (★ v2.3.7 enforcement 정합) |
| `semantic_score` | number (0..1) | ★ ★ ★ | NL ↔ GWT semantic 정합 score |
| `rationale` | string | ★ | 단문 1~3 문장 / 이유 + 근거 |
| `confidence` | number (0..0.85) | ★ ★ | LLM advisory 신뢰도 cap (★ Static Tool 시뮬레이션 금지 정합) |

## 5. ★ ★ ★ validator 호출 paradigm (★ Claude 가 결과 JSON 저장 후)

```bash
# ★ ★ Claude (호출자) 가 Task tool 호출 후 결과 JSON 파일 저장
# ★ ★ ★ validator 호출
node tools/br-cross-consistency-validator/src/cli.js \
  --target examples/poc-03-realworld-nestjs/output/rules/rules.json \
  --strict \
  --llm-results /tmp/poc-03-layer-2-results.json
```

★ ★ validator 처리:
- ★ `--llm-results` 입력 시 = ★ ★ Layer 2 본격 paradigm 활성 (★ validateRulesDocStrict)
- ★ ★ Layer 1 + Layer 2 통합 점수 paradigm — Layer 1 deterministic_score AND Layer 2 llm_consistency_score 양쪽 통과 (★ Q-C4 (a) 결단 정합)
- ★ ★ ★ 결과 finding 영역 통합 — Layer 1 (structural_sanity_only / id_pattern_violation / structure_*) + Layer 2 (semantic_drift_detected / confidence_cap_exceeded)

## 6. ★ ★ ★ ★ trigger paradigm (★ Q-C-trigger (d)+(a) hybrid)

### 6.1. (d) skill trigger paradigm (★ ★ 권장)

★ ★ 본 방법론 plugin 자산 안 skill 신설:
- 위치: `skills/analysis/br-cross-consistency-check/SKILL.md`
- trigger keyword: "br cross consistency check" / "Layer 2 검증" / "BR semantic 정합 검증"
- 시행 paradigm:
  1. ★ Claude (호출자) 가 skill 권고 stderr 감지 (★ chain-driver hooks-bridge paradigm)
  2. ★ Claude 가 ★ ★ Task tool 호출 (★ Sonnet 4.6 + batch prompt)
  3. ★ 결과 JSON 파일 저장 (`/tmp/poc-XX-layer-2-results.json`)
  4. ★ ★ validator CLI 호출 (`--strict --llm-results <path>`)
  5. ★ 결과 사용자 보고

### 6.2. (a) ad-hoc paradigm (★ ★ 보조)

★ 사용자 명시 prompt = "★ PoC #03 Layer 2 검증 시행해줘" → ★ Claude 가 위 (d) step 2~5 시행 paradigm.

## 7. ★ ★ session 13차 시행 영역 (★ ★ STOP-2 흡수)

★ ★ ★ ★ 본 prompt-spec 영역 = ★ ★ session 12차 자산화 ✅ / ★ ★ session 13차 본격 시행:
1. ★ PoC #03 18 BR 본격 합성 (★ NL TODO marker → 본격 BR statement) + Layer 2 검증
2. ★ PoC #05 2 BR GWT 신규 합성 + Layer 2 검증
3. ★ PoC #01 13 BR Layer 2 재검증 (★ session 11차 baseline)
4. ★ ★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js)
5. ★ ★ Phase D = release-readiness 8/8 → 9/9 격상 검토

## 8. ★ ★ 한계 / carry

- ★ ★ ★ ★ **C-self-invocation-echo-chamber** = ★ Sonnet 4.6 호출 paradigm 으로 약화 / ★ ★ Phase D 시점 retrospect 검토 의무
- ★ ★ **C-batch-paradigm-context-overflow** = ★ ★ context window 1M 한계 / 100+ BR 시 batch 분할 paradigm carry
- ★ ★ ★ **C-phase-d-domain-expert-review** = ★ Layer 2 LLM advisory = 사람 검토 대체 ❌ / Phase D 도메인 전문가 검토 의무 carry
- ★ ★ **C-trigger-skill-asset-신설** = ★ skills/analysis/br-cross-consistency-check/SKILL.md 신설 의무 (★ session 13차 시행)

## 9. ★ ★ ★ chain harness 5 요소 변경 ❌

본 prompt-spec 영역 = ★ ★ docs 자산 신설만. ★ chain harness 5 요소 (★ schema / chain-driver / drift-validator / formal-spec-link-validator / spec-test-link-validator) 변경 ❌ 보존.

★ ★ ★ ★ chain 1 gate Layer 2 통합 (★ chain-driver gate-eval.js) = ★ ★ session 13차 (★ Phase C step 9) 영역 — ★ ★ chain harness 5 요소 1 변경 의무 = ★ ★ session 13차 본격 결단 영역.
