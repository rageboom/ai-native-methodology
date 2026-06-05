# 산출물 #1: 아키텍처/의존성 (Architecture & Dependencies)

> **사상**: Schema-First (코드 전 스키마 합의)
> **schema**: `schemas/architecture.schema.json` · **template**: json 단독 / 별도 template 파일 ❌, schema-driven
> **생성 phase**: `architecture` phase (`/analyze-architecture`)

---

## 1. 목적

**답하는 질문**: "이 시스템은 어떤 모듈로 구성되며, 모듈 간 의존 관계는?"

**AI 재구현 시 활용**: 모듈 분리·빌드 순서 결정 / 영향 범위 추적

---

## 2. 형식

```
output/architecture/
├── architecture.json              # json 단독 SSOT (구조화 / dependency graph 포함)
└── circular-dependencies.md       # 순환 의존성 보고서 (있을 경우)
```

**핵심 결정**:

- C4 Level 3 컴포넌트 구조 + 모듈 간 의존성 그래프를 `architecture.json` 에 구조화 (v12 json 단독 SSOT / 시각화는 view-time 도구)
- 모듈 = 패키지/디렉토리 단위 (언어별 관례)

---

## 3. 추출 범위

### 3.1 추출 대상 (출처 / 방법 / 신뢰도 / 의존)

| 항목                 | 추출 출처                                    | 방법         | 신뢰도 | 선행 의존      |
| -------------------- | -------------------------------------------- | ------------ | ------ | -------------- |
| 모듈 식별            | 디렉토리 구조 + 패키지 선언                  | 결정적       | 0.98   | —              |
| 외부 의존성          | 패키지 매니페스트 (pom.xml, package.json 등) | 결정적       | 0.98   | —              |
| 모듈 간 의존성       | AST import/require 그래프                    | 결정적       | 0.98   | 모듈 식별      |
| 순환 의존성          | 의존성 그래프 DFS/BFS                        | 결정적       | 0.98   | 모듈 간 의존성 |
| 레이어 분류          | controller/service/repository 패턴           | 결정적 + LLM | 0.85   | 모듈 식별      |
| 아키텍처 스타일 추론 | 디렉토리 패턴 + 의존 방향                    | LLM          | 0.70   | 모듈 간 의존성 |

**입력**: 소스 코드 + `discovery` phase inventory
**출력**: `architecture.json` (모듈 간 의존성 그래프 포함) + `circular-dependencies.md` (있을 시)
**사람 검토 필수**: 아키텍처 스타일 추론

### 3.2 미추출 (의도적)

- 런타임 의존성 (DI 컨테이너 동적 바인딩) → `business-logic` phase 에서 추론
- 빌드 타임 의존성 (Gradle task 순서) → 인벤토리에서 참조
- 외부 서비스 통합 → `business-logic` phase 5.D 에서 처리

---

## 4. 아키텍처 스타일 추론 패턴

| 스타일             | 감지 단서                                              | 신뢰도          |
| ------------------ | ------------------------------------------------------ | --------------- |
| Layered            | `controller/`, `service/`, `repository/` 디렉토리      | 0.85            |
| Hexagonal          | `port/`, `adapter/`, `application/`, `domain/`         | 0.80            |
| Clean Architecture | `usecase/`, `entity/`, `interface/`, `infrastructure/` | 0.80            |
| MVC                | `models/`, `views/`, `controllers/`                    | 0.85            |
| Monolith           | 단일 빌드 + 단일 배포 단위                             | 0.90            |
| Microservices      | 다중 서비스 디렉토리 + 독립 빌드                       | 0.80            |
| 혼합/불분명        | 위 패턴에 맞지 않음                                    | 0.50 (LLM 추론) |

---

## 5. 검증 체크리스트

```
□ architecture.json schema 검증 통과
□ 의존성 그래프 노드/엣지 정합 (architecture.json 내 / 시각화는 view-time 도구)
□ 모든 모듈에 ID 부여
□ 순환 의존성 있으면 안티패턴(#6) 에도 등록
□ 아키텍처 스타일 = 사용자 확인
□ `discovery` phase inventory 와 모듈 수 정합
```

---

## 6. 산출물 간 참조

| 방향             | 의미               |
| ---------------- | ------------------ |
| ARCH → DOM       | 모듈 경계 제공     |
| ARCH → DB        | 모듈 → 테이블 그룹 |
| ARCH → AP        | 순환 의존성 등록   |
| EXT (5.D) → ARCH | 외부 통합 지점     |

---

## 7. 흔한 함정

### 7.1 generated 코드 포함

- 증상: `build/`, `dist/` 등의 import 까지 그래프에 포함
- 대응: `.gitignore` + 추가 제외 패턴 적용

### 7.2 동적 import 누락

- 증상: `require(variable)`, `import()` 동적 호출 감지 실패
- 대응: 동적 import 패턴 별도 추적 + 신뢰도↓ 표기

### 7.3 아키텍처 스타일 과신

- 증상: 디렉토리명만 보고 Hexagonal 판단 → 실제론 Layered
- 대응: 의존 방향 분석 필수 (domain → infra 의존 시 Hexagonal 아님)

---

## 인용

- ADR: ADR-001 (Schema-First — 코드 전 스키마 합의)
- ADR: ADR-011 (json 단독 SSOT — template 파일 폐기)
- schema: `schemas/architecture.schema.json`
