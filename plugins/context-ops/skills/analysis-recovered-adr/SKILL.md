---
name: analysis-recovered-adr
description: Use during analysis stage to reverse-engineer the PAST architecture decisions of a legacy/existing codebase ("recovered ADR" / "왜 이렇게 설계됐나" / "과거 결정 복구" / "architecture decision archaeology" / "역추적 ADR" / "decision rationale recovery"). Reconstructs decisions (ORM/persistence choice, deployment packaging, module split, framework version pins) from code/config/structure evidence into recovered-adr.json (analysis 산출물 #25 / backward complement to forward task-plan.adrs[]). Distinguishing feature = HONEST ABSTENTION — when the WHY (rationale) cannot be recovered from evidence, mark rationale.certainty=unverified-intent (no fabrication / no-simulation). Every decision is evidence-grounded (fail-closed); rationale recoverability reuses discovery-spec intent_certainty enum (no new enum). Academic grounding = Jansen&Bosch 2008 "Documenting after the fact" + Archie (FSE2014 traceability). official (opt-in / legacy·brownfield 한정 / DEC-2026-06-10-reverse-eng-delta-2a-3-promotion — ≥2 도메인 corroborated). Stage = analysis, aspect = cross-cutting.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-recovered-adr — 과거 architecture 결정 역추적 (rationale abstention)

"이 시스템이 **왜 이렇게 설계됐나**"(과거 결정 + 근거)는 LLM 이 legacy 를 modify·evolve 할 때 필수 컨텍스트다. forward `task-plan.adrs[]`(plan stage / 앞으로 내릴 결정 / 대안≥3 강제)의 **backward 보완** — 이미 내려진 결정을 코드 증거에서 복구. 출력 `recovered-adr.json` = 역추적한 결정의 선언적 산출물.

**차별점 = 정직한 abstention.** WHY 를 복구 못 하면 그럴듯한 이유를 **지어내지 않고**(no-simulation 의 ADR 판) `rationale.certainty=unverified-intent` 로 정직 표기. 이 abstention 이 본 산출물의 핵심 가치다 (forward-authored ADR 관행·도구가 가진 사각지대 = reverse-engineered ADR 가 사는 곳 / research 검증: 어떤 ADR 포맷·도구도 "rationale unknown" 토큰 없음).

## no-simulation 절대 금지

baseline → `methodology-spec/policies/no-simulation.md`.

- **결정 evidence-grounded 의무 (fail-closed)** — 모든 recovered_adr 은 `evidence[]` ≥1 (code/config/structure 출처). 증거 없는 결정 등재 ❌ (schema minItems:1 강제).
- **rationale 날조 절대 금지** — WHY 의 근거(주석/ADR 문서/commit)가 소스에 없으면 `certainty=unverified-intent` + `text=null`(또는 "복구 불가 — 사람 확인"). "아마 성능 때문일 것" 식 추론을 `observed`/`text` 로 등재 ❌. schema 가 `observed ⟹ basis_evidence 필수` 로 fail-closed 강제.
- **rationale 복구도 = discovery-spec `intent_certainty` 재사용** — 신규 enum ❌. `observed`(근거 소스 명시) / `inferred-consequence`(사실 결과는 관찰·의도는 추론) / `unverified-intent`(의도 귀속이나 근거 부재 = 정직 unknown) / `source-refuted`(소스가 귀속 의도 반증).
- **status overload 금지** — lifecycle `status`(accepted/deprecated/superseded)와 rationale 복구도(`rationale.certainty`)는 **직교 축**. WHY 불확실성을 status 에 섞지 않는다.
- `extraction.evidence_trust = real_extraction` (실 코드·config 읽기) — simulated 영구 reject.

## confidence / certainty 계층

- **결정(decision)** = 관찰된 사실. config 의존성/설정·매퍼 파일·디렉토리 구조에서 결정론적으로 확인.
- **rationale(WHY)** = 복구 대상 / 4-tier certainty:
  - `observed` — 근거가 소스에 직접 명시(코드/설정 주석, ADR 문서, commit 메시지). **basis_evidence 필수** (schema fail-closed).
  - `inferred-consequence` — 결정의 사실적 결과는 관찰되나 의도 귀속은 추론. text 권장 + basis_evidence 선택.
  - `unverified-intent` — 의도를 귀속하려 하나 소스 근거 부재 = **정직 abstention**. text=null 허용 / 날조 ❌.
  - `source-refuted` — 귀속하려던 의도를 소스가 반증.

## 사전 조건

- 분석 대상 repo + (권고) `inventory.json`/`architecture.json`(있으면 결정 후보 seed). 부재해도 skill 동작(소스 직접 역추적).

## 절차

1. **결정 후보 탐지 (evidence-first)** — 다음 신호에서 "결정이 내려진 지점" 식별:
   - **dependencies**: build manifest(pom.xml/build.gradle/package.json) 의 의존성·버전 핀·`<packaging>` (ORM/프레임워크/배포 형태 선택).
   - **structure**: 디렉토리 레이아웃(레이어링·모듈 분리·BC 경계).
   - **interfaces/construction**: 설정 파일(applicationContext.xml / *.config), 진입점, 매퍼/마이그레이션.
   - 각 후보에 **반드시 `evidence[]`(source_ref ≥1)**. 증거 못 찾으면 후보 폐기(추측 등재 ❌).

2. **status 판정** — recovered = 이미 구현된 시스템 → `accepted`(현행) / `deprecated`(폐기 진행) / `superseded`(대체됨). `proposed` 부적용.

3. **rationale 복구 (정직 abstention 의무)** — 각 결정의 WHY 를 **소스 증거에서만** 복구:
   - 코드·설정 **주석**(예: `<!-- Keep X until Y -->`), ADR/design 문서, commit 메시지, README → 있으면 `observed` + `basis_evidence`.
   - 결과는 관찰되나 명시 근거 없음 → `inferred-consequence` (의도 추론임을 text 에 명시).
   - **근거 전무 → `unverified-intent` + text=null** (정직 unknown / 절대 날조 ❌).
   - 근거가 귀속 의도를 반증 → `source-refuted`.

4. **alternatives (evidence 있을 때만)** — 소스가 대안 검토/거부를 보일 때만 등재(`rejected-with-evidence`). 일반적 대안 언급은 `speculative`(rejection_reason=null). **forward adrs 의 ≥3 강제 없음** — 역추적은 검토된 대안을 모름(빈 배열 정상).

5. **consequences (관찰된 것만)** — 코드/구조에서 관찰되는 결과만. 추측성 결과 ❌.

6. **assemble + 정직 카운트** — `recovered-adr.json` 작성(`schemas/recovered-adr.schema.json` valid). `extraction.rationale_unknown_count` = unverified-intent 수(정직 노출). build/run 미실행·소스 직접 읽기 = `real_extraction`. 사용자가 soft gate #0 에서 결정·rationale 확정.

## 산출물

- `<user-project>/.ai-context/output/recovered-adr.json` (`schemas/recovered-adr.schema.json` / analysis 산출물 #25 / evidence-grounded / rationale abstention)

## 한계 (정직)

- **추출 ≠ 검증** — 역추적한 결정·rationale 의 사실성은 사람 gate #0 확정. 산출물은 advisory 가 아니라 evidence-grounded 이나, abstention 이 over-attribution 안전판.
- **rationale 복구율은 코드베이스 의존** — 주석·ADR·commit 위생이 나쁜 legacy 일수록 `unverified-intent` 비율↑(정직). `rationale_unknown_count` 높음 = 결함 아니라 정직 신호.
- **alternatives 는 보통 빈 배열** — 역추적은 "검토했으나 거부된 대안"을 거의 알 수 없음(소스에 흔적 있을 때만).
- **`source-refuted` 는 드묾** — 소스가 명시적으로 통념을 반증하는 경우만(예: 주석이 "성능 아님, 호환성 때문" 명시).
- **official (opt-in)** — ≥2 distinct 도메인 corroborated (근거 ## 인용). MANDATORY ❌ — legacy/brownfield 한정 cross-cutting aspect (greenfield 비적용). carry = recovered-adr-validator 부재(manual cross-check) / vcs-rationale 미본격 / 3rd non-Java paradigm.

## 인용

- `schemas/recovered-adr.schema.json`
- DEC-2026-06-09-recovered-adr-rationale-abstention (본 skill 의 결정 / 모DEC = DEC-2026-06-09-reverse-eng-methodology-gap §2.5 델타 #3)
- DEC-2026-06-10-reverse-eng-delta-2a-3-promotion (draft→official 격상 / ≥2 도메인 corroborated)
- `schemas/discovery-spec.schema.json` (intent_certainty enum 재사용 SSOT / 신규 enum ❌)
- `schemas/task-plan.schema.json` (forward adrs[] — 본 산출물의 backward 보완 / Nygard status enum)
- `methodology-spec/policies/no-simulation.md` (evidence-grounded / rationale 날조 금지 / abstention)
- https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions (Nygard ADR 원본 / status enum)
