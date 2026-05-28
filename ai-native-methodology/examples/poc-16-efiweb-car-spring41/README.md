# PoC #16 — EFI-WEB car 모듈 e2e (D-axis 그래프/코드 연결 입증)

> 2026-05-28 / 등재 = `decisions/DEC-2026-05-28-poc-15-신설.md` (사후 작성 예정)
> ★ **D-axis** = 산출물 ↔ artifact-graph ↔ 코드 pointer 100% 연결 e2e 검증 / R1' axis paradigm ceiling 측정과 ★ 별도 axis.

## 의도

사용자 핵심 검증 의도 = "산출물이 잘 뽑이고 + 그래프로 잘 연결되어 코드까지 연결되는지 확인". 추상적 ceiling 측정 (R1' 53~55%) 이 아니라 **chain harness 가 실제 legacy 코드에서 끝까지 작동하는가** 가 의제.

본 PoC = **PoC #05 외 두 번째 e2e 그래프 합성 corroboration** (PoC #05 modern stack → PoC #16 Spring 4.1 + iBATIS 2 legacy / paradigm-cross 추가).

## scope

### 포함

- EFI-WEB car 모듈 (~1,750 LOC / Java 8 + sqlmap 2 + JSP 14 + ERD 1)
- **chain 1 (discovery) + chain 2 (spec) 진행** — gate #1 + gate #2 통과
- artifact-graph.json 합성 (traceability-matrix-builder --graph)
- graph-integrity-validator (cycle/orphan/unknown=0)
- code-pointer-validator --strict (coverage.ratio=1.0 / missing=0)

### 명시적 제외

- chain 3~5 (plan / test / implement)
- 다중 모듈 (EFI-WEB 전체 180K LOC)
- 본체 자산 변경 (skills/tools/schemas/flows/scripts) — PoC 폴더 단위 격리
- release-readiness 본체 #15/#16 corpus 격상 — `POC05_GRAPH_PATH` hard-coded (F4/F5) / 본 PoC 단독으로 score 변경 ❌

## paradigm 매트릭스

| dimension | PoC #06 exchange | PoC #07 capital | PoC #11 billing | **PoC #16 car** | axis |
|---|---|---|---|---|---|
| 프레임워크 | Spring 4.1.2 | Spring 4.1.2 | Spring 4.1.2 | **Spring 4.1.2** | 동일 |
| ORM | iBATIS 2 | iBATIS 2 | iBATIS 2 | **iBATIS 2** | 동일 |
| LOC | 345 | 3,752 | 257 | **1,750** | scale 중간 |
| 책임 분기 | 단일 | 다중 | 작은 단일 | **이중 (Mgt + Cost)** | ★ 책임 분기 신규 |
| ERD 자산 | ❌ | ❌ | ❌ | **car.erd 60K** | ★ ground truth 비교 |
| chain 도달 | gate #1 | gate #1 | gate #2 | **gate #2 (목표)** | 동등 |
| **D-axis** | ❌ | ❌ | ❌ | ✅ **artifact-graph 합성 + 검증** | ★ 신규 입증 |

→ **PoC #16 신규 입증** = **D-axis** (artifact-graph e2e 합성 + cycle/orphan/unknown=0 + code-pointer coverage 100% strict). R1' axis paradigm ceiling 측정은 carry (사내 EFI-WEB 4번째 corroboration).

## 진행 단계 (5 step)

상세 plan = `~/.claude/plans/groovy-enchanting-zebra.md`

| Step | 행동 | DoD |
|---|---|---|
| 1 | 폴더 init + 소스 사본 + chain-driver init | state='analysis' / blocked=false ✅ |
| 2 | analysis 11 phase + aspect 4 + 자동 검증 6종 | 6 validator 모두 exit 0 |
| 3 | chain 1 (discovery) 4 phase | discovery-extraction-validator source_grounded≥1 / br_id grep 100% / UC≥0.80 |
| 4 | gate #1 통과 | state='spec' / blocked=false |
| 5 | chain 2 spec + artifact-graph + 검증 | **graph cycle/orphan/unknown=0 + code-pointer coverage=1.0** ★ |

## 폴더 구조

```
poc-16-efiweb-car-spring41/
├── README.md / REPORT.md (사후)
├── source/                                  # immutable 원본 사본
│   ├── java/smilegate/ifrs/car/             # 8 .java / 1,750 LOC
│   ├── sqlmap/{carCost,carMgt}.xml
│   ├── jsp/                                 # 14 .jsp
│   └── erd/car.erd                          # 60K
├── input/                                   # analysis 산출물 (well-known scan)
├── aspect/                                  # cross-cutting 4 (a11y/i18n/static-security/legacy)
├── findings/poc-findings.md
└── .aimd/
    ├── state.json
    └── output/                              # chain artifact (discovery-spec / behavior-spec / acceptance-criteria / artifact-graph 등)
```

## 실패 시 revert

`rm -rf examples/poc-16-efiweb-car-spring41/` → 본체 무손상. `npm run release:check` score 무관 (F4/F5).
