# DEC-2026-06-05-shipped-provenance-cleanup

> **status**: 채택 (2026-06-05)
> **유형**: 운영/구조 결정 (DEC — ADR 아님)
> **관련**: outer `CLAUDE.md` §"버전별 상세 narrative 누적 금지 / 4중 중복 회피" precedent 확장 / `tools/skill-citation-validator` / `scripts/release-readiness.js` check40

## 1. 컨텍스트 (왜)

shipped 플러그인 파일(`skills/*/SKILL.md` 57 · `agents/*.md` · `methodology-spec/**`)에 **해당 파일의 사용자 관심사 밖** 내용이 다량 박혀 있었다 — 버전 변천사 narrative · DEC rationale · PoC corroboration 증거 · LL 교훈 · 프로젝트 backlog carry · ADR 변천사 산문. 이는 *방법론 개발*(프로젝트 거버넌스)의 산물이지 *플러그인 사용자*가 운영에 쓸 내용이 아니다. 감사 결과 SKILL.md 약 270 + methodology-spec 약 150 마커.

본 결정은 outer `CLAUDE.md` 의 기존 정책("버전별 상세 narrative 는 CLAUDE.md 누적 금지 / 4중 중복[CHANGELOG+DEC+memory+CLAUDE] 회피")을 **모든 shipped 파일**로 확장한다.

## 2. 결정 (무엇)

**목표 상태**: shipped 본문 = 현재형 사용자 관심사만. 출처(provenance)는 파일 끝 단일 `## 인용` footer 의 포인터(id·경로 + ≤6어 gloss)로만. narrative SSOT 는 `decisions/DEC-*` · `CHANGELOG*` · `docs/adr/` (이미 존재) → 대부분 **인라인 중복 제거 + 포인터화**.

### 2.1 KEEP vs RELOCATE 규칙 (카테고리별)

| Cat | RELOCATE (본문에서 제거/이전) | KEEP (보존) |
|-----|------------------------------|-------------|
| 버전 narrative | `vN.M 신설/종결/누적/MINOR/PATCH/rename`, `session N차` | 현재 아키텍처 명칭 `v9.0 6-stage`·`chain N`·`ISO/IEC 25010:2023`·`WCAG 2.2` |
| DEC | 인라인 rationale → `## 인용` footer (enumerated 항목은 binding 보존) | — |
| PoC | 인라인 증거(`PoC #06 Spring 4.1`·`poc-17`·⭐·측정치) | 게이트 문구 `≥2 PoC corroboration 의무` |
| LL | `LL-i-26` 인라인 태그 | — |
| carry | 프로젝트 backlog(`vN.x carry`·`다음 세션`·`K-? 로드맵`) | 런타임 메커니즘(R19 environment carry-over·baseline+ratchet·named `C-*`·schema field carry) |
| ADR | embedded 변천사 산문 → footer 포인터 | live rule grounding thin 포인터(footer) |

### 2.2 경계 doc 처분

- **`methodology-spec/finding-system.md` Body Finding Ledger**(F-PA/F-MB/F-SIM/F-SKILL/F-CHA = 방법론 자체 dev finding 로그) → `decisions/finding-ledger.md` (non-shipped) 반출. §1~9 finding **체계 명세**(§9 PoC#01 사례 포함)는 보존.
- **corroboration-evidence doc** (`sub-rules/spring41-ibatis2-isomorphic.md`·`sub-rules/absent-br-gwt-nl-paradigm.md`·`finding-system.md`) → 버전 history 헤더만 정리, PoC corroboration **증거 보존**. 파일 단위 `allow-provenance:` 가드 면제.
- **`agents/design-agent.md`** (skill 부재 placeholder) → 유지 + NOT-SHIPPED·dispatch ❌ 강조 + 파일 단위 `allow-provenance:` 가드 면제. 본문 로드맵 보존.

### 2.3 schema 처분

- **`cycle-carry.schema.json`** (Cycle Carry Record / 거버넌스 / dormant — shipped 생산자 0 / schema-validator test 만 참조) → `decisions/governance/cycle-carry.schema.json` 물리 반출 (shipped payload 제외). `$id` + `tools/schema-validator/test/v880-cycle-carry.test.js` `--schema` 명시 갱신.
- **`adopter-corroboration.schema.json`** → `x-aimd-tier: "governance"` 라벨만(경로 유지 — `release-readiness.js` check30 하드코딩 보호).

### 2.4 재누적 방지 가드

`scripts/release-readiness.js` **check40 `shipped_provenance_leak`** 신설 (check27 동형). `SHIPPED_PROSE_DIRS = [skills, agents, methodology-spec]` `.md` 본문(frontmatter·`## 인용` footer 이후·`allow-provenance:` 줄/파일 면제)에 DEC/ADR/버전변천사/session/inline-PoC/LL 마커 재유입 시 fail-closed. 게이트 39→40.

## 3. 근거

- **결정론 안전망**: `skill-citation-validator`(dead-link)·check40(마커)·release-readiness 40/40·schema-validator 40/40·frontmatter byte-동일. 정리는 워크플로 병렬(파일당 1 에이전트) + 전수 검증.
- **frontmatter `name`/`description` 불가침**: skill/agent 자동 선택 텍스트 보존(버전 단어 잔존 허용).
- **citation-validator HISTORY_FILE 확장**: `decisions/finding-ledger*` = history-class(INSPECTION-* 동류 / 의도적 stale-quote 보존) 검사 제외.

## 4. 영향

- 정리 파일: skills 53 · methodology-spec 54 · agents 11 (248+375+45+수동 edits).
- 신규: `decisions/finding-ledger.md`(799줄) · `decisions/governance/cycle-carry.schema.json` · check40 + 단위테스트.
- 사용자 동작 변화 ❌ (provenance noise 제거 / skill·agent 지시 기능 동형).
- payload 축소: `cycle-carry.schema.json` 제외 + `finding-system.md` 995→212줄.

## 인용

- precedent: outer `CLAUDE.md` §버전 narrative 누적 금지 / 4중 중복 회피
- 가드: `scripts/release-readiness.js` check40_shippedProvenanceLeak (+ `scripts/test/release-readiness.test.js` discrimination)
- citation 제외: `tools/skill-citation-validator/src/check-citations.js` HISTORY_FILE
- 반출: `decisions/finding-ledger.md` · `decisions/governance/cycle-carry.schema.json`
