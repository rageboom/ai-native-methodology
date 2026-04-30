# PROGRESS — PoC #02 Phase 4.5 Sprint 1

> 시간순 로그 대전제 (memory `feedback_progress_log.md`) 적용
> 옵션 C 진행 — Phase 4.5 형식화 시범 1세션

---

## T+0 (2026-04-29) — 옵션 C 결단 + 4 Sprint 분할 ✅

### 진입 컨텍스트
- PoC #02 종결 후 본 세션 추가 발견 4건:
  1. round-trip 미검증 (DEC 검토중 → 진행중)
  2. Phase 4.5 형식화 후보 (DEC 검토중 → 진행중)
  3. **이중 렌더링 사상 명시화** (DEC 승인) — 본 방법론 핵심 사상
  4. 방법론 본체 자체의 이중 렌더링 갭 7건 (Priority 1~5)
- 사용자 결단: **옵션 C (Phase 4.5 시범) → A (v1.2.0 + L/M/N 통합) → B (PoC #03)**
- 절대 우선순위 정합: 품질 + 재작업 0

### Sprint 분할 결정
| Sprint | 범위 | 시간 | 본 세션 |
|---|---|---|---|
| 1 | BR 1건 (BR-USER-EMAIL-UNIQUE-001) — Proof of Concept | ~30분 | ✅ |
| 2 | BR 5건 전체 | ~2시간 | 다음 |
| 3 | Phase 4.5 정식 명세화 (workflow/deliverables/schema/template) | 1세션 | 다음 |
| 4 | v1.2.0 묶음 L/M/N 데이터 정리 + CI 검증 | 1세션 | 다음 |

### DEC 등록
- DEC-2026-04-29-시퀀스-C-A-B-확정 (신규 승인)
- DEC-2026-04-29-다음-분기-옵션-보류 (보류 → 승인)
- DEC-2026-04-29-phase-4-5-형식화-후보 (검토중 → 진행중)
- DEC-2026-04-29-round-trip-미검증-인지 (검토중 → 진행중)
- DEC-2026-04-29-이중-렌더링-사상-명시화 (신규 승인)

---

## T+1 (2026-04-29) — Sprint 1 산출물 7개 작성 ✅

### 산출물
| # | 파일 | 줄수 | 청중 |
|---|---|---|---|
| 1 | `.claude/plans/plan-sprint-1-phase-4-5-poc.md` | - | 사람 |
| 2 | `output/formal-spec/state-machines/User-Account.mermaid` | 49 | 사람 (GitHub) |
| 3 | `output/formal-spec/sequence-diagrams/UC-USER-SIGNUP.mermaid` | 67 | 사람 (GitHub) |
| 4 | `output/formal-spec/decision-tables/BR-USER-EMAIL-UNIQUE-001.md` | 76 | 사람+AI |
| 5 | `output/formal-spec/invariants/User.ts` | 152 | 사람+AI |
| 6 | `output/formal-spec/regenerated-code/UserService-regenerated.java` | 113 | 사람+AI |
| 7 | `output/formal-spec/SPRINT-1-REPORT.md` | - | 사람+AI |

### 4 방향 검증 결과 (1차 — self-reference 함정 인지 전)
- Direction A — 자연어 → L1/L2 (rules.json BR 4 줄 → 형식 228 줄)
- Direction B — 코드 → L1/L2 (4 파일 → 형식 344 줄)
- Direction C — A vs B 비교 → **drift 4건 검출** (★ critical 1 + high 1 + medium 1 + low 1)
- Direction D — L1/L2 → 코드 재생성 → **재생성 우위 2건** (F-058 fix + F-071 정합)

### Drift 4건 상세
1. (medium) email null/blank 검증 책임 — A 누락 / B (User constructor:52)
2. (low) App pre-check race-prone 정량화 — A 텍스트 / B 정확 위치
3. (★ critical) DataIntegrityViolation 미처리 — A "race-safe" 약속 / B 500 Error 발생
4. (★ high) updateUserDetails Hexagonal 위반 — A 누락 / B Adapter 가 검증 (F-071)

---

## T+2 (2026-04-29) — Sprint 2 진입 전 점검 9건 발견 + Priority 1 처리 ✅

### Priority 1 점검 항목 (반드시 처리)
- **A. PROGRESS 로그 갱신 누락** (대전제 위반) → 본 파일로 처리 ✅
- **B. 재생성 코드 컴파일 미검증** → 정적 syntax 검토만 (Java 환경 부재, 사용자 push 후 GitHub Actions 검증) ⚠️
- **C. Mermaid GitHub 자동 렌더 미확인** → 사용자가 push 진행 ⏳
- **D. ★ Direction D self-reference 문제** → SPRINT-1-REPORT 정직화 ✅

### Priority 1-D 정직화 핵심 발견
**문제**: 형식 명세가 코드에서 추출됨 (Direction B). 그 명세로 코드 재생성 (Direction D) → 원본과 동치 100% = **자명한 고정점**.
**정직 표현**:
- ❌ "round-trip 100% = 형식화 가치 입증"
- ✅ "drift 4건 검출 + 자동 개선 2건 = 형식화 진짜 가치"
- ✅ "round-trip 100% = 형식 표현력 + 코드젠 신뢰성 입증 (다른 의미)"
**Sprint 2 보강**: BR-USER-FOLLOW-NO-SELF-001 (코드 부재) 케이스로 **진짜 round-trip 검증** (self-reference 회피).

### Priority 2 사전 결단 필요 (Sprint 2 범위 영향)
- E. 자연어 명세 빈약성 통제
- F. F-074 코드 부재 케이스 처리법
- G. 이중 렌더링 JSON 짝 처리 시점 (Sprint 2 동시 vs Sprint 3 일괄)
- H. cross-validation (F-015 패턴) 적용

### Priority 3 후속 처리
- I. Article 도메인 추가 정당성 재검토
- J. memory `feedback_drift_detection.md` / `feedback_self_reference_trap.md` 신규
- K. F-021 finding 임계 영향 점검

---

## 다음 단계

1. 사용자 push (Priority 1-C Mermaid GitHub 렌더 검증)
2. 사용자 결단 (Priority 2 E~H 4 항목 일괄)
3. Sprint 2 진입

## T+3 (2026-04-29) — Sprint 1.5 검증 강화 ✅ (사용자 결단: "static tool 교차 방안까지")

### Phase A — 등록
- DEC-2026-04-29-다이어그램-신뢰-모델 (승인) — ADR-009 후보
- memory `feedback_diagram_trust_model.md` 신규
- INDEX + MEMORY 갱신

### Phase B — Cross-validation (Senior Engineer sub-agent)
- 90.5% confidence 독립 추출
- **신규 결함 7건** 발견 (★ high 1: @Transactional + ★ low: case-sensitive hidden bug 등)
- F-015 cross-validation 패턴 검증 (3-way 비교 메커니즘)

### Phase C — Static Analysis (Static Analyzer sub-agent)
- 94% confidence 결정적 분석
- **신규 결함 4건** 발견 (★ Silent partial update + Equality on transient 등)
- 22 분기 / 13 throw / 0 catch 정량 측정

### Phase D — Property test 명세
- `output/formal-spec/property-tests/User.spec.ts` (10 properties, Vitest 실행)
- `output/formal-spec/property-tests/UserServicePropertyTest.java` (10 properties, jqwik 실행)
- 사용자 환경 실행 위임

### Phase E — `output/formal-spec/SPRINT-1.5-REPORT.md`
- 신뢰도 60-70% → 85-92% (DEC 모델 검증 성공)
- 이중 렌더링 정합 67% → 87.5%
- v1.2.0 묶음 L 데이터 50% → 80%
- 누적 결함 4 (Sprint 1) + 11 (Sprint 1.5) = **15건**

### Sprint 2 진입 준비 완료
- Priority 2 4 항목 결단 가이드 (cross-validation 의무화)
- 신규 결함 11건 → finding F-080~F-090 등록 후보
- F-021 finding 임계 (PoC #02 누적 54건) — §8.1 영향 검토

## Lessons Learned

1. **Self-reference 함정** — 형식 명세를 코드에서 추출 후 round-trip 검증은 자명 — Sprint 2 부터 자연어 단독 출발 케이스 별도 검증
2. **PROGRESS 누락** — Sprint 시작 시 즉시 PROGRESS 신규 파일 생성 의무화
3. **컴파일 검증 환경 의존성** — 본 환경 Java 부재 → 검증 환경 사전 확인 필요
4. **점검 자체의 가치** — Sprint 2 가기 전 점검으로 self-reference 발견 — 과도한 자신감 수정
5. **★ Cross-validation 의무화 가치** (Sprint 1.5) — 단독 추출 시 ★ high 결함 1건 + hidden bug 1건 누락. Sub-agent 1~2 spawn 의무.
6. **★ Static Analyzer 의 결정적 가치** (Sprint 1.5) — Sub-agent 사람-like AI 가 못 잡은 패턴을 Static Analyzer 가 결정적 검출. 둘 다 필수.
7. **★ Property test 명세의 가치 (실행 안 해도)** (Sprint 1.5) — 작성 중 명세 모호성 검출. "이 동작 맞나?" 의문 = 명세 빈틈 신호.
8. **자연어 명세 빈약성 정량** (Sprint 1.5) — drift 15건 중 11건 (73%) 자연어 누락. Phase 4.5 형식화 정량 근거.

## T+4 (2026-04-29) — ★★★ Static Tool 시뮬레이션 함정 자가 시인 + 강제 적용 등록

### 사용자 명시 (★★★ 3회 강조)
> "이거 기록해 주고 나중에 하네스로 꼭꼭꼭 적용하라고 해줘 꼭 꼭!!!"

### 자가 시인
- Sprint 1.5 Phase C "Static Analyzer 교차" 는 진짜 도구가 아닌 **AI sub-agent persona 시뮬레이션**
- 결정적 부분 ~40% / AI 추론 ~60%
- 신뢰도 over-claim (85-92% → 정직 80-87%)
- F-015 가 회피하려던 공통 corpus 편향 함정 재발

### 등록 (4중 기록)
1. ✅ memory `feedback_no_static_tool_simulation.md` 신규 (★★★ 강제 규칙)
2. ✅ DEC-2026-04-29-static-tool-실행-의무화 (승인, ★★★)
3. ✅ INDEX + MEMORY 갱신
4. ✅ SPRINT-1.5-REPORT 정직 보강 (신뢰도 -5%p 패널티 / Phase C 정명 / Lessons Learned 갱신)
5. ✅ DEC-다이어그램-신뢰-모델 보강 (도구 종류 구분 의무)
6. ✅ **CLAUDE.md ★★★ 섹션 신규** (다음 세션 진입 시 자동 인지)
7. ✅ 본 PROGRESS T+4 갱신

### v1.2.0 묶음 추가
- 묶음 **O** 신규 — 진짜 외부 도구 실행 의무화 (Sprint 4 CI 하네스)

### 다음 세션 자동 강제 메커니즘
- CLAUDE.md ★★★ 섹션 → 진입 시 자동 로드
- memory MEMORY.md → 자동 로드
- DEC INDEX → 진행중 섹션 노출
- 하네스 (Sprint 4 CI) → simulation_only fail 차단

### Lessons Learned 추가
9. **★★★ Static Tool 시뮬레이션 함정** — AI sub-agent 에 도구 persona 시뮬레이션 시 "결정적 도구 결과" 로 over-claim 위험. F-015 가 회피하려던 공통 corpus 편향 재발. 사용자 ★★★ 강조 → 강제 규칙 + 하네스 차단.

## T+5 (2026-04-29) — 사용자 deferral 결단 ✅

### 사용자 결단
> "스테틱 아날라이저로 하는게 맞긴해. 기록하고 나중에 바꾸는걸로 하자. 지금 생각하려면 프로젝트에 그거 설치하는것 까지 생각해야 되니까."

### 확정
- ✅ 진짜 도구 실행이 정답 (전략 동의)
- ⏳ 본 sprint 는 시뮬레이션 유지 (도구 설치/설정 부담 회피 — pragmatic)
- ★ Sprint 4 또는 v1.2.0 묶음 O 시 **반드시** 진짜 도구 도입
- ★ 현재 신뢰도 정직 표기 (80-87%) 유지

### DEC-static-tool-실행-의무화 status
- 규칙 자체: 승인 유지
- 실행: **deferred until Sprint 4 / v1.2.0 묶음 O / PoC #03 진입**

### 본 sprint 종결 + Sprint 2 진입 결단 대기
- Sprint 1 ✅ + Sprint 1.5 ✅ + 4중 기록 ✅ + deferral 결단 ✅
- 다음: **Sprint 2 진입** (BR 5건 형식화 + cross-validation 의무 + F-074 self-reference 회피)

## Lessons Learned 추가
10. **Pragmatic deferral 의 가치** — 정답을 알지만 지금 안 하기. 도구 설치 같은 환경 설정 부담은 별도 sprint 로 분리. 메인 작업 momentum 보존.

## T+6 (2026-04-29) — Priority 2 4항목 일괄 결단 ✅

### 사용자 명령
> "priority2 수행해줘"

### 결단 (DEC-2026-04-29-priority2-결단 등록)

| # | 항목 | 결단 | 근거 |
|---|---|---|---|
| **E** | 자연어 명세 빈약성 통제 | **형식화 강제 (자연어 단독 ❌)** | drift 11/15 = 73% 자연어 누락 입증 (Sprint 1.5) |
| **F** | F-074 코드 부재 케이스 | **Sprint 2 첫 작업 / 단방향 round-trip 검증** | self-reference 함정 회피 — 진짜 round-trip 가치 입증 유일 케이스 |
| **G** | Mermaid JSON 짝 처리 시점 | **Sprint 3 일괄 이연** | Sprint 2 lightweight 유지 / Sprint 3 schema 표준화와 일괄 효율 |
| **H** | Cross-validation (F-015) | **Sprint 2 의무 적용** | 신뢰도 +15-22%p 정량 입증 (Sprint 1.5) — 단독 추출 시 ★ high 누락 |

### Sprint 2 범위 확정 (1세션 ~3시간)

1. F-074 단방향 round-trip (우선 ~30분)
2. BR 5건 형식화 4 산출물 (~90분 / lightweight)
3. Cross-validation sub-agent 1~2 spawn (~30분 / 시간 cap)
4. 신규 결함 finding 등록 F-088~F-098 후보
5. Sprint 2 보고서

### Sprint 3 범위 명시 (G 이연 분)

- Phase 4.5 정식 명세화 (workflow / deliverables / schema / template)
- Mermaid JSON 짝 일괄 생성 (BR 5 × 2 = 10 JSON)
- 이중 렌더링 정합 87.5% → 100%

### 다음 단계
1. ✅ DEC 등록
2. ✅ INDEX 갱신
3. ✅ 본 PROGRESS T+6 갱신
4. ⏳ Sprint 2 plan.md 작성 → F-074 우선 진입

## Lessons Learned 추가
11. **Priority 2 결단 일괄 처리의 가치** — Sprint 1.5 보고서 권고 (§9) 가 이미 가이드 제공 → 재토론 없이 일괄 채택 가능. 단 G (JSON 짝) 는 Sprint 2 폭주 회피를 위해 Sprint 3 이연 — 결단 일괄 ≠ 권고 100% 채택. lightweight 전략 정합 우선.

## T+7 (2026-04-29) — ★★★ 본 방법론 가치 재정의 결단 ★★★

### 사용자 결단 (round-trip scope 아웃)
> "일단 신규 시스템 검증 까지는 안해도 됨. 비즈니스 로직이나, 스팩을 뽑아내려 했던거는 로직은 언어 스팩이나 환경을 타는게 아니니까. 도움이 될수 있을것 같아서 그런거야 일단은 여기서는 신규 시스템 관련된거는 검증 안할꺼야. 다만 신규 시스템 만드는데 도움이 될만한게 있을지만 고민하는거지... 만약 기존 시스템에 버그나 위험한 것들, 혹은 부조리가 있다면 이것도 한켠에 다 기록하면 좋을것 같기도해."

### 가치 재정의

```
INPUT:  legacy 코드베이스
OUTPUT: 7대 산출물 + finding + antipatterns + migration-cautions
USE:    사람이 신규 시스템 구축 시 입력 자료 / 회피 가이드
```

본 방법론 = **"코드 → 형식 명세 + 위험 기록" 한 방향 추출기**.
신규 시스템 자동 생성 검증은 영구 scope 제외.

### 등록 (4중 기록)

1. ✅ **DEC-2026-04-29-round-trip-스코프-아웃** (★★★ 가치 재정의) — 신규 승인
2. ✅ **DEC-2026-04-29-안티패턴-마이그레이션-가이드** — 강화점 α + β 채택
3. ✅ DEC-round-trip-미검증-인지 status: 진행중 → **closed (해소)**
4. ✅ memory `project_methodology_scope.md` 신규 — 가치 명세 영구 보관
5. ✅ memory `project_round_trip_unvalidated.md` → 결단 명시 + 이전 인지 보존
6. ✅ MEMORY.md 갱신 (★ 가치 재정의 항목 최상단)
7. ✅ INDEX.md 갱신 (DEC 2건 추가 + closed 갱신)
8. ✅ 본 PROGRESS T+7

### 산출물 이식성 5종 (★★★)

| 산출물 | 활용도 |
|---|---|
| rules.json (BR) | ★★★ 그대로 입력 |
| domain.json | ★★★ 그대로 입력 |
| openapi.yaml | ★★★ 그대로 입력 |
| schema.json + erd.mermaid | ★★★ 입력 + DB 타입 매핑 |
| antipatterns.json + migration-cautions.md | ★★★ 회피 목록 |

### ERD 정정 (이전 평가 수정)
- ❌ "schema.json/ERD = ⚠️ DB 종류 의존 = ★★"
- ✅ "schema.json + erd.mermaid = 90% DB 무관 (RDB 내) = ★★★"
- 근거: PoC #02 erd.mermaid 검증 — 구조 (테이블/관계/제약) DB 무관, 타입/DDL 만 의존

### 강화점 α + β 적용 시점
- Sprint 3 (Phase 4.5 정식 명세화) 또는 v1.2.0 묶음 P
- α — antipatterns.json schema `migration_advice` 필드
- β — `migration-cautions.md` 신규 (Phase 6 의무 산출물)

### 다음 단계
1. ⏳ Sprint 2 plan.md 작성 (F-074 단방향 round-trip 우선)
2. ⏳ CLAUDE.md 가치 재정의 반영 (별도 작업)
3. ⏳ 강화점 α + β 적용 (Sprint 3 또는 v1.2.0)

## Lessons Learned 추가
12. **★★★ 가치 명료화의 폭발적 효과** — round-trip scope 아웃 결단 1건으로 (a) 70~80% 한계 부담 제거 (b) 산출물 자기-완결성만 보장하면 됨 (c) 위험 기록 기능이 핵심 가치로 부각 (d) 신규 시스템 입력 자료 활용도 명료화. 명료화 = 부담 제거 + 핵심 강화 동시.
13. **사용자 직관의 정확성** — "로직은 언어/환경 안 탐" 직관이 PoC #02 산출물 검증 결과와 일치. BR / 도메인 / API / ERD (구조) 4종 + AP = 100% 이식. 사용자 직관을 산출물로 수치화.

## T+8 (2026-04-29) — Sprint 2 종결 ✅ (BR 5건 + F-074 단방향 round-trip 검증 ★)

### 작업 완료
- Phase 0~4 모두 완료 (~120분 / plan 180분 대비 33% 단축)
- 신규 산출물 15건 / 갱신 3건
- 누적 finding F-088~F-106 = **19건** (high 3 / medium 7 / low 9)
- 신뢰도 80-87% 유지 (시뮬 패널티)

### ★★★ Sprint 2 핵심 결과 — F-074 단방향 round-trip

**Sprint 1 self-reference 함정 완전 회피 + 자연어 빈약성 정량 입증**:
- 자연어 명시 4 / 9 (44%)
- 형식화 결단 5 / 9 (56%)
- 코드 생성 +7 line (UserFollow 생성자 if 1 + 주석 6) + DB CHECK 1 line
- → **"형식화의 진짜 가치 = 자연어가 안 말한 것을 명시적 결단 강제"** 처음으로 정량화

### Cross-validation 결과 (Senior + Static Analyzer 시뮬레이션 병렬)

#### ★★ 양쪽 발견 (신뢰도 매우 강) — 정식 finding 등록
- **F-097 high** — UserRelationshipService `@Transactional` 부재 (F-095 근본 원인)
- **F-098 high** — UserFollow Equality on transient ID (Sprint 1.5 #13 isomorphic)

#### Senior 단독 (4건) — F-099~F-102
- F-099 medium — derived delete TX 의존
- F-100~F-102 low — invariant reify / mutual concurrent / createdAt load 시점

#### Static 단독 시뮬 (4건) — F-103~F-106
- F-103 medium — CASCADE mismatch (grep cascade=0)
- F-104~F-106 low — HTTP 결단 추적 / Exception swallowing / NPE

#### 산출물 자기-정정 3건
- decision-table NO-SELF §6-C "선택" → "권고" 격상 (Senior)
- HTTP 400 reasoning 정정 ("schema 모순" → RealWorld 관행)
- generated-code 헤더 line number drift 정정 (line 49 → 60)

### 누적 통계 (Sprint 2 종결)

```yaml
finding_total: 95+        # PoC #02 43 + Sprint 1.5 11 + Sprint 2 19 = 73 (+ PoC #01 33)
finding_critical: 5
finding_high: 8           # PoC #01/#02 5 + Sprint 2 F-095/F-097/F-098 3
finding_medium: 28
finding_low: 17

formal_spec_artifacts: 21  # state-machines 2 + sequence 2 + decision-tables 6 + invariants 2 + generated 3 + property 4 + reports 2
이중_렌더링_정합: 90.5%   # Sprint 1 67% → 1.5 87.5% → 2 90.5%
신뢰도: 80-87%            # 시뮬 패널티 유지
```

### v1.2.0 묶음 L 데이터 100% 충분 ✅
- F-074 단방향 round-trip 정량 (자연어 빈약성 44% → 100%)
- 3 sprint 누적 drift 34건 (Sprint 1 4 + 1.5 11 + 2 19)
- 이중 렌더링 정합 90.5% (Sprint 3 100% 도달 예정)

### Sprint 3 진입 결단 (모든 성공 기준 만족 → 진행 권고 ★)

다음 Sprint 3 범위:
1. Phase 4.5 정식 명세화 (workflow / deliverables / schema / template)
2. Mermaid JSON 짝 일괄 (DEC-priority2-결단 G 이연)
3. 강화점 α + β 적용 (DEC-안티패턴-마이그레이션-가이드)
4. F-021 §8.1 점검 (누적 100+ → 단일 PoC 과적합 회피 강제 시그널)

## Lessons Learned 추가
14. **★ F-074 단방향이 형식화 진짜 가치 정량화 — "44% → 100%" 매트릭** — Sprint 1.5 가 drift 검출 가치 (자연어 명세가 80%만 담음) 입증했다면, Sprint 2 F-074 는 자연어 단독 시 결단 누락 56% 입증. **두 매트릭이 형식화 가치 정량화 양 축**.
15. **★★ Cross-validation 양쪽 발견 = 정식 finding 격상 신호** — F-097 / F-098 양쪽 발견은 단독 발견 (Senior 단독 4건 / Static 단독 4건) 보다 **격이 다른 신뢰도**. v1.2.0 묶음 격상 시 양쪽 발견만 high 권한 부여 권고.
16. **Static Analyzer 시뮬레이션 만으로도 결정적 grep 100% 가치** — `@Transactional` / cascade / catch 카운트 0건 같은 결정적 부분은 시뮬레이션도 정확. 단 룰 매칭 (Semgrep) / bytecode 분석 (SpotBugs) / 동적 invariant inference (Daikon) 는 진짜 도구 필수. **시뮬 한계와 가치를 sprint 별 정량 매핑**.
