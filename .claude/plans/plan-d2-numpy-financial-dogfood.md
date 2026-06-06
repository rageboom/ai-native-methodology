# [D2] §8.1 2번째 Modern 도메인 full-chain dogfood — PoC #19 (numpy-financial / Python)

## Context (왜)

[D2] = 인계 carry. poc-18(Express+Prisma+Vitest / blog·post 도메인)이 chain-driver **상태머신**을 외부 OSS에서 analysis(#0)→implement(#5) E2E로 돌린 **1번째** corroboration. 방법론 §8.1(단일 PoC 과적합 회피)상 ceiling/qualification claim 본체 격상은 **≥2 distinct problem-domain** 필요. 본 PoC #19 = **2번째 data point** — 상태머신 메커니즘 corroboration #2.

사용자 결단: **도메인 = 금융/핀테크 / 스택 = distinct Modern**.

## 환경 제약 → 스택·후보 확정 (실측)

- ❌ **Docker 미설치** → poc-18식 DB-backed integration test 불가 → **DB-free(순수 로직/단위테스트) 프로젝트 필수**.
- ❌ JDK·Gradle·Go·.NET 미설치 → Java/Spring 등 distinct Modern은 환경 부재로 **정직히 제외**(carry 아님 — 본 PC 불가).
- ✅ **Python 3.14.1 + pip 25.3 + venv + PyPI reachable** = 유일 가용 distinct Modern 스택 (poc-18 Node/TS와 distinct).
- ✅ **feasibility 실측 완료** (research + 직접 검증): `numpy-financial v1.0.0`(BSD-3 / 순수 Python) clone → venv → `pip install -e` → **`pytest` 26 passed in 0.79s** (numpy 2.4.6 cp314 / pytest 9.0.3 / DB·Docker·네트워크 불요). **baseline GREEN 입증됨**.
- ⚠️ 함정 회피: HEAD(main)는 Cython `_cfinancial.pyx`+meson로 이전됨(C컴파일러 필요) → **v1.0.0 태그(순수 Python)로 pin** (poc-18도 upstream HEAD pin 선례).

## 대상 (확정)

| 항목 | 값 |
| --- | --- |
| repo | `github.com/numpy/numpy-financial` |
| pin | **tag `v1.0.0`** (commit 247aa4e2 / 순수 Python / Cython 이전 前) |
| stack | **Python 3.14 + pytest 9 + numpy 2.4.6** (distinct vs poc-18 Node/TS) |
| 도메인 | **금융 — time-value-of-money** (fv/pv/pmt/nper/ipmt/ppmt/rate/irr/npv/mirr 10 함수 / blog·post와 distinct) |
| LICENSE | BSD 3-Clause (LICENSE.txt 확인) |
| 슬라이스(chain 증분) | **대출 상환 family: `pmt`/`ipmt`/`ppmt`** (periodic payment·이자분·원금분 = "loan amortization" use-case / test_pmt·test_ipmt·test_ppmt + decimal 변형 = 결정론 테스트). *fallback 슬라이스 = `npv`/`irr`* |

## 작업 (chain-driver 상태머신 6 stage E2E — poc-18 §2 절차의 Python·DB-free 변형)

> 산출물 위치 = `plugins/context-ops/examples/poc-19-numpy-financial-python/target/.aimd/` (poc-18 동형 / `.venv`·`__pycache__`·`*.egg-info` = .gitignore).

1. **셋업**: scratch의 검증된 clone을 poc-19 `target/`으로 이관 + venv + `pip install -e target pytest`. baseline `pytest` green 재확인 + manifest(`analysis_refs.artifacts` 경로 맵) 작성.
2. **#0 analysis** (repo 전체 reverse-engineer): business-rules(금융 공식 — 예 `pmt`: `pmt*((1+r)^n-1)/r + pv*(1+r)^n + fv = 0`), domain(entity=CashFlow/Loan·use_case=함수), antipatterns. **db-schema·openapi = N/A(정당화)** — DB·HTTP API 없음(순수 계산 lib / poc-18의 일부 N/A 선례 동형 / honest scope). `findings-aggregator --stage analysis` → `chain-driver next --findings` → gate #0(soft).
3. **#1 discovery**: `pmt/ipmt/ppmt` 슬라이스를 UC로 분해 → discovery-spec. gate #1.
4. **#2 spec**: behavior-spec + acceptance-criteria(given rate/nper/pv → expected payment, 알려진 수치) + 산출물 통합. gate #2.
5. **#3 plan**: task 분해 / 의존성 / NFR / risk → task-plan. gate #3.
6. **#4 test (RED 의무)**: 슬라이스 impl을 stub(`raise NotImplementedError`)으로 비움 → **실 pytest 실행** → 해당 test FAIL(genuine RED / 0 pass). test-spec + spec-test-link(AC→TC). gate #4.
7. **#5 implement (GREEN)**: impl 재생성 → **실 pytest** → 슬라이스 100% pass(GREEN). result_hash RED≠GREEN(진짜 상태변화) + test 파일 미변경(i-strict 증명: delta=impl뿐). traceability-matrix. gate #5 terminal.
8. **산출물 정직 표기**: AXIS 1(gate pass-through %) / AXIS 2(§3-A provenance — **rate 미측정 / ceiling claim ❌**, poc-18 §3 동형) 분리. simulated_evidence_count=0.
9. **README.md** (poc-18 동형: 대상/재현/AXIS/RED-GREEN/finding/위치) + **§8.1 명시**: "2번째 distinct problem-domain(금융 / Python) corroboration — poc-18(blog/Node)과 함께 ≥2 충족. 단 2 data point가 paradigm-wide ceiling 자동 확정은 아님 — 메커니즘 corroboration".

## 정직 경계 / 예상 한계 (미리 명시)

- 순수 함수 lib → **db-schema·openapi N/A**(CRUD/REST 없음). 5 이식성 산출물 중 3종(BR·domain·antipatterns)만 적용 = honest N/A (poc-18은 5/5 / 본 PoC는 도메인 특성상 3/5). **이것이 "2번째 distinct"의 본질** — 다른 산출물 프로파일도 상태머신이 처리함을 입증.
- §3-A 추출률 = poc-18처럼 **미측정**(독립 ground-truth·누락 귀속 부재) — provenance breakdown만 사실 기록.
- 본체(methodology) 코드는 **무변경 원칙** — dogfood가 본체 결함(F1~F8류) 노출 시 finding으로 기록만(별도 fix는 사용자 결단). poc-18에서 이미 F1/F2/F4 fix됨 → 본 PoC는 그 fix 위에서 더 깨끗할 것으로 예상(회귀 검출 가치).
- 본 PoC가 노출하는 신규 finding(Python·함수형 특유 / 예: analysis 추출기가 ORM/route 가정 시 함수형 lib에서 빈 산출물?) = 진짜 dogfood 가치.

## 검증 (end-to-end)

1. **chain-driver state.json** = current_chain=implement / last_gate=#5 (terminal 도달).
2. **genuine RED→GREEN**: RED pytest 출력(슬라이스 fail) + GREEN pytest 출력(슬라이스 pass) 양쪽 evidence 파일(stdout/stderr/report) 보존 + result_hash 상이.
3. **전 산출물 strict schema VALID**: `schema-validator`로 .aimd/output/* 전수 검증.
4. **본체 회귀 무영향**: `node plugins/context-ops/scripts/release-readiness.js --target v0.1.0` = **40/40 유지** (본 PoC는 examples/ 추가일 뿐 본체 무변경).
5. **i-strict**: test 파일 RED↔GREEN diff = 0 (impl만 변경).

## 산출물 / 커밋

- 신규 `plugins/context-ops/examples/poc-19-numpy-financial-python/` (README + target/ 소스 + .aimd 산출물 + .gitignore).
- STATUS.md [D2] → RESOLVED(2nd distinct domain corroborated) + 인계 carry 갱신.
- DEC 또는 CHANGELOG[0.1.x] 기록 + poc-18 README §8.1 상호참조(≥2 충족).
- 커밋 = 사용자 결단(branch 여부 포함). GHE push는 [ops] carry(VPN) 동반 가능.

## 일괄 승인 대상 핵심 결정 5종

1. 대상 = numpy-financial v1.0.0 (Python / 금융 TVM) — feasibility 실측 green ✅
2. 슬라이스 = pmt/ipmt/ppmt (loan amortization) / fallback npv·irr
3. db-schema·openapi = N/A(정당화) 수용 (3/5 산출물 프로파일)
4. 본체 무변경 + 신규 finding은 기록만(fix는 별도 결단)
5. PoC #19 신규 디렉토리 + STATUS/CHANGELOG 갱신, 커밋 시점은 추후 결단
