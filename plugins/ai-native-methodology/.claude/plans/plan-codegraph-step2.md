# plan-codegraph-step2 — codegraph wiring STEP 2 (finding 채널 / codegraph→finding-list)

> SSOT = `decisions/DEC-2026-06-03-codegraph-deliverable-wiring.md` §5 STEP 2 + §3 finding-list 행.
> 4원칙 #1 (깊은 숙지→plan). research = `research-codegraph-step2.md` (3-agent). gate #3 (사용자 승인) 전 코드 착수 ❌.
> 선례 = STEP 1 (v12.9.0) `plan-codegraph-step1.md` — 11-deliverable 초안을 Senior 적대 0.82 로 2-axis 최소코어로 축소.

## 0. 한 줄 결론 (research 수렴)

STEP 2 진입점 메모의 **"cycle·orphan·coverage-hole seed"** 는 핸드오프 overclaim — **실측으로 반증됨**(STEP 1 research 가 핸드오프 2사실 반증한 선례 동형). 정직한 STEP 2 = **신규 seed 종류가 아니라 2-mechanism 어댑터/배선**:

1. **coverage-hole-as-finding export** (STEP 1 산출을 finding-system shape 로 정식 emit)
2. **finding-system.schema.json `code_graph_ref` optional additive + conditional severity ceiling**
   (+ 보조: handler-set reading-aid / ecommerce 1-도메인 정직표기)

cycle·orphan = **STEP 3+ carry** (call-graph provenance 해소 개선 후).

## 1. 전수 조사 결과 (no-simulation / 실 파일·실 DB)

### 1.1 STEP 1 자산 (재사용 토대)

- `tools/codegraph-coverage/src/render.js:7-48` — `SEVERITY_CEILING=Object.freeze(['low','medium'])` + `pinSeverity()` throw + `toFindings()` 가 이미 finding shape `{id:F-CGCOV-NNN, axis, severity, message, evidence}` 산출.
- `enumerate.js:40-76` — node:sqlite readOnly `SELECT … FROM nodes WHERE kind=?` (nodes-only) + `probeSchema` PRAGMA graceful + `checkIndexFreshness`.
- `filters.js` — isFrameworkRoute/isDynamicRoute/isNoiseMethod/isNonPublic/isDataClassFile.
- `coverage.js:81-118` — Map/Set set-diff + detectable/unverified/undetectable 3-state + impl-spec 의미성 게이트.
- `cli.js:111-121` — meta `reference_lens:true` + `severity_ceiling` + `generated_by`.
- `schemas/code-coverage-hole.schema.json` — severity enum **자체를 [low,medium] 로 절단**(strict).

### 1.2 finding-system.schema.json 현 상태

- top-level `additionalProperties:false` (strict) + required 8필드.
- `discoverer` = **자유텍스트 string (enum 아님)** → `'codegraph'` 값은 schema 무변경 즉시 가능.
- `severity` enum = `[low,medium,high,critical,positive]` — **high/critical 살아있음**(기존 finding 호환 / 절단 불가).
- `cross_validation.discoverers` enum = `[senior,static_analyzer,user,main,external_tool]` — 'codegraph' 부재.
- **`code_graph_ref` 필드 부재** (grep 0 / 전 schema 디렉토리) → additive 필수(없으면 emit 즉시 hard-reject).

### 1.3 trust 경계 (불변 / 1차 방어선 견고)

- `findings-aggregator/src/aggregator.js:11` `REQUIRED_VALIDATORS_PER_STAGE` 에 등록된 validator 출력만 severity-count.
- `gate-eval.js:185` `HARD_BLOCK_CODES = Set([validator_critical, validator_high, s2_outcome_mismatch])`.
- codegraph-coverage 는 이 목록에 없음 → ledger finding 은 **애초에 severity-count 진입 불가**. gate-eval/aggregator codegraph 토큰 = 현재 0 (check34 green).

### 1.4 실 DB 실측 (양 도메인 / no-simulation) — cycle·orphan 반증

- edges 테이블: RealWorld 4452 / ecommerce 1270. kind = contains/imports/calls/references/instantiates/extends/implements/decorates.
- **orphan(non-contains in-edge 0)**: RealWorld method 178/class 87, ecommerce method 109/class 16. 거친 필터 후에도 **RealWorld 51~75 survivor 전부 live**(@DgsComponent GraphQL/JUnit @Test framework-invoked), **ecommerce 23~29 survivor 전부 live**(login/refreshToken/canActivate/handle = DI·lifecycle). 근본원인 = **call provenance 미해소**(RealWorld calls 519/590 null, ecommerce 109/120 null). → in-degree 0 을 dead 로 단정 = **보이지 않는 엣지를 dead 로 날조에 준함 = no-simulation 위배**.
- **call-cycle**: self-call RealWorld 10(정상 재귀/JUnit lifecycle)/ecommerce 37, same-name RealWorld 94/590, method-only SCC RealWorld 0 / ecommerce 2(sibling wrapper 정상 패턴). → 결정적 도출 아님.
- **handler-set(implements/extends)**: ecommerce 만 깨끗(implements ExceptionHandler×3 + 예외계층 extends 6). RealWorld implements = Repository interface↔impl + DefaultJwtService(error-mapping handler 아님), extends 15 대부분 test base class(noise). → **ecommerce 1-도메인 정직표기**.

### 1.5 dep-graph 중복 착시 정정

- `graph-integrity-validator` (artifact cycle/orphan) + `propagation-orderer` topo cycle 은 **artifact 노드(UC/BHV/AC/TASK/TC/IMPL) 전용** = 요구사항 추적성 그래프 무결성.
- codegraph cycle/orphan = **코드 구조** 무결성. **같은 단어 다른 그래프 = 직교축**. → 중복 아님. dep-graph 도구에 codegraph inject **절대 금지**.

## 2. 시행 범위 (minimal core — §8.1 정합)

| #   | 항목                                                                | 채널        | corroboration                         | include             |
| --- | ------------------------------------------------------------------- | ----------- | ------------------------------------- | ------------------- |
| (1) | **coverage-hole → finding-system shape export**                     | finding     | route 2-도메인 / method 1-도메인 정직 | ✅ core             |
| (2) | **code_graph_ref optional additive + conditional severity ceiling** | schema      | —                                     | ✅ core             |
| (3) | handler-set reading-aid (implements/extends)                        | reading-aid | ecommerce 1-도메인 정직               | ◻ 보조(사용자 결단) |
| —   | cycle / orphan seed                                                 | —           | 실측 FP 압도 반증                     | ❌ STEP 3+ carry    |

### 2.1 schema 변경 (최소)

- `finding-system.schema.json`: `code_graph_ref` optional object `{node_id:string, edge_kind?:enum, file?:string, line?:integer, db_path?:string}` (additionalProperties:false).
- allOf if-then: `if {required:[code_graph_ref]} then {properties:{severity:{enum:[low,medium]}}}` — 사람이 codegraph 발 finding 을 high/critical 등재 차단. 기존 finding(code_graph_ref 부재) 회귀 0.
- `discoverer` / `severity` enum / `discoverers` enum = **무변경**(discoverer 자유텍스트 'codegraph' 사용 / enum 격상 = 권위 누출 reject).

### 2.2 도구 = codegraph-coverage 확장 (신규 도구 ❌)

- coverage-hole export: `render.js toFindings()` → finding-system F-XXX/code_graph_ref 어댑터(emit 함수) 추가.
- handler-set(포함 시): `enumerate.js` 에 `enumerateEdges(kind IN implements,extends)` 신규 함수 1개(순회 알고리즘 불요 / 전수 열거만).

### 2.3 회귀 가드 = check35 (release-readiness 34→35 / check34 4-part isomorphic)

1. **음성 토큰 0** — gateModules 3개(gate-eval.js / aggregator.js / findings-aggregator-cli.js)에 codegraph→finding seed 토큰(`code_graph_ref`·신규 emit 함수명) 부재. (주의: 주석에도 토큰 금지 또는 import 정밀매칭 전환 / check33:1528 선례)
2. **schema conditional 존재(양성)** — code_graph_ref optional + allOf if-then(⟹ severity ⊆ {low,medium}) 정규식 검사.
3. **ceiling 코드 강제 유지(양성)** — 신규 emit 모듈 high/critical 리터럴 0.
4. **신규 emit 모듈 gate import 0** — check33 import 정밀매칭 `/^\s*import\b[^\n]*from\s*['"][^'"]*(?:gate-eval|findings-aggregator)/m`.

- self-test: `release-readiness.test.js` 34-id deepEqual 정렬 배열에 신규 id 알파벳 삽입 + criteria_total 34→35 / passed 33→34 + discrimination it(check34/check32 템플릿 복제).

## 3. carry (STEP 3+ / 9종)

cycle seed · orphan seed · error-mapping http_status/mechanism(semantic) · handler-set 2nd Spring 도메인 · domain orphan-repo(semantic) · antipatterns ARCH cycle(detected_by enum 충돌) · artifact-graph code→requirement orphan(직교/inject 금지) · F-CGCOV↔F-XXX promote 번호정책 · **DEC §3 line 44 'sanctioned 채널 본체' 문구 정정**(시행 후 본문 정직 갱신 의무).

## 4. Lessons Learned (착수 전 기록)

- **DEC §3 line 44 "cycle/orphan/coverage-hole seed = sanctioned 채널 본체" = 핸드오프 overclaim** — 실 DB 직접 쿼리로 반증. STEP 1 research 핸드오프 2사실 반증 선례 동형. (zero-base 정신 / carry 정박 금지 — `feedback_zero_base_no_carry_anchor`)
- in-degree 0 = dead 단정은 codegraph call-graph 해소 불완전(provenance null 다수) 위에서 날조에 준함 = no-simulation 위배. 업계 6도구(knip/dependency-cruiser/NDepend/SonarQube/ArchUnit/shipmonk) 모두 graph-derived finding = advisory + orphan FP 압도 corroborate.

## 5. release class

MINOR (API·gate 무변경 / reference-lens 확장 + schema additive optional / 기존 finding 회귀 0). 단일 release 권장 (4 release cap / paradigm 안정점 cadence).
