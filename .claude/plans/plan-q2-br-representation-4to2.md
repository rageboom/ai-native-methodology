# plan — 묶음 Q ② BR 표현 4종 → 2종 단일화 (breaking)

> 4원칙 1단계 산출. session 26차 (2026-05-17). 선행 = (A) stale drift 정정 완료.
> ② = breaking change → 별도 plan + 3-에이전트 research + Senior critique + 사용자 결단 의무 (CLAUDE.md / cooling-off 권고).
> 선례 = v5.0.0 묶음 Q ① alias 4중첩 폐기 (DEC-2026-05-17-q1-alias-4중첩-폐기 / ADR-CHAIN-011 §5.10 patch v13).

## 0. 한 줄 정의

BR(business rule) 의 "표현(representation)" 으로 인정되는 형식 **4종 → 2종**:

| | 형식 | 처분 |
|---|---|---|
| 1 | `given`/`when`/`then` (GWT) | ✅ **유지** (v1.x 공식 표준 / chain 3·4 자동 생성 친화) |
| 2 | `natural_language` (NL) | ✅ **유지** (v2.5.0 Phase A 권장 / Layer 2 LLM cross-validation 대상) |
| 3 | `description` (단독) | ❌ **BR 표현 자격 박탈** (property 자체는 v2.5.0 부터 이미 optional metadata 격상 — anyOf branch 만 제거) |
| 4 | `trigger`/`condition`/`action` (TCA) | ❌ **폐기** (anyOf branch 제거 + property 처분은 D2 결단) |

핵심 = `business_rules[]` 의 모든 BR 은 **GWT 또는 NL 중 ≥1 보유 의무**. description 단독·TCA 단독 = INVALID (hard reject).

## 1. 깊은 숙지 — 현 schema 구조 (실측 / rules.schema.json)

`$defs.businessRule` (line 90~488):
- line 93~101 `anyOf` [ name | title ] — **② 무관** (불변)
- line 102~161 `allOf` — ② 핵심은 **첫 원소만**:
  - **원소1 (line 103~122)** `anyOf` 4 branch = GWT(105~108) / NL(109~112) / description(113~116) / TCA(117~120) → **★ ② 대상: 4→2**
  - 원소2 (123~140) `auto_extracted` if/then (③ v4.0.1) — 불변
  - 원소3 (141~150) `is_intent=true ⇒ classification='intent'` (⑤ v4.1.0) — 불변
  - 원소4 (151~160) `is_intent=false ⇒ ≠'intent'` (⑤ v4.1.0) — 불변
- line 162 businessRule 전체 `description` 텍스트 — "cross-validation 대상 = NL ↔ GWT **ONLY**" 이미 명시 → ② 와 정합 (텍스트 갱신 only)
- properties: `description`(181~184 / 이미 optional metadata 격상 / **property 보존**) / `trigger`(308~312) `condition`(313~317) `action`(318~322) `expected_result`(323~327) `rejection_method`(328~331) `verification_location`(332~336) = TCA 계열 → **D2 결단 대상**

→ ① (anyOf 3분기 폐기 + alias property 제거 + additionalProperties:false) 와 **동형 패턴**. ② 는 alias 가 아니라 "표현 자격" 축소이나 schema 메커니즘(allOf 원소1 anyOf 축소)은 동일하게 결정적.

## 2. PoC 영향 실측 (Explore 조사 + 추가 검증 필요)

| PoC | 현황 | ② 시행 영향 |
|---|---|---|
| #06 (Spring4.1+iBATIS2 EFI-WEB) | **7 BR 전부 description-only** (NL/GWT 0) | ★ **NL+GWT 합성 의무** (Sprint 2 isomorphic / Sonnet 4.6 sub-agent batch). 회계(IFRS 환율) 도메인 + description 안 rationale 혼재 → 순수 BR 만 추출 risk. **최대 위험 포인트** |
| #03 (RealWorld NestJS) | TCA 필드 다수 BUT 이미 GWT+NL 양쪽 보유 (output/rules) | TCA property 제거만 → BR 표현 무손상 (D2 = property 제거 시 poc-03 Edit) |
| #05 | desc-only 잔존 가능성 (검증 의무) | ★ dry-run 실측 필수 |
| #08·#10·#11 | desc/TCA 혼재 가능 (Sprint 2 에서 일부 dual 합성됨) | 잔존분 검증 의무 |
| #01·#02·#04 | 정규화 완료 (GWT/NL) | 최소~무영향 |

★ ★ **STOP-1 의무 (① poc-04 precedent / LL-i-53)**: 코드 착수 전 전 11 PoC 대상 "description-only BR / TCA-only BR" 잔존 수를 grep 실측 → 합성 의무 BR 총량 + 회귀 vs 개선 사전 확정. 실측 없이 schema 변경 ❌.

## 3. blast radius (Explore 정량 / 검증 필요)

- schema 핵심: `schemas/rules.schema.json` (allOf 원소1 anyOf 4→2 + line 162 텍스트 + D2 시 TCA property 7종)
- tools: `br-cross-consistency-validator`(extractRules / description fallback 로직) · `drift-validator`(canonical guard test 추가) · `schema-validator`(chain-schemas test 갱신)
- PoC 데이터: #06 합성(대) + #03·#05·#08·#10·#11 검증/Edit
- 문서: ADR-CHAIN-011 §5.11 patch v14 + §9 LL + deliverables/5-business-rules.md + glossary-ko + CHANGELOG + plugin.json + CLAUDE.md + STATUS + DEC + INDEX
- 정량 추정: 20~25 파일 + test 10~15 (① = 387 test / 동급 예상)

## 4. 사용자 결단 후보 (3-에이전트 research 후 확정 / 추천안 묶음)

- **D1 description property** — (권고) anyOf branch 만 제거 / property 는 optional metadata 로 **보존** (v2.5.0 이미 격상 / 사람 눈·characterization context). 대안: property 도 제거(과격 / 회귀 큼).
- **D2 TCA property 7종** (`trigger`/`condition`/`action`/`expected_result`/`rejection_method`/`verification_location`) — (A) anyOf branch + property 모두 제거 (additionalProperties:false hard reject / poc-03 Edit 동반 / ① 동형) vs (B) anyOf branch 만 제거 + property 는 deprecated optional 보존 (회귀 0 / 단 "표현 자격 박탈" 느슨). 권고 = research 후.
- **D3 poc-06 7 BR 합성 paradigm** — Sonnet 4.6 sub-agent batch (Sprint 2 isomorphic) + source_grounded_evidence 활용 + Layer 2 ≥0.7 gate + Senior review. (대안: 사람 수동 / 비용 큼)
- **D4 version** — ① = v5.0.0 MAJOR. ② = breaking(표현 자격 박탈) → **v6.0.0 MAJOR** 사실 확정 후보 (official-docs semver 검증 의무).
- **D5 cooling-off** — ① 은 사용자 "지금 시행" 명시로 생략. ② 도 동일하게 의도 확인 의무 (관성 시행 ❌).
- **D6 ②⑦ 동시 vs ② 단독** — ⑦(rules.json→business-rules.json rename / 265 file) 은 별도. ② 단독 권고 (① 도 단독이었음 / blast 분리).

## 5. 시행 절차 (① 동형 / 사용자 승인 후)

1. STOP-1 dry-run 실측 (전 11 PoC desc/TCA-only 잔존 grep + 합성 의무 BR 목록 + 회귀/개선 판정)
2. schema 변경 (allOf 원소1 anyOf 4→2 + line 162 텍스트 + D2 결단 반영)
3. PoC 마이그레이션 (#06 합성 = Sonnet 4.6 batch / #03·#05·#08·#10·#11 Edit per-file / bulk script ❌ auto-mode 차단 → per-file 안전)
4. tool 정규화 (br-cross-consistency-validator extractRules description fallback 제거)
5. test (chain-schemas alias→REJECT 전환 + drift-validator canonical guard 신규 + functional 모순 거부 입증 / ① = 6 신규 동급)
6. 문서 (ADR §5.11 patch v14 + §9 LL-i-54± + DEC + INDEX + CHANGELOG + plugin.json bump + CLAUDE.md + STATUS + deliverables + glossary)
7. 회귀 = workspace test 전수 + release-readiness 11/11 + breaking ✅의도 + chain harness validated 본질 보존

## 6. Lessons Learned (작업 중 갱신 / 실패 시 revert + 1원칙 재시작)

- (예정) LL-i-54± : 묶음 Q ② = "표현 자격 축소" = alias 폐기(①)와 schema 메커니즘 동형이나 PoC 데이터 합성 비용은 ① ≫ 비대칭 (#06 7 BR 도메인 합성) — STOP-1 dry-run 으로 합성 총량·품질 risk 사전 정량 의무.

## 7. 다음 단계

4원칙 2단계 — 3-에이전트 research (official-docs / industry-case / Senior) 가벼운 sub-agent 병렬 → research.md → 사용자 결단 (D1~D6 추천안 묶음) → 3단계 승인 후 시행.
