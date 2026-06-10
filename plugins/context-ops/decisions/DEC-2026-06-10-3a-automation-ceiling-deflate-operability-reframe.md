# DEC-2026-06-10-3a-automation-ceiling-deflate-operability-reframe

> **상태: 승인·반영 완료 (2026-06-10 / 사용자 승인 #1)** — 본체 정정 적용: CLAUDE.md §3-A 문단·표 + sub-rule §X(배너·X-E·X-F·carry line 144). (선택) chain-harness 1차 axis 공식 승격은 사용자 미선택 = 제외(carry).

**결단(제안)**: analysis 단계 **§3-A automation-ceiling** 을 (a) "Legacy 53~55% < Modern 60~67% paradigm ceiling / industry-first 정량화" **헤드라인 정량 주장**에서 → **"분석의 의미 계층(의도·도메인 의미·bug-vs-intent)은 결정론 환원 불가"라는 보조 정성 신호**로 **강등** + (b) charter carry **"사내 Modern 재측정 의무"** 를 *auto_ratio 재측정* 에서 → **chain-harness operability/correctness 측정**(산출물이 LLM 을 실제 운영하게 하느냐)으로 **재정의**.

**작성일**: 2026-06-10 (frontier D1 → Path A[§3-A 측정] 시도 → 측정방법 결함 발견·REVERTED → 사용자 "이런 측정이 무슨 의미·인사이트?" 환기 → (나) "axis 강등 + 재측정 의무 재정의" 채택 / 선행 확증 ① 통과).

**version**: bump 없음 (decision-record / 본체 정정은 승인 후 별도 / docs #6·#7 선례).

**relates to**:
- `CLAUDE.md` §3-A automation 표 + R1' (DEC-2026-05-13-r1-prime-본체-명문화) — 강등 대상
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X (X-A~X-F) — paradigm ceiling 정량 주장 본거지
- `examples/poc-06/07/11`(Legacy 4-artifact) + `poc-08/09/10`(Modern inventory-only) REPORT-day3-measurement.md — 본 결단의 증거
- `feedback_self_recorded_fact_validation` + `feedback_diagnose_before_design_check_existing` (1차 §3-A 측정 결함 적발 cycle) + `feedback_quality_priority` (노이즈 metric = charter 부채)
- plan `~/.claude/plans/plan-d1-epbegea-modern-s2-remeasure.md`

---

## 1. 배경 — D1 Path A 가 드러낸 것

frontier D1 "사내 Modern S2 재측정"의 §3-A axis 를 ep-be-gea 로 측정 시도 → 본체 격상 5파일까지 갔다 **측정방법 2중 결함**(필드명 휴리스틱·축 불일치 우려)으로 전량 revert. 이후 환기 결과 — 결함은 측정 *방법*만이 아니라 **metric 자체가 무엇을 재고 무슨 인사이트를 주는가**에 있었음.

## 2. 확증된 증거 (선행조건 ① / 실측)

### 2-A. Legacy/Modern ceiling 은 측정 범위가 비대칭

| PoC | paradigm | 측정 범위 | §3-A |
| --- | --- | --- | --- |
| #06/#07/#11 | Legacy | **4-산출물 평균** (inventory+domain+rules+antipatterns / REPORT 분해표 명시) | 38.75 / 53.8 / 52.5% |
| #08/#09/#10 | Modern | **inventory 산출물 1개만** (분해표 없음 / "평균" 오라벨 / domain·rules·AP 측정블록 0) | 66.7 / 63.6 / 60% |

poc-08 "평균 auto_ratio 66.7%" === inventory 측정블록 8/12 = 66.7% (동일값). Modern REPORT·DEC 어디에도 4-산출물 분해 없음.

### 2-B. 비교 가능한 산출물(inventory)끼리는 paradigm gap 없음

inventory auto_ratio: Legacy 60/75/70% vs Modern 60/63.6/66.7% — **겹침**. 표의 "38.75 → 66.7" gap 은 Legacy 가 의미-heavy 산출물(rules 29·AP 22)을 평균에 포함하고 Modern 은 제외한 **측정 범위 차이의 산물**.

### 2-C. metric 자체가 analyst-주관적·noisy

같은 Legacy·같은 산출물 rules.json auto_ratio 가 poc-06 **29%** ↔ poc-07/11 **50%** = **+21%p 출렁**. 동일 stack 에서 이 분산은 "자동 가능 aspect 열거"가 분석가 판단에 크게 좌우됨을 입증. paradigm ceiling(±몇 %p) 주장을 떠받칠 정밀도 미달.

### 2-D. 사과-사과로 재면 사내 Modern ≈ Legacy

ep-be-gea 4-산출물(poc-06 동일 방식 / analyst 판정): inventory ~60 · domain ~33 · business-rules ~30 · antipatterns ~27 → **평균 ≈ 37.5%** ≈ Legacy poc-06 38.75%. (단 analyst 판정 / ±10%p — 2-C 의 noise 한계 동일 적용 / 본 수치는 "정밀 corroboration"이 아니라 "범위 비대칭 제거 시 gap 소멸" 방향 증거.)

## 3. 결론

1. **paradigm-cross §3-A ceiling 정량 주장(Legacy 53~55% < Modern 60~67% / ~10%p gap)은 측정 비대칭 + analyst noise 의 산물 = 근거 약함.** "industry-first paradigm-cross quantification" 자부는 과대.
2. **§3-A auto_ratio 는 대상 코드/paradigm 보다 "그 산출물 스키마가 기계적 필드를 몇 개 갖느냐 + 분석가의 aspect 열거"를 잰다** = 입력측·스키마 모양 metric. 이 방법론의 P0(산출물 = LLM 운영 컨텍스트 / AX 운영)와 직결되는 출력측(정합성·운영가능성)을 0% 측정.
3. 남는 견고한 진실은 **정성적**: 분석의 의미 계층(의도·도메인 의미·bug-vs-intent)은 결정론 환원 불가 → 이게 진짜 ceiling이고 paradigm 아닌 **산출물 종류**가 가름 → 방법론에 사람 gate + characterization(phase 4.7)이 존재하는 이유. 숫자가 추가로 알려준 것 없음(PoC 주석이 처음부터 적은 사실).

## 4. 결단 상세

### (a) §3-A 강등
- CLAUDE.md §3-A 표 + sub-rule §X 의 **정량 paradigm ceiling 주장 → 정성 신호로 격하**. 수치는 "측정 비대칭·analyst noise 로 paradigm gap 미입증 / inventory-only(Modern) vs 4-artifact(Legacy)" flag 동반.
- R1'(paradigm 별 ceiling 형성) = "방향성은 외부권위(Wang/Gartner) 정합하나 본 PoC 의 정량 gap 은 측정 비대칭으로 미입증" 로 약화. AWS SCT/Amazon Q 자릿수 정합은 **migration 공수 sanity heuristic** 으로만 보존.
- **완전 삭제 ❌** (steelman): 의미-계층 비환원성 정성 신호 + migration 공수 directional heuristic 가치 잔존.

### (b) "사내 Modern 재측정 의무" 재정의
- *auto_ratio 재측정* → **operability/correctness 측정**: 산출물 컨텍스트로 LLM 이 실제 작업(기능추가·수정·질의)을 해내나(operability) + 추출이 맞나(correctness) + 빠뜨림(coverage) + gate 검토 부담(chain-harness ≤15% axis).
- 이 중 operability·review-burden 은 **이미 chain-harness axis(70~80%/gate)가 재는 것** = 새 측정 발명 ❌, 무게 재배치.
- **ep-be-gea 가 이미 올바른 신호를 줌**: reservation-golf discovery→test 진행 중 **god-method 천장(gate#4 backward 23.1%)** = "이 사내 Modern 코드는 god-method 라 특성화·운영가능성 확보가 어렵다"는 실제 발견. auto_ratio 37%보다 훨씬 값진 사내 Modern 신호.

## 5. §8.1 / 정직 경계

- 본 디플레이트는 §3-A 헤드라인 정량 주장을 한 세션 발견으로 약화하는 charter급 변경 → 증거는 **2-A(구조적 확정)·2-C(데이터 확정)** 가 떠받침(2-D ep-be-gea 수치는 analyst 판정 보조). 즉 "gap 미입증"은 grounded, "사내 Modern 정확 수치"는 미주장.
- Modern PoC 가 4-산출물을 비공식 측정했을 가능성은 배제 못 함(저장 안 했을 뿐) — 그래도 **"공개 증거상 Modern ceiling 은 inventory-only"**는 사실. 비대칭 자체가 결함.
- 본 DEC = decision-record. 본체 정정(CLAUDE.md/sub-rule)은 승인 후.

## 6. 본체 반영 계획 (승인 시 / ③)

1. CLAUDE.md §3-A 표 + 인접 문단: paradigm ceiling 정량 주장 → 정성 신호 + 비대칭 flag / "재측정 의무" → operability 재정의.
2. sub-rule §X (X-A~X-F): paradigm ceiling 정량 주장 약화 + 2-A/2-C 증거 + carry 표 갱신.
3. R1' 가설 상태 = "정량 gap 미입증 / 방향성만 외부권위 정합".
4. (선택) §3-A 를 "보조 정성 axis"로 명시하고 chain-harness axis 를 사내 Modern 측정의 1차 axis 로 승격.

## 7. carry

- ep-be-gea operability 측정 = Path B(reservation-golf test gate#4 god-method / impl real DB) 와 합류 = 진짜 "사내 Modern 재측정"의 본체.
- §3-A metric 의 analyst-noise(2-C) 자체를 finding 으로 둘지(측정 프로토콜 폐기 vs 정성화) = 본 강등에 흡수.
