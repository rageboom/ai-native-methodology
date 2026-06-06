# DEC-2026-05-30-fdogfood-003-intent-certainty

**결단**: F-DOGFOOD-003 (discovery `business_rules_intent.reasoning` 의 intent 과잉귀속) 의 **Option B 패치 시행** — `intent_certainty` enum 구조 라벨 신설. RealWorld MyBatis arm(#1) + JPA arm(#2) **§8.1 ≥2 corroboration 충족**으로 잠금 해제. **v11.6.0 MINOR release**. Patch B(F-DOGFOOD-007 brownfield RED)는 사용자 재진단(use-scenario taxonomy 필요)으로 **본 release 제외 / carry**.

**작성일**: 2026-05-30 (RealWorld JPA dogfood 2nd corroboration arm 직후 / 사용자 옵션 A "패치 구현" 결단).

**relates to**:

- `DEC-2026-05-30-codegraph-probe-3-jpa.md` (2nd arm 의 codegraph 측정 / 같은 dogfood run)
- `~/.claude/plans/plan-fdogfood-003-007-patch-unlock.md` (본 패치 plan)
- F-DOGFOOD-003 (MyBatis arm) + JPA arm `jpa-dogfood-findings.md` (corroboration #2)

---

## 1. 배경 (corroboration sequence)

1. **F-DOGFOOD-003** (MyBatis arm / 2026-05-30): discovery 가 BR-INTENT reasoning 에서 **결과(consequence)/표준동기를 작성자 의도(intent)로 과잉귀속**. 14 중 6 over-attribution + 1 소스 반증.
2. **Option C guardrail** (prose marker `[관찰]/[결과]/[미검증]`) = skill 본문에 이미 적용. 단 **검사 validator 부재** (SKILL.md:61 자인 / discovery-extraction-validator 는 br_id match 만) = 양심 의존 = no-simulation 안티패턴. → Option B(schema 구조 필드) 는 §8.1 ≥2 corroboration 까지 보류.
3. **JPA arm** (`1chz/realworld-java21-springboot3` / 2026-05-30): 동일 3 패턴 재현 — login 단일메시지(enumeration 의도?) / slug→SEO / updatedAt-vs-createdAt정렬(소스 반증) + 신규 댓글삭제 구현분기 모호. **결정적**: discovery-extraction-validator **0 findings** 인데 reasoning 엔 unverified-intent 존재 = guardrail 미강제 재입증.
4. → **§8.1 ≥2 corroboration 충족** (구조 다른 JPA/hexagonal 에서 재현) → Option B 잠금 해제 → 사용자 "a" 결단 시행.

## 2. 시행 (Patch A / additive / breaking 0)

| 영역                                                 | 변경                                                                                                                                                                                                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemas/discovery-spec.schema.json`                 | business_rules_intent.items 에 `intent_certainty` enum (`observed`/`inferred-consequence`/`unverified-intent`/`source-refuted`) **optional** 추가. prose marker 의 구조화 승격. additionalProperties:false 유지 (property 추가). |
| `tools/discovery-extraction-validator`               | `intent_certainty` 부재 시 **WARN**(`discovery.br_intent.missing_intent_certainty` / severity low / non-blocking). enum validity 는 schema-validator 강제.                                                                       |
| `tools/discovery-extraction-validator/test`          | test 4 신규 (부재 WARN / 존재 시 무 WARN / source-refuted 수용 / non-blocking 보장). 9→**13 pass**.                                                                                                                              |
| `skills/discovery-identify-business-intent/SKILL.md` | intent_certainty 구조 라벨 의무 instruction + enum↔marker 매핑표 + JSON 예시 + SKILL.md:61 "비결정적" 문구 갱신.                                                                                                                 |
| dogfood 산출물 (외부 repo)                           | JPA + MyBatis discovery-spec 14 BRI 소급 (분포 observed 8 / unverified-intent 3~4 / inferred-consequence 1~2 / source-refuted 1).                                                                                                |

### enum 의미

- `observed` — 코드에서 직접 관찰된 동작(fact). 의도 귀속 아님.
- `inferred-consequence` — 동작의 사실적 결과는 맞으나 의도는 추론 (소스 근거 부재).
- `unverified-intent` — 의도 귀속이나 소스(주석/ADR/commit) 근거 없음 — 단정 ❌.
- `source-refuted` — 귀속하려던 의도를 다른 산출물이 반증 (+ finding 등재).

## 3. Patch B (F-DOGFOOD-007 / brownfield RED) = 본 release 제외 / carry

사용자 재진단: "brownfield 토글" ❌. RED/GREEN 의미는 **use scenario** 에 종속:

- **S1 코드 재생성(forward)**: chain 4 RED(새 코드 부재) → chain 5 GREEN(생성 코드 통과) = **맞음**. F-007 은 "test 를 기존 legacy 코드에 겨눴다"는 오관측 — test 대상 = 생성될 코드.
- **S2 AX 전환(기존 코드 in-place 활용)**: 방향 다름 (characterization + 증강분 신규 test).
- **S3 특성화/문서화만**: 기존 동작 snapshot GREEN.

→ F-007 은 S1/S2/S3 를 뭉갬. 단순 "brownfield=GREEN" 패치는 S1 을 틀리게 만듦. **올바른 fix = run intent(시나리오) 선언 → RED/GREEN 매트릭스**. = 별도 설계 결단 (방법론 주 타깃 시나리오 = 사용자 전략 질문 / carry `C-use-scenario-taxonomy`). RED enforcement 코드 **비파괴 유지**.

## 4. STOP-3

- workspace test 791 → **795 (+4)** ✅ (discovery-extraction-validator 9→13)
- release-readiness **22/22 ready** ✅ (claude_md_version_sync 포함 / poc-17 forward-ref hygiene 동반 정정으로 skill_citation 0 stale 회복)
- skill-citation **0 stale** (249 active doc)
- version 3-way **11.6.0** (plugin.json / package.json / CHANGELOG)
- breaking **0** (intent_certainty optional) = MINOR

## 5. Lessons Learned

### LL-fdogfood-003-01 — 양심 의존 guardrail → 구조 enum 승격 paradigm

prose marker(자유텍스트)는 validator 가 해석 불가 → 미강제. over-attribution 같은 LLM hallucination 차단은 **구조 필드(enum)로 승격해야 검증 가능**. no-simulation 정책(양심 의존 거부)의 discovery stage 적용 사례. optional WARN 으로 시작(backward-compat) → PoC 채택 후 major 에 required 승격 ratchet.

### LL-fdogfood-003-02 — corroboration 이 잠금 해제하나 fix 방향은 별개 (F-007 분리)

§8.1 ≥2 corroboration 은 "패치 자격"을 주지만 "패치 설계"를 결정하지 않음. F-007 은 재현됐으나(자격 충족) 사용자 재진단으로 fix 방향(use-scenario taxonomy)이 단순 toggle 과 다름이 드러남 → **자격 ≠ 설계 / 성급한 paradigm 변경 회피** (quality 1순위). Patch A(설계 명확)만 시행 / Patch B(설계 미정) carry.

## 6. carry

- ~~`C-use-scenario-taxonomy`~~ — ✅ **RESOLVED (2026-05-30) by [DEC-2026-05-30-use-scenario-taxonomy](DEC-2026-05-30-use-scenario-taxonomy.md)** (v11.7.0). 4 시나리오 형식화 ( 주 타깃 = S2) + P0~P4 정체성 + 시나리오별 RED/GREEN 매트릭스 + greenfield gap B 옵션 A + 선언 위치(`chain-driver init --scenario`→manifest). 본 release = 설계 SSOT / 구현 carry (`C-use-scenario-taxonomy-impl`).
- `intent_certainty` required 승격 — PoC 채택 누적 후 major (현 optional).

## 7. 한 줄 결론

> F-DOGFOOD-003 (intent 과잉귀속) = MyBatis+JPA ≥2 corroboration → Option B 시행 = prose marker → `intent_certainty` enum 구조 승격 (검증 가능 / 양심 의존 탈피). v11.6.0 MINOR. F-007(brownfield)은 use-scenario 재진단 필요로 carry.
