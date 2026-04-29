# PROGRESS — PoC #02 Phase 4 (비즈니스 로직 — 4영역 병렬)

> 시간순 로그 대전제 (feedback_progress_log.md) 적용

---

## T+0 (2026-04-29) — Phase 4 진입 + 1원칙 plan 작성 ✅

### 진입 컨텍스트
- Phase 1 ✅ (raw 0.93 / 6 finding) / Phase 2 ✅ (0.85 / 11) / Phase 3 ✅ (0.92 / 9)
- 누적 finding: 26 (PoC #02) + 33 (PoC #01) = 59
- 분석 대상: `1chz/realworld-java21-springboot3` (HEAD `93e018e`)
- Auto Mode 활성

### 사용자 결정 — 옵션 C (절충안) 채택
- Phase 4 진행 후 Phase 5/6 vs PoC #03 분기 결정
- §8.1 강제 신호 잠재적 활용

### 메인 사전 raw fetch (★ 8건 핵심 발견)
1. 5 @Service public method 1:1 = **25 UC** (Command 13 + Query 13 — PoC #01 25 UC 정합)
2. Rich Domain Model 정합 (User.encryptPassword / Article.setTitle slug 자동 갱신 등)
3. **14 BR 후보** 추출 (PoC #01 BR 13 + 본 PoC 신규 BR-PAGINATION 2건)
4. **신규 finding 6 candidate** (PF-P4-001~006):
   - PF-P4-001 ★ Article favorite/unfavorite throw vs follow/unfollow idempotent — **API 의미 비대칭**
   - PF-P4-002 UserRepositoryAdapter.updateUserDetails 가 도메인 검증 — Hexagonal 위반
   - PF-P4-003 Article.setTitle race
   - PF-P4-004 UserRegistry + User 양쪽 검증 redundancy
   - PF-P4-005 Article delete CASCADE 부재 + 부분 처리
   - PF-P4-006 self-follow 금지 코드 부재
5. PoC #01 finding 본 환경 검증:
   - AP-DOMAIN-001 (De Morgan) ❌ 비재현 (ArticleCommentService 깔끔)
   - F-027 (BR ≠ actual) ❌ 비재현
   - AP-PERFORMANCE-002 (Pageable cap) ✅ 재현 + 회피 — ArticleFacets:21 size cap 50 명시 ★

### 가벼운 sub-agent 전략
- Phase 3 Senior 30+분 교훈 → Phase 4 prompt 단순화
- 메인 직접 추출 우세 (Service 1:1 = UC 결정적 영역)
- sub-agent = 검증 + 권위 보강 만 (Document 200줄 목표 / Senior 300줄 목표 / Case 생략)

### 1원칙 — plan-phase4-poc02.md 작성 ✅
- 산출: `.claude/plans/plan-phase4-poc02.md` (~280 줄)
- 8 섹션 (진입 / 4영역 비대칭 / 메인 사전 발견 / 변경 대상 / sub-agent 가벼운 전략 / 영향도 / 산출물 체크리스트 / 다음 단계)

### 다음 액션
- ⏳ 2원칙 — Document + Senior 가벼운 spawn (Case 생략)
- ⏳ 또는 메인 직접 산출 진행 (sub-agent 검증 단계 생략 옵션)

---

## T+1 (2026-04-29) — 사용자 승인 옵션 A + 가벼운 sub-agent 2종 spawn ✅

### 사용자 결정
- "A" = 가벼운 sub-agent 전략 (Document + Senior, Case 생략)

### sub-agent 2종 spawn (Phase 3 교훈 반영)

| Agent | prompt | 시간 cap |
|---|---|---|
| Document | DDD-Lite 정의 / BR 형식 / favorite-follow idempotency / Hexagonal Service vs Adapter 권위 — 200~300줄 | 8분 |
| Senior | 메인 8건 cross-check + 6 candidate severity — 5 파일 우선순위 read — 300~400줄 | **10분 cap 강제** |

### Phase 3 교훈 반영
- prompt 단순화 (전수 read 금지 / 우선순위 5 파일만)
- 시간 cap 명시
- Case 생략 (Phase 1/2/3 누적으로 충분)

### 다음 액션
- ⏳ sub-agent 완료 대기 (예상 8~12분)
- ⏳ 결과 통합 + 4단계 산출 9~10 파일 작성

---

## T+2 (2026-04-29) — sub-agent 결과 + research 통합 ✅

### sub-agent 결과 (가벼운 전략 효과)
- Document: 2분 32초 / 152초 (Phase 3 30+분 대비 약 12배 단축)
- Senior: 1분 6초 / 66초 (Phase 3 대비 30배 단축)
- 시간 cap + 우선순위 read 전략 결정적

### F-015 결과
- Senior 8/8 정합 / Document 6/8 + 2건 severity 격상 권고
- F-044/F-048 패턴 Phase 4 비재현 (Phase 3 동일 학습 효과)
- Senior 신규 발견 2건 (F-068 / F-069) — multi-file cross-check 가치 잔존

### 충돌 해소
- PF-P4-001 severity: Senior medium / Document **high (RFC 권위)** → **high 채택 (F-070)**
- PF-P4-002 severity: Senior high / Document high → high 합의 (F-071)
- PF-P4-003 severity: Senior **low 강등** / Document 미언급 → low 채택 (F-076)

### research-phase4-poc02.md 통합 ✅
- 3-합의 3영역 / 충돌 3건 해소 / 6 핵심 결정 / 9 finding 통합

---

## T+3 (2026-04-29) — 4단계 산출 10 파일 ✅

### output/{domain,rules,antipatterns-partial}/ 10종 작성 (1,042 라인)

| 디렉토리 | 파일 | 라인 |
|---|---|---|
| domain/ | domain.json (160) + domain.md (116) + domain.mermaid (99) + use-cases.md (110) + ubiquitous-language.md (41) + _manifest.yml (66) | 592 |
| rules/ | rules.json (163) + rules.md (104) + _manifest.yml (42) | 309 |
| antipatterns-partial/ | antipatterns-partial.json (94) + _manifest.yml (47) | 141 |

### deterministic 검증
- JSON parse: 3/3 ✅ (domain.json + rules.json + antipatterns-partial.json)
- Aggregate Root: 4 / Small Aggregate: 4 / VO: 3 / UC: 25 (Command 13 + Query 12) / BR: 14 (high 8 + medium 4 + low 2) / AP-partial: 6

---

## T+4 (2026-04-29) — finding 등록 ✅

### findings/poc-findings.md 갱신
9 신규 finding 등록 (F-070~F-078):
- F-070 high ★ — favorite/unfavorite RFC 7231 §4.2.2 위반
- F-071 high ★ — UserRepositoryAdapter Hexagonal 위반
- F-072 medium — Adapter multi-aggregate orchestration
- F-073 medium — CASCADE 부재
- F-074 medium — self-follow 부재
- F-075 medium — Hexagonal 가이드 방법론 본체 (메타)
- F-076 low (Senior 강등) — setTitle race
- F-077 low — UserRegistry + User redundancy
- F-078 low — editTitle/Description/Content DRY

### 누적 통계
```
PoC #02 35 (Phase 1-4 누적)
누적 68 (PoC #1 33 + PoC #2 35)
v1.2.0 묶음 11 (+1 J 신규 — Hexagonal port-adapter 경계 가이드)
```

### PoC #01 finding 외부 검증
- closed 4/4 + 한계 2건 ★ (F-016 / F-023)
- AP-DOMAIN-001 / F-027 / F-028 비재현 (PoC #01 critical 결함 해소 ✅)
- AP-PERFORMANCE-002 회피 ✅

---

## Phase 4 종료 — 신뢰도 자평 (formula v1)

```
raw confidence: 0.83
- base 0.80
- inputs: source_code + orm + inventory + db_schema + architecture
- modifier: orm_full +0.10
- penalty: no_fe_layer -0.03 / no_external_deps -0.03 (F-026 재현)
- subtotal 0.84 → weighted 0.83
- PoC #01 0.83 정합
```

### Phase 4 KPI 평가 ✅

- ✅ finding 9건 등록 (F-070~F-078)
- ✅ schema 검증 통과 (domain + rules + antipatterns)
- ✅ 6 핵심 결정 (DEC-PHASE4-POC02-001~006) — Auto Mode 자율
- ★ F-070 high (favorite RFC 7231 위반) — RFC + GitHub/Twitter 권위
- ★ F-071 + F-072 (Hexagonal port-adapter 경계 위반) — Hexagonal 도입 부산물
- ★ F-075 메타 — Hexagonal 가이드 방법론 본체 (v1.2.0 묶음 J 신설)
- ✅ PoC #01 critical 결함 해소 confirmed (De Morgan / F-027 / F-028 비재현)
- ✅ Pageable cap 회피 ★ (ArticleFacets:21)
- ★ **가벼운 sub-agent 전략 성공** — Phase 3 대비 30배 시간 단축

---

## 다음 단계 (Phase 5-1 인계 또는 PoC #03 분기)

옵션 A — Phase 5-1 (API) 진입:
- 22 endpoint × 25 UC 매핑
- F-070 (favorite RFC) API 계약 검증 합산
- openapi.yaml ground truth 직접 제공 (Phase 1 강점)

옵션 B — §8.1 강제: PoC #03 (다른 stack/도메인) 진입:
- 학습 효과 영역 진입 신호 강함
- v1.2.0 격상 데이터 충분 (메타 finding 3건 + 본 PoC 특이 2건 deferred)

윤주스 결정 영역.

---

**END OF PROGRESS-poc02-phase4.md (Phase 4 ✅ 완료)**
