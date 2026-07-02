---
description: 백엔드(eam, ep-be-itg, gea, tlm, observer) Gradle 빌드
---
# Backend 프로젝트 빌드

백엔드 프로젝트(eam, ep-be-itg, gea, tlm, sgh-mis-observer)를 빌드합니다.

## 사용자 입력
- $ARGUMENTS: 프로젝트명 (eam, itg, gea, tlm, observer 중 선택)

## 지침

1. 프로젝트명에 따라 해당 디렉토리로 이동하여 빌드 실행:
   - `eam` → `${user_config.workspace_root}/eam/ep-be-eam`
   - `itg` → `${user_config.workspace_root}/ep-be-itg`
   - `gea` → `${user_config.workspace_root}/gea`
   - `tlm` → `${user_config.workspace_root}/tlm/ep-be-tlm`
   - `observer` → `${user_config.workspace_root}/sgh-mis-observer`

2. 빌드 전 코드 포맷팅 실행:
   - Java 프로젝트: `./gradlew spotlessApply`
   - Kotlin 프로젝트 (observer): `./gradlew ktlintFormat`

3. 빌드 실행: `./gradlew clean build`

4. 빌드 결과 요약 (성공/실패, 테스트 결과)

5. 실패 시 에러 로그 분석 및 해결 방안 제시
