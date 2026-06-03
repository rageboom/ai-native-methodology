---
name: analysis-input-orchestrate
description: Use when user provides multi-source analysis input via natural language (with optional swagger URL / figma reference / plan-doc path). Parses input, auto-dispatches BCDE sub-skills (analysis-from-{prompt,swagger,plan-doc,figma}), merges into input-summary.json with cross-references and conflicts. Stage = analysis (input). For legacy-code-only entry, use analysis-input-collection instead.
allowed-tools: Read, Glob, Grep, Bash, Task
---

# analysis-input-orchestrate — 다중 입력 통합 진입점

자연어 발화 + 메타데이터 (Figma / Swagger / 기획 문서) 입력을 한 번에 받아 BCDE sub-skill 4종을 자동 dispatch + merge / cross-ref / conflict 검출.

> **단일 책임**: 입력 흡수 orchestration (파싱 + dispatch + merge + 재확인). 메타 시그널 수집 (트랙 분기 / baseline) 은 [`analysis-input-collection`](../analysis-input-collection/SKILL.md) 위임.

## 사전 조건

- 사용자가 자연어 발화 또는 다중 자료 (Figma URL / Swagger 경로 / 기획 문서 경로) 제공
- 코드만 분석 케이스 → 본 skill 대신 `analysis-input-collection` 호출
- BCDE sub-skill 4종 존재 확인 (Step 1 본 골조 단계 = sub-skill 미신설이면 dispatch 결과 = blocked + 사용자 안내)

## 절차

### 1단계 — 자연어 파싱 (메타데이터 추출)

URL/path 패턴 + 한국어/영어 키워드 매칭 + **인라인 마커 우선**.

| 신호                   | 패턴                                                                      | 분기                           |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| swagger                | `openapi.yaml` / `swagger.json` / `swagger` / `openapi` 키워드 + URL/path | → `analysis-from-swagger`      |
| figma                  | `figma.com` 도메인 / `피그마` / `figma` 키워드 + URL                      | → `analysis-from-figma`        |
| plan-doc               | `.md` / `.pdf` 확장자 / `기획` / `문서` / `spec` 키워드 + path            | → `analysis-from-plan-doc`     |
| residual               | 위 3종 캡처 후 남은 자연어 전체                                           | → `analysis-from-prompt`       |
| **인라인 마커 (정식)** | `@swagger: <URL>` / `@figma: <URL>` / `@plan-doc: <path>`                 | 휴리스틱 override (우선순위 ↑) |

### 2단계 — BCDE sub-skill dispatch (Hybrid rule)

| 조건                                                                        | 호출 방식                                 | 근거                                                                        |
| --------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| 총 입력 (figma + swagger + plan-doc + prompt 추정 크기 합) ≤ 50K token      | **직접 skill chain** (Task tool 미사용)   | token 비용 최소 / 한 turn 안 trace / 사용자 BCDE 직접 호출 흐름과 일관      |
| 총 입력 > 50K token 또는 단일 sub-skill 실패가 다른 3개 오염 risk 큰 케이스 | **Task tool sub-agent** (general-purpose) | main context window 보호 / 격리 / 실패 분리                                 |
| ❌ chain-driver CLI dispatch                                                | (절대 ❌ / STRONG-STOP)                   | chain-driver = 결정론적 gate/sync/scope axis / LLM 판단 inject 시 axis 오염 |

각 sub-skill 산출 = `.aimd/<scope>/planning/{prompt,swagger,plan-doc,figma}-extract.json` (해당 schema 정합 의무).

### 3단계 — merge / cross-ref / conflict 검출

4 sub-skill 산출을 `input-summary.json` (schema = `schemas/input-summary.schema.json`) 으로 통합 (json 단독 / ADR-011 — input-summary.md 미산출).

#### cross-ref 3-tier severity + 정량 기준

| severity | 의미                                              | 정량 기준                                                       | 처리                                 |
| -------- | ------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| low      | 표기 차이 (snake_case vs camelCase)               | Levenshtein 거리 ≤ 2 + 대소문자/underscore 정규화 후 ≥ 90% 일치 | log only / 후속 skill 정규화         |
| medium   | 명명 충돌 (figma.email vs swagger.userEmail)      | 정규화 후 50~90% 일치 + 같은 도메인 entity 추정                 | conflict 등재 / 후속 skill 결단      |
| high     | 의미 충돌 (figma 화면 != swagger endpoint 도메인) | 정규화 후 < 50% 일치 또는 entity 도메인 불일치                  | **사용자 결단 의무** / state.blocked |

#### LLM 양심 의존 회피 (no-simulation 정합)

conflict 산출 시 정량 산식 명시 의무:

```
similarity_score = (1 - normalized_levenshtein) + (intersection_stems / union_stems)
```

orchestrate 가 산식 결과 + 입력 양쪽 인용을 같이 등재. LLM 이 "내가 보기에 비슷함" 같은 정성 판정 ❌.

### 4단계 — 모호 케이스 재확인

- URL 키워드 부재 (예: `https://example.com/spec.yaml` — swagger 인지 기획 문서인지 모호) → 사용자 재확인 prompt
- 다중 swagger (백오피스 + 프론트) → 사용자 명시 구분 의무 (인라인 마커 권장)
- 의도만 있고 입력 부재 → `analysis-from-prompt` 만 발동 + 다른 자료 보강 권장 안내

### 5단계 — greenfield 분기 (scenario=greenfield)

`work-unit-manifest.scenario == "greenfield"` (legacy 코드 없음 / DEC-2026-05-30-use-scenario-taxonomy §2.4) 일 때:

- **no-code 감지** — 분석 대상 코드 디렉토리 부재 / 입력이 PRD·디자인·계약(swagger·figma·plan-doc·prompt)뿐.
- **입력어댑터만 dispatch** — BCDE 그대로 (code-archaeology 패스 skip / legacy 전용 phase = `source-inventory`/`db-schema`(코드)/`characterization`/`sql-inventory` 미발동).
- **`analysis-greenfield-bootstrap` 로 위임** — input-summary 산출 후, 5종 산출물(architecture/domain/business-rules/openapi/schema)을 각 analysis skill 의 **greenfield code-optional mode** 로 생성 + legacy-only 산출물(antipatterns/migration-cautions) N/A + (swagger 채널) openapi.yaml 결정적 elevation 을 조율.
- backward-compat: scenario ≠ greenfield → 본 분기 무시 (기존 4단계 흐름 그대로).

## 산출물

- `.aimd/<scope>/planning/input-summary.json` (schema = `schemas/input-summary.schema.json` / json 단독 SSOT — ADR-011)
- 4 sub-skill extract 파일 (각 skill 책임)

## 본체 명세 참조

- `methodology-spec/workflow/input.md` (수동 + skill 호출 옵션 + orchestrator 자동 dispatch 3중)
- `methodology-spec/plugin-charter.md` §1 R8 + §3 G2
  (G2 orchestrate skill 분리 결단 = DEC-2026-05-15 / 상세는 decisions/ 워크스페이스 로그 — dist 미포함이라 경로 직접 인용 제거: case-by-case dist-dangling 정책)

## When NOT to invoke

- 사용자가 legacy 코드만 분석 → `analysis-input-collection` 호출 (본 skill 우회)
- 단일 입력만 (예: openapi.yaml 한 건만) → 해당 BCDE skill 직접 호출 가능 (orchestrate 우회)
- chain 1+ 진입 후 (discovery-spec 작성 중 추가 자료 흡수) → revisit-loop 으로 input 재진입 의무
