# research — Q-①-followup: rules_auto_extracted_reference → auto_extracted_br_refs

> 4원칙 2단계 산출. session 26차 연속 (2026-05-17). 가벼운 sub-agent 3-에이전트 병렬 (official-docs / industry-case / Senior).
> 입력 plan = `.claude/plans/plan-q1-followup-auto-extracted-br-refs-rename.md`.

## 1. official-docs-checker (json-schema.org / semver.org)

| # | 검증 | 판정 |
|---|---|---|
| 1 | additionalProperties:false 하 old key 보유 문서 INVALID | **VERIFIED** (properties 미선언 key = 즉시 invalid / spec 확정) |
| 2 | rename = MAJOR 필수? | **INSUFFICIENT-DATA** — SemVer 은 'public API' 경계를 **프로젝트 재량**으로 위임. spec 자체는 MAJOR/MINOR 어느 쪽도 강제 ❌. 프로젝트 정책 문제 |
| 3 | rename 정석 (즉시+MAJOR vs alias 병존) 공식 권고 | **INSUFFICIENT-DATA** — json-schema.org 에 schema evolution/rename normative 권고 부재 |

→ ★ 핵심: semver spec 이 MAJOR 를 강제하지 **않음**. 판정은 프로젝트 정책 (= Senior 결정 영역).

## 2. industry-case-researcher

- **field rename = MAJOR 우세** (Cargo "public item rename=MAJOR" 성문 / Kubernetes API 버전 bump). **단 external consumer 0 = deprecated-alias 병존 기간 생략 정당**.
- **semantic-rename = breaking** (의미 보존 면책 아님 / Cargo) 우세. **소수 실용주의** (Akka.NET Stannard "not for public consumption + low impact = MINOR 허용") = ★ 본 case (internal-only + zero consumer) 정합.
- **★ 연속 MAJOR = batch 권고 우세** (ING Blog "batch 없는 연속 MAJOR = consumer 부담 기하급수 + automation 무력화" / SemVer 공식 "거의 모든 release 가 MAJOR = automation 무력화 경고"). 같은 날 v5→v6→v7 = signal 가치 희석.

→ field rename MAJOR 가 일반 우세이나, **zero-consumer dogfooding + 연속 bump 희석 회피 = MINOR 실용주의가 본 case 정합**.

## 3. Senior — REVISE-2 (핵심)

### 3.1 D1 version → ★ ★ ★ v6.1.0 MINOR (integrity-correct / NOT v7.0.0)

- ① MAJOR 근거 = property **제거** + **real consumers** (business_rules/summary alias = 4 PoC + extractRules() load-bearing). "MINOR 호칭=integrity drift" 는 ★ **alias 폐기+real consumer 맥락 한정**.
- Q-①-followup = src consumer **0** (br-cross-consistency-validator/schema-validator/release-readiness/skills/templates 전수 grep = 11 files 중 src 0 / 문서·test·schema·poc-04 만) + 유일 holder poc-04 **동시 atomic 마이그레이션** = textbook MINOR (additive-equivalent / no consumer observes break).
- ★ **LL-i-52 가 "semantic-rename ≠ alias 폐기" 선을 그었으므로 version 논리도 달라야** (scope 만 분리하고 version 은 ① 동형 강제 = category error). v7.0.0 강제 = **semver inflation = 역방향 integrity drift**.
- ★ version = **사실 확정 (choice ❌)** — ① 선례 ("version=사실 확정, not 선택지"). research single determined answer = **MINOR**.

### 3.2 D2 문서 처분 → CONCUR + 누락 보정

- 역사 DEC/STATUS/INDEX 과거 entry = 보존 (LL-i-52 silent 재작성 ❌). 활성 SSOT 만 갱신.
- ★ **누락 위험 (Senior 보정)**: `rules.schema.json` description string 자체가 `"향후 auto_extracted_br_refs rename 별도 carry Q-①-followup"` forward-pointer = **active SSOT** → 완료 시 **재작성 의무** (보존 ❌). plan §1 affected-file 에 명시 추가.

### 3.3 D4 guard test → CONCUR + 추가

- canonical-single-alias.test.js:41-47 "rules_auto_extracted_reference 보존" → "auto_extracted_br_refs 보존 + rules_auto_extracted_reference 재유입 0" 전환 (① alias-REJECT 동형 / 충분).
- ★ 추가: 동 파일 v6.0.0 ② guard block (businessRule.$defs anyOf 2 branch + property 보존) **비교란 확인** 의무 (rename 이 ② guard 교란 ❌).

### 3.4 process depth → REVISE (lightweight 정당화)

- ① DEC §1 #4 "별도 plan + 4원칙" 는 **LL-i-54 (breaking 동형 ≠ 비용 동형) 이전 작성**. 11 file / src consumer 0 / 순수 rename = full 3-agent Phase-3 research 과함. ★ lightweight sub-agent (현 진행) = LL-i-54 정당 일탈. **신규 DEC 에 명시** (향후 "followup 이 왜 full research 생략?" drift 회피).

## 4. 종합 — 사용자 결단 (추천안 / D1 은 사실 확정 보고)

| D | 결론 | 근거 수렴 |
|---|---|---|
| D1 version | ★ **v6.1.0 MINOR** (사실 확정 / choice ❌) | official-docs(spec 강제 ❌/프로젝트 재량) + industry(zero-consumer 실용주의 + batch 희석 회피) + Senior(src consumer 0 + atomic 마이그레이션 = textbook MINOR / v7.0.0=semver inflation / LL-i-52 version 논리 분리) |
| D2 문서 | 역사 보존 + 활성 SSOT 갱신 + ★ schema description forward-pointer 재작성 | Senior CONCUR + 누락 보정 |
| D3 cooling-off | 지금 시행 (①② 동형 / 사용자 명시) | 사용자 결단 영역 |
| D4 guard test | rename 보존+재유입 0 전환 + ② guard 비교란 확인 | Senior CONCUR + 추가 |
| process | lightweight (LL-i-54 정당 / 신규 DEC 명시) | Senior REVISE |

## 5. 잔존 STOP / 위험

- STOP = 없음 (Senior no blocking). src consumer 0 + 단일 holder = risk 최소.
- ★ 신규 LL 후보 = LL-i-56 ("동일 cluster 내 항목이라도 consumer 분포·breaking 성격 차이 시 version tier 분리 — alias 폐기(real consumer/MAJOR) vs semantic-rename(zero consumer atomic/MINOR). scope 분리 = version 분리 동반 / 일괄 MAJOR 강제 = semver inflation").

## 6. 다음 단계

사용자 결단 (D1 MINOR 사실 확정 보고 + D2/D4 추천안 + D3 cooling-off + lightweight process) → 4원칙 3단계 승인 후 시행 (plan §3 + Senior 보정 2건 — schema:33 forward-pointer 재작성 + ② guard 비교란).
