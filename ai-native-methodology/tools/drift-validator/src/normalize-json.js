// JSON normalizer — formal-spec.schema 의 state-machines / sequences shape → mermaid normalizer 와 정합 가능한 형태로 정리.

const stripDecor = (s) => String(s).replace(/[★⚠️✅❌⏳]/g, '').replace(/\s+/g, ' ').trim();
const normalizeId = (s) => stripDecor(s).toLowerCase().replace(/[\s_\-]+/g, '');
const normalizeLabel = (s) => stripDecor(String(s)).toLowerCase();

export function detectArtifactType(json) {
  if (!json || typeof json !== 'object') return 'unknown';
  if (json.states && typeof json.states === 'object') return 'state-machine';
  if (Array.isArray(json.actors) && Array.isArray(json.messages)) return 'sequence';
  if (json.br_id || json.condition) return 'decision-table';
  return 'unknown';
}

// state-machine: states.<id>.on.<EVENT> = "target" | { target, actions, guard }
export function normalizeStateMachineJson(json) {
  const states = new Set();
  const compoundStates = new Set();
  const transitions = [];
  const initial = json.initial ? normalizeId(json.initial) : null;

  for (const [stateId, def] of Object.entries(json.states ?? {})) {
    const id = normalizeId(stateId);
    states.add(id);
    if (def && def.type === 'compound') compoundStates.add(id);
    const onMap = def?.on ?? {};
    for (const [eventRaw, target] of Object.entries(onMap)) {
      const event = normalizeLabel(eventRaw);
      const tObj = (typeof target === 'string') ? { target } : (target ?? {});
      const tId = tObj.target ? normalizeId(tObj.target) : null;
      if (tId) states.add(tId);
      transitions.push({ from: id, to: tId, event, guard: tObj.guard ? stripDecor(tObj.guard) : null });
    }
  }

  return {
    type: 'state-machine',
    initial,
    states: Array.from(states).sort(),
    compound_states: Array.from(compoundStates).sort(),
    transitions: transitions.sort(byTransition),
  };
}

function byTransition(a, b) {
  return (a.from + '|' + a.to + '|' + a.event).localeCompare(b.from + '|' + b.to + '|' + b.event);
}

// sequence: actors[] + messages[]
export function normalizeSequenceJson(json) {
  const actors = (json.actors ?? []).map((a) => ({
    id: normalizeId(a.id),
    name: stripDecor(a.name ?? a.id),
    kind: a.type === 'user' ? 'actor' : 'participant',
  })).sort((a, b) => a.id.localeCompare(b.id));

  const messages = (json.messages ?? []).map((m) => ({
    from: normalizeId(m.from),
    to: normalizeId(m.to),
    sync: m.sync === 'return' ? 'return' : 'sync',
    label: normalizeLabel(m.label ?? ''),
    guard: m.guard ? stripDecor(m.guard) : null,
  })).sort((a, b) => (a.from + '|' + a.to + '|' + a.sync + '|' + a.label).localeCompare(b.from + '|' + b.to + '|' + b.sync + '|' + b.label));

  return { type: 'sequence', actors, messages };
}

export const __test__ = { normalizeId, normalizeLabel };
