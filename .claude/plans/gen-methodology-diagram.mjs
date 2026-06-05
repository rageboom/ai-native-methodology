// gen-methodology-diagram.mjs
// AI-Native 방법론 "한눈에" 개요 도식 생성기.
// 선언적 spec(methodology-diagram.spec.mjs)을 읽어 .excalidraw 를 생성한다.
// 좌표/화살표 바인딩/zone 그리드 배치는 전부 자동. 사용자는 spec 만 한 줄씩 편집.
//
// 이식 원본: ./gen-jira-workflow-diagram.py (box/txt/elbow_arrow 팩토리 + seed 카운터)
// 실행: node gen-methodology-diagram.mjs
//
// 좌표계 메모(실측):
//  - rectangle 만 roundness:{type:3}. text/arrow 는 roundness 키 없음.
//  - text 바인딩 = containerId=rect.id + rect 와 동일 x/y/w/h.
//  - arrow 바인딩 = startBinding/endBinding.elementId 만 채움 (rect.boundElements 역등록 ❌, text 만).
//  - arrow.points = 상대좌표, 첫 점 [0,0]. arrow.x/y = 절대 시작점.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import spec from './methodology-diagram.spec.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dir, 'methodology-diagram.excalidraw');

// ─── 레이아웃 상수 (jira 선례 치수에서 도출) ──────────────────────────────
const BOX_W = 220, BOX_H = 70;          // 일반 박스
const BANNER_BOX_W_MAX = 280;           // 띠(banner) 박스 최대 폭
const GAP_X = 32, GAP_Y = 22;           // 박스 간 간격
const ZONE_PAD = 22, ZONE_TITLE_H = 44; // zone 안쪽 여백 / 제목줄 높이
const ZONE_GAP = 60;                    // zone 간 간격
const MARGIN_X = 60, MARGIN_Y = 90;     // 캔버스 여백 (상단 = 도식 제목 자리)
const MIN_COL_W = 240;                  // page column 최소 폭

// ─── seed 카운터 + 공통 필드 (Python COMMON_RECT/COMMON_NO_ROUND 이식) ───
let _seed = 5000;
const s = () => (_seed += 7);
const COMMON = {
  angle: 0, fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid',
  roughness: 1, opacity: 100, groupIds: [], frameId: null,
  isDeleted: false, updated: 0, link: null, locked: false,
};

// ─── 요소 팩토리 ──────────────────────────────────────────────────────────
function makeRect(id, x, y, w, h, bg, stroke, textId, strokeStyle = 'solid', strokeWidth = 2) {
  const r = {
    id, type: 'rectangle', x, y, width: w, height: h,
    strokeColor: stroke, backgroundColor: bg, seed: s(), version: 1, versionNonce: s(),
    boundElements: textId ? [{ id: textId, type: 'text' }] : [],
    roundness: { type: 3 }, ...COMMON,
  };
  if (strokeStyle !== 'solid') r.strokeStyle = strokeStyle;
  if (strokeWidth !== 2) r.strokeWidth = strokeWidth;
  return r;
}

function makeText(id, containerId, x, y, w, h, text, color = '#000000', fontSize = 14, align = 'center') {
  return {
    id, type: 'text', x, y, width: w, height: h,
    strokeColor: color, backgroundColor: 'transparent', seed: s(), version: 1, versionNonce: s(),
    text, originalText: text, fontSize, fontFamily: 2,
    textAlign: align, verticalAlign: 'middle',
    baseline: Math.round(fontSize * 1.15), lineHeight: 1.25,
    containerId, boundElements: null, ...COMMON,
  };
}

function freeText(id, x, y, w, h, text, color = '#475569', fontSize = 14, align = 'center') {
  // 컨테이너에 안 붙는 자유 텍스트 (제목/범례/화살표 라벨)
  return makeText(id, null, x, y, w, h, text, color, fontSize, align);
}

function makeArrow(id, ax, ay, pts, startId, endId, stroke = '#0f172a', strokeStyle = 'solid', endArrow = 'arrow') {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const a = {
    id, type: 'arrow', x: ax, y: ay,
    width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
    height: Math.max(1, Math.max(...ys) - Math.min(...ys)),
    strokeColor: stroke, backgroundColor: 'transparent', seed: s(), version: 1, versionNonce: s(),
    boundElements: [], points: pts, lastCommittedPoint: null,
    startBinding: startId ? { elementId: startId, focus: 0, gap: 1 } : null,
    endBinding: endId ? { elementId: endId, focus: 0, gap: 1 } : null,
    startArrowhead: null, endArrowhead: endArrow, elbowed: false, ...COMMON,
  };
  if (strokeStyle !== 'solid') a.strokeStyle = strokeStyle;
  return a;
}

function makeDiamond(id, x, y, w, h, bg, stroke) {
  return {
    id, type: 'diamond', x, y, width: w, height: h,
    strokeColor: stroke, backgroundColor: bg, seed: s(), version: 1, versionNonce: s(),
    boundElements: [], ...COMMON, // diamond = roundness 키 없음(sharp)
  };
}

// ─── zone 자동 그리드 배치 ──────────────────────────────────────────────
// zone.row/col = page 격자 위치. zone.span = 가로로 점유하는 page column 수(기본 1).
// zone.cols = zone 내부 박스 그리드 열 수(기본 1).
function computeLayout(zones, boxes) {
  const boxesOf = (zid) => boxes.filter((b) => b.zone === zid);

  // 1) 각 zone 의 natural 크기 (박스 수 기반). 빈 zone 도 최소 1행 확보.
  const nat = {};
  for (const z of zones) {
    const ncol = z.cols || 1;
    const n = boxesOf(z.id).length;
    const nrow = Math.max(1, Math.ceil(n / ncol));
    nat[z.id] = {
      w: ZONE_PAD * 2 + ncol * BOX_W + (ncol - 1) * GAP_X,
      h: ZONE_TITLE_H + ZONE_PAD * 2 + nrow * BOX_H + (nrow - 1) * GAP_Y,
      nrow,
    };
  }

  // 2) page column 폭: span==1 zone 만 폭을 제약 (banner 는 제외).
  const pageCols = Math.max(...zones.map((z) => z.col + (z.span || 1)));
  const pageRows = Math.max(...zones.map((z) => z.row)) + 1;
  const colW = Array(pageCols).fill(MIN_COL_W);
  for (const z of zones) {
    if ((z.span || 1) === 1) colW[z.col] = Math.max(colW[z.col], nat[z.id].w);
  }

  // 3) page row 높이: 그 행의 모든 zone(banner 포함) natural 높이 최대.
  const rowH = Array(pageRows).fill(0);
  for (const z of zones) rowH[z.row] = Math.max(rowH[z.row], nat[z.id].h);

  // 4) column x / row y 오프셋
  const colX = []; let cx = MARGIN_X;
  for (let c = 0; c < pageCols; c++) { colX[c] = cx; cx += colW[c] + ZONE_GAP; }
  const rowY = []; let ry = MARGIN_Y;
  for (let r = 0; r < pageRows; r++) { rowY[r] = ry; ry += rowH[r] + ZONE_GAP; }

  // 5) zone 절대 박스 + 내부 박스 좌표
  const zoneBox = {}, boxBox = {};
  for (const z of zones) {
    const span = z.span || 1;
    const zx = colX[z.col];
    const zw = span > 1
      ? (colX[z.col + span - 1] + colW[z.col + span - 1] - colX[z.col])
      : colW[z.col];
    // zone 은 자기 natural 높이 사용 + 행 안에서 세로 중앙 정렬
    // (입력/산출물이 길어도 가운데 흐름과 시각 정렬 + 흐름 zone 빈공간 방지)
    const natH = nat[z.id].h;
    const zy = rowY[z.row] + (rowH[z.row] - natH) / 2;
    const zh = natH;
    zoneBox[z.id] = { x: zx, y: zy, w: zw, h: zh };

    const ncol = z.cols || 1;
    const innerW = zw - ZONE_PAD * 2;
    const banner = span > 1;
    const slotW = banner ? innerW / ncol : (BOX_W + GAP_X);
    const bw = banner ? Math.min(BANNER_BOX_W_MAX, slotW - GAP_X) : BOX_W;

    boxesOf(z.id).forEach((b, i) => {
      const r = Math.floor(i / ncol), c = i % ncol;
      const slotX = zx + ZONE_PAD + c * slotW;
      const bx = banner ? slotX + (slotW - bw) / 2 : slotX;
      const by = zy + ZONE_TITLE_H + ZONE_PAD + r * (BOX_H + GAP_Y);
      boxBox[b.id] = { x: bx, y: by, w: bw, h: BOX_H };
    });
  }

  const totalW = colX[pageCols - 1] + colW[pageCols - 1] - MARGIN_X;
  const totalH = rowY[pageRows - 1] + rowH[pageRows - 1] - MARGIN_Y;
  return { zoneBox, boxBox, totalW, totalH };
}

// ─── 화살표 라우팅 (직교 elbow) ─────────────────────────────────────────
function routeArrow(sBox, eBox) {
  const s = sBox, e = eBox;
  let ax, ay, tx, ty, horizontal;
  if (e.x >= s.x + s.w - 1) {           // e 가 오른쪽
    ax = s.x + s.w; ay = s.y + s.h / 2; tx = e.x; ty = e.y + e.h / 2; horizontal = true;
  } else if (e.x + e.w <= s.x + 1) {    // e 가 왼쪽
    ax = s.x; ay = s.y + s.h / 2; tx = e.x + e.w; ty = e.y + e.h / 2; horizontal = true;
  } else if (e.y >= s.y + s.h) {        // e 가 아래
    ax = s.x + s.w / 2; ay = s.y + s.h; tx = e.x + e.w / 2; ty = e.y; horizontal = false;
  } else {                              // e 가 위
    ax = s.x + s.w / 2; ay = s.y; tx = e.x + e.w / 2; ty = e.y + e.h; horizontal = false;
  }
  const dx = tx - ax, dy = ty - ay;
  const pts = horizontal
    ? [[0, 0], [dx / 2, 0], [dx / 2, dy], [dx, dy]]
    : [[0, 0], [0, dy / 2], [dx, dy / 2], [dx, dy]];
  return { ax, ay, pts, mid: { x: (ax + tx) / 2, y: (ay + ty) / 2 } };
}

// ─── 메인 빌드 ───────────────────────────────────────────────────────────
function build() {
  const { zones = [], boxes = [], arrows = [], palette = {}, title, legend, freeze = [] } = spec;
  const elements = [];
  const { zoneBox, boxBox, totalW } = computeLayout(zones, boxes);
  const col = (name, fb) => palette[name] || fb || ['#ffffff', '#334155'];

  // zone 컨테이너: 투명 배경 + 색 테두리 + 상단 제목 (빈 zone = 골격)
  for (const z of zones) {
    const b = zoneBox[z.id];
    const [, stroke] = col(z.color);
    elements.push(makeRect(`${z.id}-bg`, b.x, b.y, b.w, b.h, 'transparent', stroke, null, 'solid'));
    elements.push(freeText(`${z.id}-title`, b.x, b.y + 8, b.w, 28, z.title, stroke, 16));
  }

  // 박스: rect + 가운데 텍스트(label\nsub)
  for (const bx of boxes) {
    const b = boxBox[bx.id];
    if (!b) continue;
    const [bg, stroke] = col(bx.color || zones.find((z) => z.id === bx.zone)?.color);
    const tid = `${bx.id}-t`;
    const txt = bx.sub ? `${bx.label}\n${bx.sub}` : bx.label;
    elements.push(makeRect(bx.id, b.x, b.y, b.w, b.h, bg, stroke, tid, bx.strokeStyle || 'solid', bx.emphasis ? 4 : 2));
    elements.push(makeText(tid, bx.id, b.x, b.y, b.w, b.h, txt, bx.textColor || '#1e293b', bx.fontSize || 13));
  }

  // 화살표: from→to. 좌표/바인딩/points 자동.
  for (const ar of arrows) {
    const sB = boxBox[ar.from], eB = boxBox[ar.to];
    if (!sB || !eB) continue;
    let ax, ay, pts, mid;
    if (ar.route === 'under') {
      // U자: source 아래로 → 가로질러 → target 아래로 (revisit loopback)
      const baseline = Math.max(sB.y + sB.h, eB.y + eB.h) + 24;
      ax = sB.x + sB.w / 2; ay = sB.y + sB.h;
      const tx = eB.x + eB.w / 2, ty = eB.y + eB.h;
      pts = [[0, 0], [0, baseline - ay], [tx - ax, baseline - ay], [tx - ax, ty - ay]];
      mid = { x: (ax + tx) / 2, y: baseline };
    } else {
      ({ ax, ay, pts, mid } = routeArrow(sB, eB));
    }
    const aid = `a-${ar.from}-${ar.to}`;
    elements.push(makeArrow(aid, ax, ay, pts, ar.from, ar.to, ar.color || '#0f172a', ar.style || 'solid'));
    if (ar.label) elements.push(freeText(`${aid}-lbl`, mid.x - 70, mid.y - 9, 140, 18, ar.label, ar.color || '#475569', 12));
  }

  // gate ◇ 배지: 해당 박스 상단 모서리에 작은 다이아 (개별 라벨 ❌ — 간략)
  const gates = spec.gates || [];
  if (gates.length) {
    const [gbg, gstroke] = col('gate');
    for (const gid of gates) {
      const b = boxBox[gid];
      if (!b) continue;
      const ds = 22, cx = b.x + b.w / 2, cy = b.y;
      elements.push(makeDiamond(`gate-${gid}`, cx - ds / 2, cy - ds / 2, ds, ds, gbg, gstroke));
    }
    if (spec.gateCaption) {
      const zid = boxes.find((b) => b.id === gates[0])?.zone;
      const z = zid && zoneBox[zid];
      if (z) elements.push(freeText('gate-caption', z.x, z.y + z.h + 30, z.w, 20, spec.gateCaption, '#b45309', 13));
    }
  }

  // 도식 제목 / 범례
  if (title) elements.push(freeText('diagram-title', MARGIN_X, 20, totalW, 40, title, '#0f172a', 26));
  if (legend) {
    const maxY = Math.max(...elements.map((e) => (e.y || 0) + (e.height || 0)));
    elements.push(freeText('diagram-legend', MARGIN_X, maxY + 24, totalW, 22, legend, '#475569', 13));
  }

  // freeze merge: freeze 의 id 는 생성분에서 제외 + 기존 파일에서 보존
  if (freeze.length && fs.existsSync(OUT)) {
    const prev = JSON.parse(fs.readFileSync(OUT, 'utf-8'));
    const keep = new Set(freeze);
    const frozen = (prev.elements || []).filter(
      (e) => keep.has(e.id) || keep.has(e.frameId) || keep.has(e.containerId) ||
             [...keep].some((k) => e.id?.startsWith(`${k}-`) || e.id === `a-${k}` || e.id?.startsWith(`a-${k}-`)),
    );
    const frozenIds = new Set(frozen.map((e) => e.id));
    const merged = elements.filter((e) => !frozenIds.has(e.id)).concat(frozen);
    return merged;
  }
  return elements;
}

// ─── 직렬화 + 출력 (.bak 백업) ──────────────────────────────────────────
const elements = build();
const doc = {
  type: 'excalidraw', version: 2, source: 'https://excalidraw.com',
  elements, appState: { gridSize: null, viewBackgroundColor: '#ffffff' }, files: {},
};
if (fs.existsSync(OUT)) fs.copyFileSync(OUT, `${OUT}.bak`);
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2), 'utf-8');
const counts = elements.reduce((m, e) => ((m[e.type] = (m[e.type] || 0) + 1), m), {});
console.log(`total: ${elements.length} elements`, counts);
console.log(`saved: ${OUT}`);
