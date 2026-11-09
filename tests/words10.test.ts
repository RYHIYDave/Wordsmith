// HIS THREE NEW WORDS' LOOKS (src/render/words10.ts) and THE LEXICON'S 28 STONES (src/ui/lexicon28.ts): mock-ups of the art chat's
// behind switches that are off. His words (the main chat's board post, 9 Nov 2026, 10:45): of Lasting, “Well it makes everything
// connected to lasting last longer”; of Vast, “the opposite of precise”. These hold:
//   1. the switch is off, and everything the renderer and main.ts ask of it is behind it; nothing else of the game reaches it;
//   2. with it off, nothing here draws, lights, reads, changes a picture or keeps time, whatever it is told;
//   3. their colours: six tones each, darkest to white-hot; each word's own colour (and all 28 words', the seven's and the three's
//      the art chat's) at least 12 from every other word, the melds, Binding, the friend's cyan and the enemy's pink and gold, as
//      the eye sees colour (CIEDE2000, Binding's check); Lasting's sand clear of the enemy's gold; nothing cyan or pink; our
//      Bleeding clear of Volatile's melds;
//   4. their runes: 7 by 7, cut as the others are, each its own;
//   5. each look draws at its moment on what the rules say carries it, every pixel on a whole pixel, in its own colours; every
//      monster's side in the enemy's pink and gold, nothing cyan;
//   6. the rules' numbers, read from the rules; their events called up (Vast in front's ring, Vast behind's splash); forgotten on
//      a new level;
//   7. the Lexicon: its switch on the game's own rows; each way's stones at least the game's touch size, inside the half, none on
//      another; the way picked gives every word's page its room on a phone held sideways, as the game's own rows do not.
//   8. the Lexicon in pages by what they do (way 'groups', his “Categorize them into pages”, “By what they do”, 9 Nov 2026): the
//      five pages hold all 28 words, each once, nine at most a page; each page, opened by its word or by its tab, shows its own
//      stones; tabs and stones at the touch size, inside the half, apart, each tab's name inside it; the longest page of all has
//      its room; with LEX28 'rows' nothing changes.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { GLYPH, WORD_COLOR } from '../src/art/icons';
import { FLEETING, LASTING, VAST } from '../src/game/defs';
import type { Game } from '../src/game/game';
import { newMeta } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { WORD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { MELD_GLYPH, MELD_RAMP } from '../src/render/melds3';
import { NEW_GLYPH, NEW_RAMP } from '../src/render/words3';
import { BIND_GLYPH, BIND_RAMP } from '../src/render/binding3';
import { VMELD_GLYPH, VMELD_RAMP } from '../src/render/volatile3';
import { W7_GLYPH, W7_RAMP } from '../src/render/words7';
import {
  W10, W10_ENEMY, W10_GLYPH, W10_RAMP, W10_TIME, W10_WORDS, WORDS10_LOOK, airW10, clearW10, eventsW10, floorW10, heroW10, lightsW10, playW10, thingW10, tickW10, timeWord,
} from '../src/render/words10';
import { LEX28, LEX28_WAYS, LEX_PAGES, TOUCH_MIN, lex28Layout, lexPageOf, pageHeight } from '../src/ui/lexicon28';
import { lexLayout } from '../src/ui/lexicon';
import { textWidth } from '../src/engine/font';

const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;
const on = <T>(fn: () => T): T => {
  const was = WORDS10_LOOK.on;
  WORDS10_LOOK.on = true;
  try {
    return fn();
  } finally {
    WORDS10_LOOK.on = was;
  }
};
/** A canvas that only counts and keeps what is drawn on it: each pixel's colour, and whether it was laid on whole pixels. */
function canvas(): { g: CanvasRenderingContext2D; drawn: () => number; colours: Set<string>; crisp: () => boolean } {
  let n = 0;
  let whole = true;
  const colours = new Set<string>();
  const g = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      n++;
      colours.add(String(this.fillStyle).toLowerCase());
      if (![x, y, w, h].every(Number.isInteger)) whole = false;
    },
    drawImage: () => {},
    canvas: { width: 600, height: 300 },
  };
  return { g: g as unknown as CanvasRenderingContext2D, drawn: () => n, colours, crisp: () => whole };
}

function lab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number): number => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const [r, g, b] = [lin(((n >> 16) & 255) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)];
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const F = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * F(Y) - 16, 500 * (F(X) - F(Y)), 200 * (F(Y) - F(Z))];
}
function de2000(a: string, b: string): number {
  const [L1, a1, b1] = lab(a);
  const [L2, a2, b2] = lab(b);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = ((Math.atan2(b1, a1p) / rad) + 360) % 360;
  const h2p = ((Math.atan2(b2, a2p) / rad) + 360) % 360;
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) dhp = Math.abs(h2p - h1p) <= 180 ? h2p - h1p : h2p - h1p > 180 ? h2p - h1p - 360 : h2p - h1p + 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  const hbp = C1p * C2p === 0 ? h1p + h2p : Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dth = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dth * rad) * RC;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}
function hsv(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  let h = 0;
  if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx / 255];
}
const cyanish = (c: string): boolean => {
  if (!/^#[0-9a-f]{6}$/.test(c)) return false;
  const [h, s, v] = hsv(c);
  return s > 0.3 && v > 0.45 && h > 170 && h < 200;
};
const pinkish = (c: string): boolean => {
  if (!/^#[0-9a-f]{6}$/.test(c)) return false;
  const [h, s, v] = hsv(c);
  return s > 0.3 && v > 0.45 && h > 315 && h < 350;
};

/** The ten new words: their stand-ins in art/icons.ts are the main chat's, until the art chat's (these) go in. */
const TEN = ['piercing', 'bleeding', 'reaping', 'culling', 'surging', 'plundering', 'mirroring', 'lasting', 'fleeting', 'vast'];

function monster(id: number, x: number, y: number, words: string[] = []): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', champion: false, boss: false, elite: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0, fx: -1, fy: 0, words, poisonT: 0, burnT: 0, chillT: 0, lastSkill: -1 } as unknown as Monster;
}
/** A skill as the rules resolve it: its words, and what they make of its time (`last`), its pace, its boosts and Vast behind. */
function skill(id: string, front: string[], r: Partial<{ last: number; pace: number; vast: number; size: number; shield: number }>): unknown {
  return { id, front, behind: [], cd: 0, charges: 1, maxCharges: 1, uses: 0, r: { last: 1, pace: 1, boost: 1, vast: 0, size: 1, shield: 0, might: 0, haste: 0, frenzy: false, ...r } };
}
const level = {};
function game(o: Partial<{ skills: unknown[]; monsters: Monster[]; zones: unknown[]; orbs: unknown[]; channel: unknown; hero: Record<string, unknown> }> = {}): Game {
  return {
    level,
    hero: { x: 10, y: 10, fx: 1, fy: 0, skills: o.skills ?? [], channel: o.channel ?? null, mightT: 0, hasteT: 0, frenzyT: 0, shieldT: 0, poisonT: 0, burnT: 0, chillT: 0, ...(o.hero ?? {}) },
    monsters: o.monsters ?? [],
    projectiles: [],
    zones: o.zones ?? [],
    orbs: o.orbs ?? [],
    familiars: [],
    contraptions: [],
  } as unknown as Game;
}

/** Each look, staged on what the rules keep: its word, its side, the game, and what it should show. */
function stages(): { name: string; gm: Game; act?: () => void; colours: readonly string[]; enemy?: boolean }[] {
  const out: { name: string; gm: Game; act?: () => void; colours: readonly string[]; enemy?: boolean }[] = [];
  for (const w of ['lasting', 'fleeting'] as const) {
    const last = w === 'lasting' ? 1 + LASTING.longer : 1 - FLEETING.shorter;
    const R = W10_RAMP[w];
    out.push({ name: `${w} on an orb`, gm: game({ skills: [skill('wave', [], {}), skill('orb', [w], { last })], orbs: [{ id: 1, x: 11, y: 9, t: 5 * last * 0.9, life: 5 * last, next: 0.5, skill: 1 }] }), colours: R });
    out.push({ name: `${w} on a whirlwind`, gm: game({ skills: [skill('strike', [], {}), skill('whirlwind', [w], { last })], channel: { skill: 1, t: 2.4 * last * 0.9, next: 0.1, bites: 3, tx: 11, ty: 10, wake: 0 } }), colours: R });
    out.push({ name: `${w} on burning ground`, gm: game({ skills: [skill('strike', [], {}), skill('whirlwind', [w], { last })], zones: [{ x: 12, y: 9, r: 1.3, t: 4 * last * 0.85, dur: 4 * last, kind: 'burn', hostile: false, skill: 1, words: [] }] }), colours: R });
    out.push({ name: `${w} on a boost`, gm: game({ skills: [skill('strike', [], {}), skill('whirlwind', ['guarding', w], { last, shield: 0.2 })], hero: { shieldT: 2 } }), colours: R });
    const m = monster(2, 11.5, 9.5);
    Object.assign(m, { poisonT: 3, lastSkill: 0 });
    out.push({ name: `${w} on his poison on a monster`, gm: game({ skills: [skill('strike', ['poison', w], { last })], monsters: [m] }), colours: R });
    out.push({ name: `${w} on a monster`, gm: game({ monsters: [monster(3, 11, 10, [w, 'poison'])], hero: { poisonT: 3 } }), colours: W10_ENEMY, enemy: true });
  }
  out.push({ name: 'vast in front (its ring)', gm: game(), act: () => playW10('vast', 'ring', { x: 11, y: 9, r: 2.8, r0: 2.0, t: 0.2, dur: 30, seed: 3 }), colours: W10_RAMP.vast });
  const near = [monster(4, 11, 9), monster(5, 11.8, 9.6), monster(6, 11.4, 8.2)];
  out.push({ name: 'vast behind (its splash)', gm: game({ monsters: near }), act: () => playW10('vast', 'splash', { x: 11, y: 9, r: VAST.splashR, t: 0.2, dur: 30, seed: 5, to: near.slice(1).map((q) => ({ x: q.x, y: q.y, top: 22 })) }), colours: W10_RAMP.vast });
  out.push({ name: 'vast on a monster', gm: game({ monsters: [monster(7, 12, 9, ['vast'])], zones: [{ x: 11.5, y: 9.5, r: 1.3 * (1 + VAST.monster), t: 0.5, dur: 1.1, kind: 'warn', hostile: true, skill: -1, words: ['vast'] }] }), colours: W10_ENEMY, enemy: true });
  return out;
}

test('1. the switch is off, everything the renderer and main.ts ask of it is behind it, and nothing else of the game reaches it', () => {
  assert.equal(WORDS10_LOOK.on, false);
  const calls = ['tickW10(', 'floorW10(', 'airW10(', 'lightsW10(', 'heroW10(', 'thingW10('];
  const lines = (readFileSync(new URL('../src/render/render.ts', import.meta.url), 'utf8') as string).split('\n');
  let found = 0;
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith('import')) return;
    for (const c of calls) {
      if (!line.includes(c)) continue;
      found++;
      const guarded = line.includes('WORDS10_LOOK.on') || lines.slice(Math.max(0, i - 3), i).some((l) => /if \(WORDS10_LOOK\.on/.test(l));
      assert.ok(guarded, `render.ts line ${i + 1} calls ${c} without the switch: ${line.trim()}`);
    }
  });
  assert.equal(found, calls.length, 'every hook is found in render.ts, once');
  const importers: string[] = [];
  const walk = (dir: string): void => {
    for (const f of readdirSync(dir) as string[]) {
      const p = `${dir}/${f}`;
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes('/dev/') && /from '\.{1,2}\/(render\/)?words10'/.test(readFileSync(p, 'utf8') as string)) importers.push(p.replace(/^.*\/src\//, ''));
    }
  };
  walk(new URL('../src', import.meta.url).pathname);
  assert.deepEqual(importers.sort(), ['main.ts', 'render/render.ts']);
  const main = (readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8') as string).split('\n');
  const calls10 = main.filter((l) => /eventsW10\(|tickW10\(|playW10\(/.test(l) && !l.trimStart().startsWith('import'));
  assert.equal(calls10.length, 1, 'main.ts calls up the looks once, by the events');
  assert.ok(calls10[0].includes('WORDS10_LOOK.on'), `main.ts calls the looks without the switch: ${calls10[0].trim()}`);
});

test('2. with the switch off, nothing here draws, lights, reads, changes a picture or keeps time, whatever it is told', () => {
  assert.equal(WORDS10_LOOK.on, false);
  for (const s of stages()) {
    clearW10();
    s.act?.();
    const fx = new Fx();
    const t0 = W10.clock;
    const acts = W10.acts.map((a) => a.t);
    tickW10(0.5, s.gm, fx);
    assert.equal(W10.clock, t0, 'its clock stands still');
    assert.deepEqual(W10.acts.map((a) => a.t), acts);
    const c = canvas();
    floorW10(c.g, cam, 1, s.gm, everywhere);
    airW10(c.g, cam, 1, s.gm);
    let lit = 0;
    lightsW10(() => lit++, cam, s.gm, 1);
    assert.equal(c.drawn(), 0, `${s.name} drew`);
    assert.equal(lit, 0);
    assert.deepEqual(heroW10({} as never, s.gm.hero, cam, s.gm), []);
    assert.deepEqual(thingW10(s.gm, 1, 1, {} as never, 0, 0), []);
    eventsW10([{ t: 'burst', x: 11, y: 9, r: 2.8, style: 'nova', words: ['vast'] }, { t: 'burst', x: 11, y: 9, r: VAST.splashR, style: 'shock', words: [] }], s.gm, fx);
    assert.equal(W10.acts.length, acts.length, 'no look begun');
    assert.equal(fx.particles.length + fx.rings.length + fx.flashes.length, 0);
  }
  assert.equal(W10.seen.length, 0, 'not even the hero is looked at');
  clearW10();
});

test("3. their colours: six tones; all 28 words told apart, and from the melds, Binding, the friend and the enemy; Lasting clear of the gold; nothing cyan or pink; our Bleeding clear of Volatile's melds", () => {
  // the 28 words: the eighteen as the game has them, the seven and the three as the art chat draws them
  const words: Record<string, string> = {};
  for (const w of WORD_IDS) if (!TEN.includes(w)) words[w] = WORD_COLOR[w];
  for (const [w, r] of Object.entries(W7_RAMP)) words[w] = r[3];
  for (const [w, r] of Object.entries(W10_RAMP)) words[w] = r[3];
  assert.equal(Object.keys(words).length, 28, 'the 28 words');
  for (const w of WORD_IDS) assert.ok(w in words, `${w} is one of the 28`);
  const others: Record<string, string> = { cyan: '#28dcf0', runedust: '#5ce8f8', pink: '#ff4f8a', gold: '#ffd27a', binding: BIND_RAMP[3] };
  for (const [w, c] of Object.entries(WORD_COLOR as Record<string, string>)) if (!(w in words) && !TEN.includes(w) && !/2$/.test(w)) others[`stand-in ${w}`] = c;
  for (const [w, r] of Object.entries(NEW_RAMP)) others[`new ${w}`] = r[3];
  for (const [w, r] of Object.entries(MELD_RAMP)) others[`meld ${w}`] = r[3];
  let nearest = 99;
  for (const w of W10_WORDS) {
    const R = W10_RAMP[w];
    assert.equal(R.length, 6, w);
    const L = R.map((c) => lab(c)[0]);
    for (let i = 1; i < 6; i++) assert.ok(L[i] > L[i - 1], `${w}: tone ${i} lighter than tone ${i - 1}`);
    for (const c of R) assert.ok(!cyanish(c) && !pinkish(c), `${w}'s ${c} glows cyan or pink`);
  }
  // each of the ten new words (the art chat's colours) from every other of the 28, and the three from all the rest (the game's own
  // eighteen are as the game has them: Swift and Poison, 10.5 apart, are not these looks' to change)
  for (const [w, c] of Object.entries(words)) {
    if (!TEN.includes(w)) continue;
    for (const [v, d] of Object.entries(words)) if (v !== w) assert.ok(de2000(c, d) >= 12, `${w} and ${v}: ${de2000(c, d).toFixed(1)}`);
    for (const [o, d] of Object.entries(others)) {
      if (!W10_WORDS.includes(w as never)) continue;
      nearest = Math.min(nearest, de2000(c, d));
      assert.ok(de2000(c, d) >= 12, `${w} is ${de2000(c, d).toFixed(1)} from ${o}`);
    }
  }
  assert.ok(nearest >= 12);
  for (const i of [3, 4, 5]) assert.ok(de2000(W10_RAMP.lasting[i], '#ffd27a') >= 12, `Lasting's tone ${i} is ${de2000(W10_RAMP.lasting[i], '#ffd27a').toFixed(1)} from the enemy's gold`);
  // (the main chat moved its Bleeding stand-in to keep it apart from Volatile's melds: ours, the art's, is apart from them too)
  for (const [v, r] of Object.entries(VMELD_RAMP)) assert.ok(de2000(W7_RAMP.bleeding[3], r[3]) >= 12, `our Bleeding is ${de2000(W7_RAMP.bleeding[3], r[3]).toFixed(1)} from ${v}`);
  for (const v of ['demolition', 'powderkeg', 'shatter', 'chainreaction', 'rupture']) assert.ok(de2000(W7_RAMP.bleeding[3], WORD_COLOR[v as WordId]) >= 12, `our Bleeding and ${v}'s stand-in`);
  assert.equal(W10_ENEMY[4], '#ff4f8a', "a monster's side: the enemy's pink");
  assert.equal(W10_ENEMY[5], '#ffd27a', 'burning to gold');
  for (const c of W10_ENEMY) assert.ok(!cyanish(c));
});

test('4. their runes: 7 by 7, cut as the others are, each its own', () => {
  const all = [...Object.values(GLYPH), ...Object.values(MELD_GLYPH), ...Object.values(NEW_GLYPH), ...Object.values(VMELD_GLYPH), ...Object.values(W7_GLYPH), BIND_GLYPH].map((g) => g.join('/'));
  const mine = new Set<string>();
  for (const w of W10_WORDS) {
    const g = W10_GLYPH[w];
    assert.equal(g.length, 7, w);
    for (const row of g) assert.match(row, /^[.Xo]{7}$/, w);
    const flat = g.join('');
    assert.ok(flat.includes('X') && flat.includes('o'), `${w}: its colour and its glow`);
    assert.ok(!all.includes(g.join('/')), `${w}'s rune is another's`);
    mine.add(g.join('/'));
  }
  assert.equal(mine.size, 3);
});

test("5. each look draws at its moment on what the rules say carries it, crisp, in its own colours; a monster's side in the enemy's, nothing cyan", () => {
  on(() => {
    for (const s of stages()) {
      clearW10();
      tickW10(0, s.gm, new Fx());
      W10.clock = 3.7;
      s.act?.();
      const c = canvas();
      floorW10(c.g, cam, 1, s.gm, everywhere);
      airW10(c.g, cam, 1, s.gm);
      assert.ok(c.drawn() > 30, `${s.name}: only ${c.drawn()} pixels`);
      assert.ok(c.crisp(), `${s.name}: a pixel off the grid`);
      const cols = [...c.colours];
      assert.ok(cols.some((x) => s.colours.includes(x)), `${s.name}: none of its colours in ${cols.join(' ')}`);
      assert.ok(!cols.some(cyanish), `${s.name} shows cyan: ${cols.filter(cyanish)}`);
      if (s.enemy) assert.ok(cols.includes('#ff4f8a') || cols.includes('#c02860'), `${s.name}: no pink in ${cols.join(' ')}`);
      else assert.ok(!cols.some(pinkish), `${s.name}: the enemy's pink on his own`);
    }
    // what carries neither shows nothing: an orb of an ability without them
    clearW10();
    const plain = game({ skills: [skill('wave', [], {}), skill('orb', [], {})], orbs: [{ id: 1, x: 11, y: 9, t: 2, life: 5, next: 0.5, skill: 1 }] });
    const c = canvas();
    floorW10(c.g, cam, 1, plain, everywhere);
    airW10(c.g, cam, 1, plain);
    assert.equal(c.drawn(), 0, 'nothing on what carries neither');
    assert.equal(timeWord(plain, 1), null);
    clearW10();
  });
});

test("6. the rules' numbers; their events call the looks up; forgotten on a new level", () => {
  assert.equal(W10_TIME.longer, LASTING.longer, "Lasting's half again, the rules'");
  assert.equal(W10_TIME.shorter, FLEETING.shorter, "Fleeting's third, the rules'");
  assert.equal(W10_TIME.wider, VAST.wider, "Vast's widening, the rules'");
  assert.equal(W10_TIME.splashR, VAST.splashR, "Vast behind's reach, the rules'");
  assert.equal(W10_TIME.monsterWider, VAST.monster, "a monster's widening, the rules'");
  on(() => {
    const near = [monster(1, 11, 9), monster(2, 11.9, 9.4), monster(3, 14, 9)];
    const gm = game({ monsters: near });
    clearW10();
    tickW10(0, gm, new Fx());
    // Vast in front: an area of his landing wider, its ring from where its edge was
    eventsW10([{ t: 'burst', x: 11, y: 9, r: 2.8, el: 'phys', style: 'nova', words: ['vast'] }, { t: 'burst', x: 11, y: 9, r: 2, el: 'phys', style: 'nova', words: ['power'] }], gm, new Fx());
    assert.equal(W10.acts.length, 1, "only Vast's burst rings");
    assert.equal(W10.acts[0].kind, 'ring');
    assert.ok(Math.abs(W10.acts[0].r0 - 2.8 / (1 + VAST.wider)) < 1e-9, 'its old edge, before Vast widened it');
    // Vast behind: the rules' splash (a 'shock' burst its reach wide), to the near ones only
    eventsW10([{ t: 'burst', x: 11, y: 9, r: VAST.splashR, el: 'phys', style: 'shock', words: [], n: 0, echo: false }], gm, new Fx());
    const sp = W10.acts.find((a) => a.kind === 'splash');
    assert.ok(sp, 'its splash');
    assert.equal(sp?.to.length, 1, 'thrown to the one near it, not to the one struck nor the one far');
    // its time runs, and it is gone
    tickW10(5, gm, new Fx());
    assert.equal(W10.acts.length, 0, 'each is gone when its time is up');
    playW10('vast', 'ring', { x: 1, y: 1, r: 2, dur: 30 });
    tickW10(0.1, { ...gm, level: {} } as unknown as Game, new Fx());
    assert.equal(W10.acts.length, 0, 'a new level forgets everything');
    clearW10();
  });
});

test("7. the Lexicon's 28 stones: the switch on the game's own rows; every way's stones at the touch size, inside, apart; the way picked gives every page its room", () => {
  assert.equal(LEX28.way, 'rows', "the game's own Lexicon");
  assert.deepEqual(LEX28.stones, {}, 'no stones laid in');
  assert.equal(WORD_IDS.length, 28);
  // what reaches it: the Lexicon's half (its draw, behind the switch) and main.ts (the playtest's hands) only
  const lex = (readFileSync(new URL('../src/ui/lexicon.ts', import.meta.url), 'utf8') as string).split('\n');
  const uses = lex.filter((l) => /drawLex28\(/.test(l) && !l.trimStart().startsWith('import'));
  assert.equal(uses.length, 1);
  assert.ok(uses[0].includes("LEX28.way !== 'rows'"), `the Lexicon's half draws the ways without the switch: ${uses[0].trim()}`);
  const importers: string[] = [];
  const walk = (dir: string): void => {
    for (const f of readdirSync(dir) as string[]) {
      const p = `${dir}/${f}`;
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && /from '\.{1,2}\/(ui\/)?lexicon28'/.test(readFileSync(p, 'utf8') as string)) importers.push(p.replace(/^.*\/src\//, ''));
    }
  };
  walk(new URL('../src', import.meta.url).pathname);
  assert.deepEqual(importers.sort(), ['main.ts', 'ui/lexicon.ts']);
  // the lectern's half on a phone held sideways (844 by 390 at three to a pixel: the game's 507 by 234, the half 254 by 234)
  const half = { x: 0, y: 0, w: 254, h: 234 };
  const meta = newMeta();
  for (const w of WORD_IDS) Object.assign(meta.known[w], { found: true, front: true, behind: true, gear: true, dungeon: true });
  const longest = (pw: number): [string, number] => WORD_IDS.map((w) => [w, pageHeight(meta, w, pw)] as [string, number]).sort((a, b) => b[1] - a[1])[0];
  const room: Record<string, boolean> = {};
  for (const way of LEX28_WAYS) {
    const L = lex28Layout(half, true, way, 'reaping');
    if (way !== 'pages' && way !== 'groups') assert.equal(L.cells.length, 28, `${way}: every stone`);
    for (const c of L.cells) {
      assert.ok(c.r.w >= TOUCH_MIN && c.r.h >= TOUCH_MIN, `${way}: ${c.w}'s stone ${c.r.w} by ${c.r.h}`);
      assert.ok(c.r.x >= half.x && c.r.y >= half.y && c.r.x + c.r.w <= half.x + half.w && c.r.y + c.r.h <= L.shelfY, `${way}: ${c.w}'s stone off the half`);
      for (const d of L.cells) if (d !== c) assert.ok(c.r.x + c.r.w <= d.r.x || d.r.x + d.r.w <= c.r.x || c.r.y + c.r.h <= d.r.y || d.r.y + d.r.h <= c.r.y, `${way}: ${c.w} on ${d.w}`);
      assert.ok(c.r.y + c.r.h <= L.page.y || c.r.x + c.r.w <= L.page.x, `${way}: ${c.w} on the page`);
    }
    if (L.arrows) for (const a of [L.arrows.prev, L.arrows.next]) assert.ok(a.w >= TOUCH_MIN && a.h >= TOUCH_MIN, `${way}: an arrow ${a.w} by ${a.h}`);
    const [w, h] = longest(L.page.w);
    room[way] = h <= L.page.h;
    if (way === 'side') assert.ok(room[way], `the way picked: ${w}'s page is ${h} tall, its room ${L.page.h}`);
  }
  assert.equal(room.rows, false, "the game's own rows leave too little room (why the ways were drawn)");
});

test("8. the Lexicon in pages by what they do ('groups'): all 28 words, each once; each page's tabs and stones at the touch size, inside, apart; the longest page fits; with LEX28 'rows' nothing changes", () => {
  // the five pages: every word on one, none on two, none left out; nine at most a page (one row of stones)
  const all = LEX_PAGES.flatMap((p) => [...p.words]);
  assert.equal(LEX_PAGES.length, 5);
  assert.equal(all.length, 28, 'twenty-eight places');
  assert.equal(new Set(all).size, 28, 'no word on two pages');
  assert.deepEqual([...all].sort(), [...WORD_IDS].sort(), 'every word on a page');
  for (const w of WORD_IDS) assert.ok(LEX_PAGES[lexPageOf(w)].words.includes(w), `${w}: its page`);
  // the lectern's half on a phone held sideways, every word found and every use known
  const half = { x: 0, y: 0, w: 254, h: 234 };
  const meta = newMeta();
  for (const w of WORD_IDS) Object.assign(meta.known[w], { found: true, front: true, behind: true, gear: true, dungeon: true });
  type R = { x: number; y: number; w: number; h: number };
  const apart = (a: R, b: R): boolean => a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
  const within = (a: R, b: R): boolean => a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
  LEX_PAGES.forEach((p, i) => {
    assert.ok(p.words.length >= 1 && p.words.length <= 9, `${p.name}: ${p.words.length} words`);
    // opened by one of its words, or by its tab: the same page
    for (const L of [lex28Layout(half, true, 'groups', p.words[p.words.length - 1]), lex28Layout(half, true, 'groups', null, i), lex28Layout(half, true, 'groups', 'power', i)]) {
      assert.equal(L.tab, i, `${p.name}: the open tab`);
      assert.deepEqual(L.cells.map((c) => c.w), [...p.words], `${p.name}: its own stones, in order`);
      // the tabs: five, a row across the top, the touch size, inside the half, apart; each name's two lines inside its tab
      assert.equal(L.tabs?.length, 5);
      const tabs = L.tabs ?? [];
      tabs.forEach((t, j) => {
        assert.ok(t.w >= TOUCH_MIN && t.h >= TOUCH_MIN, `${LEX_PAGES[j].name}'s tab ${t.w} by ${t.h}`);
        assert.ok(within(t, half), `${LEX_PAGES[j].name}'s tab off the half`);
        for (const u of tabs) if (u !== t) assert.ok(apart(t, u), 'two tabs on one another');
        for (const line of LEX_PAGES[j].tab) assert.ok(textWidth(line, 'small') <= t.w - 4, `"${line}" (${textWidth(line, 'small')}) in a tab ${t.w} across`);
        assert.ok(11 <= t.h - 4, 'two lines of its name in its height');
        assert.ok(t.y + t.h <= L.page.y, 'a tab on the page');
      });
      // the stones: the touch size, inside the half, apart from one another and from the tabs, above the page and the shelf
      for (const c of L.cells) {
        assert.ok(c.r.w >= TOUCH_MIN && c.r.h >= TOUCH_MIN, `${c.w}'s stone ${c.r.w} by ${c.r.h}`);
        assert.ok(within(c.r, half) && c.r.y + c.r.h <= L.shelfY, `${c.w}'s stone off the half`);
        for (const d of L.cells) if (d !== c) assert.ok(apart(c.r, d.r), `${c.w} on ${d.w}`);
        for (const t of tabs) assert.ok(apart(c.r, t), `${c.w} on a tab`);
        assert.ok(c.r.y + c.r.h <= L.page.y, `${c.w} on the page`);
      }
      // the open word's page: the half's width, above the shelf; the longest page of all (every word's) written whole in it
      assert.ok(within(L.page, half) && L.page.y + L.page.h <= L.shelfY, 'the page off the half');
      const tallest = WORD_IDS.map((w) => [w, pageHeight(meta, w, L.page.w)] as [string, number]).sort((a, b) => b[1] - a[1])[0];
      assert.ok(tallest[1] <= L.page.h, `${p.name}: ${tallest[0]}'s page is ${tallest[1]} tall, its room ${L.page.h}`);
    }
  });
  // Reaping's page (the longest, as before) whole on its own page, where the game's own rows leave it short
  const G = lex28Layout(half, true, 'groups', 'reaping');
  assert.ok(pageHeight(meta, 'reaping', G.page.w) <= G.page.h, `Reaping's page ${pageHeight(meta, 'reaping', G.page.w)}, its room ${G.page.h}`);
  assert.equal(G.page.w, 242, "the half's whole width");
  // with LEX28 'rows' (the game's own) nothing changes: the switch as it is, no page opened by a tab, nothing marked; its layout the
  // game's own (ui/lexicon.ts lexLayout, lexiconSide's stones), no tabs
  assert.equal(LEX28.way, 'rows');
  assert.equal(LEX28.tab, null);
  assert.deepEqual(LEX28.fresh, []);
  const own = lexLayout(half, true);
  for (const tab of [null, 2]) {
    const L = lex28Layout(half, true, 'rows', 'reaping', tab);
    assert.equal(L.tabs, null);
    assert.deepEqual(L.page, { x: own.x0, y: own.pageY, w: own.bw, h: own.pageH });
    assert.deepEqual(L.cells.map((c) => c.r), WORD_IDS.map((_, i) => ({ x: own.x0 + (i % own.perRow) * own.pitch, y: own.bodyY + Math.floor(i / own.perRow) * 22, w: 20, h: 20 })));
  }
});
