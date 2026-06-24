---
description: 테스트 없는 백엔드 클래스 탐지 후 test-scaffold 템플릿으로 단위/슬라이스/인수 테스트 골격 생성
argument-hint: "[repo] [package or class]"
---

# 백엔드 테스트 생성

테스트가 없는 클래스를 찾아 `test-scaffold` skill 템플릿으로 계층별 테스트 골격을 만든다.

## 입력

- `$ARGUMENTS`: 대상 레포(tlm/eam/gea/observer)와 패키지/클래스. 비면 레포 전체에서 우선순위 높은 미테스트 클래스부터.

## 절차

1. 대상 레포의 `src/main` 에서 public Service/Controller/Repository(Mapper)를 나열하고, `src/test` 에 대응 테스트가 없는 것을 추린다(클래스명 + `Test` 매칭).
2. 우선순위: 이전 기술부채 스캔에서 결함이 지적된 클래스(SQL Injection·풀 점유·OOM 관련), 그다음 변경 빈도 높은 핵심 서비스.
3. `test-scaffold` skill 을 호출해 계층(단위/슬라이스/인수)을 판별하고 해당 템플릿으로 골격 생성. 플레이스홀더를 실제 시그니처로 치환.
4. 정상 경로뿐 아니라 분기·경계·null·예외 경로 케이스를 채운다. 단언이 비어 있으면 안 된다.
5. `./gradlew test`(또는 모듈 지정)로 컴파일·통과 확인. 실패 시 수정 후 재실행, 결과 보고.

## 산출 규칙

- jacoco/mockito/rest-assured/testcontainers 의존성이 없으면 먼저 build.gradle 추가가 필요하다고 알리고, 의존성 추가는 사용자 승인 후(레포 변경).
- 레포 내 파일 생성이므로 해당 레포 기준 브랜치에서 새 브랜치를 따고 작업한다. 직접 커밋/푸시 금지, diff 보여주고 승인 후.
- 컨벤션은 `.claude/rules/backend-testing.md` 를 따른다.
