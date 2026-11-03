// FLOORS 11 TO 15'S MOBS, MORE ACTION (the art chat's helper, 1 Nov 2026; docs/mockups/action_f11/README.md). His picks of 31 Oct, each
// “Yes (Recommended)”: the Hushed watchman, “His basic becomes a halberd chop. Lantern throw, in place of the spin”; the reaper and gleaner,
// “Harvest”; the orderly, “Gurney charge, in place of the leap”; and of the Bookwarden's barrage, “I like the book barrage but it’s more
// just a rapid series of projectiles”. So:
//   1. the switches are off; nothing of the game imports the mock-ups; the game's own frames of the four hash the same as on the branch
//      this one came from (tools/action_f11_hash.ts); with the new art, every list but the new moves the game's own, frame for frame (but
//      the watch's, who wear the lantern at the belt in every move now);
//   2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. ALL FOUR THROUGH THE BOSSES' REVIEW (art/boss_checks.ts checkBoss, on the heroes' bones, from in front and from behind, with their
//      handing over from every frame of their stand and back): nothing found; Movement 9 (held wind-ups, strikes of two frames, smeared,
//      big wind-downs); the watch in every move of theirs, the lantern with them;
//   4. what each sends and leaves (the bite and the split, the lantern in flight, the burning oil, the chaff, the gurney and its crash, the
//      books): crisp, no cyan, not cut off;
//   5. THE NUMBERS: bigger areas than the game's own, fast strikes.
//   run: tsx --test tests/action_f11.test.ts

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
import { paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { FIELDHAND } from '../src/game/act1_rules/fieldhand';
import { ORDERLY as ORDERLY_RULES } from '../src/game/act1_rules/orderly';
import { BOOKWARDEN as WARDEN_RULES } from '../src/game/act1_rules/bookwarden';
import { CHOP, CHOP_HIT, CHOP_STRIKE, LANTERN_SERGEANT, LANTERN_WATCHMAN, LOB, LOB_HIT, LOB_STRIKE, OIL, POOL, WATCH_LANTERN, bitePainted, biteAt, chopStrikes, inOil, lanternFlying, lobArc, lobFly, makeLanternWatchArt, oilPainted } from '../src/art/action_f11_watch';
import { BOOM, BOOM_CATCH, BOOM_GLEANER, BOOM_HIT, BOOM_REAPER, BOOM_STRIKE, FIELD_HARVEST, boomAt, boomStrikes, chaffPainted, curvePainted, makeHarvestArt, sicklePainted } from '../src/art/action_f11_field';
import { BLOW9, BLOW_HIT, BLOW_STRIKE, GURNEY, GURNEY_HIT, GURNEY_ORDERLY, GURNEY_STRIKE, ORDERLY_GURNEY, blowStrikes, crashPainted, gurneyGone, gurneyPainted, gurneyStrikes, makeGurneyOrderlyArt } from '../src/art/action_f11_orderly';
import { BARRAGE, BARRAGE_HIT, BARRAGE_STRIKE, BARRAGE_WARDEN, SLAM9, SLAM_HIT, SLAM_STRIKE, WARDEN_BARRAGE, bookAt, bookGoes, bookPainted, bookStrikes, makeBarrageWardenArt, slamStrikes } from '../src/art/action_f11_warden';
import { makeWatchArt3 } from '../src/art/hushed_watch_moves';
import { makeFieldArt3 } from '../src/art/fieldhands_moves';
import { makeOrderlyArt3 } from '../src/art/orderlies_moves';
import { makeBookwardenArt3 } from '../src/art/bookwardens_moves';
import { barrageShape, boomShape, gurneyShape, lanternShape } from './action_f11_shapes';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

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
/** As tools/action_f3_hash.ts and tools/action_f11_hash.ts hash a figure's frames (every list both ways round). */
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
const KINDS = ['watch', 'fieldhand', 'orderly', 'bookwarden'] as const;
/** The game's own frames of the four, on 3162e05 (origin/art/action-f9-stag, before this branch): tools/action_f11_hash.ts. */
const HASHES: Record<(typeof KINDS)[number], string> = { watch: 'c3413bcd1a90928e', fieldhand: 'daaa89f2fb62922b', orderly: 'e439e6af0e3c0014', bookwarden: 'e163b6c454bcb810' };

test('1. the switches are off; nothing of the game imports the mock-ups but what brings them in; the game’s frames the same; only the new moves new', () => {
  for (const sw of [WATCH_LANTERN, FIELD_HARVEST, ORDERLY_GURNEY, WARDEN_BARRAGE]) assert.equal(sw.on, false, 'a switch is on');
  const OURS = /from ['"][^'"]*action_f11_(watch|field|orderly|warden|scene)['"]/;
  // (brought in by the main chat, 2 Nov 2026, behind the switches: only through each one's figure, rules and what it leaves)
  const BRINGS = /^(art\/act1_figs|game\/act1_rules|render\/act1_fx)\/(watch|fieldhand|orderly|bookwarden)\.ts$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || BRINGS.test(f) || /^art\/action_f11_/.test(f)) continue;
    assert.ok(!OURS.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  for (const k of KINDS) assert.equal(whole(hashMoves((act1Fig(k) as NonNullable<ReturnType<typeof act1Fig>>).make())), HASHES[k], `${k}: the game's own frames changed`);
  // with the new art: every list the game's own but the new moves (the watch: the lantern at the belt now in every one of them)
  const made: Array<[string, ActorArt, ActorArt, string[], string[]]> = [
    ['reaper', makeFieldArt3(), makeHarvestArt(), ['idle', 'walk', 'die', 'reel'], ['attack']],
    ['orderly', makeOrderlyArt3(), makeGurneyOrderlyArt(), ['idle', 'walk', 'die', 'reel'], ['attack', 'moves.gurney']],
    ['warden', makeBookwardenArt3(), makeBarrageWardenArt(), ['idle', 'walk', 'die', 'reel'], ['attack', 'moves.barrage']],
    ['watch', makeWatchArt3(), makeLanternWatchArt(), [], ['attack', 'moves.lantern']],
  ];
  for (const [k, game, art, kept, fresh] of made) {
    for (const v of ['front', 'back'] as const) {
      const g = new Map(lists(game[v]));
      const n = new Map(lists(art[v]));
      for (const name of kept) (g.get(name) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (n.get(name) as Sprite[])[i]), 0, `${k} ${v} ${name} ${i}: the game's own`));
      for (const name of fresh) assert.ok(n.has(name), `${k} ${v}: has ${name}`);
    }
  }
  assert.ok(!('round' in (makeLanternWatchArt().front.clips?.moves ?? {})), 'the lantern throw in place of the round sweep');
  assert.ok(!('quake' in (makeGurneyOrderlyArt().front.clips?.moves ?? {})), 'the gurney charge in place of the quake');
  assert.ok(!('storm' in (makeBarrageWardenArt().front.clips?.moves ?? {})), 'the barrage in place of the page storm');
});

test('2. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const arts: Array<[string, Mob, string[]]> = [
    ['watchman', LANTERN_WATCHMAN, ['attack', 'lantern', 'stand', 'walk', 'reel']],
    ['sergeant', LANTERN_SERGEANT, ['attack', 'lantern']],
    ['reaper', BOOM_REAPER, ['attack']],
    ['gleaner', BOOM_GLEANER, ['attack']],
    ['orderly', GURNEY_ORDERLY, ['attack', 'gurney']],
    ['warden', BARRAGE_WARDEN, ['attack', 'barrage']],
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

test('3. all four through the bosses’ review, both ways round: nothing found; Movement 9', () => {
  const said: string[] = [];
  for (const mob of [LANTERN_WATCHMAN, LANTERN_SERGEANT]) for (const f of findingsSaid(checkBoss(mob, lanternShape(mob)))) said.push(`${mob.id}: ${f}`);
  for (const mob of [BOOM_REAPER, BOOM_GLEANER]) for (const f of findingsSaid(checkBoss(mob, boomShape(mob)))) said.push(`${mob.id}: ${f}`);
  for (const f of findingsSaid(checkBoss(GURNEY_ORDERLY, gurneyShape()))) said.push(`orderly: ${f}`);
  for (const f of findingsSaid(checkBoss(BARRAGE_WARDEN, barrageShape()))) said.push(`warden: ${f}`);
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
  const strikes: Array<[string, readonly [number, number], number, number, number]> = [
    ['chop', CHOP_STRIKE, CHOP_HIT, CHOP.long, CHOP_STRIKE[0] - CHOP.up],
    ['lantern', LOB_STRIKE, LOB_HIT, LOB.long, LOB_STRIKE[0] - LOB.back],
    ['sickle boomerang', BOOM_STRIKE, BOOM_HIT, BOOM.long, BOOM_STRIKE[0] - BOOM.drawn],
    ['mallet', BLOW_STRIKE, BLOW_HIT, BLOW9.long, BLOW_STRIKE[0] - BLOW9.raised],
    ['gurney', GURNEY_STRIKE, GURNEY_HIT, GURNEY.long0, GURNEY_STRIKE[0] - GURNEY.up],
    ['slam', SLAM_STRIKE, SLAM_HIT, SLAM9.long, SLAM_STRIKE[0] - 0.32],
    ['barrage', BARRAGE_STRIKE, BARRAGE_HIT, BARRAGE.long, BARRAGE_STRIKE[0] - BARRAGE.up],
  ];
  for (const [name, [a, b], hit, long, held] of strikes) {
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${name}: a strike of two frames, its blow at its end`);
    assert.ok(held >= 0.3, `${name}: held ${held.toFixed(2)} s`);
    assert.ok(long - hit >= 0.8, `${name}: a big wind-down (${(long - hit).toFixed(2)} s)`);
  }
  // (2 Nov: the harvest, a combo ending in a hook, is now the sickle boomerang: one throw)
});

test('4. what they send and leave: crisp, no cyan, not cut off', () => {
  const check = (name: string, p: { px: Px; lights?: ReadonlyArray<{ color: string }> }, mustPaint = false): void => {
    const l = look(p.px, p.lights ?? []);
    assert.ok(l.odd === 0 && l.cyan === null && !l.edge, `${name}: crisp (${l.odd}), no cyan (${l.cyan}), not cut off (${l.edge})`);
    if (mustPaint) assert.ok(l.painted > 30, `${name}: painted`);
  };
  for (const [dx, dy] of [[1, 0], [0, -1]] as const) for (let t = 0; t <= CHOP.seen; t += 0.05) for (const layer of ['floor', 'air'] as const) check(`bite ${dx},${dy} ${layer} ${t.toFixed(2)}`, bitePainted(t, layer, dx, dy));
  check('bite', bitePainted(0.3, 'floor', 1, 0), true);
  for (let t = 0; t <= 1; t += 0.05) check(`lantern flying ${t.toFixed(2)}`, lanternFlying(t), true);
  for (let t = 0; t <= POOL.burn; t += 0.1) for (const layer of ['floor', 'air'] as const) check(`oil ${layer} ${t.toFixed(1)}`, oilPainted(t, layer));
  check('oil burning', oilPainted(2, 'floor'), true);
  for (let t = 0; t <= 1.8; t += 0.05) for (const layer of ['floor', 'air'] as const) check(`chaff ${layer} ${t.toFixed(2)}`, chaffPainted(t, layer));
  // (2 Nov) the sickle spinning out and back, both ways round; its curve marked
  for (const v of ['front', 'back'] as const) {
    for (let t = BOOM_HIT + 1 / 30; t < BOOM_CATCH; t += 1 / 30) check(`sickle ${v} ${t.toFixed(2)}`, sicklePainted(t, v), true);
    for (let k = 0.1; k <= 1; k += 0.3) check(`curve ${v} ${k.toFixed(1)}`, { px: curvePainted(k, v) }, true);
  }
  for (const v of ['front', 'rear'] as const) {
    for (let t = 0; t <= 1; t += 0.05) check(`gurney ${v} ${t.toFixed(2)}`, gurneyPainted(t, v), true);
    for (let c = 0; c <= 1; c += 0.05) check(`gurney crashed ${v} ${c.toFixed(2)}`, gurneyPainted(0.6, v, c), true);
  }
  for (let t = 0; t <= 1.2; t += 0.05) for (const layer of ['floor', 'air'] as const) check(`crash ${layer} ${t.toFixed(2)}`, crashPainted(t, layer));
  for (let s = 0; s < 6.3; s += 0.4) for (const c of [0, 1, 2]) for (const lying of [false, true]) check(`book ${s.toFixed(1)} ${c} ${lying}`, { px: bookPainted(s, c, lying, 1) }, true);
  // the oil-fire is warm: never the friend's cyan
  for (const c of OIL) assert.ok(!cyanGlow(...(rgba(c).slice(0, 3) as [number, number, number])), `oil ${c}`);
});

/** The game's sweep, straight before them, reaches 2.646 tiles (game/act1_rules/watch.ts WATCH.sweep.at, frame 24: not imported here, its rules
 * and the game's monsters' index importing each other). */
const SWEEP_REACH = 2.646;
test('5. the numbers: bigger areas than the game’s own, fast strikes', () => {
  // THE CHOP: its bite and the split before him, out past the sweep's reach straight before him
  const [bx] = biteAt();
  assert.ok(bx >= 1.6 && CHOP.split >= SWEEP_REACH + 1 && CHOP.r >= 1.2 && chopStrikes(3.5, 0) && !chopStrikes(3.5, 1.2) && chopStrikes(bx, 1.0), 'the chop bites well out, the floor splits on past the sweep');
  // THE LANTERN: lobbed high and far; the oil bigger than the firepot's and lasting
  assert.ok(lobFly(5) <= 1 && lobArc(5) >= 70 && LOB.far >= 7 && POOL.r >= 1.6 && POOL.burn >= 5 && inOil(1.5, 0, 2) && !inOil(1.5, 0, POOL.burn + 0.1), 'the throw far, the oil wide and lasting');
  assert.ok(LOB_HIT - LOB.back >= 0.3, 'the throw held');
  // THE SICKLE BOOMERANG (2 Nov): out about six tiles in a wide curve and back; it strikes going out and coming back, not off its way
  const far = Math.max(...Array.from({ length: 60 }, (_, i) => (boomAt(BOOM_HIT + 0.01 + (BOOM.fly - 0.02) * i / 59) as { x: number }).x));
  const mid = boomAt(BOOM_HIT + BOOM.fly * 0.25) as { x: number; y: number };
  const back = boomAt(BOOM_HIT + BOOM.fly * 0.75) as { x: number; y: number };
  assert.ok(far >= 5.6 && far <= 6.4 && Math.abs(mid.y - back.y) >= 2.5 && boomStrikes(BOOM_HIT + BOOM.fly * 0.25, mid.x, mid.y + 0.5) === 'out' && boomStrikes(BOOM_HIT + BOOM.fly * 0.75, back.x + 0.4, back.y) === 'back' && boomStrikes(BOOM_HIT + BOOM.fly * 0.25, mid.x, mid.y + 1.5) === null && BOOM_STRIKE[0] - BOOM.drawn >= 0.3 && BOOM.long - BOOM_CATCH >= 0.5, 'the boomerang: six tiles out, a wide curve, struck going out and back, held before, a stagger after');
  void FIELDHAND;
  // THE ORDERLY: the blow's ring twice the game's; the gurney fast and long
  assert.ok(BLOW9.r >= ORDERLY_RULES.blow.r * 2 && blowStrikes(1.4, 1.2) && !blowStrikes(1.4, 1.8), 'the mallet ring twice the game\'s');
  assert.ok(GURNEY.pace >= 8 && GURNEY.lane >= 9 && GURNEY.half * 2 >= 1.4 && GURNEY.r >= 1.4 && gurneyGone(0.5) > 3 && gurneyStrikes(3, GURNEY.at + 3, 0.5) && !gurneyStrikes(3, GURNEY.at + 3, 1.2) && GURNEY_HIT - GURNEY.aim >= 0.6, 'the gurney fast, its lane marked well before it');
  // THE BOOKWARDEN: the slam's dust wider than the game's; the barrage a rapid stream
  assert.ok(SLAM9.reach >= WARDEN_RULES.slam.reach * 1.3 && slamStrikes(1.9, 1.6) === true, 'the slam wider');
  const aim = (): [number, number] => [5, 0];
  assert.ok(BARRAGE.n >= 8 && BARRAGE.every <= 0.1 && BARRAGE.pace >= 10 && bookGoes(BARRAGE.n - 1) - BARRAGE_HIT <= 0.7, 'a rapid stream');
  let struck = 0;
  for (let i = 0; i < BARRAGE.n; i++) for (let t = bookGoes(i); t < bookGoes(i) + 0.8; t += 1 / 60) if (bookStrikes(i, t, aim, 5, 0)) {
    struck++;
    break;
  }
  assert.ok(struck >= BARRAGE.n - 2, `the books at where he stands strike him (${struck})`);
  const b = bookAt(0, bookGoes(0) + 0.3, aim);
  assert.ok(b.flying && b.x > 2, 'flung out at him');
});
