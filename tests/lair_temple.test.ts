// FLOOR 5, THE MINE THAT BECOMES HIS TEMPLE, LOOK A (THROUGH THE THRESHOLD), MADE GAME-READY (src/art/lair_temple.ts behind
// LAIR_TEMPLE, off; his gate, src/art/lair_gate.ts behind LAIR_GATE, off; nothing of the game imports them), held to his art
// rulebook before it goes to the main chat: off and imported by nothing of the game; every picture painted, at its size and
// anchored where the game lays it (a floor tile at its top corner, a wall tile at its top corner's floor point with its face
// hanging to the floor, as high as floor 5's walls and on their line column by column, its top fading out as the game's; the
// threshold as strips, as a gate's arch is; the cave's mouth from floor 4 its shape and anchor unchanged, its wall the mine's on
// the walls' line); crisp (every pixel all there or not at all but the walls' fading tops, in the game's own four steps; a floor
// tile covering its whole diamond; no pixel alone; nothing cut off); nothing cyan (the friend's); the enemy's pink only in the
// rift's cracks, the cult's mark over the threshold, his gate's skull and floor 5's own fire; the floor and walls darker than
// the darkest word; light from the upper left; the posts and pilasters every two tiles; the lanterns', the braziers' and the
// cracks' frames and light; floor 5's own pieces in look A's colours, their shapes and fire as they were, the shaft unchanged;
// and his gate: the way the game's three tiles, the skull in embers and alight, the drop from up to down, its timing
// (Movement 9), the slam.
//   run: tsx --test tests/lair_temple.test.ts

// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import {
  CRACK_TILES, EARTH, FADE_STEPS, LAIR_FADE, LAIR_LIGHTS, LAIR_OWN, LAIR_OWN_PART, LAIR_PART, LAIR_TEMPLE, LAIR_UNCHANGED, LAIR_WALL, RAIL_TILES, ROCK,
  THRESHOLD, gradeColour, inThresholdWay, makeLairTempleArt,
} from '../src/art/lair_temple';
import {
  LAIR_GATE, LAIR_GATE_DROP, LAIR_SLAM_AT, LG_BARS, LG_LIFT, LG_SKULL, LG_SLAM_FRAMES, LG_SPRING, LG_UNDER, lairGateDropAt, lairGateSlam, lairInWay, lairLift,
  makeLairGateArt,
} from '../src/art/lair_gate';
import { lairGates, lairPieces } from '../src/art/floor5';
import { lairMouth } from '../src/art/cave4';
import { shaftStill } from '../src/art/shaft';
import { lairGround } from '../src/art/lair';
import { ARCH_WIDE, GATE_UP, PILLAR, SPAN, STRIP } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { WALL_LOOK } from '../src/art/ground';
import { WORD_COLOR } from '../src/art/icons';
import { FLAME } from '../src/art/mkit';
import { EMBER } from '../src/art/props';
import { GRAIN } from '../src/art/kit';
import type { Px, Sprite } from '../src/engine/px';
import { SHINES, anchor, count, each, hex, hsv, luma, mean, rgb, sprites, test } from './floor_checks';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const assert: Assert = nodeAssert;

paintWithoutCanvas();
const A = makeLairTempleArt();
const GA = makeLairGateArt();

const floors: [string, Sprite][] = [];
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) floors.push([`the mine's floor ${x},${y}`, A.mine.floor(x, y)], [`the temple's flags ${x},${y}`, A.temple.floor(x, y)]);
const walls: [string, Sprite][] = [];
const wallsOf = (n: string, list: Sprite[][], along: string): void => list.forEach((fr, k) => fr.forEach((s, f) => walls.push([`${n} along ${along} ${k} frame ${f}`, s])));
wallsOf("the mine's wall", A.mine.faceLeft, 'x');
wallsOf("the mine's wall", A.mine.faceRight, 'y');
wallsOf("the temple's wall", A.temple.faceLeft, 'x');
wallsOf("the temple's wall", A.temple.faceRight, 'y');
wallsOf("his hall's wall", A.hall.faceLeft, 'x');
wallsOf("his hall's wall", A.hall.faceRight, 'y');
const tiles: [string, Sprite][] = [...A.mine.tiles, ...A.temple.tiles].flatMap((p) => p.frames!.map((s, f) => [`${p.name} ${f}`, s] as [string, Sprite]));
const ownPieces = A.pieces.filter((p) => (LAIR_OWN as readonly string[]).includes(p.name));
const ownSprites: [string, Sprite][] = ownPieces.flatMap((p) => sprites(p).map((s, i) => [`${p.name} ${i}`, s] as [string, Sprite]));
const thresholds: [string, Sprite][] = [true, false].flatMap((alongX) => A.threshold(alongX).map((q, i) => [`the threshold ${alongX ? 'along x' : 'along y'} ${i}`, q.s] as [string, Sprite]));
const mine: [string, Sprite][] = [...floors, ...tiles, ...walls, ...ownSprites];
const floorLike: Sprite[] = [...floors.map(([, s]) => s), ...tiles.map(([, s]) => s)];
const FIRE = new Set(EMBER.map((c) => c.toLowerCase()));
const FLAMES = new Set(FLAME.map((c) => c.toLowerCase()));
const isFire = (r: number, g: number, b: number): boolean => FIRE.has(hex(r, g, b));
const cyanIn = (s: Sprite): string[] => {
  const out = new Set<string>();
  each(s, (r, g, b) => {
    const [h, sa, v] = hsv(r, g, b);
    if (h >= 160 && h <= 205 && sa > 0.3 && v > 0.4) out.add(hex(r, g, b));
  });
  return [...out];
};
const isPink = (r: number, g: number, b: number): boolean => {
  const [h, sa, v] = hsv(r, g, b);
  return h >= 290 && h <= 352 && sa > 0.45 && v > 0.3;
};
const pinkIn = (s: Sprite, allowShines: boolean): string[] => {
  const out = new Set<string>();
  each(s, (r, g, b) => {
    const c = hex(r, g, b);
    if (isPink(r, g, b) && !(allowShines && SHINES.has(c))) out.add(c);
  });
  return [...out];
};
const edgeCount = (p: Px): number => {
  let edge = 0;
  for (let x = 0; x < p.w; x++) edge += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
  for (let y = 0; y < p.h; y++) edge += (p.has(0, y) ? 1 : 0) + (p.has(p.w - 1, y) ? 1 : 0);
  return edge;
};

test('the mine that becomes his temple, and his gate: off; brought into the game by the main chat, and by nothing else', () => {
  // (2 Nov 2026, his “New looks for the first 5 floors are almost done.  We want those in the release as well”: the main chat brought
  // it in behind its switches, off until his yes to it in play)
  const BROUGHT = ['art/lair_temple.ts', 'art/lair_gate.ts', 'art/films.ts', 'art/floors.ts', 'game/lair_way.ts', 'game/floor_looks.ts', 'main.ts', 'render/lair.ts', 'render/render.ts'].map((f) => join('src', f));
  assert.ok(LAIR_TEMPLE.on === false && LAIR_GATE.on === false, 'LAIR_TEMPLE and LAIR_GATE are off');
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.includes(join('src', 'dev')) && !BROUGHT.includes(p) && /from '\.\.?\/(art\/)?lair_(temple|gate)'/.test(readFileSync(p, 'utf8'))) found.push(p);
    }
  };
  walk('src');
  assert.ok(found.length === 0, `imported by ${found.join(', ')}`);
});

test('every picture painted, the pieces the brief asks for', () => {
  for (const [n, s] of [...mine, ...thresholds]) assert.ok(count(s) > 8, `${n}: ${count(s)} pixels`);
  const names = [...A.mine.tiles, ...A.temple.tiles].map((p) => p.name);
  for (const [n] of RAIL_TILES) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const [n] of CRACK_TILES) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const n of ['grit and stones', 'grit at a wall along x', 'grit at a wall along y', 'bones on the flags']) assert.ok(names.includes(n), `the tile "${n}"`);
  for (const n of LAIR_OWN) assert.ok(A.pieces.some((p) => p.name === n), `the piece "${n}"`);
  // floor 5's own, all of them, each in a part (the mine's or the temple's)
  for (const p of lairPieces()) {
    assert.ok(A.pieces.some((q) => q.name === p.name), `floor 5's own "${p.name}"`);
    assert.ok(LAIR_PART[p.name] === 'mine' || LAIR_PART[p.name] === 'temple', `"${p.name}" in a part`);
  }
  for (const list of [A.mine.faceLeft, A.mine.faceRight, A.temple.faceLeft, A.temple.faceRight, A.hall.faceLeft, A.hall.faceRight]) assert.ok(list.length === 4 && list.every((fr) => fr.length === 4), 'four tiles of wall each way, four frames each');
  assert.ok(A.threshold(true).length === 20 && A.threshold(false).length === 20, 'the threshold: five tiles of strips each way');
});

test("every picture at its size and anchored where the game lays it; the walls as high as floor 5's, on their line column by column, their tops fading as the game's", () => {
  assert.equal(LAIR_WALL, WALL_LOOK.tall * GRAIN, "as high as the game's walls (WALL_LOOK.tall)");
  assert.equal(LAIR_FADE, WALL_LOOK.fade * GRAIN, "their tops fading as far down as the game's (WALL_LOOK.fade)");
  for (const s of floorLike) {
    const q = paintingOf(s);
    assert.ok(q.w === 64 && q.h === 32 && anchor(s)[0] === 32 && anchor(s)[1] === 0 && s.density === GRAIN, 'a floor tile 64 x 32 at its top corner');
  }
  for (const [n, s] of walls) {
    const q = paintingOf(s);
    const [, ay] = anchor(s);
    assert.ok(q.w === 64 && q.h === 32 + LAIR_WALL && anchor(s)[0] === 32 && ay === LAIR_WALL, `${n}: 64 x ${32 + LAIR_WALL} at the floor point of its top corner`);
    for (let x = 0; x < q.w; x++) {
      let k = 0;
      for (let y = 0; y < q.h; y++) if (q.has(x, y)) k++;
      if ((n.includes('along x') && x < 32) || (n.includes('along y') && x >= 32)) assert.equal(k, LAIR_WALL, `${n}: column ${x} ${k} high`);
    }
  }
  // (on floor 5's own walls' line: column by column, the same top and the same foot as the game's, its joints filled as theirs)
  const G5 = lairGround();
  for (const [mineS, theirs] of [[A.mine.faceLeft[1][0], G5.faceLeft[0]], [A.mine.faceRight[1][0], G5.faceRight[0]], [A.temple.faceLeft[0][0], G5.faceLeft[1]], [A.hall.faceRight[3][0], G5.faceRight[2]]] as const) {
    const pa = paintingOf(mineS);
    const pb = paintingOf(theirs);
    assert.ok(pa.w === pb.w && pa.h === pb.h && anchor(mineS)[0] === anchor(theirs)[0] && anchor(mineS)[1] === anchor(theirs)[1], "as big as the game's, anchored as the game's");
    for (let x = 0; x < pa.w; x++) {
      const ends = (p: Px): string => {
        let t = -1;
        let l = -1;
        for (let y = 0; y < p.h; y++) if (p.has(x, y)) {
          if (t < 0) t = y;
          l = y;
        }
        return `${t},${l}`;
      };
      assert.equal(ends(pa), ends(pb), `column ${x}: on the game's own wall's line`);
    }
  }
  // the threshold: strips a quarter of a tile wide, from the tile before the doorway (t -1) to the tile after it (t 3.75)
  for (const alongX of [true, false]) {
    const list = A.threshold(alongX);
    assert.deepEqual(list.map((q) => q.t), Array.from({ length: 20 }, (_, i) => -1 + i / 4), 'its strips, a quarter of a tile each');
    for (const q of list) assert.ok(paintingOf(q.s).w === STRIP && q.s.density === GRAIN, 'a strip as a gate\'s');
  }
  const piece = (name: string): Sprite[] => sprites(A.pieces.find((p) => p.name === name)!);
  for (const s of [...piece("the rails' stop, along x"), ...piece("the rails' stop, along y")]) assert.ok(anchor(s)[0] === 32 && anchor(s)[1] === 30, 'the stop at the floor point under its middle');
  for (const s of [...piece('a cart on the rails, along x'), ...piece('a cart on the rails, along y')]) assert.ok(anchor(s)[0] === 48 && anchor(s)[1] === 60, 'the cart at the floor point under its middle');
  for (const s of piece('a lantern post')) assert.ok(anchor(s)[0] === 32 && anchor(s)[1] === 112, 'the lantern post at the floor point under it');
  for (const s of piece('a brazier')) assert.ok(anchor(s)[0] === 32 && anchor(s)[1] === 84, 'the brazier at the floor point under it');
});

test("Pixels 1: crisp, every pixel all there or not at all (but a wall's top, fading out in the game's four steps); a floor tile covers its whole diamond; no pixel alone; nothing cut off", () => {
  const steps = new Set(FADE_STEPS.map((k) => Math.round(255 * k)));
  for (const [n, s] of [...mine, ...thresholds]) {
    const q = paintingOf(s);
    const wall = walls.some(([m]) => m === n);
    const strip = thresholds.some(([m]) => m === n);
    let soft = 0;
    for (let x = 0; x < q.w; x++) {
      let top = -1;
      for (let y = 0; y < q.h; y++) {
        const a = q.d[(y * q.w + x) * 4 + 3];
        if (a === 0) continue;
        if (top < 0) top = y;
        if (a === 255) continue;
        if (wall && steps.has(a) && y - top < LAIR_FADE && Math.round(255 * FADE_STEPS[Math.floor(((y - top) * 4) / LAIR_FADE)]) === a) continue;
        if (strip && steps.has(a)) continue;
        soft++;
      }
    }
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
  }
  for (const s of floorLike) {
    const q = paintingOf(s);
    const holes: string[] = [];
    for (let y = 2; y <= 29; y++) {
      const hw = 2 * Math.min(y, 32 - y);
      for (let x = -hw + 3; x <= hw - 4; x++) if (!q.get(32 + x, y)) holes.push(`(${x}, ${y})`);
    }
    assert.ok(holes.length === 0, `${holes.length} holes in a floor tile: ${holes.slice(0, 6).join(' ')}`);
  }
  for (const [n, s] of mine) {
    const q = paintingOf(s);
    let loose = 0;
    for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) {
      if (!q.has(x, y)) continue;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && q.has(x + dx, y + dy)) k++;
      if (k === 0) loose++;
    }
    assert.ok(loose <= 2, `${n}: ${loose} loose pixels`);
  }
  for (const [n, s] of ownSprites) assert.equal(edgeCount(paintingOf(s)), 0, `${n}: pixels on its picture's edge`);
  // (the threshold: nothing at its strips' tops or feet: its crown and its foot within them)
  for (const [n, s] of thresholds) {
    const p = paintingOf(s);
    let e = 0;
    for (let x = 0; x < p.w; x++) e += (p.has(x, 0) ? 1 : 0) + (p.has(x, p.h - 1) ? 1 : 0);
    assert.equal(e, 0, `${n}: cut off at its top or foot`);
  }
});

test("Colour 3: nothing cyan; the enemy's pink only in the rift's cracks, the threshold's mark, the walls of his hall where the rift has cracked them, and floor 5's own fire; fire an honest orange", () => {
  for (const [n, s] of [...mine, ...thresholds]) assert.ok(cyanIn(s).length === 0, `${n}: cyan ${cyanIn(s).join(' ')}`);
  const mayBePink = (n: string): boolean => n.startsWith('a crack of the rift') || n.startsWith("his hall's wall");
  for (const [n, s] of mine) if (!mayBePink(n)) assert.ok(pinkIn(s, false).length === 0, `${n}: pink ${pinkIn(s, false).join(' ')}`);
  // the mine's own: nothing of the enemy's at all
  for (const [n, s] of [...A.mine.tiles.flatMap((p) => p.frames!.map((q) => [p.name, q] as [string, Sprite])), ...walls.filter(([m]) => m.startsWith("the mine's"))]) {
    let pink = 0;
    each(s, (r, g, b) => (pink += FLAMES.has(hex(r, g, b)) ? 1 : 0));
    assert.equal(pink, 0, `${n}: the enemy's fire in the mine`);
  }
  // his hall's walls: pink only in the tile with a crack up it
  for (let k = 0; k < 4; k++) {
    const p = A.hall.faceLeft[k][0];
    assert.ok(k === 0 ? pinkIn(p, false).length > 0 : pinkIn(p, false).length === 0, `his hall's wall ${k}: pink only where it is cracked`);
  }
  // the threshold: pink only in the mark at its head (its eyes and mouth), dull
  for (const alongX of [true, false]) {
    let pink = 0;
    for (const q of A.threshold(alongX)) {
      const p = paintingOf(q.s);
      const ay = q.s.ay * GRAIN;
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        const c = p.get(x, y);
        if (!c || !isPink(...rgb(c))) continue;
        pink++;
        const j = alongX ? x : STRIP - 1 - x;
        const u = q.t * 32 + j;
        const v = ay + Math.floor((j - 1) / 2) - y;
        const du = alongX ? u + 0.5 - 48 : 48 - (u + 0.5);
        assert.ok(Math.hypot(du, v - THRESHOLD.markZ) < THRESHOLD.markR + 2 && c !== FLAME[2], `the threshold's pink at ${u},${v} (${c})`);
      }
    }
    assert.ok(pink >= 6, `the threshold's mark: the enemy's pink dull in it (${pink})`);
  }
  // (floor 5's own pieces: no cyan; pink only where it was the enemy's own fire)
  for (const p of A.pieces) for (const s of sprites(p)) {
    const b = [...cyanIn(s), ...pinkIn(s, true)];
    assert.ok(b.length === 0, `${p.name}: ${b.join(' ')}`);
  }
  // the lights: the miners' and the braziers' honest orange; the rift's the enemy's deep pink; never cyan
  for (const [k, l] of Object.entries(LAIR_LIGHTS)) {
    if (typeof l !== 'object' || !('glow' in l)) continue;
    const [h, sa] = hsv(...rgb(l.glow.color));
    if (k === 'crack' || k === 'wallCrack') assert.ok(h >= 300 && h <= 345 && sa > 0.5, `${k}: its glow ${l.glow.color} the enemy's pink`);
    else assert.ok(h >= 15 && h <= 50 && sa > 0.5, `${k}: its glow ${l.glow.color} an honest orange`);
  }
});

test('Colour 4: its floors and its walls darker than the darkest word (at the 99th of their pixels; fire is light)', () => {
  const darkest = Math.min(...Object.values(WORD_COLOR).map((c) => luma(...rgb(c))));
  const bad: string[] = [];
  for (const [n, s] of [...floors, ...tiles, ...walls, ...thresholds.filter((_, i) => i % 3 === 0)]) {
    const h = new Array<number>(256).fill(0);
    each(s, (r, g, b) => {
      if (isFire(r, g, b) || FLAMES.has(hex(r, g, b))) return;
      h[Math.round(luma(r, g, b))]++;
    });
    const total = h.reduce((t, k) => t + k, 0);
    let seen = 0;
    let p99 = 255;
    for (let l = 0; l < 256; l++) {
      seen += h[l];
      if (seen >= total * 0.99) {
        p99 = l;
        break;
      }
    }
    if (p99 >= darkest) bad.push(`${n} ${p99}`);
  }
  assert.ok(bad.length === 0, `brighter than the darkest word (${darkest.toFixed(0)}): ${bad.join(', ')}`);
});

test('Pixels 4: light from the upper left (a wall turned to screen-left lighter than one turned to screen-right); the posts and the pilasters every two tiles', () => {
  const m = (list: Sprite[][]): number => list.reduce((t, fr) => t + mean(fr[0]), 0) / list.length;
  for (const [n, L, R] of [['the mine', A.mine.faceLeft, A.mine.faceRight], ['the temple', A.temple.faceLeft, A.temple.faceRight], ['his hall', A.hall.faceLeft, A.hall.faceRight]] as const) {
    assert.ok(m(L) > m(R) + 3, `${n}: turned left ${m(L).toFixed(0)}, right ${m(R).toFixed(0)}`);
  }
  for (const part of [A.mine, A.temple]) {
    for (let t = 0; t < 8; t++) {
      for (const alongX of [true, false]) {
        const s = alongX ? part.face(true, t, 3) : part.face(false, 3, t);
        const list = alongX ? part.faceLeft : part.faceRight;
        const k = list.findIndex((fr) => fr.includes(s));
        assert.ok(k >= 0 && (k % 2 === 0) === (t % 2 === 0), `tile ${t} ${alongX ? 'along x' : 'along y'}: variant ${k}`);
      }
    }
  }
});

test("the light: the miners' lanterns on some posts (their flames move in four frames, their light); the lantern post and the brazier; the rift's cracks, dull or glowing (they breathe)", () => {
  const fire = (s: Sprite): number => {
    let n = 0;
    each(s, (r, g, b) => (n += isFire(r, g, b) ? 1 : 0));
    return n;
  };
  const differ = (a: Sprite, b: Sprite): number => {
    const p = paintingOf(a);
    const q = paintingOf(b);
    let n = 0;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i] !== q.d[i] || p.d[i + 1] !== q.d[i + 1] || p.d[i + 2] !== q.d[i + 2] || p.d[i + 3] !== q.d[i + 3]) n++;
    return n;
  };
  for (const list of [A.mine.faceLeft, A.mine.faceRight]) {
    const lantern = list[0];
    assert.ok(lantern.every((s) => fire(s) >= 20 && (s.lights ?? []).length === 1 && s.lights![0].color === EMBER[2]), "a lantern on the bay's post: its flame, its orange light");
    assert.ok(differ(lantern[0], lantern[1]) > 0 && differ(lantern[0], lantern[2]) > 0, 'its flame moves');
    for (const k of [1, 2, 3]) assert.ok(list[k].every((s) => fire(s) === 0 && !s.lights), `wall ${k}: no lantern`);
    // (some of a wall's posts carry one, some not)
    const picks = new Set<number>();
    for (let t = 0; t < 40; t += 2) picks.add(list.findIndex((fr) => fr.includes(list === A.mine.faceLeft ? A.mine.face(true, t, 5) : A.mine.face(false, 5, t))));
    assert.ok(picks.has(0) && picks.has(2), 'lanterns on some posts, not all');
  }
  for (const n of ['a lantern post', 'a brazier']) {
    const fr = A.pieces.find((p) => p.name === n)!.frames!;
    assert.ok(fr.length === 4 && fr.every((s) => fire(s) >= 12 && (s.lights ?? []).length === 1 && s.lights![0].color === EMBER[2]), `${n}: four frames, fire, its light`);
    assert.ok(differ(fr[0], fr[1]) > 0, `${n}: its flame moves`);
  }
  for (const [n, , , glow] of CRACK_TILES) {
    const fr = A.temple.tiles.find((p) => p.name === n)!.frames!;
    if (glow) {
      assert.ok(fr.length === 4 && differ(fr[0], fr[2]) > 0 && fr.every((s) => s.lights?.[0].color === LAIR_LIGHTS.crack.glow.color), `${n}: four frames that breathe, its glow`);
    } else assert.ok(fr.length === 1 && !fr[0].lights, `${n}: dull`);
  }
  const hallCrack = A.hall.faceLeft[0];
  assert.ok(differ(hallCrack[0], hallCrack[1]) > 0, "his hall's cracked wall breathes");
  assert.ok(LAIR_LIGHTS.dark > 0.5 && LAIR_LIGHTS.dark < 0.88, "its dark, lighter than the game's far dark");
});

test('the rails: straight, bending and ending, their iron meeting the next tile\'s at the edges; the mine\'s floor warm, the temple\'s cold', () => {
  const tile = (n: string): Px => paintingOf(A.mine.tiles.find((p) => p.name === n)!.frames![0]);
  const iron = (p: Px): number => {
    let k = 0;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] && ['#5e564c', '#463f38'].includes(hex(p.d[i], p.d[i + 1], p.d[i + 2]))) k++;
    return k;
  };
  const straight = iron(tile('rails along x'));
  assert.ok(straight > 40, `rails along x: ${straight} pixels of iron`);
  for (const [n, , b] of RAIL_TILES) {
    const k = iron(tile(n));
    if (b === null) assert.ok(k > straight * 0.35 && k < straight * 0.8, `${n}: half the iron (${k})`);
    else assert.ok(k > straight * 0.6, `${n}: ${k}`);
  }
  // (each rail meets the next tile's where it crosses the tile's edge: a third of a tile apart, about the edge's middle)
  const near = (p: Px, x: number, y: number): boolean => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (['#5e564c', '#463f38', '#2e2a26', '#121010'].includes(p.get(Math.round(x + dx), Math.round(y + dy)) ?? '')) return true;
    return false;
  };
  for (const [n, a, b] of RAIL_TILES) {
    const p = tile(n);
    for (const e of [a, b]) {
      if (e === null) continue;
      for (const o of [-0.2, 0.2]) {
        const [u, v] = e === '-x' ? [0.05, 0.5 + o] : e === '+x' ? [0.95, 0.5 + o] : e === '-y' ? [0.5 + o, 0.05] : [0.5 + o, 0.95];
        assert.ok(near(p, 32 + (u - v) * 32, (u + v) * 16), `${n}: its rail at its ${e} edge (${o})`);
      }
    }
  }
  assert.ok(A.mine.floor(0, 0) === A.mine.floor(4, -4) && A.temple.floor(1, 2) === A.temple.floor(5, 6), 'the floors repeat every four tiles');
  const [er, , eb] = rgb(EARTH[2]);
  assert.ok(er > eb + 8, "the mine's earth warm");
  void ROCK;
});

test("floor 5's own pieces in look A's colours: every one there, its shapes, its fire and its lights as they were; the mine's warmed, the temple's cooled; the shaft unchanged", () => {
  const before = lairPieces();
  for (const p of before) {
    const q = A.pieces.find((r) => r.name === p.name)!;
    assert.ok(q.kind === p.kind, `${p.name}: there`);
    const a = sprites(p);
    const b = sprites(q);
    assert.equal(a.length, b.length, `${p.name}: as many pictures`);
    for (let i = 0; i < a.length; i++) {
      const pa = paintingOf(a[i]);
      const pb = paintingOf(b[i]);
      assert.ok(pa.w === pb.w && pa.h === pb.h && a[i].ax === b[i].ax && a[i].ay === b[i].ay, `${p.name} ${i}: its size and anchor`);
      let shape = 0;
      let fire = 0;
      for (let k = 0; k < pa.d.length; k += 4) {
        if ((pa.d[k + 3] === 0) !== (pb.d[k + 3] === 0)) shape++;
        const ca = hex(pa.d[k], pa.d[k + 1], pa.d[k + 2]);
        if (pa.d[k + 3] && SHINES.has(ca) && ca !== hex(pb.d[k], pb.d[k + 1], pb.d[k + 2])) fire++;
      }
      assert.ok(shape === 0 && fire === 0, `${p.name} ${i}: ${shape} pixels changed shape, ${fire} of its fire changed`);
      assert.equal((a[i].lights ?? []).length, (b[i].lights ?? []).length, `${p.name} ${i}: its lights`);
    }
  }
  for (const n of LAIR_UNCHANGED) {
    const a = sprites(before.find((p) => p.name === n)!);
    const b = sprites(A.pieces.find((p) => p.name === n)!);
    assert.ok(a.every((s, i) => s === b[i]), `${n}: the game's own, unchanged`);
  }
  assert.ok(A.pieces.find((p) => p.name === 'the mine shaft')!.frames![0] === shaftStill().empty, 'the shaft: art/shaft.ts, as it stands');
  for (const c of ['#5a5378', '#867ea6', '#4a3a5a']) {
    const [r0, , b0] = rgb(gradeColour(c, 'mine'));
    const [r1, , b1] = rgb(gradeColour(c, 'temple'));
    const [, s0] = hsv(...rgb(c));
    const [, s1] = hsv(...rgb(gradeColour(c, 'mine')));
    assert.ok(r0 - b0 > r1 - b1 && s1 < s0, `${c}: the mine's ${gradeColour(c, 'mine')} warmer than the temple's ${gradeColour(c, 'temple')}`);
  }
  for (const n of Object.keys(LAIR_OWN_PART)) assert.ok(LAIR_OWN_PART[n as keyof typeof LAIR_OWN_PART] === 'mine' || n === 'a brazier', `${n}: the mine's`);
});

// =================================================================================================
// THE CAVE'S MOUTH FROM FLOOR 4 (art/cave4.ts lairMouth, his yes): its shape and anchor unchanged; the mine's wall round it on the
// walls' line

test("the cave's mouth from floor 4: its cave, rim, shape and anchor unchanged, in look A's colours; the wall round it the mine's, on the walls' line", () => {
  for (const alongX of [true, false]) {
    const theirs = lairMouth(alongX);
    const ours = A.mouth(alongX);
    assert.ok(ours.ax === theirs.ax && ours.ay === theirs.ay, 'its anchor');
    for (const k of ['under', 'over', 'whole'] as const) {
      const pa = paintingOf(theirs[k]);
      const pb = paintingOf(ours[k]);
      assert.ok(pa.w === pb.w && pa.h === pb.h && theirs[k].ax === ours[k].ax && theirs[k].ay === ours[k].ay, `${k}: its size and anchor`);
      let shape = 0;
      let colour = 0;
      for (let i = 0; i < pa.d.length; i += 4) {
        if ((pa.d[i + 3] === 0) !== (pb.d[i + 3] === 0)) shape++;
        if (pa.d[i + 3] && (pa.d[i] !== pb.d[i] || pa.d[i + 1] !== pb.d[i + 1] || pa.d[i + 2] !== pb.d[i + 2])) colour++;
      }
      assert.ok(shape === 0, `${alongX ? 'along x' : 'along y'} ${k}: ${shape} pixels changed shape`);
      assert.ok(colour > 1000, `${k}: in look A's colours (${colour} pixels changed colour)`);
      assert.ok(cyanIn(ours[k]).length === 0 && pinkIn(ours[k], true).length === 0, `${k}: nothing cyan, nothing pink`);
    }
    // (its wall is the mine's: column by column, where their wall's top was, the mine's wall's, fading as the walls do)
    const p = paintingOf(ours.over);
    const steps = new Set(FADE_STEPS.map((a) => Math.round(255 * a)));
    let faded = 0;
    for (let i = 3; i < p.d.length; i += 4) if (steps.has(p.d[i])) faded++;
    assert.ok(faded > 200, `its wall's top fades as the walls' do (${faded})`);
  }
});

test("the shaft where placeShaft puts it fits his hall unchanged: the game's own picture, a tile off the back walls, as tall as it was", () => {
  const s = shaftStill().empty;
  assert.ok(A.pieces.find((p) => p.name === 'the mine shaft')!.frames!.includes(s), 'the same picture');
  // (it stands a tile off his hall's back walls: its foot's footprint, three tiles by three round its middle, inside the hall)
  const b = paintingOf(s).bounds()!;
  assert.ok(anchor(s)[1] - b.y <= 160, `its height over its foot: ${anchor(s)[1] - b.y}`);
});

// =================================================================================================
// THE THRESHOLD

test('the threshold: the doorway open through its three tiles, a hero under it with room; the carved front either side to the tile beyond; the mark at its head; the same both ways, lit along x', () => {
  // (the way: across the doorway's three tiles at the floor, but two pixels' band either side; its middle open to its head)
  let wide = 0;
  for (let du = -60; du < 60; du++) if (inThresholdWay(du + 0.5, 0)) wide++;
  assert.ok(wide >= 90 && wide <= 96, `the way at the floor: ${wide} across`);
  let head = 0;
  for (let v = 0; v < 120; v++) if (inThresholdWay(0.5, v)) head = v;
  assert.ok(head >= 60 && head < THRESHOLD.markZ - THRESHOLD.markR, `its head at ${head}, the mark over it`);
  for (let v = 0; v < 56; v++) assert.ok(inThresholdWay(-24, v) && inThresholdWay(24, v), `a hero's breadth clear at ${v}`);
  const plane = (strips: Strip[], alongX: boolean): Map<string, string> => {
    const out = new Map<string, string>();
    for (const q of strips) {
      const p = paintingOf(q.s);
      const ay = q.s.ay * GRAIN;
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        const c = p.get(x, y);
        if (c === null) continue;
        const j = alongX ? x : STRIP - 1 - x;
        out.set(`${q.t * 32 + j},${ay + Math.floor((j - 1) / 2) - y}`, c);
      }
    }
    return out;
  };
  const X = plane(A.threshold(true), true);
  const Y = plane(A.threshold(false), false);
  assert.deepEqual([...X.keys()].sort(), [...Y.keys()].sort(), 'the same shape both ways');
  const m2 = (m: Map<string, string>): number => [...m.values()].reduce((t, c) => t + luma(...rgb(c)), 0) / m.size;
  assert.ok(m2(X) > m2(Y) + 2, `the face along x lit: ${m2(X).toFixed(1)} against ${m2(Y).toFixed(1)}`);
  // the front over the tiles either side of the doorway, from the floor up to the wall's height; its crown over the wall's top
  for (const u of [-28, -12, 108, 124]) {
    let k = 0;
    for (let v = 0; v < LAIR_WALL; v++) if (X.has(`${u},${v}`)) k++;
    assert.ok(k >= LAIR_WALL - 2, `the front at ${u}: ${k} high`);
  }
  let crown = 0;
  for (let v = 0; v < 140; v++) if (X.has(`48,${v}`)) crown = v;
  assert.ok(crown >= THRESHOLD.crown - 2 && crown > LAIR_WALL + 16, `its crown at ${crown}, over the walls' fading top`);
  for (let v = 0; v < 56; v++) assert.ok(!X.has(`47,${v}`) && !X.has(`48,${v}`), `the middle of the way clear at ${v}`);
});

// =================================================================================================
// HIS GATE

function plane(strips: Strip[], alongX: boolean): Map<string, string> {
  const out = new Map<string, string>();
  for (const q of strips) {
    const p = paintingOf(q.s);
    assert.ok(p.w === STRIP && q.s.density === GRAIN, 'a strip a quarter of a tile wide');
    const ay = q.s.ay * GRAIN;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      const j = alongX ? x : STRIP - 1 - x;
      out.set(`${q.t * 32 + j},${ay + Math.floor((j - 1) / 2) - y}`, c);
    }
  }
  return out;
}
const lowest = (m: Map<string, string>): number => Math.min(...[...m.keys()].map((k) => Number(k.split(',')[1])));
const gatePics: [string, Sprite][] = [['the pillar', GA.pillar(true)]];
for (const alongX of [true, false]) {
  for (const lit of [false, true]) GA.arch(alongX, true, lit).forEach((q, i) => gatePics.push([`the arch ${alongX}${lit}, ${i}`, q.s]));
  for (const raise of [0, 30, GATE_UP]) GA.portcullis(alongX, true, raise).forEach((q, i) => gatePics.push([`the drop ${alongX} ${raise}, ${i}`, q.s]));
  for (let f = 0; f < LG_SLAM_FRAMES; f++) gatePics.push([`the slam ${alongX} ${f}`, lairGateSlam(alongX, f)]);
}

test("his gate: a GateArt; everything but the boss's pillar, arch and drop floor 5's own (in look A's colours); every picture painted, crisp, nothing cyan, nothing pink but the skull", () => {
  const F5 = lairGates();
  const like = (a: Sprite, b: Sprite): boolean => {
    const pa = paintingOf(a);
    const pb = paintingOf(b);
    if (pa.w !== pb.w || pa.h !== pb.h || a.ax !== b.ax || a.ay !== b.ay) return false;
    for (let k = 3; k < pa.d.length; k += 4) if (pa.d[k] !== pb.d[k]) return false;
    return true;
  };
  assert.ok(like(GA.post, F5.post) && like(GA.pillar(false), F5.pillar(false)) && like(GA.leaf(32, 16), F5.leaf(32, 16)) && like(GA.lever(true), F5.lever(true)), "the doors' and plain gates' pictures: floor 5's own, their shapes");
  const pa = GA.arch(true, false, false);
  const pb = F5.arch(true, false, false);
  assert.ok(pa.length === pb.length && pa.every((q, i) => q.t === pb[i].t && like(q.s, pb[i].s)), "the plain gates' arches: floor 5's own");
  assert.ok(GA.arch(false, true, true) === GA.arch(false, true, true) && GA.portcullis(true, true, 44) === GA.portcullis(true, true, 44), 'painted once and kept');
  for (const [n, s] of gatePics) {
    const p = paintingOf(s);
    assert.ok(p.bounds() !== null, `${n}: painted`);
    let soft = 0;
    for (let i = 3; i < p.d.length; i += 4) if (p.d[i] !== 0 && p.d[i] !== 255) soft++;
    assert.ok(soft === 0, `${n}: ${soft} soft pixels`);
    assert.ok(cyanIn(s).length === 0, `${n}: cyan ${cyanIn(s).join(' ')}`);
    if (!n.startsWith('the arch')) assert.ok(pinkIn(s, false).length === 0, `${n}: pink ${pinkIn(s, false).join(' ')}`);
  }
  for (const alongX of [true, false]) for (const lit of [false, true]) {
    for (const [k, c] of plane(GA.arch(alongX, true, lit), alongX)) {
      if (!isPink(...rgb(c))) continue;
      const [u, vv] = k.split(',').map(Number);
      assert.ok(Math.hypot((u + 0.5 - ARCH_WIDE / 2) / LG_SKULL.r, (vv + 0.5 - LG_SKULL.z) / LG_SKULL.r) < 1.25, `pink only in the skull: ${k}`);
    }
  }
  for (const [n, s] of gatePics.filter(([m]) => m === 'the pillar' || m.startsWith('the slam'))) assert.equal(edgeCount(paintingOf(s)), 0, `${n}: pixels on its picture's edge`);
  const pp = paintingOf(GA.pillar(true));
  const b = pp.bounds()!;
  const high = anchor(GA.pillar(true))[1] - b.y;
  assert.ok(high >= LG_UNDER + 4 && high <= LG_UNDER + 16, `the pylon up to the lintel (its back corner a little higher on the screen): ${high}`);
});

test('his gate: the way exactly the game\'s three tiles, a hero under it with room to spare; the lintel and its fangs; light from the upper left, the same gate both ways', () => {
  assert.ok(SPAN === 96 && PILLAR === 12, 'three tiles between pillars three eighths of a tile to a side');
  const way: number[] = [];
  for (let u = -4; u < ARCH_WIDE + 4; u++) if (lairInWay(u, 0)) way.push(u);
  assert.ok(way.length === SPAN && way[0] === PILLAR, `the way: ${way[0]} to ${way[way.length - 1]}`);
  for (const alongX of [true, false]) {
    const m = plane(GA.arch(alongX, true, false), alongX);
    assert.equal(lowest(m), LG_SPRING, "its fangs' tips the lowest of it");
    for (let v = 0; v < LG_UNDER; v++) assert.ok(!m.has(`59,${v}`) && !m.has(`60,${v}`), `the middle of the way clear at ${v}`);
    // the fangs: hanging over the way, long and short
    let fangs = 0;
    for (let u = PILLAR; u < PILLAR + SPAN; u++) if (m.has(`${u},${LG_SPRING + 2}`)) fangs++;
    assert.ok(fangs >= 8 && fangs <= 40, `fangs over the way: ${fangs}`);
  }
  const mean2 = (m: Map<string, string>): number => [...m.values()].reduce((t, c) => t + luma(...rgb(c)), 0) / m.size;
  const X = plane(GA.arch(true, true, false), true);
  const Y = plane(GA.arch(false, true, false), false);
  assert.ok(mean2(X) > mean2(Y) + 3, `the face along x lit: ${mean2(X).toFixed(1)} against ${mean2(Y).toFixed(1)}`);
  assert.deepEqual([...X.keys()].sort(), [...Y.keys()].sort(), 'the same shape both ways');
  let top = 0;
  for (const k of X.keys()) top = Math.max(top, Number(k.split(',')[1]));
  assert.ok(top >= 180 && top <= 220, `the rock's crest at ${top}`);
});

test("his gate: the skull in embers (the enemy's, dull) and alight (pink to gold, and it gives the enemy's light)", () => {
  for (const alongX of [true, false]) {
    const fire = (m: Map<string, string>, cs: string[]): number => [...m.values()].filter((c) => cs.includes(c)).length;
    const dim = plane(GA.arch(alongX, true, false), alongX);
    const lit = plane(GA.arch(alongX, true, true), alongX);
    assert.ok(fire(dim, [FLAME[0], FLAME[1]]) >= 20 && fire(dim, [FLAME[3], FLAME[4]]) === 0, `in embers: ${fire(dim, [FLAME[0], FLAME[1]])}, none bright`);
    assert.ok(fire(lit, [FLAME[3], FLAME[4]]) >= 30 && fire(lit, [FLAME[1], FLAME[2]]) >= 20, `alight: ${fire(lit, [FLAME[3], FLAME[4]])} pixels gold, pink at its rims`);
    const lights = GA.arch(alongX, true, true).flatMap((q) => q.s.lights ?? []);
    assert.ok(lights.length === 1 && lights[0].color === FLAME[2], "alight, the enemy's light");
    assert.ok(GA.arch(alongX, true, false).every((q) => !q.s.lights), 'in embers, none');
  }
});

test('his gate: the drop from up to down: drawn up, its hooks under the fangs; let down step by step, down to the floor on its hooks; bars of black iron', () => {
  for (const alongX of [true, false]) {
    let last = Infinity;
    for (let raise = GATE_UP; raise >= 0; raise -= 2) {
      const m = plane(GA.portcullis(alongX, true, raise), alongX);
      const lo = lowest(m);
      assert.equal(lo, lairLift(raise), `raised ${raise}: its lowest point ${lo}`);
      assert.ok(lo <= last, 'coming down');
      last = lo;
      for (const k of m.keys()) {
        const [u, v] = k.split(',').map(Number);
        assert.ok(lairInWay(u, v), `only in the way: ${k}`);
      }
    }
    const down = plane(GA.portcullis(alongX, true, 0), alongX);
    let hooks = 0;
    for (let u = PILLAR; u < PILLAR + SPAN; u++) if (down.has(`${u},0`)) hooks++;
    assert.ok(hooks >= 6, `down to the floor on its hooks: ${hooks}`);
    assert.ok(down.size > 700, `down, it fills the way: ${down.size}`);
    const iron = [...down.values()].filter((c) => { const [, sa, v] = hsv(...rgb(c)); return v < 0.4 && (sa < 0.36 || v < 0.12); }).length;
    assert.ok(iron === down.size, 'black iron');
  }
  assert.ok(lairLift(GATE_UP) === LG_LIFT && LG_LIFT >= 56 + 12 && LG_LIFT < LG_SPRING, `up, its hooks ${LG_LIFT} over the floor (a hero is 56), under the fangs`);
  void LG_BARS;
});

test("his gate: the drop (Movement 9): held juddering at the top, down in two frames, a hard landing and a bounce; the slam's stones fall and its dust thins", () => {
  const D = LAIR_GATE_DROP;
  assert.ok(D.every((r) => r >= 0 && r <= GATE_UP && r % 2 === 0) && D[0] === GATE_UP, "from the top, the game's raise");
  const judder = D.slice(0, LAIR_SLAM_AT - 1);
  assert.ok(judder.length >= 8 && judder.every((r) => r >= GATE_UP - 12) && judder.some((r) => r < GATE_UP), `held at the top, juddering: ${judder.join(' ')}`);
  assert.ok(D[LAIR_SLAM_AT] === 0 && D[LAIR_SLAM_AT - 1] > 0 && D[LAIR_SLAM_AT - 1] < GATE_UP - 12, 'down in two frames');
  const after = D.slice(LAIR_SLAM_AT);
  assert.ok(Math.max(...after) >= 6 && D[D.length - 1] === 0, `a bounce, then down: ${after.join(' ')}`);
  assert.ok(lairGateDropAt(LAIR_SLAM_AT).slam === 0 && lairGateDropAt(LAIR_SLAM_AT).lit && !lairGateDropAt(LAIR_SLAM_AT - 1).lit && lairGateDropAt(LAIR_SLAM_AT + LG_SLAM_FRAMES).slam === -1, 'the slam and the skull from the landing');
  const n = (f: number): number => count(lairGateSlam(true, f));
  assert.ok(n(6) > n(0) && n(LG_SLAM_FRAMES - 1) < n(6) * 0.7, `it billows and thins: ${n(0)}, ${n(6)}, ${n(LG_SLAM_FRAMES - 1)}`);
  // the stones: high at first (shaken off the rock), on the floor by the end
  const stonesHigh = (f: number): number => {
    let k = 0;
    const s = lairGateSlam(true, f);
    each(s, (r, g, b, _a, _x, y) => {
      if ([ROCK[3], ROCK[4]].includes(hex(r, g, b)) && y < anchor(s)[1] - 60) k++;
    });
    return k;
  };
  assert.ok(stonesHigh(1) >= 10 && stonesHigh(LG_SLAM_FRAMES - 1) === 0, `stones falling: ${stonesHigh(1)} high at first, ${stonesHigh(LG_SLAM_FRAMES - 1)} at the end`);
  for (let f = 0; f < LG_SLAM_FRAMES; f++) each(lairGateSlam(true, f), (r, g, b) => assert.ok(!FLAMES.has(hex(r, g, b)) && !isFire(r, g, b), 'no fire, no pink in the slam: stone and dust'));
});
