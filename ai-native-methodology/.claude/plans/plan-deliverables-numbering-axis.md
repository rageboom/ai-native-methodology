# plan-c — deliverables/ 숫자 prefix sub-axis 본격 평가

> **상태**: draft (2026-05-14 / v2.6.0 commit 1812bb1 직후 / Carry #3 본격 자산화)
> **트리거**: v2.6.0 plan-skill-meaningful-id-rename.md §4 본격 "deliverables/ 숫자 prefix = 별도 plan 분리" 결단 carry / 사용자 본격 평가 영역
> **선행**: v2.6.0 MINOR (★ skill 의미 ID 본격 자산화 / phase-N 숫자 prefix 본격 폐기)

---

## 1. 의문 본격

★ ★ ★ skill 디렉토리 phase-N 본격 폐기 후 — `methodology-spec/deliverables/` 의 `1-architecture.md` ~ `24-sql-inventory.md` 숫자 prefix 도 본격 의미 ID 본격 진화 가치 있는가?

## 2. 본격 사실 분석

### 2.1 deliverables 숫자 prefix 의 본질 (★ skill phase-N 와 본격 다름)

| axis | skill phase-N (v2.5.1) | deliverables N (★ 본 분석 대상) |
|---|---|---|
| 본질 의미 | 산출물 번호 ★ "그룹 라벨" (skills-axis.md §2.2) | ★ ★ ★ 산출물 ★ ID 번호 (id-conventions §2 본격 정의) |
| 사용자 인용 | ❌ (디렉토리 안만 / auto-trigger description 메인) | ✅ ★ ★ 직접 인용 (★ "산출물 #5", "deliverable 4-rules", "deliverable 6 antipatterns") |
| 다른 axis 와 충돌 | ✅ ★ ★ ★ manifest phase ID 와 같은 숫자 다른 의미 (혼란 source) | ❌ ★ ★ ★ 본격 unique (★ id-conventions §2 SSOT) |
| schemas 정합 | ❌ | ✅ schemas/<name>.schema.json 본격 정합 |
| 의미 ID 진화 가치 | ★ ★ ★ 높음 (v2.6.0 본격 진화) | ★ ★ ❌ 낮음 (★ ID 본격 의미 axis / 본격 단순 정렬 ❌) |

### 2.2 deliverables 현황 (24 file)

```
1-architecture / 2-domain / 3-api / 4-db-schema / 4-5-formal-spec / 5-business-rules /
6-antipatterns / 7-ui-ux / 8-state-map / 9-visual-manifest / 10-a11y-spec / 11-i18n-spec /
12-static-security-spec / 13-legacy-spectrum / 14-form-validation-spec / 15-type-spec /
17-planning-spec / 18-behavior-spec / 19-acceptance-criteria / 20-test-spec / 21-impl-spec /
22-traceability-matrix / 23-characterization-spec / 24-sql-inventory
```

★ 결번 #16 (★ ★ v1.5 error-mapping 신설 시 결번 본격 사실 — `deliverables/16-error-mapping-spec.md` 본격 부재 / `methodology-spec/README.md` 본격 인용 only). 본격 ★ ★ 결번 의미 = ★ ★ "산출물 #16 본격 별도 영역 / file 부재 carry" (★ 의미 영역 보존 의무).

### 2.3 영향 범위 본격 (★ 본격 grep 실측)

`grep -rln "deliverables/[0-9]"` 본격 79 file (★ active scope / archive + CHANGELOG-HISTORY 제외):
- tools/*/README 9+ file (★ validator 자체 인용)
- docs/adr/*.md 다수 (★ ADR 본격 references)
- decisions/DEC-*.md 다수 (★ 결정 이력 본격 references)
- methodology-spec/ 자체 영역 다수

★ skill rename 42 file 의 약 2배 영향 — ★ ★ scope 큼.

## 3. 결단 본격 권고

### 3.1 ★ ★ ★ 보존 권고 (★ ★ ★ Recommended)

**deliverables/ 숫자 prefix 본격 ★ 보존**. 본격 사유:

1. ★ ★ ★ **id-conventions §2 정합 의무** — "산출물 #N" 본격 SSOT 영역 / ID axis 본격 의미 명확
2. ★ ★ **사용자 직접 인용 영역** — "산출물 4 의 BR", "deliverable 22 traceability-matrix" 본격 자연어 인용 다수 / 숫자 본격 사용자 인지 부담 ❌
3. ★ ★ **skill phase-N 와 본격 다름** — skill phase-N = ★ "혼란 source" (phase ID axis 와 충돌) / deliverables N = ★ ★ unique ID 본격 / 혼란 ❌
4. ★ ★ ★ **재작업 위험** — 79 file 본격 cascade 갱신 의무 / id-conventions §2 본격 재정의 / schemas 명명 정합 본격 / ROI ❌
5. ★ **산업 표준 정합** — RFC / ISO 본격 "산출물 번호 ID" 본격 산업 표준 패턴 정합 (★ Section 1 / Section 2 / ...)

### 3.2 ★ 진화 권고 (★ ❌ Not Recommended)

deliverables 본격 의미 ID 진화 시 본격 사실:
- `1-architecture.md` → `architecture.md` (★ 의미 ID 본격 = "architecture")
- 단 ★ ★ ★ id-conventions §2 본격 ID 번호 axis 본격 폐기 의무 — ★ ★ "산출물 #5" 본격 인용 → "산출물 business-rules" 본격 전환 의무
- 79 file 본격 cascade 갱신 / 사용자 인용 영역 본격 전환 carry 본격 다대
- ★ ★ ★ ROI 본격 ❌ — skill phase-N 폐기 본격 ROI = ★ 혼란 해소 명확 / deliverables 번호 폐기 본격 ROI = ★ ❌ (★ 이미 unique ID / 혼란 source ❌)

## 4. 사용자 결단 본격 확정 (2026-05-14 / 윤주스)

| # | 결단 항목 | 본격 확정 |
|---|---|---|
| 1 | deliverables/ 숫자 prefix 본격 보존 vs 의미 ID 진화 | ✅ **보존 본격 확정** |

★ ★ ★ 보존 결단 본격 → **plan-c 본격 종결 / carry 0 / 79 file cascade 갱신 ❌ / id-conventions §2 본격 보존 / sub-axis 본격 진화 영역 ❌**.

## 4.1 본격 종결 paradigm (★ 본격 자산화)

★ ★ v2.6.0 paradigm 본격 사상 = ★ ★ ★ **axis 별 sub-axis 진화 결단 paradigm**:
- ★ skill phase-N axis = ★ ★ 본격 폐기 (★ v2.6.0 의미 ID 본격 자산화 / 혼란 source 영역 본격 해소)
- ★ deliverables N axis = ★ ★ ★ 본격 보존 (★ unique ID 영역 / id-conventions §2 SSOT 정합 / 재작업 ROI ❌)

본 paradigm 본격 = ★ ★ ★ ★ "각 axis 별 본격 사실 평가 + 본격 진화 ROI 평가 + 사용자 결단 본격 의무" — 단순 평탄화 paradigm ❌ + axis 별 sub-axis 결단 paradigm ✅. ★ memory `feedback_quality_priority.md` 정합 (재작업 최소화 2순위 영역).

## 5. 본격 종결 paradigm

v2.6.0 본격 = ★ skill phase-N 본격 폐기 (혼란 source 영역 본격 해소). deliverables 본격 = ★ ★ unique ID 영역 본격 보존 — ★ ★ skill 영역 paradigm 진화 ≠ deliverables 영역 paradigm 진화. 본 paradigm 본격 = **★ ★ ★ axis 별 본격 sub-axis 진화 결단 paradigm** (★ ADR-008 이중 렌더링 사상 + ADR-CHAIN-011 §9 LL-i-49 dual axis 정합 영역).

★ memory `feedback_quality_priority.md` 본격 정합 — "재작업 최소화 2순위" 본격 영역 / 본격 ROI ❌ 영역 본격 보존 paradigm.
