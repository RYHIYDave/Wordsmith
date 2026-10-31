// HER CONTRAPTION'S TWO NEW KINDS (dev/sculpt_contraption.ts ammo 'bombs' and 'energy'; their throws and what they throw
// off, dev/contraption_shots.ts): the little bombs (its solid shot) and the energy bolts, his “Energy bolts, and let’s make the
// contraption throw little bombs.” (31 Oct). As the Contraption is checked (tests/contraption_tap.test.ts) and as the Golem's
// charged shots are (tests/golem_charge.test.ts): every frame of each throw, from in front and behind, turned eight ways:
// crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off; nothing sunk into the floor and standing on it;
// its feet gripping where they stand. Each kind thrown down, springing open, kicked and broken, the same. Slick through the
// wind-up and wind-down but for the strike (a flash: Movement 9); back as it stood when done. What they throw off: every
// frame crisp, nothing pink or gold, nothing cut off, a great flash of the friend's cyan as it throws, all gone when done.
// Their numbers. Every picture of the Contraption as it was, to the pixel. And nothing of the game draws any of it.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import { createHash } from 'node:crypto';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { UNITS_PER_TILE } from '../src/art/moves3';
import { LAST } from '../src/dev/sculpt';
import type { Sculpt } from '../src/dev/sculpt';
import { CONTRAPTION_BUILDS, CONTRAPTION_MOUTH, CONTRAPTION_POSE, CONTRAPTION_SHOT_AT, sculptContraptionBuild } from '../src/dev/sculpt_contraption';
import type { ContraptionAmmo } from '../src/dev/sculpt_contraption';
import { CDOWN, contraptionDown } from '../src/dev/contraption_fx';
import { BOLT_FX, BOMB_FX, CBOLT, CBOLT_STRIKE, CBOMB, CBOMB_STRIKE, bombAt, bombFx, bombFxLong, bombShot, boltFlight, boltFx, boltFxLong, boltShot, layShotAir, layShotFloor, shotLayers } from '../src/dev/contraption_shots';
import type { ShotAt, ShotFrame } from '../src/dev/contraption_shots';
import { Px } from '../src/engine/px';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { deepEqual(a: unknown, b: unknown, m?: string): void; ok(v: unknown, m?: string): void } = nodeAssert;
const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];
const RESET = { open: 1, kick: 0, lit: 1, broke: 0 };
const KINDS = [
  { ammo: 'bombs' as const, name: 'the bomb Contraption', C: CBOMB, at: bombShot, strike: CBOMB_STRIKE },
  { ammo: 'energy' as const, name: 'the energy Contraption', C: CBOLT, at: boltShot, strike: CBOLT_STRIKE },
];
const drawAt = (ammo: ContraptionAmmo, q: ShotFrame, view: 'front' | 'back', turn: number) => {
  Object.assign(CONTRAPTION_POSE, q.pose);
  try {
    return sculptContraptionBuild(view, 'tripod', turn, ammo, q.shot);
  } finally {
    Object.assign(CONTRAPTION_POSE, RESET);
  }
};

for (const K of KINDS) {
  test(`${K.name}: every frame of its throw crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on the floor; its feet gripping: from in front and behind, turned eight ways`, () => {
    const found: string[] = [];
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        let feet0: string | null = null;
        for (let f = 0; f <= K.C.end; f++) {
          const d = drawAt(K.ammo, K.at(f), view, turn);
          const at = `${view}, turned ${turn}, frame ${f}`;
          for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
          const sc = LAST.sc as Sculpt;
          for (const x of bodyFindings(sc, false)) found.push(`${at}: ${x}`);
          // (its claws where they bit the floor: the same every frame)
          const feet = sc.prims.filter((p) => p.tag === 'toe' && p.k === 'cone').map((p) => (p as unknown as { b: V3 }).b.map((v) => v.toFixed(2)).join(',')).join(' ');
          if (feet0 === null) feet0 = feet;
          else if (feet !== feet0) found.push(`${at}: its feet moved`);
        }
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${K.name}: thrown down, springing open, set up, kicked, and broken: every picture crisp, the friend’s edge, no pixel alone, nothing pink, nothing cut off; nothing sunk, on the floor: from in front and behind, turned eight ways`, () => {
    const found: string[] = [];
    const poses: { open: number; kick: number; lit: number; broke: number }[] = [];
    for (let o = 0; o <= 1.0001; o += 0.1) poses.push({ open: Math.min(1, o), kick: 0, lit: o >= 1 ? 1 : 0, broke: 0 });
    poses.push({ open: 1, kick: 1, lit: 1, broke: 0 }, { open: 1, kick: 0.4, lit: 1, broke: 0 });
    for (let f = 0; f <= CDOWN.end; f += 2) poses.push(contraptionDown(f));
    for (const view of ['front', 'back'] as const) {
      for (const turn of TURNS) {
        for (const p of poses) {
          Object.assign(CONTRAPTION_POSE, p);
          try {
            const d = sculptContraptionBuild(view, 'tripod', turn, K.ammo);
            const at = `${view}, turned ${turn}, open ${p.open.toFixed(1)}, kicked ${p.kick}, broken ${p.broke.toFixed(2)}`;
            for (const x of pictureFindings(d.px)) found.push(`${at}: ${x}`);
            for (const x of bodyFindings(LAST.sc as Sculpt, false)) found.push(`${at}: ${x}`);
          } finally {
            Object.assign(CONTRAPTION_POSE, RESET);
          }
        }
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${K.name}: slick through its wind-up and wind-down but for the strike; its strike a flash of one or two frames; back as it stood when done`, () => {
    const found: string[] = [];
    const mouth: V3[] = [];
    const body: V3[] = [];
    for (let f = 0; f <= K.C.end; f++) {
      drawAt(K.ammo, K.at(f), 'front', 0);
      const sc = LAST.sc as Sculpt;
      mouth.push([...CONTRAPTION_MOUTH.p] as V3);
      const h = sc.prims.find((p) => p.tag === 'housing' && p.k === 'ell') as unknown as { c: V3 };
      body.push([...h.c] as V3);
    }
    const flash = (i: number): boolean => K.strike.some(([a, b]) => i >= a - 1 && i <= b + 1);
    for (const [name, pts] of [['its mouth', mouth], ['its body', body]] as const) {
      for (const view of ['front', 'back'] as const) {
        const xy = pts.map((p) => project(p, view));
        const sp = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
        for (let i = 1; i < sp.length - 1; i++) {
          if (flash(i)) continue;
          if (sp[i] > 3 && sp[i] > 2.2 * Math.max(sp[i - 1], sp[i + 1])) found.push(`${name} leaps ${sp[i].toFixed(1)} at step ${i} (${view})`);
        }
        if (sp[sp.length - 1] > 1.5) found.push(`${name} stops dead from speed (${view})`);
      }
    }
    // (the strike: it springs and throws within its two frames)
    const [a, b] = K.strike[0];
    if (b - a > 1) found.push('its strike longer than two frames');
    const jump = Math.hypot(...([0, 1, 2].map((k) => body[a][k] - body[a - 1][k]) as [number, number, number]));
    if (jump < 1.5) found.push(`its body barely moves as it throws (${jump.toFixed(2)})`);
    // (as it stood, at both ends: the game plays its throws back to back)
    const pic = (f: number): string => createHash('sha256').update(drawAt(K.ammo, K.at(f), 'front', 315).px.d).digest('hex');
    const rest = createHash('sha256').update(sculptContraptionBuild('front', 'tripod', 315, K.ammo).px.d).digest('hex');
    if (pic(0) !== rest) found.push('its first frame not as it stands');
    if (pic(K.C.end) !== rest) found.push('its last frame not as it stands');
    assert.deepEqual(found, []);
  });

  test(`${K.name}: what it throws off, every frame crisp, nothing pink or gold, nothing cut off, a great flash of the friend’s cyan as it throws, and all gone when done: from in front and behind`, () => {
    const found: string[] = [];
    for (const turn of [315, 45]) {
      const { at, W, H } = sceneOf(K.ammo, turn);
      const fire = K.C.fire;
      const last = fire + (K.ammo === 'bombs' ? bombFxLong() : boltFxLong(at(fire)));
      for (let f = 0; f <= last + 2; f++) {
        const ly = shotLayers();
        if (K.ammo === 'bombs') bombFx(ly, at(Math.min(f, K.C.end)), f, f / 30);
        else boltFx(ly, at(Math.min(f, K.C.end)), f, f / 30);
        const pics = [layShotFloor(W, H, ly), layShotAir(W, H, ly)];
        const lit = pics.some((p) => painted(p) > 0);
        const where = `turned ${turn}, frame ${f}`;
        if (f > last) {
          if (lit) found.push(`${where}: something still there after it is done`);
          continue;
        }
        for (const p of pics) {
          if (!painted(p)) continue;
          for (const x of pictureFindings(p)) found.push(`${where}: ${x}`);
          const box = boxOf(p);
          if (box[0] <= 3 || box[1] <= 3 || box[2] >= W - 4 || box[3] >= H - 4) found.push(`${where}: reaches the edge of its scene (cut off)`);
          const g = goldOf(p);
          if (g) found.push(`${where}: ${g} pixels of the enemy's gold`);
        }
        if (f === fire && cyanOf(pics[1]) < 40) found.push(`${where}: no great flash of the friend's cyan as it throws`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });
}

test('their numbers: the bomb flies BOMB_FX.flight frames, comes down a little short, hops on and goes off where it was thrown, BOMB_FX.boom frames after its throw, its blast as wide as BOMB_FX.blast tiles; the bolt flies at BOLT_FX.speed tiles a second to what it is aimed at', () => {
  const found: string[] = [];
  const { at } = sceneOf('bombs', 315);
  const a = at(CBOMB.fire);
  const first = bombAt(a, BOMB_FX.flight);
  if (!first || !first.down) found.push('the bomb not down at the end of its flight');
  const sat = bombAt(a, BOMB_FX.boom - 1);
  if (!sat || Math.hypot(sat.p[0] - a.aim[0], sat.p[1] - a.aim[1]) > 0.01) found.push('the bomb not where it was thrown as it goes off');
  if (bombAt(a, BOMB_FX.boom)) found.push('the bomb still there as it goes off');
  if (BOMB_FX.blast < 1.5) found.push('the blast small');
  // (the blast's ring at its widest: as far across the picture as BOMB_FX.blast tiles round where it goes off)
  const wide = (k: number): number => {
    const ly = shotLayers();
    bombFx(ly, a, CBOMB.fire + BOMB_FX.boom + k, 0);
    const p = new Px(760, 560);
    ly.l.lay(p, ['#000001', '#000002', '#000003', '#000004']);
    const b = boxOf(p);
    return b[2] - b[0];
  };
  const R = BOMB_FX.blast * UNITS_PER_TILE;
  const xs = Array.from({ length: 72 }, (_, i) => a.S([a.aim[0] + Math.cos((i / 36) * Math.PI) * R, a.aim[1] + Math.sin((i / 36) * Math.PI) * R, 0])[0]);
  const span = Math.max(...xs) - Math.min(...xs);
  const ring = Math.max(wide(3), wide(4));
  if (Math.abs(ring - span) > 8) found.push(`the blast ${ring} pixels across, its ${BOMB_FX.blast} tiles ${Math.round(span)}`);
  // (the bolt: its flight frames by its speed; the frame before it hits, it is most of the way there)
  const b = sceneOf('energy', 315).at(CBOLT.fire);
  const tiles = Math.hypot(b.aim[0] - b.fired[0], b.aim[1] - b.fired[1]) / UNITS_PER_TILE;
  if (boltFlight(b) !== Math.max(1, Math.round((tiles / BOLT_FX.speed) * 30))) found.push('the bolt’s flight not by its speed');
  if (tiles > BOLT_FX.reach) found.push('the bolt aimed past its reach');
  assert.deepEqual(found, []);
});

test('every picture of the Contraption as it was before its new kinds, to the pixel: the tripod shut, opening, set up, kicked and broken, and all the others, turned eight ways, from in front and behind', () => {
  const h = createHash('sha256');
  const poses: { open: number; kick: number; lit: number; broke: number }[] = [];
  for (let o = 0; o <= 1.0001; o += 0.05) poses.push({ open: o, kick: 0, lit: o >= 1 ? 1 : 0, broke: 0 });
  for (const k of [0.2, 0.5, 1]) poses.push({ open: 1, kick: k, lit: 1, broke: 0 });
  for (let f = 0; f <= CDOWN.end; f += 2) poses.push(contraptionDown(f));
  try {
    for (const view of ['front', 'back'] as const) for (const turn of TURNS) {
      for (const p of poses) {
        Object.assign(CONTRAPTION_POSE, p);
        h.update(sculptContraptionBuild(view, 'tripod', turn).px.d);
      }
      Object.assign(CONTRAPTION_POSE, RESET);
      for (const b of [...CONTRAPTION_BUILDS.map((x) => x.id), 'drum' as const]) h.update(sculptContraptionBuild(view, b, turn).px.d);
    }
  } finally {
    Object.assign(CONTRAPTION_POSE, RESET);
  }
  // (992 pictures, hashed so at 5e8be5a, before its new kinds were added)
  assert.ok(h.digest('hex') === '11114069cbf2cb073a99aec525d5ea803a16010936e039c51173ea46795879a2');
});

test('nothing of the game draws the new kinds: no file of the game (src/, but for its mock-ups in src/dev/) imports dev/contraption_shots.ts or asks the Contraption for anything but its vials', () => {
  const found: string[] = [];
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((n: string) => {
    const p = `${dir}/${n}`;
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });
  for (const file of walk('src')) {
    if (file.startsWith('src/dev/')) continue;
    const text = readFileSync(file, 'utf8');
    if (/contraption_shots|bombShot|boltShot|CBOMB|CBOLT|CONTRAPTION_SHOT_AT|NO_SHOT|ContraptionAmmo|CONTRAPTION_AMMO/.test(text)) found.push(file);
    // (every call of the Contraption's sculpture in the game: three things asked, no more)
    let i = text.indexOf('sculptContraptionBuild(');
    while (i >= 0) {
      let depth = 0;
      let args = 1;
      for (let j = i + 'sculptContraptionBuild('.length - 1; j < text.length; j++) {
        const c = text[j];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
          depth--;
          if (depth === 0) break;
        } else if (c === ',' && depth === 1) args++;
      }
      if (args > 3) found.push(`${file}: the Contraption asked for more than its vials`);
      i = text.indexOf('sculptContraptionBuild(', i + 1);
    }
  }
  assert.deepEqual(found, []);
});

// ---- the scene its effects are checked in: the Contraption drawn as the game would (turned 315 from in front, 45 from
// behind), what it throws at five tiles out along its aim (a bomb) or six (a bolt, at a chest), all on a scene with room round it

function sceneOf(ammo: ContraptionAmmo, turn: number): { at: (f: number) => ShotAt; W: number; H: number } {
  const T = UNITS_PER_TILE;
  const move = ammo === 'bombs' ? bombShot : boltShot;
  const C = ammo === 'bombs' ? CBOMB : CBOLT;
  const d0 = drawAt(ammo, move(0), 'front', turn);
  const rot = (v: V3): V3 => {
    const a = (turn * Math.PI) / 180;
    return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
  };
  const way = rot(CONTRAPTION_MOUTH.way);
  const hl = Math.hypot(way[0], way[1]);
  const wh: V3 = [way[0] / hl, way[1] / hl, 0];
  const aim: V3 = ammo === 'bombs' ? [wh[0] * 5 * T, wh[1] * 5 * T, 0] : [wh[0] * 6 * T, wh[1] * 6 * T, 24];
  const W = 760;
  const H = 560;
  const raw = (p: V3): [number, number] => {
    const s = d0.st.at(p);
    return [s[0], s[1]];
  };
  const pts: [number, number][] = [raw([0, 0, 0]), raw([0, 0, 60])];
  for (let i = 0; i < 24; i++) pts.push(raw([aim[0] + Math.cos((i / 12) * Math.PI) * 2.6 * T, aim[1] + Math.sin((i / 12) * Math.PI) * 2.6 * T, 0]), raw([aim[0], aim[1], 140]));
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const y1 = Math.max(...pts.map((p) => p[1]));
  const ox = (W - (x1 - x0)) / 2 - x0;
  const oy = (H - (y1 - y0)) / 2 - y0;
  const S = (p: V3): [number, number] => {
    const s = raw(p);
    return [s[0] + ox, s[1] + oy];
  };
  let fired: V3 | null = null;
  const at = (f: number): ShotAt => {
    drawAt(ammo, move(f), 'front', turn);
    const mouth = rot(CONTRAPTION_MOUTH.p);
    if (f === C.fire) fired = mouth;
    return {
      S,
      mouth,
      way: rot(CONTRAPTION_MOUTH.way),
      fuse: CONTRAPTION_SHOT_AT.fuse ? rot(CONTRAPTION_SHOT_AT.fuse) : null,
      coil: CONTRAPTION_SHOT_AT.coil ? [rot(CONTRAPTION_SHOT_AT.coil[0]), rot(CONTRAPTION_SHOT_AT.coil[1])] : null,
      fired: fired ?? mouth,
      aim,
    };
  };
  at(C.fire);
  return { at, W, H };
}
function painted(p: Px): number {
  let n = 0;
  for (let i = 3; i < p.d.length; i += 4) if (p.d[i]) n++;
  return n;
}
function boxOf(p: Px): [number, number, number, number] {
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}
function hsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255;
  const d = mx - mn;
  let h = 0;
  if (d) h = mx === r / 255 ? ((g - b) / 255 / d) % 6 : mx === g / 255 ? (b - r) / 255 / d + 2 : (r - g) / 255 / d + 4;
  return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx];
}
function goldOf(p: Px): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (h >= 30 && h <= 62 && s > 0.5 && v > 0.6) n++;
  }
  return n;
}
function cyanOf(p: Px): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    const [h, s, v] = hsv(p.d[i], p.d[i + 1], p.d[i + 2]);
    if (h >= 170 && h <= 200 && s > 0.3 && v > 0.6) n++;
  }
  return n;
}
