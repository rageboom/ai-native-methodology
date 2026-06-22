# analysis-self-consistency-validator

v0.66.0 — analysis 산출물의 **summary/count 필드 ↔ 자기 backing 배열** 결정론 자기정합 검사.

## 왜

`DEC-2026-06-13-append-catalog-rulecount-ssot`이 "count = 배열의 비정규화 캐시 / 배열 = SSOT / LLM 정수 불신" 원칙을 확립했으나 적용이 `_shared/append-catalog.js`(BC index `rule_count`) **한 곳에만** 국한됐다. 동일 결함 클래스(summary count 가 자기 배열과 drift)가 analysis-agent 직접 산출물에서 반복 재현 — vac-settlement 5th(fail 11 미스카운트), work-system 6th(`type-spec.summary.total_types=45` vs `types[]` 48). 이 미스카운트가 비싼 LLM groundedness skeptic(~3M 토큰)에서야 잡혔다. 본 도구는 그 원칙을 산출물로 **일반화**해 LLM 앞단에서 결정론으로 선제 제거한다.

## 스코프 한계 (중요 — skeptic 대체 아님)

**구조적 summary/count 필드만** 검사한다. `meta.warnings`("SIX RealGrid"), `description`("useState 16개"), 기타 prose/free-text 에 박힌 숫자는 **NLP 영역 = groundedness skeptic 이 계속 담당**. 본 도구는 가장 비싼 구조적 drift(type-spec 류)를 싸게 선제 제거하는 필터일 뿐, skeptic 을 대체하지 않는다.

false-positive 0 지향: summary 필드 + backing 배열이 **둘 다 존재**할 때만 검사. 배열 item 이 discriminator 필드를 전혀 안 가지면 해당 partition 은 N/A(skip). derived metric(`missing_per_locale` 등 의미 판정 필요)은 미등록.

## 검증 항목 (kind 는 산출물 shape 로 자동 감지)

| kind | scalar (== 배열 length) | partition (group-by 양방향) | filtered / custom | sev |
|---|---|---|---|---|
| type-spec | `summary.total_types`==types / `scope_internal_type_count`(warn) | `per_kind` by `kind` | `framework_coupled_count`(score>0) / `domain_linked_count`==uniq(cross_links.from_type) | fail |
| static-security-spec | `summary.total_findings`==findings | `per_severity`·`per_category` | `runtime_check_required_count`(warn) | fail |
| antipatterns | `summary.total_count`==antipatterns | `by_category[c].count` (중첩) | `critical_count`(severity==critical) | fail |
| a11y-spec | `summary.total_violations`==violations | `per_impact`·`per_wcag_level` | — | fail |
| form-validation-spec | `summary.total_validations`==validations | `per_library`(source_format)·`per_validation_type` | `framework_coupled_count` | fail |
| i18n-spec | `summary.total_keys`==resources | — | `total_translations`==Σ translations.len (warn) | fail/warn |
| visual-manifest | `manifest_summary.total_snapshots`==snapshots | (diff_status/captured_by breakdown = carry) | — | fail |
| business-rules | `br_count`·`summary.br_count`==business_rules | `summary.by_category` by `category` | — | fail |

count 필드 없음 = domain / state-map / ui-spec / migration-cautions → N/A (not applicable).

partition 비교 = 키 합집합 + 0-default → 명시적 0(`per_severity {critical:0}`)은 통과(orphan 오탐 차단), 빠진 키·잉여 키·값 불일치 모두 검출.

## 사용

```bash
# 단일 산출물
analysis-self-consistency-validator .ai-context/<scope>/type-spec.json

# analysis output 디렉토리 재귀 (findings-*.json 제외)
analysis-self-consistency-validator .ai-context/<scope>/ --json

# 미스카운트 자동 교정 (배열=SSOT, indent 보존) — 배열 누락은 skeptic 담당
analysis-self-consistency-validator .ai-context/<scope>/ --fix

# 보고만 (gate 비차단)
analysis-self-consistency-validator .ai-context/<scope>/ --dry-run
```

exit: 0(정합/dry-run/fix) · 1(high finding = gate fail) · 2(usage·입력 오류)

## wiring

analysis exit gate #0(`flows/sdlc-4stage-flow.json`)의 **conditional_validator** — count-bearing 산출물 존재 시 `findings-aggregator` 가 `extraValidators` 로 추가(산출물 부재 시 skip). REQUIRED 아님(부재 PoC failClosed 방지).

## 인용

- 결정: `decisions/DEC-2026-06-22-analysis-self-consistency-validator.md` (DEC-2026-06-13-append-catalog-rulecount-ssot 의 일반화)
- 출력 안전: `_shared/write-stdout-sync.js` / indent 보존: `_shared/append-catalog.js` `detectIndent`
