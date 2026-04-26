# Plan: AI-Native Legacy Analyzer (Claude Code 기반)

> 작성일: 2026-04-26
> 작성자: 윤주스 (Frontend Lead, AI-Native Legacy Migration TF)
> 적용 원칙: Work Principles 4원칙

---

## 1. 목적 (Why)

대형 레거시 코드베이스(100K+ LOC, 다양한 스택)를 AI로 분석하여,
재구현(Harness Engineering 표준 기반)에 필요한 **명세·계약·가이드를 자동 생성**하는 툴킷을 Claude Code 위에서 구축한다.

이 툴은 단독 결과물이 아니라 **`harness-engineering-study` 레포의 입구(Entry Point)** 로 동작한다:

```
[레거시 레포] → (Legacy Analyzer) → [명세/계약/ADR 초안] → (Harness Templates) → [재구현 코드]
```

---

## 2. 산출물 정의 (What)

### 2.1 분석 결과물 (생성되어야 하는 4가지 deliverable)

| 산출물 | 형태 | 용도 |
|---|---|---|
| **아키텍처/의존성 그래프** | Mermaid + JSON | 모듈 경계, 순환 의존성, 레이어 위반 식별 |
| **도메인 모델 명세** | Markdown + JSON Schema | 재구현 시 비즈니스 로직 1:1 매핑 기준 |
| **안티패턴 카탈로그** | Markdown 체크리스트 | 재구현 시 반드시 제거해야 할 항목 |
| **API 계약** | OpenAPI 3.1 YAML | FE-BE 계약, contract-first 재구현 입력 |

### 2.2 툴 자체 산출물 (이 프로젝트가 만들어내는 것)

3계층 풀 패키지:

```
legacy-analyzer/
├── .claude/
│   ├── skills/                         # 재사용 가능한 능력 단위
│   │   ├── repo-inventory/             # 레포 구조/통계 수집
│   │   ├── hierarchical-summarizer/    # 계층적 요약 엔진
│   │   ├── dependency-graph-builder/   # AST/import 분석
│   │   ├── domain-extractor/           # 비즈니스 로직 추출
│   │   ├── antipattern-detector/       # 안티패턴 식별
│   │   ├── api-contract-extractor/     # OpenAPI 추출
│   │   └── harness-template-generator/ # Harness 템플릿 자동 생성
│   ├── commands/                       # 사용자 실행 진입점
│   │   ├── analyze-init.md             # 1단계: 인벤토리
│   │   ├── analyze-arch.md             # 2단계: 아키텍처
│   │   ├── analyze-domain.md           # 3단계: 도메인
│   │   ├── analyze-antipatterns.md     # 4단계: 안티패턴
│   │   ├── analyze-api.md              # 5단계: API
│   │   ├── analyze-full.md             # 전체 파이프라인 실행
│   │   └── generate-harness.md         # End-to-end: Harness 자동 생성
│   ├── agents/                         # 역할별 서브에이전트
│   │   ├── code-reader.md              # 코드 정밀 분석 전담
│   │   ├── domain-analyst.md           # DDD 관점 분석
│   │   ├── architect-reviewer.md       # 아키텍처 검토
│   │   └── contract-writer.md          # OpenAPI 작성
│   └── output/                         # 분석 결과 저장 위치
│       ├── inventory/
│       ├── architecture/
│       ├── domain/
│       ├── antipatterns/
│       ├── api/
│       └── harness-draft/
├── README.md
├── INSTALL.md
└── examples/
```

---

## 3. 핵심 기술적 도전 (Risk-First)

### R1. 컨텍스트 윈도우 한계 (최우선 리스크)

**문제**: 100K+ LOC는 단일 Claude 컨텍스트에 절대 들어가지 않음.
Opus 4.7 기준 200K 토큰 ≈ 약 600~800K LOC (실제로는 분석 메타데이터 때문에 1/10 수준).

**해결 전략**: **3-Layer Hierarchical Summarization**

```
Layer 0 (Raw)       : 원본 파일들
   ↓ map (per file)
Layer 1 (File)      : 파일별 요약 (역할/공개API/의존성/도메인 키워드)
   ↓ reduce (per directory)
Layer 2 (Module)    : 디렉토리/모듈별 요약 (책임/경계/내부의존성)
   ↓ reduce (per layer)
Layer 3 (System)    : 시스템 전체 요약 (아키텍처/도메인/계약)
```

각 Layer는 **다음 Layer 분석의 입력**으로만 사용. 절대 raw 코드를 끝까지 들고 가지 않음.

### R2. 다양한 스택 대응

**문제**: TS/JS/Java/Kotlin/Python/Go… 각자 의존성 추출 방식이 다름.

**해결 전략**: **Strategy Pattern (per-language adapter)**
- 1차 PoC: TS/JS, Java, Kotlin (TF의 주력 스택)
- 추후 확장: Python, Go, C# 어댑터 추가
- 어댑터가 없는 언어는 **휴리스틱 폴백** (정규식 + LLM 추론)

### R3. 결정성/재현성

**문제**: LLM 호출은 비결정적 → 같은 레포를 두 번 분석하면 다른 결과.

**해결 전략**:
- 모든 LLM 호출에 **structured output (JSON Schema)** 강제
- 중간 산출물(Layer 1, 2)을 파일로 영속화 → 재실행 시 캐시
- 사람이 검토/수정 가능한 마크다운 형식으로 모든 결과 저장

### R4. Claude Code 환경의 특성

**문제**: Python/Node 백엔드와 다르게 LangGraph 같은 명시적 워크플로우 엔진이 없음.

**해결 전략**:
- **Slash Commands가 워크플로우 단계** 역할 (사용자가 명시적으로 진행)
- **Subagents가 병렬 작업자** 역할 (각자 다른 컨텍스트로 분석)
- **Skills가 재사용 가능한 함수** 역할
- 상태(State)는 `.claude/output/` 디렉토리의 파일로 관리 (파일이 곧 메모리)

### R5. 재구현 단계와의 인터페이스

**문제**: 분석 결과를 Harness Template이 어떻게 소비할 것인가?

**해결 전략**:
- 출력 형식을 `harness-engineering-study` 레포의 `AGENTS.md`, ADR, OpenAPI 형식과 1:1 매칭
- `generate-harness` 명령어가 분석 결과 → Harness 템플릿 폴더 구조로 매핑

---

## 4. 작업 범위 (Scope)

### 4.1 In Scope (이번 작업)

- [ ] 3-Layer 계층적 요약 엔진 (skill)
- [ ] 7개 핵심 skill 구현
- [ ] 7개 slash command 구현
- [ ] 4개 subagent 정의
- [ ] TS/JS, Java, Kotlin 언어 어댑터
- [ ] `harness-engineering-study` 호환 출력 포맷
- [ ] README + INSTALL + 예제 1개 (오픈소스 레포 대상)

### 4.2 Out of Scope (이번엔 안 함)

- ❌ 별도 웹 UI / 대시보드
- ❌ Python/Go/C# 어댑터 (추후 확장)
- ❌ 실제 코드 자동 생성 (재구현은 `harness-engineering-study`가 담당)
- ❌ CI 통합 (Jenkins/GHA) — 1차는 로컬 Claude Code 실행 전제
- ❌ 멀티 레포 동시 분석 (1차는 단일 레포)

---

## 5. 변경/생성 대상

이 프로젝트는 **신규 레포**. 기존 코드 수정 없음. 단:
- `harness-engineering-study` 레포의 **출력 포맷 명세를 참조**해야 함 (스키마 호환성)
- 추후 두 레포를 sister-repo로 운영할 가능성 있음

---

## 6. 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| **레거시 마이그레이션 TF 워크플로우** | 분석 자동화로 초기 디스커버리 기간 70%+ 단축 기대 |
| **시니어 BE 저항** | "AI가 코드를 본다" 거부감 → 분석 결과를 **사람이 검토·수정 가능**하게 만들어 완화 |
| **하니스 표준 적용** | 분석 결과가 그대로 표준 인풋이 되므로 일관성↑ |
| **재구현 품질** | 안티패턴 카탈로그가 재구현 시 회피 체크리스트로 작용 |

---

## 7. 마일스톤 (제안)

| 단계 | 산출물 | 검증 방법 |
|---|---|---|
| M1: 인벤토리 + 계층적 요약 | `repo-inventory`, `hierarchical-summarizer` skills | 중규모 오픈소스 레포로 PoC |
| M2: 의존성 그래프 + API 계약 | `dependency-graph-builder`, `api-contract-extractor` skills | Mermaid 렌더링, OpenAPI lint 통과 |
| M3: 도메인 + 안티패턴 | `domain-extractor`, `antipattern-detector` skills | 사람 검토 일치율 ≥80% |
| M4: 통합 명령어 + Harness 생성 | `analyze-full`, `generate-harness` commands | `harness-engineering-study` 템플릿과 호환 |
| M5: 검증 | 실제 사내 레거시 1개 적용 (소규모부터) | TF 멤버 리뷰 |

---

## 8. 결정 필요 사항 (Open Questions → 사용자 확인 필요)

1. **출력 언어**: 분석 결과 문서를 한국어로 생성할지, 영어로 생성할지, 혼합인지
2. **검증 게이트**: 각 단계(M1~M4) 산출물에 사람 승인 게이트를 둘지, 자동 체이닝할지
3. **시드 레포**: PoC 검증용으로 어떤 오픈소스/사내 레포를 쓸지
4. **harness-engineering-study와의 통합**: 같은 레포에 합칠지, 별도 레포로 둘지

---

## 9. Lessons Learned

(아직 없음. 4원칙에 따라 실패 발생 시 이 섹션에 기록)
