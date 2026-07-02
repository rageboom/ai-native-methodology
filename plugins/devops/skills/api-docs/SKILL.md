---
name: api-docs
description: API 문서 생성·갱신·검토 (Swagger/OpenAPI)
when_to_use: REST API 엔드포인트 문서화, Swagger spec 작성·검토 요청 시
---

# API 문서 확인

백엔드 프로젝트의 API 문서(Swagger)를 확인합니다.

## 사용자 입력
- $ARGUMENTS: 프로젝트명 (예: "eam", "itg", "gea", "tlm", "observer")

## 지침

### Swagger UI URL (로컬 실행 시)

| 프로젝트 | URL |
|---------|-----|
| eam | http://localhost:8080/swagger-ui.html |
| itg | http://localhost:8080/swagger-ui.html |
| gea | http://localhost:8080/swagger-ui.html |
| tlm | http://localhost:8080/swagger-ui.html |
| observer | http://localhost:8080/swagger-ui.html |

### 개발 서버 URL

| 프로젝트 | URL |
|---------|-----|
| itg | https://dev-itg-epb.smiledev.net/swagger-ui.html |

### API 스펙 파일 위치
각 프로젝트의 `docs/api-specification/` 디렉토리에 YAML 파일 존재

### 주요 API 경로 패턴

**eam**:
- `/eam/**` - EAM 도메인 API
- `/cmn/**` - 공통 API

**itg**:
- `/admin/itg/**` - 관리자 API
- `/itg/**` - 사용자 API
- `/auth/**` - 인증 API

**gea**:
- `/admin/gea/**` - 관리자 API
- `/gea/**` - 사용자 API

**tlm**:
- `/admin/tlm/**` - 관리자 API
- `/tlm/**` - 사용자 API

**observer**:
- `/observer/v1/standard-logs/search` - 로그 검색 API

### 로컬 서버 실행 안내
서버가 실행 중이지 않으면 `/run-local {프로젝트}` 명령 사용
