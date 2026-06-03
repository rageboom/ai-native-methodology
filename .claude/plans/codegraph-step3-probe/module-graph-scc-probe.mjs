import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const cases = {
  RealWorld: {
    db: 'C:/Users/RAGEBOOM/Documents/Developments/AI/_dogfood-realworld/spring-boot-realworld-example-app/.codegraph/codegraph.db',
    arch: 'C:/Users/RAGEBOOM/Documents/Developments/AI/_dogfood-realworld/spring-boot-realworld-example-app/.aimd/output/architecture.json',
  },
  ecommerce: {
    db: 'C:/Users/RAGEBOOM/Documents/Developments/AI/_dogfood-ecommerce/ecommerce-backend/src/.codegraph/codegraph.db',
    arch: 'C:/Users/RAGEBOOM/Documents/Developments/AI/_dogfood-ecommerce/ecommerce-backend/.aimd/output/architecture.json',
  },
};

const BS = String.fromCharCode(92); // backslash
const slashRe = new RegExp(BS + BS, 'g'); // matches a single backslash globally

function tarjan(nodes, adj) {
  let idx = 0; const stack = []; const onStack = new Set();
  const index = new Map(); const low = new Map(); const sccs = [];
  function strong(v) {
    index.set(v, idx); low.set(v, idx); idx++; stack.push(v); onStack.add(v);
    for (const w of (adj.get(v) || [])) {
      if (!index.has(w)) { strong(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (onStack.has(w)) { low.set(v, Math.min(low.get(v), index.get(w))); }
    }
    if (low.get(v) === index.get(v)) {
      const comp = []; let w;
      do { w = stack.pop(); onStack.delete(w); comp.push(w); } while (w !== v);
      sccs.push(comp);
    }
  }
  for (const v of nodes) if (!index.has(v)) strong(v);
  return sccs;
}

const TEST_RE = /(\/test\/|\.test\.|\.spec\.|Test\.java$|Tests\.java$|\/tests?\/)/i;

function norm(p) { return p.replace(slashRe, '/'); }

for (const [name, cfg] of Object.entries(cases)) {
  console.log('\n================ ' + name + ' ================');
  const db = new DatabaseSync(cfg.db, { readOnly: true });
  const arch = JSON.parse(readFileSync(cfg.arch, 'utf-8'));
  const mods = arch.modules.map(m => ({ id: m.id, path: norm(m.path).replace(/^\.?\/?/, ''), layer: m.layer }));
  mods.sort((a, b) => b.path.length - a.path.length);
  function fileToModule(fp) {
    if (!fp) return null;
    const f = norm(fp);
    for (const m of mods) {
      if (m.path && (f.includes('/' + m.path + '/') || f.includes(m.path + '/') || f.endsWith('/' + m.path) || f.startsWith(m.path))) return m.id;
    }
    return null;
  }
  const EDGE_KINDS = ['calls', 'references', 'instantiates', 'extends', 'implements'];
  const placeholders = EDGE_KINDS.map(() => '?').join(',');
  const rows = db.prepare(
    'SELECT e.kind, sn.file_path sf, tn.file_path tf ' +
    'FROM edges e JOIN nodes sn ON e.source=sn.id JOIN nodes tn ON e.target=tn.id ' +
    'WHERE e.kind IN (' + placeholders + ') AND sn.file_path IS NOT NULL AND tn.file_path IS NOT NULL AND sn.file_path != tn.file_path'
  ).all(...EDGE_KINDS);
  const modEdges = new Map();
  let unmapped = 0, testSkipped = 0;
  for (const r of rows) {
    if (TEST_RE.test(r.sf) || TEST_RE.test(r.tf)) { testSkipped++; continue; }
    const a = fileToModule(r.sf), b = fileToModule(r.tf);
    if (!a || !b) { unmapped++; continue; }
    if (a === b) continue;
    const key = a + '|' + b;
    modEdges.set(key, (modEdges.get(key) || 0) + 1);
  }
  console.log('modules(arch)=' + mods.length + ' crossFileEdges=' + rows.length + ' testSkipped=' + testSkipped + ' unmapped=' + unmapped + ' -> moduleEdges=' + modEdges.size);

  const cgDeps = new Set([...modEdges.keys()]);
  const archDeps = new Set(arch.dependencies.map(d => d.from + '|' + d.to));
  const onlyArch = [...archDeps].filter(d => !cgDeps.has(d));
  const onlyCg = [...cgDeps].filter(d => !archDeps.has(d));
  const both = [...archDeps].filter(d => cgDeps.has(d));
  console.log('\n-- dependency comparison (module->module) --');
  console.log('  arch.json deps=' + archDeps.size + ', codegraph deps=' + cgDeps.size);
  console.log('  BOTH (corroborated)=' + both.length);
  console.log('  ONLY arch.json (codegraph 미검출=runtime/wiring/blind)=' + onlyArch.length + ': ' + onlyArch.join(', '));
  console.log('  ONLY codegraph (arch.json 누락=coverage-hole 후보)=' + onlyCg.length + ': ' + onlyCg.slice(0, 25).map(k => k + '(' + modEdges.get(k) + ')').join(', '));

  const adj = new Map();
  for (const k of cgDeps) { const [a, b] = k.split('|'); if (!adj.has(a)) adj.set(a, []); adj.get(a).push(b); }
  const allNodes = new Set(); for (const k of cgDeps) { const [a, b] = k.split('|'); allNodes.add(a); allNodes.add(b); }
  const sccs = tarjan([...allNodes], adj).filter(c => c.length > 1 || (c.length === 1 && (adj.get(c[0]) || []).includes(c[0])));
  console.log('\n-- module-level SCC (Tarjan on codegraph graph) --');
  console.log('  cycles found=' + sccs.length + ': ' + sccs.map(c => '[' + c.join('<->') + ']').join(' '));
  console.log('  arch.json circular=' + arch.circular_dependencies.length + ': ' + arch.circular_dependencies.map(c => '[' + c.modules.join('<->') + ']').join(' '));
  db.close();
}
