# AI-Native 개발 방법론 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론. 다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

> **휘발성 진행 상태** (PoC 통계 / 묶음 진행률 / 누적 finding) → [`decisions/STATUS.md`](ai-native-methodology/decisions/STATUS.md)
> **결정 이력** → [`decisions/INDEX.md`](ai-native-methodology/decisions/INDEX.md)

## 절대 우선순위

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.
격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. (memory `feedback_quality_priority.md`)

## ★★★ 본 방법론 가치 명세

```
INPUT:  legacy 코드베이스
OUTPUT: 7대 산출물 + finding + antipatterns + migration-cautions
USE:    사람이 신규 시스템 구축 시 입력 자료 / 회피 가이드
```

**"코드 → 형식 명세 + 위험 기록" 한 방향 추출기**. round-trip 검증은 **영구 scope 제외**.

### 산출물 이식성 5종

| 산출물 | 활용도 |
|---|---|
| rules.json (BR) / domain.json / openapi.yaml | ★★★ 그대로 입력 (언어/환경 100% 무관) |
| schema.json + erd.mermaid | ★★★ 입력 + DB 타입 매핑 (RDB 내 90% 무관) |
| antipatterns.json + migration-cautions.md | ★★★ 회피 목록 (패턴 단위 무관) |

(memory `project_methodology_scope.md`)

## ★★★ Static Tool 시뮬레이션 절대 금지

Phase 4.5 검증 / 모든 cross-validation 단계에서:
- ❌ AI sub-agent 에 "Static Analyzer / Daikon / Semgrep persona" 부여 시뮬레이션 금지
- ✅ 진짜 외부 도구 (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube) 실제 실행 의무
- ✅ 환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시
- ✅ 시뮬레이션 사용 시 신뢰도 -5%p 패널티 + "진짜 도구 미실행" 명시 의무

(memory `feedback_no_static_tool_simulation.md`, Sprint 4 하네스 자동 차단)

## Work Principles (4원칙 — 모든 작업 공통)

매 phase 마다 순환 적용. 모든 하위 프로젝트 동일.

1. **깊은 숙지 → plan.md 작성** — 관련 파일 전수 조사 후 `.claude/plans/plan{토픽}.md`.
2. **에이전트 팀 토론 → research.md 작성** — 3 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior). Phase 4~6 부터 가벼운 sub-agent 전략 (Case 생략 + 시간 cap + 우선순위 read 만 → ~10배 단축, memory `feedback_lightweight_sub_agent.md`).
3. **사용자 승인 후 코드 착수** — plan + research 완성 후 반드시 질문. 일괄 승인 패턴 (5~6 핵심 결정 묶음, Auto Mode 호환).
4. **실패 시 Revert → 교훈 반영 → 1원칙 재시작** — Lessons Learned 섹션 plan.md 기록. 같은 실수 반복 금지.

## 핵심 디렉토리

- `ai-native-methodology/methodology-spec/` — 방법론 명세
- `ai-native-methodology/docs/adr/` — ADR-001~005 + ADR-007 (OpenAPI x-extension) + ADR-008/009 (Phase 4.5)
- `ai-native-methodology/decisions/` — 운영/일정 결정 로그 (역시간순, INDEX.md 단일 진입점) + STATUS.md (휘발성 상태)
- `ai-native-methodology/schemas/` — JSON Schema
- `ai-native-methodology/templates/` — 산출물 템플릿
- `ai-native-methodology/examples/poc-01-realworld-spring/` — PoC #01 ✅ 종료
- `ai-native-methodology/examples/poc-02-realworld-springboot3/` — PoC #02 ✅ 종료

## 정착 패턴 (메서드론 자산화)

- **F-015 cross-validation** — sub-agent 학습 코퍼스 의존 회피. 메인 raw fetch → sub-agent cross-check. (memory `feedback_sub_agent_validation.md`)
- **가벼운 sub-agent** — Phase 3 대비 ~10배 단축. (memory `feedback_lightweight_sub_agent.md`)
- **Composite View** — 복합 AP 등록 거절 + avoid-list.md 가독성. PoC #01 1건 → PoC #02 4건. (memory `feedback_composite_view_pattern.md`)
- **F-021 finding 임계** — 누적 5~15건 건강 / 20+ 명세 부실 의심. (memory `feedback_finding_threshold.md`)

## 참고

- `ai-native-methodology/README.md` — 방법론 소개
- `ai-native-methodology/CHANGELOG.md` — 변경 이력
