// THE TROLLS' NEW MOVES (src/art/monster_brute.ts, TROLL_MOVES; src/art/charge_lane.ts). The owner's
// yes in the main chat, 9 Oct 2026, by 08:15: the green troll (the brute) a club swing and its slam;
// the red troll (the guardian) a club swing, a slam, and a charge along a marked line. His yes to the
// pictures, by 09:57 (troll_swing.gif, troll_charge.gif). Behind a switch that is off. So:
//   1. the switch is off, and while it is the trolls have no new moves and every frame of theirs is
//      as it was (and is the same with it on: the switch only adds);
//   2. with it on, the green troll has its swing and the red troll its swing and its charge, each a
//      clip as an attack is (the blow, or the setting off, on a frame; the run going round);
//   3. every frame of them paints, wears the enemy's pink edge, and has nothing of the friend's cyan;
//   4. the swing's blow leaves its streak (air for the green troll, its bands' fire for the red), and
//      its warning is not his slam's (the club cocked back, not stood up over his head);
//   5. the charge kicks up dust as he scrapes the floor, and its line on the floor is the red
//      circle's own reds, filling as the wind-up runs out, gone behind him as he runs it.
//   run: tsx --test tests/troll_moves.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, Clip } from '../src/art/actor_types';
import { drawChargeLane } from '../src/art/charge_lane';
import { BLADE, CYAN, GLINT, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { CHARGE_GO, SWING_HIT, TROLL_MOVES, makeBruteArt, makeGuardianArt } from '../src/art/monster_brute';
import { P } from '../src/art/palette';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

/** The art with the switch on (and put back as it was). */
function withMoves<T>(make: () => T): T {
  const was = TROLL_MOVES.on;
  TROLL_MOVES.on = true;
  try {
    return make();
  } finally {
    TROLL_MOVES.on = was;
  }
}

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
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
const key = (c: string): string => rgba(c).slice(0, 3).join(',');

/** How many pixels of a frame are of these colours. */
function count(sp: Sprite, colours: ReadonlyArray<string>): number {
  const want = new Set(colours.map(key));
  const p = paintingOf(sp);
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] > 0 && want.has(`${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`)) n++;
  return n;
}
/** The frame of a clip `t` seconds in. */
const frameAt = (c: Clip, t: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
/** Every frame a figure has, by name. */
function frames(art: ActorArt): { name: string; sp: Sprite }[] {
  const out: { name: string; sp: Sprite }[] = [];
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    s.idle.forEach((sp, i) => out.push({ name: `${view} idle ${i}`, sp }));
    s.walk.forEach((sp, i) => out.push({ name: `${view} walk ${i}`, sp }));
    s.clips?.attack?.frames.forEach((sp, i) => out.push({ name: `${view} slam ${i}`, sp }));
    s.clips?.die?.frames.forEach((sp, i) => out.push({ name: `${view} death ${i}`, sp }));
  }
  return out;
}

test('the switch is off; while it is the trolls have no new moves, and the switch only adds: every old frame is the same', () => {
  assert.equal(TROLL_MOVES.on, false);
  for (const [name, make] of [['green', makeBruteArt], ['red', makeGuardianArt]] as const) {
    const off = make();
    assert.ok(off.front.clips?.moves === undefined && off.back.clips?.moves === undefined, `${name}: no new moves with the switch off`);
    const on = withMoves(make);
    const a = frames(off);
    const b = frames(on);
    assert.equal(a.length, b.length, `${name}: as many frames`);
    for (let i = 0; i < a.length; i++) assert.equal(unlike(a[i].sp, b[i].sp), 0, `${name}: ${a[i].name} is the same with the switch on`);
  }
});

test('with it on: the green troll swings; the red troll swings and charges; each a clip as an attack is', () => {
  const green = withMoves(makeBruteArt);
  const red = withMoves(makeGuardianArt);
  for (const s of [green.front, green.back, red.front, red.back]) {
    const swing = s.clips?.moves?.swing;
    assert.ok(swing && swing.frames.length > 20, 'a swing');
    assert.ok(swing !== undefined && Math.abs((swing.hit ?? 0) - SWING_HIT) < 1 / 30 + 1e-9, 'its blow where it is said to land');
  }
  for (const s of [green.front, green.back]) assert.ok(s.clips?.moves?.charge === undefined, 'the green troll does not charge');
  for (const s of [red.front, red.back]) {
    const m = s.clips?.moves;
    assert.ok(m?.chargeWind && Math.abs((m.chargeWind.hit ?? 0) - CHARGE_GO) < 1 / 30 + 1e-9, 'the charge’s warning, and the moment he sets off');
    assert.ok(m?.charge && m.charge.loop === 0 && m.charge.frames.length >= 8, 'the run, going round');
    assert.ok(m?.chargeStop && m.chargeStop.frames.length > 8, 'the stop');
  }
});

test('every frame of them paints, wears the enemy’s pink edge, and has nothing of the friend’s cyan', () => {
  const rim = key(ENEMY_RIM);
  for (const art of [withMoves(makeBruteArt), withMoves(makeGuardianArt)]) {
    for (const s of [art.front, art.back]) {
      for (const [name, c] of Object.entries(s.clips?.moves ?? {})) {
        c.frames.forEach((sp, i) => {
          const p = paintingOf(sp);
          let painted = 0;
          let edge = 0;
          for (let j = 0; j < p.d.length; j += 4) {
            if (p.d[j + 3] === 0) continue;
            painted++;
            const k = `${p.d[j]},${p.d[j + 1]},${p.d[j + 2]}`;
            if (k === rim) edge++;
            assert.ok(!FRIEND.has(k) && !cyanGlow(p.d[j], p.d[j + 1], p.d[j + 2]), `${name} ${i}: a friend's colour (${k})`);
          }
          assert.ok(painted > 400, `${name} ${i}: only ${painted} pixels`);
          assert.ok(edge > 40, `${name} ${i}: the pink edge (${edge} pixels)`);
          for (const l of sp.lights ?? []) assert.ok(!cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number])), `${name} ${i}: a cyan light`);
        });
      }
    }
  }
});

test('the swing’s blow leaves its streak, and its warning is not the slam’s', () => {
  const AIR = ['#5c5480', '#9a92c0', '#d8d2f0', '#f4f0ff'];
  const green = withMoves(makeBruteArt);
  const red = withMoves(makeGuardianArt);
  for (const [name, art, streak] of [['green', green, AIR], ['red', red, [FLAME[1], FLAME[2], FLAME[3], FLAME[4]]]] as const) {
    for (const [view, s] of [['facing you', art.front], ['facing away', art.back]] as const) {
      const swing = s.clips?.moves?.swing as Clip;
      const held = frameAt(swing, SWING_HIT - 0.04);
      const blow = frameAt(swing, SWING_HIT);
      assert.ok(count(blow, streak) > 25, `${name}, ${view}: the blow leaves a streak (${count(blow, streak)} pixels)`);
      assert.ok(count(held, streak) < count(blow, streak) / 2, `${name}, ${view}: less of those colours while it is held (${count(held, streak)})`);
      // (his slam's warning: the club straight up over his head; the swing's: cocked back over his shoulder)
      const slam = s.clips?.attack as Clip;
      const slamHeld = frameAt(slam, (slam.hit ?? 0.85) * 0.8);
      assert.ok(unlike(held, slamHeld) > 600, `${name}, ${view}: the swing's warning is not the slam's (${unlike(held, slamHeld)} pixels differ)`);
    }
  }
});

test('the charge kicks up dust as he scrapes the floor; its line is the red circle’s reds, filling, and gone behind him as he runs', () => {
  const red = withMoves(makeGuardianArt);
  for (const s of [red.front, red.back]) {
    const wind = s.clips?.moves?.chargeWind as Clip;
    // (some pixels of the floor's dust once a scrape has kicked it: more than before the first)
    const before = paintingOf(frameAt(wind, 0.3));
    const after = paintingOf(frameAt(wind, 0.62));
    const kicked = (p: typeof before): number => {
      let n = 0;
      for (let y = Math.floor(p.h * 0.75); y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) n++;
      return n;
    };
    assert.ok(kicked(after) > kicked(before), `dust is kicked up by his feet (${kicked(before)} then ${kicked(after)} pixels low down)`);
  }
  // the line on the floor
  const drawn = (k: number, gone?: number): { colours: Set<string>; area: number; behind: number } => {
    const colours = new Set<string>();
    let area = 0;
    let behind = 0;
    const pen = {
      fillStyle: '',
      globalAlpha: 1,
      fillRect(x: number, y: number, w: number, h: number): void {
        colours.add(this.fillStyle);
        if (x < 16 && y < 8) behind += w * h;
      },
      beginPath(): void {},
      moveTo(): void {},
      lineTo(): void {},
      closePath(): void {},
      fill(): void {
        colours.add(this.fillStyle);
        area++;
      },
    };
    drawChargeLane(pen as unknown as CanvasRenderingContext2D, { x0: 0, y0: 0, x1: 4.5, y1: 0, half: 0.6, k, gone }, (x, y) => [(x - y) * 16, (x + y) * 8]);
    return { colours, area, behind };
  };
  for (const k of [0, 0.5, 1]) for (const c of drawn(k).colours) assert.ok(([P.bl3, P.bl4, P.bl5] as string[]).includes(c), `the line is drawn in the circle's reds (${c})`);
  assert.equal(drawn(0).area, 1, 'at first only its faint ground');
  assert.equal(drawn(0.5).area, 2, 'then its fill running out along it');
  assert.ok(drawn(0, 0.6).behind < drawn(0).behind, 'gone behind him as he runs');
});
