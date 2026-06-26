# MIGRATION — v1.x → v2.0 (chain harness validated)

> sub-plan-6 / Senior F7 흡수 — v2.0.0-rc1 청자 (사내 onboarding + 외부 plugin install user) 별 migration guide.

## 핵심 변경 한 줄 요약

> v1.x 는 **legacy → 산출물** 한 방향 추출기. v2.0 은 **legacy → planning → spec → test → impl** 4 stage chain harness.

## 호칭 변경

| 영역        | v1.x                                      | v2.0                                                           |
| ----------- | ----------------------------------------- | -------------------------------------------------------------- |
| description | "Legacy 코드 → 산출물 한 방향 추출기" | "SDLC 4단계 chain harness"                                     |
| flow SSOT   | analysis.phase-flow.json                  | flows/sdlc-4stage-flow.json (analysis = sub_flow)              |
| skill 진입  | 사용자가 skill 직접 호출                  | `/chain-next` 또는 `/chain-stage <name>` (chain-driver mediated) |

## 변경 항목 (Breaking)

### 1. workflow paradigm

v1.x:

```
사용자: /init
→ skill 호출 → 산출물 → 끝
```

v2.0:

```
사용자: chain-driver init <project>      # .ai-context/state.json 초기화
사용자: /chain-next                          # chain 1 (planning) 진입
→ planning-spec 생성 → planning-extraction-validator pass → gate #1 결단
사용자: /chain-next                          # chain 2 (spec)
사용자: /chain-next                          # chain 3 (test / RED 의무)
사용자: /chain-next                          # chain 4 (impl / GREEN 100% pass 의무)
→ traceability-matrix 100% green / release-ready
```

**v1.x skill 직접 호출 시도** → mechanical gate trio 가 차단할 수 있음:

- (i) state.blocked=true → 후속 chain-driver 명령 모두 exit 2
- (ii) cli exit 2 + "blocked" 메시지 반복
- (iii) PreToolUse `permissionDecision: deny` 로 `.ai-context/output/**` 대상 Write/Edit 차단

→ skill 진입은 **사용자 명시 결단** (`/chain-next` slash command) 만 (D21' 정합 / hooks suppressOutput=true / LLM 양심 우회 차단).

### 2. state.json 영속 의무

v2.0 사용자 프로젝트 디렉토리에 `.ai-context/state.json` 자동 생성 (`chain-driver init`).

```json
{
  "version": "1.0",
  "project_id": "<basename>",
  "current_chain": "analysis",
  "stage_progress": {
    "analysis":  { "status": "in_progress" },
    "planning":  { "status": "pending" },
    ...
  },
  "blocked": false,
  ...
}
```

v1.x 사용자: `.ai-context/` 디렉토리 부재 / state 영속 없음. v2.0 진입 시 driver init 의무.

### 3. 기존 산출물 재활용

v1.x 의 산출물 (rules.json / domain.json / openapi.yaml / schema.json / antipatterns.json / migration-cautions.md / inventory.json) **변경 ❌**. chain 1 (planning) 의 `derivation_source.analysis_artifacts` 로 그대로 reference.

```json
{
	"derivation_source": {
		"type": "legacy-extraction",
		"source_artifacts": [
			"input/rules.json",
			"input/domain.json",
			"input/inventory.json"
		]
	}
}
```

### 4. plugin.json + README 문구

v1.x 사용 사이트 README / 발표 자료의 "한 방향 추출기" → "SDLC 4단계 chain harness" 로 갱신.

## 전환 단계 (recommended)

### Step 1 — install v2.0.0-rc1

```bash
claude plugin install ai-native-methodology@2.0.0-rc1
```

(v2.0.0 final = rc1 + 24h+ Senior 검토 후 / Senior F4 정합)

### Step 2 — 기존 PoC 디렉토리에 chain harness 도입

```bash
cd <existing-poc-dir>
node /path/to/ai-native-methodology/tools/chain-driver/src/cli.js init .
ls .ai-context/
# state.json + output/
```

### Step 3 — chain 1 진입

기존 `output/rules.json` + `output/domain.json` 을 chain 1 입력으로 사용:

```bash
# planning-spec.json 작성 (사용자 manual or skill)
# validator 회귀
node /path/to/.../tools/discovery-extraction-validator/src/cli.js \
  --discovery .ai-context/output/discovery-spec.json \
  --rules output/business-rules.json \
  --domain output/domain.json
```

### Step 4 — chain 2 → 3 → 4 → matrix

- behavior-spec + acceptance-criteria 작성 (chain 2)
- test-spec + 진짜 test runner (chain 3 RED)
- impl-spec + 진짜 test runner (chain 4 GREEN)
- traceability-matrix-builder 로 matrix 생성

### Step 5 — release-readiness 검증

```bash
node /path/to/.../scripts/release-readiness.js --target v<your-version>
# 7/7 pass = release ready
```

## v2.0.1 trigger (Senior F7)

본 v2.0.0 release 후 다음 조건 1+ 발생 시 v2.0.1 hot-fix 즉시 발사:

- release-readiness criterion 1+ regress
- Senior critique HIGH 1+
- 7일 내 carry 신규 > 3건

## FAQ

**Q: v1.x 산출물 (`output/*`) 을 그대로 v2.0 production 시스템에 쓸 수 있나?**

A: 그대로 입력 자료 (chain 0 = analysis stage) 로 활용 가능. v2.0 의 chain 1~4 는 추가 채움 — 산출 ✅ / 변경 ❌.

**Q: v2.0 = BE-only corroboration 인가?**

A: ✅ — PoC #05 (sample-user-register / TS) + PoC #03 retrofit (NestJS / TS) 모두 BE 트랙. PoC #04 FE retrofit = sp6-c4 carry (v2.1+).

**Q: chain harness 의 70~80% 한계는?**

A: 여전히 명시 잔존 (master plan §J.2 옵션 A) — gate별 사용자 검토 ≤ 15% / 100% 자동화 ❌. mechanical trio 는 enforcement 강화이지 100% 자동화 도달 ❌.

**Q: chain-driver 실행 시 LLM 이 권고 skill 을 자동 invoke 하나?**

A: ❌ — D21' (suppressOutput=true + additionalContext 차단 문구) 로 LLM 컨텍스트 격리. 사용자 명시 slash command (`/chain-next` / `/chain-stage`) 만 진입 허용.
