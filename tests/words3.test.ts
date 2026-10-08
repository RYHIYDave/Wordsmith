// THE NEW WORDS AT WORK (src/render/words3.ts): a mock-up behind a switch that is off. The owner
// chose eight new words on 8 Oct 2026 at 12:26; at 13:15 he said yes to the looks of the first four
// (Pulling, Heavy, Hexing, Frenzied) and to all eight colours and runes. Their rules are another
// chat's to write. These tests hold:
//   - the switch: it is off, everything the renderer asks of the module is behind it, and the
//     playtest's hands do nothing until a playtest uses them;
//   - what he was shown: the heavy blow's freeze (the art rulebook, Movement 7), the pull closing
//     in, the stagger and the stun that end, what is left on the floor going when its time is up,
//     the frenzy of five and no more;
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
  NEW_GLYPH, NEW_RAMP, NEW_WORDS, STAGGER, W3, WORDS3, air3, clear3, crackedGround, demo3, demoEvents3, floor3, frenzyHit, heavyHit, hexCircle, hexHit, lights3,
  pullHit, shift3, stagger, stun, tick3, tint3, vortex,
} from '../src/render/words3';

/** A monster as far as the drawing asks: where it stands and who it is. */
function monster(id: number, x: number, y: number): Monster {
  return { id, x, y, kind: 'skeleton', champion: false, boss: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0 } as unknown as Monster;
}

/** A game as far as the module asks: its hero and its monsters. */
function game(monsters: Monster[] = []): Game {
  return { hero: { x: 10, y: 10, fx: 1, fy: 0 }, monsters } as unknown as Game;
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

test('the switch is off: the game draws as it did', () => {
  assert.equal(WORDS3.on, false);
});

test('everything the renderer asks of the new words is behind the switch', () => {
  const src = readFileSync(new URL('../src/render/render.ts', import.meta.url), 'utf8') as string;
  const lines = src.split('\n');
  const calls = ['tick3(', 'floor3(', 'shift3(', 'tint3(', 'heroCopies3(', 'air3(', 'lights3('];
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
  assert.equal(hands.switch.on, false);
  // and with the switch off, the game's own events call up nothing, even when told to listen
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
  stun(m, 2);
  hexHit(fx, m, 3);
  frenzyHit(fx, 10, 10, 1, 0);
  tick3(0.4, g, fx);
  const full = canvas();
  floor3(full.g, cam, 1, g, everywhere);
  air3(full.g, cam, 1, g, fx);
  lights3(() => lit++, cam, g, 1);
  assert.ok(full.drawn() > 100, `${full.drawn()} things drawn`);
  assert.ok(lit >= 4, `${lit} lights`);
  clear3();
});
