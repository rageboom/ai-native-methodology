# DEC-2026-05-08-poc-09-prelim-신설

> **카테고리**: methodology / PoC 등재 (prelim) / ★ ★ ★ paradigm + platform-cross **strong** corroboration / ★ v2.2.0 final 격상 trigger 핵심
> **상태**: 진행중 (★ prelim — Day 0.5~ 정탐 + plan 2차 + 4원칙 3원칙 사용자 승인 + Day 1 진입)
> **일자**: 2026-05-08 (skeleton + 본 session prelim)
> **선행**: DEC-2026-05-07-poc-08-종결 (★ MEDIUM corroboration #1 사실 확보) + DEC-2026-05-08-v2.2.0-rc1-prerelease (★ paradigm-cross carry C-v2.2.0-6b origin)
> **후속**: PoC #09 plan 2차 (정탐 흡수) + Day 1~3.5 (별도 session) + v2.2.0 final 격상 결단 (PoC #08+#09 합산 / cooling-off 후 2026-05-15+)

---

## 1. 결단

PoC #09 (TypeORM raw SQL / TypeScript / Node.js) 정식 prelim 등재. ★ ★ ★ ★ **v2.2.0 final 격상 trigger 핵심** (★ paradigm + platform-cross strong corroboration / C-v2.2.0-6b resolve trigger). 14d cap (실측 ~3~4일).

★ ★ 사용자 결단 (β) 2026-05-07 정합: "우선순위 2, 3, 4, 후속 연달아 다 진행" 흡수 → PoC #08 (paradigm-cross MEDIUM) ✅ 종결 후 PoC #09 (paradigm-cross strong) 우선 진입.

PoC #09 **prelim** 등재 — 정식 PoC #09 등재는 별도 session 첫 plan 2차 + 정탐 + Day 1~3.5 측정 종료 + 4축 metric (3/4 이상 pass) 결과 기반 별도 결단.

## 2. 배경

- PoC #08 (jpetstore-6 Modern Java MyBatis 3) 종결 = MEDIUM corroboration / non-isomorphic in the hard direction → ★ paradigm-cross strong 의무 (★ Senior STOP signal 정합)
- carry C-v2.2.0-6b (PoC #09 / TypeORM raw SQL) = ★ v2.2.0 final 격상 trigger 핵심 자격
- 사용자 결단 (β) "다 진행" 정합 / Auto Mode 진행

## 3. 측정 대상 (4축 / PoC #08 패턴 정합)

1. **§3-A 분석 자동화율** — TS regex 정확도 측정 (★ XML 대비 ↓ 가능성 / Modern stack ↑ 가능성 / 추정 55~65%)
2. **§3-B 설계 자동화율** — chain 1 planning-extraction-validator 통과 (0 critical / UC ≥ 90%)
3. **phase 4.7 acceptance oracle** — Modern stack ambiguous ↓ 예상 / named_classified_ratio ≥ 80%
4. **★ ★ ★ ★ SQL Inventory coverage** (★ ★ ★ v2.2.0 final 격상 trigger 핵심 측정) — 외부 6 컬럼 자동 추출 ≥ 50% 자격 → paradigm-cross strong 입증

## 4. paradigm 거리 (vs PoC #06+#07+#08)

| dimension | iBATIS 2 / MyBatis 3 (Java) | TypeORM raw SQL (TS / Node.js) | 거리 |
|---|---|---|---|
| 언어 | Java | TypeScript | ★★★ paradigm |
| Runtime | JVM | Node.js | ★★★ platform |
| Mapper 양식 | XML / annotation | TS (`query()` / `createQueryBuilder()` / 또는 string template) | ★★★ paradigm |
| `<bind>` OGNL | ✅ | ❌ (TS expression) | ★★★ |
| dynamic SQL | XML tags | TS 조건문 / template literal | ★★★ |
| 매개변수 binding | `#{}` named | `$1, $2` positional 또는 `:name` named | ★★ schema 정합 |
| Result mapping | resultType / resultMap | TS interface 또는 raw row[] | ★★★ |

→ ★ ★ ★ ★ **strong corroboration 자격** — Java→TS / JVM→Node.js / XML→inline TS / paradigm + platform-cross 동시.

## 5. ★ source 결정 후보 (정탐 + 사용자 결단 carry)

후보 OSS:
- (a) `gothinkster/realworld` 의 typeorm 변종 (★ ★ realworld 표준 / 본 방법론 v1.4 FE 트랙 정합 / 권위 ★)
- (b) `nestjs/nest` examples 의 typeorm sample (★ NestJS + TypeORM)
- (c) `typeorm/typeorm` 자체 sample directory
- (d) realworld typescript backend (★ NestJS + TypeORM 또는 Express + TypeORM) 검색

★ 정탐 후 결단 의무. 본 PoC source 결정 = ★ raw SQL (★ `query()` 또는 `createQueryBuilder()`) 명시 사용 의무 (본 PoC 본질). repository 자체가 ORM annotation 단독이면 ❌.

## 6. scope 제한

### 포함

- TypeORM realworld OSS source (★ source 결정 carry / 정탐 후 결단)
- analysis 4종 + ★ SQL Inventory 11 컬럼 (★ phase 4.8 본체 자산 paradigm-cross strong 진입)
- phase 4.7 + chain 1
- v2.1.1 ratchet trend baseline write (Modern Node.js stack 첫 진입)

### ★ ★ 명시적 제외

- chain 2~4 본격 진입 (PoC #08 패턴 정합 / 본 PoC scope 외)
- ★ ★ ★ **본체 격상 ❌** (★ §8.1 strict / v2.2.0 final 격상 = PoC #08 + PoC #09 종결 + cooling-off 합산 별도 결단)

## 7. ★ ★ ★ §8.1 strict 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:

| 자산 | 본체 격상 자격 | carry ID |
|---|---|---|
| phase 4.8 sql-inventory v2.2.0 final 격상 | ★ paradigm-cross strong corroboration 입증 후 = PoC #08 (MEDIUM #1) + PoC #09 (strong #2) 합산 자격 | ★ ★ C-v2.2.0-6 = PoC #08+#09 종결 후 resolve |
| TypeORM raw SQL spectrum sub-rule | PoC #09 종결 시 자격 충족 | (PoC #09 종결 시 carry 신설) |

본 PoC 의미 = (1) paradigm + platform-cross strong corroboration 사실 확보 + (2) TypeORM raw SQL spectrum 측정 사실 + (3) ★ phase 4.8 sql-inventory 본체 자산 paradigm shift robust 입증.

## 8. 작업 시퀀스 (PoC #08 패턴 정합)

| Day | 작업 | 시간 | 산출 | 본 session? |
|---|---|---|---|---|
| 0 (★ 본 session) | DEC prelim + skeleton + plan 1차 | ~30min | 본 DEC + skeleton + plan 1차 | ✅ |
| 0.5 | 정탐 (3 sub-agent 병렬 / TypeORM realworld OSS source 결정 + paradigm 거리 + 4축 expectation) | ~2h | research-poc-09 | ⏳ 별도 session 또는 본 session 진행 |
| 1 | source clone + analysis 4종 | ~3~4h | source + input/4종 | ⏳ 별도 session |
| 1.5 | sql-inventory 11 컬럼 측정 (★ ★ ★ v2.2.0 final 격상 trigger 핵심) | ~1~2h | sql-inventory.{json,md} | ⏳ 별도 session |
| 2 | phase 4.7 (snapshot + intent-vs-bug + coverage) | ~3~4h | characterization/ | ⏳ 별도 session |
| 2.5 | D2 ambiguous 결단 | ~1h | 결단 갱신 | ⏳ 별도 session |
| 3 | chain 1 + validators + ratchet baseline write | ~2h | .aimd/output + .aimd/baseline | ⏳ 별도 session |
| 3.5 | REPORT + DEC 종결 + STATUS + INDEX + carry resolve | ~2h | REPORT + DEC 종결 | ⏳ 별도 session |

★ 누적 ~14~18h (~3~4일 실측 / 14d cap ★ 충분 여유).

## 9. 종결 조건 (a/b/c)

- (a) 4축 모두 pass (3/4 이상 자격) — 본체 격상 trigger 자격 충족
- (b) ★ ★ ★ SQL Inventory 4/6 ≥ 50% 자격 충족 = paradigm-cross strong corroboration 입증 = ★ ★ ★ ★ v2.2.0 final 격상 trigger 활성
- (c) 4축 1축 이상 fail — 본체 격상 ❌ / Senior STOP signal 강화 + carry 분석

## 10. carry 매핑

- **★ ★ ★ C-v2.2.0-6b** (★ v2.2.0 final 격상 trigger 핵심 / 본 PoC 종결 시 resolve trigger 활성)
- C-PoC09-source-결정 (★ TypeORM realworld OSS source 정탐 후 결단)
- C-PoC09-typescript-paradigm-cross (★ Java → TS paradigm shift / sql-inventory schema 정합 의무)
- C-PoC09-domain-결정 (★ 정탐 결과 도메인 결단 / pet store / blog / 다른?)

## 11. 다음 PoC 단계

PoC #09 종결 후:
- ★ ★ ★ ★ **v2.2.0 final 격상 결단** = PoC #08 (MEDIUM) + PoC #09 (strong) 합산 + cooling-off 7d minimum 후 (2026-05-15+) 별도 결단
- PoC #10 (JPA QueryDSL / DSL builder) = v2.3.0 minor / 별도 session prelim
- ★ PoC #11 (EFI-WEB billing) = source 위임 도착 시 우선순위 #1 복귀 / 사내 ROI axis

## 12. 참조

- README: `examples/poc-09-realworld-typeorm-rawsql/README.md`
- PoC #08 종결: `decisions/DEC-2026-05-07-poc-08-종결.md`
- v2.2.0-rc1 prerelease: `decisions/DEC-2026-05-08-v2.2.0-rc1-prerelease.md`
- 사용자 결단 (β): "우선순위 2, 3, 4, 후속 연달아 다 진행"
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"
