// FLOORS 6 TO 8'S MOBS, MORE ACTION (the art chat's helper, 1 Nov 2026; docs/mockups/action_f6/README.md). His picks of 31 Oct, each
// “Yes (Recommended)”: the Firepot Thrower, “Keep it; make the burst and the fire bigger, as your area rule asks.”; the Chanter, his
// pick for LIGHTNING, “The Chanter, 6–10 (Recommended)” (chain lightning); the quarry golem, “Boulder roll, in place of the throw”; the
// canyon scorpion, “Acid spit, in place of the sting”; the dust devil, “Twister” and, for LIGHTNING, “The Dust Devil, 8”. So:
//   1. the switches are off; nothing of the game imports the mock-ups; the game's own frames of the five hash the same as on the
//      branch this one came from (tools/action_f6_hash.ts); with the new art, every list but the new moves the game's own, frame for frame;
//   2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. THE CULT'S TWO AND THE GOLEM THROUGH THE BOSSES' REVIEW (art/boss_checks.ts checkBoss, from in front and from behind, with
//      their handing over from every frame of their stand and back): nothing found; Movement 9 (held wind-ups, strikes of two frames,
//      smeared, big wind-downs); the boulder in its fists only from its tearing up to its bowling, never through it;
//   4. THE SCORPION AND THE DUST DEVIL THROUGH THE REVIEW FOR THE OLD RIGS (art/action_f1_checks.ts checkKit, both ways round, every
//      pair of the scorpion's feet as its soles): nothing found; the twister's wind-up held;
//   5. what each sends and leaves: crisp, no cyan, not cut off; THE NUMBERS (bigger areas, faster strikes).
//   run: tsx --test tests/action_f6.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import { checkKit } from '../src/art/action_f1_checks';
import { paintMob } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIREPOT } from '../src/game/act1_rules/firepot';
import { CHANTER as CHANTER_RULES } from '../src/game/act1_rules/chanter';
import { QGOLEM as QGOLEM_RULES } from '../src/game/act1_rules/qgolem';
import { SCORPION as SCORPION_RULES } from '../src/game/act1_rules/scorpion';
import { DEVIL as DEVIL_RULES } from '../src/game/act1_rules/devil';
import { BLAZE, BLAZE_THROWER, CAST_HIT, CAST_STRIKE, CHAIN, CHANTER_LIGHTNING, FIREPOT_BLAZE, LIGHTNING_CHANTER, LOB, LOB_HIT, LOB_STRIKE, blazeArc, blazeFly, blazePainted, chainBoltPainted, chainOf, makeBlazeThrowerArt, makeFlyingPotArt, makeLightningChanterArt, potShadowPainted, ringPainted } from '../src/art/action_f6_cult';
import { BOULDER, BOULDER_GOLEM, GOLEM_BOULDER, HAMMER, HAMMER_HIT, HAMMER_STRIKE, ROLLING_FRAMES, ROLL_HIT, ROLL_STRIKE, boulderHeld, lanePainted, makeBoulderGolemArt, paintRolling, smashPainted } from '../src/art/action_f6_golem';
import { DEVIL_TWISTER, SCORPION_SPIT, SNAP9, SNAP_STRIKE, SPIT, SPIT_STRIKE, TW, TW_STRIKE, makeSpitScorpionArt, makeTwisterDevilArt, paintGlob, poolPainted, spitArc, spitFly, swirlPainted, twisterPose, globShadowPainted } from '../src/art/action_f6_canyon';
import { blazeShape, boulderShape, castShape, devilKit, scorpionKit } from './action_f6_shapes';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

// (pure white is the heart of the enemy's fire, of a flash and of a bolt, as the game has it: not the friend's)
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
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
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      if (k === rimKey) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge };
}
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, (c[k] as Clip).frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
/** As tools/action_f3_hash.ts and tools/action_f6_hash.ts hash a figure's frames (every list both ways round). */
const sha = (x: string | Uint8ClampedArray, n: number): string => {
  const h = (nodeCrypto as { createHash(a: string): { update(x: unknown): unknown; digest(e: string): string } }).createHash('sha256');
  h.update(x);
  return h.digest('hex').slice(0, n);
};
function hashMoves(art: ActorArt): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    const ls: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
    if (s.heavy) ls.push(['heavy3', s.heavy]);
    const c = s.clips;
    if (c) {
      for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) ls.push([k, (c[k] as Clip).frames]);
      for (const [k, v] of Object.entries(c.moves ?? {})) ls.push([`moves.${k}`, v.frames]);
    }
    for (const [name, fr] of ls) out[`${view}:${name}`] = fr.map((sp) => {
      const h = (nodeCrypto as { createHash(a: string): { update(x: unknown): unknown; digest(e: string): string } }).createHash('sha256');
      const p = sp.img as unknown as Px;
      h.update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`);
      h.update(p.d);
      h.update(JSON.stringify(sp.lights ?? []));
      return h.digest('hex').slice(0, 12);
    });
  }
  return out;
}
const whole = (m: Record<string, string[]>): string => sha(JSON.stringify(m), 16);
const KINDS = ['firepot', 'chanter', 'qgolem', 'scorpion', 'devil'] as const;
/** The game's own frames of the five, on 9c54eff (origin/art/action-f5, before this branch): tools/action_f6_hash.ts. */
const HASHES: Record<(typeof KINDS)[number], string> = { firepot: '3e929f4d0c7ea056', chanter: 'ad617cb4114228b9', qgolem: '0f4c1703d6945977', scorpion: '2cc541277cc10f8f', devil: '48654659352a42ac' };

test('1. the switches are off; nothing of the game imports the mock-ups; the game’s frames the same; only the new moves new', () => {
  for (const sw of [FIREPOT_BLAZE, CHANTER_LIGHTNING, GOLEM_BOULDER, SCORPION_SPIT, DEVIL_TWISTER]) assert.equal(sw.on, false, 'a switch is on');
  const OURS = /from ['"][^'"]*action_f6_(fx|cult|golem|canyon|scene)['"]/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (floors 9 and 10's more action, art/action_f9_*.ts, are mock-ups built on these that nothing of the game imports: tests/action_f9.test.ts 1)
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/action_f(6|9)_/.test(f)) continue;
    assert.ok(!OURS.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  // the game's own frames, pixel for pixel, as they were
  const game: Record<string, ActorArt> = {};
  for (const k of KINDS) {
    game[k] = (act1Fig(k) as NonNullable<ReturnType<typeof act1Fig>>).make();
    assert.equal(whole(hashMoves(game[k])), HASHES[k], `${k}: the game's own frames changed`);
  }
  // with the new art: every list the game's own but the new moves
  const made: Array<[string, ActorArt, string[], string[]]> = [
    ['firepot', makeBlazeThrowerArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
    ['chanter', makeLightningChanterArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
    ['qgolem', makeBoulderGolemArt(), ['idle', 'walk', 'die', 'reel', 'moves.setOff', 'moves.halt'], ['attack', 'moves.throw', 'moves.rolling']],
    ['scorpion', makeSpitScorpionArt(), ['idle', 'walk', 'die', 'reel'], ['attack', 'moves.spit', 'moves.glob']],
    ['devil', makeTwisterDevilArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
  ];
  for (const [k, art, kept, fresh] of made) {
    for (const v of ['front', 'back'] as const) {
      const g = new Map(lists(game[k][v]));
      const n = new Map(lists(art[v]));
      for (const name of kept) (g.get(name) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (n.get(name) as Sprite[])[i]), 0, `${k} ${v} ${name} ${i}: the game's own`));
      for (const name of fresh) assert.ok(n.has(name), `${k} ${v}: has ${name}`);
    }
  }
  assert.ok(!('sting' in (makeSpitScorpionArt().front.clips?.moves ?? {})), 'the spit in place of the sting');
  assert.ok(BOULDER_GOLEM.more?.throw?.skull === undefined && /boulder/.test(BOULDER_GOLEM.more?.throw?.name ?? ''), 'the roll in place of the thrown chunk');
});

test('2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const arts: Array<[string, ActorArt, string[]]> = [
    ['firepot', makeBlazeThrowerArt(), ['attack']],
    ['chanter', makeLightningChanterArt(), ['attack']],
    ['golem', makeBoulderGolemArt(), ['attack', 'throw', 'rolling']],
    ['scorpion', makeSpitScorpionArt(), ['attack', 'spit', 'glob']],
    ['devil', makeTwisterDevilArt(), ['attack']],
  ];
  for (const [who, art, moves] of arts) {
    for (const v of ['front', 'back'] as const) {
      for (const m of moves) {
        const clip = (m === 'attack' ? art[v].clips?.attack : art[v].clips?.moves?.[m]) as Clip;
        clip.frames.forEach((sp, i) => {
          const l = look(paintingOf(sp), sp.lights);
          assert.ok(l.painted > 120 && l.rim > 12, `${who} ${v} ${m} ${i}: painted (${l.painted}), the pink edge (${l.rim})`);
          assert.equal(l.odd, 0, `${who} ${v} ${m} ${i}: not crisp`);
          assert.equal(l.cyan, null, `${who} ${v} ${m} ${i}: a friend's colour`);
        });
      }
    }
  }
  // (cut off: their own canvases, before they are trimmed)
  for (const v of ['front', 'back'] as const) {
    for (const [mob, move] of [[BLAZE_THROWER, 'attack'], [LIGHTNING_CHANTER, 'attack'], [BOULDER_GOLEM, 'attack'], [BOULDER_GOLEM, 'throw']] as const) {
      for (const t of framesOf(mob, move)) assert.ok(!look(paintMob(mob, move, t, v).px).edge, `${v} ${mob.id} ${move} ${t.toFixed(3)}: cut off`);
    }
  }
});

test('3. the cult’s two and the golem through the bosses’ review, both ways round: nothing found; Movement 9', () => {
  for (const [mob, shape, moves] of [[BLAZE_THROWER, blazeShape(), ['attack']], [LIGHTNING_CHANTER, castShape(), ['attack']], [BOULDER_GOLEM, boulderShape(), ['attack', 'throw']]] as const) {
    const found = checkBoss(mob, shape, moves);
    assert.equal(found.length, 0, `${mob.id}, the review found:\n${findingsSaid(found).join('\n')}`);
  }
  // Movement 9: each strike two frames; held a third of a second and more before it; a big wind-down after
  for (const [name, [a, b], hit, long, held] of [['lob', LOB_STRIKE, LOB_HIT, LOB.long, LOB_STRIKE[0] - LOB.wound], ['cast', CAST_STRIKE, CAST_HIT, CHAIN.long, CAST_STRIKE[0] - 0.35], ['hammer', HAMMER_STRIKE, HAMMER_HIT, HAMMER.long, HAMMER_STRIKE[0] - 0.45], ['roll', ROLL_STRIKE, ROLL_HIT, 2.7, ROLL_STRIKE[0] - 1.2]] as const) {
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${name}: a strike of two frames, its blow at its end`);
    assert.ok(held >= 0.3, `${name}: held ${held.toFixed(2)} s`);
    assert.ok(long - hit >= 0.8, `${name}: a big wind-down (${(long - hit).toFixed(2)} s)`);
  }
  // the boulder in its fists only from its tearing up to its bowling, held clear of the floor
  assert.equal(boulderHeld(0.3), null, 'no boulder before it is torn up');
  assert.ok(boulderHeld(0.6) && boulderHeld(ROLL_HIT - 1 / 30), 'the boulder in its fists as it hauls it up and holds it');
  assert.equal(boulderHeld(ROLL_HIT), null, 'gone from its fists as it is bowled');
  assert.ok((boulderHeld(1.3) as unknown as number[])[2] > 80, 'held up over its head');
});

test('4. the scorpion and the dust devil through the review for the old rigs, both ways round: nothing found; the twister’s wind-up held', () => {
  const said: string[] = [];
  for (const v of ['front', 'back'] as const) {
    for (let pair = 0; pair < 4; pair++) for (const m of ['attack', 'spit'] as const) for (const f of checkKit(scorpionKit(v, m, pair), scorpionKit(v, 'stand', pair))) said.push(`scorpion ${v} ${f.move} (feet ${pair * 2}, ${pair * 2 + 1}): ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    for (const f of checkKit(devilKit(v, 'attack'), devilKit(v, 'stand'))) said.push(`devil ${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
  }
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
  for (const [name, [a, b]] of [['snap', SNAP_STRIKE], ['spit', SPIT_STRIKE], ['twister', TW_STRIKE]] as const) assert.ok(Math.round((b - a) * 30) === 2, `${name}: two frames`);
  // the twister: held (its height and its lean barely changing) from 0.5 s to its strike; then 108 tall for 3.5 s
  const hs: number[] = [];
  for (let t = TW.spun; t < TW_STRIKE[0] + 1e-6; t += 1 / 30) hs.push(twisterPose(t).high);
  assert.ok(Math.max(...hs) - Math.min(...hs) < 2 && TW_STRIKE[0] - TW.spun >= 0.3, 'its wind-up held');
  assert.ok(twisterPose(2).high > 100 && twisterPose(TW.long).high < 34, 'the twister grown, and the dust devil again at its end');
});

test('5. what they send and leave: crisp, no cyan, not cut off; the numbers', () => {
  // (a picture as the game holds it is trimmed to what is painted: its edge is not asked of it)
  const check = (name: string, p: { px: Px; lights?: ReadonlyArray<{ color: string }> }, mustPaint = false, trimmed = false): void => {
    const l = look(p.px, p.lights ?? []);
    assert.ok(l.odd === 0 && l.cyan === null && (trimmed || !l.edge), `${name}: crisp (${l.odd}), no cyan (${l.cyan}), not cut off (${l.edge})`);
    if (mustPaint) assert.ok(l.painted > 30, `${name}: painted`);
  };
  for (let t = 0; t <= BLAZE.burstLong + BLAZE.burn; t += 0.1) for (const layer of ['floor', 'air'] as const) check(`blaze ${layer} ${t.toFixed(1)}`, blazePainted(t, layer));
  for (let k = 0; k <= 1; k += 0.25) check(`pot shadow ${k}`, potShadowPainted(k));
  for (const v of ['front', 'back'] as const) makeFlyingPotArt(v).frames.forEach((sp, i) => check(`pot ${v} ${i}`, { px: paintingOf(sp), lights: sp.lights }, true, true));
  for (let t = -0.6; t <= 0.6; t += 0.05) check(`ring ${t.toFixed(2)}`, ringPainted(t));
  for (let t = 0; t <= 0.5; t += 0.05) check(`bolt ${t.toFixed(2)}`, chainBoltPainted(2, -1, 30, 20, t, 1));
  for (let t = 0; t <= BOULDER.rubble; t += 0.1) for (const layer of ['floor', 'air'] as const) for (const q of [false, true]) check(`smash ${layer} ${q} ${t.toFixed(1)}`, smashPainted(t, layer, BOULDER.r, q));
  for (const v of ['front', 'back'] as const) for (let i = 0; i < ROLLING_FRAMES; i++) check(`rolling ${v} ${i}`, paintRolling(i / ROLLING_FRAMES, v), true);
  for (const k of [0, 0.5, 1]) check(`lane ${k}`, lanePainted(1, 0, k, 3));
  for (let i = 0; i < 6; i++) check(`glob ${i}`, paintGlob(i), true);
  for (let k = 0; k <= 1; k += 0.25) check(`glob shadow ${k}`, globShadowPainted(k));
  for (let t = -0.8; t <= SPIT.stays; t += 0.1) for (const layer of ['floor', 'air'] as const) check(`pool ${layer} ${t.toFixed(1)}`, poolPainted(t, layer));
  for (let t = 0; t <= TW.long; t += 0.1) check(`swirl ${t.toFixed(1)}`, swirlPainted(t));
  // THE NUMBERS: bigger areas than the game's own moves, fast strikes, high lobs
  assert.ok(BLAZE.r >= 1.5 && BLAZE.r > FIREPOT.burst.r * 2 && BLAZE.fire > FIREPOT.fire.r * 3 && BLAZE.burn >= FIREPOT.fire.burn, 'the burst and the fire much bigger');
  assert.ok(blazeArc(5) > 2.5 * (FIREPOT.pot.arc0 + FIREPOT.pot.arcPer * 5) && blazeFly(5) <= 1, 'the pot lobbed high');
  assert.ok(CHAIN.r > CHANTER_RULES.bolt.r * 2 && CHAIN.jump >= 2.5 && CHAIN.jumps === 2 && CHAIN.aim < CAST_HIT - 0.5, 'the ring and the jumps; the ring down half a second and more before it strikes');
  assert.ok(chainOf([[0, 0], [1.5, 0], [3.5, 0.5], [9, 9]], 0).join() === '0,1,2', 'it jumps to the nearest, then on, within its reach');
  assert.ok(HAMMER.r > QGOLEM_RULES.hammer.r * 1.7 && BOULDER.half * 2 >= 1.4 && BOULDER.pace >= 7 && BOULDER.r >= 1.5 && BOULDER.long >= 8, 'the hammer bigger; the lane, the roll, the smash');
  assert.ok(SNAP9.fwd[1] > SCORPION_RULES.snap.fwd[1] && SNAP9.half > SCORPION_RULES.snap.half && SPIT.pool >= 1.4 && SPIT.stays >= 4 && SPIT.far > SCORPION_RULES.sting.reach * 2 && spitArc(3) > 50 && spitFly(5) <= 0.85, 'the snap further; the spit high, its pool big and lasting');
  assert.ok(TW.pull > DEVIL_RULES.lash.reach * 1.8 && TW.until - TW.hit >= 3 && TW.high > 100 && TW.out[1] >= 2, 'the twister big, a few seconds, throwing lightning');
});
