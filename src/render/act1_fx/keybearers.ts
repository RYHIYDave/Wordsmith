// FLOOR 5: THE TEMPLE DOOR'S TWO KEY-BEARERS, what they throw and leave, drawn (render/act1_fx/types.ts) where their rules have it
// (game/act1_rules/keybearers.ts), from their pictures (art/key_bearers_fx.ts; the great sigil the fire cultist's own, art/
// action_f2_fx.ts, at its bigger ring). Behind art/temple_door.ts TEMPLE_DOOR, off.
//   THE KEY ('keyblade:key'): tumbling from the bearer's hip to the floor, a bounce as it rings there; then lying, glinting, its light
//     on the floor round it, until he walks onto it.
//   THE KNIFE ('keyblade:knife'): turning over and over as it flies, a shadow under it; where it strikes, gone in a glint.
//   THE GREAT SIGIL ('keyflame:sigil'): the ring traced and filling under the hero, the pillar, the floor burning on.
//   THE FAN'S BALLS ('keyflame:ball'): flickering as they fly, their light, a shadow; where each bursts, going out.
//   THE RING ('keyflame:ring'): while he gathers it, its reach marked round him on the floor in the enemy's pink, pulsing faster as he
//     holds it (the warning); as he strikes the floor, the ring of fire running out from him, tongues of fire all round its edge, the
//     floor scorched behind it, dying as it reaches its end.

import { SIGIL, SIGIL_CANVAS, SIGIL_LONG, sigilPainted } from '../../art/action_f2_fx';
import { toSprite } from '../../art/kit';
import { FL_RING } from '../../art/key_bearers';
import { fireBallSprite, keySprite, knifeSprite, ringTongue } from '../../art/key_bearers_fx';
import { drawLights, drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { BALL_PERIL, KEY_DROP, KEY_PERIL, KF, KNIFE_PERIL, RING_PERIL, SIGIL_PERIL, ringAt } from '../../game/act1_rules/keybearers';
import type { Peril } from '../../game/state';
import { keptPictures } from './kept';
import { thrownShadow } from './thrown';
import type { Act1Fx, Act1FxCtx } from './types';

const FPS = 30;
const SIGILS = keptPictures<string, Sprite>(true);
/** One frame of the great sigil, k frames from its first (SIGIL.delay before its eruption). */
function sigilFrame(what: 'floor' | 'behind' | 'before', k: number): Sprite {
  const key = `${what}:${k}`;
  let s = SIGILS.get(key);
  if (s) return s;
  const t = k / FPS - SIGIL.delay;
  s = toSprite(sigilPainted(t, what === 'floor' ? 'floor' : 'air', KF.sigilR, what === 'floor' ? 'all' : what), null, SIGIL_CANVAS.ax, SIGIL_CANVAS.ay);
  SIGILS.set(key, s);
  return s;
}
function sigilK(p: Peril): number {
  return p.t >= -SIGIL.delay && p.t <= SIGIL_LONG ? Math.floor((p.t + SIGIL.delay) * FPS) : -1;
}

/** Where the key is `t` seconds after it was torn off (from the bearer's hip at `from` to where it lies): on the floor, and how high (game pixels), and its turn. */
function keyNow(p: Peril): { x: number; y: number; up: number; turn: number } {
  const F = KEY_DROP.fall;
  if (p.t >= F) {
    // (its bounce as it rings on the stone, and lying)
    const b = p.t - F;
    const up = b < 0.16 ? 4 * Math.sin((Math.PI * b) / 0.16) : b < 0.26 ? 1.5 * Math.sin((Math.PI * (b - 0.16)) / 0.1) : 0;
    return { x: p.x, y: p.y, up, turn: b < 0.16 ? 1 : 0 };
  }
  const u = p.t / F;
  // (thrown up a little off his hip, and falling: from 22 game pixels up)
  const up = 22 * (1 - u) + 14 * u * (1 - u) * 1.2;
  return { x: p.a + (p.x - p.a) * u, y: p.b + (p.y - p.b) * u, up: Math.max(0, up), turn: Math.floor(p.t * 14) };
}

/** A circle on the floor (tiles), as a line on the screen: `n` points round it. */
function floorRing(c: Act1FxCtx, x: number, y: number, r: number, n = 48): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [sx, sy] = c.at(x + r * Math.cos(a), y + r * Math.sin(a));
    out.push([sx, sy]);
  }
  return out;
}
function strokeRing(g: CanvasRenderingContext2D, pts: [number, number][], color: string, width: number, alpha: number, dash: number[] = []): void {
  const was = g.globalAlpha;
  g.globalAlpha = was * alpha;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.setLineDash(dash);
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5) : g.moveTo(Math.round(x) + 0.5, Math.round(y) + 0.5)));
  g.stroke();
  g.setLineDash([]);
  g.globalAlpha = was;
}

export const FX_BLADE: Act1Fx = {
  ground(c, m, p) {
    if (m || !p || !c.g) return;
    if (p.a1 === KNIFE_PERIL && !p.done) {
      const [sx, sy] = c.at(p.x, p.y);
      thrownShadow(c.g, sx, sy, 3, 0.25);
    } else if (p.a1 === KEY_PERIL) {
      const k = keyNow(p);
      const [sx, sy] = c.at(k.x, k.y);
      if (k.up > 0.5) thrownShadow(c.g, sx, sy, 3, 0.3);
      // (lying, its light on the floor round it, so that it is seen)
      if (p.t >= KEY_DROP.fall) c.spot(sx, sy - 2, 20 + 4 * Math.sin(c.t * 3), 0.45);
    }
  },
  standing(c, m, p) {
    if (m || !p) return;
    if (p.a1 === KNIFE_PERIL && !p.done) {
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y, knifeSprite(Math.floor(p.t * 24)), sx, sy - p.c);
      c.spot(sx, sy - p.c, 10, 0.35);
    } else if (p.a1 === KEY_PERIL) {
      const k = keyNow(p);
      const [sx, sy] = c.at(k.x, k.y);
      c.stand(k.x + k.y, keySprite(k.turn), sx, sy - k.up - 2);
    }
  },
  air(c, m, p) {
    if (m || !p || !c.g) return;
    if (p.a1 === KEY_PERIL && p.t >= KEY_DROP.fall) {
      // (a glint running over it now and then)
      const ph = (c.t * 0.7 + p.x * 0.13) % 1;
      if (ph < 0.12) {
        const [sx, sy] = c.at(p.x, p.y);
        c.g.fillStyle = '#fff6d8';
        const gx = Math.round(sx - 5 + ph * 80);
        c.g.fillRect(gx, Math.round(sy - 4), 1, 1);
        c.spot(gx, sy - 4, 6, 0.6);
      }
      return;
    }
    if (p.a1 !== KNIFE_PERIL || !p.done) return;
    const k = 1 - Math.min(1, (p.t - p.hit) / 0.18);
    if (k <= 0) return;
    const [sx, sy] = c.at(p.x, p.y);
    c.spot(sx, sy - p.c, 14, 0.6 * k);
  },
};

export const FX_FLAME: Act1Fx = {
  ground(c, m, p) {
    if (!c.g) return;
    if (m) {
      // THE RING'S WARNING: its reach marked round him, pulsing faster as he holds it
      const act = m.act;
      if (!act || act.id !== 'keyflame:ring' || act.t >= FL_RING.hit) return;
      const k = Math.min(1, act.t / 0.5);
      const fast = 3 + 9 * Math.min(1, act.t / FL_RING.hit);
      const pulse = 0.5 + 0.5 * Math.sin(c.t * fast * Math.PI);
      strokeRing(c.g, floorRing(c, m.x, m.y, KF.ring.to), '#ff3a78', 1, (0.35 + 0.45 * pulse) * k, [3, 2]);
      return;
    }
    if (!p) return;
    if (p.a1 === SIGIL_PERIL) {
      const k = sigilK(p);
      if (k < 0) return;
      const [sx, sy] = c.at(p.x, p.y);
      drawSprite(c.g, sigilFrame('floor', k), sx, sy);
    } else if (p.a1 === BALL_PERIL && !p.done) {
      const [sx, sy] = c.at(p.x, p.y);
      thrownShadow(c.g, sx, sy, 4, 0.25);
    } else if (p.a1 === RING_PERIL) {
      // (the floor scorched behind its edge; its edge burning)
      const r = ringAt(p.t);
      const end = KF.ring.to;
      const dying = r >= end ? 1 - Math.min(1, (p.t - (end - KF.ring.from) / KF.ring.speed) / KF.ring.fade) : 1;
      strokeRing(c.g, floorRing(c, p.x, p.y, r * 0.92), '#2a0e10', 3, 0.5 * dying);
      strokeRing(c.g, floorRing(c, p.x, p.y, r), '#ff3a78', 2, 0.8 * dying);
      strokeRing(c.g, floorRing(c, p.x, p.y, r), '#ffd890', 1, 0.9 * dying);
    }
  },
  standing(c, m, p) {
    if (m || !p) return;
    if (p.a1 === SIGIL_PERIL) {
      if (p.t < 0) return;
      const k = sigilK(p);
      if (k < 0) return;
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y - 0.02, sigilFrame('behind', k), sx, sy);
      c.stand(p.x + p.y + 0.02, sigilFrame('before', k), sx, sy);
    } else if (p.a1 === BALL_PERIL && !p.done) {
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y, fireBallSprite(Math.floor(p.t * 20)), sx, sy - p.c);
      c.spot(sx, sy - p.c, 22, 0.6);
    } else if (p.a1 === RING_PERIL) {
      // (tongues of fire all round its edge, standing each at its own depth)
      const r = ringAt(p.t);
      const end = KF.ring.to;
      const dying = r >= end ? 1 - Math.min(1, (p.t - (end - KF.ring.from) / KF.ring.speed) / KF.ring.fade) : 1;
      if (dying <= 0) return;
      const n = Math.max(12, Math.round(r * 9));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + p.t * 0.6;
        const x = p.x + r * Math.cos(a);
        const y = p.y + r * Math.sin(a);
        const tall = (6 + 5 * Math.sin(i * 2.7 + p.t * 13) + 3 * Math.sin(i * 1.3)) * dying * (1.15 - 0.3 * (r / end));
        if (tall < 1) continue;
        const [sx, sy] = c.at(x, y);
        c.stand(x + y, ringTongue(tall, Math.floor(p.t * 20) + i), sx, sy);
      }
      const [cx, cy] = c.at(p.x, p.y);
      c.spot(cx, cy, 40 + 30 * r, 0.35 * dying);
    }
  },
  air(c, m, p) {
    if (m || !p || !c.g) return;
    if (p.a1 !== BALL_PERIL || !p.done) return;
    // (burst: the ball goes out where it struck)
    const k = 1 - Math.min(1, (p.t - p.hit) / KF.ball.burst);
    if (k <= 0) return;
    const sp = fireBallSprite(Math.floor(p.t * 20));
    const [sx, sy] = c.at(p.x, p.y);
    const was = c.g.globalAlpha;
    c.g.globalAlpha = was * k;
    const sc = 1 + 0.6 * (1 - k);
    c.g.drawImage(sp.img, Math.round(sx - sp.ax * sc), Math.round(sy - p.c - sp.ay * sc), sp.w * sc, sp.h * sc);
    drawLights(c.g, sp, Math.round(sx), Math.round(sy - p.c), 1, k);
    c.g.globalAlpha = was;
    c.spot(sx, sy - p.c, 30, 0.7 * k);
  },
};
