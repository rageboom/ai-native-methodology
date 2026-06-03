# plan — ③ Type 2 (A) `${CLAUDE_PLUGIN_ROOT}` 경로 치환 (plugin-install 실 배포버그 fix)

> 상태: READY (4원칙 §1+§2 완료 / 사용자 승인 §3 대기). STATUS 다음 의제 ③ Type 2 (A) frontier.
> 근거: STATUS.md 다음 세션 의제 ③ / plan-type2-external-adoption.md EXT-MISS-03·EXT-PATH / Senior GO_WITH_REVISE@0.88.

## 문제 (grep 실측 + 공식문서 검증)

plugin-install 시 cwd = **사용자 프로젝트**(plugin root 아님). skill/agent 본문이 지시하는 repo-relative 실행 명령(`node tools/...`)이 `tools/` 미해소 → 실 배포버그. Type 2(사내 plugin-install) 차단.

**공식문서 기계 검증(raw fetch / F-015)**: plugins-reference.md L630 "All [3 path vars] are substituted inline anywhere they appear in **skill content, agent content**, hook commands, …". L632 "${CLAUDE_PLUGIN_ROOT}: the absolute path to your plugin's installation directory." → skill/agent 본문의 `${CLAUDE_PLUGIN_ROOT}`는 로드 시점 절대경로 inline 치환 = 모델이 실경로를 봄 = **prefix 가 정답**. (claude-code-guide sub-agent 가 "확장 안 됨" 오답 → 자기 인용 문서와 모순 → raw fetch 로 override.)

**precedent(이미 출하 중)**: hooks.json:9/15/28/40/52 + dep-graph-navigator + static-security `--ruleset` = 모두 **unquoted** `node ${CLAUDE_PLUGIN_ROOT}/tools/...`. adoption/CLAUDE.md:132 가 "repo-relative `node tools/...` 는 install 환경 동작 ❌" 명시 = SSOT.

## 깨지는 실행 참조 4 클래스 (grep 실측)

1. **`node tools/...`** — 17 skill + 5 agent(plan/discovery/spec/test/implement + plan dup) = ~24+ 라인. (`PYTHONUTF8=1 node tools/...` env-prefix 1건 = error-mapping:41 포함)
2. **`bash tools/static-runner/src/lint-no-simulation.sh`** — 3 skill(implement-generate-impl-spec:147 / implement-verify-test-pass:85 / test-run-test-evidence:108)
3. **`--schemas schemas/`** — plan-architect-decisions:82 / plan-agent.md:77. ★ schema-validator 실 플래그 = `--schema-dir` + `DEFAULT_SCHEMA_DIR=resolve(__dirname,'../../../schemas')`(번들 자동 해소) → `--schemas` = **미인식 플래그**(런타임 무시 / 이미 default 로 동작) → **잘못된 문서 = drop**.
4. **`ls templates/...`** — _base-apply-template:38-39

## 시행 (Senior GO_WITH_REVISE@0.88 / must-fix 반영)

1. 클래스1·2: `node|bash tools/...` → `node|bash ${CLAUDE_PLUGIN_ROOT}/tools/...` **(unquoted — Senior must-fix #1 / precedent 일치)**. **byte-preserving node 스크립트 편집**(CRLF memory `feedback_edit_tool_crlf_windows`).
2. 클래스3: `--schemas schemas/` **drop**(같은 라인 node tools/ fix 시 동시).
3. 클래스4: `ls templates/...` → `ls ${CLAUDE_PLUGIN_ROOT}/templates/...`.
4. 회귀 가드 **check32_shippedRepoRelativeToolPath** (release-readiness 31→32 / check27 미러): content-aware grep skills/ + agents/, `(?:[A-Za-z_]+=\S+\s+)*(node|bash)\s+["']?(tools|scripts)/` 가 `${CLAUDE_PLUGIN_ROOT}` 없으면 FAIL. **env-prefix 허용(Senior must-fix #2)**. `allow-repo-path:` 주석 예외. self-test 15→16(discrimination it 추가) + count 단언 31→32(4곳).
5. build dist 후 **grep dist 로 literal `${CLAUDE_PLUGIN_ROOT}` 토큰 출하 확인(Senior must-fix #3)** — cpSync verbatim 이므로 보존 예상, 실측 확인.
6. version MINOR **v12.7.0** (새 criterion + 사용자-facing 동작 fix / check30=v11.29.0·check31=v12.3.0 MINOR precedent). 3-way(plugin/package/CHANGELOG) + CLAUDE.md(check10) + README(check29) + STATUS/INDEX + DEC.

## scope-out (Senior 동의 / §8.1 gold-plating 회피)

- **guides/ (16 `node tools/`) + templates/adoption/README.md (5)** = human 복사-붙여넣기 문서. `${CLAUDE_PLUGIN_ROOT}`는 human 셸에 미주입 → prefix 가 오히려 깨뜨림 → **다른 fix(literal install-path 또는 "도구는 skill 자동 실행" 프레이밍) = 별도 carry finding (같은 커밋 등재 / Senior must-fix #4)**. check32 는 skills/agents 만 스캔(human 문서 강제 ❌).
- agent `model: opus` pin(유효 frontmatter) / SessionStart `bash` hook(이미 prefix / orthogonal) / codegraph·gradle preflight = 같은 버그 클래스 아님 → bundle ❌.

## 검증 (STOP-3)

workspace test 1098+ / 0 fail · release-readiness **32/32** · skill-citation-validator 0 stale(SKILL.md 편집 후) · build dist + token grep · version 3-way 12.7.0 · git diff CRLF 노이즈 0(byte-preserving).

## Lessons / 사실
- claude-code-guide sub-agent self-contradiction → F-015 raw fetch 가 sub-agent 오답 차단(LL).
- STATUS "skill 16개" = 불완전(agents 5 + adoption + guides 누락) → 완전 인벤토리 grep 가 핵심.
