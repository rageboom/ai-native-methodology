# Senior Engineer Research — PoC #01 Phase 3 (arch / 아키텍처)

> 역할: Senior Backend Engineer (15년차, Spring/Java/JPA/Hexagonal/DDD, 한국 엔터프라이즈 SI 출신)
> 작성일: 2026-04-27
> 대상 plan: `.claude/plans/plan-phase3.md`
> 동료 research (예정): `.claude/researches/document-phase3.md` (공식문서), `.claude/researches/case-phase3.md` (테크기업 사례)
> Work Principles 2원칙 — 3개 에이전트 中 Senior 파트
> 이전 사이클: `senior-phase1.md` (Phase 1 함정 8개), `senior-phase2.md` (Phase 2 함정 8개)
>
> 톤: 한국 SI 일화 위주. "이거 잘못 단정하면 마이그레이션 통째로 흔들린다"의 우선순위.

---

## §0. 들어가며 — 왜 Phase 3 이 가장 위험한가 (Phase 1/2 비교)

Phase 1 senior §0 에서 "Phase 1 이 가장 위험" 이라 했고, Phase 2 senior §0 에서 "Phase 2 가 더 위험" 이라 정정했다. **Phase 3 들어와서 또 정정한다. Phase 3 이 가장 위험하다.** 5가지 이유.

1. **추론의 비중이 가장 높다.** Phase 1 은 build.gradle / 디렉토리 트리 같은 명시 단서. Phase 2 는 schema.sql / JPA Entity 같은 코드 단서. **Phase 3 은 "import 그래프 + 의존 방향" 이라는 추출 결과를 또 해석** 해야 한다. 모듈 식별 / 계층 위반 / 순환 의존성 / 아키텍처 스타일 — 4단 해석. 매 단계마다 LLM 학습 코퍼스 유추가 끼어들 자리가 있다.

2. **"디렉토리 = 아키텍처" 라벨링 본능을 지난 두 사이클이 강화시켰다.** Phase 1 senior §2 에서 "디렉토리만 Hexagonal" 함정을 적었다. **Phase 3 에서 그게 진짜 시험대에 오른다.** RealWorld 가 `application/` + `domain/` + `infrastructure/` 3-tier 라서 "Hexagonal 0.65" 라 적었다. 사전 import 분석 결과 — application 이 infrastructure 직접 import, domain 이 Spring 어노테이션 가득. **Hexagonal 미달성**. 이걸 정정하지 않으면 Phase 4/5 가 잘못된 BC 에서 시작한다.

3. **양방향 도메인 import 의 분기 결정.** Tarjan SCC 알고리즘 결과 = 순환. 도메인 의도 = "같은 BC 안의 cross-aggregate 양방향 참조". **알고리즘은 boolean 답을 주는데 의미는 도메인이 정한다.** Phase 1/2 에는 이런 차원이 없었다.

4. **Phase 1 → Phase 3 정정 트레이스 처리 문제.** Phase 1 candidate (Hexagonal/Clean 0.65, POJO 0.85) 가 Phase 3 사전 분석에서 (Layered + Spring-DDD-Lite 0.75, POJO 0.70) 으로 바뀐다. **inventory.json 갱신 vs 메모만 vs Phase 3 산출물에서만 명시** — 셋 다 결과 다르고 명세에 가이드 없다.

5. **5.D 빈약 케이스 = 명세 검증 실패.** RealWorld 외부 통합 0건. PoC 가 5.D 영역의 빈틈을 검증할 수 없다. **사내 진짜 PoC 시 PG/SMS/SSO/SES 다수** — 그때 가서 명세가 깨질 수 있는데 본 PoC 에서는 그 위험을 못 잡는다.

아래 §1~§8 은 위 5가지 위험을 함정 8개로 쪼갠 것. PoC #01 Phase 3 진행자는 이 8개를 체크리스트로 들고 들어가야 한다.

---

## §1. Pure POJO 도메인 vs Spring framework 의존 — 한국 SI 의 "POJO 의도" 함정

### 증상

(a) **`source-info.md` 가 "POJO domain" 이라 적었다고 곧이곧대로 신뢰.** ground truth 라는 말에 약하다. 메인이 raw fetch 안 해보고 "POJO 0.85" 박는다.

(b) **실측 차이 발견 시 처리 절차 부재.** 실제 import 보면 `domain/` 패키지 안에 `@Service`, `@Transactional`, `@Entity`, `@Column`, `PasswordEncoder` 다 있다. **POJO 가 아니다.** 그런데 Phase 1 산출물에 이미 0.85 박혀 있다. 어떻게 정정할지 명세에 없다.

(c) **"Spring-flavored DDD" 인정 vs Pure POJO 추구 갈림길.** 둘 다 정당한데 PoC 결과는 **하나로 단정** 해야 한다. "어쨌든 도메인 패키지 분리는 했으니 POJO 0.7" 같은 어정쩡한 점수가 가장 위험.

### 일화

이게 한국 SI 에서 진짜 자주 본다. 모 통신사 청구계 마이그레이션 분석 들어갔을 때다. 아키텍트가 "우리는 Pure POJO + Hexagonal 입니다" 라고 자신 있게 말했다. README 에도 그렇게 적혀 있고, 신입 교육 자료에도 그렇게 가르친다. 근데 까보니 `domain/` 패키지 안에 `@Service`, `@Transactional`, `@Component`, `@Autowired` 다 있었다. **"POJO" 라 부르면서 실제로는 Spring 컨테이너 없이 인스턴스화 불가능한 도메인.** 본인들도 그게 POJO 가 아닌 줄 모르고 있었다. "어, Lombok 도 POJO 아닌가요?" 같은 답이 돌아왔다.

또 한 번은 모 게임사. domain 안에 `@Entity` + `@Column` 만 있는 깨끗한 케이스였다. 이건 Spring DI 의존은 없으니까 "Spring-flavored DDD" 라 부를 만했다. 근데 그 위에 `UserService extends BaseService` 같은 패턴이 있어서, BaseService 가 `@Transactional` + `applicationContext.getBean()` 직접 호출 → 결국 도메인이 Spring 컨테이너 없으면 메서드 한 줄도 실행 못 함. **"@Entity 만 있으면 POJO" 라는 오해** 의 전형이다.

RealWorld 사전 분석 결과:
- `domain/article/ArticleService.java` 에 `@Service`, `@Transactional`
- `domain/user/User.java` 에 `@Entity`, `@Column`, `PasswordEncoder` import
- `domain/jwt/JWTPayload.java` 는 (확인 필요하지만) interface 라 깨끗할 가능성

→ **Pure POJO 미달성.** "Spring-flavored DDD-Lite" 가 정확한 라벨. POJO 0.85 → 0.70 하향 정정. 단 그렇다고 0 도 아니다 (entity 자체는 POJO 처럼 짜여 있음, 비즈니스 메서드는 service 에 있긴 함).

### 대응책

1. **`source-info.md` ground truth 와 실측 차이 발견 시 finding 의무.** F-022 후보: "ground truth 자기보고 vs 실측 import 차이 처리 절차 부재".
2. **"POJO 도메인" 정의를 명세에 명시.** 후보 정의:
   - **Strict POJO**: 도메인 패키지 안에 Spring framework / JPA / Hibernate / Bean Validation / Lombok 등 어떤 어노테이션도 없음. 순수 자바.
   - **Spring-flavored DDD**: `@Entity` / `@Column` / `@Embeddable` 만 허용 (JPA 매핑 한정). `@Service` / `@Transactional` / `@Autowired` 는 application 으로 분리.
   - **Spring-DDD-Lite**: 도메인에 `@Service` / `@Transactional` 까지 허용. application 은 단순 Controller. ← RealWorld 가 여기.
   - **Layered**: 도메인 분리 자체가 형식적. service 가 핵심.
3. **Phase 3 산출물에 "POJO 라벨 정정 트레이스" 명시.** Phase 1 의 0.85 → Phase 3 의 0.70. 이유: 실측 import 결과.
4. **사내 적용 finding**: 한국 SI 의 "POJO 자기보고" vs 실측 차이는 거의 100% 발생. PoC 결과 보고서에 "사내 적용 시 도메인 패키지 framework 의존 실측 검증 의무" 기재.
5. **AP-DOMAIN-FRAMEWORK-LEAK 안티패턴 후보 등록.** severity: medium. v1.1.2 vs v1.2 분류는 Phase 6 (quality) 에서 결정.

---

## §2. 양방향 도메인 import — 순환 의존성인가 Aggregate 참조인가

### 증상

(a) **Tarjan SCC 알고리즘 결과 = 순환. 끝.** 알고리즘은 도메인 의도를 모른다. User → Article + Article → User 양방향이면 SCC 1개로 묶인다. **알고리즘 결과만 보고 "순환 의존성 안티패턴 1건" 박는다.**

(b) **"같은 BC 안의 cross-aggregate 양방향" 분기 가이드 부재.** DDD 관점에서 같은 Bounded Context 안의 Aggregate 간 양방향 참조는 정상이다 (예: Order ↔ Customer 가 같은 BC 안에 있으면 양방향 가능). BC 가 다르면 안티패턴.

(c) **JPA cascade 잡으려고 양방향 양보 패턴.** 한국 SI 에서 자주 본다. "User 삭제 시 Article 같이 삭제" 요구사항 + JPA `cascade = REMOVE` 박으려고 User → Article 단방향 → 양방향으로 끌어올림. **도메인 결정이 아니라 ORM 편의 결정.** 의도된 양방향이 아니라 ORM 우회.

### 일화

15년 전 모 보험사에서다. `Customer ↔ Contract` 양방향 매핑이 있었는데, 도메인 모델러가 작성한 모델은 단방향 (Contract → Customer) 이었다. 실제 코드는 양방향. 까보니 `customerService.delete(customerId)` 호출 시 Contract 도 같이 삭제하려고 cascade 박았는데, 그러려면 Customer 가 Contract 를 알아야 해서 양방향. **도메인 의도는 단방향, 구현은 양방향.** 6개월 후 신입 개발자가 `customer.getContracts()` 를 화면 출력에 썼다. 1억 건 데이터 로딩으로 OOM. 양방향 끌어올린 게 원인.

또. 모 카드사에서 `Member ↔ Card` 양방향. 도메인 의도는 양방향 (회원이 카드 컬렉션 가진다 + 카드는 회원 소유자 안다). 같은 BC. cascade 도 의도된 거고 N+1 도 fetchType 으로 잘 잡혀 있었다. **이건 정상 양방향**. 알고리즘으로 SCC 잡으면 둘 다 똑같이 "순환" 인데 의미가 다르다.

RealWorld 의 User ↔ Article 양방향 분석:
- `User.java` imports `Article`, `ArticleContents`, `Comment` (CASCADE REMOVE 위해 추정)
- `Article.java` imports `User`, `Comment` (author 참조)
- 같은 BC 인가? — RealWorld 는 BC 분리 명시 안 됨. domain/user, domain/article 디렉토리만 있음. **DDD BC 의도가 명확하지 않다.**

→ Phase 4 도메인 의도 검증 필요. 본 PoC 한정으로는 "low severity 순환 의존성" + "Phase 4 BC 검증 메모".

### 대응책

1. **분기 기준 명문화 (F-023 후보):**
   - **같은 BC 안의 cross-aggregate 양방향**: 정상. JPA cascade / fetch 옵션 검토 별도.
   - **다른 BC 간 양방향**: 안티패턴 (`AP-ARCH-CIRCULAR-001`). severity: high.
   - **BC 정의 부재**: 분기 불가 → Phase 4 도메인 의도 검증 메모 + low severity 잠정 등록.
2. **순환 의존성 검출 결과를 두 단계로 보고:**
   - 1단계: Tarjan SCC 결과 (boolean / 알고리즘 결과)
   - 2단계: 도메인 의도 분류 (정상 vs 안티패턴) — Phase 4 검증 후 확정
3. **JPA cascade 우회 패턴 식별.** `@OneToMany(cascade = REMOVE)` 가 양방향 끌어올린 원인이면 finding. cascade 의도 vs 의도 추정 확인.
4. **본 PoC 한정**: User ↔ Article 양방향 = "low severity 순환" + "RealWorld BC 정의 부재 — Phase 4 검증 대기".
5. **사내 적용 finding**: 한국 SI 의 "JPA cascade 위해 양방향 양보" 패턴 점검. 도메인 의도된 양방향 ≠ ORM 우회 양방향.

---

## §3. infrastructure → domain 의존의 함정

### 증상

(a) **Hexagonal 의 핵심은 domain 이 infrastructure 를 모르는 것 + infrastructure 가 domain port 를 구현.** "infrastructure 가 domain 직접 의존 = layer violation" 으로 단정.

(b) **그런데 Hexagonal 에서도 infrastructure adapter 는 domain entity 직접 의존 가능.** port 인터페이스를 통해 호출만 하면 OK. infrastructure 가 domain entity 를 import 하는 것 자체는 violation 이 아니다.

(c) **"port 인터페이스 부재" 가 진짜 violation.** RealWorld 의 `HmacSHA256JWTService` 가 `domain/user/User` 직접 의존인데, **port 인터페이스가 domain 에 없다.** application 이나 service 가 `JWTService` interface 를 호출 → infrastructure 가 그 interface 의 구현체. 이게 Hexagonal. 본 PoC 는 그게 없음.

### 일화

모 카드사에서 "Hexagonal 도입한다" 고 했는데 현실은 이거였다. domain 패키지 안에 entity 만 두고, infrastructure 패키지에서 service + repository 다 했다. 디렉토리 이름은 Hexagonal 인데 의존 방향이 그냥 Layered 였다. **port 인터페이스가 domain 에 0개**. infrastructure 에서 domain entity 직접 의존 + 직접 sql 발사. 도메인은 객체 보관소 역할만. 그 시스템은 6개월 후 PG 사 변경 요청이 들어왔는데 infrastructure 통째로 손대야 했다 — port 가 없어서 추상화 단위가 없었다. **"디렉토리만 Hexagonal" 의 댓가**.

또. 모 게임사에서 진짜 Hexagonal 적용한 케이스 봤다. domain 안에 `interface PaymentGateway`, `interface Notifier`, `interface UserRepository` 같은 port 가 있었다. infrastructure 안에 `TossPaymentGateway implements PaymentGateway`, `KakaoNotifier implements Notifier`, `JpaUserRepository implements UserRepository` 가 있었다. **PG 사 변경 = TossPaymentGateway 옆에 NaverPayPaymentGateway 추가 + DI 한 줄.** 도메인 / application 은 손도 안 댐. 이게 진짜 Hexagonal 효용이다.

RealWorld 의 `HmacSHA256JWTService`:
- 위치: `infrastructure/jwt/HmacSHA256JWTService.java`
- 의존: `domain/user/User` (직접 import)
- domain 에 `JWTService` interface 있나? — 사전 분석 결과 `domain/jwt/` 패키지에 `JWTPayload`, `Serializer` 만 있고 `JWTService` port 부재.
- application/security/RestController 가 `HmacSHA256JWTService` 직접 호출 → port 우회.

→ **Hexagonal 미달성.** "JWT 가 User 알아야 하는가" 의 도메인 의도 결정이 명확하지 않은 채로 직접 의존 박힘.

### 대응책

1. **Hexagonal 판정 기준 명문화 (F-024 후보):**
   - **Strict Hexagonal**: domain 에 모든 외부 의존성의 port interface 존재 + infrastructure 가 implements. application 은 port 만 호출.
   - **Hexagonal-ish**: port 일부 존재, 나머지는 직접 의존. Hexagonal 0.5 이하.
   - **Layered with Hexagonal layout**: 디렉토리만 Hexagonal, 의존 방향은 Layered. ← RealWorld 가 여기.
2. **port 부재 위치 모두 식별:**
   - `JWTService` (infrastructure/jwt → domain/user 직접 의존)
   - 다른 외부 의존성? — RealWorld 는 외부 통합 0건이라 추가 케이스 없음 (학습 spec 한계)
3. **"infrastructure 가 domain entity 직접 의존" ≠ violation.** "port 부재" = violation. 이 분기 명시.
4. **본 PoC 한정**: HmacSHA256JWTService → User 직접 의존 = "Hexagonal port 부재 — Spring-DDD-Lite 인정" 결론. AP 등록 안 함 (Layered 라면 정상).
5. **사내 적용 finding**: 디렉토리만 Hexagonal vs 진짜 Hexagonal 분기 가이드 명세 추가. v1.1.2 후보.

---

## §4. application → infrastructure 의존 (Hexagonal 위반)

### 증상

(a) **RestController 가 infrastructure 직접 import.** RealWorld 의 `application/article/ArticleRestController` 가 `infrastructure/jwt/UserJWTPayload` 를 직접 import 한다. Hexagonal 이라면 application 은 domain 만 알아야 한다.

(b) **"디렉토리는 Hexagonal 처럼 보이지만 실제 의존 방향이 Layered" 신호.** application 이 infrastructure 를 직접 의존하는 순간 Hexagonal 이 아니다. **이게 가장 강한 부정 증거.**

(c) **"port 통해야 한다" 라는 원칙이 application 층에도 적용된다는 점을 잊는다.** infrastructure 의존이 domain 에서만 금지되는 게 아니라 application 에서도 금지되어야 진짜 Hexagonal.

### 일화

이게 정말 자주 본다. 모 핀테크에서 Hexagonal 적용했다고 했는데, Controller 가 `infrastructure/jpa/UserEntity` 를 응답 DTO 로 바로 반환하고 있었다. **application 이 infrastructure 의 구체 클래스에 직접 의존.** Hexagonal 의 가장 흔한 위반이다. 도메인 entity 와 응답 DTO 분리도 안 되어 있었고, infrastructure 의 JPA Entity 를 그대로 JSON 직렬화. 6개월 후 DB 컬럼 추가하는데 응답 스키마도 같이 변경되어 클라이언트 호환성 깨짐. **"Hexagonal 인 줄" 의 함정.**

또. 모 통신사에서 Controller 가 `infrastructure/redis/CachedToken` 직접 의존. application 이 캐시 구현체를 알고 있는 거다. Redis 를 다른 캐시로 바꾸려면 Controller 까지 수정. Hexagonal 이라면 `domain/auth/TokenPort` 를 application 이 호출 + infrastructure 가 RedisAdapter 구현. 그래야 캐시 교체 시 application 손도 안 댄다.

RealWorld:
- `application/article/ArticleRestController` → `infrastructure/jwt/UserJWTPayload` 직접 import 확인됨.
- 이게 단발성이면 finding, 패턴이면 layer 자체 부정.
- 사전 분석 결과 다른 Controller 도 비슷한 패턴 (security/UserRestController 등) → **Layered 패턴 확정 신호**.

→ **application → infrastructure 직접 의존 = Hexagonal 부정 증거**. Layered + Spring-DDD-Lite 0.75 가 정확.

### 대응책

1. **모든 application 패키지의 import 확인.** infrastructure 패키지 import 카운트:
   - 0건: Hexagonal 가능
   - 1~2건: Hexagonal-ish (port 일부 누락)
   - 3건+: Layered 확정
2. **schema 확장 finding**: `architecture.json` 에 `layer_violations: [{from, to, count, severity}]` 키 추가. 본 PoC 에서는 application → infrastructure violations 카운트.
3. **"디렉토리 vs 실제 의존 방향" 비교 의무.** Phase 1 inventory 의 디렉토리 기반 candidate 와 Phase 3 의 의존 방향 분석 결과를 매트릭스로 비교. 일치 / 불일치 명시.
4. **본 PoC 결론**: "디렉토리는 application/domain/infrastructure 3-tier (Hexagonal-ish 외관) + 의존 방향은 Layered + 도메인은 Spring-DDD-Lite". **하나의 라벨로 단정 금지.** 다층 라벨.
5. **사내 적용 finding**: "Hexagonal 자기보고" vs "실제 application 의 infrastructure 직접 의존" 검증 필수.

---

## §5. 순환 의존성 검출의 함정

### 증상

(a) **Tarjan SCC 결과 = 순환 → 무조건 안티패턴.** 알고리즘 결과를 의미와 동일시한다. **"순환 = 무조건 나쁘다" 단정** 위험.

(b) **분기 기준 부재.** 같은 BC 안의 cross-aggregate 양방향 (정상) vs BC 간 양방향 (안티패턴) vs Util 패키지의 누구나 import (정상) — 다 다른데 알고리즘은 모두 SCC 로 묶는다.

(c) **한국 SI 에서 "순환 의존성 = 안티패턴" 단정의 비용.** 신입 개발자가 양방향 매핑 다 풀면서 cascade 깨고 fetch 깨고 도메인 의도 깨는 경우 자주 본다. **"고친다" 가 더 큰 문제** 야기.

### 일화

모 보험사에서 신입 아키텍트가 Sonarqube 돌려서 "순환 의존성 27건 발견" 보고 후 모두 풀라고 지시. 신입 개발자들이 며칠 동안 양방향 매핑 다 단방향으로 바꿈. 결과: cascade REMOVE 가 안 도는 곳 다수 발생, 부모 삭제 시 자식 고아 row 남음. fetch JOIN 깨져서 N+1 폭발. 화면 로딩 시간 5배. **"순환 풀기" 가 도메인 의도까지 파괴.** 결국 절반은 다시 양방향으로 돌렸다. 그 사건 이후 사내 룰: "순환 의존성 발견 시 도메인 의도 검토 → 의도된 양방향이면 OK, 의도되지 않은 양방향이면 분리".

또. 모 카드사에서 `common/util/` 패키지가 모든 도메인에서 import 됨. Sonarqube 가 "common 이 100개 모듈에서 import" 라고 경고 떠도 그건 정상이다. Util 의 본분이 누구나 부르는 거니까. 알고리즘은 모르고 사람이 안다.

RealWorld 의 User ↔ Article:
- 의도된 양방향 (Aggregate 참조)인지 ORM 우회 양방향인지 Phase 4 도메인 의도 검증 필요
- 본 PoC 한정으로는 low severity + 메모

### 대응책

1. **분기 기준 명문화 (F-023 와 결합):**

| 케이스 | SCC 알고리즘 결과 | 도메인 분류 | severity |
|---|---|---|---|
| 같은 BC cross-aggregate 양방향 | 순환 | 정상 | none |
| 다른 BC 간 양방향 | 순환 | 안티패턴 | high |
| Util / Common 패키지 | 다대다 | 정상 (Util 본분) | none |
| Service A ↔ Service B 양방향 | 순환 | 안티패턴 | high |
| ORM cascade 우회 양방향 | 순환 | 도메인 의도 부재 | medium |

2. **2단계 보고:**
   - 1단계: 순환 의존성 N개 발견 (Tarjan SCC 결과 자체)
   - 2단계: 도메인 분류 (정상 / 안티패턴 분기) — Phase 4 검증 후 확정
3. **본 PoC 한정**: User ↔ Article 양방향 = "low severity 순환 + Phase 4 BC 검증 대기" + 정상 가능성 70%, 안티패턴 가능성 30%.
4. **`circular-dependencies.md` 산출물에 "도메인 의도 분기 가이드" 명시.** 알고리즘 결과만 적지 말고 도메인 검토 영역 표시.
5. **사내 적용 finding**: "순환 의존성 안티패턴 단정 위험 + 도메인 의도 검토 의무" 명세 §6 (안티패턴) 가이드 추가.

---

## §6. 5.D (외부 의존성) 빈약 케이스 함정

### 증상

(a) **학습용 spec (RealWorld) = 외부 통합 0건.** HTTP 클라이언트 / Kafka / SDK / SMS / Email / SSO / SES / PG 다 0개. build.gradle 의존성에도 RestTemplate / WebClient / kafka-clients 부재.

(b) **"5.D 가 0건이라 명세가 잘 동작" vs "5.D 검증 자체를 못 함" 의 정직한 분류.** 0건이라 명세 빈틈이 안 드러나는 것뿐. **검증을 못 한 것** 이지 "잘 동작" 이 아니다.

(c) **사내 진짜 적용 시 PG / SMS / SSO / SES / 사내 ESB / 사내 인증 / Kafka / Redis 다수.** 본 PoC 의 검증 결과는 사내 적용 시 부족. 이걸 "잘 됐다" 보고하면 PoC 가치 절반 이상 손실.

### 일화

이게 사내 PoC 회고 때 가장 큰 함정이다. 학습용 OSS 로 PoC 잘 돌렸는데 사내 적용 시 외부 의존성에서 깨지는 케이스. 모 핀테크에서 한 적이 있다. 학습 OSS = 외부 통합 0건. PoC 잘 됐다고 보고. 사내 적용 = PG 3사 (KCP, 토스, NICE) + SMS 2사 (Aligo, KT) + SSO + 사내 ESB + Kafka 2개 토픽. **외부 통합 8건.** 본 PoC 의 5.D 추출 가이드가 8건 모두 다른 패턴이라 명세에 없는 결정 다수 발생. "PG 콜이 도메인이냐 인프라냐", "SMS 비동기 호출이 application 이냐 infrastructure 이냐", "Kafka producer 가 port 인터페이스 가져야 하나" 등.

또. 모 통신사 청구계는 외부 통합 30+건. 사내 ESB, 사내 인증 (LDAP), 사내 메일, 외부 SMS, 외부 PG, 외부 청구처 (각 통신사) 등. **이런 시스템에서 5.D 명세가 빈약하면 PoC 가치가 거의 없다.** 본 PoC 가 그걸 못 잡고 있다.

RealWorld 의 5.D 추출 결과:
- HTTP 클라이언트: 0건
- Messaging (Kafka/RabbitMQ): 0건
- SDK (AWS/GCP): 0건
- SMS / Email / SSO: 0건
- DB 외 인프라: 0건 (Redis 등 부재)
- → external_dependencies[] = 빈 배열

### 대응책

1. **PoC 결과 보고서 첫 페이지에 "5.D 빈약 한계" 명시.** "외부 통합 0건이라 명세 빈틈이 안 드러남. 사내 적용 시 별도 검증 필요" 명시.
2. **finding F-019 (운영 환경 부재) 와 묶어서 등록.** "5.D 학습 spec 한계: 외부 통합 0건 → 명세 검증 자체 못 함".
3. **PoC #02 후보 제안.** 외부 통합 풍부한 OSS 또는 사내 simplified 시스템 (PG / SMS / SSO 1~2건 포함) 으로 5.D 명세 빈틈 검증.
4. **명세 §3.1 외부 호출 지점 0건 케이스 분기:**
   - 0건 + 학습용: warnings 명시 + finding F-019 와 연계
   - 0건 + 일반 시스템: 의심 (외부 통합 정말 없는 시스템?) + 검증 추가
5. **본 PoC 한정**: external_dependencies = [], "학습용 spec 한계 — 사내 적용 시 별도 검증 필요" 메모 + finding 등록.

---

## §7. F-015 cross-validation Phase 3 적용

### 증상

Phase 1 D 오차 50% (Lombok / Tree count). Phase 2 cross-validation 사전 적용으로 0% 달성. **Phase 3 도 동일 적용 없으면 동일 실수 반복.**

특히 Phase 3 는 import 분석 결과가 핵심:
- 56 main java files 의 import 추출
- import 그래프 구성
- 순환 의존성 검출
- 계층 위반 식별

이 모든 게 **import 한 줄 한 줄의 정확성에 의존**. sub-agent 가 "X 가 Y import 한다" 보고할 때 학습 코퍼스 유추 + 일부 누락 위험. **import 누락 1건이 SCC 결과를 통째로 바꿀 수 있다.**

### 일화

Phase 1 회고 케이스 그대로. D 에이전트가 "Lombok io.freefair 5.3.3.3" 보고. 메인이 raw fetch 검증하니 plugin 과 library version 분리. 50% 오차. **Phase 3 에서 비슷한 패턴**: sub-agent 가 "User.java imports Article" 보고. 메인이 raw fetch 검증해야 한다. 학습 코퍼스에서 RealWorld 비슷한 코드 본 적 있어서 "양방향" 단정할 수 있는데 실제 import 라인이 다를 수 있다.

특히 위험한 케이스:
- "X import Y" → 실제로는 X 가 Y 의 inner class 만 import (의미 다름)
- "X import Y" → 실제로는 wildcard import 라 어떤 클래스 쓰는지 불명
- "X 가 Y 호출" 보고 → 실제는 transitive 호출 (X → Z → Y)
- "패키지 P 안 모든 파일 X 의존" 보고 → 표본 본 거지 전수 본 거 아님

### 대응책

1. **메인 사전 fetch 9건 완료 (이미 적용).** §2.3 mermaid 다이어그램 + §2.4 핵심 발견.
2. **sub-agent 추가 fetch 10건 권장.** 다음 우선순위:
   - `application/article/ArticleRestController.java` (메인 검증 안 함)
   - `application/security/UserRestController.java` (security 디렉토리 검증)
   - `application/WebMvcConfiguration.java` (application 영역 추가 의존)
   - `domain/article/ArticleService.java` (도메인 service 의존 검증)
   - `domain/user/UserService.java`
   - `domain/jwt/JWTPayload.java` (domain 안의 jwt 패키지 깨끗한지)
   - `domain/jwt/Serializer.java`
   - `infrastructure/repository/SpringDataJPAConfiguration.java`
   - `infrastructure/jwt/UserJWTPayload.java`
   - `domain/article/Comment.java` (User import 검증)
3. **cross-check 체크리스트 (Phase 3 plan §13 참조):**
   ```
   □ sub-agent "User import Article" → 메인 raw fetch 직접 검증
   □ sub-agent "domain/ Spring 의존 N건" → 메인 import 라인 직접 카운트
   □ sub-agent "infrastructure/jwt → domain/user" → 메인 raw fetch 검증
   □ sub-agent "external_dependencies = []" → build.gradle + 코드 grep 모두 0 검증
   □ Cross-check 50%+ 오차 발견 시 즉시 finding 등록 (F-015 영향 확장)
   ```
4. **F-015 finding 의 영향 영역 확장.** Phase 1 → Phase 2 → Phase 3 적용 결과 모두 finding 보고에 포함.
5. **PoC 결과 보고 시 cross-check 결과 별도 섹션.** sub-agent vs 메인 일치율 + 오차 사례 명시.

---

## §8. Phase 1 candidate vs Phase 3 확정의 차이

### 증상

(a) **Phase 1 candidate (Hexagonal/Clean 0.65, POJO 0.85) 가 Phase 3 사전 분석에서 (Layered + Spring-DDD-Lite 0.75, POJO 0.70) 으로 바뀐다.** 두 결과 차이 처리 절차가 명세에 없다.

(b) **세 가지 옵션:**
- (i) Phase 1 산출물 (inventory.json) 갱신 + 변경 트레이스 별도 기록
- (ii) Phase 1 산출물 그대로 두고 Phase 3 산출물에서만 정정
- (iii) Phase 1 산출물에 "Phase 3 검증 결과 변경" 메모만
- → 명세에 가이드 부재. 사람이 결정해야 한다.

(c) **변경 트레이스 누락 시 재현성 손실.** 다음 사이클에서 Phase 1 결과만 보면 "Hexagonal 0.65" 로 보인다. Phase 3 산출물 안 본 사람은 잘못된 candidate 로 작업.

### 일화

모 통신사 분석 시스템에서 비슷한 사이클 있었다. 1차 리서치 결과 "이 시스템 Hexagonal 으로 짜여 있다" 보고. 2차 리서치 (의존 방향 분석 추가) 결과 "Layered + 디렉토리만 Hexagonal" 결론. **1차 보고서 갱신 안 함.** 6개월 후 신규 PM 들어와서 1차 보고서만 보고 "Hexagonal 시스템이니까 PG 사 변경 수월하겠네" 라 가정. 실제는 application → infrastructure 직접 의존 다수라 PG 사 변경에 5개월 걸림. **변경 트레이스 누락의 댓가**.

또. 모 카드사 PoC 에서 1차 candidate 와 2차 확정이 달랐는데, 1차 산출물에 "v2 검증 결과 변경 — 본 산출물은 historical" 명시 박았다. 그 사건 후 사내 룰: "이전 사이클 산출물 갱신 vs 메모만 결정 시 명시 의무".

본 PoC 변경:
- Phase 1 architecture_style_candidates:
  - Hexagonal/Clean (영향): 0.65
  - POJO domain 강조: 0.85
  - Layered (보강): 0.55
- Phase 3 사전 분석:
  - Layered + Spring-DDD-Lite (확정): 0.75
  - POJO domain 강조: 0.70 (하향)
  - Hexagonal/Clean (영향): 0.40 (하향, 디렉토리만)

**0.65 → 0.40 = 38% 하향. 0.85 → 0.70 = 18% 하향. 둘 다 5% 임계 초과.** Phase 1 산출물 갱신 의무 후보.

### 대응책

1. **finding F-024 신규 등록**: "Phase 1 candidate vs Phase 3 확정 차이 처리 절차 부재. 명세에 다음 추가 필요:"
   - 차이 5% 미만: Phase 3 산출물에서만 명시
   - 차이 5~20%: Phase 1 산출물에 "Phase 3 검증 결과 변경" 메모 + Phase 3 산출물에서 트레이스
   - 차이 20%+: Phase 1 산출물 갱신 + 변경 이력 별도 파일 (`architecture-revisions.md`) 작성
2. **본 PoC 적용**:
   - Hexagonal 0.65 → 0.40 (38% 차이) → Phase 1 inventory.json 갱신 + revision 이력 작성
   - POJO 0.85 → 0.70 (18% 차이) → Phase 1 inventory.json 메모 + Phase 3 산출물 명시
3. **Phase 3 산출물 (`architecture.md`) 에 "Phase 1 → Phase 3 정정 트레이스" 섹션 의무.** 변경 사항 + 변경 이유 + evidence 명시.
4. **다음 사이클 (Phase 4+) 입력 시 Phase 1 vs Phase 3 산출물 일치 여부 검증.** 불일치면 즉시 stop + 동기화.
5. **사내 적용 finding**: 사이클별 정정 트레이스 처리 가이드 명세 추가. v1.1.2 후보.

---

## §9. Phase 3 절대 하지 말 것 5개 (Don'ts)

| # | Don't | 이유 |
|---|---|---|
| 1 | `source-info.md` "POJO domain" ground truth 만 보고 0.85 박기 | §1 — 실측 import 검증 없으면 framework 의존 못 잡음. RealWorld 는 Spring-DDD-Lite. |
| 2 | Tarjan SCC 결과 보고 "순환 의존성 안티패턴 1건" 단정 | §2, §5 — 같은 BC 안 cross-aggregate 양방향은 정상. 도메인 의도 검증 필수. |
| 3 | 디렉토리 (application/domain/infrastructure 3-tier) 만 보고 Hexagonal 0.65 박기 | §3, §4 — application → infrastructure 직접 의존 + port 부재 = Layered. |
| 4 | external_dependencies = [] 결과 "잘 동작" 으로 보고 | §6 — 학습 spec 한계로 5.D 검증 자체 못 한 것. "잘 동작" 아님. |
| 5 | sub-agent "X import Y" 보고 그대로 채택 | §7 — F-015 cross-validation 없으면 Phase 1 D 오차 50% 패턴 반복. |

---

## §10. Phase 3 꼭 확인할 것 5개 (Do's)

| # | Do | 검증 방법 |
|---|---|---|
| 1 | domain 패키지 모든 파일의 Spring framework 의존 raw 카운트 | grep `@Service`, `@Transactional`, `@Component`, `PasswordEncoder`, `org.springframework.*` import |
| 2 | application → infrastructure 직접 의존 카운트 | grep `import io.github.raeperd.realworld.infrastructure.*` in `application/` |
| 3 | Tarjan SCC 결과 + 도메인 의도 분류 2단계 보고 | 1단계 알고리즘 결과 / 2단계 BC 검증 메모 (Phase 4 대기) |
| 4 | external_dependencies = [] 의 정직한 한계 명시 | inventory.warnings + finding F-019 연계 |
| 5 | Phase 1 → Phase 3 정정 트레이스 작성 | architecture.md "정정 트레이스" 섹션 + Phase 1 산출물 갱신 (변경 5%+ 시) |

---

## §11. Senior 한마디

Phase 3 는 **"디렉토리가 말하는 것 vs 의존 방향이 말하는 것 vs 도메인 의도가 말하는 것" 이 다 다를 때 어느 것을 신뢰할 것인가** 의 단계다. Phase 1 은 한 면 추정의 신뢰도, Phase 2 는 두 면 정합성, Phase 3 는 세 면 충돌 조정.

특히 한국 SI 환경 적용 시:

- **"Hexagonal 자기보고" vs "실제 의존 방향" 의 차이** 가 1순위. README / source-info.md / 사내 위키의 자기보고는 거의 100% 과대 평가. 의존 그래프가 정직.
- **"Pure POJO" 라는 신화** 가 2순위. domain 안에 `@Entity` 만 있어도 사실 framework 의존 (JPA / Hibernate / Bean Validation 다). 진짜 POJO 가 되려면 domain 안에 어노테이션 0개. 한국 SI 시스템에서 그런 거 본 적 거의 없다.
- **"순환 의존성 = 안티패턴" 단정의 비용** 이 3순위. 도메인 의도 검토 없이 풀면 cascade / fetch 다 깨짐.
- **"5.D 빈약 = 잘 동작" 오해** 가 4순위. 학습 spec 은 외부 통합 0건이 정상. 사내 적용 시 외부 통합 5~30건 발생. 본 PoC 의 5.D 검증 가치는 거의 없다 — 그 사실을 정직하게 보고해야 한다.

PoC #01 한정으로 가장 중요한 건:

- **finding 최소 3건 이상** (Phase 1, 2 와 동일). F-022 (POJO ground truth 차이), F-023 (순환 vs Aggregate 분기), F-024 (Phase 1 → Phase 3 정정 트레이스) 모두 정식 등록.
- **F-015 cross-validation Phase 3 적용 의무.** sub-agent import 보고는 메인 raw fetch 로 cross-check.
- **Phase 1 candidate 정정 트레이스 명시.** 0.65 → 0.40 같은 큰 변화는 Phase 1 산출물 갱신.
- **Layered + Spring-DDD-Lite 라벨 사용.** "Hexagonal" 단정 금지. "디렉토리만 Hexagonal + 의존 방향 Layered + 도메인 Spring-DDD-Lite" 의 다층 라벨 채택.

마지막으로. Phase 3 의 결론이 Phase 4 (BC 분리) + Phase 5 (API 추출) + Phase 6 (안티패턴 등록) 의 골격을 결정한다. **여기서 Hexagonal 이라 잘못 단정하면 Phase 4 BC 분리가 통째로 잘못된 가정에서 시작한다.** Phase 1 senior §11 의 "여기서 아끼면 거기서 운다" 가 Phase 3 에 가장 강하게 적용된다.

DDD / Hexagonal / Clean Architecture 라벨은 **자기보고 신뢰 금지, 의존 그래프로 검증 의무**. 한국 SI 에서 15년 동안 본 거의 유일한 진리 두 번째다.

---

## §12. 참고

- 동료 research (예정): `document-phase3.md` (공식문서 — Spring DDD, Hexagonal, dependency analysis 도구 jdeps/Sonarqube, Spring Modulith), `case-phase3.md` (테크기업 사례 — 우형/카카오 도메인 모듈 분리, Hexagonal 적용 사례, 양방향 Aggregate 참조)
- 본 phase plan: `plan-phase3.md` (R-Phase3-1~5 리스크)
- 이전 phase senior: `senior-phase1.md` (Phase 1 함정 8개), `senior-phase2.md` (Phase 2 함정 8개)
- Phase 명세: `methodology-spec/workflow/phase-3-arch.md`
- Phase 산출물 명세: `methodology-spec/deliverables/01-아키텍처.md`
- Schema: `architecture.schema.json`
- ADR-003: 신뢰도 가중평균
- 상위 plan: `methodology-v1.1/.claude/plans/plan-poc-realworld.md`
- 인계 매니페스트: `output/inventory/_manifest.yml` (Phase 1), `output/db/_manifest.yml` (Phase 2)
- finding 후보: F-022 (POJO ground truth 차이), F-023 (순환 vs Aggregate 분기), F-024 (Phase 1 → Phase 3 정정 트레이스), F-015 영향 확장, F-019 연계
