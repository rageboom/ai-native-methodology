---
name: backend-test-workflow
description: 백엔드(TLM/EAM/GEA Java, OBSERVER Kotlin) src/main 변경 요청 시 진입. 새 기능·수정·버그픽스·기획서 구현을 받으면 구현 전에 테스트 전략을 라우팅한다. 새 코드는 TDD, 기존 코드는 특성화 테스트, 기능 완료 시 엔드포인트 인수 테스트. "~ 추가해줘 / 고쳐줘 / 이 기획대로" 같은 백엔드 코드 작업 요청에 발동.
---

# Backend Test Workflow

백엔드 4레포(TLM/EAM/GEA Java, OBSERVER Kotlin)의 `src/main` 변경 요청이 들어오면 구현 전에 이 라우팅을 따른다. 이 skill 은 "언제 어느 것을 쓸지" 정하는 라우터다. 실제 절차는 기존 자산을 호출한다.

- TDD 절차: superpowers `test-driven-development`
- 작성 컨벤션(given-when-then·계층·도구): `backend-testing`
- 계층별 골격 템플릿: `test-scaffold`
- 누락 탐지: `/gen-tests`, `/backend-debt-scan`

## 1. 대상 판별

요청이 닿는 클래스·메서드가 이미 있는지 Grep/Read 로 확인한다.

| 상황 | 경로 |
|---|---|
| 대상 없음 (새 기능) | §2 TDD |
| 대상 있음 (수정·버그픽스·리팩토링) | §3 특성화 후 변경 |

`src/main` 변경이지만 동작이 안 바뀌는 순수 비기능 변경(로그·상수·주석·포맷·import 정리·네이밍)은 `테스트 불필요: <사유>` 한 줄을 남기고 구현한다. 이 escape hatch 외에는 테스트를 동반한다.

## 2. 새 기능 — TDD

superpowers `test-driven-development` 를 따른다 (red → green → refactor).

1. 실패하는 단위 테스트 먼저 작성한다(Service·도메인 레벨). `backend-testing` 컨벤션(given-when-then, AssertJ/Kotest, `메서드_조건_기대결과`).
2. 테스트를 통과시키는 최소 구현.
3. 리팩토링(테스트 녹색 유지).

계층 골격이 필요하면 `test-scaffold` 로 템플릿을 생성한다.

## 3. 기존 코드 — 특성화 후 변경

1. 변경 전 현재 동작을 고정하는 특성화 테스트를 먼저 작성한다. 버그픽스면 버그를 재현하는 실패 테스트(red)부터.
2. 코드를 변경한다.
3. 테스트가 새 동작을 반영하도록 갱신·추가한다. 정상 경로뿐 아니라 분기·경계·null·예외 경로를 덮는다.

## 4. 기능 완료 — 엔드포인트 인수 테스트

기능(스토리) 작업이 끝나면 변경이 닿은 API 엔드포인트의 인수 테스트를 추가·갱신한다(RestAssured + Testcontainers; observer 는 Elasticsearch). 인증·권한·정상/오류 응답을 덮는다.

- 엔드포인트가 없는 순수 내부 변경(util·도메인 로직만)은 인수 테스트 대상이 아니다. 단위 테스트로 충분하다.
- 도구(rest-assured·testcontainers)가 없는 레포는 `build.gradle` 의존성 추가가 선행이다(별도 티켓). 도입 전까지는 단위·슬라이스까지 작성하고 인수는 티켓으로 남긴다.

## 5. 커밋 전

`git commit` 직전 `backend-quality-gate` hook 가 spotless/ktlint + compile(+ observer ArchUnit)을 검사한다(경고, 차단 안 함). 커밋 전 `./gradlew test` 로 컴파일·통과를 확인한다.

## 계층·도구 표준

`test-scaffold` / `backend-testing` 참조. 단위(Mockito/MockK), 슬라이스(@WebMvcTest/@MybatisTest), 인수(RestAssured + Testcontainers). 커버리지는 신규·변경 코드 라인 70% 이상부터 시작한다.
