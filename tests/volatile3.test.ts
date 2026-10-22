// THE FIVE VOLATILE MELDS AT WORK (src/render/volatile3.ts): a mock-up behind a switch that is off.
// His words to the art chat, 21 Oct 2026, 19:31 Pacific: “I’ll need animations for the volatile melds
// I’m adding to the damage melds”. Their rules are the main chat's to write. These tests hold:
//   1. the switch: it is off, and everything the renderer, the effects and main.ts ask of the module
//      is behind it;
//   2. with it off, nothing here draws, moves or lights anything, whatever it is told;
//   3. the colours: six tones each, darkest to white-hot, each word's own told apart from every
//      other word's, the ten melds', the friend's cyan and the enemy's pink and gold;
//   4. nothing glows in the friend's cyan or the enemy's pink;
//   5. the runes: 7 by 7, cut as the others are, each its own;
//   6. each blast is big (light, a ring, a shake, things flung), a rune's bigger than a kill's,
//      Demolition's the biggest, and none piles up past the effects' limit;
//   7. the twists land where the rules say: what is thrown or struck at a monster comes down on it,
//      and lights it; Shatter's rune lays its ice; Chain Reaction's link runs rune to rune;
//   8. the runes and the patches of the five are drawn here and left out of the renderer's own, and
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
import {
  V3, VMELD_GLYPH, VMELD_IDS, VMELD_RAMP, VOLATILE3, VRUNE, airV3, clearV3, eventsV3, floorV3, lightsV3, overV3, ownsEventV3, ownsZoneV3, shiftV3, tickV3, tintV3, vmeldOf,
} from '../src/render/volatile3';
import type { VMeldId, VolFx } from '../src/render/volatile3';

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
function rune(word: VMeldId, x: number, y: number, r = 2, t = 0.5): Zone {
  return { x, y, r, t, dur: 1.2, kind: 'rune', element: 'phys', dmg: 1, slow: 0, tick: 0, hostile: false, skill: 0, words: [], from: '', look: word } as unknown as Zone;
}
/** Run the module's clock on for `secs`, in steps of a sixtieth. */
function run(secs: number, g: Game, fx: Fx): void {
  for (let i = 0; i < Math.round(secs * 60); i++) tickV3(1 / 60, g, fx);
}
const on = <T>(fn: () => T): T => {
  const was = VOLATILE3.on;
  VOLATILE3.on = true;
  try {
    return fn();
  } finally {
    VOLATILE3.on = was;
  }
};

// ---- colour, as the eye sees it (CIEDE2000)
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

test('1. the switch is off, and everything the renderer, the effects and main.ts ask of the five is behind it', () => {
  assert.equal(VOLATILE3.on, false);
  const hooks: Record<string, string[]> = {
    'render.ts': ['tickV3(', 'floorV3(', 'shiftV3(', 'tintV3(', 'airV3(', 'overV3(', 'lightsV3('],
    '../main.ts': ['eventsV3('],
  };
  for (const [file, calls] of Object.entries(hooks)) {
    const lines = (readFileSync(new URL(`../src/render/${file}`, import.meta.url), 'utf8') as string).split('\n');
    let found = 0;
    lines.forEach((line, i) => {
      if (line.trimStart().startsWith('import')) return;
      for (const c of calls) {
        if (!line.includes(c)) continue;
        found++;
        const guarded = line.includes('VOLATILE3.on') || lines.slice(Math.max(0, i - 3), i).some((l) => /if \(VOLATILE3\.on/.test(l));
        assert.ok(guarded, `${file} line ${i + 1} calls ${c} without the switch: ${line.trim()}`);
      }
    });
    assert.ok(found >= calls.length, `every hook is found in ${file}`);
  }
  // (the two the renderer and the effects ask whether to leave a thing to the five: false while it is off)
  assert.equal(ownsZoneV3(rune('demolition', 1, 1)), false);
  assert.equal(ownsEventV3({ t: 'burst', x: 1, y: 1, r: 1.8, el: 'phys', style: 'ruin', meld: 'demolition' }), false);
});

test('2. with the switch off, nothing here draws, moves or lights anything, whatever it is told', () => {
  clearV3();
  const fx = new Fx();
  const m = monster(1, 11, 10);
  const z = rune('powderkeg', 11, 10);
  const gm = game([m], [z]);
  eventsV3([{ t: 'burst', x: 11, y: 10, r: 1.8, el: 'phys', style: 'blast', meld: 'demolition' }, { t: 'volFx', meld: 'shatter', what: 'shard', id: 1, x0: 10, y0: 10, x1: 11, y1: 10 } as VolFx], gm, fx);
  run(0.5, gm, fx);
  const c = canvas();
  floorV3(c.g, cam, 1, gm, everywhere);
  airV3(c.g, cam, 1, gm);
  overV3(c.g, cam, 1);
  let lit = 0;
  lightsV3(() => lit++, cam, gm, 1);
  assert.equal(c.drawn(), 0, 'nothing drawn');
  assert.equal(lit, 0, 'nothing lit');
  assert.equal(fx.particles.length + fx.rings.length + fx.flashes.length + fx.glows.length, 0, 'nothing flung');
  assert.equal(V3.lobs.length + V3.domes.length + V3.arcs.length + V3.scars.length, 0);
  assert.deepEqual(shiftV3(m), [0, 0]);
  assert.equal(tintV3(m, 1), null);
});

test('3. six tones each, darkest to white-hot; each word told apart from every other word, the ten melds, the friend and the enemy', () => {
  const others: Record<string, string> = { ...(WORD_COLOR as Record<string, string>), cyan: '#28dcf0', runedust: '#5ce8f8', pink: '#ff4f8a', gold: '#ffd27a' };
  for (const [w, ramp] of Object.entries(MELD_RAMP)) others[w] = ramp[3];
  let nearest = 99;
  for (const w of VMELD_IDS) {
    const ramp = VMELD_RAMP[w];
    assert.equal(ramp.length, 6, `${w}: six tones`);
    const light = ramp.map((c) => lab(c)[0]);
    for (let i = 1; i < 6; i++) assert.ok(light[i] > light[i - 1], `${w}: tone ${i} lighter than tone ${i - 1}`);
    const mine = ramp[3];
    for (const [o, c] of Object.entries(others)) {
      const d = de2000(mine, c);
      nearest = Math.min(nearest, d);
      assert.ok(d >= 12, `${w} is ${d.toFixed(1)} from ${o}`);
    }
    for (const v of VMELD_IDS) if (v !== w) assert.ok(de2000(mine, VMELD_RAMP[v][3]) >= 12, `${w} and ${v}`);
  }
  assert.ok(nearest >= 12, `nearest ${nearest.toFixed(1)}`);
});

test("4. nothing glows in the friend's cyan or the enemy's pink", () => {
  for (const w of VMELD_IDS) {
    for (const c of VMELD_RAMP[w]) {
      const [h, s, v] = hsv(c);
      if (s < 0.3 || v < 0.45) continue;
      assert.ok(!(h > 170 && h < 200), `${w}: ${c} is the friend's cyan`);
      assert.ok(!(h > 315 && h < 350), `${w}: ${c} is the enemy's pink`);
    }
  }
});

test('5. the runes: 7 by 7, cut as the others are, each its own', () => {
  const all = [...Object.values(GLYPH), ...Object.values(MELD_GLYPH)].map((g) => g.join('/'));
  const seen = new Set<string>();
  for (const w of VMELD_IDS) {
    const g = VMELD_GLYPH[w];
    assert.equal(g.length, 7, `${w}: 7 rows`);
    for (const row of g) assert.match(row, /^[.Xo]{7}$/, `${w}: ${row}`);
    const flat = g.join('');
    assert.ok(flat.includes('X') && flat.includes('o'), `${w}: carved and glowing`);
    assert.ok(!all.includes(g.join('/')) && !seen.has(g.join('/')), `${w}: its own`);
    seen.add(g.join('/'));
  }
});

test("6. every blast is big; a rune's bigger than a kill's; Demolition's the biggest; nothing piles up", () => {
  on(() => {
    for (const w of VMELD_IDS) {
      for (const style of ['blast', 'ruin'] as const) {
        clearV3();
        const fx = new Fx();
        const gm = game([monster(1, 11.5, 10)]);
        eventsV3([{ t: 'burst', x: 11, y: 10, r: 1.8, el: 'phys', style, meld: w }], gm, fx);
        run(0.6, gm, fx);
        assert.ok(fx.particles.length > 0, `${w} ${style}: things flung`);
        assert.ok(fx.rings.length + fx.flashes.length > 0, `${w} ${style}: a ring and a flash`);
        assert.ok(fx.shake > 0, `${w} ${style}: the screen shakes`);
        assert.ok(fx.glows.length > 0, `${w} ${style}: it lights the place`);
        assert.ok(fx.particles.length <= 900, `${w} ${style}: within the effects' limit`);
        assert.ok(V3.scars.length > 0, `${w} ${style}: it leaves its mark on the floor`);
      }
    }
    // (the shake as it went off: measured at once, before it dies away)
    const first: Record<string, number> = {};
    for (const w of VMELD_IDS) {
      for (const style of ['blast', 'ruin'] as const) {
        clearV3();
        const fx = new Fx();
        const gm = game([]);
        eventsV3([{ t: 'burst', x: 11, y: 10, r: 2, el: 'phys', style, meld: w }], gm, fx);
        run(style === 'ruin' && w === 'shatter' ? 0.42 : 0.01, gm, fx);
        first[`${w}:${style}`] = fx.shake;
      }
      assert.ok(first[`${w}:ruin`] >= first[`${w}:blast`], `${w}: the rune's blast at least the kill's (${first[`${w}:ruin`]} / ${first[`${w}:blast`]})`);
    }
    for (const w of VMELD_IDS) if (w !== 'demolition') assert.ok(first['demolition:blast'] > first[`${w}:blast`], `Demolition's blast bigger than ${w}'s`);
  });
});

test('7. the twists land where the rules say, and light what they strike', () => {
  on(() => {
    for (const what of ['catch', 'shard', 'splash'] as const) {
      clearV3();
      const fx = new Fx();
      const m = monster(7, 13, 11);
      const gm = game([m]);
      eventsV3([{ t: 'volFx', meld: what === 'catch' ? 'powderkeg' : what === 'shard' ? 'shatter' : 'rupture', what, id: 7, x0: 10, y0: 10, x1: 13, y1: 11 } as VolFx], gm, fx);
      const thrown = V3.lobs[V3.lobs.length - 1];
      assert.ok(thrown && thrown.x1 === 13 && thrown.y1 === 11, `${what}: thrown at it`);
      run(thrown.dur + 0.03, gm, fx);
      assert.equal(V3.lobs.length, 0, `${what}: it has landed`);
      assert.ok(V3.marks.has(7) && tintV3(m, 0), `${what}: the one struck is lit`);
      assert.ok(fx.rings.some((r) => r.x === 13 && r.y === 11), `${what}: it bursts on it`);
    }
    clearV3();
    const fx = new Fx();
    const m = monster(8, 14, 10);
    const gm = game([m]);
    eventsV3([{ t: 'volFx', meld: 'chainreaction', what: 'arc', id: 8, x0: 10, y0: 10, x1: 14, y1: 10 } as VolFx], gm, fx);
    const a = V3.arcs[0];
    assert.equal(a.pts[a.pts.length - 2], 14, 'the arc ends on the one it strikes');
    run(0.2, gm, fx);
    assert.ok(tintV3(m, 0.01), 'and it crackles');
    eventsV3([{ t: 'volFx', meld: 'chainreaction', what: 'link', x0: 10, y0: 10, x1: 12, y1: 13 }], gm, fx);
    assert.ok(V3.arcs.some((q) => q.pts[0] === 10 && q.pts[q.pts.length - 1] === 13), 'a link runs rune to rune');
    eventsV3([{ t: 'volFx', meld: 'shatter', what: 'freeze', x: 10, y: 10, r: 2, ids: [8] }], gm, fx);
    assert.equal(V3.freezes.length, 1, "Shatter's rune lays its ice");
    eventsV3([{ t: 'volFx', meld: 'demolition', what: 'half', id: 8, x: 14, y: 10, r: 2.4 }], gm, fx);
    assert.ok(V3.pillars.length > 0 && V3.domes.length > 0, "an elite going off at half life: light out of it, and the blast");
  });
});

test('8. the runes and patches of the five are drawn here and left out of the renderer, and forgotten on a new level', () => {
  on(() => {
    clearV3();
    const fx = new Fx();
    const zs = [rune('demolition', 10, 10, 3), rune('chainreaction', 12, 10), rune('chainreaction', 14, 11), { ...rune('rupture', 9, 9), kind: 'venom', dur: 4 } as Zone, { ...rune('powderkeg', 8, 8), kind: 'burn', dur: 4 } as Zone];
    const gm = game([], zs);
    for (const z of zs) {
      assert.ok(vmeldOf(z), 'known as one of the five');
      assert.ok(ownsZoneV3(z), `${z.kind} left out of the renderer's own`);
    }
    const plain = { ...rune('demolition', 1, 1), look: undefined, words: ['fire'] } as unknown as Zone;
    assert.equal(ownsZoneV3(plain), false, "a patch of none of the five is the renderer's");
    const c = canvas();
    floorV3(c.g, cam, 1, gm, everywhere);
    assert.ok(c.drawn() > 200, `the runes are drawn (${c.drawn()})`);
    const c2 = canvas();
    airV3(c2.g, cam, 1, gm);
    assert.ok(c2.drawn() > 20, "Rupture's cloud is drawn in the air");
    // (Demolition's waits longest, as his page says: slow to go off)
    for (const w of VMELD_IDS) if (w !== 'demolition') assert.ok(VRUNE.wait.demolition > VRUNE.wait[w]);
    // a new level: all forgotten
    eventsV3([{ t: 'burst', x: 11, y: 10, r: 1.8, el: 'phys', style: 'blast', meld: 'rupture' }], gm, fx);
    run(0.1, gm, fx);
    assert.ok(V3.domes.length + V3.lobs.length + V3.scars.length > 0);
    const next = { ...gm, level: {} } as unknown as Game;
    tickV3(1 / 60, next, fx);
    assert.equal(V3.domes.length + V3.lobs.length + V3.scars.length + V3.arcs.length, 0);
  });
});
