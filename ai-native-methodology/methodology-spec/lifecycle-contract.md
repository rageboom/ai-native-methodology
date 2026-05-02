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

## 단계 간 인터페이스 (data contract)

### 기획 → 분석 (☐ v2.0)

input (분석 stage 가 받음):
- PRD.md (product requirement document)
- story.json / story.md (epic / story decomposition)
- domain-priority.json (도메인 영역별 분석 우선순위)

스키마: v2.0 시점에 `schemas/planning-output.schema.json` 신설.

### 분석 → 설계 (★ 현재 채움 = 7대 산출물 + 8 FE 산출물)

본 v1.4.x 가 채우는 핵심 인터페이스. 분석 stage 출력 = 다음 단계의 입력.

**산출물 1~15** (`methodology-spec/deliverables/<NN>-*.md`):

| # | 산출물 | Schema | 트랙 |
|---|---|---|---|
| 1 | inventory | `inventory.schema.json` | 공통 |
| 2 | architecture (+ .mermaid) | `architecture.schema.json` | 공통 |
| 3 | domain | `domain.schema.json` | 공통 |
| 4 | rules | `rules.schema.json` | BE+FE |
| 5-a | openapi | `openapi-extension.schema.json` | BE |
| 5-b | schema + erd (.mermaid) | `db-schema.schema.json` | DB |
| 6 | finding-list | (`finding-system.md` 형식) | 공통 |
| 7 | antipatterns + migration-cautions | `antipatterns.schema.json` | 공통 |
| 8 | state-map | `state-map.schema.json` | FE |
| 9 | visual-manifest | `visual-manifest.schema.json` | FE |
| 10 | a11y | `a11y.schema.json` | FE |
| 11 | i18n | `i18n.schema.json` | FE |
| 12 | static-security | `static-security.schema.json` | BE+FE |
| 13 | legacy | `legacy.schema.json` | 공통 |
| 14 | form-validation-spec | `form-validation-spec.schema.json` | FE |
| 15 | type-spec | `type-spec.schema.json` | FE (TS) |

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

### 설계 → 테스트 (☐ v2.0)

input (테스트 stage 가 받음):
- 분석 stage 산출물 7~15 전부
- (v2.0 추가) component-spec.json / wireframe / DTCG token

산출물 (테스트 stage 가 만듦):
- test-plan.json
- contract-test 코드
- E2E spec

스키마: v2.0 시점에 `schemas/test-plan.schema.json` 신설.

### 테스트 → 구현 (☐ v2.0)

input (구현 stage 가 받음):
- 분석 stage 산출물 + 설계 산출물 + 테스트 산출물

산출물 (구현 stage 가 만듦):
- production code
- 빌드 artifact

★ 본 방법론은 산출물을 **입력 자료** 로만 활용. round-trip 검증 (산출물 ↔ 구현 정합 자동 검증) 은 영구 scope 외부.

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
