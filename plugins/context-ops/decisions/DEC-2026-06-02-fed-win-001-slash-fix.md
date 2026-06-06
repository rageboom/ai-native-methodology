# DEC-2026-06-02-fed-win-001-slash-fix

**결단**: `F-FED-WIN-001` 수정 — context-federator 의 codegraph "코드 반쪽"(파일→심볼 해소)이 **Windows + Node 22.5~22.12 에서 사실상 마비**되던 버그를 고친다. (1) `codeRefForAnchor` 의 `cgRel` forward-slash 정규화 (load-bearing) + (2) unresolved note 오귀인 수정 + adapter `sqliteReader` 플래그 + CLI honest hint. node:sqlite 가용성은 **Node ≥22.13 권장**으로 처리(re-exec machinery ❌). 부수로 **federator 테스트 스위트의 Windows red(legacy-data fixture POSIX-경로 하드코딩 + smoke node:sqlite skip 누락)** 도 해소. **v12.0.1 PATCH** (공개 API·schema·산출물 무변경 / 도구 버그 fix).

**작성일**: 2026-06-02 (사용자 dogfood 검증 세션 — "Q1 산출물↔코드 연결부터 고치고 싶다" → 4원칙 → "추천" → "go").

**relates to**:

- `DEC-2026-06-02-context-federation.md` (context-federator 신설 / 본 버그의 무대 / §3 Phase 1 federate 코어 `symbolsInFile` DB-직행)
- `methodology-spec/finding-system.md` (finding = 명세 빈틈 전용 → 도구 코드 버그는 DEC 로 기록 / F-FED-WIN-001 은 finding 아님)
- memory `feedback_edit_tool_crlf_windows` (glyph-heavy 소스 byte-preserving 편집) / `feedback_senior_fact_check_supplement` (Senior REVISE)
- 검증 plan `~/.claude/plans/plan-fed-q1-fix.md` + dogfood 검증 `~/.claude/plans/dep-graph-codegraph-async-kernighan.md`

---

## 1. 배경 — Q1 검증에서 표면화

dogfood(ecommerce NestJS/Prisma, RealWorld Spring/MyBatis) 실측으로 federation 의 **dep-graph 절반(산출물→파일 앵커)은 견고**(ecommerce covered 40 / missing 0 / ratio 1.0)하나, **codegraph 절반(파일→심볼)이 ~9%(7/79 앵커)만 동작**함을 발견. codegraph 인덱스는 데이터를 다 갖고 있는데(`query "PurchaseService"` = 20 심볼) federator 가 못 읽음 = 글루 버그.

## 2. Root cause (실측 2종 / Windows + Node 22.11)

1. **node:sqlite flag-gating** — `loadSqlite()` 의 `require('node:sqlite')` 가 Node 22.5~22.12 에서 `--experimental-sqlite` 없으면 throw → null → `symbolsInFile` 죽고 fuzzy stem-query fallback 만 작동(controller route 만 매칭 / service method 못 매칭). (공식문서: node:sqlite v22.5.0 추가·flagged → **v22.13.0+ LTS·v23.4.0+·24+ unflagged**.)
2. **Windows path separator** — `cgRel = relative(codegraphProjectDir, absFile(repoRoot, anchor.path))` 가 Windows 에서 백슬래시(`models\purchase\...`) 생성. codegraph DB 는 file_path 를 **forward-slash 로 저장(Windows 포함 실측)** → `WHERE file_path = ?` 0행. (forward-slash query=20행 / backslash=0행 실측.) trap: flag 만 켜도 `symbolsInFile` 가 `[]`(null 아님) 반환 → fallback skip → 오히려 악화.

→ 정직한 `unresolved` 표기는 유지됐으나 note 가 "codegraph 가 파싱 못함"으로 **오귀인**(codegraph 는 파싱 성공).

## 3. 결단 상세 (4원칙 §2 정합)

- **official-docs 교차검증**: node:sqlite 버전/flag 史 + `--experimental-sqlite` 는 Node <22.5 에 hard "bad option" exit9(version-gate 필수). DatabaseSync API 22.x~24.x 안정.
- **Senior REVISE (0.84)**: ① **fix#1(slash)이 load-bearing·universal** — self-re-exec 은 §8.1(단일 Node-minor 거동) 위반/fragile → **지양** ② 정규화를 **adapter 아닌 core(`codeRefForAnchor`)에 배치** = fake-adapter 순수 단위테스트 가능(28 테스트는 fake 주입이라 adapter-내 fix 는 못 잡음) ③ codegraph forward-slash 저장 실측 확인 후 정규화 방향 확정 ④ honest note 승인.
- **node:sqlite 처리 = 사용자 결단 "Node 22.13+ 업그레이드"** (re-exec ❌). 22.5~22.12 잔존 사용자엔 CLI honest hint + `--experimental-sqlite` 안내.

## 4. 시행 (3 파일 / CRLF byte-preserving 편집)

- `tools/context-federator/src/federator.js`: import `sep` 추가 / `codeRefForAnchor` 의 `cgRel` 를 `.split(sep).join('/')` 정규화(+근거 주석) / unresolved note 오귀인 수정 / adapter `sqliteReader: loadSqlite() !== null` 노출(cache 출력 미누출 = line 434 명시 빌드) / adapter `symbolsInFile` contract 주석.
- `tools/context-federator/src/cli.js`: federate 후 `sqliteReader === false && anchors_unresolved > 0` 시 honest stderr hint(Node ≥22.13 안내).
- `tools/context-federator/test/federator.test.js`: F-FED-WIN-001 순수 회귀 단위테스트 신설(fake adapter forward-slash 키 + 백슬래시 앵커 → 해소 assert / node:sqlite 불요·전 OS) + legacy-data fixture 5건 `resolve(repoRoot,…)` 이식성화(POSIX-경로 하드코딩 제거 = C-fedwin-test-portability) + smoke 에 node:sqlite 부재 honest-skip 가드.

## 5. 검증 (no-simulation / 실측)

- **ecommerce 재federate**(SHIPPED cli + `--experimental-sqlite` = Node 22.13+ 거동): `symbols 42→349 / unresolved 80→24`. 잔여 24 = src 밖(.sql migration/test/prisma 16) + glob 디렉터리 8 = 정직 잔여. code half **9%→~72%**(63/87 앵커).
- **단위 테스트**: federator 28→29. Windows no-flag = **28 pass / 0 fail / 1 skip**(smoke honest-skip) / flag = **29/29**. pre-existing #5(Windows-only red) 회복 + 무회귀.
- **cross-env carry (실행 부재 = 정직 추론)**: Node 24(unflagged) = fix#1 단독 해소 / Node 20(node:sqlite 부재) = fallback graceful no-crash + cli hint / POSIX = sep='/' → 정규화 no-op → 기존 동작 유지.

## 6. 부수 발견 (별도 / pre-existing)

federator 테스트가 **Windows 에서 7 red 였음**(본 fix 전). 5건(legacy-data Phase 1.5)= **fixture 가 POSIX 절대경로 하드코딩** → Windows `resolve()` 백슬래시 키 미스. **production legacy half 는 Windows 정상**(RealWorld 실측 `data_refs=11`) = **test-fixture 이식성 버그(production 연결 무관)**. 1건(smoke)= node:sqlite 부재 fail(→skip 가드). → **federator 테스트가 Windows 에서 red 였다 = 저자 CI 가 POSIX(또는 flag) 추정 / Windows CI 사각**. 본 release 로 federator 스위트는 전 환경 green-or-honest-skip. (다른 도구의 Windows 이식성은 본 release 의 workspace_test_pass 게이트로 확인.)

## 7. carry

1. **C-q3-hard-scenario** — Q3(결정론 vs LLM) 재검증: 본 dogfood 는 얕은 call-chain·소형 repo(BASELINE 천장효과). 공정 검증엔 대형 repo / 깊은 의존 / spec-coupling 다수 시나리오.
2. **C-codegraph-precision** — codegraph bare-symbol 매칭이 generic 명(remove/create 등)에서 대량 위양성(`impact "remove"`=111 노드 across 전 모듈 / 진실 3). file_path 동일-모듈 필터 등 precision 보강 검토 (reference-lens 라 gate 무개입은 유지).
3. **Windows CI** — 다른 도구도 동일 path-이식성 잠재. workspace_test_pass(Windows) green 확인 = 본 release.

## 8. paradigm 정합

- **본체 우선**: tools/decisions 본체 fix (PoC 산출물 작업 아님).
- **no-simulation**: unresolved 정직 유지 + 오귀인만 정정 / cross-env 미실행분 정직 carry(날조 ❌).
- **§8.1**: 단일 환경(Windows/Node22.11) 관측 → fix#1(slash)은 universal·POSIX no-op 으로 안전 / node:sqlite 는 본체 machinery 아닌 환경요구(Node≥22.13)로 처리.
