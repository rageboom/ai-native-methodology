# 🏢 테크기업/학계 사례 리서처 — 대형 코드베이스 LLM 분석

> 본 문서는 우리가 풀려는 문제(대형 레거시를 LLM으로 분석)에 대해 **이미 검증된 패턴**을 정리한다.

## 1. 학계 컨센서스 (2025 기준)

### 1.1 TCS Research, ICSE 2025 (LLM4Code) — Hierarchical Repository-Level Code Summarization
- 논문: arXiv:2501.07857
- 핵심: **Two-step hierarchical** = Segment → File → Package → Repository
- 결정적 발견 1: **AST 기반 분해**가 단순 토큰/라인 분해보다 압도적으로 우수.
- 결정적 발견 2: **Domain/Problem context grounding** 프롬프트가 요약 품질을 정성적으로 격상시킴.
- 적용 도메인: 통신사 BSS (사실상 우리와 같은 카테고리 — 대형 엔터프라이즈 Java/Spring 레거시)
- 평가 지표: Completeness, Conciseness, Correctness, Cohesiveness, Domain Specificity (G-Eval)

### 1.2 ICCSA 2025 — Repository-Level Code Understanding via Hierarchical Summarization
- 핵심: **Top-down search** — 디렉토리→파일 단위로 점진적 좁힘
- 평가 결과: Pass@10 = 0.89, Recall@10 = 0.33 (Flat Retrieval 및 LLM+RAG 베이스라인 압도)
- 결정적 발견: **Project-level → Directory-level → File-level** 3계층이 실용적 sweet spot.

### 1.3 Code-Craft / HCGS (arXiv:2504.08975)
- 핵심: **Bottom-up traversal** — 리프(함수)부터 요약하고 부모는 자식 요약을 상속
- LSP(Language Server Protocol) 활용으로 **언어 무관(language-agnostic)** 달성
- 결정적 발견: Top-1 retrieval precision **최대 82% 상대 개선** (대형 코드베이스 libsignal)
- 우리에게 시사: 우리도 **bottom-up이 더 안전**. Top-down은 큰 추상 단계에서 잘못 판단하면 하위 다 틀어짐.

## 2. 학계 컨센서스 요약 (3개 논문 일치점)

세 연구가 다른 기관/다른 도메인에서 같은 결론에 도달:

1. ✅ **AST 기반 코드 분해**가 토큰 윈도우 한계의 진짜 해결책
2. ✅ **3~4 계층 요약**이 표준 (Segment/File/Module/Repo)
3. ✅ **Bottom-up 전파**가 정확도에 유리 (HCGS 결과)
4. ✅ **도메인 컨텍스트 grounding**이 비즈니스 요약 품질의 핵심

## 3. 산업 사례 (Cursor, Codeium, GitHub)

- **Cursor "Ask Codebase"**: 인덱싱 + 임베딩 기반 RAG. 단점은 의미 단위가 아닌 청크 기반.
- **Codeium "Chat with Codebase"**: 유사 구조.
- **GitHub Copilot Workspace**: spec → plan → implement 워크플로우 (우리 4원칙과 유사).
- **공통 한계**: 위 도구들은 **재구현 명세 생성**보다는 **질문 응답**에 최적화됨. 우리 목적(재구현용 도메인 모델 추출)과는 다름 → 우리가 빈 영역을 채움.

## 4. AutoCodeRover, RepoCoder, GraphCoder

- **AutoCodeRover** (ISSTA 2024): Autonomous program improvement. 코드 그래프를 명시적으로 활용.
- **RepoCoder** (arXiv:2303.12570): Iterative retrieval + generation.
- **GraphCoder**: Code context graph 기반 retrieval.
- **공통 패턴**: **그래프 + LLM**이 단일 LLM보다 우수. 우리도 의존성 그래프를 분석 입력으로 같이 넘겨야 함.

## 5. 우리 케이스에 적용 가능한 5가지 교훈

### L1. AST 분해는 협상 불가
- 라인/토큰 청크는 함수 중간을 자르고 클래스 경계를 무시함 → 요약 품질 망가짐.
- **결정**: 각 언어별 AST 파서를 **무조건** 어댑터로 둔다.
  - TS/JS: `@typescript-eslint/parser` 또는 `tree-sitter-typescript`
  - Java/Kotlin: `tree-sitter-java`, `tree-sitter-kotlin`
  - 공통 폴백: `tree-sitter` (다언어 지원)

### L2. Bottom-up이 안전
- Top-down은 매력적이지만 상위 추상이 틀리면 전체 오염.
- **결정**: Function/Class → File → Module → System 순서로 **반드시 bottom-up**.

### L3. 도메인 grounding 프롬프트
- TCS Research가 검증: 도메인 설명을 prompt에 명시하면 요약 품질 격상.
- **결정**: 사용자가 `domain-context.md`를 프로젝트 루트에 두면 모든 요약 호출에 자동 주입.

### L4. 의존성 그래프는 요약과 별개로 추출
- HCGS, GraphCoder 모두 그래프를 요약 입력으로 활용.
- **결정**: 의존성 그래프(import/call edges)는 **AST 단계에서 결정론적으로 추출** (LLM 없이). 그래프를 LLM의 컨텍스트로 주입하여 더 정확한 요약 유도.

### L5. 평가 지표 도입
- TCS Research의 5가지: Completeness/Conciseness/Correctness/Cohesiveness/Domain Specificity.
- **결정**: 우리는 산출물에 **자체 검증 체크리스트**를 포함. (LLM-as-Judge로 자동 점수)

## 6. 차별화 포인트

이미 학계가 답을 안 부분에서 우리가 추가하는 가치:

1. **Claude Code 네이티브**: 별도 인프라 없이 Subagent + Skill로 구현 → 사내 air-gapped 환경에서도 (LLM만 교체하면) 동작 가능.
2. **재구현 명세 자동 생성**: 단순 요약/검색이 아니라 **OpenAPI + ADR 초안 + Harness Template 입력**까지.
3. **사람 검토 가능 형식**: 모든 산출물이 마크다운 + JSON Schema → 시니어 BE 저항 완화 (블랙박스 아님).
