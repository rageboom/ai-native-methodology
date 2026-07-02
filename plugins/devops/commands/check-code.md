---
description: 코드 품질 검사 전 스택 (Format, Compile, Lint)
---
# 코드 품질 검사

프로젝트의 코드 품질을 검사합니다 (린팅, 포맷팅, 타입 체크).

## 사용자 입력
- $ARGUMENTS: 프로젝트명 (예: "eam", "front", "observer")

## 지침

### Backend (Java) 프로젝트
1. Spotless 검사: `./gradlew spotlessCheck`
2. 문제 발견 시 자동 수정: `./gradlew spotlessApply`
3. 컴파일 검증: `./gradlew compileJava`

### Backend (Kotlin) 프로젝트 (observer)
1. KtLint 검사: `./gradlew ktlintCheck`
2. 문제 발견 시 자동 수정: `./gradlew ktlintFormat`
3. 컴파일 검증: `./gradlew compileKotlin`

### Frontend 프로젝트
1. ESLint 검사: `pnpm lint`
2. TypeScript 타입 체크: `pnpm typecheck`
3. Prettier 포맷 검사: `pnpm format:check`
4. 전체 수정: `pnpm fix:all`

### 결과 보고
- 발견된 문제 목록
- 자동 수정된 항목
- 수동 수정 필요 항목
- 권장 해결 방안
