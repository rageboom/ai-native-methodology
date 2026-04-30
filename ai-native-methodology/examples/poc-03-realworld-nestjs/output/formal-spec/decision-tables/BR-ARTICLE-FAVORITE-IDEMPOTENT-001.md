# BR-ARTICLE-FAVORITE-IDEMPOTENT-001 — Decision Table (Phase 4.5)

> **일자**: 2026-04-30 (Phase 4.5 추가 형식화 / B 작업)
> **Source of Truth**: 코드 (article.service.ts:147 isNewFavorite + push + favoriteCount++)
> **PoC #02 cross-validation**: ★ AP-API-001 favorite RFC 7231 §4.2.2 → ★ AP-API-001 + AP-DB-001 합산 (race window)

---

## 1. 정책 문장 (자연어 — L0)

> rules.json BR-ARTICLE-FAVORITE-IDEMPOTENT-001
> - condition: "user.favorites 에 이미 존재"
> - action: "isNewFavorite check → 신규만 push + favoriteCount++"
> - expected_result: "중복 favorite X / count 단조 증가"
> - current_state: "★ partial — App 1중 + favoriteCount race"

**자연어 4 / 9 = 44%**.

---

## 2. L1 결정표 (현재 코드)

### 2-A. 일반 분기 (POST /api/articles/:slug/favorite)

| user.favorites 에 article 존재 | isNewFavorite | App push 실행 | favoriteCount++ | 결과 | HTTP |
|:---:|:---:|:---:|:---:|---|---|
| ❌ (신규) | true | ✅ | ✅ | DB 저장 | 201 (★ NestJS default — RFC 위반 / F-158) |
| ✅ (이미) | false | ❌ (skip) | ❌ | silent skip | 201 |

### 2-B. ★★ Race Window 분기 (★ F-135 critical)

```
시점 T0: A user, B user 동시 favorite 호출
시점 T1: A read user.favorites → article 부재 (isNewFavorite=true)
시점 T2: B read user.favorites → article 부재 (isNewFavorite=true)
         (★★ 양쪽 통과 — App 1중)
시점 T3: A push + favoriteCount++ (count=N+1)
시점 T4: B push + favoriteCount++ (count=N+2)  ← ★★ count 2회 증가 (한 번이어야)
```

→ **★★ F-135 critical**: App 1중 isNewFavorite check 가 race-prone — 동시 호출 시 count 2회 증가.

| 시점 T0 동시성 | A 결과 | B 결과 | 최종 count | 정합성 |
|:---:|:---:|:---:|:---:|---|
| 1건만 | OK | (skip) | N+1 | ✅ |
| 2건 동시 | push | push | **N+2** | ★★ 손실 |
| 2건 동시 (DB UQ pair) | push | catch ConflictException → silent skip | N+1 | ✅ (★ fix 후) |

---

## 3. L2 Refinement Type

```typescript
type FavoriteCount = number & {
  __refinement: { invariant: 'count === favorites.length' };
};

namespace ArticleInvariants {
  // INV — favoriteCount === favorites.length (App level + DB level 양쪽)
  export const favoriteCountConsistent = (article: ArticleEntity): boolean =>
    article.favoriteCount === article.favorites.length;

  // INV — DB level (race-safe 보장)
  export const allArticlesConsistent = async (repo: Repository<ArticleEntity>): Promise<boolean> => {
    const rows = await repo.query(`
      SELECT a.id, a.favoriteCount, COUNT(f.id) AS actual
      FROM article a LEFT JOIN article_favorites_user f ON a.id = f.articleId
      GROUP BY a.id, a.favoriteCount
      HAVING a.favoriteCount != COUNT(f.id)
    `);
    return rows.length === 0;
  };
}
```

---

## 4. 코드 생성안 (Direction D 권고 — F-135 fix)

### 4-A. DB UQ pair 추가

```typescript
// 별도 join table — TypeORM @ManyToMany 시 자동 생성 OR 수동 entity
@Entity('article_favorites')
@Index(['userId', 'articleId'], { unique: true })  // ★ NEW UQ pair
export class ArticleFavoriteEntity {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => UserEntity) user: UserEntity;
  @ManyToOne(() => ArticleEntity) article: ArticleEntity;
}
```

### 4-B. ★★ atomic UPDATE counter (race-safe)

```typescript
async favorite(userId: number, slug: string): Promise<ArticleRO> {
  const article = await this.articleRepository.findOne({where: {slug}});
  if (!article) throw new HttpException('Article not found', 404);

  // ★★ race-safe pattern — DB transaction
  return await this.dataSource.transaction(async (mgr) => {
    try {
      // ★ DB UQ pair — 충돌 시 ConflictException
      await mgr.insert(ArticleFavoriteEntity, {userId, articleId: article.id});
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return article;  // ★ silent skip (idempotent)
      throw e;
    }

    // ★★ atomic INCREMENT — race-safe
    await mgr.increment(ArticleEntity, {id: article.id}, 'favoriteCount', 1);

    return await mgr.findOne(ArticleEntity, {where: {id: article.id}});
  });
}
```

### 4-C. NestJS @HttpCode(200) (RFC 정합 / F-158 fix)

```typescript
@Post(':slug/favorite')
@HttpCode(200)  // ★ NEW — RFC 9110 §15.3.1 (200 OK idempotent)
async favorite(...) {}
```

---

## 5. 발견된 신규 finding

| # | finding | 심각도 | 근거 |
|---|---|---|---|
| F-135 | favoriteCount race window — App 1중 / DB FOR UPDATE 부재 | **critical** | §2-B |
| F-151 | favoriteCount === favorites.length 단조성 invariant App level 만 보장 | medium | §3 |
| F-158 | NestJS @Post default 201 (RFC 9110 §15.3.1 위반) | high (cumul) | §4-C |

---

## 6. PoC #02 cross-validation

| 항목 | PoC #02 (favorite/unfavorite RFC 7231) | PoC #03 (BR-ARTICLE-FAVORITE) |
|---|---|---|
| HTTP method | POST + DELETE 분리 | POST + DELETE 분리 (★ 동일) |
| RFC 위반 | spec 200 / runtime 422 (F-070) | spec 201 / runtime 201 (F-158) |
| race window | (PoC #02 미발견 영역) | ★ F-135 critical (NestJS / TypeORM 특이) |
| 권고 | RFC 7231 §4.2.2 정합 | ★ DB UQ pair + atomic UPDATE + @HttpCode(200) |

→ **★ AP-API-001 영역 cross-PoC 재현 (RFC 위반)** + **★ F-135 race window 신규** (DB level 보강 필요).
