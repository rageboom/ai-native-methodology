# 산출물 #11: I18n Spec (다국어 명세 — ICU MF1 stable + MF2 preview)

> **사상**: ADR-001 §명시적 제외 갱신 (정적 NFR 포함) + ADR-FE-005 §2.2.3 (ICU MF1 stable + MF2 spec stable / runtime Technical Preview / MF1 폴백 의무)
> **schema**: `schemas/i18n-spec.schema.json`
> **생성 phase**: `ui` phase 5-2-a (`/analyze-ui-base` 의 sub) 또는 별도 `/analyze-i18n`

---

## 1. 목적

**답하는 질문**: "이 시스템은 어떤 locale 을 지원하고, 번역은 무엇이 누락되었나?"

**AI 재구현 시 활용**: 미번역 key 자동 검출 / locale 별 plural rule / gender select 함정 회피 / MF2 마이그레이션 plan

### 1.1 MF2 채택 단계 명시 (cross-check 권고 #3 정합)

ADR-FE-005 §2.2.3 정합:

- **MF1** = stable (ICU 안정 — production 권장)
- **MF2 spec** = stable (Unicode LDML 47+)
- **MF2 runtime** = Technical Preview (ICU4J / ICU4C 일부 default function / `u:` namespace = Draft)
- **MF2 사용 시 MF1 폴백 의무** (단기 폴백)

→ schema `mf2_used=true` 시 `mf1_fallback_present=true` if/then 강제.

---

## 2. 형식

```
output/i18n/
├── i18n-spec.json              # AI 눈
├── missing-keys.md             # locale 별 누락 key
├── mf2-migration-gap.md        # MF1 → MF2 격상 gap (선택)
└── _manifest.yml
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                                 | 출처                                             | 도구         | 신뢰도 (단계 5) |
| ------------------------------------ | ------------------------------------------------ | ------------ | --------------- |
| supported_locales                    | i18n config / 폴더 구조                          | 결정적       | 95%             |
| resources (key + translation)        | translation 파일 (json / yaml / properties / po) | 결정적 + LLM | 90%             |
| format detection (MF1 / MF2 / plain) | message 패턴 분석                                | 결정적 + LLM | 85%             |
| runtime library                      | package.json                                     | 결정적       | 95%             |
| missing per locale                   | resources × locales 매트릭스                     | 결정적       | 100%            |
| plural / gender / date 사용 검출     | message 패턴                                     | LLM          | 80%             |

**입력**: FE 소스 + translation 파일
**runtime 라이브러리**: ICU4J / ICU4C / formatjs / react-intl / i18next / vue-i18n / @angular/localize / lingui / next-intl 등 13종 enum

---

## 4. MF1 폴백 의무 (cross-check 권고 #3 강제)

```yaml
i18n-spec.summary:
  mf2_used: true # true 시
  mf1_fallback_present: true # 의무 (allOf if/then 강제)
```

mf2_used=true & mf1_fallback_present=false → schema validation fail (production 위험 carry / Stage 4 mini-PoC 검증 의무).

→ ADR-FE-005 §2.2.3 정합 + ICU 공식 docs 의 MF2 status 인용.

---

## 5. cross-link (`formal-spec` phase 패턴)

```yaml
cross_links:
  - { to_artifact: ui-spec, to_id: PAGE-LOGIN-001, link_type: shown_on }
  - {
      to_artifact: state-map,
      to_id: FSM-FE-LOGIN-001,
      link_type: displayed_in_state,
    }
  - {
      to_artifact: antipatterns,
      to_id: AP-FE-I18N-001,
      link_type: registers_as_antipattern,
    }
```

---

## 6. 신뢰도 (ADR-009 §2.4 정합)

| 단계 | 조건                                            | 신뢰도 |
| ---- | ----------------------------------------------- | ------ |
| 1    | translation 파일 정적 추출                      | 70-80% |
| 3    | + drift-validator i18n 적용 (Stage 5+ 검토)     | 78-85% |
| 5    | + ICU runtime 진짜 실행 (formatjs / react-intl) | 90-95% |

---

## 7. 검증 체크리스트

```
□ schema 검증 통과
□ default_locale + supported_locales 명시
□ runtime.library 명시 (13종 enum)
□ runtime.supports_mf2=true 시 mf1_fallback_present 의무
□ summary.mf2_used=true 시 mf1_fallback_present 의무 (allOf if/then)
□ resources[].translations.format ∈ [icu_mf1, icu_mf2, plain, interpolation_only]
□ icu_mf2_features_used 명시 (u_namespace_draft 사용 시 finding 의무)
□ summary.missing_per_locale 명시 (모든 supported_locales 포함)
□ cross_links 의무 (ui-spec / state-map / antipatterns 중 1개 이상)
```

---

## 8. 산출물 간 참조

| 방향      | 의미                                      |
| --------- | ----------------------------------------- |
| I18n → UI | shown_on (page)                           |
| I18n → SM | displayed_in_state (FSM state)            |
| I18n → AP | registers_as_antipattern (AP-FE-I18N-XXX) |

---

## 9. 흔한 함정

### 9.1 plural rule 누락

- 증상: 영문 (zero/one/other) 만 처리 / 한국어 (other 만), 러시아어 (one/few/many) 무시
- 대응: ICU plural syntax 의무 + locale 별 검증

### 9.2 gender select 영문만

- 증상: `{gender, select, male{} female{} other{}}` 영문 패턴 / 한국어 무성
- 대응: locale 별 gender select 사용 명시 + AP-FE-I18N-\* 등록

### 9.3 시간/날짜 locale 무시

- 증상: `new Date().toString()` 직접 / locale-aware 부재
- 대응: `Intl.DateTimeFormat(locale)` 또는 ICU date function 의무

### 9.4 RTL 미지원

- 증상: ar / he locale 추가 시 UI 깨짐
- 대응: CSS logical properties (margin-inline / padding-block) + AP-FE-I18N-RTL 등록

### 9.5 MF2 default function Draft 사용

- 증상: `u:` namespace 사용 / production 위험
- 대응: icu_mf2_features_used 에 `u_namespace_draft` 명시 + finding 의무 + Stage 4+ runtime 검증

### 9.6 MF1 폴백 부재 (cross-check 권고 #3)

- 증상: MF2 단독 사용 / runtime preview 위험
- 대응: schema if/then 자동 강제 (mf2_used=true → mf1_fallback_present 의무)
