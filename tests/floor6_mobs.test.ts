// FLOOR 6'S MOBS, THE QUARRY GOLEM AND THE RUBBLING (src/art/floor6_mobs.ts; a mock-up until Act 1 put them in the
// game, through art/act1_figs/qgolem.ts and rubbling.ts, their switch going with the descent), held to his rulebook: crisp in every frame, the enemy's pink edge round them
// while they live and none as they die, nothing cyan and every light the cult's fire, their sizes beside
// the knight, the golem's mark burning on its chest and the rubbling's spark in it, the whole boss review of
// every move of the golem (as his rulebook asks of every figure on the bones), the rubbling's feet gripping
// the floor as it scuttles, their loops closing, and nothing of either cut off at its canvas's edge.
//   run: tsx --test tests/floor6_mobs.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import { GOLEM_MOVES, golemShape } from './golem_shape';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { spriteOf3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { CHUNK_FRAMES, FLOOR6_MOBS_ON, QG_DIE_TIME, QUARRY_GOLEM, RB_ATTACK, RB_DIE, RB_EMERGE, RB_PACE, RB_REEL, RB_WALK, chunkShatter, golemChunk, golemFrame, makeRubblingArt, rubblingPainted, rubblingWalkFeet } from '../src/art/floor6_mobs';
import { WORD_COLOR } from '../src/art/icons';
import { useAct1Figs } from '../src/art/bestiary';
import { ACT1 } from '../src/game/act1';
import { TILE3, deathOfMob, paintMob } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const VIEWS = ['front', 'back'] as const;
type Frame = { name: string; px: Px; lights: { color: string }[] };

/** Every frame of the golem the game would show (every second one of its moves; its death at twenty a second), on its whole canvas. */
const golemLiving: Frame[] = [];
for (const mv of GOLEM_MOVES) {
  if (mv === 'dying') continue;
  framesOf(QUARRY_GOLEM, mv).forEach((t, i) => {
    if (i % 2 === 0) for (const view of VIEWS) {
      const p = paintMob(QUARRY_GOLEM, mv, t, view, ENEMY_RIM);
      golemLiving.push({ name: `golem ${mv} ${view} ${t.toFixed(2)}`, px: p.px, lights: p.lights });
    }
  });
}
const golemDying: Frame[] = [];
for (let i = 0; i <= QG_DIE_TIME * 20; i++) for (const view of VIEWS) {
  const p = deathOfMob(QUARRY_GOLEM, Math.min(1, i / 20 / QG_DIE_TIME), view);
  golemDying.push({ name: `golem dying ${view} ${(i / 20).toFixed(2)}`, px: p.px, lights: p.lights });
}
/** Every frame of the rubbling, at thirty a second. */
const rbLiving: Frame[] = [];
const rbDying: Frame[] = [];
for (const [mv, long] of [['stand', 1], ['walk', RB_WALK.frames / RB_WALK.fps], ['attack', RB_ATTACK], ['reel', RB_REEL], ['emerge', RB_EMERGE], ['dying', RB_DIE]] as const) {
  for (let i = 0; i <= Math.round(long * 30); i++) for (const view of VIEWS) {
    const p = rubblingPainted(mv, i / 30, view);
    (mv === 'dying' ? rbDying : rbLiving).push({ name: `rubbling ${mv} ${view} ${(i / 30).toFixed(2)}`, px: p.px, lights: p.lights });
  }
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
function tallOf(sp: Sprite): number {
  const q = paintingOf(sp);
  let top = q.h;
  let bottom = -1;
  for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.d[(y * q.w + x) * 4 + 3] === 255) {
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  return bottom - top + 1;
}

test('in the game through art/act1_figs/ (its switch goes with the descent), and nothing else of the game imports it', () => {
  // (art/bestiary.ts useAct1Figs: the art chat's switch is on while the descent is)
  useAct1Figs(true);
  assert.equal(FLOOR6_MOBS_ON.on, true);
  useAct1Figs(false);
  assert.equal(FLOOR6_MOBS_ON.on, false);
  useAct1Figs(ACT1.on);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('floor6_mobs.ts')) continue;
    if (/from ['"][^'"]*floor6_mobs['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f.split('\\').join('/'));
  }
  assert.deepEqual(users.sort(), ['art/act1_figs/qgolem.ts', 'art/act1_figs/rubbling.ts', 'render/act1_fx/qgolem.ts'], 'the game files that hold them');
});

test('crisp: every pixel all there or not at all (but the pink edge), the pink edge round them while they live, none as they die', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const [frames, least] of [[golemLiving, 150], [rbLiving, 40]] as const) {
    for (const { name, px } of frames) {
      let soft = 0;
      let rim = 0;
      for (let i = 0; i < px.d.length; i += 4) {
        const a = px.d[i + 3];
        if (a === 0 || a === 255) continue;
        if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
        else soft++;
      }
      assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
      assert.ok(rim > least, `${name}: its pink edge, ${rim} pixels`);
    }
  }
  for (const { name, px } of [...golemDying, ...rbDying]) {
    let soft = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] !== 0 && px.d[i + 3] !== 255) soft++;
    assert.ok(soft === 0, `${name}: ${soft} soft pixels (an edge, or soft)`);
  }
});

test('nothing cyan, and every light they give is the cult\'s fire', () => {
  for (const { name, px, lights } of [...golemLiving, ...golemDying, ...rbLiving, ...rbDying]) {
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('nothing of them cut off at their canvas\'s edge, in any frame', () => {
  for (const { name, px } of [...golemLiving, ...golemDying, ...rbLiving, ...rbDying]) {
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${name}: ${cut} pixels on the canvas's edge`);
  }
});

test('their sizes beside the knight: the golem half as tall again, the rubbling a little heap, under half his height', () => {
  const knight = tallOf(spriteOf3(MOVES3.rear, 0, 'front'));
  const golem = tallOf(golemFrame('stand', 0, 'front'));
  const rb = tallOf(makeRubblingArt().front.idle[0]);
  assert.ok(golem / knight > 1.25 && golem / knight < 1.8, `the golem ${golem} picture pixels tall against the knight's ${knight}: ${(golem / knight).toFixed(2)} times`);
  assert.ok(rb / knight > 0.3 && rb / knight < 0.7, `the rubbling ${rb} against the knight's ${knight}: ${(rb / knight).toFixed(2)} times`);
});

test('the golem\'s mark burns on its chest in every frame of its stand and walk from in front; the rubbling\'s spark shows in every frame it lives from in front', () => {
  const fire = (px: Px): number => {
    let n = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && FIRE.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) n++;
    return n;
  };
  for (const { name, px } of golemLiving) if (/golem (stand|walk) front/.test(name)) assert.ok(fire(px) > 40, `${name}: ${fire(px)} pixels of the fire`);
  for (const { name, px } of rbLiving) if (name.includes('front')) assert.ok(fire(px) > 3, `${name}: ${fire(px)} pixels of its spark`);
});

test('the golem through the boss review (art/boss_checks.ts), every move', () => {
  const found = checkBoss(QUARRY_GOLEM, golemShape(), GOLEM_MOVES);
  assert.ok(found.length === 0, `quarry golem:\n  ${findingsSaid(found).join('\n  ')}`);
});

test('the rubbling\'s feet grip the floor as it scuttles: a foot that is down stays on one spot of the floor while it is down', () => {
  const ground = RB_PACE * TILE3;
  const n = 96;
  const long = RB_WALK.frames / RB_WALK.fps;
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * long;
    const t1 = ((i + 1) / n) * long;
    const a = rubblingWalkFeet(t0);
    const b = rubblingWalkFeet(t1);
    a.forEach((f, j) => {
      if (f[2] > 0 || b[j][2] > 0) return;
      // (where it is on the floor: its place under the rubbling, and how far the rubbling has gone)
      const slid = b[j][0] + ground * t1 - (f[0] + ground * t0);
      if (Math.abs(b[j][0] - f[0]) < ground * long * 0.6) assert.ok(Math.abs(slid) < 0.05, `foot ${j} at ${t0.toFixed(3)} s slides ${slid.toFixed(2)}`);
    });
  }
  // (and two feet are always down)
  for (let i = 0; i < n; i++) assert.ok(rubblingWalkFeet((i / n) * long).filter((f) => f[2] <= 0.01).length >= 2, `at ${((i / n) * long).toFixed(3)} s fewer than two feet down`);
});

test('their loops close: the rubbling\'s stand and scuttle come round to their first frame', () => {
  const same = (a: Px, b: Px): boolean => a.d.every((v, i) => v === b.d[i]);
  assert.ok(same(rubblingPainted('stand', 0).px, rubblingPainted('stand', 1).px), 'its stand');
  assert.ok(same(rubblingPainted('walk', 0).px, rubblingPainted('walk', RB_WALK.frames / RB_WALK.fps).px), 'its scuttle');
});

test('the rubbling as the game holds a monster: both facings, every list and clip; its blow on a frame; its death ends on what is left, no edge and no light', () => {
  const art = makeRubblingArt();
  for (const view of VIEWS) {
    const set = art[view];
    assert.ok(set.idle.length > 0 && set.walk.length === RB_WALK.frames && set.attack.length === 3, `${view}: its lists`);
    for (const k of ['attack', 'die', 'reel'] as const) assert.ok((set.clips?.[k]?.frames.length ?? 0) > 3, `${view}: its ${k}`);
    assert.ok((set.clips?.moves?.emerge?.frames.length ?? 0) > 3, `${view}: its rise out of a rock pile`);
    const die = set.clips!.die!;
    const last = paintingOf(die.frames[die.frames.length - 1]);
    let some = 0;
    for (let i = 3; i < last.d.length; i += 4) if (last.d[i] === 255) some++;
    assert.ok(some > 40, `${view}: what is left of it, ${some} pixels`);
    assert.ok((die.frames[die.frames.length - 1].lights ?? []).length === 0, `${view}: no light once it has popped`);
  }
});

test('what the golem throws: the chunk in flight crisp, its pink edge round it, the stone\'s colours; its shattering crisp, no edge, no loose pixels, duller than every word', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hue(...(rgba((WORD_COLOR as Record<string, string>)[w]).slice(0, 3) as [number, number, number]))[1]));
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (let i = 0; i < CHUNK_FRAMES; i++) for (const view of VIEWS) {
    const q = paintingOf(golemChunk(i / CHUNK_FRAMES, view));
    let soft = 0;
    let rim = 0;
    for (let j = 0; j < q.d.length; j += 4) {
      const a = q.d[j + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && q.d[j] === pr && q.d[j + 1] === pg && q.d[j + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0 && rim > 20, `the chunk ${i} ${view}: ${soft} soft pixels, ${rim} of its edge`);
  }
  for (let f = 0; f <= 4; f++) {
    const sp = chunkShatter(f);
    const q = paintingOf(sp);
    let soft = 0;
    let loose = 0;
    let most = 0;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      const i = (y * q.w + x) * 4;
      if (q.d[i + 3] === 0) continue;
      if (q.d[i + 3] !== 255) soft++;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) n++;
      if (n === 0) loose++;
      if (Math.max(q.d[i], q.d[i + 1], q.d[i + 2]) >= 51) most = Math.max(most, hue(q.d[i], q.d[i + 1], q.d[i + 2])[1]);
    }
    assert.ok(soft === 0, `shattering ${f}: ${soft} soft pixels`);
    assert.ok(loose <= 2, `shattering ${f}: ${loose} loose pixels`);
    assert.ok(most < dullest, `shattering ${f}: ${most.toFixed(2)} against the dullest word's ${dullest.toFixed(2)}`);
    assert.ok((sp.lights ?? []).length === 0, `shattering ${f}: no light`);
  }
});

