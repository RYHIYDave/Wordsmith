// THE MAGE BROUGHT UP TO THE BRAWLER'S LEVEL (src/art/mage_up.ts, _moves.ts, _art.ts; the art chat's helper, 7 Nov 2026, her
// look and one still; the whole of her by the Mage chat, 11 Nov 2026; docs/mockups/mage_up/README.md). BEHIND A SWITCH THAT IS
// OFF, MAGE_UP. Held here:
//   1. the switch is off; of the game only art/heroes3.ts imports the new files, and reaches them only through the switch;
//      with it off, EVERY FRAME THE GAME PAINTS OF HER IS THE SAME (each list's first, middle and last frame against the hashes
//      made from the game's Mage as she is on main at 9d3501b, 25.3.3: tests/mage_up.hashes.json; MAGE_UP_ALL=1 for every frame);
//   2. HER MOVES ARE THE GAME'S OWN, NOTHING RE-POSED (the rule of 7 Nov): each move its motion, its rest, its length, the moment
//      its spell goes; only her bones differ, and of them only where her knee is (her shin 1.3 times her thigh standing; the leg
//      as long): her hips, feet, hands, staff and head where the game has them at every moment of every move;
//   3. HER LISTS, with the switch on, in the game's shape: eight sides; the same lists; standing and her habits at 30 a second
//      (they were at 10 and 20), her gripping run at 60 as it was; every cast, struck and her fall as long as the game's, the
//      Wave and the Orb going at the game's own moments;
//   4. every picture looked at, from every side: crisp, the friend's cyan edge, nothing of the enemy's rim, nothing cut off, both
//      braids fixed, her crystal's charge handed back, every light of hers the friend's cyan;
//   5. CLEAN BODIES: in her runs her lifted knee is under her robe, never through it;
//   6. HER FACE at the game's size: two dark eyes on her lit face from in front, toward you and from down and to the left; one
//      side-on;
//   7. the streak of light her swung crystal leaves is there in the Wave, as the game's Mage has it.
//   run: tsx --test tests/mage_up.test.ts          MAGE_UP_ALL=1 tsx --test tests/mage_up.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
// @ts-ignore
import * as nodePath from 'node:path';

import { MAGE_UP, MU_SKIN } from '../src/art/mage_up';
import { SWAP_MOVES } from '../src/game/talents';
import { makeMageUpArt, paintMuMove } from '../src/art/mage_up_art';
import { MU_BODY, MU_KEYS, MU_KNEE_UP, MU_MOVES, MU_SHIN_RATIO } from '../src/art/mage_up_moves';
import { WU_RIM, WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { MAGE_BODY, MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import type { AnimSet, Clip } from '../src/art/actor_types';
import { isEight } from '../src/art/sides';
import { CYAN, INK, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { bonesAt, solve } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { hashSprite } from '../tools/cheap_heroes';
import { mageLists } from '../tools/mage_up_measure';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
declare const process: { env: Record<string, string | undefined> };
paintWithoutCanvas();

const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
/** The moments of her stance the pictures are looked at in (her breathing and the crystal's two surges among them). */
const LOOKED = [0, 0.6, 1.2, 2.1];

// --- 1. the switch, and the game's Mage unchanged while it is off --------------------------------------------------------------

test('1. the switch is ON (live since 25.3.4, at his “Yes, hand her to main (Recommended)”, 11 Nov 2026); of the game only art/heroes3.ts imports the new files, through the switch', () => {
  assert.equal(MAGE_UP.on, true, 'MAGE_UP is on');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('art/mage_up')) continue;
    if (/from ['"][^'"]*mage_up(_moves|_art)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  // (and floor 18's reflections of her, since 25.3.12; and her moves to swap, art/swap_moves_art.ts, sculpted on her body)
  assert.equal(users.join(' '), 'art/heroes3.ts art/reflections_up.ts art/swap_moves_art.ts', 'what imports them');
  const h3 = fs.readFileSync('src/art/heroes3.ts', 'utf8');
  assert.ok(/if \(cls === 'mage' && MAGE_UP\.on\)/.test(h3), 'heroes3 reaches them only through the switch');
  assert.equal((h3.match(/makeMageUpArt\(/g) ?? []).length, 1, 'and only there');
});

test('1. with the switch off, every frame the game paints of the Mage is the very same picture (the hashes made from her as she is)', () => {
  const pinned = JSON.parse(fs.readFileSync('tests/mage_up.hashes.json', 'utf8')) as { lists: Record<string, string[]> };
  // (the switch is on in the game since 25.3.4: off around this, as tests/warrior_up.test.ts does for him)
  const was = MAGE_UP.on;
  MAGE_UP.on = false;
  try {
    const lists = mageLists();
    assert.deepEqual(lists.map((l) => l.name).sort(), Object.keys(pinned.lists).sort(), 'the same lists');
    const all = !!process.env.MAGE_UP_ALL;
    let n = 0;
    for (const l of lists) {
      const want = pinned.lists[l.name];
      assert.equal(l.frames.length, want.length, `${l.name}: as many frames`);
      const picks = all ? want.map((_, i) => i) : [...new Set([0, Math.floor(want.length / 2), want.length - 1])];
      for (const i of picks) {
        assert.equal(hashSprite(l.frames[i]), want[i], `${l.name}[${i}]: the very same picture`);
        n++;
      }
    }
    assert.ok(n > 250, `${n} frames held to their hashes`);
  } finally {
    MAGE_UP.on = was;
  }
});

// --- 2. her moves the game's own; her bones ---------------------------------------------------------------------------------------

test('2. her moves are the game\'s own, nothing re-posed: only her knee joint is raised, her hips, feet, hands, staff and head where the game has them', () => {
  // (her bones: the game's, but for where the knee is; the leg as long)
  for (const [k, v] of Object.entries(MAGE_BODY)) {
    if (k === 'thigh' || k === 'shank') continue;
    assert.deepEqual((MU_BODY as unknown as Record<string, unknown>)[k], v, `her ${k} the game's`);
  }
  assert.ok(Math.abs(MU_BODY.thigh + MU_BODY.shank - (MAGE_BODY.thigh + MAGE_BODY.shank)) < 1e-9, 'her leg as long as it was');
  assert.ok(Math.abs((MU_BODY.shank + MU_BODY.ankle) / MU_BODY.thigh - MU_SHIN_RATIO) < 1e-9, 'her shin 1.3 times her thigh, standing');
  assert.ok(MU_KNEE_UP > 0.6 && MU_KNEE_UP < 1, `her knee raised ${MU_KNEE_UP.toFixed(2)} of a unit: under half a game pixel`);
  // (her moves: the very motions, rests and moments of the game's)
  for (const k of MU_KEYS) {
    const mine = MU_MOVES[k];
    const game = MOVES3[k];
    assert.equal(mine.motion, game.motion, `${k}: the game's own motion`);
    assert.equal(mine.rest, game.rest, `${k}: the game's own stance`);
    assert.equal(mine.build, MU_BODY, `${k}: on her bones`);
    for (const f of ['name', 'held', 'stride', 'tail', 'poise', 'ready', 'at'] as const) assert.equal((mine as unknown as Record<string, unknown>)[f], (game as unknown as Record<string, unknown>)[f], `${k}: its ${f}`);
  }
  // (and where every part of her is at every sixtieth of a second of every move: as the game's but for her knees, and what
  // follows her bones by a hair, a hand that rests on a leg)
  let most = 0;
  let knee = 0;
  for (const k of MU_KEYS) {
    const m = MOVES3[k];
    for (let t = 0; t <= endOf(m) + 1e-9; t += 1 / 60) {
      const q = bonesAt(m.motion.keys, m.rest, t);
      const a = solve(MAGE_BODY, q) as unknown as Record<string, unknown>;
      const b = solve(MU_BODY, q) as unknown as Record<string, unknown>;
      for (const f of Object.keys(a)) {
        const va = a[f] as number[];
        const vb = b[f] as number[];
        if (!Array.isArray(va) || va.length !== 3 || typeof va[0] !== 'number') continue;
        const d = Math.hypot(va[0] - vb[0], va[1] - vb[1], va[2] - vb[2]);
        if (f === 'kneeL' || f === 'kneeR') knee = Math.max(knee, d);
        else {
          most = Math.max(most, d);
          if (['pelvis', 'hipL', 'hipR', 'ankleL', 'ankleR', 'heelL', 'heelR', 'toeL', 'toeR', 'head', 'neck', 'point', 'shoulderL', 'shoulderR'].includes(f)) assert.ok(d < 1e-6, `${k} ${t.toFixed(3)}: her ${f} moved ${d}`);
        }
      }
    }
  }
  assert.ok(most < 0.25, `nothing but her knees moves more than a quarter of a unit (${most.toFixed(3)})`);
  assert.ok(knee > 0.5 && knee < 2.5, `her knees by ${knee.toFixed(2)} at most`);
});

// --- 3. her lists in the game's shape ----------------------------------------------------------------------------------------------

test('3. her lists with the switch on: eight sides, the game\'s own lists, standing and her habits at 30 a second, her casts as long and going at the same moments', () => {
  const old = makeHeroArt3();
  for (const place of ['dungeon', 'town', 'card'] as const) {
    // (the game's Mage as she was: her switch, on in the game since 25.3.4, off for the asking)
    const on = MAGE_UP.on;
    MAGE_UP.on = false;
    let was: ReturnType<typeof old.of>;
    try {
      was = old.of('mage', lookOfPlace(place));
    } finally {
      MAGE_UP.on = on;
    }
    assert.ok(!isEight(was), 'the game\'s Mage has two sides');
    const now = makeMageUpArt(place);
    assert.ok(isEight(now), `${place}: eight sides`);
    for (const side of WU_SIDES) {
      const a: AnimSet = side === 'back' || side === 'backL' || side === 'away' ? was.back : was.front;
      const b: AnimSet = now[side];
      const tag = `${place} ${side}`;
      // (standing: thirty a second where it was ten; her gripping run as it was)
      assert.equal(b.idleFps, 30, `${tag}: standing at 30`);
      assert.equal(a.idleFps, 10, `${tag}: it was at 10`);
      assert.equal(b.idle.length, a.idle.length * 3, `${tag}: three pictures of her standing for each one`);
      assert.equal(b.walkFps, a.walkFps, `${tag}: her run's pictures a second`);
      assert.equal(b.walk.length, a.walk.length, `${tag}: her run as many pictures`);
      assert.equal(b.walkStride, a.walkStride, `${tag}: her stride`);
      assert.equal(b.startAt, a.startAt, `${tag}: where her run takes up`);
      assert.equal(b.stops?.length, a.stops?.length, `${tag}: her stops`);
      assert.equal(b.start?.frames.length, a.start?.frames.length, `${tag}: setting off`);
      assert.equal(b.walkWays, undefined, `${tag}: no run the other ways, as the game's`);
      const ca = a.clips as Record<string, Clip | undefined>;
      const cb = b.clips as Record<string, Clip | undefined>;
      const front = side === 'front';
      // (the game's own lists: what she does when left standing only from in front, as the game paints it)
      const want = Object.keys(ca).filter((k) => front || !['idleA', 'idleB', 'ready'].includes(k)).sort();
      // (and, with the moves to swap on, her own moves for them, Ball's and Spear's: art/swap_moves_art.ts)
      assert.deepEqual(Object.keys(cb).filter((k) => !(SWAP_MOVES.on && k === 'moves')).sort(), want, `${tag}: the same lists`);
      if (SWAP_MOVES.on) assert.deepEqual(Object.keys(cb.moves ?? {}).sort(), ['ball', 'spear'], `${tag}: Ball's and Spear's own`);
      for (const k of want) {
        const x = ca[k] as Clip;
        const y = cb[k] as Clip;
        assert.equal(y.hit, x.hit, `${tag} ${k}: the moment it goes`);
        assert.equal(y.loop, x.loop, `${tag} ${k}: where it goes round from`);
        assert.equal(y.tail, x.tail, `${tag} ${k}: its tail`);
        assert.equal(y.fps, 30, `${tag} ${k}: at 30`);
        if (k === 'idleA' || k === 'idleB') {
          // (her habits: thirty a second where they were twenty, as long)
          assert.equal(x.fps, 20, `${tag} ${k}: it was at 20`);
          assert.ok(Math.abs((y.frames.length - 1) / 30 - (x.frames.length - 1) / 20) < 1 / 20, `${tag} ${k}: as long`);
        } else assert.equal(y.frames.length, x.frames.length, `${tag} ${k}: as many pictures`);
      }
      assert.ok(cb.attack?.hit !== undefined && cb.heavy?.hit !== undefined, `${tag}: the Wave and the Orb go at a moment`);
    }
  }
});

// --- 4. every picture ------------------------------------------------------------------------------------------------------------

/** The moments looked at: her stance, her run, the Wave at its top and as it goes, the Orb's slam, the Beam held, struck, her fall's
 * end, her town stance and run; from every side. */
function shots(): [Move3, number, WuSide][] {
  const M = MU_MOVES;
  const out: [Move3, number, WuSide][] = [];
  for (const v of WU_SIDES) {
    for (const t of LOOKED) out.push([M.mstand, t, v]);
    for (const t of [0.05, 0.2]) out.push([M.mrun, t, v]);
    for (const t of [0.1, M.wave.motion.hit ?? 0.17, 0.3]) out.push([M.wave, t, v]);
    out.push([M.orb, M.orb.motion.hit ?? 0.27, v]);
    out.push([M.beam, 0.3, v], [M.mreel, 0.1, v], [M.mfall, 0.8, v], [M.mtown, 0.6, v], [M.mtownrun, 0.1, v]);
  }
  for (const t of [0.8, 1.8]) out.push([M.mlight, t, 'front'], [M.reading, Math.min(t, 1.5), 'front'], [M.tmlight, t, 'front'], [M.treading, t, 'front'], [M.mready, t / 2, 'front']);
  return out;
}

test('4. every picture looked at, from every side: crisp, the friend\'s cyan edge, nothing of the enemy\'s rim, nothing cut off, her braids fixed, her lights cyan', () => {
  const rim = rgba(WU_RIM);
  const enemy = rgba(ENEMY_RIM);
  const cyan = new Set([...SPARK, ...CYAN].map((c) => c.toLowerCase()));
  const faults: string[] = [];
  let n = 0;
  for (const [m, t, v] of shots()) {
    const f = paintMuMove(m, t, v);
    n++;
    const d = f.px.d;
    let edge = 0;
    for (let k = 0; k < d.length; k += 4) {
      const a = d[k + 3];
      if (a === 0) continue;
      if (a === RIM_ALPHA) {
        if (d[k] === rim[0] && d[k + 1] === rim[1] && d[k + 2] === rim[2]) edge++;
        else faults.push(`${m.name} ${t} ${v}: an edge pixel not cyan`);
        continue;
      }
      if (a !== 255) faults.push(`${m.name} ${t} ${v}: a pixel part seen through`);
      if (d[k] === enemy[0] && d[k + 1] === enemy[1] && d[k + 2] === enemy[2]) faults.push(`${m.name} ${t} ${v}: the enemy's rim`);
    }
    if (edge < 60) faults.push(`${m.name} ${t} ${v}: ${edge} of edge`);
    const W = f.px.w;
    const H = f.px.h;
    for (let x = 0; x < W; x++) for (const y of [0, H - 1]) if (d[(y * W + x) * 4 + 3] > 0) faults.push(`${m.name} ${t} ${v}: cut off`);
    for (let y = 0; y < H; y++) for (const x of [0, W - 1]) if (d[(y * W + x) * 4 + 3] > 0) faults.push(`${m.name} ${t} ${v}: cut off`);
    const ids = (f.tails ?? []).map((r) => r.id).sort().join(' ');
    if (ids !== 'm-braid-a m-braid-b') faults.push(`${m.name} ${t} ${v}: her braids (${ids})`);
    if (!f.charge) faults.push(`${m.name} ${t} ${v}: no charge`);
    for (const l of f.lights) if (!cyan.has(l.color.toLowerCase())) faults.push(`${m.name} ${t} ${v}: a light of ${l.color}`);
  }
  assert.ok(n >= 8 * 15, `${n} pictures looked at`);
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 12).join('; '));
});

// --- 5. clean bodies: her knee under her robe ------------------------------------------------------------------------------------

test('5. clean bodies: in her runs her lifted knee is under her robe, never through it, from every side', () => {
  const faults: string[] = [];
  let worst = 0;
  for (const m of [MU_MOVES.mrun, MU_MOVES.mtownrun]) {
    for (const v of WU_SIDES) {
      for (let i = 0; i < 8; i++) {
        const t = (endOf(m) * i) / 8;
        const f = paintMuMove(m, t, v);
        const st = f.drawn.stuff;
        const W = f.px.w;
        const H = f.px.h;
        // (a pixel of her hose with her robe under it in its column: her leg seen where her robe hangs)
        let through = 0;
        for (let x = 0; x < W; x++) {
          let robeBelow = false;
          for (let y = H - 1; y >= 0; y--) {
            const k = st[y * W + x];
            if (k === f.legMats.robe) robeBelow = true;
            else if (k === f.legMats.hose && robeBelow) through++;
          }
        }
        worst = Math.max(worst, through);
        // (four picture pixels: one game pixel, the round of a knee at the hem's own edge)
        if (through > 4) faults.push(`${m.name} ${t.toFixed(3)} ${v}: ${through} pixels of her leg through her robe`);
      }
    }
  }
  console.log('# her leg seen through her robe, the most in any picture of her runs (picture pixels):', worst);
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

// --- 6. her face ----------------------------------------------------------------------------------------------------------------

test('6. her face reads at the game\'s size: two dark eyes on her lit face from in front, toward you and down to the left; one side-on', () => {
  const ink = rgba(INK);
  const skin = new Set(MU_SKIN.map((c) => rgba(c).slice(0, 3).join(',')));
  const lit = new Set(MU_SKIN.slice(2).map((c) => rgba(c).slice(0, 3).join(',')));
  for (const [v, want] of [['front', 2], ['toward', 2], ['frontL', 2], ['side', 1]] as const) {
    for (const t of LOOKED) {
      const { px } = paintMuMove(MU_MOVES.mstand, t, v);
      const d = px.d;
      const at = (x: number, y: number): string => (x < 0 || y < 0 || x >= px.w || y >= px.h ? '' : `${d[(y * px.w + x) * 4]},${d[(y * px.w + x) * 4 + 1]},${d[(y * px.w + x) * 4 + 2]}`);
      const cols = new Set<number>();
      for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
        if (at(x, y) === `${ink[0]},${ink[1]},${ink[2]}` && skin.has(at(x - 1, y)) && skin.has(at(x + 1, y)) && (lit.has(at(x - 1, y)) || lit.has(at(x + 1, y)))) cols.add(x);
      }
      assert.ok(cols.size >= want, `${v} ${t}: ${want} eyes on lit skin (${cols.size})`);
    }
  }
});

// --- 7. the streak of her swung crystal -------------------------------------------------------------------------------------------

test('7. the Wave leaves the streak of light of her swung crystal, as the game\'s Mage has it; her stance leaves none', () => {
  const streak = (m: Move3, t: number): number => {
    const f = paintMuMove(m, t, 'front');
    let n = 0;
    // (the crystal is the first part drawn beside the sculpture, stuff 1000; the streak the next, 1001)
    for (let k = 0; k < f.drawn.stuff.length; k++) if (f.drawn.stuff[k] === 1001) n++;
    return n;
  };
  let most = 0;
  for (let i = 0; i <= Math.round(endOf(MU_MOVES.wave) * 30); i++) most = Math.max(most, streak(MU_MOVES.wave, i / 30));
  assert.ok(most > 40, `the Wave's streak, ${most} picture pixels at its most`);
  for (const t of LOOKED) assert.equal(streak(MU_MOVES.mstand, t), 0, `standing ${t}: no streak`);
});
