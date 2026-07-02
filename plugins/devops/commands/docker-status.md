---
description: Docker/Compose 컨테이너 상태 조회·진단
---
# Docker 컨테이너 상태 확인

운영/개발 환경의 Docker Compose 서비스 상태를 확인합니다.

## 사용자 입력
- $ARGUMENTS: 환경 (예: "dev", "stg", "live", "local")

## 지침

### 운영 환경 (MIS-DevOps)
작업 디렉토리: `${user_config.workspace_root}/devops/MIS-DevOps/application/{환경}/`

1. 각 서비스별 docker-compose 상태 확인:
   ```bash
   cd ${user_config.workspace_root}/devops/MIS-DevOps/application/{환경}
   find . -name "docker-compose*.yml" -exec echo "=== {} ===" \; -exec docker-compose -f {} ps \;
   ```

2. 확인 항목:
   - 실행 중인 컨테이너 수
   - 각 컨테이너 상태 (Up/Down/Restarting)
   - 포트 바인딩
   - 리소스 사용량: `docker stats --no-stream`

3. 문제 있는 컨테이너 발견 시:
   - 최근 로그 출력: `docker logs --tail 50 {컨테이너}`
   - 재시작 횟수 확인
   - 원인 분석 및 조치 방안 제시

### 로컬 환경
- 현재 실행 중인 모든 컨테이너: `docker ps`
- 중지된 컨테이너 포함: `docker ps -a`
- 사용 중인 볼륨: `docker volume ls`
- 사용 중인 네트워크: `docker network ls`

### 출력 형식
- 테이블로 요약 (서비스명, 상태, 포트, 업타임)
- 비정상 컨테이너 강조
- 디스크 사용량 경고 (80% 이상)
