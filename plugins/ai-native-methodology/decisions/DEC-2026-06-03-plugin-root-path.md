# DEC-2026-06-03-plugin-root-path

> v12.7.0 MINOR release SSOT. ③ Type 2 (A) `${CLAUDE_PLUGIN_ROOT}` 경로 치환 — 출하 skill/agent 본문 repo-relative 실행 경로 plugin-install 배포버그 fix + check32 회귀 가드.
> 상태: **승인 + 시행 완료** (2026-06-03). 4원칙 = `plan-plugin-root-path-fix.md` → 공식문서 raw fetch(F-015) + Senior 적대적 리뷰 0.88(must-fix #1~#4) → 사용자 "진행/MINOR" + "guides=별도 carry" 승인.

**작성일**: 2026-06-03

**relates to**:

- `plan-type2-external-adoption.md` — Phase 1 감사 EXT-MISS-03 / EXT-PATH(repo-relative `node tools/` → `${CLAUDE_PLUGIN_ROOT}`). 본 DEC 가 (A) plugin-install 실행 경로 슬라이스를 소진.
- `feedback_self_referential_corrective_drift` — dep-graph 루프(s60~70) 탈출 / 외부-가치 frontier(Type 2 install). self-referential 아님(출하물의 실 배포버그 / adopter 영향 실재).

---

## 0. 한 줄 요약

출하 skill 17 + agent 5 의 본문이 `node tools/...` (repo-relative) 실행을 지시 → plugin-install 시 cwd=사용자 프로젝트라 `tools/` 미해소 = 실 배포버그. 공식문서가 "skill/agent content 의 `${CLAUDE_PLUGIN_ROOT}` 는 install 절대경로로 inline 치환"을 확정 → `${CLAUDE_PLUGIN_ROOT}/` prefix 일괄 치환(4 클래스/22 파일/52 치환) + 회귀 가드 check32.

## 1. 의제 선정

STATUS 다음 세션 의제 ③ Type 2 (A) = "자율 가능 prod-value frontier" (dep-graph 루프 무관). 사용자 "남은 작업 시작하자" → grep 실측으로 STATUS "skill 16개" 주장 검증 + agents 5 추가 발견 → 진행.

## 2. 공식문서 기계 검증 (F-015 cross-validation) + Senior 적대 리뷰

- **claude-code-guide sub-agent = 오답**: "skill 본문의 `${CLAUDE_PLUGIN_ROOT}` 는 shell 에서 확장 안 됨 → prefix 무효"라 결론 → **자기 인용 문서와 모순**. raw fetch 로 override.
- **공식문서 raw fetch (plugins-reference.md)**: L630 "All [3 path vars] are substituted inline anywhere they appear in **skill content, agent content**, hook commands, monitor commands, and MCP or LSP server configs." / L632 "`${CLAUDE_PLUGIN_ROOT}`: the absolute path to your plugin's installation directory. Use this to reference scripts, binaries, and config files bundled with the plugin." → skill/agent 본문의 `${CLAUDE_PLUGIN_ROOT}` 는 로드 시점 **inline 치환** = 모델이 실 절대경로를 봄 = **prefix 가 정답**.
- **precedent**: `hooks.json`(L9/28/40/52) + dep-graph-navigator + analysis-aspect-static-security(`--ruleset`) 가 이미 **unquoted** `${CLAUDE_PLUGIN_ROOT}/tools/...` 출하 중.
- **Senior GO_WITH_REVISE 0.88** must-fix 4종 모두 수용(아래 §3).

## 3. 결단

### D1 — 4 클래스 / skills + agents (model-executed 본문)

- ① `node tools/...` → `node ${CLAUDE_PLUGIN_ROOT}/tools/...` (17 skill + 5 agent)
- ② `bash tools/static-runner/.../lint-no-simulation.sh` → 동형 (3 skill)
- ③ `--schemas schemas/` **drop** — schema-validator 미인식 플래그(실 플래그 `--schema-dir` + `DEFAULT_SCHEMA_DIR=resolve(__dirname,'../../../schemas')` 번들 자동 해소) → 런타임 무시되던 잘못된 문서 제거 (plan-architect-decisions·plan-agent 2곳)
- ④ `ls templates/...` → `ls ${CLAUDE_PLUGIN_ROOT}/templates/...` (\_base-apply-template)

### D2 — unquoted (Senior must-fix #1)

hooks.json + 2 작동 skill precedent 일치. 인용 도입은 reference impl 과 불일치 생성 + 모델이 명령 구성 시 인용 boundary 오류 위험. 경로-공백 일률 안전화는 hooks 포함 별도 follow-up(현 scope 아님).

### D3 — 회귀 가드 check32 `shipped_repo_relative_tool_path` (release-readiness 31→32)

content-aware grep `skills/` + `agents/` (build-plugin INCLUDE / inline-substitution 적용 dir). 검출 regex `(?:[A-Za-z_][A-Za-z0-9_]*=\S+\s+)*\b(?:node|bash)\s+["']?(?:tools|scripts)/` 가 `${CLAUDE_PLUGIN_ROOT}` 미포함 라인에서 hit → FAIL. **env-prefix(`PYTHONUTF8=1` 등) 허용**(Senior must-fix #2 / analysis-error-mapping:41). `allow-repo-path:` 주석 = 정당 예외(check27 `allow-identity:` 동형). self-test 15→16(discrimination it: bare/env-prefix/bash=violation / prefixed/prose/allow-repo-path=OK).

### D4 — scope-out = human-facing 문서 (Senior must-fix #4 / 사용자 "별도 carry")

`guides/`(16) + `templates/adoption/README.md`(5) 의 `node tools/` = human 복사-붙여넣기 대상. `${CLAUDE_PLUGIN_ROOT}` 는 **human 셸에 미주입** → prefix 가 오히려 깨뜨림 → literal install-path 또는 "도구는 skill 자동 실행(직접 호출 불필요)" 프레이밍 = 별도 설계. check32 는 human 문서 미스캔. **finding `F-EXT-PATH-DOCS-001` 등재**(아래 §6). adoption/CLAUDE.md(dist root alias)는 이미 올바른 `${CLAUDE_PLUGIN_ROOT}` 패턴 + "repo-relative 는 install 동작 ❌" 경고 보유 = SSOT 근거.

## 4. §8.1 (정직)

self-referential corrective 아님 — **출하물의 실 배포버그**(adopter 가 plugin install 시 chain 도구 실행 자체 불가) / R15·P0 정합("우리 도구 우리가 고치기"가 아니라 출하 skill/agent 결함 수정). check32 = drift enforcement criterion(양심 의존 ❌). green check32 ≠ "Type 2 corroboration 달성": 배포버그 제거(necessary) / Type 2 **측정**은 실 사내 팀 self-serve 시 발생(측정=0 유지).

## 5. 검증 (no-simulation / 실 CLI)

- skill-citation-validator **0 stale**(203 scanned / `${CLAUDE_PLUGIN_ROOT}/tools/...` 경로 비-citation 확인 = 회귀 0)
- release-readiness **32/32**(full / check32 green = 실 repo 0 violation / check10·check29 version sync green)
- self-test **16/16**(discrimination 실증: bare/env-prefix/bash 검출 + prefixed/prose/allow-repo-path 면제)
- workspace **1098 pass / 0 fail**(v12.6.0 baseline 유지 = 회귀 0)
- build dist + grep dist literal `${CLAUDE_PLUGIN_ROOT}` 토큰 보존(Senior must-fix #3 / cpSync verbatim)
- version 3-way **12.7.0**(plugin/package/CHANGELOG) + CLAUDE.md/README sync
- git diff CRLF 노이즈 0(byte-preserving 50+/50- / skills·agents 22 파일 / release-readiness 43 순수 insert)

## 6. carry

- **`F-EXT-PATH-DOCS-001`** (신규 / open): human-facing 문서(`guides/` 16 + `templates/adoption/README.md` 5)의 repo-relative `node tools/` 실행 예시 — `${CLAUDE_PLUGIN_ROOT}` 무의미(human 셸) → literal install-path 안내 또는 "skill 자동 실행" 프레이밍 재작성 필요. 별도 doc-design 결정. (Type 2 ledger / plan-type2-external-adoption.md barrier)
- Type 2 **실 측정**(사내 팀 self-serve 1 cycle / 측정=0 / 채택 의존)
- agent `model: opus` pin (저tier 외부 사용자 / EXT-MISS-02 / 별도)
- SessionStart hook bash-only (Windows .ps1 0 / EXT-PREFLIGHT-01 / 별도)
- 경로 공백 일률 안전화(quote 정책 / hooks 포함 / 현 unquoted precedent 유지)

MINOR 정당성: 신규 release-readiness criterion(check32) + 사용자-facing 동작 fix / 공개 API·schema·산출물·노드 스키마 무변경 / breaking 0 (check30=v11.29.0·check31=v12.3.0 MINOR precedent).
