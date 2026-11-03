// ACT 2, THE HUSH: FLOOR 12'S BOSS: THE RAT KING: what he does to the floor and sends across it, drawn (render/act1_fx/types.ts),
// where his rules (game/act1_rules/ratking.ts) have it, and his figure where his moves are more than one of his pictures:
//   HIS FIGURE: THE ROLL is three of the art's (art/rat_king.ts): curling up (`curl`), his ball going round as it rolls (`roll`,
//     a loop, one turn of it in RK_ROLL's 0.8 s), uncurling (`uncurl`), each in its turn by the roll's clock. UNKNOT is two:
//     coming loose and gone into the cracks (`unknot`), and, where they knot again, pouring back in (`knot`); between them
//     nothing of him is seen (`hidden`: not his shadow, his ring, his bar or his name): only his swarm.
//   ON THE FLOOR: the roll's run as he curls, and fading behind him as he rolls (the red troll's lane, art/charge_lane.ts, as
//     the Hollow Stag's charge has it: the bosses' warning in the red circle's own reds, his yes to it on 9 Oct); STOLEN WORDS'
//     warning, a thin line of the enemy's pink along the floor the way the word will fly (art/rat_king_shots.ts drawWordAim);
//     THE SWARM running across the floor from where he came apart to where he knots again (drawSwarm).
//   OVER WHAT STANDS: his stolen word in flight, in the shape of one of the hero's own words, burning the enemy's pink to gold
//     (drawStolenWord), and its burst where it lands (drawWordBurst), each a light of the enemy's in the dark of the sewers.

import { drawChargeLane } from '../../art/charge_lane';
import { drawStolenWord, drawSwarm, drawWordAim, drawWordBurst } from '../../art/rat_king_shots';
import type { StolenWord } from '../../art/rat_king_shots';
import { Px } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { RK, ROLL_TURN, STOLEN, rollEnd, swarming, wordFrom } from '../../game/act1_rules/ratking';
import { clipFrame } from '../figure';
import type { Act1Fx, Act1FxCtx } from './types';
import { BITE9, RATKING_ACTION, ROLL9, UNKNOT9, WORDS9 } from '../../art/ratking_action';
import { FLOOD, SLUICES, SWARM9, floodSpan, gateUp, lanesFor, paintBurstRing, paintRollLane, paintSwarm9, paintWedge, paintWord, paintWordBurst, paintWordLine } from '../../art/ratking_action_fx';
import type { Word } from '../../art/ratking_action_fx';
import { drawSprite } from '../../engine/px';
import { ROLL9_PERIL, SLUICE_PERIL, cisternOfPeril, fromCistern } from '../../game/act1_rules/ratking';
import type { Peril } from '../../game/state';
import { livePicture } from './live';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A picture of nothing (him, gone into the cracks while his swarm runs). */
let none: Sprite | null = null;
const nothing = (): Sprite => (none ??= new Px(2, 2).sprite(1, 2, 2));

const OLD: Act1Fx = {
  sprite(m, _art, set) {
    if (m.state !== 'act' || !m.act) return null;
    const moves = set.clips?.moves;
    if (!moves) return null;
    const t = m.act.t;
    if (m.act.id === 'ratking:roll') {
      const C = RK.roll;
      const long = C.curl + C.turns * C.turn + C.uncurl;
      if (t < C.curl) return moves.curl ? clipFrame(moves.curl, t) : null;
      if (t < long - C.uncurl) return moves.roll ? clipFrame(moves.roll, t - C.curl) : null;
      return moves.uncurl ? clipFrame(moves.uncurl, t - (long - C.uncurl)) : null;
    }
    if (m.act.id === 'ratking:unknot') {
      const U = RK.unknot;
      if (t < U.out) return moves.unknot ? clipFrame(moves.unknot, t) : null;
      if (t < U.out + U.swarm) return nothing();
      return moves.knot ? clipFrame(moves.knot, t - U.out - U.swarm) : null;
    }
    return null;
  },

  hidden: (m) => swarming(m),

  ground(c, m) {
    const g = c.g;
    if (!g || !m || m.state !== 'act' || !m.act) return;
    const act = m.act;
    const t = act.t;
    if (act.id === 'ratking:roll') {
      const C = RK.roll;
      const turns = m.a1?.turns || 1;
      const end = rollEnd(turns);
      if (t >= end) return;
      const far = turns * ROLL_TURN + C.ball;
      const lane = { x0: act.x, y0: act.y, x1: act.x + m.fx * far, y1: act.y + m.fy * far, half: C.ball, k: clamp01(t / C.curl) };
      drawChargeLane(g, t < C.curl ? lane : { ...lane, k: 1, gone: clamp01((t - C.curl) / (end - C.curl)) }, c.at);
    } else if (act.id === 'ratking:words') {
      const W = RK.words;
      if (t < W.warn || t >= W.hit) return;
      const o = wordFrom(m);
      drawWordAim(g, c.at, o.x, o.y, o.x + o.fx * act.a, o.y + o.fy * act.a, (t - W.warn) / (W.hit - W.warn), c.t);
    } else if (act.id === 'ratking:unknot' && swarming(m) && m.a1) {
      drawSwarm(g, c.at, m.a1.sx, m.a1.sy, m.x, m.y, t - RK.unknot.out);
    }
  },

  air(c, m, p) {
    const g = c.g;
    if (m || !p || !g || p.a1 !== 'ratking:word') return;
    const W = RK.words;
    const kind = (STOLEN[p.b] ?? 'fire') as StolenWord;
    if (!p.done) {
      const x1 = p.x + p.fx * p.a;
      const y1 = p.y + p.fy * p.a;
      if (!drawStolenWord(g, c.at, kind, p.x, p.y, W.rise, x1, y1, p.t)) return;
      // (its light in the dark, where it is: down from where it gathered to the floor as it flies, as it is drawn)
      const u = clamp01((p.t * W.speed) / Math.max(0.01, p.a));
      const [sx, sy] = c.at(p.x + (x1 - p.x) * u, p.y + (y1 - p.y) * u);
      c.spot(sx, sy - W.rise * (1 - u) - 6 * u, 18, 0.5);
      return;
    }
    const x = p.x + p.fx * p.c;
    const y = p.y + p.fy * p.c;
    const q = p.t - p.hit;
    drawWordBurst(g, c.at, kind, x, y, q);
    const [sx, sy] = c.at(x, y);
    c.spot(sx, sy - 3, 26, 0.6 * (1 - clamp01(q / W.burstFor)));
  },
};

// HIS FIGHT DONE THE ACTION WAY (RATKING_ACTION: art/ratking_action.ts, his yes, 2 Nov 2026): the art's own painters for his wedge, his
// roll's lane, his word's line, the word in flight and its burst, his burst's ring and the swarm, each onto a picture laid on the floor
// (or, for the word, over what stands) a frame at a time; his roll one clip; his swarm twice as wide. THE SLUICES (the cistern's own)
// drawn here with the canvas's own lines in the art's colours (its painters paint the whole cistern a frame at a time, too slow for
// the game): each lane marked, edges dashed in the enemy's pink and chevrons down it, beating faster; the gates grinding up in the
// wall; the flood racing down every lane, its front a wall of foam, rats tumbling in it; draining away from the gates.
type At = (x: number, y: number, z?: number) => [number, number];
function floorPicture(c: Act1FxCtx, key: string, stamp: string, x: number, y: number, R: number, paint: (px: import('../../engine/px').Px, at: At) => void, up = 0): import('../../engine/px').Sprite | null {
  const w = Math.ceil(64 * (R + 1)) + 8;
  const h = Math.ceil(32 * (R + 1)) + 8 + up;
  return livePicture(key, w, h, w / 2, h / 2 + up, stamp, (px) => paint(px, (u, v, z = 0) => [w / 2 + 32 * (u - x - (v - y)), h / 2 + up + 16 * (u - x + (v - y)) - z]));
}
const WATER = ['#070b0a', '#0d1512', '#14201b', '#1d2c24', '#2b3c32', '#4a5a50'] as const;
const FOAM = ['#7e877c', '#aab2a4', '#d2d6c8', '#eef0e4'] as const;
const PINKS = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
function drawSluice(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const C = cisternOfPeril(p);
  const lanes = lanesFor(C.across).lanes;
  const m = p.t;
  const len = 2 * C.half;
  const pt = (u: number, v: number): readonly [number, number] => {
    const [x, y] = fromCistern(C, u, v);
    return c.at(x, y);
  };
  const poly = (pts: (readonly [number, number])[], fill: string, a: number): void => {
    g.save();
    g.globalAlpha = a;
    g.fillStyle = fill;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    g.restore();
  };
  const line = (a: readonly [number, number], b: readonly [number, number], col: string, w: number, al: number): void => {
    g.save();
    g.globalAlpha = al;
    g.strokeStyle = col;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
    g.stroke();
    g.restore();
  };
  lanes.forEach((L, i) => {
    const y0 = L.y - L.half;
    const y1 = L.y + L.half;
    // THE MARKS: edges dashed in his pink, chevrons down the lane, beating faster as the burst comes
    if (m < SLUICES.burst + 0.2) {
      const k = Math.min(1, (m - SLUICES.mark) / 0.4);
      const beat = 0.55 + 0.45 * Math.sin(m * (6 + 14 * Math.min(1, m / SLUICES.burst)));
      const run = (m * 2.5) % 1;
      for (let u = -C.half; u < -C.half + len * k; u += 0.5) {
        if (Math.floor((u + C.half) * 2) % 3 === 2) continue;
        for (const v of [y0, y1]) line(pt(u, v), pt(Math.min(u + 0.35, C.half), v), PINKS[0], 2, 0.8 * beat);
      }
      for (let u = -C.half + 1 + run * 2; u < -C.half + len * k - 0.5; u += 2) {
        line(pt(u - 0.5, y0 + 0.4), pt(u, L.y), PINKS[1], 2, 0.7 * beat);
        line(pt(u - 0.5, y1 - 0.4), pt(u, L.y), PINKS[1], 2, 0.7 * beat);
      }
    }
    // THE GATE in the wall, grinding up; water spurting under it
    const up = gateUp(m, i);
    const gx = -C.half;
    poly([pt(gx, y0), pt(gx, y1), pt(gx + 0.25, y1), pt(gx + 0.25, y0)], '#1a1418', 0.9);
    if (up > 0.02 && m < SLUICES.burst) for (let v = y0 + 0.2; v < y1; v += 0.35) line(pt(gx + 0.2, v), pt(gx + 0.5 + 0.3 * Math.sin(m * 30 + v * 5), v), FOAM[3], 2, 0.8);
    // THE FLOOD down the lane: black water, foam at its front, rats tumbling in it
    const [tail, front] = floodSpan(m, i, len);
    if (front <= tail) return;
    const a = -C.half + tail;
    const b = -C.half + front;
    poly([pt(a, y0), pt(b, y0), pt(b, y1), pt(a, y1)], WATER[2], 0.88);
    for (let v = y0 + 0.25; v < y1; v += 0.5) {
      const off = ((m * FLOOD.flow + v * 3.1) % 1.6);
      for (let u = a + off; u < b - 0.3; u += 1.6) line(pt(u, v), pt(u + 0.6, v), WATER[4], 2, 0.6);
    }
    // (its front: a churning wall of foam)
    if (front < len) {
      for (let v = y0; v <= y1; v += 0.18) {
        const w = 0.25 + 0.15 * Math.sin(v * 9 + m * 25);
        line(pt(b - w, v), pt(b + 0.1, v), FOAM[Math.floor(Math.abs(Math.sin(v * 13 + m * 7)) * 4)], 3, 0.95);
      }
    }
    // (rats tumbling in it, belly up and over, the enemy's pink in their eyes)
    for (let r = 0; r < 6; r++) {
      const h = Math.sin(r * 12.9898 + i * 78.233) * 43758.5453;
      const f = h - Math.floor(h);
      const u = a + ((f * len + m * FLOOD.rats) % Math.max(0.5, b - a));
      const v = y0 + 0.4 + (L.half * 2 - 0.8) * ((f * 7.3) % 1);
      if (u > b - 0.2) continue;
      const [x, y] = pt(u, v);
      g.fillStyle = '#2a1e1c';
      g.fillRect(Math.round(x) - 3, Math.round(y) - 2, 6, 3);
      g.fillStyle = PINKS[1];
      g.fillRect(Math.round(x) + (Math.sin(m * 9 + r) > 0 ? 2 : -3), Math.round(y) - 2, 1, 1);
    }
  });
}

const ACTION_FX: Act1Fx = {
  sprite(m, _art, set) {
    if (m.state !== 'act' || !m.act) return null;
    const moves = set.clips?.moves;
    if (!moves) return null;
    const t = m.act.t;
    if (m.act.id === 'ratking:unknot') {
      if (t < UNKNOT9.out) return moves.unknot ? clipFrame(moves.unknot, t) : null;
      if (t < UNKNOT9.out + SWARM9.for) return nothing();
      return moves.knot ? clipFrame(moves.knot, t - UNKNOT9.out - SWARM9.for) : null;
    }
    return null;
  },
  hidden: (m) => swarming(m),
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (p && p.a1 === SLUICE_PERIL) {
      drawSluice(c, p);
      return;
    }
    if (p && p.a1 === ROLL9_PERIL) {
      if (p.t > ROLL9.stop + 0.6) return;
      const aim = Math.atan2(p.fy, p.fx);
      const S = floorPicture(c, `rk:roll:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 15)}`, p.x, p.y, ROLL9.stop * ROLL9.pace + 3, (px, at) => {
        paintRollLane(px, at, p.t, [p.x, p.y], aim);
        if (p.t >= ROLL9.stop) paintBurstRing(px, at, [p.x + p.fx * p.d, p.y + p.fy * p.d], p.t - ROLL9.stop);
      });
      const [sx, sy] = c.at(p.x, p.y);
      if (S) drawSprite(g, S, sx, sy);
      return;
    }
    if (!m || m.state !== 'act' || !m.act) return;
    const act = m.act;
    const t = act.t;
    const [sx, sy] = c.at(m.x, m.y);
    if (act.id === 'ratking:bite' && t < BITE9.hit + 0.6) {
      const aim = Math.atan2(m.fy, m.fx);
      const S = floorPicture(c, 'rk:wedge', `${Math.floor(t * 30)}:${aim.toFixed(3)}:${m.x.toFixed(2)}:${m.y.toFixed(2)}`, m.x, m.y, BITE9.reach + 0.5, (px, at) => paintWedge(px, at, t, [m.x, m.y], aim));
      if (S) drawSprite(g, S, sx, sy);
    } else if (act.id === 'ratking:words' && t < WORDS9.hit) {
      const o = wordFrom(m);
      const S = floorPicture(c, 'rk:line', `${Math.floor(t * 20)}:${o.fx.toFixed(2)}:${o.fy.toFixed(2)}:${act.a.toFixed(2)}`, o.x, o.y, WORDS9.reach + 1, (px, at) => paintWordLine(px, at, o.x, o.y, o.x + o.fx * act.a, o.y + o.fy * act.a, t));
      const [ox, oy] = c.at(o.x, o.y);
      if (S) drawSprite(g, S, ox, oy);
    } else if (act.id === 'ratking:unknot' && m.a1) {
      if (t >= UNKNOT9_HIT_ && t < UNKNOT9_HIT_ + 0.6) {
        const bx = m.a1.bx ?? m.x;
        const by = m.a1.by ?? m.y;
        const S = floorPicture(c, 'rk:ring', `${Math.floor(t * 30)}`, bx, by, UNKNOT9.ring + 1, (px, at) => paintBurstRing(px, at, [bx, by], t - UNKNOT9_HIT_));
        const [bxs, bys] = c.at(bx, by);
        if (S) drawSprite(g, S, bxs, bys);
      }
      if (swarming(m)) {
        const x0 = m.a1.sx;
        const y0 = m.a1.sy;
        const R = Math.hypot(m.x - x0, m.y - y0) + 2;
        const S = floorPicture(c, 'rk:swarm', `${Math.floor(t * 20)}`, x0, y0, R, (px, at) => paintSwarm9(px, at, x0, y0, m.x, m.y, t - UNKNOT9.out));
        const [xs, ys] = c.at(x0, y0);
        if (S) drawSprite(g, S, xs, ys);
      }
    }
  },
  air(c, m, p) {
    if (m || !p || !c.g || p.a1 !== 'ratking:word') return;
    if (!p.d) return OLD.air!(c, m, p);
    const kind = (STOLEN[p.b] ?? 'fire') as Word;
    if (!p.done) {
      const x1 = p.x + p.fx * p.a;
      const y1 = p.y + p.fy * p.a;
      const S = floorPicture(c, `rk:word:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 30)}`, p.x, p.y, p.a + 1, (px, at) => void paintWord(px, at, kind, p.x, p.y, RK.words.rise, x1, y1, p.t), 60);
      const [sx, sy] = c.at(p.x, p.y);
      if (S) drawSprite(c.g, S, sx, sy);
      const u = clamp01((p.t * WORDS9.speed) / Math.max(0.01, p.a));
      const [lx, ly] = c.at(p.x + (x1 - p.x) * u, p.y + (y1 - p.y) * u);
      c.spot(lx, ly - RK.words.rise * (1 - u), 22, 0.55);
      return;
    }
    const x = p.x + p.fx * p.c;
    const y = p.y + p.fy * p.c;
    const q = p.t - p.hit;
    const S = floorPicture(c, `rk:burst:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(q * 30)}`, x, y, WORDS9.burst + 1, (px, at) => paintWordBurst(px, at, kind, x, y, q), 40);
    const [sx, sy] = c.at(x, y);
    if (S) drawSprite(c.g, S, sx, sy);
    c.spot(sx, sy - 3, 40, 0.6 * (1 - clamp01(q / WORDS9.burstFor)));
  },
};
const UNKNOT9_HIT_ = UNKNOT9.burst > 0 ? (UNKNOT9 as { hit: number }).hit : 0;

export const FX: Act1Fx | null = {
  sprite: (m, art, set) => (RATKING_ACTION.on ? ACTION_FX : OLD).sprite!(m, art, set),
  hidden: (m) => swarming(m),
  ground: (c, m, p) => (RATKING_ACTION.on || (p && (p.a1 === SLUICE_PERIL || p.a1 === ROLL9_PERIL)) ? ACTION_FX : OLD).ground!(c, m, p),
  air: (c, m, p) => (p && p.a1 === 'ratking:word' && p.d ? ACTION_FX : OLD).air!(c, m, p),
};
