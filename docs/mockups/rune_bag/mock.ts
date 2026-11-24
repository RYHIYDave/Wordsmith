// THE RUNE BAG AND THE MELDING STONE: a mock-up for the owner's yes, drawn as the Godot game draws (960 x 540, two picture
// pixels to a game pixel), in the game's own letters (engine/font.ts) and its own rune stones (Godot assets/loot/icons.png,
// assets/words/melds52.png). Nothing here is the game; it is the picture of what is proposed.
import { drawText, textWidth, wrapText } from '@game/engine/font';

declare const RUNE_DATA: { runes: Rune[]; sheet: string; cols: number; dust: string; glyphs: string[][] };
declare const PICS: Record<string, { u: string; w: number; h: number }>;

interface Rune {
  id: string; name: string; kind: string; color: string; of: [string, string] | null; about: string; front: string; behind: string;
  monster: string; attr: string | null; group: string; rankOf?: string; rank?: number; s: number; city?: boolean; f: string; b: string;
}

// ---------------------------------------------------------------- the game's colours (Godot inventory.gd, ui.ts THEME)
const C = {
  PANEL: '#0e0c24', BOX: '#1a1648', BG2: '#2a2466', EDGE_HI: '#7a74c8', HOT: '#4640a0', INK: '#0e0c24', EDGE: '#3a3478',
  PICK: '#7af8f0', PICK_LO: '#22a8c0', PICK_BG: '#12506a', PRESS: '#e0287a', PRESS_HI: '#ff7aa8', DIM: '#9c96dc', FAINT: '#5a54b0',
  TEXT: '#f0e8ff', BAD: '#ff6e80', GOLD: '#ffe070', FOE: '#ff7aa8', WHITE: '#ffffff',
};
const ST = ['#0b0910', '#1c1722', '#2a2331', '#3a3040', '#4d4252', '#655868', '#857888', '#a89cab'];
const CY = ['#7af8f0', '#bffcf8', '#22a8c0', '#ffffff', '#5ce8f8'];
const GROUPS = ['ALL', 'DAMAGE', 'STRIKE', 'TIME', 'CONTROL', 'SPOILS', 'MELDS'];
const GROUP_ICON: Record<string, string> = { DAMAGE: 'power', STRIKE: 'twin', TIME: 'swift', CONTROL: 'binding', SPOILS: 'leech', MELDS: 'eruption' };
const ATTR: Record<string, string> = { str: 'STRENGTH', dex: 'DEXTERITY', int: 'INTELLIGENCE' };
const W = 480, H = 270, HALF = 240;

// ---------------------------------------------------------------- data
const RUNES = RUNE_DATA.runes;
const R: Record<string, Rune> = {};
for (const r of RUNES) R[r.id] = r;
const BASE_ORDER: string[] = RUNES.filter((r) => r.group !== 'MELDS' && !r.rankOf).map((r) => r.id);
const MELD_OF = new Map<string, string>();
const RANK_UP = new Map<string, string>();
const pairKey = (a: string, b: string) => (a < b ? a + '|' + b : b + '|' + a);
for (const r of RUNES) {
  if (r.of) MELD_OF.set(pairKey(r.of[0], r.of[1]), r.id);
  if (r.rankOf) RANK_UP.set(r.rankOf, r.id);
}
const makes = (a: string, b: string): string | null => (a === b ? RANK_UP.get(a) ?? null : MELD_OF.get(pairKey(a, b)) ?? null);

// what the hero holds (an example hero, deep in the game: most base runes, many melds, not all)
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const held: Record<string, number> = {};
const got: Record<string, number> = {};
const known = new Set<string>();
const fresh = new Set<string>();
let gotN = 0;
const LEAVE_OUT = new Set(['scald', 'wildfire', 'hailstorm', 'flashfreeze', 'onslaught', 'rekindle', 'viper', 'thunder', 'fire2', 'frost2', 'twin2', 'swift2']);
for (const r of RUNES) {
  let n = 0;
  if (LEAVE_OUT.has(r.id)) n = 0;
  else if (r.group !== 'MELDS' && !r.rankOf) n = 2 + Math.floor(rnd() * 5);
  else if (r.rankOf) n = rnd() < 0.5 ? 1 + Math.floor(rnd() * 2) : 0;
  else n = rnd() < (r.city ? 0.35 : 0.62) ? 1 + Math.floor(rnd() * (rnd() < 0.2 ? 6 : 3)) : 0;
  held[r.id] = n;
  if (n > 0) { known.add(r.id); got[r.id] = gotN++; }
}
for (const id of ['avalanche', 'bloodlust', 'gale', 'tether', 'quicksilver', 'cinderward']) if (held[id] > 0) { fresh.add(id); got[id] = gotN++; }
let dust = 9;
const heldCount = () => RUNES.reduce((n, r) => n + (held[r.id] > 0 ? 1 : 0), 0);

// ---------------------------------------------------------------- pictures
const img = (u: string) => { const i = new Image(); i.src = u; return i; };
const sheet = img(RUNE_DATA.sheet);
const pics: Record<string, HTMLImageElement> = {};
for (const k in PICS) pics[k] = img(PICS[k].u);
let stonePx: Uint8ClampedArray | null = null;
const tintCache = new Map<string, HTMLCanvasElement>();

function readStones(): void {
  const c = document.createElement('canvas');
  c.width = sheet.width; c.height = sheet.height;
  const x = c.getContext('2d')!;
  x.drawImage(sheet, 0, 0);
  stonePx = x.getImageData(0, 0, c.width, c.height).data;
}
function srcOf(id: string): [number, number] {
  const s = R[id].s;
  return [(s % RUNE_DATA.cols) * 24, Math.floor(s / RUNE_DATA.cols) * 24];
}
/** Each inked pixel of a rune's stone: [x, y, colour] at the stone's own grain (24 x 24). */
function pixelsOf(id: string): [number, number, string][] {
  if (!stonePx) readStones();
  const [sx, sy] = srcOf(id);
  const out: [number, number, string][] = [];
  const w = sheet.width;
  for (let y = 0; y < 24; y++)
    for (let x = 0; x < 24; x++) {
      const i = ((sy + y) * w + sx + x) * 4;
      if (stonePx![i + 3] > 128) out.push([x, y, `rgb(${stonePx![i]},${stonePx![i + 1]},${stonePx![i + 2]})`]);
    }
  return out;
}
/** A stone washed toward the friend's cyan (k 0..1). */
function tinted(id: string, k: number): HTMLCanvasElement {
  const q = Math.round(k * 8) / 8;
  const key = id + ':' + q;
  let c = tintCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = 24; c.height = 24;
  const x = c.getContext('2d')!;
  const [sx, sy] = srcOf(id);
  x.drawImage(sheet, sx, sy, 24, 24, 0, 0, 24, 24);
  x.globalCompositeOperation = 'source-atop';
  x.globalAlpha = q;
  x.fillStyle = q > 0.75 ? '#dffffc' : C.PICK;
  x.fillRect(0, 0, 24, 24);
  tintCache.set(key, c);
  return c;
}

// ---------------------------------------------------------------- the screen
const cv = document.getElementById('game') as HTMLCanvasElement;
cv.width = W * 2; cv.height = H * 2;
const g = cv.getContext('2d')!;
let now = 0;
const T = (s: string, x: number, y: number, c: string, o?: { font?: 'normal' | 'small'; scale?: number; align?: 'left' | 'center' | 'right'; shadow?: string | null }) => drawText(g, s, x, y, c, o);
const tw = (s: string, f: 'normal' | 'small' = 'normal', sc = 1) => textWidth(s, f, sc);

function box(x: number, y: number, w: number, h: number, fill: string | null, edge?: string | null, a = 1): void {
  g.globalAlpha = a;
  if (fill) { g.fillStyle = fill; g.fillRect(x + 1, y + 1, w - 2, h - 2); }
  if (edge) {
    g.fillStyle = edge;
    g.fillRect(x + 1, y, w - 2, 1); g.fillRect(x + 1, y + h - 1, w - 2, 1);
    g.fillRect(x, y + 1, 1, h - 2); g.fillRect(x + w - 1, y + 1, 1, h - 2);
  }
  g.globalAlpha = 1;
}
function stone(id: string, x: number, y: number, size = 12, a = 1): void {
  const [sx, sy] = srcOf(id);
  g.globalAlpha = a;
  g.drawImage(sheet, sx, sy, 24, 24, Math.round(x), Math.round(y), size, size);
  g.globalAlpha = 1;
}
function pic(k: string, x: number, y: number, w: number, h: number, a = 1): void {
  const p = pics[k];
  if (!p || !p.complete) return;
  g.globalAlpha = a;
  g.drawImage(p, Math.round(x), Math.round(y), w, h);
  g.globalAlpha = 1;
}
function glow(x: number, y: number, r: number, color: string, a: number): void {
  if (a <= 0.003) return;
  g.save();
  g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = Math.min(1, a);
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
}
/** A four-pointed spark, the game's twinkle. */
function spark(x: number, y: number, n: number, c: string, a = 1): void {
  g.globalAlpha = a;
  g.fillStyle = c;
  g.fillRect(x - 0.5, y - n, 1, n * 2 + 1);
  g.fillRect(x - n, y - 0.5, n * 2 + 1, 1);
  g.globalAlpha = 1;
}
const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const roman = (n: number) => ['', 'I', 'II', 'III', 'IV', 'V'][n] ?? String(n);

// ---------------------------------------------------------------- hits and the pointer
interface Hit { x: number; y: number; w: number; h: number; tap?: () => void; hold?: () => void; drag?: string; id?: string; scroll?: Scroller; vscroll?: boolean; thumb?: Lib; hscroll?: Lib; data?: unknown }
interface Scroller { get: () => number; set: (v: number) => void; max: () => number; vel: number }
let hits: Hit[] = [];
const hit = (h: Hit) => { hits.push(h); return h; };
const inR = (h: { x: number; y: number; w: number; h: number }, x: number, y: number) => x >= h.x && y >= h.y && x < h.x + h.w && y < h.y + h.h;
function topHit(x: number, y: number): Hit | null {
  for (let i = hits.length - 1; i >= 0; i--) if (inR(hits[i], x, y)) return hits[i];
  return null;
}
interface Ptr { sx: number; sy: number; x: number; y: number; t0: number; hit: Hit | null; mode: 'pending' | 'scroll' | 'hscroll' | 'drag' | 'thumb' | 'held' | 'none'; start: number; lastY: number; lastX: number; lastT: number; vel: number }
let P: Ptr | null = null;
let carry: { id: string; x: number; y: number } | null = null;
let mouse = { x: -99, y: -99 };
const HOLD = 0.42;

// ---------------------------------------------------------------- THE RUNE BAG (a half of the screen)
type Sort = 'GROUP' | 'A-Z' | 'MOST' | 'NEW';
interface Lib {
  x: number; group: string; sort: Sort; q: string; scroll: number; vel: number; sel: string | null; card: string | null; cardT: number;
  cardScroll: number; made: string[]; chipScroll: number; open: boolean; openT: number; flashId: string | null; flashT: number; layout: LibLayout | null;
  bubbleT: number; closeable: boolean; atSmith: boolean;
}
interface LibItem { head?: string; count?: number; id?: string; x: number; y: number }
interface LibLayout { items: LibItem[]; H: number; heads: { y: number; title: string }[] }
const newLib = (x: number, closeable: boolean, atSmith: boolean): Lib => ({
  x, group: 'ALL', sort: 'GROUP', q: '', scroll: 0, vel: 0, sel: null, card: null, cardT: 0, cardScroll: 0, made: [], chipScroll: 0, open: true,
  openT: -1, flashId: null, flashT: -9, layout: null, bubbleT: -9, closeable, atSmith,
});
const libBag = newLib(0, true, false);
const libSmith = newLib(HALF, false, true);

// its measures (game pixels, from the half's left edge)
const L_HEAD = 21, RAIL_X = 2, RAIL_W = 29, RAIL_H = 34, GRID_X = 35, GRID_R = 233, TILE_W = 39.6, TILE_H = 38, HEAD_H = 12;
const gridTop = (L: Lib) => (L.group === 'MELDS' && !L.q ? 58 : 40);
const gridBottom = 267;

function libFilter(L: Lib): { sections: { title: string; ids: string[] }[] } {
  let ids = RUNES.filter((r) => held[r.id] > 0).map((r) => r.id);
  if (L.group !== 'ALL') ids = ids.filter((id) => R[id].group === L.group);
  if (L.group === 'MELDS' && L.made.length && !L.q) ids = ids.filter((id) => L.made.every((m) => R[id].of?.includes(m)));
  const byName = (a: string, b: string) => R[a].name.localeCompare(R[b].name);
  const q = L.q.trim().toLowerCase();
  if (q) {
    const names: string[] = [], made: string[] = [], does: string[] = [];
    let madeName = '';
    for (const id of ids) {
      const r = R[id];
      if ((r.name + ' ' + r.f + ' ' + r.id).toLowerCase().includes(q)) { names.push(id); continue; }
      const parents = r.of ?? (r.rankOf ? [r.rankOf] : []);
      const p = parents.find((p) => (R[p].name + ' ' + R[p].id + ' ' + R[p].f).toLowerCase().includes(q));
      if (p) { made.push(id); madeName = madeName || R[p].name.toUpperCase(); continue; }
      if ((r.about + ' ' + r.front + ' ' + r.behind + ' ' + r.monster).toLowerCase().includes(q)) does.push(id);
    }
    const out = [] as { title: string; ids: string[] }[];
    if (names.length) out.push({ title: 'NAMED', ids: names.sort(byName) });
    if (made.length) out.push({ title: 'MADE WITH ' + madeName, ids: made.sort(byName) });
    if (does.length) out.push({ title: 'WHAT THEY DO', ids: does.sort(byName) });
    return { sections: out };
  }
  if (L.sort === 'A-Z' || (L.sort === 'GROUP' && L.group === 'MELDS')) {
    const title = L.group === 'MELDS' && L.made.length ? 'MADE WITH ' + L.made.map((m) => R[m].name.toUpperCase()).join(' AND ') : L.group === 'MELDS' ? 'MELDS, A TO Z' : 'A TO Z';
    return { sections: [{ title, ids: ids.sort(byName) }] };
  }
  if (L.sort === 'MOST') return { sections: [{ title: 'MOST HELD FIRST', ids: ids.sort((a, b) => held[b] - held[a] || byName(a, b)) }] };
  if (L.sort === 'NEW') return { sections: [{ title: 'NEWEST FIRST', ids: ids.sort((a, b) => got[b] - got[a]) }] };
  // GROUP: each group in its own section, the base runes in the Lexicon's order with each rank after its rune, the melds A to Z
  const order = (id: string) => { const r = R[id]; const b = r.rankOf ?? id; return BASE_ORDER.indexOf(b) * 10 + (r.rank ?? 1); };
  const out: { title: string; ids: string[] }[] = [];
  for (const grp of GROUPS.slice(1)) {
    const in_ = ids.filter((id) => R[id].group === grp);
    if (!in_.length) continue;
    in_.sort(grp === 'MELDS' ? byName : (a, b) => order(a) - order(b));
    out.push({ title: grp, ids: in_ });
  }
  return { sections: out };
}
function libLay(L: Lib): LibLayout {
  const { sections } = libFilter(L);
  const items: LibItem[] = [];
  const heads: { y: number; title: string }[] = [];
  let y = 0;
  for (const s of sections) {
    items.push({ head: s.title, count: s.ids.length, x: 0, y });
    heads.push({ y, title: s.title });
    y += HEAD_H;
    s.ids.forEach((id, i) => {
      items.push({ id, x: GRID_X + (i % 5) * TILE_W, y: y + Math.floor(i / 5) * TILE_H });
    });
    y += Math.ceil(s.ids.length / 5) * TILE_H + 2;
  }
  return { items, H: y, heads };
}
const libMax = (L: Lib) => Math.max(0, (L.layout?.H ?? 0) - (gridBottom - gridTop(L)));
function libReset(L: Lib): void { L.scroll = 0; L.vel = 0; L.layout = libLay(L); }

/** The name under a stone in a tile: on one line, or broken in two. */
const STARTS = new Set(['FR', 'ST', 'BR', 'TR', 'SH', 'CH', 'TH', 'GL', 'PL', 'CR', 'SL', 'SP', 'SN', 'DR', 'GR', 'BL', 'CL', 'FL', 'KN', 'WH', 'QU', 'SW', 'SC', 'SK', 'SM', 'WR']);
const VOW = new Set([...'AEIOUY']);
function tileName(name: string): string[] {
  const s = name.toUpperCase();
  if (tw(s, 'small') <= 37) return [s];
  const sp = s.indexOf(' ');
  if (sp > 0) return [s.slice(0, sp), s.slice(sp + 1)];
  // a long word broken where a word inside it begins, as near its middle as may be
  let best = Math.ceil(s.length / 2), score = -99;
  for (let k = 3; k <= s.length - 3; k++) {
    const a = s[k - 1], b = s[k];
    let v = a === b ? 3 : !VOW.has(a) && !VOW.has(b) ? 2 : VOW.has(a) && !VOW.has(b) ? 1 : 0;
    if (STARTS.has(s.slice(k, k + 2))) v += 1.5;
    if (STARTS.has(a + b)) v -= 2;
    v -= Math.abs(k - s.length / 2) * 0.3;
    if (tw(s.slice(0, k) + '-', 'small') > 38 || tw(s.slice(k), 'small') > 38) v -= 9;
    if (v > score) { score = v; best = k; }
  }
  return [s.slice(0, best) + '-', s.slice(best)];
}

function drawTile(L: Lib, id: string, x: number, y: number, interactive: boolean): void {
  const r = R[id];
  const n = held[id];
  const sel = L.sel === id;
  const over = inR({ x, y, w: TILE_W, h: TILE_H }, mouse.x, mouse.y);
  const lift = sel ? 1 : 0;
  const yy = y - lift;
  box(x + 1, yy + 1, TILE_W - 2, TILE_H - 2, sel ? C.PICK_BG : over ? C.BG2 : C.BOX, sel ? C.PICK : r.color, sel ? 1 : 1);
  if (!sel) { g.globalAlpha = 0.55; box(x + 1, yy + 1, TILE_W - 2, TILE_H - 2, null, C.PANEL); g.globalAlpha = 1; box(x + 1, yy + 1, TILE_W - 2, TILE_H - 2, null, r.color, 0.45); }
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.fillRect(x + 2, yy + 2, TILE_W - 4, 1);
  // the flash of a rune just made, landing
  if (L.flashId === id) {
    const k = now - L.flashT;
    if (k < 1.6) { glow(x + TILE_W / 2, yy + 14, 26, C.PICK, (1 - k / 1.6) * 0.9); }
  }
  stone(id, x + (TILE_W - 24) / 2, yy + 3, 24);
  const partner = L.atSmith && !meld ? (hin[0] && !hin[1] ? hin[0] : !hin[0] && hin[1] ? hin[1] : null) : null;
  let unmeldable = false;
  if (partner) {
    const res = id === partner ? (held[id] >= 2 ? makes(id, id) : null) : makes(partner, id);
    if (!res) unmeldable = true;
    else if (!known.has(res)) { const b = 0.5 + 0.5 * Math.sin(now * 4); T('?', x + TILE_W - 10, yy + 3, b > 0.5 ? C.PICK : C.WHITE, { shadow: C.INK }); }
    else { box(x + 1, yy + 1, TILE_W - 2, TILE_H - 2, null, C.PICK_LO); }
  }
  if (n > 1) T(String(n), x + TILE_W - 5, yy + 20, C.WHITE, { font: 'small', align: 'right', shadow: C.INK });
  if (r.rank) T(roman(r.rank), x + 6, yy + 3, C.WHITE, { font: 'small', shadow: C.INK });
  const lines = tileName(r.rankOf ? R[r.rankOf].name : r.name);
  const ny = lines.length > 1 ? yy + 26 : yy + 29;
  lines.forEach((l, i) => T(l, Math.round(x + TILE_W / 2), ny + i * 5.5, sel ? C.PICK : r.color, { font: 'small', align: 'center' }));
  if (unmeldable) { g.fillStyle = 'rgba(14,12,36,0.7)'; g.fillRect(x + 1, yy + 1, TILE_W - 2, TILE_H - 2); }
  if (fresh.has(id)) {
    const tw_ = 0.5 + 0.5 * Math.sin(now * 5 + r.s);
    spark(x + 6, yy + 6, 1 + Math.round(tw_ * 2), C.PICK, 0.6 + 0.4 * tw_);
  }
  // the hold filling round the tile
  if (interactive && P && P.mode === 'pending' && P.hit?.id === id && P.hit.data === L) {
    const k = clamp01((now - P.t0 - 0.08) / (HOLD - 0.08));
    if (k > 0) holdRing(x + 1, yy + 1, TILE_W - 2, TILE_H - 2, k);
  }
}
function holdRing(x: number, y: number, w: number, h: number, k: number): void {
  const per = 2 * (w + h);
  let left = per * k;
  g.fillStyle = C.PICK;
  const seg = (sx: number, sy: number, dx: number, dy: number, len: number) => {
    const l = Math.min(left, len); if (l <= 0) return;
    if (dx) g.fillRect(dx > 0 ? sx : sx - l, sy, l, 1); else g.fillRect(sx, dy > 0 ? sy : sy - l, 1, l);
    left -= l;
  };
  seg(x + w / 2, y, 1, 0, w / 2); seg(x + w - 1, y, 0, 1, h); seg(x + w, y + h - 1, -1, 0, w); seg(x, y + h, 0, -1, h); seg(x, y, 1, 0, w / 2);
  glow(x + w / 2, y + h / 2, 22, C.PICK, k * 0.35);
}

function drawLib(L: Lib): void {
  if (!L.open) return;
  const slide = L.openT >= 0 ? ease((now - L.openT) / 0.22) : 1;
  const ox = L.x - (1 - slide) * HALF;
  g.save();
  g.translate(ox, 0);
  const X0 = L.x;
  // panel
  g.fillStyle = C.PANEL;
  g.fillRect(0, 0, HALF, H);
  box(0, 0, HALF, H, null, C.EDGE);
  g.fillStyle = C.PICK_LO; g.fillRect(2, 1, HALF - 4, 0.5);
  hit({ x: X0, y: 0, w: HALF, h: H }); // the panel holds what is pressed on it
  // head: RUNES, how many, the sort, (closing)
  T('RUNES', 5, 6, C.PICK);
  T(`${heldCount()} HELD`, 5 + tw('RUNES') + 5, 8, C.DIM, { font: 'small' });
  let rx = HALF - 4;
  if (L.closeable) {
    rx -= 15;
    const r = { x: rx, y: 3, w: 15, h: 14 };
    box(r.x, r.y, r.w, r.h, C.BOX, C.EDGE);
    g.fillStyle = C.TEXT;
    for (let i = 0; i < 5; i++) { g.fillRect(r.x + 5 + i, r.y + 4 + i, 1, 1); g.fillRect(r.x + 9 - i, r.y + 4 + i, 1, 1); }
    hit({ x: X0 + r.x, y: r.y, w: r.w, h: r.h, tap: () => { L.open = false; L.card = null; } });
    rx -= 3;
  }
  const sortLabel = 'SORT ' + L.sort;
  const sw = tw(sortLabel, 'small') + 10;
  rx -= sw;
  box(rx, 3, sw, 14, C.BOX, C.EDGE_HI);
  T(sortLabel, rx + 5, 8, C.TEXT, { font: 'small' });
  hit({ x: X0 + rx, y: 3, w: sw, h: 14, tap: () => { const o: Sort[] = ['GROUP', 'A-Z', 'MOST', 'NEW']; L.sort = o[(o.indexOf(L.sort) + 1) % o.length]; libReset(L); } });
  // the search
  const sr = { x: GRID_X, y: L_HEAD, w: GRID_R - GRID_X + 3, h: 15 };
  const typing = searchFor === L && document.activeElement === input;
  box(sr.x, sr.y, sr.w, sr.h, C.INK, typing ? C.PICK : C.EDGE_HI);
  // a magnifying glass
  g.fillStyle = L.q ? C.PICK : C.DIM;
  const mx = sr.x + 5, my = sr.y + 4;
  g.fillRect(mx + 1, my, 3, 1); g.fillRect(mx + 1, my + 4, 3, 1); g.fillRect(mx, my + 1, 1, 3); g.fillRect(mx + 4, my + 1, 1, 3);
  g.fillRect(mx + 5, my + 5, 1, 1); g.fillRect(mx + 6, my + 6, 1, 1);
  if (L.q) {
    T(L.q.toUpperCase(), sr.x + 15, sr.y + 4, C.TEXT);
    if (typing && Math.floor(now * 2) % 2 === 0) { g.fillStyle = C.PICK; g.fillRect(sr.x + 16 + tw(L.q.toUpperCase()), sr.y + 3, 1, 9); }
    const n = (L.layout?.items ?? []).filter((i) => i.id).length;
    const cx = sr.x + sr.w - 13;
    T(`${n} FOUND`, cx - 4, sr.y + 5, C.DIM, { font: 'small', align: 'right' });
    box(cx, sr.y + 2, 11, 11, C.BG2, null);
    g.fillStyle = C.TEXT;
    for (let i = 0; i < 5; i++) { g.fillRect(cx + 3 + i, sr.y + 5 + i, 1, 1); g.fillRect(cx + 7 - i, sr.y + 5 + i, 1, 1); }
    hit({ x: X0 + sr.x, y: sr.y, w: sr.w - 16, h: sr.h, tap: () => focusSearch(L) });
    hit({ x: X0 + cx - 2, y: sr.y, w: 15, h: sr.h, tap: () => { L.q = ''; input.value = ''; libReset(L); } });
  } else {
    T(typing ? '' : 'SEARCH A NAME, A RUNE IN IT, WHAT IT DOES', sr.x + 15, sr.y + 5, C.FAINT, { font: 'small' });
    if (typing && Math.floor(now * 2) % 2 === 0) { g.fillStyle = C.PICK; g.fillRect(sr.x + 15, sr.y + 3, 1, 9); }
    hit({ x: X0 + sr.x, y: sr.y, w: sr.w, h: sr.h, tap: () => focusSearch(L) });
  }
  // the rail of groups
  const counts: Record<string, number> = { ALL: 0 };
  const q = L.q.trim().toLowerCase();
  if (q) {
    const save = L.group; L.group = 'ALL';
    for (const it of libLay(L).items) if (it.id) { counts.ALL++; counts[R[it.id].group] = (counts[R[it.id].group] ?? 0) + 1; }
    L.group = save;
  } else {
    for (const r of RUNES) if (held[r.id] > 0) { counts.ALL++; counts[r.group] = (counts[r.group] ?? 0) + 1; }
  }
  GROUPS.forEach((grp, i) => {
    const r = { x: RAIL_X, y: L_HEAD + i * (RAIL_H + 1.4), w: RAIL_W, h: RAIL_H };
    const on = L.group === grp;
    const c = counts[grp] ?? 0;
    box(r.x, r.y, r.w, r.h, on ? C.PICK_BG : C.BOX, on ? C.PICK : C.EDGE);
    if (on) { g.fillStyle = C.PICK; g.fillRect(r.x + r.w - 1, r.y + 3, 1, r.h - 6); }
    const icx = r.x + Math.round((r.w - 12) / 2);
    if (grp === 'ALL') {
      // a little book: every rune
      g.fillStyle = on ? C.PICK : C.DIM;
      g.fillRect(icx + 1, r.y + 4, 4, 9); g.fillRect(icx + 7, r.y + 4, 4, 9);
      g.fillStyle = on ? C.PICK_BG : C.BOX;
      g.fillRect(icx + 2, r.y + 6, 2, 1); g.fillRect(icx + 2, r.y + 8, 2, 1); g.fillRect(icx + 8, r.y + 6, 2, 1); g.fillRect(icx + 8, r.y + 8, 2, 1);
      g.fillStyle = on ? C.PICK_LO : C.FAINT; g.fillRect(icx + 5, r.y + 5, 2, 9);
    } else stone(GROUP_ICON[grp], icx, r.y + 3, 12, c ? 1 : 0.35);
    T(grp, r.x + r.w / 2, r.y + 18, on ? C.PICK : c ? C.TEXT : C.FAINT, { font: 'small', align: 'center' });
    T(String(c), r.x + r.w / 2, r.y + 25, on ? C.PICK : C.DIM, { font: 'small', align: 'center' });
    hit({ x: X0 + r.x, y: r.y, w: r.w, h: r.h, tap: () => { L.group = grp; L.made = []; L.chipScroll = 0; L.card = null; libReset(L); } });
  });
  // MADE WITH, over the melds: the runes they are made of
  if (L.group === 'MELDS' && !L.q) {
    const y0 = 40;
    T('MADE WITH', GRID_X, y0 + 1, C.DIM, { font: 'small' });
    if (L.made.length) {
      const cl = 'CLEAR';
      const cw = tw(cl, 'small') + 6;
      T(cl, GRID_R + 2, y0 + 1, C.PICK, { font: 'small', align: 'right' });
      hit({ x: X0 + GRID_R - cw + 2, y: y0 - 2, w: cw, h: 9, tap: () => { L.made = []; libReset(L); } });
    } else T('PICK ONE OR TWO', GRID_R + 2, y0 + 1, C.FAINT, { font: 'small', align: 'right' });
    const cy = y0 + 7;
    const base = BASE_ORDER;
    const cx0 = GRID_X;
    const vw = GRID_R + 3 - cx0;
    const full = base.length * 14;
    L.chipScroll = Math.max(0, Math.min(full - vw, L.chipScroll));
    g.save();
    g.beginPath(); g.rect(cx0, cy - 1, vw, 12); g.clip();
    base.forEach((b, i) => {
      const x = cx0 + i * 14 - L.chipScroll;
      if (x < cx0 - 14 || x > cx0 + vw) return;
      const on = L.made.includes(b);
      if (on) { box(x - 1, cy - 1, 13, 12, C.PICK_BG, C.PICK); }
      stone(b, x, cy - 0.5, 11, on || L.made.length < 2 ? 1 : 0.4);
    });
    g.restore();
    hit({ x: X0 + cx0, y: cy - 2, w: vw, h: 13, hscroll: L, tap: undefined, data: { chips: true } });
    // the fade at the row's ends: there is more
    if (L.chipScroll > 0) { g.fillStyle = C.PICK; g.fillRect(cx0 - 2, cy + 2, 1, 5); }
    if (L.chipScroll < full - vw - 1) { g.fillStyle = C.PICK; g.fillRect(cx0 + vw + 1, cy + 2, 1, 5); }
  }
  // the grid
  if (!L.layout) L.layout = libLay(L);
  const top = gridTop(L);
  const vh = gridBottom - top;
  g.save();
  g.beginPath(); g.rect(GRID_X - 1, top, GRID_R - GRID_X + 4, vh); g.clip();
  const lay = L.layout;
  if (!lay.items.length) {
    T(L.q ? 'NO RUNE OF YOURS MATCHES' : 'NONE HELD', GRID_X + 100, top + 30, C.FAINT, { font: 'small', align: 'center' });
  }
  for (const it of lay.items) {
    const y = top + it.y - L.scroll;
    if (y > gridBottom || y + TILE_H < top) continue;
    if (it.head !== undefined) {
      T(it.head, GRID_X + 1, y + 3, C.DIM, { font: 'small' });
      const hw = tw(it.head, 'small');
      T(String(it.count), GRID_X + hw + 5, y + 3, C.FAINT, { font: 'small' });
      g.fillStyle = C.EDGE;
      g.fillRect(GRID_X + hw + 10 + tw(String(it.count), 'small'), y + 5, GRID_R - (GRID_X + hw + 10 + tw(String(it.count), 'small')), 1);
      continue;
    }
    const id = it.id!;
    if (carry && carry.id === id && held[id] <= 1) { box(it.x + 1, y + 1, TILE_W - 2, TILE_H - 2, null, C.EDGE); continue; }
    drawTile(L, id, it.x, y, true);
    if (y + TILE_H > top && y < gridBottom) {
      const ty = Math.max(top, y), th = Math.min(gridBottom, y + TILE_H) - ty;
      hit({ x: X0 + it.x, y: ty, w: TILE_W, h: th, id, data: L, drag: id, scroll: libScroller(L), vscroll: true, tap: () => tapRune(L, id), hold: () => openCard(L, id) });
    }
  }
  g.restore();
  // the scroll bar: held and drawn down, it runs through the whole bag at once
  const max = libMax(L);
  if (max > 0) {
    const bx = GRID_R + 4;
    const th = Math.max(18, (vh * vh) / lay.H);
    const ty = top + (vh - th) * (L.scroll / max);
    g.fillStyle = C.INK; g.fillRect(bx, top, 3, vh);
    const active = P?.mode === 'thumb' && P.hit?.thumb === L;
    box(bx - 0.5, ty, 4, th, active ? C.PICK : C.EDGE_HI, null);
    hit({ x: X0 + bx - 6, y: top, w: 12, h: vh, thumb: L });
    // the bubble: where in the bag
    if (active || now - L.bubbleT < 0.6) {
      let title = lay.heads[0]?.title ?? '';
      for (const h of lay.heads) if (h.y <= L.scroll + 4) title = h.title;
      const first = lay.items.find((i) => i.id && i.y + TILE_H > L.scroll + 4);
      if (first?.id && (lay.heads.length === 1 || (L.sort === 'GROUP' && title === 'MELDS'))) title = L.sort === 'MOST' ? 'x' + held[first.id] : L.sort === 'NEW' ? 'NEWER' : R[first.id].name[0].toUpperCase();
      const bw = Math.max(22, tw(title) + 12);
      const by = Math.round(ty + th / 2 - 9);
      box(bx - 8 - bw, by, bw, 18, C.PICK_BG, C.PICK);
      g.fillStyle = C.PICK; g.fillRect(bx - 8, by + 7, 4, 4);
      T(title, bx - 8 - bw / 2, by + 5, C.TEXT, { align: 'center' });
    }
  }
  if (L.card) drawCard(L);
  g.restore();
}
function libScroller(L: Lib): Scroller {
  return { get: () => L.scroll, set: (v) => { L.scroll = Math.max(0, Math.min(libMax(L), v)); }, max: () => libMax(L), vel: 0 };
}

// ---------------------------------------------------------------- a rune's card (pressed and held)
function openCard(L: Lib, id: string): void {
  L.card = id; L.cardT = now; L.cardScroll = 0;
  if (navigator.vibrate) try { navigator.vibrate(12); } catch { /* none */ }
}
const CARD = { x: GRID_X - 2, y: L_HEAD - 1, w: GRID_R - GRID_X + 9, h: H - L_HEAD - 1 };
function cardLines(id: string, w: number): { kind: 'cap' | 'text' | 'dim' | 'gap' | 'of'; s: string; c?: string }[] {
  const r = R[id];
  const out: { kind: 'cap' | 'text' | 'dim' | 'gap' | 'of'; s: string; c?: string }[] = [];
  if (r.of || r.rankOf) out.push({ kind: 'of', s: '' });
  if (r.about) for (const l of wrapText(r.about, w)) out.push({ kind: 'dim', s: l });
  const sec = (cap: string, text: string, c: string, tc: 'text' | 'dim') => {
    if (!text) return;
    out.push({ kind: 'gap', s: '' });
    out.push({ kind: 'cap', s: cap, c });
    for (const l of wrapText(text, w)) out.push({ kind: tc, s: l });
  };
  sec('IN FRONT OF A MOVE', r.front, C.PICK, 'text');
  sec('BEHIND A MOVE', r.behind, C.PICK, 'text');
  sec('ON A MONSTER', r.monster, C.FOE, 'dim');
  return out;
}
function drawCard(L: Lib): void {
  const id = L.card!;
  const r = R[id];
  const X0 = L.x;
  const k = ease((now - L.cardT) / 0.16);
  // the shade over the bag behind it; pressed, it puts the card away
  g.fillStyle = 'rgba(7,5,10,' + (0.55 * k).toFixed(3) + ')';
  g.fillRect(1, 1, HALF - 2, H - 2);
  hit({ x: X0, y: 0, w: HALF, h: H, tap: () => { L.card = null; } });
  const cw = CARD.w, ch = CARD.h;
  const cx = CARD.x, cy = CARD.y + Math.round((1 - k) * 8);
  g.globalAlpha = k;
  g.fillStyle = 'rgba(7,5,10,0.6)'; g.fillRect(cx + 3, cy + 3, cw, ch);
  box(cx, cy, cw, ch, C.BOX, r.color);
  box(cx + 1, cy + 1, cw - 2, ch - 2, null, C.PANEL, 0.6);
  hit({ x: X0 + cx, y: cy, w: cw, h: ch });
  // its stone, large, in its light
  const pulse = 0.5 + 0.5 * Math.sin(now * 3);
  glow(cx + 24, cy + 24, 30, r.color, 0.25 + 0.15 * pulse);
  box(cx + 5, cy + 5, 40, 40, C.INK, r.color, 0.9);
  stone(id, cx + 7, cy + 7, 36);
  // its name and what it is
  const nm = r.name.toUpperCase();
  const big = tw(nm, 'normal', 2) <= cw - 56;
  T(nm, cx + 50, cy + (big ? 7 : 10), r.color, { scale: big ? 2 : 1, shadow: C.INK });
  const what = r.rankOf ? `RANK ${roman(r.rank ?? 2)} OF ${R[r.rankOf].name.toUpperCase()}` : r.of ? 'MELDED RUNE' : `${r.group} RUNE`;
  T(what, cx + 50, cy + 26, C.DIM, { font: 'small' });
  if (r.attr) T('GROWS WITH ' + ATTR[r.attr], cx + 50, cy + 33, C.FAINT, { font: 'small' });
  T(`YOU HAVE ${held[id]}`, cx + 50, cy + 40, C.TEXT, { font: 'small' });
  if (fresh.has(id)) T('NEW', cx + 50 + tw(`YOU HAVE ${held[id]}`, 'small') + 6, cy + 40, C.PICK, { font: 'small' });
  // its page, which runs on under the buttons if it is long
  const bw = cw - 12;
  const lines = cardLines(id, bw);
  const top = cy + 50, bottom = cy + ch - 20;
  let y = 0;
  const hs = lines.map((l) => (l.kind === 'gap' ? 3 : l.kind === 'cap' ? 7 : l.kind === 'of' ? 15 : 9));
  const total = hs.reduce((a, b) => a + b, 0);
  const maxS = Math.max(0, total - (bottom - top));
  L.cardScroll = Math.max(0, Math.min(maxS, L.cardScroll));
  g.save();
  g.beginPath(); g.rect(cx + 2, top, cw - 4, bottom - top); g.clip();
  lines.forEach((l, i) => {
    const ly = top + y - L.cardScroll;
    y += hs[i];
    if (ly > bottom || ly + hs[i] < top) return;
    if (l.kind === 'cap') T(l.s, cx + 6, ly + 1, l.c ?? C.PICK, { font: 'small' });
    else if (l.kind === 'text') T(l.s, cx + 6, ly, C.TEXT);
    else if (l.kind === 'dim') T(l.s, cx + 6, ly, C.DIM);
    else if (l.kind === 'of') {
      const parts = r.of ?? [r.rankOf!, r.rankOf!];
      let x = cx + 6;
      T(r.of ? 'MADE OF' : 'TWO OF', x, ly + 4, C.DIM, { font: 'small' });
      x += tw(r.of ? 'MADE OF' : 'TWO OF', 'small') + 5;
      parts.forEach((p, j) => {
        if (j === 1) { T(r.of ? '+' : '+', x, ly + 2, C.DIM); x += 9; }
        const pw = 16 + tw(R[p].name.toUpperCase());
        box(x - 2, ly, pw + 4, 14, C.BG2, R[p].color, 0.9);
        stone(p, x, ly + 1, 12);
        T(R[p].name.toUpperCase(), x + 15, ly + 3, R[p].color);
        hit({ x: X0 + x - 2, y: Math.max(top, ly), w: pw + 4, h: 14, tap: () => openCard(L, p) });
        x += pw + 8;
      });
    }
  });
  g.restore();
  if (maxS > 0) {
    hit({ x: X0 + cx, y: top, w: cw, h: bottom - top, scroll: { get: () => L.cardScroll, set: (v) => { L.cardScroll = v; }, max: () => maxS, vel: 0 }, vscroll: true });
    const th = Math.max(10, ((bottom - top) * (bottom - top)) / total);
    g.fillStyle = C.EDGE_HI; g.fillRect(cx + cw - 4, top + (bottom - top - th) * (L.cardScroll / maxS), 2, th);
    if (L.cardScroll < maxS - 1) { g.fillStyle = 'rgba(26,22,72,0.9)'; g.fillRect(cx + 2, bottom - 4, cw - 8, 4); }
  }
  // its buttons
  const btns: { label: string; act: () => void; call?: boolean }[] = [];
  if (L.atSmith) btns.push({ label: 'TO THE MELD', act: () => { layIn(id); L.card = null; }, call: true });
  else if (!r.of && !r.rankOf && RUNES.some((m) => m.of?.includes(id) && held[m.id] > 0))
    btns.push({ label: 'SHOW ITS MELDS', act: () => { L.group = 'MELDS'; L.made = [id]; L.q = ''; L.card = null; L.chipScroll = Math.max(0, BASE_ORDER.indexOf(id) * 14 - 60); libReset(L); } });
  btns.push({ label: 'CLOSE', act: () => { L.card = null; } });
  let bx = cx + cw - 5;
  for (let i = btns.length - 1; i >= 0; i--) {
    const b = btns[i];
    const w = tw(b.label, 'small') + 12;
    bx -= w;
    const by = cy + ch - 17;
    box(bx, by, w, 13, b.call ? C.PRESS : C.BG2, b.call ? C.PRESS_HI : C.EDGE_HI);
    T(b.label, bx + w / 2, by + 4, C.WHITE, { font: 'small', align: 'center' });
    hit({ x: X0 + bx, y: by, w, h: 13, tap: b.act });
    bx -= 4;
  }
  T('HOLD A RUNE TO READ IT', cx + 6, cy + ch - 13, C.FAINT, { font: 'small' });
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- what pressing a rune does
function tapRune(L: Lib, id: string): void {
  if (L.atSmith) { layIn(id); return; }
  L.sel = L.sel === id ? null : id;
  if (fresh.has(id)) fresh.delete(id);
}
let searchFor: Lib | null = null;
const input = document.getElementById('search') as HTMLInputElement;
function focusSearch(L: Lib): void {
  searchFor = L;
  input.value = L.q;
  input.focus();
}
input.addEventListener('input', () => {
  if (!searchFor) return;
  searchFor.q = input.value.slice(0, 18);
  searchFor.card = null;
  libReset(searchFor);
});
input.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === 'Escape') input.blur(); });

// ---------------------------------------------------------------- THE GEAR SCREEN'S ATTACKS PAGE (the other half, as in the game)
interface Move { name: string; how: string; icon: string; nums: [string, string]; front: (string | null)[]; behind: (string | null)[] }
const moves: Move[] = [
  { name: 'STRIKE', how: 'TAP', icon: 'ability:strike', nums: ['8-13', '1.09/S'], front: ['eruption', null], behind: ['twin', null] },
  { name: 'WHIRL', how: 'HOLD', icon: 'ability:whirl', nums: ['11-18', '3.0 S'], front: ['frost', null], behind: [null, null] },
  { name: 'LUNGE', how: 'SWIPE', icon: 'ability:leap', nums: ['4-6', '3.9 S'], front: [null, null], behind: ['leech', null] },
];
let moveSel = 0;
let placeFlash: { i: number; side: 'front' | 'behind'; k: number; t: number } | null = null;
const recent = () => RUNES.filter((r) => held[r.id] > 0).sort((a, b) => got[b.id] - got[a.id]).slice(0, 10).map((r) => r.id);
function slotRect(i: number, side: 'front' | 'behind', k: number) {
  const y = 33 + i * 25;
  const x = side === 'front' ? 246 + k * 21 : 371 + k * 21;
  return { x, y, w: 19, h: 20 };
}
function place(i: number, side: 'front' | 'behind', k: number, id: string): void {
  const m = moves[i];
  const was = m[side][k];
  if (was) held[was]++;
  m[side][k] = id;
  held[id]--;
  placeFlash = { i, side, k, t: now };
  moveSel = i;
  libBag.layout = libLay(libBag);
}
function drawAttacks(): void {
  const x0 = HALF;
  g.fillStyle = C.PANEL; g.fillRect(x0, 0, HALF, H);
  g.fillStyle = C.EDGE; g.fillRect(x0, 0, 1, H);
  // its tabs
  const tabs = [['GEAR', 30], ['ATTACKS', 44], ['STATS', 32], ['TALENTS', 44]] as const;
  let tx = x0 + 5;
  for (const [t, w] of tabs) {
    const on = t === 'ATTACKS';
    box(tx, 3, w, 15, on ? C.HOT : C.BOX, on ? C.PICK : C.EDGE);
    T(t, tx + w / 2, 7, on ? C.PICK : C.TEXT, { align: 'center' });
    tx += w + 2;
  }
  box(x0 + HALF - 41, 3, 37, 15, C.PRESS, C.PRESS_HI);
  T('DONE', x0 + HALF - 22.5, 7, C.WHITE, { align: 'center' });
  T('IN FRONT', 266, 23, C.DIM, { font: 'small', align: 'center' });
  T('BEHIND', 391, 23, C.DIM, { font: 'small', align: 'center' });
  T('A HIT', 418, 23, C.DIM, { font: 'small' });
  const picked = libBag.open && libBag.sel ? libBag.sel : carry?.id ?? null;
  const over = carry ? slotAt(mouse.x, mouse.y) : null;
  moves.forEach((m, i) => {
    const y = 33 + i * 25;
    for (const side of ['front', 'behind'] as const)
      for (let k = 0; k < 2; k++) {
        const r = slotRect(i, side, k);
        const w = m[side][k];
        const lit = picked && (!over || (over.i === i && over.side === side && over.k === k));
        const blink = 0.5 + 0.5 * Math.sin(now * 6);
        box(r.x, r.y, r.w, r.h, lit ? C.PICK_BG : C.INK, lit ? (blink > 0.5 ? C.PICK : C.PICK_LO) : w ? R[w].color : C.EDGE);
        if (w) stone(w, r.x + 3.5, r.y + 4, 12);
        else { g.fillStyle = lit ? C.PICK : C.EDGE; g.fillRect(r.x + 6, r.y + 9.5, 7, 1); g.fillRect(r.x + 9, r.y + 6.5, 1, 7); }
        if (placeFlash && placeFlash.i === i && placeFlash.side === side && placeFlash.k === k) {
          const f = now - placeFlash.t;
          if (f < 0.6) { glow(r.x + 9.5, r.y + 10, 18, C.PICK, (1 - f / 0.6) * 0.9); for (let s = 0; s < 6; s++) { const a = s * 1.05 + 0.3; spark(r.x + 9.5 + Math.cos(a) * (6 + f * 30), r.y + 10 + Math.sin(a) * (6 + f * 30), 1, C.PICK, 1 - f / 0.6); } }
        }
        hit({ x: r.x, y: r.y, w: r.w, h: r.h, tap: () => {
          if (libBag.open && libBag.sel && held[libBag.sel] > 0) { place(i, side, k, libBag.sel); libBag.sel = held[libBag.sel] > 0 ? libBag.sel : null; }
          else if (w) { held[w]++; m[side][k] = null; libBag.layout = libLay(libBag); }
        } });
      }
    const pr = { x: 288, y, w: 81, h: 20 };
    const on = i === moveSel;
    box(pr.x, pr.y, pr.w, pr.h, on ? C.HOT : C.BG2, on ? C.PICK : C.EDGE_HI);
    pic(m.icon, pr.x + 2, pr.y + 2, 16, 16);
    T(m.name, pr.x + 21, pr.y + 3, C.TEXT);
    T(m.how, pr.x + 21, pr.y + 12, C.DIM, { font: 'small' });
    hit({ x: pr.x, y: pr.y, w: pr.w, h: pr.h, tap: () => { moveSel = i; } });
    T(m.nums[0], 418, y + 2, C.TEXT);
    T(m.nums[1], 418, y + 12, C.DIM, { font: 'small' });
  });
  // the move picked: its whole name in its runes' colours
  const m = moves[moveSel];
  const parts: { s: string; c: string; small?: boolean }[] = [];
  for (const w of m.front) if (w) parts.push({ s: R[w].f.toUpperCase(), c: R[w].color });
  parts.push({ s: m.name, c: C.TEXT });
  const bh = m.behind.filter(Boolean) as string[];
  bh.forEach((w, j) => { parts.push({ s: j ? 'and' : 'of', c: C.DIM, small: true }); parts.push({ s: R[w].f.toUpperCase(), c: R[w].color }); });
  let nx = x0 + 6;
  for (const p of parts) { T(p.s, nx, p.small ? 112 : 110, p.c, { font: p.small ? 'small' : 'normal' }); nx += tw(p.s, p.small ? 'small' : 'normal') + 4; }
  const desc = moveSel === 0 ? 'Hits one enemy in front of you.' : moveSel === 1 ? 'Spins, cutting all round you.' : 'Flung toward where you point.';
  T(desc, x0 + 6, 121, C.DIM);
  // the runes found last, at hand
  T('LATEST RUNES', x0 + 6, 136, C.DIM, { font: 'small' });
  recent().forEach((id, j) => {
    const x = x0 + 6 + j * 21;
    box(x, 143, 19, 19, C.BOX, R[id].color, 0.8);
    stone(id, x + 3.5, 146.5, 12);
    if (held[id] > 1) T(String(held[id]), x + 18, 156, C.WHITE, { font: 'small', align: 'right', shadow: C.INK });
    hit({ x, y: 143, w: 19, h: 19, id, data: libBag, drag: id, tap: () => { libBag.open = true; libBag.sel = libBag.sel === id ? null : id; }, hold: () => { libBag.open = true; openCard(libBag, id); } });
  });
  // the bag
  T('BAG', x0 + 6, 170, C.DIM, { font: 'small' });
  const items = ['helm:1', 'ring:2', 'boots:0', null, 'amulet:2', null, null, null, 'gloves:1', null, null, null, null, null, null, null];
  items.forEach((it, j) => {
    const x = x0 + 6 + (j % 8) * 20, y = 177 + Math.floor(j / 8) * 20;
    box(x, y, 19, 19, C.INK, C.EDGE);
    if (it) pic(it, x + 1.5, y + 1.5, 16, 16);
  });
  // gold and runedust
  pic('gold', 412, 178, 9, 7);
  T('1240', 424, 177, C.GOLD, { font: 'small' });
  dustIcon(412, 188, 0.6);
  T(String(dust), 424, 187, RUNE_DATA.dust, { font: 'small' });
  T('LEVEL 31', 412, 198, C.DIM, { font: 'small' });
  T('WARRIOR', 412, 205, C.FAINT, { font: 'small' });
  // RUNES: the bag of runes opened beside it (its picture is the LEXICON button's place)
  const br = { x: 380, y: 226, w: 94, h: 38 };
  const on = libBag.open;
  const p = 0.5 + 0.5 * Math.sin(now * 2.4);
  box(br.x, br.y, br.w, br.h, on ? C.PICK_BG : C.BG2, on ? C.PICK : C.EDGE_HI);
  glow(br.x + 18, br.y + 19, 18, C.PICK, on ? 0.25 + 0.15 * p : 0.1);
  stone('eruption', br.x + 5, br.y + 7, 24, 1);
  T('RUNES', br.x + 34, br.y + 8, on ? C.PICK : C.TEXT);
  T(`${heldCount()} HELD`, br.x + 34, br.y + 20, C.DIM, { font: 'small' });
  if (fresh.size) T(`${fresh.size} NEW`, br.x + 34, br.y + 27, C.PICK, { font: 'small' });
  hit({ x: br.x, y: br.y, w: br.w, h: br.h, tap: () => { libBag.open = !libBag.open; libBag.openT = now; libBag.card = null; } });
  const tip = libBag.sel ? `${R[libBag.sel].name.toUpperCase()} IN HAND: PRESS A SLOT` : 'PRESS A RUNE, THEN A SLOT. OR DRAG IT.';
  T(tip, x0 + 6, 220, libBag.sel ? C.PICK : C.FAINT, { font: 'small' });
}
function slotAt(x: number, y: number): { i: number; side: 'front' | 'behind'; k: number } | null {
  for (let i = 0; i < 3; i++) for (const side of ['front', 'behind'] as const) for (let k = 0; k < 2; k++) if (inR(slotRect(i, side, k), x, y)) return { i, side, k };
  return null;
}
function dustIcon(x: number, y: number, a: number): void {
  const pts = [[1, 5], [2, 4], [3, 5], [4, 3], [5, 4], [6, 5], [3, 2], [5, 2], [7, 4], [4, 5], [2, 5], [6, 3]];
  pts.forEach(([px, py], i) => {
    const tw_ = 0.5 + 0.5 * Math.sin(now * 4 + i * 1.7);
    g.fillStyle = tw_ > 0.8 ? '#ffffff' : RUNE_DATA.dust;
    g.globalAlpha = 0.6 + 0.4 * tw_;
    g.fillRect(x + px, y + py, 1, 1);
  });
  g.globalAlpha = 1;
  glow(x + 4, y + 4, 6, RUNE_DATA.dust, a * 0.3);
}

// ---------------------------------------------------------------- THE MELDING STONE (the wordsmith's half)
// His picks, 23 Nov 2026, of the first mock-up's melding: “The stone looks off, Too slow, Layout”; the layout: “Straight down”.
// So: one block of the slate his standing stones in town are cut from, its runes inlaid in cyan; the two hollows side by side
// at its top, two short channels straight down from them, turning in at their feet into the hollow beneath; the meld in about
// two seconds where it was three and a half.
const HA = { x: 87, y: 68 }, HB = { x: 153, y: 68 }, OUT = { x: 120, y: 172 };
const HS = 44, OS = 54;
/** The slab, in game pixels. */
const SLAB = { x: 34, y: 27, w: 172, h: 203 };
// his standing stones' slate, darkest to lightest (the town's ring, art/town.ts), and their runes' cyan
const SL = ['#0d1216', '#141b21', '#1b242b', '#232e36', '#2c3842', '#37444f', '#4a5964', '#66767f', '#8d9ca3'];
type Pt = { x: number; y: number };
function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x, y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y };
}
const CH_A = [{ x: HA.x, y: HA.y + HS / 2 - 1 }, { x: HA.x, y: 146 }, { x: HA.x + 1, y: 152 }, { x: OUT.x - 13, y: OUT.y - 24 }];
const CH_B = [{ x: HB.x, y: HB.y + HS / 2 - 1 }, { x: HB.x, y: 146 }, { x: HB.x - 1, y: 152 }, { x: OUT.x + 13, y: OUT.y - 24 }];
const N_PATH = 110;
const pathA: Pt[] = [], pathB: Pt[] = [];
for (let i = 0; i <= N_PATH; i++) {
  pathA.push(bez(CH_A[0], CH_A[1], CH_A[2], CH_A[3], i / N_PATH));
  pathB.push(bez(CH_B[0], CH_B[1], CH_B[2], CH_B[3], i / N_PATH));
}
// (the game's own runes, from its meld stones), carved beside the channels, outside them; they catch the light as it runs past
const GLYPHS: string[][] = RUNE_DATA.glyphs;
const INK_CH = (ch: string) => ch === 'X' || ch === 'o';
const MARKS: { x: number; y: number; t: number; side: 0 | 1; gl: number }[] = [];
for (const side of [0, 1] as const)
  [0.2, 0.55].forEach((t, j) => {
    const p = (side ? pathB : pathA)[Math.round(t * N_PATH)];
    MARKS.push({ x: Math.round(p.x + (side ? 10 : -17)), y: Math.round(p.y - 3), t, side, gl: (j * 2 + side) % GLYPHS.length });
  });
// the six standing stones of his ring, small, round the hollow beneath (none where the channels come in)
const STANDING = [-25, 25, 65, 115, 155, 205].map((d) => { const a = (d * Math.PI) / 180; return { a, x: OUT.x + Math.cos(a) * 41, y: OUT.y + 1 + Math.sin(a) * 32 }; });
// the corner runes of the slab's carved border
const CORNERS = [{ x: SLAB.x + 6, y: SLAB.y + 6 }, { x: SLAB.x + SLAB.w - 13, y: SLAB.y + 6 }, { x: SLAB.x + 6, y: SLAB.y + SLAB.h - 13 }, { x: SLAB.x + SLAB.w - 13, y: SLAB.y + SLAB.h - 13 }];

let slab: HTMLCanvasElement | null = null;
function makeSlab(): HTMLCanvasElement {
  let s = 23;
  const r = () => ((s = (s * 48271) % 2147483647) / 2147483647);
  // 1. the block, at the game's own grain: a chipped outline, lit from above, darker below, flecks of mica, cracks
  const gw = HALF, gh = H;
  const lo = document.createElement('canvas');
  lo.width = gw; lo.height = gh;
  const lx = lo.getContext('2d')!;
  const id = lx.createImageData(gw, gh);
  const px = id.data;
  const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const SLR = SL.map(hex);
  const put = (x: number, y: number, k: number, a = 255) => { if (x < 0 || y < 0 || x >= gw || y >= gh) return; const i = (y * gw + x) * 4; const c = SLR[Math.max(0, Math.min(SLR.length - 1, k))]; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = a; };
  // the chips along its edges: how far each row and column is cut in
  const chip = (n: number) => { const a: number[] = []; let v = 0; for (let i = 0; i < n; i++) { if (r() < 0.18) v = Math.floor(r() * 3); a.push(v); } return a; };
  const cl = chip(SLAB.h), cr = chip(SLAB.h), ct = chip(SLAB.w), cb = chip(SLAB.w);
  const inside = (x: number, y: number) => {
    const i = x - SLAB.x, j = y - SLAB.y;
    if (i < 0 || j < 0 || i >= SLAB.w || j >= SLAB.h) return false;
    const corner = Math.min(i, SLAB.w - 1 - i) + Math.min(j, SLAB.h - 1 - j);
    return i >= cl[j] && SLAB.w - 1 - i >= cr[j] && j >= ct[i] && SLAB.h - 1 - j >= cb[i] && corner >= 4;
  };
  // its shadow on the floor of the panel
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (!inside(x, y) && inside(x - 3, y - 3)) put(x, y, 0, 200);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = SLAB.y; y < SLAB.y + SLAB.h; y++)
    for (let x = SLAB.x; x < SLAB.x + SLAB.w; x++) {
      if (!inside(x, y)) continue;
      // light from above and a little from the left, dithered between the slate's tones
      const fy = (y - SLAB.y) / SLAB.h, fx = (x - SLAB.x) / SLAB.w;
      let tone = 4.2 - fy * 2.2 - fx * 0.5;
      tone += (r() - 0.5) * 0.35;
      const base = Math.floor(tone);
      const k = base + ((tone - base) * 16 > bayer[(y % 4) * 4 + (x % 4)] ? 1 : 0);
      put(x, y, k);
    }
  // its edge: the lit lip along the top and left, the dark one along the bottom and right
  for (let y = SLAB.y; y < SLAB.y + SLAB.h; y++)
    for (let x = SLAB.x; x < SLAB.x + SLAB.w; x++) {
      if (!inside(x, y)) continue;
      if (!inside(x, y - 1) || !inside(x - 1, y)) put(x, y, 7);
      else if (!inside(x, y - 2) || !inside(x - 2, y)) put(x, y, 6);
      if (!inside(x, y + 1) || !inside(x + 1, y)) put(x, y, 1);
      else if (!inside(x, y + 2) || !inside(x + 2, y)) put(x, y, 2);
    }
  // flecks of mica, and a few cracks run through it
  for (let n = 0; n < 260; n++) { const x = SLAB.x + 3 + Math.floor(r() * (SLAB.w - 6)), y = SLAB.y + 3 + Math.floor(r() * (SLAB.h - 6)); if (inside(x, y)) put(x, y, r() < 0.5 ? 6 : 2); }
  for (const [sx, sy, dx] of [[SLAB.x + 14, SLAB.y + SLAB.h - 3, 1], [SLAB.x + SLAB.w - 8, SLAB.y + 40, -1], [SLAB.x + 4, SLAB.y + 104, 1]] as const) {
    let x = sx, y = sy;
    for (let n = 0; n < 26; n++) {
      if (inside(x, y)) { put(x, y, 0); if (inside(x + 1, y + 1)) put(x + 1, y + 1, 5); }
      y += sy > SLAB.y + SLAB.h / 2 ? -1 : r() < 0.5 ? 1 : 0;
      x += r() < 0.6 ? dx : 0;
    }
  }
  lx.putImageData(id, 0, 0);
  // 2. the carvings, at the screen's finer grain
  const c = document.createElement('canvas');
  c.width = HALF * 2; c.height = H * 2;
  const x = c.getContext('2d')!;
  x.fillStyle = C.PANEL; x.fillRect(0, 0, c.width, c.height);
  x.imageSmoothingEnabled = false;
  x.drawImage(lo, 0, 0, c.width, c.height);
  x.scale(2, 2);
  // a border cut round inside its edge
  const B = { x: SLAB.x + 9, y: SLAB.y + 9, w: SLAB.w - 18, h: SLAB.h - 18 };
  x.fillStyle = SL[0];
  x.fillRect(B.x + 6, B.y, B.w - 12, 1); x.fillRect(B.x + 6, B.y + B.h - 1, B.w - 12, 1);
  x.fillRect(B.x, B.y + 6, 1, B.h - 12); x.fillRect(B.x + B.w - 1, B.y + 6, 1, B.h - 12);
  x.fillStyle = SL[6]; x.globalAlpha = 0.8;
  x.fillRect(B.x + 6, B.y + 1, B.w - 12, 0.5); x.fillRect(B.x + 6, B.y + B.h, B.w - 12, 0.5);
  x.fillRect(B.x + 1, B.y + 6, 0.5, B.h - 12); x.fillRect(B.x + B.w, B.y + 6, 0.5, B.h - 12);
  x.globalAlpha = 1;
  // the channels: grooves cut straight down from each hollow, turning in at their feet
  const groove = (path: Pt[]) => {
    const at = (p: Pt) => [Math.round(p.x * 2) / 2, Math.round(p.y * 2) / 2];
    for (const p of path) { const [a, b] = at(p); x.fillStyle = SL[6]; x.fillRect(a - 3, b - 2.5, 7, 7); }
    for (const p of path) { const [a, b] = at(p); x.fillStyle = SL[1]; x.fillRect(a - 3.5, b - 3.5, 7, 7); }
    for (const p of path) { const [a, b] = at(p); x.fillStyle = SL[0]; x.fillRect(a - 2.5, b - 2.5, 5, 5); }
    for (const p of path) { const [a, b] = at(p); x.fillStyle = '#0a1013'; x.fillRect(a - 1, b - 0.5, 2.5, 2.5); }
  };
  groove(pathA); groove(pathB);
  // the hollows: two above, one beneath, cut deep, with a cut-out corner to each (an octagon)
  const hollow = (cx: number, cy: number, size: number, cut: number) => {
    const x0 = Math.round(cx - size / 2), y0 = Math.round(cy - size / 2);
    const rows = (inset: number, col: string, dx = 0, dy = 0) => {
      x.fillStyle = col;
      const w = size - inset * 2, h = size - inset * 2, cc = Math.max(0, cut - inset);
      for (let i = 0; i < h; i++) { const k = Math.max(0, cc - i, cc - (h - 1 - i)); x.fillRect(x0 + inset + k + dx, y0 + inset + i + dy, w - 2 * k, 1); }
    };
    rows(-2, SL[7], 0.5, 0.5);
    rows(-2, SL[1]);
    rows(-1, SL[5]);
    rows(0, SL[1]);
    rows(1, SL[0]);
    rows(2, '#081014', 0.5, 0.5);
  };
  hollow(HA.x, HA.y, HS, 11); hollow(HB.x, HB.y, HS, 11);
  for (const st of STANDING) {
    const sx = Math.round(st.x), sy = Math.round(st.y);
    x.fillStyle = SL[0]; x.fillRect(sx - 2, sy - 3, 6, 10);
    x.fillStyle = SL[5]; x.fillRect(sx - 2.5, sy - 5, 5, 10);
    x.fillStyle = SL[7]; x.fillRect(sx - 2.5, sy - 5, 5, 1); x.fillRect(sx - 2.5, sy - 5, 1, 10);
    x.fillStyle = SL[3]; x.fillRect(sx - 1, sy - 2, 2, 4);
  }
  hollow(OUT.x, OUT.y, OS, 15);
  // the plus between the two above
  x.fillStyle = SL[0]; x.fillRect(OUT.x - 4, HA.y - 1, 9, 3); x.fillRect(OUT.x - 1, HA.y - 4, 3, 9);
  x.fillStyle = SL[7]; x.globalAlpha = 0.7; x.fillRect(OUT.x - 4, HA.y + 2, 9, 0.5); x.fillRect(OUT.x + 2, HA.y - 4, 0.5, 9); x.globalAlpha = 1;
  // the runes carved beside the channels and in the border's corners
  const carve = (m: { x: number; y: number }, gl: number) => GLYPHS[gl].forEach((row, j) => [...row].forEach((ch, i) => {
    if (!INK_CH(ch)) return;
    x.fillStyle = SL[0]; x.fillRect(m.x + i, m.y + j, 1, 1);
    x.fillStyle = SL[6]; x.globalAlpha = 0.6; x.fillRect(m.x + i + 0.5, m.y + j + 0.5, 0.5, 0.5); x.globalAlpha = 1;
  }));
  for (const m of MARKS) carve(m, m.gl);
  CORNERS.forEach((m, i) => carve(m, (i + 2) % GLYPHS.length));
  return c;
}

const hin: (string | null)[] = [null, null];
const dropT = [-9, -9];
interface Meld { t0: number; a: string; b: string; res: string; first: boolean; pix: [number, number, string][]; from: { x: number; y: number; d: number }[]; done: boolean; taken: number; fly: number; burst?: boolean }
let meld: Meld | null = null;
let note = { s: '', t: -9, c: C.BAD };
interface Part { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number; grav: number }
const parts: Part[] = [];
const addPart = (p: Partial<Part> & { x: number; y: number }) => parts.push({ vx: 0, vy: 0, life: 0, max: 1, c: C.PICK, s: 1, grav: 0, ...p });

function layIn(id: string): void {
  if (meld && !meld.done) return;
  if (meld && meld.done) takeMeld(true);
  const using = hin.filter((w) => w === id).length;
  if (held[id] - using <= 0) { say(`NO MORE ${R[id].name.toUpperCase()} TO LAY IN`); return; }
  const i = hin.indexOf(null);
  if (i < 0) { say('BOTH HOLLOWS ARE FULL: PRESS ONE TO EMPTY IT'); return; }
  hin[i] = id; dropT[i] = now;
  const h = i ? HB : HA;
  for (let k = 0; k < 10; k++) addPart({ x: h.x + (Math.random() - 0.5) * 24, y: h.y + 14, vx: (Math.random() - 0.5) * 30, vy: -Math.random() * 20, max: 0.5, c: SL[7], grav: 60 });
}
function say(s: string, c = C.BAD): void { note = { s, t: now, c }; }
function pairText(): { s: string; c: string; ok: boolean; res: string | null } {
  const [a, b] = hin;
  if (!a || !b) return { s: '', c: C.DIM, ok: false, res: null };
  const res = makes(a, b);
  if (!res) return { s: a === b ? `${R[a].name.toUpperCase()} GOES NO HIGHER` : 'THESE TWO DO NOT MELD', c: C.BAD, ok: false, res: null };
  if (known.has(res)) return { s: `MAKES ${R[res].name.toUpperCase()}`, c: R[res].color, ok: true, res };
  return { s: 'A MELD YOU HAVE NOT FOUND', c: C.PICK, ok: true, res };
}
function startMeld(): void {
  const pt = pairText();
  if (!pt.ok || !pt.res) { if (pt.s) say(pt.s); else say('LAY TWO RUNES IN FIRST'); return; }
  if (dust < 1) { say('YOU HAVE NO RUNEDUST'); return; }
  const [a, b] = hin as [string, string];
  held[a]--; held[b]--; dust--;
  const pix = pixelsOf(pt.res);
  meld = { t0: now, a, b, res: pt.res, first: !known.has(pt.res), pix, from: pix.map(() => { const ang = Math.random() * Math.PI * 2, rr = 14 + Math.random() * 22; return { x: Math.cos(ang) * rr, y: Math.sin(ang) * rr * 0.8, d: Math.random() * 0.14 }; }), done: false, taken: -1, fly: -1 };
  libSmith.layout = libLay(libSmith);
}
function takeMeld(quick = false): void {
  if (!meld || !meld.done || meld.taken >= 0) return;
  meld.taken = now;
  const L = libSmith;
  L.q = ''; L.card = null;
  if (L.group !== 'ALL' && L.group !== R[meld.res].group) { L.group = 'ALL'; L.made = []; }
  L.layout = libLay(L);
  const it = L.layout.items.find((i) => i.id === meld!.res);
  if (it) L.scroll = Math.max(0, Math.min(libMax(L), it.y - 60));
  if (quick) finishTake();
}
function finishTake(): void {
  if (!meld) return;
  libSmith.flashId = meld.res; libSmith.flashT = now;
  meld = null; hin[0] = hin[1] = null;
}

// the times of a meld (seconds from MELD pressed): about two seconds to the new rune, where the first mock-up took three and a half
const M_CHARGE = 0.2, M_MELT = 0.5, M_POUR = 0.92, M_SWIRL = 1.25, M_FLASH = 1.36, M_GATHER = 0.3, M_FORM = 1.78, M_NAME = 1.9;
/** The rune in a hollow above, three of the picture's pixels to one of the stone's. */
const RS = 36;
/** The new rune in the hollow beneath: four to one. */
const NS = 48;

function drawSmith(): void {
  if (!slab) slab = makeSlab();
  const t = meld ? now - meld.t0 : -1;
  // the stone shakes a little as the light gathers
  let sh = 0;
  if (meld && t > M_POUR && t < M_FLASH + 0.08) sh = (Math.random() - 0.5) * 2 * clamp01((t - M_POUR) / (M_SWIRL - M_POUR));
  g.save();
  g.translate(Math.round(sh), Math.round(-sh / 2));
  g.drawImage(slab, 0, 0, HALF, H);
  g.restore();
  // his title, the runedust, and the trade's tab
  T('WORDSMITH', 6, 6, C.PICK);
  T('MELDING', 6 + tw('WORDSMITH') + 6, 8, C.DIM, { font: 'small' });
  const tb = { x: HALF - 48, y: 3, w: 44, h: 14 };
  box(tb.x, tb.y, tb.w, tb.h, C.BOX, C.EDGE);
  T('TRADE', tb.x + tb.w / 2, tb.y + 4.5, C.TEXT, { font: 'small', align: 'center' });
  hit({ x: tb.x, y: tb.y, w: tb.w, h: tb.h, tap: () => say('HIS TRADE IN RUNES, AS IN THE GAME TODAY', C.DIM) });
  const dx = HALF - 100;
  dustIcon(dx, 5, 1);
  T(`${dust} RUNEDUST`, dx + 11, 8, RUNE_DATA.dust, { font: 'small' });
  g.save();
  g.translate(Math.round(sh), Math.round(-sh / 2));
  const idle = 0.5 + 0.5 * Math.sin(now * 2);
  const pt = pairText();
  // the runes inlaid in its border's corners: lit, breathing
  CORNERS.forEach((m, i) => {
    const gl = GLYPHS[(i + 2) % GLYPHS.length];
    let a = 0.35 + 0.2 * Math.sin(now * 1.4 + i * 1.6);
    if (meld && !meld.done && t > M_SWIRL && t < M_FLASH + 0.4) a = 1;
    glow(m.x + 3.5, m.y + 3.5, 9, C.PICK, a * 0.35);
    gl.forEach((row, j) => [...row].forEach((ch, k) => { if (INK_CH(ch)) { g.globalAlpha = a; g.fillStyle = C.PICK; g.fillRect(m.x + k, m.y + j, 1, 1); } }));
    g.globalAlpha = 1;
  });
  // the light in the grooves: a shimmer when two are laid in that will meld, running while it melds, glowing after
  const litTo = (path: Pt[], k: number, age: (i: number) => number) => {
    for (let i = 0; i <= N_PATH * k; i++) {
      const p = path[i];
      const a = age(i);
      if (a <= 0) continue;
      g.globalAlpha = Math.min(1, a);
      g.fillStyle = a > 0.85 ? '#dffffc' : C.PICK;
      g.fillRect(Math.round(p.x * 2) / 2 - 1.5, Math.round(p.y * 2) / 2 - 1.5, 3, 3);
    }
    g.globalAlpha = 1;
  };
  if (!meld) {
    if (pt.ok) {
      for (const path of [pathA, pathB]) for (let i = 0; i <= N_PATH; i++) {
        const w = 0.5 + 0.5 * Math.sin(i * 0.3 - now * 7);
        if (w < 0.75) continue;
        const p = path[i];
        g.globalAlpha = (w - 0.75) * 1.6; g.fillStyle = C.PICK;
        g.fillRect(Math.round(p.x * 2) / 2 - 1, Math.round(p.y * 2) / 2 - 1, 2, 2);
      }
      g.globalAlpha = 1;
    }
  } else if (t > M_MELT - 0.04 && !meld.done) {
    const k = clamp01((t - (M_MELT - 0.04)) / (M_POUR - M_MELT));
    const kk = k * k * (3 - 2 * k);
    const age = (i: number) => { const ti = i / N_PATH; return 1.15 - (kk - ti) * 1.1 - clamp01((t - M_SWIRL) / 0.35) * 0.6; };
    litTo(pathA, kk, age); litTo(pathB, kk, age);
    if (k < 1) for (const path of [pathA, pathB]) {
      const p = path[Math.round(kk * N_PATH)];
      glow(p.x, p.y, 15, C.PICK, 0.95);
      g.fillStyle = '#ffffff'; g.fillRect(p.x - 2, p.y - 2, 4, 4);
      for (let n = 0; n < 2; n++) addPart({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 50, vy: -10 - Math.random() * 35, max: 0.3 + Math.random() * 0.25, c: CY[Math.floor(Math.random() * 3)], grav: 140 });
    }
  } else if (meld && meld.done && meld.taken < 0) {
    litTo(pathA, 1, (i) => 0.3 + 0.18 * Math.sin(i * 0.25 - now * 4));
    litTo(pathB, 1, (i) => 0.3 + 0.18 * Math.sin(i * 0.25 - now * 4));
  }
  // the carved runes by the channels catch the light as it passes
  for (const m of MARKS) {
    let a = 0.14 + 0.1 * Math.sin(now * 1.5 + m.gl);
    if (meld && !meld.done) { const k = clamp01((t - (M_MELT - 0.04)) / (M_POUR - M_MELT)); const d = k * k * (3 - 2 * k) - m.t; if (d > 0) a = Math.max(a, 1 - d * 1.6); }
    else if (meld && meld.done) a = 0.55;
    else if (pt.ok) a = 0.35 + 0.15 * idle;
    if (a > 0.5) glow(m.x + 3.5, m.y + 3.5, 10, C.PICK, (a - 0.5) * 0.9);
    GLYPHS[m.gl].forEach((row, j) => [...row].forEach((ch, i) => { if (INK_CH(ch)) { g.globalAlpha = a; g.fillStyle = C.PICK; g.fillRect(m.x + i, m.y + j, 1, 1); } }));
    g.globalAlpha = 1;
  }
  // the two hollows above
  [HA, HB].forEach((h, i) => {
    const w = hin[i];
    const want = !w && !meld;
    let rim = want ? 0.2 + 0.15 * idle : 0.12;
    if (meld && t < M_MELT) rim = 0.3 + 0.7 * clamp01(t / M_CHARGE);
    glow(h.x, h.y, 30, C.PICK, rim * 0.6);
    if (want) {
      g.globalAlpha = 0.35 + 0.35 * idle; g.fillStyle = C.PICK;
      g.fillRect(h.x - 5, h.y, 11, 1); g.fillRect(h.x, h.y - 5, 1, 11); g.globalAlpha = 1;
    }
    hit({ x: h.x - HS / 2, y: h.y - HS / 2, w: HS, h: HS, tap: () => { if (!meld && hin[i]) { hin[i] = null; } }, data: { hollow: i } });
    if (!w) return;
    if (!meld) {
      // laid in: it drops into the hollow and settles
      const d = now - dropT[i];
      const fall = d < 0.18 ? (1 - ease(d / 0.18)) * -14 : 0;
      const bob = Math.round(Math.sin(now * 2 + i) * 1) / 2;
      if (d < 0.45) glow(h.x, h.y, 26, R[w].color, (1 - d / 0.45) * 0.7);
      stone(w, h.x - RS / 2, h.y - RS / 2 + fall + bob, RS);
      return;
    }
    // MELD: it rises, trembles and cracks with light; then melts into light that drains into its channel
    const k3 = RS / 24;
    if (t < M_MELT) {
      const c = clamp01(t / M_CHARGE);
      const shake = t < M_CHARGE ? (Math.random() - 0.5) * 2 * c : 0;
      const rise = -3 * ease(c);
      const melt = clamp01((t - M_CHARGE) / (M_MELT - M_CHARGE));
      const sx = h.x - RS / 2 + shake, sy = h.y - RS / 2 + rise;
      const cut = Math.floor(melt * 24);
      const src = tinted(w, Math.min(1, c * 0.55 + melt * 0.6));
      g.drawImage(src, 0, cut, 24, 24 - cut, Math.round(sx), Math.round(sy + cut * k3), RS, (24 - cut) * k3);
      if (c > 0.2 && melt < 0.6) {
        g.fillStyle = '#ffffff';
        g.globalAlpha = c * (1 - melt / 0.6);
        const cr = [[12, 2, 10, 8], [10, 8, 13, 14], [13, 14, 9, 21], [10, 8, 4, 11], [13, 14, 19, 17]];
        for (const [x1, y1, x2, y2] of cr) for (let s2 = 0; s2 <= 10; s2++) { const px = x1 + ((x2 - x1) * s2) / 10, py = y1 + ((y2 - y1) * s2) / 10; if (py >= cut) g.fillRect(Math.round((sx + px * k3) * 2) / 2, Math.round((sy + py * k3) * 2) / 2, 1.5, 1.5); }
        g.globalAlpha = 1;
      }
      glow(h.x, h.y + rise, 24, C.PICK, 0.3 + 0.6 * c);
      if (melt > 0 && melt < 1) for (let n = 0; n < 7; n++) addPart({ x: sx + 4 + Math.random() * (RS - 8), y: sy + cut * k3, vx: (Math.random() - 0.5) * 8, vy: 15 + Math.random() * 30, max: 0.28, c: Math.random() < 0.3 ? '#ffffff' : CY[Math.floor(Math.random() * 3)], grav: 110 });
      if (melt > 0) {
        g.globalAlpha = 0.5 * melt; g.fillStyle = C.PICK;
        g.fillRect(h.x - RS / 2, h.y + RS / 2 - melt * 11, RS, melt * 11);
        g.globalAlpha = 1;
        glow(h.x, h.y + 10, 22, C.PICK, melt * 0.85);
      }
    } else if (t < M_POUR) {
      const k = clamp01((t - M_MELT) / 0.3);
      g.globalAlpha = 0.5 * (1 - k); g.fillStyle = C.PICK;
      g.fillRect(h.x - RS / 2, h.y + 7 + k * 11, RS, 11 * (1 - k));
      g.globalAlpha = 1;
      glow(h.x, h.y + 12, 20, C.PICK, 0.85 * (1 - k));
    }
  });
  // the standing stones under the hollow beneath: each wakes as the light comes round
  STANDING.forEach((s2, i) => {
    let a = 0.18 + 0.1 * Math.sin(now * 1.3 + i);
    if (meld && !meld.done && t > M_POUR) { const sw = clamp01((t - M_POUR) / (M_SWIRL - M_POUR)); if (sw * 7 >= [0, 1, 2, 2, 1, 0][i] * 2 || sw > 0.7) a = 1; }
    else if (meld && meld.done) a = 0.6 + 0.3 * Math.sin(now * 3 + i);
    else if (pt.ok) a = 0.35 + 0.15 * idle;
    g.fillStyle = C.PICK; g.globalAlpha = a;
    g.fillRect(Math.round(s2.x) - 1, Math.round(s2.y) - 2, 2, 4);
    g.globalAlpha = 1;
    if (a > 0.6) glow(s2.x, s2.y, 10, C.PICK, (a - 0.6) * 1.2);
  });
  // the hollow beneath
  const o = OUT;
  if (!meld) {
    glow(o.x, o.y, 34, C.PICK, 0.12 + 0.06 * idle);
    if (pt.ok && pt.res) {
      if (known.has(pt.res)) stone(pt.res, o.x - NS / 2, o.y - NS / 2, NS, 0.22 + 0.12 * idle);
      else { glow(o.x, o.y, 18, C.PICK, 0.3 + 0.2 * idle); T('?', o.x, o.y - 7 + Math.round(Math.sin(now * 3)), C.PICK, { scale: 2, align: 'center' }); }
    }
  } else {
    // the two streams come in and wheel round the hollow, closing on its middle
    if (t > M_POUR - 0.04 && t < M_FLASH) {
      const sw = clamp01((t - (M_POUR - 0.04)) / (M_SWIRL - M_POUR + 0.04));
      const rad = 20 * (1 - ease(sw)) + 2;
      for (const side of [0, 1]) {
        const base = side ? -Math.PI / 3 : (-2 * Math.PI) / 3;
        const dir = side ? 1 : -1;
        for (let tr = 0; tr < 14; tr++) {
          const ang = base + dir * (sw * Math.PI * 3 - tr * 0.14);
          const rr = rad + tr * 0.35;
          const px = o.x + Math.cos(ang) * rr, py = o.y + Math.sin(ang) * rr * 0.85;
          g.globalAlpha = 1 - tr / 14; g.fillStyle = tr < 2 ? '#ffffff' : C.PICK;
          g.fillRect(Math.round(px * 2) / 2 - 1, Math.round(py * 2) / 2 - 1, tr < 2 ? 3 : 2, tr < 2 ? 3 : 2);
        }
        g.globalAlpha = 1;
      }
      glow(o.x, o.y, 12 + 26 * sw, C.PICK, 0.4 + 0.6 * sw);
      glow(o.x, o.y, 8 + 10 * sw, '#ffffff', 0.55 * sw);
    }
    // the flash: the whole stone whitened a moment, a ring thrown out, sparks
    if (t >= M_SWIRL && t < M_FLASH + 0.45) {
      const f = clamp01((t - M_SWIRL) / (M_FLASH + 0.45 - M_SWIRL));
      const rr = 8 + ease(f) * 84;
      g.fillStyle = f < 0.3 ? '#ffffff' : C.PICK;
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        g.globalAlpha = (1 - f) * 0.9;
        g.fillRect(Math.round((o.x + Math.cos(a) * rr) * 2) / 2, Math.round((o.y + Math.sin(a) * rr * 0.8) * 2) / 2, 1.5, 1.5);
      }
      g.globalAlpha = 1;
      if (!meld.burst && t >= M_FLASH - 0.05) {
        meld.burst = true;
        for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, sp = 50 + Math.random() * 100; addPart({ x: o.x, y: o.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8 - 20, max: 0.4 + Math.random() * 0.45, c: CY[Math.floor(Math.random() * 4)], grav: 80, s: Math.random() < 0.3 ? 1.5 : 1 }); }
      }
    }
    if (t >= M_SWIRL + 0.05 && t < M_SWIRL + 0.3) {
      const f = (t - M_SWIRL - 0.05) / 0.25;
      g.fillStyle = 'rgba(214,255,250,' + (0.45 * (1 - f)).toFixed(3) + ')';
      g.fillRect(SLAB.x, SLAB.y, SLAB.w, SLAB.h);
    }
    // the new rune forms: its pixels gather out of the light into their places
    if (t >= M_FLASH - 0.06 && meld.taken < 0) {
      const ft = t - (M_FLASH - 0.06);
      const k4 = NS / 24;
      if (ft < M_GATHER + 0.16) {
        for (let i = 0; i < meld.pix.length; i++) {
          const [px, py, col] = meld.pix[i];
          const fr = meld.from[i];
          const k = ease(clamp01((ft - fr.d) / M_GATHER));
          if (k <= 0) continue;
          const x = o.x - NS / 2 + px * k4 + fr.x * (1 - k), y = o.y - NS / 2 + py * k4 + fr.y * (1 - k);
          g.fillStyle = k < 0.85 ? C.PICK : col; g.globalAlpha = Math.min(1, k * 1.6);
          g.fillRect(Math.round(x * 2) / 2, Math.round(y * 2) / 2, k4, k4);
        }
        g.globalAlpha = 1;
        glow(o.x, o.y, 26, C.PICK, 0.65);
      } else {
        if (!meld.done) { meld.done = true; held[meld.res]++; known.add(meld.res); fresh.add(meld.res); got[meld.res] = gotN++; libSmith.layout = libLay(libSmith); }
        const age = t - M_FORM;
        const pulse = 0.5 + 0.5 * Math.sin(now * 3);
        const size = age < 0.1 ? 60 : NS;
        glow(o.x, o.y, 34 + 6 * pulse, R[meld.res].color, 0.55 + 0.2 * pulse);
        glow(o.x, o.y, 18, '#ffffff', age < 0.25 ? 0.8 * (1 - age / 0.25) : 0);
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let b = 0; b < 6; b++) {
          const a = now * 0.6 + (b * Math.PI) / 3;
          for (let s2 = 14; s2 < 36; s2++) { g.globalAlpha = 0.18 * (1 - s2 / 36); g.fillStyle = C.PICK; g.fillRect(Math.round(o.x + Math.cos(a) * s2), Math.round(o.y + Math.sin(a) * s2 * 0.85), 1, 1); }
        }
        g.restore();
        const bob = Math.round(Math.sin(now * 2.2) * 2) / 2;
        stone(meld.res, o.x - size / 2, o.y - size / 2 + bob, size);
        if (Math.random() < 0.25) addPart({ x: o.x + (Math.random() - 0.5) * 34, y: o.y + 10, vy: -12 - Math.random() * 10, max: 1.2, c: C.PICK });
        hit({ x: o.x - OS / 2, y: o.y - OS / 2, w: OS, h: OS, tap: () => takeMeld() });
      }
    }
    // taken: the rune flies to its place in the bag
    if (meld.taken >= 0) {
      const k = clamp01((now - meld.taken) / 0.45);
      const L = libSmith;
      const it = L.layout?.items.find((i) => i.id === meld!.res);
      const tx = it ? L.x + it.x + 8 : HALF + 120, ty = it ? gridTop(L) + it.y - L.scroll + 3 : 140;
      const e = ease(k);
      const size = Math.round((NS - (NS - 24) * e) / 12) * 12;
      const x = o.x - NS / 2 + (tx - (o.x - NS / 2)) * e, y = o.y - NS / 2 + (ty - (o.y - NS / 2)) * e - Math.sin(k * Math.PI) * 40;
      g.restore();
      g.save();
      glow(x + size / 2, y + size / 2, 18, C.PICK, 0.7);
      stone(meld.res, x, y, size);
      if (Math.random() < 0.9) addPart({ x: x + size / 2, y: y + size / 2, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, max: 0.4, c: C.PICK });
      if (k >= 1) finishTake();
    }
  }
  g.restore();
  // under the hollow beneath: what will come out, or what came out, on a dark plate across the stone's foot
  const ny = 213;
  if (meld && meld.done && meld.taken < 0) {
    const age = now - meld.t0 - M_NAME + 0.15;
    const k = ease(clamp01(age / 0.25));
    const nm = R[meld.res].name.toUpperCase();
    const sc = tw(nm, 'normal', 2) < SLAB.w - 16 ? 2 : 1;
    const head = meld.first ? 'A NEW RUNE, FOUND!' : R[meld.res].rankOf ? 'RANKED UP' : 'MELDED';
    const pw = Math.max(tw(nm, 'normal', sc), tw(head, 'small')) + 20;
    g.globalAlpha = k;
    g.fillStyle = 'rgba(8,12,16,0.8)'; g.fillRect(HALF / 2 - pw / 2, ny - 5, pw, sc === 2 ? 26 : 20);
    T(head, HALF / 2, ny - 2 - (1 - k) * 4, meld.first ? (Math.floor(now * 3) % 2 ? C.PICK : '#ffffff') : C.DIM, { font: 'small', align: 'center', shadow: C.INK });
    T(nm, HALF / 2, ny + 5 - (1 - k) * 4, R[meld.res].color, { scale: sc, align: 'center', shadow: C.INK });
    if (age > 0.6) T('PRESS IT TO TAKE IT', HALF / 2, 235, Math.floor(now * 2) % 2 ? C.PICK : C.FAINT, { font: 'small', align: 'center' });
    g.globalAlpha = 1;
  } else if (!meld) {
    if (pt.s) { const pw = tw(pt.s) + 14; g.fillStyle = 'rgba(8,12,16,0.8)'; g.fillRect(HALF / 2 - pw / 2, ny + 2, pw, 13); T(pt.s, HALF / 2, ny + 5, pt.c, { align: 'center' }); }
    else if (!hin[0] && !hin[1]) T('TWO RUNES IN, ONE OUT. PRESS TWO OF YOURS ON THE RIGHT.', HALF / 2, 235, C.FAINT, { font: 'small', align: 'center' });
    else { const one = hin[0] ?? hin[1]; T(`THE RUNES THAT MELD WITH ${R[one!].name.toUpperCase()} ARE LIT`, HALF / 2, 235, C.PICK_LO, { font: 'small', align: 'center' }); }
  }
  if (now - note.t < 2.2) { g.globalAlpha = Math.min(1, 2.2 - (now - note.t)); box(14, 104, HALF - 28, 16, C.PANEL, note.c); T(note.s, HALF / 2, 109, note.c, { font: 'small', align: 'center' }); g.globalAlpha = 1; }
  // MELD
  const can = !meld && pt.ok && dust > 0;
  const label = 'MELD: 1 RUNEDUST';
  const bw = tw(label) + 24;
  const br = { x: Math.round(HALF / 2 - bw / 2), y: 246, w: bw, h: 18 };
  const blink = 0.5 + 0.5 * Math.sin(now * 5);
  box(br.x, br.y, br.w, br.h, can ? (blink > 0.5 ? C.PRESS_HI : C.PRESS) : C.BOX, can ? C.PRESS_HI : C.EDGE);
  if (can) glow(br.x + br.w / 2, br.y + 9, 40, C.PRESS, 0.15 + 0.1 * blink);
  T(label, br.x + br.w / 2, br.y + 5.5, can ? C.WHITE : C.FAINT, { align: 'center' });
  hit({ x: br.x, y: br.y, w: br.w, h: br.h, tap: () => startMeld() });
}

// ---------------------------------------------------------------- particles
function stepParts(dt: number): void {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life += dt;
    if (p.life >= p.max) { parts.splice(i, 1); continue; }
    p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
}
function drawParts(): void {
  for (const p of parts) {
    g.globalAlpha = 1 - p.life / p.max;
    g.fillStyle = p.c;
    g.fillRect(Math.round(p.x * 2) / 2, Math.round(p.y * 2) / 2, p.s, p.s);
  }
  g.globalAlpha = 1;
}
// motes rising off the hollow beneath, always
let moteT = 0;

// ---------------------------------------------------------------- the frame
let scene: 'bag' | 'smith' = 'bag';
let last = performance.now();
function frame(ms: number): void {
  const dt = Math.min(0.05, (ms - last) / 1000);
  last = ms;
  now += dt;
  // the pointer held still long enough opens a rune's card
  if (P && P.mode === 'pending' && P.hit?.hold && now - P.t0 >= HOLD) { P.mode = 'held'; P.hit.hold(); }
  // scrolling coasts to a stop
  for (const L of [libBag, libSmith]) {
    if (!(P && (P.mode === 'scroll' || P.mode === 'thumb') && (P.hit?.data === L || P.hit?.thumb === L)) && Math.abs(L.vel) > 0.5) {
      L.scroll = Math.max(0, Math.min(libMax(L), L.scroll + L.vel * dt));
      L.vel *= Math.pow(0.04, dt);
      if (L.scroll <= 0 || L.scroll >= libMax(L)) L.vel = 0;
    }
  }
  if (scene === 'smith') { moteT += dt; while (moteT > 0.18) { moteT -= 0.18; addPart({ x: OUT.x + (Math.random() - 0.5) * 24, y: OUT.y + 4, vy: -8 - Math.random() * 8, vx: (Math.random() - 0.5) * 3, max: 1.6 + Math.random(), c: Math.random() < 0.2 ? '#ffffff' : C.PICK }); } }
  stepParts(dt);
  hits = [];
  g.setTransform(2, 0, 0, 2, 0, 0);
  g.imageSmoothingEnabled = false;
  g.fillStyle = C.PANEL; g.fillRect(0, 0, W, H);
  if (scene === 'bag') {
    pic('world', 0, 0, HALF, H);
    drawAttacks();
    drawLib(libBag);
    if (!libBag.open) {
      g.fillStyle = 'rgba(14,12,36,0.0)';
      T('THE GAME, AS NOW', HALF / 2, 6, C.FAINT, { font: 'small', align: 'center', shadow: C.INK });
    }
    drawParts();
  } else {
    drawSmith();
    drawParts();
    drawLib(libSmith);
  }
  // a rune being carried
  if (carry) {
    glow(carry.x, carry.y, 16, C.PICK, 0.5);
    stone(carry.id, carry.x - 12, carry.y - 14, 24);
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- the pointer
function toGame(e: PointerEvent): { x: number; y: number } {
  const r = cv.getBoundingClientRect();
  if (turned) return { x: ((e.clientY - r.top) / r.height) * W, y: ((r.right - e.clientX) / r.width) * H };
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
cv.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  cv.setPointerCapture(e.pointerId);
  const { x, y } = toGame(e);
  mouse = { x, y };
  if (document.activeElement === input) input.blur();
  const h = topHit(x, y);
  P = { sx: x, sy: y, x, y, t0: now, hit: h, mode: 'pending', start: 0, lastY: y, lastX: x, lastT: now, vel: 0 };
  if (h?.thumb) {
    P.mode = 'thumb';
    const L = h.thumb;
    L.vel = 0;
    thumbTo(L, y);
  } else if (h?.scroll) { P.start = h.scroll.get(); for (const L of [libBag, libSmith]) if (h.data === L) L.vel = 0; }
  else if (h?.hscroll) P.start = h.hscroll.chipScroll;
});
function thumbTo(L: Lib, y: number): void {
  const top = gridTop(L), vh = gridBottom - top, lay = L.layout!;
  const th = Math.max(18, (vh * vh) / lay.H);
  L.scroll = Math.max(0, Math.min(libMax(L), ((y - top - th / 2) / (vh - th)) * libMax(L)));
  L.bubbleT = now;
}
cv.addEventListener('pointermove', (e) => {
  const { x, y } = toGame(e);
  mouse = { x, y };
  if (!P) return;
  P.x = x; P.y = y;
  const dx = x - P.sx, dy = y - P.sy;
  if (P.mode === 'thumb') { thumbTo(P.hit!.thumb!, y); return; }
  if (P.mode === 'pending' && Math.hypot(dx, dy) > 4) {
    const h = P.hit;
    const L = h?.data as Lib | undefined;
    const outward = L && h?.drag && (L.atSmith ? dx < -Math.abs(dy) * 0.8 : dx > Math.abs(dy) * 0.8);
    if (h?.drag && (outward || !h.scroll)) { P.mode = 'drag'; carry = { id: h.drag, x, y }; if (L) L.sel = null; }
    else if (h?.scroll && Math.abs(dy) >= Math.abs(dx) * 0.6) P.mode = 'scroll';
    else if (h?.hscroll) P.mode = 'hscroll';
    else if (h?.scroll) P.mode = 'scroll';
    else P.mode = 'none';
  }
  if (P.mode === 'scroll' && P.hit?.scroll) {
    P.hit.scroll.set(P.start - (y - P.sy));
    const dtt = Math.max(0.008, now - P.lastT);
    P.vel = P.vel * 0.6 + (-(y - P.lastY) / dtt) * 0.4;
    P.lastY = y; P.lastT = now;
  } else if (P.mode === 'hscroll' && P.hit?.hscroll) P.hit.hscroll.chipScroll = P.start - (x - P.sx);
  else if (P.mode === 'drag' && carry) { carry.x = x; carry.y = y; }
});
const endPtr = (e: PointerEvent) => {
  if (!P) return;
  const { x, y } = toGame(e);
  const h = P.hit;
  if (P.mode === 'pending' && h) {
    if (h.hscroll) {
      // a stone in the MADE WITH row, pressed
      const L = h.hscroll;
      const i = Math.floor((x - L.x - GRID_X + L.chipScroll) / 14);
      const b = BASE_ORDER[i];
      if (b) { L.made = L.made.includes(b) ? L.made.filter((m) => m !== b) : [...L.made.slice(-1), b]; libReset(L); }
    } else h.tap?.();
  } else if (P.mode === 'scroll') {
    for (const L of [libBag, libSmith]) if (h?.data === L && h.vscroll) L.vel = P.vel;
  } else if (P.mode === 'drag' && carry) {
    const id = carry.id;
    if (scene === 'bag') {
      const s = slotAt(x, y);
      if (s && held[id] > 0) place(s.i, s.side, s.k, id);
    } else {
      const over = [HA, HB].findIndex((h) => Math.abs(x - h.x) < HS && Math.abs(y - h.y) < HS);
      if (over >= 0 || (x < HALF && y > 30 && y < 240)) {
        if (over >= 0 && hin[over] === null) { const j = hin.indexOf(null); if (j !== over) { hin[over] = null; } }
        layInAt(id, over);
      }
    }
    carry = null;
  } else if (P.mode === 'thumb') { P.hit!.thumb!.bubbleT = now; }
  P = null;
};
function layInAt(id: string, i: number): void {
  if (i < 0 || hin[i] !== null) { layIn(id); return; }
  if (meld) { if (!meld.done) return; takeMeld(true); }
  const using = hin.filter((w) => w === id).length;
  if (held[id] - using <= 0) { say(`NO MORE ${R[id].name.toUpperCase()} TO LAY IN`); return; }
  hin[i] = id; dropT[i] = now;
}
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', () => { P = null; carry = null; });
cv.addEventListener('pointerleave', () => { mouse = { x: -99, y: -99 }; });
cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * W;
  for (const L of scene === 'bag' ? [libBag] : [libSmith]) {
    if (L.card) { L.cardScroll += e.deltaY * 0.4; continue; }
    if (x >= L.x && x < L.x + HALF) { L.scroll = Math.max(0, Math.min(libMax(L), L.scroll + e.deltaY * 0.5)); L.bubbleT = now; }
  }
}, { passive: false });

// ---------------------------------------------------------------- the page around it: the two scenes, and the phone held upright
let turned = false;
const stage = document.getElementById('stage') as HTMLDivElement;
const bar = document.getElementById('bar') as HTMLDivElement;
function fit(): void {
  const vw = window.innerWidth, vh = window.innerHeight;
  turned = vh > vw * 1.1;
  const aw = (turned ? vh : vw) - 8, ah = (turned ? vw : vh) - 8;
  const bh = bar.offsetHeight || 34;
  let w = aw, h = (w * 9) / 16;
  if (h + bh > ah) { h = ah - bh; w = (h * 16) / 9; }
  cv.style.width = Math.floor(w) + 'px';
  cv.style.height = Math.floor(h) + 'px';
  stage.style.width = Math.floor(w) + 'px';
  stage.style.transform = turned ? `translate(-50%, -50%) rotate(90deg)` : 'translate(-50%, -50%)';
}
window.addEventListener('resize', fit);
for (const b of document.querySelectorAll<HTMLButtonElement>('[data-scene]')) {
  b.addEventListener('click', () => {
    scene = b.dataset.scene as 'bag' | 'smith';
    for (const o of document.querySelectorAll<HTMLButtonElement>('[data-scene]')) o.setAttribute('aria-pressed', String(o === b));
    libBag.card = libSmith.card = null;
    if (scene === 'bag') { libBag.open = true; libBag.openT = now; libBag.layout = libLay(libBag); }
    else libSmith.layout = libLay(libSmith);
  });
}
const startScene = location.hash === '#melding' ? 'smith' : 'bag';
(document.querySelector(`[data-scene="${startScene}"]`) as HTMLButtonElement)?.click();
// (for the pictures: a scene set up from the address)
(window as unknown as { mock: unknown }).mock = {
  libBag, libSmith, hin, held, R, layIn, startMeld, openCard, takeMeld, libReset,
  get meld() { return meld; }, set scene(s: 'bag' | 'smith') { scene = s; }, get now() { return now; },
  // (for the Godot game: the stone's picture and where its things are)
  slabURL: () => { if (!slab) slab = makeSlab(); return slab.toDataURL('image/png'); },
  geo: () => ({ HA, HB, OUT, HS, OS, SLAB, RS, NS, pathA, pathB, MARKS, STANDING, CORNERS, GLYPHS, times: { M_CHARGE, M_MELT, M_POUR, M_SWIRL, M_FLASH, M_GATHER, M_FORM, M_NAME } }),
};
sheet.onload = () => { readStones(); };
fit();
requestAnimationFrame((ms) => { last = ms; frame(ms); });
