# DEC-2026-05-29 — sub-rule §X-H v1.2.0 본격 cascade + methodology-spec §사례 3 갱신 (poc-17 Phase 1 첫 corroboration)

> **결단일**: 2026-05-29
> **세션**: 51차 (poc-17 Phase 1 analysis baseline 본격 종결 → carry 자산화 cycle A+B+C+D)
> **버전**: v11.4.0 MINOR (additive only / breaking 0)
> **연관 ADR**: ADR-CHAIN-010 (sub-rule v1.0 origin) + ADR-CHAIN-014 (K) + ADR-CHAIN-015 (L)
> **연관 DEC**: DEC-2026-05-28-db-assets-always-on + DEC-2026-05-28-sp-conversion-policy
> **사용자 결단**: A+B+C+D 전체 시행 (v11.4.0 release 까지) — 본 세션 / Phase 1 종결 직후

## 1. 결단

poc-17 ifrs/car 도메인 Phase 1 analysis baseline (12 phase 전수 산출 / 사내 source 격리 paradigm 첫 live) 종결 시점에 본격 누적된 사실을 본 레포 paradigm 강화 cascade 로 자산화:

### A. sub-rule §X-H 본격 cascade (`methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.1.2 → **v1.2.0 MINOR**)

- **§X-H 본문 4 sub-section 본격 신축** (poc-17 Phase 1 종결 사실):
  - (1) 자산 실측 (Phase 1 종결)
  - (2) sub-axis 자동화율 본격 측정 (81.25% / AP detection sub-axis만 / R1' axis 와 별 metric)
  - (3) §X-H-11 신축 AP 본격 등재 (AP-LEGACY-IBATIS2-DB-001~011)
  - (4) R1'-c (DB axis) 첫 corroboration 사실
- ★ ★ ★ **§X-H-11 신축 AP 11종 본격 자산화**:
  - AP-LEGACY-IBATIS2-DB-001 (N+1 / N+5 subquery)
  - AP-LEGACY-IBATIS2-DB-002 (cross-DB 직접 참조)
  - AP-LEGACY-IBATIS2-DB-003 (외부 SP EXEC `<procedure>`)
  - AP-LEGACY-IBATIS2-DB-004 (JSP unsanitized expression)
  - **AP-LEGACY-IBATIS2-DB-005 (★ critical PII 하드코딩 / LLM grounded review only)**
  - AP-LEGACY-IBATIS2-DB-006 (주석 처리 SQL 본문)
  - AP-LEGACY-IBATIS2-DB-007 (Magic constants)
  - AP-LEGACY-IBATIS2-DB-008 (insert() = `<update>` 불일치)
  - AP-LEGACY-IBATIS2-DB-009 (System.out.println debug)
  - AP-LEGACY-IBATIS2-DB-010 (Parallel array iterate)
  - AP-LEGACY-IBATIS2-DB-011 (N+1 cross-DB subquery)
- ★ sub-rule §2 core 5 AP 변경 ❌ / ADR-CHAIN-010 변경 ❌ / schema 변경 ❌

### B. memory 2 갱신 (paradigm 사실 누적)

- `feedback_composite_view_pattern.md` — PoC #02 4건 → **PoC #17 5건** 본격 확장 (사내 legacy paradigm 첫 적용)
- `feedback_finding_threshold.md` — F-021 임계 paradigm 갱신 (**legacy paradigm 별 임계** 신축 / 일반 PoC 5~15 vs legacy PoC 30~60 / poc-17 = 43건 정합)

### C. methodology-spec §사례 3 갱신 (★ K + L + baseline-delta)

- `db-assets-always-on.md` §8 사례 본격 확장:
  - DB Tables 5 → **6** 정정 (실측 / TB_CAR 누락 정정)
  - ★ ★ K 정책 본격 가치 입증 (cross-DB 18 자산 본격 발견 / Java/sqlMap layer 만으로 노출 ❌)
  - sub-rule §X-H 첫 corroboration 사실 동행
  - 자동 validator 부재 carry (F-DB-AUTOVAL-001)
- `sp-conversion-policy.md` §10 사례 본격 확장:
  - 외부 SP γ 1건 + 사내 utility function 2건 추가 발견 (FN_SPLIT + fn_lpad / F-MISSING-FN-001)
  - L 정책 본격 적용 사실 (`<procedure>` tag + parameterMap + magic 위치)
  - sub-rule §X-H R1'-c 정합 사실
- `baseline-delta-operating-model.md` §5 사례 본격 신설:
  - canonical global baseline 첫 본격 적용 사례
  - cadence 3 단계 본격 입증
  - K + L 정책 통합 적용 본격 입증

### D. v11.4.0 MINOR release ceremony

본 DEC + INDEX + CHANGELOG + CLAUDE.md sync + version 3-way + 검증.

## 2. 사유

### 2.1 본격 사실 누적 가치
poc-17 = **사내 source 첫 live analysis baseline 본격 종결** (12 phase 전수 / 25+ 산출물 / 43 finding / 16 AP). 본 사실 누적은 ★ ★ paradigm 강화 cycle 의 본격 trigger:
- R1' axis 4번째 corroboration (PoC #06+#07+#11+#17 / scale-cross 4 spectrum)
- §X-H sub-axis (R1'-c DB axis) 첫 corroboration
- K + L 정책 first live 본격 가치 입증 (cross-DB 18 자산)
- Composite View 패턴 5건 사내 적용 (memory)
- F-021 임계 초과 = legacy paradigm 첫 사례 (memory)

### 2.2 본격 cycle paradigm 정합
- **C-sub-axis-3-poc-corroboration** carry 자격 1/3 충족 (poc-17 첫 측정)
- **plugin axis 강화** = 듀얼 목표 본질 (memory `feedback_dual_goal_migration_plus_plugin` 정합)
- additive only paradigm 정합 (breaking 0 / sub-rule §2 core 5 AP 변경 ❌)

### 2.3 본격 입증 paradigm 정합
- ★ ★ ★ no-simulation 본격 정합 (PMD 7.24.0 실 실행 + LLM grounded review 분리 명시 / -5%p 패널티 ❌)
- ★ ★ 사내 source 격리 paradigm (LL-codegraph-07) 첫 live 입증 (위반 0건 confirm)
- ★ Scenario C (JSP) 첫 사내 적용 사례

## 3. 영향

### 3.1 본 cycle 변경
- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.1.2 → v1.2.0 MINOR
- `methodology-spec/db-assets-always-on.md` §8 본격 확장
- `methodology-spec/sp-conversion-policy.md` §10 본격 확장
- `methodology-spec/baseline-delta-operating-model.md` §5 신설 (§6/§7 번호 shift)
- `decisions/PROGRESS-poc-17-dogfooding.md` Phase 1 종결 entry (마스킹)
- memory 2: `feedback_composite_view_pattern` + `feedback_finding_threshold`

### 3.2 본 cycle 변경 ❌ (보존)
- schema 변경 ❌
- ADR-CHAIN-010 변경 ❌
- ADR-CHAIN-014/015 변경 ❌
- sub-rule §2 core 5 AP 변경 ❌
- plugin manifest skill/agent body 변경 ❌
- workspace test 본격 추가 ❌ (sub-rule body 만 갱신)

### 3.3 STOP-3 의무 (release ceremony)
- workspace test pass (영향 0 사실)
- release-readiness 22/22 ready (영향 0 사실)
- skill-citation 0 stale (sub-rule 문서 갱신만 / skill body 변경 ❌)
- version 3-way **v11.4.0** sync (package.json + plugin.json + CLAUDE.md)
- breaking 0 (additive only)

## 4. carry (별 cycle)

- C-sub-axis-3-poc-corroboration (★ poc-17 첫 + ≥ 2 추가 도메인 측정 의무 / 자격 1/3)
- C-c-layer-baseline-재측정 (★ DB 자산 always-on 정책 적용 후 (a)+(b)+(c) 통합 baseline 재측정)
- C-jsp-parser-augment (★ PMD 7.x JSP grammar 71% parse fail → SonarQube/jsp-lint 보강 carry)
- C-db-autoval (★ F-DB-AUTOVAL-001 / K 정책 자동 validator 신설)
- chain 1 discovery 진입 결단 (poc-17 car-list pilot 의 사용자 결단)
- F-PII-HARDCODE-001 즉시 정정 (★ 사내 source / 본 레포 외부 / 사용자 결단)

## 5. LL 후보

- **LL-poc-17-01**: 사내 source 격리 paradigm + 본 레포 plugin axis 강화 = ★ ★ ★ 본격 dogfooding live probe paradigm 첫 본격 입증 (memory `feedback_live_probe_vs_retroactive` 정합).
- **LL-poc-17-02**: legacy PoC = finding 본격 누적 자연 사실 / F-021 임계 paradigm 분리 의무 (일반 PoC 5~15 vs legacy 30~60).
- **LL-poc-17-03**: sub-rule §X-H sub-axis = R1' axis ceiling 53~55% 와 별 metric (sub-axis 81.25%) — 외부 인용 시 axis 혼동 회피 의무.
- **LL-poc-17-04**: Composite View 패턴 = legacy PoC 의 cross-cutting concern 통합 압축 가치 본격 입증 (16 AP + 43 finding → 5 CV).

## 6. 인용

- `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.2.0 (본 cycle 갱신)
- `methodology-spec/db-assets-always-on.md` §8 (본 cycle 갱신)
- `methodology-spec/sp-conversion-policy.md` §10 (본 cycle 갱신)
- `methodology-spec/baseline-delta-operating-model.md` §5 (본 cycle 신설)
- DEC-2026-05-28-db-assets-always-on (K 정책)
- DEC-2026-05-28-sp-conversion-policy (L 정책)
- ADR-CHAIN-010 (sub-rule v1.0 origin)
- `decisions/PROGRESS-poc-17-dogfooding.md` (Phase 1 본격 entry)
- 외부 (사내 source 격리): `~/Documents/Development/Study/poc-17-ifrs-car-migration/.aimd/output/` (canonical global / 25+ 산출물)
- memory: `feedback_composite_view_pattern` + `feedback_finding_threshold` + `feedback_live_probe_vs_retroactive` + `feedback_dual_goal_migration_plus_plugin`
