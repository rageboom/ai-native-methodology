---
description: 인프라 컴포넌트(monitoring, registry, gateway) 시작 가이드
---
# 로컬 인프라 시작

로컬 개발을 위한 Docker 인프라(MSSQL, Redis, Kafka 등)를 시작합니다.

## 사용자 입력
- $ARGUMENTS: 프로젝트명 또는 인프라 유형 (예: "eam", "tlm", "lgtm", "elastic")

## 지침

### 백엔드 프로젝트 인프라
각 프로젝트 디렉토리의 docker-compose.yml 사용:
- `eam`: `${user_config.workspace_root}/eam/ep-be-eam/docker-compose.yml`
- `itg`: `${user_config.workspace_root}/ep-be-itg/docker-compose.yml`
- `gea`: `${user_config.workspace_root}/gea/docker-compose.yml`
- `tlm`: `${user_config.workspace_root}/tlm/docker-compose.yml`
- `observer`: `${user_config.workspace_root}/sgh-mis-observer/container/local/infrastructure-local.yml`

실행: `docker-compose up -d`

### Observability 스택
- `lgtm`: `${user_config.workspace_root}/DevOps-Laboratory/lgtm/docker-compose.yml`
  - Prometheus (9090), Loki (3100), Tempo (3200), Grafana (3000)

- `elastic`: `${user_config.workspace_root}/DevOps-Laboratory/elasticapm/docker-compose.yml`
  - Elasticsearch (9200), Kibana (5601), APM Server (8200)

### 상태 확인
- 컨테이너 상태: `docker ps`
- 로그 확인: `docker-compose logs -f {서비스명}`

### 정리
- 중지: `docker-compose down`
- 볼륨 포함 정리: `docker-compose down -v`
