// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: YOUR REFLECTIONS: what they do, drawn (render/act1_fx/types.ts). Their pictures are the
// hero's own turned to glass (art/act1_figs/reflection.ts); here:
// - ITS PICTURE THROUGH A BLOW: its first frame held through the warning, then the hero's own clip played (its blows are his,
//   quicker than any enemy's warning should be: game/act1_rules/reflection.ts REFLECT);
// - ITS WARNINGS through each hold, in the enemy's pink (garden_warn.ts): a blade's cut and its whirl, a bow's line and its volley's
//   fan, magic's wave's strip and where its orb will burst;
// - WHAT IT SENDS: its arrows, its wave, its orb, in the enemy's pink, as the art says what the hero sends must be when a
//   reflection makes it (docs/mockups/reflections/README.md: “What the game draws for an attack besides the figure ... must take
//   the enemy's colours”). The hero's own are the friend's cyan; these are drawn plainly here, the pink of the enemy, not his.
// With REFLECTIONS_UP (the heroes as they look now: each form's own blows, game/act1_rules/reflection.ts UP) the same, by what
// each blow is (its `Blow`): a cut, a ring round a spot (a slam, a quake, the Curse, the Golem's pound), what it sends (an arrow,
// a hellfire bolt, a thrown axe out and back), a wave, things lobbed (an orb, a vial, three vials); the warnings as before for those
// that were.
import type { Clip } from '../../art/actor_types';
import { REFLECT, blowOf, hitOf, isHold, isTap, lobMarks, lobOfPeril, ringAt, shotOfPeril, shotOut, warnOf } from '../../game/act1_rules/reflection';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

/** The enemy's pinks: its edge, its glow, the white at its heart. */
const PINK = ['#7a1640', '#ff3a78', '#ff9cc4', '#fff0f6'] as const;
/** How high over the floor what it sends flies (game pixels: an arrow's, a bolt's, an axe's). */
const FLIES = 14;

const blowing = (id: string): boolean => isTap(id) || isHold(id);

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    if (!m.act || !blowing(m.act.id)) return null;
    const hold = isHold(m.act.id);
    const clip = (hold ? set.clips?.heavy : set.clips?.attack) as Clip | undefined;
    if (!clip || !clip.frames.length) return null;
    const warn = warnOf(m.act);
    const i = m.act.t < warn ? 0 : Math.min(clip.frames.length - 1, Math.floor((m.act.t - warn) * clip.fps));
    return clip.frames[i] ?? null;
  },
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act && blowing(m.act.id)) {
      const k = warnK(m.act.t, 0, hitOf(m, m.act));
      if (k < 0) return;
      const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
      const b = blowOf(m, m.act);
      const round = (x: number, y: number, r: number): void => drawFanWarn(c.g!, c.at, { x, y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, r, k, c.t);
      if (b.k === 'fan') drawFanWarn(c.g, c.at, w, -b.half, b.half, b.reach, k, c.t);
      else if (b.k === 'ring') {
        // (round itself as before, facing as it faces; round a spot before it, or where he stood)
        if (b.at === 'self') drawFanWarn(c.g, c.at, w, -Math.PI, Math.PI, b.r, k, c.t);
        else {
          const at = ringAt(m, b);
          round(at.x, at.y, b.r);
        }
      } else if (b.k === 'shot') {
        if (b.n > 1) drawFanWarn(c.g, c.at, w, -b.spread - 0.08, b.spread + 0.08, b.far * 0.75, k, c.t);
        else drawStripWarn(c.g, c.at, w, 0.4, b.far * 0.75, -0.25, 0.25, k, c.t);
      } else if (b.k === 'wave') {
        const Wv = REFLECT.magic.wave;
        drawStripWarn(c.g, c.at, w, 0.4, Wv.speed * Wv.long, -Wv.half, Wv.half, k, c.t);
      } else for (const [x, y] of lobMarks(m, b)) round(x, y, b.burst);
      return;
    }
    // (an orb or a vial on its way: where it will burst, warned the whole way)
    const lob = p ? lobOfPeril(p) : null;
    if (p && lob && !p.done) {
      const k = Math.min(1, p.t / Math.max(0.1, p.c + lob.after));
      drawFanWarn(c.g, c.at, { x: p.a, y: p.b, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, lob.burst, k, c.t);
    }
  },
  air(c, _m, p) {
    if (!c.g || !p || p.done) return;
    const g = c.g;
    const shot = shotOfPeril(p);
    if (shot && p.a1 === 'reflection:arrow') {
      const d = REFLECT.bow.speed * p.t;
      const [x0, y0] = c.at(p.x + p.fx * Math.max(0, d - 0.7), p.y + p.fy * Math.max(0, d - 0.7));
      const [x1, y1] = c.at(p.x + p.fx * d, p.y + p.fy * d);
      g.strokeStyle = PINK[1];
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, y0 - 14);
      g.lineTo(x1, y1 - 14);
      g.stroke();
      g.fillStyle = PINK[3];
      g.fillRect(Math.round(x1) - 1, Math.round(y1) - 15, 3, 3);
      c.spot(x1, y1 - 14, 14, 0.25);
      return;
    }
    if (shot && p.a1 === 'reflection:bolt') {
      // (A HELLFIRE BOLT, the Warlock's: a ball of the enemy's fire, its tail streaming behind)
      const d = shotOut(shot, p.t);
      for (let i = 3; i >= 0; i--) {
        const back = i * 0.28;
        const [x, y] = c.at(p.x + p.fx * Math.max(0, d - back), p.y + p.fy * Math.max(0, d - back));
        const r = 4 - i;
        g.globalAlpha = 1 - i * 0.22;
        g.fillStyle = i === 0 ? PINK[1] : PINK[i === 1 ? 1 : 0];
        g.beginPath();
        g.arc(Math.round(x), Math.round(y) - FLIES, r, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      const [hx, hy] = c.at(p.x + p.fx * d, p.y + p.fy * d);
      g.fillStyle = PINK[3];
      g.fillRect(Math.round(hx) - 1, Math.round(hy) - FLIES - 1, 2 + (Math.floor(c.t * 16) & 1), 2);
      c.spot(hx, hy - FLIES, 22, 0.4);
      return;
    }
    if (shot && p.a1 === 'reflection:axe') {
      // (THE THROWN AXE, the Warrior's: glass, turning end over end, out at him and back to its hand)
      const d = shotOut(shot, p.t);
      const [x, y] = c.at(p.x + p.fx * d, p.y + p.fy * d);
      const a = p.t * 22;
      const ux = Math.cos(a);
      const uy = Math.sin(a) * 0.6;
      const cx = Math.round(x);
      const cy = Math.round(y) - FLIES;
      g.strokeStyle = PINK[0];
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx - ux * 6, cy - uy * 6);
      g.lineTo(cx + ux * 6, cy + uy * 6);
      g.stroke();
      // (its head, at one end of the haft: a blade's wedge)
      const hx = cx + ux * 5;
      const hy = cy + uy * 5;
      g.fillStyle = PINK[2];
      g.beginPath();
      g.moveTo(hx - uy * 4, hy + ux * 4);
      g.lineTo(hx + ux * 3, hy + uy * 3);
      g.lineTo(hx + uy * 4, hy - ux * 4);
      g.closePath();
      g.fill();
      g.fillStyle = PINK[3];
      g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 2, 2);
      c.spot(cx, cy, 16, 0.3);
      return;
    }
    if (p.a1 === 'reflection:wave') {
      const Wv = REFLECT.magic.wave;
      const along = Wv.speed * p.t;
      const half = Wv.half + along * 0.25;
      const fade = Math.max(0, 1 - p.t / Wv.long);
      g.globalAlpha = 0.35 + 0.5 * fade;
      for (let i = -6; i <= 6; i++) {
        const s = (i / 6) * half;
        const bow = 0.25 * (1 - (i / 6) ** 2);
        const [x, y] = c.at(p.x + p.fx * (along + bow) - p.fy * s, p.y + p.fy * (along + bow) + p.fx * s);
        g.fillStyle = Math.abs(i) < 3 ? PINK[2] : PINK[1];
        g.fillRect(Math.round(x) - 2, Math.round(y) - 6, 4, 4);
      }
      g.globalAlpha = 1;
      const [cx, cy] = c.at(p.x + p.fx * along, p.y + p.fy * along);
      c.spot(cx, cy - 4, 26, 0.3 * fade);
      return;
    }
    if (p.a1 === 'reflection:orb') {
      const k = Math.min(1, p.t / Math.max(0.05, p.c));
      const x = p.x + (p.a - p.x) * k;
      const y = p.y + (p.b - p.y) * k;
      // (lobbed: up and down over its way)
      const lift = 10 + 26 * Math.sin(Math.PI * k);
      const [sx, sy] = c.at(x, y);
      const r = 4 + (Math.floor(c.t * 10) & 1);
      g.fillStyle = PINK[1];
      g.beginPath();
      g.arc(Math.round(sx), Math.round(sy - lift), r + 1, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = PINK[3];
      g.fillRect(Math.round(sx) - 1, Math.round(sy - lift) - 1, 3, 3);
      c.spot(sx, sy - lift, 22, 0.35);
      return;
    }
    if (p.a1 === 'reflection:vial') {
      // (A VIAL, the Tinkerer's: tossed, turning over as it goes, lying where it fell until it bursts)
      const k = Math.min(1, p.t / Math.max(0.05, p.c));
      const x = p.x + (p.a - p.x) * k;
      const y = p.y + (p.b - p.y) * k;
      const lift = k < 1 ? 8 + 20 * Math.sin(Math.PI * k) : 2;
      const [sx, sy] = c.at(x, y);
      const a = k < 1 ? p.t * 14 : 1.2;
      const ux = Math.round(Math.cos(a) * 2);
      const uy = Math.round(Math.sin(a) * 2);
      const cx = Math.round(sx);
      const cy = Math.round(sy - lift);
      g.fillStyle = PINK[0];
      g.fillRect(cx - 2, cy - 2, 5, 5);
      g.fillStyle = PINK[1];
      g.fillRect(cx - 1 + ux, cy - 1 + uy, 3, 3);
      g.fillStyle = PINK[3];
      g.fillRect(cx - ux, cy - uy, 1, 1);
      c.spot(cx, cy, 14, k < 1 ? 0.3 : 0.2 + 0.15 * (Math.floor(c.t * 12) & 1));
    }
  },
};
