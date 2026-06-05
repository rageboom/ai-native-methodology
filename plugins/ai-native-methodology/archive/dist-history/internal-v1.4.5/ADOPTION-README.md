<!--
provenance:
  source: ai-native-methodology-adoption (deprecated 2026-05-02)
  original_path: dist/internal-v1.3/README.md
  absorbed_at: 2026-05-02
  absorbed_into: ai-native-methodology/templates/adoption/README.md
  사용자_직접_편집: true
  사내_진입점_READ_FIRST: true
  status: archived (사내 적용 template)
  notes: |
    본 파일은 사내 적용 시 build script 가 dist/internal-v<version>/README.md 로 복사하는 진입점.
    workspace 본체 README.md 와 별도 — 사내 운영 전용 customization.
-->

# AI-Native 개발 방법론 v1.3.0 — 사내 운영본

> **본 디렉토리 = 사내 표준 운영본 (`internal-v1.3`)** — adoption 워크스페이스의 빌드 산출물.
> 본 방법론 = "**코드 → 형식 명세 + 위험 기록**" **한 방향 추출기**. 신규 시스템 구축은 사람의 책임.
> 7대 산출물 + finding + antipatterns + migration-cautions 를 사내 신규 시스템 구축 시 입력 자료/회피 가이드로 활용.

**v1.3.0 (2026-05-01)**: 3 PoC platform-agnostic 입증 (Java/Spring + Java/Hexagonal + TypeScript/NestJS) / 11 묶음 본체 갭 closure / spectral 실 실행 (24 warnings, 0 errors) / no-simulation 정책 첫 실현 / 신뢰도 85-92% (ADR-009 단계 4).

---

## 🎯 사내 적용 시작 가이드 — READ FIRST

### Step 1. 본 dist 를 사내 적용 레포 루트에 풀기

```
사내-적용-레포/
├── CLAUDE.md                  ← 자동 로드 (정책 active)
├── methodology-spec/
├── schemas/
├── templates/
├── tools/
├── examples/
└── README.md                  ← 본 파일
```

### Step 2. `CLAUDE.md` 가 자동 로드되는지 확인

루트의 `CLAUDE.md` 는 매 Claude Code 세션 자동 로드되어 정책이 LLM 컨텍스트에 active. 별도 명령 불필요.

수록된 정책 (23):

- 절대 우선순위 (품질 1 > 재작업 최소화 > 속도)
- 본 방법론 가치 (한 방향 추출기 / round-trip 영구 scope 제외)
- 의무 정책 (7대 산출물 / 신뢰도 메타 / 이중 렌더링 / no-simulation / 다이어그램 신뢰도 / Baseline+Ratchet / migration_advice)
- 사상 (Schema-First + Contract-First + DDD-Lite B + FSD)
- 운영 (한국어 1차 / 순환의존성 hybrid)
- NestJS 전용 4 (적용 프로젝트가 NestJS 일 때만)
- Spring/Java 전용 5 (적용 프로젝트가 Spring 일 때만)

### Step 3. Phase 0 진입 — 입력 정리

```bash
# Claude Code 진입 후
@methodology-spec/workflow/phase-0-input.md   # phase 명세 참조
@templates/inventory/                             # 템플릿 참조
```

이후 Phase 1~6 + Phase 4.5 는 phase-flow (`methodology-spec/workflow/phase-flow.json`) DAG 순서대로 진행. Phase 매핑은 `CLAUDE.md` 상세 표 참조.

### Step 4. 산출물 add/edit 시 검증 도구 실행 (CI 통합 권장)

`tools/` 5종 → 아래 [검증 도구 사용](#검증-도구-사용-5종) 섹션.

### Step 5. legacy 도입 시 ADR-010 Baseline+Ratchet 의무

`CLAUDE.md` 에 인라인 흡수됨 — legacy 결함 폭증 회피, 신규 결함만 차단.

---

## 무엇을 하는가

```
[레거시 프로젝트]                     [7대 산출물]
   소스 코드                       1. 아키텍처/의존성
   ERD (있으면)                    2. 도메인 모델
   ORM (있으면)         ──>        3. API 계약
   운영 DB (있으면)                 4. DB 스키마
   기획 문서 (있으면)               5. 비즈니스 규칙
   디자인 명세 (있으면)             6. 안티패턴
                                   7. UI/UX 명세
```

산출 결과는 **AI와 사람 모두가 읽을 수 있는 형식** (JSON Schema + Mermaid + Markdown).

---

## Platform-Agnostic 입증 (3 PoC 통합)

| PoC         | platform                           | 산출                                             | 신뢰도 |
| ----------- | ---------------------------------- | ------------------------------------------------ | ------ |
| **PoC #01** | Java + Spring Boot 2.5 (CRUD)      | 7대 산출물 6/7 / 15 AP / 33 finding              | 0.96   |
| **PoC #02** | Java + Spring Boot 3.3 + Hexagonal | 7대 산출물 6/7 / 21 AP / 43 finding              | 0.96   |
| **PoC #03** | TypeScript + NestJS + TypeORM      | 7대 산출물 6/7 / 11 AP / 49 finding / 1 positive | 0.94   |

→ 3 platform 모두 7대 산출물 6/7 도달 (UI/UX 만 N/A — BE only). 신뢰도 동급 (0.94~0.96).

### Cross-PoC 학습 효과 ( §8.1 정합 — 단일 PoC 과적합 회피)

| 분류                                     | 건수 | 사례                                                                           |
| ---------------------------------------- | ---- | ------------------------------------------------------------------------------ |
| ** 재현** (보편 결함)                    | 6    | EAGER N+1 ( 3 PoC) / API drift / DB UQ / PUT vs PATCH / versioning / limit cap |
| ** 변형 재현**                           | 3    | RSA git commit → Auth scope / Token apiKey 부분 / De Morgan 학습 효과          |
| ** 비재현 학습 효과 (positive finding)** | 3    | NestJS Bearer 표준 ✅ / 307 redirect / TS generic 정적 차단                    |

**적용 가능 platform** (검증 완료): Java/Spring + Java/Hexagonal + TypeScript/NestJS.

---

## 디렉토리 구조 (사내 운영본)

```
internal-v1.3/
├── CLAUDE.md                  자동 로드 — 정책 23 인라인 (위반 = 빌드 실패)
├── README.md                  ← 본 파일 (사내 적용 진입점)
├── methodology-spec/          Single Source of Truth
│   ├── deliverables/          7대 산출물 명세 (1~7 + 4-5)
│   ├── workflow/              phase-0~6 + phase-flow 이중 렌더링
│   ├── finding-system.md
│   ├── id-conventions.md
│   └── glossary-ko.md
├── schemas/                   JSON Schema (AI/도구 계약)
├── templates/                 산출물 템플릿 (.md / .mermaid / .yaml)
├── tools/                     검증 도구 5종
│   ├── drift-validator/           Phase 4.5 이중 렌더링 동일성 검증
│   ├── decision-table-validator/  DMN 5종 (duplicate/conflict/gap/overlap/type)
│   ├── formal-spec-link-validator/ Phase 4.5 cross-link 검증
│   ├── spectral-runner/           OpenAPI lint (실 실행 — no-simulation)
│   └── static-runner/             외부 정적 분석 hook (Semgrep / PMD)
└── examples/                  3 PoC (platform-agnostic 입증) — 참고용, 자동 로드 X
    ├── poc-01-realworld-spring/        Spring 팀 reference
    ├── poc-02-realworld-springboot3/   Hexagonal 팀 reference (Spring 정책 5건 출처)
    └── poc-03-realworld-nestjs/        NestJS 팀 reference (NestJS 정책 4건 출처)
```

> `examples/` 는 매 세션 **자동 로드되지 않음**. 필요 시 명시적 Read (`@examples/poc-02-realworld-springboot3/output/antipatterns/avoid-list.md` 등).

---

## 검증 도구 사용 (5종)

```bash
# 1. drift-validator — Phase 4.5 산출 후 자가 검증 (의무)
node tools/drift-validator/src/cli.js {산출물 경로}/formal-spec/

# 2. decision-table-validator — dmn-check 5종
node tools/decision-table-validator/src/cli.js {산출물 경로}/formal-spec/decision-tables/

# 3. formal-spec-link-validator — Phase 4.5 cross-link
node tools/formal-spec-link-validator/src/cli.js {산출물 경로}/formal-spec/

# 4. spectral-runner — OpenAPI lint ( 실 실행 — no-simulation)
cd tools/spectral-runner && npx spectral lint {openapi.yaml} --ruleset ./.spectral.yaml

# 5. static-runner — 진짜 외부 도구 (Semgrep / PMD / SpotBugs)
node tools/static-runner/src/cli.js --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# (보조) lint-no-simulation — 5종 물증 + simulation_only 차단
bash tools/static-runner/src/lint-no-simulation.sh ./out
```

CI 통합 권고 — ADR-010 Baseline + Ratchet 의무 (`CLAUDE.md` 인라인).

---

## 7원칙 (헌법)

1. **사상 명시**: Schema-First + Contract-First + DDD-Lite + FSD
2. **Bottom-up Always**: Function → File → Module → System
3. **Deterministic First, LLM Second**
4. **File System as Memory** (단계 간 통신 = 파일)
5. **Confidence as First-Class** (모든 산출물에 신뢰도 메타)
6. **Human-in-the-loop** (단계마다 승인 게이트)
7. **Single Source of Truth = Repo** (문서/플러그인은 레포 파생)
8. **한국어 1차** (영어 약어 최소화, 산업 표준 예외)

---

## v1.3.0 현재 상태

| 항목                        | 상태                                                            |
| --------------------------- | --------------------------------------------------------------- |
| 7대 산출물 명세 + 형식 명세 | ✅ 완성 (BE 6/7 — UI/UX 만 FE PoC 후속)                         |
| JSON Schema                 | ✅ 11개 (formal-spec / finding-system / openapi-extension 포함) |
| 정책 (CLAUDE.md 인라인)     | ✅ 23 (범용 13 + 가치 1 + NestJS 4 + Spring 5)                  |
| Phase 4.5 정식 도입         | ✅                                                              |
| ADR-010 Baseline+Ratchet    | ✅ legacy 도입 시 의무                                          |
| 3 PoC 종결                  | ✅ Spring + Hexagonal + NestJS (platform-agnostic 입증)         |
| 검증 도구                   | ✅ 5종 (drift / dmn / formal-spec-link / spectral / static)     |
| no-simulation 정책          | ✅ spectral 실 실행 (24 warnings / 0 errors)                    |
| 신뢰도                      | ✅ 85-92% (ADR-009 단계 4 도달)                                 |

### v1.4 후속 (FE 트랙)

- ⏳ FE PoC #04 — RealWorld FE (React + TypeScript + TanStack Query + Zustand + Axios) 진입
- ⏳ 07-UI-UX 산출물 본격 채택
- ⏳ AP-RENDER / AP-STATE / AP-FETCH / AP-A11Y 패턴 신설
- ⏳ Form validation rules / Permission rules / UI display rules 형식화

### 다음 격상 후보

- ADR-SPRING-001~005 정식 격상 (현재 PoC #02 antipatterns 출처 → CLAUDE.md 인라인)
- skill 분기 (`.claude/skills/`) — 범용 / 기술별 / 아키텍처별, LLM 추론 중 자동 invoke
- slash command (`.claude/commands/`) — `/analyze-init`, `/extract-domain`, `/run-phase-4-5`

---

## 사상적 기반

| 사상                | 채택        | 출처                                            |
| ------------------- | ----------- | ----------------------------------------------- |
| Schema-First        | 주축        | Microsoft TypeSpec, OpenAPI 산업 표준           |
| Contract-First      | API 영역    | Hazelcast, Technijian 등 산업 사례              |
| DDD-Lite (B 강도)   | 도메인 영역 | Eric Evans DDD, 풀 DDD 의도적 제외              |
| FSD + Atomic Design | FE 영역     | Feature-Sliced Design, Brad Frost Atomic Design |

명시적 제외:

- Event Sourcing, CQRS, Saga, Anticorruption Layer
- 비기능 요구사항(NFR) 측정
- 테스트 코드 자동 분석

---

## 분석 입력 가변성

```
필수: 소스 코드
선택: ERD / ORM / 운영 DB / 기획 문서 / 디자인 명세 / 설정 파일

입력이 많을수록 신뢰도↑:
- 소스만:                      평균 75%
- 소스 + ERD:                  평균 85%
- 소스 + ORM:                  평균 88%
- 소스 + ORM + ERD + 운영DB:   평균 96%
- 모든 입력:                   평균 98%
```

신뢰도 메타데이터를 모든 산출물에 명시 (`schemas/meta-confidence.schema.json`).

---

## 라이선스

(사내 표준 — 외부 공개 시 결정)

---

## 기여

- 변경 제안: 사내 issue tracker
- 변경 적용: PR + 정책 추가 시 `CLAUDE.md` 인라인 갱신
- 방법론 자체 변경: adoption 워크스페이스 (`ai-native-methodology-adoption/`) 에서 ADR/decisions 등재 → dist 재빌드 → 본 운영본 갱신
- 본 운영본은 adoption 워크스페이스의 빌드 산출물 — 직접 수정 X.
