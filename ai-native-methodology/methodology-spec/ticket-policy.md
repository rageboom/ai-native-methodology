# Ticket Binding Policy (외부 일감 시스템 연동)

> ai-native-methodology plugin 의 chain harness 산출물 ↔ 외부 ticket 시스템 (Jira / Linear / GitHub Issues / Asana / Azure DevOps) 매핑 정책.
> ★ 권고 (validator 강제 X) / DEC-2026-05-18-ticket-binding-policy 결단 / v8.6.0+ 진입.

---

## 1. 결단 요약

| 항목 | 결정 |
|---|---|
| Ticket 단위 | **UC = Story** (Plugin 의 UC ID 가 grep-hit 검증된 유일 단위 = Jira Story 의 사용자 가치 단위 정합) |
| Ticket 생성 시점 | **★ Chain 1 종료 시점** (planning-spec.json schema-valid + grep-hit 증거 확보 직후) |
| 상위 단위 | Domain = Epic / 분석 stage 결과 = Initiative |
| 하위 단위 (선택) | Chain stage 4개 = Sub-task |
| BHV / AC / TC / IMPL | **별도 ticket X** — Story 본문에 link / 또는 sub-task acceptance criteria |
| 강제력 | ★ 권고만 / validator 강제 X / `ticket_ref` field optional |

---

## 2. Layer 매핑

```
Initiative          ← 분석 stage 산출물 (inventory + architecture + sql-inventory + antipatterns)
  └── Epic          ← Domain (car/, payroll/, mainpay/ …)
        └── Story   ← UC-{도메인}-{번호}
              └── Sub-task    ← chain1_planning / chain2_spec / chain3_test / chain4_impl
```

---

## 3. 시점별 활동 (Plugin chain 진행 동기)

| Stage | Ticket 활동 |
|---|---|
| **Analysis 종료** | Initiative 생성 / Domain 별 Epic batch 생성 / Antipattern P0 = Tech Debt Story 별도 생성 (횡단) |
| Chain 1 시작 | (Epic 1개 in-progress / 도메인 결정) |
| **★ Chain 1 종료** | **planning-spec.json 의 use_cases[] 각각 = Story 생성** + 각 Story 에 sub-task 4개 batch 생성 (chain1 = done) |
| Chain 2 종료 | Story 의 chain2 sub-task done / BHV/AC 본문 link 갱신 |
| Chain 3 종료 | chain3 sub-task done / RED test evidence 첨부 |
| Chain 4 종료 | chain4 sub-task done / GREEN evidence 첨부 / **Story close** |
| 도메인 전체 종료 | Epic close |
| Initiative 종료 | 마이그레이션 완료 |

---

## 4. Traceability matrix 연동

`schemas/traceability-matrix.schema.json` 의 matrix item 에 `ticket_ref` optional field (★ v8.6.0+):

```json
{
  "use_case_id": "UC-CAR-007",
  "status": "green",
  "ticket_ref": {
    "platform": "jira",
    "id": "MIG-1234",
    "url": "https://company.atlassian.net/browse/MIG-1234",
    "epic_id": "MIG-1000",
    "initiative_id": "MIG-1",
    "subtask_ids": {
      "chain1_planning": "MIG-1235",
      "chain2_spec": "MIG-1236",
      "chain3_test": "MIG-1237",
      "chain4_impl": "MIG-1238"
    }
  }
}
```

★ field 모두 optional — ticket 시스템 사용 안 하는 PoC 는 그대로 omit (회귀 영향 0).

---

## 5. 권장 ticket summary 형식

| Ticket 유형 | Summary 형식 | Description 본문 |
|---|---|---|
| Initiative | `[MIG] {프로젝트} legacy → {target stack} 전환` | analysis 산출물 4종 요약 + R# carry |
| Epic | `[MIG/{domain}] {도메인} 마이그레이션` | inventory / architecture / sql-inventory 의 해당 domain 부분 |
| **Story** | `[UC-{도메인}-{번호}] {use_case.name 또는 description 1줄}` | planning-spec.json 의 use_case 본체 + source_grounded_evidence + acceptance_criteria_refs |
| Sub-task | `chain{N}/{stage_name} — {UC ID}` | (e.g., `chain1/planning — UC-CAR-007`) |
| Tech Debt Story (AP P0) | `[AP-{cat}] {antipattern.name}` | antipatterns.json 의 AP 본문 |
| Spike (BR) | `[BR-{도메인}-{이름}] 정책 결단` | rules.json BR 본문 + 도메인 전문가 위임 |

---

## 6. BHV / AC / TC / IMPL 별 별도 ticket 금지 사유

★ 다음 이유로 별도 ticket 만들지 마세요:

1. **폭증 위험**: 1 UC 당 N BHV × M AC × K TC × L IMPL = Story 1개당 ticket 수십~수백
2. **중복 정보**: Plugin 의 chain-coverage-validator 가 이미 backward link 의무 / traceability matrix 가 모든 link 추적 = ticket 시스템과 1:1 중복
3. **process vs artifact 영역 분리**: BHV/AC/TC/IMPL = artifact 영역 (chain harness 내) / Story = sub-task = process 영역. 섞으면 ticket 시스템이 artifact store 로 오용
4. **변동 위험**: chain 2 진행 중 BHV/AC 가 추가/변경 = ticket update 빈도 폭증

★ 권장: BHV/AC/TC/IMPL ID 는 **Story description 또는 sub-task acceptance criteria 에 link 만** — ticket 자체 X.

---

## 7. 예외 케이스 — 별도 ticket 권장

| Case | Ticket 유형 | 이유 |
|---|---|---|
| Antipattern P0 회피 작업 | Tech Debt Story (Epic 외) | 횡단적 / 모든 Domain Epic 영향 (예: Java 1.8 EOL / zero-test / scriptlet XSS) |
| 도메인 횡단 비즈니스 룰 (BR) | Spike (Story 의 prerequisite) | 단일 UC 에 속하지 않는 정책 결단 |
| Plugin 자체 fix (carry list) | Bug (별도 plugin 프로젝트) | 마이그레이션 외부 |

---

## 8. 라이선스/플랫폼별 구현 방법

| 플랫폼 / 라이선스 | Initiative 표현 | Epic ↔ Story | Sub-task |
|---|---|---|---|
| Jira Standard | Label (`migration-{project}`) 또는 Big Epic + Issue Link | 정식 Epic Link | Sub-task type |
| Jira Premium + Advanced Roadmaps | 정식 Initiative type | 정식 Epic Link | Sub-task type |
| Linear | Project | Cycle 또는 Parent Issue | Sub-issue |
| GitHub Issues | Milestone (or `[INITIATIVE]` label) | Issue + `[EPIC]` label + task list | Issue checkbox + Linked Issues |
| Azure DevOps | Initiative work item type | Epic ↔ Feature/User Story | Task |

---

## 9. 강제력 (★ Tier 1 = 권고만)

- **★ validator 강제 X** — 이 정책은 plugin 사용자/조직별 결단
- `traceability-matrix.schema.json` 의 `ticket_ref` field 는 **optional** — omit 가능
- 본 정책 미준수 = **finding 아님** (단 ticket 시스템 사용 시 본 정책 권장)
- ticket 미사용 PoC 는 본 정책 무영향 (regression 0)

---

## 10. v9.0+ carry — Tier 2/3 (미진입)

| Tier | 형태 | 비용 | 진입 시점 |
|---|---|---|---|
| **Tier 1 (현재)** | 정책 문서 + schema field + id-convention | ~30분 | **★ v8.6.0** |
| Tier 2 (carry) | chain 1 종료 시 ticket payload (CSV/JSON) 자동 emit skill (`planning-ticket-emit`) — file emit 만 / API 호출 X | ~2시간 | v8.7.0+ 후보 (MINOR) |
| Tier 3 (carry) | Jira / Linear / GitHub Issues platform adapter (`tools/ticket-emitter-{platform}/`) — real API 호출 / no-simulation evidence 의무 | ~4~6시간 / platform | v9.0+ charter review (외부 시스템 통합 카테고리 신설) |

---

## 11. Cross-link

- 결단 record: `decisions/DEC-2026-05-18-ticket-binding-policy.md`
- ID 명명 규약: `methodology-spec/id-conventions.md` §"Ticket Binding"
- Schema field: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref
- 검증 sample: `tools/schema-validator/test/ticket-binding.test.js`
