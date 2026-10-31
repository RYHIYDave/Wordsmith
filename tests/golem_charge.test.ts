// HER GOLEM'S CHARGED SHOTS (dev/golem_moves.ts golemChargeShell, golemChargeBeam; what they throw off, dev/golem_charge_fx.ts):
// the cannon's braced huge shell and the tesla coil's charged beam, his “Damn I want both.” (31 Oct). Every frame of each, as
// its other moves are checked (tests/golem_moves.test.ts): the picture's own checks (crisp, the friend's edge, no pixel alone,
// nothing pink, nothing cut off); nothing of it sunk into the floor and on its feet; its giant arm and its gun arm never
// through the rest of it; from in front and behind, turned eight ways. Slick (nothing leaps, stalls or turns straight back
// at speed) through its wind-up, its loop held round and round and let go part way round, and its wind-down, but for its
// fist's slam and the strike itself (each a flash: his rulebook's Movement 9). Its fist and its feet gripping the floor while
// braced. Its effects: every frame crisp, nothing pink or gold, nothing cut off, the same each round of the loop, all gone when
// done; the blast as wide and the beam as long as their numbers say. And nothing of the game draws any of it.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { UNITS_PER_TILE } from '../src/art/moves3';
import { LAST, primDist } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { GOLEM_FIST, GOLEM_MUZZLE, GOLEM_PICK, GOLEM_POSE, GOLEM_VENTS, sculptGolemBuild } from '../src/dev/sculpt_golem';
import { CHARGE_SKID, GCHARGE, GCHARGE_BEAM, GCHARGE_SHELL, GCHARGE_STRIKE, chargeFrame, chargeSkid, golemChargeBeam, golemChargeShell } from '../src/dev/golem_moves';
import { BEAM_FX, SHELL_FX, chargeFx, chargeFxLong, chargeLayers, layAir, layFloor, shellFlight } from '../src/dev/golem_charge_fx';
import type { ChargeAt } from '../src/dev/golem_charge_fx';
import { Px } from '../src/engine/px';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;
const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };
const SHOTS = [
  { kind: 'shell' as const, name: 'the cannon’s charged shell', gun: 'cannon' as const, R: GCHARGE_SHELL, at: golemChargeShell },
  { kind: 'beam' as const, name: 'the tesla coil’s charged beam', gun: 'tesla' as const, R: GCHARGE_BEAM, at: golemChargeBeam },
];
type Q = ReturnType<typeof golemChargeShell>;
const drawAt = (gun: 'cannon' | 'tesla', q: Q, view: 'front' | 'back', turn: number) => {
  Object.assign(GOLEM_POSE, REST, q);
  try {
    return sculptGolemBuild(view, GOLEM_PICK.build, turn, -14, true, gun, q.aim, q.kick, q.charge, q.gunLevel);
  } finally {
    Object.assign(GOLEM_POSE, REST);
  }
};

/** Where its giant arm goes through the rest of it (as tests/golem_moves.test.ts: its shoulder's ball and plate are rooted in it). */
function armThrough(sc: Sculpt): string[] {
  const prims = sc.prims.filter((p) => !p.carve);
  const arm = prims.filter((p) => p.piece === 'giantR' && p.tag !== 'ball' && p.tag !== 'plate');
  const rest = prims.filter((p) => !p.piece.startsWith('giant') && p.piece !== 'stacks' && p.piece !== 'gunL');
  const out: string[] = [];
  for (const g of arm) {
    const pts: V3[] = g.k === 'cone' ? (g.tag === 'upper' ? [0.5, 0.75, 1] : [0, 0.5, 1]).map((k) => [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k, g.a[2] + (g.b[2] - g.a[2]) * k] as V3) : g.k === 'tri' ? [] : [g.c];
    for (const q of pts) for (const b of rest) if (primDist(b, q) < -0.5) out.push(`its giant arm's ${g.tag} through its ${b.piece} (${b.tag ?? b.k})`);
  }
  return [...new Set(out)];
}
/** Where its gun arm goes through the rest of it (as tests/golem_gun.test.ts). */
function gunThrough(sc: Sculpt): string[] {
  const prims = sc.prims.filter((p) => !p.carve);
  const gun = prims.filter((p) => p.piece === 'gunL' && p.tag !== 'ball' && p.tag !== 'plate');
  const rest = prims.filter((p) => p.piece !== 'gunL');
  const out: string[] = [];
  for (const g of gun) {
    const pts: V3[] = g.k === 'cone' ? (g.tag === 'upper' ? [0.5, 0.75, 1] : [0, 0.25, 0.5, 0.75, 1]).map((k) => [g.a[0] + (g.b[0] - g.a[0]) * k, g.a[1] + (g.b[1] - g.a[1]) * k, g.a[2] + (g.b[2] - g.a[2]) * k] as V3) : g.k === 'tri' ? [] : [g.c];
    for (const q of pts) for (const b of rest) if (primDist(b, q) < -0.5) out.push(`its gun's ${g.tag} through its ${b.piece} (${b.tag ?? b.k})`);
  }
  return [...new Set(out)];
}
/** Steps along a path of points as the eye sees them: what leaps, stalls or turns straight back at speed, leaving out the flashes (`skip`). */
function jerks(name: string, pts: V3[], skip: (i: number) => boolean): string[] {
  const found: string[] = [];
  for (const view of ['front', 'back'] as const) {
    const xy = pts.map((p) => project(p, view));
    const st = xy.slice(1).map((p, i) => [p[0] - xy[i][0], p[1] - xy[i][1]] as const);
    const sp = st.map(([x, y]) => Math.hypot(x, y));
    for (let i = 1; i < sp.length - 1; i++) {
      if (skip(i)) continue;
      const a = sp[i - 1], b = sp[i], c = sp[i + 1];
      if (b > 4 && b > 2.2 * Math.max(a, c)) found.push(`${name} leaps ${b.toFixed(1)} at step ${i} (${view})`);
      if (a > 2.5 && c > 2.5 && b < 0.6 * Math.min(a, c)) found.push(`${name} stalls at step ${i} (${view})`);
      const sa = st[i - 1], sb = st[i];
      if ((sa[0] * sb[0] + sa[1] * sb[1]) / (Math.hypot(...sa) * Math.hypot(...sb) || 1) < -0.5 && a > 3 && b > 3) found.push(`${name} turns straight back at speed at step ${i} (${view})`);
    }
    if (sp[0] > 3) found.push(`${name} starts at speed (${view})`);
    if (sp[sp.length - 1] > 3) found.push(`${name} stops dead from speed (${view})`);
  }
  return found;
}

for (const S of SHOTS) {
  test(`${S.name}: every frame crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on its feet; its giant arm and its gun clear of the rest of it: from in front and behind, turned eight ways`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (let f = 0; f <= S.R.end; f++) {
          const d = drawAt(S.gun, S.at(f), view, turn);
          const at = `${view}, turned ${turn}, frame ${f}`;
          for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
          const sc = LAST.sc as Sculpt;
          for (const x of bodyFindings(sc, true)) found.push(`${at}: ${x}`);
          if (turn === 0) for (const x of [...armThrough(sc), ...gunThrough(sc)]) found.push(`${at}: ${x}`);
        }
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${S.name}: slick through its wind-up, its loop held round and round (let go part way round), and its wind-down, but for its fist’s slam and the strike; its fist and feet gripping while braced; its loop seamless`, () => {
    const found: string[] = [];
    // (as the game plays it: held two rounds and three frames more, then let go)
    const held = GCHARGE.loop + 2 * GCHARGE.round + 3;
    const play: number[] = [];
    for (let t = 0; ; t++) {
      const f = chargeFrame(t, held);
      if (f > S.R.end) break;
      play.push(f);
    }
    const fist: V3[] = [];
    const eye: V3[] = [];
    const gun: V3[] = [];
    const feet: V3[][] = [];
    for (const f of play) {
      drawAt(S.gun, S.at(f), 'front', 0);
      const sc = LAST.sc as Sculpt;
      fist.push([...GOLEM_FIST.c] as V3);
      const lens = sc.prims.find((p) => p.tag === 'lens');
      eye.push(lens && lens.k !== 'cone' && lens.k !== 'tri' ? ([...lens.c] as V3) : [0, 0, 0]);
      gun.push([...GOLEM_MUZZLE.p] as V3);
      feet.push(sc.prims.filter((p) => p.tag === 'foot' && p.k === 'box').map((p) => [...(p as { c: V3 }).c] as V3));
    }
    // (the flashes: its fist slammed down, and the strike, from a frame before it fires to a frame after it is rocked back)
    const flash = (i: number): boolean => GCHARGE_STRIKE.some(([a, b]) => play[i] >= a - 1 && play[i] <= b + 1) || play[i + 1] === GCHARGE.fire;
    for (const [name, pts] of [['its fist', fist], ['its eye', eye], ['its gun’s mouth', gun]] as const) found.push(...jerks(name, pts, flash));
    // (braced: its fist and its feet where they are on the floor, from its slam to its lift (in its own measure; the game skids it))
    const from = play.indexOf(GCHARGE.planted + 1);
    const to = play.indexOf(S.R.lift);
    for (let i = from; i <= to; i++) {
      const moved = Math.hypot(fist[i][0] - fist[from][0], fist[i][1] - fist[from][1], fist[i][2] - fist[from][2]);
      if (moved > 0.6) found.push(`its braced fist moves ${moved.toFixed(2)} at frame ${play[i]}`);
    }
    // (its feet dug in from when its gun is level to when it steps back under itself)
    const dug = play.indexOf(GCHARGE.aimed);
    const stood = play.indexOf(S.R.stand);
    for (let i = dug; i <= stood; i++) {
      feet[i].forEach((p, k) => {
        const m = Math.hypot(p[0] - feet[dug][k][0], p[1] - feet[dug][k][1], p[2] - feet[dug][k][2]);
        if (m > 0.3) found.push(`its foot ${k} moves ${m.toFixed(2)} while braced, at frame ${play[i]}`);
      });
    }
    // (the loop: its first frame follows its last as its second follows its first, its body the same each round)
    const a = S.at(GCHARGE.loop);
    const b = S.at(GCHARGE.loop + GCHARGE.round);
    for (const k of ['swing', 'fold', 'lean', 'bob', 'aim', 'gunLevel'] as const) if (Math.abs(a[k] - b[k]) > 1e-6) found.push(`its ${k} not the same a round on (${a[k]} and ${b[k]})`);
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${S.name}: its effects every frame crisp, nothing pink or gold, nothing cut off, the friend’s cyan at the strike, the same each round of its loop, and all gone when done: from in front and behind`, () => {
    const found: string[] = [];
    for (const turn of [45, 135]) {
      const sc0 = { at: (p: V3) => p } as unknown as Sculpt;
      const { at, W, H } = sceneOf(S.kind, S.gun, S.at, turn);
      void sc0;
      const last = GCHARGE.fire + chargeFxLong(S.kind, at(GCHARGE.fire));
      for (let f = GCHARGE.brace; f <= last + 2; f++) {
        const ly = chargeLayers();
        chargeFx(S.kind, ly, at(Math.min(f, S.R.end)), f, f / 30);
        const pics = [layFloor(W, H, ly), layAir(W, H, ly)];
        const lit = pics.some((p) => painted(p) > 0);
        const where = `turned ${turn}, frame ${f}`;
        if (f > last) {
          if (lit) found.push(`${where}: something still there after it is done`);
          continue;
        }
        for (const p of pics) {
          if (!painted(p)) continue;
          for (const x of pictureFindings(p)) found.push(`${where}: ${x}`);
          const box = boxOf(p);
          if (box[0] <= 3 || box[1] <= 3 || box[2] >= W - 4 || box[3] >= H - 4) found.push(`${where}: reaches the edge of its scene (cut off)`);
          const g = goldOf(p);
          if (g) found.push(`${where}: ${g} pixels of the enemy's gold`);
        }
        if ((f === GCHARGE.fire || f === GCHARGE.full) && cyanOf(pics[1]) < 40) found.push(`${where}: no great flash of the friend's cyan`);
      }
      // (the loop's effects the same each round, whatever the time: its own round's)
      for (let f = GCHARGE.loop; f < GCHARGE.fire; f++) {
        const one = chargeLayers();
        const two = chargeLayers();
        chargeFx(S.kind, one, at(f), f, 1.0);
        chargeFx(S.kind, two, at(f), f, 7.3);
        const p1 = layAir(W, H, one).d;
        const p2 = layAir(W, H, two).d;
        if (p1.some((v, i) => v !== p2[i])) found.push(`turned ${turn}: its loop's frame ${f} not the same each round`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}

test('its numbers: the shell skids it back exactly CHARGE_SKID.shell tiles and the beam CHARGE_SKID.beam, easing out; the blast as wide as SHELL_FX.blast tiles; the beam as long as BEAM_FX.long tiles', () => {
  const found: string[] = [];
  for (const kind of ['shell', 'beam'] as const) {
    const end = kind === 'shell' ? GCHARGE_SHELL.end : GCHARGE_BEAM.end;
    if (Math.abs(chargeSkid(kind, end) - CHARGE_SKID[kind]) > 1e-9) found.push(`${kind}: skids ${chargeSkid(kind, end)} tiles`);
    if (chargeSkid(kind, GCHARGE.fire) !== 0) found.push(`${kind}: skids before it fires`);
    let was = 0;
    let step = Infinity;
    for (let f = GCHARGE.fire + 1; f <= end; f++) {
      const s = chargeSkid(kind, f) - was;
      if (s < -1e-9) found.push(`${kind}: skids forward at frame ${f}`);
      if (s > step + 1e-9) found.push(`${kind}: skids faster at frame ${f} than the frame before`);
      step = s;
      was = chargeSkid(kind, f);
    }
  }
  // (the blast's ring at its widest: as far out across the picture as SHELL_FX.blast tiles round where it lands)
  const shell = sceneOf('shell', 'cannon', golemChargeShell, 45);
  const at = shell.at(GCHARGE.fire);
  const n = shellFlight(at);
  const wide = (k: number): number => {
    const ly = chargeLayers();
    const l = ly.l;
    chargeFx('shell', ly, at, GCHARGE.fire + n + k, 0);
    const p = new Px(shell.W, shell.H);
    l.lay(p, ['#000001', '#000002', '#000003', '#000004']);
    const b = boxOf(p);
    return b[2] - b[0];
  };
  const R = SHELL_FX.blast * UNITS_PER_TILE;
  const want = at.S([at.aim[0] + R, at.aim[1], 0])[0];
  void want;
  // (its width on the picture: a round of the floor R across, seen as the game sees it)
  const span = Math.max(...Array.from({ length: 72 }, (_, i) => at.S([at.aim[0] + Math.cos((i / 36) * Math.PI) * R, at.aim[1] + Math.sin((i / 36) * Math.PI) * R, 0])[0])) - Math.min(...Array.from({ length: 72 }, (_, i) => at.S([at.aim[0] + Math.cos((i / 36) * Math.PI) * R, at.aim[1] + Math.sin((i / 36) * Math.PI) * R, 0])[0]));
  const ring = Math.max(wide(5), wide(6));
  if (Math.abs(ring - span) > 8) found.push(`the blast ${ring} pixels across, its ${SHELL_FX.blast} tiles ${Math.round(span)}`);
  // (the beam, the frame after it fires: out to its full length)
  const beam = sceneOf('beam', 'tesla', golemChargeBeam, 45);
  const bt = beam.at(GCHARGE.fire + 1);
  const ly = chargeLayers();
  chargeFx('beam', ly, bt, GCHARGE.fire + 1, 0);
  const p = new Px(beam.W, beam.H);
  ly.l.lay(p, ['#000001', '#000002', '#000003', '#000004']);
  const b = boxOf(p);
  const m = bt.S(bt.muzzle);
  const e = bt.S(bt.aim);
  const reach = Math.hypot(e[0] - m[0], e[1] - m[1]);
  const far = Math.max(Math.abs(b[2] - m[0]), Math.abs(b[0] - m[0]));
  // (out to its end, and the splash of light where it ends a little beyond: no further)
  if (far < Math.abs(e[0] - m[0]) - 4 || far > Math.abs(e[0] - m[0]) + 32) found.push(`the beam reaches ${far} pixels across, its ${BEAM_FX.long} tiles ${Math.round(Math.abs(e[0] - m[0]))}`);
  if (Math.hypot(bt.aim[0] - bt.muzzle[0], bt.aim[1] - bt.muzzle[1]) / UNITS_PER_TILE < BEAM_FX.long - 0.01) found.push('the beam shorter than its length');
  void reach;
  assert.deepEqual(found, []);
});

test('nothing of the game draws the charged shots: no file of the game (src/, but for its mock-ups in src/dev/) imports dev/golem_charge_fx.ts or the charged moves', () => {
  const found: string[] = [];
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((n: string) => {
    const p = `${dir}/${n}`;
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });
  for (const file of walk('src')) {
    if (file.startsWith('src/dev/')) continue;
    const text = readFileSync(file, 'utf8');
    if (/golem_charge_fx|golemChargeShell|golemChargeBeam|GCHARGE/.test(text)) found.push(file);
  }
  assert.deepEqual(found, []);
});

// ---- the scene its effects are checked in: the Golem drawn as the game would (turned 45 from in front, 135 truly from behind),
// what it fires at five tiles out (the shell) or its beam's full length out, all of it on a scene with room round it

function sceneOf(kind: 'shell' | 'beam', gun: 'cannon' | 'tesla', move: (f: number) => Q, turn: number): { at: (f: number) => ChargeAt; W: number; H: number } {
  const T = UNITS_PER_TILE;
  const q0 = move(GCHARGE.loop);
  const d0 = drawAt(gun, q0, 'front', turn);
  const sc0 = LAST.sc as Sculpt;
  const M0: V3 = [...GOLEM_MUZZLE.p] as V3;
  const hl = Math.hypot(GOLEM_MUZZLE.way[0], GOLEM_MUZZLE.way[1]);
  const wh: V3 = [GOLEM_MUZZLE.way[0] / hl, GOLEM_MUZZLE.way[1] / hl, 0];
  const land: V3 = [M0[0] + wh[0] * 5 * T, M0[1] + wh[1] * 5 * T, 0];
  const W = 760;
  const H = 560;
  // (the Golem placed so that all it throws off is well inside the scene)
  const raw = (p: V3): [number, number] => {
    const s = d0.st.at(sc0.at(p));
    return [s[0], s[1]];
  };
  const pts: [number, number][] = [raw([0, 0, 0]), raw([0, 0, 100])];
  for (let i = 0; i < 24; i++) pts.push(raw([land[0] + Math.cos((i / 12) * Math.PI) * 2.8 * T, land[1] + Math.sin((i / 12) * Math.PI) * 2.8 * T, 0]), raw([land[0], land[1], 150]));
  pts.push(raw([M0[0] + wh[0] * 8.6 * T, M0[1] + wh[1] * 8.6 * T, 0]), raw([M0[0] + wh[0] * 8.6 * T, M0[1] + wh[1] * 8.6 * T, 80]), raw([M0[0] - wh[0] * 1.6 * T, M0[1] - wh[1] * 1.6 * T, 0]));
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const y1 = Math.max(...pts.map((p) => p[1]));
  const ox = (W - (x1 - x0)) / 2 - x0;
  const oy = (H - (y1 - y0)) / 2 - y0;
  const S = (p: V3): [number, number] => {
    const s = raw(p);
    return [s[0] + ox, s[1] + oy];
  };
  let fired: V3 | null = null;
  const at = (f: number): ChargeAt => {
    drawAt(gun, move(f), 'front', turn);
    const sc = LAST.sc as Sculpt;
    const skid = chargeSkid(kind, f) * T;
    const mv = (p: V3): V3 => [p[0] - wh[0] * skid, p[1] - wh[1] * skid, p[2]];
    const muzzle = mv(GOLEM_MUZZLE.p);
    if (f === GCHARGE.fire) fired = muzzle;
    const stacks = sc.prims.filter((p) => p.tag === 'mouth' && p.k === 'cone').map((p) => {
      const m = p as unknown as { a: V3; b: V3 };
      return mv([(m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2, Math.max(m.a[2], m.b[2])]);
    });
    const feet = sc.prims.filter((p) => p.tag === 'foot' && p.k === 'box').map((p) => mv((p as unknown as { c: V3 }).c));
    return {
      S,
      muzzle,
      way: GOLEM_MUZZLE.way,
      vents: GOLEM_VENTS.pts.map(mv),
      ventWays: GOLEM_VENTS.ways,
      stacks,
      grip: [...feet, mv(GOLEM_FIST.c)],
      fired: fired ?? M0,
      aim: kind === 'shell' ? land : [muzzle[0] + wh[0] * BEAM_FX.long * T, muzzle[1] + wh[1] * BEAM_FX.long * T, 22],
    };
  };
  // (as it fires, first: so the shell flies from where it fired)
  at(GCHARGE.fire);
  return { at, W, H };
}
function painted(p: Px): number {
  let n = 0;
  for (let i = 3; i < p.d.length; i += 4) if (p.d[i]) n++;
  return n;
}
function boxOf(p: Px): [number, number, number, number] {
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}
function hsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255;
  const d = mx - mn;
  let h = 0;
  if (d) h = mx === r / 255 ? ((g - b) / 255 / d) % 6 : mx === g / 255 ? (b - r) / 255 / d + 2 : (r - g) / 255 / d + 4;
  return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx];
}
function goldOf(p: Px): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (h >= 30 && h <= 62 && s > 0.5 && v > 0.6) n++;
  }
  return n;
}
function cyanOf(p: Px): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (h >= 170 && h <= 200 && s > 0.3 && v > 0.6) n++;
  }
  return n;
}
