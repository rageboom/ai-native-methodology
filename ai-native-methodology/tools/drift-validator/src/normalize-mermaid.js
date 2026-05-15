// Mermaid normalizer (regex-based) — Sprint 4 spike 결과 @mermaid-js/parser 미지원 → fallback.
// 의미 동일성 비교를 위한 정규형 추출. 우리 컨벤션 (stateDiagram-v2 / sequenceDiagram) 만 지원.

const stripComment = (line) => line.replace(/%%.*$/, '');
const isBlank = (line) => !line.trim();
const stripBr = (s) => s.replace(/<br\s*\/?>(\s*)/gi, ' ').replace(/\s+/g, ' ').trim();
const stripDecor = (s) => s.replace(/[★⚠️✅❌⏳]/g, '').replace(/\s+/g, ' ').trim();
const normalizeId = (s) => stripDecor(s).toLowerCase().replace(/[\s_\-]+/g, '');
const normalizeLabel = (s) => stripDecor(stripBr(s)).toLowerCase();

export function detectDiagramType(text) {
  const lines = text.split('\n').map(stripComment);
  let hasFlowchart = false;
  let phaseSubgraphCount = 0;     // analysis pattern — P_* subgraph
  let phasePlainNodeCount = 0;    // chain v2 pattern — P_* plain node (chain stage subgraph 안 또는 외부)
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('stateDiagram')) return 'state-machine';
    if (t.startsWith('sequenceDiagram')) return 'sequence';
    // ★ Sprint 5+ Phase B — phase-flow 검출 (flowchart + subgraph P{X} ≥ 2)
    if (/^flowchart\b/i.test(t)) hasFlowchart = true;
    if (/^subgraph\s+P[\w_]*(\s|\[|$)/.test(t)) phaseSubgraphCount++;
    // ★ D11 fix — chain v2 패턴 인식 (P_*[label] plain node / subgraph 키워드 아닌 + edge 아닌)
    if (!t.startsWith('subgraph') && !/-->|-\.->|==>|~~>/.test(t) && /^P[\w_]+\s*\[/.test(t)) phasePlainNodeCount++;
  }
  if (hasFlowchart && (phaseSubgraphCount >= 2 || phasePlainNodeCount >= 2)) return 'phase-flow';
  return 'unknown';
}

// ── state-machine ────────────────────────────────────────────────────────
export function normalizeStateMachine(text) {
  const lines = text.split('\n').map(stripComment);
  const states = new Set();
  const transitions = []; // { from, to, event, parent }
  const compoundStates = new Set();
  const stateAncestors = new Map(); // sub-state id → [ancestor ids] (가장 가까운 → root 순)
  const notes = []; // { target, text }
  let initial = null;

  let depth = 0;
  let currentParent = null;
  const parentStack = [];
  let inNote = false;
  let noteTarget = null;
  let noteBuf = [];

  const recordAncestry = (childId) => {
    if (currentParent === null) return; // root 직속 — ancestry 없음
    if (!stateAncestors.has(childId)) stateAncestors.set(childId, []);
    const list = stateAncestors.get(childId);
    // 가까운 → root 순. parentStack 의 reverse + currentParent.
    const chain = [currentParent, ...parentStack.slice().reverse().filter((p) => p !== null)];
    for (const a of chain) {
      if (!list.includes(a)) list.push(a);
    }
  };

  for (let raw of lines) {
    if (isBlank(raw)) continue;
    const line = raw.trim();

    if (line.startsWith('stateDiagram')) continue;

    // multi-line note
    if (inNote) {
      if (/^end\s*note$/i.test(line)) {
        notes.push({ target: noteTarget, text: stripDecor(noteBuf.join(' ')) });
        inNote = false; noteTarget = null; noteBuf = [];
      } else {
        noteBuf.push(line);
      }
      continue;
    }
    const noteStart = line.match(/^note\s+(left|right|over)\s+of\s+(\S+)/i);
    if (noteStart) {
      inNote = true; noteTarget = normalizeId(noteStart[2]); noteBuf = [];
      continue;
    }
    const inlineNote = line.match(/^note\s+(left|right|over)\s+of\s+(\S+):\s*(.*)$/i);
    if (inlineNote) {
      notes.push({ target: normalizeId(inlineNote[2]), text: stripDecor(inlineNote[3]) });
      continue;
    }

    // composite state open
    const stateOpen = line.match(/^state\s+(\w+)\s*\{/);
    if (stateOpen) {
      const id = normalizeId(stateOpen[1]);
      compoundStates.add(id);
      states.add(id);
      // 자기 자신의 ancestry 도 등록 (current depth)
      recordAncestry(id);
      parentStack.push(currentParent);
      currentParent = id;
      depth++;
      continue;
    }
    if (line === '}' || line.endsWith('}')) {
      currentParent = parentStack.pop() ?? null;
      if (depth > 0) depth--;
      continue;
    }

    // transition: A --> B[: event]
    const trans = line.match(/^([\w\[\]\*]+)\s*-->\s*([\w\[\]\*]+)(?:\s*:\s*(.+))?$/);
    if (trans) {
      const fromRaw = trans[1];
      const toRaw = trans[2];
      const eventRaw = trans[3] ?? '';
      // [*] handling
      if (fromRaw === '[*]' && currentParent === null) {
        initial = normalizeId(toRaw);
      }
      const from = fromRaw === '[*]' ? `__entry__${currentParent ?? 'root'}` : normalizeId(fromRaw);
      const to = toRaw === '[*]' ? `__exit__${currentParent ?? 'root'}` : normalizeId(toRaw);
      if (fromRaw !== '[*]') {
        states.add(from);
        recordAncestry(from);
      }
      if (toRaw !== '[*]') {
        states.add(to);
        recordAncestry(to);
      }
      transitions.push({ from, to, event: normalizeLabel(eventRaw), parent: currentParent });
      continue;
    }
  }

  return {
    type: 'state-machine',
    initial,
    states: Array.from(states).sort(),
    compound_states: Array.from(compoundStates).sort(),
    state_ancestors: stateAncestors,  // ★ NEW — sub-state id → [ancestor ids]
    transitions: transitions.map((t) => ({ ...t })).sort(byTransition),
    notes,
  };
}

function byTransition(a, b) {
  return (a.from + '|' + a.to + '|' + a.event).localeCompare(b.from + '|' + b.to + '|' + b.event);
}

// ── sequence ────────────────────────────────────────────────────────────
export function normalizeSequence(text) {
  const lines = text.split('\n').map(stripComment);
  const actors = []; // { id, name, type }
  const messages = []; // { from, to, sync, label }
  const notes = [];

  for (let raw of lines) {
    if (isBlank(raw)) continue;
    const line = raw.trim();

    if (line.startsWith('sequenceDiagram')) continue;
    if (line === 'autonumber') continue;
    if (/^(rect|end|alt|else|opt|par|loop|critical|break|and|activate|deactivate|autonumber)\b/i.test(line)) continue;

    const actor = line.match(/^actor\s+(\w+)(?:\s+as\s+(.+))?$/);
    if (actor) {
      actors.push({ id: normalizeId(actor[1]), name: stripBr(actor[2] ?? actor[1]), kind: 'actor' });
      continue;
    }
    const participant = line.match(/^participant\s+(\w+)(?:\s+as\s+(.+))?$/);
    if (participant) {
      actors.push({ id: normalizeId(participant[1]), name: stripBr(participant[2] ?? participant[1]), kind: 'participant' });
      continue;
    }

    const note = line.match(/^Note\s+(left|right|over)(?:\s+of)?\s+([^:]+):\s*(.*)$/i);
    if (note) {
      const targets = note[2].split(',').map((s) => normalizeId(s.trim()));
      notes.push({ targets, text: stripDecor(stripBr(note[3])) });
      continue;
    }

    // sync arrow ->>
    const sync = line.match(/^(\w+)\s*->>\s*(\w+)\s*:\s*(.*)$/);
    if (sync) {
      messages.push({ from: normalizeId(sync[1]), to: normalizeId(sync[2]), sync: 'sync', label: normalizeLabel(sync[3]) });
      continue;
    }
    // dashed return -->>
    const ret = line.match(/^(\w+)\s*-->>\s*(\w+)\s*:\s*(.*)$/);
    if (ret) {
      messages.push({ from: normalizeId(ret[1]), to: normalizeId(ret[2]), sync: 'return', label: normalizeLabel(ret[3]) });
      continue;
    }
    // ★ NEW (F-155): sync fail -x  (호출 실패 / 중단된 호출)
    const syncFail = line.match(/^(\w+)\s*-x\s*(\w+)\s*:\s*(.*)$/);
    if (syncFail) {
      messages.push({ from: normalizeId(syncFail[1]), to: normalizeId(syncFail[2]), sync: 'sync', label: normalizeLabel(syncFail[3]), variant: 'fail' });
      continue;
    }
    // ★ NEW (F-155): async open arrow -)
    const asyncOpen = line.match(/^(\w+)\s*-\)\s*(\w+)\s*:\s*(.*)$/);
    if (asyncOpen) {
      messages.push({ from: normalizeId(asyncOpen[1]), to: normalizeId(asyncOpen[2]), sync: 'sync', label: normalizeLabel(asyncOpen[3]), variant: 'async' });
      continue;
    }
    // ★ NEW (F-155): dotted async --)
    const asyncDotted = line.match(/^(\w+)\s*--\)\s*(\w+)\s*:\s*(.*)$/);
    if (asyncDotted) {
      messages.push({ from: normalizeId(asyncDotted[1]), to: normalizeId(asyncDotted[2]), sync: 'return', label: normalizeLabel(asyncDotted[3]), variant: 'async' });
      continue;
    }
  }

  return {
    type: 'sequence',
    actors: dedupBy(actors, (a) => a.id).sort((a, b) => a.id.localeCompare(b.id)),
    messages: messages.sort((a, b) => (a.from + '|' + a.to + '|' + a.sync + '|' + a.label).localeCompare(b.from + '|' + b.to + '|' + b.sync + '|' + b.label)),
    notes,
  };
}

function dedupBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k); out.push(item);
  }
  return out;
}

// helper exports for test
export const __test__ = { normalizeId, normalizeLabel, stripBr, stripDecor };
