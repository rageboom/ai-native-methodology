# Research — PoC #01 Phase 4 (3 에이전트 통합)

> 작성일: 2026-04-28
> 작성자: 메인 (Claude) — 3 sub-agent 결과 cross-check + 통합
> 기반: document-phase4.md (공식문서) + case-phase4.md (테크기업) + senior-phase4.md (시니어)
> 적용 원칙: Work Principles 2원칙 (3 에이전트 병렬 리서치) — F-015 cross-validation 강제
> 목적: 윤주스 (TF Lead) 3원칙 승인 입력 — 11개 결정 매트릭스 + 6개 통합 권고

---

## §0. F-015 cross-check 결과 (메인 사전 검증 8건)

메인 사전 검증 (PROGRESS-poc01-phase4.md T+3, raw fetch 41 파일) 을 3 sub-agent 가 직접 raw fetch 로 cross-check.

| # | 메인 검증 | document | case | senior | 최종 정합성 |
|---|---|---|---|---|---|
| 1 | Article+Comment cascade={PERSIST,REMOVE} | ✅ | ✅ | ✅ | **확정** |
| 2 | Rich Domain (Anemic ❌, User 13+ behaviors) | ✅ User 17 behaviors (메인 추정 강화) | ✅ | ✅ | **확정** |
| 3 | CIRCULAR-001 same_bc | ✅ 5 cross-aggregate 행동 | 부분 지지 (카카오페이 different BC) | ✅ same_bc 단일 BC-CONTENT 권장 | **확정 same_bc** |
| 4 | DRIFT-002 단방향 follow | ✅ Profile.following @Transient | ✅ Twitter asymmetric + RealWorld spec | ✅ | **확정** |
| 5 | DRIFT-010 application 검증 부재 | ✅ + **schema.sql UNIQUE 부재 신규 발견** | ✅ 한국 분산락 패턴 + 3중 방어 | ✅ DB+App 이중 부재 critical | **격상** (이중 부재 확정) |
| 6 | Comment.removeCommentByUser De Morgan 버그 | ✅ De Morgan 변환 확정 | 재검증 필요 (공식 카탈로그 부재) | ✅ 다른 RealWorld 구현체 5+ OR 사용 | **확정 critical** |
| 7 | JWT 매직 + SECRET 하드코딩 | ✅ OWASP + RFC 8725 위반 | ✅ 한국 권장 15min~1h | ✅ critical | **확정** |
| 8 | 외부 의존성 0건 | ✅ build.gradle 검증 | ✅ RealWorld spec 정상 | ✅ F-026 발현 | **확정** |

→ **메인 사전 검증 8/8 정확** + sub-agent 이 추가로 **schema.sql UNIQUE 부재** (이중 부재) 발견.

---

## §1. 11 개 결정 매트릭스 (최종 권고)

3 에이전트 권고 통합. severity / 신뢰도는 가장 보수적 값 채택 (시니어 우선).

| # | 카테고리 | ID | 산출물 | 권장 처분 | severity / confidence | 3-agent 합의 |
|---|---|---|---|---|---|---|
| 1 | CIRCULAR-001 BC | architecture.json `bc_status=same_bc` | architecture.json (수정) | **same_bc 단일 BC-CONTENT** | medium → **low** 격하 | ✅ document/senior 일치, case 부분 지지 |
| 2 | DRIFT-002 후속 BR | BR-USER-FOLLOW-DIRECTIONAL-001 | rules.json | **등록** (단방향 follow) | confidence 0.85 | ✅ 3-agent 일치 |
| 3 | DRIFT-003 후속 | REC-001 (recommendation) | db/schema.json (이미 반영) | **유지** (변경 없음) | — | ✅ 결정 완료 |
| 4 | DRIFT-007 후속 | AP-DB-CASCADE-MISSING-001 | antipatterns-partial.json | **등록** (NO ACTION) | severity **medium** | ✅ Phase 2 인계 + Phase 6 통합 |
| 5 | DRIFT-010 BR | BR-USER-EMAIL-UNIQUE-001 | rules.json | **등록** (의도 명확, 구현 부재) | confidence 0.70 / human_review=true | ✅ 3-agent 일치 |
| 6 | DRIFT-010 AP (격상) | AP-VALIDATION-MISSING-EMAIL-UNIQUE-001 | antipatterns-partial.json | **등록** (App+DB 이중 부재) | severity **high** | ✅ document 강화 (schema.sql UNIQUE 부재 신규) |
| 7 | Comment 권한 버그 AP | AP-DOMAIN-LOGIC-BUG-001 (또는 AP-LOGIC-DEMORGAN-BUG-001) | antipatterns-partial.json | **등록** (De Morgan 버그) | severity **critical** | ✅ document/senior 일치, case 재검증 필요 → 메인 raw fetch 로 확정 |
| 8 | Comment 권한 버그 BR | BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 | rules.json | **등록** (RealWorld spec 정합) | confidence 0.85 / human_review=true | ✅ senior 권고 |
| 9 | LV-001 강제 등록 | AP-ARCH-LAYER-VIOLATION-001 | antipatterns-partial.json | **등록** (ARCH-STYLE 후속) | severity **medium** | ✅ senior 권고 |
| 10 | LV-002 강제 등록 | AP-DOMAIN-FRAMEWORK-LEAK-001 | antipatterns-partial.json | **등록** (ARCH-STYLE 후속) | severity **medium** | ✅ senior 권고 |
| 11 | JWT SECRET 하드코딩 AP | AP-CONFIG-HARDCODED-SECRET-001 (또는 AP-SECURITY-HARDCODED-SECRET-001) | antipatterns-partial.json | **강제 등록** | severity **critical** | ✅ document OWASP+RFC8725 / senior critical / case GitHub leak 통계 |

---

## §2. 추가 BR/UC 추정 (Service raw fetch 보정)

document §4 (토픽 4) 의 "메서드 1개 = UC 1개" 표준 + raw fetch 결과:

| Service | public methods | UC 추정 |
|---|---|---|
| ArticleService | 11 (createNewArticle, getArticles, getFeedByUserId, getArticleFavoritedByUsername, getArticlesByAuthorName, getArticlesByTag, getArticleBySlug, updateArticle, favoriteArticle, unfavoriteArticle, deleteArticleBySlug) | 11 |
| UserService | 4 (signUp, login, findById, findByUsername, updateUser) | 5 |
| ProfileService | 3 (viewProfile×2, followAndViewProfile, unfollowAndViewProfile) | 4 |
| CommentService | 4 (createComment, getComments×2, deleteCommentById) | 4 |
| TagService | 1 (findAll) (+ reloadAllTagsIfAlreadyPresent internal) | 1 |

**총 UC ≈ 25개** (메인 사전 추정 15 → 보정 25). CQRS kind 분류:
- Command (write): 11개 (signUp, login, updateUser, createNewArticle, updateArticle, favoriteArticle, unfavoriteArticle, deleteArticleBySlug, follow/unfollow, createComment, deleteCommentById)
- Query (read): 14개 (findById, findByUsername, getArticles 5종, getArticleBySlug, viewProfile×2, getComments×2, findAll)

→ Phase 4 산출물 use-cases.md 골격 ~25 UC.

---

## §3. 추가 BR (5.A + 5.C)

senior + document 종합:

| BR ID | 영역 | 신뢰도 | human_review |
|---|---|---|---|
| BR-USER-EMAIL-UNIQUE-001 | 5.A | 0.70 | true (구현 부재) |
| BR-USER-USERNAME-UNIQUE-001 | 5.A | 0.70 | true (구현 부재) |
| BR-USER-FOLLOW-DIRECTIONAL-001 | 5.A | 0.85 | false |
| BR-USER-FOLLOW-NO-SELF-001 | 5.A | 0.50 | true (코드에 명시 부재 — RealWorld spec 묵시) |
| BR-AUTH-PASSWORD-BCRYPT-001 | 5.A | 0.95 | false (SecurityConfiguration:59 명시) |
| BR-AUTH-STATELESS-001 | 5.A | 0.90 | false (SecurityConfiguration csrf disable) |
| BR-AUTH-PUBLIC-ENDPOINTS-001 | 5.A | 0.95 | false (SecurityConfiguration:46-48) |
| BR-ARTICLE-AUTHOR-ONLY-EDIT-001 | 5.A | 0.95 | false (User.updateArticle:62-67) |
| BR-ARTICLE-AUTHOR-ONLY-DELETE-001 | 5.A | 0.85 | false (ArticleService.deleteArticleByAuthor) |
| BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 | 5.A | 0.85 | true (코드 구현 ≠ RealWorld spec) |
| BR-DOMAIN-AUDITING-001 | 5.A | 0.95 | false (Article+Comment @CreatedDate/@LastModifiedDate) |
| BR-AUTH-JWT-EXPIRE-001 | 5.C | 0.80 | true (2시간 매직 넘버) |
| BR-AUTH-JWT-SECRET-LENGTH-001 | 5.C | 0.70 | true (21byte < 256bit 미달) |

→ **총 BR ~13개** (5.A 11개 + 5.C 2개).

---

## §4. Antipattern Partial (Phase 4 출력 골격)

3-agent 합의 + senior 권고 골격 (senior-phase4.md §5.3):

```json
{
  "meta": {
    "phase": 4,
    "next_phase_action": "Phase 6 antipatterns.json merge — partial IDs MUST all appear in final",
    "confidence_avg": 0.82,
    "limitations": [
      "5.B FE absent (BE only)",
      "5.D zero external dependencies (self-contained JWT)",
      "5.C sparse (8 lines application.properties)"
    ]
  },
  "antipatterns": [
    {
      "id": "AP-DOMAIN-LOGIC-BUG-001",
      "category": "DOMAIN",
      "severity": "critical",
      "name": "Comment 삭제 권한 De Morgan 로직 버그",
      "evidence": [{"file": "domain/article/Article.java", "line": 86}],
      "phase4_extracted": true
    },
    {
      "id": "AP-CONFIG-HARDCODED-SECRET-001",
      "category": "SECURITY",
      "severity": "critical",
      "name": "JWT secret 하드코딩 + 길이 부족",
      "evidence": [{"file": "infrastructure/jwt/JWTConfiguration.java", "line": 12}],
      "phase4_extracted": true
    },
    {
      "id": "AP-VALIDATION-MISSING-EMAIL-UNIQUE-001",
      "category": "DOMAIN",
      "severity": "high",
      "name": "회원가입 email/username unique 검증 이중 부재 (App+DB)",
      "evidence": [
        {"file": "domain/user/UserService.java", "line": 22},
        {"file": "src/main/resources/schema.sql", "context_note": "users.email/name UNIQUE 부재"}
      ],
      "phase4_extracted": true
    },
    {
      "id": "AP-ARCH-LAYER-VIOLATION-001",
      "category": "ARCH",
      "severity": "medium",
      "name": "application → infrastructure 직접 의존 (UserJWTPayload)",
      "phase4_forced_register": true,
      "source": "ARCH-STYLE 정정 트레이스 후속 (LV-001)"
    },
    {
      "id": "AP-DOMAIN-FRAMEWORK-LEAK-001",
      "category": "ARCH",
      "severity": "medium",
      "name": "domain → Spring framework leak (@Service/@Transactional/@Entity/PasswordEncoder)",
      "phase4_forced_register": true,
      "source": "ARCH-STYLE 정정 트레이스 후속 (LV-002)"
    },
    {
      "id": "AP-DB-CASCADE-MISSING-001",
      "category": "DB",
      "severity": "medium",
      "name": "FK ON DELETE 정책 부재 (NO ACTION 유지)",
      "phase4_inherited_from": "Phase 2 DRIFT-007"
    }
  ]
}
```

추가 후보 (논의 필요):
- AP-PERFORMANCE-EAGER-N1-001 (medium) — Article.author/userFavorited/comments + Comment.article/author 모두 EAGER
- AP-DOMAIN-EMBEDDABLE-COLLECTION-001 (low) — ArticleContents.tags @ManyToMany in @Embeddable (F-017 발현)
- AP-DOMAIN-EQUALS-MUTABILITY-001 (low) — User.equals via email + Email mutable (F-028 deferred 후보)

---

## §5. 신규 Finding (Phase 4 발견)

| ID | severity | 처분 | 사유 |
|---|---|---|---|
| **F-027** | medium | promoted (v1.2.0 후보) | 방법론 명세에 "잠재 버그 발견 시 처리 가이드" 부재 (Comment 권한 버그 처분 시) |
| **F-028** | low | deferred (PoC #02/#03 후) | User.equals/hashCode 가 mutable email 의존 — Phase 4 범위 외 |
| **F-029** | medium | promoted (v1.2.0 후보) | 4영역 중 N영역 부재 시 신뢰도 가중치 재계산 가이드 부재 (F-026 발현 + 별도) |
| **F-030 후보** | low | deferred | cascade 매트릭스 4단계 분류 (document A1) — domain.schema.json `aggregates[].cascade_signal` 보강 |
| **F-031 후보** | low | deferred | ADR-004 미추출 4 strategic 항목 implicit 발현 시 기록 가이드 부재 (Shared Kernel implicit) |
| **F-032 후보** | low | deferred | "Service method = UC 1개" + CQRS kind 보조 필드 명세 부재 (Phase 4 §3.1 보강) |
| **F-033 후보** | low | deferred | F-017 본 PoC 발현 데이터 추가 (PoC #02/#03 후 v1.2.0 격상 데이터) |

→ **즉시 등록**: F-027, F-029 (promoted v1.2.0)
→ **즉시 등록 (deferred)**: F-028, F-030, F-031, F-032, F-033

누적 finding: 18 (closed 9 + promoted 5 + deferred 4) + Phase 4 신규 7 = **25건**.

---

## §6. 통합 권고 — Phase 4 코드 착수 시 메인이 챙길 액션

3-agent 권고 종합 (document A1~A7 + senior 메타 5건 + case 9 결정 매트릭스):

### A1. Aggregate cascade 매트릭스 적용 (document)
- Article+Comment {PERSIST, REMOVE} → same aggregate (신뢰도 0.85)
- Article.userFavorited PERSIST → Vernon "No Cascade" 위반 → AP 후보 검토
- User+followingUsers REMOVE → 약한 same aggregate
- → domain.json 의 aggregates[] 추출 시 cascade_signal 메모

### A2. DRIFT-010 schema.sql UNIQUE 부재 격상
- DB+App 이중 부재 → AP-VALIDATION-MISSING-EMAIL-UNIQUE-001 severity high
- BR + AP 이중 등록
- recommendations[REC-EMAIL-UNIQUE-DOUBLE] (Application existsByEmail + DB UNIQUE 둘 다)

### A3. Comment 권한 De Morgan 버그 BR + AP 이중
- AP-DOMAIN-LOGIC-BUG-001 critical
- BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 + actual_behavior 별도 필드
- F-027 신규 finding (잠재 버그 처리 가이드 부재)

### A4. JWT SECRET 하드코딩 강제 등록
- AP-CONFIG-HARDCODED-SECRET-001 critical (LV-001/LV-002 와 동급 강제)
- BR-AUTH-JWT-EXPIRE-001 + BR-AUTH-JWT-SECRET-LENGTH-001 (둘 다 human_review_required)
- recommendation: 환경변수 + Vault/Parameter Store

### A5. LV-001/LV-002 강제 등록 + recommended_alternative 코드 스니펫
- AP-ARCH-LAYER-VIOLATION-001 + AP-DOMAIN-FRAMEWORK-LEAK-001 medium
- recommended_alternative 에 port/adapter 코드 스니펫 첨부 (1개씩)
- antipatterns-partial/_manifest.yml 에 `next_phase_action=Phase 6 merge` 게이트

### A6. 5.B/5.C/5.D 명시적 처리
- _manifest.yml: `areas.5B.status=skipped, reason=FE absent` / `areas.5D.status=zero_dependencies, reason=self-contained JWT` / `areas.5C.status=sparse, finding=critical`
- F-029 신규 (신뢰도 재계산 가이드 부재)

### A7. Service → UC 1:1 매핑 + CQRS kind 보조
- 총 UC ~25개 (Command 11 / Query 14)
- domain.schema.json use_cases[].kind: command|query 메모 (스키마 보강 필요 시 F-032)

---

## §7. PoC v1.1.2 명세 정합성 (Phase 4 검증 결과)

| 명세 부분 | 정합성 평가 | 격상 후보 |
|---|---|---|
| ADR-004 DDD-Lite B (10 추출 + 4 strategic 미추출) | 적합 (10 모두 RealWorld 매핑 가능) | F-031 (implicit 발현 가이드) |
| ADR-006 default `bc_status=undefined` (CIRCULAR-001) | **검증 성공** (Phase 4 에서 same_bc 결정 라우팅 성공) | — |
| domain.schema.json (cascade_signal, contains_entity_ref) | 적합 + F-030/F-033 보강 후보 | v1.2.0 |
| rules.schema.json (Given/When/Then + extracted_from_area) | 적합 | — |
| antipatterns.schema.json (Phase 4 partial) | 적합 (저자 분리 BR/AP 가능) | — |
| phase-4-비즈니스로직.md §3 (4영역) | **빈약 케이스 검증** (5.B 부재 / 5.D 0건 / 5.C 빈약) — F-026 발현 | F-026 promoted + F-029 신규 |
| phase-4-비즈니스로직.md §6 신뢰도 평균 ~70% | 본 PoC 0.83 추정 (5.A 가중) — 명세 lock-in 부재 | F-029 |
| phase-4-비즈니스로직.md §7 함정 (Anemic 무시 등) | 적합 (Anemic 무발현, Aggregate 과잉 회피) | — |

---

## §8. 한계 및 학습 코퍼스 의존 표기

3 sub-agent 의 자기 진단 종합 (F-015 패턴):

### 검증 필요 항목 (윤주스 검토 시 출처 재확인 권장)
- Vernon Effective Aggregate Design Part I/II/III PDF (메인 직접 fetch 권장)
- Eric Evans DDD Reference / Blue Book
- RFC 7519/7515/8725 / OWASP JWT Cheat Sheet (메인 fetch 권장)
- Hibernate ORM 6.x User Guide §2.6 / §6.7
- 한국 토스/라인 follow 회고 (1차 자료 부재)
- 한국 KISA Comment 권한 버그 인시던트 (1차 자료 부재)
- 한국 SI BCryptPasswordEncoder 채택률 % (수치 부재)
- gothinkster RealWorld 다구현체 OR 사용 (코퍼스 기반 — 메인 검증 권장)

### 코퍼스 기반 표기 (재확인 권장)
- 카카오뱅크 Spring Modulith 발표 자료
- 우형/카카오페이 Hexagonal 실무 합의 발표 자료
- Spring 공식 reference try/catch 안티패턴 권고
- Robert C. Martin Clean Architecture 책 출판물

### 메인 raw fetch 직접 검증 (확정 — 학습 코퍼스 의존 0)
- Article.java line 86 De Morgan 버그
- JWTConfiguration.java line 12-13 SECRET + DURATION
- UserService.java line 22-27 signUp existsByEmail 부재
- schema.sql users.email/name UNIQUE 부재
- build.gradle 외부 의존성 0건
- User/Profile/Email/UserName/Image/ArticleContents/ArticleTitle/Tag/Comment 모든 entity Read 검증
- SecurityConfiguration BCrypt + STATELESS + public endpoints

---

## §9. 다음 단계 (3원칙 진입)

본 research-phase4.md 완성 → **윤주스 (TF Lead) 3원칙 승인 요청**.

승인 게이트:
- [ ] §1 11개 결정 매트릭스 (특히 #1 same_bc, #6 AP-VALIDATION-MISSING high, #7 AP-DOMAIN-LOGIC-BUG critical)
- [ ] §5 신규 Finding 7건 등록 권한 (F-027~F-033)
- [ ] §6 7가지 액션 (A1~A7) 코드 착수 시 적용 권한
- [ ] §8 코퍼스 기반 4건 + 검증 필요 다수 — 윤주스 출처 재확인 후 적용 여부

승인 후:
1. output/domain/{domain.json, domain.md, domain.mermaid, use-cases.md, ubiquitous-language.md, _manifest.yml} 작성
2. output/rules/{rules.json, rules.md, _manifest.yml} 작성
3. output/antipatterns-partial/{antipatterns-partial.json, _manifest.yml} 작성
4. output/architecture/architecture.json `circular_dependencies[CIRCULAR-001].bc_status=same_bc` 갱신
5. output/db/schema.json + 정합성-검증-보고서.md DRIFT-010 격상 갱신
6. findings/poc-findings.md F-027~F-033 추가
7. RESUME.md / CLAUDE.md / PROGRESS-poc01-phase4.md 갱신

---

## §10. 부록 — 3 에이전트별 산출 위치

- `document-phase4.md` (409 lines) — 6 토픽 + F-015 cross-check + URL 인용
- `case-phase4.md` (456 lines) — 7 토픽 + 9 결정 매트릭스 + 33 URL
- `senior-phase4.md` (242 lines) — 5 영역 + 11 결정 매트릭스 + Phase 4 골격
- `research-phase4.md` (본 파일) — 메인 통합 + 11 결정 + 6 액션
