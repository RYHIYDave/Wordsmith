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
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { CLOUD_LONG, MOTH_TUNE, artToWorld, beatOf, bookOf, mothPhase, perched, swarmFrom } from '../../game/act1_rules/moth';
import { clipFrame } from '../figure';
import { drawFanWarn, drawStripWarn, warnK } from './garden_warn';
import type { Act1Fx } from './types';

const FPS = 30;
const MADE = new Map<string, Sprite>();
function made(key: string, back: boolean, flip: boolean, make: () => Painted, ax: number = FX_CANVAS.ax, ay: number = FX_CANVAS.ay): Sprite {
  const k = `${key}:${back ? 1 : 0}:${flip ? 1 : 0}`;
  let s = MADE.get(k);
  if (!s) {
    s = flip ? flipSprite(made(key, back, false, make, ax, ay)) : toSprite(make(), null, ax, ay);
    MADE.set(k, s);
  }
  return s;
}
/** Its picture's view and turn for a way (game/facing.ts). */
const viewOf = (fx: number, fy: number): { back: boolean; flip: boolean } => ({ back: fx + fy < -0.2, flip: fx - fy < 0 });
const pv = (back: boolean): 'front' | 'rear' | 'back' => paintViewOf(MOTH, back ? 'back' : 'front');
const D = Math.PI / 180;

/** Where its death's words come out of it (its head, as it dies), by the death's moment; kept a twentieth of a second at a time. */
const MOUTH = new Map<number, V3>();
const mouthAt = (t: number): V3 => {
  const k = Math.round(t * 20);
  let p = MOUTH.get(k);
  if (!p) MOUTH.set(k, (p = mothGeomAt('dying', k / 20).HC));
  return p;
};

export const FX: Act1Fx | null = {
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
          if ((k = warnK(a.t, MOTH_SWARM.warn[0] - 0.2, MOTH_SWARM.hit)) >= 0) drawStripWarn(c.g, c.at, w, 1, SWARM.tiles, -SWARM.wide / 2, SWARM.wide / 2, k * 0.7, c.t);
          break;
        case 'moth:beat':
          if ((k = warnK(a.t, MOTH_BEAT_BLOW.warn[0] - 0.2, MOTH_BEAT_BLOW.hit)) >= 0) drawFanWarn(c.g, c.at, w, -Math.PI, Math.PI, 11, k * 0.55, c.t);
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
};
