---
description: 테스트 실행 가이드 (단위/통합/E2E)
---
# 테스트 실행

프로젝트의 테스트를 실행합니다.

## 사용자 입력
- $ARGUMENTS: 프로젝트명과 옵션 (예: "eam", "observer --arch", "front admin")

## 지침

### Backend 프로젝트 (Java/Kotlin)

1. 전체 테스트: `./gradlew test`

2. 특정 모듈 테스트:
   - `./gradlew :모듈명:test`

3. 특정 테스트 클래스:
   - `./gradlew test --tests "패키지.클래스명"`

4. 아키텍처 테스트 (observer):
   - `./gradlew test --tests "*ArchitectureTest"`

### Frontend 프로젝트

1. 전체 테스트: `pnpm test`

2. 특정 앱 테스트:
   - `pnpm --filter @apps/{앱명} test`

3. Watch 모드:
   - `pnpm test --watch`

### 테스트 결과 보고
- 통과/실패 테스트 수
- 실패한 테스트 상세 내용
- 커버리지 리포트 (가능한 경우)
- 실패 원인 분석 및 수정 제안

### 환경 변수 주의
- Backend 테스트 시 `jasypt.encryptor.password` 시스템 프로퍼티 필요
- `-Djasypt.encryptor.password=${ENCRYPT-MASTER-KEY}`
