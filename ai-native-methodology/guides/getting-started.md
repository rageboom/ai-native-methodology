# Getting Started — 10분 walkthrough (★ ★ ★ v3.6.9 paradigm 진화 안정점 + enforcement cadence 정착)

본 가이드 = plugin install 직후 첫 100 line. 사용자가 자기 legacy 코드 분석 + chain harness 진입까지 10분.

> **갱신 이력**: v2.0.0 작성 → v2.5.1 정합 갱신 → v3.6.9 정합 갱신 (★ A3 / session 20차 / Gap 모두 청산 + 47 skills / 16 tools / 39 schemas / 14 PoC / **11/11 strict criterion** / 분석 입력 5종 orchestrate / FE skill 4종 / scope/stage 자동 폴더) → **v9.0.1 6-stage 정합 갱신** (planning→discovery 개칭 + plan stage 신설).

## 1. Install (2분)

### (Recommended) 사내 GHE 표준 — ★ v2.4.1+ Recommended

```bash
# Claude Code 세션에서:
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install ai-native-methodology@ai-native-methodology
```

### 오프라인 / 압축본

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v2.5.1
/plugin install ai-native-methodology@ai-native-methodology
```

★ install 직후 SessionStart hook 메시지 표시 — `[ai-native-methodology] Plugin loaded. v2.5 chain harness ready / Layer 2 LLM paradigm ✅`.

## 1.5 외부 도구 사전 install — chain harness 동작 의무 (★ v8.5.0+ F-V2-05 신설)

★ ★ ★ 본 plugin 의 **R15 (no-simulation 정책)** + chain 4/5 (test/implement) 의 **real test runner** 의무로 다음 외부 도구가 사용자 환경에 필요. 부재 시 chain 단계 산출물이 차단되거나 F-SIM finding 자동 등재.

### Core (필수)

| 도구 | 의무 | 검증 |
|---|---|---|
| `node` ≥ 18 | chain-driver / 모든 17 cli tool 동작 | `node --version` |
| `npm` | workspace test (release-readiness #11) | `npm --version` |

### Stack-specific (해당 스택일 때 의무)

| 도구 | 사용처 | 필요 stack |
|---|---|---|
| `mvn` + `javac` (JDK ≥ 1.8) | chain 4 RED + chain 5 GREEN test runner | Java/Spring (예: IFRS / EFI-WEB) |
| `npx` + `vitest`/`jest`/`playwright` | 동상 | Node/NestJS/React |
| `python3` + `pytest` | 동상 | Python/FastAPI |

### Analysis cross-cutting (해당 skill 호출 시 의무 / 부재 시 F-SIM 자동 등재)

| 도구 | 의무 skill |
|---|---|
| `semgrep` | `analysis-aspect-static-security` |
| `pmd` (PMD-JSP 포함) | `analysis-html-template` (JSP 분석 / Scenario C) |
| `spotbugs` | `analysis-aspect-legacy` |
| `spectral` | `analysis-openapi` lint |
| `axe-core` (Playwright 의존) | `analysis-aspect-a11y` |

### 환경 진단 명령

```bash
# release 직전 또는 plugin install 직후 의무 호출:
node ${CLAUDE_PLUGIN_ROOT}/scripts/preflight-check.js --stack all

# stack 지정 (Java/Spring 만):
node ${CLAUDE_PLUGIN_ROOT}/scripts/preflight-check.js --stack java-spring

# JSON 출력:
node ${CLAUDE_PLUGIN_ROOT}/scripts/preflight-check.js --stack all --json
```

본 preflight 가 **core 도구 부재 시 exit 1** (release 차단). analysis 외부 도구 absent 는 warning + 사용자 결단. release-readiness check #14 (`preflight_tools`) 가 동일 logic 호출 — release 직전 자동 검증.

## 2. Sanity check (1분)

```bash
# version-check
/plugin                  # 대화형 manager — Installed 탭 / v2.5.1 확인
```

★ ★ ★ **v2.5.1 install 후 확인 의무**:
- **Agents: 3** (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`)
- **Skills: 55** (`_base 5 + analysis 28 + discovery 6 + spec 3 + plan 3 + test 4 + implement 4 + dep-graph-navigator 1 + ticket-sync 1`)
- **MCP Servers: (없음)**

만약 `Skills: 0` 또는 `Agents: README` 식 출력 = v2.5.0 이전 버전 / 재install 의무 (v2.5.1 PATCH 가 1-depth flatten paradigm 으로 fix).

본 plugin install 후 dist root 에 다음 자산 만남:
- `CLAUDE.md` — 사내 정책 inline (LLM 자동 컨텍스트)
- `README.md` — 본 plugin 진입점
- `agents/` `skills/` `hooks/` `flows/` `tools/` `templates/` `methodology-spec/` `schemas/`
- `guides/` (★ 본 폴더 — 사용자 journey 자산)
- `CHANGELOG.md` (v2.4+) + `CHANGELOG-HISTORY.md` (v2.3.x 이전)
- `CHECKSUMS.txt` (무결성 검증 / 295 파일)

## 3. 시나리오 선택 (1분)

| 의도 | 시나리오 | 다음 단계 |
|---|---|---|
| 이미 운영 중 legacy 분석만 (기획/스펙/테스트/구현 부재) | **A** (analysis stage only) | §4 |
| Legacy → 새 시스템 / 4 stage 전체 거치고 싶다 | **B** (chain harness e2e) | §5 — 본 가이드 메인 |
| `formal-spec` phase 형식 명세 검증만 (도구 호출) | **C** (validator 단독) | §6 |

## 4. 시나리오 A — Analysis stage only (3분)

분석 대상 사내 legacy 프로젝트 디렉토리에서 새 Claude Code 세션 시작 → 자연어 prompt:

```
"이 코드베이스 분석 시작해줘"
```

→ `analysis-input-collection` skill 자동 발동. 입력 정리 (target / branch / 모듈 범위) 사용자 답변.

이후 자연어 prompt:
- "inventory 추출" → `analysis-source-inventory`
- "아키텍처 분석" → `analysis-architecture`
- "도메인 모델 추출" → `analysis-domain-model`
- "비즈니스 규칙 추출" → `analysis-business-rules` (★ v2.4 dual representation NL + GWT)
- "SQL inventory 추출" → `analysis-sql-inventory` (v2.2 / v2.3 12컬럼)
- "비즈니스 규칙 의미 일관성 검증" → `analysis-br-cross-consistency-check` (★ v2.5 신규 / Layer 2 LLM)
- "antipattern 정리" → `analysis-quality-antipattern`

각 phase 종결 시 산출물 `<project>/.aimd/output/` 에 .json + .md 이중 렌더링.

자세한 prompt → skill 매핑 = [first-prompt-cookbook.md](./first-prompt-cookbook.md).

## 5. 시나리오 B — Chain harness e2e (★ 메인 / 6분)

★ ★ ★ v2.0 paradigm 핵심 / ★ v2.5 chain 1 gate Layer 2 LLM 통합.

```bash
# 5-1. chain-driver init (1분)
node tools/chain-driver/src/cli.js init <project>
# → .aimd/state.json 생성 / 첫 stage = analysis (chain 1 진입 전)
```

```
# 5-2. analysis stage 종결 (시나리오 A 와 동일)
"이 코드베이스 분석 시작해줘"  → 7대 산출물 산출

# 5-3. chain 1 (discovery) 진입 (1분 / ★ v2.5: Layer 2 LLM 의무 통과)
"발견 단계 시작" (또는 "기획 단계 시작")
→ discovery-from-analysis-output / discovery-decompose-use-cases / discovery-identify-business-intent skill 자동 발동
→ discovery-spec.{json,md} 산출 (★ v11.0.0 rename)
→ gate #1 자동 호출:
  · discovery-extraction-validator (입출력 무결성)
  · ★ br-cross-consistency-validator Layer 1 (결정적) + Layer 2 (Claude Code sub-agent / Sonnet 4.6) 양쪽 통과
→ semantic_drift_detected 또는 confidence_cap_exceeded finding 발생 시 → state.blocked / 사용자 결단

# 5-4. chain 2 (spec) 진입 (1분)
"behavior spec / acceptance criteria 도출"
→ spec-compose-behavior-spec / spec-derive-acceptance-criteria / spec-integrate-deliverables
→ behavior-spec + acceptance-criteria + 7대 통합
→ gate #2 (chain-coverage-validator / UC→BHV→AC ≥ 0.85)

# 5-5. chain 3 (plan) 진입 (1분 / ★ v10.0.0 gate #3 본격)
"plan / 계획 / task 분해"
→ plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr
→ task-plan.{json,md} 산출 (tasks / ADR alternatives ≥3 / NFR allocation / risks)
→ gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR ≥3 + dependency cycle)

# 5-6. chain 4 (test) 진입 (1분 / ★ RED 의무)
"test spec 생성 RED"
→ test-generate-test-spec / test-run-test-evidence / test-verify-coverage
→ test-spec + 실 test code (jest/vitest/junit5/pytest 등)
→ ★ ★ ★ 모든 test fail 입증 (impl 부재 / RED)
→ gate #4 (spec-test-link-validator / AC→TC ≥ 0.85)

# 5-7. chain 5 (impl) 진입 (1분 / ★ GREEN 의무)
"impl spec 생성 GREEN"
→ implement-generate-impl-spec / implement-verify-test-pass
→ impl-spec + 실 impl code
→ ★ ★ ★ 100% test pass 입증
→ gate #5 (test-impl-pass-validator / --allow-execute 의무)

# 5-8. release matrix (1분)
"traceability matrix"
→ _base-build-traceability-matrix
→ UC→BHV→AC→TC→IMPL+commit_hash matrix 산출
```

## 6. 시나리오 C — Validator 단독 (3분)

```bash
# formal-spec phase 형식 명세 검증
node tools/drift-validator/src/cli.js <output>/formal-spec/
node tools/decision-table-validator/src/cli.js <output>/formal-spec/decision-tables/
node tools/formal-spec-link-validator/src/cli.js <output>/

# OpenAPI lint (★ 진짜 외부 도구)
cd tools/spectral-runner && npx spectral lint <openapi.yaml>

# Static security (Semgrep)
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# ★ v2.4+ BR cross-consistency 검증
node tools/br-cross-consistency-validator/src/cli.js <output>/business-rules.json
# (Layer 1 결정적 + Layer 2 LLM strict mode 옵션)

# ★ v2.3.6+ findings aggregator (전체 finding 단일 stream)
node tools/findings-aggregator/src/cli.js <output>/
```

자세한 도구 cadence = [`../tools/README.md`](../tools/README.md).

## 7. 막혔을 때

- **Hook 안 뜸** / **버전 불일치** / **state.blocked 마주침** → [common-errors.md](./common-errors.md)
- **chain-driver init 호출 시점 / state.json 의 의미** → [chain-harness-guide.md](./chain-harness-guide.md)
- **자연어 prompt 매칭 안 됨** → [first-prompt-cookbook.md](./first-prompt-cookbook.md)
- **Skills: 0 출력 (Claude Code install 후)** → v2.5.0 이전 버전 / v2.5.1 재install 필요

## 다음 단계

1. [`first-prompt-cookbook.md`](./first-prompt-cookbook.md) — 자연어 → skill 매핑 표 확장
2. [`chain-harness-guide.md`](./chain-harness-guide.md) — chain-driver state.json + Layer 2 LLM 깊이
3. [`../README.md`](../README.md) — plugin 본체 진입점
4. [`../CLAUDE.md`](../CLAUDE.md) — 사내 적용 정책 inline (자동 로드)
5. [`../methodology-spec/README.md`](../methodology-spec/README.md) — phase × deliverable × schema 매트릭스

★ install 후 첫 30분 안 막히는 점 발견 → [common-errors.md](./common-errors.md) 에 finding 등재 (사용자 피드백 자산화).
