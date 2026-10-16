// ACT 1: THE CANTOR, FLOOR 8'S BOSS, IN THE GAME (game/act1_rules/cantor.ts; his pictures art/act1_figs/cantor.ts,
// the art chat's art/cantor.ts; what he draws, render/act1_fx/cantor.ts):
//   1. he is built: his rules, his pictures with every clip his acts name, what he draws; he is floor 8's boss, a boss;
//   2. the rules' numbers are his pictures' own (his walk, every move's length and moments, where his bell comes
//      down, how far his shout rolls and comes back, where his copies stand, where his rocks fall);
//   3. his staff strike lands at its picture's moment and reach, and its echo a beat later on the same spot;
//   4. his shout harms twice, going out and coming back, as far as its picture rolls, and not behind him;
//   5. his sound-copies stand where his picture tore them away, and each repeats his last move, weaker;
//   6. his rockfall: the rocks round him where his picture brings them down, and those over the hero, on his tile;
//   7. killed in the middle of anything, nothing of his is left harming the hero; a long fight throws nothing;
//   8. what he draws is the cult's colours, never cyan; his size as the game goes by it, against his picture.

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { ECHO_FPS, ECHO_FROM, FIG, makeCantorArt } from '../src/art/act1_figs/cantor';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { CANTOR as CANTOR_MOB, CANTOR_COPIES, CANTOR_ON, CANTOR_PACE, CANTOR_ROCKFALL, CANTOR_SHOUT, CANTOR_STRIKE, CANTOR_WALK, STAFF_LONG } from '../src/art/cantor';
import { GRAIN } from '../src/art/kit';
import { TILE3, posedOfMob } from '../src/art/new_mobs3';
import { add, heading, mul, sub } from '../src/art/skeleton';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { CANTOR, CANTOR_ACTS, CANTOR_GAIT, COPY, ECHO_MOVES, RULES, onPicture, shoutBack, shoutOut } from '../src/game/act1_rules/cantor';
import { actsOf, bossKind, gaitOf } from '../src/game/bosses';
import { MONSTERS, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/cantor';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
paintWithoutCanvas();

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const act = (id: string) => CANTOR_ACTS.find((a) => a.id === id)!;

/** An empty practice room, the hero still at its middle, and the Cantor `far` tiles west of him, awake, facing him, not to be killed; every act of his but `only` kept cooling. */
function room(far: number, only: ActId | null = null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as { waveT: number; wakeUp(m: Monster): void };
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('cantor', h.x - far, h.y, -2, 0, false, new RNG(9));
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  m.fx = 1;
  m.fy = 0;
  if (only) keep(m, only);
  g.events.length = 0;
  return { g, m };
}
function keep(m: Monster, only: ActId): void {
  m.moveCd = actsOf(m)!.map((a) => (a.id === only ? 0 : 1e9));
  m.cd = 0;
}
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
}
/** The game stepped on for `secs`, the hero's life put back each step; `place(t)` puts him where he is to stand. */
function watch(g: Game, m: Monster, secs: number, place?: (t: number) => { x: number; y: number } | null, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1 };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    const at = place ? place(seen.began < 0 ? -1 : t - seen.began) : null;
    if (at) {
      h.x = at.x;
      h.y = at.y;
    }
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    h.burnT = 0;
    if (seen.began < 0 && m.state === 'act') seen.began = (k + 1) / 60;
    g.events.length = 0;
    if (until && until()) break;
  }
  return seen;
}
const since = (s: Seen, i: number): number => s.hurts[i].t - s.began;

test('1. he is built: his rules, his pictures with every clip his acts name, what he draws; floor 8\'s boss', () => {
  assert.ok(ACT1.on, 'the descent is in the game');
  assert.ok(RULES && FIG && FX, 'his rules, his pictures and what he draws');
  assert.equal(bossKind(8), 'cantor', 'floor 8\'s boss is the Cantor');
  assert.equal(sizeOf('cantor'), 'boss');
  assert.equal(RULES!.acts.length, 4, 'a boss: four (his rulebook)');
  assert.equal(RULES!.acts[0].clip, 'attack', 'his basic blow first');
  assert.ok(RULES!.acts.slice(1).every((a) => a.cooldown > 0), 'the others cool down');
  for (let i = 2; i < 4; i++) assert.ok(RULES!.acts[i].cooldown >= RULES!.acts[1].cooldown, 'the bigger, the longer the cooldown');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for his floor');
  assert.ok(FIG!.switches!.includes(CANTOR_ON), "the art chat's switch for him goes on with the descent");
  const art = makeCantorArt();
  for (const set of [art.front, art.back]) {
    const moves = set.clips!.moves!;
    for (const a of RULES!.acts) assert.ok(a.clip === 'attack' ? set.clips!.attack : moves[a.clip], `his ${a.id}'s picture, ${a.clip}`);
    assert.ok(set.clips!.reel && set.clips!.die, 'struck, and his death');
    for (const e of ECHO_MOVES) assert.ok(moves[e.clip] && moves[e.clip].frames.length === Math.round(e.long * ECHO_FPS) + 1, `his copies' ${e.clip}`);
    assert.equal(moves.echoCopies.frames.length, Math.round((CANTOR_COPIES.long - ECHO_FROM) * ECHO_FPS) + 1, "his copies' end of his sound-copies");
    assert.equal(set.walk.length, CANTOR_WALK.frames);
    assert.equal(set.walkFps, CANTOR_WALK.fps, 'his walk shown at the pace it is painted for');
  }
  const g = Game.forPractice('warrior', 5);
  const m = g.spawn('cantor', g.hero.x - 3, g.hero.y, -2, 0, false, new RNG(3));
  assert.ok(gaitOf(m.kind) === CANTOR_GAIT && actsOf(m) === CANTOR_ACTS, 'run by his rules');
});

test("2. the rules' numbers are his pictures' own", () => {
  const G = CANTOR_GAIT;
  assert.equal(G.pace, CANTOR_PACE);
  near(G.cycle, CANTOR_WALK.frames / CANTOR_WALK.fps, 1e-9, 'his walk\'s round');
  assert.equal(G.trueBack, !!CANTOR_MOB.trueBack, 'his back as the camera truly sees it');
  assert.equal(MONSTERS.cantor.speed, CANTOR_PACE, 'he goes at his walk\'s pace (his feet do not slide)');
  assert.equal(MONSTERS.cantor.windup, CANTOR_STRIKE.hit, "his blow's moment, his strike's");
  assert.ok(G.stopAt < act('cantor:strike').far, 'he stops within his strike\'s reach');
  const last = (which: string): number => {
    const mv = which === 'attack' ? CANTOR_MOB.attack : CANTOR_MOB.more![which];
    return mv.motion.keys[mv.motion.keys.length - 1].at;
  };
  for (const a of CANTOR_ACTS) near(a.long, last(a.clip), 0.02, `${a.id}: its length`);
  assert.equal(act('cantor:strike').hit, CANTOR_STRIKE.hit);
  assert.equal(act('cantor:shout').hit, CANTOR_SHOUT.hit);
  assert.equal(act('cantor:copies').hit, CANTOR_COPIES.tear[0]);
  assert.equal(act('cantor:rockfall').hit, CANTOR_ROCKFALL.rocks[0].at);
  // (where his bell comes down: art/cantor.ts strikeSpot, from his pose at the blow)
  const q = posedOfMob(CANTOR_MOB, 'attack', CANTOR_STRIKE.hit);
  const U = heading(q.wAz, q.wEl);
  const head = add(sub([q.rhx, q.rhy, q.rhz], mul(U, q.pt)), mul(U, STAFF_LONG));
  near(CANTOR.strike.spot[0], (head[0] + 4) / TILE3, 0.005, 'his bell comes down before him');
  near(CANTOR.strike.spot[1], head[1] / TILE3, 0.005, 'and to his right, his staff in his right hand');
  near(CANTOR.strike.echo, CANTOR_STRIKE.echo, 1e-9, 'its echo a beat later');
  // (his shout: art/cantor.ts's rings)
  near(CANTOR.shout.r0, 16 / TILE3, 1e-6, 'the wave from his feet');
  near(CANTOR.shout.reach, CANTOR_SHOUT.reach / TILE3, 1e-6, 'its reach');
  near(CANTOR.shout.out, CANTOR_SHOUT.out, 1e-9, 'how long it rolls');
  near(CANTOR.shout.back, CANTOR_SHOUT.back, 1e-9, 'when it comes back');
  near(shoutOut(CANTOR_SHOUT.hit + CANTOR_SHOUT.out - 1e-6)!, (16 + 175) / TILE3, 0.01, 'rolled out about 4.9 tiles (the art chat: 191 of his lengths)');
  near(shoutBack(CANTOR_SHOUT.back)!, (175 + 30) / TILE3, 1e-6, 'and back from beyond that');
  // (his copies, and his rocks)
  assert.deepEqual([...CANTOR.copies.tear], [...CANTOR_COPIES.tear]);
  assert.deepEqual([...CANTOR.copies.delay], [...CANTOR_COPIES.delay]);
  near(CANTOR.copies.side, CANTOR_COPIES.reach / TILE3, 1e-9, 'they stand 46 of his lengths to his sides');
  near(CANTOR.copies.long, CANTOR_COPIES.long, 1e-9, 'his sound-copies\' length');
  CANTOR_ROCKFALL.rocks.forEach((r, i) => {
    const [t, x, y, s] = CANTOR.rockfall.rocks[i];
    assert.equal(t, r.at);
    near(x, r.x / TILE3, 1e-9, `rock ${i}`);
    near(y, r.y / TILE3, 1e-9, `rock ${i}`);
    near(s, r.r / TILE3, 1e-9, `rock ${i}`);
  });
  near(CANTOR.rockfall.fall, CANTOR_ROCKFALL.fall, 1e-9, 'each falls half a second');
  near(CANTOR.rockfall.sing, CANTOR_ROCKFALL.sing, 1e-9, 'he sings');
  near(CANTOR.rockfall.plant, CANTOR_ROCKFALL.plant, 1e-9, 'the staff planted');
});

test('3. his staff strike lands at its moment and reach, and its echo a beat later on the same spot', () => {
  {
    // (under its bell: struck, and struck again by its echo)
    const { g, m } = room(2.6, 'cantor:strike');
    const s = watch(g, m, 2.4);
    assert.equal(s.hurts.length, 2, `under its bell: struck, then struck by its echo (${s.hurts.length})`);
    near(since(s, 0), CANTOR_STRIKE.hit, 0.03, 'the blow lands as the bell comes down');
    near(since(s, 1), CANTOR_STRIKE.hit + CANTOR_STRIKE.echo, 0.03, 'its echo a beat later');
    assert.ok(s.hurts[1].n < s.hurts[0].n, 'the echo weaker');
  }
  {
    // (under its staff, nearer him: struck by the blow; its echo is on the bell's spot)
    const { g, m } = room(1.4, 'cantor:strike');
    const s = watch(g, m, 2.4);
    assert.equal(s.hurts.length, 1, `under its staff: struck once (${s.hurts.length})`);
    near(since(s, 0), CANTOR_STRIKE.hit, 0.03, 'as it comes down');
  }
  {
    // (stepped off its line after it was raised: the blow misses; and off the spot, its echo too)
    const { g, m } = room(2.4, 'cantor:strike');
    const h0 = { x: g.hero.x, y: g.hero.y };
    const s = watch(g, m, 2.4, (t) => (t > 0.6 ? { x: h0.x, y: h0.y + 1.6 } : null));
    assert.equal(s.hurts.length, 0, 'beside its line, nothing');
  }
  {
    const { g, m } = room(2.6, 'cantor:strike');
    const h0 = { x: g.hero.x, y: g.hero.y };
    // (out of its way as it falls, back on its spot as the echo comes)
    const s = watch(g, m, 2.4, (t) => (t > 0.6 && t < 1.2 ? { x: h0.x, y: h0.y + 1.6 } : t >= 1.2 ? h0 : null));
    assert.equal(s.hurts.length, 1, 'only the echo');
    near(since(s, 0), CANTOR_STRIKE.hit + CANTOR_STRIKE.echo, 0.03, 'the echo strikes the same spot');
  }
  {
    // (behind him, nothing)
    const { g, m } = room(2.2, 'cantor:strike');
    const s = watch(g, m, 2.4, (t) => (t > 0.3 ? { x: m.x - 1.5, y: m.y } : null));
    assert.equal(s.hurts.length, 0, 'behind him, nothing');
  }
});

test('4. his shout harms twice, going out and coming back, as far as its picture rolls, and not behind him', () => {
  const S = CANTOR.shout;
  // (when its front passes a hero d tiles before his feet, going out and coming back)
  const outAt = (d: number): number => 1.0 + S.out * (1 - Math.sqrt(1 - (d - S.r0) / S.reach));
  const backAt = (d: number): number => S.back + S.out * (1 - Math.sqrt(1 - (S.reach + S.r0Back - d) / S.reach));
  {
    const { g, m } = room(3, 'cantor:shout');
    const s = watch(g, m, 2.4);
    assert.equal(s.hurts.length, 2, `struck going out and coming back (${s.hurts.length})`);
    near(since(s, 0), outAt(3 - S.at), 0.06, 'as its wave rolls over him');
    near(since(s, 1), backAt(3 - S.at), 0.06, 'and as it comes back over him');
  }
  {
    // (beyond how far it rolls out, only its coming back: off the wall behind him)
    const { g, m } = room(5.3, 'cantor:shout');
    m.gait = { mode: 'stand', t: 0 };
    g.bosses.startAct(m, CANTOR_ACTS, 1);
    const s = watch(g, m, 2.4);
    assert.equal(s.hurts.length, 1, 'beyond it, only its return');
    assert.ok(since(s, 0) >= S.back, 'as it comes back');
  }
  {
    const { g, m } = room(7, 'cantor:shout');
    m.moveCd![1] = 0;
    m.gait = { mode: 'stand', t: 0 };
    g.bosses.startAct(m, CANTOR_ACTS, 1);
    const s = watch(g, m, 2.4);
    assert.equal(s.hurts.length, 0, 'well beyond both, nothing');
  }
  {
    // (dodged both: rolled through each as it passed)
    const { g, m } = room(3, 'cantor:shout');
    const h = g.hero;
    const s = watch(g, m, 2.4, (t) => {
      const T = t;
      h.invuln = (Math.abs(T - outAt(3 - S.at)) < 0.12 || Math.abs(T - backAt(3 - S.at)) < 0.12) ? 0.1 : 0;
      return null;
    });
    assert.equal(s.hurts.length, 0, 'a hero who dodges each wave as it passes is not struck');
  }
  {
    const { g, m } = room(3, 'cantor:shout');
    const s = watch(g, m, 2.4, (t) => (t > 0.3 ? { x: m.x - 2.5, y: m.y } : null));
    assert.equal(s.hurts.length, 0, 'behind him, nothing');
  }
});

test('5. his sound-copies stand where his picture tore them away, and each repeats his last move, weaker', () => {
  const { g, m } = room(2.2, 'cantor:copies');
  m.a1 = { last: 0 };
  const C = CANTOR.copies;
  let copies: { x: number; y: number }[] = [];
  const s = watch(g, m, 6, () => {
    const now = g.perils.filter((p) => p.a1 === 'cantor:copy');
    if (now.length && !copies.length) copies = now.map((p) => ({ x: p.x, y: p.y }));
    return null;
  });
  assert.equal(copies.length, 2, 'two copies');
  // (his picture faces the floor's x: his left is its -y)
  const left = onPicture(1, 0, 0, C.side);
  near(left.y, -C.side, 1e-9, 'his left, as his picture is painted in front');
  near(copies[0].x - m.x, 0, 0.02, 'the first beside him');
  near(copies[0].y - m.y, -C.side, 0.02, 'to his left');
  near(copies[1].y - m.y, C.side, 0.02, 'the second to his right');
  // (each repeats his strike from where it stands: the first a beat after his move ends, the second a beat after it)
  const strikes = s.hurts.filter((x) => x.t - s.began < C.long + C.delay[1] + 1.2);
  assert.ok(strikes.length >= 2, `each copy's strike lands on the hero (${s.hurts.map((x) => (x.t - s.began).toFixed(2)).join(', ')})`);
  near(since(s, 0), C.long + C.delay[0] + CANTOR_STRIKE.hit, 0.04, "the first copy's blow, a beat behind him");
  near(since(s, 1), C.long + C.delay[1] + CANTOR_STRIKE.hit, 0.04, "the second's, a beat behind the first");
  const his = (m.dmgMin + m.dmgMax) / 2;
  assert.ok(s.hurts[0].n < his, `weaker than his own blow (${s.hurts[0].n} of his ${his})`);
  assert.equal(g.perils.filter((p) => p.a1 === 'cantor:copy').length, 0, 'and they are gone');
  // (his shout repeated: from where they stand)
  {
    const { g: g2, m: m2 } = room(3, 'cantor:copies');
    m2.a1 = { last: 1 };
    const s2 = watch(g2, m2, 6);
    assert.ok(s2.hurts.length >= 2, `their shouts' waves (${s2.hurts.length})`);
    assert.ok(since(s2, 0) > C.long + C.delay[0] + 1.0, 'after his move, as theirs roll');
  }
  // (not while they are still about)
  {
    const { g: g3, m: m3 } = room(2.2, 'cantor:copies');
    watch(g3, m3, 2.4);
    assert.ok(g3.perils.some((p) => p.a1 === 'cantor:copy'), 'out');
    assert.equal(RULES!.can!(g3.bosses, m3, act('cantor:copies'), 2.2, true), false, 'no more while they are out');
  }
});

test('6. his rockfall: the rocks round him where his picture brings them down, and those over the hero, on his tile', () => {
  const { g, m } = room(2, 'cantor:rockfall');
  const h0 = { x: g.hero.x, y: g.hero.y };
  let rocks: { x: number; y: number; a: number; hit: number }[] = [];
  const s = watch(g, m, 3.4, () => {
    const now = g.perils.filter((p) => p.a1 === 'cantor:rock');
    if (now.length && !rocks.length) rocks = now.map((p) => ({ x: p.x, y: p.y, a: p.a, hit: p.hit }));
    return null;
  });
  assert.equal(rocks.length, 9, 'six round him, three over the hero');
  const own = rocks.filter((r) => r.a === 0);
  assert.equal(own.length, 6, 'six where his picture brings them down');
  CANTOR.rockfall.rocks.forEach(([t, fwd, left], i) => {
    // (in front, his picture's forward along the floor's x, its left the floor's -y)
    near(own[i].x - m.x, fwd, 1e-6, `rock ${i}, before him`);
    near(own[i].y - m.y, -left, 1e-6, `rock ${i}, to his side`);
    near(own[i].hit, t - CANTOR.rockfall.sing, 1e-9, `rock ${i} lands when its picture does`);
  });
  const over = rocks.filter((r) => r.a === 1);
  near(over[0].x, Math.floor(h0.x) + 0.5, 1e-9, "the first over the hero, on his tile");
  near(over[0].y, Math.floor(h0.y) + 0.5, 1e-9, 'on his tile');
  assert.ok(s.hurts.length >= 1, 'it strikes him where he stands');
  near(since(s, 0), CANTOR.rockfall.hero.at[0], 0.03, 'as the first lands');
  {
    // (stepped off his tile once he sees its shadow: it misses him)
    const { g: g2, m: m2 } = room(2, 'cantor:rockfall');
    const s2 = watch(g2, m2, 3.4, (t) => (t > 1.0 ? { x: m2.x - 4, y: m2.y + 3 } : null));
    assert.equal(s2.hurts.length, 0, 'out from under them, nothing');
  }
});

test('7. killed in the middle of anything, nothing of his is left harming the hero; a long fight throws nothing', () => {
  for (const [id, far] of [['cantor:strike', 2.2], ['cantor:shout', 3], ['cantor:copies', 2.2], ['cantor:rockfall', 2]] as const) {
    for (const when of [0.4, 1.2, 1.9]) {
      const { g, m } = room(far, id);
      m.a1 = { last: 1 };
      watch(g, m, 6, undefined, () => m.state === 'act' && m.act !== undefined && m.act.t >= when);
      g.kill(m);
      const s = watch(g, m, 6);
      assert.equal(g.perils.filter((p) => p.kind === 'act1').length, 0, `${id}, killed ${when} s in: nothing of his left on the floor`);
      assert.equal(s.hurts.filter((x) => x.t > 2).length, 0, `${id}, killed ${when} s in: nothing of his harms the hero after`);
    }
  }
  // (a long fight: every act as it comes, the hero going round him; nothing throws, and he uses all four)
  const { g, m } = room(4);
  const used = new Set<string>();
  const h = g.hero;
  const cx = m.x;
  const cy = m.y;
  watch(g, m, 90, (t) => {
    if (m.act) used.add(m.act.id);
    const a = t * 0.25;
    const r = 2 + 2.5 * (0.5 + 0.5 * Math.sin(t * 0.13));
    return t < 0 ? null : { x: cx + Math.cos(a) * r + (h.x - h.x), y: cy + Math.sin(a) * r };
  });
  for (const a of CANTOR_ACTS) assert.ok(used.has(a.id), `he made his ${a.id}`);
});

test("8. what he draws is the cult's colours, never cyan; his size as the game goes by it, against his picture", () => {
  // (a canvas that keeps every colour it is given)
  const colours = new Set<string>();
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k in o ? o[k as string] : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle' || k === 'strokeStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  const stood: number[] = [];
  const { g, m } = room(3);
  const c: Act1FxCtx = { g: ctx, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: (d) => void stood.push(d), spot: () => undefined };
  const look = (): void => {
    c.t = g.time;
    FX!.ground!(c, m, null);
    for (const p of g.perils) if (p.kind === 'act1') {
      FX!.ground!(c, null, p);
      FX!.standing!({ ...c, g: null }, null, p);
    }
  };
  for (const [id, last] of [['cantor:strike', 0], ['cantor:shout', 0], ['cantor:copies', 1], ['cantor:copies', 0]] as const) {
    keep(m, id);
    m.a1 = { last };
    const until = g.time + 6;
    while (g.time < until) {
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      if (Math.round(g.time * 60) % 6 === 0) look();
    }
  }
  assert.ok(colours.size > 0, 'he draws');
  assert.ok(stood.length > 0, 'his copies stand among the figures');
  for (const col of colours) {
    const v = col.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const gg = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    assert.ok(!(b > r + 30 && gg > r + 30), `nothing cyan: ${col}`);
  }
  // (his size, as tests/first5_bosses.test.ts measures every figure's)
  const size = FIGURE_SIZE.cantor;
  assert.deepEqual(size, FIG!.size, 'the game holds the size his pictures give');
  const sp = makeCantorArt().front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let top = 0;
  for (let y = 0; y < p.h && top === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) top = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - top) <= 4, `his top ${size.top}; his picture's ${top}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; his picture reaches ${reach}`);
  // (his copies' pictures: the cult's pink, see-through)
  void COPY;
});
