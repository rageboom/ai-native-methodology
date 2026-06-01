# plan — Living-graph Slice 2: code-pointer enrich (sql-inventory + architecture)

> carry: **C-codepointer-analysis-aspect-enrich** (session 60 / v11.22.0 잔여 ①)
> 접근: **접근 A 연장** (additive evidence-derive / schema·skill 무변경 / graph-synthesizer.js only)
> 대상 버전: **v11.23.0 MINOR** (read-class infra / breaking 0)
> 작성: session 61차 / 2026-06-01 / `/clear` 후 "계속 진행" → AskUserQuestion → "Living-graph Slice 2" 선택

## 0. 한 줄 요약

v11.22.0 가 business-rules/domain/error-mapping 노드를 실 src 에 앵커. Slice 2 = **sql-inventory(mapper resource-prefix resolve → strict_path)** + **architecture(module dir → glob anchor)** 두 analysis kind 도 실 코드에 앵커 → 그래프가 SQL mapper layer + module 디렉토리까지 cover. sql-inventory 의 strict_path mapper XML 은 **A2 content-drift 에 참여**(실 P0 가치) / architecture glob dir 은 A2 제외(dir-diff false-drift 회피, 의도적) = navigation·coverage 가치.

## 1. 현 상태 (Phase 1 깊은 숙지 결과 / 전수 확인됨)

### 1.1 v11.22.0 가 깐 인프라 (graph-synthesizer.js)
- `ANALYSIS_TO_CODE_POINTERS` = `{kind → accessor(data)→string[]}` (business-rules / domain / error-mapping-spec).
- `deriveAnalysisCodePointers(nodes, analysis, {existsFn})` — active analysis 노드 + code_pointers 부재 시: `hasCodeExtension` 게이트 → dedup → `existsFn` existence-gate → `{path, anchor_type:'strict_path'}` → cap 10.
- `effectiveExistsFn` = 주입 existsFn 우선 / 미주입 시 `existsSync(join(repoRoot??cwd, p))`.
- commit_hash 스탬프 루프: `strict_path` pointer 에만 commit_hash 부여 (glob/ast_symbol/doc_link 제외 = A2 false-drift 회피, line 653).
- 호출 순서: `deriveAnalysisCodePointers` → `defaultNaForIntentNodes`(backstop na) → commit_hash 스탬프. (정직 불변식: derive 실패 → backstop 가 na 처리.)

### 1.2 두 신규 kind 의 실 데이터 형태 (RealWorld dogfood / 실측)
- **sql-inventory**: `inventory[].mapper_xml` = `mapper/UserMapper.xml` 류 (10 distinct / 44 records). **bare path 는 repo-root 에 부재** / 실 파일 = `src/main/resources/mapper/UserMapper.xml` (10개 전부 존재 확인). `.xml` = code 확장자 ✓. sentinel ('inline'/'jpa'/'typeorm'/'prisma') = 확장자 없음 → hasCodeExtension 자동 필터.
- **architecture**: `modules[].path` = `src/main/java/io/spring/api` 류 (12 modules). **repo-root 상대 디렉토리** (prefix 불요). 확장자 없음 → 현 hasCodeExtension 게이트가 거부 (dir).

### 1.3 consumer (code-pointer-validator) 계약 (전수 확인됨)
- **strict_path**: `existsSync(join(repoRoot,path))` → 부재 시 path_missing (medium/strict high). 존재 + commit_hash → A2 content-drift (medium 고정 / non-gating).
- **glob**: `pat = glob ?? path`. pat 에 `*` 없으면 `existsSync(full)` (= dir 도 true) → 매칭. `*` 있으면 depth-1 단일 wildcard 만 (★ `**` 미지원 — `glob:'**/*'` 부여 시 glob_no_match!). → **dir anchor = `{path:dir, anchor_type:'glob'}` (glob 필드 부재)** 가 정답.
- **coverage**: node 당 covered(pointers≥1) / na(code_pointers_na) / missing. → 두 노드 na→covered 이동.
- builder cli.js: `architecture.json` + `sql-inventory.json` 이미 `analysis[kind]` 로드 + `--repo-root`/`--commit-hash` 전달. **CLI 무변경.**

### 1.4 RealWorld 현 측정 (session 60 / v11.22.0)
- covered=28 / na=87 / missing=0 / ratio 100%. analysis-sql-inventory + analysis-architecture = na fall-through.

## 2. 설계 (접근 A 연장 / graph-synthesizer.js only / additive)

### 2.1 `ANALYSIS_TO_CODE_POINTERS` 형태 일반화 (kind→config)
```
{ kind → { mode:'file'|'dir', accessor:(d)=>string[], prefixes?:string[] } }
```
- business-rules / domain / error-mapping-spec: `mode:'file'` (accessor = 기존 그대로 / prefixes 기본 `['']`) → **거동 byte-identical**.
- **sql-inventory (신규)**: `mode:'file', prefixes:['', 'src/main/resources/', 'src/main/resources/mybatis/'], accessor:(d)=>(d?.inventory??[]).map(r=>r?.mapper_xml)`. (★ research REVISE-A: mybatis/ variant 추가 = 외부 robustness / existence-gate 가 첫 존재 경로만 채택 → false-positive 0.)
- **architecture (신규)**: `mode:'dir', accessor:(d)=>(d?.modules??[]).map(m=>m?.path)`.

### 2.2 `resolveAnchor(raw, cfg, existsFn)` 헬퍼 (신규)
- 빈 문자열/비-string → null.
- **dir mode**: 확장자 게이트 skip. existsFn 게이트(미주입 시 통과=best-effort) → `{path:raw, anchor_type:'glob'}` (glob 필드 부재 = validator existsSync dir 매칭).
- **file mode**: `hasCodeExtension(raw)` 게이트 → prefixes 순회 `candidate = pfx+raw` (pfx 는 trailing `/` 포함) → 첫 existsFn-통과 candidate 를 `{path:candidate, anchor_type:'strict_path'}` 반환. existsFn 미주입 시 첫 candidate (no-gate best-effort / 실 경로엔 항상 effectiveExistsFn 존재).

### 2.3 `deriveAnalysisCodePointers` 루프 일반화
- dedup 키 = **resolved `ptr.path`** (prefix 해소 후 경로 / sql-inventory 같은 mapper 중복 → 1 pointer).
- 나머지(active 게이트 / code_pointers 보유 시 skip / cap) 무변경.

### 2.4 불변 보존 (회귀 0 의무)
- business-rules/domain/error-mapping = mode 'file' prefixes `['']` → 기존 12 test 전원 그대로 (특히 test 4 dir 거부 / test 5 mapper prefix 미해소).
- **prefix 해소는 kind-specific** — business-rules 의 `mapper/X.xml` 은 여전히 미해소(na). sql-inventory 만 resource-prefix.
- glob anchor → commit_hash 미스탬프 (기존 stamp 루프 strict_path 한정 / A2 제외 자동).
- na backstop: derive 성공 노드(pointers≥1)는 `defaultNaForIntentNodes` 가 hasPtr=true 로 skip → na_conflict 0.

### 2.6 research 종합 (wf_8a8aa7ef / 3-agent / 2026-06-01)
- **docs (GO_WITH_REVISE @0.88)**: MyBatis mapper XML 표준 = `src/main/resources/mapper/` (RealWorld repo + MybatisProperties.java 공식 소스 cross-check) ✓. prefix `['', 'src/main/resources/']` RealWorld 일치 ✓. SCIP proto 엔 glob/tree anchor 개념 없음 → glob = SCIP 영감 자체설계로 표기(SCIP 표준 주장 ❌). REVISE: prefix 에 `src/main/resources/mybatis/` 추가 or scope-out 명시.
- **industry (GO @0.88)**: 6 isomorphic case — Spring PathMatchingResourcePatternResolver(ordered prefix try) / Maven Standard Layout(src/main/resources=classpath root, 20년 표준) / MyBatis Spring Boot(`classpath:mapper/*.xml`) / **LSP 3.17(directory-level glob anchor / pattern 생략=dir 단위)** / **IntelliJ content root(module=directory 좌표)** / SCIP(repo-root 상대 path). commit_hash strict_path-only + glob A2-제외 = LSP file-watching dir vs file granularity 와 동형.
- **senior (GO_WITH_REVISE @0.83 / 코드라인 cross-check)**: byte-identical 보존 검증(prefixes=[''] discipline) / node-id·field schema-canonical 정합 / sentinel 확장자 자동필터 / dir-as-glob A2-제외 코드거동 일치 / glob:'**/*' 부여 시 simpleGlobMatch depth-1 한계로 glob_no_match → **glob 필드 부재가 정답** / determinism·additive 확인.

### 2.7 흡수한 REVISE 5종 (전부 additive / 코어 설계 무변경)
- **A** prefix 후보 `['', 'src/main/resources/', 'src/main/resources/mybatis/']` 3종 + `src/main/java/` 임베디드 XML = 의도적 scope-out(existence-gate→na 정직) 명시.
- **B** file-kind 마다 prefixes **명시 선언**(전역 기본값 의존 ❌ / `?? ['']` 는 방어 default) + kind-specific 불변식 코드주석 + 회귀 test ④ (business-rules 여전히 prefixes=[''] → test 4/5 동형). senior [test isolation 우연성] 직접 해소.
- **C** code-pointer-validator/test/validator.test.js 에 **dir glob anchor(glob 필드 부재) → glob_no_match 0 + covered 집계 + commit_hash 미부여(A2 미참여)** test 추가.
- **D** CHANGELOG/STATUS coverage 보고 시 **strict_path(sql-inventory mapper / A2 참여) vs glob(architecture dir / A2 제외) 비율 분해 정직 표기** (단순 "100%" overstate 회피).
- **E** 격상 근거 인용 시 LSP 3.17 + IntelliJ content-root + Maven layout (검증된 isomorphic) — "SCIP glob 표준" 주장 ❌.
- **§8.1**: 단일 RealWorld 도메인 = mechanism 입증 / non-gating·WARN 유지 / gate-class 격상 = 2nd distinct domain carry. **no-simulation**: 실 dogfood 재합성 + validator stdout 물증 의무.

## 3. 테스트 계획 (graph-synthesizer.test.js / 신규 describe block / ~8 test)
1. sql-inventory: bare `mapper/UserMapper.xml` + existsFn(`src/main/resources/mapper/...`만 true) → strict_path `src/main/resources/mapper/UserMapper.xml` 해소.
2. sql-inventory: prefix 첫 존재 선택 (`''` 존재 시 bare 유지 / 아니면 resource-prefix).
3. sql-inventory: sentinel('inline'/'jpa') → 미수집 (확장자 없음).
4. sql-inventory: 같은 mapper_xml 다수 record → dedup 1 pointer.
5. architecture: 존재 dir → glob anchor (anchor_type 'glob' / glob 필드 부재).
6. architecture: 미존재 dir → 미수집 → backstop na.
7. architecture: glob anchor 는 commitHash 지정에도 commit_hash 미스탬프 (A2 제외).
8. 회귀: business-rules 의 `mapper/X.xml` 은 resource-prefix 미적용 (kind-specific) → existsFn(resource만 true) 에도 미해소 → na. (cross-kind prefix leak 차단 anchor.)

## 4. dogfood (no-simulation / 실 CLI·실 git / Phase 5)
- `node tools/traceability-matrix-builder/src/cli.js --graph ... --repo-root <RW> --commit-hash <RW-HEAD>`.
- 기대: analysis-sql-inventory na→covered (≤10 strict_path mapper / commit_hash 스탬프됨 → A2 참여) + analysis-architecture na→covered (≤12 glob dir / commit_hash 미스탬프).
- code-pointer-validator: covered 28→30 / na 87→85 / missing 0 / glob_no_match 0 / path_missing(src/main 무) 0.
- (선택) A2 positive demo: mapper XML 변경 → content_drift on analysis-sql-inventory (실 P0 입증).
- 산출 evidence: `_dogfood-realworld/.../slice2-codepointer-probe.md`.

## 5. §8.1 평가 (정직)
- read-class·additive·결정론 infra (v11.22.0 동급) → **gate-class 아님** → MINOR-eligible / ≥2 distinct domain 불요.
- dogfood = 단일 RealWorld 도메인 = mechanism 입증 (ceiling 주장 ❌). A2 usability 격상(gate)은 여전히 별 carry(≥2 distinct domain).
- self-referential 아님: 그래프가 SQL mapper layer + module dir 실 코드에 앵커 = P0(산출물=LLM 운영 컨텍스트) 운영 효용 확장 / 실 측정 driven / 외부 repo 실 git·CLI.

## 6. STOP-3 게이트 (Phase 5)
- workspace test +N green (993 → 993+N).
- release-readiness 26/26 (poc-05 정적 graph read = #16 무영향 예상 / 확인 의무).
- skill-citation 0 stale (skill 무변경).
- version 3-way sync 11.22.0 → **11.23.0** (plugin.json + package.json + CLAUDE.md).
- breaking 0 = MINOR.

## 7. 잔여 carry (이 슬라이스 후)
- db-schema(.sql DDL) / state-map(component) / type-spec 등 나머지 analysis kind 앵커 = 후속 micro-slice (scope creep 회피 / §8.1 over-fitting 차단).
- 접근 C (명시 schema 필드 code_pointers 격상) = A 가치 충분 입증 후.
- A2 ≥2 distinct domain usability corroboration (gate-class) = Type 2 의존.

## 8. Lessons Learned (실패 시 기록)
- (착수 후 채움)
