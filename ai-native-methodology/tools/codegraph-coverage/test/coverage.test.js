import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCoverage } from '../src/coverage.js';
import { toFindings, SEVERITY_CEILING } from '../src/render.js';
import { classifyStack } from '../src/detect.js';
import { collectRefs } from '../src/collect.js';

const JAVA_INV = { stack: { backend: { language: 'Java', framework: 'Spring Boot', orm: [{ name: 'MyBatis' }] } } };
const TS_INV = { stack: { backend: { language: 'TypeScript', framework: 'NestJS', orm: [{ name: 'Prisma' }] } } };

function routeNode(name, file) { return { name, kind: 'route', qualified_name: `${file}::${name}`, filePath: file, visibility: null }; }
function methodNode(name, cls, file, vis = 'public') { return { name, kind: 'method', qualified_name: `pkg::${cls}::${name}`, filePath: file, visibility: vis }; }

describe('buildCoverage — route axis', () => {
  const detect = classifyStack(JAVA_INV);

  it('★ 음성 대조: 산출물이 참조 안 한 code route 를 hole 로 탐지', () => {
    const routeNodes = [
      routeNode('POST /users', 'src/api/UsersApi.java'),     // covered by AC openapi_path
      routeNode('GET /orphan', 'src/api/OrphanApi.java'),    // NO deliverable ref → hole
    ];
    const refs = collectRefs({ 'acceptance-criteria': { criteria: [{ openapi_path: '/users', operationId: 'createUser' }] } });
    const cov = buildCoverage({ routeNodes, methodNodes: [], refs, detect, axes: ['route'] });
    assert.equal(cov.axes.route.total, 2);
    assert.equal(cov.axes.route.holes.length, 1);
    assert.equal(cov.axes.route.holes[0].normalized_path, '/orphan');
  });

  it('file 매칭(suffix-정렬)으로 route 커버 — AC openapi_path 부재 시 impl source_files 로 커버', () => {
    const routeNodes = [routeNode('POST /login', 'auth/auth.controller.ts')];
    const refs = collectRefs({ 'impl-spec': { modules: [{ id: 'IMPL-AUTH', source_files: ['src/auth/auth.controller.ts'] }] } });
    const cov = buildCoverage({ routeNodes, methodNodes: [], refs, detect, axes: ['route'] });
    assert.equal(cov.axes.route.holes.length, 0, 'controller 파일이 impl-spec 에 있으면 route covered');
  });

  it('framework route(/actuator) 제외 — hole 아님', () => {
    const routeNodes = [routeNode('GET /actuator/health', 'x.java'), routeNode('GET /swagger-ui/index.html', 'y.java')];
    const refs = collectRefs({});
    const cov = buildCoverage({ routeNodes, methodNodes: [], refs, detect, axes: ['route'] });
    assert.equal(cov.axes.route.holes.length, 0);
    assert.equal(cov.axes.route.excluded_count, 2);
  });

  it('path param 정규화 — {slug} 와 :id 가 동일 키', () => {
    const routeNodes = [routeNode('GET /articles/{slug}', 'a.java'), routeNode('GET /articles/:slug', 'b.ts')];
    const refs = collectRefs({ 'acceptance-criteria': { criteria: [{ openapi_path: '/articles/{id}' }] } });
    const cov = buildCoverage({ routeNodes, methodNodes: [], refs, detect, axes: ['route'] });
    assert.equal(cov.axes.route.holes.length, 0, '두 표기 모두 /articles/{} 로 정규화되어 covered');
  });
});

describe('buildCoverage — method axis (impl-spec 게이트)', () => {
  it('impl-spec 부재 = method axis unverified (hole 폭증 회피)', () => {
    const detect = classifyStack(JAVA_INV);
    const methodNodes = [methodNode('doWork', 'SvcA', 'src/svc/SvcA.java')];
    const refs = collectRefs({ 'discovery-spec': { use_cases: [] } });  // no impl-spec
    const cov = buildCoverage({ routeNodes: [], methodNodes, refs, detect, axes: ['method'] });
    assert.equal(cov.axes.method, undefined);
    const u = cov.undetectable.find((x) => x.axis === 'method');
    assert.equal(u.state, 'unverified');
  });

  it('impl-spec 존재 시 미참조 public method 를 hole 로 탐지 + DTO/ctor/getter 필터', () => {
    const detect = classifyStack(TS_INV);
    const methodNodes = [
      methodNode('handle', 'JwtHandler', 'common/jwt.handler.ts', null),         // hole (not in impl-spec)
      methodNode('login', 'AuthController', 'auth/auth.controller.ts', null),    // covered (file in impl-spec)
      methodNode('getName', 'Foo', 'foo.ts', null),                             // filtered (getter)
      methodNode('email', 'LoginDto', 'auth/dto/login.dto.ts', null),           // filtered (data-class file)
      { name: 'constructor', kind: 'method', qualified_name: 'X::constructor', filePath: 'x.ts', visibility: null }, // filtered
    ];
    const refs = collectRefs({ 'impl-spec': { modules: [{ id: 'IMPL-AUTH', source_files: ['src/auth/auth.controller.ts'] }] } });
    const cov = buildCoverage({ routeNodes: [], methodNodes, refs, detect, axes: ['method'] });
    assert.ok(cov.axes.method, 'impl-spec 있으면 method axis 활성');
    assert.equal(cov.axes.method.holes.length, 1);
    assert.equal(cov.axes.method.holes[0].symbol, 'JwtHandler.handle');
    assert.equal(cov.axes.method.filtered, 3, 'getter+dto+ctor = 3 필터');
  });

  it('non-public(Java) skip', () => {
    const detect = classifyStack(JAVA_INV);
    const methodNodes = [methodNode('secret', 'Svc', 'src/Svc.java', 'private')];
    const refs = collectRefs({ 'impl-spec': { modules: [{ source_files: ['other.java'] }] } });
    const cov = buildCoverage({ routeNodes: [], methodNodes, refs, detect, axes: ['method'] });
    assert.equal(cov.axes.method.holes.length, 0);
    assert.equal(cov.axes.method.filtered, 1);
  });
});

describe('detectability — undetectable carry (per-entity hole 절대 없음)', () => {
  it('iBATIS2 = sql axis undetectable / table 보편 undetectable', () => {
    const inv = { stack: { backend: { language: 'Java', framework: 'Spring', orm: [{ name: 'iBATIS 2.3.4' }] } } };
    const detect = classifyStack(inv);
    assert.equal(detect.orm.ibatis2, true);
    assert.equal(detect.axes.sql.state, 'undetectable');
    assert.match(detect.axes.sql.reason, /iBATIS2/);
    // route/method 는 legacy 도 detectable (Senior: route 는 Spring 4.1 도 작동)
    assert.equal(detect.axes.route.state, 'detectable');
  });

  it('FE-only / 미식별 백엔드 = route·method undetectable', () => {
    const detect = classifyStack({ stack: { frontend: { language: 'TypeScript', framework: 'React' } } });
    assert.equal(detect.backend_known, false);
    assert.equal(detect.axes.route.state, 'undetectable');
  });
});

describe('toFindings — severity ceiling (trust 경계 코드 강제)', () => {
  it('route hole=medium / method hole=low / 그 외 severity 절대 없음', () => {
    const detect = classifyStack(TS_INV);
    const routeNodes = [routeNode('GET /orphan', 'o.ts')];
    const methodNodes = [methodNode('handle', 'H', 'common/h.ts', null)];
    const refs = collectRefs({ 'impl-spec': { modules: [{ source_files: ['src/other.ts'] }] } });
    const cov = buildCoverage({ routeNodes, methodNodes, refs, detect, axes: ['route', 'method'] });
    const findings = toFindings(cov);
    const sev = new Set(findings.map((f) => f.severity));
    for (const s of sev) assert.ok(SEVERITY_CEILING.includes(s), `severity ${s} 는 ceiling 위반`);
    assert.equal(findings.find((f) => f.axis === 'route').severity, 'medium');
    assert.equal(findings.find((f) => f.axis === 'method').severity, 'low');
    assert.ok(findings.every((f) => /^F-CGCOV-\d{3}$/.test(f.id)));
  });

  it('SEVERITY_CEILING 은 low|medium 만 (high/critical 부재 — gate leak 차단 불변식)', () => {
    assert.deepEqual([...SEVERITY_CEILING].sort(), ['low', 'medium']);
    assert.ok(!SEVERITY_CEILING.includes('high'));
    assert.ok(!SEVERITY_CEILING.includes('critical'));
  });
});
