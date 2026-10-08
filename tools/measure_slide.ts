// HOW FAR A PLANTED FOOT SLIDES (the art chat's second test of weight, 8 Oct 2026): each hero's
// run, as the game shows it today (its pictures played by the clock, thirty a second) and played by
// the ground it covers (render/weight.ts, STRIDE: OFF in the game). The game's own Figure picks the
// picture each sixtieth of a second, for a hero going straight along the grid at the rules' speed;
// the hero's own bones (the same ones that paint the picture) say where each foot is in it; a foot
// is DOWN while its heel or its toe is on the floor. Where it is on the floor is the hero's place
// plus the foot's place in the picture: while it is down, that should not move.
//   node node_modules/tsx/dist/cli.mjs tools/measure_slide.ts [speed in tiles a second = the rules' 4.6] [degrees off the grid = 0]
// Distances are game pixels on the screen (a tile along the grid is 16 game pixels across the screen
// and 8 down it: 17.9 along the line). DEGREES OFF THE GRID: 0 is a hero who runs the way the figure
// faces (along the grid: two keys at once, or the stick or the mouse that way); 45 is one who runs
// straight across or up the screen (one key), while the figure faces the nearest of the grid's four
// ways: then the foot that is down slides sideways too, whatever the run does.
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { UNITS_PER_TILE, groundPerTurn } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { bonesAt, solve } from '../src/art/skeleton';
import type { Sprite } from '../src/engine/px';
import { TUNE } from '../src/game/defs';
import { Figure } from '../src/render/figure';
import { STRIDE } from '../src/render/weight';

const RUN_FPS = 30;
const DT = 1 / 60;
const speed = Number(process.argv[2] ?? TUNE.heroSpeed);
const off = (Number(process.argv[3] ?? 0) * Math.PI) / 180;
/**
 * Game pixels on the screen for a step of (a, b) tiles on the floor, a along the way the figure faces
 * (the grid's x) and b to its left (which is the grid's -y: the figure's left is up the screen and to
 * the right, skeleton.ts `project`).
 */
const screenPx = (a: number, b: number): number => Math.hypot(16 * (a + b), 8 * (a - b));

interface Result {
  /**
   * Per step: how far the TOE goes forward over the floor from the first to the last sixtieth it
   * is on the floor, in game pixels (the mean over the steps), and the most it is ever off the
   * place it was put; and the same for the HEEL. (Each only while it is itself on the floor: a
   * foot rolls from its heel onto its toe, and the lowest point of a foot that does not slide moves
   * forward by the length of the foot as it does. The toe is down for most of the step.)
   */
  toe: number;
  toeWander: number;
  heel: number;
  heelWander: number;
  /** How long a foot is down, seconds; how far the hero goes meanwhile, game pixels. */
  down: number;
  went: number;
  /** Steps a second. */
  steps: number;
}

function measure(move: Move3, byGround: boolean): Result {
  const end = move.motion.keys[move.motion.keys.length - 1].at;
  const n = Math.max(1, Math.round(end * RUN_FPS));
  const named = (i: number): Sprite => ({ img: `run ${i}` as unknown as HTMLCanvasElement, w: 20, h: 30, ax: 10, ay: 29 });
  const walk = Array.from({ length: n }, (_, i) => named(i));
  const set: AnimSet = { idle: [named(-1)], walk, attack: [named(-2)], walkFps: RUN_FPS, walkGround: groundPerTurn(move) };
  const art: ActorArt = { front: set, back: set };
  const fig = new Figure();
  STRIDE.on = byGround;
  // (the feet in each picture of the run, as the bones have them: x forward along the way he runs, z up)
  const feet = walk.map((_, i) => {
    const s = solve(move.build, bonesAt(move.motion.keys, move.rest, i / RUN_FPS));
    return { L: { heel: s.heelL, toe: s.toeL }, R: { heel: s.heelR, toe: s.toeR } };
  });
  const seconds = 3;
  type Down = { ps: [number, number][]; t0: number; t1: number };
  const done: Record<'heel' | 'toe' | 'foot', Down[]> = { heel: [], toe: [], foot: [] };
  const now: Record<string, Down | null> = {};
  for (let k = 0; k <= seconds * 60; k++) {
    const t = k * DT;
    const went = speed * t;
    // (where the hero is, in tiles along the way the figure faces and to its left)
    const ha = went * Math.cos(off);
    const hb = went * Math.sin(off);
    const s = fig.frame(art, { anim: 'walk', animT: t, fx: 1, fy: 0, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1, x: ha, y: hb }, DT, 0, 0, false);
    const i = Number(String(s.img).split(' ')[1]);
    for (const side of ['L', 'R'] as const) {
      const f = feet[i][side];
      const low = f.heel[2] <= f.toe[2] ? f.heel : f.toe;
      // (each part, while it is on the floor: where on the floor it is, the hero's place and its place in the picture)
      const parts: ['heel' | 'toe' | 'foot', number[]][] = [['heel', f.heel], ['toe', f.toe], ['foot', low]];
      for (const [part, p] of parts) {
        const key = side + part;
        if (p[2] < 0.5) {
          if (!now[key]) now[key] = { ps: [], t0: t, t1: t };
          (now[key] as Down).ps.push([ha + p[0] / UNITS_PER_TILE, hb + p[1] / UNITS_PER_TILE]);
          (now[key] as Down).t1 = t;
        } else if (now[key]) {
          // (the first second is not counted: the run is under way by then)
          if ((now[key] as Down).t0 > 1) done[part].push(now[key] as Down);
          now[key] = null;
        }
      }
    }
  }
  const mean = (v: number[]): number => v.reduce((a, b) => a + b, 0) / Math.max(1, v.length);
  // (how far it went from where it came down to where it left the floor; and the furthest it ever was from where it came down)
  const slide = (d: Down[]): number => mean(d.map((x) => screenPx(x.ps[x.ps.length - 1][0] - x.ps[0][0], x.ps[x.ps.length - 1][1] - x.ps[0][1])));
  const wander = (d: Down[]): number => Math.max(0, ...d.map((x) => Math.max(...x.ps.map((p) => screenPx(p[0] - x.ps[0][0], p[1] - x.ps[0][1])))));
  const down = mean(done.foot.map((d) => d.t1 - d.t0 + DT));
  const turn = byGround ? (set.walkGround as number) / speed : n / RUN_FPS;
  return { toe: slide(done.toe), toeWander: wander(done.toe), heel: slide(done.heel), heelWander: wander(done.heel), down, went: screenPx(speed * down * Math.cos(off), speed * down * Math.sin(off)), steps: 2 / turn };
}

const runs: [string, string][] = [['knight', 'krun'], ['ranger', 'rrun'], ['mage', 'mrun'], ['knight in town', 'ktownrun'], ['ranger in town', 'rtownrun']];
console.log(`The hero goes ${speed} tiles a second, ${((off * 180) / Math.PI).toFixed(0)} degrees off the way the figure faces (${screenPx(speed * Math.cos(off), speed * Math.sin(off)).toFixed(1)} game pixels a second on the screen).`);
for (const [who, key] of runs) {
  const move = MOVES3[key];
  const g = groundPerTurn(move) as number;
  const end = move.motion.keys[move.motion.keys.length - 1].at;
  const feetGo = g / end;
  const today = measure(move, false);
  const ground = measure(move, true);
  console.log(`\n${who} (${key}): a turn of the run (two steps) is ${end} s and covers ${g.toFixed(2)} tiles if no foot slides: the feet go ${feetGo.toFixed(2)} tiles a second.`);
  console.log(`  today (by the clock): ${today.steps.toFixed(1)} steps a second; a foot is down ${today.down.toFixed(3)} s, in which the hero goes ${today.went.toFixed(1)} px. While it is down the TOE slides ${today.toe.toFixed(1)} px forward over the floor (at most ${today.toeWander.toFixed(1)} px off its place), the HEEL ${today.heel.toFixed(1)} px (${today.heelWander.toFixed(1)})`);
  console.log(`  by the ground covered: ${ground.steps.toFixed(1)} steps a second; the toe ${ground.toe.toFixed(1)} px (at most ${ground.toeWander.toFixed(1)} off its place), the heel ${ground.heel.toFixed(1)} px (${ground.heelWander.toFixed(1)})`);
}
STRIDE.on = false;
