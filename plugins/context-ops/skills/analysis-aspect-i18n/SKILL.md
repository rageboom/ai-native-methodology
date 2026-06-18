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
   - **외부-소유(borrowed) key 처리 — cross-BC + cross-APP 확장**: 본 scope 카탈로그가 register 하지 않으면서 본 scope 코드가 `t()` 로 소비하는 key 는 두 결로 분리한다. (a) **cross-BC borrow** — 같은 앱 내 다른 BC 카탈로그의 key(예: search slice 가 `gea.develop.*` 또는 host-global `gea.common.*` 소비). (b) **cross-APP borrow** — 다른 MF remote 가 register 하는 key(예: gea 페이지 안에서 쓰는 `tlm.common.*`). 두 경우 모두 `resources[]` 에 항목을 두되 `translations=[]` 로 두고, 해결 책임이 host 또는 owning remote 에 있음을 note 로 명시한다(예: "host/remote-owned — resolved by owning catalog"). **이 borrowed key 들을 `summary.missing_per_locale` 에 집계하지 말 것** — 본 scope 카탈로그가 채울 의무가 없는 key 를 missing 으로 세면 거짓 결손이 된다. missing 집계는 본 scope 가 소유(register)하는 key 로 한정.
   - **미번역-locale 검출(untranslated_placeholder)** — key-set parity(default ↔ 대상 locale 의 key 집합 동일)는 통과하나 *값*이 번역되지 않은 상태를 별도로 검출한다: non-default locale 각각에 대해 message 가 default_locale 의 동일 key message 와 **byte-identical** 한 key 를 `untranslated_placeholder` 로 flag. key 가 존재하므로 **부재(absent) key 가 아님** — `summary.missing_per_locale` 가 아니라 `summary.untranslated_per_locale`(locale 별 카운트)로 집계한다. ⚠️ key-set 동등성만 검사하는 CI test(예: `enKeys.length === koKeys.length` + 동일 key list assert)는 100% 미번역 카탈로그에서도 green 이므로, key parity 통과를 번역 완료 신호로 오인 ❌. (정당한 동형 예외: 고유명사·브랜드·숫자 코드 등 모든 locale 에서 동일한 값은 false-positive — note 로 구분.)
5. **AP-I18N-XXX 등재** — anti-pattern (`quality` phase 통합). canonical 예약 id: `AP-I18N-PLURALIZE-MISS`(수동 복수형), `AP-I18N-ORPHAN-SHARED`(공유 카탈로그 orphan). 신규는 `AP-I18N-<UPPER-SNAKE>` 형식 — analyst-invented id drift ❌.
6. **i18n-spec.json 작성** — `schemas/i18n-spec.schema.json`
   - **논리 namespace vs 런타임 namespace 분리(single_merged)** — `runtime.registration_model=single_merged`(여러 논리 ns 가 단일 런타임 ns 로 병합 — MF host 공유 catalog 의 흔한 패턴)에서는 `resources[].namespace` 에 런타임 ns(예: `translation`)를 기록하고, key prefix 가 표현하는 논리 BC grouping(예: `gea.healium.status`)은 별도 `resources[].logical_namespace` 에 기록한다. 한 필드가 두 의미를 겹쳐 담지 말 것 — single_merged 에서 namespace 만 쓰면 13/13 이 `translation` 으로 평탄화돼 분석상 의미 있는 BC 축이 소실된다. per_namespace 등 논리 ns 와 런타임 ns 가 1:1 이면 logical_namespace 는 namespace 와 동일하므로 생략 가능.
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
- DEC-2026-06-18-fe-dogfood-cycle6 (cycle6 — 미번역-locale 검출 + untranslated_per_locale / cross-BC·cross-APP borrowed key / logical_namespace)
