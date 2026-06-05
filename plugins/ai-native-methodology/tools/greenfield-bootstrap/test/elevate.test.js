import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { elevateToOpenApi } from '../src/elevate.js';
import { emitYaml } from '../src/yaml-emit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fx = (name) => JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));

// ── §8.1 ≥2 채널 corroboration: fixture 1 (minimal) ──
test('minimal: elevates to OpenAPI 3.0.3 with paths + components', () => {
  const doc = elevateToOpenApi(fx('minimal.swagger-extract.json'));
  assert.equal(doc.openapi, '3.0.3');
  assert.equal(doc.info.title, 'Minimal API');
  assert.equal(doc.info.version, '1.0.0');
  assert.ok(doc.paths['/ping'].get);
  assert.equal(doc.paths['/ping'].get.operationId, 'ping');
  assert.equal(doc.paths['/ping'].get.responses['200'].description, 'pong');
  assert.ok(doc.components.schemas.Pong);
});

test('minimal: emits valid-shaped YAML (deterministic)', () => {
  const doc = elevateToOpenApi(fx('minimal.swagger-extract.json'));
  const yaml = emitYaml(doc);
  assert.match(yaml, /^openapi: 3\.0\.3\n/);
  assert.match(yaml, /paths:\n {2}\/ping:\n {4}get:/);
  assert.match(yaml, /"200":/); // numeric-looking key quoted
});

// ── §8.1 ≥2 채널 corroboration: fixture 2 (realworld) ──
test('realworld: all endpoints grouped by path/method', () => {
  const doc = elevateToOpenApi(fx('realworld.swagger-extract.json'));
  assert.equal(doc.openapi, '3.0.3');
  assert.ok(doc.paths['/users/login'].post);
  assert.ok(doc.paths['/users'].post);
  assert.ok(doc.paths['/articles/{slug}'].get);
  assert.equal(doc.servers[0].url, 'https://api.realworld.io/api');
});

test('realworld: request body schema_ref → $ref to components', () => {
  const doc = elevateToOpenApi(fx('realworld.swagger-extract.json'));
  const login = doc.paths['/users/login'].post;
  assert.deepEqual(login.requestBody.content['application/json'].schema, {
    $ref: '#/components/schemas/LoginUserRequest',
  });
});

test('realworld: response schema_ref + description preserved', () => {
  const doc = elevateToOpenApi(fx('realworld.swagger-extract.json'));
  const login = doc.paths['/users/login'].post;
  assert.equal(login.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/UserResponse');
  assert.equal(login.responses['401'].description, 'Unauthorized');
  assert.ok(!login.responses['401'].content); // no schema_ref → no content
});

test('realworld: path parameters passthrough + tags preserved', () => {
  const doc = elevateToOpenApi(fx('realworld.swagger-extract.json'));
  const getArticle = doc.paths['/articles/{slug}'].get;
  assert.equal(getArticle.parameters[0].name, 'slug');
  assert.equal(getArticle.parameters[0].in, 'path');
  assert.deepEqual(getArticle.tags, ['Articles']);
});

test('realworld: all 5 component schemas passthrough', () => {
  const doc = elevateToOpenApi(fx('realworld.swagger-extract.json'));
  assert.deepEqual(
    Object.keys(doc.components.schemas).sort(),
    ['GenericErrorModel', 'LoginUserRequest', 'NewUserRequest', 'SingleArticleResponse', 'UserResponse'],
  );
});

test('realworld: full YAML emit does not throw and round-trips key markers', () => {
  const doc = elevateToOpenApi(fx('realworld.swagger-extract.json'));
  const yaml = emitYaml(doc);
  assert.match(yaml, /openapi: 3\.0\.3/);
  assert.match(yaml, /\/articles\/\{slug\}:/);
  assert.match(yaml, /\$ref: "#\/components\/schemas\/LoginUserRequest"/);
});

// ── 결함/방어 ──
test('missing endpoints throws', () => {
  assert.throws(() => elevateToOpenApi({ spec_version: 'openapi-3.0', schemas: {} }), /endpoints must be an array/);
});

test('unknown spec_version throws', () => {
  assert.throws(
    () => elevateToOpenApi({ spec_version: 'wat', endpoints: [], schemas: {} }),
    /unknown spec_version/,
  );
});

test('swagger-2.0 normalizes up to 3.0.3', () => {
  const doc = elevateToOpenApi({ spec_version: 'swagger-2.0', scope: 's', endpoints: [], schemas: {} });
  assert.equal(doc.openapi, '3.0.3');
});

test('missing info synthesizes required title/version', () => {
  const doc = elevateToOpenApi({ spec_version: 'openapi-3.1', scope: 'myapp', endpoints: [], schemas: {} });
  assert.equal(doc.openapi, '3.1.0');
  assert.equal(doc.info.title, 'myapp API (greenfield)');
  assert.equal(doc.info.version, '0.1.0');
});

test('endpoint without responses gets default 200', () => {
  const doc = elevateToOpenApi({
    spec_version: 'openapi-3.0',
    scope: 's',
    endpoints: [{ path: '/x', method: 'get' }],
    schemas: {},
  });
  assert.equal(doc.paths['/x'].get.responses['200'].description, 'OK');
});
