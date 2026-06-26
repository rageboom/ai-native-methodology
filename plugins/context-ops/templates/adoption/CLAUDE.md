<!--
provenance:
  source: ai-native-methodology / templates/adoption/CLAUDE.md
  build_script: scripts/build-plugin.js → dist/ai-native-methodology-v<version>/CLAUDE.md (alias)
  사용자_직접_편집: true (정책 inline)
  status: active (현 6-stage chain harness paradigm 정합 / analysis→discovery→spec→plan→test→implement / gate #1~#5)
  drift_resistance: |
    본 파일은 카운트(skill/tool/schema 개수)·버전 번호를 하드코딩하지 않음— paradigm(stage·gate·use-scenario)만 기술.
    최신 버전·자산 인벤토리는 CHANGELOG.md / plugin manager(/plugin) 참조. (release-readiness 가 stale 토큰 재유입을 차단.)
  notes: |
    본 파일은 적용 시 build script 가 dist/ai-native-methodology-v<version>/CLAUDE.md 로 별칭 복사하는 진입점.
    적용 레포 루트에 두면 매 Claude Code 세션 자동 로드 = LLM 운영 컨텍스트. workspace 본체 CLAUDE.md 와 별도.
-->

# AI-Native 개발 방법론 — 적용 가이드 (6-stage chain harness)

> 본 파일을 적용 레포 루트에 두면 매 Claude Code 세션 자동 로드됩니다. 정책이 LLM 컨텍스트에 항상 active.
> 최신 버전·자산 개수는 본 파일에 하드코딩하지 않습니다 — `CHANGELOG.md` 또는 `/plugin` manager 에서 확인.

## 절대 우선순위

**품질 1순위 > 재작업 최소화 2순위 > 속도 후순위**. 위반 시 자산 품질 미달 → 도입 실패.

## 가장 큰 목적 (P0)

산출물 = "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. 이 컨텍스트를 평생 유지·동기화하여 **프로젝트를 AX 로 운영**(LLM 이 정확한 컨텍스트로 develop·run·modify·evolve)하는 것이 목적. 산출물은 모든 stage 의 base 이며 기능 추가 시 양방향 역동기화된다.

## 4 use-scenario (bootstrap 입력만 다르고 모두 같은 정상 상태 "AX 운영"으로 수렴)

| 시나리오         | bootstrap 입력  | 비고                                       |
| ---------------- | --------------- | ------------------------------------------ |
| **S2 (AX 전환)** | legacy 코드     | 주 타깃 — 기존 코드 특성화 + in-place 증강 |
| S1 (재생성)      | legacy 코드     | forward RED→GREEN 재생성                   |
| S3 (특성화)      | legacy 코드     | snapshot 특성화                            |
| greenfield       | PRD·디자인·계약 | analysis 입력어댑터로 처음부터 AX-native   |

## 가치 명세 (6-stage chain harness)

```
INPUT (4 use-scenario):  legacy 코드 (S1/S2/S3) / PRD·디자인·계약 (greenfield)
  ↓ analysis stage (리버스 엔지니어링 + 입력어댑터 패스 / chain 진입 전 / 산출물 추출)
  ↓
OUTPUT chain (6-stage / chain N = gate #N 1:1 INTERNAL CONVENTION):
  [CHAIN 1] discovery : discovery-spec (입력 어댑터 4종)            ── go/stop gate #1
  [CHAIN 2] spec      : behavior-spec + acceptance-criteria + 산출물 통합 ── go/stop gate #2
  [CHAIN 3] plan      : task 분해 / 의존성 / ADR / NFR / risk         ── go/stop gate #3
  [CHAIN 4] test      : test-spec + 실 test 코드 (RED 의무)          ── go/stop gate #4
  [CHAIN 5] implement : impl-spec + 실 impl 코드 (GREEN / 100% pass)  ── go/stop gate #5
  ↓
USE: AI 자동 생성 + 사용자 검토 (gate #1~#5) / prod 시스템 + traceability-matrix
```

AI 자동화 ≥ 85% / 사람 검토 (gate #1~#5) ≤ 15% / **70~80% 한계 명시 잔존** (100% 자동화 ❌).

## 의무 정책 (위반 = 빌드 실패)

- **chain harness gate 5종** (discovery #1 / spec #2 / plan #3 / test #4 / implement #5) 모두 통과 의무. chain N = gate #N INTERNAL CONVENTION.
- **analysis stage 산출물** (architecture / domain / API / DB-schema / rules / antipatterns / UI-UX) — chain 1(discovery) 진입 전 산출. BE/FE 산출물은 stage 별 axis 분리.
- 모든 산출물에 **신뢰도 메타** + 출처 명시. **이중 렌더링** (.json + .md/.mermaid) + drift 자동 검증.
- **no-simulation (R19 Tier)**: 도구는 실행 확인된 것만 "실행" 표기.
  - Tier 1 (in-plugin plugin 직접 실행 / 축=실행 locus): Semgrep / ESLint / Spectral / axe-core·Playwright / **PMD (JDK+PMD 설치 시)** / 테스트 stack runner (Gradle·JUnit / vitest 등) — 5종 물증 의무 / 도구 부재 = exit 3 정직 carry.
  - Tier 2 (사용자 환경 SARIF import): allowlist = **PMD** (orthogonal — PMD 는 Tier 1 자동 + Tier 2 import 양쪽) / 실행 이력 0 도구(SpotBugs·CodeQL·Daikon·SonarQube) 미등재 = 사용자 환경 명시 확장.
  - Tier 3 (simulated persona): 영구 reject + 신뢰도 -5%p.
- chain 4 (test) = **RED 의무** (실 test code / 실패 입증 / impl 부재) / chain 5 (implement) = **GREEN 의무** (100% test pass).
- contract 강제 양 axis: BE = OpenAPI(swagger) / FE = state-map + visual-manifest + DTCG token.
- legacy 도입 시: **Baseline + Ratchet** 점진 quality gate (zero-defect 즉시 강제 금지 / 신규 결함만 차단).
- Phase 6 antipatterns 작성 시: `migration_advice` 필드 + `migration-cautions.json` 신규 시스템 회피 가이드 산출.

## chain harness 5 요소 (mechanical enforcement)

1. **Driver / Orchestrator** — `tools/chain-driver/` (init / next / state / suggest-skill)
2. **State 영속** — `schemas/state.schema.json` + atomic CAS write + Windows fallback
3. **Mechanical gate trio** — (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny
4. **Skill auto-invoke** — `hooks/hooks.json` (UserPromptSubmit + PreToolUse) / suppressOutput=true / LLM 컨텍스트 격리
5. **Chain-revisit detector** — git diff 기반 변경 감지 → 사용자 결단 → 임의 stage jump (revisit loop)

## 사상

**Schema-First + Contract-First + DDD-Lite B (전술 패턴) + FSD (Feature-Sliced Design)**.

## 6-stage chain harness (master SSOT)

| Chain | Stage        | Gate    | 산출물                                                                                                                | Skill prefix |
| ----- | ------------ | ------- | --------------------------------------------------------------------------------------------------------------------- | ------------ |
| (pre) | analysis     | —       | 산출물 (architecture/domain/api/db-schema/rules/antipatterns/ui-ux) + finding + antipatterns + migration-cautions | `analysis-`  |
| 1     | discovery    | gate #1 | `discovery-spec.json` (입력 어댑터 4종: analysis-output/swagger/figma/nl-md)                                          | `discovery-` |
| 2     | spec         | gate #2 | `behavior-spec` + `acceptance-criteria` (Gherkin BDD) + 산출물 통합                                                      | `spec-`      |
| 3     | plan         | gate #3 | `task-plan` (task 분해 / 의존성 / ADR / NFR / risk / rollback)                                                        | `plan-`      |
| 4     | test         | gate #4 | `test-spec` + 실 test code (RED 의무)                                                                                 | `test-`      |
| 5     | implement    | gate #5 | `impl-spec` + 실 impl code (GREEN / 100% pass)                                                                        | `implement-` |
| cross | traceability | —       | `traceability-matrix.{json,md,mermaid}`                                                                               | `_base-`     |

DAG: `flows/sdlc-4stage-flow.{json,mermaid}` (master SSOT / revisit edges 포함) + stage flow (`flows/{analysis,discovery,spec,plan,test,implement}.phase-flow.{json,mermaid}`).

## 핵심 디렉토리

- `methodology-spec/` — phase / 산출물 / workflow 본체 + lifecycle-contract + plugin-charter (요구사항 SSOT)
- `schemas/` — 산출물 JSON Schema (BE/FE/chain + state + work-unit-manifest + dep-graph / 모두 strict)
- `templates/` — 산출물 템플릿 (analysis + 6 chain stage)
- `tools/` — Node CLI 검증 도구 (단일 npm workspace)
- `skills/` — analysis + 6 chain stage skill (install 후 자연어 prompt 자동 발동)
- `agents/` — stage 별 sub-agent (discovery/spec/plan/test/implement/analysis) + 3 base + spike
- `hooks/` — UserPromptSubmit + PreToolUse 매칭 (chain-driver hooks-bridge)
- `flows/` — stage flow + master DAG SSOT

## NestJS 전용 정책 (적용 프로젝트가 NestJS 일 때만)

- **JwtAuthGuard 글로벌** + Ownership Check Service (OWASP API5 + A04 + A07 회피)
- **ValidationPipe 글로벌** + class-validator 모든 input DTO + Domain Aggregate 생성자 throw 3중 안전망 (mass assignment / OWASP API1)
- **`@HttpCode` 명시** + `@ApiResponse` status 정합 (RFC 9110 — spec/runtime drift 회피)
- **TypeORM**: UQ + FK + Atomic Counter UPDATE + EAGER:false (DB 결함 + N+1 회피)

## Spring/Java 전용 정책 (적용 프로젝트가 Spring 일 때만)

- **Spring-AUTH**: SecurityConfig 글로벌 + `@PreAuthorize` 메서드 단 + Ownership Check Service
- **Spring-VALIDATION**: `@Validated` + `@Valid` + Domain Aggregate 생성자 throw 3중 안전망 + UQ over-constraint 회피 (자유 텍스트에 UNIQUE 부여 금지)
- **Spring-RFC9110**: `@ResponseStatus` 명시 + `@Operation`/`@ApiResponse` status 정합 + idempotency 보장
- **Spring-JPA**: UQ + FK + ID 타입 정합 (`JpaRepository<E, ID>` ↔ `@Id` 타입 일치) + LAZY default + `EAGER + Pageable` 금지 (HHH000104 회피)
- **Spring-Hexagonal** (채택 시만): port = interface in core / adapter = impl in persistence. 도메인 검증·암호화는 Service, Adapter 는 단순 save

> **공통 보안 (스택 무관)**: RSA/JWT private key 를 git 에 직접 commit 금지. 환경변수 + Vault/KMS 분리.

## Work Principles 4원칙 (모든 phase 공통)

1. **깊은 숙지 → plan.md** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`
2. **에이전트 팀 토론 → research.md** — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior). Phase 4~6 가벼운 sub-agent
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 반드시 질문
4. **실패 시 Revert → 교훈 → 1원칙 재시작** — Lessons Learned 섹션 plan.md 기록

## 본 적용 레포 사용법

> plugin 으로 install 한 경우 도구 직접 호출 경로 = `node ${CLAUDE_PLUGIN_ROOT}/tools/...` (repo-relative `node tools/...` 는 install 환경에서 동작 ❌). 대부분은 자연어 prompt 로 hook 자동 발동되므로 직접 호출 불필요.

### 시나리오 A — analysis stage 만 (legacy 분석 / chain 미진입)

1. 자연어 prompt "이 코드베이스 분석 시작해줘" → analysis skill 자동 발동
2. Phase 진행 시 산출물 add/edit 마다 검증 도구 자동 실행 (drift / schema / spectral / static)
3. analysis 종결 = 산출물 + finding + antipatterns + migration-cautions 산출

### 시나리오 B — chain harness e2e (analysis → discovery → spec → plan → test → implement)

1. **chain-driver init**: `node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js init <project> --scenario <S1|S2|S3|greenfield>` (또는 첫 자연어 prompt 시 hooks-bridge 자동)
2. **chain 1 (discovery)** → `discovery-spec` 산출 → **gate #1** (discovery-extraction-validator / source-grounded coverage)
3. **chain 2 (spec)** → `behavior-spec` + `acceptance-criteria` → **gate #2** (chain-coverage-validator / UC→BHV→AC link)
4. **chain 3 (plan)** → `task-plan` (task/의존성/ADR/NFR/risk) → **gate #3** (plan-coverage-validator)
5. **chain 4 (test)** → `test-spec` + 실 test (RED) → **gate #4** (spec-test-link + RED 입증)
6. **chain 5 (implement)** → `impl-spec` + 실 impl (GREEN) → **gate #5** (test-impl-pass-validator / 100% pass)
7. **release**: traceability-matrix 산출 (UC→BHV→AC→TC→IMPL + commit_hash)

### 자연어 prompt → stage 자동 발동 예시

| 자연어 prompt                                | 발동 stage       |
| -------------------------------------------- | ---------------- |
| "이 코드베이스 분석 시작"                    | analysis         |
| "discovery 시작 / use case 분해"             | discovery        |
| "behavior spec / acceptance criteria 만들어" | spec             |
| "task plan 분해"                             | plan             |
| "test spec 생성 (RED)"                       | test             |
| "impl spec 생성 (GREEN)"                     | implement        |
| "traceability matrix"                        | cross (`_base-`) |

## 적용 시 주의

- legacy 결함 폭증 회피: Baseline + Ratchet 즉시 적용 (zero-defect 강제 ❌)
- AI 시뮬레이션 우회 회피: 외부 도구 실 실행 의무 (R19 Tier), 환경 부재 시 사용자/CI 위임 명시
- 산출물 신뢰도: AI 단독 ≤ 80% / 진짜 도구 cross-validation = 85~98%
- chain harness state.blocked: gate validator finding 발견 시 자동 차단 / fix 후 재시도 cycle (LLM "통과한 척" 시뮬 차단 / no-simulation enforcement)

## 참고

- `CHANGELOG.md` — 최신 버전 + 변경 이력 SSOT (버전·개수는 여기서 확인)
- `README.md` — plugin install + 사용법 + 디렉토리 구조
- `flows/sdlc-4stage-flow.{json,mermaid}` — chain harness master SSOT (revisit edges 포함)
- `methodology-spec/lifecycle-contract.md` — stage 간 data contract
- `methodology-spec/plugin-charter.md` — 사용자 요구사항 SSOT
