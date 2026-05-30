// elevate.js — swagger-extract.json → canonical OpenAPI 3.x 문서 (결정적 / pure).
//
// greenfield 옵션 A (DEC-2026-05-30-use-scenario-taxonomy §2.4): swagger-extract 는
// 이미 파싱·정규화된 OpenAPI → openapi.yaml(deliverable 5-a) 로 결정적 승격.
// AI 추론 0 — endpoints × schemas 를 표준 OpenAPI paths/components 로 재조립만.

const SPEC_VERSION_MAP = Object.freeze({
  'openapi-3.1': '3.1.0',
  'openapi-3.0': '3.0.3',
  'swagger-2.0': '3.0.3', // 정규화 상향 — extract 가 이미 공통 shape 로 흡수.
});

// schema_ref → OpenAPI $ref 표현. bare name 이면 components/schemas 로, 이미 pointer 면 그대로.
function refToSchema(ref) {
  if (typeof ref !== 'string' || ref.length === 0) return null;
  if (ref.startsWith('#/')) return { $ref: ref };
  return { $ref: `#/components/schemas/${ref}` };
}

export function elevateToOpenApi(extract, opts = {}) {
  if (!extract || typeof extract !== 'object') {
    throw new Error('elevate: extract must be an object');
  }
  if (!Array.isArray(extract.endpoints)) {
    throw new Error('elevate: extract.endpoints must be an array (swagger-extract.schema.json required field)');
  }
  if (!extract.schemas || typeof extract.schemas !== 'object') {
    throw new Error('elevate: extract.schemas must be an object');
  }

  const openapiVersion = SPEC_VERSION_MAP[extract.spec_version];
  if (!openapiVersion) {
    throw new Error(`elevate: unknown spec_version "${extract.spec_version}" (expected one of ${Object.keys(SPEC_VERSION_MAP).join('/')})`);
  }

  const scope = extract.scope || opts.scope || 'greenfield';
  // info — extract.info passthrough + OpenAPI 필수(title/version) 보강.
  const info = { ...(extract.info && typeof extract.info === 'object' ? extract.info : {}) };
  if (!info.title) info.title = `${scope} API (greenfield)`;
  if (!info.version) info.version = '0.1.0';

  const doc = {
    openapi: openapiVersion,
    info,
  };

  if (Array.isArray(extract.servers) && extract.servers.length > 0) {
    doc.servers = extract.servers.map((s) => {
      const out = { url: s.url };
      if (s.description != null) out.description = s.description;
      return out;
    });
  }

  // paths — endpoints 를 path → method 로 그룹.
  const paths = {};
  const schemaKeys = new Set(Object.keys(extract.schemas));

  for (const ep of extract.endpoints) {
    if (!ep || !ep.path || !ep.method) {
      throw new Error(`elevate: endpoint missing path/method: ${JSON.stringify(ep)}`);
    }
    const method = String(ep.method).toLowerCase();
    if (!paths[ep.path]) paths[ep.path] = {};
    const op = {};
    if (ep.operation_id != null) op.operationId = ep.operation_id;
    if (ep.summary != null) op.summary = ep.summary;
    if (Array.isArray(ep.tags) && ep.tags.length > 0) op.tags = [...ep.tags];
    if (Array.isArray(ep.parameters) && ep.parameters.length > 0) {
      op.parameters = ep.parameters.map((p) => ({ ...p }));
    }
    if (ep.request_body_schema_ref) {
      const schemaObj = refToSchema(ep.request_body_schema_ref);
      if (schemaObj) {
        op.requestBody = {
          content: { 'application/json': { schema: schemaObj } },
        };
      }
    }
    // responses — OpenAPI 필수. 없으면 default 200.
    const responses = {};
    const respSrc = ep.responses && typeof ep.responses === 'object' ? ep.responses : {};
    const codes = Object.keys(respSrc);
    if (codes.length === 0) {
      responses['200'] = { description: 'OK' };
    } else {
      for (const code of codes) {
        const r = respSrc[code] || {};
        const respObj = { description: r.description != null ? r.description : '' };
        if (r.schema_ref) {
          const schemaObj = refToSchema(r.schema_ref);
          if (schemaObj) {
            respObj.content = { 'application/json': { schema: schemaObj } };
          }
        }
        responses[code] = respObj;
      }
    }
    op.responses = responses;
    paths[ep.path][method] = op;
  }
  doc.paths = paths;

  // components.schemas — extract.schemas passthrough (이미 JSON Schema fragment).
  if (schemaKeys.size > 0) {
    doc.components = { schemas: {} };
    for (const name of schemaKeys) {
      doc.components.schemas[name] = extract.schemas[name];
    }
  }

  return doc;
}
