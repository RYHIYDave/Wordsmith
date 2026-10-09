// Tests for BIG AND WILD (art/moves3.ts WILD, render/wild.ts: a mock-up behind a switch that is off;
// the art chat, 8 Oct 2026). The owner, by 20:14: "i think we need to amend the rules for effects and
// animations change it to big and wild.  why dont you redo the WAVE animation as big and wild as you
// think is appropriate and ill tell you if it needs to go more or less wild". Then Strike and Shot,
// each hero in his own way (20:49: "show me strike and shot the same way, big and wild"; of the first
// try: "Each character has a style, the crackling works for the mage, but not the warrior."), with
// his notes on the second: the first swing ends with the sword held up, a second tap swipes back from
// there, and with none he lowers it into his stance; what flies off a hit is the struck's ("I'd rather
// have bone fragments or dust from the skeletons, or yellow sparks hitting an armored target"); and
// the ranger's blue becomes wind ("Can we make the blue effects just like wind instead of energy?").
//   run: tsx --test tests/wild.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { Clip } from '../src/art/actor_types';
import { makeHeroArt3, paintMove3 } from '../src/art/heroes3';
import { COMBO_MENDS, MAGE_BODY, MAGE_STANCES, MOVES3, RANGER_STANCES, SHOT3, SLASH3, STRIKE3, WILD, useMageStances, useRangerStances, useWild } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { bonesAt, project, solve } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { P } from '../src/art/palette';
import { COMBO, SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { Figure } from '../src/render/figure';
import { AIR, CRACKLE, LEAP_LIFT } from '../src/render/wild';
import type { WildWorld } from '../src/render/wild';
import { Fx } from '../src/render/fx';
import { paintWithoutCanvas, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
// (the figure's frames are painted here, where there is no canvas)
paintWithoutCanvas();
const assert: Assert = nodeAssert;

const wave = (): string => JSON.stringify({ rest: MOVES3.wave.rest, motion: MOVES3.wave.motion });
const TODAY = wave();
useMageStances(true);
const GUARDED = wave();
useMageStances(false);
const FR = 1 / 30;

/** With these switches on for a moment, and both off again after. */
const with_ = (stances: boolean, wild: boolean, fn: () => void): void => {
  useMageStances(stances);
  useWild(wild);
  try {
    fn();
  } finally {
    useWild(false);
    useMageStances(false);
  }
};

test('the switch is off, and the Wave is today\'s, or from her guard with her stances, as it was', () => {
  assert.equal(WILD.on, false);
  assert.equal(MAGE_STANCES.on, false);
  assert.equal(wave(), TODAY);
  with_(true, false, () => assert.equal(wave(), GUARDED));
});

test('switched on and off again, the Wave is as it was exactly; without her stances it is today\'s even with the switch on', () => {
  with_(true, true, () => assert.ok(wave() !== GUARDED, 'the wild Wave is its own'));
  assert.equal(wave(), TODAY);
  with_(false, true, () => assert.equal(wave(), TODAY, 'the wild Wave is cast from her guard'));
  // (and whichever switch goes first)
  useWild(true);
  useMageStances(true);
  const both = wave();
  useMageStances(false);
  useWild(false);
  with_(true, true, () => assert.equal(wave(), both));
  assert.equal(wave(), TODAY);
});

test('the wild Wave lands when the rules let it go, is over before their attack is, and goes from her guard to her guard', () => {
  with_(true, true, () => {
    const m = MOVES3.wave;
    const keys = m.motion.keys;
    assert.equal(m.motion.hit, 5 * FR);
    const end = keys[keys.length - 1].at;
    assert.ok(end <= SKILLS.wave.windup + SKILLS.wave.follow + 1e-9, `it ends at ${end.toFixed(3)} s`);
    assert.equal(JSON.stringify(keys[0].pose), '{}');
    assert.equal(JSON.stringify(keys[keys.length - 1].pose), '{}');
    // (the crystal burns hottest as it is let go, and her coat is thrown back by it)
    const at = bonesAt(keys, m.rest, m.motion.hit as number);
    assert.ok(at.draw >= 2.9 && at.gale >= 1.5, `draw ${at.draw.toFixed(2)}, gale ${at.gale.toFixed(2)}`);
  });
});

test('her feet grip the floor all through it: the front foot stays put, and the back one turns on its ball no more than in the Wave he said yes to', () => {
  /** The most the front foot (heel or toe) and the back foot's toe move over the floor in her Wave as it is now. */
  const feet = (): [number, number] => {
    const m = MOVES3.wave;
    const end = m.motion.keys[m.motion.keys.length - 1].at;
    const at = (t: number) => solve(MAGE_BODY, bonesAt(m.motion.keys, m.rest, t));
    const s0 = at(0);
    let front = 0;
    let back = 0;
    for (let i = 0; i <= 60; i++) {
      const s = at((end * i) / 60);
      front = Math.max(front, Math.hypot(s.toeL[0] - s0.toeL[0], s.toeL[1] - s0.toeL[1]), Math.hypot(s.heelL[0] - s0.heelL[0], s.heelL[1] - s0.heelL[1]));
      back = Math.max(back, Math.hypot(s.toeR[0] - s0.toeR[0], s.toeR[1] - s0.toeR[1]));
    }
    return [front, back];
  };
  let yes: [number, number] = [0, 0];
  with_(true, false, () => (yes = feet()));
  with_(true, true, () => {
    const [front, back] = feet();
    assert.ok(front < 0.6, `the front foot moves ${front.toFixed(2)} picture px`);
    // (turning on its ball, the tip of the back foot goes round: as far as in the Wave of 19:19, and no further)
    assert.ok(back <= yes[1] + 0.01, `the back foot's toe moves ${back.toFixed(2)} (in the Wave he said yes to, ${yes[1].toFixed(2)})`);
  });
});

test('the mage\'s pictures say where her crystal burns and how hot; the others\' say nothing', () => {
  with_(true, false, () => {
    const c = paintMove3(MOVES3.mstand, 0, 'front').charge;
    assert.ok(c !== undefined && c.heat > 1 && c.heat < 1.6, `in her guard it burns ${c?.heat}`);
  });
  with_(true, true, () => {
    const c = paintMove3(MOVES3.wave, 5 * FR, 'front').charge;
    assert.ok(c !== undefined && c.heat >= 2.9, `as the Wave goes it burns ${c?.heat}`);
  });
  assert.equal(paintMove3(MOVES3.rear, 0, 'front').charge, undefined);
});

test('the effects add nothing with the switch off; with it on, the Wave is let go with bolts, and its crystal crackles', () => {
  const play = (): void => {};
  const fx = new Fx();
  fx.handle([{ t: 'wave', x: 5, y: 5, dx: 1, dy: 0, w: 1, el: 'phys', words: [], echo: false }], play);
  fx.charge(5, 5, 20, 3, 1, 0);
  fx.update(1 / 30);
  assert.equal(fx.wild.arcs.length, 0);
  const shake = fx.shake;
  useWild(true);
  try {
    const on = new Fx();
    on.handle([{ t: 'wave', x: 5, y: 5, dx: 1, dy: 0, w: 1, el: 'phys', words: [], echo: false }], play);
    on.update(1 / 30);
    assert.ok(on.wild.arcs.some((a) => a.bolt), 'bolts shoot out');
    assert.ok(on.shake > shake, 'the screen kicks');
    const still = new Fx();
    for (let i = 0; i < 10; i++) {
      still.charge(5, 5, 20, 3, 1, 0);
      still.update(1 / 30);
    }
    assert.ok(still.wild.arcs.length > 0, 'the crystal crackles');
  } finally {
    useWild(false);
  }
});

// ---- STRIKE AND SHOT, EACH IN HIS OWN WAY ----

const swings = (): string => JSON.stringify([STRIKE3.motion, SLASH3.motion, STRIKE3.tail ?? null, SLASH3.tail ?? null, STRIKE3.poise ?? null]);
const shot = (): string => JSON.stringify({ rest: SHOT3.rest, motion: SHOT3.motion });
const unit = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
/** The angle between two directions, in degrees. */
const ang = (a: V3, b: V3): number => {
  const p = unit(a);
  const q = unit(b);
  return (Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))) * 180) / Math.PI;
};
/** Which way the blade points in a move at `t`. */
const blade = (m: Move3, t: number): V3 => solve(m.build, bonesAt(m.motion.keys, m.rest, t)).point;

test('Strike and Shot with the switch off are as the game has them (the mended swings; his Shot, as it was or from his crouch), and exactly so after it is switched on and off, in either order', () => {
  assert.equal(COMBO_MENDS.on, true);
  // (his stances are the game's own since Version 19.4: put aside here, to see his Shot as it was too, and put back after)
  assert.equal(RANGER_STANCES.on, true);
  useRangerStances(false);
  try {
    const mended = swings();
    const today = shot();
    useRangerStances(true);
    const low = shot();
    useRangerStances(false);
    useWild(true);
    try {
      assert.ok(swings() !== mended, 'the wild swings are their own');
      assert.equal(STRIKE3.tail, true);
      assert.equal(SLASH3.tail, true);
      assert.equal(shot(), today, 'without his stances his Shot is as it was, even with the switch on');
      useRangerStances(true);
      assert.ok(shot() !== low, 'from his crouch the wild Shot is its own');
    } finally {
      useRangerStances(false);
      useWild(false);
    }
    assert.equal(swings(), mended);
    assert.equal(STRIKE3.tail, undefined);
    assert.equal(STRIKE3.poise, undefined);
    assert.equal(shot(), today);
    // (and whichever switch goes first)
    useRangerStances(true);
    useWild(true);
    const both = shot();
    useWild(false);
    assert.equal(shot(), low);
    useWild(true);
    useRangerStances(false);
    useRangerStances(true);
    assert.equal(shot(), both);
    useWild(false);
    useRangerStances(false);
    assert.equal(shot(), today);
  } finally {
    useRangerStances(true);
  }
});

test('the first wild swing lands when it did and holds the sword up past the rules\' attack; the second begins from just there, its blow as quick as before', () => {
  const mended = { strike: MOVES3.strike.motion.hit, slash: MOVES3.kslash.motion.hit };
  useWild(true);
  try {
    const s = MOVES3.strike;
    const k = MOVES3.kslash;
    assert.equal(s.motion.hit, mended.strike, 'the first blow lands when it did');
    assert.equal(k.motion.hit, mended.slash, 'and the second as quickly as before');
    const up = s.motion.keys.find((q) => Math.abs(q.at - 8 * FR) < 1e-9);
    assert.ok(up !== undefined, 'the sword is up by the eighth frame');
    // (where the picture has got to when the rules' attack is over: its blow, then the rules' follow-through at its own pace)
    const over = (s.motion.hit as number) + SKILLS.strike.follow;
    const poise = s.poise as number;
    assert.ok(poise !== undefined && over <= poise + 1e-9 && poise > (up as { at: number }).at, `it holds at ${(poise / FR).toFixed(1)} frames; the rules are over at ${(over / FR).toFixed(1)}`);
    const hold = s.motion.keys.find((q) => Math.abs(q.at - poise) < 1e-9);
    assert.ok(hold !== undefined, 'a key where it holds');
    assert.equal(JSON.stringify(k.motion.keys[0].pose), JSON.stringify((hold as { pose: unknown }).pose), 'the second swing begins from the sword as it is held up');
    // (all through the hold the blade points as the second swing begins, near enough)
    const from = blade(k, 0);
    for (let t = (up as { at: number }).at; t <= poise + 1e-9; t += FR / 2) assert.ok(ang(blade(s, t), from) < 4, `at ${(t / FR).toFixed(1)} frames the blade is ${ang(blade(s, t), from).toFixed(1)} degrees off`);
    // (the first swing is lowered into his guard: its last pose is the stance)
    assert.equal(JSON.stringify(s.motion.keys[s.motion.keys.length - 1].pose), '{}');
    assert.equal(JSON.stringify(k.motion.keys[k.motion.keys.length - 1].pose), '{}');
  } finally {
    useWild(false);
  }
});

test('as the figure shows it: the sword held up for as long as a second swing may come, then lowered into his guard; with the switch off, neither', () => {
  const DTF = 1 / 60;
  const off = makeHeroArt3().of('warrior', { twoHanded: true });
  assert.equal(off.front.clips?.attack?.tail, undefined);
  assert.equal(off.front.clips?.attack?.poise, undefined);
  useWild(true);
  try {
    const art = makeHeroArt3().of('warrior', { twoHanded: true });
    const strike = art.front.clips?.attack as Clip;
    const slash = art.front.clips?.attack2 as Clip;
    assert.equal(strike.tail, true);
    assert.equal(slash.tail, true);
    assert.ok(strike.poise !== undefined && Math.abs(strike.poise - 15 * FR) < 1e-9, `it holds at ${strike.poise}`);
    assert.equal(slash.poise, undefined, 'the second swing goes straight on into his guard');
    const at = (anim: string, age: number, poised: boolean) => ({ anim, animT: 0, fx: 1, fy: 0, attackSkill: 0, attackAge: age, attackWind: 0.12, leapK: -1, poised });
    const play = (poisedFor: number): { held: number; lowered: number; stands: boolean } => {
      const fig = new Figure();
      for (let age = 0; age < SKILLS.strike.windup + SKILLS.strike.follow; age += DTF) fig.frame(art, at('attack', age, true), DTF, 0, 0, false);
      // (the picture it holds: the figure's own choice of frame for that moment, render/figure.ts frameOf)
      const hold = strike.frames[Math.min(strike.frames.length - 1, Math.floor((strike.poise as number) * strike.fps + 1e-6))];
      let held = 0;
      let lowered = 0;
      let last = null as unknown;
      for (let i = 0; i < 180; i++) {
        const s = fig.frame(art, at('idle', 0, i * DTF < poisedFor), DTF, 0, 0, false);
        if (s === hold) held++;
        else if (strike.frames.includes(s)) lowered++;
        last = s;
      }
      return { held, lowered, stands: art.front.idle.includes(last as never) };
    };
    // (a second swing may come for a second: he holds the sword up all that while, then lowers it)
    const wait = play(1);
    assert.ok(wait.held >= 55, `held up for ${wait.held} sixtieths`);
    assert.ok(wait.lowered >= 10, `and lowered over ${wait.lowered}`);
    assert.ok(wait.stands, 'and then he stands in his guard');
    // (none may come: straight on into his guard, holding only as the picture passes the sword up)
    const none = play(0);
    assert.ok(none.held <= 3, `held up for ${none.held} sixtieths`);
    assert.ok(none.stands);
    // (and the second swing's first picture is the one held: no jump into it. The same pose; only the
    // hem of his tabard, which swings as he moves, hangs a little differently: 47 picture pixels, of
    // the figure's 1,840)
    const hold = strike.frames[Math.min(strike.frames.length - 1, Math.floor((strike.poise as number) * strike.fps + 1e-6))];
    const into = unlike(hold, slash.frames[0]);
    assert.ok(into <= 60, `the held picture and the second swing's first differ by ${into} picture pixels`);
  } finally {
    useWild(false);
  }
});

/**
 * The game plays Strike at 60 steps a second (taps at `taps` seconds), its own step included, and
 * the figure shows it as render/figure.ts does: the attack, then its end while he stands, held while
 * a second swing may still come. How far a foot on the floor moves, in game pixels, how short a leg
 * falls, how many swings there were, and how long the sword was held up.
 */
function played(taps: number[], seconds: number, view: 'front' | 'back'): { slide: number; short: number; swings: number; held: number } {
  const face: [number, number] = view === 'back' ? [0, -1] : [1, 0];
  const game = Game.forPractice('warrior', 3);
  (game as unknown as { waveT: number }).waveT = 1e9;
  game.monsters.length = 0;
  const h = game.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = face[0];
  h.fy = face[1];
  const x0 = h.x;
  const y0 = h.y;
  const dt = 1 / 60;
  let order = false;
  let lastAge = 1e9;
  let swings = 0;
  let held = 0;
  let tail: { move: string; at: number; since: number } | null = null;
  const marks: Record<string, { on: boolean; start: [number, number] }> = {};
  let slide = 0;
  let short = 0;
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    const t = i * dt;
    const c = emptyControls();
    c.aimX = h.x + face[0] * 2;
    c.aimY = h.y + face[1] * 2;
    for (const when of taps) if (t <= when && t + dt > when) order = true;
    if (order) c.fire = true;
    game.update(dt, c);
    if (h.anim === 'attack' && h.attackAge < lastAge) {
      swings++;
      order = false;
    }
    lastAge = h.anim === 'attack' ? h.attackAge : 1e9;
    let move = 'rear';
    let tc = 0;
    if (h.anim === 'attack') {
      move = h.combo === 1 ? 'kslash' : 'strike';
      const m = MOVES3[move];
      const hit = m.motion.hit ?? 0;
      tc = h.attackAge < h.attackWind ? (h.attackAge / h.attackWind) * hit : hit + (h.attackAge - h.attackWind);
      tail = m.tail ? { move, at: tc, since: -1 } : null;
    } else if (tail) {
      const m = MOVES3[tail.move];
      tail.since = tail.since < 0 ? 0 : tail.since + dt;
      if (m.poise !== undefined && h.combo === 0 && h.comboT > 0 && tail.at + tail.since > m.poise) {
        tail.since = Math.max(0, m.poise - tail.at);
        held += dt;
      }
      if (tail.at + tail.since < m.motion.keys[m.motion.keys.length - 1].at) {
        move = tail.move;
        tc = tail.at + tail.since;
      } else tail = null;
    }
    const m = MOVES3[move];
    const end = m.motion.keys[m.motion.keys.length - 1].at;
    const tm = Math.min(end, Math.max(0, Math.floor(tc * 30 + 1e-6)) / 30);
    const q = bonesAt(m.motion.keys, m.rest, tm);
    const s = solve(m.build, q);
    const B = m.build;
    short = Math.max(short, Math.hypot(s.ankleL[0] - q.lfx, s.ankleL[1] - (B.stance + q.lfy), s.ankleL[2] - (B.ankle + q.lfz)), Math.hypot(s.ankleR[0] - q.rfx, s.ankleR[1] - (-B.stance + q.rfy), s.ankleR[2] - (B.ankle + q.rfz)));
    const ax = (h.x - x0 - (h.y - y0)) * 16;
    const ay = (h.x - x0 + (h.y - y0)) * 8;
    for (const [nm, toe, heel] of [['L', s.toeL, s.heelL], ['R', s.toeR, s.heelR]] as const) {
      const p = project(toe as V3, view);
      const sx = ax + p[0] / 2;
      const sy = ay + p[1] / 2;
      const on = Math.min(toe[2], heel[2]) < 0.5;
      const key = `${swings}${nm}`;
      const k = marks[key] ?? (marks[key] = { on: false, start: [0, 0] });
      if (on && !k.on) k.start = [sx, sy];
      if (on) slide = Math.max(slide, Math.hypot(sx - k.start[0], sy - k.start[1]));
      k.on = on;
    }
  }
  return { slide, short, swings, held };
}

test('his feet grip the floor through the wild swings as the game plays them: both swings, the second from the sword held up; and one swing, held and lowered', () => {
  COMBO.on = true;
  useWild(true);
  try {
    for (const view of ['front', 'back'] as const) {
      // (two taps, the second as soon as the game swings again: it comes while the sword is held up)
      const two = played([0.3, 1.25], 2.6, view);
      assert.equal(two.swings, 2, `${view}: the combo's two swings`);
      assert.ok(two.held > 0.1, `${view}: the sword held up until the second came (${two.held.toFixed(2)} s)`);
      assert.ok(two.slide < 1, `${view}: a foot on the floor moved ${two.slide.toFixed(2)} game px`);
      assert.ok(two.short < 0.05, `${view}: a leg falls short of its foot by ${two.short.toFixed(3)}`);
      // (one tap: held up while a second may come, then lowered into his guard)
      const one = played([0.3], 2.6, view);
      assert.equal(one.swings, 1);
      assert.ok(one.held > 0.5, `${view}: held up for ${one.held.toFixed(2)} s`);
      assert.ok(one.slide < 1, `${view}: a foot on the floor moved ${one.slide.toFixed(2)} game px`);
      assert.ok(one.short < 0.05, `${view}: a leg falls short of its foot by ${one.short.toFixed(3)}`);
    }
  } finally {
    useWild(false);
  }
});

test('what flies off a hit is the struck\'s: bone off a skeleton, yellow sparks off armour, never the blade\'s blue; the arrow goes in a gust of air and trails it', () => {
  const play = (): void => {};
  const BLUE = new Set([CRACKLE[1], CRACKLE[2], CRACKLE[3]]);
  const blow = (kind: 'skeleton' | 'brute', champion: boolean): Fx => {
    const fx = new Fx();
    fx.wild.see([{ x: 6, y: 5, kind, champion }], 0);
    fx.handle([{ t: 'swing', x: 5, y: 5, dx: 1, dy: 0, reach: 1.7, el: 'phys', words: [], echo: false }], play);
    fx.particles.length = 0;
    fx.flashes.length = 0;
    fx.rings.length = 0;
    const cuts = fx.slashes.length;
    fx.handle([{ t: 'hit', x: 6, y: 5, amount: 10, crit: false, el: 'phys', onHero: false }], play);
    for (const p of fx.particles) assert.ok(!BLUE.has(p.color), `nothing blue flies off it: ${p.color}`);
    for (const f of fx.flashes) assert.ok(!f.colors.some((c) => BLUE.has(c)), `its burst is not blue: ${f.colors}`);
    for (const r of fx.rings) assert.ok(!r.colors.some((c) => BLUE.has(c)), `nor its ring: ${r.colors}`);
    for (const c of fx.slashes.slice(cuts)) assert.ok(!c.colors.some((k) => BLUE.has(k)), `nor the cut across it: ${c.colors}`);
    return fx;
  };
  useWild(true);
  try {
    const bone = blow('skeleton', false).particles.map((p) => p.color);
    assert.ok(bone.includes('#f0e8ff'), 'bone flies off a skeleton');
    assert.ok(!bone.includes(P.gd4) && !bone.includes(P.gd5), 'and no sparks');
    const steel = blow('brute', true).particles.map((p) => p.color);
    assert.ok(steel.includes(P.gd5) || steel.includes(P.gd4), 'yellow sparks fly off an armoured guardian');
    // (the arrow: a gust and hoops of air at the bow, and a trail of air; nothing blue)
    const fx = new Fx();
    fx.wild.see([{ x: 9, y: 5, kind: 'skeleton', champion: false }], 0);
    fx.follow([{ x: 5, y: 5, vx: 10, vy: 0, hostile: false, words: [], element: 'phys', n: 0, look: 'arrow' }], 1);
    const wild = fx.wild as unknown as { tracers: unknown[]; rings: unknown[] };
    assert.equal(wild.tracers.length, 1, 'its trail of air');
    assert.equal(wild.rings.length, 2, 'two hoops of air');
    assert.ok(fx.particles.some((p) => AIR.includes(p.color)), 'lines of wind');
    for (const p of fx.particles) assert.ok(!BLUE.has(p.color), `nothing blue at the loose: ${p.color}`);
    fx.particles.length = 0;
    fx.follow([{ x: 9, y: 5, vx: 10, vy: 0, hostile: false, words: [], element: 'phys', n: 0, look: 'arrow' }], 1);
    fx.handle([{ t: 'hit', x: 9, y: 5, amount: 10, crit: false, el: 'phys', onHero: false }], play);
    assert.ok(fx.particles.some((p) => p.color === '#f0e8ff'), 'it knocks bone off the skeleton');
    for (const p of fx.particles) assert.ok(!BLUE.has(p.color), `nothing blue where it strikes: ${p.color}`);
  } finally {
    useWild(false);
  }
});

// ---- THE REST OF THE SKILLS (the owner, 9 Oct 2026, 00:05: "let's reimagine the rest of the
// animations for the main skills using the new rules"; Slam, Familiar and Beam left for now) ----

test('the rest of the skills, big and wild: nothing with the switch off; with it on, each in its hero\'s way, and nothing in the enemy\'s colours', () => {
  const play = (): void => {};
  const world = (o: Partial<WildWorld> = {}): WildWorld => ({ hero: { x: 5, y: 5, fx: 1, fy: 0, move: null }, orbs: [], volleys: [], traps: [], ...o });
  const leapMove = { kind: 'leap', t: 0.05, dur: 0.38, x0: 5, y0: 5, x1: 8, y1: 5 };
  const SKILL_EVENTS: Record<string, (fx: Fx) => void> = {
    whirlwind: (fx) => {
      fx.wild.see([{ x: 6, y: 5, kind: 'skeleton', champion: false }], 0, world());
      fx.handle([{ t: 'channel', kind: 'whirl', x: 5, y: 5, el: 'phys' }, { t: 'burst', x: 5, y: 5, r: 2, el: 'phys', style: 'whirl' }], play);
      for (let i = 0; i < 6; i++) fx.update(1 / 30);
      fx.handle([{ t: 'hit', x: 6, y: 5, amount: 10, crit: false, el: 'phys', onHero: false }, { t: 'channelEnd', kind: 'whirl', x: 5, y: 5, el: 'phys', part: 1 }], play);
    },
    leap: (fx) => {
      fx.wild.see([{ x: 8.5, y: 5, kind: 'skeleton', champion: false }], 0, world({ hero: { x: 5.5, y: 5, fx: 1, fy: 0, move: leapMove } }));
      for (let i = 0; i < 4; i++) fx.update(1 / 30);
      fx.handle([{ t: 'burst', x: 8, y: 5, r: 1.6, el: 'phys', style: 'land' }, { t: 'hit', x: 8.5, y: 5, amount: 10, crit: false, el: 'phys', onHero: false }], play);
    },
    volley: (fx) => {
      fx.wild.see([{ x: 9, y: 5, kind: 'skeleton', champion: false }], 0, world({ volleys: [{ id: 1, x: 9, y: 5, r: 2.2, t: 0.1 }] }));
      fx.handle([{ t: 'volleyUp', x: 5, y: 5, tx: 9, ty: 5, r: 2.2, el: 'phys', words: [], echo: false }, { t: 'volleyDrop', x: 9, y: 5, el: 'phys', words: [], n: 0, echo: false, in: 0.2 }, { t: 'volleyFall', x: 9, y: 5, el: 'phys', words: [], n: 0, echo: false, hits: 1 }], play);
      for (let i = 0; i < 6; i++) fx.update(1 / 30);
    },
    trap: (fx) => {
      fx.wild.see([], 0, world({ hero: { x: 5, y: 5, fx: -1, fy: 0, move: { kind: 'roll', t: 0.05, dur: 0.24, x0: 6, y0: 5, x1: 3, y1: 5 } }, traps: [{ x: 6, y: 5 }] }));
      for (let i = 0; i < 3; i++) fx.update(1 / 30);
      fx.handle([{ t: 'trapSet', x: 6, y: 5, el: 'phys' }, { t: 'burst', x: 6, y: 5, r: 2, el: 'phys', style: 'blast' }], play);
      for (let i = 0; i < 3; i++) fx.update(1 / 30);
    },
    orb: (fx) => {
      fx.wild.see([{ x: 9.5, y: 5, kind: 'skeleton', champion: false }], 0, world({ orbs: [{ id: 1, x: 9, y: 5, t: 0.5, life: 5 }] }));
      fx.handle([{ t: 'orbSet', x: 9, y: 5, r: 2.2, el: 'phys', words: [] }, { t: 'burst', x: 9, y: 5, r: 2.2, el: 'phys', style: 'nova' }], play);
      for (let i = 0; i < 6; i++) fx.update(1 / 30);
    },
    warp: (fx) => {
      fx.wild.see([], 0, world());
      fx.handle([{ t: 'burst', x: 5, y: 5, r: 0.8, el: 'frost', style: 'warp' }, { t: 'burst', x: 9, y: 5, r: 0.8, el: 'frost', style: 'warp' }, { t: 'burst', x: 9, y: 5, r: 1.6, el: 'phys', style: 'nova' }], play);
      for (let i = 0; i < 3; i++) fx.update(1 / 30);
    },
  };
  /** How much is on the screen: particles, flashes, rings and cuts, and the effects' own arcs and the like. */
  const amount = (fx: Fx): number => {
    const w = fx.wild as unknown as { arcs: unknown[]; vortices: unknown[]; twisters: unknown[]; hoops: unknown[] };
    return fx.particles.length + fx.flashes.length + fx.rings.length + fx.slashes.length + w.arcs.length + w.vortices.length + w.twisters.length + w.hoops.length;
  };
  const ENEMY = new Set(['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0', '#ff3a78']);
  const off: Record<string, Fx> = {};
  for (const [name, go] of Object.entries(SKILL_EVENTS)) {
    const fx = new Fx();
    go(fx);
    const w = fx.wild as unknown as { arcs: unknown[]; vortices: unknown[]; twisters: unknown[]; hoops: unknown[] };
    assert.equal(w.arcs.length + w.vortices.length + w.twisters.length + w.hoops.length, 0, `${name}: nothing of the effects' own with the switch off`);
    off[name] = fx;
  }
  useWild(true);
  try {
    const on: Record<string, Fx> = {};
    for (const [name, go] of Object.entries(SKILL_EVENTS)) {
      const fx = new Fx();
      go(fx);
      on[name] = fx;
      assert.ok(amount(fx) > amount(off[name]) * 1.5, `${name}: big and wild (${amount(fx)} things on the screen, against ${amount(off[name])})`);
      for (const p of fx.particles) assert.ok(!ENEMY.has(p.color.toLowerCase()), `${name}: nothing in the enemy's colours (${p.color})`);
    }
    // (the crackle is the mage's alone; the warrior's are the blade and dust, the ranger's wind)
    for (const name of ['whirlwind', 'leap', 'volley', 'trap']) assert.equal(on[name].wild.arcs.length, 0, `${name}: no crackle`);
    for (const name of ['orb', 'warp']) assert.ok(on[name].wild.arcs.some((a) => a.bolt), `${name}: bolts`);
    const dust = (fx: Fx): boolean => fx.particles.some((p) => ([P.st6, P.st5, P.st4] as string[]).includes(p.color));
    const wind = (fx: Fx): boolean => fx.particles.some((p) => AIR.includes(p.color));
    for (const name of ['whirlwind', 'leap']) assert.ok(dust(on[name]), `${name}: dust kicked up`);
    for (const name of ['volley', 'trap']) assert.ok(wind(on[name]), `${name}: wind`);
    // (the leap lands with a freeze, the floor cracked cold round it; it goes higher; the trap goes off in a whirlwind)
    assert.ok(on.leap.freeze >= 0.09, 'the leap lands with a freeze');
    assert.ok(on.leap.cracks.length > 0 && on.leap.cracks.every((c) => c.hot === 0), 'the floor cracks, cold');
    assert.ok(LEAP_LIFT > 24, 'he leaps higher');
    assert.equal((on.trap.wild as unknown as { twisters: unknown[] }).twisters.length, 1, 'a whirlwind tears up out of the trap');
    // (and a trap's burst with no trap there, as another blast is, is left as it is)
    const other = new Fx();
    other.wild.see([], 0, world());
    other.handle([{ t: 'burst', x: 6, y: 5, r: 2, el: 'phys', style: 'blast' }], play);
    assert.equal((other.wild as unknown as { twisters: unknown[] }).twisters.length, 0, 'no whirlwind where no trap lay');
  } finally {
    useWild(false);
  }
});
