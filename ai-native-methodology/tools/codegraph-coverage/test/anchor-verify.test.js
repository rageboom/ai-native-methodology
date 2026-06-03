import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSymbolIndex, buildAnchorVerify, toAnchorFindings, SYMBOL_KINDS } from '../src/anchor-verify.js';
import { collectSymbolAnchors } from '../src/collect.js';

// codegraph 심볼 노드 (enumerateNodes byKind 형태 부분집합).
const SYMBOL_NODES = {
  class: [
    { name: 'ArticleRepository', kind: 'class', qualified_name: 'io.spring.core.article::ArticleRepository', filePath: 'src/main/java/io/spring/core/article/ArticleRepository.java' },
    { name: 'AppModule', kind: 'class', qualified_name: 'AppModule', filePath: 'app.module.ts' },
  ],
  interface: [
    { name: 'Node', kind: 'interface', qualified_name: 'io.spring.application::Node', filePath: 'src/main/java/io/spring/application/Node.java' },
  ],
  method: [
    { name: 'findById', kind: 'method', qualified_name: 'io.spring.core.article::ArticleRepository::findById', filePath: 'src/main/java/io/spring/core/article/ArticleRepository.java' },
    { name: 'canActivate', kind: 'method', qualified_name: 'AccessJwtAuthGuard::canActivate', filePath: 'auth/access-jwt-auth.guard.ts' },
  ],
};
const INDEXED_FILES = [
  'src/main/java/io/spring/core/article/ArticleRepository.java',
  'src/main/java/io/spring/application/Node.java',
  'app.module.ts',
  'auth/access-jwt-auth.guard.ts',
];

describe('SYMBOL_KINDS — ast_symbol 타깃 kind (공식 NODE_KINDS 부분집합)', () => {
  it('class/interface/function/method/enum/type_alias 포함', () => {
    for (const k of ['class', 'interface', 'function', 'method', 'enum', 'type_alias']) assert.ok(SYMBOL_KINDS.includes(k));
  });
});

describe('buildSymbolIndex — byQn2(끝2세그) + byName(bare)', () => {
  const idx = buildSymbolIndex(SYMBOL_NODES);
  it('method qn → byQn2 "Class.method"', () => {
    assert.ok(idx.byQn2.has('ArticleRepository.findById'));
    assert.ok(idx.byQn2.has('AccessJwtAuthGuard.canActivate'));
  });
  it('class/interface name → byName(bare)', () => {
    assert.ok(idx.byName.has('ArticleRepository'));
    assert.ok(idx.byName.has('Node'));
    assert.ok(idx.byName.has('AppModule'));
  });
  it('kinds 집계 + node_count', () => {
    assert.deepEqual(idx.kinds, ['class', 'interface', 'method']);
    assert.equal(idx.node_count, 5);
  });
});

describe('buildAnchorVerify — live / stale / informational 분류', () => {
  const anchors = [
    { symbol: 'ArticleRepository.findById', normalized: 'ArticleRepository.findById', artifact: 'impl-spec', anchor_path: 'src/main/java/io/spring/core/article/ArticleRepository.java' }, // live (method 실재)
    { symbol: 'ArticleRepository', normalized: 'ArticleRepository', artifact: 'acceptance-criteria', anchor_path: 'src/main/java/io/spring/core/article/ArticleRepository.java' }, // live (class 실재 / 1-seg)
    { symbol: 'ArticleRepository.ghostMethod', normalized: 'ArticleRepository.ghostMethod', artifact: 'impl-spec', anchor_path: 'src/main/java/io/spring/core/article/ArticleRepository.java' }, // stale (file 인덱싱됨 + symbol 부재)
    { symbol: 'UserMapper.selectById', normalized: 'UserMapper.selectById', artifact: 'impl-spec', anchor_path: 'src/main/resources/mapper/UserMapper.xml' }, // informational (file 미인덱스 = iBATIS2 사각)
    { symbol: 'NoPath.method', normalized: 'NoPath.method', artifact: 'test-spec', anchor_path: null }, // informational (path 부재)
  ];
  const v = buildAnchorVerify({ anchors, symbolNodesByKind: SYMBOL_NODES, indexedFiles: INDEXED_FILES, freshness: { available: true, stale: false } });

  it('state=verified + 카운트 정확 (live=2 stale=1 informational=2)', () => {
    assert.equal(v.state, 'verified');
    assert.equal(v.total, 5);
    assert.equal(v.live, 2);
    assert.equal(v.stale, 1);
    assert.equal(v.informational, 2);
  });
  it('stale = file 인덱싱됨 + symbol 부재 (ghostMethod)', () => {
    assert.equal(v.stale_anchors.length, 1);
    assert.equal(v.stale_anchors[0].symbol, 'ArticleRepository.ghostMethod');
  });
  it('informational = codegraph 사각 (iBATIS2 xml 미인덱스 + path 부재)', () => {
    const syms = v.informational_notes.map((n) => n.symbol).sort();
    assert.deepEqual(syms, ['NoPath.method', 'UserMapper.selectById']);
  });
  it('★ ★ informational_notes 레코드에 severity 필드 부재 (구조적 절단 / finding 채널 진입 차단)', () => {
    for (const n of v.informational_notes) assert.equal('severity' in n, false, 'codegraph 사각은 severity 를 절대 갖지 않음');
  });
});

describe('buildAnchorVerify — unverified (앵커 0 / false-health 회피)', () => {
  it('앵커 0 = state:unverified + reason + findings 0', () => {
    const v = buildAnchorVerify({ anchors: [], symbolNodesByKind: SYMBOL_NODES, indexedFiles: INDEXED_FILES });
    assert.equal(v.state, 'unverified');
    assert.match(v.reason, /ast_symbol 앵커 부재/);
    assert.equal(v.total, 0);
    assert.ok(v.symbol_index_size > 0); // 인덱스는 존재 (앵커가 생기면 즉시 검증 가능)
    assert.equal(toAnchorFindings(v).length, 0);
  });
});

describe('buildAnchorVerify — freshness stale caveat', () => {
  it('codegraph 인덱스 stale 이면 caveat 부착', () => {
    const v = buildAnchorVerify({ anchors: [{ symbol: 'X.y', normalized: 'X.y', artifact: 'impl-spec', anchor_path: 'a.ts' }], symbolNodesByKind: SYMBOL_NODES, indexedFiles: INDEXED_FILES, freshness: { available: true, stale: true, stale_count: 3 } });
    assert.ok(v.freshness_caveat);
  });
});

describe('toAnchorFindings — stale → finding (informational 절대 변환 ❌)', () => {
  const anchors = [
    { symbol: 'ArticleRepository.ghostMethod', normalized: 'ArticleRepository.ghostMethod', artifact: 'impl-spec', anchor_path: 'src/main/java/io/spring/core/article/ArticleRepository.java' }, // stale
    { symbol: 'UserMapper.selectById', normalized: 'UserMapper.selectById', artifact: 'impl-spec', anchor_path: 'src/main/resources/mapper/UserMapper.xml' }, // informational
  ];
  const v = buildAnchorVerify({ anchors, symbolNodesByKind: SYMBOL_NODES, indexedFiles: INDEXED_FILES });
  const findings = toAnchorFindings(v, '/x/.codegraph/codegraph.db');

  it('stale anchor → finding (axis=anchor / severity=medium / ceiling 준수 / code_graph_ref)', () => {
    assert.equal(findings.length, 1);
    assert.equal(findings[0].axis, 'anchor');
    assert.equal(findings[0].severity, 'medium');
    assert.ok(['low', 'medium'].includes(findings[0].severity), 'ceiling 준수');
    assert.match(findings[0].id, /^F-CGANCH-\d{3}$/);
    assert.equal(findings[0].code_graph_ref.kind, 'ast_symbol');
    assert.equal(findings[0].code_graph_ref.symbol, 'ArticleRepository.ghostMethod');
    assert.equal(findings[0].code_graph_ref.db_path, '/x/.codegraph/codegraph.db');
  });
  it('★ ★ informational(UserMapper.selectById)은 finding 으로 절대 변환 안 됨', () => {
    const leaked = findings.filter((f) => (f.message && f.message.includes('UserMapper')) || (f.code_graph_ref && f.code_graph_ref.symbol === 'UserMapper.selectById'));
    assert.equal(leaked.length, 0, 'codegraph 사각(informational)은 finding 채널 진입 절대 ❌');
  });
});

describe('collectSymbolAnchors — provenance 보존 + ast_symbol 한정', () => {
  const deliverables = {
    'impl-spec': {
      modules: [{
        code_pointers: [
          { anchor_type: 'ast_symbol', symbol: 'ArticleService.create', path: 'src/Article.java' },
          { anchor_type: 'strict_path', path: 'src/Other.java' }, // symbol 없음 → 제외
        ],
      }],
    },
    'acceptance-criteria': {
      criteria: [{ code_pointers: [{ anchor_type: 'ast_symbol', symbol: 'X.y', path: 'a.ts' }] }],
    },
    'test-spec': {
      test_cases: [{ code_pointers: [{ symbol: 'NoType.m', path: 'b.ts' }] }], // anchor_type 미명시 + symbol → 수용
    },
  };
  const { anchors, sources } = collectSymbolAnchors(deliverables);
  it('ast_symbol(또는 anchor_type 미명시 + symbol) code_pointer 만 수집 / strict_path 제외', () => {
    const syms = anchors.map((a) => a.symbol).sort();
    assert.deepEqual(syms, ['ArticleService.create', 'NoType.m', 'X.y']);
  });
  it('provenance(artifact) 보존', () => {
    const impl = anchors.find((a) => a.symbol === 'ArticleService.create');
    assert.equal(impl.artifact, 'impl-spec');
    assert.equal(impl.anchor_path, 'src/Article.java');
  });
  it('sources 에 산출물 키 기록', () => {
    assert.ok(sources.includes('impl-spec'));
    assert.ok(sources.includes('acceptance-criteria'));
    assert.ok(sources.includes('test-spec'));
  });
});
