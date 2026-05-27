# AI-Native 개발 방법론 v3.6.9 ★ ★ ★ ★ ★ ★

> 사내 표준 AI 기반 개발 방법론. **Legacy 분석 → 발견 → 스펙 → 계획 → 테스트 → 구현** SDLC 6-stage chain harness.
>
> **현재**: v3.6.9 (2026-05-16) — ★ ★ ★ ★ ★ ★ ★ **paradigm 진화 안정점 + enforcement cadence 정착** / 사용자 요구사항 17 모두 청산 (R1~R15 활성 ✅ / R16~R17 영구 scope-out) / release-readiness **11/11** strict 통과 (★ v3.6.7 A1 신설 — workspace test 회귀 자동 차단) / CLAUDE.md ↔ plugin.json drift 자동 enforcement (★ v3.6.4 R2) / **skill 47종 / 도구 16종 / 스키마 39종 / PoC 14종** / 분석 입력 5종 orchestrate (코드 + Figma + Swagger + 기획문서 + 자연어 prompt) / FE skill 4종 (React/Vue/Playwright/JSP) / scope/stage 자동 폴더 + manifest 이중 렌더링 / lifecycle 자산 매핑 매트릭스 단일 SSOT / workspace test **359/359** pass.
>
> ★ Analysis stage = 한 방향 추출 (v1.x 자산 = chain 1 진입 전 단계로 흡수). v2.0 paradigm = legacy 분석 위에 chain harness + revisit loop + 70~80% 한계 명시. v3.x = Gap 청산 + enforcement cadence 정착 + 자산 대칭 완성. ★ v9.0 = 6-stage chain (analysis→discovery→spec→plan→test→implement). ★ v10.0.0 = 5 gate 본격 (discovery #1 / spec #2 / plan #3 / test #4 / impl #5 / chain N = gate #N 1:1 INTERNAL CONVENTION / DEC-2026-05-25-axis-a-phase-4-4-prime).
>
> 자세한 변경 이력 = [CHANGELOG.md](./CHANGELOG.md) (v2.6+) / [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (v2.5.x 이전).

---

## 무엇을 하는가

```
INPUT (1차 = legacy single-case):
  legacy 코드베이스 (소스 / ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세)

  ↓ analysis stage (chain 1 진입 전 / 한 방향 추출)
  ↓
[CHAIN 1] discovery-spec (discovery stage)      ── go/stop gate #1
  ↓
[CHAIN 2] behavior-spec
        + acceptance-criteria
        + 7대 산출물 통합              ── go/stop gate #2
  ↓
[CHAIN 3] task-plan (task 분해 / ADR / NFR / risk)  ── go/stop gate #3
  ↓
[CHAIN 4] test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #4
  ↓
[CHAIN 5] impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #5
  ↓
OUTPUT: prod 시스템 + traceability-matrix (UC→BHV→AC→TC→IMPL+commit_hash)
```

★ AI 자동화 ≥ 85% / 사람 검토 (gate별) ≤ 15% / **70~80% 한계 명시 잔존** (★ **chain harness 전체 자동화 axis** / process 통과율 metric / DEC-2026-05-06-v2.0-i-strict-채택 + DEC-2026-05-06-round-trip-부분-허용).

★ ★ ★ **analysis 단계 §3-A automation axis = ★ 별도 axis** (R1' / DEC-2026-05-13-r1-prime-본체-명문화 / 6 PoC 사실 robust):

| paradigm | analysis §3-A ceiling | corroboration | 측정 환경 |
|---|---|---|---|
| Spring 4.1 + iBATIS 2 (Legacy) | **~53~55%** | ★ 3 사내 PoC isomorphic (PoC #06+#07+#11) | 사내 EFI-WEB |
| Modern stack (MyBatis 3 / TypeORM / Spring Data JPA) | **~60~67%** | ★ 3 OSS PoC corroboration (PoC #08+#09+#10) | ★ ★ OSS 한정 / 사내 Modern 재측정 의무 |

★ ★ metric 분모 자체 다름 — chain harness axis = chain 1~4 통합 gate 통과율 / §3-A axis = analysis 단방향 추출률. 외부 권위 STRONG: Wang et al. ICSE 2025 (DUR legacy 70~90% vs up-to-date 9~18%) + LongCodeBench 2025 (context length ↑ → 정확도 ↓) + AWS SCT 자릿수 정합 (Functions 66.4%) + ThoughtWorks "GenAI for forward engineering" 사상 isomorphic. ★ ★ ★ **R1' = industry first paradigm-cross axis quantification (original empirical finding)**. 자세히 `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X 참조.

---

## ★ ★ chain harness validated 자격 (§8.1 strict 11/11 / v3.6.7 A1 격상)

```
✅  1. poc_corroboration: 9 PoC 본격 (poc-03/04-mini/05/06~11)
✅  2. real_tool_evidence: 5종 물증 10 필드 all present / sha256 valid
✅  3. validators_violation: 4 validators 0 critical/high
✅  4. chain_coverage: 1.0 / threshold 0.85
✅  5. adr_registry: 12 ADR-CHAIN status: 승인됨 + 결정 section
✅  6. matrix_greenness: forward=1 / backward=1 / cells=2 / green=2
✅  7. e2e_cycle_pass: pass=6 / fail=0 (chain 4 GREEN)
✅  8. analysis_validator_violation: schema + br-cross-consistency 0 critical/high (v2.4.0 신설)
✅  9. layer_2_consistency: Layer 2 per-PoC mean ≥ 0.7 + drift 0 (v2.5.0 신설)
✅ 10. claude_md_version_sync: CLAUDE.md "plugin.json vX.Y.Z" 표기 모두 일치 (v3.6.4 R2 신설)
✅ 11. workspace_test_pass: npm test --workspaces 359/359 pass / 0 fail (v3.6.7 A1 신설)
```

★ ★ Platform-Agnostic 입증 — Java/Spring + Java/Hexagonal + TypeScript/NestJS + TypeScript/React FSD + sample chain 5 e2e (PoC #01~#05).

---

## 시작하기

### 사전 요구사항

- Claude Code 설치 (★ plugin 시스템 지원)
- 분석 대상 사내 legacy 프로젝트 git clone
- (선택) ERD 파일, 운영 DB 메타데이터, 기획 문서
- (★ Windows 한국어 환경 / Semgrep 사용 시) `PYTHONUTF8=1` 환경변수
- Node ≥ 18 (chain-driver / 12 workspace tool 실행)

### 사용법 — Plugin install (★ v11.1.0)

#### A. 편집자 — 워크스페이스 직접 등록 (Phase A self-iteration)

본 repo 를 clone 하여 plugin 본체를 직접 수정. 워크스페이스 path 그대로 등록.

```bash
# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology/ai-native-methodology
/plugin install ai-native-methodology@mis-plugins
/reload-plugins
/plugin                  # 대화형 manager — Installed 탭에서 v11.1.0 확인
```

#### B. 배포 수신자 — 사내 사용자 install (★ 사내 표준)

##### B-1. 사내 GHE git URL 기반 (★ Recommended)

사내 GHE (`github.smilegate.net/SGH-ISD/ai-native-methodology`) 의 read 권한 + git 인증만 있으면 install. 별도 dist artifact 전달 ❌.

```bash
# 사내 GHE 인증 1회 (gh CLI 권장 / SSH key 도 가능)
gh auth login --hostname github.smilegate.net

# Claude Code 세션에서:
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install ai-native-methodology@mis-plugins
/reload-plugins
```

특정 버전 pin (★ 권장 — git tag):

```bash
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git#v11.1.0
/plugin install ai-native-methodology@mis-plugins
```

★ plugin update — `/plugin` 대화형 manager → Installed 탭 → "Update" → 최신 tag 자동 fetch.

##### B-2. dist artifact 폴더 등록 (오프라인 / 특수 환경)

빌드된 artifact (`dist/ai-native-methodology-v<version>/` 폴더 또는 zip 압축본) 을 받아 install. 폴더 자체에 `.claude-plugin/{plugin.json, marketplace.json}` 가 들어있어 자기완결.

```bash
# 받은 dist 폴더를 임의 위치에 풀기:
#   ~/claude-plugins/ai-native-methodology-v<version>/
#   ├── .claude-plugin/{plugin.json, marketplace.json}
#   ├── agents/ skills/ hooks/ flows/ templates/ tools/ methodology-spec/ schemas/
#   ├── CHANGELOG.md / CHANGELOG-HISTORY.md / README.md / CLAUDE.md
#   └── CHECKSUMS.txt   ← SHA256 manifest (무결성 검증)

# Claude Code 세션에서:
/plugin marketplace add /absolute/path/to/ai-native-methodology-v<version>
/plugin install ai-native-methodology@mis-plugins
/reload-plugins
```

★ `CHECKSUMS.txt` 로 무결성 검증 — 배포자가 별도 채널 (사내 wiki / Slack pin) 으로 hash 제공 시 대조.

#### 빌드 (★ A → B artifact 생성)

편집자가 dist artifact 를 새로 만들 때:

```bash
# version 갱신 시 3-way sync 의무 (★ source-of-truth = .claude-plugin/plugin.json — ADR-010)
#   .claude-plugin/plugin.json.version  ↔  CHANGELOG.md 첫 ## [vX.Y.Z]  ↔  package.json.version
npm run version:check       # 3-way sync 검증 단독
npm run build               # version-check 강제 → dist/internal-v<version>/ 생성 + CHECKSUMS.txt
npm run build:check         # dry-run (file count 만 출력)
npm run build:diff-check    # build 후 git diff exit-code 0 검증 (CI 용)
npm run release:check       # §8.1 strict 11/11 자동 검사
npm run test                # workspace 12 tool unit test (218 test pass)
```

★ 분석 대상 사내 legacy 프로젝트 디렉토리에서 새 Claude Code 세션 시작 → SessionStart hook 메시지 (★ "v2.0 chain harness ready") 표시 시 정상 작동.

### 사용법 — chain harness 진입 시나리오

#### 시나리오 A — Analysis stage 만 (legacy 분석 / chain 1 미진입)

자연어 prompt → skill 자동 발동:

| 자연어 prompt | 발동 skill |
|---|---|
| "이 코드베이스 분석 시작" | `analysis-input-collection` |
| "inventory 추출해줘" | `analysis-source-inventory` |
| "아키텍처 분석" | `analysis-architecture` |
| "도메인 모델 추출" | `analysis-domain-model` |
| "비즈니스 규칙 추출" | `analysis-business-rules` |
| "OpenAPI 만들어줘" | `analysis-openapi` (BE) |
| "DB schema + ERD" | `analysis-db-schema-erd` (DB) |
| "antipattern 정리" | `analysis-quality-antipattern` |

★ aspect skill 4종 (a11y / i18n / static-security / legacy) = 코드베이스 시그널 자동 매칭. cross_cutting (phase 무관).

#### 시나리오 B — chain harness e2e (★ v2.0 paradigm)

```
1. chain-driver init <project>      → state.json 초기화
2. "발견 단계 시작"                  → discovery-from-analysis-output / discovery-decompose-use-cases / discovery-identify-business-intent
   → discovery-spec.{json,md} 산출 (★ v11.0.0 rename)
   → gate #1 (discovery-extraction-validator) 통과
3. "behavior spec / acceptance criteria 도출"
   → spec-compose-behavior-spec / spec-derive-acceptance-criteria / spec-integrate-deliverables
   → behavior-spec + acceptance-criteria + 7대 통합
   → gate #2 (chain-coverage-validator / UC→BHV→AC ≥ 0.85) 통과
4. "plan / task 분해 / ADR / NFR / risk"
   → plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr
   → task-plan.{json,md} 산출
   → gate #3 (plan-coverage-validator / NFR allocation hard gate + ADR alternatives ≥3) 통과
5. "test spec 생성 RED 의무"
   → test-generate-test-spec / test-run-test-evidence / test-verify-coverage
   → test-spec + 실 test code (RED — 실패 입증 / impl 부재)
   → gate #4 (spec-test-link-validator / AC→TC ≥ 0.85 + RED) 통과
6. "impl spec 생성 GREEN 의무"
   → implement-generate-impl-spec / implement-verify-test-pass
   → impl-spec + 실 impl code (GREEN / 100% test pass)
   → gate #5 (test-impl-pass-validator / 실 test runner / 100% pass) 통과
7. "traceability matrix"
   → _base-build-traceability-matrix
   → UC→BHV→AC→TC→IMPL+commit_hash matrix 산출
```

★ ★ ★ **Mechanical gate trio** — (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny. LLM "통과한 척" 시뮬레이션 ❌ enforcement.

★ ★ ★ **Chain-revisit detector** — git diff 기반 skill auto-invoke / state.blocked 전환 가능.

#### 시나리오 C — manual fallback (plugin 미사용)

`methodology-spec/workflow/phase-*.md` + `methodology-spec/lifecycle-contract.md` 직접 차례로 적용.

---

## 디렉토리 구조 (dist artifact 기준)

```
dist/ai-native-methodology-v3.6.9/
├── .claude-plugin/
│   ├── plugin.json                   v3.6.9 manifest
│   └── marketplace.json              source: "./" (자기완결)
├── CLAUDE.md                         ★ 사내 적용 정책 23 inline (자동 로드)
├── README.md                         ← 본 파일 (plugin user 진입점)
├── CHANGELOG.md                      v2.6+ 최근 release entry
├── CHANGELOG-HISTORY.md              v2.5.x 이전 archive
├── CHECKSUMS.txt                     SHA256 manifest (무결성 검증)
│
├── agents/                           6 chain agent (analysis/discovery/spec/plan/test/implement) + _base 3
├── skills/                           ★ 13 chain skill + analysis 18 + _base 5
│   ├── _base/                        _base-invoke-go-stop-gate / _base-build-traceability-matrix / _base-log-finding / _base-apply-template / _base-apply-baseline-ratchet
│   ├── analysis/                     phase-0~6 + aspect 4 (a11y/i18n/static-security/legacy)
│   ├── discovery/                    discovery-from-{analysis-output,swagger,figma,nl-md} / discovery-decompose-use-cases / discovery-identify-business-intent
│   ├── spec/                         spec-compose-behavior-spec / spec-derive-acceptance-criteria / spec-integrate-deliverables
│   ├── plan/                         plan-decompose-and-sequence / plan-architect-decisions / plan-risk-and-nfr (★ v10.0.0 본격)
│   ├── test/                         test-generate-test-spec / test-run-test-evidence / test-verify-coverage
│   └── implement/                    implement-generate-impl-spec / implement-verify-test-pass
├── hooks/
│   └── hooks.json                    UserPromptSubmit + PreToolUse (chain-driver hooks-bridge / D21' suppressOutput=true)
├── flows/                            13 file (5 chain stage flow + sdlc-4stage SSOT + analysis flow)
│   ├── sdlc-4stage-flow.{json,mermaid}     ★ ★ ★ chain harness master SSOT
│   ├── analysis.phase-flow.{json,mermaid}  v1.x 자산 (chain 1 진입 전)
│   └── {discovery,spec,plan,test,implement}.phase-flow.{json,mermaid}
│
├── tools/                            ★ 12 workspace tool (npm workspace / 218 unit test)
│   ├── chain-driver/                 ★ harness driver (cli + 6 module / 60+8 chaos test)
│   ├── drift-validator/              .json ↔ .md/.mermaid 동일성 + chain layout + state-flow consistency
│   ├── decision-table-validator/     dmn-check 5종
│   ├── formal-spec-link-validator/   Phase 4.5 cross-link
│   ├── spectral-runner/              OpenAPI lint (★ 진짜 외부 도구)
│   ├── static-runner/                Semgrep (Tier 1) + SARIF import (Tier 2 / PMD·SpotBugs·CodeQL·Daikon) — R19
│   ├── schema-validator/             chain 산출물 6 schema 검증
│   ├── discovery-extraction-validator/ chain 1 / source-grounded ≥ 0.80
│   ├── chain-coverage-validator/     chain 2 / UC→BHV→AC ≥ 0.85
│   ├── spec-test-link-validator/     chain 3 / AC→TC ≥ 0.85
│   ├── test-impl-pass-validator/     chain 5 (implement) / 100% pass + result_hash 정규화
│   └── traceability-matrix-builder/  release matrix
│
├── templates/                        analysis 22 + chain placeholder + adoption alias source
│
├── methodology-spec/                 ★ Single Source of Truth
│   ├── workflow/                     phase-0 ~ phase-6 + 4.5
│   ├── deliverables/                 1-architecture ~ 7-ui-ux + chain v2 (planning/behavior/acceptance/test/impl/matrix)
│   ├── lifecycle-contract.md         SDLC stage 간 data contract
│   ├── skills-axis.md                ★ phase ID ↔ skills 디렉토리 axis 분리 정책
│   ├── glossary-ko.md
│   ├── id-conventions.md
│   ├── finding-system.md
│   └── be-fe-separation.md
│
└── schemas/                          ★ 19+ JSON Schema (BE 5 + FE 8 + chain v2 6 + state + intervention-log)
    ├── chain v2: discovery-spec / behavior-spec / acceptance-criteria / test-spec / impl-spec / traceability-matrix
    ├── state.schema.json             chain-driver state 영속
    ├── intervention-log.schema.json  사용자 결단 로그
    └── (BE/FE 공통 13종 — meta-confidence / architecture / domain / api / db / rules / antipatterns / ui / inventory / formal-spec / finding-system / etc)
```

★ workspace 본체 (`docs/` / `archive/` / `decisions/` / `examples/` / `scripts/`) 는 dist 미포함 (개발 자산 / build script EXCLUDE).

---

## 7원칙 (헌법)

1. **사상 명시**: Schema-First + Contract-First + DDD-Lite + FSD
2. **Bottom-up Always**: Function → File → Module → System
3. **Deterministic First, LLM Second**
4. **File System as Memory** (단계 간 통신 = 파일)
5. **Confidence as First-Class** (모든 산출물에 신뢰도 메타)
6. **Human-in-the-loop** (chain harness gate 4 + revisit loop)
7. **Single Source of Truth = Repo** (문서/플러그인은 레포 파생)
8. **한국어 1차** (영어 약어 최소화, 산업 표준 예외)

---

## 검증 도구 사용 (12 workspace tool / npm workspace)

```bash
# Chain harness driver (★ v2.0 진입)
node tools/chain-driver/src/cli.js init <project>
node tools/chain-driver/src/cli.js next         # next stage 진입 / blocked 면 exit 2
node tools/chain-driver/src/cli.js state        # 현재 stage / blocked 여부

# Phase 4.5 검증 (analysis stage)
node tools/drift-validator/src/cli.js {산출물 경로}/formal-spec/
node tools/decision-table-validator/src/cli.js {산출물 경로}/formal-spec/decision-tables/
node tools/formal-spec-link-validator/src/cli.js {산출물 경로}/formal-spec/

# Chain harness validator (gate #1~#5)
node tools/discovery-extraction-validator/src/cli.js  # gate #1 (discovery)
node tools/chain-coverage-validator/src/cli.js        # gate #2 (spec)
node tools/plan-coverage-validator/src/cli.js         # gate #3 (plan)
node tools/spec-test-link-validator/src/cli.js        # gate #4 (test)
node tools/test-impl-pass-validator/src/cli.js --allow-execute  # gate #5 (실 test runner / implement)
node tools/traceability-matrix-builder/src/cli.js     # release

# 외부 도구 (★★★ no-simulation 의무)
cd tools/spectral-runner && npx spectral lint <openapi.yaml>
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out

# Schema 검증 (모든 chain 산출물)
node tools/schema-validator/src/cli.js
```

CI 자동화 = `.github/workflows/drift-check.yml` (PR / nightly / manual dispatch).

---

## 분석 입력 가변성

```
필수: 소스 코드
선택: ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세 / 설정 파일

입력이 많을수록 신뢰도↑:
- 소스만:                      평균 75%
- 소스 + ERD:                  평균 85%
- 소스 + ORM:                  평균 88%
- 소스 + ORM + ERD + 운영DB:   평균 96%
- 모든 입력:                   평균 98%
```

신뢰도 메타데이터를 모든 산출물에 명시 (`schemas/meta-confidence.schema.json`).

---

## 사상적 기반

| 사상 | 채택 | 출처 |
|---|---|---|
| Schema-First | 주축 | Microsoft TypeSpec, OpenAPI 산업 표준 |
| Contract-First | API 영역 | Hazelcast, Technijian 등 산업 사례 |
| DDD-Lite (B 강도) | 도메인 영역 | Eric Evans DDD, 풀 DDD 의도적 제외 |
| FSD + Atomic Design | FE 영역 | Feature-Sliced Design, Brad Frost Atomic Design |
| chain harness (i-strict) | SDLC paradigm | Aider 패턴 + DEC-2026-05-06-v2.0-i-strict-채택 |

명시적 제외:
- Event Sourcing, CQRS, Saga, Anticorruption Layer
- 비기능 요구사항(NFR) 측정
- 테스트 코드 자동 분석 (단 chain 3 실 test code 산출은 의무)

---

## 라이선스

(사내 표준 — 외부 공개 시 결정)

---

## 기여

- 변경 제안: GitHub Issue
- 변경 적용: PR + ADR 작성 (ADR-CHAIN-001~005 + ADR-001~010 + ADR-FE-001~007)
- 방법론 자체 변경: ADR/DEC 신설 → plan.md 갱신 → §8.1 strict 검증대 통과
- chain harness scaffolding (sub-plan-1~4) → harness-complete (sub-5) → harness-validated (sub-6) 로 호칭 전환 명세 (DEC-2026-05-06-sub-plan-5 + DEC-2026-05-06-sub-plan-6-종결)

→ 변경 이력: [CHANGELOG.md](./CHANGELOG.md) (v2.6+) / [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (v2.5.x 이전).
