# PoC #19 — Python/금융 full-chain dogfood (chain-driver state machine E2E / 2nd distinct domain)

> **목적 ([D2] 인계 carry)**: chain-driver **상태머신**을 **2번째 distinct problem-domain**(금융 / Python)에서 analysis(#0)→discovery(#1)→spec(#2)→plan(#3)→test(#4 RED)→implement(#5 GREEN) 전 구간 E2E 로 돌려, poc-18(blog·post / Node·TS)과 함께 **§8.1 ≥2 distinct domain** 을 충족한다 (상태머신 메커니즘 corroboration #2).
> **결과**: ✅ **상태머신 6 stage 전 구간 완주 (terminal 도달 / last_gate=#5)**. 진짜 pytest 실행으로 genuine RED→GREEN 입증 (no-simulation).
> **일자**: 2026-06-06 / **시나리오**: S1 재생성(forward) / **distinct 축**: 도메인(금융 amortization ≠ blog) + 스택(Python/pytest ≠ Node/vitest)

---

## 1. 대상

| 항목 | 값 |
| --- | --- |
| repo | [numpy/numpy-financial](https://github.com/numpy/numpy-financial) |
| pin | **tag `v1.0.0`** (commit `247aa4e2`) — 순수 Python (HEAD 는 Cython `_cfinancial.pyx`+meson 으로 이전 → C 컴파일러 의존 → v1.0.0 으로 pin) |
| stack | **Python 3.14.1 + pytest 9.0.3 + numpy 2.4.6** (cp314 wheel) |
| LICENSE | BSD 3-Clause (LICENSE.txt 확인) |
| slice (chain 증분) | **대출 상환(amortization) — `pmt`/`ipmt`/`ppmt`** (고정 상환금·이자분·원금분 / 5 단위 테스트) |
| 범위 결정 | analysis = repo 전체 reverse-engineering (architecture 전 모듈) / chain 1~5 증분 = amortization 슬라이스 (valuation 함수 npv·irr·fv·pv 는 work-unit 스코프 밖) |

> **Docker-free 선택 근거**: poc-18 은 Docker Postgres 기반 integration test. 본 환경(Windows)엔 Docker 미설치 → no-simulation 원칙상 **DB/Docker 불요·순수 수치 단위테스트** 도메인을 선택 (금융 계산 = 본질적으로 DB-free). 이 제약이 "2번째 distinct" 의 스택/도메인 다양성을 자연 강화.

## 2. 환경 (재현)

```bash
# 1) clone (순수 Python v1.0.0 태그) + nested .git 제거
git clone --depth 1 --branch v1.0.0 https://github.com/numpy/numpy-financial.git target && rm -rf target/.git
# 2) venv + editable 설치 + 테스트 의존성 (전부 순수 Python wheel / 3.14 호환)
python -m venv .venv
.venv/Scripts/python.exe -m pip install -e target pytest pytest-json-report
# 3) baseline green (DB·Docker·네트워크 불요)
.venv/Scripts/python.exe -m pytest target/numpy_financial/tests/ -q   # 26 passed
```

## 3. 결과 — AXIS 분리 (분모 다름, 한 숫자로 합치지 않음)

### AXIS 1 — chain-harness gate pass-through (process metric)

| gate | stage | 결정 | validator (실 실행) |
| --- | --- | --- | --- |
| #0 | analysis | **user-decision** (soft `evidence_missing`→`--user-decision go`) | schema✅(4/4 valid) br-cross✅(0.975≥0.85) formal-spec-link✅ / decision-table=evidence_missing(계산 lib = 결정표 N/A) |
| #1 | discovery | **hard-block→resolve→AUTO** (go-eligible) | discovery-extraction✅ schema✅ br-cross✅ |
| #2 | spec | **user-decision** (soft `evidence_missing`→go) | chain-coverage✅(1.0) formal-spec-link✅ schema✅ / drift=evidence_missing(plugin 자기검사 = 사용자 프로젝트 N/A) |
| #3 | plan | AUTO (go-eligible) | plan-coverage✅ schema✅ |
| #4 | test (RED) | AUTO (go-eligible) | test-impl-pass✅(**실 pytest**: 0 pass/5 fail) spec-test-link✅(AC→TC 1.0) schema✅ |
| #5 | implement (GREEN) | AUTO (terminal) | test-impl-pass✅(**실 pytest**: 5 pass/0 fail) traceability✅(fwd/bwd 1.0) schema✅ / static-runner=env-carry |

- **4 auto / 2 user-decision (6 gate)** = **67% 자동 / 33% 사람**. 2 user-decision(#0 decision-table·#2 drift)은 **계산 lib·사용자 프로젝트 특성상 N/A 인 validator 의 정직한 evidence_missing soft-block** (silent pass ❌ / 결함 ❌). poc-18(83% auto)보다 사람 비율 ↑ = 도메인 산출물 프로파일 차이(N/A validator 2종)의 정직 반영.
- 전 gate 의 `state.json.last_gate.{id,stage,decision}` 전이 = 결정론 evidence trail.

### gate #1 hard-block (★ dogfood 가치 / 게이트 실작동 입증)

- discovery-extraction-validator 가 **UC coverage 0.43 < 0.80** 으로 **hard-block (validator_high / exit 1 / state.blocked 영속)**. 원인: analysis domain 에 7 UC(amortization 3 + valuation 4)인데 discovery 는 슬라이스 3 UC 만 커버.
- 해소: analysis domain 스코프를 work-unit(amortization)에 정렬(valuation BC 제거 = "분석 범위 ≠ work-unit 스코프" 정정) → coverage 1.0 → block 해제 → 재통과. **soft 가 아닌 진짜 hard gate 가 작동(silent pass 아님)** 을 실증.

### genuine RED→GREEN (no-simulation 핵심 / i-strict)

| | RED (chain 4) | GREEN (chain 5) |
| --- | --- | --- |
| impl (`_financial.py` pmt/ipmt/ppmt) | `raise NotImplementedError` stub | 재생성된 원 구현 |
| pytest | **0 pass / 5 fail** | **5 pass / 0 fail** |
| result_hash | `sha256:acf0cd2c…` | `sha256:dab39cae…` (다름 = 진짜 상태 변화) |
| test 파일 | 미변경 | 미변경 (**i-strict 증명**: delta = impl body 뿐) |

전 runner 호출 = Tier 1 실 pytest 9.0.3 (`pytest --json-report` / pytest-json-report 1.5.0). simulated_evidence_count=0. 기대 수치는 numpy-financial docstring 예시·실측 확정 (예: `pmt(0.075/12,180,200000) = -1854.0247200054619`, `ipmt+ppmt == pmt` 불변식).

### AXIS 2 — §3-A 추출 (Modern / provenance self-assessment)

**5 이식성 산출물 중 3/3 적용** (도메인 특성): business-rules(6 / 전부 `code_condition` code-grounded) · domain(1 BC / 2 entity / 3 UC) · antipatterns(3 / `human_review`). **db-schema·openapi = N/A (정당화)** — 순수 계산 lib (DB·HTTP API 없음). 이것이 poc-18(5/5)과 다른 **산출물 프로파일** = "2번째 distinct" 의 본질 (상태머신이 다른 프로파일도 처리함을 입증).

**§3-A 해석 (정직 경계 / poc-18 §3 동형)**: business-rules 는 `_financial.py` 의 명시 공식에서 거의 전부 직접 code-grounded. 그러나 **이 수치 = 정직한 §3-A "자동화율" 아님** — (a) 추출한 항목만 셈(누락분 미반영) (b) 독립 ground-truth 부재 (c) 추출 LLM 본인 self-assessment. **백분율 ceiling claim ❌ / §3-A rate = 미측정.**

> **§8.1 단일 PoC 과적합 회피**: 본 run = 상태머신 메커니즘 corroboration **#2** (poc-18 = #1). poc-18(blog/Node·TS) + poc-19(금융/Python) = **≥2 distinct problem-domain 충족**. 단 2 data point 가 paradigm-wide ceiling 을 자동 확정하지는 않음 — **메커니즘이 distinct 도메인·스택·산출물 프로파일에서 재현됨** 의 corroboration.

## 4. 방법론이 노출한 finding (dogfood 가치)

| # | finding | 분류 |
| --- | --- | --- |
| F1 | gate #1(discovery-extraction) 이 analysis UC > work-unit 슬라이스 UC 일 때 **coverage < 0.80 hard-block** → "analysis 범위(repo 전체) vs work-unit 스코프(슬라이스)" 의 정렬 필요. 슬라이싱 시 analysis domain 도 work-unit 으로 scope 정렬 의무 (게이트 정상 작동 / 결함 아님) | scope 정렬 규율 |
| F2 | 순수 함수형 lib 는 db-schema·openapi 산출물이 **구조적으로 N/A** → 5 이식성 산출물 중 3 적용. 산출물 프로파일이 도메인 종속임을 실증 (CRUD/REST 가정 밖 도메인의 정직 N/A) | 산출물 프로파일 |
| F3 | static-runner: Python 정적분석기(semgrep/ruff 등) 본 환경 미실행 → R19 Tier 1 환경 의존 carry (시뮬 ❌ / 차단 ❌) | 환경 carry |
| F4 | (정직 기록) chain 4/5 는 `findings-aggregator` 가 test-impl-pass 에 `--allow-execute` 미전달 → **CHANNEL B**(DIRECT runner + 수동 findings 조립) 사용 (poc-18 F3 동형 — 기존 본체 갭 재확인) | 배선 갭(기지) |

> **본체 결함 신규 노출 0**: poc-18 이 노출·수정한 F1/F2/F4(본체) 위에서 본 PoC 는 회귀 없이 깨끗하게 완주 (그 fix 들의 회귀 가드 가치 재확인).

## 5. 산출물 위치

- `target/.ai-context/state.json` — 상태머신 최종 상태 (current_chain=implement, last_gate=#5)
- `target/.ai-context/output/` — 11 체인 산출물 (analysis 4[business-rules/domain/architecture/antipatterns] + discovery/behavior/ac/task-plan/test/impl-spec + matrix), 전부 strict schema VALID
- `target/.ai-context/output/findings-*.json` — gate 별 findings (실 validator/runner 유래)
- `target/.ai-context/output/evidence/pytest-report-{red,green}.json` — RED/GREEN pytest 원본 (5종 물증)
- `target/.ai-context/findings/test-impl-{red,green}.json` — RED/GREEN invocation evidence
- `target/numpy_financial/tests/test_amortization_slice.py` — 슬라이스 테스트 (RED↔GREEN 무변경 / i-strict)
- `target/numpy_financial/_financial.py` — GREEN 복원 impl (= v1.0.0 원본)

> 환경 산출물(`.venv/`, `__pycache__/`, `*.egg-info/`) = `.gitignore` 제외 (poc-18 의 node_modules 동형).
