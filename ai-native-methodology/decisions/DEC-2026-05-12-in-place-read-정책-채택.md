# DEC-2026-05-12-in-place-read-정책-채택

| 항목 | 값 |
|---|---|
| 결정자 | 윤주스 (TF Lead) |
| 일자 | 2026-05-12 |
| 상태 | 승인 (★ ★ ★ in-place read 정책 채택 / source 사본 패턴 폐기 / 사내 PoC 정합 의무 / 외부 OSS PoC 는 clone 보존) |
| 카테고리 | methodology / policy / source-handling (★ PoC source 처리 정책 변경 / 본체 schema 변경 ❌) |
| 관련 | PoC #06 (exchange / 사본 패턴), PoC #07 (capital / 사본 패턴), PoC #11 (billing / ★ 본 정책 첫 적용) |

---

## 1. 컨텍스트

PoC #11 (EFI-WEB billing / Spring 4.1 + iBATIS 2) Day 0.5 진입 시 plan 1차 + PoC #06+#07 = ★ source 사본 패턴 (`examples/poc-XX/source/{java,sqlmap,jsp,message}/`) 적용.

★ ★ ★ **사용자 결단 (β) 2026-05-12**: *"복사하지말고 해당 프로젝트 들어가서 읽었으면 좋겠어. 왜 읽는게 안됨? 어차피 우리프로젝트에 있으나 거기 있으나 읽는건 마찬가진데"*

→ 사본 패턴 = ★ duplication / 같은 머신 내 path 면 Read tool 로 직접 read 가능 / **사본 무의미**.

---

## 2. 결단

**in-place read 정책 채택** (본 결단 일자 2026-05-12 이후 전체 사내 PoC 정합).

| 항목 | before | after (★ 본 결단) |
|---|---|---|
| source 처리 | 복사 → `examples/poc-XX/source/{...}/` | ❌ 폐기 |
| source 위치 | 본 레포 내 사본 | ✅ 원본 path Read tool 직접 read |
| traceability | 복사 path | ✅ source absolute path reference (plan + DEC + REPORT) |
| PoC 산출 (input/, characterization/, sql-inventory/, .aimd/) | 본 레포 저장 | ✅ 유지 (변경 ❌) |
| 의무 | source 사본 약 5~10MB duplication | ✅ 회피 |

---

## 3. 적용 범위

### 적용 대상 (in-place read)

- ★ ★ 사내 PoC (사용자 머신 내 사내 코드베이스 path access 가능) — PoC #06 + PoC #07 + PoC #11 + 추후 사내 PoC
- 단, PoC #06+#07 = ★ 이미 종결 + 사본 자산 보존 (★ historical record / 재작업 ❌)

### 적용 제외 (clone 보존)

- 외부 OSS PoC (사용자 머신 외부 source) — PoC #01~#05 + PoC #08~#10 + PoC #12~#13:
  - GitHub clone 의무 = `examples/poc-XX/source/` 사본 유지
  - 사유 = (i) OSS 버전 pinned (reproducibility) (ii) 사용자 머신 외부 (license + 안정성)

### 정합 규칙

- plan + DEC + REPORT 에 source path absolute reference **의무** (★ traceability 보장)
- source path 변경 시 → plan 2차 갱신 + DEC 등재 의무
- PoC 산출 (input/, characterization/, .aimd/, sql-inventory/) = 본 레포 저장 (변경 ❌)

---

## 4. PoC #11 적용 사례 (★ 본 결단 첫 적용)

**source root path**: `/Users/sangcl/Documents/Development/Study/EFI-WEB/ifrs`

billing 모듈 7 file (in-place read / 사본 ❌):

| 영역 | 상대 path | LOC |
|---|---|---|
| Java Controller | `src/main/java/smilegate/ifrs/billing/web/BillingController.java` | 126 |
| Java Service IF | `src/main/java/smilegate/ifrs/billing/service/BillingService.java` | 20 |
| Java Service Impl | `src/main/java/smilegate/ifrs/billing/service/impl/BillingServiceImpl.java` | 43 |
| Java DAO | `src/main/java/smilegate/ifrs/billing/service/impl/BillingDAO.java` | 68 |
| sqlmap (iBATIS 2 XML) | `src/main/resources/egovframework/sqlmap/ifrs/billing.xml` | 77 |
| JSP dataConfirm | `src/main/webapp/WEB-INF/jsp/billing/dataConfirm.jsp` | 209 |
| JSP qlikView | `src/main/webapp/WEB-INF/jsp/billing/qlikView.jsp` | 60 |
| **총** | (7 file) | **603 LOC** |

★ `examples/poc-11-efiweb-billing-spring41/source/{java,sqlmap,jsp,message}/` = ★ ★ 미사용 / 빈 디렉토리 (★ Day 0.5 시점 4 빈 디렉토리 생성 → ★ 본 결단 후 cleanup carry — 정책 정합 가독성 ↑).

---

## 5. 영향 (★ 본체 영향 분석)

| 영역 | 영향 | 의무 |
|---|---|---|
| 본체 schema | ❌ 변경 ❌ | 없음 |
| 본체 deliverable | ❌ 변경 ❌ | 없음 |
| 본체 ADR | ❌ 변경 ❌ | 없음 (★ ADR 자격 ❌ / 운영 정책) |
| methodology-spec/workflow | ❌ 변경 ❌ | 없음 |
| skills | ❌ 변경 ❌ | 없음 |
| tools | ❌ 변경 ❌ | 없음 (sql-inventory-extractor 등 path argument 받음 / source 위치 무관) |
| chain harness 5 요소 | ❌ 변경 ❌ | 없음 |
| PoC 산출 traceability | ✅ source path absolute reference 의무 | plan + DEC + REPORT |
| 향후 PoC plan 1차 ★ 의무 표현 | ✅ "사용자 source 위임 = path 위임" 명문화 | 추후 PoC prelim DEC + plan 1차 |

★ ★ 본 결단 = **운영 정책 변경** (사상 변경 ❌ / chain harness 5 요소 변경 ❌). ADR ❌ / DEC 등재 충분.

---

## 6. carry 매핑

- ~~**C-in-place-read-policy**~~ ✅ **resolved 2026-05-12** (본 DEC 등재)
- ★ 신규 **C-poc-11-source-디렉토리-cleanup** — `examples/poc-11-efiweb-billing-spring41/source/{java,sqlmap,jsp,message}/` 4 빈 디렉토리 / 정책 정합 cleanup (낮은 우선순위 / Day 3.5 종결 시 일괄)

---

## 7. 후속 의무

1. ✅ STATUS.md L8~ "본 session 2026-05-12 진행" 절 갱신 — PoC #11 Day 0.5 종결 + 본 DEC 등재
2. ✅ INDEX.md DEC 등재
3. PoC #11 Day 1 진입 (★ 본 결단 첫 적용 / source path absolute reference 사용)
4. 추후 사내 PoC plan 1차 작성 시 ★ "사용자 source 위임 = path 위임" 명문화 의무

---

## 8. 참조

- 사용자 결단 (β) 2026-05-12 (본 session)
- 사용자 결단 (α) 2026-05-07 ("EFI-WEB 가장 우선순위 높다" / PoC #11 우선)
- plan 2차: `~/.claude/plans/d-poc-11-billing-2.md` §2 (in-place read 정책 채택)
- plan 1차: `~/.claude/plans/d-poc-11-billing.md` §3 (★ 폐기된 사본 패턴 명시)
- DEC prelim: `DEC-2026-05-07-poc-11-prelim-신설.md`
- 직전 PoC: DEC-2026-05-08-poc-07-종결 (PoC #07 / 사본 패턴 last)
- 4원칙: CLAUDE.md §"Work Principles (4원칙)"

---

## 9. ★ 정합 요약 한 줄

★ ★ ★ 사내 PoC = in-place read (path 위임) / 외부 OSS PoC = clone 보존 / PoC 산출만 본 레포 저장.
