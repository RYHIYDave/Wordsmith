// THE SWAMP COLOSSUS'S MOVES, PART 5: HIS PHASE 3 (art/eye_phase3.ts, painted by art/eye_colossus.ts; a mock-up behind EYE2, off). The
// owner, 8 Nov 2026 (by 14:57): “Yes, on to phase 3 (Recommended)”; his phase 3, in his words to the main chat (8 Nov): “Kill the
// tentacles, and he slides forward to use the eye and you can hit him.  Let’s scratch the tentacles for the third phase, and have
// strictly eye attacks and spells for the final phase?  Does that sound like a good idea?”. His rules: Movement 9, “Action, like a
// movie”, nothing through anything, nowhere safe, “Everything drawn should not just look like shapes.  That’s the rule”, nothing ruled.
// What this holds:
//   1. the switch is off and nothing of the game imports his phase 3;
//   2. THE BEATS: the slide 4.0 s in three lunges, gripping the edge; the eye slam's wind-up held with its warning, its strike two
//      smeared frames, the hit on frame 28, lying to 2.2 s, back up by 2.8 s; his eye struck, a flinch; the gaze's beats; each out of his
//      stand there and back into it;
//   3. NOTHING THROUGH ANYTHING: his tongue, eye, spittle and jaws clear of each other; him clear of the stone in every frame (sliding,
//      gripping it, his eye slammed down on it); the Warrior never under a bolt as it strikes, nor in the slam as it hits; the obelisk
//      toppling away from him; the siege's lines clear of his eye, and on the screen of the Warrior striking at it; the bolts falling
//      clear of him;
//   4. NEVER STILL: him in every frame of every take;
//   5. NO LEAPS: him and the Warrior frame to frame, but in the strikes;
//   6. THE CUES: the pillars dark, kindling as the slide ends, put out by a piece set into the foot, broken on the twelfth blow; his ward
//      while any burns, broken with the last; the bolts every 2.6 s, three, each warned 1.1 s, the first at the Warrior; the slam at the
//      Warrior, within reach; the gaze's arc from his new place; the blows where they land; the shakes;
//   7. NOTHING CYAN but the ward-stone's: him as he slams, is struck and stands; the colours of the game's effects;
//   8. NOTHING RULED: the warnings, the slime, the siege's lines, his ward's edge;
//   9. the numbers, in the game's tiles;
//  10. MOVE BY MOVE FOR THE BAKE (the main chat's asks, 8 Nov): the frame functions give the film's own layers; the gaze aimed every 15
//      degrees, clear of him.
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
import { COLOSSUS, EYE2, bodyClearances, paintColossus, turnedAt, turnedClear } from '../src/art/eye_colossus';
import type { ColossusAnim, ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { STONE_BOX } from '../src/art/eye_arms';
import { EYE_FPS } from '../src/art/eye_moves';
import type { EyeFrame } from '../src/art/eye_moves';
import { GAZE, GAZE_FIRE, GAZE_OUT, TILE, beamOn, warnEdge } from '../src/art/eye_body';
import { BLOW_AT, BOLT_SLANT, P3, P3_SHAKE, P3_SHOTS, P3_TAKES, PILLARS, PILLAR_BLOWS, PILLAR_TOP, Q2_PIECE, Q3_BREAK, Q3_CUT, Q4_PIECE, RAIN, SHIELD, SLAM, SLAM_AT, SLAM_EYE_Z, SLIDE, STRUCK, blowsOf, boltsOf, gazeArc3, heroP3, p3Frame, p3Numbers, p3StandTongue, siegeWobble, slideAt, slimeEdge, toWorld, wardEdge, phase3Frame, P3_MOVES } from '../src/art/eye_phase3';
import type { P3Move, P3Shot } from '../src/art/eye_phase3';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
const SEEN = 2 / Math.sqrt(3);
const R3 = Math.sqrt(3);
const tiles = (v: number): string => (v / TILE).toFixed(2);
const HERO_R = 0.3 * TILE;

/** All of him in a frame, as one pose (his own space): his jaws' frame, his tongue's, his drool's tearing. */
function whole(F: EyeFrame): ColossusPose {
  const an = F.jaws.pose.anim as ColossusAnim;
  const T = F.tongue?.pose.anim;
  const Sp = F.spit?.pose.anim;
  return { ...F.jaws.pose, drop: 0, back: 0, anim: { ...an, tore: Sp?.tore, knit: Sp?.knit, tongue: T ? T.tongue : null, eye: T ? T.eye : an.eye, gaze: T ? T.gaze : an.gaze, lids: T ? T.lids : an.lids, roll: T?.roll ?? 0, swell: T?.swell ?? 1, parts: undefined }, arms: [] };
}
/** His eye in the world in a frame. */
const eyeOf = (F: EyeFrame): [number, number, number] => {
  const e = F.tongue?.pose.anim?.eye as readonly number[];
  return [e[0], e[1] - (F.tongue as NonNullable<EyeFrame['tongue']>).back, e[2] - (F.tongue as NonNullable<EyeFrame['tongue']>).drop];
};

test('1. the switch is off; nothing of the game imports his phase 3', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_phase3.ts' || f === 'art/eye_death.ts') continue;
    if (/from ['"][^'"]*eye_phase3['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_phase3.ts');
});

test('2. the beats: the slide, the slam, his eye struck, the gaze; out of his stand there and back into it', () => {
  // THE SLIDE: 4.0 s (the main chat's CHANGE3), three lunges, his front gripping the edge
  assert.equal(SLIDE.frames / EYE_FPS, 4, 'the slide 4.0 s');
  assert.ok(Math.abs(slideAt(SLIDE.frames - 1).fwd - P3.fwd) < 1e-6 && Math.abs(slideAt(SLIDE.frames - 1).rise - P3.rise) < 1e-6, 'come to his place by its end');
  let lunges = 0;
  for (let f = 1; f < SLIDE.frames; f++) if (slideAt(f).heave > 0.99 && slideAt(f - 1).heave <= 0.99) lunges++;
  assert.equal(lunges, 3, 'three lunges');
  // THE SLAM: the main chat's EYE_SLAM (warned 28 frames, the hit on 28, lying to 2.2 s, back up by 2.8 s)
  assert.equal(SLAM.hit, 28, 'the hit on frame 28 (0.93 s)');
  assert.ok(SLAM.wind / EYE_FPS >= 0.9 - 1e-9, `the wind-up held ${(SLAM.wind / EYE_FPS).toFixed(2)} s`);
  assert.equal(SLAM.up / EYE_FPS, 2.2, 'lying to 2.2 s');
  assert.equal(SLAM.frames / EYE_FPS, 2.8, 'back up by 2.8 s');
  const at5 = P3_TAKES.q5.at;
  for (let f = 0; f < SLAM.frames; f++) {
    const F = p3Frame('q5', at5 + f);
    assert.equal(F.smear.some((x) => x), f >= SLAM.wind && f <= SLAM.hit, `slam ${f}: smeared only in the strike`);
    if (f < SLAM.hit) assert.ok(F.p3?.slam && (F.p3.slam.s < 0), `slam ${f}: the warning through the wind-up`);
  }
  // (out of his stand there and back into it: his tongue as his stand has it at the frames each move begins and ends)
  for (const [shot, a, b] of [['q5', P3_TAKES.q5.at - 1, P3_TAKES.q5.at + SLAM.frames], ['q7', P3_TAKES.q7.at - 1, P3_TAKES.q7.at + GAZE.frames], ['q8', P3_TAKES.q8.at - 1, P3_TAKES.q8.at + STRUCK.frames]] as Array<[P3Shot, number, number]>) {
    for (const k of [a, b]) {
      const F = p3Frame(shot, k);
      const c = (((P3_TAKES[shot].clock + k) % 90) + 90) % 90;
      const S = p3StandTongue(c);
      assert.equal(F.tongue?.key, S.key, `${shot} ${k}: his stand's tongue (${F.tongue?.key})`);
    }
    // (and the frame before his stand again, as his stand is: within 3 of his lengths all along his tongue)
    const F = p3Frame(shot, b - 1);
    const c = (((P3_TAKES[shot].clock + b - 1) % 90) + 90) % 90;
    const S = p3StandTongue(c).pose.anim?.tongue as number[][];
    const T = F.tongue?.pose.anim?.tongue as number[][];
    const d = Math.max(...T.map((q, i) => Math.hypot(q[0] - S[i][0], q[1] - S[i][1], q[2] - S[i][2])));
    assert.ok(d < 3.5, `${shot}: back into his stand smoothly (${d.toFixed(1)})`);
  }
  // HIS EYE STRUCK: its flinch from the blow, back in its weave by its end
  assert.equal(blowsOf('q8')[0].k, P3_TAKES.q8.at, 'struck on the blow');
});

test('3. nothing through anything: his tongue, eye, spittle, jaws; him clear of the stone; the Warrior clear of what strikes', () => {
  const worst = { tongue: Infinity, eye: Infinity, spit: Infinity, jaws: Infinity, stone: Infinity };
  for (const shot of P3_SHOTS) {
    const T = P3_TAKES[shot];
    for (let k = 0; k < T.frames; k++) {
      const F = p3Frame(shot, k);
      // (every frame of his moves; every third of his stand)
      const moving = (shot === 'q1' && k >= T.at) || ((shot === 'q5' || shot === 'q6') && k >= T.at && k < T.at + SLAM.frames) || (shot === 'q7' && k >= T.at && k < T.at + GAZE.frames) || (shot === 'q8' && k >= T.at && k < T.at + STRUCK.frames);
      if (!moving && k % 3) continue;
      if (shot === 'q6' && !(F.tongue?.key ?? '').startsWith('T.e2') && moving) continue;
      const P = whole(F);
      const c = bodyClearances(P, 0);
      assert.ok(c.tongue > 0 && c.eye > 0, `${shot} ${k}: his tongue and eye clear of his jaws (${c.tongue.toFixed(1)}, ${c.eye.toFixed(1)}; ${c.where})`);
      assert.ok(c.spit > 0, `${shot} ${k}: his spittle clear of his tongue (${c.spit.toFixed(1)}; ${c.where})`);
      assert.ok(c.jaws > 0, `${shot} ${k}: his jaws clear of each other`);
      const st = turnedClear({ ...P, drop: F.jaws.drop }, [0, -F.jaws.back], STONE_BOX).stone;
      assert.ok(st > 0, `${shot} ${k}: him clear of the stone (${st.toFixed(1)})`);
      worst.tongue = Math.min(worst.tongue, c.tongue);
      worst.eye = Math.min(worst.eye, c.eye);
      worst.spit = Math.min(worst.spit, c.spit);
      worst.jaws = Math.min(worst.jaws, c.jaws);
      worst.stone = Math.min(worst.stone, st);
    }
  }
  // (the Warrior: never under a bolt as it strikes; clear of the slam as it hits; clear of the beam)
  let bolt = Infinity;
  for (const shot of P3_SHOTS) for (const B of boltsOf(shot)) {
    const k = B.warn + RAIN.warn;
    if (k >= P3_TAKES[shot].frames) continue;
    const h = heroP3(shot, k);
    bolt = Math.min(bolt, Math.hypot(h.x - B.x, h.y - B.y) - RAIN.r - HERO_R);
  }
  assert.ok(bolt > 0, `the Warrior never under a bolt as it strikes (${tiles(bolt)} tiles clear at the least)`);
  for (const shot of ['q5', 'q6'] as const) {
    const h = heroP3(shot, P3_TAKES[shot].at + SLAM.hit);
    const d = Math.hypot(h.x - SLAM_AT[0], h.y - SLAM_AT[1]) - SLAM.r - HERO_R;
    assert.ok(d > 0 && d < TILE, `${shot}: just clear of the slam as it hits (${tiles(d)} tiles)`);
  }
  let beam = Infinity;
  for (let f = GAZE_FIRE; f < GAZE_OUT; f++) {
    const h = heroP3('q7', P3_TAKES.q7.at + f);
    beam = Math.min(beam, -beamOn([h.x, h.y], f, gazeArc3()));
  }
  assert.ok(beam > 0 && beam < TILE, `the gaze from his new place: the Warrior just clear (${tiles(beam)} tiles)`);
  // (the siege's lines, from each obelisk's fire into him (sagging as drawn): clear of his eye as it weaves, more than its half-width; and
  // on the screen clear of the Warrior's figure as he strikes at the eye, shielded, so that none is seen running into him)
  const lineAt = (P: (typeof PILLARS)[number], u: number): [number, number, number] => {
    const b = toWorld(P.to);
    return [P.x + (b[0] - P.x) * u, P.y + (b[1] - P.y) * u, PILLAR_TOP + 3 + (b[2] - PILLAR_TOP - 3) * u - 18 * Math.sin(Math.PI * u)];
  };
  let lineEye = Infinity;
  let lineHero = Infinity;
  for (let c = 0; c < 90; c++) {
    const e = toWorld(p3StandTongue(c).pose.anim?.eye as readonly number[]);
    for (const P of PILLARS) for (let u = 0; u <= 1; u += 0.005) {
      const q = lineAt(P, u);
      lineEye = Math.min(lineEye, Math.hypot(q[0] - e[0], q[1] - e[1], q[2] - e[2]) - COLOSSUS.eyeW);
    }
  }
  for (let k = 0; k <= 2 + BLOW_AT + 8; k++) {
    const h = heroP3('q2', k);
    const hi = h.x * SEEN;
    const hj = h.y / R3;
    for (const P of PILLARS) for (let u = 0; u <= 1; u += 0.005) {
      const q = lineAt(P, u);
      const qi = q[0] * SEEN;
      const qj = q[1] / R3 - q[2];
      // (his figure: 12 across each way, from his feet to 46 up)
      const dj = qj > hj ? qj - hj : qj < hj - 46 ? hj - 46 - qj : 0;
      lineHero = Math.min(lineHero, Math.hypot(Math.max(0, Math.abs(qi - hi) - 12), dj));
    }
  }
  assert.ok(lineEye > 10, `the siege's lines clear of his eye (${lineEye.toFixed(1)} of his lengths at the nearest)`);
  assert.ok(lineHero > 20, `the siege's lines clear of the Warrior on the screen as he strikes (${lineHero.toFixed(1)} picture pixels)`);
  // (the bolts falling out of the sky, each the whole way down, clear of him as he is while it falls: its head 6 of his lengths round)
  let fall = Infinity;
  for (const shot of P3_SHOTS) for (const B of boltsOf(shot)) {
    const k = Math.min(P3_TAKES[shot].frames - 1, B.warn + RAIN.warn - 5);
    const F = p3Frame(shot, k);
    const pts: number[][] = [];
    for (let z = 0; z <= 760; z += 6) pts.push([B.x + BOLT_SLANT[0] * z, B.y + BOLT_SLANT[1] * z, z]);
    fall = Math.min(fall, ...turnedAt({ ...whole(F), drop: F.jaws.drop }, [0, -F.jaws.back], pts).map((v) => v - 6));
  }
  assert.ok(fall > 0, `the bolts fall clear of him (${fall.toFixed(1)} of his lengths at the nearest)`);
  process.stdout.write(`  the least gaps: his tongue ${worst.tongue.toFixed(1)}, his eye ${worst.eye.toFixed(1)}, his spittle ${worst.spit.toFixed(1)}, his jaws ${worst.jaws.toFixed(1)}, the stone ${worst.stone.toFixed(1)}; the Warrior from the bolts ${tiles(bolt)} tiles, from the gaze ${tiles(beam)}; the siege's lines from his eye ${lineEye.toFixed(1)}, from the Warrior ${lineHero.toFixed(1)} picture pixels; the bolts falling from him ${fall.toFixed(1)}\n`);
});

test('4. never still: him in every frame of every take', () => {
  for (const shot of P3_SHOTS) {
    const his = (G: EyeFrame): string => JSON.stringify([G.jaws, G.spit, G.tongue].map((x) => x && [x.key, Math.round(x.drop * 10), Math.round(x.back * 10)]));
    let prev = p3Frame(shot, 0);
    for (let k = 1; k < P3_TAKES[shot].frames; k++) {
      const F = p3Frame(shot, k);
      assert.ok(his(F) !== his(prev), `${shot} ${k}: he moves`);
      prev = F;
    }
  }
});

test('5. no leaps: him and the Warrior, frame to frame, but in the strikes', () => {
  let place = 0;
  let eye = 0;
  let rear = 0;
  let hero = 0;
  for (const shot of P3_SHOTS) {
    const T = P3_TAKES[shot];
    for (let k = 1; k < T.frames; k++) {
      const a = p3Frame(shot, k - 1);
      const b = p3Frame(shot, k);
      place = Math.max(place, Math.hypot(b.jaws.back - a.jaws.back, b.jaws.drop - a.jaws.drop));
      const f = k - T.at;
      const strike = ((shot === 'q5' || shot === 'q6') && f >= SLAM.wind && f <= SLAM.hit + 1) || (shot === 'q7' && f >= GAZE.wind && f <= GAZE.wind + 2) || (shot === 'q8' && f >= 0 && f <= 3) || (shot === 'q6' && blowsOf('q6').some((B) => k >= B.k && k <= B.k + 8));
      const ea = eyeOf(a);
      const eb = eyeOf(b);
      // (his eye jolted and shuddering where it is struck as it lies, a strike on him; the slam's rearing back up over his maw and the gaze's up to aim, the first half second of each wind-up: a whip back, smooth, at
      // most 28 a frame)
      const rearing = ((shot === 'q5' || shot === 'q6') && f >= 0 && f <= SLAM.rear) || (shot === 'q7' && f >= 0 && f <= 16);
      const de = Math.hypot(eb[0] - ea[0], eb[1] - ea[1], eb[2] - ea[2]);
      if (rearing) {
        assert.ok(de < 28, `${shot} ${k}: his eye rearing back smoothly (${de.toFixed(1)})`);
        rear = Math.max(rear, de);
      } else if (!strike) eye = Math.max(eye, de);
      const p = heroP3(shot, k - 1);
      const q = heroP3(shot, k);
      const lim = p.act === 'roll' || q.act === 'roll' ? 10.5 : 8.5;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      assert.ok(d <= lim, `${shot} ${k}: the Warrior no faster than a run (${d.toFixed(1)})`);
      if (p.act !== 'roll') hero = Math.max(hero, d);
    }
  }
  assert.ok(place < 6, `him coming on no more than 6 of his lengths a frame (${place.toFixed(1)})`);
  assert.ok(eye < 14, `his eye no more than 14 a frame but in the strikes (${eye.toFixed(1)})`);
  process.stdout.write(`  him at the most ${place.toFixed(1)} of his lengths a frame as he slides; his eye ${eye.toFixed(1)} but in the strikes (${rear.toFixed(1)} rearing for the slam); the Warrior ${hero.toFixed(1)}\n`);
});

test('6. the cues: the pillars, his ward, the bolts, the slam, the gaze, the blows, the shakes', () => {
  // THE PILLARS: dark until the slide is done, kindling then; the left out as its piece is set, the right broken on the twelfth blow,
  // the near out as its piece is set
  const q1 = P3_TAKES.q1;
  assert.ok(p3Frame('q1', q1.at + SLIDE.frames - 1).p3?.pillars.every((P) => P.state === 'dark'), 'dark through the slide');
  assert.ok(p3Frame('q1', q1.frames - 1).p3?.pillars.every((P) => P.state === 'lit' && (P.lit ?? 0) > 0.99), 'blazing once he grips the edge');
  assert.ok(p3Frame('q2', Q2_PIECE.set - 1).p3?.pillars[0].state === 'lit' && p3Frame('q2', Q2_PIECE.set).p3?.pillars[0].state === 'out', 'the left put out as its piece is set');
  const pc = p3Frame('q2', Q2_PIECE.set).p3?.piece;
  assert.ok(pc && Math.hypot(pc.x - PILLARS[0].x, pc.y - PILLARS[0].y) < 12 && pc.set === 0, 'the piece set into its foot');
  assert.equal(p3Frame('q3', Q3_BREAK - 1).p3?.pillars[1].hits, PILLAR_BLOWS - 1, 'eleven blows, standing');
  assert.ok(p3Frame('q3', Q3_BREAK).p3?.pillars[1].state === 'broken' && p3Frame('q3', Q3_BREAK).p3?.pillars[1].hits === PILLAR_BLOWS, 'broken on the twelfth');
  assert.equal(p3Frame('q3', Q3_CUT - 1).p3?.pillars[1].hits, 2, 'two blows before the cut');
  assert.ok((p3Frame('q3', Q3_BREAK).p3?.pillars[1].fall?.[0] ?? 0) > 0, 'falling outward, away from the stone');
  assert.ok(p3Frame('q4', Q4_PIECE.set).p3?.pillars[2].state === 'out', 'the near put out as its piece is set');
  // HIS WARD: on while any burns, broken with the last
  assert.equal(p3Frame('q2', 10).p3?.shield.k, 1, 'shielded while they burn');
  assert.ok((p3Frame('q4', Q4_PIECE.set + 4 + SHIELD.off).p3?.shield.k ?? 1) < 0.01, 'his ward broken with the last');
  for (const shot of ['q5', 'q6', 'q7', 'q8'] as const) assert.equal(p3Frame(shot, 10).p3?.shield.k, 0, `${shot}: unshielded`);
  const glance = p3Frame('q2', 2 + BLOW_AT).p3?.shield.flash;
  assert.ok(glance && glance.s === 0, 'a blow at his eye glancing off his ward');
  // THE BOLTS: every 2.6 s, three, each warned 1.1 s; the first where the Warrior stands, the others round him; none once the siege is broken
  assert.equal(RAIN.every, 78, 'every 2.6 s');
  assert.equal(RAIN.warn, 33, 'warned 1.1 s');
  for (const shot of ['q2', 'q3', 'q4'] as const) {
    const B = boltsOf(shot);
    assert.ok(B.length >= 3 && B.length % 3 === 0, `${shot}: in threes`);
    for (let v = 0; v < B.length; v += 3) {
      const h = heroP3(shot, B[v].warn);
      assert.ok(Math.hypot(h.x - B[v].x, h.y - B[v].y) < 1, `${shot}: the first where the Warrior stands`);
      for (const n of [1, 2]) {
        const d = Math.hypot(B[v + n].x - B[v].x, B[v + n].y - B[v].y);
        assert.ok(d >= RAIN.near * 0.75 && d <= RAIN.far + 1, `${shot}: the others round him (${tiles(d)} tiles)`);
      }
      if (v) assert.equal(B[v].warn - B[v - 3].warn, RAIN.every, `${shot}: 2.6 s apart`);
    }
  }
  assert.ok(boltsOf('q4').every((B) => B.warn <= Q4_PIECE.set) && boltsOf('q5').length === 0, 'none once the last pillar is out');
  // THE SLAM: at where the Warrior stood as it began, within its reach of where his eye weaves; down on the stone
  const home = toWorld(p3StandTongue(0).pose.anim?.eye as readonly number[]);
  assert.ok(Math.hypot(SLAM_AT[0] - home[0], SLAM_AT[1] - home[1]) <= SLAM.reach, 'within its reach');
  const h0 = heroP3('q5', 0);
  assert.ok(Math.hypot(h0.x - SLAM_AT[0], h0.y - SLAM_AT[1]) < 1, 'at the Warrior');
  const down = eyeOf(p3Frame('q5', P3_TAKES.q5.at + SLAM.hit));
  assert.ok(Math.hypot(down[0] - SLAM_AT[0], down[1] - SLAM_AT[1]) < 8 && Math.abs(down[2] - SLAM_EYE_Z) < 1, `slammed down on it (${down.map((v) => v.toFixed(0)).join(', ')})`);
  // (struck as it lies: the Warrior's blows land while it is down)
  for (const B of blowsOf('q6')) {
    const f = B.k - P3_TAKES.q6.at;
    assert.ok(f > SLAM.hit && f < SLAM.up, `struck as it lies (frame ${f} of it)`);
  }
  // THE GAZE: its arc from under his eye at his new place, toward the Warrior, 32 degrees each side
  const A = gazeArc3();
  const h7 = heroP3('q7', 0);
  assert.ok(Math.abs(Math.atan2(h7.x - A.ox, h7.y - A.oy) - A.toward) < 1e-6 && Math.abs(((A.a1 - A.a0) * 180) / Math.PI - 64) < 1e-6, 'toward the Warrior, 32 degrees each side');
  // THE SHAKES: as he grips the edge, as the eye slams down, as the pillar lands in the water
  const jolt = (shot: P3Shot, k: number): number => Math.max(...p3Frame(shot, k).shake.map(Math.abs));
  assert.ok(jolt('q1', q1.at + SLIDE.grip) >= P3_SHAKE.grip - 1, 'jolted as he grips the edge');
  assert.ok(jolt('q5', P3_TAKES.q5.at + SLAM.hit) >= P3_SHAKE.slam - 1, 'jolted as it slams down');
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

test('7. nothing cyan but the ward-stone\'s: him as he slams, lies struck, is struck, stands', () => {
  for (const [shot, k] of [['q5', P3_TAKES.q5.at + 20], ['q6', blowsOf('q6')[0].k + 2], ['q8', P3_TAKES.q8.at + 3], ['q2', 40]] as Array<[P3Shot, number]>) {
    const F = p3Frame(shot, k);
    for (const L of [F.spit, F.tongue]) if (L) assert.equal(cyanIn(paintColossus(L.pose, small)), 0, `${shot} ${k}: ${L.key}: nothing cyan`);
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

test('8. nothing ruled: the warnings, the slime, the siege\'s lines, his ward\'s edge', () => {
  const worst: Record<string, { across: number; up: number }> = {};
  const note = (name: string, r: { across: number; up: number }): void => {
    const w0 = worst[name] ?? { across: 0, up: 0 };
    worst[name] = { across: Math.max(w0.across, r.across), up: Math.max(w0.up, r.up) };
    assert.ok(r.across <= RULED && r.up <= RULED, `${name}: no ruled edge (${r.up / 2} game px up, ${r.across / 2} across)`);
  };
  // (a round on the ground as the screen sees it)
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
  for (let f = 0; f < 33; f += 3) note('a bolt\'s warning', ground(RAIN.r, (a) => warnEdge(a, f)));
  for (let f = 0; f < SLAM.hit; f += 3) note('the slam\'s warning', ground(SLAM.r, (a) => warnEdge(a, f)));
  note('the slime', ground(46, slimeEdge));
  // (a line of the siege's magic as a band down the screen: its wavering alone keeps it from running straight)
  for (let s = 0; s < 3; s += 0.2) for (const seed of [1, 4, 7]) {
    const len = 400;
    const w = 80;
    const M = new Uint8Array(w * len);
    for (let j = 6; j < len - 6; j++) {
      const c = 40 + siegeWobble(j / len, s, seed);
      for (let i = Math.round(c - 3); i <= Math.round(c + 3); i++) M[j * w + i] = 1;
    }
    // (its two ends, cut flat here: not counted)
    const r = runsOf(M, w, len);
    note('the siege\'s lines', { across: 0, up: r.up });
  }
  // (his ward's edge round a round of him, as wide as he is)
  for (let s = 0; s < 3; s += 0.5) {
    const R0 = 120;
    const w = 300;
    const M = new Uint8Array(w * w);
    for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) {
      const d = Math.hypot(i - 150, (j - 150) * 1.6) - R0;
      if (d < wardEdge(i, j, s)) M[j * w + i] = 1;
    }
    note('his ward\'s edge', runsOf(M, w, w));
  }
  process.stdout.write(`  the longest straight runs (game px, up, across): ${Object.entries(worst).map(([k, v]) => `${k} ${v.up / 2}, ${v.across / 2}`).join('; ')}\n`);
});

test('9. the numbers, in the game\'s tiles', () => {
  const N = p3Numbers();
  assert.ok(N.middleOff > 2.8 && N.up > 1, 'his place: stopped by the stone short of the main chat\'s 2.8, hauled up');
  assert.ok(N.eyeOver[0] > 0, 'his eye over the stone');
  process.stdout.write(`  his place: his middle ${N.middleOff.toFixed(2)} tiles off the stone's back edge, ${N.up.toFixed(2)} up out of the water; his eye weaving ${N.eyeOver[0].toFixed(2)} to ${N.eyeOver[1].toFixed(2)} tiles over the stone, ${N.eyeUp[0].toFixed(2)} to ${N.eyeUp[1].toFixed(2)} up; his tongue ${N.tongue.toFixed(1)} tiles long\n`);
  process.stdout.write(`  the slam: ${N.slam.r} tiles round, reaching ${N.slam.reach} from where his eye weaves (here ${N.slam.at.toFixed(2)}); the pillars at ${N.pillars.map((p) => `(${p[0].toFixed(2)}, ${p[1].toFixed(2)})`).join(', ')}\n`);
});

// (the main chat's asks, 8 Nov: his phase 3 as frame functions for its bake, as `eyeFrame` and `shovelFrame`; the gaze taking its aim)
test('10. move by move for the bake: the film\'s own layers; the gaze aimed anywhere, clear of him', () => {
  const J = (x: unknown): string => JSON.stringify(x);
  const same = (m: P3Move, f: number, shot: P3Shot, k: number): void => {
    const a = phase3Frame(m, f);
    const b = p3Frame(shot, k);
    assert.equal(J([a.jaws, a.spit, a.tongue, a.smear]), J([b.jaws, b.spit, b.tongue, b.smear.filter((x) => x)]), `${m} ${f}: the film's ${shot} ${k}`);
  };
  for (let f = 0; f < P3_MOVES.slide; f += 3) same('slide', f, 'q1', P3_TAKES.q1.at + f);
  for (let f = 0; f < P3_MOVES.slam; f++) same('slam', f, 'q5', P3_TAKES.q5.at + f);
  for (let f = 0; f < P3_MOVES.struck; f++) same('struck', f, 'q8', P3_TAKES.q8.at + f);
  for (let f = 0; f < P3_MOVES.gaze; f++) same('gaze', f, 'q7', P3_TAKES.q7.at + f);
  for (let k = 0; k < 90; k += 7) same('edge', (P3_TAKES.q2.clock + k) % 90, 'q2', k);
  // (the slam elsewhere: its layers named for where it comes down)
  assert.ok(phase3Frame('slam', 40, { at: [-60, 420] }).tongue.key.includes('-60_420.'), 'the slam elsewhere named for where');
  // (the gaze aimed every 15 degrees where it is clear of him)
  let least = Infinity;
  for (let deg = -75; deg <= 75; deg += 15) {
    const aim = (deg * Math.PI) / 180;
    for (let f = 0; f < P3_MOVES.gaze; f += 4) {
      const P = phase3Frame('gaze', f, { aim });
      assert.ok(P.tongue.key.includes(`a${deg}.`), `${deg}: named for its aim`);
      const an = P.jaws.pose.anim as ColossusAnim;
      const T = P.tongue.pose.anim as ColossusAnim;
      const c = bodyClearances({ ...P.jaws.pose, drop: 0, back: 0, anim: { ...an, tore: P.spit?.pose.anim?.tore, knit: P.spit?.pose.anim?.knit, tongue: T.tongue, eye: T.eye, gaze: T.gaze, lids: T.lids, swell: T.swell, parts: undefined }, arms: [] }, 0);
      least = Math.min(least, c.tongue, c.eye, c.spit);
      assert.ok(c.tongue > 0 && c.eye > 0 && c.spit > 0, `${deg} ${f}: aimed, clear of his jaws and drool (${c.where})`);
    }
  }
  process.stdout.write(`  the film's own layers from the frame functions; the gaze aimed every 15 degrees from -75 to 75: clear of him by ${least.toFixed(1)} at the least\n`);
});
