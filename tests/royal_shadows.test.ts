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
import { KG_ALONE_SHAPE, KG_CHARGE, KG_SWEEP_MOVE, KG_WEIGHT, KING_ALONE } from '../src/art/king_moves';
import { CHARGE_FX, WEIGHT_FX, sparksPainted, weightHead, weightPainted } from '../src/art/king_fx';
import { BLINK, EYE, EYE_LIT, ROYALS, ROYAL_IDS, SHADOWS_ON, longOf, shadowFrame } from '../src/art/royal_shadows';
import type { Frame, RoyalId } from '../src/art/royal_shadows';
import { CARD, DEATH, MASKS_SHADOW_FLIGHT, SHADOW_CHARGE, SHADOW_SNARE, SHADOW_WEIGHT, blinkFrame, cardPx, chargeCarriedTiles, crownFx, deathFrame, masksFx, shadowCrownAt, snareFx, sparksFx, weightFx } from '../src/art/royal_shadows_fx';

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
  king: [KG_ALONE_SHAPE, ['stand', 'walk', 'attack', 'weight', 'reel']],
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
    for (const t of at(1.6)) faults(crownFx(t, view), `the leap's ring (out of its set) ${t.toFixed(2)} ${view}`, out);
    // the King's shadow's charge, every frame, and its line of sparks through its whole life
    for (let f = 0; f <= Math.round(KG_CHARGE.long * 30); f += 2) faults(shadowFrame(ROYALS.king, 'attack', f / 30, view), `king charge ${(f / 30).toFixed(2)} ${view}`, out);
    const lineLong = SHADOW_CHARGE.most / SHADOW_CHARGE.pace + KG_CHARGE.burstAfter + CHARGE_FX.long;
    for (const t of [...at(lineLong - 0.01, 21), 1.35 + 0.29, 1.35 + 0.34, 1.35 + 0.4]) faults(sparksFx(t, view), `the charge's line ${t.toFixed(2)} ${view}`, out);
    for (const t of at(1.2, 5)) faults(sparksFx(t, view, 2), `the charge's short line ${t.toFixed(2)} ${view}`, out);
    // the shadow crown and its floor, through its whole flight and its slam's two frames and after
    for (const t of [...at(WEIGHT_FX.long - 0.01, 13), WEIGHT_FX.drop[0] + 1 / 30, WEIGHT_FX.drop[1], WEIGHT_FX.drop[1] + 0.05, WEIGHT_FX.drop[1] + 0.2]) {
      for (const part of ['crown', 'floor'] as const) faults(weightFx(t, view, part), `crown's weight ${part} ${t.toFixed(2)} ${view}`, out);
    }
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

/** Its opaque pixels' extent: left, right, top, bottom (picture pixels), or null if none. */
function extent(f: { px: Px }, keep: (d: Uint8ClampedArray, i: number) => boolean = (d, i) => d[i + 3] > 0): [number, number, number, number] | null {
  const { w, h, d } = f.px;
  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (keep(d, (y * w + x) * 4)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return x1 < 0 ? null : [x0, x1, y0, y1];
}
test('6. THE KING’S SHADOW: its basic his charge (the old sweep out of its set); its big move the Crown’s Weight, a shadow crown at its size, following you, slamming in two frames, flying home', () => {
  const r = ROYALS.king;
  // its basic: the King's charge, as his own now is; the old sweep and the leap out of its set
  assert.equal(r.mob.attack.name, KING_ALONE.attack.name);
  assert.equal(r.mob.attack.motion, KING_ALONE.attack.motion);
  assert.deepEqual(r.strikes.attack, KG_CHARGE.strike);
  assert.ok(r.mob.attack.name !== KG_SWEEP_MOVE.name && !Object.values(r.mob.more ?? {}).some((m) => m.name === KG_SWEEP_MOVE.name), 'the sweep is not in its set');
  assert.equal(r.big, 'weight');
  assert.ok(!('crown' in (r.mob.more ?? {})), 'the leap is not in its set');
  // its times: the King's own; the drop in two frames
  assert.equal(longOf(r, 'weight'), KG_WEIGHT.long);
  assert.equal(Math.round((WEIGHT_FX.drop[1] - WEIGHT_FX.drop[0]) * 30), 2);
  assert.deepEqual(r.strikes.weight, KG_WEIGHT.strike);
  assert.equal(SHADOW_WEIGHT.pace, KG_WEIGHT.pace);
  for (const view of VIEWS) {
    // it goes from the shadow's head and comes home to it, at its size
    const k = SHADOW_WEIGHT.k;
    const a = shadowCrownAt(0, view);
    const b = shadowCrownAt(WEIGHT_FX.long - 1e-4, view);
    const h0 = weightHead(KG_WEIGHT.send, view).c;
    const h1 = weightHead(KG_WEIGHT.back, view).c;
    assert.ok(a.lerp === 0 && Math.hypot(a.c[0] - h0[0] * k, a.c[1] - h0[1] * k, a.c[2] - h0[2] * k) < 0.5, `${view}: sent from its head`);
    assert.ok(b.lerp > 0.999 && Math.hypot(b.c[0] - h1[0] * k, b.c[1] - h1[1] * k, b.c[2] - h1[2] * k) < 1.5, `${view}: home on its head`);
    assert.equal(shadowCrownAt(1.0, view).phase, 'follow');
    // the crown 0.64 of the King's; the pink ring round where it falls 0.64 of his
    const mine = extent(weightFx(1.0, view, 'crown'))!;
    const his = extent({ px: weightPainted(1.0, view, 'crown').px })!;
    const kw = (mine[1] - mine[0]) / (his[1] - his[0]);
    assert.ok(Math.abs(kw - k) < 0.08, `${view}: the crown ${kw.toFixed(2)} of his`);
    const pink = (d: Uint8ClampedArray, i: number): boolean => d[i + 3] > 0 && [EYE, EYE_LIT].some((c) => rgba(c).slice(0, 3).join() === `${d[i]},${d[i + 1]},${d[i + 2]}`);
    const ring = extent(weightFx(1.0, view, 'floor'), pink)!;
    const hisRing = extent({ px: weightPainted(1.0, view, 'floor').px }, (d, i) => d[i + 3] > 0 && d[i] > 150 && d[i + 2] < 140)!;
    const kr = (ring[1] - ring[0]) / (hisRing[1] - hisRing[0]);
    assert.ok(Math.abs(kr - k) < 0.06, `${view}: the ring ${kr.toFixed(2)} of his`);
    // following, it hangs clear over the knight's head (57 tall): its band's foot 20 over it, and on the screen above it; landed, it lies on the floor
    const foot = shadowCrownAt(1.0, view).c[2] - WEIGHT_FX.k * k;
    assert.ok(foot > 57 + 20, `${view}: its band's foot ${foot.toFixed(0)} up`);
    const f = weightFx(1.0, view, 'crown');
    const low = f.ay - extent(f)![3];
    assert.ok(low > 57 + 6, `${view}: its lowest ${low} up on the screen`);
    const lying = weightFx(WEIGHT_FX.drop[1] + 0.1, view, 'crown');
    assert.ok(lying.ay - extent(lying)![3] <= 6, `${view}: lying on the floor`);
    // the drop: high the frame before, between in the first, down in the second
    const z = [WEIGHT_FX.drop[0], WEIGHT_FX.drop[0] + 1 / 30, WEIGHT_FX.drop[1]].map((t) => shadowCrownAt(t - 1e-4 * (t === WEIGHT_FX.drop[0] ? 1 : 0), view).c[2]);
    assert.ok(z[0] > 90 && z[1] < z[0] && z[1] > z[2] && z[2] < 10, `${view}: its drop ${z.map((v) => v.toFixed(0)).join(' ')}`);
    // none of it before it is sent or after it is home
    assert.equal(weightFx(-0.01, view, 'crown').px.w, 1);
    assert.equal(weightFx(WEIGHT_FX.long, view, 'floor').px.w, 1);
  }
});

test('7. THE KING’S SHADOW’S CHARGE: his times; carried at 0.64 of his pace (so its feet, at 0.64, grip), 0.64 of his run; its line of sparks 0.64 of his', () => {
  const S = SHADOW_CHARGE;
  assert.ok(Math.abs(S.pace - KG_CHARGE.pace * ROYALS.king.k) < 1e-9 && Math.abs(S.most - KG_CHARGE.most * ROYALS.king.k) < 1e-9);
  assert.equal(longOf(ROYALS.king, 'attack'), KG_CHARGE.long);
  assert.equal(Math.round((KG_CHARGE.strike[1] - KG_CHARGE.strike[0]) * 30), 2);
  assert.ok(Math.abs(chargeCarriedTiles(KG_CHARGE.run[1]) - S.most) < 1e-9 && chargeCarriedTiles(KG_CHARGE.run[0]) === 0 && chargeCarriedTiles(KG_CHARGE.long) === S.most);
  const ran = S.most / S.pace;
  assert.ok(Math.abs(ran - (KG_CHARGE.run[1] - KG_CHARGE.run[0])) < 1e-9, 'its line cut in the run');
  const pinks = [EYE, EYE_LIT].map((c) => rgba(c).slice(0, 3).join());
  for (const view of VIEWS) {
    // the line as it stops, held: 0.64 of his, end to end
    const t = ran + KG_CHARGE.burstAfter - 0.1;
    const mine = extent(sparksFx(t, view))!;
    const his = extent({ px: sparksPainted(t, view).px })!;
    const kw = (mine[1] - mine[0]) / (his[1] - his[0]);
    assert.ok(Math.abs(kw - S.k) < 0.06, `${view}: its line ${kw.toFixed(2)} of his`);
    // its sparks popped and their shrapnel: within its reach of the line, and some of the dull pink in it
    const f = sparksFx(ran + KG_CHARGE.burstAfter + 0.36, view);
    const all = extent(f)!;
    const hisAll = extent({ px: sparksPainted(ran + KG_CHARGE.burstAfter + 0.36, view).px })!;
    const ks = (all[3] - all[2]) / (hisAll[3] - hisAll[2]);
    assert.ok(Math.abs(ks - S.k) < 0.1, `${view}: its sparks' spread ${ks.toFixed(2)} of his`);
    let pink = 0;
    for (let i = 0; i < f.px.d.length; i += 4) if (f.px.d[i + 3] && pinks.includes(`${f.px.d[i]},${f.px.d[i + 1]},${f.px.d[i + 2]}`)) pink++;
    assert.ok(pink > 20, `${view}: ${pink} pixels of the dull pink`);
    // nothing before it sets off or after it is gone
    assert.equal(extent(sparksFx(-0.01, view)), null);
    assert.equal(extent(sparksFx(ran + KG_CHARGE.burstAfter + CHARGE_FX.long, view)), null);
  }
});
