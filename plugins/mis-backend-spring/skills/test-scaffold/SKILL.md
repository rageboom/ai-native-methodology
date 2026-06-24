---
name: test-scaffold
description: 백엔드(TLM/EAM/GEA Java, OBSERVER Kotlin) 테스트 골격을 템플릿으로 생성. 단위(Mockito/MockK), 슬라이스(@WebMvcTest/@MybatisTest), 인수(RestAssured+Testcontainers) 계층별 given-when-then 템플릿. 테스트 커버리지가 거의 0인 레포에 표준 테스트를 채울 때 사용.
---

# test-scaffold

대상 클래스나 패키지를 받아 계층에 맞는 테스트 골격을 생성한다. 4개 백엔드 레포의 테스트 커버리지가 사실상 0(tlm 0.3%, gea 0%, eam 2.1%, observer 3.3%)이라 표준 템플릿으로 빠르게 채우는 것이 목적이다.

## 스택

| 레포 | 단위 | 슬라이스 | 인수/E2E |
|---|---|---|---|
| TLM/EAM/GEA (Java) | JUnit5 + Mockito + AssertJ | @WebMvcTest, @MybatisTest(MSSQL은 Testcontainers) | RestAssured + Testcontainers(MSSQL) |
| OBSERVER (Kotlin) | JUnit5 + MockK + Kotest assertion | @WebMvcTest | RestAssured + Testcontainers(Elasticsearch) |

도입 선행: 각 레포 build.gradle 에 jacoco, spring-boot-starter-test, mockito(Java)/mockk(Kotlin), rest-assured, testcontainers 추가가 필요하다(현재 대부분 없음). 의존성 추가는 별도 티켓으로.

## 계층 선택 기준

- Service/도메인 로직 → 단위 테스트(외부 의존 mock). 분기·경계·예외 경로를 덮는다.
- Controller → @WebMvcTest 슬라이스(MockMvc + service mock). 직렬화·검증·상태코드.
- Repository/Mapper → @MybatisTest 또는 Testcontainers 통합. 실제 쿼리 검증(특히 이전에 찾은 SQL Injection·페이징 누락 회귀 방지).
- API 시나리오 → 인수 테스트(RestAssured + Testcontainers). 인증·권한·정상/오류 응답.

## 절차

1. 대상의 계층을 판별한다(클래스명·애너테이션·패키지).
2. `references/` 의 해당 템플릿을 읽어 패키지·클래스명·메서드 시그니처를 채운다.
3. given-when-then 구조로 작성한다. 한 테스트 메서드 = 한 시나리오. 메서드명은 `동작_조건_기대결과` 또는 `should~when~`.
4. 외부 의존(DB·외부 API·시계)은 mock 또는 Testcontainers 로 격리한다. 시계는 `Clock` 주입 또는 고정.
5. 정상 경로뿐 아니라 null·빈값·경계·예외 경로를 반드시 포함한다.
6. 생성 후 `./gradlew test` 로 컴파일·통과 확인. 커버리지는 jacoco 로 측정.

## 커버리지 목표 (현실적 단계)

신규/수정 코드는 라인 70% 이상부터 시작한다. 레거시 전체를 한 번에 채우려 하지 말고, 수정·리팩토링하는 클래스에 테스트를 동반한다(특히 core 라이브러리화 추출 대상은 추출 전 테스트로 동작을 고정).

## 템플릿

- `references/unit-service-java.md` — Mockito 단위 테스트
- `references/slice-controller-java.md` — @WebMvcTest 슬라이스
- `references/acceptance-java.md` — RestAssured + Testcontainers 인수
- `references/unit-kotlin.md` — MockK + Kotest 단위 (observer)

각 템플릿은 회사 컨벤션(given-when-then, AssertJ/Kotest, 레포 패키지 구조)에 맞춰져 있다. 플레이스홀더 `{{...}}` 를 대상에 맞게 치환한다.
