# DEC-2026-06-08-dep-graph-dependency-axis-gaps

> **진단 + 전 5갭 조사완료 — 코드·release·schema 변경 0** (본 문서 = 진단·조사 원장). dep-graph(`artifact-graph.json` / 운영 SSOT)가 **표현하는 의존 차원 vs 표현하지 않는 차원**을 코드 실측으로 진단 → AX 운영(P0) 관점 **누락/보강 컨텍스트 5종** 등재 + 각 갭 "기존 자산 실측 → 정직 reframe"(갭1 패턴 / memory `feedback_diagnose_before_design_check_existing`) 조사.
> 상태: **조사완료 + G2-1 시행완료 (2026-06-08 / 미릴리스)**. 갭1=대부분해소·SSOT승격거부(옵션2) / 갭2=**G2-1(federation FK 읽기-aid) 시행완료**·잔존 G2-2/G2-3 carry / 갭3=scope-out / 갭4=격상보류(실발현0) / 갭5=BR-split STEP3 흡수. 나머지 거부·흡수·보류 종결.

## 배경 — 사용자 질문

사용자: "현 프로젝트의 dep-graph 를 그려내는 의존성들은 뭐가 있나 … 우리의 산출물이나 구조에서의 의존관계를 말하는거야. 어떤 것들의 의존관계를 표현하고 있는지 코드를 보고 확인해줘. 목적은 앞으로 context-ops 로 운영하는 데 있어서 누락되는 컨텍스트가 있는지 혹시 보강해야 하는 컨텍스트가 있는지 표현하기 위해서야."

P0(DEC-2026-05-30-use-scenario-taxonomy) = 산출물이 "시스템 설명 문서"가 아니라 **LLM 의 운영 컨텍스트 그 자체**. dep-graph 는 그 운영 컨텍스트의 의존 위상(topology). 따라서 "그래프가 어떤 의존을 담고 어떤 의존을 안 담는가" = **운영 시 LLM 이 못 보는 사각이 무엇인가** 와 동의어.

## 진단 — 현 dep-graph 가 표현하는 의존 (코드 실측)

**SSOT**: `schemas/artifact-graph-node.schema.json` + `schemas/artifact-graph-edge.schema.json` / 운영가이드 `docs/dependency-graph.md` §2.

- **노드 (4 kind + plan 조직 3)**: chain 6(UC→BHV→AC→TASK→TC→IMPL) / analysis 15(inventory·architecture·domain·business-rules·openapi·db-schema·antipatterns·ui-ux·state-map·type-spec 등) / aspect 4(a11y·i18n·static-security·legacy-spectrum) / plan(EPIC·STORY·OP). Tier-2(schema·hook·validator·skill·**소스파일**·contract)는 **leaf/속성**으로만 등장 (그래프 폭증 회피).
- **엣지 (8종 = hard 5 + soft 3)**: `derived_from`(chain 정방향) · `tests`(TC→IMPL) · `implements`(IMPL→코드 leaf) · `depends_on`(schema/validator) · `conforms_to`(artifact→contract) / soft: `cross_reference`(analysis↔chain) · `informs`(aspect→chain) · `groups`(Epic→Story→TASK/OP).

**본질**: 본 그래프의 단일 축 = **"요구사항 → 구현 추적성(traceability)"**. 정직 명명상 '아키텍처 설계도'가 아님 (DEC-2026-06-03-dep-graph-trace-view 정합 / 아키텍처 슬라이스 = `analysis-architecture` 노드 1개뿐).

## 갭 5종 (AX 운영 누락/보강 후보)

> 중요도(운영 사각 크기) 순. 각 갭 = 독립 후보. "현 표현 / 누락 / AX 운영 영향 / 후보 방향" 4칸.

### 갭 1 — 코드-내부 의존(모듈↔모듈 / 함수 call graph) **— 조사완료 / 대부분 이미 해소 (2026-06-08 reframe)**

> **갱신(2026-06-08 / 보강 설계 조사 결과 / plan `plan-gap1-code-internal-dependency.md` + research)**: 본 갭은 "최우선 신규 후보" 로 등재됐으나 **깊은 숙지 + Senior 적대검토(REVISE@0.72, 전건 실측) + 산업 corroboration(0.85)** 결과 **대부분 이미 reference-lens 로 해소**됨이 확인됨. 원래 후보 (a) SSOT 승격 = **명시 거부**. 잔존 = 작은 한 조각(A-1) → living-sync 로드맵 carry 흡수. 코드 변경 없이 본 항목 결론만 정정(옵션 2 / 사용자 결단).

- **현 표현**: `implements` 엣지로 IMPL→**코드 파일(leaf)** 까지만. 파일 내부·파일 간 호출관계는 SSOT 에 없음. (이건 사실)
- **이미 해소된 부분(재발명 금지 / 실측)**:
  - `context-federator`(DEC-2026-06-02) = node→code + `impact.affected`(역 transitive blast) 부착(`federator.js:286-291`) + callers/callees + legacy data_refs. 결정론·reference-lens·non-gating.
  - `skills/dep-graph-navigator/SKILL.md:86-108` = **"코드 흐름 lens"** 섹션 — navigate 에서 federator 호출 안내 **이미 출하**.
  - living-sync `anchor-lift`(DEC-2026-06-07) = 손수정 코드→주인 노드→의미 천장→forward 전파(**파일 granularity**) 이미 정의.
- **SSOT 승격(원 후보 a) = 거부 (trust 모델 + 업계 정합)**: codegraph = 휴리스틱(실증 함정: 동명 Java 메서드 오매칭 / legacy impact 0줄 / DEC-2026-06-02 §2 삼중잠금). 업계도 raw 정적 call-graph 를 hard gate 로 안 씀 — Sourcegraph(navigation 전용 / precise·search trust-tier 분리) · CodeQL(정제 query 결과만 gate) · Nx/Bazel(명시 의존선언/수동 보정 후에야 affected-gate) · ISSTA 2024(정적 도구 동적 메서드 평균 **61% 누락**). 결정론 axis STRONG-STOP(`feedback_chain_driver_deterministic_axis`) 정합. → **IMPL 의 gate-층 leaf 취급 = 의도된 trust 경계** (블랙박스는 버그 아님).
- **잔존 진짜 가치(작음 / living-sync carry 흡수)**:
  - **A-1**: federation 의 코드 reference-lens 를 living-loop 변경감지 시 **동반회수**하는 배선(현재 수동 query). ⚠️ `sync_sources`(canonical baseline) 직접 등재 시 codegraph mtime 변동으로 **markDrift noise 폭증** → 별도 hint 채널 설계 선결. living-sync 운영모델(DEC-2026-06-07) carry 와 중첩 → 거기서 다룸.
  - **A-2**(symbol-granularity 역질의 / federator `--symbol`): federator impact.affected 위 ~30줄 join 으로 저렴하나 **file-granularity anchor-lift 대비 실수요 미측정** → 측정 후 격상 carry.
- **조건부 carry (방향 B / reject 아님)**: 미입증 gate 수요가 실제 발생하면 — CodeQL식(정제 결과+신뢰등급) 또는 Bazel식(명시 의존선언) 경로로만 bounded 승격 재론. raw heuristic 직결 ❌.

### 갭 2 — 데이터-레벨 의존(table↔table FK / BHV↔table) 거의 부재

- **현 표현**: `db-schema` 는 analysis 노드 **1개**로 평탄화. FK 관계는 schema.json 의 `relationship_label`(v12 ADR-011) 에 데이터로만 존재.
- **누락**: 테이블 간 FK 가 **엣지가 아님** + "이 BHV/IMPL 이 어느 테이블을 read/write 하나" 매핑 부재. per-table 노드 없음.
- **AX 운영 영향**: 스키마 변경(컬럼 삭제·테이블 분리) 의 영향이 chain 으로 전파 안 됨. DB-always-on 정책(`feedback_db_always_on_policy`)이 입력 의무는 강제하나 **의존 위상은 미반영** → 데이터 변경 영향 사각.
- **후보 방향**: (a) db-schema 를 per-table 노드로 분해 + FK `depends_on` 엣지 / (b) BHV/IMPL→table `conforms_to` 류 엣지 신설. per-BC(bounded_context) / per-BR 정밀화 선례(v0.12.0 / v0.16.0)와 동형 — granularity 다이얼(DEC-2026-06-07-living-sync §④) 적용 후보.
- **★ 조사완료 (2026-06-08) — 판정: 작은 잔존 + 부분 신규**:
  - **이미 해소(reference-lens)**: BHV/IMPL↔table 읽기-aid 의 상당 부분 = federator `data_refs`(Phase 1.5/1.5b) — UC→sql-inventory `dependent_tables`→db-schema 컬럼→BR 까지 join(`federator.js:202-240`). legacy 실증(poc-16 `UC-CAR-MGT-001→insertCar→tb_car→BR-CAR-MGT-001`) + modern(08/09/10) sql-inventory 존재 → 메커니즘 동일.
  - **잔존 진짜 갭 3조각**: ① **FK table↔table 위상은 federation 조차 미소비** — `federator.js` 가 `foreign_keys`/`relationship_label` 을 **읽지 않음(grep 0건 실측)**, data_refs 는 `dependent_tables`→컬럼만. ② SSOT artifact-graph 에 per-table 노드·db 엣지 **실측 0**(poc-16/18/05). ③ **modern ORM 그래프 합성 carry(blocked)** — live modern dogfood poc-18 에 sql-inventory 부재(DEC-2026-06-02 carry #1).
  - **권고**: SSOT per-table 분해는 갭1 동형으로 **보류**(폭증 trade-off + impact 등급규칙 선결). 우선순위 = **① federation 에 `relationship_label`/`foreign_keys` 읽기-aid 추가(~20줄 / 결정론·저위험 — codegraph 휴리스틱 함정 없음) → ② modern sql-inventory 그래프 합성 carry 해소(traceability-matrix-builder 선행)**. 그래프 엣지 승격은 ≥2 도메인 dogfood 후 별 DEC. 결정론 위험 = 갭1 보다 낮음(schema.json 데이터 = 결정론).

### 갭 3 — 외부 패키지/런타임 의존(npm·maven deps / 서비스 토폴로지) 모델 밖

- **현 표현**: 없음. 그래프에 라이브러리·외부서비스·메시지큐·cross-service 호출 개념 자체 부재.
- **누락**: 의존 라이브러리 버전, 외부 API 계약(우리 openapi 는 *제공* 계약 / *소비* 외부계약은 별개), 배포 토폴로지.
- **AX 운영 영향**: 보통은 scope 밖이 정당(방법론 = 산출물↔코드 추적성). 단 **공급망/버전 drift**(예: dep CVE, breaking 업그레이드)는 운영 사각. (본 대화 시작점이 '패키징'이었던 만큼 인접 축이나, 의도적 scope-out 후보일 가능성 높음.)
- **후보 방향**: 대부분 **scope-out 권고**(G1 ITSM 선례 `feedback_itsm_g1_permanent_scope_out` 처럼 명시적 영구 제외 vs 별 도구 위임). 단 dep→IMPL `depends_on`(소비 라이브러리) 최소 표기는 재검토 여지.
- **★ 판정 (2026-06-08) — scope-out 권고 유지**: 방법론 본질 = 산출물↔코드 추적성이지 공급망/배포 토폴로지가 아님. 라이브러리 버전·외부서비스·큐는 별 도구(SCA/SBOM/관측) 영역 위임이 정합(G1 ITSM 영구 scope-out 선례 동형). dep CVE/breaking 업그레이드 사각은 실재하나 방법론 axis 강화 ROI 낮음. 단 "소비 라이브러리 dep→IMPL 최소 표기" 는 미입증 수요 발생 시에만 재론(carry).

### 갭 4 — cross-scope / feature 간 의존 약함

- **현 표현**: `scope_id`(work-unit-manifest scope) 로 **파티션·필터만**. node 속성이지 엣지 아님.
- **누락**: 스코프 A 의 BHV 가 스코프 B 산출물에 의존하는 **inter-scope 엣지** 부재.
- **AX 운영 영향**: 멀티-scope 운영 시 스코프 경계를 넘는 변경 영향이 추적 안 됨 → 큰 시스템에서 사각 확대.
- **후보 방향**: cross_reference(soft) 를 scope 경계 넘어 허용 + scope-aware 영향등급. 단 scope 분리의 가치(그래프 분할·필터)와 trade-off — 신중.
- **★ 조사완료 (2026-06-08) — 판정: 격상 보류 (이론적 / 실수요 0)**:
  - **scope_id = 전부 "분리·필터"**(실측): `trace-view.js:48` `--scope` = 노드 필터만 / `graph-synthesizer cli.js:215 --scope-id` = 그래프 빌드당 **단일 값** 전 노드 스탬프(= artifact-graph 1개 = 1 scope, 멀티-scope 미혼합) / `impact-analyzer.js`·`federator.js` 는 scope 개념 **0 참조**(경계 넘을·막을 일 없음).
  - **실수요 0**: 레포 PoC 전부 단일-scope(poc-05/16/18/19) / 멀티-scope PoC 부재(poc-17 = examples 밖 외부격리). **inter-scope 의존 실발현 0건** = 이론적 갭.
  - **정책 충돌(중)**: 최근 living-sync(v0.17~0.19)가 `sync_sources[].bounded_contexts` subset-hash 로 **cross-scope drift FP 를 일부러 격리**(분리 강화 방향) → inter-scope 엣지는 그 격리를 무너뜨려 markDrift noise 폭증 위험.
  - **부수 발견(서술 정밀화)**: `work-unit-manifest.schema.json` 의 `sync_state.dependents[]`(scope+stage 의존 자리) 가 **이미 선언돼 있으나 `work-unit.js:39` 초기화만 / populate·소비 0 = 死 필드**(실측). → "완전 부재" 아님. 갭 4 격상 시 새 엣지 enum 발명 전 **이 기존 채널을 살리는 경로가 저렴**(엣지 8종 불변 유지 / schema 가 이미 cross-scope 예견).
  - **권고**: ≥2 멀티-scope dogfood 로 실수요 측정 전까지 **격상 보류**.

### 갭 5 — BR↔BR 의존(규칙 간 전제관계) 부분 부재

- **현 표현**: per-BR 자식 노드 존재(`business_rule_id` 필드 / v0.16.0 S6) + BR 의 `bounded_context` required 승격(DEC-2026-06-07-bounded-context-mandatory).
- **누락**: 비즈니스 규칙 **상호 의존**(규칙 A 가 규칙 B 를 전제·무효화) 엣지 부재.
- **AX 운영 영향**: 규칙 변경 시 연쇄 규칙 영향이 그래프로 안 잡힘 → BR 정합성(br-cross-consistency-validator `project_industry_first_cross_validator`)은 *모순* 검출이나 *의존 전파* 는 별개.
- **후보 방향**: BR→BR `depends_on`(soft 또는 hard) 신설. BR-split 순차안(STEP 0~3 / DEC-2026-06-07-br-split-step2)과 동일 granularity 축 — split 진행 후 재판단 후보.
- **★ 조사완료 (2026-06-08) — 판정: BR-split STEP 3 흡수 (즉시 신규작업 ❌)**:
  - **잔존 진짜 갭 맞음**: business-rules.schema 에 `depends_on`/`supersedes`/`requires` 류 **BR→BR 필드 0건**. `rule_conflicts`(L64-87 / duplicate·contradiction·subsumption)는 **모순/중복 분류 데이터 필드**지 방향성 의존 아님 + **validator 가 자동 생성 안 함**(grep 0 — 사람/외부가 채우는 데이터). per-BR 노드끼리 artifact-graph 엣지도 0(poc-18 실측).
  - **서술 정밀화**: br-cross-consistency-validator 는 **per-rule 독립 평가**(`validator.js:38·93` 루프 / 검출 4종 = 단일 BR 내부 NL↔GWT 정합) — **pairwise 모순 자동검출조차 없음**. DEC 본문이 인용한 "모순 검출" 은 실제로 스키마 데이터 필드 수준 (`project_industry_first_cross_validator` 의 cross-consistency = NL↔GWT dual representation 정합이지 BR↔BR 아님).
  - **실수요 0**: BR 산출물 내부에서 한 BR 이 다른 BR-id 참조하는 사례 미발현(표현 수단 자체 부재). federator `extractBrIds`(L188)는 SQL→BR data_ref 용도지 BR↔BR 아님.
  - **권고**: ① 실수요 미발현 + ② BC 채움률 7/8 PoC=0%(bounded-context-mandatory) → STEP 3(BC별 분할 + 노드모델 재설계) 자체가 측정 대기 + ③ STEP 3 노드모델 재설계가 BR↔BR 엣지의 자연 정착 지점(DEC-2026-06-07-br-split-step2 "split 후 재판단" 명시). → **별 선행 작업 아니라 STEP 3 동반 검토**(재작업 최소). 격상 시 soft edge + 사람/LLM **명시 선언 한정**(자동추론 ❌ / 결정론·granularity 다이얼 정합).

## 우선순위 권고 (참고 / 비구속)

> **전 갭 조사완료 (2026-06-08)**. 5종 모두 "갭1 패턴"(기존 자산 실측 → 정직 reframe) 적용. **G2-1(federation FK 읽기-aid) 시행완료** / 나머지는 거부·흡수·보류.

| 갭 | 운영 사각 | 조사 판정 | 결정론 위험 |
|---|---|---|---|
| 1 코드 call-graph | ~~큼~~ → **대부분 해소** (federator+lens+anchor-lift) | SSOT 승격 **거부** / 잔존 → living-sync carry | ★ 높음 → 회피(reference-lens) |
| 2 데이터 FK/BHV↔table | 부분 해소(data_refs) + FK 미소비 | **G2-1 시행완료**(federation FK 읽기-aid / poc-16 dogfood) / G2-2(modern 그래프)·G2-3(per-table SSOT) carry | 중→낮음(schema 데이터=결정론) |
| 5 BR↔BR | 중 (실수요 0) | **BR-split STEP 3 흡수** / 즉시작업 ❌ | 낮음 |
| 4 cross-scope | 이론적(실발현 0) | **격상 보류** / `dependents` 死필드 재활용 경로 / ≥2 멀티-scope dogfood 까지 | 중(격리 무너뜨림 위험) |
| 3 외부 dep/런타임 | scope 밖 | **scope-out 권고 유지** / 별 도구 위임 | — |

## 5대 제약 정합 (본 DEC 자체 — 진단 문서)

| 제약 | 정합 |
|---|---|
| json 단독 SSOT | ✓ 진단만 / schema·SSOT 무변경 |
| §8.1 단일 PoC 과적합 회피 | ✓ 갭은 모델-구조 사실(스키마 enum·codegraph 무시 로직) — 특정 PoC 일반화 아님. 단 **격상 시 각 갭 ≥2 도메인 dogfood 의무** (현 후보 단계는 미실측 명시) |
| 품질 1순위 / 재작업 최소 | ✓ 갭별 독립 승격 → 일괄 변경 강제 회피 |
| 결정론 axis (STRONG-STOP) | ⚠️ 갭 1·2·5 격상 시 impact-analyzer edge_type·등급 규칙 재정의 = 결정론 경계 재검토 선결 |
| no-engineification | ✓ 본 문서는 도구·엔진 신설 0 |

## 검증 근거 (코드 실측 / no-simulation)

- 노드 4 kind + 엣지 8종 = `schemas/artifact-graph-node.schema.json` L17·L22 + `artifact-graph-edge.schema.json` L22 (enum 직접 확인).
- 코드 call-graph 무시 = `tools/dep-graph-viz/src/codegraph.js` L4(`synthetic:true / gate inject ❌`) · L88(`contains … analyzeImpact 무시`) · L99(calls push) 직접 확인.
- db-schema 단일 노드 + edge 미존재 = poc-18 실 `artifact-graph.json` 분포 실측(nodes 36 / edge_type = derived_from·tests·implements·cross_reference 만 / depends_on·conforms_to·informs·groups·db edge 0).
- scope_id = 노드 속성(파티션) = node schema L42~L45.
- per-BR 노드 = node schema L50~L53(`business_rule_id` v0.16.0).

## 후속 (carry / 격상 trigger)

> **전 5갭 조사완료(2026-06-08)**. 즉시 신규작업 후보 = 갭 2 G2-1(federation FK 읽기-aid) 1건만 — 사용자 결단 대기. 나머지는 거부·흡수·보류로 종결.

- **갭 1 = 조사완료(옵션 2)**: 대부분 이미 해소(federator+SKILL lens+anchor-lift) / SSOT 승격 거부 / 코드 0. 잔존 → living-sync 흡수:
  - **carry G1-A1**: federation 코드 reference-lens 의 living-loop 동반회수 배선(별도 hint 채널 / `sync_sources` 오염 회피 / DEC-2026-06-02 carry #2 동일).
  - **carry G1-A2**: federator `--symbol` symbol-granularity 역질의(impact.affected 위 얇은 join / 실수요 측정 후).
- **갭 2 = 조사완료(작은 잔존)**: BHV↔table 읽기-aid 는 data_refs 로 해소 / 잔존 3조각:
  - **carry G2-1 = 시행완료 (2026-06-08 / 미릴리스)**: federation `data_refs[].dependent_tables[]` 에 `foreign_keys`(references_table·relationship_label·local_columns·references_columns) reading-aid 추가 — db-schema 직읽기(결정론) / **optional**(callees 동형 / required 미합류 ← Senior BLOCKER-1) / reference-lens·non-gating. **검증**: federator 34/34(+2: FK 노출·graceful) + 생성 cache schema-valid + **poc-16 실 dogfood**(tb_car_cost_slip→tb_car_cost·tb_car_cost→tb_car_user_term FK 2건 노출) + release-readiness 40/40(context_cache_reference_lens_trust 무손상) + schema-validator green. **§8.1 정직**: sql-inventory+artifact-graph 보유 PoC = poc-16 1개뿐(2nd 도메인 = G2-2 modern 그래프 합성 carry 에 묶임 / unit test synthetic 도메인 보강). plan `plan-g2-1-federation-fk-reading-aid.md`. **버전/CHANGELOG = merge/release 시 부여**(worktree=pnpm 전 베이스 / main 분기 → 거대 README·CLAUDE narrative churn 회피).
  - **carry G2-2**: modern ORM sql-inventory 그래프 합성(traceability-matrix-builder 선행 / DEC-2026-06-02 carry #1).
  - **carry G2-3**: per-table SSOT 노드/FK 엣지 승격 — 보류(폭증 + 등급규칙 선결 / ≥2 도메인 후 별 DEC).
- **갭 3 = scope-out 권고 유지**: 외부 dep/런타임 = 별 도구 위임. dep→IMPL 최소표기만 미입증 수요 시 재론.
- **갭 4 = 격상 보류**: inter-scope 의존 실발현 0 / scope_id=분리·필터 설계 / living-sync 격리 강화와 충돌. **carry G4-1**: 격상 시 신규 엣지 enum 발명 ❌ → 기존 `sync_state.dependents[]` 死 필드 재활용. ≥2 멀티-scope dogfood 까지 보류.
- **갭 5 = BR-split STEP 3 흡수**: BR→BR 필드·엣지 전무 = 진짜 잔존이나 실수요 0 + BC 채움률 7/8=0% → STEP 3 노드모델 재설계 동반 검토. 격상 시 soft + 명시 선언 한정.

## 참고

- `docs/dependency-graph.md` §2 (그래프 모델) / `schemas/artifact-graph-{node,edge}.schema.json`
- `.claude/plans/plan-gap1-code-internal-dependency.md` (갭 1 보강 설계 plan + research — 2026-06-08 / 옵션 2 결론)
- DEC-2026-06-02-context-federation (갭 1 의 절반 이미 구현 / trust 모델 삼중잠금) + `skills/dep-graph-navigator/SKILL.md:86` (코드 흐름 lens 출하)
- `tools/dep-graph-viz/src/codegraph.js` (view-time synthetic / 결정론 무오염)
- DEC-2026-06-07-living-sync-operating-model (⑤ reachability 공백 = 코드 leaf / anchor-lift) — 갭 1·2 직결
- DEC-2026-06-03-dep-graph-trace-view (정직 명명 = 추적성≠아키텍처)
- DEC-2026-06-07-br-split-step2 + DEC-2026-06-07-bounded-context-mandatory (갭 5 granularity 축)
- DEC-2026-06-06-codegraph-probe-4-python-ts (codegraph 동적 와이어링 사각 = 갭 1 신뢰도 상한)
- memory `feedback_chain_driver_deterministic_axis` (갭 1·2·5 격상 STRONG-STOP) · `feedback_db_always_on_policy` (갭 2) · `feedback_itsm_g1_permanent_scope_out` (갭 3 scope-out 선례)
