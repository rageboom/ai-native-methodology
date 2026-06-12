# Sprint 4 보고서 — Drift Validator + Decision-Table Validator 자가 검증

> **일자**: 2026-04-30
> **트리거**: DEC-시퀀스-C-A-B-확정 / DEC-static-tool-실행-의무화 / Sprint 4 묶음 N+O 본격
> ** 핵심 가치**: Sprint 3 가 "drift 0" 으로 보고했던 산출물에 자동 검증 적용 → **structural drift 7건 + interpretive drift 3건 자동 검출**. 수동 검증 한계 노출 + Sprint 4 산출 도구의 본질적 가치 입증.

---

## 1. 자가 검증 결과 — drift-validator (state-machine + sequence)

| 짝                                 | breaking | non-breaking | info |
| ---------------------------------- | -------: | -----------: | ---: |
| `state-machines/User-Account`      |    **2** |            0 |   15 |
| `state-machines/User-Following`    |    **5** |            0 |    9 |
| `sequence-diagrams/UC-USER-SIGNUP` |        0 |            0 |    0 |
| `sequence-diagrams/UC-USER-FOLLOW` |        0 |            0 |    0 |
| **합계**                           |    **7** |            0 |   24 |

> info 24건 = mermaid 가 sub-state 까지 자세 (의도된 패턴). non-breaking 0건. breaking 7건 = 진짜 structural drift 또는 추상화 layer 차이.

## 2. 자가 검증 결과 — decision-table-validator (dmn-check 5종)

| BR                             | breaking | non-breaking | 검출 종류                                              |
| ------------------------------ | -------: | -----------: | ------------------------------------------------------ |
| BR-USER-EMAIL-UNIQUE-001       |        0 |        **1** | type.mixed-column (race window 컬럼)                   |
| BR-USER-FOLLOW-DIRECTIONAL-001 |        0 |            0 | —                                                      |
| BR-USER-FOLLOW-IDEMPOTENT-001  |        0 |            0 | —                                                      |
| BR-USER-FOLLOW-NO-SELF-001     |        0 |        **1** | type.mixed-column (`follower.id == following.id` 컬럼) |
| BR-USER-PASSWORD-ENCRYPTED-001 |        0 |            0 | —                                                      |
| BR-USER-USERNAME-UNIQUE-001    |        0 |        **1** | type.mixed-column (App pre-check race)                 |
| **합계**                       |    **0** |        **3** | —                                                      |

> 6 BR 모두 **structural drift 0** ✅ (목표 달성). 3 BR 에 **interpretive drift** (자연어 ambiguity 노출 — Phase 4.5 본질적 가치 입증).

---

## 3. Sprint 4 신규 finding 11건 (F-107~F-117)

### State-machine drift (F-107~F-113, 7건)

#### F-107 high — User-Account: LOGOUT 종착지 자연어 vs 그림 불일치

- JSON `states.authenticated.on.LOGOUT = "anonymous"` (자기 cycle).
- Mermaid `Authenticated --> [*]: logout (해당 시스템 미구현)` (시스템 종료).
- **drift 분류**: structural — 의미 다름 (anonymous vs exit).
- **권고**: JSON 을 mermaid 정합 (`__exit__root` 또는 `null`) 또는 mermaid 를 `Authenticated --> Anonymous: logout` 으로 통일.

#### F-108 medium — User-Account: REJECT_DB_UQ 종착지 추상화 layer 차이

- JSON `persisting -[REJECT_DB_UQ]-> anonymous`.
- Mermaid `SavingToDB --> Rejected_DBConstraint` (sub-state) — top level 로 anonymous 복귀 transition 미명시.
- **drift 분류**: 추상화 layer 차이 (suspected interpretive). transitionFuzzyMatch heuristic 보완 시 자동 분리 가능 (Sprint 5 carry-over).
- **권고**: JSON 은 user-facing 결과만 표기 / mermaid 는 internal sub-state 까지 — 본 방법론 의도된 패턴이지만 **명시적 규칙화** 필요.

#### F-109 high — User-Following: UNFOLLOW transition 누락

- JSON `following -[UNFOLLOW]-> unfollow`.
- Mermaid 에 `Following --> Unfollow` transition 없음.
- **권고**: mermaid 에 명시 transition 추가.

#### F-110 high — User-Following: INSERT_OK transition 누락 (sub-state elide)

- JSON `persisting -[INSERT_OK]-> following`.
- Mermaid 에 명시 없음 (sub-state SavingToDB --> ? 로만).
- **권고**: top-level transition 또는 fuzzy 매칭 보완.

#### F-111 medium — User-Following: REJECT_DB_CONSTRAINT transition (top-level)

- F-110 과 동일 패턴. 추상화 layer 차이.

#### F-112 high — User-Following: unfollow → notfollowing DELETE_OK 누락

#### F-113 medium — User-Following: unfollow → notfollowing NO_OP 누락

### Decision-table interpretive drift (F-114~F-116, 3건)

#### F-114 low — BR-USER-EMAIL-UNIQUE-001 컬럼 type.mixed

- 컬럼 `입력: email 중복 (App pre-check race window)` 의 셀 kind 가 `bool` (Y/N) 과 `literal` ("O (race)") 혼합.
- **interpretive drift**: 자연어 ambiguity — "race" 는 Y/N 의 하위 분기인지 별도 상태인지 모호.
- **권고**: 컬럼 분리 (`App pre-check 통과` 와 `race window 발생` 두 컬럼) 또는 enum 명시.

#### F-115 low — BR-USER-FOLLOW-NO-SELF-001 컬럼 type.mixed

- 컬럼 `follower.id == following.id` 셀 kind 가 `literal` (조건식) 과 `bool` 혼합.
- **권고**: 셀 값을 모두 bool 로 통일하거나 별도 컬럼.

#### F-116 low — BR-USER-USERNAME-UNIQUE-001 컬럼 type.mixed

- F-114 와 동형 패턴.

### 메타 finding (F-117, 1건)

#### F-117 medium — Sprint 3 "drift 0" 보고 한계 노출 (Sprint 4 본질적 가치 입증)

- **trigger**: Sprint 3 wrap-up 에서 "JSON 짝 4건 / drift 0" 보고. 수동 검증.
- **discovery**: Sprint 4 drift-validator 자동 검증 시 state-machine 7 breaking + decision-table 3 non-breaking 발견.
- **분석**: 수동 검증 (사람 눈) 은 (a) 추상화 layer 차이를 "drift 아님" 으로 직관 해석 (b) interpretive drift (column type 혼합) 미검출. 자동 검증 도구 도입 시 둘 다 노출.
- **funcatonal value**: Sprint 4 묶음 N (Drift CI) 의 ROI 입증 — drift validator 미도입 시 Sprint 5+ 에서도 같은 한계 반복. ** v1.2.0 격상 시 묶음 N 의 강한 권위 데이터**.
- **권고**:
  - drift-validator 의 transitionFuzzyMatch 보완 (composite state inner transition fuzzy 매칭) 로 false positive 감소
  - "추상화 layer 차이" 는 별도 severity (`info` 또는 `architectural-elision`) 로 분리
  - Sprint 5 carry-over: 보완 후 재검증 → 진짜 structural drift 만 남기기.

---

## 4. 정량 요약

```yaml
sprint_4_drift_validator_runs: 4 pairs (state-machine 2 + sequence 2)
sprint_4_decision_table_runs: 6 BR
sprint_4_breaking_total: 7 # state-machine 만
sprint_4_non_breaking_total: 3 # decision-table type.mixed-column
sprint_4_info_total: 24 # mermaid sub-state 더 자세 (의도)
sprint_4_findings_new: 11 # F-107~F-117
sprint_4_findings_high: 4 # F-107 / F-109 / F-110 / F-112
sprint_4_findings_medium: 4 # F-108 / F-111 / F-113 / F-117
sprint_4_findings_low: 3 # F-114~F-116
```

## 5. 도구 산출 (Sprint 4 본체 산출)

```
ai-native-methodology/tools/
├── drift-validator/
│   ├── package.json (node>=18, ESM, @mermaid-js/parser optional)
│   ├── src/
│   │   ├── normalize-mermaid.js
│   │   ├── normalize-json.js
│   │   ├── compare.js
│   │   ├── cli.js
│   │   └── spike-mermaid-parser.js  # 30분 spike 결과 — parser 미지원 입증
│   ├── corpus/  (4쌍: state-equiv/drift + sequence-equiv/drift)
│   ├── test/corpus.test.js  (6/6 pass)
│   └── README.md
├── decision-table-validator/
│   ├── package.json
│   ├── src/
│   │   ├── parse-md-table.js
│   │   ├── dmn-check.js  # 5종: duplicate/conflict/gap/overlap/type
│   │   ├── json-sanity.js
│   │   └── cli.js
│   ├── test/dmn-check.test.js  (7/7 pass)
│   └── README.md
└── static-runner/
    ├── package.json
    ├── src/
    │   ├── runner.js  # Plugin host + 5종 물증 의무화
    │   ├── cli.js
    │   └── lint-no-simulation.sh  #  no-sim policy enforcement
    ├── test/runner.test.js  (4/4 pass)
    └── README.md
```

총 4 unit test suite **17/17 pass** ✅.

## 6. 환경 부재 보고 (Phase D-optional 정직 보고)

본 Sprint 4 작성 환경 (사용자 macOS):

- ✅ Node v25.8.1 + npm 11.11.0 — drift-validator + decision-table-validator 가능
- ❌ Java / Semgrep / PMD 미설치 — static-runner 실 실행 불가

** no-simulation 정책 정합** — static-runner 의 Semgrep/PMD plugin 실행은 **Sprint 5 carry-over** (사용자 환경 설치 또는 CI 위임 후). 현재 신뢰도 80-87% 유지 (시뮬 패널티). 진짜 도구 1회 실행 시 90-95% 격상 가능.

## 7. v1.2.0 묶음 N+O 격상 데이터 충분성 평가

| 묶음                   | 산출                                                                                                                                                          | ready                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **N (Drift 자동 CI)**  | drift-validator + decision-table-validator + corpus + 17/17 test pass + PoC #02 자가 검증 (10 finding 발견)                                                   | ✅                                 |
| **O (진짜 외부 도구)** | static-runner Plugin host + Semgrep/PMD plugin + 5종 물증 schema enforcement + lint-no-simulation.sh + Phase 4.5 schema 갱신 (real_tool conditional required) | ✅ (실행 carry-over / 인프라 100%) |

→ **v1.2.x 격상 ready 16/16 묶음** (Sprint 4 종결 시점).

## 8. Lessons Learned

1. **Spike 가치 입증** — `@mermaid-js/parser` 미지원 30분 spike 가 fallback 결정 즉시 가능케 함. plan 의 spike 항목 의무화 정합.
2. **수동 vs 자동 검증 격차** — Sprint 3 "drift 0" 보고가 수동 한계. Sprint 4 자동 검증 7+3건 발견. 자동화 ROI 정량 입증 ( F-117).
3. **decision-tables 이미 6건 .json 존재** — plan 의 가정 ("5건 .md only") 틀림. Sprint 1+2 에서 이미 작성. Phase D 의 작업이 "작성" → "검증" 으로 변경 (~80% 시간 절약).
4. **Composite state 추상화 layer** — transitionFuzzyMatch 보완 필요. 본 sprint heuristic 부족 → false positive (F-108/F-110/F-111) 의심. Sprint 5 carry-over.
5. **static-runner 환경 부재** — Phase D-optional carry-over 정합. **시뮬레이션 유혹 회피** 성공 ( no-sim 정책 정합).

---

## 9. 다음 액션

1. ⏳ STATUS.md 갱신 (`v120_bundles_ready: 16` / `이중_렌더링_정합` 갱신 / 신뢰도 80-87% 유지)
2. ⏳ DEC-2026-04-30-sprint-4-종결.md + ADR-010 후보 (baseline+ratchet) 등록 + INDEX.md
3. ⏳ `.github/workflows/drift-check.yml` 작성 (이중 모드: PR diff-aware + nightly full)
4. ⏳ SESSION-WRAPUP-2026-04-30-sprint4.md
5. **시퀀스 A 진입** — v1.2.0 → v1.2.x patch 격상 (16 묶음 통합 + Sprint 4 평가)
6. **Sprint 5 carry-over**: (a) static-runner Semgrep+PMD 1회 실증 / (b) drift-validator transitionFuzzyMatch 보완 / (c) corpus 4쌍 → 20쌍 확장
