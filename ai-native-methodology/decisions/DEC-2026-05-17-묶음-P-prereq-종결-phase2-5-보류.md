# DEC-2026-05-17-묶음-P-prereq-종결-phase2-5-보류

- **상태**: 승인 (★ ★ ★ 사용자 결단 3건 / 묶음 P 자율 시행 후 gate)
- **일자**: 2026-05-17 (★ session 24차 / no version bump / carry only)
- **결정자**: 윤주스 (TF Lead) — 사용자 prompt "묶음 P 해줘" → gate 결단 3건 → "push"
- **관련**: DEC-2026-05-17-rules-schema-enforcement-strengthen (⑤ carry source / "≥ 7 PoC 도달 후 재평가" 조건) / ADR-CHAIN-011-BR-dual-representation-paradigm §5 / LL-i-44 (drift BR DRIFT 격상 자산 paradigm) / plan-rules-phase2-prereq-poc-coverage-expansion.md §11~§12

---

## 컨텍스트

DEC-2026-05-17-rules-schema-enforcement-strengthen 에서 ⑤ cross_consistency_check inline 을 carry 처리 (Senior REVISE — PoC 적용률 3/14 시기상조 / "≥ 7 PoC 도달 후 재평가" 조건 명시). 동 DEC 의 3 sprint 분할 carry plan (plan §11) 에 따라 사용자 "묶음 P 해줘" 결단으로 prerequisite 전 chain 자율 시행.

**묶음 P 정의** = Sprint 1 (schema cleanup / pre-pre-prereq) → Sprint 2 (NL/GWT dual representation / pre-prereq) → Sprint 3 (Layer 2 LLM corroboration) → Phase 2 본격 (⑤).

---

## 결정

### §1. 묶음 P prerequisite 전 chain 자율 시행 (Sprint 1~3 종결)

| Sprint | 결과 | commit |
|---|---|---|
| Sprint 1 (1-B~1-J + 1-I / 10 sub-sprint) | 전체 11 PoC rules.json schema VALID + `analysis_validator_violation` criterion = PoC #01+#05 한정 → 전체 11 PoC auto-discover 전수 격상 | 9 |
| Sprint 2 (4 PoC / 30 BR) | #02·#04 GWT→NL + #08·#10 NL→GWT dual representation 양쪽 보유 (additive only) | 4 |
| Sprint 3 (4 PoC / 8 dispatch) | Sonnet 4.6 phase-c + Haiku 4.5 blind retrospect → ★ Layer 2 corroboration **7 PoC** 도달 (poc-01/02/03/04/05/08/10) | 3 |
| carry 기록 | 본 DEC + plan §12 + memory | 1 |

회귀: release-readiness **11/11 release-ready** / workspace **364/364** / chain harness validated 본질 보존 / 0 회귀.

### §2. ★ ★ ★ 핵심 발견 — PoC #08 echo-chamber drift (방법론 가치 본격 실측)

Sprint 2 GWT 합성 (Sonnet 4.6) 이 `is_intent=false` / `is_likely_bug=true` metadata 무시 → BR-PETSTORE-PASSWD-006 (평문 password 보안버그) + BR-PETSTORE-ORDQRY-005 (N+1 anti-pattern) 을 정상 비즈니스 규칙처럼 정규화.

- **동일 모델 Sonnet 4.6 Layer 2** = 미검출 (0.93 / 0.90 / echo chamber)
- **독립 Haiku 4.5 blind retrospect** = 검출 (0.55 / 0.58 / 2 critical drift)

→ same-model self-eval bias 정량 + cross-model blind retrospect 가 dual-representation drift 를 실제 검출. industry-first paradigm (Spec Kit / AWS Q / DMN / Drools / Spectral / AutoUAT 모두 부재) + Adzic SBE 10년 폐기 함정 회피 자격 본격 실측 입증.

**처분 (LL-i-44 정합)**: rules.json 변경 ❌ / `C-poc08-drift-passwd-ordqry` = Phase D 도메인 전문가 검토 carry. release-readiness check9 = poc-01/03/05 한정 보존 (poc-08 미산입 / 본 drift = 의도된 carry).

### §3. ★ ★ Phase 2 ⑤ 사용자 결단 3건 (session 24차 gate)

| # | 결단 | 채택 | 근거 |
|---|---|---|---|
| #1 Phase 2 ⑤ 진행 시점 | **보류 / 별도 session** | ≥7 PoC 재평가 trigger 충족 인지 / inline-vs-분리 설계 결단 + rules.schema.json SSOT 변경 + MINOR bump 동반 = 별도 4원칙 sprint 의무 |
| #2 ⑤ 설계 제약 (★ 확정 carry) | **"분류 보존 강제 포함"** | PoC #08 bug-정규화 drift 차단 — ⑤ cross_consistency_check 는 `intent_vs_bug_classification` 보존을 검증 항목으로 명시 의무 / schema §6 강화 동반 / ★ 다음 session ⑤ sprint 진입 시 본 제약 = 사용자 확정 입력 (재논의 ❌) |
| #3 push / version | **지금 push (carry only)** | 18 commit (b96fb84~85f1e6a) origin push / version bump ❌ (data collection + Sprint 1-I criterion 격상 = 다음 release v4.1.0 MINOR 후보로 일괄) |

### §4. 계획 외 발견 처리 (Sprint 1-J)

Sprint 1-I 진입 중 PoC #03 (NestJS) rules.json INVALID 76 errors 발견 — `feedback_pre_pre_prerequisite_lacuna` 재현 (PoC #01+#05 한정 criterion 사각지대). quality 1순위 + drift-enforcement 정합 → 사각지대 carry 거부, Sprint 1-J 신설 즉시 보정 (18 title + meta 표준화 + concerns type). 본 사례 = Sprint 1-I criterion 전수 격상의 입증 근거.

---

## 다음 session entry-point (★ 우선순위)

1. **Phase 2 ⑤** (1순위 / 진입 자격 충족) — inline(CodeQL) vs 분리(Spec-Kit) 결단 + "분류 보존 강제 포함" 확정 제약 + v4.1.0 MINOR. 4원칙 (plan + 3-에이전트 research + 사용자 결단 + 시행).
2. **묶음 Q** (P 종결 후) — ① alias 4중첩 폐기 / ② BR 표현 4→2 단일화 / ④ severity cross-stage mapping / ⑦ rules.json → business-rules.json rename.
3. **별도 carry** — PoC #05 Haiku retrospect / LL-i-46 (pre-pre-prereq 재현) + LL-i-47 (echo-chamber drift 실측) 자산화 / C-poc08-drift-passwd-ordqry Phase D 검토 / version 결단 (다음 release).

---

## 영향

- **breaking change ❌** — 본 DEC = carry only (코드/schema 본체 변경 = Sprint 1-I release-readiness.js criterion 격상 1건 / additive enforcement / 신규 criterion ❌ / test 364/364 보존).
- **자산 신설** — `tools/br-cross-consistency-validator/layer-2-results/` 안 sub-domain-synthesis 5 + title/schema-cleanup 3 + nl/gwt-synthesis 4 + layer-2-results 4 + haiku-retrospect 4 (PoC #02/04/08/10).
- **paradigm 강화** — Layer 2 corroboration 3 → 7 PoC / echo-chamber self-eval bias 실측 / Adzic SBE 함정 회피 자격 본격.
- **SSOT** — 본 DEC + plan §12 + memory `project_session_22_23_state.md`. 다음 session 진입 컨텍스트.
