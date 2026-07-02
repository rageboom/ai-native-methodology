---
name: spec-write
description: >
  SDD(Spec-Driven Development) 기능 명세서 작성. Given-When-Then 시나리오 기반.
when_to_use: "Given-When-Then 시나리오 기반 신규 기능 spec 작성 요청 시"
argument-hint: [기능명]
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
effort: high
---

# 기능 명세서 작성

$ARGUMENTS 기능에 대한 SDD 명세서를 작성해주세요.

## SDD 원칙

- 스펙이 진실의 원천 (Specification as Source of Truth)
- 코드보다 스펙이 먼저 (Spec Before Code)
- 검증 가능한 요구사항 (Verifiable Requirements)
- 변경은 추적 가능 (Traceable Changes)

## 명세서 구조

### 1. 개요 (Overview)
- 기능 목적: 왜 필요한가
- 비즈니스 가치: 누구에게 어떤 가치를 제공하는가
- 범위: 무엇을 포함하고, 무엇을 제외하는가

### 2. 요구사항 (Requirements)

#### 기능적 요구사항 (Functional)
각 항목에 Given-When-Then 시나리오 포함:
```
FR-001: [기능명]
  Given: [사전 조건]
  When: [사용자 행동]
  Then: [기대 결과]
```

#### 비기능적 요구사항 (Non-Functional)
- 성능: 응답 시간, 처리량
- 보안: 인증/인가, 데이터 보호
- 가용성: SLA 목표

### 3. 기술 설계 (Technical Design)
- 아키텍처 다이어그램 (Mermaid)
- API 인터페이스 정의 (경로, 메서드, 요청/응답 스키마)
- 데이터 모델 변경사항
- 의존 서비스 목록

### 4. 태스크 분해 (Task Breakdown)
구현 순서대로 작성:
```
T-001: [태스크명] (예상 시간: Xh)
  - 변경 파일: [파일 목록]
  - 의존: [선행 태스크]
  - 검증: [완료 기준]
```

### 5. 테스트 계획 (Test Plan)
- 단위 테스트 시나리오
- 통합 테스트 시나리오
- 엣지 케이스

## 프로젝트 컨텍스트

- Backend: Clean Architecture (Presentation -> Application -> Domain <- Infrastructure)
- Java 모듈: `{project}-api/` + `{project}-core/`
- Kotlin(observer): 6계층 구조
- Frontend: Turborepo monorepo

## 출력

명세서를 `docs/specs/{기능명}.md`에 저장하고 요약을 보고해주세요.
