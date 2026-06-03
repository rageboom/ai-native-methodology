// detect.js — stack → per-(axis×stack) detectability matrix (순수 / I/O 없음).
//   ★ Senior: "Modern only" blunt gate 는 틀림 — route/method/interface 는 legacy Spring 4.1 도 ⭐⭐⭐(PoC#15=551 route).
//     sql/mapper axis 만 iBATIS2-blind(=0), table axis 만 보편 blind. → per-(axis×stack) 3-state.
//   3-state: detectable | unverified | undetectable. detectable 만 per-entity hole 보고 / 나머지 = 정직 note (억제 ❌).
//   gate 입력 = inventory.json stack signals (orm/language/framework) — Modern flag 아님.

const AXES = ['route', 'method', 'interface', 'sql', 'table'];

// ★ backend tier 한정 signal 추출 — frontend/infra 누출 차단 (FE-only 프로젝트 = backend_known false).
//   language + framework + orm[].name 만 (ui_library_indicators/db 제외 = 잡음 회피). inventory shape 방어적.
function collectSignals(inventory) {
  const out = [];
  const push = (v) => { if (typeof v === 'string' && v.trim()) out.push(v.toLowerCase()); };
  const eatTier = (t) => {
    if (!t || typeof t !== 'object') return;
    push(t.language);
    const fw = t.framework;
    if (Array.isArray(fw)) fw.forEach((f) => push(typeof f === 'string' ? f : f?.name));
    else push(typeof fw === 'string' ? fw : fw?.name);
    const orm = t.orm;
    if (Array.isArray(orm)) orm.forEach((o) => push(typeof o === 'string' ? o : o?.name));
    else push(typeof orm === 'string' ? orm : orm?.name);
  };
  const stack = inventory?.stack ?? inventory?.stack_signals ?? {};
  if (Array.isArray(stack)) stack.forEach(eatTier);   // array 형 = 전 tier (backend 라벨 부재 시 보수적 fallback)
  else eatTier(stack.backend);                         // object 형 = backend tier 한정 (frontend 누출 차단)
  return out;
}

export function classifyStack(inventory) {
  const signals = collectSignals(inventory);
  const sig = signals.join(' | ');
  const has = (kw) => sig.includes(kw);

  const isJava = has('java') || has('spring') || has('kotlin');
  const isTs = has('typescript') || has('nestjs') || has('nest') || has('express') || has('fastify') || has('node');
  const mybatis = has('mybatis');
  const ibatis2 = /ibatis\s*2|ibatis 2\b/.test(sig) || (has('ibatis') && !mybatis);
  const jpa = has('jpa') || has('hibernate');
  const prisma = has('prisma') || has('typeorm') || has('sequelize');
  const backendKnown = isJava || isTs;

  const axes = {};
  // route — code route 노드. Java/Spring(legacy 포함) ⭐⭐⭐ / TS/NestJS live-verified.
  axes.route = backendKnown
    ? { state: 'detectable', reason: isJava ? 'Java/Spring route 노드 ⭐⭐⭐ (legacy 4.1 포함)' : 'TS/NestJS route 노드 (live DB 확인)' }
    : { state: 'undetectable', reason: '알 수 없는/FE-only 백엔드 — codegraph route 미검증' };
  // method/symbol — public 메서드 노드. noise 필터 후 reference-lens (low confidence).
  axes.method = backendKnown
    ? { state: 'detectable', reason: isJava ? 'Java 메서드 노드 (visibility 필터)' : 'TS 메서드 노드 (visibility 부재 → name 필터)' }
    : { state: 'undetectable', reason: '백엔드 미식별 — 메서드 노드 미검증' };
  // interface — Java ⭐⭐⭐ / TS 빈약(live=1) → unverified.
  axes.interface = isJava
    ? { state: 'detectable', reason: 'Java interface 노드 ⭐⭐⭐' }
    : isTs
      ? { state: 'unverified', reason: 'TS interface 열거 빈약 (live=1) — unverified carry' }
      : { state: 'undetectable', reason: '백엔드 미식별' };
  // sql/mapper — STEP 1 범위 밖 + iBATIS2 blind. carry(STEP 2~6).
  axes.sql = ibatis2
    ? { state: 'undetectable', reason: 'iBATIS2 sqlMap = string-literal blind (=0 / 주 타깃 S2)' }
    : mybatis
      ? { state: 'unverified', reason: 'MyBatis3 statement 노드 — STEP 1 범위 밖 (STEP 2+ carry)' }
      : { state: 'undetectable', reason: 'SQL/mapper axis STEP 1 범위 밖' };
  // table — codegraph DB table 경계 보편 blind.
  axes.table = { state: 'undetectable', reason: 'codegraph 는 DB table 노드 미생성 (정중앙 사각 / schema.json+sql-inventory 보완)' };

  return {
    language: isJava ? 'java' : isTs ? 'typescript' : 'unknown',
    backend_known: backendKnown,
    orm: { ibatis2, mybatis3: mybatis && !ibatis2, jpa, prisma },
    signals: sig || '(stack signal 부재)',
    axes,
  };
}

export { AXES };
