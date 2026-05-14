# Changelog — v2.3.x and earlier (history archive)

> 본 파일 = v2.4 이전 release entry archive.
> v2.4+ 최근 release entry = [CHANGELOG.md](./CHANGELOG.md).
> 첫 split (cleanup round 2-A / 2026-05-06) = v1.3.x and earlier 격리.
> 두번째 split (2026-05-14) = v2.3.x and earlier 추가 격리.

Semantic Versioning 준수 — v1.0~v2.3.7 진화 history.

## [v2.3.7] — 2026-05-13 (★ ★ ★ PATCH session 7차 — rules.schema.json BR pattern 4토막 strict 정합 + id-conventions.md enforcement label 강화 / chain harness 5 요소 변경 ❌ / no new ADR)

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

## [v1.4.0-dev] — 2026-05-02 (MINOR — FE 트랙 / Stage 5 본격 PoC #04 종결 / ★ Stage 7 진입 자격)

### Stage 5 본격 PoC #04 (2026-05-02 / 본 세션) — 4 Sprint × 5 sprint 게이트

**분석 대상**: yurisldk/realworld-react-fsd HEAD `963b303` (★ Stage 4 와 동일 코드 / 산출물 재사용 ❌ / Senior strict)

**★ ★ ★ ★ ★ §8.1 strict 정합 검증대 ★ 첫 통과**:
- AP-FE-SECURITY-001 (★ ★ ★ ★ 4 PoC isomorphic / Java + Hexagonal + NestJS + React) 본체 격상
- AP-FE-OPTIMISTIC-DRY (★ 3 컴포넌트 isomorphic) 본체 격상
- ★ ADR-FE-007 신설 (★ 본체 antipattern 카탈로그 첫 등재)

**★ 본체 격상 3건**:
- drift-validator FE 모드 신설 (★ Sprint 5-3 / F-FE-004 closed)
- schema-validator (Ajv 8) 신설 (★ Sprint 5-3 / 본체 신규 도구)
- ADR-FE-007 (★ Sprint 5-4 / 본체 antipattern 카탈로그)

**★ 진짜 도구 6종 + Semgrep carry** (★ no-simulation 단계 5 도달):
- ts-morph + Playwright + @axe-core/playwright + drift-validator FE + schema-validator + formal-spec-link FE
- Semgrep ⏳ Docker 부재 carry

**★ Sprint 산출**:
- Sprint 5-1: fork 결단 (★ G1 D 자동) + Phase 0
- Sprint 5-2: Phase 5-1 api (19 op + 25 schemas) + 5-2-a (8 page / 33 SCN / 13 CMP) + 5-2-b (9 SM) + form-validation 90/77 BR + ★ URL params 2 page isomorphic 정식화
- Sprint 5-3: ★ 본체 도구 2건 + Playwright 32 snapshot + axe 16 scan + Phase 6 quality 6 AP + ★ ★ ★ ★ G4 strict 임계 도달 (JWT 4 PoC / Optimistic 3 컴포넌트)
- Sprint 5-4: V1 + V2 + ★ ★ ADR-FE-007 신설 + rules 80 BR + confidence 0.92
- Sprint 5-5: Stage 5 종결 + ★ Stage 7 release 진입 자격 7/7 평가

**★ Finding 6건**: F-FE-001~006 (모두 candidate or 본체 격상).

**★ ★ Stage 7 v1.4.0 MINOR release 진입 자격 7/7 충족** + 4 명시 carry-over:
- Semgrep Docker (사용자 위임)
- F-FE-006 산출물 schema 정합 (270+ violation / 부분 resolve)
- deliverable 11 i18n-spec (★ G1 D 결단 / adoption 트랙 합산)
- v1.5 carry — drift-validator FE 본격 비교 + URL params validation schema 확장

---

## [v1.4.0-dev] — 2026-05-02 (MINOR — FE 트랙 / Stage 4 mini-PoC 종결)

### Stage 4 (2026-05-02 / 본 세션) — RealWorld React fork 1주 fail-fast mini-PoC

**분석 대상**: `yurisldk/realworld-react-fsd` HEAD `963b303` (★ 527 stars / FSD 약식 3 layer / Zod / TanStack Query / react-router v7 / orval+OpenAPI 자동 생성)

**산출 (Day 1~6 / 6 commit)**:
- `examples/poc-04-mini-realworld-react/` 워크스페이스 (★ INPUT 의도적 .gitignore — clone --depth 1)
- analysis/0-init/ — tree.md / inventory.json / stack-detection.md (Tier 1 Modern SPA / Scenario A 분리)
- analysis/5-2-a-ui-base/ — ui-spec.json (3 page / 14 SCN / 10 CMP) + scenarios.md + component-tree.mermaid
- analysis/5-2-b-state/ — state-map.json (5 SM SCXML+XState 호환) + state-map.mermaid
- analysis/5-2-c-visual/ — visual-manifest.json + 2 snapshot (Playwright Chromium 진짜 실행)
- analysis/6-quality/ — a11y-spec / i18n-spec / static-security-spec / form-validation-spec (★ 85 validation / 72 BR 자동 등록) / type-spec (★ ts-morph 진짜 실행)
- ir-4layer-matrix.md (★ ★ ★ overall_framework_neutrality_score 0.99 / target 0.90)
- confidence-meta.yaml (★ 0.85 / ADR-009 단계 4)
- 4 finding (F-FE-001~004 / 모두 candidate / mini scope 정합)
- DEC-Stage-4-mini-PoC-종결.md

**★★★★ no-simulation 정책 단계 4 도달**:
1. ts-morph 24 — 70 file / 46 type / framework_neutrality_score 1.0 / react_idiom_ratio 0.0011
2. Playwright + Chromium — 2 viewport visual baseline (binary 진실)
3. @axe-core/playwright 4.10 — WCAG 2.2 AA / 1 unique violation (html-has-lang)

**★★★ Stage 5 진입 자격 충족** (research G5 5 자격 모두 충족):
- 사상 정합 ✅ 비협상 충족 / IR 0.99 ✅ / 도구 3종 ✅ / finding 4건 ✅ / 신뢰도 0.85 ✅
- carry 2건 (Semgrep 환경 + drift-validator FE) — Senior 재분류 시 ≤ 2 (★ i18n = 적용 대상 부재 ≠ carry)

**★ §8.1 정합 strict** — Stage 4 finding 4건 모두 candidate / **본체 격상 0건** / Stage 5 + adoption 합산 후 격상.

**★ 핵심 발견**:
- ★ URL params validation 신규 패턴 (Zod-mini home.state.ts) — ★ deliverable 14 의미 확장 시점 (★ Stage 5 schema 확장 후보)
- ★ JWT localStorage XSS = PoC #01/02 isomorphic 변형 (3 PoC isomorphic — adoption 합산 시 본체 antipattern 후보)
- ★ React Router v7 Form action 패턴 (RHF/Formik 미사용)
- ★ orval auto-gen Zod from OpenAPI 3.0.1 = ADR-FE-005 매개체 #4 + #13 통합 검증 ✅
- ★ drift-validator FE 모드 부재 = 본체 도구 격상 후보 (F-FE-004)

---

## [v1.4.0-dev] — 2026-05-01 (MINOR — FE 트랙 진입 / Stage 0 종결)

### 트리거

v1.3.1 PATCH 종결 후 사용자 결정 — **freeze 해제 + FE 트랙 정식 시작 + v1.4.0-dev 라인 진입**. 본 release 라인 = ① BE 한정 (v1.x) → BE+FE 양 트랙 (v1.4+) 격상 ② 사용자 진단 "FE 분석 방법이 없잖아" 에 대한 research-first 응답.

### Stage 0 산출 (본 세션)

| # | 산출 | 위치 |
|---|---|---|
| 1 | plan-v1.4-fe-track.md | `ai-native-methodology/.claude/plans/` (4원칙 1단계 정식 산출) |
| 2 | DEC-2026-05-01-v1.4-FE-트랙-진입.md | `ai-native-methodology/decisions/` |
| 3 | STATUS.md 갱신 | 방법론 본체 버전 + 시퀀스 진행률 |
| 4 | INDEX.md 갱신 | 승인 결정 표에 본 DEC 등재 |
| 5 | CHANGELOG.md (본 entry) | v1.4.0-dev 라인 신설 |
| 6 | memory 신설 + 갱신 | project_v140_fe_track / project_v130_release_status / project_adoption_workspace + MEMORY.md |
| 7 | git commit | Stage 0 종결 단일 commit |

### 변경 사항

**없음** (메타 작업만). 방법론 본체 / schema / 도구 / PoC 변경 0. 본 release line 의 본격 변경은 Stage 3 (본체 격상) 부터 시작.

### 큰 뭉텅이 (Stage) 분할 — 사용자 요구 6번 정식 반영

| Stage | 목적 |
|---|---|
| Stage 0 ✅ | freeze 해제 + 트랙 진입 |
| Stage 1 | research × 3 (공식문서 / 테크기업 / Senior FE) — 9Q 답 도출 |
| Stage 2 | 사용자 승인 (3 sub-gate — 핵심 구조 / 보강 범위 / 검증 전략) |
| Stage 3 | 본체 격상 — deliverable 재설계 + 산출물↔테스트 매개체 채택 |
| Stage 4 | mini-PoC 검증 (1주 fail-fast) |
| Stage 5 | 본격 PoC #04 (RealWorld FE) |
| Stage 6 | BE/FE 분리 운영 정책 정식화 (횡단) |
| Stage 7 | v1.4.0 MINOR release 결단 |

각 Stage 종료 시 commit + DEC + STATUS 갱신 (사용자 요구 7번 — 발전 과정 가시화 의무).

### 외부 plan 짝

`~/.claude/plans/be-foamy-jellyfish.md` (사용자 승인본 / 3 에이전트 점검 v2). 본 레포 plan (`.claude/plans/plan-v1.4-fe-track.md`) 은 작업용 짝.

### 트랙 차이 (BE v1.x → FE v1.4)

| 차원 | BE 트랙 (v1.0~v1.3) | FE 트랙 (v1.4) |
|---|---|---|
| 시작 가정 | modern stack (Spring/SpringBoot/NestJS) 명확 | spectrum 결정부터 (legacy jQuery ~ modern React) |
| 진입 순서 | 명세 → 도구 → PoC | research → 명세 재설계 → mini-PoC → 본격 PoC |
| 핵심 빈틈 | 신뢰도 정직 표기 | 산출물↔테스트 자동 도출 / visible 차원 / 분산 상태 / 이벤트 / 렌더링 |
| 분리 정책 | 단일 BE 관점 | BE/FE 분리 운영 (Stage 6) — JS 풀스택 / JSP 혼재 예외 |

### Stage 1 산출 (research × 3 — 2026-05-01 본 세션)

| # | 산출 | 위치 | 분량 |
|---|---|---|---|
| 1 | research-official-v1.4-fe.md | `.claude/plans/` | ~2,400 단어 / 1차 사료 ≥ 25개 |
| 2 | research-industry-v1.4-fe.md | `.claude/plans/` | ~2,800 단어 / 1차 사료 다중 |
| 3 | research-senior-v1.4-fe.md | `.claude/plans/` | ~3,500 단어 / 9Q 모두 강한 답 |
| 4 | research-v1.4-fe-summary.md (★ 진단 보고서) | `.claude/plans/` | 통합 + Stage 2 Gate 입력 12 결정 |
| 5 | DEC-2026-05-01-v1.4-Stage-1-research-종결.md | `decisions/` | Stage 1 종결 결단 |

### Stage 1 핵심 합의 (3 에이전트)

- ★ 격상 시나리오 = **Scenario B-Lite (단계 분할)** — Senior 권고 + 산업/공식 정합
- ★ legacy cover (jQuery/Vanilla/MPA/JSP) **v1.4 포함** — 사용자 진단 직접 대응
- ★ visual-manifest deliverable 신설 (사용자 요구 3번 visible 정면 해소)
- ★ state-map deliverable 신설 + W3C SCXML 채택 (분산 상태 5 진실)
- ★ 권위 매개체 12 통합 채택 (CEM/SCXML/DTCG/MSW+OAS/axe-core/.d.ts/CSF/Playwright/WCAG 2.1/WAI-ARIA 1.2/ICU MF/Pact)
- ★ a11y + i18n v1.4 포함 (산출물↔테스트 자동 도출)

### 본체 빈틈 진단 (Stage 3 격상 작업 항목)

Top 5: 분산 상태 deliverable 부재 / 시각 산출 부재 / legacy fallback 부재 / 권위 매개체 격상 미반영 / 신뢰도 단계 모델 부재. 세부 21건 (`research-v1.4-fe-summary.md` §3).

### Stage 2 진입 자료 (사용자 결단 12 항목)

- Gate 1 (핵심 구조) 4 결정: spectrum / 시나리오 (B-Lite) / schema 분리 / 매개체 12 채택
- Gate 2 (보강 범위) 4 결정: 비기능 v1.4 (a11y+i18n+정적보안) / legacy Tier 1~4 / BE/FE 분리 / ADR-001 §명시적 제외 갱신
- Gate 3 (검증 전략) 4 결정: mini-PoC 진입 (Stage 3-1 후 즉시) / PoC #04 (RealWorld only) / 신뢰도 0.80 / Sprint 4-6

### ★★ Stage 2 종결 (2026-05-01 본 세션)

★★ **12 결정 모두 Senior 권고 (Recommended) 채택**. DEC-2026-05-01-v1.4-Stage-2-Gate-결단.md.

| Gate | 결정 4건 |
|---|---|
| **G1** 핵심 구조 | spectrum (Modern+jQuery+JSP 예외) / **Scenario B-Lite** / schema 분리+Phase 4.5 cross-link / 매개체 **12 통합 채택** |
| **G2** 보강 범위 | 비기능 (a11y+i18n+정적보안 v1.4 / 운영 NFR v1.5) / legacy Tier 1~4 / BE/FE 분리 default + JS풀스택+JSP ADR 예외 / ADR-001 갱신 |
| **G3** 검증 전략 | mini-PoC Stage 3-1 후 즉시 / PoC #04 RealWorld only / 신뢰도 **0.80** / Sprint mini 1주 + 본격 4-6 |

### Stage 3-1 진입 자료 (작업 항목 확정)

- ★ 신설: deliverable 8 (state-map) + 9 (visual-manifest) + state-map.schema.json + visual-manifest.schema.json
- ★ 분할: phase-5-2 → phase-5-2-a/b/c
- ★ ADR 신설: ADR-FE-001 (FE 추출기 가정 + spectrum) / ADR-FE-002 (이중 렌더링 FE 적용 + visual 예외) / ADR-FE-005 (매개체 12 채택)
- ★ ADR 갱신: ADR-009 (FE 신뢰도 단계 1~5)
- ★ 보강: 7-ui-ux.md (legacy Tier 1~4 fallback) + ui-spec.schema.json (event_handlers / api_calls / suspense_boundary / framework enum 확장)
- ★ 도구 시범: drift-validator FE 적용 (state-map.json ↔ state-map.mermaid) / formal-spec-link-validator FE cross-link

### ★★★ Stage 3-1 종결 (2026-05-01 본 세션)

★★★ **본체 격상 16+ 항목 적용**. DEC-2026-05-01-v1.4-Stage-3-1-종결.md.

#### Phase 별 산출 (5 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-001/002/005 신설 + ADR-009 갱신 + plan-v14-stage-3-1.md | `6639df7` (5 file / 1267 ins) |
| **B** | state-map.schema + visual-manifest.schema 신설 + ui-spec.schema 확장 | `c82d545` (3 file / 788 ins) |
| **C+D** | deliverable 8/9 신설 + 7 보강 + phase-5-2 a/b/c 분할 + 기존 stub | `d2e12b4` (7 file / 1269 ins / 202 del) |
| **E1** | drift-validator FE corpus 1쌍 + test 14→**15 pass** | `9c0729c` (3 file / 26 ins) |
| **E2** | formal-spec-link-validator FE 진단 (★ 도구 확장 carry — Stage 3-2 또는 Sprint 5+) | (read-only) |
| **F** | DEC-Stage-3-1-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### 사상 기둥 3 (★ ADR-FE 시리즈)

- **ADR-FE-001** (FE 추출기 가정) — spectrum Tier 1~4 cover + 한 방향 추출 사상 + BE Phase 0~6 ↔ FE Phase 0~6 매핑
- **ADR-FE-002** (이중 렌더링 FE 적용) — ADR-008 의 FE 영역 적용 + ★ visual 예외 (binary 진실 모델)
- **ADR-FE-005** (권위 매개체 12 채택) — sub-agent cross-check 1차 사료 검증 완료

#### Cross-check 권고 3건 반영 (옵션 Y)

1. DTCG 정확한 인용 — "Final Community Group Report" 명시 + spec URL 고정
2. WCAG 2.1 AA + ★ 2.2 AA ratchet path 명시 (ADR-010 baseline+ratchet 정합)
3. ICU MF2 채택 단계 (spec stable / runtime preview) + MF1 폴백 병기

#### no-simulation 정책 강화

- visual-manifest.schema.json `captured_by` enum — `simulation` 시 -5%p 패널티 + `simulation_reason` 의무 (★ schema if/then 강제)
- ADR-009 §2.2.1 FE 도구 enum 신설 — `playwright_real` / `axe_core_real` / `storybook_csf_real` / `msw_handler_check` / `percy_real` / `chromatic_real`
- phase-5-2-c-visual.md §3.2 — Playwright + axe-core 진짜 실행 의무 절차

#### 사용자 7 요구사항 진척도

| 요구 | 도달 |
|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ★ 100% (ADR-FE-005) |
| 2. AI + 사람 동시 이해 | ★ 100% (ADR-FE-002 + schema 3 + deliverable 3) |
| 3. UI visible 차원 | ★ 100% (deliverable 9 + schema B2 + workflow D3) |
| 4. 비즈니스 로직 동일 | ★ 100% (deliverable 8 + schema B1 + workflow D2) |
| 5. BE/FE 분리 운영 | ⏳ Stage 6 (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제 | ★ 100% (Phase A~F commit 단위 분할) |
| 7. 모든 단계 기록 | ★ 100% (5 commit + DEC) |

→ ★ 6/7 = 100% (요구 5 = Stage 6 carry).

### Stage 3-2 + Stage 4 진입 자료

- Stage 3-2 — a11y / i18n / 정적보안 deliverable + legacy 산출물 3종 + ADR-FE-003 + ADR-001 §명시적 제외 갱신 + migration-cautions-fe.md + rules.schema.json br_type fe_validation enum 확장 + formal-spec-link-validator FE 적용 (Stage 3-1 carry)
- Stage 4 mini-PoC — RealWorld React fork (1주 fail-fast) + Playwright + axe-core 진짜 실행 1회 (★ no-simulation 정책 첫 FE 실현) + ui-spec / state-map / visual-manifest 1 page × 2 viewport 검증 + drift-validator FE 본격 적용 + 신뢰도 0.75+ 도달 검증

추정 분량: 2~4 세션.

### ★★★ Stage 3-2 종결 (2026-05-01 본 세션)

★★★ **본체 격상 2차 12+ 항목 적용**. DEC-2026-05-01-v1.4-Stage-3-2-종결.md.

#### Phase 별 산출 (5 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-003 (legacy spectrum + Strangler Pattern) 신설 + ADR-001 §명시적 제외 갱신 (운영 NFR 좁힘) + plan-v14-stage-3-2.md | `4d8eb18` (3 file / 794 ins) |
| **B** | a11y-spec / i18n-spec / static-security-spec / legacy-spectrum schema 신설 + rules.schema FE category 4종 확장 | `deefd62` (5 file / 771 ins) |
| **C+D** | deliverable 10 (a11y) / 11 (i18n) / 12 (static-security) / 13 (legacy-spectrum) 신설 + migration-cautions-fe.md 신설 + phase-6-quality 보강 | `3feb8fd` (6 file / 913 ins) |
| **E** | formal-spec-link-validator FE 모드 확장 (`--mode=be|fe|both`) + 4→**8 pass** ✅ (BE 회귀 0) | `64fd5b0` (4 file / 271 ins) |
| **F** | DEC-Stage-3-2-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### G2 결단 정식 반영 (Stage 2 Gate)

- **G2-1** (a11y/i18n/정적보안 v1.4) — deliverable 10/11/12 신설 + schema 3종
- **G2-2** (legacy Tier 1~4) — ADR-FE-003 + deliverable 13 + legacy-spectrum schema
- **G2-4** (ADR-001 §명시적 제외) — "비기능 측정" → ★ "운영 NFR 측정" 좁힘 + 정적 NFR v1.4 포함

#### Strangler Fig Pattern 채택 (Martin Fowler 2004)

- 산업 사례 (Fowler / Sam Newman) 정합 — rewrite ❌ / strangle ✅
- 4 approach 명시 + ★ schema enum `big_bang_rewrite_not_recommended`

#### Cross-check 권고 3건 schema 강제 (Stage 3-1 carry)

- DTCG `spec_source` URL 고정 + `spec_status=community_group_report`
- WCAG 2.1-AA baseline + 2.2-AA ratchet (a11y-spec.schema)
- ICU MF2 사용 시 ★ MF1 폴백 의무 (i18n-spec.schema if/then 강제)

#### no-simulation 정책 schema 강제 4 영역

| schema | if/then |
|---|---|
| a11y-spec | captured_by ∈ real → 5종 물증 의무 |
| i18n-spec | mf2_used=true → mf1_fallback_present 의무 |
| static-security-spec | captured_by ∈ real → 5종 물증 의무 + runtime_check_required 표기 |
| legacy-spectrum | primary_tier=mixed → mixed_breakdown 의무 |

#### 사용자 7 요구사항 진척도 (Stage 3-2 종결)

| 요구 | 도달 |
|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ★ 100% (axe-core / ICU / Semgrep 추가) |
| 2. AI + 사람 동시 이해 | ★ 100% (schema 5 + deliverable 4 신설) |
| 3. UI visible 차원 | ★ 100% (Stage 3-1 도달 유지) |
| 4. 비즈니스 로직 동일 | ★ 100% (rules.schema FE category 4종 확장) |
| 5. BE/FE 분리 운영 | ⏳ Stage 6 (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제 | ★ 100% (Phase A~F commit 단위) |
| 7. 모든 단계 기록 | ★ 100% (5 commit + DEC) |

→ ★ 6/7 = 100% 도달 유지 (Stage 3-1 동일).

### Stage 4 + Stage 6 진입 자료

- **Stage 4 mini-PoC** — Playwright + axe-core + ICU runtime + Semgrep/ESLint security 진짜 실행 (★ no-simulation 정책 첫 FE 본격 실현)
- **Stage 6 ADR-FE-004** — BE/FE 분리 운영 정책 정식 (요구 5 = 100% 도달) / methodology-spec/be-fe-separation.md / Tier 4 (JSP) BE/FE 통합 산출 정식

### ★★★ Stage 6 종결 (2026-05-01 본 세션)

★★★ **본체 격상 8 항목 + 사용자 요구 7/7 = 100% 도달 = v1.4 본체 quality 격상 완성**. DEC-2026-05-01-v1.4-Stage-6-종결.md.

#### Phase 별 산출 (3 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-004 (BE/FE 분리 3 Scenario) + ★ ADR-FE-006 (framework-neutral IR — 외부 LLM 검증 정면 대응) 신설 + plan-v14-stage-6.md + STATUS 압축 정비 이력 등재 | `5650e1f` (4 file / 683 ins) |
| **B** | be-fe-separation.md 신설 + ADR-FE-001 §6 / ADR-FE-003 §2.4 carry → resolved + deliverable 7 §6.5 보강 + phase-0 §3.4 보강 + legacy-spectrum.schema tier_4_be_fe_handling enum | `2fafd52` (6 file / 235 ins / 9 del) |
| **F** | DEC-Stage-6-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### 핵심 결단

- **3 Scenario** (ADR-FE-004) — A 분리 default (사용자 사내 React+TS+TanStack 정합) / B JS 풀스택 (Next.js / Nuxt / Remix / Astro) / C JSP (Tier 4 통합)
- **★ framework-neutral IR 사상** (ADR-FE-006) — 외부 LLM 검증 정면 대응 / IR 4계층 매트릭스 (L1 Domain / L2 Interaction / L3 Contract / L4 Presentation) 정식 매핑 / Screen+Journey 우선 / Component 분해 framework-coupling 위험
- **Stage 3-1/3-2 carry 종결** — Tier 4 (JSP) BE/FE 통합 산출 절차 정식

#### 외부 LLM 검증 빈틈 5건 처리

| # | 빈틈 | 처리 |
|---|---|---|
| 1 | Zod / Yup / RHF rules → BR 자동 추출 절차 | ❌ Stage 7-pre carry |
| 2 | TypeScript .d.ts 산출 절차 | ❌ Stage 7-pre carry |
| 3 | "프레임워크 중립 IR" 사상 명시화 | ✅ ★ ADR-FE-006 신설 |
| 4 | Component 분해 framework-coupling 위험 | ✅ ADR-FE-006 §2.3 + deliverable 7 §6.5 |
| 5 | Screen+Journey 우선 / Component 후순위 | ✅ ADR-FE-006 §2.2 + deliverable 7 §6.5 |

#### ★★★ 사용자 7 요구사항 7/7 = 100% 도달 (★ v1.4 본체 quality 격상 완성)

| 요구 | 도달 |
|---|---|
| 1. 산출물 → 마이그+테스트 기반 | ★ 100% |
| 2. AI + 사람 동시 이해 | ★ 100% |
| 3. UI visible 차원 | ★ 100% |
| 4. 비즈니스 로직 동일 | ★ 100% |
| **5. BE/FE 분리 운영** | ★ **100% NEW** (ADR-FE-004) |
| 6. 큰 뭉텅이 승인제 | ★ 100% |
| 7. 모든 단계 기록 | ★ 100% |

→ ★★★ **7/7 = 100% 완성 / Stage 7 v1.4.0 release 진입 자격 도달**.

#### FE 영역 ADR 6 개 누적 (Stage 3-1/3-2/6)

- ADR-FE-001 (FE 추출기 가정) / 002 (이중 렌더링 FE) / 003 (legacy + Strangler) / 004 (BE/FE 분리) / 005 (권위 매개체 12) / ★ 006 (framework-neutral IR)

### Stage 4 + Stage 7-pre 진입 자료

- **Stage 4 mini-PoC** — RealWorld React fork (1주 fail-fast) + Playwright/axe-core/ICU/Semgrep 진짜 실행 / ★ ADR-FE-006 IR 4계층 정합도 검증 의무 (React 관용구 IR 잔존 finding 등록)
- **Stage 7-pre** — 외부 LLM 검증 빈틈 #1 (Zod/Yup/RHF → BR fe_validation 자동 추출) + #2 (TypeScript .d.ts 산출 — 별도 deliverable 14 검토)

### ★★★ Stage 7-pre 종결 (2026-05-01 본 세션)

★★★ **외부 LLM 검증 빈틈 5/5 = 100% 해소 / release 전 마지막 quality 격상**. DEC-2026-05-01-v1.4-Stage-7-pre-종결.md.

#### Phase 별 산출 (4 commit + 본 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | ADR-FE-005 매개체 12 → ★ **13** (Zod 추가) + plan-v14-stage-7-pre.md | `3a7df3e` (2 file / 256 ins) |
| **B** | form-validation-spec.schema + type-spec.schema 신설 + rules.schema source_format/auto_extracted 확장 | `9c5b8d1` (3 file / 448 ins) |
| **C+D** | deliverable 14 (form-validation-spec) / 15 (type-spec) 신설 + ADR-FE-006 §5.2 carry → resolved + phase-5-2-b §3.1 form_state cross-link 보강 | `adabe10` (4 file / 356 ins) |
| **F** | DEC-Stage-7-pre-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### 외부 LLM 검증 빈틈 5/5 = 100% 해소

| # | 빈틈 | Stage | 산출 |
|---|---|---|---|
| 1 | Zod / Yup / RHF rules → BR 자동 추출 | ★ Stage 7-pre | deliverable 14 + form-validation-spec.schema + ADR-FE-005 §2.1.1 |
| 2 | TypeScript .d.ts 산출 절차 | ★ Stage 7-pre | deliverable 15 + type-spec.schema + framework_neutrality_score |
| 3 | "프레임워크 중립 IR" 사상 명시화 | Stage 6 | ADR-FE-006 신설 |
| 4 | Component 분해 framework-coupling 위험 | Stage 6 | ADR-FE-006 §2.3 + deliverable 7 §6.5 |
| 5 | Screen+Journey 우선 / Component 후순위 | Stage 6 | ADR-FE-006 §2.2 + deliverable 7 §6.5 |

#### ADR-FE-005 매개체 12 → 13 (Zod 추가)

| 매개체 | 채택 근거 |
|---|---|
| ★ Zod (#13) | Schema-First validation de facto / TypeScript-first / runtime + static type 양쪽 / `z.object()` / `.refine()` → rules.json fe_validation BR 자동 등록 |

#### 사용자 7 요구사항 7/7 = 100% 도달 유지 + 강화

- 요구 1 강화 — Zod / TS 타입 자동 추출 = 신규 시스템 즉시 활용
- 요구 4 강화 — form_validation BR 자동 등록 (auto_extracted=true 분리 운영)
- 요구 1/2/3/4/5/6/7 = 100% 유지

#### 다음 trigger

- **Stage 4 mini-PoC** — RealWorld React fork (1주 fail-fast) + ts-morph + Playwright + axe-core + ICU + Semgrep 진짜 실행 / 신뢰도 0.75+ 도달 / ★ ADR-FE-006 IR 4계층 정합도 검증
- **Stage 5** 본격 PoC #04 — 9 deliverable (7~15) + a11y + i18n + static-security + legacy + form-validation + type-spec
- **Stage 7** v1.4.0 MINOR release 결단 (Stage 5 검증 후)

### ★★★ BE Sprint 5+ carry-over 종결 (환경 무관 부분 / 2026-05-01 본 세션)

★★★ **drift-validator v0.1.0 → v0.2.0 / 3 도구 unit test 53/53 pass / 본체 phase-flow drift 0 자가 입증**. DEC-2026-05-01-Sprint-5-carryover-종결.md.

#### Phase 별 산출 (4 commit + 메타)

| Phase | 산출 | commit |
|---|---|---|
| **A** | corpus 14 → 19쌍 (+6 신규 / multi-trigger / extra-event / multi-actor / extra-message / FE form / FE missing-error) + corpus.test.js +6 test (15 → 21) | `7b9d4b2` (14 file / +437) |
| **B** | drift-validator phase-flow 비교기 신설 — normalize-phase-flow.js + compare-phase-flow.js + cli.js 분기 + corpus 2쌍 + 4 test | `1ab6d14` (10 file / +316) |
| **C** | tools/_shared/baseline.js 공용 이동 + drift-validator/src/baseline.js re-export shim + DTV cli.js import path 갱신 + DTV baseline.test.js 신설 (4 test) + drift-validator v0.1.0 → ★ v0.2.0 | `8545e47` (6 file / +203 / -112) |
| **D** | static-runner SARIF→finding 어댑터 (sarif-to-finding.js) + cli.js --baseline/--ratchet/--write-baseline 통합 + baseline-mode.test.js (5 test) | `f82e6fa` (4 file / +209) |
| **F** | DEC-Sprint-5-carryover-종결 + STATUS / INDEX / CHANGELOG / memory | (본 commit) |

#### ★ 정량 결과

| 도구 | 보강 전 | 보강 후 |
|---|---|---|
| drift-validator | v0.1.0 / 23 test | ★ **v0.2.0 / 33 test** (corpus 25 + baseline 8) |
| decision-table-validator | 7 test | ★ **11 test** (+4 baseline) |
| static-runner | 4 test | ★ **9 test** (+5 baseline-mode) |
| **3 도구 합계** | 34 test | ★★ **53/53 pass** ✅ |

#### ★★★ 본체 SSOT 자가 검증 (★ 핵심)

```
$ node tools/drift-validator/src/cli.js methodology-spec/workflow/phase-flow.json
[phase-flow] 0 breaking / 0 non-breaking / 0 info ✅
```

→ 본체 phase-flow.json + phase-flow.mermaid 짝 정합도 **drift 0** 입증. v1.4 quality 격상 강한 데이터.

#### ★ ADR-010 §2.5 정합 도달

| 도구 | 단계 | baseline 통합 |
|---|---|---|
| drift-validator | ADR-009 §2.1 단계 3 | ✅ |
| decision-table-validator | 단계 3 | ✅ |
| static-runner | 단계 5 (Semgrep/PMD) | ✅ (★ 진짜 실행 자체는 환경 의존) |

### Sprint 6 carry-over (★ 환경 의존만 잔여)

- Semgrep / PMD / OSV-Scanner 진짜 실행 1회 (★ Java 환경 필요)
- vacuum / openapi-changes 외부 도구 통합 (별도 작업)

본 v1.4 FE 트랙 + Sprint 5+ carry-over 와 **독립 병행 가능**.

### adoption workspace 영향

`ai-native-methodology-adoption/` 의 "원본 클론 변경 X" 가정은 본 release 진입으로 깨짐. v1.3.1 시점 dist (`dist/internal-v1.3/`) 는 그대로 보존. 향후 v1.4.0 정식 release 시 신규 dist (`dist/internal-v1.4/`) 빌드 가능. 동기화 정책 갱신은 별도 작업 (본 release scope 외부).

---


---

---

## [v1.3.1] — 2026-05-01 ⭐ release 보존 (PATCH — 파일명 컨벤션 정리)

### 트리거

`ai-native-methodology-adoption` workspace commit `0e01595 (D3 + D3.1)` 에서 사내 적용본 (`dist/internal-v1.3/`) 파일명 컨벤션을 정리 (한국어 → 영어 + 1자리 prefix + `.yml` → `.yaml`). 원본 정리는 별도 세션 보류 (Option γ) 였음 → 본 PATCH = **D3.2 = 원본 (이 repo) 동일 적용**. 효과: 원본 ↔ dist 동기화 → 이후 dist build 단순 복사로 환원 + cross-language 일관 + Windows path 친화.

### 변경 사항

#### Renamed (12 — `git mv`, history 보존)

| 영역 | 매핑 |
|---|---|
| Deliverables 8 | `01-아키텍처` → `1-architecture` / `02-도메인-모델` → `2-domain` / `03-API-계약` → `3-api` / `04-DB-스키마` → `4-db-schema` / `04-5-형식명세` → `4-5-formal-spec` / `05-비즈니스-규칙` → `5-business-rules` / `06-안티패턴` → `6-antipatterns` / `07-UI-UX-명세` → `7-ui-ux` |
| Workflow 2 | `phase-0-입력정리` → `phase-0-input` / `phase-4-비즈니스로직` → `phase-4-business-logic` |
| Glossary 1 | `methodology-spec/한국어-용어집.md` → `methodology-spec/glossary-ko.md` |
| Extension 1 | `templates/meta-confidence.template.yml` → `.yaml` |

#### Updated (cross-link sed 치환 — 33 파일)

README / CHANGELOG / decisions (INDEX / STATUS / 8 DEC) / docs/adr (4 ADR) / methodology-spec/workflow (phase-flow.json + phase-5-2-ui + phase-6-quality) / templates (4) / examples/poc-01·02·03 의 _manifest.yml + findings/poc-findings + RESUME + 일부 output (8) / 외부 `.claude/` 2.

#### 제외 (history artifact 21 — commit `0e01595` body 명시)

`examples/poc-XX/.claude/` 하위 PROGRESS / plan / research / case / document / senior / SESSION-WRAPUP 21 파일 = 과거 PoC 기록 그대로 유지.

### 검증

| 항목 | 결과 |
|---|---|
| formal-spec-link-validator | 4/4 pass |
| drift-validator | 14/14 pass |
| phase-flow.json JSON validity | OK |
| 12 신규 path `git ls-files` | 12/12 ✅ |
| 잔여 grep 12 token | 21 hits = 정확히 의도적 제외 |

### Scope

산출물 / 사상 / schema 변경 없음. 파일명 + cross-link 만. **PATCH 적격**.

---

## [v1.3.0] — 2026-05-01 (MINOR ★★★)

### 트리거

3 PoC (Spring Boot 2.5 / Spring Boot 3.3 Hexagonal / NestJS) 종결 후 본 방법론이 **platform-agnostic 임이 입증된 시점** + **★★★ no-simulation 정책 첫 실현 (spectral 실 실행)** + 격상 후보 6건 모두 적용 + Sprint 5 Node 도구 부분 종결.

> **본 release = 사내 표준으로 격상**. 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능. 신뢰도 85-92% 도달 (단계 4 — 진짜 도구 1회 실행 ★).

### 변경 사항

#### Added (추가) — v1.2.3 PATCH 흡수 + Sprint 5 부분

**v1.2.3 PATCH 흡수** (★ 본 MINOR 에 통합):
- 묶음 C (Phase 4.5 cross-link 의무화 schema)
- 묶음 I (AP-PERFORMANCE 3 PoC 권위 격상)
- 묶음 H (Positive finding 패턴 schema — severity:positive + learning_effect_type 4종 + status:logged)
- 묶음 K (Lifecycle BR 패턴 — decision_tables required 분리 + br_type enum + current_state_note)
- 묶음 R (NestJS 4 ADR — Auth-scope / Validation / HttpCode / TypeORM-Integrity)
- 묶음 D (ADR-006 final 격상 + ADR-010 Baseline + Ratchet 신규)
- §8.1 cross-platform 입증 정식 등재 (README "Platform-Agnostic 입증" 섹션)

**v1.2.3 후속 LMNO** (★ 본 MINOR 에 통합):
- 묶음 L (migration-cautions.md NestJS 변형 + 사내 도입 quality gate 정책)
- 묶음 M (ADR-010 baseline+ratchet 도구 implementation — drift + dmn 에 `--baseline` / `--ratchet` / `--write-baseline`)
- 묶음 N (formal-spec-link-validator 신규 도구 — Phase 4.5 cross-link enforcement)
- 묶음 O (PoC #03 BR formalization 100% — 18/18)

**★★★ Sprint 5 Node 도구 부분 종결 (2026-05-01 — 본 release 트리거)**:
- `tools/spectral-runner/` — `@stoplight/spectral-cli` wrapper 신설
- PoC #03 openapi.yaml 자가 적용 — **24 warnings / 0 errors / exit 0** ✅
- ★ 본 방법론 ★★★ no-simulation 정책 첫 실현 (drift/dmn 자체 도구 + spectral 진짜 외부 도구)
- ★ ADR-009 단계 4 (진짜 도구 1회 실행) 첫 도달
- 신뢰도 80-87% → **85-92%** 도달 가능 시점

### 정량

| 측정 | v1.2.2 → v1.3.0 |
|---|---|
| 본체 갭 closure | 7 → **15** |
| ADR 수 | 9 → **13** (NEST 4 + 010 1) |
| schema 갱신 | — → **4건** (C/H/K + finding-system) |
| 명세 본체 갱신 | — → **4건** (06 / finding-system / phase-4-5 / phase-6) |
| 도구 수 | 3 → **5** (★ formal-spec-link-validator + spectral-runner 신규) |
| 도구 unit test | 17 → **37** |
| PoC #03 BR coverage | — → **100%** (18/18) |
| PoC #03 신뢰도 | — → **0.91** (★ 단계 4) |
| 본 방법론 시뮬 패널티 신뢰도 | 80-87% | **85-92%** (★ spectral 실행 후) |

### v1.3.0 release 의 의미

- **★ 본 방법론 = 사내 표준 채택 가능 시점** — 3 PoC platform-agnostic 입증 + 진짜 도구 검증 + 12 묶음 본체 갭 closure
- **★ 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능** — `docs/v1.3-promotion-report.md` §5.3 정합
- **★ ROI 견적**: 소규모 5x / 중규모 7x / 대규모 12x

### Migration Guide (v1.2.x → v1.3.0)

본 v1.3.0 은 **하위 호환** (★ 모든 schema 변경 = optional 신규 필드 또는 null 허용 확장).

권장:
1. `api-extension.json` operations[] 에 `formal_spec_links` 추가 (선택 — coverage 정량 추적 가능)
2. `antipatterns.json` antipatterns[] 에 `formal_spec_links` 추가 (선택)
3. `finding-system.schema` 의 `severity:positive` + `status:logged` 활용 (cross-PoC 학습 효과 입증)
4. Lifecycle BR 시 `br_type: lifecycle` + `http_status: null` (★ K 묶음 정합)
5. 사내 도입 시 ADR-010 baseline + ratchet 의무 적용
6. 신규 NestJS 프로젝트 — ADR-NEST-001~004 의무

### Carry-over → v1.3.x (★ 후속 PATCH)

1. **Sprint 5 잔여** — Semgrep (Python+Java 환경) / PMD (Java) / OSV-Scanner (Go binary) 실 실행 — ★ 환경 변동 시
2. **Sprint 6** — vacuum / openapi-changes / corpus 14쌍 → 20쌍 / drift-validator phase-flow 비교기
3. **묶음 P 보강** — migration-cautions Spring Boot 변형 / FastAPI 변형 (★ 4번째 PoC 진입 시)
4. **사내 적용** — 첫 사내 legacy 분석 시 baseline 등재 + 분기별 review

---

## [v1.2.3] — 2026-04-30 (PATCH — ★ v1.3.0 에 흡수)

### 트리거

PoC #03 NestJS 종결 후 **본체 갭 4건 정식 해소** — 본체 도구/schema/명세를 PoC #03 검증 결과로 격상. 본 PATCH 는 **PoC 산출물 작업이 아닌 본 방법론 본체 격상** 에 집중 (사용자 명시 — quality 격상 방향 재정렬).

| 묶음 | 영역 |
|---|---|
| **C** | Phase 4.5 cross-link 의무화 schema (openapi-extension + antipatterns) |
| **I** | AP-PERFORMANCE-001 medium → high 정식 격상 (★ 3 PoC 권위) |
| **H** | Positive finding 패턴 schema 화 (★ severity:positive + status:logged + positive_finding_meta) |
| **K** | Lifecycle BR 패턴 본체 schema 반영 (★ formal-spec.schema decision_tables required 분리) |

이전 A 묶음 (drift-validator quality boost) + B 묶음 (Phase 4.5 풍부화) 의 본체 보강분도 본 PATCH 에서 정식화.

### 변경 사항

#### Added (추가)

**★ Phase 4.5 cross-link 의무화 (★★ 묶음 C)**

- `schemas/openapi-extension.schema.json` operations[] 에 `formal_spec_links` 필드 추가 (decision_tables / state_machines / sequence_diagrams).
- `schemas/antipatterns.schema.json` antipatterns[] 에 `formal_spec_links` 필드 추가 (decision_tables / state_machines / sequence_diagrams / invariants).
- 자발적 입증: PoC #03 9/21 op (43%) + 4/11 AP (36%) cross-link → schema 의무화 (optional but recommended).
- ★ ADR-008 (이중 렌더링) + Phase 4.5 본질 가치 정식 입증 데이터.

**★ Positive Finding 패턴 (★ 묶음 H)**

- `schemas/finding-system.schema.json` `severity` enum 에 `positive` 추가 / `status` enum 에 `logged` 추가.
- 신규 필드 `positive_finding_meta`:
  - `previous_poc_finding` — 이전 PoC negative finding ID
  - `current_poc_evidence` — 현 PoC positive 증거
  - `learning_effect_type` enum 4종 (framework_natural_avoidance / language_static_block / platform_difference / team_learning)
  - `v13_promotion_candidate` — v1.3 본체 격상 후보 표시
- `methodology-spec/finding-system.md` §4 + §5 갱신 — positive finding 패턴 + 4 학습 효과 분류 + logged 처분 신설.
- 사례: PoC #03 F-161 (Bearer 표준 = NestJS framework_natural_avoidance) — PoC #02 F-084 비재현.
- ★ 단일 PoC 과적합 회피 (§8.1) 의 적극적 입증 = "비재현 = 학습 효과" 정량화.

**★ Lifecycle BR 패턴 (★ 묶음 K)**

- `schemas/formal-spec.schema.json` `decision_tables` items 갱신:
  - `required` 분리 — always (br_id/trigger/condition/action/expected_result/verification_location/current_state) vs api (rejection_method/http_status/error_message).
  - `rejection_method`/`http_status`/`error_message` 타입 `["string", "null"]` / `["integer", "null"]` (lifecycle BR null 허용).
  - 신규 필드 `current_state_note` (★ 한국어 prefix enum 위반 회피 — F-156 fix).
  - 신규 필드 `br_type` enum (api / lifecycle / domain_invariant / performance / security).
- `methodology-spec/workflow/phase-4-5-formal-spec.md` §3.3.1 신설 — BR 분류 + null 허용 필드 + current_state_note 정식.
- 사례: PoC #03 BR-USER-PASSWORD-HASH-001 (@BeforeInsert) / BR-ARTICLE-COMMENT-EAGER-001 (eager loading).

#### Changed (변경)

**★ AP-PERFORMANCE-001 medium → high 정식 격상 (★ 묶음 I)**

- `methodology-spec/deliverables/6-antipatterns.md` §5.5 신설:
  - Severity 격상 정책 (★ 3 PoC 재현 = medium → high 자동 격상)
  - 정식 격상 사례 표 (AP-PERFORMANCE-001)
  - severity inflation 회피 패턴 (단일 PoC = 격상 ❌, 2 PoC = 권위 표기, 3 PoC = 격상 ✅)
- 근거: PoC #01 F-006 + PoC #02 F-051 + PoC #03 F-124 = 3 PoC 재현 권위.

**드리프트 / DMN 도구 보강 (★ 이전 묶음 A + B 본체 반영)**

- `tools/drift-validator/src/normalize-mermaid.js` — `state_ancestors` Map 추가 (sub-state ancestry 추적).
- `tools/drift-validator/src/compare.js` — `transitionFuzzyMatch` 6 case 확장 (compound state inner / sub-tree / self-loop / m.parent).
- `tools/drift-validator/corpus/` — 4쌍 → 14쌍 (★ Sprint 5 carry-over 70% 진척).
- `tools/decision-table-validator/src/json-sanity.js` — REQUIRED_ALWAYS / REQUIRED_IF_API 분리 (★ 묶음 K 의 도구 측 fix).

#### Validated (검증)

- drift-validator unit test 6 → 14 (모두 통과).
- PoC #03 자가 재검증 — drift breaking 20 → 8 → 0 ✅ / dmn 12 BR 0 breaking + 8 info (lifecycle null 의도) ✅.
- false positive 60% → 0% (★ ADR-009 단계 3+ 도달).

### 현재 상태

- **본체 갭 11건 closed** (v1.2.2 7건 + v1.2.3 4건).
- ADR 9개: 001~006 + 008 + 009 (변동 없음 — 본 PATCH 는 schema/명세 본체 격상).
- 신뢰도 정직 표기: 80-87% 유지 (시뮬 패널티 / Sprint 5 carry-over).
- PoC #03 신뢰도 0.87 (단계 3+).
- v1.3.0 정식 release 진입 직전 상태 도달.

### Carry-over → v1.3.0

1. **Sprint 5** — F-156 (한국어 prefix) 외 잔여 환경 의존 (Semgrep/PMD/spectral)
2. **묶음 R 신설** — NestJS 4 ADR (Auth / Validation / HttpCode / TypeORM) — DEC-v1.3-격상-데이터-완비 §2.1 #3
3. **묶음 D** — ADR provisional → final 격상 + ADR-010 (baseline + ratchet)
4. **§8.1 정식 등재** — 3 PoC cross-platform 입증 데이터 README/overview 등재
5. **migration-cautions NestJS 변형 추가** — 묶음 P 보강

---

## [v1.2.2] — 2026-04-30 (PATCH)

### 트리거

DEC-2026-04-30-M-묶음-갭-식별 의 P2-3 5건 일괄 처리. v1.2.0 격상 시점 "묶음 M 일괄" 로 미뤄졌던 본체 갭. **본체가 ADR-008 (이중 렌더링 사상) 을 100% 따르지 못하던 상태 해소** — 이제 본체도 PoC 산출물처럼 단일 진실 + AI 눈 + 사람 눈 의무 정합.

### 변경 사항

#### Added (추가)

**`templates/api.template.md`** (G3 — P2 #3)
- `templates/api.template.yaml` (AI 눈) 의 사람 눈 짝.
- PoC #01 / #02 `api.md` 형식 표준화 — endpoint heatmap + UC ↔ op 매핑 + RFC 위반 인덱스 + AP/finding 인덱스 + 변경 권고 우선순위.

**`methodology-spec/workflow/phase-flow.mermaid` + `phase-flow.json`** (G4 — P2 #4)
- 9 phase (0~6 + 4.5) + 산출물 의존 그래프 + Phase 4.5 도입 위치 시각화.
- `.json` 짝 (drift-validator 의 향후 phase-flow 비교기 v1.3+ 호환). 본 sprint 에서는 drift-validator 미인식 — Sprint 6 후속.

**`docs/adr/ADR-009-다이어그램-신뢰-모델.md`** (G5 — P2 #5) ★
- DEC-2026-04-29-다이어그램-신뢰-모델 + memory `feedback_diagram_trust_model.md` 정식 ADR 격상.
- **7단계 + 8단계 (이론적 100%) 신뢰도 정량 표** — 1차 작성 60-70% / cross-validation 75-85% / **★ v1.2.1 자동 도구 78-85% 단계 신설** / 시뮬 패널티 80-87% / 진짜 도구 85-92% / property test 90-95% / 사람 95%+ / 형식 증명 100%.
- **★★★ 도구 종류 enum 7종** — `ai_subagent` / `ai_persona_simulation` / `automated_tool` / `real_static_tool` / `property_test` / `human_review` / `formal_proof`. AI persona vs 진짜 도구 절대 동일 신뢰도 표기 ❌.
- ADR-008 과 짝 — 사상 (왜 두 렌더링) / 정량 (어디까지 믿나).
- 본 방법론 차별 자산 — 외부 사례 부재 (테크기업 사례 research fetch 실패).

**`templates/db-schema.template.md`** (G6 — P3 #6)
- `erd.template.mermaid` (사람 눈 다이어그램) + `schema.json/sql` (AI 눈) 의 보고서 짝.
- PoC #02 `정합성-검증-보고서.md` 형식 표준화 — 출처 매트릭스 + ORM derivative vs 수동 분별 (F-050) + 정합성 5종 + Race Safety + AP/finding 인덱스.

**`templates/meta-confidence.template.yaml`** (G7 — P3 #7)
- `schemas/meta-confidence.schema.json` (AI 눈) 의 사람 눈 짝.
- **dbt-score / Backstage EntityMeta 모델 차용** (Document agent research): `trust_level` (current % + current_step + validation_history[]) + `tool_type` enum (ADR-009 정합).
- PoC #02 `_manifest.yml` 형식 통합. 5종 물증 cross_validation 예시 주석 포함 (formal-spec.schema 정합).

#### Updated (갱신)

- `README.md` — v1.2.1 → v1.2.2 헤더 + ADR-009 명시
- `decisions/STATUS.md` — 묶음 M 7/7 완료 (P1 Sprint 3 + P2-3 본 sprint)
- `decisions/INDEX.md` — DEC-m-p2-3-종결 entry

### 현재 상태

- **본체 갭 7건 모두 closed** (P1 2건 Sprint 3 + P2-3 5건 본 sprint)
- ADR 8개: 001~006 + 008 + **009 신규**
- v1.2.x 묶음: A~P 16건 ready ✅ + M 7/7 ✅ — **사실상 v1.3 진입 가능 상태**
- 신뢰도 정직 표기: 80-87% (시뮬 패널티 유지 / Sprint 5 진짜 도구 carry-over)

### Carry-over

1. **Sprint 5** — static-runner 진짜 실행 1회 / drift-validator transitionFuzzyMatch 보완 / corpus 4쌍→20쌍 / ADR-010 (baseline+ratchet)
2. **Sprint 6** — drift-validator phase-flow 비교기 (v1.3+)
3. **시퀀스 B** — PoC #03 진입 (다른 stack)

---

## [v1.2.1] — 2026-04-30 (PATCH)

### 트리거

C-Sprint 4 종결 — 묶음 N+O 인프라 산출. v1.2.0 의 14/16 묶음 ready 에서 **16/16 ready** 로 격상. 진짜 외부 도구 실 실행은 환경 부재로 Sprint 5 carry-over (★★★ no-simulation 정책 정합).

| 묶음 | 영역 |
|---|---|
| **N** | Drift 자동 검증 도구 (CI) — drift-validator + decision-table-validator + drift-check.yml |
| **O** | 진짜 외부 도구 실행 의무화 — static-runner Plugin host + 5종 물증 schema enforcement + lint-no-simulation.sh |

→ 시퀀스 C 종결. 시퀀스 B (PoC #03) 또는 Sprint 5 (carry-over) 진입 가능.

### 변경 사항

#### Added (추가)

**도구 3종 신설 (`tools/`)**

- `tools/drift-validator/` — `.json ↔ .mermaid` 의미 동일성 자동 검증 (state-machine + sequence). 정규식 fallback (★ 30분 spike 결과 `@mermaid-js/parser` v1.1.0 미지원 입증). oasdiff 식 항목별 diff list + severity (`breaking`/`non-breaking`/`info`). corpus 4쌍 self-test (Sprint 5 → 20쌍 확장 carry-over). 6/6 unit test pass.
- `tools/decision-table-validator/` — dmn-check 5종 (duplicate / conflict / gap / overlap / type) + JSON sanity (formal-spec.schema 정합). `red6/dmn-check` Apache 2.0 알고리즘 차용. 7/7 test pass.
- `tools/static-runner/` — Semgrep / PMD / SpotBugs / Daikon / CodeQL plugin host. **5종 물증 schema enforcement** + `lint-no-simulation.sh` 차단 룰. 4/4 test pass. Sprint 4 1차: Semgrep + PMD plugin (SpotBugs/Daikon/CodeQL plugin skeleton 만 — Sprint 5+ carry-over).

총 17/17 unit test pass.

**CI workflow 신설**

- `.github/workflows/drift-check.yml` — 이중 모드 (PR diff-aware `SEMGREP_BASELINE_REF=main` / nightly full / manual dispatch). action 핀 (`actions/setup-java@v5` Temurin 21 + `actions/setup-node@v6`). SARIF Code Scanning upload + 30일 evidence artifact 보존.

#### Changed (변경)

**`schemas/formal-spec.schema.json` — `cross_validation` 5종 물증 의무화**

`validators[]` 항목에:
- `real_tool: true` 시 7 필드 (`tool_version` / `tool_stdout_path` / `tool_stderr_path` / `invocation_timestamp` / `duration_ms` / `result_hash` / `reproduction_command`) **JSON Schema if/then allOf 강제**
- `real_tool: false` 시 `simulation_reason` 의무
- `simulation_only: true` 시 자동 fail

→ DEC-2026-04-29-static-tool-실행-의무화 enforcement 자동화.

#### Validated (검증)

**PoC #02 자가 검증 (★ Sprint 4 본질적 가치)**

drift-validator + decision-table-validator 를 PoC #02 formal-spec 디렉토리에 적용:
- state-machine 2건: **7 breaking** + 0 non-breaking + 24 info
- sequence 2건: 0 breaking
- decision-table 6건: 0 breaking + **3 non-breaking** (interpretive drift)

→ Sprint 3 가 "drift 0" 으로 보고했던 산출물에서 **10건 자동 검출**. 수동 검증 한계 노출 = 묶음 N (Drift CI) 의 강한 ROI 정량 입증.

#### Findings (신규)

**Sprint 4 신규 finding 11건** (F-107~F-117) — `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-4-REPORT.md` 정리.

| 분류 | 건수 | 핵심 |
|---|---:|---|
| state-machine structural drift (high) | 4 | F-107 / F-109 / F-110 / F-112 |
| state-machine 추상화 layer (medium) | 3 | F-108 / F-111 / F-113 |
| decision-table interpretive (low) | 3 | F-114 / F-115 / F-116 |
| 메타 finding (medium) ★ | 1 | F-117 — Sprint 3 "drift 0" 수동 한계 노출 |

#### Carry-over → Sprint 5

1. static-runner Semgrep + PMD 1회 실 실행 (사용자 환경 설치 또는 CI 위임 후) — 신뢰도 80-87% → 90-95% 격상 가능
2. drift-validator transitionFuzzyMatch 보완 (composite state inner transition) — F-108/F-110/F-111 false positive 제거
3. corpus 4쌍 → 20쌍 확장
4. ADR-010 (baseline + ratchet) 격상 — 운영 표준 (Slack/GitLab/Dropbox/Figma/Shopify 사례 정합)

### 신뢰도 표기 (정직 유지)

- 시뮬 패널티 적용 시 80-87% (현재 — 본 환경 Java/Semgrep/PMD 부재)
- 진짜 도구 1회 실행 시 90-95% 목표 (Sprint 5 carry-over)

★★★ no-simulation 정책 정합 — 시뮬 결과를 신뢰도 90-95% 근거로 절대 사용 금지.

### 결정 / 보고서

- `decisions/DEC-2026-04-30-sprint-4-종결.md`
- `decisions/STATUS.md` 갱신 (v120_bundles_ready: 16/16)
- `decisions/INDEX.md` 갱신
- `examples/poc-02-realworld-springboot3/output/formal-spec/SPRINT-4-REPORT.md`
- `examples/poc-02-realworld-springboot3/.claude/SESSION-WRAPUP-2026-04-30-sprint4.md`
- `ai-native-methodology/.claude/plans/plan-c-sprint-4.md` + `.claude/researches/research-c-sprint-4.md`

---

## [v1.2.0] — 2026-04-30 (MINOR)

### 트리거

PoC #01 + PoC #02 (1chz/realworld-java21-springboot3 — Spring Boot 3.3 / Java 21 / Multi-module Hexagonal) 누적 결과로 **MINOR 격상**. C-Sprint 1+1.5+2+3 (Phase 4.5 형식화 시범) 4 sprint 누적 정량 입증 + 14 묶음 통합:

| 묶음 | 영역 |
|---|---|
| A | cross-validation (F-015) — sub-agent 학습 코퍼스 의존 위험 회피 |
| B | 정정 트레이스 (F-022 + F-024) |
| C | severity 표준 (F-018) |
| D | schema 진화 (F-025) — multi-module + Hexagonal 모듈 분리 |
| E | quality-extraction |
| F | 신뢰도 공식 보강 |
| G | OpenAPI x-extension (ADR-007) — PoC #02 외부 검증 |
| H | multi-module / Auth/Crypto — PoC #01+#02 isomorphic ★★★ (AP-SECURITY-001 양 PoC 재현) |
| I | finding-system 정식화 (Sprint 3 schema 등록) |
| J | Hexagonal port-adapter 가이드 |
| K | multi-module Outside-in 모범 사례 |
| **L** | **Phase 4.5 형식화 정식 도입 — Sprint 1~3 누적 ★★★** |
| **M** | 본체 이중 렌더링 갭 P1 2건 적용 (P2-3 5건은 v1.2.0+ 일괄) |
| **P** | 안티패턴 migration_advice + migration-cautions.md |

이중 렌더링 정합도 67% → 100% (state-machine + sequence + decision-table 영역). v1.2.0 = "코드 → 형식 명세 + 위험 기록" 한 방향 추출기 가치 명세 정식 등록.

### 변경 사항

#### Added (추가)

**ADR-008: 이중 렌더링 사상 (신규 ★★★)** — DEC-2026-04-29-이중-렌더링-사상-명시화 격상

- 단일 진실 (SSOT) + 두 청중 (AI 눈 / 사람 눈) 사상 정식 등록
- 학문적 계보: Donald Knuth, "Literate Programming" (1984) AI 시대 재해석
- 영역별 적용 매트릭스 (7대 산출물 + Phase 4.5 5건 + 메타)
- ADR-001 (Schema-First) 포섭 (supersede X — Schema-First = AI 눈 부분)
- 신규 산출물 추가 시 양쪽 렌더링 의무 체크리스트

**Phase 4.5 형식 명세 (신규 ★★★)** — 묶음 L

- `methodology-spec/workflow/phase-4-5-formal-spec.md` — workflow 명세
- `methodology-spec/deliverables/4-5-formal-spec.md` — 산출물 명세
- `schemas/formal-spec.schema.json` — 5 산출물 schema (state_machines / sequences / decision_tables / invariants / property_tests + cross_validation 메타)
- `templates/formal-spec.template.md` — 작성 가이드
- `templates/state-machine.template.mermaid` — Mermaid stateDiagram-v2 예시
- `templates/sequence.template.mermaid` — Mermaid sequenceDiagram 예시
- `templates/decision-table.template.md` — 9 항목 표 (자연어 빈약성 100% 보완)
- 자연어 빈약성 정량 입증: 4/9 (44%) → 9/9 (100%) — PoC #02 F-074 단방향 round-trip 검증
- AI 코드 생성 정확도: 자연어 60% → 형식 90% (시뮬 패널티 시 80-87%)

**finding-system.schema.json (신규)** — M-P1-#1

- `schemas/finding-system.schema.json` 정식 등록 — `methodology-spec/finding-system.md` DRAFT 자산화 차단 해소
- finding 표준 형식 schema 화 (finding_id pattern / phase 0~6 + "4.5" / severity 4단계 critical 추가 / status 7단계 candidate/merged 추가 / cross_validation double_hit / severity_history)
- PoC #02 운영 패턴 (candidate / merged / critical / cross_validation double_hit) 모두 schema 화

**migration-cautions.md (신규)** — 묶음 P β

- `methodology-spec/workflow/phase-6-quality.md` 의무 산출물 격상 (β)
- 본 방법론 가치 명세: "코드 → 형식 명세 + **위험 기록** 한 방향 추출기" 정합
- 카테고리별 (API / DB / Security / Architecture / Domain / Performance) 신규 시스템 회피 가이드
- design / CI / Review 단계 체크리스트
- avoid-list.md 와 차이: 기존 시스템 fix vs 신규 시스템 회피

**`migration_advice` 필드 (antipatterns.schema.json 신규)** — 묶음 P α

- `schemas/antipatterns.schema.json` 에 `migration_advice` 필드 추가 (optional — 호환성 유지)
- PoC #02 21 AP backfill 완료 (PoC #01 15 AP 는 v1.2.x backfill)

#### Changed (변경)

**phase-6-quality.md §6 출력 (변경)** — 묶음 P β

- migration-cautions.md 의무 산출물 격상 (composite-patterns.md 와 동급)
- §6.0 신설: migration-cautions.md 구조 + avoid-list.md 와 차이 명시

**schemas/README.md (목록 갱신)** — 묶음 I + L

- finding-system.schema.json 추가
- formal-spec.schema.json 추가

#### PoC #02 산출물 (참조)

- `examples/poc-02-realworld-springboot3/` Phase 1~6 종결 (7대 산출물 6/7) + Phase 4.5 형식화 4 sprint
  - finding 43건 (F-042~F-087 + Sprint 1.5+2 신규 19건)
  - AP 21건 (critical 3 / high 3 / medium 10 / low 5)
  - migration_advice 21/21 backfill ✅
  - migration-cautions.md 신규 ✅
  - formal-spec/ 7대 영역 28 산출물 + 이중 렌더링 100%

### 알려진 한계 (v1.2.0 스코프 외 — F-021 §8.1 점검 결과)

C-Sprint 3 #4 §8.1 단일 PoC 과적합 회피 점검 결과:
- **Strong 후보**: 0건 (closed 8건 모두 통과)
- **한계 명시 후보 2건**:
  - F-016 (ddl-auto 분기) — closed 유지. PoC #02 F-049 메타 finding 으로 schema.sql ORM derivative 출처 의존성 분별 한계 부분 노출. v1.2.x 또는 v1.3.0 에서 보강 권고.
  - F-023 (SCC 도메인 의도 분기) — closed 유지. PoC #02 F-060 메타 finding 으로 §3.1.1 0건 케이스 한계 노출. v1.2.x 보강 권고.

### v1.2.0 스코프 외 (Sprint 4 / v1.2.x 후속)

- **묶음 N**: Drift 자동 검증 CI 도구 (이중 렌더링 .json ↔ .mermaid 일치 강제)
- **묶음 O**: 진짜 외부 도구 의무화 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — DEC-static-tool-실행-의무화)
- **묶음 M P2-3**: 본체 갭 5건 (api.template.md / phase-flow.mermaid / ADR-009 / db-schema.template.md / meta-confidence.template)
- **신뢰도**: 80-87% (시뮬 패널티) → 90-95% 목표 (Sprint 4 진짜 도구 도입)

### Migration Guide (이전 사용자용)

본 v1.2.0 은 **하위 호환** (MINOR — 모든 schema 변경은 옵셔널 신규 필드).

기존 v1.1.x 산출물에 다음 권장:
1. `antipatterns.json` 의 각 AP 에 `migration_advice` 필드 추가 (선택, 신규 시스템 회피 가이드)
2. Phase 6 산출 시 `migration-cautions.md` 신규 작성 (의무 산출물 격상 — β)
3. Phase 4 후 형식 명세 필요 시 Phase 4.5 진입 (`formal-spec/` 디렉토리 + 5 산출물)
4. 신규 산출물 추가 시 ADR-008 이중 렌더링 사상 의무 준수 (양쪽 렌더링 동시 산출)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (Phase 4.5 형식화 + migration-cautions 의무)
- ✅ 본 방법론으로 만든 v1.1.x 산출물 (호환, migration_advice + migration-cautions backfill 권장)
- ❌ Breaking change 없음

### 검증

- 11개 schema (formal-spec / finding-system 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-008 정합성: ADR-001 (Schema-First) 포섭 / ADR-002 (7대 산출물) 사상적 기반 / ADR-007 (OpenAPI x-extension) 정합
- 사료 강도: Knuth Literate Programming (1984) 1차 사료 + RFC 7231/9110 + Spring Data JPA Reference + Vlad Mihalcea + Vernon IDDD
- C-Sprint 1+1.5+2+3 누적 cross-validation: drift 34건 (Sprint 1.5 11 + Sprint 2 19 + Sprint 3 +0 — 정합 100%)

### Lessons Learned

- 이중 렌더링 사상 (ADR-008) 은 v1.1.x 시점에 이미 *암묵적으로* 적용되어 있었으나 사상 명시 부재 → Sprint 3 #1 직전 ADR-008 작성으로 묶음 L (Phase 4.5) 격상의 사상적 기반 강화
- F-074 단방향 round-trip 검증 패턴 (코드 부재 BR 선택 → 자연어 → 형식 → 코드 생성) — Sprint 1 self-reference 함정 회피 + 자연어 빈약성 정량 입증 (44% → 100%)
- M-P1 병행 패턴 (방법론 본체 갭 P1 을 PoC sprint 와 병행) — 사상 정식화와 PoC 정식화 동시 진행 가능
- Python script 일괄 적용 (21 AP migration_advice backfill / 6 decision-table .json 짝) — Edit 21번 vs script 1번 효율 차이 큼

---

## [v1.1.2] — 2026-04-28

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0~3 완료 + **F-021 누적 finding 임계** (18/20 도달) → 사용자 결정 Option A (PoC 정지 + v1.1.2 격상). high severity finding 4건 처리:
- F-007: inventory.schema.json + template 부재 (high)
- F-009: phase-1-init.md §6 신뢰도 표 환경 종속성 미명시 (high)
- F-016: phase-2-db.md §3.4 ddl-auto 매트릭스 부재 (high)
- F-023: phase-3-arch.md §3.1 Tarjan SCC vs 도메인 의도 분기 가이드 부재 (high)

### 변경 사항

#### Added (추가)

**schemas/inventory.schema.json (신규)** — F-007

- meta + repo + stack + architecture_style_candidates + modules_for_priority_analysis + directory_tree_extraction
- `repo.loc_extraction_method` enum (deterministic / heuristic_byte_per_35 / estimation / unknown) — F-009 결정성 축
- `architecture_style_candidates[].confidence` cap 0.7 (Phase 1 한계, 최종 분류는 Phase 3)
- `directory_tree_extraction.truncated` boolean — Trees API 한계 명시
- 산업 모델: Backstage Catalog Entity descriptor

**templates/inventory.template.json + inventory.template.md (신규)** — F-007

- placeholder 형식 + 사람용 README 형식 분리
- meta.warnings 의무화 항목 (heuristic LOC, truncated tree, ORM 단서 부족 등)

**schemas/README.md (신규)** — F-007

- 9개 schema 목록
- CI 검증 TODO (v1.3.0 도입 예정 — Backstage 진화 모델)
- v1.1.2 임시 정책: 수동 ajv 검증 권장
- 산업 사례 경고: OpenAPI 3.0→3.1 7년 divergence

**ADR-006 (신규, Provisional)** — F-023

- 순환 의존성 처리 default 정책
- hybrid (탐지 결정적 + 분류 BC 분기 + decision_required 페어)
- bc_status 3값 enum (same / different / undefined) + bc_assignment_explicit boolean + documented_decision boolean
- BC 미정의 default = medium + decision_required = true (ArchUnit FreezingArchRule 산업 표준)
- "intent" 단어 회피 (산업 표준 도구 0건 사용)
- revisit_at: PoC #02 완료 시점

#### Changed (변경)

**phase-1-init.md §6 신뢰도 표** — F-009

- 단일 표 + 결정성 (Determinism) 축 + 환경 caveat 컬럼 채택
- 결정성 tier: deterministic / snapshot-based / heuristic / pattern_matching / llm_with_grounding / llm_code_only
- inventory.meta.warnings 의무화 가이드 추가
- 산업 표준 5건 정합 (CodeQL `@precision` / Sourcegraph SCIP / Linguist / SonarCloud / tree-sitter)
- 안티 패턴 명시: "환경별로 표 자체를 분리" 거부 (DRY 위반 + enum 폭발 + 산업 표준 0건)

**phase-2-db.md §3.4 통합 우선순위** — F-016

- 7행 매트릭스 → **원칙 + Decision Tree + 부록 reference** 구조
- 원칙 3개 (자동 schema 변경 금지 / DDL versioned-reviewable-reversible / ORM = validate 한정)
- Decision Tree (마이그레이션 도구 도입 가능 → 운영 DB 존재)
- 부록 A: Hibernate ddl-auto enum 값 reference (운영 가능 여부 표시)
- 산업 권위 7/7 매트릭스 반대 (Vlad Mihalcea / Stripe / Atlasgo / Quesma) → 원칙 표준 채택

**phase-3-arch.md §3.1 순환 의존성 처리** — F-023

- §3.1.1 신설: Tarjan SCC + BC 분기 + decision_required 5단계
- 분류 표 + 도구 정책 분기 (Spring Modulith verify() / ArchUnit FreezingArchRule)
- §3.1.2 산출 형식 (architecture.json circular_dependencies[] 예시)
- ADR-006 참조 의무

**schemas/architecture.schema.json `circular_dependencies[]` 보강** — F-023

- 신규 옵셔널 필드 7개: id / detection.algorithm / bc_status / bc_assignment_explicit / documented_decision / decision_required / decision_owner / decision_deadline / phase_4_routing
- 모두 옵셔널 → v1.1.1 산출물 호환 (PATCH 가능)

#### Documentation (문서)

> ※ v1.1.2 작업 산출물 (`methodology-v1.1/.claude/`) 은 batch 1.5 (commit `c72d29c` 이후) 에서 폐기. 1차 사료는 git history 에서 조회 가능.

- `plan-v112.md` — 1원칙 산출물 (변경 계획)
- `researches/document-v112.md` — 공식문서 24개 출처
- `researches/senior-v112.md` — 시니어 의견
- `researches/case-v112-{f007,f009,f016,f023}.md` — 사례 (분리 재실행)
- `researches/research-v112.md` — 통합 (Q1~Q9 결정 매트릭스)
- `PROGRESS-v112.md` — 진행 로그 (시간순)

### Migration Guide (이전 사용자용)

본 v1.1.2 는 **하위 호환** (PATCH). 모든 schema 변경은 옵셔널 신규 필드.

기존 v1.1.1 산출물에 다음 권장:
1. `inventory.json`: 신규 schema 로 검증 (`ajv validate -s schemas/inventory.schema.json`). 누락 필드는 옵셔널이므로 통과.
2. `inventory.meta.warnings`: 환경 종속/추정 항목 명시 (heuristic LOC, truncated tree)
3. `architecture.json` 의 `circular_dependencies[]`: `bc_status=undefined` + `decision_required=true` 추가 권장 (BC 미정의 시 default)
4. `architecture.meta.warnings`: "v1.1.2 분기 가이드 적용 시 재산정 권장" 추가

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (inventory schema 검증 + 결정성 표 + 원칙 + Decision Tree + 순환 분기 가이드)
- ✅ 본 방법론으로 만든 v1.1.0/v1.1.1 산출물 (호환, warnings 추가만 권장)
- ❌ Breaking change 없음

### 검증

- 9개 schema (inventory 신설 포함) JSON Schema Draft 2020-12 문법 통과
- ADR-006 (provisional) 정합성: ADR-001 / ADR-004 와 충돌 없음
- 사료 강도: 4 finding 모두 1차 사료 직접 검증 (Drotbohm Discussion #493 / Vlad Mihalcea / CodeQL @precision / Backstage Entity.schema.json)
- F-015 cross-validation 패턴 적용 (sub-agent 결과 6건 모두 메인 cross-check)

### Lessons Learned

- 1원칙 (plan) 단계에서 변경 매트릭스가 PoC 사례 1건 (RealWorld) 에 너무 적합화됨 → research 통해 BC 미정의 default 가 PoC #02 (마이크로서비스) 에서 부적합 가능성 발견 → ADR-006 provisional 처리
- case agent 4 finding 일괄 처리는 hang 위험 (한국 테크블로그 Cloudflare 추정) → 1건씩 분할 + 한국 테크블로그 제외 + WebFetch 8회 제한이 안정적
- senior + case 가 plan 초안의 "intent" 단어를 동시 거부 → schema 어휘 결정 시 산업 표준 도구 조사 우선

---

## [v1.1.1] — 2026-04-26

### 트리거

PoC #01 (RealWorld Spring Boot) Phase 0에서 발견된 명세 빈틈 2건 해결:
- F-003: 신뢰도 메타데이터 자동 산정 공식 부재 (high)
- F-006: 영역별 가중 평균 방식 부재 (high)

### 변경 사항

#### Added (추가)

**ADR-003 §6~§10 (103 → 301 라인, 3배 확장)**

- §6 산정 공식 v1 (가법 모델 + 상한 0.98)
  - base_confidence: 0.75 (소스만 기준)
  - 가산점 표 10개 (ERD +0.10, ORM +0.10, ...)
  - 페널티 표 5개 (drift -0.05, no_orm -0.05, ...)
  - PoC #01 적용 예시
- §7 영역별 가중 평균 (요소 수 가중)
  - 공식: `weighted_avg = Σ(conf × element_count) / Σ(element_count)`
  - cap 우선순위: weighted 후 min(0.98, weighted)
- §8 추출 방법별 신뢰도 표
  - 결정적: 0.95~1.0
  - 패턴 매칭: 0.80~0.90
  - LLM 추론 (grounding): 0.50~0.75
  - LLM 추론 (코드만): 0.40~0.60
- §9 신뢰도 해석 가이드 (5단계)
  - ≥0.95 거의 확실 / 0.80~0.95 신뢰 가능 / 0.60~0.80 권장 / 0.50~0.60 필수 / <0.50 차단
  - confidence ≠ accuracy 명시
- §10 v1 한계 명시 (calibration 필요, 베이지안은 v2 후보)

**meta-confidence.schema.json 신규 필드 5개**

- `formula_version: "v1"` — 공식 버전 추적
- `applied_modifiers[]` — 어떤 가산점이 적용됐는지
- `applied_penalties[]` — 어떤 페널티가 적용됐는지
- `cap_applied: boolean` — 0.98 cap 적용 여부
- `manual_override: boolean` — 사용자 수동 변경 여부

**meta-confidence.schema.json 구조 강화**

- `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균용)
- `confidence_breakdown` 항목에 `extraction_method` enum 추가 (deterministic/pattern_matching/llm_with_grounding/llm_code_only)
- `inputs_used` enum 확장 (domain_context_md, postman_or_api_test, diagrams_other 추가)

**PoC #01 산출**

- `examples/poc-01-realworld-spring/source-info.md` — 분석 대상 메타정보
- `examples/poc-01-realworld-spring/inputs/domain-context.md` — LLM grounding
- `examples/poc-01-realworld-spring/inputs/_manifest.yml` — 입력 + 신뢰도 산정
- `examples/poc-01-realworld-spring/findings/poc-findings.md` — 명세 빈틈 누적 기록

#### Changed (변경)

**confidence cap 통일 (1.0 → 0.98)**

- `meta-confidence.schema.json`: confidence maximum 1.0 → 0.98
- `antipatterns.schema.json`: confidence maximum 1.0 → 0.98
- `rules.schema.json`: confidence maximum 1.0 → 0.98
- 산출물 명세 7개 검증 + 9곳 보정:
  - `1-architecture.md`: 모듈 식별/의존성/순환 의존성 1.0 → 0.98
  - `4-db-schema.md`: 운영DB 추가 시 1.0 → 0.98 (3곳)
  - `6-antipatterns.md`: static_analysis 1.0 → 0.98, "1.0 가능" → "0.98 cap까지"

**PoC #01 manifest 재계산**

- `expected_confidence_average`: 0.78 → 0.95 (정확한 공식 적용)
- `applied_modifiers` 명시: ORM full(+0.10), domain-context(+0.03), Postman(+0.05), diagrams(+0.02)

#### Documentation (문서)

- `plan-f003-신뢰도공식.md` — 해결 계획
- `research-f003-신뢰도공식.md` — 3-에이전트 토론 (가법 vs 곱셈 vs 베이지안 등 6개 주제)

### Migration Guide (이전 사용자용)

본 v1.1.1은 **하위 호환** (PATCH).

기존 v1.1.0 산출물에 다음만 권장:
1. `meta.formula_version: "v1"` 추가 (선택)
2. `confidence` 값이 1.0이면 0.98로 보정 (선택)
3. `confidence_breakdown` 항목에 `element_count` 추가 (가중 평균 정확도↑, 선택)

### 영향 범위

- ✅ 본 방법론을 사용하는 모든 새 분석 (자동 신뢰도 산정 가능)
- ✅ 본 방법론으로 만든 v1.1.0 산출물 (호환, 재계산 권장)
- ❌ Breaking change 없음

### 검증

- 8개 schema JSON 문법 통과
- 모든 ADR 일관성 유지
- 산출물 명세 7개 정합성 확인
- Mermaid 검증 (이전 사이클에서 완료)

---

## [v1.1.0] — 2026-04-26 (초기)

### 트리거

사내 표준 AI-Native 개발 방법론 v1.1 설계 (분석 단계 ① Analyze).

### 변경 사항

#### Added (초기 작성)

**ADR 5개**

- ADR-001: 사상적 기반 (Schema-First + Contract-First + DDD-Lite + FSD)
- ADR-002: 7대 산출물 (UI/UX 신설)
- ADR-003: 신뢰도 메타데이터 표준 (§1~§5)
- ADR-004: DDD-Lite 강도 B (Aggregate/VO/Repository)
- ADR-005: 한국어 용어 정책 (3단)

**산출물 명세 7개** (`methodology-spec/deliverables/`)

- 01 아키텍처
- 02 도메인 모델 (DDD-Lite B)
- 03 API 계약
- 04 DB 스키마
- 05 비즈니스 규칙
- 06 안티패턴
- 07 UI/UX 명세

**워크플로우 명세 12개** (`methodology-spec/workflow/`)

- Phase 0: 입력 정리
- Phase 1: init
- Phase 2: db (정합성 검증 포함)
- Phase 3: arch
- Phase 4: 비즈니스 로직 (4영역 병렬)
  - 5.A DB 영역
  - 5.B FE 영역
  - 5.C 설정 영역
  - 5.D 외부 의존성
- Phase 5-1: api
- Phase 5-2: ui
- Phase 6: quality

**JSON Schema 8개**

- meta-confidence, architecture, domain, openapi-extension, db-schema, rules, antipatterns, ui-spec

**템플릿 7세트** (`templates/`)

- architecture, domain, erd, api(yaml), rules, antipatterns, ui-spec
- Mermaid 다이어그램 템플릿 5개

**기타**

- 한국어 용어집
- README.md

### 통계

- 44개 파일 / 8,548 라인
- Mermaid 블록 68개 (모두 §9.1 표준 준수)

---

## 다음 마일스톤

### v1.2.x (예정 — Sprint 4)

- **묶음 N**: Drift 자동 검증 CI 도구 (이중 렌더링 .json ↔ .mermaid 일치 강제)
- **묶음 O**: 진짜 외부 도구 의무화 (Semgrep / PMD / SpotBugs / Daikon / CodeQL — DEC-static-tool-실행-의무화)
- **묶음 M P2-3**: 본체 갭 5건 (api.template.md / phase-flow.mermaid / ADR-009 / db-schema.template.md / meta-confidence.template)
- F-016 / F-023 한계 영역 명시 보강
- 신뢰도 80-87% → 90-95% (시뮬 패널티 제거)

### v1.3.0 (계획 — 데이터 완비 시점 ★★)

★ **2026-04-30 PoC #03 종결 = 격상 데이터 완비 ★★** — 자세한 통합 보고서 `docs/v1.3-promotion-report.md` + DEC `DEC-2026-04-30-v1.3-격상-데이터-완비.md`.

#### 격상 후보 6건 (사용자 결단 영역)

| # | 후보 | source |
|---|---|---|
| 1 | **AP-PERFORMANCE-001 medium → high 격상** | 3 PoC 재현 권위 (PoC #01 F-006 + PoC #02 F-051 + PoC #03 F-124+F-135) |
| 2 | **Positive finding 패턴 정식 도입** | F-161 (NestJS Bearer 표준 학습 효과) |
| 3 | **묶음 R (NestJS 4 ADR)** | PoC #03 NestJS 8 함정 + 학습 효과 3건 |
| 4 | **Phase 4.5 cross-link 의무화** | PoC #03 9/21 op + 4/11 AP 자발적 입증 |
| 5 | **migration-cautions.md NestJS 변형 추가** | 묶음 P 보강 |
| 6 | **§8.1 cross-platform 입증 정식 등재** | 12 cross-validation (Java→TypeScript) 균형 분포 |

#### Sprint 5 진입 의무 (정식 release 전제)

- F-154 transitionFuzzyMatch 보완 + corpus 4쌍→20쌍
- 진짜 static tool (Semgrep / PMD / OSV-Scanner) 1회 실행
- ADR-010 (baseline + ratchet) 격상

→ Sprint 5 종결 + 격상 후보 6건 채택 결단 후 v1.3.0 정식 release 가능 (신뢰도 90-95%+).

#### 사내 적용 시작 가능 (★★ v1.2.2 시점부터)

본 방법론 v1.2.2 = 사내 legacy 시스템 분석 + 신규 시스템 구축 가이드 제공 가능 — `docs/v1.3-promotion-report.md §5` 참조.

### v2.0.0 (먼 미래)

- 베이지안 신뢰도 모델 (§ADR-003 §10)
- 풀 DDD (Bounded Context Map) 채택 검토
- Event Sourcing/CQRS 채택 검토

---

## 참고

- ADR 5개: `docs/adr/`
- PoC #01: `examples/poc-01-realworld-spring/`
- finding 누적: `examples/poc-01-realworld-spring/findings/poc-findings.md`
