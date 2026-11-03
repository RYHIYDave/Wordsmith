// THE VETERAN'S FILM, ITS PARTS (the art chat, 2 Nov 2026): what is shown, in order, and the captions, in plain words. A
// MOCK-UP; NOTHING OF THE GAME IMPORTS IT. Every move from in front and from behind side by side; his six combos in a row,
// the globes filling over him; the biggest blows again at half speed (tools/veteran_film.ts).

import { VET_COMBOS, VET_RUN, VET_STAND, closeKickOf, kneeOf, motionById, upperOf } from './veteran_moves';
import type { Input, Reaction, VetMotion } from './veteran_moves';
import type { Play, Step } from './veteran_scene';
import { playLong } from './veteran_scene';

export interface FilmPart {
  title: string;
  line: string;
  play: Play;
  /** From which frame of the play, for how many (the play's own frames), at what speed (1, or 0.5 for half). */
  from: number;
  long: number;
  speed: number;
  /** The views shown side by side (0 in front of him, 90 from behind), and how many film pixels to one of the game's. */
  views: number[];
  k: number;
  sy?: number;
  ahead?: number;
}

/** The push kick's foes: three in the cone in front of him, one outside it (not hit: it is a cone). */
const PUSH_FOES: [number, number][] = [[47, -8], [76, 15], [96, -31], [20, 42]];
const solo = (id: string, foes: [number, number][], lead = 6, tail = 8): Play => ({ steps: [{ m: motionById(id) }], foes, lead, tail });
const both = (title: string, line: string, play: Play): FilmPart => ({ title, line, play, from: 0, long: playLong(play), speed: 1, views: [0, 90], k: 4, sy: 0.7, ahead: 14 });

/** EVERY MOVE, from in front and behind. */
const MOVES: FilmPart[] = [
  both('STANDING · bouncing on his toes', 'Up on his toes in a fighter’s guard: elbows tucked in, fists by his cheeks; a roll of his shoulders', { steps: [{ m: VET_STAND }], foes: [[44, 20]], lead: 0, tail: 0 }),
  both('RUNNING · an action hero’s run', 'Low and driving, knees high, fists pumping, both feet off the floor between strides', { steps: [{ m: VET_RUN }, { m: VET_RUN }], foes: [], lead: 0, tail: 0 }),
  both('THE DODGE JUMP · a swipe', 'Sunk deep, held; a spring up and away out of the blow, knees tucked; down deep in the dust', solo('dodge', [[38, 10]], 8, 8)),
  both('THE JAB · tap', 'Coiled, the fist cocked, held; a stamping step and the fist shot out in a frame; back out', solo('jab', [[42, 10]])),
  both('THE CROSS · tap', 'Wound right back, held; hips, shoulders and heel thrown round, the fist driven straight through', solo('cross', [[40, 8]])),
  both('THE HOOK · tap', 'Wound up, held; whipped round flat through two of them side by side; carried on round', solo('hook', [[38, 16], [36, -4]])),
  both('THE ROUND KICK · hold', 'The switch, the knee cocked high, held; hips over, the shin whipped into the ribs; landed', solo('roundkick', [[38, 4]])),
  { ...both('THE PUSH KICK · hold, the first of the three kicks', 'Knee chambered, held; the heel driven straight out: a blast shoves back everyone in a cone in front', solo('push', PUSH_FOES, 6, 10)), views: [0], k: 3, sy: 0.5, ahead: 40 },
  both('THE SPINNING ELBOW · tap', 'A big coil, held; a whole turn drawn in light, the elbow leading into them; back to his guard', solo('elbow', [[35, 11]])),
  both('THE FLYING UPPERCUT · swipe, then tap', 'Dropped low, held; driven up off the floor through the chin: launched, stunned', solo('uppercut', [[30, 0]], 6, 22)),
  both('THE SPINNING JUMP KICK · swipe, then hold', 'Coiled, held; two whole turns in the air, the leg through everyone round him, each in turn', solo('spinkick', [[35, 9], [-9, 35], [-35, -9], [9, -35]], 6, 10)),
  both('THE FLYING KNEE · swipe, then hold, after two punches', 'A long lunge, held; the leap, the knee driven up into them, hands pulling them onto it; landed heavy', solo('knee', motionById('knee').foes, 6, 10)),
  both('STRUCK', 'The blow snaps his head round and drives him back on his heel; he shakes it off', solo('hurt', [[32, 8]], 16, 10)),
  both('HIS FALL', 'Snapped round; two staggering steps; down on one knee; one last fist; the light goes out', solo('fall', [[32, 8]], 16, 10)),
];

/** HIS SIX COMBOS, each in a row, the globes over him. */
function comboPlay(n: number): Play {
  const st = (id: string | VetMotion, input: Input, more: Partial<Step> = {}): Step => ({ m: typeof id === 'string' ? motionById(id) : id, input, ...more });
  switch (n) {
    case 1:
      return { steps: [st('jab', 'tap', { foe: 0 }), st('cross', 'tap', { foe: 0 }), st('hook', 'tap', { react: 'knock' as Reaction })], foes: [[38, 16], [36, -4]], lead: 8, tail: 12, globes: true };
    case 2: {
      const kn = kneeOf(27, 'kneeC');
      return { steps: [st('jab', 'tap'), st('cross', 'tap'), st(kn, 'swipeHold')], foes: [kn.foes[0]], lead: 8, tail: 14, globes: true };
    }
    case 3:
      return { steps: [st('jab', 'tap'), st('cross', 'tap'), st(upperOf(20, 'uppercutC'), 'swipeTap')], foes: [[40, 2]], lead: 8, tail: 22, globes: true };
    case 4:
      // (his pick, 3 Nov 2026: “Push kick, then round”: the push kick shoves back all in the cone in front, the round kick,
      // then the spinning jump kick all round)
      return { steps: [st('push', 'hold'), st('roundkick', 'hold', { foe: 0 }), st('spinkick', 'swipeHold')], foes: [[37, -3], [-9, 35], [-35, -9], [9, -35], [66, 14], [74, -22]], lead: 8, tail: 12, globes: true };
    case 5:
      return { steps: [st('roundkick', 'hold'), st('elbow', 'tap', { foe: 0 }), st('roundkick', 'hold', { react: 'fly' })], foes: [[36, 7]], lead: 8, tail: 14, globes: true };
    default:
      return { steps: [st('dodge', 'swipe', { first: true }), st(closeKickOf(48, 'spinkickC'), 'swipeHold', { first: true })], foes: [[38, 8]], lead: 8, tail: 14, globes: true };
  }
}
const COMBOS: FilmPart[] = VET_COMBOS.map((c) => {
  const play = comboPlay(c.n);
  const line = c.n === 6 ? 'A swipe alone: the dodging jump. A swipe and hold first: a spinning jump kick closing in' : `${c.name}: ${c.line.replace(/\.$/, '').replace(/^./, (x) => x.toLowerCase())}`;
  return { title: `COMBO ${c.n} · ${c.inputs.toUpperCase()}`, line, play, from: 0, long: playLong(play), speed: 1, views: [0], k: 4, sy: 0.72, ahead: 26 };
});

/** THE BIGGEST BLOWS AT HALF SPEED: the held wind-up, the strike in a frame or two, the stop, the wind-down. */
function slow(id: string, foes: [number, number][], title: string, line: string, before = 5, after = 12): FilmPart {
  const play = solo(id, foes);
  const m = play.steps[0].m;
  const s = m.strikes[0];
  const last = Math.max(s.at, ...s.hits.map((h) => h.f));
  return { title: `${title} · HALF SPEED`, line, play, from: play.lead + s.from - before, long: before + (last - s.from) + after, speed: 0.5, views: [0], k: 5, sy: 0.8, ahead: 16 };
}
const SLOW: FilmPart[] = [
  slow('push', PUSH_FOES, 'THE PUSH KICK', 'Chambered, held; the heel out in two frames; the cone of force fanning out', 5, 14),
  slow('elbow', [[35, 11]], 'THE SPINNING ELBOW', 'Coiled, held; the turn in two frames, the elbow leading; the arc of light', 5, 12),
  slow('knee', motionById('knee').foes, 'THE FLYING KNEE', 'The lunge held; up in two frames, the knee driven into them; snapped back', 5, 12),
  slow('spinkick', [[35, 9], [-9, 35], [-35, -9], [9, -35]], 'THE SPINNING JUMP KICK', 'Each of them caught in his turn, two frames apart', 4, 8),
];
export const VET_FILM: FilmPart[] = [...MOVES, ...COMBOS, ...SLOW];
