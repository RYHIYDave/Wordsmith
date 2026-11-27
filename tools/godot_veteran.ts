// THE GODOT PORT: THE BRAWLER (THE VETERAN)'S NUMBERS AND HIS EFFECTS' PIECES, as the game has them (game/veteran.ts, game/
// veteran_baked.ts; the art chat's moves, dev/veteran_moves.ts; render/veteran_fx.ts, made of dev/veteran_fx.ts):
//   veteran.json   his moves' numbers (VET_MOVES, VET_REACT, VET_TUNE), the order the bake keeps his moves' lists in (VET_LISTS),
//                  and for every move, frame by frame, what the game reads of the art: where the floor point under him is (the
//                  carry the game carries him by), where his head is (his globes ride over it) and how high he is; each frame and
//                  half-frame's place (his after-images); its strike (when it lands and its last blow, punch or kick, heavy, how
//                  big its burst and where from, its ring under the one it lands on); the frames it shakes the screen; and his
//                  globes' colours (dev/veteran_globes.ts: painted where the game draws them, by heroes/brawler_look.gd).
//   veteran_fx     the pieces painted once at the heroes' grain: the BURST where each blow lands (each move's own, four seeds,
//                  7 frames), the SHOCKWAVE RING under a heavy blow (10 frames), and the STARS round a launched one's head (40).
//   npx tsx tools/godot_veteran.ts   -> godot/assets/heroes/veteran.json, veteran_fx-0.png + veteran_fx.json
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { toSprite, INK } from '../src/art/kit';
import { VET_FPS, VET_MOVES, VET_REACT, VET_TUNE } from '../src/game/veteran';
import { VET_BAKED } from '../src/game/veteran_baked';
import { VET_LISTS, vetHalvesOf } from '../src/art/veteran_art';
import { VET_FX_AFTER, vetJointAt, vetLastHit, vetLiftAt } from '../src/art/veteran_fx_art';
import { VET_STAND, VET_TILE, forceGeo, motionById, placeOf } from '../src/dev/veteran_moves';
import { FX_KICK, FX_PUNCH, floorRing, impact, stars } from '../src/dev/veteran_fx';
import { GLOBE, GLOBES_H, GLOBE_GREEN, GLOBE_ORANGE, GLOBE_WHITE } from '../src/dev/veteran_globes';
import { BRAWL_TUNE } from '../src/game/brawler';

paintWithoutCanvas();
gameSwitches();

const kindCols = (k: 'punch' | 'kick'): readonly string[] => (k === 'kick' ? FX_KICK : FX_PUNCH);
/** (render/veteran_fx.ts kept) A little picture painted the art's way, its anchor its middle. */
function kept(w: number, h: number, paint: (px: Px) => void): Sprite {
  const px = new Px(w, h);
  paint(px);
  return toSprite({ px, lights: [] }, null, w / 2, h / 2);
}

const pics = new Map<string, Sprite>();
const moves: Record<string, unknown> = {};
const r3 = (v: number): number => Math.round(v * 1000) / 1000;
for (const id of VET_LISTS) {
  const m = motionById(id);
  const n = m.long + VET_FX_AFTER;
  // (each frame: the head over the place, his measure along his forward and left, and up; how high his lowest foot is)
  const head: number[][] = [];
  const lift: number[] = [];
  for (let F = 0; F < m.long; F++) {
    const hd = vetJointAt(m, F, 'head');
    const o = placeOf(m, F).at;
    head.push([r3(hd[0] - o[0]), r3(hd[1] - o[1]), r3(hd[2])]);
    lift.push(r3(vetLiftAt(m, F)));
  }
  // (each half-frame's place: his after-images are laid where he was a frame and half a frame ago)
  const at: number[][] = [];
  for (let k = 0; k <= m.long * 2; k++) {
    const o = placeOf(m, k / 2).at;
    at.push([r3(o[0]), r3(o[1])]);
  }
  const strikes = m.strikes.map((s) => {
    const react = s.force?.react ?? s.cone?.react ?? 'snap';
    const heavy = s.cone ? false : s.heavy;
    const big = s.cone ? 0.9 : (s.burst ?? 1);
    const o = s.force ? forceGeo(m, s).o : null;
    return { from: s.from, at: s.at, last: vetLastHit(s), kind: s.kind, heavy, big, under: !!s.under, ring: heavy && react !== 'shove' && react !== 'floored' ? (react === 'fly' || react === 'launch' ? 1.4 : 1) : 0, o: o ? [r3(o[0]), r3(o[1]), r3(o[2])] : null };
  });
  // (the bursts of its first strike, as render/veteran_fx.ts burstOn makes them: four seeds, 7 frames each)
  const s0 = strikes[0];
  if (s0) {
    for (let seed = 0; seed < 4; seed++) {
      for (let age = 0; age <= 6; age++) {
        const key = `burst|${s0.kind}|${s0.heavy}|${s0.big}|${101 + seed * 17}|${age}`;
        if (!pics.has(key)) pics.set(key, kept(160, 140, (px) => impact(px, 80, 70, age, kindCols(s0.kind), s0.heavy, 101 + seed * 17, s0.big)));
      }
    }
    if (s0.ring) for (let age = 0; age <= 9; age++) {
      const key = `ring|${s0.kind}|${s0.ring}|${age}`;
      if (!pics.has(key)) pics.set(key, kept(240, 120, (px) => floorRing(px, 120, 60, age, kindCols(s0.kind), s0.ring)));
    }
  }
  moves[id] = { long: m.long, fx: n, head, lift, at, strikes, shake: m.shake ?? [], halves: vetHalvesOf(m), place: VET_BAKED[id].place.map((p) => [r3(p[0]), r3(p[1])]) };
}
for (let k = 0; k < 40; k++) pics.set(`stars|${k}`, kept(32, 16, (px) => stars(px, 16, 8, (k / 40) * ((Math.PI * 2) / 0.32))));
const standHead = vetJointAt(VET_STAND, 0, 'head');
const standAt = placeOf(VET_STAND, 0).at;

// ---- THE SHEET (as tools/godot_tinkerer.ts) ----
function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}
const SHEET_W = 2048;
const placed: Record<string, number[]> = {};
const trims = new Map<string, { x0: number; y0: number }>();
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, s] of pics) {
  const p = paintingOf(s);
  let x0 = p.w;
  let y0 = p.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3] > 0) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) {
    placed[key] = [];
    continue;
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  trims.set(key, { x0, y0 });
  if (cx + w > SHEET_W) {
    cx = 0;
    cy += rowH + 1;
    rowH = 0;
  }
  const dn = s.density ?? 1;
  placed[key] = [cx, cy, w, h, s.ax * dn - x0, s.ay * dn - y0];
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * H * 4);
for (const [key, s] of pics) {
  const at = placed[key];
  if (!at.length) continue;
  const [sx, sy, w, h] = at;
  const t = trims.get(key)!;
  const p = paintingOf(s);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const o = ((t.y0 + j) * p.w + t.x0 + i) * 4;
    const d = ((sy + j) * SHEET_W + sx + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
}
writeFileSync('godot/assets/heroes/veteran_fx-0.png', png(SHEET_W, H, sheet));
writeFileSync('godot/assets/heroes/veteran_fx.json', JSON.stringify({ pics: placed }));
writeFileSync('godot/assets/heroes/veteran.json', JSON.stringify({
  fps: VET_FPS,
  tile: VET_TILE,
  after: VET_FX_AFTER,
  lists: VET_LISTS,
  rules: VET_MOVES,
  react: VET_REACT,
  tune: VET_TUNE,
  // (a launched one thrown up: game/brawler.ts BRAWL_TUNE.talents.bigUppercut, game.ts popUp and comeDown)
  up: BRAWL_TUNE.talents.bigUppercut,
  // (his blows' colours, dev/veteran_fx.ts: a punch's, a kick's)
  cols: { punch: FX_PUNCH, kick: FX_KICK },
  moves,
  standHead: [r3(standHead[0] - standAt[0]), r3(standHead[1] - standAt[1]), r3(standHead[2])],
  // (his globes, dev/veteran_globes.ts: their size; the punch's green, the kick's hot orange, the jump's white; the glass; the ink)
  globe: { ...GLOBE, h: GLOBES_H, green: GLOBE_GREEN, orange: GLOBE_ORANGE, white: GLOBE_WHITE, glass: ['#141230', '#1e1b44', '#2a2758', '#4a4688', '#8c88c8'], ink: INK },
}));
console.log(`veteran: ${VET_LISTS.length} moves; ${pics.size} pieces in a ${SHEET_W}x${H} sheet`);
