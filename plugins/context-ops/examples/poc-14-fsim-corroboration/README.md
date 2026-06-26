# PoC #14 — F-SIM Corroboration #2 (FastAPI + SQLAlchemy + Pydantic / external-user dogfood)

> **본 PoC = 사용자 외부 시점 시뮬레이션** (`.claude/plans/peaceful-dreaming-dragonfly.md`). poc-05(TypeScript+vitest) 와 **stack 횡단** corroboration #2 자격 달성용.
> DEC-2026-05-17-chain-harness-e2e-simulation-audit §4.1.2 P1 deadline 2026-06-01 흡수.

## 의도 (배경)

v8.3.0 release 후 사용자 메타 질문 "지금 한 것들이 어떤 의미가 있는거야?" 응답에서 정직 표면화 — "사용자 실제 코드베이스 적용 = 0 / methodology self-evolution 만 누적". 사용자 후속 요청 4 조건:

1. **빌드된 최신 plugins 기준** (v8.3.0)
2. **기존 PoC 사용 ❌** (poc-01~13 격리)
3. **plugin 각 요소 사용자 시점 기록** 의무
4. **사용 빈도 + 사용 못하는 경우** 양쪽 데이터

본 PoC = 가상 외부 사용자의 small legacy codebase. plugin v8.3.0 의 47 skill / 9 agent / 17 tool / 3 hook event 전수 invocation log + frequency matrix + non-use rationale 산출.

## 도메인 (시뮬레이션 가상 시나리오)

"개발자 A 가 사이드 프로젝트로 small Todo API 를 개발하다가 production 직전 외부 컨설팅으로 본 plugin 을 적용한다."

- **User register / login** + **Todo CRUD** REST API
- Python FastAPI 0.115 + SQLAlchemy 2.0 + Pydantic v2 + SQLite
- ~350 LOC / RealWorld scale ❌ (의도적 micro)

## 의도된 결함 (3 antipattern)

| ID               | severity     | 결함                                                          | 검증 lane                                                      |
| ---------------- | ------------ | ------------------------------------------------------------- | -------------------------------------------------------------- |
| AP-FSIM-SEC-001  | **critical** | 비밀번호 plaintext 저장 (bcrypt/argon2 부재)                  | F-SIM-001 antipattern-coverage lane (chain-coverage-validator) |
| AP-FSIM-DATA-001 | **high**     | 이메일 unique constraint 부재 (DB level + service level 양쪽) | F-SIM-001 lane                                                 |
| AP-FSIM-AUTH-001 | **medium**   | JWT 만료 시간 부재                                            | F-SIM-002 severity max-propagation                             |

→ critical 1 + high 1 + medium 1 = AC 매핑 또는 `excluded_antipatterns` carry 명시 의무. silent omission 시 chain-coverage-validator 가 차단.

## 의도된 stack signal 분포 (element coverage 최대화)

| signal                         | 포함 여부 | 영향 element (예상)                                        |
| ------------------------------ | --------- | ---------------------------------------------------------- |
| FastAPI REST endpoint          | ✅        | analysis-openapi / analysis-error-mapping fire             |
| SQLAlchemy entity + DDL        | ✅        | analysis-db-schema-erd fire                                |
| Pydantic schema                | ✅        | analysis-form-validation-fe? (명목 FE / 실 fire 여부 확인) |
| Semgrep config (.semgrep.yml)  | ✅        | analysis-aspect-static-security fire (no-simulation 의무)  |
| SQLite (RDB)                   | ✅        | analysis-sql-inventory fire                                |
| Swagger YAML 별도 input        | ✅        | analysis-from-swagger fire                                 |
| 기획 문서 (input/docs/plan.md) | ✅        | analysis-from-plan-doc fire                                |
| TypeScript / .tsx              | ❌        | analysis-type-spec-fe **non-fire**                         |
| React / Vue / Svelte           | ❌        | implement-react/vue + analysis-ui-\* **non-fire**          |
| i18n library                   | ❌        | analysis-aspect-i18n **non-fire**                          |
| Strangler / deprecated API     | ❌        | analysis-aspect-legacy **non-fire**                        |
| Figma URL                      | ❌        | analysis-from-figma **non-fire**                           |
| JSP / Thymeleaf                | ❌        | analysis-html-template **non-fire**                        |
| Design token / Tailwind        | ❌        | analysis-ui-visual-manifest-fe **non-fire**                |
| State management lib           | ❌        | analysis-ui-state-map-fe **non-fire**                      |

**예상 결과**: fire ≈ 30~35 skill / non-fire ≈ 12~17 skill.

## 산출 (디렉토리 트리)

```
poc-14-fsim-corroboration/
├── README.md                          # 본 파일
├── source/                            # 외부 사용자의 legacy codebase (의도된 결함 포함)
│   ├── main.py                       # FastAPI app + routes
│   ├── models.py                     # SQLAlchemy User + Todo (이메일 UQ 부재)
│   ├── schemas.py                    # Pydantic request/response
│   ├── auth.py                       # register + login (plaintext / no JWT expiry)
│   ├── users.py                      # user service
│   ├── todos.py                      # todo CRUD service
│   ├── database.py                   # SQLite session
│   └── requirements.txt              # 의존성 명세
├── input/                             # analysis stage 진입 사용자 input
│   ├── _readme.md                    # input 구성 안내
│   ├── docs/
│   │   └── plan.md                   # 기획 문서 (analysis-from-plan-doc 입력)
│   └── swagger.yaml                  # OpenAPI 명세 (analysis-from-swagger 입력)
├── .semgrep.yml                       # Semgrep 룰 (no-simulation 의무)
├── .ai-context/
│   ├── state.json                    # chain-driver state
│   ├── output/                       # chain 1~4 산출물 (planning/behavior/AC/test/impl/matrix)
│   └── simulation/                   # 본 PoC 핵심 산출 (사용자 시점 기록)
│       ├── invocation-log.md         # sequential log (timestamp + element + result)
│       ├── element-frequency.json    # 47 skill × stage × fire count + agent/tool/hook
│       └── non-use-rationale.md      # 미 fire element + 사유 + 재현 조건
└── target/                            # chain 4 GREEN impl 산출
    └── (생성 예정)
```

## §8.1 strict 7/7 corroboration #2 자격 매핑

| #   | 자격                       | 본 PoC 입증                                  |
| --- | -------------------------- | -------------------------------------------- |
| 1   | ≥ 2 PoC corroboration (L2) | ✅ poc-05 + poc-14 (stack 횡단 BE)           |
| 2   | 진짜 도구 5종 물증         | pytest (poc-05 = vitest / 별도 framework)    |
| 3   | validator violation 0      | chain 1~4 각 validator pass + F-SIM-001 lane |
| 4   | chain coverage ≥ 0.85      | chain-coverage-validator                     |
| 5   | ADR registry               | (기존)                                       |
| 6   | matrix 100% green (L3)     | UC→BR→BHV→AC→TC→IMPL forward+backward        |
| 7   | e2e 1 cycle pass           | 본 PoC + poc-05 = 2 cycle                    |

## 본 PoC 의 v8.3.0 패러독스 해소

`flows/sdlc-4stage-flow.json` `release_eligibility.self_consistency_note`:

- v8.3.0: "정의 강화 / 사실 미충족 패러독스 잔존" (current_corroboration_count_at_required_strength=1)
- **v8.4.0 (본 PoC 종결 후)**: "패러독스 해소" (count = 2)

## 외부 사용자 시뮬레이션 워크플로우 (시나리오 B)

```bash
# 1. plugin install (외부 사용자 시점)
/plugin marketplace add ...
/plugin install ai-native-methodology@ai-native-methodology

# 2. chain-driver init
node /path/to/plugin/tools/chain-driver/src/cli.js init ./poc-14-fsim-corroboration

# 3. chain 0 — 분석 (자연어 발화)
"이 코드베이스 분석 시작"
# → analysis-input-collection / analysis-input-orchestrate / analysis-from-{swagger,plan-doc,prompt} dispatch
# → 산출물 + aspect 자동 trigger

# 4. chain 1 — 기획
"기획 단계 진입"
# → planning-extract-from-legacy + sub-skills + gate #1

# 5. chain 2 — 명세
"명세 작성"
# → spec-compose-behavior-spec + AC.related_brs/aps 작성 + gate #2

# 6. chain 3 — 테스트 RED
"테스트 작성 RED"
# → test-generate-test-spec + 진짜 pytest 실행 (impl 부재 fail) + gate #3

# 7. chain 4 — 구현 GREEN
"구현 GREEN"
# → implement-generate-impl-spec + 진짜 pytest 100% pass + matrix + gate #4
```

## 진행 cadence (다음 session 시 본격 실행)

- plan: `.claude/plans/peaceful-dreaming-dragonfly.md` (Step 1~9)
- 각 stage 진행 시 invocation-log.md 실시간 append + frequency.json 갱신
- 종결 시 STOP-3 9-gate + v8.4.0 MINOR release
