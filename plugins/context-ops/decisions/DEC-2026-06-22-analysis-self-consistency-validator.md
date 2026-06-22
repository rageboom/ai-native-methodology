# DEC-2026-06-22-analysis-self-consistency-validator

**상태**: 승인 (v0.66.0 MINOR)
**일자**: 2026-06-22
**관련**: DEC-2026-06-13-append-catalog-rulecount-ssot (일반화 대상 — count=배열 비정규화 캐시 원칙을 처음 확립했으나 append-catalog.js 한 곳에만 적용) · DEC-2026-06-06-analysis-exit-gate (gate #0 conditional_validator 등재 지점) · DEC-2026-06-13-validator-stdout-truncation-fix (write-stdout-sync 파이프 안전)

## 맥락

`DEC-2026-06-13-append-catalog-rulecount-ssot`이 "**count = backing 배열의 비정규화 캐시 / 배열 = SSOT / LLM 이 손으로 적은 정수는 불신**" 원칙을 확립했으나, 그 강제(`rule_count := rule_ids.length`)는 `_shared/append-catalog.js`의 BC index 한 곳에만 구현됐다. analysis-agent 가 직접 산출하는 13 산출물의 `summary`/`count` 필드는 동일한 SSOT 계약이 강제되지 않아, **summary 가 자기 backing 배열과 drift 하는 미스카운트**가 반복 재현됐다 — 매번 **비싼 LLM groundedness skeptic(~3M 토큰)에서야** 검출.

verified-defect (실측, 3맥락 재현):
- **append-catalog (DEC-2026-06-13)**: BC index `rule_count` 21 vs `rule_ids` 23.
- **vac-settlement (실사용 5th)**: groundedness fail 11건 거의 전부 self-inconsistent 미스카운트.
- **work-system (실사용 6th)**: `type-spec.summary.total_types=45` vs `types[]` 배열 48 (가장 비싼 fix — 전용 agent 로 누락 5종 추가 + 재집계). skeptic fail 6건 중 1건이 구조적 count, 5건은 prose-embedded.

추가로, 본 도구를 **이미 커밋된 5개 도메인(maternity/vacation-creation/attendance-close/salary/vac-settlement)에 적용한 결과**, schema-validator + groundedness skeptic 을 통과한 산출물에서 **구조적 미스카운트 5건을 신규 검출**(salary 3: i18n `total_keys` 62 vs 81 / form-validation `per_validation_type` 분포 / maternity 2: business-rules `by_category` 분포 — 모두 **총합은 맞으나 partition 이 틀린** 케이스로, total-only 검사로는 불가). 오탐 0(4개 clean 도메인 0 finding). 결함의 보편성·결정성·검출 가치가 실증됨.

## 결정

analysis 산출물의 **구조적 summary/count 필드가 자기 backing 배열과 정합하는지** 결정론으로 검사하는 신규 도구 `analysis-self-consistency-validator` 를 신설하고, DEC-2026-06-13 의 "배열=SSOT / count=비정규화 캐시" 계약을 **count-bearing 8 산출물**(type-spec / static-security-spec / antipatterns / a11y-spec / form-validation-spec / i18n-spec / visual-manifest / business-rules)로 일반화한다.

- **검사 클래스**: (1) scalar (`total_X == X.length`), (2) partition (배열 group-by 양방향 — 키 합집합 + 0-default 비교로 빠진키·잉여키·값불일치·명시적0 모두 정합 판정), (3) filtered (`count(arr where pred)`), (4) custom reducer (`domain_linked_count == uniq(cross_links.from_type)` / `total_translations == Σ translations.len`).
- **불변식 = 하드코딩 `INVARIANTS` 맵** (validator.js). schema custom-keyword 미채택 — partition group-by 는 선언적 키워드로 표현 불가 + `gate-eval.REQUIRED_VALIDATORS_PER_STAGE`·`graph-synthesizer.CHAIN_TO_ANALYSIS_REFS` 와 동일한 본 방법론의 하드코딩-맵+회귀테스트 관용. **schema 13종 무수정.**
- **`--fix`**: 배열=SSOT 가정 하 scalar/partition-값/filtered/custom count 를 in-place 재계산(indent 보존 = `_shared/append-catalog.js` `detectIndent`). 기본 off(flag-only). partition 키 추가/삭제·derived metric 은 제외.

## 정직한 스코프 한계 (skeptic 대체 아님)

**구조적 summary/count 필드만** 검사한다. `meta.warnings`("SIX RealGrid")·`description`("useState 16개") 등 **prose/free-text 에 박힌 숫자는 NLP 영역 = groundedness skeptic 이 계속 담당**(work-system 6 fail 중 5건이 이 prose 유형). 본 도구는 skeptic 을 대체하지 않고, 가장 비싼 구조적 drift(type-spec 류)를 LLM 앞단에서 **싸게 선제 제거**하는 결정론 필터다. false-positive 0 지향: summary 필드 + backing 배열이 둘 다 존재할 때만 검사, discriminator 전무 시 N/A, derived metric(`missing_per_locale` 등) 미등록.

## trust / wiring

reference 가 아니라 **gate #0 conditional_validator**(high finding → fail-closed STOP). count-bearing 산출물 존재 시 `findings-aggregator` 가 `extraValidators` 로 추가(부재 시 self-gating → 0 finding, REQUIRED 아님 → PoC failClosed 회피). check26 4중 정합 = sdlc gate#0 `conditional_validators` + `analysis.phase-flow` `cross_cutting.validators` + gate-eval `REQUIRED` 불변. 출력 안전 = `write-stdout-sync`.

## verified-defect 정당화

가설적 개선이 아니라 **재현·실측된 drift**(append-catalog 21/23 · work-system type-spec 45/48 · 커밋 5도메인 신규 5건)에 대한 **결정론 불변식 강제 + 회귀 테스트**다. 16 테스트 GREEN (6th 원버그 `total_types 45 vs 48` 재현 케이스 포함). no-simulation 정합 — LLM "카운트 잘 세줘" 판단이 아니라 배열 SSOT 파생.

## 시행 (additive / breaking 0)

- 신설 `tools/analysis-self-consistency-validator/` (src/validator.js + src/cli.js + test/validator.test.js[16] + package.json + README.md).
- `flows/sdlc-4stage-flow.json` gate#0 `conditional_validators` + `flows/analysis.phase-flow.json` `cross_cutting.validators` 등재 (check26 정합).
- `tools/findings-aggregator/` cli.js(`buildAnalysisArgs` case + `extraValidators` push) + aggregator.js(dispatch → `transformGeneric`).
- `tools/chain-driver/src/gate-eval.js` 주석 (conditional 목록 동기).
- v0.66.0 MINOR (plugin.json / package.json / CLAUDE.md 현재버전 줄 / CHANGELOG / tools/README / INDEX).

## carry

- visual-manifest 의 `diff_status`/`captured_by` breakdown count: 비어있지 않은 인스턴스 부재로 enum 값 미검증 → INVARIANTS 미등록(total_snapshots 만). 실 인스턴스 확보 후 격상.
- characterization-spec `intent_vs_bug` open object(schema 미선언, 키 불안정) → 1차 제외.
- prose-embedded 숫자(설계상 영구 미해결) = skeptic 담당.
- per-skill 호출(각 count-bearing SKILL 자기 산출 직후) → 1차는 gate#0 conditional 일괄 / per-skill 은 carry.
