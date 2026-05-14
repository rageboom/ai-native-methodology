---
name: implement-generate-impl-spec
description: ★ ★ ★ v2.0 chain 4 진입 skill (i-strict). test-spec 기반 impl 코드 자동 generate + impl-spec.{json,md} 산출. GREEN 의무 (모든 test 100% pass). full-stack-implementer persona 책임. ADR-CHAIN-001 §1 (이중 렌더링) + DEC-2026-05-06-v2.0-i-strict-채택 정합.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# generate-impl-spec

★ ★ ★ v2.0 chain 4 (impl) 의 **진입 skill / i-strict 정통**. test-spec → impl 코드 자동 generate / GREEN 의무 (100% test pass).

## 언제 사용

- chain 3 (test) 종결 + gate #3 go 결단 후 의무.
- 사용자: "impl 코드 만들어줘" / "chain 4 진입" / "GREEN 도달".

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

- `<project>/.aimd/output/impl-spec.json` (★ schemas/impl-spec.schema.json 의무)
- `<project>/.aimd/output/impl-spec.md` (사람 눈)
- 실 impl 코드 (framework 별):
  - nestjs: `<project>/<src>/{module,controller,service,repository}.ts`
  - spring: `<project>/src/main/java/**/{Controller,Service,Repository}.java`
  - django/fastapi: `<project>/<app>/{views,services,models}.py`
  - go: `<project>/<pkg>/{handler,service,repo}.go`
- `<project>/<src>/migrations/*.{sql,ts,py}` (DB schema 변경 시)

## ★ ★ ★ GREEN 의무 (chain 4 종결 조건)

chain 4 종결 시 **모든 test 100% pass** 의무 (★ impl-spec.schema.json `fail_count: const 0`):
- test-impl-pass-validator 호출 → ok=true 의무.
- fail_count > 0 → chain 4 종결 ❌ / impl 보강 cycle (revisit:test 또는 revisit:spec).

## 70~80% 한계 명시 (★ 본 skill 핵심)

i-strict 정통 = AI 자동 생성 + 사용자 검토 (gate #4 ≤ 15%). 100% 자동화 ❌:
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

★ commit_hash 부재 = ★ static-runner lint-no-simulation chain-strict 자동 차단 (sub-plan-3a / chain 4 source_files commit_hash 의무).

### 5. test 진짜 호출 → 100% pass 확인

```bash
node tools/test-impl-pass-validator/src/cli.js \
  --project <project> \
  --inventory <project>/.aimd/output/inventory.json \
  --allow-execute --json
```

★ ok=true + fail_count=0 의무. fail 발생 시:
- `verify-test-pass` skill 호출 → finding 분석 + revisit prompt.
- 사용자 결단: revisit:test (test 잘못 generate?) / revisit:spec (spec 결함?) / revisit:planning (use case 잘못?) / impl 보강.

### 6. coverage_report_path / linter_output_path 채움

```bash
# static-runner 6종 (Semgrep / PMD / SpotBugs / 등)
bash tools/static-runner/src/lint-no-simulation.sh <project>/.aimd/output/ --chain-strict
```

linter_output_path → impl-spec.test_pass_evidence.linter_output_path 채움.

### 7. schema-validator + traceability-matrix-builder 회귀

```bash
node tools/schema-validator/src/cli.js .aimd/output/impl-spec.json
node tools/traceability-matrix-builder/src/cli.js \
  --planning   .aimd/output/planning-spec.json \
  --behavior   .aimd/output/behavior-spec.json \
  --acceptance .aimd/output/acceptance-criteria.json \
  --test-spec  .aimd/output/test-spec.json \
  --impl-spec  .aimd/output/impl-spec.json \
  --out-dir    .aimd/output/traceability/
```

★ matrix.coverage_summary.green_count 가 IMPL 까지 채워짐 의무 (red_count == 0).

### 8. gate #4 호출

`_base/invoke-go-stop-gate` skill (cluster 5~6 / GREEN 100% pass 명시 + impl 모듈 review 항목).

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

- ADR-CHAIN-001 §1 (이중 렌더링 chain 4) §6 (no-simulation 강화)
- ADR-CHAIN-004 §4 (--allow-execute 의무)
- impl-spec.schema.json (deliverable 21) `fail_count const 0`
- master plan §B chain 4
- DEC-2026-05-06-v2.0-i-strict-채택 §70~80% 한계

## Carry

- 코드 generate 정확도 측정 = sub-plan-6 PoC #05 (1 BR + 1 UC + 1 TC + 1 IMPL end-to-end cycle).
- design pattern 자동 추천 (Strategy / Factory / Repository) = v2.x carry.
- multi-framework parallel generate (BE Spring + FE React 동시) = v2.x (master plan K-5).
