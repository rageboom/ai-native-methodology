# Senior Research: v1.1.2 격상 (방법론 도메인 시니어 관점)

> 작성일: 2026-04-28
> 역할: Senior Engineer (방법론 엔지니어, 15+년)
> 대상 finding: F-007 / F-009 / F-016 / F-023 + 격상 자체의 메타

---

## 들어가며 — 시니어가 먼저 말하고 싶은 것

방법론 엔지니어 15년 하면서 본 가장 흔한 실패 패턴은 **"좋은 의도로 추가한 항목이 5년 후 명세의 시체가 되는 것"** 이다.

ISO/IEC 12207, RUP (Rational Unified Process), SAFe — 이 셋의 공통점이 뭔지 아는가? **명세 자체의 무게에 짓눌려 죽었다.** RUP 의 6,000+ 페이지를 다 읽은 PM 을 본 적이 있는가? 없다. 방법론은 **읽히는 분량** 을 넘어서면 그 순간 죽는다.

본 방법론 v1.1.1 은 아직 살아있다. 18건 finding 中 4건 처리 격상 — 이 결정이 **방법론의 생사** 를 가른다. 시니어로서 4건 모두 단순 ACK 하고 넘어가는 것에 강하게 반대한다. 함정을 하나씩 짚어보자.

핵심 메시지 3가지:
1. **F-023 은 PATCH 가 아니라 MINOR 다.** 의미 강화는 `bug fix` 가 아니다.
2. **F-007 schema 신설은 함정** — SoT 분산은 5년 후 반드시 divergence 를 낳는다.
3. **F-021 finding 임계 (18건)** 자체가 "방법론이 너무 일찍 너무 많이 결정하려 한다" 의 신호일 수 있다.

---

## §1. 격상 자체의 함정 (메타)

### 1.1 PATCH vs MINOR 경계

#### 망하는 길

> "F-023 은 §3.1 에 분기 가이드 추가일 뿐이니 PATCH (v1.1.2) 가 맞다."

이거 함정이다. SemVer 의 PATCH 정의는 **"backward-compatible bug fix"** 다. 명세 (specification) 영역에서 "bug fix" 의 의미는 무엇인가?

- **타이포 / 깨진 링크 / 명백히 잘못된 예시 수정** → PATCH 맞음
- **기존 산출물의 해석이 달라지는 변경** → MINOR 다 (강하게 주장)
- **기존 산출물이 invalid 가 되는 변경** → MAJOR

F-023 §3.1 분기 가이드는 명백히 두 번째다. **이전 v1.1.1 PoC 산출물의 `circular_dependencies` 항목을 재해석해야 함** — 이건 PATCH 가 아니다.

#### 살아남는 길

| 항목 | PATCH (v1.1.2) | MINOR (v1.2.0) |
|---|---|---|
| F-007 schema 신설 | ❌ 신규 schema 는 PATCH 아님 | ✅ |
| F-009 표 분리 | ✅ 표현 정비 | — |
| F-016 매트릭스 | ✅ 가이드 강화 | — |
| F-023 분기 가이드 | ❌ 의미 강화 | ✅ |

**시니어 권장: 4건을 v1.1.2 PATCH 로 묶지 말고, F-007 + F-023 은 v1.2.0 MINOR 로, F-009 + F-016 만 v1.1.2 PATCH 로 분리하라.**

근거:
- Kent Beck — "TDD: small steps. but the right small steps." 한 번에 4건 묶는 건 small step 이 아니라 batch 다.
- Sam Newman, *Building Microservices* — "release independently or die together."

### 1.2 N=1 PoC 기반 명세 변경의 위험

방법론에서 **N=1 일반화** 는 가장 흔한 사망 원인이다.

- RUP 가 망한 이유 = IBM 한 회사 내부 사례 일반화
- SAFe 가 욕먹는 이유 = Dean Leffingwell 컨설팅 사례 일반화
- 본 방법론 v1.1.2 가 N=1 함정에 빠지면 → 다음 PoC #02 가 또 다른 high finding 4건 발견 → v1.1.3 → v1.1.4 → 명세 비대화 → 죽음

PoC #01 = **Spring Boot + RDB + Java + 모놀리식 아키텍처**.

만약 PoC #02 가:
- **NestJS + MongoDB + microservice** 라면 → F-016 ddl-auto 매트릭스는 무의미
- **Rust + DDD strict + event sourcing** 이라면 → F-023 Tarjan vs 의도 분기는 의미 자체가 달라짐
- **Python + Notebook + ML pipeline** 이라면 → phase-1-init 의 inventory 개념 자체가 다름

**Rule of Three (Martin Fowler, *Refactoring*)** 적용:
- N=1: 관찰 (observe), finding 만 누적, 명세 변경 보류
- N=2: 패턴 가설 (hypothesize)
- N=3: 추상화 후 명세 격상 (abstract)

PoC #01 단독 격상하려면 **명시적 hedge** 필요:
```yaml
adr-006:
  status: provisional
  basis: PoC #01 only (N=1)
  revisit_at: PoC #02 completion
  revert_criterion: "PoC #02 에서 §3.1 분기 가이드가 부적합하면 ADR-006 을 deprecate"
```

### 1.3 18 → 14 누적의 의미

지금 18건. 4건 처리해도 14건 남음. 14건이 "처리 보류" 상태로 남아있는 게 가장 위험하다.

3가지 처분 中 하나로 **명시적 분류** 필요:

| 처분 | 의미 | 예시 |
|---|---|---|
| **격상 (promote)** | 명세 반영 | F-023 → §3.1 |
| **기각 (reject)** | "이건 명세 책임 아님" 명시 | "F-XYZ 는 사용자 환경 책임" |
| **유예 (defer)** | "PoC #N 후 재검토" | "F-ABC 는 PoC #02 결과로 결정" |

**1주일 내 14건 전수 분류** 가 v1.1.2 작업보다 시급하다.

---

## §2. F-023 ⭐ Tarjan SCC vs 도메인 의도 (가장 깊은 토론)

### 2.1 알고리즘 우선 vs 도메인 의도 우선 — default 결정

**알고리즘 우선 학파 (Spring Modulith, Structure101, ArchUnit)**
- 강점: 자동화, 객관적, 빌드 차단 가능
- 약점: 도메인 의미 무시, false positive

**도메인 의도 우선 학파 (Eric Evans, Vaughn Vernon)**
- 강점: 도메인 본질 반영
- 약점: 자동화 어려움, 사람의 판단 의존

#### 살아남는 길 — Hybrid Default

**시니어 권장: "알고리즘으로 탐지 + BC 기반 분기로 severity 결정" 의 2-stage default.**

```
Stage 1 (자동, 알고리즘): Tarjan SCC 로 cycle 탐지
Stage 2 (분기):
  - BC metadata 존재 + same BC + 도메인 의도 명시 → low (informational)
  - BC metadata 존재 + cross BC → high (architectural smell)
  - BC metadata 없음 → medium + decision_required
```

근거:
- Sam Newman, *Building Microservices, 2nd ed., Ch.5*: "Don't be dogmatic. The cost of a cycle depends on context — within a service it's a code smell, across services it's an architectural failure."

### 2.2 BC 미정의 케이스의 default severity

3가지 옵션 비판:

| 옵션 | 평가 |
|---|---|
| A: low + decision_required | 매력적이지만 방법론 default 로는 부적절 |
| B: medium 단독 | 의사결정 회피의 전형. 비추천 |
| C: high (자동) | false positive 폭증, 신뢰도 저하 |

**시니어 권장: BC 미정의 시 default = medium + decision_required 이중 마킹.**

핵심: **"medium 하나만 찍지 않고, 반드시 decision_required 와 페어링"**

```yaml
circular_dependency:
  components: [UserService, ArticleService]
  detection: tarjan_scc
  bc_metadata: undefined
  severity: medium
  decision_required: true
  decision_options:
    - "BC 동일 (양방향 정상)"
    - "BC 분리 필요 (cross-BC, high 로 격상)"
    - "리팩토링 필요 (단방향 의존)"
  decision_owner: domain_expert
  decision_deadline: "Phase 4 진입 전"
```

### 2.3 분기 가이드의 위치 (§3.1 vs ADR-004 vs 신규 ADR-006)

ADR 의 핵심 원칙 (Michael Nygard, *Documenting Architecture Decisions*):
> "One decision, one ADR. If you can't summarize the decision in one sentence, split it."

**시니어 권장 — 3-tier 분산:**

1. **ADR-006 신규**: "Cycle 처리 default 정책 = hybrid" — WHY
2. **phase-3-arch.md §3.1 갱신**: ADR-006 참조 + 실행 절차 — HOW
3. **architecture.schema.json 갱신**: enum + ADR-006 cross-ref — WHAT

ADR-006 의 status 는 `provisional` 로 시작. PoC #02 검증 후 `accepted` 격상.

### 2.4 schema circular_dependencies.intent enum

#### 망하는 길 — 4값 enum

**enum 4값은 5년 후 7값 된다.** 이게 schema 진화의 법칙이다.

또한 4값 中 `different_BC_with_intent` vs `different_BC_no_intent` — **"의도" 의 유무를 누가 판정?** 합의 안 된 채 schema 박으면 자의적 판정 폭증.

#### 살아남는 길 — 3값 + boolean 페어

**시니어 권장:**

```yaml
circular_dependency:
  bc_status: same | different | undefined  # 3값 enum
  intent_documented: true | false  # boolean
  # 조합으로 4가지 표현 가능
```

장점:
- enum 은 3값 (가지수 폭발 억제)
- boolean 은 의미 명확 ("문서화됨" 객관적 판정 가능)
- 조합으로 6가지 표현 (3 × 2)

### 2.5 "의도" 라는 단어의 schema 적합성

**"intent" 는 schema 에 박으면 안 되는 단어다.**

이유:
1. **의도는 사람의 머릿속** — schema 는 코드와 산출물의 상태를 표현. 머릿속을 표현하면 검증 불가
2. **의도는 시간에 따라 변함** — schema 는 시점 snapshot. 시간 변화하는 걸 snapshot 으로 잡으면 stale
3. **의도는 합의 대상** — 한 사람의 의도 vs 팀 합의

| 후보 | 평가 |
|---|---|
| `intent` | ❌ 머릿속, 비검증 |
| `documented_decision` | ⭕ 문서화 여부는 검증 가능 |
| `bc_assignment_explicit` | ⭕ BC 할당 명시 여부 — 객관 |

```yaml
circular_dependency:
  bc_status: same | different | undefined
  bc_assignment_explicit: true | false
  documented_decision: true | false
```

근거:
- Vaughn Vernon, *Implementing DDD, Ch. 3*: "Make context explicit. If a context boundary isn't documented, it doesn't exist for engineering purposes."

### 2.6 결론 — v1.1.2 §3.1 권장 형태

**시니어 최종안:**

1. **MINOR 격상 (v1.2.0)** — F-023 은 PATCH 가 아니다
2. **ADR-006 신규 (provisional)**
3. **§3.1 절차 갱신** — Stage 1 (Tarjan) + Stage 2 (BC 분기) 2단계
4. **schema 갱신** — `intent` 제거, `bc_status` (3값) + `bc_assignment_explicit` + `documented_decision` (boolean × 2)
5. **default severity** — BC 미정의 시 `medium + decision_required` 페어링
6. **PoC #02 hedge** — ADR-006 status: provisional, revisit_at: PoC #02

---

## §3. F-016 ddl-auto 매트릭스의 함정

### 3.1 매트릭스를 명세에 박는 것의 함정

**매트릭스를 명세에 박으면 4가지 죽음:**

1. **RDB 종속 사망** (PostgreSQL/MySQL/Oracle 동작 차이)
2. **Hibernate 버전 종속 사망** (Hibernate 7+ 의 schema management 분리 가능성, 검증 필요)
3. **마이그레이션 도구 분기 사망** (Flyway/Liquibase 도입 시 매트릭스 폭발)
4. **운영 vs 개발 환경 사망** (staging/test/local 다양화 시 폭발)

### 3.2 카드사 새벽 2시 콜의 진짜 교훈

표면적 교훈: "ddl-auto=update 는 운영에서 위험"

**시니어가 본 진짜 교훈:**

> "운영 시스템에 자동 마이그레이션 메커니즘을 두는 것 자체가 위험."

ddl-auto 가 위험한 게 아니다. **"애플리케이션 시작 시 schema 가 자동 변경되는" 메커니즘 전체** 가 위험하다. Flyway 의 `baseline-on-migrate=true` 도 동일.

본질적 교훈:
- **DDL 변경은 명시적 인간 승인 단계 (manual gate) 필수**
- 도구 (ddl-auto / Flyway / Liquibase) 무관
- 매트릭스가 아니라 **원칙으로 박아야 함**

### 3.3 살아남는 길 — Decision Tree + 원칙

**시니어 권장:**

```markdown
### §3.4 Schema 변경 정책 (v1.1.2 갱신)

#### 원칙 (도구 무관)
1. 운영 환경의 자동 schema 변경 금지
2. DDL 변경은 manual gate 통과 후만 적용
3. dev/staging 환경에서는 자동화 허용 (단 prod-like staging 제외)

#### Decision Tree (도구 선택)
- 마이그레이션 도구 도입 가능?
  ├─ Yes → Flyway/Liquibase + ddl-auto=validate
  └─ No → ddl-auto 의존 (개발 환경 한정)
- 운영 환경?
  ├─ 운영 → manual gate 필수 (도구 무관)
  └─ 개발/스테이징 → 자동화 허용
```

근거:
- Sam Newman, *Building Microservices*: "Schema migration is a contract change. Contract changes require explicit approval."
- Martin Fowler, *Evolutionary Database Design*: "All changes are versioned and reviewed. Automation is a tool, not a policy."

---

## §4. F-009 환경별 표 분리의 함정

### 4.1 "환경" 이라는 분류축의 정당성

**이 분류축 자체가 잘못됐다.**

진짜 분류축은 **"환경"** 이 아니라 **"사용 도구의 결정성 (determinism)"** 이다.

| 환경 | 결정성 | 신뢰도에 영향 |
|---|---|---|
| git_clone | 높음 | 동일 commit hash → 동일 결과 |
| web_fetch | 중간 | URL 변경 시 다른 결과 |
| api_only | 낮음 | 호출 시점에 따라 다름 |

#### 망하는 길 — 환경 enum 폭발

5년 후 예측: 3개 → 4개 → 5개 → 6개 → 7개. enum 의 운명: 한 번 시작하면 폭발한다.

#### 살아남는 길 — 결정성 축으로 재정의

**시니어 권장:**

```markdown
### §6 신뢰도 산정 (v1.1.2 갱신)

#### 결정성 (Determinism) 축
- **deterministic**: 동일 입력 → 동일 출력
- **snapshot-based**: 시점 snapshot 의존
- **stateful**: 호출 시점/순서에 따라 다름

#### 신뢰도 가산점
| 결정성 | 가산점 |
|---|---|
| deterministic | +0.10 |
| snapshot-based | +0.05 |
| stateful | 0.00 |
```

이렇게 하면:
- enum 가지수 = 3개로 안정
- 환경 추가되어도 결정성 축에 매핑 가능
- DRY 유지 (단일 표)

근거:
- *Pragmatic Programmer* (Hunt & Thomas), Topic 9: "DRY — Don't Repeat Yourself."

---

## §5. F-007 inventory schema 신설의 함정

### 5.1 SoT (Single Source of Truth) 분산의 위험

**시니어가 가장 강하게 반대하는 finding.**

#### 망하는 시나리오 (5년)

- v1.1.2: 둘 다 일치
- v1.2.0: §4.2 갱신, schema 누락 → divergence #1
- v1.3.0: schema 갱신, §4.2 누락 → divergence #2
- v1.4.0: schema strict → PoC #03 실패 → schema relaxed → 빈 객체
- v2.0.0: schema 무력화, §4.2 가 실질 SoT

**이게 모든 schema 가 망하는 패턴이다.**

### 5.2 Schema 의 진짜 가치 vs 함정

진짜 가치 = CI/CD 자동 검증 / IDE 자동 완성 / 문서 자동 생성.

**이 셋 다 안 쓸 거면 schema 신설은 "문서를 위한 문서" 로 전락.**

### 5.3 살아남는 길

**옵션 1 (시니어 1순위 권장): CI 자동 검증 도입 전까지 schema 신설 보류.**

```markdown
v1.1.2 결정: inventory.schema.json 신설 보류
이유:
- SoT 분산 위험
- CI 자동 검증 미도입 상태에서 schema 는 dead weight
- 도입 시점: CI 자동 검증 파이프라인 구축 시 (예상 v1.3.0)
```

**옵션 2: Schema 신설 + §4.2 폐지** (CI 즉시 도입 시)
- schema 가 SoT
- §4.2 는 schema 에서 자동 생성
- divergence 원천 차단

**둘 다 SoT 인 상태 (현재 F-007 그대로) 강하게 반대.**

---

## §6. 시니어 권장 (의견)

### 6.1 Finding 별 권장

| Finding | 시니어 의견 | 이유 |
|---|---|---|
| **F-007** inventory schema | **보류 (defer)** — CI 자동 검증 도입 후 | SoT 분산 = 5년 후 divergence |
| **F-009** 환경별 표 분리 | **재정의 (reframe)** — "결정성" 축으로 | 환경 enum 폭발 위험 |
| **F-016** ddl-auto 매트릭스 | **변형 (transform)** — 원칙 + Decision Tree | RDB/Hibernate 종속 회피 |
| **F-023** ⭐ Tarjan vs 의도 | **격상하되 v1.2.0 MINOR + ADR-006 provisional** | PATCH 아님 (의미 강화), N=1 hedge |
| **격상 자체 (메타)** | **4건 일괄 격상 반대 — 분리 격상** | F-007 보류, F-009/F-016 = v1.1.2, F-023 = v1.2.0 |

### 6.2 분리 격상 권장 로드맵

```
v1.1.2 (PATCH)
  ├─ F-009 결정성 축 재정의
  └─ F-016 매트릭스 → 원칙 + Decision Tree

v1.2.0 (MINOR) — PoC #02 진행 중 또는 후
  ├─ F-023 Tarjan + BC 분기 + ADR-006 provisional
  └─ schema circular_dependencies (intent 단어 제거)

v1.3.0 (예정, CI 도입 시점)
  └─ F-007 inventory schema (CI 자동 검증과 함께)
```

### 6.3 14건 잔여 finding 처분 권장

**v1.1.2 작업 전 1주일 내 14건 전수 분류** (격상/기각/유예 中 하나).

---

## §7. 함정 체크리스트 (작업 전 확인)

### 7.1 격상 자체

- [ ] PATCH/MINOR 경계 명시
- [ ] 이전 산출물 호환성 검증
- [ ] N=1 hedge (provisional + revisit_at)
- [ ] 14건 잔여 finding 분류

### 7.2 F-023

- [ ] hybrid default 명시
- [ ] BC 미정의 시 medium + decision_required 페어링
- [ ] ADR-006 신규 (ADR-004 와 분리)
- [ ] ADR-006 status: provisional
- [ ] schema 의 "intent" 단어 제거
- [ ] enum 가지수 3값 이내
- [ ] decision_deadline = Phase 4 진입 전 gate
- [ ] PoC #02 revisit_at 명시

### 7.3 F-016

- [ ] 7행 매트릭스 회피
- [ ] 원칙 3개 + Decision Tree
- [ ] 운영 환경 manual gate 도구 무관

### 7.4 F-009

- [ ] 표 분리 회피
- [ ] 결정성 축 재정의
- [ ] 단일 표 SoT 유지

### 7.5 F-007

- [ ] CI 자동 검증 여부 확인
- [ ] CI 미도입 시 보류
- [ ] 둘 다 유지 회피

### 7.6 거버넌스

- [ ] v1.1.3 트리거 기준 정의
- [ ] 명세 분량 +20% 초과 점검
- [ ] 시니어 권장 항목별 ACK

---

## §8. 마지막 한 마디 (시니어 잔소리)

가장 위험한 마인드셋:

> "finding 4건 다 처리해야 PoC 완수다."

아니다. **방법론은 finding 을 다 처리하는 게 아니라, 처리할 만한 것 / 미룰 것 / 기각할 것을 분류하는 것** 이다.

15년 동안 봐온 가장 흔한 사망 패턴 3가지:
1. finding 다 처리하려다 명세 비대화 → RUP 의 죽음
2. PATCH 로 의미 강화 격상 → 거버넌스 무너짐, SemVer 신뢰 상실
3. N=1 일반화 → PoC #01 만 잘 되고 PoC #02 부터 망함

**시니어의 최종 권장 1줄:**

> F-007 보류, F-009/F-016 변형 후 v1.1.2, F-023 은 v1.2.0 MINOR + ADR-006 provisional, 14건 잔여 finding 전수 분류 먼저, PoC #02 hedge 필수.

---

> — Senior Engineer (방법론 도메인, 15+년)
> 작성일: 2026-04-28
