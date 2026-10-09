// THE NEW WORDS AT WORK (src/render/words3.ts): a mock-up behind a switch that is off. The owner
// chose eight new words on 8 Oct 2026 at 12:26; at 13:15 he said yes to the looks of the first four
// (Pulling, Heavy, Hexing, Frenzied) and to all eight colours and runes, and at 13:43 to the looks of
// the other four (Splitting, Precise, Stilling, Guarding). Their rules are another chat's to write.
// These tests hold:
//   - the switch: it is off, everything the renderer asks of the module is behind it, and the
//     playtest's hands do nothing until a playtest uses them;
//   - what he was shown: the heavy blow's freeze (the art rulebook, Movement 7), the pull closing
//     in, the stagger and the stun that end, what is left on the floor going when its time is up,
//     the frenzy of five and no more, the three copies and their shards, the sight that a critical
//     shuts, time slowed and its echoes, the shield and the ward;
//   - the rulebook's colours: no new word glows in the friend's cyan or the enemy's pink and gold;
//   - the runes, cut as the nine are;
//   - nothing piling up: the particles stay within the effects' own limit.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { FRIEND_RIM } from '../src/art/hero3_knight';
import { ENEMY_RIM, FLAME, MENACE } from '../src/art/mkit';
import type { Game } from '../src/game/game';
import type { GameEvent, Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import {
  NEW_GLYPH, NEW_RAMP, NEW_WORDS, STAGGER, W3, WORDS3, air3, bubble, clear3, crackedGround, demo3, demoEvents3, echoes3, floor3, frenzyHit, guardOn, guardStruck,
  heavyHit, hexCircle, hexHit, inside3, lights3, preciseCrit, preciseHit, preciseMark, pullHit, shards, shift3, splitHit, stagger, stillHit, stun, tick3, tint3, vortex,
  ward,
} from '../src/render/words3';

/** A monster as far as the drawing asks: where it stands and who it is. */
function monster(id: number, x: number, y: number): Monster {
  return { id, x, y, kind: 'skeleton', champion: false, boss: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0 } as unknown as Monster;
}

/** A game as far as the module asks: its hero and its monsters. */
function game(monsters: Monster[] = []): Game {
  return { hero: { x: 10, y: 10, fx: 1, fy: 0 }, monsters, projectiles: [] } as unknown as Game;
}

/** A canvas that counts what is drawn on it. */
function canvas(): { g: CanvasRenderingContext2D; drawn: () => number } {
  let n = 0;
  const g = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect: () => n++,
    beginPath: () => {},
    ellipse: () => n++,
    fill: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
  };
  return { g: g as unknown as CanvasRenderingContext2D, drawn: () => n };
}

const cam: Cam = { ox: 200, oy: 100, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;

// (Version 19.3: on, for the four words in the game, on his yes of 8 Oct 2026, 18:23, to pictures
// of them at work: "Yes, as they are (Recommended)". Until then it was off.)
test('the switch is on since Version 19.3, for the four words in the game', () => {
  assert.equal(WORDS3.on, true);
});

test('everything the renderer asks of the new words is behind the switch', () => {
  const src = readFileSync(new URL('../src/render/render.ts', import.meta.url), 'utf8') as string;
  const lines = src.split('\n');
  const calls = ['tick3(', 'floor3(', 'shift3(', 'tint3(', 'heroCopies3(', 'air3(', 'lights3(', 'echoes3('];
  let found = 0;
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith('import')) return;
    for (const c of calls) {
      if (!line.includes(c)) continue;
      found++;
      // on the same line as the switch, or in the block the switch opens just above it
      const guarded = line.includes('WORDS3.on') || lines.slice(Math.max(0, i - 3), i).some((l) => /if \(WORDS3\.on/.test(l) || /WORDS3\.on \?/.test(l));
      assert.ok(guarded, `render.ts line ${i + 1} calls ${c} without the switch: ${line.trim()}`);
    }
  });
  assert.ok(found >= calls.length, 'every one of the hooks is found in the renderer');
});

test("the playtest's hands do nothing until a playtest uses them", () => {
  const fx = new Fx();
  const handle = fx.handle;
  const hands = demo3(fx, () => null);
  assert.equal(fx.handle, handle, 'making the hands does not touch the effects');
  assert.equal(hands.switch, WORDS3, 'the hands hold the switch itself');
  assert.equal(W3.demo, false, 'nobody is listening: the demo does nothing of the rules\' share');
  // and with the switch off, the game's own events call up nothing, even when told to listen
  const was = WORDS3.on;
  WORDS3.on = false;
  clear3();
  W3.front = ['heavy', 'pulling', 'hexing', 'frenzied'];
  W3.behind = ['heavy', 'pulling', 'hexing', 'frenzied'];
  const m = monster(1, 11, 10);
  const events: GameEvent[] = [
    { t: 'hit', x: 11, y: 10, amount: 10, crit: false, el: 'phys', onHero: false },
    { t: 'swing', x: 10, y: 10, dx: 1, dy: 0, reach: 1.2, el: 'phys' },
    { t: 'die', x: 11, y: 10, kind: 'skeleton', elite: false, champion: false, boss: false, fx: 1, fy: 0 },
  ];
  demoEvents3(events, game([m]), fx);
  assert.equal(fx.particles.length + fx.rings.length + fx.flashes.length, 0);
  assert.equal(W3.patches.length + W3.marks.size + W3.drags.length + W3.frenzy.n, 0);
  W3.front = [];
  W3.behind = [];
  WORDS3.on = was;
});

test('Heavy: everything holds for a tenth of a second, and the screen kicks (Movement 7)', () => {
  const fx = new Fx();
  clear3();
  heavyHit(fx, 5, 5, 1, false);
  assert.ok(fx.freeze >= 0.1, `freeze ${fx.freeze}`);
  assert.ok(fx.shake > 0);
  assert.ok(fx.rings.length >= 1, 'a ring of shock runs out');
  assert.ok(W3.patches.some((p) => p.kind === 'cracks'), 'cracks open where it fell');
});

test('Pulling: the ring closes on the point, and the streaks fly in to it', () => {
  const fx = new Fx();
  clear3();
  pullHit(fx, 5, 5, 2);
  assert.ok(fx.rings.some((r) => r.closing), 'a ring closes in');
  const streaks = fx.particles.filter((p) => p.streak);
  assert.ok(streaks.length >= 10);
  for (const p of streaks) {
    // each heads for the point it was struck at
    const toward = (5 - p.x) * p.vx + (5 - p.y) * p.vy;
    assert.ok(toward > 0, 'a streak flies away from the point');
  }
});

test('a stagger knocks the figure back a step, and it comes back', () => {
  clear3();
  const fx = new Fx();
  const m = monster(7, 12, 10);
  const g = game([m]);
  stagger(m, 10, 10, g);
  tick3(0.05, g, fx);
  const [x, y] = shift3(m, 0);
  assert.ok(Math.hypot(x, y) >= 3, `knocked back ${x}, ${y}`);
  for (let i = 0; i < Math.ceil(STAGGER / 0.05) + 2; i++) tick3(0.05, g, fx);
  assert.deepEqual(shift3(m, 0).map((v) => Math.abs(v)), [0, 0]);
  assert.equal(W3.marks.has(7), false, 'and its mark is gone');
});

test('a stun shows for as long as it lasts, and no longer', () => {
  clear3();
  const fx = new Fx();
  const m = monster(3, 12, 10);
  const g = game([m]);
  stun(m, 1);
  assert.ok((W3.marks.get(3)?.stun ?? 0) > 0);
  for (let i = 0; i < 22; i++) tick3(0.05, g, fx);
  assert.equal(W3.marks.has(3), false);
});

test('a curse drains the cursed grey, and so does a hex circle; both end', () => {
  clear3();
  const fx = new Fx();
  const cursed = monster(4, 12, 10);
  const inside = monster(5, 20, 20);
  const outside = monster(6, 30, 30);
  const g = game([cursed, inside, outside]);
  hexHit(fx, cursed, 1);
  hexCircle(20, 20, 1.5, 1);
  tick3(0.3, g, fx);
  assert.ok(tint3(cursed, 0));
  assert.ok(tint3(inside, 0));
  assert.equal(tint3(outside, 0), null);
  for (let i = 0; i < 20; i++) tick3(0.05, g, fx);
  assert.equal(tint3(cursed, 0), null);
  assert.equal(tint3(inside, 0), null);
});

test('what is left on the floor goes when its time is up', () => {
  clear3();
  const fx = new Fx();
  const g = game();
  vortex(5, 5, 1.5, 1);
  crackedGround(8, 8, 1.5, 1);
  hexCircle(11, 11, 1.5, 1);
  assert.equal(W3.patches.length, 3);
  for (let i = 0; i < 24; i++) tick3(0.05, g, fx);
  assert.equal(W3.patches.length, 0);
});

test('the frenzy grows to five and no further, and fades when its time runs out', () => {
  clear3();
  const fx = new Fx();
  const g = game();
  for (let i = 0; i < 7; i++) frenzyHit(fx, 10, 10, 1, 0);
  assert.equal(W3.frenzy.n, 5);
  for (let i = 0; i < 90; i++) tick3(0.05, g, fx);
  assert.equal(W3.frenzy.n, 0);
});

test("no new word glows in the friend's cyan or the enemy's pink and gold (the rulebook's Pillar 4)", () => {
  const reserved = new Set([FRIEND_RIM, '#28dcf0', ENEMY_RIM, MENACE.color, ...FLAME].map((c) => c.toLowerCase()));
  for (const w of NEW_WORDS) {
    assert.equal(NEW_RAMP[w].length, 6, `${w} has its six tones`);
    for (const c of NEW_RAMP[w]) assert.ok(!reserved.has(c.toLowerCase()), `${w}'s ${c} is a reserved glow`);
  }
});

test('the runes are cut as the nine are: 6 by 6, or 7 by 7 with a middle, each with its glowing core', () => {
  for (const w of NEW_WORDS) {
    const rows = NEW_GLYPH[w];
    assert.ok(rows.length === 6 || rows.length === 7, `${w}: ${rows.length} rows`);
    for (const r of rows) {
      assert.equal(r.length, rows.length, `${w}: a row of ${r.length}`);
      assert.match(r, /^[.Xo]+$/);
    }
    assert.ok(rows.join('').includes('o'), `${w} has a glowing core`);
  }
});

test('Splitting: three copies fly on from the first hit, fanned out, and end in shards that lie a moment', () => {
  clear3();
  const fx = new Fx();
  const g = game();
  W3.behind = ['splitting'];
  splitHit(fx, 5, 5, 1, 0);
  assert.equal(W3.copies.length, 3);
  const ways = W3.copies.map((c) => Math.atan2(c.vy, c.vx)).sort((a, b) => a - b);
  assert.ok(ways[0] < -0.2 && Math.abs(ways[1]) < 0.01 && ways[2] > 0.2, `fanned: ${ways.map((w) => w.toFixed(2))}`);
  for (let i = 0; i < 10; i++) tick3(0.05, g, fx);
  assert.equal(W3.copies.length, 0);
  assert.equal(W3.patches.filter((p) => p.kind === 'shards').length, 3, 'each copy scatters its shards where it ends');
  for (let i = 0; i < 40; i++) tick3(0.05, g, fx);
  assert.equal(W3.patches.length, 0, 'and they are gone in a moment');
  W3.behind = [];
});

test('Precise: the sight on a marked enemy shuts when the next hit is a certain critical, and the mark is spent', () => {
  clear3();
  const fx = new Fx();
  const m = monster(11, 12, 10);
  const g = game([m]);
  preciseHit(fx, 12, 10, 1, 0);
  assert.ok(W3.pins.some((p) => !p.crit), 'a needle and a star');
  preciseMark(m, 5);
  tick3(0.3, g, fx);
  assert.ok((W3.marks.get(11)?.aim ?? 0) > 0);
  preciseCrit(fx, m, 1, 0);
  const k = W3.marks.get(11);
  assert.ok(k && k.aim <= 0 && k.shut > 0, 'the sight snaps shut');
  assert.ok(W3.pins.some((p) => p.crit), 'a critical star');
  for (let i = 0; i < 10; i++) tick3(0.05, g, fx);
  assert.equal(W3.marks.has(11), false, 'and the mark is spent');
});

test('Stilling: the slowed are tinged, leave echoes when they move, and a bubble does the same; both end', () => {
  clear3();
  const fx = new Fx();
  const slowed = monster(12, 10, 10);
  const walker = monster(13, 20, 20);
  const g = game([slowed, walker]);
  stillHit(fx, slowed, 1);
  bubble(20, 20, 1.5, 1);
  assert.ok(inside3('bubble', 20.5, 20));
  for (let i = 0; i < 8; i++) {
    slowed.x += 0.1;
    walker.x += 0.1;
    tick3(0.05, g, fx);
  }
  assert.ok(tint3(slowed, 0));
  assert.ok(tint3(walker, 0));
  assert.ok(echoes3(slowed).length >= 1, 'echoes linger after it');
  assert.ok(echoes3(walker).length >= 1);
  for (let i = 0; i < 22; i++) tick3(0.05, g, fx);
  assert.equal(tint3(slowed, 0), null);
  assert.equal(echoes3(slowed).length, 0);
  assert.equal(W3.patches.length, 0);
});

test('Guarding: the shield lasts as long as it was given, flares where it is struck, and the ward knows who stands in it', () => {
  clear3();
  const fx = new Fx();
  const g = game();
  guardOn(fx, 10, 10, 1);
  assert.ok(W3.guard.t > 0);
  guardStruck(fx, 10, 10, 11, 10);
  assert.equal(W3.guard.struck, 0);
  assert.ok(W3.guard.fx > 0.9, 'the side the blow came from');
  ward(10, 10, 1.3, 1);
  assert.ok(inside3('ward', 10.5, 10));
  assert.equal(inside3('ward', 13, 10), false);
  for (let i = 0; i < 22; i++) tick3(0.05, g, fx);
  assert.equal(W3.guard.t, 0);
  assert.equal(W3.patches.length, 0);
});

test('nothing piles up: the particles stay within the effects\' own limit', () => {
  clear3();
  const fx = new Fx();
  for (let i = 0; i < 200; i++) {
    pullHit(fx, 5, 5, 2);
    heavyHit(fx, 5, 5, 2, true);
  }
  assert.ok(fx.particles.length <= 900, `${fx.particles.length} particles`);
});

test('drawn: each look draws something, and with nothing going on nothing is drawn', () => {
  clear3();
  const fx = new Fx();
  const m = monster(9, 12, 10);
  const g = game([m]);
  const empty = canvas();
  floor3(empty.g, cam, 1, g, everywhere);
  air3(empty.g, cam, 1, g, fx);
  let lit = 0;
  lights3(() => lit++, cam, g, 1);
  assert.equal(empty.drawn(), 0);
  assert.equal(lit, 0);
  vortex(5, 5, 1.5);
  crackedGround(8, 8, 1.5);
  hexCircle(11, 11, 1.5);
  bubble(14, 14, 1.5);
  ward(17, 17, 1.5);
  shards(fx, 20, 20);
  stun(m, 2);
  hexHit(fx, m, 3);
  preciseMark(m, 3);
  stillHit(fx, m, 3);
  splitHit(fx, 12, 10, 1, 0);
  guardOn(fx, 10, 10);
  frenzyHit(fx, 10, 10, 1, 0);
  tick3(0.4, g, fx);
  const full = canvas();
  floor3(full.g, cam, 1, g, everywhere);
  air3(full.g, cam, 1, g, fx);
  lights3(() => lit++, cam, g, 1);
  assert.ok(full.drawn() > 200, `${full.drawn()} things drawn`);
  assert.ok(lit >= 7, `${lit} lights`);
  clear3();
});
