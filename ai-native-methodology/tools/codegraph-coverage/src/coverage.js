// coverage.js — code→artifact coverage-hole 엔진 (순수 / I/O 없음).
//   ★ "공통 메커니즘" (DEC §5 STEP 1): 코드 엔티티 전수 → 식별 키(path/file/symbol) 중 하나라도 산출물 ref 매칭 = covered.
//     어느 키도 안 맞으면 = hole ("코드有 산출물無"). diffGraphs(artifact-graph 전용 형태) 대신 Map/Set O(1) 멤버십 패턴 차용.
//   ★ detectable axis 만 per-entity hole. unverified/undetectable = 정직 note (per-entity hole ❌ / false-positive 회피).

import { parseRouteName, normalizePath, normalizeFile, normalizeSymbol, fileMatches } from './normalize.js';
import { isFrameworkRoute, isDynamicRoute, isNoiseMethod, isNonPublic, isDataClassFile } from './filters.js';

// file 커버 판정 — 산출물 file ref(suffix-정렬) 매칭.
function makeFileCovered(refFiles) {
  return (filePath) => {
    const cf = normalizeFile(filePath);
    if (!cf) return false;
    return refFiles.some((rf) => fileMatches(rf, cf));
  };
}

function buildRouteAxis(routeNodes, refs, fileCovered) {
  const holes = [];
  const dynamic = [];
  const excluded = [];
  let covered = 0;
  const seen = new Set();
  for (const n of routeNodes) {
    const { verb, path } = parseRouteName(n.name);
    const rawPath = path || n.name || '';
    if (isDynamicRoute(rawPath)) { dynamic.push({ route: n.name, file: n.filePath }); continue; }
    const np = normalizePath(rawPath);
    if (isFrameworkRoute(np)) { excluded.push({ route: n.name, file: n.filePath }); continue; }
    const key = `${verb || '?'} ${np}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pathHit = refs.paths.has(np);
    const fileHit = fileCovered(n.filePath);
    if (pathHit || fileHit) { covered++; continue; }
    holes.push({ verb: verb || null, path: rawPath, normalized_path: np, file: normalizeFile(n.filePath) });
  }
  holes.sort((a, b) => (a.normalized_path + (a.verb || '')).localeCompare(b.normalized_path + (b.verb || '')));
  return {
    detectable: true,
    total: seen.size,
    covered,
    holes,
    excluded_count: excluded.length,
    dynamic_count: dynamic.length,
    excluded_routes: excluded,
    dynamic_routes: dynamic,
  };
}

function buildMethodAxis(methodNodes, refs, fileCovered) {
  const holes = [];
  let covered = 0;
  let filtered = 0;
  const seen = new Set();
  for (const n of methodNodes) {
    if (isNoiseMethod(n) || isNonPublic(n) || isDataClassFile(n.filePath)) { filtered++; continue; }
    const sym = normalizeSymbol(n.qualified_name || n.name);
    if (!sym) { filtered++; continue; }
    const key = `${sym}@${normalizeFile(n.filePath)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const symHit = refs.symbols.has(sym);
    const fileHit = fileCovered(n.filePath);
    if (symHit || fileHit) { covered++; continue; }
    holes.push({ symbol: sym, name: n.name, file: normalizeFile(n.filePath) });
  }
  holes.sort((a, b) => a.symbol.localeCompare(b.symbol) || a.file.localeCompare(b.file));
  return { detectable: true, total: seen.size, covered, filtered, holes };
}

/**
 * @param {Object} args
 * @param {Array}  args.routeNodes
 * @param {Array}  args.methodNodes
 * @param {Object} args.refs        collectRefs 결과
 * @param {Object} args.detect      classifyStack 결과
 * @param {string[]} [args.axes]    활성 axis (STEP 1 = ['route','method'])
 * @returns {Object} { axes:{route?,method?}, undetectable:[], stats:{} }
 */
export function buildCoverage({ routeNodes = [], methodNodes = [], refs, detect, axes = ['route', 'method'] }) {
  const fileCovered = makeFileCovered(refs.files);
  const out = { axes: {}, undetectable: [], stats: {} };

  if (axes.includes('route')) {
    if (detect.axes.route?.state === 'detectable') out.axes.route = buildRouteAxis(routeNodes, refs, fileCovered);
    else out.undetectable.push({ axis: 'route', ...detect.axes.route });
  }
  if (axes.includes('method')) {
    // ★ method 의미성 게이트 (실측 교훈): method hole 은 production-impl 을 전수하는 impl-spec(source_files)이 있어야 의미.
    //   test-spec.source_file = 테스트 파일(production 아님) / discovery·AC = 요구사항(메서드 전수 anchor 아님) → impl-spec 부재 시 hole 폭증=무의미.
    //   → impl-spec 부재 = unverified note (false-health 회피 / §8.1 method axis = impl-spec 보유 도메인만 corroboration).
    const implAnchor = Array.isArray(refs.sources) && refs.sources.includes('impl-spec');
    if (detect.axes.method?.state !== 'detectable') {
      out.undetectable.push({ axis: 'method', ...detect.axes.method });
    } else if (!implAnchor) {
      out.undetectable.push({ axis: 'method', state: 'unverified', reason: 'impl-spec 부재 — 메서드 coverage 무의미 (test-spec=테스트파일 / discovery·AC=요구사항 / production-impl 전수 anchor 부재 / hole 폭증 회피)' });
    } else {
      out.axes.method = buildMethodAxis(methodNodes, refs, fileCovered);
    }
  }

  // carry axes (STEP 2~6) — detectable 아니면 정직 note (per-entity hole 절대 ❌).
  for (const ax of ['interface', 'sql', 'table']) {
    if (detect.axes[ax] && detect.axes[ax].state !== 'detectable') {
      out.undetectable.push({ axis: ax, ...detect.axes[ax] });
    }
  }

  out.stats = {
    route_total: out.axes.route?.total ?? 0,
    route_holes: out.axes.route?.holes.length ?? 0,
    method_total: out.axes.method?.total ?? 0,
    method_holes: out.axes.method?.holes.length ?? 0,
    undetectable_axes: out.undetectable.length,
  };
  return out;
}
