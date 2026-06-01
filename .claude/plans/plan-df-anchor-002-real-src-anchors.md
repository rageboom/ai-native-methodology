# Plan — F-DF-ANCHOR-002: 그래프 노드 → 실 `src/main` production 코드 앵커

> **생성**: 2026-06-01 (session 60차) / 4원칙 §1 deliverable
> **carry**: `F-DF-ANCHOR-002` (v11.21.0 잔여 carry ①) + 연계 `C-codepointer-analysis-aspect-enrich`
> **목표**: living dep-graph 의 A2(content-drift)/A3(relocation) 동기화 루프가 **실 production 코드**(`src/main/java`) 변경을 실제로 탐지하도록 그래프 노드에 실 src 앵커 부여.
> **사용자 결단**: 다음 의제 = "dep-graph carry ① F-DF-ANCHOR-002" 선택 (2026-06-01).

---

## 1. 무엇을 / 왜 — 그리고 ★ 조사로 바뀐 프레이밍 (정직)

### 1.1 carry 의 본래 프레이밍과 실측 갭

carry 제목 = "**IMPL 노드** 실 src/main 앵커". 그러나 Phase 1 전수 조사 결과 프레이밍이 어긋남:

| 사실 | 근거 |
|---|---|
| RealWorld 그래프에 **IMPL 노드가 0개** | impl-spec.json 부재 (chain 이 discovery→spec→plan→test 까지만 / implement stage 미진입). 노드 = UC19/BHV19/AC25/TASK19/TC25 + analysis 8 |
| code_pointers 가진 노드 25개 = **전부 TC** → `generated-tests/`(생성 테스트 코드) | `git -C _dogfood node -e` 실측. `src/main` 으로 가는 앵커 **0건** |
| S2(AX전환 / 주 타깃) **정상 상태에는 IMPL 노드가 없음** | S2 = 기존 코드 특성화. "구현 생성" 단계 부재 → 기존 코드를 **describe 하는 analysis 산출물**이 production 코드의 자연 앵커 |
| ★ RealWorld analysis 산출물은 **이미 실 `src/main/java` 경로를 evidence 로 보유** | `business-rules.json`→`UserService.java`/`User.java`, `domain.json`→`DuplicatedArticleValidator.java`, `error-mapping-spec.json`→exception handlers, `sql-inventory.json`→mapper XMLs. **실 파일이 이미 문서화됨 — 단지 그래프 노드 code_pointers 로 surface 안 됨** |

→ **결론**: "A2 가 실 코드 변경을 탐지하게 하라"는 목표는 동일하되, 그 자연 carrier 는 IMPL 노드가 아니라 **analysis 노드**. 이건 연계 carry `C-codepointer-analysis-aspect-enrich`("Layer 1 backstop na 가 가린 부분")의 본체이기도 함. F-DF-ANCHOR-002 + C-codepointer-analysis-aspect-enrich 를 **한 슬라이스로 통합 해소** 가능.

### 1.2 왜 지금 이게 prod 가치인가 (self-referential drift 회피 점검)

- P0 가치 명세: "산출물 = LLM 운영 컨텍스트 / 평생 동기화하여 AX 운영". S2(주 타깃)에서 **analysis 산출물 = 기존 코드를 설명하는 운영 컨텍스트**. 이게 실 코드에 앵커돼야 코드 변경 시 노드가 `drift` 로 떨어져 "재분석 필요" 신호 발화 = 동기화 루프의 실 효용.
- 현재: 실 코드 무앵커 → A2/A3 가 RealWorld 에서 inert. 즉 "만들었지만 못 쓰는" 상태 = 사용자가 반복 경고한 바로 그 갭.
- self-referential 아님: 추측 hardening 이 아니라 **실 RealWorld 측정으로 드러난 inert 상태**를 해소 (v11.21.0 DEC 가 명시한 carry). dogfood-first.

---

## 2. 접근법 (scope trade-off) — ★ 사용자 결단 항목

### 접근 A — 합성기 derive (★ 추천 / 최소·additive·기존 데이터 활용)

graph-synthesizer 가 **이미 analysis 산출물에 존재하는 file-evidence 필드**에서 node-level `code_pointers` 를 derive. 기존 `ANALYSIS_TO_CHAIN_REFS` / `CHAIN_TO_ANALYSIS_REFS` 와 **동형의 per-kind accessor 표** 추가 (idiomatic / 합성기에 이미 2회 쓰인 패턴).

- **body 변경**: `graph-synthesizer.js` 1파일 (+ accessor 표 + derive 패스). **schema 무변경 / skill 무변경**.
- **derive 규칙** (보수적 / no-fabrication):
  - 각 analysis kind 별 "file-reference 필드 경로" 정의 (예: domain `bounded_contexts[].entities[].behaviors[]` 의 evidence + repositories[].implementation_class / business-rules `rules[].evidence[].file` / error-mapping `handlers[].source_file` / sql-inventory `inventory[].mapper_file` 등).
  - 확장자 화이트리스트(`.java/.xml/.ts/.kt/.py/.sql` 등) = `strict_path`. 디렉토리 ref(`src/main/java/io/spring/api`) = `glob`(`<dir>/**`) 또는 skip (false-anchor 회피).
  - 중복 제거 + 노드당 cap(예 ≤ 20) = 그래프 폭증 회피.
  - 추출 0건 → 기존 backstop `defaultNaForIntentNodes` 가 na=true (무회귀).
- **backstop 정합**: derive 가 backstop(`:558`) **이전**에 실행되면 hasPtr=true → backstop skip → 노드 covered (na 아님). 정합. na 는 floor, 실 앵커는 가용 시 우선 = 더 정직.
- **dogfood**: RealWorld 재합성(`--commit-hash <RealWorld HEAD ee17e31>`) → analysis 노드(domain/business-rules/error-mapping/sql-inventory 등) 실 src/main 앵커 → `code-pointer-validator --repo-root <RealWorld> --git` → A2 가 **실 production 파일 변경 탐지** 실측 (RealWorld 실 git history 의 과거 commit 을 baseline 으로 positive demo / repo 오염 ❌).
- **장점**: 최소 scope / schema·skill 무변경 / 이미 존재하는 실 데이터 surface (no-simulation 깨끗) / F-DF-ANCHOR-002 + C-codepointer-analysis-aspect-enrich 동시 해소 / P0 정합.
- **단점**: per-kind accessor = 휴리스틱(스키마 진화 시 표 갱신 필요 — 단 기존 2개 표와 동일 유지비용). 명시적이지 않음(→ 후속 A3 로 격상 가능).

### 접근 B — IMPL via S2 impl-spec (carry 제목의 문자 그대로)

implement skill 에 **S2 특성화 모드**(기존 코드 → impl-spec / 실 src 앵커 + 기존 repo commit_hash) 추가 + RealWorld impl-spec.json 생성.

- **body 변경**: implement skill 본문 (S2 mode) + impl-spec(heavy: test_pass_evidence/coverage/human_review 전부 required).
- **단점**: impl-spec 이 무거움(GREEN fresh 증거 전제) / S2 정상 상태에 IMPL 노드가 본디 없음 → 부자연 / scope 큼.

### 접근 C — analysis schema 에 명시적 `code_pointers` 필드 (full C-codepointer-analysis-aspect-enrich)

15 analysis schema 에 `code_pointers` optional 추가 + 각 analysis skill 본문 instruction.

- **body 변경**: 15 schema + 15 skill = DEC 가 명시한 "analysis skill **大 변경**".
- **장점**: 가장 명시적/robust 장기 설계. **단점**: 최대 scope → 후속 cycle 권장 (A 의 휴리스틱이 가치 입증 후 격상).

### ★ 권고 = **접근 A** (첫 슬라이스) + C 를 후속 carry 로 명시.

근거: 품질 1순위 + 재작업 최소 — A 는 (1) 기존 합성기 패턴 재사용 idiomatic, (2) 이미 존재하는 실 데이터 surface(날조 0), (3) RealWorld 즉시 dogfood 가능(analysis 재실행 불요), (4) F-DF-ANCHOR-002 + 연계 carry 동시 해소, (5) §8.1 비-gating 유지(content_drift medium). C 는 A 가 가치 입증 후 명시화 격상.

---

## 3. 범위 (접근 A 채택 가정 / 사용자 결단 후 확정)

### A. body (this repo / 합성기 only / additive)
1. `graph-synthesizer.js` — `ANALYSIS_TO_CODE_POINTERS` per-kind accessor 표 + `deriveAnalysisCodePointers(nodes, analysis, {repoRoot 무관})` 패스. backstop(`:558`) **이전** 호출. strict_path(file)·glob(dir) 분기 + 확장자 화이트리스트 + dedup + cap.
2. (필요 시) `kindNode` 가 derive 결과를 노드에 부여 (이미 `data.code_pointers` read 함 → derive 를 data 에 주입하거나 노드에 직접 set).
3. commit_hash 스탬프 경로(`:568`)가 derive 된 strict_path 에도 적용됨 확인 (graph-level commitHash → A2 baseline).

### B. test (this repo / additive)
- graph-synthesizer.test.js: derive 양성(evidence→strict_path) / dir→glob / 화이트리스트 외 skip / 추출0→backstop na 유지(무회귀 anchor) / dedup / cap / commit_hash 전파. (114 → ~120)
- 기존 110+ test 무회귀 (analysis fixture 에 evidence 없는 케이스 = na 유지).

### C. dogfood (외부 RealWorld repo / 본 repo 미커밋 / no-simulation)
- RealWorld 재합성(`--graph --commit-hash <ee17e31...>`) → analysis 노드 실 src/main 앵커 확인 (covered 증가 / 실 파일 경로).
- `code-pointer-validator --repo-root <RealWorld> --git` → A2 content_drift 실측: RealWorld 실 git history 과거 commit baseline → 변경된 production 파일 탐지 발화 (positive demo / 실 git / repo 오염 ❌).
- BEFORE/AFTER 비교: BEFORE analysis 노드 = na(앵커 0) → AFTER = covered(실 src 앵커 N) + A2 발화.
- 산출: RealWorld `.aimd/output/df-anchor-002-probe.md` (증거).

### D. release 판단
- body(합성기) 변경 발생 → 변경 있음 → schema-validator/release-readiness/STOP-3 후 **MINOR** 후보 (additive / breaking 0).
- §8.1: 단일 RealWorld 도메인 → A2 content_drift **non-gating 유지**(v11.20.0 cap). derive 메커니즘은 read-class·additive infra = gate-class 아님. "실 프로젝트에서 유용 drift 잡는다"의 usability threshold 격상 = ≥2 distinct 도메인 carry.

---

## 4. 리스크 / 사전 점검

| 리스크 | 판정 / 대응 |
|---|---|
| derive 휴리스틱이 false-anchor 생성 (dir 를 strict_path 로) | 확장자 화이트리스트 = strict_path / dir = glob 또는 skip. validator existsSync + git diff 로 2차 방어. |
| 기존 110+ 합성기 test 회귀 | derive 는 evidence 있을 때만 작동 / 없으면 backstop na 유지 = 기존 fixture 무영향. 추가 test 로 anchor. |
| release-readiness #16 회귀 | #16 = **정적** poc-05 graph read (재합성 ❌). poc-05 graph 재커밋 안 함 → 무영향 (session 56 확인). poc-05 analysis(domain) evidence 유무는 #16 불변. |
| A2 가 gate fail 유발 | content_drift = medium + computeGateFail 제외 (v11.20.0). --strict 와도 decouple. 무영향. |
| RealWorld repo 오염 (demo 위해 commit) | 실 git **history 과거 commit** 을 baseline 으로 positive demo → 신규 commit 불요 / 오염 0. |
| commit_hash 누락 시 A2 inert (F-DF-A2-001 재발) | v11.21.0 auto-stamp + dogfood 에서 `--commit-hash ee17e31` 명시 전달 = baseline 확보. |
| backstop philosophy 모순 ("analysis=na 가 정직") | 모순 아님 — na 는 floor(앵커 없을 때). 실 evidence 있으면 실 앵커가 **더 정직** + P0(코드 추적) 직접 봉사. C-codepointer-analysis-aspect-enrich 가 명시 예고한 부분. |

---

## 5. §8.1 정합 (정직 / cooling-off 폐기·strict·self-referential drift 회피 paradigm)

- 본 작업 = derive **메커니즘** + RealWorld 단일 도메인 dogfood. 메커니즘(accessor derive)은 결정론·additive·read-class infra → **gate-class 아님**.
- A2 content_drift 의 **usability**("실 프로젝트 유용 drift 탐지")는 단일 도메인 = inflate ❌ → **non-gating 유지**. gate-class 격상(예 A2 hard-gate / coverage threshold) = ≥2 **distinct** 도메인 corroboration 후 별 cycle.
- 후속 carry: ① C-codepointer-analysis-aspect-enrich **명시화 격상**(접근 C / schema+skill / 大) ② ≥2 distinct 도메인 A2 usability corroboration ③ A3 relocation dogfood.

---

## 6. 실행 순서
1. plan(본 문서) + §2 research → 사용자 묶음 결단 (접근 A/B/C + scope 확정).  ← **4원칙 §3 gate**
2. 접근 A body: 합성기 accessor 표 + derive 패스 (additive).
3. test 추가 + 전 workspace 무회귀 (981+ pass).
4. dogfood: RealWorld 재합성 + validator --git → A2 실 production 탐지 실측 + probe.md.
5. STOP-3(workspace / release-readiness 26/26 / skill-citation / version 3-way / breaking 0) → release 판단(MINOR 후보).
6. DEC + CHANGELOG + STATUS + memory + 사용자 commit/push 확인.

## 7. §2 research 종합 (3-agent / wf_07929e3d / 2026-06-01) → 설계 확정

### 7.1 official-docs (VERIFIED)
- **D-Q3**: `git diff A B -- <dir>` 는 **하위 전체 파일 재귀 포함** (git-scm 공식). → dir 앵커도 content-drift 에 유효. 단 strict_path 의미론(단일 파일)과는 별개 → dir 은 glob/skip 권장.
- **D-Q2**: SLSA 는 "resolved commit SHA 기록"을 권장하나 **drift baseline 용도는 SLSA scope 밖** → analysis-time HEAD baseline 은 합리적이되 SLSA 를 형식 근거로 **과대인용 ❌**.
- **D-Q1**: Figma Code Connect = **명시 선언 only**(추론 경로 없음) → A(derive)에 Figma 측 선례는 없음. 그러나 ↓ 산업 측 Sourcegraph/Storybook 이 derive 선례 제공.

### 7.2 industry-case (5 사례)
- **Sourcegraph (SCIP/LSIF)** = **A(auto-derive)의 최강 선례** — 명시 선언 없이 코드에서 추출, commit 단위. 단 심볼테이블 전제 vs 본 설계 evidence=자유텍스트경로 → **"auto-derived, best-effort" 표기 + 보수적**(Swimm conservative bias) 권고.
- **Storybook colocation** — 코드 옆 위치가 drift 구조적 방지. 본 설계 evidence 가 이미 실 경로 보유 = colocation 근사 → A 정당성 지지.
- **Figma Code Connect** = "명시만 / drift 탐지 無" = 반쪽 → **C(명시 schema)는 A2 drift 탐지와 세트일 때만 A 대비 이점**. 본 방법론은 A2 이미 보유 → A 로도 drift 탐지 확보.
- **두 결정 분리**: ① 최초 앵커 ② drift 탐지. A = ①auto-derive + ②기존 A2.

### 7.3 senior (GO @ **0.80**) — fragility 완화가 load-bearing
- A = 올바른 첫 슬라이스. **B reject**(S2 정상상태 IMPL 無 = paradigm drift). **C = 장기 옳으나 첫 슬라이스 아님**(15 schema breaking / ≥2 도메인 corroboration 전 premature).
- **evidence shape 비균일 (4종 확인)** → **per-kind 명시 field allowlist** (ANALYSIS_TO_CHAIN_REFS 동형). `*.java` 자동 재귀 ❌ (→ `persisted_to` **테이블명**·부수 문자열 오수집).
- **확장자 화이트리스트** emit 前 (`.java/.kt/.xml/.ts/.tsx/.js/.py/.sql/.go`) → table-name·dir false-anchor 차단.
- **★ path-prefix 문제** — `sql-inventory.mapper_xml="mapper/X.xml"` 는 repo-root 부재 (실: `src/main/resources/mapper/X.xml`) → naive derive = **false `path_missing`**. → **existence-gate** (존재 확인 후만 emit) 또는 resolving kind 로 scope.
- **order = derive→backstop** 정확 (derive 가 `:558` 前 node.code_pointers 채움 / 추출0 → backstop na). 정직 불변식 = derive 가 **미검증 경로 emit ❌**.
- **#16 회귀**: poc-05 graph 재합성+재커밋 시에만 위험 → **재커밋 안 함 = 무영향** (실측 확인: #16 = `POC05_GRAPH_PATH` 정적 read / 재합성 ❌ / poc-05 analysis 산출물 sparse).

### 7.4 ★ 확정 설계 (research 반영)
1. **per-kind accessor 표** `ANALYSIS_TO_CODE_POINTERS` (명시 field allowlist) — 첫 슬라이스 kind = **business-rules**(`business_rules[].source_evidence[].file`) + **domain**(`bounded_contexts[].aggregates[].invariants[].evidence[].file` + `value_objects[].evidence[].file`) + **error-mapping-spec**(`exception_handlers[].source_file` + `http_status_mapping[].evidence_file`). 모두 full `src/main/java/...` = resolving.
2. **확장자 화이트리스트** → strict_path. dir / 확장자 외 → skip (첫 슬라이스).
3. **existence-gate via 주입 predicate** — `synthesizeGraph({..., repoRoot?, existsFn?})`. default = `existsSync(join(repoRoot, p))` / **test 는 mock predicate 주입 = 결정성 보존** (110+ test 무회귀 / 미존재 경로 → 미emit = 현 na 거동 동일). 합성기 결정성·테스트성 유지 (execFileSync 미주입 = v11.21 purity 정합).
4. **dedup + cap (≤10/node)** — 그래프 폭증 회피.
5. **derive → `defaultNaForIntentNodes`(`:558`) 直前 호출** — hasPtr=true 면 backstop skip → covered / 추출0 → na.
6. **commit_hash 전파** — graph-level commitHash 스탬프(`:568`)가 derive strict_path 에도 적용 (A2 baseline). dogfood = `--commit-hash <RealWorld HEAD>` 명시.
7. **sql-inventory(mapper prefix) + architecture(dir)** = **후속 slice** (prefix-resolve / glob 설계 필요).
8. **builder cli.js** — optional `--repo-root` (default cwd) → existsFn 주입.
9. **§8.1**: derive 메커니즘 = read-class·additive·non-gating / A2 usability threshold 격상 = ≥2 distinct 도메인 carry.

## 8. Lessons Learned (시행 종결 / 2026-06-01)
- **LL-anchor-01 — carry 제목 프레이밍이 stage 현실과 어긋날 수 있음**: carry "IMPL 노드 실 src 앵커"가 S2(주 타깃) 현실(IMPL 노드 부재)과 모순 → Phase 1 전수 조사로 정정(analysis 노드가 정확한 carrier). 적극 반증 의무 정합 ([[feedback_senior_fact_check_supplement]]). carry 제목 ≠ 설계 명세.
- **LL-anchor-02 — "이미 있는 데이터 surface" = 최소 scope·최대 효용**: analysis 산출물이 이미 evidence 로 실 경로 보유 → 합성기 derive 가 schema·skill 무변경으로 13 앵커 확보. Sourcegraph SCIP auto-derive 선례 / Storybook colocation 동형. 신규 schema 필드(접근 C / 大)보다 우선.
- **LL-anchor-03 — existence-gate via 주입 predicate = 결정성 ∧ 정직성 양립**: `existsFn` 주입(default existsSync / test mock)으로 (1) 합성기 결정성 보존(execFileSync·fs 비결정성 미주입 / v11.21 purity 정합) (2) 실 synth 정직성(미존재 경로 emit ❌ = `mapper/` resource-prefix false `path_missing` 회피). DI 가 두 제약 동시 충족.
- **LL-anchor-04 — #16 정적 poc-05 read = 합성기 변경 gate 무영향**: release-readiness #15/#16 이 poc-05 의 **committed** artifact-graph.json 을 read(재합성 ❌) → 합성기 derive 추가가 gate 무영향 (poc-05 graph 재커밋 안 하는 한). 회귀 안전 핵심 = Senior 가 load-bearing 으로 지목.
- **LL-anchor-05 — dogfood A2 positive demo = unshallow 실 history (working-tree 무변경)**: shallow clone(depth1)이라 과거 baseline 부재 → `git fetch --unshallow`(read-only) 로 실 history 확보 → temp graph baseline=root commit → content_drift 14건 실 production 탐지. `git reset --hard` 회피(session-57 augmentation WIP 보존). no-simulation 정합.
