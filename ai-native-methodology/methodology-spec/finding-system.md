# Finding System — 명세 빈틈 기록·처리 체계

> **사상**: dogfooding — PoC 가 명세를 따라가다 막히는 모든 지점을 즉시 기록·분류·처리하여 명세 견고화

---

## 1. 목적

본 방법론은 dogfooding 으로 진화한다. PoC 가 명세를 따라가다 막히는 지점 = "명세 빈틈". 이를 즉시 기록·분류·처리하는 체계가 Finding System.

---

## 2. Finding 의 정의

PoC 진행 중 발견되는 **명세 빈틈**. 다음 3 조건 동시 만족 시 finding 등록:

```yaml
finding 등록 조건 (AND):
  1. spec_gap 식별 가능 — 어느 명세의 어떤 절이 비었는지 명확
  2. 재현 가능 — 다음 PoC 에서도 같은 막힘 발생 예상
  3. 우회 결정 기록됨 — decision_made 로 "본 PoC 는 이렇게 갔다" 기록
```

3 조건 미충족 시 finding 이 아니라 **그냥 작업 노트** (plan.md / research.md 에 기록).

---

## 3. Finding 표준 형식

`examples/poc-NN-*/findings/poc-findings.md` 에 누적. 각 finding 은 다음 YAML 블록.

```yaml
finding_id: F-NNN          # PoC 전역 일련번호
phase: 0~6                  # 발견 phase
discovered_at: YYYY-MM-DD
discoverer: <서술>          # PoC 진행 중 / sub-agent / 사용자 등
description: |              # 무슨 일이 있었나
context: |                  # 왜 이 케이스가 나왔나
spec_gap: |                 # 어느 명세의 어느 절이 비었나
decision_made: |            # 본 PoC 는 어떻게 우회했나
severity: low | medium | high
proposed_fix: <서술>        # 어떻게 고치면 좋을까

# 처리 후 추가
resolution:
  status: closed | promoted | rejected | deferred | logged
  resolved_at: YYYY-MM-DD
  resolution_method: |
  followup: []
```

---

## 4. Severity 기준

severity = **영향 범위 × 차단 강도**.

| severity | 기준 | 예시 |
|---|---|---|
| **critical** | 즉시 수정 의무 / production blocker | Auth scope 결여 / API 보안 취약점 |
| **high** | 모든 산출물 또는 복수 phase 영향 / 표준화 시급 / 우회 시 불일치 위험 | F-003 / F-007 / F-016 / F-023 |
| **medium** | 단일 phase 영향 / 우회 가능 / 명세 보강 권장 | F-008 / F-017 / F-022 / F-024 |
| **low** | 환경 의존 / 케이스별 무시 가능 / 옵셔널 | F-001 / F-018 / F-019 / F-026 |
| **★ positive** | **학습 효과 입증 / 모범 사례** — cross-PoC 비재현 | F-161 (Bearer 표준 = NestJS 학습 효과 / PoC #02 F-084 비재현) |

### 4.1 Positive finding 패턴

**정의**: 이전 PoC 의 negative finding 이 본 PoC 에서 **자연 회피된** 경우 등재.

**조건**:
- 이전 PoC 에 동형 negative finding 존재 (cross-PoC 검증 필수)
- 본 PoC 가 framework / 언어 / 팀 학습 효과로 자연 회피
- 시뮬 ❌ — 코드/main.ts/package.json 명시적 evidence 의무

**4 학습 효과 분류** (`positive_finding_meta.learning_effect_type`):

| 분류 | 의미 | 사례 |
|---|---|---|
| **framework_natural_avoidance** | Framework 가 자연 회피 | F-161 — NestJS `addBearerAuth()` 표준 |
| **language_static_block** | 언어가 정적 차단 | F-048 비재현 — TypeScript generic 정적 차단 |
| **platform_difference** | platform 자체 차이 | F-087 비재현 — NestJS 가 `ModelAndView` 미사용 |
| **team_learning** | 동일 팀의 학습 결과 | (PoC #2 → PoC #3 동일 팀 사내 적용 시) |

**처리**:
- status: `logged` (promoted/closed 아닌 별도 분류)
- migration-cautions.md 에 "모범 사례" 섹션 등재 의무
- 본체 격상 후보 표시 (`v13_promotion_candidate: true`)

**ROI**:
- 단일 PoC 과적합 회피 (§8.1) 의 적극적 입증 = "비재현 = 학습 효과" 정량화
- 사내 적용 시 framework / language 선택 가이드

---

## 5. 처리 (Disposition) 5 옵션

finding 처리 = **다음 PoC 에서 어떻게 다룰지 결정**.

| 처분 | 의미 | 명세 영향 | 다음 PoC 효과 |
|---|---|---|---|
| **closed** | 명세 본체/스키마/템플릿/ADR 에 정식 반영 | YES (즉시 갱신) | 재발 차단 |
| **promoted** | "지금은 안 고치지만 v1.2/v1.3 후보" | NO (백로그 등재) | 같은 finding 재발 가능 — 등재만 |
| **rejected** | "이건 명세 책임이 아님" + 사유 명시 | NO (사유 보존) | 다음 PoC 에서 같은 finding 올라와도 무시 근거 |
| **deferred** | "PoC 데이터 더 필요 — revisit_at 명시" | NO (관찰 모드) | 단일 PoC 과적합 회피 |
| **★ logged** | **positive finding (학습 효과) 등재** | YES (migration-cautions.md "모범 사례") | 사내 적용 시 framework/language 선택 가이드 |

### 5.1 closed 의 정식 반영 채널

- **명세 본체**: `methodology-spec/workflow/phase-N-*.md` 또는 `deliverables/NN-*.md` 절 추가
- **스키마**: `schemas/*.schema.json` 필드/enum 보강
- **템플릿**: `templates/*.template.{json,md}` 신설/갱신
- **ADR**: 의사결정 동반 시 `docs/adr/ADR-NNN-*.md` 신설
- **CHANGELOG**: PATCH (v1.1.x) / MINOR (v1.2.0) / MAJOR (v2.0.0) 표기

---

## 6. 처리의 효과

### 6.1 closed 의 효과 (명세 견고화)
- 다음 PoC 에서 동일 케이스 재발 차단
- 신규 사용자 진입장벽 감소 (명세만 보고 결정 가능)
- sub-agent 도 명세 참조로 일관 행동

### 6.2 closed 의 위험 (단일 PoC 과적합)
- 단일 PoC 의 환경 특수성 (예: H2 + ddl-auto=none + Lombok) 이 명세에 박힘
- 다른 도메인 PoC (예: NestJS + TypeORM + Redis) 에서 부적합 가능
- **해결**: high 만 즉시 closed, medium/low 는 PoC 2~3 회 누적 후 패턴 확정 시 closed

### 6.3 promoted/deferred 의 효과
- 명세 진화의 데이터 축적
- 같은 finding 이 PoC #02/#03 에서 재현 → "진짜 빈틈" 증명
- 재현 안 됨 → PoC #01 특수성 → reject 근거

---

## 7. 누적 임계 (F-021 메타 원칙)

```yaml
finding 누적 임계:
  1~4건  : 양호 (명세 안정)
  5~15건 : 건강한 검증 (명세 자가진화 활발)
  16~19건: 임계 근접 (집중 처리 권장)
  20건+  : 명세 자체 부실 의심 (PoC 정지 + 격상 검토)
```

**의미**: finding 은 많을수록 좋은 게 아니다. 누적 = 명세가 PoC 마다 막힌다는 신호. 20+ 도달 시 **PoC 진행보다 명세 격상이 ROI 높음**.

PoC #01 사례: 18건 누적 시 임계 근접 → Option A (PoC 정지 + v1.1.2 격상) → high 4건 closed → 잔여 10건 promote/defer 분류.

---

## 8. 처리 우선순위 결정 프레임

PoC 종료 시점에 잔여 finding 처리 결정:

```
Q1. severity 가 무엇인가?
  ├─ high   → 즉시 closed 시도 (PATCH 릴리스)
  ├─ medium → Q2 로
  └─ low    → 기본 deferred (PoC 2~3회 누적 후 재평가)

Q2. (medium) 단일 PoC 데이터로 임계값/공식 결정 가능한가?
  ├─ YES → closed (단, "v1 한계" 절 명시 + v2 재calibration 예약)
  └─ NO  → deferred (revisit_at 명시) 또는 promoted (다음 MINOR 후보)

Q3. (모든 severity 공통) 명세 책임 범위 안인가?
  ├─ YES → 위 트리 적용
  └─ NO  → rejected (사유 명시)
```

### 8.1 단일 PoC 과적합 회피 휴리스틱

다음 케이스는 **closed 보류** 권장:
- 임계값/공식이 단일 PoC 의 숫자 1개에 의존 (예: LOC 4711, 모듈 11개)
- 특정 기술 스택/프레임워크 가정 (예: Spring Boot only)
- 도메인 특이 패턴 (예: RealWorld 의 @Embeddable 3-level)

→ PoC #02 (다른 스택) / PoC #03 (다른 도메인) 후 패턴 수렴 확인 → closed.

---

## 9. PoC #01 처리 결과 (참고 사례)

```
총 18건:
  closed   8건 — Phase 0 high 2 + Phase 0 low/medium 2 + Phase 1~3 high 4 (v1.1.2)
  open    10건 — high 0, medium 7, low 3

처분 권장 (잔여 10건):
  promoted 4건 → v1.2.0 후보 (F-024, F-025, F-008, F-018)
  deferred 4건 → PoC #02/#03 후 재평가 (F-017, F-019, F-022, F-026)
  분류대기 2건 → reject 가능성 검토 (F-015 메타화, F-021 자체 종결)
```

→ Phase 4 진입과 잔여 finding 처리는 **분리**. 잔여는 백로그 등재 후 PoC #02 누적 데이터로 처리.
