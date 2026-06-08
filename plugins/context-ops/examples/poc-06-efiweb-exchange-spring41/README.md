# PoC #06 prelim — EFI-WEB exchange (적대성 4중 + phase 4.7 첫 적용)

> 2026-05-07 / 등재 = `decisions/DEC-2026-05-07-poc-06-prelim-신설.md`
> **prelim 단계** — chain 1 만 측정 (chain 2~4 미진입). v2.0.0 final release 후 첫 PoC.
> **Characterization Testing (phase 4.7) 정식 단계 첫 적용** — 외부 조언 (Michael Feathers / DDD / SbE) 정합 finding.

## 의도

EFI-WEB (사내 IFRS 회계 시스템 / Spring 4.1.2 + iBATIS 2 + JSP 248 + 표준프레임워크 3.6.0 / 51.8K Java LOC) 의 단일책임 모듈 `smilegate.ifrs.exchange` (환율 마스터 / 345 Java LOC + 130 SQL XML / 5 Controller endpoint) 한 개를 추려 chain harness v2.0 의 (a) analysis stage 자동화율 + (b) chain 1 planning-spec 신뢰도 + (c) phase 4.7 (characterization) 정식 단계 효과 3종 동시 측정.

## scope

- **포함**: analysis 4종 (rules / domain / antipatterns / inventory) + phase 4.7 (snapshot + intent-vs-bug + coverage) + chain 1 (planning-spec + validator)
- **제외**: chain 2~4 / 다중 모듈 / 51K LOC 전체 / carry 본체 격상 (Spring 4.x AP seed / iBATIS 파서 / OpenRewrite 시퀀스)

## 적대성 측정 (plan §1 정합)

| 축         | 사실                           | 적대성 |
| ---------- | ------------------------------ | ------ |
| 프레임워크 | Spring 4.1.2 (Boot ❌)         | 극상   |
| ORM        | iBATIS 2 raw SQL               | 극상   |
| View       | JSP 248 + AUIGrid + 다음에디터 | 극상   |
| 테스트     | **0개**                        | 극상   |
| 문서       | README 1줄                     | 상     |

PoC #01~#05 어떤 것보다 검증 스택에서 멀다. plan §1 의 4중 적대성이 실제로 측정값에 반영되는지 본 PoC 가 사실 확인.

## 측정 대상 3종 (plan 정합)

1. **plan §3-A 분석 자동화율 추정 50% ± 10%p** — 실측 비교
2. **plan §3-B 설계 자동화율 추정 75%** — chain 1 신뢰도 실측 비교
3. **phase 4.7 (characterization) 효과** — intent-vs-bug 분류 정확도 + coverage + 도메인 expert 보강 비중

## 작업 시퀀스 (3~4일)

| Day | 작업                                            | 산출                                                                  |
| --- | ----------------------------------------------- | --------------------------------------------------------------------- |
| 0   | plan + decisions + STATUS + 디렉토리 신설       | DEC + INDEX 갱신 + PROGRESS 시작                                      |
| 1   | EFI-WEB exchange 사본 + analysis 4종            | source/ + input/{rules,domain,antipatterns,inventory}.json            |
| 2   | phase 4.7 — snapshot + intent-vs-bug + coverage | characterization/snapshots/\*.json + coverage.json + intent-vs-bug.md |
| 3   | chain-driver init + chain 1 + validator + 보고  | .ai-context/output/planning-spec.{json,md} + 측정 보고서                    |

## 디렉토리

```
poc-06-efiweb-exchange-spring41/
├── README.md                # 본 파일
├── PROGRESS-2026-05-07.md   # 시간순 작업 로그 (Day 0~3)
├── source/                  # EFI-WEB exchange 모듈 사본 (Day 1)
├── input/                   # analysis 4종 (Day 1)
│   ├── inventory.json
│   ├── rules.json
│   ├── domain.json
│   └── antipatterns.json
├── characterization/        # phase 4.7 (Day 2)
│   ├── snapshots/*.json     # 현재 동작 golden snapshot
│   ├── coverage.json        # 행위 매트릭스 (≥0.80 임계)
│   └── intent-vs-bug.md     # 유지할 동작 vs 버려야 할 버그 분류표
└── .ai-context/                   # chain-driver state (Day 3)
    ├── state.json
    └── output/
        ├── planning-spec.{json,md}
        └── run-log.md
```

## §8.1 단일 PoC 과적합 회피 강제

본 PoC 1개 결과로 본체 격상 결단 ❌:

- carry 1순위 (Spring 4.x + 표준프레임워크 AP seed) = 사내 다른 legacy Java 1개 corroboration 후 별도 결단
- phase 4.7 (characterization) v2.1.0 본체 격상 = PoC #07 또는 retrofit 후 ≥2 PoC corroboration 충족 시

본 PoC 의미 = plan 추정의 사실 확인 + finding 자산화.

## 종결 조건 (Day 3 측정 후)

다음 3개 중 1개:

- **(a) PoC #06 정식 등재** — finding 충분 + 추정 정합 / `examples/poc-06-efiweb-exchange-spring41/` → `examples/poc-06-efiweb-exchange-spring41/` 리네임
- **(b) prelim 보존** — 측정 부족 / 다음 PoC 재시도
- **(c) scope 외 회수** — 본 모듈 부적합 + 다른 모듈 (billing 257 LOC 등) 재시작

## 참조

- 평가 전체: `~/.claude/plans/stateful-painting-orbit.md`
- phase 4.7 명세: plan §6.5
- 외부 조언 매핑: plan §6.5 (Michael Feathers Characterization Testing + DDD Bounded Context + SbE Living Documentation)
- 직전 release: DEC-2026-05-07-v2.0.0-final
- 본 PoC 등재: DEC-2026-05-07-poc-06-prelim-신설
