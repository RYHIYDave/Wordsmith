// ACT 1: THE FOG WOLVES (FLOOR 9, THE PINEWOOD): its rules (game/act1_rules/types.ts).
//
// His design doc: "Fog Wolves | Small | A bite. They circle to come at you from behind." The art chat's pictures,
// each with his yes (art/fog_wolves.ts; 15 Oct, by 15:05, "Yes, as shown (Recommended)"): its glide, painted for 3
// tiles a second, its legs never touching the floor (so it may turn and stop at any frame); its bite, a lunge out of
// the fog, its jaws shutting 0.5 s in, 48 of its lengths (about 1.2 tiles) before it. Small: one attack.
//
// HOW THEY CIRCLE ROUND TO COME AT YOU FROM BEHIND (the art chat: "how the pack circles to come at you from behind is
// yours"): a wolf that is awake and in sight of the hero, between `from` and `to` tiles off him and not yet at his
// back, glides round him at its pace, the shorter way, drawing in to `ring` tiles; each makes for a place of its own
// round his back (a little to one side or the other, so that a pack spreads round behind him). Once it is behind him
// (within `behind` of its place), it comes straight in and bites, as any of them. A hero who keeps turning to face
// them is not circled for ever: after `most` seconds of it a wolf comes straight in for `rest` seconds, whatever;
// and one that is blocked (a tree, a wall) comes straight in too. One that is near enough to bite bites.
//
// Every number here that is a picture's is written down here; tests/act1_wolf.test.ts holds it to the art.

import { LEAP, LEAP_CARRIED, LEAP_HIT, LEAP_STRIKE, PACK, WOLF_PACK, leapCarry, leapStrikes } from '../../art/action_f9_pinewood';
import { TUNE } from '../defs';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Game } from '../game';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

const D = Math.PI / 180;

/** THE FOG WOLF'S NUMBERS (tiles, seconds of its pictures). */
export const WOLF = {
  /** Its bite: its jaws shut at `hit`, `reach` tiles before it (WOLF_BITE.reach, 48 of its lengths), in a strip `half` to either side. */
  bite: { hit: 0.5, reach: 1.225, half: 0.5 },
  /** Its circling (above): from how near to how far off it circles; the ring it draws in to; how far round from its place behind him it may be and count as there; how far apart a pack's places are spread round his back (radians, the whole spread); how long it circles before it comes straight in, and for how long then. */
  circle: { from: 1.7, to: 6.5, ring: 2.3, behind: 25 * D, spread: 80 * D, most: 3.5, rest: 2.0 },
};

/** Its glide, painted for 3 tiles a second; with no foot on the floor it may stop at any frame (the art's JUMP: "its glide, from any frame, back to its stand"). */
const GAIT: GaitDef = { pace: 3, cycle: 1 / 16, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.0, slack: 0.3, trueBack: false };

const ACTS: readonly ActDef[] = [{ id: 'wolf:bite', clip: 'attack', long: 1.0, hit: WOLF.bite.hit, dmg: 1, cooldown: 0, first: 0, after: 0.55, near: 0, far: 1.3 }];

const wrap = (a: number): number => {
  let v = a % (Math.PI * 2);
  if (v > Math.PI) v -= Math.PI * 2;
  if (v <= -Math.PI) v += Math.PI * 2;
  return v;
};

/** How far round it still has to go to its place behind the hero (radians, the way it goes: to his left is up): 0, there. */
export function roundToBack(m: { x: number; y: number; seed: number }, h: { x: number; y: number; fx: number; fy: number }): number {
  const C = WOLF.circle;
  const want = Math.atan2(-h.fy, -h.fx) + (m.seed - 0.5) * C.spread;
  return wrap(want - Math.atan2(m.y - h.y, m.x - h.x));
}

/**
 * THE PACK STRIKE (the art chat's art/action_f9_pinewood.ts behind WOLF_PACK, his yes there), in place of the bite and the circling
 * to his back: the wolves awake and in sight of him (within WOLF.circle.to) are a pack; each glides round him the shorter way to its
 * own place on A RING PACK.ring round him, spread evenly round it (the first, by its number, where it is; the rest round from it),
 * and holds there, facing him. Then, one after another, going round, each a PACK.beat after the one before, each LUNGES: crouched,
 * held, and in two frames it leaps clean through where he stands, the game carrying it LEAP.leap tiles on and a skid more
 * (leapCarry, to a wall), landing on the ring across from where it was; a hero in the strip it leaps through (leapStrikes, from where
 * it set off) as its jaws snap shut (LEAP_HIT) is bitten. The first of a round goes once all are on the ring, or once it has held
 * there PACK.gather; one he comes close upon glides back out to its place; one that cannot reach its place (blocked a while:
 * WOLF.circle.most) comes straight in and lunges. None leaps at him into a wall.
 */
const LUNGE_ACTS: readonly ActDef[] = [{ id: 'wolf:lunge', clip: 'attack', long: LEAP.long, hit: LEAP_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.3, near: 0, far: PACK.ring + 0.3 }];
/** Its place on the ring, within this of it, counts as there (tiles). */
const ON_RING = 0.4;
/**
 * THE PACK, by game: the way round him its places are counted from (set as it gathers: where the first of it was), who is in it (by
 * number), which of them have leapt across (each lunge lands it on the ring across from where it was: its place is then across), and
 * who last lunged, and when (game seconds).
 */
interface Pack {
  base: number;
  ids: number[];
  across: Set<number>;
  t: number;
  i: number;
}
const packs = new WeakMap<Game, Pack>();
/** The pack round the hero now: the wolves awake and in sight of him, near enough, by their numbers. */
function packOf(g: Game): Monster[] {
  const h = g.hero;
  return g.monsters
    .filter((o) => o.kind === 'wolf' && !o.dead && o.state !== 'sleep' && Math.hypot(o.x - h.x, o.y - h.y) <= WOLF.circle.to && g.sees(o.x, o.y, h.x, h.y))
    .sort((a, b) => a.id - b.id);
}
/**
 * The pack's state, gathered afresh when who is in it has changed: a pack new come in is counted round him in the order its wolves
 * stand round him, its places spread evenly about where they came from (so that none goes far); one that is still mostly there keeps
 * its way round and its order, the newcomers last.
 */
function packState(g: Game): { P: Pack; pack: Monster[] } {
  const pack = packOf(g);
  const now = new Set(pack.map((o) => o.id));
  let P = packs.get(g);
  const h = g.hero;
  const same = !!P && P.ids.length === now.size && P.ids.every((id) => now.has(id));
  if (!same) {
    const kept = P ? P.ids.filter((id) => now.has(id)) : [];
    if (P && kept.length) {
      P = { ...P, ids: [...kept, ...pack.map((o) => o.id).filter((id) => !kept.includes(id))], across: new Set([...P.across].filter((id) => now.has(id))) };
    } else {
      // (where they came from: the way round him most of them stand; counted round from there)
      const ang = pack.map((o) => Math.atan2(o.y - h.y, o.x - h.x));
      const mid = Math.atan2(ang.reduce((v, a) => v + Math.sin(a), 0), ang.reduce((v, a) => v + Math.cos(a), 0));
      const order = pack.map((o, k) => ({ id: o.id, a: wrap(ang[k] - mid) })).sort((u, v) => u.a - v.a);
      const n = Math.max(1, pack.length);
      P = { base: mid - ((n - 1) / 2) * ((Math.PI * 2) / n), ids: order.map((o) => o.id), across: new Set(), t: P ? P.t : -Infinity, i: n - 1 };
    }
    packs.set(g, P);
  }
  return { P: P!, pack };
}
/** Its place on the ring round the hero (tiles), its number in the pack and how many they are. */
function placeOf(g: Game, m: Monster): { x: number; y: number; i: number; n: number } | null {
  const { P, pack } = packState(g);
  const i = P.ids.indexOf(m.id);
  if (i < 0) return null;
  const h = g.hero;
  const a = P.base + (i / pack.length) * Math.PI * 2 + (P.across.has(m.id) ? Math.PI : 0);
  return { x: h.x + Math.cos(a) * PACK.ring, y: h.y + Math.sin(a) * PACK.ring, i, n: pack.length };
}
/** Whether it is on its place of the ring. */
function onRing(g: Game, m: Monster): boolean {
  const p = placeOf(g, m);
  return !!p && Math.hypot(m.x - p.x, m.y - p.y) <= ON_RING;
}
/** Whether it may lunge now: never within a beat of the last of the pack; on the ring, the next round from the last; the first of a round once all are on the ring or it has held there long enough. */
function itsTurn(g: Game, m: Monster, anyway = false): boolean {
  const { P, pack } = packState(g);
  const since = g.time - P.t;
  if (since < PACK.beat) return false;
  if (anyway) return true;
  const p = placeOf(g, m);
  if (!p) return true;
  if (since <= LEAP.long + PACK.beat * 2) return p.i === (P.i + 1) % p.n;
  // (a new round: once all are on their places, or it has held a while)
  return pack.every((o) => onRing(g, o)) || (m.a1?.held ?? 0) >= PACK.gather;
}
/** Whether its leap at the hero (`dist` off) is clear of walls for `need` tiles. */
function clearLeap(g: Game, m: Monster, dist: number, need: number): boolean {
  const h = g.hero;
  const fx = (h.x - m.x) / Math.max(0.01, dist);
  const fy = (h.y - m.y) / Math.max(0.01, dist);
  for (let d = 0.3; d <= need; d += 0.3) if (!g.free(g.level.walk, m.x + fx * d, m.y + fy * d, Math.min(m.r, 0.42))) return false;
  return true;
}
/** How far it can be carried from where it is along the way it faces, to `most` tiles, before a wall. */
function runOn(g: Game, m: Monster, most: number): number {
  let d = 0;
  while (d < most && g.free(g.level.walk, m.x + m.fx * (d + 0.1), m.y + m.fy * (d + 0.1), Math.min(m.r, 0.42))) d += 0.1;
  return Math.min(d, most);
}
/** THE PACK'S GATHERING ON THE RING, each step: true if this step is all it does (gliding to its place, or holding it). */
function gather(R: BossRules, m: Monster, dt: number, dist: number): boolean {
  const C = WOLF.circle;
  const g = R.g;
  const h = g.hero;
  const a1 = (m.a1 ??= { circ: 0, rest: 0, held: 0 });
  a1.rest = Math.max(0, (a1.rest ?? 0) - dt);
  const p = placeOf(g, m);
  if (g.over || a1.rest > 0 || !p || dist > C.to) {
    a1.circ = 0;
    a1.held = 0;
    return false;
  }
  if (Math.hypot(m.x - p.x, m.y - p.y) <= ON_RING) {
    // (on its place: it holds there, facing him, until it is its turn)
    a1.circ = 0;
    a1.held = (a1.held ?? 0) + dt;
    m.fx = (h.x - m.x) / dist;
    m.fy = (h.y - m.y) / dist;
    if (itsTurn(g, m)) {
      // (its turn, but no room to leap from here, a while: it comes straight in)
      if (!clearLeap(g, m, dist, Math.min(LEAP.leap, dist + 1.5))) {
        a1.blocked = (a1.blocked ?? 0) + dt;
        if (a1.blocked > 1.0) {
          a1.blocked = 0;
          a1.rest = C.rest;
        }
      } else a1.blocked = 0;
      return false;
    }
    m.state = 'chase';
    m.anim = 'idle';
    if (m.gait) m.gait = { mode: 'stand', t: 0 };
    return true;
  }
  a1.held = 0;
  a1.circ = (a1.circ ?? 0) + dt;
  if (a1.circ > C.most) {
    a1.circ = 0;
    a1.rest = C.rest;
    return false;
  }
  // ROUND HIM, the shorter way to its place, drawing in to the ring
  const bx = (m.x - h.x) / dist;
  const by = (m.y - h.y) / dist;
  let off = Math.atan2(p.y - h.y, p.x - h.x) - Math.atan2(m.y - h.y, m.x - h.x);
  off = wrap(off);
  const side = Math.abs(off) < 0.05 ? 0 : off >= 0 ? 1 : -1;
  const pull = Math.max(-0.8, Math.min(0.8, (dist - PACK.ring) * 1.2));
  let vx = -by * side - bx * pull;
  let vy = bx * side - by * pull;
  const n = Math.hypot(vx, vy);
  if (n < 1e-6) return false;
  vx /= n;
  vy /= n;
  const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
  const step = Math.min(sp * dt, Math.hypot(m.x - p.x, m.y - p.y));
  const x0 = m.x;
  const y0 = m.y;
  g.slide(m, Math.min(m.r, 0.42), vx * step, vy * step, g.level.walk, true);
  if (Math.hypot(m.x - x0, m.y - y0) < step * 0.3) {
    // (blocked: it comes straight in)
    a1.circ = 0;
    a1.rest = C.rest;
    return false;
  }
  m.fx = vx;
  m.fy = vy;
  m.state = 'chase';
  m.anim = 'walk';
  if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
  m.gait.t += (dt * sp) / GAIT.pace;
  return true;
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  get acts() {
    return WOLF_PACK.on ? LUNGE_ACTS : ACTS;
  },
  can(R, m, a, dist) {
    if (a.id !== 'wolf:lunge') return true;
    const g = R.g;
    // (come straight in: once a beat has gone by, if it reaches him; on the ring, at its turn, with room to land out on the ring)
    if ((m.a1?.rest ?? 0) > 0) return clearLeap(g, m, dist, dist + 0.2) && itsTurn(g, m, true);
    return onRing(g, m) && clearLeap(g, m, dist, Math.min(LEAP.leap, dist + 1.5)) && itsTurn(g, m);
  },
  start(R, m, a) {
    if (a.id !== 'wolf:lunge') return;
    const g = R.g;
    const act = m.act!;
    act.x = m.x;
    act.y = m.y;
    (m.a1 ??= {}).run = runOn(g, m, LEAP_CARRIED);
    m.a1.held = 0;
    // (it will land across the ring from where it is: its place is there now)
    const p = placeOf(g, m);
    const { P } = packState(g);
    P.t = g.time;
    P.i = p ? p.i : 0;
    if (P.across.has(m.id)) P.across.delete(m.id);
    else P.across.add(m.id);
  },
  tick(R, m, dt, dist) {
    if (m.state === 'act') return false;
    if (WOLF_PACK.on) return gather(R, m, dt, dist);
    const C = WOLF.circle;
    const a1 = (m.a1 ??= { circ: 0, rest: 0 });
    a1.rest = Math.max(0, (a1.rest ?? 0) - dt);
    const g = R.g;
    const h = g.hero;
    if (g.over || a1.rest > 0 || dist < C.from || dist > C.to || !g.sees(m.x, m.y, h.x, h.y)) {
      a1.circ = 0;
      return false;
    }
    const off = roundToBack(m, h);
    // (at his back: it comes in)
    if (Math.abs(off) <= C.behind) {
      a1.circ = 0;
      return false;
    }
    a1.circ += dt;
    if (a1.circ > C.most) {
      a1.circ = 0;
      a1.rest = C.rest;
      return false;
    }
    // ROUND HIM, the shorter way to its place, drawing in to its ring
    const bx = (m.x - h.x) / dist;
    const by = (m.y - h.y) / dist;
    const side = off >= 0 ? 1 : -1;
    const pull = Math.max(-0.6, Math.min(0.6, (dist - C.ring) * 0.8));
    let vx = -by * side - bx * pull;
    let vy = bx * side - by * pull;
    const n = Math.hypot(vx, vy) || 1;
    vx /= n;
    vy /= n;
    const sp = m.speed * (m.chillT > 0 ? 1 - m.chill : 1);
    const x0 = m.x;
    const y0 = m.y;
    g.slide(m, Math.min(m.r, 0.42), vx * sp * dt, vy * sp * dt, g.level.walk, true);
    // (blocked: it comes straight in)
    if (Math.hypot(m.x - x0, m.y - y0) < sp * dt * 0.3) {
      a1.circ = 0;
      a1.rest = C.rest;
      return false;
    }
    m.fx = vx;
    m.fy = vy;
    m.state = 'chase';
    m.anim = 'walk';
    // (gliding: its legs never land, so it goes at once, and its glide runs at its pace)
    if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
    m.gait.t += (dt * sp) / GAIT.pace;
    return true;
  },
  acting(R, m, a, t0, t1) {
    if (a.id === 'wolf:lunge') {
      const g = R.g;
      const h = g.hero;
      const act = m.act!;
      if (t0 < 0.25 && t1 >= 0.25) g.sfx('gust', 0.3);
      if (t1 > LEAP_STRIKE[0]) {
        // (the game carries it through where he stands, and on)
        const run = m.a1?.run ?? LEAP_CARRIED;
        const c = Math.min(leapCarry(t1), run);
        m.x = act.x + m.fx * c;
        m.y = act.y + m.fy * c;
      }
      if (!(t0 < a.hit && t1 >= a.hit)) return;
      // (its jaws snap shut past him: a hero in the strip it leapt through, from where it set off)
      const dx = h.x - act.x;
      const dy = h.y - act.y;
      const along = dx * m.fx + dy * m.fy;
      const aside = -dx * m.fy + dy * m.fx;
      if (!h.move && h.invuln <= 0 && !g.over && along <= (m.a1?.run ?? LEAP_CARRIED) + 0.2 && leapStrikes(along, aside)) R.blow(m, a.dmg);
      g.sfx('swing', 0.5);
      return;
    }
    if (a.id !== 'wolf:bite' || !(t0 < a.hit && t1 >= a.hit)) return;
    const g = R.g;
    const h = g.hero;
    const B = WOLF.bite;
    const r = R.rel(m);
    if (r.fwd > -0.2 && Math.hypot(h.x - m.x, h.y - m.y) <= B.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= B.half) R.blow(m, a.dmg);
    g.sfx('swing', 0.45);
  },
};
