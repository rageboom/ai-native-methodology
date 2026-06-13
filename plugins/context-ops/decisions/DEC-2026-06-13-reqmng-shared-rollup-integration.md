# DEC-2026-06-13 — reqmng(신청관리) shared 카탈로그 통합: deferred rollup 완료 + bc-accumulator-rollup production 통합 corroboration + cross-version leaf 드리프트 노출

- **일자**: 2026-06-13 (corroboration + finding / **버전 bump 없음** — 본체 코드 무변경)
- **카테고리**: corroboration / §8.1 ratchet — bc-accumulator-rollup 첫 production-base 통합(full-chain 아닌 analysis-integration) + domain-authoring-from-leaf paradigm + cross-version 정합 finding
- **상태**: 승인 (사용자[TF Lead] "reqmng부터 진행" — 다른 워크트리(reqmng/wlfr) deferred 통합 단계를 메인이 완성)
- **관련**: `DEC-2026-06-13-cal-3bc-fullchain-corroboration`(직전 / analysis+chains 풀체인) · `DEC-2026-06-12-parallel-bc-accumulator-rollup`(직렬 rollup 도구 ②) · `DEC-2026-06-12-sql-inventory-extractor` · `DEC-2026-06-06-analysis-exit-gate` · memory `feedback_strict_exposes_drift` · `feedback_self_recorded_fact_validation` · `feedback_diagnose_before_design_check_existing` · `feedback_quality_priority`

---

## 1. 배경

신청관리(reqmng) 메뉴그룹(경조사·경조금·업체정산 = hncaf 계열 / 리조트·성수기·추첨 = resort 계열)은 별도 워크트리에서 per-BC analysis leaf(business-rules 36 / openapi / sql-inventory / characterization / migration-cautions fragment / findings fragment)가 **이미 완료**돼 있었으나, 그 워크트리의 `bc-scope.json#deferred_shared_rollups` 에 **shared 누적기 3종(domain bounded_contexts / business-rules index / migration-cautions) 을 "병렬 worktree 충돌 회피 → post-merge 1회"로 명시 deferred** 상태였다. 본 결정은 그 deferred 통합 + domain bounded_context **저작**을 완료한다. = 다른 세션이 *의도적으로 미뤄둔* 통합이라 의도 충돌 위험 낮음(diagnose-before-design: bc-scope 의 deferred 선언을 실측 확인 후 착수).

resve/cal 과 결정적 차이: **leaf 가 이전 방법론 버전(v0.41)에서 산출** → 현(v0.43) strict 검증과의 cross-version 정합이 핵심 변수.

## 2. 시행 (author / rollup / conformance / gate 분리)

- **domain bounded_context 저작 (Workflow 병렬 author + aggregate별 적대적 검증)**: hncaf 계열(17 BR)·resort 계열(19 BR) 병렬 author → BR leaf 의 `source_evidence`(file:line)로 grounding 한 8 aggregate / 36 invariant / 31 use_case / 19 ubiquitous_language 산출. aggregate별 적대적 검증자(소스 file:line 실재 + 36 BR 역추적 + 날조 차단) = **7 clean + 1 minor**. minor 1건 = BR 자체의 과진술('A/B 동시설정' 중 B가 인용 경로에 미실재)을 충실히 전사한 것(저작 날조 ❌)으로 진단 → 인용 evidence 에 맞춰 정확화. **36 BR 전부 1:1 invariant 커버 / evidence file_missing 0**(analysis-extraction evidence-scan).
- **rollup (bc-accumulator-rollup / 멱등 직렬)**: business-rules index(total_rules +36) · migration-cautions(+2 group/10 caution) · domain(bounded_contexts +1, ubiquitous_language merge=기존 term skip) 3 누적기. findings 는 shared 롤업 **skip**(shared `findings-analysis.json` = 게이트 출력이라 충돌 + deferred 목록 외). antipatterns 미저작(목록 외). = **10번째 dogfood BC**(누적: event/golf/mtrm/healing/helium/hlum/cal-salary/corpt/taxi + reqmng).
- **cross-version leaf conformance (결정론 / 분석내용 무변)**: 아래 §4 F2.
- **gate (analysis exit-gate#0 / 신규 manifest)**: schema-validator(트리 전체) 0 invalid + br-cross pass + formal-spec 0. 잔여는 §4 F2 carry + §5 선재 base 부채.

## 3. 결과 (전부 실측)

| 산출물 | 수치 |
|---|---|
| domain bounded_contexts | 16→**17** (BC-REQMNG: 8 aggregate / 36 invariant / 31 UC / 19 UL) |
| business-rules index total_rules | 328→**364** (+36) |
| migration-cautions caution_groups | 27→**29** (BC-REQMNG 2 group / 10 caution) |
| schema-validator (트리 전체) | **0 invalid** (57 valid / 50 schema-less skip) |
| adversarial verify | 7 clean + 1 minor(BR 과진술 전사 정확화) |
| invariant evidence file_missing | **0** (evidence-scan) |

## 4. 방법론 finding

### F1 — bc-accumulator-rollup production 통합 corroboration (§8.1)
v0.43.0 본체(bc-accumulator-rollup 직렬 post-merge rollup / append-catalog upsert primitive)가 reqmng 단일 BC(36 BR / 2 caution group) 에서 새 본체 결함 0 으로 견딤. 멱등(재-roll = replaced 동일 상태) · sibling BC 무접촉 · total_rules 재계산 정확 실증. = 도구의 **첫 production-base(328 rules) 통합**(이전 REQMNG·WLFR 60-baseline 도구 dogfood = v0.43.0 격상 근거와 구별 / INDEX `DEC-2026-06-12-parallel-bc-accumulator-rollup`). **정밀 주의**: reqmng 은 **analysis-integration(domain 저작 + 3 shared rollup)** 이지 full-chain(1~5) 아님 → full-chain §8.1 datapoint 는 **9 유지**(event/golf/mtrm/healing/helium/hlum/cal-salary/corpt/taxi). reqmng 은 rollup·domain-authoring·cross-version 축의 별도 datapoint(AX-context 보유 BC 누적 = 10).

### F2 — cross-version leaf 드리프트 노출 (PRIMARY / 신규 / `feedback_strict_exposes_drift` corroboration)
이전 방법론 버전(v0.41)에서 산출된 leaf 를 현(v0.43) strict 검증에 통과시키자 **체계적 포맷 드리프트**가 노출됨. 핵심 = **수정 vs carry 경계를 "JSON Schema 계약 위반 = 기계적 수정" / "semantic content-validator 포맷 진화 = 분석 재작업 carry"로 분리**:

| 드리프트 | 분류 | 처분 |
|---|---|---|
| inputs_used 에 파일명(enum 외) ×3 파일 | schema 계약 위반 / 순수 메타 | **수정**(enum 값으로 정규화 / 분석내용 무변) |
| 외부호출·DBA-read statement confidence>0.8 ×22 | schema 계약 위반(ADR-CHAIN-007) | **수정**(0.8 cap / 보수적) |
| dynamic_branch tag_type bare/비표준 ×156 | schema enum 위반 / 어휘 정규화 | **수정**(bare→prefixed, 비표준→other / 원본 `tag` 필드 보존 = 무손실 / 재분류 ❌) |
| carry_flags 값에 괄호 detail ×3 | schema enum 위반 | **수정**(enum 값으로) |
| intent_vs_bug_classification 서술형(키워드 부재) ×39 | content-validator(semantic) | **carry**(레코드별 intent/bug 재분류 = 분석 판단 = 세션 몫) |

= **JSON Schema 계약 정합은 통합 단계에서 결정론 수정**(cal 통합 선례 — 통합 중 schema 위반 정정), **semantic 재분류는 원 세션 분석 영역으로 carry**. 이 경계가 cross-version 통합의 재사용 규약. (wlfr 등 잔여 v0.41 브랜치에도 재발 예상.)

### F3 — domain-authoring-from-leaf paradigm (Workflow author + adversarial verify)
fresh 분석 없이 **기존 BR leaf 의 source_evidence 만으로** bounded_context(aggregate/invariant/use_case)를 도출하는 패턴 입증. 날조 회피 = (a) 각 invariant 에 source_br(36 BR 중 정확한 id) 의무, (b) aggregate별 적대적 검증자가 BR 실재 + 진술 일치 + 소스 file:line 실재 확인. 36 BR 1:1 커버 / file_missing 0 = grounding 충분. self-recorded-fact-validation(verifier 가 BR 과진술 전사 1건 포착·정정) 실증.

## 5. 선재 base 부채 (reqmng 무관 / 별도 기록)
analysis-extraction 7 critical = biztrip 6 + eaprv 1 zone 의 `_catalog-fragment.json` 가 미존재 leaf business-rules.json 을 증거 인용(index/domain 등재됐으나 leaf 미존재 / 이전 머지 잔여). reqmng 통합 전부터 존재 = reqmng attributable 아님. → base 트리 정합 별도 과제(권고: 해당 zone leaf 복원 또는 catalog-fragment 정리).

## 6. 본체 무변경 근거 (quality 1순위)
검증된 본체 결함 0. F1=corroboration, F2=cross-version 정합 규약(도구/스키마 변경 아님 / leaf 데이터 정규화), F3=기존 도구(Workflow + bc-accumulator-rollup) 조합. → 버전 bump·CHANGELOG·schema·코드 변경 없음 — DEC + STATUS + memory 기록만.

## 7. carry / 다음
- ① reqmng leaf 분석 재작업(원 세션 몫 / 통합 deliverable 아님): sql-inventory 39 intent_vs_bug 서술형→canonical 키워드 재분류 · characterization FIP ambiguous_carry(의도된 회계정책 미결).
- ② **wlfr 통합**(다음 / 동일 v0.41 cross-version 정합 예상 / 7 서브도메인 125 BR = reqmng 보다 큼): 본 DEC F2 경계 규약 재사용.
- ③ 선재 biztrip/eaprv catalog-fragment base 부채(별도).

> **보안**: 사내 source = 외부 격리(공개 rageboom commit ❌ / ep-be-gea GHE only). 본 DEC = masked codename(reqmng / hncaf·resort 계열)만 / 사내 테이블명·패키지경로·메서드명·file:line 전사 금지. 실 산출물은 ep-be-gea `1de6fe225b`(GHE).
