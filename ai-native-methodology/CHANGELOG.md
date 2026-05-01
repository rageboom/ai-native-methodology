# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [v1.4.0-dev] — 2026-05-01 ⭐ 현재 (MINOR — FE 트랙 진입 / Stage 0 종결)

### 트리거

v1.3.1 PATCH 종결 후 사용자 결정 — **freeze 해제 + FE 트랙 정식 시작 + v1.4.0-dev 라인 진입**. 본 release 라인 = ① BE 한정 (v1.x) → BE+FE 양 트랙 (v1.4+) 격상 ② 사용자 진단 "FE 분석 방법이 없잖아" 에 대한 research-first 응답.

### Stage 0 산출 (본 세션)

| # | 산출 | 위치 |
|---|---|---|
| 1 | plan-v1.4-fe-track.md | `ai-native-methodology/.claude/plans/` (4원칙 1단계 정식 산출) |
| 2 | DEC-2026-05-01-v1.4-FE-트랙-진입.md | `ai-native-methodology/decisions/` |
| 3 | STATUS.md 갱신 | 방법론 본체 버전 + 시퀀스 진행률 |
| 4 | INDEX.md 갱신 | 승인 결정 표에 본 DEC 등재 |
| 5 | CHANGELOG.md (본 entry) | v1.4.0-dev 라인 신설 |
| 6 | memory 신설 + 갱신 | project_v140_fe_track / project_v130_release_status / project_adoption_workspace + MEMORY.md |
| 7 | git commit | Stage 0 종결 단일 commit |

### 변경 사항

**없음** (메타 작업만). 방법론 본체 / schema / 도구 / PoC 변경 0. 본 release line 의 본격 변경은 Stage 3 (본체 격상) 부터 시작.

### 큰 뭉텅이 (Stage) 분할 — 사용자 요구 6번 정식 반영

| Stage | 목적 |
|---|---|
| Stage 0 ✅ | freeze 해제 + 트랙 진입 |
| Stage 1 | research × 3 (공식문서 / 테크기업 / Senior FE) — 9Q 답 도출 |
| Stage 2 | 사용자 승인 (3 sub-gate — 핵심 구조 / 보강 범위 / 검증 전략) |
| Stage 3 | 본체 격상 — deliverable 재설계 + 산출물↔테스트 매개체 채택 |
| Stage 4 | mini-PoC 검증 (1주 fail-fast) |
| Stage 5 | 본격 PoC #04 (RealWorld FE) |
| Stage 6 | BE/FE 분리 운영 정책 정식화 (횡단) |
| Stage 7 | v1.4.0 MINOR release 결단 |

각 Stage 종료 시 commit + DEC + STATUS 갱신 (사용자 요구 7번 — 발전 과정 가시화 의무).

### 외부 plan 짝

`~/.claude/plans/be-foamy-jellyfish.md` (사용자 승인본 / 3 에이전트 점검 v2). 본 레포 plan (`.claude/plans/plan-v1.4-fe-track.md`) 은 작업용 짝.

### 트랙 차이 (BE v1.x → FE v1.4)

| 차원 | BE 트랙 (v1.0~v1.3) | FE 트랙 (v1.4) |
|---|---|---|
| 시작 가정 | modern stack (Spring/SpringBoot/NestJS) 명확 | spectrum 결정부터 (legacy jQuery ~ modern React) |
| 진입 순서 | 명세 → 도구 → PoC | research → 명세 재설계 → mini-PoC → 본격 PoC |
| 핵심 빈틈 | 신뢰도 정직 표기 | 산출물↔테스트 자동 도출 / visible 차원 / 분산 상태 / 이벤트 / 렌더링 |
| 분리 정책 | 단일 BE 관점 | BE/FE 분리 운영 (Stage 6) — JS 풀스택 / JSP 혼재 예외 |

### Stage 1 산출 (research × 3 — 2026-05-01 본 세션)

| # | 산출 | 위치 | 분량 |
|---|---|---|---|
| 1 | research-official-v1.4-fe.md | `.claude/plans/` | ~2,400 단어 / 1차 사료 ≥ 25개 |
| 2 | research-industry-v1.4-fe.md | `.claude/plans/` | ~2,800 단어 / 1차 사료 다중 |
| 3 | research-senior-v1.4-fe.md | `.claude/plans/` | ~3,500 단어 / 9Q 모두 강한 답 |
| 4 | research-v1.4-fe-summary.md (★ 진단 보고서) | `.claude/plans/` | 통합 + Stage 2 Gate 입력 12 결정 |
| 5 | DEC-2026-05-01-v1.4-Stage-1-research-종결.md | `decisions/` | Stage 1 종결 결단 |

### Stage 1 핵심 합의 (3 에이전트)

- ★ 격상 시나리오 = **Scenario B-Lite (단계 분할)** — Senior 권고 + 산업/공식 정합
- ★ legacy cover (jQuery/Vanilla/MPA/JSP) **v1.4 포함** — 사용자 진단 직접 대응
- ★ visual-manifest deliverable 신설 (사용자 요구 3번 visible 정면 해소)
- ★ state-map deliverable 신설 + W3C SCXML 채택 (분산 상태 5 진실)
- ★ 권위 매개체 12 통합 채택 (CEM/SCXML/DTCG/MSW+OAS/axe-core/.d.ts/CSF/Playwright/WCAG 2.1/WAI-ARIA 1.2/ICU MF/Pact)
- ★ a11y + i18n v1.4 포함 (산출물↔테스트 자동 도출)

### 본체 빈틈 진단 (Stage 3 격상 작업 항목)

Top 5: 분산 상태 deliverable 부재 / 시각 산출 부재 / legacy fallback 부재 / 권위 매개체 격상 미반영 / 신뢰도 단계 모델 부재. 세부 21건 (`research-v1.4-fe-summary.md` §3).

### Stage 2 진입 자료 (사용자 결단 12 항목)

- Gate 1 (핵심 구조) 4 결정: spectrum / 시나리오 (B-Lite) / schema 분리 / 매개체 12 채택
- Gate 2 (보강 범위) 4 결정: 비기능 v1.4 (a11y+i18n+정적보안) / legacy Tier 1~4 / BE/FE 분리 / ADR-001 §명시적 제외 갱신
- Gate 3 (검증 전략) 4 결정: mini-PoC 진입 (Stage 3-1 후 즉시) / PoC #04 (RealWorld only) / 신뢰도 0.80 / Sprint 4-6

### ★★ Stage 2 종결 (2026-05-01 본 세션)

★★ **12 결정 모두 Senior 권고 (Recommended) 채택**. DEC-2026-05-01-v1.4-Stage-2-Gate-결단.md.

| Gate | 결정 4건 |
|---|---|
| **G1** 핵심 구조 | spectrum (Modern+jQuery+JSP 예외) / **Scenario B-Lite** / schema 분리+Phase 4.5 cross-link / 매개체 **12 통합 채택** |
| **G2** 보강 범위 | 비기능 (a11y+i18n+정적보안 v1.4 / 운영 NFR v1.5) / legacy Tier 1~4 / BE/FE 분리 default + JS풀스택+JSP ADR 예외 / ADR-001 갱신 |
| **G3** 검증 전략 | mini-PoC Stage 3-1 후 즉시 / PoC #04 RealWorld only / 신뢰도 **0.80** / Sprint mini 1주 + 본격 4-6 |

### Stage 3-1 진입 자료 (작업 항목 확정)

- ★ 신설: deliverable 8 (state-map) + 9 (visual-manifest) + state-map.schema.json + visual-manifest.schema.json
- ★ 분할: phase-5-2 → phase-5-2-a/b/c
- ★ ADR 신설: ADR-FE-001 (FE 추출기 가정 + spectrum) / ADR-FE-002 (이중 렌더링 FE 적용 + visual 예외) / ADR-FE-005 (매개체 12 채택)
- ★ ADR 갱신: ADR-009 (FE 신뢰도 단계 1~5)
- ★ 보강: 7-ui-ux.md (legacy Tier 1~4 fallback) + ui-spec.schema.json (event_handlers / api_calls / suspense_boundary / framework enum 확장)
- ★ 도구 시범: drift-validator FE 적용 (state-map.json ↔ state-map.mermaid) / formal-spec-link-validator FE cross-link

### ★★★ Stage 3-1 종결 (2026-05-01 본 세션)

★★★ **본체 격상 16+ 항목 적용**. DEC-2026-05-01-v1.4-Stage-3-1-종결.md.

#### Phase 별 산출 (5 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-001/002/005 신설 + ADR-009 갱신 + plan-v14-stage-3-1.md | `6639df7` (5 file / 1267 ins) |
| **B** | state-map.schema + visual-manifest.schema 신설 + ui-spec.schema 확장 | `c82d545` (3 file / 788 ins) |
| **C+D** | deliverable 8/9 신설 + 7 보강 + phase-5-2 a/b/c 분할 + 기존 stub | `d2e12b4` (7 file / 1269 ins / 202 del) |
| **E1** | drift-validator FE corpus 1쌍 + test 14→**15 pass** | `9c0729c` (3 file / 26 ins) |
| **E2** | formal-spec-link-validator FE 진단 (★ 도구 확장 carry — Stage 3-2 또는 Sprint 5+) | (read-only) |
| **F** | DEC-Stage-3-1-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### 사상 기둥 3 (★ ADR-FE 시리즈)

- **ADR-FE-001** (FE 추출기 가정) — spectrum Tier 1~4 cover + 한 방향 추출 사상 + BE Phase 0~6 ↔ FE Phase 0~6 매핑
- **ADR-FE-002** (이중 렌더링 FE 적용) — ADR-008 의 FE 영역 적용 + ★ visual 예외 (binary 진실 모델)
- **ADR-FE-005** (권위 매개체 12 채택) — sub-agent cross-check 1차 사료 검증 완료

#### Cross-check 권고 3건 반영 (옵션 Y)

1. DTCG 정확한 인용 — "Final Community Group Report" 명시 + spec URL 고정
2. WCAG 2.1 AA + ★ 2.2 AA ratchet path 명시 (ADR-010 baseline+ratchet 정합)
3. ICU MF2 채택 단계 (spec stable / runtime preview) + MF1 폴백 병기

#### no-simulation 정책 강화

- visual-manifest.schema.json `captured_by` enum — `simulation` 시 -5%p 패널티 + `simulation_reason` 의무 (★ schema if/then 강제)
- ADR-009 §2.2.1 FE 도구 enum 신설 — `playwright_real` / `axe_core_real` / `storybook_csf_real` / `msw_handler_check` / `percy_real` / `chromatic_real`
- phase-5-2-c-visual.md §3.2 — Playwright + axe-core 진짜 실행 의무 절차

#### 사용자 7 요구사항 진척도

| 요구 | 도달 |
|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ★ 100% (ADR-FE-005) |
| 2. AI + 사람 동시 이해 | ★ 100% (ADR-FE-002 + schema 3 + deliverable 3) |
| 3. UI visible 차원 | ★ 100% (deliverable 9 + schema B2 + workflow D3) |
| 4. 비즈니스 로직 동일 | ★ 100% (deliverable 8 + schema B1 + workflow D2) |
| 5. BE/FE 분리 운영 | ⏳ Stage 6 (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제 | ★ 100% (Phase A~F commit 단위 분할) |
| 7. 모든 단계 기록 | ★ 100% (5 commit + DEC) |

→ ★ 6/7 = 100% (요구 5 = Stage 6 carry).

### Stage 3-2 + Stage 4 진입 자료

- Stage 3-2 — a11y / i18n / 정적보안 deliverable + legacy 산출물 3종 + ADR-FE-003 + ADR-001 §명시적 제외 갱신 + migration-cautions-fe.md + rules.schema.json br_type fe_validation enum 확장 + formal-spec-link-validator FE 적용 (Stage 3-1 carry)
- Stage 4 mini-PoC — RealWorld React fork (1주 fail-fast) + Playwright + axe-core 진짜 실행 1회 (★ no-simulation 정책 첫 FE 실현) + ui-spec / state-map / visual-manifest 1 page × 2 viewport 검증 + drift-validator FE 본격 적용 + 신뢰도 0.75+ 도달 검증

추정 분량: 2~4 세션.

### ★★★ Stage 3-2 종결 (2026-05-01 본 세션)

★★★ **본체 격상 2차 12+ 항목 적용**. DEC-2026-05-01-v1.4-Stage-3-2-종결.md.

#### Phase 별 산출 (5 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-003 (legacy spectrum + Strangler Pattern) 신설 + ADR-001 §명시적 제외 갱신 (운영 NFR 좁힘) + plan-v14-stage-3-2.md | `4d8eb18` (3 file / 794 ins) |
| **B** | a11y-spec / i18n-spec / static-security-spec / legacy-spectrum schema 신설 + rules.schema FE category 4종 확장 | `deefd62` (5 file / 771 ins) |
| **C+D** | deliverable 10 (a11y) / 11 (i18n) / 12 (static-security) / 13 (legacy-spectrum) 신설 + migration-cautions-fe.md 신설 + phase-6-quality 보강 | `3feb8fd` (6 file / 913 ins) |
| **E** | formal-spec-link-validator FE 모드 확장 (`--mode=be|fe|both`) + 4→**8 pass** ✅ (BE 회귀 0) | `64fd5b0` (4 file / 271 ins) |
| **F** | DEC-Stage-3-2-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### G2 결단 정식 반영 (Stage 2 Gate)

- **G2-1** (a11y/i18n/정적보안 v1.4) — deliverable 10/11/12 신설 + schema 3종
- **G2-2** (legacy Tier 1~4) — ADR-FE-003 + deliverable 13 + legacy-spectrum schema
- **G2-4** (ADR-001 §명시적 제외) — "비기능 측정" → ★ "운영 NFR 측정" 좁힘 + 정적 NFR v1.4 포함

#### Strangler Fig Pattern 채택 (Martin Fowler 2004)

- 산업 사례 (Fowler / Sam Newman) 정합 — rewrite ❌ / strangle ✅
- 4 approach 명시 + ★ schema enum `big_bang_rewrite_not_recommended`

#### Cross-check 권고 3건 schema 강제 (Stage 3-1 carry)

- DTCG `spec_source` URL 고정 + `spec_status=community_group_report`
- WCAG 2.1-AA baseline + 2.2-AA ratchet (a11y-spec.schema)
- ICU MF2 사용 시 ★ MF1 폴백 의무 (i18n-spec.schema if/then 강제)

#### no-simulation 정책 schema 강제 4 영역

| schema | if/then |
|---|---|
| a11y-spec | captured_by ∈ real → 5종 물증 의무 |
| i18n-spec | mf2_used=true → mf1_fallback_present 의무 |
| static-security-spec | captured_by ∈ real → 5종 물증 의무 + runtime_check_required 표기 |
| legacy-spectrum | primary_tier=mixed → mixed_breakdown 의무 |

#### 사용자 7 요구사항 진척도 (Stage 3-2 종결)

| 요구 | 도달 |
|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ★ 100% (axe-core / ICU / Semgrep 추가) |
| 2. AI + 사람 동시 이해 | ★ 100% (schema 5 + deliverable 4 신설) |
| 3. UI visible 차원 | ★ 100% (Stage 3-1 도달 유지) |
| 4. 비즈니스 로직 동일 | ★ 100% (rules.schema FE category 4종 확장) |
| 5. BE/FE 분리 운영 | ⏳ Stage 6 (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제 | ★ 100% (Phase A~F commit 단위) |
| 7. 모든 단계 기록 | ★ 100% (5 commit + DEC) |

→ ★ 6/7 = 100% 도달 유지 (Stage 3-1 동일).

### Stage 4 + Stage 6 진입 자료

- **Stage 4 mini-PoC** — Playwright + axe-core + ICU runtime + Semgrep/ESLint security 진짜 실행 (★ no-simulation 정책 첫 FE 본격 실현)
- **Stage 6 ADR-FE-004** — BE/FE 분리 운영 정책 정식 (요구 5 = 100% 도달) / methodology-spec/be-fe-separation.md / Tier 4 (JSP) BE/FE 통합 산출 정식

### ★★★ Stage 6 종결 (2026-05-01 본 세션)

★★★ **본체 격상 8 항목 + 사용자 요구 7/7 = 100% 도달 = v1.4 본체 quality 격상 완성**. DEC-2026-05-01-v1.4-Stage-6-종결.md.

#### Phase 별 산출 (3 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-004 (BE/FE 분리 3 Scenario) + ★ ADR-FE-006 (framework-neutral IR — 외부 LLM 검증 정면 대응) 신설 + plan-v14-stage-6.md + STATUS 압축 정비 이력 등재 | `5650e1f` (4 file / 683 ins) |
| **B** | be-fe-separation.md 신설 + ADR-FE-001 §6 / ADR-FE-003 §2.4 carry → resolved + deliverable 7 §6.5 보강 + phase-0 §3.4 보강 + legacy-spectrum.schema tier_4_be_fe_handling enum | `2fafd52` (6 file / 235 ins / 9 del) |
| **F** | DEC-Stage-6-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### 핵심 결단

- **3 Scenario** (ADR-FE-004) — A 분리 default (사용자 사내 React+TS+TanStack 정합) / B JS 풀스택 (Next.js / Nuxt / Remix / Astro) / C JSP (Tier 4 통합)
- **★ framework-neutral IR 사상** (ADR-FE-006) — 외부 LLM 검증 정면 대응 / IR 4계층 매트릭스 (L1 Domain / L2 Interaction / L3 Contract / L4 Presentation) 정식 매핑 / Screen+Journey 우선 / Component 분해 framework-coupling 위험
- **Stage 3-1/3-2 carry 종결** — Tier 4 (JSP) BE/FE 통합 산출 절차 정식

#### 외부 LLM 검증 빈틈 5건 처리

| # | 빈틈 | 처리 |
|---|---|---|
| 1 | Zod / Yup / RHF rules → BR 자동 추출 절차 | ❌ Stage 7-pre carry |
| 2 | TypeScript .d.ts 산출 절차 | ❌ Stage 7-pre carry |
| 3 | "프레임워크 중립 IR" 사상 명시화 | ✅ ★ ADR-FE-006 신설 |
| 4 | Component 분해 framework-coupling 위험 | ✅ ADR-FE-006 §2.3 + deliverable 7 §6.5 |
| 5 | Screen+Journey 우선 / Component 후순위 | ✅ ADR-FE-006 §2.2 + deliverable 7 §6.5 |

#### ★★★ 사용자 7 요구사항 7/7 = 100% 도달 (★ v1.4 본체 quality 격상 완성)

| 요구 | 도달 |
|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ★ 100% |
| 2. AI + 사람 동시 이해 | ★ 100% |
| 3. UI visible 차원 | ★ 100% |
| 4. 비즈니스 로직 동일 | ★ 100% |
| **5. BE/FE 분리 운영** | ★ **100% NEW** (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제 | ★ 100% |
| 7. 모든 단계 기록 | ★ 100% |

→ ★★★ **7/7 = 100% 완성 / Stage 7 v1.4.0 release 진입 자격 도달**.

#### FE 영역 ADR 6 개 누적 (Stage 3-1/3-2/6)

- ADR-FE-001 (FE 추출기 가정) / 002 (이중 렌더링 FE) / 003 (legacy + Strangler) / 004 (BE/FE 분리) / 005 (권위 매개체 12) / ★ 006 (framework-neutral IR)

### Stage 4 + Stage 7-pre 진입 자료

- **Stage 4 mini-PoC** — RealWorld React fork (1주 fail-fast) + Playwright/axe-core/ICU/Semgrep 진짜 실행 / ★ ADR-FE-006 IR 4계층 정합도 검증 의무 (React 관용구 IR 잔존 finding 등록)
- **Stage 7-pre** — 외부 LLM 검증 빈틈 #1 (Zod/Yup/RHF → BR fe_validation 자동 추출) + #2 (TypeScript .d.ts 산출 — 별도 deliverable 14 검토)

### ★★★ Stage 7-pre 종결 (2026-05-01 본 세션)

★★★ **외부 LLM 검증 빈틈 5/5 = 100% 해소 / release 전 마지막 quality 격상**. DEC-2026-05-01-v1.4-Stage-7-pre-종결.md.

#### Phase 별 산출 (4 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-005 매개체 12 → ★ **13** (Zod 추가) + plan-v14-stage-7-pre.md | `3a7df3e` (2 file / 256 ins) |
| **B** | form-validation-spec.schema + type-spec.schema 신설 + rules.schema source_format/auto_extracted 확장 | `9c5b8d1` (3 file / 448 ins) |
| **C+D** | deliverable 14 (form-validation-spec) / 15 (type-spec) 신설 + ADR-FE-006 §5.2 carry → resolved + phase-5-2-b §3.1 form_state cross-link 보강 | `adabe10` (4 file / 356 ins) |
| **F** | DEC-Stage-7-pre-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### 외부 LLM 검증 빈틈 5/5 = 100% 해소

| # | 빈틈 | Stage | 산출 |
|---|---|---|---|
| 1 | Zod / Yup / RHF rules → BR 자동 추출 | ★ Stage 7-pre | deliverable 14 + form-validation-spec.schema + ADR-FE-005 §2.1.1 |
| 2 | TypeScript .d.ts 산출 절차 | ★ Stage 7-pre | deliverable 15 + type-spec.schema + framework_neutrality_score |
| 3 | "프레임워크 중립 IR" 사상 명시화 | Stage 6 | ADR-FE-006 신설 |
| 4 | Component 분해 framework-coupling 위험 | Stage 6 | ADR-FE-006 §2.3 + deliverable 7 §6.5 |
| 5 | Screen+Journey 우선 / Component 후순위 | Stage 6 | ADR-FE-006 §2.2 + deliverable 7 §6.5 |

#### ADR-FE-005 매개체 12 → 13 (Zod 추가)

| 매개체 | 채택 근거 |
|---|---|
| ★ Zod (#13) | Schema-First validation de facto / TypeScript-first / runtime + static type 양쪽 / `z.object()` / `.refine()` → rules.json fe_validation BR 자동 등록 |

#### 사용자 7 요구사항 7/7 = 100% 도달 유지 + 강화

- 요구 1 강화 — Zod / TS 타입 자동 추출 = 신규 시스템 즉시 활용
- 요구 4 강화 — form_validation BR 자동 등록 (auto_extracted=true 분리 운영)
- 요구 1/2/3/4/5/6/7 = 100% 유지

#### 다음 trigger

- **Stage 4 mini-PoC** — RealWorld React fork (1주 fail-fast) + ts-morph + Playwright + axe-core + ICU + Semgrep 진짜 실행 / 신뢰도 0.75+ 도달 / ★ ADR-FE-006 IR 4계층 정합도 검증
- **Stage 5** 본격 PoC #04 — 9 deliverable (7~15) + a11y + i18n + static-security + legacy + form-validation + type-spec
- **Stage 7** v1.4.0 MINOR release 결단 (Stage 5 검증 후)

### ★★★ BE Sprint 5+ carry-over 종결 (환경 무관 부분 / 2026-05-01 본 세션)

★★★ **drift-validator v0.1.0 → v0.2.0 / 3 도구 unit test 53/53 pass / 본체 phase-flow drift 0 자가 입증**. DEC-2026-05-01-Sprint-5-carryover-종결.md.

#### Phase 별 산출 (4 commit + 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | corpus 14 → 19쌍 (+6 신규 / multi-trigger / extra-event / multi-actor / extra-message / FE form / FE missing-error) + corpus.test.js +6 test (15 → 21) | `7b9d4b2` (14 file / +437) |
| **B** | drift-validator phase-flow 비교기 신설 — normalize-phase-flow.js + compare-phase-flow.js + cli.js 분기 + corpus 2쌍 + 4 test | `1ab6d14` (10 file / +316) |
| **C** | tools/_shared/baseline.js 공용 이동 + drift-validator/src/baseline.js re-export shim + DTV cli.js import path 갱신 + DTV baseline.test.js 신설 (4 test) + drift-validator v0.1.0 → ★ v0.2.0 | `8545e47` (6 file / +203 / -112) |
| **D** | static-runner SARIF→finding 어댑터 (sarif-to-finding.js) + cli.js --baseline/--ratchet/--write-baseline 통합 + baseline-mode.test.js (5 test) | `f82e6fa` (4 file / +209) |
| **F** | DEC-Sprint-5-carryover-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### ★ 정량 결과

| 도구 | 보강 전 | 보강 후 |
|---|---|---|
| drift-validator | v0.1.0 / 23 test | ★ **v0.2.0 / 33 test** (corpus 25 + baseline 8) |
| decision-table-validator | 7 test | ★ **11 test** (+4 baseline) |
| static-runner | 4 test | ★ **9 test** (+5 baseline-mode) |
| **3 도구 합계** | 34 test | ★★ **53/53 pass** ✅ |

#### ★★★ 본체 SSOT 자가 검증 (★ 핵심)

```
$ node tools/drift-validator/src/cli.js methodology-spec/workflow/phase-flow.json
[phase-flow] 0 breaking / 0 non-breaking / 0 info ✅
```

→ 본체 phase-flow.json + phase-flow.mermaid 짝 정합도 **drift 0** 입증. v1.4 quality 격상 강한 데이터.

#### ★ ADR-010 §2.5 정합 도달

| 도구 | 단계 | baseline 통합 |
|---|---|---|
| drift-validator | ADR-009 §2.1 단계 3 | ✅ |
| decision-table-validator | 단계 3 | ✅ |
| static-runner | 단계 5 (Semgrep/PMD) | ✅ (★ 진짜 실행 자체는 환경 의존) |

### Sprint 6 carry-over (★ 환경 의존만 잔여)

- Semgrep / PMD / OSV-Scanner 진짜 실행 1회 (★ Java 환경 필요)
- vacuum / openapi-changes 외부 도구 통합 (별도 작업)

본 v1.4 FE 트랙 + Sprint 5+ carry-over 와 **독립 병행 가능**.

### adoption workspace 영향

`ai-native-methodology-adoption/` 의 "원본 클론 변경 X" 가정은 본 release 진입으로 깨짐. v1.3.1 시점 dist (`dist/internal-v1.3/`) 는 그대로 보존. 향후 v1.4.0 정식 release 시 신규 dist (`dist/internal-v1.4/`) 빌드 가능. 동기화 정책 갱신은 별도 작업 (본 release scope 외부).

---

## [v1.3.1] — 2026-05-01 ⭐ release 보존 (PATCH — 파일명 컨벤션 정리)

### 트리거

`ai-native-methodology-adoption` workspace commit `0e01595 (D3 + D3.1)` 에서 사내 적용본 (`dist/internal-v1.3/`) 파일명 컨벤션을 정리 (한국어 → 영어 + 1자리 prefix + `.yml` → `.yaml`). 원본 정리는 별도 세션 보류 (Option γ) 였음 → 본 PATCH = **D3.2 = 원본 (이 repo) 동일 적용**. 효과: 원본 ↔ dist 동기화 → 이후 dist build 단순 복사로 환원 + cross-language 일관 + Windows path 친화.

### 변경 사항

#### Renamed (12 — `git mv`, history 보존)

| 영역 | 매핑 |
|---|---|
| Deliverables 8 | `01-아키텍처` → `1-architecture` / `02-도메인-모델` → `2-domain` / `03-API-계약` → `3-api` / `04-DB-스키마` → `4-db-schema` / `04-5-형식명세` → `4-5-formal-spec` / `05-비즈니스-규칙` → `5-business-rules` / `06-안티패턴` → `6-antipatterns` / `07-UI-UX-명세` → `7-ui-ux` |
| Workflow 2 | `phase-0-입력정리` → `phase-0-input` / `phase-4-비즈니스로직` → `phase-4-business-logic` |
| Glossary 1 | `methodology-spec/한국어-용어집.md` → `methodology-spec/glossary-ko.md` |
| Extension 1 | `templates/meta-confidence.template.yml` → `.yaml` |

#### Updated (cross-link sed 치환 — 33 파일)

README / CHANGELOG / decisions (INDEX / STATUS / 8 DEC) / docs/adr (4 ADR) / methodology-spec/workflow (phase-flow.json + phase-5-2-ui + phase-6-quality) / templates (4) / examples/poc-01·02·03 의 _manifest.yml + findings/poc-findings + RESUME + 일부 output (8) / 외부 `.claude/` 2.

#### 제외 (history artifact 21 — commit `0e01595` body 명시)

`examples/poc-XX/.claude/` 하위 PROGRESS / plan / research / case / document / senior / SESSION-WRAPUP 21 파일 = 과거 PoC 기록 그대로 유지.

### 검증

| 항목 | 결과 |
|---|---|
| formal-spec-link-validator | 4/4 pass |
| drift-validator | 14/14 pass |
| phase-flow.json JSON validity | OK |
| 12 신규 path `git ls-files` | 12/12 ✅ |
| 잔여 grep 12 token | 21 hits = 정확히 의도적 제외 |

### Scope

산출물 / 사상 / schema 변경 없음. 파일명 + cross-link 만. **PATCH 적격**.

---

## [v1.3.0] — 2026-05-01 (MINOR ★★★)

### 트리거

3 PoC (Spring Boot 2.5 / Spring Boot 3.3 Hexagonal / NestJS) 종결 후 본 방법론이 **platform-agnostic 임이 입증된 시점** + **★★★ no-simulation 정책 첫 실현 (spectral 실 실행)** + 격상 후보 6건 모두 적용 + Sprint 5 Node 도구 부분 종결.

> **본 release = 사내 표준으로 격상**. 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능. 신뢰도 85-92% 도달 (단계 4 — 진짜 도구 1회 실행 ★).

### 변경 사항

#### Added (추가) — v1.2.3 PATCH 흡수 + Sprint 5 부분

**v1.2.3 PATCH 흡수** (★ 본 MINOR 에 통합):
- 묶음 C (Phase 4.5 cross-link 의무화 schema)
- 묶음 I (AP-PERFORMANCE 3 PoC 권위 격상)
- 묶음 H (Positive finding 패턴 schema — severity:positive + learning_effect_type 4종 + status:logged)
- 묶음 K (Lifecycle BR 패턴 — decision_tables required 분리 + br_type enum + current_state_note)
- 묶음 R (NestJS 4 ADR — Auth-scope / Validation / HttpCode / TypeORM-Integrity)
- 묶음 D (ADR-006 final 격상 + ADR-010 Baseline + Ratchet 신규)
- §8.1 cross-platform 입증 정식 등재 (README "Platform-Agnostic 입증" 섹션)

**v1.2.3 후속 LMNO** (★ 본 MINOR 에 통합):
- 묶음 L (migration-cautions.md NestJS 변형 + 사내 도입 quality gate 정책)
- 묶음 M (ADR-010 baseline+ratchet 도구 implementation — drift + dmn 에 `--baseline` / `--ratchet` / `--write-baseline`)
- 묶음 N (formal-spec-link-validator 신규 도구 — Phase 4.5 cross-link enforcement)
- 묶음 O (PoC #03 BR formalization 100% — 18/18)

**★★★ Sprint 5 Node 도구 부분 종결 (2026-05-01 — 본 release 트리거)**:
- `tools/spectral-runner/` — `@stoplight/spectral-cli` wrapper 신설
- PoC #03 openapi.yaml 자가 적용 — **24 warnings / 0 errors / exit 0** ✅
- ★ 본 방법론 ★★★ no-simulation 정책 첫 실현 (drift/dmn 자체 도구 + spectral 진짜 외부 도구)
- ★ ADR-009 단계 4 (진짜 도구 1회 실행) 첫 도달
- 신뢰도 80-87% → **85-92%** 도달 가능 시점

### 정량

| 측정 | v1.2.2 → v1.3.0 |
|---|---|
| 본체 갭 closure | 7 → **15** |
| ADR 수 | 9 → **13** (NEST 4 + 010 1) |
| schema 갱신 | — → **4건** (C/H/K + finding-system) |
| 명세 본체 갱신 | — → **4건** (06 / finding-system / phase-4-5 / phase-6) |
| 도구 수 | 3 → **5** (★ formal-spec-link-validator + spectral-runner 신규) |
| 도구 unit test | 17 → **37** |
| PoC #03 BR coverage | — → **100%** (18/18) |
| PoC #03 신뢰도 | — → **0.91** (★ 단계 4) |
| 본 방법론 시뮬 패널티 신뢰도 | 80-87% | **85-92%** (★ spectral 실행 후) |

### v1.3.0 release 의 의미

- **★ 본 방법론 = 사내 표준 채택 가능 시점** — 3 PoC platform-agnostic 입증 + 진짜 도구 검증 + 12 묶음 본체 갭 closure
- **★ 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능** — `docs/v1.3-promotion-report.md` §5.3 정합
- **★ ROI 견적**: 소규모 5x / 중규모 7x / 대규모 12x

### Migration Guide (v1.2.x → v1.3.0)

본 v1.3.0 은 **하위 호환** (★ 모든 schema 변경 = optional 신규 필드 또는 null 허용 확장).

권장:
1. `api-extension.json` operations[] 에 `formal_spec_links` 추가 (선택 — coverage 정량 추적 가능)
2. `antipatterns.json` antipatterns[] 에 `formal_spec_links` 추가 (선택)
3. `finding-system.schema` 의 `severity:positive` + `status:logged` 활용 (cross-PoC 학습 효과 입증)
4. Lifecycle BR 시 `br_type: lifecycle` + `http_status: null` (★ K 묶음 정합)
5. 사내 도입 시 ADR-010 baseline + ratchet 의무 적용
6. 신규 NestJS 프로젝트 — ADR-NEST-001~004 의무

### Carry-over → v1.3.x (★ 후속 PATCH)

1. **Sprint 5 잔여** — Semgrep (Python+Java 환경) / PMD (Java) / OSV-Scanner (Go binary) 실 실행 — ★ 환경 변동 시
2. **Sprint 6** — vacuum / openapi-changes / corpus 14쌍 → 20쌍 / drift-validator phase-flow 비교기
3. **묶음 P 보강** — migration-cautions Spring Boot 변형 / FastAPI 변형 (★ 4번째 PoC 진입 시)
4. **사내 적용** — 첫 사내 legacy 분석 시 baseline 등재 + 분기별 review

---

## [v1.2.3] — 2026-04-30 (PATCH — ★ v1.3.0 에 흡수)

### 트리거

PoC #03 NestJS 종결 후 **본체 갭 4건 정식 해소** — 본체 도구/schema/명세를 PoC #03 검증 결과로 격상. 본 PATCH 는 **PoC 산출물 작업이 아닌 본 방법론 본체 격상** 에 집중 (사용자 명시 — quality 격상 방향 재정렬).

| 묶음 | 영역 |
|---|---|
| **C** | Phase 4.5 cross-link 의무화 schema (openapi-extension + antipatterns) |
| **I** | AP-PERFORMANCE-001 medium → high 정식 격상 (★ 3 PoC 권위) |
| **H** | Positive finding 패턴 schema 화 (★ severity:positive + status:logged + positive_finding_meta) |
| **K** | Lifecycle BR 패턴 본체 schema 반영 (★ formal-spec.schema decision_tables required 분리) |

이전 A 묶음 (drift-validator quality boost) + B 묶음 (Phase 4.5 풍부화) 의 본체 보강분도 본 PATCH 에서 정식화.

### 변경 사항

#### Added (추가)

**★ Phase 4.5 cross-link 의무화 (★★ 묶음 C)**

- `schemas/openapi-extension.schema.json` operations[] 에 `formal_spec_links` 필드 추가 (decision_tables / state_machines / sequence_diagrams).
- `schemas/antipatterns.schema.json` antipatterns[] 에 `formal_spec_links` 필드 추가 (decision_tables / state_machines / sequence_diagrams / invariants).
- 자발적 입증: PoC #03 9/21 op (43%) + 4/11 AP (36%) cross-link → schema 의무화 (optional but recommended).
- ★ ADR-008 (이중 렌더링) + Phase 4.5 본질 가치 정식 입증 데이터.

**★ Positive Finding 패턴 (★ 묶음 H)**

- `schemas/finding-system.schema.json` `severity` enum 에 `positive` 추가 / `status` enum 에 `logged` 추가.
- 신규 필드 `positive_finding_meta`:
  - `previous_poc_finding` — 이전 PoC negative finding ID
  - `current_poc_evidence` — 현 PoC positive 증거
  - `learning_effect_type` enum 4종 (framework_natural_avoidance / language_static_block / platform_difference / team_learning)
  - `v13_promotion_candidate` — v1.3 본체 격상 후보 표시
- `methodology-spec/finding-system.md` §4 + §5 갱신 — positive finding 패턴 + 4 학습 효과 분류 + logged 처분 신설.
- 사례: PoC #03 F-161 (Bearer 표준 = NestJS framework_natural_avoidance) — PoC #02 F-084 비재현.
- ★ 단일 PoC 과적합 회피 (§8.1) 의 적극적 입증 = "비재현 = 학습 효과" 정량화.

**★ Lifecycle BR 패턴 (★ 묶음 K)**

- `schemas/formal-spec.schema.json` `decision_tables` items 갱신:
  - `required` 분리 — always (br_id/trigger/condition/action/expected_result/verification_location/current_state) vs api (rejection_method/http_status/error_message).
  - `rejection_method`/`http_status`/`error_message` 타입 `["string", "null"]` / `["integer", "null"]` (lifecycle BR null 허용).
  - 신규 필드 `current_state_note` (★ 한국어 prefix enum 위반 회피 — F-156 fix).
  - 신규 필드 `br_type` enum (api / lifecycle / domain_invariant / performance / security).
- `methodology-spec/workflow/phase-4-5-formal-spec.md` §3.3.1 신설 — BR 분류 + null 허용 필드 + current_state_note 정식.
- 사례: PoC #03 BR-USER-PASSWORD-HASH-001 (@BeforeInsert) / BR-ARTICLE-COMMENT-EAGER-001 (eager loading).

#### Changed (변경)

**★ AP-PERFORMANCE-001 medium → high 정식 격상 (★ 묶음 I)**

- `methodology-spec/deliverables/6-antipatterns.md` §5.5 신설:
  - Severity 격상 정책 (★ 3 PoC 재현 = medium → high 자동 격상)
  - 정식 격상 사례 표 (AP-PERFORMANCE-001)
  - severity inflation 회피 패턴 (단일 PoC = 격상 ❌, 2 PoC = 권위 표기, 3 PoC = 격상 ✅)
- 근거: PoC #01 F-006 + PoC #02 F-051 + PoC #03 F-124 = 3 PoC 재현 권위.

**드리프트 / DMN 도구 보강 (★ 이전 묶음 A + B 본체 반영)**

- `tools/drift-validator/src/normalize-mermaid.js` — `state_ancestors` Map 추가 (sub-state ancestry 추적).
- `tools/drift-validator/src/compare.js` — `transitionFuzzyMatch` 6 case 확장 (compound state inner / sub-tree / self-loop / m.parent).
- `tools/drift-validator/corpus/` — 4쌍 → 14쌍 (★ Sprint 5 carry-over 70% 진척).
- `tools/decision-table-validator/src/json-sanity.js` — REQUIRED_ALWAYS / REQUIRED_IF_API 분리 (★ 묶음 K 의 도구 측 fix).

#### Validated (검증)

- drift-validator unit test 6 → 14 (모두 통과).
- PoC #03 자가 재검증 — drift breaking 20 → 8 → 0 ✅ / dmn 12 BR 0 breaking + 8 info (lifecycle null 의도) ✅.
- false positive 60% → 0% (★ ADR-009 단계 3+ 도달).

### 현재 상태

- **본체 갭 11건 closed** (v1.2.2 7건 + v1.2.3 4건).
- ADR 9개: 001~006 + 008 + 009 (변동 없음 — 본 PATCH 는 schema/명세 본체 격상).
- 신뢰도 정직 표기: 80-87% 유지 (시뮬 패널티 / Sprint 5 carry-over).
- PoC #03 신뢰도 0.87 (단계 3+).
- v1.3.0 정식 release 진입 직전 상태 도달.

### Carry-over → v1.3.0

1. **Sprint 5** — F-156 (한국어 prefix) 외 잔여 환경 의존 (Semgrep/PMD/spectral)
2. **묶음 R 신설** — NestJS 4 ADR (Auth / Validation / HttpCode / TypeORM) — DEC-v1.3-격상-데이터-완비 §2.1 #3
3. **묶음 D** — ADR provisional → final 격상 + ADR-010 (baseline + ratchet)
4. **§8.1 정식 등재** — 3 PoC cross-platform 입증 데이터 README/overview 등재
5. **migration-cautions NestJS 변형 추가** — 묶음 P 보강

---

## [v1.2.2] — 2026-04-30 (PATCH)

### 트리거

DEC-2026-04-30-M-묶음-갭-식별 의 P2-3 5건 일괄 처리. v1.2.0 격상 시점 "묶음 M 일괄" 로 미뤄졌던 본체 갭. **본체가 ADR-008 (이중 렌더링 사상) 을 100% 따르지 못하던 상태 해소** — 이제 본체도 PoC 산출물처럼 단일 진실 + AI 눈 + 사람 눈 의무 정합.

### 변경 사항

#### Added (추가)

**`templates/api.template.md`** (G3 — P2 #3)
- `templates/api.template.yaml` (AI 눈) 의 사람 눈 짝.
- PoC #01 / #02 `api.md` 형식 표준화 — endpoint heatmap + UC ↔ op 매핑 + RFC 위반 인덱스 + AP/finding 인덱스 + 변경 권고 우선순위.

**`methodology-spec/workflow/phase-flow.mermaid` + `phase-flow.json`** (G4 — P2 #4)
- 9 phase (0~6 + 4.5) + 산출물 의존 그래프 + Phase 4.5 도입 위치 시각화.
- `.json` 짝 (drift-validator 의 향후 phase-flow 비교기 v1.3+ 호환). 본 sprint 에서는 drift-validator 미인식 — Sprint 6 후속.

**`docs/adr/ADR-009-다이어그램-신뢰-모델.md`** (G5 — P2 #5) ★
- DEC-2026-04-29-다이어그램-신뢰-모델 + memory `feedback_diagram_trust_model.md` 정식 ADR 격상.
- **7단계 + 8단계 (이론적 100%) 신뢰도 정량 표** — 1차 작성 60-70% / cross-validation 75-85% / **★ v1.2.1 자동 도구 78-85% 단계 신설** / 시뮬 패널티 80-87% / 진짜 도구 85-92% / property test 90-95% / 사람 95%+ / 형식 증명 100%.
- **★★★ 도구 종류 enum 7종** — `ai_subagent` / `ai_persona_simulation` / `automated_tool` / `real_static_tool` / `property_test` / `human_review` / `formal_proof`. AI persona vs 진짜 도구 절대 동일 신뢰도 표기 ❌.
- ADR-008 과 짝 — 사상 (왜 두 렌더링) / 정량 (어디까지 믿나).
- 본 방법론 차별 자산 — 외부 사례 부재 (테크기업 사례 research fetch 실패).

**`templates/db-schema.template.md`** (G6 — P3 #6)
- `erd.template.mermaid` (사람 눈 다이어그램) + `schema.json/sql` (AI 눈) 의 보고서 짝.
- PoC #02 `정합성-검증-보고서.md` 형식 표준화 — 출처 매트릭스 + ORM derivative vs 수동 분별 (F-050) + 정합성 5종 + Race Safety + AP/finding 인덱스.

**`templates/meta-confidence.template.yaml`** (G7 — P3 #7)
- `schemas/meta-confidence.schema.json` (AI 눈) 의 사람 눈 짝.
- **dbt-score / Backstage EntityMeta 모델 차용** (Document agent research): `trust_level` (current % + current_step + validation_history[]) + `tool_type` enum (ADR-009 정합).
- PoC #02 `_manifest.yml` 형식 통합. 5종 물증 cross_validation 예시 주석 포함 (formal-spec.schema 정합).

#### Updated (갱신)

- `README.md` — v1.2.1 → v1.2.2 헤더 + ADR-009 명시
- `decisions/STATUS.md` — 묶음 M 7/7 완료 (P1 Sprint 3 + P2-3 본 sprint)
- `decisions/INDEX.md` — DEC-m-p2-3-종결 entry

### 현재 상태

- **본체 갭 7건 모두 closed** (P1 2건 Sprint 3 + P2-3 5건 본 sprint)
- ADR 8개: 001~006 + 008 + **009 신규**
- v1.2.x 묶음: A~P 16건 ready ✅ + M 7/7 ✅ — **사실상 v1.3 진입 가능 상태**
- 신뢰도 정직 표기: 80-87% (시뮬 패널티 유지 / Sprint 5 진짜 도구 carry-over)

### Carry-over

1. **Sprint 5** — static-runner 진짜 실행 1회 / drift-validator transitionFuzzyMatch 보완 / corpus 4쌍→20쌍 / ADR-010 (baseline+ratchet)
2. **Sprint 6** — drift-validator phase-flow 비교기 (v1.3+)
3. **시퀀스 B** — PoC #03 진입 (다른 stack)

---

## [v1.2.1] — 2026-04-30 (PATCH)

### 트리거

C-Sprint 4 종결 — 묶음 N+O 인프라 산출. v1.2.0 의 14/16 묶음 ready 에서 **16/16 ready** 로 격상. 진짜 외부 도구 실 실행은 환경 부재로 Sprint 5 carry-over (★★★ no-simulation 정책 정합).

| 묶음 | 영역 |
|---|---|
| **N** | Drift 자동 검증 도구 (CI) — drift-validator + decision-table-validator + drift-check.yml |
| **O** | 진짜 외부 도구 실행 의무화 — static-runner Plugin host + 5종 물증 schema enforcement + lint-no-simulation.sh |

→ 시퀀스 C 종결. 시퀀스 B (PoC #03) 또는 Sprint 5 (carry-over) 진입 가능.

### 변경 사항

#### Added (추가)

**도구 3종 신설 (`tools/`)**

- `tools/drift-validator/` — `.json ↔ .mermaid` 의미 동일성 자동 검증 (state-machine + sequence). 정규식 fallback (★ 30분 spike 결과 `@mermaid-js/parser` v1.1.0 미지원 입증). oasdiff 식 항목별 diff list + severity (`breaking`/`non-breaking`/`info`). corpus 4쌍 self-test (Sprint 5 → 20쌍 확장 carry-over). 6/6 unit test pass.
- `tools/decision-table-validator/` — dmn-check 5종 (duplicate / conflict / gap / overlap / type) + JSON sanity (formal-spec.schema 정합). `red6/dmn-check` Apache 2.0 알고리즘 차용. 7/7 test pass.
- `tools/static-runner/` — Semgrep / PMD / SpotBugs / Daikon / CodeQL plugin host. **5종 물증 schema enforcement** + `lint-no-simulation.sh` 차단 룰. 4/4 test pass. Sprint 4 1차: Semgrep + PMD plugin (SpotBugs/Daikon/CodeQL plugin skeleton 만 — Sprint 5+ carry-over).

총 17/17 unit test pass.

**CI workflow 신설**

- `.github/workflows/drift-check.yml` — 이중 모드 (PR diff-aware `SEMGREP_BASELINE_REF=main` / nightly full / manual dispatch). action 핀 (`actions/setup-java@v5` Temurin 21 + `actions/setup-node@v6`). SARIF Code Scanning upload + 30일 evidence artifact 보존.

#### Changed (변경)

**`schemas/formal-spec.schema.json` — `cross_validation` 5종 물증 의무화**

`validators[]` 항목에:
- `real_tool: true` 시 7 필드 (`tool_version` / `tool_stdout_path` / `tool_stderr_path` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command`) **JSON Schema if/then allOf 강제**
- `real_tool: false` 시 `simulation_reason` 의무
- `simulation_only: true` 시 자동 fail

→ DEC-2026-04-29-static-tool-실행-의무화 enforcement 자동화.

#### Validated (검증)

**PoC #02 자가 검증 (★ Sprint 4 본질적 가치)**

drift-validator + decision-table-validator 를 PoC #02 formal-spec 디렉토리에 적용:
- state-machine 2건: **7 breaking** + 0 non-breaking + 24 info
- sequence 2건: 0 breaking
- decision-table 6건: 0 breaking + **3 non-breaking** (interpretive drift)

→ Sprint 3 가 "drift 0" 으로 보고했던 산출물에서 **10건 자동 검출**. 수동 검증 한계 노출 = 묶음 N (Drift CI) 의 강한 ROI 정량 입증.

#### Findings (신규)

**Sprint 4 신규 finding 11건** (F-107~F-117) — `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-4-REPORT.md` 정리.

| 분류 | 건수 | 핵심 |
|---|---:|---|
| state-machine structural drift (high) | 4 | F-107 / F-109 / F-110 / F-112 |
| state-machine 추상화 layer (medium) | 3 | F-108 / F-111 / F-113 |
| decision-table interpretive (low) | 3 | F-114 / F-115 / F-116 |
| 메타 finding (medium) ★ | 1 | F-117 — Sprint 3 "drift 0" 수동 한계 노출 |

#### Carry-over → Sprint 5

1. static-runner Semgrep + PMD 1회 실 실행 (사용자 환경 설치 또는 CI 위임 후) — 신뢰도 80-87% → 90-95% 격상 가능
2. drift-validator transitionFuzzyMatch 보완 (composite state inner transition) — F-108/F-110/F-111 false positive 제거
3. corpus 4쌍 → 20쌍 확장
4. ADR-010 (baseline + ratchet) 격상 — 운영 표준 (Slack/GitLab/Dropbox/Figma/Shopify 사례 정합)

### 신뢰도 표기 (정직 유지)

- 시뮬 패널티 적용 시 80-87% (현재 — 본 환경 Java/Semgrep/PMD 부재)
- 진짜 도구 1회 실행 시 90-95% 목표 (Sprint 5 carry-over)

★★★ no-simulation 정책 정합 — 시뮬 결과를 신뢰도 90-95% 근거로 절대 사용 금지.

### 결정 / 보고서

- `decisions/DEC-2026-04-30-sprint-4-종결.md`
- `decisions/STATUS.md` 갱신 (v120_bundles_ready: 16/16)
- `decisions/INDEX.md` 갱신
- `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-4-REPORT.md`
- `examples/poc-02-realworld-springboot3/.claude/SESSION-WRAPUP-2026-04-30-sprint4.md`
- `ai-native-methodology/.claude/plans/plan-c-sprint-4.md` + `.claude/researches/research-c-sprint-4.md`

---

## [v1.2.0] — 2026-04-30 (MINOR)

### 트리거

PoC #01 + PoC #02 (1chz/realworld-java21-springboot3 — Spring Boot 3.3 / Java 21 / Multi-module Hexagonal) 누적 결과로 **MINOR 격상**. C-Sprint 1+1.5+2+3 (Phase 4.5 형식화 시범) 4 sprint 누적 정량 입증 + 14 묶음 통합:

| 묶음 | 영역 |
|---|---|
| A | cross-validation (F-015) — sub-agent 학습 코퍼스 의존 위험 회피 |
| B | 정정 트레이스 (F-022 + F-024) |
| C | severity 표준 (F-018) |
| D | schema 진화 (F-025) — multi-module + Hexagonal 모듈 분리 |
| E | quality-extraction |
| F | 신뢰도 공식 보강 |
| G | OpenAPI x-extension (ADR-007) — PoC #02 외부 검증 |
| H | multi-module / Auth/Crypto — PoC #01+#02 isomorphic ★★★ (AP-SECURITY-001 양 PoC 재현) |
| I | finding-system 정식화 (Sprint 3 schema 등록) |
| J | Hexagonal port-adapter 가이드 |
| K | multi-module Outside-in 모범 사례 |
| **L** | **Phase 4.5 형식화 정식 도입 — Sprint 1~3 누적 ★★★** |
| **M** | 본체 이중 렌더링 갭 P1 2건 적용 (P2-3 5건은 v1.2.0+ 일괄) |
| **P** | 안티패턴 migration_advice + migration-cautions.md |

이중 렌더링 정합도 67% → 100% (state-machine + sequence + decision-table 영역). v1.2.0 = "코드 → 형식 명세 + 위험 기록" 한 방향 추출기 가치 명세 정식 등록.

### 변경 사항

#### Added (추가)

**ADR-008: 이중 렌더링 사상 (신규 ★★★)** — DEC-2026-04-29-이중-렌더링-사상-명시화 격상

- 단일 진실 (SSOT) + 두 청중 (AI 눈 / 사람 눈) 사상 정식 등록
- 학문적 계보: Donald Knuth, "Literate Programming" (1984) AI 시대 재해석
- 영역별 적용 매트릭스 (7대 산출물 + Phase 4.5 5건 + 메타)
- ADR-001 (Schema-First) 포섭 (supersede X — Schema-First = AI 눈 부분)
- 신규 산출물 추가 시 양쪽 렌더링 의무 체크리스트

**Phase 4.5 형식 명세 (신규 ★★★)** — 묶음 L

- `methodology-spec/workflow/phase-4-5-formal-spec.md` — workflow 명세
- `methodology-spec/deliverables/4-5-formal-spec.md` — 산출물 명세
- `schemas/formal-spec.schema.json` — 5 산출물 schema (state_machines / sequences / decision_tables / invariants / property_tests + cross_validation 메타)
- `templates/formal-spec.template.md` — 작성 가이드
- `templates/state-machine.template.mermaid` — Mermaid stateDiagram-v2 예시
- `templates/sequence.template.mermaid` — Mermaid sequenceDiagram 예시
- `templates/decision-table.template.md` — 9 항목 표 (자연어 빈약성 100% 보완)
- 자연어 빈약성 정량 입증: 4/9 (44%) → 9/9 (100%) — PoC #02 F-074 단방향 round-trip 검증
- AI 코드 생성 정확도: 자연어 60% → 형식 90% (시뮬 패널티 시 80-87%)

**finding-system.schema.json (신규)** — M-P1-#1

- `schemas/finding-system.schema.json` 정식 등록 — `methodology-spec/finding-system.md` DRAFT 자산화 차단 해소
- finding 표준 형식 schema 화 (finding_id pattern / phase 0~6 + "4.5" / severity 4단계 critical 추가 / status 7단계 candidate/merged 추가 / cross_validation double_hit / severity_history)
- PoC #02 운영 패턴 (candidate / merged / critical / cross_validation double_hit) 모두 schema 화

**migration-cautions.md (신규)** — 묶음 P β

- `methodology-spec/workflow/phase-6-quality.md` 의무 산출물 격상 (β)
- 본 방법론 가치 명세: "코드 → 형식 명세 + **위험 기록** 한 방향 추출기" 정합
- 카테고리별 (API / DB / Security / Architecture / Domain / Performance) 신규 시스템 회피 가이드
- design / CI / Review 단계 체크리스트
- avoid-list.md 와 차이: 기존 시스템 fix vs 신규 시스템 회피

**`migration_advice` 필드 (antipatterns.schema.json 신규)** — 묶음 P α

- `schemas/antipatterns.schema.json` 에 `migration_advice` 필드 추가 (optional — 호환성 유지)
- PoC #02 21 AP backfill 완료 (PoC #01 15 AP 는 v1.2.x backfill)

#### Changed (변경)

**phase-6-quality.md §6 출력 (변경)** — 묶음 P β

- migration-cautions.md 의무 산출물 격상 (composite-patterns.md 와 동급)
- §6.0 신설: migration-cautions.md 구조 + avoid-list.md 와 차이 명시

**schemas/README.md (목록 갱신)** — 묶음 I + L

- finding-system.schema.json 추가
- formal-spec.schema.json 추가

#### PoC #02 산출물 (참조)

- `examples/poc-02-realworld-springboot3/` Phase 1~6 종결 (7대 산출물 6/7) + Phase 4.5 형식화 4 sprint
  - finding 43건 (F-042~F-087 + Sprint 1.5+2 신규 19건)
  - AP 21건 (critical 3 / high 3 / medium 10 / low 5)
  - migration_advice 21/21 backfill ✅
  - migration-cautions.md 신규 ✅
  - formal-spec/ 7대 영역 28 산출물 + 이중 렌더링 100%

### 알려진 한계 (v1.2.0 스코프 외 — F-021 §8.1 점검 결과)

C-Sprint 3 #4 §8.1 단일 PoC 과적합 회피 점검 결과:
- **Strong 후보**: 0건 (closed 8건 모두 통과)
- **한계 명시 후보 2건**:
  - F-016 (ddl-auto 분기) — closed 유지. PoC #02 F-049 메타 finding 으로 schema.sql ORM derivative 출처 의존성 분별 한계 부분 노출. v1.2.x 또는 v1.3.0 에서 보강 권고.
  - F-023 (SCC 도메인 의도 분기) — closed 유지. PoC #02 F-060 메타 finding 으로 §3.1.1 0건 케이스 한계 노출. v1.2.x 보강 권고.

### v1.2.0 스코프 외 (Sprint 4 / v1.2.x 후속)

- **묶음 N**: Drift 자동 검증 CI 도구 (이중 렌더링 .json ↔ .mermaid 일치 강제)
- **묶음 O**: 진짜 외부 도구 의무화 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — DEC-static-tool-실행-의무화)
- **묶음 M P2-3**: 본체 갭 5건 (api.template.md / phase-flow.mermaid / ADR-009 / db-schema.template.md / meta-confidence.template)
- **신뢰도**: 80-87% (시뮬 패널티) → 90-95% 목표 (Sprint 4 진짜 도구 도입)

### Migration Guide (이전 사용자용)

본 v1.2.0 은 **하위 호환** (MINOR — 모든 schema 변경은 옵셔널 신규 필드).

기존 v1.1.x 산출물에 다음 권장:
1. `antipatterns.json` 의 각 AP 에 `migration_advice` 필드 추가 (선택, 신규 시스템 회피 가이드)
2. Phase 6 산출 시 `migration-cautions.md` 신규 작성 (의무 산출물 격상 — β)
3. Phase 4 후 형식 명세 필요 시 Phase 4.5 진입 (`formal-spec/` 디렉토리 + 5 산출물)
4. 신규 산출물 추가 시 ADR-008 이중 렌더링 사상 의무 준수 (양쪽 렌더링 동시 산출)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (Phase 4.5 형식화 + migration-cautions 의무)
- ✅ 본 방법론으로 만든 v1.1.x 산출물 (호환, migration_advice + migration-cautions backfill 권장)
- ❌ Breaking change 없음

### 검증

- 11개 schema (formal-spec / finding-system 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-008 정합성: ADR-001 (Schema-First) 포섭 / ADR-002 (7대 산출물) 사상적 기반 / ADR-007 (OpenAPI x-extension) 정합
- 사료 강도: Knuth Literate Programming (1984) 1차 사료 + RFC 7231/9110 + Spring Data JPA Reference + Vlad Mihalcea + Vernon IDDD
- C-Sprint 1+1.5+2+3 누적 cross-validation: drift 34건 (Sprint 1.5 11 + Sprint 2 19 + Sprint 3 +0 — 정합 100%)

### Lessons Learned

- 이중 렌더링 사상 (ADR-008) 은 v1.1.x 시점에 이미 *암묵적으로* 적용되어 있었으나 사상 명시 부재 → Sprint 3 #1 직전 ADR-008 작성으로 묶음 L (Phase 4.5) 격상의 사상적 기반 강화
- F-074 단방향 round-trip 검증 패턴 (코드 부재 BR 선택 → 자연어 → 형식 → 코드 생성) — Sprint 1 self-reference 함정 회피 + 자연어 빈약성 정량 입증 (44% → 100%)
- M-P1 병행 패턴 (방법론 본체 갭 P1 을 PoC sprint 와 병행) — 사상 정식화와 PoC 정식화 동시 진행 가능
- Python script 일괄 적용 (21 AP migration_advice backfill / 6 decision-table .json 짝) — Edit 21번 vs script 1번 효율 차이 큼

---

## [v1.1.2] — 2026-04-28

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0~3 완료 + **F-021 누적 finding 임계** (18/20 도달) → 사용자 결정 Option A (PoC 정지 + v1.1.2 격상). high severity finding 4건 처리:
- F-007: inventory.schema.json + template 부재 (high)
- F-009: phase-1-init.md §6 신뢰도 표 환경 종속성 미명시 (high)
- F-016: phase-2-db.md §3.4 ddl-auto 매트릭스 부재 (high)
- F-023: phase-3-arch.md §3.1 Tarjan SCC vs 도메인 의도 분기 가이드 부재 (high)

### 변경 사항

#### Added (추가)

**schemas/inventory.schema.json (신규)** — F-007

- meta + repo + stack + architecture_style_candidates + modules_for_priority_analysis + directory_tree_extraction
- `repo.loc_extraction_method` enum (deterministic / heuristic_byte_per_35 / estimation / unknown) — F-009 결정성 축
- `architecture_style_candidates[].confidence` cap 0.7 (Phase 1 한계, 최종 분류는 Phase 3)
- `directory_tree_extraction.truncated` boolean — Trees API 한계 명시
- 산업 모델: Backstage Catalog Entity descriptor

**templates/inventory.template.json + inventory.template.md (신규)** — F-007

- placeholder 형식 + 사람용 README 형식 분리
- meta.warnings 의무화 항목 (heuristic LOC, truncated tree, ORM 단서 부족 등)

**schemas/README.md (신규)** — F-007

- 9개 schema 목록
- CI 검증 TODO (v1.3.0 도입 예정 — Backstage 진화 모델)
- v1.1.2 임시 정책: 수동 ajv 검증 권장
- 산업 사례 경고: OpenAPI 3.0→3.1 7년 divergence

**ADR-006 (신규, Provisional)** — F-023

- 순환 의존성 처리 default 정책
- hybrid (탐지 결정적 + 분류 BC 분기 + decision_required 페어)
- bc_status 3값 enum (same / different / undefined) + bc_assignment_explicit boolean + documented_decision boolean
- BC 미정의 default = medium + decision_required = true (ArchUnit FreezingArchRule 산업 표준)
- "intent" 단어 회피 (산업 표준 도구 0건 사용)
- revisit_at: PoC #02 완료 시점

#### Changed (변경)

**phase-1-init.md §6 신뢰도 표** — F-009

- 단일 표 + 결정성 (Determinism) 축 + 환경 caveat 컬럼 채택
- 결정성 tier: deterministic / snapshot-based / heuristic / pattern_matching / llm_with_grounding / llm_code_only
- inventory.meta.warnings 의무화 가이드 추가
- 산업 표준 5건 정합 (CodeQL `@precision` / Sourcegraph SCIP / Linguist / SonarCloud / tree-sitter)
- 안티 패턴 명시: "환경별로 표 자체를 분리" 거부 (DRY 위반 + enum 폭발 + 산업 표준 0건)

**phase-2-db.md §3.4 통합 우선순위** — F-016

- 7행 매트릭스 → **원칙 + Decision Tree + 부록 reference** 구조
- 원칙 3개 (자동 schema 변경 금지 / DDL versioned-reviewable-reversible / ORM = validate 한정)
- Decision Tree (마이그레이션 도구 도입 가능 → 운영 DB 존재)
- 부록 A: Hibernate ddl-auto enum 값 reference (운영 가능 여부 표시)
- 산업 권위 7/7 매트릭스 반대 (Vlad Mihalcea / Stripe / Atlasgo / Quesma) → 원칙 표준 채택

**phase-3-arch.md §3.1 순환 의존성 처리** — F-023

- §3.1.1 신설: Tarjan SCC + BC 분기 + decision_required 5단계
- 분류 표 + 도구 정책 분기 (Spring Modulith verify() / ArchUnit FreezingArchRule)
- §3.1.2 산출 형식 (architecture.json circular_dependencies[] 예시)
- ADR-006 참조 의무

**schemas/architecture.schema.json `circular_dependencies[]` 보강** — F-023

- 신규 옵셔널 필드 7개: id / detection.algorithm / bc_status / bc_assignment_explicit / documented_decision / decision_required / decision_owner / decision_deadline / phase_4_routing
- 모두 옵셔널 → v1.1.1 산출물 호환 (PATCH 가능)

#### Documentation (문서)

> ※ v1.1.2 작업 산출물 (`methodology-v1.1/.claude/`) 은 batch 1.5 (commit `c72d29c` 이후) 에서 폐기. 1차 사료는 git history 에서 조회 가능.

- `plan-v112.md` — 1원칙 산출물 (변경 계획)
- `researches/document-v112.md` — 공식문서 24개 출처
- `researches/senior-v112.md` — 시니어 의견
- `researches/case-v112-{f007,f009,f016,f023}.md` — 사례 (분리 재실행)
- `researches/research-v112.md` — 통합 (Q1~Q9 결정 매트릭스)
- `PROGRESS-v112.md` — 진행 로그 (시간순)

### Migration Guide (이전 사용자용)

본 v1.1.2 는 **하위 호환** (PATCH). 모든 schema 변경은 옵셔널 신규 필드.

기존 v1.1.1 산출물에 다음 권장:
1. `inventory.json`: 신규 schema 로 검증 (`ajv validate -s schemas/inventory.schema.json`). 누락 필드는 옵셔널이므로 통과.
2. `inventory.meta.warnings`: 환경 종속/추정 항목 명시 (heuristic LOC, truncated tree)
3. `architecture.json` 의 `circular_dependencies[]`: `bc_status=undefined` + `decision_required=true` 추가 권장 (BC 미정의 시 default)
4. `architecture.meta.warnings`: "v1.1.2 분기 가이드 적용 시 재산정 권장" 추가

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (inventory schema 검증 + 결정성 표 + 원칙 + Decision Tree + 순환 분기 가이드)
- ✅ 본 방법론으로 만든 v1.1.0/v1.1.1 산출물 (호환, warnings 추가만 권장)
- ❌ Breaking change 없음

### 검증

- 9개 schema (inventory 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-006 (provisional) 정합성: ADR-001 / ADR-004 와 충돌 없음
- 사료 강도: 4 finding 모두 1차 사료 직접 검증 (Drotbohm Discussion #493 / Vlad Mihalcea / CodeQL @precision / Backstage Entity.schema.json)
- F-015 cross-validation 패턴 적용 (sub-agent 결과 6건 모두 메인 cross-check)

### Lessons Learned

- 1원칙 (plan) 단계에서 변경 매트릭스가 PoC 사례 1건 (RealWorld) 에 너무 적합화됨 → research 통해 BC 미정의 default 가 PoC #02 (마이크로서비스) 에서 부적합 가능성 발견 → ADR-006 provisional 처리
- case agent 4 finding 일괄 처리는 hang 위험 (한국 테크블로그 Cloudflare 추정) → 1건씩 분할 + 한국 테크블로그 제외 + WebFetch 8회 제한이 안정적
- senior + case 가 plan 초안의 "intent" 단어를 동시 거부 → schema 어휘 결정 시 산업 표준 도구 조사 우선

---

## [v1.1.1] — 2026-04-26

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0에서 발견된 명세 빈틈 2건 해결:
- F-003: 신뢰도 메타데이터 자동 산정 공식 부재 (high)
- F-006: 영역별 가중 평균 방식 부재 (high)

### 변경 사항

#### Added (추가)

**ADR-003 §6~§10 (103 → 301 라인, 3배 확장)**

- §6 산정 공식 v1 (가법 모델 + 상한 0.98)
  - base_confidence: 0.75 (소스만 기준)
  - 가산점 표 10개 (ERD +0.10, ORM +0.10, ...)
  - 페널티 표 5개 (drift -0.05, no_orm -0.05, ...)
  - PoC #01 적용 예시
- §7 영역별 가중 평균 (요소 수 가중)
  - 공식: `weighted_avg = Σ(conf × element_count) / Σ(element_count)`
  - cap 우선순위: weighted 후 min(0.98, weighted)
- §8 추출 방법별 신뢰도 표
  - 결정적: 0.95~1.0
  - 패턴 매칭: 0.80~0.90
  - LLM 추론 (grounding): 0.50~0.75
  - LLM 추론 (코드만): 0.40~0.60
- §9 신뢰도 해석 가이드 (5단계)
  - ≥0.95 거의 확실 / 0.80~0.95 신뢰 가능 / 0.60~0.80 권장 / 0.50~0.60 필수 / <0.50 차단
  - confidence ≠ accuracy 명시
- §10 v1 한계 명시 (calibration 필요, 베이지안은 v2 후보)

**meta-confidence.schema.json 신규 필드 5개**

- `formula_version: "v1"` — 공식 버전 추적
- `applied_modifiers[]` — 어떤 가산점이 적용됐는지
- `applied_penalties[]` — 어떤 페널티가 적용됐는지
- `cap_applied: boolean` — 0.98 cap 적용 여부
- `manual_override: boolean` — 사용자 수동 변경 여부

**meta-confidence.schema.json 구조 강화**

- `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균용)
- `confidence_breakdown` 항목에 `extraction_method` enum 추가 (deterministic/pattern_matching/llm_with_grounding/llm_code_only)
- `inputs_used` enum 확장 (domain_context_md, postman_or_api_test, diagrams_other 추가)

**PoC #01 산출**

- `examples/poc-01-realworld-spring/source-info.md` — 분석 대상 메타정보
- `examples/poc-01-realworld-spring/inputs/domain-context.md` — LLM grounding
- `examples/poc-01-realworld-spring/inputs/_manifest.yml` — 입력 + 신뢰도 산정
- `examples/poc-01-realworld-spring/findings/poc-findings.md` — 명세 빈틈 누적 기록

#### Changed (변경)

**confidence cap 통일 (1.0 → 0.98)**

- `meta-confidence.schema.json`: confidence maximum 1.0 → 0.98
- `antipatterns.schema.json`: confidence maximum 1.0 → 0.98
- `rules.schema.json`: confidence maximum 1.0 → 0.98
- 산출물 명세 7개 검증 + 9곳 보정:
  - `1-architecture.md`: 모듈 식별/의존성/순환 의존성 1.0 → 0.98
  - `4-db-schema.md`: 운영DB 추가 시 1.0 → 0.98 (3곳)
  - `6-antipatterns.md`: static_analysis 1.0 → 0.98, "1.0 가능" → "0.98 cap까지"

**PoC #01 manifest 재계산**

- `expected_confidence_average`: 0.78 → 0.95 (정확한 공식 적용)
- `applied_modifiers` 명시: ORM full(+0.10), domain-context(+0.03), Postman(+0.05), diagrams(+0.02)

#### Documentation (문서)

- `plan-f003-신뢰도공식.md` — 해결 계획
- `research-f003-신뢰도공식.md` — 3-에이전트 토론 (가법 vs 곱셈 vs 베이지안 등 6개 주제)

### Migration Guide (이전 사용자용)

본 v1.1.1은 **하위 호환** (PATCH).

기존 v1.1.0 산출물에 다음만 권장:
1. `meta.formula_version: "v1"` 추가 (선택)
2. `confidence` 값이 1.0이면 0.98로 보정 (선택)
3. `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균 정확도↑, 선택)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (자동 신뢰도 산정 가능)
- ✅ 본 방법론으로 만든 v1.1.0 산출물 (호환, 재계산 권장)
- ❌ Breaking change 없음

### 검증

- 8개 schema JSON 문법 통과
- 모든 ADR 일관성 유지
- 산출물 명세 7개 정합성 확인
- Mermaid 검증 (이전 사이클에서 완료)

---

## [v1.1.0] — 2026-04-26 (초기)

### 트리거

사내 표준 AI-Native 개발 방법론 v1.1 설계 (분석 단계 ① Analyze).

### 변경 사항

#### Added (초기 작성)

**ADR 5개**

- ADR-001: 사상적 기반 (Schema-First + Contract-First + DDD-Lite + FSD)
- ADR-002: 7대 산출물 (UI/UX 신설)
- ADR-003: 신뢰도 메타데이터 표준 (§1~§5)
- ADR-004: DDD-Lite 강도 B (Aggregate/VO/Repository)
- ADR-005: 한국어 용어 정책 (3단)

**산출물 명세 7개** (`methodology-spec/deliverables/`)

- 01 아키텍처
- 02 도메인 모델 (DDD-Lite B)
- 03 API 계약
- 04 DB 스키마
- 05 비즈니스 규칙
- 06 안티패턴
- 07 UI/UX 명세

**워크플로우 명세 12개** (`methodology-spec/workflow/`)

- Phase 0: 입력 정리
- Phase 1: init
- Phase 2: db (정합성 검증 포함)
- Phase 3: arch
- Phase 4: 비즈니스 로직 (4영역 병렬)
  - 5.A DB 영역
  - 5.B FE 영역
  - 5.C 설정 영역
  - 5.D 외부 의존성
- Phase 5-1: api
- Phase 5-2: ui
- Phase 6: quality

**JSON Schema 8개**

- meta-confidence, architecture, domain, openapi-extension, db-schema, rules, antipatterns, ui-spec

**템플릿 7세트** (`templates/`)

- architecture, domain, erd, api(yaml), rules, antipatterns, ui-spec
- Mermaid 다이어그램 템플릿 5개

**기타**

- 한국어 용어집
- README.md

### 통계

- 44개 파일 / 8,548 라인
- Mermaid 블록 68개 (모두 §9.1 표준 준수)

---

## 다음 마일스톤

### v1.2.x (예정 — Sprint 4)

- **묶음 N**: Drift 자동 검증 CI 도구 (이중 렌더링 .json ↔ .mermaid 일치 강제)
- **묶음 O**: 진짜 외부 도구 의무화 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — DEC-static-tool-실행-의무화)
- **묶음 M P2-3**: 본체 갭 5건 (api.template.md / phase-flow.mermaid / ADR-009 / db-schema.template.md / meta-confidence.template)
- F-016 / F-023 한계 영역 명시 보강
- 신뢰도 80-87% → 90-95% (시뮬 패널티 제거)

### v1.3.0 (계획 — 데이터 완비 시점 ★★)

★ **2026-04-30 PoC #03 종결 = 격상 데이터 완비 ★★** — 자세한 통합 보고서 `docs/v1.3-promotion-report.md` + DEC `DEC-2026-04-30-v1.3-격상-데이터-완비.md`.

#### 격상 후보 6건 (사용자 결단 영역)

| # | 후보 | source |
|---|---|---|
| 1 | **AP-PERFORMANCE-001 medium → high 격상** | 3 PoC 재현 권위 (PoC #01 F-006 + PoC #02 F-051 + PoC #03 F-124+F-135) |
| 2 | **Positive finding 패턴 정식 도입** | F-161 (NestJS Bearer 표준 학습 효과) |
| 3 | **묶음 R (NestJS 4 ADR)** | PoC #03 NestJS 8 함정 + 학습 효과 3건 |
| 4 | **Phase 4.5 cross-link 의무화** | PoC #03 9/21 op + 4/11 AP 자발적 입증 |
| 5 | **migration-cautions.md NestJS 변형 추가** | 묶음 P 보강 |
| 6 | **§8.1 cross-platform 입증 정식 등재** | 12 cross-validation (Java→TypeScript) 균형 분포 |

#### Sprint 5 진입 의무 (정식 release 전제)

- F-154 transitionFuzzyMatch 보완 + corpus 4쌍→20쌍
- 진짜 static tool (Semgrep / PMD / OSV-Scanner) 1회 실행
- ADR-010 (baseline + ratchet) 격상

→ Sprint 5 종결 + 격상 후보 6건 채택 결단 후 v1.3.0 정식 release 가능 (신뢰도 90-95%+).

#### 사내 적용 시작 가능 (★★ v1.2.2 시점부터)

본 방법론 v1.2.2 = 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능 — `docs/v1.3-promotion-report.md §5` 참조.

### v2.0.0 (먼 미래)

- 베이지안 신뢰도 모델 (§ADR-003 §10)
- 풀 DDD (Bounded Context Map) 채택 검토
- Event Sourcing/CQRS 채택 검토

---

## 참고

- ADR 5개: `docs/adr/`
- PoC #01: `examples/poc-01-realworld-spring/`
- finding 누적: `examples/poc-01-realworld-spring/findings/poc-findings.md`
