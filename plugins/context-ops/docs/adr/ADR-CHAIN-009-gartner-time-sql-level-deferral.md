# ADR-CHAIN-009: Gartner TIME SQL 단위 보류 사유 — abstract granularity mismatch + `migration_priority` P0~P3 대체 채택

- 상태: 승인됨 (Accepted) — 사용자 결단 옵션 D (REVISE 완전 흡수) / 2026-05-12
- 일자: 2026-05-12
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-CHAIN-007 (phase 4.8 sql-inventory / Gartner TIME alignment 의도 origin), DEC-2026-05-12-v2.3.0-scope-결단 ( 본 ADR 채택 결단 origin), DEC-2026-05-08-v2.2.0-rc1-prerelease (sql-inventory deliverable #24 신설)

---

## 컨텍스트

ADR-CHAIN-007 phase 4.8 (sql-inventory) 본체 격상 시 외부 권위 4종 흡수:

- Michael Feathers Characterization Testing (2004)
- **Gartner TIME framework** (Tolerate / Invest / Migrate / Eliminate)
- AWS Migration Acceleration Program (MAP) Assess phase
- Opus 4.7 외부 조언

v2.2.0-rc1 deliverable `#24 sql-inventory.md` §1 motivation + §x-spec-source 에 Gartner TIME alignment 명시. **carry C-v2.2.0-8** = "Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼)" v2.3+ 후보.

v2.3.0 minor sprint research (2원칙 / 3 sub-agent 병렬 / 2026-05-12) 결과:

### Big-tech 사례 (Agent 2)

- Gartner TIME = 2026년 enterprise APM 표준 1순위 (LeanIX / Ardoq / Sparx / Colloquial 4 vendor default).
- **SQL Inventory 도구 (AWS SCT / Oracle SQL Developer Migration Workbench / Liquibase) 모두 TIME 컬럼 부재**.
- 적용 사례 = Air Combat Command ($788M IT portfolio rationalization) / LeanIX SAP whitepaper — **모두 application portfolio 수준**.

### Senior critique (Agent 3)

> **근본적 추상 mismatch 의심**. Gartner TIME (Tolerate / Invest / Migrate / Eliminate) 는 **Application portfolio 수준 분류** (Gartner Pace-Layered + TIME 원전) — application / system 단위가 정상 적용 단위.
>
> SQL statement 단위 적용 risk:
> (a) **granularity mismatch** — 단일 SELECT 가 "Invest" 결정 단위로 부적합 (application 의 한 fragment).
> (b) **decision context 결손** — TIME 결정은 business value + technical debt + cost 3축 — SQL metadata 만으로 결정 불가.
> (c) **classification drift** — 같은 application 내 SQL 별 TIME 분류 불일치 시 portfolio 일관성 깨짐.

---

## 결정

**Gartner TIME = SQL 단위 보류 / `migration_priority` P0~P3 대체 채택**.

### §1. SQL 단위 axis = `migration_priority` enum (12번째 컬럼)

`schemas/sql-inventory.schema.json` `sqlRecord.properties.migration_priority`:

```json
"migration_priority": {
  "type": "string",
  "enum": ["P0", "P1", "P2", "P3"],
  "description": " 본 추가 (v2.3.0-rc1) / 12번째 컬럼 / SQL 단위 modernization priority. Gartner TIME (application portfolio 단위) 와 분리 axis (ADR-CHAIN-009)."
}
```

| enum | 의미                               | trigger                                                                   |
| ---- | ---------------------------------- | ------------------------------------------------------------------------- |
| `P0` | 즉시 (critical / 차단 risk)        | critical bug / external_call_out_of_scope + DBA-read 동반 / paradigm 위반 |
| `P1` | 短期 (3개월 이내 / high)           | high AP 동반 / N+1 / dynamic SQL 복잡도 高                                |
| `P2` | 中期 (6~12개월 / medium)           | medium AP / refactoring 후보 / patterns_extension 충돌                    |
| `P3` | 후순위 (12개월+ / low or maintain) | low AP / 단순 CRUD / maintain                                             |

**필수 아님** (`required` ❌) — backward-compat 의무 (기존 11 컬럼 row 통과 의무).

### §2. Gartner TIME = application portfolio 수준 별도 deliverable carry

Senior critique granularity mismatch 흡수 — Gartner TIME 은 본 SQL Inventory 의 **scope 외부**.

- carry **C-v2.3.0-gartner-time-application-level**: `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 (v2.4 / v3.0 sprint).
- 본 sprint scope ❌.

### §3. 외부 권위 출처 갱신

`x-spec-source.gartner_time` URL 보존 (역사 / 흡수 사상 origin). deliverable §1 의 motivation 절은 Gartner TIME 인용 유지하되 **§3 추출 범위 + §4 11→12 컬럼 명세** 에서 `migration_priority` (Gartner TIME 미사용) 명시 의무.

deliverable §1.2 "Why not AWS SCT" 차별화 절 강화:

> Big-tech 입증 (2026-05-12 research / Agent 2): SQL Inventory 도구 (AWS SCT / Oracle SQL Dev Migration Workbench / Liquibase) 모두 TIME 컬럼 부재. **본 방법론은 `migration_priority` SQL 단위 axis = first-mover** (Gartner TIME application portfolio 수준과 분리).

### §4. 회귀 fixture 의무 (Senior 권고 흡수)

기존 11 컬럼 record (PoC #06+#07 fixture) → 새 schema 통과 검증 의무. `migration_priority` = optional 보장.

`tools/sql-inventory-extractor/test/extractor.test.js` 회귀 test 추가:

```
test('valid PoC #06 — backward-compat (no migration_priority) — no critical/high finding')
test('valid PoC #06 + migration_priority — recognized + no finding')
test('invalid — migration_priority enum (PX) violation')
```

---

## §5. 사상

"Two abstraction levels" — application portfolio 수준 (Gartner TIME) vs SQL 단위 (본 deliverable `migration_priority`) **분리 axis**. 본 방법론 = SQL 단위 first-mover / application portfolio 수준 = 후속 deliverable carry.

본 ADR = **REVISE 완전 흡수** (Senior critique 100% 채택 / Big-tech first-mover 신호도 동시 흡수 / 본 방법론 절대 우선순위 "품질 1순위" 정합).

---

## §6. 결과 (Consequences)

### 긍정

- ✅ SQL 단위 자연 axis 확보 (`migration_priority` P0~P3).
- ✅ Gartner TIME abstract mismatch risk 제거.
- ✅ Big-tech first-mover 신호 보존 (AWS SCT / Oracle SQL Dev / Liquibase 모두 부재).
- ✅ 14차 retract lessons learned 정합 회피.

### 부정

- ❌ Gartner TIME 권위 직접 차용 ❌ (별도 deliverable carry).
- ❌ application portfolio 수준 deliverable = v2.4/v3.0 carry (즉시 효익 ❌).

### 중립

- 본 deliverable §1 motivation Gartner TIME 인용 보존 (역사 / 사상 origin / 흡수 후 분리 명시).

---

## §7. 참조

- DEC-2026-05-12-v2.3.0-scope-결단 ( 본 ADR 채택 결단)
- plan: `~/.claude/plans/g-v2.3.0-minor-plan.md`
- research: `~/.claude/plans/g-v2.3.0-minor-research.md` §3.3 (Senior critique granularity mismatch) + §2.4 (Big-tech first-mover 신호)
- Gartner Research Note 3815663 / 2206416 (TIME framework 원전)
- LeanIX wiki / Sparx Prolaborate / Ardoq APM metamodel
- AWS Schema Conversion Tool docs (technical complexity classification / business value 축 ❌)
- Oracle SQL Developer Migration Workbench docs
- Liquibase changelog tool
- Senior F4 critique pattern (결단 burst 회피)
