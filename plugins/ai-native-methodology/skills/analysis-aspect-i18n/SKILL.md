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

## 산출물

`<user-project>/.aimd/output/i18n-spec.json`

## 인용

- 정책: methodology-spec/deliverables/11-i18n-spec.md
- schema: schemas/i18n-spec.schema.json
- ADR: ADR-FE-005 (ICU MF2 권위 매개체)
