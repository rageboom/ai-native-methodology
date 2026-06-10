# DEC-2026-06-10-subset-slicing-corollary-supersede

**결단**: `DEC-2026-06-07-subset-retire` 의 corollary — "scope 슬라이스 = `chain-driver/src/work-unit.js` `subsetAnalysisRefs(canonical, prefixes)` in-memory 참조 필터 / 제거 금지" — 를 **supersede**. 해당 dead 함수를 **retire**(work-unit.js). scope 슬라이싱(context-reduction prefix 필터)은 코드에 실재한 적 없고(호출처 0 / 미배선), 실 슬라이싱은 더 정밀한 두 축 — **drift = `hashBusinessRulesSubset`(bounded_context 필터 / v0.14.0)** + **validation 분모 = discovery-extraction-validator scope-token(v0.30.0)** — 이 담당한다. 본 supersede 는 corollary 한정 — subset-retire 의 **본 결단(`*.subset.json` 파생사본 폐기 → canonical global 단일 SSOT)은 유효·불변**.

**작성일**: 2026-06-10 (사용자 결단: "living-sync subset-precision 진행하자" → 1원칙 조사가 obviation 포착 → "retire + DEC supersede" 채택).

**relates to**:
- `DEC-2026-06-07-subset-retire` (corollary 정정 대상 / 본 결단 유효)
- `DEC-2026-06-07-living-sync-operating-model` §14 (subset-precision "grounded" 주장 = pre-v0.14.0 stale / merge-back obviation 동형)
- `feedback_diagnose_before_design_check_existing` (갭 후보 액면수용 금지 — 이미 해소됐나 실측)
- `feedback_quality_priority` (§8.1 단일 PoC 과적합 회피 — trigger 부재 일반화 거부)

---

## 1. 배경 — stale 추천이 obviated 작업을 가리켰다

`STATUS.md` "다음 의제" 가 **subset-precision(`subsetAnalysisRefs` 활성화 / 추천)** 을 grounded 잔여로 제시(작성 2026-06-03~07). 1원칙 전수 조사 결과 = **v0.14.0 이전 작성 stale**:

- subset-precision 의 근거 = §14 multi-scope dogfood 가 측정한 FP **단 1건**(BC-POST 전용 rule 변경 → 무관 scope-user 도 `business-rules.json` file-hash drift). domain.json 공유 drift(시나리오 A)는 "정당"으로 판정 = FP 아님.
- 그 측정 FP 는 **v0.14.0 `hashBusinessRulesSubset`**(bounded_context 필터)가 해소 + `sync.test.js:288-294`("BC-POST 변경 → BC-USER subset 불변")에 회귀 가드 박제. 커밋 순서 `fe0aac0b`(§14) → `a235df32`(v0.14.0) 확정.
- merge-back 이 v0.3.0+3a 로 obviated 된 것과 **동형 패턴**.

## 2. 결정 내용

1. **`subsetAnalysisRefs` 함수 retire** — `work-unit.js` 에서 제거(주석 NOTE 로 retire 사유 + 실 슬라이싱 축 포인터 대체). 호출처 0 / import 0 / re-export 0 (Senior 적대검증 GO@0.93 / `npm test` 516 무회귀).
2. **`analysis_refs` 필드는 KEEP** — dead 가 아닌 load-bearing: `query.js --ref` 역인덱스 / **db-assets-validator**(RR #23 게이트) `analysis_refs.db_*` / **findings-aggregator** `analysis_refs.artifacts`(gate #0 경로해석) / `task-plan.schema` 가 소비. 필드 ≠ 함수.
3. **doc 정합 정정** — `subsetAnalysisRefs` 를 "scope 슬라이싱 메커니즘"으로 서술한 문서를 **"슬라이싱 = BC-subset-hash(drift) + scope-token(validation 분모) / scope 는 canonical full 참조"** 로 정정(삭제 ❌·정정 ✅): baseline-delta-operating-model · lifecycle-contract · living-sync-operating-model · ADR-CHAIN-016 · DEC-living-sync(§14 등) · DEC-scope-candidate-recursive-carve · INDEX · STATUS(추천 줄 제거).
4. **subset-retire 본 결단 유지** — `*.subset.json` 폐기 → SSOT 단일 = 불변(과잉 supersede 금지).

## 3. 검증 / 영향

- 코드: work-unit.js 함수 13줄 제거(주석 대체). chain-driver `npm test` **516 무회귀**. release-readiness 무회귀.
- §8.1: 신규 메커니즘 채택 ❌ = dead-code 정리 + stale 추천 재발 차단. 측정(poc-18 §14 FP→BC-hash 해소)에 근거. 과적합 무관 / PATCH.
- diagnose-before-design 선례 누적: 갭 후보(subset-precision)를 액면수용했으면 이미 해소된 능력을 prefix 필터로 재발명할 뻔(재작업) → 1원칙 실측이 차단.

## 4. Non-goal

- `analysis_refs` 필드 제거 아님(load-bearing).
- domain/db-schema/openapi 의 BC-scoped drift 일반화 = **trigger 부재 → 빌드 ❌**(측정되면 그때 BC-hash 일반화 / "실 trigger 우선").
- subset-retire 본 결단(SSOT 단일) 번복 아님.
