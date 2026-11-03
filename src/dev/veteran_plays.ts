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

const solo = (id: string, foes: [number, number][], lead = 6, tail = 8): Play => ({ steps: [{ m: motionById(id) }], foes, lead, tail });
const both = (title: string, line: string, play: Play): FilmPart => ({ title, line, play, from: 0, long: playLong(play), speed: 1, views: [0, 90], k: 4, sy: 0.7, ahead: 14 });

/** EVERY MOVE, from in front and behind. */
const MOVES: FilmPart[] = [
  both('STANDING · bouncing on his toes', 'Cocky, ready: up on his toes, his fists circling, a roll of his shoulders, his chin up', { steps: [{ m: VET_STAND }], foes: [[44, 20]], lead: 0, tail: 0 }),
  both('RUNNING · an action hero’s run', 'Low and driving, knees high, fists pumping, both feet off the floor between strides', { steps: [{ m: VET_RUN }, { m: VET_RUN }], foes: [], lead: 0, tail: 0 }),
  both('THE DODGE JUMP · a swipe', 'Sunk deep, held; a spring up and away out of the blow, knees tucked; down deep in the dust', solo('dodge', [[38, 10]], 8, 8)),
  both('THE JAB · tap', 'Coiled, the fist cocked, held; a stamping step and the fist shot out in a frame; back out', solo('jab', [[42, 10]])),
  both('THE CROSS · tap', 'Wound right back, held; hips, shoulders and heel thrown round, the fist driven straight through', solo('cross', [[40, 8]])),
  both('THE HOOK · tap', 'Wound up, held; whipped round flat through two of them side by side; carried on round', solo('hook', [[38, 16], [36, -4]])),
  both('THE ROUND KICK · hold', 'The switch, the knee cocked high, held; hips over, the shin whipped into the ribs; landed', solo('roundkick', [[38, 4]])),
  both('THE SPINNING ELBOW · tap', 'Coiled over his lead foot, held; a whole turn on its ball, the elbow round at head height', solo('elbow', [[36, 10]])),
  both('THE FLYING UPPERCUT · swipe, then tap', 'Dropped low, held; driven up off the floor through the chin: launched, stunned', solo('uppercut', [[30, 0]], 6, 22)),
  both('THE SPINNING JUMP KICK · swipe, then hold', 'Coiled, held; two whole turns in the air, the leg through everyone round him, each in turn', solo('spinkick', [[35, 9], [-9, 35], [-35, -9], [9, -35]], 6, 10)),
  both('THE FLYING KNEE · swipe, then hold, after two punches', 'A low lunge, held; a leap in, the knee driven up into them, hands pulling them down onto it', solo('knee', [[46, 4]], 6, 10)),
  both('STRUCK', 'The blow snaps his head round and drives him back on his heel; he shakes it off', solo('hurt', [[32, 8]], 16, 10)),
  both('HIS FALL', 'Snapped round; two staggering steps; down on one knee; one last fist; the light goes out', solo('fall', [[32, 8]], 16, 10)),
];

/** HIS SIX COMBOS, each in a row, the globes over him. */
function comboPlay(n: number): Play {
  const st = (id: string | VetMotion, input: Input, more: Partial<Step> = {}): Step => ({ m: typeof id === 'string' ? motionById(id) : id, input, ...more });
  switch (n) {
    case 1:
      return { steps: [st('jab', 'tap', { foe: 0 }), st('cross', 'tap', { foe: 0 }), st('hook', 'tap', { react: 'knock' as Reaction })], foes: [[38, 16], [36, -4]], lead: 8, tail: 12, globes: true };
    case 2:
      return { steps: [st('jab', 'tap'), st('cross', 'tap'), st(kneeOf(30, 'kneeC'), 'swipeHold')], foes: [[44, 6]], lead: 8, tail: 14, globes: true };
    case 3:
      return { steps: [st('jab', 'tap'), st('cross', 'tap'), st(upperOf(20, 'uppercutC'), 'swipeTap')], foes: [[40, 2]], lead: 8, tail: 22, globes: true };
    case 4:
      return { steps: [st('roundkick', 'hold', { foe: 0 }), st('roundkick', 'hold', { foe: 0 }), st('spinkick', 'swipeHold')], foes: [[35, 9], [-9, 35], [-35, -9], [9, -35]], lead: 8, tail: 12, globes: true };
    case 5:
      return { steps: [st('roundkick', 'hold'), st('elbow', 'tap', { foe: 0 }), st('roundkick', 'hold', { react: 'fly' })], foes: [[37, 6]], lead: 8, tail: 14, globes: true };
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
  slow('hook', [[38, 16], [36, -4]], 'THE HOOK', 'Held; whipped through in two frames; the stop on the blow'),
  slow('roundkick', [[38, 4]], 'THE ROUND KICK', 'The knee cocked, held; the shin round in two frames; the support foot pivoting on its ball'),
  slow('uppercut', [[30, 0]], 'THE FLYING UPPERCUT', 'Coiled, held; up through the chin in two frames'),
  slow('spinkick', [[35, 9], [-9, 35], [-35, -9], [9, -35]], 'THE SPINNING JUMP KICK', 'Each of them caught in his turn, two frames apart', 4, 8),
  slow('knee', [[46, 4]], 'THE FLYING KNEE', 'The lunge held; the knee in, in two frames'),
];

export const VET_FILM: FilmPart[] = [...MOVES, ...COMBOS, ...SLOW];
