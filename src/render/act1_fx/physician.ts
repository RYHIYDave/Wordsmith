// ACT 2, THE HUSH: FLOOR 14'S BOSS: THE PHYSICIAN: what he does to the floor, takes and sends across it, drawn (render/act1_fx/types.ts),
// from the art chat's (art/physician.ts, physician_moves.ts, physician_shots.ts), where his rules (game/act1_rules/physician.ts)
// have it. Only what his own pictures do not paint (they paint his cane, his syringe filling pink, his phials in his hand
// until they are flung, the words of the city rising out of him as he dies):
//   ON THE FLOOR: through the Draw's warning, the line of the enemy's pink along the floor the way his lunge will go
//     (drawDrawAim); where his cane's ferrule strikes the boards in his rap (drawCaneRap); the ring of the Hush rolling out
//     from each rap of his Rounds (drawRoundsRing).
//   OVER WHAT STANDS: his phials in flight, tumbling over their arc (drawPhialFlight), and where each lands, its smash and
//     the cloud of the Hush welling up and lying there, dithered so that whoever stands in it shows through
//     (drawHushCloud); THE WORD HE HOLDS of the hero's, hanging over his head from as he pushes the plunger home, its own
//     rune burning the enemy's pink, so that the hero sees which (drawHeldWord), a light of it in the dark; and the word
//     beaten back out of him, flying home to the hero, taking its own colour again as it comes (drawWordFreed).
// Every colour is the art's: the enemy's pink and gold, the Hush's greys, the tonic's pale green. Never cyan: a word of the
// hero's takes its own colour only as it comes home to him.

import { drawCaneRap, drawDrawAim, drawHeldWord, drawHushCloud, drawPhialFlight, drawRoundsRing, drawWordFreed } from '../../art/physician_shots';
import { PHYSICIAN, heldWord, quillSpot } from '../../game/act1_rules/physician';
import { HELD_WORD_IDS } from '../../game/types';
import type { Act1Fx, Act1FxCtx } from './types';
import { DIAG, DRAW9_HIT, LIGHT, OP_HIT, OP_LONG, OP_STRIKE, PHYSICIAN_ACTION, RAP9_HIT, ROUNDS9_HITS, lensAt } from '../../art/physician_action';
import { BEAM, FIELD, LUNGE, OPERATION, RAP, RINGS, opDark, paintDial, paintDraw, paintField, paintMark, paintRap, paintRounds, toolsAt } from '../../art/physician_action_fx';
import { TOOL_TURNS, toolSprites, toolTurn } from '../../art/act1_figs/physician';
import type { ThingsFilm } from '../../art/films';
import { TILE3 } from '../../art/new_mobs3';
import { hash } from '../../art/kit';
import { FLAME } from '../../art/mkit';
import { drawSprite } from '../../engine/px';
import type { Px, Sprite } from '../../engine/px';
import { OP_PERIL, beamRun, lensSpot } from '../../game/act1_rules/physician';
import { beside } from '../../game/facing';
import { livePicture, picAt, picAtFacing } from './live';
import type { PicAt } from './live';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/**
 * How high the word he holds hangs while he carries words to leave at his death (game pixels over his floor point): clear
 * of their rune stones (render.ts: a boss's hang from the top of his head (art/act1_figs/physician.ts, 35) six and thirteen
 * up, fourteen tall, bobbing a pixel and a half), its pink ring (eight either way) a pixel or two over them.
 */
const STONES = 35 + 6 + 13 + 1 + 1.5 + 8 + 2;

const OLD: Act1Fx = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // THE DRAW'S WARNING: the line his lunge will go, from his feet to where the quill will reach
      const act = m.act;
      const D = PHYSICIAN.draw;
      if (!act || act.id !== 'physician:draw' || act.t < D.warn[0] || act.t >= D.hit) return;
      const k = clamp01((act.t - D.warn[0]) / (D.warn[1] - D.warn[0]));
      const q = quillSpot(m, act.hand);
      drawDrawAim(g, c.at, m.x, m.y, q.x, q.y, k, c.t);
      return;
    }
    if (!p) return;
    if (p.a1 === 'physician:rap') drawCaneRap(g, c.at, p.x, p.y, p.t);
    else if (p.a1 === 'physician:ring') drawRoundsRing(g, c.at, p.x, p.y, p.t);
  },

  air(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // THE WORD HE HOLDS, over his head, from as it came up out of his quill
      const w = heldWord(m);
      const upT = m.a1?.upT ?? -1;
      if (!w || upT < 0) return;
      const [sx, sy] = c.at(m.x, m.y);
      // (HELD_WORD_UP over his floor point; above the rune stones of the words his death will leave, where he carries any,
      // so that neither hides the other: render.ts hangs those just over the top of his head)
      const up = c.game.wordsCarried(m).length ? Math.max(PHYSICIAN.draw.up, STONES) : PHYSICIAN.draw.up;
      const y = sy - up;
      drawHeldWord(g, sx, y, w, c.game.time - upT);
      c.spot(sx, y, 22, 0.7);
      return;
    }
    if (!p) return;
    if (p.a1 === 'physician:phial') {
      if (p.t < p.hit) {
        drawPhialFlight(g, c.at, p.a, p.b, p.x, p.y, p.t, p.c);
        return;
      }
      // (its maker dead, it thins away from then: its last 1.2 s, `d` the moment he died)
      let u = p.t - p.hit;
      if (p.d > 0) u = Math.max(u, PHYSICIAN.tonic.cloud.long - 1.2 + (p.t - p.d));
      drawHushCloud(g, c.at, p.x, p.y, u, p.c);
    } else if (p.a1 === 'physician:freed') {
      // (beaten out of him: from over his head home to the hero)
      const w = HELD_WORD_IDS[p.a];
      if (!w) return;
      const [x0, y0] = c.at(p.x, p.y);
      const h = c.game.hero;
      const [x1, y1] = c.at(h.x, h.y);
      drawWordFreed(g, x0, y0 - (p.b ? Math.max(PHYSICIAN.draw.up, STONES) : PHYSICIAN.draw.up), x1, y1 - 18, w, p.t);
    }
  },
};

// HIS FIGHT DONE THE ACTION WAY (PHYSICIAN_ACTION: art/physician_action.ts and physician_action_fx.ts, his yes there; brought in by the
// main chat, 2 Nov 2026). The art's own painters, through the game's pixels:
//   ON THE FLOOR, from him as he makes a move: the rap's line and star marked as the cane is held up, its cracks after (paintRap);
//     the Draw's lane and its needle of light (paintDraw); the Rounds' reach marked and its great rings of the Hush (paintRounds);
//     through the Diagnosis, the mark round the hero (paintMark). Where he operates: the field marked, burnt in, scorched (paintField).
//   OVER EVERYTHING, AFTER THE DARK (`glow`): the lens's beam over the floor, the light cut off behind what cannot be walked through
//     (as the rules' line is: game/act1_rules/physician.ts beamRun), its edges brass-gold; its shaft to the hero; the dial over the
//     hero's head. Through his operation (the dark is render.ts's, light(): opDark, the spotlight a hole in it): the spotlight's hard
//     edge, its cone from his lens, his instruments flung out, held round it glinting, closing in smeared, stuck in the boards and flown
//     home (toolsAt; each instrument painted ahead each way round, art/films.ts things:physician), the burst where they meet, and the
//     light burnt down through the lens at the strike. The beam, the cone, the edge, the smears and the burn line are drawn with the
//     canvas's own lines in the art's colours (the art's painters go pixel by pixel over the whole floor: too slow for the game; the
//     art chat's README allows it: "or their few drawing calls turned into the canvas's").
const THINGS = 'things:physician';
type Framed = { x: number; y: number; fx: number; fy: number; hand: number };
/** A picture for one of his moves, painted in his own frame (the art's: before him along x, his left along -y) turned to the way he faces: its middle `mid` (tiles before him, to his left), `r` tiles round. */
function facingPicture(c: Act1FxCtx, key: string, stamp: string, F: Framed, mid: readonly [number, number], r: number, paint: (px: Px, at: PicAt) => void): void {
  if (!c.g) return;
  const w = Math.ceil(64 * r * Math.SQRT2) + 8;
  const h = Math.ceil(32 * r * Math.SQRT2) + 8 + 24;
  const q = beside(0, 0, F.fx, F.fy, F.hand, mid[0], mid[1]);
  const ax = w / 2 - 32 * (q.x - q.y);
  const ay = (h + 24) / 2 - 16 * (q.x + q.y);
  const s = livePicture(key, w, h, ax, ay, stamp, (px) => paint(px, picAtFacing(ax, ay, F.fx, F.fy, F.hand)));
  if (!s) return;
  const [sx, sy] = c.at(F.x, F.y);
  drawSprite(c.g, s, sx, sy);
}
/** A picture laid on the floor round (x, y), `r` tiles round, painted with world floor points. */
function floorPicture(c: Act1FxCtx, key: string, stamp: string, x: number, y: number, r: number, up: number, paint: (px: Px, at: PicAt) => void): void {
  if (!c.g) return;
  const w = Math.ceil(64 * r * Math.SQRT2) + 8;
  const h = Math.ceil(32 * r * Math.SQRT2) + 8 + up;
  const base = picAt(w / 2, (h + up) / 2);
  const s = livePicture(key, w, h, w / 2, (h + up) / 2, stamp, (px) => paint(px, (u, v, z = 0) => base(u - x, v - y, z)));
  if (!s) return;
  const [sx, sy] = c.at(x, y);
  drawSprite(c.g, s, sx, sy);
}
/** Where his lens is on the screen, `t` seconds into his `move`: its floor point, and the point itself (game pixels up off it). */
function lensOnScreen(c: Act1FxCtx, m: Framed, move: 'diagnose' | 'operate', t: number): { floor: { x: number; y: number }; P: readonly [number, number] } {
  const p = lensAt(move, t);
  const floor = beside(m.x, m.y, m.fx, m.fy, m.hand, p[0] / TILE3, p[1] / TILE3);
  const [sx, sy] = c.at(floor.x, floor.y);
  return { floor, P: [sx, sy - p[2] / 2] };
}
/** The screen's half sizes of a ring on the floor `r` tiles round (the floor's diamonds 32 by 16 game pixels). */
const rx = (r: number): number => r * 16 * Math.SQRT2;
const ry = (r: number): number => r * 8 * Math.SQRT2;
/** THE DIAL over the hero's head, `fill` full, lit or hid. */
function dial(c: Act1FxCtx, fill: number, lit: boolean): void {
  const h = c.game.hero;
  const s = livePicture('ph:dial', 24, 24, 12, 12, `${Math.round(fill * 48)}:${lit ? 1 : 0}`, (px) => paintDial(px, 12, 12, fill, lit, 7));
  if (!s || !c.g) return;
  const [sx, sy] = c.at(h.x, h.y);
  drawSprite(c.g, s, sx, sy - 46);
}
/** One of his instruments on the screen: its middle (game pixels), the way its point faces, its glint (along it, or none). */
const own = new Map<string, { tool: Sprite; glint: Sprite }>();
function laid(c: Act1FxCtx, kind: number, X: number, Y: number, dx: number, dy: number, glint: number): void {
  const g = c.g!;
  const k = toolTurn(dx, dy);
  const made = c.film ? c.film<ThingsFilm>(THINGS) : null;
  let tool = made?.[`tool:${kind}`]?.[k];
  let gl = made?.[`glint:${kind}`]?.[k];
  if (!tool || !gl) {
    const key = `${kind}:${k}`;
    let o = own.get(key);
    if (!o) own.set(key, (o = toolSprites(kind, k)));
    tool = o.tool;
    gl = o.glint;
  }
  drawSprite(g, tool, Math.round(X), Math.round(Y));
  if (glint <= -99) return;
  // (the glint running along its blade: its blade in his gold, seen only in a band across it where the glint is)
  const a = (k / TOOL_TURNS) * Math.PI * 2;
  const s = OPERATION.size / 2;
  g.save();
  g.translate(Math.round(X), Math.round(Y));
  g.rotate(a);
  g.beginPath();
  g.rect((glint - 1.6) * s, -20, 3.2 * s, 40);
  g.clip();
  g.rotate(-a);
  drawSprite(g, gl, 0, 0);
  g.restore();
}
/** A line on the screen. */
function line(g: CanvasRenderingContext2D, a: readonly [number, number], b: readonly [number, number], colour: string, width: number, alpha: number): void {
  g.globalAlpha = alpha;
  g.strokeStyle = colour;
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
}

const ACTION: Act1Fx = {
  get films() {
    return [THINGS];
  },
  ground(c, m, p) {
    if (!c.g) return;
    if (m) {
      const act = m.act;
      if (!act || m.state !== 'act') return;
      const F: Framed = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
      const t = act.t;
      const stamp = `${Math.floor(t * 30)}`;
      if (act.id === 'physician:rap' && t < RAP9_HIT + RAP.lie) facingPicture(c, `ph:rap:${m.id}`, stamp, F, [RAP.ahead - 0.3, RAP.left], RAP.r + 0.9, (px, at) => paintRap(px, at, t, [0, 0], 'front'));
      else if (act.id === 'physician:draw' && t < DRAW9_HIT + LUNGE.needle + 0.1) facingPicture(c, `ph:draw:${m.id}`, stamp, F, [LUNGE.to / 2, 0], LUNGE.to / 2 + 0.8, (px, at) => paintDraw(px, at, t, [0, 0], 'front'));
      else if (act.id === 'physician:rounds' && t < ROUNDS9_HITS[2] + RINGS.out) facingPicture(c, `ph:rounds:${m.id}`, stamp, F, [RINGS.ahead, RINGS.left], RINGS.reach + 0.4, (px, at) => paintRounds(px, at, t, [0, 0], 'front'));
      else if (act.id === 'physician:diagnose' && m.a1?.dOn) {
        // THE MARK round the hero, filling
        const h = c.game.hero;
        const fill = m.a1.dFill ?? 0;
        const lit = m.a1.dLit === 1;
        floorPicture(c, 'ph:mark', `${Math.round(fill * 72)}:${lit ? 1 : 0}:${Math.floor(c.game.time * 15)}`, h.x, h.y, BEAM.ring * 1.6, 0, (px, at) => paintMark(px, at, h.x, h.y, fill, lit, c.game.time));
      }
      return;
    }
    if (!p || p.a1 !== OP_PERIL) return;
    // THE FIELD: marked, burnt in, scorched
    floorPicture(c, `ph:field:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, `${Math.floor(p.t * 30)}`, p.x, p.y, FIELD.r + 0.4, 48, (px, at) => paintField(px, at, p.x, p.y, p.t, p.c));
  },
  glow(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      const act = m.act;
      const s = m.a1;
      if (!act || m.state !== 'act' || act.id !== 'physician:diagnose' || !s || !s.dOn) return;
      // THE BEAM over the floor, from the lens to the first of what it cannot cross along each way, its edges brass-gold
      const on = Math.min(1, (act.t - DIAG.up + 0.1) / 0.25 + (s.dLook ?? 0) * 4);
      const F: Framed = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: act.hand };
      const L = lensSpot(F, act.hand);
      const aim = s.dAim ?? 0;
      const n = 28;
      const pts: (readonly [number, number])[] = [];
      for (let i = 0; i <= n; i++) {
        const a = aim - BEAM.half + (2 * BEAM.half * i) / n;
        const d = beamRun(c.game, L.x, L.y, a);
        pts.push(c.at(L.x + Math.cos(a) * d, L.y + Math.sin(a) * d));
      }
      const L0 = c.at(L.x, L.y);
      g.save();
      g.globalCompositeOperation = 'screen';
      g.globalAlpha = 0.16 * on;
      g.fillStyle = LIGHT.warm;
      g.beginPath();
      g.moveTo(L0[0], L0[1]);
      for (const q of pts) g.lineTo(q[0], q[1]);
      g.closePath();
      g.fill();
      g.globalCompositeOperation = 'source-over';
      line(g, L0, pts[0], LIGHT.gold, 1, 0.55 * on);
      line(g, L0, pts[n], LIGHT.gold, 1, 0.55 * on);
      // (its shaft through the air from the lens to the hero)
      const lens = lensOnScreen(c, F, 'diagnose', Math.min(act.t, DIAG.loop[1]));
      const h = c.game.hero;
      const [hx, hy] = c.at(h.x, h.y);
      line(g, lens.P, [hx, hy - 7], LIGHT.pale, 1, 0.3 * on * (s.dLit ? 1 : 0.35));
      g.restore();
      dial(c, s.dFill ?? 0, s.dLit === 1);
      return;
    }
    if (!p || p.a1 !== OP_PERIL) return;
    const t = p.t;
    const dark = opDark(t);
    const him = c.game.monsters.find((o) => o.id === p.a && !o.dead) ?? null;
    const F: Framed | null = him ? { x: him.x, y: him.y, fx: him.fx, fy: him.fy, hand: him.act?.hand ?? p.hand } : null;
    const lens = F ? lensOnScreen(c, F, 'operate', Math.min(t, OP_LONG)) : null;
    const [mx, my] = c.at(p.x, p.y);
    g.save();
    if (dark >= 0.5) {
      // THE SPOTLIGHT'S CONE down through the dark from his lens, and its hard edge
      if (lens) {
        const dx = mx - lens.P[0];
        const dy = my - lens.P[1];
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L;
        const ny = dx / L;
        const A = rx(FIELD.r);
        const B = ry(FIELD.r);
        const k = Math.sqrt(A * A * nx * nx + B * B * ny * ny) || 1;
        const sx = (A * A * nx) / k;
        const sy = (B * B * ny) / k;
        g.globalCompositeOperation = 'screen';
        g.globalAlpha = 0.1 * dark;
        g.fillStyle = LIGHT.white;
        g.beginPath();
        g.moveTo(lens.P[0], lens.P[1]);
        g.lineTo(mx + sx, my + sy);
        g.lineTo(mx - sx, my - sy);
        g.closePath();
        g.fill();
        g.globalCompositeOperation = 'source-over';
        line(g, lens.P, [mx + sx, my + sy], LIGHT.white, 1, 0.3 * dark);
        line(g, lens.P, [mx - sx, my - sy], LIGHT.white, 1, 0.3 * dark);
      }
      g.globalAlpha = dark;
      g.strokeStyle = LIGHT.white;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(mx, my, rx(FIELD.r), ry(FIELD.r), 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 0.6 * dark;
      g.strokeStyle = LIGHT.pale;
      g.setLineDash([1, 1]);
      g.beginPath();
      g.ellipse(mx, my, rx(FIELD.r - 0.1), ry(FIELD.r - 0.1), 0, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
    }
    g.globalAlpha = 1;
    // HIS INSTRUMENTS (the art's toolsAt, on the screen at twice its size: the art's own pixels)
    const at2 = (x: number, y: number, z = 0): readonly [number, number] => {
      const [sx, sy] = c.at(x, y);
      return [sx * 2, sy * 2 - z];
    };
    const coat: readonly [number, number] = F ? [c.at(F.x, F.y)[0] * 2, c.at(F.x, F.y)[1] * 2 - 58] : [mx * 2, my * 2 - 58];
    const tools = toolsAt(at2, p.x, p.y, t, coat, F ? [F.x, F.y] : [p.x, p.y]);
    tools.forEach((tl, i) => {
      if (tl.smear) {
        // (smeared through the close: lines of his pink and gold and the light's white from where it was)
        const a: readonly [number, number] = [tl.smear[0][0] / 2, tl.smear[0][1] / 2];
        const b: readonly [number, number] = [tl.smear[1][0] / 2, tl.smear[1][1] / 2];
        if (t > OP_HIT + 1e-6) line(g, [a[0] + (b[0] - a[0]) * 0.45, a[1] + (b[1] - a[1]) * 0.45], b, LIGHT.pale, 0.5, 1);
        else {
          line(g, a, b, FLAME[2], 2.5, 0.7);
          line(g, a, b, FLAME[3], 1.5, 1);
          line(g, a, b, LIGHT.white, 0.5, 1);
        }
        g.globalAlpha = 1;
      }
      laid(c, tl.kind, tl.P[0] / 2, tl.P[1] / 2, tl.dir[0], tl.dir[1], tl.glint);
      // (a glint at its point now and then as it is held: a four-pointed star of his gold)
      if (tl.glint > -99 && t < OP_STRIKE[0] && hash(i, Math.floor(t * 10), 7967) < 0.22) {
        const L = Math.hypot(tl.dir[0], tl.dir[1]) || 1;
        const X = Math.round((tl.P[0] + (tl.dir[0] / L) * 19 * OPERATION.size) / 2);
        const Y = Math.round((tl.P[1] + (tl.dir[1] / L) * 19 * OPERATION.size) / 2);
        g.fillStyle = FLAME[3];
        g.fillRect(X - 1.5, Y - 0.5, 3, 1);
        g.fillRect(X - 0.5, Y - 1.5, 1, 3);
        g.fillStyle = FLAME[4];
        g.fillRect(X - 0.5, Y - 0.5, 1, 1);
      }
    });
    // THE STRIKE: where they meet, a burst of white, his gold and his pink flung out; and the light burnt down through the lens
    const s = t - OP_HIT;
    if (s >= -1e-6 && s < 0.14) {
      const X = mx;
      const Y = my - (OPERATION.high * 0.8) / 2;
      const k = 1 - s / 0.14;
      for (let i = 0; i < 48; i++) {
        if (hash(i, 3, 7969) > k + 0.2) continue;
        const a = hash(i, 1, 7969) * Math.PI * 2;
        const r = ((6 + 46 * hash(i, 2, 7969)) * (0.4 + 0.6 * (1 - k))) / 2;
        g.fillStyle = i % 3 === 0 ? FLAME[2] : i % 3 === 1 ? FLAME[3] : LIGHT.white;
        g.fillRect(Math.round(X + Math.cos(a) * r), Math.round(Y + Math.sin(a) * r * 0.7), 1, 1);
      }
      if (s < 0.07) {
        g.fillStyle = FLAME[4];
        g.beginPath();
        g.ellipse(X, Y, 4.5, 3.5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = LIGHT.white;
        g.beginPath();
        g.ellipse(X, Y, 2.8, 2.2, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    if (lens && s >= -1 / 30 - 1e-6 && s <= 0.17) {
      const k = 1 - Math.max(0, Math.min(1, s / 0.17));
      line(g, lens.P, [mx, my], FLAME[3], 2.5 * (0.4 + 0.6 * k), 1);
      line(g, lens.P, [mx, my], LIGHT.white, 1.2 * (0.4 + 0.6 * k), 1);
    }
    g.restore();
    // (the dial over the hero, full and white, while the field is marked)
    if (t < OP_STRIKE[0]) dial(c, 1, true);
  },
};

export const FX: Act1Fx | null = {
  get films() {
    return PHYSICIAN_ACTION.on ? ACTION.films : undefined;
  },
  ground: (c, m, p) => (PHYSICIAN_ACTION.on ? ACTION.ground!(c, m, p) : OLD.ground!(c, m, p)),
  air: (c, m, p) => OLD.air!(c, m, p),
  glow: (c, m, p) => (PHYSICIAN_ACTION.on ? ACTION.glow!(c, m, p) : undefined),
};
