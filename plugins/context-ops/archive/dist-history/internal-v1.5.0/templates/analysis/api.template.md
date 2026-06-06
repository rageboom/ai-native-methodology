# {시스템명} Phase 5-1 — API 계약 분석

> **사람 눈** 산출물 (이중 렌더링 정합 — `openapi.yaml` 의 짝).
> 본 template 은 PoC #01 / #02 산출물 형식의 표준화. ADR-008 (이중 렌더링 사상) + ADR-002 (7대 산출물) 정합.

> 분석 대상: `{repo}` (HEAD `{commit}`)
> 방법론 v{version} / {date} / raw confidence {0.NN}

---

## 1. 핵심 요약

- **ground truth**: `{path/to/openapi.yaml}` ({line} line / OpenAPI {3.0|3.1})
  - 출처: 사용자 작성 / `springdoc` 자동생성 / 수동 추출 중 무엇인지 명시
- **endpoint**: {N} unique operationId (paths × methods = {M}) / {T} tags
- **base path**: `{/api}`
- **auth scheme**: {Bearer | apiKey | session | OAuth2}
- **UC 매핑**: {N} op × {M} UC (1:1 = {a} / 복합 = {b} / system_internal = {c})
- **BR 매핑**: {a/M} ✅ (단 RFC 위반 BR {n}건 + spec 미명시 BR {m}건 — 인덱스 §4)

### 최우선 결함 (있을 시 — critical / high finding 명시)

> 본 섹션은 **critical 또는 high finding 이 있을 때만** 작성. 없으면 "결함 없음 — clean spec ✅" 로 끝.

`{operationId}` 의 {결함 종류 — spec/runtime drift / RFC 위반 / Hexagonal 위반 등}:

| 차원            | 값                                     |
| --------------- | -------------------------------------- |
| spec            | `{openapi.yaml:line}` — `{spec 표기}`  |
| runtime         | `{Service.java:line}` — `{실제 동작}`  |
| RFC 권위        | `{RFC NNNN §X.Y.Z}` — `{권위 인용}`    |
| 비교 권위       | `{같은 시스템 내 다른 op}` — 정상 패턴 |
| 클라이언트 영향 | `{영향}`                               |

**즉시 수정 권고**:

```{language}
{최소 수정 diff}
```

→ **Phase 6 AP-{CATEGORY}-{NNN} {severity} 단일 등록** ({관련 finding 묶음}).

---

## 2. operation × severity heatmap

| #   | operationId | method            | severity                     | 영향 finding     | 권고        |
| --- | ----------- | ----------------- | ---------------------------- | ---------------- | ----------- |
| 1   | {OpId}      | `{METHOD} {path}` | {critical/high/medium/low/—} | F-{NNN}, F-{MMM} | {권고 한줄} |
| ... |             |                   |                              |                  |             |

> **severity 기준** (ADR-003 + finding-system 정합):
>
> - critical: spec/runtime drift 또는 보안 직접 영향 (RFC 위반 + 클라이언트 영향 큼)
> - high: 단일 RFC 위반 또는 Hexagonal 위반
> - medium: 통일성 결여 (HTTP code / status 불일치) / spec 미명시 정책
> - low: 권고 수준 (Bearer 마이그레이션 등)
> - —: clean

---

## 3. UC ↔ operation 매핑

```
UC-{ID}-{NAME}   ↔  {operationId} ({METHOD} {path})
                ↳  BR-{...}-001  (rules.json)
                ↳  finding: F-{...}
```

복합 UC (1 op → N UC) 또는 system_internal (UC 미매핑) 명시.

### 3.1 Phase 4.5 cross-link (formal_spec_links)

API 카테고리는 `openapi-extension.schema.json` allOf if-then 으로 **formal_spec_links 의무** ( v1.3.1 — DOMAIN/API/FE 카테고리 conditional required). 각 operation 별로 BR decision-table / state-machine / sequence-diagram 직결 표기.

```yaml
# api-extension.json operations[].formal_spec_links 예시 (template/openapi-extension.template.json 참조)
{ operationId }:
  decision_tables: ['../formal-spec/decision-tables/BR-USER-DELETE-AUTH-001.md']
  state_machines: ['../formal-spec/state-machines/User.json']
  sequence_diagrams: ['../formal-spec/sequence-diagrams/UC-USER-DELETE.json']
```

→ Phase 5-1 input 의 Phase 4.5 의존 정합 (`workflow/phase-5-1-api.md` §2). request/response schema 가 formal-spec decision-tables 와 매핑 가능해야 함.

---

## 4. RFC 위반 / 비표준 인덱스

| op     | RFC             | 위반 종류        | finding | 격상 후보               |
| ------ | --------------- | ---------------- | ------- | ----------------------- |
| {OpId} | RFC 7231 §4.2.2 | idempotency 위반 | F-{NNN} | AP-API-{NNN} {severity} |
| ...    |                 |                  |         |                         |

---

## 5. spec 미명시 / 정책 후보

`x-related-rules` / `x-business-rules` 보강 후보 — Phase 6 격상 또는 사용자 결정 대기.

---

## 6. anti-pattern / finding 인덱스

### 6.1 anti-pattern (Phase 6 — 본 산출물 source)

| AP ID        | severity | 파생 finding      | composite view     |
| ------------ | -------- | ----------------- | ------------------ |
| AP-API-{NNN} | critical | F-{NNN} + F-{MMM} | API 계약 (있을 시) |

### 6.2 finding 누적 (본 phase 신규 + 격상 후보)

| finding | severity | status   | 한줄   |
| ------- | -------- | -------- | ------ |
| F-{NNN} | high     | promoted | {요약} |

---

## 7. 변경 권고 우선순위

1. **즉시 수정 (critical)** — {코드 위치 + diff 1라인}
2. **단기 (high)** — {권고}
3. **중기 (medium)** — {권고}
4. **장기 (low)** — {권고 — 마이그레이션 등}

---

## 8. 본 산출물 자체 메타

```yaml
phase: 5-1
deliverable: api.md (사람 눈) + openapi.yaml (AI 눈) + api-extension.json (메타)
raw_confidence: 0.NN
inputs:
  - source: {경로}
  - openapi.yaml: {line} line / {출처}
cross_validation:
  performed: true
  validators:
    - { type: senior_engineer_subagent, real_tool: false, simulation_reason: "AI 검증 보조용" }
    - { type: external_tool, real_tool: true,  tool_name: "spectral", tool_version: "...", ... }   # 진짜 도구 시 5종 물증 (formal-spec.schema 정합)
  drift_detected: { spec_runtime: N, hexagonal: M, rfc_violations: K }
known_limitations:
  - "{한계 1}"
  - "{한계 2}"
trust_level:
  current: "0.NN"
  next_validation: "Phase 6 AP 격상"
```

---

## 9. 참조 / 다음 phase

- 다음 phase: Phase 5-2 (UI/UX) 또는 Phase 6 (안티패턴)
- 격상 대기 finding: §6.2
- 외부 검증 후보: spectral / vacuum / openapi-changes 등 ( 진짜 도구 의무 — DEC-static-tool-실행-의무화)
