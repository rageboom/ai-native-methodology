# research-s2-gate-block-upgrade — Phase 2 (경량 2-agent)

> plan-s2-gate-block-upgrade.md 동반. Senior(설계·paradigm·§8.1) + Industry(advisory→enforcing maturation). 공식문서 axis 생략(jest/git 사실 = 본 세션 직접 실행 검증 / no-simulation).

## A. Senior 리뷰 (GO_WITH_REVISE @ 0.82 / 모든 load-bearing claim raw source 검증)

| Q | 판정 | 요지 |
|---|---|---|
| Q1 §8.1 2/2 충분성 | **GO @ 0.85** | distinct 강함(도메인 blog↔e-commerce / Java↔TS / MyBatis3↔Prisma / JUnit↔jest = carry 예시 same-stack Spring 보다 강함). ≥3 = speculative hardening = cooling-off 폐기 + "충족 후 즉시 격상" paradigm 위반 = gate-without-teeth 재발. |
| Q2 격상 메커니즘 | **REVISE @ 0.88** | `hasCriticalOrHigh` predicate 수정 ❌ (그 술어 = "critical/high severity" 의미 / 오염). **별도 `HARD_BLOCK_CODES` Set 신설**: `new Set(['validator_critical','validator_high','s2_outcome_mismatch'])`. layer2_threshold/coverage_threshold/findings_unverified(rank 2) WARN 의도 무변경. **주의**: rank 2→1 시 s2 가 findings_unverified 위로 정렬 → primary_reason 순서 단언 테스트 영향 확인. |
| Q3 MINOR vs MAJOR | **MINOR @ 0.80** | gate-eval.js:40,117,121 가 "WARN until ≥2 corroboration" in-band 선언 = 임시 placeholder. API signature·schema 무변경 / S2 scenario 1개 runtime decision flip. CHANGELOG behavioral note 로 크게 표기. |
| Q4 round-trip 필요? | **GO @ 0.90** | 방법론 SSOT(`DEC-2026-05-30-s2-augmentation-green-roundtrip.md` L46-49)가 carry 분리: round-trip=mechanism(RESOLVED single-domain) / block-upgrade=carry ①=≥2 distinct domain **execution corroboration 만**. round-trip 재증명=RESOLVED carry 재litigate=불필요. |

**Senior failure-mode 경고 (no-simulation enforcement)**:
1. refund() augmentation 실재 — Senior 가 grep 으로 `refund` zero-hit 확인 / 기존 메서드(create/findAll/findOne/review/update/remove) plan L47 일치 → RED arm = "method 부재" = RealWorld `DELETE /user` isomorphic.
2. **RED 는 실 `npx jest` 산출 의무** — 구성 literal `outcome_mismatches` 핸드 작성 = simulation creep = -5%p. harness 는 실 methodology 모듈(correlateByTcId→reconcileOutcomes→evaluateGate) import + 실 jest 출력 fed.
3. **WARN 테스트 삭제 ❌ 반전** — scenario.test.js:136-141 → `decision==='block'` + `user_override_rejected===true`. + 회귀 케이스(layer2_threshold/findings_unverified 는 여전히 go-with-warnings = Q2 분리 set isolation 입증).

## B. Industry 리서치 (advisory→enforcing maturation)

- **수치 임계 표준 없음**: "N회 corroboration 후 enforcing" 명문 사례 부재. 2 패턴 수렴 — (1) ratchet(Notion/imbue): 신규 위반=0 유지 = enforcing 조건 / (2) confidence 수동격상(Semgrep Monitor→Comment→Block): 팀 신뢰도 주관 판단.
- **semver 핵심 분기 (typescript-eslint 공식 정책)**: public preset/recommended config 의 severity(warn→error) 변경 = **MAJOR**. 단 internal-only / user-config 무변경 = **minor/patch 선례 있음**.
- 출처: notion.com/blog ratcheting / semgrep.dev/docs/semgrep-code/policies / typescript-eslint.io/users/versioning / github imbue-ai/ratchets.

**적용**: 우리 S2 gate = chain-driver `gate-eval.js` **내부** / adopter config·schema·API signature **무변경** / S2 scenario runtime decision flip 뿐 → typescript-eslint "internal-only = minor" 선례 정합 → **MINOR + 강한 CHANGELOG behavioral note**. (Senior MINOR@0.80 와 수렴.)

## C. 종합 결론 (Phase 3 사용자 결단 입력)

1. §8.1 2/2 (RealWorld + ecommerce) = 격상 자격 충족 (≥3 불요).
2. 메커니즘 = **별도 `HARD_BLOCK_CODES` Set** + severityRank s2 2→1 + primary_reason 순서 테스트 영향 확인.
3. 버전 = **MINOR** + CHANGELOG behavioral note (override 계약 변경 명시).
4. round-trip 불요 — execution corroboration(char GREEN + aug RED + gate blocked=false + 음성대조)만.
5. corroboration 은 **실 jest 실행** 의무 (구성 literal ❌ / 실 모듈 import harness).
