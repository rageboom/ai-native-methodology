# Getting Started — 10분 walkthrough

본 가이드 = plugin install 직후 첫 100 line. 사용자가 자기 legacy 코드 분석 + chain harness 진입까지 10분.

## 1. Install (2분)

### (Recommended) 사내 GHE 표준

```bash
# Claude Code 세션에서:
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install context-ops@mis-plugins
```

### 오프라인 / 압축본

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v<version>
/plugin install context-ops@mis-plugins
```

install 직후 SessionStart hook 메시지 표시 — `[ai-native-methodology] Plugin loaded. chain harness ready / Layer 2 LLM paradigm ✅`.

## 1.5 외부 도구 사전 install — chain harness 동작 의무

본 plugin 의 **R15 (no-simulation 정책)** + chain 4/5 (test/implement) 의 **real test runner** 의무로 다음 외부 도구가 사용자 환경에 필요. 부재 시 chain 단계 산출물이 차단되거나 F-SIM finding 자동 등재.

### Core (필수)

| 도구        | 의무                                   | 검증             |
| ----------- | -------------------------------------- | ---------------- |
| `node` ≥ 22 | chain-driver / 모든 17 cli tool 동작   | `node --version` |
| `npm`       | workspace test (release-readiness #11) | `npm --version`  |

### Stack-specific (해당 스택일 때 의무)

| 도구                                 | 사용처                                  | 필요 stack                       |
| ------------------------------------ | --------------------------------------- | -------------------------------- |
| `mvn` + `javac` (JDK ≥ 1.8)          | chain 4 RED + chain 5 GREEN test runner | Java/Spring (예: IFRS / EFI-WEB) |
| `npx` + `vitest`/`jest`/`playwright` | 동상                                    | Node/NestJS/React                |
| `python3` + `pytest`                 | 동상                                    | Python/FastAPI                   |

### Analysis cross-cutting (해당 skill 호출 시 의무 / 부재 시 F-SIM 자동 등재)

| 도구                         | 의무 skill                                       |
| ---------------------------- | ------------------------------------------------ |
| `semgrep`                    | `analysis-aspect-static-security`                |
| `pmd` (PMD-JSP 포함)         | `analysis-html-template` (JSP 분석 / Scenario C) |
| `spotbugs`                   | `analysis-aspect-legacy`                         |
| `spectral`                   | `analysis-openapi` lint                          |
| `axe-core` (Playwright 의존) | `analysis-aspect-a11y`                           |

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
/plugin                  # 대화형 manager — Installed 탭 / 설치 버전 확인
```

**install 후 확인 의무**:

- **Agents: 3** (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`)
- **Skills: 55** (`_base 5 + analysis 28 + discovery 6 + spec 3 + plan 3 + test 4 + implement 4 + dep-graph-navigator 1 + ticket-sync 1`)
- **MCP Servers: (없음)**

만약 `Skills: 0` 또는 `Agents: README` 식 출력 = 구 버전 / 재install 의무 (1-depth flatten paradigm 미적용 build).

본 plugin install 후 dist root 에 다음 자산 만남:

- `CLAUDE.md` — 사내 정책 inline (LLM 자동 컨텍스트)
- `README.md` — 본 plugin 진입점
- `agents/` `skills/` `hooks/` `flows/` `tools/` `templates/` `methodology-spec/` `schemas/`
- `guides/` (본 폴더 — 사용자 journey 자산)
- `CHANGELOG.md` (v2.4+) + `CHANGELOG-HISTORY.md` (v2.3.x 이전)
- `CHECKSUMS.txt` (무결성 검증 / 295 파일)

## 3. 시나리오 선택 (1분)

| 의도                                                    | 시나리오                    | 다음 단계           |
| ------------------------------------------------------- | --------------------------- | ------------------- |
| 이미 운영 중 legacy 분석만 (기획/스펙/테스트/구현 부재) | **A** (analysis stage only) | §4                  |
| Legacy → 새 시스템 / 4 stage 전체 거치고 싶다           | **B** (chain harness e2e)   | §5 — 본 가이드 메인 |
| `formal-spec` phase 형식 명세 검증만 (도구 호출)        | **C** (validator 단독)      | §6                  |

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
- "비즈니스 규칙 추출" → `analysis-business-rules` (v2.4 dual representation NL + GWT)
- "SQL inventory 추출" → `analysis-sql-inventory` (v2.2 / v2.3 12컬럼)
- "비즈니스 규칙 의미 일관성 검증" → `analysis-br-cross-consistency-check` (v2.5 신규 / Layer 2 LLM)
- "antipattern 정리" → `analysis-quality-antipattern`

각 phase 종결 시 산출물 `<project>/.ai-context/output/` 에 .json 단독 SSOT (v12 ADR-011 / 시각화는 view-time 도구).

자세한 prompt → skill 매핑 = [first-prompt-cookbook.md](./first-prompt-cookbook.md).

## 5. 시나리오 B — Chain harness e2e (메인 / 6분)

v2.0 paradigm 핵심 / v2.5 chain 1 gate Layer 2 LLM 통합.

```bash
# 5-1. chain-driver init (1분)
node tools/chain-driver/src/cli.js init <project>
# → .ai-context/state.json 생성 / 첫 stage = analysis (chain 1 진입 전)
```

```
# 5-2. analysis stage 종결 (시나리오 A 와 동일)
"이 코드베이스 분석 시작해줘"  → 7대 산출물 산출

# 5-3. chain 1 (discovery) 진입 (1분 / Layer 2 LLM 의무 통과)
"발견 단계 시작" (또는 "기획 단계 시작")
→ discovery-from-analysis-output / discovery-decompose-use-cases / discovery-identify-business-intent skill 자동 발동
→ discovery-spec.json 산출 (json 단독 SSOT)
→ gate #1 자동 호출:
  · discovery-extraction-validator (입출력 무결성)
  · br-cross-consistency-validator Layer 1 (결정적) + Layer 2 (Claude Code sub-agent / Sonnet 4.6) 양쪽 통과
→ semantic_drift_detected 또는 confidence_cap_exceeded finding 발생 시 → state.blocked / 사용자 결단

# 5-4. chain 2 (spec) 진입 (1분)
"behavior spec / acceptance criteria 도출"
→ spec-compose-behavior-spec / spec-derive-acceptance-criteria / spec-integrate-deliverables
→ behavior-spec + acceptance-criteria + 7대 통합
→ gate #2 (chain-coverage-validator / UC→BHV→AC ≥ 0.85)

# 5-5. chain 3 (plan) 진입 (1분 / v10.0.0 gate #3 본격)
"plan / 계획 / task 분해"
→ plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr
→ task-plan.json 산출 (tasks / ADR alternatives ≥3 / NFR allocation / risks)
→ gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR ≥3 + dependency cycle)

# 5-6. chain 4 (test) 진입 (1분 / RED 의무)
"test spec 생성 RED"
→ test-generate-test-spec / test-run-test-evidence / test-verify-coverage
→ test-spec + 실 test code (jest/vitest/junit5/pytest 등)
→ 모든 test fail 입증 (impl 부재 / RED)
→ gate #4 (spec-test-link-validator / AC→TC ≥ 0.85)

# 5-7. chain 5 (impl) 진입 (1분 / GREEN 의무)
"impl spec 생성 GREEN"
→ implement-generate-impl-spec / implement-verify-test-pass
→ impl-spec + 실 impl code
→ 100% test pass 입증
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

# OpenAPI lint (진짜 외부 도구)
cd tools/spectral-runner && npx spectral lint <openapi.yaml>

# Static security (Semgrep)
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# BR cross-consistency 검증
node tools/br-cross-consistency-validator/src/cli.js <output>/business-rules.json
# (Layer 1 결정적 + Layer 2 LLM strict mode 옵션)

# (선택) findings aggregator — stage 별 validator 를 한 번에 실행해 findings JSON 생성 (chain-driver next --findings 입력 편의 / 필수 아님 — next 는 findings 없이도 동작)
node tools/findings-aggregator/src/cli.js --target <project-dir> --stage <discovery|spec|plan|test|implement>
```

자세한 도구 cadence = [`../tools/README.md`](../tools/README.md).

## 7. 막혔을 때

- **Hook 안 뜸** / **버전 불일치** / **state.blocked 마주침** → [common-errors.md](./common-errors.md)
- **chain-driver init 호출 시점 / state.json 의 의미** → [chain-harness-guide.md](./chain-harness-guide.md)
- **자연어 prompt 매칭 안 됨** → [first-prompt-cookbook.md](./first-prompt-cookbook.md)
- **Skills: 0 출력 (Claude Code install 후)** → 구 버전 / 최신 버전 재install 필요

## 다음 단계

1. [`first-prompt-cookbook.md`](./first-prompt-cookbook.md) — 자연어 → skill 매핑 표 확장
2. [`chain-harness-guide.md`](./chain-harness-guide.md) — chain-driver state.json + Layer 2 LLM 깊이
3. [`../README.md`](../README.md) — plugin 본체 진입점
4. [`../CLAUDE.md`](../CLAUDE.md) — 사내 적용 정책 inline (자동 로드)
5. [`../methodology-spec/README.md`](../methodology-spec/README.md) — phase × deliverable × schema 매트릭스

install 후 첫 30분 안 막히는 점 발견 → [common-errors.md](./common-errors.md) 에 finding 등재 (사용자 피드백 자산화).

## 인용

- `ADR-011` — discovery-spec json 단독 SSOT
- 6-stage(planning→discovery 개칭 + plan 신설) / 외부 도구 의무 변천사: `CHANGELOG.md` · `decisions/INDEX.md`
