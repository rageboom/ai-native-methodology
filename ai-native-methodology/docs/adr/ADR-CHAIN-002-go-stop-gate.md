# ADR-CHAIN-002: go/stop gate UX — 5 gate 사용자 결단 의무 (★ v10.0.0 본격)

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-06 (★ v10.0.0 / 2026-05-25 — Phase 4-4' 본격 갱신 / gate #1~#5 / DEC-2026-05-25-axis-a-phase-4-4-prime 정합)
- 결정자: 윤주스 (TF Lead)
- 관련: DEC-2026-05-06-v2.0-i-strict-채택 (★ trigger), DEC-2026-05-25-axis-a-phase-4-4-prime (★ v10.0.0 gate 재번호), ADR-CHAIN-001 (chain 정합 강제 / 본 ADR §5 인용), ADR-CHAIN-003 (revisit loop / 본 ADR 와 결합), Work Principles 4 원칙 §3 (사용자 승인 후 코드 착수)

## 컨텍스트

v10.0.0 chain 5단계 (discovery → spec → plan → test → impl / ★ v9.0 discovery 개칭 + plan 신설 + v10.0.0 Phase 4-4' gate 재번호) 의 각 단계 종결 시 **사용자 명시 결단**으로 다음 단계 진입 여부 결정. ADR-CHAIN-001 §5 = "go/stop gate #1~#5 = 사용자 명시 결단 의무". ★ chain N = gate #N 1:1 INTERNAL CONVENTION.

UX 결정 영역:
- 사용자 prompt 형식 (질문 / 정보 / decision options)
- Auto Mode 위임 가능 여부
- 결단 trace 보존 의무
- 묶음 결단 (5~6 핵심 결정 cluster) 호환

본 방법론 4 원칙 §3 ("사용자 승인 후 코드 착수 — plan + research 완성 후 반드시 질문. 일괄 승인 패턴") 정합.

## 결정

**5 gate UX 정책** 명문화 (★ v10.0.0):

### 1. gate #1~#5 prompt 형식

각 gate 종결 시 사용자에게 다음 정보 제시:

```
[gate #N] chain {N} 단계 종결 — 다음 단계 진입 여부

산출물:
- {primary deliverable path} (.json + .md)
- traceability-matrix 갱신 (forward+backward link {coverage}%)

검증:
- {validator names} 모두 0 violation
- coverage threshold 통과 / 미달
- (gate #3 plan) plan-coverage-validator critical=0 + NFR allocation hard gate + dependency cycle 0
- (gate #5 impl) test_pass_rate = 1.0 / fail_count = 0

결단 cluster:
1. ★ go (다음 단계 진입)
2. ★ ★ stop + revisit (이전 단계 회귀)
3. stop + abort (chain 종결)

결단 사유 (명시 의무 / intervention_log 보존)
```

### 2. Auto Mode 위임 정책

- Auto Mode 활성 시 = ★ 사용자 명시 토글 ❌ → ★ 일반 결단 영역
- Auto Mode 활성 시 = ★ 일반 결단 = 결단 자동 위임
- 단 ★ ★ ★ **gate #5 (impl → done) = Auto Mode 위임 ❌** — 사용자 명시 결단 의무 (★ 70~80% 한계 + 재검토 정합)
- gate #1~#4 (discovery / spec / plan / test) = Auto Mode 위임 허용 / 단 intervention_log 자동 기록

### 3. 결단 trace 보존 의무

```yaml
intervention_log entry:
  gate: "#1" | "#2" | "#3" | "#4" | "#5"
  timestamp: ISO 8601
  decision: "go" | "stop+revisit" | "stop+abort"
  reason: string (사용자 명시 또는 Auto Mode 사유)
  delegated_to_auto_mode: boolean
  validator_outputs:    # 결단 시점 검증 도구 결과 snapshot
    - validator_name: string
      result: pass | fail
      violation_count: integer
```

`impl-spec.json` 의 `human_review.intervention_log` 에 보존 (chain 4 종결 시 traceability-matrix 와 동시 commit).

### 4. 묶음 결단 (cluster) 패턴 호환

본 방법론 절대 우선순위 ("재작업 최소화 2순위") + 4 원칙 §3 일괄 승인 패턴 정합.

- 단일 gate 안에서 **5~6 핵심 결정** 묶어 한 번 prompt
- AskUserQuestion 도구 호출 (≤ 4 questions / Plan mode 외부)
- 결단 1건당 결단 시간 ↓ + 단계 마찰 ↓

### 5. revisit trigger 정합 (ADR-CHAIN-003)

- 자동 revisit (chain-revisit-detector) detect 시 → ★ 가장 가까운 gate 의 prompt 형식으로 사용자 결단 요청
- revisit decision = `stop+revisit` 의 sub-type
- intervention_log 에 trigger source (자동 / 수동) 명시

## 학문적 계보

### Industry 사례 (Industry research)
- **Aider** `/ask` ↔ `/code` mode 전환 (verifiable=true ⇔ /code 진입 gate)
- **GitHub Copilot Workspace** Task → Spec → Plan → Code 4 phase + human approval at each step
- **Cursor Composer** plan dialog → "Build" button (gate marker)

본 ADR-CHAIN-002 = ★ 산업 사례의 **본 방법론 4 원칙 §3 정합 통합**.

### 4 원칙 §3 직접 정합
- "사용자 승인 후 코드 착수 — plan + research 완성 후 반드시 질문. 일괄 승인 패턴 (5~6 핵심 결정 묶음, Auto Mode 호환)"
- 본 ADR §1+§2+§4 = 본 4 원칙의 chain stage 화

## 결과

### 긍정적 영향
1. 사용자 cognitive load 통제 (Auto Mode 위임 + cluster 패턴)
2. gate #4 사용자 명시 결단 의무 = 70~80% 한계 명시 정합
3. intervention_log = 감사 / 재현 / Lessons Learned 추적
4. 4 원칙 §3 자연 확장
5. 산업 사례 (Aider / Copilot Workspace) 권위 확보

### 부정적 영향
1. **gate 마찰** — 5 gate × 매 cycle / 완화: cluster 패턴 + Auto Mode 위임
2. **gate #5 강제 = Auto Mode 비호환** — 1 gate 만 강제 / 합리

## 대안 (검토 후 거부)

### 대안 1: 모든 gate Auto Mode 위임
- 거부 이유: gate #5 (impl GREEN 의무) = 70~80% 한계 영역 / 사용자 검토 ≤ 15% 정합 위배.

### 대안 2: gate 사용자 prompt 자유 형식
- 거부 이유: intervention_log 표준 부재 → 감사 / 재현 차단.

## 적용 시점

- sub-plan-5 (hooks + harness) 에서 gate skill (`skills/_base-invoke-go-stop-gate/`) 신설 시 본 ADR 정식 운영
- sub-plan-3 의 chain-coverage-validator / test-impl-pass-validator 산출물에 intervention_log 필드 호환

## 변경 이력
- 2026-05-06: 신설 (sub-plan-2).
- 2026-05-25: ★ ★ ★ v10.0.0 본격 갱신 (Phase 4-4' / DEC-2026-05-25-axis-a-phase-4-4-prime) — 4 gate → 5 gate / plan gate (#3) 신설 / gate 재번호 (test #3→#4 / impl #4→#5) / Auto Mode 위임 정책 갱신 (gate #5 impl 만 ❌).
