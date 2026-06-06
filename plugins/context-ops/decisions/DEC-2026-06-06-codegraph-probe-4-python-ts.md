# DEC-2026-06-06-codegraph-probe-4-python-ts

**결단**: codegraph OSS probe #4 (Python + TypeScript) 시행 — `@colbymchenry/codegraph` 의 **언어 지원 범위가 Modern Java 한정이 아니라 광범위**(tree-sitter 36 파싱 문법 / 18 언어 전용 extractor)임을 설치 패키지 실측 + 2-언어 live 인덱싱으로 확정. 결과 = **Python·TypeScript 둘 다 심볼·call-graph·route 추출 정상**. 이로써 그간 문서가 Python/TS 를 "미검증"(사실상 "미지원"처럼 읽힘)으로 둔 프레이밍을 정정하고, iBATIS2·query→DB-table 을 "사각지대(약점)"가 아니라 **관심사 분리상 스코프 밖**으로 재분류한다 (사용자 직관 채널: "codegraph 는 DB 도구 아님 / 되는 범위까지만").

**작성일**: 2026-06-06 (probe #1~#3 = Java/Spring 한정 / 본 probe = 언어 범위 확장 실측).

**relates to**:
- `DEC-2026-05-28-codegraph-probe-결과.md` (probe #1 / Spring4.1+iBATIS2) · `DEC-2026-05-30-codegraph-probe-2-mybatis3.md` · `DEC-2026-05-30-codegraph-probe-3-jpa.md`
- `DEC-2026-06-03-codegraph-deliverable-wiring.md` §2 (trust 경계 / 본 probe 가 §2 "사각" 서술 정정 근거)
- `examples/poc-18-express-prisma-modern-ts/` (TS 대상) · `examples/poc-19-numpy-financial-python/` (Python 대상)

---

## 1. 설치 패키지 실측 — 언어 지원 범위 (`@colbymchenry/codegraph` v0.9.7)

- **정체**: tree-sitter 기반 "code intelligence and knowledge graph for **any codebase**" (SQLite 인덱스 / `index`·`status`·`query`·`callers`·`callees`·`impact`·MCP `serve`). **DB 도구 아님.**
- **파싱 문법 36종** (`tree-sitter-wasms/out/*.wasm`): bash · c · c_sharp · cpp · css · dart · elixir · elm · go · html · java · javascript · json · kotlin · lua · objc · ocaml · php · python · ql · ruby · rust · scala · solidity · swift · toml · tsx · typescript · vue · yaml · zig 등.
- **언어 전용 extractor 18종** (`dist/extraction/languages/`): c-cpp · csharp · dart · go · java · javascript · kotlin · lua · luau · objc · pascal · php · **python** · ruby · rust · scala · swift · **typescript**.
- **프레임워크 전용 extractor**: **mybatis** · vue · svelte · liquid.

## 2. live 인덱싱 실측 (2-언어)

### Python — `numpy-financial` (poc-19 / numpy_financial 패키지)
- index: 5 files / **64 nodes / 77 edges** / 277ms. Nodes by Kind: method 26 · function 19 · import 10 · file 5 · variable 3 · class 1. Language: python 5.
- **call-graph 정확 (⭐⭐⭐)**: `callers pmt` = {ipmt, ppmt} ✅ / `callees ipmt` = {_convert_when, pmt, _rbl} ✅ / `impact pmt` = pmt→ipmt→ppmt transitive ✅. (poc-19 가 수동 작성한 architecture 내부 의존성을 codegraph 가 결정론 재현.)

### TypeScript — `express-prisma-typescript-boilerplate` (poc-18 / src)
- index: 59 files / **542 nodes / 1,002 edges** / 981ms. Nodes by Kind: import 212 · constant 121 · function 96 · file 59 · interface 20 · **route 16** · type_alias 8 · method 4 · property 3 · class 1. Language: typescript 59.
- **route 추출 ✅ (⭐⭐⭐)** — Express route 16 (Spring `@RequestMapping` 대응). `callees createPost` = {postRepository, CreatePostData, PostCreateInput, PostWithAuthor} = service→repository + type 참조 ✅.
- **한계 (정직)**: `callers createPost` = none — route→handler 와이어링이 Express 미들웨어/동적 dispatch 라 정적 링크 안 됨 (= probe #1~#3 의 "런타임 와이어링 사각"과 동형 / 언어 무관 공통 한계 / DB·reflection·dynamic-routing).

## 3. 정정 (본 probe 가 근거)

1. **"Python/TS 미검증" → 측정 완료**: codegraph 는 Python·TS 전용 extractor 보유 + 본 probe 로 심볼·call-graph·route 추출 정상 확인. 도구 미지원 ❌ — 그간은 **방법론이 Java 만 probe**한 공백이었을 뿐 (둘은 다름).
2. **iBATIS2 / query→DB-table = "사각지대(약점)" 재분류 → "스코프 밖(관심사 분리)"**:
   - iBATIS2 sqlMap = 마이그레이션 대상 legacy XML SQL-map. 코드 구조 도구 영역 아님 ([[project_ibatis2_migration_target_scope]] 정합).
   - query→DB-table = **DB/ORM 분석 영역** (db-schema 산출물이 ORM/DDL 로 담당). code-graph 도구가 table 노드를 안 만드는 건 결함이 아니라 정의상 책임 밖.
   - 런타임 DI·AOP·reflection·동적 라우팅 = 런타임 도구 영역 (정적 AST 원리상 밖).
3. **codegraph 가치 재정의**: "Modern Java 한정"(과소평가) → **"tree-sitter 18+ 언어 광범위 코드 구조(route·call·interface·심볼·import) 도구"**. sweet spot 은 정적 호출 가능한 모든 언어.

## 4. trust 경계 (불변 / 정정 아님)

본 probe 는 **지원 범위**를 넓힐 뿐 trust 모델은 무변경: codegraph 출력 = reference-lens (coverage-hole / finding / reading-aid 3채널) / 결정적 gate inject ❌ / 최종 evidence = 실코드 grep. 근거 = 동적 와이어링 사각(§2 TS callers none) 은 언어 무관 상존 → "안 본 영역 검증됨" 오인 차단 의무 유지.

## 5. Non-goal / carry

- 18 extractor 언어 **전수 probe ❌** (Python·TS 2건 + Java 3건 = 5 언어 실측 / 나머지 13 = 도구 보유 사실만 / 필요 시 추가 probe).
- route→handler 동적 와이어링 정적 링크 = codegraph 범위 밖 (carry 아님 / 원리 한계).
- 본 probe = 도구 능력 측정 / chain-harness §3-A 추출률 측정 아님 (별개 axis).
