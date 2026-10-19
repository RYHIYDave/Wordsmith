// ACT 2, THE HUSH: FLOOR 14: THE HUSHED PATIENTS: their pictures as the game holds a monster (art/act1_figs/types.ts), from the art chat's
// (art/patients.ts, patients_moves.ts, patient_shots.ts): makePatientArt3(), on the heroes' bones (mobSet, from in front and
// from behind, its shuffle at its own pace): their stand, their shuffle (walk), the silent scream (attack), struck (reel),
// the Hush leaving them (die), and in clips.moves lying in their beds (`abed`) and sitting up and rising out of them (`rise`).
//
// THE MAN ONLY, for now: the art drew a man and a woman for a ward (PATIENT_MAN, PATIENT_WOMAN), and the game holds one
// figure a kind (art/bestiary.ts figureOf: a kind's pictures, its death's too, are its kind's). The woman would be a figure
// of her own there, by a mark the rules give her: the planning chat's to bring in.

import { PATIENTS_ON } from '../patients';
import { PATIENT_MAN, makePatientArt3 } from '../patients_moves';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  make: () => makePatientArt3(PATIENT_MAN),
  // (measured off their stand as tests/act2_patient.test.ts measures it: the top of the bandaged head over the floor point, half their width at the body)
  size: { top: 28, half: 9 },
  switches: [PATIENTS_ON],
};
