---
description: Jenkins 파이프라인/Jenkinsfile 작업 가이드 (환경별 native Jenkins)
---
# Jenkins 파이프라인 관리

Jenkins 파이프라인 설정을 확인하거나 수정합니다.

## 사용자 입력
- $ARGUMENTS: 작업과 환경 (예: "list dev", "show eam dev", "edit eam dev")

## 지침

### Jenkins 파일 위치
`${user_config.workspace_root}/devops/MIS-DevOps/jenkins/`

| 환경 | 경로 |
|------|------|
| dev | `jenkins/dev/` |
| stg | `jenkins/stage/` |
| live | `jenkins/live/` |

### 작업 유형

**list {환경}**: 해당 환경의 모든 Jenkinsfile 목록 표시
```bash
find ${user_config.workspace_root}/devops/MIS-DevOps/jenkins/{환경} -name "Jenkinsfile*" -o -name "*.groovy"
```

**show {서비스} {환경}**: 특정 파이프라인 내용 표시 및 분석
- 파이프라인 스테이지 요약
- 사용 중인 shared library
- 환경 변수, 빌드 파라미터

**edit {서비스} {환경}**: 파이프라인 수정
- CLAUDE.md 규칙: Jenkinsfile 직접 수정 금지, shared library로만 변경
- 변경 전 현재 내용 백업 표시
- dry-run 가능 여부 확인

### 주의사항
- live 환경 파이프라인 수정 시 반드시 dev → stg 검증 후 진행
- Harbor 레지스트리 이미지 태그는 git commit SHA 사용
- 기존 shared library 패턴 유지
