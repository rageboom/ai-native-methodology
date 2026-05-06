<!--
provenance:
  source: ai-native-methodology / templates/adoption/CLAUDE.md
  build_script: scripts/build-plugin.js → dist/internal-v<version>/CLAUDE.md (alias)
  사용자_직접_편집: true (정책 inline)
  status: active (★ v2.0.0-rc1 chain harness paradigm 정합)
  notes: |
    본 파일은 사내 적용 시 build script 가 dist/internal-v<version>/CLAUDE.md 로 별칭 복사하는 진입점.
    workspace 본체 CLAUDE.md (외부 컨테이너) 와 별도 — plugin install 후 LLM 자동 컨텍스트 전용 customization.
-->

# AI-Native 개발 방법론 v2.0.0-rc1 — 적용 가이드

> 본 파일은 사내 적용 레포 루트에 두면 매 Claude Code 세션 자동 로드됩니다. 정책이 LLM 컨텍스트에 항상 active.

## 절대 우선순위

**품질 1순위 > 재작업 최소화 2순위 > 속도 후순위**. 위반 시 사내 표준화 자산 품질 미달 → 도입 실패.

## 본 방법론 가치 명세 (★ v2.0 SDLC 4단계 chain harness)

```
INPUT (1차 = legacy single-case):  legacy 코드베이스
  ↓ analysis stage (chain 1단계 = 한 방향 추출 / v1.x 자산)
  ↓
OUTPUT chain (★ v2.0 i-strict):
  [CHAIN 1] planning-spec     ── go/stop gate #1
  [CHAIN 2] behavior-spec + acceptance-criteria + 7대 산출물 통합  ── go/stop gate #2
  [CHAIN 3] test-spec + 실 test 코드 (RED 의무)  ── go/stop gate #3
  [CHAIN 4] impl-spec + 실 impl 코드 (GREEN / 100% test pass)  ── go/stop gate #4
  ↓
USE: AI 자동 생성 + 사용자 검토 / prod 시스템 + traceability-matrix
```

★ AI 자동화 ≥ 85% / 사람 검토 (gate별) ≤ 15% / **70~80% 한계 명시 잔존**.

## ★★★ 의무 정책 (위반 = 빌드 실패)

- **chain harness gate 4종** (planning / spec / test / impl) 모두 통과 의무
- **analysis stage 7대 산출물** (architecture / domain / API / DB / rules / antipatterns / UI-UX) — chain 1 진입 전 산출
- 모든 산출물에 **신뢰도 메타** (0.0~0.98) 포함 + 출처 명시
- **이중 렌더링** (.json + .md/.mermaid) + drift 자동 검증 (`tools/drift-validator/`)
- Phase 4.5 검증 + chain validator: **진짜 외부 도구 실 실행 의무** (no-simulation). AI sub-agent 시뮬레이션 금지, 위반 시 신뢰도 -5%p 패널티
- chain 3 = **RED 의무** (실 test code / 실패 입증 / impl 부재) / chain 4 = **GREEN 의무** (100% test pass)
- 다이어그램 신뢰도 7단계 모델 (AI persona -5%p / 진짜 외부 도구 +5~10%p)
- legacy 도입 시: **Baseline + Ratchet** 점진 quality gate (zero-defect 즉시 강제 금지, 신규 결함만 차단)
- Phase 6 antipatterns 작성 시: `migration_advice` 필드 + `migration-cautions.md` 신규 시스템 회피 가이드 산출

## chain harness 5 요소 (★ mechanical enforcement / sub-plan-5)

1. **Driver / Orchestrator** — `tools/chain-driver/` (cli + 6 module)
2. **State 영속** — `schemas/state.schema.json` + atomic CAS write + Windows fallback
3. **Mechanical gate trio** — (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny
4. **Skill auto-invoke (D21')** — `hooks/hooks.json` (UserPromptSubmit + PreToolUse) / suppressOutput=true / LLM 컨텍스트 격리
5. **Chain-revisit detector** — git diff --numstat + LOC threshold + revisit_ignore_globs

## 사상

**Schema-First + Contract-First + DDD-Lite B (전술 패턴) + FSD (Feature-Sliced Design)**.

## 운영

- **한국어 1차** + 3단 기준 (산업표준 → DDD 어휘 → 자체 용어)
- **순환의존성**: hybrid 분기 (탐지 + Bounded Context 분기 + decision_required)

## SDLC 4-stage chain harness (★ master SSOT)

| Chain | Stage | Gate | 산출물 | Skill 디렉토리 |
|---|---|---|---|---|
| (pre) | analysis | — | 7대 산출물 (architecture/domain/api/db/rules/antipatterns/ui-ux) | `skills/analysis/` 18 |
| 1 | planning | gate #1 | `planning-spec.{json,md}` | `skills/planning/` 3 |
| 2 | spec | gate #2 | `behavior-spec` + `acceptance-criteria` + 7대 통합 | `skills/spec/` 3 |
| 3 | test | gate #3 | `test-spec` + 실 test code (RED) | `skills/test/` 3 |
| 4 | implement | gate #4 | `impl-spec` + 실 impl code (GREEN / 100% pass) | `skills/implement/` 2 |
| cross | traceability | — | `traceability-matrix.{json,md,mermaid}` | `skills/_base/build-traceability-matrix` |

DAG: `flows/sdlc-4stage-flow.{json,mermaid}` (★ master SSOT) + chain stage flow 5종 (`flows/{analysis,planning,spec,test,implement}.phase-flow.{json,mermaid}`).

## 핵심 디렉토리

- `methodology-spec/` — phase / 산출물 / workflow 본체 + lifecycle-contract + skills-axis
- `schemas/` — JSON Schema (BE 5 + FE 8 + chain v2 6 + state + intervention-log = 19+종)
- `templates/` — 산출물 템플릿
- `tools/` — 검증 도구 12종 (npm workspace)
- `skills/` — chain skill 13 + analysis skill 18 (★ install 후 자연어 prompt 자동 발동)
- `agents/` — 5 chain agent (planning / spec / test / implement / analysis)
- `hooks/` — UserPromptSubmit + PreToolUse 매칭 (chain-driver hooks-bridge)
- `flows/` — 5 chain stage flow + sdlc-4stage SSOT

## 검증 도구 12종 (★ chain harness validated / sub-plan-3a/3b/5)

| 도구 | 용도 | trigger |
|---|---|---|
| `chain-driver` | ★ harness state machine (init / next / state / suggest-skill) | chain stage 진입 |
| `drift-validator` | .json ↔ .md/.mermaid 동일성 + chain layout 검증 | 산출물 add/edit |
| `decision-table-validator` | DMN enum 정합 | Phase 4.5 |
| `formal-spec-link-validator` | Phase 4.5 cross-link | Phase 4.5 |
| `spectral-runner` | OpenAPI lint (실 실행) | API 산출물 add/edit |
| `static-runner` | 외부 정적 분석 hook (Semgrep / PMD / SpotBugs / Daikon / CodeQL) | Phase 4.5+ |
| `schema-validator` | chain 산출물 schema 검증 | 모든 chain stage |
| `planning-extraction-validator` | chain 1 / planning-spec source-grounded coverage ≥ 0.80 | gate #1 |
| `chain-coverage-validator` | chain 정합 (UC→BHV→AC link coverage ≥ 0.85) | gate #2 |
| `spec-test-link-validator` | chain 3 (AC→TC link coverage ≥ 0.85) | gate #3 |
| `test-impl-pass-validator` | chain 4 (실 test runner / 100% pass / result_hash 정규화) | gate #4 |
| `traceability-matrix-builder` | UC→BHV→AC→TC→IMPL+commit_hash matrix | release |

## NestJS 전용 정책 (적용 프로젝트가 NestJS 일 때만)

- **JwtAuthGuard 글로벌** + Ownership Check Service (Auth scope 결여 — OWASP API5 + A04 + A07 회피)
- **ValidationPipe 글로벌** + class-validator 모든 input DTO + Domain Aggregate 생성자 throw 3중 안전망 (mass assignment — OWASP API1 회피)
- **`@HttpCode` 명시** + `@ApiResponse` status 정합 (RFC 9110 — spec/runtime drift 회피)
- **TypeORM**: UQ + FK + Atomic Counter UPDATE + EAGER:false (DB 결함 + N+1 회피)

## Spring/Java 전용 정책 (적용 프로젝트가 Spring 일 때만)

> 출처: `examples/poc-02-realworld-springboot3/output/antipatterns/`. 정식 ADR-SPRING-001~005 격상 후보.

- **Spring-AUTH**: SecurityConfig 글로벌 + `@PreAuthorize` 메서드 단 + Ownership Check Service
- **Spring-VALIDATION**: `@Validated` + `@Valid` + Domain Aggregate 생성자 throw 3중 안전망 + UQ over-constraint 회피 (예: `article.title` 같은 자유 텍스트에 UNIQUE 부여 금지)
- **Spring-RFC9110**: `@ResponseStatus` 명시 + `@Operation`/`@ApiResponse` status 정합 + idempotency 보장 (favorite/unfavorite 류 silent return, login 은 default 200)
- **Spring-JPA**: UQ + FK + ID 타입 정합 (`JpaRepository<E, ID>` ↔ `@Id` 타입 일치) + LAZY default + `EAGER + Pageable` 금지 (HHH000104 회피)
- **Spring-Hexagonal** (Hexagonal 채택 시만): port = interface in core / adapter = impl in persistence. 도메인 검증·암호화는 Service, Adapter 는 단순 save (Vernon IDDD Ch.4)

> **공통 보안 (스택 무관)**: RSA/JWT private key 를 git resources 에 직접 commit 금지. 환경변수 + Vault/KMS (AWS Parameter Store / HashiCorp Vault / GCP Secret Manager) 분리.

## Work Principles 4원칙 (모든 phase 공통)

1. **깊은 숙지 → plan.md** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`
2. **에이전트 팀 토론 → research.md** — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior). Phase 4~6 가벼운 sub-agent ~10배 단축
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 반드시 질문
4. **실패 시 Revert → 교훈 → 1원칙 재시작** — Lessons Learned 섹션 plan.md 기록

## 본 적용 레포 사용법 (★ v2.0 chain harness)

### 시나리오 A — analysis stage 만 (legacy 분석 / chain 1 미진입)

1. **Phase 0 진입**: 자연어 prompt "이 코드베이스 분석 시작해줘" → `phase-0-input` skill 자동 발동
2. **Phase 1~6 + 4.5 진입**: 자연어 prompt 또는 `methodology-spec/workflow/phase-N-*.md` 직접 참조
3. **모든 산출물 add/edit** 시 검증 도구 실행 (drift-validator / decision-table-validator / spectral-runner / static-runner)
4. **Phase 6 종결** = analysis stage 완료 (7대 산출물 + finding + antipatterns + migration-cautions 산출)

### 시나리오 B — chain harness e2e (legacy → planning → spec → test → impl)

1. **chain-driver init**: `node tools/chain-driver/src/cli.js init <project>` (또는 첫 자연어 prompt 시 hooks-bridge 자동 호출)
2. **chain 1 진입**: `extract-from-legacy` + `decompose-use-cases` + `identify-business-intent` skill → planning-spec 산출
3. **gate #1 (planning-extraction-validator)** — finding 발견 시 state.blocked=true / 사용자 fix 후 재시도
4. **chain 2 진입**: `compose-behavior-spec` + `derive-acceptance-criteria` + `integrate-7대-deliverables` skill
5. **gate #2 (chain-coverage-validator)** — UC→BHV→AC link coverage ≥ 0.85 의무
6. **chain 3 진입**: `generate-test-spec` + `run-test-evidence` + `verify-coverage` skill (★ RED 의무)
7. **gate #3 (spec-test-link-validator)** — AC→TC link coverage ≥ 0.85 + RED 입증
8. **chain 4 진입**: `generate-impl-spec` + `verify-test-pass` skill (★ 100% GREEN 의무)
9. **gate #4 (test-impl-pass-validator)** — 실 test runner 호출 + 100% pass + result_hash 정규화
10. **release**: traceability-matrix 산출 (UC→BHV→AC→TC→IMPL+commit_hash)

### 자연어 prompt → skill 자동 발동 예시

| 자연어 prompt | 발동 skill |
|---|---|
| "이 코드베이스 분석 시작" | `phase-0-input` |
| "기획 단계 시작" | `extract-from-legacy` |
| "use case 분해" | `decompose-use-cases` |
| "behavior spec 만들어" | `compose-behavior-spec` |
| "acceptance criteria 도출" | `derive-acceptance-criteria` |
| "test spec 생성 RED" | `generate-test-spec` |
| "impl spec 생성 GREEN" | `generate-impl-spec` |
| "traceability matrix" | `_base/build-traceability-matrix` |

## 적용 시 주의

- legacy 결함 폭증 회피: ADR-010 Baseline + Ratchet 즉시 적용 (zero-defect 강제 ❌)
- AI 시뮬레이션 우회 회피: 외부 도구 실 실행 의무, 환경 부재 시 사용자/CI 위임 명시
- 산출물 신뢰도: AI 단독 ≤ 80% / 진짜 도구 cross-validation = 85~98%
- chain harness state.blocked: gate validator finding 발견 시 자동 차단 / fix 후 재시도 cycle (LLM "통과한 척" 시뮬 차단 / no-simulation 정책 enforcement)

## 참고

- `README.md` — plugin install + 사용법 + 디렉토리 구조 (사내 운영 진입점)
- `CHANGELOG.md` — v1.4+ 최근 release entry / 과거 v1.1~v1.3 = `CHANGELOG-HISTORY.md`
- `flows/sdlc-4stage-flow.{json,mermaid}` — ★ chain harness master SSOT
- `methodology-spec/lifecycle-contract.md` — SDLC stage 간 data contract
