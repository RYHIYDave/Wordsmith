// THE FEET OF ACT 1'S FIGURES ON THE BONES (the Unfinished, the quarry golem): a foot put down stays where it
// is until it lifts (the art rulebook: "Feet grip the floor"). These are art/bosses3.ts's own (`Plant`,
// `plantOf`, `footwork`), copied here word for word in what they do: the game's own tests keep its other
// figures from drawing on that file (tests/bosses.test.ts, 1).

import type { Bones, Build, V3 } from './skeleton';

type P = Partial<Bones>;
const DEG = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const rotZ = (v: V3, a: number): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];

/** A foot put down: its toe (or heel) on this spot of the floor (forward, to the left), turned `turn` degrees left, tipped `pitch` toes-down. */
export interface Plant {
  at: readonly [number, number];
  turn: number;
  pitch?: number;
  on?: 'toe' | 'heel';
}
/** One thing a foot does: from `t0` to `t1` it steps (lifted `lift` high at the top), or turns where it stands (`lift` 0). */
export interface FootMove {
  t0: number;
  t1: number;
  to: Plant;
  lift?: number;
}
/** A foot's way through a move: down where it starts, then what it does, in order. */
export interface FootTrack {
  start: Plant;
  moves: ReadonlyArray<FootMove>;
}
export const smooth01 = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
/** A plant moved along the floor (`dx` forward, `dy` to the left) and turned further. */
export function plantBy(p: Plant, dx: number, dy: number, dt = 0, more: Partial<Plant> = {}): Plant {
  return { ...p, at: [p.at[0] + dx, p.at[1] + dy], turn: p.turn + dt, ...more };
}
/** A pose part way from one to another (every number mixed; how a hand is measured, the nearer's). */
export function between(a: P, b: P, k: number, rest: Bones): P {
  const out: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = (a as Record<string, unknown>)[key] ?? (rest as unknown as Record<string, unknown>)[key];
    const vb = (b as Record<string, unknown>)[key] ?? (rest as unknown as Record<string, unknown>)[key];
    out[key] = typeof va === 'number' && typeof vb === 'number' && !key.endsWith('In') ? va + (vb - va) * k : k < 0.5 ? va : vb;
  }
  return out as P;
}

/** A body's feet: where a foot put down so has its bones, where a foot stands in a pose, and its feet through a move. */
export function feetFor(B: Build): {
  footOn(side: 'L' | 'R', p: Plant, lift?: number): P;
  plantOf(side: 'L' | 'R', pose: P, rest: Bones, on?: 'toe' | 'heel'): Plant;
  footwork(tracks: Partial<Record<'L' | 'R', FootTrack>>, carry?: number): (t: number) => P;
} {
  const footOff = (on: 'toe' | 'heel', turn: number, pitch: number): V3 => rotZ(rotY(on === 'toe' ? [B.ball, 0, -B.ankle] : [-B.heel, 0, -B.ankle], pitch * DEG), turn * DEG);
  const footOn = (side: 'L' | 'R', p: Plant, lift = 0): P => {
    const pitch = p.pitch ?? 0;
    const o = footOff(p.on ?? 'toe', p.turn, pitch);
    const fx = p.at[0] - o[0];
    const fy = p.at[1] - o[1] - (side === 'L' ? 1 : -1) * B.stance;
    const fz = lift - o[2] - B.ankle;
    return side === 'L' ? { lfx: fx, lfy: fy, lfz: fz, lfp: pitch, lft: p.turn } : { rfx: fx, rfy: fy, rfz: fz, rfp: pitch, rft: p.turn };
  };
  const plantOf = (side: 'L' | 'R', pose: P, rest: Bones, on: 'toe' | 'heel' = 'toe'): Plant => {
    const q = { ...rest, ...pose } as Bones;
    const L = side === 'L';
    const turn = L ? q.lft : q.rft;
    const pitch = L ? q.lfp : q.rfp;
    const o = footOff(on, turn, pitch);
    return { at: [(L ? q.lfx : q.rfx) + o[0], (L ? q.lfy : q.rfy) + (L ? 1 : -1) * B.stance + o[1]], turn, pitch, on };
  };
  const heldBy = (side: 'L' | 'R', p: Plant, on: 'toe' | 'heel'): Plant => ((p.on ?? 'toe') === on ? p : plantOf(side, footOn(side, p), {} as Bones, on));
  const footwork = (tracks: Partial<Record<'L' | 'R', FootTrack>>, carry = 0): ((t: number) => P) => {
    const back = (p: Plant, t: number): Plant => (carry ? { ...p, at: [p.at[0] - carry * t, p.at[1]] } : p);
    return (t) => {
      const out: P = {};
      for (const side of ['L', 'R'] as const) {
        const tr = tracks[side];
        if (!tr) continue;
        let at: Plant = tr.start;
        let pose: P | null = null;
        for (const mv of tr.moves) {
          if (t >= mv.t1) {
            at = mv.to;
            continue;
          }
          if (t <= mv.t0) break;
          const u = (t - mv.t0) / (mv.t1 - mv.t0);
          const lift = mv.lift ?? 0;
          if (lift > 0) {
            const a = heldBy(side, at, 'toe');
            const b = heldBy(side, mv.to, 'toe');
            const g = smooth01((u - 0.12) / 0.76);
            const h = lift * Math.pow(Math.sin(Math.PI * clamp01(u)), 0.6);
            const pitch = (a.pitch ?? 0) * (1 - g) + (b.pitch ?? 0) * g;
            pose = footOn(side, back({ at: [a.at[0] + (b.at[0] - a.at[0]) * g, a.at[1] + (b.at[1] - a.at[1]) * g], turn: a.turn + (b.turn - a.turn) * g, pitch, on: 'toe' }, t), h);
          } else {
            const on = mv.to.on ?? 'toe';
            const a = heldBy(side, at, on);
            const g = smooth01(u);
            pose = footOn(side, back({ at: a.at, turn: a.turn + (mv.to.turn - a.turn) * g, pitch: (a.pitch ?? 0) + ((mv.to.pitch ?? 0) - (a.pitch ?? 0)) * g, on }, t));
          }
          break;
        }
        Object.assign(out, pose ?? footOn(side, back(at, t)));
      }
      return out;
    };
  };
  return { footOn, plantOf, footwork };
}
