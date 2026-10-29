// FLOOR 16'S BOSS, THE PRINCESS: HER MOVES (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind PRINCESS_ON
// (art/princess.ts, off). Her look and his brief are art/princess.ts.
//
// THIS FIRST STEP (his rulebook: a sheet of her standing, front and back, beside a hero, before anything moves): her
// stand, hovering. Her glide, her blows, struck and her death follow on his yes to her look; until then the moves the
// game holds a monster by are her stand.

import type { ActorArt } from './actor_types';
import { PRINCESS_BODY, PRINCESS_REST, PR_CANVAS, PR_STAND_LONG, princessPainter, princessStand } from './princess';
import { mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import type { Motion } from './skeleton';

const B = PRINCESS_BODY;
const R = PRINCESS_REST;

function princessMob(): Mob {
  const paint = princessPainter({});
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const stand = mv('The Princess hovers', princessStand());
  return {
    id: 'princess',
    name: 'The Princess',
    size: 'a boss: a head taller than the knight',
    build: B,
    stand,
    attack: stand,
    idleFrames: 28,
    idleFps: 10,
    walk: { ...stand, period: PR_STAND_LONG, ground: 0 },
    walkFrames: 28,
    walkFps: 10,
    pace: 0,
    reel: stand,
    reelTime: 0.4,
    hit: 0.5,
    warn: 0.3,
    dieTime: PR_STAND_LONG,
    dying: stand,
    aura: { x: PR_CANVAS.ax, y: PR_CANVAS.ay - 46, r: 44, color: '#9890b4', a: 0.08 },
    shadow: 14,
    canvas: PR_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
  };
}
export const PRINCESS = princessMob();
export function makePrincessArt3(mob: Mob = PRINCESS): ActorArt {
  return { front: mobSet(mob, 'front', mob.pace), back: mobSet(mob, 'back', mob.pace) };
}
