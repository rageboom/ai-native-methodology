# DEC-2026-05-13-BR-id-4-segment-enforcement-v2.3.7

| 항목     | 값                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 결정자   | 윤주스 (TF Lead)                                                                                                                                                     |
| 일자     | 2026-05-13 ( session 7차)                                                                                                                                            |
| 상태     | 승인 ( rules.schema.json BR pattern 4토막 strict 정합 / id-conventions.md enforcement label 강화 / v2.3.7 PATCH release / chain harness 5 요소 변경 ❌ / no new ADR) |
| 카테고리 | methodology / release / PATCH (schema enforcement / id-conventions 표준 정합)                                                                                        |
| 관련     | DEC-2026-05-13-poc-11-chain-2-종결-v2.3.5 ( schema mismatch 발견 — C-schema-br-pattern-fix carry 신설 trigger)                                                       |

---

## 1. 컨텍스트

### 1.1. trigger

session 4차 (commit `bbe27ab` / PoC #11 chain 2 4 UC 종결) = behavior-spec.json br_refs 빈 array 보존 사실 = critical schema pattern mismatch 발견 trigger:

- `rules.schema.json` BR pattern = `^BR-[A-Z0-9_-]+-\d+$` (3토막+ 자유)
- `behavior-spec.schema.json` br*refs pattern = `^BR-[A-Z0-9*-]+-[A-Z0-9_-]+-[0-9]+$` (4토막+ strict)
- PoC #11 rules.json BR ID = `BR-BILLING-005` (3토막) → behavior-spec br_refs 매핑 시 schema fail

  한 단계 더 깊은 사실: `methodology-spec/id-conventions.md` § 규칙 4 항목 = **이미 4토막 (`BR-{도메인}-{이름}-{번호}`) 정식 표준 명시** (예 `BR-ORDER-CANCEL-001`) → 표준 vs schema enforcement 분리 잔존 사실.

### 1.2. 사용자 결단 (2 question)

- **Q1**: 위반 6 PoC rules.json 재라벨 처리 방침 = (a) **PoC #11 만 즉시 재라벨 + 5개 carry** ( 권장 채택)
- **Q2**: PoC #11 BR-BILLING-\* 카테고리 결단 = (a) **메인 작업 보류 + 도메인 전문가 위임** ( 권장 채택)

결단 정합 = 사용자 의도 = (i) schema 표준 정합 즉시 / (ii) PoC #11 rules.json 재라벨 = 도메인 전문가 위임 carry / (iii) 6 PoC schema-validator 일시 fail 허용 carry.

### 1.3. 4원칙 cycle

- ✅ **1원칙 plan** `~/.claude/plans/l-br-id-4-segment-enforcement.md` (7절 / scope 명확)
- ◯ **2원칙 sub-agent 토론** = schema 1줄 sprint = 가벼움 / 생략 ( 본 sprint 자체가 PoC 산물 검증 + 표준 정합 / research 의무 ❌)
- ✅ **3원칙 사용자 승인** = "Plan 원안 승인 + 즉시 착수" 결단
- ⏳ **4원칙 Lessons Learned** = 본 결단 §4 기록

---

## 2. 결단

### 2.1. schemas/rules.schema.json BR pattern 4토막+ strict 정합

```diff
- "pattern": "^BR-[A-Z0-9_-]+-\\d+$",
- "description": "규칙 ID (예: BR-ORDER-007)"
+ "pattern": "^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$",
+ "description": "규칙 ID ( 4토막 strict: BR-{도메인}-{이름}-{번호} / 예: BR-ORDER-CANCEL-001 / v2.3.7 enforcement)"
```

5토막+ 자연 허용 (`BR-ARTICLE-AUTHOR-EDIT-ONLY-001` ✅) — `[A-Z0-9_-]+` hyphen 매칭 정합.

### 2.2. 기타 schema description 예시 정합

3토막 예시 → 4토막 예시 갱신 (3 schema):

| schema                            | 변경                                   |
| --------------------------------- | -------------------------------------- |
| `domain.schema.json:181`          | `BR-ORDER-007` → `BR-ORDER-CANCEL-001` |
| `state-map.schema.json:269`       | `BR-AUTH-001` → `BR-AUTH-JWT-001`      |
| `meta-confidence.schema.json:159` | `BR-ORDER-007` → `BR-ORDER-CANCEL-001` |

`characterization-spec.schema.json:124` 의 `BR-USER-EMAIL-FORMAT-001` 예시 = 이미 4토막 ✅ (변경 ❌).

### 2.3. methodology-spec/id-conventions.md enforcement 강화

§ 규칙 4 항목 → **"v2.3.7 enforcement" label 명문화**:

> 4. **이름**: BR-{도메인}-**{이름}**-{번호} 만 이름 형식 유지 (예: BR-ORDER-CANCEL-001 / BR 은 비즈니스 의미 명시 의무 / 산업 BR 표준 정합). ** v2.3.7 enforcement** — schema-level strict pattern `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` 도입 / `rules.schema.json` + `planning-spec.schema.json` + `behavior-spec.schema.json` 모두 4토막+ 강제 / 3토막 (`BR-DOMAIN-001`) ❌ schema-validator fail. 5토막+ (`BR-ARTICLE-AUTHOR-EDIT-ONLY-001`) ✅ 자연 허용.

§ " v2.3.7 BR 4토막 enforcement 마이그레이션 carry" 신규 절 — 영향 6 PoC + 재라벨 규칙 + 일시 허용 carry 명시.

### 2.4. schema-validator unit test 3건 신규

`tools/schema-validator/test/chain-schemas.test.js` 안:

1. `  v2.3.7 — rules.schema.json BR 4토막 strict (3토막 → invalid)` — `BR-BILLING-005` 거부 검증
2. `  v2.3.7 — rules.schema.json BR 4토막 strict (4토막 → valid)` — `BR-USER-DATA-001` 통과 검증
3. `  v2.3.7 — rules.schema.json BR 5토막+ 자연 허용` — `BR-ARTICLE-AUTHOR-EDIT-ONLY-001` 통과 검증

**8/8 pass ✅** (전 8 test pass / 5 existing + 3 신규).

### 2.5. 6 PoC schema-validator 일시 fail 허용 carry

본 sprint release 후 ~ 재라벨 sprint 완결 시점까지 6 PoC schema-validator fail expected ( 도메인 전문가 위임 carry 의해 일시 허용):

| PoC                            | 현재 ID 형식      | carry                                                             |
| ------------------------------ | ----------------- | ----------------------------------------------------------------- |
| **#11 (사내 EFI-WEB Billing)** | `BR-BILLING-005`  | **C-rules-BR-id-relabel-PoC-11** ( critical / 도메인 전문가 위임) |
| #06 (사내 EFI-WEB Exchange)    | `BR-EXCHANGE-001` | C-rules-BR-id-relabel-5PoC                                        |
| #07 (사내 EFI-WEB Capital)     | `BR-CAPITAL-001`  | C-rules-BR-id-relabel-5PoC                                        |
| #08 (OSS jpetstore)            | `BR-PETSTORE-001` | C-rules-BR-id-relabel-5PoC                                        |
| #09 (OSS TypeORM raw SQL)      | `BR-RW-001`       | C-rules-BR-id-relabel-5PoC                                        |
| #10 (OSS JPA + QueryDSL)       | `BR-RAE-001`      | C-rules-BR-id-relabel-5PoC                                        |

§8.1 strict 검증대 영향 검증 의무 ( 신규 carry 항목에 명시).

### 2.6. chain harness 5 요소 변경 ❌ + backward-compat 보존

- chain-driver 자체 코드 수정 ❌
- 5 요소 (state.blocked + cli exit 2 + PreToolUse deny + suppressOutput + content-aware) 모두 보존
- rules.schema 강화는 chain harness scope 외부 = analysis stage 산출물 정합 영역

---

## 3. resolved / 신규 carry

### resolved 1

- **C-schema-br-pattern-fix** ( session 3차 PoC #11 chain 2 발견 trigger / behavior-spec.json br_refs schema pattern vs rules.json 형식 불일치)

### 신규 carry 2

- **C-rules-BR-id-relabel-PoC-11** ( critical / 도메인 전문가 위임 / PoC #11 rules.json BR-BILLING-\* 카테고리 재라벨 / chain 2 BHV br_refs 빈 array 보존 정합 / PoC #11 chain 3+4 진입 전 결단 의무 후보)
- **C-rules-BR-id-relabel-5PoC** ( PoC #06 / #07 / #08 / #09 / #10 rules.json 재라벨 / 별도 sprint)

### 보존 carry

- C-stack-결단-chain-3-4-plan (critical)
- C-OSS-Modern-chain-2-4-PoC08 (critical / ≥ 2 realworld 자격 trigger / v2.4.0 MINOR 자격 활성)
- C-모던-stack-사내-측정 (critical)
- C-chain-driver-state-retroactive-all-PoC (PoC #03~#10 + PoC #11 chain 3+4)
- C-adoption-findings-aggregator-workflow
- 그 외 (C-egovframework-sub-rule + C-domain-PoC11-1~3 + C-PoC07-1~3 + C-v2.2.0-1 + C-v2.3.0-gartner)

---

## 4. Lessons Learned ( session 7차 신규)

- **LL-i-19** ( "id-conventions 표준 vs schema enforcement 분리 잔존 패턴 자산화"): id-conventions.md 가 표준 명시했어도 schema-level enforcement 미달 시 PoC 별 표기법 drift 발생 사실. 본 sprint = 첫 정합 실시 사례 / 향후 동일 패턴 (UC/BHV/AC ID 표준 vs schema) 점검 의무. ** enforcement = 문서 명시 + schema 강제 + unit test 검증 = 3 layer 정합 의무**.
- **LL-i-20** ( "schema strict 화 → 기존 PoC fail = 표준 enforcement 의 자연 결과"): 6 PoC schema-validator fail = 잘못된 표기법의 자연 결과 / carry 명시 의무 / 재라벨 sprint 후 fail → pass 전환 검증 정식 절차. 사용자 결단 = "도메인 전문가 위임" = F-015 한계 회피 정합 (메인 sub-agent 자동 추정 ❌).
- **LL-i-21** ( "scope 최소화 + 영향 정직 보고 정합"): plan 초기 schema 6개 변경 예상 → 실제 조사 후 1개 변경 + 3개 description 정합으로 축소 사실 = "깊은 숙지 후 plan 조정" 4원칙 1원칙 정합 / scope creep 회피.

---

## 5. PATCH v2.3.7 자격 7/7

- ✅ chain harness 5 요소 변경 ❌
- ✅ schema 영역 변경 = 자연 PATCH 자격 (rules.schema pattern strict 화 = backward-incompat 단 표준 정합 / 영향 PoC = carry 처리)
- ✅ no new ADR
- ✅ workspace test 보존 + 신규 3 test pass
- ⏳ §8.1 strict 7/7 ( release-check 검증 예정)
- ✅ ≥ 6 PoC corroboration 보존
- ⏳ build OK + CHECKSUMS OK ( build 단계 검증 예정)

---

## 6. Version Bump (3-way sync)

| source                          | v2.3.6     | v2.3.7     |
| ------------------------------- | ---------- | ---------- |
| `.claude-plugin/plugin.json`    | `2.3.6`    | `2.3.7`    |
| `CHANGELOG.md` 첫 `## [vX.Y.Z]` | `[v2.3.6]` | `[v2.3.7]` |
| `package.json`                  | `2.3.6`    | `2.3.7`    |

`npm run version:check` 정합 검증 의무.

---

## 7. 후속

- **C-rules-BR-id-relabel-PoC-11** = 도메인 전문가 결단 sprint ( PoC #11 chain 3+4 진입 전 의무 / chain 2 br_refs 매핑 완성 trigger)
- **C-rules-BR-id-relabel-5PoC** = 별도 sprint ( PoC #06+#07+#08+#09+#10 일괄 재라벨 / v2.4.0 MINOR 자격 잠재)
- §8.1 strict 검증대 = 6 PoC fail 이 release 차단 시 plan 재검토 의무
