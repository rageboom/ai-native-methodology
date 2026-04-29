# Plan: PoC #01 — Phase 4 (비즈니스 로직 추출, 4영역 병렬)

> 작성일: 2026-04-28
> 작성자: Claude (윤주스 검토 대기)
> 적용 원칙: Work Principles 4원칙 (1단계)
> 상위 plan: methodology-v1.1/.claude/plans/plan-poc-realworld.md
> Phase 명세: ai-native-methodology/methodology-spec/workflow/phase-4-비즈니스로직.md
> 산출물 명세:
>   - ai-native-methodology/methodology-spec/deliverables/02-도메인-모델.md
>   - ai-native-methodology/methodology-spec/deliverables/05-비즈니스-규칙.md
>   - ai-native-methodology/methodology-spec/deliverables/06-안티패턴.md (Phase 6 본진, Phase 4 부분)
> Schema:
>   - ai-native-methodology/schemas/domain.schema.json
>   - ai-native-methodology/schemas/rules.schema.json
>   - ai-native-methodology/schemas/antipatterns.schema.json
> 인계: Phase 1/2/3 _manifest.yml + 사용자 결정 6건 (RESUME.md §3)

---

## §1. 목적

PoC #01 Phase 4 — **4개 영역 병렬 추출**로 도메인 모델(#2) + 비즈니스 규칙(#5) + 안티패턴 부분(#6) 생성.

이 단계가 답하는 질문:
- BC 확정: BC-ARTICLE / BC-USER / BC-AUTH 의 범위는? (CIRCULAR-001 해소 포함)
- Aggregate 경계는? (User / Article / Comment / Tag)
- 도메인 행동(behaviors) + Invariants 는?
- Given/When/Then 비즈니스 규칙은 어디에서 추출되는가?
- 사용자 결정 6건 (DRIFT-002/003/010 + CIRCULAR-001 + ARCH-STYLE 후속) 의 도메인 의도 검증 결과는?

**진짜 목적 (PoC 한정)**:
- v1.1.2 갱신 명세 (F-007/F-009/F-016/F-023 + ADR-006) **실제 적용**
- 4영역 명세의 빈약 케이스 (5.B FE 부재, 5.D 외부 0건) 발현 확인
- DDD-Lite B (ADR-004) 추출 범위 검증

---

## §2. Phase 1/2/3 인계 + 메인 사전 검증 결과

### 2.1 Phase 1/2/3 인계 핵심

| 항목 | 출처 | 값 |
|---|---|---|
| 모듈 ↔ BC 매핑 | architecture.md §6 | BC-ARTICLE (5 modules) / BC-USER (2 modules) / BC-AUTH (3 modules, cross-cutting) |
| 7 테이블 | db/schema.json | articles, articles_tags, article_favorites, comments, tags, users, user_followings |
| @Embeddable 7개 | db/_manifest.yml `embeddable_routing` | 3-level nesting (User → Profile → Image/UserName, Article → ArticleContents → ArticleTitle) |
| Aggregate 후보 | architecture.md §6 | User (Embeddable 4 + follow), Article (Embeddable 2 + tags + comments), Comment (?), Tag (?) |
| Layered + Spring-flavored DDD-Lite | architecture.md §2 | confidence 0.85 (정정 트레이스 approved) |
| LV-001 / LV-002 | architecture.md §4.2 | Phase 6 안티패턴 강제 등록 (RESUME.md §3) |
| CIRCULAR-001 | circular-dependencies.md §1.4 | ADR-006 default — `bc_status=undefined` + decision_required=true + Phase 4 라우팅 |
| 외부 의존성 | architecture.md §5 | 0건 (5.D 빈약 케이스 — F-026 deferred finding) |
| FE 영역 | source-info.md | 부재 (BE only) — 5.B N/A |

### 2.2 사용자 결정 6건 후속 검증 (RESUME.md §3 Phase 4 입력)

| ID | Phase 4 검증 항목 | 영역 | 산출 매핑 |
|---|---|---|---|
| **DRIFT-002** | `Profile.follow()` 메서드 의도 보강 검증 (단방향 follow) | 5.A | UC-USER-FOLLOW + BR-USER-FOLLOW-001 + E-USER-User.follow() behavior |
| **DRIFT-003** | (코드 변경 없음 — 권장만) | — | recommendations[REC-001] 그대로 유지 |
| **DRIFT-007** | (NO ACTION 유지) | 5.A | Phase 6 AP-DB-CASCADE-MISSING 후보 |
| **DRIFT-010** | User 회원가입 service 의 application 레벨 email unique 검증 | 5.A | BR-USER-EMAIL-UNIQUE-001 + UC-USER-REGISTER + E-USER-User invariant |
| **CIRCULAR-001** | User ↔ Article BC 정의 + 도메인 행동 검증 (`User.writeCommentToArticle()` 등) + Aggregate 경계 결정 | 5.A | bounded_contexts[] + aggregates[] + circular_dependencies bc_status 갱신 (architecture.json) |
| **ARCH-STYLE** | (Phase 6 안티패턴 LV-001/LV-002 강제 등록) | — | antipatterns-partial.json (Phase 4) → antipatterns.json (Phase 6) |

### 2.3 메인 사전 fetch 검증 (F-015 적용 — 진행 예정)

Phase 4 진입 전 메인 raw fetch 대상 (sub-agent cross-check 기준):

| # | 파일 | 추출 목적 | 사전 추정 |
|---|---|---|---|
| 1 | `domain/article/Article.java` | Aggregate Root 행동 + Invariants | tags 컬렉션, comments cascade, @JoinColumn author |
| 2 | `domain/article/ArticleContents.java` | Embeddable + tags 컬렉션 (F-017) | title VO, body, ManyToMany Tag |
| 3 | `domain/article/Comment.java` | Comment Aggregate? Or part of Article? | ManyToOne Article + Author |
| 4 | `domain/article/Tag.java` | Tag Aggregate? | name PK |
| 5 | `domain/user/User.java` | User Aggregate Root + writeCommentToArticle/follow | Profile + Email + Password embedded |
| 6 | `domain/user/Profile.java` | Profile Embeddable + follow 의도 | UserName + Image + 단방향 follow (DRIFT-002) |
| 7 | `domain/user/Email.java` / `Password.java` | VO | unique 검증 위치 (DRIFT-010) |
| 8 | `application/article/ArticleService.java` (or ArticleRestController) | UC + Service 메서드 → BR | createArticle / cancel / favorite 등 |
| 9 | `application/user/UserService.java` (or RestController) | 회원가입 + email unique 검증 (DRIFT-010) | register/login |
| 10 | `application/security/*` | 인증 흐름 + 권한 분기 | JWT validation |
| 11 | `domain/jwt/*` + `infrastructure/jwt/HmacSHA256JWTService.java` | 5.D 외부 의존성 (HMAC) — 자체 구현 | external_dependencies=0 검증 |
| 12 | `application.properties` | 5.C 매직 넘버 + 환경 정책 | jwt secret, ddl-auto=none, h2 url |
| 13 | `build.gradle` + dependency tree | 5.D 외부 의존성 0건 재확인 | RestTemplate/WebClient/Feign 부재 |
| 14 | `src/test/**/*.java` (선택) | invariant 추출 보강 | 테스트 코드의 Given/When/Then 직접 추출 |

→ **메인이 raw fetch 후 sub-agent 도 동일 파일 직접 fetch 권장** (F-015 학습 코퍼스 의존 회피).

### 2.4 4 영역 적용 가능성 사전 평가

| 영역 | 본 PoC 적용 | 사유 | 신뢰도 추정 |
|---|---|---|---|
| **5.A DB** | ✅ 핵심 | ORM 본격 사용 + Embeddable 7개 + Service 다수 | 0.80~0.90 (ORM 강함) |
| **5.B FE** | ❌ N/A | BE only (FE 부재 — source-info.md) | (스킵) |
| **5.C 설정** | ⚠️ 빈약 | application.properties 8 lines + jwt config 2개. 매직 넘버 ~3개 추정 | 0.75 (설정 파일 직접 추출) |
| **5.D 외부** | ❌ 0건 | architecture.md §5 외부 의존성 0건. 자체 JWT 구현 (HMAC) | F-026 deferred finding 발현 |

→ **본 PoC 의 핵심은 5.A**. 5.C 빈약, 5.B/5.D 부재. 명세 §6 의 평균 ~70% 가 본 PoC 에 적용되는지 검증.

---

## §3. 추출 전략 (영역별)

### 3.1 영역 5.A — DB 영역 (핵심)

**추출 대상 (PoC 한정)**:
- ORM 엔티티 메서드 (`User.writeCommentToArticle()`, `User.follow()`, `Article.update()`, `Comment.delete()` 등)
- @OneToMany cascade=ALL/orphanRemoval=true → Aggregate 경계 결정 (domain.schema.json §3.1)
- @Embeddable 7개 → VO (3-level nesting 보존)
- @ManyToMany 3건 → Aggregate 간 참조 결정 (Vaughn Vernon Effective Aggregate Design Part II 적용)
- Service 메서드 가드 (`if (...) throw ...`) → Invariants + BR 후보
- DB CHECK / UNIQUE / FK : Phase 2 인계 (UNIQUE (author_id, slug) DRIFT-003 등)

**도구 (PoC 한정)**:
- 메인 raw fetch (F-015) + Tree-sitter 대체 (Java 파서 미설치 — 텍스트 grep)
- Read tool 로 직접 import / @ 어노테이션 / method body grep
- sub-agent 가 같은 파일 fetch + 메인 cross-check

**산출 매핑**:

| 추출 결과 | → 산출물 | schema 필드 |
|---|---|---|
| ORM 엔티티 + Embeddable | domain.json | bounded_contexts[].entities + value_objects |
| Aggregate 경계 (cascade=ALL/orphanRemoval) | domain.json | bounded_contexts[].aggregates |
| Service 메서드 → Use Case | domain.json | bounded_contexts[].use_cases |
| 메서드 가드 / @Column nullable=false | rules.json | rules[].extracted_from_area=5.A_db_logic + given/when/then |
| Repository 클래스 | domain.json | bounded_contexts[].repositories |
| Anemic Domain (만약 발견) | antipatterns-partial.json | category=DOMAIN, AP-DOMAIN-ANEMIC |

### 3.2 영역 5.B — FE 코드 영역 ❌ 스킵

**스킵 사유**: FE 부재 (BE only PoC).

**처리**:
- Phase 4 _manifest.yml 에 `5.B: skipped (FE absent)` 명시
- domain/rules/antipatterns 에 5.B 추출 결과 0건 명시
- Phase 4 명세 §3.2 "FE 없으면 5.B 스킵 OK" 정합

**다른 PoC (#02/#03) 에서 검증 강제**:
- F-026 deferred finding (5.D 0건 케이스) 와 묶어서 다중 PoC 후 v1.2.0 격상 검토

### 3.3 영역 5.C — 설정/환경 정책 (빈약)

**추출 대상**:
- `application.properties` 매직 넘버 (jwt expire seconds 등 추정)
- `lombok.config` (도메인 의미 0)
- 환경별 정책 차이: 부재 (PoC 단일 환경)
- Feature Flag: 부재

**산출 매핑**:
- 매직 넘버 → rules.json (`extracted_from_area=5.C_config_policy`, `human_review_required=true`)
- 환경별 정책 차이 0건: domain-context.md grounding 미보강
- 안티패턴: AP-CONFIG-MAGIC-NUMBER (만약 발견)

**예상 추출 수**: 1~3건 (jwt 만료 시간 등). 신뢰도 0.75.

### 3.4 영역 5.D — 외부 의존성 매핑 ❌ 0건

**추출 대상**: 부재 (Phase 3 사전 검증 완료).
- HTTP 클라이언트 (RestTemplate / WebClient / OkHttp / Feign): 0
- 메시지 큐 (Kafka / RabbitMQ / SQS): 0
- 외부 SDK (AWS / Stripe / Twilio / Mailer): 0
- Webhook: 0
- SSO/OAuth: 자체 JWT 구현 (HMAC, 외부 IdP 부재)

**처리**:
- domain.json + rules.json 에 5.D 결과 0건 명시
- F-026 finding (deferred — PoC #02/#03 후 재평가) 의 발현 사례
- 명세 §3.4 "5.D 신뢰도 0.50" 의 적용 한계 기록 (5.D 0건 케이스는 명세에 없음)

---

## §4. 산출물 구성

### 4.1 파일 구성 (Phase 4 명세 §4.1 준수)

```
output/domain/                        # 도메인 모델 (#2)
├── domain.json                       # AI용 (domain.schema.json)
├── domain.md                         # 사람용 요약
├── domain.mermaid                    # classDiagram (Entity + VO + Aggregate 경계)
├── use-cases.md                      # UC 카탈로그
├── ubiquitous-language.md            # 보편 언어 사전
└── _manifest.yml

output/rules/                         # 비즈니스 규칙 (#5)
├── rules.json                        # AI용 (rules.schema.json)
├── rules.md                          # 사람용 카탈로그
├── state-diagrams/                   # (있을 경우 — Article published 상태 등)
└── _manifest.yml

output/antipatterns-partial/           # 안티패턴 부분 (Phase 4)
├── antipatterns-partial.json         # 5.A 에서 발견된 후보 (Phase 6 통합 대기)
└── _manifest.yml
```

### 4.2 ID 표준 (도메인/규칙)

```
Bounded Context : BC-{ARTICLE|USER|AUTH}
Entity          : E-{BC}-{Name} (예: E-ARTICLE-Article)
Value Object    : VO-{BC}-{Name} (예: VO-USER-Email, VO-USER-Profile)
Repository      : R-{BC}-{RepoName}
Domain Service  : DS-{BC}-{Name}
Use Case        : UC-{BC}-{ACTION} (예: UC-USER-REGISTER)
Business Rule   : BR-{BC}-{NAME}-{NNN} (예: BR-USER-EMAIL-UNIQUE-001)
Antipattern     : AP-{CATEGORY}-{NAME}-{NNN} (예: AP-DOMAIN-ANEMIC-001)
```

### 4.3 핵심 산출물 사전 골격 (예상)

**bounded_contexts (3개 확정)**:
1. **BC-ARTICLE** — Article + Comment + Tag + ArticleContents
   - Aggregates: Article (root) → Comment (member, cascade), Tag (separate aggregate? 또는 reference VO)
2. **BC-USER** — User + Profile + Email + Password
   - Aggregates: User (root) — 4 Embeddable VO (Email/Password/Profile→UserName+Image)
3. **BC-AUTH** — JWT cross-cutting
   - Domain Service: JWTSerializer + HmacSHA256JWTService

**Use Case 후보 (RealWorld API 표준 기반)**:
- UC-USER-REGISTER, UC-USER-LOGIN, UC-USER-UPDATE, UC-USER-FOLLOW, UC-USER-UNFOLLOW
- UC-ARTICLE-CREATE, UC-ARTICLE-UPDATE, UC-ARTICLE-DELETE, UC-ARTICLE-LIST, UC-ARTICLE-FAVORITE, UC-ARTICLE-UNFAVORITE
- UC-COMMENT-CREATE, UC-COMMENT-DELETE, UC-COMMENT-LIST
- UC-TAG-LIST

→ 약 15개 UC 추정. 실측은 메인 fetch 후 보정.

**Business Rule 후보 (5.A + 5.C)**:
- BR-USER-EMAIL-UNIQUE-001 (DRIFT-010 후속)
- BR-USER-USERNAME-UNIQUE-001
- BR-USER-FOLLOW-NO-SELF-001 (단방향, 자기 follow 금지)
- BR-USER-FOLLOW-DIRECTIONAL-001 (DRIFT-002 후속)
- BR-ARTICLE-SLUG-UNIQUE-PER-AUTHOR-001 (DRIFT-003 후속, 권장만)
- BR-ARTICLE-AUTHOR-ONLY-EDIT-001 (작성자만 수정/삭제)
- BR-COMMENT-AUTHOR-ONLY-DELETE-001
- BR-AUTH-JWT-EXPIRE-001 (5.C 매직 넘버)
- BR-AUTH-PASSWORD-ENCODE-001 (BCrypt? 메인 fetch 검증)

→ 약 10~15건 추정. 신뢰도 0.65~0.85.

**Antipattern (Phase 4 부분)**:
- AP-ARCH-LAYER-VIOLATION-001 (LV-001, ARCH-STYLE 후속) — 강제 등록
- AP-DOMAIN-FRAMEWORK-LEAK-001 (LV-002, ARCH-STYLE 후속) — 강제 등록
- AP-DOMAIN-ANEMIC-001 (만약 발견 — Service 에 모든 로직)
- AP-DB-CASCADE-MISSING-001 (DRIFT-007 NO ACTION 후속) — 후보
- AP-ARCH-CIRCULAR-DOMAIN-001 (CIRCULAR-001 — bc_status 결과 따라 조건부)

---

## §5. 변경 대상 파일 (Phase 4 진입 시 갱신)

### 5.1 신규 생성

```
.claude/plans/plan-phase4.md                       (본 파일)
.claude/researches/document-phase4.md              (1원칙 직후, 2원칙)
.claude/researches/case-phase4.md                  (2원칙)
.claude/researches/senior-phase4.md                (2원칙)
.claude/researches/research-phase4.md              (2원칙 통합)
output/domain/{domain.json, domain.md, domain.mermaid, use-cases.md, ubiquitous-language.md, _manifest.yml}
output/rules/{rules.json, rules.md, _manifest.yml}
output/antipatterns-partial/{antipatterns-partial.json, _manifest.yml}
.claude/PROGRESS-poc01-phase4.md                   (시간순 진행 로그)
```

### 5.2 수정 (사용자 결정 6건 후속)

| 파일 | 수정 내용 |
|---|---|
| `output/architecture/architecture.json` | `circular_dependencies[CIRCULAR-001].bc_status` 갱신 (Phase 4 결과로 same/different 결정) |
| `output/architecture/circular-dependencies.md` | §1.4 CIRCULAR-001 도메인 의도 검증 결과 추가 |
| `output/architecture/_manifest.yml` | Phase 4 후속 결정 반영 메모 |
| `output/db/schema.json` | `recommendations[REC-001/REC-002/REC-003]` 의 Phase 4 검증 결과 반영 |
| `output/db/정합성-검증-보고서.md` | DRIFT-002/010 의 도메인 의도 보강 결과 추가 |
| `findings/poc-findings.md` | Phase 4 신규 finding 추가 (5.B/5.D 부재 케이스, F-026 발현) |
| `RESUME.md` | Phase 4 완료 시 §1, §8 갱신 |
| `CLAUDE.md` | "현재 상태" Phase 4 완료 반영 (시간순 갱신) |

---

## §6. 영향도 + 리스크

### 6.1 영향도 (Phase 4 가 후속에 미치는 영향)

| 후속 phase | 영향 | 의존 |
|---|---|---|
| Phase 5-1 (api) | UC ↔ operationId 매핑 | use-cases.md / domain.json `related_api_operation_id` |
| Phase 5-2 (ui) | N/A (UI 부재) | — |
| Phase 6 (quality) | 안티패턴 통합 | antipatterns-partial.json + LV-001/LV-002 강제 등록 |
| 신뢰도 종합 | 7대 산출물 평균 신뢰도 갱신 | domain.json + rules.json + antipatterns-partial.json 의 `meta` 필드 |

### 6.2 리스크 (식별된 함정)

| ID | 리스크 | 대응 |
|---|---|---|
| R-401 | **Anemic Domain Model 무시** (명세 §7.1) | 메인 fetch 시 Service 의 도메인 로직 위치 확인 후 AP-DOMAIN-ANEMIC 등록 검토. RealWorld 는 Phase 3 §2.1 `User.writeCommentToArticle()` 등 Rich Domain 증거 있음 |
| R-402 | **5.B/5.D 부재로 명세 §3.2/§3.4 미적용** (F-026 deferred) | 명세 §6 신뢰도 평균 ~70% 가 본 PoC 에 적용 불가. 본 PoC 평균 신뢰도 5.A 가중 (5.A 비중 ~85%) 로 재산정. 신뢰도 처리 가이드 부재 = 새 finding 후보 |
| R-403 | **CIRCULAR-001 BC 결정의 도메인 의도 추출 어려움** | `User.writeCommentToArticle()` / `Article.author` 등 cross-aggregate 행동 직접 raw fetch + Vaughn Vernon Part II 의 ID-by-reference 관점 + Senior 에이전트 토론 |
| R-404 | **DRIFT-010 (email unique) application 레벨 검증 누락 시 처리** | service 코드에서 `existsByEmail` 조회 또는 try/catch 패턴 직접 raw fetch. 누락 시 BR-USER-EMAIL-UNIQUE-001 신뢰도 ↓ + AP-VALIDATION-MISSING 등록 |
| R-405 | **F-015 cross-validation 미적용 — sub-agent 학습 코퍼스 오류** | Phase 1 D 에이전트 50% 오차 사례. **메인이 13~14개 핵심 파일 사전 raw fetch + sub-agent 도 직접 fetch 강제** |
| R-406 | **@Embeddable 안 collection (F-017 deferred)** — ArticleContents.tags ManyToMany | F-017 deferred (PoC #02/#03 후) 이지만 Phase 4 5.A 추출 시 명시. domain.schema.json `value_objects` 가 collection 미지원 → workaround: VO 안 entity_ref 로 표시 |
| R-407 | **5.C 매직 넘버 의도 과신** (명세 §7.3) | 모든 매직 넘버 BR 에 `human_review_required=true`. rationale 비워둠 |
| R-408 | **Aggregate 과잉** (#2 §10.2) | cascade=ALL + orphanRemoval=true 기준 엄격 적용. Comment 가 Article aggregate 안인지 외부 aggregate 인지 cascade 분석 |
| R-409 | **Use Case ↔ operationId 매핑 누락** | Phase 5-1 입력 누락 위험. 모든 UC 에 `related_api_operation_id` 후보 명시 (Phase 5-1 에서 OpenAPI 추출 시 검증) |
| R-410 | **PROGRESS 로그 누락** (memory `feedback_progress_log.md`) | 모든 단계 전환 시 PROGRESS-poc01-phase4.md 갱신 의무 |

---

## §7. v1.1.2 갱신 명세 인용 (적용 영역)

| 갱신 ID | Phase 4 적용 |
|---|---|
| F-007 (inventory.schema + templates) | 미적용 (Phase 1 영역). Phase 4 의 `_manifest.yml` 만 동일 패턴 준수 |
| F-009 (phase-1-init.md §6 결정성 단일 표) | Phase 4 신뢰도 처리 시 **결정성 vs LLM 추론 단일 표** 패턴 적용. caveat 컬럼 (PoC 한계 — 5.B/5.D 부재) |
| F-016 (phase-2-db.md §3.4 통합 우선순위) | Phase 4 5.A 가 ddl-auto=none 환경에서 schema.sql vs ORM 의 우선순위 인지. domain.schema 의 entity ↔ db table 매핑 시 schema.sql 우선 (DRIFT 처리는 Phase 2 종결) |
| F-023 (phase-3-arch.md §3.1.1 + ADR-006) | **CIRCULAR-001 의 Phase 4 BC 분기 결정 본진**. ADR-006 default (`bc_status=undefined → same/different`) 결과로 architecture.json `bc_status` 갱신. medium severity 유지 또는 격하 |

---

## §8. 작업 시퀀스 (1단계 직후 → 2단계 → 3단계)

### 8.1 1단계 (본 plan 작성, 진행 중)

- [x] §1~§7 작성 완료
- [ ] 윤주스 검토 (1단계 게이트)

### 8.2 2단계 (3 에이전트 병렬 리서치)

3 에이전트 병렬:
1. **공식문서 리서처** (`document-phase4.md`):
   - DDD-Lite (Vaughn Vernon, Eric Evans, ADR-004) Aggregate 경계 결정
   - JPA @OneToMany cascade 의 Aggregate 경계 신호
   - JPA @Embeddable nesting 한계 + JPA spec
   - Spring Boot Service 메서드 → Use Case 매핑 표준
   - 메인 사전 raw fetch (Article.java, User.java, Profile.java 등 14개)

2. **테크기업 사례 리서처** (`case-phase4.md`):
   - 카카오페이 / 카카오뱅크 / 우형 / 라인 의 DDD-Lite 적용 사례
   - Aggregate 경계 결정 회고 (Comment 가 Article 안? 외부?)
   - email unique 검증 위치 (Service vs DB) 패턴
   - JWT 만료 시간 BR 추출 패턴
   - 단방향 follow vs 양방향 friendship 패턴

3. **Senior Engineer (방법론 도메인 적응)** (`senior-phase4.md`):
   - 본 PoC 의 5.B/5.D 부재가 명세 §3 의 4영역 가이드를 어떻게 발현시키는가
   - F-026 deferred finding 이 본 PoC 에서 어떻게 재발현하는가
   - CIRCULAR-001 BC 결정의 도메인 의도 vs 알고리즘 결정 갈등
   - Anemic vs Rich Domain 의 한국 SI 패턴
   - Phase 5/6 에 미칠 영향 (특히 antipatterns 강제 등록)

→ `research-phase4.md` 통합 (메인 직접 작성).

### 8.3 3단계 (사용자 승인)

- 윤주스 (TF Lead) 에게 코드 착수 승인 요청
- 미승인 시 plan/research 보강 → 재요청

### 8.4 4단계 (실패 시 revert)

- domain.json/rules.json 추출 결과가 schema 검증 실패 → revert + Lessons Learned + 1단계 재시작

---

## §9. 승인 게이트 기준 (Phase 4 명세 §5)

```
□ domain.json schema 검증 통과 (domain.schema.json)
□ rules.json schema 검증 통과 (rules.schema.json)
□ antipatterns-partial.json schema 검증 통과 (antipatterns.schema.json)
□ 4개 영역 추출 시도 완료 (5.A 핵심, 5.B 스킵 OK, 5.C 빈약, 5.D 0건)
□ domain.mermaid classDiagram 렌더링
□ Use Case ↔ Entity 매핑 일관성
□ 비즈니스 규칙 Given/When/Then 형식 준수
□ human_review_required 항목 사용자 검토
□ 안티패턴 부분 목록 확인 (LV-001/LV-002 강제 등록 포함)
□ 사용자 결정 6건 Phase 4 후속 검증 완료
□ F-015 cross-validation 100% 적용 (메인 raw fetch + sub-agent cross-check)
□ PROGRESS-poc01-phase4.md 시간순 로그 갱신
```

---

## §10. 신뢰도 사전 추정

| 영역 | 명세 평균 | 본 PoC 추정 | 사유 |
|---|---|---|---|
| 5.A DB | 0.75 | **0.85** | ORM 강함 + Embeddable 7 + Service 다수 |
| 5.B FE | 0.75 | N/A | 부재 (스킵) |
| 5.C 설정 | 0.80 | **0.75** | application.properties 빈약 (8 lines) — 매직 넘버 ~3개 |
| 5.D 외부 | 0.50 | N/A | 0건 (스킵) |

**Phase 4 전체 가중평균 추정**: ~**0.83** (5.A 가 비중 ~85%).

→ 명세 §6 의 ~70% 보다 높음. 5.B/5.D 부재로 인한 LLM 추론 비중 감소가 실측에 반영.

---

## §11. PoC 한계 (선언)

본 PoC 는 RealWorld 학습용 spec 의 BE only 분석으로:
- 5.B FE 영역 검증 불가 (FE 부재)
- 5.D 외부 의존성 검증 불가 (0건, 자체 JWT 구현)
- 5.C 환경별 정책 차이 검증 불가 (단일 환경)

→ **명세 §3.2/§3.3/§3.4 의 충분한 검증은 PoC #02/#03 (다른 스택, 다른 도메인) 에서 정식 검증**.

본 PoC 한계 인정 + F-026 deferred finding 발현 + 다중 PoC 데이터 합산 후 v1.2.0 격상 (memory `feedback_quality_priority.md` 적용).

---

## §12. 다음 단계

1단계 (본 plan) 완료 → 윤주스 검토 → 2단계 (3 에이전트 병렬 리서치) 진입.
