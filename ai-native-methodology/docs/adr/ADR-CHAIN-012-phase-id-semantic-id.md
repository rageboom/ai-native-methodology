# ADR-CHAIN-012: Phase ID 의미 ID + depends_on 그래프 SSOT (D-3 paradigm)

- 상태: 승인됨 (Accepted) — ★ ★ ★ ★ ★ v3.0.0 MAJOR release / 사용자 결단 D-3 paradigm 본격 채택 / sibling ADR-CHAIN-011 (v2.6.0 skill 의미 ID rename)
- 일자: 2026-05-15
- 결정자: 윤주스 (TF Lead)
- 관련: ADR-008 (이중 렌더링 사상), ADR-CHAIN-006 (phase characterization 정식 도입), ADR-CHAIN-007 (phase sql-inventory 정식 도입), ADR-CHAIN-011 (BR dual representation), `.claude/plans/plan-phase-id-semantic-rename.md` (Plan D 본격 자산화), `decisions/INDEX.md` 안 v3.0.0 entry

---

## 컨텍스트

### §1. trigger — 사용자 사실 정합 명시 (2026-05-15)

v2.0 SDLC 4단계 chain harness 도입 시점부터 manifest phase ID 가 숫자 (0, 1, 2, 3, 4, 4.5, 4.7, 4.8, 5-1, 5-2, 6) 였다. 사용자 본격 사실 정합 명시:

- "phase 의 순서가 숫자로 되어 있는건 좀 아닌것 같다"
- "나중에 확장이나 순서 변경이 어려워 보인다"

### §2. paradigm 한계 누적

1. **magic decimal 영역** — 4.5 / 4.7 / 4.8 같은 decimal 표기가 어떤 의미인지 file 명/manifest 만 봐서는 추론 ❌. "왜 4.6은 없고 4.7로 jump?"
2. **확장 어려움** — 신규 phase 추가 시 어디에 어떤 숫자로 끼울지 모호 (3.5? 4.6? 5-3?)
3. **순서 변경 어려움** — 숫자 ID가 순서를 내포하므로 순서 변경 = 모든 ID 재배치
4. **사용자 인지 부담** — `phase 4 비즈니스 로직`을 매번 매핑해야 함
5. **v2.6.0 skill 의미 ID rename paradigm sibling** — skill 은 의미 ID인데 phase 는 숫자 = 일관성 깨짐

---

## 결정

### §3. D-3 paradigm 채택

```json
{
  "id": "business-logic",
  "name": "비즈니스 로직 (4영역 병렬)",
  "spec_file": "business-logic.md",
  "depends_on": ["discovery", "db-schema", "architecture"]
}
```

- **`id`** = 의미 ID (영문 hyphenated lowercase)
- **`order` 필드 부재** — 순서는 `depends_on` 그래프 → 위상정렬로 자동 도출
- **lexicographic tiebreak** — 같은 레벨 노드는 알파벳 순 (api / ui 같은 병렬 phase 의 결정론)
- **alias map ❌** — 즉시 cutover (사내 배포 전 / 실 사용자 0 사실 정합)

### §4. Phase ID 매핑 (11)

| 옛 (숫자) | 새 (의미 ID) | depends_on |
|---|---|---|
| 0 | `input` | [] |
| 1 | `discovery` | [input] |
| 2 | `db-schema` | [discovery] |
| 3 | `architecture` | [discovery, db-schema] |
| 4 | `business-logic` | [discovery, db-schema, architecture] |
| 4.5 | `formal-spec` | [business-logic] |
| 4.7 | `characterization` | [business-logic, formal-spec] |
| 4.8 | `sql-inventory` | [discovery, business-logic, characterization] |
| 5-1 | `api` | [business-logic, formal-spec, characterization, sql-inventory] |
| 5-2 | `ui` | [architecture, business-logic, characterization] |
| 6 | `quality` | [business-logic, formal-spec, api, ui] |

### §5. 대안 검토

| 옵션 | 본질 | 채택 ❌ 이유 |
|---|---|---|
| A — 전면 의미 ID rename + 자연 순서 | 본질 정합 | 같은 레벨 병렬 노드 순서 모호 (api/ui 같은 영역) |
| B — 보존 (현 paradigm) | 변경 비용 0 | magic decimal 한계 누적 / 사용자 사실 정합 ❌ |
| C — Hybrid (semantic_id 신설 + 숫자 ID 보존) | breaking change ❌ | dual axis 본문 복잡도 ↑ / SSOT 흐림 |
| D-1 — 의미 ID + `order` 정수 필드 | 사람 가독성 ↑ | 신규 phase 삽입 시 뒤 phase order 다 +1 shift |
| D-2 — 의미 ID + `order` sparse 정수 (10/20/30...) | 삽입 여유 | `order` ↔ `depends_on` dual SSOT |
| **D-3 — 의미 ID + `depends_on` 그래프 SSOT** ⭐ | **본질 정합** | **★ 채택** |

D-3 선택 근거 — 추가/삭제 시 그 phase 의 `depends_on` 만 손대면 끝. 다른 phase 영향 ❌. 순서는 그래프에서 위상정렬로 결정론적 도출.

---

## §6. 결과 (Consequences)

### Positive

- ★ **본질 정합** — phase 의미가 ID 에서 직접 표현 (예: `formal-spec.md` 읽으면 내용 추론 가능)
- ★ **신규 phase 추가 단순** — `depends_on` 만 손대면 끝 / 다른 phase 영향 ❌
- ★ **순서 변경 단순** — `depends_on` 갱신 → 위상정렬 자동 재계산
- ★ **사용자 인지 부담 ↓** — phase 매핑 ❌
- ★ **v2.6.0 skill 의미 ID paradigm sibling 정합** — 일관성 회복

### Negative

- ★ breaking change — 옛 숫자 phase ID 명시 호출 (`/analyze --phase 4.5`) 즉시 폐기. 단 사내 배포 전 / 실 사용자 0 사실 정합 → 영향 ❌
- ★ ADR / DEC / CHANGELOG 안 옛 phase 인용 영역 보존 (역사 자료 axis / 그 시점 사실)

### §7. 영향 범위

- plugin 본체 ~60 file 갱신 (workflow 11 rename + manifest + drift-validator 위상정렬 + schema enum + tools 주석)
- PoC 산출물 finding 데이터 일괄 sed (★ 사내 배포 전 / 호환 의무 ❌)
- 역사 자료 ADR 14 / DEC 53 / CHANGELOG-HISTORY 보존
- mermaid 본 갱신 (subgraph id = `P_<semantic_id>` + 라벨 의미 ID 우선)

---

## §8. 시행 paradigm

5 Sprint 분할:

- **S1** — Senior critique sub-agent (가벼운 / Sonnet 4.6 / 20분 cap) — STOP-1+2 / REVISE-1~5 / CAUTION-1~4 발행 + 흡수
- **S2** (commit `8a89461`) — manifest + workflow rename + drift-validator 위상정렬 신규
- **S3-a** (commit `cff7949`) — schemas + tools 코드 정합
- **S3-b** (commit `e33d380`) — PoC finding 일괄 sed + 본문 workflow path + mermaid + normalize-phase-flow.js 정규식
- **S4** — 전수 검증 (workspace 317/0 / drift 0 orphan / mermaid drift 0 / release-readiness 9/9)
- **S5** — 본 ADR + CHANGELOG v3.0.0 + version bump + commit + tag + push

---

## §9. Validation

- ★ workspace test 312 → 317 (drift-validator 위상정렬 +5 신규 / 회귀 ❌)
- ★ drift-validator --check-layout: 11 phases / 22 skills / 0 orphans / 0 missing
- ★ drift-validator --check-chain-layout: 4 stages / 26 phases / 13 skills / 0 orphans
- ★ drift-validator mermaid ↔ JSON 짝 비교: 0 breaking / 0 non-breaking
- ★ release-readiness v3.0.0: 9/9 strict pass
- ★ chain harness 5 요소 본질 보존 (★ chain-driver gate-eval.js / hooks-bridge.js / release-readiness.js / br-cross-consistency-validator 모두 본질 변경 ❌)

---

## §10. Lessons Learned

- **LL-i-51** — D-3 paradigm 본질 = `depends_on` 그래프가 SSOT면 순서 axis 별도 ❌. 위상정렬 + lexicographic tiebreak = 결정론 보존.
- **LL-i-52** — 사내 배포 전 / 실 사용자 0 사실은 호환성/migration 비용 0으로 만든다. semver MAJOR 라벨링 의미 약함 (★ 단순 한 명의 작업자 작업 흐름 axis).
- **LL-i-53** — mermaid subgraph id 는 paradigm 본질 (의미 ID) 와 별개 axis (mermaid 문법 호환 / `P_` 접두사 + underscore). normalize-phase-flow.js paradigm 정합 갱신 의무.

---

## §11. Carry (v3.0 후 cleanup)

- examples/poc-04-* analysis 디렉토리 명 (`0-init/`, `1-architecture/`, `5-1-api/` 등 옛 phase 표기) — 사람 가독성 axis / paradigm 외
- skills 본문 안 옛 file 명 misnomer 인용 일부 (phase-3-domain.md / phase-1-inventory / phase-2-architecture.md 등 옛 명세 경로) — manual review 권장
- 본문 자유 텍스트 "Phase 4" 등 산문 표기 — manual review carry
- ~~**★ 다른 chain stage flow phase ID 의미 ID rename** (planning P1.0~P1.3 / spec P2.0~P2.5 / test P3.0~P3.6 / implement P4.0~?) — 별개 plan 영역 (본 paradigm 정합 sibling)~~ → **v3.1.0 resolved** (2026-05-15 / CHANGELOG.md §[3.1.0] / Plan V / Senior critique REVISE-3 흡수 = `static-runner` phase 명 → `static-analysis` / D-3 paradigm sibling / 10 file / scaffolding only / MINOR)
