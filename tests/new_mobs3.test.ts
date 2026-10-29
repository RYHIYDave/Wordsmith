// THREE NEW MONSTERS (src/art/new_mobs3.ts): the art chat's, made a mock-up behind a switch that was
// off, with his yes to their pictures; IN THE GAME'S CODE SINCE VERSION 19.9, behind the main chat's
// switch (game/defs.ts NEW_MONSTERS, which throws NEW_MOBS with it), off until he has seen films of them
// in the game and said yes. So:
//   1. the pictures' switch goes with the rules', and the game draws them only through the bestiary,
//      the renderer and its effects;
//   2. each painter paints every pose the pictures show (standing both ways, the held warning, the
//      blow, its death) without throwing, and paints something;
//   3. nothing on them glows a friend's colour: no cyan anywhere in their paintings or their lights;
//   4. each living one wears the enemy's pink edge, and the dying wear none;
//   5. their walks go round without a jump, and the feet of the two that walk GRIP THE FLOOR (the art
//      rulebook): a foot that is down stays on one spot of the floor while it is down, at the pace
//      the walk is painted for;
//   6. each is made as the game takes a monster (an ActorArt, as makeSkeletonArt3 makes the
//      skeleton): both facings, every list and clip there and painted, the blow on a frame, its walk
//      shown faster or slower for another pace; no cyan in any frame, the pink edge on every living
//      one and none on a dying one.
//   run: tsx --test tests/new_mobs3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { DEATH_FPS } from '../src/art/mkit';
import { BONEWARD, GOLEM, NEW_MOBS, NEW_MOBS_LIST, SHADE, TILE3, deathOfMob, makeBonewardArt3, makeGolemArt3, makeShadeArt3, paintMob, skeletonAt } from '../src/art/new_mobs3';
import { NEW_MONSTERS } from '../src/game/defs';
import '../src/art/bestiary';
import type { Mob } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

/** Every pose the pictures show, of one monster, both ways round. */
function poses(): { name: string; living: boolean; paint: () => Painted }[] {
  const out: { name: string; living: boolean; paint: () => Painted }[] = [];
  for (const mob of NEW_MOBS_LIST) {
    for (const view of ['front', 'back'] as const) {
      out.push({ name: `${mob.id} stands, ${view}`, living: true, paint: () => paintMob(mob, 'stand', 0, view) });
      out.push({ name: `${mob.id} stands a moment on, ${view}`, living: true, paint: () => paintMob(mob, 'stand', 0.45, view) });
      out.push({ name: `${mob.id} winds up, ${view}`, living: true, paint: () => paintMob(mob, 'attack', mob.warn, view) });
      out.push({ name: `${mob.id} strikes, ${view}`, living: true, paint: () => paintMob(mob, 'attack', mob.hit, view) });
      out.push({ name: `${mob.id} walks, ${view}`, living: true, paint: () => paintMob(mob, 'walk', 0, view) });
      out.push({ name: `${mob.id} walks on, ${view}`, living: true, paint: () => paintMob(mob, 'walk', 3 / mob.walkFps, view) });
      out.push({ name: `${mob.id} is struck, ${view}`, living: true, paint: () => paintMob(mob, 'reel', 0.06, view) });
      for (const k of [0, 0.3, 0.6, 1]) out.push({ name: `${mob.id} dies (${k}), ${view}`, living: false, paint: () => deathOfMob(mob, k, view) });
    }
  }
  return out;
}

/** The friend's glowing colours (art/kit.ts; the heroes' edge and pool of light). */
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));

/** True of a colour in the cyan family, bright and strong: a glow of the friend's side. */
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}

test('their switch goes with the rules\' (Version 19.9), and only the bestiary, the renderer and its effects draw them', () => {
  // (art/bestiary.ts useNewMonsters throws the pictures' switch, NEW_MOBS, with the rules', NEW_MONSTERS)
  assert.equal(NEW_MOBS.on, NEW_MONSTERS.on, 'the pictures are on just while the rules are');
  // (the art chat's three files: the monsters, what they throw drawn on the floor, and the rings that tell their packs apart)
  const mine = ['new_mobs3', 'mob_shots', 'pack_marks'];
  // (and the bosses, a mock-up of their own built on them: art/bosses3.ts, art/boss_shots.ts, art/boss_chains.ts and art/boss_checks.ts, which nothing of the game imports either: tests/bosses.test.ts; and the fleshmancer, art/fleshmancer.ts and what he sends out, art/fm_spells.ts: tests/fleshmancer.test.ts; and the cult's two new fighters, art/cultists.ts: tests/cultists.test.ts; and floor 6's, the Unfinished, art/unfinished.ts, and the quarry golem and the rubbling, art/floor6_mobs.ts, with their stone and footwork, art/act1_stone.ts and art/act1_feet.ts: tests/unfinished.test.ts and tests/floor6_mobs.test.ts; and the cult's two new kinds for floors 6 to 10, art/act1_cultists.ts: tests/act1_cultists.test.ts; and floor 7's small mobs, the vultures, art/ledge_vultures.ts: tests/ledge_vultures.test.ts; and floor 7's medium mobs, the cliff crawlers, art/ledge_crawlers.ts: tests/ledge_crawlers.test.ts; and floor 8's boss, the Cantor, art/cantor.ts: tests/cantor.test.ts; and floor 8's mobs, the canyon scorpions, art/canyon_scorpions.ts, and the dust devils, art/dust_devils.ts: tests/canyon_scorpions.test.ts and tests/dust_devils.test.ts; and floor 9's, the Hollow Stag, art/hollow_stag.ts, and the twisted deer, art/twisted_deer.ts: tests/hollow_stag.test.ts and tests/twisted_deer.test.ts; and the fog wolves, art/fog_wolves.ts: tests/fog_wolves.test.ts; and floor 10's, the Drowned Eye, art/drowned_eye.ts: tests/drowned_eye.test.ts; and the Headsman made new, art/headsman2.ts, art/headsman2_moves.ts and what his vault does to the floor, art/headsman2_shots.ts: tests/headsman2.test.ts; and floor 11's boss, the Crier, art/crier.ts, art/crier_moves.ts and art/crier_shots.ts: tests/crier.test.ts; and floor 11's small mob, the Hushed townsfolk, art/hushed.ts and art/hushed_moves.ts: tests/hushed.test.ts; and its medium mob, the Hushed watch, art/hushed_watch.ts and art/hushed_watch_moves.ts: tests/hushed_watch.test.ts; and its ranged mob, the Silent Order's scribes, art/scribes.ts, art/scribes_moves.ts and art/scribe_shots.ts: tests/scribes.test.ts; and its hounds, art/hounds.ts: tests/hounds.test.ts; and floor 12's boss, the Rat King, art/rat_king.ts: tests/rat_king.test.ts; and its small mob, the King's rats, art/rats.ts: tests/rats.test.ts; and its medium mob, the Order's dredgers, art/dredgers.ts and art/dredgers_moves.ts: tests/dredgers.test.ts; and floor 13's boss, the Palimpsest, art/palimpsest.ts, art/palimpsest_moves.ts and art/palimpsest_shots.ts: tests/palimpsest.test.ts; and its mobs, the Hushed working the fields, art/fieldhands.ts and art/fieldhands_moves.ts, and the Silent Order's carters, art/carters.ts and art/carters_moves.ts: tests/fieldhands.test.ts and tests/carters.test.ts; and floor 14's boss, the Physician, art/physician.ts, art/physician_moves.ts and art/physician_shots.ts: tests/physician.test.ts; and its Hushed patients, art/patients.ts, art/patients_moves.ts and art/patient_shots.ts: tests/patients.test.ts; and its orderlies, art/orderlies.ts, art/orderlies_moves.ts and art/orderly_shots.ts: tests/orderlies.test.ts; and floor 15's boss, the Censor, art/censor.ts, art/censor_moves.ts and art/censor_shots.ts: tests/censor.test.ts; and its small mob, the inklings, art/inklings.ts, art/inklings_moves.ts and art/inkling_shots.ts: tests/inklings.test.ts; and its medium mob, the Bookwardens, art/bookwardens.ts, art/bookwardens_moves.ts and art/bookwarden_shots.ts: tests/bookwardens.test.ts; and the act's medium kinds' second attacks, what the carters', the dredgers' and the watch's leave on the floor, art/carter_shots.ts, art/dredger_shots.ts and art/watch_shots.ts: tests/carters.test.ts, tests/dredgers.test.ts and tests/hushed_watch.test.ts; and floor 13's double boss made in place of the Palimpsest, the Scraper and the Quill, art/scraper.ts, art/quill.ts, art/pair_skins.ts and art/pair_shots.ts: tests/pair.test.ts; and Act 2's town hub in Vellum, the camp, its people (the Hushed with their voices back), art/hub2_folk.ts: tests/hub2.test.ts; and floor 16's (mockup/swan-gardens), the swans, art/garden_swans.ts, the Hushed gardeners and grooms, art/palace_hands.ts and art/palace_hands_moves.ts, the palace guard, art/palace_guard.ts and art/palace_guard_moves.ts, and the Princess and her steed, art/princess.ts, art/princess_moves.ts, art/princess_ride.ts, art/princess_fx.ts and art/spectral_steed.ts: tests/garden_swans.test.ts, tests/palace_hands.test.ts, tests/palace_guard.test.ts and tests/princess.test.ts; and floor 17's boss, the Prince, art/prince.ts, art/prince_moves.ts and art/prince_fx.ts: tests/prince.test.ts)
  const alsoMockUps = ['bosses3', 'boss_shots', 'boss_chains', 'boss_checks', 'fleshmancer', 'fm_spells', 'cultists', 'unfinished', 'floor6_mobs', 'act1_stone', 'act1_feet', 'act1_cultists', 'carrion_queen', 'ledge_vultures', 'ledge_crawlers', 'cantor', 'canyon_scorpions', 'dust_devils', 'hollow_stag', 'twisted_deer', 'fog_wolves', 'drowned_eye', 'drowned', 'bog_leech', 'eyespawn', 'carrion_queen2', 'carrion_queen2_moves', 'headsman2', 'headsman2_moves', 'headsman2_shots', 'crier', 'crier_moves', 'crier_shots', 'hushed', 'hushed_moves', 'hushed_watch', 'hushed_watch_moves', 'scribes', 'scribes_moves', 'scribe_shots', 'hounds', 'rat_king', 'rat_king_shots', 'rats', 'dredgers', 'dredgers_moves', 'palimpsest', 'palimpsest_moves', 'palimpsest_shots', 'fieldhands', 'fieldhands_moves', 'carters', 'carters_moves', 'physician', 'physician_moves', 'physician_shots', 'patients', 'patients_moves', 'patient_shots', 'orderlies', 'orderlies_moves', 'orderly_shots', 'censor', 'censor_moves', 'censor_shots', 'inklings', 'inklings_moves', 'inkling_shots', 'bookwardens', 'bookwardens_moves', 'bookwarden_shots', 'carter_shots', 'dredger_shots', 'watch_shots', 'scraper', 'quill', 'pair_skins', 'pair_shots', 'hub2_folk', 'garden_swans', 'palace_hands', 'palace_hands_moves', 'palace_guard', 'palace_guard_moves', 'princess', 'princess_moves', 'princess_ride', 'princess_fx', 'spectral_steed', 'prince', 'prince_moves', 'prince_fx'];
  const files = fs.readdirSync('src', { recursive: true }).filter((f) => f.endsWith('.ts') && !f.startsWith('dev'));
  const users: string[] = [];
  for (const f of files) {
    if ([...mine, ...alsoMockUps].some((m) => f.endsWith(`${m}.ts`))) continue;
    // (ACT 1, THE DESCENT: its kinds' pictures, art/act1_figs/, hand over the art chat's Mobs as the game holds a monster's, by
    // mobSet; and what they draw, render/act1_fx/, is drawn on the floor as the bosses' effects are, by its FloorAt)
    if (/^(art\/act1_figs|render\/act1_fx)\//.test(f.split('\\').join('/'))) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    if (mine.some((m) => new RegExp(`from '[./a-z_]*/${m}'`).test(text))) users.push(f.split('\\').join('/'));
  }
  // (render/bossfx.ts: THE FIRST FIVE FLOORS, the bosses' own effects, which use the Golem's skull's shadow and burst and the
  // marksman's line; the descent's kinds' effects, render/act1_fx/, are let through above)
  assert.deepEqual(users.sort(), ['art/bestiary.ts', 'render/bossfx.ts', 'render/fx.ts', 'render/render.ts', 'render/wild.ts'], 'the game files that draw them');
});

test('each painter paints every pose of the pictures without throwing, and paints something', () => {
  for (const p of poses()) {
    const f = p.paint();
    let n = 0;
    for (let i = 3; i < f.px.d.length; i += 4) if (f.px.d[i] === 255) n++;
    // (the Shade is gone at the end of its death: nothing is left of it)
    if (!(p.name.startsWith('shade dies (1)'))) assert.ok(n > 40, `${p.name}: only ${n} pixels painted`);
  }
});

test('nothing on them glows cyan: not a pixel of the friend’s colours, nor a light', () => {
  for (const p of poses()) {
    const f = p.paint();
    const d = f.px.d;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const key = `${d[i]},${d[i + 1]},${d[i + 2]}`;
      assert.ok(!FRIEND.has(key), `${p.name}: a friend's colour (${key})`);
      assert.ok(!cyanGlow(d[i], d[i + 1], d[i + 2]), `${p.name}: a cyan glow (${key})`);
    }
    for (const l of f.lights) {
      const [r, g, b] = rgba(l.color);
      assert.ok(!FRIEND.has(`${r},${g},${b}`) && !cyanGlow(r, g, b), `${p.name}: a cyan light (${l.color})`);
    }
  }
});

test('each living one wears the enemy’s pink edge; the dying wear none', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const p of poses()) {
    const d = p.paint().px.d;
    let rim = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    if (p.living) assert.ok(rim > 30, `${p.name}: its pink edge has ${rim} pixels`);
    else assert.equal(rim, 0, `${p.name}: a dying thing has no edge`);
  }
});

/** How many pixels differ between two paintings of one canvas. */
function differ(a: Px, b: Px): number {
  let n = 0;
  for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2] || a.d[i + 3] !== b.d[i + 3]) n++;
  return n;
}

test('their walks go round: the frame after the last is the first again, and the step from the last to the first is no bigger than any other', () => {
  for (const mob of NEW_MOBS_LIST) {
    for (const view of ['front', 'back'] as const) {
      const n = mob.walkFrames;
      const frames: Px[] = [];
      for (let i = 0; i <= n; i++) frames.push(paintMob(mob, 'walk', i / mob.walkFps, view).px);
      assert.equal(differ(frames[n], frames[0]), 0, `${mob.id}, ${view}: the round does not close`);
      let most = 0;
      for (let i = 1; i < n; i++) most = Math.max(most, differ(frames[i], frames[i - 1]));
      const wrap = differ(frames[0], frames[n - 1]);
      assert.ok(wrap <= most * 1.25 + 10, `${mob.id}, ${view}: a jump where the walk goes round (${wrap} pixels, against ${most} at most between neighbours)`);
    }
  }
});

test('the feet of the two that walk grip the floor: a foot that is down stays on one spot of it while it is down', () => {
  for (const mob of [BONEWARD, GOLEM]) {
    const n = mob.walkFrames;
    // (how far the floor goes by under it in a frame, at the pace the walk is painted for)
    const d = (mob.pace * TILE3) / mob.walkFps;
    const down = (z: number): boolean => Math.abs(z - mob.build.ankle) < 0.05;
    const seen = { L: 0, R: 0 };
    for (let i = 0; i < n; i++) {
      const a = skeletonAt(mob, 'walk', i / mob.walkFps);
      const b = skeletonAt(mob, 'walk', (i + 1) / mob.walkFps);
      assert.ok(down(a.ankleL[2]) || down(a.ankleR[2]), `${mob.id}: frame ${i} has no foot on the floor`);
      for (const side of ['L', 'R'] as const) {
        const fa = side === 'L' ? a.ankleL : a.ankleR;
        const fb = side === 'L' ? b.ankleL : b.ankleR;
        if (down(fa[2])) seen[side]++;
        if (!down(fa[2]) || !down(fb[2])) continue;
        // (on the floor, where the figure was a frame ago: it has come d further on)
        const slid = Math.hypot(fb[0] + (i + 1) * d - (fa[0] + i * d), fb[1] - fa[1]);
        assert.ok(slid < 0.25, `${mob.id}: the ${side === 'L' ? 'left' : 'right'} foot slides ${slid.toFixed(2)} between frames ${i} and ${i + 1}`);
      }
    }
    assert.ok(seen.L >= 3 && seen.R >= 3, `${mob.id}: each foot is down for a while (${seen.L}, ${seen.R} frames)`);
  }
});

const ARTS: [Mob, () => ActorArt, (pace: number) => ActorArt][] = [
  [SHADE, () => makeShadeArt3(), makeShadeArt3],
  [BONEWARD, () => makeBonewardArt3(), makeBonewardArt3],
  [GOLEM, () => makeGolemArt3(), makeGolemArt3],
];

/** Every frame of a facing, by what it is: the living, and the dying. */
function framesOf(set: AnimSet): { living: Sprite[]; dying: Sprite[] } {
  const c = set.clips ?? {};
  return { living: [...set.idle, ...set.walk, ...set.attack, ...(c.attack?.frames ?? []), ...(c.reel?.frames ?? [])], dying: [...(c.die?.frames ?? [])] };
}

test('each is made as the game takes a monster: both facings, every list and clip, its blow on a frame, its walk shown to match a pace', () => {
  for (const [mob, make, makeAt] of ARTS) {
    const art = make();
    for (const view of ['front', 'back'] as const) {
      const set = art[view];
      const c = set.clips ?? {};
      assert.equal(set.idle.length, mob.idleFrames, `${mob.id} ${view}: its standing loop`);
      assert.equal(set.walk.length, mob.walkFrames, `${mob.id} ${view}: its walk`);
      assert.equal(set.attack.length, 3, `${mob.id} ${view}: the attack's three stills`);
      assert.equal(set.idleFps, mob.idleFps);
      assert.equal(set.walkFps, mob.walkFps);
      assert.ok(c.attack && c.attack.fps === 30 && c.attack.hit === mob.hit, `${mob.id} ${view}: its attack, with its blow`);
      if (c.attack) {
        const keys = mob.attack.motion.keys;
        assert.equal(c.attack.frames.length, Math.round(keys[keys.length - 1].at * 30) + 1);
        assert.ok(Math.abs(mob.hit * 30 - Math.round(mob.hit * 30)) < 1e-9, `${mob.id}: the blow falls on a frame`);
      }
      assert.ok(c.die && c.die.fps === DEATH_FPS && c.die.frames.length === Math.round(mob.dieTime * DEATH_FPS) + 1, `${mob.id} ${view}: its death`);
      assert.ok(c.reel && c.reel.frames.length >= 6, `${mob.id} ${view}: struck`);
      const { living, dying } = framesOf(set);
      for (const sp of [...living, ...dying]) assert.ok(sp.w > 0 && sp.h > 0, `${mob.id} ${view}: a frame with nothing in it`);
      // (what is dead does not glow: the last frame of its death has no light of its own)
      if (c.die) assert.ok(!c.die.frames[c.die.frames.length - 1].lights?.length, `${mob.id} ${view}: light in what is left`);
    }
    // (at twice the pace its feet were painted for, its walk is shown twice as fast, so that they still grip)
    assert.ok(Math.abs((makeAt(mob.pace * 2).front.walkFps ?? 0) - mob.walkFps * 2) < 1e-9, `${mob.id}: the walk is not matched to the pace`);
  }
});

test('in every frame the game would show: no cyan, the pink edge on the living and none on the dying', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const [mob, make] of ARTS) {
    const art = make();
    for (const view of ['front', 'back'] as const) {
      const { living, dying } = framesOf(art[view]);
      for (const [list, alive] of [[living, true], [dying, false]] as const) {
        for (const sp of list) {
          const d = paintingOf(sp).d;
          let rim = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] === 0) continue;
            const key = `${d[i]},${d[i + 1]},${d[i + 2]}`;
            assert.ok(!FRIEND.has(key) && !cyanGlow(d[i], d[i + 1], d[i + 2]), `${mob.id} ${view}: cyan (${key})`);
            if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
          }
          for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) {
            const [r, g, b] = rgba(l.color);
            assert.ok(!FRIEND.has(`${r},${g},${b}`) && !cyanGlow(r, g, b), `${mob.id} ${view}: a cyan light (${l.color})`);
          }
          if (alive) assert.ok(rim > 30, `${mob.id} ${view}: a living frame without its pink edge (${rim})`);
          else assert.equal(rim, 0, `${mob.id} ${view}: a dying frame with an edge`);
        }
      }
    }
  }
});
