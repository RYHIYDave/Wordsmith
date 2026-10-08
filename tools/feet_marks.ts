// WHERE THE FEET ARE ON THE FLOOR in a film of a hero running (tools/scenarios/film_run_feet.mjs; the
// art chat's second test of weight, 8 Oct 2026): for every picture of the film, the picture of the
// run the game showed (the scenario notes its place in the list), the hero's own bones at that
// moment of the run (the same that painted it), and where the game drew him, give where each heel
// and each toe is on the screen and whether it is on the floor. Written beside the film as
// <prefix>_feet.json, for tools/weight_film.py to mark (MARKS=1: a white dot on the floor where each
// toe came down, for as long as it stays down); and the slide, measured on the film itself, printed:
// how far each toe moves over the floor while it is down, in game pixels.
//   node node_modules/tsx/dist/cli.mjs tools/feet_marks.ts <frames prefix> <warrior|ranger|mage>
import fs from 'node:fs';
import { MOVES3 } from '../src/art/moves3';
import { bonesAt, project, solve } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';

const [prefix, cls = 'warrior'] = process.argv.slice(2);
if (!prefix) {
  console.error('usage: tsx tools/feet_marks.ts <frames prefix> <warrior|ranger|mage>');
  process.exit(1);
}
const move = MOVES3[cls === 'warrior' ? 'krun' : cls === 'ranger' ? 'rrun' : 'mrun'];
const RUN_FPS = 30;
type At = { mid: [number, number]; hero: [number, number]; walk: number; of: number };
const at: At[] = JSON.parse(fs.readFileSync(`${prefix}_at.json`, 'utf8'));
/** Where a point of the figure is drawn, in game pixels on the screen: the figure is drawn with its feet's point at the hero's place, rounded (render.ts, `stand`); the painting has two of its pixels to one of the game's. */
const onScreen = (p: V3, hero: [number, number]): [number, number] => {
  const [across, down] = project(p, 'front');
  return [Math.round(hero[0]) + across / 2, Math.round(hero[1]) + down / 2];
};
type Foot = { toe: [number, number]; heel: [number, number]; toeDown: boolean; heelDown: boolean };
const frames: { L: Foot; R: Foot }[] = [];
for (const a of at) {
  if (a.walk < 0) throw new Error('a picture of the film is not one of the run');
  const s = solve(move.build, bonesAt(move.motion.keys, move.rest, a.walk / RUN_FPS));
  const foot = (toe: V3, heel: V3): Foot => ({ toe: onScreen(toe, a.hero), heel: onScreen(heel, a.hero), toeDown: toe[2] < 0.5, heelDown: heel[2] < 0.5 });
  frames.push({ L: foot(s.toeL, s.heelL), R: foot(s.toeR, s.heelR) });
}
// Each time a toe is down: where it came down (relative to the floor, which stands still against
// the point `mid`), and the frames it stays down.
type Mark = { from: number; to: number; at: [number, number]; slide: number };
const marks: Mark[] = [];
for (const side of ['L', 'R'] as const) {
  let open: { from: number; at: [number, number]; last: [number, number] } | null = null;
  for (let i = 0; i <= frames.length; i++) {
    const f = i < frames.length ? frames[i][side] : null;
    // (on the floor, as the floor stands: the toe's place less the place of `mid` in that picture)
    const rel: [number, number] | null = f ? [f.toe[0] - at[i].mid[0], f.toe[1] - at[i].mid[1]] : null;
    if (f && f.toeDown && rel) {
      if (!open) open = { from: i, at: rel, last: rel };
      open.last = rel;
    } else if (open) {
      const slide = Math.hypot(open.last[0] - open.at[0], open.last[1] - open.at[1]) * Math.sign(open.last[0] - open.at[0] || 1);
      // (a toe already down when the film begins, or still down when it ends, is not a whole step)
      const whole = open.from > 0 && i < frames.length;
      marks.push({ from: open.from, to: i - 1, at: open.at, slide: whole ? slide : NaN });
      open = null;
    }
  }
}
marks.sort((a, b) => a.from - b.from);
fs.writeFileSync(`${prefix}_feet.json`, JSON.stringify({ frames, marks }));
const steps = marks.filter((m) => !Number.isNaN(m.slide));
console.log(`${prefix}: ${steps.length} whole steps; each toe, while it is down, moves over the floor by (game pixels, + forward):`);
console.log('  ' + steps.map((m) => `${m.slide.toFixed(1)} (frames ${m.from}-${m.to})`).join(', '));
if (steps.length) console.log(`  on average ${(steps.reduce((s, m) => s + m.slide, 0) / steps.length).toFixed(1)}`);
