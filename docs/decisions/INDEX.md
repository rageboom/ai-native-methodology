# Decision Log Index — 마켓플레이스 레벨

> 역시간순. **마켓플레이스 모노레포 전체**(레포 정체성 / 공유 빌드·배포 / 플러그인 추가 규약)에 대한 결정의 단일 진입점.
> 특정 플러그인 국소 결정은 그 플러그인 안에 둔다 — 예: context-ops = [`plugins/context-ops/decisions/INDEX.md`](../../plugins/context-ops/decisions/INDEX.md).
> 상세는 각 파일 참조. (구분 근거 = `DEC-2026-06-23-marketplace-monorepo-identity` §2.4)

---

## 채택·시행

- **[DEC-2026-06-23-marketplace-monorepo-identity](DEC-2026-06-23-marketplace-monorepo-identity.md)** — 레포 정체성 = `@mis-plugins/monorepo` 마켓플레이스 모노레포(N 플러그인 호스팅)로 정식 명문화 / context-ops = flagship 플러그인(AI-Native 방법론). 인프라는 이미 일반화돼 있었음을 확인 + 재사용 스캐폴드(`templates/plugin-scaffold/` + `pnpm plugin:new`) + `docs/add-a-plugin.md` 규약 SSOT + 마켓플레이스/플러그인 거버넌스 위치 분리. additive·non-gating.
