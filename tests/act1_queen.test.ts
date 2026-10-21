// ACT 1: THE CARRION QUEEN, FLOOR 7'S BOSS, IN THE GAME (game/act1_rules/queen.ts, art/act1_figs/queen.ts,
// render/act1_fx/queen.ts): THE NEW QUEEN ONLY (art/carrion_queen2*.ts; the art chat's post of 16 Oct, 11:32), and the
// main chat's rules.
//
//   1. she is built: the Ledge Road's boss, the new Queen (never the old), her rules, her pictures, her effects;
//   2. her rules' numbers are her pictures' own;
//   3. her death off the edge: the art's own frames, the near rock over what of her has gone below the edge from in
//      front (as its films), and at the last nothing lying there;
//   4. on her eyrie she stands on its edge with the drop behind her, as her death's films have it; dying, she goes
//      over it whichever way she faced;
//   5. she holds her spot (QUEEN_ROAM off): through a long fight she does not leave it; put off it, she hops back;
//      5b. QUEEN_ROAM (his word): she roams her eyrie, a lot, and at the last of her life flies home to her perch;
//   6. her rake, her gust (it drives him back), her dive (out of reach while she is up; where its line is marked),
//      and her call (her flock, never more than a few of it alive);
//   7. nothing she draws is cyan; killed in the middle of anything, nothing of hers is left harming him.
//   run: tsx --test tests/act1_queen.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { FIG, Q2_EDGE, nearRock } from '../src/art/act1_figs/queen';
import { Q2_CANVAS, Q2_SCALE, QUEEN2_ON } from '../src/art/carrion_queen2';
import { Q2_CALL, Q2_DIE, Q2_DIVE, Q2_GUST, Q2_PACE, Q2_RAKE, Q2_REEL, Q2_WALK, queen2MovePainted } from '../src/art/carrion_queen2_moves';
import { GRAIN, toSprite } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { QN, QN_ACTS, QN_GAIT, QN_VIEWS, QUEEN_ROAM, RULES, flockKind, perchOf, viewIndex } from '../src/game/act1_rules/queen';
import { bossKind } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { FX, underRock } from '../src/render/act1_fx/queen';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { paintWithoutCanvas, paintingOf, seasoned, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
const act = (id: string) => QN_ACTS.find((a) => a.id === `queen:${id}`)!;
const ART = FIG!.make();

/** The Ledge Road, for a hero who has been down before. */
function floor7(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = 7;
  g.cleared = 7;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}
interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
/** An empty practice room, the hero still in it, and the Queen `far` tiles to the west of him, awake, facing him, not to be killed; only `only` of her acts ready (null: none). */
function room(far: number, only: string | null): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  (g as unknown as Hooks).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('queen', h.x - far, h.y, -2, 0, false, new RNG(9));
  (g as unknown as Hooks).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.fx = 1;
  m.fy = 0;
  keep(m, only);
  g.events.length = 0;
  return { g, m };
}
function keep(m: Monster, only: string | null): void {
  m.moveCd = QN_ACTS.map((a) => (only && a.id === `queen:${only}` ? 0 : 1e9));
  m.cd = 0;
}
interface Seen {
  hurts: { t: number; n: number }[];
  began: number;
  events: GameEvent[];
}
function watch(g: Game, m: Monster, secs: number, move?: (t: number) => { mx: number; my: number } | null): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const mv = move ? move(k / 60) : null;
    c.mx = mv ? mv.mx : 0;
    c.my = mv ? mv.my : 0;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    if (seen.began < 0 && m.state === 'act') seen.began = (k + 1) / 60;
    seen.events.push(...g.events);
    g.events.length = 0;
  }
  return seen;
}
const firstHurt = (s: Seen): number => (s.hurts.length ? s.hurts[0].t - s.began : -1);

test('1. she is built: the Ledge Road\'s boss, the new Queen (never the old), her rules, her pictures, her effects', () => {
  assert.ok(ACT1.on, 'the descent is on');
  assert.equal(bossKind(7), 'queen', 'floor 7\'s boss is the Carrion Queen');
  assert.ok(RULES && FIG && FX, 'her rules, her pictures, her effects');
  assert.ok(FIG!.heavy, 'a boss: heavy to paint, made for her floor');
  assert.ok(FIG!.switches?.includes(QUEEN2_ON), 'the new Queen\'s switch');
  makeBestiary();
  assert.equal(QUEEN2_ON.on, true, 'on with the descent');
  // (the old one, art/carrion_queen.ts, is in nothing of the game: he had her made again from nothing)
  for (const f of fs.readdirSync('src', { recursive: true })) {
    const name = f.replace(/\\/g, '/');
    if (!name.endsWith('.ts') || name.startsWith('dev') || name === 'art/carrion_queen.ts') continue;
    assert.ok(!/from ['"][^'"]*carrion_queen['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} brings in the old Queen`);
  }
  // (four moves, by his rulebook: her rake, her basic blow; her gust, her dive and her call; and, QUEEN_ROAM, her
  // flight home to her perch at the last of her life, made only then)
  const moves = QN_ACTS.filter((a) => !a.forced);
  assert.equal(moves.length, 4, 'four');
  assert.equal(moves.filter((a) => a.cooldown === 0).length, 1, 'one basic blow');
  assert.deepEqual(QN_ACTS.filter((a) => a.forced).map((a) => a.id), ['queen:home'], 'and her flight home, made only when it must be');
  for (const set of [ART.front, ART.back]) {
    for (const a of QN_ACTS) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 10, `${a.id}: its clip ${a.clip}`);
    }
    assert.ok(set.clips?.reel && set.clips.moves?.fall && set.clips.moves.fall.frames.length > 30, 'struck, and her death (her effects play it)');
    assert.equal(set.clips?.die?.frames.length, 0, 'nothing of her left lying where she fell: she goes down the drop');
    assert.ok(set.walk.length === Q2_WALK.frames, 'her hop');
  }
});

test("2. her rules' numbers are her pictures' own", () => {
  const len = (clip: { frames: unknown[]; fps: number }): number => (clip.frames.length - 1) / clip.fps;
  const moves = ART.front.clips!.moves!;
  for (const a of QN_ACTS) {
    const clip = a.clip === 'attack' ? ART.front.clips!.attack! : moves[a.clip];
    near(a.long, len(clip), 1 / clip.fps + 1e-6, `${a.id}: as long as its picture (to a frame)`);
    if (clip.hit !== undefined) near(a.hit, clip.hit, 1e-6, `${a.id}: its blow at its picture's`);
  }
  near(act('rake').hit, Q2_RAKE.hit, 1e-9, 'the rake');
  near(QN.rake.land, Q2_RAKE.land, 1e-9, 'she comes down on the spot');
  near(act('gust').hit, Q2_GUST.hit, 1e-9, 'the gust');
  near(QN.gust.warnFrom, Q2_GUST.warn, 1e-9, 'its warning');
  near(act('dive').hit, Q2_DIVE.hit, 1e-9, 'the dive');
  near(QN.dive.launch, Q2_DIVE.launch, 1e-9, 'she leaves the rock');
  near(QN.dive.stoop, Q2_DIVE.stoop, 1e-9, 'she stoops');
  near(QN.dive.at, (Q2_DIVE.strikeX * Q2_SCALE) / TILE3, 0.005, 'her talons strike that far along her line');
  assert.ok(QN.dive.up[0] >= Q2_DIVE.launch && QN.dive.up[1] <= Q2_DIVE.hit, 'out of reach only while she is up');
  near(act('call').long, Q2_CALL.long, 1e-9, 'the call');
  assert.ok(QN.call.at >= Q2_CALL.screech[0] && QN.call.at <= Q2_CALL.screech[1], 'her flock comes while she screeches');
  near(len(ART.front.clips!.reel!), Q2_REEL, 1 / 30 + 1e-6, 'struck (to a frame)');
  near(QN.edge, Q2_EDGE, 0.002, 'the edge behind her, as her death\'s films have it');
  near(QN_GAIT.pace, Q2_PACE, 1e-9, 'her pace');
  near(QN_GAIT.cycle, Q2_WALK.frames / Q2_WALK.fps, 1e-9, 'her hop');
  assert.equal(QN_GAIT.setOff + QN_GAIT.halt, 0, 'her round begins and ends as she stands');
  assert.ok(QN_GAIT.trueBack === false, 'from behind as she is painted (art/skin.ts stage, the game\'s back view)');
});

test('3. her death off the edge: the art\'s own frames, played where she went over; the near rock over what has gone below the edge, from in front', () => {
  for (const view of ['front', 'back'] as const) {
    const fall = ART[view].clips!.moves!.fall;
    assert.equal(fall.fps, 20, 'at a death\'s frames a second');
    assert.equal(fall.frames.length, Math.round(Q2_DIE.long * 20) + 1, 'her frames');
    for (let i = 0; i < fall.frames.length; i += 5) {
      const own = toSprite(queen2MovePainted('dying', i / 20, view), null, Q2_CANVAS.ax, Q2_CANVAS.ay);
      assert.equal(unlike(fall.frames[i], own), 0, `${view} ${i / 20} s: the art's frame as it is`);
    }
  }
  // (from in front: what is on this side of the films' edge and has rock under it is left out; what has the drop under it is not)
  const f = ART.front.clips!.moves!.fall.frames[30];
  const p = paintingOf(f);
  const ax = f.ax * GRAIN;
  const ay = f.ay * GRAIN;
  let near = 0;
  let far = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) nearRock(x + 0.5 - ax + Q2_CANVAS.ax, y + 0.5 - ay + Q2_CANVAS.ay) ? near++ : far++;
  assert.ok(near > 100 && far > 100, `she is on both sides of the edge as she falls (${near}, ${far})`);
  const all = new Uint8ClampedArray(p.d);
  underRock(all, p.w, p.h, ax, ay, false, () => true);
  let left = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (all[(y * p.w + x) * 4 + 3]) left++;
  assert.equal(left, far, 'rock all round: what is on this side of the edge is under it; the rest of her is as painted');
  const none = new Uint8ClampedArray(p.d);
  underRock(none, p.w, p.h, ax, ay, false, () => false);
  assert.ok(none.every((v, i) => v === p.d[i]), 'the drop under her: nothing of her is hidden');
  // (her effects play it where she went over, turned over or not as she is)
  const { g, m } = room(4, null);
  g.kill(m);
  const fp = g.perils.find((q) => q.a1 === 'queen:fall');
  assert.ok(fp, 'her fall, where she went over');
  const stood: { s: unknown; d: number }[] = [];
  const ctx: Act1FxCtx = { g: null, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: (d, s) => void stood.push({ s, d }), spot: () => undefined };
  for (let k = 0; k < 130; k++) {
    g.update(1 / 60, emptyControls());
    if (fp!.t < fp!.dur) FX!.standing!(ctx, null, fp!);
  }
  assert.ok(stood.length > 100, 'played');
  assert.ok(!g.perils.includes(fp!), 'and done with');
});

test('4. on her eyrie she stands on its edge with the drop behind her; dying, she goes over it whichever way she faced', () => {
  for (const seed of [3, 17, 29, 5]) {
    const g = floor7(seed);
    const m = g.boss!;
    assert.equal(m.kind, 'queen', `seed ${seed}: the Carrion Queen`);
    const p = perchOf(g.level);
    assert.ok(p && p.views, `seed ${seed}: her spot found`);
    near(Math.hypot(m.x - p!.x, m.y - p!.y), 0, 1e-6, `seed ${seed}: she stands there`);
    // (for each way round of her picture marked so there, the drop behind her as far as her death's films have the edge)
    const L = g.level;
    const f = L.floor;
    for (let i = 0; i < 4; i++) {
      if (!(p!.views & (1 << i))) continue;
      const v = QN_VIEWS[i];
      let D = 0;
      for (let s = 0.05; s < 3.5; s += 0.05) {
        const x = m.x - v.fx * s;
        const y = m.y - v.fy * s;
        if (L.walk[Math.floor(y) * f.w + Math.floor(x)] !== 1) {
          D = s;
          break;
        }
      }
      near(D, QN.edge, QN.edgeGive + 0.06, `seed ${seed}: the drop behind her, facing (${v.fx}, ${v.fy})`);
      // (and past the edge, the drop)
      const bx = m.x - v.fx * (D + 1.2);
      const by = m.y - v.fy * (D + 1.2);
      assert.equal(L.land!.drop![Math.floor(by) * f.w + Math.floor(bx)], 1, `seed ${seed}: past it, the drop`);
    }
    // (killed facing each way: her death is told the way round whose back is to the drop)
    for (let a = 0; a < 8; a++) {
      const g2 = floor7(seed);
      const q = g2.boss!;
      q.fx = Math.cos((a * Math.PI) / 4 + 0.1);
      q.fy = Math.sin((a * Math.PI) / 4 + 0.1);
      g2.kill(q);
      const e = g2.events.find((x) => x.t === 'die' && x.kind === 'queen') as { fx: number; fy: number } | undefined;
      assert.ok(e, 'her death told');
      assert.ok(p!.views & (1 << viewIndex(e!.fx, e!.fy)), `seed ${seed}, facing ${a * 45}°: she falls the way round with the drop at her back`);
      const fp = g2.perils.find((x) => x.a1 === 'queen:fall');
      assert.ok(fp && viewIndex(fp.fx, fp.fy) === viewIndex(e!.fx, e!.fy), `seed ${seed}: her fall played that way round`);
    }
  }
});

test('5. she holds her spot (QUEEN_ROAM off): through a long fight she does not leave it; put off it, she hops back', () => {
  const was = QUEEN_ROAM.on;
  QUEEN_ROAM.on = false;
  try {
    holdsHerSpot();
  } finally {
    QUEEN_ROAM.on = was;
  }
});

test('5b. she roams her eyrie (QUEEN_ROAM, his word): through a long fight she hops from spot to spot, a lot, always on its floor; at the last of her life she flies home to her perch and stays, and the next blow kills her', () => {
  assert.equal(QUEEN_ROAM.on, true, 'on, his word');
  const g = floor7(17);
  const m = g.boss!;
  const h = g.hero;
  const L = g.level;
  const area = L.land!.areas.find((a) => a.role === 'boss')!;
  const RR = Math.max(area.blob.rx, area.blob.ry) * 1.2 + 2.5;
  const perch = perchOf(L)!;
  const x0 = m.x;
  const y0 = m.y;
  h.x = m.x + m.fx * 3;
  h.y = m.y + m.fy * 3;
  // (he is not to fall: one blow of hers can be more than a new hero's whole life, and the fight goes as the floor's
  // making has it, so its every chance: since Version 23.5's bigger packs, a dive of 122 at his 102 on this seed)
  h.d.maxLife = 1e6;
  (g as unknown as Hooks).wakeUp(m);
  m.life = m.maxLife = 1e9;
  const c = emptyControls();
  let acts = 0;
  let was = '';
  let spots = 0;
  let last = { x: m.x, y: m.y };
  let off = 0;
  for (let k = 0; k < 60 * 60; k++) {
    const t = k / 60;
    // (the hero goes round where she began, nearer and further, where the eyrie lets him)
    const r = 2.6 + 1.6 * Math.sin(t * 0.37);
    const x = x0 + Math.cos(t * 0.45) * r;
    const y = y0 + Math.sin(t * 0.45) * r;
    if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] === 1) {
      h.x = x;
      h.y = y;
    }
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    g.events.length = 0;
    const now = m.act ? m.act.id : '';
    if (now && now !== was) acts++;
    was = now;
    // (a spot she has come to and stands on, apart from the last)
    if (!m.act && m.gait?.mode === 'stand' && Math.hypot(m.x - last.x, m.y - last.y) >= QUEEN_ROAM.apart * 0.8) {
      spots++;
      last = { x: m.x, y: m.y };
    }
    if (L.walk[Math.floor(m.y) * L.floor.w + Math.floor(m.x)] !== 1 && !(m.act && m.act.id === 'queen:dive')) off++;
    assert.ok(Math.hypot(m.x - area.blob.x, m.y - area.blob.y) <= RR, `in her eyrie (${m.x.toFixed(2)}, ${m.y.toFixed(2)})`);
    if (g.over) break;
  }
  assert.ok(acts >= 6, `she fought (${acts} moves)`);
  // (since her hops were made fewer and nearer, her fight measured at ten minutes: about one every six seconds)
  assert.ok(spots >= 8, `she moved about a lot: ${spots} spots in a minute`);
  assert.equal(off, 0, 'never off the floor');
  // (struck down to the last of her life: no further, until she is home)
  m.life = m.maxLife = 4000;
  (g as unknown as { damageMonster(m: Monster, n: number, el: string, c: boolean, k: number): void }).damageMonster(m, 3999.5, 'phys', false, -1);
  assert.equal(m.dead, false, 'not killed while she is off her perch');
  assert.equal(m.life, Math.ceil(4000 * QUEEN_ROAM.last), 'her life held at a hundredth of it');
  let home = false;
  for (let k = 0; k < 60 * 6; k++) {
    g.update(1 / 60, emptyControls());
    h.life = h.d.maxLife;
    if (m.act?.id === 'queen:home') home = true;
  }
  assert.ok(home, 'she flies home');
  near(Math.hypot(m.x - perch.x, m.y - perch.y), 0, 0.2, 'onto her perch');
  for (let k = 0; k < 60 * 6; k++) {
    g.update(1 / 60, emptyControls());
    h.life = h.d.maxLife;
  }
  near(Math.hypot(m.x - perch.x, m.y - perch.y), 0, 0.2, 'and stays there');
  (g as unknown as { damageMonster(m: Monster, n: number, el: string, c: boolean, k: number): void }).damageMonster(m, 100, 'phys', false, -1);
  assert.equal(m.dead, true, 'the next blow kills her');
});

function holdsHerSpot(): void {
  const g = floor7(17);
  const m = g.boss!;
  const h = g.hero;
  const x0 = m.x;
  const y0 = m.y;
  h.x = m.x + m.fx * 3;
  h.y = m.y + m.fy * 3;
  (g as unknown as Hooks).wakeUp(m);
  const c = emptyControls();
  let most = 0;
  let acts = 0;
  let was = '';
  const L = g.level;
  for (let k = 0; k < 60 * 60; k++) {
    const t = k / 60;
    // (the hero goes round her, nearer and further, where the eyrie lets him)
    const r = 2.6 + 1.6 * Math.sin(t * 0.37);
    const x = x0 + Math.cos(t * 0.45) * r;
    const y = y0 + Math.sin(t * 0.45) * r;
    if (L.walk[Math.floor(y) * L.floor.w + Math.floor(x)] === 1) {
      h.x = x;
      h.y = y;
    }
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    g.events.length = 0;
    most = Math.max(most, Math.hypot(m.x - x0, m.y - y0));
    const now = m.act ? m.act.id : '';
    if (now && now !== was) acts++;
    was = now;
    if (g.over) break;
  }
  assert.ok(acts >= 6, `she fought (${acts} moves)`);
  // (jostled by the hero and her flock, she is back on her spot at once)
  assert.ok(most <= QN.hold, `she never left her spot (${most.toFixed(3)})`);
  // (put off it)
  m.x += 1.6;
  m.state = 'chase';
  m.act = undefined;
  m.cd = 1;
  let hopped = false;
  for (let k = 0; k < 60 * 4; k++) {
    g.update(1 / 60, emptyControls());
    h.life = h.d.maxLife;
    if (m.gait?.mode === 'walk') hopped = true;
  }
  assert.ok(hopped, 'she hops');
  near(Math.hypot(m.x - x0, m.y - y0), 0, 0.06, 'back onto her spot');
  assert.equal(m.gait?.mode === 'walk', false, 'and stands there');
}

test('6. her rake, her gust, her dive, her call: where and when their pictures say', () => {
  // THE RAKE
  {
    const { g, m } = room(1.8, 'rake');
    const s = watch(g, m, 1.6);
    near(firstHurt(s), Q2_RAKE.hit, 0.04, 'the rake lands as her talons do');
    assert.equal(s.hurts.length, 1, 'once');
  }
  {
    const { g, m } = room(1.8, 'rake');
    const s = watch(g, m, 1.6, (t) => (t > 0.15 && t < 0.62 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'stepped aside, it misses');
  }
  // THE GUST: it drives him back
  {
    const { g, m } = room(2, 'gust');
    const h = g.hero;
    const x0 = h.x;
    const s = watch(g, m, 1.6);
    near(firstHurt(s), Q2_GUST.hit, 0.04, 'the gust strikes as her wings clap');
    assert.ok(h.x - x0 >= 1.8, `and drives him back (${(h.x - x0).toFixed(2)} tiles)`);
  }
  // THE DIVE: along her line; out of reach while she is up
  {
    const { g, m } = room(QN.dive.at, 'dive');
    let unreached = false;
    const c = emptyControls();
    const s: Seen = { hurts: [], began: -1, events: [] };
    for (let k = 0; k < 60 * 2.4; k++) {
      const before = g.hero.life;
      g.update(1 / 60, c);
      if (g.hero.life < before) s.hurts.push({ t: (k + 1) / 60, n: before - g.hero.life });
      g.hero.life = g.hero.d.maxLife;
      if (s.began < 0 && m.state === 'act') s.began = (k + 1) / 60;
      if (m.act && m.act.t > 0.5 && m.act.t < 0.8 && !RULES!.reachable!(m)) unreached = true;
    }
    near(firstHurt(s), Q2_DIVE.hit, 0.04, 'the dive strikes as her talons do');
    assert.equal(s.hurts.length, 1, 'once');
    assert.ok(unreached, 'up out of sight, nothing reaches her');
  }
  {
    const { g, m } = room(QN.dive.at, 'dive');
    const s = watch(g, m, 2.4, (t) => (t > 0.3 && t < 0.95 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'out of her line in time, she misses');
  }
  // THE CALL: her flock; never more than a few of it alive
  {
    const { g, m } = room(6, 'call');
    const s = watch(g, m, 2);
    const kind = flockKind();
    const flock = g.monsters.filter((o) => !o.dead && o.kind === kind && o.packId === m.packId);
    assert.ok(flock.length >= 2 && flock.length <= QN.call.most, `her flock comes (${flock.length} ${kind})`);
    assert.ok(s.events.some((e) => e.t === 'msg' && /calls her flock/.test(e.text)), 'told');
    for (let n = 0; n < 4; n++) {
      keep(m, 'call');
      watch(g, m, 2.2);
    }
    assert.ok(g.monsters.filter((o) => !o.dead && o.kind === kind && o.packId === m.packId).length <= QN.call.most, 'never more than a few of it');
  }
});

test('7. nothing she draws is cyan; killed in the middle of anything, nothing of hers is left harming him', () => {
  const colors = new Set<string>();
  const target: Record<string, unknown> = { globalAlpha: 1 };
  const cv = new Proxy(target, {
    get: (o, k: string) => (k in o ? o[k] : () => undefined),
    set: (o, k: string, v) => {
      if ((k === 'fillStyle' || k === 'strokeStyle') && typeof v === 'string') colors.add(v);
      o[k] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  for (const id of ['dive', 'gust']) {
    const { g, m } = room(3, id);
    const ctx: Act1FxCtx = { g: cv, at: (x, y) => [(x - y) * 16, (x + y) * 8], game: g, t: 0, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined };
    for (let k = 0; k < 60 * 1.5; k++) {
      g.update(1 / 60, emptyControls());
      g.hero.life = g.hero.d.maxLife;
      ctx.t = k / 60;
      FX!.ground!(ctx, m, null);
    }
  }
  assert.ok(colors.size >= 2, `she drew her warnings (${[...colors].join(' ')})`);
  for (const c of colors) {
    const n = parseInt(c.slice(1, 7), 16);
    assert.ok(!(((n >> 16) & 255) < 120 && ((n >> 8) & 255) > 140 && (n & 255) > 140), `no cyan: ${c}`);
  }
  // (killed in the middle of her moves)
  for (const id of ['gust', 'dive', 'call', 'rake']) {
    for (const when of [0.3, 0.7, 1.1]) {
      const { g, m } = room(3, id);
      for (let k = 0; k < 300 && !(m.state === 'act' && m.act && m.act.t >= when); k++) g.update(1 / 60, emptyControls());
      g.kill(m);
      const kind = flockKind();
      for (const o of g.monsters) if (o.kind === kind) o.dead = true;
      const s = watch(g, m, 4);
      assert.equal(s.hurts.length, 0, `${id}, killed ${when} s in: nothing of hers harms him after`);
    }
  }
  // (her size, as the game goes by it: her stand)
  const sp = ART.front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  near(FIGURE_SIZE.queen.top, head, 4, 'her top');
  assert.equal(FIGURE_SIZE.queen.top, FIG!.size.top, 'the game goes by her own');
});
