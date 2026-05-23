---
name: discovery-decompose-use-cases
description: v4.1 chain (discovery) 공통 sub-skill. 어댑터 (discovery-from-*) 결과에서 UC-* 분해 + 정규화. 1 actor + 1 domain entity + 1 trigger 단위로 분리. discovery-from-analysis-output / discovery-from-swagger / discovery-from-figma / discovery-from-nl-md 모두 호출. 사용자 (자연어 직접 호출 시): "use case 분해" / "UC 추출". v4.0 planning-decompose-use-cases 의 rename (DEC-2026-05-21 정합).
allowed-tools: Read, Glob, Grep
---

# decompose-use-cases

`extract-from-legacy` skill 의 sub-skill. UC 단위 분해 책임.

## 언제 사용

- `extract-from-legacy` 의 step 3 에서 자동 호출.
- 사용자 직접 호출 (수동 분해 검토 시).

## 입력

- `domain.json` (entity / aggregate)
- `business-rules.json` (BR + br_type)
- `api-extension.json` (operation_id) — 있으면
- `state-machines/*.json` (`formal-spec` phase) — 있으면

## 산출

planning-spec 에 들어갈 `use_cases[]` 배열. 각 UC:

```json
{
  "id": "UC-USER-001",
  "name": "사용자 로그인",
  "description": "이메일+비밀번호로 인증 → JWT 발급",
  "actors": ["User"],
  "primary_domain": "User",
  "br_refs": ["BR-AUTH-LOGIN-001", "BR-AUTH-PASSWORD-002"],
  "api_refs": ["postLogin"],
  "state_machine_ref": "state-machines/auth-flow.json",
  "source_grounded_evidence": [
    { "artifact": "domain", "element_id": "User",                "grep_hit_count": 14, "file_paths": ["domain.json"] },
    { "artifact": "rules",  "element_id": "BR-AUTH-LOGIN-001",   "grep_hit_count": 3,  "file_paths": ["business-rules.json"] }
  ],
  "priority": "critical"
}
```

## 분해 원칙

1. **1 UC = 1 actor + 1 trigger + 1 domain outcome**. 복합 case 는 분리 (cross-cutting "register-and-login" → UC-USER-002 + UC-USER-001).
2. **CRUD pattern 우선** — domain entity 별 create/read/update/delete 4개를 baseline. lifecycle event 마다 추가.
3. **state-machine 1:N UC** — 한 state-machine 의 transition 마다 UC 가능. trigger 단위로 분리.
4. **api-extension operation_id 1:1 UC** — 가장 강한 source. operation_id 마다 UC 1개 의무.

## ★ source-grounded 의무

각 UC 의 `source_grounded_evidence` 배열 ≥ 1 의무. element_id 가 analysis 산출물 안에 grep-hit (count > 0) 안 되면 등록 ❌. AI 환각 차단 핵심.

## actors 추출

| source | priority |
|---|---|
| domain.json `aggregate.actor` 필드 | ★ 1순위 |
| business-rules.json `applies_to_role` 필드 | 2순위 |
| api-extension `security.scopes` | 3순위 |
| inferred (User / Admin / System / External) | 4순위 (★ 사용자 명시 검토 의무) |

## ★ ★ over-decomposition 회피

- UC 가 너무 잘게 나뉘면 (e.g., entity 마다 5+ UC) chain 2 spec stage 폭증 위험. ★ 임계: ≥ 30 UC = 사용자 검토 cluster 의무 추가 (gate #1 cluster 항목).
- 반대로 너무 묶이면 (e.g., entity 마다 1 UC) 추적성 ↓. 임계: < 1.5 UC/entity = 추가 분해 권고.

## 인용

- master plan §B chain 1
- planning-spec.schema.json `use_cases[]` 정합
- ADR-CHAIN-001 §2 (UC → BHV 1:N forward link)
