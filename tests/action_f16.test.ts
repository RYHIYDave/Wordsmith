// FLOORS 16 TO 19'S MOBS, MORE ACTION (the art chat's helper, 2 Nov 2026; docs/mockups/action_f16/README.md). His picks of 31 Oct: the
// gardener, “Yes (Recommended)” to the hedge cut; the groom, “Loose the horse (Recommended)”; the palace guard, “Yes (Recommended)” to the
// drill; the masked dancer, “Yes (Recommended)” to the partner throw; the king's knight, “Something unique”, then “The rallying banner”.
// (2 Nov, too many hit-hit-slam combos: the gardener's hedge cut is now his pick “Shear lunge”, the guard's drill his pick “Javelin
// (Recommended)”: docs/mockups/action_fixes/README.md.) So:
//   1. the switches are off; nothing of the game imports the mock-ups; the game's own frames of the five hash the same as on the branch
//      this one came from (tools/action_f16_hash.ts); with the new art, every list but the new moves the game's own, frame for frame (but
//      the knight with his banner, who wears it on his back in every move);
//   2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. ALL FIVE THROUGH THE BOSSES' REVIEW (art/boss_checks.ts checkBoss, every move of theirs, from in front and from behind, with their
//      handing over): nothing found; Movement 9 (held wind-ups, strikes of two frames, smeared, big wind-downs);
//   4. what each sends and leaves (the cut grass, the horse and its mist, the banner standing and cut down, its shockwave and its reach):
//      crisp, no cyan, not cut off; the horse's hooves grip as it gallops;
//   5. THE NUMBERS: bigger areas than the game's own, fast strikes.
//   run: tsx --test tests/action_f16.test.ts

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
import { TILE3, paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { PALACE } from '../src/game/act1_rules/gardener';
import { GARDENER_HEDGE, LUNGE, LUNGE_GARDENER, LUNGE_HIT, LUNGE_STRIKE, LUNGE_TRAVEL_TILES, clippingsPainted, lungeOn, lungeStrikes, makeHedgeArt, snapAt } from '../src/art/action_f16_gardener';
import { GROOM_HORSE, HORSE_STRIDE, LOOSE, WHISTLE_GROOM, WHISTLE_HIT, WHISTLE_STRIKE, gallopPose, horsePainted, horseStrikes, makeWhistleArt, mistPainted } from '../src/art/action_f16_groom';
import { FLIGHT_CANVAS, GUARD_DRILL, JAV, JAV_PARTISAN, JAV_PARTISAN_SWORD, JAV_SWORD, JAV_SWORD_AFTER, PULL, STUCK_CANVAS, THRUST9, THRUST9_HIT, THRUST9_STRIKE, javStrikes, makeJavelinGuardArt, spearFlying, spearStuck, thrustReach, thrustStrikes } from '../src/art/action_f16_guard';
import { DANCER_THROW, LANE_LONG, THROW, THROW_DANCERS, THROW_GENT, THROW_HIT, THROW_LADY, THROW_STRIKE, makeThrowArt, topStrikes } from '../src/art/action_f16_dancer';
import { BANNER, BANNER_AT, BANNER_HIT, BANNER_KNIGHT, BANNER_STRIKE, CLEAVE_KNIGHT, KNIGHT_BANNER, RALLY_CANVAS, bannerPainted, inRally, makeBannerKnightArt, makeCleaveKnightArt, rallyPainted, waveStrikes } from '../src/art/action_f16_knight';
import { PALACE_GARDENER, PALACE_GROOM, makePalaceArt3 } from '../src/art/palace_hands_moves';
import { GUARD_PARTISAN, makeGuardArt3 } from '../src/art/palace_guard_moves';
import { DANCERS, SPIN, makeDancerArt3 } from '../src/art/masque_dancers_moves';
import { KN_CLEAVE, makeKnightArt3 } from '../src/art/kings_knights_moves';
import { SWEEP } from '../src/art/kings_knights_fx';
import { bannerShape, javShape, lungeShape, throwShape, whistleShape } from './action_f16_shapes';
import { paintWithoutCanvas, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

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
      const grey = p.d[i] === p.d[i + 1] && p.d[i + 1] === p.d[i + 2];
      if (!cyan && ((FRIEND.has(k) && !grey) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
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
/** As tools/action_f3_hash.ts and tools/action_f16_hash.ts hash a figure's frames (every list both ways round). */
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
const whole = (m: Record<string, string[]>): string => {
  const h = (nodeCrypto as { createHash(a: string): { update(x: unknown): unknown; digest(e: string): string } }).createHash('sha256');
  h.update(JSON.stringify(m));
  return h.digest('hex').slice(0, 16);
};
/** The game's own frames of the five, on 2bdb29c (origin/art/action-f14-physician, before this branch): tools/action_f16_hash.ts. */
const HASHES: Record<string, string> = { gardener: '76fefe169ef5110e', groom: '5b28c43f7c65296d', pguard: 'e225c6a011ec5b46', 'pguard:1': '6a656bce0cf2c467', dancer: 'd8b44ea2582bf4a3', kknight: 'f62a48cef195f610' };

test('1. the switches are off; nothing of the game imports the mock-ups; the game’s frames the same; only the new moves new', () => {
  for (const sw of [GARDENER_HEDGE, GROOM_HORSE, GUARD_DRILL, DANCER_THROW, KNIGHT_BANNER]) assert.equal(sw.on, false, 'a switch is on');
  const OURS = /from ['"][^'"]*action_f16_(gardener|groom|guard|dancer|knight|scene)['"]/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/action_f16_/.test(f)) continue;
    assert.ok(!OURS.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  for (const k of ['gardener', 'groom', 'pguard', 'dancer', 'kknight'] as const) {
    const fig = act1Fig(k) as NonNullable<ReturnType<typeof act1Fig>>;
    assert.equal(whole(hashMoves(fig.make())), HASHES[k], `${k}: the game's own frames changed`);
    if (k === 'pguard') assert.equal(whole(hashMoves((fig.looks as NonNullable<typeof fig.looks>)[0].make())), HASHES['pguard:1'], 'the sword guard: the game\'s own frames changed');
  }
  // with the new art: every list the game's own but the new moves
  const made: Array<[string, ActorArt, ActorArt, string[], string[]]> = [
    ['gardener', makePalaceArt3(PALACE_GARDENER), makeHedgeArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
    ['groom', makePalaceArt3(PALACE_GROOM), makeWhistleArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
    // (the guard with the javelin: a scabbard at his hip in every frame now, so no list is the game's own)
    ['guard', makeGuardArt3(GUARD_PARTISAN), makeJavelinGuardArt(), [], ['attack', 'moves.javelin']],
    ['lady', makeDancerArt3(DANCERS.lady.violet), makeThrowArt(THROW_LADY), ['idle', 'walk', 'die', 'reel', 'moves.waltz', 'moves.chime'], ['attack']],
    ['knight', makeKnightArt3(), makeCleaveKnightArt(), ['idle', 'walk', 'die', 'reel', 'moves.setOff', 'moves.halt'], ['attack']],
  ];
  for (const [k, game, art, kept, fresh] of made) {
    for (const v of ['front', 'back'] as const) {
      const g = new Map(lists(game[v]));
      const n = new Map(lists(art[v]));
      for (const name of kept) (g.get(name) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (n.get(name) as Sprite[])[i]), 0, `${k} ${v} ${name} ${i}: the game's own`));
      for (const name of fresh) assert.ok(n.has(name), `${k} ${v}: has ${name}`);
    }
  }
  // (2 Nov, his yes: a dancer whose partner is gone just spins into you as before) THE OLD SPIN KEPT in the set with DANCER_THROW on,
  // `moves.spin`, the game's own whirling spin frame for frame (its `attack`), for every room's lady and gentleman
  for (const who of ['lady', 'gent'] as const) {
    for (const room of Object.keys(THROW_DANCERS[who]) as Array<keyof (typeof THROW_DANCERS)['lady']>) {
      const game = makeDancerArt3(DANCERS[who][room]);
      const art = makeThrowArt(THROW_DANCERS[who][room]);
      for (const v of ['front', 'back'] as const) {
        const g0 = game[v].clips?.attack as Clip;
        const n0 = art[v].clips?.moves?.spin as Clip;
        assert.ok(n0 && n0.frames.length === g0.frames.length && n0.hit === g0.hit && n0.fps === g0.fps, `${who} ${room} ${v}: the old spin in the set`);
        if (room === 'violet' || room === 'blue') g0.frames.forEach((sp, i) => assert.equal(unlike(sp, n0.frames[i]), 0, `${who} ${room} ${v} spin ${i}: the game's own`));
      }
    }
  }
  // the knight's cleave, his blow now, the game's own frame for frame
  const g = makeKnightArt3().front.clips?.moves?.cleave as Clip;
  const n = makeCleaveKnightArt().front.clips?.attack as Clip;
  g.frames.forEach((sp, i) => assert.equal(unlike(sp, n.frames[i]), 0, `the cleave ${i}: the game's own`));
  const jm = makeJavelinGuardArt().front.clips?.moves ?? {};
  assert.ok(!('sweep' in jm) && !('drill' in jm) && 'javelin' in jm, 'the javelin in place of the drill (2 Nov), and of the wide sweep');
  assert.ok('pullOut' in (makeJavelinGuardArt(JAV_PARTISAN_SWORD).front.clips?.moves ?? {}), 'the partisan guard with his sword: the pull-out');
  assert.ok(!('cleave' in (makeBannerKnightArt().front.clips?.moves ?? {})) && 'banner' in (makeBannerKnightArt().front.clips?.moves ?? {}), 'the banner in place of the sweep, the cleave his blow');
});

test('2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const arts: Array<[string, Mob, string[]]> = [
    ['gardener', LUNGE_GARDENER, ['attack']],
    ['groom', WHISTLE_GROOM, ['attack']],
    ['partisan', JAV_PARTISAN, ['stand', 'walk', 'attack', 'javelin', 'reel']],
    ['partisan with sword', JAV_PARTISAN_SWORD, ['stand', 'walk', 'attack', 'pullOut', 'reel']],
    ['sword', JAV_SWORD, ['stand', 'walk', 'attack', 'javelin']],
    ['sword after', JAV_SWORD_AFTER, ['stand', 'walk']],
    ['gent', THROW_GENT, ['attack']],
    ['lady', THROW_LADY, ['attack']],
    ['banner knight', BANNER_KNIGHT, ['banner', 'stand', 'walk', 'attack', 'reel', 'setOff', 'halt']],
  ];
  for (const [who, mob, moves] of arts) {
    for (const v of ['front', 'back'] as const) {
      for (const m of moves) {
        for (const t of framesOf(mob, m)) {
          const p = paintMob(mob, m, t, v);
          const l = look(p.px, p.lights);
          assert.ok(l.painted > 300 && l.rim > 30, `${who} ${v} ${m} ${t.toFixed(3)}: painted (${l.painted}), the pink edge (${l.rim})`);
          assert.equal(l.odd, 0, `${who} ${v} ${m} ${t.toFixed(3)}: not crisp`);
          assert.equal(l.cyan, null, `${who} ${v} ${m} ${t.toFixed(3)}: a friend's colour`);
          assert.ok(!l.edge, `${who} ${v} ${m} ${t.toFixed(3)}: cut off`);
        }
      }
    }
  }
});

test('3. all five through the bosses’ review, both ways round: nothing found; Movement 9', () => {
  const said: string[] = [];
  const rows: Array<[string, Mob, ReturnType<typeof lungeShape>]> = [
    ['gardener', LUNGE_GARDENER, lungeShape()],
    ['groom', WHISTLE_GROOM, whistleShape()],
    ['partisan', JAV_PARTISAN, javShape(JAV_PARTISAN)],
    ['partisan with sword', JAV_PARTISAN_SWORD, javShape(JAV_PARTISAN_SWORD)],
    ['sword', JAV_SWORD, javShape(JAV_SWORD)],
    ['gent', THROW_GENT, throwShape(THROW_GENT)],
    ['lady', THROW_LADY, throwShape(THROW_LADY)],
    ['banner knight', BANNER_KNIGHT, bannerShape(BANNER_KNIGHT)],
    ['cleave knight', CLEAVE_KNIGHT, bannerShape(CLEAVE_KNIGHT)],
  ];
  for (const [name, mob, shape] of rows) for (const f of findingsSaid(checkBoss(mob, shape))) said.push(`${name}: ${f}`);
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
  const strikes: Array<[string, readonly [number, number], number, number, number]> = [
    ['shear lunge', LUNGE_STRIKE, LUNGE_HIT, LUNGE.long, LUNGE.held - LUNGE.crouch],
    ['whistle', WHISTLE_STRIKE, WHISTLE_HIT, LOOSE.long, WHISTLE_STRIKE[0] - LOOSE.up],
    ['thrust', THRUST9_STRIKE, THRUST9_HIT, THRUST9.long, THRUST9_STRIKE[0] - THRUST9.drawn],
    ['javelin', JAV.partisan.strike, JAV.partisan.hit, JAV.partisan.long, JAV.partisan.strike[0] - JAV.partisan.haul],
    ['javelin (sword guard)', JAV.sword.strike, JAV.sword.hit, JAV.sword.long, JAV.sword.strike[0] - JAV.sword.haul],
    ['throw', THROW_STRIKE, THROW_HIT, THROW.gent, THROW_STRIKE[0] - THROW.fast],
    ['banner', BANNER_STRIKE, BANNER_HIT, BANNER.long, BANNER_STRIKE[0] - BANNER.raised],
    ['cleave', KN_CLEAVE.strike, KN_CLEAVE.hit, KN_CLEAVE.long, KN_CLEAVE.warn[1] - KN_CLEAVE.warn[0]],
  ];
  for (const [name, [a, b], hit, long, held] of strikes) {
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${name}: a strike of two frames, its blow at its end`);
    assert.ok(held >= 0.2, `${name}: held ${held.toFixed(2)} s`);
    assert.ok(long - hit >= 0.8, `${name}: a big wind-down (${(long - hit).toFixed(2)} s)`);
  }
  // (2 Nov: neither is a combo of blows ending in a slam now: one strike each)
  assert.ok(LUNGE.held - LUNGE.crouch >= 0.6, 'the crouch held long');
});

test('4. what they send and leave: crisp, no cyan, not cut off; the horse’s hooves grip', () => {
  const check = (name: string, p: { px: Px; lights?: ReadonlyArray<{ color: string }> }, mustPaint = false): void => {
    const l = look(p.px, p.lights ?? []);
    assert.ok(l.odd === 0 && l.cyan === null && !l.edge, `${name}: crisp (${l.odd}), no cyan (${l.cyan}), not cut off (${l.edge})`);
    if (mustPaint) assert.ok(l.painted > 30, `${name}: painted`);
  };
  for (let t = 0; t <= 1.8; t += 0.05) for (const layer of ['floor', 'air'] as const) for (const big of [0.4, 1]) check(`clippings ${layer} ${big} ${t.toFixed(2)}`, clippingsPainted(t, layer, 'all', big));
  for (const v of ['front', 'back'] as const) {
    for (let t = 0; t <= 1.3; t += 1 / 30) check(`horse ${v} ${t.toFixed(2)}`, horsePainted(t, v, 1), true);
    for (let t = 0; t <= 3; t += 0.1) check(`banner ${v} ${t.toFixed(1)}`, bannerPainted(t, v), true);
    for (let c = 0; c <= 1.6; c += 0.05) check(`banner cut ${v} ${c.toFixed(2)}`, bannerPainted(2, v, -1, c));
    for (let s = 0; s <= 0.4; s += 0.05) check(`banner struck ${v} ${s.toFixed(2)}`, bannerPainted(2, v, s), true);
  }
  for (let t = 0; t <= 0.9; t += 0.05) check(`mist ${t.toFixed(2)}`, mistPainted(t));
  // (2 Nov) the javelin in flight and stuck, both guards', both ways round
  for (const who of ['partisan', 'sword'] as const) {
    for (const v of ['front', 'back'] as const) {
      for (let u = 0; u <= 0.4; u += 1 / 30) check(`${who} flying ${v} ${u.toFixed(2)}`, spearFlying(who, u, 4.6, v), true);
      for (let u = 0; u <= 1.2; u += 1 / 30) check(`${who} stuck ${v} ${u.toFixed(2)}`, spearStuck(who, u, v), true);
    }
  }
  void FLIGHT_CANVAS;
  void STUCK_CANVAS;
  for (let t = 0; t <= 4; t += 0.1) for (const layer of ['floor', 'air'] as const) check(`rally ${layer} ${t.toFixed(1)}`, rallyPainted(t, layer));
  for (let c = 0; c <= 1.0; c += 0.05) check(`rally cut ${c.toFixed(2)}`, rallyPainted(2, 'air', c));
  // the horse's hooves grip: a hoof that is down goes back under it as fast as it gallops (so it stays where it came down)
  const v = LOOSE.pace * TILE3;
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 120; k++) {
      const a = k / 120;
      const b = (k + 1) / 120;
      const s0 = gallopPose(a).soles[i];
      const s1 = gallopPose(b).soles[i];
      if (s0[2] > 1e-6 || s1[2] > 1e-6) continue;
      const moved = s1[0] - s0[0] + v * HORSE_STRIDE * (b - a);
      assert.ok(Math.abs(moved) < 1e-6, `hoof ${i} slides at ${a.toFixed(3)} (${moved.toFixed(3)})`);
    }
  }
});

/** The game's palace guard's thrust (game/act1_rules/pguard.ts PGUARD: the partisan's point carried to 2.693 tiles, 0.6 more, 0.65 to either
 * side): not imported here, its rules and the game's monsters' index importing each other. */
const PGUARD = { thrust: { out: [2.693, 1.58], half: 0.65 }, more: 0.6 } as const;
test('5. the numbers: bigger areas than the game’s own, fast strikes', () => {
  // THE SHEAR LUNGE (2 Nov): three tiles in two frames, a lane further and wider than the snap, the blades shut at its end
  const [sx] = snapAt();
  assert.ok(lungeOn(LUNGE_HIT) - lungeOn(LUNGE_STRIKE[0]) >= 2.8 && LUNGE.lane >= PALACE.snap.out + PALACE.snap.more && LUNGE.half * 2 >= PALACE.snap.half * 2 && sx >= 3 && lungeStrikes(2, 0.8) && lungeStrikes(sx + 1.1, 0) && !lungeStrikes(1.5, 1.2) && LUNGE_TRAVEL_TILES > 3, 'the lunge three tiles in two frames, its lane, the snap at its end');
  // THE HORSE: a long line, fast; it strikes on the line as it comes by, not off it
  assert.ok(LOOSE.lane >= 12 && LOOSE.pace >= 10 && LOOSE.half * 2 >= 1.8 && WHISTLE_STRIKE[0] - LOOSE.aim >= 0.4, 'a long, fast line, marked well before');
  assert.ok(horseStrikes((5 - LOOSE.from[0]) / LOOSE.pace, 5, 0, 5, 0) && !horseStrikes((5 - LOOSE.from[0]) / LOOSE.pace, 5, 0, 5, 1.3), 'the horse strikes on the line');
  // THE GUARD: the thrust's line longer and wider than the game's; the javelin (2 Nov) thrown far, its burst 1.6 round where it sticks
  const [rx] = thrustReach(JAV_PARTISAN);
  assert.ok(rx + THRUST9.more >= PGUARD.thrust.out[0] + PGUARD.more && THRUST9.half >= PGUARD.thrust.half && thrustStrikes(JAV_PARTISAN, rx + 0.5, 0.7) && !thrustStrikes(JAV_PARTISAN, rx + 0.5, 1.1), 'the thrust longer and wider');
  assert.ok(JAV.r >= 1.5 && JAV.far >= 6 && javStrikes(1.5, 0.3) && !javStrikes(1.8, 0) && JAV.partisan.strike[0] - JAV.partisan.haul >= 0.4 && PULL.long >= 2, 'the javelin: far, its burst, held, a pull-out');
  // THE THROW: a lane far longer than the spin's lunge, its area as wide
  assert.ok(LANE_LONG >= 8 && LANE_LONG > SPIN.lunge * 5 && THROW.half * 2 >= 1.6 && topStrikes(0.3, 3.5, 0.5) === true && THROW_STRIKE[0] - THROW.take >= 0.6, 'she is flung a long way, marked well before');
  // THE BANNER: its shockwave and its reach
  // (2 Nov, his pick: “About twice, 7 tiles (Recommended)”) its reach 7 tiles round where it stands (it was 3.5)
  const [bx, by] = BANNER_AT;
  assert.ok(BANNER.wave >= 2 && BANNER.reach === 7 && waveStrikes(2, 0), 'the banner\'s shockwave; its reach 7 tiles');
  assert.ok(inRally(bx + 6.9, by) && inRally(bx - 4.9, by + 4.9) && inRally(bx + 3.5, by + 3) && !inRally(bx + 7.1, by) && !inRally(bx, by - 7.2), 'within 7 tiles of it, and only within');
  // its gold drawn to match: the ring at 7 tiles round, inside the floor's picture (nothing cut off), a faint glow within, not a wash
  const fl = rallyPainted(2, 'floor');
  const C = RALLY_CANVAS;
  let ring = 0;
  let inner = 0;
  let innerAll = 0;
  for (let Y = 0; Y < fl.px.h; Y++) {
    for (let X = 0; X < fl.px.w; X++) {
      const a = (X + 0.5 - C.ax) / 32;
      const b = (Y + 0.5 - C.ay) / 16;
      const d = Math.hypot((a + b) / 2, (b - a) / 2);
      const lit = fl.px.d[(Y * fl.px.w + X) * 4 + 3] > 0;
      if (Math.abs(d - BANNER.reach) < 0.2 && lit) ring++;
      if (d < BANNER.reach - 1 && d > 1) {
        innerAll++;
        if (lit) inner++;
      }
    }
  }
  assert.ok(ring > 1200, `the ring at its edge (${ring} pixels)`);
  assert.ok(inner > 0.01 * innerAll && inner < 0.06 * innerAll, `a faint glow within: ${((100 * inner) / innerAll).toFixed(1)}% of the floor inside`);
  assert.ok(SWEEP.r > 0, 'the sweep it replaces');
});
