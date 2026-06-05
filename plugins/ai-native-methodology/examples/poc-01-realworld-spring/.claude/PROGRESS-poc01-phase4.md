# PROGRESS — PoC #01 Phase 4 (시간순 로그)

> 본 파일은 Phase 4 작업의 모든 단계 전환 / 블로커 / 결정을 시간순으로 기록.
> 의무: memory `feedback_progress_log.md` 및 RESUME.md §5.0.

---

## 2026-04-28

### T+0 — Phase 4 진입 (사용자 지시 "다음 단계 진입")

- 컨텍스트 확인: RESUME.md + CLAUDE.md + Phase 4 명세 + 산출물 명세 (#2, #5) + schema (domain/rules/antipatterns) 전수 조사 완료
- 차단 요인: 0 (v1.1.2 격상 완료, 사용자 결정 6건 완료, 잔여 finding 처분 완료)
- 확정 시퀀스: RESUME.md §0 의 Phase 4~6 진입

### T+1 — 1원칙 plan-phase4.md 작성 ✅

- 산출: `.claude/plans/plan-phase4.md`
- 핵심:
  - §2.2 사용자 결정 6건 후속 검증 매핑
  - §3 4영역 추출 전략 (5.A 핵심 / 5.B 스킵 / 5.C 빈약 / 5.D 0건)
  - §6.2 R-401~410 리스크 식별 (Anemic / 5.B5.D 부재 / CIRCULAR-001 / DRIFT-010 / F-015 / F-017 / 매직 넘버 / Aggregate 과잉 / UC-API 매핑 / PROGRESS 로그)
  - §10 신뢰도 사전 추정 0.83 (5.A 가중)
  - §11 PoC 한계 선언 (PoC #02/#03 에서 5.B/5.D 정식 검증)
- 다음: 2원칙 (3 에이전트 병렬 리서치) — 윤주스 1단계 검토 후 또는 자동 진입 (Auto Mode)

### T+2 — F-015 메인 사전 raw 검증 완료 ✅

- 처음 41개 파일을 curl 로 /tmp 다운로드 후 직접 Read 검증
- 이후 사용자 결정으로 **git clone** 으로 전환 (영구 자산화 + F-009 신뢰도 정합)
- 위치: `examples/poc-01-realworld-spring/source/realworld-springboot-java/` (1.9MB, depth=1)
- `.gitignore` 추가 — 본 메소드 레포에는 push 안함
- /tmp 정리 완료

### T+3 — 핵심 사실 (Phase 4 5.A 입력)

**Aggregate 경계 (cascade 분석)**:

- **Article aggregate**: Article (root) + ArticleContents (Embedded) + ArticleTitle (nested) + Comment (OneToMany cascade={PERSIST, REMOVE} mappedBy=article) → Comment 는 Article aggregate 멤버
- **User aggregate**: User (root) + Email/Password/Profile (Embedded) + UserName/Image (nested under Profile)
- **Tag aggregate**: Tag standalone @Entity. ArticleContents.tags 는 cascade=PERSIST ManyToMany → 별도 aggregate (ID-by-reference)
- userFavorited (Article ↔ User M:N): cascade=PERSIST → 별도 aggregate 참조
- followingUsers (User self-ref OneToMany): cascade=REMOVE → 같은 User aggregate 안 자기참조

**Rich Domain Model 명백 (Anemic ❌)**:

- User: 13+ behaviors (writeArticle, updateArticle with auth, writeCommentToArticle, favoriteArticle, followUser, deleteArticleComment, viewArticleComments, viewProfile, matchesPassword 등)
- Article: addComment, removeCommentByUser (auth), updateArticle, afterUserFavoritesArticle, updateFavoriteByUser
- → AP-DOMAIN-ANEMIC 미발생 ✅

**CIRCULAR-001 도메인 의도 (실측)**:

- User.writeArticle/writeCommentToArticle/favoriteArticle 등 cross-aggregate behavior 다수 → 도메인 협력 강함
- 알고리즘 상 순환이지만 도메인 의도는 같은 통합 BC (BC-CONTENT 또는 BC-ARTICLE 흡수)
- → ADR-006 default 적용 후 `bc_status=same_bc` 권장 — Phase 4 결정 본진

**DRIFT-002 (단방향 follow)**: ✅ 단방향 명백

- User.followingUsers OneToMany cascade=REMOVE join_table user_followings
- User.followUser(followee) — 단순 add. 역방향 갱신 없음
- Profile.following @Transient — viewer 관점 계산

**DRIFT-010 (email unique application 검증)**: ❌ **검증 부재 발견**

- UserService.signUp() 직접 save. existsByEmail / try-catch 없음
- Email VO @Column unique 없음 (nullable=false 만)
- → AP-VALIDATION-MISSING-001 (spec 요구사항 미충족)
- 동일하게 username unique 도 부재 (확장 finding)

**Comment.removeCommentByUser 의심 로직 (잠재 버그)**:

- `if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor())) throw IllegalAccessError`
- `!A || !B` = `NOT (A AND B)` → 즉 user 가 article 작성자 AND comment 작성자 모두여야 삭제 가능
- RealWorld spec: "comment author can delete" — **불일치**. AP-DOMAIN-LOGIC-BUG 후보

**5.C 매직 넘버** (3건):

- JWT_DURATION_SECONDS = 2*60*60 (2시간) — JWTConfiguration:13
- SECRET = "SOME_SIGNATURE_SECRET" 하드코딩 — JWTConfiguration:12
- allowedOrigins = http://localhost:3000/3001 — application.properties:7
- → BR-AUTH-JWT-EXPIRE-001 + AP-SECURITY-HARDCODED-SECRET-001

**5.D 외부 의존성**: 0건 ✅

- build.gradle: spring-boot-starter-{web,security,validation,data-jpa} + h2 (runtime). 외부 SDK / Mailer / Kafka / Stripe / OAuth IdP 부재
- → F-026 deferred finding 발현 사례

**보안/인증 BR**:

- BCryptPasswordEncoder — SecurityConfiguration:59 → BR-AUTH-PASSWORD-BCRYPT-001
- STATELESS API: csrf disable + formLogin disable + JWT filter only → BR-AUTH-STATELESS-001
- Public: GET /profiles/\* /articles/** /tags/**, POST /users /users/login → BR-AUTH-PUBLIC-ENDPOINTS-001

**Auditing**: @CreatedDate + @LastModifiedDate on Article + Comment → BR-DOMAIN-AUDITING-001

**EAGER 과다** (Phase 6 후보):

- Article.author EAGER, Article.userFavorited EAGER, Comment.article EAGER, Comment.author EAGER → AP-PERFORMANCE-EAGER-N1-001

### T+4 — 3 에이전트 병렬 리서치 spawn

- document-phase4 (a0e58484…) / case-phase4 (a165c58f…) / senior-phase4 (a505ae27…) 백그라운드 병렬

### T+5 — 3 에이전트 완료 (순서: document → senior → case)

**document-phase4.md (409 lines)** ✅

- F-015 cross-check 8/8 일치
- 추가 발견: schema.sql users.email/users.name UNIQUE 부재 (이중 부재 격상 정당)
- 6 토픽 + 7 통합 권고 (A1 cascade 매트릭스 / A2 DRIFT-010 격상 / A3 De Morgan 버그 BR+AP / A4 strategic implicit / A5 JWT SECRET / A6 UC 1:1 + CQRS / A7 F-017 발현)

**senior-phase4.md (242 lines)** ✅

- 5 영역 + 11 결정 매트릭스
- CIRCULAR-001 → same_bc 단일 BC-CONTENT, severity low 격하
- DRIFT-010 → BR + AP 이중 등록 (high)
- Comment 버그 → AP critical + BR + F-027 신규
- LV-001/LV-002 medium 강제 등록 + port/adapter 코드 스니펫 권고
- 신규 finding 3건: F-027 (잠재 버그 가이드 부재) / F-028 (equals mutability deferred) / F-029 (N영역 부재 신뢰도 가이드)

**case-phase4.md (456 lines)** ✅

- 7 토픽 + 9 결정 매트릭스 + 33 URL
- 한국 1차 자료 : 카카오페이 여신코어 DDD / 우형 WMS 분리
- 글로벌 : Vernon Aggregate Design / Twitter asymmetric / OWASP / GitHub leak 통계
- 메인 사전 검증 8건 정합성: 강하게 지지 5 / 지지 2 / 재검증 필요 1 (Comment 권한 — 메인 raw fetch 로 확정 처리)
- (검증 필요) 표기 4건: 토스/라인 follow / KISA 인시던트 / BCrypt 채택률 / 멜론·당근 follow

### T+6 — 메인 통합 research-phase4.md 작성 ✅

- 11 결정 매트릭스 (3-agent 합의)
- BR 13개 + UC 25개 (Command 11 / Query 14)
- Antipattern partial 골격 (6 + 추가 후보 3)
- 신규 Finding 7건 (F-027 ~ F-033)
- 통합 권고 7건 (A1~A7)
- 한계/코퍼스 의존 표기 (F-015 패턴)

### T+7 — 3원칙 진입 (윤주스 승인 대기)

### T+8 — 윤주스 3원칙 승인 ✅ (2026-04-28)

- 11 결정 매트릭스 + 신규 Finding 7건 + 통합 권고 7건 일괄 승인
- output/{domain, rules, antipatterns-partial} 코드 착수 + architecture.json/schema.json 갱신 + findings F-027~F-033 등록 시작

### T+9 — output/domain/ 6종 작성 ✅

- domain.json (BC-CONTENT 단일 + BC-AUTH cross-cutting / Aggregate 3 / VO 7 / UC 25)
  - meta.confidence 0.83 / methodology_version v1.1.2
  - 사용자 결정 6건 inheritance 명시 (DRIFT-002/003/007/010 + CIRCULAR-001 + ARCH-STYLE)
- domain.md (사람용 보고서 — Aggregate 다이어그램 + 4영역 적용 + CIRCULAR-001 same_bc 결정 영향 + DRIFT 결정 후속)
- domain.mermaid (classDiagram — User/Article/Comment/Tag + 7 VO @Embedded composition + cross-aggregate refs + BC-AUTH cross-cutting)
- use-cases.md (UC 25 카탈로그: Command 11 / Query 14 + Service ↔ UC 매핑 통계 + F-027 De Morgan 버그 명시)
- ubiquitous-language.md (22 terms — 핵심 도메인 / 관계 / 인증 / 패턴 메타 + 누락 어휘 strategic implicit F-031)
- \_manifest.yml (Phase 4 매니페스트 + Phase 5/6 인계)

### T+10 — output/rules/ 3종 작성 ✅

- rules.json (BR 13건: validation 2 / policy 6 / authorization 5)
  - 5.A 11건 + 5.C 2건 / 5.B 0 / 5.D 0 (F-026/F-029 발현)
  - human_review_required 6건
  - rule_conflicts[] 1건 — BR-COMMENT-DELETE-001 (rule vs actual_behavior, F-027)
- rules.md (research 풀네임 → schema-compliant 짧은 ID 매핑표 + DRIFT-010 격상 권고 + F-027 격리 원칙)
- \_manifest.yml (BR ↔ AP 이중 등록 정합 + Phase 5/6 인계)

### T+11 — output/antipatterns-partial/ 2종 작성 ✅

- antipatterns-partial.json (6 AP 골격: critical 2 / high 1 / medium 3)
  - AP-DOMAIN-001 / AP-SECURITY-001 / AP-DOMAIN-002 / AP-ARCH-001 / AP-ARCH-002 / AP-DB-001
  - phase_4_partial=true / next_phase_action=Phase 6 merge
  - id_mapping (research 풀네임 → schema 짧은 ID)
- \_manifest.yml (Phase 6 추가 후보 3 메모: AP-PERFORMANCE-001 / F-017 / F-028)

### T+12 — output/architecture/ 갱신 (CIRCULAR-001 same_bc) ✅

- architecture.json: bc_status undefined → same_bc / severity medium → low / decision_required false / phase_4_resolution trace
- circular-dependencies.md: 헤더 + 요약 + §1.4 Phase 4 결정 + §4 Phase 6 격상 안 함
- architecture.md: §4.3 RESOLVED + §6 BC-CONTENT 단일화 매핑 + §9.3 Phase 6 partial 6건

### T+13 — output/db/ DRIFT-010 격상 ✅

- schema.json: drift_count {high 0 → 1} + REC-004 신규 + phase_4_resolution trace
- 정합성-검증-보고서.md: severity yaml + phase_4_resolution + 변경 이력 표

### T+14 — findings/poc-findings.md F-027~F-033 등록 ✅

- 누적 18 → **25건** (closed 9 / promoted 7 / deferred 9)
- v1.2.0 묶음 4 → 6 (E. quality-extraction + F. 신뢰도 공식 보강 신규)

### T+15 — Phase 4 코드 착수 완료 ⭐

- 신규 11 파일: output/domain/(6) + rules/(3) + antipatterns-partial/(2)
- 갱신 5 파일: architecture.json + circular-dependencies.md + architecture.md + db/schema.json + db/정합성-검증-보고서.md
- findings +7 (F-027~F-033)

### T+16 — RESUME.md / CLAUDE.md 갱신 (현재 단계)

- 다음: 윤주스 Phase 5 진입 승인 대기 (UC 25 → OpenAPI 매핑)
