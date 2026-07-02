---
description: 로컬 실행 가이드 (백엔드/프론트엔드/Compose)
---
# 로컬 개발 서버 실행

프로젝트의 로컬 개발 서버를 실행합니다.

## 사용자 입력
- $ARGUMENTS: 프로젝트명 (예: "119", "front admin", "eam", "itg", "gea", "tlm", "observer", "blog")

## 지침

### Backend 프로젝트
1. Docker 인프라 필요 여부 확인 (MSSQL, Redis, Kafka)
2. 실행 명령어:
   - `eam`: `./gradlew :ep-be-eam-api:bootRun --args='--spring.profiles.active=local'`
   - `itg`: `./gradlew bootRun --args='--spring.profiles.active=local'`
   - `gea`: `./gradlew :ep-be-gea-api:bootRun --args='--spring.profiles.active=local'`
   - `tlm`: `./gradlew :ep-be-tlm-api:bootRun --args='--spring.profiles.active=local'`
   - `observer`: `./gradlew :mis-observer-bootstrap:bootRun --args='--spring.profiles.active=local'`

3. JVM 옵션 필요: `-Djasypt.encryptor.password=${ENCRYPT-MASTER-KEY}`

### Frontend 프로젝트
1. 실행 명령어:
   - `119`: `pnpm local` (Port 3100)
   - `front`: `pnpm local` 또는 `pnpm local:{앱}` (Port 3000)

### Blog
1. `cd k-diger.github.io && bundle exec jekyll serve` (Port 4000)

### 실행 후
- 서버 URL과 포트 안내
- Swagger UI URL (백엔드)
- 로그 모니터링 안내
