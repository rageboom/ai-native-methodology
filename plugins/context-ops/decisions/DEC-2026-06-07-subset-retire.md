# DEC-2026-06-07-subset-retire

> ⚠️ **PARTIALLY SUPERSEDED (corollary 한정 / 2026-06-10)** — 본 결단의 **본체**(`*.subset.json` 파생사본 폐기 → canonical global 단일 SSOT)는 **유효·불변**. 단 corollary("scope 슬라이스 = `subsetAnalysisRefs(canonical, prefixes)` in-memory 필터 / §2 L21·§3 L26·§4 L31 '제거 금지'")는 **`DEC-2026-06-10-subset-slicing-corollary-supersede`** 로 정정됨: 해당 함수는 호출처 0(미배선) + 실 슬라이싱은 BC-subset-hash(drift / v0.14.0)·scope-token 분모(validation / v0.30.0)가 담당 → 함수 retire(v0.33.1). scope 는 canonical 을 full 참조(context-reduction prefix 슬라이싱 미실현).

**결단**: baseline-delta 운영 모델에서 **`*.subset.json`(scope-local analysis 파생 사본) 개념을 폐기**. scope 슬라이스는 사본 파일을 만들지 않고 canonical global 단일 SSOT 를 유지(~~`subsetAnalysisRefs` in-memory 참조 필터~~ → corollary supersede 참조).

**작성일**: 2026-06-07 (사용자 채널: "subset 이 바뀌어도 원본 반영 안 되면 SSOT 가 아니잖아" — 사본↔원본 역동기화 부채 지적).

**relates to**:
- `methodology-spec/baseline-delta-operating-model.md` (subset 정의 제거 대상)
- `DEC-2026-06-07-bounded-context-mandatory` (BR-split 순차안 STEP 0 / 본 결단 = STEP 0)
- `feedback_zero_base_no_carry_anchor` (구조 결정 = 데이터/SSOT 무결성 기준)

---

## 1. 배경

baseline-delta 모델은 대형 프로젝트 context 부담 완화책으로 `.aimd/<scope>/analysis/*.subset.json`(canonical global 의 파생 사본)을 **spec 에만** 두었다(실 생성 0건 / 미실현). 사용자 지적: 사본(subset)에 진실이 머물고 원본(canonical)에 역반영 안 되면 **SSOT 가 깨진다**. 사본 = 원본↔사본 양방향 동기화 부채(cache invalidation).

## 2. 결정 내용

- `*.subset.json` 파생 사본 개념 **폐기**. SSOT 무결성(단일 canonical) 우선.
- scope 슬라이스 = 이미 코드에 존재하는 `chain-driver/src/work-unit.js` `subsetAnalysisRefs(canonical, prefixes)` = canonical 의 BR-id 등 `analysis_refs` 를 **in-memory 필터**(사본 파일 ❌). 이게 SSOT-안전한 슬라이싱.
- doc 정정: `baseline-delta-operating-model.md`(§2 자산지도 행 + §3-2 + §4 carry 규약) + `lifecycle-contract.md`(scope 디렉토리 다이어그램의 `analysis/business-rules.subset.json` 제거).

## 3. 검증 / 영향

- `*.subset.json` 실 파일 0건(미실현) → 코드 제거 부담 0. `subsetAnalysisRefs` 함수 = 무변경(이미 in-memory 필터 / chain-driver test 343/343 무영향).
- 동기: BR-split 순차안의 STEP 0(SSOT 부채 제거 / 분할과 독립).

## 4. Non-goal

- `subsetAnalysisRefs` 함수 제거 아님(이게 올바른 슬라이싱 메커니즘).
- greenfield "산출물-subset"(산출물 종류 subset / 다른 의미) 무관·보존.
