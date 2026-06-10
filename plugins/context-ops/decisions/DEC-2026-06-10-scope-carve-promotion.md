# DEC-2026-06-10-scope-carve-promotion

**결단**: 역공학 델타 #1 **scope-carve** 를 draft → **official(corroborated)** 격상. §8.1 ≥2 distinct 도메인 corroboration 충족 + Phase-1 명시 carry(co-change target-with-history live) 해소. 격상 수준 = **"official / 대형 코드베이스 conditional 권장"** (전면 MANDATORY ❌ — carving 은 대형에만 의미 / sql-inventory rdb_only conditional 선례 동형). trust 모델 **불변**(reference-lens / gate inject ❌ / chain-driver 무수정 유지).

**작성일**: 2026-06-10 (사용자: "검증해보자" → ep-be-gea 4신호 live → "B caveat 해소"(정식 architecture.json) → "A 격상 착수").

**version**: plugin.json 0.26.0 → 0.27.0 (MINOR — draft→official 격상 / 기능·trust 무파괴).

**relates to**:
- `DEC-2026-06-09-scope-carve-3signal-reference-lens` (모 / Phase 2 격상 gate 상속 — 본 DEC 가 그 §Phase 2 시행)
- `DEC-2026-06-10-scope-carve-candidates-dedup` (scope-carve→scope_candidates 일원화 / v0.26.0)
- `ADR-CHAIN-016` (scope_candidates / 교차검증 대상)
- memory `feedback_quality_priority`(§8.1) · `feedback_codegraph_step_dogfood_examples`(self-repo dogfood leg 인정) · `feedback_research_fact_validation`(정직 per-signal 표기) · `feedback_diagnose_before_design_check_existing`

---

## 1. §8.1 corroboration 증거 (2 distinct 도메인)

| 신호 | poc-01 (소형 legacy Spring) | ep-be-gea (대형 modern Spring / 6307 Java) | 판정 |
|---|---|---|---|
| **SCC** | atomic cycle 1 (circular_deps 일치) | 137/262 모듈 단일 cycle | ✅ 2 외부 도메인 |
| **Martin Ca/Ce/I** | sink/hub role 타당 | hub 상위 = cache/base/utils (shared 태그) | ✅ 2 외부 도메인 |
| **co-change** | (target `.git` 부재) | mined 49 pair / **13,137 commit / real_tool** | ✅ self-repo(Phase1) + **ep-be-gea = 첫 external target-with-history** → **carry 해소** |
| **hotspot** | (Phase1 self/synthetic) | mined / resve 최상위 | ✅ self + ep-be-gea |

- **정직 carry**: co-change·hotspot 의 2번째 *external* target-with-history 는 ep-be-gea 단일(+self-repo). 추가 external 대형 target 1개 더면 완전. SCC/Martin 은 2 외부 clean.

## 2. caveat 해소 (B / 정식 architecture.json)

1차 검증은 codegraph 합성 architecture(layer=대표값)였으나, **analysis-architecture skill 절차로 정식 재생성**: 실 layer detect(path `/domain//application//infrastructure/`) → domain 62·application 77·infrastructure 62·presentation 11·shared 28·cross-cutting 22 / **violates_layer 100건**(clean-arch inward 위반 1급 기록) / circular SCC. → SCC·Martin 입력 caveat 해소.

## 3. 교차검증 — 독립 신호 수렴 (격상 핵심 근거)

정식 architecture 의 `violates_layer`(application→infrastructure 위반) 최악 = **wlfr 449·req 306**·biztrip 266. 이게 ADR-CHAIN-016 의 `scope_candidates` 가 codegraph coupling 으로 독립 표시한 **`decay_grade=entangled`(wlfr·req)** 와 **수렴**. 서로 다른 방법(coupling 카운트 vs layer 위반)이 같은 feature 를 최악 decay 로 지목 = scope-carve 신호 ROI 실증. Martin hub ↔ scope_candidates#shared-kernel 도 독립 일치(cache/base/utils).

## 4. 격상 내용

- **수준**: draft → **official / 대형 코드베이스 conditional 권장** (전면 MANDATORY ❌). soft gate #0 evidence 역할·reference-lens·chain-driver 무수정 **불변**.
- de-draft: `skills/analysis-scope-carve/SKILL.md`(1차 draft 문구) + `flows/analysis.phase-flow.json`(aspect note) → corroborated.
- lifecycle-contract: scope-carve official aspect 등재 (대형 conditional / reference-lens).
- version/CHANGELOG: 0.26.0→0.27.0.
- **불변**: tool 코드·schema·38 test 무변경 / artifact-graph 노드 모델 무변경(scope-carve = code-graph 동형 reference-lens → 그래프 노드 아님 유지 / scope_candidates 경유 연결).

## 5. 정직 carve (격상 후 잔존)
- co-change·hotspot 2nd external target-with-history carry (위 §1).
- architecture.json = codegraph-grounded 결정론 생성(LLM 분석 아님 / 더 엄밀하나 입력 granularity = feature×layer 선택).
- ep-be-gea = 사내 소스 / 외부격리 / commit ❌ / 본 DEC 가 마스킹 corroboration 기록(수치만).

## 인용
- DEC-2026-06-09-scope-carve-3signal-reference-lens(모/§Phase 2) · DEC-2026-06-10-scope-carve-candidates-dedup · ADR-CHAIN-016 · DEC-2026-06-09-reverse-eng-methodology-gap
- memory: feedback_quality_priority(§8.1) · feedback_codegraph_step_dogfood_examples · feedback_research_fact_validation · feedback_internal_source_poc_external_location
