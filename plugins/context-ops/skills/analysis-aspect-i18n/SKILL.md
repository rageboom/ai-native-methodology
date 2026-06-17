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
4. **Untranslated string 검출** — 코드에 hardcoded string 있는지
5. **AP-I18N-XXX 등재** — anti-pattern (`quality` phase 통합)
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
