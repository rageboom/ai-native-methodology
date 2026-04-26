# AI-Native 개발 방법론 v1.1.1 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론.
다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

## 현재 상태 (2026-04-26)

- 방법론 본체: v1.1.1 (M2 완료)
- PoC #01: Phase 0 완료, Phase 1 대기
- 다음 액션: ai-native-methodology/examples/poc-01-realworld-spring/findings/poc-findings.md 참조

## Work Principles (모든 프로젝트 공통 4원칙)

IMPORTANT: 모든 작업에 아래 4원칙을 순환적으로 적용. 이 원칙은 모든 하위 프로젝트에 동일 적용.

### 1원칙: 깊은 숙지 → plan.md 작성

- 작업 착수 전 관련 파일 전수 조사 (버전, 아키텍처, 컨벤션, 의존성, 설정 등)
- 분석 결과를 `.claude/plans/plan{구분을 위한 토픽}.md`에 정리 (작업 범위, 변경 대상, 영향도, 리스크)
- plan.md 없이 코드 수정 착수 금지

### 2원칙: 에이전트 팀 토론 → .claude/researches/research{구분을 위한 토픽}.md 작성

3가지 에이전트를 병렬 운용하여 해결방안 도출:

1. **공식문서 리서처**: 관련 기술 공식 문서 조사 → `.claude/researches/document{구분을 위한 토픽}.md` 기록
2. **테크기업 사례 리서처**: Netflix, Google, Meta 등 유명 테크기업 유사 사례 조사 → `.claude/researches/case{구분을 위한 토픽}.md` 기록
3. **Senior Engineer (작업 도메인 적응 — FE/BE/아키텍트/방법론 등)**: 실무 경험 기반 지혜, 함정/실패 패턴 조언

3명의 전문가가 대화하여 나은 결과를 도출.

### 3원칙: 사용자 승인 후 코드 착수

- plan.md + research.md 완성 후, 코드 작성 착수 여부를 **반드시** 사용자에게 질문
- 사용자 승인 없이 코드 수정 절대 금지

### 4원칙: 실패 시 Revert → 교훈 반영 → 1원칙 재시작

- 해결방안 접근이 잘못되었다고 판단되면:
  1. 작업사항 전체 revert (git reset 또는 수동 복구)
  2. 실패 원인과 교훈을 `plan.md`에 "Lessons Learned" 섹션으로 기록
  3. 교훈을 반영하여 1원칙부터 다시 수행
- 같은 실수 반복 금지. 이전 실패 기록을 반드시 참조

## 핵심 디렉토리

방법론 본체는 `ai-native-methodology/` 하위. plan/research는 `methodology-v1.1/.claude/` 및 `legacy-analyzer/.claude/` (과거 컨텍스트).

- ai-native-methodology/methodology-spec/: 방법론 명세 (deliverables, workflow)
- ai-native-methodology/docs/adr/: 결정 기록 (ADR-001~005)
- ai-native-methodology/schemas/: JSON Schema (8개)
- ai-native-methodology/templates/: 산출물 템플릿
- ai-native-methodology/examples/poc-01-realworld-spring/: PoC #01
- methodology-v1.1/.claude/plans/, .claude/researches/: v1.1 설계 plan/research
- legacy-analyzer/.claude/plans/, .claude/researches/: v1.1 이전 단계 plan/research

## 재개 첫 명령어 추천

> "ai-native-methodology/examples/poc-01-realworld-spring/findings/poc-findings.md를
>  읽고 Phase 1부터 이어가자"

## 참고

- ai-native-methodology/README.md: 방법론 소개
- ai-native-methodology/CHANGELOG.md: 변경 이력 (v1.1.0 → v1.1.1)
