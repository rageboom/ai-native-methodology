import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseRouteName, normalizePath, normalizeFile, fileMatches, normalizeSymbol } from '../src/normalize.js';
import { collectRefs } from '../src/collect.js';

describe('normalize', () => {
  it('parseRouteName — verb + path 분리 (codegraph name 에 verb 포함)', () => {
    assert.deepEqual(parseRouteName('GET /articles/{slug}'), { verb: 'GET', path: '/articles/{slug}' });
    assert.deepEqual(parseRouteName('POST /login'), { verb: 'POST', path: '/login' });
    assert.deepEqual(parseRouteName('/no-verb'), { verb: null, path: '/no-verb' });
  });

  it('normalizePath — {slug}·:id → {} / 후행슬래시·중복슬래시 정리', () => {
    assert.equal(normalizePath('/articles/{slug}'), '/articles/{}');
    assert.equal(normalizePath('/category/id/:id'), '/category/id/{}');
    assert.equal(normalizePath('/users/'), '/users');
    assert.equal(normalizePath('/a//b'), '/a/b');
    assert.equal(normalizePath('/users?q=1'), '/users');
  });

  it('fileMatches — suffix 정렬 (src-root prefix 차이 흡수)', () => {
    assert.ok(fileMatches('src/auth/auth.controller.ts', 'auth/auth.controller.ts'));
    assert.ok(fileMatches('auth/auth.controller.ts', 'src/auth/auth.controller.ts'));
    assert.ok(fileMatches('a/b.ts', 'a/b.ts'));
    assert.ok(!fileMatches('src/auth/x.ts', 'src/user/x.ts'));
    assert.ok(!fileMatches('controller.ts', 'auth.controller.ts'), '세그먼트 경계 없는 부분일치는 매칭 ❌');
  });

  it('normalizeSymbol — qualified_name 끝 2 세그먼트 / :: # . 통일', () => {
    assert.equal(normalizeSymbol('io.spring.api::ArticleApi::article'), 'ArticleApi.article');
    assert.equal(normalizeSymbol('AuthController::login'), 'AuthController.login');
    assert.equal(normalizeSymbol('ArticleApi.article'), 'ArticleApi.article');
    assert.equal(normalizeSymbol('Foo#bar'), 'Foo.bar');
  });
});

describe('collectRefs — 산출물 code-ref 수집', () => {
  it('AC openapi_path/operationId + discovery source_grounded_evidence + impl source_files', () => {
    const refs = collectRefs({
      'acceptance-criteria': { criteria: [{ openapi_path: '/users/{id}', operationId: 'getUser' }] },
      'discovery-spec': { use_cases: [{ source_grounded_evidence: ['src/api/UsersApi.java:43', 'openapi.yaml#getUser', 'business-rules.json#BR-1'] }] },
      'impl-spec': { modules: [{ source_files: ['src/svc/UserService.ts'] }, { code_pointers: [{ path: 'src/x.ts', symbol: 'X.run' }] }] },
    });
    assert.ok(refs.paths.has('/users/{}'));
    assert.ok(refs.operationIds.has('getUser'));
    assert.ok(refs.files.includes('src/api/UsersApi.java'), 'file:line 에서 file 추출');
    assert.ok(!refs.files.some((f) => /\.json$/.test(f)), 'business-rules.json 은 file ref 아님');
    assert.ok(refs.files.includes('src/svc/UserService.ts'));
    assert.ok(refs.symbols.has('X.run'));
    assert.deepEqual(refs.sources.sort(), ['acceptance-criteria', 'discovery-spec', 'impl-spec']);
  });

  it('빈 입력 graceful', () => {
    const refs = collectRefs({});
    assert.equal(refs.files.length, 0);
    assert.equal(refs.sources.length, 0);
  });
});
