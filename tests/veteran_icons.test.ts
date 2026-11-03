// THE VETERAN'S THREE ICONS (art/veteran_icons.ts): his Punch (a tap), his Kick (a hold), his Jump (a swipe), for the HUD's
// TAP, HOLD and SWIPE. His word on the old Brawler: “I don’t want anything reused from the original brawler, we need a totally
// new look.”; his punch's colour, 3 Nov 2026, 10:44: “...the brawler is Str/dex, so I think we change the color of the globe
// for a punch to green and the kicks stay orange/red.”
//   1. each is thirty-two by thirty-two picture pixels (two to a game pixel: the sixteen game pixels a button gives)
//   2. crisp: every pixel wholly there or wholly not
//   3. never the enemy's pink, never gold
//   4. nothing of the old Brawler's: no import of its icons or its art, none of its colours in the file or in the pictures
//   5. each in his globe's colour: the punch his emerald green, the kick his hot orange-red, the jump his white
//   6. each fills its button: a real shape, not a speck
//   7. hooked up: three ability ids of their own, painted by art/ability_icons.ts
//   run: tsx --test tests/veteran_icons.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import type { Px } from '../src/engine/px';
import { INK } from '../src/art/kit';
import { VETERAN_ICONS, VET_GREEN, VET_ORANGE, VET_WHITE, vetJumpIcon, vetKickIcon, vetPunchIcon } from '../src/art/veteran_icons';

const read = (f: string): string => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
// (as the game lays them on a button: each with the dark seam all round it, art/ability_icons.ts makeAbilityIcons)
const ICONS: [string, Px][] = [['punch', vetPunchIcon().outline(INK)], ['kick', vetKickIcon().outline(INK)], ['jump', vetJumpIcon().outline(INK)]];

/** Every colour in a picture, and how many pixels of each. */
function colours(p: Px): Map<string, number> {
  const out = new Map<string, number>();
  for (let i = 0; i < p.w * p.h; i++) {
    if (p.d[i * 4 + 3] === 0) continue;
    const hex = '#' + [0, 1, 2].map((k) => p.d[i * 4 + k].toString(16).padStart(2, '0')).join('');
    out.set(hex, (out.get(hex) ?? 0) + 1);
  }
  return out;
}
/** Hue (degrees), saturation and value of a colour. */
function hsv(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, mx === 0 ? 0 : d / mx, mx];
}
const isPink = (c: string): boolean => {
  const [h, s, v] = hsv(c);
  return (h >= 285 || h < 0) && h <= 350 && s > 0.3 && v > 0.3;
};
const isGold = (c: string): boolean => {
  const [h, s, v] = hsv(c);
  return h >= 36 && h <= 64 && s > 0.4 && v > 0.45;
};

test('1. each is thirty-two by thirty-two picture pixels', () => {
  for (const [name, p] of ICONS) assert.ok(p.w === 32 && p.h === 32, `${name}: ${p.w} by ${p.h}`);
  assert.deepEqual(Object.keys(VETERAN_ICONS), ['punch', 'kick', 'jump']);
});

test('2. crisp: every pixel wholly there or wholly not', () => {
  for (const [name, p] of ICONS) {
    for (let i = 0; i < p.w * p.h; i++) {
      const a = p.d[i * 4 + 3];
      assert.ok(a === 0 || a === 255, `${name}: a pixel half there (alpha ${a}) at ${i % p.w}, ${Math.floor(i / p.w)}`);
    }
  }
});

test("3. never the enemy's pink, never gold", () => {
  for (const [name, p] of ICONS) {
    for (const c of colours(p).keys()) {
      assert.ok(!isPink(c), `${name}: ${c} is pink`);
      assert.ok(!isGold(c), `${name}: ${c} is gold`);
    }
  }
  // (and the checks themselves catch the enemy's colours)
  assert.ok(isPink('#e0287a') && isPink('#ff7aa8') && isGold('#ffd866') && isGold('#e0b040'));
});

test("4. nothing of the old Brawler's", () => {
  const src = read('src/art/veteran_icons.ts');
  const code = src.split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('/**')).join('\n');
  assert.ok(!/from\s+['"][^'"]*brawler/.test(code), 'it imports something of the old Brawler');
  assert.ok(!/brawler/i.test(code), 'its code names the old Brawler');
  const old = new Set((read('src/art/brawler_icons.ts').match(/#[0-9a-fA-F]{6}/g) ?? []).map((c) => c.toLowerCase()));
  assert.ok(old.size > 5, 'the old icons read');
  for (const c of (src.match(/#[0-9a-fA-F]{6}/g) ?? []).map((x) => x.toLowerCase())) assert.ok(!old.has(c), `${c} is one of the old Brawler's colours`);
  for (const [name, p] of ICONS) for (const c of colours(p).keys()) assert.ok(c === INK || !old.has(c), `${name}: ${c} is one of the old Brawler's colours`);
});

test("5. each in his globe's colour", () => {
  const share = (p: Px, ramp: readonly string[]): number => {
    const cs = colours(p);
    let n = 0;
    for (const c of ramp) n += cs.get(c.toLowerCase()) ?? 0;
    return n;
  };
  const [punch, kick, jump] = ICONS.map(([, p]) => p);
  assert.ok(share(punch, VET_GREEN) >= 120, `the punch's green: ${share(punch, VET_GREEN)} pixels`);
  assert.ok(share(kick, VET_ORANGE) >= 100, `the kick's orange: ${share(kick, VET_ORANGE)} pixels`);
  assert.ok(share(jump, VET_WHITE) >= 100, `the jump's white: ${share(jump, VET_WHITE)} pixels`);
  // (and not one another's: no green on the kick or the jump, no orange on the punch or the jump)
  assert.equal(share(kick, VET_GREEN) + share(jump, VET_GREEN), 0);
  assert.equal(share(punch, VET_ORANGE) + share(jump, VET_ORANGE), 0);
  // (his green is his own: an emerald, well off the friend's cyan and the poison's yellow-green)
  for (const c of VET_GREEN.slice(0, 4)) {
    const [h] = hsv(c);
    assert.ok(h > 130 && h < 160, `${c}: hue ${h.toFixed(0)}`);
  }
});

test('6. each fills its button: a real shape, not a speck', () => {
  for (const [name, p] of ICONS) {
    let n = 0;
    for (let i = 0; i < p.w * p.h; i++) if (p.d[i * 4 + 3]) n++;
    assert.ok(n >= 32 * 32 * 0.4, `${name}: only ${n} of 1024 pixels`);
    assert.ok(colours(p).size >= 10, `${name}: only ${colours(p).size} colours`);
  }
});

test('7. hooked up: three ability ids of their own, painted by art/ability_icons.ts', () => {
  const types = read('src/game/types.ts');
  assert.match(types, /\|\s*'vetpunch'\s*\|\s*'vetkick'\s*\|\s*'vetjump'/);
  const ab = read('src/art/ability_icons.ts');
  assert.match(ab, /vetpunch: vetPunchIcon, vetkick: vetKickIcon, vetjump: vetJumpIcon/);
  assert.match(ab, /from '\.\/veteran_icons'/);
});
