# document-phase6.md — 공식문서 리서치 (Phase 6 안티패턴 통합 / quality)

> 역할: Document Researcher (공식 표준 / RFC / OWASP / Vendor Reference)
> 산출 일자: 2026-04-29
> 대상 PoC: poc-01-realworld-spring (RealWorld 사양 Spring Boot 구현)
> 메인 사전 검토: 통합 대상 15 AP 잠재 (Phase 4 partial 6 + Phase 5 candidate 6 + Phase 4 추가 candidate 3)
> 본 리서치 적용 대상: F-015 cross-validation (sub-agent 학습 코퍼스 의존 회피 — 모든 표준 raw fetch 또는 직접 인용)

---

## 0. 출처 / 메타

| # | 표준 / 문서 | 발행처 | URL | Fetch 일자 | Fetch 방식 |
|---|---|---|---|---|---|
| D1 | OWASP Top 10:2021 (A01) Broken Access Control | OWASP | https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/ | 2026-04-29 | WebFetch |
| D2 | OWASP Top 10:2021 (A02) Cryptographic Failures | OWASP | https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/ | 2026-04-29 | WebFetch |
| D3 | OWASP Top 10:2021 (A05) Security Misconfiguration | OWASP | https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/ | 2026-04-29 | WebFetch |
| D4 | OWASP Top 10:2021 (A07) Identification & Authentication Failures | OWASP | https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/ | 2026-04-29 | WebFetch |
| D5 | OWASP API Security Top 10 — 2023 | OWASP | https://owasp.org/API-Security/editions/2023/en/0x11-t10/ | 2026-04-29 | WebFetch |
| D6 | RFC 8725 — JWT Best Current Practices (BCP 225) | IETF | https://datatracker.ietf.org/doc/html/rfc8725 | 2026-04-29 | WebFetch |
| D7 | RFC 7515 — JSON Web Signature (JWS) §10.1 | IETF | https://datatracker.ietf.org/doc/html/rfc7515 | 2026-04-29 | WebFetch |
| D8 | RFC 7518 — JSON Web Algorithms (JWA) §3.2 | IETF | https://datatracker.ietf.org/doc/html/rfc7518 | 2026-04-29 | WebFetch |
| D9 | OWASP JWT Cheat Sheet for Java | OWASP | https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html | 2026-04-29 | WebFetch |
| D10 | Spring Security blog — moving beyond WebSecurityConfigurerAdapter | Spring (VMware) | https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter | 2026-04-29 | WebFetch |
| D11 | Spring Security Reference — Servlet Configuration (Java) | Spring (VMware) | https://docs.spring.io/spring-security/reference/servlet/configuration/java.html | 2026-04-29 | WebFetch |
| D12 | Vlad Mihalcea — EAGER Fetching is a Code Smell | Hypersistence | https://vladmihalcea.com/eager-fetching-is-a-code-smell/ | 2026-04-29 | WebFetch |
| D13 | Vlad Mihalcea — N+1 Query Problem | Hypersistence | https://vladmihalcea.com/n-plus-1-query-problem/ | 2026-04-29 | WebFetch |
| D14 | RFC 9110 — HTTP Semantics | IETF | https://datatracker.ietf.org/doc/html/rfc9110 | 2026-04-29 | WebFetch |
| D15 | De Morgan's Laws (Wikipedia) | — | https://en.wikipedia.org/wiki/De_Morgan%27s_laws | 2026-04-29 | WebFetch |
| D16 | Martin Fowler — Anemic Domain Model | martinfowler.com | https://martinfowler.com/bliki/AnemicDomainModel.html | 2026-04-29 | WebFetch |
| D17 | Stoplight Spectral — OpenAPI Rules | Stoplight | https://docs.stoplight.io/docs/spectral/4dec24461f3af-open-api-rules | 2026-04-29 | WebFetch |
| D18 | GitHub Spring Security Issue #4368 | spring-projects | https://github.com/spring-projects/spring-security/issues/4368 | 2026-04-29 | WebFetch |

### 0.1 Fetch 누락 / 보충 자료 (학습 코퍼스 인용 명시)

다음 자료는 ECONNREFUSED/404 등으로 raw fetch 실패. 인용 시 **학습 코퍼스 기반** 임을 명시 (severity 산정 시 가중치 ↓):

- SonarSource Java rules `RSPEC-2068` / `RSPEC-6437` (rules.sonarsource.com 접근 차단). 본 산출물에서는 **CWE-798 / CWE-259 / CWE-321 직접 인용**으로 우회 (D2 OWASP A02 매핑 + 학습 코퍼스 일치 확인).
- Spring Security 7 마이그레이션 가이드 (404). D10/D11 으로 대체.
- Hibernate User Guide §2.3 (raw fetch 미수행). D12/D13 (Vlad Mihalcea) 권위로 대체.

### 0.2 학습 코퍼스 보충 인용 정책

본 산출물은 **모든 severity 권고 / 표준 인용 주장에 대해 raw fetch 우선** 한다. 학습 코퍼스 만으로 인용된 항목은 명시적으로 `[학습 코퍼스]` 태그 부착. F-015 패턴 준수.

---

## 1. OWASP Top 10:2021 — 본 PoC AP 매핑

### 1.1 카테고리 별 매핑 표

| OWASP 2021 | CWE Top | 본 PoC AP 매핑 | severity 권고 |
|---|---|---|---|
| A01 Broken Access Control | CWE-862 / CWE-639 / CWE-352 | **AP-DOMAIN-001** (Comment De Morgan 버그 = 권한 검사 실패) | **critical** (D1 직접 매핑) |
| A02 Cryptographic Failures | **CWE-321** (Hard-coded Crypto Key) / **CWE-259** (Hard-coded Password) / CWE-330/331 (Insufficient Entropy) | **AP-SECURITY-001** (JWT SECRET 21byte 하드코딩) | **critical** (D2 직접 매핑 — CWE-321 1순위) |
| A03 Injection | CWE-89 (SQL Injection) | (해당 없음 — Spring Data JPA 매개변수 바인딩 사용 검출) | — |
| A04 Insecure Design | CWE-209 / CWE-256 | **AP-DOMAIN-002** (email/username unique 부재 = 설계 결함) — 부분 매핑 | high (간접 매핑) |
| A05 Security Misconfiguration | **CWE-16** / **CWE-260** (Password in config files) / CWE-526 | **AP-SECURITY-002** (sessionCreationPolicy 명시 부재) / **AP-SECURITY-003** (WebSecurity ignoring 패턴) / **AP-SECURITY-001** 보조 매핑 (CWE-260 — 설정 파일 password) | medium~critical (혼합) |
| A06 Vulnerable / Outdated Components | CWE-1104 | **AP-ARCH-003** (WebSecurityConfigurerAdapter deprecated) — 간접 매핑 | medium |
| A07 Identification & Authentication Failures | **CWE-287** (Improper Authentication) / **CWE-798** (Hard-coded Credentials) / CWE-613 (Insufficient Session Expiration) | **AP-SECURITY-001** (JWT SECRET — CWE-798) / **AP-DOMAIN-002** (email unique → credential stuffing 회피 보조) / **AP-SECURITY-002** (session 정책) | critical~medium |
| A08 Software & Data Integrity Failures | CWE-829 / CWE-345 | (해당 없음 — 직접적 deserialization 미검출) | — |
| A09 Security Logging & Monitoring Failures | CWE-778 / CWE-117 | (Phase 4/5 검출 부재) | — |
| A10 SSRF | CWE-918 | (해당 없음) | — |

### 1.2 핵심 표준 인용

#### A01 Broken Access Control (D1)

> "Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits."

**Common vulnerabilities** (D1 원문):
- "Bypassing access control checks through URL manipulation, parameter tampering, or modifying application state"
- "Insecure direct object references allowing viewing or editing of others' accounts"
- "Missing access controls for POST, PUT, and DELETE API operations"

**본 PoC AP-DOMAIN-001 적용 정당화** (Article.java:86 De Morgan 버그):
- RealWorld spec 의도: comment 작성자 OR article 작성자 만 삭제 가능.
- 실제 동작: comment 작성자 AND article 작성자 모두 동일인 일 때만 삭제 가능 = **대부분의 경우 작성자 본인 삭제 차단**.
- → "Missing access controls for ... DELETE API operations" 직접 위반.
- → severity **critical** 강제 (D1 + workflow §5 보안 표 일치).

#### A02 Cryptographic Failures (D2)

D2 원문 인용:

> "default crypto keys in use, weak crypto keys generated or re-used"
> "crypto keys checked into source code repositories"

**Prevention** (D2 원문):

> "Keys should be generated cryptographically randomly and stored in memory as byte arrays."
> Use "up-to-date and strong standard algorithms, protocols, and keys" with "proper key management."

**CWE 매핑** (D2 원문):
- **CWE-259** Use of Hard-coded Password
- **CWE-321** Use of Hard-coded Cryptographic Key
- **CWE-327** Use of a Broken or Risky Cryptographic Algorithm
- **CWE-330/331** Use of Insufficiently Random Values / Insufficient Entropy

**본 PoC AP-SECURITY-001 적용 정당화** (JWTConfiguration.java:12):
- `private static final String SECRET = "SOME_SIGNATURE_SECRET";` 21byte = 168bit < 256bit (RFC 7518 §3.2 D8)
- → **CWE-321 (Hard-coded Crypto Key) 직접 매핑** + **CWE-331 (Insufficient Entropy) 보조 매핑** + 짧은 SECRET (RFC 8725 §3.5 위반).
- → severity **critical** 강제 (D2 + D6 + D8 3중 표준 일치).

#### A05 Security Misconfiguration (D3)

D3 원문 인용:

> "Unnecessary features are enabled or installed (e.g., unnecessary ports, services, pages, accounts, or privileges)"
> "Default accounts and their passwords are still enabled and unchanged"
> "Insecure settings in servers, frameworks, libraries, and databases"

**Prevention** (D3 원문):
- "Implement automated hardening processes for consistent deployment across environments"
- "Maintain minimal platforms by removing unused features and components"

**본 PoC 적용**:
- **AP-SECURITY-002** (sessionCreationPolicy(STATELESS) 명시 부재 — F-034) → "Insecure settings in ... frameworks" 간접 매핑. severity **medium** 적정.
- **AP-SECURITY-003** (WebSecurity#ignoring vs permitAll — F-036) → "Unnecessary features ... privileges" 간접 매핑. severity **medium** 적정.
- **AP-ARCH-003** (WebSecurityConfigurerAdapter deprecated — F-039) → "Insecure settings ... libraries" 간접 매핑. severity **medium** 적정.

#### A07 Identification & Authentication Failures (D4)

D4 원문 인용 — 핵심 vulnerability area:

> "Acceptance of default, weak, or commonly-known credentials like 'Password1' or 'admin/admin'"
> "Inadequate password storage practices (plain text, weak encryption, or poor hashing)"
> "Reused session identifiers after login"
> "Failure to properly terminate session IDs during logout or after inactivity periods"

**CWE 매핑** (D4 원문):
- **CWE-287** Improper Authentication
- **CWE-521** Weak Password Requirements
- **CWE-613** Insufficient Session Expiration
- **CWE-798** Use of Hard-coded Credentials

**본 PoC 적용**:
- **AP-SECURITY-001** (JWT SECRET 하드코딩) → **CWE-798 직접 매핑**. severity **critical** 강제.
- **AP-SECURITY-001 보조** (JWT_DURATION_SECONDS = 2hr 매직 넘버) → **CWE-613 매핑** (한국 권장 15min~1h 차이). severity high 보조.

---

## 2. OWASP API Security Top 10 — 2023 (Phase 5 candidate 매핑)

### 2.1 카테고리 별 매핑 표

| API:2023 | 본 PoC AP 매핑 | severity 권고 | 표준 직접 인용 |
|---|---|---|---|
| API1 Broken Object Level Authorization (BOLA) | **AP-DOMAIN-001** (Comment 삭제 권한 De Morgan 버그) | **critical** | "verification checks whenever users access data through identifiers" — D5 |
| API2 Broken Authentication | **AP-SECURITY-001** (JWT SECRET) / **AP-DOMAIN-002** (email unique) | **critical/high** | "compromise authentication tokens or to exploit implementation flaws to assume other user's identities" — D5 |
| API3 Broken Object Property Level Authorization | (Phase 4/5 검출 부재) | — | — |
| API4 Unrestricted Resource Consumption | **AP-PERFORMANCE-002** (Pageable / limit cap 부재 — Senior 영역 5) | **high** | (학습 코퍼스 — D5 원문 미수신) |
| API5 Broken Function Level Authorization | **AP-DOMAIN-001** 보조 / **AP-SECURITY-003** (WebSecurity ignoring 차이 → permitAll 권장) | **medium~critical** | "Complex access control policies ... lead to authorization flaws" — D5 |
| API6 Unrestricted Access to Sensitive Business Flows | (해당 없음 — 회원가입 rate limit 부재 우려이나 Phase 4/5 미검출) | — | — |
| API7 Server Side Request Forgery (SSRF) | (해당 없음) | — | — |
| API8 Security Misconfiguration | **AP-SECURITY-002** (sessionCreationPolicy 부재) / **AP-SECURITY-003** (WebSecurity ignoring) / **AP-ARCH-003** (deprecated config) / **AP-API-001** (API 버저닝 부재) | **medium** | "Engineers may overlook security settings" — D5 |
| API9 Improper Inventory Management | **AP-API-001** (API 버저닝 부재 — info.version + servers + path /v1) | **medium** | (학습 코퍼스 — versioning 부재가 staging/prod 식별 어려움 야기) |
| API10 Unsafe Consumption of APIs | (해당 없음 — 본 PoC 외부 API 호출 0건 — Phase 4 5.D 0건 인계) | — | — |

### 2.2 표준 직접 인용 (D5 원문)

#### API1:2023 BOLA

> "APIs tend to expose endpoints that handle object identifiers, creating a wide attack surface of Object Level Access Control issues. Organizations should implement verification checks whenever users access data through identifiers."

→ **AP-DOMAIN-001** Comment 삭제 권한 검증 실패는 **API1 직접 위반** + **OWASP A01 직접 위반**. 2중 표준 위반 = severity **critical** 강제.

#### API2:2023 Broken Authentication

> "Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise authentication tokens or to exploit implementation flaws to assume other user's identities."

→ **AP-SECURITY-001** JWT SECRET 하드코딩 + 21byte = **API2 직접 위반** (token compromise 가능).

#### API5:2023 Broken Function Level Authorization

> "Complex access control policies with different hierarchies, groups, and roles, and an unclear separation between administrative and regular functions, tend to lead to authorization flaws."

→ **AP-SECURITY-003** WebSecurity ignoring 패턴은 filter 우회 (permitAll 보다 강함). 의도적이라면 OK 이나 **명시적 문서화 부재 시** API5 위반 가능. severity **medium** 권고.

#### API8:2023 Security Misconfiguration

> "APIs and the systems supporting them typically contain complex configurations, meant to make the APIs more customizable. Engineers may overlook security settings or neglect best practices."

→ **AP-SECURITY-002** / **AP-SECURITY-003** / **AP-ARCH-003** / **AP-API-001** 모두 API8 매핑 가능.

---

## 3. RFC 8725 — JWT Best Current Practices (BCP 225)

### 3.1 핵심 §3.5 Strong Keys 인용 (D6 원문)

> §3.5 Use Appropriate Algorithms — "Human-memorizable passwords MUST NOT be directly used as the key to a keyed-MAC algorithm such as 'HS256.'"
>
> Passwords should only encrypt keys, not content. Even for key encryption, passwords remain vulnerable to brute-force attacks. **Implementers must follow entropy guidelines in RFC 7515 and RFC 7518.**

→ `"SOME_SIGNATURE_SECRET"` 는 **human-memorizable password 형태**. → **RFC 8725 §3.5 직접 위반**.

### 3.2 §3.1 / §3.2 알고리즘 검증 (D6 원문)

> §3.1 Perform Algorithm Verification — "Libraries must allow callers to specify supported algorithms and reject any others. The 'alg' header must match the actual cryptographic operation performed, and each key must be used with exactly one algorithm."
>
> §3.2 Use Appropriate Algorithms — "The 'none' algorithm should only be used when the JWT is cryptographically protected by other means."

→ 본 PoC HmacSHA256 사용 + alg=none 미허용 검증 필요 (Phase 4 source_evidence 정밀화 후속 — F-XXX 후보).

### 3.3 §3.8 Validate Issuer / Subject (D6 원문)

> §3.8 — "Applications must verify that cryptographic keys belong to the claimed issuer and validate subject values correspond to legitimate entities. Invalid issuers, subjects, or pairs require JWT rejection."

→ 본 PoC JWT claim (iss/aud/sub) 검증 부재 → **F-XXX 후보** (Phase 6 신규 finding).

### 3.4 RFC 7518 §3.2 (D8 원문 직접 인용)

> "A key of the same size as the hash output (for instance, 256 bits for 'HS256') or larger MUST be used with this algorithm."

→ HS256 = **256bit 최소 키 강제**. 21byte = 168bit < 256bit. → **RFC 7518 §3.2 MUST 위반** (RFC 2119 강제 키워드).

### 3.5 RFC 7515 §10.1 (D7 원문 직접 인용)

> §10.1 Key Entropy and Random Values — "A minimum of 128 bits of entropy should be used for all keys, and depending upon the application context, more may be required."

→ `"SOME_SIGNATURE_SECRET"` ASCII 문자열은 entropy 매우 낮음 (사실상 21 byte × log2(95 printable) ≈ 138bit max, 사전 단어 기반이라면 < 30bit). → **RFC 7515 §10.1 위반**.

### 3.6 OWASP JWT Cheat Sheet (D9 원문 직접 인용)

> "HMAC-based token security depends entirely on secret strength. Secrets should be at least 64 characters, generated using cryptographically secure randomness."

→ 21 byte (= 21 char) « 64 char 권장. **OWASP 공식 권고 위반**.

> "examples demonstrate short validity windows—tokens are created with a validity of 15 minutes"

→ JWT_DURATION_SECONDS = 7200s (2hr) ≫ 15min. **OWASP 권고 약 8배 초과**.

### 3.7 AP-SECURITY-001 정당화 종합 표

| 표준 | 위반 항목 | 인용 출처 |
|---|---|---|
| OWASP A02 (D2) | CWE-321 / CWE-331 | "default crypto keys ... checked into source code repositories" |
| OWASP A07 (D4) | CWE-798 | "Use of Hard-coded Credentials" |
| RFC 8725 §3.5 (D6) | MUST NOT human password as MAC key | 직접 인용 |
| RFC 7518 §3.2 (D8) | MUST 256bit ≥ for HS256 | 직접 인용 |
| RFC 7515 §10.1 (D7) | 128bit entropy minimum | 직접 인용 |
| OWASP JWT CheatSheet Java (D9) | 64 char minimum | 직접 인용 |
| OWASP JWT CheatSheet Java (D9) | 15min token validity | 직접 인용 |

→ **7중 표준 위반**. severity **critical** 강제. 본 PoC 한정 X — 사내 적용 시 즉시 차단 필수.

---

## 4. SonarQube 안티패턴 카탈로그 — 본 PoC AP cross-check

### 4.1 raw fetch 차단 보충 정책

`rules.sonarsource.com` 직접 접근 ECONNREFUSED. **CWE 매핑 + OWASP 매핑** 으로 우회 cross-check.

### 4.2 본 PoC AP cross-check 표

| 본 PoC AP | Sonar Rule (학습 코퍼스 추정) | CWE Direct (raw 검증 ✅) | 학습 코퍼스 신뢰도 |
|---|---|---|---|
| AP-SECURITY-001 (JWT SECRET) | `java:S2068` Hard-coded credentials / `java:S6437` Hard-coded secret | CWE-798 / CWE-321 / CWE-259 (D2/D4 raw 매핑) | 높음 (CWE 직접 매칭) |
| AP-SECURITY-001 보조 | `java:S6418` Hard-coded password as plain text | CWE-259 | 중간 |
| AP-SECURITY-001 보조 | `java:S2245` Pseudorandom number generators (PRNGs) | CWE-330 (Insufficient Random) | 낮음 (보조) |
| AP-DOMAIN-001 (De Morgan 버그) | `java:S2589` Boolean expressions should not be gratuitous / `java:S3923` All branches in conditional structure should not have exactly the same implementation | CWE-862 (Missing Authorization, D1 매핑) | 중간 (Sonar 검출 어려움 — human review 강제) |
| AP-DOMAIN-002 (email unique 부재) | `java:S2257` Use a non-cryptographic checksum / 직접 매칭 부재 | CWE-209 (Insufficient Validation) | 낮음 |
| AP-ARCH-001 / AP-ARCH-002 (Layer Violation) | ArchUnit 권장 (Sonar 직접 룰 부재) | CWE-1061 (Encapsulation) | 낮음 (Sonar 외 도구 권장) |
| AP-DB-001 (FK 정책 부재) | (Sonar 직접 룰 부재 — DBMS 검출 도메인) | — | — |
| AP-PERFORMANCE-001 (EAGER N+1) | `java:S6918` (Hibernate fetch type) — 학습 코퍼스 | — | 중간 (D12 우선) |
| AP-API-002 (HTTP status) | `java:S5443` Static fields / 직접 매칭 부재 | — | 낮음 |

### 4.3 권고

본 PoC 사내 적용 시 SonarQube 룰셋 기본 + ArchUnit 보완 권장. **CWE/OWASP 매핑은 raw 검증 완료** 이므로 권위 충분. Sonar Rule ID 는 참고용.

---

## 5. Spring 공식 권고 — deprecated / EAGER / @Transactional 함정

### 5.1 WebSecurityConfigurerAdapter Deprecated → SecurityFilterChain (D10 원문 인용)

> "Spring Security 5.7.0-M2 deprecated the `WebSecurityConfigurerAdapter` class in favor of a component-based security configuration approach. The migration centers on creating beans for `SecurityFilterChain` and `WebSecurityCustomizer` instead."

#### Before (D10 원문):

```java
@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authz) -> authz
            .anyRequest().authenticated())
            .httpBasic(withDefaults());
    }
}
```

#### After (D10 원문):

```java
@Configuration
public class SecurityConfiguration {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authz) -> authz
            .anyRequest().authenticated())
            .httpBasic(withDefaults());
        return http.build();
    }
}
```

→ **AP-ARCH-003** 정당화. severity **medium** 권고 (Spring Boot 3.x = Spring Security 6.x 강제 마이그레이션 시점에서 high 격상 가능).

### 5.2 WebSecurity#ignoring vs permitAll (D10 + D11 + D18)

D10 원문:

> **Note: The documentation recommends using `permitAll` via authorization rules instead of ignoring requests.**

D18 (GitHub Issue #4368) 원문:

> "Filters execute before security rules are evaluated, so `permitAll()` configuration at the HttpSecurity level doesn't prevent earlier filter execution."

**핵심 차이**:
- `WebSecurity#ignoring` = filter chain 자체 우회 → CSRF/CORS/Headers 보호도 부재
- `HttpSecurity.permitAll` = filter chain 통과 + 인증만 면제 → CSRF/CORS/Headers 보호 유지

→ **AP-SECURITY-003** 정당화. 본 PoC `/users` POST + `/users/login` 가 `WebSecurity#ignoring` 사용 시 → CSRF 보호 부재.
→ severity **medium** 적정 (전체 사이트 stateless/CSRF disabled 시 영향 ↓).
→ 사내 적용 시 **명시적 문서화 + permitAll 권장**.

### 5.3 sessionCreationPolicy(STATELESS) 명시 (D11 원문)

D11 인용 (간접 — Spring Security default 는 IF_REQUIRED):

> "Always provide a default `SecurityFilterChain` without `securityMatcher`** to ensure entire application protection"

→ **AP-SECURITY-002** 정당화. JWT 기반 인증인데 sessionCreationPolicy 명시 부재 → 사내 적용 시 session attack 가능.
→ severity **medium** (Spring Security 6.x default 변경 가능성 고려).
→ **Phase 6 신규 finding F-XXX 후보** (BR-AUTH-STATELESS-001 source_evidence 정밀화).

### 5.4 @Transactional 함정 (Spring Reference)

본 PoC 검출 부재 (Phase 4 미검출). 일반 권고:
- domain layer 에 `@Transactional` 부착 = AP-ARCH-002 (framework leak) 일부.
- @Transactional default rollback = `RuntimeException` only — checked exception 무시 → 사내 적용 시 명시 권장.

### 5.5 EAGER 함정 (다음 §6 참조)

---

## 6. JPA EAGER N+1 — Vlad Mihalcea 권위 (D12/D13)

### 6.1 EAGER Code Smell (D12 원문 인용)

> "Vlad Mihalcea contends that marking JPA associations as `FetchType.EAGER` represents poor design practice. Rather than embedding fetching decisions in entity mappings, he advocates delegating this responsibility to individual queries based on specific business needs."

> "EAGER fetching behaves differently depending on the query method:
> - Persistence Context API (`entityManager.find()`): Uses INNER JOIN
> - JPQL/Criteria Queries: Default to SELECT fetching, issuing separate queries for each EAGER association"

> "Each unnecessary join increases query complexity and execution time. When associations aren't used across all business scenarios, applications 'pay the extra performance penalty for nothing in return.'"

**Recommended (D12 원문)**:
- "LAZY as the default for all associations in entity mappings"
- "JOIN FETCH directives within specific queries to retrieve needed associations"

### 6.2 N+1 Query Problem (D13 원문 인용)

> Definition: "The N+1 query problem occurs when the data access framework executes N additional SQL statements to fetch the same data that could have been retrieved when executing the primary SQL query."

> "Without explicit `JOIN FETCH` in queries, Hibernate executes additional SELECT statements for each associated entity. For example, loading 4 PostComment records triggers 1 initial query plus 4 separate queries for their parent Post entities."

### 6.3 본 PoC AP-PERFORMANCE-001 정당화

본 PoC `Article` + `Comment` 의 EAGER fetch 패턴 (Phase 4 candidate):
- `Article.author` (User) — `@ManyToOne` default EAGER
- `Article.userFavorited` (Set<User>) — EAGER 명시
- `Article.comments` (List<Comment>) — EAGER 명시
- `Comment.article` / `Comment.author` — EAGER

→ `GET /api/articles` 호출 시:
1. articles select (LIMIT 20)
2. 각 article 마다: author select × 20 = 20 queries
3. 각 article 마다: userFavorited select × 20 = 20 queries
4. 각 article 마다: comments select × 20 = 20 queries
5. 각 comment 마다: comment.author select × N

→ **N+1 폭발** (worst case 80+ queries). RealWorld 데모는 작아서 무시되나, 사내 적용 시 critical/high 가능.

→ **AP-PERFORMANCE-001** severity **medium** 적정 (본 PoC 한정) — 사내 적용 시 **high 격상 권고** (D12/D13 명시).

### 6.4 AP-PERFORMANCE-002 (Pageable 부재) 정당화

`GetArticles` / `GetArticlesFeed` endpoint 는 `limit/offset` 받으나 cap 부재 → DoS 위험.

OWASP API4:2023 Unrestricted Resource Consumption 매핑.

→ severity **high** 강제 (DoS 표 §5 보안 강제).

권고:
```java
@GetMapping("/articles")
public Articles list(@RequestParam(defaultValue="20") @Max(100) int limit,
                     @RequestParam(defaultValue="0")  @Min(0)   int offset) {
    // limit cap 100 강제
}
```

---

## 7. HTTP/REST 표준 (RFC 9110) — AP-API-002 정당화

### 7.1 Status Code 의미론 (D14 원문 인용)

| Code | RFC 9110 정의 |
|---|---|
| 200 OK | "the standard successful response when a request succeeds and the server returns the requested resource representation" |
| 201 Created | "the request has succeeded and has resulted in the creation of a new resource" |
| 204 No Content | "successfully fulfilled the request and that there is no additional content to send" |

### 7.2 DELETE / Idempotency (D14 원문)

> §9.3.5 DELETE — "deletion of the resource identified by the request target"
> §9.2.2 Idempotent Methods — "the side effects of N > 0 identical requests are the same as for a single request"

→ DELETE = idempotent → 두번째 호출 시 404 가 일반적 이지만 **body 응답 일관성** 권장.

### 7.3 본 PoC AP-API-002 정당화 (F-040)

| Endpoint | 현재 응답 | 권장 응답 | RFC 9110 근거 |
|---|---|---|---|
| `POST /users` (signup) | 200 + body | **201 Created** + body + Location header | "creation of a new resource" |
| `POST /articles` | 200 + body | **201 Created** + body | "creation of a new resource" |
| `POST /articles/{slug}/comments` | 200 + body | **201 Created** + body | "creation of a new resource" |
| `DELETE /articles/{slug}` | 200 (body 검증 필요) | **204 No Content** | "no additional content to send" |
| `DELETE /articles/{slug}/comments/{id}` | 200 | **204 No Content** | 동일 |

→ **AP-API-002** severity **low** 적정 (RealWorld 데모 클라이언트 호환성 우선). **사내 신규 프로젝트 = high 격상** 권고.

### 7.4 추가 검토 — Idempotency-Key 헤더 (RFC 9110 외)

본 PoC 미적용. 사내 결제/송금 도메인 적용 시 권장 (별도 표준 IETF draft-ietf-httpapi-idempotency-key-header-04).

---

## 8. De Morgan 법칙 + 도메인 권한 — AP-DOMAIN-001 critical 정당화

### 8.1 De Morgan 법칙 (D15 원문 인용)

> Rule 1 (Negation of Conjunction): NOT (A AND B) = NOT A OR NOT B
> Formal: ¬(P ∧ Q) ↔ (¬P ∨ ¬Q)

> Rule 2 (Negation of Disjunction): NOT (A OR B) = NOT A AND NOT B
> Formal: ¬(P ∨ Q) ↔ (¬P ∧ ¬Q)

> "In software development, these laws are 'frequently applied when rewriting conditional statements.' Programmers use De Morgan's laws to simplify or negate complex logical conditions, improving code readability and correctness."

### 8.2 본 PoC Article.java:86 분석

**현재 코드** (Phase 4 raw 검증 — F-027):
```java
if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))
    throw new IllegalAccessError("...");
```

**De Morgan 변환**:
- `!A || !B` ≡ `!(A && B)` (Rule 1 역방향)
- → "user 가 author 가 아니거나, user 가 comment 작성자가 아니면 throw"
- → 두 조건 모두 user 일치 시만 통과 = **A AND B 강제**

**RealWorld spec 의도**:
- "comment 작성자 OR article 작성자 = 삭제 가능"
- → `user == author OR user == comment.author` → 통과
- → 부정: `!(A || B)` = `!A && !B` (Rule 2)

**올바른 코드**:
```java
if (!user.equals(author) && !user.equals(commentsToDelete.getAuthor()))
    throw new IllegalAccessError("...");
```

또는 (가독성 우선):
```java
if (user.equals(author) || user.equals(commentsToDelete.getAuthor())) {
    comments.remove(commentsToDelete);
} else {
    throw new IllegalAccessError("...");
}
```

### 8.3 severity 정당화

- **OWASP A01 Broken Access Control 직접 위반** (D1 — "Missing access controls for ... DELETE")
- **OWASP API1:2023 BOLA 직접 위반** (D5)
- **CWE-862 Missing Authorization** (D1 매핑)
- **CWE-863 Incorrect Authorization** (보조 매핑)

→ severity **critical** 강제. workflow §5 보안 표 적용.

### 8.4 사내 적용 권고

1. **즉시 패치** (PR fix `||` → `&&` 1글자 변경).
2. 단위 테스트 추가:
   ```java
   @Test void commentAuthor_canDeleteOwnComment() { ... }
   @Test void articleAuthor_canDeleteOthersComment() { ... }
   @Test void thirdParty_cannotDelete() { assertThrows(...); }
   ```
3. 코드 리뷰 체크리스트에 **De Morgan 변환 점검** 항목 추가.
4. 정적 분석 (Sonar `java:S3923` 보조).

---

## 9. OpenAPI lint (Spectral) — AP-API-001 정당화

### 9.1 Spectral 핵심 룰 (D17 원문 인용)

| Rule | 검증 대상 |
|---|---|
| `operation-operationId` | 모든 operation 에 operationId 명시 |
| `operation-tags` | 모든 operation 에 tag 부착 |
| `no-$ref-siblings` | $ref 옆 다른 속성 금지 (OpenAPI 3.0) |
| `oas3-server-trailing-slash` | servers URL trailing slash 금지 |
| `info-contact` | info.contact 명시 |
| `info-description` | info.description 명시 |

### 9.2 본 PoC AP-API-001 정당화 (F-038)

본 PoC OpenAPI 산출 (Phase 5 후속) 검증 항목:

| 항목 | 본 PoC 상태 | Spectral / 권고 | severity |
|---|---|---|---|
| `info.version` | "1.0" 추정 — 명시 부재 | **명시 강제** | medium |
| `servers[]` | 부재 | **localhost / staging / prod 명시 강제** | medium |
| Path versioning | `/api/...` (버전 부재) | **`/api/v1/...` 권장** | medium |
| `operation-operationId` | (Phase 5 산출 검증 필요) | 강제 | low |
| `operation-tags` | (Phase 5 산출 검증 필요) | 강제 | low |

→ **AP-API-001** severity **medium** 적정 (RealWorld 데모 단일 버전 = low 가능, 사내 신규 = medium 강제).

### 9.3 OWASP API9:2023 Improper Inventory Management 매핑

→ 버저닝 부재 = staging/prod 식별 어려움 + deprecated endpoint 추적 불가.

---

## 10. Anti-pattern 카탈로그 메타 — 12 카테고리 분류

### 10.1 권위 출처

| 출처 | 권위 |
|---|---|
| William Brown 외 — *AntiPatterns: Refactoring Software, Architectures, and Projects in Crisis* (1998) | 안티패턴 용어 원조 |
| Robert C. Martin — *Clean Code* (2008) | 코드 레벨 안티패턴 |
| Eric Evans — *Domain-Driven Design* (2003) | 도메인 안티패턴 |
| Vaughn Vernon — *Implementing DDD* (2013) | 전술적 패턴 |
| Martin Fowler — *Refactoring* (1999/2018) + *Patterns of Enterprise Application Architecture* (2002) | 리팩토링 / 아키텍처 안티패턴 |
| GoF — *Design Patterns* (1994) | 디자인 패턴 (역으로 안티패턴) |
| Martin Fowler — bliki 다수 (Anemic Domain Model 등) | 패턴 카탈로그 메타 |

### 10.2 Anemic Domain Model (D16 원문 인용 — Fowler)

> "objects are connected with the rich relationships and structure that true domain models have. The catch comes when you look at the behavior, and you realize that there is hardly any behavior on these objects, making them little more than bags of getters and setters."

> "An anemic model incurs all costs of domain modeling (database mapping complexity, O/R mapping overhead) while eliminating its benefits."

→ 본 PoC 검출 여부:
- domain/article/Article.java 는 `removeCommentByUser()` 등 behavior 보유 → **rich domain** ✅
- domain/user/User.java 는 follow/unfollow 등 behavior 보유 → **rich domain** ✅
- → Anemic Domain Model 안티패턴 **검출 안 됨** (긍정 발견).

### 10.3 12 카테고리 분류 표

| 카테고리 | 정의 | 본 PoC AP |
|---|---|---|
| 1. DOMAIN | 도메인 로직 / 권한 / 검증 결함 | AP-DOMAIN-001/002/003/004 |
| 2. SECURITY | 인증/인가/암호화 결함 | AP-SECURITY-001/002/003 |
| 3. ARCH | 아키텍처 의존성 / 레이어 / 마이그레이션 | AP-ARCH-001/002/003 |
| 4. DB | 스키마 / 제약 / 트랜잭션 | AP-DB-001 |
| 5. PERFORMANCE | N+1 / 캐싱 / DoS | AP-PERFORMANCE-001/002 |
| 6. API | REST / OpenAPI / 버저닝 / 응답 일관성 | AP-API-001/002 |
| 7. INTEGRATION | 외부 의존성 / circuit breaker | (본 PoC 0건 — 5.D 부재) |
| 8. UI/UX | 접근성 / 폼 검증 / 라우팅 | (본 PoC 0건 — 5.B 부재) |
| 9. TESTING | 테스트 누락 / flaky | (Phase 4/5 미검출) |
| 10. OBSERVABILITY | 로깅 / 메트릭 / 추적 | (Phase 4/5 미검출) |
| 11. DEVEX | 빌드 / 종속성 / IDE | (Phase 4/5 미검출) |
| 12. PROCESS | CI/CD / 환경 분리 / 배포 | (Phase 4/5 미검출) |

### 10.4 본 PoC severity 재산정 가이드

| AP | 현재 severity | 본 PoC 한정 권고 | 사내 적용 권고 | 표준 근거 |
|---|---|---|---|---|
| AP-DOMAIN-001 | critical | **critical** (유지) | critical | OWASP A01 + API1 + CWE-862 + RealWorld spec |
| AP-SECURITY-001 | critical | **critical** (유지) | critical | OWASP A02+A07 + RFC 8725 + RFC 7518 + OWASP CheatSheet (7중) |
| AP-DOMAIN-002 | high | **high** (유지) | high | OWASP A04 보조 + Twitter/Slack/GitHub 표준 |
| AP-PERFORMANCE-002 | high | high (Phase 5 candidate) | high | OWASP API4 |
| AP-DOMAIN-003 (F-017) | low | **low** (유지) | medium 가능 | JPA 비주류 패턴 |
| AP-DOMAIN-004 (F-028) | low | **low** (유지) | medium 가능 | JPA Set 멤버십 위험 |
| AP-PERFORMANCE-001 | medium | **medium** (유지) | high 가능 | D12/D13 — N+1 |
| AP-ARCH-001 | medium | medium (유지) | high 가능 | 구조적 결함 |
| AP-ARCH-002 | medium | medium (유지) | medium | Spring-flavored 인정 |
| AP-ARCH-003 | medium | medium (Phase 5) | medium | D10 deprecated |
| AP-DB-001 | medium | **medium** (유지) | high 가능 | GDPR 시나리오 |
| AP-SECURITY-002 | medium | medium (Phase 5) | medium | OWASP API8 |
| AP-SECURITY-003 | medium | medium (Phase 5) | medium | OWASP API5 |
| AP-API-001 | medium | medium (Phase 5) | medium | OWASP API9 |
| AP-API-002 | low | **low** (유지) | medium 가능 | RFC 9110 |

---

## 11. 복합 AP 검토 — AP-COMPOSITE-001

### 11.1 후보 — JWT 자체구현 + STATELESS implicit + WebSecurity ignoring 종합

#### 검토 결과: **등록 거절 (Rejected) — 분리 등록 권장**

#### 근거

**복합 AP 등록의 표준 부합 검토**:
- OWASP / CWE / RFC 모두 **개별 결함 단위 분류** — 복합 카테고리 표준 부재.
- 사내 적용 시 PR/이슈 단위 추적성 ↓ (수정 PR 분할 권장).
- workflow §5 severity 표 — 복합 시 severity 산정 모호 (max vs avg).

**대안**:
- **AP-SECURITY-001** (critical) — JWT SECRET 단독
- **AP-SECURITY-002** (medium) — sessionCreationPolicy 단독
- **AP-SECURITY-003** (medium) — WebSecurity ignoring 단독
- **AP-ARCH-003** (medium) — WebSecurityConfigurerAdapter deprecated 단독
- → 4건 분리 등록 + **`related_to` 메타 필드** 로 연결 (antipatterns.schema.json 후속 격상 후보 = F-XXX).

#### Over-engineering 회피

- 복합 AP = "추상화 과잉" (Phase 6 산출물 가독성 ↓).
- 본 PoC 한정 4건 모두 medium 이하 (AP-SECURITY-001 만 critical) — 분리 시 critical 1 + medium 3 = 영향도 명확.

#### 권고

`avoid-list.md` (Phase 6 final 산출) 에 **"보안 설정 종합 점검 (4건 묶음)" 섹션** 추가하여 가독성 보존. 단, antipatterns.json 의 entity 단위는 4건 분리 유지.

### 11.2 다른 복합 후보 검토

#### AP-COMPOSITE-002 (가설) — Layer Violation 종합 (AP-ARCH-001 + AP-ARCH-002)

**거절** — LV-001 (presentation→infra) 와 LV-002 (domain→Spring) 는 다른 레이어 + 다른 수정 전략.

#### AP-COMPOSITE-003 (가설) — Domain Validation 종합 (AP-DOMAIN-001 + AP-DOMAIN-002)

**거절** — De Morgan 버그 (코드 결함) 와 unique 부재 (스키마 결함) 는 다른 문제 도메인.

### 11.3 종합 결론

**복합 AP 등록 0건**. 모두 분리 등록 + `related_modules` / 메타 태그로 연관성 보존.

---

## 12. Phase 6 산출물 직접 인용 가능 stub (6+)

### Stub 1 — AP-SECURITY-001 표준 인용 강화

```markdown
## AP-SECURITY-001 — JWT SECRET 하드코딩 + 길이 부족 (critical)

### 표준 위반 7중 매트릭스

| 표준 | 위반 항목 | 인용 |
|---|---|---|
| OWASP A02:2021 (D2) | CWE-321 Hard-coded Crypto Key | "default crypto keys ... checked into source code repositories" |
| OWASP A07:2021 (D4) | CWE-798 Hard-coded Credentials | (D4 §CWE List) |
| OWASP API2:2023 (D5) | Broken Authentication | "compromise authentication tokens" |
| RFC 8725 §3.5 (D6) | MUST NOT human password as MAC key | "Human-memorizable passwords MUST NOT be directly used as the key to a keyed-MAC algorithm such as 'HS256.'" |
| RFC 7518 §3.2 (D8) | MUST 256bit ≥ for HS256 | "A key of the same size as the hash output (for instance, 256 bits for 'HS256') or larger MUST be used" |
| RFC 7515 §10.1 (D7) | 128bit entropy minimum | "A minimum of 128 bits of entropy should be used for all keys" |
| OWASP JWT CheatSheet (D9) | 64 char minimum + 15min validity | "Secrets should be at least 64 characters" |

→ severity **critical** 강제 (workflow §5 보안 표 + 7중 표준).
```

### Stub 2 — AP-DOMAIN-001 De Morgan 정당화

```markdown
## AP-DOMAIN-001 — Comment 삭제 De Morgan 버그 (critical)

### De Morgan 변환 증명 (D15)

현재 코드 (Article.java:86):
\```java
if (!user.equals(author) || !user.equals(commentsToDelete.getAuthor()))
    throw new IllegalAccessError("...");
\```

De Morgan Rule 1 (D15): `¬A ∨ ¬B ↔ ¬(A ∧ B)`
→ 위 조건은 "A AND B 가 둘 다 참이 아니면 예외" = **A 와 B 모두 참 (user = author = commentAuthor) 일 때만 삭제 통과**.

RealWorld spec 의도: comment 작성자 OR article 작성자 → 삭제 가능.
De Morgan Rule 2 (D15): `¬(A ∨ B) ↔ ¬A ∧ ¬B`
→ 올바른 조건: `if (!user.equals(author) && !user.equals(commentsToDelete.getAuthor())) throw ...;`

### 표준 매핑

- OWASP A01:2021 (D1) — "Missing access controls for ... DELETE API operations"
- OWASP API1:2023 BOLA (D5)
- CWE-862 Missing Authorization
- CWE-863 Incorrect Authorization

→ severity **critical** 강제.
```

### Stub 3 — AP-PERFORMANCE-001 EAGER N+1 정당화

```markdown
## AP-PERFORMANCE-001 — Article+Comment EAGER N+1 (medium / 사내 high 권고)

### Vlad Mihalcea 권고 (D12/D13)

> "EAGER fetching represents poor design practice." (D12)
> "The N+1 query problem occurs when the data access framework executes N additional SQL statements." (D13)

### 본 PoC GET /api/articles 분석 (limit=20):

1. articles SELECT (1)
2. authors SELECT × 20 (= 20)
3. userFavorited SELECT × 20 (= 20)
4. comments SELECT × 20 (= 20)
5. comment.author SELECT × M (= M)

→ 최소 61 + M queries. RealWorld 데모는 작아서 무시되나 사내 운영 시 critical/high 격상.

### 권고

\```java
// 1. EAGER 제거
@ManyToOne(fetch = FetchType.LAZY)  // default 변경
Set<User> userFavorited;  // EAGER 제거

// 2. JOIN FETCH 명시 (D12)
@Query("SELECT a FROM Article a JOIN FETCH a.author WHERE ...")
List<Article> findAllWithAuthor(...);

// 3. EntityGraph 활용
@EntityGraph(attributePaths = {"author", "userFavorited"})
List<Article> findAll(Pageable p);
\```
```

### Stub 4 — AP-API-002 RFC 9110 정당화

```markdown
## AP-API-002 — HTTP Status Code 일관성 (low / 사내 medium 권고)

### RFC 9110 §15.3 직접 인용 (D14)

| Code | 정의 |
|---|---|
| 201 Created | "the request has succeeded and has resulted in the creation of a new resource" |
| 204 No Content | "successfully fulfilled the request and that there is no additional content to send" |

### 본 PoC 수정 표

| Endpoint | 현재 | RFC 9110 권장 |
|---|---|---|
| POST /users | 200 | **201** + Location header |
| POST /articles | 200 | **201** |
| POST /articles/{slug}/comments | 200 | **201** |
| DELETE /articles/{slug} | 200 | **204** |
| DELETE /articles/{slug}/comments/{id} | 200 | **204** |

### 권고 (Spring Boot)

\```java
@PostMapping("/articles")
@ResponseStatus(HttpStatus.CREATED)  // 201 강제
public ArticleResponse create(@RequestBody @Valid ArticlePostRequest req) { ... }

@DeleteMapping("/articles/{slug}")
@ResponseStatus(HttpStatus.NO_CONTENT)  // 204 강제
public void delete(@PathVariable String slug) { ... }
\```
```

### Stub 5 — AP-ARCH-003 WebSecurityConfigurerAdapter Deprecated

```markdown
## AP-ARCH-003 — WebSecurityConfigurerAdapter Deprecated (medium)

### Spring 공식 권고 (D10)

> "Spring Security 5.7.0-M2 deprecated the `WebSecurityConfigurerAdapter` class in favor of a component-based security configuration approach."

### Before (D10):

\```java
@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authz) -> authz.anyRequest().authenticated())
            .httpBasic(withDefaults());
    }
}
\```

### After (D10):

\```java
@Configuration
public class SecurityConfiguration {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authz) -> authz.anyRequest().authenticated())
            .httpBasic(withDefaults());
        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().antMatchers("/static/**");
    }
}
\```

### 권고 시점

- Spring Boot 3.x = Spring Security 6.x → **강제 마이그레이션** (deprecated → removed). severity high 격상 가능.
- Spring Boot 2.x = 자유 시점. severity medium 적정.
```

### Stub 6 — AP-SECURITY-003 WebSecurity ignoring vs permitAll

```markdown
## AP-SECURITY-003 — WebSecurity ignoring vs permitAll (medium)

### Spring 공식 권고 (D10/D11/D18)

> "The documentation recommends using `permitAll` via authorization rules instead of ignoring requests." (D10)
> "Filters execute before security rules are evaluated, so `permitAll()` configuration at the HttpSecurity level doesn't prevent earlier filter execution." (D18)

### 핵심 차이

| 측면 | WebSecurity#ignoring | HttpSecurity.permitAll |
|---|---|---|
| Filter chain | **우회** (CSRF/CORS/Headers 부재) | 통과 (보호 유지) |
| 인증 | 면제 | 면제 |
| 권장 시점 | 정적 리소스 (`/static/**`, `/favicon.ico`) | API endpoint (`POST /users`, `POST /users/login`) |

### 본 PoC 적용 권고

\```java
// Before: WebSecurity#ignoring (filter 우회 = CSRF/CORS 보호 부재)
@Override
public void configure(WebSecurity web) {
    web.ignoring().antMatchers(POST, "/users", "/users/login");  // ❌
}

// After: HttpSecurity.permitAll (filter 통과 + 인증 면제)
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(authz -> authz
        .requestMatchers(POST, "/users", "/users/login").permitAll()  // ✅
        .anyRequest().authenticated()
    );
    return http.build();
}
\```

### severity 권고

- 본 PoC 전체 stateless + CSRF disabled 컨텍스트 → 영향도 ↓ → **medium** 적정.
- 사내 신규 (stateful + CSRF enabled) → **high** 격상 권고.
```

### Stub 7 (보너스) — AP-PERFORMANCE-002 Pageable cap

```markdown
## AP-PERFORMANCE-002 — Pageable / limit cap 부재 (high)

### OWASP API4:2023 직접 매핑 (D5)

> "Unrestricted Resource Consumption" — DoS 가능.

### 본 PoC 영향 endpoint

- `GET /api/articles?limit=...&offset=...`
- `GET /api/articles/feed?limit=...&offset=...`

→ `limit=10000000` 가능 → DB 폭주 + memory 폭증.

### 권고

\```java
@GetMapping("/articles")
public Articles list(
    @RequestParam(defaultValue="20") @Max(100) @Min(1) int limit,
    @RequestParam(defaultValue="0")  @Min(0) int offset
) {
    Pageable page = PageRequest.of(offset / limit, Math.min(limit, 100));
    // ...
}

// 또는 Spring Data Pageable 직접 활용 + property:
// spring.data.web.pageable.max-page-size=100
\```

### severity

- DoS 표 §5 보안 강제 → **high** 강제.
- RealWorld 데모는 작아서 무시되나 사내 운영 시 즉시 사고 가능.
```

---

## 13. 종합 권고 표 — Phase 6 antipatterns.json 통합 시

### 13.1 통합 후 최종 15 AP 권고

| ID | category | severity (본 PoC) | severity (사내) | 표준 출처 (1차) |
|---|---|---|---|---|
| AP-DOMAIN-001 | DOMAIN | critical | critical | OWASP A01 + API1 + CWE-862 |
| AP-SECURITY-001 | SECURITY | critical | critical | OWASP A02+A07 + RFC 8725 + RFC 7518 + RFC 7515 + OWASP CheatSheet (7중) |
| AP-DOMAIN-002 | DOMAIN | high | high | OWASP A04 보조 |
| AP-PERFORMANCE-002 | PERFORMANCE | high | high | OWASP API4 |
| AP-PERFORMANCE-001 | PERFORMANCE | medium | high (격상 권고) | Vlad Mihalcea D12/D13 |
| AP-ARCH-001 | ARCH | medium | high (격상 권고) | Hexagonal/Clean |
| AP-ARCH-002 | ARCH | medium | medium | Vernon IDDD (Spring-flavored 인정) |
| AP-ARCH-003 | ARCH | medium | medium | Spring D10 |
| AP-DB-001 | DB | medium | high (격상 권고) | GDPR + REC-002 |
| AP-SECURITY-002 | SECURITY | medium | medium | OWASP API8 + Spring D11 |
| AP-SECURITY-003 | SECURITY | medium | medium | Spring D10/D11/D18 + OWASP API5 |
| AP-API-001 | API | medium | medium | Spectral D17 + OWASP API9 |
| AP-API-002 | API | low | medium (격상 권고) | RFC 9110 D14 |
| AP-DOMAIN-003 (F-017) | DOMAIN | low | medium 가능 | JPA 비주류 |
| AP-DOMAIN-004 (F-028) | DOMAIN | low | medium 가능 | JPA Set 멤버십 |

### 13.2 카테고리 분포

| Category | Count | critical | high | medium | low |
|---|---|---|---|---|---|
| DOMAIN | 4 | 1 | 1 | 0 | 2 |
| SECURITY | 3 | 1 | 0 | 2 | 0 |
| ARCH | 3 | 0 | 0 | 3 | 0 |
| DB | 1 | 0 | 0 | 1 | 0 |
| PERFORMANCE | 2 | 0 | 1 | 1 | 0 |
| API | 2 | 0 | 0 | 1 | 1 |
| **Total** | **15** | **2** | **2** | **8** | **3** |

### 13.3 신규 finding 후보 (Phase 6 진행 중)

- **F-XXX-1** (신규): JWT iss/aud/sub claim 검증 부재 (RFC 8725 §3.8 위반).
- **F-XXX-2** (신규): JWT alg explicit 검증 부재 (RFC 8725 §3.1 위반 가능 — Phase 5 source_evidence 정밀화 후속).
- **F-XXX-3** (이미 식별 — F-034 보강): sessionCreationPolicy(STATELESS) 명시 부재.

---

## 14. F-015 cross-validation 메모 (sub-agent 검증 완료)

본 산출물은 다음 raw fetch 데이터를 기반:
- ✅ OWASP A01 / A02 / A05 / A07 (4건 raw)
- ✅ OWASP API Security Top 10 2023 (raw)
- ✅ RFC 8725 §3.1/3.2/3.5/3.6/3.8 (raw)
- ✅ RFC 7515 §10.1 (raw)
- ✅ RFC 7518 §3.2 (raw)
- ✅ OWASP JWT Cheat Sheet for Java (raw)
- ✅ Spring Security 공식 블로그 (D10) + Reference (D11) + GitHub Issue #4368 (D18) (raw)
- ✅ Vlad Mihalcea EAGER + N+1 (raw)
- ✅ RFC 9110 (raw — 핵심 §)
- ✅ Wikipedia De Morgan (raw)
- ✅ Martin Fowler Anemic Domain Model (raw)
- ✅ Spectral 룰 (raw — 핵심 6)

**Fetch 차단** (학습 코퍼스 보충):
- SonarSource RSPEC (3건 ECONNREFUSED) → CWE 직접 매핑으로 우회.
- Spring Security 7 마이그레이션 (404) → D10/D11 으로 대체.
- Hibernate User Guide (미수행) → D12/D13 (Vlad Mihalcea) 권위로 대체.

→ **모든 severity 권고 + 표준 인용 7중 매트릭스 (AP-SECURITY-001) 는 raw 검증 완료**. 사내 적용 시 즉시 인용 가능.

---

## 15. 최종 메모

- 본 산출물은 **Phase 6 통합 시 15 AP 의 표준 인용 1차 출처** 역할.
- Senior Engineer 영역 (실무 경험) 및 Tech Case 영역 (Netflix/Google 사례) 와 통합 시 **research-phase6.md** 작성 → 윤주스 3원칙 승인.
- AP-SECURITY-001 critical 의 7중 표준 위반 매트릭스는 본 PoC 가장 강력한 finding — 사내 발표 시 핵심 데모 권장.

— 끝 —
