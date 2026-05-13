# Changelog

본 방법론의 모든 변경 사항을 기록한다.

[Semantic Versioning](https://semver.org/lang/ko/) 준수:
- **MAJOR**: 기존 산출물과 호환 안 되는 큰 변경 (v1 → v2)
- **MINOR**: 호환 가능한 기능 추가 (v1.1 → v1.2)
- **PATCH**: 버그/누락 수정, 호환 가능 (v1.1.0 → v1.1.1)

---

## [v2.3.7] — 2026-05-13 ⭐ 현재 (★ ★ ★ PATCH session 7차 — rules.schema.json BR pattern 4토막 strict 정합 + id-conventions.md enforcement label 강화 / chain harness 5 요소 변경 ❌ / no new ADR)

> **★ ★ ★ PATCH session 7차** — v2.3.6 PATCH (session 6차 / findings-aggregator) 직후 session 4차 발견 critical schema mismatch **C-schema-br-pattern-fix** 즉시 진입. v2.3.x patch level (★ schema enforcement 1줄 + description 정합 3건 / chain harness 5 요소 변경 ❌ / no new ADR).

### 변경 사항 (v2.3.6 → v2.3.7)

#### ★ ★ DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7 (★ id-conventions 표준 정합)

- **trigger**: session 4차 (PoC #11 chain 2 4 UC 종결) 발견 schema mismatch — rules.schema (3토막+ 자유) vs behavior-spec br_refs (4토막+ strict) 불일치 + id-conventions.md § 규칙 4 항목 = ★ 이미 4토막 (`BR-{도메인}-{이름}-{번호}`) 정식 표준 명시 사실 (★ 표준 vs schema enforcement 분리 잔존 패턴 발견)
- **사용자 결단**: "BR 표기법 도메인-카테고리-번호로 하자" + 2 question 결단 (Q1 (a) PoC #11 즉시 재라벨 + 5 PoC carry / Q2 (a) 도메인 전문가 위임)

#### ★ schemas/rules.schema.json BR pattern 4토막+ strict

```diff
- "pattern": "^BR-[A-Z0-9_-]+-\\d+$",
- "description": "규칙 ID (예: BR-ORDER-007)"
+ "pattern": "^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$",
+ "description": "규칙 ID (★ 4토막 strict: BR-{도메인}-{이름}-{번호} / 예: BR-ORDER-CANCEL-001 / v2.3.7 enforcement)"
```

★ 5토막+ 자연 허용 (`BR-ARTICLE-AUTHOR-EDIT-ONLY-001` ✅ / `[A-Z0-9_-]+` hyphen 매칭 정합).

#### ★ 3 schema description 예시 정합

| schema | 변경 |
|---|---|
| `domain.schema.json:181` | `BR-ORDER-007` → `BR-ORDER-CANCEL-001` |
| `state-map.schema.json:269` | `BR-AUTH-001` → `BR-AUTH-JWT-001` |
| `meta-confidence.schema.json:159` | `BR-ORDER-007` → `BR-ORDER-CANCEL-001` |

#### ★ ★ methodology-spec/id-conventions.md enforcement 강화

- § 규칙 4 항목 → ★ ★ **"v2.3.7 enforcement" label 명문화** (schema-level strict pattern 명시 / 3토막 ❌ + 5토막+ ✅)
- § "★ ★ v2.3.7 BR 4토막 enforcement 마이그레이션 carry" 신규 절 (영향 6 PoC 명시 + 재라벨 규칙 + 일시 허용 carry)

#### ★ schema-validator unit test 3 신규

`tools/schema-validator/test/chain-schemas.test.js`:

- `★ ★ v2.3.7 — rules.schema.json BR 4토막 strict (3토막 → invalid)` ✅
- `★ ★ v2.3.7 — rules.schema.json BR 4토막 strict (4토막 → valid)` ✅
- `★ ★ v2.3.7 — rules.schema.json BR 5토막+ 자연 허용` ✅

★ **8/8 pass ✅** (전 8 test pass / 5 existing + 3 신규).

#### ★ ★ 6 PoC schema-validator 일시 fail 허용 carry

| PoC | 현재 ID 형식 | carry |
|---|---|---|
| **#11 (사내 EFI-WEB Billing)** | `BR-BILLING-005` | **C-rules-BR-id-relabel-PoC-11** (★ critical / 도메인 전문가 위임) |
| #06 (사내 EFI-WEB Exchange) | `BR-EXCHANGE-001` | C-rules-BR-id-relabel-5PoC |
| #07 (사내 EFI-WEB Capital) | `BR-CAPITAL-001` | C-rules-BR-id-relabel-5PoC |
| #08 (OSS jpetstore) | `BR-PETSTORE-001` | C-rules-BR-id-relabel-5PoC |
| #09 (OSS TypeORM raw SQL) | `BR-RW-001` | C-rules-BR-id-relabel-5PoC |
| #10 (OSS JPA + QueryDSL) | `BR-RAE-001` | C-rules-BR-id-relabel-5PoC |

★ 재라벨 sprint 종결 후 → fail → pass 전환 의무.

#### ★ chain harness 5 요소 변경 ❌

- chain-driver 자체 코드 수정 ❌
- 5 요소 (state.blocked + cli exit 2 + PreToolUse deny + suppressOutput + content-aware) 모두 보존
- ★ 본 변경 = analysis stage 산출물 schema 영역 / chain harness scope 외부

#### resolved carry 1

- ★ **C-schema-br-pattern-fix** (★ session 3차 발견 trigger)

#### 신규 carry 2

- ★ ★ **C-rules-BR-id-relabel-PoC-11** (★ critical / 도메인 전문가 위임)
- ★ **C-rules-BR-id-relabel-5PoC** (★ PoC #06+#07+#08+#09+#10 별도 sprint)

#### 보존 carry (★ 본 작업 후)

- ★ ★ ★ C-stack-결단-chain-3-4-plan (critical)
- ★ ★ C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld trigger)
- ★ ★ C-모던-stack-사내-측정 (critical)
- ★ C-chain-driver-state-retroactive-all-PoC
- ★ C-adoption-findings-aggregator-workflow
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

#### Lessons Learned 3건 신규

- ★ **LL-i-19** (★ "id-conventions 표준 vs schema enforcement 3 layer 정합 의무": 문서 명시 + schema 강제 + unit test 검증 = 3 layer / 향후 동일 패턴 점검 의무)
- ★ ★ **LL-i-20** (★ "schema strict 화 → 기존 PoC fail = 표준 enforcement 자연 결과" / 도메인 전문가 위임 = F-015 한계 회피 정합)
- ★ **LL-i-21** (★ "scope 최소화 + 영향 정직 보고 정합" — plan 6 schema → 실제 1 strict + 3 description 정합 축소)

#### PATCH v2.3.7 자격 7/7

- chain harness 5 요소 변경 ❌ + schema PATCH 자격 + no new ADR + workspace test 보존 + 3 신규 test + §8.1 strict 검증 예정 + ≥ 6 PoC 보존 + build 검증 예정

#### Version Bump (3 source sync)

| source | v2.3.6 | v2.3.7 |
|---|---|---|
| `.claude-plugin/plugin.json` | `2.3.6` | `2.3.7` |
| CHANGELOG.md 첫 `## [vX.Y.Z]` | `[v2.3.6]` | `[v2.3.7]` |
| `package.json` | `2.3.6` | `2.3.7` |

---

## [v2.3.6] — 2026-05-13 (★ ★ ★ ★ PATCH session 6차 — tools/findings-aggregator 신설 + chain-driver next --findings 자동 입력 정식 통합 + "양심 의존 차단" 정책 완전 실현 / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **★ ★ ★ ★ PATCH session 6차** — v2.3.5 PATCH (commit `bbe27ab` / chain 2 4 UC 종결) + session 5차 (commit `852e7f7` / chain-driver retroactive gate) 후 ★ ★ critical carry **C-chain-driver-findings-integration** 즉시 진입. v2.3.x patch level (★ chain-driver 외부 자산 신설만 / chain harness 5 요소 변경 ❌ / schema ❌ / no new ADR).

### 변경 사항 (v2.3.5 → v2.3.6)

#### ★ ★ ★ DEC-2026-05-13-chain-driver-findings-integration-v2.3.6 (★ 양심 의존 차단 완전 실현)

- **trigger**: session 5차 critical lesson LL-i-14 — chain-driver retroactive gate 통과 ✅ / 단 ★ `--findings <path>` 옵션 ❌ = 암묵 0 findings 가정 pass = ★ 양심 의존 잔존 패턴
- **사용자 결단**: ★ "1" = C-chain-driver-findings-integration 즉시 진입 + 4 question 결단 흡수 (★ Q1 (a) script 신설 / Q2 PATCH v2.3.6 / Q3 chain 3 진입 시 자연 적용 / 모두 추천 채택)

#### ★ ★ tools/findings-aggregator 신설 (★ workspace 15번째 등록)

- `package.json` (`@ai-native-methodology/findings-aggregator` v0.1.0)
- `src/aggregator.js` — 핵심 로직 (transformPlanningExtraction + transformChainCoverage + transformSchemaValidator + transformTestImplPass + transformGeneric + mergeFindings + aggregateForStage / **DI pattern**)
- `src/cli.js` — CLI 진입점 (`--target` + `--stage` + `--output` + `--dry-run` + `--json` / exit code 0/1/2/3)
- `test/aggregator.test.js` — ★ **24 unit test pass ✅** (★ stage 4 + transform 5 + merge 4 + dispatch 4 + aggregate 5 + REQUIRED_VALIDATORS_PER_STAGE 정합 검증)

#### ★ chain-driver gate-eval.js findings shape 정합

```json
{
  "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0,
  "coverage_pct": 1.0, "coverage_threshold": 0.85,
  "evidence_missing": [],
  "tests_total": null, "tests_passed": null, "tests_failed": null,
  "sources": { "<validator>": { "status": "ok|skipped|error", ... } }
}
```

★ `sources` field = aggregator 자체 보강 (★ 추적 의무 / validator 별 status + findings 별도 기록 / 양심 의존 차단 + 디버깅 정합).

#### ★ ★ ★ ★ PoC #11 spec stage 정식 통합 실증

```bash
$ node tools/findings-aggregator/src/cli.js --target examples/poc-11-efiweb-billing-spring41 --stage spec
# → findings-spec.json 자동 생성 (critical 0 + high 0 + coverage 1.0)

$ node tools/chain-driver/src/cli.js next examples/poc-11-efiweb-billing-spring41 \
    --findings examples/poc-11-efiweb-billing-spring41/.aimd/output/findings-spec.json \
    --user-decision go --dry-run
# → blocked=false / decision="go-eligible" / reasons=[]
```

★ ★ ★ "양심 의존 차단" 정책 완전 실현 (★ validator 사후 통과 + chain-driver gate 정식 통과 양쪽 cross-link 자동 정합).

#### ★ chain harness 5 요소 변경 ❌ + backward-compat 보존

- chain-driver 자체 코드 수정 ❌ (★ 5 요소 모두 보존)
- chain-driver next `--findings` 옵션 = optional 보존 (★ 기존 동작 보존 / "--findings 없음 = 암묵 0" 자격 보존)
- ★ ★ adoption guide + workflow + skills 안 findings-aggregator 사용 의무 명문화 = ★ 신규 carry C-adoption-findings-aggregator-workflow (★ 별도 sprint PATCH 자격)

#### REQUIRED_VALIDATORS_PER_STAGE (★ chain-driver gate-eval.js 정합)

| stage | validators |
|---|---|
| planning | planning-extraction-validator + schema-validator |
| spec | chain-coverage-validator + drift-validator + formal-spec-link-validator + schema-validator |
| test | test-impl-pass-validator + spec-test-link-validator + schema-validator |
| implement | test-impl-pass-validator + static-runner + traceability-matrix-builder |

#### resolved carry 1

- ★ ★ ★ C-chain-driver-findings-integration (★ critical / 양심 의존 잔존 패턴 제거)

#### 신규 carry 1

- ★ C-adoption-findings-aggregator-workflow (★ adoption guide + workflow + skills 안 findings-aggregator 사용 의무 명문화)

#### 보존 carry (★ 본 작업 후)

- ★ C-chain-driver-state-retroactive-all-PoC (PoC #03~#10 + PoC #11 chain 3+4)
- ★ ★ ★ C-stack-결단-chain-3-4-plan (critical)
- ★ ★ C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld 자격 trigger)
- ★ ★ C-모던-stack-사내-측정 (critical)
- ★ C-schema-br-pattern-fix
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

#### Lessons Learned 3건 신규

- ★ ★ ★ LL-i-16: "양심 의존 차단" 완전 실현 자산 (★ chain-driver 외부 자산 = chain harness 5 요소 보존 + PATCH 자격 정합)
- ★ ★ LL-i-17: 외부 자산 vs 내부 통합 결단 정합 (★ (a) findings-aggregator 외부 = 권고 정합 / Agent 3 정신)
- ★ LL-i-18: DI test 정합 (★ aggregateForStage DI pattern / mock runValidator unit test / 24/24 pass)

#### PATCH v2.3.6 자격 7/7

- chain harness 5 요소 변경 ❌ + schema ❌ + no new ADR + workspace test 보존 + 신규 24 test + §8.1 strict 7/7 expected + ≥ 6 PoC 보존 + chain-driver findings 통합 실증 + build OK

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.5 → 2.3.6
- `package.json` 2.3.5 → 2.3.6 + workspace 15번째 (findings-aggregator) 등록
- `scripts/version-check.js` 자동 verify

---

## [v2.3.5] — 2026-05-13 (★ ★ ★ ★ PATCH session 4차 — PoC #11 chain 2 4 UC 종결 / 첫 realworld 사내 PoC chain 2 실증 / characterization mode / 5 BHV + 12 AC + traceability partial / chain harness validated v2.3.5 강 강화 / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **★ ★ ★ ★ PATCH session 4차** — v2.3.4 PATCH (같은 날 commit `e298bb4` / Agent 1 F-015 finding 정정) + session 3차 commit `d32a6aa` (chain 2 UC #1 partial 자산화) 직후 ★ "진행" 사용자 결단 흡수 → chain 2 UC #2 + UC #3 (★ critical) + UC #4 종결 + traceability partial + DEC v2.3.5 신설 + PATCH release. ★ Q1 결단 정합 ("chain 2 종결 후 PATCH v2.3.5" / MINOR v2.4.0 ❌ / Agent 3 STOP signal 6 정합 / sample ≠ realworld).

### 변경 사항 (v2.3.4 → v2.3.5)

#### ★ ★ ★ ★ DEC-2026-05-13-poc-11-chain-2-종결-v2.3.5 (★ chain 2 첫 realworld 사내 PoC 실증)

- **★ ★ 4 UC 종결 사실**:
  - UC-BILLING-001 (화면 진입) + UC-BILLING-002 (12 row 조회) + UC-BILLING-003 (★ critical saveDataConfirm + ERP skip) + UC-BILLING-004 (Qlik View)
  - 5 BHV: BHV-BILLING-001~005 (UC #1×1 + UC #2×1 + UC #3×2 + UC #4×1)
  - 12 AC: AC-BILLING-001~012 (must×8 + should×4)
- **★ ★ ★ ★ critical AC-BILLING-008** (BHV-BILLING-003 / UC-BILLING-003) — ★ ★ "★ 4 SQL 중 3 번째 fail 시 ★ ★ 부분 commit" assertion = ★ ★ ★ TDD intent 정면 위배 정합 / characterization mode 핵심 / 새 시스템 invariant assertion (★ @Transactional(rollbackFor=Exception.class) 의무 / carry C-stack-결단-chain-3-4-plan cross-link)
- **★ ★ characterization mode 정합** (Q3 결단 (b)) — Michael Feathers 2004 *Working Effectively with Legacy Code* 정합 / 12 AC 모두 `@characterization-mode` tag

#### ★ ★ chain 2 산출 5 file (`examples/poc-11-efiweb-billing-spring41/.aimd/output/`)

- `behavior-spec.json` (★ 5 BHV / schema strict ✅ / characterization mode invariants 명시)
- `behavior-spec.md` (★ 두 렌더링 / 핵심 결단 정합 + schema mismatch carry 명시)
- `acceptance-criteria.json` (★ 12 AC / Gherkin BDD / MoSCoW / verifiable=true + test_case_refs TC-* placeholder / schema strict ✅)
- `acceptance-criteria.md` (★ Gherkin .feature 렌더 / Better Gherkin 사상 정합 / 12 AC 매핑 표)
- `traceability-matrix.json` (★ 12 entry / status=yellow / forward+backward coverage 0.4 / by_chain_stage chain_1+2 = 1.0 / chain_3+4 = 0 / schema strict ✅)

#### chain 2 gate #2 통과 자격

- chain-coverage-validator: **0 findings + uc_to_bhv = 1.0 + bhv_to_ac = 1.0** ✅
- planning-extraction-validator: 0 findings + use_case coverage = 1.0 ✅
- schema-validator: behavior-spec ✅ + acceptance-criteria ✅ + traceability-matrix ✅

#### ★ ★ ★ Agent 3 Senior critique 흡수 정합 보존 (★ session 3차)

- ✅ STOP 5 (cycle feasibility) + ✅ STOP 6 (v2.4.0 자격 부재 / sample ≠ realworld) + ✅ REVISE 1+2+3+4+7

#### resolved carry 2

- C-PoC-11-chain-2-PATCH-v2.3.5-trigger (★ chain 2 종결 후 PATCH 자격 활성)
- C-chain-2-UC-2-3-4-진입 (UC #2~#4 chain 2 자산화 종결)

#### 보존 carry

- ★ ★ ★ C-stack-결단-chain-3-4-plan (★ critical / chain 3+4 진입 전 4원칙 1원칙 재실행 의무)
- ★ ★ C-OSS-Modern-chain-2-4-PoC08 (★ critical / ≥ 2 realworld PoC 자격 trigger / v2.4.0 MINOR 자격 활성)
- ★ ★ C-모던-stack-사내-측정 (★ critical)
- ★ C-schema-br-pattern-fix (★ chain 2 발견)
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

#### ★ ★ ★ chain harness validated v2.3.5 강 강화

- ★ ★ ★ **chain 2 영역 첫 realworld 사내 PoC 실증** (★ PoC #05 sample chain 2 + 본 PoC #11 realworld chain 2 = 1 sample + 1 realworld)
- ★ ★ ≥ 2 realworld PoC 자격 trigger = ★ ★ ★ ★ **C-OSS-Modern-chain-2-4-PoC08** (PoC #08 jpetstore-6 chain 2~4 후속 sprint) → v2.4.0 MINOR 자격 활성 expected

#### Lessons Learned 3건 신규

- LL-i-11: chain 2 4 UC 종결 = chain harness validated 강 강화 자격 / chain 2 = paradigm-agnostic 정합 사실 (Legacy stack 정합 가능)
- LL-i-12: ★ ★ ★ AC-BILLING-008 = TDD intent 정면 위배 + characterization mode 자산화 의무 (Michael Feathers 2004 정합)
- LL-i-13: schema pattern mismatch 발견 = PoC #11 chain 2 가치 (C-schema-br-pattern-fix carry)

#### PATCH v2.3.5 자격 7/7 (★ §8.1 strict)

- chain harness 5 요소 변경 ❌ / schema 변경 ❌ / no new ADR / unit test 보존 / §8.1 strict 7/7 expected / ≥ 6 PoC 보존 + chain 2 realworld 강화 / build + CHECKSUMS OK

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.4 → 2.3.5
- `package.json` 2.3.4 → 2.3.5
- `scripts/version-check.js` 자동 verify

---

## [v2.3.4] — 2026-05-13 (★ ★ ★ ★ PATCH session 2차 — Agent 1 F-015 finding 정정 + arxiv 2601.21894 인용 복원 + critical lesson F-015 한계 / sub-rule v1.1.1 → v1.1.2 PATCH / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **★ ★ ★ ★ PATCH session 2차** — v2.3.3 PATCH (★ 같은 날 commit `6ab26b6` / origin push ✅) 직후 D + E 작은 carry 정리 session 안 진입. v2.3.x patch level (no new ADR / sub-rule patch + memory 갱신 + DEC 신설 / schema ❌). 사용자 결단 정합 — "v2.3.4 PATCH release (sub-rule v1.1.1 → v1.1.2)" (★ 4원칙 §3 사용자 명시 결단 우선 / cooling-off 영구 폐기 정합 / Agent 3 REVISE #2 정신만 흡수 = "최소 변경" + scope creep 회피).

### 변경 사항 (v2.3.3 → v2.3.4)

#### ★ ★ ★ DEC-2026-05-13-not-all-code-인용-복원 (★ Agent 1 F-015 finding 정정 + critical lesson)

- **★ ★ trigger**: v2.3.3 Agent 1 F-015 cross-validation "arxiv 2601.21894 확인 불가" 단순 결단 → sub-rule v1.1 §X-C #5 인용 ★ 제거 + carry C-not-all-code-검증 신설
- **★ ★ 메인 직접 검증 결과 (WebFetch + WebSearch)**:
  - 제목: **"Not All Code Is Equal: A Data-Centric Study of Code Complexity and LLM Reasoning"**
  - First author: **Lukas Twist** (+ Shu Yang / Hanqi Yan / Jingzhi Gong / Di Wang / Helen Yannakoudakis / Jie M. Zhang)
  - arxiv: 2601.21894 / 2026-01-29 submission (★ ★ arxiv ID 정확)
  - 핵심: structural complexity 가 LLM reasoning 에 dominant / 83% experiments restricting fine-tuning data to specific structural complexity range outperforms structurally diverse code
- **★ ★ R1' "trivially deterministic 효과 = structural complexity 단순" 정합 ★ 강** — paradigm specific code 의 structural complexity 가 §3-A automation ceiling 영향 인자 정합

#### ★ ★ sub-rule v1.1.1 → v1.1.2 PATCH (`spring41-ibatis2-isomorphic.md`)

- **§X-C #7 신설** — Twist et al. 정확 인용 복원 + 핵심 finding 83% experiments + R1' 정합 강 + ★ critical lesson F-015 sub-agent 한계 cross-link
- **§6 carry 표** — C-not-all-code-검증 ✅ resolved 표기 (취소선 + resolved 일자 + 본 DEC 명시)
- **§7 참조** — "Not All Code Is Equal" 취소선 제거 + 정확 인용 복원 (Twist et al. 2026 + arxiv 2601.21894 / 2026-01-29 submission)
- **frontmatter** — v1.1.1 → v1.1.2 (★ 3rd line 신규 추가)

#### ★ ★ ★ critical lesson F-015 한계 명시 (memory `feedback_sub_agent_validation.md` v2.3.4 보강 절 추가)

- ★ ★ F-015 한계 패턴 3건: (1) 가벼운 sub-agent + 시간 cap 10분 = WebFetch fail / fallback search 부정확 가능 / (2) "확인 불가" 단순 결단 = ★ ★ critical risk = 정확한 인용도 제거 위험 / (3) sub-agent 보고 그대로 본체 갱신 = ★ ★ critical 정합 위험
- ★ ★ ★ 신규 적용 4 항목: (1) sub-agent negative 결단 발견 시 = ★ ★ 메인 WebFetch + WebSearch 즉시 cross-check 의무 / (2) 인용 제거 / carry 신설 결단 전 = ★ 메인 직접 검증 cycle 1회 의무 / (3) sub-agent fallback search "부재 정탐" 도 ★ 메인 cross-check 의무 / (4) sub-agent 결단 vs 메인 cross-check 차이 발견 = ★ critical lesson 등재 의무

#### ★ ★ D 작업 종결 (PoC #11 satd 해석 정정 + cleanup)

- `examples/poc-11-efiweb-billing-spring41/sql-inventory/sql-inventory.json` summary.self_recognized_interpretation 절 ★ 신설 — "Modern OSS reference 정합" 단순 결론 ❌ / single-case + 작은 모듈 + 잠복 기간 미경과 (arxiv 2601.06266 median 204~492일) 가능성 명시 / sub-rule §AP-005 cross-link
- 빈 source 디렉토리 4 (java/jsp/sqlmap/message) + parent source/ 제거 (in-place read 정책 정합 / DEC-2026-05-12-in-place-read-정책-채택)

#### ★ B 진입 plan 작성 (`~/.claude/plans/j-chain-2-4-풀가동.md`)

- ★ ★ 본 plan = 4원칙 1원칙 산출만 / B 본격 진입 = 별도 multi-day session
- 10절: 컨텍스트 + PoC 대상 결단 후보 5종 (A/B/C/D/E) + scope IN/OUT + release v2.4.0 MINOR 자격 + 4원칙 cycle + 위험 + §8.1 strict 정합 + 후속 carry + 참조
- ★ ★ ★ ★ 추천 PoC: **(C) PoC #08 jpetstore-6** (Modern stack / test infra 보유 / OSS / 7~14d cap / chain harness validated 강 강화)

#### DEC 갱신

- DEC-2026-05-13-r1-prime-본체-명문화 §5.1 신규 carry C-not-all-code-검증 ✅ resolved 표기

#### resolved carry 3

- C-not-all-code-검증 (★ critical / 메인 cross-check)
- C-poc-11-0-satd-해석-정정 (D 작업)
- C-poc-11-source-디렉토리-cleanup (D 작업)

#### 신규 carry 2

- ★ ★ C-사내-chain-2-4 (★ critical / B sprint trigger / 사내 ROI axis / PoC #11 billing chain 2~4 별도 sprint)
- ★ ★ C-egovframework-chain-2-4 (★ 사내 Spring 4.1 + iBATIS 2 + egov stack chain 2~4)

#### 잔존 carry

- ★ ★ C-모던-stack-사내-측정 (★ critical / Agent 3 REVISE #1 / 사내 Modern stack PoC)
- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (★ 결제 도메인 expert 위임)
- C-PoC07-1~3 (★ chain 3 영역 retrofit / B sprint 안 자연 흡수 후보)
- C-v2.2.0-1 (★ NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

#### Lessons Learned (★ ★ ★ critical 3건)

- ★ LL-i-5 (★ critical): F-015 cross-validation 한계 (★ memory `feedback_sub_agent_validation.md` v2.3.4 보강 절 자산화)
- ★ LL-i-6: 사용자 명시 결단 우선 (Agent 3 REVISE #2 정신만 흡수 / 형식 권고 ❌)
- ★ LL-i-7: 같은 session 2차 = 자연 발견 burst 회피 (Agent 1 finding 정정 + 메인 cross-check 결과 = 의도 burst ❌)

#### PATCH 자격 7/7 (★ §8.1 strict)

- chain harness 5 요소 변경 ❌ (보존)
- schema backward-compat 회귀 ❌ (schema 변경 ❌)
- no new ADR (DEC 신설 1건 + 갱신 1건)
- workspace unit test 보존 (schema ❌ + tool ❌)
- §8.1 strict 7/7 expected (`--target v2.3.4`)
- ≥ 6 PoC corroboration 보존 (Legacy 3 사내 + Modern 3 OSS)
- build dist + CHECKSUMS OK expected

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.3 → 2.3.4
- `package.json` 2.3.3 → 2.3.4
- `scripts/version-check.js` 자동 verify

---

## [v2.3.3] — 2026-05-13 (★ ★ ★ ★ PATCH session 1차 — R1' automation ceiling 본체 명문화 (3 layer 가치 명세 axis 분리) + sub-rule v1.1 → v1.1.1 PATCH (인용 정정 + 외부 권위 보강) / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **★ ★ ★ ★ PATCH** — v2.3.2 PATCH (2026-05-12 commit `ba3ed82` / sub-rule v1.0 → v1.1 minor) 후 잔존 carry **C-r1-prime-자격-Modern-corroboration** 흡수. v2.3.x patch level (no new ADR / 본문 보강 + sub-rule patch / schema 변경 ❌). 사용자 결단 정합 — DEC-2026-05-12-r1-가설-revisit §5 "본체 methodology 영향 = Day 3.5 종결 시 별도 결단 의무" 약속 종결.

### 변경 사항 (v2.3.2 → v2.3.3)

#### ★ ★ ★ DEC-2026-05-13-r1-prime-본체-명문화 (★ R1' axis 본체 명문화 / industry first paradigm-cross axis quantification)

- **★ ★ ★ 3 layer 본체 가치 명세 갱신**:
  - `CLAUDE.md` L36~ — chain harness 전체 70~80% axis + analysis §3-A automation axis paradigm 별 ceiling 표 (Legacy ~53~55% 3 사내 PoC + Modern ~60~67% 3 OSS PoC) + metric semantics 차이 명시 + 외부 권위 cross-link
  - `ai-native-methodology/README.md` L34~ — 외부 facing 동일 패턴 + Modern OSS 한정 명시 + sub-rule §X 참조
  - `~/.claude/projects/.../memory/project_methodology_scope.md` "scope OUT" 절 — R1' 5항 보강 (paradigm 별 ceiling + metric semantics + 외부 권위 + original empirical finding + 출처)
- **★ ★ R1' (revised) 정량 ceiling 본체 명시** — Spring 4.1 + iBATIS 2 (Legacy) ~53~55% / Modern (MyBatis 3 / TypeORM / Spring Data JPA) ~60~67% / **6 PoC 사실 robust** (Legacy 3 사내 + Modern 3 OSS / ADR-CHAIN-008 정합).
- **★ ★ ★ industry first paradigm-cross axis quantification (original empirical finding)** 명시 — 외부 권위 부재 영역 / 본 사내 6 PoC 6 차원 corroboration (paradigm + ORM + platform + language + responsibility + scale).

#### ★ ★ sub-rule v1.1 → v1.1.1 PATCH (`spring41-ibatis2-isomorphic.md`)

- **★ ★ ★ Agent 1 F-015 cross-validation 인용 정정 3건**:
  - "Zhang et al. ICSE 2025" → ★ **Wang et al. ICSE 2025** (First author = Chong Wang NTU / Zhang 공저자 3번째 / arxiv 2406.09834v3 / DOI 10.1109/ICSE55347.2025.00245)
  - "LongCodeBench 2026" → **2025** (v1=2025-05 / v3=2025-10 / First author = Stefano Rando)
  - "Not All Code Is Equal" arxiv 2601.21894 → ★ **인용 제거** (Agent 1 검증 실패 가능성 / 별도 sprint carry C-not-all-code-검증)
- **★ ★ Agent 2 외부 권위 보강 (§X-C-2 신설 / Big-tech industry isomorphic corroboration 표)**:
  - ★ ★ AWS Schema Conversion Tool (Functions **66.4%** 자릿수 정합 / Stored Proc 76.8%)
  - ★ ★ Amazon Q Developer Code Transformation (Novacomp 80% / 보험사 36% / OSS 62 app 85% higher success / acceptance 60%+)
  - ★ ★ ★ ThoughtWorks Tech Radar Vol.32~34 (2025~2026.04) "GenAI for forward engineering" + "Spec-driven development for legacy" — ★ ★ ★ chain harness 사상 **isomorphic**
- **★ ★ Agent 1 추가 권위 후보 2건**: "Beyond Synthetic Benchmarks" (arxiv 2510.26130 / 2025) + "Where Do LLMs Still Struggle?" (arxiv 2511.04355 / 2025)
- **★ ★ Modern OSS 한정 명시** (Agent 3 REVISE #1 흡수 / §X-E 측정 환경 컬럼 + 본문 한 줄)
- **★ ★ metric semantics 차이 명시** (Agent 3 강화 흡수 / §X-F.3 "metric 분모 자체 다름")

#### ★ ★ DEC 신설 + 갱신 병행

- **신설**: `DEC-2026-05-13-r1-prime-본체-명문화` (★ version bump trigger DEC / 4원칙 cycle 정합 / Agent 3 ACCEPT)
- **갱신**: `DEC-2026-05-12-r1-가설-revisit` 상태 `진행중` → `승인` / §5 본체 영향 표 5행 ✅ resolved 갱신

#### ★ ★ Agent 3 Senior critique 흡수 (ACCEPT 5 + REVISE 2)

- ACCEPT: axis 분리 정당성 / 본체 vs sub-rule layer 정합 / §8.1 strict / PATCH v2.3.3 자격 / DEC 신설+갱신 병행
- REVISE #1 (Modern OSS 한정) ✅ 흡수 — 3 layer + sub-rule §X-E
- REVISE #2 (결단 burst 24h cooling) ★ ★ 정신만 흡수 / 형식 권고 ❌ (DEC-2026-05-06 + DEC-2026-05-08 cooling-off 영구 폐기 정합 / 사용자 명시 결단 우선)

#### 4원칙 cycle 산출

- 1원칙 plan `~/.claude/plans/i-r1-prime-ceiling-본체.md` (10절 / scope IN 13항 + scope OUT 6항)
- 2원칙 research `~/.claude/plans/i-r1-prime-research.md` (3 sub-agent 병렬 / 가벼운 sub-agent 전략 / 시간 cap 10분/agent / 실측 ~76~80초/agent)
- 3원칙 사용자 결단 4 question 묶음 (★ 풍성한 옵션 4건 모두 채택)
- 4원칙 Lessons Learned 4건 (LL-i-1~4 / 가벼운 sub-agent + Senior critique + scope creep + cooling-off 정합)

#### resolved carry

- ★ ★ ★ C-r1-prime-자격-Modern-corroboration ✅ resolved
- DEC-2026-05-12-r1-가설-revisit §5 본체 영향 5행 모두 ✅ resolved
- Zhang → Wang 인용 정정 ✅ resolved (sub-rule v1.1.1 + DEC + plan)
- LongCodeBench 2026 → 2025 정정 ✅ resolved (sub-rule v1.1.1 + DEC)
- Modern OSS 한정 명시 부재 ✅ resolved (3 layer + sub-rule §X-E)
- metric semantics 차이 명시 부재 ✅ resolved (3 layer + sub-rule §X-F.3)

#### 신규 carry

- ★ C-not-all-code-검증 (★ Agent 1 F-015 / arxiv 2601.21894 별도 검증 후 인용 재개 vs 영구 제거)
- ★ ★ C-모던-stack-사내-측정 (★ critical / Agent 3 REVISE #1 / 사내 Modern stack PoC 진입 시 ceiling 재측정 의무)

#### 잔존 carry

- C-egovframework-sub-rule (★ Modern stack sub-rule 본격 자산화)
- C-domain-PoC11-1~3 (★ 결제 도메인 expert 위임)
- C-PoC07-1~3 (★ chain 3 영역 retrofit)
- C-poc-11-0-satd-해석-정정 (★ Agent 1 cross-validation 흡수 잔존)
- C-poc-11-source-디렉토리-cleanup (★ 낮은 우선)
- C-v2.2.0-1 (★ NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level (별도 sprint)

#### PATCH 자격 7/7 (★ §8.1 strict)

- chain harness 5 요소 변경 ❌ (chain-driver / planning-extraction-validator / chain-coverage-validator / spec-test-link-validator / traceability-matrix-builder 보존)
- schema backward-compat 회귀 ❌ (schema 변경 ❌ → 회귀 fixture 변동 ❌)
- no new ADR (DEC 자격 자연)
- workspace unit test 보존 (schema ❌ + tool ❌)
- §8.1 strict 7/7 expected (`--target v2.3.3`)
- ≥ 6 PoC corroboration (Legacy 3 사내 + Modern 3 OSS / ADR-CHAIN-008 "MEDIUM × ≥ 5 PoC = strong" 정합 ★ 강화)
- build dist + CHECKSUMS OK expected

#### Version Bump (3 source sync)

- `.claude-plugin/plugin.json` 2.3.2 → 2.3.3
- `package.json` 2.3.2 → 2.3.3
- `scripts/version-check.js` 자동 verify (no source 자체 / plugin.json + CHANGELOG header check)

---

## [v2.3.2] — 2026-05-12 (★ ★ ★ ★ PATCH — sub-rule v1.0 → v1.1 minor 갱신 / KL-SATD 인용 정정 + R1' automation ceiling 신설 + 외부 권위 보강 / no new ADR / schema 변경 ❌ / chain harness 5 요소 변경 ❌)

> **★ ★ ★ ★ PATCH** — v2.3.1 PATCH (같은 날 commit `bc48477`) 후 PoC #11 Day 0.5~1.5 종결 + 본체 sub-rule 보강. v2.3.x patch level (no new ADR / sub-rule 본문 보강만 / schema 변경 ❌). 사용자 결단 정합 — PoC #11 Day 1.5 R1 가설 ★ 반증 critical finding → 본체 methodology R1' 검토 우선 (PoC #11 Day 2.0~3.5 suspend).

### 변경 사항 (v2.3.1 → v2.3.2)

#### ★ ★ ★ PoC #11 (EFI-WEB billing) Day 0.5~1.5 종결

- **★ ★ ★ DEC-2026-05-12-in-place-read-정책-채택** — source 사본 패턴 → in-place read 정책 변경. 사내 PoC 정합 의무 / 외부 OSS PoC 는 clone 보존. PoC #11 첫 적용 (`source_root_absolute: /Users/sangcl/Documents/Development/Study/EFI-WEB/ifrs`).
- **billing 모듈 정탐** — 7 file / 257 Java + 77 sqlmap + 269 JSP = 603 LOC / Spring 4.1 + iBATIS 2 + egov + Qlik BI 외부 임베드 + cross-DB 3개 (ifrs + FIM + SGERPMA).
- **analysis 4종 + SQL Inventory** — 8 BR + 4 UC + 13 AP (★ 5종 isomorphic + 8종 novel) + 6 SQL × 12 컬럼 / validator 0 findings / **auto_ratio 66.7%** (★ ★ ★ 3 사내 PoC isomorphic 자격 ★ 충족) / migration_priority P0×3+P1×2+P2×1.
- **§3-A 자동화율 = 52.5%** — ★ ★ plan 2차 expectation 25~40% **+12.5%p 초과**.

#### ★ ★ ★ ★ DEC-2026-05-12-r1-가설-revisit (★ critical methodology finding)

- ★ ★ ★ R1 가설 (scale ↓ → 자동화율 ↓) ★ ★ **반증** 사실 확보 (3 사내 PoC: 38.75% / 52.5% / 53.8% / scale 분포 vs 자동화율 분포 ★ 불일치).
- ★ ★ ★ R1' (revised) 새 가설 — **Spring 4.1+iBATIS 2 paradigm = analysis 단계 §3-A automation ceiling ~53~55%** (★ 3 사내 PoC isomorphic / scale 무관).
- paradigm modernization 시 ceiling 돌파 evidence: PoC #08 = 66.7% / PoC #09 = 63.6%.

#### ★ ★ ★ ★ DEC-2026-05-12-sub-rule-v1.1-갱신 (sub-rule 본문 보강)

`methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` v1.0 → **v1.1 minor 갱신**:

1. ★ ★ ★ **§AP-005 KL-SATD 인용 정정** (★ critical) — "Korean Language" → "**Keyword-Labeled**" / Software Quality Journal 2024 (DOI 10.1007/s11219-023-09655-z) / Maldonado 2015 = IEEE 7th MTD workshop / 5 SATD type 분류 정확화.
2. **§3 ≥ 2 PoC → ≥ 3 사내 PoC isomorphic 표 강화** — scale-cross 3 spectrum (작은 단일 + 단일 + 다중책임) / 5 AP 중 2종 3 PoC + 3종 2 PoC corroboration.
3. **§4 신뢰도 단계 5 강 (90~95%) 신설** — ≥ 3 사내 PoC + ≥ 3 spectrum + R1' original empirical finding 보강.
4. ★ ★ **§X 신규 절 — automation ceiling R1'** — 3 사내 PoC 측정 사실 + R1 ★ 반증 + R1' 정립 + ★ ★ ★ 외부 권위 STRONG 보강 (Zhang ICSE 2025 DUR 70~90% vs 9~18% + LongCodeBench Claude 3.5 32K→256K 29%→3% + Context Length Alone Hurts + Gartner 2025) + ★ ★ original empirical finding 라벨 + paradigm modernization 시 ceiling 돌파 5 PoC 사실.
5. **§6 carry 갱신** — iBATIS 2 dynamic tag sub-classification carry ✅ resolved.
6. **§7 참조 추가** — SQJ 2024 + Zhang ICSE 2025 + LongCodeBench + Context Length + Gartner 2025 + DEC 3건 + PoC #11 산출.

#### 4원칙 정합 (★ ★ ★ ★)

- **1원칙 plan** — `~/.claude/plans/h-r1-revisit-본체-검토.md` (4 자산 전수 조사 / 13절)
- **2원칙 research** — `~/.claude/plans/h-r1-revisit-research.md` (3 light sub-agent F-015 cross-validation / KL-SATD 인용 오류 + R1' STRONG 외부 권위 발견)
- **3원칙 사용자 결단** — γ ("sub-rule v1.1 일괄 / §X 만 / WebFetch skip / PATCH v2.3.2 즉시 release")
- **4원칙 Lessons Learned** — 4건

### v2.3.2 PATCH 자격 — 6/6

1. ✅ chain harness 5 요소 enforcement 보존
2. ✅ schema backward-compat (★ schema 변경 ❌)
3. ✅ no new ADR (patch level)
4. ✅ ≥ 3 사내 PoC isomorphic 자격 사실 (PoC #06+#11+#07)
5. ✅ release-readiness §8.1 strict 7/7
6. ✅ unit test 회귀 0 fail (★ tools 변경 ❌ / 기존 241 pass 보존)

### resolved (★ ★ ★ 6)

- C-in-place-read-policy
- C-r1-hypothesis-revisit (★ critical)
- C-automation-ceiling-paradigm
- KL-SATD 인용 오류 (★ Agent 1 F-015 cross-validation)
- iBATIS 2 dynamic tag sub-classification carry
- C-v2.2.0-spring41-ibatis2-subrule (★ ★ ★ 3 사내 PoC isomorphic)

### 잔존 carry

- C-v2.2.0-1 (NoSQL/Prisma v3.0)
- C-v2.3.0-gartner-time-application-level
- ★ C-poc-11-0-satd-해석-정정 (★ Day 3.5)
- C-poc-11-source-디렉토리-cleanup
- C-egovframework-sub-rule
- C-r1-prime-자격-Modern-corroboration
- PoC #11 Day 2.0~3.5 (★ ★ 본 release 후 별도 결단)

---

## [v2.3.1] — 2026-05-12 (★ ★ ★ ★ ★ ★ PATCH — C-v2.2.0-2 baseline ratchet + C-v2.2.0-7 tag_type enum / no ADR / chain harness 5 요소 변경 ❌)

> **★ ★ ★ ★ ★ ★ PATCH** — v2.3.0 MINOR FINAL (같은 날 commit `fd603bd`) 후 내부 2 carry resolve. v2.2.x 잔존 carry 정리 / v2.3.x patch level (no new ADR / sub-rule deliverable / schema 본질 변경 ❌). release-readiness §8.1 strict 7/7 ✅ + npm test 241 pass (288 total with _shared) / 0 fail.

### 변경 사항 (v2.3.0 → v2.3.1)

- **★ ★ ★ ★ C-v2.2.0-2 baseline ratchet resolved** — `tools/sql-inventory-extractor/src/{validator,cli}.js` 에 baseline ratchet 통합 (characterization-coverage-validator mirror / `_shared/baseline.js` `coverageTrendCheck` 재사용). flag `--coverage-baseline <path>` + `--write-coverage-baseline` 신설. metric = `extraction_automation.auto_ratio_external_6`. current < baseline → `extraction_automation.ratchet_trend_negative` high finding.
- **★ ★ ★ ★ C-v2.2.0-7 dynamic_branch.tag_type sub-classification enum resolved** — `schemas/sql-inventory.schema.json` `dynamic_branch.items.tag_type` optional enum 신설 (iBATIS 2 dynamic 16종 + MyBatis 3 dynamic 8종 + `sql:case_when` + `other` = 26종). validator `record.tag_type_invalid` critical finding + `summary.tag_type_distribution` 통계.
- **★ 신규 fixture 4종** — `valid/with-tag-type/` + `invalid/bad-tag-type/` + `baselines/poc-06-baseline.json` (ratchet pass) + `baselines/regressed-baseline.json` (ratchet fail).
- **★ unit test 237 → 241** (+4 / sql-inventory-extractor 14 → 18 / 288 total with _shared).
- **★ deliverable 24-sql-inventory.md §13 carry 표 갱신** — C-v2.2.0-2 / C-v2.2.0-7 resolved 마킹.

### v2.3.1 PATCH 자격 — 6/6

1. ✅ chain harness 5 요소 enforcement 보존
2. ✅ schema backward-compat (tag_type optional / 기존 fixture 회귀 ❌)
3. ✅ no new ADR (patch level)
4. ✅ unit test 회귀 0 fail (241 pass / 14 workspace)
5. ✅ release-readiness §8.1 strict 7/7
6. ✅ build artifact CHECKSUMS OK

### resolved carry

- ~~C-v2.2.0-2 sql-inventory baseline ratchet (characterization-coverage-validator mirror)~~ ✅ resolved (auto_ratio_external_6 ratchet flag + high finding)
- ~~C-v2.2.0-7 iBATIS 2 전용 dynamic 태그 sub-classification enum~~ ✅ resolved (dynamic_branch.tag_type enum 26종)

### 잔존 carry

- C-v2.2.0-1 (NoSQL/Prisma) → paradigm shift / v3.0 후보
- C-v2.2.0-5 (다중책임 spectrum) → PoC #11 종결 후
- ★ C-v2.3.0-gartner-time-application-level → 별도 sprint v2.4 / v3.0
- ★ Phase 3 (patterns_extension_v3 Modern PoC corroboration) → Modern PoC MyBatis 3 source 필요
- PoC #11 (EFI-WEB billing) source 위임 대기

---

## [v2.3.0] — 2026-05-12 (★ ★ ★ ★ ★ ★ ★ MINOR FINAL — Phase 1 + Phase 2 일괄 / patterns_extension_v3 + Spring 4.1+iBATIS 2 spectrum AP isomorphic 5종 sub-rule + ADR-CHAIN-010)

> **★ ★ ★ ★ ★ ★ ★ MINOR FINAL** — v2.3.0-rc1 prerelease (같은 날 2026-05-12 / commit `de1bae1` / git tag `v2.3.0-rc1`) 후 Phase 2 작업 종결 → final 격상. 옵션 D (REVISE 완전 흡수) Phase 1 + Phase 2 일괄 자산화. release-readiness §8.1 strict 7/7 ✅ + npm test 237 pass (284 total with _shared) / 0 fail.

### Phase 2 변경 사항 (v2.3.0-rc1 → v2.3.0)

- **★ ★ ★ ★ ★ ★ ADR-CHAIN-010 신설** — `docs/adr/ADR-CHAIN-010-patterns-extension-v3-and-sub-rule.md` "patterns_extension_v3 정식 도입 (MyBatis 3 advanced features 한정) + Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화". MyBatis 3 cache / discriminator / typeHandler 공식 docs 정합 + PoC #06+#07 AP 5종 isomorphic 사실.
- **★ ★ ★ ★ ★ sub-rule 신설** — `methodology-spec/sub-rules/spring41-ibatis2-isomorphic.md` (신규 sub-rules/ 디렉토리). 5 AP isomorphic 명세: Map<String,Object> 강제 캐스팅 + Anemic Service + WITH(NOLOCK) 무차별 + 공유 SQL 조각 부재 + 자조 SATD (KL-SATD). ≥ 2 PoC + 단일+다중책임 spectrum corroboration = **단계 5 신뢰도** 자격.
- **★ ★ ★ ★ patterns_extension_v3 schema 신설** — `schemas/sql-inventory.schema.json` `patternsExtensionV3` $def + root-level `patterns_extension_v3` reference. 3 패턴 nested (pattern_5_cache + pattern_6_discriminator + pattern_7_typeHandler). **optional / MyBatis 3+ 한정** (iBATIS 2 단독 stack 부적합).
- **★ deliverable 24-sql-inventory.md 보강** — 제목 + 사상 절 + §6.1 patterns_extension_v3 정식 (3 패턴 + iBATIS 2 비호환 비교) + §13 carry 표 C-v2.2.0-3 / C-v2.2.0-4 resolved 마킹.
- **★ 신규 fixture + test 1** — `valid/with-patterns-extension-v3/sql-inventory.json` (cache + discriminator + typeHandler aggregate_metrics 예시) + 1 신규 test (patterns_extension_v3 optional / 회귀 ❌ 검증).
- **★ unit test 236 → 237** (+1 / sql-inventory-extractor 13 → 14 / 284 total with _shared).

### v2.3.0 final 자격 — 8/8

1. ✅ chain harness 5 요소 enforcement 보존 (v2.0~v2.3 일관)
2. ✅ schema patterns_extension_v3 + migration_priority 양쪽 추가 + backward-compat 회귀 fixture 통과 (PoC #06+#07 11 컬럼 row test pass)
3. ✅ ADR-CHAIN-009 + ADR-CHAIN-010 신설 + dynamic 검사 통과 (8 → 10 ADR-CHAIN)
4. ✅ unit test 회귀 0 fail (237 pass / 14 workspace)
5. ✅ deliverable 24 + sub-rule deliverable 정합 갱신
6. ✅ ≥ 5 PoC corroboration 보존 (PoC #06+#07+#08+#09+#10 SQL Inventory isomorphic)
7. ✅ release-readiness §8.1 strict 7/7
8. ✅ build artifact dist/ai-native-methodology-v2.3.0/ 273+ files / CHECKSUMS OK

### resolved carry (Phase 2 / ADR-CHAIN-010 정합)

- ~~C-v2.2.0-3 patterns_extension_v3~~ ✅ resolved (schema 정식 도입 / Phase 3 Modern PoC corroboration carry)
- ~~C-v2.2.0-4 Spring 4.1 + iBATIS 2 sub-rule~~ ✅ resolved (`spring41-ibatis2-isomorphic.md` 신설 / 단계 5 신뢰도)

### 별도 sprint carry (v2.4 / v3.0)

- ★ C-v2.3.0-gartner-time-application-level — `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 (Gartner TIME application portfolio 별도 deliverable / ADR-CHAIN-009 §2)

### 잔존 carry (v2.2.x patch / v2.x)

- C-v2.2.0-1 (NoSQL/Prisma) → paradigm shift / v3.0 후보
- C-v2.2.0-2 (sql-inventory baseline ratchet) → v2.2.x patch
- C-v2.2.0-5 (다중책임 spectrum) → PoC #11 종결 후
- C-v2.2.0-7 (iBATIS 2 전용 dynamic 태그 sub-classification) → v2.2.x patch
- PoC #11 (EFI-WEB billing) source 위임 대기

---

## [v2.3.0-rc1] — 2026-05-12 (★ ★ ★ ★ ★ ★ MINOR PRERELEASE Phase 1 — schema 12번째 컬럼 `migration_priority` P0~P3 + ADR-CHAIN-009 Gartner TIME SQL 단위 보류)

> **★ ★ ★ ★ ★ ★ MINOR Phase 1 PRERELEASE** — v2.3.0 minor sprint 옵션 D (REVISE 완전 흡수 / Senior critique 권고 100% 채택) 정합. Phase 1 = schema 12번째 컬럼 + 회귀 fixture + ADR-CHAIN-009. Phase 2 (patterns_extension_v3 + Spring 4.1 + iBATIS 2 sub-rule) = 별도 session 후속 carry.

### 변경 사항 (v2.2.0 → v2.3.0-rc1)

- **★ ★ ★ ★ ★ schema 12번째 컬럼 신설** — `schemas/sql-inventory.schema.json` `sqlRecord.properties.migration_priority` enum P0/P1/P2/P3 추가. **optional 의무** (기존 11 컬럼 row backward-compat 강제 / Senior critique 흡수). title + description 갱신 (11 → 12 컬럼).
- **★ ★ ★ ★ ★ ★ ADR-CHAIN-009 신설** — `docs/adr/ADR-CHAIN-009-gartner-time-sql-level-deferral.md` "Gartner TIME SQL 단위 보류 사유 / abstract granularity mismatch + `migration_priority` P0~P3 대체 채택 / application portfolio 수준 별도 deliverable carry". Senior critique 100% 흡수 + Big-tech first-mover 신호 보존.
- **★ ★ deliverable 24-sql-inventory.md 보강** — §1.1 Gartner TIME 보류 명시 / §1.2 "Why not AWS SCT" 차별화 절 +2 도구 (Oracle SQL Dev / Liquibase) + `migration_priority` first-mover 입증 / §3 추출 범위 +1 컬럼 / §4 11 → 12 컬럼 명세 + §4.1 분류 가이드 (P0~P3 trigger 예시) / §13 carry 표 갱신 (C-v2.2.0-8 reframe + C-v2.3.0-gartner-time-application-level 신규).
- **★ sql-inventory-extractor validator 보강** — `tools/sql-inventory-extractor/src/validator.js` migration_priority enum 검증 추가 (`record.migration_priority_invalid` critical finding) + summary distribution { P0, P1, P2, P3, unspecified } 통계 + 검증 #8 신설 명세.
- **★ unit test 회귀 fixture 2종 신설** — `valid/with-migration-priority/sql-inventory.json` (P0~P3 mixed + unspecified) + `invalid/bad-migration-priority/sql-inventory.json` (PX). 3 신규 test (backward-compat / valid recognition / invalid critical).
- **★ ★ unit test 233 → 236** (+3 / sql-inventory-extractor 10 → 13 / 280 → 283 total with _shared).
- **★ ★ ★ ★ Senior critique REVISE 완전 흡수** — (a) Gartner TIME = application portfolio 단위 / SQL 단위 abstract granularity mismatch / `migration_priority` 자연 axis 대체 (b) 14차 retract burst risk 회피 (2-phase split — Phase 1 + Phase 2) (c) ADR-CHAIN-009 신설 의무 (d) 회귀 fixture 사전 작성 의무. plan + research 2원칙 자산화 (`g-v2.3.0-minor-plan.md` + `g-v2.3.0-minor-research.md`).
- **★ ★ Big-tech first-mover 신호 흡수** — SQL Inventory 도구 (AWS SCT / Oracle SQL Dev Migration Workbench / Liquibase) 모두 TIME 컬럼 부재 사실. `migration_priority` SQL 단위 axis = 본 방법론 first-mover (Gartner TIME application portfolio 분리).

### v2.3.0-rc1 자격 — Phase 1 산출 6/6

1. ✅ chain harness 5 요소 enforcement 보존 (v2.0~v2.3 일관)
2. ✅ schema 12번째 컬럼 추가 + backward-compat 회귀 fixture 통과 (기존 PoC #06+#07 11 컬럼 row test pass)
3. ✅ ADR-CHAIN-009 신설 + 결정 section 검증
4. ✅ unit test 회귀 0 fail (236 pass / 14 workspace)
5. ✅ deliverable 24 §3+§4+§13 정합 갱신
6. ✅ ≥ 5 PoC corroboration 보존 (PoC #06+#07+#08+#09+#10 SQL Inventory isomorphic)

### Phase 2 carry (별도 session)

- C-v2.2.0-3 patterns_extension_v3 (cache / discriminator / typeHandler)
- C-v2.2.0-4 Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 sub-rule 자산화
- ADR-CHAIN-010 (optional / ADR-008 sub-extension 흡수 가능)
- v2.3.0-rc2 → final 격상

### 별도 sprint carry (v2.4 / v3.0)

- **★ C-v2.3.0-gartner-time-application-level** (★ 신규) — `methodology-spec/deliverables/application-portfolio-time.md` 신설 후보 (Gartner TIME application portfolio 별도 deliverable / SQL 단위와 axis 분리).

### 잔존 carry (v2.2.x patch / v2.x)

- C-v2.2.0-1 (NoSQL/Prisma) → paradigm shift / v3.0 후보
- C-v2.2.0-2 (sql-inventory baseline ratchet) → v2.2.x patch
- C-v2.2.0-5 (다중책임 spectrum) → PoC #11 종결 후
- C-v2.2.0-7 (iBATIS 2 전용 dynamic 태그 sub-classification) → v2.2.x patch
- PoC #11 (EFI-WEB billing) source 위임 대기

---

## [v2.2.0] — 2026-05-08 (★ ★ ★ ★ ★ ★ MINOR FINAL — rc1 → final / 5 PoC isomorphic robust + ADR-CHAIN-008 paradigm-cross 정책 완화 + cooling-off 영구 폐기)

> **★ ★ ★ ★ ★ ★ MINOR FINAL** — v2.2.0-rc1 prerelease (2026-05-08 같은 날) 후 ★ ★ ADR-CHAIN-008 채택 + 5 PoC SQL Inventory isomorphic robust 사실 확보 + ★ ★ ★ ★ cooling-off 7d minimum 폐기로 즉시 final 격상. release-readiness §8.1 strict 7/7 ✅ + clean clone 재실행 ✅ + carry burst 0 ✅ + ADR-CHAIN-008 absorption ✅ + npm test 280 pass / 0 fail.

### 본 final entry 변경 사항 (rc1 → final)

- **★ ★ ★ ★ ★ ADR-CHAIN-008 신설** — `docs/adr/ADR-CHAIN-008-paradigm-cross-corroboration-policy.md` "MEDIUM × ≥ 5 PoC isomorphic = strong corroboration 자격 충족" 신정책. 5 PoC SQL Inventory 66.7% × 5 isomorphic + 6 차원 corroboration sum (paradigm + ORM + platform + language + responsibility + scale) + 2 정탐 사실 (raw query() / DSL builder QueryDSL realworld OSS = 2026년 부재 사실).
- **★ ★ ★ ★ 5 PoC corroboration robust** — PoC #06 (iBATIS 2 / 단일책임) + PoC #07 (iBATIS 2 / 다중책임) + PoC #08 (MyBatis 3 / Modern Stripes) + PoC #09 (TypeORM / NestJS) + PoC #10 (Spring Data JPA / DDD).
- **★ ★ ★ ★ ★ cooling-off 7d minimum 정책 영구 폐기** — DEC-2026-05-08-cooling-off-7d-폐기 (사용자 결단 "패기해줘" / DEC-2026-05-06-cooling-off-정책-폐기 정합 강화 / 사용자 명시 결단 우선 원칙).
- **★ release-readiness adr_registry dynamic 검사** — `scripts/release-readiness.js` hardcoded 5 ADR-CHAIN list → glob 동적 조회 (5 → 8 ADR-CHAIN 모두 검사). C-v2.2.x-release-readiness-adr-list resolved.

### v2.2.0 final 자격 — 7/7

1. ✅ chain harness 5 요소 enforcement 보존 (sub-plan-5 ~ v2.0.0 ~ v2.2.0)
2. ✅ ≥ 5 PoC corroboration (PoC #06/#07/#08/#09/#10 SQL Inventory isomorphic / paradigm + ORM + platform + language + responsibility + scale 6 차원)
3. ✅ §8.1 strict 7/7 통과 (release-readiness.js / 8 ADR-CHAIN dynamic)
4. ✅ 233 unit test pass (14 workspace + _shared / 280 total / 0 fail)
5. ✅ clean clone 재실행 통과 (272 files build / version sync 3/3)
6. ✅ carry burst 0건 + ADR-CHAIN-008 absorption (cooling-off Day 1 검증 완료)
7. ✅ Senior F4 critique 검증대 통과 (D 검증 4종 모두 ✅ / "결단 burst risk 사실 ❌")

### v2.2.0 → v2.2.x patch 정책 (Senior F7 정합)

v2.2.x patch trigger:
- release-readiness regress 1+
- Senior HIGH 1+
- 7일 carry > 3건
- 사용자 finding burst (guides 보강 / common-errors 추가)

### v2.3.0 minor plan 초안 (★ 사용자 승인 ❌)

`~/.claude/plans/g-v2.3.0-minor-plan.md` 작성 (Tier 1 추천 3 묶음):
- C-v2.2.0-8 Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼)
- C-v2.2.0-3 patterns_extension_v3 (cache / discriminator / typeHandler)
- C-v2.2.0-4 sub-rule Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종

본 plan = ★ 초안 / v2.2.0 final 후 정식 plan 격상 의무.

---

## [v2.2.0-rc1] — 2026-05-08 (★ ★ ★ PRERELEASE — phase 4.8 sql-inventory 본체 격상 prerelease / Senior STOP signal 흡수 / ★ ★ historical 보존)

> **★ ★ ★ PRERELEASE** — v2.2.0 final 격상 ★ trigger 자격 ❌ (★ paradigm-cross corroboration 부재 / PoC #06+#07 모두 Spring 4.1 + iBATIS 2 = scale-cross only). Modern ORM PoC #08 (carry C-v2.2.0-6) 종결 후 v2.2.0 final 별도 결단. ★ ★ 7d minimum cooling-off (★ Senior 권고 흡수 / 24h ❌). ★ ★ ★ 같은 날 (2026-05-08) PoC #08+#09+#10 종결 + ADR-CHAIN-008 채택 + cooling-off 폐기로 final 격상.

### 변경 사항

**phase 4.8 (sql-inventory) 정식 단계 신설** (★ ADR-CHAIN-007):
- analysis stage 내부 / phase 4.7 후 / phase 5-1 + 5-2 전 / RDB 한정 sub-phase
- 11 컬럼 = 외부 6 (Opus 4.7 외부 조언 / sql_id / mapper_xml / called_from_screen / business_meaning / dynamic_branch / dependent_tables) + ★ statement_type (★ Agent 1 강 권고 흡수 / MyBatis 14 표준 속성 / SP 식별 의무) + 본 추가 4 (uc_link / intent_vs_bug_classification / confidence / carry_flags)
- extraction_automation metric 의무 (외부 6 컬럼 자동화 ≥ 50% pass / PoC #06+#07 baseline 4/6 = 66.7%)
- carry_flags enum 8종 / external_call_out_of_scope 또는 DBA-read 시 confidence ≤ 0.80 if/then 의무
- patterns_extension_v2 = optional / Legacy iBATIS 한정 (PoC #07 D12 (b) nested patterns object)
- patterns_extension_v3 (cache / discriminator / typeHandler) = C-v2.2.0-3 carry

**본체 격상 자산 7 + workflow**:
1. `methodology-spec/deliverables/24-sql-inventory.md` (★ #23 사용 / #24 신규)
2. `schemas/sql-inventory.schema.json` (★ 31번째 schema)
3. `schemas/meta-confidence.schema.json` `inputs_used` enum 13 → 14 (`sql_inventory` 추가)
4. `skills/analysis/phase-4-8-sql-inventory/SKILL.md` (★ skills 20 → 21)
5. `tools/sql-inventory-extractor/` (★ workspace 14번째 / 10 unit test)
6. `flows/analysis.phase-flow.{json,mermaid}` v2.1.0 → v2.2.0-rc1 (phase 4.8 entry)
7. `methodology-spec/workflow/phase-4-8-sql-inventory.md`
8. `docs/adr/ADR-CHAIN-007-phase-4-8-sql-inventory.md` (★ 5 정책 명문화 + 외부 권위 19종 footnote)

**unit test 회귀 (232 → 233 / +1)**:

| workspace | v2.1.1 | v2.2.0-rc1 |
|---|---|---|
| sql-inventory-extractor | (없음) | **10** (★ 신설 / valid PoC #06+#07 + 5 invalid case) |
| 그 외 13 workspace | 232 | 223 (재계산 결과) |
| **합계** | 232 | **233** |

★ workspace-wide `npm test --workspaces` 233 모두 pass / 0 fail.

★ drift-validator `--check-layout`: ★ 11 phases / 21 skills / 0 orphans / 0 missing ✅.

### 결단 의뢰 흡수 (research §B / D1=b / D7=α / D8=a / D4=b)

★ **Senior STOP signal** (★ ★ ★ paradigm-cross corroboration 부재) 흡수:
- (a) v2.2.0 final 격상 ❌ → ★ ★ v2.2.0-rc1 prerelease ★ 7d minimum cooling-off
- (b) Modern ORM PoC #08 carry C-v2.2.0-6 = v2.2.0 final 격상 trigger
- (c) ADR-CHAIN-007 본문에 paradigm gap 우려 + PoC #08 의무 명문화

★ **Agent 1 (공식 docs) 빈틈 4건** 모두 흡수:
- statement_type 11번째 컬럼 (★ MyBatis 14 표준 속성)
- patterns_extension_v3 carry note (cache / discriminator / typeHandler)
- iBATIS 2 전용 dynamic 태그 enum carry (C-v2.2.0-7)
- ADR 본문에 Feathers + Gartner TIME + AWS MAP 인용 명문화

★ **Big-tech (Agent 2)** 권고:
- "Why not AWS SCT" 차별화 절 (deliverable §1.2)
- ★ "SQL-level Inventory = 본 방법론 고유 contribution" 명시

### chain harness 5 요소 변경 ❌

analysis stage 내부 phase 추가만 — chain 1~4 driver / state schema / hooks / SDLC flow 변경 ❌.

### 미해결 (★ v2.2.0 final / v2.x carry)

| ID | 항목 | trigger |
|---|---|---|
| **C-v2.2.0-6** | **★ ★ ★ Modern ORM PoC #08 (paradigm-cross corroboration)** | ★ v2.2.0 final 격상 trigger / 7d minimum 후 |
| C-v2.2.0-1 | Modern 환경 NoSQL/Prisma 정합 검증 | ≥ 1 Modern PoC 후 |
| C-v2.2.0-2 | sql-inventory baseline ratchet | v2.2.x patch / 사용 시 |
| C-v2.2.0-3 | patterns_extension_v3 (cache / discriminator / typeHandler) | ≥ 2 Legacy PoC 후 |
| C-v2.2.0-4 | sub-rule Spring 4.1 + iBATIS 2 spectrum AP isomorphic 5종 | 별도 plan |
| C-v2.2.0-5 | sub-rule 다중책임 spectrum (AP-CAPITAL-005~011) | ≥ 2 다중책임 PoC 후 |
| C-v2.2.0-7 | iBATIS 2 전용 dynamic 태그 sub-classification | v2.2.x patch |
| C-v2.2.0-8 | Gartner TIME 2축 매핑 (`time_classification` 12번째 컬럼) | v2.3+ |
| C-v2.2.0-9 | "Why not AWS SCT" 차별화 절 §1 motivation 보강 | v2.2.0 final 시 |

---

## [v2.1.1] — 2026-05-07 (★ PATCH — phase 4.7 ratchet trend baseline 자동 검증 / C-v2.1.0-5 carry resolved)

> **★ PATCH** — v2.1.0 carry C-v2.1.0-5 즉시 resolve. `coverage_strategy=ratchet` + `trend_required=true` 시 이전 측정 (baseline) 비교 자동 검증 신설. chain harness 5 요소 변경 ❌ / 본체 schema 변경 ❌.

### 변경 사항

**`tools/_shared/baseline.js` 확장** (★ findings-based ratchet 와 분리된 coverage trend 함수 3종):
- `readCoverageBaseline(path)` — baseline JSON read / 부재 시 null
- `writeCoverageBaseline(path, { coverage_ratio, coverage_strategy, project_id })` — baseline write
- `coverageTrendCheck(currentRatio, baseline, { tolerance: 0.01 })` — current ≥ baseline 검증 (단조 비감소 / tolerance ε=0.01 fluctuation 흡수)

**`tools/characterization-coverage-validator/` v0.1.0 → v0.1.1**:
- `--coverage-baseline <path>` flag 신규 (이전 측정 baseline 비교)
- `--write-coverage-baseline` flag 신규 (legacy 첫 진입 또는 trend pass 후)
- `coverage_strategy=ratchet` + `trend_required=true` 시 baseline 비교 자동 실행
- finding 신규: `coverage.trend_negative_ratchet` (high / current < baseline = regression block)

**unit test 회귀 (228 → 232)**:

| workspace | v2.1.0 | v2.1.1 |
|---|---|---|
| characterization-coverage-validator | 10 | **14** (★ +4 ratchet trend) |
| 그 외 12 workspace | 209 | 209 |
| release-readiness self-test | 9 | 9 |
| **합계** | 228 | **232** |

신규 4 unit test:
1. ★ ratchet trend — first run (no baseline) → pass + recommend write
2. ★ ratchet trend — current ≥ baseline → pass (positive 또는 flat)
3. ★ ratchet trend — current < baseline → high finding (regression block)
4. ★ ratchet baseline write — `--write-coverage-baseline` 옵션 file 생성

### Carry 갱신

- ✅ ~~C-v2.1.0-5 ratchet trend_required=true 자동 검증~~ → ★ ★ resolved
- (기타 carry C-v2.1.0-1~4, 6~7 보존)

### 진입 자격 (v2.1.1 PATCH)

| 자격 | 충족 |
|---|---|
| scope 작음 | ✅ tool 1개 + _shared 1개 (≤ 100 line code) |
| chain harness 5 요소 변경 | ❌ |
| 본체 schema 변경 | ❌ (CLI flag + validator option 만) |
| unit test 회귀 통과 | ✅ 232 / 0 fail |
| version-check 3 source sync v2.1.1 | ✅ |
| 14차 retract 위험 | ↓ (carry resolve / 기존 자산 변경 ❌) |

★ release / git tag `v2.1.1` 의무.

---

## [v2.1.0] — 2026-05-07 (★ ★ MINOR — phase 4.7 (characterization) 본체 격상 / 의도 vs 버그 분리 + Given/When/Then snapshot acceptance oracle / ADR-CHAIN-006 / ≥ 2 PoC corroboration)

> **★ ★ MINOR** — v2.0.0 MAJOR FINAL release (2026-05-07 / 같은 날) 직후 phase 4.7 본체 격상. ≥ 2 PoC corroboration 사실 확보 (PoC #06 Spring 4.1 Legacy + PoC #03 NestJS Modern retrofit / DEC-2026-05-07-poc-06-종결 + DEC-2026-05-07-poc-07-poc03-phase7-retrofit) → 본체 자산 6 + workflow spec 1 격상. chain harness 5 요소 변경 ❌ — analysis stage 내부 phase 추가만.

### v2.1.0 본체 격상 자산 (6 + 1 workflow)

| 자산 | 위치 | 의도 |
|---|---|---|
| deliverable | `methodology-spec/deliverables/23-characterization-spec.md` | 산출물 23 (★ #16~22 사용 중 / 23 신규) |
| schema | `schemas/characterization-spec.schema.json` (★ 30번째) | 4 sub-schema (snapshot + scenario + intentVsBug + coverage) + if/then 강제 |
| meta-confidence enum | `schemas/meta-confidence.schema.json` `inputs_used` 12 → 13 | `characterization` 추가 |
| skill | `skills/analysis/phase-4-7-characterization/SKILL.md` | 단일 prompt 양 spectrum (skills 19 → 20 / Cursor/Cline/Aider 표준) |
| tool | `tools/characterization-coverage-validator/` (★ workspace 13번째) | 8 검증 + 10 unit test |
| flow | `flows/analysis.phase-flow.{json,mermaid}` v1.5.0 → v2.1.0 | phase 4.7 entry + 5-x depends_on 갱신 |
| workflow spec | `methodology-spec/workflow/phase-4-7-characterization.md` | drift-validator 3-way 회귀 통과 |
| ADR | `docs/adr/ADR-CHAIN-006-phase-4-7-characterization.md` | 4 정책 명문화 (위치 + 단일 prompt + 4분류 + ratchet) |

### 외부 권위 (research-v210 §4 / 12종)

- Michael Feathers, *Working Effectively with Legacy Code* (2004) §13 — Characterization Test
- Gojko Adzic, *Specification by Example* (2011) — Given/When/Then BDD
- Cucumber Gherkin Reference (Feature / Scenario / Tag 표준)
- Maldonado & Shihab (2015) — Self-Admitted Technical Debt (SATD/KL-SATD)
- Springer SQJ 2024 — KL-SATD ↔ SonarQube 학술
- PIT (PITest) / Stryker Mutator — coverage threshold 80% 산업 표준
- BullseyeCoverage — minimum coverage gate (80% line + 70% branch)
- jest-coverage-ratchet (npm) — legacy ratchet pattern
- Cursor / Cline / Aider — 단일 prompt + context retrieval / 분기 ❌

### research 빈틈 3건 흡수 (D6 = a / 모두 흡수)

1. ★ Modern PoC self_recognized = 0 정합 (`schemas/characterization-spec.schema.json` description 명시)
2. ★ ratchet schema 분리 (`coverage_target` + `coverage_minimum_legacy` + `coverage_strategy` enum)
3. ★ Gherkin tag 표준 dual encoding (snapshot scenario `feature` + `tags` optional 필드)

### ≥ 2 PoC corroboration (★ §8.1 strict)

| PoC | spectrum | 명확 분류 비율 | self_recognized | ambiguous |
|---|---|---|---|---|
| **PoC #06** (Spring 4.1 + iBATIS) | Legacy 적대성 4중 | 17/18 = 94% (D2 후) | 1 (AP-007 자조) | 1 (DBA carry) |
| **PoC #03 retrofit** (NestJS Modern) | Modern | 30/30 = 100% | 0 (자연 부재) | 0 |

### unit test 회귀 (218 → 228)

| workspace | 직전 (v2.0.0) | 현재 (v2.1.0) |
|---|---|---|
| drift-validator | 47 | 47 (변경 없음 / phase 4.7 entry 자동 인식) |
| chain-driver | 68 | 68 |
| 그 외 10 도구 | 94 | 94 |
| ★ characterization-coverage-validator | — | **10** (★ 신설) |
| **workspace 합계** | 209 | ★ 219 |
| release-readiness self-test | 9 | 9 |
| **총 합계** | 218 | ★ ★ **228** |

### Carry (v2.1.x patch / v2.x)

| ID | 항목 | trigger |
|---|---|---|
| C-v2.1.0-1 | snapshot Gherkin (.feature) 변환 출력 | v2.1.x patch / 사용자 finding |
| C-v2.1.0-2 | Modern 환경 명확 비율 ≥ 95% 자동 detect | v2.2+ |
| C-v2.1.0-3 | acceptance oracle threshold dashboard | v2.x |
| C-v2.1.0-4 | F-PHASE7-001~004 일반화 검토 (≥ 3 PoC corroboration 후) | ≥ 3 PoC corroboration |
| C-v2.1.0-5 | ratchet `trend_required=true` 자동 검증 (baseline.js 통합) | v2.1.x patch |
| C-v2.1.0-6 | ts-morph + 실 환경 (DB) snapshot 자동 추출 | v2.x |
| C-v2.1.0-7 | sub-rule 추가 (Spring Boot 3 / FastAPI / Express 등 다른 spectrum) | 사용자 PoC corroboration |

### 진입 자격 (사용자 결단 D6 = (a) / Senior cooling-off (a) 즉시 final)

| 자격 | 충족 |
|---|---|
| ≥ 2 PoC corroboration | ✅ PoC #06 + PoC #03 retrofit |
| 명시 carry | ✅ C-v2.1.0-1~7 |
| 본체 격상 자산 | ✅ 6 + 1 workflow |
| unit test 회귀 통과 | ✅ 219 workspace + 9 release = 228 |
| build dist | ✅ ai-native-methodology-v2.1.0/ |
| release-readiness 7/7 | ✅ |
| chain harness 5 요소 변경 | ❌ (analysis stage 내부만 / scope 작음) |

★ release / git tag `v2.1.0` 의무.

---

## [v2.0.0] — 2026-05-07 (★ ★ ★ ★ ★ ★ MAJOR FINAL release — chain harness validated / SDLC 4단계 i-strict / clean clone 재실행 통과 / Senior F4 24h+ cooling-off 통과)

> **★ ★ ★ MAJOR FINAL** — 2026-05-06 v2.0.0-rc1 prerelease 후 24h+ cooling-off (Senior F4 요구사항) 통과. clean clone (`/tmp/aimd-clean-clone.*/`) 환경에서 npm install + npm test (218 pass) + release:check 7/7 ✅ + PoC #05 vitest 6/6 GREEN 모두 통과 → final tag 자격 충족.

### Final tag 진입 검증 (2026-05-07 / DEC-2026-05-07-v2.0.0-final)

| 검증 항목 | 결과 |
|---|---|
| clean clone npm install | ✅ 83 packages / 0 vulnerabilities |
| version-check (3 source) | ✅ 모든 source v2.0.0-rc1 정합 (이후 v2.0.0 sync) |
| npm test (12 workspace) | ✅ chain-driver 68 + 그 외 → 218 pass |
| release:check §8.1 strict 7/7 | ✅ "v2.0.0 = release-ready" |
| PoC #05 vitest e2e | ✅ 6/6 GREEN (chain 4 enforcement 정합) |
| Senior F4 24h+ cooling-off | ✅ rc1 (2026-05-06) → final (2026-05-07) |

★ ★ rc1 entry 의 모든 highlights (chain harness validated 5 요소 / SDLC 4단계 / §8.1 7/7 / breaking changes / Migration / unit test 회귀 / Carry) = v2.0.0 final 에서도 유지. 본 entry = final tag 진입 record + 검증 결과.

### 변경 사항 (rc1 → final)

- `plugin.json` / `package.json` / 본 CHANGELOG version: `2.0.0-rc1` → **`2.0.0`**
- `plugin.json` description: 198 unit test → **218 unit test** (실측 정합) + clean clone 재실행 통과 명시
- build artifact: `dist/ai-native-methodology-v2.0.0/` (★ cleanup round 2-E path)

### v2.0.0 → v2.0.x patch 정책 (Senior F7 정합)

v2.0.x patch trigger:
- release-readiness regress 1+
- Senior HIGH 1+
- 7일 carry > 3건
- 사용자 finding burst (guides 보강 / common-errors 추가 등)

### Carry (v2.0.x / v2.1+)

- v2.0.x: 본 release 에 누락된 작은 정돈 (cleanup round 2-F/G/H carry)
- v2.1+: chain-revisit-detector 진짜 LLM auto-invoke / tree-sitter semantic diff / 다중 사용자 driver state 동시성

---

## [v2.0.0-rc1] — 2026-05-06 (★ ★ ★ ★ ★ MAJOR PRERELEASE — chain harness validated / SDLC 4단계 i-strict / ≥ 2 PoC corroboration / §8.1 7/7 통과)

> **★ MAJOR bump 정당성** (semver §8): chain harness 가 v1.x 산출물 (한 방향 7대 추출기) 의 paradigm 을 대체. v1.x skill 호출 → v2.x chain-driven slash command (`/aimd-next`, `/aimd-stage`) 로 전환. 사용자 workflow backward-incompatible → MAJOR.
> **★ -rc1 prerelease** (Senior F4 흡수 / 14차 retract pattern 차단): sub-plan-5 commit 같은 날 final tag ❌ / rc1 → 24h+ 후 final.
> **청자**: 사내 onboarding + 외부 plugin install user. migration guide → `docs/MIGRATION-v1-to-v2.md`.

### Highlights — chain harness validated (5 요소 코드 enforcement)

| 요소 | 구현 | sub-plan |
|---|---|---|
| Driver / Orchestrator | `tools/chain-driver/` workspace 12번째 (cli + 6 module / 60 unit test) | sub-plan-5 |
| State 영속 | `schemas/state.schema.json` + atomic write CAS + Windows fallback | sub-plan-5 |
| Mechanical gate trio | (i) state.blocked + (ii) cli exit 2 + (iii) PreToolUse permissionDecision=deny | sub-plan-5 |
| Skill auto-invoke (D21') | `hooks/hooks.json` UserPromptSubmit + PreToolUse / suppressOutput=true / additionalContext 차단 문구 | sub-plan-5 |
| Chain-revisit detector | `revisit-detect.js` git diff --numstat + LOC threshold + ignore-globs | sub-plan-5 |

### What's new

- **SDLC 4단계 chain harness** (DEC-2026-05-06-v2.0-i-strict-채택): chain 1 planning → chain 2 spec (behavior + acceptance + 7대 통합) → chain 3 test (RED) → chain 4 impl (GREEN / 100% test pass).
- **chain validator 4종** (sub-plan-3a/3b): planning-extraction / chain-coverage / spec-test-link / test-impl-pass-validator.
- **chain skill 13** (sub-plan-4): _base 2 + planning 3 + spec 3 + test 3 + implement 2.
- **chain stage flow 5** (sub-plan-4): {analysis,planning,spec,test,implement}.phase-flow.{json,mermaid} + sdlc-4stage-flow.{json,mermaid} 통합 SSOT.
- **5 ADR-CHAIN** (sub-plan-2 + sub-plan-5): chain-4-stage-enforcement / go-stop-gate / revisit-loop / test-runner-invocation-contract / driver-state-machine.
- **release-readiness.js** (sub-plan-6): §8.1 strict 7/7 자동 검사 + 9 self-test (Senior F3 — file presence ❌ / content-aware delegated tool).
- **drift-validator `--check-state-flow-consistency`** (sub-plan-6 / sp5-c7): state.schema enum ↔ sdlc-4stage-flow stages 정합 build-time 검증.

### PoC corroboration (≥ 2)

| PoC | Scope | Status |
|---|---|---|
| **PoC #05 sample-user-register** | chain 1~4 e2e single-cycle (2 UC + 2 BR + 2 TC + 2 IMPL / vitest 6/6 pass) | ★ ★ ★ corroboration #1 |
| **PoC #03 NestJS retrofit** | chain 1~2 + chain 3 RED dry-run (2 UC subset / signup + login) | corroboration #2 |

### §8.1 strict 7/7 (release gate)

```
✅ 1. poc_corroboration: 2 PoC
✅ 2. real_tool_evidence: 5종 물증 7 필드 (10 fields) all present / sha256 valid
✅ 3. validators_violation: 4 validators all 0 critical/high
✅ 4. chain_coverage: 1.0 / threshold 0.85
✅ 5. adr_registry: 5 ADR-CHAIN 모두 status: 승인됨 + 결정 section
✅ 6. matrix_greenness: forward=1 / backward=1 / cells=2 / green=2
✅ 7. e2e_cycle_pass: pass=6 / fail=0 (chain 4 GREEN)
```

### Breaking changes

1. **Workflow paradigm**: v1.x = `/init` → 7대 산출물 → 끝. v2.0 = `chain-driver init` → 4 stage gate. v1.x skill 직접 호출 시 mechanical gate trio 가 차단할 수 있음.
2. **state.json 영속 의무**: 사용자 프로젝트에 `.aimd/state.json` 자동 생성 (chain-driver init). v1.x = 영속 state 없음.
3. **PreToolUse hook**: `.aimd/output/**` 대상 Write/Edit 시 driver 가 차단 가능 (state.blocked=true 일 때).
4. **harness 호칭**: "한 방향 추출기" ❌ → "SDLC 4단계 chain harness". README + plugin.json description 변경.

### Migration

`docs/MIGRATION-v1-to-v2.md` 참조.

### unit test 회귀 (210 = 201 workspace + 9 release-readiness)

| 영역 | v1.5.0 | v2.0.0-rc1 |
|---|---|---|
| drift-validator | 44 | **47** (+3 state-flow) |
| 그 외 10 도구 | 94 | 94 |
| chain-driver | — | **60** (sub-plan-5 신설) |
| **workspace 합계** | 138 | **★ 201** |
| release-readiness self-test | — | **9** |
| **총 합계** | 138 | **★ ★ ★ ★ ★ 210** |

### Carry (v2.0.x → v2.1+)

- sp6-c1 RealWorld scale e2e (PoC #03 진짜 jest + impl) — v2.1+
- sp6-c2 intervention-log dashboard — v2.1+
- sp6-c3 Auto Mode 차단 임계 분포 분석 — v2.1+
- sp6-c4 PoC #04 retrofit (FE 트랙) — v2.1+ (★ v2.0 = BE-only corroboration / Senior F7)
- sp6-c5 tree-sitter semantic diff (sp5-c1) — v2.x
- sp6-c6 다중 사용자 driver state 동시성 (sp5-c2) — v2.x
- sp6-c7 hooks 진짜 LLM auto-invoke (sp5-c3) — v2.x
- sp6-c8 chain-driver chaos test (Senior F5 — CAS race / JSONL concurrency / mid-stage SIGINT) — v2.0.x

### Cleanup round 2-E (2026-05-06 / DEC-2026-05-06-cleanup-round-2-E / build path 정합)

★ 사용자 명시 결단 — `dist/internal-v<version>/` → **`dist/ai-native-methodology-v<version>/`**.

v1.4.3 시점 `internal-` prefix 가 v2.0 paradigm + plugin user 환경 path (`~/claude-plugins/ai-native-methodology-v<version>/`) 와 stale. paradigm change cascading drift 추가 회수.

7 자산 갱신: `scripts/build-plugin.js` (line 2 + 123) / `README.md` (line 80, 171) / `guides/common-errors.md` / `templates/adoption/CLAUDE.md` / `templates/README.md` / project root `CLAUDE.md`. historical (archive + DEC-historical + CHANGELOG entry) 보존.

dist 256 files (변경 0 / path rename) / shasum -c 255 OK.

### Cleanup round 2-C / 2-D (2026-05-06 / DEC-2026-05-06-cleanup-round-2-C-D / journey 자산 + project root sync)

★ ★ ★ cleanup round 2 series **마지막 단계**.

**Round 2-C** = `guides/` 디렉토리 신설 (5 file):
- `getting-started.md` (시나리오 A/B/C + 10분 walkthrough)
- `chain-harness-guide.md` (chain-driver mental model + state.json + 5 요소)
- `common-errors.md` (FAQ 14건)
- `first-prompt-cookbook.md` (자연어 → skill 34 매핑)
- `guides/README.md` (navigation)

**Round 2-D** = project root `CLAUDE.md` v1.4.3 → v2.0.0-rc1 라벨 sync + guides/ 추가 (LLM 자동 컨텍스트 / dist 미포함).

dist 251 → **256** files (+5) / shasum 255 OK. build-plugin.js INCLUDE 에 'guides' 추가.

**cleanup round 2 series 종결** — 사용자 진짜 의도 ("정돈 + 각 폴더 visible + journey friction 해소") 모두 정합:
- 1 (`80cb783`) — docs/ archive 격리
- 2-A (`b25a8ad`) — paradigm sync (327 → 241)
- 2-B (`307f55b`) — 10 신설 (★ 사용자 진짜 핵심)
- 2-B 후속 (`8b7effe`) — 9 도구 표준화 + 10 placeholder
- 2-C/2-D (현재) — journey 자산 + project root sync

**Carry (v2.1+)**: CHANGELOG 추가 격리 / guides 보강 / mermaid 시각화 / v2.0.0 final tag.

### Cleanup round 2-B 후속 (2026-05-06 / DEC-2026-05-06-cleanup-round-2-B-followup / 표준화 + placeholder 정돈)

★ ★ Round 2-B 후속 — (1) 9 도구 README 표준 schema 통일 (Purpose / When / In / Out / Exit / Siblings / 참조) / (2) 10 placeholder README 정돈 / (3) schemas/README 갱신 (11 → **29 schema**).

| 영역 | 처리 |
|---|---|
| 9 도구 표준 schema | chain-coverage / decision-table / drift / formal-spec-link / planning-extraction / spec-test-link / spectral / static / traceability |
| 10 placeholder | skills/{test,planning,implement} 활성 / skills/design + agents/design + templates/design v2.x carry / agents/analysis + templates/{test,planning,implement} lifecycle 정합 |
| schemas/README | chain v2 6 + state 3 + BE 5 + FE 8 + cross-cutting 4 + 메타 |
| dist file | 251 (변경 없음) |
| 변경 file | 20 |

stale 메시지 제거 ("v1.4.x analysis only" → v2.0.0-rc1 chain harness validated 정합) / Sibling cross-link 그래프 완성. shasum 250 OK.

**Carry**: Round 2-C (사용자 journey 자산) + Round 2-D (project root CLAUDE sync).

### Cleanup round 2-B (2026-05-06 / DEC-2026-05-06-cleanup-round-2-B / 각 폴더 README 정돈)

★ ★ ★ 사용자 reframe 2차 ("각 폴더 자산 정돈 + 참조 + 호출 visible") **핵심 의도 정합** — 부재 README 10 신설 (6 폴더 + 4 도구). 표준 schema (Purpose / When / In / Out / Exit / Siblings / 참조) 통일.

| 영역 | before | after |
|---|---|---|
| dist files | 241 | **251** (+10) |
| 부재 README | 10 | **0** |
| 도달 path "각 폴더 정돈 / 참조 / 호출" | ❌ | ✅ |

**6 폴더 README 신설**: `tools/` ★ 12 도구 cadence table / `methodology-spec/` ★ phase × deliverable × schema 매트릭스 / `agents/` / `skills/` / `hooks/` / `templates/`

**4 도구 README 신설**: `chain-driver/` ★ 5 요소 enforcement / `_shared/` / `schema-validator/` / `test-impl-pass-validator/` ★ no-simulation 핵심

**Carry**: Round 2-B 후속 (9 도구 표준화 + 10 placeholder 정돈) + Round 2-C (journey 자산) + Round 2-D (project root CLAUDE).

### Cleanup round 2-A (2026-05-06 / DEC-2026-05-06-cleanup-round-2-A / plugin artifact 정돈)

★ ★ ★ v2.0.0-rc1 build artifact paradigm sync — 사용자 reframe 2회 ("정돈 ≠ 다이어트" → "각 폴더 정돈 + 참조 + 호출 visible") 후 3 agent 병렬 (UX / SSOT / journey) 으로 **8 카테고리** 식별. 본 round = Critical 5 (paradigm sync + CHANGELOG split + dist tools noise + flows SSOT + ADOPTION-README 처분).

| 영역 | before | after |
|---|---|---|
| dist files | 327 | **241** (-86 / -26%) |
| paradigm version (CLAUDE/README/marketplace) | v1.3.0 / v1.4.2 / v1.x stale | ★ all **v2.0.0-rc1** |
| `CHANGELOG.md` | 1865 line | **1060 line** (v1.4+) + `CHANGELOG-HISTORY.md` 820 line (신규) |
| dist 안 test/corpus/fixtures | 80+ files | **0** |
| `ADOPTION-README.md` (dist root) | 1 (별칭) | 0 (단일 entry-point) |

**갱신**: `marketplace.json` (chain harness 정합) / `templates/adoption/CLAUDE.md` (dist root alias) v1.3 → v2.0.0-rc1 rewrite / `README.md` v1.4.2 → v2.0.0-rc1 rewrite / `flows/README.md` sdlc-4stage SSOT 명시 / `scripts/build-plugin.js` EXCLUDE + ADOPTION 별칭 비활성. **Carry (Round 2-B/2-C/2-D)**: 각 폴더 README 정돈 (★ 사용자 진짜 핵심) / 사용자 journey 자산 신설 / project root CLAUDE 갱신. ★ no release / no tag / v2.0.0 final 자격 영향 ❌.

### Cleanup round 1 (2026-05-06 / DEC-2026-05-06-cleanup-round-1 / B-only)

★ ★ v2.0.0-rc1 직후 사용자 명시 요청 정리 — `docs/` 활성 + 폐기 혼재 → 9 파일 `archive/` 격리.

| 영역 | before | after |
|---|---|---|
| `docs/` | 39 | **30** (-9) |
| `archive/` | 13 | **22** (+9 / `v1.3-adoption/` 6 + `v1.4-evaluation/` 1 + `phase-a-iteration/` 2) |

- **B-only**: `docs/adoption/*` 5 + `docs/v1.3-promotion-report.md` + `docs/v1.4-evaluation-report.md` + `docs/phase-a-iteration-{guide,0-preflight}.md` 9 파일 git mv (rename / git history 보존) + `rmdir docs/adoption/`
- **Link rot 차단** 11건: project root `CLAUDE.md` 4 + `README.md` 4 + `STATUS.md` 2 + `flows/README.md` 1
- **Skip per 사용자**: A (PoC 진행 로그 17) + C (plan-phase 13) — "poc 쪽은 신경 안써도 됨"
- **Historical 보존**: DEC-* 안 옛 경로 / archive 자체 ref / CHANGELOG entry / .claude/ 작업 로그 = 갱신 ❌
- **Carry (cleanup round 2)**: 4 hub (CLAUDE/STATUS/CHANGELOG/INDEX) v2.0 정보 3중 누적 통합 (별도 라운드 / v2.0.0 final 후)

★ no release / no tag / 본체 commit 만 / release-readiness 7/7 무관 / v2.0.0 final 자격 영향 ❌.

### v2.0.0-rc1 → v2.0.0 final

- **동일 commit 같은 날 final tag ❌** (Senior F4 / 14차 retract pattern 차단).
- final = 2026-05-07 이후 + clean clone 1회 PoC #05 e2e 재실행 통과 시.
- v2.0.1 trigger 명문화 (Senior F7): release-readiness regress 1+ / Senior HIGH 1+ / 7일 carry > 3.

---

## [v1.5.0] — 2026-05-03 (★ ★ ★ ★ MINOR — ADR-BE-001 negative-space corroboration 정식화 + error-mapping-spec deliverable 16 + phase-5-error-mapping skill 신설)

### ★ ★ ★ ★ 배경 — §8.1 strict 정합 검증대 ★ 두 번째 통과 (negative-space 변형)

직전 v1.4.5 PATCH 에서 ★ AP-API-001 의 ★ 3 BE PoC negative-space isomorphic 자동 회귀 도구 종결 (Spring rule + NestJS sub-rule). ★ ★ ★ 본 MINOR = ★ ★ ADR-FE-007 (★ positive-space — 4 PoC 모두 anti-pattern 보유 / 2026-05-02 첫 통과) 의 ★ ★ ★ ★ negative-space variant 정식화.

★ ★ ADR-FE-007 ↔ ADR-BE-001 ★ 대칭 입증:

| 패턴 | ADR | 정의 | evidence |
|---|---|---|---|
| **positive-space** | ADR-FE-007 | N PoC 가 ★ 같은 anti-pattern 을 ★ 보유 | ★ 4 PoC 모두 JWT 보안 위반 (Java + Hexagonal + NestJS + React) |
| **★ negative-space** | **★ ADR-BE-001** | N PoC 가 ★ 같은 정합 contract 를 ★ 부재 | ★ 3 BE PoC 모두 error mapping contract 부재 (Spring 2.5 + Spring 3 + NestJS) |

### ★ ★ ★ ★ 산출

#### `docs/adr/ADR-BE-001-negative-space-corroboration.md` 신설 (★ ★ ★ ★ 핵심)

★ ★ ★ negative-space corroboration 패턴 ★ 정식화. patterns ≥ N (★ strict ≥ 3) 임계 자연 충족 자격을 ★ "★ contract 부재" 도 ★ 동등 인정. evidence 4종 의무 (contract_absent + negative_effect + industry_standard + automatic_regression_capable).

#### `schemas/error-mapping-spec.schema.json` 신설 (★ ★ deliverable 16)

BE error contract 자동 추출 명세. ★ 주요 필드:
- `exception_handlers[]` — Spring @ControllerAdvice / NestJS @Catch / global filter ★ 발견 표 (★ 빈 배열 = ★ ★ negative-space evidence)
- `http_status_mapping[]` — 도메인 예외 ↔ HTTP status × `mapping_mechanism` enum 8종 (★ ★ `throw_unmapped` = ★ AP-API-001 trigger)
- `decorator_drift[]` — NestJS-specific (★ post_default_201_for_login / apiresponse_201_for_delete 등 5 enum)
- ★ ★ ★ `negative_evidence` — ADR-BE-001 정식 evidence 4종 (contract_absent + negative_effect + industry_standard + automatic_regression_capable)
- `framework_neutrality_score` — 정량 (1.0 목표 / framework 무관 표준)
- `ap_links[]` — 회귀 / 발견 antipattern ID

#### `skills/analysis/phase-5-error-mapping/SKILL.md` 신설

phase 5-1 (api) 의 ★ 신규 발동 skill. ★ frontmatter description = "Use when project is BE (Spring / NestJS / Express) AND has REST API endpoints that throw domain exceptions OR uses status code decorators (@Post / @ApiResponse)".

9 절차:
1. Framework detection (spring / nestjs / etc.)
2. Exception handler scan (★ 0 hit = negative-space trigger)
3. ★ Semgrep custom rule 실행 (Spring rule + NestJS sub-rule)
4. ★ ADR-010 baseline + ratchet 통합
5. HTTP status mapping 표 작성
6. NestJS decorator drift 분기
7. ★ ★ ★ negative_evidence 4종 작성 (★ ADR-BE-001 정합)
8. AP 등재 (★ AP-API-001 cross-PoC 평가)
9. error-mapping-spec.json 작성

#### `flows/analysis.phase-flow.json` v1.4.4 → v1.5.0

phase 5-1 (api) 의 `outputs` 에 `error-mapping-spec.json` 추가 + `skills` 에 `phase-5-error-mapping` 추가. version_milestones v1.5.0 entry 추가.

#### `methodology-spec/skills-axis.md` §5 매핑 표 갱신

phase 5-1 (api) row 에 `phase-5-error-mapping` (★ v1.5.0 신설) 추가.

### ★ ★ §8.1 strict 정합 검증대 ★ 두 번째 통과

| 단계 | 결단 |
|---|---|
| ADR-FE-007 (2026-05-02) | ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과 (★ positive-space) |
| **★ ADR-BE-001 (2026-05-03)** | ★ ★ ★ §8.1 정합 검증대 ★ 두 번째 통과 (★ ★ ★ negative-space 변형) |

→ ★ ★ ★ ★ ★ §8.1 정합 + cross-PoC patterns 임계 평가 + ★ ★ negative-space 변형 정식화 + 본체 격상 결단 절차 ★ ★ 확장.

### ★ ★ b87cec5 + v1.4.5 PATCH 흡수

본 MINOR = ★ b87cec5 (옵션 2′ Spring rule / no release) + v1.4.5 (옵션 2 NestJS sub-rule + AP-API-001 cross-PoC base 정합) 의 ★ ★ 본체 ADR + schema + skill 정식 격상 통합.

### 검증

- ✅ ADR-BE-001 신설 (★ ★ ★ ★ 핵심 결단)
- ✅ schemas/error-mapping-spec.schema.json (★ JSON 정합 / 6 required 필드 + if/then)
- ✅ skills/analysis/phase-5-error-mapping/SKILL.md (★ frontmatter 정합)
- ✅ flows/analysis.phase-flow.json v1.5.0 (★ phase 5-1 skills 3 → 4)
- ✅ skills-axis.md §5 표 갱신
- ✅ drift-validator --check-layout: 9 phases / 19 skills / 0 orphans / 0 missing (★ 18 → 19 신규 skill 등록)
- ✅ 4 tool 회귀 의무 (static-runner / drift-validator / formal-spec-link-validator / decision-table-validator)
- ✅ version-check 3-source sync at v1.5.0
- ✅ build artifact dist/internal-v1.5.0/ + CHECKSUMS.txt

### ★ ★ carry — v1.5.1+ PATCH (사용자 결단 영역)

- ★ ★ ★ ts-morph NestJS @HttpCode + @Post + @ApiResponse 결합 decorator semantic 분석 (★ Semgrep pattern-not-inside 한계 보완 / ★ AST-level)
- ★ AP-API-001 PoC #01 evidence 보강 (★ Spring 2.5 source 적용 시 직접 confirm)
- ★ schemas/antipatterns.schema.json 본체 antipattern 카탈로그 ★ 첫 등재 (★ ★ ADR-FE-007 carry 와 합산)
- ★ drift-validator BE corpus (error-mapping-equiv-01 + drift-01) — ★ structural equivalence 부재 영역 / 적정 design 후 carry
- ★ agents/analysis/error-mapping-extractor.md (★ thin agent / SKILL.md 만으로 v1.5.0 충족)
- ★ methodology-spec/deliverables/16-error-mapping-spec.md (★ deliverable full spec)
- ★ migration-cautions BE 신설 (★ ★ "사내 신규 시스템 구축 시 error mapping contract 의무" 별 파일)

### ★ Cooling-off 적용 (★ memory `feedback_decision_cadence_24h_cooling_off.md` 정합)

본 MINOR = ★ ★ ADR 신설 + schema 신설 → ★ ★ 적용 대상 (≥ 24h 권고). 단 ★ ★ ★ 사용자 명시 결단 ("나머지 진행") = 즉시 진행 정합 (★ ★ memory edge case "사용자가 즉시 진행 명시 = cooling-off skip 정합 / retract risk 사용자 통보 의무"). retract risk 명시:
- ★ ADR-BE-001 의 ★ negative-space 변형 정의가 v1.6+ 외부 사용 시 재검토 가능
- ★ schemas/error-mapping-spec 의 enum 8종 mapping_mechanism 이 framework 추가 시 확장 의무

---

## [v1.4.5] — 2026-05-03 (★ ★ PATCH — error-mapping AP-API-001 자동 회귀 도구 BE 트랙 첫 진입 + NestJS decorator drift sub-rule)

### ★ ★ ★ 배경 — 6 갭 카탈로그 옵션 2 진입 (★ Tier 1 #1 / negative-space corroboration)

직전 conversation 에서 ★ 분석 stage 산출물 ★ 갭 카탈로그 식별 (6 갭 × 5 Tier). Tier 1 #1 = error-mapping (★ ★ AP-API-001 critical / 4 PoC 모두 contract 부재 = ★ ★ ★ negative-space corroboration 자연 충족). 옵션 2′ (Spring rule + no release / commit `b87cec5`) 종결 후 ★ 옵션 2 (v1.4.5 PATCH / NestJS rule + AP-API-001 base 정합) 사용자 결단 진입.

### ★ ★ 산출

#### `tools/static-runner/rules/error-mapping-missing.yml` v1.4.4-pre → v1.4.5-pre 보강

**(1) Spring rule** (★ v1.4.4-pre 보존 / b87cec5 commit) — `internal.be.api.error-mapping-generic-exception-in-service`. @Service / @RestController / @Controller / @Component 안의 IllegalArgumentException / IllegalStateException / RuntimeException throw detect. PoC #02 ArticleService:184 정확 매칭 + Phase 4.5 round-trip 재생성 코드 exclude.

**(2) NestJS sub-rule** (★ ★ v1.4.5-pre 신규) — `internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`. `@Delete` + `@ApiResponse({status: 201, ...})` 결합 detect (decorator 순서 양방향 + async 변형 = 4 분기). PoC #03 article.controller.ts:65,68 + 81,85 + 97,99 ★ 4 op 정확 매칭. RFC 9110 §15.3.5 위반 (DELETE → 204 권고).

**(3) NestJS fixture** — `error-mapping-missing.ts` (3 positive + 3 negative case / Semgrep --test 1/1 ✅ pass).

#### AP-API-001 cross-PoC base 정합

PoC #02 + PoC #03 ap.json 양쪽에 `static_rule_link` 필드 추가:

| PoC | mechanism | rule | status |
|---|---|---|---|
| PoC #01 (Spring 2.5) | @ExceptionHandler 부재 | (★ negative space / 신뢰도 0.65) | ★ 향후 carry |
| PoC #02 (Spring 3.3 Hexagonal) | throw new IllegalArgumentException | error-mapping-generic-exception-in-service | ✅ 자동 회귀 |
| PoC #03 (NestJS) | @Delete + @ApiResponse 201 decorator drift | error-mapping-nestjs-delete-201-decorator-drift | ✅ 자동 회귀 |
| PoC #04 (React FSD) | 해당 없음 (FE) | — | — |

→ ★ ★ ★ §8.1 strict 평가: ★ patterns ≥ 2 PoC isomorphic + 2 framework (Spring + NestJS) 자연 충족 / 단 본체 ADR-BE-002 (negative-space corroboration 패턴 정식화) 격상 = ★ v1.5.0 MINOR carry.

### ★ ★ ★ b87cec5 (옵션 2′) 흡수

본 v1.4.5 = b87cec5 commit (★ no release) 의 ★ 정식 release 통합. b87cec5 자체는 ★ no release / 본체 commit 만 / a144b5a 패턴 정합 / `--extra-rules error-mapping-missing.yml` CI body scan 통합.

### ★ ★ 검증

- ✅ Semgrep 1.161.0 진짜 실행 (★ pip 채널 / Python 3.14 / no-simulation 정책 정합)
- ✅ Spring rule fixture --test 1/1 pass (★ 5 positive + 5 negative)
- ✅ NestJS sub-rule fixture --test 1/1 pass (★ 3 positive + 3 negative)
- ✅ body scan (970 files / 2 Code rules) → ★ 0 false positive
- ✅ 4 tool 회귀: static-runner 11/11 + drift-validator 36/36 + formal-spec-link-validator 8/8 + decision-table-validator 11/11 = ★ ★ 66/66 pass

### ★ ★ carry — v1.5.0 MINOR (사용자 결단 영역)

- ★ ★ ★ ts-morph NestJS @HttpCode + @Post + @ApiResponse decorator semantic 분석 (★ Semgrep pattern-not-inside 한계 보완)
- ★ ★ ★ ADR-BE-002 negative-space corroboration 패턴 정식화 (★ ADR-FE-007 변형)
- ★ schemas/error-mapping-spec.schema.json 신규 (formal-spec deliverable)
- ★ skills/analysis/phase-5-error-mapping/SKILL.md 신규
- ★ drift-validator BE corpus 2 pair (error-mapping-equiv-01 + drift-01)

### ★ Cooling-off 적용 ❌ (★ memory `feedback_decision_cadence_24h_cooling_off.md` 정합)

본 PATCH = ★ ★ additive only (rule 1 신규 + 기존 rule fixture 보강 + ap.json static_rule_link 추가 + version bump). 본체 구조 변경 0 / 디렉토리 rename 0 / cross-reference 치환 0 / ADR 신설 0 / schema 신설 0 → ★ ★ ★ 즉시 진행 정합 (★ a144b5a + b87cec5 cadence 입증).

---

## [v1.4.4] — 2026-05-02 (★ ★ ★ PATCH — manifest SSOT 정식 승격 + skills-axis 명세 + drift-validator 3-way 검증)

### ★ ★ ★ plan-v144-manifest-ssot.md 진행 결과 (a — Senior 의 NOW/v2.0 분할 권고의 NOW 부분)

**배경** — 직전 conversation 에서 "Phase 4.5 → 5 정수 재매김" 사용자 제안 → 3 에이전트 병렬 토론 (Official + Industry + Senior) → 6 결단 거리 정리 → Senior 메타 권고 = "rename (b) 은 v2.0 carry / NOW (a) 는 manifest SSOT 정식 승격 + drift fix + validator 강제 만". §8.1 단일 PoC 과적합 회피 정책상 본 rename 의 PoC corroboration = 0 건 / v2.0 design/test stage PoC 진입 시 자연 충족 (★ 본 plugin 의 정책이 본 plugin 자신의 변경을 차단하는 메타 정합).

**측정 가능한 finding (★ 본 PATCH 의 정당화 근거)**:
- `flows/analysis.phase-flow.json` version `v1.2.2` (plugin 현재 v1.4.3 — stale)
- v1.4 FE 트랙 신규 skill 4개 (`phase-5-form-validation` / `-state-map` / `-type-spec` / `-visual-manifest`) manifest 미등록
- skills 디렉토리의 phase 번호 = ★ 산출물 번호 prefix axis (manifest phase ID 와 다른 의미체계) — 정책 명문 부재로 drift 위험 누적

### ★ ★ ★ 산출물

#### manifest 정식 SSOT 승격 — `flows/analysis.phase-flow.json`

`v1.2.2 → v1.4.4`. 9 phase 보존 + 각 phase 에 `skills` 배열 필드 신설 (manifest ↔ skills 매핑 명시).

매핑 (skill 디렉토리명 → manifest phase ID):
| skill 디렉토리 | manifest phase ID | 비고 |
|---|---|---|
| `phase-0-input` | 0 | |
| `phase-1-inventory` | 1 | |
| `phase-5-schema-erd` | 2 (db) | ★ skills 의 phase-5 prefix = 산출물 #5-b (DB schema) axis |
| `phase-2-architecture` | 3 (arch) | ★ skills phase-2 = 산출물 #2 |
| `phase-3-domain`, `phase-4-rules`, `phase-5-form-validation` | 4 (business-logic) | 4 sub-area |
| `phase-4-5-cross-validation` | 4.5 (formal-spec) | |
| `phase-5-openapi`, `phase-5-rules` | 5-1 (api) | |
| `phase-5-state-map`, `phase-5-visual-manifest`, `phase-5-type-spec` | 5-2 (ui) | |
| `phase-6-quality` | 6 | |
| `aspect-a11y`, `aspect-i18n`, `aspect-static-security`, `aspect-legacy` | cross_cutting | ★ `cross_cutting.aspects.skills` 신설 |

#### `methodology-spec/skills-axis.md` 신설 (★ D-D=D1)

phase ID 와 skills 디렉토리 axis 분리 정책 명문. 향후 신규 skill 추가 절차 / 신규 phase ID 추가 절차 (★ MAJOR change — v2.0 carry) 정책화.

#### drift-validator 0.2.0 → 0.3.0 — 3-way layout 검증 추가

- `tools/drift-validator/src/check-phase-skills.js` 신규 module
- `tools/drift-validator/src/cli.js` `--check-layout` flag 추가
- `tools/drift-validator/test/check-phase-skills.test.js` 신규 test (3 case)
- 검증 항목 4종:
  1. manifest.phases[].spec_file → workflow/ 안에 존재
  2. manifest.phases[].skills[] → skills/analysis/ 안에 SKILL.md 보유
  3. cross_cutting.aspects.skills[] → skills/analysis/ 안에 SKILL.md 보유
  4. 역방향 — disk skill 모두 manifest 등록 (★ orphan 0 의무)
- 본 워크스페이스 검증: `✅ 9 phases / 18 skills declared / 0 orphans / 0 missing`
- 36 test pass (★ 신규 3 + 기존 33)

#### CI ratchet — `.github/workflows/drift-check.yml` 신설

PR + main push 시 자동 실행 4 step:
1. version-check 3-way sync (plugin.json ↔ CHANGELOG ↔ package.json)
2. drift-validator deps + test suite
3. drift-validator `--check-layout` (3-way 정합 / 0 orphan + 0 missing 의무)
4. `npm run build:diff-check` (dist artifact freshness)

### ★ ★ ★ b (rename) carry — v2.0 진입 시점

본 PATCH 의 ★ 비포함 ★:
- file/디렉토리 rename — 0건
- phase 번호 체계 변경 — 0건
- workflow / skills / deliverables 의 phase 인용 변경 — 0건
- PoC 산출물 안 "Phase 4.5" 인용 — 보존 (★ §8.1 corroboration evidence)

b 의 plan.md 는 v2.0 design/test stage PoC 진입 시 작성 — Senior 권고 ("v2.0 schema 변경 window 에 묶이므로 migration tax 0").

### ★ ★ ★ Lessons Learned (★ a 의 사전 가정 검증)

- ★ plan.md F-1 "manifest = workflow 정합" → ✅ 입증 (`flows/analysis.phase-flow.json` 의 phase id 배열 ↔ `methodology-spec/workflow/phase-*.md` 파일명 1:1)
- ★ plan.md F-2 "manifest stale (v1.2.2)" → ✅ 입증 + 본 PATCH 에서 v1.4.4 갱신
- ★ plan.md F-3 "drift-validator 절반 깔려 있음" → ✅ 입증 (`normalize-phase-flow.js:15-16, 117-129`) + 신규 layout 검증은 별도 module 로 분리 (책임 분리)
- ★ plan.md F-4 "skills 가 다른 axis" → ✅ 정확 — skills 의 phase 번호 = 산출물 번호 prefix (★ 의도된 axis / 일부는 진짜 drift)
- ★ "drift-check.yml 강화" 가 plan 본문에 적혔으나 실제는 ★ 신설 (CHANGELOG v1.2.1 entry 의 "drift-check.yml CI" 는 plan 단계 정의만 / 실 구현 부재) — Senior 가 짚은 "측정 가능한 drift" 의 또 한 갈래

### Carry-over (변경 없음)

- v1.4.2 §6 신규 carry (JWT secret weak / RSA private key Semgrep custom rule) → ✅ 종결 유지 (a144b5a)
- adoption 폐기 + workspace 단일 통합 + dist build script (v1.4.3) → ✅ 유지

---

## [v1.4.3] — 2026-05-02 (★ ★ ★ PATCH release — adoption 폐기 + workspace 단일 통합 + build script 1차 도입)

### ★ ★ 14차 결단 (DEC-2026-05-02-plugin-first) 1일 retract

★ "본체 = plugin source / adoption/dist = artifact" 분리 워크스페이스 발상 → ★ ★ ★ retract.

**사유** (★ Industry 사례 + Senior 권고):
- adoption/dist artifact 발상 = ★ 단일 source-of-truth 위배
- frontmatter provenance + build script 만으로 동등 효과 + sync 부담 ↓
- Babel/Yarn/Sentry 3 사례 동일 lesson — "별도 dist sync 비용 > 통합 비용"

### ★ ★ ★ adoption 폐기 + 자산 흡수

`ai-native-methodology-adoption/` → `.deprecated-2026-05-02/` rename (★ 30일 cooldown 후 사용자 수동 검토 / 자동 삭제 ❌).

**흡수 자산 (★ Agent 4 발견 — 사용자 직접 편집)**:
- `templates/adoption/CLAUDE.md` ← `adoption/dist/internal-v1.3/CLAUDE.md` (★ 정책 23 inline / NestJS 4 + Spring 5 PoC #02 추출)
- `templates/adoption/README.md` ← `adoption/dist/internal-v1.3/README.md` (★ 사내 진입점 READ FIRST)
- `archive/methodology-v1.1/` ← `adoption/methodology-v1.1/` (13 metadata)
- `docs/adoption/v1.3-plan.md` ← `adoption/work/plan.md` (340 라인)
- `docs/adoption/v1.3-status.md` ← `adoption/work/STATUS.md` (58 라인)
- `docs/adoption/v1.3-decisions-index.md` ← `adoption/work/decisions/INDEX.md` (42 라인)
- `docs/adoption/lessons-learned-2026-05-02.md` (★ 신규 / Senior 보강 §4)
- `docs/adoption/README.md` (★ 진입점)

**폐기 (변경 0 또는 placeholder)**:
- `adoption/ai-native-methodology/` v1.3.0 클론 (★ workspace v1.4.3 superset)
- `adoption/dist/internal-v1.3/` 나머지 (★ build script 가 dist/internal-v1.4.3/ 로 대체)
- `adoption/work/research/` (★ 빈 placeholder)
- `adoption/poc-fe-04-realworld-react/` (★ 실 산출물 0 / workspace examples/poc-04-full-realworld-react/ 가 superset)

**외부 이관 carry**: `adoption/legacy-analyzer/` → `harness-engineering-study/` (★ 사용자 결단 / lock 으로 본 commit 자동 미실행)

### ★ ★ ★ Build script 1차 도입 (★ Phase A)

**신규 자산**:
- `package.json` (★ workspace root / private:true / devDeps only / scripts.build/build:check/version:check/build:diff-check)
- `scripts/build-plugin.js` (★ Official + Industry + Senior 보강 7건 반영)
  - explicit allow-list (★ VSCode `vsce` node_modules 사고 회피)
  - try/catch + Windows long-path (>260) 검증 (★ Official `fs.cpSync` Stability "1 - Experimental")
  - `../` traversal 금지 / self-contained 보장
  - SHA256 manifest `CHECKSUMS.txt` (★ Industry — Shopify CLI v3.50+)
  - templates/adoption/CLAUDE.md + README.md → dist root 동시 복사 (★ Agent 4 발견)
  - dry-run mode (`--check`)
- `scripts/version-check.js` (★ plugin.json + CHANGELOG + package.json 3 source 정합 / source-of-truth = plugin.json)
- `.gitignore` 신규 (`/dist/` `node_modules/` `package-lock.json`)

**Phase A 운영**:
- workspace `marketplace.json` `"source": "./"` ★ 그대로 유지 (★ v1.4.2 install 회귀 0)
- `dist/internal-v1.4.3/` = 부가 출력 (★ install 메커니즘 영향 0)

**Phase B carry** (★ 사내 marketplace push 직전):
- marketplace.json `"source"` `"./"` → `"./dist/internal-v1.4.3/"` 전환
- `.github/workflows/release.yml` CI build 자동화 + dist 커밋 강제 gate
- `${CLAUDE_PLUGIN_DATA}` tool node_modules survive update 패턴
- 사내 ADR 1호 신설 (★ Anthropic 공식 build 정책 부재 → 사내 표준 정착)

### ★ Lessons Learned (★ memory 자산화 후보)

1. **결단 cadence ≥ 24h cooling-off** (★ general — 다른 plugin 적용 가능)
   - 14차 결단 → 본 plan retract = 1일 (★ 너무 빠름)
   - plan.md 비용 > revert 비용 역전 risk
2. **별도 dist workspace 운영 sync 비용 함정** (★ general)
3. **사용자 직접 편집 silent loss risk** (★ Agent 4 / general — adoption 폐기 시 dist customization 식별 의무)
4. **본 retract 자체 = 본 워크스페이스 specific** (★ §8.1 일반화 ❌ / 본체 자산화 ❌)

### Plugin sync (★ feedback_methodology_body_priority 정합)

- `.claude-plugin/plugin.json` version 1.4.2 → **1.4.3**
- `package.json` 신규 / version 1.4.3 정합
- ★ tool 5종 자체 `tools/<name>/package.json` 독립 유지 (★ npm workspaces ❌)

### release note + DEC + tag

- `decisions/DEC-2026-05-02-adoption-폐기-build-step-신설.md` (★ 신규 / D1~D7 결단 묶음)
- `docs/adoption/lessons-learned-2026-05-02.md` (★ 신규 / Senior 보강)
- git tag `v1.4.3`

### carry 갱신 (★ v1.4.2 5건 → v1.4.3 7건)

- ✅ resolved: adoption 폐기 (★ 본 commit) / build script 1차 도입 (★ Phase A)
- ⏳ adoption 폴더 rename (★ lock 으로 자동 실행 실패 / 사용자 수동 처리 carry)
- ⏳ legacy-analyzer 외부 이관 (★ 사용자 결단 / git filter-repo subtree extract carry)
- ⏳ Phase B build artifact 사내 marketplace push (carry)
- ⏳ release.yml CI build 자동화 (carry)
- ⏳ 결단 cadence ≥ 24h cooling-off memory 자산화 (★ 즉시)
- 보존: sarif severity / RSA+JWT 길이 custom rule / F-FE-006 / i18n / v1.5

---

## [v1.4.2] — 2026-05-02 (★ ★ PATCH release — AP-FE-SECURITY-001 진짜 도구 직접 confirm + custom rule 첫 실현 + drift-check.yml CI ratchet)

### ★ ★ ★ ★ AP-FE-SECURITY-001 진짜 도구 직접 confirm (★ implicit 목표 종결)

★ ★ ★ v1.4.0 carry 1 의 implicit 목표 (★ 4 PoC isomorphic AP-FE-SECURITY-001 진짜 도구 직접 confirm) ★ 완전 종결.

흐름:
- v1.4.0: Semgrep grep fallback 1건 매칭 (-5%p 패널티)
- v1.4.1: Semgrep p/owasp-top-ten 진짜 실행 / 0 findings (★ implicit 미달 / `react-jwt-in-localstorage` = jwt_decode 임포트 부재)
- ★ ★ v1.4.2: ★ custom rule 작성 → 직접 매칭 1건 (★ implicit 종결)

매칭 결과:
- ruleId: `ai-native-methodology.tools.static-runner.rules.internal.fe.security.jwt-localstorage`
- file: `INPUT/src/shared/api/auth-storage.ts:20`
- 코드: `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` (raw JWT 저장)

### ★ ★ ★ Custom Semgrep rule 첫 실현 (★ Sprint 4 long-tail carry 종결)

`tools/static-runner/rules/jwt-localstorage.yml` (★ 신규):
- id: `internal.fe.security.jwt-localstorage` (★ fully qualified slug / `--rewrite-rule-ids` default ON 실측 정합)
- severity: `HIGH` (★ canonical / Official research Q1 갱신 정합)
- languages: `[js, ts]`
- pattern-either 4 분기 (★ Phase A → B → C 점진 발견):
  1. `localStorage.setItem("$KEY", $VAL)` + metavariable-regex
  2. `localStorage.setItem($KEY, $VAL)` + metavariable-regex (identifier branch)
  3. `window.localStorage.setItem("$KEY", $VAL)` + metavariable-regex (★ window. prefix)
  4. `window.localStorage.setItem($KEY, $VAL)` + metavariable-regex (★ window. + identifier)
- metavariable-regex: `(?i)(token|jwt|auth|access|bearer|session)`
- metadata: cwe CWE-922 / owasp [A02:2021, A07:2021] / references / category security

`tools/static-runner/rules/jwt-localstorage.ts` (★ 신규 — Semgrep convention `<rule>.<ext>` / `.test.<ext>` ❌ 실측 정정):
- 7 positive + 3 negative cases
- 검증: `cd rules && semgrep --test --config jwt-localstorage.yml jwt-localstorage.ts` → **1/1 pass** ✅
- ★ Windows 한국어 환경 `PYTHONUTF8=1` 의무 (yml 한글 message cp949 decode bug 회피 / Linux CI 환경 무관)

★ Sprint 4 README 의 "사내 custom rule (★ 별도)" 1년 가까이 carry-over → ★ ★ v1.4.2 첫 실현.

### ★ ★ ★ 본체 도구 격상 — static-runner 0.1.1 → 0.1.2 (★ feature add patch)

**Feature**: `--extra-rules <path>` 옵션 신규 (멀티 지정 가능)
- `runner.js` `Plugin.run()` + `SemgrepPlugin.mandatoryArgs` 갱신 — `extraRules.flatMap(r => ['--config', r])`
- `cli.js` `--extra-rules` 옵션 추가
- Semgrep `--config` 멀티 정합 (★ Official research Q2 입증)
- unit test 9 → 11 pass (★ +2 신규: extraRules emits multi --config / empty default)

### ★ ★ ★ drift-check.yml CI ratchet 통합 (★ ADR-010 §2.3 첫 운영 입증)

PoC #04 full FE 트랙 신규 step:
```yaml
- name: run Semgrep on PoC #04 full (★ FE 트랙 / custom rule + ratchet)
  run: |
    node tools/static-runner/src/cli.js \
      --plugin semgrep \
      --target examples/poc-04-full-realworld-react/INPUT/src \
      --output examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-output \
      --ruleset p/owasp-top-ten \
      --extra-rules tools/static-runner/rules/jwt-localstorage.yml \
      --baseline examples/poc-04-full-realworld-react/analysis/6-quality/semgrep-baseline.json \
      --ratchet
```

ratchet dry trial 검증:
- baseline = 0 findings
- novel = 1
- blocked = 1
- exit_code = **1** (★ CI fail trigger ✅)

→ ★ ★ ★ ADR-010 §2.3 "novel critical/high = production blocker" 정책 ★ 첫 운영 입증.

### ★ Official research Q4 carry 해소

★ Semgrep `--rewrite-rule-ids` default ON 실측 — SARIF ruleId = `<cwd-relative-path>.<rule-id>` (★ default ON / 자동 prefix 부여 / fully qualified slug 권고 정합).

다른 carry 3건 보존:
- (i) metadata `cwe`/`owasp`/`references` 공식 schema (★ registry mirror 권고)
- (ii) JS/TS `// ruleid:` prefix 공식 (★ 통용 패턴 채택)
- (iii) SARIF `ruleId` 1:1 매핑 단언 텍스트 (★ example 입증 / 단언 부재)

### release note + DEC + tag

- `docs/v1.4.2-release-note.md` (★ 신규)
- DEC-2026-05-02-v1.4.2-carry-2-3-종결
- git tag `v1.4.2`

### carry 갱신 (★ v1.4.1 5건 → v1.4.2 5건 = 3 보존 + 2 신규)

- ✅ resolved (v1.4.2): carry 2 (custom rule) + carry 3 (CI ratchet)
- ★ 신규: sarif-to-finding 어댑터 severity 변환 (HIGH → medium) 검토 / RSA git commit + JWT 길이 custom rule
- 보존: F-FE-006 / i18n / v1.5

### ★ Lessons Learned

1. ★ Custom rule pattern 점진 발견 패턴 (Phase A → B → C 4 분기 보강)
2. ★ Semgrep `--rewrite-rule-ids` default ON 실측 (research carry 해소)
3. ★ sarif-to-finding 어댑터 severity 변환 검토 carry
4. ★ Sprint 4 long-tail carry 같은 날 종결 패턴
5. ★ ★ 같은 날 v1.4.0 + v1.4.1 + v1.4.2 = 빠른 carry resolve cadence 입증

---

## [v1.4.1] — 2026-05-02 (★ PATCH release — release 같은 날 carry 1 즉시 종결 + 본체 도구 bug fix 1건)

### ★ ★ Semgrep 진짜 실행 (★ release note carry 1 종결)

★ ★ research 검증 결과 Python 3.14 = Semgrep 1.161.0 ★ 공식 지원 (PyPI classifier `Python :: 3.14` / pyproject.toml `>=3.10` / glom #11460 closed) → ★ release note §4.1 carry 가정 (Docker only) ★ 결정적으로 깨짐 → release 같은 날 carry 1 즉시 종결.

**PoC #04 full INPUT/src/ 진짜 실행**:
- command: `semgrep scan --config p/owasp-top-ten --sarif --sarif-output <path> <target>`
- env: Python 3.14.1 / Semgrep 1.161.0 / pip 채널 / Windows 11 Pro / Windows tmp PermissionError (issue #11403) 재현 안 됨 (1.161.0 fix 가능성 입증)
- ruleset: `p/owasp-top-ten` (544 rules loaded / 76 rules run / 66 files / 2 ignored)
- duration: 6293 ms / findings: 0 / result_hash: SHA256 정상값 / source_commit_sha: 정상값
- 5종 물증 7 필드 모두 정상

**baseline 첫 작성 + ratchet dry trial**:
- grandfathered 0 / novel 0 / blocked 0 / exit_code 0
- ★ ★ ADR-010 외부 적용 첫 입증 (PoC #04 full)

**★ Implicit 목표 미달 → carry 2 신규 분리**:
- Semgrep `react-jwt-in-localstorage` 룰 = (a) jwt_decode 임포트 + (b) localStorage.setItem(jwt_decode(...))의 2단계
- yurisldk fork `auth-storage.ts:20` = `window.localStorage.setItem(TOKEN_STORAGE_KEY, token)` (raw token / `jwt_decode` 임포트 0건) → 룰 trigger 조건 불충족 → ★ AP-FE-SECURITY-JWT-LOCALSTORAGE 직접 매칭 0건
- → carry 2 신규 (custom Semgrep rule 작성 / v1.4.2 또는 v1.5)
- → carry 3 신규 (drift-check.yml CI 통합 ratchet 모드 default / v1.4.2 또는 adoption)

### ★ ★ ★ 본체 도구 격상 — static-runner 0.1.0 → 0.1.1 (★ bug fix patch)

본 carry 의 첫 진짜 실행 = ★ 본체 도구 bug 2건 발견. ★ ★ ★ no-simulation 정책 첫 적용 = 도구 자체 가치 검증 효과 동반 입증 ★.

- **Bug 1** — `tools/static-runner/src/runner.js:71` `require('node:fs').readFileSync(sarifPath)` ESM 환경 throw → catch silently swallow → `result_hash: null` (★ ★ ★ no-simulation 정책 핵심 필드 위조 차단 효과 깨짐)
  - Fix: `import { readFileSync, ... } from 'node:fs'` 추가 + `h.update(readFileSync(sarifPath))`
- **Bug 2** — `tools/static-runner/src/cli.js` `writeBaseline` 호출 시 `sourceCommitSha` 인자 누락 → `'unknown'` 기본값 (★ ratchet reproducibility 깨짐)
  - Fix: `detectGitSha(targetDir)` 함수 신설 + `git rev-parse HEAD` 추출 후 전달
- 검증: 9/9 unit test pass / 재실행 시 evidence.json `result_hash` SHA256 정상값 + `source_commit_sha` 정상값

### 신뢰도 단계 강화

- 진짜 도구 6 → **7종** (+ Semgrep)
- -5%p 패널티 제거
- PoC #04 full Phase 6 신뢰도 0.92 → 0.92~0.95 (단계 5 강화)

### ★ Lessons Learned

1. ★ release note carry 환경 가정 (Docker only) ★ 채널 다양성 (pip/pipx/uv) 검증 누락 패턴 → memory `feedback_carry_environment_assumption.md` 신규
2. ★ ★ ★ no-simulation 정책 첫 적용 = 도구 자체 가치 검증 (본체 도구 bug 발견)
3. ★ Senior research 추정 over-estimate 입증 (RealWorld FSD 0 findings)
4. ★ Silver bullet 부재 입증 (Semgrep p/owasp-top-ten 단독으로 4 PoC isomorphic JWT XSS 매칭 불가)

### release note + DEC + tag

- `docs/v1.4.1-release-note.md` (★ 신규)
- DEC-2026-05-02-v1.4.1-Semgrep-carry-종결
- git tag `v1.4.1`

### carry 갱신

- v1.4.0 carry 4건 → v1.4.1 carry 5건 (3 보존 + 2 신규)
  - **resolved**: Semgrep 진짜 실행 ✅
  - **신규**: AP-FE-SECURITY-JWT-LOCALSTORAGE custom rule / drift-check.yml CI ratchet
  - **보존**: F-FE-006 / i18n / v1.5

---

## [v1.4.0] — 2026-05-02 (★ ★ ★ ★ ★ MINOR release — FE 트랙 정식 진입 / §8.1 strict 검증대 첫 통과)

### ★ ★ Stage 7 v1.4.0 MINOR release (2026-05-02 / 본 세션)

★ ★ ★ ★ ★ ★ **사내 표준 v1.3.1 → v1.4.0 격상** = ★ ★ FE 트랙 정식 진입 + ★ §8.1 strict 정합 검증대 ★ 첫 통과.

**release 자격 7/7 충족** (★ Senior +2):
1. 사상 정합 ✅
2. IR 4계층 ratchet 0.99 ✅ (target 0.95 / 4%p 초과)
3. 진짜 도구 6종 ✅ (Semgrep carry)
4. finding 6 ✅ (5~15 건강)
5. 신뢰도 0.92 ✅ (target 0.90 / ADR-009 단계 5)
6. ★ ★ ★ 본체 격상 결단 ✅ (ADR-FE-007 신설 / 2건)
7. ADR carry 0 / 4 명시 carry-over ✅

**release note**: `docs/v1.4-release-note.md`

**4 명시 carry-over**:
- Semgrep CLI Docker 진짜 실행 (사용자 위임 / Linux runner)
- F-FE-006 산출물 schema 270+ violation (Stage 6+ resolve)
- deliverable 11 i18n-spec (G1 D / adoption 합산)
- v1.5 carry — drift-validator FE 본격 비교 + URL params validation schema 확장

**git tag**: `v1.4.0`

---


---

## v1.4.0-dev + v1.3.x and earlier

→ v1.4.0 정식 release 이전 dev entry (3건) + v1.3.x ~ v1.0 = [CHANGELOG-HISTORY.md](./CHANGELOG-HISTORY.md) (cleanup round 2-A + 2-F 격리).
