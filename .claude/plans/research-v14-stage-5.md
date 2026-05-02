# research-v14-stage-5

> v1.4.0-dev Stage 5 (본격 PoC #04 — 4-6 sprint) 3 에이전트 research 종합
> 4원칙 2번 산출
> 일자: 2026-05-02
> Trigger: plan-v14-stage-5.md §1.2 — research 후 사용자 승인 게이트 입력

---

## 0. research 패턴

- 가벼운 sub-agent 전략 (Phase 4-6 pattern / Case 생략 / 시간 cap 15분).
- 3 에이전트 병렬 (공식문서 / 산업 사례 / Senior).
- 출처 URL 의무 / 시뮬 ❌ / 추측 ❌.

---

## 1. ★★★ 3 에이전트 합의

### 1.1 fork 재선정 의무 (★ Stage 2 G3-2 strict)

| 항목 | 합의 |
|---|---|
| RealWorld + i18n 적용 활성 fork | ★ 부재 (3/3 합의 — 공식 + 산업 + Senior) |
| Bulletproof React | ★ 사내 스택 100% 일치 / 단 RealWorld 외 → adoption 트랙 carry (3/3) |
| Stage 2 G3-2 strict | ★ Senior 권고 = "RealWorld only strict" 유지 / 산업도 혼입 ❌ |
| 권고 | ★ ★ **(B) yurisldk fork + react-i18next 직접 추가** (★ 공식 권고 + Senior strict 정합 / 단 yurisldk 코드 재사용 ❌ — Senior Q1 strict) |

★ 충돌 명시:
- 공식 권고 (a) yurisldk + i18n 직접 추가 — Stage 4 자산 재사용 가능
- Senior 권고 strict — yurisldk 코드 재사용 ❌ / 별도 fork 필요

→ ★ 사용자 결단 의뢰 시점: yurisldk 코드 재사용 vs 새 fork.

### 1.2 진짜 도구 의무 (★ no-simulation 정책 단계 5 target)

| 도구 | 본 fork 환경 | Stage 5 의무 |
|---|---|---|
| ts-morph 24 | ✅ Stage 4 검증 | ✅ 의무 (★ 9 deliverable cross-link) |
| Playwright + Chromium | ✅ Stage 4 검증 | ✅ 의무 (★ 4 viewport 의무 — ADR-FE-002) |
| @axe-core/playwright 4.10 | ✅ Stage 4 검증 | ✅ 의무 (★ 전체 page WCAG 2.2 AA) |
| **Semgrep** (Windows 부재) | △ Docker 권고 | ✅ 의무 (★ Docker 또는 WSL2) |
| **i18next-parser** + **@formatjs/icu-messageformat-parser** | ⏳ 신규 | ✅ 의무 (i18n 적용 fork) |
| **Ajv 8** + ajv-formats | ⏳ 신규 | ✅ 신설 (★ schema validator — form-validation-spec / type-spec) |

→ ★ 진짜 도구 ≥ 5종 의무 / Senior Q6 = -0.05/건 simulation penalty strict.

### 1.3 본체 도구 격상 시점 충돌 (★ 사용자 결단 의뢰)

| 옵션 | 공식 | 산업 | Senior |
|---|---|---|---|
| (A) Sprint 5-1 진입 전 | ★ Senior 정면 위반 | △ 산업 미사례 | ❌ §8.1 단일 PoC 과적합 |
| **(B) Sprint 5-3 격상** | △ | △ Backstage 류 in-flight 예외 | ★ ★ **권고 — 정합점** |
| (C) Stage 5 종결 후 | ★ 산업 표준 (PoC 종결 후) | ★ ★ 산업 권고 | △ 본 분석 효율 손실 |

★ Senior 결단 = (B) Sprint 5-3 격상 (★ §8.1 정합 + 분석 효율 균형 + ★ "Stage 5 단독 + mini-PoC 합산 ≥ 2 patterns 일치" 확인 후 격상).

★ ★ ★ ★ 충돌: 산업 = (C) Stage 5 종결 후 / Senior = (B) Sprint 5-3.

### 1.4 sprint cadence 합의

| 항목 | 공식 | 산업 | Senior |
|---|---|---|---|
| Sprint 길이 | 2주 (Atlassian) | 2주 (Spotify hybrid) | 동의 |
| 게이트 | Sprint Review (산업 표준) | Sprint Review + Stripe 단계 | ★ 사용자 승인 묶음 5건 |
| 분배 | 6 sprint (Q9) | 6 sprint (Q7) | ★ 5 sprint + Sprint 5-6 carry |
| ★ 합의 | **★ 6 sprint × 2주 = 12주 / Sprint Review 의무** | | |

### 1.5 cross-PoC validation = 산업 갭 (★ 본 방법론 자체 자산)

★ 3/3 합의:
- 공식: ★ "합의된 표준 도구 부재"
- 산업: ★ Snyk/SonarQube/Semgrep 모두 cross-language invariant fusion ❌ → **manual matrix 산업 표준**
- Senior: ★ 본 방법론 §8.1 strict + drift-validator FE 모드 확장이 산업 갭 메움

---

## 2. ★ 핵심 충돌 / 결단 입력 (사용자 G1~G6)

### 2.1 G1 — fork 재선정 결단 (★ 공식 vs Senior 충돌)

```
A. yurisldk + react-i18next 직접 추가 (공식 권고 / Stage 4 자산 재사용)
   - 장점: ★ Stage 4 자산 재사용 / 1주 단축 / 친숙
   - 단점: ★ Senior strict 위반 (코드 재사용 → §8.1 단일 PoC 과적합 위험)

B. ★ 새 RealWorld i18n fork 발굴 + Stage 2 G3-2 strict (Senior 권고)
   - 장점: ★ §8.1 strict 정합 / cross-PoC 비교 frame 보호
   - 단점: ★ 후보 부재 (3/3 합의) → 사용자가 fork 발굴 + 또는 신설

C. ★ yurisldk + react-i18next 추가 + ★ 코드 재사용 ❌ + ★ Stage 4 finding 만 carry
   - 장점: ★ 절충점 (자산 일부 재사용 + 새 fork frame)
   - 단점: ★ 모호 (재사용 ❌ 이지만 같은 fork — 사상 정합 회색)
```

★ Senior 권고 = **B (strict)** / 공식 권고 = **A (실용)** / 절충 = **C**.

### 2.2 G2 — 본체 도구 격상 시점 (★ 산업 vs Senior 충돌)

```
A. Sprint 5-1 진입 전 격상
   - ★ §8.1 정면 위반 (Senior 거부)
B. ★ Sprint 5-3 격상 (Senior 권고 / Backstage 류 in-flight 예외)
   - ★ patterns ≥ 2 일치 확인 후 격상 (★ §8.1 정합)
C. Stage 5 종결 후 격상 (산업 표준)
   - ★ 본 분석 효율 손실 (re-run 비용)
```

★ Senior 권고 = **B** (★ §8.1 정합 + 분석 효율 균형).

### 2.3 G3 — 9 deliverable 분배 (★ 3/3 합의 / 미세 차이)

```
A. 공식 6 sprint 분배:
   - Sprint 1 carry / 2: arch + type-spec / 3: api + form-val / 4: ui-ux + state-map + visual / 5: a11y + i18n / 6: rules + AP + sec + cross-PoC
B. 산업 6 sprint 분배:
   - 1 arch+api / 2 rules+AP+form-val / 3 ui-ux+state-map+visual / 4 a11y+i18n+sec+type-spec + buffer 2
C. ★ Senior 5 sprint 분배:
   - 5-1 carry resolve (3) / 5-2 split a/b (3) / 5-3 quality (4 + 3 stream) / 5-4 cross-PoC + 종결 메타 / 5-5 release 자격
```

★ Senior 권고 = **C** (★ 5 sprint + Sprint 5-6 carry).

### 2.4 G4 — cross-PoC validation 우선순위 + 본체 격상 임계 (★ Senior strict)

```
A. ★ Senior 권고 strict:
   - patterns ≥ 3 strict (★ JWT XSS = PoC #01/02/04-mini = 3 patterns 도달 → Stage 5 본격 4 patterns 시 ★ 본체 격상 결단)
   - URL params validation = 1 patterns → candidate 유지 (adoption 추가 시 격상)
   - drift-validator FE = Q2 본체 도구 격상에서 처리 (validation secondary)
   - html-has-lang a11y = 1 patterns → candidate

B. 본체 격상 임계 ≥ 2 patterns (plan §2.2 기존 권고)
   - patterns 2 도달 시 격상 검토 (느슨)
```

★ Senior 권고 = **A strict** (★ patterns ≥ 3 / §8.1 strict).

### 2.5 G5 — Sprint 분할 패턴 (★ Senior + 사용자 6번 요구 정합)

```
A. plan §3.1 Sprint 5-1~5-5 유지 (★ Senior 권고)
   - 사용자 승인 묶음 5건 + Sprint 게이트 (i) 진입 (ii) 중간 (iii) 종결 (iv) 묶음 = 4 의무 × 5 sprint = 20 점검점
B. Sprint 5-1+5-2 통합 (★ 의존성 위반 / Senior 거부)
C. Sprint 5-3+5-4 통합 (★ 검토 cap 초과 / Senior 거부)
```

★ Senior 권고 = **A** (★ 5 sprint + 5 게이트).

### 2.6 G6 — 신뢰도 ratchet 결단 (★ Senior 권고 / ADR-010 정합)

```
A. ★ Senior 권고 (★ 0.90 미달 시):
   - revert ❌ (★ ADR-010 baseline 회귀 위반)
   - Stage 6 추가 ❌ (★ release 일정 영향 큼)
   - ★ ★ Sprint 5-6 carry + 명시 carry-over (★ 정합점)
   - 0.85 이하 회귀 시 ★ revert (4원칙 4번)
B. 0.90 strict + 미달 시 release ❌
```

★ Senior 권고 = **A** (★ Sprint 5-6 carry / Stage 7 자격 4 하한 0.90 + 사용자 승인 의무).

---

## 3. ★ Senior +2 추가 의무 (★ Stage 7 release 진입 자격)

★ Senior Q8 권고 — Stage 7 v1.4.0 MINOR release 진입 자격 ★ 5+2 strict:

| # | 자격 | 임계 |
|---|---|---|
| 1 | 사상 정합 | ★ 비협상 |
| 2 | IR 4계층 정합도 ratchet | 0.95+ (Stage 4 0.99 → Stage 5 0.95+ 단조 비감소) |
| 3 | 진짜 도구 5종+ 실행 | ts-morph + Playwright + axe + Semgrep + ICU MF |
| 4 | finding | 5~15 건강 / 16+ 결함 의심 |
| 5 | 신뢰도 | 0.90+ |
| **6 (★ Senior 추가)** | **★ cross-PoC patterns ≥ 2 본체 격상 결단 완료 (사용자 승인)** | ★ §8.1 strict |
| **7 (★ Senior 추가)** | **★ ADR-FE-001~006 carry 0건 또는 명시 carry-over (release note 의무)** | ★ release 정합 |

→ ★ ★ Stage 5 종결 시 7/7 자격 평가 의무.

---

## 4. ★ 사상 위반 검토 strict (★ Senior Q7)

★ ★ ★ Senior 권고 = Sprint 단위 + 4 임계 strict:

| # | 위반 임계 | 결단 |
|---|---|---|
| 1 | ADR-FE-006 명제 1 (FE 매개체 ≠ BE 추출) 위반 / round-trip 흔적 | ★ 즉시 revert + 사용자 승인 |
| 2 | 명제 2/3 (한 방향 / fail-fast) 위반 / 도메인 추출 흔적 | ★ revert |
| 3 | IR 4계층 정합도 ratchet 0.95 미달 (★ baseline 회귀) | ★ revert |
| 4 | drift breaking ≠ 0 (★ no-simulation 단계 5 미달) | ★ revert |

★ 검토 시점: Sprint 중반 + 종결 = 2회/sprint × 5 sprint = ★ 10 회 검토 의무.

★ revert 결단 = ★ 사용자 승인 의무 (자율 결단 ❌) + Lessons Learned plan.md 기록 + 1원칙 재시작 시 동일 fork 재사용 ❌ (G1 정합).

---

## 5. ★ 핵심 위험 + 완화 (3 에이전트 종합)

| # | 위험 | 출처 | 영향 | 완화 |
|---|---|---|---|---|
| **R1** | RealWorld i18n 활성 fork 부재 | 3/3 합의 | 고 | ★ 사용자 G1 결단 (A/B/C) / B 채택 시 fork 발굴 1주 cap |
| **R2** | Senior strict vs 산업 (도구 격상 시점) | Senior + 산업 | 중 | ★ G2 결단 / Senior B 권고 strict |
| **R3** | Semgrep Windows 환경 부재 | 공식 | 중 | ★ Docker 권고 (1주 cap 즉시 실행) / 또는 사용자 위임 |
| **R4** | cross-PoC 자동화 도구 부재 (산업 갭) | 3/3 합의 | 중 | ★ manual matrix 산업 표준 / drift-validator FE 모드 확장이 자체 자산 |
| **R5** | 9 deliverable 5 sprint 부담 (vs 산업 6 sprint) | 산업 | 고 | ★ Senior 5 sprint + Sprint 5-6 carry / cap 초과 시 사용자 결단 |
| **R6** | 신뢰도 0.90 미달 가능성 | Senior | 중 | ★ Sprint 5-6 carry 명시 + Stage 7 자격 7/7 평가 |
| **R7** | 사상 위반 발견 (Sprint 진행 중) | Senior | 고 | ★ Sprint 단위 4 임계 검토 + revert 사용자 승인 의무 |
| **R8** | 본체 격상 patterns < 3 미달 | Senior | 고 | ★ Stage 5 + adoption 트랙 합산 / 본체 격상 carry |

---

## 6. ★ 사용자 일괄 승인 게이트 (3원칙) — 6 핵심 결정

★ Senior 권고 + 충돌 영역 통합 → 사용자 일괄 승인 의무:

### G1. fork 재선정 결단 (★ 공식 vs Senior 충돌)

| 옵션 | 권고자 |
|---|---|
| A. yurisldk + i18n 직접 (자산 재사용) | ★ 공식 (실용) |
| **B. 새 RealWorld i18n fork (★ strict)** | **★ Senior** |
| C. yurisldk + i18n + 코드 재사용 ❌ (절충) | (사용자 결단 영역) |

### G2. 본체 도구 격상 시점 (★ 산업 vs Senior 충돌)

| 옵션 | 권고자 |
|---|---|
| A. Sprint 5-1 진입 전 | (거부) |
| **B. Sprint 5-3 격상 (★ patterns ≥ 2 확인 후)** | **★ Senior** |
| C. Stage 5 종결 후 | ★ 산업 표준 |

### G3. 9 deliverable 분배 패턴

| 옵션 | 권고자 |
|---|---|
| A. 공식 6 sprint 분배 (carry 우선) | ★ 공식 |
| B. 산업 6 sprint 분배 (의존 그래프) | ★ 산업 |
| **C. ★ Senior 5 sprint + Sprint 5-6 carry** | **★ Senior (정합점)** |

### G4. cross-PoC patterns 본체 격상 임계

| 옵션 | 권고자 |
|---|---|
| A. patterns ≥ 2 (느슨) | (plan 기존) |
| **B. ★ patterns ≥ 3 strict (§8.1 정합)** | **★ Senior** |

### G5. Sprint 분할 + 게이트

| 옵션 | 권고자 |
|---|---|
| **A. plan §3.1 5-1~5-5 + 사용자 승인 묶음 5건** | **★ Senior + 사용자 6번 요구 정합** |
| B. 5-1+5-2 또는 5-3+5-4 통합 | (거부) |

### G6. 신뢰도 ratchet 결단 (★ 0.90 미달 시)

| 옵션 | 권고자 |
|---|---|
| A. revert (★ ADR-010 위반) | (거부) |
| B. Stage 6 추가 (일정 영향 큼) | (차순위) |
| **C. ★ Sprint 5-6 carry + carry-over 명시 (★ 정합점)** | **★ Senior** |

---

## 7. 종결 진술

> 본 research = v1.4.0-dev Stage 5 본격 PoC #04 4원칙 2번 산출.
> 3 에이전트 합의 (★ no-simulation 단계 5 / Sprint 6 cadence / cross-PoC 산업 갭) + 충돌 (fork 재선정 / 도구 격상 시점 / 분배 패턴) 결단 입력 6건 추출.
> ★ Senior 권고 strict 우선 (★ §8.1 + ADR-FE-006 + ADR-010 정합).
> ★ ★ Stage 7 release 자격 ★ 5+2 strict (★ Senior +2: cross-PoC ≥ 3 + ADR carry 0건).
> 다음 trigger = 사용자 일괄 승인 (3원칙 G1~G6) → Sprint 5-1 즉시 진입.

**End of research-v14-stage-5.**
