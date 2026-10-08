// The things of a dungeon that change while the hero is there (so they are not built into the
// place: gl/level3.ts): a chest thrown open, what is left of a barrel or an urn, the way home.
// Each stands on the origin, in the painter's axes; what has a front has it toward +y.

import { C, stone } from './kit3';
import { Mesh, ball, box, hex, lathe, rnd, slab, tone } from './mesh';
import type { RGB } from './mesh';
import { mats, rotX, rotY, rotZ, scale, translate } from './vec';

/** A chest that has been opened: the lid thrown back, and what is left in it glints. */
export function chestOpen(): Mesh {
  const m = new Mesh();
  m.add(box(-0.4, -0.27, 0.04, 0.4, 0.27, 0.42, { side: C.wood, vary: 0.08, top: C.gap }));
  for (const x of [-0.3, 0.3]) m.add(box(x - 0.05, -0.285, 0.02, x + 0.05, 0.285, 0.44, { side: C.gold }));
  for (const [x, y] of [[-0.36, -0.23], [0.36, -0.23], [-0.36, 0.23], [0.36, 0.23]] as const) m.add(box(x - 0.05, y - 0.05, 0, x + 0.05, y + 0.05, 0.06, { side: C.gold }));
  // the lid: half a barrel, standing open on its hinge at the back
  const lid = new Mesh();
  lid.add(lathe([[0.3, 0.27, -0.42], [0.3, 0.27, 0.42]], 8, { side: C.wood, top: C.woodDark, bottom: C.woodDark, vary: 0.06 }, 22.5), mats(rotY(90), scale(0.62, 1, 1)));
  for (const x of [-0.3, 0.3]) lid.add(lathe([[0.31, 0.285, -0.05], [0.31, 0.285, 0.05]], 8, { side: C.gold, top: C.gold, bottom: C.gold }, 22.5), mats(translate(x, 0, 0), rotY(90), scale(0.63, 1, 1)));
  m.add(lid, mats(translate(0, -0.27, 0.42), rotX(-104), translate(0, 0.27, 0)));
  // a last few coins in the bottom of it
  m.add(box(-0.3, -0.18, 0.1, 0.3, 0.18, 0.14, { side: C.gold, top: C.goldLight, glow: 0.35 }));
  for (let i = 0; i < 5; i++) m.add(lathe([[0.05, 0], [0.05, 0.015]], 6, { side: C.goldLight, glow: 0.6 }), translate(-0.22 + i * 0.11, (rnd(i, 3) - 0.5) * 0.24, 0.14 + (i % 2) * 0.012));
  return m;
}

/** What is left of a barrel: staves fallen outward, a hoop. */
export function staves(seed = 1): Mesh {
  const m = new Mesh();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 360 + rnd(seed, i) * 40;
    const d = 0.16 + rnd(seed, i + 9) * 0.22;
    const st = box(-0.045, -0.02, 0, 0.045, 0.02, 0.5, { side: i % 2 ? C.wood : C.woodDark, vary: 0.1 });
    m.add(st, mats(rotZ(a), translate(d, 0, 0.03), rotY(78 + rnd(seed, i + 20) * 10), rotZ(rnd(seed, i + 30) * 60)));
  }
  m.add(lathe([[0.24, 0.22, 0], [0.24, 0.22, 0.03]], 9, { side: C.iron }), mats(translate(0.1, -0.06, 0.02), rotX(8)));
  m.add(lathe([[0.2, 0], [0.2, 0.03]], 9, { side: C.woodDark, top: C.wood }), translate(-0.12, 0.1, 0));
  return m;
}

/** What is left of an urn: shards, and its foot. */
export function shards(seed = 1): Mesh {
  const m = new Mesh();
  const col = tone(C.clay, 0.9 + rnd(seed, 3) * 0.25);
  m.add(lathe([[0.1, 0], [0.19, 0.1], [0.15, 0.13]], 7, { side: col, vary: 0.1, top: C.gap }));
  for (let i = 0; i < 6; i++) {
    const a = rnd(seed, i) * 6.28;
    const d = 0.18 + rnd(seed, i + 7) * 0.26;
    const sh = slab([[0, 0], [0.11 + rnd(seed, i + 12) * 0.07, 0.02], [0.05, 0.13 + rnd(seed, i + 15) * 0.06]], 0.025, { side: tone(col, 0.85 + rnd(seed, i + 2) * 0.3) });
    m.add(sh, mats(translate(Math.cos(a) * d, Math.sin(a) * d, 0.02), rotZ(rnd(seed, i + 40) * 360), rotX(80)));
  }
  return m;
}

const RUNE: RGB = hex('#3ad8c8');

/**
 * The way home: an arch of dressed stone on a step, runes cut in its two jambs. `on`: the runes
 * are alight (the light in the arch itself is drawn by whoever makes it move: portalLight).
 * It stands in the x-z plane and is looked into along -y.
 */
export function portalArch(on: boolean): Mesh {
  const m = new Mesh();
  const col = C.dressed[1];
  m.add(stone(-1.12, -0.42, 0, 1.12, 0.5, 0.14, 0.05, { side: tone(col, 0.75), top: tone(col, 0.9) }));
  for (const sd of [-1, 1]) {
    m.add(stone(sd * 0.84 - 0.2, -0.24, 0.14, sd * 0.84 + 0.2, 0.24, 1.5, 0.04, { side: col, top: tone(col, 0.7) }));
    // the runes: three short strokes, one above another
    for (let i = 0; i < 3; i++) m.add(box(sd * 0.84 - 0.09 + (i % 2) * 0.05, 0.24, 0.42 + i * 0.32, sd * 0.84 + 0.05 + (i % 2) * 0.05, 0.262, 0.47 + i * 0.32, { side: on ? RUNE : tone(col, 0.45), glow: on ? 2.4 : 0 }));
  }
  // the arch: seven stones round a half circle
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 180;
    const a1 = ((i + 1) / n) * 180;
    const mid = ((a0 + a1) / 2) * (Math.PI / 180);
    const c = tone(C.dressed[i % 3], i === 3 ? 1.12 : 1);
    const vo = box(-0.2, -0.24, -0.21, 0.2, 0.24, 0.21, { side: c, vary: 0.06, top: tone(c, 0.75) });
    m.add(vo, mats(translate(Math.cos(mid) * 0.84, 0, 1.5 + Math.sin(mid) * 0.84), rotY(-(90 - (a0 + a1) / 2)), scale(i === 3 ? 1.12 : 1, 1, 1.02)));
  }
  // while it sleeps the arch is a blind one: dark stone fills it
  if (!on) m.add(box(-0.64, -0.06, 0.14, 0.64, 0.02, 2.2, { side: tone(C.gap, 1.6) }));
  return m;
}

/** The light in the open arch: a pale skin over it, to be drawn with `portalSwirl` turning before it. */
export function portalLight(): Mesh {
  const m = new Mesh();
  const pts: [number, number][] = [[-0.64, 0.14], [0.64, 0.14], [0.64, 1.5], [0.45, 1.95], [0, 2.3], [-0.45, 1.95], [-0.64, 1.5]];
  m.add(slab(pts, 0.03, { side: hex('#1a8f98'), glow: 1.5 }));
  return m;
}

/** Three arms of brighter light that turn in the arch (about the y axis through the origin: put it at the arch's middle). */
export function portalSwirl(): Mesh {
  const m = new Mesh();
  for (let k = 0; k < 3; k++) {
    const arm = new Mesh();
    for (let i = 0; i < 5; i++) {
      const r0 = 0.08 + i * 0.1;
      const r1 = r0 + 0.1;
      const a0 = (i * 26 * Math.PI) / 180;
      const a1 = ((i + 1) * 26 * Math.PI) / 180;
      const w0 = 0.05 * (1 - i / 6);
      const w1 = 0.05 * (1 - (i + 1) / 6);
      arm.sheet([[Math.cos(a0) * (r0 - w0), 0, Math.sin(a0) * (r0 - w0)], [Math.cos(a0) * (r0 + w0), 0, Math.sin(a0) * (r0 + w0)], [Math.cos(a1) * (r1 + w1), 0, Math.sin(a1) * (r1 + w1)], [Math.cos(a1) * (r1 - w1), 0, Math.sin(a1) * (r1 - w1)]], i < 2 ? C.sparkWhite : C.spark, C.spark, 3.2 - i * 0.4);
    }
    m.add(arm, rotY(k * 120));
  }
  m.add(ball(0.09, 0.03, 0.09, { side: C.sparkWhite, glow: 4 }));
  return m;
}
