# AI-Native 개발 방법론 v1.3.1 ★★★

> 사내 표준 AI 기반 개발 방법론. 레거시 분석부터 재구현·운영까지의 라이프사이클을 표준화한다.
>
> 본 v1.x 는 **분석 단계 (① Analyze)** 의 구현 — "코드 → 형식 명세 + 위험 기록" 한 방향 추출기.
>
> **현재**: v1.3.1 PATCH (2026-05-01) — D3.2 원본 파일명 컨벤션 정리 (12 rename + 33 cross-link). dist 와 동기화 / 한국어 → 영어 + 1자리 prefix + .yml→.yaml 일관.
>
> **★★★ v1.3.0 release (2026-05-01)**: 3 PoC platform-agnostic 입증 + 11 묶음 본체 갭 closure + ★ Sprint 5 Node 도구 부분 종결 (spectral 실 실행 — 24 warnings / 0 errors / exit 0) + ★★★ no-simulation 정책 첫 실현. 신뢰도 85-92% 도달 (★ ADR-009 단계 4). **사내 표준 채택 가능 시점 도달**.
>
> 자세한 내용은 [CHANGELOG.md](./CHANGELOG.md) 참조.

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

분석 결과는 **AI와 사람 모두가 읽을 수 있는 형식** (JSON Schema + Mermaid + Markdown).

---

## ★★ Platform-Agnostic 입증 (3 PoC 통합 / v1.2.3 정식 등재)

본 방법론은 **3 platform PoC** 검증으로 platform-agnostic 임을 입증:

| PoC | platform | 산출 | 신뢰도 |
|---|---|---|---|
| **PoC #01** | Java + Spring Boot 2.5 (CRUD) | 7대 산출물 6/7 / 15 AP / 33 finding | 0.96 |
| **PoC #02** | Java + Spring Boot 3.3 + Hexagonal | 7대 산출물 6/7 / 21 AP / 43 finding | 0.96 |
| **PoC #03** | TypeScript + NestJS + TypeORM | 7대 산출물 6/7 / 11 AP / 49 finding / 1 positive | 0.94 |

→ ★ 3 platform 모두 7대 산출물 6/7 도달 (UI/UX 만 N/A — BE only). 신뢰도 동급 (0.94~0.96).

### Cross-PoC 학습 효과 (★ §8.1 정합 — 단일 PoC 과적합 회피)

| 분류 | 건수 | 사례 |
|---|---|---|
| **★ 재현** (보편 결함) | 6 | EAGER N+1 (★ 3 PoC) / API drift / DB UQ / PUT vs PATCH / versioning / limit cap |
| **★ 변형 재현** | 3 | RSA git commit → Auth scope / Token apiKey 부분 / De Morgan 학습 효과 |
| **★★ 비재현 학습 효과 (positive finding)** | 3 | **NestJS Bearer 표준** ✅ / 307 redirect / TS generic 정적 차단 |

→ **균형 분포** = §8.1 단일 PoC 과적합 회피 정합 ★. **본 방법론 적용 가능 platform** = Java/Spring + TypeScript/NestJS 입증 완료.

상세: [`docs/v1.3-promotion-report.md`](./docs/v1.3-promotion-report.md) — 3 PoC 통합 보고서 (격상 후보 6 + 사내 적용 ROI 견적).

---

## 시작하기

### 사전 요구사항
- Claude Code 설치
- 분석 대상 레포 git clone
- (선택) ERD 파일, 운영 DB 메타데이터, 기획 문서

### 사용법 (현재 — manual)

본 방법론 사용 시 Claude Code 세션에서 `methodology-spec/workflow/phase-*.md` 를 phase 별로 차례로 적용. 각 phase 산출물은 `examples/poc-XX/output/` 구조 참조.

```bash
# 분석 대상 레포 clone
git clone <legacy-repo>

# Claude Code 세션 시작 + methodology-spec 컨텍스트 로드
cd <legacy-repo>
claude code
# → methodology-spec/workflow/phase-0-input.md 부터 순차 적용
```

**각 단계는 사용자 승인 게이트** 후 다음 단계로 진행 (Work Principles 4원칙).

### 사용법 (예정 — D5 carry-over)

slash command + skill 로 패키징하는 작업 (D5) 진행 중. 완료 후 다음 형태:

```bash
/analyze-init   # phase-1   인벤토리
/analyze-db     # phase-2   DB
/analyze-arch   # phase-3   아키텍처
/analyze-bl     # phase-4   비즈니스 로직 (4영역 병렬)
/analyze-fs     # phase-4-5 형식 명세 (★ no-simulation)
/analyze-api    # phase-5-1 API
/analyze-ui     # phase-5-2 UI/UX
/analyze-q      # phase-6   품질 통합
```

---

## 디렉토리 구조

```
ai-native-methodology/
├── docs/
│   ├── adr/                ADR 13종 (001~006 + 008/009/010 + NEST-001~004) ※ 007 부재 — openapi-extension.schema.json 으로 대체
│   └── v1.3-promotion-report.md
├── methodology-spec/       Single Source of Truth
│   ├── deliverables/       7대 산출물 명세 (1-architecture ~ 7-ui-ux)
│   ├── workflow/           phase-0 ~ phase-6 + phase-flow.json
│   ├── finding-system.md
│   ├── id-conventions.md
│   └── glossary-ko.md
├── schemas/                JSON Schema 12종 (계약)
│   ├── meta-confidence.schema.json
│   ├── architecture.schema.json
│   ├── domain.schema.json
│   ├── openapi-extension.schema.json
│   ├── db-schema.schema.json
│   ├── rules.schema.json
│   ├── antipatterns.schema.json
│   ├── ui-spec.schema.json
│   ├── inventory.schema.json
│   ├── formal-spec.schema.json
│   ├── finding-system.schema.json
│   └── README.md
├── templates/              산출물 템플릿 19종 (md / mermaid / json / yaml)
├── tools/                  Node CLI 검증 도구 5종
│   ├── drift-validator/         .json ↔ .mermaid 의미 동일성 + baseline / ratchet (ADR-010)
│   ├── decision-table-validator/ dmn-check 5종 (duplicate/conflict/gap/overlap/type)
│   ├── formal-spec-link-validator/ Phase 4.5 cross-link 검증 (★ v1.3 신규)
│   ├── spectral-runner/          OpenAPI spectral lint wrapper (★★★ no-simulation 진짜 외부 도구)
│   └── static-runner/            Semgrep/PMD/SpotBugs plugin host + lint-no-simulation
├── decisions/              결정 로그 (역시간순 / INDEX.md / STATUS.md / 25 DEC)
└── examples/               PoC 결과 (★ 3 platform 검증)
    ├── poc-01-realworld-spring/        ★ Java + Spring Boot 2.5 (CRUD)
    ├── poc-02-realworld-springboot3/   ★ Java + Spring Boot 3.3 + Hexagonal
    └── poc-03-realworld-nestjs/        ★ TypeScript + NestJS + TypeORM (★★ platform-agnostic 입증)

# 레포 루트 (본 디렉토리 외부)
.github/workflows/drift-check.yml   ★ v1.2.1 — 이중 모드 (PR diff-aware + nightly full)
```

※ inner repo 의 `plugin/` 및 `.claude-plugin/` 빈 dir 은 D5 carry-over (Claude Code skill / slash command 패키징 작업) 용 placeholder.

## 검증 도구 사용 (v1.2.1)

```bash
# 1. drift validator — Phase 4.5 산출 후 자가 검증 (의무)
npx --prefix ai-native-methodology/tools/drift-validator . \
  drift-validator examples/poc-XX/output/formal-spec/

# 2. decision-table validator — dmn-check 5종
node ai-native-methodology/tools/decision-table-validator/src/cli.js \
  examples/poc-XX/output/formal-spec/decision-tables/

# 3. static-runner — 진짜 외부 도구 (★★★ 시뮬 절대 금지)
node ai-native-methodology/tools/static-runner/src/cli.js \
  --plugin semgrep --target ./src --output ./out --ruleset p/owasp-top-ten

# 4. lint-no-simulation — 5종 물증 + simulation_only 차단
bash ai-native-methodology/tools/static-runner/src/lint-no-simulation.sh ./out
```

CI 자동화는 `.github/workflows/drift-check.yml` 참조 (PR / nightly / manual dispatch).

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

## 현재 상태 (v1.3.1 PATCH — 사내 표준 채택 가능 시점)

### v1.x 누적 (2026-04-26 ~ 2026-05-01)

- ✅ §0~§15 plan.md 완성
- ✅ 7대 산출물 + 형식 명세 JSON Schema 11종 + meta-confidence = 12종
- ✅ ADR 13종 (001~006 + 008 + 009 + 010 + NEST-001~004) ※ ADR-007 부재 — openapi-extension.schema.json 으로 대체
- ✅ Phase 4.5 형식 명세 정식 도입 (state-machine + sequence + decision-table + invariants + property-test)
- ✅ **3 PoC 종결 — platform-agnostic 입증** (Spring Boot 2.5 + Spring Boot 3.3 Hexagonal + NestJS) / 6 격상 후보 모두 본체 적용
- ✅ 이중 렌더링 사상 (ADR-008) + migration-cautions.md 의무 산출물
- ✅ **v1.2.1** — drift-validator + decision-table-validator + static-runner + drift-check.yml CI + 5종 물증 schema
- ✅ **v1.2.2** — 본체 갭 7건 closed (api.template.md / phase-flow / ADR-009 / db-schema.template.md / meta-confidence.template.yaml)
- ✅ **v1.2.3** — 본체 갭 8건 추가 closed (C/I/H/K + R/D + §8.1) + LMNO 4묶음 종결
- ✅ **v1.3.0** ★★★ — Sprint 5 spectral 실 실행 (24 warnings / 0 errors / exit 0) + ★★★ no-simulation 정책 첫 실현 + formal-spec-link-validator 신규 + ADR-NEST-001~004 + ADR-010 baseline+ratchet + 신뢰도 85-92% (★ ADR-009 단계 4)
- ✅ **v1.3.1** PATCH — D3.2 원본 파일명 컨벤션 정리 (12 rename + 33 cross-link, dist 동기화)

### v1.3.x → v1.4 후속

- ⏳ **Sprint 5 잔여 carry-over** — Semgrep / PMD / OSV-Scanner 진짜 실행 (★ 환경 변동 시)
- ⏳ **Sprint 6** (Node 환경 가능) — vacuum / openapi-changes / corpus 14→20쌍 / drift-validator phase-flow 비교기 / ADR-010 baseline mode wrapper
- ⏳ **D5** — Claude Code skill + slash command 패키징
- ⏳ **v1.4 candidate** — 4번째 PoC (FastAPI / Ktor / Rust / Go)
- ⏳ **adoption FE 트랙** — React+TS+TanStack Query+Zustand+Axios PoC #04

---

## 사상적 기반

| 사상 | 채택 | 출처 |
|---|---|---|
| Schema-First | 주축 | Microsoft TypeSpec, OpenAPI 산업 표준 |
| Contract-First | API 영역 | Hazelcast, Technijian 등 산업 사례 |
| DDD-Lite (B 강도) | 도메인 영역 | Eric Evans DDD, 풀 DDD 의도적 제외 |
| FSD + Atomic Design | FE 영역 | Feature-Sliced Design, Brad Frost Atomic Design |

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

- 변경 제안: GitHub Issue
- 변경 적용: PR + ADR 작성
- 방법론 자체 변경: ADR-XXX 신설 + plan.md 갱신
