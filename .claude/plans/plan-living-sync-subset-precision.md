# plan — living-sync subset-precision (1원칙 조사 → diagnose-before-design 결론)

> 트리거: 사용자 "living-sync subset-precision 진행하자" (STATUS 다음 의제 추천 줄 / 2026-06-03~07 작성).
> 결론(선): **추천 줄은 v0.14.0 이전 작성 stale**. 측정된 FP 는 이미 해소 + 잔여 골격은 obviated. **코드 빌드 ❌ / 정리 or 문서화 결단 대기**.

## 1원칙 — 전수 조사 (실측 / 액면수용 금지)

### 조사 1: STATUS 추천의 근거 = §14 dogfood 측정 FP
- DEC-2026-06-07-living-sync §14: poc-18 2-BC(scope-post/scope-user) tmp dogfood.
  - 시나리오 A: 공유 domain.json 변경 → 양 scope drift = ✅ **정당**(둘 다 domain 의존 / FP 아님).
  - 시나리오 B: BC-POST 전용 rule(business-rules.json) 변경 → scope-user 도 drift = ⚠️ **FP 실측**(coarse file-hash / 파일 공유).
- §14 결론: "subset-precision 이 grounded — subsetAnalysisRefs 활성화가 정당 = Phase 3 잔여 핵심".
- **단, §14 가 측정한 FP 는 오직 business-rules.json 1건.** domain.json(시나리오 A)은 정당 drift 로 판정 = 측정된 FP 아님.

### 조사 2: 그 FP 는 이미 해소됨 (v0.14.0 / 커밋 타이밍 + 가드 테스트)
- 커밋 순서: `fe0aac0b`(§14 dogfood) → `a235df32`(**v0.14.0 S2 drift subset-hash**).
- `sync.js hashBusinessRulesSubset(abs, bcs)` = `bounded_context ∈ bcs` 필터 재hash. registerCanonicalSources/detectDrift/cascade 3곳 공유 SSOT.
- **회귀 가드 테스트 박제됨**: `sync.test.js:288-294` "BC 필터 — BC-POST rule 변경 → BC-USER subset hash 불변" = §14 시나리오 B 그 자체.
- ∴ §14 측정 FP = **DONE (테스트 보호)**. STATUS 추천 줄(pre-v0.14.0)은 stale.

### 조사 3: `subsetAnalysisRefs` (work-unit.js:96) = 미배선 골격
- v0.3.0 DEC(subset-retire): `*.subset.json` 파생사본 폐기 → `subsetAnalysisRefs(canonical, prefixes)` in-memory 필터를 "올바른 슬라이싱 메커니즘"으로 선언 + **제거 금지** 명시.
- **실측**: 호출처 **0**(repo-wide grep). `createScopeManifest`(work-unit.js:29)의 `analysis_refs` = **항상 빈 배열**(rules:[]/endpoints:[]/...). 구동 prefixes 저장처 0. `*.subset.json` 실파일 0.
- ∴ "scope=canonical 슬라이스" 모델 = **선언만 있고 전혀 배선 안 된 골격**(in-memory 필터조차 미호출).

### 조사 4: subset-precision 이 노리던 2 문제 = 더 정밀한 메커니즘으로 이미 해소
| 문제 | subset-precision(prefix) 접근 | 실제 해소 (더 정밀) |
| --- | --- | --- |
| cross-scope drift FP | subsetAnalysisRefs prefix 필터 | **v0.14.0** `bounded_context` subset-hash (id-prefix 가 아니라 BC 필드 = 정확) |
| discovery coverage 분모 희석 | (해당 없음) | **v0.30.0** discovery-validator UC scope-token 분모 |
- prefix 기반(`id.startsWith`)은 BC-필드 기반보다 부정확(id 명명 규칙 의존). 두 후속이 더 정밀한 축으로 대체.

## diagnose-before-design 결론

**"subset-precision (subsetAnalysisRefs 활성화)" = merge-back 과 동형 OBVIATION.**
- 측정된 FP(BR) = v0.14.0 해소 + 가드 테스트.
- 골격(subsetAnalysisRefs/빈 analysis_refs) = v0.14.0(BC-hash) + v0.30.0(scope-token)이 더 정밀하게 대체 → prefix 일반화 빌드 = 능력 재발명 = §8.1 과적합 + 재작업.
- 측정 안 된 FP(domain/db-schema/openapi coarse) = §14 시나리오 A 가 오히려 "정당 drift" 로 판정 → 빌드 trigger 부재(추측 빌드 = "실 trigger 우선" 위반).

## ★ 적대 검증 정정 (step-0 / self-plan 오류 포착)

초안은 "`subsetAnalysisRefs` + 빈 `analysis_refs` skeleton 둘 다 dead → 함께 retire" 라 적었으나 **틀림**(코드 착수 전 전 영향면 grep 으로 포착 / 삭제=엄격 검증):
- **`analysis_refs` 필드 = load-bearing (KEEP 의무)**: ⓐ `query.js --ref` 역인덱스 소비 ⓑ **db-assets-validator**(RR #23 게이트)가 `analysis_refs.db_tables/db_procedures/db_functions/db_views` 검사 ⓒ **findings-aggregator** 가 `analysis_refs.artifacts` 로 gate #0(analysis exit) 경로 해석 ⓓ task-plan.schema `analysis_refs.db_procedures[].id` 참조. 제거 시 3개 게이트 붕괴.
- **dead = `subsetAnalysisRefs` 함수 1개뿐**: 호출처 0 / import 0 / re-export 0(state-store 는 createScopeManifest·createStageManifest·STAGES 만 import). 정확 범위 = `work-unit.js:93-110`(주석 3줄 + 함수).
- ∴ retire 범위 = **함수만**. 필드는 본래 prefix-subset 캐시가 아니라 manifest 의 per-scope refs(DB 자산 / artifacts map / 역인덱스 id) 보유처 = 별 메커니즘이 채움 = 유지.

## 진짜 잔여 델타 (있다면) — 정리 축 (사용자 결단 → retire 확정)

1. **(추천) 골격 retire + 정직 문서화** — `subsetAnalysisRefs` + 빈 `analysis_refs` skeleton 은 "있다고 주장하나 동작 0" = drift attractor(미구현 단계 동작표기 ❌ 원칙 위반 잠재). 제거 or "scope=full-canonical 읽기 + 슬라이싱은 BC-hash[drift]/scope-token[validation] 축이 담당" 으로 명문화. v0.3.0 DEC "제거 금지" 와 충돌 → **DEC supersede 필요**(canonical-global+BC-hash+scope-token 정착으로 prefix-filter 골격 불요 판정).
2. **(보류) 측정 trigger 확보 후 재개** — domain/db-schema/openapi 의 BC-scoped FP 가 실 dogfood 로 측정되면 그때 BC-hash 를 그 deliverable 로 일반화(BR 선례 재사용). 지금은 trigger 0.
3. **(no-op) 현행 유지** — 골격 무해(빈 배열 / 호출 0)하니 방치. 단 honest-debt 잔존.

## 검증 (어느 결단이든)
- 골격 retire 시: createScopeManifest·work-unit-manifest.schema.json·schema-validator·chain-driver test 동기 + RR 무회귀.
- §8.1: retire = paradigm-grounded(이미 정착한 2 메커니즘이 SSOT) / 일반화 빌드 = trigger 부재 거부.

## Lessons

- **stale 추천이 obviated 작업을 가리킴**: STATUS "다음 의제" 추천(subset-precision)은 v0.14.0 이전 작성이었고, 그 사이 v0.14.0(BC-hash) + v0.30.0(scope-token)이 노리던 문제를 더 정밀하게 해소. 액면수용했으면 능력 재발명(재작업). **1원칙 전수 조사 + 커밋 타이밍 대조 + 가드 테스트 확인**이 차단. STATUS 추천은 timestamp 와 그 이후 release 를 반드시 대조.
- **self-plan 도 적대 검증 대상**: 내 초안이 `analysis_refs` 필드(load-bearing: query/db-assets/findings-aggregator)를 dead 로 오판 → 코드 착수 전 전 영향면 grep 이 포착. 삭제는 신규 기능보다 엄격 검증(숨은 consumer / 게이트 의존).
- **Senior 적대검증이 누락 surface 2건 추가 포착**(INDEX:64 + STATUS:12). 문서 정합은 grep 만으로 불완전 — 적대 reviewer 가 진원지(STATUS 추천 줄) 까지 추적.
- **provenance 게이트 상호작용**: doc 정정 시 본문에 DEC 토큰 넣으면 check40(shipped_provenance_leak) 위반 → 본문은 사실 진술만 + "근거 ## 인용" / DEC 포인터는 footer. 추가 발견: 중간 커밋 `74e6ec3b`(cascade-conformance)가 full 게이트 미실행으로 SKILL:226/243 leak 을 HEAD 에 남김 → 본 릴리스가 동반 수습.
- **결과**: work-unit.js 13줄 제거 + DEC supersede + 11 doc surface 정정. chain-driver 516 무회귀 / RR 42/42 / breaking 0 / PATCH v0.33.1. diagnose-before-design 선례 누적(merge-back·F14·F16 에 이어).
