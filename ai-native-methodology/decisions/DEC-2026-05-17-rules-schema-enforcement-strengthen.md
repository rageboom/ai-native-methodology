# DEC-2026-05-17-rules-schema-enforcement-strengthen

- **상태**: 승인 (★ ★ ★ 사용자 결단 4건 / research 후 / additive only)
- **일자**: 2026-05-17 (★ session 22차 / v4.0.1 PATCH)
- **결정자**: 윤주스 (TF Lead) — 사용자 prompt "추천으로 해줘"
- **관련**: ADR-CHAIN-011-BR-dual-representation-paradigm §5 patch v11 / DEC-2026-05-17-v4-multi-agent-paradigm-채택 (직전 v4.0.0 MAJOR)

---

## 컨텍스트

paradigm 안정점 (v3.6.x / v4.0.0 MAJOR multi-agent 본격 채택) 직후 사용자 의제 — `rules.json` 보완할 부분 질의 → 7가지 보완점 식별 → 추천 묶음 (③+⑤+⑥ / additive only) 1순위 → 사용자 결단 "추천으로 해줘" → Work Principles 4원칙 진입 (plan.md + 3-에이전트 research + 사용자 결단 prompt + 시행).

3-에이전트 research 결과 (★ ★ ★ ★ 중대한 발견 3건):

1. **Senior REVISE** — ⑤ inline 보존 시기상조 (PoC 3/14 적용 / ≥ 7 PoC 도달 후 재평가) + ⑥ SSOT 위반 risk (duplicate enum 재선언 차단 의무)
2. **official-docs CONTRADICTS 2건** — characterization-spec.schema.json 안 "Gherkin tag 표준" (H-1 표기 오류) + "per Maldonado & Shihab 2015" `self_recognized` 분류명 (H-2 인용 오류 / 논문 안 SATD 5 분류 = design/defect/documentation/test/requirement)
3. **Industry case 정합 4/4** — ③ source-grounded required 산업 default (Semgrep + CodeQL + SonarQube + Daikon) + ⑤ inline vs 분리 패턴 분기 (CodeQL inline / Spec-Kit specs/ 분리 / 단일 정답 ❌) + ⑥ schema 통합 precedent 부재 (novelty)

---

## 결정

### §1. 사용자 결단 4건 (research 흡수 후)

| # | 결단 | 채택 | 근거 |
|---|---|---|---|
| #1 ⑤ cross_consistency_check inline | **carry** | Senior REVISE — PoC 적용률 3/14 (21%) / ≥ 7 PoC 50% 도달 후 재평가 / Industry case 패턴 분기 |
| #2 ⑥ SSOT | **공유 $ref schema 신설** | Senior REVISE — schemas/intent-classification.schema.json 신설 + drift-validator cross-schema enum 정합 check |
| #3 ③ source_grounded_evidence + PoC 처리 | **auto_extracted=true 한정 + PoC optional** | Industry case 4/4 정합 / 14 PoC 회귀 풀이 0 (auto_extracted=true BR 부재 = vacuous) |
| #4 H + ADR + 버전 | **H 함께 + ADR-CHAIN-011 patch + v4.0.1 PATCH** | additive only / 사실 부정확 동시 수정 paradigm |

### §2. 시행 (★ 본 sprint 진입)

- **③ source_grounded_evidence enforcement 강화** — schemas/rules.schema.json businessRule.allOf 안 if/then 신규 블록 (auto_extracted=true → source_grounded_evidence 또는 source_evidence required)
- **⑥ intent_vs_bug_classification SSOT 신설** — schemas/intent-classification.schema.json 단일 SSOT enum 4종 + rules.schema.json + characterization-spec.schema.json 양쪽 $ref + drift-validator 신규 unit test 5건
- **H-1** — characterization-spec.schema.json line 99 "★ Gherkin tag 표준" → "Cucumber Gherkin 도구 관례" 표기 수정 (Cucumber 공식 spec 안 tag 의미 표준화 ❌ 사실 흡수)
- **H-2** — characterization-spec.schema.json line 128 "SATD/KL-SATD per Maldonado & Shihab 2015" 인용 오류 수정 (intent-classification.schema.json $comment 안 본격 명시 — SATD 개념 차용 / 분류명 자체는 본 방법론 고유 합성)
- **ADR-CHAIN-011 §5.8 patch v11 신설** — 본 결단 본격 명세
- **methodology-spec/deliverables/5-business-rules.md** — §4.1 v4.0.1 schema enforcement 강화 섹션 + v4.0.1 예시 추가
- **drift-validator** — package.json v0.4.0 → v0.4.1 + 신규 test 5건 추가 (57/57 pass)
- **CHANGELOG + INDEX 등재 + plugin.json v4.0.0 → v4.0.1 + CLAUDE.md 직전 release 요약 갱신**

### §3. 본 sprint 외부 carry (★ 큰 구조 결단)

- **① alias 4중첩 폐기** — v4.1.0 MINOR 후보 / breaking change + 14 PoC 마이그레이션 script + 별도 plan + Senior critique + 사용자 결단 의무
- **② BR 표현 4종 → 2종 단일화** — v4.1.0 MINOR 후보 / breaking change / description = optional metadata 격하 + trigger/condition/action 폐기
- **④ severity cross-stage mapping table** — 별도 plan 의무 / rules.json (5종 critical/high/medium/low/info) ↔ acceptance-criteria.json (3종 MoSCoW) ↔ ratchet (4종) 정합 매핑
- **⑤ cross_consistency_check inline 보존** — PoC 적용률 ≥ 50% (≥ 7 PoC) 도달 후 재평가 / inline vs 분리 결단 별도 sprint
- **⑦ `rules.json` → `business-rules.json` rename** — v4.1.0 MINOR 후보 / skill `analysis-business-rules` + ID prefix BR-* + DMN 산업 표준 정합 / cosmetic ❌ / cross-ref 치환 다수

---

## 회귀 검증 (★ chain harness validated 본질 보존)

- workspace test 회귀 — drift-validator 52 → 57/57 pass (신규 +5)
- schema-validator 회귀 — PoC #05 + PoC #01 valid 보존
- chain harness 5 요소 변경 ❌ (schema additive 영역 한정)
- release-readiness 9/9 strict criterion 보존
- breaking change ❌ / round-trip 영향 ❌
- 14 PoC 회귀 풀이 0 (auto_extracted=true BR 부재 / intent_vs_bug_classification optional)

---

## Lessons Learned 등재 (★ ★ session 22차)

- **LL-i-NN (TBD)** — paradigm 안정점 직후 enforcement criterion 강화 = 자연 흐름 (★ ★ memory `feedback_paradigm_stable_point_cadence` 정합). additive only 묶음이 cooling-off 회피 자격.
- **LL-i-NN+1 (TBD)** — 3-에이전트 research 가 사실 부정확 (Maldonado SATD 분류명 + Gherkin tag 표준 표기) 본격 차단. memory `feedback_no_simulation_realized` 가 양심 의존 → 코드 enforcement 의 다음 한 걸음 = research 단계의 사실 검증 의무.
- **LL-i-NN+2 (TBD)** — Senior STOP signal `REVISE` 흡수 paradigm — 묶음 일부 carry (★ ⑤ 시기상조) + 나머지 진입 (★ ③+⑥ + H) = 묶음 분할 결단 자격. 사실 명확도 ★★★ + 비용 ▲ 양쪽 본격 시 전면 흡수 paradigm 정합.

---

## 출처

- Senior critique (★ `_base-senior-engineer` Task tool dispatch / 2026-05-17 session 22차)
- official-docs cross-check (★ `_base-official-docs-checker` Task tool dispatch / 2026-05-17 session 22차)
- industry-case research (★ `_base-industry-case-researcher` Task tool dispatch / 2026-05-17 session 22차)
- Industry case 정합 4종 (Semgrep semgrep-interfaces / CodeQL SARIF / SonarQube SARIF / Daikon program point)
- official-docs CONTRADICTS 2건 (Cucumber Gherkin Reference / Maldonado & Shihab 2015 SATD 5 분류 ResearchGate)
- 본 결단 plan = `.claude/plans/plan-rules-schema-enforcement-strengthen.md`
