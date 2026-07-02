---
name: rule-architecture
description: |
  백엔드(Java/Kotlin)·프론트엔드(TS/TSX) 코드를 작성·리팩토링할 때 Clean Architecture 의존성 방향과 모듈 구조를 점검한다. 대상 파일: **/*.java, **/*.kt, **/*.kts, **/*.ts, **/*.tsx.
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
