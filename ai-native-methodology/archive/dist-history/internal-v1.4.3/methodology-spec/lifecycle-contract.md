# Lifecycle Contract — SDLC 단계 간 산출물 인터페이스

본 문서는 본 방법론의 lifecycle stage 간 **data contract** 를 정의. 현재 채워진 부분은 분석 stage 와 그 입출력 인터페이스만. 다른 stage 는 v2.0+ scope (placeholder).

## 본 방법론 가치 명세 (CLAUDE.md ★★★)

```
INPUT:  legacy 코드베이스
OUTPUT: 7대 산출물 + finding + antipatterns + migration-cautions
USE:    사람이 신규 시스템 구축 시 입력 자료 / 회피 가이드
```

**한 방향 추출기**. round-trip 검증 영구 scope 제외. 따라서 lifecycle stage 의 다른 부분 (planning / design / test / implement) 은 본 방법론의 산출물을 **입력 자료** 로 활용하는 보조 도구. 산출물 → 코드 자동 생성 같은 round-trip 은 영구 scope 외부.

## SDLC stage 흐름

```
기획 (planning)  →  분석 (analysis ★ 현재) →  설계 (design)  →  테스트 (test)  →  구현 (implement)
   ☐ v2.0           ★ v1.4.x                    ☐ v2.0           ☐ v2.0          ☐ v2.0
```

## 5 영역 axis (★ 사용자 시나리오 2026-05-02)

매 stage 가 5 영역 (`기획 / 디자인 / FE / BE / DB`) 을 다른 강도로 다룸. 강 = stage 의 핵심 / 약 = 부수 / ❌ = 적용 안 됨.

| Stage | 기획 | 디자인 | FE | BE | DB | 공통 |
|---|---|---|---|---|---|---|
| **planning** ☐ v2.0 | 강 | 강 | 약 | 약 | 약 | 약 |
| **analysis** ★ v1.4.x | ❌ | 약 (deliverable 7~9) | 강 | 강 | 강 | 강 |
| **design** ☐ v2.0 | 약 | 강 | 강 | 약 | 약 | 약 |
| **test** ☐ v2.0 | ❌ | 약 (visual-regression) | 강 | 강 | 강 | 강 |
| **implement** ☐ v2.0 (★ 가치 경계 외부 / §가치 경계 충돌 deferral 참조) | ❌ | 약 | 강 | 강 | 강 | 강 |

각 stage 의 5 영역 매트릭스 상세 = `agents/{stage}/README.md` + `skills/{stage}/README.md` cross-link.

## 기술 스택 분기 axis (★ 정책 선언)

기술 스택별 차이 (Spring / NestJS / React / Hexagonal / Express / FastAPI / Rails / Prisma / TypeORM / JPA / Zustand / Redux / Zod / Yup / etc.) = ★ SKILL.md 본문 분기로 표현 (★ analysis stage `phase-1-inventory` 패턴 차용 — `Java/Spring / Node/NestJS / Python` 본문 절차 분기). 디렉토리 분리 ❌ / frontmatter enum ❌ / 본문 분기 dominant.

본 추상화 단계 (v1.4.x) = ★ 정책 선언만. v2.0 진입 시 SKILL.md 신설 시점에 적용.

## 단계 간 인터페이스 (data contract)

### 기획 → 분석 (☐ v2.0)

input (분석 stage 가 받음):
- PRD.md (product requirement document)
- story.json / story.md (epic / story decomposition)
- domain-priority.json (도메인 영역별 분석 우선순위)

★ 5 영역 강도 (planning stage):

| 기획 | 디자인 | FE | BE | DB | 공통 |
|---|---|---|---|---|---|
| 강 | 강 | 약 | 약 | 약 | 약 |

★ 기획 stage = ★ legacy 코드 부재 영역 (PRD / wireframe = 구두 자료 또는 별도 시스템). 본 방법론은 ★ 사용자 별도 입력으로 받아 활용만.

스키마: v2.0 시점에 `schemas/planning-output.schema.json` 신설.

### 분석 → 설계 (★ 현재 채움 = 7대 산출물 + 8 FE 산출물)

본 v1.4.x 가 채우는 핵심 인터페이스. 분석 stage 출력 = 다음 단계의 입력.

**산출물 1~15** (`methodology-spec/deliverables/<NN>-*.md`):

| # | 산출물 | Schema | 트랙 (6 enum: `공통 / BE / FE / DB / 기획 / 디자인`) |
|---|---|---|---|
| 1 | inventory | `inventory.schema.json` | 공통 |
| 2 | architecture (+ .mermaid) | `architecture.schema.json` | 공통 |
| 3 | domain | `domain.schema.json` | 공통 |
| 4 | rules | `rules.schema.json` | BE+FE |
| 5-a | openapi | `openapi-extension.schema.json` | BE |
| 5-b | schema + erd (.mermaid) | `db-schema.schema.json` | DB |
| 6 | finding-list | (`finding-system.md` 형식) | 공통 |
| 7 | ui-ux | (`deliverable 7-ui-ux.md` 형식) | FE+디자인 |
| 7' | antipatterns + migration-cautions | `antipatterns.schema.json` | 공통 |
| 8 | state-map | `state-map.schema.json` | FE+디자인 |
| 9 | visual-manifest | `visual-manifest.schema.json` | FE+디자인 |
| 10 | a11y | `a11y.schema.json` | FE+디자인 |
| 11 | i18n | `i18n.schema.json` | FE |
| 12 | static-security | `static-security.schema.json` | BE+FE |
| 13 | legacy | `legacy.schema.json` | 공통 |
| 14 | form-validation-spec | `form-validation-spec.schema.json` | FE |
| 15 | type-spec | `type-spec.schema.json` | FE (TS) |

★ "기획" 트랙 산출물 = 본 stage 부재 (v2.0 carry §기획→분석 input 참조).

**파일 위치 컨벤션** (사용자 프로젝트):

```
<user-project>/
├── .aimd/
│   ├── phase-0-input.json           # phase-0-input skill 메타
│   ├── baseline-<date>.json         # ADR-010 baseline+ratchet
│   ├── findings.md                  # finding 누적
│   └── output/                      # 분석 stage 산출물 (15종 중 해당분)
│       ├── inventory.json
│       ├── architecture.json
│       ├── architecture.mermaid
│       ├── domain.json
│       ├── rules.json
│       ├── openapi.yaml             # BE
│       ├── schema.json              # DB
│       ├── erd.mermaid              # DB
│       ├── state-map.json           # FE
│       ├── visual-manifest.json     # FE
│       ├── a11y.json                # FE
│       ├── i18n.json                # FE
│       ├── static-security.json     # BE+FE
│       ├── legacy.json              # 공통
│       ├── form-validation-spec.json # FE
│       ├── type-spec.json           # FE (TS)
│       ├── antipatterns.json        # 공통
│       ├── migration-cautions.md    # 공통
│       └── tool-runs/               # 진짜 도구 raw 출력 보존
```

### 분석 → 설계 ↔ 설계 → 테스트 (☐ v2.0)

#### design stage 5 영역 강도

| 기획 | 디자인 | FE | BE | DB | 공통 |
|---|---|---|---|---|---|
| 약 | 강 | 강 | 약 | 약 | 약 |

★ design stage 기존 자산 (analysis stage 안에 일부 포함됨 / v2.0 분리 carry):
- `deliverables/7-ui-ux.md` (★ FE+디자인 cross-cutting)
- `deliverables/8-state-map.md` (★ FE 동적 행동)
- `deliverables/9-visual-manifest.md` (★ Playwright snapshot binary 진실)
- `docs/adr/ADR-FE-002.md` (★ DTCG 2025.10 W3C spec)
- `docs/adr/ADR-FE-005.md` (★ 권위 매개체 13)

design stage 산출물 (v2.0 시점에 정식 분리):
- wireframe spec
- component-spec.json
- DTCG token (`design-tokens.json` + `design-tokens.md` 이중 렌더링)

#### test stage 입출력

input (테스트 stage 가 받음):
- 분석 stage 산출물 7~15 전부
- (v2.0 추가) component-spec.json / wireframe / DTCG token

★ 5 영역 강도 (test stage):

| 기획 | 디자인 | FE | BE | DB | 공통 |
|---|---|---|---|---|---|
| ❌ | 약 (visual-regression) | 강 | 강 | 강 | 강 |

산출물 (테스트 stage 가 만듦):
- test-plan.json
- contract-test 코드
- E2E spec

스키마: v2.0 시점에 `schemas/test-plan.schema.json` 신설.

★ 사용자 시나리오 6번 (2026-05-02) — "테스트 코드 만드는 부분은 아직 안되어 있지만 추상화만 해놓자". 본 추상화 단계 = 골격 placeholder 만 / v2.0 진입 시 실 채움 (★ §가치 경계 충돌 deferral 참조).

### 테스트 → 구현 (☐ v2.0)

input (구현 stage 가 받음):
- 분석 stage 산출물 + 설계 산출물 + 테스트 산출물

★ 5 영역 강도 (implement stage):

| 기획 | 디자인 | FE | BE | DB | 공통 |
|---|---|---|---|---|---|
| ❌ | 약 | 강 | 강 | 강 | 강 |

산출물 (구현 stage 가 만듦):
- production code
- 빌드 artifact

★ 본 방법론은 산출물을 **입력 자료** 로만 활용. round-trip 검증 (산출물 ↔ 구현 정합 자동 검증) 은 영구 scope 외부.

★ 사용자 시나리오 6번 (2026-05-02) — "구현 부분은 없고". 본 추상화 단계 = 골격 placeholder 만 / ★ §가치 경계 충돌 deferral 참조.

## 가치 경계 충돌 deferral (★ 사용자 시나리오 2026-05-02)

본 방법론 가치 명세 (CLAUDE.md ★★★) = "legacy 코드 → 7대 산출물 한 방향 추출기 / round-trip 영구 scope 제외".

→ test / implement stage 는 본 가치 외부.

그러나 사용자 시나리오 (2026-05-02 / 본 plan = `~/.claude/plans/humble-wiggling-dolphin.md`) = ★ "구현부분은 없고 테스트 코드 만드는 부분은 아직 안되어 있지만 추상화만 해놓자" → ★ v2.0 carry 신호 (★ "지금까지" / "아직" 시간 부사 = 미래 채움 의도).

★ 두 신호 충돌 = ★ 사용자 추후 명시 결단 영역. 본 추상화 단계 = ★ 골격 placeholder 만 (lifecycle-contract.md + 8 README 갱신만 / SKILL.md 신설 ❌ / template 신설 ❌ / schema 신설 ❌).

v2.0 진입 시 ★ 사용자 명시 결단 의무:
- (i) round-trip 부분 허용 — implement / test stage 정식 채움 + 가치 경계 갱신
- (ii) 영구 scope 보존 — implement / test stage = 사람이 산출물을 입력 자료로 활용 (자동 round-trip ❌) / skill 채움도 "사람 가이드" 만

## Runtime 메커니즘 (현재 vs v2.0)

### 현재 (v1.4.x — analysis stage only)

- skill description trigger: 코드베이스 시그널 기반 자동 발동
- formal-spec-link-validator: cross-link 정합 (분석 stage 내부)
- drift-validator: 이중 렌더링 정합 (.json ↔ .mermaid)
- decision-table-validator: DMN 5-check
- spectral-runner: OpenAPI 정합
- static-runner: 외부 정적 분석 hook (Semgrep / PMD / SpotBugs)

### v2.0+ carry-over (lifecycle 확장 시)

- G1: `.aimd/state.json` (사용자 프로젝트 stage 추적)
- G2: stage-aware hook routing (`hooks/{analysis,test,implement}.json`)
- enter-stage skill (`/methodology:enter-stage:{analysis,test,implement}`)
- lifecycle-contract-validator (단계 간 prerequisite 검증)

자세한 내용: 본 plan 의 14차 결단 + carry-over C.8.

## 변경 이력

- v1.4.0 (2026-05-02): 본 문서 신설 (plan 13~14차 결단). 분석 stage 인터페이스 채움. 다른 stage placeholder.
- v1.4.4-pre (2026-05-02): 사용자 시나리오 (2026-05-02) — 추상화 골격 보강. ★ 5 영역 axis 6 enum 확장 (`공통 / BE / FE / DB / 기획 / 디자인`) + ★ 5 영역 × 5 stage 강도 매트릭스 + 각 stage placeholder § 강도 표 추가 + ★ §가치 경계 충돌 deferral § 신설 + ★ 기술 스택 분기 axis 정책 선언. 본체 schemas / ADR 진입 ❌ / SKILL.md 신설 ❌. plan = `~/.claude/plans/humble-wiggling-dolphin.md`.
