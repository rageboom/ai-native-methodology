---
name: planning-identify-business-intent
description: ★ v2.0 chain 1 sub-skill. rules.json BR-* 와 antipatterns + finding 을 분석하여 BR-INTENT-NNN 추출 ("왜 이 규칙인가" reasoning). 모든 BR-INTENT 는 1+ analysis BR-* 매핑 의무 + source_grounded_evidence 의무. legacy-archaeologist persona 책임.
allowed-tools: Read, Glob, Grep
---

# identify-business-intent

`extract-from-legacy` skill 의 sub-skill. **legacy-archaeologist persona** (agents/planning/README.md §agent persona) 책임.

## 언제 사용

- `extract-from-legacy` 의 step 4 에서 자동 호출.
- 사용자가 BR-INTENT 보강 시 직접 호출.

## 입력

- `rules.json` (BR-* + br_type + decision_tables)
- `antipatterns.json` (AP-* + applies_to + migration_advice)
- `finding-system.findings.json` (positive finding + learning_effect_type)
- `migration-cautions.md`
- `domain.json` (도메인 invariant)

## 산출

planning-spec 의 `business_rules_intent[]` 배열. 각 BR-INTENT:

```json
{
  "id": "BR-INTENT-AUTH-001",
  "intent": "사용자 로그인 시 비밀번호는 bcrypt 해시 검증으로 평문 노출을 차단해야 한다",
  "reasoning": "보안 감사 의무 (legacy commit history 의 #SEC-CR-114 / OWASP A02:2021 / antipatterns AP-SECURITY-PASSWORD-001 미스매치 위험 회피)",
  "br_refs": ["BR-AUTH-PASSWORD-002", "BR-AUTH-LOGIN-001"],
  "ap_refs": ["AP-SECURITY-PASSWORD-001"],
  "uc_refs": ["UC-USER-001"],
  "category": "security",
  "criticality": "critical",
  "source_grounded_evidence": [
    { "artifact": "rules",        "element_id": "BR-AUTH-PASSWORD-002", "grep_hit_count": 5, "file_paths": ["rules.json"] },
    { "artifact": "antipatterns", "element_id": "AP-SECURITY-PASSWORD-001", "grep_hit_count": 2, "file_paths": ["antipatterns.json"] }
  ]
}
```

## reasoning 추출 알고리즘

1. **rules.json br_type 분석** — invariant / constraint / lifecycle / 4 enum 별 reasoning 패턴 분기.
2. **antipatterns 매핑** — 본 BR 가 회피하는 AP 가 antipatterns.json 에 있으면 자동 link (★ negative-space corroboration / ADR-BE-001 정합).
3. **migration-cautions.md grep** — "왜 이 규칙이 도입되었는가" 의 history 단서 (e.g., "#SEC-CR-114" / "Issue #245").
4. **decision-tables hit-rate** — 동일 BR 의 decision-table 의 outcomes 분포 → BR 의 비즈니스 의도 강도.

## ★ ★ ★ no-simulation — reasoning 환각 차단

reasoning 필드는 **사람 검토 의무** (Auto Mode 도 차단). AI 가 추론한 reasoning 이 source 에 없으면:
- `source_grounded_evidence` 의 grep_hit_count = 0 → planning-extraction-validator 자동 차단.
- 사용자에게 명시: "★ AI 추론 reasoning — source 에 grep-hit 없음. 검토 후 채워주세요" / 빈 BR-INTENT 등록 ❌.

## 카테고리 분류

| category | 예 |
|---|---|
| security | OWASP A01~A10 / 인증 / 권한 / 암호화 / XSS / SQL injection |
| data_integrity | unique 제약 / FK / soft-delete / lifecycle |
| business_rule | 도메인 비즈니스 의도 (e.g., "최소 주문 금액") |
| operational | logging / audit trail / observability |
| performance | indexing / pagination / caching |
| compliance | GDPR / PCI-DSS / HIPAA / 사내 규정 |

## ★ criticality 임계

| criticality | 트리거 |
|---|---|
| critical | security 카테고리 / lifecycle invariant / regulatory (compliance) |
| high | data_integrity / business_rule with 매출 영향 / contract test 의무 |
| medium | operational / performance |
| low | nice-to-have / convention |

## 인용

- ADR-BE-001 (negative-space corroboration / AP ↔ BR-INTENT 양방향)
- planning-spec.schema.json `business_rules_intent[]` 정합
- master plan §B chain 1
- DEC-2026-04-29-시퀀스-C-A-B-확정 (BR 형식화 우선 정책)

## Carry

- reasoning 의 LLM 자동 추론 정확도 측정 = sub-plan-6 PoC #05.
- 사내 wiki / Jira link 자동 추출 (외부 source 보강) = v2.x carry.
