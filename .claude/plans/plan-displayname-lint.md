# plan — @DisplayName ↔ test-spec label consistency lint (SOFT 확장)

승인: 사용자 AskUserQuestion "문법문서 + SOFT 확장 (권장)" (4원칙 3). 연구 패널 = `wf_40ab04b1-fda`.

## 1. 동기 (dogfood 노출 갭)

ep-be-gea characterization 테스트의 `@DisplayName` BR/AC/TC 토큰이 test-spec SSOT 와 drift (golf 6 / event 13 / resv 5 / cal·2 resv clean) + 날조 BR id(DUR-001·FEE-001 비실재). 기존 검증기는 코드 라벨을 **전혀** 안 봄: spec-test-link=JSON↔JSON, test-impl-pass=runner XML 출력만, code-pointer=ast_symbol warn-only.

## 2. 패널 종합 + 결정적 교정

- 수렴: already_covered=NO / @DisplayName=free-text(표준 도구 0) / 업계 선례(OpenFastTrace orphaned-ID, JetBrains TMS, ArchUnit, Reqflow) / 결정론 feasible.
- **Senior 교정 ①(join-key)**: source_evidence 는 free-text(라벨을 echo 가능) → 라벨 비교에 self-reference 위험. 구조적 join = `code_pointers[ast_symbol].symbol` 권장.
- **deep-study 반증 (CRITICAL)**: 실 golf test-spec 에서 **code_pointers·class_ref = 0/25 미populated**. source_evidence 만 채워짐(형태 `MainClass$Nested (real JUnit / Mockito)` — 라벨 토큰 미포함). → Senior 의 code_pointers join 은 **실 산출물에 없어 불가**. source_evidence 의 **클래스/네스트명**(라벨 아님 = 안정)으로 join 가능하나 free-text 라 robust 도 제약.
- **결론 — 결정론 lint 의 실제 catchable 범위 (semantic 전체 ❌ / 구조적 subset)**:
  1. **날조 id** (BR ∉ business-rules / AC ∉ acceptance / TC ∉ test-spec) — robust·high-value (golf 날조 BR 잡음).
  2. **intra-label AC↔TC 불일치** (라벨의 AC ≠ 라벨이 적은 TC 의 spec ac_ref) — 결정론.
  3. **join-기반 (anchor 있을 때만)** class_ref/code_pointers populated 시 source 라벨 ↔ TC 매핑 검증. 미populated 면 `join_anchor_absent` 정직 skip (false-flag ❌).
- Senior 교정 ②(§8.1): golf/event/resv = 한 마스킹 Java 프로젝트 = **1 datapoint**. unit-층 flip 은 3 distinct 도메인 요구 → **SOFT only / HARD 는 ≥2 distinct 프로젝트 후**.
- Senior 교정 ③(다언어): @DisplayName=Java-only → body 하드게이트 ❌. generic core + per-framework extractor. Java extractor 만 now / TS·React carry.
- Senior 교정 ④(확장 ❌신규): spec-test-link-validator 에 `--test-source` opt-in + sibling export (validateMockSoundness 선례).

## 3. 설계

### 3.1 SOFT 메커니즘 (핵심 — 비차단 보장)
`--test-source <root>` opt-in. 부재 시 = 현 JSON-only 동작 100% 불변. 존재 시 `validateCodeLabelConsistency` 결과를 **별도 키** `result.code_label_consistency = {findings, summary, checked, skipped}` 로 attach. **result.findings/summary 에 병합 ❌** → cli exit-code(line 64 critical|high 차단) + aggregator transformGeneric(summary.high) 무영향 = 진짜 advisory. (cli.js:41 구 2-객체 stdout 함정 회피 = 단일 JSON 의 nested key 라 안전.)

### 3.2 validateCodeLabelConsistency(testSpec, sourceFiles, brIds, acIds, tcIds)
- 토큰 정규식: `/\b(BR|AC|BHV|UC|TC)-[A-Z0-9-]*\d{3}\b/g` (short `AC-007` + long `BR-RESVGOLF-ELIG-002` 양형).
- scope 정규화: test-spec TC scope(`TC-<SCOPE>-NNN`)로 short→long 매핑(`AC-007`→`AC-<SCOPE>-007`). 기존 normalizeForMatch 사상 차용.
- 파서: source_file 읽어 `@DisplayName("...")` 추출(class·method 레벨) + 토큰. (regex / JavaParser 비의존 — exhaustive-no caveat 명시, sql-inventory-extractor 선례.)
- check 1~3 (위 §2). severity: 날조 BR=critical, AC/TC 토큰 불일치·날조=high, 라벨 미파싱·anchor 부재=medium/info. **단 전부 code_label_consistency 안에만** (gate 무영향).
- evidence: real_tool 불요(JSON 파생) but checked/skipped 카운트 정직 표기.

### 3.3 authoring 문법 (선결 / diagnose-before-design)
- `plugin-authoring-spec.md` + `skills/test-generate-test-spec/SKILL.md`: canonical `@DisplayName` 라벨 문법 = `"<설명> (BR-<full-id> / AC-<NNN|full> / TC-<NNN|full>)"` (method·class scope 규약 / 구분자 ` / `). 현 규약은 TC-id **존재**만 강제 → BR/AC 일치 + 날조금지 추가. tested TC 는 `class_ref`/`code_pointers` populate **권장**(join 강화 경로).

### 3.4 wiring
- cli.js: `--test-source` arg + help. source_file 들 disk read(repoRoot-relative) + business-rules.json·acceptance 로드(brIds/acIds). attach 별도 키.
- **gate/aggregator REQUIRED-map 무변경** (SOFT = opt-in, 미등록). release-readiness 신 check 무(또는 advisory fixture만). → count-coupling 회피.
- 테스트: validator.test.js 에 code-label 케이스 추가(날조 BR / AC 불일치 / clean / anchor 부재 skip). 픽스처.

### 3.5 release
- MINOR(additive SOFT). CHANGELOG + plugin.json + CLAUDE.md "현재 vX" 1줄 + DEC-2026-06-13-displayname-label-lint-soft. §8.1 ratchet 명시(SOFT / HARD 보류).

## 4. 비범위 (carry)
- TS/React extractor / HARD flip(≥2 도메인) / codegen(@DisplayName 자동생성=harness-internal) / class_ref·code_pointers 강제(현 권장).

## 5. Lessons (구현 중 갱신)
- (구현 후 기록)
