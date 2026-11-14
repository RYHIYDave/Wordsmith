// ENDLESS MODE'S FINAL BOSS: THE WARPED WORDSMITH ON HIS BOAR: what he does, drawn (render/act1_fx/types.ts), behind ENDLESS_KEY.
// From the art chat's (art/endless_boss.ts; every move with his yes), each thing laid where its rules put it
// (game/act1_rules/wsboss.ts):
// - HIM: his moves played by their own clocks (a run faster, as its rules play it), his stand going round between; seen from the
//   side he faces, never mirrored (art/act1_figs/wsboss.ts);
// - EVERY WARNING BEFORE IT CAN HURT, in the bosses' ground-warning pink (render/act1_fx/garden_warn.ts, his words: “whatever you
//   use for normal hit box warnings on the ground”): the charge's lane, the gore's sweep, the stomp's reach, the hammer's ring
//   under its shadow before each blow, each meteor's mark filling as it comes, the ice's five lines, the orb's burst;
// - HIS WORDS' THINGS, the films' very solids a thing at a time (art/act1_figs/wsboss.ts WS_THING_MAKERS, painted ahead by the
//   painter: art/films.ts things:wsboss): the hammer over his shadow; each meteor falling, striking and the floor burning where it
//   fell; the ice; the orb, its zaps and its burst; the spores in flight, each trap's rune in the floor, its cloud;
// - WHAT THE FLOOR KEEPS a while: the stomp's rings rolling out, each crater where the hammer fell, the frozen floor.

import { CHARGE_STRIKE, FIRE, FROST, GORE, POWER, SPORE, STOMP } from '../../art/endless_boss';
import { ORB_HIGH, ORB_N, THING_FPS, WS_THING_MAKERS, meteorFrame, trapFrame } from '../../art/act1_figs/wsboss';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { ICE_FROM, ICE_STEPS, SLAMS, WS_TUNE, artAt, hammerAt, orbSwell, ringAt } from '../../game/act1_rules/wsboss';
import { clipFrame } from '../figure';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

const THINGS = 'things:wsboss';
type Things = Record<string, Sprite[]>;
/** Those the page made itself, where the painter has not handed them over yet. */
const own: Record<string, Sprite[]> = {};
function thing(c: Act1FxCtx, name: string, i: number): Sprite | null {
  const M = WS_THING_MAKERS[name];
  if (!M) return null;
  const k = Math.max(0, Math.min(M.n - 1, i));
  const f = c.film?.<Things>(THINGS)?.[name]?.[k];
  if (f) return f;
  const list = (own[name] ??= []);
  return (list[k] ??= M.make(k));
}
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const D = Math.PI / 180;
/** The way he is painted facing along an axis, as the ice's lists are named. */
const viewOf = (fx: number, fy: number): string => (Math.abs(fx) >= Math.abs(fy) ? (fx >= 0 ? 'front' : 'rearL') : fy >= 0 ? 'frontL' : 'rear');

/** A ring on the floor about (x, y), `r` tiles, as the screen sees it. */
function floorRing(c: Act1FxCtx, x: number, y: number, r: number): void {
  const g = c.g!;
  g.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const [sx, sy] = c.at(x + Math.cos(a) * r, y + Math.sin(a) * r);
    if (i === 0) g.moveTo(sx, sy);
    else g.lineTo(sx, sy);
  }
}

export const FX: Act1Fx | null = {
  films: [THINGS],
  flash: 0.5,
  sprite(m, _art, set) {
    if (m.dead) return null;
    const moves = set.clips?.moves ?? {};
    if (m.act) {
      const clip = moves[m.act.id.slice(7)];
      return clip ? clipFrame(clip, m.act.t) : null;
    }
    // (his stand, by its own clock: the boar breathing, snorting, shaking its head, stamping)
    const k = m.a1?.clock ?? 0;
    return set.idle.length ? set.idle[Math.floor(k * (set.idleFps ?? 15)) % set.idle.length] : null;
  },
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m && m.act && !m.dead) {
      const a = m.act;
      const fx = m.a1?.fx ?? m.fx;
      const fy = m.a1?.fy ?? m.fy;
      const w = { x: m.x, y: m.y, fx, fy, hand: 1 };
      let k: number;
      switch (a.id) {
        case 'wsboss:charge': {
          // (its lane, from where it stands to where its run ends, as wide as it strikes)
          if ((k = warnK(a.t, 0.15, CHARGE_STRIKE[1])) >= 0) {
            const lane = m.a1?.lane ?? 6;
            drawStripWarn(g, c.at, { ...w, x: m.a1?.x0 ?? m.x, y: m.a1?.y0 ?? m.y }, 0, lane + 1, -WS_TUNE.charge.half, WS_TUNE.charge.half, k, c.t);
          }
          break;
        }
        case 'wsboss:gore':
          if ((k = warnK(a.t, GORE.lower * 0.5, GORE.hit)) >= 0) drawFanWarn(g, c.at, w, -WS_TUNE.gore.half, WS_TUNE.gore.half, WS_TUNE.gore.reach, k, c.t);
          break;
        case 'wsboss:stomp':
          if ((k = warnK(a.t, STOMP.gather, STOMP.hit)) >= 0) drawFanWarn(g, c.at, { ...w, x: m.x + fx * WS_TUNE.stomp.foot, y: m.y + fy * WS_TUNE.stomp.foot }, -Math.PI, Math.PI, WS_TUNE.stomp.reach, k, c.t);
          break;
        case 'wsboss:power': {
          // (the hammer's shadow, darker as it comes down; before each blow its reach marked about it)
          if (a.t > POWER.cast + 0.2) {
            const h = hammerAt(m);
            const [sx, sy] = c.at(h.x, h.y);
            const was = g.globalAlpha;
            g.globalAlpha = was * 0.45;
            g.fillStyle = '#0a0610';
            g.beginPath();
            g.ellipse(sx, sy, 22, 11, 0, 0, Math.PI * 2);
            g.fill();
            g.globalAlpha = was;
            for (const s of SLAMS) if ((k = warnK(a.t, s - 0.55, s)) >= 0) drawFanWarn(g, c.at, { ...w, x: h.x, y: h.y }, -Math.PI, Math.PI, WS_TUNE.power.reach, k, c.t);
          }
          break;
        }
        case 'wsboss:frost': {
          // (the five lines the ice will race out along, fanned before the place the rune strikes)
          if ((k = warnK(a.t, 0.2, FROST.hit)) >= 0) {
            const s = { x: m.x + fx * ICE_FROM, y: m.y + fy * ICE_FROM };
            const reach = 0.6 + (FROST.steps - 1) * FROST.step + 0.3;
            for (let l = 0; l < FROST.lines; l++) {
              const ang = (l / (FROST.lines - 1) - 0.5) * FROST.fan * D;
              const lx = fx * Math.cos(ang) + fy * Math.sin(ang);
              const ly = fy * Math.cos(ang) - fx * Math.sin(ang);
              drawStripWarn(g, c.at, { x: s.x, y: s.y, fx: lx, fy: ly, hand: 1 }, 0.3, reach, -WS_TUNE.frost.reach, WS_TUNE.frost.reach, k, c.t);
            }
          }
          break;
        }
      }
    }
    if (!p) return;
    switch (p.a1) {
      case 'wsboss:rings': {
        // (the stomp's three shock rings rolling out, each a bright edge, the floor darkened behind it)
        for (let j = 0; j < 3; j++) {
          const r = ringAt(j, p.t);
          if (r < 0) continue;
          const fade = 1 - clamp01((p.t - STOMP.rings[j]) / STOMP.ringLong);
          const was = g.globalAlpha;
          g.globalAlpha = was * 0.35 * fade;
          g.strokeStyle = '#2a0a18';
          g.lineWidth = 6;
          floorRing(c, p.x, p.y, Math.max(0.1, r - 0.25));
          g.stroke();
          g.globalAlpha = was * (0.55 + 0.45 * fade);
          g.strokeStyle = j === 0 ? '#ffd0e0' : '#ff6aa0';
          g.lineWidth = 2;
          floorRing(c, p.x, p.y, r);
          g.stroke();
          g.globalAlpha = was;
        }
        return;
      }
      case 'wsboss:crater': {
        // (where the hammer fell: a crater, its cracks hot a moment, fading)
        const f = 1 - clamp01(p.t / p.dur);
        const [sx, sy] = c.at(p.x, p.y);
        const was = g.globalAlpha;
        g.globalAlpha = was * 0.7 * f;
        g.fillStyle = '#0c0608';
        g.beginPath();
        g.ellipse(sx, sy, 20, 10, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = p.t < 0.5 ? '#ff6aa0' : '#5a1a2a';
        g.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.4;
          g.beginPath();
          g.moveTo(sx + Math.cos(a) * 8, sy + Math.sin(a) * 4);
          g.lineTo(sx + Math.cos(a + 0.2) * 26, sy + Math.sin(a + 0.2) * 13);
          g.stroke();
        }
        g.globalAlpha = was;
        return;
      }
      case 'wsboss:meteor': {
        if (p.t < 0) {
          // (its mark, filling as it comes)
          if (p.t > -FIRE.warn - 0.15) drawFanWarn(g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, WS_TUNE.flame.reach, clamp01(1 + p.t / FIRE.warn), c.t);
          return;
        }
        // (the floor scorched and burning where it fell: as far as its burning reaches)
        const fade = 1 - clamp01((p.t - (p.dur - 0.8)) / 0.8);
        const [sx, sy] = c.at(p.x, p.y);
        const R = WS_TUNE.flame.burn.r;
        const gr = g.createRadialGradient(sx, sy, 2, sx, sy, R * 22);
        gr.addColorStop(0, `rgba(255,138,42,${0.42 * fade})`);
        gr.addColorStop(0.55, `rgba(224,40,122,${0.25 * fade})`);
        gr.addColorStop(1, 'rgba(20,8,12,0)');
        g.fillStyle = gr;
        g.beginPath();
        g.ellipse(sx, sy, R * 22, R * 11, 0, 0, Math.PI * 2);
        g.fill();
        return;
      }
      case 'wsboss:ice': {
        // (behind the racing ice the floor frozen white, in the five lines; thawing at the last)
        const fade = 1 - clamp01((p.t - (p.dur - 1)) / 1);
        const reached = 0.6 + Math.max(0, (p.t - FROST.hit - 0.04) / FROST.race) * FROST.step;
        const reach = Math.min(reached, 0.6 + (FROST.steps - 1) * FROST.step);
        // (rime: a frost of pale dots laid along each line, thicker near its middle, glinting here and there; never a beam of light)
        const was = g.globalAlpha;
        for (let l = 0; l < FROST.lines; l++) {
          const ang = (l / (FROST.lines - 1) - 0.5) * FROST.fan * D;
          const lx = p.fx * Math.cos(ang) + p.fy * Math.sin(ang);
          const ly = p.fy * Math.cos(ang) - p.fx * Math.sin(ang);
          for (let i = 0; i < 70; i++) {
            const u = 0.4 + (reach - 0.4) * ((i * 0.618) % 1);
            const across = (((i * 0.371 + l * 0.17) % 1) - 0.5) * 0.9;
            const [sx, sy] = c.at(p.x + lx * u + ly * across, p.y + ly * u - lx * across);
            const glint = (i * 7 + l * 3 + Math.floor(c.t * 4)) % 23 === 0;
            g.globalAlpha = was * fade * (glint ? 0.85 : 0.3 * (1 - Math.abs(across) * 1.4));
            g.fillStyle = glint ? '#f2f6ff' : (i & 1 ? '#a5c6d7' : '#e2f0f8');
            g.fillRect(Math.round(sx), Math.round(sy), 2, 1);
          }
        }
        g.globalAlpha = was;
        return;
      }
      case 'wsboss:orb': {
        if (p.t > WS_TUNE.bolt.life + 0.4) return;
        const [sx, sy] = c.at(p.x, p.y);
        const was = g.globalAlpha;
        g.globalAlpha = was * 0.4;
        g.fillStyle = '#0a0610';
        g.beginPath();
        g.ellipse(sx, sy, 14, 7, 0, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = was;
        // (swelling: its burst's reach marked)
        const sw = orbSwell(p.t);
        if (sw > 0 && p.t < WS_TUNE.bolt.life) drawFanWarn(g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, WS_TUNE.bolt.burst.reach, sw, c.t);
        return;
      }
      case 'wsboss:trap': {
        // (the rune burned in the floor: growing in, pulsing, snapping white-hot; gone into its cloud)
        if (p.t < 0) return;
        const sw = p.a ? clamp01((p.t - p.a) / WS_TUNE.spore.swell) : 0;
        if (p.a && p.t - p.a > WS_TUNE.spore.swell) return;
        const s = thing(c, 'trap', trapFrame(p.t, sw));
        if (!s) return;
        const [sx, sy] = c.at(p.x, p.y);
        const fade = p.a ? 1 : 1 - clamp01((p.t - (p.dur - 1)) / 1);
        const was = g.globalAlpha;
        g.globalAlpha = was * fade;
        drawSprite(g, s, Math.round(sx), Math.round(sy));
        g.globalAlpha = was;
        return;
      }
    }
  },
  standing(c, m, p) {
    if (m && m.act && !m.dead) {
      const a = m.act;
      if (a.id === 'wsboss:power' && a.t >= POWER.cast) {
        // (the hammer over his shadow, crushed straight down at each blow)
        const h = hammerAt(m);
        const s = thing(c, 'hammer', Math.floor((a.t - POWER.cast) * THING_FPS));
        if (s) {
          const [sx, sy] = c.at(h.x, h.y);
          c.stand(h.x + h.y + 0.6, s, sx, sy);
        }
      } else if (a.id === 'wsboss:poison' && a.t > SPORE.burst && a.t < SPORE.land[1]) {
        // (the spores flung out of the burst over him, each sinking where it lands)
        const x = m.a1?.cx ?? m.x;
        const y = m.a1?.cy ?? m.y;
        const s = thing(c, 'flight', Math.floor((a.t - SPORE.burst) * THING_FPS));
        if (s) {
          const [sx, sy] = c.at(x, y);
          c.stand(x + y + 0.5, s, sx, sy);
        }
      }
    }
    if (!p) return;
    const [sx, sy] = c.at(p.x, p.y);
    switch (p.a1) {
      case 'wsboss:meteor': {
        if (p.t < -FIRE.fall) return;
        const fade = 1 - clamp01((p.t - (p.dur - 0.8)) / 0.8);
        const s = thing(c, `meteor${(p.a | 0) % 4}`, meteorFrame(p.t));
        if (s) c.stand(p.x + p.y, s, sx, sy, fade);
        return;
      }
      case 'wsboss:ice': {
        const i = Math.floor((p.t - FROST.hit) * THING_FPS);
        if (i < 0 || i >= (WS_THING_MAKERS['frost:front']?.n ?? 0)) return;
        const s = thing(c, `frost:${viewOf(p.fx, p.fy)}`, i);
        // (in depth at the ice's middle, some way out along it)
        if (s) c.stand(p.x + p.y + 2 * (p.fx + p.fy), s, sx, sy);
        return;
      }
      case 'wsboss:orb': {
        if (p.t > WS_TUNE.bolt.life) return;
        const sw = orbSwell(p.t);
        const s = thing(c, `orb${sw <= 0 ? 0 : sw < 0.6 ? 1 : 2}`, Math.floor(p.t * THING_FPS) % ORB_N);
        if (s) c.stand(p.x + p.y + 0.4, s, sx, sy);
        return;
      }
      case 'wsboss:trap': {
        if (!p.a) return;
        const u = p.t - p.a - WS_TUNE.spore.swell;
        if (u < 0) return;
        const s = thing(c, 'cloud', Math.floor(u * THING_FPS));
        if (s) c.stand(p.x + p.y + 0.3, s, sx, sy);
        return;
      }
    }
  },
  air(c, _m, p) {
    const g = c.g;
    if (!g || !p || p.a1 !== 'wsboss:orb') return;
    const B = WS_TUNE.bolt;
    const [ox, oy0] = c.at(p.x, p.y);
    const oy = oy0 - ORB_HIGH / 2;
    // (a zap: jagged, white-hot, from the orb down to where it struck, a few frames)
    if (p.t - p.d < 0.18 && p.t < B.life) {
      const [tx, ty] = c.at(p.b, p.c);
      g.strokeStyle = '#fffbe0';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(ox, oy);
      const n = 7;
      for (let i = 1; i <= n; i++) {
        const u = i / n;
        const j = i < n ? (Math.sin(p.t * 97 + i * 13) * 7) : 0;
        g.lineTo(ox + (tx - ox) * u + j, oy + (ty - oy) * u + j * 0.4);
      }
      g.stroke();
      g.strokeStyle = '#ff4f8a';
      g.lineWidth = 1;
      g.stroke();
    }
    // (its burst: a flash of light and bolts out all round)
    const u = p.t - B.life;
    if (u >= 0 && u < 0.35) {
      const k = 1 - u / 0.35;
      const was = g.globalAlpha;
      g.globalAlpha = was * k;
      g.strokeStyle = '#fff060';
      g.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + p.x;
        const [ex, ey] = c.at(p.x + Math.cos(a) * B.burst.reach * (0.4 + 0.6 * (1 - k)), p.y + Math.sin(a) * B.burst.reach * (0.4 + 0.6 * (1 - k)));
        g.beginPath();
        g.moveTo(ox, oy);
        g.lineTo((ox + ex) / 2 + Math.sin(i * 7 + p.t * 50) * 6, (oy + ey) / 2);
        g.lineTo(ex, ey);
        g.stroke();
      }
      g.globalAlpha = was;
    }
  },
};
// (the ice's clusters and points, for the drawing of where they burst: kept for the tests)
export const ICE_DRAWN = { steps: ICE_STEPS, artAt };
