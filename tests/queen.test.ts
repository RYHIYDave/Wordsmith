// FLOOR 18'S BOSS, THE QUEEN (src/art/queen.ts, her look and her looking-glass; src/art/queen_moves.ts, her moves;
// src/art/queen_fx.ts, what her moves leave in the hall, the hall's mirrors, and her mirror that talks). A MOCK-UP: NOT
// IN THE GAME, behind QUEEN_ON, off. His brief as offered him (src/art/queen.ts), his pick for how she moves, “Cold and
// slow, then sudden (Recommended)”, his rule 7 (“I need all bosses ran through all checks from now on.  These boss fights
// are important”) and his Movement 9 for every new enemy (“Start from now on, but every enemy is going to need that change
// eventually.  And bigger AOE to compensate for the extra time the player gets to evade”):
//   1. the switch is off, and nothing of the game imports her;
//   2. EVERY MOVE OF HERS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): every frame, from in front and from behind,
//      and every handover; and through the glass, where she is seen at neither end, nothing of her is painted to leap;
//   3. HIS LIGHTNING STRIKES: each of her five blows winds up, holds, strikes in one or two frames and lands on the last;
//      the strike's frames, and the one after, carry its smear; no other frame does;
//   4. every frame paints both ways round: nothing cyan (no colour of the friend's, nothing at the friend's hue, 160 to
//      205, at its saturation), the pink edge while she lives and none as she dies, every pixel whole or empty but the
//      edge; through the glass, none of her;
//   5. NOTHING CUT OFF;
//   6. NOTHING OF HER IN THE FLOOR (her looking-glass stands on it);
//   7. HIS BRIEF: a head and a half taller than the knight; she glides (her feet never down); her crown of glass spikes
//      and her comb, in her hand, its teeth down at rest; the dull pink in her eyes while she lives, gone at the end; her
//      crown cracked and broken as she dies, her comb on the floor; on her knees at the end, not lying; nothing gory (no
//      blood anywhere);
//   8. HER MIRROR at the hall's end: it speaks with a face of fog, the pink in its eyes; as she dies it cracks across, its
//      face clears and the pink leaves its eyes; nothing cyan in it;
//   9. WHAT HER MOVES LEAVE: the poison out in two frames and gone; the hall's mirrors, Shatter's glass and where the
//      reflections step out, nothing cyan; the hall's mirrors burst at her blow and grow back;
//  10. HER SIZES AND SPEEDS: the comb's lunge more than a tile and a half in its two frames, its teeth more than two tiles
//      out; the poison three tiles across; her glide slow (slower than the knight's walk), her steps through the glass a
//      tile and more in two frames; Shatter's lanes across the whole hall, each a tile and a half wide, the gaps between
//      them as wide, no glass ever in a gap, its warning held three quarters of a second and more.
//   run: tsx --test tests/queen.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { HEAD_B, KNIGHT_BODY } from '../src/art/moves3';
import { QN_CANVAS, QN_GLASS, QN_HOVER, QN_SMEAR, QUEEN_BODY, QUEEN_ON, combAt } from '../src/art/queen';
import { QN_COMB, QN_DIES, QN_GLASS_AT, QN_IN, QN_LUNGE, QN_OUT, QN_PACE, QN_SHAPE, QN_SHATTER, QN_STRIKES, QUEEN, awayAt, smearedAt } from '../src/art/queen_moves';
import { ARENA, CLOUD_FX, EMERGE_FX, HALL_GLASS, HALL_MIRRORS, SHATTER_FX, SHATTER_LANES, TALK_FX, cloudPainted, emergePainted, hallMirrorPainted, shardsAt, shatterPainted, talkingMirrorPainted } from '../src/art/queen_fx';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { BLOOD, ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import type { V3 } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const VIEWS = ['front', 'back'] as const;
const MOB: Mob = QUEEN;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
/** The friend's glow: his hue, 160 to 205 (the brief's: the cold blue of glass kept out of it), at the friend's saturation. */
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 120 || max - min < 0.4 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 160 && h <= 205;
}
const cyanIn = (p: Painted): boolean => {
  const { d } = p.px;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) return true;
  }
  return p.lights.some((l) => {
    const [r, g, b] = rgba(l.color);
    return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
  });
};
const pixels = (p: Painted): number => {
  let n = 0;
  for (let i = 3; i < p.px.d.length; i += 4) if (p.px.d[i]) n++;
  return n;
};
const colours = (p: Painted, of: ReadonlyArray<string>): number => {
  const want = new Set(of.map((c) => rgba(c).slice(0, 3).join(',')));
  const { d } = p.px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && want.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move), t));
const stageOf = (): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
};
/** The bits of her own body (not her looking-glass, not what falls from her). */
const HERS = (b: Bit): boolean => !/^(glass|smear)$/.test(b.part);

/** Every frame of every move of hers (the game's frames of each: framesOf), painted on her whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;

/** The game's files that import her (her figure now; her rules and effects as they are built). */
const QUEEN_USERS = 'art/act1_figs/gqueen.ts game/act1_rules/gqueen.ts render/act1_fx/gqueen.ts';

test('1. the switch is off, and of the game only floor 18\'s own files import her', () => {
  assert.equal(QUEEN_ON.on, false, 'QUEEN_ON is off');
  const users: string[] = [];
  const hers = /^art\/queen(_moves|_fx)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (floor 20's shadows of the four royals, art/royal_shadows.ts and art/royal_shadows_fx.ts, a mock-up of their own made from the royals' moves, which nothing of the game imports either: tests/royal_shadows.test.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev') || hers.test(f.replace(/\.ts$/, '')) || /^art\/royal_shadows/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (hers.test(parts.join('/'))) users.push(f);
    }
  }
  // (Brought into the game by the main chat, 30 Oct 2026, on floor 18 behind HIGH_CITY (off): her figure, rules and effects files
  // import her, and nothing else of the game)
  assert.equal([...new Set(users)].sort().join(' '), QUEEN_USERS, 'game files that import her');
});

test('2. EVERY MOVE OF HERS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,glassIn,glassOut,reflect,shatter');
  const found = checkBoss(MOB, QN_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
  // (into the glass and out of another: the game moves her between; she is seen at neither end, so nothing of her leaps)
  const st = stageOf();
  assert.ok(awayAt('glassIn', QN_IN.long) && awayAt('glassOut', 0), 'she is through the glass at the end of the one and the start of the other');
  for (const [move, t] of [['glassIn', QN_IN.long], ['glassOut', 0]] as const) assert.equal(MOB.bits(st, at(move, t)).filter(HERS).length, 0, `${move} @${t}: something of her painted`);
});

test('3. HIS LIGHTNING STRIKES: each blow strikes in one or two frames and lands on the last; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(QN_STRIKES).sort().join(','), 'attack,glassIn,glassOut,reflect,shatter');
  const faults: string[] = [];
  for (const [move, [s0, s1]] of Object.entries(QN_STRIKES)) {
    const n = Math.round((s1 - s0) * 30);
    assert.ok(n >= 1 && n <= 2, `${move}: its strike is ${n} frames`);
    assert.equal(moveOf(move).motion.hit, s1, `${move}: it lands on the strike's last frame`);
    for (const { move: m, view, t, p } of PAINTED) {
      if (m !== move) continue;
      const k = colours(p, QN_SMEAR);
      const want = smearedAt(move, t);
      if (want && k < 12) faults.push(`${said(m, view, t)}: its smear only ${k} pixels`);
      if (!want && k > 0) faults.push(`${said(m, view, t)}: smeared out of its strike (${k})`);
    }
  }
  for (const { move, view, t, p } of PAINTED) if (!QN_STRIKES[move] && colours(p, QN_SMEAR) > 0) faults.push(`${said(move, view, t)}: smeared`);
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink edge while she lives and none as she dies, every pixel whole or empty but the edge; through the glass, none of her', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const st = stageOf();
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { d } = p.px;
    let n = 0;
    let rim = 0;
    let odd = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      n++;
      if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
      if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    }
    const alive = move !== 'dying';
    const away = awayAt(move, t);
    if (cyanIn(p) || odd) faults.push(`${said(move, view, t)}: ${odd} pixels neither whole nor empty${cyanIn(p) ? ', and cyan' : ''}`);
    // (through the glass: only her looking-glass, its shards, the smear of her going; and none of her)
    if (away) {
      if (MOB.bits(st, at(move, t)).filter(HERS).length) faults.push(`${said(move, view, t)}: through the glass, but something of her painted`);
      if (n > 0 && rim === 0 && n > 200) faults.push(`${said(move, view, t)}: her looking-glass without the pink edge`);
    } else if (n < 600 || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  // (and she is away only between stepping in and stepping out)
  for (const move of LIVING) for (const t of framesOf(MOB, move)) if (awayAt(move, t)) assert.ok(move === 'glassIn' ? t > QN_IN.strike[1] : move === 'glassOut' && t < QN_OUT.strike[1], `${move} @${t}: away`);
});

test('5. NOTHING CUT OFF: in every frame, both ways round, she (and her looking-glass, and her comb at its reach) is inside her picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${QN_CANVAS.w}x${QN_CANVAS.h}`);
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!d[(y * w + x) * 4 + 3]) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) continue;
    const room = Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
    least = Math.min(least, room);
    if (room < ROOM) faults.push(`${said(move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest she comes to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  return Math.max(0, -z);
}

test('6. NOTHING OF HER IN THE FLOOR: all she wears and holds, her comb where it falls, her looking-glass on its feet', () => {
  const st = stageOf();
  const faults: string[] = [];
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      // (her grains are what painting her bits laid down: asked of the same moment)
      const m = at(move, t);
      for (const b of MOB.bits(st, m)) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
      }
      for (const [p] of MOB.grains?.(st, m) ?? []) if (p[2] < -0.5) faults.push(`${move} @${t.toFixed(2)}: a grain ${(-p[2]).toFixed(1)} under the floor`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. HIS BRIEF: a head and a half taller; she glides; her crown of glass and her comb; pink eyes while she lives; crowned no more as she dies, her comb on the floor; on her knees, not lying; nothing gory', () => {
  const st = stageOf();
  // a head and a half taller than the knight (his crown 58 up, his head 9.8 from chin to crown): her crown, standing
  const knightHead = 2 * KNIGHT_BODY.headR[2];
  void HEAD_B;
  const s = skeletonAt(MOB, 'stand', 0);
  const crownOfHead = s.head[2] + QUEEN_BODY.headR[2] - QN_HOVER;
  assert.ok(crownOfHead >= KNIGHT_BODY.tall + 1.5 * knightHead - 0.5, `her head's crown ${crownOfHead.toFixed(1)} up, the knight's ${KNIGHT_BODY.tall} and his head ${knightHead.toFixed(1)}`);
  assert.ok(crownOfHead <= KNIGHT_BODY.tall + 2 * knightHead, `and not two heads: ${crownOfHead.toFixed(1)}`);
  // she glides: never a foot down on the floor, standing, gliding, striking or through the glass
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const k = skeletonAt(MOB, move, t);
      assert.ok(Math.min(k.toeL[2], k.toeR[2], k.heelL[2], k.heelR[2]) > 0.8, `${move} @${t.toFixed(2)}: a foot down`);
    }
  }
  // her crown of glass spikes: nine tall ones and nine short, of glass, round a silver circlet; her comb in her right hand
  const stand = MOB.bits(st, at('stand', 0));
  const spikes = stand.filter((b) => b.piece === 'crown' && b.shape.k === 'rod' && b.shape.ramp === QN_GLASS);
  assert.ok(spikes.length >= 18, `her crown's spikes: ${spikes.length}`);
  assert.ok(stand.some((b) => b.piece === 'circlet'), 'its circlet');
  assert.ok(stand.some((b) => b.piece === 'combteeth') && stand.some((b) => b.piece === 'comb'), 'her comb');
  // (weapons rest low: at rest her comb's teeth point down)
  const c = combAt(s);
  assert.ok(c.tip[2] < c.back[0][2] - 6, `its teeth down at rest (${c.tip[2].toFixed(1)} under ${c.back[0][2].toFixed(1)})`);
  // the dull pink in her eyes in every frame she is here, gone at the end of her death
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  for (const move of LIVING) for (const t of framesOf(MOB, move)) if (!awayAt(move, t)) assert.ok(pinkEyes(MOB.bits(st, at(move, t))), `${move} @${t.toFixed(2)}: her eyes not pink`);
  assert.ok(!pinkEyes(MOB.bits(st, dyingMoment(MOB, QN_DIES.long))), 'the pink still in her eyes at the end');
  // her crown cracks and breaks as she dies: the tall spikes snapped to stumps, their tops lying on the floor
  // (a spike still whole tapers to its point; a snapped one ends in its broken stump)
  const tall = (bits: Bit[]): number => bits.filter((b) => b.piece === 'crown' && b.shape.k === 'rod' && b.shape.ramp === QN_GLASS && b.shape.rb < 0.3 && b.shape.ra > 1).length;
  assert.ok(tall(MOB.bits(st, dyingMoment(MOB, 0))) >= 5, 'her crown whole as she is struck');
  assert.equal(tall(MOB.bits(st, dyingMoment(MOB, QN_DIES.long))), 0, 'a tall spike of her crown left whole at the end');
  const last = dyingMoment(MOB, QN_DIES.long);
  MOB.bits(st, last);
  const fallen = (MOB.grains?.(st, last) ?? []).filter(([p, col]) => p[2] < 1.5 && rgba(col)[2] > 150);
  assert.ok(fallen.length >= 9, `its shards on the floor: ${fallen.length}`);
  // her comb fallen from her hand, lying on the floor
  const end = MOB.bits(st, dyingMoment(MOB, QN_DIES.long));
  assert.ok(end.some((b) => b.part === 'fallencomb'), 'her comb on the floor');
  for (const b of end.filter((x) => x.part === 'fallencomb')) if (b.shape.k === 'rod') assert.ok(Math.max(b.shape.a[2], b.shape.b[2]) < 2.5, 'her comb lying flat');
  // not a corpse: on her knees at the end, her head well up off the floor
  const e = skeletonAt(MOB, 'dying', QN_DIES.long);
  assert.ok(e.pelvis[2] < 17, `on her knees: her hips ${e.pelvis[2].toFixed(1)} up`);
  assert.ok(e.head[2] > 34, `upright: her head ${e.head[2].toFixed(1)} up`);
  assert.ok(Math.min(e.kneeL[2], e.kneeR[2]) < 4, 'her knees on the floor');
  // nothing gory: no blood anywhere, in any frame
  for (const { move, view, t, p } of PAINTED) assert.equal(colours(p, BLOOD), 0, `${said(move, view, t)}: blood`);
});

test('8. HER MIRROR: a face of fog that speaks with the pink in its eyes; as she dies it cracks across, its face clears and the pink leaves its eyes; nothing cyan', () => {
  const pinkIn = (p: Painted): number => colours(p, [FLAME[0]]);
  const ink = (p: Painted): number => colours(p, ['#0e0c24']);
  const still = talkingMirrorPainted('still', 0.5);
  const speaking = talkingMirrorPainted('speaking', 1.2);
  assert.equal(pinkIn(still), 0, 'no face, no eyes, while it is still');
  assert.ok(pinkIn(speaking) >= 4, `the pink in its eyes as it speaks: ${pinkIn(speaking)}`);
  const before = talkingMirrorPainted('truth', TALK_FX.crack[0] - 0.05);
  const cracked = talkingMirrorPainted('truth', TALK_FX.crack[1]);
  assert.ok(ink(cracked) > ink(before) + 40, `it cracks across in a flash (${ink(before)} then ${ink(cracked)} of the crack)`);
  const truth = talkingMirrorPainted('truth', TALK_FX.long);
  assert.equal(pinkIn(truth), 0, 'the pink gone from its eyes as it tells the truth');
  // (its face cleared: a clear silver where the fog was)
  const silver = ['#9a9cb4', '#c8cadc', '#eceef6'];
  assert.ok(colours(truth, silver) > colours(speaking, silver) + 60, `its face cleared (${colours(speaking, silver)} then ${colours(truth, silver)})`);
  for (const [mode, long] of [['still', 2], ['speaking', 2], ['truth', TALK_FX.long]] as const) {
    for (let t = 0; t <= long; t += 0.1) assert.ok(!cyanIn(talkingMirrorPainted(mode, t)), `her mirror ${mode} @${t.toFixed(1)}: cyan`);
  }
  // (a prop: no edge of the enemy's)
  assert.equal(talkingMirrorPainted('speaking', 1).px.d.filter((v, i) => i % 4 === 3 && v === RIM_ALPHA).length, 0, 'her mirror has no edge');
});

test('9. WHAT HER MOVES LEAVE: the poison out in two frames and gone; the hall\'s mirrors burst and grow back; nothing cyan anywhere', () => {
  const [b0, b1] = CLOUD_FX.burst;
  assert.ok(Math.round((b1 - b0) * 30) <= 2, 'the poison bursts out in two frames');
  for (const view of VIEWS) {
    const first = pixels(cloudPainted(0, view));
    const out = pixels(cloudPainted(b1, view));
    assert.ok(out > 3 * Math.max(60, first), `${view}: the cloud out at once (${first} then ${out})`);
    assert.equal(pixels(cloudPainted(CLOUD_FX.long + 0.05, view)), 0, `${view}: the cloud gone`);
    for (let t = 0; t <= CLOUD_FX.long; t += 1 / 15) assert.ok(!cyanIn(cloudPainted(t, view)), `the poison ${view} @${t.toFixed(2)}: cyan`);
    for (let t = 0; t < EMERGE_FX.long; t += 1 / 15) assert.ok(!cyanIn(emergePainted(t, view)), `where a reflection steps out ${view} @${t.toFixed(2)}: cyan`);
  }
  // the hall's mirrors: whole and still; trembling; burst at her blow (their glass gone in two frames, their frames left); grown back
  HALL_MIRRORS.forEach((_, i) => {
    const whole = pixels(hallMirrorPainted(i));
    const burst = pixels(hallMirrorPainted(i, SHATTER_FX.burst[1]));
    assert.ok(burst < whole * 0.6 && burst > 40, `mirror ${i}: its glass burst, its frame left (${whole} then ${burst})`);
    assert.ok(pixels(hallMirrorPainted(i, SHATTER_FX.long)) > whole * 0.9, `mirror ${i}: grown back`);
    for (const t of [null, 0.8, SHATTER_FX.burst[0], SHATTER_FX.burst[1], 2.0, 3.0]) assert.ok(!cyanIn(hallMirrorPainted(i, t, true)), `mirror ${i} @${t}: cyan`);
  });
  assert.equal(SHATTER_FX.burst[0], QN_SHATTER.hit, 'the mirrors burst as her blow lands');
  for (let t = 0; t <= SHATTER_FX.long; t += 1 / 10) for (const layer of ['floor', 'air'] as const) assert.ok(!cyanIn(shatterPainted(t, layer)), `Shatter ${layer} @${t.toFixed(1)}: cyan`);
  assert.ok(pixels(shatterPainted(SHATTER_FX.burst[0] + 0.1, 'air')) > 2000, 'a storm of glass');
});

test('10. HER SIZES AND SPEEDS: the comb\'s lunge and reach; the poison three tiles across; her glide slow, the glass sudden; Shatter\'s lanes and gaps across the whole hall', () => {
  // THE COMB: in its two frames she lunges more than a tile and a half; its teeth more than two tiles out from where she stood
  const [s0, s1] = QN_COMB.strike;
  const p0 = skeletonAt(MOB, 'attack', s0).pelvis;
  const p1 = skeletonAt(MOB, 'attack', s1).pelvis;
  assert.ok(p1[0] - p0[0] >= 1.3 * TILE3, `she lunges ${((p1[0] - p0[0]) / TILE3).toFixed(2)} tiles in its two frames`);
  assert.ok(QN_LUNGE >= 1.5 * TILE3, `and comes to rest ${(QN_LUNGE / TILE3).toFixed(2)} tiles on`);
  const tip = QN_SHAPE.tip?.('attack', s1, skeletonAt(MOB, 'attack', s1), posedOfMob(MOB, 'attack', s1)) as V3;
  assert.ok(Math.hypot(tip[0], tip[1]) >= 2 * TILE3, `its teeth ${(Math.hypot(tip[0], tip[1]) / TILE3).toFixed(2)} tiles out`);
  assert.ok(2 * CLOUD_FX.r >= 3 * TILE3 - 1e-6, `the poison ${((2 * CLOUD_FX.r) / TILE3).toFixed(1)} tiles across`);
  // COLD AND SLOW: her glide slower than the knight walks (2.5 tiles a second), but not a crawl
  assert.ok(QN_PACE < 2.5 && QN_PACE >= 1.5, `she glides at ${QN_PACE} tiles a second`);
  assert.equal(MOB.walk.ground, QN_PACE * TILE3, 'her glide painted for her pace');
  // THEN SUDDEN: through the glass in its strike, a tile and more in two frames; out of it the same
  const inBy = skeletonAt(MOB, 'glassIn', QN_IN.strike[1]).pelvis[1] - skeletonAt(MOB, 'glassIn', QN_IN.strike[0]).pelvis[1];
  const outBy = skeletonAt(MOB, 'glassOut', QN_OUT.strike[0]).pelvis[1] - skeletonAt(MOB, 'glassOut', QN_OUT.strike[1]).pelvis[1];
  assert.ok(inBy >= TILE3 * 0.9 && outBy >= TILE3 * 0.9, `through the glass ${(inBy / TILE3).toFixed(2)} and out ${(outBy / TILE3).toFixed(2)} tiles in two frames`);
  assert.ok(skeletonAt(MOB, 'glassIn', QN_IN.strike[1]).pelvis[1] > QN_GLASS_AT.y + 15, 'gone through it');
  // SHATTER: the arena a boss's (20 by 17 tiles); six lanes across the whole hall, each as wide as a mirror, a tile and a
  // half; the gaps between them as wide; its warning held three quarters of a second and more
  assert.equal(Math.round((2 * ARENA.a) / TILE3), 20);
  assert.equal(Math.round((2 * ARENA.b) / TILE3), 17);
  assert.equal(SHATTER_LANES.length, 6);
  for (const [x0, x1] of SHATTER_LANES) assert.ok(x1 - x0 >= 1.4 * TILE3 && Math.abs(x1 - x0 - 2 * HALL_GLASS.half) < 1e-6, `a lane ${((x1 - x0) / TILE3).toFixed(2)} tiles wide`);
  for (let i = 1; i < SHATTER_LANES.length; i++) assert.ok(SHATTER_LANES[i][0] - SHATTER_LANES[i - 1][1] >= 1.4 * TILE3, `a gap ${((SHATTER_LANES[i][0] - SHATTER_LANES[i - 1][1]) / TILE3).toFixed(2)} tiles wide`);
  assert.ok(QN_SHATTER.warn[1] - QN_SHATTER.warn[0] >= 0.75, 'its warning held');
  // (and no glass ever in a gap: every piece in flight, every frame of the storm, over its own lane and no other)
  let seen = 0;
  for (let t = SHATTER_FX.burst[0]; t < SHATTER_FX.burst[0] + SHATTER_FX.fly + 0.2; t += 1 / 30) {
    for (const { lane, p } of shardsAt(t)) {
      seen++;
      const [x0, x1] = SHATTER_LANES[lane];
      assert.ok(p[0] >= x0 && p[0] <= x1, `@${t.toFixed(2)}: glass at ${(p[0] / TILE3).toFixed(2)} tiles along, out of its lane (${(x0 / TILE3).toFixed(2)} to ${(x1 / TILE3).toFixed(2)})`);
      assert.ok((p[0] / ARENA.a) ** 2 + (p[1] / ARENA.b) ** 2 <= 1.02, `@${t.toFixed(2)}: glass beyond the hall`);
    }
  }
  assert.ok(seen > 2000, `the storm: ${seen} pieces of glass seen in flight`);
  // (it flies the whole way across: each lane's glass from its mirror reaches the far side)
  for (let lane = 0; lane < SHATTER_LANES.length; lane++) {
    const ys: number[] = [];
    for (let t = SHATTER_FX.burst[0]; t < SHATTER_FX.burst[0] + SHATTER_FX.fly + 0.2; t += 1 / 30) for (const g of shardsAt(t)) if (g.lane === lane) ys.push(g.p[1]);
    const x = (SHATTER_LANES[lane][0] + SHATTER_LANES[lane][1]) / 2;
    const edge = ARENA.b * Math.sqrt(1 - (x / ARENA.a) ** 2);
    assert.ok(Math.min(...ys) < -edge * 0.8 && Math.max(...ys) > edge * 0.8, `lane ${lane}: its glass across the hall`);
  }
  // (each lane runs from the hall's one side to the other: its glass reaches the far side)
  for (const m of HALL_MIRRORS) {
    const edge = ARENA.b * Math.sqrt(1 - (m.x / ARENA.a) ** 2);
    assert.ok(Math.abs(m.y) <= edge, 'its mirror on the hall\'s edge');
  }
});
