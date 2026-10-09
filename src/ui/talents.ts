// THE SKILL TREES' PAGE (not in the game: behind TALENTS in game/talents.ts, off, until he has seen
// pictures and said yes). A fourth page of the inventory, TALENTS, beside GEAR, ATTACKS and STATS:
// the class's tree in its own shape (game/talents.ts says what each talent does and where it sits),
// read from left to right, with the points to spend over it. A talent pressed is read on a card
// over the game's half, against the panel, as a piece of gear is; TAKE spends a point on it.
//   - a talent taken is lit: the friend's cyan round it, its rune in its path's colour on a ground
//     of that colour, and the line that led to it lit too;
//   - one that can be taken now has its path's colour round it and a ring that pulses;
//   - one whose way is open but with no point to spend, a quiet rim;
//   - one whose way is not open yet, dark, its rune faint.
// A BIG talent (a big change to how something works) is the larger stone, with a second rim.

import { GLYPH, WORD_COLOR, WORD_GLOW } from '../art/icons';
import { P } from '../art/palette';
import { LINE_H, drawText, textWidth, wrapText } from '../engine/font';
import { WORDS } from '../game/defs';
import type { Game } from '../game/game';
import { TREES, nextTalentLevel, talentOpen } from '../game/talents';
import type { TalentDef, TalentTree } from '../game/talents';
import type { WordId } from '../game/types';
import { THEME, inside } from './ui';
import type { Rect, Ui } from './ui';

/** What the page keeps between frames (kept in the inventory's own state). */
export interface TalentUi {
  /** The talent being read. */
  sel: string | null;
  /** The card as it was drawn last frame, and its TAKE or UNDO (a press on it is answered next frame). */
  card: { r: Rect; take: Rect | null; undo?: Rect | null } | null;
  /** A talent just taken, and how long ago: it flares. */
  flash: { id: string; t: number } | null;
}

export function newTalentUi(): TalentUi {
  return { sel: null, card: null, flash: null };
}

/** How big a talent's stone is: a step, and a big one. */
export const STONE = 11;
export const BIG_STONE = 15;
/** The card's width. */
const CARD = 136;

// ---- the runes on the stones ------------------------------------------------------------------
// 'X' the colour, 'o' the glow. The paths' runes are the words' where a word is the thing (the
// elements, the eye's sight, the wind's arrows, iron's shield, the quake's weight), three of the
// arrow's own, and the technique's blade.
const ARROW: readonly string[] = ['....X..', '.....X.', 'XXXXXXo', '.....X.', '....X..'];
const JAWS: readonly string[] = ['X.X.X.X', 'XXXXXXX', 'X.....X', '.X.o.X.', '..XXX..'];
const SPLIT: readonly string[] = ['.....X', '....X.', 'XXXo..', '....X.', '.....X'];
const BLADE: readonly string[] = ['.X.....', '.X.....', 'XXXXXXo', '.X.....', '.X.....'];
/** A rune and its two colours. */
interface Rune {
  rows: readonly string[];
  color: string;
  glow: string;
}
function wordRune(w: WordId): Rune {
  return { rows: GLYPH[w], color: WORD_COLOR[w], glow: WORD_GLOW[w] };
}
/** Each path's rune, by the path's id. */
const PATH_RUNE: Record<string, (color: string) => Rune> = {
  fire: () => wordRune('fire'),
  lightning: () => wordRune('lightning'),
  frost: () => wordRune('frost'),
  wind: () => wordRune('swift'),
  eye: () => wordRune('precise'),
  shaft: (c) => ({ rows: ARROW, color: c, glow: P.white }),
  traps: (c) => ({ rows: JAWS, color: c, glow: P.white }),
  arrows: (c) => ({ rows: SPLIT, color: c, glow: P.white }),
  technique: (c) => ({ rows: BLADE, color: c, glow: P.white }),
  iron: () => wordRune('guarding'),
  cross: () => wordRune('heavy'),
};
/** The rune a talent's stone carries: its word's, if it works with one; else its path's. */
function runeOf(tree: TalentTree, t: TalentDef): Rune {
  if (t.word) return wordRune(t.word);
  const path = tree.paths.find((p) => p.id === t.path);
  const color = path ? path.color : THEME.text;
  return (PATH_RUNE[t.path] ?? ((c: string) => ({ rows: ARROW, color: c, glow: P.white })))(color);
}
function drawRune(g: CanvasRenderingContext2D, rune: Rune, cx: number, cy: number, alpha: number): void {
  const h = rune.rows.length;
  const w = rune.rows[0].length;
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h / 2);
  g.globalAlpha = alpha;
  for (let y = 0; y < h; y++) {
    const row = rune.rows[y];
    for (let x = 0; x < w; x++) {
      const c = row[x];
      if (c === '.') continue;
      g.fillStyle = c === 'o' ? rune.glow : rune.color;
      g.fillRect(x0 + x, y0 + y, 1, 1);
    }
  }
  g.globalAlpha = 1;
}

/** A line one game pixel thick, pixel by pixel (the art has no soft lines). */
function line(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, alpha = 1): void {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  let x = Math.round(x0);
  let y = Math.round(y0);
  const X = Math.round(x1);
  const Y = Math.round(y1);
  const dx = Math.abs(X - x);
  const dy = -Math.abs(Y - y);
  const sx = x < X ? 1 : -1;
  const sy = y < Y ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 2000; n++) {
    g.fillRect(x, y, 1, 1);
    if (x === X && y === Y) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  g.globalAlpha = 1;
}

// ---- where everything goes ------------------------------------------------------------------------
export interface TalentAt {
  def: TalentDef;
  /** Its stone. */
  r: Rect;
  cx: number;
  cy: number;
}
export interface TalentLayout {
  tree: TalentTree;
  nodes: TalentAt[];
  root: { x: number; y: number } | null;
  labels: { text: string; x: number; y: number; color: string }[];
  /** The line over the tree: what it is and the points. */
  headY: number;
}

/** The tree laid into the page's room `r`, its shape stretched to fill it. */
export function layTalents(game: Game, r: Rect): TalentLayout {
  const tree = TREES[game.hero.cls];
  const pts: (readonly [number, number])[] = tree.talents.map((t) => t.at);
  if (tree.root) pts.push(tree.root);
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  const maxY = Math.max(...pts.map((p) => p[1]));
  const headY = r.y + 1;
  // (room for half a big stone round the edge, and for the captions of the paths above and below)
  const area: Rect = { x: r.x + 9, y: r.y + 19, w: r.w - 18, h: r.h - 29 };
  const sx = area.w / Math.max(0.01, maxX - minX);
  const sy = area.h / Math.max(0.01, maxY - minY);
  const map = (x: number, y: number): [number, number] => [Math.round(area.x + (x - minX) * sx), Math.round(area.y + (y - minY) * sy)];
  const nodes = tree.talents.map((def): TalentAt => {
    const [cx, cy] = map(def.at[0], def.at[1]);
    const s = def.big ? BIG_STONE : STONE;
    return { def, r: { x: cx - Math.floor(s / 2), y: cy - Math.floor(s / 2), w: s, h: s }, cx, cy };
  });
  const root = tree.root ? (([x, y]) => ({ x, y }))(map(tree.root[0], tree.root[1])) : null;
  // (each path's name beside one of its talents: small letters, 6 high)
  const labels = tree.paths
    .filter((p) => p.name)
    .map((p) => {
      const n = nodes.find((q) => q.def.id === p.label.node);
      const w = textWidth(p.name, 'small');
      let x = r.x;
      let y = r.y + 10;
      if (n) {
        const half = Math.ceil(n.r.w / 2) + (n.def.big ? 2 : 0);
        if (p.label.side === 'right') [x, y] = [n.cx + half + 3, n.cy - 3];
        else if (p.label.side === 'left') [x, y] = [n.cx - half - 3 - w, n.cy - 3];
        else if (p.label.side === 'above') [x, y] = [n.cx - Math.floor(w / 2), n.cy - half - 8];
        else [x, y] = [n.cx - Math.floor(w / 2), n.cy + half + 2];
      }
      return { text: p.name, x: Math.max(r.x, Math.min(r.x + r.w - w, x)), y: Math.max(r.y + 10, Math.min(r.y + r.h - 6, y)), color: p.color };
    });
  return { tree, nodes, root, labels, headY };
}

/** The card of the talent being read: where it goes, over the game's half against the panel. */
function cardRect(panel: Rect, at: TalentAt, h: number, W: number, H: number): Rect {
  if (panel.y > 0) {
    // (the panel is the bottom half: the card stands over it)
    const x = Math.max(2, Math.min(W - CARD - 2, at.cx - Math.floor(CARD / 2)));
    return { x, y: Math.max(2, panel.y - h - 3), w: CARD, h };
  }
  const x = Math.max(2, panel.x - CARD - 3);
  const y = Math.max(2, Math.min(H - h - 2, at.cy - 12));
  return { x, y, w: CARD, h };
}

/** What the card says, line by line, and how tall it is. */
function cardLines(game: Game, t: TalentDef, tree: TalentTree): { text: string; color: string; small: boolean }[] {
  const path = tree.paths.find((p) => p.id === t.path);
  const out: { text: string; color: string; small: boolean }[] = [];
  out.push({ text: t.name.toUpperCase(), color: P.white, small: false });
  out.push({ text: `${t.big ? 'BIG ' : ''}${path && path.name ? `${path.name} ` : ''}TALENT`, color: path ? path.color : THEME.dim, small: true });
  for (const l of wrapText(t.text, CARD - 10)) out.push({ text: l, color: THEME.text, small: false });
  if (t.word) out.push({ text: `WORKS WITH ${WORDS[t.word].name.toUpperCase()}`, color: WORD_COLOR[t.word], small: true });
  return out;
}

/**
 * The presses on the page, before it is drawn (with the layout of this frame and the card of the
 * last): a stone is read; TAKE spends a point. Returns a word to say, if any.
 */
export function talentPresses(ui: Ui, game: Game, st: TalentUi, lay: TalentLayout): string | null {
  let say: string | null = null;
  const card = st.card;
  if (card && card.take && st.sel && ui.pressIn(card.take.x, card.take.y, card.take.w, card.take.h)) {
    const id = st.sel;
    const why = game.takeTalent(id);
    if (why) say = why;
    else st.flash = { id, t: 0 };
  }
  if (card && card.undo && st.sel && ui.pressIn(card.undo.x, card.undo.y, card.undo.w, card.undo.h)) {
    const why = game.unlearnTalent(st.sel);
    if (why) say = why;
  }
  // (a press anywhere else on the card is the card's: it does not close the inventory)
  if (card && ui.press && !ui.used && inside(card.r, ui.press.x, ui.press.y)) ui.used = true;
  const pad = ui.touch ? 3 : 1;
  for (const n of lay.nodes) {
    if (!ui.pressIn(n.r.x - pad, n.r.y - pad, n.r.w + 2 * pad, n.r.h + 2 * pad)) continue;
    st.sel = n.def.id;
  }
  return say;
}

/** The page, and the card of the talent being read. */
export function drawTalents(ui: Ui, game: Game, st: TalentUi, lay: TalentLayout, r: Rect, panel: Rect, t: number, dt: number): void {
  const g = ui.g;
  const h = game.hero;
  const tree = lay.tree;
  const taken = h.talents;
  const left = game.talentsLeft();
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  if (st.flash) {
    st.flash.t += dt;
    if (st.flash.t > 0.8) st.flash = null;
  }
  if (st.sel && !tree.talents.some((q) => q.id === st.sel)) st.sel = null;

  // the line over the tree: what it is, and the points
  const next = nextTalentLevel(h.level);
  const pts = left > 0 ? `${left} ${left === 1 ? 'POINT' : 'POINTS'} TO SPEND` : next !== null ? `NEXT POINT AT LEVEL ${next}` : 'ALL TEN SPENT';
  // (what the tree is, where there is room for it beside the points)
  const what = `TALENTS: ${tree.shape.toUpperCase()}`;
  const ptsW = textWidth(pts, left > 0 ? 'normal' : 'small');
  drawText(g, textWidth(what, 'small') + 8 + ptsW <= r.w ? what : 'TALENTS', r.x, lay.headY + 2, THEME.dim, { font: 'small' });
  drawText(g, pts, r.x + r.w, lay.headY, left > 0 ? THEME.accent : THEME.dim, { align: 'right', font: left > 0 ? 'normal' : 'small' });
  ui.mark('talents:points', r.x + r.w - textWidth(pts), lay.headY, textWidth(pts), 9);

  const at = new Map(lay.nodes.map((n) => [n.def.id, n]));
  const isTaken = (id: string): boolean => taken.includes(id);
  // the faint pictures behind the tree, so that its shape reads (the arrow's feathers and head, the swords)
  for (const f of tree.figures ?? []) {
    const path = tree.paths.find((p) => p.id === f.path);
    const color = path ? path.color : THEME.dim;
    if (f.kind === 'fill') {
      const pts = f.ids.map((id) => at.get(id)).filter((n): n is TalentAt => !!n);
      if (pts.length < 3) continue;
      g.globalAlpha = 0.09;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(pts[0].cx + 0.5, pts[0].cy + 0.5);
      for (const n of pts.slice(1)) g.lineTo(n.cx + 0.5, n.cy + 0.5);
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
    } else {
      const P0 = at.get(f.pommel);
      const G = at.get(f.guard);
      const T = at.get(f.tip);
      const Q = f.quillons.map((id) => at.get(id));
      if (!P0 || !G || !T || !Q[0] || !Q[1]) continue;
      // the blade: two edges from the guard to the point
      const len = Math.hypot(T.cx - G.cx, T.cy - G.cy) || 1;
      const ux = (T.cx - G.cx) / len;
      const uy = (T.cy - G.cy) / len;
      const nx = -uy;
      const ny = ux;
      const bw = 5;
      const ex = T.cx + ux * 8;
      const ey = T.cy + uy * 8;
      g.globalAlpha = 0.1;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(G.cx + nx * bw + 0.5, G.cy + ny * bw + 0.5);
      g.lineTo(ex + 0.5, ey + 0.5);
      g.lineTo(G.cx - nx * bw + 0.5, G.cy - ny * bw + 0.5);
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
      line(g, G.cx + nx * bw, G.cy + ny * bw, ex, ey, color, 0.35);
      line(g, G.cx - nx * bw, G.cy - ny * bw, ex, ey, color, 0.35);
      // the crossguard, through the guard from quillon to quillon, and the grip down to the pommel
      for (const o of [-1.5, 0, 1.5]) {
        const qx = (Q[1]!.cx - Q[0]!.cx);
        const qy = (Q[1]!.cy - Q[0]!.cy);
        const ql = Math.hypot(qx, qy) || 1;
        const mx = (-qy / ql) * o;
        const my = (qx / ql) * o;
        line(g, Q[0]!.cx + mx, Q[0]!.cy + my, Q[1]!.cx + mx, Q[1]!.cy + my, color, 0.3);
        line(g, G.cx + nx * o, G.cy + ny * o, P0.cx + nx * o, P0.cy + ny * o, color, 0.25);
      }
    }
  }
  // the lines: between each talent and the ones that lead to it; and from the mage's rune
  if (lay.root) {
    for (const n of lay.nodes) {
      if (n.def.from.length) continue;
      const lit = isTaken(n.def.id);
      line(g, lay.root.x, lay.root.y, n.cx, n.cy, lit ? THEME.accent : THEME.edgeHi, lit ? 1 : 0.7);
    }
  }
  for (const n of lay.nodes) {
    for (const f of n.def.from) {
      const m = at.get(f);
      if (!m) continue;
      const lit = isTaken(n.def.id) && isTaken(f);
      line(g, m.cx, m.cy, n.cx, n.cy, lit ? THEME.accent : THEME.edgeHi, lit ? 1 : 0.55);
    }
  }
  // the mage's rune, where her three paths begin
  if (lay.root) {
    const { x, y } = lay.root;
    ui.box(x - 7, y - 7, 15, 15, THEME.bg2, THEME.accentLo);
    drawRune(g, { rows: ['..X..', '.XoX.', 'XoooX', '.XoX.', '..X..'], color: THEME.accentLo, glow: THEME.accent }, x + 0.5, y + 0.5, 1);
  }
  // the captions of the paths
  for (const l of lay.labels) drawText(g, l.text, l.x, l.y, l.color, { font: 'small' });

  // the stones
  for (const n of lay.nodes) {
    const def = n.def;
    const took = isTaken(def.id);
    const open = !took && talentOpen(h.cls, taken, def.id);
    const can = open && left > 0;
    const rune = runeOf(tree, def);
    const path = tree.paths.find((p) => p.id === def.path);
    const pc = path ? path.color : THEME.text;
    const { x, y, w } = n.r;
    if (def.big) {
      // a big talent: a second rim round the stone
      ui.box(x - 2, y - 2, w + 4, w + 4, THEME.ink, took ? THEME.accent : can ? pc : THEME.edge);
    }
    if (took) {
      ui.box(x, y, w, w, THEME.hot, THEME.accent);
      g.globalAlpha = 0.35;
      g.fillStyle = pc;
      g.fillRect(x + 1, y + 1, w - 2, w - 2);
      g.globalAlpha = 1;
    } else if (can) ui.box(x, y, w, w, THEME.bg2, pc);
    else if (open) ui.box(x, y, w, w, THEME.bg2, THEME.edgeHi);
    else ui.box(x, y, w, w, THEME.slot, THEME.edge);
    drawRune(g, rune, n.cx + 0.5, n.cy + 0.5, took || can ? 1 : open ? 0.75 : 0.35);
    // (one that can be taken now: a ring that pulses round it)
    if (can) {
      g.globalAlpha = 0.25 + 0.5 * pulse;
      g.strokeStyle = THEME.accent;
      g.lineWidth = 0.5;
      const o = def.big ? 4 : 2;
      g.strokeRect(x - o + 0.25, y - o + 0.25, w + 2 * o - 0.5, w + 2 * o - 0.5);
      g.globalAlpha = 1;
    }
    // (the one being read)
    if (st.sel === def.id) {
      const o = def.big ? 4 : 3;
      g.fillStyle = THEME.accent;
      g.fillRect(x - o, y - o, w + 2 * o, 1);
      g.fillRect(x - o, y + w + o - 1, w + 2 * o, 1);
      g.fillRect(x - o, y - o, 1, w + 2 * o);
      g.fillRect(x + w + o - 1, y - o, 1, w + 2 * o);
    }
    // (just taken: it flares)
    if (st.flash && st.flash.id === def.id) {
      const k = st.flash.t / 0.8;
      const o = Math.round(2 + k * 8);
      g.globalAlpha = 1 - k;
      g.strokeStyle = P.white;
      g.lineWidth = 1;
      g.strokeRect(x - o + 0.5, y - o + 0.5, w + 2 * o - 1, w + 2 * o - 1);
      g.globalAlpha = 1;
    }
    ui.mark(`talent:${def.id}`, x, y, w, w);
  }

  // the card of the talent being read
  st.card = null;
  const sel = st.sel ? at.get(st.sel) : undefined;
  if (!sel) return;
  const def = sel.def;
  const lines = cardLines(game, def, tree);
  const took = isTaken(def.id);
  const why = game.talentProblem(def.id);
  const bh = ui.touch ? 18 : 13;
  const textH = lines.reduce((a, l) => a + LINE_H[l.small ? 'small' : 'normal'] + (l.small ? 2 : 1), 0);
  const ch = 5 + textH + 3 + bh + 5;
  const cr = cardRect(panel, sel, ch, ui.w, ui.h);
  ui.box(cr.x, cr.y, cr.w, cr.h, THEME.bg, THEME.edgeHi);
  g.fillStyle = THEME.accentLo;
  g.fillRect(cr.x + 1, cr.y + 1, cr.w - 2, 0.5);
  let ly = cr.y + 5;
  for (const l of lines) {
    drawText(g, l.text, cr.x + 5, ly + (l.small ? 0 : 0), l.color, { font: l.small ? 'small' : 'normal' });
    ly += LINE_H[l.small ? 'small' : 'normal'] + (l.small ? 2 : 1);
  }
  const by = cr.y + cr.h - 5 - bh;
  let take: Rect | null = null;
  let undo: Rect | null = null;
  if (took) {
    // taken: and in town, undone for gold (his rulebook), if nothing taken hangs on it alone
    drawText(g, 'TAKEN', cr.x + 5, by + Math.floor((bh - 8) / 2) + 1, THEME.good);
    const tw = textWidth('TAKEN') + 10;
    const no = game.unlearnProblemNow(def.id);
    if (no === null) {
      undo = { x: cr.x + 5 + tw, y: by, w: cr.w - 10 - tw, h: bh };
      ui.drawButton(undo.x, undo.y, undo.w, undo.h, `UNDO  ${game.unlearnPrice()} GOLD`);
      ui.mark('button:UNDO', undo.x, undo.y, undo.w, undo.h);
    } else drawText(g, no.toUpperCase(), cr.x + 5 + tw, by + Math.floor((bh - 6) / 2) + 1, THEME.dim, { font: 'small' });
  } else if (why === null) {
    take = { x: cr.x + 5, y: by, w: cr.w - 10, h: bh };
    ui.drawButton(take.x, take.y, take.w, take.h, 'TAKE  (1 POINT)', { primary: true });
    ui.mark('button:TAKE', take.x, take.y, take.w, take.h);
  } else drawText(g, why.toUpperCase(), cr.x + 5, by + Math.floor((bh - 6) / 2) + 1, THEME.dim, { font: 'small' });
  ui.mark('talent-card', cr.x, cr.y, cr.w, cr.h);
  st.card = { r: cr, take, undo };
}
