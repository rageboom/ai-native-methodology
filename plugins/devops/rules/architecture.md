---
description: 백엔드/프론트엔드 아키텍처 규칙
paths:
  - "**/*.java"
  - "**/*.kt"
  - "**/*.kts"
  - "**/*.ts"
  - "**/*.tsx"
---

# Architecture Rules

## Backend: Clean Architecture

- Domain layer에 외부 라이브러리 import 금지
- 의존성 방향: Presentation → Application → Domain ← Infrastructure

### Java 모듈 구조 (eam, tlm, gea, itg)

- `{project}-api/` → Presentation layer
- `{project}-core/` → Application + Domain + Infrastructure

### Kotlin 모듈 구조 (observer)

- `bootstrap/`, `api/`, `application/`, `domain/`, `infrastructure/`, `common/`
- `*Config` 클래스 → 반드시 `..config..` 패키지에 위치
- `@Configuration` 어노테이션 → 반드시 `..config..` 패키지에 위치
- 새 @Configuration 클래스 추가 시 `common/config/` 패키지에 넣을 것

## Frontend: Turborepo Monorepo

- `apps/` → 개별 앱
- `packages/` → 공유 라이브러리
