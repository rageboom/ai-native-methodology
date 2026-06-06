# DEC-2026-05-30-phase-flow-drift-false-positive

**결단**: `drift-validator flows` directory mode 의 `analysis.phase-flow.mermaid` **4 breaking 오탐** 정리 (CRLF 주석 누출 + 횡단 메타 노드). validator 로직만 수정 (mermaid/json 산출물 본문 무변경) + RED→GREEN 회귀 test. v11.10.1 PATCH.

**작성일**: 2026-05-30 (greenfield Slice 2 release 직후 사용자 "poc-findings drift 정리해줘").

**relates to**:

- `DEC-2026-05-27-v11-discovery-spec-cascade-완결.md` (v11.1.0 compare-phase-flow 신설 / "flows 5/5 0 breaking" 기재처)
- `DEC-2026-05-30-use-scenario-greenfield-bootstrap-slice2.md` §6 (별건 관찰로 등록)

---

## 1. 배경 — 4 breaking 오탐

`drift-validator flows` 가 `analysis.phase-flow.mermaid` 에서 4 breaking(`artifact.mermaid-not-in-json`): `phase-flow.json` / `poc-findings.md` / `INDEX.md` / `STATUS.md`. 모두 phase data-contract 산출물 아님 (이중 렌더링 SSOT 계약 대상 아님). v11.1.0 이 "flows 5/5 0 breaking" 기재했으나 이후 표면화 = regression (corpus-frozen 미표면화 / LL-dep-graph-02 동형).

## 2. Root cause 2종

### (a) CRLF 주석 누출

`normalize-phase-flow.js` `stripComment = (line) => line.replace(/%%.*$/, '')`. **JS 정규식 `.` 는 `\r` 을 매치하지 않고**, `m` flag 없는 `$` 는 trailing `\r` 앞에서 매치하지 않음. → CRLF 파일에서 `%%...phase-flow.json...\r` 라인의 `%%` 주석이 **전혀 제거되지 않아** 주석 내용(`phase-flow.json`)이 artifact 스캔에 누출. (mermaid line 3 = `%% AI 눈 짝: phase-flow.json`.)

### (b) 횡단(cross-cutting) 메타 노드

mermaid line 96~97 = `CC_FIND["findings/poc-findings.md…"]` + `CC_DEC["decisions/… INDEX.md / STATUS.md"]` = finding-system / decisions 로그 횡단 노드 (주석 아님 / 실 노드 라벨). phase 산출물 아니나 artifact 스캔이 파일명 추출.

## 3. 시행 (validator 로직만 / breaking 0)

| 영역                                                              | 변경                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tools/drift-validator/src/normalize-phase-flow.js`               | ① `text.split('\n')` → `split(/\r?\n/)` (`normalizePhaseFlow` + `detectPhaseFlowMermaid` / CRLF-safe — `\r` 제거로 stripComment 정상 작동) ② `NON_DELIVERABLE_META` 제외 집합 신설 (`phase-flow.json`/`poc-findings.md`/`findings.md`/`index.md`/`status.md` / `extractArtifactFiles` 에서 `META_FILE_RE` 와 함께 필터). |
| `tools/drift-validator/test/compare-phase-flow-artifacts.test.js` | +2 회귀 test — (1) CRLF `%%` 주석 내 파일명 false positive 제외 (2) 횡단 메타 노드 false positive 제외. 4→**6 test**.                                                                                                                                                                                                    |
| `tools/drift-validator/package.json`                              | **test script 에 `compare-phase-flow-artifacts.test.js` 추가** — v11.1.0 신설 이후 **orphaned (미등록 → CI 미실행)** 발견. v11.1.0 의 4 회귀 test 가 실제로는 안 돌고 있었음 (count 정정: drift-validator 71→**77** / 4 미실행 + 2 신규).                                                                                |

**핵심**: mermaid/json 산출물 **본문 무변경** — 횡단 노드·주석은 정당한 문서. validator 의 검출 의도(phase 산출물 rename drift)는 그대로 보존 (진짜 rename drift = 여전히 breaking / 기존 4 test green).

## 4. STOP-3

- drift-validator test 71 → **77** (compare-phase-flow-artifacts 4→6 + orphaned test 파일 wiring) ✅
- `drift-validator flows` 5/5 파일 **0 breaking** ✅ (was analysis 4 breaking)
- workspace test 847 → **853 (+6)** ✅ (4 미실행 + 2 신규)
- release-readiness **22/22 ready** ✅ (layout/chain-layout 0 orphan 보존)
- skill-citation **0 stale**
- version 3-way **11.10.1**
- breaking **0** (validator 로직 정밀화 / 검출력 보존) = PATCH

## 5. Lessons Learned

### LL-pf-fp-01 — CRLF 정규식 함정 (`.` 와 `$` 는 `\r` 을 모른다)

`/%%.*$/` 류 라인 처리 정규식은 CRLF 파일에서 조용히 실패한다 (`.` ≠ `\r` / `$` ≠ before-`\r`). 라인 분할 시 `split(/\r?\n/)` 로 `\r` 을 먼저 제거하는 것이 근본 해법 (개별 정규식마다 `\r` 처리하는 것보다 안전). Windows 작성 파일 검증 도구의 공통 함정.

### LL-pf-fp-02 — "0 breaking" 간판은 corpus 가 frozen 이면 regression 을 숨긴다

v11.1.0 "flows 5/5 0 breaking" 기재 ↔ 이후 4 breaking = corpus(mermaid) 가 그 사이 CRLF/횡단노드를 얻었으나 release-readiness 가 `flows` directory drift 를 gate 하지 않아 미표면화. release ceremony 의 "0 breaking" 주장은 그 시점 실측이어야 하며, 비-gate 검사의 회귀는 별 cycle 에 잡힌다 (LL-dep-graph-02 / LL-v111-01 동형). 본 정리로 `flows` 0 breaking 실측 복구.

### LL-pf-fp-03 — orphaned test 파일 (작성됐으나 test script 미등록 → CI 미실행)

v11.1.0 의 `compare-phase-flow-artifacts.test.js` (4 회귀 test)가 drift-validator `package.json` test script 의 명시적 파일 리스트에 누락되어 **신설 이후 한 번도 CI 에서 실행되지 않음**. "회귀 test 신설" 의 가치는 그것이 실제로 도는지(test runner glob/리스트 등록)까지 확인해야 실현된다. 명시적 파일 리스트 방식 test script(`node --test a.js b.js …`)는 신규 test 파일 누락이 silent — `test/*.test.js` glob 또는 신규 파일 추가 시 리스트 갱신 의무. 본 release 에서 wiring (drift-validator 71→77).

## 6. carry

- (선택) `drift-validator flows` directory mode 를 release-readiness gate 후보로 승격 검토 — 현재 비-gate라 회귀 미표면화. Type 2 외부 사용자 자연 trigger 의무 (성급한 gate 추가 회피).

## 7. 한 줄 결론

> `drift-validator flows` 4 breaking 오탐 = CRLF 주석 누출(`split(/\r?\n/)`) + 횡단 메타 노드(`NON_DELIVERABLE_META` 제외). mermaid/json 본문 무변경 / RED→GREEN +2 test / 검출력 보존. flows 0 breaking 실측 복구. v11.10.1 PATCH.
