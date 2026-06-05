<!-- schema: ../schemas/finding-system.schema.json -->

# Finding F-{NNN}: {짧은 제목}

> 본 골격은 단일 finding 작성용. PoC 진행 중 명세 빈틈을 발견하면 `examples/poc-NN-*/findings/poc-findings.md` 에 본 형식으로 누적.
> 등록 조건 (AND): ① spec_gap 식별 가능 ② 재현 가능 ③ 우회 결정 기록.
> 상세 정의: `methodology-spec/finding-system.md` §2~4 / schema: `schemas/finding-system.schema.json`.

```yaml
finding_id: F-{NNN} # PoC 전역 일련번호 (3자리 0-padded, 예: F-001 / F-097)
phase: { 0~6 또는 4.5 } # 발견 phase (4.5 = Phase 4.5 형식 명세)
discovered_at: { YYYY-MM-DD }
discoverer:
  {
    PoC 진행 중 / sub-agent (Senior Engineer) / 사용자 / cross-validation (Senior + Static 양쪽) 등,
  }

description: |
  {무슨 일이 있었는가. 사실 서술.}

context: |
  {왜 이 케이스가 나왔는가. 환경/스택/조건.}

spec_gap: |
  {어느 명세의 어느 절이 비었는가. 예: 'workflow/db-schema.md §3.2 (ddl-auto 분기 부재)'}

decision_made: |
  {본 PoC 는 어떻게 우회했는가. 결정 + 근거.}

severity: { low | medium | high | critical | positive }
# low: 환경 의존 / 케이스별 무시 가능
# medium: 단일 phase 영향 / 우회 가능
# high: 모든 산출물 또는 복수 phase 영향 / 표준화 시급
# critical: 즉시 수정 의무
# positive: 학습 효과 입증 / 모범 사례 (cross-PoC 비재현)

proposed_fix: |
  {어떻게 고치면 좋을까. 명세 변경 후보.}

evidence_files: # 근거 파일 (cross-validation 정합 검증 가능)
  - path: { 파일 경로 — 저장소 루트 기준 }
    lines: { L52 또는 L52-L67 }
    note: { 보조 설명 }

# ─── 처리 후 추가 ───
status:
  {
    open | candidate | promoted | closed | deferred | rejected | merged | logged,
  }
# open: 등록만
# candidate: Phase 진행 중 후보
# promoted: 다음 MINOR 후보 등재
# closed: 명세 정식 반영
# deferred: PoC 데이터 추가 필요
# rejected: 명세 책임 밖
# merged: 다른 finding 으로 통합
# logged: positive finding 등재

resolution:
  resolved_at: { YYYY-MM-DD }
  resolution_method: |
    {closed: 명세 변경 위치 / rejected: 사유 / merged: 통합 대상 finding_id}
  followup: [] # 후속 작업 finding 또는 task ID

# ─── severity:positive 시 추가 ───
positive_finding_meta:
  previous_poc_finding: F-{NNN} # 이전 PoC 의 negative finding ID
  current_poc_evidence: |
    {현 PoC 의 positive 증거 — 예: 'main.ts addBearerAuth() 표준 — Bearer 표준 자연 적용'}
  learning_effect_type:
    {
      framework_natural_avoidance | language_static_block | platform_difference | team_learning,
    }
  # framework_natural_avoidance: framework 가 자연히 회피
  # language_static_block: 언어 (TypeScript 등) 가 정적 차단
  # platform_difference: platform 자체 차이
  # team_learning: 동일 팀 학습 결과
  v13_promotion_candidate: { true | false } # v1.3+ 본체 격상 후보 여부

# ─── cross-validation 보강 (선택) ───
cross_validation:
  cross_validated: { true | false } # Senior + Static Analyzer 양쪽 발견 시 true
  discoverers: [senior, static_analyzer, user, main, external_tool]
  confidence_boost: '+15%p' # 부스트 표기
```

---

## 작성 가이드

1. **finding_id**: PoC 전역. 한 PoC 의 모든 phase 합산 일련번호.
2. **phase**: 발견 시점 phase. Phase 4.5 형식 명세는 `4.5` (string).
3. **spec_gap**: 어느 명세 파일의 어느 §절인지 명시. 추후 명세 격상 시 정확히 가리킴.
4. **decision_made**: PoC 는 막혀도 진행해야 함. 어떻게 우회했는지 + 왜.
5. **severity**: 영향 범위 × 차단 강도. positive = 학습 효과 입증 시.
6. **status 전이**: `open → candidate → promoted → closed` 가 표준 경로. positive 는 `logged` 로.

상세 운영: `methodology-spec/finding-system.md`.
