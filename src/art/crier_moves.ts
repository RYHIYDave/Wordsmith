// FLOOR 11'S BOSS, THE CRIER: HIS MOVES (the art chat for floors 11 to 15, 18 Oct 2026). A MOCK-UP: NOT IN
// THE GAME, behind CRIER (art/crier.ts, off). His look and his brief are art/crier.ts.
//
// FOR NOW, HIS STANDING ONLY (his look, for the owner's yes before he is animated): every move here is his
// stand until his moves are made.

import { CR_BASE, CR_BODY, CR_CANVAS, crierBits } from './crier';
import type { ActorArt } from './actor_types';
import { mobSet } from './new_mobs3';
import type { Mob, MobMove } from './new_mobs3';
import type { Bones, Motion } from './skeleton';

const B = CR_BODY;
export const CR_READY: Bones = { ...CR_BASE };
const R = CR_READY;

// ---------------------------------------------------------------------------------------------
// STANDING, PLEASED WITH HIMSELF: his chest rising and swelling with his breath, rocking up onto his toes and
// back, his chin going up; his eyes going from side to side over the crowd that is not there. Three seconds round.

export const CR_STAND = 3.0;
function crStand(): Motion {
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.75, pose: { pz: R.pz + 1.2, bend: R.bend - 2.5, pitch: R.pitch - 1.5, faceUp: R.faceUp + 4, faceTurn: R.faceTurn - 10, lfp: -8, rfp: -8 }, ease: 'io' },
      { at: 1.5, pose: { pz: R.pz - 0.4, faceTurn: R.faceTurn + 4 }, ease: 'io' },
      { at: 2.25, pose: { pz: R.pz + 0.4, bend: R.bend - 1.2, faceUp: R.faceUp + 2, faceTurn: R.faceTurn + 12 }, ease: 'io' },
      { at: CR_STAND, pose: {}, ease: 'io' },
    ],
  };
}

const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });

export const CRIER_MOB: Mob = {
  id: 'crier',
  name: 'The Crier',
  size: 'a boss: a head taller than the knight, stout',
  build: B,
  stand: mv('The Crier stands, pleased with himself', crStand(), { glint: () => 0.2 }),
  attack: mv('The Crier (his swing, to come)', crStand()),
  idleFrames: 30,
  idleFps: 10,
  walk: mv('The Crier (his march, to come)', crStand()),
  walkFrames: 1,
  walkFps: 10,
  pace: 1.4,
  reel: mv('The Crier is struck (to come)', crStand()),
  reelTime: 0.3,
  hit: 0.6,
  warn: 0.3,
  dieTime: 2.6,
  dying: mv('The Crier dies (to come)', crStand()),
  aura: { x: CR_CANVAS.ax - 2, y: CR_CANVAS.ay - 54, r: 84, color: '#ff3a78', a: 0.15 },
  shadow: 26,
  canvas: CR_CANVAS,
  trueBack: true,
  bits: (st, m) => crierBits(st, m),
};

export function makeCrierArt(pace = CRIER_MOB.pace): ActorArt {
  return { front: mobSet(CRIER_MOB, 'front', pace), back: mobSet(CRIER_MOB, 'back', pace) };
}
