// Semgrep test fixture for rules/error-mapping-missing.yml NestJS sub-rule.
// 실행: PYTHONUTF8=1 semgrep --test --config error-mapping-missing.yml error-mapping-missing.ts
// 본 fixture = AP-API-001 NestJS decorator drift mechanism — @Delete + @ApiResponse({status: 201}).
// PoC #03 article.controller.ts:65,68 + 81,85 + 97,99 학습.

// Mock decorator stubs (fixture 만 / 실 런타임 ❌)
declare function Delete(path: string): MethodDecorator;
declare function ApiResponse(opts: { status: number; description?: string }): MethodDecorator;
declare function HttpCode(code: number): MethodDecorator;

// ===== positive cases (ruleid 매칭 의무 / @Delete + @ApiResponse 201) =====

class ArticleControllerDrift {
    // ruleid: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    @Delete(':slug')
    @ApiResponse({status: 201, description: 'article deleted'})
    deleteArticle(): void {}
}

class FavoriteControllerDrift {
    // ruleid: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    @Delete(':slug/favorite')
    @ApiResponse({status: 201, description: 'unfavorited'})
    unfavorite(): void {}
}

class CommentControllerDrift {
    // ruleid: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    @ApiResponse({status: 201, description: 'comment deleted'})
    @Delete(':id/comments/:commentId')
    deleteComment(): void {}
}

// ===== negative cases (ok 매칭 의무) =====

// (1) @Delete + @ApiResponse 204 — 정합
class ArticleControllerOK {
    // ok: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    @Delete(':slug')
    @ApiResponse({status: 204, description: 'deleted'})
    @HttpCode(204)
    deleteArticle(): void {}
}

// (2) @Post + @ApiResponse 201 — 정합 (creation)
class UserControllerOK {
    // ok: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    @ApiResponse({status: 201, description: 'user created'})
    register(): void {}
}

// (3) @Delete + @ApiResponse 200 — 정합 (body 반환)
class ArticleControllerOK2 {
    // ok: internal.be.api.error-mapping-nestjs-delete-201-decorator-drift
    @Delete(':slug')
    @ApiResponse({status: 200, description: 'deleted with body'})
    deleteArticle(): void {}
}
