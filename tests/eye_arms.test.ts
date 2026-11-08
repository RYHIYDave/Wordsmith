// THE SWAMP COLOSSUS'S MOVES, PART 2: HIS TENTACLES (art/eye_arms.ts, painted by art/eye_colossus.ts; a mock-up behind EYE2, off).
// The owner, 7 Nov 2026: shown the roar, “Yes, on to the tentacles (Recommended)”; of the old fight, 5 Nov, “You need some more time to
// dodge those tentacles.”; 20:25, “Beyond just slamming down on the platform, I’d also like the tentacles to slam the water on the left
// sending a wave right across the platform, then on the right sending a wave to the left, then both sides simultaneously to send a big
// crash into the middle”; how a wave is got past, “Outrun or dodge through”. His rules: Movement 9 (a big held wind-up, a fast smeared
// strike, a big wind-down), “Action, like a movie”, nothing through anything. What this holds:
//   1. the switch is off and nothing of the game imports the tentacles' moves;
//   2. EACH ONE'S STAND closes on itself (a loop of ARM_LOOP, two in his stand), painted the same at its end as at its start;
//   3. nothing cyan (the tentacles in every move; his ichor; the stone's chips); the warning line the enemy's pink, the game's own;
//   4. NOTHING THROUGH ANYTHING: each tentacle clear of the stone (lying on it, never in it), of him, and of each other, in every
//      frame of both shots, and at every turn of the line;
//   5. NEVER STILL: in every frame of both shots each tentacle there moves;
//   6. NO LEAPS: from frame to frame, but in the strikes' smeared frames and the bursts; out of each move back into its stand;
//   7. THE CUES: each wind-up held 0.9 s with its warning drawn all through it; the strike two frames, smeared; the landing along
//      the line, the screen jolted; the water slams' warnings and waves, the crash where the two meet; struck, ichor; dying, it sinks;
//   8. THE WAVES as he read them: tallest at the back, thinning toward the front and dying before the front edge (outrun there,
//      dodged through anywhere); the two meeting in the middle in the crash.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { BLADE, CYAN, GLINT, SPARK } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import { EYE2, EYE_LOOP, armClearances, paintColossus } from '../src/art/eye_colossus';
import type { ArmPose, ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { ARM_LOOP, ARM_STAND_FRAMES, EYE_FPS, armLayer, armStand } from '../src/art/eye_moves';
import type { EyeFrame } from '../src/art/eye_moves';
import { ARM_COLOURS, ARM_SHAKE, ARM_TURNS, CRASH, CRASH_AT, DEATH, FLINCH, LINE, SHOTS, SHOT_P1, SHOT_P2, SLAM, SMASH, STONE_BOX, UNIT, QUAY, WAVE, armDeath, armFlinch, armSlam, armSmash, armStoneGap, armsGap, fightFrame, rootOf, tubeOf, waveFront, waveHigh } from '../src/art/eye_arms';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function hue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return -1;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return (h + 360) % 360;
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 120 || max - min < 0.4 * max) return false;
  const h = hue(r, g, b);
  return h >= 160 && h <= 205;
}
const cyanish = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b) || (hue(r, g, b) >= 160 && hue(r, g, b) <= 205 && Math.max(r, g, b) - Math.min(r, g, b) > 20);
};
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
const small = { w: Math.round(1100 * Z), h: Math.round(660 * Z), ax: Math.round(550 * Z), ay: Math.round(300 * Z), zoom: Z, raw: true };
/** Each tentacle in a frame of a shot (its pose), with which it is. */
const armsIn = (F: EyeFrame): ArmPose[] => F.arms.filter((a) => a).map((a) => (a as { pose: ColossusPose }).pose.arms[0]);
/** A point of a tentacle `s` of his lengths back from its tip along it (its paths are drawn with more or fewer points, and with more or
 *  less of it under the water, from move to move: its tip is the one place always the same). */
function fromTip(p: ReadonlyArray<readonly number[]>, s: number): number[] {
  let acc = 0;
  for (let i = p.length - 1; i > 0; i--) {
    const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], p[i][2] - p[i - 1][2]);
    if (acc + d >= s) {
      const u = (s - acc) / (d || 1);
      return [0, 1, 2].map((c) => p[i][c] + (p[i - 1][c] - p[i][c]) * u);
    }
    acc += d;
  }
  return [...p[0]];
}
/** The most any point of a tentacle (its tip and every 20 of his lengths back from it, 200 of them) moves from one frame to the next. */
const spineOf = (a: ArmPose): number[][] => {
  const T = tubeOf(a);
  const out: number[][] = [];
  for (let k = 0; k < T.n; k++) out.push([T.p[k * 4], T.p[k * 4 + 1], T.p[k * 4 + 2]]);
  return out;
};
const step = (a: ArmPose, b: ArmPose): number => {
  // (along the tube the painter draws through its points)
  const A = spineOf(a);
  const B = spineOf(b);
  let m = 0;
  for (let s = 0; s <= 200; s += 20) {
    const p = fromTip(A, s);
    const q = fromTip(B, s);
    m = Math.max(m, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]));
  }
  return m;
};
/** Which of a shot's tentacles each layer of a frame is (its layer's key says: A<w>.). */
const whichIn = (F: EyeFrame): number[] => F.arms.filter((a) => a).map((a) => Number((a as { key: string }).key[1]));

test('1. the switch is off; nothing of the game imports the tentacles\' moves', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_arms.ts') continue;
    if (/from ['"][^'"]*eye_arms['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_arms.ts');
});

test('2. each tentacle\'s stand closes on itself, a loop of its own, two in his stand', () => {
  assert.ok(ARM_LOOP >= 1.2 && ARM_LOOP <= 2.2, `its loop about 2 s (${ARM_LOOP} s)`);
  assert.equal(ARM_STAND_FRAMES, ARM_LOOP * EYE_FPS, `its loop ${ARM_STAND_FRAMES} frames`);
  assert.ok(Math.abs(EYE_LOOP / ARM_LOOP - Math.round(EYE_LOOP / ARM_LOOP)) < 1e-9, `his stand holds a whole number of them (${EYE_LOOP / ARM_LOOP})`);
  const near = (x: unknown, y: unknown): boolean => JSON.stringify(x, (_, v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v)) === JSON.stringify(y, (_, v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v));
  for (let w = 0; w < 5; w++) {
    assert.ok(near(armStand(w, 0), armStand(w, ARM_LOOP)), `tentacle ${w}: the same at the end of its loop as at its start`);
    assert.ok(near(armLayer(armStand(w, 0), 0), armLayer(armStand(w, ARM_LOOP), ARM_LOOP)), `tentacle ${w}: its drips and suckers the same`);
  }
  const pa = paintColossus(armLayer(armStand(0, 0), 0), small);
  const pb = paintColossus(armLayer(armStand(0, ARM_LOOP), ARM_LOOP), small);
  let diff = 0;
  for (let i = 0; i < pa.px.d.length; i += 4) if (pa.px.d[i] !== pb.px.d[i] || pa.px.d[i + 1] !== pb.px.d[i + 1] || pa.px.d[i + 2] !== pb.px.d[i + 2] || pa.px.d[i + 3] !== pb.px.d[i + 3]) diff++;
  assert.ok(diff <= 2, `painted the same at the end of its loop as at its start (${diff} pixels differ)`);
});

test('3. nothing cyan; the warning line the enemy\'s pink, the game\'s own', () => {
  // (the tentacles in each move: standing, reared and held, landed, struck lying, convulsing, thrashing, sinking, smashed in the water)
  const ang = ARM_TURNS[5];
  const landed = armSlam(1, ang, SLAM.hit + 2, 0);
  const poses: Array<[string, ArmPose]> = [
    ['standing', armStand(1, 0.4)],
    ['reared, held', armSlam(1, ang, SLAM.wind - 2, 0)],
    ['landed', landed],
    ['struck lying', { ...landed, path: armFlinch(landed.path, 2, true) }],
    ['convulsing', { ...landed, path: armDeath(1, landed.path, 8) }],
    ['thrashing', { ...landed, path: armDeath(1, landed.path, DEATH.convulse + 10) }],
    ['sinking', { ...landed, path: armDeath(1, landed.path, DEATH.convulse + DEATH.thrash + 20) }],
    ['smashed in the water', armSmash(0, SMASH.hit + 3, 0)],
  ];
  for (const [name, a] of poses) assert.equal(cyanIn(paintColossus(armLayer(a, 0.3), small)), 0, `${name}: nothing cyan`);
  // (what the game draws round them: his ichor, the stone's chips and cracks, the warning's shade)
  for (const c of [...ARM_COLOURS.ichor, ARM_COLOURS.stoneLit, ARM_COLOURS.stoneDark, ARM_COLOURS.crack, ARM_COLOURS.warnShade]) assert.ok(!cyanish(c), `${c}: not cyan`);
  for (const c of ARM_COLOURS.ichor) {
    const [r, g, b] = rgba(c);
    assert.ok(r >= g && r >= b, `his ichor ${c} dark red, never cyan`);
  }
  // (the line: the game's warning's own colours (render/act1_fx/garden_warn.ts), the enemy's pink, flaring to the enemy's gold in its
  // last quarter as the blow comes)
  assert.equal(ARM_COLOURS.warnEdge[0], FLAME[2], 'the warning\'s edge FLAME 2');
  assert.equal(ARM_COLOURS.warnEdge[1], FLAME[3], 'its flare FLAME 3, as the game\'s');
  const h2 = hue(...(rgba(ARM_COLOURS.warnEdge[0]).slice(0, 3) as [number, number, number]));
  assert.ok(h2 >= 290 || h2 <= 20, `${ARM_COLOURS.warnEdge[0]} the enemy's pink (its hue ${h2.toFixed(0)})`);
  const h3 = hue(...(rgba(ARM_COLOURS.warnEdge[1]).slice(0, 3) as [number, number, number]));
  assert.ok(h3 >= 0 && h3 <= 60 && !cyanish(ARM_COLOURS.warnEdge[1]), `${ARM_COLOURS.warnEdge[1]} the enemy's gold (its hue ${h3.toFixed(0)})`);
  const game = fs.readFileSync('src/render/act1_fx/garden_warn.ts', 'utf8');
  assert.ok(game.includes('FLAME[3] : FLAME[2]') && game.includes(`'${ARM_COLOURS.warnShade}'`), 'the game\'s warning\'s colours');
});

test('4. nothing through anything: each tentacle clear of the stone, of him and of each other, in every frame; at every turn', () => {
  // (his tentacle's own picture: only what is seen, over the water or a little under it, is asked against him)
  const seen = (a: ArmPose): ArmPose => {
    const i = a.path.findIndex((q) => q[2] > -40);
    return { ...a, path: a.path.slice(Math.max(0, i - 1)) };
  };
  let worstStone = Infinity;
  let worstBody = Infinity;
  let worstEach = Infinity;
  for (const [shot, S] of [['p1', SHOT_P1], ['p2', SHOT_P2]] as const) {
    for (let k = 0; k < S.frames; k++) {
      const F = fightFrame(shot, k);
      const arms = armsIn(F);
      const ws = whichIn(F);
      arms.forEach((a, i) => {
        const g = armStoneGap(a);
        worstStone = Math.min(worstStone, g.gap);
        assert.ok(g.gap > 0, `${shot} ${k}: tentacle ${ws[i]} clear of the stone (${g.gap.toFixed(1)} at ${g.at.map((v) => v.toFixed(0)).join(',')})`);
      });
      for (let i = 0; i < arms.length; i++) for (let j = i + 1; j < arms.length; j++) {
        const g = armsGap(arms[i], arms[j]);
        worstEach = Math.min(worstEach, g);
        assert.ok(g > 0, `${shot} ${k}: tentacles ${ws[i]} and ${ws[j]} clear of each other (${g.toFixed(1)})`);
      }
      if (k % 2 === 0) {
        const c = armClearances({ ...F.jaws.pose, drop: F.jaws.drop, back: F.jaws.back, arms: arms.map(seen) });
        worstBody = Math.min(worstBody, c.body);
        assert.ok(c.body > 0, `${shot} ${k}: his tentacles clear of him (${c.body.toFixed(1)} at ${c.where.map((v) => v.toFixed(0)).join(',')})`);
      }
    }
  }
  // (every slam at every turn of its line, each frame of it, for each tentacle that slams the stone)
  for (const w of [1, 3, 4]) for (const ang of ARM_TURNS) for (let k = 0; k < SLAM.frames; k++) {
    const g = armStoneGap(armSlam(w, ang, k, 0));
    worstStone = Math.min(worstStone, g.gap);
    assert.ok(g.gap > 0, `tentacle ${w} at ${((ang * 180) / Math.PI).toFixed(0)}, frame ${k}: clear of the stone (${g.gap.toFixed(1)})`);
  }
  for (const w of [0, 2]) for (let k = 0; k < SMASH.frames; k++) assert.ok(armStoneGap(armSmash(w, k, 0)).gap > 0, `tentacle ${w}'s water slam, frame ${k}: clear of the stone`);
  process.stdout.write(`  the least gaps: the stone ${worstStone.toFixed(1)}, him ${worstBody.toFixed(1)}, each other ${worstEach.toFixed(1)}\n`);
});

test('5. never still: every tentacle moves in every frame of both shots', () => {
  for (const [shot, S] of [['p1', SHOT_P1], ['p2', SHOT_P2]] as const) {
    let prev = fightFrame(shot, 0);
    let least = Infinity;
    let at = '';
    for (let k = 1; k < S.frames; k++) {
      const F = fightFrame(shot, k);
      const a = armsIn(prev);
      const b = armsIn(F);
      const wa = whichIn(prev);
      const wb = whichIn(F);
      wb.forEach((w, i) => {
        const j = wa.indexOf(w);
        if (j < 0) return;
        const s = step(a[j], b[i]);
        if (s < least) {
          least = s;
          at = `${k} (tentacle ${w})`;
        }
      });
      prev = F;
    }
    assert.ok(least > 0.25, `${shot}: never still (the least any moves in a frame ${least.toFixed(2)} of his lengths, at ${at})`);
  }
  // (and standing: every frame of its loop, its tip and the rest of it)
  for (let w = 0; w < 5; w++) for (let k = 0; k < ARM_STAND_FRAMES; k++) assert.ok(step(armStand(w, k / EYE_FPS), armStand(w, (k + 1) / EYE_FPS)) > 0.4, `tentacle ${w} standing, frame ${k}: moving`);
});

test('6. no leaps: frame to frame, but in the strikes; out of each move back into its stand', () => {
  for (const [shot, S] of [['p1', SHOT_P1], ['p2', SHOT_P2]] as const) {
    // (the frames a strike lands in, and the bursts: fast by rule)
    const fast = new Set<number>();
    for (const a of S.arms) for (const d of a.doings) {
      if (d.is === 'slam' || d.is === 'smash') for (const f of [SLAM.wind, SLAM.hit, SLAM.hit + 1]) fast.add(d.k0 + f);
      if (d.is === 'burst') for (let f = 0; f < 14; f++) fast.add(d.k0 + 10 + f - 2);
      if (d.is === 'flinch') for (let f = 0; f < 3; f++) fast.add(d.k0 + f);
    }
    let worst = 0;
    let at = '';
    let strike = 0;
    let prev = fightFrame(shot, 0);
    for (let k = 1; k < S.frames; k++) {
      const F = fightFrame(shot, k);
      const a = armsIn(prev);
      const wa = whichIn(prev);
      whichIn(F).forEach((w, i) => {
        const j = wa.indexOf(w);
        if (j < 0) return;
        const s = step(a[j], armsIn(F)[i]);
        if (fast.has(k)) strike = Math.max(strike, s);
        else if (s > worst) {
          worst = s;
          at = `${k} (tentacle ${w})`;
        }
      });
      prev = F;
    }
    assert.ok(worst < 0.5 * strike, `${shot}: no leaps (the most any moves in a frame outside a strike ${worst.toFixed(1)} at ${at}; a strike ${strike.toFixed(1)})`);
    process.stdout.write(`  ${shot}: the most in a frame outside a strike ${worst.toFixed(1)} (at ${at}), in a strike ${strike.toFixed(1)}\n`);
  }
  // (in the shots: out of its stand into each slam and water slam, and back into its stand after, no bigger a step than standing's)
  for (const [shot, S] of [['p1', SHOT_P1], ['p2', SHOT_P2]] as const) for (const a of S.arms) for (const d of a.doings) {
    if (d.is !== 'slam' && d.is !== 'smash') continue;
    // (its end only if nothing else has begun by then: struck, it does not go back to its stand)
    const cut = a.doings.some((e) => e.k0 > d.k0 && e.k0 <= d.k0 + SLAM.frames);
    for (const k of cut ? [d.k0] : [d.k0, d.k0 + SLAM.frames]) {
      const before = armsIn(fightFrame(shot, k - 1))[whichIn(fightFrame(shot, k - 1)).indexOf(a.w)];
      const after = armsIn(fightFrame(shot, k))[whichIn(fightFrame(shot, k)).indexOf(a.w)];
      if (!before || !after) continue;
      const s = step(before, after);
      assert.ok(s < 6, `${shot} ${k}: tentacle ${a.w} into and out of its ${d.is} without a leap (${s.toFixed(1)})`);
    }
  }
  // (a slam and a water slam hand back to its stand: their last frame a step from its stand's next)
  for (const w of [1, 3]) {
    const t0 = 0.7;
    const last = armSlam(w, ARM_TURNS[3], SLAM.frames - 1, t0);
    const next = armStand(w, t0 + SLAM.frames / EYE_FPS);
    const own = step(armStand(w, t0 + (SLAM.frames - 1) / EYE_FPS), next);
    assert.ok(step(last, next) < own + 3, `tentacle ${w}: out of its slam into its stand without a leap (${step(last, next).toFixed(1)}, its stand's own ${own.toFixed(1)})`);
  }
  for (const w of [0, 2]) {
    const last = armSmash(w, SMASH.frames - 1, 0);
    const next = armStand(w, SMASH.frames / EYE_FPS);
    assert.ok(step(last, next) < step(armStand(w, (SMASH.frames - 1) / EYE_FPS), next) + 3, `tentacle ${w}: out of its water slam into its stand without a leap`);
  }
});

test('7. the cues: held wind-ups with their warnings, two-frame strikes landing along the line, the jolts, the waves, ichor, the sinking', () => {
  // (the slam: its wind-up held 0.9 s, the warning on the stone all through it; two frames of strike, both smeared; the jolt)
  assert.ok(Math.abs(SLAM.wind / EYE_FPS - 0.9) < 0.05, `the wind-up ${(SLAM.wind / EYE_FPS).toFixed(2)} s`);
  assert.equal(SLAM.hit - SLAM.wind + 1, 2, 'the strike two frames');
  assert.ok(SLAM.down >= 24 && SMASH.down >= 24, 'a big wind-down');
  for (const [shot, S] of [['p1', SHOT_P1], ['p2', SHOT_P2]] as const) for (const a of S.arms) for (const d of a.doings) {
    if (d.is !== 'slam' && d.is !== 'smash') continue;
    for (let f = 0; f < SLAM.hit; f++) {
      const F = fightFrame(shot, d.k0 + f);
      const warned = d.is === 'slam' ? F.fx?.lines.some((l) => Math.abs(l.ang - d.ang) < 1e-9) : F.fx?.waveWarn !== null;
      assert.ok(warned, `${shot} ${d.k0 + f}: tentacle ${a.w}'s warning shows through its wind-up`);
    }
    for (const f of [SLAM.wind, SLAM.hit]) {
      const F = fightFrame(shot, d.k0 + f);
      assert.ok(F.smear.some((s) => s && s.key.startsWith(`A${a.w}`)), `${shot} ${d.k0 + f}: tentacle ${a.w}'s strike smeared`);
    }
    const hit = fightFrame(shot, d.k0 + SLAM.hit);
    if (d.is === 'slam') assert.ok(Math.max(...hit.shake.map(Math.abs)) >= ARM_SHAKE.slam - 1, `${shot} ${d.k0 + SLAM.hit}: the screen jolted as it lands (${hit.shake})`);
    else assert.ok(hit.fx?.smashes.length, `${shot} ${d.k0 + SLAM.hit}: its smash in the water`);
  }
  // (lands ALONG THE LINE: what of it lies on the stone lies inside its line, at every turn, for each that slams the stone)
  for (const w of [1, 3, 4]) for (const ang of ARM_TURNS) {
    const [rx, ry] = rootOf(w);
    const a = armSlam(w, ang, SLAM.hit, 0);
    let lying = 0;
    for (const q of a.path) {
      if (q[2] > 22 || q[1] < STONE_BOX.y0) continue;
      lying++;
      const along = (q[0] - rx) * Math.sin(ang) + (q[1] - ry) * Math.cos(ang);
      const across = (q[0] - rx) * Math.cos(ang) - (q[1] - ry) * Math.sin(ang);
      assert.ok(Math.abs(across) < LINE.wid / 2 && along < LINE.len + 4, `tentacle ${w} at ${((ang * 180) / Math.PI).toFixed(0)}: lies inside its line (${along.toFixed(0)} along, ${across.toFixed(0)} across)`);
    }
    assert.ok(lying >= 6, `tentacle ${w} at ${((ang * 180) / Math.PI).toFixed(0)}: lying along it (${lying} of its points on the stone)`);
  }
  // (the water slams: left, then right, then both; the waves after each; the crash after the both)
  const smashes = SHOT_P2.arms.flatMap((a) => a.doings.filter((d) => d.is === 'smash').map((d) => [a.w, d.k0 + SMASH.hit]));
  assert.ok(smashes.some(([w]) => w === 0) && smashes.some(([w]) => w === 2), 'the left and the right');
  const both = smashes.filter(([, k]) => smashes.filter(([, k2]) => k2 === k).length === 2);
  assert.equal(both.length, 2, 'then both at once');
  const kb = both[0][1];
  assert.ok(fightFrame('p2', kb + 2).fx?.waves.length === 2, 'two waves racing in');
  const kc = kb + Math.round(CRASH_AT * EYE_FPS) + 2;
  const C = fightFrame('p2', kc);
  assert.ok(C.fx?.crash !== null && (C.fx?.crash ?? -1) >= 0, `the crash as they meet (frame ${kc})`);
  assert.ok(Math.max(...C.shake.map(Math.abs)) >= 4, `the screen thrown by the crash (${C.shake})`);
  // (struck: ichor; dying: it sinks, and is gone)
  const B = SHOT_P1.arms.find((a) => a.doings.some((d) => d.is === 'death'));
  const fl = B?.doings.find((d) => d.is === 'flinch');
  const de = B?.doings.find((d) => d.is === 'death');
  assert.ok(fl && de, 'one struck and dying in phase 1');
  if (fl && de && B) {
    assert.ok(fightFrame('p1', fl.k0 + 1).fx?.ichor.length, 'struck: his ichor spurts');
    assert.ok(fightFrame('p1', de.k0 + DEATH.convulse + DEATH.thrash + 5).fx?.sinks.length, 'sinking: the water churns over it');
    assert.ok(!whichIn(fightFrame('p1', de.k0 + DEATH.frames + 1)).includes(B.w), 'gone under');
    assert.ok(DEATH.convulse >= 15, `its convulsing held (${DEATH.convulse} frames)`);
    assert.ok(FLINCH >= 10, 'a big flinch');
  }
  assert.equal(SHOTS.p1, SHOT_P1.frames, 'the shots');
});

test('8. the waves as he read them: tallest at the back, dying before the front edge; the two meeting in the middle in the crash', () => {
  const deep = STONE_BOX.y1 - STONE_BOX.y0;
  assert.ok(Math.abs(waveHigh(STONE_BOX.y0) - WAVE.high) < 1e-9, `tallest at the back (${WAVE.high} of his lengths)`);
  let prev = Infinity;
  for (let y = STONE_BOX.y0; y <= STONE_BOX.y1; y += 10) {
    const h = waveHigh(y);
    assert.ok(h <= prev + 1e-9, `thinning toward the front (${(y - STONE_BOX.y0).toFixed(0)} onto the stone: ${h.toFixed(1)})`);
    prev = h;
  }
  assert.ok(WAVE.reach < deep - UNIT && waveHigh(STONE_BOX.y0 + WAVE.reach) === 0, `dying before the front edge (its reach ${(WAVE.reach / UNIT).toFixed(1)} of the stone's ${(deep / UNIT).toFixed(1)} tiles)`);
  // (the Warrior in phase 2 runs to the front, out of its reach: outrun)
  const last = SHOT_P2.hero[SHOT_P2.hero.length - 1];
  assert.ok((QUAY + last.dv) * UNIT - STONE_BOX.y0 > WAVE.reach, 'the Warrior outruns them at the front');
  // (crossing the whole stone, each; the two of the both-at-once meeting in the middle)
  assert.ok(waveFront(1, 0) < STONE_BOX.x0 && waveFront(-1, 0) > STONE_BOX.x1, 'each from off its end');
  assert.ok(Math.abs(waveFront(1, CRASH_AT)) < 1e-6 && Math.abs(waveFront(-1, CRASH_AT)) < 1e-6, 'meeting in the middle');
  assert.ok(CRASH.high > 2.5 * WAVE.high, `the crash huge (${CRASH.high} of his lengths high, the waves ${WAVE.high})`);
  process.stdout.write(`  a wave: ${(WAVE.speed / UNIT).toFixed(1)} tiles a second, ${(WAVE.reach / UNIT).toFixed(1)} tiles onto the stone, ${(WAVE.high / UNIT).toFixed(1)} tiles high at the back; they meet ${CRASH_AT.toFixed(2)} s after the smash\n`);
});
