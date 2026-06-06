# PoC #05 — sample user-register (chain harness 4-stage e2e corroboration #1)

> v2.0.0-rc1 sub-plan-6 — chain harness 4-stage e2e single-cycle 입증.
> Senior F1 흡수 — 1 UC → 2 UC (register + login) 확장 / multi-UC chain coverage.
> Senior F6 흡수 — vitest 채택 (TS 환경 정합 + framework matrix 운영 입증 1종 추가).

## 의도

scope **마이크로** (LOC ≤ 200 / RealWorld scale ❌). chain harness 4 stage 모두 실제 driver 통과 + 진짜 vitest runner + traceability-matrix 100% green.

## 도메인

| ID                     | 정의                                                        |
| ---------------------- | ----------------------------------------------------------- |
| BR-USER-DATA-001       | 이메일 중복 ❌ (UNIQUE constraint / 중복 시 409 Conflict)   |
| BR-USER-VALIDATION-001 | 비밀번호 최소 8자 (validation 실패 시 400 Bad Request)      |
| UC-USER-001            | POST /users — 신규 사용자 등록 (register)                   |
| UC-USER-002            | POST /users/login — 이메일/비밀번호 로그인 (login)          |
| BHV-001                | UC-USER-001 happy path: 새 user → user.id 반환 / 중복 → 409 |
| BHV-002                | UC-USER-002 happy path: 일치 시 user 반환 / 불일치 → 401    |
| AC-USER-001            | Gherkin: register 동일 이메일 가입자 존재 → 409             |
| AC-USER-002            | Gherkin: login 비밀번호 불일치 → 401                        |
| TC-USER-001            | UserService.register — vitest unit                          |
| TC-USER-002            | UserService.login — vitest unit                             |
| IMPL-USER-001          | UserService.register + EmailUniquenessGuard                 |
| IMPL-USER-002          | UserService.login + PasswordComparator                      |

## 4 stage 운영

```
analysis (chain 0)
  → planning (chain 1) → gate #1
  → spec (chain 2)     → gate #2
  → test (chain 3 RED) → gate #3
  → impl (chain 4 GREEN/100% pass) → gate #4
```

각 stage 종결 시 chain-driver state.json mutate + intervention-log.jsonl append.

## 실행

```bash
# 1. driver init
node ../../tools/chain-driver/src/cli.js init .

# 2. chain 1 → 2 → 3 → 4 (각 단계 validator + driver next)
#    상세 절차는 .aimd/output/run-log.md 참조

# 3. 진짜 test runner (chain 4 GREEN)
cd target && npm test

# 4. test-impl-pass-validator (no-simulation enforcement)
cd ../../.. && \
  node tools/test-impl-pass-validator/src/cli.js \
    --project examples/poc-05-sample-user-register \
    --inventory examples/poc-05-sample-user-register/input/inventory.json \
    --allow-execute

# 5. traceability-matrix
node tools/traceability-matrix-builder/src/cli.js \
  --project examples/poc-05-sample-user-register
```

## 산출

```
poc-05-sample-user-register/
├── README.md             # 본 파일
├── source/               # legacy (의도된 결함 — 이메일 중복 검사 ❌)
├── input/                # analysis stage 산출 (chain 1 입력)
│   ├── inventory.json
│   ├── rules.json
│   ├── domain.json
│   └── antipatterns.json
├── .aimd/
│   ├── state.json        # chain-driver 영속 state
│   ├── config/test-cmd.json
│   └── output/
│       ├── planning-spec.{json,md}
│       ├── behavior-spec.{json,md}
│       ├── acceptance-criteria.{json,md}
│       ├── test-spec.{json,md}
│       ├── impl-spec.{json,md}
│       ├── traceability-matrix.{json,md,mermaid}
│       ├── intervention-log.jsonl
│       ├── run-log.md
│       └── evidence/
│           ├── test-stdout.txt
│           ├── test-stderr.txt
│           └── test-invocation-evidence.json
└── target/               # impl 산출 (chain 4 GREEN)
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    └── src/
        ├── user.service.ts
        ├── user.service.test.ts
        ├── email-uniqueness-guard.ts
        ├── password-comparator.ts
        └── user-store.ts          # in-memory store (테스트 전용)
```

## §8.1 strict 7/7 매핑

| #   | 자격                  | 본 PoC 입증                              |
| --- | --------------------- | ---------------------------------------- |
| 1   | ≥ 2 PoC corroboration | corroboration #1 (PoC #03 retrofit = #2) |
| 2   | 진짜 도구 5종 물증    | test-invocation-evidence.json 7 필드     |
| 3   | validator violation 0 | chain 1~4 각 validator pass              |
| 4   | chain coverage ≥ 0.85 | chain-coverage-validator 산출            |
| 5   | ADR registry          | (release-readiness.js §5)                |
| 6   | matrix 100% green     | UC-USER-001/002 → BHV → AC → TC → IMPL   |
| 7   | e2e 1 cycle pass      | 본 PoC 자체                              |
