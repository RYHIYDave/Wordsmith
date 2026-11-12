// THE SEVEN NEW WORDS' LOOKS (src/render/words7.ts): a mock-up of the art chat's behind a switch that is off. His words (the main
// chat's board post, 8 Nov 2026, 07:55): “I want 6 more words for the last levels”, “At least 6”, “Add mirroring as well”. Their rules are
// the main chat's to write. These hold:
//   1. the switch is off, and everything the renderer asks of it is behind it; nothing else of the game reaches it;
//   2. with it off, nothing here draws, lights, changes a picture or keeps time, whatever it is told;
//   3. their colours: six tones each, darkest to white-hot; each word's own colour at least 12 from every other word, the melds, the
//      friend's cyan, the enemy's pink and gold and one another, as the eye sees colour (CIEDE2000, Binding's check); Plundering's
//      brass, glow and white-hot all clear of the enemy's gold; nothing of theirs glows cyan or pink;
//   4. their runes: 7 by 7, cut as the others are, each its own;
//   5. every side of every word draws at its moment, in the layers it says, every pixel on a whole pixel (crisp);
//   6. every monster's side is in the enemy's colours (its pink there, nothing cyan); what fights for him shows his cyan;
//   7. its times as the pictures want them (the lance half a second after, the spirit's 6 s); forgotten on a new level.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { GLYPH, WORD_COLOR } from '../src/art/icons';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { MELD_GLYPH, MELD_RAMP } from '../src/render/melds3';
import { NEW_GLYPH, NEW_RAMP } from '../src/render/words3';
import { BIND_GLYPH, BIND_RAMP } from '../src/render/binding3';
import { VMELD_GLYPH } from '../src/render/volatile3';
import {
  ownsZoneW7, W7, W7_ENEMY, W7_FRIEND, W7_GLYPH, W7_RAMP, W7_SIDES, W7_TIME, W7_WORDS, WORDS7_LOOK, airW7, clearW7, floorW7, heroW7, lightsW7, lookW7, lyingW7, playW7, tickW7,
} from '../src/render/words7';
import type { W7Side, W7Word } from '../src/render/words7';

function monster(id: number, x: number, y: number): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', champion: false, boss: false, elite: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0, fx: -1, fy: 0 } as unknown as Monster;
}
const level = {};
function game(monsters: Monster[] = []): Game {
  return { level, hero: { x: 10, y: 10, fx: 1, fy: 0 }, monsters, projectiles: [], zones: [] } as unknown as Game;
}
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
    beginPath: () => {},
    rect: () => {},
    clip: () => {},
    save: () => {},
    restore: () => {},
    drawImage: () => {},
    fill: () => {},
    canvas: { width: 600, height: 300 },
  };
  return { g: g as unknown as CanvasRenderingContext2D, drawn: () => n, colours, crisp: () => whole };
}
const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;
const on = <T>(fn: () => T): T => {
  const was = WORDS7_LOOK.on;
  WORDS7_LOOK.on = true;
  try {
    return fn();
  } finally {
    WORDS7_LOOK.on = was;
  }
};
// (THE SWITCH IS ON SINCE THE TEN NEW WORDS WENT LIVE, 11 Nov 2026: what is asked of it switched off is asked with it put off)
const off = <T>(fn: () => T): T => {
  const was = WORDS7_LOOK.on;
  WORDS7_LOOK.on = false;
  try {
    return fn();
  } finally {
    WORDS7_LOOK.on = was;
  }
};

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

/**
 * Each side of each word set up as the sheet has it (tools/scenarios/words7_looks.mjs), at its moment. (Culling in front: its
 * blade now comes after an instant held, step 2b: its moment is the blade halfway through.)
 */
function stage(word: W7Word, side: W7Side): { gm: Game; at: number } {
  clearW7();
  const ms = [monster(1, 11.2, 9.2), monster(2, 12.2, 8.2), monster(3, 13.2, 7.2)];
  const gm = game(ms);
  const at: Record<string, number> = {
    'piercing:front': 0.152, 'piercing:behind': 0.66, 'piercing:monster': 0.6, 'bleeding:front': 0.32, 'bleeding:behind': 0.9, 'bleeding:monster': 0.12,
    'reaping:front': 0.3, 'reaping:behind': 0.14, 'reaping:monster': 0.62, 'culling:front': W7_TIME.cullHold + W7_TIME.cullSweep / 2, 'culling:behind': 0.4, 'culling:monster': 0.1,
    'surging:front': 0.17, 'surging:behind': 0.15, 'surging:monster': 1.15, 'plundering:front': 0.3, 'plundering:behind': 0.3, 'plundering:monster': 0.24,
    'mirroring:front': 0.07, 'mirroring:behind': 0.06, 'mirroring:monster': 0.17,
  };
  const t = at[`${word}:${side}`];
  const base = { x: 11, y: 9.5, x1: 13.5, y1: 7.5, dx: 0.7, dy: -0.7, ids: [1, 2, 3], dur: 30, seed: 5, t };
  if (word === 'piercing' && side === 'front') Object.assign(base, { x: 10.3, y: 9.7, pts: [0.8, 2.2, 3.6], r: 6 });
  if (word === 'piercing' && side === 'monster') Object.assign(base, { x: 10.6, y: 3.2, x1: 10, y1: 10, r: 2.7 });
  if (word === 'bleeding' && side === 'front') Object.assign(base, { pts: [10.5, 9.6, 10.8, 9.4, 11, 9.3] });
  if (word === 'reaping' && side === 'behind') Object.assign(base, { pts: [0.1] });
  if (word === 'culling' && side === 'behind') Object.assign(base, { pts: [0.3] });
  if (word === 'surging') Object.assign(base, { r: 2.2 });
  playW7(word, side, base);
  return { gm, at: t };
}

test('1. the switch is on (since the ten new words went live), everything the renderer asks of it is behind it, and nothing else of the game reaches it but the effects, which leave their stand-ins out for it', () => {
  assert.equal(WORDS7_LOOK.on, true, 'on since the ten new words went live (his yes to their film, 9 Nov 2026)');
  const calls = ['tickW7(', 'floorW7(', 'airW7(', 'lightsW7(', 'lookW7(', 'heroW7(', 'fallenW7(', 'lyingW7(', 'spiritsW7('];
  const lines = (readFileSync(new URL('../src/render/render.ts', import.meta.url), 'utf8') as string).split('\n');
  let found = 0;
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith('import')) return;
    for (const c of calls) {
      if (!line.includes(c)) continue;
      found++;
      const guarded = line.includes('WORDS7_LOOK.on') || lines.slice(Math.max(0, i - 3), i).some((l) => /if \(WORDS7_LOOK\.on/.test(l));
      assert.ok(guarded, `render.ts line ${i + 1} calls ${c} without the switch: ${line.trim()}`);
    }
  });
  assert.equal(found, calls.length, 'every hook is found in render.ts, once');
  // what of the game imports it: the renderer (behind the switch), main.ts (its events, its runes and colours, the playtest's hands,
  // __dbg.words7) and the effects (render/fx.ts: ownsEventW7, the stand-ins left out while it is on) only
  const importers: string[] = [];
  const walk = (dir: string): void => {
    for (const f of readdirSync(dir) as string[]) {
      const p = `${dir}/${f}`;
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes('/dev/') && /from '\.{1,2}\/(render\/)?words7'/.test(readFileSync(p, 'utf8') as string)) importers.push(p.replace(/^.*\/src\//, ''));
    }
  };
  walk(new URL('../src', import.meta.url).pathname);
  assert.deepEqual(importers.sort(), ['main.ts', 'render/fx.ts', 'render/render.ts']);
  const main = (readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8') as string).split('\n');
  const calls7 = main.filter((l) => /eventsW7\(|tickW7\(|playW7\(/.test(l) && !l.trimStart().startsWith('import'));
  assert.equal(calls7.length, 1, 'main.ts calls up the looks once, by the events');
  assert.ok(calls7[0].includes('WORDS7_LOOK.on'), `main.ts calls the looks without the switch: ${calls7[0].trim()}`);
  assert.equal(off(() => ownsZoneW7({ kind: 'thorns' })), false, 'with the switch off the renderer keeps every patch');
  assert.equal(ownsZoneW7({ kind: 'thorns' }), true, 'and on, the thorns are the look\'s');
});

test('2. with the switch off, nothing here draws, lights, changes a picture or keeps time, whatever it is told', () => off(() => {
  assert.equal(WORDS7_LOOK.on, false);
  for (const word of W7_WORDS) {
    for (const side of W7_SIDES) {
      const { gm } = stage(word, side);
      const fx = new Fx();
      const t0 = W7.acts[0].t;
      tickW7(0.5, gm, fx);
      assert.equal(W7.acts[0].t, t0, 'its clock stands still');
      const c = canvas();
      floorW7(c.g, cam, 1, gm, everywhere);
      airW7(c.g, cam, 1, gm);
      let lit = 0;
      lightsW7(() => lit++, cam, gm, 1);
      assert.equal(c.drawn(), 0, `${word} ${side} drew`);
      assert.equal(lit, 0);
      for (const m of gm.monsters) assert.equal(lookW7(m, {} as never), null);
      assert.deepEqual(heroW7({} as never, gm.hero, cam), []);
      assert.equal(lyingW7({}), null);
      assert.equal(fx.particles.length + fx.rings.length + fx.flashes.length, 0);
    }
  }
  assert.equal(W7.heroSp, null, 'not even the hero is looked at');
  clearW7();
}));

test('3. their colours: six tones, told apart from every word, the melds, the friend, the enemy and one another; Plundering clear of the gold; nothing cyan or pink', () => {
  const others: Record<string, string> = { ...(WORD_COLOR as Record<string, string>), cyan: '#28dcf0', runedust: '#5ce8f8', pink: '#ff4f8a', gold: '#ffd27a', binding: BIND_RAMP[3] };
  for (const [w, r] of Object.entries(NEW_RAMP)) others[`new ${w}`] = r[3];
  for (const [w, r] of Object.entries(MELD_RAMP)) others[`meld ${w}`] = r[3];
  for (const k of Object.keys(others)) if (/2$/.test(k)) delete others[k];
  // (the main chat's stand-ins for these seven and his three, in art/icons.ts since its words10, are what these colours replace:
  // the three are the art chat's, render/words10.ts, and are held apart from these in tests/words10.test.ts)
  for (const k of ['piercing', 'bleeding', 'reaping', 'culling', 'surging', 'plundering', 'mirroring', 'lasting', 'fleeting', 'vast']) delete others[k];
  let nearest = 99;
  for (const w of W7_WORDS) {
    const R = W7_RAMP[w];
    assert.equal(R.length, 6, w);
    const L = R.map((c) => lab(c)[0]);
    for (let i = 1; i < 6; i++) assert.ok(L[i] > L[i - 1], `${w}: tone ${i} lighter than tone ${i - 1}`);
    for (const [o, c] of Object.entries(others)) {
      const d = de2000(R[3], c);
      nearest = Math.min(nearest, d);
      assert.ok(d >= 12, `${w} is ${d.toFixed(1)} from ${o}`);
    }
    for (const v of W7_WORDS) if (v !== w) assert.ok(de2000(R[3], W7_RAMP[v][3]) >= 12, `${w} and ${v}: ${de2000(R[3], W7_RAMP[v][3]).toFixed(1)}`);
    for (const c of R) assert.ok(!cyanish(c) && !pinkish(c), `${w}'s ${c} glows cyan or pink`);
  }
  assert.ok(nearest >= 12);
  for (const i of [3, 4, 5]) assert.ok(de2000(W7_RAMP.plundering[i], '#ffd27a') >= 12, `Plundering's tone ${i} is ${de2000(W7_RAMP.plundering[i], '#ffd27a').toFixed(1)} from the enemy's gold`);
  assert.equal(W7_ENEMY[4], '#ff4f8a', "a monster's side: the enemy's pink");
  assert.equal(W7_ENEMY[5], '#ffd27a', 'burning to gold');
  for (const c of W7_ENEMY) assert.ok(!cyanish(c));
  for (const c of W7_FRIEND.slice(2)) assert.ok(cyanish(c), `${c}: the friend's cyan`);
});

test('4. their runes: 7 by 7, cut as the others are, each its own', () => {
  const all = [...Object.values(GLYPH), ...Object.values(MELD_GLYPH), ...Object.values(NEW_GLYPH), ...Object.values(VMELD_GLYPH), BIND_GLYPH].map((g) => g.join('/'));
  const mine = new Set<string>();
  for (const w of W7_WORDS) {
    const g = W7_GLYPH[w];
    assert.equal(g.length, 7, w);
    for (const row of g) assert.match(row, /^[.Xo]{7}$/, w);
    const flat = g.join('');
    assert.ok(flat.includes('X') && flat.includes('o'), `${w}: its colour and its glow`);
    assert.ok(!all.includes(g.join('/')), `${w}'s rune is another's`);
    mine.add(g.join('/'));
  }
  assert.equal(mine.size, 7);
});

test('5. every side of every word draws at its moment, in its layers, every pixel on a whole pixel', () => {
  on(() => {
    for (const word of W7_WORDS) {
      for (const side of W7_SIDES) {
        const { gm } = stage(word, side);
        const fl = canvas();
        const air = canvas();
        floorW7(fl.g, cam, 1, gm, everywhere);
        airW7(air.g, cam, 1, gm);
        assert.ok(fl.drawn() + air.drawn() > 40, `${word} ${side}: only ${fl.drawn() + air.drawn()} pixels`);
        assert.ok(fl.crisp() && air.crisp(), `${word} ${side}: a pixel off the grid`);
        let lit = 0;
        lightsW7(() => lit++, cam, gm, 1);
        assert.ok(lit > 0, `${word} ${side} gives no light`);
      }
    }
    clearW7();
  });
});

test("6. every monster's side is in the enemy's colours; what fights for him shows his cyan", () => {
  on(() => {
    for (const word of W7_WORDS) {
      const { gm } = stage(word, 'monster');
      const c = canvas();
      floorW7(c.g, cam, 1, gm, everywhere);
      airW7(c.g, cam, 1, gm);
      const cols = [...c.colours];
      assert.ok(!cols.some(cyanish), `${word} on a monster shows cyan: ${cols.filter(cyanish)}`);
      assert.ok(cols.includes('#ff4f8a') || cols.includes('#c02860'), `${word} on a monster: no pink in ${cols.join(' ')}`);
    }
    for (const [word, side] of [['reaping', 'behind'], ['mirroring', 'front']] as [W7Word, W7Side][]) {
      const { gm } = stage(word, side);
      const c = canvas();
      airW7(c.g, cam, 1, gm);
      assert.ok([...c.colours].some((x) => W7_FRIEND.includes(x)), `${word} ${side}: his cyan`);
      assert.ok(![...c.colours].some(pinkish), `${word} ${side}: the enemy's pink on his own`);
    }
    clearW7();
  });
});

test("7. its times as the pictures want them; a hit's flash; forgotten on a new level", () => {
  assert.equal(W7_TIME.lanceWait, 0.5, "the lance comes down half a second after (the rules')");
  assert.equal(W7_TIME.spirit, 6, "the spirit fights for 6 s (the rules')");
  on(() => {
    // (joined to the level the stage stands on, as the renderer's first tick there does)
    tickW7(0, game(), new Fx());
    const { gm } = stage('piercing', 'front');
    // the third it went through, lit an instant as the streak goes through it
    const a = W7.acts[0];
    a.t = (3.6 + 0.02 * W7_TIME.pierceSpeed) / W7_TIME.pierceSpeed;
    const look = lookW7(gm.monsters[2], {} as never);
    assert.ok(look && look.tint, 'lit as it is pierced');
    assert.equal(lookW7(monster(9, 1, 1), {} as never), null, 'nothing else changed');
    // a new level forgets everything
    const fx = new Fx();
    tickW7(0.1, gm, fx);
    assert.equal(W7.acts.length, 1);
    tickW7(0.1, { ...gm, level: {} } as unknown as Game, fx);
    assert.equal(W7.acts.length, 0);
    clearW7();
  });
});
