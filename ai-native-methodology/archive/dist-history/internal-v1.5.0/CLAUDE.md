<!--
provenance:
  source: ai-native-methodology-adoption (deprecated 2026-05-02)
  original_path: dist/internal-v1.3/CLAUDE.md
  absorbed_at: 2026-05-02
  absorbed_into: ai-native-methodology/templates/adoption/CLAUDE.md
  사용자_직접_편집: true
  정책_23_인라인: true (범용 13 + NestJS 4 + Spring 5 PoC #02 추출)
  status: archived (사내 적용 template)
  notes: |
    본 파일은 사내 적용 시 build script 가 dist/internal-v<version>/CLAUDE.md 로 복사하는 진입점.
    workspace 본체 CLAUDE.md (외부 컨테이너) 와 별도 — 사내 LLM 컨텍스트 전용 customization.
-->

# 사내 AI-Native 개발 방법론 v1.3.0 — 적용 가이드

> 본 파일은 사내 적용 레포 루트에 두면 매 Claude Code 세션 자동 로드됩니다. 정책이 LLM 컨텍스트에 항상 active.

## 절대 우선순위

**품질 1순위 > 재작업 최소화 2순위 > 속도 후순위**. 위반 시 사내 표준화 자산 품질 미달 → 도입 실패.

## 본 방법론 가치 명세

```
INPUT:  legacy 코드베이스
OUTPUT: 7대 산출물 + finding + antipatterns + migration-cautions
USE:    사람이 신규 시스템 구축 시 입력 자료 / 회피 가이드
```

**"코드 → 형식 명세 + 위험 기록" 한 방향 추출기**. round-trip 검증 (산출물 → 신규 시스템 자동 생성) 영구 scope 제외.

## 의무 정책 (위반 = 빌드 실패)

- **7대 산출물** (architecture / domain / API / DB / rules / antipatterns / UI-UX) 필수 산출
- 모든 산출물에 **신뢰도 메타** (0.0~0.98) 포함 + 출처 명시
- **이중 렌더링** (.json + .md/.mermaid) + drift 자동 검증 (`tools/drift-validator/`)
- Phase 4.5 검증: **진짜 외부 도구 실 실행 의무** (no-simulation). AI sub-agent 시뮬레이션 금지, 위반 시 신뢰도 -5%p 패널티
- 다이어그램 신뢰도 7단계 모델 (AI persona -5%p / 진짜 외부 도구 +5~10%p)
- legacy 도입 시: **Baseline + Ratchet** 점진 quality gate (zero-defect 즉시 강제 금지, 신규 결함만 차단)
- Phase 6 antipatterns 작성 시: `migration_advice` 필드 + `migration-cautions.md` 신규 시스템 회피 가이드 산출

## 사상

**Schema-First + Contract-First + DDD-Lite B (전술 패턴) + FSD (Feature-Sliced Design)**.

## 운영

- **한국어 1차** + 3단 기준 (산업표준 → DDD 어휘 → 자체 용어)
- **순환의존성**: hybrid 분기 (탐지 + Bounded Context 분기 + decision_required)

## Phase 흐름 (v1.2.2)

| Phase | 단계                                                                | 명세                                                  | 주요 산출                                                                     |
| ----- | ------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| 0     | 입력 정리                                                           | `methodology-spec/workflow/phase-0-input.md`          | `_manifest.yml`                                                               |
| 1     | init (인벤토리)                                                     | `methodology-spec/workflow/phase-1-init.md`           | `inventory.json` / `tree.md` / `stack-detection.md` / `stats.json`            |
| 2     | db                                                                  | `methodology-spec/workflow/phase-2-db.md`             | `schema.json` / `schema.sql` / `erd.mermaid`                                  |
| 3     | arch                                                                | `methodology-spec/workflow/phase-3-arch.md`           | `architecture.*` / `dependency-graph.*` / `circular-dependencies.md`          |
| 4     | 비즈니스 로직 (4영역 병렬: rules / domain / ap-partial / ui-domain) | `methodology-spec/workflow/phase-4-business-logic.md` | `domain.*` / `rules.*` / `antipatterns-partial.json`                          |
| 4.5   | formal-spec (state-machine + sequence + decision-table)             | `methodology-spec/workflow/phase-4-5-formal-spec.md`  | `state-machines/` / `sequence-diagrams/` / `decision-tables/` / `invariants/` |
| 5-1   | api                                                                 | `methodology-spec/workflow/phase-5-1-api.md`          | `openapi.yaml` / `api.md`                                                     |
| 5-2   | ui                                                                  | `methodology-spec/workflow/phase-5-2-ui.md`           | `ui-spec.*`                                                                   |
| 6     | quality (안티패턴 통합)                                             | `methodology-spec/workflow/phase-6-quality.md`        | `antipatterns.json` / `avoid-list.md` / `migration-cautions.md`               |

DAG: `methodology-spec/workflow/phase-flow.json` ↔ `phase-flow.mermaid` (이중 렌더링).
산출물 명세: `methodology-spec/deliverables/{1~7,4-5}-*.md`

## 핵심 디렉토리

- `methodology-spec/` — phase / 산출물 / workflow 본체
- `schemas/` — JSON Schema (산출물 검증 본체)
- `templates/` — 산출물 템플릿
- `tools/` — 검증 도구 5종 (CI 통합)
- `examples/` — PoC 1~3 (Spring x2 + NestJS) 참고용. **자동 로드 X**, 필요 시 명시적 Read.

## 검증 도구 5종 (CI 통합 권장)

| 도구                         | 용도                                                                         | trigger             |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------- |
| `drift-validator`            | .json ↔ .md/.mermaid 동일성                                                  | 산출물 add/edit     |
| `decision-table-validator`   | DMN enum 정합                                                                | Phase 4.5           |
| `formal-spec-link-validator` | Phase 4.5 cross-link                                                         | Phase 4.5           |
| `spectral-runner`            | OpenAPI lint                                                                 | API 산출물 add/edit |
| `static-runner`              | 외부 정적 분석 hook (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube) | Phase 4.5+          |

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

## 본 적용 레포 사용법

1. dist 를 사내 적용 레포 루트에 풀기 (본 `CLAUDE.md` 가 루트에 위치)
2. **Phase 0 진입**: `methodology-spec/workflow/phase-0-input.md` 따라 입력 정리
3. **Phase 1~6 + 4.5 진입 시** 해당 phase 명세 + 산출물 템플릿 + JSON schema 참조 (위 [Phase 흐름](#phase-흐름-v122) 표)
4. **모든 산출물 add/edit** 시 검증 도구 실행 (CI hook 권장)
5. 적용 중 발견된 신규 finding → `findings/poc-findings.md` 누적, 격상 후보면 본체 ADR/methodology-spec 보강 PR

## 적용 시 주의

- legacy 결함 폭증 회피: ADR-010 Baseline + Ratchet 즉시 적용 (zero-defect 강제 X)
- AI 시뮬레이션 우회 회피: 외부 도구 실 실행 의무, 환경 부재 시 사용자/CI 위임 명시
- 산출물 신뢰도: AI 단독 ≤ 80% / 진짜 도구 cross-validation = 85~98%
