# Getting Started — 10분 walkthrough (★ ★ ★ v2.0.0 chain harness validated 정식 release)

본 가이드 = plugin install 직후 첫 100 line. 사용자가 자기 legacy 코드 분석 + chain harness 진입까지 10분.

## 1. Install (2분)

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v2.0.0
/plugin install ai-native-methodology@ai-native-methodology
/reload-plugins
```

★ install 직후 SessionStart hook 메시지 표시 — `[ai-native-methodology] Plugin loaded. v2.0 chain harness ready...`

## 2. Sanity check (1분)

```bash
# version-check
/plugin                  # 대화형 manager — Installed 탭 / v2.0.0 확인
```

본 plugin install 후 dist root 에 다음 자산 만남:
- `CLAUDE.md` — 사내 정책 23 inline (LLM 자동 컨텍스트)
- `README.md` — 본 plugin 진입점
- `agents/` `skills/` `hooks/` `flows/` `tools/` `templates/` `methodology-spec/` `schemas/`
- `guides/` (★ 본 폴더 — 사용자 journey 자산)
- `CHANGELOG.md` + `CHANGELOG-HISTORY.md`
- `CHECKSUMS.txt` (무결성 검증)

## 3. 시나리오 선택 (1분)

| 의도 | 시나리오 | 다음 단계 |
|---|---|---|
| 이미 운영 중 legacy 분석만 (기획/스펙/테스트/구현 부재) | **A** (analysis stage only) | §4 |
| Legacy → 새 시스템 / 4 stage 전체 거치고 싶다 | **B** (chain harness e2e) | §5 — 본 가이드 메인 |
| Phase 4.5 형식 명세 검증만 (도구 호출) | **C** (validator 단독) | §6 |

## 4. 시나리오 A — Analysis stage only (3분)

분석 대상 사내 legacy 프로젝트 디렉토리에서 새 Claude Code 세션 시작 → 자연어 prompt:

```
"이 코드베이스 분석 시작해줘"
```

→ `phase-0-input` skill 자동 발동. 입력 정리 (target / branch / 모듈 범위) 사용자 답변.

이후 자연어 prompt:
- "inventory 추출" → `phase-1-inventory`
- "아키텍처 분석" → `phase-2-architecture`
- "도메인 모델 추출" → `phase-3-domain`
- "비즈니스 규칙 추출" → `phase-4-rules`
- "antipattern 정리" → `phase-6-quality`

각 phase 종결 시 산출물 `<project>/.aimd/output/` 에 .json + .md 이중 렌더링.

자세한 prompt → skill 매핑 = [first-prompt-cookbook.md](./first-prompt-cookbook.md).

## 5. 시나리오 B — Chain harness e2e (★ 메인 / 6분)

★ ★ ★ v2.0 paradigm 핵심.

```bash
# 5-1. chain-driver init (1분)
node tools/chain-driver/src/cli.js init <project>
# → .aimd/state.json 생성 / 첫 stage = analysis (chain 1 진입 전)
```

```
# 5-2. analysis stage 종결 (시나리오 A 와 동일)
"이 코드베이스 분석 시작해줘"  → 7대 산출물 산출

# 5-3. chain 1 (planning) 진입 (1분)
"기획 단계 시작"
→ extract-from-legacy / decompose-use-cases / identify-business-intent skill 자동 발동
→ planning-spec.{json,md} 산출
→ gate #1 (planning-extraction-validator) 자동 호출
→ pass 시 다음 stage / blocked 시 fix 후 재시도

# 5-4. chain 2 (spec) 진입 (1분)
"behavior spec / acceptance criteria 도출"
→ compose-behavior-spec / derive-acceptance-criteria / integrate-7대-deliverables
→ behavior-spec + acceptance-criteria + 7대 통합
→ gate #2 (chain-coverage-validator / UC→BHV→AC ≥ 0.85)

# 5-5. chain 3 (test) 진입 (1분 / ★ RED 의무)
"test spec 생성 RED"
→ generate-test-spec / run-test-evidence / verify-coverage
→ test-spec + 실 test code (jest/vitest/junit5/pytest 등)
→ ★ ★ ★ 모든 test fail 입증 (impl 부재 / RED)
→ gate #3 (spec-test-link-validator / AC→TC ≥ 0.85)

# 5-6. chain 4 (impl) 진입 (1분 / ★ GREEN 의무)
"impl spec 생성 GREEN"
→ generate-impl-spec / verify-test-pass
→ impl-spec + 실 impl code
→ ★ ★ ★ 100% test pass 입증
→ gate #4 (test-impl-pass-validator / --allow-execute 의무)

# 5-7. release matrix (1분)
"traceability matrix"
→ traceability-matrix-builder
→ UC→BHV→AC→TC→IMPL+commit_hash matrix 산출
```

## 6. 시나리오 C — Validator 단독 (3분)

```bash
# Phase 4.5 형식 명세 검증
node tools/drift-validator/src/cli.js <output>/formal-spec/
node tools/decision-table-validator/src/cli.js <output>/formal-spec/decision-tables/
node tools/formal-spec-link-validator/src/cli.js <output>/

# OpenAPI lint (★ 진짜 외부 도구)
cd tools/spectral-runner && npx spectral lint <openapi.yaml>

# Static security (Semgrep)
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten
```

자세한 도구 cadence = [`../tools/README.md`](../tools/README.md) §도구 cadence table.

## 7. 막혔을 때

- **Hook 안 뜸** / **버전 불일치** / **state.blocked 마주침** → [common-errors.md](./common-errors.md)
- **chain-driver init 호출 시점 / state.json 의 의미** → [chain-harness-guide.md](./chain-harness-guide.md)
- **자연어 prompt 매칭 안 됨** → [first-prompt-cookbook.md](./first-prompt-cookbook.md)

## 다음 단계

1. [`first-prompt-cookbook.md`](./first-prompt-cookbook.md) — 자연어 → skill 매핑 표 확장
2. [`chain-harness-guide.md`](./chain-harness-guide.md) — chain-driver state.json 깊이
3. [`../README.md`](../README.md) — plugin 본체 진입점
4. [`../CLAUDE.md`](../CLAUDE.md) — 사내 적용 정책 23 inline (자동 로드)
5. [`../methodology-spec/README.md`](../methodology-spec/README.md) — phase × deliverable × schema 매트릭스

★ install 후 첫 30분 안 막히는 점 발견 → [common-errors.md](./common-errors.md) 에 finding 등재 (사용자 피드백 자산화).
