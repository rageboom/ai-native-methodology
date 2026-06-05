# PoC #01: 분석 대상 레포 정보

> Phase 0 산출 — 입력 정리 단계의 첫 산출물
> 생성일: 2026-04-26

---

## 분석 대상

| 항목 | 값 | 출처 |
|---|---|---|
| 레포 URL | https://github.com/raeperd/realworld-springboot-java | 1차 |
| 작성자 | RaeCheol Park (raeperd) | 1차 |
| 라이선스 | MIT | 1차 |
| Stars | 225 (2026-04-26 기준) | 1차 |
| Forks | 94 | 1차 |
| **기본 브랜치** | **`master`** ⚠️ (main 아님) | D 재검증 (2026-04-27) |
| 마지막 commit | (Phase 1 실행 시 기록) | - |

---

## 기술 스택 (Phase 1 D 재검증 — 2026-04-27)

| 영역 | 기술 | 신뢰도 | 출처 |
|---|---|---|---|
| **언어** | **Java 11** | 0.98 | build.gradle 실측 ✅ |
| **빌드** | Gradle (Groovy) — `build.gradle` 1,720 bytes | 0.98 | raw fetch ✅ |
| **프레임워크** | **Spring Boot 2.5.2** ⚠️ | 0.98 | build.gradle 실측 (이전 추정 2.7.x → 정정) |
| **웹** | Spring Web (REST) | 0.95 | starter-web 의존성 |
| **인증** | Spring Security + JWT (자체 구현) | 0.95 | starter-security + JWT 라이브러리 부재 |
| **ORM** | Spring Data JPA (단일) | 0.95 | starter-data-jpa + mybatis 부재 |
| **DB** | (Phase 2 — application.properties) | - | - |
| **테스트** | JUnit + JaCoCo (커버리지 100% 추구) | 0.85 | README + JaCoCo plugin |
| **CI** | GitHub Actions, SonarCloud | 0.85 | .github 디렉토리 |
| **배포** | Docker (Jib Gradle 플러그인) | 0.85 | Jib plugin (build.gradle) |
| **유틸** | **Lombok 사용** (io.freefair.lombok 5.3.3.3) | 0.95 | build.gradle 직접 fetch ✅ |
| **추가 plugin** | jacoco / editorconfig / sonarqube / jib | 0.95 | build.gradle |
| **검증/테스트** | starter-validation / mockito-inline 3.12.1 / spring-security-test | 0.95 | build.gradle |
| **DB (개발용)** | H2 (runtimeOnly) | 0.95 | build.gradle |
| **그룹/버전** | io.github.raeperd / 2.1.1 | 0.98 | build.gradle |

⚠️ **Phase 1 실측 보정 사항** (2026-04-27):
- 기본 브랜치: `master` (main 아님) ✅
- Spring Boot: **2.5.2** (2.7.x 추정 → 정정) ✅
- Lombok: **사용** (io.freefair.lombok plugin) — D 에이전트 1차 "미사용" 보고는 오류, 원래 source-info 의 "도메인 외" 표현이 더 정확
- Tree entries: **170** (D 에이전트 1차 "93" 보고는 오류 — F-015 후보)

---

## 도메인 영역 (RealWorld spec 기준)

RealWorld는 Medium 클론. 5개 도메인 영역:

| 도메인 | 주요 기능 |
|---|---|
| User | 회원가입/로그인/프로필 |
| Article | 게시글 CRUD, 좋아요, 피드 |
| Comment | 댓글 CR + D (Update 없음) |
| Tag | 태그 목록 |
| Profile | 다른 사용자 프로필, 팔로우/언팔로우 |

⭐ **분석 우선 순위 후보**: `Article` (가장 큰 도메인, `@Embedded` 활용으로 Aggregate 추출 케이스 풍부)

---

## 사람용 ground truth (사전 확인된 자료)

분석 결과를 **검증할 자료**가 레포에 같이 있어 PoC에 유리:

| 자료 | 위치 | 활용 |
|---|---|---|
| **drawio 아키텍처 다이어그램** | `realworld.drawio` | Phase 3 검증 |
| **drawio User/Article/JWT 다이어그램** | `doc/image/realworld-{User,Article,Jwt}.png` | Phase 4 도메인 검증 |
| **Postman collection** | `doc/Conduit.postman_collection.json` | Phase 5-1 API 검증 |
| **API test 스크립트** | `doc/run-api-tests.sh` | Phase 5-1 검증 |
| **JaCoCo 커버리지** | (build 결과) | 코드 품질 baseline |
| **README의 Design Principal** | README §Overview | 의도된 아키텍처 패턴 |

---

## 알려진 설계 원칙 (README에서)

분석 시 이를 ground truth로 활용:

1. ✅ **POJO 도메인 패키지** — `domain/`은 Lombok도 안 씀, Spring 어노테이션 최소
2. ✅ **`@Service`, `@Repository`, `@Transactional`만 도메인에 허용**
3. ✅ **Always `final` whenever possible**
4. ✅ **Always package private class whenever possible**
5. ✅ **JWT는 3rd party 없이 자체 구현** ([#3 issue](https://github.com/raeperd/realworld-springboot-java/issues/3))
6. ✅ **Article은 `@Embedded` 클래스로 구성**
7. ✅ **`@JoinTable` 선호 (vs `@JoinColumn`)**

→ Phase 4 도메인 추출 시 **Clean Architecture + DDD 영향** 예상.

---

## 알려진 한계 (개선 후보)

README에서 작성자가 직접 언급한 개선 영역:

- "User class doing so many things now" — Anemic Domain Model 후보
- "Service classes can be divided into smaller services" — 큰 Service 안티패턴

→ Phase 6 안티패턴 산출 시 활용.

---

## 분석 접근 방식 (Phase 1 진입 전 결정)

1. **레포 git clone 안 함** (현재 환경 제약)
2. **web_fetch로 핵심 파일만 선택적** 가져오기
3. **Phase별로 끊어서** 진행
4. **명세 빈틈 발견 즉시 finding 기록**

핵심 파일 우선순위 (Phase 1에서 가져올 후보):
1. `build.gradle` — 의존성/Java 버전 확인
2. `src/main/java/.../` 디렉토리 트리
3. 도메인 핵심 클래스 (User, Article, Comment 등)
4. application.properties
5. Controller 어노테이션