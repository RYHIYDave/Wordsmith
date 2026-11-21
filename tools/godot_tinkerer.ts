// THE GODOT PORT: THE TINKERER'S GOLEM AND HER EFFECTS, each painted once at the heroes' grain as the game paints them, kept here as
// pictures (the game paints them as they are first wanted: art/tinkerer_art.ts makeGolemArt, art/golem_rocket_fx.ts, render/
// tinkerer_fx.ts).
//   THE GOLEM (its cannon arm, as he picked it; her tree's other arm is for when her tree is in), from in front and truly from
//   behind: standing; its uppercut, its ground pound (its combo's slam too) and its winding down, frame by frame (30 a second);
//   ITS RUN (GOLEM_ROCKET: the art chat's gallop in place of its walk); ITS ROCKET JUMP frame by frame from deciding to jump
//   (ROCKET.end), and everything at it (the light of its stacks' fire on the floor, what is behind it and over it); where it took
//   off (its scorch, its flash, fire, dust and stone, its after-image) and where it came down (its crater, dust and stone); the
//   three puffs of its trail through their lives; and where each puff of its trail is born, for each frame of its flight.
//   HER EFFECTS (render/tinkerer_fx.ts, of the art chat's pieces): her vial tumbling (8), its burst (18), a thud of dust (14), her
//   bomb going off (24) and its scorch (8), the Golem's pound on the floor and in the air (24 each), its dropping in (18), its
//   fist landing (10), its sparks and gears winding down (16), a puff of her bomb's smoke (6).
// Each at two picture pixels to a game pixel, its anchor kept, trimmed to what is painted in it.
//   npx tsx tools/godot_tinkerer.ts   -> godot/assets/heroes/golem-N.png + golem.json, tinkerer_fx.png + tinkerer_fx.json
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { Light, SMOKE, cloud } from '../src/dev/warlock_fx';
import { BREW, CAP, VAPOUR, thud, vialBurst, vialSprite } from '../src/dev/contraption_fx';
import { CHIP, SCORCH, blast, chips, scorch } from '../src/dev/blast_fx';
import { HEART, STEAM, burstSteam, shock } from '../src/dev/golem_pound_fx';
import { GUN_GLOW, IRON, impactBurst } from '../src/dev/golem_gun_fx';
import { GEARS, SPARKS, gears, sparks } from '../src/dev/golem_down_fx';
import { STUFF, crackStar, drawCrack } from '../src/dev/demon_fx';
import { makeGolemArt } from '../src/art/tinkerer_art';
import { LAND_N, LAUNCH_N, PUFF_LIFE, ROCKET, ROCKET_ARC, RUN_STRIDE, golemLandFx, golemLaunchFx, golemRocketFrames, golemRocketFx, golemRunFrames, rocketPuffFx, rocketTrail } from '../src/art/golem_rocket_fx';
import { TINKER_TUNE, COMBO_TUNE, GOLEM_COMBO, GOLEM_CANNON, golemBlow } from '../src/game/tinkerer';
import { GOLEM_R } from '../src/game/game';
import { P } from '../src/art/palette';

paintWithoutCanvas();
gameSwitches();
const G = 2;
const VIEWS = ['front', 'back'] as const;

// ---- HER EFFECTS (render/tinkerer_fx.ts piece, its lights laid in the order given) ----
function piece(w: number, h: number, ax: number, ay: number, lights: number, ramps: readonly (readonly string[])[], paint: (l: Light[]) => void): Sprite {
  const px = new Px(w, h);
  const ls = Array.from({ length: lights }, () => new Light());
  paint(ls);
  ls.forEach((l, i) => l.lay(px, ramps[i]));
  return px.sprite(ax, ay, G);
}
const fx = new Map<string, Sprite>();
for (let i = 0; i < 8; i++) fx.set(`vial:${i}`, piece(16, 16, 8, 8, 2, [CAP, BREW], ([cap, brew]) => vialSprite(brew, cap, 8, 8, (i / 8) * Math.PI * 2)));
for (let k = 0; k < 18; k++) fx.set(`burst:${k}`, piece(84, 64, 42, 46, 2, [VAPOUR, BREW], ([va, l]) => vialBurst(l, va, 42, 40, 46, k, k / 30, 5)));
// (her tree's MAD MIXTURE: a vial's burst in its brew's colours, burning, freezing, poisoning: render/tinkerer_fx.ts BREWS)
const BREWS: Record<string, readonly [readonly string[], readonly string[]]> = {
  burn: [[P.fr1, P.fr2, P.fr3, P.fr4], [P.fr2, P.fr3, P.fr4, P.fr6]],
  freeze: [[P.bu1, P.bu2, P.bu3, P.bu4], [P.bu2, P.bu3, P.bu4, P.bu5]],
  poison: [[P.vn1, P.vn2, P.vn2, P.vn3], [P.vn2, P.vn3, P.vn4, P.vn5]],
};
for (const b of Object.keys(BREWS)) for (let k = 0; k < 18; k++) fx.set(`burst-${b}:${k}`, piece(84, 64, 42, 46, 2, BREWS[b], ([va, l]) => vialBurst(l, va, 42, 40, 46, k, k / 30, 5)));
for (let k = 0; k < 14; k++) fx.set(`thud:${k}`, piece(60, 30, 30, 22, 1, [SMOKE], ([sm]) => thud(sm, 30, 22, k, 3, 1)));
for (let k = 0; k < 24; k++) fx.set(`blast:${k}`, piece(120, 120, 60, 96, 3, [CHIP, SMOKE, BREW], ([st, sm, l]) => {
  blast(l, sm, 60, 96, k, k / 30, 7);
  chips(st, l, 60, 96, k, 7);
}));
for (let i = 0; i < 8; i++) fx.set(`scorch:${i}`, piece(50, 24, 25, 12, 2, [SCORCH, BREW], ([sc, l]) => scorch(sc, l, 25, 12, i * 5, 7)));
for (let k = 0; k < 24; k++) fx.set(`poundF:${k}`, piece(200, 110, 100, 55, 3, [STUFF, STEAM, HEART], ([dk, st, l]) => {
  const S = (p: readonly number[]): [number, number] => [100 + p[0], 55 + p[1] * 0.5];
  const heat = k < 4 ? 3 : k < 12 ? 2 : k < 20 ? 1 : 0;
  for (const c of crackStar(0, 0, 7, 40, 5, 9)) drawCrack(dk, l, c, Math.min(1, (k + 1) / 3), heat, S);
  shock(st, 100, 55, k, k / 30, 3);
}));
for (let k = 0; k < 24; k++) fx.set(`poundA:${k}`, piece(120, 110, 60, 90, 1, [STEAM], ([st]) => burstSteam(st, 60, 80, k * 1.6, k / 30, 1, 5)));
for (let k = 0; k < 18; k++) fx.set(`arrive:${k}`, piece(160, 110, 80, 80, 1, [STEAM], ([st]) => {
  shock(st, 80, 80, k, k / 30, 11);
  burstSteam(st, 80, 70, k * 1.6, k / 30, 0.8, 13);
}));
for (let k = 0; k < 10; k++) fx.set(`impact:${k}`, piece(70, 70, 35, 35, 2, [IRON, GUN_GLOW], ([iron, l]) => {
  void iron;
  impactBurst(l, 35, 35, k, 3, 1);
}));
for (let k = 0; k < 16; k++) fx.set(`sparks:${k}`, piece(90, 80, 45, 60, 2, [GEARS, SPARKS], ([st, l]) => {
  sparks(l, 45, 40, k, 7);
  gears(st, 45, 40, 60, k, 7, 1);
}));
for (let i = 0; i < 6; i++) fx.set(`puff:${i}`, piece(40, 34, 20, 28, 1, [SMOKE], ([sm]) => cloud(sm, 20, 28, 18, 15, i * 0.17, 0.2, 31 + i)));

// ---- THE GOLEM ----
const golem = new Map<string, Sprite>();
const clips: Record<string, { n: number; fps: number; hit: number | null }> = {};
let aura: { x: number; y: number; r: number; color: string; a: number } | null = null;
const art = makeGolemArt('cannon');
for (const view of VIEWS) {
  const set = art[view];
  const idle = set.idle[0];
  golem.set(`${view}:idle:0`, idle);
  if (!aura && idle.aura) aura = { x: idle.aura.x - idle.ax, y: idle.aura.y - idle.ay, r: idle.aura.r, color: idle.aura.color, a: idle.aura.a };
  const c = set.clips!;
  for (const [name, clip] of [['punch', c.attack!], ['pound', c.heavy!], ['down', c.fall!]] as const) {
    clips[name] = { n: clip.frames.length, fps: clip.fps, hit: clip.hit ?? null };
    clip.frames.forEach((s, i) => golem.set(`${view}:${name}:${i}`, s));
  }
  golemRunFrames(view, 'cannon').forEach((s, i) => golem.set(`${view}:run:${i}`, s));
  golemRocketFrames(view, 'cannon').forEach((s, i) => golem.set(`${view}:rocket:${i}`, s));
  const at = golemRocketFx(view);
  for (let f = 0; f <= ROCKET.end; f++) {
    golem.set(`${view}:atFloor:${f}`, at.floor[f]);
    golem.set(`${view}:atBehind:${f}`, at.behind[f]);
    golem.set(`${view}:atOver:${f}`, at.over[f]);
  }
  const off = golemLaunchFx(view, 'cannon');
  for (let k = 0; k < LAUNCH_N; k++) {
    golem.set(`${view}:launchFloor:${k}`, off.floor[k]);
    golem.set(`${view}:launchAir:${k}`, off.air[k]);
  }
  const down = golemLandFx(view);
  for (let k = 0; k < LAND_N; k++) {
    golem.set(`${view}:landFloor:${k}`, down.floor[k]);
    golem.set(`${view}:landAir:${k}`, down.air[k]);
  }
}
rocketPuffFx().forEach((list, v) => list.forEach((s, age) => golem.set(`puff${v}:${age}`, s)));
// (ITS TRAIL: the puffs born at each frame b of its flight, for each view, turned over or not: where they are (tiles from where it
// took off, less the way it has come, dx and dy times b over its flight, which the game adds) and how high, and which puff)
const trail: Record<string, [number, number, number, number][][]> = {};
for (const view of VIEWS) for (const flip of [false, true]) {
  const births: [number, number, number, number][][] = [[]];
  for (let b = 1; b <= ROCKET.flight; b++) births.push(rocketTrail(view, flip, 0, 0, b).filter((p) => p.age === 0).map((p) => [p.x, p.y, p.up, p.v]));
  trail[`${view}:${flip ? 1 : 0}`] = births;
}

// ---- THE SHEETS ----
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
/** Every picture trimmed to what is painted in it, laid on sheets SHEET_W wide and at most SHEET_H tall: [x, y, w, h, ax, ay, sheet]. */
const SHEET_W = 2048;
const SHEET_H = 4096;
function pack(pics: Map<string, Sprite>, name: string): Record<string, number[]> {
  const placed: Record<string, number[]> = {};
  const trims = new Map<string, { x0: number; y0: number; w: number; h: number }>();
  const heights: number[] = [];
  let sheet = 0;
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
      // (nothing painted in it: none laid)
      placed[key] = [];
      continue;
    }
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    trims.set(key, { x0, y0, w, h });
    if (cx + w > SHEET_W) {
      cx = 0;
      cy += rowH + 1;
      rowH = 0;
    }
    if (cy + h > SHEET_H) {
      heights.push(cy);
      sheet++;
      cx = 0;
      cy = 0;
      rowH = 0;
    }
    const dn = s.density ?? 1;
    placed[key] = [cx, cy, w, h, s.ax * dn - x0, s.ay * dn - y0, sheet];
    cx += w + 1;
    rowH = Math.max(rowH, h);
  }
  heights.push(cy + rowH);
  const sheets = heights.map((H) => new Uint8ClampedArray(SHEET_W * Math.max(1, H) * 4));
  for (const [key, s] of pics) {
    const at = placed[key];
    if (!at.length) continue;
    const [sx, sy, w, h, , , n] = at;
    const t = trims.get(key)!;
    const p = paintingOf(s);
    const out = sheets[n];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const o = ((t.y0 + j) * p.w + t.x0 + i) * 4;
      const d = ((sy + j) * SHEET_W + sx + i) * 4;
      for (let c = 0; c < 4; c++) out[d + c] = p.d[o + c];
    }
  }
  sheets.forEach((d, n) => writeFileSync(`godot/assets/heroes/${name}-${n}.png`, png(SHEET_W, Math.max(1, heights[n]), d)));
  console.log(`${name}: ${pics.size} pictures on ${sheets.length} sheet(s) ${SHEET_W} wide, ${heights.join(', ')} tall`);
  return placed;
}
const blow = golemBlow();
writeFileSync('godot/assets/heroes/golem.json', JSON.stringify({
  pics: pack(golem, 'golem'),
  clips,
  aura,
  trail,
  tune: TINKER_TUNE,
  combo: { on: GOLEM_COMBO.on, ...COMBO_TUNE },
  cannon: GOLEM_CANNON.on,
  blow,
  radius: GOLEM_R,
  rocket: { ...ROCKET, high: ROCKET_ARC.high, top: ROCKET_ARC.top, launchN: LAUNCH_N, landN: LAND_N, puffLife: PUFF_LIFE },
  runStride: RUN_STRIDE,
}));
writeFileSync('godot/assets/heroes/tinkerer_fx.json', JSON.stringify({ pics: pack(fx, 'tinkerer_fx'), brew: BREW, gunGlow: GUN_GLOW }));
