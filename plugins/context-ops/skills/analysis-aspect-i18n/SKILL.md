---
name: analysis-aspect-i18n
description: Use when project contains i18next / react-intl / vue-i18n / FormatJS / lingui / ICU MessageFormat. Generates i18n-spec.json (산출물 11). Stage = analysis, aspect = cross-cutting (FE).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# aspect-i18n — Internationalization (FE)

다국어 / locale / message format 분석.

## 사전 조건

- FE 코드베이스 + i18n lib 시그널 (i18next / react-intl / vue-i18n / FormatJS / lingui)

## 절차

1. **i18n lib 식별**:
   - i18next + react-i18next
   - react-intl (FormatJS)
   - vue-i18n
   - lingui
   - ICU MessageFormat
2. **Locale catalog 추출** — `locales/<lang>/translation.json` 등
3. **Message format 분석** — 단순 string vs ICU (plural / select / number / date)
   - **수동 복수형(manual-pluralization) smell 검출** — ICU plural rule 로 구동되지 않으면서 count 에 의존하는 literal 을 flag:
     - (a) **고정 counter-word 카탈로그 값** — `건`/`개`/`명`/`case(s)`/`items` 같은 고정 단위어가 별도 count 와 함께 렌더(예: `${count}${t('unit.case')}`)되고, 해당 key 가 `format=plain` & 모든 locale 에서 `uses_plural_rule=false` 인 경우.
     - (b) **count ternary / switch** — `count === 1 ? t('x_singular') : t('x_plural')`, `switch (count)` 등 코드가 복수형을 수동 분기.
   - 해당 key 의 `resources[].manual_pluralization=true` 로 표기 + 기존 `resources[].cross_links` 로 등록: `{to_artifact:"antipatterns", to_id:"AP-I18N-PLURALIZE-MISS", link_type:"registers_as_antipattern"}`. **AP-I18N-PLURALIZE-MISS 는 canonical 예약 id** — 변형 id 발명 ❌.
   - ⚠️ **비-t() 렌더 채널** — 카탈로그 key 를 거치지 않고 하드코딩된 counter word(예: `gridInfo.ts` 의 `'명'`)는 `resources[]` 에 항목이 없으므로 `manual_pluralization`/`cross_links` 대상이 아님 — **quality phase 의 AP-FE-I18N 로 라우팅**하라.
4. **Untranslated string 검출 + orphan-key 판정** — 코드에 hardcoded string 있는지 / 정의됐으나 미사용(orphan) key 검출. ⚠️ MF host-global 단일 i18next(공유 카탈로그)에서는 한 앱 내 `source_files=[]`(로컬 `t()` 호출 0)가 곧 orphan 이 아님 — 타 앱이 cross-app 으로 소비하는 공유 키일 수 있음(예: host 가 register 한 `common.*` 를 다른 MF 앱이 사용). orphan 단정 전 repo 전역 사용처 확인 의무(단일 앱 scope 로 orphan 판정 ❌). 공유 카탈로그 orphan 등록 시 canonical 예약 id `AP-I18N-ORPHAN-SHARED` 사용.
5. **AP-I18N-XXX 등재** — anti-pattern (`quality` phase 통합). canonical 예약 id: `AP-I18N-PLURALIZE-MISS`(수동 복수형), `AP-I18N-ORPHAN-SHARED`(공유 카탈로그 orphan). 신규는 `AP-I18N-<UPPER-SNAKE>` 형식 — analyst-invented id drift ❌.
6. **i18n-spec.json 작성** — `schemas/i18n-spec.schema.json`
   - **provenance (meta) 기록**:
     - `captured_by` — runtime 검증(앱 실행 / i18next 런타임 catalog merge) 없이 source 코드·locale catalog 만 정적 read 한 경우 `static_extraction` 기록(정직 tier — `simulation` -5%p 과 구분). runtime 검증 시 `icu_real` / `formatjs_real` / `i18next_real`.
     - `inputs_used` — FE-native 출처를 정확히 태깅: `package.json`/lockfile read 시 `package_manifest`, 정적 import 의존 분석 시 `import_graph`, CodeGraph 인덱스 사용 시 `codegraph`. package.json read 를 `source_code`/`config_files` 로 뭉개지 말 것(`schemas/meta-confidence.schema.json` inputs_used FE-native 4종).

## 산출물

`<user-project>/.ai-context/base/domains/<BC>/i18n-spec.json`

## 인용

- 정책: methodology-spec/deliverables/11-i18n-spec.md
- schema: schemas/i18n-spec.schema.json
- ADR: ADR-FE-005 (ICU MF2 권위 매개체)
- 결정: DEC-2026-06 (cycle5 i18n-spec-04 — 수동 복수형 smell `manual_pluralization` + canonical antipattern id)
