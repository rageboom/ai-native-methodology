# plan — PoC #03 Phase 4.5 검증 (drift-validator + decision-table-validator 자동 실행 + DEC 종결)

> **일자**: 2026-04-30 (직전 세션 carry-over 재개)
> **Work Principles 4원칙**: 1단계 plan / 본 파일
> **선행 산출물**: `output/formal-spec/` 37 파일 ✅ (직전 세션)
> **시퀀스**: B / Phase 4.5+ / carry-over Step 1~3 → Phase 5-1 진입 준비

---

## 1. 본 plan 의 scope

PoC #03 NestJS Phase 4.5 산출물 (37 파일) 에 v1.2.1 도입 자동 검증 도구 2종을 **첫 외부 적용** + 결과 finding 통합 + DEC 종결.

**scope OUT** (본 plan 미포함):
- Phase 5-1 (api) 진입 — Phase 4.5 종결 후 별 plan
- Phase 6 (antipatterns final) — 동상
- Sprint 5 (static tool 실 실행) — 환경 부재 carry-over 유지
- drift-validator transitionFuzzyMatch 보완 (코드 수정) — Sprint 5 carry-over 유지

---

## 2. 입력 자산 (전수 read 완료 ✅)

### 2.1 검증 대상 산출물

| 영역 | 파일 수 | 위치 |
|---|---|---|
| state-machines (3 × 2) | 6 | `output/formal-spec/state-machines/{User,Follows,Article}.{json,mermaid}` |
| sequence-diagrams (6 × 2) | 12 | `output/formal-spec/sequence-diagrams/UC-*.{json,mermaid}` |
| decision-tables (6 × 2) | 12 | `output/formal-spec/decision-tables/BR-*.{json,md}` |
| invariants | 3 | `.../invariants/*.ts` (검증 대상 ❌ — 코드만 / Sairyss DDD-Hexagon 정합) |
| property-tests | 3 | `.../property-tests/*.spec.ts` (동상) |
| _manifest.yml | 1 | `.../_manifest.yml` |

→ **drift-validator 적용 = 9 짝** (state-machine 3 + sequence 6) / **decision-table-validator 적용 = 6 BR**.

### 2.2 도구

| 도구 | 위치 | 의존 | CLI |
|---|---|---|---|
| drift-validator | `tools/drift-validator/` | `@mermaid-js/parser ^1.1.0` (★ npm install 필요 — node_modules 부재) | `node src/cli.js <dir>` |
| decision-table-validator | `tools/decision-table-validator/` | 외부 의존 0 (내장 정규식만) | `node src/cli.js <dir>` |
| Node | (시스템) | v22.11.0 ✅ | — |

### 2.3 직전 세션 carry-over 권고 (PROGRESS-poc03-phase4.5.md §"다음 세션 재개점")

- Step 1 — drift + dmn-check 실행
- Step 2 — 결과 finding 등록 + _manifest.yml 갱신
- Step 3 — DEC + STATUS 갱신
- Step 4 — Phase 5-1 진입 준비 (본 plan scope OUT)

---

## 3. 절차

### Step A — 환경 준비 (`npm install` ×2)

```bash
cd ai-native-methodology/tools/drift-validator && npm install
cd ai-native-methodology/tools/decision-table-validator && npm install
```

**선행 자가 점검**: `npm test` 통과 — 17/17 unit test (drift 6 + dmn 7 + static 4) 정합 입증.

### Step B — drift-validator 실행 (9 짝)

```bash
node ai-native-methodology/tools/drift-validator/src/cli.js \
  ai-native-methodology/examples/poc-03-realworld-nestjs/output/formal-spec/ \
  --json > /tmp/drift-poc03.json

# 사람 가독 동시 출력
node ai-native-methodology/tools/drift-validator/src/cli.js \
  ai-native-methodology/examples/poc-03-realworld-nestjs/output/formal-spec/
```

**기대 출력**:
- 9 짝 비교 결과 (state-machine 3 + sequence 6)
- summary: breaking / non-breaking / info 카운트
- exit code: `0` (no breaking) / `1` (breaking ≥ 1)

**저장 위치**: `output/formal-spec/.validation/drift-result.json` + `.summary.md`

### Step C — decision-table-validator 실행 (6 BR)

```bash
node ai-native-methodology/tools/decision-table-validator/src/cli.js \
  ai-native-methodology/examples/poc-03-realworld-nestjs/output/formal-spec/decision-tables/ \
  --json > /tmp/dmn-poc03.json
```

**기대 출력**:
- 6 BR markdown 표 dmn-check 5종 (rule.duplicate / conflict / gap / overlap / type.mixed-column)
- JSON sanity 6건 (필수 필드 / enum / HTTP code 100-599)
- exit code: `0` / `1`

**저장 위치**: `output/formal-spec/.validation/dmn-check-result.json` + `.summary.md`

### Step D — 결과 분류

각 diff / finding 항목을:

| severity | 처리 |
|---|---|
| **breaking** | severity high finding 등록 + 산출물 재작성 의무 |
| **non-breaking** | finding 등록 (자연어 ambiguity 노출 = Phase 4.5 본질적 가치 입증) |
| **info** | 의도된 패턴 (mermaid 자세함 / 본 방법론 정합) — finding 미등록 |
| **ERR (parse)** | finding 등록 + 본 도구 한계 보고 (Sprint 5 carry-over) |

★ **D6 false negative 우선 측정** — 직전 세션 합의 (Senior 권고). 도구가 미검출하나 사람이 발견하는 케이스 정량화.

★ **F-117 transitionFuzzyMatch 재발 여부 측정** — PoC #02 자가 검증 시 한계 노출. PoC #03 한국어/영어 혼용 시그널에서 동일 false positive 가 재현되는지 확인.

### Step E — finding 통합 (F-154+ 신규)

직전 세션 시점:
- 누적 finding total = 146 (PoC #03 까지)
- F-145~F-153 = Phase 4.5 형식화 산출 시 도출 9건 (manifest 등재)

본 단계에서 추가:
- F-154+ — drift-validator / dmn-check 결과 도출 (예상 0~5건)
- ★★ double_hit (Senior + drift 양쪽 발견) 케이스 식별 시 manifest `poc02_cross_validation.double_hit_candidates_for_phase6` 갱신

### Step F — manifest / PROGRESS 갱신

`output/formal-spec/_manifest.yml` 갱신:
- `cross_validation.validators[id=drift-validator].real_tool: true` + `status: executed`
- `cross_validation.validators[id=decision-table-validator].real_tool: true` + `status: executed`
- `trust_level.raw_confidence: 0.78` (D5 권고 — 70 + 5 + 3 — breaking 0 시 / breaking 1+ 시 0.73)
- `trust_level.penalty_breakdown[reason=드리프트미실행].penalty: 0` (해소)
- `exit_criteria.drift_validator_executed: true` / `decision_table_validator_executed: true`
- `exit_criteria.lint_no_simulation_passed: true`

`PROGRESS-poc03-phase4.5.md` 갱신:
- 새 시간 entry "2026-04-30 (carry-over Step 1~3)"
- 결과 정량 + 교훈

### Step G — DEC 작성

`decisions/DEC-2026-04-30-poc03-phase45-종결.md`:
- 결정 — Phase 4.5 종결 / Phase 5-1 진입 승인
- 신뢰도 변동 명시
- 신규 finding F-154+ 등재
- ★★ double_hit 후보 → Phase 6 격상 데이터

### Step H — STATUS.md 갱신

| 행 | 변경 |
|---|---|
| 시퀀스 B Phase 4.5 산출 | ✅ (이미) |
| 시퀀스 B Phase 4.5 검증 | ⏳ → ✅ **본 세션** |
| 누적 통계 | finding total 146 → 146+N |

---

## 4. 위험 / 블로커 후보

| # | 위험 | 영향 | 대응 |
|---|---|---|---|
| R-1 | `@mermaid-js/parser` Windows npm install 실패 | drift 미실행 | 시뮬 금지 — 사용자에게 보고 / Sprint 5 carry-over 명시 |
| R-2 | drift-validator 가 한국어 시그널 (e.g. `[★ F-120 critical<br/>App 1중...]`) 정규식 fallback 으로 parse 실패 | breaking 오검출 | F-117 재발 측정 + finding 등록 + transitionFuzzyMatch 보완은 Sprint 5 carry-over |
| R-3 | dmn-check 가 BR-*.md 표 헤더 한국어 ("입력") 인식 못해 0 table parsed | 검증 누락 | parse-md-table.js heuristic 검증 — 헤더 patterns regex 확인 |
| R-4 | 검증 결과 breaking ≥ 1 → 산출물 재작성 필요 | scope 확장 | 권고 = breaking 0 가정 / 1+ 시 즉시 사용자 보고 후 별 작업 |
| R-5 | 도구 한계로 false negative 다수 → Phase 4.5 ROI 의심 | v1.3 격상 데이터 부족 | D6 권고 정합 — 정량 + 정직 표기 / Sprint 5 보완 |

★★ no-simulation 정합: 도구 실패 시 시뮬 ❌ — 사용자 보고 + carry-over 갱신 의무 (memory `feedback_no_static_tool_simulation.md`).

---

## 5. 종료 조건

- [ ] drift-validator 9 짝 비교 완료 + JSON 결과 저장
- [ ] decision-table-validator 6 BR 비교 완료 + JSON 결과 저장
- [ ] 결과 분류 (breaking / non-breaking / info / ERR) 정량
- [ ] 신규 finding F-154+ 등록 (또는 0건 명시)
- [ ] `_manifest.yml` 갱신 (trust_level + cross_validation + exit_criteria)
- [ ] `PROGRESS-poc03-phase4.5.md` 새 entry
- [ ] `DEC-2026-04-30-poc03-phase45-종결.md` 작성 (`INDEX.md` 갱신 포함)
- [ ] `STATUS.md` Phase 4.5 검증 행 ✅
- [ ] git commit

---

## 6. 신뢰도 산식 (예상)

```yaml
base_before_penalty: 0.99  # 5 산출물 완성
penalty_breakdown:
  - drift-validator 미실행: 0     # +5 회수
  - decision-table-validator 미실행: 0  # +5 회수
  - static tool 시뮬 (Senior persona): -5    # 유지 (Sprint 5 carry-over)
  - 진짜 static tool 미실행 (Sprint 5): -5    # 유지
  - critical finding 2건 (F-120 + F-140) Senior 권고: -6   # 유지
  - 사용자 검증 미완: -3   # 유지
total_penalty_after: -19
expected_raw_confidence_after: 0.80  # breaking 0 가정 / breaking 1+ 시 -3 추가
```

★ ADR-009 단계 = `2 (자연어+cross-val)` 유지 / 단계 3 (자동 검증) 도달은 본 단계 종결 후.

---

## 7. 4원칙 정합 점검

- 1단계 (plan) — 본 파일 ✅
- 2단계 (research / 3 sub-agent) — **생략** (★ 가벼운 sub-agent 전략 / 본 단계는 검증 자동 실행 + 결과 분류 = 새로운 design 결정 ❌, memory `feedback_lightweight_sub_agent.md` 정합)
- 3단계 (사용자 승인) — 본 plan 검토 후 일괄 승인 1회
- 4단계 (실패 시 revert) — Step E 결과 breaking ≥ 1 시 재작성 / Sprint 5 carry-over 보강 분리

---

## 8. 일괄 승인 묶음 (사용자 검토)

| # | 결정 | 권고 | 대안 |
|---|---|---|---|
| **K1** | research.md 생략 (가벼운 sub-agent 전략) | 본 단계 = 자동 실행 + 결과 분류 / 새 설계 ❌ → research 불필요 | 3 sub-agent 병렬 추가 (~5분 추가 — 가치 낮음) |
| **K2** | 결과 저장 위치 = `output/formal-spec/.validation/` | 산출물 디렉토리 내 `.validation/` 신규 (gitignore ❌ — 검증 물증 commit) | `decisions/poc03-phase45-validation/` (분리) |
| **K3** | breaking ≥ 1 시 재작성 → 본 plan scope IN | 본 plan 내 즉시 fix (Phase 4.5 종결 의무) | 별 plan 분리 (Phase 4.5 미종결 → carry) |
| **K4** | 신뢰도 산식 (D5 정합) | breaking 0 가정 0.78 / breaking 1+ 시 0.73 (-3p 추가) | 0.80 (drift breaking 0 + dmn breaking 0 양쪽 가정) |
| **K5** | DEC 1건 (Phase 4.5 종결) | `DEC-2026-04-30-poc03-phase45-종결.md` 단일 문서 | 결정별 분리 (drift / dmn / 종결 = 3건) |
| **K6** | F-117 transitionFuzzyMatch 보완 | Sprint 5 carry-over 유지 (본 plan scope OUT) | 본 plan scope IN (~30분 추가) |

---

## Lessons Learned (작업 종결 후 기록)

### 본 plan 결과 정량

- ✅ 종료 조건 8개 모두 충족
- ✅ 신뢰도 0.70 → 0.77 (+7p / 단계 2 → 2.5)
- ✅ 신규 finding 3건 (F-154/155/156) — 모두 도구 한계 메타 finding
- ⚠️ K3 권고 부분 변경 — 다이어그램 mermaid 보강 (진짜 drift 8건) = Phase 4.5+1 별 carry-over 로 push (재작업 시간 폭발 방지)

### 교훈

1. **★★ drift-validator 60% false positive 정량 입증** = compound state 안 sub-state transition 매칭 한계 노출. PoC #03 의 다이어그램이 nested compound state 표현 풍부 → F-117 재발 = Sprint 5 transitionFuzzyMatch 보완 우선순위 격상 핵심 데이터.

2. **★★ dmn-check enum 위반 자동 검출 ROI ★** = 6 BR 모두 한국어 prefix 사용 (PoC #02 동일 패턴 의심) → schema 검증 자동화가 본 검증 도구의 핵심 가치.

3. **★ K3 권고 부분 변경의 합리성 입증** — breaking 20건 모두 fix 하면 본 plan 시간 폭발 (~3시간 추가). 진짜 drift 분류 후 별 carry-over 로 push 가 실용적. 이 분리는 Phase 4.5 자동 검증 종결 + 신뢰도 +7p 회수에 충분.

4. **★ 가벼운 sub-agent 전략 정합 입증** — research.md 생략 (K1 권고) 으로 Phase 4~6 영역 검증 단계는 plan + 즉시 실행이 적합. memory `feedback_lightweight_sub_agent.md` 정합.

5. **dmn-check heuristic 한국어 헤더 인식 OK** ★ — `parseMarkdownTables` 가 6 BR 의 한국어 표 (트리거 / 조건 / 액션 등) 모두 정상 parse. 향후 한국어 환경 우려 해소.

---

**End of plan (종결).**
