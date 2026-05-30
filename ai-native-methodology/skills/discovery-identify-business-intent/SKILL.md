---
name: discovery-identify-business-intent
description: v4.1 chain (discovery) 공통 sub-skill. 어댑터 (discovery-from-*) 결과 + business-rules.json BR-* + antipatterns + finding 을 분석하여 BR-INTENT-NNN 추출 ("왜 이 규칙인가" reasoning). 모든 BR-INTENT 는 1+ analysis BR-* 매핑 의무 + source_grounded_evidence 의무. legacy-archaeologist persona 책임. 사용자 (자연어 직접 호출 시): "business intent 추출" / "BR-INTENT 분석". v4.0 planning-identify-business-intent 의 rename (DEC-2026-05-21 정합).
allowed-tools: Read, Glob, Grep
---

# identify-business-intent

`extract-from-legacy` skill 의 sub-skill. **legacy-archaeologist persona** (★ v4.0 multi-agent / `agents/planning-agent.md` system prompt 흡수) 책임.

## 언제 사용

- `extract-from-legacy` 의 step 4 에서 자동 호출.
- 사용자가 BR-INTENT 보강 시 직접 호출.

## 입력

- `business-rules.json` (BR-* + br_type + decision_tables)
- `antipatterns.json` (AP-* + applies_to + migration_advice)
- `finding-system.findings.json` (positive finding + learning_effect_type)
- `migration-cautions.md`
- `domain.json` (도메인 invariant)

## 산출

discovery-spec 의 `business_rules_intent[]` 배열. 각 entry (★ v11.0.0 schema strict — `additionalProperties:false` / `br_id` + `reasoning` + `source_grounded_evidence` 필수 + ★ v11.6.0 `intent_certainty` optional 추가. 구 `BR-INTENT-*` id / `intent` / `br_refs` / `ap_refs` / `category` / `criticality` 필드 **폐기** — Senior B1 / 객체형 evidence → string):

```json
{
  "br_id": "BR-USER-PASSWORDHASH-001",
  "reasoning": "[관찰] 로그인 시 PasswordEncoder.matches 로 bcrypt 검증 (UserService.java:39). [결과] 평문 비밀번호 미저장. [근거] business-rules.json BR rationale = OWASP A02:2021 (analysis 인용 / 자가 추론 ❌).",
  "source_grounded_evidence": "src/main/java/io/spring/application/user/UserService.java:39",
  "intent_certainty": "observed"
}
```

★ `br_id` = analysis `business-rules.json` 의 BR-* 1:1 backward link. 별도 `BR-INTENT-*` id 없음.

## reasoning 추출 알고리즘

1. **business-rules.json br_type 분석** — invariant / constraint / lifecycle / 4 enum 별 reasoning 패턴 분기.
2. **antipatterns 매핑** — 본 BR 가 회피하는 AP 가 antipatterns.json 에 있으면 자동 link (★ negative-space corroboration / ADR-BE-001 정합).
3. **migration-cautions.md grep** — "왜 이 규칙이 도입되었는가" 의 history 단서 (e.g., "#SEC-CR-114" / "Issue #245").
4. **decision-tables hit-rate** — 동일 BR 의 decision-table 의 outcomes 분포 → BR 의 비즈니스 의도 강도.

### ★ ★ consequence ≠ intent 규율 (F-DOGFOOD-003 / over-attribution 차단)

reasoning 은 **관찰된 동작(fact) / 동작의 결과(consequence) / 작성자의 의식적 의도(intent)** 를 구분해야 한다. LLM 이 그럴듯한 동기를 의도로 단정하는 것이 1차 hallucination 위험.

- **관찰된 동작** = 코드 분기/제약/타입 그 자체 (예: "단일 else 분기에서 동일 예외").
- **동작의 결과(consequence)** = 동작이 야기하는 사실적 효과 (예: "user enumeration 내성"). `[결과]` 로 표기.
- **작성자 의도(intent)** = 소스(주석/ADR/commit msg/이슈)에 **근거 있을 때만** 귀속. 근거 없으면 `[미검증]` 으로 표기하고 의도로 단정 **금지**.
- **소스 반증** = reasoning 이 다른 산출물과 모순되면 (예: "updatedAt→정렬" 인데 정렬은 created_at) → reasoning 정정 + **finding 등재**.

권장 표기: `[관찰] … [결과] … [미검증] …`. ★ "미존재 기능을 동기로 날조" 금지 (예: 비번 복구 기능 부재인데 "복구 채널" 귀속). DEC-2026-05-30 RealWorld dogfood F-DOGFOOD-003 실측 (MyBatis arm 14 중 6 over-attribution / 1 소스 반증 + JPA arm ≥2 corroboration 재현).

### ★ ★ ★ intent_certainty 구조 라벨 (v11.6.0 / prose marker 의 구조화 승격 / 의무)

prose marker 는 가독성 보조이나 **검증 불가**(validator 가 reasoning 텍스트를 해석 ❌). 따라서 각 entry 에 `intent_certainty` enum 을 **반드시** 부여한다 (validator 가 부재 시 WARN):

| intent_certainty | 의미 | prose marker 대응 |
|---|---|---|
| `observed` | 코드에서 직접 관찰된 동작(fact). 의도 귀속 아님 | `[관찰]` 만 |
| `inferred-consequence` | 동작의 사실적 결과는 맞으나 의도는 추론 (소스 근거 부재) | `[결과]` 중심 |
| `unverified-intent` | 의도를 귀속하나 소스(주석/ADR/commit) 근거 없음 — 단정 ❌ | `[미검증]` |
| `source-refuted` | 귀속하려던 의도를 다른 산출물이 반증 (예: "updatedAt→정렬"인데 정렬은 created_at) | + finding 등재 의무 |

★ entry 의 reasoning 이 의도를 단정하는데 근거가 없으면 `unverified-intent`, 반증되면 `source-refuted` 로 정직 표기. `observed`/`inferred-consequence` 로 격하하거나 의도 단정을 회피한다. ★ JPA arm 실측: BR-USER-LOGIN-001(enumeration)·BR-ARTICLE-SLUG-001(SEO)=unverified-intent / BR-ARTICLE-UPDATE-001(updatedAt 정렬)=source-refuted.

## ★ ★ ★ no-simulation — reasoning 환각 차단

reasoning 필드는 **사람 검토 의무** (Auto Mode 도 차단). AI 가 추론한 reasoning 이 source 에 없으면:
- `source_grounded_evidence` (file:line) 부재 → 등재 ❌ (source-grounded 의무 / 사람 검토).
- 사용자에게 명시: "★ AI 추론 reasoning — source 근거 없음. 검토 후 채워주세요" / 빈 entry 등록 ❌.
- ★ v11.6.0 — discovery-extraction-validator 는 `br_id` ↔ analysis BR match (결정적) + `intent_certainty` 부재 WARN (구조 라벨 nudge / F-DOGFOOD-003 Option B). intent 단정의 **확실성은 intent_certainty enum 으로 부분 결정화** (observed/inferred-consequence/unverified-intent/source-refuted) — prose marker 만 의존하던 미강제 상태 보완. 잔여 (reasoning 텍스트 ↔ enum 라벨 semantic 정합)는 gate #1 사람 검토 + F-DOGFOOD-004 carry.

## 카테고리 분류 (평가 가이드)

★ v11.0.0 — `category` 는 business_rules_intent **저장 필드 ❌** (schema strict / additionalProperties:false). 본 표 = reasoning 작성 시 분류 참고용 / 실 category·severity 는 analysis `business-rules.json` (br_id) 에서 참조.

| category | 예 |
|---|---|
| security | OWASP A01~A10 / 인증 / 권한 / 암호화 / XSS / SQL injection |
| data_integrity | unique 제약 / FK / soft-delete / lifecycle |
| business_rule | 도메인 비즈니스 의도 (e.g., "최소 주문 금액") |
| operational | logging / audit trail / observability |
| performance | indexing / pagination / caching |
| compliance | GDPR / PCI-DSS / HIPAA / 사내 규정 |

## ★ criticality 임계 (평가 가이드)

★ v11.0.0 — `criticality` 는 business_rules_intent **저장 필드 ❌**. 본 표 = 평가 참고용 / 실 severity 는 analysis `business-rules.json` BR (br_id) 의 `severity` 사용 (spec-derive AC severity 도출 시).

| criticality | 트리거 |
|---|---|
| critical | security 카테고리 / lifecycle invariant / regulatory (compliance) |
| high | data_integrity / business_rule with 매출 영향 / contract test 의무 |
| medium | operational / performance |
| low | nice-to-have / convention |

## 인용

- ADR-BE-001 (negative-space corroboration / AP ↔ BR-INTENT 양방향)
- discovery-spec.schema.json `business_rules_intent[]` 정합
- master plan §B chain 1
- DEC-2026-04-29-시퀀스-C-A-B-확정 (BR 형식화 우선 정책)

## Carry

- reasoning 의 LLM 자동 추론 정확도 측정 = sub-plan-6 PoC #05.
- 사내 wiki / Jira link 자동 추출 (외부 source 보강) = v2.x carry.
