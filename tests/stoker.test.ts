// FLOOR 3'S SIDE BOSS, THE STOKER, AND HIS FURNACE ROOM (src/art/stoker.ts, his look; src/art/stoker_moves.ts, his moves;
// src/art/stoker_fx.ts, what his fire does on the floor; src/art/stoker_room.ts, the furnace, the forge crank, the gear and the fire
// in the Chained One's way). A MOCK-UP: NOT IN THE GAME, behind STOKER_ON, off. His pick, 4 Nov 2026: “The Stoker (Recommended)”.
// Held as the Rime Shade and the bosses done the action way are:
//   1. the switch is off, and nothing of the game imports any of it;
//   2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`: he is on the heroes' bones), every frame, from in
//      front and from behind (truly from behind), and every handover;
//   3. HIS LIGHTNING STRIKES (Movement 9): each of his three attacks strikes in two frames, landing on the second; smeared then,
//      and in no other frame;
//   4. every frame paints both ways round: nothing cyan, the pink rim while he lives and none as he dies, every pixel whole or empty
//      but the rim (crisp); 5. nothing cut off; 6. nothing of him in the floor;
//   7. THE SHOVEL IN HIS HAND in every frame he holds it (his right fist on it, his left on its haft when it holds it); his eyes the
//      enemy's pink, his fire an honest orange;
//   8. his size (twice the knight's height) and his numbers (his walk, each attack's held wind-up and its marks before it comes);
//   9. what his fire does on the floor, painted: crisp, no cyan, marked in pink before it comes, fire after;
//  11. NOTHING OF HIM THROUGH WHAT HE WEARS (his pick of 6 Nov 2026, “Reshape his body first (Recommended)”: forged iron plates
//      over real muscle; his rulebook: plates and cloth over what they cover, no limb poking through a plate): every pixel of his
//      muscle that is seen, in every frame of every move, from in front, behind and either side, put back where it is on him: not
//      one where a plate or his skirt covers it (art/stoker.ts `coverOf`); and the check sees one (a plate taken off);
//  12. NOTHING OF HIM FLOATING (6 Nov 2026, the flue seen floating clear of him as he slumped in his death): his flue's foot set
//      in his firebox and its pixels joined to his firebox's, in every frame of every move both ways round, till he bursts;
//  13. HIS DEATH, THE FURNACE EXPLODES (his pick of 6 Nov 2026, “Furnace explodes (Recommended)”): the overload held a second
//      and more, the burst in two frames; whole till then, nothing of his body after; his shovel in his fist till he lets it go,
//      then lying still; every piece of him down by `down`, lying on the floor and still to the end; no pink or gold in his
//      death's fire or its lights; the blast on the floor (the shockwave, the scorch) crisp, no cyan;
//  10. THE FURNACE ROOM'S PIECES: every picture painted, crisp, no cyan but the crank's handle when it is ready; the furnace lit and
//      out, the crank without its gear and with it, the gear's icon at the items' size with its white rim, the fire and its going out;
//      their made copies let go by `forgetMade`.
//   run: tsx --test tests/stoker.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { EMBER } from '../src/art/props';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintBits, paintMob, paintViewOf, partOrder } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Sheet, Stage } from '../src/art/skin';
import { add, len, sub } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { ST_CANVAS, ST_SMEAR, STOKER_ON, armBody, armPlates, coverOf, domeOf, flueOf, hemOf, inEgg, legBody, lowestPainted, shovelOf, turnedPoint, turnedShape } from '../src/art/stoker';
import { GEAR_REST, STOKER, ST_BURST, ST_COALS, ST_DIES, ST_PACE, ST_RAKE, ST_SHAPE, ST_STRIKES, smearedAt, stokerBonesOf, stokerNumbersAt } from '../src/art/stoker_moves';
import { BLAST, COALS, COAL_FIRE, COAL_SPOTS, FX_PINK, RAKE_FIRE, RING, blastAt, coalLands, fxPainted, inGap, rakePasses, ringAt } from '../src/art/stoker_fx';
import { CRANK_TURN, FIRE_WALL, FURNACE, FURNACE_OUT, GEAR_GLINT, ROOM_IRON, ROOM_RUST, ROOM_SPRING, ROOM_STONE, STOKER_ROOM, forgetMade, paintCrank, paintGearIcon } from '../src/art/stoker_room';
import { IRON, RUST, STONE } from '../src/art/prison';
import { PG_SPRING, prisonInWay } from '../src/art/prison_gate';
import { ARCH_WIDE } from '../src/art/gates';
import { RARITY_COLOR } from '../src/art/palette';
import { KNIGHT_BODY } from '../src/art/moves3';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
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
const MOB: Mob = STOKER;
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');

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
const cyanGlow = (r: number, g: number, b: number): boolean => {
  const [h, s, max] = hueSat(r, g, b);
  return max >= 150 && s >= 0.45 && h >= 165 && h <= 205;
};
function cyanIn(px: Px, lights: ReadonlyArray<{ color: string }> = []): boolean {
  const { d } = px;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    if (FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) || cyanGlow(d[i], d[i + 1], d[i + 2])) return true;
  }
  return lights.some((l) => {
    const [r, g, b] = rgba(l.color);
    return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
  });
}
const keyOf = (c: string): string => rgba(c).slice(0, 3).join(',');
const countOf = (px: Px, colours: ReadonlyArray<string>): number => {
  const want = new Set(colours.map(keyOf));
  const { d } = px;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && want.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
  return n;
};
const crisp = (px: Px, rimOk = false): number => {
  let odd = 0;
  for (let i = 3; i < px.d.length; i += 4) if (px.d[i] !== 0 && px.d[i] !== 255 && !(rimOk && px.d[i] === RIM_ALPHA)) odd++;
  return odd;
};
const solid = (px: Px): number => {
  let n = 0;
  for (let i = 3; i < px.d.length; i += 4) if (px.d[i]) n++;
  return n;
};
const imgOf = (s: Sprite): Px => s.img as unknown as Px;

const moveOf = (move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move]);
const at = (move: string, t: number): Moment => (move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, moveOf(move) as NonNullable<ReturnType<typeof moveOf>>, t));
const stageOf = (): Stage => {
  const can = canvasOf(MOB);
  return stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move (the game's frames of each), painted on its whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(3)}`;

test('1. the switch is off, and nothing of the game imports him or his room', () => {
  assert.equal(STOKER_ON.on, false, 'STOKER_ON');
  const users: string[] = [];
  const theirs = /^art\/stoker(_moves|_fx|_room)?$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || theirs.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (theirs.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal(users.length, 0, `game files that import it: ${users.join(', ')}`);
});

test('2. EVERY MOVE THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,rake,burst', 'his stand, his walk, the shovel of coals, struck, his death, the fire rake, the furnace bursts');
  assert.ok(MOB.trueBack, 'from behind as the game truly sees him (the shovel in his right hand)');
  const found = checkBoss(MOB, ST_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. HIS LIGHTNING STRIKES: each attack strikes in two frames, landing on the second; smeared then, in no other frame', () => {
  assert.equal(Object.keys(ST_STRIKES).sort().join(','), 'attack,burst,rake');
  const hits: Record<string, number> = { attack: ST_COALS.hit, rake: ST_RAKE.hit, burst: ST_BURST.hit };
  for (const [move, [s0, s1]] of Object.entries(ST_STRIKES)) {
    assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: two frames`);
    assert.equal(hits[move], s1, `${move}: lands on its strike's last frame`);
    assert.equal(moveOf(move)?.motion.hit, s1, `${move}: its motion's hit`);
  }
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const n = countOf(p.px, ST_SMEAR);
    const want = smearedAt(move, t);
    if (want && n < 20) faults.push(`${said(move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round: nothing cyan, the pink rim while he lives and none as he dies, crisp', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { d } = p.px;
    let rim = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    const alive = move !== 'dying';
    const cyan = cyanIn(p.px, p.lights);
    const odd = crisp(p.px, true);
    if ((alive && solid(p.px) < 3000) || cyan || odd || (alive ? rim < 150 : rim !== 0)) faults.push(`${said(move, view, t)}: ${solid(p.px)} pixels, ${rim} of the rim, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('5. NOTHING CUT OFF: in every frame, both ways round, all of him inside his picture with room to spare', () => {
  const ROOM = 6;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${ST_CANVAS.w}x${ST_CANVAS.h}`);
    let x0 = w;
    let y0 = h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!d[(y * w + x) * 4 + 3]) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    const room = Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
    if (room < ROOM) faults.push(`${said(move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

/** How far what is painted of a solid goes into the floor (of a plate, its iron: art/stoker.ts `lowestPainted`; of anything else, all of it). */
function under(sh: Shape): number {
  const z = lowestPainted(sh);
  return Number.isFinite(z) ? Math.max(0, -z) : 0;
}
test('6. NOTHING OF HIM IN THE FLOOR: nothing he is made of, nor his shovel, nor his sparks and smoke, in any frame', () => {
  const faults: string[] = [];
  const st = stageOf();
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      const m = at(move, t);
      for (const b of MOB.bits(st, m) as Bit[]) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        // (a piece he has let fall, as he dies, is laid on the floor by the game's fall: not where his hand is)
        const fall = move === 'dying' ? MOB.fall?.(b.piece) : null;
        if (fall && t >= fall.from) continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
      for (const [p] of MOB.grains?.(st, m) ?? []) if (p[2] < -0.6) faults.push(`${move} @${t.toFixed(2)}: a grain ${(-p[2]).toFixed(1)} into the floor`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

test('7. THE SHOVEL IN HIS HAND in every frame he holds it; his eyes the enemy\'s pink, his fire an honest orange', () => {
  const faults: string[] = [];
  for (const move of LIVING) {
    for (const t of framesOf(MOB, move)) {
      const s = stokerBonesOf(move as 'stand', t);
      const v = stokerNumbersAt(move as 'stand', t);
      // (his right fist where the move put it: the solver reached it, so the shovel is in it)
      const want: V3 = [v.gx, v.gy, v.gz];
      if (len(sub(s.handR, want)) > 0.6) faults.push(`${move} @${t.toFixed(2)}: his right fist ${len(sub(s.handR, want)).toFixed(1)} off the grip`);
      const sv = shovelOf(s, [v.fx, v.fy, v.fz], v.hold);
      if (len(sub(sv.grip, s.handR)) > 1e-6) faults.push(`${move} @${t.toFixed(2)}: the shovel not in his fist`);
      // (his left fist, when it holds the haft, on it)
      if (v.on > 0.99) {
        const ab = sub(sv.socket, sv.top);
        const k = Math.max(0, Math.min(1, ((s.handL[0] - sv.top[0]) * ab[0] + (s.handL[1] - sv.top[1]) * ab[1] + (s.handL[2] - sv.top[2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2)));
        const off = len(sub(s.handL, [sv.top[0] + ab[0] * k, sv.top[1] + ab[1] * k, sv.top[2] + ab[2] * k]));
        if (off > 1.2) faults.push(`${move} @${t.toFixed(2)}: his left fist ${off.toFixed(1)} off the haft`);
      }
    }
  }
  // (the shovel's scoop's lip glows; the coals heaped on it as he holds it high, gone once flung)
  const front = PAINTED.filter((q) => q.view === 'front' && q.move !== 'dying');
  let eyes = 0;
  for (const { move, t, p } of front) {
    if (countOf(p.px, [FLAME[1], FLAME[2], FLAME[3]]) >= 3) eyes++;
    if (countOf(p.px, [EMBER[1], EMBER[2], EMBER[3], EMBER[4]]) < 8) faults.push(`front ${move} @${t.toFixed(2)}: his fire, ${countOf(p.px, EMBER)} pixels`);
  }
  assert.ok(eyes >= 0.85 * front.length, `his eyes from in front in ${eyes} of ${front.length} frames`);
  const held = paintMob(MOB, 'attack', 1.6, 'front');
  assert.ok(countOf(held.px, [EMBER[3], EMBER[4]]) > 40, 'the coals blazing on his shovel as he holds it high');
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('8. HIS SIZE AND HIS NUMBERS: twice the knight; his walk; each attack held before it strikes; marked before it comes', () => {
  const s = stokerBonesOf('stand', 0);
  const crown = s.head[2] + 8;
  assert.ok(crown > 1.8 * KNIGHT_BODY.tall && crown < 2.25 * KNIGHT_BODY.tall, `his crown ${crown.toFixed(0)} to the knight's ${KNIGHT_BODY.tall}`);
  assert.equal(MOB.pace, ST_PACE);
  assert.ok(ST_PACE >= 1.2 && ST_PACE <= 2.0, 'heavy, but not plodding');
  for (const [name, warn, hit] of [['coals', ST_COALS.warn, ST_COALS.hit], ['rake', ST_RAKE.warn, ST_RAKE.hit], ['burst', ST_BURST.warn, ST_BURST.hit]] as const) {
    assert.ok(warn[1] - warn[0] >= 0.3, `${name}: held at least a third of a second (${(warn[1] - warn[0]).toFixed(2)})`);
    assert.ok(hit - warn[1] <= 0.14, `${name}: then the strike at once (hips first, then two frames)`);
  }
  assert.ok(ST_COALS.hit + coalLands(0) - ST_COALS.mark >= 1.0, 'the coals marked a second and more before they come down');
  assert.ok(ST_RAKE.hit - ST_RAKE.mark >= 0.6, 'the rake marked before it comes');
  assert.ok(ST_BURST.hit - ST_BURST.mark >= 0.8, 'the ring marked before it comes');
  assert.equal(COAL_SPOTS.length, COALS.n);
  assert.ok(COALS.n >= 7 && COAL_FIRE.r >= 0.5 && COAL_FIRE.burns >= 2.5, 'seven fires, each a tile across, burning a while');
  assert.ok(RAKE_FIRE.r1 - RAKE_FIRE.r0 >= 2.5 && RAKE_FIRE.burns >= 3, 'the rake: a broad band, burning on');
  assert.ok(RING.r1 >= 6 && RING.gaps.length === 3, 'the ring: out to six tiles, three gaps');
  assert.ok(inGap(RING.gaps[0]) && !inGap(RING.gaps[0] + RING.gap), 'its gaps');
  assert.equal(ringAt(-0.1), null);
  assert.ok(Math.abs((ringAt(0.25) as number) - (RING.r0 + RING.pace * 0.25)) < 1e-9, 'the ring rolls out at its pace');
  assert.ok((rakePasses(0) as number) > 0 && (rakePasses(0) as number) < ST_RAKE.drag[1] - ST_RAKE.drag[0], 'the rake passes before him as it is dragged');
  // (the gear: out of his grate as he dies, lying still where it fell)
  const end = dyingMoment(MOB, ST_DIES.long);
  const fell = (end as Moment & { s: unknown }) && STOKER.bits(stageOf(), end).filter((b) => b.piece === 'gear');
  assert.ok(fell.length > 0, 'the gear lies before him as he lies dead');
  const g = fell[0].shape as Extract<Shape, { k: 'panel' }>;
  assert.ok(Math.abs(g.c[0] - GEAR_REST[0]) < 0.5 && Math.abs(g.c[1] - GEAR_REST[1]) < 0.5 && g.c[2] < 3, 'flat on the floor where it rests');
  assert.equal(STOKER.bits(stageOf(), dyingMoment(MOB, ST_DIES.gear - 0.1)).filter((b) => b.piece === 'gear').length, 0, 'not before it falls out');
});

test('9. WHAT HIS FIRE DOES ON THE FLOOR, painted: crisp, no cyan, marked in pink before it comes, fire after', () => {
  const PINK = [...FX_PINK];
  const FIREC = [EMBER[1], EMBER[2], EMBER[3], EMBER[4]];
  const faults: string[] = [];
  const cases: ['coals' | 'rake' | 'ring', number, number][] = [['coals', 1.5, ST_COALS.hit + coalLands(6) + 0.6], ['rake', 0.7, ST_RAKE.drag[1] + 0.3], ['ring', 1.0, ST_BURST.hit + 0.3]];
  for (const view of VIEWS) {
    for (const [which, marked, burning] of cases) {
      const m = fxPainted(which, marked, view);
      const b = fxPainted(which, burning, view);
      for (const [p, what] of [[m, 'marked'], [b, 'burning']] as const) {
        if (crisp(p.px)) faults.push(`${which} ${view} ${what}: not crisp`);
        if (cyanIn(p.px, p.lights)) faults.push(`${which} ${view} ${what}: cyan`);
        const { w, h, d } = p.px;
        for (let x = 0; x < w; x++) if (d[x * 4 + 3] || d[((h - 1) * w + x) * 4 + 3]) { faults.push(`${which} ${view} ${what}: cut off`); break; }
      }
      if (countOf(m.px, PINK) < 30) faults.push(`${which} ${view}: marked ${countOf(m.px, PINK)} pink pixels`);
      if (countOf(m.px, FIREC) > 0) faults.push(`${which} ${view}: fire before it comes`);
      if (countOf(b.px, FIREC) < 300) faults.push(`${which} ${view}: its fire ${countOf(b.px, FIREC)} pixels`);
    }
  }
  // (and the coals' fires gone, scorched, once they have burnt)
  const late = fxPainted('coals', ST_COALS.hit + coalLands(6) + COAL_FIRE.burns + 1.3, 'front');
  assert.ok(countOf(late.px, [EMBER[2], EMBER[3], EMBER[4]]) === 0, 'burnt out');
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('10. THE FURNACE ROOM: the furnace lit and out, the crank, the gear, the fire in the way; crisp; cyan only on the ready handle; let go', () => {
  // (floor 3's own colours and gateway, said again in stoker_room.ts, the same as theirs)
  assert.equal(JSON.stringify(ROOM_STONE), JSON.stringify(STONE));
  assert.equal(JSON.stringify(ROOM_IRON), JSON.stringify(IRON));
  assert.equal(JSON.stringify(ROOM_RUST), JSON.stringify(RUST));
  assert.equal(ROOM_SPRING, PG_SPRING);
  for (let u = 0; u < ARCH_WIDE; u += 3) for (let v = 0; v < 130; v += 5) void prisonInWay(u, v);
  const FIREC = [EMBER[2], EMBER[3], EMBER[4]];
  const stripsPx = (list: ReadonlyArray<{ s: Sprite }>): Px[] => list.map((q) => imgOf(q.s));
  const fireIn = (list: Px[]): number => list.reduce((n, p) => n + countOf(p, FIREC), 0);
  const faults: string[] = [];
  const check = (name: string, list: Px[], cyanOk = false): void => {
    if (!list.length || list.reduce((n, p) => n + solid(p), 0) < 200) faults.push(`${name}: not painted`);
    if (list.some((p) => crisp(p))) faults.push(`${name}: not crisp`);
    if (!cyanOk && list.some((p) => cyanIn(p))) faults.push(`${name}: cyan`);
  };
  for (const alongX of [true, false]) {
    const lit = stripsPx(STOKER_ROOM.furnace(alongX, 'lit', 0));
    const out = stripsPx(STOKER_ROOM.furnace(alongX, 'out'));
    check(`the furnace lit (${alongX})`, lit);
    check(`the furnace out (${alongX})`, out);
    assert.equal(lit.length, FURNACE.wide / 8, 'four tiles of strips');
    assert.ok(fireIn(lit) > 400, `the furnace roaring: ${fireIn(lit)}`);
    assert.ok(fireIn(out) < 10, `the furnace out: ${fireIn(out)}`);
    let last = Infinity;
    for (let f = 0; f < FURNACE_OUT.frames; f += 5) {
      const g = stripsPx(STOKER_ROOM.furnace(alongX, 'going', f));
      check(`the furnace going out ${f}`, g);
      const n = fireIn(g);
      assert.ok(n <= last + 40, 'dying down');
      last = n;
    }
    const burn = stripsPx(STOKER_ROOM.fireWall(alongX, 'burning', 2));
    const gone = stripsPx(STOKER_ROOM.fireWall(alongX, 'gone'));
    check(`the fire in the way (${alongX})`, burn);
    assert.ok(fireIn(burn) > 1500, `a wall of fire: ${fireIn(burn)}`);
    assert.ok(fireIn(gone) === 0, 'gone out');
    for (let f = 0; f < FIRE_WALL.out; f += 6) check(`the fire going out ${f}`, stripsPx(STOKER_ROOM.fireWall(alongX, 'going', f)));
  }
  const missing = paintCrank(false, 0, false);
  const set = paintCrank(true, 0, true);
  check('the crank, its gear missing', [missing.px]);
  check('the crank, ready', [set.px], true);
  assert.ok(cyanIn(set.px, set.lights), 'its handle glows the player\'s cyan when it is ready to turn');
  for (let f = 0; f < CRANK_TURN.frames; f += 4) check(`the crank turning ${f}`, [imgOf(STOKER_ROOM.crank('turning', f))]);
  check('the crank turned', [imgOf(STOKER_ROOM.crank('turned'))]);
  for (let f = 0; f < GEAR_GLINT.frames; f++) check(`the gear dropped ${f}`, [imgOf(STOKER_ROOM.gearDropped(f))]);
  const icon = paintGearIcon();
  assert.equal(`${icon.w}x${icon.h}`, '32x32', 'the items\' size');
  check('the gear\'s icon', [icon]);
  assert.ok(countOf(icon, [RARITY_COLOR[0]]) > 40, 'its plain white rim (a quest item)');
  // (its made copies kept, and let go)
  const a = STOKER_ROOM.gearIcon();
  assert.equal(STOKER_ROOM.gearIcon(), a, 'kept');
  forgetMade();
  assert.ok(STOKER_ROOM.gearIcon() !== a, 'let go by forgetMade');
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

// =============================================================================================
// 11. NOTHING OF HIM THROUGH WHAT HE WEARS

/** The four ways he is seen for this check: from in front and from behind (the game's two), and from either side (his solids truly turned, his right side square to the eye, then his left). */
const COVER_VIEWS: ReadonlyArray<readonly [(typeof VIEWS)[number], number, string]> = [['front', 0, 'front'], ['back', 0, 'back'], ['front', 45, 'his right side'], ['front', -135, 'his left side']];
/** A frame painted part by part (as the painter paints it), and for each pixel of his muscle that is seen (the nearest there of all his parts), the point of him it is, as he is posed. */
function muscleSeen(move: string, t: number, view: (typeof VIEWS)[number], deg: number, drop?: string): { part: string; p: V3 }[] {
  const can = canvasOf(MOB);
  const st = stage(paintViewOf(MOB, view), can.ax, can.ay, can);
  const m = at(move, t);
  const bits = MOB.bits(st, m).filter((b) => !drop || b.part !== drop).map((b) => (deg ? { ...b, shape: turnedShape(b.shape, deg) } : b));
  const names = partOrder(bits);
  const sheets: Sheet[] = [];
  paintBits({ ...st, part: (w) => { const sh = st.part(w); sheets.push(sh); return sh; } }, bits, turnedPoint(m.s.pelvis, deg));
  const flesh = sheets.map((_, i) => /^(arm|leg)[LR]$/.test(names[i] ?? ''));
  const out: { part: string; p: V3 }[] = [];
  const { w, h } = sheets[0];
  const b = st.back;
  const seen = new Uint8Array(w * h);
  sheets.forEach((sh, i) => {
    if (!flesh[i]) return;
    for (let k = 0; k < w * h; k++) if (sh.d[k * 4 + 3]) seen[k] = 1;
  });
  for (let k = 0; k < w * h; k++) {
    if (!seen[k]) continue;
    const x = k % w;
    const y = (k - x) / w;
    let best = -Infinity;
    let win = -1;
    for (let i = 0; i < sheets.length; i++) {
      const z = sheets[i].nearAt(x, y);
      if (z >= best && z > -Infinity) {
        best = z;
        win = i;
      }
    }
    if (win < 0 || !flesh[win]) continue;
    const sx = x + 0.5 - can.ax;
    const sy = y + 0.5 - can.ay;
    const q: V3 = [b[0][0] * sx + b[0][1] * sy + b[0][2] * best, b[1][0] * sx + b[1][1] * sy + b[1][2] * best, b[2][0] * sx + b[2][1] * sy + b[2][2] * best];
    out.push({ part: names[win], p: turnedPoint(q, -deg) });
  }
  return out;
}
function coverFaults(move: string, t: number, view: (typeof VIEWS)[number], deg: number, said2: string, drop?: string): string[] {
  const cover = coverOf(at(move, t).s);
  const found = new Map<string, number>();
  for (const { part, p } of muscleSeen(move, t, view, deg, drop)) {
    const by = cover(part.startsWith('arm') ? 'arm' : 'leg', part.endsWith('L') ? 'L' : 'R', p);
    if (by) found.set(`${part} through ${by}`, (found.get(`${part} through ${by}`) ?? 0) + 1);
  }
  return [...found].map(([k, n]) => `${move} ${said2} @${t.toFixed(3)}: ${k} (${n} pixels)`);
}

test('11. NOTHING OF HIM THROUGH WHAT HE WEARS: not one pixel of his muscle where a plate or his skirt covers it, every frame, from in front, behind and either side', () => {
  // (the points put back are where they are on him: each seen pixel of muscle is on his muscle's skin)
  const can = canvasOf(MOB);
  const st = stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
  const seen = muscleSeen('stand', 0, 'front', 0);
  assert.ok(seen.length > 300, `his muscle seen: ${seen.length} pixels`);
  for (const { p } of seen.slice(0, 50)) {
    const [x, y] = st.at(p);
    assert.ok(Math.abs(x - Math.floor(x) - 0.5) < 1e-3 && Math.abs(y - Math.floor(y) - 0.5) < 1e-3, 'put back where it was seen');
  }
  const faults: string[] = [];
  for (const [view, deg, name] of COVER_VIEWS) for (const move of [...LIVING, 'dying']) for (const t of framesOf(MOB, move)) faults.push(...coverFaults(move, t, view, deg, name));
  // (said by what came through what: in how many frames, and the worst)
  const kinds = new Map<string, { n: number; worst: string; most: number }>();
  for (const f of faults) {
    const [, what, px] = /: (.*) \((\d+) pixels\)$/.exec(f) ?? [];
    const k = kinds.get(what) ?? { n: 0, worst: '', most: 0 };
    k.n++;
    if (Number(px) > k.most) Object.assign(k, { most: Number(px), worst: f });
    kinds.set(what, k);
  }
  assert.equal(faults.length, 0, [...kinds].map(([what, k]) => `${what}: ${k.n} frames, worst ${k.worst}`).join('; '));
  // (and the check sees muscle through a plate: his shoulder swollen out past the top of his pauldron's cop is found, and not
  // under it; a point of his thigh above his skirt's hem is one the skirt covers (his thighs are painted only below it, and a
  // little up under it), and his legs below its hem are seen)
  const s0 = at('stand', 0).s;
  const cop = armPlates(armBody(s0, 'R'), 'R')[0];
  const top = (k: number): V3 => add(cop.e.c, [cop.e.ax[2][0] * -k, cop.e.ax[2][1] * -k, cop.e.ax[2][2] * -k]);
  assert.equal(coverOf(s0)('arm', 'R', top(1.08)), 'the pauldron', 'muscle out past the cop');
  assert.equal(coverOf(s0)('arm', 'R', top(0.9)), null, 'muscle under the cop');
  const quad = legBody(s0, 'R').upper[0];
  assert.equal(coverOf(s0)('leg', 'R', add(quad.c, quad.ax[0])), 'the skirt', 'the front of his thigh, above the hem, is under the skirt');
  assert.ok(seen.filter((q) => q.part.startsWith('leg') && q.p[2] < hemOf(s0)).length > 50, 'his legs seen below the hem');
});

// =============================================================================================
// 12. NOTHING OF HIM FLOATING: HIS FLUE JOINED TO HIS BACK, HIS SHOVEL IN HIS FIST OR ON THE FLOOR

/** A frame painted part by part: each part's pixels, by its name. */
function partsOf(move: string, t: number, view: (typeof VIEWS)[number], mob: Mob = MOB): { names: string[]; sheets: Sheet[] } {
  const can = canvasOf(MOB);
  const st = stage(paintViewOf(MOB, view), can.ax, can.ay, can);
  const m = at(move, t);
  const bits = mob.bits(st, m);
  const names = partOrder(bits);
  const sheets: Sheet[] = [];
  paintBits({ ...st, part: (w) => { const sh = st.part(w); sheets.push(sh); return sh; } }, bits, m.s.pelvis);
  return { names, sheets };
}
/** How many of the flue's pixels are not joined to his firebox (8 ways round, through his own parts: not his shovel, his coals or the gear). */
function flueApart(move: string, t: number, view: (typeof VIEWS)[number], mob: Mob = MOB): number {
  const { names, sheets } = partsOf(move, t, view, mob);
  const { w, h } = sheets[0];
  const his = new Uint8Array(w * h);
  const flue = new Uint8Array(w * h);
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  sheets.forEach((sh, i) => {
    const name = names[i] ?? '';
    if (name === 'shovel' || name === 'coals' || name === 'gear') return;
    for (let k = 0; k < w * h; k++) {
      if (!sh.d[k * 4 + 3]) continue;
      his[k] = 1;
      if (name === 'flue') flue[k] = 1;
      if (name === 'belly' && !seen[k]) {
        seen[k] = 1;
        stack.push(k);
      }
    }
  });
  while (stack.length) {
    const k = stack.pop() as number;
    const x = k % w;
    const y = (k - x) / w;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx;
      const Y = y + dy;
      if (X < 0 || Y < 0 || X >= w || Y >= h) continue;
      const q = Y * w + X;
      if (his[q] && !seen[q]) {
        seen[q] = 1;
        stack.push(q);
      }
    }
  }
  let apart = 0;
  let any = 0;
  for (let k = 0; k < w * h; k++) {
    if (!flue[k]) continue;
    any++;
    if (!seen[k]) apart++;
  }
  return any ? apart : -1;
}

test('12. NOTHING OF HIM FLOATING: his flue fixed in his back in every frame of every move while he stands, both ways round', () => {
  const faults: string[] = [];
  // (the flue's foot set in his firebox's domed top, in every frame; and painted, joined to his firebox; till he bursts)
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) {
      if (move === 'dying' && t >= ST_DIES.hit - 1e-9) continue;
      const s = at(move, t).s;
      const d = domeOf(s);
      const u = inEgg({ c: d.c, ax: d.ax }, flueOf(s)[0]);
      if (Math.hypot(u[0], u[1], u[2]) > 0.95) faults.push(`${move} @${t.toFixed(2)}: the flue's foot out of his back (${Math.hypot(u[0], u[1], u[2]).toFixed(2)})`);
      for (const view of VIEWS) {
        const n = flueApart(move, t, view);
        if (n !== 0) faults.push(`${said(move, view, t)}: ${n < 0 ? 'no flue painted' : `${n} pixels of the flue apart from him`}`);
      }
    }
  }
  // (and the check sees a flue come away: lifted clear of his back by 24 of his lengths, it is found apart from him from in front;
  // from behind it would still lie over his back in the picture, which is why its foot is held in his firebox as well)
  const lift = (p: V3): V3 => [p[0], p[1], p[2] + 24];
  const lifted: Mob = { ...MOB, id: 'stoker (flue lifted)', bits: (st, m) => MOB.bits(st, m).map((b) => (b.part !== 'flue' ? b : b.shape.k === 'rod' ? { ...b, shape: { ...b.shape, a: lift(b.shape.a), b: lift(b.shape.b) } } : b.shape.k === 'band' ? { ...b, shape: { ...b.shape, ring: { ...b.shape.ring, c: lift(b.shape.ring.c) } } } : b)) };
  assert.ok(flueApart('stand', 0, 'front', lifted) > 50, 'a flue lifted clear of him seen apart');
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

// =============================================================================================
// 13. HIS DEATH: THE FURNACE EXPLODES

/** His pieces at a moment of his death (what is painted, by piece; not the fire or its light). */
function piecesAt(t: number): Map<string, Bit[]> {
  const out = new Map<string, Bit[]>();
  for (const b of MOB.bits(stageOf(), at('dying', t)) as Bit[]) {
    if (b.piece === 'fire' || b.shape.k === 'glow') continue;
    const g = out.get(b.piece) ?? [];
    g.push(b);
    out.set(b.piece, g);
  }
  return out;
}
const lowOfBits = (bits: ReadonlyArray<Bit>): number => Math.min(...bits.map((b) => lowestPainted(b.shape)));
const whereOf = (bits: ReadonlyArray<Bit>): string => bits.map((b) => JSON.stringify(b.shape, (k, v) => (k === 'skin' ? undefined : typeof v === 'number' ? Math.round(v * 100) / 100 : v))).join('|');

test('13. HIS DEATH, THE FURNACE EXPLODES: held, then the burst in two frames; nothing of his body left; every piece of him down and lying still; no pink or gold; the blast on the floor', () => {
  const D0 = ST_DIES;
  const faults: string[] = [];
  // (the build held a second and more; the burst in two of his death's frames, landing on the second)
  assert.ok(D0.strike[0] - D0.build[0] >= 1.0, 'the overload held a second and more');
  assert.equal(Math.round((D0.strike[1] - D0.strike[0]) * 20), 2, 'the burst in two frames');
  assert.equal(D0.hit, D0.strike[1]);
  assert.ok(framesOf(MOB, 'dying').some((t) => Math.abs(t - D0.hit) < 1e-6), 'the burst lands on a frame of his death');
  // (whole until he bursts; from the burst, nothing of his body: only the pieces he flies apart into)
  const body = /^(arm|leg)[LR]$|^(skirt|belly)$/;
  for (const t of framesOf(MOB, 'dying')) {
    const parts = new Set((MOB.bits(stageOf(), at('dying', t)) as Bit[]).map((b) => b.part));
    const has = [...parts].filter((p) => body.test(p));
    if (t < D0.hit - 1e-6 && has.length < 6) faults.push(`dying @${t.toFixed(2)}: not whole before the burst (${has.join(',')})`);
    if (t >= D0.hit - 1e-6 && has.length) faults.push(`dying @${t.toFixed(2)}: his body left after the burst (${has.join(',')})`);
  }
  // (his shovel in his fist until he lets it go; then lying still on the floor until the burst)
  let was: string | null = null;
  for (const t of framesOf(MOB, 'dying')) {
    if (t < D0.drop) {
      const s = stokerBonesOf('dying' as 'stand', t);
      const v = stokerNumbersAt('dying' as 'stand', t);
      if (len(sub(s.handR, [v.gx, v.gy, v.gz])) > 0.6) faults.push(`dying @${t.toFixed(2)}: his right fist ${len(sub(s.handR, [v.gx, v.gy, v.gz])).toFixed(1)} off the grip`);
      if (len(sub(shovelOf(s, [v.fx, v.fy, v.fz], v.hold).grip, s.handR)) > 1e-6) faults.push(`dying @${t.toFixed(2)}: the shovel not in his fist`);
    } else if (t >= D0.drop + 0.7 && t < D0.hit - 1e-6) {
      const sh = piecesAt(t).get('shovel') ?? [];
      const low = lowOfBits(sh);
      if (!sh.length || low < 0 || low > 1) faults.push(`dying @${t.toFixed(2)}: the shovel not lying on the floor (${low.toFixed(2)})`);
      const w = whereOf(sh);
      if (was !== null && w !== was) faults.push(`dying @${t.toFixed(2)}: the shovel moving as it lies`);
      was = w;
    }
  }
  // (every piece of him down by `down`, lying on the floor, still, to the end)
  let before: Map<string, Bit[]> | null = null;
  let n = 0;
  for (const t of framesOf(MOB, 'dying')) {
    if (t < D0.down) continue;
    const now = piecesAt(t);
    n = now.size;
    for (const [piece, bits] of now) {
      const low = lowOfBits(bits);
      if (low < 0 || low > 1.0) faults.push(`dying @${t.toFixed(2)}: ${piece} not lying on the floor (lowest ${low.toFixed(2)})`);
      if (before && whereOf(bits) !== whereOf(before.get(piece) ?? [])) faults.push(`dying @${t.toFixed(2)}: ${piece} moving after it is down`);
    }
    before = now;
  }
  // (each a whole thing of him: two pauldrons, gauntlets, couters, poleyns and boots; his helm, gorget, flue and door; a dozen shards of his firebox; his shovel; the gear)
  assert.ok(n >= 28, `his pieces lying scattered: ${n}`);
  // (his fire an honest orange-white: no pink or gold from the overload on, in his pictures or their lights; the fireball as he bursts)
  const PG = [FLAME[0], FLAME[1], FLAME[2], FLAME[3], FLAME[4]].map(keyOf);
  for (const view of VIEWS) {
    for (const t of framesOf(MOB, 'dying')) {
      if (t < D0.build[0]) continue;
      const p = deathOfMob(MOB, t / MOB.dieTime, view);
      const pg = countOf(p.px, [FLAME[0], FLAME[1], FLAME[2], FLAME[3], FLAME[4]]);
      if (pg) faults.push(`dying ${view} @${t.toFixed(2)}: ${pg} pixels of pink or gold`);
      if (p.lights.some((l) => PG.includes(keyOf(l.color)))) faults.push(`dying ${view} @${t.toFixed(2)}: a pink or gold light`);
    }
    const blast = deathOfMob(MOB, D0.hit / MOB.dieTime, view);
    assert.ok(countOf(blast.px, [EMBER[3], EMBER[4]]) > 400, `the fireball as he bursts (${view})`);
  }
  // (the blast on the floor: the shockwave out to its tiles, fire then the scorch; crisp, no cyan)
  assert.equal(blastAt(-0.01), null);
  assert.ok(Math.abs((blastAt(0) as number) - BLAST.r0) < 1e-9 && BLAST.r1 >= 2.5, 'the shockwave out to three tiles');
  for (const view of VIEWS) {
    const ring = fxPainted('blast', D0.hit + 0.12, view);
    const end = fxPainted('blast', D0.long, view);
    for (const [p, what] of [[ring, 'rolling'], [end, 'scorched']] as const) {
      if (crisp(p.px)) faults.push(`the blast ${view} ${what}: not crisp`);
      if (cyanIn(p.px, p.lights)) faults.push(`the blast ${view} ${what}: cyan`);
    }
    if (countOf(ring.px, [EMBER[1], EMBER[2], EMBER[3], EMBER[4]]) < 300) faults.push(`the blast ${view}: its ring of fire ${countOf(ring.px, EMBER)}`);
    if (solid(end.px) < 200 || countOf(end.px, [EMBER[2], EMBER[3], EMBER[4]]) > 0) faults.push(`the blast ${view}: its scorch at the end`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});
