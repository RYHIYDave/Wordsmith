// THE SWAMP COLOSSUS'S MOVES, PART 4: HIS BODY'S OWN ATTACKS, THE BILE ARC AND THE GAZE (art/eye_body.ts, painted by
// art/eye_colossus.ts; a mock-up behind EYE2, off). The owner, 8 Nov 2026 (by 10:53): “Bile arc and gaze (Recommended)”; 10:54, told
// how they would be drawn: “That’s good”. His rules: Movement 9, “Action, like a movie”, nothing through anything, nowhere safe,
// “Everything drawn should not just look like shapes.  That’s the rule”, nothing ruled. What this holds:
//   1. the switch is off and nothing of the game imports his body's attacks;
//   2. THE BEATS: each wind-up held 0.9 s, its warning through it; the strike two frames, smeared; held; the wind-down; out of his stand
//      and back into it at the frame his stand would be at;
//   3. NOTHING THROUGH ANYTHING: his tongue, eye, spittle and jaws clear of each other, him clear of the stone, his tentacles clear of
//      him, in every frame of both; the beam and the glob clear of his tentacles (his middle one ducking out of the beam's way);
//   4. NEVER STILL: him in every frame;
//   5. NO LEAPS: him and the Warrior frame to frame, but in the strikes and the Warrior knocked flying;
//   6. THE CUES: the glob out of his throat on the strike, landing where the warning is; the splash, the pool; the gaze's arc (the main
//      chat's rule, 8 Nov 11:42: laid 32 degrees to one side of the Warrior, warned 0.9 s, swept to the other side in 1.2 s, 0.9 tiles
//      wide), the beam on from the strike, swept evenly, its line the whole stone; the shakes; the Warrior just clear in the first take
//      of each and caught in the second;
//   7. nothing cyan: him, and the colours of what the game draws;
//   8. NOTHING RULED: no straight run over 12 game pixels, exactly across or up, in the glob, the pool, the warning, the gaze's arc, the
//      beam, the fire along its line or the scorch's first side;
//   9. the numbers, in the game's tiles.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { BLADE, CYAN, GLINT, SPARK } from '../src/art/kit';
import { rgba } from '../src/engine/px';
import { EYE2, armClearances, bodyClearances, paintColossus, turnedClear } from '../src/art/eye_colossus';
import type { ArmPose, ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { STONE_BOX } from '../src/art/eye_arms';
import { EYE_FPS, eyeFrame, standAnim } from '../src/art/eye_moves';
import type { EyeFrame, EyeLayer } from '../src/art/eye_moves';
import { BEAM, BEAM_COLOURS, BILE, BILE_COLOURS, BILE_LAND, BILE_RELEASE, BODY_SHAKE, BODY_TAKE, DUCK, GAZE, GAZE_FIRE, GAZE_OUT, GAZE_SWEPT, POOL, SPLASH_R, TILE, arcEdge, beamAngle, beamEdge, beamLine, beamOn, bileTarget, bodyFrame, bodyNumbers, fireEdge, gazeArc, globAt, globBlobs, heroWorldB, poolEdge, poolR, scorchEdge, warnEdge } from '../src/art/eye_body';
import type { BodyShot } from '../src/art/eye_body';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
const L = BODY_TAKE.lead;
const SEEN = 2 / Math.sqrt(3);
const R3 = Math.sqrt(3);
const tiles = (v: number): string => (v / TILE).toFixed(2);
const ATTACKS: Array<['bile' | 'gaze', BodyShot, BodyShot, { wind: number; strike: number; frames: number }]> = [['bile', 'b1', 'b2', BILE], ['gaze', 'g1', 'g2', GAZE]];

/** All of him in a frame, as one pose (his jaws' frame, his tongue's, his tentacles), laid where he is. */
function whole(F: EyeFrame): ColossusPose {
  const an = F.jaws.pose.anim;
  if (!an) throw new Error('a frame of a move');
  const T = F.tongue?.pose.anim;
  return { ...F.jaws.pose, drop: F.jaws.drop, back: F.jaws.back, anim: { ...an, tongue: T ? T.tongue : null, eye: T ? T.eye : an.eye, gaze: T ? T.gaze : an.gaze, lids: T ? T.lids : an.lids, roll: T ? T.roll : 0, swell: T ? T.swell : 1, parts: undefined }, arms: F.arms.filter((a) => a).map((a) => laidArm(a as EyeLayer)) };
}
/** A tentacle as it is laid in a frame (its layer moved down and back: his middle one ducking out of the gaze's way). */
function laidArm(A: EyeLayer): ArmPose {
  const arm = A.pose.arms[0];
  return { ...arm, path: arm.path.map((q) => [q[0] + (A.dx ?? 0), q[1] - A.back, q[2] - A.drop, ...q.slice(3)]) };
}

test('1. the switch is off; nothing of the game imports his body\'s attacks', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_body.ts' || f === 'art/eye_phase3.ts') continue;
    if (/from ['"][^'"]*eye_body['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_body.ts');
});

test('2. the beats: a held wind-up with its warning, two smeared frames of strike, held, the wind-down; out of his stand and back into it', () => {
  for (const [kind, s1, , A] of ATTACKS) {
    assert.ok(A.wind / EYE_FPS >= 0.9 - 1e-9, `${kind}: the wind-up held ${(A.wind / EYE_FPS).toFixed(2)} s`);
    assert.equal(A.strike, 2, `${kind}: the strike two frames`);
    for (let f = 0; f < A.frames + 10; f++) {
      const F = bodyFrame(s1, L + f);
      const smeared = F.smear.some((x) => x);
      assert.equal(smeared, f >= A.wind && f < A.wind + A.strike, `${kind} ${f}: smeared only in the strike`);
      if (f < A.wind) assert.ok(kind === 'bile' ? !!F.bfx?.warn : !!F.bfx?.arc, `${kind} ${f}: the warning through the wind-up`);
    }
    // (his stand before and after: the stand's own layers; just before the end, as his stand is)
    const before = bodyFrame(s1, L - 1);
    const after = bodyFrame(s1, L + A.frames);
    assert.ok(before.jaws.key.startsWith('J.s') && before.tongue?.key.startsWith('T.s'), `${kind}: his stand before (${before.jaws.key})`);
    assert.ok(after.jaws.key.startsWith('J.s') && after.tongue?.key.startsWith('T.s'), `${kind}: back in his stand after (${after.jaws.key})`);
    const last = bodyFrame(s1, L + A.frames - 1);
    const st = standAnim(((L + A.frames - 1) % 90) / EYE_FPS);
    const an = last.jaws.pose.anim;
    const tn = last.tongue?.pose.anim;
    assert.ok(an && Math.abs(an.open - st.open) < 0.01 && Math.abs(an.glow - st.glow) < 0.02 && Math.abs(last.jaws.back) < 0.5 && Math.abs(last.jaws.drop) < 0.5, `${kind}: his jaws back as his stand has them at its end`);
    const dt = tn && tn.tongue && st.tongue ? Math.max(...tn.tongue.map((q, i) => Math.hypot(q[0] - (st.tongue as number[][])[i][0], q[1] - (st.tongue as number[][])[i][1], q[2] - (st.tongue as number[][])[i][2]))) : 99;
    assert.ok(dt < 3, `${kind}: his tongue back where his stand has it (${dt.toFixed(1)})`);
  }
});

test('3. nothing through anything: his tongue, eye, spittle, jaws; him clear of the stone; his tentacles clear of him', () => {
  const worst = { tongue: Infinity, eye: Infinity, spit: Infinity, jaws: Infinity, stone: Infinity, arms: Infinity };
  for (const [kind, s1, , A] of ATTACKS) {
    for (let f = 0; f < A.frames; f++) {
      if (f % 2 && !(f >= A.wind - 1 && f < A.wind + A.strike + 2)) continue;
      const F = bodyFrame(s1, L + f);
      const P = whole(F);
      const c = bodyClearances(P, 0);
      assert.ok(c.tongue > 0 && c.eye > 0, `${kind} ${f}: his tongue and eye clear of his jaws and teeth (${c.tongue.toFixed(1)}, ${c.eye.toFixed(1)}; ${c.where})`);
      assert.ok(c.spit > 0, `${kind} ${f}: his spittle clear of his tongue (${c.spit.toFixed(1)}; ${c.where})`);
      assert.ok(c.jaws > 0, `${kind} ${f}: his jaws clear of each other (${c.jaws.toFixed(1)})`);
      const stone = turnedClear({ ...P, arms: [] }, [0, -F.jaws.back], STONE_BOX).stone;
      assert.ok(stone > 0, `${kind} ${f}: him clear of the stone (${stone.toFixed(1)})`);
      if (f % 6 === 0) {
        const a = armClearances(P);
        assert.ok(a.body > 0 && a.stone > 0, `${kind} ${f}: his tentacles clear of him and of the stone (${a.body.toFixed(1)}, ${a.stone.toFixed(1)})`);
        worst.arms = Math.min(worst.arms, a.body);
      }
      worst.tongue = Math.min(worst.tongue, c.tongue);
      worst.eye = Math.min(worst.eye, c.eye);
      worst.spit = Math.min(worst.spit, c.spit);
      worst.jaws = Math.min(worst.jaws, c.jaws);
      worst.stone = Math.min(worst.stone, stone);
    }
  }
  // (THE BEAM clear of his tentacles in every frame it is on: from his eye's front to where it comes down, its own thickness and each
  // tentacle's counted; his middle tentacle, in the arc, ducked under the water out of its way; and the glob over them)
  const seg = (p: readonly number[], a: readonly number[], b: readonly number[]): [number, number] => {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const u = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2)));
    return [Math.hypot(ap[0] - ab[0] * u, ap[1] - ab[1] * u, ap[2] - ab[2] * u), u];
  };
  const tube = (A: EyeLayer): Array<{ p: number[]; r: number }> => {
    const arm = laidArm(A);
    const out: Array<{ p: number[]; r: number }> = [];
    for (let i = 0; i < arm.path.length - 1; i++) for (let t = 0; t < 1; t += 0.1) out.push({ p: [0, 1, 2].map((c) => arm.path[i][c] + (arm.path[i + 1][c] - arm.path[i][c]) * t), r: arm.r });
    return out;
  };
  let beamGap = Infinity;
  for (let f = GAZE_FIRE; f < GAZE_OUT; f++) {
    const F = bodyFrame('g1', L + f);
    const B = F.bfx as NonNullable<EyeFrame['bfx']>;
    const e = B.eye as number[];
    const g = B.gaze as number[];
    const sw = B.swell ?? 1;
    const E0 = [e[0] + g[0] * 22 * sw, e[1] + g[1] * 22 * sw, e[2] + g[2] * 22 * sw];
    const Bm = B.beam as NonNullable<typeof B.beam>;
    for (const A of F.arms) if (A) for (const q of tube(A)) {
      const [d, u] = seg(q.p, E0, [Bm.ax, Bm.ay, 2]);
      beamGap = Math.min(beamGap, d - q.r - Math.max(beamEdge(u, 0, -1), beamEdge(u, 0, 1)) * 1.4);
    }
  }
  assert.ok(beamGap > 0, `the beam clear of his tentacles (${beamGap.toFixed(1)})`);
  let globGap = Infinity;
  for (let s = 0; s <= BILE.flight / EYE_FPS; s += 1 / EYE_FPS) {
    const G = globAt(s) as NonNullable<ReturnType<typeof globAt>>;
    const F = bodyFrame('b1', L + BILE_RELEASE + Math.round(s * EYE_FPS));
    for (const A of F.arms) if (A) for (const q of tube(A)) globGap = Math.min(globGap, Math.hypot(q.p[0] - G.x, q.p[1] - G.y, q.p[2] - G.z) - q.r - 34);
  }
  assert.ok(globGap > 0, `the glob clear of his tentacles (${globGap.toFixed(1)})`);
  process.stdout.write(`  the least gaps: his tongue ${worst.tongue.toFixed(1)}, his eye ${worst.eye.toFixed(1)}, his spittle ${worst.spit.toFixed(1)}, his jaws ${worst.jaws.toFixed(1)}, the stone ${worst.stone.toFixed(1)}, his tentacles ${worst.arms.toFixed(1)}; the beam from his tentacles ${beamGap.toFixed(1)} (his middle one ducked ${DUCK.down} down, ${DUCK.back} back), the glob ${globGap.toFixed(1)}\n`);
});

test('4. never still: him in every frame of both takes', () => {
  for (const shot of ['b1', 'g1'] as const) {
    const his = (G: EyeFrame): string => JSON.stringify([G.jaws, G.spit, G.tongue].map((x) => x && [x.key, x.drop, x.back]));
    let prev = bodyFrame(shot, 0);
    for (let k = 1; k < BODY_TAKE.frames; k++) {
      const F = bodyFrame(shot, k);
      assert.ok(his(F) !== his(prev), `${shot} ${k}: he moves`);
      prev = F;
    }
  }
});

test('5. no leaps: him and the Warrior, frame to frame, but in the strikes and the Warrior knocked flying', () => {
  for (const [kind, s1, s2, A] of ATTACKS) {
    let eye = 0;
    let back = 0;
    let open = 0;
    let hero = 0;
    let strikeEye = 0;
    for (let f = -2; f < A.frames + 2; f++) {
      const a = bodyFrame(s1, L + f - 1);
      const b = bodyFrame(s1, L + f);
      const ea = a.tongue?.pose.anim?.eye as readonly number[];
      const eb = b.tongue?.pose.anim?.eye as readonly number[];
      const de = Math.hypot(eb[0] - ea[0], eb[1] - b.tongue!.back + a.tongue!.back - ea[1], eb[2] - b.tongue!.drop + a.tongue!.drop - ea[2]);
      const strike = f >= A.wind && f <= A.wind + A.strike;
      if (strike) strikeEye = Math.max(strikeEye, de);
      else eye = Math.max(eye, de);
      if (!strike) {
        back = Math.max(back, Math.hypot(b.jaws.back - a.jaws.back, b.jaws.drop - a.jaws.drop));
        open = Math.max(open, Math.abs((b.jaws.pose.anim?.open ?? 1) - (a.jaws.pose.anim?.open ?? 1)));
      }
    }
    for (const sh of [s1, s2]) for (let k = 1; k < BODY_TAKE.frames; k++) {
      const p = heroWorldB(sh, k - 1);
      const q = heroWorldB(sh, k);
      if (q.act === 'knock' || p.act === 'knock') continue;
      hero = Math.max(hero, Math.hypot(q.x - p.x, q.y - p.y));
    }
    assert.ok(eye < 12, `${kind}: his eye no more than 12 a frame but in the strike (${eye.toFixed(1)})`);
    assert.ok(back < 5 && open < 0.06, `${kind}: him drawing back and his jaws easing, but in the strike (${back.toFixed(1)}, ${open.toFixed(3)})`);
    assert.ok(hero <= 8.5, `${kind}: the Warrior no faster than a run (${hero.toFixed(1)} a frame)`);
    process.stdout.write(`  ${kind}: his eye ${eye.toFixed(1)} a frame at the most (${strikeEye.toFixed(1)} in the strike); him drawn back ${back.toFixed(1)}; his jaws ${open.toFixed(3)}; the Warrior ${hero.toFixed(1)} a frame\n`);
  }
});

test('6. the cues: the glob, the splash and the pool; the line, the beam; the shakes; just clear, then caught', () => {
  // THE BILE: out of his throat on the strike's second frame, high over, down where the warning is
  const [tx, ty] = bileTarget();
  assert.equal(BILE_RELEASE, BILE.wind + BILE.strike - 1, 'the glob leaves him on the strike\'s second frame');
  assert.ok(globAt(-0.01) === null && globAt(0) !== null, 'the glob out of his throat as he retches');
  const g1 = globAt(BILE.flight / EYE_FPS) as NonNullable<ReturnType<typeof globAt>>;
  assert.ok(Math.hypot(g1.x - tx, g1.y - ty) < 1 && Math.abs(g1.z) < 1, 'it lands where the warning is');
  let top = 0;
  for (let s = 0; s <= BILE.flight / EYE_FPS; s += 0.01) top = Math.max(top, (globAt(s) as { z: number }).z);
  assert.ok(top > 200, `high over (${top.toFixed(0)})`);
  const W = bodyFrame('b1', L + 10).bfx?.warn;
  assert.ok(W && Math.hypot(W.x - tx, W.y - ty) < 1, 'the warning on the Warrior\'s spot');
  assert.ok(bodyFrame('b1', L + BILE_LAND).bfx?.splash?.s === 0, 'the splash as it lands');
  assert.ok(poolR(POOL.spread + 0.1) === POOL.r && poolR(POOL.life - 0.01) > 0 && poolR(POOL.life) === 0, 'the pool spreads, burns, shrinks to nothing');
  const hb = (k: number): number => Math.max(...bodyFrame('b1', k).shake.map(Math.abs));
  assert.ok(hb(L + BILE.wind) >= BODY_SHAKE.retch - 1 && hb(L + BILE_LAND) >= BODY_SHAKE.splash - 1, 'the screen jolted as he retches and as it crashes down');
  const b1 = heroWorldB('b1', L + BILE_LAND);
  const b2 = heroWorldB('b2', L + BILE_LAND);
  assert.ok(Math.hypot(b1.x - tx, b1.y - ty) > SPLASH_R + 14, `the first: just clear of the splash (${tiles(Math.hypot(b1.x - tx, b1.y - ty) - SPLASH_R)} tiles past its edge)`);
  assert.ok(Math.hypot(b2.x - tx, b2.y - ty) < SPLASH_R && heroWorldB('b2', L + BILE_LAND + 1).act === 'knock', 'the second: caught by it and knocked flying');
  // THE GAZE: the arc toward where the Warrior stood, 32 degrees each side; warned through the wind-up; the beam on from the strike,
  // swept evenly across in 1.2 s, guttering at the other side; its line the whole stone
  const A = gazeArc();
  const deg = (r: number): number => (r * 180) / Math.PI;
  const g0 = heroWorldB('g1', L);
  assert.ok(Math.abs(deg(Math.atan2(g0.x - A.ox, g0.y - A.oy) - A.toward)) < 0.01 && JSON.stringify(heroWorldB('g2', L)) === JSON.stringify(g0), 'toward where the Warrior stands as it begins (both takes)');
  assert.ok(Math.abs(deg(A.toward - A.a0) - 32) < 1e-6 && Math.abs(deg(A.a1 - A.toward) - 32) < 1e-6, 'laid 32 degrees to one side, swept to 32 the other');
  for (let f = 0; f < GAZE.wind; f++) assert.ok(bodyFrame('g1', L + f).bfx?.arc, `warned at ${f}`);
  assert.equal(GAZE.wind / EYE_FPS, 0.9, 'warned 0.9 s');
  assert.equal(GAZE.sweep / EYE_FPS, 1.2, 'swept in 1.2 s');
  assert.ok(Math.abs(BEAM.w / TILE - 0.9) < 1e-9, '0.9 tiles wide');
  for (let f = 0; f < GAZE.frames; f++) assert.equal(!!bodyFrame('g1', L + f).bfx?.beam, f >= GAZE_FIRE && f < GAZE_OUT, `the beam at ${f}`);
  assert.ok(Math.abs((beamAngle(GAZE_FIRE) as number) - A.a0) < 1e-9 && Math.abs((beamAngle(GAZE_SWEPT) as number) - A.a1) < 1e-9 && Math.abs((beamAngle(GAZE_OUT - 1) as number) - A.a1) < 1e-9, 'fired at its first side, at its other as it is swept and as it gutters');
  for (let f = GAZE_FIRE + 1; f <= GAZE_SWEPT; f++) assert.ok(Math.abs((beamAngle(f) as number) - (beamAngle(f - 1) as number) - (A.a1 - A.a0) / GAZE.sweep) < 1e-9, `swept evenly (${f})`);
  for (let u = 0; u <= 1; u += 1 / 32) {
    const Ln = beamLine(A.a0 + (A.a1 - A.a0) * u);
    assert.ok(Math.abs(Ln.sy - STONE_BOX.y0) < 1e-6 && Math.abs(Ln.sx) < STONE_BOX.x1, 'its line onto the stone at its back edge');
    assert.ok(Math.abs(Ln.ey - STONE_BOX.y1) < 1e-6 || Math.abs(Math.abs(Ln.ex) - STONE_BOX.x1) < 1e-6, 'and right across it, out at its far edge or an end');
  }
  const hg = (k: number): number => Math.max(...bodyFrame('g1', k).shake.map(Math.abs));
  assert.ok(hg(L + GAZE_FIRE) >= BODY_SHAKE.beam - 1, 'the screen jolted as it fires');
  // (the first take: out of the arc before the beam reaches him, and clear of it all through, just: it stops less than a tile short)
  let least = Infinity;
  for (let f = GAZE_FIRE; f < GAZE_OUT; f++) {
    const h = heroWorldB('g1', L + f);
    least = Math.min(least, -beamOn([h.x, h.y], f));
  }
  assert.ok(least > 0 && least < TILE, `the first: just clear of the beam (${tiles(least)} tiles past its edge, the Warrior's size counted)`);
  // (the second: caught as it sweeps over him, knocked flying the way it goes)
  let fc = -1;
  for (let f = GAZE_FIRE; f < GAZE_OUT && fc < 0; f++) {
    const h = heroWorldB('g2', L + f);
    if (beamOn([h.x, h.y], f) >= 0) fc = f;
  }
  assert.ok(fc > GAZE_FIRE + 2 && fc < GAZE_SWEPT, `the second: caught as it sweeps (frame ${fc})`);
  assert.equal(heroWorldB('g2', L + fc + 1).act, 'knock', 'and knocked flying');
  for (let f = fc + 8; f < GAZE_OUT; f++) {
    const h = heroWorldB('g2', L + f);
    assert.ok(beamOn([h.x, h.y], f) < 0, `thrown out of its way: never under it again (${f})`);
  }
  process.stdout.write(`  the first takes: the Warrior ${tiles(Math.hypot(b1.x - tx, b1.y - ty) - SPLASH_R)} tiles past the splash, ${tiles(least)} past the beam; the second caught by the beam at frame ${fc} of the gaze\n`);
});

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 120 || max - min < 0.4 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 160 && h <= 205;
}
function cyanIn(p: ColossusPicture): number {
  const d = p.px.d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) n++;
  }
  return n;
}
const Z = 1 / 3;
const small = { w: Math.round(1100 * Z), h: Math.round(760 * Z), ax: Math.round(550 * Z), ay: Math.round(520 * Z), zoom: Z, raw: true };

test('7. nothing cyan: him as he retches and as he glares; the colours of the bile and the beam the enemy\'s', () => {
  for (const [shot, f] of [['b1', BILE.wind - 1], ['b1', BILE.wind + 1], ['g1', GAZE.wind - 2], ['g1', GAZE.wind + 4]] as const) {
    const F = bodyFrame(shot, L + f);
    for (const Ly of [F.jaws, F.spit, F.tongue]) if (Ly) assert.equal(cyanIn(paintColossus(Ly.pose, small)), 0, `${shot} ${f}: ${Ly.key}: nothing cyan`);
  }
  const cols = [...BILE_COLOURS.bile, BILE_COLOURS.black, ...BILE_COLOURS.weed, ...BILE_COLOURS.bone, ...BILE_COLOURS.burn, ...BEAM_COLOURS];
  for (const c of cols) {
    const [r, g, b] = rgba(c);
    assert.ok(!FRIEND.has(`${r},${g},${b}`) && !cyanGlow(r, g, b), `${c}: not the friend's cyan`);
  }
});

/** The longest straight runs in a mask of edges, across and up. */
function longestRun(E: Uint8Array, w: number, h: number): { across: number; up: number } {
  let across = 0;
  let up = 0;
  for (let j = 0; j < h; j++) {
    let r = 0;
    for (let i = 0; i < w; i++) {
      r = E[j * w + i] ? r + 1 : 0;
      across = Math.max(across, r);
    }
  }
  for (let i = 0; i < w; i++) {
    let r = 0;
    for (let j = 0; j < h; j++) {
      r = E[j * w + i] ? r + 1 : 0;
      up = Math.max(up, r);
    }
  }
  return { across, up };
}
function edgesOf(M: Uint8Array, w: number, h: number): { V: Uint8Array; H: Uint8Array } {
  const V = new Uint8Array(w * h);
  const H = new Uint8Array(w * h);
  for (let j = 0; j < h - 1; j++) for (let i = 0; i < w - 1; i++) {
    const q = j * w + i;
    if (M[q] !== M[q + 1]) V[q] = 1;
    if (M[q] !== M[q + w]) H[q] = 1;
  }
  return { V, H };
}
const runsOf = (M: Uint8Array, w: number, h: number): { across: number; up: number } => {
  const E = edgesOf(M, w, h);
  return { across: longestRun(E.H, w, h).across, up: longestRun(E.V, w, h).up };
};
// (12 game pixels: two picture pixels to a game pixel)
const RULED = 24;

test('8. nothing ruled: the glob, the pool, the warning, the beam, the fire along the line, the scorch', () => {
  const worst: Record<string, { across: number; up: number }> = {};
  const note = (name: string, r: { across: number; up: number }): void => {
    const w0 = worst[name] ?? { across: 0, up: 0 };
    worst[name] = { across: Math.max(w0.across, r.across), up: Math.max(w0.up, r.up) };
    assert.ok(r.across <= RULED && r.up <= RULED, `${name}: no ruled edge (${r.up / 2} game px up, ${r.across / 2} across)`);
  };
  // THE GLOB: its blobs as the game draws them (each a lobed round), through its flight
  for (let s = 0; s <= BILE.flight / EYE_FPS; s += 0.05) {
    const w = 260;
    const M = new Uint8Array(w * w);
    for (const b of globBlobs(s, 40, 12)) {
      for (let dj = -Math.ceil(b.r) - 1; dj <= Math.ceil(b.r) + 1; dj++) for (let di = -Math.ceil(b.r) - 1; di <= Math.ceil(b.r) + 1; di++) {
        const ang = Math.atan2(dj, di);
        const rr = b.r * (1 + 0.16 * Math.sin(ang * 3 + 5) + 0.1 * Math.sin(ang * 5 - 10));
        if (Math.hypot(di, dj) > rr) continue;
        const i = Math.round(130 + b.di + di);
        const j = Math.round(130 + b.dj + dj);
        if (i >= 0 && j >= 0 && i < w && j < w) M[j * w + i] = 1;
      }
    }
    note('the glob', runsOf(M, w, w));
  }
  // THE POOL and THE WARNING: on the ground, as the screen sees it (across SEEN to a length, down 1/√3)
  const ground = (R: number, edge: (a: number) => number): { across: number; up: number } => {
    const w = Math.ceil(R * SEEN * 1.6) * 2 + 8;
    const h = Math.ceil((R / R3) * 1.6) * 2 + 8;
    const M = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = (i + 0.5 - w / 2) / SEEN;
      const Y = (j + 0.5 - h / 2) * R3;
      if (Math.hypot(X, Y) < R * edge(Math.atan2(Y, X))) M[j * w + i] = 1;
    }
    return runsOf(M, w, h);
  };
  for (let s = 0; s < POOL.life; s += 0.25) {
    const R = poolR(s);
    if (R > 4) note('the pool', ground(R, (a) => poolEdge(a, s)));
  }
  for (let f = 0; f < BILE_LAND; f += 3) note('the warning', ground(SPLASH_R, (a) => warnEdge(a, f)));
  // THE BEAM: out of his eye down to where it comes down, and THE FIRE along its line on the stone; each as a band down the screen
  // (the hardest way for an edge to lie: its edges' own wavering alone keeps them from running straight)
  const A = gazeArc();
  const band = (len: number, half: (u: number, side: number) => number): { across: number; up: number } => {
    const w = 140;
    const h = Math.ceil(len) + 10;
    const M = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) {
      const u = Math.min(1, Math.max(0, (j - 5) / len));
      const a = half(u, -1);
      const b = half(u, 1);
      for (let i = Math.round(70 - a); i <= Math.round(70 + b); i++) if (j >= 5 && j < h - 5 && i >= 0 && i < w) M[j * w + i] = 1;
    }
    // (its two ends, where it leaves the eye and where it comes down, cut flat here: not counted)
    const E = edgesOf(M, w, h);
    for (let i = 0; i < w; i++) for (const j of [4, h - 6]) E.H[j * w + i] = 0;
    return { across: longestRun(E.H, w, h).across, up: longestRun(E.V, w, h).up };
  };
  for (let f = GAZE_FIRE; f < GAZE_OUT; f += 1) {
    const s = (f - GAZE_FIRE) / EYE_FPS;
    const Ln = beamLine(beamAngle(f) as number);
    const len = Math.hypot(Ln.ex - Ln.sx, Ln.ey - Ln.sy);
    note('the beam', band(420, (u, side) => beamEdge(u, s, side) * SEEN));
    note('the fire along its line', band(len / R3, (u, side) => fireEdge(u * len, s, side) * SEEN));
  }
  // THE ARC (the warning) and THE SCORCH: on the stone as the screen sees it, their sides wavering and ragged (the stone's own edges,
  // the arena's, cut them where they meet them: not counted)
  const fan = (inside: (r: number, b: number) => boolean): { across: number; up: number } => {
    const x0 = -420;
    const y0 = 150;
    const w = Math.ceil(840 * SEEN);
    const h = Math.ceil(700 / R3);
    const M = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x0 + (i + 0.5) / SEEN;
      const Y = y0 + (j + 0.5) * R3;
      const r = Math.hypot(X - A.ox, Y - A.oy);
      if (inside(r, Math.atan2(X - A.ox, Y - A.oy))) M[j * w + i] = 1;
    }
    return runsOf(M, w, h);
  };
  for (let f = 0; f < GAZE.wind; f += 4) {
    const s = f / EYE_FPS;
    note('the arc', fan((r, b) => r * Math.sin(b - A.a0) - arcEdge(r, s, -1) >= 0 && r * Math.sin(A.a1 - b) - arcEdge(r, s, 1) >= 0));
  }
  note('the scorch', fan((r, b) => r * Math.sin(b - A.a0) + scorchEdge(r, -1) >= 0 && r * Math.sin(A.a1 - b) + scorchEdge(r, 1) >= 0));
  process.stdout.write(`  the longest straight runs (game px, up, across): ${Object.entries(worst).map(([k, v]) => `${k} ${v.up / 2}, ${v.across / 2}`).join('; ')}\n`);
});

test('9. the numbers, in the game\'s tiles', () => {
  const N = bodyNumbers();
  assert.ok(N.glob.tiles > 8 && N.splashTiles >= 2 && N.beam.longTiles[0] >= 6 && N.beam.deg === 64, 'big: the glob flies far, the splash is wide, the beam sweeps 64 degrees, its line across the stone');
  process.stdout.write(`  the bile: the glob ${N.glob.tiles.toFixed(1)} tiles in ${N.glob.s.toFixed(2)} s, ${N.glob.apexTiles.toFixed(1)} tiles high; the splash ${N.splashTiles.toFixed(1)} tiles round; the pool ${N.pool.tiles.toFixed(1)} tiles round, ${N.pool.s.toFixed(1)} s\n`);
  process.stdout.write(`  the gaze: the beam ${N.beam.wideTiles.toFixed(1)} tiles wide, swept ${N.beam.deg} degrees; its line on the stone ${N.beam.longTiles[0].toFixed(1)} to ${N.beam.longTiles[1].toFixed(1)} tiles long (${N.beam.reachTiles.toFixed(1)} from under his eye at the most); fired at frame ${N.beam.fire}, at its other side at ${N.beam.swept}, out at ${N.beam.out}\n`);
  void eyeFrame;
});
