# Common Errors — FAQ (chain harness 운영)

본 가이드 = plugin user 가 install 후 자주 마주칠 마찰점 + 해결 방법.

## 1. Install / Hook

### Q1. Plugin install 후 SessionStart hook 메시지 안 뜸

**증상**: 세션 시작 시 `[ai-native-methodology] Plugin loaded...` 메시지 부재.

**원인** + **해결**:

- (a) `marketplace add` path 잘못 — `/plugin marketplace list` 로 확인 / 절대경로 의무 (또는 사내 GHE URL `https://github.smilegate.net/SGH-ISD/ai-native-methodology.git`)
- (b) `/reload-plugins` 안 함 — install 후 reload 명령 실행
- (c) hooks.json 부재 — dist 안 `hooks/hooks.json` 존재 확인 (`find ~/.claude/plugins/context-ops -name hooks.json`)
- (d) Claude Code 버전 < hooks 지원 — 업그레이드

### Q1.1 Plugin install 후 `/plugin` 상세 출력에 "Skills: 0" 또는 "Agents: README" (v2.0~v2.5.0 critical 결함)

**증상**: `/plugin` 입력 후 Installed 탭 본 plugin 의 상세에 Skills 수 = 0 / Agents = "README" 같은 잘못된 인식.

**원인** (v2.5.0 이전 모든 release 본질 결함):

- v2.0.0~v2.5.0 까지 본 plugin 의 agents/skills 자산이 **Claude Code plugin 표준 (1-depth) 과 충돌하는 2-depth lifecycle organize** 구조였음.

**해결**: **최신 버전 재install 의무** (1-depth flatten paradigm 적용 build).

```bash
/plugin uninstall ai-native-methodology
/plugin marketplace remove mis-plugins
/plugin marketplace add https://github.smilegate.net/SGH-ISD/ai-native-methodology.git
/plugin install context-ops@mis-plugins
/reload-plugins
```

재install 후 정상 출력:

- **Agents: 3** (`_base-senior-engineer` / `_base-industry-case-researcher` / `_base-official-docs-checker`)
- **Skills: N** (1-depth + category prefix paradigm / `skills/<category>-<name>/SKILL.md`)

### Q2. UserPromptSubmit hook 발동 안 함 (chain-driver 권고 stderr 안 뜸)

**증상**: "기획 단계 시작" 같은 prompt 입력했는데 chain-driver 가 권고 안 함.

**원인** + **해결**:

- (a) matcher 패턴 미스 — hooks.json 의 `matcher: "(discovery|발견|탐색|planning|기획|spec|명세|behavior|plan|계획|test|테스트|implement|구현)"` 확인. 한국어/영어 alias 외 keyword 는 자동 매칭 ❌
- (b) `${CLAUDE_PLUGIN_ROOT}` 환경변수 inject 안 됨 — Claude Code 버전 확인
- (c) chain-driver hooks-bridge 실행 실패 — stderr 확인 (`tail -f ~/.claude/logs/...`)

## 2. Version mismatch

### Q3. README / CLAUDE / plugin.json 의 version 출력이 다를 때

**증상**: 받은 build 의 3 source 의 version 표시가 다름 (release commit 의 version sync 누락 build 한정).

**원인**: 본 plugin = 3-way sync paradigm (plugin.json / package.json / CHANGELOG.md). build 시점 sync 깨진 dist artifact 사용 시 발생.

**해결**: 최신 dist artifact 재다운로드 + reinstall (3 source version 일치 확인 / `npm run version:check`).

### Q4. plugin.json 과 CHANGELOG / package.json 의 version mismatch

**해결**: `npm run version:check` → 3 source 정합 검증. 차이 발견 시 plugin.json 기준 (source-of-truth = ADR-010 정합) sync.

## 3. Chain harness state.blocked 풀이

### Q5. `chain-driver next` 가 exit 2 (blocked) — 풀이 절차?

```bash
# 1. 현재 state 확인
node tools/chain-driver/src/cli.js state

# 2. block_reason 식별:
#    "validator_critical" / "validator_high"  → finding fix 필요 (hard / go 우회 ❌)
#    "evidence_missing"                       → soft / 의도된 N/A(예: drift @spec)면 아래 명시 ack
#    "user_intervention"                      → 사용자 명시 결단 입력
#    "tmp_files_pending"                      → recoverTmpFiles 호출
#    "schema_migration"                       → chain-driver migrate

# 3. validator finding fix
#    각 finding 의 file/line + kind 확인
#    source 수정 후 chain-driver next 재시도
```

> ⚠️ **persisted block 은 plain `next` 재실행으로 안 풀린다** (mechanical trio (ii) anti-bypass = exit 2 영속). 해결은 **명시적 결단**으로만:
> - **soft block**(`evidence_missing` 등 / 의도된 N/A) → `chain-driver next --findings <path> --user-decision go` (재평가 후 go-with-warnings 전진).
> - **hard block**(`validator_critical/high`) → `--user-decision go` 로도 우회 불가(재평가서 거부). source 수정 → findings 재집계 → `next --findings <new> --user-decision go`.
> - 중단/되돌리기 → `--user-decision stop` 또는 `revisit:<stage>`.

### Q5.1 task-plan 검증이 `openapi_endpoint_ref` required (BE task) 로 막힘 — HTTP API 가 아닌데?

**원인**: `layer: "be"` 인 TASK 는 contract 강제(양 axis / DEC-2026-05-26)로 `openapi_endpoint_ref` 가 의무. 이건 **API 백엔드** 전제.

**해결**: 비-API 백엔드 로직(라이브러리·배치 job·메시지 컨슈머·도메인 서비스)은 `be` 가 아니라 **`application` 또는 `domain`**(hexagonal layer)으로 둔다 → contract 강제 trigger 안 됨(openapi 불요). `be`/`fe` 는 HTTP/UI 계약이 실제로 있는 TASK 에만.

### Q6. validator finding 이 너무 많아 fix 끝이 안 보임

**원인**: legacy 도입 시 결함 폭증 (특히 정적 분석 / drift / coverage). zero-defect 즉시 강제 ❌.

**해결** (ADR-010 baseline + ratchet):

```bash
# baseline 작성 (현재 결함 수)
node tools/<validator>/src/cli.js ... --write-baseline .baseline.json

# ratchet mode (신규 결함만 차단)
node tools/<validator>/src/cli.js ... --baseline .baseline.json --ratchet
```

→ 매 sprint baseline 1~5% 축소 의무 (점진 quality gate).

### Q7. PreToolUse hook 이 Write/Edit 차단 — 우회 방법?

우회 ❌. mechanical gate trio (iii) 의 의도 = LLM "통과한 척" 시뮬 차단. fix 의무.

만약 정말 우회 필요 시 (예: hook 자체 디버그):

- chain-driver hooks-bridge 명령에 `--dry-run` 추가 (현재 미지원 / sub-plan 후속 carry)
- 또는 `<project>/.ai-context/state.json` 의 `blocked` 필드 직접 false (위험 / no-simulation 정책 위배 의도가 있을 시 finding 으로 등재)

## 4. RED / GREEN 의무

### Q8. chain 4 (test) 종결 — RED 가 진짜 RED 인가?

**검증**:

- `<project>/.ai-context/base/test/result_hash.json` 의 `pass_count: 0` + `fail_count: N` 확인
- `tool_stdout_path` 의 raw log 직접 확인 (test runner 출력)
- `result_hash` 가 sha256 valid (SARIF Appendix F 정합 / framework_neutral)

**Q**: AI 가 "RED 확인했다" 라고만 답하면?
**A**: 5종 물증 7 필드 부재 시 schema if/then 의무 위반 → schema-validator finding → state.blocked=true.

### Q9. chain 5 (impl) 종결 — GREEN 100% pass 가 진짜인가?

**검증** (Q8 와 동일 + 추가):

- `pass_count` = `total_count` / `fail_count: 0`
- `--allow-execute` flag 사용됨 (test-impl-pass-validator 의무)
- chain 4 의 test code 가 변경 안 됨 (git diff `<project>/.ai-context/base/test/` 확인)

## 5. Build / dist artifact

### Q10. `npm run build` 실패 — version-check failed

**해결**: `npm run version:check` 단독 실행 → 3 source 차이 식별 후 plugin.json 기준 sync.

### Q11. dist artifact size — file count 너무 많지 않나?

dist artifact = workspace developer only 자료 (test/corpus/fixtures) 모두 EXCLUDE / guides/ 자산 + 각 폴더 README 정합. file count 는 build 마다 CHECKSUMS.txt 로 검증.

### Q12. CHECKSUMS.txt 무결성 검증 fail

```bash
cd dist/ai-native-methodology-v<version>
shasum -a 256 -c CHECKSUMS.txt | grep -v "OK$"
# → 어느 파일 hash mismatch 인지 확인
```

원인: dist 안 file 수동 편집됨 (build script 외 변경). `npm run build` 재실행으로 refresh.

## 6. 자연어 prompt 매칭

### Q13. 자연어 prompt → skill 매칭 안 됨

**해결**: [first-prompt-cookbook.md](./first-prompt-cookbook.md) 의 prompt 표 확인 / 명시적 키워드 사용. 매칭 폭 좁다면 finding 등재 (skill description 보강 carry).

### Q14. Skill 가 발동했는데 의도와 다른 동작

**원인**: skill description 매칭이 다른 skill 과 겹침.

**해결**: 명시 호출 — `@skills/<category>-<slug>/SKILL.md` (의미 ID paradigm / 예: `@skills/analysis-business-rules/SKILL.md` / `@skills/analysis-characterization-test/SKILL.md`).

## 6.1 Layer 2 LLM 마찰

### Q15. chain 1 gate 진입 시 `br-cross-consistency-validator` 가 너무 오래 걸림

**원인**: Layer 2 (Sonnet 4.6 sub-agent) batch 호출 — BR 31건 1회 호출이라 sub-agent 응답 1~3분 소요.

**해결**: 정상 동작 (Static Tool 시뮬레이션 금지 정합 / 진짜 Claude Code sub-agent invocation paradigm). 시뮬레이션 시 신뢰도 -5%p 패널티.

### Q16. `semantic_drift_detected` finding 발견 — chain 1 gate block?

**원인**: Layer 2 LLM 평가 결과 BR 의 NL ↔ GWT 의미 격차 검출 (semantic_score < 0.7).

**해결 옵션** (사용자 결단):

- **(1) DRIFT 격상** — business-rules.json 변경 ❌ / 후속 검토 carry (chain 1 gate 통과 자격 유지 / Senior REVISE 정합)
- **(2) NL 또는 GWT 수정 후 재실행** — `analysis-br-cross-consistency-check` 재호출

### Q17. `confidence_cap_exceeded` finding (low / Layer 2)

**원인**: Sonnet 4.6 sub-agent 가 confidence > 0.85 보고. Static Tool 시뮬레이션 금지 정합 cap.

**해결**: 정상 동작 (low finding / chain 1 gate block 없음 / 사용자 결단 carry).

## 7. Living-sync (`--git` 변경 자동 감지)

### Q18. `sync-loop --git` / `sync-converge` 가 `unresolved_paths` 에 `.ai-context/state.json` 등 도구 파일을 띄움

**원인**: `--git` 재검출은 baseline↔워크트리의 **변경 tracked 파일 전체**를 스캔한다. `state.json`(도구 실행 상태)이 git 에 커밋돼 있으면 노드 미매핑 → `unresolved` → `needs_resynth` false 신호.

**해결**: 런타임 상태는 커밋 대상이 아니다. `chain-driver init` 이 `<project>/.ai-context/.gitignore` 를 자동 생성하므로(`state.json`·`state.json.tmp`·`intervention-log.jsonl` 제외) **신규 프로젝트는 자동 처리**. 기존 프로젝트면 `git rm --cached .ai-context/state.json` 후 그대로 두면 된다(재-init 도 .gitignore 를 보강). 상세 = `methodology-spec/living-sync-operating-model.md` §8.

### Q19. resync 후 `sync-converge` 가 `artifact-graph.json` 때문에 fixpoint 안 됨?

**원인 아님 (정상)**: `artifact-graph.json`·`matrix.json`·`findings-*.json` 은 커밋 대상(AX 컨텍스트/증거)이지만, `--git` 재검출이 이 **도구 파생물**(`.ai-context/` 한정·`do_not_edit_manually`)을 자동 skip 한다(C-lite). 따라서 resync 로 그래프가 바뀌어도 false-`unresolved` 가 안 생기고 fixpoint 에 도달한다. stdout 에 `(도구 파생물 N건 skip)` 으로 정직 표기.

**진짜 막히면**: 노드에 매핑 안 되면서 도구 파생물도 **아닌** 새 산출물이 변경셋에 있다는 신호(=BLOCKER-1 보존). 그 파일을 그래프 노드로 편입(resync)하거나 origin 으로 명시.

## 8. 참조

- [`getting-started.md`](./getting-started.md) — 10분 walkthrough
- [`chain-harness-guide.md`](./chain-harness-guide.md) — chain harness mental model + state.json
- [`first-prompt-cookbook.md`](./first-prompt-cookbook.md) — 자연어 → skill 매핑

## 9. Finding 등재 (사용자 피드백 자산화)

본 가이드에 없는 마찰점 발견 시 — 사용자 자체 프로젝트의 `findings/` 디렉토리에 등재 + 본 plugin 의 사내 GHE Issue 또는 사내 wiki 에 보고. 후속 patch / round cleanup 시 본 가이드 보강.

## 인용

- `ADR-010` — version 3-way sync (plugin.json source-of-truth) + baseline + ratchet
- skill 명시 호출 이름 / 버전 변천사: `CHANGELOG.md` · `decisions/INDEX.md`
