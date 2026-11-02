// FLOORS 9 AND 10'S MOBS, MORE ACTION (the art chat's helper, 1 Nov 2026; docs/mockups/action_f9/README.md). His picks of 31 Oct, each
// “Yes (Recommended)”: the twisted deer, “Bramble charge, in place of the stomp”; the fog wolf, “Pack strike”; the Drowned, “Bog retch”
// and, his pick for FROST, “The Drowned, 10” (its grab freezes you in place a moment). So:
//   1. the switches are off; nothing of the game imports the mock-ups; the game's own frames of the three hash the same as on the
//      branch this one came from (tools/action_f9_hash.ts); with the new art, every list but the new moves the game's own, frame for frame;
//   2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. THE DROWNED THROUGH THE BOSSES' REVIEW (art/boss_checks.ts checkBoss, from in front and from behind, with its handing over from
//      every frame of its stand and back): nothing found; Movement 9 (held wind-ups, strikes of two frames, smeared, big wind-downs);
//   4. THE DEER AND THE WOLF THROUGH THE REVIEW FOR THE OLD RIGS (art/action_f1_checks.ts checkKit, both ways round, each pair of the
//      deer's feet as its soles, where the game carries them over the floor and all): nothing found; Movement 9;
//   5. what each leaves: crisp, no cyan, not cut off; the frost clear of the friend's cyan; THE NUMBERS (bigger areas, faster strikes).
//   run: tsx --test tests/action_f9.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { checkBoss, findingsSaid, framesOf } from '../src/art/boss_checks';
import { checkKit } from '../src/art/action_f1_checks';
import { paintMob } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { DEER as DEER_RULES } from '../src/game/act1_rules/deer';
import { WOLF as WOLF_RULES } from '../src/game/act1_rules/wolf';
import { DROWNED as DROWNED_RULES } from '../src/game/act1_rules/drowned';
import { CHARGE, CHARGE_CARRIED, CHARGE_HIT, CHARGE_STRIKE, DEER_BRAMBLE, GORE9, GORE_HIT, GORE_STRIKE, HEDGE, HEDGE_AT, HEDGE_GONE, LEAP, LEAP_HIT, LEAP_STRIKE, PACK, WOLF_PACK, antlerTip, brambleDeerPainted, chargeCarry, chargePose, hedgeClumpPainted, hedgeUp, inHedge, leapPainted, leapStrikes, makeBrambleDeerArt, makePackWolfArt, packOf } from '../src/art/action_f9_pinewood';
import { DROWNED_RETCH, FROST, FROST_DROWNED, GRAB9, GRAB_HIT, GRAB_STRIKE, RETCH, RETCH_HIT, RETCH_STRIKE, RIME, SLICK, gushPainted, inCone, makeFrostDrownedArt, rimePainted, slickPainted } from '../src/art/action_f9_fen';
import { lanePainted } from '../src/art/action_f6_golem';
import { stage } from '../src/art/skin';
import { deerKit, frostDrownedShape, wolfKit } from './action_f9_shapes';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

// (pure white is the heart of a flash and of the ice's glint, as the game has it: not the friend's)
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function hueSat(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) * 60;
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
    else h = (4 + (r - g) / (max - min)) * 60;
  }
  return [(h + 360) % 360, max === 0 ? 0 : (max - min) / max, max];
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const [h, s, max] = hueSat(r, g, b);
  return max >= 150 && s >= 0.45 && h >= 165 && h <= 205;
}
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      if (k === rimKey) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge };
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
/** As tools/action_f3_hash.ts and tools/action_f9_hash.ts hash a figure's frames (every list both ways round). */
const sha = (x: string | Uint8ClampedArray, n: number): string => {
  const h = (nodeCrypto as { createHash(a: string): { update(x: unknown): unknown; digest(e: string): string } }).createHash('sha256');
  h.update(x);
  return h.digest('hex').slice(0, n);
};
function hashMoves(art: ActorArt): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    const ls: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
    if (s.heavy) ls.push(['heavy3', s.heavy]);
    const c = s.clips;
    if (c) {
      for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) ls.push([k, (c[k] as Clip).frames]);
      for (const [k, v] of Object.entries(c.moves ?? {})) ls.push([`moves.${k}`, v.frames]);
    }
    for (const [name, fr] of ls) out[`${view}:${name}`] = fr.map((sp) => {
      const h = (nodeCrypto as { createHash(a: string): { update(x: unknown): unknown; digest(e: string): string } }).createHash('sha256');
      const p = sp.img as unknown as Px;
      h.update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`);
      h.update(p.d);
      h.update(JSON.stringify(sp.lights ?? []));
      return h.digest('hex').slice(0, 12);
    });
  }
  return out;
}
const whole = (m: Record<string, string[]>): string => sha(JSON.stringify(m), 16);
const KINDS = ['deer', 'wolf', 'drowned'] as const;
/** The game's own frames of the three, on 0386b52 (origin/art/action-f6, before this branch): tools/action_f9_hash.ts. */
const HASHES: Record<(typeof KINDS)[number], string> = { deer: '13bda852bc8fff58', wolf: '3e6b7fd0ff8d8f3b', drowned: '6d07028e30e962bb' };

test('1. the switches are off; nothing of the game imports the mock-ups; the game’s frames the same; only the new moves new', () => {
  for (const sw of [DEER_BRAMBLE, WOLF_PACK, DROWNED_RETCH]) assert.equal(sw.on, false, 'a switch is on');
  const OURS = /from ['"][^'"]*action_f9_(pinewood|fen|scene)['"]/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/action_f9_/.test(f)) continue;
    assert.ok(!OURS.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  // the game's own frames, pixel for pixel, as they were
  const game: Record<string, ActorArt> = {};
  for (const k of KINDS) {
    game[k] = (act1Fig(k) as NonNullable<ReturnType<typeof act1Fig>>).make();
    assert.equal(whole(hashMoves(game[k])), HASHES[k], `${k}: the game's own frames changed`);
  }
  // with the new art: every list the game's own but the new moves
  const made: Array<[string, ActorArt, string[], string[]]> = [
    ['deer', makeBrambleDeerArt(), ['idle', 'walk', 'die', 'reel'], ['attack', 'moves.charge']],
    ['wolf', makePackWolfArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
    ['drowned', makeFrostDrownedArt(), ['idle', 'walk', 'die', 'reel', 'moves.rise'], ['attack', 'moves.retch']],
  ];
  for (const [k, art, kept, fresh] of made) {
    for (const v of ['front', 'back'] as const) {
      const g = new Map(lists(game[k][v]));
      const n = new Map(lists(art[v]));
      for (const name of kept) (g.get(name) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (n.get(name) as Sprite[])[i]), 0, `${k} ${v} ${name} ${i}: the game's own`));
      for (const name of fresh) assert.ok(n.has(name), `${k} ${v}: has ${name}`);
    }
  }
  assert.ok(!('stomp' in (makeBrambleDeerArt().front.clips?.moves ?? {})), 'the charge in place of the stomp');
});

test('2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const arts: Array<[string, ActorArt, string[]]> = [
    ['deer', makeBrambleDeerArt(), ['attack', 'charge']],
    ['wolf', makePackWolfArt(), ['attack']],
    ['drowned', makeFrostDrownedArt(), ['attack', 'retch']],
  ];
  for (const [who, art, moves] of arts) {
    for (const v of ['front', 'back'] as const) {
      for (const m of moves) {
        const clip = (m === 'attack' ? art[v].clips?.attack : art[v].clips?.moves?.[m]) as Clip;
        clip.frames.forEach((sp, i) => {
          const l = look(paintingOf(sp), sp.lights);
          assert.ok(l.painted > 120 && l.rim > 12, `${who} ${v} ${m} ${i}: painted (${l.painted}), the pink edge (${l.rim})`);
          assert.equal(l.odd, 0, `${who} ${v} ${m} ${i}: not crisp`);
          assert.equal(l.cyan, null, `${who} ${v} ${m} ${i}: a friend's colour`);
        });
      }
    }
  }
  // (cut off: their own canvases, before they are trimmed)
  for (const v of ['front', 'back'] as const) {
    for (let i = 0; i <= Math.round(GORE9.long * 30); i++) assert.ok(!look(brambleDeerPainted('attack', i / 30, v).px).edge, `deer ${v} gore ${i}: cut off`);
    for (let i = 0; i <= Math.round(CHARGE.long * 30); i++) assert.ok(!look(brambleDeerPainted('charge', i / 30, v).px).edge, `deer ${v} charge ${i}: cut off`);
    for (let i = 0; i <= Math.round(LEAP.long * 30); i++) assert.ok(!look(leapPainted(i / 30, v).px).edge, `wolf ${v} leap ${i}: cut off`);
    for (const move of ['attack', 'retch']) for (const t of framesOf(FROST_DROWNED, move)) assert.ok(!look(paintMob(FROST_DROWNED, move, t, v).px).edge, `drowned ${v} ${move} ${t.toFixed(3)}: cut off`);
  }
});

test('3. the Drowned through the bosses’ review, both ways round: nothing found; Movement 9', () => {
  const found = checkBoss(FROST_DROWNED, frostDrownedShape(), ['attack', 'retch']);
  assert.equal(found.length, 0, `the review found:\n${findingsSaid(found).join('\n')}`);
  for (const [name, [a, b], hit, long, held] of [['grab', GRAB_STRIKE, GRAB_HIT, GRAB9.long, GRAB_STRIKE[0] - GRAB9.up], ['retch', RETCH_STRIKE, RETCH_HIT, RETCH.long, RETCH_STRIKE[0] - RETCH.rise]] as const) {
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${name}: a strike of two frames, its blow at its end`);
    assert.ok(held >= 0.3, `${name}: held ${held.toFixed(2)} s`);
    assert.ok(long - hit >= 0.8, `${name}: a big wind-down (${(long - hit).toFixed(2)} s)`);
  }
});

test('4. the deer and the wolf through the review for the old rigs, both ways round: nothing found; Movement 9', () => {
  const said: string[] = [];
  for (const v of ['front', 'back'] as const) {
    for (const pair of [0, 1] as const) for (const m of ['attack', 'charge'] as const) for (const f of checkKit(deerKit(v, m, pair), deerKit(v, 'stand', pair))) said.push(`deer ${v} ${f.move} (feet ${pair ? 'hind' : 'fore'}): ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    for (const f of checkKit(wolfKit(v, 'attack'), wolfKit(v, 'stand'))) said.push(`wolf ${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
  }
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
  for (const [name, [a, b], hit, long, held] of [['gore', GORE_STRIKE, GORE_HIT, GORE9.long, GORE_STRIKE[0] - GORE9.low], ['charge', CHARGE_STRIKE, CHARGE_HIT, CHARGE.long, CHARGE_STRIKE[0] - CHARGE.stamps[1] - 0.02], ['leap', LEAP_STRIKE, LEAP_HIT, LEAP.long, LEAP_STRIKE[0] - LEAP.crouch]] as const) {
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${name}: a strike of two frames, its blow at its end`);
    assert.ok(held >= 0.3, `${name}: held ${held.toFixed(2)} s`);
    assert.ok(long - hit >= 0.8, `${name}: a big wind-down (${(long - hit).toFixed(2)} s)`);
  }
  // the charge's hold: its antlers still (but for trembling) from its last stamp to its strike
  const st = stage('front', 0, 0, { w: 8, h: 8 });
  let most = 0;
  for (let t = CHARGE.stamps[1] + 0.06; t + 1 / 30 <= CHARGE_STRIKE[0] + 1e-6; t += 1 / 30) {
    const a = st.at(antlerTip(chargePose(t)));
    const b = st.at(antlerTip(chargePose(t + 1 / 30)));
    most = Math.max(most, Math.hypot(a[0] - b[0], a[1] - b[1]) / 2);
  }
  assert.ok(most < 1.5, `the charge's antlers held (${most.toFixed(2)} game pixels a frame)`);
});

test('5. what they leave: crisp, no cyan, not cut off; the frost clear of cyan; the numbers', () => {
  const check = (name: string, p: { px: Px; lights?: ReadonlyArray<{ color: string }> }, mustPaint = false): void => {
    const l = look(p.px, p.lights ?? []);
    assert.ok(l.odd === 0 && l.cyan === null && !l.edge, `${name}: crisp (${l.odd}), no cyan (${l.cyan}), not cut off (${l.edge})`);
    if (mustPaint) assert.ok(l.painted > 30, `${name}: painted`);
  };
  for (const v of ['front', 'back'] as const) {
    for (const d of [HEDGE_AT[0], HEDGE_AT[5], HEDGE_AT[HEDGE_AT.length - 1]]) {
      for (let t = hedgeUp(d) - 0.05; t <= HEDGE_GONE + 0.05; t += 0.1) for (const layer of ['floor', 'air'] as const) check(`hedge ${v} ${d.toFixed(1)} ${layer} ${t.toFixed(2)}`, hedgeClumpPainted(d, t, v, layer));
      check(`hedge ${v} ${d.toFixed(1)} standing`, hedgeClumpPainted(d, hedgeUp(d) + 1, v), true);
    }
    for (let t = -0.6; t <= SLICK.stays + 0.2; t += 0.1) check(`slick ${v} ${t.toFixed(1)}`, slickPainted(t, v));
    check(`slick ${v} lying`, slickPainted(2, v), true);
    for (let t = 0; t <= SLICK.lands + 0.4; t += 1 / 30) for (const side of ['behind', 'before', 'all'] as const) check(`gush ${v} ${side} ${t.toFixed(2)}`, gushPainted(t, v, side));
  }
  for (let t = 0; t <= FROST.seen; t += 0.05) for (const layer of ['floor', 'air'] as const) check(`rime ${layer} ${t.toFixed(2)}`, rimePainted(t, layer));
  check('rime standing', rimePainted(0.4, 'air'), true);
  for (const k of [0, 0.5, 1]) check(`lane ${k}`, lanePainted(1, 0, k, 3, CHARGE.lane, CHARGE.half));
  // THE FROST: grey-white, a little blue (hue 210 to 230, saturation under a fifth): clear of the friend's cyan (hue about 185, saturation over three quarters)
  for (const c of RIME) {
    const [h, s] = hueSat(...(rgba(c).slice(0, 3) as [number, number, number]));
    assert.ok(h >= 210 && h <= 230 && s < 0.2, `the frost's ${c}: hue ${h.toFixed(0)}, saturation ${s.toFixed(2)}`);
  }
  for (const c of CYAN) {
    const [h, s] = hueSat(...(rgba(c).slice(0, 3) as [number, number, number]));
    if (s > 0.4) assert.ok(h < 205 && s > 0.4, `the friend's ${c} is the cyan the frost keeps clear of`);
  }
  // THE NUMBERS: bigger areas than the game's own moves, fast strikes
  assert.ok(GORE9.reach >= DEER_RULES.gore.reach * 1.4 && GORE9.half > DEER_RULES.gore.half * 1.3, 'the gore further and wider');
  assert.ok(CHARGE.pace >= 10 && CHARGE_CARRIED >= 6.5 && CHARGE.lane >= CHARGE_CARRIED && CHARGE.half * 2 >= 1.4 && CHARGE_HIT - CHARGE.aim >= 0.7, 'the charge fast and long, its lane marked well before it');
  assert.ok(Math.abs(chargeCarry(CHARGE.until + 0.5) - CHARGE_CARRIED) < 1e-9 && chargeCarry(CHARGE_STRIKE[0]) === 0, 'carried only from its strike to its stop');
  assert.ok(HEDGE.stays >= 3 && HEDGE.high >= 30 && HEDGE_AT.length >= 12 && inHedge(3, 0, hedgeUp(3) + 1) && !inHedge(3, 1, hedgeUp(3) + 1) && !inHedge(3, 0, HEDGE_GONE + 0.1), 'the hedge a wall along its path, a few seconds');
  assert.ok(LEAP.leap >= 2 * WOLF_RULES.bite.reach && LEAP.half > WOLF_RULES.bite.half && leapStrikes(4.0, 0.5) && !leapStrikes(2.6, 0.8), 'the leap long, its strip wider than the bite');
  assert.ok(PACK.ring >= 2.3 && PACK.beat <= 0.4 && Math.abs(PACK.ring + PACK.past - LEAP.leap) < 1e-9 && Math.abs(LEAP.leap + LEAP.skid - 2 * PACK.ring) < 1e-9 && packOf(5).every((p, i) => Math.abs(p.at - i * PACK.beat) < 1e-9), 'the ring, the beat, through him and on to the ring across');
  assert.ok(GRAB9.fwd[1] >= DROWNED_RULES.grab.reach * 1.5 && GRAB9.half > DROWNED_RULES.grab.half && FROST.r >= 1 && FROST.hold >= 0.5, 'the grab further and wider; frozen a moment');
  assert.ok(SLICK.long >= 3 && SLICK.ang >= 25 && SLICK.stays >= 4 && inCone(2, 0.8) && !inCone(2, 1.6) && SLICK.slow <= 0.6, 'the cone big, the slick lasting, slowing');
});
