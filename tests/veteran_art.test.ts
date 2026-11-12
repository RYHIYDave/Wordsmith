// THE VETERAN'S PICTURES IN THE GAME (art/veteran_art.ts, render/veteran_fx.ts; behind game/veteran.ts VETERAN): his frames are
// the art chat's (dev/veteran_moves.ts VET_MOTIONS), every list as long as its move, a frame the art's pose painted as the art's
// film paints it; his steps baked for the rules (game/veteran_baked.ts) the art's own; the game turns his picture and lays his
// effects as the art's film lays them: from in front and from behind, mirrored or not, as the game has him (art/sides_more.ts
// EIGHT_MORE.brawler, off at his word from the phone, 11 Nov 2026); with that on, from each of his eight sides and never mirrored.
//   run: tsx --test tests/veteran_art.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { makeHeroArt3, heroLists } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { VET_LISTS, VET_RUN_STRIDE, VET_TURN, makeVeteranArt, vetHalvesOf } from '../src/art/veteran_art';
import { toSprite } from '../src/art/kit';
import { GRID } from '../src/art/skeleton';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { VET_MOTIONS, VET_RUN, VET_TILE, carryAt, motionById, placeOf, spinAt, vetAt } from '../src/dev/veteran_moves';
import { VET_BAKED } from '../src/game/veteran_baked';
import { VETERAN, VET_MOVES } from '../src/game/veteran';
import { vetView } from '../src/render/veteran_fx';
import { EIGHT_MORE, MORE_TURN, MORE_WAY, moreSideOf } from '../src/art/sides_more';
import { VET_FX_AFTER, VET_FX_LAYERS, paintVetFx } from '../src/art/veteran_fx_art';
import { hsv } from './floor_checks';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

paintWithoutCanvas();
const ART = makeVeteranArt();

test('every list of his as long as the art\'s move: his stance, his run, every move a press makes, struck, his fall; both ways', () => {
  for (const v of ['front', 'back'] as const) {
    const set = ART[v];
    assert.equal(set.idle.length, motionById('stand').long, `${v}: his stance`);
    assert.equal(set.walk.length, motionById('run').long, `${v}: his run`);
    assert.equal(set.idleFps, 30);
    assert.equal(set.walkFps, 30);
    assert.ok(Math.abs((set.walkStride ?? 0) - 4.6 * (VET_RUN.long / 30)) < 1e-9, `${v}: his run's round covers ${set.walkStride} tiles at the hero's pace`);
    for (const id of VET_LISTS) {
      const c = set.clips?.vet?.[id];
      assert.ok(c, `${v} ${id}: a list`);
      assert.equal(c!.frames.length, motionById(id).long, `${v} ${id}: as long as the art's`);
      assert.equal(c!.fps, 30);
      const hv = vetHalvesOf(motionById(id));
      if (hv) assert.equal(set.clips?.vetHalves?.[id]?.frames.length, hv[1], `${v} ${id}: its strike's half-frames`);
    }
    for (const id of VET_LISTS) for (const k of VET_FX_LAYERS) assert.equal(set.clips?.vetFx?.[id]?.[k].length, motionById(id).long + VET_FX_AFTER, `${v} ${id}: its action lines (${k})`);
    assert.equal(set.clips?.reel?.frames.length, motionById('hurt').long, `${v}: struck`);
    assert.equal(set.clips?.fall?.frames.length, motionById('fall').long, `${v}: his fall`);
  }
  // (every move of the rules has its list)
  assert.deepEqual([...VET_LISTS].sort(), Object.keys(VET_MOVES).sort());
  assert.equal(VET_RUN_STRIDE, carryAt(motionById('run'), VET_RUN.long)[0] / VET_TILE);
});

test('a frame of his is the art\'s pose at that frame, painted as the art paints it (from in front and from behind, his turns too)', () => {
  const picks: ['front' | 'back', string, number, 'move' | 'idle' | 'walk' | 'half'][] = [
    ['front', 'jab', 12, 'move'],
    ['back', 'elbow', 26, 'move'],
    ['front', 'spinkick', 20, 'move'],
    ['back', 'knee', 21, 'move'],
    ['front', 'stand', 7, 'idle'],
    ['back', 'run', 3, 'walk'],
    ['front', 'cross', 13.5, 'half'],
  ];
  for (const [v, id, f, kind] of picks) {
    const m = motionById(id);
    const set = ART[v];
    const got = kind === 'idle' ? set.idle[f] : kind === 'walk' ? set.walk[f] : kind === 'half' ? set.clips!.vetHalves![id].frames[Math.round(f - set.clips!.vetHalves![id].from)] : set.clips!.vet![id].frames[f];
    const turn = VET_TURN[v] + spinAt(m, f);
    const want = toSprite({ px: paintVeteran(vetAt(m, f), turn).px, lights: [] }, null, VET_CANVAS.ax, VET_CANVAS.ay);
    assert.equal(unlike(got, want), 0, `${v} ${id} at ${f}: the art's pose`);
  }
});

test('his steps baked for the rules are the art\'s own: carryAt, placeOf and spinAt, frame by frame, in tiles and degrees', () => {
  assert.deepEqual(Object.keys(VET_BAKED).sort(), VET_MOTIONS.map((m) => m.id).sort());
  for (const m of VET_MOTIONS) {
    const b = VET_BAKED[m.id as keyof typeof VET_BAKED];
    assert.equal(b.long, m.long, `${m.id}: its frames`);
    assert.equal(b.carry.length, m.long + 1);
    for (let f = 0; f <= m.long; f++) {
      const c = carryAt(m, f);
      const p = placeOf(m, f).at;
      assert.ok(Math.abs(b.carry[f][0] - c[0] / VET_TILE) < 1e-4 && Math.abs(b.carry[f][1] - c[1] / VET_TILE) < 1e-4, `${m.id} ${f}: carried`);
      assert.ok(Math.abs(b.place[f][0] - p[0] / VET_TILE) < 1e-4 && Math.abs(b.place[f][1] - p[1] / VET_TILE) < 1e-4, `${m.id} ${f}: placed`);
      assert.ok(Math.abs(b.spin[f] - spinAt(m, f)) < 1e-2, `${m.id} ${f}: turned`);
    }
    // (the rules' numbers agree: where the art's carry ends)
    if (m.id in VET_MOVES) {
      const r = VET_MOVES[m.id as keyof typeof VET_MOVES];
      assert.ok(Math.abs(b.carry[m.long][0] - r.carry[0]) < 0.02 && Math.abs(b.carry[m.long][1] - r.carry[1]) < 0.02, `${m.id}: carried ${b.carry[m.long]} in all, the rules ${r.carry}`);
    }
  }
  // (plain data: nothing of the art's dev files in it)
  const src = fs.readFileSync('src/game/veteran_baked.ts', 'utf8') as string;
  assert.ok(!/from ['"][^'"]*dev\//.test(src), 'the baked steps import nothing of src/dev');
});

test('the game turns him as it turns heroes, and lays his effects as the art\'s film does: from each of his eight sides, never mirrored; with his eight sides off, from in front and behind, mirrored or not', () => {
  // (the art's film: a point of his scene (his forward, his left) turned by the view and projected; a mirrored picture mirrors
  // it about him)
  const art = (a: number, b: number, V: number, left: boolean): [number, number] => {
    const r = (V * Math.PI) / 180;
    const x = a * Math.cos(r) - b * Math.sin(r);
    const y = a * Math.sin(r) + b * Math.cos(r);
    const sx = (GRID * (x + y)) / 2;
    return [left ? -sx : sx, (GRID * 0.5 * (x - y)) / 2];
  };
  const FACINGS = [[1, 0], [0, 1], [0, -1], [-1, 0], [0.8, 0.6], [-0.6, -0.8], [0.7, -0.7], [-0.7, 0.7]];
  const POINTS = [[10, 0], [0, 10], [7, -4], [-30, 22]];
  const laid = (v: { f: [number, number]; l: [number, number] }, a: number, b: number): [number, number] => {
    const X = (a * v.f[0] + b * v.l[0]) / VET_TILE;
    const Y = (a * v.f[1] + b * v.l[1]) / VET_TILE;
    return [(X - Y) * 16, (X + Y) * 8];
  };
  const was = EIGHT_MORE.brawler;
  try {
    // (THE GAME HAS HIS EIGHT SIDES OFF, at his word from the phone, 11 Nov 2026: docs/mockups/eight_sides/BRING_IN.md, its foot.
    // WHEN HE GOES ON: this line, tests/sides_more.test.ts test 2 and tests/veteran_rules.test.ts's `eightWas`.)
    assert.equal(was, false, 'his eight sides are off in the game');
    // (HIS EIGHT SIDES ON, art/sides_more.ts EIGHT_MORE.brawler: the side for the way he faces, the art's figure turned as that
    // side is, MORE_TURN, and no picture of his a mirror)
    EIGHT_MORE.brawler = true;
    for (const [fx, fy] of FACINGS) {
      const v = vetView(fx, fy);
      assert.equal(v.side, moreSideOf(fx, fy), `facing ${fx},${fy}: the side for the way he faces`);
      assert.equal(v.left, false, `facing ${fx},${fy}: never mirrored`);
      assert.deepEqual(v.f, [...MORE_WAY[v.side!]], 'his forward is the way his side faces');
      assert.deepEqual(v.l, [v.f[1], -v.f[0]], 'his left is his left');
      for (const [a, b] of POINTS) {
        const game = laid(v, a, b);
        const want = art(a, b, MORE_TURN[v.side!], false);
        assert.ok(Math.abs(game[0] - want[0]) < 1e-9 && Math.abs(game[1] - want[1]) < 1e-9, `facing ${fx},${fy} (${v.side}): (${a}, ${b}) at ${game} on the screen, the art's ${want}`);
      }
    }
    // (HIS EIGHT SIDES OFF, as the game has him: his four ways, 0 from in front, 90 from behind, the other two mirrored)
    EIGHT_MORE.brawler = false;
    for (const [fx, fy] of FACINGS.slice(0, 6)) {
      const v = vetView(fx, fy);
      assert.equal(v.side, null);
      for (const [a, b] of POINTS) {
        const game = laid(v, a, b);
        const want = art(a, b, v.away ? 90 : 0, v.left);
        assert.ok(Math.abs(game[0] - want[0]) < 1e-9 && Math.abs(game[1] - want[1]) < 1e-9, `off, facing ${fx},${fy}: (${a}, ${b}) at ${game} on the screen, the art's ${want}`);
      }
      // (the way the picture faces is the way the game faces a hero: render/figure.ts)
      assert.equal(v.left, fx - fy < 0);
      assert.equal(v.away, fx + fy < -0.2);
    }
  } finally {
    EIGHT_MORE.brawler = was;
  }
});

test('the Brawler is the Veteran while his switch is on (and where the painter is told so), and his lists are the painter\'s', () => {
  const A = makeHeroArt3();
  assert.equal(VETERAN.on, true, 'ON at his yes of 3 Nov 2026; off for this test');
  VETERAN.on = false;
  try {
  // (the Brawler as he was, on his card: his whole set takes seconds to make)
  const old = A.of('brawler', lookOfPlace('card'));
  const vet = A.of('brawler', { ...lookOfPlace('dungeon'), vet: true });
  assert.notEqual(old.front.idle, vet.front.idle, 'the Brawler as he was, switched off');
  assert.ok(vet.front.clips?.vet?.jab, 'the Veteran');
  VETERAN.on = true;
  try {
    assert.equal(A.of('brawler', lookOfPlace('dungeon')), vet, 'switched on, the Veteran');
    assert.equal(A.of('brawler', lookOfPlace('town')), vet, 'one set of him for every place');
    const card = A.of('brawler', lookOfPlace('card'));
    for (const v of ['front', 'back'] as const) assert.equal(card[v].idle, vet[v].idle, `${v}: his card's standing the game's`);
  } finally {
    VETERAN.on = false;
  }
  for (const v of ['front', 'back'] as const) {
    const lists = heroLists(vet[v]);
    for (const id of VET_LISTS) assert.ok(lists.includes(vet[v].clips!.vet![id].frames), `${v} ${id}: painted ahead`);
    assert.ok(lists.includes(vet[v].idle) && lists.includes(vet[v].walk), `${v}: his stance and run painted ahead`);
    assert.ok(lists.includes(vet[v].clips!.vetHalves!.jab.frames), `${v}: the half-frames painted ahead`);
  }
  // (the other heroes' lists keep their places: his are after theirs)
  const knight = A.of('warrior', lookOfPlace('dungeon'));
  const k = heroLists(knight.front);
  for (let i = 0; i < k.length; i++) if (i >= k.length - 2 * VET_LISTS.length) assert.equal(k[i].length, 0, 'his places empty for the others');
  } finally {
    VETERAN.on = true;
  }
});

test('his action lines as frames: the art’s own, where it has them (the jab’s cone out at 14, the hook’s crescent, the push kick’s cone on the floor, the spinning kick’s crescent), green a punch (his word, 3 Nov: “...the brawler is Str/dex, so I think we change the color of the globe for a punch to green and the kicks stay orange/red.”) and hot orange a kick, never pink or gold', () => {
  const picks: [string, number, 'ground' | 'behind' | 'front', 'green' | 'orange'][] = [
    ['jab', 14, 'front', 'green'],
    ['hook', 17, 'front', 'green'],
    ['push', 20, 'ground', 'orange'],
    ['spinkick', 21, 'front', 'orange'],
    ['elbow', 26, 'behind', 'green'],
  ];
  for (const [id, f, layer, want] of picks) {
    for (const v of ['front', 'back'] as const) {
      const s = ART[v].clips!.vetFx![id][layer][f];
      const want2 = paintVetFx(motionById(id), f, v, layer);
      assert.equal(unlike(s, want2), 0, `${v} ${id} ${f} ${layer}: painted as made`);
      const px = paintingOf(s);
      let cyan = 0;
      let green = 0;
      let orange = 0;
      for (let i = 0; i < px.d.length; i += 4) {
        if (!px.d[i + 3]) continue;
        const [h, sat, val] = hsv(px.d[i], px.d[i + 1], px.d[i + 2]);
        assert.ok(!(h >= 290 && h <= 352 && sat > 0.4 && val > 0.4), `${v} ${id} ${f}: pink`);
        assert.ok(!(h >= 38 && h <= 64 && sat > 0.45 && val > 0.55), `${v} ${id} ${f}: gold`);
        if (h >= 170 && h <= 200 && sat > 0.4) cyan++;
        if (h >= 120 && h <= 165 && sat > 0.4) green++;
        if (h >= 8 && h <= 30 && sat > 0.5) orange++;
      }
      assert.ok((want === 'green' ? green : orange) > 40, `${v} ${id} ${f} ${layer}: ${want} (${green} green, ${cyan} cyan, ${orange} orange)`);
      assert.ok(cyan <= 4, `${v} ${id} ${f} ${layer}: no friend's cyan in his lines (${cyan})`);
    }
  }
  // (nothing before the blow but dust, and nothing long after the move)
  const late = paintingOf(ART.front.clips!.vetFx!.jab.front[27 + VET_FX_AFTER]);
  assert.ok(late.w <= 2, 'the jab\'s gone by its end and after');
});
