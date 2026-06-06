# Lessons Learned — 14차 결단 1일 retract (2026-05-02)

> Senior 보강 §4 정합 — 4원칙 §4 "실패 시 Revert + 교훈 반영 → 1원칙 재시작" 의무.

## 사건 요약

- **2026-05-02 (오전)**: 14차 결단 (DEC-2026-05-02-plugin-first) 채택 — "본체 = plugin source / adoption/dist = artifact" 분리 워크스페이스 운영.
- **2026-05-02 (오후)**: 본 plan (`~/.claude/plans/warm-brewing-moth.md`) 으로 retract — adoption 폐기 / workspace 단일 / build script 1차 도입.
- cadence = 1 일 (너무 빠름).

## Retract 사유 (본 plan §토론 결과)

1. **단일 source-of-truth 위배**:
   - adoption/dist artifact = workspace 본체에서 추출된 build 결과
   - 별도 git repo 운영 = sync 부담 증가 / version drift 위험 (Babel/Yarn/Sentry 3 사례 동일 lesson)

2. **frontmatter provenance 만으로 동등 효과**:
   - dist 폴더 안 사용자 직접 편집 자산 (CLAUDE.md / README.md) 은 workspace `templates/adoption/` 흡수 + frontmatter provenance 로 추적 가능
   - 별도 워크스페이스의 정당화 사유 부재

3. **build script 가 더 강한 사내 배포 메커니즘**:
   - `npm run build` → `dist/internal-v<version>/` 자동 추출
   - sync 부담 0 / 사내 marketplace push 단순화
   - sync 자동화 신뢰 가능 시 단일 monorepo 가 강 (Industry case 검증)

## Lessons (본체 자산화 ❌ / §8.1 일반화 ❌ — Senior 권고)

| Lesson                                               | scope                                                      | memory 자산화                                            |
| ---------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| **결단 cadence ≥ 24h cooling-off**                   | general (다른 plugin 적용 가능)                            | 신규 후보 `feedback_decision_cadence_24h_cooling_off.md` |
| **별도 dist workspace 운영의 sync 비용 함정**        | general                                                    | feedback_methodology_body_priority 갱신으로 흡수         |
| **사용자 직접 편집 silent loss risk** (Agent 4 발견) | general (adoption 폐기 시 dist 안 customization 식별 의무) | feedback_methodology_body_priority 갱신으로 흡수         |
| **본 retract 자체**                                  | 본 워크스페이스 specific                                   | §8.1 일반화 ❌ / 본체 자산화 ❌                          |

## §8.1 단일 PoC 과적합 회피 정합

- 본 retract = 본 워크스페이스 1 사례 → §8.1 컴포넌트 ≥ 3 임계 미달 → 본체 자산화 ❌
- 단, **build script 패턴 + frontmatter provenance + adoption 폐기 절차** 는 ✅ general (다른 plugin 일반화 가능)
- → Senior 권고: **사내 ADR 1호 신설은 Phase B+ carry** (Anthropic 공식 build 정책 부재 → 사내 표준 정착 후보)

## 4원칙 §4 정합 trace

- §1 plan 작성 → §2 3-agent research (Official Docs / Industry Case / Senior + adoption code 탐색) → §3 사용자 승인 (본 plan ExitPlanMode) → §4 본 Lessons Learned 명시.
- revert 자체는 정합 / cadence ≥ 24h cooling-off carry 가 Senior 권고 핵심.

## Phase B carry (본 Lessons 외)

- 결단 cadence ≥ 24h cooling-off memory 자산화 (즉시 / 본 plan 별도 commit)
- 사내 ADR 1호 (build 정책 표준) 신설
- harness-engineering-study 외부 이관 + git filter-repo subtree extract (사용자 결단 시)

---

**End of Lessons Learned 2026-05-02.**
