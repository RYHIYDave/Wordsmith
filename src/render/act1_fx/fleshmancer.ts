// THE FLESHMANCER'S MOVES DONE THE ACTION WAY (game/fm_action.ts FM_ACTION): what they send out over the floor, drawn
// (render/act1_fx/types.ts), by the art chat's own painters (art/fleshmancer_action_fx.ts, his yes, 2 Nov 2026), each painted afresh a
// frame at a time (render/act1_fx/live.ts). His moves themselves are in his own pictures (art/fleshmancer_action.ts, FLESH_ACTION).
// - HIS SHARDS (FM_SHARDS): each fan's lanes marked on the floor and their shadows (under the figures); the shards drawn up, hanging,
//   flung, bursting (among the figures, at his middle's depth). Each fan by its own aim.
// - HIS RINGS (FM_RINGS): their cracks lit in the floor (under the figures); the hands of his dead bursting up out of them, ring by
//   ring (the game's own hands, art/fleshmancer.ts makeRingHandArt), each among the figures at its own depth.
// - HIS FIRE, OR A MINI FLESHMANCER'S (FM_FIRE): the scorch and char under the lanes (under the figures); the stream out of the
//   skull's jaws (between the mini's claws) whipped round and the lanes' flames (among the figures, at his depth); their light.
// - A BONE HEAP (FM_HEAP), lit and cracking as it shakes, bursting as its dead come up; THE PIT under him as he is yanked down
//   (FM_PIT); WHERE HE WILL RISE (FM_RISE), its ring of fire filling in, then the burst as he erupts.
import { makeRingHandArt, FM_HAND_FPS, FM_HAND_FRAMES, FM_HAND_KINDS } from '../../art/fleshmancer';
import { skullAt } from '../../art/fleshmancer_action';
import { FIRE, MINI_FIRE, RINGS, RISE_MARK, SHARDS, paintFire, paintHeap, paintRingCracks, paintRiseMark, paintShards, paintSinkPit, ringBurst, ringHands } from '../../art/fleshmancer_action_fx';
import { GRID } from '../../art/skeleton';
import { TILE3 } from '../../art/new_mobs3';
import { drawSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { FM_FIRE, FM_HEAP, FM_PIT, FM_RINGS, FM_RISE, FM_SHARDS } from '../../game/fm_action';
import type { Peril } from '../../game/state';
import { livePicture, picAt, picAtFacing } from './live';
import type { Act1Fx, Act1FxCtx } from './types';

const FPS = 30;
const TAU = Math.PI * 2;
/** How much room a picture needs round its anchor for `r` tiles of floor all round it and `up` picture pixels over it. */
function room(r: number, up: number): { w: number; h: number; ax: number; ay: number } {
  const hw = Math.ceil(45.3 * r) + 12;
  const hh = Math.ceil(22.7 * r) + 12;
  return { w: hw * 2, h: hh * 2 + up, ax: hw, ay: hh + up };
}
const SHARD_ROOM = room(SHARDS.reach + 0.6, 70);
const RING_ROOM = room(RINGS.radii[RINGS.radii.length - 1] + 0.6, 0);
const FIRE_ROOM = room(FIRE.reach + 0.5, 130);
const MINI_ROOM = room(MINI_FIRE.reach + 0.5, 80);
const HEAP_ROOM = room(2.0, 120);
const PIT_ROOM = room(1.2, 20);
const RISE_ROOM = room(RISE_MARK.r + 0.6, 90);

/** A picture of one of his perils, painted for this frame of its clock. */
function pic(p: Peril, what: string, R: { w: number; h: number; ax: number; ay: number }, paint: (px: import('../../engine/px').Px, at: ReturnType<typeof picAt>) => void, facing = false): Sprite | null {
  const k = Math.floor(p.t * FPS);
  const at = facing ? picAtFacing(R.ax, R.ay, p.fx, p.fy, p.hand ?? 1) : picAt(R.ax, R.ay);
  return livePicture(`fm:${what}:${p.a1}:${p.x.toFixed(2)}:${p.y.toFixed(2)}`, R.w, R.h, R.ax, R.ay, `${k}`, (px) => paint(px, at));
}
/** Drawn on the floor, its anchor at the peril's floor point. */
function onFloor(c: Act1FxCtx, p: Peril, s: Sprite | null): void {
  if (!s || !c.g) return;
  const [sx, sy] = c.at(p.x, p.y);
  drawSprite(c.g, s, sx, sy);
}
/** Stood among the figures at the peril's depth (`more` added to it). */
function standing(c: Act1FxCtx, p: Peril, s: Sprite | null, more = 0.01): void {
  if (!s) return;
  const [sx, sy] = c.at(p.x, p.y);
  c.stand(p.x + p.y + more, s, sx, sy);
}

/** Where the skull's jaws are over his floor point, `t` seconds into his fire (tiles before him, to his left; picture pixels up), once a frame of it. */
const JAWS = new Map<number, [number, number, number]>();
function jaws(t: number): [number, number, number] {
  const k = Math.max(0, Math.min(120, Math.floor(t * FPS)));
  let j = JAWS.get(k);
  if (!j) {
    const s = skullAt('fire', k / FPS);
    j = [s[0] / TILE3, s[1] / TILE3, s[2] * GRID];
    JAWS.set(k, j);
  }
  return j;
}

let HANDS: Sprite[][] | null = null;

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    if (m || !p || !p.a1) return;
    switch (p.a1) {
      case FM_SHARDS:
        onFloor(c, p, pic(p, 'floor', SHARD_ROOM, (px, at) => {
          paintShards(px, at, p.t, [0, 0], p.b, 'floor', undefined, 0);
          if (Number.isFinite(p.c)) paintShards(px, at, p.t, [0, 0], p.c, 'floor', undefined, 1);
        }));
        break;
      case FM_RINGS:
        onFloor(c, p, pic(p, 'floor', RING_ROOM, (px, at) => paintRingCracks(px, at, p.t, [0, 0], p.b)));
        break;
      case FM_FIRE: {
        const mini = p.d === 1;
        onFloor(c, p, pic(p, 'floor', mini ? MINI_ROOM : FIRE_ROOM, (px, at) => paintFire(px, at, p.t, [0, 0], 0, null, 'floor', mini), true));
        break;
      }
      case FM_HEAP:
        onFloor(c, p, pic(p, 'floor', HEAP_ROOM, (px, at) => paintHeap(px, at, p.t, [0, 0], p.b, 'floor')));
        break;
      case FM_PIT:
        onFloor(c, p, pic(p, 'floor', PIT_ROOM, (px, at) => paintSinkPit(px, at, p.t, [0, 0])));
        break;
      case FM_RISE:
        if (p.t < -RISE_MARK.warn) break;
        onFloor(c, p, pic(p, 'floor', RISE_ROOM, (px, at) => paintRiseMark(px, at, p.t, [0, 0], 'floor')));
        break;
      default:
        break;
    }
  },
  standing(c, m, p) {
    if (m || !p || !p.a1) return;
    switch (p.a1) {
      case FM_SHARDS:
        standing(c, p, pic(p, 'air', SHARD_ROOM, (px, at) => {
          paintShards(px, at, p.t, [0, 0], p.b, 'air', undefined, 0);
          if (Number.isFinite(p.c)) paintShards(px, at, p.t, [0, 0], p.c, 'air', undefined, 1);
        }));
        break;
      case FM_RINGS: {
        // (the hands of his dead, ring by ring as each bursts up, each at its own depth)
        const hands = (HANDS ??= Array.from({ length: FM_HAND_KINDS }, (_, k) => makeRingHandArt('front', k)));
        RINGS.radii.forEach((r, i) => {
          const since = p.t - ringBurst(i);
          if (since < 0) return;
          for (const { j, a } of ringHands(i).hands) {
            const f = Math.floor((since - ((j * 7) % 5) * 0.012) * FM_HAND_FPS);
            if (f < 0 || f >= FM_HAND_FRAMES) continue;
            const x = p.x + Math.cos(p.b + a) * r;
            const y = p.y + Math.sin(p.b + a) * r;
            const [sx, sy] = c.at(x, y);
            c.stand(x + y, hands[j % FM_HAND_KINDS][f], sx, sy);
            if (f < 6) c.spot(sx, sy - 10, 22, 0.5);
          }
        });
        break;
      }
      case FM_FIRE: {
        const mini = p.d === 1;
        const J = mini ? ([0.35, -0.2, 40] as [number, number, number]) : jaws(p.t);
        standing(c, p, pic(p, 'air', mini ? MINI_ROOM : FIRE_ROOM, (px, at) => paintFire(px, at, p.t, [0, 0], 0, at(J[0], -J[1], J[2]), 'air', mini), true));
        // (its light: along where it pours now, and over the lanes burning)
        const S = mini ? MINI_FIRE : FIRE;
        const [sx, sy] = c.at(p.x, p.y);
        if (p.t < (mini ? 2.6 : 4.0)) c.spot(sx, sy - 10, mini ? 50 : 110, 0.6);
        void S;
        break;
      }
      case FM_HEAP:
        standing(c, p, pic(p, 'air', HEAP_ROOM, (px, at) => paintHeap(px, at, p.t, [0, 0], p.b, 'air')));
        break;
      case FM_RISE:
        if (p.t < 0) break;
        standing(c, p, pic(p, 'air', RISE_ROOM, (px, at) => paintRiseMark(px, at, p.t, [0, 0], 'air')), 0.3);
        break;
      default:
        break;
    }
  },
};
void TAU;
