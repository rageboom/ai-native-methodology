# plan-poc17-analysis-revisit-axis-1-2

> **세션 52차 — 2 번째 plan ladder** (직전 = `plan-poc17-chain1-discovery-car-list.md` § Gate #1 = stop + revisit:analysis).
> **4원칙 1단계** (깊은 숙지 → plan.md 작성 / 본 plan = analysis stage 재진입 trigger 의제).
> **paradigm 정합** — DEC-2026-05-06-round-trip-부분-허용 (chain harness gate 안 정식 허용) + LL-codegraph-01 (self-referential drift 회피) + LL-codegraph-07 (외부 source 격리).

---

## 1. 목적 / scope

### 1.1 trigger 사실

직전 plan ladder gate #1 결단 (사용자 cluster 1 + 3 + 4_5 결단 묶음):
- **cluster 1**: business_intent 재작성 (C)
- **cluster 3**: BR-CARLIST-RBAC-FILTER sessionId 부재 우회 본격 의문 (B / F-RBAC-BYPASS-001 보안 invariant 명세 의무)
- **cluster 4_5**: D revisit:analysis (chain 2 spec 진입 보류)

★ **3 axis 의제 분리 결단** (★ ★ ★ 본 plan 본격 결단 / LL-codegraph-01 정합 의무):

| axis | scope | 본 plan 처리 |
|---|---|---|
| **axis 1** = business_intent 재정합 | analysis baseline domain.json / business-rules.json 보강 | ✅ scope-in (본 plan 본격) |
| **axis 2** = F-RBAC-BYPASS-001 보안 invariant 명세 | analysis baseline characterization-spec.json / formal-spec 보강 | ✅ scope-in (본 plan 본격) |
| **axis 3** = BR id naming convention paradigm | methodology body schema regex 완화 또는 analysis stage paradigm enforcement | ❌ scope-out (★ ★ self-referential drift / LL-codegraph-01 정합 / **carry C-schema-regex-paradigm-completion** 등록 보류 / Type 2 외부 사용자 trigger 의무) |

★ 본 plan = **axis 1 + axis 2 통합 본격 / 외부 디렉토리 layer / methodology body 변경 ❌**.

### 1.2 듀얼 목표 정합 (memory `feedback_dual_goal_migration_plus_plugin.md`)

| axis | 본 plan 시행 | 자산 |
|---|---|---|
| 마이그레이션 | car-list pilot scope analysis baseline 보강 (chain 1 forward 자격 본격) | 외부 디렉토리 산출물 |
| 플러그인 axis | chain harness round-trip paradigm 본격 입증 (chain 1 → revisit:analysis → chain 1 재진입 forward 자격 cycle 완성) | 본 plan / DEC / LL 후보 |

### 1.3 scope-in (axis 1 + 2)

**Axis 1 — business_intent 재정합**:
- `business-rules.json` 안 car-list bound 12 BR 의 **business intent reasoning** 보강 (rule 본문에 intent + rationale + stakeholder 명시 추가).
- `domain.json` 안 BC-CAR-MGT 의 **stakeholder 본격 enumeration** (cluster 1 사용자 결단 "재작성" 의제 — 사용자 차원의 본격 검토 의무 / 본 plan 결단 의제 안 정의).
- `findings/` 안 F-DOMAIN-PURPOSE-001 (★ 신규 finding 가능성 — domain_purpose 정확도 검토 결과).

**Axis 2 — F-RBAC-BYPASS-001 보안 invariant 명세**:
- `findings/F-RBAC-BYPASS-001.md` 신설 (현재 findings-index.md 안 reference 만 있음 / 본 finding 본격 body 부재).
- `characterization-spec.json` 보강 — BR-CARLIST-RBAC-FILTER intent-vs-bug 본격 분류 + sessionId 부재 시 ambiguous category 등록.
- `formal-spec/sequence-diagrams/` 안 RBAC 3 branch sequence 보강 (sessionId 부재 path 추가 / 보안 invariant 도출).
- `business-rules.json#BR-CARLIST-RBAC-FILTER` 의 `verifiable` 필드 강화 (sessionId 부재 시 동작 명세 의무).

### 1.4 scope-out (★ ★ axis 3 분리 + carry)

- **Axis 3 = paradigm drift #2 (schema regex BR naming)** — methodology body 영역 / self-referential drift 위험 (LL-codegraph-01) / carry `C-schema-regex-paradigm-completion` 등록 / Type 2 외부 사용자 자연 trigger 의무.
- **chain 1 discovery-spec.{json,md}** = ★ frozen 보존 (revert ❌ / 본 plan 종결 후 별 plan ladder 결단 의제 — analysis 보강 결과 흡수 시 chain 1 재진입 + 재검증).
- **chain 2 spec stage 진입** — 본 plan scope 외 / analysis 보강 종결 후 별 ladder.
- **paradigm drift #1 (validator dual-key)** = ★ ★ 별 carry `C-validator-dual-key-businessrules` (methodology body 영역).
- **화면 2~6** + **F-PII-HARDCODE-001** + **외부 SP γ** = 본 PoC 의 다른 axis (별 cycle).

---

## 2. 입력 (analysis baseline + chain 1 frozen 산출물)

### 2.1 1차 입력 (외부 절대경로 read-only / LL-codegraph-07 정합)

| 산출물 | 본 plan 활용 |
|---|---|
| `~/.../.aimd/output/business-rules.json` | 12 car-list BR 의 본문 보강 + business_rules 통합 array 정합 유지 |
| `~/.../.aimd/output/domain.json` | BC-CAR-MGT stakeholder + bounded_context responsibility 보강 |
| `~/.../.aimd/output/characterization-spec.json` | intent-vs-bug 분류 보강 (RBAC + F-RBAC-BYPASS-001) |
| `~/.../.aimd/output/findings/findings-index.md` | F-RBAC-BYPASS-001 본문 신설 / F-DOMAIN-PURPOSE-001 신규 등록 |
| `~/.../.aimd/output/discovery-spec.{json,md}` (frozen) | 본 plan 분석 결과 forward 자격 검증 (cluster 1 + 3 fix 완료 시 chain 1 재진입 자격 충족 의무) |
| `~/.../.aimd/output/sequence-diagrams/*` | RBAC 3 branch sequence 보강 (sessionId 부재 path) |

### 2.2 2차 입력 (본 레포 / SSOT)

| 자산 | 본 plan 활용 |
|---|---|
| sub-rule `spring41-ibatis2-isomorphic.md` v1.2.0 | §X-H 정합 (RBAC + cross-DB AP) |
| `methodology-spec/finding-system.md` | F-RBAC-BYPASS-001 + F-DOMAIN-PURPOSE-001 finding 등록 paradigm |
| `methodology-spec/baseline-delta-operating-model.md` | analysis baseline delta 갱신 paradigm |

---

## 3. 산출물

### 3.1 1차 산출물 (외부 디렉토리 / 본 PoC analysis baseline 갱신)

| 산출물 | 위치 | format |
|---|---|---|
| `findings/F-RBAC-BYPASS-001.md` | 외부 (신규) | 본문 medium finding 본격 명세 |
| `findings/F-DOMAIN-PURPOSE-001.md` | 외부 (신규 / 조건부) | business_intent 재작성 결과 신규 finding 자격 검토 |
| `findings/findings-index.md` (갱신) | 외부 | medium 14 → 15+ 갱신 (F-RBAC-BYPASS-001 본격 등재) |
| `business-rules.json` (갱신 / additive) | 외부 | 12 car-list BR 의 intent + rationale + stakeholder 필드 보강 |
| `domain.json` (갱신 / additive) | 외부 | BC-CAR-MGT stakeholder enumeration 본격 / business_intent 재정합 |
| `characterization-spec.json` (갱신) | 외부 | BR-CARLIST-RBAC-FILTER intent-vs-bug 본격 분류 + sessionId 부재 ambiguous |
| `sequence-diagrams/rbac-3-branch.mermaid` (갱신 또는 신규) | 외부 | sessionId 부재 path 추가 / 보안 invariant 도출 |
| `chain-intervention-log.jsonl` (append) | 외부 | analysis revisit 진행 사실 + 결과 record |

### 3.2 2차 산출물 (본 plan 자산화 / 본 레포 / commit 정책)

| 산출물 | 위치 | 조건 |
|---|---|---|
| LL-poc-17-11~14 추가 | 본 plan §8 | 시행 종결 후 자산화 |
| memory `project_poc17_dogfooding.md` 갱신 | `~/.claude/projects/.../memory/` | analysis revisit 사실 누적 |
| **carry queue 본격 등록** = `C-schema-regex-paradigm-completion` + `C-validator-dual-key-businessrules` | (도구화 carry list 부재 / decisions 안 or LL 안) | 본 plan 종결 후 명시 |

★ **본 레포 commit ❌** (LL-codegraph-07 정합 / 외부 디렉토리 산출물만 + 본 plan + LL 자산만 본 레포 자격).

---

## 4. 절차 (analysis stage 재진입 시 phase 정합)

### Phase 1. business_intent 재정합 (axis 1)

#### 1.1 domain.json#BC-CAR-MGT 본격 검토

- 현재 `domain.json#bounded_contexts.BC-CAR-MGT.responsibilities` = 3 항목 (차량 등록/조회/수정/해지 + TERM 관리 + DRIVE 관리). cluster 1 재작성 의제 = ★ 본격 보강 의무.
- 추가 정합 의무:
  - `stakeholders[]` field 신설 (현재 부재 / 본 PoC discovery-spec 의 5 stakeholder 본격 backward link)
  - `business_intent_summary` field 신설 (domain_purpose 본격 명시)
- **★ ★ ★ Auto Mode ❌ — 사용자 결단 의무**: stakeholder 명세는 본격 사내 비즈니스 axis = 사용자 결단 본격 의제.

#### 1.2 business-rules.json 12 BR 의 intent 본문 보강

- 현재 BR entry = `id + title + screen + code_grounding + logic + verifiable + category` 7 필드.
- **추가 필드 의무** (axis 1 본격):
  - `intent` (1 줄 자연어 / "왜 이 BR 인가" 본격)
  - `rationale` (1~3 줄 / 비즈니스 reason)
  - `stakeholders` (해당 BR 의 주 이해관계자 enumeration)
- **★ ★ ★ axis 3 정합 의무**: BR id rename ❌ (paradigm drift #2 = methodology body / 별 carry).

#### 1.3 findings/F-DOMAIN-PURPOSE-001 (조건부 신규)

- Phase 1.1 결과 도출 사실 = "domain_purpose 본격 미명세 / cluster 1 재작성 trigger 정합" → 본 finding 자격 발생 시 등록.
- severity = medium (process finding / 결과 도출 사실).

### Phase 2. F-RBAC-BYPASS-001 보안 invariant 명세 (axis 2)

#### 2.1 findings/F-RBAC-BYPASS-001.md 본격 신설

- 현재 = findings-index.md 의 reference 만 / 본문 부재.
- 본격 본문 구조:
  - severity: medium (현재 인덱스 표기 정합)
  - title: BR-CARLIST-RBAC-FILTER sessionId 부재 시 INNER JOIN 우회 가능성
  - description: sessionId 가 fn_Get_CarUserListView_2 호출 시 부재 → INNER JOIN 자체 우회 → RBAC 분기 미적용 → 전체 차량 노출 위험
  - evidence: `carMgt.xml#selectCarList L130-133 + CarMgtServiceImpl.getCarUserList (★ sessionId 검증 chain manual grep 의무)`
  - impact: high (보안 본격 / 그러나 본격 발동 path 미실측)
  - recommendation: chain 2 spec stage AC-CAR-003 보안 invariant 명세 의무 (sessionId null 시 RBAC 분기 적용 또는 reject)
  - cross_link: BR-CARLIST-RBAC-FILTER + UC-CAR-003 + ★ chain 2 forward 의제

#### 2.2 characterization-spec.json 보강

- BR-CARLIST-RBAC-FILTER intent-vs-bug 본격 분류:
  - intent vs bug = ★ ambiguous (sessionId 부재 가 의도 vs 결함 모호)
  - rationale = "sessionId 부재 path 가 legacy code 안 본격 발동 path 미실측 / 그러나 NULL check 부재 = 결함 marker / chain 2 AC 명세 의무"
- characterization-spec.intent_vs_bug.ambiguous category 신규 추가.

#### 2.3 sequence-diagrams 안 RBAC 3 branch 보강

- 현재 sequence-diagram = RBAC 3 분기 mermaid (1 file / decision-tables/ sibling).
- **sessionId 부재 path** 신규 분기 추가 의무 (security invariant trigger 본격).

#### 2.4 business-rules.json#BR-CARLIST-RBAC-FILTER verifiable 강화

- 현재 verifiable = "차량관리자 로그인 = 전체 / 비서 = 담당 임원 / 일반 = 본인".
- **추가**: "sessionId NULL / undefined 시 = reject 또는 default 분기 (★ chain 2 AC-CAR-003 명세 의무 / F-RBAC-BYPASS-001 cross-link)".

### Phase 3. chain-intervention-log append + 검증

- chain-intervention-log.jsonl append (analysis revisit 진행 사실).
- validator 2종 재실행:
  - discovery-extraction-validator: 본 plan 산출물 갱신 후 chain 1 discovery-spec.json forward 자격 검증.
  - schema-validator: 본 plan 산출물 (business-rules.json + domain.json + characterization-spec.json) schema 정합 검증.

### Phase 4. gate (analysis revisit 종결 cluster 보고)

- 사용자 검토 cluster 4~5:
  1. business_intent 재정합 결과 정확성 (cluster 1 fix 확인)
  2. F-RBAC-BYPASS-001 본격 명세 정확성 (cluster 3 fix 확인)
  3. axis 3 (BR id naming paradigm) carry 보류 확인
  4. ★ chain 1 재진입 자격 충족 여부 (discovery-spec frozen 갱신 의무 발생 여부)
  5. 본 session 종결 vs chain 1 재진입 결단

---

## 5. 사용자 승인 묶음 (3원칙 / 5 핵심 결정)

★ 본 plan 안 결단 5 — 본 plan §4 시행 전 사용자 확정 의무.

### 결단 1. business_intent 재정합 본격 scope (axis 1)

- **A. domain.json + business-rules.json 동시 보강** (추천 / Phase 1.1 + 1.2 통합 / 본격)
- B. domain.json 만 보강 (Phase 1.1 만 / business-rules.json 본문 보강은 별 cycle)
- C. business-rules.json 12 BR 본문 보강 만 (Phase 1.2 만 / domain.json 별 cycle)

### 결단 2. F-RBAC-BYPASS-001 보안 invariant 명세 본격 scope (axis 2)

- **A. 4 sub-phase 통합 본격** (추천 / Phase 2.1 + 2.2 + 2.3 + 2.4 / finding 본문 + characterization + sequence + verifiable 강화)
- B. finding 본문만 (Phase 2.1 만 / 나머지 별 cycle)
- C. finding 본문 + characterization (Phase 2.1 + 2.2 / sequence + verifiable 별 cycle)

### 결단 3. axis 3 (paradigm drift #2 BR naming) 분리 의제 확정

- **A. carry 보류 (추천 / LL-codegraph-01 정합)** — `C-schema-regex-paradigm-completion` 등록 / Type 2 외부 사용자 자연 trigger 의무
- B. ★ ★ 본 plan 안 본격 시행 — 56 BR rename + 다른 산출물 cross-link 갱신 (★ ★ ★ self-referential drift 위험 / 본 plan §1.4 정합 위반 risk)

### 결단 4. F-DOMAIN-PURPOSE-001 신규 finding 등록 자격

- **A. Phase 1.1 결과 도출 시 등록** (추천 / 결과 사실 의존 / 조건부)
- B. 등록 ❌ (cluster 1 재작성 자체로 finding 충분 / 추가 finding 등록 ❌)

### 결단 5. 본 plan 종결 후 chain 1 재진입 결단

- **A. 본 plan 종결 후 사용자 검토 후 결단** (추천 / 본 plan §4 Phase 4 gate cluster 5 본격)
- B. 본 plan 안 통합 시행 (chain 1 재진입 + 재검증 + 새 gate #1 cluster) — scope 부풀림 risk
- C. 본 session 종결 (analysis 보강 만 / chain 1 재진입 = 별 session)

---

## 6. 위험 / 제약

| ID | 위험 | severity | 완화 |
|---|---|---|---|
| R-001 | self-referential drift (LL-codegraph-01 위반) — axis 3 본격 trigger 시 methodology body sweep | ★ ★ critical | 결단 3.A 본격 / axis 3 = carry 보류 / 본 plan §1.4 정합 |
| R-002 | analysis baseline 갱신 시 chain 1 frozen discovery-spec 와 forward 자격 mismatch | medium | Phase 3 validator 2종 재실행 + chain 1 재진입 자격 사전 검증 |
| R-003 | F-RBAC-BYPASS-001 본격 발동 path 실측 부재 = chain 2 AC 명세 시 over-engineer 위험 | medium | severity = medium 유지 + recommendation = "chain 2 AC 명세 의무" 한정 (★ legacy 보존 paradigm 정합) |
| R-004 | business-rules.json 12 BR 본문 보강 시 다른 산출물 cross-link 영향 | low | additive only (기존 필드 무변경 + intent + rationale + stakeholders 신규 필드 추가) |
| R-005 | F-DOMAIN-PURPOSE-001 신규 finding 등록 자격 = Phase 1.1 결과 의존 (조건부) | low | 결단 4.A 정합 / 결과 사실 따른 등록 |
| R-006 | session 안 4 release cap (LL-v930-02) — 본 plan = doc trail 만 / release ❌ | low | 본 plan 시행 결과 = release ❌ (외부 산출물만 / 본 레포 commit ❌) |
| R-007 | F-021 finding 임계 (legacy paradigm 30~60) — 본 plan 시행 시 finding 1~2 추가 가능 | low | medium 14 → 15~17 (임계 안 / 정합) |

---

## 7. 검증 (4원칙 STOP-3 정합)

### 7.1 외부 산출물 검증

- F-RBAC-BYPASS-001.md 본격 신설 ✅ (Phase 2.1)
- characterization-spec.json + sequence-diagrams 보강 ✅ (Phase 2.2 + 2.3)
- domain.json + business-rules.json additive 보강 ✅ (Phase 1.1 + 1.2)
- chain-intervention-log.jsonl append ✅
- 사내 source 사본 0건 verify ✅

### 7.2 검증 도구

- schema-validator: discovery-spec.json (frozen / 무변경) + business-rules.json (additive / 정합 의무).
- discovery-extraction-validator: chain 1 forward 자격 재검증.

### 7.3 본 레포 axis (영향 0)

- workspace test 영향 0 (본 plan = 외부 작업)
- release-readiness 22/22 보존 ✅
- skill-citation 0 stale ✅
- version 3-way 11.4.0 유지 (release ❌)

---

## 8. Lessons Learned (★ 4원칙 4단계 / 본 plan 종결 시점 자산화 / 2026-05-29)

본 plan 시행 결과 LL 5종 본격 자산화. 사용자 결단 (Phase 4 gate cluster 5) = 의제 1.A (axis 3 carry 보류 유지) + 의제 2.A (LL 자산화 + carry queue 등록 + 본 session 종결).

### LL-poc-17-11 — chain harness round-trip paradigm 첫 사내 full cycle 본격 입증

**Why**: chain 1 discovery gate #1 stop + revisit:analysis 결단 → analysis baseline 본격 보강 → chain 1 forward 자격 재검증 cycle = ★ 본 방법론 chain harness paradigm 의 ★ 첫 사내 live full cycle 사례. 본 PoC = R1' axis 4번째 corroboration 자산.

**How to apply**: chain N gate stop + revisit:N-K 결단 시 (a) 별 plan ladder 본격 생성 (revisit 의제 분리) + (b) 외부 디렉토리 산출물 additive only + (c) 본 레포 commit ❌ + (d) validator 재실행 = chain N+0 forward 자격 재검증 의무. round-trip = chain harness gate 안에서 정식 허용 (DEC-2026-05-06 정합) + 단 자동 코드 생성 ❌ (지정된 stage 별 산출물 한정).

### LL-poc-17-12 — axis 분리 결단 paradigm 본격 입증 + ★ ★ ★ severity 재평가 사례

**Why**: 본 plan 시행 시점 (Phase 4 gate) 사용자 결단 = "axis 3 = cosmetic drift / 분리 carry / self-referential drift 회피". Phase 3 validator 실행 결과 = **★ ★ ★ axis 3 가 cosmetic ❌ / structural / chain 1 forward 자격 자체 차단 본격 결함** 임이 실측 폭로. 즉 axis 분리 결단 paradigm 이 ★ severity 실측 사실 출현 시점에 재평가 의제 trigger 본격.

**How to apply**: axis 분리 결단 (LL-codegraph-01 self-referential drift 회피) 시 (a) 결단 시점 severity 추정 명시 의무 (cosmetic / structural / blocker) + (b) 실측 phase (validator 또는 e2e) 시 severity 재평가 hook + (c) cosmetic 추정 axis 가 structural 격상 시 carry queue 본격 promotion (Type 2 외부 사용자 trigger 자연 충족 시점 즉시 본격 시행) + (d) 본 LL 사례 인용 의무. axis 3 본 경우 = self-referential drift 회피 paradigm 우선 (Type 2 외부 사용자 자연 trigger 대기 유지) — ★ ★ trade-off 명시.

### LL-poc-17-13 — F-RBAC-BYPASS-001 보안 invariant chain 1 단에서 의제화 paradigm

**Why**: 본 finding 은 analysis baseline (Phase 4b) 시점 = `<isNotEmpty>` 조건부 join paradigm 사실 검출만 (intent ambiguous). chain 1 discovery gate #1 사용자 결단 = "B. 보안 invariant 본격 의문" → analysis 단계로 backward 의제 push → 본 plan Phase 2.1~2.4 본격 명세 + chain 2 AC-CAR-003 forward 명세 의무 link. 본격 발동 path 미실측 = 본격 발견 path 4 종 enumerate (interceptor 미검증 USER_ID 키 + 인터셉터 우회 + 세션 부분 손상 + 사용자 마스터 path 미검증) + recommendation = 즉시 정정 ❌ + chain 2 명세 의무 + 신규 stack 자연 해결.

**How to apply**: 보안 invariant 후보 finding 시 (a) ambiguous category 등재 + (b) 본격 발동 path enumerate 의무 (≥ 3 attack path) + (c) interceptor / controller / DAO / SQL layer 본격 call-path 검증 의무 + (d) 즉시 정정 vs chain 2 spec stage AC 명세 결단 + (e) 신규 stack 마이그레이션 시 자연 해결 path 명시 + (f) characterization-spec.json verdict 후보 enumerate (bug / intent / ambiguous).

### LL-poc-17-14 — business_intent 재작성 paradigm + ★ DDD stakeholder 본격 자산화 경로

**Why**: 사용자 cluster 1 결단 "재작성하자" trigger → analysis baseline `domain.json` 안 `business_intent_summary` + `stakeholders[]` 필드 부재 사실 표면화 → F-DOMAIN-PURPOSE-001 신규 finding + Phase 1.1 본격 보강 path. business-rules.json 12 BR 도 동시 additive boost (intent / rationale / stakeholders / security_invariant 5 신규 필드). discovery-spec.json 의 stakeholder 5종 = 본격 사실 source / domain.json + business-rules.json 으로 1:1 migration.

**How to apply**: chain 1 discovery 단에서 사용자가 "재작성" 결단 시 (a) discovery-spec.json#business_intent 안 stakeholder 본격 enumeration 의무 + (b) 동일 stakeholder set 을 domain.json (bounded_contexts.stakeholders) + business-rules.json (rules.stakeholders) 의 본격 cross-link migration + (c) F-DOMAIN-PURPOSE 후보 finding 자동 등재 (process finding / medium / additive 보강 후 resolved) + (d) chain 2 spec stage 의 UC/BHV/AC 본격 stakeholder backward link.

### LL-poc-17-15 — ★ ★ ★ cosmetic 추정 axis 가 structural 격상 사례 (★ ★ severity re-evaluation hook)

**Why**: ★ 본 plan 의 ★ 본격 발견. Phase 4 gate 시점 사용자 결단 = "axis 3 = cosmetic / 분리 carry" 가설 (LL-codegraph-01 self-referential drift 회피 paradigm 우선). Phase 3 validator 실행 결과 = **discovery-extraction-validator 12 CRITICAL `discovery.br_intent.unknown_br`** — axis 3 paradigm drift 가 chain 1 forward 자격 자체 차단 본격 결함임이 실측 폭로. 즉 cosmetic 추정 axis 가 structural / blocker 격상.

**How to apply**: methodology body axis 분리 결단 시 (a) 결단 시점 = cosmetic / structural / blocker 추정 명시 의무 + (b) Phase 3 (validator 단) = severity 재평가 hook 의무 (cosmetic → structural 격상 trigger) + (c) structural 격상 시 carry queue 본격 promotion (★ Type 2 외부 사용자 자연 trigger 자격 자연 충족 / 별 session 본격 시행 의제) + (d) chain N forward 자격 차단 본격 결함 인 경우 = ★ ★ ★ self-referential drift 회피 paradigm vs chain 자격 trade-off 의제 / 본격 결단 의무 / 본 LL 인용 의무. 본 PoC 경우 = self-referential drift 회피 paradigm 우선 (사용자 결단) — Type 2 외부 사용자 자연 trigger 대기 paradigm 유지. ★ ★ 단 본 paradigm = self-imposed brake (★ 본 PoC 가 본격 Type 2 자연 trigger 사실 인 본격 발견 = paradigm 재해석 의제 trigger 자격 본격 충족).

### 8.2 carry queue 본격 등록 (★ 본 plan 결과 / 별 session 본격 시행 대기)

| Carry ID | 내용 | Type 2 외부 사용자 trigger 사실 | severity 추정 |
|---|---|---|---|
| **C-validator-dual-key-businessrules** | `tools/discovery-extraction-validator` + `tools/schema-validator` 가 business-rules.json 의 `business_rules` array (v11.5.0 strict / -001 suffix) 도 lookup 의무 / 현 paradigm = `rules` array 만 lookup → chain 1 forward 자격 차단. methodology body 영역. | ✅ 본 PoC = R1' axis 4번째 사내 PoC + 본 plan Phase 3 실측 사실 = Type 2 자연 trigger 자격 자연 충족 | ★ ★ structural (chain 1 forward 자격 차단 본격 결함) |
| **C-schema-regex-paradigm-completion** | `schemas/business-rules.schema.json` 의 strict regex `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` vs analysis baseline pre-strict (`BR-XXX-XXX`) paradigm drift 본격 정합 결단 (옵션 X = validator lookup 양방향 / 옵션 Y = analysis baseline rename / 옵션 Z = schema regex 완화) | ✅ 동일 (본 PoC 실측 trigger) | ★ ★ structural (LL-poc-17-15 promotion) |
| C-sub-rule-pii-detection | `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` §X-H 안 AP-PII-HARDCODE 본격 등재 (LLM grounded review only) | ★ 본 PoC F-PII-HARDCODE-001 trigger | medium |
| C-sub-rule-rbac-fail-open-detection | §X-H 안 `<isNotEmpty>` parameter 가 보안 RBAC join 의존하는 case 자동 검출 paradigm (LLM grounded review only) | ★ 본 plan F-RBAC-BYPASS-001 trigger | medium |
| C-domain-schema-stakeholders-mandatory | `schemas/domain.schema.json` 안 bounded_context 의 stakeholders + business_intent_summary 필수 또는 권장 결단 | ★ 본 plan F-DOMAIN-PURPOSE-001 trigger | medium |

---

## 9. 참고 / 인용

- DEC-2026-05-06-round-trip-부분-허용 — chain harness gate 안 정식 허용
- LL-codegraph-01 — self-referential drift 회피 (★ ★ ★ axis 3 분리 의무)
- LL-codegraph-07 — 사내 source 외부 위치 paradigm
- 직전 plan ladder = `.claude/plans/plan-poc17-chain1-discovery-car-list.md` (gate #1 = stop + revisit:analysis trigger)
- 직전 chain 1 산출물 = `~/.../poc-17-ifrs-car-migration/.aimd/output/discovery-spec.{json,md}` (frozen)
- DEC-2026-05-29-sub-rule-v1.2.0-poc-17-corroboration — sub-rule §X-H v1.2.0
- methodology-spec/baseline-delta-operating-model.md — analysis delta 갱신 paradigm
- memory `feedback_dual_goal_migration_plus_plugin.md` — 듀얼 목표

---

## 10. 4원칙 ladder 다음 단계

- **1원칙 종결** ✅ (본 plan.md 작성 + axis 분리 본격 결단 / scope-in 2 axis + scope-out 1 axis)
- **2원칙 research** — 가벼운 sub-agent (Case 생략 + 시간 cap):
  - sequence-diagrams + characterization-spec schema 정합 확인
  - F-RBAC-BYPASS-001 본격 본문 구조 (finding-system.md 정합)
  - additive field 갱신 paradigm verify (business-rules.json + domain.json schema 안 additionalProperties:true 정합)
- **3원칙 사용자 승인** — 본 plan §5 결단 5 묶음 보고 (★ 결단 3 = axis 3 분리 본격 의제 / 자기-confirmation 의무)
- **4원칙 실패 시 revert** — 본 plan §6 R-001~007 정합 / 어느 axis 라도 self-referential drift 발생 시 revert + LL 기록 + 1원칙 재시작
