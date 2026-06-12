# bc-accumulator-rollup

per-BC fragment(`domains/<BC>/`) → **shared 누적기 직렬 post-merge rollup** 오케스트레이터 (DEC-2026-06-12-parallel-bc-accumulator-rollup option ②). 병렬 worktree/CLI 가 도메인별로 분석한 산출물을, 머지 후 **1회 결정론·멱등 rollup** 으로 shared 카탈로그에 합친다.

## 왜

artifact-zone(2-zone)이 business-rules·openapi 등은 `domains/<BC>/` 로 갈라 충돌을 없앴으나, **4 누적기**(`business-rules.json` index · `migration-cautions.json` · findings · `domain.json#bounded_contexts[]`)는 여전히 단일 shared 파일에 BC 마다 append → 병렬 worktree N개가 동시 머지 시 충돌. 본 도구가 그 append 를 **머지 후 직렬 1회**로 결정론화한다. 병렬 worktree 는 자기 BC fragment 만 쓰고 shared 는 read-only.

## diagnose-before-design (재발명 ❌)

upsert primitive 는 이미 **`_shared/append-catalog.js`**(DEC-2026-06-12-resve-multidomain-corroboration §F-1)에 존재 — `upsertById`(sibling-보존)·`upsertBcFile`·`upsertCautionGroup`·`mergeUbiquitousLanguage`·indent 보존 I/O. 본 도구는 그 위에 **ⓐ `domains/<BC>/` 전체 1패스 멱등 오케스트레이션 + ⓑ append-catalog 미커버 findings 누적기**(generic `upsertById` 재사용 + severity 버킷 재계산)만 추가.

## 사용

```bash
node src/cli.js --bc-dir <domains/BC-X> --output-root <output dir> \
  [--bc <BC-ID>] [--findings-phase <phase>] [--shared-domain <path>] [--dry-run] [--report <path>]
```

- `--bc-dir` (필수): per-BC zone 디렉토리. fragment 4종 자동 탐지(`business-rules.json`·`migration-cautions.json`·`findings-<phase>.json`·`domain.json`). 부재 시 **exit 3**.
- `--output-root` (필수): shared 누적기 디렉토리.
- `--dry-run`: **쓰지 않고** 무엇이 바뀔지만 리포트 — 병렬 worktree 규율(직렬 머지 전 미리보기).
- `--bc`: BC ID(기본 `--bc-dir` basename). `--findings-phase`: 기본 `analysis`. `--shared-domain`: 기본 `<root>/shared/domain.json` → `<root>/domain.json` fallback.

### 누적기별 머지 규칙

| 누적기 | 키 | 머지 |
| --- | --- | --- |
| business-rules index | `bounded_context` | leaf 의 rule_count/rule_ids 산출 → bc_files upsert + `total_rules` 재계산 |
| migration-cautions | group `title` | per-BC `caution_groups[]` 를 title 기준 upsert (BC-scoped title 권장) |
| findings | `finding_id` | per-BC `findings[]` upsert + severity 버킷(critical/high/medium/low/info)·total 재계산 |
| domain | bc `id` | bounded_context `{id,name}` upsert + ubiquitous_language 병합. **shared domain.json 선재 의무**(fresh 생성 ❌) |

## 속성

- **멱등**: 재실행 = 동일 상태(키 일치=replace / 중복 0).
- **sibling 보존**: 다른 BC 엔트리 불변.
- **dry-run 안전**: 입력(현 shared) 무변형(내부 deep-clone).
- **no-simulation**: `finding_id` 없는 finding skip(날조 ❌) / domain fragment 불완전·shared domain 부재 시 honest skip.

## dogfood (ep-be-gea BC-REQMNG / 2026-06-12)

BC-EVENT 선재 shared(/tmp 합성 / live `shared/` 무접촉) 에 reqmng fragment rollup → BR index `total_rules 60→96` · cautions 2 group(10 caution) · findings +25 → total 26(버킷 high 12+1=13 재계산) · domain skip(reqmng domain fragment 부재). **재실행 = 전부 replaced / total 불변 = 멱등 실증** + BC-EVENT(60)·BC-REQMNG(36) 양립 = sibling 보존. (1 datapoint → §8.1 propose-only.)
