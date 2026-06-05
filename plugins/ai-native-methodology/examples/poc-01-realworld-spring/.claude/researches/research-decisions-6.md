# Research: PoC #01 사용자 결정 6건 — 3 관점 통합

> 작성일: 2026-04-28
> 4원칙 2단계 — document / case / senior 3 관점 토론
> 기반 자료: research-phase2.md, research-phase3.md, ADR-006, methodology-v1.1/.claude/researches/research-v112.md
> 추가 sub-agent fetch: 불필요 (Phase 2/3 research 에서 본 6 결정 주제 모두 1차 사료 + 외부 증거 확보 완료)

---

## 0. 종합 권장 (Executive Summary)

| ID | 권장 | 신뢰도 | 3 관점 합의 |
|---|---|---|---|
| DRIFT-002 | A. 단방향 | 0.95 | ✅ 3/3 |
| DRIFT-003 | B. 권장만 | 0.95 | ✅ 3/3 |
| DRIFT-007 | A. NO ACTION 유지 | 0.85 | ✅ 3/3 (단 사내 격상 메모 권고) |
| DRIFT-010 | C. Phase 4 검증 후 | 0.92 | ✅ 3/3 |
| CIRCULAR-001 | A. ADR-006 default | 0.95 | ✅ 3/3 |
| ARCH-STYLE | A. 승인 | 0.95 | ✅ 3/3 |

→ **6건 모두 3 관점 합의**. 추가 sub-agent fetch 불필요.

---

## 1. DRIFT-002: user_followings 단방향 vs 양방향

### Document 관점 (JPA/RealWorld spec)

- **JPA 공식 문서**: `@OneToMany + @JoinTable` 단방향 표현 = JPA spec 허용. 단 `Set<User>` 자기 참조 단방향은 비주류.
- **RealWorld 공식 spec** (gothinkster/realworld 의 API spec): `POST /profiles/:username/follow` + `DELETE /profiles/:username/follow` — **단방향 follow**.
- A → B 와 B → A 는 독립 row (대칭 강제 없음).

### Case 관점 (Twitter/Instagram follow 사례)

- Twitter follow / Instagram follow / GitHub follow — 모두 **단방향**. 양방향은 mutual_follow 라는 **derived 관계** (SELECT 시 join).
- DDL 로 양방향 강제하는 SNS 사례 0건 — DDL 은 행 단위 follow 기록, 양방향성은 application 레벨 derived.

### Senior 관점

- DDL 의 ManyToMany "표현 가능" ≠ "표현 의도". 본 PoC 는 spec 의도 우선.
- 단, **사내 적용 시 함정**: 만약 follow 가 의미상 양방향이면 (예: 친구 관계) DDL UNIQUE 제약을 정렬 기준으로 추가 (`UNIQUE(LEAST(a,b), GREATEST(a,b))`) — 본 PoC 는 해당 안 함.

### 결론

**A. 단방향** 채택. 신뢰도 0.95.
- schema.json `relations[].kind = "many-to-many"` 유지 (DDL 표현 보존)
- `relations[].semantic = "directional_follow"` 보강 (도메인 의도 기록)
- 정합성-검증-보고서 §1.1 DRIFT-002 resolution: "단방향 — JPA 의도 우선 (RealWorld spec API 일관)"

---

## 2. DRIFT-003: Article uniqueConstraints JPA 측 추가

### Document 관점

- JPA `@Table(uniqueConstraints=@UniqueConstraint(...))` = ddl-auto=validate 모드에서 검증 효과. 코드 가독성 ↑.
- ddl-auto=none (본 PoC) 에서는 동작 영향 0.
- `@UniqueConstraint` 가 있으면 Hibernate 도구로 schema 생성 시 일치.

### Case 관점

- Spring Boot 프로젝트 best practice: DDL 과 JPA 양쪽에 제약 명시 (단일 SoT 의 위험 완화).
- 단 RealWorld 는 외부 학습용 레포 — PR 발의 권한 외.

### Senior 관점

- 본 PoC 는 RealWorld 분석 대상이지 RealWorld 코드 변경 책임 없음. 권장 사항으로 기록만.
- 사내 적용 시 양쪽 명시가 default → schema.json `recommendations[]` 에 표준 권장 등재.

### 결론

**B. 권장만 기록** 채택. 신뢰도 0.95.
- schema.json `recommendations[]` 에 "JPA Article.@Table(uniqueConstraints) 추가 권장" 1건 추가
- RealWorld 코드 변경 불요 (외부 권한)

---

## 3. DRIFT-007: articles.author_id FK 정책

### Document 관점

- PostgreSQL/H2 기본값 NO ACTION = User 삭제 시 articles 가 referencing 하면 거부.
- CASCADE = articles 도 삭제 (다른 6 FK 와 일관).
- RESTRICT = NO ACTION 과 유사 (deferred 동작 차이만).
- RealWorld API spec: User 삭제 endpoint 부재 — 시나리오 자체 미정의.

### Case 관점

- **GDPR / 회원탈퇴 처리** (한국 SI 일반):
  - Soft delete (deleted_at) + author "Deleted User" 표시 = 가장 흔함
  - Hard delete + CASCADE = articles 손실 위험 → 보통 사용 안 함
  - Hard delete + NO ACTION = User 삭제 자체 거부 → 운영 사고 가능
- 카카오/네이버 사례: soft delete + author placeholder 가 default.

### Senior 관점

- "FK CASCADE 와 NO ACTION 혼재 시 의도 명시 부재" = Senior research §6 의 핵심 사례.
- 본 PoC: spec 보존 (NO ACTION 유지) + 사내 적용 시 finding 메모 → 안티패턴 후보 격상.
- **함정**: 본 PoC 의 NO ACTION 을 사내에 그대로 적용하면 운영 사고. medium → high 격상 명시 필수.

### 결론

**A. NO ACTION 유지** + 사내 격상 메모. 신뢰도 0.85.
- schema.json `tables[articles].fk_policy = "NO_ACTION (RealWorld spec 보존)"` 명시
- schema.json `recommendations[]` 에 "사내 적용 시 soft delete + author placeholder 패턴 권장" 추가
- Phase 6 안티패턴 후보 AP-DB-FK-INCONSISTENT-XXX 등록 — 본 PoC medium / 사내 high

---

## 4. DRIFT-010: users.email UNIQUE

### Document 관점

- DDL: UNIQUE 부재. JPA: unique=false 기본.
- RealWorld API spec: `POST /users` (회원가입) — **email 중복 처리 명시 부재** (학습용 spec 단순화 가능성).

### Case 관점

- 100% 의 production SaaS 가 email UNIQUE 강제 (Twitter, Slack, GitHub 등).
- 학습용 spec 은 회원가입 service 의 application 레벨 unique 검증으로 우회 가능 — 코드 raw fetch 후 결정.

### Senior 관점

- "DDL CHECK 부재 + Bean Validation 분리" 함정 (Senior research §6).
- **결정 핵심**: 회원가입 service 의 코드가 application 레벨 unique 검증을 하는지.
- Phase 4 5.A 의 첫 번째 검증 항목으로 라우팅이 합리.

### 결론

**C. Phase 4 5.A 검증 후 결정** 채택. 신뢰도 0.92.
- schema.json `recommendations[]` 에 "Phase 4 5.A 에서 User 회원가입 service 의 application 레벨 email unique 검증 확인 필수" 추가
- 정합성-검증-보고서 §1.2 DRIFT-010 resolution: "Phase 4 5.A 검증 후 결정 — service 코드의 unique 검증 유무가 핵심"
- Phase 4 plan-phase4.md 에 5.A 첫 검증 항목으로 등록 (Phase 4 입력)

---

## 5. CIRCULAR-001: User ↔ Article BC 분류

### Document 관점

- Spring Modulith Discussion #493 (Drotbohm 1차 사료): "directed acyclic graph between modules is key" + "decision_required → interface inversion".
- ArchUnit FreezingArchRule: "기존 cycle = baseline 수용, 신규 cycle 만 차단".
- ADR-006 (본 방법론 v1.1.2): bc_status=undefined → medium + decision_required=true (default).

### Case 관점

- Vaughn Vernon "Effective Aggregate Design Part II": **양방향 cross-aggregate 참조 = anti-pattern**.
- 단 **같은 BC 안 cross-aggregate 양방향 = 정상 가능** (Senior §5).
- 카카오뱅크 Spring Modulith 도입: ArchUnit verify() 자동 차단 — 도메인 의도 무관.
- RealWorld 는 BC 미정의 → 카카오뱅크 패턴 (자동 차단) 적용 시 빌드 실패. 학습용 spec 이라 verify() 미사용 → cycle 허용 상태.

### Senior 관점

- BC 미정의 모놀리스의 default = "BC 결정 보류 + 도메인 행동 검증" 이 가장 안전.
- **함정**: 본 PoC 에서 same/different BC 를 미리 결정하면 Phase 4 5.A 에서 도메인 행동 (User.writeCommentToArticle() 등) 검증 결과와 충돌 가능 → 재작업.
- ADR-006 자체가 Provisional — PoC #02 (마이크로서비스) 후 재검토 명시. 현 시점 default 가 가장 합리.

### 결론

**A. ADR-006 default** 채택. 신뢰도 0.95.
- architecture.json `circular_dependencies[CIRCULAR-001]` 에 v1.1.2 새 필드 추가:
  ```yaml
  bc_status: undefined
  bc_assignment_explicit: false
  documented_decision: false
  severity: medium  # ADR-006 default 표 적용 — Phase 3 의 잠정 low 갱신
  decision_required: true
  decision_owner: domain_expert
  phase_4_routing: true
  ```
- circular-dependencies.md §1.4 final_severity_decision 갱신: "ADR-006 default 적용 — bc_status=undefined + medium + decision_required + Phase 4 라우팅"
- Phase 4 5.A 입력: User ↔ Article BC 정의 + 도메인 행동 검증

---

## 6. ARCH-STYLE: Phase 1 → Phase 3 정정 트레이스 승인

### Document 관점

- 정정 근거 5 차원 (architecture.md §2.1):
  1. domain framework annotation 직접 import — 메인 9 + sub-agent 10 raw fetch 검증
  2. application → infrastructure 직접 의존 (LV-001) — Hexagonal 부정 핵심
  3. port/adapter 분리 1건만 (UserFindService)
  4. domain ↔ infrastructure 정상 port 1건만 (HmacSHA256JWTService)
  5. Anemic vs Rich Domain 통과 (User.writeCommentToArticle())
- 19건 raw fetch 100% (F-015 cross-validation 정착) — 검증 신뢰도 높음.

### Case 관점

- 카카오페이 home Hexagonal 제거 회고 (case §1): "Hexagonal 적용 3 전제 미충족" — RealWorld 1/3 충족 → 0.30 강한 지지.
- 우형 Multi Module Hexagonal (case §3): "Domain Hexagon = POJO 강제 (Spring Component/Service annotation 비사용)" — RealWorld 미달 → POJO 0.50 강한 지지.
- 카카오뱅크 Spring Modulith 도입 (case §2): "Modulith + Hexagonal + Modular Monolith 합성" — "Layered + Spring-DDD-Lite" 합성 명명 정당화.

### Senior 관점

- Δ -0.35 = 큰 정정. 외부 증거 (한국 사례 3건 + Vernon IDDD) 가 강하지 않으면 거부 가능. 본 케이스는 **3개 한국 사례 + 1개 글로벌 권위 (Vernon)** 모두 정정 방향 일치.
- 한국 SI 일반 패턴 — "POJO 라고 자기보고하지만 실측 framework 의존" (F-022 의 본질).
- 부분 승인 (B) 은 외부 증거 일부 무효화 → 일관성 손상.

### 결론

**A. 승인** 채택. 신뢰도 0.95.
- architecture.json `architecture_style = "layered"` (primary) + `secondary_styles = [{label: "spring_flavored_ddd_lite", confidence: 0.85}]` 유지
- architecture.json `meta.phase_1_candidate_correction_trace` 필드 final 확정:
  ```yaml
  hexagonal: { phase_1: 0.65, phase_3: 0.30, delta: -0.35, status: refuted, evidence: [LV-001, framework_leak, port_count_1] }
  pojo_domain: { phase_1: 0.85, phase_3: 0.50, delta: -0.35, status: corrected, evidence: [framework_annotation_direct_import, password_encoder_in_domain] }
  layered_ddd_lite: { phase_1: 0.55_implicit, phase_3: 0.85, delta: +0.30, status: promoted, evidence: [5_dimensional_check, kakao_payments_case, woowa_case, kakao_bank_case] }
  ```
- architecture.md §2 정정 트레이스 final 표시
- Phase 6 안티패턴 — LV-002 (AP-DOMAIN-FRAMEWORK-LEAK-001) 등록 강제 (LV-001 도 등록)

---

## 7. 통합 영향 — 갱신 파일 목록

3원칙 사용자 승인 후 일괄 갱신:

| 파일 | 변경 |
|---|---|
| `output/db/schema.json` | DRIFT-002 semantic 보강 + DRIFT-003 recommendations + DRIFT-007 fk_policy 명시 + DRIFT-010 recommendations |
| `output/db/정합성-검증-보고서.md` | DRIFT-002/003/007/010 §1.1~1.2 resolution 블록 추가 + §6 사용자 결정 필요 항목 → 결정 완료로 갱신 |
| `output/architecture/architecture.json` | CIRCULAR-001 v1.1.2 새 필드 + ARCH-STYLE 정정 트레이스 final |
| `output/architecture/circular-dependencies.md` | §1.4 final_severity_decision 갱신 (ADR-006 default 적용) |
| `output/architecture/architecture.md` | §2 정정 트레이스 final 승인 표시 |
| `findings/poc-findings.md` | F-024 (Phase 1↔3 정정) 의 사례 보강 |
| `RESUME.md` | §3 사용자 결정 6건 → ✅ 결정 완료로 갱신 |

---

## 8. 4원칙 적용 현황

- **1원칙**: plan-decisions-6.md ✅ 작성 완료
- **2원칙**: 본 research-decisions-6.md ✅ 작성 완료 (3 관점 합의 6/6)
- **3원칙**: 윤주스 승인 대기 ⏳
- **4원칙**: Phase 4 진입 후 검증 결과와 충돌 발생 시 적용

---

## 9. F-015 cross-validation 적용

본 6 결정의 자료는 모두 Phase 2/3 의 19건 raw fetch + ADR-006 1차 사료 (Drotbohm Discussion #493) 에 기반. 추가 sub-agent fetch 없이 본 작업 진행.

→ 단, Phase 4 진입 시 6 결정의 후속 검증 (특히 DRIFT-010 service 검증 + CIRCULAR-001 도메인 행동) 에 메인 raw fetch + sub-agent cross-check 의무 적용.

---

## 10. 다음 단계

1. ⏳ 윤주스 승인 (6건 일괄 또는 개별)
2. ⏳ 승인 후 일괄 갱신 (§7 파일 목록)
3. ⏳ Phase 4 진입 — plan-phase4.md 작성 (4원칙 1단계 — v1.1.2 갱신 명세 + ADR-006 + 6 결정 적용 사항 전수 조사)
