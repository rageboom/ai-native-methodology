// src/app/app-layout.ui.tsx

type UserLinksProps = {
  user: UserResponse['user'];
};

// src/app/app.loader.ts

export type AppLoaderData = Awaited<ReturnType<typeof appLoader>>;

// src/pages/article/article.loader.ts

export type ArticlePageLoaderData = Awaited<ReturnType<typeof articlePageLoader>>;

// src/pages/article/article.ui.tsx

type ArticleContentProps = {
  article: SingleArticleResponse['article'];
};

// src/pages/article/article.ui.tsx

type ArticleActionsBlockProps = {
  article: SingleArticleResponse['article'];
};

// src/pages/article/article.ui.tsx

type FollowAuthorButtonProps = {
  username: string;
  following: boolean;
};

// src/pages/article/article.ui.tsx

type FavoriteArticleButtonProps = {
  favorited: boolean;
  favoritesCount: number;
};

// src/pages/article/article.ui.tsx

type CommentsListProps = {
  commentsData: MultipleCommentsResponse;
};

// src/pages/article/article.ui.tsx

type DeleteCommentButtonProps = {
  slug: string;
  id: number;
};

// src/pages/editor/editor.loader.ts

export type EditorPageLoaderData = Awaited<ReturnType<typeof editorPageLoader>>;

// src/pages/editor/editor.ui.tsx

type EditorFormProps = {
  article?: SingleArticleResponse['article'];
};

// src/pages/home/home.loader.ts

export type HomePageLoaderData = Awaited<ReturnType<typeof homePageLoader>>;

// src/pages/home/home.state.ts

export type HomeSearchParams = {
  limit: number;
  offset: number;
  feed?: 'personal';
  tag?: string;
};

// src/pages/home/home.state.ts

type HomeNavigation = {
  isTagActive: boolean;
  isPersonalActive: boolean;
  isGlobalActive: boolean;
  tag: string | null;
};

// src/pages/home/home.ui.tsx

type HomeArticlesListProps = {
  articles: MultipleArticlesResponse['articles'];
  articlesCount: MultipleArticlesResponse['articlesCount'];
  searchParams: GetArticlesParams;
};

// src/pages/home/home.ui.tsx

type HomeArticlePreviewCardProps = {
  article: ArticlePreview;
};

// src/pages/home/home.ui.tsx

type HomeFavoriteButtonProps = {
  article: ArticlePreview;
};

// src/pages/home/home.ui.tsx

type HomeArticleListPaginationProps = {
  searchParams: GetArticlesParams;
  articlesCount: number;
};

// src/pages/home/home.ui.tsx

type TagListProps = {
  tags: string[];
  searchParams: HomeSearchParams;
};

// src/pages/profile/profile.loader.ts

export type ProfilePageLoaderData = Awaited<ReturnType<typeof profilePageLoader>>;

// src/pages/profile/profile.state.ts

type ProfileSearchParams = {
  limit: number;
  offset: number;
  author?: string;
  favorited?: string;
};

// src/pages/profile/profile.state.ts

type ProfileNavigation = {
  isAuthorFeedActive: boolean;
  isFavoritedFeedActive: boolean;
};

// src/pages/profile/profile.ui.tsx

type ProfileInfoProps = {
  profile: ProfileResponse['profile'];
};

// src/pages/profile/profile.ui.tsx

type ProfileFollowButtonProps = {
  profile: ProfileResponse['profile'];
};

// src/pages/profile/profile.ui.tsx

type ProfileArticlesListProps = {
  articles: MultipleArticlesResponse['articles'];
  articlesCount: MultipleArticlesResponse['articlesCount'];
  searchParams: GetArticlesParams;
};

// src/pages/profile/profile.ui.tsx

type ProfileArticlePreviewCardProps = {
  article: ArticlePreview;
};

// src/pages/profile/profile.ui.tsx

type ProfileFavoriteButtonProps = {
  article: ArticlePreview;
};

// src/pages/profile/profile.ui.tsx

type ProfileArticleListPaginationProps = {
  searchParams: GetArticlesParams;
  articlesCount: number;
};

// src/pages/settings/settings.loader.ts

export type SettingsPageLoaderData = Awaited<ReturnType<typeof settingsPageLoader>>;

// src/shared/api/action-result.ts

export type ErrorFields = Record<string, string[]>;

// src/shared/api/action-result.ts

export type ActionResult<TSuccess extends object = Record<string, never>> =
  | ({ ok: true } & TSuccess)
  | { ok: false; errors: ErrorFields };

// src/shared/api/auth-fetch.ts

export interface ApiTransportError<Info = unknown> extends Error {
  status?: number;
  info?: Info;
  headers?: Headers;
}

// src/shared/api/validateSchema.ts

type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

// src/shared/api/validateSchema.ts

type SafeParseResult<TParsed> =
  | { success: true; data: TParsed }
  | { success: false; error: { issues: ValidationIssue[] } };

// src/shared/api/validateSchema.ts

type SafeParseSchema<TParsed> = {
  safeParse(data: unknown): SafeParseResult<TParsed>;
};

// src/pages/article/actions/comment-create.action.ts

export type CommentCreateActionData = typeof commentCreateAction;

// src/pages/editor/actions/article-create.action.ts

export type ArticleCreateActionData = typeof articleCreateAction;

// src/pages/editor/actions/article-update.action.ts

export type ArticleUpdateActionData = typeof articleUpdateAction;

// src/pages/login/actions/user-login.action.ts

export type UserLoginActionData = typeof userLoginAction;

// src/pages/register/actions/user-register.action.ts

export type UserRegisterActionData = typeof userRegisterAction;

// src/pages/settings/actions/user-logout.action.ts

export type UserLogoutActionData = typeof userLogoutAction;

// src/pages/settings/actions/user-update.action.ts

export type UserUpdateActionData = typeof userUpdateAction;

// src/shared/ui/async-error-card/async-error-card.ui.tsx

type AsyncErrorCardProps = {
  title: string;
  fallbackMessage: string;
};

// src/shared/ui/error-messages/error-messages.ui.tsx

type ErrorMessagesProps = {
  errors: ErrorFields;
};

// src/shared/ui/global-progress-bar/use-fake-progress.ts

interface UseFakeProgressOptions {
  isAnimating: boolean;
  animationDuration?: number;
  incrementDuration?: number;
  minimum?: number;
}

// src/shared/ui/global-progress-bar/use-fake-progress.ts

interface UseFakeProgressReturn {
  progress: number;
  isFinished: boolean;
  animationDuration: number;
}