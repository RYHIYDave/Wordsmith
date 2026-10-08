// WHAT A HERO CARRIES WHEN IT IS NOT IN THE HAND (6 Oct 2026; NOT IN THE GAME).
//
// The owner, that evening, 21:33: "id like a town sprite for everyone where their weapons are on
// their backs?  this would also go in the class selection screen"; "except maybe the mage as her
// using he staff as a walking stick kinda works both ways"; and at 21:34: "then you can add as
// another idle animation them drawing their weapons and getting into their battle stance".
//
// So a weapon has a second place: ON THE BACK. A pose says which it is in (`Bones.stow`), and
// here is where that place is, for the painters (which paint the weapon there instead of in the
// hand) and for the moves (which must bring a hand to exactly that place to draw it, with the
// weapon lying in the hand at that moment just as it lies on the back). The place is fixed to
// the CHEST: it goes wherever the shoulders go.
//
//   - THE KNIGHT'S GREAT SWORD: its hilt up over his right shoulder, where his right hand goes
//     to it, the blade down across his back to beside his left knee.
//   - THE RANGER'S BOW: flat across his back the other way from his quiver (whose mouth is over
//     his right shoulder, where his right hand goes for an arrow): the upper limb over his left
//     shoulder, the lower by his right hip. His left hand, the bow hand, goes over his left
//     shoulder to its grip.
//   - The mage keeps her staff in her hand: nothing of hers is here.

import { add, along, aimFor, chestOf, mul, norm } from './skeleton';
import type { Bones, Build, Skeleton, V3 } from './skeleton';

export type Stowed = 'sword' | 'bow';

const D = Math.PI / 180;

/**
 * Where a weapon lies on a back, in the chest's own space (forward, left, up) from the root of
 * the neck: the place a hand holds it (`at`), the way it points (a blade's point; the arrow a bow
 * would shoot), and the line across it (a bow's upper limb).
 */
export function backPlace(b: Build, what: Stowed): { at: V3; point: V3; across: V3 } {
  if (what === 'sword') {
    // (clear of the mail and of what is worn over it; the blade leans 23 degrees from plumb)
    const lean = 23 * D;
    return { at: [-(b.ribDeep + b.pad + 2.2), -b.shoulderHalf * 0.42, 3.2], point: [0, Math.sin(lean), -Math.cos(lean)], across: [0, Math.cos(lean), Math.sin(lean)] };
  }
  // FLAT AGAINST HIS BACK, outside the cloak and the quiver on it, so that from behind the whole
  // of it is seen: the curve of its limbs and its string. (Worn with its string across his chest
  // and its limbs standing out from his back it was, from behind, a straight stick.) Its upper
  // limb leans 30 degrees toward his left shoulder; its string is below and to the left of its
  // grip, which lies between his shoulder blades.
  const lean = 30 * D;
  return { at: [-(b.ribDeep + 6.6), -1.7, -b.chest * 0.53], point: [0, -Math.cos(lean), Math.sin(lean)], across: [0, Math.sin(lean), Math.cos(lean)] };
}

/** That place on a posed figure: the grip, the way the weapon points and the line across it, in the figure's own space. */
export function onBack(b: Build, s: Skeleton, what: Stowed): { grip: V3; point: V3; across: V3 } {
  const p = backPlace(b, what);
  return { grip: add(s.neck, along(s.chest, p.at)), point: norm(along(s.chest, p.point)), across: norm(along(s.chest, p.across)) };
}

/**
 * The numbers of a pose that have a hand on the weapon where it lies on the back, and the weapon
 * lying in that hand just as it lies there: for the key of a move at which the hand takes hold
 * of it, or lets go of it. `body` is the rest of that key's pose (the weapon's own numbers are
 * measured on the figure, so they depend on how its chest is turned at that key).
 */
export function holdOnBack(b: Build, what: Stowed, left: boolean, body: Pick<Bones, 'yaw' | 'pitch' | 'roll' | 'twist' | 'bend' | 'side'>): Partial<Bones> {
  const p = backPlace(b, what);
  const chest = chestOf(body);
  const aim = aimFor(along(chest, p.point), along(chest, p.across));
  // (a hand measured from its own shoulder along the chest's lines: hand space 0)
  const x = p.at[0];
  const y = p.at[1] - (left ? b.shoulderHalf : -b.shoulderHalf);
  const z = p.at[2] + b.shoulderDrop;
  return left ? { lhIn: 0, lhx: x, lhy: y, lhz: z, ...aim } : { rhIn: 0, rhx: x, rhy: y, rhz: z, ...aim };
}
