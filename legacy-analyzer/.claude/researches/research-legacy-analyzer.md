# Research: Legacy Analyzer 설계 — 3-Agent Discussion

> 본 문서는 📘 공식문서 리서처, 🏢 테크기업 사례 리서처, 🎯 Senior Frontend Engineer 3인의 토론을 통해 도출된 합의 설계안이다.
> 사전 자료: `document-legacy-analyzer.md`, `case-legacy-analyzer.md`

---

## Round 1: 어떤 빌딩블록을 어디에 쓸 것인가

**📘 공식문서 리서처**: Claude Code는 4종(Skills/Commands/Subagents/Hooks)이 있고, 공식 권장은 Skills 통합이다. 우리는 풀 패키지를 만들기로 했으니 셋 다 쓰되, **Skills를 공통 능력 단위, Commands를 워크플로우 진입점, Subagents를 컨텍스트 격리 장치**로 명확히 분리하자.

**🏢 사례 리서처**: 학계는 단일 모델 호출 체인 가정인데, 우리는 Subagent라는 강력한 카드가 있다. **TCS의 segment→file→module→repo 4계층을 Subagent 격리로 매핑**하면 컨텍스트 윈도우 제약을 자연스럽게 푼다. 메인 Claude는 통합만 하고, 격리된 subagent가 raw 코드를 본다.

**🎯 Senior FE Engineer**: 두 분 의견 좋다. 그런데 현장에서 보면 **실패하는 분석 툴은 거의 항상 "한 방에 다 하려는 것"**. 사용자가 중간 결과를 보고 검토·수정할 수 있어야 한다. 그래서 워크플로우를 **5개 명령어로 쪼개고**, 각 단계 출력이 다음 단계 입력으로 들어가도록 **파일 시스템을 메모리로** 사용하자. `.claude/output/` 디렉토리에 단계별 산출물.

**합의 ✅**: 
- Skills = 재사용 함수 (7개)
- Commands = 명시적 워크플로우 단계 (7개: 5단계 + analyze-full + generate-harness)
- Subagents = 격리된 분석 전문가 (4개)
- 단계 간 통신 = `.claude/output/` 파일 시스템

---

## Round 2: 계층적 요약을 어떻게 구현할 것인가

**🏢 사례 리서처**: 학계 결론은 명확하다. **AST 분해 + Bottom-up 4계층**. TCS와 HCGS가 이걸로 30~80% 정확도 개선을 보였다.

**📘 공식문서 리서처**: Claude Code Subagent는 자체 컨텍스트가 있으니 각 계층마다 별도 Subagent 호출이 가능하다. 단, 매번 호출하면 **비용 폭증**. Layer 1(파일별 요약)은 수백~수천 번 호출되어야 하니 비용 최적화 필요.

**🎯 Senior FE Engineer**: 비용 문제는 실전에서 항상 터진다. 두 가지 대비책:
1. **점진적 실행**: 한 번에 전체 레포 X. 디렉토리 단위로 잘라서 사용자가 명시적으로 진행. "이번엔 src/auth만 분석해" 같은 옵션.
2. **결정적 단계와 LLM 단계 분리**: AST 파싱·의존성 추출·통계는 결정적(LLM 없이) 처리. LLM은 **요약·도메인 추론·안티패턴 감지** 같은 진짜 추론 영역에만.

**합의 ✅**: 
- 4계층: Function/Class → File → Module(Directory) → System
- Bottom-up 전파
- AST/통계/그래프 = 결정적 단계 (skill: `repo-inventory`, `dependency-graph-builder`)
- 요약/도메인/안티패턴 = LLM 단계 (skill: `hierarchical-summarizer`, `domain-extractor`, `antipattern-detector`)
- **`--scope` 옵션**으로 부분 분석 지원 (예: `/analyze-domain --scope src/auth`)

---

## Round 3: 다양한 스택을 어떻게 지원할 것인가

**🏢 사례 리서처**: HCGS가 LSP(Language Server Protocol)로 언어 무관 처리를 했다. 우리는 LSP 대신 **Tree-sitter**를 쓰는 게 Claude Code 환경에 맞다 — 별도 LSP 서버 띄울 필요 없이 라이브러리로 동작.

**📘 공식문서 리서처**: Skill에 스크립트를 동봉할 수 있다. Tree-sitter 파서를 skill 디렉토리에 같이 넣고, Claude가 Bash로 호출하는 구조 가능.

**🎯 Senior FE Engineer**: Tree-sitter 좋다. 하지만 1차에서 모든 언어 지원하려다 망친다. **TF의 핵심 스택 3개부터** (TS/JS, Java, Kotlin). 나머지는 **휴리스틱 폴백**(정규식 import 추출 + LLM 추론). 어댑터가 추가될 때마다 정확도 향상되는 구조.

**합의 ✅**: 
- Tree-sitter 기반 어댑터 패턴
- 1차: TS/JS, Java, Kotlin
- 폴백: 정규식 + LLM (어댑터 부재 시)
- 추후 확장: Python, Go, C#

---

## Round 4: 산출물 형식과 Harness Template 연계

**📘 공식문서 리서처**: `harness-engineering-study` 레포는 이미 AGENTS.md, ADR, OpenAPI 형식이 정해져 있다. 우리 분석 출력이 그 형식을 **그대로 채워 넣을 수 있는 입력**이 되어야 한다.

**🎯 Senior FE Engineer**: 핵심이다. **출력 스키마를 먼저 고정**하고 분석 단계는 그 스키마를 채우는 작업이 되도록 설계. 거꾸로 가지 마라. 구체적으로:
- `architecture.json` → Mermaid + 의존성 그래프 (harness의 architecture 섹션 입력)
- `domain.json` → 엔티티/유스케이스 명세 (harness의 domain 섹션 입력)
- `antipatterns.md` → 회피 체크리스트
- `api.yaml` → OpenAPI 3.1 (harness의 contract 섹션 입력)
- `harness-draft/` → 위 4개를 묶어 자동 생성한 Harness 템플릿 초안 (사람 검토 필수)

**🏢 사례 리서처**: 좋다. 추가로 **자체 검증 체크리스트**(TCS의 G-Eval 5지표)를 산출물에 같이 붙이자. LLM-as-Judge로 자동 점수 매기는 후처리 단계.

**합의 ✅**: 
- 스키마 우선 설계 (출력 JSON Schema를 `.claude/schemas/`에 명시)
- Harness Template 폴더 구조와 1:1 매칭
- G-Eval 자체 검증 체크리스트 포함

---

## Round 5: 시니어 BE 저항 완화 (사회기술적 이슈)

**🎯 Senior FE Engineer**: 이건 기술 문제가 아니다. 시니어 BE가 거부감을 느끼는 핵심 이유는:
1. 블랙박스 ("AI가 멋대로 결정")
2. 통제권 상실 ("내가 검토 못 함")
3. 평가 위협 ("내 코드를 안티패턴이라고 판정")

**해결책 3가지**:
1. **모든 산출물은 마크다운 + JSON** = grep, diff, code review 가능. 블랙박스 아님.
2. **사람 승인 게이트** = 각 단계 끝에 사용자 확인 (4원칙 그대로). 자동 진행은 옵션이고 기본은 수동.
3. **안티패턴 톤 조정** = "이건 잘못됐다"가 아니라 **"재구현 시 회피 후보"**. 비난 아닌 결정 입력.

**📘 공식문서 리서처**: Subagent를 `model: sonnet` 또는 권한 제한해서 **확인 메시지 많이 띄우게** 설정 가능. 자동 실행 안 하고 항상 묻도록.

**🏢 사례 리서처**: TCS 논문도 **business-context grounding** 강조했다. 비즈니스 도메인 어휘로 출력하면 BE도 거부감 적다. "Service", "Repository", "Aggregate" 같은 익숙한 용어로.

**합의 ✅**: 
- 모든 산출물 = 텍스트 파일 (블랙박스 X)
- 단계별 사용자 승인 게이트 기본 활성
- 안티패턴 → "회피 후보" 톤
- DDD/Clean Architecture 어휘로 도메인 모델 작성

---

## 최종 합의 아키텍처

### 6.1 전체 워크플로우

```
[1단계] /analyze-init <repo-path>
   ├─ skill: repo-inventory (결정적)
   │   ├─ 디렉토리 트리, 파일 통계, 언어 분포
   │   ├─ 패키지 매니페스트(package.json, pom.xml...) 파싱
   │   └─ 출력: .claude/output/inventory/
   │       ├─ tree.md
   │       ├─ stats.json
   │       └─ stack-detection.md
   └─ [사용자 승인 게이트] → 다음 단계 진행 여부 확인

[2단계] /analyze-arch
   ├─ skill: dependency-graph-builder (결정적, AST + tree-sitter)
   ├─ subagent: architect-reviewer (LLM, 그래프 해석)
   │   └─ 순환 의존성, 레이어 위반, 모듈 경계 위반 식별
   └─ 출력: .claude/output/architecture/
       ├─ dependency-graph.json
       ├─ dependency-graph.mermaid
       └─ architecture-review.md

[3단계] /analyze-domain
   ├─ subagent: code-reader (격리, bottom-up 요약)
   │   └─ skill: hierarchical-summarizer (Function→File→Module)
   ├─ subagent: domain-analyst (DDD 관점)
   │   └─ skill: domain-extractor
   └─ 출력: .claude/output/domain/
       ├─ entities.json
       ├─ use-cases.md
       ├─ aggregates.md
       └─ ubiquitous-language.md

[4단계] /analyze-antipatterns
   ├─ skill: antipattern-detector
   ├─ 입력: 위 1~3단계 산출물 + 원본 코드 부분 참조
   └─ 출력: .claude/output/antipatterns/
       └─ avoid-list.md (회피 후보 체크리스트)

[5단계] /analyze-api
   ├─ subagent: contract-writer
   │   └─ skill: api-contract-extractor (controller/router 스캔)
   └─ 출력: .claude/output/api/
       └─ openapi.yaml

[통합] /analyze-full
   └─ 1~5단계 순차 실행 (각 단계 사이 승인 게이트)

[End-to-end] /generate-harness
   ├─ skill: harness-template-generator
   ├─ 입력: .claude/output/ 전체
   └─ 출력: .claude/output/harness-draft/
       ├─ AGENTS.md (분석된 도메인 기반)
       ├─ ADR-001~N (주요 아키텍처 결정 초안)
       ├─ openapi.yaml (FE-BE 계약)
       └─ harness-template.md (Planner/Generator/Evaluator 3-agent용 입력)
```

### 6.2 디렉토리 구조 (확정)

```
legacy-analyzer/
├── .claude/
│   ├── skills/
│   │   ├── repo-inventory/
│   │   │   ├── SKILL.md
│   │   │   ├── stack-detector.sh
│   │   │   └── tree-sitter-adapters/
│   │   │       ├── ts-js.md
│   │   │       ├── java.md
│   │   │       └── kotlin.md
│   │   ├── hierarchical-summarizer/
│   │   │   ├── SKILL.md
│   │   │   ├── prompts/
│   │   │   │   ├── function-summary.md
│   │   │   │   ├── file-summary.md
│   │   │   │   ├── module-summary.md
│   │   │   │   └── system-summary.md
│   │   │   └── domain-grounding-template.md
│   │   ├── dependency-graph-builder/
│   │   │   ├── SKILL.md
│   │   │   └── extractors/ (per-language)
│   │   ├── domain-extractor/
│   │   │   └── SKILL.md
│   │   ├── antipattern-detector/
│   │   │   ├── SKILL.md
│   │   │   └── patterns/ (체크리스트 베이스)
│   │   ├── api-contract-extractor/
│   │   │   └── SKILL.md
│   │   └── harness-template-generator/
│   │       ├── SKILL.md
│   │       └── templates/ (harness-engineering-study 호환)
│   ├── commands/
│   │   ├── analyze-init.md
│   │   ├── analyze-arch.md
│   │   ├── analyze-domain.md
│   │   ├── analyze-antipatterns.md
│   │   ├── analyze-api.md
│   │   ├── analyze-full.md
│   │   └── generate-harness.md
│   ├── agents/
│   │   ├── code-reader.md
│   │   ├── domain-analyst.md
│   │   ├── architect-reviewer.md
│   │   └── contract-writer.md
│   ├── schemas/
│   │   ├── inventory.schema.json
│   │   ├── architecture.schema.json
│   │   ├── domain.schema.json
│   │   ├── antipatterns.schema.json
│   │   └── api.schema.json (OpenAPI 3.1)
│   ├── output/                  # 분석 결과 (gitignore)
│   └── settings.json            # hooks (lint, schema validation)
├── .claude-plugin/
│   └── marketplace.json         # 사내 plugin 배포용
├── domain-context.md.example    # 사용자가 채워야 할 도메인 grounding 템플릿
├── README.md
├── INSTALL.md
└── examples/
    └── example-poc.md           # 오픈소스 레포로 PoC 예시
```

### 6.3 핵심 설계 원칙 5가지

1. **Bottom-up always**: Function → File → Module → System. 절대 역방향 X.
2. **Deterministic first, LLM second**: AST/통계/그래프는 결정적. LLM은 요약·추론에만.
3. **File system as memory**: 단계 간 통신은 `.claude/output/` 파일.
4. **Schema-first**: 출력 JSON Schema를 먼저 고정. 분석은 채우는 작업.
5. **Human-in-the-loop**: 단계마다 승인 게이트. 자동 체이닝은 옵션.

---

## Open Questions (사용자 확인 필요)

1. 출력 언어: **한국어** 권장 (TF 멤버 가독성). 코드 식별자/스키마는 영어. 이게 맞나?
2. 1차 PoC 시드 레포: 사내 레거시 1개 vs 오픈소스 (예: Spring PetClinic) 1개. 어떤 걸로 시작?
3. `harness-engineering-study`와의 통합: 같은 모노레포 vs sister-repo. 어떤 모델?
4. 비용 제어: 1회 분석 시 LLM 호출 상한선을 어떻게 둘지 (예: `--max-llm-calls 500`)?
