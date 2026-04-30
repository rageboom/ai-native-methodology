# AI-Native 개발 방법론 v1.1.2 — 작업 컨텍스트

본 레포는 사내 표준 AI-Native 개발 방법론.
다음 세션에서 작업 재개 시 본 파일이 컨텍스트.

## 절대 우선순위 (2026-04-28 윤주스 결정)

**품질 1순위 + 재작업 최소화 2순위**. 속도/quick win/컨텍스트 신선도 후순위.

→ 격상/처분/순서 결정 시 §8.1 단일 PoC 과적합 회피 강제 적용. 자세한 정책은 memory `feedback_quality_priority.md` 참조.

## ★★★ 본 방법론 가치 명세 (2026-04-29 윤주스 결단 — 재정의)

```
INPUT:  legacy 코드베이스 (분석 대상)
OUTPUT: 7대 산출물 + finding + antipatterns + migration-cautions (Sprint 3 부터)
USE:    사람이 신규 시스템 구축 시 입력 자료 / 회피 가이드
```

본 방법론 = **"코드 → 형식 명세 + 위험 기록" 한 방향 추출기**.
신규 시스템 자동 생성 검증 (round-trip) 은 **영구 scope 제외**.

### 산출물 이식성 5종 (★★★ — 신규 시스템 입력 자료)
| 산출물 | 활용도 |
|---|---|
| rules.json (BR) / domain.json / openapi.yaml | ★★★ 그대로 입력 (언어/환경 100% 무관) |
| schema.json + erd.mermaid | ★★★ 입력 + DB 타입 매핑 (RDB 내 90% 무관) |
| antipatterns.json + migration-cautions.md | ★★★ 회피 목록 (패턴 단위 무관) |

→ memory `project_methodology_scope.md` + DEC-2026-04-29-round-trip-스코프-아웃 + DEC-2026-04-29-안티패턴-마이그레이션-가이드 참조.

## ★★★ Static Tool 시뮬레이션 절대 금지 (2026-04-29 윤주스 ★★★ 강조)

**Phase 4.5 검증 / 모든 cross-validation 단계에서:**
- ❌ AI sub-agent 에 "Static Analyzer / Daikon / Semgrep persona" 부여 시뮬레이션 절대 금지
- ✅ 진짜 외부 도구 (Semgrep / PMD / SpotBugs / Daikon / CodeQL / SonarQube) 실제 실행 의무
- ✅ 환경 부재 시 사용자에게 환경 준비 요청 또는 사용자 위임 (CI) 명시
- ✅ 시뮬레이션 사용 시 신뢰도 -5%p 패널티 + "진짜 도구 미실행" 명시 의무

→ memory `feedback_no_static_tool_simulation.md` + DEC-2026-04-29-static-tool-실행-의무화 + v1.2.0 묶음 O 참조.
→ Sprint 4 (CI 통합) 시 하네스 자동 차단 (simulation_only: fail).

**확정 순서** (재작업 0 시퀀스 — 2026-04-29 시퀀스 C-A-B 갱신):
1. PoC #01 Phase 0~6 ✅
2. PoC #02 Phase 1~6 ✅ (7대 산출물 6/7)
3. **시퀀스 C — Phase 4.5 형식화 시범**:
   - C-Sprint 1 (BR 1건 형식화 시범) ✅
   - C-Sprint 1.5 (다이어그램 신뢰도 강화 + cross-validation) ✅
   - C-Sprint 2 (BR 5건 + F-074 단방향 round-trip) ✅
   - C-Sprint 3 (Phase 4.5 정식 명세화 + JSON 짝 + 강화점 α+β + M-P1 병행) ✅ **본 세션**
   - **C-Sprint 4** (진짜 static tool CI 도입 — 묶음 N+O) ⏳ ← **다음**
4. **시퀀스 A — v1.2.0 격상** (묶음 A~K + L/M/N/O/P 통합)
5. **시퀀스 B — PoC #03** (다른 stack — round-trip 검증 ❌, 분석 정확도/일반화만)
6. v1.3.0 (필요 시)

## 현재 상태 (2026-04-30 **v1.2.0 ★★★ MINOR 격상 ✅ — 14 묶음 통합 + Sprint 3 종결**)

### 방법론 본체
- **★★★ v1.2.0 MINOR 격상 완료** — 14 묶음 (A~M + P) 통합. ADR-008 + Phase 4.5 정식 + finding-system schema + migration-cautions 의무.
- **v1.1.2 PATCH** — high 4건 closed (F-007 / F-009 / F-016 / F-023) — v1.2.0 에 흡수
- **v1.2.x 후속** — N+O 묶음 (Drift CI + 진짜 static tool — Sprint 4)

### PoC #01 종결 (2026-04-29) ✅
- Phase 0~6 완료 — 7대 산출물 6/7 (UI/UX 제외 100%)
- finding **33건** (closed 10 / promoted 10 / deferred 13)
- AP **15건** (critical 2 / high 2 / medium 7 / low 4)
- raw confidence: Phase 6 0.96
- 핵심 결함: AP-DOMAIN-001 (De Morgan critical) + AP-SECURITY-001 (JWT 21byte critical) + AP-DOMAIN-002 (email/username unique 3중 부재)

### PoC #02 종결 (2026-04-29) ✅ **본 세션 작업**

분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e` / Spring Boot 3.3 + Java 21 + Multi-module Hexagonal)

#### Phase 1~6 모두 완료
| Phase | 산출 | raw conf | 핵심 |
|---|---|---|---|
| 1 (init) | inventory.json + stack-detection.md + tree.md + stats.json + _manifest.yml | 0.93 | Hexagonal Modular Monolith hybrid 0.65 cap |
| 2 (db) | schema.json + schema.sql + erd.mermaid + 정합성-검증-보고서.md + _manifest.yml | 0.85 | F-048 critical (TagJpaRepository 타입 오류 ★ Senior 발견) |
| 3 (arch) | architecture.json + architecture.md + architecture.mermaid + dependency-graph.mermaid + circular-dependencies.md + _manifest.yml | 0.92 | LV/CIRCULAR 0건 / F-068 critical (RSA git commit ★ Senior 발견) |
| 4 (domain+rules+AP partial) | domain/* + rules/* + antipatterns-partial/* | 0.83 | 4 Aggregate Root + 25 UC + 14 BR + 6 AP partial |
| 5-1 (api) | openapi.yaml + api-extension.json + api.md + _manifest.yml | 0.93 | 19 op / **openapi.yaml ground truth 802 line 사용자 작성** |
| 6 (antipatterns final) | antipatterns.json (21 AP) + avoid-list.md + _manifest.yml | 0.96 | **3 critical: AP-API-001 / AP-DB-001 / AP-SECURITY-001** |

#### PoC #02 핵심 결함 (사내 적용 시 즉시 수정 critical 3건)
- **AP-API-001 critical** — F-070+F-079+F-085 spec/runtime drift 묶음 (RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 위반)
- **AP-DB-001 critical** — F-048 TagJpaRepository<Tag, Integer> 타입 오류 (1글자 fix: Integer → String)
- **AP-SECURITY-001 critical** — F-068 RSA private key (`server/api/src/main/resources/app.key`) git 직접 commit (PoC #01 isomorphic ★)

#### PoC #02 finding 통계
- finding **43건** (F-042~F-087 / F-079 → F-070 merged)
- promoted 31 / candidate 8 / deferred 4 / closed 0
- F-070 high → critical 격상 (Phase 5-1)
- F-085 low → medium 격상 (Phase 5-1)
- F-081 medium → low 강등 (Phase 5-1)

#### PoC #02 5 핵심 결정 (Phase 6 — 윤주스 일괄 승인)
- DEC-001 — AP-API-001 critical 단일 등록 (Phase 5-1 정합)
- DEC-002 ★ — Phase 1-3 누락 candidate 5건 등록 (F-048 / F-068 / F-051 / F-053 / F-069)
- DEC-003 — ID 정규화 6건 (multi-prefix → single)
- DEC-004 — composite view 4건 도입 (PoC #01 1건 → 4건 확장)
- DEC-005 — low candidate 3건 등록 (F-058 / F-076 / F-078)

#### PoC #01 ↔ PoC #02 cross-validation (15 AP 외부 검증 결과)
- **비재현 8건 (53%)** — Hexagonal 분리 + Spring Boot 3.x 효과 (학습 효과 입증)
- **재현 4건 (27%)** — v1.2.0 합산 격상 강한 권위 (AP-PERFORMANCE-001 medium → high 격상 / AP-API-001~002 + AP-DB-001 재현)
- **변형 재현 3건 (20%)** — AP-SECURITY-001 (JWT 21byte → RSA git commit isomorphic ★) + AP-DOMAIN-002 + AP-ARCH-002

### 누적 통계 (C-Sprint 3 종결 시점 — 2026-04-30)

```yaml
finding_total: 106         # PoC #01 33 + PoC #02 43 + Sprint 1.5 11 + Sprint 2 19 (Sprint 3 신규 0건)
finding_closed: 10
finding_promoted: 41
finding_deferred: 18
finding_candidate: 8
finding_merged: 1
finding_rejected: 0
finding_phase45_new: 30    # Sprint 1.5 11 + Sprint 2 19

ap_total: 36
ap_with_migration_advice: 21   # PoC #02 21/21 Sprint 3 backfill ✅ (PoC #01 15건 v1.2.0 격상 시 일괄)

formal_spec_artifacts: 28  # Sprint 1+1.5+2 21건 + Sprint 3 신규 7건 (.json 짝 4 + 본체 ADR-008 + schemas/finding-system + formal-spec)

methodology_body_artifacts_added: 8  # ADR-008 + finding-system.schema + formal-spec.schema + phase-4-5-formal-spec + 04-5-형식명세 + 4 template

v120_bundles: 16           # A~K + L/M/N/O/P
v120_bundles_ready: 14     # A~M + P (Sprint 3 종결 시점) — N+O Sprint 4 대기
이중_렌더링_정합: 100%      # state-machine + sequence 영역 (decision-tables .json 짝 Sprint 4)
신뢰도_정직표기: 80-87%    # 시뮬 패널티 / Sprint 4 진짜 도구로 90-95% 목표
```

### Phase 4.5 형식화 시범 (시퀀스 C) 핵심 결과

| Sprint | 핵심 | 정량 |
|---|---|---|
| 1 | BR-EMAIL-UNIQUE 4 산출물 / self-reference 함정 자가 시인 | drift 4건 |
| 1.5 | Cross-validation + Static Analyzer **시뮬레이션** + Property test 명세 | drift +11건 / 신뢰도 60-70% → 80-87% |
| **2** | **★★★ F-074 단방향 round-trip 검증 — 자연어 빈약성 44% → 100%** | drift +19건 / **양쪽 발견 ★★ 2건 (F-097 high `@Transactional` 부재 / F-098 high Equality on transient)** |

→ **묶음 L (Phase 4.5 정식 도입) 데이터 100% 충분 ✅**.

### v1.2.0 격상 묶음 합산 데이터 (11 묶음 A~K)
| 묶음 | 영역 | 외부 검증 |
|---|---|---|
| A | cross-validation (F-015) | F-044 보강 ★ |
| B | 정정 트레이스 (F-022 + F-024) | PoC #01 단독 |
| C | severity 표준 (F-018) | PoC #01 단독 |
| D | schema 진화 (F-025) | multi-module + Hexagonal 모듈 분리 |
| E | quality-extraction | PoC #01 단독 |
| F | 신뢰도 공식 보강 | PoC #01 단독 |
| **G** | OpenAPI x-extension (ADR-007) | **PoC #02 외부 검증 ✅** |
| **H** | multi-module 환경 / **Auth/Crypto 검증** | **PoC #01+#02 isomorphic ★★★** (AP-SECURITY-001 양 PoC 재현) |
| I | finding-system 정식화 | PoC #02 메타 finding |
| **J** | Hexagonal port-adapter 가이드 | **PoC #02 단독 신규** (F-075) |
| **K** | multi-module Outside-in 모범 사례 | **PoC #02 신규** (F-064/F-065/F-066 positive findings) |
| **★ L** | **Phase 4.5 형식화 정식 도입 (ADR-008/009)** | **C-Sprint 1~3 누적 ✅ 100% — 정식 명세화 완료 (workflow + deliverable + schema + 4 template)** |
| **M** | 방법론 본체 이중 렌더링 갭 해소 | **갭 7건 식별 ✅ + P1 2건 Sprint 3 적용 ✅ (ADR-008 + finding-system.schema.json) / P2-3 5건 A 일괄** |
| **N** | Drift 자동 검증 도구 (CI) | C-Sprint 4 |
| **O** | 진짜 외부 도구 실행 의무화 (★★★) | DEC-static-tool-실행-의무화 / C-Sprint 4 적용 |
| **P** | 안티패턴 migration_advice + migration-cautions.md | **Sprint 3 적용 ✅** (schema 갱신 + PoC #02 21 AP backfill + migration-cautions.md + phase-6 의무 격상) |

## Work Principles (모든 프로젝트 공통 4원칙)

IMPORTANT: 모든 작업에 아래 4원칙을 순환적으로 적용. 이 원칙은 모든 하위 프로젝트에 동일 적용.

### 1원칙: 깊은 숙지 → plan.md 작성
- 작업 착수 전 관련 파일 전수 조사
- `.claude/plans/plan{토픽}.md` 정리

### 2원칙: 에이전트 팀 토론 → research.md 작성
- 3가지 에이전트 병렬 (공식문서 / 테크기업 사례 / Senior Engineer)
- **★ 가벼운 sub-agent 전략 (Phase 4~6 정착)** — Case 생략 + Document/Senior 시간 cap (8분/10분) + 우선순위 read 만 → ~10배 단축. 자세한 패턴 memory `feedback_lightweight_sub_agent.md` 참조.

### 3원칙: 사용자 승인 후 코드 착수
- plan + research 완성 후 반드시 사용자 질문
- 일괄 승인 패턴 (5~6 핵심 결정 묶음) — Auto Mode 호환

### 4원칙: 실패 시 Revert → 교훈 반영 → 1원칙 재시작
- Lessons Learned 섹션 plan.md 기록
- 같은 실수 반복 금지

## 핵심 디렉토리

- `ai-native-methodology/methodology-spec/`: 방법론 명세
- `ai-native-methodology/docs/adr/`: ADR-001~005 + ADR-007 (OpenAPI x-extension)
- `ai-native-methodology/decisions/`: **운영/일정 결정 로그** (역시간순, INDEX.md 단일 진입점)
- `ai-native-methodology/schemas/`: JSON Schema (8개)
- `ai-native-methodology/templates/`: 산출물 템플릿
- `ai-native-methodology/examples/poc-01-realworld-spring/`: PoC #01 ✅ 종료
- `ai-native-methodology/examples/poc-02-realworld-springboot3/`: PoC #02 ✅ 종료
- `methodology-v1.1/.claude/`: v1.1 설계 plan/research

## 재개 첫 명령어 추천

> "examples/poc-02-realworld-springboot3/.claude/SESSION-WRAPUP-2026-04-29-sprint2.md 읽고 어디까지 했는지 정리해줘.
>  C-Sprint 3 진입 plan 작성해줘 (Phase 4.5 정식 명세화 + JSON 짝 + 강화점 α + β)."

## ★ 본 PoC 사이클에서 정착된 패턴 (메서드론 자산화)

### F-015 cross-validation 패턴 (Phase 1 발견 / 모든 phase 정착)
3 에이전트 병렬 리서치 시 sub-agent 학습 코퍼스 의존 → 사실 오류 가능.
**대응**: 메인 사전 raw fetch → sub-agent 가 같은 데이터 cross-check.
**효과**: Phase 2~6 sub-agent 오차 0% 달성. memory `feedback_sub_agent_validation.md` 참조.

### 가벼운 sub-agent 전략 (PoC #02 Phase 4~6 정착) ★
Phase 3 30+분 대비 **~10배 단축**. Document/Senior 가벼운 spawn + Case 생략 (누적 충분 시).
**핵심**: prompt 단순화 + 시간 cap + 우선순위 read 영역 명시. memory `feedback_lightweight_sub_agent.md` 참조.

### Composite View 패턴 (PoC #01 1건 → PoC #02 4건 확장) ★
복합 AP 등록 거절 (single-concern AP schema 표준) + avoid-list.md `## composite view` 섹션 가독성 보전.
PoC #02 4건: API 계약 / Hexagonal port-adapter / JWT-Auth / DB 데이터 무결성. memory `feedback_composite_view_pattern.md` 참조.

### F-021 finding 누적 임계
누적 5~15건 건강 / 20+ 명세 자체 부실 의심.
PoC #02 종료 시점 누적 76건 → 비중 분석으로 §8.1 정합 (단일 PoC 과적합 회피 강제 시그널).

## 다음 단계 — 시퀀스 C → A → B 확정 (DEC-시퀀스-C-A-B-확정)

| 시점 | 작업 | 상태 |
|---|---|---|
| C-Sprint 1 | F-074 단방향 round-trip + BR 1건 형식화 시범 | ✅ 완료 |
| C-Sprint 1.5 | 다이어그램 신뢰도 강화 + cross-validation | ✅ 완료 |
| C-Sprint 2 | BR 5건 형식화 + cross-validation 의무 + F-074 우선 | ✅ 완료 |
| C-Sprint 3 | Phase 4.5 정식 명세화 + Mermaid JSON 짝 일괄 + α+β + M-P1 병행 | ✅ **본 세션** |
| **C-Sprint 4** | Drift CI 도구 + 진짜 static tool 도입 (묶음 N+O) + decision-tables .json 짝 보강 | ⏳ **다음** |
| **A** | v1.2.0 격상 (묶음 A~K + L/M/N/O/P 통합) | 다음 |
| B | PoC #03 진입 (다른 stack — round-trip 검증 ❌, 분석 정확도/일반화만) | 다음 |

→ round-trip 검증 영구 scope 아웃 (★★★ 본 방법론 가치 명세 참조).

## 참고

- `ai-native-methodology/README.md`: 방법론 소개
- `ai-native-methodology/CHANGELOG.md`: 변경 이력 (v1.1.0 → v1.1.1 → v1.1.2)
- `examples/poc-02-realworld-springboot3/.claude/SESSION-WRAPUP-2026-04-29.md`: 본 세션 wrap-up 보고서
