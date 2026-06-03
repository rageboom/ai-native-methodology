---
name: implement-generate-impl-spec
description: ★ ★ ★ v2.0 chain 5 진입 skill (i-strict). test-spec 기반 impl 코드 자동 generate + impl-spec.json 산출. GREEN 의무 (모든 test 100% pass). full-stack-implementer persona 책임. ADR-CHAIN-001 §1 (json 단독 / ADR-011) + DEC-2026-05-06-v2.0-i-strict-채택 정합.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# generate-impl-spec

★ ★ ★ v2.0 chain 5 (impl) 의 **진입 skill / i-strict 정통**. test-spec → impl 코드 자동 generate / GREEN 의무 (100% test pass).

## 언제 사용

- chain 4 (test) 종결 + gate #4 go 결단 후 의무.
- 사용자: "impl 코드 만들어줘" / "chain 5 진입" / "GREEN 도달".

## 입력

- `<project>/.aimd/output/test-spec.json` (TC-* 목록 / source_file path)
- `<project>/.aimd/output/behavior-spec.json` (BHV-* contract / preconditions / postconditions / invariants)
- `<project>/.aimd/output/acceptance-criteria.json` (AC-* / Gherkin reasoning)
- `<project>/.aimd/output/architecture.json` (★ 7대 / layered architecture)
- `<project>/.aimd/output/schema.json` (★ 7대 / DB schema)
- `<project>/.aimd/output/api-extension.json` (★ 7대 / endpoint 정합)
- `<project>/.aimd/output/inventory.json` (★ stack_signals / framework match)
- `<project>/.aimd/config/test-cmd.json` (★ ADR-CHAIN-004 §1)

## 산출물

- `<project>/.aimd/output/impl-spec.json` (★ schemas/impl-spec.schema.json 의무 / ★ json 단독 SSOT / ADR-011)
- 실 impl 코드 (framework 별):
  - nestjs: `<project>/<src>/{module,controller,service,repository}.ts`
  - spring: `<project>/src/main/java/**/{Controller,Service,Repository}.java`
  - django/fastapi: `<project>/<app>/{views,services,models}.py`
  - go: `<project>/<pkg>/{handler,service,repo}.go`
- `<project>/<src>/migrations/*.{sql,ts,py}` (DB schema 변경 시)

## ★ ★ ★ GREEN 의무 (chain implement 종결 조건)

chain implement 종결 시 **모든 test 100% pass** 의무 (★ impl-spec.schema.json `fail_count: const 0`):
- test-impl-pass-validator 호출 → ok=true 의무.
- fail_count > 0 → chain implement 종결 ❌ / impl 보강 cycle (revisit:test 또는 revisit:spec).

## ★ v11.0.0 stack 별 분기 + 코드→swagger drift 차단 (DEC-2026-05-26-be-fe-산출물-분리 §3 + DEC-2026-05-26-contract-강제-양-axis §6)

본 skill 산출 impl-spec.modules[] 안 `layer` (be/fe/db/e2e/infra) + `stack` (24종 enum) 본격 분기:

### BE stack 본격
- `spring-boot` → `src/main/java/**/{Controller,Service,Repository}.java`
- `nestjs` → `src/**/{module,controller,service,repository}.ts`
- `express` → `src/{routes,middlewares,services}.{ts,js}`
- `fastapi` → `app/{routers,services,models}.py`
- `flask` / `rails` / `phoenix` / `go-gin` / `go-fiber` — 동형 convention

### FE stack 본격
- `react` → `src/{features,pages,components,hooks}.tsx`
- `vue` → `src/{views,components,composables}.vue`
- `svelte` / `solid` / `angular` / `next-js` / `nuxt` / `remix` — 동형 convention

### ★ 코드 → swagger drift 차단 도구 본격 인식

BE 산출 시 다음 도구 본격 활용 (R15 no-simulation 정합):

| stack | drift 차단 도구 | 호출 |
|---|---|---|
| `spring-boot` | **springdoc-openapi** | `mvn springdoc-openapi:generate` → openapi.yaml drift 검출 |
| `nestjs` | **@nestjs/swagger** | `node generate-swagger.ts` → openapi.yaml drift 검출 |
| `fastapi` | **automatic OpenAPI** | `app.openapi()` JSON dump → drift 검출 |
| `rails` | **rswag** | `rake rswag:specs:swaggerize` |

★ 본 도구 실행 후 코드 ↔ swagger 일치 검증 의무 (analysis-openapi skill 안 spectral-runner 와 분리 axis / drift 시 chain implement 종결 ❌ / impl 보강 cycle).

### FE design token drift 차단 (DEC.contract §2 / FE 트랙)

- DTCG W3C token validator (R19 Tier 1 / in-plugin / 사용자 환경)
- Storybook + Chromatic visual regression (Tier 2)
- state-map ↔ component state 정합 검증

## 70~80% 한계 명시 (★ 본 skill 핵심)

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

i-strict 정통 = AI 자동 생성 + 사용자 검토 (gate #5 ≤ 15%):
- ★ generate ≥ 80% (boilerplate / test 만족 코드).
- ★ ★ 사용자 검토 ≤ 20% — design pattern / refactor / performance 결단.
- ★ ★ ★ 100% 자동화 시 시뮬 위험 폭증 (LLM 환각 / hallucinated dependency / etc.).

## 절차

### 1. test-spec 분석

각 TC 마다 `source_file` path 분석 → impl 의 module path 매핑:
- jest `src/auth/auth.controller.test.ts` → impl `src/auth/auth.controller.ts`
- junit5 `src/test/java/.../UserLoginTest.java` → impl `src/main/java/.../UserLogin.java`
- pytest `tests/test_user_login.py` → impl `<app>/user/login.py`

### 2. impl 모듈 분해 (IMPL-{slug}-NNN)

본 skill 산출 = `impl_modules[]`:
```json
{
  "id": "IMPL-USER-001",
  "tc_refs": ["TC-USER-001", "TC-USER-002"],
  "bhv_refs": ["BHV-USER-001", "BHV-USER-002"],
  "framework": "nestjs",
  "source_files": ["src/auth/auth.controller.ts", "src/auth/auth.service.ts"],
  "commit_hash": "<git rev-parse HEAD 후 채움>"
}
```

### 3. 코드 generate (★ ★ test → impl 단방향)

각 IMPL 모듈마다:
1. test source_file 읽음 → assertion 분석.
2. behavior-spec.behaviors[].preconditions / postconditions / invariants 매핑.
3. architecture.json layered (controller → service → repository) 패턴 따름.
4. schema.json entity → ORM 모델 매핑.
5. api-extension.json operationId → endpoint 매핑.

### 4. ★ ★ ★ commit_hash 채움

generate 후 git stage + commit (★ 사용자 결단 cluster 항목 / Auto Mode 위임 시 자동):
```bash
git add <generated files>
git commit -m "chore(chain-4): IMPL-USER-001 — generate impl from TC-USER-001"
git rev-parse HEAD  # → impl_modules[].commit_hash
```

★ commit_hash 부재 = ★ static-runner lint-no-simulation chain-strict 자동 차단 (sub-plan-3a / chain 5 source_files commit_hash 의무).

### 5. test 진짜 호출 → 100% pass 확인

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/test-impl-pass-validator/src/cli.js \
  --project <project> \
  --inventory <project>/.aimd/output/inventory.json \
  --allow-execute --json
```

★ ok=true + fail_count=0 의무. fail 발생 시:
- `verify-test-pass` skill 호출 → finding 분석 + revisit prompt.
- 사용자 결단: revisit:test (test 잘못 generate?) / revisit:spec (spec 결함?) / revisit:planning (use case 잘못?) / impl 보강.

### 6. coverage_report_path / linter_output_path 채움

```bash
# static-runner R19 Tier 1 (Semgrep in-plugin) + Tier 2 (SARIF import / PMD / SpotBugs / CodeQL / Daikon)
bash ${CLAUDE_PLUGIN_ROOT}/tools/static-runner/src/lint-no-simulation.sh <project>/.aimd/output/ --chain-strict
```

linter_output_path → impl-spec.test_pass_evidence.linter_output_path 채움.

### 7. schema-validator + traceability-matrix-builder 회귀

```bash
node ${CLAUDE_PLUGIN_ROOT}/tools/schema-validator/src/cli.js .aimd/output/impl-spec.json
node ${CLAUDE_PLUGIN_ROOT}/tools/traceability-matrix-builder/src/cli.js \
  --discovery  .aimd/output/discovery-spec.json \
  --behavior   .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec  .aimd/output/test-spec.json \
  --impl-spec  .aimd/output/impl-spec.json \
  --out-dir    .aimd/output/traceability/
```

★ matrix.coverage_summary.green_count 가 IMPL 까지 채워짐 의무 (red_count == 0).

### 8. gate #5 호출

`_base-invoke-go-stop-gate` skill (cluster 5~6 / GREEN 100% pass 명시 + impl 모듈 review 항목).

## ★ ★ ★ v8.8.0+ strategy_chosen enum (G-007 보강)

### 배경

mis-fe-admin DWPD-1774 5 stage 실증 테스트 §G-007 — chain 5 진입 시 v1 코드가 git history (develop) 에 있어 implement stage 가 **"fresh-generate" 가 아닌 "git-restore"** 케이스. plugin v8.7.4 의 impl-spec.json 산출물 표기 명세에 generate 외 strategy 부재 → 사용자 ad-hoc 표기 + `commit_hash` 필드 의미가 "신규 generate commit" vs "restored 출처 commit" 모호.

### impl-spec.json 신설 필드

| 필드 | 타입 | 의미 |
|---|---|---|
| `meta.strategy_chosen` | enum | `ai-generate-fresh` (default / 전체 신규 generate) \| `git-restore` (이전 branch / commit 의 코드 복원) \| `hybrid-restore-and-modify` (restore + 신규 generate / 일부만 modify) |
| `impl_modules[].strategy` | enum | 모듈 단위 strategy (meta.strategy_chosen 가 hybrid 시 의무) |
| `impl_modules[].restore_source` | object \| null | git-restore / hybrid 시 의무. null = ai-generate-fresh. |
| `impl_modules[].restore_source.branch` | string | 출처 branch (예: `develop`) |
| `impl_modules[].restore_source.commit_hash` | string | 출처 commit hash (★ 의무 — `git rev-parse <branch>` 시점 캡쳐) |
| `impl_modules[].restore_source.file_paths[]` | array | restore 대상 파일 path 목록 (예: `["src/auth/auth.controller.ts"]`) |
| `impl_modules[].restore_source.rationale` | string | restore 사유 (예: "v1 cycle 1~13 누적 정합 / chain 4 test 12개 carry 와 matching") |
| `impl_modules[].modify_diff` | string \| null | hybrid 시 의무 — restore 후 modify diff summary (1~3 줄) |
| `meta.restore_count` | integer | strategy=git-restore 모듈 수 |
| `meta.fresh_count` | integer | strategy=ai-generate-fresh 모듈 수 |
| `meta.hybrid_count` | integer | strategy=hybrid 모듈 수 |

### strategy 별 합격 게이트 (★ v8.8.0+ 신규)

#### `ai-generate-fresh` (default)

기존 v8.7.4 절차 본문 (test-spec → impl 코드 generate → commit_hash 채움) 적용. `restore_source: null` 의무. `commit_hash` = 신규 generate 의 commit hash.

#### `git-restore`

1. 출처 branch + commit hash 식별:
   ```bash
   git rev-parse <branch>  # → restore_source.commit_hash
   git ls-tree <commit_hash> --name-only  # 복원 대상 파일 목록 확인
   ```
2. `git checkout <branch> -- <file_paths>` 또는 `git show <commit_hash>:<file> > <target>` 으로 복원.
3. **★ ★ ★ AC ↔ restored impl 정합 검증 의무** — restored 코드가 현재 acceptance-criteria 와 의미 정합인지 사용자 검토 (gate #5 cluster 필수 항목).
4. test 진짜 호출 → 100% pass 확인 (`--allow-execute`). pass 실패 시 → hybrid 전환 또는 ai-generate-fresh fallback.
5. `commit_hash` (impl-spec.json) = restore 후 본 chain 5 의 새 commit hash (★ restore_source.commit_hash 와 별개 / restore 결과를 본 chain 의 commit 으로 기록).

#### `hybrid-restore-and-modify`

1. 위 git-restore 절차 1~2 동일.
2. modify 대상 파일 명시 (`modify_diff` 필드).
3. modify 결과가 test pass 의무 (GREEN).
4. modify commit + restore commit 분리 권고 (audit signal).

### 신규 finding (★ v8.8.0+)

- `impl.strategy-chosen-meta-missing` (medium) — `meta.strategy_chosen` 부재 시 default=`ai-generate-fresh` 가정 + warning.
- `impl.git-restore-source-incomplete` (critical) — strategy=git-restore 인데 `restore_source.branch` 또는 `restore_source.commit_hash` 부재.
- `impl.git-restore-equivalence-not-verified` (high) — strategy=git-restore + gate #5 cluster 에 "AC ↔ restored 정합 confirm" intervention-log entry 부재.
- `impl.hybrid-modify-diff-missing` (high) — strategy=hybrid 인데 `modify_diff` 부재.
- `impl.restore-source-commit-not-in-repo` (critical) — `restore_source.commit_hash` 가 `git cat-file -t <hash>` reject.

### Auto Mode 흐름 (정합)

Auto Mode 활성 시 — 이전 branch 의 코드가 살아있고 chain 4 의 carry test 와 paths 일치하면 → 1차 default `strategy_chosen: git-restore` 적용 + gate #5 cluster 에서 사용자 일괄 confirm 의무 (★ G-005/G-006 와 동일 paradigm).

### 인용 (G-007 보강 추가)

- mis-fe-admin DWPD-1774 5 stage 테스트 §G-007 — case study reference (본 보강의 impl-spec.json 이 reference 자격).
- DEC-2026-05-21-G007 (impl-strategy enum 원본 결단 record / workspace decisions/ — dist 미포함이라 경로 직접 인용 제거: case-by-case dist-dangling 정책 / 상세는 task-plan.adrs[] + impl-spec.strategy enum).
- DEC-2026-05-06-round-trip-부분-허용 — revisit:test 가능 (strategy 전환 시 chain 4 재진입).

## 기술 스택 분기 (★ skills-axis 정합 / 본문 분기)

### nestjs

```ts
// src/auth/auth.controller.ts (generated for IMPL-USER-001)
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    // BHV-USER-001 / AC-USER-001
    return this.authService.login(dto);
  }
}
```

### spring

```java
@RestController @RequestMapping("/auth")
public class AuthController {
  private final AuthService authService;
  public AuthController(AuthService authService) { this.authService = authService; }

  @PostMapping("/login")
  public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest req) {
    // BHV-USER-001 / AC-USER-001
    return ResponseEntity.ok(authService.login(req));
  }
}
```

### fastapi

```python
@router.post("/login")
async def login(req: LoginRequest, svc: AuthService = Depends()):
    """BHV-USER-001 / AC-USER-001"""
    return await svc.login(req)
```

## 인용

- ADR-CHAIN-001 §1 (json 단독 / ADR-011) §3 (no-simulation 강화)
- ADR-CHAIN-004 §4 (--allow-execute 의무)
- impl-spec.schema.json (deliverable 21) `fail_count const 0`
- master plan §B chain 5
- DEC-2026-05-06-v2.0-i-strict-채택 §70~80% 한계

## Carry

- 코드 generate 정확도 측정 = sub-plan-6 PoC #05 (1 BR + 1 UC + 1 TC + 1 IMPL end-to-end cycle).
- design pattern 자동 추천 (Strategy / Factory / Repository) = v2.x carry.
- multi-framework parallel generate (BE Spring + FE React 동시) = v2.x (master plan K-5).
