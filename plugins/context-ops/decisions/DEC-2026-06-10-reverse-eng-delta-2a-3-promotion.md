# DEC-2026-06-10-reverse-eng-delta-2a-3-promotion

**결단**: 역공학 델타 **#2a run-manifest** + **#3 recovered-ADR** 를 1차 draft → **official(opt-in)** 격상. §8.1 ≥2 distinct 도메인 PoC corroboration 충족. 격상 레벨 = scope-carve 선례(DEC-2026-06-10-scope-carve-promotion)와 동형 — **official / opt-in(MANDATORY ❌)**: cross-cutting aspect 로 모든 프로젝트 비적용(recovered-ADR=legacy/brownfield 한정 / run-manifest=runnable 산출물 한정).

**작성일**: 2026-06-10 (사용자 결단: "역공학 델타 #1~#4 격상 진행" → 1원칙 조사가 #1·#4·#2b 는 이미 격상/출하 확인 → 잔여 = #2a de-draft + #3 2nd 도메인 dogfood. #3 2nd 도메인 = ep-be-gea live dogfood 와 묶어 해결[사용자 지시]).

**relates to**:
- `DEC-2026-06-09-recovered-adr-rationale-abstention` (#3 모 결단 / 1차 draft → 본 DEC 가 official)
- `DEC-2026-06-09-build-run-env-manifest` (#2a 모 결단 / 1차 draft → 본 DEC 가 official)
- `DEC-2026-06-10-scope-carve-promotion` (격상 레벨 선례 official/opt-in)
- `DEC-2026-06-09-reverse-eng-methodology-gap` §3 (델타 backlog SSOT / plan-reverse-engineering-methodology.md)
- `feedback_self_recorded_fact_validation` (self-생성 ep-be-gea 증거 Senior 적대검증 의무)
- `feedback_internal_source_poc_external_location` (ep-be-gea 외부격리·commit ❌·마스킹만)

---

## 1. 배경 — "#1~#4 격상" 의 실제 잔여 (diagnose-before-design)

사용자 "역공학 델타 #1~#4 격상" 지시에 1원칙 병렬 조사. **대부분 이미 격상/출하**:
- **#1 scope-carve** = 이미 official (v0.27.0 / DEC-2026-06-10-scope-carve-promotion / poc-01+ep-be-gea ≥2 도메인).
- **#4 hotspot** = scope-carve 에 흡수 격상(hotspot.js additive / 38 test).
- **#2b secret-scan** = 이미 live 게이트(release-readiness check42 / 242 산출물 0-hit).
- **실 잔여 = #2a run-manifest(corroboration 충족·de-draft 만) + #3 recovered-ADR(1 도메인 → 2nd 필요)**.

## 2. 격상 근거 (§8.1 ≥2 distinct 도메인)

### #2a run-manifest — corroboration 이미 충족
- poc-18(Node/Express/Prisma — npm/Dockerfile) + poc-10(Spring Boot/Gradle/JVM) 2 paradigm dogfood (committed 산출물). build:deterministic-parse / run·env source-grounded / env value 미저장(name+is_secret+sensitivity) / check42 정합. → de-draft.

### #3 recovered-ADR — 2nd 도메인 dogfood 신규 (ep-be-gea)
- **1st** = poc-08 jpetstore(MyBatis legacy / Maven WAR 단일 / committed).
- **2nd** = **ep-be-gea** (대형 multi-module Spring Boot 3.x / Gradle / 사내 codebase / **외부격리·commit ❌** / 산출물·원문은 [[feedback_internal_source_poc_external_location]] 규약대로 비공개).
- **마스킹 수치만 공개**(Senior Q5 지시 — RADR 원문 title/decision/anchor·사내 식별자 전사 금지):
  - recovered_adr **12건** / schema-valid / `evidence_trust=real_extraction`.
  - rationale certainty 분포 = **observed 3 / inferred-consequence 6 / unverified-intent 3** (`rationale_unknown_count=3` = 정직 abstention 노출).
  - 결정 축 커버리지(category) = structure / dependencies / construction / security_regulatory / nfr / interfaces 전반(빌드·패키징·모듈구조·버전핀·영속선택·설정보안·관측성·코드포맷).
  - **observed 3건 = 빌드 스크립트 WHY 주석 grounding**(Senior exact-match 검증 / over-attribution 0). **unverified-intent 3건 = 소스 WHY 부재 정직 abstain**(Senior: 근거 부재 실측 확인 / 날조 0).
- **Senior 적대검증 GO@0.88**(STOP 0): self-생성 ep-be-gea 증거 anchor 전수 실파일 재현 = genuine real_extraction / certainty 양방향 over·under-claim 0 / distinctness 충분.

## 3. distinctness caveat (Senior Q3 / 과대주장 회피)

poc-08·ep-be-gea **둘 다 Java/MyBatis 계열** — recovered-ADR 가 추출하는 결정 축(빌드툴 Maven WAR 단일 ↔ Gradle multi-module bootJar / 버전핀 전략 / 패키징)은 충분히 distinct 하나, **3rd non-Java paradigm(Node/TS·.NET·Python) recovered-ADR dogfood 가 완전 corroboration** = carry. (run-manifest 는 이미 Node+JVM cross-paradigm.)

## 4. 변경 내용 (de-draft / official 승격)

- **#3**: `skills/analysis-recovered-adr/SKILL.md`·`methodology-spec/deliverables/25-recovered-adr.md`·`lifecycle-contract.md`(#25 행+note) "1차 draft" → **official(opt-in / ≥2 도메인 corroborated)**. 모 DEC-2026-06-09-recovered-adr-rationale-abstention 상태 = 본 DEC 로 official.
- **#2a**: `skills/analysis-run-manifest/SKILL.md`·`deliverables/26-run-manifest.md`·`lifecycle-contract.md`(#26 행+note+디렉토리 다이어그램) "1차 draft" → **official(opt-in)**. 모 DEC-2026-06-09-build-run-env-manifest 상태 = official.
- **version** = plugin.json MINOR(draft→official 기능 격상 / scope-carve promotion 선례 동형) + CHANGELOG + CLAUDE.md + README.
- schema·skill 절차·tool 무변경(격상 = trust/기능 무파괴 / scope-carve promotion 동형).

## 5. 정직 carry (Senior Q6 — 격상 후 잔여)

1. **recovered-adr-validator / run-manifest-validator 부재** — `tools/` 에 전용 검증기 없음(grep 0). schema-valid 만으로 evidence-anchor 실재성 자동검증 불가 → 현재 manual cross-check(+Senior 적대검증). validator = 후속.
2. **#3 vcs-rationale 미본격** — git log/blame 기반 WHY 복구 미구현(현재 주석 grounding 한정).
3. **#3 3rd non-Java paradigm** dogfood (§3 caveat / 완전 corroboration).
4. **#2a detailed 필드 defer** — health-check poll / cache / startup-order 등 elaborate 필드.
5. (무관 주의) co-change·hotspot 2nd external target-with-history = **scope-carve(#1) DEC 의 carry** / run-manifest·recovered-ADR 와 혼동 회피.

## 6. Non-goal

- MANDATORY 격상 ❌ (opt-in 유지 / cross-cutting aspect).
- ep-be-gea 산출물 commit ❌ (외부격리 / 마스킹 수치만 본 DEC).
- 모 DEC(#2a/#3 1차 draft 결단) 번복 아님 — draft→official 상태 전이만.
