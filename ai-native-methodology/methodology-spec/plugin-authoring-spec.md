# Plugin Authoring Spec — Skill / Hook / Agent / Packaging (★ ★ ★ 단일 SSOT)

> ★ ★ ★ 본 문서 = 본 plugin 의 Skill / Hook / Agent / packaging **저작 규칙 단일 source-of-truth**.
> 출처 = Anthropic 공식 Claude Code 문서 (§6 pin baseline / 실 `_base-official-docs-checker` F-015 VERIFIED 2026-05-17).
> DEC-2026-05-17-plugin-authoring-spec / ADR-PLUGIN-001 / charter R18.
> 규칙·digest 변경 = ★ 본 문서에서만. 타 문서·agent·skill 은 본 문서 참조 (재선언 ❌).
> **검증 도구**: `scripts/release-readiness.js` check #12 (§6 staleness 결정적 가드 / 60일).

---

## §1. 범위 + 비범위

- **범위**: `skills/<name>/SKILL.md` · `hooks/hooks.json` · `agents/<name>.md` · `.claude-plugin/{plugin,marketplace}.json` 의 **저작 규칙** + 공식 docs drift 재검증.
- **비범위**: chain harness 로직 / 산출물 schema (= `schemas/` + `lifecycle-contract.md` + 각 stage SSOT 관할) / phase axis (= `skills-axis.md` 관할).

---

## §2. Skill 저작 규칙 (★ 단일 SSOT)

| # | 규칙 | 공식 근거 (§6 skills anchor) | 강제 | severity |
|---|---|---|---|---|
| S1 | progressive disclosure — `SKILL.md` 본문 ≤ **500 줄**, 대형 reference/예제는 별 파일 또는 out-of-tree(`methodology-spec/`·`schemas/`·`templates/`) 로 분리 + 명시 link | "Keep SKILL.md under 500 lines. Move detailed reference material to separate files." | MUST | medium |
| S2 | `description` = auto-invoke trigger / 사용자 자연어 키워드 포함 + 핵심 use-case 선두 / `description`+`when_to_use` 합산 ≤ 1,536 char | "Claude uses this to decide when to apply the skill" / "Put the key use case first" | MUST | high |
| S3 | `name` = **lowercase + 숫자 + 하이픈만**, ≤ 64 char, 디렉토리명 == `name` | "Lowercase letters, numbers, and hyphens only (max 64 characters)" | MUST | high |
| S4 | 단일 책임 (1 skill = 1 작업·산출물) — composite 거절 (memory `feedback_composite_view_pattern` 정합) | task vs reference content 구분 | MUST | high |
| S5 | imperative voice 본문 ("Do X" / 서사 최소) | "State what to do rather than narrating how or why" | 권장 | low |
| S6 | frontmatter = **공식 필드만**: `name`·`description`·`allowed-tools`·`when_to_use`·`disable-model-invocation`·`user-invocable`·`argument-hint`·`arguments`·`model`·`effort`·`context`·`agent`·`hooks`·`paths`·`shell` | "Frontmatter reference" 표 | MUST | high |
| S7 | side-effect 워크플로(deploy/commit/send) skill = `disable-model-invocation: true` | task content 가이드 | 권장 | low |
| S8 | auto-compaction 재첨부 대비 — `SKILL.md` 선두 ~5,000 토큰을 self-contained 하게(핵심 절차·계약 우선 / 후방 reference 는 별 파일). 재첨부 skill 은 25,000 토큰 공유 budget(최근 invoke 우선·초과 시 오래된 skill drop) | "Skill content lifecycle" — "keeping the first 5,000 tokens of each" / "combined budget of 25,000 tokens" | 권장 | low |

---

## §3. Hook 저작 규칙 (★ 단일 SSOT)

| # | 규칙 | 공식 근거 (§6 hooks anchor) | 강제 | severity |
|---|---|---|---|---|
| H1 | event 명 = **공식 29종 중 하나** (PreToolUse·PostToolUse·UserPromptSubmit·SessionStart·Stop 등 / "Hook lifecycle" 표 SSOT) | "Hook events" / "Hook lifecycle" | MUST | high |
| H2 | exit code 규약 — `0`=성공(stdout JSON 처리) / `2`=blocking(stderr→Claude) / 기타=non-blocking. 정책 강제 hook = **반드시 exit 2** | "JSON output is only processed on exit 0" / "use exit 2" | MUST | critical |
| H3 | JSON stdout protocol — `continue`/`stopReason`/`suppressOutput`/`systemMessage` 공용 + `decision:block`+`reason` + `hookSpecificOutput.{hookEventName,permissionDecision,additionalContext}` (★ `permissionDecision` 는 `hookSpecificOutput` 내부, top-level ❌) | "JSON output" 절 | MUST | high |
| H4 | matcher 정합 — `*`/공백/생략=전체 / 영숫자·`_`·`\|`=정확매칭 / 그 외=정규식 / MCP=`mcp__<srv>__<tool>` | "matcher" 규칙 | MUST | high |
| H5 | 임의 shell 입력 검증 (injection 방어) + idempotency (resume 시 SessionStart 재실행 `source:"resume"` / mid-session event 는 transcript replay) | shell form / 세션 resume 절 | MUST | high |
| H6 | 경로 = `${CLAUDE_PLUGIN_ROOT}` (절대경로 ❌) / 보조 `${CLAUDE_PROJECT_DIR}`·`${CLAUDE_PLUGIN_DATA}` | "path placeholders" | MUST | high |
| H7 | plugin hook 은 `hooks/hooks.json`(root) 또는 plugin.json `hooks` 필드 | "File locations" | MUST | medium |
| H8 | per-handler `if` = permission-rule 구문 필터(`Bash(git *)`·`Edit(*.ts)`) — tool 이벤트(PreToolUse·PostToolUse·PostToolUseFailure·PermissionRequest·PermissionDenied)에서만 평가 / 그 외 이벤트는 미실행. handler type 5종(command·http·mcp_tool·prompt·agent). `timeout` 기본 = 600s(command/http/mcp_tool)·30s(prompt)·60s(agent). `once` = skills/agents 한정. ★ `matcher`(event-group wrapper) ≠ `if`(per-handler) — 별개·공존·비폐기 | "Common Fields (All Handler Types)" / "Hook Resolution Example" | 권장 | medium |

---

## §4. Agent (Subagent) 저작 규칙 (★ 단일 SSOT)

| # | 규칙 | 공식 근거 (§6 sub-agents anchor) | 강제 | severity |
|---|---|---|---|---|
| A1 | single Markdown 파일 + YAML frontmatter + body=system prompt. **필수 = `name`·`description` 2종만** | "Only name and description are required" | MUST | high |
| A2 | frontmatter optional 필드 = 공식 14종(`tools`·`disallowedTools`·`model`·`permissionMode`·`maxTurns`·**`skills`**·`mcpServers`·`hooks`·`memory`·`background`·`effort`·`isolation`·`color`·`initialPrompt`). ★ `skills:[...]` = **공식 preload 필드** (자체 확장 ❌ / multi-agent paradigm 정합) | "Supported frontmatter fields" 표 | MUST | high |
| A3 | least-privilege `tools` (작업 불필요 tool 미부여 / Skill tool 명시 ❌ — sub-agent 자동 활성) | tools 절 | MUST | high |
| A4 | `description` = 위임 trigger (구체 / "use when ..." 패턴) | "Claude uses each subagent's description to decide when to delegate" | MUST | high |
| A5 | 단일 책임 + context isolation (자체 context window / 1-way report-back / sub-agent 재spawn ❌) | "own context window" | 권장 | medium |
| A6 | plugin agent 은 `hooks`·`mcpServers`·`permissionMode` 미지원 (silent ignore) → 사용 ❌ | plugin subagents 절 | MUST | medium |
| ✗ | `system_prompt`·`preloaded_skills` 필드 = **미존재** (사용 금지 / body 가 system prompt / preload 는 `skills`) | over-claim 교정 (F-015) | MUST | high |

---

## §5. Plugin Packaging 규칙 (★ 단일 SSOT)

| # | 규칙 | 공식 근거 (§6 plugins anchor) | 강제 | severity |
|---|---|---|---|---|
| P1 | `.claude-plugin/` 안 = `plugin.json` + `marketplace.json` 만. 컴포넌트(`skills/`·`agents/`·`hooks/`·`commands/`)는 **plugin root** | "Don't put commands/, agents/, skills/, or hooks/ inside the .claude-plugin/ directory" | MUST | critical |
| P2 | plugin.json — 공식 필수 = `name`(kebab-case)만. `version`·`description`·`author` optional(권장). semver 준수 시 `MAJOR.MINOR.PATCH` | "name is the only required field" / "follow semantic versioning" | MUST | high |
| P2′ | ★ 본 repo 정책(공식 advisory 강화) — **산출물 파일명·command-surface(skill `name`)·schema 계약 변경 = MAJOR**. plugin `name` 변경 = `/plugin:skill` namespace breaking | 공식 = semver.org 위임 (plugin별 정의 ❌) → 본 repo 강화 정책 | MUST | critical |
| P3 | marketplace.json 필수 = `name`(kebab)·`owner`(`.name`)·`plugins[]`(각 `name`+`source`). 위치 = `.claude-plugin/marketplace.json` | "Marketplace schema / Required fields" | MUST | high |
| P4 | 3-way version sync — `plugin.json`(SSOT) ↔ `CHANGELOG.md` 최상단 ↔ root `package.json`. `version-check.js` 강제 | 공식 = plugin.json SSOT / 본 repo = `version-check.js` | MUST | high |

---

## §6. 공식 docs pin baseline (★ ★ ★ ADR-010 baseline 차용 — drift 검증 기준)

> `last_verified` = check #12 가 읽는 staleness 결정 필드 (date 산술 / 네트워크 ❌).
> `digest_sha` = `sha256(trim(pinned_guidance_digest))` 선두 12 hex. check #12 가 재계산 일치 결정적 assert → digest 변경과 commitment 동반 이동 강제 (날짜만 갱신·digest 무단편집 동시 차단 / §9 Layer i 불변식).
> `pinned_guidance_digest` = §9 네트워크 재검증의 diff 대상. 본 표는 실 F-015 dispatch 결과 seed (암기 작성 ❌ = no-simulation 정합).

| area | official_url (canonical) | content_anchor | pinned_guidance_digest | digest_sha | last_verified | retrieved |
|---|---|---|---|---|---|---|
| skills | https://code.claude.com/docs/en/skills | "Configure skills" → "Frontmatter reference"/"Skill content lifecycle" | SKILL.md ≤500줄·reference 분리 link / `name` lowercase+숫자+하이픈 ≤64 / `description`=trigger·핵심선두·≤1536c / single-responsibility / imperative voice / 공식 frontmatter 15종(allowed-tools·disable-model-invocation·user-invocable·when_to_use·argument-hint·arguments·model·effort·context·agent·hooks·paths·shell) / context:fork 는 explicit task 필요 / auto-compaction 재첨부 = skill 당 선두 5000 토큰·재첨부 공유 25000 토큰 budget(최근 invoke 우선) | ea06dc97470e | 2026-05-17 | 2026-05-17 |
| hooks | https://code.claude.com/docs/en/hooks | "Hooks reference" → "Hook lifecycle"/"Exit code output"/"JSON output" | 공식 event 29종 / exit 0=stdout JSON·2=blocking(stderr)·기타=non-blocking / 정책강제=exit 2 / JSON: continue·suppressOutput·systemMessage·decision:block·hookSpecificOutput.{hookEventName,permissionDecision(allow/deny/ask/defer),additionalContext} / matcher 3규칙(event-group wrapper) / per-handler if=permission-rule filter(Bash(git *)·Edit(*.ts))·tool 이벤트(PreToolUse·PostToolUse·PostToolUseFailure·PermissionRequest·PermissionDenied) 한정 / matcher≠if 별개·공존·비폐기 / common handler field if·once(skills/agents 한정)·timeout default 600(command/http/mcp_tool)·30(prompt)·60(agent) / hook type 5종(command·http·mcp_tool·prompt·agent) / JSON 추가 permissionDecisionReason·terminalSequence·stopReason / ${CLAUDE_PLUGIN_ROOT}·${CLAUDE_PROJECT_DIR}·${CLAUDE_PLUGIN_DATA} / parallel+dedup / resume=SessionStart 재실행 source:resume·mid-session replay / 출력 10000자 cap | 89f2f4fdf55e | 2026-05-17 | 2026-05-17 |
| sub-agents | https://code.claude.com/docs/en/sub-agents | "Configure subagents" → "Supported frontmatter fields" | single .md+frontmatter / body=system prompt / 필수=name·description 2종만 / optional 14종 incl. `skills`(preload·plural) / model: sonnet·opus·haiku·full-id·inherit / description=위임 trigger / 자체 context window·재spawn ❌ / plugin agent 은 hooks·mcpServers·permissionMode 무시 / `system_prompt`·`preloaded_skills` 미존재 | 5a0b74658955 | 2026-05-17 | 2026-05-17 |
| plugins-reference | https://code.claude.com/docs/en/plugins-reference (+ /plugins, /plugin-marketplaces) | "Plugin directory structure"/"Plugin manifest schema"/"Marketplace schema" → "Required fields" | .claude-plugin/=plugin.json(+marketplace.json)만 / 컴포넌트=root / manifest optional·`name`만 필수(kebab) / version·description·author optional / semver=semver.org 위임 / marketplace 필수 name·owner.name·plugins[] / ${CLAUDE_PLUGIN_ROOT}·_DATA·PROJECT_DIR / commands/=legacy(skills/ 권장) / plugin name=skill namespace(변경=breaking) / version 우선순위 plugin.json>marketplace>git SHA / 추가 optional channels(stable)·userConfig·dependencies(semver)·lspServers·outputStyles / experimental.{themes,monitors}=schema may change caveat | b0e11058b05e | 2026-05-17 | 2026-05-17 |

---

## §7. 현 구현 compliance 매트릭스 (★ charter §2 패턴 / 감사 2026-05-17 / 실 cross-check)

| asset | rule | 판정 | severity | 근거 |
|---|---|---|---|---|
| 47 skills frontmatter keys | S6 | ✅ | — | 47/47 공식 키(name·description·allowed-tools)만 사용 |
| 47 skills 본문 길이 | S1 | ✅ | — | 47/47 ≤ 500줄(max 197) + out-of-tree ref cite = progressive disclosure 정합 (★ "retrofit 필요" 가설 = false-positive 제거) |
| 47 skills description | S2 | ✅ | — | 47/47 존재·trigger형·≤1536c (213~419c) |
| `spec-integrate-deliverables` name | S3 | ✅ | — | ★ **resolved v8.0.0** (was `spec-integrate-7대-deliverables` / 한글 → kebab rename / DEC-2026-05-17-skill-name-rename / §8-1 종결). 현 name = 공식 charset `[a-z0-9-]` 정합 |
| `_base-*` skill ×5 + agent ×3 name | S3/A1 | ⚠️ | low | leading `_` = 공식 skill charset 밖. 의도적 base/utility grouping 관례 / 393 test 무결 / 수정=rename=breaking → 이연·문서화(§8-2) |
| 9 agents frontmatter | A1·A2 | ✅ | — | 9/9 name+description 필수 충족 / 키 전부 공식(`skills` 포함=공식 preload / 자체확장 ❌) |
| hooks.json events | H1 | ✅ | — | SessionStart·UserPromptSubmit·PreToolUse = 공식 29종 subset (★ event 29 + matcher 실재·비폐기 = F-015 재확인 2026-05-17) |
| hooks.json exit/path | H2·H6 | ✅ | — | PreToolUse deny=exit 2 ($comment 확인) / `${CLAUDE_PLUGIN_ROOT}` 사용 |
| hooks.json per-handler `if`/`timeout` | H8 | ✅ | — | 미사용 = optional 정합 (H8 = 권장 informational / `matcher` 만으로 충족 / 강제 ❌) |
| .claude-plugin/ 구조 | P1 | ✅ | — | `plugin.json`+`marketplace.json` 만 (★ marketplace.json 위치 = 공식 정합 / "P1 위반" 가설 = false-positive 제거) |
| plugin.json 필드 | P2 | ✅ | — | name(kebab)+version+description+author+homepage+license+keywords (필수 name 충족) |
| marketplace.json | P3 | ✅ | — | name·owner.name·plugins[] 충족 |
| version 3-way | P4 | ✅ | — | DEC-2026-05-17-package-version-3way-sync-fix 선행 청산 (4.0.1→7.0.0) → version-check exit 0 |

**결론**: S3 high 1건 = ★ **v8.0.0 종결** (한글 skill rename / DEC-2026-05-17-skill-name-rename). 잔여 = S3/A1 1군(⚠️ low / 수용 후보 / §8-2). 나머지 전 규칙 정합. 실 F-015 cross-check 가 가설 3건(S1 retrofit·marketplace 위치·`skills` 자체확장) false-positive 제거. ★ v8.2.0 재검(F-015 ×5 / 2026-05-17) — 4 area 중 skills·sub-agents·plugins = VERIFIED-IDENTICAL / hooks = VERIFIED-WITH-DELTA(S8·H8 additive 보강 / 거짓 0). Explore pre-research 가설(event 30+·name-only required·P2 stale) = 실 F-015 가 모두 반증 (research 수렴 ≠ 사실 / LL-plugin-02).

---

## §8. Remediation backlog (★ 본 SSOT 신설 시 비실행 — 별도 user-gated bundle)

| 순위 | 항목 | severity | breaking | 후속 |
|---|---|---|---|---|
| ~~1~~ | ~~`spec-integrate-7대-deliverables` → kebab rename~~ | ~~high~~ | ~~MAJOR~~ | ★ **종결 v8.0.0** (`spec-integrate-deliverables` / git mv + 4 active-code ref + 7 active-doc / Senior GO+REVISE / STOP-gate / DEC-2026-05-17-skill-name-rename / ADR-PLUGIN-001 §7 patch v1) |
| 2 | `_base-*` skill×5 + agent×3 leading `_` charset deviation | low | 수정=rename=breaking | ★ 수용 가능 후보(의도적 grouping·무결) — 차기 네트워크 재검증서 공식 charset 강제 여부 재평가 후 결단 (rename vs documented-exception) |

★ ADR-010 grandfather 차용: 위 항목 = baseline grandfathered. ratchet = **신규·수정 skill/agent 는 §2·§4 즉시 강제**.

---

## §9. 외부 권위 drift 재검증 메커니즘 (네트워크 cadence + 결정적 가드 2계층)

ADR-010 baseline+ratchet 를 **외부 권위(공식 docs)** 에 재적용. ADR-009 (네트워크=§2 dispatch / no-simulation) ↔ release-readiness(결정적·offline) 분리 정합.

### Layer (i) 네트워크 재검증 — 문서화 cadence (release-readiness 밖 / no-network 불변)

1. **cadence**: 60일마다 OR check #12 red OR plugin-authoring 관련 PR.
2. **dispatch**: `_base-official-docs-checker` (Task tool) ×4 (§6 area 별). 입력 = official_url + content_anchor + pinned_guidance_digest. 출력 = `[VERIFIED / CONTRADICTS / INSUFFICIENT-DATA]`.
3. **VERIFIED 분기 (★ v8.2.0 blind-spot closure)**:
   - **VERIFIED-IDENTICAL** (문서 = digest 와 동치 / delta 0) → §6 `last_verified`·`retrieved` 만 today (규칙 무변 / no version bump). digest 무변 → `digest_sha` 무변.
   - **VERIFIED-WITH-DELTA** (digest 의 모든 claim 참이나 문서가 신 사실 추가) → **동일 변경 안에서** §6 digest 재발행 + `digest_sha` 재산출 + 영향 §2~§5 규칙 additive 재정합 + DEC. last_verified 만 갱신하고 digest 방치 ❌ (= 본 메커니즘이 닫는 사각).
4. **CONTRADICTS** → (a) `_base-log-finding` F-XXX(severity per diff) (b) `DEC-YYYY-MM-DD-plugin-authoring-docs-drift.md` 신설 (c) §2~§5 규칙 + §6 digest + `digest_sha` + last_verified 갱신 (d) semver 영향 DEC 평가 (규칙 강화로 기존 자산 break 시 MAJOR 가능 / additive 시 MINOR·PATCH).
5. **INSUFFICIENT-DATA** → finding 만, `last_verified` 미갱신 (clock 지속 → check #12 red 유지 → human 주의 보장 / corpus fallback ❌ = checker 계약).

> **불변식 (★ v8.2.0)**: `last_verified` bump ⟺ 실 F-015 run 동반 AND `digest_sha` 가 현 digest 와 일관 (재산출 일치). 날짜만 fresh 한데 규칙 본문이 stale 한 사각 = digest_sha 결정적 결합으로 차단.

### Layer (ii) 결정적 staleness 가드 — release-readiness check #12 (offline / date-math)

- `plugin-authoring-spec.md` §6 표 4행 정규식 추출 (content-aware / `check10` 패턴 isomorphic / **7-cell** 파싱 — `|` 침입 시 fail-closed).
- `daysSince = today − last_verified`. **임계 60일**. pass ⟺ 4행 모두 ≤ 60일 AND 표 파싱(≥4행).
- **★ v8.2.0 digest_sha assert**: 각 행 `sha256(trim(digest))` 선두 12 hex == 커밋된 `digest_sha` 의무. 불일치 = fail (digest 변경 후 hash 미재커밋 / §9 Layer i 불변식 위반). → digest 와 commitment 동반 이동 강제 (날짜만 갱신·digest 무단편집 동시 결정적 차단 / content-correctness 증명은 불가하나 content-commitment 일관성은 결정적 / precedent check #13 · TUF metadata expires+hash).
- `--skip-authoring-staleness` flag = skip(≠pass) / release 시 본 flag 사용 ❌ 의무 (`--skip-workspace-test` 의미 mirror).
- 정당화: 네트워크는 비결정·offline 불가 → release-readiness 진입 ❌. 가드는 commit 된 date 산술 + digest_sha 재계산만 → 결정론·재현. 양심 의존 차단 = 본 repo 정의 패러다임 (precedent R2→#10·A1→#11·R18→#12·#13).

---

## §10. SSOT 선언 + cross-ref

- ★ 본 문서 = Skill/Hook/Agent/packaging 저작 규칙 + 공식 docs pin 의 **단일 SSOT**. 규칙·digest 변경 = 본 문서에서만.
- cross-ref (본 문서 가리킴 / 재선언 ❌):
  - `methodology-spec/plugin-charter.md` R18 (요구사항 SSOT → 본 spec pointer)
  - `docs/adr/ADR-PLUGIN-001-authoring-spec-and-docs-drift.md` (결정 원천)
  - `scripts/release-readiness.js` check #12 (§6 staleness 결정적 가드)
  - `CLAUDE.md` 핵심 디렉토리 § (pointer)
  - `methodology-spec/skills-axis.md` (skill 디렉토리 axis = 본 spec S3 와 상보 / 재선언 ❌)

---

## §11. 이력

- **v8.2.0 MINOR (2026-05-17 / DEC-2026-05-17-plugin-authoring-docs-drift / ADR-PLUGIN-001 §7 patch v4)** — 사용자 "공식 best practice 재확인+비교+개선". 실 F-015 ×5 재검 (skills/hooks/sub-agents/plugins-reference + matcher/if 정밀). 판정 = skills·sub-agents·plugins **VERIFIED-IDENTICAL** / hooks **VERIFIED-WITH-DELTA**. §2 S8 (auto-compaction budget) + §3 H8 (per-handler if·timeout default·handler 5종·matcher≠if) additive 신설 (H1~H7·A·P 무변 / 거짓 0). ★ META blind-spot closure — §6 `digest_sha` 컬럼 + check #12 sha-equality assert + §9 Layer i VERIFIED-IDENTICAL/WITH-DELTA 분기 + 불변식. Explore pre-research 가설(event 30+·name-only·P2 stale) = 실 F-015 모두 반증 (LL-plugin-02). breaking 0 = MINOR.
- **신설 (2026-05-17 / v7.1.0 MINOR / DEC-2026-05-17-plugin-authoring-spec)** — §1~§11. §6 pin = 실 `_base-official-docs-checker` F-015 VERIFIED ×4 (skills/hooks/sub-agents/plugins-reference / canonical `code.claude.com/docs/en/*`). 감사 결과 §7 (실 위반 S3 1건 ❌ + 1군 ⚠️ / false-positive 3건 제거) + §8 이연 backlog. Layer ii = release-readiness check #12 (60일). ADR-PLUGIN-001 + charter R18 정합.
