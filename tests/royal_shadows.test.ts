// FLOOR 20'S SHADOWS OF THE FOUR ROYALS (a mock-up: art/royal_shadows.ts, art/royal_shadows_fx.ts). Their switch off,
// nothing of the game importing them; their boss's moves through the boss checks; their strikes; no colour on them but
// the pinks; nothing cut off; their size.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { Px, rgba } from '../src/engine/px';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import type { BossShape } from '../src/art/boss_checks';
import { ENEMY_RIM } from '../src/art/mkit';
import { PR_SHAPE } from '../src/art/princess_moves';
import { PC_SHAPE } from '../src/art/prince_moves';
import { QN_SHAPE } from '../src/art/queen_moves';
import { KG_ALONE_SHAPE } from '../src/art/king_moves';
import { BLINK, EYE, EYE_LIT, ROYALS, ROYAL_IDS, SHADOWS_ON, longOf, shadowFrame } from '../src/art/royal_shadows';
import type { Frame, RoyalId } from '../src/art/royal_shadows';
import { CARD, DEATH, MASKS_SHADOW_FLIGHT, SHADOW_SNARE, blinkFrame, cardPx, crownFx, deathFrame, masksFx, snareFx } from '../src/art/royal_shadows_fx';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { equal(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

test('1. THE SWITCH IS OFF, AND NOTHING OF THE GAME IMPORTS THEM', () => {
  assert.equal(SHADOWS_ON.on, false);
  const theirs = /^art\/royal_shadows(_fx)?$/;
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => String(x).replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || theirs.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (theirs.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import them');
});

/** Each one's boss's shape, and the moves of the boss's it plays (the Queen's blink is her Reflections' lift and her stand). */
const CHECKS: Readonly<Record<RoyalId, [BossShape, string[]]>> = {
  princess: [PR_SHAPE, ['stand', 'walk', 'attack', 'snare', 'reel']],
  prince: [PC_SHAPE, ['stand', 'walk', 'attack', 'masks', 'reel']],
  queen: [QN_SHAPE, ['stand', 'walk', 'attack', 'reflect', 'reel']],
  king: [KG_ALONE_SHAPE, ['stand', 'walk', 'attack', 'crown', 'reel']],
};
test('2. EVERY MOVE THEY PLAY THROUGH EVERY BOSS CHECK, ON THEIR BOSS’S BONES (from in front and from behind)', () => {
  for (const id of ROYAL_IDS) {
    const r = ROYALS[id];
    const [shape, moves] = CHECKS[id];
    // (on the bones the boss is checked on: its own pace, the shadow's being that at its size)
    const found = checkBoss({ ...r.mob, pace: r.boss.pace }, shape, moves);
    assert.equal(found.length, 0, `${id}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
    assert.ok(Math.abs(r.pace - r.boss.pace * r.k) < 0.01, `${id}: its pace its boss's at its size`);
  }
});

test('3. THEIR STRIKES: each in one or two frames; the basic and the big move’s their boss’s own', () => {
  for (const id of ROYAL_IDS) {
    const r = ROYALS[id];
    for (const [move, [s0, s1]] of Object.entries(r.strikes)) {
      const n = Math.round((s1 - s0) * 30);
      assert.ok(n >= 1 && n <= 2, `${id} ${move}: ${n} frames`);
    }
  }
  assert.equal(Math.round((BLINK.strikeIn[1] - BLINK.strikeIn[0]) * 30), 2);
  assert.equal(Math.round((BLINK.strikeOut[1] - BLINK.strikeOut[0]) * 30), 2);
});

// ---------------------------------------------------------------------------------------------
// what they look like

const PINKS = new Set([EYE, EYE_LIT, ENEMY_RIM].map((c) => rgba(c).slice(0, 3).join(',')));
/** Colour that is neither fog nor one of the pinks, and what is on its edge (cut off). */
function faults(f: { px: Px }, what: string, out: string[], edges = true): void {
  const { w, h, d } = f.px;
  let bad = 0;
  let cut = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!d[i + 3]) continue;
      if (edges && (x === 0 || y === 0 || x === w - 1 || y === h - 1)) cut++;
      if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 20 && !PINKS.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) bad++;
    }
  }
  if (bad) out.push(`${what}: ${bad} pixels of colour`);
  if (cut) out.push(`${what}: ${cut} pixels on its edge (cut off)`);
}
const VIEWS = ['front', 'back'] as const;
const at = (long: number, n = 7): number[] => Array.from({ length: n }, (_, i) => (long * i) / (n - 1));

test('4. NO COLOUR ON THEM BUT THE PINKS, AND NOTHING CUT OFF: every move, from in front and from behind', () => {
  const out: string[] = [];
  for (const id of ROYAL_IDS) {
    const r = ROYALS[id];
    for (const view of VIEWS) {
      for (const move of ['stand', 'walk', 'attack', r.big === 'blink' ? 'reflect' : r.big, 'reel']) {
        for (const t of at(longOf(r, move))) faults(shadowFrame(r, move, t, view), `${id} ${move} ${t.toFixed(2)} ${view}`, out);
      }
      for (const t of at(DEATH.long, 9)) faults(deathFrame(r, t, view), `${id} death ${t.toFixed(2)} ${view}`, out);
    }
  }
  for (const view of VIEWS) {
    for (const t of at(BLINK.into, 9)) faults(blinkFrame('into', t, view), `queen blink into ${t.toFixed(2)} ${view}`, out);
    for (const t of at(BLINK.out, 9)) faults(blinkFrame('out', t, view), `queen blink out ${t.toFixed(2)} ${view}`, out);
    for (const t of at(SHADOW_SNARE.long)) faults(snareFx(t, view), `snare ${t.toFixed(2)} ${view}`, out);
    for (const t of at(MASKS_SHADOW_FLIGHT + 0.3)) faults(masksFx(t, view), `masks ${t.toFixed(2)} ${view}`, out);
    for (const t of at(1.6)) faults(crownFx(t, view), `crown ${t.toFixed(2)} ${view}`, out);
  }
  for (const id of ROYAL_IDS) faults({ px: cardPx(id) }, `${id}'s card`, out, false);
  assert.deepEqual(out.slice(0, 20), []);
});

/** How tall it stands (picture pixels: its floor point to its top). */
function tall(f: Frame): number {
  const { w, d } = f.px;
  for (let i = 3; i < d.length; i += 4) if (d[i] === 255) return f.ay - Math.floor((i - 3) / 4 / w);
  return 0;
}
test('5. THEIR SIZE: from the knight’s height (57) to a head over it; the King the tallest; the pink eyes on each from in front; their cards each their own', () => {
  const h: Record<string, number> = {};
  for (const id of ROYAL_IDS) {
    const f = shadowFrame(ROYALS[id], 'stand', 0, 'front', false);
    h[id] = tall(f);
    assert.ok(h[id] >= 55 && h[id] <= 72, `${id}: ${h[id]} tall`);
    const eyes = [EYE, EYE_LIT].map((c) => rgba(c));
    let n = 0;
    for (let i = 0; i < f.px.d.length; i += 4) if (f.px.d[i + 3] === 255 && eyes.some((c) => c[0] === f.px.d[i] && c[1] === f.px.d[i + 1] && c[2] === f.px.d[i + 2])) n++;
    assert.ok(n >= 1 && n <= 8, `${id}: ${n} pixels of pink eyes`);
  }
  assert.ok(h.king >= Math.max(h.princess, h.prince, h.queen), `the King the tallest: ${JSON.stringify(h)}`);
  const seen = new Set(ROYAL_IDS.map((id) => Array.from(cardPx(id).d).join(',')));
  assert.equal(seen.size, 4);
  assert.equal(cardPx('king').w, CARD.w);
});
