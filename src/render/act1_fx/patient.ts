// ACT 2, THE HUSH: FLOOR 14: THE HUSHED PATIENTS: what they do to the floor and send across it, drawn (render/act1_fx/types.ts),
// from the art chat's (art/patients.ts, patients_moves.ts, patient_shots.ts), where their rules (game/act1_rules/patient.ts)
// have it:
//   THEIR FIGURE IN BED: while one lies in its bed, its picture is the art's `abed` (on its back, asleep, mouthing),
//     going round from where its clock has come to; the bed under it is the floor's own piece, laid by the map-maker
//     and shown in its risen-from frame by the rules (the art: "Draw the bed first and the patient over it": the bed
//     stands behind the patient's floor point, so it is drawn first among the figures). Its rising is its rules' act,
//     its picture played whole.
//   THE SILENT SCREAM'S BURST across the floor (art/patient_shots.ts drawScreamBurst): from the mouth, as the scream
//     bursts out of them, the fan of the Hush rolling out before them; drawn over what stands, as the art's own film
//     lays it over the figure (it leaves the mouth well up off the floor and comes down onto it).
// Nothing in it glows: the Hush's own greys.

import { drawScreamBurst } from '../../art/patient_shots';
import { PATIENT, screamFrom } from '../../game/act1_rules/patient';
import { clipFrame } from '../figure';
import type { Act1Fx } from './types';

export const FX: Act1Fx | null = {
  sprite(m, _art, set) {
    if (!m.a1 || m.a1.bed !== 1) return null;
    const abed = set.clips?.moves?.abed;
    return abed && abed.frames.length ? clipFrame(abed, m.animT) : null;
  },
  air(c, m) {
    if (!m || !c.g || !m.act || m.act.id !== 'patient:scream') return;
    const u = m.act.t - PATIENT.scream.hit;
    if (u < 0 || u >= PATIENT.scream.long) return;
    const o = screamFrom(m);
    drawScreamBurst(c.g, c.at, o.x, o.y, m.fx, m.fy, u);
  },
};
