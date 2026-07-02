---
description: 프론트엔드(front, mis-fe-admin, 119-fe) pnpm/turbo 빌드
---
# Frontend 프로젝트 빌드

프론트엔드 프로젝트(119-fe, front)를 빌드합니다.

## 사용자 입력
- $ARGUMENTS: 프로젝트명과 환경 (예: "119 dev", "front admin local", "front tlm prod")

## 지침

1. 프로젝트와 앱 파싱:
   - `119` → `${user_config.workspace_root}/119-fe`
   - `front` → `${user_config.workspace_root}/front`
   - 앱 옵션 (front만): `admin`, `tlm`, `gea`, `hrm`

2. 환경 옵션: `local`, `dev`, `stg`, `prod`

3. 의존성 확인 및 설치: `pnpm install`

4. 코드 품질 검사:
   ```bash
   pnpm lint
   pnpm typecheck
   ```

5. 빌드 실행:
   - 전체 빌드: `pnpm build:{환경}`
   - 특정 앱: `pnpm build:{환경}:{앱}`

6. 빌드 결과 요약 (번들 크기, 경고 등)

7. 실패 시 에러 분석 및 해결 방안 제시
