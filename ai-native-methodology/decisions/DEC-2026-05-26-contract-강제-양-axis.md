# DEC-2026-05-26-contract-강제-양-axis

> ★ v11.0.0 #8 결단 — BE contract 강제 (swagger / openapi) + FE contract 강제 (state-map + visual-manifest + DTCG token) 양 axis 본격 enforcement. SSOT: [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md).

**일자**: 2026-05-26 (session 48차)
**카테고리**: paradigm / quality 1순위 본격 정합 — AI 자동 생성 안 ground truth anchor (환각 차단)
**상태**: 승인 — 사용자 결단 "backend test 에 swagger 를 강제할 수 있나?" + "v11 안 통합 (contract 강제 채택)"
**Trigger**: 사용자 v11 paradigm 진화 안 본격 quality 강화 의제 표면화

## 1. 결단 본격

본 방법론 안 contract 강제 = **양 axis 본격 enforcement** (BE = openapi / FE = state-map + visual-manifest + DTCG token).

### 3 layer enforcement

| Layer | Stage | enforcement | hard/soft |
|---|---|---|---|
| 1 | **spec** | `acceptance-criteria.criteria[].layer in [be]` 시 `openapi_path` + `operationId` 필드 본격 필수 / `layer in [fe]` 시 `state_map_ref` + `dtcg_token_ref` 필드 본격 필수 | hard gate |
| 2 | **plan** | `task-plan.tasks[].layer=be` 시 `openapi_endpoint_ref` 필드 본격 필수 (TASK ↔ swagger endpoint 1:1) / `layer=fe` 시 `component_ref` 필드 본격 필수 | hard gate |
| 3 | **test** | `test-spec.test_cases[].framework in [schemathesis,dredd,pact]` 시 `openapi_contract_ref` 본격 필수 / `framework in [playwright-visual,axe-core,percy]` 시 `visual_regression_ref` 본격 필수 | hard gate (no-simulation 정합) |

## 2. 산업 도구 인지 (R15 + R19 정합)

### BE 트랙 (Tier 1 / Tier 2)

| 도구 | 역할 | Tier | 강제 방식 |
|---|---|---|---|
| **Schemathesis** | openapi → property-based test 자동 생성 + 실행 | Tier 1 (in-plugin) | BE test 자동화 + spec 위반 detect |
| **Dredd** | openapi 기반 HTTP test runner | Tier 1 (in-plugin) | endpoint × payload × response 정합 검증 |
| **Pact** | consumer-driven contract test | Tier 2 (사용자 환경) | FE 가 BE 의 contract 검증 / cross-track |
| **Spring Cloud Contract** | Spring + Groovy contract DSL | Tier 2 | producer-side contract |
| **springdoc-openapi** | Spring 코드 → swagger 자동 생성 | Tier 2 | drift 차단 (code ↔ swagger SSOT 일치) |
| **@nestjs/swagger** | NestJS 코드 → swagger 자동 생성 | Tier 2 | drift 차단 |
| **spectral-runner** (★ 기존 보유) | swagger validation | Tier 1 (in-plugin / 이미 보유) | no-simulation 정합 안 본격 활용 |

### FE 트랙 (대칭)

| 도구 | 역할 | Tier | 강제 방식 |
|---|---|---|---|
| **axe-core** | accessibility (WCAG 2.2) auto-check | Tier 1 (in-plugin / 이미 보유) | FE a11y 정합 |
| **Playwright visual** | visual regression test (screenshot diff) | Tier 1 (in-plugin) | FE visual contract |
| **Percy** | hosted visual regression | Tier 2 (사용자 환경) | enterprise visual contract |
| **Chromatic** | Storybook + visual regression | Tier 2 | component-level visual contract |
| **DTCG token validator** | W3C DTCG 표준 정합 | Tier 1 (in-plugin) | design token drift 차단 |

★ Tier 3 (simulated) = 영구 reject (R19 정합 / no-simulation 정책).

## 3. ratchet 패턴 (baseline+ratchet ADR-010 정합)

legacy 진입 호환:

| 시점 | 강제 수준 |
|---|---|
| **Day 1** (legacy 진입) | 신규 BE TASK 안 `openapi_endpoint_ref` 본격 필수 / 신규 FE TASK 안 `component_ref` 본격 필수 / legacy carry baseline 보존 (기존 산출물 안 부재 허용) |
| **Week N** (사용자 결단) | 80% coverage target (ratchet 발휘) / 기존 산출물 점진 fill / release-readiness criterion #15 (★ 신설) 안 ratchet check |
| **본격 종결** | 100% coverage / 미충족 시 release-readiness block |

★ legacy BE 안 swagger 부재 시 진입 차단 risk 회피 = analysis-openapi skill 이 이미 legacy → swagger 추출 자동화 보유 (drift 회피 / paradigm 정합).

## 4. 영향 면적 (schema 변경 / Phase 1)

### schemas/acceptance-criteria.schema.json

```json
{
  "criteria": [{
    "id": "AC-001",
    "behavior_ref": "BHV-001",
    "use_case_ref": "UC-001",
    "gherkin": { ... },
    "verifiable": true,
    "severity": "critical",
    "layer": "be",                           // ★ 신설 enum: be/fe/db/e2e/infra
    "openapi_path": "/api/password-change",  // ★ #8 BE 본격 필수 (layer=be 시)
    "operationId": "changePassword",          // ★ #8 BE 본격 필수 (layer=be 시)
    "state_map_ref": null,                    // ★ #8 FE 본격 필수 (layer=fe 시)
    "dtcg_token_ref": null,                   // ★ #8 FE 본격 필수 (layer=fe 시)
    "visual_manifest_ref": null               // ★ #8 FE 본격 필수 (layer=fe 시)
  }]
}
```

★ schema-level conditional required (`oneOf` / `allOf` if/then) — layer=be 시 openapi 필드 필수 / layer=fe 시 state-map+DTCG 필수.

### schemas/task-plan.schema.json (be-fe-산출물-분리 DEC §3 정합)

이미 동반 결단 안 본격 명시. 본 결단 안 본격 enforcement 재확인.

### schemas/test-spec.schema.json (★ 본격 framework enum 확장)

```json
{
  "test_cases": [{
    "id": "TC-001",
    "ac_ref": "AC-001",
    "framework": "dredd",                      // ★ enum 본격 확장: schemathesis/dredd/pact/playwright-visual/axe-core/percy 추가
    "openapi_contract_ref": {                  // ★ #8 BE contract 시 본격 필수
      "path": "/api/password-change",
      "operationId": "changePassword"
    },
    "visual_regression_ref": null              // ★ #8 FE visual 시 본격 필수
  }]
}
```

★ `openapi_contract_ref` if/then: `framework in [schemathesis,dredd,pact]` 시 본격 필수.
★ `visual_regression_ref` if/then: `framework in [playwright-visual,axe-core,percy,chromatic]` 시 본격 필수.

## 5. tools 갱신 (Phase 1)

### plan-coverage-validator (v9.1.0 / 28/28 test)

신규 validator 함수:

```javascript
// BE TASK ↔ openapi endpoint 1:1 matching
function validateBETaskOpenapiRef(taskPlan, openapiYaml) {
  const beTasks = taskPlan.tasks.filter(t => t.layer === 'be');
  for (const task of beTasks) {
    if (!task.openapi_endpoint_ref) {
      return { ok: false, error: `BE TASK ${task.id} missing openapi_endpoint_ref` };
    }
    const { path, operationId } = task.openapi_endpoint_ref;
    if (!openapiYaml.paths[path]) {
      return { ok: false, error: `TASK ${task.id} openapi path ${path} not found` };
    }
  }
  return { ok: true };
}

// FE TASK ↔ component matching
function validateFETaskComponentRef(taskPlan, fileSystem) {
  const feTasks = taskPlan.tasks.filter(t => t.layer === 'fe');
  for (const task of feTasks) {
    if (!task.component_ref) {
      return { ok: false, error: `FE TASK ${task.id} missing component_ref` };
    }
    // existence check (optional / Phase 1+ carry)
  }
  return { ok: true };
}
```

### scripts/release-readiness.js criterion #15 (신설)

```javascript
// #15: BE TASK 안 openapi_endpoint_ref 부재 ratchet
const beTasksWithoutRef = countBETasksMissingOpenapiRef();
const baseline = readBaseline('be-task-openapi-ref-baseline.json');
if (beTasksWithoutRef > baseline) {
  return { ok: false, error: `ratchet violation: BE TASK 안 openapi_endpoint_ref 부재 ${beTasksWithoutRef} > baseline ${baseline}` };
}
```

## 6. skills 갱신 (Phase 2)

### test-* 4종

- **test-generate-test-spec**: BE 시 schemathesis/dredd/pact framework 본격 추가 / FE 시 playwright-visual/axe-core 추가
- **test-run-test-evidence**: 진짜 도구 실행 의무 (no-simulation R15 정합) / spectral-runner 이미 보유
- **test-playwright**: visual regression 본격 확장
- **test-verify-coverage**: openapi contract coverage 본격 metric 추가

### implement-* 4종

- **implement-react**: DTCG token + state-map 정합 본격 인식 (drift 차단)
- **implement-vue**: 동형
- **implement-generate-impl-spec**: springdoc-openapi / @nestjs/swagger 본격 인식 / 코드 → swagger drift 차단 도구 본격 dispatch
- **implement-verify-test-pass**: GREEN 100% pass + openapi contract 100% pass 본격 의무

## 7. industry case (corroboration)

### API-first paradigm (산업 표준)
- **Stripe**: API spec-first development (openapi.yaml 안에서 SDK 생성)
- **Twilio**: openapi → CLI + SDK + docs 자동화
- **Spotify Backstage**: openapi 안에서 service catalog 본격 generate
- **Kubernetes**: openapi 안에서 client library + CRD validation

### Design system + DTCG (FE 산업 표준)
- **Adobe**: DTCG 표준 본격 채택 (Spectrum design system)
- **GitHub Primer**: DTCG token 안에서 design ↔ code drift 차단
- **Material Design 3**: state-map (state layer) 본격 명시
- **Chromatic + Storybook**: visual regression 산업 채택

★ paradigm 정합 = industry corroboration ≥ 4 case BE + 4 case FE = §8.1 strict 정합.

## 8. 검증 (Phase 1 STOP-3)

- schema-validator 100% pass (acceptance-criteria + task-plan + test-spec 본격 if/then 정합)
- plan-coverage-validator 본격 BE/FE 1:1 matching 확인
- release-readiness criterion #15 본격 통과 (baseline+ratchet)
- workspace test 100% pass (≈ 740+/740+ / 신규 test 본격 추가)
- skill-citation 0 stale

## 9. cross-link

- SSOT: [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md) §2 #8
- 동반 결단: [DEC-2026-05-26-be-fe-산출물-분리](DEC-2026-05-26-be-fe-산출물-분리.md) (#2 + #6 / 본 결단 안 enforcement axis 본격 자연 정합)
- charter R15 (no-simulation 정책) = 본격 정합 — 진짜 도구 실행 의무
- charter R19 (Tool Ecosystem Dependency Classification) = 본격 정합 — Tier 1 (in-plugin) + Tier 2 (사용자 환경) / Tier 3 (simulated) 영구 reject
- charter R18 (plugin-authoring-spec) = Phase 2 안 skill body 갱신 시 §6 공식 docs pin 본격 정합
- LL-v110-04 (contract 강제 양 axis paradigm) 자산화 trigger
