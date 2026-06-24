---
name: backend-testing
description: 백엔드(TLM/EAM/GEA Java, OBSERVER Kotlin) 테스트 작성 컨벤션. given-when-then, 계층별 전략, 커버리지 목표, 도구 표준.
user-invocable: false
paths:
  - "**/src/test/**/*.java"
  - "**/src/test/**/*.kt"
---

# Backend Testing 컨벤션

현재 4개 레포 테스트 커버리지가 사실상 0(tlm 0.3%, gea 0%, eam 2.1%, observer 3.3%)이고 jacoco/spotbugs/testcontainers 도구가 없다. 테스트를 새로 채울 때 아래 표준을 따른다. 골격 생성은 `test-scaffold` skill.

## 구조

- given-when-then 으로 본문을 나눈다(주석 또는 빈 줄로 구분).
- 한 테스트 = 한 시나리오. 정상 1개로 끝내지 않고 분기·경계·null·예외 경로를 케이스로 더한다.
- 메서드명: Java `메서드_조건_기대결과`, Kotlin 백틱 `메서드 조건 기대결과`. `@DisplayName` 은 한글 시나리오.
- 단언은 AssertJ(Java) / Kotest matcher(Kotlin). JUnit 기본 assert 지양.

## 계층 전략

- Service/도메인: 단위 테스트, 외부 의존 mock(Mockito/MockK). 트랜잭션·시계·랜덤은 주입으로 격리(`Clock` 고정).
- Controller: `@WebMvcTest` 슬라이스, service `@MockBean`, 응답 래퍼(ResponseData) 기준 jsonPath.
- Repository/Mapper: `@MybatisTest`/`@DataJpaTest` 또는 Testcontainers(MSSQL). 이전에 발견한 SQL Injection·페이징 누락 회귀를 막는 쿼리 테스트 우선.
- 인수/E2E: RestAssured + Testcontainers(MSSQL / observer는 Elasticsearch). `@Tag("acceptance")` 로 분리해 CI 선택 실행.

## 커버리지

- 레거시 전체를 한 번에 채우지 않는다. 수정·리팩토링·추출하는 클래스에 테스트를 동반한다.
- 신규/변경 코드 라인 70% 이상에서 시작. jacoco 도입 후 `jacocoTestCoverageVerification` 으로 변경분 게이트.
- core 라이브러리 추출(mis-backend-common) 대상은 추출 전 테스트로 동작을 고정한 뒤 옮긴다(특성화 테스트).

## 도구 (도입 필요, 현재 없음)

jacoco(커버리지), mockito/mockk, rest-assured, testcontainers, spotbugs(정적 버그), archunit(레이어 규칙). observer 는 이미 ArchTest 규칙(`*Config`→`..config..`)이 있으니 archunit 확대 적용. 도구 의존성 추가는 레포별 build.gradle 변경이라 별도 티켓으로 진행한다.

## 금지

- 테스트 없는 버그 수정 금지(회귀 방지 테스트 동반). `@Disabled`/`@Ignore` 방치 금지. 단언 없는 테스트(호출만) 금지. 실제 외부 시스템(운영 DB·API) 직접 의존 금지(컨테이너·mock).
