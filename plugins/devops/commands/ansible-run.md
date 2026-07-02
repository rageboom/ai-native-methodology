---
description: Ansible Playbook/Ad-hoc 실행 가이드 (HIWARE 경유)
---
# Ansible Playbook 실행

MIS DevOps Ansible 플레이북을 실행합니다.

## 사용자 입력
- $ARGUMENTS: 환경과 플레이북 (예: "dev site", "stg setup-application", "live deploy-ssl")

## 지침

### 작업 디렉토리
`${user_config.workspace_root}/devops/MIS-DevOps/setup/ansible`

### 사용 가능한 플레이북
- `site.yml` - 전체 초기화
- `setup-application.yml` - 애플리케이션 설정
- `deploy-ssl-certificates.yml` - SSL 인증서 배포
- `tune-network.yml` - 네트워크 튜닝
- `manage-passwords.yml` - 비밀번호 관리
- `install-htop.yml` - htop 설치
- `install-language-pack.yml` - 언어팩 설치

### 환경
- `dev` - 개발 환경
- `stg` - 스테이징 환경
- `live` - 운영 환경

### 실행 방법

1. 인벤토리 확인:
   ```bash
   cat inventories/{환경}/hosts
   ```

2. Dry-run (테스트):
   ```bash
   ./scripts/run-ansible.sh -m {환경} -f playbooks/{플레이북} -t
   ```

3. 실제 실행:
   ```bash
   ./scripts/run-ansible.sh -m {환경} -f playbooks/{플레이북}
   ```

### 주의사항
- Vault 비밀번호 필요 (`vault/password.yml`)
- SSH 키 인증 설정 필요
- 운영 환경 실행 시 신중하게 확인
