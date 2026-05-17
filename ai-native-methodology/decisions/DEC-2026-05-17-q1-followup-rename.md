# DEC-2026-05-17-q1-followup-rename

- **상태**: 승인 (★ 사용자 "추천안 묶음 + 지금 시행" / 4원칙 lightweight / v6.1.0 MINOR)
- **일자**: 2026-05-17 (★ session 26차 연속 / v6.1.0 MINOR / 사용자 "지금 시행" cooling-off 생략)
- **결정자**: 윤주스 (TF Lead) — 사용자 "1"(묶음 Q 잔여) → "Q-①-followup 먼저"(risk 오름차순) → "추천안 묶음 + 지금 시행"
- **관련**: DEC-2026-05-17-q1-alias-4중첩-폐기 §1 #4 + LL-i-52 (carry origin / "semantic-rename ≠ alias 폐기") / DEC-2026-05-17-q2-br-표현-4to2 (직전 v6.0.0) / ADR-CHAIN-011 §5 patch v15 + §9 LL-i-56

---

## 컨텍스트

묶음 Q ① alias 4중첩 폐기(v5.0.0) 시 `rules_auto_extracted_reference` = object/provenance pointer (타 산출물 자동추출 BR cross-link / BR-list alias 아님) → Senior Q1 으로 ① scope 외 분리 + 별도 carry Q-①-followup (semantic-rename ≠ alias 폐기 / LL-i-52). 묶음 Q ②(v6.0.0) 종결 후 사용자 "1" → 잔여 ⑦+Q-①-followup risk 오름차순 → Q-①-followup 먼저 (blast 11 files / src consumer 0).

## 결정

### §1. 사용자 결단 (추천안 묶음 + 사실 확정)

| D | 결단 | 근거 (3-에이전트 수렴) |
|---|---|---|
| D1 version | ★ **v6.1.0 MINOR** (사실 확정 / choice ❌) | official-docs(semver spec MAJOR 강제 ❌ / public API 경계=프로젝트 재량) + industry(zero-consumer 실용주의 + 연속 MAJOR signal 희석 batch 통설) + Senior(src consumer 0 + poc-04 단일 holder atomic 마이그레이션 = textbook MINOR additive-equivalent / v7.0.0 = semver inflation = 역방향 integrity drift / LL-i-52 'semantic-rename ≠ alias 폐기' → version 논리도 분리) |
| D2 문서 처분 | 역사 DEC/STATUS/INDEX = 보존 / 활성 SSOT 만 갱신 + ★ schema description forward-pointer 재작성 | Senior CONCUR + 누락 보정 (schema 자체 forward-pointer = active SSOT) |
| D3 cooling-off | 지금 시행 (생략) | 사용자 명시 / ①② 동형 |
| D4 guard test | canonical-single-alias.test.js 보존→rename후 보존+구명 재유입 0 전환 + ② guard 비교란 확인 | Senior CONCUR + 추가 |
| process | ★ lightweight (3-에이전트 가벼운 sub-agent / full Phase-3 생략) | ★ ★ LL-i-54 정당 (breaking 동형 ≠ 비용 동형 / 11 file·src consumer 0·순수 rename) — ① DEC §1 #4 "별도 plan+4원칙" 문자적 일탈을 LL-i-54 로 정당화 (향후 "왜 full research 생략?" drift 회피 위해 본 DEC 명시) |

★ version = **v6.1.0 MINOR 사실 확정** (선택지 아님 / ① "version=사실 확정" 선례 정합). ① "MINOR 호칭=integrity drift" 는 alias 폐기+real consumer 맥락 한정 — 본 건은 반대로 v7.0.0 강제가 semver inflation = integrity drift.

### §2. 시행

- **rules.schema.json** — property `rules_auto_extracted_reference` → `auto_extracted_br_refs` rename + description 갱신 + 최상단 title v6.1.0 + 최상단 description forward-pointer **재작성**(carry 표기 → 완료 표기 / Senior 누락 보정).
- **examples/poc-04-full-realworld-react/analysis/6-quality/rules.json** — key rename (유일 holder / per-file Edit / atomic 동시 마이그레이션 = no consumer observes break).
- **tools/drift-validator/test/canonical-single-alias.test.js** — `rules_auto_extracted_reference 보존` test → `auto_extracted_br_refs 보존 + 구명 재유입 0` 전환. ② guard block (businessRule anyOf 2 branch) 비교란 확인 (8/8 pass).
- **ADR-CHAIN-011 §5 patch v15 + §9 LL-i-56 + CHANGELOG v6.1.0 + INDEX 최상단 + plugin.json 6.0.0→6.1.0 + CLAUDE.md + STATUS**

### §3. STOP signal 처리

- STOP = 없음 (Senior no blocking). src consumer 0 (br-cross-consistency-validator/schema-validator/release-readiness/skills/templates 전수 grep = 11 files 중 src 0 / 문서·test·schema·poc-04 만) = risk 최소 / load-bearing consumer 부재 (LL-i-55 close round 불요).

## 회귀 검증

- poc-04 rules.json schema VALID ✅ (rename 후 정합) / drift-validator canonical **8/8** (① guard 전환 + ② guard 비교란 확인) / release-readiness 11/11(목표) / chain harness validated 본질 보존.
- MINOR = additive-equivalent (no consumer observes break / 외부 consumer 0 / poc-04 atomic). breaking 호칭 ❌ (semver 정합).

## 본 결단으로 묶음 Q 진행

- ①(v5.0.0) ②(v6.0.0) ④(v4.1.1) **+ Q-①-followup(v6.1.0)** 종결. **잔여 = ⑦ 단독** (rules.json→business-rules.json rename / 642 occ·252 files / breaking 최대 / 별도 session + 4원칙 full + cooling-off).

## Lessons Learned 등재 (★ session 26차 / ADR-CHAIN-011 §9)

- **LL-i-56** — "동일 cluster(묶음 Q) 내 항목이라도 consumer 분포·breaking 성격 차이 시 version tier 분리 의무 — alias 폐기(real consumer / valid→invalid / MAJOR) vs semantic-rename(zero consumer / atomic 동시 마이그레이션 / MINOR additive-equivalent). scope 분리(LL-i-52)는 version tier 분리를 **동반**해야 정합 — 일괄 MAJOR 강제 = semver inflation = 역방향 integrity drift. + 소작업 process depth = LL-i-54 정합 (breaking 동형 ≠ 비용 동형 → lightweight research 정당 / 단 DEC 에 일탈 근거 명시 = 향후 drift 회피)."

## 출처

- official-docs (`_base-official-docs-checker`) — old key invalid VERIFIED / semver MAJOR 강제 ❌ (프로젝트 재량) / rename 공식 권고 부재
- industry-case (`_base-industry-case-researcher`) — Cargo/K8s rename=MAJOR 우세 but zero-consumer alias 병존 생략 정당 / Akka.NET 실용주의 MINOR / ING·SemVer 연속 MAJOR batch 통설
- Senior critique (`_base-senior-engineer`) — REVISE-2 (D1 v6.1.0 MINOR integrity-correct / schema forward-pointer 누락 보정 / lightweight LL-i-54 정당 / version=사실확정 framing)
- plan = `.claude/plans/plan-q1-followup-auto-extracted-br-refs-rename.md` / research = `.claude/research/research-q1-followup-auto-extracted-br-refs-rename.md`
