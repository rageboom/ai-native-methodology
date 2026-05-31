# DEC-2026-06-01-slice2-codepointer-enrich

> ★ v11.23.0 MINOR release SSOT. Living-graph Slice 2 — analysis 노드 sql-inventory + architecture code-pointer enrich (carry ① C-codepointer-analysis-aspect-enrich 해소).
> 상태: **승인 + 시행 완료** (2026-06-01 / session 61차). `/clear` 후 "계속 진행" → AskUserQuestion(다음 의제) "Living-graph Slice 2 (code-pointer enrich)" → 4원칙(plan + 3-agent research 만장 GO + batch 승인 "둘 다 + Phase 4–5 일괄") → 시행 → dogfood → release. plan `.claude/plans/plan-slice2-codepointer-enrich.md`.

## 배경 — v11.22.0 carry ①

v11.22.0 가 graph-synthesizer `deriveAnalysisCodePointers()` 로 analysis 노드(business-rules/domain/error-mapping)를 실 src 에 앵커. 두 kind 는 명시적 후속 slice 로 남김: **sql-inventory(mapper resource-prefix resolve)** + **architecture(dir glob)** = `C-codepointer-analysis-aspect-enrich`. RealWorld 에서 두 노드 = na fall-through (그래프가 SQL mapper layer + module 디렉토리에 미앵커).

## §2 research (3-agent / wf_8a8aa7ef / 만장 GO)
- **official-docs (GO_WITH_REVISE @0.88)**: MyBatis mapper XML 표준 위치 = `src/main/resources/mapper/` (RealWorld repo + MybatisProperties.java 공식소스 cross-check) / prefix `['', 'src/main/resources/']` RealWorld 일치 / SCIP proto 엔 glob/tree anchor 개념 無 → glob = SCIP 영감 자체설계로 표기(SCIP 표준 주장 ❌). REVISE: prefix 에 `src/main/resources/mybatis/` 추가 권고.
- **industry (GO @0.88)**: 6 isomorphic — Spring PathMatchingResourcePatternResolver(ordered prefix try) / Maven Standard Layout(src/main/resources=classpath root) / MyBatis Spring Boot(`classpath:mapper/*.xml`) / **LSP 3.17(dir-level glob anchor / pattern 생략=dir 단위)** / **IntelliJ content root(module=dir)** / SCIP(repo-root 상대 path). commit_hash strict_path-only + glob A2-제외 = LSP file-watching granularity 와 동형.
- **senior (GO_WITH_REVISE @0.83 / 코드라인 cross-check)**: byte-identical 보존(prefixes=[''] discipline) / node-id·field schema-canonical 정합 / sentinel 확장자 자동필터 / dir-as-glob A2-제외 코드거동 일치 / `glob:'**/*'`는 simpleGlobMatch depth-1 한계로 glob_no_match → **glob 필드 부재가 정답** / determinism·additive 확인.

## 결정 — 접근 A 연장 (graph-synthesizer.js only / additive / schema·skill·CLI 무변경)

- **`ANALYSIS_TO_CODE_POINTERS` 일반화**: `kind→accessor` → `kind→{mode, accessor, prefixes?}`. 기존 3 kind = `mode:'file', prefixes:['']` 명시 = byte-identical 보존.
- **sql-inventory**: `mode:'file', prefixes:['', 'src/main/resources/', 'src/main/resources/mybatis/']` / accessor=`inventory[].mapper_xml`. 논리경로 → resource-prefix 역산 strict_path. sentinel = 확장자 없음 → hasCodeExtension 자동 필터. `src/main/java/` 임베디드 XML = 의도적 scope-out.
- **architecture**: `mode:'dir'` / accessor=`modules[].path` → glob anchor(glob 필드 부재 → validator existsSync(dir) 매칭). commit_hash 미스탬프 → A2 제외(dir-diff false-drift 회피).
- **`resolveAnchor(raw, cfg, existsFn)` 헬퍼**: file=hasCodeExtension→prefixes 첫 existsFn-통과 / dir=확장자 skip→existsFn→glob. dedup=해소경로 / cap 10.

## 흡수한 REVISE 5종 (전부 additive / 코어 무변경)
- **A** prefix 3종 + `src/main/java/` scope-out 명시.
- **B** file-kind 마다 prefixes 명시 선언(전역 기본값 의존 ❌) + kind-specific 불변식 회귀 test(S2-9).
- **C** code-pointer-validator/test 에 dir glob anchor(glob 필드 부재) → glob_no_match 0 + covered test 추가.
- **D** CHANGELOG/STATUS coverage 보고 = strict_path(A2 참여) vs glob(A2 제외) 비율 분해 정직 표기.
- **E** 격상 인용 = LSP 3.17 + IntelliJ + Maven(검증 isomorphic) / "SCIP glob 표준" 주장 ❌.

## 검증 (no-simulation / 실 CLI·실 git)
- graph-synthesizer +9 test + code-pointer-validator +1 test. workspace 993→**1003** / 0 fail / release-readiness **26/26**.
- **RealWorld dogfood** (`--repo-root <RW> --commit-hash ee17e31`): analysis-sql-inventory na→**covered (10 strict_path mapper XML / 전부 `src/main/resources/mapper/` 역산 / 10/10 commit_hash 스탬프=A2 참여)** + analysis-architecture na→**covered (10 glob dir / cap 10 of 12 / commit_hash 미스탬프=A2 제외)**. covered **28→30** / na 87→85 / missing 0 / **glob_no_match 0** / mapper·src-main path_missing 0 / Slice 2 신규 앵커 **0 new findings**.
- **A2 positive demo** (mapper 앵커 baseline=root ee946e3 / `--git` / 실 114-commit): **10 mapper XML 전부 content_drift 발화** = A2 가 SQL mapper layer production 변경 탐지(Slice 2 이전 불가능). medium/non-gating. evidence = `_dogfood-realworld/.../.aimd/slice2-codepointer-probe.md`.

## STOP-3
workspace **1003/1003** ✅ + release-readiness **26/26** ✅ + skill-citation 0 stale + version 3-way **11.23.0** + breaking 0 = **MINOR**.

## §8.1
resolver 일반화 = read-class·additive·결정론 infra (v11.22.0 동급) → **gate-class 아님**. 단일 RealWorld 도메인 = mapper-prefix/dir-glob mechanism 입증(ceiling 주장 ❌). coverage 보고 = strict_path vs glob 분해(REVISE-D).

## carry
1. db-schema(.sql DDL)/state-map/type-spec 등 나머지 analysis kind 앵커 = 후속 micro-slice.
2. 접근 C (명시 schema 필드 code_pointers 격상) = A 가치 충분 입증 후.
3. ≥2 distinct domain A2 usability corroboration (gate-class / non-Spring 스택 prefix 일반화 포함).
4. F-DF-A2-003 working-tree 모드 / A3 relocation dogfood (유지).

## paradigm 정합
- **dogfood-first / "쓰게 하라"** — 실 RealWorld 측정(na→covered / A2 mapper 10 drift)이 가치 입증. self-referential 아님(P0 운영 / 외부 repo 실 git·CLI).
- **no-simulation** — 실 git·실 CLI·실 그래프 / persona ❌.
- **사용자 결정 gate** (4원칙) — 다음 의제 + 범위/진행 batch AskUserQuestion 결단.
- **Senior 사실검증 보강** — research claim 전부 코드라인/URL cross-check (LL-fsim-11).
Extends DEC-2026-06-01-df-anchor-002.
