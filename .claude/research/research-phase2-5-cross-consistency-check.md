# research-phase2-5-cross-consistency-check.md

> ★ 4원칙 2단계 — 3-에이전트 병렬 research (가벼운 sub-agent 전략 / 시간 cap 15분 / 결론 중심).
> session 25차 / 2026-05-17 / plan = `plan-phase2-5-cross-consistency-check-inline.md`

---

## §1. Senior (_base-senior-engineer) — VERDICT: CONCUR + 2 조건 / STOP-1 advisory

- **Q1 inline vs 분리 vs 공존** → ★ **옵션 C (공존)**. B = BR 추적성 단절 + drift-validator BR 검증 불가 → F-021/drift enforcement 위배로 부적격. SSOT 오염은 (1) 단일 nested object (2) optional (3) provenance flag 로 완화.
  - **조건 1 (의무)** — nested object 에 provenance discriminator (`generated_by`/`layer`/`model`/`timestamp`) 명시. 기존 `auto_extracted`/`auto_extraction_source_id` provenance 패턴 (rules.schema.json line 346~353) **재사용** (신규 컨벤션 발명 ❌).
- **Q2 schema if/then vs validator-only** → ★ **if/then enforcement**. 기존 `auto_extracted` if/then (line 159~175) 와 구조 동일 = 14 PoC regression-safe 입증된 패턴. validator-only = drift 가 양심 의존으로 전락 (no-simulation 위배).
  - **조건 2 (코드 착수 전)** — 14 PoC 중 `is_intent` ∧ `intent_vs_bug_classification` 동시 보유 BR 수 grep 정량 → §6 row 0. ★ **실측 완료 = both=0** (아래 §4).
- **Q3 version** → ★ **v4.1.0 MINOR**. optional 필드 + if/then = additive API surface 확장 / PATCH 과소표기.
- **Q4 STOP** → hard STOP 없음. **STOP-1 (advisory)** = verdict enum `classification_drift` 추가 = downstream coupling / consumer unknown-verdict fatal 처리 확인 의무. ★ **실측 완료 = fatal 처리 부재** (아래 §4).
- **Q5** → ★ **⑤ 단독**. 묶음 Q(①alias/②BR표현) = 다른 risk profile / 다른 PoC evidence base → 묶음 시 §6 회귀 격리 희석 + blast radius 팽창. ⑤ atomic 유지.
- confidence 0.86 (조건 2 미실측분 / 본 research 에서 해소).

## §2. official-docs (_base-official-docs-checker) — F-015 독립 fetch / 사실 검증

- **Q1 JSON Schema cross-field** → ★ **VERIFIED**. `if/then`+`properties`/`required` = 값 기반 cross-field 제약의 유일 공식 메커니즘 (draft 2020-12). `dependentRequired`/`dependentSchemas` = 존재 기반만 (값 제약 부적합). 양방향 동치 = 2개 if/then 을 `allOf` 묶음. [json-schema.org/understanding-json-schema/reference/conditionals]
- **Q2 SARIF result↔rule** → ★ **VERIFIED**. result 는 `ruleId`/`ruleIndex` 로 분리된 rules[] 참조가 기본 설계. inline `rule` 프로퍼티 = spec 허용되나 **보조적·비필수·비권장**. [OASIS SARIF v2.1.0]
- **Q3 Spec-Kit** → spec 본문/contracts/research/plan 전부 별도 파일 분리 = VERIFIED. 단 "검증 결과 별도 파일" = README 명시 근거 부재 (INSUFFICIENT-DATA).
- **본 plan 가정과 CONTRADICTS = 0** (if/then 패턴 + 분리 우세 = plan 정합).

## §3. industry-case (_base-industry-case-researcher) — 8 사례

- **Q1/Q2 (수렴)** — SARIF·Semgrep·OPA·Spectral **전부** rule 정의(SSOT) ↔ 실행 결과를 파일 레벨 분리. rule object inline = OpenSpec #666 (inline 강제가 schema 유연성 파괴 역사례). ★ ★ **단 핵심 구분**: rule object 는 "실행 결과값" inline ❌ / "rule 의 서술적 속성 (severity·category·CWE·classification)" inline ✅ = Semgrep `metadata:` 표준 패턴.
- **Q3 intent vs bug 분류 보존 강제 precedent** → ★ ★ ★ **precedent 부재 = novelty 확인**. Salesforce(인간 review 의존) / SARIF `suppression.justification`(free-form / enum 강제 ❌) / OpenRewrite(설계 범위 밖) 모두 machine-readable 강제 보존 부재. industry-first claim 보강 (단 샘플 3건 = "반증 부재" 수준).

## §4. ★ ★ ★ 코드 착수 전 실측 (Senior 조건 2 + STOP-1 해소)

```
node 실측 — 11 PoC rules.json 전수:
  both (is_intent ∧ intent_vs_bug_classification) = 0   ← 전 PoC vacuous
  is_intent 단독 = 43 BR (#07·#08·#09·#10·#11 characterization PoC)
  intent_vs_bug_classification 실사용 = 0 (v4.0.1 신설 / 미채택)
verdict/llm_status consumer — switch·throw·fatal-on-unknown 부재 (validator.js:109/115 = evaluated|skipped 만)
```

- **조건 2 해소** — both=0 → `is_intent`⇔`intent_vs_bug_classification` if/then = 14 PoC 수학적 vacuous = **회귀 풀이 0 보장** (Senior regression-safe 입증 완료).
- **STOP-1 해소** — verdict unknown-value fatal 처리 부재 → enum `classification_drift` 추가 = 저위험 (advisory 충족).
- ★ 재해석 — `intent_vs_bug_classification` = 0 채택 / PoC #08 drift 는 `is_intent`/`is_likely_bug` 계층 발생. → "분류 보존 강제" 는 `is_intent`(실사용 43) + `intent_vs_bug_classification`(forward) **양쪽** 커버 의무.

## §5. ★ 종합 결론 — 정제된 옵션 C (slim provenance-tagged inline + 분리 집계 공존)

3 에이전트 + 실측 수렴:
- **분리 (heavy 실행 데이터)** = layer-2-results/poc-NN-*.json 보존 (SARIF·Semgrep·OPA·Spectral 산업 표준 / score·rationale·timestamp dump = 실행 결과 → 분리).
- **inline (slim marker)** = BR 안 `cross_consistency_check` = ★ 최소 필드 (classification 보존 verdict + provenance discriminator + 외부 결과 ref). 산업 정합 근거 = rule object 의 "서술적 속성" inline 은 표준 (Semgrep `metadata:`) / "실행 결과 dump" inline 만 anti-pattern.
- **if/then** = official-docs VERIFIED 패턴 + both=0 vacuous = 무회귀 / 기존 auto_extracted if/then 미러.
- **novelty** = 분류 보존 강제 = industry precedent 부재 → industry-first 보강.

→ plan §2 옵션 C 를 "**정제된 C**" 로 확정 (heavy 분리 + slim provenance inline). 옵션 A(inline only / 실행 데이터까지 BR dump) = 산업 anti-pattern → 비추천. 옵션 B(분리 only) = Senior 부적격.
