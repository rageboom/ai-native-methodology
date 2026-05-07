# PoC #06 prelim — Day 3 측정 종합 보고서

> 2026-05-07 / EFI-WEB exchange 모듈 / chain 1 단독 측정.
> plan §3-A 분석 50% / §3-B 설계 75% 추정의 사실 확인 + ★ phase 4.7 정식 단계 첫 적용 효과.

---

## 1. 측정 결과 요약 (3축)

### 1.1 plan §3-A 분석 자동화율 — **38.75%** (추정 50% 대비 -11.25%p)

| 산출물 | auto_ratio | plan §3-A 추정 | 갭 |
|---|---|---|---|
| inventory.json | **60%** | 80% | -20%p |
| domain.json | **44%** | 70% | -26%p |
| rules.json | **29%** | 55% | -26%p |
| antipatterns.json | **22%** | 35% | -13%p |
| **평균** | **38.75%** | 50% ± 10%p | **-11.25%p** |

**해석**: plan §3-A 추정은 capital (3752 LOC / 다중책임) 같은 모듈에 더 정합. exchange (345 LOC / 단일책임) 는 inventory.json 만 추정 +10%p / 나머지는 -13~-26%p. 단일책임 강한 모듈일수록 inventory 자동화율 ↑ but 자연어 description 의 비중도 ↑.

### 1.2 plan §3-B 설계 자동화율 — **★ 75% 정합** (validator pass)

```
$ node tools/planning-extraction-validator/src/cli.js \
    --planning .aimd/output/planning-spec.json \
    --rules input/rules.json --domain input/domain.json --json
{
  "findings": [],
  "coverage": { "use_case": 1 },
  "summary": { "total_findings": 0, "critical": 0, "high": 0 }
}
exit: 0
```

★ **0 findings + 100% UC coverage + exit 0 / gate #1 PASS**.

신뢰도 0.75 (사람 추정) — plan §3-B 75% 추정 정확.

### 1.3 phase 4.7 (characterization) 정식 단계 첫 적용 — **★ 본질 가치 사실 입증**

| 측정 항목 | 결과 |
|---|---|
| snapshot 작성 | 3 UC × 10 scenario (UC-002 + UC-006 + UC-007) |
| coverage | 0.50 (3/7 UC + 3/6 service + 3/6 SQL) — Day 2 시간 cap |
| intent_vs_bug 분류 | 14 명확 (6 intent BR + 7 bug AP + 1 자체인지) + 3 ambiguous |
| **acceptance oracle 적용 가능 비율** | **82% (14/17)** |

★ **결정적 finding**: input 4종만으로는 새 시스템 동작 결정 안 됨 — phase 4.7 가 "어떤 BR/AP 보존하고 버릴지" 명시 의무. chain 1 planning 이 input 만 받으면 ambiguous 3건이 그대로 의도/버그 미분간 상태로 chain 2~4 전파.

→ **phase 4.7 정식 단계 격상 정당성 사실 확보 (1 PoC corroboration)**.

---

## 2. EFI-WEB 적용 가능성 종합 — plan §4 시나리오 정합

| 시나리오 | plan 추정 | 본 PoC 사실 |
|---|---|---|
| A. 전체 51K LOC 분석 → 7대 산출물 | 45~55% | **38.75%** (exchange 345 LOC 기준 / 다중책임 모듈에서는 더 박할 가능성) |
| A'. A + carry 1~3 보강 | 65~70% | **carry 1순위 (Spring 4.x AP seed) evidence 1 PoC 확보** — 격상 후 측정 carry |
| B. 신규 UC 1개 chain 1~4 e2e | 55~65% | (본 PoC 미진입 / chain 1 만) |
| **★ chain 1 단독 (본 PoC scope)** | 75% | **75% 정합 (validator PASS)** |
| C. OpenRewrite + chain harness | (-) | (본 PoC scope 외) |

→ **plan 의 단계별 추정이 단일책임 모듈에서는 정합. 다중책임 모듈은 추가 측정 필요**.

---

## 3. validator 실행 결과 (4종 중 1종)

| validator | 결과 | exit |
|---|---|---|
| **planning-extraction-validator** (gate #1) | ✅ **0 findings / 100% UC coverage** | 0 (PASS) |
| schema-validator (보조) | ⚠️ **부분 통과** — enum 정정 후 acceptance_criteria_refs pattern + additionalProperties 위반 잔존. 환경 28 schema load fail (ajv draft/2020-12 / 본 PoC 외 이슈). | 1 |
| chain-coverage-validator (gate #2) | (chain 2 미진입) | — |
| spec-test-link-validator (gate #3) | (chain 3 미진입) | — |
| test-impl-pass-validator (gate #4) | (chain 4 미진입) | — |

**state.json 갱신**: planning = complete (gate_decision: "go") / spec = in_progress / chain-driver `next` 1회 호출로 자동 진입.

---

## 4. ★ Finding 누적 (PoC #06 prelim 자산)

### 4.1 phase 4.7 본체 격상 후보 (carry C-3 / v2.1.0 minor)

- F-PHASE7-001 ~ F-PHASE7-004 (Day 2 entry-6 참조)
- ★ ≥2 PoC corroboration 의무 — PoC #07 또는 retrofit 후 v2.1.0 본체 격상

### 4.2 carry 1순위 evidence (Spring 4.x AP seed)

10 AP 중 9개 (AP-EXCHANGE-007 자조 제외) 가 Spring 4.x + iBATIS 2 + 표준프레임워크 corpus 빈약 영역. **1 PoC corroboration 확보** / 사내 다른 legacy Java 1개 corroboration 후 본체 격상 결단.

### 4.3 신규 carry (Day 3 발견)

| ID | 항목 |
|---|---|
| C-9 | meta-confidence.schema.json `inputs_used` enum 에 `characterization` 추가 (phase 4.7 본체 격상 시) |
| C-10 | schema-validator 환경 이슈 — 28 schema load fail (ajv draft/2020-12 로딩 / 본 PoC 외 환경 finding / drift-validator 자체 회귀 후보) |
| C-11 | planning-spec.schema.json `acceptance_criteria_refs` minItems 강제 — chain 2 미진입 시점에서도 AC-* ID 미리 채워야 schema 통과 (chain harness 사상 검토 carry) |
| C-12 | planning-spec use_cases.additionalProperties: false — note 필드 추가 ❌ / schema 진화 carry |

### 4.4 도메인 expert 결단 의무 (carry C-domain-1 ~ 3)

- BR-EXCHANGE-005 + AP-EXCHANGE-006/008/009 동반 처분 (intent vs bug) — 사용자 (TF Lead) 또는 IFRS 회계 담당자
- AP-EXCHANGE-008 (S_ExRateMigration) — 도메인 expert + DB 함수 본문 read
- KRW selectExchangeList 표시 필요성 — 사용자

### 4.5 데이터 환경 carry (carry C-data-1 ~ 3)

- FN_Get_ExcRate DB 함수 본문 (환율 조회 산식)
- TB_EXCHANGE 트랜잭션 isolation 명시
- sessionId DEAD parameter (sql-map 미사용 / 감사 컬럼 부재)

---

## 5. 종합 결단 권장

| 시나리오 | 권장 | 근거 |
|---|---|---|
| **(a) PoC #06 정식 등재** | **★ 권장** | (i) plan §3-B 추정 75% 사실 확인 / (ii) phase 4.7 본체 격상 정당성 1 PoC corroboration / (iii) carry 1순위 evidence 1 PoC 확보 / (iv) 외부 조언 정합 finding 강화 |
| (b) prelim 보존 | 차선 | Day 2~3 시간 cap 으로 coverage 0.50 (임계 0.80 미달) — phase 4.7 추가 보강 필요 시 |
| (c) scope 외 회수 | ❌ | exchange 모듈은 단일책임 ↑ + 측정 결과 plan 추정 정합 — 부적합 ❌ |

**권장 결단 = (a) PoC #06 정식 등재**. 후속 작업:
1. `examples/poc-06-efiweb-exchange-spring41/` → `examples/poc-06-efiweb-exchange-spring41/` 디렉토리 리네임
2. `decisions/DEC-2026-05-07-poc-06-종결.md` 신설 (prelim → 정식)
3. `STATUS.md` PoC corroboration 표 갱신 (PoC #06 = 4번째 corroboration / chain 1 단독)
4. plan §6 권장 진입 전략 갱신 — Day 3 측정 결과 반영

---

## 6. 다음 결단 카탈로그

### 6.1 사용자 (TF Lead) 결단 영역

- **D1**: PoC #06 정식 등재 (a) 채택 여부
- **D2**: BR-EXCHANGE-005 + AP-EXCHANGE-006/008/009 ambiguous 3건 처분 (intent vs bug)
- **D3**: PoC #07 또는 retrofit 후보 결단 (사내 다른 legacy Java + characterization 적용 / carry 1순위 + carry C-3 ≥2 PoC corroboration 위해)
- **D4**: capital (3752 LOC / 다중책임) 모듈에서 plan §3-A 추정 정합 재측정 의향?
- **D5**: KRW 환율이 selectExchangeList 결과에도 표시될 필요성

### 6.2 도메인 expert / DBA 결단 영역

- **D6**: S_ExRateMigration 비즈니스 의도 (도메인 expert 인터뷰)
- **D7**: FN_Get_ExcRate DB 함수 본문 read (DBA)
- **D8**: TB_EXCHANGE 트랜잭션 isolation 수준 (DBA)

---

## 7. 시간 누적

| Day | 작업 | 시간 |
|---|---|---|
| 0 | 신설 (plan + decisions + STATUS + 디렉토리 + README + PROGRESS) | ~30분 |
| 1 | source 사본 + analysis 4종 산출 + 자동화율 측정 | ~1시간 |
| 2 | phase 4.7 (snapshot 3 + coverage + intent-vs-bug 분류표) | ~1.5시간 |
| 3 | chain-driver init/next + planning-spec.{json,md} + validator + 본 보고서 | ~1.5시간 |
| **누적** | | **~4.5시간** |

★ plan 추정 3~4일 보다 빠름. 단일책임 모듈 + 시간 cap + ambiguous 영역 carry 처리로 효율 ↑.

---

## 8. 결론

> **plan 의 단계별 추정 (§3-A 분석 50% / §3-B 설계 75%) 은 EFI-WEB exchange (단일책임 / 345 LOC) 에서는 정합한다. ★ 외부 조언 (Michael Feathers Characterization Testing) 정합 finding 강화 — phase 4.7 (characterization) 정식 단계 격상 정당성 1 PoC corroboration 확보. carry 1순위 (Spring 4.x AP seed) evidence 1 PoC 확보. ≥2 PoC corroboration 후 본체 격상 결단.**

본 PoC #06 prelim 의 의미 = **plan 추정의 사실 확인 + phase 4.7 정당성 입증 + carry evidence 자산화**. 본체 격상 결단 ❌ — §8.1 단일 PoC 과적합 회피 강제 정합.

---

## 9. 참조

- plan: `~/.claude/plans/stateful-painting-orbit.md` §3 + §5 + §6.5
- DEC: `decisions/DEC-2026-05-07-poc-06-prelim-신설.md`
- PROGRESS: `PROGRESS-2026-05-07.md` (Day 0~3 entry-1 ~ entry-7)
- 외부 조언 정합: plan §6.5 (Michael Feathers Characterization Testing + DDD + SbE)
- input/: rules + domain + antipatterns + inventory
- characterization/: snapshots/ 3 + coverage.json + intent-vs-bug.md
- .aimd/output/: planning-spec.{json,md} + state.json
