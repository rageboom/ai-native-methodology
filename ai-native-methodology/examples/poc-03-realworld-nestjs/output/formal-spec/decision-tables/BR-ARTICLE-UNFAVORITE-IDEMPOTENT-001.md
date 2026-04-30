# BR-ARTICLE-UNFAVORITE-IDEMPOTENT-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30 (Phase 4.5 추가 형식화 / B 작업)
> **Source of Truth**: 코드 (article.service.ts:163 deleteIndex + splice + favoriteCount--)
> **PoC #02 cross-validation**: ★ AP-API-001 favorite/unfavorite + RFC 9110 §15.3.5 (DELETE 204) — F-158 합산

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-ARTICLE-UNFAVORITE-IDEMPOTENT-001
> - condition: "deleteIndex >= 0"
> - action: "splice + favoriteCount--"
> - expected_result: "이미 unfavorite 시 silent skip"
> - current_state: "complete (App level idempotent)"  ← ★ 그러나 ★ DB level race + ★ ApiResponse 201

**자연어 4 / 9 = 44%**.

---

## 2. L1 결정표 (현재 코드)

### 2-A. 일반 분기 (DELETE /api/articles/:slug/favorite)

| user.favorites 에 article 존재 | deleteIndex | App splice | favoriteCount-- | 결과 | HTTP |
|:---:|:---:|:---:|:---:|---|---|
| ✅ | >= 0 | ✅ | ✅ | DB UPDATE | 201 (★ ApiResponse 201 / RFC 위반 — F-158) |
| ❌ | -1 | ❌ (skip) | ❌ | silent skip | 201 |

### 2-B. ★ Race Window 분기 (★ F-135 동형)

```
시점 T0: A user, B user 동시 unfavorite 호출 (이미 favorite 상태)
시점 T1: A read user.favorites → deleteIndex=3
시점 T2: B read user.favorites → deleteIndex=3 (★★ 양쪽 동일 index)
시점 T3: A splice + favoriteCount-- (count=N-1)
시점 T4: B splice + favoriteCount-- (count=N-2)  ← ★ count 2회 감소 (한 번이어야)
```

→ **★ F-135 동형 race window** (favorite race window 와 같은 메커니즘).

| 시점 T0 동시성 | A 결과 | B 결과 | 최종 count | 정합성 |
|:---:|:---:|:---:|:---:|---|
| 1건만 | OK | (skip) | N-1 | ✅ |
| 2건 동시 | splice | splice (★ App 1중) | **N-2** | ★ 손실 |
| 2건 동시 (DB UQ pair) | DELETE | DELETE 0 row affected → silent | N-1 | ✅ (★ fix 후) |

---

## 3. L2 Refinement Type

```typescript
namespace ArticleInvariants {
  // INV — unfavorite 후에도 favoriteCount === favorites.length 단조성 보장
  export const monotonicityAfterUnfavorite = (
    before: ArticleEntity,
    after: ArticleEntity,
  ): boolean => {
    const decrement = before.favoriteCount - after.favoriteCount;
    return decrement === 0 || decrement === 1;  // ★ skip 또는 -1 만 허용
  };
}
```

---

## 4. 코드 생성안 (Direction D 권고)

### 4-A. ★ DB level DELETE (App splice 제거)

```typescript
async unFavorite(userId: number, slug: string): Promise<ArticleRO> {
  const article = await this.articleRepository.findOne({where: {slug}});
  if (!article) throw new HttpException('Article not found', 404);

  return await this.dataSource.transaction(async (mgr) => {
    // ★ DB level DELETE — affected_rows 0 = idempotent silent skip
    const result = await mgr.delete(ArticleFavoriteEntity, {userId, articleId: article.id});

    if (result.affected === 1) {
      // ★ atomic DECREMENT (race-safe)
      await mgr.decrement(ArticleEntity, {id: article.id}, 'favoriteCount', 1);
    }

    return await mgr.findOne(ArticleEntity, {where: {id: article.id}});
  });
}
```

### 4-B. NestJS @HttpCode(204) (RFC 정합 / F-158 fix)

```typescript
@Delete(':slug/favorite')
@HttpCode(204)  // ★ NEW — RFC 9110 §15.3.5 (DELETE 204 No Content)
async unFavorite(...) {}
```

→ ApiResponse 데코도 204 로 통일.

---

## 5. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-135 (cumul) | favorite race + unfavorite race 양쪽 — App 1중 / DB FOR UPDATE 부재 | critical | §2-B |
| F-158 (cumul) | NestJS @Delete default 200 + ApiResponse 201 / RFC 9110 §15.3.5 권고 204 | high | §4-B |
| F-151 (cumul) | favoriteCount === favorites.length 단조성 보장 부재 | medium | §3 |

---

## 6. PoC #02 cross-validation

| 항목 | PoC #02 (unfavorite RFC 7231) | PoC #03 (BR-ARTICLE-UNFAVORITE) |
|---|---|---|
| HTTP method | DELETE 분리 ✅ | DELETE 분리 ✅ |
| RFC 위반 | spec 200 / runtime 422 | spec 201 / runtime 200 (F-158 ★ 변형) |
| race window | (PoC #02 미발견) | ★ F-135 동형 race |
| 권고 | RFC 7231 §4.2.2 + RFC 9110 §15.3.5 | ★ atomic DELETE + @HttpCode(204) |

→ **★ favorite/unfavorite cross-pair 재현** (PoC #02 favorite 만 발견, PoC #03 = 양쪽 발견).
