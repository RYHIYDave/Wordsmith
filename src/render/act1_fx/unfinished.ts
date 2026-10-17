// ACT 1: THE UNFINISHED, FLOOR 6'S BOSS: what it does to the floor and sends across it, drawn (render/act1_fx/types.ts).
//
// What its own pictures do not paint, where its rules put it (game/act1_rules/unfinished.ts): the stomp's ring of
// warning on the floor, in the enemy's pink and gold, as the floors 2 to 5 bosses' are (art/boss_shots.ts); the
// terrace cracked under its foot (the art's stompCracks); the hurled block (the art's hurledBlock, tumbling along
// its arc, blockFlight, then lying where it fell as cover), its shadow on the floor where it will come down (as
// the Ossuary Golem's skulls', art/mob_shots.ts) and the floor cracked where it lands; the rockslide's lanes marked
// on the floor (the great shot's line of aim, its dots running the way the boulders will roll) and its boulders
// (the art's boulderRolling, dropping off the cliff's foot and rolling down them), breaking at their ends. And its
// picture while it is still one with the wall: its stand and its flinch there (its moves there are its acts').

import { UF_FUSED_CLIPS } from '../../art/act1_figs/unfinished';
import { drawBallCrash, drawSweepRing } from '../../art/boss_shots';
import { drawAimLine, drawSkullShadow } from '../../art/mob_shots';
import { TILE3 } from '../../art/new_mobs3';
import { BLOCK_FLY_Z, BLOCK_H, blockFlight, boulderRolling, hurledBlock, stompCracks } from '../../art/unfinished';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { UF, inWall } from '../../game/act1_rules/unfinished';
import { actDef } from '../../game/bosses';
import { beside } from '../../game/facing';
import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

// (its things' pictures, painted the first time they are wanted)
const blocks: Sprite[] = [];
const boulders: Sprite[] = [];
const cracks: Sprite[] = [];
const blockOf = (i: number): Sprite => blocks[i] ?? (blocks[i] = hurledBlock(i));
const boulderOf = (i: number): Sprite => boulders[i] ?? (boulders[i] = boulderRolling(i));
const cracksOf = (i: number): Sprite => cracks[i] ?? (cracks[i] = stompCracks(i));

/** How far round a boulder is, rolled `d` tiles (its eighth of a turn: art boulderRolling, its radius 24 of its lengths). */
const ROUND = (2 * Math.PI * 24) / TILE3;
/** How high a boulder drops in from, off the cliff's foot (game pixels). */
const DROP_HIGH = 40;
/** How wide the block's shadow is as it lands: as wide as what it strikes (game pixels across, half). */
const SHADOW_WIDE = Math.round(UF.hurl.r * 16 * Math.SQRT2);

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // THE STOMP'S WARNING: a ring round where its foot will come down, as far as it strikes, brightening as it holds its knee up
      const a = m.act && m.state === 'act' ? actDef(m) : null;
      if (!a || !m.act || !/^unfinished:stomp/.test(a.id) || m.act.t >= a.hit) return;
      const S = UF.stomp;
      const o = beside(m.x, m.y, m.fx, m.fy, m.act.hand, S.at[0], S.at[1]);
      drawSweepRing(g, c.at, o.x, o.y, S.r, clamp01((m.act.t - S.warnFrom) / (a.hit - S.warnFrom - 0.05)), c.t);
      return;
    }
    if (!p) return;
    if (p.a1 === 'unfinished:cracks') {
      // the terrace cracked out from under its foot, growing, then lying; fading at the last
      const s = cracksOf(Math.min(3, Math.floor(p.t / 0.06)));
      const [sx, sy] = c.at(p.x, p.y);
      const was = g.globalAlpha;
      g.globalAlpha = was * clamp01((p.dur - p.t) / 1.5);
      g.drawImage(s.img, Math.round(sx - s.ax), Math.round(sy - s.ay), s.w, s.h);
      g.globalAlpha = was;
    } else if (p.a1 === 'unfinished:block') {
      if (!p.done) {
        // its shadow where it will come down: faint as it is held up, darker and wider as it falls
        const k = p.t < p.c ? 0.12 * clamp01(p.t / 0.3) : 0.12 + 0.88 * clamp01((p.t - p.c) / Math.max(0.01, p.hit - p.c));
        drawSkullShadow(g, c.at, p.x, p.y, 1 - k, 1, SHADOW_WIDE);
      } else if (p.t - p.hit < 1.4) drawBallCrash(g, c.at, p.x, p.y, p.t - p.hit);
      if (p.done && p.dur - p.t <= UF.hurl.crumble) drawBallCrash(g, c.at, p.x, p.y, 0.3 + UF.hurl.crumble - (p.dur - p.t));
    } else if (p.a1 === 'unfinished:lane') {
      // the lane marked on the floor, the way the boulder will roll, till it has gone by; then where it broke
      if (p.done !== 2) drawAimLine(g, c.at, p.a, p.b, p.a + p.fx * p.c, p.b + p.fy * p.c, clamp01(p.t / 0.35), c.t);
      else drawBallCrash(g, c.at, p.x, p.y, 0.2 + (p.t - p.hit));
    }
  },

  standing(c, m, p) {
    if (m || !p) return;
    if (p.a1 === 'unfinished:block') {
      if (!p.done) {
        // flying from its hands to where it comes down, tumbling end over end (its frames an eighth of a turn each)
        if (p.t < p.c) return;
        const k = clamp01((p.t - p.c) / Math.max(0.01, p.hit - p.c));
        const H = UF.hurl;
        const q = blockFlight([p.a * TILE3, p.b * TILE3, H.from[2] * TILE3], [p.x * TILE3, p.y * TILE3, BLOCK_H[2]], k);
        const x = q[0] / TILE3;
        const y = q[1] / TILE3;
        const [sx, sy] = c.at(x, y);
        c.stand(x + y, blockOf(Math.floor((p.t - p.c) * 12) % 4), sx, sy - (q[2] - BLOCK_FLY_Z) / 2);
      } else if (p.dur - p.t > UF.hurl.crumble * 0.5) {
        // lying where it fell: cover
        const [sx, sy] = c.at(p.x, p.y);
        c.stand(p.x + p.y, blockOf(4), sx, sy);
      }
    } else if (p.a1 === 'unfinished:lane') {
      if (p.t < p.hit || p.done === 2) return;
      // the boulder dropping off the cliff's foot, then rolling down its lane (painted rolling along the floor's y: along its x, turned over)
      const u = clamp01((p.t - p.hit) / UF.slide.drop);
      const s = boulderOf(Math.floor((p.d / ROUND) * 8) % 8);
      const [sx, sy] = c.at(p.x, p.y);
      c.stand(p.x + p.y, p.fx > 0.5 ? flipSprite(s) : s, sx, sy - DROP_HIGH * (1 - u) * (1 - u));
    }
  },

  sprite(m, art, set) {
    // STILL ONE WITH THE WALL: its stand there, and struck there (its moves there are its acts' own pictures). Its
    // pictures in the wall are from in front only (art/act1_figs/unfinished.ts): should it be turned up the screen (as
    // it looks at the hero before its fight is begun), it is shown from in front still.
    if (!inWall(m) || (m.state === 'act' && m.act)) return null;
    const more = set.clips?.moves?.[UF_FUSED_CLIPS.stand] ? set.clips.moves : art.front.clips?.moves ?? {};
    const stand = more[UF_FUSED_CLIPS.stand];
    const reel = more[UF_FUSED_CLIPS.reel];
    if (!stand) return null;
    if (m.frozenT > 0) return stand.frames[0];
    if (reel && m.struckT !== undefined && m.struckT < reel.frames.length / reel.fps) return clipFrame(reel, m.struckT);
    return clipFrame(stand, m.gait ? m.gait.t : m.animT);
  },
};
