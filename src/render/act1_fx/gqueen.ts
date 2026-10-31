// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: THE QUEEN: what she does, drawn (render/act1_fx/types.ts), from the art chat's
// (art/queen_fx.ts; docs/mockups/queen/README.md). Her moves and their smears are in her own pictures; here:
// - HER HALL (her hall's peril, game/act1_rules/gqueen.ts hallPeril): its twelve pier glasses (hallMirrorPainted: still; awake,
//   their glass stirring, one more each phase; trembling, burst and growing back through her Shatter), and HER MIRROR at the
//   hall's end (talkingMirrorPainted: still, a fog drifting in it; speaking; the truth as she dies), each standing at its place
//   among the figures. The hall along the floor's y is the art's turned over (its x the floor's y).
// - HER POISON where the comb struck (cloudPainted), laid under the figures so it never hides him.
// - SHATTER'S GLASS in flight across the hall in its lanes (the art's own pieces, shardsAt, drawn as slivers of silver), and lying
//   glittering after.
// - HER WARNINGS through each hold, in the enemy's pink (garden_warn.ts): the comb's reach; her stab out of the glass; Shatter's
//   six lanes across the hall.
// Her pictures here are painted the first time they are wanted, and a few ahead each frame while her hall is near and she waits.
import { toSprite } from '../../art/kit';
import { TILE3 } from '../../art/new_mobs3';
import { ARENA, CLOUD_CANVAS, CLOUD_FX, HALL_AT, HALL_MIRRORS, HALL_MIRROR_CANVAS, SHATTER_FX, TALK_CANVAS, TALK_FX, cloudPainted, hallMirrorPainted, shardsAt, talkingMirrorPainted } from '../../art/queen_fx';
import { QN_COMB, QN_OUT, QN_SHATTER } from '../../art/queen_moves';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { AWAKE_ORDER, QUEEN_TUNE, hallAt, hallFrame, pierGlass, ringLife, ringSpots } from '../../game/act1_rules/gqueen';
import { figureOf } from '../../art/bestiary';
import type { Clip } from '../../art/actor_types';
import type { Peril } from '../../game/state';
import type { HallFrame } from '../../game/act1_rules/gqueen';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';

/** How often her hall's moving pictures change (a second): the glasses awake, her mirror, her poison. */
const FPS = 8;
/** A glass awake goes round in this long (the art's ripple: 2.4 s at half speed). */
const AWAKE_LOOP = 4.8;
/** Her mirror still, its fog drifting: round in this long. */
const STILL_LOOP = 4;
/** Shatter's moments a pier glass is painted at (seconds into her move), the nearest earlier shown. */
const SHATTER_KEYS = [0.45, 0.8, 1.1, 1.3, 1.4, 1.9, 2.7, 3.0, 3.3] as const;
/** Her mirror's speaking, from the start of a line (seconds), painted to here and then held going round its last second. */
const SPEAK_LONG = 3.8;

const MADE = new Map<string, Sprite>();
/** A picture of hers, made (and turned over for a hall along y) the first time it is asked for. */
function made(key: string, flip: boolean, paint: () => Sprite): Sprite {
  const k = `${key}:${flip ? 1 : 0}`;
  let s = MADE.get(k);
  if (!s) {
    s = flip ? flipSprite(made(key, false, paint)) : paint();
    MADE.set(k, s);
  }
  return s;
}
const glassKey = (i: number, t: number | null, awake: boolean): string => `glass:${i}:${t === null ? '-' : t.toFixed(3)}:${awake ? 1 : 0}`;
const glassSprite = (i: number, t: number | null, awake: boolean, flip: boolean): Sprite => made(glassKey(i, t, awake), flip, () => toSprite(hallMirrorPainted(i, t, awake), null, HALL_MIRROR_CANVAS.ax, HALL_MIRROR_CANVAS.ay));
const talkSprite = (mode: 'still' | 'speaking' | 'truth', t: number, flip: boolean): Sprite => made(`talk:${mode}:${t.toFixed(3)}`, flip, () => toSprite(talkingMirrorPainted(mode, t), null, TALK_CANVAS.ax, TALK_CANVAS.ay));
const cloudSprite = (t: number, flip: boolean): Sprite => made(`cloud:${t.toFixed(3)}`, flip, () => toSprite(cloudPainted(t), null, CLOUD_CANVAS.ax, CLOUD_CANVAS.ay));

/** A pier glass's moment of Shatter (its key), or null outside it. */
function shatterKey(since: number): number | null {
  if (since < SHATTER_KEYS[0] || since > SHATTER_FX.long) return null;
  let k: number = SHATTER_KEYS[0];
  for (const s of SHATTER_KEYS) if (s <= since) k = s;
  return k;
}

/** What is still to be painted ahead (her hall's pictures), and whether it has been set out. */
let ahead: (() => void)[] | null = null;
function warm(flip: boolean): void {
  if (!ahead) {
    ahead = [];
    const list = ahead;
    for (let i = 0; i < HALL_MIRRORS.length; i++) list.push(() => glassSprite(i, null, false, flip));
    for (let j = 0; j < STILL_LOOP * FPS; j++) list.push(() => talkSprite('still', j / FPS, flip));
    for (let j = 0; j < SPEAK_LONG * FPS; j++) list.push(() => talkSprite('speaking', j / FPS, flip));
    for (const i of AWAKE_ORDER) for (let j = 0; j < AWAKE_LOOP * FPS; j++) list.push(() => glassSprite(i, null, true, flip));
    for (const s of SHATTER_KEYS) for (let i = 0; i < HALL_MIRRORS.length; i++) list.push(() => glassSprite(i, s, false, flip));
    for (let j = 0; j < CLOUD_FX.long * FPS; j++) list.push(() => cloudSprite(j / FPS, flip));
    for (let j = 0; j <= TALK_FX.long * FPS; j++) list.push(() => talkSprite('truth', j / FPS, flip));
  }
  const next = ahead.shift();
  if (next) next();
}

/** Her hall's glasses and her mirror, standing among the figures. */
function standHall(c: Act1FxCtx, F: HallFrame, awake: number, shatterSince: number, talk: number, talkSince: number): void {
  const flip = !F.alongX;
  const now = c.game.time;
  for (let i = 0; i < HALL_MIRRORS.length; i++) {
    const at = pierGlass(F, i);
    const key = shatterSince >= 0 ? shatterKey(shatterSince) : null;
    const isAwake = AWAKE_ORDER.slice(0, awake).includes(i as never);
    const s = key !== null ? glassSprite(i, key, false, flip) : isAwake ? glassSprite(i, null, true, flip) : glassSprite(i, null, false, flip);
    const [sx, sy] = c.at(at.x, at.y);
    c.stand(at.x + at.y, s, sx, sy);
  }
  void now;
  const H = c.game.level.land?.gallery?.hall;
  if (!H) return;
  const t = c.game.time;
  const s =
    talk === 2
      ? talkSprite('truth', Math.min(TALK_FX.long, Math.floor((t - talkSince) * FPS) / FPS), flip)
      : talk === 1
        ? talkSprite('speaking', Math.min(SPEAK_LONG * FPS - 1, Math.floor((t - talkSince) * FPS)) / FPS, flip)
        : talkSprite('still', (Math.floor(t * FPS) % (STILL_LOOP * FPS)) / FPS, flip);
  const [sx, sy] = c.at(H.mirror.x, H.mirror.y);
  c.stand(H.mirror.x + H.mirror.y, s, sx, sy);
}

/** Shatter's six lanes across the hall, lit through its warning. */
function laneWarn(c: Act1FxCtx, F: HallFrame, k: number): void {
  if (!c.g || k < 0) return;
  const half = QUEEN_TUNE.shatter.half;
  const across = (2 * ARENA.b) / TILE3;
  for (const a of HALL_AT) {
    const from = hallAt(F, a * TILE3, ARENA.b);
    drawStripWarn(c.g, c.at, { x: from.x, y: from.y, fx: -F.v.x, fy: -F.v.y, hand: 1 }, 0, across, -half, half, k, c.t);
  }
}

/** Shatter's glass: in flight across the hall in its lanes (the art's pieces), then lying and glittering. */
function shatterGlass(c: Act1FxCtx, F: HallFrame, since: number): void {
  const g = c.g;
  if (!g) return;
  const [b0] = SHATTER_FX.burst;
  if (since < b0 || since > SHATTER_FX.lie[1]) return;
  const flying = since < b0 + SHATTER_FX.fly + 0.15;
  const pieces = shardsAt(since);
  for (let n = 0; n < pieces.length; n += flying ? 1 : 3) {
    const { p } = pieces[n];
    const w = hallAt(F, p[0], p[1]);
    const [sx, sy] = c.at(w.x, w.y);
    const up = (p[2] ?? 0) / 2;
    const glint = ((n * 7 + Math.floor(c.t * 12)) & 3) === 0;
    g.fillStyle = glint ? '#f5f7ff' : n % 3 ? '#9ea4bf' : '#cdd2e6';
    if (flying) g.fillRect(Math.round(sx) - 1, Math.round(sy - up) - 1, 3, 2);
    else if (glint) g.fillRect(Math.round(sx), Math.round(sy), 1, 1);
  }
}

// ---------------------------------------------------------------------------------------------------
// THE RING OF MIRRORS (his fifth for her, 30 Oct 2026): six of her hall's pier glasses risen round him, her in every one

/** Where a pier glass's glass is on its picture (picture pixels): every pixel of the cold blue of its glass, its foot's middle. */
const GLASS = new Map<Sprite, { mask: HTMLCanvasElement; x: number; y: number } | null>();
function glassOf(s: Sprite): { mask: HTMLCanvasElement; x: number; y: number } | null {
  if (GLASS.has(s)) return GLASS.get(s)!;
  let out: { mask: HTMLCanvasElement; x: number; y: number } | null = null;
  const W = s.img.width;
  const H = s.img.height;
  const g = typeof document !== 'undefined' ? s.img.getContext('2d') : null;
  if (g && W > 0 && H > 0) {
    const d = g.getImageData(0, 0, W, H).data;
    const mask = document.createElement('canvas');
    mask.width = W;
    mask.height = H;
    const mg = mask.getContext('2d')!;
    const md = mg.createImageData(W, H);
    let sx = 0;
    let n = 0;
    let low = 0;
    for (let i = 0; i < W * H; i++) {
      const r = d[i * 4];
      const gg = d[i * 4 + 1];
      const b = d[i * 4 + 2];
      if (d[i * 4 + 3] < 200 || !(b > r + 12 && b > gg + 6)) continue;
      md.data[i * 4 + 3] = 255;
      sx += i % W;
      n++;
      low = Math.max(low, Math.floor(i / W));
    }
    mg.putImageData(md, 0, 0);
    if (n > 20) out = { mask, x: sx / n, y: low };
  }
  GLASS.set(s, out);
  return out;
}
/** A pier glass with her in it: her picture laid in its glass, cold and faint, nowhere else. */
const IN_GLASS = new Map<string, Sprite>();
function herInGlass(key: string, mirror: Sprite, her: Sprite): Sprite {
  const k = key;
  const have = IN_GLASS.get(k);
  if (have) return have;
  const gl = glassOf(mirror);
  if (!gl || typeof document === 'undefined') return mirror;
  const W = mirror.img.width;
  const H = mirror.img.height;
  const dens = mirror.img.width / Math.max(1, mirror.w);
  const her1 = document.createElement('canvas');
  her1.width = W;
  her1.height = H;
  const hg = her1.getContext('2d')!;
  const hd = her.img.width / Math.max(1, her.w);
  const sc = dens / hd;
  hg.drawImage(her.img, gl.x - her.ax * dens, gl.y - her.ay * dens + 2 * dens, her.img.width * sc, her.img.height * sc);
  hg.globalCompositeOperation = 'source-atop';
  hg.fillStyle = 'rgba(150, 160, 210, 0.35)';
  hg.fillRect(0, 0, W, H);
  hg.globalCompositeOperation = 'destination-in';
  hg.drawImage(gl.mask, 0, 0);
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const cg = cv.getContext('2d')!;
  cg.drawImage(mirror.img, 0, 0);
  cg.globalAlpha = 0.7;
  cg.drawImage(her1, 0, 0);
  const s: Sprite = { ...mirror, img: cv };
  IN_GLASS.set(k, s);
  return s;
}
/** Her standing picture now (the way she faces him from her glass), or null. */
function herNow(c: Act1FxCtx): Sprite | null {
  const m = c.game.monsters.find((q) => q.kind === 'gqueen' && !q.dead);
  if (!m) return null;
  const art = c.bestiary.of(figureOf(m));
  const list = art.front.idle;
  return list.length ? list[Math.floor(c.game.time * 10) % list.length] ?? null : null;
}
/** The ring of mirrors standing among the figures: forming, still with her in each, trembling as its time runs out, burst. */
function standRing(c: Act1FxCtx, p: Peril): void {
  const R = QUEEN_TUNE.ring;
  const spots = ringSpots(c.game, p);
  const her = herNow(c);
  const herK = her ? Math.floor(c.game.time * 10) : -1;
  spots.forEach((q, i) => {
    const broken = (p.b & (1 << i)) !== 0 || p.c !== 0;
    const glassI = (i * 2) % HALL_MIRRORS.length;
    let s: Sprite;
    if (broken) s = glassSprite(glassI, 1.9, false, false);
    else if (p.t < 0.45) s = glassSprite(glassI, p.t < 0.15 ? 2.7 : p.t < 0.3 ? 3.0 : 3.3, false, false);
    else if (p.t > R.long - R.warn) s = glassSprite(glassI, [0.8, 1.1, 1.3][Math.floor(c.t * 12) % 3], false, false);
    else {
      const still = glassSprite(glassI, null, false, false);
      s = her ? herInGlass(`${glassI}:${herK % 1000}`, still, her) : still;
    }
    const [sx, sy] = c.at(q.x, q.y);
    c.stand(q.x + q.y, s, sx, sy);
  });
}

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    // (gone into her glass, in the ring: none of her)
    if (!m.act || m.act.id !== 'gqueen:inring') return null;
    const clip = set.clips?.moves?.glassIn as Clip | undefined;
    return clip && clip.frames.length ? clip.frames[clip.frames.length - 1] ?? null : null;
  },
  ground(c, m, p) {
    if (!c.g) return;
    if (p && p.a1 === 'gqueen:ring' && p.c === 0) {
      // (as its time runs out: where his blow will fall, round him)
      const R = QUEEN_TUNE.ring;
      const k = warnK(p.t, R.long - R.warn, R.long);
      const h = c.game.hero;
      if (k >= 0) drawFanWarn(c.g, c.at, { x: h.x, y: h.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, 1.0, k, c.t);
      return;
    }
    const F = hallFrame(c.game);
    if (p && p.a1 === 'gqueen:cloud' && !p.done) {
      const t = Math.min(CLOUD_FX.long - 1 / FPS, Math.floor(p.t * FPS) / FPS);
      const s = cloudSprite(t, !!F && !F.alongX);
      const [sx, sy] = c.at(p.x, p.y);
      c.g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy) - s.ay, s.w, s.h);
      return;
    }
    if (p && p.a1 === 'gqueen:hall' && F && p.b >= 0) {
      const since = c.game.time - p.b;
      laneWarn(c, F, warnK(since, QN_SHATTER.warn[0] - 0.2, QN_SHATTER.hit));
      if (since > SHATTER_FX.burst[0] + SHATTER_FX.fly) shatterGlass(c, F, since);
      return;
    }
    if (!m || !m.act) return;
    const w = { x: m.x, y: m.y, fx: m.fx, fy: m.fy, hand: m.act.hand };
    if (m.act.id === 'gqueen:comb') {
      const k = warnK(m.act.t, QN_COMB.warn[0] - 0.2, QN_COMB.hit);
      if (k >= 0) drawFanWarn(c.g, c.at, w, -QUEEN_TUNE.comb.half, QUEEN_TUNE.comb.half, QUEEN_TUNE.comb.reach, k, c.t);
    } else if (m.act.id === 'gqueen:out') {
      const k = warnK(m.act.t, QN_OUT.warn[0] - 0.2, QN_OUT.hit);
      if (k >= 0) drawFanWarn(c.g, c.at, w, -QUEEN_TUNE.glass.half, QUEEN_TUNE.glass.half, QUEEN_TUNE.glass.reach, k, c.t);
    }
  },
  standing(c, _m, p) {
    if (p && p.a1 === 'gqueen:ring') {
      standRing(c, p);
      return;
    }
    if (!p || p.a1 !== 'gqueen:hall') return;
    const F = hallFrame(c.game);
    if (!F) return;
    // (her pictures painted ahead, one a frame, while her hall is near and she waits for him)
    const h = c.game.hero;
    const she = c.game.monsters.find((q) => q.kind === 'gqueen' && !q.dead);
    if (she && she.state === 'sleep' && Math.hypot(h.x - F.x, h.y - F.y) < 26) warm(!F.alongX);
    standHall(c, F, p.a, p.b >= 0 ? c.game.time - p.b : -1, p.c, p.d);
  },
  air(c, _m, p) {
    if (p && p.a1 === 'gqueen:ring' && p.c === 0 && c.g && p.t > 0.45) {
      // (each mirror's bar of life over it, as a monster's: his word, “give each mirror a HP bar”)
      const g = c.g;
      const life = ringLife(p);
      ringSpots(c.game, p).forEach((q, i) => {
        if (p.b & (1 << i)) return;
        const [sx, sy] = c.at(q.x, q.y);
        const w = 20;
        const x = Math.round(sx - w / 2);
        const y = Math.round(sy - 62);
        g.fillStyle = '#100c18';
        g.fillRect(x - 1, y - 1, w + 2, 5);
        g.fillStyle = '#3a1428';
        g.fillRect(x, y, w, 3);
        g.fillStyle = '#ff3a78';
        g.fillRect(x, y, Math.round((w * Math.max(0, life.left[i])) / QUEEN_TUNE.ring.life), 3);
        g.fillStyle = '#ffd0e4';
        g.fillRect(x, y, Math.round((w * Math.max(0, life.left[i])) / QUEEN_TUNE.ring.life), 1);
      });
      return;
    }
    if (p && p.a1 === 'gqueen:ring' && p.c === 2 && c.g) {
      // (time run out: the glass of every mirror still whole flung at him)
      const k = (p.t - p.d) / QUEEN_TUNE.ring.fly;
      if (k > 1.2) return;
      const h = c.game.hero;
      const g = c.g;
      ringSpots(c.game, p).forEach((q, i) => {
        if (p.b & (1 << i)) return;
        for (let j = 0; j < 7; j++) {
          const u = Math.min(1, k + j * 0.04);
          const x = q.x + (h.x - q.x) * u;
          const y = q.y + (h.y - q.y) * u;
          const [sx, sy] = c.at(x, y);
          g.fillStyle = j === 0 ? '#f5f7ff' : j % 2 ? '#cdd2e6' : '#ff9cc4';
          g.fillRect(Math.round(sx) - 1, Math.round(sy) - 22 + j, 2, 2);
        }
      });
      return;
    }
    if (!p || p.a1 !== 'gqueen:hall' || p.b < 0) return;
    const F = hallFrame(c.game);
    if (!F) return;
    const since = c.game.time - p.b;
    if (since >= SHATTER_FX.burst[0] && since <= SHATTER_FX.burst[0] + SHATTER_FX.fly + 0.15) shatterGlass(c, F, since);
  },
};
