// ACT 2, PART TWO, THE HIGH CITY: FLOOR 17: THE MASKED DANCERS: their pictures as the game holds a monster (art/act1_figs/
// types.ts), the art chat's (art/masque_dancers.ts, masque_dancers_moves.ts; his yes, “Yes, that's them (Recommended)”), as handed
// over: makeDancerArt3(DANCERS[who][room]), a lady and a gentleman in each of the six rooms' colours (the black room has none):
// their pose (stand), the whirl (walk), the spin (attack), struck (reel), the mask dropping (die), and their waltz and chime
// (clips.moves). Twelve looks, by form: the room's place times two, a lady 0 and a gentleman 1 (game/act1_rules/dancer.ts formOf),
// the first (form 0, the blue lady) the kind's own.
import { DANCERS_ON } from '../masque_dancers';
import { DANCERS, makeDancerArt3 } from '../masque_dancers_moves';
import type { Act1Fig } from './types';

const ROOMS = ['blue', 'purple', 'green', 'orange', 'white', 'violet'] as const;
// (the knight's size: the lady 56 tall, the gentleman 59, the knight 58)
const look = (who: 'lady' | 'gent', room: (typeof ROOMS)[number]): Act1Fig => ({ make: () => makeDancerArt3(DANCERS[who][room]), size: { top: who === 'lady' ? 28 : 30, half: 9 } });
const ALL: Act1Fig[] = ROOMS.flatMap((r) => [look('lady', r), look('gent', r)]);

export const FIG: Act1Fig | null = { ...ALL[0], switches: [DANCERS_ON], looks: ALL.slice(1) };
