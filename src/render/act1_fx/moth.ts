// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE MOTH: what it does, drawn (render/act1_fx/types.ts), from the art
// chat's (art/moth_fx.ts, every painting anchored on its floor point and drawn the way its picture faces):
// - ITS BEAT: its stand and its drift by its own beat's clock (game/act1_rules/moth.ts beatOf), frame for frame the same, so its
//   wings never jump between them; on the book, its perch, and struck there, its own flinch;
// - THE GUST of the buffet (gustPainted), THE CLOUD of its Dust and the dust it sheds over him (cloudPainted), THE BEAMS of the
//   Eyes (beamsPainted), THE SWARM (swarmPainted), THE WIND of the beat (wavePainted), THE WORDS flying home as it dies
//   (wordsPainted), THE LAST CHAPTER on the stones (chapterPainted), its pages lifting in the wind of the wings;
// - ITS WARNINGS through each wind-up, in the enemy's pink: the cone, the cloud's round, the four beams' lines, the swarm's
//   stream, the beat's whole top (its ring), the shed dust's round where it will fall.
import { CHAPTER_CANVAS, FX_CANVAS, GUST_FX, WAVE_FX, beamsPainted, chapterPainted, cloudPainted, gustPainted, swarmPainted, wavePainted, wordsPainted } from '../../art/moth_fx';
import { BUFFET_CONE, DUST_CLOUD, EYE_BEAMS, MOTH, MOTH_BEAT, MOTH_BEAT_BLOW, MOTH_BUFFET, MOTH_DIES, MOTH_DUST, MOTH_EYES, MOTH_REEL, MOTH_SWARM, SWARM, beamLines, mothGeomAt } from '../../art/moth_moves';
import { toSprite } from '../../art/kit';
import { TILE3, paintViewOf } from '../../art/new_mobs3';
import type { Painted } from '../../art/kit';
import type { V3 } from '../../art/skeleton';
import { PASSING_MS, flipSprite, retireSprite } from '../../engine/px';
import { onWing } from '../../art/moth';
import type { Sprite } from '../../engine/px';
import { CLOUD_LONG, MOTH_TUNE, artToWorld, beatOf, bookOf, mothPhase, perched, swarmFrom, waveAt } from '../../game/act1_rules/moth';
import { clipFrame } from '../figure';
import { keptPictures } from './kept';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx, Act1FxCtx } from './types';
import { ECLIPSE, MOTH2, PHANTOMS, phantomWay } from '../../art/moth2';
import { GHOST_WING, HUSH_FX, deathLights, drawDeathMotes, drawEclipse, drawGhostWing, drawHushGround, drawHushSnow, drawMoon, drawPagesLoosing, drawPhantoms, drawPhantomsGather, drawUnwritingGround, drawUnwritingPages, moonAt } from '../../art/moth2_fx';

const FPS = 30;
/**
 * ITS EFFECTS' PICTURES, each made the first time it is shown (`owned`: every one made here, by toSprite or as the mirror image
 * of one of its own). KEPT UP TO `MADE_MOST` BYTES (four a pixel), THE LEAST LATELY SHOWN LET GO OF FIRST, and given back (the
 * queue's keep-moths-pictures-from-filling-memory, 12 Nov 2026): kept for the whole floor they were 156 MB 240 s into the
 * fight (measured, a phone's screen in Chrome on a cloud machine), and the words pouring out of it as it dies alone are 113
 * frames of about 1.2 MB, each shown once. One let go of is made again if it is shown again, as it was the first time.
 */
const MADE = keptPictures<string, Sprite>(true);
export const MADE_MOST = 96 * 1048576;
let madeBytes = 0;
const bytesOf = (s: Sprite): number => s.img.width * s.img.height * 4;
function made(key: string, back: boolean, flip: boolean, make: () => Painted, ax: number = FX_CANVAS.ax, ay: number = FX_CANVAS.ay): Sprite {
  const k = `${key}:${back ? 1 : 0}:${flip ? 1 : 0}`;
  let s = MADE.get(k);
  if (s) {
    // (shown: last in the line of those to let go of)
    MADE.delete(k);
    MADE.set(k, s);
    return s;
  }
  s = flip ? flipSprite(made(key, back, false, make, ax, ay)) : toSprite(make(), null, ax, ay);
  // (the floor left, the list emptied and its pictures given back: kept.ts forgetUnusedPictures; counted afresh)
  if (MADE.size === 0) madeBytes = 0;
  MADE.set(k, s);
  madeBytes += bytesOf(s);
  for (const [old, o] of MADE) {
    if (madeBytes <= MADE_MOST) break;
    if (old === k || (flip && old === `${key}:${back ? 1 : 0}:0`)) continue;
    // (a picture and its mirror image go together: giving back the one gives back the other, engine/px.ts releaseSprite)
    const base = old.slice(0, -1);
    for (const one of [`${base}0`, `${base}1`]) {
      const p = MADE.get(one);
      if (!p) continue;
      MADE.delete(one);
      madeBytes -= bytesOf(p);
      retireSprite(p, PASSING_MS);
    }
    void o;
  }
  return s;
}
/** How much its effects' pictures hold now (bytes), for the tests and for measuring. */
export function mothFxBytes(): number {
  return MADE.size ? madeBytes : 0;
}
/** Its picture's view and turn for a way (game/facing.ts). */
const viewOf = (fx: number, fy: number): { back: boolean; flip: boolean } => ({ back: fx + fy < -0.2, flip: fx - fy < 0 });
const pv = (back: boolean): 'front' | 'rear' | 'back' => paintViewOf(MOTH, back ? 'back' : 'front');
const D = Math.PI / 180;

// THE MOTH MADE GHOSTLY (art/moth2.ts MOTH2, off until his yes): her new attacks drawn straight onto the game's pixels
// (art/moth2_fx.ts), in place of the old paintings.
/** How high her thorax is as she rears for Eclipse, and as she wraps her wings round herself for her Phantoms (game pixels). */
let REAR_H = 0;
let WRAP_H = 0;
const rearH = (): number => (REAR_H ||= Math.max(60, mothGeomAt('eyes', MOTH_EYES.warn[1]).TC[2] / 2));
const wrapH = (): number => (WRAP_H ||= Math.max(50, mothGeomAt('swarm', MOTH_SWARM.warn[1]).TC[2] / 2));
/** Where every part of her is as she dies, kept a twentieth of a second at a time (her death's light comes off her wings). */
const DYING = new Map<number, ReturnType<typeof mothGeomAt>>();
const dyingAt = (t: number): ReturnType<typeof mothGeomAt> => {
  const k = Math.round(t * 20);
  let G = DYING.get(k);
  if (!G) DYING.set(k, (G = mothGeomAt('dying', k / 20)));
  return G;
};
/** Its Hush's reach (tiles from its middle): the old cloud's. */
const HUSH_R = DUST_CLOUD.tiles / 2;
/** The light in the dark, from a painter: as `c.spot`. */
const spotOf = (c: Act1FxCtx) => (x: number, y: number, r: number, a: number): void => c.spot(x, y, r, a);
/** Where he is on the screen (her eyes follow him). */
const heroOn = (c: Act1FxCtx): readonly [number, number] => {
  const [x, y] = c.at(c.game.hero.x, c.game.hero.y);
  return [x, y - 14];
};
/** The moon behind her and her shadow, `t` seconds into her Eyes' move (on past the blow), she at (x, y) casting along (ax, ay). */
function eclipseDrawn(c: Act1FxCtx, x: number, y: number, ax: number, ay: number, t: number): void {
  if (!c.g) return;
  const [sx, sy] = c.at(x, y);
  // (the moon up in the sky on her far side from him, where its light throws her shadow at him; kept on the screen)
  const [qx, qy] = c.at(x + ax * 4, y + ay * 4);
  const d = Math.hypot(qx - sx, qy - sy) || 1;
  const H = c.g.canvas?.height ?? 1e9;
  const W = c.g.canvas?.width ?? 1e9;
  const mx = Math.min(W - 60, Math.max(60, sx - ((qx - sx) / d) * 230));
  const my = Math.min(H - 60, Math.max(60, sy - rearH() - 40 - ((qy - sy) / d) * 70));
  drawMoon(c.g, mx, my, moonAt(t), c.t, spotOf(c));
  const [hx, hy] = heroOn(c);
  drawEclipse(c.g, c.at, x, y, ax, ay, t, hx, hy, c.t, spotOf(c));
}
/** How far from (x, y) along (wx, wy) the top goes on (tiles), or `most`: the lane's warning marked only over the top. */
function onTop(c: Act1FxCtx, x: number, y: number, wx: number, wy: number, most: number): number {
  const T = c.game.level.land?.tower;
  if (!T) return most;
  const dx = x - T.top.cx;
  const dy = y - T.top.cy;
  const b = dx * wx + dy * wy;
  const q = dx * dx + dy * dy - T.top.r * T.top.r;
  const disc = b * b - q;
  return disc < 0 ? most : Math.max(PHANTOMS.start, Math.min(most, -b + Math.sqrt(disc)));
}
/** Her phantoms' lanes marked, each until it has set off (`t`: seconds into her Swarm's move); over the top only. */
function lanesDrawn(c: Act1FxCtx, x: number, y: number, ax: number, ay: number, t: number): void {
  if (!c.g) return;
  for (let i = 0; i < PHANTOMS.n; i++) {
    const off = PHANTOMS.hit + i * PHANTOMS.apart + 0.12;
    const k = warnK(t, PHANTOMS.warn, off);
    if (k < 0) continue;
    const [wx, wy] = phantomWay(ax, ay, i);
    drawStripWarn(c.g, c.at, { x, y, fx: wx, fy: wy, hand: 1 }, PHANTOMS.start, onTop(c, x, y, wx, wy, PHANTOMS.long), -PHANTOMS.half, PHANTOMS.half, k, c.t);
  }
}

/** Where its death's words come out of it (its head, as it dies), by the death's moment; kept a twentieth of a second at a time. */
const MOUTH = new Map<number, V3>();
const mouthAt = (t: number): V3 => {
  const k = Math.round(t * 20);
  let p = MOUTH.get(k);
  if (!p) MOUTH.set(k, (p = mothGeomAt('dying', k / 20).HC));
  return p;
};

export const FX: Act1Fx | null = {
  // (its body fills the screen: struck, it flashes faintly, not the whole screen white)
  flash: 0.28,
  sprite(m, _art, set) {
    if (m.dead || m.act) return null;
    const moves = set.clips?.moves ?? {};
    const reel = perched(m) ? moves.perchReel : set.clips?.reel;
    if (reel && m.struckT !== undefined && m.struckT < MOTH_REEL) return clipFrame(reel, m.struckT);
    // (its beat, by its own clock: hovering and drifting the same frame for frame; on the book its perch)
    const i = Math.floor(beatOf(m) * MOTH_BEAT.fps + 1e-6) % MOTH_BEAT.frames;
    if (perched(m) && moves.perch) return moves.perch.frames[i];
    return m.anim === 'walk' ? set.walk[i] : set.idle[i];
  },
  ground(c, m, p) {
    if (!c.g) return;
    if (m && m.act && !m.dead) {
      const a = m.act;
      const wx = m.a1?.wx ?? m.fx;
      const wy = m.a1?.wy ?? m.fy;
      const w = { x: m.x, y: m.y, fx: wx, fy: wy, hand: a.hand };
      let k: number;
      switch (a.id) {
        case 'moth:buffet':
          if ((k = warnK(a.t, MOTH_BUFFET.warn[0] - 0.2, MOTH_BUFFET.hit)) >= 0) drawFanWarn(c.g, c.at, w, (-BUFFET_CONE.deg / 2) * D, (BUFFET_CONE.deg / 2) * D, BUFFET_CONE.tiles, k, c.t);
          break;
        case 'moth:dust':
          if ((k = warnK(a.t, MOTH_DUST.warn[0] - 0.2, MOTH_DUST.hit)) >= 0) drawFanWarn(c.g, c.at, { ...w, x: m.x + wx * DUST_CLOUD.ahead, y: m.y + wy * DUST_CLOUD.ahead }, -Math.PI, Math.PI, DUST_CLOUD.tiles / 2, k, c.t);
          break;
        case 'moth:eyes':
          // (made ghostly: ECLIPSE, the moon and her shadow till the blow; after it, its peril's)
          if (MOTH2.on) {
            if (a.t < ECLIPSE.hit) eclipseDrawn(c, m.x, m.y, m.a1?.ax ?? wx, m.a1?.ay ?? wy, a.t);
            break;
          }
          if ((k = warnK(a.t, MOTH_EYES.warn[0] - 0.2, MOTH_EYES.hit)) >= 0) {
            for (const b of beamLines(mothGeomAt('eyes', MOTH_EYES.hit))) {
              const s = artToWorld(m.x, m.y, wx, wy, [b.from[0] + MOTH_TUNE.eyes.from * TILE3, b.from[1], 0]);
              const e = artToWorld(m.x, m.y, wx, wy, [b.from[0] + b.to[0], b.from[1] + b.to[1], 0]);
              const len = Math.hypot(e.x - s.x, e.y - s.y) || 1;
              drawStripWarn(c.g, c.at, { x: s.x, y: s.y, fx: (e.x - s.x) / len, fy: (e.y - s.y) / len, hand: 1 }, 0, len, -EYE_BEAMS.wide / 2, EYE_BEAMS.wide / 2, k, c.t);
            }
          }
          break;
        case 'moth:swarm':
          // (made ghostly: her PHANTOMS' three lanes, each marked till it sets off)
          if (MOTH2.on) {
            if (a.t < PHANTOMS.hit) lanesDrawn(c, m.x, m.y, m.a1?.ax ?? wx, m.a1?.ay ?? wy, a.t);
            break;
          }
          if ((k = warnK(a.t, MOTH_SWARM.warn[0] - 0.2, MOTH_SWARM.hit)) >= 0) drawStripWarn(c.g, c.at, w, 1, SWARM.tiles, -SWARM.wide / 2, SWARM.wide / 2, k * 0.7, c.t);
          break;
        case 'moth:beat':
          if ((k = warnK(a.t, MOTH_BEAT_BLOW.warn[0] - 0.2, MOTH_BEAT_BLOW.hit)) >= 0) drawFanWarn(c.g, c.at, w, -Math.PI, Math.PI, 11, k * 0.55, c.t);
          break;
      }
    }
    // (made ghostly: what her blows leave on the floor, drawn in place of the old paintings)
    if (p && MOTH2.on) {
      switch (p.a1) {
        case 'moth:gust':
          drawGhostWing(c.g, c.at, p.x, p.y, p.fx, p.fy, p.t, spotOf(c));
          break;
        case 'moth:eclipse':
          eclipseDrawn(c, p.x, p.y, p.fx, p.fy, ECLIPSE.hit + p.t);
          break;
        case 'moth:phantoms':
          lanesDrawn(c, p.x, p.y, p.fx, p.fy, PHANTOMS.hit + p.t);
          break;
        case 'moth:dust':
        case 'moth:shed':
          drawHushGround(c.g, c.at, p.x, p.y, HUSH_R, p.t, c.t, spotOf(c));
          break;
        case 'moth:wave':
          drawUnwritingGround(c.g, c.at, p.x, p.y, waveAt(p.t), MOTH_TUNE.beat.wide, 1 - Math.min(1, Math.max(0, (p.t - WAVE_FX.reach) / (WAVE_FX.long - WAVE_FX.reach))));
          break;
      }
    }
    // (the dust it sheds over him: where it will fall)
    if (p && p.a1 === 'moth:shed' && p.t < 0) drawFanWarn(c.g, c.at, { x: p.x, y: p.y, fx: 1, fy: 0, hand: 1 }, -Math.PI, Math.PI, DUST_CLOUD.tiles / 2, Math.min(1, 1 + p.t / MOTH_TUNE.shed.warn), c.t);
  },
  standing(c, m, p) {
    // (the last chapter on the stones, from the moment it fell: under the Moth, its pages lifting as its wings beat)
    if (p && p.a1 === 'moth:book') {
      const B = bookOf(c.game.level);
      if (!B) return;
      const moth = c.game.monsters.find((q) => q.kind === 'moth' && !q.dead);
      const beating = moth && moth.act && moth.act.id === 'moth:beat';
      const wind = beating ? 1 : moth ? 0.35 : 0;
      const k = Math.floor((c.t * 10) % 20);
      const [sx, sy] = c.at(B.at.x, B.at.y);
      c.stand(B.book.x + B.book.y - 1.2, made(`book:${wind}:${wind > 0 ? k : 0}`, false, false, () => chapterPainted('front', wind, k / 10), CHAPTER_CANVAS.ax, CHAPTER_CANVAS.ay), sx, sy);
      return;
    }
    if (!p) return;
    // (made ghostly: these drawn straight on the floor and in the air, art/moth2_fx.ts: none of the old paintings)
    if (MOTH2.on && (p.a1 === 'moth:gust' || p.a1 === 'moth:dust' || p.a1 === 'moth:shed' || p.a1 === 'moth:wave')) return;
    const v = viewOf(p.fx, p.fy);
    const k = Math.floor(p.t * FPS);
    const [sx, sy] = c.at(p.x, p.y);
    switch (p.a1) {
      case 'moth:gust':
        if (p.t <= GUST_FX.long) c.stand(p.x + p.y + 0.5, made(`gust:${k}`, v.back, v.flip, () => gustPainted(k / FPS, pv(v.back))), sx, sy);
        return;
      case 'moth:dust':
      case 'moth:shed': {
        if (p.t < 0 || p.t > CLOUD_LONG) return;
        // (the cloud's painting is anchored on the Moth's floor point, the cloud DUST_CLOUD.ahead before it)
        const ax = p.a1 === 'moth:dust' ? p.b : p.x - DUST_CLOUD.ahead;
        const ay = p.a1 === 'moth:dust' ? p.c : p.y;
        const vv = p.a1 === 'moth:dust' ? v : { back: false, flip: false };
        const [qx, qy] = c.at(ax, ay);
        const kk = Math.floor(p.t * 15);
        c.stand(p.x + p.y + 0.6, made(`cloud:${kk}`, vv.back, vv.flip, () => cloudPainted(kk / 15, pv(vv.back))), qx, qy);
        return;
      }
      case 'moth:beams':
        c.stand(p.x + p.y + 0.4, made(`beams:${k}`, v.back, v.flip, () => beamsPainted(k / FPS, pv(v.back), mothGeomAt('eyes', MOTH_EYES.hit))), sx, sy);
        return;
      case 'moth:swarm':
        c.stand(p.x + p.y + 0.4, made(`swarm:${k}`, v.back, v.flip, () => swarmPainted(k / FPS, pv(v.back), swarmFrom())), sx, sy);
        return;
      case 'moth:wave':
        if (p.t <= WAVE_FX.long) c.stand(p.x + p.y + 0.3, made(`wave:${k}`, false, false, () => wavePainted(k / FPS, 'front')), sx, sy);
        return;
      case 'moth:words': {
        const kk = Math.floor(p.t * 20);
        if (kk / 20 > MOTH_DIES.words[1] + 2.2) return;
        c.stand(p.x + p.y + 0.8, made(`words:${kk}`, v.back, v.flip, () => wordsPainted(kk / 20, pv(v.back), mouthAt)), sx, sy);
        return;
      }
    }
    void m;
    void mothPhase;
  },
  air(c, m, p) {
    if (!MOTH2.on || !c.g || !p || p.a1 !== 'moth:words') return;
    // (the light she comes apart into: its light in the dark)
    const [sx, sy] = c.at(p.x, p.y);
    deathLights(sx, sy, (p.t - MOTH_DIES.crumble[0]) / (MOTH_DIES.crumble[1] - MOTH_DIES.crumble[0]), c.t, spotOf(c));
    void m;
  },
  glow(c, m, p) {
    // (what shines, drawn over the dark: her phantoms, her glowing scales, the burning pages)
    if (!MOTH2.on || !c.g) return;
    if (m && m.act && !m.dead) {
      const a = m.act;
      if (a.id === 'moth:swarm' && a.t < PHANTOMS.hit) {
        // (copies of her shimmering off her as she wraps her wings round herself)
        const k = Math.min(1, Math.max(0, (a.t - 0.4) / (PHANTOMS.hit - 0.4)));
        drawPhantomsGather(c.g, c.at, m.x, m.y, m.a1?.ax ?? m.fx, m.a1?.ay ?? m.fy, k * k, wrapH(), c.t);
      }
      if (a.id === 'moth:beat' && a.t < MOTH_BEAT_BLOW.hit) {
        // (the chapter's pages tearing loose as she rears)
        const B = bookOf(c.game.level);
        const k = Math.min(1, Math.max(0, (a.t - 0.3) / (MOTH_BEAT_BLOW.hit - 0.3)));
        if (B) drawPagesLoosing(c.g, c.at, B.book.x, B.book.y, k, c.t);
      }
      return;
    }
    if (!p) return;
    switch (p.a1) {
      case 'moth:words': {
        // (the light she comes apart into, off her wings and body as they crumble)
        const at = c.at;
        drawDeathMotes(c.g, p.t, MOTH_DIES.crumble, (i, born) => {
          const G = dyingAt(born);
          const w = G.wings[i % 4];
          const q: V3 = i % 5 === 0 ? (G.ab[(i * 7) % G.ab.length] ?? G.TC) : onWing(w, (0.2 + 0.75 * ((i * 0.618) % 1)) * w.len, (0.06 + 0.5 * ((i * 0.381) % 1)) * w.len);
          const f = artToWorld(p.x, p.y, p.fx, p.fy, q);
          const [sx, sy] = at(f.x, f.y);
          return [sx, sy - q[2] / 2];
        });
        return;
      }
      case 'moth:phantoms':
        drawPhantoms(c.g, c.at, p.x, p.y, p.fx, p.fy, p.t);
        return;
      case 'moth:dust':
      case 'moth:shed':
        drawHushSnow(c.g, c.at, p.x, p.y, HUSH_R, p.t);
        return;
      case 'moth:wave':
        drawUnwritingPages(c.g, c.at, p.x, p.y, waveAt(p.t), p.t, 1 - Math.min(1, Math.max(0, (p.t - WAVE_FX.reach) / (WAVE_FX.long - WAVE_FX.reach))));
        return;
    }
  },
};
void GHOST_WING;
void HUSH_FX;
