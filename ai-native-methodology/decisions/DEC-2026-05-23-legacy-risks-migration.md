# DEC-2026-05-23-legacy-risks-migration

> **일자**: 2026-05-23
> **session**: 35차 (현 session) / v8.12.0 MINOR release
> **카테고리**: methodology / 5 PoC 18 risks_and_constraints string → object form 마이그레이션 (legacy carry 청산)
> **상태**: 승인 ( 사용자 "ㄱㄱ" → "추천안 묶음 전체 시행" 2026-05-23 / D1~D7 7 cluster)
> **Resolves**: DEC-2026-05-23-risks-string-form-warn §7 carry C-legacy-risks-poc-migration (medium / 신규)
> **Cross-link**: v8.10.0 (polymorphic items) / v8.11.0 (forward warn lane) / v8.12.0 (legacy 청산) = paradigm 완결 cycle

---

## 1. 배경

v8.11.0 carry note 명시: "**사용자 결단 의무 — 정보 손실 risk 평가**". 5 PoC (poc-03/04-mini/05/06/07) 18 risks string items 의 object form 마이그레이션 = paradigm 완결 cycle 의 마지막 단계.

v8.10.0 polymorphic items 도입 + v8.11.0 forward warn lane 추가 후 → v8.12.0 legacy 청산 = 전 9 PoC object form 통일.

## 2. 실측 정보 손실 risk 평가 (4원칙 1단계)

### 2.1 18 items 카테고리 분포

| 카테고리                                                   | 항목 수 | 정보 보존             | 비고                 |
| ---------------------------------------------------------- | ------- | --------------------- | -------------------- |
| methodology (paradigm 본질 / 70~80% 한계 / 본체 격상 결단) | 6       | ✅ description 그대로 | " " → critical 1건   |
| environment (테스트 / DB / chain harness 부분)             | 5       | ✅ description 그대로 | "" → medium          |
| legacy-corpus (Spring 4.1 / SP / sql-inventory)            | 3       | ✅ description 그대로 | "" → medium          |
| legacy-domain (IFRS 회계 / SATD)                           | 2       | ✅ description 그대로 | " " → high 1건       |
| domain-expert-carry (ambiguous BR/AP)                      | 1       | ✅ description 그대로 | "" → medium          |
| architecture-carry (cross-module)                          | 1       | ✅ description 그대로 | prefix 부재 → medium |

### 2.2 정보 손실 risk = 0 (실측 입증)

- prefix → severity enum 자연 매핑 (critical/high/medium/low) — **paradigm 강조 신호 결정화**
- ID reference (BR-EXCHANGE-ANNUAL-005 등) → description 안 유지
- 수치 / 인용 (CLAUDE.md 정합 / plan §3-A 등) → description 안 유지
- 자유서술 paradigm 가치 → description 그대로 보존

  object form 마이그레이션 = **metadata 추가만** (id + severity + type) / description 자유서술 그대로 = 정보 손실 0 입증.

## 3. 결단 (사용자 묶음 결단 7 cluster)

| #   | 결단                                                                                                             | 채택 |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---- |
| D1  | 5 PoC 18 items 전수 마이그레이션                                                                                 | ✅   |
| D2  | severity prefix 기반 자동 매핑 (3=critical / 2=high / 1=medium / 0=low)                                          | ✅   |
| D3  | type 추론 (methodology / environment / legacy-corpus / legacy-domain / domain-expert-carry / architecture-carry) | ✅   |
| D4  | id 자동 (R-001 순차 / PoC 별 reset)                                                                              | ✅   |
| D5  | description 자유서술 그대로 보존 (정보 손실 0)                                                                   | ✅   |
| D6  | v8.12.0 MINOR (additive metadata 추가 / description 보존 / breaking 0)                                           | ✅   |
| D7  | 단일 session 시행 (cooling-off 불요 — 정보 손실 0 입증 + Senior REVISE-1 paradigm 완결 cycle)                    | ✅   |

## 4. 시행 (4원칙 4단계)

### 4.1 5 PoC 마이그레이션

| PoC                             | items | severity 분포                          | type 분포                                                                         |
| ------------------------------- | ----- | -------------------------------------- | --------------------------------------------------------------------------------- |
| poc-03-realworld-nestjs         | 2     | low 1 + medium 1                       | methodology + environment                                                         |
| poc-04-mini-realworld-react     | 2     | low 1 + medium 1                       | methodology + environment                                                         |
| poc-05-sample-user-register     | 2     | low 1 + medium 1                       | methodology + environment                                                         |
| poc-06-efiweb-exchange-spring41 | 6     | low 1 + medium 5                       | methodology + environment×2 + legacy-corpus + legacy-domain + domain-expert-carry |
| poc-07-efiweb-capital-spring41  | 6     | low 1 + medium 3 + high 1 + critical 1 | methodology×2 + legacy-corpus×2 + legacy-domain + architecture-carry              |

### 4.2 9 PoC 분포 (v8.12.0 완료 시점)

전 9 PoC = **object form 통일** (string=0 / object=46 / total=46).

| PoC                     | string | object    | 분류                   |
| ----------------------- | ------ | --------- | ---------------------- |
| poc-03/04-mini/05/06/07 | 0      | 2/2/2/6/6 | ✅ object (본 release) |
| poc-08/09/10/11         | 0      | 8/4/2/14  | ✅ object (v8.10.0)    |

### 4.3 자산 갱신

- 5 PoC planning-spec.json risks_and_constraints array 마이그레이션
- `plugin.json` 8.11.0 → 8.12.0 + `package.json` 8.11.0 → 8.12.0 (3-way sync)
- CHANGELOG v8.12.0 entry
- CLAUDE.md "plugin.json v8.12.0" sync + 현재 release 본문 갱신
- 본 DEC + INDEX 최상단 + STATUS session 35차

## 5. STOP-3 hard gate 실측

| Gate                                       | 결과                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| schema-validator 5 PoC                     | **5/5 VALID** ✅ (poc-03/04-mini/05/06/07)                                                 |
| chain-coverage-validator validateRisksForm | string_count = 0 (9 PoC 전수) ✅                                                           |
| 정보 손실                                  | **0** (description 자유서술 + prefix → severity enum 정합)                                 |
| breaking                                   | 0 = MINOR (additive metadata — id + severity + type / description 보존 / 기존 의무 제거 0) |
| §8.1 corroboration                         | 9 PoC 전수 object form = single-PoC overfitting 회피 ✓                                     |
| version 3-way sync                         | plugin.json 8.12.0 / package.json 8.12.0 / CHANGELOG v8.12.0 ✅                            |

## 6. Lessons Learned 신규

- **LL-validator-07** — paradigm 완결 cycle 본격 입증 (v8.10.0 schema 진화 + v8.11.0 forward warn lane + v8.12.0 legacy 청산) — 3 release 1 session = additive paradigm 결정적 차단 + 정보 보존 양립
- **LL-validator-08** — prefix → severity enum 자동 매핑 paradigm = 자유서술 paradigm value 보존 + 결정적 metadata 추가 양립 (DO-178C bidirectional traceability 강화 + drift attractor 0)
- **LL-validator-09** — "정보 손실 risk 평가" carry note paradigm = legacy migration 시 사용자 결단 의무 명시 = 실측 후 0 입증 시 시행 정당 / 무명시 마이그레이션 = drift attractor (legacy paradigm value silent 손실 risk)

## 7. 차기 session carry

| carry                      | 우선순위 | 비고                                                    |
| -------------------------- | -------- | ------------------------------------------------------- |
| C-xmllint-env-absent       | medium   | v8.9.0~v8.12.0 carry 보존 / Linux/Mac libxml2 환경 의무 |
| C-operation-md-work-folder | low      | v8.9.0 carry 보존 / docs/ 흡수 후보                     |

       **paradigm 완결 cycle 종결** — risks_and_constraints axis carry 0 / 차기 session carry = 환경/docs 한정.

---

**참고**:

- 직전 release: v8.11.0 (DEC-2026-05-23-risks-string-form-warn §7 carry C-legacy-risks-poc-migration)
- v8.10.0 polymorphic items 도입 + v8.11.0 forward warn lane + v8.12.0 legacy 청산 = **paradigm 완결 cycle 3 release**
- 본 session 4 release 누적 (v8.9.0 + v8.10.0 + v8.11.0 + v8.12.0) — dep-graph release ceremony → analysis_validator carry → Senior REVISE-1 carry → legacy carry 종결 cascade
