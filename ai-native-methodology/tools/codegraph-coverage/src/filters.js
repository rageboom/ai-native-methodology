// filters.js — false-positive 회피 필터 (순수 / I/O 없음).
//   ★ Senior 실측 경고: 무필터 set-diff 는 가짜 hole 다발 (route=actuator/error / method=ctor·getter·serialize·main·lifecycle).
//     산업 선례(Specmatic exclusion array / dependency-cruiser DROP / knip framework plugin) = 명시 제외(억제 아님 / 가시 carry).

// framework-internal route (의도적 비-문서 endpoint). 정규화된 path 대상.
export const FRAMEWORK_ROUTE_PATTERNS = [
  /^\/actuator(\/|$)/i,
  /^\/error$/i,
  /^\/swagger-ui(\/|$)/i,
  /^\/v3\/api-docs(\/|$)/i,
  /^\/v2\/api-docs(\/|$)/i,
  /^\/webjars(\/|$)/i,
  /^\/favicon\.ico$/i,
  /^\/health$/i,
];
export function isFrameworkRoute(normalizedPath) {
  return FRAMEWORK_ROUTE_PATTERNS.some((re) => re.test(normalizedPath));
}

// dynamic / 비-literal route — SpEL(#{}) / template(${}) / wildcard(**) / regex. 매칭 불가 → undetectable downgrade.
export function isDynamicRoute(rawPath) {
  return /\$\{|#\{|\*\*|\(\?|\bregex\b/i.test(rawPath || '');
}

// method noise — framework lifecycle / accessor / Object 메서드 / 생성자 / entrypoint / 합성 노드.
const NOISE_METHOD_NAMES = new Set([
  'constructor', '<init>', '<clinit>', 'main',
  'toString', 'hashCode', 'equals', 'clone', 'finalize',
  'serialize', 'deserialize',
  // NestJS/Spring lifecycle·infra
  'canActivate', 'intercept', 'use', 'transform', 'catch',
  'onModuleInit', 'onModuleDestroy', 'onApplicationBootstrap', 'beforeApplicationShutdown',
  'configure', 'forRoot', 'forFeature', 'register', 'validate', 'supports',
]);

export function isNoiseMethod(node) {
  const name = node?.name ?? '';
  if (!name) return true;
  if (NOISE_METHOD_NAMES.has(name)) return true;
  if (/^(get|set|is)[A-Z0-9_]/.test(name)) return true;   // getter/setter/boolean accessor
  if (/[<$]/.test(name)) return true;                      // 합성/익명 (<HashMap$anon@82> 등)
  // 생성자 휴리스틱: qualified_name 끝 2 세그먼트가 동일 (Class::Class) = ctor (codegraph Spring ctor 표기).
  const segs = String(node?.qualified_name || '').replace(/::/g, '.').split('.').filter(Boolean);
  if (segs.length >= 2 && segs[segs.length - 1] === segs[segs.length - 2]) return true;
  return false;
}

// 비-public skip — Java 는 visibility 보유(public 외 skip). TS(NestJS)는 visibility=null → skip 안 함(보존).
export function isNonPublic(node) {
  return node?.visibility != null && node.visibility !== 'public';
}

// data-class 파일 skip (method axis 한정) — DTO/entity/model 의 필드를 codegraph(TS)가 method 로 인덱싱 = 노이즈.
//   impl 메서드가 아니라 data shape → impl-spec coverage 대상 아님. (.dto.ts/.entity.ts = NestJS / Java DTO 필드는 field kind 라 무영향.)
const DATA_CLASS_FILE_RE = /(?:\.(?:dto|entity|entities|model|schema|response|request)\.[jt]s$)|(?:\/(?:dto|dtos|entities|entity)\/)/i;
export function isDataClassFile(filePath) {
  return DATA_CLASS_FILE_RE.test(String(filePath || ''));
}
