// ACT 2, THE HUSH: FLOOR 14'S BOSS, THE PHYSICIAN, IN THE GAME (game/act1_rules/physician.ts; his pictures art/act1_figs/physician.ts,
// the art chat's art/physician.ts and physician_moves.ts; what he draws, takes and leaves, render/act1_fx/physician.ts, the art's
// physician_shots.ts):
//   1. he is built: his rules, his pictures with every clip his acts name, what he draws, his lines; floor 14's boss with the Hush
//      on, and with it off the old game's;
//   2. the rules' numbers are his pictures' own (his walk, every move's length and moments, where his ferrule strikes, how far
//      his quill reaches, where his phials leave his hand, his raps; how far his clouds reach and how long they lie);
//   3. his rap lands at its moment on a hero in its way, and leaves its mark where the ferrule struck; not beside him or behind;
//   4. THE DRAW: it strikes, and draws one of the words set in the hero's attacks out of its socket, his attack from then on
//      without it; it hangs over his head from as he pushes the plunger home; beaten back out of him by five blows, or by a
//      twentieth of his life, or at his death, it flies home to its socket (to the pouch if that is filled); he draws no other
//      while he holds one; a hero out of its way is not drawn, and one with no word set loses none;
//   5. A WORD IS NEVER LOST: saved while he holds it, the save has it where it would go back to (the game going on as it is);
//      the floor left, or the hero fallen, it is his again;
//   6. TONIC: three phials, at the hero and to either side of him; each smashes where it lands; standing in a cloud the hero's
//      words are dark, back once he is out of it and the Hush runs out; killed, his phials fall no more and his clouds hush
//      no one;
//   7. ROUNDS: three raps, a ring of the Hush from each; the patients lying near him rise, one with each rap, and new ones out
//      of the free beds near him, as many as he may, worth nothing; with none to raise he does not make his rounds;
//   8. killed in the middle of anything, nothing of his harms the hero after; a long fight throws nothing, and he makes all four;
//   9. what he draws is the enemy's pink and gold, the Hush's greys and the tonic's green, never cyan; his size, against his
//      picture.
//   run: tsx --test tests/act2_physician.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { PHYSICIAN_ON, caneOf, syringeOf } from '../src/art/physician';
import { PHYSICIAN as PH_MOB, PH_DRAW, PH_PACE, PH_RAP, PH_ROUNDS, PH_TONIC, PH_WALK } from '../src/art/physician_moves';
import { HELD_WORD_UP, HUSH_CLOUD_FOR, HUSH_CLOUD_R, PHIAL_FLIGHT, RAP_FOR, ROUNDS_RING_FOR, ROUNDS_RING_REACH, WORD_FREED_FOR } from '../src/art/physician_shots';
import { FIG } from '../src/art/act1_figs/physician';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { ACT1_FLOORS, ACT2 } from '../src/game/act1';
import { PHYSICIAN, PHYSICIAN_ACTS, PHYSICIAN_GAIT, RULES, cloudR, heldWord, quillSpot, rapSpot } from '../src/game/act1_rules/physician';
import { PATIENT, inBed } from '../src/game/act1_rules/patient';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, bossKind, gaitOf } from '../src/game/bosses';
import { BOSS_LIFE, BOSS_LINES, HUSH_FOR, MONSTERS, sizeOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster, PropInst } from '../src/game/state';
import type { WordId } from '../src/game/types';
import { FX } from '../src/render/act1_fx/physician';
import { act1Fx } from '../src/render/act1_fx/index';
import { fakeCtx, fakeDocument } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
nodeAssert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
paintWithoutCanvas();
fakeDocument();

const act = (id: string) => PHYSICIAN_ACTS.find((a) => a.id === id)!;
type Hooks = { waveT: number; wakeUp(m: Monster): void; damageMonster(m: Monster, n: number, el: string, crit: boolean, k: number, heavy?: boolean, words?: undefined, poison?: boolean, dot?: boolean): void; die(): void; practice: boolean; guide: unknown };
const hooks = (g: Game): Hooks => g as unknown as Hooks;

/** An empty practice room, the hero still at its middle, and the Physician `far` tiles west of him, awake, facing him, not to be killed; every act of his but `only` kept cooling. */
function room(far: number, only: ActId | null = null, life = 1e9): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  hooks(g).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('physician', h.x - far, h.y, -2, 0, false, new RNG(9));
  hooks(g).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = life;
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
/** The hero with this word set in the first socket before his first attack (taken from his pouch). */
function setWord(g: Game, w: WordId = 'fire'): void {
  const h = g.hero;
  h.skills[0].front[0] = w;
  h.words[w]--;
  g.refresh();
}
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
  acts: string[];
}
/** The game stepped on for `secs`, the hero's life put back each step; `place(t)` puts him where he is to stand (t from when an act began). */
function watch(g: Game, m: Monster, secs: number, place?: (t: number) => { x: number; y: number } | null, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, acts: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const at = place ? place(seen.began < 0 ? -1 : (k + 1) / 60 - seen.began) : null;
    if (at) {
      h.x = at.x;
      h.y = at.y;
    }
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    h.burnT = 0;
    if (m.state === 'act' && m.act) {
      if (seen.began < 0) seen.began = (k + 1) / 60;
      if (seen.acts[seen.acts.length - 1] !== `${m.act.id}#${m.act.n}`) seen.acts.push(`${m.act.id}#${m.act.n}`);
    }
    g.events.length = 0;
    if (until && until()) break;
  }
  return seen;
}
const since = (s: Seen, i: number): number => s.hurts[i].t - s.began;
/** A ward bed at tile (tx, ty), its head toward -y, solid as the dresser lays it. */
function layBed(g: Game, tx: number, ty: number): PropInst {
  const L = g.level;
  const p: PropInst = { kind: 'piece', name: PATIENT.bed.piece, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 2 };
  L.props.push(p);
  L.walk[ty * L.floor.w + tx] = 0;
  return p;
}
/** A canvas that keeps every colour it is given, and counts what is put on it. */
function keeper(): { ctx: CanvasRenderingContext2D; colours: Set<string>; put: () => number } {
  const colours = new Set<string>();
  let n = 0;
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k in o ? o[k as string] : k === 'fillRect' ? () => void n++ : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle' || k === 'strokeStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, colours, put: () => n };
}
const cyan = (col: string): boolean => {
  const v = col.replace('#', '');
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return b > r + 30 && g > r + 30;
};

test("1. he is built: his rules, his pictures with every clip his acts name, what he draws, his lines; floor 14's boss", () => {
  assert.ok(RULES && FIG && FX, 'his rules, his pictures and what he draws');
  assert.ok(act1Rules('physician') === RULES && act1Fig('physician') === FIG && act1Fx('physician') === FX, 'each where the game looks for it');
  assert.equal(sizeOf('physician'), 'boss');
  assert.equal(ACT2.on, false, 'the Hush is off');
  assert.equal(bossKind(14), 'warden', 'with it off, floor 14 is the old game\'s, the Warden\'s');
  ACT2.on = true;
  try {
    assert.equal(ACT1_FLOORS[14].boss, 'physician');
    assert.equal(bossKind(14), 'physician', "with it on, floor 14's boss is the Physician");
  } finally {
    ACT2.on = false;
  }
  assert.equal(PHYSICIAN_ACTS.length, 4, 'a boss: four (his rulebook)');
  assert.equal(PHYSICIAN_ACTS[0].clip, 'attack', 'his basic blow first');
  assert.equal(PHYSICIAN_ACTS[0].cooldown, 0, 'used while the others cool down');
  for (let i = 2; i < 4; i++) assert.ok(PHYSICIAN_ACTS[i].cooldown > PHYSICIAN_ACTS[i - 1].cooldown, 'the bigger, the longer the cooldown');
  assert.equal(FIG!.heavy, true, 'heavy: a boss, made for his floor');
  assert.ok(FIG!.switches!.includes(PHYSICIAN_ON), "the art chat's switch for him");
  const art = FIG!.make();
  for (const set of [art.front, art.back]) {
    for (const a of PHYSICIAN_ACTS) {
      const clip = a.clip === 'attack' ? set.clips!.attack : set.clips!.moves![a.clip];
      assert.ok(clip && clip.frames.length > 0, `his ${a.id}'s picture, ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.05, `${a.id}: as long as its picture`);
    }
    assert.ok(set.clips!.reel && set.clips!.die, 'struck, and his death');
    assert.equal(set.walk.length, PH_WALK.frames);
  }
  const { m } = room(3);
  assert.ok(gaitOf(m.kind) === PHYSICIAN_GAIT && actsOf(m) === PHYSICIAN_ACTS, 'run by his rules');
  assert.equal(BOSS_LINES.physician?.length, 3, 'his lines as the hero comes into his ground');
  assert.equal(BOSS_LIFE.times.physician, 3, 'his life, as the planning chat picked it');
});

test("2. the rules' numbers are his pictures' own", () => {
  const G = PHYSICIAN_GAIT;
  assert.equal(G.pace, PH_PACE);
  near(G.cycle, 1 / PH_WALK.fps, 1e-9, 'he stops at any frame of his walk, as his pictures hand over from any');
  assert.equal(G.trueBack, !!PH_MOB.trueBack, 'his back as the camera truly sees it');
  assert.equal(MONSTERS.physician.speed, PH_PACE, 'he goes at his walk\'s pace (his feet do not slide)');
  assert.equal(MONSTERS.physician.windup, PH_RAP.hit, "his blow's moment, his rap's");
  const last = (which: string): number => {
    const mv = which === 'attack' ? PH_MOB.attack : PH_MOB.more![which];
    return mv.motion.keys[mv.motion.keys.length - 1].at;
  };
  for (const a of PHYSICIAN_ACTS) near(a.long, last(a.clip), 1e-9, `${a.id}: its length`);
  assert.equal(act('physician:rap').hit, PH_RAP.hit);
  assert.equal(act('physician:draw').hit, PH_DRAW.hit);
  assert.equal(act('physician:tonic').hit, PH_TONIC.hit);
  assert.equal(act('physician:rounds').hit, PH_ROUNDS.raps[0]);
  assert.equal(PHYSICIAN.rap.hit, PH_RAP.hit);
  // (where his ferrule strikes the boards: art/physician.ts caneOf, at about 0.72)
  const tip = caneOf(skeletonAt(PH_MOB, 'attack', PHYSICIAN.rap.floor)).tip;
  near(PHYSICIAN.rap.at[0], tip[0] / TILE3, 0.002, 'his ferrule strikes before him');
  near(PHYSICIAN.rap.at[1], tip[1] / TILE3, 0.002, 'a little to his right, his cane in his right hand');
  assert.ok(tip[2] < 2, 'on the boards');
  near(PHYSICIAN.rap.at[0], 1.2, 0.05, '"about 1.2 tiles before him" (the art chat)');
  assert.equal(PHYSICIAN.rap.mark, RAP_FOR, 'its mark lasts as long as the art draws it');
  // (how far his quill reaches: art/physician.ts syringeOf, levelled along his arm, at the lunge)
  const quill = syringeOf(skeletonAt(PH_MOB, 'draw', PH_DRAW.hit), 0).tip;
  near(PHYSICIAN.draw.tip[0], quill[0] / TILE3, 0.002, 'his quill at full reach');
  near(PHYSICIAN.draw.tip[1], quill[1] / TILE3, 0.002, 'on his line');
  near(PHYSICIAN.draw.tip[0], 1.9, 0.05, '"its point about 1.9 tiles before him" (the art chat)');
  assert.ok(quill[2] / 2 > 20 && quill[2] / 2 < 32, `"at about a man's head height": ${(quill[2] / 2).toFixed(1)} game pixels`);
  assert.deepEqual([...PHYSICIAN.draw.warn], [...PH_DRAW.warn], 'its warning');
  assert.deepEqual([...PHYSICIAN.draw.push], [...PH_DRAW.push], 'the plunger pushed home, the word put up');
  assert.equal(PHYSICIAN.draw.up, HELD_WORD_UP, 'the word over his head');
  assert.equal(PHYSICIAN.draw.beat.flight, WORD_FREED_FOR, 'and its flight home');
  // (where the phials leave his hand)
  const hand = skeletonAt(PH_MOB, 'tonic', PH_TONIC.hit).handL;
  near(PHYSICIAN.tonic.from[0], hand[0] / TILE3, 0.002, 'his left hand as he flings them');
  near(PHYSICIAN.tonic.from[1], hand[1] / TILE3, 0.002, 'his left hand');
  near(PHYSICIAN.tonic.from[2], hand[2] / 2, 0.05, 'so high');
  assert.equal(PHYSICIAN.tonic.flight, PHIAL_FLIGHT, 'they fly as long as the art has them');
  assert.equal(PHYSICIAN.tonic.cloud.r, HUSH_CLOUD_R, 'a cloud as wide');
  assert.equal(PHYSICIAN.tonic.cloud.long, HUSH_CLOUD_FOR, 'and lying as long');
  // (his clouds on the floor, as the art draws them: the root of two of HUSH_CLOUD_R, the floor's diamonds going 32 by 16)
  assert.equal(cloudR(0), 0, 'nothing as it smashes');
  near(cloudR(1.0), HUSH_CLOUD_R * Math.SQRT2 * 0.85, 1e-9, 'its thick heart once it has welled up');
  assert.ok(cloudR(0.35) > 0 && cloudR(0.35) < cloudR(1.0), 'welling up');
  assert.equal(cloudR(HUSH_CLOUD_FOR), 0, 'gone');
  assert.ok(cloudR(HUSH_CLOUD_FOR - 0.2) === 0 && cloudR(HUSH_CLOUD_FOR - 1.0) > 0, 'thinned away by its end');
  assert.deepEqual([...PHYSICIAN.rounds.raps], [...PH_ROUNDS.raps], 'his three raps');
  for (const T of PH_ROUNDS.raps) {
    const r = caneOf(skeletonAt(PH_MOB, 'rounds', T)).tip;
    near(PHYSICIAN.rounds.at[0], r[0] / TILE3, 0.002, `the rap at ${T}: before him`);
    near(PHYSICIAN.rounds.at[1], r[1] / TILE3, 0.002, `the rap at ${T}: to his right`);
    assert.ok(r[2] < 8, 'down on the floor');
  }
  assert.equal(PHYSICIAN.rounds.ring.reach, ROUNDS_RING_REACH);
  assert.equal(PHYSICIAN.rounds.ring.long, ROUNDS_RING_FOR);
  assert.ok(G.stopAt < act('physician:rap').far, 'he stops within his rap\'s reach');
  assert.ok(act('physician:rap').far <= PHYSICIAN.rap.at[0] + PHYSICIAN.rap.beyond + 0.1, 'and raps only where it reaches');
  assert.ok(act('physician:draw').far <= PHYSICIAN.draw.tip[0] + PHYSICIAN.draw.beyond + 0.1, 'and lunges only where his quill reaches');
});

test('3. his rap lands at its moment on a hero in its way, and leaves its mark where the ferrule struck; not beside him or behind', () => {
  for (const far of [0.8, 1.2, 1.5]) {
    const { g, m } = room(far, 'physician:rap');
    let mark: (typeof g.perils)[number] | undefined;
    const s = watch(g, m, 1.4, () => {
      mark ??= g.perils.find((p) => p.a1 === 'physician:rap');
      return null;
    });
    assert.equal(s.hurts.length, 1, `a hero ${far} tiles off: struck once`);
    near(since(s, 0), PH_RAP.hit, 0.03, 'as the cane comes down');
    assert.ok(mark, 'its mark');
    const want = rapSpot({ x: m.x, y: m.y, fx: 1, fy: 0 }, m.act ? m.act.hand : 1);
    near(Math.hypot(mark!.x - want.x, mark!.y - want.y), 0, 0.05, 'where the ferrule struck the boards');
  }
  for (const [dx, dy, what] of [[0.4, 1.3, 'beside him'], [-1.2, 0, 'behind him'], [2.2, 0, 'beyond it']] as const) {
    const { g, m } = room(1.2, 'physician:rap');
    g.bosses.startAct(m, PHYSICIAN_ACTS, 0);
    g.hero.x = m.x + dx;
    g.hero.y = m.y + dy;
    assert.equal(watch(g, m, 1.4).hurts.length, 0, `${what}: nothing`);
  }
});

test('4. THE DRAW: it strikes and draws a word out of its socket; it hangs over his head; beaten back out of him it flies home', () => {
  const D = PHYSICIAN.draw;
  {
    const { g, m } = room(1.8, 'physician:draw');
    const h = g.hero;
    setWord(g, 'fire');
    assert.equal(h.skills[0].r.element, 'fire', 'his attack burns with the word in it');
    const words = h.words.fire;
    const s = watch(g, m, D.push[0] - 0.1);
    assert.equal(s.hurts.length, 1, 'the lunge strikes him');
    near(since(s, 0), PH_DRAW.hit, 0.03, 'as the quill reaches him');
    assert.equal(heldWord(m), 'fire', 'the word drawn out of him is his');
    assert.equal(h.skills[0].front[0], null, 'out of its socket');
    assert.equal(h.words.fire, words, 'not in his pouch either');
    assert.ok(h.skills[0].r.element !== 'fire', 'his attack as it is without it');
    // (it comes up out of the quill as the plunger is pushed home, and hangs over his head)
    const k = keeper();
    const { c } = fakeCtx(g);
    FX!.air!({ ...c, g: k.ctx }, m, null);
    assert.equal(k.put(), 0, 'not over his head while still in the syringe');
    watch(g, m, 0.3);
    assert.ok((m.a1!.upT ?? -1) >= 0, 'up over his head from as he pushes the plunger home');
    FX!.air!({ ...c, g: k.ctx }, m, null);
    assert.ok(k.put() > 10, 'drawn there: its rune');
    for (const col of k.colours) assert.ok(!cyan(col), `in the enemy's colours: ${col}`);
    // (he draws no other while he holds it)
    keep(m, 'physician:draw');
    const first = m.act ? `#${m.act.n}` : '#none';
    const again = watch(g, m, 4);
    assert.equal(again.acts.filter((a) => a.startsWith('physician:draw') && !a.endsWith(first)).length, 0, 'no second Draw while he holds one');
    // (beaten back out of him: four blows, still his; the fifth, it is home)
    for (let i = 0; i < 4; i++) hooks(g).damageMonster(m, 10, 'phys', false, 0);
    assert.equal(heldWord(m), 'fire', 'four blows: still his');
    // (what burns him does not count, even in the moment of a blow)
    hooks(g).damageMonster(m, 10, 'fire', false, 0, false, undefined, false, true);
    g.update(1 / 60, emptyControls());
    hooks(g).damageMonster(m, 10, 'fire', false, 0, false, undefined, false, true);
    assert.equal(heldWord(m), 'fire', 'what burns him: still his');
    hooks(g).damageMonster(m, 10, 'phys', false, 0);
    assert.equal(heldWord(m), null, 'the fifth blow beats it out of him');
    assert.equal(h.skills[0].front[0], 'fire', 'back in its socket');
    assert.equal(h.skills[0].r.element, 'fire', 'his attack with it again');
    assert.ok(g.perils.some((p) => p.a1 === 'physician:freed' && p.dur === WORD_FREED_FOR), 'it flies home to him');
  }
  {
    // (its socket filled meanwhile: to the pouch)
    const { g, m } = room(1.8, 'physician:draw');
    const h = g.hero;
    setWord(g, 'fire');
    watch(g, m, 1.2);
    assert.equal(heldWord(m), 'fire');
    h.skills[0].front[0] = 'frost';
    h.words.frost--;
    const pouch = h.words.fire;
    for (let i = 0; i < 5; i++) {
      hooks(g).damageMonster(m, 10, 'phys', false, 0);
      g.update(1 / 60, emptyControls());
    }
    assert.equal(heldWord(m), null, 'beaten out of him');
    assert.equal(h.skills[0].front[0], 'frost', 'what he set there meanwhile stays');
    assert.equal(h.words.fire, pouch + 1, 'the word to his pouch');
  }
  {
    // (a twentieth of his life in one blow beats it out too; and so does his death)
    const { g, m } = room(1.8, 'physician:draw', 4000);
    setWord(g, 'fire');
    watch(g, m, 1.2);
    hooks(g).damageMonster(m, 4000 * D.beat.share + 1, 'phys', false, 0);
    assert.equal(heldWord(m), null, 'a twentieth of his life: out of him');
    assert.equal(g.hero.skills[0].front[0], 'fire');
    const b = room(1.8, 'physician:draw', 4000);
    setWord(b.g, 'fire');
    watch(b.g, b.m, 1.2);
    assert.equal(heldWord(b.m), 'fire');
    b.g.kill(b.m);
    assert.equal(b.g.hero.skills[0].front[0], 'fire', 'at his death, home');
    assert.ok(b.g.perils.some((p) => p.a1 === 'physician:freed'), 'flying');
  }
  {
    // (a hero who steps out of its way during its warning is not drawn; and one with no word set loses none)
    const { g, m } = room(1.8, 'physician:draw');
    setWord(g, 'fire');
    const h0 = { x: g.hero.x, y: g.hero.y };
    const s = watch(g, m, 1.3, (t) => (t > 0.4 ? { x: h0.x, y: h0.y + 1.5 } : null));
    assert.equal(s.hurts.length, 0, 'out of its way: not struck');
    assert.equal(heldWord(m), null, 'nothing drawn');
    assert.equal(g.hero.skills[0].front[0], 'fire');
    const b = room(1.8, 'physician:draw');
    const sb = watch(b.g, b.m, 1.3);
    assert.equal(sb.hurts.length, 1, 'with no word set: struck');
    assert.equal(heldWord(b.m), null, 'and nothing taken');
  }
  {
    // (the line of his lunge on the floor through its warning, and only then)
    const { g, m } = room(1.8, 'physician:draw');
    let drawn = 0;
    let off = 0;
    for (let k = 0; k < 120; k++) {
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      const kp = keeper();
      const { c } = fakeCtx(g, k / 60);
      FX!.ground!({ ...c, g: kp.ctx }, m, null);
      const during = !!m.act && m.act.t >= D.warn[0] && m.act.t < D.hit;
      if (kp.put() > 0) {
        if (during) drawn++;
        else off++;
      }
    }
    assert.ok(drawn > 10, 'drawn through its warning');
    assert.equal(off, 0, 'and not otherwise');
    const q = quillSpot({ x: 0, y: 0, fx: 1, fy: 0 }, 1);
    near(q.x, D.tip[0], 1e-9, 'out to where the quill will reach');
  }
});

test('5. A WORD IS NEVER LOST: saved while he holds it, the save has it; the floor left, or the hero fallen, it is his again', () => {
  {
    const { g, m } = room(1.8, 'physician:draw');
    setWord(g, 'fire');
    watch(g, m, 1.2);
    assert.equal(heldWord(m), 'fire');
    const run = g.save();
    assert.equal(run.sockets[0].front[0], 'fire', 'the save has it in its socket');
    assert.equal(heldWord(m), 'fire', 'and the game goes on as it is: still his');
    assert.equal(g.hero.skills[0].front[0], null);
    const back = Game.restore(JSON.parse(JSON.stringify(run)));
    assert.equal(back.hero.skills[0].front[0], 'fire', 'brought back from the save, the hero has it');
    // (its socket filled meanwhile: the save has it in the pouch)
    g.hero.skills[0].front[0] = 'frost';
    const run2 = g.save();
    assert.equal(run2.sockets[0].front[0], 'frost');
    assert.equal(run2.words.fire, g.hero.words.fire + 1, 'in the pouch of the save');
    g.hero.skills[0].front[0] = null;
    // (the floor left)
    g.enterTown();
    assert.equal(g.hero.skills[0].front[0], 'fire', 'the floor left, it is his again');
    assert.equal(g.hero.skills[0].r.element, 'fire');
  }
  {
    // (the hero fallen: not in the practice room, where nothing can kill him)
    const { g, m } = room(1.8, 'physician:draw');
    setWord(g, 'fire');
    watch(g, m, 1.2);
    assert.equal(heldWord(m), 'fire');
    hooks(g).practice = false;
    hooks(g).guide = null;
    hooks(g).die();
    assert.ok(g.over, 'he has fallen');
    assert.equal(g.hero.skills[0].front[0], 'fire', 'fallen, it is his again');
  }
});

test('6. TONIC: three phials at the hero and either side of him; standing in a cloud his words are dark; killed, it is over', () => {
  const T = PHYSICIAN.tonic;
  {
    const { g, m } = room(4, 'physician:tonic');
    const h = g.hero;
    const at0 = { x: h.x, y: h.y };
    const s = watch(g, m, PH_TONIC.hit + 0.05);
    const phials = g.perils.filter((p) => p.a1 === 'physician:phial');
    assert.equal(phials.length, T.n, 'three phials flung');
    assert.ok(phials.some((p) => Math.hypot(p.x - at0.x, p.y - at0.y) < 0.01), 'one where the hero stands');
    const sides = phials.filter((p) => Math.hypot(p.x - at0.x, p.y - at0.y) > 0.01);
    const hand = { x: phials[0].a, y: phials[0].b };
    near(Math.hypot(hand.x - (m.x + T.from[0]), Math.abs(hand.y - m.y) - Math.abs(T.from[1])), 0, 0.05, 'from his left hand');
    const way = { x: at0.x - hand.x, y: at0.y - hand.y };
    const wl = Math.hypot(way.x, way.y);
    for (const p of sides) {
      near(Math.hypot(p.x - at0.x, p.y - at0.y), T.side, 0.01, 'the others to either side of him');
      near(((p.x - at0.x) * way.x + (p.y - at0.y) * way.y) / wl, 0, 0.01, 'across the way they are thrown');
    }
    const across = (p: { x: number; y: number }): number => (p.x - at0.x) * way.y - (p.y - at0.y) * way.x;
    assert.ok(across(sides[0]) * across(sides[1]) < 0, 'one each side');
    // (they smash where they land: he is struck by the one on him, once)
    const more = watch(g, m, T.flight + 0.1);
    assert.equal(s.hurts.length + more.hurts.length, 1, 'the one that lands on him strikes him');
    near(more.hurts[0].t, T.flight - 0.05, 0.05, 'as it lands');
    // (standing in its cloud: his words dark)
    watch(g, m, 0.5);
    assert.ok(g.hushT > 0, 'in a cloud of the Hush: hushed');
    watch(g, m, 1.5);
    assert.ok(g.hushT > HUSH_FOR - 0.1, 'and kept so while he stands in it');
    // (out of it: the Hush runs out)
    h.x += 6;
    watch(g, m, HUSH_FOR + 0.2);
    assert.equal(g.hushT, 0, 'out of it, his words come back as the Hush runs out');
  }
  {
    // (killed with his phials in the air and his clouds lying: they fall no more, and hush no one)
    const { g, m } = room(4, 'physician:tonic');
    watch(g, m, PH_TONIC.hit + 0.2);
    g.kill(m);
    assert.equal(g.perils.filter((p) => p.a1 === 'physician:phial').length, 0, 'his phials in the air fall no more');
    const b = room(4, 'physician:tonic');
    watch(b.g, b.m, PH_TONIC.hit + T.flight + 0.3);
    b.g.hushT = 0;
    b.g.kill(b.m);
    const s = watch(b.g, b.m, 2);
    assert.equal(b.g.hushT, 0, 'his clouds hush no one once he is dead');
    assert.equal(s.hurts.length, 0, 'nothing of his strikes after');
    assert.equal(b.g.perils.filter((p) => p.a1 === 'physician:phial').length, 0, 'and they are gone, thinned away');
  }
});

test('7. ROUNDS: three raps, a ring from each; the patients near him rise, one with each rap; new ones out of the free beds; none to raise, none made', () => {
  const Q = PHYSICIAN.rounds;
  {
    const { g, m } = room(4, 'physician:rounds');
    const h = g.hero;
    // (two patients lying in their beds behind him, two free beds)
    const beds: PropInst[] = [];
    for (let i = 0; i < 4; i++) beds.push(layBed(g, Math.floor(m.x) - 4, Math.floor(m.y) - 3 + 2 * i));
    const lying: Monster[] = [];
    for (let i = 0; i < 2; i++) lying.push(g.spawn('patient', beds[i].x + 0.9, beds[i].y, 9, 0, false, new RNG(70 + i)));
    assert.ok(lying.every((p) => inBed(p) === 1), 'lying in their beds');
    assert.ok(RULES!.can!(g.bosses, m, act('physician:rounds'), 4, true), 'there are patients to raise');
    const rings: number[] = [];
    const rose: number[] = [];
    let began = -1;
    const c = emptyControls();
    for (let k = 0; k < 60 * 5; k++) {
      g.update(1 / 60, c);
      h.life = h.d.maxLife;
      if (began < 0 && m.act?.id === 'physician:rounds') began = k / 60;
      for (const p of g.perils) if (p.a1 === 'physician:ring' && Math.abs(p.t - 1 / 60) < 1e-6) rings.push(k / 60 - began);
      g.monsters.forEach((o, i) => {
        if (o.kind === 'patient' && o.act?.id === 'patient:rise' && rose[i] === undefined) rose[i] = k / 60 - began;
      });
      if (began >= 0 && k / 60 - began > PH_ROUNDS.raps[2] + 2.6) break;
    }
    assert.equal(rings.length, 3, 'a ring of the Hush from each of his three raps');
    rings.forEach((t, i) => near(t, Q.raps[i], 0.05, `the ring of rap ${i + 1}`));
    const patients = g.monsters.filter((o) => o.kind === 'patient' && !o.dead);
    assert.equal(patients.length, Q.n, `as many as he may: two lying, two laid in the free beds (${patients.length})`);
    assert.ok(patients.every((o) => o.a1!.called === m.id), 'his called');
    assert.ok(patients.filter((o) => !lying.includes(o)).every((o) => o.xp === 0), 'those he laid in the beds worth nothing');
    const times = rose.filter((t) => t !== undefined).sort((a, b) => a - b);
    assert.equal(times.length, Q.n, 'every one of them rises');
    assert.ok(times[0] >= Q.raps[0] - 0.05 && times[times.length - 1] >= Q.raps[2] - 0.05, `one with each rap in turn (${times.map((t) => t.toFixed(2)).join(', ')})`);
    // (all on their feet now, and his: no more rounds until some are down)
    m.a1!.rNext = 0;
    for (const b of beds) b.variant = 2;
    assert.ok(!RULES!.can!(g.bosses, m, act('physician:rounds'), 4, true) || patients.length < Q.most, 'no more than he may call');
  }
  {
    // (none to raise: no patients, no beds: he makes no rounds)
    const { g, m } = room(4, 'physician:rounds');
    assert.ok(!RULES!.can!(g.bosses, m, act('physician:rounds'), 4, true), 'nothing to raise: not made');
    const s = watch(g, m, 3);
    assert.equal(s.acts.filter((a) => a.startsWith('physician:rounds')).length, 0, 'and he makes none');
  }
});

test('8. killed in the middle of anything, nothing of his harms the hero after; a long fight throws nothing, and he makes all four', () => {
  for (const [id, far] of [['physician:rap', 1.2], ['physician:draw', 1.8], ['physician:tonic', 4], ['physician:rounds', 4]] as const) {
    for (const when of [0.4, 0.95, 1.6]) {
      const { g, m } = room(far, id);
      setWord(g, 'fire');
      if (id === 'physician:rounds') for (let i = 0; i < 2; i++) layBed(g, Math.floor(m.x) - 4, Math.floor(m.y) - 2 + 2 * i);
      watch(g, m, 6, undefined, () => m.state === 'act' && m.act !== undefined && m.act.t >= when);
      g.kill(m);
      const s = watch(g, m, 6);
      assert.equal(s.hurts.length, 0, `${id}, killed ${when} s in: nothing of his harms the hero after`);
      assert.equal(heldWord(m), null, `${id}, killed ${when} s in: he holds nothing of the hero's`);
      assert.equal(g.hero.skills[0].front[0], 'fire', `${id}, killed ${when} s in: the hero's word his`);
    }
  }
  // (a long fight: every act as it comes, the hero going round him, a word set; patients' beds about)
  const { g, m } = room(4);
  setWord(g, 'fire');
  for (let i = 0; i < 4; i++) layBed(g, Math.floor(m.x) - 5, Math.floor(m.y) - 4 + 2 * i);
  const used = new Set<string>();
  const h = g.hero;
  const cx = m.x;
  const cy = m.y;
  let k = 0;
  watch(g, m, 90, (t) => {
    if (m.act) used.add(m.act.id);
    // (now and then he is struck: a word he holds is beaten out of him)
    if (++k % 30 === 0) hooks(g).damageMonster(m, 10, 'phys', false, 0);
    const a = t * 0.25;
    const r = 1.4 + 2.5 * (0.5 + 0.5 * Math.sin(t * 0.13));
    return t < 0 ? null : { x: cx + Math.cos(a) * r + (h.x - h.x), y: cy + Math.sin(a) * r };
  });
  for (const a of PHYSICIAN_ACTS) assert.ok(used.has(a.id), `he made his ${a.id}`);
});

test('9. what he draws is the enemy\'s and the Hush\'s, never cyan; his size, against his picture', () => {
  const k = keeper();
  const { g, m } = room(3);
  setWord(g, 'frost');
  for (let i = 0; i < 2; i++) layBed(g, Math.floor(m.x) - 4, Math.floor(m.y) - 2 + 2 * i);
  const look = (): void => {
    const { c } = fakeCtx(g, g.time);
    const cc = { ...c, g: k.ctx };
    FX!.ground!(cc, m, null);
    FX!.air!(cc, m, null);
    // (a word flying home takes its own colour as it comes: its own, the friend's, not his)
    for (const p of g.perils) if (p.kind === 'act1' && p.a1 !== 'physician:freed') {
      FX!.ground!(cc, null, p);
      FX!.air!(cc, null, p);
    }
  };
  for (const [id, far] of [['physician:rap', 1.2], ['physician:draw', 1.8], ['physician:tonic', 4], ['physician:rounds', 4]] as const) {
    keep(m, id);
    const until = g.time + 4;
    g.hero.x = m.x + far;
    g.hero.y = m.y;
    while (g.time < until) {
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      if (Math.round(g.time * 60) % 4 === 0) look();
    }
  }
  assert.ok(k.put() > 100, 'he draws');
  for (const col of k.colours) assert.ok(!cyan(col), `nothing cyan: ${col}`);
  // (his size, as tests/first5_bosses.test.ts measures every figure's)
  const size = FIGURE_SIZE.physician;
  assert.deepEqual(size, FIG!.size, 'the game holds the size his pictures give');
  const sp = makeBestiary().of('physician').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let top = 0;
  for (let y = 0; y < p.h && top === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) top = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - top) <= 4, `his top ${size.top}; his picture's ${top}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; his picture reaches ${reach}`);
});
