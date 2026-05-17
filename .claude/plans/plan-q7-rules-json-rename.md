# plan — 묶음 Q ⑦: rules.json → business-rules.json 산출물 파일명 rename (breaking 최대)

> 4원칙 1단계 산출. session 26차 연속 (2026-05-17). 사용자 "하자" → ⑦ 단독 진입 + "4원칙 plan+research 착수" (본격 시행 = 사용자 결단 후).
> ⑦ = 묶음 Q 최대 breaking (642 occ / 252 files). memory entry-point = "별도 집중 session + 4원칙 full + cooling-off 권고".
> 출처 carry = DEC-2026-05-17-q1-alias-4중첩-폐기 §외부 carry / 묶음 Q 마지막 잔여.

## 0. 한 줄 정의

분석 산출물 파일명 **`rules.json` → `business-rules.json`** rename (BR=business rule 명확화 / 묶음 Q 마지막). ① property canonical / ② 표현 / Q-①-followup property rename 와 달리 ★ **첫 파일명 기반 rename**.

## 1. 깊은 숙지 (Explore 전수 조사 + cli.js 코드 정독)

### 1.1 ★ ★ ★ 최대 risk = schema-validator filename resolution

`tools/schema-validator/src/cli.js:57-70 inferSchemaName`:
1. `$schema_origin` 값 regex `([a-z0-9-]+\.schema\.json)` → schema 파일명
2. `$schema` 값 동일 regex
3. fallback = `basename(jsonFile,'.json')` + `.schema.json` (`rules.json`→`rules.schema.json`)

→ ★ ★ ★ Senior REVISE-3 실측 정정 — 11 PoC schema key 실태: **3 `$schema_ref`(poc-01/02/03)** / **1 `$schema_origin`(poc-04)** / **7 무키(poc-05~11)**. inferSchemaName 은 `$schema_ref` 를 **안 읽음** → poc-01/02/03 도 이미 fallback path 3 사용 중 (rename 후 `business-rules.json`→`business-rules.schema.json` **auto-correct**). 7 무키 = pure fallback auto-correct. ⇒ **실제 value-edit 의무 = poc-04 `$schema_origin` 1개만** + poc-01/02/03 `$schema_ref` = stale dangling (resolution 안 깨짐 / honesty-update만). **해결 = `schemas/rules.schema.json` → `schemas/business-rules.schema.json` 동시 rename (Option A)** (regex `[a-z0-9-]+` 하이픈 수용 검증).

### 1.2 scope 정량 (Explore)

| 분류 | 정량 | 처분 |
|---|---|---|
| git mv 물리 파일 | **12** = 11 PoC rules.json + 1 rules.schema.json | rename 필수 |
| PoC schema key value-edit | ★ **poc-04 `$schema_origin` 1개만** (+ poc-01/02/03 `$schema_ref` honesty-update / 7 무키 auto-correct) | Senior REVISE-3 정정 (기존 "11" = ~7 과대) |
| ★ ★ hardcoded literal (resolution-break / STOP-3) | **3곳**: `findings-aggregator/src/cli.js:83` (`input/rules.json`) / `release-readiness.js:111` (poc-05 path) / `release-readiness.js:266` (`e.name==='rules.json'` auto-discover filter) | ★ 필수 (실제 fragile resolution) |
| 코드 주석/usage | release-readiness.js 주석 ~7 (15/243/245/247/279/302/304) + br-cross-consistency-validator usage doc | 활성 일관성 갱신 (동작 무관) |
| ★ br-cross-consistency·planning-extraction·chain-coverage src literal | **0** (Senior caveat de-risked) | 무수정 |
| schema cross-ref | 8 schema / ~15 ($comment·description "rules.json BR-*") | 활성 SSOT 갱신 |
| 활성 SSOT 문서 | ~14 (★ ADR-CHAIN-011 14회 + deliverables/5 + skills 2~3) | 갱신 |
| 역사/archive 보존 | ~31 (decisions 역사 DEC / CHANGELOG / dist/internal-v* 4) | ★ 보존 (silent 재작성 ❌ / LL-i-52) |

### 1.3 선례 비교 (LL-i-56 정합 — 선례 관성 ❌ / 실측 tier 판정)

①(property canonical/MAJOR) ②(표현/MAJOR) Q-①-followup(property rename/MINOR=zero consumer atomic). ⑦ = ★ 파일명 rename = **모든 PoC + tooling resolution + 사용자가 rules.json 찾던 전 경로** 영향 → consumer 분포 = broad / breaking 성격 = 산출물 계약 자체 변경.

## 2. 사용자 결단 후보 (3-에이전트 full research 후 확정)

- **D1 version** — ⑦ = 산출물 파일명 = 계약 변경. 외부 consumer 0 (dogfooding) BUT 전 PoC·tooling·문서 영향 = broad internal. LL-i-56 실측 tier 판정 = **v7.0.0 MAJOR** 후보 (Q-①-followup zero-consumer MINOR 와 대조 — ⑦ 은 11 PoC + resolution 영향 broad). official-docs semver 확정 의무.
- **D2 schema 파일명** — Option A (`rules.schema.json`→`business-rules.schema.json` 동시 rename) 권고 (filename resolution 정합). 대안 B($id만 변경/파일명 유지)·C(전 PoC $schema_origin 명시) = 혼란 / Senior 검증.
- **D3 $id 처분** — schema `$id: https://ai-native-methodology/schemas/rules.schema.json` → `business-rules.schema.json` 정합 vs URL-ref 호환 불변. official-docs ($id 변경 영향).
- **D4 역사 보존 범위** — decisions 역사 DEC + CHANGELOG + dist/internal-v* = 보존 (LL-i-52 silent 재작성 ❌). 활성 SSOT (ADR §5 신규 patch / deliverables / skills / 8 schema cross-ref / 최상단) 만 갱신.
- **D5 시행 mechanism** — 252 files per-file Edit ❌ 비현실 / ① bulk script = auto-mode classifier 차단 선례. git mv 12 = 명령 / 코드·schema cross-ref·활성 SSOT = 분류별 신중 Edit / 역사 보존분 = 무수정. ★ classifier 우회 ❌ — Senior mechanism 검증.
- **D6 cooling-off** — memory "별도 집중 session + cooling-off 권고" (⑦ 최대 blast). 사용자 명시 결단 (①②④Q-followup 동형 생략 vs ⑦ 특별 cooling-off).

## 3. 시행 절차 (사용자 승인 후 / Senior mechanism 확정 후)

1. dry-run — 산출물 rules.json 물리 11 + rules.schema.json 1 = 12 git mv 대상 재확인 / $schema_origin 보유 PoC 정량 (no-simulation)
2. git mv 12 (PoC 11 + schema 1)
3. PoC $schema_origin/$schema/$schema_ref 값 갱신 (11)
4. 코드 수정 (findings-aggregator:83 + br-cross-consistency-validator usage + planning-extraction-validator + release-readiness discoverPoc*)
5. schema cross-ref 8 + 활성 SSOT ~14 갱신 / 역사·archive 보존 무수정
6. 회귀 — 전 11 PoC schema-validator VALID (resolution 정합) + workspace 전수 + release-readiness 11/11
7. 문서 — DEC + ADR §5.13 patch v16 + §9 LL + CHANGELOG + INDEX + plugin.json + CLAUDE.md + STATUS

## 4. 위험 / STOP (Senior REVISE-3 반영)

- **STOP-1 → advisory 강등** (Senior): 10/11 PoC fallback path 3 = git mv + schema rename 후 auto-correct / poc-04만 value-edit. blocking ❌ → post-mv dry-run checklist (`schema-validator examples/ --json` = 11/11 VALID 기대).
- **★ ★ STOP-3 (신규 / Senior — 실제 fragile resolution)**: hardcoded literal 3곳 (`findings-aggregator/src/cli.js:83` + `release-readiness.js:111`,`:266`) = literal-filename resolution. ★ post-rename **workspace test + release-readiness 11/11 통과 or revert** = hard go/no-go gate (코드 착수 후 즉시 검증 / LL-i-53·55 실측 paradigm).
- **STOP-2 mechanism → CONCUR+제약** (Senior): bulk sed/script ❌ (① auto-mode classifier 차단 선례 / §2 no-simulation discipline). 안전 = git mv 12 명령 + 분류별 Read-then-Edit (classifier gate 보존) + 역사/archive 무수정. 252 = 과장 (대부분 doc prose / classification-bounded).
- LL-i-56 정합 — version tier = ①② MAJOR 관성 ❌ / ⑦ 실측 (artifact contract + hardcoded literal consumers = Q-①-followup property/zero-consumer 와 결정적 차이) → **v7.0.0 MAJOR sound** (Senior CONCUR / official-docs public API 선언 시 MAJOR / industry 파일명 rename=MAJOR 우세).
- process: ★ **1-session 시행 (Senior) / 별도 cooling-off session 불요** — grep 실측으로 de-risked (auto-correct dominant) / LL-i-54 cost asymmetry = hot context 완료 / memory cooling-off = unvalidated breaking 한정 (본 건 validated). 단 **post-mv dry-run hard gate 필수**.

## 5. 다음 단계

4원칙 2단계 — 3-에이전트 full research (official-docs schema $id/resolution+semver / industry-case 산출물 파일명 rename 관행 / Senior schema resolution + mechanism critique + STOP) → research.md → 사용자 결단 (D1~D6) → 3단계 승인 후 시행.
