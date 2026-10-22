// BINDING AT WORK (src/render/binding3.ts): a mock-up behind a switch that is off. His pick for its look,
// 21 Oct 2026: “Bands of written words (Recommended)”. Its rules are the main chat's to write. These hold:
//   1. the switch: it is off, and everything the renderer and main.ts ask of it is behind it;
//   2. with it off, nothing here draws, lights or tints anything, whatever it is told;
//   3. its colours: six tones, darkest to white-hot, told apart from every other word, the melds, the
//      friend's cyan and the enemy's pink and gold; nothing of it glows cyan or pink; a monster's
//      Binding is the enemy's own pink and gold, nothing cyan;
//   4. its rune: 7 by 7, cut as the others are, its own;
//   5. in front: three bands leap, wrap, snap tight and are pinned, then unravel when the hold runs out;
//   6. behind: the snare is drawn here and left out of the renderer; sprung, it binds and burns out;
//   7. on a monster: the hero's legs bound in the enemy's colours; a hold broken early unravels; all
//      forgotten on a new level.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { GLYPH, WORD_COLOR } from '../src/art/icons';
import type { Game } from '../src/game/game';
import type { Monster, Zone } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { MELD_GLYPH, MELD_RAMP } from '../src/render/melds3';
import { NEW_GLYPH, NEW_RAMP } from '../src/render/words3';
import {
  B3, BINDING3, BIND_ENEMY, BIND_GLYPH, BIND_RAMP, BIND_TIME, airB3, bindOn, clearB3, eventsB3, floorB3, isSnare, lightsB3, ownsZoneB3, rootHero, snareSprung, tickB3, tintB3, unbind,
} from '../src/render/binding3';

function monster(id: number, x: number, y: number): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', champion: false, boss: false, elite: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0 } as unknown as Monster;
}
const level = {};
function game(monsters: Monster[] = [], zones: Zone[] = []): Game {
  return { level, hero: { x: 10, y: 10, fx: 1, fy: 0 }, monsters, projectiles: [], zones } as unknown as Game;
}
function canvas(): { g: CanvasRenderingContext2D; drawn: () => number } {
  let n = 0;
  const g = { fillStyle: '', globalAlpha: 1, fillRect: () => n++, beginPath: () => {}, ellipse: () => n++, fill: () => {}, canvas: { width: 400, height: 300 } };
  return { g: g as unknown as CanvasRenderingContext2D, drawn: () => n };
}
const cam: Cam = { ox: 200, oy: 100, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;
function snare(x: number, y: number): Zone {
  return { x, y, r: 1, t: 0.5, dur: 9999, kind: 'rune', element: 'phys', dmg: 0, slow: 0, tick: 0, hostile: false, skill: -1, words: [], from: '', look: 'binding' } as unknown as Zone;
}
function run(secs: number, g: Game, fx: Fx): void {
  for (let i = 0; i < Math.round(secs * 60); i++) tickB3(1 / 60, g, fx);
}
const on = <T>(fn: () => T): T => {
  const was = BINDING3.on;
  BINDING3.on = true;
  try {
    return fn();
  } finally {
    BINDING3.on = was;
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

test('1. the switch is off, and everything the renderer and main.ts ask of Binding is behind it', () => {
  assert.equal(BINDING3.on, false);
  const hooks: Record<string, string[]> = { 'render.ts': ['tickB3(', 'floorB3(', 'tintB3(', 'airB3(', 'lightsB3('], '../main.ts': ['eventsB3('] };
  for (const [file, calls] of Object.entries(hooks)) {
    const lines = (readFileSync(new URL(`../src/render/${file}`, import.meta.url), 'utf8') as string).split('\n');
    let found = 0;
    lines.forEach((line, i) => {
      if (line.trimStart().startsWith('import')) return;
      for (const c of calls) {
        if (!line.includes(c)) continue;
        found++;
        const guarded = line.includes('BINDING3.on') || lines.slice(Math.max(0, i - 3), i).some((l) => /if \(BINDING3\.on/.test(l));
        assert.ok(guarded, `${file} line ${i + 1} calls ${c} without the switch: ${line.trim()}`);
      }
    });
    assert.ok(found >= calls.length, `every hook is found in ${file}`);
  }
  assert.equal(ownsZoneB3(snare(1, 1)), false, 'with the switch off the renderer keeps every patch');
});

test('2. with the switch off, nothing here draws, lights or tints anything, whatever it is told', () => {
  clearB3();
  const fx = new Fx();
  const m = monster(1, 11, 10);
  const gm = game([m], [snare(12, 10)]);
  eventsB3([{ t: 'bind', id: 1, secs: 2 }, { t: 'rooted', x: 11, y: 10, secs: 2 }, { t: 'snareSprung', id: 1, x: 12, y: 10, secs: 2 }], gm, fx);
  run(0.5, gm, fx);
  const c = canvas();
  floorB3(c.g, cam, 1, gm, everywhere);
  airB3(c.g, cam, 1, gm);
  let lit = 0;
  lightsB3(() => lit++, cam, gm, 1);
  assert.equal(c.drawn(), 0);
  assert.equal(lit, 0);
  assert.equal(B3.holds.length + B3.burns.length, 0);
  assert.equal(fx.particles.length + fx.rings.length + fx.flashes.length, 0);
  assert.equal(tintB3(m), null);
});

test("3. its colours: told apart from every word, the melds, the friend and the enemy; nothing cyan or pink; a monster's in the enemy's own", () => {
  const others: Record<string, string> = { ...(WORD_COLOR as Record<string, string>), cyan: '#28dcf0', runedust: '#5ce8f8', pink: '#ff4f8a', gold: '#ffd27a' };
  for (const [w, r] of Object.entries(NEW_RAMP)) others[w] = r[3];
  for (const [w, r] of Object.entries(MELD_RAMP)) others[w] = r[3];
  // (the five Volatile melds' colours, the art chat's mockup/volatile-melds, his yes 21 Oct)
  Object.assign(others, { demolition: '#a08ab4', powderkeg: '#a83c28', shatter: '#7c7cf0', chainreaction: '#e8b8ff', rupture: '#9c4890' });
  delete others.binding;
  assert.equal(BIND_RAMP.length, 6);
  const L = BIND_RAMP.map((c) => lab(c)[0]);
  for (let i = 1; i < 6; i++) assert.ok(L[i] > L[i - 1], `tone ${i} lighter than tone ${i - 1}`);
  for (const [o, c] of Object.entries(others)) assert.ok(de2000(BIND_RAMP[3], c) >= 12, `${o}: ${de2000(BIND_RAMP[3], c).toFixed(1)}`);
  for (const c of BIND_RAMP) {
    const [h, s, v] = hsv(c);
    if (s < 0.3 || v < 0.45) continue;
    assert.ok(!(h > 170 && h < 200) && !(h > 315 && h < 350), `${c} glows cyan or pink`);
  }
  for (const c of BIND_ENEMY) {
    const [h, s] = hsv(c);
    assert.ok(!(s > 0.3 && h > 170 && h < 200), `the monster's ${c} is cyan`);
  }
  assert.equal(BIND_ENEMY[4], '#ff4f8a', "the monster's script the enemy's pink");
  assert.equal(BIND_ENEMY[5], '#ffd27a', 'burning to gold');
});

test('4. its rune: 7 by 7, cut as the others are, its own', () => {
  assert.equal(BIND_GLYPH.length, 7);
  for (const row of BIND_GLYPH) assert.match(row, /^[.Xo]{7}$/);
  const flat = BIND_GLYPH.join('');
  assert.ok(flat.includes('X') && flat.includes('o'));
  const all = [...Object.values(GLYPH), ...Object.values(MELD_GLYPH), ...Object.values(NEW_GLYPH)].map((g) => g.join('/'));
  assert.ok(!all.includes(BIND_GLYPH.join('/')));
});

test('5. in front: three bands leap, wrap, snap tight and are pinned; when the hold runs out they unravel', () => {
  on(() => {
    clearB3();
    const fx = new Fx();
    const m = monster(3, 12, 10);
    const gm = game([m]);
    tickB3(1 / 60, gm, fx);
    eventsB3([{ t: 'bind', id: 3, secs: 2 }], gm, fx);
    assert.equal(B3.holds.length, 1);
    const h = B3.holds[0];
    assert.equal(h.bands.length, 3, 'three bands');
    assert.equal(h.pegs.length, 3, 'pinned at three pegs');
    assert.ok(!h.enemy);
    assert.ok(h.pegs.every(([x, y]) => Math.hypot(x - m.x, y - m.y) < 1.2), 'the pegs round it');
    const c0 = canvas();
    airB3(c0.g, cam, 0, gm);
    assert.ok(c0.drawn() > 0, 'the bands drawn as they leap');
    run(BIND_TIME.wrap + 0.02, gm, fx);
    assert.ok(tintB3(m) || fx.flashes.length > 0, 'it is lit as they snap tight');
    assert.ok(fx.shake > 0, 'the snap kicks');
    const c1 = canvas();
    airB3(c1.g, cam, 1, gm);
    assert.ok(c1.drawn() > 100, `the held one bound round (${c1.drawn()})`);
    const before = fx.particles.length;
    run(2 - BIND_TIME.wrap - 0.2, gm, fx);
    assert.ok(fx.particles.length > before, 'the letters peel off as it unravels');
    run(0.3, gm, fx);
    assert.equal(B3.holds.length, 0, 'gone when the hold runs out');
  });
});

test('6. behind: the snare is drawn here and left out of the renderer; sprung, it binds and burns out', () => {
  on(() => {
    clearB3();
    const fx = new Fx();
    const z = snare(14, 10);
    const m = monster(4, 14.2, 10);
    const gm = game([m], [z]);
    assert.ok(isSnare(z) && ownsZoneB3(z));
    assert.equal(ownsZoneB3({ ...z, look: undefined } as unknown as Zone), false, "another word's patch is the renderer's");
    const c = canvas();
    floorB3(c.g, cam, 1, gm, everywhere);
    assert.ok(c.drawn() > 100, 'the snare is drawn lying in wait');
    let lit = 0;
    lightsB3(() => lit++, cam, gm, 1);
    assert.ok(lit > 0, 'and gives light');
    eventsB3([{ t: 'snareSprung', id: 4, x: 14, y: 10, secs: 2 }], gm, fx);
    assert.equal(B3.burns.length, 1, 'the sigil burns out');
    assert.equal(B3.holds.length, 1, 'what crossed it is bound');
    assert.ok(B3.holds[0].bands.every((b) => b.fromX === 14 && b.fromY === 10), 'the bands leap out of the snare');
    run(BIND_TIME.sprung + 0.05, gm, fx);
    assert.equal(B3.burns.length, 0);
  });
});

test('7. on a monster: the hero rooted in the enemy\'s colours; a hold broken early unravels; all forgotten on a new level', () => {
  on(() => {
    clearB3();
    const fx = new Fx();
    const m = monster(5, 13, 12);
    const gm = game([m]);
    tickB3(1 / 60, gm, fx);
    eventsB3([{ t: 'rooted', x: 13, y: 12, secs: 1.5 }], gm, fx);
    const h = B3.holds[0];
    assert.equal(h.id, -1, 'the hero');
    assert.ok(h.enemy, "in the enemy's colours");
    assert.ok(h.bands.every((b) => b.h < 0.4), 'round his legs');
    assert.ok(h.bands.every((b) => b.fromX === 13 && b.fromY === 12), 'flung from the monster');
    run(0.4, gm, fx);
    unbind(-1);
    assert.ok(h.t >= h.dur - BIND_TIME.unravel, 'broken early, it unravels at once');
    bindOn(fx, gm, 5, 3);
    rootHero(fx, gm, 2, 13, 12);
    snareSprung(fx, gm, 5, 13, 12, 2);
    assert.ok(B3.holds.length > 0 && B3.burns.length > 0);
    tickB3(1 / 60, { ...gm, level: {} } as unknown as Game, fx);
    assert.equal(B3.holds.length + B3.burns.length + B3.later.length, 0, 'a new level forgets them');
  });
});
