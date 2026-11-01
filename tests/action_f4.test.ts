// FLOOR 4'S MOBS, MORE ACTION (the art chat's helper, 1 Nov 2026; docs/mockups/action_f4/README.md). His picks of 31 Oct: the
// Ossuary Golem, offered "Skeleton hurl: picks up a whole skeleton and hurls it, big in the air, its shadow on the floor showing
// where. It bursts apart when it lands and bones fly out all round as shrapnel.", “Yes (Recommended)”; the dagger cultist, offered
// "Frenzy: four stabs in a blur, stepping in with each, then it stands winded a moment. That's your opening.", “Yes
// (Recommended)”. So:
//   1. the switches are off (GOLEM_HURL, DAGGER_FRENZY), nothing of the game imports the mock-up, the dagger cultist is the game's
//      with his switch off, and with the switches on every frame of the two is the same but their new moves; the old skull lob is
//      kept in the game's golem, out of the hurling one's set;
//   2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. THE GOLEM'S NEW MOVES THROUGH THE BOSSES' REVIEW (art/boss_checks.ts checkBoss, on the heroes' bones), from in front and from
//      behind, with every handing over (from its stand at every frame, from its walk at every step, and back): nothing found; what it
//      keeps (its stand, walk, struck, death, slam) only what the game's own golem's do; Movement 9 (the held wind-ups, the two-frame
//      smeared strikes); the skeleton in its fist only between its grip and its throw, never through it;
//   4. THE FRENZY THROUGH THE REVIEW: its four stabs each a blow of its own (drawn back, held, one frame, smeared, carried through, the
//      hips first), from his stand, from his run's frames the game may begin it on, and ending where his steps have taken him:
//      nothing found; its numbers; his winded moment bent over;
//   5. the hurl's flight and burst: its numbers (faster and lower than the skull, a bigger burst); its tumble crisp, pink-edged, no
//      cyan; its shadow growing; the mark of its reach before it lands; the burst at 2.0 to 2.5 tiles not cut off, crisp, no cyan; the
//      bones flung out within its reach, lying, gone by its end.
//   run: tsx --test tests/action_f4.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { BURST_CANVAS, BURST_LONG, GOLEM_HURL, HELD_IN, HURL, HURLED_FRAMES, HURL_FROM, HURL_GOLEM, HURL_HIT, HURL_SMEARED, HURL_STRIKE, SWING, SWING_HIT, SWING_SMEARED, SWING_STRIKE, burstPainted, burstStrikes, heldBones, hurlArc, hurlAt, hurlFly, hurlShadowPainted, makeHurlGolemArt, makeHurledArt, paintHurled } from '../src/art/action_f4_fx';
import { DAGGER_CULTIST, DAGGER_FRENZY, FRENZY, FRENZY_CULTIST, FRENZY_HITS, FRENZY_SMEARED, FRENZY_STRIKES, FRENZY_TRAVEL, frenzyTravel, knifeTipOf, makeDaggerCultistArt3, makeFrenzyCultistArt } from '../src/art/cultists';
import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import type { Finding } from '../src/art/boss_checks';
import { GOLEM, TILE3, mobSet, paintMob, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { MONSTERS, SKULL } from '../src/game/defs';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { golemHandovers, golemShape, knifeHandovers, knifeShape } from './action_f4_shapes';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

// (pure white is the heart of the enemy's own fire and of a burst's flash, as the game has it: not the friend's)
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
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
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean; colours: Set<string> } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  const colours = new Set<string>();
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      colours.add(k);
      if (k === rimKey) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge, colours };
}
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, (c[k] as Clip).frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
const said = (found: ReadonlyArray<Finding>): string[] => found.map((f) => `${f.move}: ${f.kind} ${f.what.replace(/ \(down from [0-9.]+ s\)/, '')}`);

test('1. the switches are off, nothing of the game imports the mock-up, and with them on only the new moves are new', () => {
  assert.equal(GOLEM_HURL.on, false, 'GOLEM_HURL is off');
  assert.equal(DAGGER_FRENZY.on, false, 'DAGGER_FRENZY is off');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/action_f4_fx.ts') continue;
    assert.ok(!/from ['"][^'"]*action_f4_(fx|scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  // the dagger cultist: with his switch off, the game's own; with it on, every list the same but his attack, which is the frenzy
  const pace = MONSTERS.dagger.speed;
  const game: ActorArt = { front: mobSet(DAGGER_CULTIST, 'front', pace), back: mobSet(DAGGER_CULTIST, 'back', pace) };
  const off = makeDaggerCultistArt3(pace);
  DAGGER_FRENZY.on = true;
  let on: ActorArt;
  try {
    on = makeDaggerCultistArt3(pace);
  } finally {
    DAGGER_FRENZY.on = false;
  }
  for (const v of ['front', 'back'] as const) {
    const g = new Map(lists(game[v]));
    for (const [n, fr] of lists(off[v])) fr.forEach((sp, i) => assert.equal(unlike(sp, (g.get(n) as Sprite[])[i]), 0, `dagger cultist ${v} ${n} ${i}: the game's own with the switch off`));
    const b = new Map(lists(on[v]));
    for (const n of ['idle', 'walk', 'die', 'reel']) (g.get(n) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (b.get(n) as Sprite[])[i]), 0, `dagger cultist ${v} ${n} ${i}: the same with the frenzy`));
    const atk = on[v].clips?.attack as Clip;
    assert.ok(atk.frames.length === Math.round(FRENZY.long * 30) + 1 && Math.abs((atk.hit ?? 0) - FRENZY_HITS[3]) < 1e-9, `dagger cultist ${v}: his attack is the frenzy, its last stab its hit`);
  }
  // the golem: everything it keeps the same, frame for frame, on its bigger canvas; its swing and its throw new; its old skull lob kept in the game's golem
  const gameGolem: ActorArt = { front: mobSet(GOLEM, 'front', MONSTERS.golem.speed), back: mobSet(GOLEM, 'back', MONSTERS.golem.speed) };
  const hurl = makeHurlGolemArt(MONSTERS.golem.speed);
  for (const v of ['front', 'back'] as const) {
    const g = new Map(lists(gameGolem[v]));
    const h = new Map(lists(hurl[v]));
    for (const n of ['idle', 'walk', 'die', 'reel', 'moves.slam']) (g.get(n) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (h.get(n) as Sprite[])[i]), 0, `golem ${v} ${n} ${i}: the same with the hurl`));
    assert.equal(Object.keys(hurl[v].clips?.moves ?? {}).sort().join(), 'hurled,slam,throw', `golem ${v}: its moves the hurl, the slam, the skeleton in flight; no skull lob`);
    assert.ok(Math.abs((hurl[v].clips?.moves?.throw.hit ?? 0) - HURL_HIT) < 1e-9 && Math.abs((hurl[v].clips?.attack?.hit ?? 0) - SWING_HIT) < 1e-9, `golem ${v}: its throw's and its swing's blows`);
  }
  assert.ok(GOLEM.more?.throw?.skull !== undefined && GOLEM.more.throw.name === 'The Golem hurls a skull', 'the old skull lob kept, in the game’s golem');
  assert.ok(HURL_GOLEM.more?.throw?.skull === undefined, 'the hurling golem has no skull in its fist');
});

test('2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const golem = makeHurlGolemArt();
  const knife = makeFrenzyCultistArt();
  for (const v of ['front', 'back'] as const) {
    for (const [who, clip] of [['golem swing', golem[v].clips?.attack], ['golem hurl', golem[v].clips?.moves?.throw], ['frenzy', knife[v].clips?.attack]] as const) {
      (clip as Clip).frames.forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        assert.ok(l.painted > 400 && l.rim > 40, `${v} ${who} ${i}: painted (${l.painted}), the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${v} ${who} ${i}: not crisp`);
        assert.equal(l.cyan, null, `${v} ${who} ${i}: a friend's colour`);
      });
    }
    // (cut off: their own canvases, before they are trimmed)
    for (const [mob, move] of [[HURL_GOLEM, 'attack'], [HURL_GOLEM, 'throw'], [FRENZY_CULTIST, 'attack']] as const) {
      for (const t of framesOf(mob, move)) assert.ok(!look(paintMob(mob, move, t, v).px).edge, `${v} ${mob.id} ${move} ${t.toFixed(3)}: cut off`);
    }
  }
});

test('3. the golem’s swing and hurl through the bosses’ review: nothing found; what it keeps, only what the game’s own does; Movement 9', () => {
  const NEW = ['attack', 'throw'];
  const shape = { ...golemShape(HURL_GOLEM, true), handovers: golemHandovers(HURL_GOLEM, [...NEW, 'reel']) };
  const found = said(checkBoss(HURL_GOLEM, shape));
  const game = new Set(said(checkBoss(GOLEM, { ...golemShape(GOLEM, false), handovers: golemHandovers(GOLEM, ['reel']) })));
  const bad = found.filter((f) => NEW.some((m) => f.startsWith(`${m}:`) || f.includes(`> ${m}`) || f.startsWith(`${m} >`)) || !game.has(f));
  assert.equal([...new Set(bad)].length, 0, `the review found:\n${[...new Set(bad)].join('\n')}`);
  // Movement 9: each strike two frames; its wind-up held (the club still a while before it; the skeleton held up a third of a second)
  assert.ok(Math.round((SWING_STRIKE[1] - SWING_STRIKE[0]) * 30) === 2 && Math.round((HURL_STRIKE[1] - HURL_STRIKE[0]) * 30) === 2, 'each strike two frames');
  assert.ok(SWING_SMEARED(SWING_STRIKE[0] + 1 / 30) && SWING_SMEARED(SWING_HIT) && !SWING_SMEARED(SWING_STRIKE[0]) && HURL_SMEARED(HURL_HIT) && !HURL_SMEARED(1.2), 'smeared through each strike, not before');
  assert.ok(SWING.hit > 0.8 && SWING.reach > MONSTERS.golem.range && SWING.long >= SWING.hit + 0.6, 'the swing: a long wind-up, a bigger reach, a big wind-down');
  const fist = (t: number): readonly number[] => skeletonAt(HURL_GOLEM, 'throw', t).handR;
  const still = Math.hypot(...fist(1.1).map((v, i) => v - fist(HURL_STRIKE[0])[i]));
  assert.ok(still < 3 && HURL_STRIKE[0] - 1.08 > 0.25, `the skeleton held up and still from 1.08 s to its strike (its fist moves ${still.toFixed(1)})`);
  // the skeleton in its fist only from when its fist closes on it to the throw; above the floor once it is up
  assert.equal(heldBones(HURL_GOLEM, 0.3), null, 'no skeleton before its fist closes');
  assert.ok(heldBones(HURL_GOLEM, 0.6) && heldBones(HURL_GOLEM, HURL_HIT - 1 / 30), 'the skeleton in its fist as it hauls and holds it');
  assert.equal(heldBones(HURL_GOLEM, HURL_HIT), null, 'gone from its fist as it is loosed');
  assert.ok((heldBones(HURL_GOLEM, 1.2) ?? []).every((p) => p[2] > 4), 'held up, clear of the floor');
  assert.ok(HELD_IN <= 7.5, 'only its neck, skull and shoulders may touch the fist that holds it');
});

test('4. the frenzy through the review: four stabs, each a blow of its own; from his stand and his run; ending where his steps take him; winded', () => {
  const found = checkBoss(FRENZY_CULTIST, { ...knifeShape(FRENZY_CULTIST, true), handovers: knifeHandovers(FRENZY_CULTIST, true) }, ['attack']);
  assert.equal(found.length, 0, `the review found:\n${findingsSaid(found).join('\n')}`);
  // its numbers
  assert.equal(FRENZY_STRIKES.length, 4, 'four stabs');
  FRENZY_STRIKES.forEach(([a, b], i) => assert.ok(Math.round((b - a) * 30) === 1 && FRENZY_SMEARED(b) && !FRENZY_SMEARED(a), `stab ${i + 1}: one frame, smeared`));
  for (let i = 1; i < 4; i++) assert.ok(Math.abs(FRENZY_HITS[i] - FRENZY_HITS[i - 1] - 7 / 30) < 1e-9, 'a stab every seven frames');
  assert.ok(FRENZY_STRIKES[0][0] >= 0.4, 'a held coil before the first');
  assert.ok(Math.abs(FRENZY.travel - 1.2) < 1e-9 && Math.abs(FRENZY_TRAVEL - 1.2 * TILE3) < 1e-9 && frenzyTravel(FRENZY_HITS[1]) === 2 * FRENZY.step && frenzyTravel(FRENZY.long) === FRENZY.travel, '0.3 tiles a stab, 1.2 in all');
  const end = posedOfMob(FRENZY_CULTIST, 'attack', FRENZY.long);
  const rest = FRENZY_CULTIST.stand.rest;
  assert.ok(Math.abs(end.px - rest.px - FRENZY_TRAVEL) < 1e-6 && Math.abs(end.rfx - rest.rfx - FRENZY_TRAVEL) < 1e-6 && Math.abs(end.lfx - rest.lfx - FRENZY_TRAVEL) < 1e-6, 'at rest at its end, where his steps have taken him');
  // each stab reaches out before him, further than he stands at rest
  const s0 = skeletonAt(FRENZY_CULTIST, 'stand', 0);
  for (const h of FRENZY_HITS) {
    const s = skeletonAt(FRENZY_CULTIST, 'attack', h);
    assert.ok(knifeTipOf(s)[0] - s.pelvis[0] > 20 && knifeTipOf(s)[0] > knifeTipOf(s0)[0] + 20, `the stab at ${h.toFixed(3)} s driven out before him`);
  }
  // winded: bent over, his knife hanging low, his back heaving, for the better part of a second
  const [w0, w1] = FRENZY.winded;
  assert.ok(w1 - w0 >= 0.9, 'winded the better part of a second');
  const zs: number[] = [];
  for (let t = w0; t <= w1 + 1e-9; t += 1 / 30) {
    const q = posedOfMob(FRENZY_CULTIST, 'attack', t);
    const s = skeletonAt(FRENZY_CULTIST, 'attack', t);
    assert.ok(q.pitch + q.bend > 45 && s.handR[2] < s.pelvis[2], `winded at ${t.toFixed(2)} s: bent over, his knife low`);
    zs.push(s.ribs[2]);
  }
  assert.ok(Math.max(...zs) - Math.min(...zs) > 1.2, 'his back heaving');
});

test('5. the hurl’s flight and burst: faster, lower, bigger; crisp, pink-edged, no cyan, not cut off; the mark, the shadow; the bones within its reach, gone at its end', () => {
  // faster and lower than the skull, and a bigger burst
  for (const d of [2.5, 5, 10]) assert.ok(hurlFly(d) < 0.8 && hurlFly(d) < SKULL.fly * 0.75, `at ${d} tiles it flies ${hurlFly(d).toFixed(2)} s (the skull ${SKULL.fly})`);
  assert.ok(hurlArc(10) < SKULL.top, 'a low arc (the skull went up 100 game pixels, 200 picture pixels)');
  assert.ok(HURL.r >= 2 && HURL.r <= 2.5 && HURL.r > SKULL.r * 1.8, 'a burst of 2 to 2.5 tiles (the skull’s 1.1)');
  assert.ok(burstStrikes(2.2, 0) && burstStrikes(1.5, 1.5) && !burstStrikes(2.0, 1.2), 'who is struck');
  assert.ok(HURL.aim < HURL.hit - 0.3 && HURL.near === 2.5 && HURL.far === 10, 'aimed and marked as it holds it, a third of a second and more before it is loosed');
  const [x0, y0, z0] = HURL_FROM;
  assert.ok(x0 > 0.8 && z0 > 40 && Math.abs(y0) < 1, 'loosed from its fist before it, high');
  const mid = hurlAt(0.5, 5);
  assert.ok(Math.abs(hurlAt(0, 5)[2] - z0) < 1e-9 && Math.abs(hurlAt(1, 5)[0] - 5) < 1e-9 && hurlAt(1, 5)[2] === HURL.land && mid[2] > (z0 + HURL.land) / 2, 'from its fist, over a low arc, to where it was aimed');
  // the skeleton in flight: crisp, pink-edged, no cyan, not cut off, both ways round
  for (const v of ['front', 'back'] as const) {
    for (let i = 0; i < HURLED_FRAMES; i++) {
      const l = look(paintHurled(i / HURLED_FRAMES, v).px);
      assert.ok(l.painted > 300 && l.rim > 40 && l.odd === 0 && l.cyan === null && !l.edge, `${v} in flight ${i}: painted ${l.painted}, rim ${l.rim}, crisp, no cyan (${l.cyan}), not cut off`);
    }
    assert.equal(makeHurledArt(v).length, HURLED_FRAMES, 'its tumble, as the game holds a picture');
  }
  // its shadow grows and darkens as it comes down
  const sh = (k: number): number => look(hurlShadowPainted(k).px).painted;
  assert.ok(sh(1) > sh(0.5) * 1.5 && sh(0.5) > sh(0) * 1.5 && look(hurlShadowPainted(1).px).odd === 0, 'its shadow grows as it comes down');
  // the burst, at 2.0, 2.25 and 2.5 tiles: crisp, no cyan, nothing cut off
  for (const r of [2.0, HURL.r, 2.5]) {
    for (let t = -0.8; t <= BURST_LONG + 1e-9; t += 0.05) {
      for (const layer of ['floor', 'air'] as const) {
        const p = burstPainted(t, layer, r);
        const l = look(p.px, p.lights);
        assert.ok(l.odd === 0 && l.cyan === null && !l.edge, `the burst (${r}) ${layer} at ${t.toFixed(2)}: crisp, no cyan (${l.cyan}), not cut off`);
      }
    }
  }
  const pink = rgba('#ff7aa8').slice(0, 3).join(',');
  assert.ok(look(burstPainted(-0.3, 'floor').px).painted > 300 && look(burstPainted(-0.3, 'floor').px).colours.has(rgba('#e0287a').slice(0, 3).join(',')), 'its reach marked in the enemy’s pink before it lands');
  assert.ok(look(burstPainted(0.02, 'air').px).colours.has('255,248,236') && look(burstPainted(0.1, 'floor').px).colours.has(pink), 'the flash, and the reach of its bones at the edge of its dust');
  // the bones: flung out within its reach, lying, gone at its end
  const { ax, ay } = BURST_CANVAS;
  const spread = (t: number): number => {
    const p = burstPainted(t, 'floor').px;
    let far = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) far = Math.max(far, Math.hypot((x - ax) / 32, (y - ay) / 16) / Math.SQRT2);
    return far;
  };
  assert.ok(spread(0.8) > HURL.r * 0.75 && spread(0.8) < 2.5 + 0.3, `the bones lie out to the burst’s reach (${spread(0.8).toFixed(2)} tiles)`);
  assert.ok(look(burstPainted(0.8, 'floor').px).painted > 150, 'the bones lying');
  assert.ok(look(burstPainted(BURST_LONG, 'floor').px).painted + look(burstPainted(BURST_LONG, 'air').px).painted === 0, 'nothing left at its end');
});
