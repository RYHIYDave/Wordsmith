// THE WARLOCK BROUGHT UP, THE MAN (art/warlock_up.ts, art/warlock_up_art.ts; the queue's finish-mage-and-warlock-eight-sides,
// step 4, 12 Nov 2026; docs/mockups/warlock_up2/README.md, "The man"). Behind WARLOCK_UP, off. Held here:
//   1. the switch is off; only art/warlock_art.ts takes the new files in, and only through the switch; off, the man is as the game
//      has him (his two sides, his stand at ten a second, the change's 48 pictures). (Every frame of him the same picture, by hash:
//      tests/cheap_heroes.test.ts, the game's own hashes of the Warlock.)
//   2. HIS MOVES ARE THE GAME'S OWN: at every thirtieth of a second of every move, his hips, feet, hands and head where the game has
//      them; only his knee joint raised (shin 1.3 times his thigh, standing straight), so only where his knees bend moves.
//   3. his lists from all eight sides in the game's shape, every list at thirty a second (his run sixty), his spells' blows where the
//      game's land; the change into the Living Shadow or the game's demon as its switch says, from his side, thirty a second.
//   4. a moment of every move from every side painted: crisp, the friend's cyan edge, nothing cut off; his boots made in the game's
//      boots' own place (the change tears them away as it tears his boots).
//   5. NO LEG THROUGH HIS COAT where it hangs (his rulebook's Heroes 6, clean bodies), in every move he stands in, from his bones.

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { WARLOCK_UP, WL_LAST, WL_SHIN_RATIO, WL_UP_BODY, wlMats } from '../src/art/warlock_up';
import { WL_FPS, WL_MOVES, paintWarlockUp } from '../src/art/warlock_up_art';
import type { WlKey } from '../src/art/warlock_up_art';
import { makeWarlockArt } from '../src/art/warlock_art';
import { LIVING_SHADOW } from '../src/art/shadow_art';
import { EIGHT_ORDER, isEight } from '../src/art/sides';
import { WU_RIM, WU_SPIN } from '../src/art/warrior_up';
import { solve, sub, dot } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { WARLOCK_SCULPT_BODY, warlockSculpt } from '../src/dev/sculpt_warlock';
import { STAND_LONG, RUN_ROUND, warlockPose } from '../src/dev/warlock_moves';
import type { WarlockMove } from '../src/dev/warlock_moves';
import { BOLT_HIT, CURSE_HIT } from '../src/dev/warlock_spells';
import { CHANGE_ALL } from '../src/dev/warlock_change';
import { SHADOW_CHANGE_ALL } from '../src/dev/shadow_change';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

const KEYS: WlKey[] = ['stand', 'run', 'bolt', 'curse', 'step', 'reel', 'lurch', 'fall', 'back'];
const with_ = <T>(on: boolean, f: () => T): T => {
  const was = WARLOCK_UP.on;
  WARLOCK_UP.on = on;
  try {
    return f();
  } finally {
    WARLOCK_UP.on = was;
  }
};
const dist = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// --- 1 ------------------------------------------------------------------------------------------------------------------------

test('1. the switch is off; only art/warlock_art.ts takes the new files in; off, the man is as the game has him', () => {
  assert.equal(WARLOCK_UP.on, false, 'WARLOCK_UP is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/warlock_up')) continue;
    if (/from ['"][^'"]*warlock_up(_art)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), 'art/warlock_art.ts', 'only the Warlock\'s art takes them in');
  const man = makeWarlockArt({ form: 'man', place: 'dungeon' });
  assert.ok(!isEight(man), 'two sides');
  assert.equal(man.front.idleFps, 10, 'his stand at ten a second');
  assert.equal(man.front.clips?.change?.frames.length, 48, 'the game\'s change, 48 pictures');
  // (and his sculptor dresses nothing: the game's boots and coat, on the game's bones)
  const ws = warlockSculpt('front');
  assert.ok(ws.sc.prims.some((p) => p.piece === 'skirt' && p.tag === 'skirt'), 'the game\'s coat');
  assert.ok(!ws.sc.prims.some((p) => p.tag === 'cuff'), 'the game\'s boots');
});

// --- 2 ------------------------------------------------------------------------------------------------------------------------

test('2. his moves the game\'s own: hips, feet, hands and head where the game has them at every frame; only his knee joint raised', () => {
  const G = WARLOCK_SCULPT_BODY;
  const U = WL_UP_BODY;
  assert.ok(Math.abs(U.thigh + U.shank - G.thigh - G.shank) < 1e-9, 'the whole leg as long');
  assert.ok(Math.abs((U.shank + U.ankle) / U.thigh - WL_SHIN_RATIO) < 1e-9, `standing straight his shin ${WL_SHIN_RATIO} times his thigh`);
  assert.ok((G.shank + G.ankle) / G.thigh < 1.2, 'the game\'s read short');
  const M = WL_MOVES();
  let most = 0;
  let knee = 0;
  for (const k of KEYS) {
    const m = M[k];
    const n = Math.round(m.long * 30);
    for (let i = 0; i <= n; i++) {
      const q = warlockPose(m.motion, i / 30);
      const a = solve(G, q);
      const b = solve(U, q);
      for (const j of ['pelvis', 'ankleL', 'ankleR', 'heelL', 'heelR', 'toeL', 'toeR', 'handL', 'handR', 'head', 'neck'] as const) most = Math.max(most, dist(a[j] as V3, b[j] as V3));
      knee = Math.max(knee, dist(a.kneeL, b.kneeL), dist(a.kneeR, b.kneeR));
    }
  }
  assert.ok(most < 1e-6, `everything but his knees where the game has it (${most.toExponential(1)} at the most)`);
  assert.ok(knee > 0.3 && knee < 3, `his knees move a little (${knee.toFixed(2)} at the most)`);
});

// --- 3 ------------------------------------------------------------------------------------------------------------------------

test('3. his lists from all eight sides, the game\'s shape, every list at thirty a second; the change as the switches say', () => {
  for (const shadow of [false, true]) {
    LIVING_SHADOW.on = shadow;
    try {
      with_(true, () => {
        const man = makeWarlockArt({ form: 'man', place: 'dungeon' });
        assert.ok(isEight(man), 'eight sides');
        for (const side of EIGHT_ORDER) {
          const set = (man as unknown as Record<string, import('../src/art/actor_types').AnimSet>)[side];
          const c = set.clips!;
          assert.equal(set.idleFps, WL_FPS.lists);
          assert.equal(set.idle.length, Math.round(STAND_LONG * 30), 'his stand, 198 pictures');
          assert.equal(set.walkFps, WL_FPS.run);
          assert.equal(set.walk.length, Math.round(RUN_ROUND * 60), 'his run');
          assert.ok((set.walkStride ?? 0) > 0, 'his feet grip the floor');
          assert.ok(Math.abs((c.attack!.hit ?? -1) - BOLT_HIT) < 1e-9 && Math.abs((c.heavy!.hit ?? -1) - CURSE_HIT) < 1e-9, 'his spells go when the game\'s go');
          for (const k of ['attack', 'heavy', 'land', 'reel', 'lurch', 'fall'] as const) assert.equal(c[k]!.fps, 30, `${k} at thirty a second`);
          assert.ok(c.leap && c.leap.frames.length === 10, 'the smoke step');
          const n = Math.round((shadow ? SHADOW_CHANGE_ALL : CHANGE_ALL) * 30) + 1;
          assert.equal(c.change?.frames.length, n, `the change into ${shadow ? 'the Living Shadow' : 'the game\'s demon'}, thirty a second`);
          assert.ok(!c.ready, 'no making ready in a dungeon');
        }
        const card = makeWarlockArt({ form: 'man', place: 'card' }) as unknown as Record<string, import('../src/art/actor_types').AnimSet>;
        assert.ok(card.front.clips?.ready && !card.toward.clips?.ready, 'on his card, his arm blazing up from in front');
        assert.ok(!card.front.clips?.change, 'no change on his card');
        const share = new Map<string, unknown>();
        const blaze = makeWarlockArt({ form: 'man', place: 'dungeon', blaze: true }, share) as unknown as Record<string, import('../src/art/actor_types').AnimSet>;
        const plain = makeWarlockArt({ form: 'man', place: 'dungeon' }, share) as unknown as Record<string, import('../src/art/actor_types').AnimSet>;
        assert.ok(blaze.side.idle !== plain.side.idle && blaze.side.clips!.attack!.frames === plain.side.clips!.attack!.frames, 'blazing: his stand his own, his spells the same list');
      });
    } finally {
      LIVING_SHADOW.on = false;
    }
  }
});

// --- 4 ------------------------------------------------------------------------------------------------------------------------

test('4. a moment of every move from every side: crisp, the friend\'s cyan edge, nothing cut off; his boots in the game\'s boots\' place', () => {
  const rim = rgba(WU_RIM).slice(0, 3).join(',');
  const faults: string[] = [];
  const M = WL_MOVES();
  for (const k of KEYS) {
    const m = M[k];
    const t = m.long * 0.45;
    for (const side of EIGHT_ORDER) {
      const d = paintWarlockUp(m, t, side);
      const { w, h } = d.px;
      let soft = 0;
      let edge = 0;
      let rims = 0;
      let solid = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = d.px.d[i + 3];
        if (!a) continue;
        solid++;
        if (a !== 255 && a !== 110) soft++;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge++;
        if (`${d.px.d[i]},${d.px.d[i + 1]},${d.px.d[i + 2]}` === rim) rims++;
      }
      if (solid < 800) faults.push(`${k} ${side}: ${solid} pixels`);
      if (edge) faults.push(`${k} ${side}: cut off at the canvas' edge (${edge})`);
      if (soft > solid * 0.02) faults.push(`${k} ${side}: ${soft} soft pixels`);
      if (rims < 60) faults.push(`${k} ${side}: ${rims} pixels of his cyan edge`);
      void WU_SPIN;
    }
  }
  assert.equal(faults.join('; '), '', 'every picture crisp, edged, whole');
  // (his boots: the game's boots' place among his materials, its leather made over)
  const game = with_(false, () => wlMats(warlockSculpt('front').sc));
  const up = with_(true, () => {
    const ws = warlockSculpt('front');
    return { mats: wlMats(ws.sc), cuffs: ws.sc.prims.filter((p) => p.tag === 'cuff' && p.mat === wlMats(ws.sc).boots).length, n: ws.sc.mats.length };
  });
  const gameN = with_(false, () => warlockSculpt('front').sc.mats.length);
  assert.equal(up.mats.boots, game.boots, 'his boots where the game\'s are among his materials');
  assert.equal(up.n, gameN, 'no material more');
  assert.equal(up.cuffs, 2, 'a turned cuff on each boot');
});

// --- 5 ------------------------------------------------------------------------------------------------------------------------

test('5. no leg through his coat where it hangs, in every move he stands in, at every sixth of a second', () => {
  const M = WL_MOVES();
  const faults: string[] = [];
  let looked = 0;
  for (const k of ['stand', 'bolt', 'curse', 'step', 'reel', 'lurch', 'back'] as WlKey[]) {
    const m: WarlockMove = M[k];
    for (let t = 0; t <= m.long + 1e-9; t += 1 / 6) {
      paintWarlockUp(m, t, 'front');
      const coat = WL_LAST.coat;
      if (!coat) continue;
      const s = solve(WL_UP_BODY, warlockPose(m.motion, t));
      const [lH, lK, lA] = WL_UP_BODY.legR;
      const top = coat.centre[0][2];
      const hem = coat.centre[coat.centre.length - 1][2];
      for (const [hip, kn, an] of [[s.hipL, s.kneeL, s.ankleL], [s.hipR, s.kneeR, s.ankleR]] as const) {
        for (let i = 1; i <= 16; i++) {
          const u = i / 16;
          const p: V3 = u <= 0.5 ? lerp(hip, kn, u * 2) : lerp(kn, an, u * 2 - 1);
          const r = u <= 0.5 ? lH + (lK - lH) * u * 2 : lK + (lA - lK) * (u * 2 - 1);
          if (p[2] > top - 1 || p[2] < hem + 0.5) continue;
          // (its row, and the cloth's middle there; the column the point is out toward)
          const kz = (top - p[2]) / Math.max(1e-6, top - hem);
          const rows = coat.rings.length;
          let ri = 0;
          for (let j = 0; j < rows - 1; j++) if ((top - coat.centre[j + 1][2]) / (top - hem) <= kz) ri = j + 1;
          ri = Math.min(rows - 2, ri);
          // (the cloth's middle at the point's height, between its two rows)
          const z0 = coat.centre[ri][2];
          const z1 = coat.centre[ri + 1][2];
          const f = Math.max(0, Math.min(1, (z0 - p[2]) / Math.max(1e-6, z0 - z1)));
          const c = lerp(coat.centre[ri], coat.centre[ri + 1], f);
          const rel: V3 = [p[0] - c[0], p[1] - c[1], 0];
          let best = 0;
          let bd = -Infinity;
          coat.out.forEach((o, ci) => {
            const v = dot(rel, o);
            if (v > bd) {
              bd = v;
              best = ci;
            }
          });
          if (!coat.hangs(ri, best) || !coat.hangs(ri + 1, best)) continue;
          looked++;
          const ring = lerp(coat.rings[ri][best], coat.rings[ri + 1][best], f);
          const cr = Math.hypot(ring[0] - c[0], ring[1] - c[1]);
          const reach = Math.hypot(rel[0], rel[1]) + r * 0.6;
          if (reach > cr + 0.6) faults.push(`${k} ${t.toFixed(2)}: ${(reach - cr).toFixed(1)} through${process.env.WL_WHY ? ` (u ${u} z ${p[2].toFixed(1)} row ${ri} f ${f.toFixed(2)} col ${best} top ${top.toFixed(1)} leg ${hip === s.hipL ? "L" : "R"})` : ""}`);
        }
      }
    }
  }
  assert.ok(looked > 300, `points of his legs looked at under the cloth (${looked})`);
  assert.equal(faults.slice(0, 12).join('; '), '', `no leg through his coat (${faults.length})`);
});

function lerp(a: V3, b: V3, k: number): V3 {
  const d = sub(b, a);
  return [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
}
