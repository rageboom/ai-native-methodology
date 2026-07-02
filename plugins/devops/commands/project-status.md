---
description: 프로젝트 상태 종합 점검 (git status, 빌드/배포, JIRA)
---
# 프로젝트 상태 확인

모든 프로젝트의 현재 상태를 확인합니다 (Git 상태, 의존성, 빌드 등).

## 사용자 입력
- $ARGUMENTS: (선택) 특정 프로젝트명 또는 "all"

## 지침

### 확인 항목

1. **Git 상태**
   - 현재 브랜치
   - 변경된 파일
   - 커밋되지 않은 변경사항
   - 원격과의 차이

2. **의존성 상태** (선택적)
   - Backend: `./gradlew dependencies --configuration compileClasspath | head -50`
   - Frontend: `pnpm outdated`

3. **빌드 아티팩트**
   - 마지막 빌드 시간
   - JAR/번들 파일 존재 여부

4. **Docker 컨테이너** (해당 시)
   - 실행 중인 컨테이너
   - 포트 바인딩 상태

### 프로젝트 경로 목록

```
119-fe          → ${user_config.workspace_root}/119-fe
devops          → ${user_config.workspace_root}/devops/MIS-DevOps
DevOps-Lab      → ${user_config.workspace_root}/DevOps-Laboratory
eam             → ${user_config.workspace_root}/eam/ep-be-eam
ep-be-itg       → ${user_config.workspace_root}/ep-be-itg
front           → ${user_config.workspace_root}/front
gea             → ${user_config.workspace_root}/gea
blog            → ${user_config.workspace_root}/k-diger.github.io
observer        → ${user_config.workspace_root}/sgh-mis-observer
tlm             → ${user_config.workspace_root}/tlm
```

### 출력 형식
- 테이블 형태로 요약
- 문제 있는 항목 강조
- 권장 조치 제안
