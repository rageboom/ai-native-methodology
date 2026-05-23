# DEC-2026-05-23-xmllint-tier1-migration

> **일자**: 2026-05-23
> **session**: 36차 (현 session) / v8.13.0 MINOR release
> **카테고리**: methodology / sql-inventory-validator Tier 1 in-plugin XML parser 격상 (xmllint → fast-xml-parser)
> **상태**: 승인 (★ 사용자 "ㄱㄱ" → "Option A: Tier 1 격상 (fast-xml-parser 도입)" 2026-05-23)
> **Resolves**: DEC-2026-05-23-legacy-risks-migration §7 carry C-xmllint-env-absent (medium / v8.9.0~v8.12.0 보존 carry)
> **Cross-link**: DEC-2026-05-18-runtime-tool-exclusion §R19 (Tool Ecosystem Dependency Classification) paradigm 정합

---

## 1. 배경

v8.9.0 release ceremony 안 carry "C-xmllint-env-absent" — sql-inventory-validator iBATIS test #25+#26 가 Windows 환경에서 fail (libxml2 binary 부재). v8.10.0/11.0/12.0 release 안 carry 보존.

본 session 35차 v8.12.0 종결 후 사용자 차기 carry 진행 결단 → 4원칙 ladder full:

- 1원칙 (실측): xmllint 역할 = iBATIS/MyBatis mapper XML 안 `<select>/<insert>/<update>/<delete>/<procedure>` tag count + inventory cross-check / 단순 XPath count
- 2원칙 (옵션 분석): A. Tier 1 격상 (Node-native fast-xml-parser) / B. Tier 2 보존 (영구 carry) / C. Dual (xmllint default + fallback)
- 3원칙 (사용자 결단): **Option A** — Tier 1 격상 (R19 paradigm 정합)
- 4원칙 (시행): 본 DEC + v8.13.0 release

## 2. R19 paradigm 정합 분석

DEC-2026-05-18-runtime-tool-exclusion §R19 (Tool Ecosystem Dependency Classification):
- **Tier 1** in-plugin (Semgrep + Spectral / Node-native)
- **Tier 2** user-environment SARIF import (PMD + SpotBugs + CodeQL + Daikon / JVM/CLI binary)
- **Tier 3** simulated 영구 reject

xmllint = libxml2 binary (C-native CLI / JVM 아니지만 OS-native) = **Tier 2 axis 상**.
fast-xml-parser = npm pure JS package = **Tier 1 in-plugin**.

★ R19 권고: "Tier 1 in-plugin 우선" — xmllint 가 Tier 2 였지만 Node-native 대체 존재 시 격상 정당. **본 release = R19 paradigm 본격 완결**.

## 3. 결단 (4 cluster)

| # | 결단 | 채택 |
|---|---|---|
| D1 | Option A — Tier 1 격상 (fast-xml-parser ^4.5.0 도입) | ✅ |
| D2 | field name backward-compat (xmllint_total / xmllint_version 보존 / value 만 `fast-xml-parser:<ver>` marker) | ✅ |
| D3 | `xmllint_unavailable` status 분기 제거 (v8.13.0+ 도달 불가 / dead code clean) | ✅ |
| D4 | v8.13.0 MINOR (additive — Node-native parser 격상 / breaking 0 / field 보존) | ✅ |

## 4. 시행 (4원칙 4단계)

### 4.1 sql-inventory-validator/package.json

- dependency 추가: `fast-xml-parser ^4.5.0`
- workspace version 0.2.1 → 0.3.0 (MINOR)

### 4.2 validator.js

- import 변경: `spawnSync` 제거 (sql-inventory-validator 한정) + `XMLParser from 'fast-xml-parser'` 추가
- `crossCheckLegacyXml(legacyXmlDir, inventoryCount)` 함수 본체 Node-native paradigm 격상:
  - xmllint probe 제거 (Tier 1 in-plugin)
  - `XMLParser({ ignoreAttributes:true, parseTagValue:false, isArray: tag => SQL_TAGS.has(tag) })` instantiate
  - 각 .xml file → `readFileSync` + `parser.parse` + `countSqlTagsRecursive`
  - 재귀 traversal: tag matching 시 count 누적 (Array면 length / 객체면 1) + children 도 traverse (nested mapper 대응)
  - SQL_TAGS = { select, insert, update, delete, procedure } (v8.7.1 patch 정합)
- `countSqlTagsRecursive(node, tagSet)` 헬퍼 함수 신설
- `xmllint_version` value: `fast-xml-parser:<pkg-version>` marker (Node-native 식별 / 양심 의존 ❌)

### 4.3 validator.js validateSqlInventory 본체 정합

- `if (crossCheck.status === 'xmllint_unavailable')` 분기 제거 (dead code clean)
- 이후 분기: `dir_missing` / `no_xml_files` / `ok` (zero / mismatch_critical / mismatch_high)

### 4.4 test 갱신

- v8.7 Layer 2 dir_missing test — `hasXmllintUnavail` 분기 제거 + `hasDirMissing` 단독 assertion
- v8.13.0 noter comment 추가 (paradigm 진화 explanation)

### 4.5 자산 갱신

- `plugin.json` 8.12.0 → 8.13.0 + `package.json` 8.12.0 → 8.13.0 (3-way sync)
- `CHANGELOG.md` v8.13.0 entry
- `CLAUDE.md` "plugin.json v8.13.0" sync + 현재 release 본문 갱신
- 본 DEC + INDEX 최상단 + STATUS session 36차

## 5. STOP-3 hard gate 실측

| Gate | 결과 |
|---|---|
| sql-inventory-validator test | **31/31 pass** ✅ (v8.7.1 iBATIS test #25+#26 회복) |
| workspace test | **690/690 pass** ✅ (v8.12.0 688/690 → v8.13.0 690/690 / 2 fail 회복) |
| release-readiness | **16/16 ready** ✅ (v8.12.0 15/16 → v8.13.0 16/16 / xmllint carry 종결) |
| version 3-way sync | plugin.json 8.13.0 / package.json 8.13.0 / sql-inventory-validator 0.3.0 / CHANGELOG v8.13.0 ✅ |
| breaking | 0 = MINOR (additive — Node-native parser / field name backward-compat) |

## 6. Lessons Learned 신규

- **LL-r19-01** — R19 paradigm 본격 완결 (Tier 1 in-plugin 우선) — Node-native 대체 존재 시 외부 binary 의존 제거 정당 / Windows env absent 영구 carry 회피
- **LL-r19-02** — field name backward-compat paradigm — `xmllint_total` / `xmllint_version` value 만 변경 (Node-native marker) / 호출자 API 정합 보존 / breaking 0 핵심 mechanism
- **LL-r19-03** — `xmllint_unavailable` status 분기 dead-code 제거 = Tier 1 격상 후 자연 결과 / paradigm 진화 시 dead-code 적극 정리 paradigm

## 7. 차기 session carry

| carry | 우선순위 | 비고 |
|---|---|---|
| C-operation-md-work-folder | low | v8.9.0 carry 보존 / work/dep-graph/operation.md 가 git tracked 아님 / docs/ 흡수 후보 |

★ ★ ★ ★ ★ ★ ★ ★ **본 session (33차~36차) 누적 5 release** = v8.9.0 (dep-graph ceremony) → v8.10.0 (schema 진화) → v8.11.0 (forward warn lane) → v8.12.0 (legacy 청산) → v8.13.0 (R19 Tier 1 격상). **2 carry 종결** (analysis_validator carry + Senior REVISE-1 carry + legacy carry + xmllint carry) / **1 carry 잔존** (operation.md / low).

---

**참고**:
- 직전 release: v8.12.0 (DEC-2026-05-23-legacy-risks-migration §7 carry C-xmllint-env-absent)
- DEC-2026-05-18-runtime-tool-exclusion (R19 paradigm SSOT)
- v8.9.0 ~ v8.12.0 carry 보존 (4 release) → v8.13.0 종결 (cascade 최종)
