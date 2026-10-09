// Dev page: THE TROLLS' NEW MOVES (art/monster_brute.ts, TROLL_MOVES; a mock-up: NOT IN THE GAME),
// on a piece of the dungeon's own floor with the dark of a dungeon over it, each with its pool of pink
// light, its soft shadow and its lights, as the game shows a monster. Nearest-neighbour enlargement.
//   node tools/preview.mjs src/dev/preview_troll_moves.ts previews/trolls/troll_moves.png 1600 900 "sheet"
//   node tools/page_gif.mjs src/dev/preview_troll_moves.ts "swing:2" previews/trolls/troll_swing.gif
//   node tools/page_gif.mjs src/dev/preview_troll_moves.ts "charge:2" previews/trolls/troll_charge.gif
//   hash = sheet[:<scale>]: moments of each new move, facing you and facing away
//          swing[:<scale>]: frames of a moving picture: the green troll and the red side by side, facing
//            you; each swings, and then each slams as today (its red circle and all)
//          charge[:<scale>]: frames of a moving picture: the red troll's charge: the warning while its
//            line is marked on the floor, the run down it, the stop
//          warden[:<scale>]: THE WARDEN'S NEW MOVES (art/monster_warden.ts, WARDEN_MOVES): moments of his
//            swing and of his calling the dead, facing you and facing away
//          wswing[:<scale>]: frames of a moving picture: the Warden's swing, then his slam as today
//          summon[:<scale>]: frames of a moving picture: the Warden calls the dead, and skeletons crawl
//            out of the ground round him (mkit.ts crawlOut)
//   <scale>: screen pixels to a picture pixel (a game pixel is two)
import { makeGroundArt } from '../art/ground';
import { drawChargeLane } from '../art/charge_lane';
import type { FloorAt } from '../art/charge_lane';
import { CHARGE_GO, SWING_HIT, TROLL_MOVES, makeBruteArt, makeGuardianArt } from '../art/monster_brute';
import { SUMMON_RISE, WARDEN_MOVES, WARDEN_SWING_HIT, makeWardenArt } from '../art/monster_warden';
import { makeSkeletonArt } from '../art/monster_bones';
import { CRAWL_OUT } from '../art/mkit';
import type { ActorArt, AnimSet, Clip } from '../art/actor_types';
import { P } from '../art/palette';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { MONSTERS } from '../game/defs';

TROLL_MOVES.on = true;
WARDEN_MOVES.on = true;
CRAWL_OUT.on = true;

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'sheet';

const cv = document.createElement('canvas');
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
const BG = '#17142e';
document.body.style.margin = '0';
document.body.style.background = BG;
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const ground = makeGroundArt();

function text(s: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = 'left'): void {
  g.fillStyle = color;
  g.font = `${weight} ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  g.textBaseline = 'top';
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}

/** A sprite's reach from its floor point, in picture pixels: left, right, up, down. */
function reachOf(sp: Sprite): [number, number, number, number] {
  const D = sp.density ?? 1;
  return [sp.ax * D, (sp.w - sp.ax) * D, sp.ay * D, (sp.h - sp.ay) * D];
}

/** Where a point of the floor is, in the game's pixels, from the floor point of the pane's first figure. */
const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];

/** Draw on the floor at a floor point (fx, fy) of the screen in the game's own pixels: each is `2 * S` screen pixels. */
function onFloor(fx: number, fy: number, S: number, draw: () => void): void {
  g.save();
  g.translate(Math.round(fx), Math.round(fy));
  g.scale(2 * S, 2 * S);
  g.imageSmoothingEnabled = false;
  draw();
  g.restore();
}

interface Who {
  sp: Sprite;
  fx: number;
  fy: number;
  shadow: number;
  flip?: boolean;
}

/**
 * A pane of the dungeon's floor (the game's own tiles), the dark of a dungeon over it (thinner about
 * the figures), what is drawn on the floor (`marks`), and on it figures at their floor points: each
 * with its soft shadow, its pool of light, itself and its lights. `S`: screen pixels to a picture
 * pixel. (fx0, fy0): the screen point of the floor's (0, 0).
 */
function pane(x: number, y: number, w: number, h: number, S: number, fx0: number, fy0: number, who: ReadonlyArray<Who>, marks?: () => void): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  const span = Math.ceil(Math.max(w, h) / (16 * S)) + 4;
  for (let ty = -span; ty <= span; ty++) {
    for (let tx = -span; tx <= span; tx++) {
      const px = fx0 + (tx - ty) * 32 * S;
      const py = fy0 + (tx + ty) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      const sp = ground.floor(tx + 40, ty + 40);
      g.drawImage(sp.img, px - sp.ax * 2 * S, py - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
    }
  }
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const f of who) {
    const r = Math.max(60, (f.shadow + 46) * S);
    const lit = g.createRadialGradient(f.fx, f.fy - 22 * S, 0, f.fx, f.fy - 22 * S, r);
    lit.addColorStop(0, 'rgba(0,0,0,0.6)');
    lit.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lit;
    g.fillRect(x, y, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  marks?.();
  for (const f of who) {
    const sh = g.createRadialGradient(f.fx, f.fy, 0, f.fx, f.fy, f.shadow * S);
    sh.addColorStop(0, 'rgba(0,0,0,0.62)');
    sh.addColorStop(0.65, 'rgba(0,0,0,0.42)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.save();
    g.translate(f.fx, f.fy);
    g.scale(1, 0.5);
    g.translate(-f.fx, -f.fy);
    g.fillStyle = sh;
    g.beginPath();
    g.arc(f.fx, f.fy, f.shadow * S, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  for (const f of who) {
    const D = f.sp.density ?? 1;
    g.save();
    if (f.flip) {
      g.translate(f.fx, 0);
      g.scale(-1, 1);
      g.translate(-f.fx, 0);
    }
    drawAura(g, f.sp, f.fx, f.fy, D * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(f.sp.img, Math.round(f.fx - f.sp.ax * D * S), Math.round(f.fy - f.sp.ay * D * S), f.sp.img.width * S, f.sp.img.height * S);
    drawLights(g, f.sp, f.fx, f.fy, D * S);
    g.restore();
  }
  g.restore();
}

/** A frame of a clip `t` seconds in (a held one goes round from its loop). */
function at(c: Clip, t: number): Sprite {
  const n = c.frames.length;
  let i = Math.floor(t * c.fps + 1e-6);
  if (c.loop !== undefined && i >= n) {
    const from = Math.round(c.loop * c.fps);
    i = from + ((i - from) % Math.max(1, n - from));
  }
  return c.frames[Math.max(0, Math.min(n - 1, i))];
}
const standing = (s: AnimSet, t: number): Sprite => s.idle[Math.floor(t * (s.idleFps ?? 2)) % s.idle.length];
const moveOf = (s: AnimSet, name: string): Clip => {
  const c = s.clips?.moves?.[name];
  if (!c) throw new Error(`no move ${name}`);
  return c;
};

/** The red circle a slam is warned by (render/render.ts, the 'warn' zone), `k` of the way through its wind-up, in the game's pixels about (cx, cy). */
function warnCircle(cx: number, cy: number, r: number, k: number): void {
  const ell = (rr: number, color: string, a: number): void => {
    g.globalAlpha = a;
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(cx, cy, rr * 22.6, rr * 11.3, 0, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
  };
  ell(r, P.bl3, 0.16 + 0.3 * k);
  ell(r * k, P.bl4, 0.3);
  g.fillStyle = P.bl5;
  const n = Math.max(16, Math.round(r * 44));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.fillRect(Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * r), Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * r), 1, 1);
  }
}

const BRUTE: ActorArt = makeBruteArt();
const GUARD: ActorArt = makeGuardianArt();
const SHADOW = { brute: 20, guardian: 26 };

// =============================================================================================
// sheet: moments of each new move

if (mode === 'sheet') {
  const S = Number(parts[1]) || 2;
  const PAD = 10;
  const M = 6;
  type Cell = { sp: Sprite; label: string; shadow: number };
  const rows: { title: string; cells: Cell[] }[] = [];
  const sw = (a: ActorArt, back: boolean, sh: number): Cell[] =>
    [[0.2, 'gathering it'], [0.42, 'wound back'], [SWING_HIT - 0.04, 'held (the warning)'], [SWING_HIT, 'the blow'], [SWING_HIT + 0.07, 'through'], [SWING_HIT + 0.3, 'after']].map(([t, label]) => ({ sp: at(moveOf(back ? a.back : a.front, 'swing'), t as number), label: label as string, shadow: sh }));
  rows.push({ title: 'The green troll’s swing, facing you', cells: sw(BRUTE, false, SHADOW.brute) });
  rows.push({ title: 'The green troll’s swing, facing away', cells: sw(BRUTE, true, SHADOW.brute) });
  rows.push({ title: 'The red troll’s swing, facing you', cells: sw(GUARD, false, SHADOW.guardian) });
  const ch = (back: boolean): Cell[] => {
    const s = back ? GUARD.back : GUARD.front;
    return [
      { sp: at(moveOf(s, 'chargeWind'), 0.14), label: 'a roar', shadow: SHADOW.guardian },
      { sp: at(moveOf(s, 'chargeWind'), 0.5), label: 'head down, scraping', shadow: SHADOW.guardian },
      { sp: at(moveOf(s, 'chargeWind'), 0.66), label: 'kicking dust', shadow: SHADOW.guardian },
      { sp: at(moveOf(s, 'charge'), 0), label: 'the charge', shadow: SHADOW.guardian },
      { sp: at(moveOf(s, 'charge'), 0.26), label: '(running)', shadow: SHADOW.guardian },
      { sp: at(moveOf(s, 'chargeStop'), 0.2), label: 'skidding to a stop', shadow: SHADOW.guardian },
    ];
  };
  rows.push({ title: 'The red troll’s charge, facing you', cells: ch(false) });
  rows.push({ title: 'The red troll’s charge, facing away', cells: ch(true) });
  let l = 0;
  let r = 0;
  let u = 0;
  let d = 0;
  for (const row of rows) {
    for (const c of row.cells) {
      const [a, b, e, f] = reachOf(c.sp);
      l = Math.max(l, a);
      r = Math.max(r, b);
      u = Math.max(u, e);
      d = Math.max(d, f);
    }
  }
  const cw = (l + r + 2 * M) * S;
  const chh = (u + Math.max(d, 10) + 2 * M) * S;
  const HEAD = 66;
  const NAME = 26;
  const LAB = 24;
  cv.width = PAD + 6 * (cw + PAD);
  cv.height = HEAD + rows.length * (NAME + chh + LAB + PAD);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The trolls’ new moves: the club swing, and the red troll’s charge', PAD, 10, 24, '#ffd866', 700);
  text(`a mock-up: not in the game. The slam stays as it is. ${S} screen pixels to a picture pixel.`, PAD, 40, 15, '#cfc8ff', 600);
  let y = HEAD;
  for (const row of rows) {
    text(row.title, PAD, y + 3, 17, '#ffd866', 700);
    y += NAME;
    row.cells.forEach((c, i) => {
      const x = PAD + i * (cw + PAD);
      const fx = x + (M + l) * S;
      const fy = y + (M + u) * S;
      pane(x, y, cw, chh, S, fx, fy, [{ sp: c.sp, fx, fy, shadow: c.shadow }]);
      text(c.label, x + cw / 2, y + chh + 4, 14, '#e8e2ff', 500, 'center');
    });
    y += chh + LAB + PAD;
  }
  win.__ready = true;
}

// =============================================================================================
// swing: the two side by side, facing you: each swings, and then each slams as today

if (mode === 'swing') {
  const S = Number(parts[1]) || 2;
  const FPS = 30;
  const ROUND = 6.2;
  const TICKS = Math.round(ROUND * FPS);
  const who = [
    { art: BRUTE, name: 'The green troll', shadow: SHADOW.brute, swing: 0.5, slam: 3.0, r: MONSTERS.brute.aoe },
    { art: GUARD, name: 'The red troll', shadow: SHADOW.guardian, swing: 1.7, slam: 4.4, r: MONSTERS.brute.aoe * 1.2 },
  ];
  const slamHit = MONSTERS.brute.windup;
  const slamEnd = (a: ActorArt): number => (a.front.clips?.attack?.frames.length ?? 1) / (a.front.clips?.attack?.fps ?? 30);
  const swingEnd = (a: ActorArt): number => moveOf(a.front, 'swing').frames.length / 30;
  const frameAt = (w: (typeof who)[number], t: number): Sprite => {
    if (t >= w.swing && t < w.swing + swingEnd(w.art)) return at(moveOf(w.art.front, 'swing'), t - w.swing);
    if (t >= w.slam && t < w.slam + slamEnd(w.art)) return at(w.art.front.clips?.attack as Clip, t - w.slam);
    return standing(w.art.front, t);
  };
  // (room: each one's reach over every frame, and the slam's circle in front of it)
  const reach = who.map((w) => {
    let [l, r, u, d] = [0, 0, 0, 0];
    for (let i = 0; i < TICKS; i++) {
      const [a, b, e, f] = reachOf(frameAt(w, i / FPS));
      l = Math.max(l, a);
      r = Math.max(r, b);
      u = Math.max(u, e);
      d = Math.max(d, f);
    }
    // (the circle: 1.2 tiles ahead, its radius out to either side and below)
    const [cx, cy] = ISO(1.2, 0);
    r = Math.max(r, (cx + w.r * 22.6) * 2);
    d = Math.max(d, (cy + w.r * 11.3) * 2);
    l = Math.max(l, (w.r * 22.6 - cx) * 2);
    return [l, r, u, d];
  });
  const PAD = 10;
  const M = 6;
  const up = Math.max(...reach.map((q) => q[2]));
  const down = Math.max(...reach.map((q) => q[3]));
  const widths = reach.map((q) => (q[0] + q[1] + 2 * M) * S);
  const H = (up + down + 2 * M) * S;
  const HEAD = 56;
  cv.width = PAD + widths.reduce((a, b) => a + b + PAD, 0);
  cv.height = HEAD + H + 34;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text('The trolls: a new club swing, and their slam as it is', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. Each swings, then each slams (with its red circle, as today)', PAD, 32, 14, '#cfc8ff', 600);
    let x = PAD;
    who.forEach((w, j) => {
      const wdt = widths[j];
      const fx = x + (M + reach[j][0]) * S;
      const fy = HEAD + (M + up) * S;
      const ts = t - w.slam;
      pane(x, HEAD, wdt, H, S, fx, fy, [{ sp: frameAt(w, t), fx, fy, shadow: w.shadow }], ts >= 0 && ts < slamHit ? () => onFloor(fx, fy, S, () => {
        const [cx, cy] = ISO(1.2, 0);
        warnCircle(cx, cy, w.r, ts / slamHit);
      }) : undefined);
      text(w.name, x + wdt / 2, HEAD + H + 6, 15, '#ffd866', 700, 'center');
      x += wdt + PAD;
    });
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

// =============================================================================================
// charge: the red troll's charge down its marked line

if (mode === 'charge') {
  const S = Number(parts[1]) || 2;
  const FPS = 30;
  /** When the warning begins, how long the run is (tiles) and how fast (tiles a second). */
  const START = 0.5;
  const LONG = 4.5;
  const SPEED = 7;
  const RUN = LONG / SPEED;
  const stop = moveOf(GUARD.front, 'chargeStop');
  const STOP = stop.frames.length / stop.fps;
  const ROUND = START + CHARGE_GO + RUN + STOP + 0.8;
  const TICKS = Math.round(ROUND * FPS);
  const HALF = 0.62;
  /** Where he is along the line (tiles) and his frame, at a moment. */
  const state = (t: number): { along: number; sp: Sprite; k: number; gone?: number } => {
    const s = GUARD.front;
    if (t < START) return { along: 0, sp: standing(s, t), k: -1 };
    const w = t - START;
    if (w < CHARGE_GO) return { along: 0, sp: at(moveOf(s, 'chargeWind'), w), k: w / CHARGE_GO };
    const r = w - CHARGE_GO;
    if (r < RUN) return { along: r * SPEED, sp: at(moveOf(s, 'charge'), r), k: 1, gone: (r * SPEED) / LONG };
    const e = r - RUN;
    // (he skids a little further as he stops)
    if (e < STOP) return { along: LONG + 0.35 * (1 - (1 - e / STOP) ** 2), sp: at(stop, e), k: 1, gone: 1 };
    return { along: LONG + 0.35, sp: standing(s, t), k: -1 };
  };
  let [l, r, u, d] = [0, 0, 0, 0];
  for (let i = 0; i < TICKS; i++) {
    const st = state(i / FPS);
    const [a, b, e, f] = reachOf(st.sp);
    const [ox, oy] = ISO(st.along, 0);
    l = Math.max(l, a - ox * 2);
    r = Math.max(r, b + ox * 2);
    u = Math.max(u, e - oy * 2);
    d = Math.max(d, f + oy * 2);
  }
  const [ex, ey] = ISO(LONG + 0.4, 0);
  r = Math.max(r, ex * 2 + 40);
  d = Math.max(d, ey * 2 + 20);
  const PAD = 10;
  const M = 8;
  const W = (l + r + 2 * M) * S;
  const H = (u + d + 2 * M) * S;
  const HEAD = 56;
  cv.width = W + 2 * PAD;
  cv.height = HEAD + H + 34;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    const st = state(t);
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text('The red troll’s charge, along a line marked on the floor', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. The line fills as he gets ready; then he runs it', PAD, 32, 14, '#cfc8ff', 600);
    const fx0 = PAD + (M + l) * S;
    const fy0 = HEAD + (M + u) * S;
    const [ox, oy] = ISO(st.along, 0);
    const fx = fx0 + ox * 2 * S;
    const fy = fy0 + oy * 2 * S;
    pane(PAD, HEAD, W, H, S, fx0, fy0, [{ sp: st.sp, fx, fy, shadow: SHADOW.guardian }], st.k >= 0 && (st.gone === undefined || st.gone < 1) ? () => onFloor(fx0, fy0, S, () => drawChargeLane(g, { x0: 0, y0: 0, x1: LONG, y1: 0, half: HALF, k: st.k, gone: st.gone }, ISO)) : undefined);
    text('The red troll', PAD + W / 2, HEAD + H + 6, 15, '#ffd866', 700, 'center');
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

// =============================================================================================
// THE WARDEN

const WARDEN: ActorArt = makeWardenArt();
const W_SHADOW = 30;

if (mode === 'warden') {
  const S = Number(parts[1]) || 2;
  const PAD = 10;
  const M = 6;
  type Cell = { sp: Sprite; label: string };
  const rows: { title: string; cells: Cell[] }[] = [];
  const sw = (back: boolean): Cell[] =>
    [[0.25, 'taking it up'], [0.5, 'cocked back'], [WARDEN_SWING_HIT - 0.04, 'held (the warning)'], [WARDEN_SWING_HIT, 'the blow'], [WARDEN_SWING_HIT + 0.08, 'through'], [WARDEN_SWING_HIT + 0.35, 'after']].map(([t, label]) => ({ sp: at(moveOf(back ? WARDEN.back : WARDEN.front, 'swing'), t as number), label: label as string }));
  const su = (back: boolean): Cell[] =>
    [[0.4, 'the maul planted'], [0.6, 'his hand low, palm up'], [0.85, 'it comes up'], [SUMMON_RISE, 'the dead rise'], [SUMMON_RISE + 0.4, 'held up'], [SUMMON_RISE + 0.8, 'after']].map(([t, label]) => ({ sp: at(moveOf(back ? WARDEN.back : WARDEN.front, 'summon'), t as number), label: label as string }));
  rows.push({ title: 'The Warden’s swing, facing you', cells: sw(false) });
  rows.push({ title: 'The Warden’s swing, facing away', cells: sw(true) });
  rows.push({ title: 'The Warden calls the dead, facing you', cells: su(false) });
  rows.push({ title: 'The Warden calls the dead, facing away', cells: su(true) });
  let [l, r, u, d] = [0, 0, 0, 0];
  for (const row of rows) {
    for (const c of row.cells) {
      const [a, b, e, f] = reachOf(c.sp);
      l = Math.max(l, a);
      r = Math.max(r, b);
      u = Math.max(u, e);
      d = Math.max(d, f);
    }
  }
  const cw = (l + r + 2 * M) * S;
  const chh = (u + Math.max(d, 10) + 2 * M) * S;
  const HEAD = 66;
  const NAME = 26;
  const LAB = 24;
  cv.width = PAD + 6 * (cw + PAD);
  cv.height = HEAD + rows.length * (NAME + chh + LAB + PAD);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The Warden’s new moves: a swing, and calling the dead', PAD, 10, 24, '#ffd866', 700);
  text(`a mock-up: not in the game. His slam and his fan of bolts stay as they are. ${S} screen pixels to a picture pixel.`, PAD, 40, 15, '#cfc8ff', 600);
  let y = HEAD;
  for (const row of rows) {
    text(row.title, PAD, y + 3, 17, '#ffd866', 700);
    y += NAME;
    row.cells.forEach((c, i) => {
      const x = PAD + i * (cw + PAD);
      const fx = x + (M + l) * S;
      const fy = y + (M + u) * S;
      pane(x, y, cw, chh, S, fx, fy, [{ sp: c.sp, fx, fy, shadow: W_SHADOW }]);
      text(c.label, x + cw / 2, y + chh + 4, 14, '#e8e2ff', 500, 'center');
    });
    y += chh + LAB + PAD;
  }
  win.__ready = true;
}

if (mode === 'wswing') {
  const S = Number(parts[1]) || 2;
  const FPS = 30;
  const SWING_AT = 0.5;
  const SLAM_AT = 2.4;
  const slam = WARDEN.front.clips?.attack as Clip;
  const SLAM_END = slam.frames.length / slam.fps;
  const ROUND = SLAM_AT + SLAM_END + 0.5;
  const TICKS = Math.round(ROUND * FPS);
  const swing = moveOf(WARDEN.front, 'swing');
  const slamHit = MONSTERS.warden.windup;
  const frameAt = (t: number): Sprite => {
    if (t >= SWING_AT && t < SWING_AT + swing.frames.length / swing.fps) return at(swing, t - SWING_AT);
    if (t >= SLAM_AT && t < SLAM_AT + SLAM_END) return at(slam, t - SLAM_AT);
    return standing(WARDEN.front, t);
  };
  const R = MONSTERS.warden.aoe;
  let [l, r, u, d] = [0, 0, 0, 0];
  for (let i = 0; i < TICKS; i++) {
    const [a, b, e, f] = reachOf(frameAt(i / FPS));
    l = Math.max(l, a);
    r = Math.max(r, b);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  const [cx0, cy0] = ISO(1.6, 0);
  r = Math.max(r, (cx0 + R * 22.6) * 2 + 10);
  d = Math.max(d, (cy0 + R * 11.3) * 2 + 10);
  l = Math.max(l, (R * 22.6 - cx0) * 2 + 10);
  const PAD = 10;
  const M = 6;
  const W2 = (l + r + 2 * M) * S;
  const H = (u + d + 2 * M) * S;
  const HEAD = 56;
  cv.width = W2 + 2 * PAD;
  cv.height = HEAD + H + 34;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text('The Warden: a new swing, and his slam as it is', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. His swing, then his slam as today', PAD, 32, 14, '#cfc8ff', 600);
    const fx = PAD + (M + l) * S;
    const fy = HEAD + (M + u) * S;
    const ts = t - SLAM_AT;
    pane(PAD, HEAD, W2, H, S, fx, fy, [{ sp: frameAt(t), fx, fy, shadow: W_SHADOW }], ts >= 0 && ts < slamHit ? () => onFloor(fx, fy, S, () => warnCircle(cx0, cy0, R, ts / slamHit)) : undefined);
    text('The Warden', PAD + W2 / 2, HEAD + H + 6, 15, '#ffd866', 700, 'center');
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

if (mode === 'summon') {
  const S = Number(parts[1]) || 2;
  const FPS = 30;
  const CALL_AT = 0.5;
  const summon = moveOf(WARDEN.front, 'summon');
  const SKEL = makeSkeletonArt();
  const rise = moveOf(SKEL.front, 'crawl');
  const RISE_AT = CALL_AT + SUMMON_RISE;
  const RISE_LONG = rise.frames.length / rise.fps;
  const ROUND = RISE_AT + RISE_LONG + 1.6;
  const TICKS = Math.round(ROUND * FPS);
  /** Where the dead come up (tiles from him), and a little after one another. */
  const SPOTS: ReadonlyArray<readonly [number, number, number]> = [[1.7, 0.2, 0], [0.5, 1.7, 0.12], [1.5, -1.3, 0.2], [-0.8, 1.3, 0.3]];
  const wardenAt = (t: number): Sprite => (t >= CALL_AT && t < CALL_AT + summon.frames.length / summon.fps ? at(summon, t - CALL_AT) : standing(WARDEN.front, t));
  let [l, r, u, d] = [0, 0, 0, 0];
  for (let i = 0; i < TICKS; i++) {
    const [a, b, e, f] = reachOf(wardenAt(i / FPS));
    l = Math.max(l, a);
    r = Math.max(r, b);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  for (const [x, y] of SPOTS) {
    const [sx, sy] = ISO(x, y);
    const [a, b, e, f] = reachOf(SKEL.front.idle[0]);
    l = Math.max(l, a - sx * 2);
    r = Math.max(r, b + sx * 2);
    u = Math.max(u, e - sy * 2);
    d = Math.max(d, f + sy * 2);
  }
  const PAD = 10;
  const M = 8;
  const W2 = (l + r + 2 * M) * S;
  const H = (u + d + 2 * M) * S;
  const HEAD = 56;
  cv.width = W2 + 2 * PAD;
  cv.height = HEAD + H + 34;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text('The Warden calls the dead', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. The dead crawl out of the ground', PAD, 32, 14, '#cfc8ff', 600);
    const fx0 = PAD + (M + l) * S;
    const fy0 = HEAD + (M + u) * S;
    const who: Who[] = [];
    // (those further up the screen first, so that the nearer stand in front of them)
    const all: { x: number; y: number; sp: Sprite; shadow: number; alpha: number }[] = [{ x: 0, y: 0, sp: wardenAt(t), shadow: W_SHADOW, alpha: 1 }];
    for (const [x, y, late] of SPOTS) {
      const tr = t - RISE_AT - late;
      if (tr < 0) continue;
      const sp = tr < RISE_LONG ? at(rise, tr) : standing(SKEL.front, tr);
      // (no shadow while it is still in the ground)
      all.push({ x, y, sp, shadow: tr < RISE_LONG * 0.75 ? 0 : 9, alpha: 1 });
    }
    all.sort((a, b) => a.x + a.y - (b.x + b.y));
    for (const f of all) {
      const [sx, sy] = ISO(f.x, f.y);
      who.push({ sp: f.sp, fx: fx0 + sx * 2 * S, fy: fy0 + sy * 2 * S, shadow: f.shadow });
    }
    g.save();
    pane(PAD, HEAD, W2, H, S, fx0, fy0, who);
    g.restore();
    text('The Warden, and the dead he calls', PAD + W2 / 2, HEAD + H + 6, 15, '#ffd866', 700, 'center');
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}
