# Decision Log Index

> 역시간순. 단일 진입점. 상세는 각 파일 참조.

---

## 미해결 결정 (open-question / 검토중 / 보류)

(없음 — 본 세션 모두 결단 완료)

## 진행중 결정

| ID | 일자 | 카테고리 | 상태 | 요약 |
|---|---|---|---|---|
| [DEC-2026-04-29-phase-4-5-형식화-후보](DEC-2026-04-29-phase-4-5-형식화-후보.md) | 2026-04-29 | methodology | 진행중 (옵션 C 시범) | rules.json L0 자연어 한계. L1~L2 형식화 도입. ADR-008 후보. |

---

## 승인 결정 (시간순)

| ID | 일자 | 카테고리 | 상태 | 요약 |
|---|---|---|---|---|
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
