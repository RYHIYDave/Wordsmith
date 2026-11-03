// THE VETERAN'S FILM, ITS PARTS (the art chat, 2 Nov 2026): what is shown, in order, and the captions, in plain words. A
// MOCK-UP; NOTHING OF THE GAME IMPORTS IT. Every move from in front and from behind side by side; his six combos in a row,
// the globes filling over him; the biggest blows again at half speed (tools/veteran_film.ts).

import { VET_COMBOS, VET_RUN, VET_STAND, VET_TILE, closeKickOf, motionById, worldOf } from './veteran_moves';
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

const T = VET_TILE;
/** The push kick's foes: three in the cone in front of him (out to three and a half tiles), one outside it (not hit). */
const PUSH_FOES: [number, number][] = [...motionById('push').foes, [0.8 * T, 2.2 * T]];
const solo = (id: string, foes: [number, number][], lead = 6, tail = 8): Play => ({ steps: [{ m: motionById(id) }], foes, lead, tail });
/** A move of his with its foes where its blow reaches (two and a half tiles from where he stood). */
const own = (id: string, lead = 6, tail = 10): Play => solo(id, motionById(id).foes, lead, tail);
const both = (title: string, line: string, play: Play): FilmPart => ({ title, line, play, from: 0, long: playLong(play), speed: 1, views: [0, 90], k: 4, sy: 0.7, ahead: 14 });
/** HIS REACH: in front and behind side by side, wide enough for the step and the force (three times the game's size). */
const wide = (title: string, line: string, play: Play): FilmPart => ({ ...both(title, line, play), k: 3, sy: 0.6, ahead: 46 });

/** EVERY MOVE, from in front and behind. */
const MOVES: FilmPart[] = [
  both('STANDING · bouncing on his toes', 'Up on his toes in a fighter’s guard: elbows tucked in, fists by his cheeks; a roll of his shoulders', { steps: [{ m: VET_STAND }], foes: [[44, 20]], lead: 0, tail: 0 }),
  both('RUNNING · an action hero’s run', 'Low and driving, knees high, fists pumping, both feet off the floor between strides', { steps: [{ m: VET_RUN }, { m: VET_RUN }], foes: [], lead: 0, tail: 0 }),
  both('THE DODGE JUMP · a swipe', 'Sunk deep, held; a spring up and away out of the blow, knees tucked; down deep in the dust', solo('dodge', [[38, 10]], 8, 8)),
  wide('THE JAB · tap', 'Cocked, held; a stamping step and the fist shot out: a cone of force on to 2½ tiles', own('jab')),
  wide('THE CROSS · tap', 'Wound back, held; a stamping step, the fist driven through: its force on to 2½ tiles', own('cross')),
  wide('THE HOOK · tap', 'Wound up, held; a stamping step, whipped round: a crescent of force through two, 2½ tiles', own('hook')),
  wide('THE ROUND KICK · hold', 'Knee cocked, held; a skipping step, the shin whipped round: a crescent of force, 2½ tiles', own('roundkick')),
  { ...wide('THE PUSH KICK · hold, the second of the three kicks', 'Chambered, held; a skip in, the heel out: a cone of force shoves all in it, 3½ tiles', solo('push', PUSH_FOES, 6, 12)), views: [0], sy: 0.57, ahead: 70 },
  wide('THE SPINNING ELBOW · tap', 'Coiled, held; a turn sliding in, the elbow leading: a crescent of force on to 2½ tiles', own('elbow')),
  { ...wide('THE FLYING UPPERCUT · swipe, then tap', 'Dropped low, held; a flying leap in, the fist up through them: its force launches them', own('uppercut', 6, 22)), sy: 0.74 },
  { ...wide('THE SPINNING JUMP KICK · swipe, then hold', 'Coiled, held; his leg throws one crescent of force out round him to 3½ tiles: each hit once', own('spinkick', 6, 12)), views: [0], sy: 0.66, ahead: 0 },
  { ...wide('THE FLYING KNEE · swipe, then hold, after two punches', 'A long lunge, held; a flying leap, the knee driven into them: its force on to 2½ tiles', own('knee', 6, 12)), sy: 0.7 },
  both('STRUCK', 'The blow snaps his head round and drives him back on his heel; he shakes it off', solo('hurt', [[32, 8]], 16, 10)),
  both('HIS FALL', 'Snapped round; two staggering steps; down on one knee; one last fist; the light goes out', solo('fall', [[32, 8]], 16, 10)),
];

/** HIS SIX COMBOS, each in a row, the globes over him. */
/** Where a move of a combo starts (the play's floor): the steps before it have carried him so far. */
const startOf = (ms: VetMotion[], k: number): [number, number] => {
  let x = 0;
  let y = 0;
  for (let i = 0; i < k; i++) {
    const e = worldOf(ms[i], ms[i].long, [0, 0, 0]);
    x += e[0];
    y += e[1];
  }
  return [x, y];
};
/** A foe where a move of a combo reaches (its own foe `i`, from where that move starts). */
const at = (ms: VetMotion[], k: number, i = 0): [number, number] => {
  const o = startOf(ms, k);
  const f = ms[k].foes[i];
  return [o[0] + f[0], o[1] + f[1]];
};
function comboPlay(n: number): Play {
  const st = (id: string | VetMotion, input: Input, more: Partial<Step> = {}): Step => ({ m: typeof id === 'string' ? motionById(id) : id, input, ...more });
  const M = (...ids: (string | VetMotion)[]): VetMotion[] => ids.map((x) => (typeof x === 'string' ? motionById(x) : x));
  switch (n) {
    case 1: {
      const ms = M('jab', 'cross', 'hook');
      return { steps: [st('jab', 'tap', { foe: 0 }), st('cross', 'tap', { foe: 0 }), st('hook', 'tap', { react: 'knock' as Reaction })], foes: [at(ms, 0), at(ms, 2, 1)], lead: 8, tail: 14, globes: true };
    }
    case 2: {
      const ms = M('jab', 'cross', 'knee');
      return { steps: [st('jab', 'tap'), st('cross', 'tap'), st('knee', 'swipeHold')], foes: [at(ms, 0)], lead: 8, tail: 16, globes: true };
    }
    case 3: {
      const ms = M('jab', 'cross', 'uppercut');
      return { steps: [st('jab', 'tap'), st('cross', 'tap'), st('uppercut', 'swipeTap')], foes: [at(ms, 0)], lead: 8, tail: 22, globes: true };
    }
    case 4: {
      // (his picks, 3 Nov 2026: “Push kick, then round”, then “Round kick first”: the round kick, the push kick shoving back
      // all in the cone in front, then the spinning jump kick's crescent all round)
      const ms = M('roundkick', 'push', 'spinkick');
      const sk = ms[2];
      const o = startOf(ms, 2);
      const round = sk.foes.slice(1).map((f) => [o[0] + f[0], o[1] + f[1]] as [number, number]);
      return { steps: [st('roundkick', 'hold', { foe: 0 }), st('push', 'hold'), st('spinkick', 'swipeHold')], foes: [at(ms, 0), at(ms, 1, 1), at(ms, 1, 2), ...round], lead: 8, tail: 14, globes: true };
    }
    case 5: {
      const ms = M('roundkick', 'elbow', 'roundkick');
      return { steps: [st('roundkick', 'hold'), st('elbow', 'tap', { foe: 0 }), st('roundkick', 'hold', { react: 'fly' })], foes: [at(ms, 0)], lead: 8, tail: 16, globes: true };
    }
    default: {
      // (the haymaker swung at him from close in; the dodge takes him a tile back out of it; the spinning kick closes in again)
      const ck = closeKickOf(1.25 * T, 'spinkickC');
      return { steps: [st('dodge', 'swipe', { first: true }), st(ck, 'swipeHold', { first: true })], foes: [[38, 8]], lead: 8, tail: 14, globes: true };
    }
  }
}
const COMBOS: FilmPart[] = VET_COMBOS.map((c) => {
  const play = comboPlay(c.n);
  const line = c.n === 6 ? 'A swipe alone: the dodging jump. A swipe and hold first: a spinning jump kick closing in' : c.n === 4 ? 'Round kick, push kick (its cone), spinning jump kick (its crescent all round)' : `${c.name}: ${c.line.replace(/\.$/, '').replace(/^./, (x) => x.toLowerCase())}`;
  return { title: `COMBO ${c.n} · ${c.inputs.toUpperCase()}`, line, play, from: 0, long: playLong(play), speed: 1, views: [0], k: 3, sy: 0.64, ahead: 60 };
});

/** THE BIGGEST BLOWS AT HALF SPEED: the held wind-up, the strike in a frame or two, the stop, the wind-down. */
function slow(id: string, foes: [number, number][], title: string, line: string, before = 5, after = 12): FilmPart {
  const play = solo(id, foes);
  const m = play.steps[0].m;
  const s = m.strikes[0];
  const last = Math.max(s.at, ...s.hits.map((h) => h.f));
  return { title: `${title} · HALF SPEED`, line, play, from: play.lead + s.from - before, long: before + (last - s.from) + after, speed: 0.5, views: [0], k: 3, sy: 0.62, ahead: 50 };
}
const SLOW: FilmPart[] = [
  slow('hook', motionById('hook').foes, 'THE HOOK', 'Held; the stamping step, the fist round: its crescent of force out to 2½ tiles', 4, 10),
  { ...slow('push', PUSH_FOES, 'THE PUSH KICK', 'Held; a skip in, the heel out in two frames: the cone of force out to 3½ tiles', 4, 12), sy: 0.57, ahead: 70 },
  { ...slow('spinkick', motionById('spinkick').foes, 'THE SPINNING JUMP KICK', 'His leg throws one crescent of force, rolled out round him: each hit once', 3, 6), sy: 0.66, ahead: 0 },
];
export const VET_FILM: FilmPart[] = [...MOVES, ...COMBOS, ...SLOW];
