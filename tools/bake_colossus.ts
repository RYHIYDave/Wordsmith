// THE SWAMP COLOSSUS BAKED (his pick of 8 Nov 2026, “Wait for his pictures”; the art chat's go, board 13:43: “BAKE THE SWAMP COLOSSUS
// FROM art/eye-redo AT 2c73b0ef”). Every layer of him painted ONCE here by the art chat's own painter (art/eye_colossus.ts paintColossus,
// raw, in the same boxes as its tools/eye_moves_pics.ts), from the art's own frames (art/eye_moves.ts eyeFrame: his stand, his lurk, his
// entrance), and each frame then laid as that tool lays it (its `merge`): his layers (his jaws, his spittle, his tongue and eye) each
// moved by its drop, back and across, every pixel the nearest of them; what of him is over the water in his own colours; what is under it
// seen through it as the art sees it (darker and greener the deeper, only his fire seen deep down, by how sunk he is); and the pink edge
// round him where he is over the water. The game's own water, foam and rings are drawn round him by the game.
// HIS TENTACLES the cheaper way (the art's README, stage 3, “What they cost”; the main chat's pick, board 8 Nov 07:30): each of the five
// (0, 1, 2 the left, middle and right of phases 2 and 3; 3, 4 phase 1's left and right) its own figure laid from his middle as he is:
// its stand (45 frames, its clock the fight's own, game/colossus_fight.ts armClock), its burst up out of the water (32 frames, begun
// as that clock is on its 13th frame, so that it ends on its stand's first), its slam on the stone at every 15 degrees of turn (74
// frames each; the game turns each by up to 7.5 degrees about its root), the left and right ones' water slams (74), struck standing
// (14 frames, from three points of its stand), and its death from its stand (90). His entrance's tentacles are in his entrance's
// pictures. Their strikes leave their last frame faintly behind them, as the art's films do.
// Each frame a picture, cropped to what there is, packed into sheets (each PNG under the page's 16 MB), each group of moves in sheets of
// its own (his lurk; his stand; his entrance; each tentacle's stand, burst, flinches and death; each slam), so that the game holds only
// what a phase wants; with a manifest: each picture's sheet, place, and its corner from his middle at the water; each move's frames as
// their pictures; each tentacle's root.
//   npx tsx tools/bake_colossus.ts paint <cache> <i> <n> [move ...]   worker i of n paints the layers not yet in the cache (two at once:
//                                                                     the machine has two cores); `<i> <n>` as `r x`, from the last back
//   npx tsx tools/bake_colossus.ts pack <cache> <out> <half 0|1> [move ...]   the sheets and the manifest; half: at one picture pixel
//                                                                     to a game pixel (the game's own), not the art's two
//   npx tsx tools/bake_colossus.ts count [move ...]                    what they want
//   (`ready` with pack: those of them wholly painted)
//   (moves: lurk, stand, entrance; a0 to a4 for all of a tentacle's; `body`, `arms`, or all if none named)
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
// @ts-ignore
import nodeZlib from 'node:zlib';
import { Px } from '../src/engine/px';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { paintColossus } from '../src/art/eye_colossus';
import type { ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { ARM_STAND_FRAMES, EYE_ENTRANCE, EYE_FPS, EYE_LURK, EYE_STAND, armBurst, armLayer, armStand, armStandLayer, eyeFrame } from '../src/art/eye_moves';
import type { EyeFrame, EyeLayer } from '../src/art/eye_moves';
import { FLINCH, DEATH, SLAM, SMASH, armDeath, armFlinch, armSlam, armSmash, dense, even, evenly, liftOver, rootOf, turnsOf } from '../src/art/eye_arms';
import type { ArmPose } from '../src/art/eye_colossus';
import { SHOVEL as ART_SHOVEL, SNAP as ART_SNAP, atEnd, shovelFrame } from '../src/art/eye_shovel';
import { BILE as ART_BILE, BODY_TAKE, GAZE as ART_GAZE, bodyFrame } from '../src/art/eye_body';
import { ARM_BAKE } from '../src/render/colossus_baked';
// @ts-ignore
import { encodePng } from './png.mjs';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const fs = nodeFs as { mkdirSync(p: string, o: { recursive: boolean }): void; writeFileSync(p: string, d: unknown): void; existsSync(p: string): boolean; readFileSync(p: string): Uint8Array; renameSync(a: string, b: string): void };
const path = nodePath as { join(...p: string[]): string };
declare const process: { argv: string[]; pid: number; stdout: { write(s: string): void } };
const zlib = nodeZlib as { deflateSync(b: Uint8Array, o?: { level: number }): Uint8Array; inflateSync(b: Uint8Array): Uint8Array };

const SEEN = 2 / Math.sqrt(3);
const R3 = Math.sqrt(3);
/** His layers' box on the picture, as the art chat's tool paints them (tools/eye_moves_pics.ts LAYER): his middle at the water at (ax, ay). */
const LAYER = { w: 1100, h: 520, ax: 550, ay: 300, raw: true } as const;
/** A tentacle's layer: taller, for one lying slammed out across the stone toward the camera (its LAYER_ARM); painted only in the box
 *  round it (its armBox). */
const LAYER_ARM = { w: 1100, h: 660, ax: 550, ay: 300, raw: true } as const;
/** His shovel's layers, as the art's tool boxes them: him at an end, turned (`V`); a scraping tentacle's head and its body (`AH`, `AB`),
 *  painted where they lie across the stone's depth, at the front of the stone. */
const LAYER_SIDE = { w: 760, h: 800, ax: 360, ay: 460, raw: true } as const;
const LAYER_HEAD = { w: 1100, h: 540, ax: 550, ay: -60, raw: true } as const;
const LAYER_BODY_L = { w: 1300, h: 560, ax: -230, ay: -60, raw: true } as const;
const LAYER_BODY_R = { w: 1300, h: 560, ax: 1530, ay: -60, raw: true } as const;
type Box = { w: number; h: number; ax: number; ay: number; raw: true; box?: readonly [number, number, number, number] };
function armBox(pose: ColossusPose, F: { w: number; h: number; ax: number; ay: number } = LAYER_ARM): [number, number, number, number] {
  let i0 = Infinity;
  let j0 = Infinity;
  let i1 = -Infinity;
  let j1 = -Infinity;
  for (const a of pose.arms ?? []) {
    const R = (a.r + 3) * SEEN;
    for (const q of a.path) {
      const i = F.ax + q[0] * SEEN;
      const j = F.ay + (q[1] * 0.5 - q[2] * (Math.sqrt(3) / 2)) * SEEN;
      const jw = F.ay + q[1] * 0.5 * SEEN;
      i0 = Math.min(i0, i - R);
      i1 = Math.max(i1, i + R);
      j0 = Math.min(j0, j - R);
      j1 = Math.max(j1, j + R, jw + 4);
    }
  }
  const P = 24;
  return [Math.max(0, Math.floor(i0 - P)), Math.max(0, Math.floor(j0 - P)), Math.min(F.w, Math.ceil(i1 + P)), Math.min(F.h, Math.ceil(j1 + P))];
}
/** The box a layer is painted in: his own, or a tentacle's round it. */
const boxOf = (key: string, pose: ColossusPose): Box => {
  if (key.startsWith('V')) return LAYER_SIDE;
  if (!key.startsWith('A')) return LAYER;
  const FR = key.startsWith('AH') ? LAYER_HEAD : key.startsWith('AB.l') ? LAYER_BODY_L : key.startsWith('AB.r') ? LAYER_BODY_R : LAYER_ARM;
  return { ...FR, box: armBox(pose, FR) };
};
/** The water's colour, as the art's tool has it (its WATER): what of him is under the water is mixed toward it. */
const WATER = [0x0e, 0x16, 0x12] as const;
const RIM = [parseInt(ENEMY_RIM.slice(1, 3), 16), parseInt(ENEMY_RIM.slice(3, 5), 16), parseInt(ENEMY_RIM.slice(5, 7), 16)] as const;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16 - 0.5);
/** A sheet's width (picture pixels): pictures laid in rows across it. */
const SHEET_W = 4096;

/** A painted layer as the art's tool keeps it: in the box round what of him there is, each pixel's kind (1 him, 4 what hangs off him),
 *  colour, fire and outline, how near the eye it is and how high over the water. */
interface Raw {
  key: string;
  w: number;
  h: number;
  /** Its corner from his middle at the water (picture pixels). */
  ox: number;
  oy: number;
  kind: Uint8Array;
  rgb: Uint8Array;
  flags: Uint8Array;
  near: Int16Array;
  zh: Int16Array;
}
function rawOf(key: string, c: ColossusPicture, FR: { w: number; h: number; ax: number; ay: number }): Raw {
  let x0 = FR.w;
  let y0 = FR.h;
  let x1 = -1;
  let y1 = -1;
  for (let j = 0; j < FR.h; j++) for (let i = 0; i < FR.w; i++) {
    const kd = c.kind[j * FR.w + i];
    if (kd !== 1 && kd !== 4) continue;
    if (i < x0) x0 = i;
    if (i > x1) x1 = i;
    if (j < y0) y0 = j;
    if (j > y1) y1 = j;
  }
  if (x1 < 0) return { key, w: 1, h: 1, ox: 0, oy: 0, kind: new Uint8Array(1), rgb: new Uint8Array(3), flags: new Uint8Array(1), near: new Int16Array(1), zh: new Int16Array(1) };
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const r: Raw = { key, w, h, ox: x0 - FR.ax, oy: y0 - FR.ay, kind: new Uint8Array(w * h), rgb: new Uint8Array(w * h * 3), flags: new Uint8Array(w * h), near: new Int16Array(w * h), zh: new Int16Array(w * h) };
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const s = (j + y0) * FR.w + i + x0;
    const kd = c.kind[s];
    if (kd !== 1 && kd !== 4) continue;
    const o = j * w + i;
    r.kind[o] = kd;
    r.rgb[o * 3] = c.px.d[s * 4];
    r.rgb[o * 3 + 1] = c.px.d[s * 4 + 1];
    r.rgb[o * 3 + 2] = c.px.d[s * 4 + 2];
    r.flags[o] = ((c.fire as Uint8Array)[s] ? 1 : 0) | ((c.seam as Uint8Array)[s] ? 2 : 0);
    r.near[o] = Math.max(-32767, Math.min(32767, Math.round(c.near[s] * 8)));
    r.zh[o] = Math.max(-32767, Math.min(32767, Math.round((c.zh as Float32Array)[s] * 8)));
  }
  return r;
}

interface Lay {
  key: string;
  drop: number;
  back: number;
  dx: number;
  /** Laid faintly where nothing else is: a strike's last frame behind it. */
  ghost?: boolean;
}
interface FrameSpec {
  layers: Lay[];
  sunk: number;
  pulse: number;
}
interface MoveSpec {
  name: string;
  /** The sheets it is packed in. */
  group: string;
  frames: FrameSpec[];
  /** (his shovel) Which frames are at the stone's end: those flipped at its right end (his “Mirror it”). */
  ends?: boolean[];
  /** (his shovel) Each frame's scraping tentacles: each its head's or its body's layer, how far down, and how far across it lies. */
  hooks?: { key: string; drop: number; dx: number }[][];
}
const pad = (n: number): string => String(n).padStart(3, '0');
const AIR = { sunk: 0, pulse: 1 };
const deg = (a: number): number => Math.round((a * 180) / Math.PI);
/** The slam turns baked: those of each tentacle's every 15 degrees. */
const turns15 = (w: number): number[] => turnsOf(w).filter((a) => deg(a) % ARM_BAKE.turnEvery === 0);
const FLINCH_FROM = ARM_BAKE.flinchFrom;
const BURST_AT = ARM_BAKE.burstAt;

/** Every move named (`body`, `arms`, a move's name, a tentacle `a0` to `a4`), its frames, and every layer they want (a fixed order, the
 *  same for the painters and the packing). */
function plan(want: readonly string[]): { moves: MoveSpec[]; layers: { key: string; pose: ColossusPose }[] } {
  const moves: MoveSpec[] = [];
  const seen = new Map<string, ColossusPose>();
  const lay = (key: string, pose: ColossusPose, o: Partial<Lay> = {}): Lay => {
    if (!seen.has(key)) seen.set(key, pose);
    return { key, drop: 0, back: 0, dx: 0, ...o };
  };
  const ofLayer = (L: EyeLayer, ghost = false): Lay => lay(L.key, L.pose, { drop: L.drop, back: L.back, dx: L.dx ?? 0, ghost });
  const wants = (name: string, group: string): boolean => want.length === 0 || want.includes(name) || want.includes(group) || (group.startsWith('a') ? want.includes('arms') || want.includes(group.split('.')[0]) : want.includes('body'));
  const wantsBody = (mv: string): boolean => wants(mv, mv) || want.some((w) => w.startsWith(`${mv}.`));
  // HIM
  const BODY = { lurk: EYE_LURK.frames, stand: EYE_STAND.frames, entrance: EYE_ENTRANCE.frames } as const;
  for (const mv of ['lurk', 'stand', 'entrance'] as const) {
    if (!wantsBody(mv)) continue;
    const frames: FrameSpec[] = [];
    for (let k = 0; k < BODY[mv]; k++) {
      const F: EyeFrame = eyeFrame(mv, k);
      const ls = [F.jaws, F.spit, F.tongue].filter((L): L is EyeLayer => !!L).map((L) => ofLayer(L));
      // (his entrance: his tentacles bursting up are in it, and their strikes' last frames behind them)
      if (mv === 'entrance') {
        for (const L of F.arms) if (L) ls.push(ofLayer(L));
        for (const L of F.smear) if (L) ls.push(ofLayer(L, true));
      }
      frames.push({ layers: ls, sunk: F.water.sunk, pulse: F.water.pulse });
    }
    // (his entrance in three parts of 3 s, each its own sheets: held only while it plays, the next fetched before it is wanted)
    if (mv === 'entrance') for (let c = 0; c * ARM_BAKE.entrancePart < frames.length; c++) moves.push({ name: `entrance.${c}`, group: `entrance.${c}`, frames: frames.slice(c * ARM_BAKE.entrancePart, (c + 1) * ARM_BAKE.entrancePart) });
    else moves.push({ name: mv, group: mv, frames });
  }
  // HIS SHOVEL, at the left end (the right end's frames there flipped, his “Mirror it”: the art's s2 is that, so its layers are taken
  // unflipped and laid back at the left end): him, in parts of 3 s; his scraping tentacles, each frame's laid where it is (their
  // pictures in a group of their own); his snap (the art's s1, from its first frame: played whenever the game's snap comes); his
  // standing tentacles going down with him and coming up with him, each its own figure's.
  const wantsShovel = want.length === 0 || want.includes('body') || want.some((w) => w === 'shovel' || w.startsWith('shovel.'));
  if (wantsShovel) {
    const frames: FrameSpec[] = [];
    const ends: boolean[] = [];
    const hooks: { key: string; drop: number; dx: number }[][] = [];
    const sinks: Lay[][][] = [[], [], []];
    for (let k = 0; k < ART_SHOVEL.frames; k++) {
      const F = shovelFrame('s2', k);
      const end = atEnd(k);
      const left = (L: EyeLayer): EyeLayer => (L.mirror ? { ...L, dx: -(L.dx ?? 0), mirror: false } : L);
      const ls = [F.jaws, F.spit, F.tongue].filter((L): L is EyeLayer => !!L).map((L) => ofLayer(left(L)));
      for (const L of F.smear) if (L && L.key.startsWith('V')) ls.push(ofLayer(left(L), true));
      frames.push({ layers: ls, sunk: F.water.sunk, pulse: F.water.pulse });
      ends.push(end);
      const hk: { key: string; drop: number; dx: number }[] = [];
      for (const L of F.arms) {
        if (!L || !(L.key.startsWith('AH') || L.key.startsWith('AB'))) continue;
        lay(L.key, L.pose);
        hk.push({ key: L.key, drop: L.drop, dx: L.mirror ? -(L.dx ?? 0) : L.dx ?? 0 });
      }
      hooks.push(hk);
      // (his three standing tentacles, at his place: going down with him, coming up with him)
      for (let i = 0; i < 3; i++) {
        const L = !end ? F.arms[i] : null;
        sinks[i].push(L && L.key.startsWith('A') && !L.key.startsWith('AH') && !L.key.startsWith('AB') ? [ofLayer(L)] : []);
      }
    }
    const part = ARM_BAKE.entrancePart;
    for (let c = 0; c * part < frames.length; c++) {
      const name = `shovel.${c}`;
      if (want.length && !want.includes('body') && !want.includes('shovel') && !want.includes(name)) continue;
      moves.push({ name, group: name, frames: frames.slice(c * part, (c + 1) * part), ends: ends.slice(c * part, (c + 1) * part), hooks: hooks.slice(c * part, (c + 1) * part) });
    }
    // his snap: the art's s1 from its snap's first frame (its own spittle and tongue there: the lunge is in them)
    if (want.length === 0 || want.includes('body') || want.includes('shovel') || want.includes('shovel.snap')) {
      const snap: FrameSpec[] = [];
      for (let k = ART_SNAP.at; k < ART_SNAP.at + ART_SNAP.frames; k++) {
        const F = shovelFrame('s1', k);
        const own = (L: EyeLayer): EyeLayer => (L.key.startsWith('VJ') ? L : { ...L, key: `${L.key}.snap` });
        const ls = [F.jaws, F.spit, F.tongue].filter((L): L is EyeLayer => !!L).map((L) => ofLayer(own(L)));
        for (const L of F.smear) if (L && L.key.startsWith('V')) ls.push(ofLayer(own(L), true));
        snap.push({ layers: ls, sunk: F.water.sunk, pulse: F.water.pulse });
      }
      moves.push({ name: 'shovel.snap', group: 'shovel.snap', frames: snap, ends: snap.map(() => true) });
    }
    // (his standing tentacles going down with him, frames 0 to 21, and coming up with him, from frame 300)
    for (let i = 0; i < 3; i++) {
      if (!(want.length === 0 || want.includes('arms') || want.includes(`a${i}`) || want.includes('shovel'))) continue;
      moves.push({ name: `a${i}.sink`, group: `a${i}`, frames: sinks[i].slice(0, ART_SHOVEL.sink[1]).map((ls) => ({ layers: ls, ...AIR })) });
      moves.push({ name: `a${i}.up`, group: `a${i}`, frames: sinks[i].slice(ART_SHOVEL.back[0]).map((ls) => ({ layers: ls, ...AIR })) });
    }
  }
  // HIS BODY'S OWN ATTACKS IN PHASE 2 (the art's eye_body.ts, his yes of 8 Nov): the bile arc and the gaze, each from his stand at the
  // frame of it the art's takes begin them on (`ARM_BAKE.bodyAt`), and back into it; the gaze's middle tentacle ducking under the
  // water out of its way (its own figure's frames)
  for (const [mv, shot, n] of [['bile', 'b1', ART_BILE.frames], ['gaze', 'g1', ART_GAZE.frames]] as const) {
    if (!(want.length === 0 || want.includes('body') || want.includes(mv))) continue;
    const frames: FrameSpec[] = [];
    const duck: FrameSpec[] = [];
    for (let f = 0; f < n; f++) {
      const F = bodyFrame(shot, BODY_TAKE.lead + f);
      const ls = [F.jaws, F.spit, F.tongue].filter((L): L is EyeLayer => !!L).map((L) => ofLayer(L));
      for (const L of F.smear) if (L) ls.push(ofLayer(L, true));
      frames.push({ layers: ls, sunk: F.water.sunk, pulse: F.water.pulse });
      const A1 = F.arms[1];
      duck.push({ layers: A1 ? [ofLayer(A1)] : [], ...AIR });
    }
    moves.push({ name: mv, group: mv, frames });
    if (mv === 'gaze') moves.push({ name: 'a1.duck', group: 'a1', frames: duck });
  }
  // HIS TENTACLES, each its own figure
  for (let w = 0; w < 5; w++) {
    const fig = `a${w}`;
    // (a pose as the art's films lay it: its path laid evenly and lifted clear of the stone)
    const fine = (a: ArmPose): ArmPose => ({ ...a, path: liftOver(w, evenly(dense(a.path), 64), a.squash ?? 0, a.r, a.squashFrom ?? 0) });
    const one = (name: string, group: string, n: number, at: (g: number) => { key: string; pose: ColossusPose; smear?: { key: string; pose: ColossusPose } }): void => {
      if (!wants(name, group)) return;
      const frames: FrameSpec[] = [];
      for (let g = 0; g < n; g++) {
        const L = at(g);
        const ls = [lay(L.key, L.pose)];
        if (L.smear) ls.push(lay(L.smear.key, L.smear.pose, { ghost: true }));
        frames.push({ layers: ls, ...AIR });
      }
      moves.push({ name, group, frames });
    };
    // its stand: the art's own layers
    one(`${fig}.stand`, fig, ARM_STAND_FRAMES, (g) => {
      const L = armStandLayer(w, g);
      return { key: L.key, pose: L.pose };
    });
    // its burst up out of the water
    one(`${fig}.burst`, fig, 32, (g) => {
      const t = (BURST_AT + g) / EYE_FPS;
      // (from its bulge's first frame: never before it stirs)
      return { key: `A${w}.bu.${pad(g)}`, pose: armLayer(armBurst(w, g - 10, t) as ArmPose, t) };
    });
    // struck standing, from three points of its stand
    for (const s of FLINCH_FROM) {
      one(`${fig}.flinch${s}`, fig, FLINCH, (g) => {
        const t = (s + g) / EYE_FPS;
        const base = armStand(w, t);
        return { key: `A${w}.fl${s}.${pad(g)}`, pose: armLayer(fine({ ...base, path: armFlinch(base.path, g, false) }), t) };
      });
    }
    // its death, from its stand
    const from = armStand(w, 0);
    const { squash: _sq, squashFrom: _sf, ...round } = from;
    void _sq;
    void _sf;
    one(`${fig}.death`, fig, DEATH.frames, (g) => ({ key: `A${w}.de.${pad(g)}`, pose: armLayer(fine({ ...round, path: armDeath(w, even(from.path), g) }), g / EYE_FPS) }));
    // its slams on the stone at every 15 degrees; the left and right ones' water slams
    const strikeAt = (g: number, wind: number, hit: number): boolean => g === wind || g === hit;
    for (const ang of turns15(w)) {
      const name = `${fig}.slam${deg(ang)}`;
      const at = (g: number): { key: string; pose: ColossusPose } => ({ key: `A${w}.sl${deg(ang)}.${pad(g)}`, pose: armLayer(fine(armSlam(w, ang, g, 0)), g / EYE_FPS) });
      one(name, name, SLAM.frames, (g) => ({ ...at(g), smear: strikeAt(g, SLAM.wind, SLAM.hit) ? at(g - 1) : undefined }));
    }
    if (w === 0 || w === 2) {
      const name = `${fig}.smash`;
      const at = (g: number): { key: string; pose: ColossusPose } => ({ key: `A${w}.sm.${pad(g)}`, pose: armLayer(fine(armSmash(w, g, 0)), g / EYE_FPS) });
      one(name, name, SMASH.frames, (g) => ({ ...at(g), smear: strikeAt(g, SMASH.wind, SMASH.hit) ? at(g - 1) : undefined }));
    }
  }
  return { moves, layers: [...seen.entries()].map(([key, pose]) => ({ key, pose })) };
}
/** Each tentacle's root, his space at the water, as picture pixels from his middle (the game turns its slams about it). */
const rootsPx = (): [number, number][] => [0, 1, 2, 3, 4].map((w) => {
  const [x, y] = rootOf(w);
  return [x * SEEN, y / R3];
});
const fileOf = (cache: string, key: string): string => path.join(cache, `${key.replace(/[^A-Za-z0-9.]/g, '_')}.raw`);
function keep(file: string, r: Raw): void {
  const meta = new TextEncoder().encode(JSON.stringify({ w: r.w, h: r.h, ox: r.ox, oy: r.oy }));
  const n = r.w * r.h;
  const body = new Uint8Array(n * 9);
  body.set(r.kind, 0);
  body.set(r.rgb, n);
  body.set(r.flags, n * 4);
  body.set(new Uint8Array(r.near.buffer, 0, n * 2), n * 5);
  body.set(new Uint8Array(r.zh.buffer, 0, n * 2), n * 7);
  const packed = zlib.deflateSync(body, { level: 6 });
  const all = new Uint8Array(4 + meta.length + packed.length);
  new DataView(all.buffer).setUint32(0, meta.length, true);
  all.set(meta, 4);
  all.set(packed, 4 + meta.length);
  fs.writeFileSync(`${file}.${process.pid}.tmp`, all);
  fs.renameSync(`${file}.${process.pid}.tmp`, file);
}
function kept(file: string, key: string): Raw {
  const all = fs.readFileSync(file);
  const m = new DataView(all.buffer, all.byteOffset, all.byteLength).getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(all.subarray(4, 4 + m))) as { w: number; h: number; ox: number; oy: number };
  // (a plain array of its own, not node's pooled buffer, so that each part sliced from it is its own)
  const b = new Uint8Array(zlib.inflateSync(all.subarray(4 + m)));
  const n = meta.w * meta.h;
  const i16 = (at: number): Int16Array => new Int16Array(b.slice(at, at + n * 2).buffer);
  return { key, ...meta, kind: b.slice(0, n), rgb: b.slice(n, n * 4), flags: b.slice(n * 4, n * 5), near: i16(n * 5), zh: i16(n * 7) };
}

/** A frame's picture: RGBA in the box round it, its corner from his middle at the water. */
interface Pic {
  w: number;
  h: number;
  ox: number;
  oy: number;
  rgba: Uint8Array;
}

/** A FRAME LAID as the art's tool lays it (tools/eye_moves_pics.ts merge, then him over and under the water, then the pink edge). */
function layFrame(F: FrameSpec, get: (key: string) => Raw): Pic {
  if (F.layers.length === 0) return { w: 1, h: 1, ox: 0, oy: 0, rgba: new Uint8Array(4) };
  const placed = F.layers.map((L) => ({ L, r: get(L.key), di: Math.round(L.dx * SEEN), dj: Math.round(L.drop - L.back / R3), dz: -L.drop, dn: -L.back * 0.8660254 - L.drop * 0.5 }));
  // (the box round all of them, and a pixel round for the pink edge)
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of placed) {
    x0 = Math.min(x0, p.r.ox + p.di - 1);
    y0 = Math.min(y0, p.r.oy + p.dj - 1);
    x1 = Math.max(x1, p.r.ox + p.di + p.r.w + 1);
    y1 = Math.max(y1, p.r.oy + p.dj + p.r.h + 1);
  }
  const W = x1 - x0;
  const H = y1 - y0;
  const n = W * H;
  const near = new Float32Array(n).fill(-Infinity);
  const col = new Uint8Array(n * 3);
  const z = new Float32Array(n);
  const flags = new Uint8Array(n);
  const kind = new Uint8Array(n);
  const ghost = new Uint8Array(n * 4);
  // (his layers first, then the strikes' last frames: each pixel of those kept where it is nearer than what is there, or nothing is)
  for (const p of [...placed.filter((p) => !p.L.ghost), ...placed.filter((p) => p.L.ghost)]) {
    const r = p.r;
    for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) {
      const s = j * r.w + i;
      const kd = r.kind[s];
      if (kd !== 1 && kd !== 4) continue;
      const q = (r.oy + p.dj + j - y0) * W + (r.ox + p.di + i - x0);
      const nr = r.near[s] / 8 + p.dn;
      if (p.L.ghost) {
        if (nr > near[q] || !kind[q]) ghost.set([r.rgb[s * 3], r.rgb[s * 3 + 1], r.rgb[s * 3 + 2], 1], q * 4);
        continue;
      }
      if (nr <= near[q]) continue;
      near[q] = nr;
      col[q * 3] = r.rgb[s * 3];
      col[q * 3 + 1] = r.rgb[s * 3 + 1];
      col[q * 3 + 2] = r.rgb[s * 3 + 2];
      z[q] = r.zh[s] / 8 + p.dz;
      flags[q] = r.flags[s];
      kind[q] = kd;
    }
  }
  const rgba = new Uint8Array(n * 4);
  const keepDen = 15 + 37 * F.sunk;
  const seenDeep = 70 + 95 * F.sunk;
  const over = (q: number, c0: number, c1: number, c2: number, a: number): void => {
    // (laid over what is there, as the art's `over`)
    const A = rgba[q * 4 + 3] / 255;
    const B = a / 255;
    const out = B + A * (1 - B);
    if (out <= 0) return;
    rgba[q * 4] = Math.round((c0 * B + rgba[q * 4] * A * (1 - B)) / out);
    rgba[q * 4 + 1] = Math.round((c1 * B + rgba[q * 4 + 1] * A * (1 - B)) / out);
    rgba[q * 4 + 2] = Math.round((c2 * B + rgba[q * 4 + 2] * A * (1 - B)) / out);
    rgba[q * 4 + 3] = Math.round(out * 255);
  };
  const him = (q: number): boolean => kind[q] !== 0;
  const bayer = (i: number, j: number): number => BAYER[((j + y0) & 3) * 4 + ((i + x0) & 3)];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const q = j * W + i;
    if (!him(q) || z[q] >= -0.5) continue;
    // (him under the water: darker and greener the deeper; only fire seen deep down)
    const deep = -z[q];
    const fire = flags[q] & 1;
    const kp = fire ? Math.exp(-deep / 220) : Math.exp(-deep / keepDen);
    const vis = fire ? Math.min(1, Math.exp(-deep / 280) * 1.5) * F.pulse : Math.max(0, 1 - deep / seenDeep);
    const qd = Math.max(0, Math.min(4, Math.floor(vis * 4 + bayer(i, j) + 0.5)));
    if (qd > 0) over(q, WATER[0] + (col[q * 3] - WATER[0]) * kp, WATER[1] + (col[q * 3 + 1] - WATER[1]) * kp, WATER[2] + (col[q * 3 + 2] - WATER[2]) * kp, [0, 80, 140, 200, 240][qd]);
  }
  // HIM OVER THE WATER, and the after-images of a strike
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const q = j * W + i;
    if (ghost[q * 4 + 3] && !(him(q) && z[q] >= -0.5) && bayer(i, j) > -0.1) over(q, ghost[q * 4], ghost[q * 4 + 1], ghost[q * 4 + 2], 120);
    if (him(q) && z[q] >= -0.5) rgba.set([col[q * 3], col[q * 3 + 1], col[q * 3 + 2], 255], q * 4);
  }
  // THE PINK EDGE round him where he is over the water (outside his outline, never round what is under it)
  for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
    const q = j * W + i;
    if (him(q) && z[q] >= -0.5) continue;
    let by = false;
    for (const nq of [q + 1, q - 1, q + W, q - W]) if (kind[nq] === 1 && z[nq] >= 0 && flags[nq] & 2) by = true;
    if (by) over(q, RIM[0], RIM[1], RIM[2], RIM_ALPHA);
  }
  return crop({ w: W, h: H, ox: x0, oy: y0, rgba });
}
function crop(p: Pic): Pic {
  let x0 = p.w;
  let y0 = p.h;
  let x1 = -1;
  let y1 = -1;
  for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) {
    if (!p.rgba[(j * p.w + i) * 4 + 3]) continue;
    if (i < x0) x0 = i;
    if (i > x1) x1 = i;
    if (j < y0) y0 = j;
    if (j > y1) y1 = j;
  }
  if (x1 < 0) return { w: 1, h: 1, ox: 0, oy: 0, rgba: new Uint8Array(4) };
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const rgba = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++) rgba.set(p.rgba.subarray(((j + y0) * p.w + x0) * 4, ((j + y0) * p.w + x0 + w) * 4), j * w * 4);
  return { w, h, ox: p.ox + x0, oy: p.oy + y0, rgba };
}
/** Half as big each way, on the grid of his middle (so that the halves line up frame to frame): each pixel the four it stands for, by
 *  their weight in alpha. */
function halved(c: Pic): Pic {
  const ox = Math.floor(c.ox / 2);
  const oy = Math.floor(c.oy / 2);
  const sx = c.ox - ox * 2;
  const sy = c.oy - oy * 2;
  const w = Math.max(1, Math.ceil((c.w + sx) / 2));
  const h = Math.max(1, Math.ceil((c.h + sy) / 2));
  const rgba = new Uint8Array(w * h * 4);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
      const x = i * 2 + di - sx;
      const y = j * 2 + dj - sy;
      if (x < 0 || y < 0 || x >= c.w || y >= c.h) continue;
      const o = (y * c.w + x) * 4;
      const al = c.rgba[o + 3];
      r += c.rgba[o] * al;
      g += c.rgba[o + 1] * al;
      b += c.rgba[o + 2] * al;
      a += al;
    }
    const o = (j * w + i) * 4;
    if (a > 0) {
      rgba[o] = Math.round(r / a);
      rgba[o + 1] = Math.round(g / a);
      rgba[o + 2] = Math.round(b / a);
      rgba[o + 3] = Math.round(a / 4);
    }
  }
  return { w, h, ox, oy, rgba };
}

const mode = process.argv[2];
if (mode === 'count') {
  // (what the moves named want: `npx tsx tools/bake_colossus.ts count [move ...]`)
  const { moves, layers } = plan(process.argv.slice(3));
  const by = new Map<string, number>();
  for (const m of moves) by.set(m.group, (by.get(m.group) ?? 0) + m.frames.length);
  process.stdout.write(`${moves.length} moves, ${moves.reduce((n, m) => n + m.frames.length, 0)} frames in ${by.size} groups, ${layers.length} layers\n`);
  throw new Error('(counted)');
}
const cache = process.argv[3];
if ((mode !== 'paint' && mode !== 'pack') || !cache) throw new Error('usage: paint <cache> <i> <n> [move ...] | pack <cache> <out> <half> [move ...]');
fs.mkdirSync(cache, { recursive: true });
const t0 = Date.now();
if (mode === 'paint') {
  // (worker `r`: all of them from the last back, to meet a worker going the other way)
  const back = process.argv[4] === 'r';
  const i = back ? 0 : Number(process.argv[4]);
  const n = back ? 1 : Number(process.argv[5]);
  const { layers } = plan(process.argv.slice(6));
  if (back) layers.reverse();
  let done = 0;
  layers.forEach((L, idx) => {
    if (idx % n !== i) return;
    const file = fileOf(cache, L.key);
    if (fs.existsSync(file)) return;
    const t = Date.now();
    const FR = boxOf(L.key, L.pose);
    keep(file, rawOf(L.key, paintColossus(L.pose, FR), FR));
    done++;
    process.stdout.write(`  painted ${L.key} in ${((Date.now() - t) / 1000).toFixed(1)} s (${done} by this worker, ${((Date.now() - t0) / 60000).toFixed(1)} min; ${layers.length} layers in all)\n`);
  });
  process.stdout.write(`worker ${i} of ${n} done: ${done} painted in ${((Date.now() - t0) / 60000).toFixed(1)} min\n`);
} else {
  const out = process.argv[4];
  const half = process.argv[5] === '1';
  if (!out) throw new Error('pack <cache> <out> <half> [move ...]');
  fs.mkdirSync(out, { recursive: true });
  // (`ready`: every move whose layers are all painted)
  const named = process.argv.slice(6);
  const ready = named.includes('ready');
  const painted = (key: string): boolean => fs.existsSync(fileOf(cache, key));
  const moves = plan(named.filter((m) => m !== 'ready')).moves.filter((m) => !ready || (m.frames.every((F) => F.layers.every((L) => painted(L.key))) && (m.hooks ?? []).every((hk) => hk.every((h) => painted(h.key)))));
  const memo = new Map<string, Raw>();
  const get = (key: string): Raw => {
    let r = memo.get(key);
    if (!r) {
      r = kept(fileOf(cache, key), key);
      if (memo.size > 24) memo.clear();
      memo.set(key, r);
    }
    return r;
  };
  type Placed = { s: number; x: number; y: number; w: number; h: number; ox: number; oy: number };
  type MoveOut = { group: string; frames: number[]; ends?: boolean[]; hooks?: [number, number][][] };
  const manifest: { perGamePx: number; groups: Record<string, { sheets: string[]; pics: Placed[] }>; moves: Record<string, MoveOut>; roots: [number, number][] } = { perGamePx: half ? 1 : 2, groups: {}, moves: {}, roots: rootsPx().map(([x, y]) => [x / (half ? 2 : 1), y / (half ? 2 : 1)]) };
  const scale = half ? 2 : 1;
  let rawPx = 0;
  let files = 0;
  // (his scraping tentacles' pictures: each head or body at each depth it is laid at, a group of their own; under the water, seen as
  // the art's tool sees a tentacle swimming just under the surface)
  const hookPics: (Pic & { id: number })[] = [];
  const hookSig = new Map<string, number>();
  const hookOf = (h: { key: string; drop: number }): number => {
    const sig = `${h.key}@${h.drop}`;
    let id = hookSig.get(sig);
    if (id === undefined) {
      const p = layFrame({ layers: [{ key: h.key, drop: h.drop, back: 0, dx: 0 }], sunk: 0.62, pulse: 1 }, get);
      id = hookPics.length;
      hookPics.push({ ...(half ? halved(p) : p), id });
      hookSig.set(sig, id);
    }
    return id;
  };
  const groupsOut: [string, (Pic & { id: number })[]][] = [];
  for (const group of [...new Set(moves.map((m) => m.group))]) {
    // EACH FRAME'S PICTURE (frames laid the same way from the same layers share one)
    const pics: (Pic & { id: number })[] = [];
    const bySig = new Map<string, number>();
    for (const mv of moves.filter((m) => m.group === group)) {
      manifest.moves[mv.name] = {
        group,
        frames: mv.frames.map((F) => {
          const sig = JSON.stringify(F);
          let id = bySig.get(sig);
          if (id === undefined) {
            const p = layFrame(F, get);
            id = pics.length;
            pics.push({ ...(half ? halved(p) : p), id });
            bySig.set(sig, id);
          }
          return id;
        }),
        ...(mv.ends ? { ends: mv.ends } : {}),
        ...(mv.hooks ? { hooks: mv.hooks.map((hk) => hk.map((h): [number, number] => [hookOf(h), Math.round(h.dx * SEEN) / scale])) } : {}),
      };
    }
    groupsOut.push([group, pics]);
  }
  if (hookPics.length) groupsOut.push(['hooks', hookPics]);
  for (const [group, pics] of groupsOut) {
    // THE SHEETS: the pictures in rows, tallest first, a new sheet whenever one would pass 16 MB of pixels (raw; packed it is far less)
    const list = [...pics].sort((a, b) => b.h - a.h);
    type Sheet = { rows: { y: number; h: number; x: number }[]; h: number; w: number; items: { c: Pic & { id: number }; x: number; y: number }[] };
    const sheets: Sheet[] = [];
    const MAX_PX = (16 * 1024 * 1024) / 4;
    let cur: Sheet = { rows: [], h: 0, w: 0, items: [] };
    sheets.push(cur);
    for (const c of list) {
      let row = cur.rows.find((r) => r.x + c.w <= SHEET_W && c.h <= r.h);
      if (!row) {
        if ((cur.h + c.h) * SHEET_W > MAX_PX) {
          cur = { rows: [], h: 0, w: 0, items: [] };
          sheets.push(cur);
        }
        row = { y: cur.h, h: c.h, x: 0 };
        cur.rows.push(row);
        cur.h += c.h;
      }
      cur.items.push({ c, x: row.x, y: row.y });
      row.x += c.w;
      cur.w = Math.max(cur.w, row.x);
    }
    const G: { sheets: string[]; pics: Placed[] } = { sheets: [], pics: [] };
    sheets.forEach((S, n) => {
      const h = Math.max(1, S.h);
      const w = Math.max(1, S.w);
      const px = new Uint8Array(w * h * 4);
      rawPx += w * h;
      for (const it of S.items) for (let j = 0; j < it.c.h; j++) px.set(it.c.rgba.subarray(j * it.c.w * 4, (j + 1) * it.c.w * 4), ((it.y + j) * w + it.x) * 4);
      const name = `colossus-${group.replace(/[^A-Za-z0-9-]/g, '_')}-${n}.png`;
      fs.writeFileSync(path.join(out, name), encodePng(w, h, px));
      files++;
      G.sheets.push(name);
      for (const it of S.items) G.pics[it.c.id] = { s: n, x: it.x, y: it.y, w: it.c.w, h: it.c.h, ox: it.c.ox, oy: it.c.oy };
    });
    manifest.groups[group] = G;
    process.stdout.write(`  ${group}: ${pics.length} pictures in ${sheets.length} sheets\n`);
  }
  fs.writeFileSync(path.join(out, 'colossus.json'), JSON.stringify(manifest));
  process.stdout.write(`packed ${Object.keys(manifest.moves).length} moves into ${files} sheets (${((rawPx * 4) / 1048576).toFixed(0)} MB decoded) in ${((Date.now() - t0) / 1000).toFixed(0)} s\n`);
}
