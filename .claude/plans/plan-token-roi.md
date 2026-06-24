# plan — 토큰 절감 ROI 측정 하니스 (`token-roi`)

> 워크트리 `worktree-token-roi-probe` (origin/main fresh 분기). 4원칙 §1 산출물.
> 목표: "우리가 하는 토큰 절감 작업이 얼마나 효율 있는지" 를 **정직한 실측 숫자**로 커맨드 한 방에 보고.

---

## 0. 사용자 의도 & 정직성 제약 (확정)

- 사용자 원의도: "**어떤 커맨드를 입력하면 여직까지 개별 수단으로 절감된 수치를 보고 싶다.**"
- 측정 대상 = **셋 다 비교** (codegraph / headroom / 표준 컨텍스트 절감).
- 측정 방법 = **A/B 실측 하니스**.

### 정직성 결론 (실측 grounding 완료 — 이 turn 의 stats)

| 수단 | "여직까지(사후 누적)" 가능? | 근거 |
| --- | --- | --- |
| headroom | **부분 가능** | `headroom_stats` 에 실재 카운터 있음. 단 `Cache savings`($1686)=공급자 프롬프트 캐시(우리 아님), `Compression savings`($73.73/12.6%)=headroom 진짜 기여분. **합산 금지 — compression line 만 우리 절감.** |
| codegraph | **불가** | `codegraph_status`=인덱스 크기만. "grep 대신 써서 아낀 토큰" 카운터 부재. 절감액이 반사실(counterfactual)이라 사후 복구 ❌. |
| 표준 절감 | **불가** | 서브에이전트 격리·포인터가 아낀 양 로깅 부재. |

→ **"여직까지 누적"은 codegraph·표준절감은 원천적으로 못 만든다 (과대보고 위험).**
→ 대신 **지금부터 재현 가능한 A/B 델타**를 내는 커맨드를 만든다. headroom 은 실재 카운터(compression line)를 그대로 끌어온다.

> ⚠️ 안티-인플레이션: 이 하니스는 "절감 X%" 를 자랑하는 마케팅 숫자가 아니라 **재현 가능한 측정 절차**다. 모든 출력에 측정 방법·토크나이저·표본을 명시한다 (LL 액면수용 금지 / research 사실정정 의무 정합).

---

## 1. 측정 설계 — 결정론 byte/token 회계 (LLM 변동 배제)

LLM run-to-run 변동은 A/B 를 noisy + 비재현으로 만든다. 그래서 **"같은 정보 요구를 충족하는 데 컨텍스트로 끌려온 토큰량"** 을 결정론적으로 측정한다. 각 수단은 다른 레이어에서 동작 → 레이어별 A/B 정의:

### 1-A. codegraph (agent decision layer)
동일 "where is X / how does X work" 질문 N개(표본) 에 대해:
- **Arm A (baseline)**: `grep -rn <term>` + 히트 파일 `cat` → 끌려온 바이트 합 → 토큰.
- **Arm B (codegraph)**: `codegraph_context` + `codegraph_explore` 출력 → 토큰.
- **delta = A − B** = 그 질문에서 codegraph 절감.
- 결정론적·재현 가능 (LLM 미개입).

### 1-B. headroom (API proxy layer)
- A/B 토글이 proxy 라 어려움 → **`headroom_stats` 의 compression line 을 그대로 보고** (cache line 제외).
- 표본 요청 1건을 compress on/off 로 token count 비교하는 micro-check 는 옵션(가능하면).

### 1-C. 표준 컨텍스트 절감 (orchestration layer — sub-agent 격리)
- **Arm A (격리 없음)**: 메인이 파일 전부 read → 메인 컨텍스트에 파일 토큰 적재.
- **Arm B (격리)**: 서브에이전트가 read 후 결론만 반환 → 메인엔 요약 토큰만.
- **delta = 파일토큰 − 요약토큰** = 격리 절감. 결정론적 회계로 근사.

### 토크나이저 (D1 확정 — claude-api 스킬 grounding)
- **확정: Anthropic `count_tokens` 엔드포인트** (`/v1/messages/count_tokens`, 모델별, **무료**=토큰 과금 없음). `ant messages count-tokens` CLI 또는 SDK `messages.count_tokens(model, messages)`.
- **`tiktoken`/오프라인 근사 금지** — claude-api 스킬 명시: Claude 토큰을 텍스트 ~15-20%, **코드에서는 그 이상 과소계산**. "정직한 숫자" 원칙과 충돌 → 측정 신뢰도 훼손.
- 공식 오프라인 Claude 토크나이저 부재 → API 가 유일한 정확 경로.
- **fallback**: API/`ant` 인증 불가 환경에서만 `chars/4` 근사 + **"추정치(±20%)" 라벨 강제 출력**. 기본 경로 아님.

---

## 2. 산출물 / 배치

| 항목 | 위치 | 비고 |
| --- | --- | --- |
| 코어 하니스 | `plugins/context-ops/scripts/token-roi-bench.js` | 결정론 회계 + 표본 task 정의 + 토크나이저 추상화. SSOT. |
| 표본 task 세트 | `plugins/context-ops/scripts/token-roi-tasks.json` | "정보 요구" 표본 (codegraph/격리용). 재현성 위해 고정. |
| 커맨드 래핑 | TBD: skill `token-roi` vs `commands/` dir | context-ops=skill 기반. research/결정 후 택1. |
| 테스트 | `plugins/context-ops/scripts/test/token-roi-bench.test.js` | 회계 로직 단위 (토큰 합/델타 계산). |
| 결과 리포트 | stdout 표 + `--json` 옵션 | 수단별 delta + 측정방법 footnote. |

---

## 3. 작업 단계

1. **research (§2 4원칙)** — (a) 토크나이저 선택(count_tokens vs 오프라인) (b) 업계 agent token-ROI 측정 선례 (c) headroom stats cache/compression 분리 정당성 재확인.
2. plan 승인.
3. 코어 하니스 + 표본 task + 토크나이저 추상화 구현.
4. codegraph arm / 격리 arm 결정론 회계 구현.
5. headroom stats 파서 (compression line 만).
6. 단위 테스트 (회계 계산).
7. 커맨드 래핑 + 리포트 출력.
8. 본인 레포에서 dry-run 실측 1회 → 숫자 sanity.

---

## 4. 미결 / 결정 필요

- **D1 토크나이저**: count_tokens API(정확/네트워크) vs 오프라인 근사(빠름/추정). → research 후 권고.
- **D2 커맨드 형태**: context-ops skill 신설 vs `commands/token-roi.md`. (skill 일관성 ↑ / commands 는 mis-backend-spring 선례만)
- **D3 티켓**: 이 작업 = 마켓플레이스 인프라 → OP Task(MIS-366 하위)? 브랜치명 컨벤션(티켓키 단독)과 충돌 — 현재 워크트리 브랜치 `worktree-token-roi-probe` 는 provisional. 정식화 시 OP-* 티켓 발급 후 정렬 필요 (confirmation gate).
- **D4 표본 task 범위**: 표본 N (codegraph/격리) = examples/ PoC 코드 기준 몇 건? (codegraph dogfood=examples/ 정합)

---

## 4.5 research 결과 (4원칙 §2 / industry-case-researcher)

- **counterfactual 토큰 회계(도구 on/off 델타)는 학계·산업계 모두 공식 수치 부재** — Aider repo map·ChatDev Tokenomics 모두 단계/정성 서술뿐. → 우리 = 미개척(원조) 영역.
- **측정 함정 3종 실증**: (a) 캐시 hit=절감 오독 → 최대 2× 과대보고(arXiv 2601.06007), (b) 손실형 요약=절감 계상 시 품질손실 은폐(arXiv 2503.19114), (c) 단발 run=변동 무시. → **우리 설계가 셋 다 구조적 회피**.
- **count_tokens 자체가 "estimate" 라벨** + Opus 4.7+ 토크나이저 ~30%↑ → **모델 버전 고정 필수**(스크립트 `claude-opus-4-8` 하드코딩으로 충족).
- LangSmith unified cost tracking = 가장 가까운 준공개 A/B 인프라(but 변동통제는 사용자 책임).
- 출처: arxiv 2601.14470 / 2601.06007 / 2503.19114, aider.chat/docs/repomap, platform.claude.com token-counting, langchain changelog.

## 4.6 live 결과 (worktree dry-run, estimate 모드)

```
codegraph 평균 절감 64.5% (T2 28.8% ~ T4 78.6%)   sub-agent 격리 평균 89.8%
표본 5 task / poc-18 modern-TS / tokenizer=estimate(chars/4) ⚠ / codegraph=available
```
- 산출물: `scripts/token-roi-bench.js` + `token-roi-tasks.json` + `test/token-roi-bench.test.js`(5/5 pass) + `skills/token-roi/SKILL.md`.
- count_tokens cred 부재 env → estimate 모드. 비율% 견고 / 절대치 "estimate" 라벨 자동.

## 4.7 FINDING — 에이전트 skills: preload over-provisioning (검증 전 보류)

**사실 (검증됨)**: Claude Code subagent frontmatter `skills:` = 해당 스킬 **본문 전체를 서브에이전트 컨텍스트에 시작 시 주입**(공식 문서: "full skill content is injected, not just the description"). claude-code-guide 확인. context-ops "사전 주입" 서술 = 정확.

**실측 (dispatch당 preload, 서브에이전트 컨텍스트 / 메인 아님)**:
| agent | skills | preload tok |
| --- | --- | --- |
| analysis-agent | 36 | **~43.8k** 🔴 |
| discovery | 13 | ~15.4k |
| implement | 9 | ~14.2k |
| test | 8 | ~14.1k |
| spec | 8 | ~11.8k |
| plan | 7 | ~10.5k |

**관찰**: analysis-agent 36개 중 단일 실행이 다 쓰는 일 없음 — 입력 어댑터(7, 상호배타) + 트랙(FE/BE/DB) + 시나리오/옵션 = ~30k가 조건부. 단일 트랙 실행이면 ~25–30k 헛로드.

**왜 보류(A) — 강등 ≠ 공짜**:
- 강등(skills:에서 제거 → on-demand)해도 Skill 도구로 호출 **가능**(unlisted skill 호출 OK 확인). 하지만 **로드 여부가 라우터의 호출 판단에 의존** → preload는 그 불확실성을 제거하는 안전 기본값.
- dispatch 시점에 입력 채널(swagger/figma)·트랙(FE)을 **미리 모름** — input-orchestrate 가 분석 중 sniff해서 auto-dispatch. 즉 어댑터도 "자명한 라우팅" 아니라 **orchestrate 라우터 의존** (트랙 스킬과 동급 리스크).
- figma는 추가로 환경 게이트(데스크톱+프레임 선택).
- → 섣부른 강등 시 "FE 프로젝트인데 FE 스킬 누락" 등 **조용한 분석 누락** 위험.

**안전 회수 프로토콜 (별도 검증 작업)**: 강등 후보마다 (a) 명확한 라우터 존재 확인 → (b) 라우터가 실제 호출하는지 FE/BE/swagger PoC 실측 → (c) 통과분만 강등 + 라우팅 지시 추가. "삭제하고 끝" ❌.

**현 결정**: preload 유지(안전 기본값). 본 finding만 기록. 검증 프로젝트는 backlog.

## 5. 안 하는 것 (scope-out)

- 외부 토큰절감 도구(RTK/caveman) 재평가 ❌ (2026-06-18 비채택 결론, 재실측 불요).
- 커스텀 자동압축 훅 ❌ (표준 컨텍스트 절감 결론 정합).
- "여직까지 누적" codegraph/표준절감 사후 숫자 날조 ❌ (계측 부재 — §0).
- 프롬프트 캐시 절감을 "우리 절감" 으로 합산 ❌.

---

## 6. `/roi` on-demand 요약 — 플러그인 자산 격상 (2026-06-24)

> 배경: statusline 라이브 표시(headroom=머신 전역 프록시 → 세션 오독)를 빼고 on-demand 요약으로 전환. 사용자 결정 = **플러그인 자산으로 격상**(개인 `~/.claude/` → `/context-ops:roi` 배포).

### 변경 파일 (레포)
1. **NEW** `plugins/context-ops/commands/roi.md` — plugin command (`/context-ops:roi`). frontmatter `description:` 만. 본문 `!`node ${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-summary.js`` 실행 + 정직성 해설 지시.
2. **NEW** `plugins/context-ops/scripts/token-roi-summary.js` — 개인 .sh 의 Node 포팅(크로스플랫폼 / token-roi-bench·ledger-hook 와 동형). `~/.headroom/proxy_savings.json`(머신 전역 라벨) + 최신 `~/.claude/token-roi/ledger-*.jsonl`(cg ×1.8 estimate) 읽어 요약.
3. **EDIT** `skills/token-roi/SKILL.md` — `/roi`(개인) → `/context-ops:roi`(플러그인) 표기.
4. **EDIT** `CHANGELOG.md` + `.claude-plugin/plugin.json` + `package.json` — **v0.71.0 → v0.72.0** (MINOR, 호환 기능추가). 3-way 정합.
5. **EDIT** `context-ops/CLAUDE.md` 101행 "현재 plugin.json vX" 한 줄 갱신.

### 개인 자산 처분
- `~/.claude/commands/roi.md` + `~/.claude/token-roi-summary.sh` → 플러그인판 동작 확인 후 제거(`/roi` 가 `/context-ops:roi` 와 중복 shadowing 회피). statusline 편집은 본질상 개인 → 유지.

### 검증
- `pnpm build:diff-check`(카탈로그 드리프트 0) + `node scripts/version-check.js --plugin context-ops`(3-way) + `/context-ops:roi` 수동 실행.

### 거버넌스
- 레포 변경 → MIS-366 하위 OP Task 1개. 브랜치 = 티켓 키. PR.
- research(2원칙 3-agent) **생략** — 기계적 자산 relocation, 설계 결정 없음(§8.1 과적합/속도 trade 무관).

---

## 완료 (v0.72.0 / 2026-06-24)

작업 중 **계획에 없던 결함 발견** — v0.71.0 은 `build-plugin.js` INCLUDE allow-list 에 token-roi 런타임 스크립트가 빠져 **출하 시 깨지는** 상태(hooks.json 이 참조하는 `${CLAUDE_PLUGIN_ROOT}/scripts/token-roi-ledger-hook.js` 가 패키지에 부재 / v12.13.1 "scripts/ 패키징 누락"과 동류). 따라서 단순 relocation 이 아니라 **패키징 결함 수정**이 본질이 됨.

또한 사용자 결단으로 **Option 2(env 게이트 제거 → 플러그인 기본 always-on)** 채택 — 뷰어 커맨드(`/context-ops:roi`)도 함께 출하되므로 옛 opt-in "orphan ledger" 우려 해소.

**실제 변경**:
1. `build-plugin.js` INCLUDE += `scripts/token-roi-{bench.js,tasks.json,ledger-hook.js,summary.js}` + `commands`.
2. `commands/roi.md`(→`/context-ops:roi`) + `scripts/token-roi-summary.js`(개인 .sh → **Node 포팅** = 크로스플랫폼/jq·awk 의존 제거) 신설. 개인 `~/.claude/{commands/roi.md,token-roi-summary.sh}` 제거.
3. `token-roi-ledger-hook.js` env 게이트(`CONTEXT_OPS_TOKEN_ROI`) 삭제 → always-on. `~/.claude/settings.json` env 줄 롤백.
4. SKILL.md / hooks.json $comment 정정 + 3-way + CLAUDE.md 포인터.

### 재버전 통합 (v0.72.0 → v0.73.0)
머지 직전 발견 — 사내 main(origin-smilegate)이 PR #22~#25 로 앞서나가며 v0.71.0(discovery)/v0.71.1(S1)/v0.72.0(FE workspace)을 **다른 기능에** 이미 부여. token-roi 커밋(7a61a7ad/321fbfb6/a6031251)은 사내 main 에 미머지·번호 충돌. 사용자 승인으로 **사내 main 위 rebase + v0.73.0 단일 MINOR 통합**. build-plugin.js·hooks.json 은 사내 main==분기점이라 무손실 이식 / 버전-부기 5파일(plugin.json·package.json·CHANGELOG·CLAUDE.md·README)만 사내 main 내용 위 v0.73.0 수동 반영. 안전 태그 `backup-token-roi-pre-rebase`(=a6031251) 보존.

**검증**: version-check 3-way ✅ / 실 build dist 에 5개 자산 출하 확인 ✅ (.sh stale 없음) / bench test 5/5 ✅ / 훅 always-on smoke(codegraph 기록·비-codegraph 무시·exit 0) ✅ / Node summary 출력 동일 ✅.

**잔여 carry (불변)**: count_tokens 절대치 + agent preload 감사 강등 검증(§4.7). headroom 프록시는 본질상 개인 설정(`ANTHROPIC_BASE_URL`)이라 플러그인 미주입 — 미사용 시 "데이터 없음" 정직 표기로 수용.
