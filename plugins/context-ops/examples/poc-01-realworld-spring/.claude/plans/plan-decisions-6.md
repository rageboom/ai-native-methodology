# Plan: PoC #01 사용자 결정 6건 — Phase 4 진입 전 일괄 처리

> 작성일: 2026-04-28
> 적용 정책: 품질 1순위 + 재작업 최소화 2순위 (memory feedback_quality_priority.md)
> 4원칙 1단계: 전수 조사 + 영향 범위 + 리스크

---

## 1. 결정 6건 요약

| ID | 영역 | 결정 사항 | 출처 |
|---|---|---|---|
| DRIFT-002 | DB | user_followings — 단방향 vs 양방향 | Phase 2 정합성-검증-보고서 §1.1 |
| DRIFT-003 | DB | JPA Article.@Table(uniqueConstraints) 추가 권장 — 적용? | Phase 2 §1.1 |
| DRIFT-007 | DB | articles.author_id FK 정책 — NO ACTION 유지 / CASCADE / RESTRICT | Phase 2 §1.1 |
| DRIFT-010 | DB | users.email UNIQUE — 의도 vs 누락 | Phase 2 §1.2 |
| CIRCULAR-001 | Arch | User ↔ Article BC 분류 (same / different / undefined) | Phase 3 circular-dependencies.md |
| ARCH-STYLE | Arch | Phase 1 → Phase 3 정정 트레이스 승인 (Δ -0.35) | Phase 3 architecture.md §2 |

---

## 2. 결정별 컨텍스트 + 영향 범위

### 2.1 DRIFT-002 (user_followings 단방향 vs 양방향)

**현재 상태**:
- DDL: `user_followings(follower_id, followee_id)` 복합 PK + 양쪽 FK CASCADE — ManyToMany 형태
- JPA: `User.@OneToMany Set<User> followings` + `@JoinTable` — 단방향 OneToMany 표현
- RealWorld spec: **단방향 follow** (A → B 와 B → A 는 독립 row)

**결정 옵션**:
- A. 단방향 (RealWorld spec 의도) — 현재 JPA 표현 유지
- B. 양방향 ManyToMany — DDL 표현 그대로 사상

**영향 범위**:
- `output/db/schema.json` — relations[].kind 갱신 가능
- `output/db/정합성-검증-보고서.md` — DRIFT-002 resolution 추가
- Phase 4 5.A 도메인 추출 — `Profile.follow()` 메서드 의도 해석

**리스크**: 낮음. 학습용 spec → 단방향이 spec 의도와 일치.

---

### 2.2 DRIFT-003 (Article uniqueConstraints JPA 측 추가)

**현재 상태**:
- DDL: `CONSTRAINT unique_author_slug UNIQUE (author_id, slug)` 명시
- JPA: `Article.@Table(uniqueConstraints=...)` 부재
- ddl-auto=none 이므로 운영 동작 영향 없음

**결정 옵션**:
- A. JPA 측 추가 권장 (PR 발의) — RealWorld 코드베이스에 PR 보냄
- B. 권장만 (PoC 보고서에 기록, RealWorld 코드 변경 없음)
- C. 무시 — ddl-auto=none 이므로 운영 영향 0

**영향 범위**:
- `output/db/schema.json` — recommendations[] 추가
- 본 PoC 학습용 spec 분석 — RealWorld 자체 코드 변경 권한 없음

**리스크**: A 는 권한 외 (RealWorld 외부 레포). B 가 적절.

---

### 2.3 DRIFT-007 (articles.author_id FK 정책)

**현재 상태**:
- DDL: `FK (author_id) REFERENCES users(id)` — ON DELETE 절 부재 (기본값 NO ACTION)
- 다른 6 FK: 모두 CASCADE
- RealWorld spec: User 삭제 시나리오 자체 부재 (CRUD only)

**결정 옵션**:
- A. NO ACTION 유지 — RealWorld spec 보존 (User 삭제 거부 default)
- B. CASCADE — articles 도 함께 삭제 (다른 6 FK 와 일관성)
- C. RESTRICT — User 삭제 명시적 거부 (NO ACTION 과 유사하나 deferred 동작 차이)

**영향 범위**:
- `output/db/schema.json` — fk_policy 갱신
- Phase 6 안티패턴 — AP-DB-FK-INCONSISTENT-XXX 후보 영향
- 사내 적용 시 GDPR/회원탈퇴 시나리오 핵심 결정 (본 PoC 한정 medium, 사내 적용 시 high)

**리스크**: 본 PoC 한정 medium. RealWorld spec 의도 보존 = NO ACTION 유지.

---

### 2.4 DRIFT-010 (users.email UNIQUE)

**현재 상태**:
- DDL: `email VARCHAR(255) NOT NULL` — UNIQUE 부재
- JPA: `Email.@Column(name="email", nullable=false)` — unique=false 기본
- RealWorld spec: 보통 email = unique 가정 (회원가입)

**결정 옵션**:
- A. 의도된 누락 (학습용 spec 의 단순화)
- B. spec 누락 — 사내 적용 시 UNIQUE 추가 권장
- C. Phase 4 5.A service 검증 후 결정 (보류)

**영향 범위**:
- `output/db/schema.json` — recommendations[] 추가
- Phase 4 5.A — User 회원가입 service 의 application 레벨 unique 검증 확인 필수
- Phase 6 안티패턴 — AP-DB-MISSING-UNIQUE-XXX 후보

**리스크**: 낮음. C (Phase 4 검증 후 결정) 가 가장 안전.

---

### 2.5 CIRCULAR-001 (User ↔ Article BC 분류)

**현재 상태**:
- 양방향 import: domain/article ↔ domain/user (5+4=9건)
- Tarjan SCC: SCC size 2 → 알고리즘 자동 high
- Spring Modulith verify(): would_fail
- ArchUnit slices().beFreeOfCycles(): would_fail
- RealWorld spec: BC 미정의 (DDD-Lite 적용 안 함)

**ADR-006 default**:
```yaml
bc_status: undefined
bc_assignment_explicit: false
documented_decision: false
severity: medium
decision_required: true
phase_4_routing: true
```

**결정 옵션**:
- A. ADR-006 default 적용 (bc_status=undefined) — Phase 4 5.A BC 정의 후 재산정
- B. same BC 명시 (BC-CONDUIT-CORE 등) — 하나의 큰 BC 로 통합 → severity=low
- C. different BC 명시 (BC-USER / BC-ARTICLE) — 안티패턴 격상 → severity=high

**영향 범위**:
- `output/architecture/architecture.json` — circular_dependencies[CIRCULAR-001] 보강 (v1.1.2 새 필드)
- `output/architecture/circular-dependencies.md` — §1.4 final_severity_decision 갱신
- Phase 4 5.A — 도메인 의도 검증 (User.writeCommentToArticle() 등)
- Phase 6 — 안티패턴 격상 분기 (시나리오별)

**리스크**: ADR-006 자체가 Provisional (PoC #02 후 재검토). default 적용이 안전. B/C 로 미리 결정하면 Phase 4 검증 결과와 충돌 가능 → 재작업 위험.

---

### 2.6 ARCH-STYLE (Phase 1 → Phase 3 정정 트레이스 승인)

**현재 상태**:
- Phase 1 candidate: Hexagonal 0.65 / POJO 0.85 / Layered 0.55
- Phase 3 확정: Hexagonal 0.30 ❌ / POJO 0.50 ⚠️ / **Layered + Spring-DDD-Lite 0.85** ⭐
- Δ -0.35 (Hexagonal, POJO 모두) — 큰 정정

**근거** (architecture.md §2.1 5 차원 결정적 검증):
1. domain framework annotation: @Service/@Transactional/@Entity/PasswordEncoder 직접 import
2. application → infrastructure 직접 의존 (ArticleRestController → UserJWTPayload)
3. port/adapter 분리 1건만 (UserFindService)
4. domain ↔ infrastructure 정상 port 1건만 (HmacSHA256JWTService)
5. Anemic vs Rich Domain 통과 (User.writeCommentToArticle())

**외부 증거**:
- 카카오페이 home Hexagonal 제거 회고 (case §1) — Hexagonal 적용 3 전제 1/3 충족
- 우형 Multi Module Hexagonal (case §3) — Domain Hexagon = POJO 강제 (RealWorld 미달)

**결정 옵션**:
- A. 정정 트레이스 승인 — architecture.json 의 secondary_styles 그대로 채택, Phase 1 inventory 원본 보존
- B. 부분 승인 — Hexagonal 정정만 승인, POJO 는 Phase 4 검증 후 재산정
- C. 거부 — Phase 1 candidate 그대로 유지, Phase 3 정정 무효화

**영향 범위**:
- `output/architecture/architecture.json` — primary/secondary architecture style 확정
- `output/architecture/architecture.md` §2 정정 트레이스 final
- Phase 6 안티패턴 — AP-DOMAIN-FRAMEWORK-LEAK-001 (LV-002) 격상 분기
- F-024 (Phase 1↔3 정정 절차) promoted 처리의 살아있는 사례

**리스크**: 정정 근거 5 차원 + 외부 증거 2건 모두 강함. A 승인 = 품질 보장. B/C 는 외부 증거 무효화 → 재작업 위험.

---

## 3. 결정 패키지 영향 매트릭스

| 결정 | architecture.json | schema.json | 정합성-검증-보고서 | circular-deps.md | architecture.md | findings | 후속 phase 영향 |
|---|---|---|---|---|---|---|---|
| DRIFT-002 | - | ✅ | ✅ | - | - | - | Phase 4 5.A |
| DRIFT-003 | - | ✅ | ✅ | - | - | - | (없음) |
| DRIFT-007 | - | ✅ | ✅ | - | - | - | Phase 6 안티패턴 |
| DRIFT-010 | - | ✅ | ✅ | - | - | - | Phase 4 5.A + Phase 6 |
| CIRCULAR-001 | ✅ | - | - | ✅ | ✅ | - | Phase 4 5.A + Phase 6 (조건부) |
| ARCH-STYLE | ✅ | - | - | - | ✅ | F-024 promoted 사례 | Phase 6 안티패턴 (LV-002) |

→ **6건 모두 Phase 4 진입 전 결정 가능** (Phase 4 입력으로 사용).

---

## 4. 4원칙 적용 (본 plan 의 위상)

- **1원칙 (본 문서)**: 6 결정의 전수 조사 + 영향 범위 + 리스크 — ✅ 완료
- **2원칙**: research-decisions-6.md (3 관점 — document/case/senior) — 다음 단계
- **3원칙**: 윤주스 승인 후 architecture.json / schema.json / 정합성-검증-보고서.md 갱신
- **4원칙**: Phase 4 진입 후 결정과 충돌 발견 시 revert + 본 plan 의 Lessons Learned 반영

---

## 5. 통합 권장 (research 결과 미리 인덱스)

품질 + 재작업 최소화 기준 적용 시 권장:

| ID | 권장 | 한 줄 사유 |
|---|---|---|
| DRIFT-002 | **A. 단방향** | RealWorld spec 의도 (Phase 4 Profile.follow() 검증으로 보강) |
| DRIFT-003 | **B. 권장만 기록** | RealWorld 외부 레포 — PR 발의 권한 외 |
| DRIFT-007 | **A. NO ACTION 유지** | RealWorld spec 보존, 사내 적용 시 high 격상 별도 |
| DRIFT-010 | **C. Phase 4 5.A 검증 후** | service 의 application 레벨 unique 확인이 결정 핵심 |
| CIRCULAR-001 | **A. ADR-006 default** | bc_status=undefined → Phase 4 5.A 에서 BC 정의 후 재산정 |
| ARCH-STYLE | **A. 승인** | 정정 근거 5 차원 + 외부 증거 2건 강함 |

→ 사용자 승인 시 일괄 적용. 거부 시 개별 재논의.

---

## 6. 리스크 / 함정

1. **DRIFT-010 의 Phase 4 의존**: C 채택 시 Phase 4 service 검증이 필수. 회원가입 service 코드를 Phase 4 5.A 입력에 명시.
2. **CIRCULAR-001 ADR-006 Provisional**: PoC #02 후 재검토 — 사내 적용 시 default 가 다를 수 있음.
3. **ARCH-STYLE 승인의 후속**: Phase 6 에서 LV-001 (layer violation) + LV-002 (framework leak) 안티패턴 등록이 Phase 4/5 의 Phase 6 입력으로 강제됨.
4. **DRIFT-007 사내 격상**: 본 PoC 한정 medium 이지만 사내 적용 시 high (GDPR/회원탈퇴) — finding 메모로 보존.

---

## 7. 다음 단계

→ research-decisions-6.md 작성 (3 관점) → 윤주스 승인 → 일괄 적용 → Phase 4 진입.
