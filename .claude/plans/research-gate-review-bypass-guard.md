# research — gate 검토 UX 우회 가드 (4원칙 §2 에이전트 팀 토론)

> 토픽: `chain-driver next --user-decision go` 가 go/stop/revisit 검토 UX(`_base-invoke-go-stop-gate` + plan-review-server 브라우저 검토)를 경유했는지 검증하지 않아 자동 통과되는 결함의 가드 설계.
> 일자: 2026-06-25 / 대상 버전: v0.76.0 / 작성: 메인 + 3 sub-agent 병렬 (가벼운 sub-agent 전략 / 시간 cap).

---

## 1. Senior 엔지니어 리뷰 (confidence 0.82)

**판정: 수정 채택 (Concern, not Block).** 진단은 코드로 검증됨. 제안 가드는 honest하게 보면 speedbump이며 §8.1 과적합 위험 큼.

- **escape hatch 실재 확인** — `cli.js:528` `applyUserDecision(gateResult, args.userDecision)` → soft reason(`findings_unverified`/`coverage_threshold`/`layer2_threshold`)은 `go`로 `go-with-warnings` 전환(`gate-eval.js:284`). `cli.js:721` `actor: args.userDecision ? 'user' : 'driver'` → **사람이 안 봤어도 `--user-decision go`만 있으면 무조건 `actor:'user'` 로 거짓 기록.** 가드 추가 전에도 **이미 거짓 기록**이라는 점이 핵심.
- **강도 차등은 메커니즘이 강제** (전 게이트 동일 ❌) — 마커는 LLM이 스킬 Write로 위조 가능 = 본질적 한계. ADR-CHAIN-005 §3 trio (iii)(state.blocked=결정론 파생 SSOT, LLM 생성 불가)와 **동급이 못 됨**. discovery/spec/plan(브라우저 게이트)은 plan-review-server `apply`가 **서버 프로세스 기록 토큰**(LLM 통과 불가) → 실벽에 근접. test/implement(텍스트 게이트)는 서버 토큰 불가 → speedbump → **honest하게 "advisory / D21' 재진입 nudge"로 라벨링** 의무. test/implement 마커를 "벽"이라 부르는 순간 no-simulation 정신 위반.
- **Auto Mode provenance = 진짜 델타 / 최고 ROI** — `actor:'user'`가 위임/가정 구분 못 하는 게 진짜 결함. 권고: `next`에 `--auto-mode` provenance 플래그 + intervention-log `actor` enum을 `user`(검토 경유) / `user_auto`(명시 위임) / `llm_assumed`(마커·플래그 없음) **3분**. 마커 위조와 무관하게 SSOT 정직성 즉시 상승. **마커 deny 가드보다 ROI 높음.**
- **exit code 신규 ❌** — ADR-CHAIN-005 §7 매트릭스 닫혀 있고 trio (iii)가 이미 exit 2 / `permissionDecision:deny` 사용. 신규 코드는 CI 계약·`chain-next.md` 해석표 파손. **exit 2 + `buildBlockOutput` 재사용.**
- **회귀 위험 大 + §8.1 (최우선 경고)** — 정상 흐름(sub-agent가 gate skill 종결 후 `/chain-next`)에서 마커 fresh-nonce가 동일 세션·동일 stage로 매칭돼야 하는데 scope/revisit/Auto Mode에서 stage 바뀌면 **false-block 폭발**. `examples/poc-*`(findings 직접 공급 비대화형) dogfood도 깨짐. **v0.76.0 단일 dogfood 1회**로 Bash matcher 신설 + deny 함수 + 마커 라이프사이클 + schema 확장 = 과설계. body 변경(deny 가드)은 **≥2 PoC corroboration 전까지 보류**가 charter 강제.
- **D21' 충돌 없음** — 가드는 LLM auto-invoke가 아니라 **직접 CLI 호출**을 막으므로 D21'를 **보강**.
- **최소 견고 버전**: ① `actor` 3-값화(결정론·위조불가·회귀 0) ② soft `go` 통과 시 stderr 1줄 비차단 nudge ③ discovery/spec/plan만 plan-review-server `apply` 토큰을 state에 결정론 기록 → **advisory**(deny ❌). ≥2 PoC 관측 후에야 Bash matcher deny로 격상.
- **Scope-out (명시 금지)**: test/implement 텍스트 게이트 deny형 마커 가드 / Bash matcher 신설을 1회 관측으로 격상 / 마커를 trio (iii) 동급 "벽"으로 ADR 기술.
- **미확인 1건**: plan-review-server가 `apply` 토큰을 실제 어디 기록하는지 → **메인이 후속 확인 완료** (server.js:285-287 `<phase>-revisions.json` `{timestamp,phase,next_action,groups}`).

---

## 2. 업계 사례 (위조 불가 사람-승인 게이트)

핵심 분기선 = **"승인 증거를 누가 발급하느냐"**. 서버(외부 권위) 발급 = 클라이언트 self-issue 불가 / 파일 마커 = 약함(외부 RBAC·FS ACL에 외탁).

| 증거 유형 | 대표 사례 | 봇 위조 가능성 |
| --- | --- | --- |
| 서버 발급 one-time UUID 토큰 (single-use, state-bound) | AWS CodePipeline `put-approval-result --token` | 낮음 (IAM 분리 전제) |
| 서버사이드 리뷰 레코드 + pusher≠approver 규칙 | GitHub branch protection / required reviews | 낮음 (bot account 정책 전제) |
| 접근제어된 환경 secrets 게이트 | GitHub Actions deployment environments | 낮음 (RBAC 전제) |
| 파일/어노테이션 마커 (자동화가 쓰기 가능) | Terraform plan file, ArgoCD `deletion-approved` annotation | **높음** — 접근제어 없으면 자동화가 직접 생성 |

- **GitHub PR**: merge API가 "다른 identity의 APPROVE 레코드" 없이 거부. pusher≠approver, dismiss-stale, CODEOWNERS. 한계 = bot 계정을 사람 취급하면 정책상 뚫림.
- **AWS CodePipeline**: 서버가 random GUID 발급 → single-use + state-bound + 7일 만료 + 별도 IAM 권한. `next --user-decision go`에 가장 유사한 직접 매핑.
- **Terraform plan→apply**: plan 파일은 암호 서명 없는 opaque binary → 위조 방지는 파일이 아니라 **파이프라인 시퀀싱**에서 옴. "LLM이 쓴 파일 마커"가 얼마나 약한지 보여주는 반례.
- **ArgoCD annotation**: 타임스탬프 있으나 서명 없음 → RBAC만이 위조 차단. `.approval` 파일을 LLM이 쓸 수 있으면 동등하게 약함.

**전이 패턴 2개**:
- **패턴 A (강)** — 외부 권위(plan-review-server 브라우저 "apply" 클릭)가 토큰 발급 → CLI는 verify만. AWS 모델. LLM의 `--user-decision go` 파라미터 주입과 "실제 사람 클릭"을 분리 가능.
- **패턴 B (현실적 상한)** — PreToolUse deny + 마커를 스킬 전용 쓰기. ArgoCD+RBAC 등가. 단 스킬 자체가 사람 확인 없이 마커를 쓰면 Terraform plan 수준(약)으로 추락.

→ **결론**: plan-review-server `<phase>-revisions.json`(서버 기록)은 패턴 A의 약한 형태(서명·single-use는 아니나 서버 프로세스 기록). LLM-writable state 마커는 패턴 B 하한. **둘의 신뢰도 차이가 게이트별 강도 차등의 업계 근거.**

---

## 3. 공식문서 검증 (Claude Code hooks / 2026-06-25 fetch / 전부 VERIFIED)

출처: https://code.claude.com/docs/en/hooks , https://code.claude.com/docs/en/agent-sdk/hooks

| # | 검증 항목 | 결과 |
| --- | --- | --- |
| 1 | `"matcher": "Bash"` + `tool_input.command` stdin | ✅ exact match 동작 / command 문자열 stdin JSON으로 수신 |
| 2 | 차단 메커니즘 | ✅ PreToolUse 권장 = `hookSpecificOutput.permissionDecision:"deny"` + `permissionDecisionReason`. exit 2도 유효. ⚠️ `decision:"block"`은 PreToolUse용 아님(UserPromptSubmit/PostToolUse/Stop 등). ⚠️ `if`-필터 best-effort fails-open → **command 검사는 훅 스크립트 내부에서** (matcher if-filter 의존 ❌) |
| 3 | subagent Bash에도 발동? | ✅ **발동함**. 훅이 subagent 컨텍스트 내부 발동, `agent_id` 필드로 식별. 플러그인 hooks.json은 subagent 포함 전 세션 적용. ⚠️ UserPromptSubmit이 subagent spawn 시 무한루프 주의(`agent_id` 체크) |
| 4 | "특정 스킬 선행 실행" 인지? | ❌ 훅은 호출 시점 input만 봄. 세션 이력·스킬 실행 플래그 native 신호 **없음** → **외부 state 파일 마커를 훅 스크립트가 직접 read**해야 함(의도된 패턴) |
| 5 | 플러그인 hooks.json PreToolUse 자동등록? | ✅ 지원 / 활성화 시 user·project 훅과 병합. (statusLine 불가 제약은 hooks와 무관) |

⚠️ 현 `buildBlockOutput`(hooks-bridge.js:65)은 `decision:'block'` + `permissionDecision:'deny'` 둘 다 set — PreToolUse에선 `permissionDecision`만 유효하므로 동작은 하나 latent 불일치(별도 정리 후보).

**설계 성패 판정**: "PreToolUse Bash 훅으로 `chain-driver next --user-decision go`를 마커 부재 시 deny" 설계는 **동작한다 + subagent에도 적용된다**. 단 마커는 훅 외부 state 파일로 직접 read해야 하고, hard block은 command 문자열 검사를 훅 스크립트 내부에서 수행.

---

## 4. 3자 수렴 결론

1. **위조 불가 신호는 plan-review-server `apply` 토큰뿐** (서버 기록 / discovery·spec·plan 한정). LLM-writable state 마커는 speedbump.
2. **provenance 정직화(3-값 actor)가 최소·최고 ROI·회귀 0·결정론** — 차단이 아니라 "누가 결정했나" 거짓 기록을 멈추는 것. 사용자 불만(자동 통과)을 **loud + auditable**하게 만드는 직접 처방.
3. **PreToolUse Bash deny는 기술 가능 + subagent 적용**되나, test/implement선 speedbump라 정직 라벨링 필수 + **§8.1상 ≥2 PoC 전 deny 격상은 과적합** → Phase 분리.

→ plan.md의 **Phase 1(정직화 / 지금) + Phase 2(graded deny / ≥2 PoC 후)** 구조로 반영.

## 인용
- ADR-CHAIN-002 (go/stop gate UX) / ADR-CHAIN-005 §3 trio·§4 D21'·§7 exit matrix
- DEC-2026-06-19-plan-review-server / feedback_chain_driver_deterministic_axis / feedback_no_static_tool_simulation / 품질우선 §8.1
