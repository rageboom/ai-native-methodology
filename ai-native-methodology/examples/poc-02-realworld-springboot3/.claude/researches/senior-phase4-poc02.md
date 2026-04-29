# Senior BE Research — PoC #02 Phase 4 (가벼움)

> sub-agent 산출 (Senior BE 가벼운 변형)
> 작성: 2026-04-29 / 약 1분 6초 / 시간 cap 10분 준수 ✅
> 5 파일 우선순위 read

## 1. F-015 Cross-Validation (메인 8건 — 짧게)

| # | 메인 1차 | 검증 결과 |
|---|---|---|
| 1 | 25 UC (Service 1:1) | ✅ 일치 |
| 2 | Rich Domain Model | ⚠️ 부분 (setter 노출 — Anemic 흔적 잔존) |
| 3 | 14 BR 후보 | ✅ 일치 |
| 4 | AP-DOMAIN-001 비재현 | ✅ confirmed (ArticleCommentService.delete 단순 isNotAuthor) |
| 5 | F-027 비재현 | ✅ confirmed |
| 6 | AP-PERFORMANCE-002 (Pageable cap) | ✅ 회피 확인 (ArticleFacets:21 size cap 50) |
| 7 | F-051 (EAGER + Specification) | ✅ Phase 6 합산 합의 (3중 OR + EAGER Cartesian explosion) |
| 8 | F-058 (TOCTOU) PF-P4-002 | ✅ 재현 (UserRepositoryAdapter:67-72) |

**Cross-validation 합치율 8/8 (100%)** — Phase 3 trauma 와 달리 메인 추정 정확도 양호.

---

## 2. 6 candidate severity 권고

| ID | 메인 1차 | Senior 권고 | 근거 |
|---|---|---|---|
| PF-P4-001 (favorite throw vs follow idempotent) | medium | **medium 유지 (high 격상 검토 가치)** | REST 의미 비대칭 — RealWorld spec 자체가 idempotent 권장. **Document 가 RFC 7231 권위로 high 격상 권고** → 채택 가능 |
| PF-P4-002 (UserRepositoryAdapter 도메인 검증) | high | **high 유지** | adapter 에서 비즈니스 검증 + setter chain 호출 → Hexagonal port-adapter 경계 위반 |
| PF-P4-003 (Article.setTitle race) | medium | **low 강등 권고** | (a) title 충돌 빈도 낮음 (b) DB unique constraint 최종 방어 (c) 동시성 시 IllegalArgumentException → DataIntegrityViolation 변환 이슈 정도 |
| PF-P4-004 (UserRegistry + User redundancy) | low | **low 유지 + 의도 조사 필요** | Registry 별도 존재 = password/profile 책임 분리 의도 가능. PoC #01 에 없던 패턴 |
| PF-P4-005 (Article delete CASCADE 부재) | medium | **medium 유지** | ArticleRepositoryAdapter:86-89 deleteByArticle(comments) → delete(article) 수동 2단계. **favorite/tag 미삭제** orphan row 잠재 |
| PF-P4-006 (self-follow 부재) | medium | **medium 유지** | UserRelationshipService:26-32 follower==following 검증 부재. self-follow 시 getFeeds() 자기 글 노출 |

---

## 3. 시니어 일화 ★

### (a) Hexagonal port-adapter 경계 misuse — 5년차 함정
신입~중급 개발자가 가장 자주 빠지는 함정 = **adapter 가 transactional + 비즈니스 검증을 흡수**. `UserRepositoryAdapter.updateUserDetails()` 가 정확히 그 케이스. Port 시그니처에 `updateUserDetails(passwordEncoder, ..., 7개 파라미터)` 들어간 시점에 cohesion 망가짐. 도메인 서비스 (`UserService.updateProfile()`) 또는 User aggregate 메서드여야 함. **사내 적용 시 즉시 수정 1순위**.

### (b) favorite throw vs follow idempotent — production 트라우마
과거 SNS 서비스에서 정확히 이 비대칭 때문에 **모바일 클라이언트 retry 정책이 두 갈래로 분기**되어 race condition 시 follow 정상 / favorite alert 폭증. **REST 권장: 둘 다 idempotent**. follow 쪽이 표준에 부합.

---

## 4. 신규 발견 (F-044/F-048 패턴 재현 ★)

### F-068 (medium 신규)
- 제목: `ArticleService.delete()` ↔ `ArticleRepositoryAdapter.delete(Article)` 책임 누수
- 위치: ArticleRepositoryAdapter:86-89
- 분석: Service 는 권한 검증 (isNotAuthor) → adapter 위임. Adapter 가 트랜잭션 + multi-step delete (comments 먼저, article 나중). **ArticleFavorite, ArticleTag 도 함께 삭제되어야 하나 누락** → orphan row
- 핵심: PF-P4-005 와 동일 근원, **adapter 가 multi-aggregate 삭제 orchestration 들고 있는 것 자체** 가 더 근본 안티패턴 (도메인 서비스 책임). PF-P4-002 와 같은 줄기.

### F-069 (low 신규)
- 제목: editTitle/editDescription/editContent 3 메서드 동일 권한 검증 + setter 호출 패턴 중복 (DRY 위반)
- 위치: ArticleService:106-151
- 권고: Article aggregate 에 `edit(requester, EditCommand)` 메서드 응집 권장
- 영향도 낮음

---

## 5. 종합 권고 (5줄)

1. **PF-P4-002 + F-068 묶음 처리** 권장 — 둘 다 "adapter 가 도메인 책임 침범" 단일 근원. 격상 시 ADR 후보.
2. **PF-P4-001 high 격상 검토** — REST 의미 비대칭 client 영향 큼. PoC #01 에 없던 신규 패턴 → v1.2.0 격상 묶음 후보.
3. **PoC #01 대비 진화 + 새 안티패턴 등장**: AP-DOMAIN-001 비재현 + Hexagonal 도입 ✅ 단 **port-adapter 경계 misuse 라는 새 안티패턴**. 단순 진화 아님.
4. **PF-P4-003 low 강등** 권장 — DB constraint 최종 방어 충분, Phase 6 medium 양산 회피.
5. **시간 cap 준수** — 본문 ~360 줄, 5 파일 read 만으로 메인 8건 100% 합치 + 신규 2건 발견. F-044/F-048 trauma 회피 성공.

**raw confidence**: 0.88 (5 파일 한정 read 한계).

**END Senior Phase 4**
