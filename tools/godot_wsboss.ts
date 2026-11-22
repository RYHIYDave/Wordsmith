// THE GODOT PORT: ENDLESS MODE'S FINAL BOSS, THE WARPED WORDSMITH, HIS NUMBERS AND HIS PIECES (godot/scripts/act3/wsboss.gd, its
// marks and its paint): from the game itself, so that nothing is copied by hand.
//   godot/assets/act3/wsboss.json   his rules' numbers (game/act1_rules/wsboss.ts WS_TUNE, wsboss2.ts WS2_TUNE, MELDS, his lines),
//     the art's times and tables (art/endless_boss.ts: CHARGE, WHEEL, GORE, STOMP, POWER, FIRE, FROST, BOLT, SPORE, FALL, MELD,
//     SPENT, DEATH and each meld's; the charge's and the fall's carry at every 30th of a second; where he lands; the ice's steps,
//     the meteors' drops, the spores' pods, the eruption's vents, the blight's trees and its field, the fumes' clouds), his acts.
//   godot/assets/act3/wsboss_things.png + the `things` in wsboss.json: THE PIECES PAINTED AHEAD (art/act1_figs/wsboss.ts
//     WS_THING_MAKERS: the hammer, the meteors, the ice, the orb, the spores' flight, a trap, its cloud, the blight's trees), each
//     frame [x, y, w, h, ax, ay] in the sheet, two picture pixels to a game pixel, and how they are chosen (meteorFrame, iceFrame,
//     trapFrame, treeFrame: their numbers).
//   npx tsx tools/godot_wsboss.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import { gameSwitches } from './godot_switches';
import * as EB from '../src/art/endless_boss';
import * as FIG from '../src/art/act1_figs/wsboss';
import { RULES, WS_TUNE, WS_LINES, ICE_STEPS, ICE_FROM, SLAMS, fallLanding } from '../src/game/act1_rules/wsboss';
import { MELDS, MELD_IDS, WS2_TUNE } from '../src/game/act1_rules/wsboss2';
import { TILE3 } from '../src/art/new_mobs3';
import { FINAL_PLACE } from '../src/art/final_arena';
import { skeletonAt } from '../src/art/new_mobs3';
import { GRID } from '../src/art/skeleton';
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../src/art/icons';
import { MELD_GLYPH, MELD_RAMP } from '../src/render/melds3';
import { P as PAL } from '../src/art/palette';
import { FLAME } from '../src/art/mkit';

paintWithoutCanvas();
gameSwitches();

// (the art's tables, plain: what is a number, an array of numbers or of plain objects)
const plain = (v: unknown, depth = 0): unknown => {
  if (depth > 6) return null;
  if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return Number.isFinite(v as number) || typeof v !== 'number' ? v : (v as number) > 0 ? 1e9 : -1e9;
  if (Array.isArray(v)) return v.map((x) => plain(x, depth + 1));
  // (a field of numbers, the Blight's rot: to a hundredth, and -1 where it never reaches)
  if (ArrayBuffer.isView(v)) return Array.from(v as unknown as ArrayLike<number>).map((x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : -1));
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) if (typeof x !== 'function') out[k] = plain(x, depth + 1);
    return out;
  }
  return null;
};
const art: Record<string, unknown> = {};
for (const k of ['CHARGE', 'CHARGE_STRIKE', 'CHARGE_SKID', 'WHEEL', 'WINDED', 'GORE', 'STOMP', 'POWER', 'FIRE', 'FIRE_DROPS', 'FROST', 'BOLT', 'SPORE', 'SPORE_PODS',
  'FALL', 'MELD', 'SPENT', 'DEATH', 'ERUPT', 'ERUPT_VENTS', 'HAIL', 'AVAL', 'BLIGHT', 'BLIGHT_TREES', 'BLIGHT_FIELD', 'SCALD', 'WILDFIRE', 'FUMES', 'FUMES_CLOUDS',
  'FROSTBITE', 'CONTAGION', 'THUNDER', 'SHADE', 'FOOT_LONG', 'RUNES_OUT', 'BLIGHT_FINGERS', 'BLIGHT_AT', 'ERUPT_AT'] as const) {
  art[k] = plain((EB as Record<string, unknown>)[k]);
}
// (the charge's and the fall's carry down their lanes, and where he lands thrown clear: sampled at every 30th of a second)
const samples = (f: (t: number) => number, long: number): number[] => Array.from({ length: Math.ceil(long * 30) + 2 }, (_, i) => f(Math.min(long, i / 30)));
const carry = { charge: samples(EB.chargeCarry, EB.CHARGE.long), fall: samples(EB.fallCarry, EB.FALL.long) };
const landed = EB.fallLandedAt();
// (WHERE HIS HAND IS, for his runes: his left hand and his pelvis, his own lengths, at every 30th of a second of each word's move
// in the saddle (1.6 s) and of his one picture of a meld on foot: render/act1_fx/wsboss2.ts bone)
const bones: Record<string, number[][]> = {};
for (const move of ['power', 'flame', 'frost', 'lightning', 'poison', FIG.MELD_CLIP]) {
  const foot = move === FIG.MELD_CLIP;
  const mob = foot ? FIG.wsPhase2Mob() : FIG.wsPhase1Mob();
  const long = foot ? EB.MELD.long : 1.6;
  bones[move] = Array.from({ length: Math.ceil(long * 30) + 1 }, (_, i) => {
    const sk = skeletonAt(mob, move, i / 30);
    return [...sk.handL, ...sk.pelvis].map((v) => Math.round(v * 1000) / 1000);
  });
}
// (the runes: the Lexicon's symbols and colours of his five words, each meld's own symbol and ramp: art/icons.ts, render/melds3.ts)
const words = ['power', 'fire', 'frost', 'lightning', 'poison'] as const;
const runes = {
  glyph: Object.fromEntries(words.map((w) => [w, [...GLYPH[w]]])),
  color: Object.fromEntries(words.map((w) => [w, WORD_COLOR[w]])),
  glow: Object.fromEntries(words.map((w) => [w, WORD_GLOW[w]])),
  meldGlyph: Object.fromEntries(MELD_IDS.map((m) => [m, [...MELD_GLYPH[m]]])),
  meldRamp: Object.fromEntries(MELD_IDS.map((m) => [m, [...MELD_RAMP[m]]])),
  ink: PAL.ink, flame: [...FLAME], grid: GRID,
};

// THE PIECES PAINTED AHEAD
const pics: [string, Px, number, number][] = [];
const things: Record<string, number> = {};
for (const [name, M] of Object.entries(FIG.WS_THING_MAKERS)) {
  things[name] = M.n;
  for (let i = 0; i < M.n; i++) {
    const s = M.make(i);
    const d = s.density ?? 1;
    pics.push([`${name}|${i}`, paintingOf(s), Math.round(s.ax * d), Math.round(s.ay * d)]);
  }
}
const W = 4096;
const out: Record<string, number[]> = {};
const placed: { px: Px; sx: number; sy: number; x: number; y: number; w: number; h: number }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, px, ax, ay] of [...pics].sort((a, b) => b[1].h - a[1].h)) {
  let x0 = px.w;
  let y0 = px.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] > 0) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  if (x1 < 0) {
    out[key] = [0, 0, 0, 0, 0, 0];
    continue;
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  if (cx + w > W) {
    cx = 0;
    cy += rowH + 1;
    rowH = 0;
  }
  placed.push({ px, sx: x0, sy: y0, x: cx, y: cy, w, h });
  out[key] = [cx, cy, w, h, ax - x0, ay - y0];
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const sheet = new Px(W, cy + rowH);
for (const q of placed) for (let j = 0; j < q.h; j++) for (let i = 0; i < q.w; i++) {
  const o = ((q.sy + j) * q.px.w + q.sx + i) * 4;
  const d = ((q.y + j) * W + q.x + i) * 4;
  for (let c = 0; c < 4; c++) sheet.d[d + c] = q.px.d[o + c];
}
const FIGX = FIG as unknown as Record<string, unknown>;
const OUT = 'godot/assets/act3';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/wsboss_things.png`, pngRGBA(sheet));
writeFileSync(`${OUT}/wsboss.json`, JSON.stringify({
  tune: plain(WS_TUNE), tune2: plain(WS2_TUNE), lines: plain(WS_LINES),
  melds: plain(MELDS), meldIds: MELD_IDS,
  acts: plain(RULES!.acts), art, carry, landed: plain(landed), bones, runes,
  ice: { steps: plain(ICE_STEPS), from: ICE_FROM }, slams: plain(SLAMS),
  tile: TILE3, place: plain(FINAL_PLACE),
  // (how the pieces are chosen: art/act1_figs/wsboss.ts)
  fig: {
    ...Object.fromEntries(['THING_FPS', 'ORB_HIGH', 'ORB_N', 'ORB_SWELLS', 'ICE_U', 'TRAP_N', 'TREE_LIFE', 'TREE_OF', 'MELD_CLIP', 'WS_PHASE1', 'WS_PHASE2']
      .filter((k) => k in FIGX).map((k) => [k, plain(FIGX[k])])),
    // (not the art's to give: as it counts them, n(secs) = ceil(secs * THING_FPS))
    METEOR_FALL: Math.max(1, Math.ceil(EB.FIRE.fall * FIG.THING_FPS)), METEOR_LAND: Math.max(1, Math.ceil(0.6 * FIG.THING_FPS)), METEOR_BURN: 8,
  },
  things, pics: out,
  // (fallLanding for the art's lengths: where he lands, from the boar facing +x at 0, 0)
  landing: fallLanding(0, 0, 1, 0),
}) + '\n');
console.log(`the warped wordsmith: ${RULES!.acts.length} acts, ${MELD_IDS.length} melds; ${pics.length} pieces in a ${W}x${sheet.h} sheet; things: ${Object.entries(things).map(([k, n]) => `${k} ${n}`).join(', ')}`);
