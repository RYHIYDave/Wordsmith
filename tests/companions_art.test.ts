// THE RANGER'S SIX COMPANIONS, THEIR PICTURES (src/art/companions_art.ts, _moves.ts, _fx.ts). A MOCK-UP: NOT IN THE
// GAME, behind COMPANIONS_ART_ON, off. Held to his art rulebook before he sees them, every frame of every move of each,
// from in front and from behind:
//   1. the switch off; nothing of the game imports them;
//   2. EVERY MOVE THROUGH EVERY BOSS CHECK (art/boss_checks.ts checkBoss; How art is made 7), front and behind: what
//      grips the floor stays put, nothing sinks into it, no leg or wing or coil through the rest of it, nothing leaps
//      or stalls or turns back at speed, no leap where one move hands over to the next, every blow drawn back, held
//      and carried through, the haunches first, alive when still;
//   3. crisp pixels; the friend's cyan edge round each, and nothing of the enemy's pink or gold; nothing cut off;
//   4. their sizes: about the mage's familiars', the wolf and the tortoise a little bigger than the rest;
//   5. Movement 9: a big wind-up held still, a strike of two frames, carried through;
//   6. the snake's body lies along its own path as it goes (its version of "Feet grip the floor");
//   7. their pictures as the game holds them; and their icons.
//   run: tsx --test tests/companions_art.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { COMPANIONS_ART_ON, COMP_CANVAS, companionIcon, companionLook, companionPainted, companionReview, makeCompanionArt } from '../src/art/companions_art';
import { COMP_ATTACK, COMP_STAND, KINDS, SNAKE_WAVE, moveFps, moveFrames, moveLong, snakePose, snakeR } from '../src/art/companions_art_moves';
import type { Kind } from '../src/art/companions_art_moves';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { FRIEND_RIM } from '../src/art/hero3_knight';
import { RIM_ALPHA } from '../src/art/kit';
import { FLAME, ENEMY_RIM } from '../src/art/mkit';
import { makeSpellArt } from '../src/art/spells';
import { Px, rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
paintWithoutCanvas();

const VIEWS = ['front', 'back'] as const;
/** Every frame the game would show of each move: its stand at its own frames a second, its moving and its attack at thirty. */
function momentsOf(k: Kind, which: string): number[] {
  const fps = moveFps(k, which);
  const n = which === 'walk' ? moveFrames(k) : Math.round(moveLong(k, which) * fps) + (which === 'attack' ? 1 : 0);
  return Array.from({ length: n }, (_, i) => i / fps);
}
function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}
const ENEMY = new Set([...FLAME, ENEMY_RIM].map((c) => rgba(c).slice(0, 3).join(',')));
/** A pixel of the enemy's: its pink, or its fire. */
function enemyPixel(r: number, g: number, b: number): boolean {
  if (ENEMY.has(`${r},${g},${b}`)) return true;
  const [h, sat] = hue(r, g, b);
  return sat > 0.4 && Math.max(r, g, b) > 140 && h >= 300 && h <= 352;
}

test('1. the switch is off, and nothing of the game imports them (only their dev page)', () => {
  assert.equal(COMPANIONS_ART_ON.on, false, 'COMPANIONS_ART_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/companions_art')) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    if (/from ['"][^'"]*companions_art(_moves|_fx)?['"]/.test(text)) users.push(f);
  }
  assert.equal(users.sort().join(' '), 'dev/preview_companions_art.ts', 'what imports them');
});

for (const k of KINDS) {
  test(`2. ${k}: every move (stand, moving, attack) through every boss check, every frame, from in front and from behind, and every handover`, () => {
    const { mob, shape, moves } = companionReview(k);
    const found = checkBoss(mob, shape, moves);
    assert.equal(found.length, 0, `${k}: ${findingsSaid(found).slice(0, 14).join('; ')}`);
  });
}

test('3. every frame of every move of each, both ways round: crisp; the cyan friend\'s edge round it; nothing of the enemy\'s pink or gold; no light but cyan; nothing cut off', () => {
  const rim = rgba(FRIEND_RIM);
  const faults: string[] = [];
  for (const k of KINDS) {
    for (const which of ['stand', 'walk', 'attack']) {
      for (const t of momentsOf(k, which)) {
        for (const view of VIEWS) {
          const { px, lights } = companionPainted(k, which, t, view);
          const d = px.d;
          let edge = 0;
          let body = 0;
          for (let i = 0; i < d.length; i += 4) {
            const a = d[i + 3];
            if (a === 0) continue;
            if (a === RIM_ALPHA) {
              if (d[i] === rim[0] && d[i + 1] === rim[1] && d[i + 2] === rim[2]) edge++;
              else faults.push(`${k} ${which} ${t.toFixed(2)} ${view}: an edge pixel not cyan`);
              continue;
            }
            if (a !== 255) faults.push(`${k} ${which} ${t.toFixed(2)} ${view}: a pixel part seen through (${a})`);
            body++;
            if (enemyPixel(d[i], d[i + 1], d[i + 2])) faults.push(`${k} ${which} ${t.toFixed(2)} ${view}: the enemy's pink or gold`);
          }
          if (body < 40 || edge < 20) faults.push(`${k} ${which} ${t.toFixed(2)} ${view}: ${body} painted, ${edge} of edge`);
          for (const L of lights) if (L.color !== '#28dcf0' && L.color !== FRIEND_RIM) faults.push(`${k} ${which}: a light ${L.color}`);
          for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (d[(y * px.w + x) * 4 + 3] > 0) faults.push(`${k} ${which} ${t.toFixed(2)} ${view}: cut off at the top or bottom`);
          for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (d[(y * px.w + x) * 4 + 3] > 0) faults.push(`${k} ${which} ${t.toFixed(2)} ${view}: cut off at a side`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 12).join('; '));
});

/** A painted figure's bounds and how many pixels of it there are (its edge not counted). */
function measure(px: Px): { w: number; h: number; n: number } {
  let x0 = px.w;
  let x1 = -1;
  let y0 = px.h;
  let y1 = -1;
  let n = 0;
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < px.w; x++) {
      const a = px.d[(y * px.w + x) * 4 + 3];
      if (a !== 255) continue;
      n++;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { w: x1 - x0 + 1, h: y1 - y0 + 1, n };
}

test('4. their sizes: about the mage\'s familiars\' (no more than twice as long, no shorter), the wolf and the tortoise a little bigger than the other four', () => {
  const fam = makeSpellArt().familiar.phys.map((s) => measure(s.img as unknown as Px));
  const famLong = Math.max(...fam.map((m) => Math.max(m.w, m.h)));
  const size: Record<string, { long: number; n: number }> = {};
  for (const k of KINDS) {
    // (standing, from in front: over its whole stand, its biggest)
    let long = 0;
    let n = 0;
    for (const t of momentsOf(k, 'stand')) {
      const m = measure(companionPainted(k, 'stand', t, 'front').px);
      long = Math.max(long, Math.max(m.w, m.h));
      n = Math.max(n, m.n);
    }
    size[k] = { long, n };
    assert.ok(long >= famLong && long <= 2.1 * famLong, `${k}: ${long} long, the familiar ${famLong}`);
  }
  for (const big of ['wolf', 'tortoise']) for (const small of ['hawk', 'snake', 'bat', 'fox']) assert.ok(size[big].n > size[small].n * 1.15, `${big} (${size[big].n}) a little bigger than ${small} (${size[small].n})`);
  assert.ok(size.wolf.n < size.fox.n * 3 && size.tortoise.n < size.fox.n * 3, 'only a little bigger');
});

test('5. Movement 9: each attack winds up big and holds the wound-up pose still; the strike is two frames, and covers most of the way the end it strikes with goes; it carries through', () => {
  const A = COMP_ATTACK;
  for (const k of KINDS) {
    const tip = (t: number) => companionLook(k, 'attack', t).review.tip as readonly [number, number, number];
    const d = (a: readonly number[], b: readonly number[]): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    // (held: from the end of the wind-up to the strike, the end it strikes with all but still)
    for (let t = A.coiled + 1 / 30; t < A.strike - 1e-6; t += 1 / 30) assert.ok(d(tip(t), tip(t - 1 / 30)) < 1.6, `${k}: still in its warning at ${t.toFixed(2)}`);
    const held = tip(A.strike);
    const hit = tip(A.hit);
    const strike = d(held, hit);
    assert.ok(strike >= 10, `${k}: the strike goes ${strike.toFixed(1)}`);
    // (the two frames of the strike each go further than any frame of its wind-up)
    let windMost = 0;
    for (let t = 1 / 30; t <= A.coiled + 1e-6; t += 1 / 30) windMost = Math.max(windMost, d(tip(t), tip(t - 1 / 30)));
    assert.ok(d(held, tip(A.strike + 1 / 30)) > windMost && d(tip(A.strike + 1 / 30), hit) > windMost, `${k}: the strike is quicker than the wind-up (${windMost.toFixed(1)} a frame)`);
    // (the wind-up and the wind-down are each longer than the strike many times over)
    assert.ok(A.coiled >= 2.9 * (A.hit - A.strike) && A.long - A.through >= 2.9 * (A.hit - A.strike), `${k}: big wind-up and wind-down`);
  }
});

test('6. the snake goes along its own path: every point of its body on the floor lies on the S it is sliding along, at its own thickness', () => {
  for (const t of momentsOf('snake', 'walk')) {
    const P = snakePose('walk', t);
    for (let i = 10; i < P.spine.length - 1; i++) {
      const p = P.spine[i];
      const y = SNAKE_WAVE.amp * Math.sin((2 * Math.PI * (p[0] + P.slide)) / SNAKE_WAVE.long);
      assert.ok(Math.abs(p[1] - y) < 0.35, `point ${i} at ${t.toFixed(2)}: ${p[1].toFixed(2)} off its path ${y.toFixed(2)}`);
      assert.ok(Math.abs(p[2] - snakeR(i / (P.spine.length - 1))) < 0.05, `point ${i}: on the floor`);
    }
  }
});

test('7. their pictures as the game holds them (stand, moving, attack with its blow), and their icons: 32 square, crisp, the friend\'s edge, nothing of the enemy\'s', () => {
  const rim = rgba(FRIEND_RIM);
  for (const k of KINDS) {
    const art = makeCompanionArt(k);
    for (const view of VIEWS) {
      const set = art[view];
      assert.equal(set.idle.length, Math.round(COMP_STAND.period * moveFps(k, 'stand')), `${k}: its stand`);
      assert.equal(set.walk.length, moveFrames(k), `${k}: its moving`);
      const atk = set.clips?.attack;
      assert.ok(atk && atk.hit === COMP_ATTACK.hit && atk.frames.length === Math.round(COMP_ATTACK.long * 30) + 1, `${k}: its attack`);
      assert.ok(set.idle[0].w > 4 && set.walk[0].w > 4 && set.attack.length === 3, `${k}: painted`);
    }
    const ic = companionIcon(k);
    assert.equal(ic.w, 32);
    assert.equal(ic.h, 32);
    let painted = 0;
    let edge = 0;
    for (let i = 0; i < ic.d.length; i += 4) {
      const a = ic.d[i + 3];
      if (a === 0) continue;
      if (a === RIM_ALPHA) {
        assert.ok(ic.d[i] === rim[0] && ic.d[i + 1] === rim[1] && ic.d[i + 2] === rim[2], `${k}'s icon: its edge cyan`);
        edge++;
      } else {
        assert.equal(a, 255, `${k}'s icon: crisp`);
        assert.ok(!enemyPixel(ic.d[i], ic.d[i + 1], ic.d[i + 2]), `${k}'s icon: nothing of the enemy's`);
        painted++;
      }
    }
    assert.ok(painted > 150 && edge > 30, `${k}'s icon: ${painted} painted, ${edge} edge`);
  }
});
void COMP_CANVAS;
