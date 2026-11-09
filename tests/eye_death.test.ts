// THE SWAMP COLOSSUS'S MOVES, PART 6: HIS DEATH (art/eye_death.ts, painted by art/eye_colossus.ts; a mock-up behind EYE2, off). The
// owner, 8 Nov 2026 (by 18:44): “Yes, on to his death (Recommended)”; asked “How should the Swamp colossus die?”, his pick: “Eye bursts,
// he melts (Recommended)”. His rules: Movement 9, “Action, like a movie”, nothing through anything, “Everything drawn should not just look
// like shapes.  That’s the rule”, nothing ruled; his ichor dark, never cyan.
// What this holds:
//   1. the switch is off and nothing of the game imports his death;
//   2. THE BEATS: the wind-up held 1.2 s (his eye seizing), the burst on frame 36 and its two smeared frames, the thrash and the last roar,
//      his grip tearing, the melt, his teeth dropping out, the sink, the water still; when the fight can end;
//   3. NOTHING THROUGH ANYTHING: his tongue, eye, spittle and jaws clear of each other in every frame; him clear of the stone in every
//      frame (as he melts too: his melting drawn as it is painted); the Warrior never under his spray or in him;
//   4. NEVER STILL: him moving in every frame;
//   5. NO LEAPS: his place and his eye frame to frame, but in the burst; the Warrior no faster than a run (a leap a little faster);
//   6. THE CUES: the spray, the gore, the sludge, the teeth, the bones, the water, the shakes; the sound's cues in order;
//   7. NOTHING CYAN in him as he seizes, bursts, thrashes, melts; nor in the colours of his ichor, sludge and bones;
//   8. NOTHING RULED: the gore's splats, the sludge's edge;
//   9. the numbers.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { CYAN } from '../src/art/kit';
import { rgba } from '../src/engine/px';
import { EYE2, bodyClearances, paintColossus, turnedClear } from '../src/art/eye_colossus';
import type { ColossusAnim, ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { ARM_COLOURS, STONE_BOX } from '../src/art/eye_arms';
void ARM_COLOURS;
import { EYE_FPS } from '../src/art/eye_moves';
import type { EyeLayer } from '../src/art/eye_moves';
import { TILE } from '../src/art/eye_body';
import { DEATH, DEATH_CUES, DEATH_GONE, DEATH_SHAKE, DEATH_TAKE, SINK, SLUDGE, SPRAY, TONGUE_GONE, deathFrame, deathLayers, deathNumbers, fallingTeeth, goreIn, heroDeath, meltK, placeAt, sludgeEdge, sludgeReach, teethGone } from '../src/art/eye_death';

interface Assert {
  ok(v: unknown, m?: string): void;
  equal(a: unknown, b: unknown, m?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
const SEEN = 2 / Math.sqrt(3);
const R3 = Math.sqrt(3);

/** All of him in a frame (his own space, his drop as he is laid): through the wind-up his stand's jaws and drool with his own tongue; after,
 *  his one layer. */
function whole(f: number): { P: ColossusPose; drop: number; back: number } {
  const L = deathLayers(f);
  if (L.tongue) {
    const an = L.jaws.pose.anim as ColossusAnim;
    const T = L.tongue.pose.anim as ColossusAnim;
    const Sp = L.spit?.pose.anim;
    return { P: { ...L.jaws.pose, drop: 0, back: 0, anim: { ...an, tore: Sp?.tore, knit: Sp?.knit, tongue: T.tongue, eye: T.eye, gaze: T.gaze, lids: T.lids, swell: T.swell, seize: T.seize, parts: undefined }, arms: [] }, drop: L.jaws.drop, back: L.jaws.back };
  }
  return { P: { ...L.jaws.pose, back: 0, anim: { ...(L.jaws.pose.anim as ColossusAnim), parts: undefined } }, drop: L.jaws.pose.drop + L.jaws.drop, back: L.jaws.back };
}

test('1. the switch is off; nothing of the game imports his death', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_death.ts') continue;
    if (/from ['"][^'"]*eye_death['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_death.ts');
});

test('2. the beats: the blow taken (held), the burst (smeared), the thrash and roar, the melt, the sink, still', () => {
  // THE WIND-UP, HELD: his eye seizing from the blow to the burst, swelling, its pupil blown wide
  assert.ok(DEATH.burst / EYE_FPS >= 1.2 - 1e-9, `the wind-up held ${(DEATH.burst / EYE_FPS).toFixed(2)} s`);
  const seized = (f: number): number => ((deathLayers(f).tongue as EyeLayer).pose.anim as ColossusAnim).seize ?? 0;
  assert.ok(seized(1) < 0.05 && seized(DEATH.burst - 1) > 0.99, 'seizing through the wind-up');
  for (let f = 0; f < DEATH.burst; f++) assert.ok(deathLayers(f).tongue?.key.startsWith('T.d'), `frame ${f}: his own tongue as it seizes`);
  // THE BURST: on frame 36, its two frames the only smeared
  for (let f = -DEATH_TAKE.lead; f < DEATH.frames; f++) {
    const L = deathLayers(f);
    const smeared = L.smear.length > 0;
    assert.equal(smeared, f === DEATH.burst || f === DEATH.burst + 1, `frame ${f}: smeared only in the burst's two frames`);
    if (f >= DEATH.burst && f <= DEATH_GONE) assert.equal((L.jaws.pose.anim as ColossusAnim).burst, 1, `frame ${f}: his eye burst`);
  }
  // THE THRASH, the roar, his grip torn loose
  assert.ok(DEATH.tear > DEATH.thrash[0] && DEATH.roar[0] > DEATH.thrash[0] && DEATH.roar[1] <= DEATH.melt[0] + 4, 'the thrash, his grip tearing, his last roar, in turn');
  const open = (f: number): number => (deathLayers(f).jaws.pose.anim as ColossusAnim).open;
  let wide = 0;
  for (let f = DEATH.roar[0]; f < DEATH.roar[1]; f++) wide = Math.max(wide, open(f));
  assert.ok(wide > 1.4, `his jaws flung wide in his last roar (${wide.toFixed(2)})`);
  assert.ok(placeAt(DEATH.slip[1]).fwd < placeAt(DEATH.tear).fwd - 30, 'his grip torn loose: slid back off the edge');
  // THE MELT: from nothing to all of him, his teeth dropping out, his jaws sagging and folding in
  assert.equal(meltK(DEATH.melt[0]), 0, 'melting from nothing');
  assert.equal(meltK(DEATH.melt[1]), 1, 'all of him melted');
  assert.equal(teethGone(DEATH.teeth[1]), 1, 'all his teeth gone');
  assert.ok(open(DEATH.melt[1]) < 0.9, 'his jaws sagged and folded in');
  // THE SINK: under by DEATH_GONE, his tongue gone into the sludge on the stone first
  assert.ok(TONGUE_GONE < DEATH.sink[1] && placeAt(DEATH.sink[1]).sink === SINK, 'gone under');
  assert.ok(DEATH.end <= DEATH.still && DEATH.still < DEATH.frames, 'the fight can end as the water goes still');
});

test('3. nothing through anything: his tongue, eye, spittle, jaws; him clear of the stone; the Warrior clear of him', () => {
  const worst = { tongue: Infinity, eye: Infinity, spit: Infinity, jaws: Infinity, stone: Infinity };
  for (let f = 0; f <= DEATH_GONE; f++) {
    const W = whole(f);
    const c = bodyClearances({ ...W.P, drop: 0 }, 0);
    assert.ok(c.tongue > 0 && c.eye > 0, `${f}: his tongue and eye clear of his jaws (${c.tongue.toFixed(1)}, ${c.eye.toFixed(1)}; ${c.where})`);
    assert.ok(c.spit > 0, `${f}: his spittle clear of his tongue (${c.spit.toFixed(1)})`);
    assert.ok(c.jaws > 0, `${f}: his jaws clear of each other`);
    // (him, as he is drawn: melting too)
    const st = turnedClear({ ...W.P, drop: W.drop }, [0, -W.back], STONE_BOX).stone;
    assert.ok(st > 0, `${f}: him clear of the stone (${st.toFixed(1)})`);
    worst.tongue = Math.min(worst.tongue, c.tongue);
    worst.eye = Math.min(worst.eye, c.eye);
    worst.spit = Math.min(worst.spit, c.spit);
    worst.jaws = Math.min(worst.jaws, c.jaws);
    worst.stone = Math.min(worst.stone, st);
  }
  // (the Warrior: on the stone, never in him)
  for (let k = 0; k < DEATH_TAKE.frames; k++) {
    const h = heroDeath(k);
    assert.ok(h.y > STONE_BOX.y0 + 20, `${k}: the Warrior on the stone, before the edge`);
  }
  process.stdout.write(`  the least gaps: his tongue ${worst.tongue.toFixed(1)}, his eye ${worst.eye.toFixed(1)}, his spittle ${worst.spit.toFixed(1)}, his jaws ${worst.jaws.toFixed(1)}, the stone ${worst.stone.toFixed(1)}\n`);
});

test('4. never still: him in every frame', () => {
  const his = (k: number): string => {
    const F = deathFrame(k);
    return JSON.stringify([F.jaws, F.spit, F.tongue].map((x) => x && [x.key, Math.round(x.drop * 10), Math.round(x.back * 10)]));
  };
  let prev = his(0);
  for (let k = 1; k < DEATH_TAKE.frames; k++) {
    const now = his(k);
    assert.ok(now !== prev, `${k}: he moves`);
    prev = now;
  }
});

test('5. no leaps: him and the Warrior, frame to frame, but in the burst', () => {
  let place = 0;
  let eye = 0;
  let whip = 0;
  let jerk = 0;
  let hero = 0;
  const eyeOf = (f: number): number[] => {
    const L = deathLayers(f);
    const T = (L.tongue ?? L.jaws) as EyeLayer;
    const e = (T.pose.anim as ColossusAnim).eye as readonly number[];
    return [e[0], e[1] - T.back, e[2] - T.drop - T.pose.drop];
  };
  // (thrashing, his tongue whips the torn sac round fast, but smoothly: no more than 36 a frame, its speed changing by little each frame)
  const thrash = (f: number): boolean => f >= DEATH.thrash[0] && f < DEATH.melt[0] + 14;
  let vPrev: number[] | null = null;
  for (let f = 1; f < TONGUE_GONE; f++) {
    const a = placeAt(f - 1);
    const b = placeAt(f);
    place = Math.max(place, Math.hypot(b.fwd - a.fwd, b.rise - a.rise, b.sink - a.sink));
    if (f === DEATH.burst || f === DEATH.burst + 1) {
      vPrev = null;
      continue;
    }
    const ea = eyeOf(f - 1);
    const eb = eyeOf(f);
    const v = [eb[0] - ea[0], eb[1] - ea[1], eb[2] - ea[2]];
    const d = Math.hypot(v[0], v[1], v[2]);
    if (thrash(f)) {
      whip = Math.max(whip, d);
      if (vPrev && f > DEATH.thrash[0]) jerk = Math.max(jerk, Math.hypot(v[0] - vPrev[0], v[1] - vPrev[1], v[2] - vPrev[2]));
    } else eye = Math.max(eye, d);
    vPrev = v;
  }
  assert.ok(place < 8, `his place no more than 8 of his lengths a frame (${place.toFixed(1)})`);
  assert.ok(eye < 16, `his eye no more than 16 a frame but in the burst and the thrash (${eye.toFixed(1)})`);
  assert.ok(whip < 36 && jerk < 12, `thrashing, his eye whipped round no more than 36 a frame, smoothly (${whip.toFixed(1)}, its speed changing ${jerk.toFixed(1)} a frame at the most)`);
  for (let k = 1; k < DEATH_TAKE.frames; k++) {
    const p = heroDeath(k - 1);
    const q = heroDeath(k);
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    assert.ok(d <= (q.act === 'roll' ? 10.5 : 8.5), `${k}: the Warrior no faster than a run (${d.toFixed(1)})`);
    hero = Math.max(hero, d);
  }
  process.stdout.write(`  him at the most ${place.toFixed(1)} of his lengths a frame; his eye ${eye.toFixed(1)} but in the burst and the thrash (${whip.toFixed(1)}, smoothly: ${jerk.toFixed(1)}); the Warrior ${hero.toFixed(1)}\n`);
});

test('6. the cues: the spray, the gore, the sludge, the teeth, the bones, the water, the shakes, the sound', () => {
  const at = (f: number) => deathFrame(DEATH_TAKE.lead + f);
  assert.ok(at(DEATH.burst - 1).dfx?.burst === undefined && at(DEATH.burst).dfx?.burst?.s === 0, 'the burst on frame 36');
  assert.ok(SPRAY.gobs >= 60 && SPRAY.drops >= 150 && SPRAY.strings > 0, 'a great spray: gobs, drops, ropes');
  assert.ok((at(DEATH.melt[0] + 30).dfx?.sludge?.k ?? 0) > 0.2, 'his sludge on the stone as he melts');
  assert.ok((at(DEATH.sink[1] + 10).dfx?.sludge?.gone ?? -1) > 0, 'drying away after he is under');
  const T = fallingTeeth();
  assert.ok(T.length > 20, `his teeth dropping out (${T.length})`);
  for (const q of T) assert.ok(q.f >= DEATH.teeth[0] && q.f <= DEATH.teeth[1], 'each tooth let go while they drop');
  assert.ok((at(DEATH.still).dfx?.bones ?? 0) > 0.99, 'his bones lying in the shallows as the water goes still');
  // (the water: boiling as he goes under, still at the end)
  assert.ok(at(Math.round((DEATH.sink[0] + DEATH.sink[1]) / 2)).water.boil > 0.5, 'boiling as he goes under');
  assert.ok(at(DEATH.frames - 1).water.boil < 0.05 && at(DEATH.frames - 1).water.bubbles < 0.05, 'still at the end');
  // (the shakes: the burst the hardest)
  let big = 0;
  for (let f = DEATH.burst; f < DEATH.burst + 3; f++) big = Math.max(big, Math.abs(at(f).shake[1]));
  assert.ok(big >= DEATH_SHAKE.burst - 1, `the screen thrown hard as it bursts (${big})`);
  // (the sound's cues, in order, each on a frame of his death)
  for (let i = 1; i < DEATH_CUES.length; i++) assert.ok(DEATH_CUES[i].f >= DEATH_CUES[i - 1].f && DEATH_CUES[i].f < DEATH.frames, `cue ${i} in order`);
});

const isCyan = (r: number, g: number, b: number): boolean => b > 110 && g > 110 && r < 0.75 * Math.min(g, b);
function cyanIn(P: ColossusPicture): number {
  let n = 0;
  for (let i = 0; i < P.px.d.length; i += 4) if (P.px.d[i + 3] > 0 && isCyan(P.px.d[i], P.px.d[i + 1], P.px.d[i + 2])) n++;
  return n;
}
test('7. nothing cyan: him as he seizes, bursts, thrashes, melts; his ichor, sludge and bones', () => {
  const small = { w: 380, h: 200, ax: 190, ay: 120, zoom: 1 / 3, raw: true };
  for (const f of [20, DEATH.burst, 60, 120, 170, 200]) {
    const L = deathLayers(f);
    for (const Q of [L.jaws, L.tongue]) if (Q && Q.key.match(/^(T\.d|D)\./)) assert.equal(cyanIn(paintColossus(Q.pose, small)), 0, `${f}: ${Q.key}: nothing cyan`);
  }
  const c = rgba(CYAN[2]);
  assert.ok(isCyan(c[0], c[1], c[2]), 'the friend\'s cyan is cyan');
  // (his ichor, art/eye_arms.ts ARM_COLOURS.ichor; his sludge; his teeth and bones)
  const hexes = ['#0e0609', '#220b14', '#3c1220', '#5a1c2c', '#7e2c3a', '#090a0a', '#131615', '#202522', '#333b31', '#55604a', '#3a3022', '#62563e', '#8e8060', '#b8aa84', '#ddd2ae'];
  for (const h of hexes) {
    const v = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    assert.ok(!isCyan(v[0], v[1], v[2]), `${h}: not cyan`);
  }
});

/** The longest straight runs in a mask, exactly across and up (its edges between it and not). */
function runsOf(M: Uint8Array, w: number, h: number): { across: number; up: number } {
  let across = 0;
  let up = 0;
  for (let j = 0; j < h - 1; j++) {
    let r = 0;
    for (let i = 0; i < w; i++) {
      r = M[j * w + i] !== M[(j + 1) * w + i] ? r + 1 : 0;
      across = Math.max(across, r);
    }
  }
  for (let i = 0; i < w - 1; i++) {
    let r = 0;
    for (let j = 0; j < h; j++) {
      r = M[j * w + i] !== M[j * w + i + 1] ? r + 1 : 0;
      up = Math.max(up, r);
    }
  }
  return { across, up };
}
const RULED = 24;
test('8. nothing ruled: the gore\'s splats, the sludge\'s edge', () => {
  const worst: Record<string, { across: number; up: number }> = {};
  const note = (name: string, r: { across: number; up: number }): void => {
    const w0 = worst[name] ?? { across: 0, up: 0 };
    worst[name] = { across: Math.max(w0.across, r.across), up: Math.max(w0.up, r.up) };
    assert.ok(r.across <= RULED && r.up <= RULED, `${name}: no ruled edge (${r.up / 2} game px up, ${r.across / 2} across)`);
  };
  // (a splat, every way it can lie, as big as they come)
  for (const size of [1, 2.5, 6]) for (const dir of [0, 0.7, Math.PI / 2, 2.4]) for (const seed of [3, 11, 29]) {
    const R = size * 2.6;
    const w = Math.ceil(R * 7) + 8;
    const M = new Uint8Array(w * w);
    const ux = Math.cos(dir);
    const uy = Math.sin(dir) * 0.5;
    const ul = Math.hypot(ux, uy);
    for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) {
      const di = i - w / 2;
      const dj = j - w / 2;
      if (goreIn((di * ux + dj * uy) / ul, ((-di * uy + dj * ux) / ul) * 1.8, R, size, seed) <= 1) M[j * w + i] = 1;
    }
    note('the gore', runsOf(M, w, w));
  }
  // (the sludge on the stone as the screen sees it, every size it grows to)
  for (const grow of [0.3, 0.7, 1]) for (const t of [0, 1.5, 3]) {
    const w = 560;
    const h = 120;
    const M = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = (i - w / 2) / SEEN;
      const d = j * R3;
      const r0 = sludgeReach(x, grow);
      if (r0 >= 1 && d < sludgeEdge(x, d, t, r0)) M[j * w + i] = 1;
    }
    // (its foot along the stone's edge is the edge itself: not counted)
    const r = runsOf(M.subarray(2 * w), w, h - 2);
    note('the sludge', r);
  }
  process.stdout.write(`  the longest straight runs (game px, up, across): ${Object.entries(worst).map(([k, v]) => `${k} ${v.up / 2}, ${v.across / 2}`).join('; ')}\n`);
});

test('9. the numbers, in the game\'s tiles and seconds', () => {
  const N = deathNumbers();
  assert.ok(N.seconds > 10 && N.seconds < 13, 'his death about 12 s');
  assert.ok(Math.abs(N.burst - 1.2) < 1e-9, 'the burst at 1.2 s');
  assert.ok(N.end <= 10 + 1e-9, 'the fight can end by 10 s');
  assert.ok(SLUDGE.r / TILE > 3 && SINK / TILE > 7, 'the sludge and the sink');
  process.stdout.write(`  his death ${N.seconds.toFixed(1)} s: the burst at ${N.burst.toFixed(2)} s; the fight can end at ${N.end.toFixed(1)} s; slid back ${N.slip[0].toFixed(2)} tiles and down ${N.slip[1].toFixed(2)}; sunk ${N.sink.toFixed(2)} tiles; his sludge out to ${N.sludge.toFixed(2)} tiles off the edge; ${N.teeth} teeth dropped\n`);
});
