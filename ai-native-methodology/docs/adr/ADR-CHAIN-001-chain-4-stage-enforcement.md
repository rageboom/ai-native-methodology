# ADR-CHAIN-001: SDLC chain 4단계 정합 강제 정책

- 상태: 승인됨 (Accepted)
- 일자: 2026-05-06
- 결정자: 윤주스 (TF Lead)
- 관련: DEC-2026-05-06-v2.0-i-strict-채택 (★ trigger), DEC-2026-05-06-round-trip-부분-허용 (partial retract), ADR-001 (사상적 기반), ADR-008 (이중 렌더링 — v2 §10 확장 동반), ADR-009 (다이어그램 신뢰 모델 — v2 §2.5 확장 동반), ADR-010 (baseline+ratchet — v2 §2.6 확장 동반), ADR-CHAIN-002 (go/stop gate UX), ADR-CHAIN-003 (revisit loop), master plan `~/.claude/plans/a-stateful-gadget.md`

## 컨텍스트

v1.5.0 까지 본 방법론 = "코드 → 7대 산출물 한 방향 추출기" (DEC-2026-04-29-round-trip-스코프-아웃). round-trip = 영구 scope 외부.

2026-05-06 사용자 결단 (★ ★ ★ "A로 하고 싶다") → **(A) i-strict 채택** = 본 방법론 = SDLC 4단계 chain harness. 4 단계: planning (chain 1) → spec (chain 2) → test (chain 3) → impl (chain 4). 각 단계 AI 자동 생성 + 사용자 검토 (gate #1~#4) + revisit loop (자동 감지 + 사용자 결단).

DEC-2026-05-06-round-trip-부분-허용 = DEC-2026-04-29 partial retract — chain harness gate 안에서 round-trip 정식 허용 / 외부 자동 코드 생성 ❌.

이 새 정체성에는 **chain 정합 강제 정책의 사상적 기반 ADR** 부재 — 본 ADR 가 신설.

## 결정

**chain 4단계 정합 강제** 를 다음 6 정책으로 명문화:

### 1. 모든 chain stage 산출물 = ADR-008 v2 이중 렌더링 의무

| chain | AI 눈 | 사람 눈 |
|---|---|---|
| 1 (planning) | planning-spec.json | planning-spec.md |
| 2 (spec) | behavior-spec.json + acceptance-criteria.json | behavior-spec.md + behavior-diagrams.mermaid + acceptance-criteria.md |
| 3 (test) | test-spec.json | test-report.md (+ coverage-report.md) |
| 4 (impl) | impl-spec.json | impl-report.md (+ test-pass-evidence.md) |
| cross | traceability-matrix.json | matrix.md + matrix.mermaid |

ADR-008 v2 §10 (chain 단계 확장) 으로 동반 격상.

### 2. 단계 간 cross-link coverage ≥ 0.85 의무 (ratchet)

- forward+backward bidirectional 의무 (★ DO-178C / IEC 62304 차용 — Official research 권고)
- 3 metric 분리: link_coverage (chain 정합) / test_pass_rate (gate #4 1.0 의무) / line+branch_coverage (정보용)
- ratchet 0.85 → 0.90 → 0.95 (★ ADR-010 v2 §2.6)
- severity_floor: critical=1.0 / high=0.95 / medium=0.90 / low=0.85 (★ DO-178C DAL A)

### 3. test-impl 단계 100% pass 의무 (no-simulation 강화)

- chain 4 GREEN 의무 = 모든 TC-* pass
- ★ ★ ★ **진짜 runner 호출 의무** — `tools/test-impl-pass-validator/` (sub-plan-3 신설)
- 5종 물증 7 필드 (test_runner_version + stdout_path + stderr_path + invocation_timestamp + duration_ms + pass/fail/skip count + reproduction_command + result_hash + report_format) 의무
- result_hash 정규화 (timestamp+duration 제외 / sorted test names 만)
- AI 시뮬 ("test 통과한다고 시뮬 / 구현 정확하다고 시뮬") 검출 시 -5%p 패널티 + simulation_reason 의무

### 4. traceability-matrix 매 gate 갱신 의무

- 4 chain stage gate 종결 시마다 traceability-matrix.json 갱신
- UC → BHV → AC → TC → IMPL + commit_hash forward+backward link 채움
- coverage_summary 자동 산출

### 5. go/stop gate #1~#4 = 사용자 명시 결단 의무

- ★ ADR-CHAIN-002 (go/stop gate UX) 정합
- Auto Mode 위임 가능 — 단 결단 trace logged 의무 (intervention_log)
- gate_4_intervention_pct ≤ 0.30 (★ 70~80% 한계 명시 잔존 / master plan §J.2 옵션 A)

### 6. revisit loop 자동 감지 → 사용자 결단 의무

- ★ ADR-CHAIN-003 (revisit loop) 정합
- chain-revisit-detector (sub-plan-3 신설) 가 변경 이벤트 trigger
- 사용자 prompt → go/stop / stop 시 임의 stage jump

## 인용 체인 (★ Senior B6 권고 / cross-link table)

```
ADR-001 (Schema-First / 사상적 기반)
   ↓
ADR-CHAIN-001 (★ 본 ADR / chain 정합 강제)
   ↓ ↓ ↓
ADR-008 v2 §10  ADR-009 v2 §2.5  ADR-010 v2 §2.6
(이중 렌더링)    (trust escalation)  (coverage ratchet)
   ↓
ADR-CHAIN-002 (go/stop gate UX) + ADR-CHAIN-003 (revisit loop)
```

| 본 ADR §결정 | 인용 ADR |
|---|---|
| §1 이중 렌더링 의무 | ADR-008 v2 §10 |
| §2 cross-link coverage ratchet | ADR-010 v2 §2.6 + ADR-009 v2 §2.5 (신뢰도) |
| §3 no-simulation 강화 | ADR-009 v2 §2.5 (단계 5 — 진짜 runner) |
| §4 traceability-matrix | DO-178C bidirectional + ADR-008 v2 §10 |
| §5 go/stop gate | ADR-CHAIN-002 |
| §6 revisit loop | ADR-CHAIN-003 |

## 학문적 계보

### DO-178C (avionics) + IEC 62304 (의료기기)
- Bidirectional traceability 의무 (System Req ↔ HLR ↔ LLR ↔ Source ↔ Test 5 layer)
- DAL A (life-critical): MC/DC coverage 100% + uncovered code 분석 의무
- 본 방법론 chain 4단계 = 5 layer 직접 매핑 (UC ↔ BHV ↔ AC ↔ TC ↔ IMPL)

### ISO/IEC 25010:2023 (SQuaRE)
- 8 quality characteristic / Functional Correctness sub-characteristic 매핑

### 산업 사례
- Stripe `stripe/openapi` — spec = single source of truth
- GitHub Copilot Workspace — Task → Spec → Plan → Code 4 phase + human gate
- AWS S3 ShardStore — property-based testing (lightweight formal method)

## 결과

### 긍정적 영향 (7건)

1. **chain harness 정체성 명문화** — DEC-2026-05-06 결단 의 사상 ADR 확보
2. **DO-178C bidirectional traceability 권위 확보** — 산업 표준 인용 가능
3. **no-simulation 정책 chain 단계 확장** — test/impl 단계 위조 차단
4. **70~80% 한계 schema 수용 정합** — gate_4_intervention_pct ≤ 0.30 명문
5. **사용자 cluster 결단 정책 강화** — gate #1~#4 명시 trace
6. **6 sub-plan 작업의 사상 기둥** — sub-plan-2~6 모두 본 ADR 인용
7. **14차 retract pattern 차단** — single source-of-truth = impl-spec.json (★ 실 코드 = 산출물 ❌ / commit_hash 만)

### 부정적 영향 / 위험 (3건)

1. **chain coupling 위험** — 한 단계 변경 시 모두 영향
   - **완화**: traceability-matrix 매 gate 갱신 + chain-revisit-detector 자동 감지
2. **gate 마찰** — 4 gate × 매 cycle = 사용자 cognitive load
   - **완화**: Auto Mode 위임 + 묶음 결단 (5~6 cluster 패턴)
3. **AI code gen SOTA gap** — 단발 100% 의무 = 비현실 (산업 SOTA 60~88%)
   - **완화**: chain_attempt retry cap (default 3) + revisit loop + finding escalation + 70~80% 한계 명시

## 대안 (검토 후 거부)

### 대안 1: chain 정책 ADR-008 §확장 으로만 표현
- 거부 이유: 사상축 (이중 렌더링 / 신뢰 / ratchet) 와 운영축 (chain 4 정합) 혼재 — boundary 흐림 위험.

### 대안 2: ADR 통합 1건 (CHAIN 정책 + UX + revisit)
- 거부 이유: ≥ 200 line 단일 ADR — 가독성 ↓ + 부분 갱신 어려움.

### 대안 3: chain 정책 = methodology-spec only (ADR ❌)
- 거부 이유: 본 결정 = 사상축 변경 (round-trip 부분 허용) → ADR 격상 정합.

## 적용 시점

- ★ ★ ★ sub-plan-2 종결 시 본 ADR 등재 + ADR-008/009/010 v2 §확장 동반
- sub-plan-3 (도구) / sub-plan-4 (skills) / sub-plan-5 (hooks) 가 본 ADR 인용
- v2.0.0 release = 본 ADR §1~6 모두 운영 입증

## 변경 이력

- 2026-05-06: 신설 (sub-plan-2). DEC-2026-05-06-v2.0-i-strict-채택 정합. master plan `~/.claude/plans/a-stateful-gadget.md`.
