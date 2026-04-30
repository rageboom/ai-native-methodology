# Phase 4.5 자동 검증 결과 — PoC #03 NestJS

> **일자**: 2026-04-30
> **도구**: drift-validator v0.1.0 + decision-table-validator v0.1.0
> **Source**: `output/formal-spec/.validation/{drift-result,dmn-check-result}.json`
> **재현 명령**:
> ```
> node ai-native-methodology/tools/drift-validator/src/cli.js examples/poc-03-realworld-nestjs/output/formal-spec/
> node ai-native-methodology/tools/decision-table-validator/src/cli.js examples/poc-03-realworld-nestjs/output/formal-spec/decision-tables/
> ```

---

## 1. drift-validator 결과 (state-machine + sequence)

### 1.1 정량

| 항목 | 값 |
|---|---|
| pair 수 (.json ↔ .mermaid) | 9 |
| breaking | **20** |
| non-breaking | 2 |
| info | 44 |
| errors (parse) | 0 |
| exit code | 1 |

### 1.2 짝별 결과

| 다이어그램 | breaking | non-breaking | info | 비고 |
|---|---:|---:|---:|---|
| state-machines/Article | 9 | 0 | 18 | ★ compound 1 + self-loop 3 진짜 drift / 5 도구 한계 |
| state-machines/Follows | 3 | 0 | 10 | ★ self-loop 1 진짜 drift / 2 도구 한계 |
| state-machines/User | 5 | 0 | 16 | ★ compound 1 진짜 drift / 4 도구 한계 |
| sequence/UC-ARTICLE-CREATE | 1 | 0 | 0 | ★ service self-loop 진짜 drift |
| sequence/UC-ARTICLE-FAVORITE | 0 | 1 | 0 | label drift (db / userrepo) |
| sequence/UC-PROFILE-FOLLOW | 0 | 0 | 0 | ✅ |
| sequence/UC-USER-DELETE | 1 | 0 | 0 | 도구 한계 (`-x` 변종 화살표) |
| sequence/UC-USER-LOGIN | 0 | 0 | 0 | ✅ |
| sequence/UC-USER-SIGNUP | 1 | 1 | 0 | ★ entity-return 진짜 drift + label drift |

### 1.3 분류 (수동 분석 — D6 권고 정합)

| 분류 | 건수 | 처리 |
|---|---:|---|
| **진짜 drift** (mermaid 보강 의무) | **~8** | ★ carry-over (Phase 4.5+1 다이어그램 보강) |
| **도구 한계** (F-117 transitionFuzzyMatch 재발) | **~12** | F-154 신규 finding + Sprint 5 carry-over |

### 1.4 진짜 drift (8건 — 다이어그램 보강 carry-over)

| # | Diff | 다이어그램 | 보강 안 |
|---|---|---|---|
| 1 | state.compound.missing — `persistingArticle` | Article.mermaid | `state PersistingArticle { ... }` 블록 추가 |
| 2 | state.compound.missing — `validatingLogin` | User.mermaid | `state ValidatingLogin { ... }` 블록 추가 |
| 3 | transition.missing — `published_count0 -[add_comment]-> published_count0` | Article.mermaid | self-loop 추가 |
| 4 | transition.missing — `published_count0 -[get]-> published_count0` | Article.mermaid | self-loop 추가 |
| 5 | transition.missing — `published_countN -[favorite_dup]-> published_countN` | Article.mermaid | self-loop 추가 |
| 6 | transition.missing — `following -[follow_request_dup]-> following` | Follows.mermaid | self-loop 추가 |
| 7 | message.missing — `service-sync->service` | UC-ARTICLE-CREATE.mermaid | self-message 추가 |
| 8 | message.missing — `entity-return->repository` | UC-USER-SIGNUP.mermaid | return arrow 추가 |

### 1.5 도구 한계 (12건 — F-154 finding 등록)

전부 **F-117 transitionFuzzyMatch 한계 재발** ★. compound state 안의 sub-state transition 이 outer transition 으로 elide / 매칭 못 됨.

| 다이어그램 | 도구 한계 transition |
|---|---|
| Article | creating-author_auto-creating / creating-slugify_random-persistingArticle / persistingArticle-insert_ok-published_count0 / persistingArticle-slug_collision-published_count0 / publishedcountn-favorite_dup self ← (★ self-loop 진짜 drift 와 분리) |
| Follows | checkingSelfId-reject_self_id-following / validatingUnfollow-reject_null-following |
| User | checkingDuplicate-duplicate_found-anonymous / hashingPassword-argon2_hash-persistingUser / persistingUser-race_race_window-anonymous / persistingUser-before_insert_hook-hashingPassword |
| Sequence (`-x` 화살표) | UC-USER-DELETE Controller-AuthMiddleware (★ `-x` 변종) |

### 1.6 D6 false negative 측정

직전 세션 합의: drift-validator 가 미검출하나 사람이 발견하는 케이스 정량.

본 결과: drift-validator 가 **20 breaking 중 12건 = 60% 가 false positive (도구 한계)** 인 반면 false negative 는 본 phase 에서 측정 자료 부족 (다이어그램 vs 코드 직접 비교 = Sprint 5 carry-over). **F-154 도구 한계 ROI 정량 = 60% false positive (★ Sprint 5 transitionFuzzyMatch 보완 핵심 데이터)**.

---

## 2. decision-table-validator 결과

### 2.1 정량 (1차 — fix 전)

| 항목 | 값 |
|---|---|
| BR markdown file | 6 |
| breaking | 6 |
| non-breaking | 0 |
| info | 0 |

→ **모든 6 BR JSON `current_state` 가 enum 위반** (한국어 prefix "★ partial — ..." vs schema enum {complete, partial, absent, needs_review}).

### 2.2 정량 (2차 — fix 후 ✅)

| 항목 | 값 |
|---|---|
| breaking | **0** ✅ |
| non-breaking | 0 |
| info | 0 |
| exit code | 0 |

### 2.3 fix 내용

`current_state` → 순수 enum 값 (`partial` / `absent`) + `current_state_note` 신규 필드로 추가 정보 분리. 6 파일 모두 동일 패턴.

### 2.4 dmn-check 5종 결과

- rule.duplicate: **0** ✅
- rule.conflict: **0** ✅
- rule.gap: **0** ✅
- rule.overlap: **0** ✅
- type.mixed-column: **0** ✅

→ **모든 6 BR markdown 표가 dmn-check 5종 통과**. heuristic parse OK (한국어 헤더 인식 ✅).

---

## 3. 신규 finding (F-154 ~ F-156)

| ID | severity | summary | 근거 |
|---|---|---|---|
| **F-154** | medium | drift-validator transitionFuzzyMatch 한계 재발 — compound state 안 sub-state transition 이 outer 로 elide 못 됨 (12/20 = 60% false positive) | drift 결과 §1.5 |
| **F-155** | low | sequence diagram `-x`/`-)` 변종 화살표 미인식 — UC-USER-DELETE 진단 false positive | drift 결과 §1.5 |
| **F-156** | low | decision-table JSON `current_state` 가 한국어 prefix + 부가 설명 사용 — schema enum 위반 (6 BR 모두 동일) | dmn-check 결과 §2.1 |

---

## 4. ★★ 도구 외부 검증 ROI (메타 finding)

본 검증이 **drift-validator + decision-table-validator 의 첫 외부 적용** (PoC #03 자가 검증). 결과:

### 4.1 ROI 입증

- **dmn-check 6 enum 위반 자동 검출** → 1줄 fix 가능 (수동 검토로 놓치기 쉬운 schema 위반)
- **drift-validator 20 breaking 중 8건 진짜 drift 자동 검출** → 다이어그램 보강 우선순위 정량
- **dmn-check 5종 본체 0 hit** → BR 표 dmn 정합성 검증 OK

### 4.2 한계 노출 (Sprint 5 carry-over)

- **F-154**: transitionFuzzyMatch 한계 = 60% false positive
- **F-155**: sequence `-x` 변종 화살표 미인식
- corpus 4쌍 → 20쌍 확장 필요 (Sprint 5 carry-over 유지)

### 4.3 PoC #02 자가 검증 결과 비교

| 도구 | PoC #02 (Sprint 4) | PoC #03 (본 세션) |
|---|---|---|
| drift-validator | state-machine 7 breaking + decision-table 3 non-breaking | state-machine 17 breaking + sequence 3 breaking |
| dmn-check | (Sprint 4 외부 적용 시 0 hit) | 6 enum 위반 (1차) → 0 (fix 후) |
| 도구 한계 finding | F-117 (transitionFuzzyMatch) | **F-154 ★ 재발 입증** + F-155 신규 |

→ **F-117 재발 = Sprint 5 transitionFuzzyMatch 보완 우선순위 격상** ★★.

---

## 5. 신뢰도 변동 (D5 권고 정합)

```yaml
before_validation: 0.70
after_validation:
  drift-validator 실행 (carry-over 해소): +5
  decision-table-validator 실행 (carry-over 해소): +5
  drift breaking ≥ 1 (진짜 drift 8건 carry-over): -3
  current_state enum fix 완료: 0  # dmn breaking 0 도달
  total: +7
after: 0.77  # 70 + 7
```

→ **0.77 (단계 2.5 = 자동 검증 부분 통과 — ADR-009 단계 3 도달까지는 다이어그램 보강 carry-over)**.

---

## 6. 결론

- ✅ Phase 4.5 자동 검증 1차 완료
- ✅ dmn-check 6 enum 위반 즉시 fix
- ⏳ drift-validator 진짜 drift 8건 = 다이어그램 보강 carry-over (Phase 4.5+1)
- ⏳ 도구 한계 12건 = F-154/F-155 finding + Sprint 5 carry-over
- ★ 신뢰도 0.70 → 0.77 (+7p / 단계 2 → 단계 2.5)

**End of validation summary.**
