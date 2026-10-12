// THE CULT'S TWO NEW FIGHTERS (src/art/cultists.ts): THE DAGGER CULTIST AND THE MINI FLESHMANCER, A MOCK-UP.
// Nothing of the game makes them. His words, 11 Oct, 14:57: “When you’re finished with that I’d like 2 more
// cultist enemies.  A melee cultist the runs at you with a sacrificial dagger, and a mini fleshmancer elite
// that uses cultist corpses to raise skeletons (can just use the same animation as the warden) and does a
// smaller version of the fire laser from the boss.  They start showing up in floor 4, then all over floor
// 5.” So, first their looks:
//   1. their switch goes with the rules' (in the game since the main chat's first-five-floors work), and only the bestiary and the bosses' own effects draw them;
//   2. their stands paint in every frame both ways round: nothing cyan (and no light that is not the
//      enemy's), the enemy's pink edge round each, every pixel whole or empty but the edge, no lone pixel;
//   3. SIZES: the dagger cultist a little shorter than the knight (58); the mini fleshmancer the knight's
//      height, his master (66) a head over him;
//   4. the mini fleshmancer floats, as his master does: a gap of floor under his tails in every frame;
//   5. his master is painted as he always was (the master's look is the default, and only `withFmLook` paints
//      another).
// Then their moves (his yes to their looks, by 17:43: “Yes, animate them (Recommended)”):
//   6. each is made as the game takes a monster: both facings, its lists and clips, its blow on a frame;
//   7. every frame of every move made so far paints both ways round as test 2 asks, and the dying wear no edge;
//   8. THE DAGGER CULTIST'S RUN: each foot down three frames of the eight, gripping the floor while it is
//      down; both feet off the floor between strides; it goes round;
//   9. HIS LEAP AND PLUNGE: the dagger held high over his cowl as he warns, the light on it brightest just
//      before he leaps and gone as it lands; both feet off the floor in the leap; the point down at the floor
//      ahead of him as it lands; back where he stood at the end;
//  10. HIS DEATH leaves him lying on the floor, his eyes out;
//  11. THE MINI FLESHMANCER'S FIRE: his claws thrust out before him as it bursts out; it sweeps once across
//      from his right to his left, never turning back; smaller than his master's; it pours from between his
//      claws, in front of him;
//  12. HIS CALL: his claws low as he bows, high over his hood as the dead come up (the blow of the clip);
//  13. he floats through all of it (his glide, setting off and stopping, and struck too).
// Then their other moves (his yes to their attacks, by 18:39: “Yes, on to their other moves (Recommended)”):
//  14. THE MINI FLESHMANCER'S GLIDE goes round; setting off starts from his rest and ends on its first frame,
//      stopping the other way;
//  15. HIS DEATH: his own fire takes him: he burns down into the floor, nothing of him left above it, and
//      what is left lies low on the floor (his robe in a heap, his mask on it), with no light in it.
//   run: tsx --test tests/cultists.test.ts

// @ts-ignore
import '../src/art/bestiary';
import { CULT } from '../src/game/defs';
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { CULTISTS_SWITCH, DAGGER_CULTIST, KNIFE_BLOW, KNIFE_REST, MINI_DIES, MINI_FIRE, MINI_FIRE_SIZE, MINI_FM, MINI_FM_LOOK, MINI_GLIDE_LONG, MINI_HALT, MINI_RAISE, MINI_REEL, MINI_REST, MINI_SET_OFF, knifeCowlTop, knifeTipOf, makeDaggerCultistArt3, makeMiniFleshmancerArt3, miniFireAt, miniFireTurn } from '../src/art/cultists';
import { FM_FIRE_SIZE } from '../src/art/fm_spells';
import { DEATH_FPS } from '../src/art/mkit';
import { TILE3, posedOfMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import type { AnimSet } from '../src/art/actor_types';
import { FLESHMANCER, FM_LOOK, FM_REST, fmHemOf, fmHoodTop, fmTails, withFmLook } from '../src/art/fleshmancer';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { skeletonAt } from '../src/art/new_mobs3';
import { solve } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
/** Of one frame: how many pixels it paints, how many of them are the enemy's edge, whether any (or any of its lights) is cyan or not the enemy's, and how many pixels are neither whole nor empty but the edge. */
function looked(sp: Sprite): { n: number; rim: number; cyan: boolean; odd: number } {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const d = paintingOf(sp).d;
  let n = 0;
  let rim = 0;
  let odd = 0;
  let cyan = false;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    n++;
    if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) cyan = true;
    if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
  }
  // (every light he gives off, and his pool of light, the enemy's: hot pink to gold, never cyan)
  for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) {
    const [r, g, b] = rgba(l.color);
    if (cyanGlow(r, g, b) || FRIEND.has(`${r},${g},${b}`) || r < 150 || r < g || r < b) cyan = true;
  }
  return { n, rim, cyan, odd };
}

/** Of a list of frames: what is wrong with each (as test 2 asks). */
function faults(name: string, frames: ReadonlyArray<Sprite>): string[] {
  const out: string[] = [];
  frames.forEach((sp, i) => {
    const f = looked(sp);
    if (!(f.n > 500 && !f.cyan && f.rim > 40 && f.odd === 0)) out.push(`${name} ${i}: ${f.n} pixels, ${f.rim} edge, ${f.odd} odd${f.cyan ? ', cyan' : ''}`);
    const { w, h, d } = paintingOf(sp);
    const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!solid(x, y)) continue;
        let m = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && solid(x + dx, y + dy)) m++;
        if (m === 0) out.push(`${name} ${i}: a lone pixel at ${x},${y}`);
      }
    }
  });
  return out;
}

// (THE FIRST FIVE FLOORS, the main chat, 11 Oct 2026: the cult's two are in the game, on the branch first5, on
// his yes by 19:01, "Yes, send them to main (Recommended)". Until then this test held that the switch was off
// and that nothing of the game imported them.)
test('1. their switch goes with the rules\' (game/defs.ts CULT), and only the bestiary and the bosses\' own effects draw them', () => {
  assert.equal(CULTISTS_SWITCH.on, CULT.on, 'the pictures are on just while the rules are (art/bestiary.ts, useFirstFive)');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/cultists.ts') continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    if (/from ['"][^'"]*cultists['"]/.test(text)) users.push(f);
  }
  assert.deepEqual(users.sort(), ['art/bestiary.ts', 'render/bossfx.ts'], 'the game files that draw them');
});

test('2. their stands paint in every frame both ways round: nothing cyan, the pink edge round each, every pixel whole or empty but the edge, no lone pixel', () => {
  const knife = makeDaggerCultistArt3();
  const mini = makeMiniFleshmancerArt3();
  const found: string[] = [];
  for (const view of ['front', 'back'] as const) {
    found.push(...faults(`the dagger cultist stands, ${view}`, knife[view].idle));
    found.push(...faults(`the mini fleshmancer stands, ${view}`, mini[view].idle));
  }
  assert.equal(found.length, 0, found.slice(0, 10).join('; '));
});

test('3. sizes: the dagger cultist a little shorter than the knight (58); the mini fleshmancer the knight’s height, his master a head over him', () => {
  const knife = knifeCowlTop(solve(DAGGER_CULTIST.build, KNIFE_REST));
  assert.ok(knife >= 50 && knife <= 57, `the dagger cultist’s cowl ${knife.toFixed(1)} up`);
  const mini = withFmLook(MINI_FM_LOOK, () => fmHoodTop(solve(MINI_FM.build, MINI_REST)));
  const master = fmHoodTop(solve(FLESHMANCER.build, FM_REST));
  assert.ok(mini >= 55 && mini <= 61, `the mini fleshmancer’s hood ${mini.toFixed(1)} up`);
  assert.ok(master - mini >= 6, `his master ${master.toFixed(1)} up, a head over him`);
});

test('4. the mini fleshmancer floats: a gap of floor under his tails in every frame of his stand', () => {
  for (let i = 0; i < MINI_FM.idleFrames; i++) {
    const s = skeletonAt(MINI_FM, 'stand', i / MINI_FM.idleFps);
    const low = withFmLook(MINI_FM_LOOK, () => Math.min(...fmTails(fmHemOf(s), 0, 0).flatMap((x) => x.pts.map((p) => p[2] - x.r))));
    assert.ok(low >= 2, `frame ${i}: his lowest tail ${low.toFixed(1)} off the floor`);
  }
});

test('5. his master is painted in his own look: the default, and back to it after another', () => {
  assert.ok(withFmLook(MINI_FM_LOOK, () => true));
  const s = solve(FLESHMANCER.build, FM_REST);
  assert.equal(fmHoodTop(s).toFixed(3), withFmLook(FM_LOOK, () => fmHoodTop(s)).toFixed(3));
  assert.ok(FM_LOOK.crown && FM_LOOK.gold && !MINI_FM_LOOK.crown && !MINI_FM_LOOK.gold);
});

// ---------------------------------------------------------------------------------------------
// THEIR MOVES

/** Their moves, by facing: what is alive in it, and what is dying. */
function madeOf(mob: Mob, set: AnimSet): { living: [string, Sprite[]][]; dying: Sprite[] } {
  const c = set.clips ?? {};
  const living: [string, Sprite[]][] = [['attack', c.attack?.frames ?? []]];
  if (mob === DAGGER_CULTIST) living.push(['run', set.walk], ['struck', c.reel?.frames ?? []]);
  else living.push(['raise', c.moves?.raise?.frames ?? []], ['glide', set.walk], ['setting off', c.moves?.setOff?.frames ?? []], ['stopping', c.moves?.halt?.frames ?? []], ['struck', c.reel?.frames ?? []]);
  return { living, dying: c.die?.frames ?? [] };
}

test('6. each is made as the game takes a monster: both facings, its lists and clips, its blow on a frame', () => {
  for (const [mob, art] of [[DAGGER_CULTIST, makeDaggerCultistArt3()], [MINI_FM, makeMiniFleshmancerArt3()]] as const) {
    for (const view of ['front', 'back'] as const) {
      const set = art[view];
      const c = set.clips ?? {};
      assert.equal(set.idle.length, mob.idleFrames, `${mob.id} ${view}: its standing loop`);
      assert.equal(set.walk.length, mob.walkFrames, `${mob.id} ${view}: its walk`);
      assert.ok(c.attack && c.attack.fps === 30 && c.attack.hit === mob.hit, `${mob.id} ${view}: its attack, with its blow`);
      const keys = mob.attack.motion.keys;
      assert.equal(c.attack?.frames.length, Math.round(keys[keys.length - 1].at * 30) + 1);
      assert.ok(Math.abs(mob.hit * 30 - Math.round(mob.hit * 30)) < 1e-9, `${mob.id}: the blow falls on a frame`);
      assert.ok(c.die && c.die.fps === DEATH_FPS && c.die.frames.length === Math.round(mob.dieTime * DEATH_FPS) + 1, `${mob.id} ${view}: its death`);
    }
  }
  const raise = makeMiniFleshmancerArt3().front.clips?.moves?.raise;
  assert.ok(raise && raise.hit === MINI_RAISE.rise && raise.frames.length === Math.round(MINI_RAISE.long * 30) + 1, 'his call, with the moment the dead come up');
  assert.ok(Math.abs(MINI_RAISE.rise * 30 - Math.round(MINI_RAISE.rise * 30)) < 1e-9, 'the dead come up on a frame');
});

test('7. every frame of every move made so far paints both ways round: nothing cyan, the pink edge round the living, every pixel whole or empty but the edge, no lone pixel; the dying wear no edge and give no light at the end', () => {
  const found: string[] = [];
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const [mob, art] of [[DAGGER_CULTIST, makeDaggerCultistArt3()], [MINI_FM, makeMiniFleshmancerArt3()]] as const) {
    for (const view of ['front', 'back'] as const) {
      const { living, dying } = madeOf(mob, art[view]);
      for (const [name, frames] of living) {
        assert.ok(frames.length > 0, `${mob.id} ${view}: no ${name}`);
        found.push(...faults(`${mob.id} ${name}, ${view}`, frames));
      }
      dying.forEach((sp, i) => {
        const d = paintingOf(sp).d;
        let rim = 0;
        for (let j = 0; j < d.length; j += 4) {
          if (d[j + 3] === 0) continue;
          if (FRIEND.has(`${d[j]},${d[j + 1]},${d[j + 2]}`) || cyanGlow(d[j], d[j + 1], d[j + 2])) found.push(`${mob.id} dying ${view} ${i}: cyan`);
          if (d[j + 3] === RIM_ALPHA && d[j] === pr && d[j + 1] === pg && d[j + 2] === pb) rim++;
        }
        if (rim) found.push(`${mob.id} dying ${view} ${i}: an edge (${rim})`);
      });
      if (dying.length) assert.ok(!dying[dying.length - 1].lights?.length, `${mob.id} ${view}: light in what is left`);
    }
  }
  assert.equal(found.length, 0, found.slice(0, 10).join('; '));
});

test('8. the dagger cultist’s run: each foot down three frames of the eight and gripping the floor while it is; both off between strides; it goes round', () => {
  const mob = DAGGER_CULTIST;
  const n = mob.walkFrames;
  const d = (mob.pace * TILE3) / mob.walkFps;
  const at = (i: number) => posedOfMob(mob, 'walk', i / mob.walkFps);
  const seen = { l: 0, r: 0 };
  let flying = 0;
  for (let i = 0; i < n; i++) {
    const a = at(i);
    const b = at(i + 1);
    for (const side of ['l', 'r'] as const) {
      const down = (q: typeof a): boolean => Math.abs(side === 'l' ? q.lfz : q.rfz) < 0.01;
      if (!down(a)) continue;
      seen[side]++;
      if (!down(b)) continue;
      // (on the floor, where it was a frame ago: he has come d further on over it)
      const slid = side === 'l' ? b.lfx + d - a.lfx : b.rfx + d - a.rfx;
      assert.ok(Math.abs(slid) < 0.05, `the ${side === 'l' ? 'left' : 'right'} foot slides ${slid.toFixed(2)} between frames ${i} and ${i + 1}`);
    }
    if (Math.abs(a.lfz) > 0.5 && Math.abs(a.rfz) > 0.5) flying++;
  }
  assert.ok(seen.l === 3 && seen.r === 3, `each foot down three frames (${seen.l}, ${seen.r})`);
  assert.ok(flying >= 2, `both feet off the floor between strides (${flying} frames)`);
  const first = at(0);
  const round = at(n);
  for (const k of ['pz', 'lfx', 'rfx', 'rhz', 'lhx'] as const) assert.ok(Math.abs(first[k] - round[k]) < 1e-6, `the run does not go round (${k})`);
});

test('9. his leap and plunge: the dagger held high as he warns, its light brightest before he leaps and gone as it lands; both feet off in the leap; its point down at the floor ahead of him as it lands; back where he stood at the end', () => {
  const mob = DAGGER_CULTIST;
  const { hit: H, rise: W, leap: LP, long: L } = KNIFE_BLOW;
  const sk = (t: number) => skeletonAt(mob, 'attack', t);
  const warn = sk((W + LP) / 2);
  assert.ok(warn.handR[2] > knifeCowlTop(warn) + 4 && warn.handL[2] > knifeCowlTop(warn) + 4, `the dagger held high over his cowl in both hands as he warns (${warn.handR[2].toFixed(1)}, ${warn.handL[2].toFixed(1)} against ${knifeCowlTop(warn).toFixed(1)})`);
  assert.ok(knifeTipOf(warn)[2] > knifeCowlTop(warn) - 12, `its point turned down over his head, not hanging below it (${knifeTipOf(warn)[2].toFixed(1)})`);
  const glint = mob.attack.glint!;
  assert.ok(glint(LP - 0.02) > 0.9 && glint(H) < 0.05 && glint(0) === 0, 'the light on the blade');
  const air = posedOfMob(mob, 'attack', (LP + H) / 2 + 0.01);
  assert.ok(air.lfz > 2 && air.rfz > 2, `both feet off the floor in the leap (${air.lfz.toFixed(1)}, ${air.rfz.toFixed(1)})`);
  const tip = knifeTipOf(sk(H));
  assert.ok(tip[2] < 6, `the point down at the floor as it lands (${tip[2].toFixed(1)} up)`);
  assert.ok(tip[0] > 0.6 * TILE3 && tip[0] < 1.1 * TILE3, `the point ahead of him (${(tip[0] / TILE3).toFixed(2)} tiles)`);
  const end = posedOfMob(mob, 'attack', L);
  const rest = posedOfMob(mob, 'stand', 0);
  for (const k of ['px', 'pz', 'lfx', 'rfx'] as const) assert.ok(Math.abs(end[k] - rest[k]) < 0.6, `back where he stood (${k}: ${end[k].toFixed(2)} against ${rest[k].toFixed(2)})`);
});

test('10. his death leaves him lying on the floor', () => {
  const s = skeletonAt(DAGGER_CULTIST, 'dying', DAGGER_CULTIST.dieTime);
  assert.ok(knifeCowlTop(s) < 18, `his cowl ${knifeCowlTop(s).toFixed(1)} up as he lies`);
});

test('11. the mini fleshmancer’s fire: his claws thrust out before him as it bursts; one sweep from his right to his left; smaller than his master’s; pouring from between his claws, before him', () => {
  const { burst: B, pour: P, stop: S } = MINI_FIRE;
  const s = skeletonAt(MINI_FM, 'attack', B);
  const mid = [(s.handL[0] + s.handR[0]) / 2, (s.handL[1] + s.handR[1]) / 2];
  assert.ok(mid[0] - s.ribs[0] > 8, `his claws out before him (${(mid[0] - s.ribs[0]).toFixed(1)})`);
  let was = -Infinity;
  for (let t = P; t <= S + 1e-9; t += 1 / 30) {
    const a = miniFireTurn(t);
    assert.ok(a >= was - 1e-9, `the sweep turns back at ${t.toFixed(2)} s`);
    was = a;
  }
  assert.ok(Math.abs(miniFireTurn(P) + 1.1) < 1e-6 && Math.abs(miniFireTurn(S) - 1.1) < 1e-6, 'from his right to his left');
  assert.ok(MINI_FIRE_SIZE.reach < FM_FIRE_SIZE.reach * 0.6 && MINI_FIRE_SIZE.thick < 1 && MINI_FIRE_SIZE.land < FM_FIRE_SIZE.land, 'smaller than his master’s');
  for (let t = B; t <= S; t += 0.1) {
    const [x, y] = miniFireAt(t);
    assert.ok(y < -14 && y > -50 && Math.abs(x) < 40, `the fire between his claws at ${t.toFixed(1)} s (${x}, ${y})`);
  }
});

test('12. his call: his claws low as he bows, high over his hood as the dead come up', () => {
  const low = skeletonAt(MINI_FM, 'raise', MINI_RAISE.low);
  assert.ok(low.handL[2] < low.pelvis[2] && low.handR[2] < low.pelvis[2], 'his claws low as he bows');
  const up = skeletonAt(MINI_FM, 'raise', MINI_RAISE.rise);
  const hood = withFmLook(MINI_FM_LOOK, () => fmHoodTop(up));
  assert.ok(up.handL[2] > hood && up.handR[2] > hood, `his claws over his hood (${up.handL[2].toFixed(1)}, ${up.handR[2].toFixed(1)} against ${hood.toFixed(1)})`);
});

test('13. the mini fleshmancer floats through his fire, his call, his glide, setting off and stopping, and struck: a gap of floor under his tails in every frame', () => {
  for (const [move, long] of [['attack', MINI_FIRE.long], ['raise', MINI_RAISE.long], ['walk', MINI_GLIDE_LONG], ['setOff', MINI_SET_OFF], ['halt', MINI_HALT], ['reel', MINI_REEL]] as const) {
    for (let i = 0; i <= Math.round(long * 30); i++) {
      const s = skeletonAt(MINI_FM, move, i / 30);
      const low = withFmLook(MINI_FM_LOOK, () => Math.min(...fmTails(fmHemOf(s), 0, 0).flatMap((x) => x.pts.map((p) => p[2] - x.r))));
      assert.ok(low >= 1, `${move} frame ${i}: his lowest tail ${low.toFixed(1)} off the floor`);
    }
  }
});

test('14. the mini fleshmancer’s glide goes round; setting off starts from his rest and ends on its first frame; stopping the other way', () => {
  const at = (move: string, t: number) => posedOfMob(MINI_FM, move, t);
  const fields = ['pz', 'px', 'pitch', 'bend', 'lhx', 'lhz', 'rhx', 'rhz', 'gale'] as const;
  const near = (a: Record<string, number>, b: Record<string, number>, what: string): void => {
    for (const k of fields) assert.ok(Math.abs(a[k] - b[k]) < 0.05, `${what} (${k}: ${a[k].toFixed(2)} against ${b[k].toFixed(2)})`);
  };
  const rest = MINI_REST as unknown as Record<string, number>;
  near(at('walk', 0) as unknown as Record<string, number>, at('walk', MINI_GLIDE_LONG) as unknown as Record<string, number>, 'the glide does not go round');
  near(at('setOff', 0) as unknown as Record<string, number>, rest, 'setting off does not start from his rest');
  near(at('setOff', MINI_SET_OFF) as unknown as Record<string, number>, at('walk', 0) as unknown as Record<string, number>, 'setting off does not end on the glide');
  near(at('halt', 0) as unknown as Record<string, number>, at('walk', 0) as unknown as Record<string, number>, 'stopping does not start from the glide');
  near(at('halt', MINI_HALT) as unknown as Record<string, number>, rest, 'stopping does not end at his rest');
});

test('15. his death: his own fire takes him; he burns down into the floor, nothing of him left above it; what is left lies low, with no light in it', () => {
  const end = skeletonAt(MINI_FM, 'dying', MINI_DIES.long);
  for (const [name, p] of [['his head', end.head], ['his left claw', end.handL], ['his right claw', end.handR], ['his hips', end.pelvis]] as const) assert.ok(p[2] < -4, `${name} still above the floor (${p[2].toFixed(1)})`);
  const under = skeletonAt(MINI_FM, 'dying', MINI_DIES.under + 0.02);
  assert.ok(under.head[2] < 0, `his hood under as the fire spits out his mask (${under.head[2].toFixed(1)})`);
  for (const view of ['front', 'back'] as const) {
    const die = makeMiniFleshmancerArt3()[view].clips?.die?.frames ?? [];
    const last = die[die.length - 1];
    const stand = makeMiniFleshmancerArt3()[view].idle[0];
    assert.ok(last.h > 4 && last.h < stand.h * 0.3, `${view}: what is left (${last.h} high, against ${stand.h} standing)`);
    assert.ok(!last.lights?.length, `${view}: light in what is left`);
    // (and somewhere in the middle of it he is ablaze: light)
    assert.ok(die.some((sp) => (sp.lights?.length ?? 0) > 0), `${view}: no fire as he dies`);
  }
});
