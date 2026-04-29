# 재구현 시 회피 후보 체크리스트 — RealWorld Conduit

> 톤: 비난이 아닌 결정 입력 (회피 후보 / 정상화 권장).
> 생성일: 2026-04-29 / 방법론 v1.1.2 / Phase 6 final
> AP 분포: critical 2 / high 2 / medium 7 / low 4 = **15 AP**
> 사내 적용 권고: critical 7 / high 26 / medium 8 = **41 REC**
> 원본 카탈로그: `antipatterns.json` (schema 검증 통과 / raw confidence 0.96)

---

## ⚠️ Critical (즉시 차단) — 2 AP / 7 REC

### AP-DOMAIN-001: Comment 삭제 권한 De Morgan 로직 버그

- **위치**: `domain/article/Article.java:86`
- **표준 위반**: OWASP A01 Broken Access Control + OWASP API1 BOLA + CWE-862 Missing Authorization
- **영향**: 댓글 작성자 ≠ 게시글 저자 케이스에서 silent fail (응답 200, 삭제 안됨). RealWorld spec 의도 (OR) 정면 위반.
- **즉시 조치 (REC-F027-001 / REC-F027-002)**:
  ```java
  // AS-IS (회피 후보)
  if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))
      throw new IllegalAccessError(...);
  
  // TO-BE (정상화 권장)
  if (!(user.equals(author) || user.equals(commentsToDelete.getAuthor())))
      throw new IllegalAccessError(...);
  ```
- **회귀 테스트 필수**: 작성자 ≠ 저자 시나리오 추가
- **finding**: F-027

### AP-SECURITY-001: JWT secret 21byte 하드코딩 (7중 표준 위반)

- **위치**: `infrastructure/jwt/JWTConfiguration.java:12`
- **표준 위반**: OWASP A02 + A07 + API2 + RFC 8725 §3.5 + RFC 7518 §3.2 + RFC 7515 §10.1 + JWT CheatSheet (7중)
- **현재**: 21byte (168bit) — HS256 256bit MUST 미달 + 하드코딩 + claim iss/aud/iat/jti 부재 (F-037 / F-041)
- **즉시 조치 (REC-JWT-001 / REC-JWT-002 / REC-AUTH-002 / REC-DOS-001 / REC-DOS-002)**:
  ```properties
  # application.properties (운영: AWS Parameter Store / HashiCorp Vault)
  jwt.secret=${JWT_SECRET}              # 256bit ≥ random
  jwt.duration-seconds=${JWT_DURATION:900}  # 15분 default
  ```
  ```java
  // JWTConfiguration.java
  @Value("${jwt.secret}")
  private String secret;
  @Value("${jwt.duration-seconds}")
  private long durationSeconds;
  
  // 추가: alg explicit 검증 (F-041 - RFC 8725 §3.1)
  // 추가: iss / aud / sub / iat / jti claim (RFC 8725 §3.8)
  ```
- **장기 권고**: Spring Security 표준 OAuth2ResourceServerConfigurer.jwt() 마이그레이션 (composite view 참조)
- **finding**: (Phase 4 신규) + F-037 + F-041

---

## 🔴 High (1 스프린트 내 처리) — 2 AP / 26 REC

### AP-DOMAIN-002: email/username unique 3중 부재 (App + DB + JPA)

- **위치**: `UserService.java:22` + `schema.sql` + `Email.java/UserName.java`
- **표준 위반**: GDPR / 회원관리 표준 (Twitter / Slack / GitHub 100%)
- **즉시 조치 (REC-EMAIL-UNIQUE-001/002/003 — 3중 방어)**:
  ```java
  // 1. Application 레벨
  if (userRepository.existsByEmail(email))
      throw new EmailAlreadyExistsException(...);
  try {
      return userRepository.save(user);
  } catch (DataIntegrityViolationException e) {
      throw new EmailAlreadyExistsException(...);
  }
  
  // 2. JPA 레벨
  @Column(name="email", nullable=false, unique=true)
  
  // 3. DB 레벨
  ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
  ALTER TABLE users ADD CONSTRAINT uq_users_name  UNIQUE (name);
  ```
- **finding**: DRIFT-010 격상 (medium → high)

### AP-PERFORMANCE-002: Pageable / limit cap 부재 (DoS)

- **위치**: `application/article/ArticleApi.java` (GetArticles + GetArticlesFeed)
- **표준 위반**: Stripe / GitHub / 토스 maximum 100 cap 표준. Tech Radar Hold (Vol.31)
- **즉시 조치 (REC-DOS-001 / REC-DOS-002)**:
  ```java
  @GetMapping("")
  public ... getArticles(@RequestParam @Max(100) Optional<Integer> limit, ...) { ... }
  
  // 또는 컨트롤러 내 cap
  int actualLimit = Math.min(limit.orElse(20), 100);
  ```
  ```yaml
  # OpenAPI
  limit:
    schema: {type: integer, default: 20, minimum: 1, maximum: 100}
  ```
- **finding**: F-040 관련

---

## 🟡 Medium (다음 분기) — 7 AP / 8 REC

### AP-ARCH-001: presentation → infrastructure 직접 의존 (LV-001)
- **영향**: 4 controller (UserApi/ProfileApi/ArticleApi/CommentApi) → UserJWTPayload 직접 import
- **권고 (REC-ARCH-001)**: domain/auth/AuthenticatedUserContext port 정의 + JWT adapter 분리
- **본 PoC 한정 medium / 사내 신규 high 격상 권고**

### AP-ARCH-002: domain → Spring framework leak (LV-002)
- **영향**: domain/article + domain/user 가 @Service / @Entity / PasswordEncoder 직접 import
- **권고 (REC-ARCH-002)**: full POJO 또는 Spring-flavored DDD-Lite 인정 (본 PoC 채택)
- **한국 SI 거의 100% 발생 패턴 — 본 PoC 한정 인정**

### AP-DB-001: FK ON DELETE 정책 부재 (DRIFT-007)
- **영향**: articles.author_id → User 삭제 시 행위 모호
- **권고 (REC-DB-001)**: soft delete + author 'Deleted User' placeholder (카카오 / 네이버 패턴)

### AP-SECURITY-002: sessionCreationPolicy(STATELESS) 명시 부재 (F-034)
- **영향**: Spring Security 5.x default IF_REQUIRED 와 의도 충돌
- **권고 (REC-AUTH-005)**:
  ```java
  .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
  ```

### AP-SECURITY-003: WebSecurity#ignoring 사용 (F-036)
- **영향**: filter chain 자체 우회 — security headers (HSTS/CSRF/X-Frame-Options) 미적용
- **권고 (REC-AUTH-006)**:
  ```java
  http.authorizeRequests()
      .antMatchers(POST, "/users", "/users/login").permitAll()
      .anyRequest().authenticated();
  ```

### AP-API-001: API 버저닝 부재 (F-038)
- **영향**: SDK deprecation 사이클 1년+ 비용. Tech Radar Hold (Vol.31).
- **권고 (REC-API-001)**:
  ```java
  @RequestMapping("/api/v1/articles")
  ```
  ```yaml
  info: {version: 1.0.0}
  servers: [{url: https://api.example.com/v1}]
  ```

### AP-PERFORMANCE-001: Article + Comment EAGER N+1 (F-017 / F-028 분리)
- **영향**: GET /api/articles?limit=20 시 최소 61 + M queries 폭주. Tech Radar Hold (Vol.32).
- **권고 (REC-DOS-003)**:
  ```java
  @ManyToOne(fetch = FetchType.LAZY)
  
  @Query("SELECT a FROM Article a LEFT JOIN FETCH a.author LEFT JOIN FETCH a.comments c LEFT JOIN FETCH c.author WHERE a.slug = :slug")
  Optional<Article> findBySlugWithFetch(...);
  ```
- **본 PoC medium / 사내 적용 시 high 격상 권고**

---

## 🟢 Low (백로그) — 4 AP

### AP-API-002: HTTP status code 일관성 (@ResponseStatus 부재)
- 본 PoC: RealWorld 호환성 유지 — default 200 인정
- 사내 신규: medium 격상 권고 — `@ResponseStatus(HttpStatus.CREATED)` / `(NO_CONTENT)` 명시

### AP-DOMAIN-003: F-017 @Embeddable 안 @ManyToMany
- 본 PoC: JPA 비주류 패턴 — low 인정
- 사내 신규: 회피 권장 (Aggregate boundary 모호)

### AP-DOMAIN-004: F-028 User.equals/hashCode mutable email 의존
- 본 PoC: 사용 빈도 낮음 — low 인정
- 사내 적용: medium 격상 (User Set 사용 시 silent fail 위험)

### AP-ARCH-003: WebSecurityConfigurerAdapter deprecated (F-039)
- Case 권고 채택: medium → low (Spring Boot 마이그레이션 점진적 가능)
- Spring Boot 3.x 전환 시 즉시 마이그레이션 필수

---

## 🛡️ 보안 설정 종합 점검 (composite view)

> 단일 AP 가 아닌 보안 설정 패턴 종합 회고 (Tech Radar Hold + 카카오페이 if(kakao) 사례).
> 4 AP cross-link: AP-SECURITY-001 (critical) + AP-SECURITY-002 (medium) + AP-SECURITY-003 (medium) + AP-ARCH-003 (low).

### Spring Boot 3.x 마이그레이션 일괄 코드 (4 AP 동시 fix)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    
    @Value("${jwt.secret}")           // AP-SECURITY-001 fix
    private String secret;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // AP-ARCH-003 fix — SecurityFilterChain bean (deprecated WebSecurityConfigurerAdapter 제거)
        http
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable())
            
            // AP-SECURITY-002 fix — sessionCreationPolicy(STATELESS) 명시
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // AP-SECURITY-003 fix — WebSecurity#ignoring → permitAll
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(POST, "/users", "/users/login").permitAll()
                .requestMatchers(GET, "/profiles/**", "/articles/**", "/tags/**").permitAll()
                .anyRequest().authenticated())
            
            // 표준 권고: Spring Security OAuth2ResourceServerConfigurer.jwt()
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                .decoder(NimbusJwtDecoder.withSecretKey(...)
                    .macAlgorithm(MacAlgorithm.HS256).build())));
        
        return http.build();
    }
}
```

→ 4 AP 일괄 fix 가능 (한 스프린트). 권고 우선순위: critical 1순위 → 나머지 3 medium/low 통합 처리.

---

## 📊 사내 적용 우선순위

| 단계 | 처리 시점 | AP | 권고 |
|---|---|---|---|
| **1. 즉시 차단** | 0~1주 | AP-SECURITY-001 (critical) > AP-DOMAIN-001 (critical) | 핫픽스 |
| **2. 1 스프린트** | 1~2주 | AP-DOMAIN-002 (high) > AP-PERFORMANCE-002 (high) | 다음 릴리스 |
| **3. 다음 분기** | 1~3개월 | medium 7 AP | composite view 일괄 fix 권장 |
| **4. 백로그** | 6개월~ | low 4 AP | Spring Boot 3.x 마이그레이션 시 통합 |

---

## 🔍 Phase 6 부가가치 — Phase 2 정합성 보고서 격상 결과

| Phase 2 DRIFT | severity | Phase 6 처분 |
|---|---|---|
| DRIFT-001 ~ DRIFT-006, DRIFT-008, DRIFT-009 | low~medium | NO ACTION (Phase 2/4 결정) |
| **DRIFT-007** (FK 부재) | medium | ✅ AP-DB-001 격상 |
| **DRIFT-010** (email unique 부재) | medium → high | ✅ AP-DOMAIN-002 격상 (medium → high) |

→ Phase 2 9 DRIFT 중 2건 격상 완료. 나머지 7건은 Phase 2/4 결정으로 NO ACTION.

---

## 부록 A — AP × REC 매트릭스 (Phase 5-1 권고 41 통합)

> Phase 5-1 senior-phase5.md 부록 B 의 41 REC (critical 7 / high 26 / medium 8) 와 본 15 AP cross-link.

### Critical 7 REC ↔ AP

| REC ID | AP | 설명 |
|---|---|---|
| REC-AUTH-002 | AP-SECURITY-001 | RFC 6750 Bearer 표준 마이그레이션 |
| REC-DOS-001 | AP-PERFORMANCE-002 | `limit maximum: 100` cap (GetArticles) |
| REC-DOS-002 | AP-PERFORMANCE-002 | Pageable size cap (GetArticlesFeed) |
| REC-F027-001 | AP-DOMAIN-001 | OpenAPI description 표기 |
| REC-F027-002 | AP-DOMAIN-001 | x-warning + x-known-bug 표기 |
| REC-JWT-001 | AP-SECURITY-001 | SECRET 256bit + 환경변수 분리 |
| REC-JWT-002 | AP-SECURITY-001 | OAuth2ResourceServerConfigurer.jwt() 표준 |

### High 26 REC ↔ AP (영역별)

| 영역 | 개수 | 주요 매핑 |
|---|---|---|
| 인증/인가 | 8 | AP-SECURITY-001/002/003 + AP-ARCH-003 |
| 검증/validation | 6 | AP-DOMAIN-002 |
| 에러 응답 | 4 | AP-API-002 |
| API 디자인 | 5 | AP-API-001 + AP-API-002 |
| 보안 설정 | 3 | composite view 4 AP |

### Medium 8 REC ↔ AP

| 영역 | 개수 | 주요 매핑 |
|---|---|---|
| 명명 규칙 | 3 | (cross-cutting) |
| consistency | 3 | AP-API-001 + AP-API-002 |
| 문서화 | 2 | (cross-cutting) |

→ 41 REC 전체 목록은 `output/api/api.md §5` + `senior-phase5.md 부록 B` 참조.

---

## 부록 B — Phase 6 final 검증 점검표 (workflow §9)

### 7대 산출물 cross-validation 결과

| # | 산출물 | 상태 | 신뢰도 |
|---|---|---|---|
| 1 | 아키텍처 (`output/architecture/`) | ✅ Phase 3 + ARCH-STYLE 정정 | 0.91 |
| 2 | 도메인 모델 (`output/domain/`) | ✅ Phase 4 + Phase 5 정정 (F-035) | 0.90 |
| 3 | API 계약 (`output/api/`) | ✅ Phase 5-1 | 0.93 |
| 4 | DB 스키마 (`output/db/`) | ✅ Phase 2 | 0.92 |
| 5 | 비즈니스 규칙 (`output/rules/`) | ✅ Phase 4 + Phase 5 정정 (F-034/036) | 0.85~0.92 |
| 6 | **안티패턴 (`output/antipatterns/`)** | ✅ **Phase 6 본 산출** | **0.96** |
| 7 | UI/UX | ❌ N/A (BE only) | — |

→ **6/7 완료 (UI/UX 제외 100%)**

### ID 표준 일관성 점검

- ✅ UC ID: `UC-CONTENT-*` 패턴 일관성 (Phase 5-1 정정 완료)
- ✅ E ID: `E-CONTENT-*` 패턴 일관성
- ✅ BR ID: `BR-{영역}-*` 패턴 일관성 (rules.json 13건)
- ✅ AP ID: `AP-{CAT}-{NUM}` 단일 prefix 정규화 (15건 / multi-prefix 정규화 매핑 표 명시)

### ID 교차 참조 무결성

- ✅ x-related-rules ↔ rules.json (BR-COMMENT-DELETE-001 / BR-USER-EMAIL-001 / BR-USER-USERNAME-001 / BR-AUTH-JWT-001/002 / BR-AUTH-STATELESS-001 / BR-AUTH-PUBLIC-001 모두 존재)
- ✅ operationId ↔ domain.json (Phase 5-1 매핑 완료 — UC-CONTENT-* / GetCurrentUser 등)
- ✅ related_table ↔ db schema (users / articles / comments 모두 존재)

### 기타 점검

- ✅ 모든 산출물 confidence 메타 (formula v1)
- ✅ human_review_required 4건 (critical 2 + high 2) 명시 — 사용자 처리 후 closed 가능
- ✅ 모든 AP 에 evidence + recommended_alternative 명시 (15/15)
- ✅ 톤 점검 통과 — 비난 표현 0 (모두 회피 후보 톤)

---

## 분석 워크플로우 종료 (PoC #01)

```
Phase 0~5-1 + Phase 6 완료 → 7대 산출물 6/7 (UI/UX 제외 100%) → 분석 종료

다음 라이프사이클:
1. 사내 적용 시 critical 2 즉시 차단 + high 2 1 스프린트
2. PoC #02 진입 (다른 스택 검증) → 본 PoC 결정 외부 검증
3. v1.2.0 격상 (PoC #01 + #02 합산) → 7 묶음 (A~G) 일괄
```

---

**END OF avoid-list.md**
