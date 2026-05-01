# Decision Log Index

> 역시간순. 단일 진입점. 상세는 각 파일 참조.

---

## 미해결 결정 (open-question / 검토중 / 보류)

(없음 — 본 세션 모두 결단 완료)

## 진행중 결정

| ID | 일자 | 카테고리 | 상태 | 요약 |
|---|---|---|---|---|
| [★★★ DEC-2026-04-30-v1.2.3-본체-격상](DEC-2026-04-30-v1.2.3-본체-격상.md) | 2026-04-30 | methodology | 승인 (★★★ v1.2.3 PATCH — 본체 4 묶음) | ★★ 사용자 방향 재정렬 — PoC 산출물 ❌ / 본체 격상 ✅. 묶음 C (Phase 4.5 cross-link schema 의무화) + I (AP-PERFORMANCE 3 PoC 격상 정책) + H (Positive finding 패턴 schema + learning_effect_type 4종) + K (Lifecycle BR null 허용 + br_type enum + current_state_note). 본체 갭 closure 7 → 11. v1.3.0 release 진입 직전 상태. |
| [DEC-2026-04-29-phase-4-5-형식화-후보](DEC-2026-04-29-phase-4-5-형식화-후보.md) | 2026-04-29 | methodology | 진행중 (옵션 C 시범) | rules.json L0 자연어 한계. L1~L2 형식화 도입. ADR-008 후보. |

---

## 승인 결정 (시간순)

| ID | 일자 | 카테고리 | 상태 | 요약 |
|---|---|---|---|---|
| [★ DEC-2026-05-01-v1.4-Stage-1-research-종결](DEC-2026-05-01-v1.4-Stage-1-research-종결.md) | 2026-05-01 | methodology / FE-track / research | 승인 (★ Stage 1 종결 / 9Q × 27 답 / Stage 2 진입 대기) | research × 3 (공식/산업/Senior) 완료. **3 에이전트 합의: Scenario B-Lite / 권위 매개체 12 채택 / 빈틈 Top 5**. 본체 격상 Stage 3 분할 권고 (3-1 deliverable 8/9 신설 + ADR-FE-001/002/005 + ADR-009 갱신 / 3-2 비기능 + legacy + ADR-FE-003 + ADR-001 갱신). 사용자 7 요구사항 100% 반영 가능 (Stage 3 격상 후). Stage 2 진입 시 12 결정 (Gate 1/2/3 × 4) 결단 필요. |
| [★ DEC-2026-05-01-v1.4-FE-트랙-진입](DEC-2026-05-01-v1.4-FE-트랙-진입.md) | 2026-05-01 | methodology / release-line | 승인 (★ v1.4.0-dev / FE 트랙 / Stage 0 종결) | freeze 해제 + FE 트랙 정식 시작 + 8 Stage 분할. 사용자 진단 "방법이 없잖아" → research-first. 사용자 7 요구사항 (산출물↔테스트 / AI+사람 / visible / 비즈니스로직 / BE-FE 분리 / 큰 뭉텅이 승인제 / 발전 과정 기록) plan 구조 반영. 외부 plan v2 = 3 에이전트 점검 통합. |
| [★★ DEC-2026-04-30-B-phase45-enrichment](DEC-2026-04-30-B-phase45-enrichment.md) | 2026-04-30 | methodology / poc | 승인 (★★ Phase 4.5 풍부화) | PoC #03 Phase 4.5 BR coverage 33% → 66.7% (6 → 12 BR). 신규 6 BR (EMAIL-FORMAT / PASSWORD-HASH / SLUG-AUTO / FAVORITE / UNFAVORITE / COMMENT-EAGER). ★ dmn-check schema 보강 — lifecycle BR null 허용. 자연어 빈약성 corpus 12 BR ~44% 일관성 입증. F-141 critical 격상 권고. 신뢰도 0.85 → 0.87. |
| [★★★ DEC-2026-04-30-A-drift-validator-quality-boost](DEC-2026-04-30-A-drift-validator-quality-boost.md) | 2026-04-30 | methodology / poc-tooling | 승인 (★★★ 도구 quality 격상) | drift-validator 자체 quality 격상 — transitionFuzzyMatch (compound state inner) + corpus 4 → 14쌍 + sequence -x/-) 변종. **F-154 60% false positive → 0% / F-155 closed**. PoC #03 breaking 20 → 8 → **0** (exit 0 ✅). corpus self-test 14/14. ★ Sprint 5 코드 작업 100% 흡수. 신뢰도 0.80 → 0.85 (단계 3 → 3+). |
| [★★★ DEC-2026-04-30-v1.3-격상-데이터-완비](DEC-2026-04-30-v1.3-격상-데이터-완비.md) | 2026-04-30 | methodology | 승인 (★★★ v1.3 격상 데이터 완비) | 3 PoC 종결 후 v1.3 격상 후보 6건 식별 — AP-PERFORMANCE 격상 / Positive finding / NestJS 4 ADR / Phase 4.5 cross-link 의무화 / migration-cautions NestJS / §8.1 정식. **사내 적용 시작 가능 시점 v1.2.2 명시**. Sprint 5 종결 후 v1.3.0 정식 release 가능. |
| [★★★ DEC-2026-04-30-poc03-phase6-종결](DEC-2026-04-30-poc03-phase6-종결.md) | 2026-04-30 | poc / methodology | 승인 (★★★ PoC #03 전체 종결) | PoC #03 Phase 6 종결 = ★★ **PoC #03 전체 종결**. 11 AP final (critical 2 / high 3 / medium 4 / low 2) + 4 composite view + ★ migration-cautions.md (NestJS 특이 8 함정 + 학습 효과 3건). 신뢰도 0.94 / 7대 산출물 **6/7** / cross-PoC 12 cross-val / **F-161 positive (Bearer 학습 효과)**. ★★★ 사내 표준 v1.3 격상 데이터 완비. |
| [★★ DEC-2026-04-30-poc03-phase51-종결](DEC-2026-04-30-poc03-phase51-종결.md) | 2026-04-30 | poc / methodology | 승인 (★★ Phase 5-1 종결) | PoC #03 Phase 5-1 (api) 종결. 21 endpoint 정적 추출 + Phase 4.5 cross-link 9/21 + 신규 finding F-157~F-166 10건 (★★★ **F-164 critical 신규 — Article 4 endpoint Auth 부재** + ★★ F-161 positive Bearer 표준 ✅ = PoC #02 F-084 비재현 학습 효과). 신뢰도 0.90 / 7대 산출물 5/7 / Phase 6 만 남음. |
| [★★ DEC-2026-04-30-poc03-phase45-종결](DEC-2026-04-30-poc03-phase45-종결.md) | 2026-04-30 | poc / methodology | 승인 (★★ Phase 4.5 + 4.5+1 종결) | PoC #03 NestJS Phase 4.5 형식 명세 (37 파일) + drift-validator + decision-table-validator **첫 외부 검증** 종결 + Phase 4.5+1 다이어그램 보강 (진짜 drift 8 → 0 ✅). drift 9 짝 / breaking 20 → 8 (도구 한계만 남음). dmn 6 → 0 (enum fix). 신뢰도 0.70 → 0.77 → **0.80** (단계 2 → 2.5 → ★ **단계 3 자동 검증 통과 ✅**). F-154 (★ Sprint 5 transitionFuzzyMatch 우선순위 격상). |
| [★ DEC-2026-04-30-m-p2-3-종결](DEC-2026-04-30-m-p2-3-종결.md) | 2026-04-30 | methodology | 승인 (v1.2.2 PATCH) | 본체 갭 5건 일괄 처리 — api.template.md / phase-flow.mermaid+json / **ADR-009 (다이어그램 신뢰 모델 + 도구 종류 enum 7종 ★★★)** / db-schema.template.md / meta-confidence.template.yaml. **본체 갭 7건 모두 closed** → ADR-008 본체 100% 정합. |
| [★ DEC-2026-04-30-sprint-4-종결](DEC-2026-04-30-sprint-4-종결.md) | 2026-04-30 | methodology / poc-tooling | 승인 | C-Sprint 4 종결. 묶음 N+O 인프라 100% 산출 (drift-validator + decision-table-validator + static-runner + drift-check.yml + Phase 4.5 schema 5종 물증 강제). PoC #02 자가 검증 → 11 신규 finding (F-107~F-117). 진짜 도구 실 실행 Sprint 5 carry-over. |
| [★★★ DEC-2026-04-30-v1.2.0-격상](DEC-2026-04-30-v1.2.0-격상.md) | 2026-04-30 | methodology | 승인 (★★★ MINOR 격상) | v1.1.2 → v1.2.0 MINOR 격상. 14 묶음 통합 (A~M + P). ADR-008 + Phase 4.5 정식 + finding-system schema + migration-cautions.md 의무. N+O Sprint 4 후속. |
| [DEC-2026-04-30-M-묶음-갭-식별](DEC-2026-04-30-M-묶음-갭-식별.md) | 2026-04-30 | methodology | 승인 | 방법론 본체 이중 렌더링 갭 7건 (P1 2 + P2 3 + P3 2) 공식 식별. P1 Sprint 3 병행 / P2-3 v1.2.0 묶음 M 일괄. |
| [★★★ DEC-2026-04-29-round-trip-스코프-아웃](DEC-2026-04-29-round-trip-스코프-아웃.md) | 2026-04-29 | methodology | 승인 (★★★ 가치 재정의) | round-trip (산출물 → 신규 시스템) 검증 영구 scope 제외. 본 방법론 = "코드 → 형식 명세 + 위험 기록" 한 방향 추출기. |
| [DEC-2026-04-29-안티패턴-마이그레이션-가이드](DEC-2026-04-29-안티패턴-마이그레이션-가이드.md) | 2026-04-29 | methodology | 승인 | antipatterns.json `migration_advice` 필드 추가 (α) + `migration-cautions.md` Phase 6 의무 산출물 (β). v1.2.0 묶음 P. |
| [DEC-2026-04-29-round-trip-미검증-인지](DEC-2026-04-29-round-trip-미검증-인지.md) | 2026-04-29 | open-question | **closed (스코프 아웃 결단으로 해소)** | (DEC-round-trip-스코프-아웃 으로 해소) |
| [DEC-2026-04-29-priority2-결단](DEC-2026-04-29-priority2-결단.md) | 2026-04-29 | methodology / poc | 승인 | Sprint 2 진입 전 Priority 2 4항목 일괄 결단. E (형식화 강제) / F (F-074 단방향 우선) / G (Sprint 3 이연) / H (cross-validation 의무). |
| [DEC-2026-04-29-시퀀스-C-A-B-확정](DEC-2026-04-29-시퀀스-C-A-B-확정.md) | 2026-04-29 | poc | 승인 | 시퀀스 C (Phase 4.5 시범) → A (v1.2.0 + 묶음 L/M/N 통합) → B (PoC #03). 재작업 0. |
| [DEC-2026-04-29-다음-분기-옵션-보류](DEC-2026-04-29-다음-분기-옵션-보류.md) | 2026-04-29 | poc | 승인 (시퀀스 C → A → B) | (위 시퀀스 결정으로 해소) |
| [★★★ DEC-2026-04-29-static-tool-실행-의무화](DEC-2026-04-29-static-tool-실행-의무화.md) | 2026-04-29 | methodology | 승인 (★★★) | AI sub-agent persona 시뮬레이션 ❌. 진짜 외부 도구 실행 의무. v1.2.0 묶음 O 신규. 하네스 강제. |
| [DEC-2026-04-29-다이어그램-신뢰-모델](DEC-2026-04-29-다이어그램-신뢰-모델.md) | 2026-04-29 | methodology | 승인 | Phase 4.5 형식 명세 신뢰도 60~95% 가변. 검증 5단계 정량 모델 + 용도별 가이드. ADR-009 후보. |
| [DEC-2026-04-29-이중-렌더링-사상-명시화](DEC-2026-04-29-이중-렌더링-사상-명시화.md) | 2026-04-29 | methodology | 승인 | 본 방법론 사상적 기반 명시화. "AI 눈 + 사람 눈" — 단일 진실, 이중 렌더링. ADR-001/002 진짜 의미. ADR-008 격상 후보. |
| [DEC-2026-04-29-poc02-종결](DEC-2026-04-29-poc02-종결.md) | 2026-04-29 | poc | 승인 | PoC #02 (1chz/realworld-java21-springboot3) Phase 1~6 종결. 7대 산출물 6/7. 21 AP / 43 finding. |
| [DEC-2026-04-28-품질-우선순위](DEC-2026-04-28-품질-우선순위.md) | 2026-04-28 | methodology | 승인 | 본 프로젝트 절대 우선순위: 품질 1 + 재작업 최소화 2. 속도/quick win 후순위. |

---

## 카테고리별 검색 힌트

```bash
# methodology 결정만
grep -l "카테고리: methodology" *.md

# 보류 상태만
grep -l "상태: 보류" *.md

# 특정 키워드
grep -r "round-trip" .
```
