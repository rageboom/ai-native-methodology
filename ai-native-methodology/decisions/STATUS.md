# 현재 상태 (Live Snapshot)

> 휘발성 진행 상태. 영속 컨텍스트는 [`/CLAUDE.md`](../../CLAUDE.md), 결정 이력은 [INDEX.md](INDEX.md).
> 본 파일은 phase / sprint 종결 시 갱신.

**기준일**: 2026-04-30 (v1.2.2 PATCH 종결 ✅ — 본체 갭 7건 모두 closed)

---

## 방법론 본체 버전

- **★ v1.2.2 PATCH 격상 완료** — 묶음 M-P2-3 5건: api.template.md / phase-flow.mermaid+json / ADR-009 (다이어그램 신뢰 모델) / db-schema.template.md / meta-confidence.template.yml. 본체 갭 7건 모두 closed → ADR-008 (이중 렌더링) 본체 100% 정합.
- **v1.2.1 PATCH** — drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 강제.
- **v1.2.0 MINOR** — 14 묶음 (A~M+P) 통합. ADR-008 + Phase 4.5 정식 + finding-system schema + migration-cautions 의무.
- v1.1.2 PATCH (high 4건 closed) → v1.2.0 흡수

## 시퀀스 진행률

| 시점 | 작업 | 상태 |
|---|---|---|
| PoC #01 Phase 0~6 | RealWorld Spring Boot 2.5 | ✅ 종결 (2026-04-29) |
| PoC #02 Phase 1~6 | 1chz/realworld-java21-springboot3 | ✅ 종결 (2026-04-29) |
| C-Sprint 1 | F-074 단방향 round-trip + BR 1건 형식화 시범 | ✅ |
| C-Sprint 1.5 | 다이어그램 신뢰도 강화 + cross-validation | ✅ |
| C-Sprint 2 | BR 5건 형식화 + cross-validation 의무 + F-074 우선 | ✅ |
| C-Sprint 3 | Phase 4.5 정식 명세화 + JSON 짝 + α+β + M-P1 병행 | ✅ |
| C-Sprint 4 | drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 + PoC #02 자가 검증 (★ 7+3 finding 자동 검출) | ✅ |
| **묶음 M-P2-3** | 본체 갭 5건 — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yml | ✅ **본 세션** |
| **C-Sprint 5** | (carry-over — 환경 의존) static tool 실 실행 1회 + drift-validator transitionFuzzyMatch 보완 + corpus 4쌍→20쌍 + ADR-010 격상 | ⏳ 환경 준비 후 |
| **시퀀스 B — PoC #03 NestJS** | Phase 0~4 종결 (Phase 4.5+ carry) | 🔄 **진행 중** |
| 시퀀스 B Phase 4.5+ | Phase 4.5 형식 명세 (★ drift-validator + decision-table-validator 첫 외부 검증) → 5-1 → 6 | ⏳ **다음** |

---

## PoC #01 종결 (2026-04-29)

- Phase 0~6 완료 — 7대 산출물 6/7 (UI/UX 제외 100%)
- finding **33건** (closed 10 / promoted 10 / deferred 13)
- AP **15건** (critical 2 / high 2 / medium 7 / low 4)
- raw confidence: Phase 6 0.96
- 핵심 결함: AP-DOMAIN-001 (De Morgan critical) + AP-SECURITY-001 (JWT 21byte critical) + AP-DOMAIN-002 (email/username unique 3중 부재)

## PoC #02 종결 (2026-04-29)

분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e` / Spring Boot 3.3 + Java 21 + Multi-module Hexagonal)

### Phase 1~6 산출

| Phase | 산출 | raw conf | 핵심 |
|---|---|---|---|
| 1 (init) | inventory.json + stack-detection.md + tree.md + stats.json + _manifest.yml | 0.93 | Hexagonal Modular Monolith hybrid 0.65 cap |
| 2 (db) | schema.json + schema.sql + erd.mermaid + 정합성-검증-보고서.md + _manifest.yml | 0.85 | F-048 critical (TagJpaRepository 타입 오류 ★ Senior 발견) |
| 3 (arch) | architecture.json + architecture.md + architecture.mermaid + dependency-graph.mermaid + circular-dependencies.md + _manifest.yml | 0.92 | LV/CIRCULAR 0건 / F-068 critical (RSA git commit ★ Senior 발견) |
| 4 (domain+rules+AP partial) | domain/* + rules/* + antipatterns-partial/* | 0.83 | 4 Aggregate Root + 25 UC + 14 BR + 6 AP partial |
| 5-1 (api) | openapi.yaml + api-extension.json + api.md + _manifest.yml | 0.93 | 19 op / openapi.yaml ground truth 802 line 사용자 작성 |
| 6 (antipatterns final) | antipatterns.json (21 AP) + avoid-list.md + _manifest.yml | 0.96 | **3 critical: AP-API-001 / AP-DB-001 / AP-SECURITY-001** |

### PoC #02 핵심 결함 (사내 적용 시 즉시 수정 critical 3건)

- **AP-API-001 critical** — F-070+F-079+F-085 spec/runtime drift 묶음 (RFC 7231 §4.2.2 + RFC 9110 §15.3 이중 위반)
- **AP-DB-001 critical** — F-048 TagJpaRepository<Tag, Integer> 타입 오류 (1글자 fix: Integer → String)
- **AP-SECURITY-001 critical** — F-068 RSA private key (`server/api/src/main/resources/app.key`) git 직접 commit (PoC #01 isomorphic ★)

### PoC #02 finding 통계

- finding **43건** (F-042~F-087 / F-079 → F-070 merged)
- promoted 31 / candidate 8 / deferred 4 / closed 0
- F-070 high → critical 격상 (Phase 5-1)
- F-085 low → medium 격상 (Phase 5-1)
- F-081 medium → low 강등 (Phase 5-1)

### PoC #02 5 핵심 결정 (Phase 6 — 윤주스 일괄 승인)

- DEC-001 — AP-API-001 critical 단일 등록 (Phase 5-1 정합)
- DEC-002 ★ — Phase 1-3 누락 candidate 5건 등록 (F-048 / F-068 / F-051 / F-053 / F-069)
- DEC-003 — ID 정규화 6건 (multi-prefix → single)
- DEC-004 — composite view 4건 도입 (PoC #01 1건 → 4건 확장)
- DEC-005 — low candidate 3건 등록 (F-058 / F-076 / F-078)

### PoC #01 ↔ PoC #02 cross-validation (15 AP 외부 검증)

- **비재현 8건 (53%)** — Hexagonal 분리 + Spring Boot 3.x 효과 (학습 효과 입증)
- **재현 4건 (27%)** — v1.2.0 합산 격상 강한 권위 (AP-PERFORMANCE-001 medium → high 격상 / AP-API-001~002 + AP-DB-001 재현)
- **변형 재현 3건 (20%)** — AP-SECURITY-001 (JWT 21byte → RSA git commit isomorphic ★) + AP-DOMAIN-002 + AP-ARCH-002

---

## 누적 통계 (C-Sprint 4 종결 시점)

```yaml
finding_total: 117         # +11 (Sprint 4 신규 F-107~F-117)
finding_closed: 10
finding_promoted: 41
finding_deferred: 18
finding_candidate: 19      # +11 (Sprint 4 신규)
finding_merged: 1
finding_rejected: 0
finding_phase45_new: 41    # Sprint 1.5 11 + Sprint 2 19 + Sprint 4 11

ap_total: 36
ap_with_migration_advice: 21

formal_spec_artifacts: 29  # +1 SPRINT-4-REPORT.md
methodology_body_tools_added: 3  # drift-validator + decision-table-validator + static-runner

v120_bundles: 16           # A~P
v120_bundles_ready: 16     # ★ A~P 전체 — Sprint 4 N+O 인프라 산출 완료
이중_렌더링_정합_검증_도구: ✅   # drift-validator 자동화 / Sprint 3 수동 한계 노출 (F-117)
이중_렌더링_드리프트_자동검출: state-machine 7 breaking + decision-table 3 non-breaking
신뢰도_정직표기: 80-87%    # 시뮬 패널티 유지 (실 static tool Sprint 5 carry-over)
신뢰도_목표_after_sprint5: 90-95%  # 진짜 Semgrep/PMD 1회 실행 시

unit_tests_passing: 17/17  # drift-validator 6 + dmn-check 7 + static-runner 4
ci_workflow_files: 1       # .github/workflows/drift-check.yml (drift + static dual mode)
```

---

## Phase 4.5 형식화 시범 (시퀀스 C) 핵심 결과

| Sprint | 핵심 | 정량 |
|---|---|---|
| 1 | BR-EMAIL-UNIQUE 4 산출물 / self-reference 함정 자가 시인 | drift 4건 |
| 1.5 | Cross-validation + Static Analyzer **시뮬레이션** + Property test 명세 | drift +11건 / 신뢰도 60-70% → 80-87% |
| **2** | **★★★ F-074 단방향 round-trip 검증 — 자연어 빈약성 44% → 100%** | drift +19건 / **양쪽 발견 ★★ 2건 (F-097 high `@Transactional` 부재 / F-098 high Equality on transient)** |

→ **묶음 L (Phase 4.5 정식 도입) 데이터 100% 충분 ✅**.

## v1.2.0 격상 묶음 합산 데이터 (16 묶음 A~P)

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
| **★ L** | **Phase 4.5 형식화 정식 도입 (ADR-008/009)** | **C-Sprint 1~3 누적 ✅ 100% — 정식 명세화 완료** |
| **M** | 방법론 본체 이중 렌더링 갭 해소 | **★ 갭 7건 모두 closed ✅** (P1 2건 Sprint 3 + P2-3 5건 v1.2.2) — api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yml |
| **N** | Drift 자동 검증 도구 (CI) | **Sprint 4 적용 ✅** (drift-validator + decision-table-validator + drift-check.yml + 17/17 test pass + PoC #02 자가 검증으로 7+3 finding 자동 검출) |
| **O** | 진짜 외부 도구 실행 의무화 (★★★) | **Sprint 4 인프라 적용 ✅** (static-runner Plugin host + Semgrep/PMD plugin + 5종 물증 schema enforcement + lint-no-simulation.sh). 실행은 Sprint 5 carry-over (Java/Semgrep/PMD 환경 부재) |
| **P** | 안티패턴 migration_advice + migration-cautions.md | **Sprint 3 적용 ✅** |
