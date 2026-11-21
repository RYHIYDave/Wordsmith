// THE GODOT PORT: THE GOLEM THAT ONLY SHOOTS, IN ITS NEW LOOK (dev/sculpt_golem.ts GOLEM_RANGED: one great wheel in place of its
// legs, its big gun at its side in place of its giant fist; his picks of 21 Nov 2026, “fist to a big gun, but id like him to have
// 1 wheel instead of legs” and, of three ways to carry it, “At its side”), each picture painted once at the heroes' grain as the
// game paints the Golem, kept as pictures in the same shape as tools/godot_tinkerer.ts keeps its old look (golem.json):
//   standing; ITS ROLL (GROLL.n frames to a sixth of a turn of its wheel, by the floor it covers); its small shot (its little
//   cannon, as it was); ITS BIG SHOT from the gun at its side, the cannon's shell or (her tree's Gun Arm) the beam, by the charged
//   shot's own frames, and everything at it as it braces, charges and fires (its gun's mouth, its stacks, its wheel on the floor,
//   measured afresh from this look); its rocket jump and everything at it, its take-offs and landings; its winding down; the
//   tesla coil's set (her tree's Gun Arm) on its little arm.
// heroes/tinkerer_look.gd draws this look in place of the old one with its switch WHEEL_LOOK on (off until he says yes).
//   npx tsx tools/godot_golem_wheel.ts   -> godot/assets/heroes/golem_wheel-N.png + golem_wheel.json
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { toSprite } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import type { GameView } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_BIG_MUZZLE, GOLEM_POSE, GOLEM_RANGED, sculptGolemBuild } from '../src/dev/sculpt_golem';
import type { GolemGun } from '../src/dev/sculpt_golem';
import { CHARGE_SKID, GCHARGE, GCHARGE_BEAM, GCHARGE_SHELL, GDOWN, GROLL, golemChargeWheel, golemDownWheel, golemRoll } from '../src/dev/golem_moves';
import { makeGolemArt } from '../src/art/tinkerer_art';
import { GOLEM_SHOT_POINTS } from '../src/art/golem_shots_points';
import { BEAM_END_UP, BEAM_FRAMES, CHARGE_FX_LAST, golemChargeFx, golemShotAt } from '../src/art/golem_shots_fx';
import { BEAM_FX, SHELL_FX } from '../src/dev/golem_charge_fx';
import { LAND_N, LAUNCH_N, PUFF_LIFE, ROCKET, ROCKET_ARC, golemLandFx, golemLaunchFx, golemRocketFrames, golemRocketFx, rocketPuffFx, rocketTrail } from '../src/art/golem_rocket_fx';
import { TINKER_TUNE, COMBO_TUNE, GOLEM_COMBO, GOLEM_CANNON, golemBlow } from '../src/game/tinkerer';
import { GOLEM_R } from '../src/game/game';
import { UNITS_PER_TILE } from '../src/art/moves3';

paintWithoutCanvas();
gameSwitches();
GOLEM_RANGED.on = true;
GOLEM_RANGED.carry = 'side';
const VIEWS = ['front', 'back'] as const;
/** The Golem as the game draws it: turned 45 from in front, 135 truly from behind (art/tinkerer_art.ts GOLEM_TURN). */
const GOLEM_TURN: Record<GameView, number> = { front: 45, back: 135 };
/** Its pool of light, as the heroes' (art/tinkerer_art.ts AURA). */
const AURA = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };
type Pose = Partial<typeof GOLEM_POSE> & { aim?: number; kick?: number; charge?: number; gunLevel?: number };

/** It posed so, drawn (its pose put back after). */
function at(view: GameView, pose: Pose, gun: GolemGun): Sprite {
  Object.assign(GOLEM_POSE, REST, pose);
  try {
    return toSprite({ px: sculptGolemBuild('front', 'ape', GOLEM_TURN[view], -14, true, gun, pose.aim ?? 0, pose.kick ?? 0, pose.charge ?? 0, pose.gunLevel ?? 0).px, lights: [] }, AURA, CANVAS3.ax, CANVAS3.ay);
  } finally {
    Object.assign(GOLEM_POSE, REST);
  }
}

// ---- WHERE ITS BIG SHOT COMES FROM (as tests/golem_shots_measure.ts measures the old look, in the measure it is built in) ----
// (its gun's mouth and way; for the beam, its big gun's breech and mouth for the arcs crawling along it; its stacks' mouths; its
// wheel where it meets the floor, either side and in the middle, for the grit of its skid)
for (const gun of ['cannon', 'tesla'] as const) {
  const kind = gun === 'tesla' ? 'beam' : 'shell';
  const end = gun === 'tesla' ? GCHARGE_BEAM.end : GCHARGE_SHELL.end;
  const v: number[] = [];
  let per = 0;
  for (let f = GCHARGE.aimed; f <= end; f++) {
    const q = golemChargeWheel(kind, f);
    Object.assign(GOLEM_POSE, REST, q);
    try {
      sculptGolemBuild('front', 'ape', 45, -14, true, gun, 0, 0, 0, 0);
    } finally {
      Object.assign(GOLEM_POSE, REST);
    }
    const sc = LAST.sc as Sculpt;
    const stacks = sc.prims.filter((p) => p.tag === 'mouth' && p.k === 'cone').map((p) => {
      const m = p as unknown as { a: V3; b: V3 };
      return [(m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2, Math.max(m.a[2], m.b[2])];
    });
    const tyre = sc.prims.find((p) => p.tag === 'tyre' && p.k === 'cone') as unknown as { a: V3; b: V3 } | undefined;
    if (stacks.length !== 2 || !tyre) throw new Error(`godot_golem_wheel: ${stacks.length} stacks, tyre ${!!tyre}, at frame ${f}`);
    const grip = [[tyre.a[0], tyre.a[1], 0], [tyre.b[0], tyre.b[1], 0], [(tyre.a[0] + tyre.b[0]) / 2, (tyre.a[1] + tyre.b[1]) / 2, 0]];
    const coil = gun === 'tesla' ? [...GOLEM_BIG_MUZZLE.breech, ...GOLEM_BIG_MUZZLE.p] : [];
    const row = [...GOLEM_BIG_MUZZLE.p, ...GOLEM_BIG_MUZZLE.way, ...coil, ...stacks.flat(), ...grip.flat()];
    per = row.length;
    v.push(...row);
  }
  GOLEM_SHOT_POINTS[gun] = { from: GCHARGE.aimed, per, n: v.length / per, v };
}

// ---- ITS PICTURES ----
const golem = new Map<string, Sprite>();
const clips: Record<string, { n: number; fps: number; hit: number | null }> = {};
let aura: { x: number; y: number; r: number; color: string; a: number } | null = null;
const charge: Record<string, number> = {};
for (const gun of ['cannon', 'tesla'] as const) {
  const tag = gun === 'tesla' ? 'tesla:' : '';
  const art = makeGolemArt(gun);
  for (const view of VIEWS) {
    const set = art[view];
    const idle = set.idle[0];
    golem.set(`${tag}${view}:idle:0`, idle);
    if (!aura && idle.aura) aura = { x: idle.aura.x - idle.ax, y: idle.aura.y - idle.ay, r: idle.aura.r, color: idle.aura.color, a: idle.aura.a };
    // (ITS WINDING DOWN, slumped over its wheel)
    clips.down = { n: GDOWN.end + 1, fps: 30, hit: null };
    for (let f = 0; f <= GDOWN.end; f++) golem.set(`${tag}${view}:down:${f}`, at(view, golemDownWheel(f), gun));
    if (gun === 'cannon') {
      const c = set.clips!.attack2!;
      clips.shot = { n: c.frames.length, fps: c.fps, hit: c.hit ?? null };
      c.frames.forEach((s, i) => golem.set(`${view}:shot:${i}`, s));
    }
    // (ITS ROLL)
    for (let i = 0; i < GROLL.n; i++) golem.set(`${tag}${view}:run:${i}`, at(view, golemRoll(i), gun));
    golemRocketFrames(view, gun).forEach((s, i) => golem.set(`${tag}${view}:rocket:${i}`, s));
    const off = golemLaunchFx(view, gun);
    for (let k = 0; k < LAUNCH_N; k++) {
      golem.set(`${tag}${view}:launchFloor:${k}`, off.floor[k]);
      golem.set(`${tag}${view}:launchAir:${k}`, off.air[k]);
    }
    // (ITS BIG SHOT, from the gun at its side: frame by frame from her whistle; and everything at it)
    const kind = gun === 'tesla' ? 'beam' : 'shell';
    const end = gun === 'tesla' ? GCHARGE_BEAM.end : GCHARGE_SHELL.end;
    for (let f = 0; f <= end; f++) golem.set(`${gun}:${view}:charge:${f}`, at(view, golemChargeWheel(kind, f), gun));
    charge[gun] = end + 1;
    const L = golemChargeFx(view, gun);
    for (let f = 0; f <= CHARGE_FX_LAST[gun]; f++) {
      golem.set(`${gun}:${view}:chFloor:${f}`, L.floor[f]);
      golem.set(`${gun}:${view}:chAir:${f}`, L.air[f]);
    }
  }
}
for (const view of VIEWS) {
  const atIt = golemRocketFx(view);
  for (let f = 0; f <= ROCKET.end; f++) {
    golem.set(`${view}:atFloor:${f}`, atIt.floor[f]);
    golem.set(`${view}:atBehind:${f}`, atIt.behind[f]);
    golem.set(`${view}:atOver:${f}`, atIt.over[f]);
  }
  const down = golemLandFx(view);
  for (let k = 0; k < LAND_N; k++) {
    golem.set(`${view}:landFloor:${k}`, down.floor[k]);
    golem.set(`${view}:landAir:${k}`, down.air[k]);
  }
}
rocketPuffFx().forEach((list, v) => list.forEach((s, age) => golem.set(`puff${v}:${age}`, s)));
const trail: Record<string, [number, number, number, number][][]> = {};
for (const view of VIEWS) for (const flip of [false, true]) {
  const births: [number, number, number, number][][] = [[]];
  for (let b = 1; b <= ROCKET.flight; b++) births.push(rocketTrail(view, flip, 0, 0, b).filter((p) => p.age === 0).map((p) => [p.x, p.y, p.up, p.v]));
  trail[`${view}:${flip ? 1 : 0}`] = births;
}
// (where its big gun's mouth is: the cannon's as it fires its shell, the beam's each frame of it)
const muzzle: Record<string, number[][]> = {};
const mouth = (gun: 'cannon' | 'tesla', f: number, view: 'front' | 'back'): number[] => [...golemShotAt(gun, f, view, () => [0, 0]).muzzle];
for (const view of VIEWS) {
  muzzle[`cannon:${view}`] = [mouth('cannon', GCHARGE.fire, view)];
  muzzle[`tesla:${view}`] = Array.from({ length: BEAM_FRAMES + 1 }, (_, k) => mouth('tesla', GCHARGE.fire + k, view));
}

// ---- THE SHEETS (as tools/godot_tinkerer.ts lays them) ----
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
    const a = placed[key];
    if (!a.length) continue;
    const [sx, sy, w, h, , , n] = a;
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
writeFileSync('godot/assets/heroes/golem_wheel.json', JSON.stringify({
  pics: pack(golem, 'golem_wheel'),
  clips,
  aura,
  trail,
  tune: TINKER_TUNE,
  combo: { on: GOLEM_COMBO.on, ...COMBO_TUNE },
  cannon: GOLEM_CANNON.on,
  blow: golemBlow(),
  radius: GOLEM_R,
  rocket: { ...ROCKET, high: ROCKET_ARC.high, top: ROCKET_ARC.top, launchN: LAUNCH_N, landN: LAND_N, puffLife: PUFF_LIFE },
  // (ITS ROLL: GROLL.n frames to a sixth of a turn of its wheel, over this many tiles of floor)
  runStride: GROLL.stride / UNITS_PER_TILE,
  runN: GROLL.n,
  charge: {
    frames: charge, fxLast: CHARGE_FX_LAST, C: GCHARGE, shell: GCHARGE_SHELL, beam: GCHARGE_BEAM, skid: CHARGE_SKID, shellFx: SHELL_FX, beamFx: BEAM_FX,
    beamFrames: BEAM_FRAMES, beamEndUp: BEAM_END_UP, muzzle, unitsPerTile: UNITS_PER_TILE, shellRadii: [1.5, 2, 2.5],
  },
}));
