---
name: analysis-input-collection
description: Use when starting analysis of a legacy codebase. Entry point for SDLC analysis stage. Establishes input scope, target modules, language/framework signals, and applies ADR-010 baseline+ratchet (mandatory for legacy projects). Stage = analysis (v1.4.x default). For multi-source input (Figma / Swagger / plan-doc / natural-language prompt), use analysis-input-orchestrate instead.
allowed-tools: Read, Glob, Grep, Bash
---

# analysis-input-collection — 분석 진입점

본 방법론의 첫 단계. 이후 모든 phase 의 input 정리.

## 사전 조건

- 사용자가 분석 대상 legacy 코드베이스 (또는 신규 시스템 구축 input) 을 가리킴
- baseline+ratchet 적용 확인 — 미적용 legacy 프로젝트면 `_base-apply-baseline-ratchet` skill 우선 호출

## 절차

1. **분석 target 확인** — 사용자에게 명확히: 어떤 repo / branch / commit / 모듈 범위?
2. **언어 / 프레임워크 시그널 수집** — Glob + Read:
   - `package.json` (Node / TS / FE)
   - `pom.xml` / `build.gradle` (Java)
   - `requirements.txt` / `pyproject.toml` (Python)
   - `Gemfile` (Ruby)
   - `go.mod` (Go)
   - DDL `.sql` / Prisma / JPA entity / TypeORM (DB stack)
3. **트랙 분기 신호** — 코드베이스가 BE / FE / DB / 풀스택 중 무엇? 신호 기록 (다음 phase 의 skill 자동 발동 trigger)
4. **분석 가치 명시** — 사용자에게:
   - 본 방법론은 한 방향 추출기 (legacy → 산출물). round-trip 검증 안 함.
   - 가치 명세 (CLAUDE.md) 사용자 확인.
5. **메타 정보 기록** — `<user-project>/.ai-context/input.json`:
   ```json
   {
   	"target": { "repo": "...", "commit": "...", "scope": "module-X" },
   	"stack": {
   		"language": "java",
   		"framework": "spring-boot-3",
   		"db": "postgresql"
   	},
   	"tracks": ["BE", "DB"],
   	"baseline_applied": true,
   	"baseline_ref": ".ai-context/baseline-2026-05-02.json",
   	"phase_0_completed_at": "..."
   }
   ```
   > `stack` 은 input.json 의 **평면 시그널** — inventory.json 의 nested `stack.{backend|frontend...}.{language,framework,db}`(stackTier)와 형태가 다르다 (SSOT: `schemas/inventory.schema.json`). input.json 자체엔 전용 schema 없음(teaching meta).
   > FE/모노레포 예: `"stack": { "language": "typescript", "framework": "react-18", "db": "none" }`, `"tracks": ["FE"]` — DB 부재면 db/BE phase 는 N/A. Module-Federation 멀티앱이면 `target.scope` 에 app/module 범위를 명시.
6. **다음 단계 안내** — `analysis-source-inventory` 호출 권장.

## 산출물

`<user-project>/.ai-context/input.json` (lifecycle-contract 의 분석 stage 진입 시 다른 phase 들이 참조하는 메타 정보)

## draft-first — 핵심 floor 부터 (전체 ~21종 아님)

analysis 산출물을 처음에 다 만들 필요 없다(부담). **핵심 grounding floor 만 먼저 만들어 discovery 진입** → 나머지는 per-scope 로 심화한다 (breadth-only / SSOT = `methodology-spec/policies/draft-first-minimal-subset.md`).

- **floor** = `architecture.json` + `domain.json` + `business-rules.json` (universal) + 트랙 조건부(BE→openapi / DB→schema / FE→≥1 FE 산출물). `inventory.json` 은 stack 신호로 먼저 만들되 floor 판정에는 미포함.
- floor 충족 = `minimalSubsetPresent` 신호 → discovery 진입 grounding 충분(advisory). 만든 산출물은 정상 full-depth source-grounded / 미룬 건 honest-absent(빈 stub ❌).
- **미룬-항목 finding 의무**: floor 만 만들고 멈출 때 `_base-log-finding` 으로 finding 1건 emit — `phase: input` / `severity: low` / description 에 **미룬 산출물 목록** + 정직 노트 *"이 subset 은 시작 baseline (scoped to <X>) — per-scope 작업하며 BR/도메인이 더 surface 됨"*. (`bc-accumulator-rollup` 엔 deferred 개념이 없어 이 finding 이 추적 SSOT.)
- **심화**: scope 작업 시 `analysis-scope-carve`(경계) + `bc-accumulator-rollup`(멱등 per-BC upsert) 로 닿는 부분만 깊게 — 신규 메커니즘 없음.

## When NOT to invoke

- 사용자가 **신규 시스템 구축 (greenfield / legacy 코드 없음)** — 본 skill 부적합. `scenario=greenfield` 선언 후 **`analysis-greenfield-bootstrap`** (입력어댑터 패스만 / 리버스 엔지니어링 skip) 호출. 입력어댑터 = `analysis-input-orchestrate` greenfield 분기 (analysis 는 legacy _코드_ 가 아니라 _입력_ 을 요구).
- baseline+ratchet 미적용 legacy — `_base-apply-baseline-ratchet` 먼저.

## 인용

- 정책: `methodology-spec/workflow/input.md`
- 정책: `methodology-spec/lifecycle-contract.md` (단계 간 산출물 인터페이스)
- 정책: `methodology-spec/policies/draft-first-minimal-subset.md` (핵심 floor 부터 → per-scope 심화)
- ADR: ADR-010 (baseline+ratchet)
- 결단: DEC-2026-05-30-use-scenario-taxonomy §2.4
