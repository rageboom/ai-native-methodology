# DEC-2026-05-07-poc-06-prelim-신설

> **카테고리**: methodology / PoC 등재 / phase 4.7 (characterization) 신설 / EFI-WEB 적용 평가
> **상태**: 진행중 (★ prelim — Day 0~3 측정 완료 시 종결 또는 PoC #06 정식 등재)
> **일자**: 2026-05-07

---

## 1. 결단

EFI-WEB 사내 IFRS 회계 시스템 (Spring 4.1.2 + iBATIS 2 + JSP 248 + 표준프레임워크 3.6.0 / 51.8K Java LOC / 테스트 0 / README 1줄 / 4중 적대성) 에 v2.0.0 chain harness 적용 가능성 엄밀 평가를 위해 — 단일책임 모듈 `smilegate.ifrs.exchange` (345 LOC) 하나에 한정해 분석 + chain 1 (planning-spec) 측정 + ★ **phase 4.7 (characterization) 정식 단계 첫 적용**.

PoC #06 **prelim** 등재 — 정식 PoC #06 등재는 Day 3 측정 종료 + finding 누적 결과 기반 별도 결단 (종결 조건 §7).

## 2. 배경

- v2.0.0 final release (2026-05-07 / DEC-2026-05-07-v2.0.0-final) 후 **첫 PoC** + cleanup round 2 series 종결 후 첫 신규 작업
- 사용자 (윤주스 TF Lead) 가 EFI-WEB 분석/스펙/테스트/구현 자동화 가능성 엄밀 평가 요청
- plan (`~/.claude/plans/stateful-painting-orbit.md`) §3 단계별 추정: 분석 50% / 설계 75% / 스펙 70% / 테스트 35% / 구현 (전체) 10%~(신규 UC) 60% — **추정**. 사실 확인 부재
- 외부 조언 (다른 Claude Code 세션 / Michael Feathers Characterization Testing + DDD + SbE) 검증 결과 chain harness 와 70% 정합 / **phase 4.7 (characterization) 갭** 발견 (외부 조언이 검증한 정합 finding)

## 3. 측정 대상 (3종 동시)

1. **plan §3-A 분석 자동화율** 추정 50% ± 10%p — 실측 정합 여부
2. **plan §3-B 설계 자동화율** 추정 75% — chain 1 planning-spec 신뢰도 실측 정합 여부
3. **★ phase 4.7 (characterization) 정식 단계 첫 적용** — intent-vs-bug 분류 정확도 / coverage / 도메인 expert 보강 비중

## 4. scope 제한

- **포함**: smilegate.ifrs.exchange 모듈 한정 (345 Java LOC + 130 SQL XML / 5 Controller endpoint / 3 DB 테이블)
- **포함**: analysis 4종 + ★ phase 4.7 + chain 1 만
- **제외**: chain 2~4 / 다중 모듈 / 51K LOC 전체 / carry 본체 격상 (Spring 4.x AP seed / iBATIS XML 파서 / PMD 룰셋 / JSP heuristic) / OpenRewrite 시퀀스 (시나리오 C)

## 5. §8.1 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:
- carry 1순위 (Spring 4.x + 표준프레임워크 AP seed) = 사내 다른 legacy Java 1개 corroboration 후 별도 결단
- phase 4.7 (characterization) v2.1.0 본체 격상 = PoC #07 또는 retrofit 후 ≥2 PoC corroboration 충족 시

본 PoC 의미 = plan 추정의 사실 확인 + finding 자산화.

## 6. 작업 시퀀스 (3~4일)

| Day | 작업 | 산출 | 측정 |
|---|---|---|---|
| 0 | plan + decisions + STATUS + 디렉토리 신설 | 본 DEC + INDEX 갱신 + PROGRESS 시작 + README | — |
| 1 | EFI-WEB exchange 사본 + analysis 4종 | source/ + input/{rules,domain,antipatterns,inventory}.json | plan §3-A 50% 추정 정합 |
| 2 | ★ phase 4.7 — snapshot + intent-vs-bug + coverage | characterization/snapshots/*.json + coverage.json + intent-vs-bug.md | ★ phase 4.7 효과 |
| 3 | chain-driver init + chain 1 + validator + 보고 | .aimd/output/planning-spec.{json,md} + 측정 보고서 | plan §3-B 75% 추정 정합 |

## 7. 종결 조건

Day 3 측정 종료 + 다음 결단 1개:
- **(a) PoC #06 정식 등재** — finding 충분 + 추정 정합 / 디렉토리 리네임 (`prelim` 제거)
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — 본 모듈 부적합 + 다른 모듈 (billing 257 LOC 등) 재시작

## 8. 참조

- plan: `~/.claude/plans/stateful-painting-orbit.md` §3 / §5 / §6.5 phase 4.7
- 외부 조언 정합: plan §6.5 (Michael Feathers Characterization Testing + DDD Bounded Context + SbE Living Documentation)
- 직전 결단: DEC-2026-05-07-v2.0.0-final
- 디렉토리: `examples/poc-06-efiweb-exchange-spring41/`
- PROGRESS: `examples/poc-06-efiweb-exchange-spring41/PROGRESS-2026-05-07.md`
- README: `examples/poc-06-efiweb-exchange-spring41/README.md`
