// THE MAGE'S AND THE RANGER'S MOVES TO SWAP (game/swap_moves.ts, behind game/talents.ts SWAP_MOVES, off; his words in
// docs/mockups/swap_moves/README.md). Held here:
//   1. off, the game is as it was: the Mage Wave and Orb, the Ranger Shot and Volley, their trees the old ones;
//   2. on, the Mage sets any two of what she has learned on her tap and hold, never one in both, Beam only on her hold;
//   3. her BALL stops on what it hits and bursts there, hurting what is round it and not what is far;
//   4. her SPEAR goes through every enemy in its line;
//   5. the Ranger's SNARE in the place of his Shot, SNIPE or RALLY in his Volley's (both learned: he picks).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { SWAP_MOVES, TREES } from '../src/game/talents';
import type { ClassId, MonsterKind } from '../src/game/types';
import { land, seasoned } from './helpers';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
}

function swapOn<T>(fn: () => T): T {
  const was = SWAP_MOVES.on;
  SWAP_MOVES.on = true;
  try {
    return fn();
  } finally {
    SWAP_MOVES.on = was;
  }
}

function hero(cls: ClassId, talents: string[]): { g: Game; a: Inside } {
  const g = Game.forPractice(cls, 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  seasoned(g, 50);
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const t of talents) assert.equal(g.takeTalent(t), null, `takes ${t}`);
  g.events.length = 0;
  return { g, a };
}

function put(g: Game, a: Inside, dx: number, dy: number): Monster {
  const h = g.hero;
  const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
  return m;
}

/** Her tap at (x, y), and a second for it to fly. */
function tap(g: Game, x: number, y: number): void {
  const h = g.hero;
  h.swingT = 0;
  for (const s of h.skills) s.cd = 0;
  const c = emptyControls();
  c.aimX = x;
  c.aimY = y;
  c.fire = true;
  g.update(DT, c);
  const off = emptyControls();
  off.aimX = x;
  off.aimY = y;
  land(g, off, DT, () => {});
  for (let t = 0; t < 1.2; t += DT) g.update(DT, emptyControls());
}

const ids = (g: Game): string[] => g.hero.skills.map((s) => s.id);
const hurt = (m: Monster): boolean => m.life < m.maxLife;

test('1. off, the game is as it was', () => {
  assert.equal(SWAP_MOVES.on, false, 'off until his yes to the moves in play');
  assert.deepEqual(ids(hero('mage', []).g).slice(0, 2), ['wave', 'orb']);
  assert.deepEqual(ids(hero('ranger', []).g).slice(0, 2), ['shot', 'volley']);
  assert.ok(!TREES.mage.talents.some((t) => t.id === 'aura'), 'her old tree');
  assert.ok(!TREES.ranger.talents.some((t) => t.id === 'snare'), 'his old tree');
});

test('2. on, she sets any two of what she has learned on her tap and hold; never one in both; Beam only held', () => swapOn(() => {
  const { g } = hero('mage', ['kindling', 'ball', 'charged', 'beam', 'bittercold', 'spear']);
  assert.deepEqual(ids(g).slice(0, 2), ['wave', 'orb'], 'Wave and Orb till she sets them');
  const taps = new Set<string>();
  for (let k = 0; k < 6; k++) {
    taps.add(g.hero.skills[0].id);
    g.changeMove(0);
    assert.notEqual(g.hero.skills[0].id, g.hero.skills[1].id, 'never one move in both places');
  }
  assert.ok(!taps.has('beam'), 'Beam never on her tap');
  for (const m of ['wave', 'ball', 'spear']) assert.ok(taps.has(m), `${m} on her tap`);
  const holds = new Set<string>();
  for (let k = 0; k < 6; k++) {
    holds.add(g.hero.skills[1].id);
    g.changeMove(1);
  }
  assert.ok(holds.has('beam'), 'Beam on her hold');
  // (unlearned, a move is gone from her places)
  const { g: g2 } = hero('mage', ['kindling']);
  assert.deepEqual(g2.moveChoicesOf(0), [], 'nothing to change to with nothing learned');
}));

test('3. her BALL stops on what it hits and bursts there: what is round it hurt, what is far not', () => swapOn(() => {
  const { g, a } = hero('mage', ['kindling', 'ball']);
  while (g.hero.skills[0].id !== 'ball') assert.ok(g.changeMove(0));
  const first = put(g, a, 4, 0);
  const beside = put(g, a, 4.8, 0.6);
  const beyond = put(g, a, 7.5, 0);
  tap(g, first.x, first.y);
  assert.ok(hurt(first), 'what it struck');
  assert.ok(hurt(beside), 'what is beside it, in the burst');
  assert.ok(!hurt(beyond), 'what is beyond it: the ball stopped');
}));

test('4. her SPEAR goes through every enemy in its line', () => swapOn(() => {
  const { g, a } = hero('mage', ['bittercold', 'spear']);
  while (g.hero.skills[0].id !== 'spear') assert.ok(g.changeMove(0));
  const line = [put(g, a, 3, 0), put(g, a, 5, 0), put(g, a, 7, 0)];
  const off = put(g, a, 5, 2.5);
  tap(g, line[2].x, line[2].y);
  for (const [k, m] of line.entries()) assert.ok(hurt(m), `the ${k + 1} in its line`);
  assert.ok(!hurt(off), 'not what is off its line');
}));

test('5. the Ranger: Snare for his Shot; Snipe or Rally for his Volley, his pick where he has both', () => swapOn(() => {
  const tree = TREES.ranger;
  const path = (id: string): string[] => {
    // (the stones on the way to `id` from where his tree begins, as takeTalent wants them)
    const out: string[] = [];
    let at = tree.talents.find((t) => t.id === id);
    while (at) {
      out.unshift(at.id);
      at = at.from.length ? tree.talents.find((t) => t.id === at!.from[0]) : undefined;
    }
    return out;
  };
  const want = [...new Set([...path('snare'), ...path('snipe')])];
  const { g } = hero('ranger', want);
  assert.deepEqual(ids(g).slice(0, 2), ['snare', 'snipe']);
  assert.deepEqual(g.moveChoicesOf(1), [], 'one hold learned: nothing to pick');
  assert.deepEqual(g.moveChoicesOf(0), [], 'his tap is Snare, no pick');
}));

/** A tap on her (as main.ts makes it), then `secs` of the game. */
function tapHer(g: Game, secs: number): void {
  const c = emptyControls();
  c.change = true;
  g.update(DT, c);
  for (let t = 0; t < secs; t += DT) g.update(DT, emptyControls());
}

test('6. her AURA: its kind picked once on its stone (unlearn to change), of three', () => swapOn(() => {
  const { g } = hero('mage', ['kindling', 'searing', 'aura']);
  assert.equal(g.pickOf('aura'), 'fire', 'fire till she picks');
  assert.equal(g.choosePick('aura', 'frost'), null, 'she picks frost');
  assert.equal(g.pickOf('aura'), 'frost');
  assert.equal(g.choosePick('aura', 'lightning'), 'Unlearn to change', 'picked once');
  assert.equal(g.pickOf('aura'), 'frost');
}));

test('7. FIRE: a tap on her and every enemy in it burns; not one outside it; a few seconds on, then a wait', () => swapOn(() => {
  const { g, a } = hero('mage', ['kindling', 'searing', 'aura']);
  const inside = put(g, a, 2, 0);
  const outside = put(g, a, 6, 0);
  tapHer(g, 2);
  assert.ok(hurt(inside), 'what is in it burns');
  assert.ok(!hurt(outside), 'what is outside it does not');
  assert.ok(g.auraNow(), 'on');
  for (let t = 0; t < 5; t += DT) g.update(DT, emptyControls());
  assert.equal(g.auraNow(), null, 'off after its seconds');
  tapHer(g, 0.2);
  assert.equal(g.auraNow(), null, 'a tap in its wait does nothing');
}));

test('8. LIGHTNING bolts every enemy in it; FROST shields her and chills them', () => swapOn(() => {
  const { g, a } = hero('mage', ['kindling', 'searing', 'aura']);
  g.choosePick('aura', 'lightning');
  const m = put(g, a, 2.5, 0);
  tapHer(g, 1);
  assert.ok(hurt(m), 'bolted');
  const { g: f, a: fa } = hero('mage', ['kindling', 'searing', 'aura']);
  f.choosePick('aura', 'frost');
  const c = put(f, fa, 2, 0);
  tapHer(f, 0.6);
  assert.ok(f.hero.shield > 0, 'her shield');
  assert.ok(c.chillT > 0 && c.chill > 0, 'chilled');
}));

test('9. LASTING AURA: on without a tap, and it stays on', () => swapOn(() => {
  const { g } = hero('mage', ['kindling', 'searing', 'aura', 'flamewarp', 'fuel', 'inferno', 'lasting']);
  for (let t = 0; t < 12; t += DT) g.update(DT, emptyControls());
  assert.ok(g.auraNow(), 'on after twice its seconds, no tap');
}));

/** The Ranger with the stones on the way to each of `ids`, as his tree joins them. */
function ranger(ids: string[]): { g: Game; a: Inside } {
  const tree = TREES.ranger;
  const way = (id: string): string[] => {
    const out: string[] = [];
    let at = tree.talents.find((t) => t.id === id);
    while (at) {
      out.unshift(at.id);
      at = at.from.length ? tree.talents.find((t) => t.id === at!.from[0]) : undefined;
    }
    return out;
  };
  return hero('ranger', [...new Set(ids.flatMap(way))]);
}

/** His hold at (x, y), held `secs`, then let go, and a second for it to fly. */
function holdAt(g: Game, x: number, y: number, secs: number, letGo = true): void {
  for (const s of g.hero.skills) s.cd = 0;
  const c = emptyControls();
  c.cast = true;
  c.castX = x;
  c.castY = y;
  c.hold = true;
  g.update(DT, c);
  for (let t = 0; t < secs; t += DT) {
    const k = emptyControls();
    k.hold = true;
    k.castX = x;
    k.castY = y;
    g.update(DT, k);
  }
  if (letGo) for (let t = 0; t < 1.2; t += DT) g.update(DT, emptyControls());
}

test('10. his SNARE: thrown where he aims; what is on it held fast, then it bursts', () => swapOn(() => {
  const { g, a } = ranger(['snare']);
  assert.equal(g.hero.skills[0].id, 'snare');
  const m = put(g, a, 4, 0);
  const h = g.hero;
  h.swingT = 0;
  const c = emptyControls();
  c.aimX = m.x;
  c.aimY = m.y;
  c.fire = true;
  g.update(DT, c);
  const off = emptyControls();
  off.aimX = m.x;
  off.aimY = m.y;
  land(g, off, DT, () => {});
  let held = false;
  for (let t = 0; t < 1.5 && !held; t += DT) {
    g.update(DT, emptyControls());
    held = m.stunT > 0;
  }
  assert.ok(held, 'held fast');
  assert.ok(!hurt(m), 'not hurt while held');
  for (let t = 0; t < 2.5; t += DT) g.update(DT, emptyControls());
  assert.ok(hurt(m), 'then it bursts');
}));

test('11. his SNIPE: through every enemy in its line; drawn longer, harder', () => swapOn(() => {
  const quick = ranger(['snipe']);
  assert.equal(quick.g.hero.skills[1].id, 'snipe');
  const q = [put(quick.g, quick.a, 3, 0), put(quick.g, quick.a, 6, 0)];
  holdAt(quick.g, q[1].x, q[1].y, 0.1);
  for (const m of q) assert.ok(hurt(m), 'through its line');
  const long = ranger(['snipe']);
  const l = put(long.g, long.a, 3, 0);
  holdAt(long.g, l.x, l.y, 1.6);
  assert.ok(l.maxLife - l.life > (q[0].maxLife - q[0].life) * 1.8, 'a full draw far harder than a quick one');
}));

test('11b. his SNIPE held: he is seen drawing all the while he holds it (his own held pictures, not his guard)', () => swapOn(() => {
  const { g, a } = ranger(['snipe']);
  const m = put(g, a, 6, 0);
  holdAt(g, m.x, m.y, 1.2, false);
  assert.ok(g.hero.channel, 'still drawing');
  assert.equal(g.hero.anim, 'attack', 'held in the attack, as a held beam is');
  assert.equal(g.hero.attackSkill, 1);
}));

test('11c. his SNIPE drawn full: a wider arrow, faster, and what it hits knocked back (his words: “a bigger arrow hitbox with more momentum and force”)', () => swapOn(() => {
  const loosed = (secs: number): { r: number; v: number; snipe: number } => {
    const { g, a } = ranger(['snipe']);
    const m = put(g, a, 9, 0);
    holdAt(g, m.x, m.y, secs, false);
    for (let t = 0; t < 0.6 && !g.projectiles.some((q) => q.snipe !== undefined); t += DT) g.update(DT, emptyControls());
    const p = g.projectiles.find((q) => q.snipe !== undefined);
    if (!p) throw new Error('no arrow loosed');
    return { r: p.r, v: Math.hypot(p.vx, p.vy), snipe: p.snipe as number };
  };
  const quick = loosed(0.1);
  const full = loosed(1.9);
  assert.ok(full.snipe >= 1 && quick.snipe < 0.2, 'how full each was');
  assert.ok(full.r > quick.r * 2, 'wider');
  assert.ok(full.v > quick.v * 1.5, 'faster');
  const { g, a } = ranger(['snipe']);
  const m = put(g, a, 3, 0);
  const x0 = m.x;
  holdAt(g, m.x + 6, m.y, 1.9);
  assert.ok(hurt(m), 'struck');
  assert.ok(m.x - x0 > 0.6, 'knocked back');
}));

test('12. his RALLY: his companions quickened for a few seconds', () => swapOn(() => {
  const { g } = ranger(['rally']);
  assert.equal(g.hero.skills[1].id, 'rally');
  holdAt(g, g.hero.x + 2, g.hero.y, 0.1);
  const inside = g as unknown as { rallyT: number };
  assert.ok(inside.rallyT > 0, 'on');
  for (let t = 0; t < 6; t += DT) g.update(DT, emptyControls());
  assert.equal(inside.rallyT, 0, 'over after its seconds');
}));
