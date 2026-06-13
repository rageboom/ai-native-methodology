# DEC-2026-06-13 — validator stdout truncation 수정 (systemic): process.exit before flush → 대형 레거시 게이트 침묵 차단 해소

- **일자**: 2026-06-13 (본체 PATCH v0.43.1 / 버그 수정 — API·스키마·exit-code·출력내용 무변)
- **카테고리**: 본체 결함 수정 (게이트 correctness / dogfood-found tool bug) — 16 validator/tool stdout 동기-flush
- **상태**: 승인·시행 (사용자[TF Lead] "지금 fix (권장)" — WLFR 통합이 노출한 본체 버그 / 4원칙 3 승인)
- **관련**: `DEC-2026-06-13-reqmng-shared-rollup-integration`·`DEC-2026-06-13-wlfr-shared-rollup-integration`(노출 컨텍스트) · `DEC-2026-06-06-analysis-exit-gate`(게이트) · `DEC-2026-06-12-golf-chain-validator-wiring`(직전 dogfood-found validator fix 선례) · memory `feedback_self_recorded_fact_validation`·`feedback_diagnose_before_design_check_existing`·`feedback_quality_priority`·`feedback_strict_exposes_drift`·`feedback_chain_driver_deterministic_axis`

---

## 1. 배경 (WLFR 규모가 노출)

ep-be-gea campaign 복지(BC-WLFR / 125 BR / 누적 489 rules) shared 카탈로그 통합 후 analysis exit-gate#0 실행 시 **br-cross-consistency-validator 가 `status='error'` + 허위 critical** 로 떨어짐. 직전 reqmng(364 rules) 게이트에서는 br-cross 가 `pass`(0.935) 였음 = **규모 임계에서 처음 발현**.

## 2. 진단 (diagnose-before-design / 결정론 재현)

- br-cross **내용은 정상**: 파일 redirect(`> out.json`) 직접 실행 = 완전 valid JSON(69KB / gate_status=`pass` / overall_score **0.942** ≥ 0.85 / 190 findings). → 게이트 "error"는 내용 결함 아님.
- 게이트(`findings-aggregator`)는 `execFileSync('node', [validator, '--json'])` 로 validator stdout 을 **파이프** 캡처 후 `JSON.parse`.
- 검증기는 `console.log(JSON.stringify(result, null, 2))` 직후 `process.exit(N)` 호출. 출력이 **파이프 커널 버퍼(~64KB)** 를 넘으면 console.log/process.stdout.write 가 비동기가 되고, `process.exit()` 이 flush 전에 프로세스를 종료 → 파이프 소비자가 **truncation 된 JSON** 수신.
- **결정론 재현**: execFileSync 2회 모두 정확히 **position 56855 에서 mid-multibyte(한글) truncation** → JSON.parse 실패 → aggregator `catch` → `status='error'` + `findings.critical += 1`. 파일 write 는 동기라 멀쩡 = **파이프 소비자(게이트) 한정** 결정론 버그.
- **scope = systemic**: `console.log(JSON.stringify(…))+process.exit([0-9])` 패턴이 **16 validator/tool** 에 동일 존재(analysis 게이트 6: br-cross·schema·decision-table·analysis-extraction·characterization-coverage·sql-inventory + 타 stage/standalone 10: graph-integrity·code-pointer·drift·spec-test-link·discovery-extraction·test-impl-pass·db-assets·context-federator·adopter-evidence-packager·inflation-lint). 나머지 15개는 출력<64KB 라 잠복 — **더 큰 BC/코퍼스에서 동일 차단**(방법론 게이트 = 대형 레거시 = 타깃).

## 3. 결정 (fix)

- 신규 `tools/_shared/write-stdout-sync.js` — `writeStdoutSync(text)`: fd 1 에 `fs.writeSync` 로 **blocking write**(EAGAIN 재시도 = non-blocking 파이프 가득 시 리더 drain 후 재시도)하여 완전 flush 후 반환. 이어지는 `process.exit(N)` 은 데이터가 이미 다 쓰인 뒤라 안전.
- 16 tool 의 JSON 출력 경로 `console.log(JSON.stringify(…))` → `writeStdoutSync(JSON.stringify(…))` 일괄 교체. **exit-code 의미·출력 내용 무변**(flush 타이밍만 결정론화) → backward-compat / breaking 0 / additive.
- 회귀 가드: `br-cross-consistency-validator/test/stdout-flush-regression.test.js` 2건 — 대용량(>64KB / 수백 KB) + 멀티바이트(한글 경계) 페이로드를 `writeStdoutSync` 로 쓴 뒤 즉시 `process.exit(0)` → execFileSync 파이프 캡처가 **완전·끝까지·parse 성공** 단언(과거 console.log+exit 였다면 truncation).

## 4. 근거 / 규율

- **dogfood-found tool bug 즉시 수정 선례**(`DEC-2026-06-12-golf-chain-validator-wiring` = golf 풀런이 노출한 3 validator wiring fix). 본 건은 동류 — campaign 이 본체 결함을 노출·수정.
- **§8.1 과적합 회피**: 1 datapoint(WLFR br-cross)이지만 **structural pattern**(16 tool 동일 코드 패턴 / grep 확인)이라 class 전체 수정이 정당(단일 PoC 천장수치 주장 아님 / 버그 class 일소).
- **`feedback_self_recorded_fact_validation`**: 게이트 "error"를 액면 수용(WLFR 내용 결함으로 오귀착) ❌ → 파일 redirect 직접 실행으로 내용 pass(0.942) 실측 + execFileSync 재현으로 truncation 확정 후 수정.
- **`feedback_chain_driver_deterministic_axis` 무위반**: 출력 메커니즘(flush)만 결정론화 / 게이트 판정 로직·findings shape·exit-code 의미 무접촉.
- **품질 1순위 / 재작업 최소화**: 6 게이트 validator 만 고치면 나머지 10개 잠복 버그가 후속 재작업 → class 전체(16) 일괄.

## 5. 검증 (실측)

- br-cross **34 tests pass**(회귀 2 포함). 16 tool 전부 syntax-valid + npm test 통과.
- execFileSync(게이트 방식) br-cross 캡처 = **완전 valid JSON**(parse ok / gate pass / score 0.942 / 190 findings).
- release-readiness **42/42**(workspace test #11 = 16 tool 테스트 포함 통과 / readme·CLAUDE.md ↔ plugin.json v0.43.1 sync).

## 6. carry / 다음

- WLFR analysis exit-gate#0 의 나머지 신호(선재 biztrip/eaprv `_catalog-fragment` analysis-extraction 7 critical / WLFR characterization coverage c1/h2)는 본 fix 와 무관 — 별도(WLFR DEC §선재/carry).
- 잠재: 비-게이트 경로(사용자 직접 validator 파이프)도 동일 fix 수혜. 16 tool 외 신규 tool 도 `writeStdoutSync` 규약 적용 권장(authoring-spec 후속 명문화 후보 / 현 미강제).

> **보안**: 본 DEC = 방법론 본체 결함/수정 기술만 / 사내 식별자 0(WLFR·489 BR = 마스킹 codename·count). 노출 컨텍스트 산출물은 ep-be-gea GHE only.
