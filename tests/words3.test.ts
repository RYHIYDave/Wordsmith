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
//   - every new word's colour told apart from every word's, as the eye sees colour (CIEDE2000), at
//     least as well as today's two closest, Swift and Poison; and Mystical's (his word for spell
//     damage, its colour and rune drawn after the eight) from arcane magic's purple and a magic
//     item's blue;
//   - the runes, cut as the nine are;
//   - nothing piling up: the particles stay within the effects' own limit.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { FRIEND_RIM } from '../src/art/hero3_knight';
import { WORD_COLOR } from '../src/art/icons';
import { ENEMY_RIM, FLAME, MENACE } from '../src/art/mkit';
import { ELEMENT_RAMP, RARITY_COLOR } from '../src/art/palette';
import type { Game } from '../src/game/game';
import type { GameEvent, Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import {
  MYSTIC_MAX, MYSTIC_NAME, MYSTIC_SECS, NEW_GLYPH, NEW_RAMP, NEW_WORDS, STAGGER, W3, WORDS3, air3, bubble, clear3, crackedGround, demo3, demoEvents3, echoes3, floor3,
  frenzyHit, guardOn, guardStruck, heavyHit, hexCircle, hexHit, inside3, lights3, mysticHit, mysticSplash, mysticStack, preciseCrit, preciseHit, preciseMark, pullHit,
  shards, shift3, splitHit, stagger, stillHit, stun, tick3, tint3, vortex, ward,
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

test('the switch is off: the game draws as it did', () => {
  assert.equal(WORDS3.on, false);
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

type Lab = readonly [number, number, number];
/** A colour as CIELAB (D65), from its sRGB. */
function labOf(h: string): Lab {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const Y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const Z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
/** How far apart two colours look to the eye: CIEDE2000. */
function apart([L1, a1, b1]: Lab, [L2, a2, b2]: Lab): number {
  const rad = Math.PI / 180;
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1 = Math.hypot(a1p, b1);
  const C2 = Math.hypot(a2p, b2);
  const h1p = ((Math.atan2(b1, a1p) / rad) % 360 + 360) % 360;
  const h2p = ((Math.atan2(b2, a2p) / rad) % 360 + 360) % 360;
  let dh = h2p - h1p;
  if (C1 * C2 === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1 * C2) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2;
  const Cm = (C1 + C2) / 2;
  let hm = h1p + h2p;
  if (C1 * C2 !== 0) hm = Math.abs(h1p - h2p) <= 180 ? hm / 2 : hm < 360 ? (hm + 360) / 2 : (hm - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const turn = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const Sc = 1 + 0.045 * Cm;
  const Sh = 1 + 0.015 * Cm * T;
  const Rt = -Math.sin(2 * turn * rad) * Rc;
  const dL = (L2 - L1) / Sl;
  const dC = (C2 - C1) / Sc;
  const dHs = dH / Sh;
  return Math.sqrt(dL * dL + dC * dC + dHs * dHs + Rt * dC * dHs);
}
const seen = (h1: string, h2: string): number => apart(labOf(h1), labOf(h2));

test('every new word is told apart from every word, as far as Swift is from Poison at least, and from the glows that are not ours (CIEDE2000)', () => {
  // (the measure, on pairs from the published test data for CIEDE2000: Sharma, Wu and Dalal, 2005)
  const pairs: [Lab, Lab, number][] = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  ];
  for (const [p, q, d] of pairs) assert.ok(Math.abs(apart(p, q) - d) < 5e-5, `${apart(p, q)} for ${d}`);
  const colour = (w: string): string => (NEW_RAMP as Record<string, readonly string[]>)[w]?.[3] ?? (WORD_COLOR as Record<string, string>)[w];
  const all = [...Object.keys(WORD_COLOR), ...NEW_WORDS];
  const least = seen(WORD_COLOR.swift, WORD_COLOR.poison);
  const glows = [FRIEND_RIM, '#28dcf0', ENEMY_RIM, MENACE.color, ...FLAME];
  for (const w of NEW_WORDS) {
    for (const o of all) if (o !== w) assert.ok(seen(colour(w), colour(o)) >= least, `${w} is as near ${o} as ${seen(colour(w), colour(o)).toFixed(1)}, under Swift and Poison's ${least.toFixed(1)}`);
    for (const c of glows) assert.ok(seen(colour(w), c) >= least, `${w} is as near the glow ${c} as ${seen(colour(w), c).toFixed(1)}`);
  }
  // (Mystical, the word of spells: apart from the purple arcane magic is drawn in, and from a magic item's blue)
  for (const c of [...ELEMENT_RAMP.arcane.slice(1, 4), RARITY_COLOR[1]]) assert.ok(seen(colour('mystical'), c) >= least, `Mystical is as near ${c} as ${seen(colour('mystical'), c).toFixed(1)}`);
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

test('Mystical in front: a crescent sweeps round the struck, and a single-target spell splashes those beside it; both go', () => {
  clear3();
  const fx = new Fx();
  const g = game();
  mysticHit(fx, 12, 10);
  assert.equal(W3.sweeps.length, 1);
  assert.ok(fx.flashes.length >= 1 && fx.particles.length >= 10, 'a flash and stardust');
  mysticSplash(fx, 12, 10, [{ x: 13, y: 10 }, { x: 12, y: 11.2 }]);
  assert.equal(W3.links.length, 2, 'a line of the constellation to each the splash reaches');
  for (let i = 0; i < 20; i++) tick3(0.05, g, fx);
  assert.equal(W3.sweeps.length + W3.links.length, 0);
  // (the demo: the hits of a spell with Mystical in front call it up; with the switch off, nothing)
  W3.front = ['mystical'];
  W3.single = true;
  const m = monster(1, 12, 10);
  const near = monster(2, 13, 10);
  const far = monster(3, 18, 10);
  const hit: GameEvent = { t: 'hit', x: 12, y: 10, amount: 10, crit: false, el: 'phys', onHero: false };
  demoEvents3([hit], game([m, near, far]), fx);
  assert.equal(W3.sweeps.length, 0, 'switch off: nothing');
  WORDS3.on = true;
  try {
    demoEvents3([hit], game([m, near, far]), fx);
    assert.equal(W3.sweeps.length, 1);
    assert.equal(W3.links.length, 1, 'the splash reaches the one beside it, not the one far off, nor the struck');
  } finally {
    WORDS3.on = false;
    W3.front = [];
    W3.single = false;
    clear3();
  }
});

test('Mystical behind: each spell hit sends a star to the moon, which waxes as they reach it, to five and no further, and wanes when its time is up', () => {
  clear3();
  const fx = new Fx();
  const g = game();
  for (let i = 0; i < 7; i++) mysticStack(14, 10);
  assert.equal(W3.mystic.n, MYSTIC_MAX, 'five and no more');
  assert.equal(W3.mystic.shown, 0, 'the moon waits for the stars');
  assert.equal(W3.stars.length, MYSTIC_MAX, 'a star for each it has still to show, no more');
  tick3(0.4, g, fx);
  assert.equal(W3.stars.length, 0);
  assert.equal(W3.mystic.shown, MYSTIC_MAX, 'full');
  assert.ok(fx.floaters.some((f) => f.text === `FULL ${MYSTIC_NAME}`), 'the line over the hero says so');
  // (kept up when full: no star flies, the moon already says it)
  mysticStack(14, 10);
  assert.equal(W3.stars.length, 0);
  for (let i = 0; i < 2 * MYSTIC_SECS * 10; i++) tick3(0.1, g, fx);
  assert.equal(W3.mystic.n + W3.mystic.shown, 0, 'gone when its time is up');
  clear3();
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
  // Mystical: the crescent, the constellation, the star in flight, and the moon
  clear3();
  mysticHit(fx, 12, 10);
  mysticSplash(fx, 12, 10, [{ x: 13, y: 10 }]);
  mysticStack(12, 10);
  tick3(0.1, g, fx);
  const flying = canvas();
  air3(flying.g, cam, 1, g, fx);
  assert.ok(flying.drawn() > 40, `${flying.drawn()} things drawn while the star flies`);
  tick3(0.3, g, fx);
  assert.equal(W3.mystic.shown, 1);
  const moon = canvas();
  air3(moon.g, cam, 1, g, fx);
  assert.ok(moon.drawn() >= 30, `${moon.drawn()} things drawn: the moon`);
  let moonlit = 0;
  lights3(() => moonlit++, cam, g, 1);
  assert.ok(moonlit >= 1, 'the moon gives light');
  clear3();
});
