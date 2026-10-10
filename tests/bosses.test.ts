// THE BOSSES OF DUNGEONS 2 TO 4 (9 Oct 2026): THE HEADSMAN, THE CHAINED ONE AND THE OSSUARY
// AMALGAMATION (src/art/bosses3.ts). A mock-up: nothing of the game makes them. His words, in the art
// chat: at 16:29, "K I need 3 bosses"; by 16:37, "No I need three more Warden level bosses for dungeon
// 2-4.  Then we’ll do the lair boss for dungeon 5". Of the Headsman's axe, at 19:01: "Look at his arms
// they’re all twisted weirdly and the axe is clipping through his shoulder."; at 19:05: "Like look up
// how to chop a log and you’ll see what an overhead swing should look like"; his yes to the four holds
// drawn from that, by 19:42: "Yes, animate them (Recommended)"; at 19:47: "carrying it  and standing
// still facing away the axe is in his wrong hand"; of his fall, by 21:28: "The elbows stick straight
// up.  No one falls over like that", and of the fall redone, by 21:33: "Yes, keep it (Recommended)".
// So:
//   1. the switch is off, and nothing of the game imports the bosses;
//   2. THE HEADSMAN paints in every frame both ways round, nothing cyan, the pink edge while he lives
//      and none as he dies;
//   3. HIS AXE NEVER GOES THROUGH HIM, in any frame of any move: its haft and its blade are clear of
//      his hood, neck, shoulders, chest, belly and hips;
//   4. he holds it as a woodsman does: his left hand on the haft whenever a pose puts it there, at its
//      very end; at each blow both hands together at the end;
//   5. his chop bites the floor about three tiles before him, and the sentence further;
//   6. FACING AWAY, THE AXE IS IN HIS RIGHT HAND: his back is painted as the camera truly sees him (and
//      every other figure's as before);
//   7. as he falls and lies, no elbow points up.
// And, by his words at 23:35, "I need all bosses ran through all checks from now on.  These boss fights
// are important"; at 23:44, "Add it to the rulebook.  All checks must be made."; at 23:56, "And every
// boss gets the same treatment as characters" (the art rulebook's How art is made 7):
//   8. EVERY BOSS THROUGH EVERY CHECK, the whole review the heroes had (src/art/boss_checks.ts): every
//      frame of every move of the Headsman and of the Chained One, in each of his three states, from in
//      front and from behind: nothing through him, feet that grip, nothing in the floor, nothing jerky,
//      nothing that jumps from one move to the next, blows drawn back, held and carried through, hips
//      first, alive when still;
//   9. THE CHAINED ONE paints in every frame both ways round, in all three of his states: nothing cyan,
//      his edge while he lives, none as he dies;
//  10. every pixel of both of them is whole or empty, but the edge of light;
//  11. his chains hang from his cuffs and his collar in every frame, a broken one is gone from him (and
//      what it leaves on the floor paints), and his throws leave and come back to his hands;
//  12. nothing of the game imports the chains or the checks either.
//   run: tsx --test tests/bosses.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import type { AnimSet } from '../src/art/actor_types';
import { BOSSES, CHAINED, CHAINED_FREED, CO_BALL_BACK, CO_BALL_LET, CO_HOOK_BACK, CO_HOOK_LET, HEADSMAN, HS_CHOP_HIT, HS_SENTENCE_HIT, HS_SHAPE, axeOf, coBallPath, coCollarAt, coCuffAt, coHookPath, coShape, collarRingAt, cuffAt, hsBite, makeChainedArt3, makeHeadsmanArt3, makeLeftBehindArt } from '../src/art/bosses3';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { BONEWARD, GOLEM, MARKSMAN, SHADE, TILE3, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { add, dot, len, mul, project, sub } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

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
/** Of one frame: how many pixels it paints, how many of them are the enemy's edge, and whether any (or any of its lights) is cyan. */
function looked(sp: Sprite): { n: number; rim: number; cyan: boolean } {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const d = paintingOf(sp).d;
  let n = 0;
  let rim = 0;
  let cyan = false;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    n++;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) cyan = true;
    if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
  }
  for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) {
    const [r, g, b] = rgba(l.color);
    if (cyanGlow(r, g, b) || FRIEND.has(`${r},${g},${b}`) || r < 150 || r < g || r < b) cyan = true;
  }
  return { n, rim, cyan };
}
/** Every frame of a facing: the living (his stand, his walk, his attacks, his other moves, struck), and the dying. */
function framesOf(set: AnimSet): { living: Sprite[]; dying: Sprite[] } {
  const c = set.clips ?? {};
  const moves = Object.values(c.moves ?? {}).flatMap((m) => m.frames);
  return { living: [...set.idle, ...set.walk, ...set.attack, ...(c.attack?.frames ?? []), ...(c.reel?.frames ?? []), ...moves], dying: [...(c.die?.frames ?? [])] };
}

/** How near a point comes to a segment. */
function segDist(p: V3, a: V3, b: V3): number {
  const ab = sub(b, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / Math.max(1e-9, dot(ab, ab))));
  return len(sub(p, add(a, mul(ab, t))));
}
/** His moves that hold the axe, and how long each is (seconds): every frame of them at thirty a second is looked at. */
const MOVES: ReadonlyArray<[string, number]> = [
  ['stand', 2.5], ['raise', 0.6], ['lower', 0.6], ['setOff', 0.4], ['halt', 0.5], ['walk', 1.25], ['attack', 1.85], ['sentence', 2.65], ['sweep', 2.27], ['throw', 3.1], ['reel', 0.3],
];
/** While the throw's axe is out of his hands. */
const thrown = (mv: string, t: number): boolean => mv === 'throw' && t >= 0.8 && t < 2.3;

test('1. the switch is off, and nothing of the game imports the bosses', () => {
  assert.equal(BOSSES.on, false);
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /bosses3|boss_shots/.test(f)) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    assert.ok(!/from ['"][^'"]*(bosses3|boss_shots)['"]/.test(text), `src/${f} imports the bosses`);
  }
});

test('2. the Headsman paints in every frame both ways round: nothing cyan, his edge while he lives, none as he dies', () => {
  const art = makeHeadsmanArt3();
  for (const view of ['front', 'back'] as const) {
    const { living, dying } = framesOf(art[view]);
    assert.ok(living.length > 200 && dying.length > 20, `${view}: ${living.length} living frames, ${dying.length} dying`);
    living.forEach((sp, i) => {
      const f = looked(sp);
      assert.ok(f.n > 600 && !f.cyan && f.rim > 40, `${view}, living frame ${i}: ${f.n} pixels, ${f.rim} of his edge${f.cyan ? ', and cyan' : ''}`);
    });
    dying.forEach((sp, i) => {
      const f = looked(sp);
      assert.ok(f.n > 300 && !f.cyan && f.rim === 0, `${view}, dying frame ${i}: ${f.n} pixels, ${f.rim} of an edge${f.cyan ? ', and cyan' : ''}`);
    });
  }
});

test('3. his axe never goes through him, in any frame of any move', () => {
  for (const [mv, end] of MOVES) {
    for (let i = 0; i <= Math.round(end * 30); i++) {
      const t = i / 30;
      if (thrown(mv, t)) continue;
      const s = skeletonAt(HEADSMAN, mv, t);
      const a = axeOf(s, posedOfMob(HEADSMAN, mv, t).draw);
      // (how close each part of him may come to the haft or the blade: a little inside its own round, where cloth gives)
      const parts: [string, V3, number][] = [
        ['hood', s.head, 10], ['neck', s.neck, 9], ['left shoulder', s.shoulderL, 7], ['right shoulder', s.shoulderR, 7],
        ['chest', s.ribs, 13], ['belly', s.waist, 12], ['hips', s.pelvis, 12],
      ];
      for (const [name, c, r] of parts) {
        const d = Math.min(segDist(c, a.butt, a.eye), segDist(c, a.eye, a.edge), segDist(c, a.horns[0], a.horns[1]));
        assert.ok(d >= r, `${mv} at ${t.toFixed(2)} s: the axe is ${d.toFixed(1)} from his ${name}'s middle`);
      }
    }
  }
});

test('4. he holds it as a woodsman does: his left hand at its very end, and both hands there at each blow', () => {
  for (const [mv, end] of MOVES) {
    for (let i = 0; i <= Math.round(end * 30); i++) {
      const t = i / 30;
      if (thrown(mv, t)) continue;
      const q = posedOfMob(HEADSMAN, mv, t);
      if (q.lhIn !== 3 || q.lh2) continue;
      const s = skeletonAt(HEADSMAN, mv, t);
      const a = axeOf(s, q.draw);
      const off = segDist(s.handL, a.butt, a.eye);
      assert.ok(off <= 2.5, `${mv} at ${t.toFixed(2)} s: his left hand is ${off.toFixed(1)} off the haft`);
      const along = dot(sub(s.handL, a.butt), s.point);
      assert.ok(along <= 4.5, `${mv} at ${t.toFixed(2)} s: his left hand is ${along.toFixed(1)} up the haft from its end`);
    }
  }
  for (const [mv, t] of [['attack', HS_CHOP_HIT], ['sentence', HS_SENTENCE_HIT]] as const) {
    const q = posedOfMob(HEADSMAN, mv, t);
    assert.ok(q.draw <= 0.1, `${mv}: at the blow his right hand is ${q.draw.toFixed(2)} of the way up the haft (both hands are at its end)`);
  }
});

test('5. his chop bites the floor about three tiles before him, and the sentence further', () => {
  const chop = hsBite('attack');
  const sentence = hsBite('sentence');
  assert.ok(chop[0] / TILE3 > 2.5 && chop[0] / TILE3 < 3.5 && Math.abs(chop[1]) / TILE3 < 0.3, `the chop bites ${(chop[0] / TILE3).toFixed(2)} tiles ahead`);
  assert.ok(sentence[0] > chop[0], `the sentence bites ${(sentence[0] / TILE3).toFixed(2)} tiles ahead, the chop ${(chop[0] / TILE3).toFixed(2)}`);
  for (const [mv, t] of [['attack', HS_CHOP_HIT], ['sentence', HS_SENTENCE_HIT]] as const) {
    const a = axeOf(skeletonAt(HEADSMAN, mv, t), posedOfMob(HEADSMAN, mv, t).draw);
    const low = Math.min(a.edge[2], a.horns[0][2], a.horns[1][2]);
    assert.ok(low < 0 && low > -12, `${mv}: the blade's lowest point at the blow is ${low.toFixed(1)} (in the floor, not through it)`);
  }
});

test('6. facing away, the axe is in his right hand: his back as the camera truly sees him', () => {
  assert.equal(paintViewOf(HEADSMAN, 'back'), 'rear');
  assert.equal(paintViewOf(HEADSMAN, 'front'), 'front');
  for (const mob of [SHADE, BONEWARD, GOLEM, MARKSMAN]) assert.equal(paintViewOf(mob, 'back'), 'back', `${mob.id} is seen from behind as before`);
  // (carried across him, the axe's head is beside his right shoulder: on the left of the picture facing you, and on its right facing away)
  for (const [mv, t] of [['walk', 0], ['walk', 0.6], ['stand', 0]] as const) {
    const s = skeletonAt(HEADSMAN, mv, t);
    const a = axeOf(s, posedOfMob(HEADSMAN, mv, t).draw);
    const head = mv === 'stand' ? a.butt : a.eye;
    const front = project(head, 'front')[0] - project(s.pelvis, 'front')[0];
    const back = project(head, 'rear')[0] - project(s.pelvis, 'rear')[0];
    assert.ok(front < -8 && back > 8, `${mv} at ${t} s: the axe ${front.toFixed(0)} across the picture facing you, ${back.toFixed(0)} facing away`);
  }
});

test('7. as he falls and lies, no elbow points up', () => {
  for (let t = 1.4; t <= 2.6 + 1e-9; t += 1 / 30) {
    const s = skeletonAt(HEADSMAN, 'dying', t);
    assert.ok(s.elbowL[2] <= s.shoulderL[2] + 1 && s.elbowR[2] <= s.shoulderR[2] + 1, `at ${t.toFixed(2)} s: his elbows ${s.elbowL[2].toFixed(0)}, ${s.elbowR[2].toFixed(0)} over his shoulders ${s.shoulderL[2].toFixed(0)}, ${s.shoulderR[2].toFixed(0)}`);
  }
});

test('8. EVERY BOSS THROUGH EVERY CHECK: the whole review, every frame of every move, both ways round', () => {
  const all: [string, Parameters<typeof checkBoss>[0], Parameters<typeof checkBoss>[1]][] = [
    ['the Headsman', HEADSMAN, HS_SHAPE],
    ['the Chained One', CHAINED, coShape(CHAINED)],
    ['the Chained One, his left chain off', CHAINED_FREED[1], coShape(CHAINED_FREED[1])],
    ['the Chained One, free of the ball', CHAINED_FREED[2], coShape(CHAINED_FREED[2])],
  ];
  for (const [who, mob, shape] of all) {
    const found = checkBoss(mob, shape);
    assert.equal(found.length, 0, `${who}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('9. the Chained One paints in every frame both ways round, as free as he is: nothing cyan, his edge while he lives, none as he dies', () => {
  for (const freed of [0, 1, 2] as const) {
    const art = makeChainedArt3(CHAINED.pace, freed);
    for (const view of ['front', 'back'] as const) {
      const { living, dying } = framesOf(art[view]);
      assert.ok(living.length > 150 && dying.length > 20, `${freed}, ${view}: ${living.length} living frames, ${dying.length} dying`);
      living.forEach((sp, i) => {
        const f = looked(sp);
        assert.ok(f.n > 600 && !f.cyan && f.rim > 40, `${freed}, ${view}, living frame ${i}: ${f.n} pixels, ${f.rim} of his edge${f.cyan ? ', and cyan' : ''}`);
      });
      dying.forEach((sp, i) => {
        const f = looked(sp);
        assert.ok(f.n > 300 && !f.cyan && f.rim === 0, `${freed}, ${view}, dying frame ${i}: ${f.n} pixels, ${f.rim} of an edge${f.cyan ? ', and cyan' : ''}`);
      });
    }
  }
});

test('10. every pixel of both of them is whole or empty, but the edge of light', () => {
  for (const [who, art] of [['the Headsman', makeHeadsmanArt3()], ['the Chained One', makeChainedArt3()]] as const) {
    for (const view of ['front', 'back'] as const) {
      const { living, dying } = framesOf(art[view]);
      [...living, ...dying].forEach((sp, i) => {
        const d = paintingOf(sp).d;
        let odd = 0;
        for (let k = 3; k < d.length; k += 4) if (d[k] !== 0 && d[k] !== 255 && d[k] !== RIM_ALPHA) odd++;
        assert.equal(odd, 0, `${who}, ${view}, frame ${i}: ${odd} pixels neither whole nor empty`);
      });
    }
  }
});

test('11. his chains hang from his cuffs and his collar; a broken one is gone from him; his throws leave and come back to his hands', () => {
  const moves = (mob: typeof CHAINED): string[] => ['stand', 'walk', 'attack', 'reel', ...Object.keys(mob.more ?? {})];
  const moveOf = (mob: typeof CHAINED, m: string) => (m === 'stand' || m === 'walk' || m === 'attack' || m === 'reel' ? mob[m] : mob.more![m]);
  for (const [mob, has] of [[CHAINED, ['L', 'R', 'ball']], [CHAINED_FREED[1], ['R', 'ball']], [CHAINED_FREED[2], ['R']]] as const) {
    for (const m of moves(mob)) {
      const mv = moveOf(mob, m);
      const end = mv.motion.keys[mv.motion.keys.length - 1].at;
      for (let t = 0; t <= end + 1e-9; t += 0.1) {
        const r = mv.ropes!(t);
        const s = skeletonAt(mob, m, t);
        for (const name of ['L', 'R', 'ball'] as const) {
          const ch = r[name];
          if (!(has as readonly string[]).includes(name)) {
            assert.ok(!ch, `${mob.id} ${m} at ${t.toFixed(1)} s: his ${name} chain is broken, but there`);
            continue;
          }
          // (out across the room, or broken in this very move, it is not his to paint)
          if (!ch) continue;
          if ((m === 'breakL' && name === 'L') || (m === 'breakBall' && name === 'ball')) continue;
          const at = name === 'ball' ? collarRingAt(s) : cuffAt(s, name);
          assert.ok(len(sub(ch[0], at)) < 0.8, `${mob.id} ${m} at ${t.toFixed(1)} s: his ${name} chain hangs ${len(sub(ch[0], at)).toFixed(1)} from where it is fixed`);
        }
      }
    }
  }
  for (const which of ['L', 'ball'] as const) for (const view of ['front', 'back'] as const) assert.ok(paintingOf(makeLeftBehindArt(which, view)).d.some((v, i) => i % 4 === 3 && v > 0), `what his broken ${which} chain leaves on the floor paints, ${view}`);
  // (the hook leaves his hand as he flings it, and is back in it when he has hauled it in; and the ball)
  // (in tiles before him and to his left, and up in game pixels, as the game's drawings of them take it)
  const inTiles = (p: V3): V3 => [p[0] / TILE3, p[1] / TILE3, p[2] / 2];
  const near = (a: readonly number[], b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], (a[2] - b[2]) / 16);
  const hook0 = coHookPath(CO_HOOK_LET + 0.001);
  assert.ok(hook0 && near(hook0.at, inTiles(coCuffAt('hook', CO_HOOK_LET))) < 1.8, `the hook leaves from his right hand: ${hook0?.at.map((v) => v.toFixed(2)).join(',')}`);
  assert.ok(coHookPath(CO_HOOK_BACK + 0.05) === null, 'the hook is his again when it is hauled in');
  const ball0 = coBallPath(CO_BALL_LET + 0.001);
  assert.ok(ball0 && near(ball0.at, inTiles(lerpHands(CO_BALL_LET))) < 0.1, 'the ball leaves from between his hands');
  assert.ok(coBallPath(CO_BALL_BACK + 0.05) === null, 'the ball is his again when it is hauled in');
  void coCollarAt;
});

test('12. nothing of the game imports the chains or the checks either', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /bosses3|boss_shots|boss_chains|boss_checks/.test(f)) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    assert.ok(!/from ['"][^'"]*(boss_chains|boss_checks)['"]/.test(text), `src/${f} imports the chains or the checks`);
  }
});

/** Between his hands, a moment into the ball throw. */
function lerpHands(t: number): V3 {
  const s = skeletonAt(CHAINED, 'ball', t);
  return mul(add(s.handL, s.handR), 0.5);
}
