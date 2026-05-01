# Phase 5-2-c: visual (시각 산출 명세 추출)

> 본 문서는 Phase 5-2-c (`/analyze-visual`) 의 명세다. ★ v1.4 Stage 3-1 신설.
> 짝: `phase-5-2-a-ui-base.md` (UI 기본) / `phase-5-2-b-state.md` (분산 상태)
> deliverable: `9-visual-manifest.md` (관련 schema: `visual-manifest.schema.json`)
> ADR: ADR-FE-002 §2.3 (★ visual 예외 — binary 진실) + ADR-FE-005 (Playwright + axe-core) + ADR-009 §2.4.2 (binary trust path)

---

## 1. 목적

FE 코드의 **시각 산출** (snapshot PNG + a11y 검증 결과) 추출.

사용자 요구 3 ("UI visible 차원") 정면 해소.

⚠️ **본 Phase 는 ★ binary 진실 모델** (ADR-FE-002 §2.3):
- 다른 6 산출물 = JSON 진실 + drift-validator 적용 ✅
- 본 phase = **★ snapshot PNG (binary) 진실 + drift-validator ❌ / Playwright snapshot diff ✅**

---

## 2. 입력

| 입력 | 비고 |
|---|---|
| FE 빌드 (production-like) | dev server 또는 static build |
| Phase 5-2-a 결과 | ui-spec.json (PAGE-XXX cross-link) |
| Phase 5-2-b 결과 | state-map.json (FSM-XXX cross-link / state setup) |
| 디자인 baseline (있을 시) | git-lfs 또는 별도 baseline branch |
| Playwright config | viewport matrix |
| axe-core config | WCAG level (2.1-AA / 2.2-AA) |

---

## 3. 처리

```mermaid
flowchart TB
    BUILD["FE 빌드 + dev server"]

    BUILD --> P5_2_c["Phase 5-2-c"]

    P5_2_c --> S1["★ Playwright 진짜 실행<br/>(toHaveScreenshot + viewport matrix)"]
    P5_2_c --> S2["★ axe-core 진짜 실행<br/>(axe.run() per page)"]

    S1 --> H1["SHA-256 hash 계산"]
    S1 --> B1["baseline 비교 (있을 시)"]

    H1 --> M["visual-manifest.json"]
    B1 --> M
    S2 --> M

    M --> R1["snapshots/desktop/*.png"]
    M --> R2["snapshots/tablet/*.png"]
    M --> R3["snapshots/mobile-portrait/*.png"]
    M --> R4["snapshots/mobile-landscape/*.png"]

    M -.|drift-validator ❌|.-> X["semantic 비교 ❌"]
    M --> H["사람 검토<br/>(baseline 승인)"]

    style S1 fill:#d1ecf1
    style S2 fill:#d1ecf1
    style X fill:#f8d7da,stroke-dasharray:5
    style H fill:#fff3cd
```

### 3.1 viewport matrix 정의 (★ 의무)

```yaml
viewport_matrix:
  - {label: desktop,         width: 1440, height: 900,  dpr: 1.0}
  - {label: tablet,          width: 768,  height: 1024, dpr: 2.0}
  - {label: mobile-portrait, width: 375,  height: 667,  dpr: 2.0}
  - {label: mobile-landscape, width: 667, height: 375,  dpr: 2.0}
```

### 3.2 ★★★ no-simulation 정책 강제 (ADR-FE-002 §2.3)

본 Phase 는 **진짜 도구 실행 의무**:

```yaml
captured_by enum:
  ✅ playwright_real    # 권장
  ✅ percy_real
  ✅ chromatic_real
  ✅ puppeteer_real
  ✅ cypress_real
  ❌ simulation         # ★ -5%p 패널티 + simulation_reason 의무

5종_물증_의무 (real 도구 시):
  - captured_by_version    # 도구 버전
  - stdout_path            # stdout 로그 경로
  - duration_ms            # 캡처 소요 ms
  - reproduction_command   # 재현 명령
  - result_hash            # 결과 종합 hash
```

→ schema 의 `if/then` 강제 (visual-manifest.schema.json `allOf`).

### 3.3 a11y 검증 (axe-core 진짜 실행)

```javascript
// 권장 절차 (Playwright + axe-core 통합)
const { AxeBuilder } = require('@axe-core/playwright');

await page.goto(pageUrl);
const results = await new AxeBuilder({ page })
    .withTags(['wcag21aa', 'wcag22aa'])  // ★ ADR-FE-005 §2.2.2 ratchet path
    .analyze();
```

→ `a11y_violations[]` inline 저장. `wcag_level` enum (`2.1-AA` / `2.2-AA`) 명시.

★ Stage 3-2 a11y deliverable 신설 시 별도 산출물로 분리 검토.

### 3.4 baseline 관리

```mermaid
stateDiagram-v2
    [*] --> baseline_new: 신규 snapshot
    baseline_new --> baseline_pending_approval: 사람 검토 요청
    baseline_pending_approval --> match: 승인 (baseline_hash 갱신)
    baseline_pending_approval --> drift: 반려
    match --> drift: 차이 발견
    drift --> baseline_pending_approval: 의도적 변경 (재승인)
    drift --> match: 재캡처 통과
```

---

## 4. 출력

```
.ai-analysis/output/visual/
├── visual-manifest.json
├── snapshots/
│   ├── desktop/
│   │   ├── PAGE-HOME-001.png         # ★ binary 진실
│   │   └── ...
│   ├── tablet/
│   ├── mobile-portrait/
│   └── mobile-landscape/
├── baselines/                  # 사람 승인 baseline (git-lfs 또는 별도 branch)
└── _manifest.yml               # trust_level + 5종 물증
```

---

## 5. 승인 게이트

```
□ visual-manifest.json schema 검증 통과
□ viewport_matrix 정의 (≥ 1 항목)
□ 모든 snapshot 에 ID, page_id, viewport_label, snapshot_path, snapshot_hash 명시
□ snapshot_path 파일 실제 존재
□ snapshot_hash = SHA-256 64 hex chars
□ ★ captured_by ∈ [playwright_real, percy_real, chromatic_real, puppeteer_real, cypress_real]
□ ★ captured_by=simulation 시 simulation_reason 의무 + -5%p 패널티 표기
□ ★ real 도구 시 5종 물증 의무 (version / stdout / duration / reproduction / result_hash)
□ baseline_hash 비교 결과 diff_status 명시
□ a11y_violations inline (있으면) — wcag_level 명시
□ cross_links 의무 (ui-spec 또는 state-map 중 1개 이상)
□ baseline_management.update_authority 명시
```

---

## 6. 신뢰도 (★ ADR-009 §2.4.2 binary trust path)

| 단계 | 조건 | 신뢰도 |
|---|---|---|
| 1-2-3 | mermaid 검증 ❌ | ❌ N/A |
| 5 | Playwright/Percy/Chromatic 진짜 실행 | 85-92% |
| 6 | snapshot baseline + diff 0건 도달 | 90-95% |
| 7 | 사람 디자이너 리뷰 통과 | 95%+ |

★ simulation 시 -5%p 패널티.

---

## 7. 흔한 함정

deliverable 9 §12 정합:
- flaky test (애니메이션 / 폰트 race)
- dynamic content (timestamp / random)
- font drift (폰트 로딩 안 됨)
- viewport 변경 누락
- simulation 누락

→ 각 함정 = AP-FE-VISUAL-XXX 안티패턴 등록 (Phase 6).

---

## 8. ★ Stage 4 mini-PoC 진입 시 첫 검증

ADR-FE-002 §5.4 + DEC-Stage-2 G3-1 정합:
- Stage 3-1 종결 후 Stage 4 mini-PoC 진입
- RealWorld React fork 1개 / Playwright + axe-core 진짜 실행 1회
- ★ no-simulation 정책 첫 FE 실현 (BE Sprint 5 spectral 진짜 실행 패턴 정합)
- 신뢰도 0.75+ 도달 검증 (단계 5)

---

## 9. 다음

- Phase 6 (`/analyze-quality`) AP-FE-VISUAL-* 안티패턴 등록
- Stage 3-2 a11y deliverable 신설 시 a11y_violations 분리
- Stage 4 mini-PoC = 진짜 도구 실행 검증 / 단계 5 도달
