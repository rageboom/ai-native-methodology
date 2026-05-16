# PoC #13 — DSL builder QueryDSL user-decided source (★ paradigm-cross MEDIUM / ★ ★ ★ R4 보류 처분 자산)

> 2026-05-08 / DEC-2026-05-08-poc-13-prelim-신설
> ★ paradigm-cross MEDIUM #4 / ★ ★ source 결정 = ★ 사용자 위임 의무 (★ ★ realworld OSS 부재 사실)
>
> ★ ★ ★ ★ ★ **status = 보류** (2026-05-16 / R4 결단 / DEC-2026-05-16-r4-poc-12-13-보류-자산화 / v3.6.6 PATCH)
> ★ ★ ★ ★ 사용자 명시 결단 옵션 (c) "보류 + (B) 정책 완화 회귀 처분 자산화" 채택 — ★ ★ ★ ★ ★ README 안 정탐 결과 추천 (옵션 (v) "PoC #13 보류 + (B) 정책 완화 회귀") 정합 / ADR-CHAIN-008 정합 / paradigm-cross corroboration 자격 = 본 PoC 진입 없이 도달. 향후 사용자 source 도착 시 재진입 가능 (라벨 부활 ❌ / 새 DEC 신설 의무 / LL-cleanup-02 정합).

## scope

★ ★ ★ ★ Auto Mode (A) 결단 — DSL builder QueryDSL paradigm corroboration → ★ ★ ★ ★ ★ 2 정탐 (PoC #10 직후 + 본 prelim) 모두 pure realworld OSS 부재 사실 확보 → ★ source 결정 = ★ ★ 사용자 위임 의무.

## ★ ★ source 결정 carry (★ ★ ★ 사용자 결단 의무)

| 옵션 | 처분 |
|---|---|
| (i) 사내 QueryDSL 사용 모듈 (★ EFI-WEB 또는 다른) | ★ source 위임 |
| (ii) raeperd/realworld-springboot-java fork + ★ QueryDSL 도입 patch (★ synthetic reframe) | ★ source 결정 |
| (iii) Spring Boot + JPA + QueryDSL sample 자체 작성 (★ ★ 14d cap 정합 quick) | ★ source 결정 |
| (iv) jeonguk/spring-jpa-querydsl-example 강제 사용 (★ 도메인 부족 / ★ scope reframe) | ★ ★ 14d cap 부적합 |
| (v) PoC #13 보류 + (B) 정책 완화 회귀 | ★ ★ ★ ★ 정탐 결과 정합 (★ 추천) |

## 14d cap (실측 ~3~4일 / source 도착 후)

★ ★ source 도착 시 PoC #08+#09+#10 패턴 재사용.

## 정탐 결과 (★ ★ ★ ★ 2 정탐 통합)

★ ★ ★ ★ ★ **pure DSL builder QueryDSL realworld OSS = 2026년 부재 사실**:
- 공식 querydsl-examples = sample 만
- spring-data-examples QueryDSL = fragment 만
- Infobip/infobip-spring-data-querydsl = library
- arifng/spring-jpa-querydsl = sample
- bastman/spring-kotlin-querydsl = playground
- Big-tech (Netflix/Square/Pinterest/Infobip) production realworld = ❌
- Scala 대안 (Slick / Quill) = realworld example ❌

→ ★ ★ ★ ★ **본 PoC 진입 = 사용자 source 결정 의무** + ★ ★ ★ ★ ★ 정탐 결과 자체가 (B) 정책 완화 추천 회귀.
