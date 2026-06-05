# Research — F-SIM P0 (4원칙 §2 / 3-에이전트 lightweight 병렬 합성)

> 입력 plan: `.claude/plans/plan-fsim-p0.md` / 입력 ledger: `methodology-spec/finding-system.md` § F-SIM namespace.
> 3 sub-agent 병렬 dispatch (Senior + Official-docs F-015 ×5 + Industry-case Topic ×3 / Phase 4~6 lightweight ~10× 단축).

## 1. Senior Engineer Critique 합성

조건부 GO (conf 0.82). 4 결단 REVISE / 1 신설 / §8.1 자기정합 보강 의무.

| D                       | 결단                                                                                                      | conf | 비고                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| D1 묶음 vs 분할         | **GO** Option A 묶음 1-session MINOR                                                                      | 0.82 | 공통 뿌리 / 선례 묶음 Q⑦ blast 더 큼 / Option C 거부(F-SIM-011 진입 못함)                                  |
| D2 strict path          | **REVISE** `--strict-paths` flag warn default + release-readiness #14 baseline ratchet (v+1 default 전환) | 0.85 | F-MB-009 deferred forensic LL-i-55 함정존 회피 + 양심 의존 회귀 위험 ratchet 으로 완화                     |
| D3 poc-03 critical AP   | **GO** carry (`out_of_scope.ap_id_refs`)                                                                  | 0.78 | retrofit corroboration #2 본질 정합 / LL-fsim-03 부산물                                                    |
| D4 corroboration #2     | **REVISE → Option B** poc-03 격하 + 신규 PoC corroboration #2 별도 plan                                   | 0.72 | plan 권장 C ("정의만 강화") 거부 — "정의 강화는 corroboration 회복 아님" / 사실 reflection ≠ 자기정합 회복 |
| D5 F-SIM-005 P0         | **GO** 분리 P1                                                                                            | 0.88 | blast radius 1.5~2× 폭증 회피 / release-readiness data_source 강화로 sufficient                            |
| D6 semver + cooling-off | **REVISE 조건부 GO** MINOR + cooling-off 생략 사용자 명시 위임 시만                                       | 0.75 | additive 위주이나 D2 flag 채택 시 path 컨벤션 breaking 회피 자격                                           |
| **D7 신설**             | **REVISE** STOP-3 #15 matrix visual diff + #16 self-bootstrap assert 추가                                 | 0.80 | renderer 회귀 risk / methodology body 자기 AP-PA-_·AP-MB-_ coverage 입증                                   |

**Strongest concern (D4)**: P0 시행 후에도 §8.1 strict 7/7 release_eligibility = "정의 강화됐으나 사실 미충족" 패러독스. **P1 deadline (poc-03 chain 4 or 신규 PoC GREEN) 을 P0 결단 본문 commit-block 으로 명시 의무**.

**§8.1 자기정합 critique**:

- F-SIM-002/003 = 코드 단일 지점 → §8.1 비적용 (ground-truth 1 충분)
- F-SIM-001/004/011 = 방법론 구조 결함 claim → **≥3 PoC 사전 grep 권장** (poc-01 + poc-02 + poc-04 chain/matrix 산출물에서 동형 패턴 결정적 출력 / lightweight ~30분 / 미시행 시 LL-fsim-04 자산화 의무)

## 2. Official Docs F-015 ×5 (1차 출처 독립 fetch)

| Claim                                                   | 판정                    | 권위 강도 | 1차 출처                                                                                                                                                                                  |
| ------------------------------------------------------- | ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: BR(requirements) = traceability 1급 축 (F-SIM-004)   | **VERIFIED**            | \*\*\*\*  | DO-178C §5.5.e (rtmify.io/docs/for/do-178c) + ISO 26262 (Parasoft) + arc42                                                                                                                |
| B: severity source-grounded max-propagation (F-SIM-002) | **VERIFIED-WITH-DELTA** | \*\*\*\*  | DMN 약함(priority hit policy ≠ severity rollup) / ISO 26262 ASIL inheritance + IEC 62304 Class propagation 이 진짜 1차 권위                                                               |
| C: RED = assertion-fail / import-fail 약함 (F-SIM-005)  | **CONTRADICTS**         | **반증**  | Kent Beck "TDD by Example" 원저: "Red — Write a little test that doesn't work, **and perhaps doesn't even compile at first**" + Uncle Bob 3 Laws: "**compilation failures are failures**" |
| D: corroboration ≥N depth 명시 (F-SIM-011)              | **VERIFIED-WITH-DELTA** | \*\*\*\*  | SLSA L1~L3 (slsa.dev/spec/v1.0/levels) + CNCF graduation + OpenSSF Gold criteria = depth-level isomorphic 지지 / 직접 외부 강제 아님                                                      |
| E: AP → test coverage gate (F-SIM-001)                  | **VERIFIED**            | \*\*\*\*  | SonarQube Sonar Way Quality Gate "Security Hotspots Reviewed == 100%" 강제 + OWASP ASVS 보완 시                                                                                           |

**가설 4종 반증 결과**:

- H1 (DO-178C requirements axis 필수) = **유효** — F-SIM-004 권위
- H2 (DMN 권위 약함) = **유효** — plan §3.1 DMN 인용 → ISO 26262 / IEC 62304 교체 의무
- H3 (TDD RED 표준 = assertion-fail / import-fail 미달) = **반증 성공** — Kent Beck 원저 직접 인용으로 CONTRADICTS — **F-SIM-005 ledger/plan/DEC 표현 수정 의무**
- H4 (SLSA/OpenSSF depth-level 선례) = **유효** — F-SIM-011

### 본 research 의 가장 중요한 발견 (F-SIM-005 표현 수정)

기존 ledger `F-SIM-005` Description: "강한 RED(stub 존재 + 로직 부재 → 단언 실패)가 아니라 **약한 RED(import 부재)**" → Kent Beck 원저 기준 **틀림**. 정확한 구분:

| RED 강도                   | 정의                                                                                 | poc-05                             | poc-03                                                   |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------- |
| **Strongest**              | assertion 실패 (SUT 존재 + 로직 부재 → 단언 실패)                                    | ❌                                 | ❌                                                       |
| **Valid (Beck canonical)** | compile/import 실패 (Kent Beck 원저 명시 RED 포함)                                   | ✅ ("./user.service.js" load 실패) | ❌                                                       |
| **Weak / Non-RED**         | `pending()` / `TODO` / dry-run placeholder (Cucumber 기준 assertion 미실행 = 노란색) | ❌                                 | ❌ poc-03 `"(not run / retrofit dry-run)"` = invalid RED |

→ poc-05 = Beck-canonical RED (격하 무효 / 인용 정확) / poc-03 = invalid RED placeholder (격하 유효 / F-SIM-011 본질 확인). Ledger 본문 수정 사항: "약한 RED(import 부재)" → "**Beck-canonical RED 이나 strongest 아님 (per-TC granularity 결여 / poc-03 = invalid RED placeholder)**".

## 3. Industry Case (3 Topic × 3 Case = 9 case / OSS+vendor+managed-service)

| Topic                       | 핵심 패턴                                                                                                                                                                                       | 권장 적용 | F-SIM gap                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| **1. Severity propagation** | SonarQube (issue type + rating + review status + scope 4 독립 축) / GitHub Code Scanning (Alert + Security 2 독립 threshold) / Jira Xray (req status + test result + defect + safety class 4축) | \*\*\*\*  | "AC.MoSCoW 단일 축" = industry case 0건 / F-SIM-002 보강 방향 정합                                                  |
| **2. Antipattern coverage** | SonarQube Sonar Way (Hotspots Reviewed 100%) / GitHub CodeQL (Critical threshold merge block) / Snyk (High+ PR block)                                                                           | \*\*\*\*  | Industry 가 본 방법론보다 엄격 / "critical 무선언 silent" = 3 industry 모두 차단 default / F-SIM-001 보강 방향 정합 |
| **3. Corroboration depth**  | CNCF graduation (≥3 adopters + production-level depth + TOC interview) / SLSA L1~L3 (cumulative capability) / OpenSSF Gold (passing 67 → silver 80% coverage → gold 90%+branch)                 | \*\*\*\*  | "≥N 단순 count 만" 사례 0 / F-SIM-011 depth 명시 방향 정합                                                          |

### 메타 — industry-first 아닌 industry-aligned

세 Topic 모두 **본 방법론이 industry 를 따라가는 방향** — industry-first 자격 없음. 자산화 표현 시 "industry-aligned" 사용 의무. (DEC-2026-05-17-plugin-authoring-docs-drift LL-plugin-02 "research 수렴 ≠ 사실" 자기정합 / §8.1 단일 출처 과적합 회피 정합).

§8.1 경고: 사례 수 제한 (각 Topic 2~3) — Topic 1 Jira Xray 직접 fetch 실패(403). 반증 사례 없음 ≠ "없다" 증명. embedded / regulated medical 도메인에 MoSCoW 단일축 가능성 배제 불가.

## 4. 합성 — plan 수정 의무 (research 반영)

| plan 절                    | 수정 의무                                                                                                                                         | 출처                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| §3.1 F-SIM-002 schema 영향 | DMN 인용 제거 → ISO 26262 ASIL inheritance + IEC 62304 Class A/B/C propagation 인용 교체                                                          | F-015 Claim B               |
| §2 D1 권장                 | A 묶음 유지 (Senior GO)                                                                                                                           | Senior D1                   |
| §2 D2 권장                 | `--strict-paths` flag warn default + release-readiness #14 baseline ratchet 추가                                                                  | Senior D2                   |
| §2 D4 권장                 | C(plan) → **B(Senior REVISE)** 전환 — poc-03 격하 + 신규 PoC corroboration #2 별도 plan + **P0 commit 본문에 P1 deadline commit-block 명시 의무** | Senior D4 strongest concern |
| §4 STOP-3 gate 7 → 9       | #15 matrix visual diff + #16 self-bootstrap (methodology body AP coverage) 추가                                                                   | Senior D7                   |
| §0 배경 sync               | F-SIM-005 표현 수정 + ledger 본문 동반 수정 의무 명시                                                                                             | F-015 Claim C               |
| §1 권장 적용 자격          | "industry-first" → "industry-aligned" 표현 의무                                                                                                   | Industry case 메타          |
| §0 §8.1 자기정합           | F-SIM-001/004/011 = ≥3 PoC pre-corroboration 권장 (poc-01/02/04 lightweight grep ~30분)                                                           | Senior §8.1 critique        |

## 5. 묶음 결단 권장 (사용자 go/stop gate 의제)

| D                       | 옵션                       | research 권장                                    | 사용자 결단 필요 |
| ----------------------- | -------------------------- | ------------------------------------------------ | ---------------- |
| D1 묶음                 | A (1-session MINOR)        | **A**                                            | ✅               |
| D2 strict path          | warn default + ratchet     | **warn + #14 ratchet**                           | ✅               |
| D3 poc-03 carry         | `out_of_scope.ap_id_refs`  | **carry**                                        | ✅               |
| D4 corroboration #2     | C plan / B Senior          | **B (Senior REVISE)** + P1 deadline commit-block | ✅               |
| D5 F-SIM-005 P0         | 분리 P1                    | **분리**                                         | ✅               |
| D6 semver + cooling-off | MINOR + 위임 시 생략       | **MINOR / cooling-off 생략 사용자 명시 필요**    | ✅               |
| **D7**                  | STOP-3 9 gate              | **#15 + #16 추가**                               | ✅               |
| **D8 신설**             | F-SIM-005 ledger 표현 수정 | **수정 의무 (Beck 반증)**                        | ✅               |
| **D9 신설**             | §8.1 자기정합 ≥3 PoC sweep | **시행 (~30분 lightweight)** vs 명시 보류        | ✅               |

## 6. 4원칙 정합 종합

- §1 깊은 숙지 → 완료 (plan-fsim-p0.md / DEC-2026-05-17-chain-harness-e2e-simulation-audit / finding-system.md F-SIM)
- §2 3-에이전트 research → 완료 (본 문서)
- §3 사용자 승인 → 다음 단계 의무 (D1~D9 묶음 결단)
- §4 revert + LL → 시행 후 종결

## 7. 잠정 LL (시행 전)

- **LL-fsim-04**: §8.1 단일 PoC 과적합 회피 휴리스틱이 본 방법론 자기 검증대(§8.1 strict 7/7) 에 자기 적용 의무. ≥3 PoC pre-corroboration 미시행 시 같은 함정 반복 risk.
- **LL-fsim-05**: research 가설 H3 반증 = pre-research 의 산문 자신감("import-fail = 약한 RED") 이 실 1차 출처(Kent Beck 원저)에서 깨짐. **DEC-2026-05-17-plugin-authoring-docs-drift LL-plugin-02 "research 수렴 ≠ 사실" 동형 재현** — Explore pre-research 가설은 항상 1차 출처 독립 fetch 로 반증 시도 의무.
- **LL-fsim-06**: industry-aligned 자격 = 권위 강도 ~/ industry-first 자격은 ≥3 industry 부재 + ≥2 자기 corroboration 동시 의무 (현재 본 방법론 자기 corroboration n=1 = industry-first 자격 부재).

## 8. 참조

- 본 research 입력: `.claude/plans/plan-fsim-p0.md`
- 3 sub-agent agentId (재호출 가능):
  - Senior: `a84ce76df3bbc02cd`
  - Official-docs: `a9883ccdf94a1fbe5`
  - Industry-case: `a372b01a9a170c976`
- 다음 단계: 사용자 묶음 결단 D1~D9 → 시행 commit cycle
