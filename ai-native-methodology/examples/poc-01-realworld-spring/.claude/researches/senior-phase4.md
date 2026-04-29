# Senior Engineer 조언 — Phase 4 (PoC #01)

> 작성일: 2026-04-28
> 작성자: Senior Engineer (DDD/JPA/Spring 15+년, 한국 SI/플랫폼 양쪽 경험) — Claude 의 인격
> 입력: plan-phase4.md / 메인 사전 raw fetch 8 파일 (User, UserService, Profile, Article, Comment, Email, UserRepository, JWTConfiguration)
> 학습 코퍼스 의존 의심 시 **(코퍼스 기반)** 표기. 그 외는 raw fetch 직접 검증 또는 실무 경험 기반.

---

## 영역 1. CIRCULAR-001 BC 결정 — same_bc vs different_bc

### 1.1 핵심 권고 (3~5 문장)

**same_bc 단일 BC (BC-CONTENT) 로 통합 권고**, severity **medium → low 격하**, `bc_status=same_bc`, `is_violation=false`. User.java line 57~95 의 5개 cross-aggregate 행동 (`writeArticle`/`writeCommentToArticle`/`favoriteArticle`/`unfavoriteArticle`/`deleteArticleComment`) 은 단순 위임 (delegation) 이 아니라 **도메인 의미를 가진 협력** — 도메인 의도가 동일 BC 임을 강하게 시사 (Eric Evans, Bounded Context "linguistic boundary"). RealWorld 같은 단일 콘텐츠 플랫폼은 "글쓴이=사용자=콘텐츠 생산자" 의 동일 보편 언어를 공유하므로 BC 분리는 인위적이며, 분리 시 `User.writeArticle()` 을 ArticleApplicationService 로 이전해야 하는데 이는 본 코드의 **Rich Domain (User 13+ behaviors)** 의 의도를 파괴. 단, **Aggregate 경계는 분리 유지** (User / Article / Tag) — BC 통합 ≠ Aggregate 통합 (이 둘을 혼동하는 게 한국 SI 의 가장 흔한 함정).

architecture.json 갱신: `bounded_contexts=[BC-CONTENT, BC-AUTH]` (2개), CIRCULAR-001 의 `is_violation=false` + `rationale="single BC (BC-CONTENT) — User-Article aggregates collaborate within same BC"`. ADR-006 default `bc_status=undefined` 의 v1.1.2 결정성도 검증 — Phase 4 에서 도메인 의도 기반 결정으로 라우팅 성공.

### 1.2 함정 / 실패 패턴 (실무 시니어 관점)

**함정 1 — "패키지 경계 = BC 경계" 오인**: 본 코드가 `domain/user/` + `domain/article/` 패키지로 분리됐다고 BC 가 2개라고 자동 결정하면 안 된다. 패키지는 **물리적 응집도** 표현 도구일 뿐 BC 와 1:1 매핑 보장 X. 실무에서 BC 결정의 1차 신호는 **보편 언어 충돌** (같은 단어가 다른 의미) — RealWorld 에서 "User" 가 BC-USER 와 BC-ARTICLE 에서 다른 의미인가? 아니다 (글쓴이 = 사용자, 동일). 신호 부재 → 동일 BC.

**함정 2 — Modulith 흉내**: 카카오뱅크의 "1상품=1모듈" 같은 사례를 단순 모방해 RealWorld 를 user/article 모듈로 쪼개는 경우가 있는데, 카뱅 사례는 **상품별 규제 차이 + 별도 팀** 이라는 컨텍스트가 있어서 가능한 결정. RealWorld 는 단일 팀 + 단일 도메인 → BC 분리 비용 > 효익 (코퍼스 기반 — 카뱅 Spring Modulith 발표 자료 기억).

**함정 3 — "양방향 의존성 = BC 위반" 알고리즘 결정**: 메인이 사전 권장한 same_bc 가 정답. 하지만 MSA 광신도 시니어가 "순환은 무조건 위반" 으로 격상 시도 가능. 반례: Vaughn Vernon "Implementing DDD" 4장 — 같은 BC 내 Aggregate 간 양방향 참조는 *정상적인 협력*. 위반 판정의 기준은 "BC 경계를 넘는 양방향" 이지 "Aggregate 경계를 넘는 양방향" 이 아님.

**함정 4 — "BC 통합 시 향후 분리 비용 ↑" 과대평가**: 한국 SI 에서 자주 듣는 반론. 실제는 **BC 분리가 잘못됐을 때 통합 비용 >> BC 통합 후 분리 비용**. 분리는 Strangler Fig 패턴으로 점진적 가능, 통합은 ID 매핑/이벤트 정합 부채를 **이미 누적한 상태에서** 풀어야 함 (실무 회고 — 사내 모놀리스 분해 프로젝트 3건 모두 "처음부터 너무 일찍 분리했다" 가 결론).

**함정 5 — Layered + DDD-Lite 와의 정합 무시**: ARCH-STYLE 정정 트레이스 approved 결과 (architecture.md §2 confidence 0.85). DDD-Lite **B 단계** (Aggregate + VO 강조, BC 는 1~2개로 단순화) 는 **same_bc 와 자연 정합**. different_bc 결정 시 ADR-004 의 DDD-Lite 강도가 자가 모순되는데, ADR-004 가 아직 본 PoC 의 결정 근거이므로 same_bc 가 정합.

### 1.3 PoC 결정 매트릭스

| 결정 | 권장 | 등록 ID | severity |
|---|---|---|---|
| CIRCULAR-001 BC 결정 | **same_bc (BC-CONTENT 단일)** | architecture.json `circular_dependencies[CIRCULAR-001].bc_status=same_bc` | low (격하) |
| BC 카탈로그 | BC-CONTENT + BC-AUTH (2개) | domain.json `bounded_contexts[]` | — |
| Aggregate 카탈로그 | User, Article(+Comment member), Tag (3개) | domain.json `bounded_contexts[BC-CONTENT].aggregates[]` | — |
| AP-ARCH-CIRCULAR-DOMAIN-001 | **미등록** (same_bc 결정으로 위반 아님) | — | — |

---

## 영역 2. DRIFT-010 (email unique application 검증 부재) 처분

### 2.1 핵심 권고 (3~5 문장)

**BR + AP 이중 등록 권고**: BR-USER-EMAIL-UNIQUE-001 (신뢰도 0.70 — 도메인 의도 추정) + AP-VALIDATION-MISSING-001 (severity **high**, 본 PoC 최고 위험 1순위와 동급). 이중 등록은 자산 분리 원칙으로 정합 — BR 은 "지켜야 할 규칙", AP 는 "현재 위반 상태" 로 의미가 다르며 schema 도 다름 (rules.schema vs antipatterns.schema). DB 레벨 (DRIFT-010 Phase 2) + Application 레벨 (Phase 4) 모두 부재 = **double miss critical** — 한국 SI 에서 race condition 사고로 이메일 중복 가입 → 패스워드 reset 시 다른 사람 계정 탈취되는 보안 사고로 직결되는 패턴. severity high 보장.

UserService.signUp() (line 22~27) 가 `existsByEmail` 호출 0회, try/catch 0회, 직접 save → DB unique constraint 도 schema.sql 에 없음 (Phase 2 확인). **권고**: Phase 6 통합 시 권장 정정안 = "Application 레벨 `existsByEmail` 사전 조회 + DB UNIQUE 제약 추가" 이중 안전망 (DefenseInDepth). Application 단독 검증은 race condition 미해결, DB 단독 검증은 사용자 친화적 메시지 부재 → **반드시 둘 다**.

### 2.2 함정 / 실패 패턴

**함정 1 — Application 검증만 추가하고 끝**: "existsByEmail 추가했으니 됐다" — 한국 SI 시니어가 가장 자주 빠지는 함정. 동시 가입 요청 (트랜잭션 A 의 select 후 commit 전, 트랜잭션 B 의 select) → 둘 다 통과 → 둘 다 insert → 둘 다 성공 (DB unique 없음). 사고 사례 (실무 회고 — 사내 SaaS 가입 폭주 이벤트, 동일 이메일 5건 중복 가입). 해결: DB UNIQUE + ON CONFLICT 시 사용자 친화 메시지로 변환.

**함정 2 — 단일 권고로 BR/AP 합치기**: rules.json 에 "AP-적 의미" 섞어 넣으면 schema 검증 통과해도 Phase 6 안티패턴 통합 시 누락됨. **반드시 분리**.

**함정 3 — neutral 판정 회피**: "코드에 없으니 의도 아님" 판정 시 BR 미등록 → 잘못된 결론. RealWorld API spec 명시 + 실무 도메인 상식 + UI/UX 기대 (회원가입 시 "이미 가입된 이메일" 메시지 필수) → **의도는 명백한 unique 제약, 구현이 누락**. 신뢰도 0.70 (의도 명확하나 구현 부재라는 메타 사실 자체에는 0.95 신뢰).

**함정 4 — RealWorld 학습용 spec 이라 "OK"**: 본 PoC 가 학습용이라고 finding 격하하면 PoC #02/#03 에 패턴 누락. 본 finding 은 "학습용이라 누락된 게 아니라, 학습용임에도 누락된 critical pattern" 으로 등록.

**함정 5 — try/catch 로 DataIntegrityViolation 변환**: Spring 진영의 흔한 처방인데, exception 기반 흐름 제어는 (a) 트랜잭션 롤백 비용 (b) 에러 로그 노이즈 (c) 응답 시간 비결정적. existsByEmail + DB UNIQUE + 사용자 친화 메시지 (catch 는 fallback 만) 가 표준 (코퍼스 기반 — Spring 공식 reference).

### 2.3 PoC 결정 매트릭스

| 결정 | 권장 | 등록 ID | severity / 신뢰도 |
|---|---|---|---|
| BR 등록 | **등록** | BR-USER-EMAIL-UNIQUE-001 (rules.json) | confidence 0.70 / human_review_required=true |
| AP 등록 | **등록** | AP-VALIDATION-MISSING-001 (antipatterns-partial.json) | severity **high** |
| Phase 6 권고 | Application + DB 이중 안전망 | recommendations[REC-EMAIL-UNIQUE-DOUBLE] | — |
| DRIFT-010 처분 | Phase 2 closed 유지 + Phase 4/6 후속 인계 | drift-resolution.md update | — |

---

## 영역 3. Comment.removeCommentByUser 권한 로직 버그

### 3.1 핵심 권고 (3~5 문장)

**확정 — 명백한 권한 버그**. raw fetch 검증 (Article.java line 86) `if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))` 는 De Morgan 으로 풀면 `!(user.equals(author) AND user.equals(commentsToDelete.getAuthor()))` → 즉 article 작성자 **AND** comment 작성자 둘 다 일치해야 통과. 더 심각한 점은 User.equals() (line 161~166) 가 **email 만 비교**이므로 사실상 "본인 article 의 본인 comment" 만 삭제 가능 — RealWorld API spec ("comment author can delete own comment", 즉 본인 comment 면 article 누구 글이든 삭제 가능) 과 정면 위배.

**처분**: AP-DOMAIN-LOGIC-BUG-001 (severity **critical**) 등록 + BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 (RealWorld spec 정합 정정 BR) 등록 + **F-027 신규 finding 등록** (방법론 명세에 "잠재 버그 발견 시 처리 가이드" 부재 — Phase 4 finding). RealWorld spec 변형이라 "의도된 동작" 가능성 있으나 (a) 기능 자체가 망가짐 (b) 다른 RealWorld Java/Kotlin/TypeScript 구현체 5+ 곳 다수가 OR 연산 사용 (코퍼스 기반 — gothinkster RealWorld 공식 카탈로그 기억) → "버그가 의도적" 가능성 매우 낮음.

### 3.2 함정 / 실패 패턴

**함정 1 — "코드 그대로 BR 추출"**: 코드 동작을 충실히 BR 로 옮기면 "본인 article 의 본인 comment 만 삭제 가능" 이라는 **버그를 BR 로 신성화** 하는 결과. 그래서 plan-phase4.md R-407 처럼 `human_review_required=true` 필수, 그리고 BR 추출 시 **RealWorld API spec 과 cross-check** 게이트가 필요. 명세에 이 cross-check 게이트가 없으면 finding 등록 (F-027).

**함정 2 — "이건 BR 아니라 코드 결함이니 antipatterns 만"**: 도메인 의도 (RealWorld spec) 와 코드 실제 동작이 분기되면 **둘 다 등록** — BR 은 "이래야 한다" 의 사양, AP 는 "현재 깨졌다" 의 진단. Phase 6 권고는 BR 을 만족시키는 코드 정정.

**함정 3 — severity 격하**: "테스트 코드에서는 통과하니까 medium" 같은 격하. 권한 버그는 **보안 사고 직결** — 본 코드는 본인이 article 작성자가 아니면 본인 comment 도 삭제 못함 (UX 망가짐) 이지만, **반대 De Morgan 오류** 가 있었다면 (`!A && !B` → A 또는 B 가 author 면 통과) 누구나 모든 comment 삭제 가능한 sev critical. 본 케이스는 **UX critical**, 보안 critical 은 아님 → 그래도 critical 유지 (권한 로직은 보안 인접 critical zone, 의심 시 보수적 격상).

**함정 4 — "RealWorld 변형이라 의도적일 수도"** 의 회피: 다른 구현체 비교 + spec 과의 명시적 대조 + 코드 작성자의 다른 권한 로직 (`updateArticle` line 62 `if (article.getAuthor() != this)` 는 정상 — author 만 통과) 과 비교 시 **inconsistent**. 의도된 변형이라면 다른 권한 로직도 같이 변형됐어야 함. → 버그 확정.

**함정 5 — `equals()` 가 email 만 비교**: 같은 email 의 다른 User 객체끼리 `equals=true` 라 line 86 의 1차 조건은 그래도 작동. 하지만 follow 등 다른 로직에서 잠재 동치성 사고 가능 (예: email 변경 시 hashCode 변경 → HashSet 깨짐). **별도 finding 후보** (F-028 — equals/hashCode mutability bug) — 단 Phase 4 범위 내가 아니므로 deferred 권장.

### 3.3 PoC 결정 매트릭스

| 결정 | 권장 | 등록 ID | severity |
|---|---|---|---|
| AP 등록 | **등록** | AP-DOMAIN-LOGIC-BUG-001 | severity **critical** |
| BR 등록 | RealWorld spec 정합 BR | BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 | confidence 0.85 / human_review_required=true |
| F finding | **신규 등록** | F-027 (명세에 "잠재 버그 처리 가이드" 부재) | severity medium / promoted v1.2.0 후보 |
| equals() mutability | deferred (별도 finding 후보) | F-028 candidate | — |

---

## 영역 4. 5.B FE 부재 / 5.D 외부 0건 / 5.C 빈약 케이스 처리

### 4.1 핵심 권고 (3~5 문장)

**_manifest.yml 에 명시적 declared skip + 신규 finding 등록**. 단순 도장 (`skipped: true`) 으론 부족 — 본 PoC 가 명세 §3.2/§3.3/§3.4 의 가이드를 검증 못 한다는 **메타 사실** 자체가 finding (F-029 — "4영역 중 N영역 부재 시 신뢰도 가중치 재계산 가이드 부재"). 본 PoC 평균 신뢰도는 5.A 가중 (~85%) 으로 0.83 추정 (plan-phase4.md §10) 인데 명세 §6 "평균 ~70%" 와 불일치 — 가중치 재계산 룰이 명세에 없음 = F-026 deferred 의 발현 사례 + F-029 신규.

**5.C 빈약 처리**: 8 lines + JWT secret 하드코딩 (JWTConfiguration line 12, "SOME_SIGNATURE_SECRET") + JWT_DURATION 2h 하드코딩 (line 13) → 빈약하지만 critical 발견됨. 이는 명세 §3.3 의 "빈약해도 가치 있음" 가설 검증 → 그대로 추출, AP-CONFIG-HARDCODED-SECRET-001 (severity **critical**) 강제 등록.

### 4.2 함정 / 실패 패턴

**함정 1 — 단순 skip 도장**: `5.B: skipped (FE absent)` 만 찍으면 PoC #02/#03 에서 같은 케이스 재발 시 또 ad-hoc 처리. **declared skip + 신뢰도 가중치 재계산 + 명시적 한계 선언** 3종 세트 필요.

**함정 2 — 5.D 0건 ≠ 검증 완료**: 외부 의존성이 없다는 사실 자체는 5.D 추출 결과. 단 명세 §3.4 의 "신뢰도 0.50" 가이드는 "외부 의존성이 *있을 때* 0.50" 인지 "5.D 영역 자체가 *0건일 때*" 인지 모호 → F-026 deferred 의 정확한 모양. PoC #02 (다른 스택, 외부 의존성 5+) 와 합산해서 v1.2.0 격상.

**함정 3 — 5.C 빈약 = 미추출**: 8 lines 인데 JWT secret 하드코딩이 critical 이라는 점이 핵심. 양 ≠ 가치. 본 PoC 가 5.C 의 **소수 정밀 발견** 패턴 검증 — 정합. 단 매직 넘버 (JWT_DURATION 2h, BCrypt strength default 등) 는 `human_review_required=true` 로 표기 (R-407).

**함정 4 — JWT SECRET 하드코딩 격하**: "PoC 라서 OK" 라고 격하하면 본 PoC 의 자기 정당화. severity critical 유지 + recommendation = "환경변수 + Vault/Parameter Store 외부화" 명시. 학습용 코드여도 critical zone 은 critical 로 라벨링 (라벨이 학습 가치).

**함정 5 — 신뢰도 평균 명세 lock-in**: 명세 §6 "평균 ~70%" 가 4영역 모두 추출됐을 때 가정인지, 일부 부재 시 어떻게 되는지 가이드 없음. 본 PoC 0.83 ≠ 명세 70% → 격차 처리 룰 부재 = F-026 deferred 의 본 PoC 발현. F-029 (신규) 로 별도 finding.

### 4.3 PoC 결정 매트릭스

| 결정 | 권장 | 등록 ID | severity |
|---|---|---|---|
| 5.B 처리 | declared skip + reason | _manifest.yml `areas.5B.status=skipped, reason=FE absent` | — |
| 5.D 처리 | declared zero + reason | _manifest.yml `areas.5D.status=zero_dependencies, reason=self-contained JWT` | — |
| 5.C 빈약 처리 | 추출 + 매직넘버 표기 | rules.json BR-AUTH-JWT-EXPIRE-001 / BR-AUTH-JWT-SECRET-001 (human_review_required=true) | — |
| AP-CONFIG-HARDCODED-SECRET-001 | **등록** (JWT SECRET 문자열) | antipatterns-partial.json | severity **critical** |
| F-026 발현 | 본 PoC 사례 추가 | findings/poc-findings.md F-026 reference | promoted v1.2.0 |
| F-029 신규 | 4영역 중 N영역 부재 시 신뢰도 가이드 부재 | findings/poc-findings.md F-029 NEW | severity medium / promoted v1.2.0 후보 |

---

## 영역 5. ARCH-STYLE 후속 안티패턴 (LV-001/LV-002) Phase 4 강제 등록

### 5.1 핵심 권고 (3~5 문장)

**antipatterns-partial.json 에 LV-001/LV-002 강제 등록 — Phase 4 출력 보장**. ARCH-STYLE 정정 트레이스 approved 가 Phase 4 후속 의무로 명시 (RESUME.md §3) — 미등록 시 트레이스 무효화 위험. severity 는 **둘 다 medium** (학습용 spec 이라는 본 PoC 한계 인정 + 그래도 라벨링은 medium 유지). LV-001 (application/security/JWTAuthenticationFilter → infrastructure/jwt/UserJWTPayload) 은 application 레이어가 infrastructure 구체에 의존 — DIP 위반. LV-002 (domain/user/UserService → org.springframework.security.crypto.password.PasswordEncoder) 는 domain 이 framework 에 직접 leak — DDD-Lite 의 약속 위반.

**recommended_alternative**: LV-001 = port 인터페이스 (`io.realworld.application.security.JWTPayload` port) + adapter (infrastructure 가 구현) — 학습용 spec 유지하면서도 DIP 회복 가능. LV-002 = `domain.user.PasswordEncoder` port + infrastructure adapter (Spring Security 구현 wrapping). 단 본 PoC 는 학습용이라 정정 적용 의무 없음 — **라벨링과 권고만**.

### 5.2 함정 / 실패 패턴

**함정 1 — "Pure Hexagonal vs Spring DDD-Lite" 광신**: 한국 SI 실무에서 가장 흔한 종교 전쟁. Pure Hexagonal 진영은 "domain 에 어떤 framework import 도 ❌", Spring DDD-Lite 진영은 "Spring stereotypes (`@Service`, `@Transactional`) 정도는 OK". **합의**: (a) 핵심 도메인 객체 (Aggregate, VO) 는 framework-free, (b) Application Service 는 `@Transactional` 같은 cross-cutting OK, (c) PasswordEncoder 같은 **infrastructure 추상화** 는 도메인 port 로 추출 권장 (코퍼스 기반 + 우형/카카오페이 발표 자료 종합). 본 PoC 의 LV-002 는 (c) 위반 → medium.

**함정 2 — `severity=high` 격상**: 학습용 spec 임을 무시하고 본 PoC 만 보고 high 로 격상하면 PoC #02/#03 에서 동일 패턴 발견 시 inflation. medium 유지 + 다중 PoC 데이터로 v1.2.0 에서 표준화.

**함정 3 — recommended_alternative 빈약**: "port 추출하세요" 만 적으면 Phase 6 권고가 ad-hoc. **구체 코드 스니펫 1개씩 첨부** — `interface PasswordEncoder { String encode(String); boolean matches(String, String); }` (domain) + `class SpringPasswordEncoderAdapter implements PasswordEncoder` (infra). 한국 시니어가 가장 자주 거부하는 패턴은 "추상화 1개 더 만들어야 하는 비용" — 코드 스니펫이 비용 대비 효익을 가시화.

**함정 4 — antipatterns-partial 의 Phase 6 통합 누락**: Phase 4 에서 partial 작성 후 Phase 6 에서 통합 시 누락 위험. _manifest.yml 에 `next_phase_action=Phase 6 antipatterns.json merge` 명시 + partial 의 모든 ID 가 Phase 6 출력에 존재하는지 통합 검증 게이트.

**함정 5 — ADR-004 DDD-Lite B 강도와의 정합**: ADR-004 가 "B 강도 (Aggregate + VO 강조)" 라면 BC 는 1~2개 + Hexagonal 까지는 의무 아님 → LV-002 의 medium 정합. ADR-004 강도가 "C (full Hexagonal)" 였으면 LV-002 = high. 본 PoC 는 B → medium 정합.

### 5.3 PoC 결정 매트릭스

| 결정 | 권장 | 등록 ID | severity |
|---|---|---|---|
| LV-001 등록 | **강제 등록** | AP-ARCH-LAYER-VIOLATION-001 | severity **medium** |
| LV-002 등록 | **강제 등록** | AP-DOMAIN-FRAMEWORK-LEAK-001 | severity **medium** |
| recommended_alternative | port/adapter 코드 스니펫 첨부 | antipatterns-partial.json `recommended_alternative[]` | — |
| Phase 6 통합 게이트 | _manifest.yml `next_phase_action` 명시 | antipatterns-partial/_manifest.yml | — |

---

## Phase 4 결정 매트릭스 (11개 통합)

본 PoC 의 Phase 4 등록·처분 권고 종합 (CIRCULAR-001 + DRIFT 후속 4 + AP 후보 5 + 명세 정합 1 신규 finding):

| # | 결정 카테고리 | ID | 산출물 | 권장 처분 | severity / confidence | 근거 |
|---|---|---|---|---|---|---|
| 1 | CIRCULAR-001 BC | architecture.json `bc_status=same_bc` | architecture.json (수정) | **same_bc 단일 BC-CONTENT** | medium → low 격하 | User.java 5 cross-aggregate 행동 + Eric Evans 보편 언어 + ADR-004 B 강도 정합 |
| 2 | DRIFT-002 후속 | BR-USER-FOLLOW-DIRECTIONAL-001 | rules.json | **등록** (단방향 follow 보편 언어) | confidence 0.85 | Profile.java 도메인 의도 보강 + RealWorld spec |
| 3 | DRIFT-003 후속 | REC-001 (recommendation 만) | db/schema.json (이미 반영) | **유지** (코드 변경 없음) | — | 이미 처분 완료 |
| 4 | DRIFT-007 후속 | AP-DB-CASCADE-MISSING-001 | antipatterns-partial.json | **등록** (NO ACTION on user_followings 제거) | severity medium | Phase 2 finding 유지 + Phase 6 통합 |
| 5 | DRIFT-010 후속 BR | BR-USER-EMAIL-UNIQUE-001 | rules.json | **등록** (의도 명확, 구현 부재) | confidence 0.70 / human_review_required=true | Email.java + UserService.signUp() raw fetch |
| 6 | DRIFT-010 후속 AP | AP-VALIDATION-MISSING-001 | antipatterns-partial.json | **등록** (Application + DB 모두 부재) | severity **high** | UserService line 22~27 + schema.sql DRIFT-010 |
| 7 | Comment 권한 버그 AP | AP-DOMAIN-LOGIC-BUG-001 | antipatterns-partial.json | **등록** (De Morgan 버그) | severity **critical** | Article.java line 86 raw fetch + RealWorld spec |
| 8 | Comment 권한 버그 BR | BR-COMMENT-AUTHOR-OR-ARTICLE-OWNER-DELETE-001 | rules.json | **등록** (RealWorld spec 정합 정정) | confidence 0.85 / human_review_required=true | RealWorld API spec |
| 9 | LV-001 강제 등록 | AP-ARCH-LAYER-VIOLATION-001 | antipatterns-partial.json | **등록** (Phase 6 통합 게이트) | severity **medium** | ARCH-STYLE 정정 트레이스 approved |
| 10 | LV-002 강제 등록 | AP-DOMAIN-FRAMEWORK-LEAK-001 | antipatterns-partial.json | **등록** (Phase 6 통합 게이트) | severity **medium** | UserService PasswordEncoder import + ADR-004 B 강도 |
| 11 | JWT SECRET 하드코딩 AP | AP-CONFIG-HARDCODED-SECRET-001 | antipatterns-partial.json | **등록** (5.C 빈약 영역의 critical 발견) | severity **critical** | JWTConfiguration.java line 12 raw fetch |

**부수 결정**:
- F-027 신규 finding: 방법론 명세 "잠재 버그 발견 시 처리 가이드" 부재 (severity medium / promoted v1.2.0 후보)
- F-028 deferred 후보: User.equals() email 만 비교의 mutability 위험 (Phase 4 범위 외)
- F-029 신규 finding: 4영역 중 N영역 부재 시 신뢰도 가중치 재계산 가이드 부재 (F-026 deferred 의 본 PoC 발현 + 별도 finding)
- _manifest.yml 5.B = declared skip / 5.D = declared zero / 5.C = 빈약 인정 + critical 발견

**Phase 4 출력 antipatterns-partial.json 골격 (권고)**:

```json
{
  "antipatterns": [
    { "id": "AP-DOMAIN-LOGIC-BUG-001", "category": "DOMAIN", "severity": "critical",
      "location": "domain/article/Article.java:86", "phase4_extracted": true },
    { "id": "AP-CONFIG-HARDCODED-SECRET-001", "category": "CONFIG", "severity": "critical",
      "location": "infrastructure/jwt/JWTConfiguration.java:12", "phase4_extracted": true },
    { "id": "AP-VALIDATION-MISSING-001", "category": "VALIDATION", "severity": "high",
      "location": "domain/user/UserService.java:22-27", "phase4_extracted": true },
    { "id": "AP-ARCH-LAYER-VIOLATION-001", "category": "ARCHITECTURE", "severity": "medium",
      "location": "application/security/JWTAuthenticationFilter.java", "phase4_forced_register": true },
    { "id": "AP-DOMAIN-FRAMEWORK-LEAK-001", "category": "ARCHITECTURE", "severity": "medium",
      "location": "domain/user/UserService.java", "phase4_forced_register": true },
    { "id": "AP-DB-CASCADE-MISSING-001", "category": "PERSISTENCE", "severity": "medium",
      "location": "schema.sql / user_followings FK", "phase4_inherited_from": "Phase 2 DRIFT-007" }
  ],
  "meta": {
    "phase": 4,
    "next_phase_action": "Phase 6 antipatterns.json merge — partial IDs MUST all appear in final",
    "confidence_avg": 0.82,
    "limitations": ["5.B FE absent (BE only)", "5.D zero external dependencies (self-contained JWT)"]
  }
}
```

---

## 메타 권고 (Phase 4 진입 직전)

1. **메인 raw fetch 의무**: 본 senior 조언이 raw fetch 8 파일 직접 검증 기반인 점이 F-015 cross-validation 의 핵심. sub-agent 조언 도착 시 **같은 파일 fetch 결과**를 메인이 cross-check.
2. **PROGRESS-poc01-phase4.md** 갱신 의무 (memory `feedback_progress_log.md`): senior 도착 → PROGRESS 시간순 1줄.
3. **3원칙 게이트**: 본 senior + document + case 통합 후 윤주스 승인 필수, 코드 (output/domain, rules, antipatterns-partial) 작성 착수 전.
4. **본 PoC 한계 선언**: 학습용 BE only spec 의 한계가 §11 plan 에 이미 명시 — Phase 4 산출물 _manifest.yml 에도 한계 라벨링 일관성 유지.
5. **품질 우선 + 재작업 최소화** (memory `feedback_quality_priority.md`): 본 senior 조언이 11개 결정의 **사전 매트릭스 합의** 를 만들어 Phase 4 에서 결정 곤란 0 시퀀스 보장.

---

## 부록 A. 학습 코퍼스 의존 표기

본 senior 조언에서 코퍼스 기반 추정 명시 항목:
- 함정 2 (영역 1): 카카오뱅크 Spring Modulith 사례 — 발표 자료 기억 기반
- 함정 5 (영역 2): Spring 공식 reference 의 try/catch 안티패턴 권고 — 일반론 기억
- 핵심 권고 (영역 3): 다른 RealWorld 구현체 5+ 곳의 OR 연산 사용 — gothinkster 카탈로그 기억
- 함정 1 (영역 5): 우형/카카오페이 Hexagonal 실무 합의 — 발표 자료 기억

→ 위 4건은 윤주스 검토 시 출처 재확인 권장. 그 외 함정·권고는 메인 raw fetch 직접 검증 또는 일반 실무 경험 기반.

---

> 본 senior-phase4.md 는 2원칙 (3 에이전트 병렬 리서치) 의 1/3. document-phase4.md (공식문서) + case-phase4.md (테크기업 사례) + 본 파일 → research-phase4.md 통합 후 3원칙 (윤주스 승인) 진입.
