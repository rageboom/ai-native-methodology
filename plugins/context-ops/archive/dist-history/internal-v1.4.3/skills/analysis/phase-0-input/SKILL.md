---
name: phase-0-input
description: Use when starting analysis of a legacy codebase. Entry point for SDLC analysis stage. Establishes input scope, target modules, language/framework signals, and applies ADR-010 baseline+ratchet (mandatory for legacy projects). Stage = analysis (v1.4.x default).
allowed-tools: Read, Glob, Grep, Bash
---

# phase-0-input — 분석 진입점

본 방법론의 첫 단계. 이후 모든 phase 의 input 정리.

## 사전 조건

- 사용자가 분석 대상 legacy 코드베이스 (또는 신규 시스템 구축 input) 을 가리킴
- ADR-010 baseline+ratchet 적용 확인 — 미적용 legacy 프로젝트면 `apply-baseline-ratchet` skill 우선 호출

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
   - 본 방법론은 한 방향 추출기 (legacy → 7대 산출물). round-trip 검증 안 함.
   - 가치 명세 (CLAUDE.md) 사용자 확인.
5. **메타 정보 기록** — `<user-project>/.aimd/phase-0-input.json`:
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
   	"baseline_ref": ".aimd/baseline-2026-05-02.json",
   	"phase_0_completed_at": "..."
   }
   ```
6. **다음 단계 안내** — `phase-1-inventory` 호출 권장.

## 산출물

`<user-project>/.aimd/phase-0-input.json` (lifecycle-contract 의 분석 stage 진입 시 다른 phase 들이 참조하는 메타 정보)

## 본체 명세 참조

- `methodology-spec/workflow/phase-0-input.md`
- `methodology-spec/lifecycle-contract.md` (단계 간 산출물 인터페이스)

## When NOT to invoke

- 사용자가 신규 시스템 구축 (legacy 없음) — 기획→설계→구현 흐름이라 본 skill 부적합. v2.0 lifecycle 확장 시 planning skill 안내.
- ADR-010 baseline+ratchet 미적용 legacy — `apply-baseline-ratchet` 먼저.
