# DEC-2026-05-28-codegraph-probe-결과

**결단**: codegraph OSS bridge 통합 = **부분 continue** — Java/Spring layer 한정 본격 결합 자격 입증, iBATIS 2 sqlMap layer 효용 0. DEC-2026-05-27 §5.3 carry queue 자격 조건 (c) PoC ≥ 2 code_pointers 자산 1건 자연 충족. (a)·(b) 조건은 변동 없음 → 본격 carry 발동 ❌, 사실 1건 누적 / 후속 결단 대기.

**작성일**: 2026-05-28 (DEC-2026-05-27 1일 차 / probe live new project paradigm 시행 결과).

**relates to**:
- `DEC-2026-05-27-codegraph-integration-scope-out.md` §5.3 carry queue
- `~/.claude/plans/eventual-twirling-ritchie.md` (probe plan)
- `~/Documents/Development/Study/poc-15-codegraph-validation/` (PoC #15 / 사내 source 외부 위치 / 본 레포 외 격리)

---

## 1. 배경 (사실 sequence)

1. **2026-05-27 (DEC-2026-05-27)** = codegraph OSS bridge 통합 전면 scope-out + carry queue 3 신설.
2. **2026-05-28 본 session** = 사용자 결단 "codegraph 결합 적합성 fit 재판정" → plan 재작성 → live new project probe paradigm 채택 → 사내 legacy WAR 시스템 (Spring 4.1 + iBATIS 2 / 본 방법론 R1' axis 정조준 정합) 으로 mini scope (1 read-only endpoint × full chain 5 stage compare).
3. **probe 실시**:
   - codegraph v0.9.6 (npm i -g @colbymchenry/codegraph) 사용자 환경 설치 ✅
   - target 사내 source `codegraph init -i` 인덱싱 ✅ — 637 files / 10,551 nodes / 21,187 edges / 10.8s
   - analysis stage compare doc 작성 ✅
   - implement stage compare doc 작성 ✅
   - 사내 도메인 정보 비공개 / PoC #15 위치 = 본 레포 외 격리.

---

## 2. 결정적 사실 (probe 측정)

### 2.1 codegraph 인덱싱 통계 (R1' axis target)

```
637 files / 10,551 nodes / 21,187 edges / 42.94 MB SQLite / 10.8s
Nodes by Kind: method 4244 / import 1816 / function 1209 / field 1148 /
               variable 727 / file 607 / route 551 / class 192 / interface 47
Files by Language: javascript 335 / java 206 / xml 58 / properties 29 / php 4 / typescript 4
```

### 2.2 layer 별 codegraph 효용 (R1' axis 한정)

| Layer | 효용 | 근거 |
|---|---|---|
| Spring `@RequestMapping` → route 노드 추출 | ⭐⭐⭐ | route 551 노드 정확 |
| Java interface → impl → DAO 3단 매핑 | ⭐⭐⭐ | `callers method` = interface + impl + DAO 양방향 정확 |
| Cross-domain caller 자동 추출 | ⭐⭐⭐ | impact 결과에서 다른 도메인 controller·service 의 DI field 사용처 자동 발견 |
| Java string literal 안 sqlMap id 참조 | ❌ | tree-sitter 가 string literal 의미 추론 안 함 |
| iBATIS 2 sqlMap XML `<select id="...">` 노드 | ❌ | xml 은 file 노드 1개로 끝 |
| 흐름 end-to-end (URL → DB table) | ⭐ | Java layer 절반만 / sqlMap layer 끊김 |

### 2.3 codegraph v0.9.6 "MyBatis support" 의 정밀 범위

- v0.9.6 release notes "Spring/MyBatis flow trace" claim 부분 입증:
  - **Spring controller + DI + interface 호출 = ✅ 정확** (cross-domain 포함)
  - **iBATIS 2 (XML SQL Map 2.0 DTD) sqlMap mapper = ❌ cover 안 됨**
- MyBatis 3 mapper XML 의 cover 여부는 별도 OSS 측정 의무 (본 PoC scope 외).

### 2.4 chain-driver impact-analyzer 와 codegraph impact 비교

| 차원 | 우리 chain-driver | codegraph impact |
|---|---|---|
| 노드 단위 | artifact (UC/BHV/AC/TASK/TC/IMPL) | 코드 심볼 (method/class/route) |
| 추적 끝점 | IMPL 노드 → 파일 경로 leaf | 함수 호출 트리 transitive |
| Cross-domain 호출 | 사람 의존 / §3-A automation 한계 | **자동 추출** |
| 영향 등급 (MUST/SHOULD/FYI) | hard/soft 엣지 + confidence | flat list (등급 없음) — 후처리 filtering 의무 |
| 산출물 노드 영향 | ⭐⭐⭐ | ❌ (코드만 봄) |
| iBATIS 2 sqlMap 변경 | code_pointers strict_path 수동 | ❌ string literal 한계 |

→ **complementary** — 다른 layer 답해 줌. 본격 결합 시 codegraph noise = MUST/SHOULD/FYI 등급 분류 layer 가 필터.

---

## 3. carry queue 조건 자격 갱신 (DEC-2026-05-27 §5.3)

| 조건 | 어제 (2026-05-27) | 오늘 (2026-05-28) | 자격 |
|---|---|---|---|
| (a) 외부 사용자 자연 요구 ≥ 1 | 0건 | 0건 (단 R1' axis 실측 사실 1건 보강) | ❌ |
| (b) codegraph v1.0+ ≥ 6개월 maturity | 0.9.6 day-7 | 0.9.6 day-8 | ❌ |
| (c) PoC ≥ 2 code_pointers[] 채움 | 0건 | **1건 자연 충족** (PoC #15 / R1' Java layer) | △ (1/2) |

→ 3 조건 모두 충족 ❌. **본격 carry 발동 ❌**. 단 (c) 1건 자연 충족 = **사실 누적 paradigm 진전**.

---

## 4. 사상 정합 / 본격 결합 시 의무

### 4.1 사상 동질 ✅

- codegraph CLAUDE.md `"Extraction is deterministic — derived from AST, not LLM-summarized"` = 본 방법론 G2 LL-G2-04 (chain-driver 결정론 axis 오염 회피) 정합.
- codegraph CLAUDE.md `"Principle: partial coverage is WORSE than none"` = 본 방법론 §8.1 단일 PoC 과적합 회피 정합.

### 4.2 trust 모델 차이 (본격 결합 시 흡수 의무)

- codegraph CLAUDE.md `"the graph provides context, not requirements"` ≠ 본 방법론 결정적 게이트.
- 본격 결합 시 의무 = codegraph 결과를 **gate inject ❌** / **finding 으로만 수용** / **참고 lens 한정**.

---

## 5. 시행 (본 결단)

### 5.1 plugin 자산 변경 ❌

- schemas / tools / agents / skills / hooks / methodology-spec 0 변경.
- 본 DEC = pure doc trail / 사실 1건 누적.

### 5.2 자산 변경 list (실 file)

1. `ai-native-methodology/decisions/DEC-2026-05-28-codegraph-probe-결과.md` 신설 (본 file).
2. `ai-native-methodology/decisions/INDEX.md` head 추가.
3. `ai-native-methodology/decisions/STATUS.md` head 추가 (carry queue 자격 갱신 (c) 1/2).
4. `ai-native-methodology/decisions/DEC-2026-05-27-codegraph-integration-scope-out.md` §3 사실 추가 (probe 결과 link).

### 5.3 PoC #15 자산 처분

- `~/Documents/Development/Study/poc-15-codegraph-validation/` 그대로 보존 (본 레포 외 위치 / 사내 도메인 정보 격리).
- 본 레포 commit ❌ — 데이터 민감성 결단 (2026-05-28).
- 향후 carry 발동 시 본 PoC #15 = base reference 자산.

### 5.4 carry queue 갱신 (DEC-2026-05-27 §5.3 → 본 doc 보강)

| carry | 본 doc 시점 갱신 |
|---|---|
| `C-codegraph-bridge-design` | (a) ❌ / (b) ❌ / (c) 1/2 (PoC #15) — **본격 발동 ❌** / 1 PoC 추가 자격 시 발동 가능 |
| `C-scip-grammar-adoption-light` | 본 PoC 결과 무관 / codegraph 가 SCIP 무관임이 재확인 → 독립 axis |
| `C-tree-sitter-stability-verify` | 본 PoC 시점 codegraph 0.9.6 안정 (10.8s 인덱싱 / 0 crash) — 1 PoC 사실 누적 |

### 5.5 release 시행 ❌

- 본 결단 = pure doc trail / 실 plugin 자산 변경 0
- CHANGELOG entry ❌ (release 자체 ❌)
- version 3-way sync ❌
- STOP-3 ❌
- workspace test ❌ (영향 0)

---

## 6. Lessons Learned (자산화)

### LL-codegraph-05 — live new project probe paradigm 본격 입증

DEC-2026-05-27 §5.3 carry 조건 (c) "PoC ≥ 2 자격" 자연 충족 paradigm 본격 입증 사례. retroactive snapshot 비교 ❌ / live new project 측정 ✅ 으로 사실 1건 자연 누적. **자산화 의무** = "carry 발동 조건 자연 충족 paradigm = live measurement axis 우위 ↔ retroactive snapshot axis 한계 명시".

### LL-codegraph-06 — layer 별 효용 분리 측정 paradigm

본 PoC 결과 codegraph 효용 = layer 분리 측정 의무 입증. 단일 ⭐ 점수 부적합 / Java layer × XML mapper layer 분리. **자산화 의무** = "외부 OSS 결합 측정 시 본 방법론 stage × layer 매트릭스 의무 적용".

### LL-codegraph-07 — 사내 source 외부 위치 paradigm

본 PoC #15 = ai-native-methodology examples/ 밖 위치 / source 외부 절대경로 참조 / 본 레포 commit ❌. 사내 도메인 정보 격리 paradigm 본격 입증. **자산화 의무** = "사내 source 분석 PoC = 본 레포 examples/ 밖 위치 + source 외부 절대경로 참조 + 본 레포 commit ❌ (마스킹 의무 시 DEC doc 만 통해서 공개)".

---

## 7. References

- DEC-2026-05-27-codegraph-integration-scope-out.md — base scope-out 결단
- `~/.claude/plans/eventual-twirling-ritchie.md` — probe plan (본 PoC 진행 기록)
- `~/Documents/Development/Study/poc-15-codegraph-validation/compare/analysis-compare.md` — analysis stage 측정 raw
- `~/Documents/Development/Study/poc-15-codegraph-validation/compare/implement-compare.md` — implement stage 측정 raw
- `github.com/colbymchenry/codegraph` v0.9.6 — 측정 대상 OSS
- `feedback_self_referential_corrective_drift.md` — 본 결단 = 1 사실 누적 / R7 함정 회피 paradigm 정합

---

## 8. 한 줄 결론

> codegraph v0.9.6 R1' axis (Spring 4.1 + iBATIS 2) 측정 결과 = **Java/Spring layer ⭐⭐⭐ / iBATIS sqlMap layer 0 / end-to-end ⭐**. carry queue (c) 1/2 자연 충족. **본격 발동 ❌** / 사실 1건 누적 / 후속 결단 (a)·(b) 조건 충족 또는 추가 PoC 시 본격 결합 재진입 자격 갱신.
