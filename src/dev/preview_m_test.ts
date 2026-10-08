// A trial of the monsters' pipeline (art/mkit.ts, dev/actor_sheet.ts) with a figure that already
// exists: the knight, given a monster's attack and a monster's pool of light.
//   node tools/preview.mjs src/dev/preview_m_test.ts shots/art/test.png 1900 1500 "all"
import { paintWarrior } from '../art/hero_warrior';
import type { Painted, Pose } from '../art/kit';
import { monsterArt, strike } from '../art/mkit';
import { showActor } from './actor_sheet';

const rig = (q: Pose, back: boolean): Painted => paintWarrior(q, back, { twoHanded: false });
const front = { attack: strike(0.4, { lean: -1, hx: -3, hy: -18, aim: 106, off: 1, behind: true, wind: 0.15 }, { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 5, hy: -6, aim: -24, off: -1, wind: 0.45, drag: 1.6 }, { lean: 1, bob: 1, near: 0.5, far: -0.2, hx: 3, hy: 1, aim: -56, wind: 0.75, drag: 0.6 }) };
const back = { attack: strike(0.4, { lean: -1, hx: -3, hy: -18, aim: 104, off: 1, wind: 0.15 }, { lean: 2, bob: 1, near: 0.7, far: -0.4, hx: 4, hy: -13, aim: 30, wind: 0.45, drag: 1.6 }, { lean: 1, bob: 1, near: 0.5, far: -0.2, hx: 3, hy: -3, aim: -28, wind: 0.75, drag: 0.6 }) };
showActor('trial', monsterArt(rig, front, back, { rest: { aim: -72 } }));
