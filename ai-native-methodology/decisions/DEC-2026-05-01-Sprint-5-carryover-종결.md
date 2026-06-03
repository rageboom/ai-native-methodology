# DEC-2026-05-01-Sprint-5-carryover-종결

> **카테고리**: methodology / poc-tooling / 본체 도구 quality 격상 (BE Sprint 5+ carry-over 환경 무관 부분)
> **상태**: 승인 ( Sprint 5 carry-over 환경 무관 부분 종결 / drift-validator v0.1.0 → v0.2.0 / 3 도구 unit test 53/53 pass / 본체 phase-flow drift 0 자가 입증)
> **일자**: 2026-05-01

---

## 1. 결단

본 결단은 BE Sprint 5+ carry-over (환경 무관 부분) 의 정식 종결.

### 1.1 트리거

v1.4 FE 트랙 휴면 결단 (사용자 명시) → BE 본체 도구 quality 격상 마무리. DEC-A (drift-validator quality boost) §4 의 carry-over 항목 (corpus 14→20쌍 / phase-flow 비교기 / ADR-010 baseline mode wrapper) 환경 무관 부분 일괄 종결.

### 1.2 결단 패턴

- 4원칙 4단계 (실패 시 Revert) 미발동 — Phase 단위 commit 정상 진행 (4 commit + 본 메타).
- 옵션 X 채택 — Sprint 4/5 누적 자료 + ADR-010 + DEC-A 자료 충분. 새 research 불요.
- 환경 무관 부분 100% 종결 — 환경 의존 부분 (Semgrep/PMD/OSV 진짜 실행) 만 carry 유지.

---

## 2. 산출물

### 2.1 plan (Phase 0)

- plan-be-sprint-5-plus-carryover.md (.claude/plans/) — 4원칙 1번 산출 + 5 핵심 결정 일괄 승인 후 진입

### 2.2 Phase A (corpus 14 → 19쌍 / 21 self-test)

| #   | 짝                                   | 종류                                               |
| --- | ------------------------------------ | -------------------------------------------------- |
| 1   | state-machine-equiv-04-multi-trigger | equiv (다중 event 단일 state)                      |
| 2   | state-machine-drift-04-extra-event   | drift (mermaid 누락 transition)                    |
| 3   | sequence-equiv-04-multi-actor        | equiv (4 actor / 6 message 양방향)                 |
| 4   | sequence-drift-04-extra-message      | drift (mermaid 누락 message — verify-token 사이클) |
| 5   | state-map-fe-equiv-02-form           | equiv (FE form_state 5진실 #4)                     |
| 6   | state-map-fe-drift-01-missing-error  | drift (FE state 누락 — timedOut)                   |

→ commit `7b9d4b2` (14 file / +437 / -2 / 21/21 test pass).

### 2.3 Phase B (drift-validator phase-flow 비교기 신설)

| #   | 산출                                              | 종류                                                                                          |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | src/normalize-phase-flow.js                       | **신설** (JSON phases/depends_on → 정규형 / mermaid flowchart+subgraph P{X}+외부 edge → 동일) |
| 2   | src/compare-phase-flow.js                         | **신설** (4 dimension — phase/dependency × missing/extra)                                     |
| 3   | src/normalize-json.js / normalize-mermaid.js      | **확장** (phase-flow 시그니처 detect)                                                         |
| 4   | src/cli.js                                        | **확장** (phase-flow 분기 추가)                                                               |
| 5   | corpus phase-flow-equiv-01 / drift-01-missing-dep | **신설** (2쌍)                                                                                |
| 6   | corpus.test.js                                    | **확장** (4 신규 test)                                                                        |

**본체 phase-flow.json + phase-flow.mermaid 짝 자가 검증 → 0 breaking / 0 non-breaking / 0 info ✅**.

→ commit `1ab6d14` (10 file / +316 / 25/25 test pass).

### 2.4 Phase C (baseline.js 공용 이동 + DTV 통합)

| #   | 산출                                                 | 종류                                                                           |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | tools/\_shared/baseline.js                           | **신설** (공용 모듈 / DTV finding 호환 필드 보강 — column_index / file / line) |
| 2   | tools/drift-validator/src/baseline.js                | **이동** (re-export shim / backward-compat)                                    |
| 3   | tools/decision-table-validator/src/cli.js            | **갱신** (import path → ../../\_shared/baseline.js)                            |
| 4   | tools/decision-table-validator/test/baseline.test.js | **신설** (DTV finding 호환 회귀 4 test)                                        |
| 5   | drift-validator package.json                         | **갱신** ( v0.1.0 → **v0.2.0** + scripts.test 정비)                            |
| 6   | DTV package.json                                     | **갱신** (scripts.test 정비)                                                   |

→ commit `8545e47` (6 file / +203 / -112 / drift 33 + DTV 11 = 44 test pass).

### 2.5 Phase D (static-runner SARIF→finding 어댑터 + baseline-ratchet)

| #   | 산출                       | 종류                                                                                                                 |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | src/sarif-to-finding.js    | **신설** (SARIF 2.1.0 result → standardized finding / level→severity 매핑 / message slice 500)                       |
| 2   | src/cli.js                 | **확장** (--baseline / --ratchet / --write-baseline / SARIF 어댑터 호출 / evidence manifest 에 baseline_report 추가) |
| 3   | test/baseline-mode.test.js | **신설** (fixture SARIF 5 test)                                                                                      |
| 4   | package.json               | **갱신** (scripts.test 정비)                                                                                         |

→ commit `f82e6fa` (4 file / +209 / -4 / runner 4 + baseline-mode 5 = 9 test pass).

### 2.6 Phase F (메타 — 본 결단)

| F#  | 항목                                                |
| --- | --------------------------------------------------- |
| F1  | DEC-2026-05-01-Sprint-5-carryover-종결.md (본 파일) |
| F2  | STATUS.md                                           |
| F3  | INDEX.md                                            |
| F4  | CHANGELOG.md                                        |
| F5  | memory `project_be_tools_v02.md` 신설               |
| F6  | commit                                              |

---

## 3. 정량 결과

### 3.1 도구 quality 격상

| 도구                          | 보강 전         | 보강 후 ✅                                                |
| ----------------------------- | --------------- | --------------------------------------------------------- |
| drift-validator version       | v0.1.0          | **v0.2.0**                                                |
| drift-validator corpus        | 14쌍            | 19쌍 (+5 / state-machine 8 + sequence 8 + state-map-fe 3) |
| drift-validator self-test     | 15 test         | **25 test** (+10 / corpus 21 + detect 4)                  |
| drift-validator baseline-test | 8 test          | 8 test (회귀 0)                                           |
| **drift-validator total**     | 23 test         | **33 test**                                               |
| decision-table-validator      | 7 test (dmn)    | **11 test** (+4 baseline)                                 |
| static-runner                 | 4 test (runner) | **9 test** (+5 baseline-mode)                             |
| ** 3 도구 합계**              | 34 test         | **53 test** ✅                                            |

### 3.2 본체 SSOT 자가 검증 ( 핵심 quality 격상)

```
$ node tools/drift-validator/src/cli.js methodology-spec/workflow/phase-flow.json
drift-validator — 1 pair(s) compared
  breaking: 0  non-breaking: 0  info: 0  errors: 0
[phase-flow] methodology-spec\workflow\phase-flow.json
  0 breaking / 0 non-breaking / 0 info
```

→ 본체 phase-flow (AI 눈 + 사람 눈) 정합도 **drift 0** 입증. v1.4 quality 격상 강한 데이터.

### 3.3 ADR-010 §2.5 정합 도달

| 도구                     | 단계                                 | baseline 통합                          |
| ------------------------ | ------------------------------------ | -------------------------------------- |
| drift-validator          | ADR-009 §2.1 단계 3 (자동 검증)      | ✅                                     |
| decision-table-validator | ADR-009 §2.1 단계 3                  | ✅                                     |
| static-runner            | ADR-009 §2.1 단계 5 (진짜 외부 도구) | ✅ ( 진짜 실행 자체는 환경 의존 carry) |

→ 3 도구 모두 baseline + ratchet 정식 통합 ✅.

---

## 4. Sprint 5 carry-over 진척 (DEC-A §4 갱신)

| Sprint 5 항목                           | DEC-A 진척      | Sprint 5+ 종결 진척              |
| --------------------------------------- | --------------- | -------------------------------- |
| F-154 transitionFuzzyMatch              | ✅ 종결 (DEC-A) | ✅ 유지                          |
| F-155 sequence 변종 화살표              | ✅ 종결 (DEC-A) | ✅ 유지                          |
| corpus 4쌍 → 20쌍                       | 🟡 70% (14/20)  | **95% (19/20)** — 1쌍 여유       |
| **drift-validator phase-flow 비교기**   | ❌ 미진행       | ✅ **종결** ( 본체 자가 입증)    |
| **ADR-010 baseline + ratchet 도구화**   | ⏳ ADR 만       | ✅ **종결** (3 도구 통합)        |
| **drift-validator v0.2.0 격상**         | 후보            | ✅ **공식 격상**                 |
| 진짜 static tool (Semgrep/PMD) 1회 실행 | ⏳ 환경 부재    | ⏳ 환경 부재 ( 본 plan scope 외) |

→ **환경 무관 부분 100% 종결** + 환경 의존 부분 단 1건만 carry.

---

## 5. 사용자 7 요구사항

| 요구       | 영향                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| 모두 (1~7) | 100% 유지 (직접 영향 0 — 본 carry-over 는 본체 도구 quality 격상 영역) |

### 5.1 요구 1 (산출물 → 마이그+테스트 기반) 간접 강화

- baseline + ratchet 통합으로 **사내 도입 시점에 즉시 적용 가능** (legacy 결함 폭증 risk 회피)
- phase-flow 비교기로 **본체 진화 시 SSOT drift 자동 검출**

---

## 6. 정직 표기

- ✅ 시뮬 0건 — 모두 결정적 알고리즘 (regex parsing / set 비교 / sha256 fingerprint)
- ✅ no-simulation 정책 정합 — drift-validator / DTV 의 AI 추론 0% 유지 / static-runner 도 SARIF 파일 (진짜 도구 산출) 만 처리
- ✅ unit test 회귀 100% (53/53 pass)
- ✅ 본체 phase-flow 자가 검증 — drift 0 입증
- ⏳ 진짜 Semgrep/PMD 실행 = 환경 의존 carry 유지 ( Sprint 5 의 마지막 1 항목)
- ⏳ vacuum / openapi-changes 외부 도구 통합 = 별도 작업 carry 유지

---

## 7. 후속

```
Sprint 5+ carry-over 환경 무관 부분 종결 ( 본 결단)
   ↓
   ├─ Sprint 6 ( 환경 의존)
   │  - Semgrep/PMD/OSV-Scanner 진짜 실행 1회 + baseline 등재 시연
   │  - vacuum / openapi-changes 외부 도구 통합 (별도)
   │  - 신뢰도 85-92% → 90-95% 도달 (ADR-009 단계 5)
   │
   ├─ v1.4 FE 트랙 ( 사용자 휴면 — 환경 준비 후)
   │  - Stage 4 mini-PoC / Stage 5 본격 PoC #04
   │  - drift-validator v0.2.0 의 phase-flow 비교기 + corpus 21쌍 = FE PoC #04 입력 강화
   │
   └─ v1.4.0 MINOR release (Stage 7)
```

---

## 8. 종결 진술

> Sprint 5 carry-over 환경 무관 부분 종결 — drift-validator v0.1.0 → **v0.2.0** 격상.
> corpus 14쌍 → **19쌍** (+5) / self-test 15 → **25** (+10) / 3 도구 unit test 합계 **53/53 pass** ✅.
> phase-flow 비교기 신설 — 본체 phase-flow 자가 검증 0 drift 입증 (v1.4 quality 격상 강한 데이터).
> ADR-010 §2.5 정합 도달 — drift / DTV / static-runner 3 도구 baseline + ratchet 통합.
> tools/\_shared/baseline.js 공용 이동 — 결합도 ↓ / 일관 적용.
> 환경 의존 부분 ( Sprint 6) — Semgrep/PMD/OSV 진짜 실행 1회 + vacuum/openapi-changes 외부 도구 통합 = carry 유지.
> 다음 trigger = 사용자 환경 준비 (Java + Semgrep + PMD) 또는 v1.4 FE 트랙 Stage 4 mini-PoC 진입.

**End of Sprint 5+ carry-over 종결 DEC.**
