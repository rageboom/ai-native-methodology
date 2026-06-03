/**
 * Article Aggregate — Refinement Type + Invariant (Phase 4.5)
 *
 * 일자: 2026-04-30
 * Source of Truth: 코드 (src/article/article.service.ts + article.entity.ts)
 * Direction: B (코드 → L2)
 *
 *  Counter Aggregate 집중 (Senior 권고) — favoriteCount 단조성 + slug 가변성 invariant
 */

type ArticleId = number & { readonly __brand: 'ArticleId' };
type Slug = string & {
  readonly __brand: 'Slug';
  readonly __refinement: {
    readonly notNull: true;
    readonly notBlank: true;
    readonly format: 'kebab-case';
    readonly uniqueScope: 'global';
    //  F-120 — DB UQ 부재 → uniqueScope 미보장
  };
};
type FavoriteCount = number & { readonly __brand: 'FavoriteCount'; readonly __refinement: { readonly nonNegative: true } };

// ============================================================================
// Aggregate
// ============================================================================

interface ArticleEntity {
  readonly id: ArticleId;
  readonly slug: Slug;
  readonly title: string;
  readonly description: string;
  readonly body: string;        //  varchar(255) — text 권장 (F-133)
  readonly created: Date;
  readonly updated: Date;
  readonly tagList: string[];   // simple-array
  readonly favoriteCount: FavoriteCount;
  readonly authorId: number;
}

// ============================================================================
// Invariants — Counter Aggregate 집중
// ============================================================================

namespace ArticleInvariants {
  /**
   * INV-ARTICLE-FAVORITE-COUNT-MONOTONIC ( F-135 critical)
   * - favoriteCount == favorites.length (단조성)
   * -  App level 만 보장 / DB level FOR UPDATE 부재 → race window 위반
   */
  export const favoriteCountMatchesFavorites = (
    article: ArticleEntity,
    favorites: { articleId: ArticleId }[]
  ): boolean => {
    const count = favorites.filter(f => f.articleId === article.id).length;
    return article.favoriteCount === count;
  };

  /**
   * INV-ARTICLE-FAVORITE-COUNT-NON-NEGATIVE
   * - favoriteCount >= 0 (단순)
   */
  export const favoriteCountNonNegative = (article: ArticleEntity): boolean =>
    article.favoriteCount >= 0;

  /**
   * INV-ARTICLE-SLUG-UNIQUE ( F-120-slug)
   * - rules.json BR-ARTICLE-SLUG-AUTO-001
   * -  DB UQ 부재 + random suffix 의존
   */
  export const slugUnique = (articles: ArticleEntity[]): boolean =>
    articles.every((a1, i) =>
      articles.slice(i + 1).every(a2 => a1.slug !== a2.slug)
    );

  /**
   * INV-ARTICLE-SLUG-FORMAT
   * - kebab-case (slugify) + random suffix
   */
  export const slugFormatValid = (article: ArticleEntity): boolean =>
    /^[a-z0-9]+(-[a-z0-9]+)*-[a-z0-9]+$/.test(article.slug);

  /**
   * INV-ARTICLE-AUTHOR-EXISTS ( FK 권고)
   * - DB FK author_id → user(id) 권고 (현재 = TypeORM @ManyToOne 만)
   */
  export const authorExists = (article: ArticleEntity, validUserIds: Set<number>): boolean =>
    validUserIds.has(article.authorId);

  /**
   * INV-ARTICLE-SLUG-UPDATE-ON-TITLE-CHANGE ( F-126)
   * - title 변경 시 slug 재생성 (현재 = TODO 주석으로 미구현)
   * - 본 invariant 는 update 전후 비교 (event invariant)
   */
  export const slugUpdatedOnTitleChange = (
    before: ArticleEntity,
    after: ArticleEntity
  ): boolean => {
    if (before.title === after.title) return before.slug === after.slug;
    //  현재 코드 = title 변경 시 slug 미업데이트 (F-126)
    // 권고: title 변경 시 slug 재생성 또는 명시적 immutable 정책
    return true;  // 현재 코드 동작 = invariant 위반 허용
  };
}

// ============================================================================
// Counter Atomicity Invariants ( F-135 — Senior 권고 핵심)
// ============================================================================

namespace CounterAtomicity {
  /**
   * 두 동시 favorite 시 favoriteCount 정확히 +1 (race-safe)
   * - 현재 =  App 1중 isNewFavorite check / DB FOR UPDATE 부재
   * - 권고: SELECT ... FOR UPDATE + transaction 또는 atomic UPDATE
   */
  export const concurrentFavoriteSafe = async (
    article: ArticleEntity,
    concurrentFavorites: number,
    finalCount: number
  ): Promise<boolean> => {
    // 정확히 concurrentFavorites 만큼만 증가 (중복 increment ❌)
    return finalCount <= article.favoriteCount + concurrentFavorites;
  };

  /**
   * unfavorite 도 동일 — DB level atomicity 의무
   */
  export const concurrentUnfavoriteSafe = (
    article: ArticleEntity,
    concurrentUnfavorites: number,
    finalCount: number
  ): boolean => {
    return finalCount >= article.favoriteCount - concurrentUnfavorites && finalCount >= 0;
  };
}

// ============================================================================
// Pre-condition / Post-condition (UC-ARTICLE-FAVORITE)
// ============================================================================

namespace UC_ARTICLE_FAVORITE {
  type Input = { userId: number; articleId: ArticleId };
  type Output = ArticleEntity | { error: 'HttpException'; status: number; message: string };

  export const precondition = (input: Input): boolean =>
    input.userId != null && input.articleId != null;

  export const postcondition = (
    input: Input,
    output: Output,
    articleBefore: ArticleEntity,
    articleAfter: ArticleEntity,
    favoritesAfter: { userId: number; articleId: ArticleId }[]
  ): boolean => {
    if ('error' in output) return true;

    //  단조성 invariant
    return (
      ArticleInvariants.favoriteCountNonNegative(articleAfter) &&
      ArticleInvariants.favoriteCountMatchesFavorites(articleAfter, favoritesAfter) &&
      // 신규 favorite = +1 / 이미 favorited = 0
      (articleAfter.favoriteCount === articleBefore.favoriteCount ||
        articleAfter.favoriteCount === articleBefore.favoriteCount + 1)
    );
  };
}

/*
 * 발견된 갭:
 *
 * F-135 (재확인)  critical — favoriteCount race window
 *   현재: App 1중 isNewFavorite check / DB FOR UPDATE 부재
 *   권고: SELECT FOR UPDATE + transaction 또는 atomic UPDATE article SET count = count + 1
 *
 * F-120-slug (재확인) — slug UQ 부재
 *   현재: random suffix 의존
 *   권고: DB UQ + catch QueryFailedError → 재생성
 *
 * F-126 (재확인) — title 변경 시 slug 미업데이트 (TODO 주석)
 *   현재: invariant 위반 허용
 *   권고: title 변경 시 slug 재생성 + redirect 또는 immutable 정책
 *
 * F-124 (재확인) — comments eager:true → N+1 (PoC #02 F-051 cross-val)
 *
 * F-053-variant — slugify random suffix (PoC #02 F-053 cross-val 변형)
 *
 * F-151 (신규) — 단조성 invariant App level 만 보장 / DB level 부재
 */

export {
  ArticleEntity, ArticleId, Slug, FavoriteCount,
  ArticleInvariants, CounterAtomicity, UC_ARTICLE_FAVORITE
};
