# DEC-2026-05-12-sub-rule-v1.1-갱신

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-12 |
| 상태 | 승인 (★ ★ ★ ★ sub-rule `spring41-ibatis2-isomorphic.md` v1.0 → v1.1 minor 갱신 / KL-SATD 인용 정정 + 3 사내 PoC isomorphic 표 강화 + 신뢰도 단계 5 강 + §X automation ceiling R1' 신규 + 외부 권위 보강) |
| 카테고리 | methodology / sub-rule minor 갱신 (★ 본문 보강만 / ADR-CHAIN-010 자체 변경 ❌ / schema 변경 ❌ / chain harness 5 요소 변경 ❌) |
| 관련 | DEC-2026-05-12-r1-가설-revisit (★ critical finding origin), DEC-2026-05-12-in-place-read-정책-채택, DEC-2026-05-12-v2.3.0-final (sub-rule v1.0 origin / ADR-CHAIN-010) |

---

## 1. 컨텍스트

PoC #11 (EFI-WEB billing) Day 1.5 측정 + DEC-2026-05-12-r1-가설-revisit critical finding → 사용자 결단 (β) "본체 methodology R1' 검토 우선 (PoC suspend)". 4원칙 1원칙 plan (`~/.claude/plans/h-r1-revisit-본체-검토.md`) + 4원칙 2원칙 research (3 light sub-agent 병렬 / `~/.claude/plans/h-r1-revisit-research.md`) 후 → 4원칙 3원칙 사용자 결단:
- sub-rule v1.1 일괄 갱신 (★ KL-SATD 인용 정정 + §X 신규 + §3 표 강화)
- §X 만 진행 / PoC #11 0 SATD 해석 정정 보류 (★ Day 3.5 PoC #11 종결 시 carry)
- WebFetch skip (F-015 cross-validation 충분)

★ ★ research 가 추가 trigger 한 **critical 신규 finding 1**: ★ ★ ★ **KL-SATD 인용 오류 발견** ("Korean Language" → "Keyword-Labeled" / SQJ 2024 DOI 10.1007/s11219-023-09655-z).

---

## 2. 결단

sub-rule `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.0 → **v1.1 minor 갱신**:

### 2-A. ★ ★ ★ §AP-005 KL-SATD 인용 정정 (★ critical)

**Before** (v1.0):
> Maldonado & Shihab (2015) KL-SATD 패턴 (Korean Language Self-Admitted TD)

**After** (v1.1):
> Keyword-Labeled SATD (KL-SATD) per Software Quality Journal 2024 (Vol 32 / pp.391–429 / DOI: 10.1007/s11219-023-09655-z) — "consciously admitted debt marked with keywords like TODO, FIXME, HACK". 5 SATD type 분류 (design / requirement / defect / test / documentation) per Maldonado & Shihab 2015 (IEEE 7th International Workshop on Managing Technical Debt).

### 2-B. §3 표 강화 → ≥ 3 사내 PoC isomorphic

기존 ≥ 2 PoC (PoC #06+#07) → **≥ 3 사내 PoC (PoC #06 단일 + PoC #11 작은 단일 + PoC #07 다중책임 / scale-cross 3 spectrum)** isomorphic 자격 사실 확보.

- 5 AP 중 2종 (Map + WITH NOLOCK) = ★ ★ ★ 3 사내 PoC 모두 corroboration
- 3종 (Anemic + 공유 SQL 부재 + SATD) = ★ 2 PoC corroboration (PoC #11 작은 scope 효과로 형식상 다름 / R1' scope 효과 정합)

### 2-C. §4 신뢰도 단계 5 강 (★ v1.1 신설)

기존 단계 5 (90%) → **단계 5 강 (90~95%)** 신설:
- ≥ 3 사내 PoC isomorphic + ≥ 3 spectrum + 핵심 AP 3 PoC corroboration
- R1' original empirical finding 보강

### 2-D. ★ ★ ★ §X 신규 절 — automation ceiling R1' (★ critical)

신규 §X 추가 — Spring 4.1+iBATIS 2 paradigm = analysis 단계 §3-A automation ceiling ~53~55% (★ 3 사내 PoC isomorphic).

**R1' (revised)**: paradigm × 책임 × trivially deterministic 효과 복합 → ceiling 형성.

**외부 권위 STRONG 정합** (3 light sub-agent F-015 cross-validation):
- ★ Zhang ICSE 2025 (arxiv 2406.09834v3) DUR legacy 70~90% vs up-to-date 9~18% (★ R1' paradigm 방향)
- ★ LongCodeBench (arxiv 2505.07897v3) Claude 3.5 32K→256K 29%→3% (★ R1' scope 효과)
- Context Length Alone Hurts (arxiv 2510.05381v1) input 길이 단독 변수 13.9~85% 저하
- Gartner Application Innovation Summit 2025

**original empirical finding** (외부 권위 부재):
- 정량 ceiling (Legacy ~53~55% / Modern ~63~67%) = 본 사내 5 PoC isomorphic 6 차원 corroboration
- counterexample (PoC #07 다중책임 5509 LOC > PoC #06 단일 345 LOC) = original finding

**paradigm modernization 시 ceiling 돌파**: PoC #08 MyBatis 3 = 66.7% / PoC #09 NestJS TypeORM = 63.6% / PoC #10 Spring Data JPA = 60%.

### 2-E. §6 확장 carry 갱신

- ~~iBATIS 2 전용 dynamic 태그 sub-classification~~ ✅ **resolved 2026-05-12** (v2.3.1 PATCH commit `bc48477` / tag_type enum 26종)
- 다중책임 spectrum 강화 carry = PoC #11 ★ NOT 다중 → 자격 ❌ / 다음 다중책임 PoC carry 잔존
- ★ ★ 신규: PoC #11 0 SATD 해석 정정 carry (★ Day 3.5 종결 시)
- ★ R1' automation ceiling 외부 권위 정량 비교 carry (★ open)

### 2-F. §7 참조 갱신

- ★ ★ Software Quality Journal 2024 (DOI 10.1007/s11219-023-09655-z) 추가
- Maldonado 2015 IEEE MTD workshop 출처 정확화
- Zhang ICSE 2025 + LongCodeBench + Context Length Alone Hurts + Gartner 2025 신규 권위
- PoC #11 산출물 (input/ + sql-inventory.json) cross-link

---

## 3. 본체 영향 (★ schema 변경 ❌)

| 자산 | 영향 | 의무 |
|---|---|---|
| sub-rule `spring41-ibatis2-isomorphic.md` | ★ ★ ★ v1.0 → v1.1 minor 갱신 | ✅ 본 결단 |
| ADR-CHAIN-010 | ❌ 자체 변경 ❌ | 없음 (sub-rule 본문 보강만) |
| schemas | ❌ 변경 ❌ | 없음 |
| chain harness 5 요소 | ❌ 변경 ❌ | 없음 |
| flows | ❌ 변경 ❌ | 없음 |
| tools | ❌ 변경 ❌ | 없음 |
| skills | ❌ 변경 ❌ | 없음 |
| CLAUDE.md "AI 자동화 ≥ 85%" | ❌ 변경 ❌ (★ chain harness 전체 axis / §3-A ≠ 85%) | 없음 |
| memory `project_methodology_scope.md` "70~80% 한계" | ❌ 변경 ❌ (★ 별도 axis) | 없음 |
| DEC-2026-05-08-poc-07-종결 (★ historical / KL-SATD "Korean Language" 인용 명시) | ★ historical 보존 (no 갱신 의무) — note 추가 후보 (★ optional) | ❌ 의무 ❌ (★ 본 DEC §2-A 정정 = 본체 sub-rule 적용 / historical document 갱신 ❌) |

★ ★ ★ **sub-rule 단일 자산 갱신 + DEC 1건** = 전체 본체 영향.

---

## 4. release 자격

| 자격 | 판단 | 결과 |
|---|---|---|
| MAJOR (v3.0.0) | ❌ — paradigm/사상 변경 ❌ | reject |
| MINOR (v2.4.0) | ★ optional — sub-rule v1.1 minor 보강 / 단, schema 변경 ❌ + ADR 신설 ❌ + chain harness 5 요소 변경 ❌ → MINOR 자격 부족 | reject |
| **PATCH (v2.3.2)** | ★ ★ ★ **추천** — sub-rule 본문 보강 + DEC 2건 (in-place + r1-revisit + sub-rule-v1.1) / no new ADR / no schema 변경 / chain harness 5 요소 변경 ❌ | ★ ★ ★ 정합 |
| no release (★ patch 누적) | ★ optional — 본 결단 만으로 release skip / PoC #11 종결 후 일괄 release | ★ optional |

★ ★ ★ release 자격 결단 = ★ 별도 사용자 결단 의뢰 의무 (★ 본 DEC 등재 + commit 후).

---

## 5. carry 매핑

### resolved by 본 결단

- ★ ★ ★ **C-r1-hypothesis-revisit** ✅ resolved (★ critical / sub-rule §X 등재)
- ★ ★ **C-automation-ceiling-paradigm** ✅ resolved (★ sub-rule §X 등재)
- ★ ★ ★ **KL-SATD 인용 오류** ✅ resolved (★ §AP-005 정정 / Agent 1 research 기반)
- **iBATIS 2 dynamic 태그 sub-classification carry** ✅ resolved (★ v2.3.1 PATCH 정합 / §6 갱신)
- ★ ★ **C-v2.2.0-spring41-ibatis2-subrule** ✅ resolved (★ ★ ★ 3 사내 PoC isomorphic 자격 ★ 충족 / sub-rule v1.1 강 등급 + R1' 보강)

### 신규 carry

- **C-poc-11-0-satd-해석-정정** (★ Day 3.5 PoC #11 종결 시 / "Modern OSS reference 정합" 결론 ❌ / single-case strict 미부합 명시)
- **C-r1-prime-자격-Modern-corroboration** (★ Modern stack sub-rule 본격 자산화 시 R1' Modern ceiling ~60~67% sub-rule 명문화)

### 잔존

- PoC #11 Day 2.0~3.5 (★ 사용자 결단 후 resume)
- C-poc-11-source-디렉토리-cleanup (낮은 우선순위 / Day 3.5)
- C-egovframework-sub-rule (★ Day 1 정탐 후 결정 / Modern stack sub-rule 정합 carry)

---

## 6. 4원칙 정합

| 원칙 | 본 결단 정합 |
|---|---|
| 1원칙 (깊은 숙지 + plan) | ✅ plan h-r1-revisit-본체-검토.md (4 자산 전수 조사) |
| 2원칙 (research) | ✅ plan h-r1-revisit-research.md (3 light sub-agent 병렬 + F-015 cross-validation) |
| 3원칙 (사용자 승인) | ✅ 사용자 결단 ("sub-rule v1.1 일괄 (★ 추천)" + "§X 만 진행 / PoC 해석 보류" + "WebFetch skip") |
| 4원칙 (실패 시 Revert) | ✅ Lessons Learned = 본 결단 §7 등재 |

---

## 7. ★ Lessons Learned

1. ★ ★ ★ **인용 오류 위험** — KL-SATD = "Korean Language" 해석은 ★ ★ 한국어 표현 + 자체 PoC 경험 (★ "폐해" / "짜증나" 등 한국어 자조 SATD 발견) 의 자연 추론. 단, 실제 학술 정의 = "Keyword-Labeled" (★ 전혀 다름). ★ ★ academic 인용 시 ★ 원 paper 또는 DOI 확인 의무 (★ memory `feedback_sub_agent_validation.md` F-015 cross-validation 패턴 추가 적용 의무).

2. ★ ★ **외부 권위 부재 → original finding 라벨 의무** — R1' 정량 ceiling (~53~55%) = Spring 4.1+iBATIS 2 specific academic ❌. ★ ★ 사내 measurement = original empirical finding 라벨 + ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정책 정합 적용 가능.

3. ★ **단일 PoC measurement 후 가설 revisit 즉시 valid** — R1 가설 = PoC #07 측정 후 자연 형성 / PoC #11 측정 후 즉시 반증 → R1' 새 가설. ★ "≥ 2 PoC 의무" 는 ★ AP/패턴/사상 의무 / 가설 revisit 자체 = ★ 단일 PoC measurement 도 valid (단, 신뢰도 단계 명시 의무).

4. ★ ★ **본체 보강 vs PoC 산출 분리 원칙 정합** — PoC #11 Day 2.0~3.5 suspend + 본체 보강 우선 = ★ memory `feedback_methodology_body_priority.md` 패턴 정합 (★ "본체 격상 우선 / PoC 산출물 후순위").

---

## 8. 참조

- 사용자 결단 (β) 2026-05-12 "본체 methodology R1' 검토 우선 (PoC suspend)"
- 사용자 결단 (γ) 2026-05-12 "sub-rule v1.1 일괄 (★ 추천)" + "§X 만 진행 / PoC 해석 보류" + "WebFetch skip"
- plan h-r1-revisit-본체-검토.md (★ 4원칙 1원칙)
- plan h-r1-revisit-research.md (★ 4원칙 2원칙 / 3 sub-agent 결과 + F-015 cross-validation)
- DEC-2026-05-12-r1-가설-revisit.md (★ critical finding origin)
- DEC-2026-05-12-in-place-read-정책-채택.md
- sub-rule v1.1 갱신본: `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md`
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
- F-015 cross-validation 패턴 (memory `feedback_sub_agent_validation.md`)

---

## 9. ★ 정합 요약 한 줄

★ ★ ★ sub-rule v1.0 → v1.1 minor 갱신 / KL-SATD 인용 정정 + 3 사내 PoC isomorphic 표 강화 + R1' automation ceiling §X 신규 / 본체 schema 변경 ❌ / release 자격 = PATCH v2.3.2 추천 (★ 사용자 별도 결단 의뢰).
