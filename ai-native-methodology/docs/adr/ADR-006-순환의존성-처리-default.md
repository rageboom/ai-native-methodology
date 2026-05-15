# ADR-006: 순환 의존성 처리 default 정책 (Cycle Handling Default)

- 상태: **승인 (Final / v1.2.3)** — ★ provisional → final 격상 (3 PoC 검증 후)
- 일자: 2026-04-28 (provisional) / 2026-04-30 (final 격상)
- 결정자: 윤주스 (TF Lead, Auto Mode 위임)
- 관련: ADR-001, ADR-004, schemas/architecture.schema.json, methodology-spec/workflow/architecture.md §3.1.1, DEC-2026-04-30-v1.2.3-본체-격상

---

## ★ Final 격상 근거 (2026-04-30)

3 PoC 검증 결과:
- **PoC #01** (Spring Boot 2.5 / 단일 module) — CIRCULAR-001 (domain/article ↔ domain/user) 검출 ✅
- **PoC #02** (Spring Boot 3.3 / Hexagonal multi-module) — CIRCULAR 0건 (★ Hexagonal 분리 효과 입증)
- **PoC #03** (NestJS / 단일 module tree) — CIRCULAR 0건 (★ TypeScript import 정적 차단 효과)

**hybrid (탐지 결정적 + 분류 BC 분기 + decision_required) default 가 3 platform 모두 정합** ✅. revisit 사유 없음 → final 격상.

★ 3 PoC 가 알고리즘 단일 default 의 적용 가능성을 입증 — provisional 의 "단일 PoC 과적합 회피" 원래 우려 해소.

---

## 컨텍스트

PoC #01 (RealWorld Spring Boot) Phase 3 에서 `domain/article ↔ domain/user` 양방향 import (5+4=9) 가 검출되었다 (CIRCULAR-001). 이를 어떻게 분류할지 명세에 가이드가 부재했다 (F-023, high).

분기 가능성:
- **알고리즘 우선**: Tarjan SCC 검출 = 자동 high (Spring Modulith verify() 빌드 차단 모델)
- **도메인 의도 우선**: 같은 BC 내 cross-aggregate 는 정상 가능 (Vaughn Vernon IDDD)
- **hybrid**: 탐지는 결정적 + 분류는 BC 의도 기반

PoC RealWorld 는 BC 미정의 상태였으므로 분기 자체가 불가능했다.

---

## 결정

**hybrid 채택 — 탐지(결정적) + 분류(BC 분기) + decision_required 페어**.

### default 정책

```
bc_status = undefined (BC 미정의 시 default)
  → severity = medium
  → decision_required = true
  → decision_owner = domain_expert
  → phase_4_routing = true
```

### 분류 표

| bc_status | bc_assignment_explicit | severity | decision_required |
|---|---|---|---|
| same | true | low | false |
| same | false | low | true (BC 명시 권고) |
| different | true | high | false |
| different | false | medium | true |
| undefined | * | medium | true (default) |

### schema 어휘

`circular_dependencies[]` 항목:

```yaml
bc_status: same | different | undefined  # 3값 enum
bc_assignment_explicit: true | false      # boolean
documented_decision: true | false         # boolean
severity: low | medium | high             # 표 기반 자동
decision_required: true | false           # severity 와 페어링
```

> ⚠️ "intent" 단어는 **사용하지 않음**. 산업 표준 도구 (Spring Modulith / ArchUnit / Vernon IDDD) 어디도 "intent" enum 미사용. 3값 + boolean 페어가 정합.

### 도구 정책 분기

- **Spring Modulith verify() 또는 ArchUnit `slices().beFreeOfCycles()` 활성**: 도메인 의도 무관 자동 high (빌드 차단)
- **도구 미활성 + ArchUnit FreezingArchRule 패턴**: 기존 cycle = baseline 수용, 신규 cycle 만 차단

---

## 결정 근거

### 1차 사료

**Spring Modulith Discussion #493** (Oliver Drotbohm 본인 답변):

> "A directed acyclic graph between modules is key to an evolvable architecture"
> 휴리스틱: "Which of the two modules could exist without the other?"
> 기술적 우회: "introduce an interface on the catalog side for OrderCompleted to implement"

→ 즉시 fail 이 아닌 **"decision_required → interface inversion"** 패턴. 본 ADR 의 `decision_required` 페어링과 정확히 일치.

### ArchUnit FreezingArchRule = 산업 표준 구현

> "introducing a new ArchRule to an existing project that causes too many violations to solve at the current time — a typical example is a huge legacy project where a new rule might cause thousands of violations"

→ "기존 cycle = baseline 수용, 신규 cycle 만 차단" = 본 ADR 의 default `medium + decision_required` 와 의미 동등.

### "intent" 단어 회피

case research (8개 시스템 조사) 결과:
- Spring Modulith: violation 만 (intent 없음)
- ArchUnit: violation + frozen (intent 없음)
- Vernon IDDD: 사상적 논의 (enum 정의 없음)
- **0/8 시스템에서 "intent" enum 사용**

→ 3값 bc_status + 2 boolean 으로 충분 + 산업 표준 정합.

---

## 결과

### 긍정적 영향
- PoC #01 CIRCULAR-001 처리 가능 (BC 미정의 → medium + decision_required + Phase 4 라우팅)
- v1.1.1 산출물 호환 (옵셔널 신규 필드 — PATCH 가능)
- 산업 표준 어휘 정합 (intent 단어 회피)
- ArchUnit FreezingArchRule 패턴 의미 등가

### 부정적 영향 / 위험
- BC 정의가 없는 PoC 에서 default `medium` 이 다소 보수적일 수 있음 (low 가 아닌 medium 채택 이유: ArchUnit 산업 표준)
- "domain-legitimate cycle" 자동 분류는 산업 도구 어디에도 없음 → 전적으로 사람 결정에 의존
- v1.2 Context Map 도입 시 분류 자동화 가능성 (현재는 LLM 추론으로도 부정확)

<details>
<summary>원래 Provisional 사유 (★ v1.2.3 final 격상으로 해소 — 역사 보존)</summary>

본 ADR 은 v1.1 시점 **PoC #01 (모놀리스, BC 미정의) 단일 케이스**에 기반했었음. 당시 다음 사례에서 재검토 필요로 분류:
- PoC #02 (마이크로서비스): BC 가 모듈 경계와 일치 → bc_status=different default 가 더 적합할 수 있음
- 사내 멀티 도메인 시스템: 도메인 분리 강제 정책 (different = always high)

→ 당시 `revisit_at: PoC #02 완료 시점` 명시.

**해소** (2026-04-30, v1.2.3 final 격상): PoC #02 + PoC #03 검증 완료 (line 10~19) — hybrid default 가 3 platform 모두 정합 입증. revisit 사유 해소.

</details>

---

## 영향 범위

- `schemas/architecture.schema.json`: `circular_dependencies[]` 신규 필드 5개 (bc_status, bc_assignment_explicit, documented_decision, decision_required, decision_owner, decision_deadline, phase_4_routing). 모두 옵셔널 → v1.1.1 호환.
- `methodology-spec/workflow/architecture.md` §3.1.1: 분기 가이드 추가
- `examples/poc-01-realworld-spring/`: CIRCULAR-001 재기록 시 `bc_status=undefined` 적용
- 향후 v1.2 Context Map ADR (예정): bc_status 자동 분류 가능

---

## 대안 검토

| 옵션 | 채택 여부 | 이유 |
|---|---|---|
| 알고리즘 우선 (자동 high) | ❌ | "domain-legitimate cycle" 사상 (Vernon IDDD) 부정 |
| 도메인 의도 우선 (자동 분류) | ❌ | LLM 추론 신뢰도 부족, 산업 도구 0건 |
| **hybrid (탐지 + BC 분기 + decision_required)** | **✅ 채택** | Drotbohm 1차 사료 + ArchUnit FreezingArchRule 정합 |
| 4-way "intent" enum | ❌ | 산업 표준 0건, 단어 모호 |

---

## 참고
- ADR-001 (사상적 기반)
- ADR-004 (DDD-Lite B 강도)
- Spring Modulith Discussion #493 (Oliver Drotbohm)
- ArchUnit FreezingArchRule documentation
- Vaughn Vernon, "Implementing Domain-Driven Design", Ch.4
- v1.1 research case-v112-f023 (1차 사료 검증) — git history 참조 (commit `c72d29c` 이전 `methodology-v1.1/.claude/`)
- v1.1 research research-v112 §2 (통합 결정) — git history 참조
