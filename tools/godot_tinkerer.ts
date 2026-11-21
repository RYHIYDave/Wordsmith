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
import { BREW, CAP, VAPOUR, lampRing, thud, vialBurst, vialSprite } from '../src/dev/contraption_fx';
import { CHIP, SCORCH, blast, chips, scorch } from '../src/dev/blast_fx';
import { HEART, STEAM, burstSteam, shock } from '../src/dev/golem_pound_fx';
import { GUN_GLOW, IRON, impactBurst, muzzleFlash } from '../src/dev/golem_gun_fx';
import { GEARS, SPARKS, gears, sparks } from '../src/dev/golem_down_fx';
import { STUFF, crackStar, drawCrack } from '../src/dev/demon_fx';
import { golemCharge, makeContraptionArt, makeGolemArt } from '../src/art/tinkerer_art';
import { BOLT_FX, BOMB_FX, CBOLT, bombSprite, layShotAir, shotLayers } from '../src/dev/contraption_shots';
import { CONTRAPTION_BALL } from '../src/art/golem_shots_points';
import { BEAM_END_UP, BEAM_FRAMES, CHARGE_FX_LAST, contraptionBombBlastFx, golemChargeFx, golemShellBlastFx, golemShotAt } from '../src/art/golem_shots_fx';
import { BEAM_FX, SHELL_FX } from '../src/dev/golem_charge_fx';
import { CHARGE_SKID, GCHARGE, GCHARGE_BEAM, GCHARGE_SHELL } from '../src/dev/golem_moves';
import { UNITS_PER_TILE } from '../src/art/moves3';
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
// (brass sparks off a Contraption falling apart: its sparks without the Golem's gears)
for (let k = 0; k < 16; k++) fx.set(`sparks0:${k}`, piece(90, 80, 45, 60, 2, [GEARS, SPARKS], ([st, l]) => {
  void st;
  sparks(l, 45, 40, k, 7);
}));
for (let i = 0; i < 6; i++) fx.set(`puff:${i}`, piece(40, 34, 20, 28, 1, [SMOKE], ([sm]) => cloud(sm, 20, 28, 18, 15, i * 0.17, 0.2, 31 + i)));
// (ITS SMALL SHOT, render/tinkerer_fx.ts flashFrames: its cannon's flash out of its mouth, to the right or the left of the picture)
for (const way of [1, -1]) for (let k = 0; k < 6; k++) fx.set(`flash${way}:${k}`, piece(60, 50, 30, 25, 1, [GUN_GLOW], ([l]) => muzzleFlash(l, 30, 25, way, -0.3, k, 4)));
// (ITS BIG SHOT, art/golem_shots_fx.ts golemShellBlastFx: the shell's wide blast where it lands, its scorch on the floor and the
// rest in the air, at each radius it is painted at (to the half tile, the game's radiusOf: from 1.5 at no charge to 2.5 at its full))
// (HER TREE'S CONTRAPTION, render/tinkerer_fx.ts: its lamp's ring as it is lit; her little bomb tumbling, its fuse spitting; the
// bomb going off where it lands, its scorch on the floor and the rest in the air, as approved; and the Contraption itself, loaded
// with bombs or with energy, from in front and from behind: shut and tumbling as it is thrown, springing open, set up, its mortar
// kicked by a shot, broken)
for (let k = 0; k < 5; k++) fx.set(`lamp:${k}`, piece(30, 30, 15, 15, 1, [BREW], ([l]) => lampRing(l, 15, 15, k)));
for (let i = 0; i < 8; i++) {
  const ly = shotLayers();
  bombSprite(ly, 10, 10, (i / 8) * Math.PI * 2, i % 2 === 0);
  fx.set(`bomb:${i}`, layShotAir(20, 20, ly).sprite(10, 10, G));
}
{
  const b = contraptionBombBlastFx();
  for (let k = 0; k < BOMB_FX.long; k++) {
    fx.set(`bombF:${k}`, b.floor[k]);
    fx.set(`bombA:${k}`, b.air[k]);
  }
}
const conClips: Record<string, { n: number; fps: number }> = {};
for (const ammo of ['bombs', 'energy'] as const) {
  const art = makeContraptionArt(ammo);
  for (const view of ['front', 'back'] as const) {
    const set = art[view];
    set.tumble.forEach((sp, i) => fx.set(`con:${ammo}:${view}:tumble:${i}`, sp));
    conClips.tumble = { n: set.tumble.length, fps: 0 };
    fx.set(`con:${ammo}:${view}:stand:0`, set.stand[0]);
    for (const [name, c] of [['open', set.open], ['shot', set.shot], ['broke', set.broke]] as const) {
      conClips[name] = { n: c.frames.length, fps: c.fps };
      c.frames.forEach((sp, i) => fx.set(`con:${ammo}:${view}:${name}:${i}`, sp));
    }
  }
}
const SHELL_RADII = [1.5, 2, 2.5];
for (const r of SHELL_RADII) {
  const b = golemShellBlastFx(r);
  for (let k = 0; k < SHELL_FX.long; k++) {
    fx.set(`shell${r}F:${k}`, b.floor[k]);
    fx.set(`shell${r}A:${k}`, b.air[k]);
  }
}

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
// (ITS SMALL SHOT: its cannon brought down and fired, art/tinkerer_art.ts golemSet attack2)
for (const view of VIEWS) {
  const c = art[view].clips!.attack2!;
  clips.shot = { n: c.frames.length, fps: c.fps, hit: c.hit ?? null };
  c.frames.forEach((s, i) => golem.set(`${view}:shot:${i}`, s));
}
// (ITS BIG SHOT, frame by frame from her whistle (dev/golem_moves.ts chargeFrame says which): the cannon's shell, the tesla coil's
// beam; and everything at it as it braces, charges and fires, on the floor under it and in the air over it)
const charge: Record<string, number> = {};
for (const gun of ['cannon', 'tesla'] as const) for (const view of VIEWS) {
  const frames = golemCharge(view, gun);
  charge[gun] = frames.length;
  frames.forEach((s, i) => golem.set(`${gun}:${view}:charge:${i}`, s));
  const L = golemChargeFx(view, gun);
  for (let f = 0; f <= CHARGE_FX_LAST[gun]; f++) {
    golem.set(`${gun}:${view}:chFloor:${f}`, L.floor[f]);
    golem.set(`${gun}:${view}:chAir:${f}`, L.air[f]);
  }
}
// (HER TREE'S GUN ARM: the Golem with the tesla coil in its cannon's place, standing, running, rocket-jumping and winding down)
const tesla = makeGolemArt('tesla');
for (const view of VIEWS) {
  golem.set(`tesla:${view}:idle:0`, tesla[view].idle[0]);
  tesla[view].clips!.fall!.frames.forEach((s, i) => golem.set(`tesla:${view}:down:${i}`, s));
  golemRunFrames(view, 'tesla').forEach((s, i) => golem.set(`tesla:${view}:run:${i}`, s));
  golemRocketFrames(view, 'tesla').forEach((s, i) => golem.set(`tesla:${view}:rocket:${i}`, s));
  const off = golemLaunchFx(view, 'tesla');
  for (let k = 0; k < LAUNCH_N; k++) {
    golem.set(`tesla:${view}:launchFloor:${k}`, off.floor[k]);
    golem.set(`tesla:${view}:launchAir:${k}`, off.air[k]);
  }
}
// (WHERE ITS GUN'S MOUTH IS, art/golem_shots_fx.ts golemPoints, from its floor point, as the picture is not turned over: the
// cannon's as it fires its shell; the coil's each frame of its beam)
// (as the painter reads them: in the figures' own measure, the world's x and y along the floor and z up, golemShotAt's muzzle)
const muzzle: Record<string, number[][]> = {};
const mouth = (gun: 'cannon' | 'tesla', f: number, view: 'front' | 'back'): number[] => [...golemShotAt(gun, f, view, () => [0, 0]).muzzle];
for (const view of VIEWS) {
  muzzle[`cannon:${view}`] = [mouth('cannon', GCHARGE.fire, view)];
  muzzle[`tesla:${view}`] = Array.from({ length: BEAM_FRAMES + 1 }, (_, k) => mouth('tesla', GCHARGE.fire + k, view));
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
  // (ITS BIG SHOT: the art's frames, the shell's and the beam's numbers, where its gun's mouth is: art/golem_shots_fx.ts)
  charge: {
    frames: charge, fxLast: CHARGE_FX_LAST, C: GCHARGE, shell: GCHARGE_SHELL, beam: GCHARGE_BEAM, skid: CHARGE_SKID, shellFx: SHELL_FX, beamFx: BEAM_FX,
    beamFrames: BEAM_FRAMES, beamEndUp: BEAM_END_UP, muzzle, unitsPerTile: UNITS_PER_TILE, shellRadii: SHELL_RADII,
  },
}));
writeFileSync('godot/assets/heroes/tinkerer_fx.json', JSON.stringify({
  pics: pack(fx, 'tinkerer_fx'),
  brew: BREW,
  gunGlow: GUN_GLOW,
  // (her tree's CONTRAPTION: its clips; its energy ball as it fires, as it is built (art/golem_shots_points.ts); the bolt's and
  // the bomb's numbers)
  con: { clips: conClips, ball: CONTRAPTION_BALL, CBOLT, BOLT_FX, BOMB_FX },
}));
