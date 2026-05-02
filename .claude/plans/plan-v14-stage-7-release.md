# plan-v14-stage-7-release

> v1.4.0-dev → ★ ★ ★ ★ ★ v1.4.0 MINOR release 결단 절차
> 4원칙 1번 산출 (★ release 절차 / research 부담 ❌ — Stage 5 종결 시 자격 7/7 입증 완료)
> 일자: 2026-05-02

---

## 0. 정직 표기

- ★ Stage 5 종결 = ★ release 자격 7/7 충족 입증 (DEC-Stage-5-종결).
- 본 plan = release 절차 정리 / 신규 분석 0.
- ★ git tag = ★ ★ ★ release 공식화 (★ git history 영구 표시 / 사용자 승인 의무).

---

## 1. ★ release 자격 입증 (★ 종결 입력)

DEC-2026-05-02-v1.4-Stage-5-종결 §4 → ★ Stage 7 진입 자격 7/7 충족:

| # | 자격 | 결과 |
|---|---|---|
| 1 | 사상 정합 | ✅ |
| 2 | IR ratchet 0.95+ | ✅ 0.99 |
| 3 | 진짜 도구 5종+ | ✅ 6 도구 (Semgrep ⏳) |
| 4 | finding 5~15 | ✅ 6 |
| 5 | 신뢰도 0.90+ | ✅ 0.92 |
| 6 | ★ 본체 격상 ≥ 2건 | ✅ ADR-FE-007 (2건) |
| 7 | ADR carry 0 또는 명시 | ✅ 4 carry 명시 |

→ ★ ★ ★ ★ release 진입 ✅.

---

## 2. ★ ★ release 작업 (★ 본 plan 핵심)

### 2.1 release note 작성

`docs/v1.4-release-note.md` 신설 (★ 4 carry 명시 의무).

### 2.2 CHANGELOG.md 갱신

- v1.4.0-dev → **v1.4.0** (dev → release / 일자 2026-05-02)
- 4 carry 명시
- ★ "사내 표준 채택 가능 시점 도달 (v1.3.0 → v1.4.0 격상)" 명시

### 2.3 STATUS.md 갱신

- 기준일 + 본체 버전 entry 갱신 (★ ★ ★ ★ ★ v1.4.0 release 보존 시점)

### 2.4 INDEX.md 갱신

- DEC-v1.4.0-release.md 등재 (★ top entry)

### 2.5 DEC-2026-05-02-v1.4.0-release.md

★ release 결단 메타.

### 2.6 README.md 갱신 (선택)

- 본체 버전 v1.3.1 → v1.4.0
- ★ ★ ADR-FE 7건 + schemas 13종 + tools 6종 + 4 PoC 정합 도달 명시

### 2.7 memory 갱신

- ★ project_v140_release_status.md 신설 (★ Stage 4 mini + Stage 5 본격 + Stage 7 release 종합)
- ★ feedback_v140_release_pattern.md (★ Stage 4 fail-fast → Stage 5 본격 4 sprint → Stage 7 release 패턴)

### 2.8 git tag v1.4.0 (★ ★ ★ ★ ★ ★ ★ 영구 release 공식화)

```bash
git tag v1.4.0
```

### 2.9 commit 분할

- Phase A: release note + CHANGELOG + STATUS + INDEX + DEC + memory
- Phase B: git tag

---

## 3. ★ ★ ★ release 의의 (★ Stage 5 누적)

★ ★ ★ v1.4.0 = ★ ★ FE 트랙 ★ ★ ★ 정식 진입:
- v1.3.0 (2026-05-01 / 사내 표준) — BE 한정
- ★ ★ ★ **v1.4.0 (2026-05-02 / FE+BE 양 트랙)** — ★ FE 트랙 + §8.1 strict 정합 검증대 첫 통과 + 본체 antipattern 카탈로그 첫 등재

---

## 4. ★ 4 명시 carry-over (★ release note 의무)

1. ★ Semgrep CLI Docker 진짜 실행 (★ 사용자 위임 / Linux runner)
2. ★ F-FE-006 산출물 schema 270+ violation (★ Stage 6+ resolve)
3. ★ deliverable 11 i18n-spec (★ G1 D / adoption 합산)
4. ★ v1.5 carry — drift-validator FE 본격 비교 + URL params validation schema 확장

---

## 5. ★ 사용자 승인 의무

★ ★ ★ git tag v1.4.0 = ★ ★ release 공식화 → ★ 사용자 승인 의무 (★ Senior 권고).

★ "진행" 명시 = ★ ★ 사용자 승인 ✅ → ★ 자동 진행 가능.

---

## 6. 종결 진술

> 본 plan = Stage 7 v1.4.0 MINOR release 결단 절차 4원칙 1번 산출.
> ★ Stage 5 종결 시 release 자격 7/7 입증 완료 → ★ research 부담 ❌.
> Phase A (release note + 메타) + Phase B (git tag).
> ★ ★ ★ ★ ★ ★ v1.4.0 = FE 트랙 정식 진입 + §8.1 strict 검증대 첫 통과 + 본체 antipattern 카탈로그 첫 등재.

**End of plan-v14-stage-7-release.**
