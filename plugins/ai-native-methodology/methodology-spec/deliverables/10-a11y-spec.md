# 산출물 #10: A11y Spec (접근성 명세 — axe-core + WCAG 2.1+2.2 ratchet)

> **사상**: WCAG 2.1-AA baseline + 2.2-AA ratchet (baseline+ratchet) / 정적 NFR 포함 / axe_core_real
> **schema**: `schemas/a11y-spec.schema.json`
> **생성 phase**: `ui` phase 5-2-c (`/analyze-visual` 의 sub) 또는 별도 `/analyze-a11y`

---

## 1. 목적

**답하는 질문**: "이 화면은 시각/청각/운동 장애 사용자에게 접근 가능한가?"

**AI 재구현 시 활용**: WCAG 2.1-AA baseline 위반 자동 검출 / 2.2-AA ratchet 격상 path 명시 / axe-core JSON 결과 그대로 입력

### 1.1 deliverable 9 visual-manifest 와의 분담

| 영역             | a11y-spec (#10)            | visual-manifest (#9)                       |
| ---------------- | -------------------------- | ------------------------------------------ |
| 주 산출          | a11y violations (분리)     | snapshot PNG (binary) + a11y inline (선택) |
| 진실 source      | axe-core JSON              | snapshot PNG                               |
| WCAG ratchet     | 본 산출물 의무             | 선택 inline                                |
| Stage 4 mini-PoC | ⏳ axe-core 진짜 실행 의무 | ⏳ Playwright + axe-core 통합              |

→ visual-manifest 의 a11y inline 은 1 page × N viewport 단위 / a11y-spec 은 page/component/story 전역 통합. 큰 프로젝트는 a11y-spec 분리 권장.

---

## 2. 형식

```
output/a11y/
├── a11y-spec.json              # AI 눈 (axe-core JSON 정합)
├── violations.md               # 사람 눈 (severity 별 그룹)
├── ratchet-gap.md              # 2.1-AA → 2.2-AA 격상 gap
└── _manifest.yml               # captured_by + 5종 물증
```

---

## 3. 추출 범위 (출처 / 도구 / 신뢰도)

| 항목                         | 출처                               | 도구                               | 신뢰도 (단계 5) |
| ---------------------------- | ---------------------------------- | ---------------------------------- | --------------- |
| violations                   | axe-core 진짜 실행 결과            | axe-core / pa11y / lighthouse_a11y | 90-95%          |
| WCAG criterion 매핑          | axe-core tag (wcag21aa / wcag22aa) | (자동)                             | 95%             |
| WAI-ARIA 1.2 role            | axe-core rule metadata             | (자동)                             | 95%             |
| baseline_pass / ratchet_pass | 본 schema 자체 계산                | (계산 — 결정적)                    | 100%            |

**입력**: FE 빌드 + dev server (Playwright + AxeBuilder 권장)
**no-simulation 정책**: simulation 시 -5%p 패널티 + simulation_reason 의무 (schema if/then)

### 3.1 미추출 (의도적)

- 실사용자 보조 기술 (screen reader / Switch / Eye tracker) 호환성 — 운영 환경 영역
- 자동 검출 한계 영역 (color-contrast 일부 / aria-label 의미 / focus 순서) — 사용자 confirm 의무

---

## 4. WCAG ratchet 정책

| level                 | 정책                                          |
| --------------------- | --------------------------------------------- |
| **baseline = 2.1-AA** | fail 시 critical / build block 권장           |
| **ratchet = 2.2-AA**  | fail 시 권장 (block ❌) / 격상 path 자료 제공 |
| 2.1-AAA / 2.2-AAA     | 선택 (사용자 환경 의존)                       |

→ axe-core config `withTags(['wcag21aa', 'wcag22aa'])` 양쪽 채택 의무.

---

## 5. cross-link (`formal-spec` phase 패턴)

```yaml
cross_links:
  - {
      from_violation: <axe rule id>,
      to_artifact: ui-spec,
      to_id: PAGE-LOGIN-001,
      link_type: validates,
    }
  - {
      from_violation: <axe rule id>,
      to_artifact: visual-manifest,
      to_id: VIS-LOGIN-001,
      link_type: inline_in,
    }
  - {
      from_violation: <axe rule id>,
      to_artifact: antipatterns,
      to_id: AP-FE-A11Y-001,
      link_type: registers_as_antipattern,
    }
```

---

## 6. 신뢰도

| 단계  | 조건                           | 신뢰도                         |
| ----- | ------------------------------ | ------------------------------ |
| 1-2-3 | 정적 분석 / drift-validator ❌ | ❌ N/A (axe-core runtime 의무) |
| 5     | axe-core 진짜 실행 + 5종 물증  | 90-95%                         |
| 6     | baseline + ratchet 모두 통과   | 95%+                           |
| 7     | a11y 전문가 리뷰 통과          | 95%+                           |

simulation 시 -5%p 패널티.

---

## 7. 검증 체크리스트

```
□ schema 검증 통과
□ scope.baseline_wcag = "2.1-AA" 명시
□ scope.ratchet_wcag = "2.2-AA" 명시
□ summary.captured_by ∈ [axe_core_real, pa11y_real, lighthouse_a11y_real]
□ captured_by=simulation 시 simulation_reason 의무 + -5%p 패널티
□ real 도구 시 5종 물증 (version / stdout / duration / reproduction / result_hash)
□ summary.baseline_pass 명시 (false 시 critical)
□ summary.ratchet_pass 명시 (false 시 권장)
□ 모든 violation 에 wcag_level 명시
□ cross_links 의무 (ui-spec / visual-manifest / antipatterns 중 1개 이상)
```

---

## 8. 산출물 간 참조

| 방향      | 의미                                      |
| --------- | ----------------------------------------- |
| A11y → UI | validates page / component                |
| A11y → VM | inline (선택)                             |
| A11y → AP | registers_as_antipattern (AP-FE-A11Y-XXX) |

---

## 9. 흔한 함정

### 9.1 color-contrast 자동 검출 한계

- 증상: 그라디언트 / 이미지 위 텍스트 / 동적 색상 자동 검출 미흡
- 대응: 사용자 confirm 의무 + Stage 4 mini-PoC = 디자이너 리뷰

### 9.2 aria-label 빈약 / 잘못된 사용

- 증상: aria-label 만 있고 시각 텍스트 부재 / 의미 없는 generic label
- 대응: WAI-ARIA 1.2 role 가이드 적용 + AP-FE-A11Y-\* 등록

### 9.3 focus 순서 불명확

- 증상: tabindex 양수 사용 / dynamic content 추가 후 focus 손실
- 대응: tabindex=0 만 / focus management 명시

### 9.4 ratchet 격상 누락

- 증상: 2.1-AA baseline 만 체크 / 2.2-AA 신규 기준 (target size / focus appearance) 무시
- 대응: ratchet_wcag = "2.2-AA" 의무 표기

### 9.5 simulation 누락

- 증상: 진짜 axe-core 환경 부재 시 시뮬 결과
- 대응: simulation_reason 명시 + Stage 4+ carry / -5%p 패널티

---

## 인용

- ADR: ADR-001 (정적 NFR 명시적 제외 갱신)
- ADR: ADR-FE-005 §2.2.2 (WCAG 2.1-AA baseline + 2.2-AA ratchet)
- ADR: ADR-010 (baseline+ratchet) — §4 WCAG ratchet 정책 근거 / §7 baseline_wcag 체크 근거
- ADR: ADR-009 §2.2.1 (axe_core_real) — §6 신뢰도 단계 근거
- schema: `schemas/a11y-spec.schema.json`
