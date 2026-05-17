# DEC-2026-05-17-q7-rules-json-rename

- **상태**: 승인 (★ ★ ★ 사용자 "추천안 묶음 + 1-session 시행" / 4원칙 full + STOP-3 hard gate / v7.0.0 MAJOR)
- **일자**: 2026-05-17 (★ session 26차 연속 / v7.0.0 MAJOR / cooling-off 사용자 명시 생략 — Senior validated)
- **결정자**: 윤주스 (TF Lead) — 사용자 "하자" → ⑦ 단독 진입 → "추천안 묶음 + 1-session 시행"
- **관련**: DEC-2026-05-17-q1-alias-4중첩-폐기 §외부 carry (⑦ origin) / DEC-2026-05-17-q1-followup-rename (직전 v6.1.0) / ADR-CHAIN-011 §5 patch v16 + §9 LL-i-57 / ★ 묶음 Q 완결

---

## 컨텍스트

묶음 Q 마지막 잔여 ⑦ = 산출물 파일명 `rules.json` → `business-rules.json` rename (BR=business rule 명확화). 최대 blast (642 occ / 252 files). ①②④⑤+Q-①-followup 종결 후 사용자 "하자" → ⑦ 단독 + "4원칙 plan+research 착수" → research 후 "추천안 묶음 + 1-session 시행".

## 결정

### §1. 사용자 결단 (추천안 묶음 / D1 사실 확정)

| D | 결단 | 근거 (3-에이전트 수렴) |
|---|---|---|
| D1 version | ★ **v7.0.0 MAJOR** (사실 확정 / choice ❌) | official-docs(파일명=계약 처우 시 MAJOR / $id 파일경로 독립) + industry(파일명 rename=MAJOR 우세 / 외부 consumer 0 = 즉시 MAJOR 가장 가벼움 / ESLint v9 phased=외부 consumer 비례 / dogfooding 유예 근거 없음) + Senior CONCUR(artifact contract surface + hardcoded literal consumer = Q-①-followup MINOR 와 결정적 차이 / LL-i-56 real-tier) |
| D2 schema 파일명 | Option A (`rules.schema.json`→`business-rules.schema.json` 동시 rename) | inferSchemaName 3경로 정합 (regex `[a-z0-9-]+` 하이픈 수용) |
| D3 $id | `$id` → `business-rules.schema.json` 정합 변경 | official-docs — 다른 schema 가 rules.schema.json `$ref` ❌ ($comment·description 텍스트만) → $id 변경 영향 0 / 파일명+$id 일관 |
| D4 역사 보존 | decisions 역사 DEC + CHANGELOG + dist/internal-v* 무수정 / 활성 SSOT(ADR §5 신규 + 7 schema cross-ref + deliverables 5 + skills + 최상단) 갱신 | LL-i-52 silent 재작성 ❌ / industry "왜 vs 어디" 분리 |
| D5 mechanism | git mv 12 명령 + 분류별 Read-then-Edit + 역사 무수정 (sed/script ❌) | Senior 제약 (① bulk script auto-mode classifier 차단 선례 / §2 no-simulation discipline) |
| D6 process/cooling-off | 1-session 시행 (cooling-off 별도 session 불요) + ★ STOP-3 post-mv hard gate | Senior(grep 실측 de-risked / LL-i-54 hot context / memory cooling-off=unvalidated 한정 / 본 건 validated) |

### §2. 시행 (v7.0.0 MAJOR / breaking)

- **git mv 12**: 11 PoC rules.json → business-rules.json + schemas/rules.schema.json → schemas/business-rules.schema.json (history-preserving R)
- schema $id `https://ai-native-methodology/schemas/business-rules.schema.json` + title/description v7.0.0 갱신
- PoC schema key (Senior REVISE-3 실측): poc-04 `$schema_origin` value-edit + poc-01/02/03 `$schema_ref` honesty + 7 무키 fallback auto-correct
- 코드 literal 3곳: findings-aggregator/src/cli.js:83 (`input/business-rules.json`) + release-readiness.js:111 (poc-05 path) + :266 (`e.name==='business-rules.json'`)
- ★ ★ STOP-3 검출 동반 수정: 6 test 파일 hardcoded `rules.schema.json`/`rules.json` literal (drift-validator 3 + schema-validator 2 + br-cross #06 guard) — plan/research 누락 → 동반 치환
- 7 schema cross-ref description "rules.json"→"business-rules.json" (ajv inert) + deliverables/5 + skills 활성 SSOT
- ADR-CHAIN-011 §5 patch v16 + §9 LL-i-57 + CHANGELOG v7.0.0 + INDEX 최상단 + plugin.json 6.1.0→7.0.0 + CLAUDE.md + STATUS

### §3. ★ ★ STOP-3 hard gate (방법론 가치 본격 입증)

post-mv hard gate (schema-validator 11 PoC + workspace + release-readiness 11/11 or revert) 가 ★ **plan/research(Senior REVISE-3 포함 3-에이전트) 가 모두 놓친 consumer 검출** — 6 test 파일 hardcoded schema/file literal (ENOENT 9+). 사용자 결단 = 근본 결함 ❌ (test=활성 자산 / ⑦ 정당한 일부) → 동반 치환 → 재검증 통과. ★ LL-i-55 paradigm ("research 수렴만으로 코드 착수 ❌ / 실측 hard gate 가 누락 검출") 본격 입증.

## 회귀 검증

- schema-validator 11 PoC 전수 VALID (business-rules.json → business-rules.schema.json resolution 정합) + workspace **393/393** + release-readiness **11/11** + chain harness validated 본질 보존
- breaking ✅ (의도 v7.0.0 MAJOR / semver 정합) / 역사(decisions/CHANGELOG/dist) 무수정 (LL-i-52)

## ★ 묶음 Q 완결

①(v5.0.0 alias)②(v6.0.0 표현)④(v4.1.1 severity)⑤(v4.1.0 cross_consistency)+Q-①-followup(v6.1.0 rename)+**⑦(v7.0.0 파일명 rename)** = ★ 묶음 Q **전 항목 종결**. 잔여 carry = C-poc08-drift / C-cross-consistency-validator-inline-emit / C-adr-chain-011-§11-후속-list-sync / C-poc05-haiku-retrospect (묶음 Q 외).

## Lessons Learned 등재 (★ session 26차 / ADR-CHAIN-011 §9)

- **LL-i-57** — "파일명 rename = artifact contract 변경 = MAJOR (property rename/MINOR 와 version tier 분리 / LL-i-56 확장). ★ ★ 단 비표준 filename-based resolution 의 fallback 자동정합 비중 + hardcoded literal consumer(특히 ★ test 코드) 를 코드 착수 전 grep 만으로 완전 식별 불가 — research 수렴(Senior 3-에이전트 포함)도 src-만 보면 test literal 누락. post-mv hard gate(STOP-3) 가 실측으로 누락 검출 = 방법론 hard gate 의 본격 가치 (LL-i-55 'research 수렴 ≠ 코드 착수 충분' 확장). 처분 = 근본 결함 vs 식별 누락 동반수정 구분 → 후자는 revert ❌ 동반 치환 (test=활성 자산 / 역사 보존 ❌)."

## 출처

- official-docs (`_base-official-docs-checker`) — $id 파일경로 독립 VERIFIED / 파일명 resolution 비표준 VERIFIED / semver 파일명=계약 시 MAJOR (프로젝트 선언)
- industry-case (`_base-industry-case-researcher`) — ESLint v9 파일명 rename=MAJOR / 외부 consumer 0=즉시 MAJOR 가장 가벼움 / codemod 자동화 통념 (단 본 레포 classifier 제약 우선) / "왜 vs 어디" 역사 분리
- Senior critique (`_base-senior-engineer`) — REVISE-3 (schema key 실측 정정 3/1/7 / D1 MAJOR CONCUR / D5 script ❌ 제약 / STOP-3 신규 / 1-session validated) + caveat close round
- STOP-3 hard gate 실측 — schema-validator 11 PoC + workspace 393/393 + release-readiness 11/11 (누락 6 test 동반 치환 후 통과)
- plan = `.claude/plans/plan-q7-rules-json-rename.md` / research = `.claude/research/research-q7-rules-json-rename.md`
