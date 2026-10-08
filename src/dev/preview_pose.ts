// Dev page: a figure in a row of poses, big, for working out a move before its timeline is
// written. Facing you on the top row, facing away on the bottom. (What flies from a hero, the
// scarf, the cape, a feather, is not in a painting: the game moves those. They are not shown.)
//   node tools/preview.mjs src/dev/preview_pose.ts shots/pose.png 2000 700 'knight2:4:[{},{"lean":-4,"bob":2}]'
//   hash = <who>:<scale>:<a list of poses, as JSON; each is laid over the figure's pose at rest>
//     who = knight (sword and shield) | knight2 (great sword) | ranger | mage | brute | guardian
//     a pose may hold "B": {...}, what is different in it seen from behind
import { paintMage } from '../art/hero_mage';
import { paintRanger } from '../art/hero_ranger';
import { paintWarrior } from '../art/hero_warrior';
import { KAY, KH, KW, REST, lightsOut } from '../art/kit';
import type { Painted, Pose } from '../art/kit';
import { BRUTE_CANVAS, paintBrute, paintGuardian } from '../art/monster_brute';

const raw = decodeURIComponent(location.hash.slice(1));
const [who = 'knight2', scaleArg = '4'] = raw.split(':');
const json = raw.split(':').slice(2).join(':');
const S = Number(scaleArg) || 4;
/** (a pose may carry `B`: what is different in it for the view from behind) */
type Shown = Partial<Pose> & { B?: Partial<Pose> };
const POSES: Shown[] = json ? (JSON.parse(json) as Shown[]) : [{}];
type Rig = (q: Pose, back: boolean) => Painted;
const RIGS: Record<string, { rig: Rig; rest: [Partial<Pose>, Partial<Pose>]; box: [number, number, number, number]; floor: number }> = {
  knight: { rig: (q, b) => paintWarrior(q, b, { twoHanded: false }), rest: [{ aim: -85 }, { aim: -72 }], box: [0, 0, KW, KH], floor: KAY },
  knight2: { rig: (q, b) => paintWarrior(q, b, { twoHanded: true }), rest: [{ aim: 62 }, { aim: 66 }], box: [0, 0, KW, KH], floor: KAY },
  ranger: { rig: paintRanger, rest: [{ aim: 20 }, { aim: -8 }], box: [0, 0, KW, KH], floor: KAY },
  mage: { rig: paintMage, rest: [{ aim: 90, act: 1 }, { aim: 90, act: 1 }], box: [0, 0, KW, KH], floor: KAY },
  brute: { rig: paintBrute, rest: [{ aim: 80 }, { aim: 80 }], box: [20, 60, 150, 160], floor: BRUTE_CANVAS.ay },
  guardian: { rig: paintGuardian, rest: [{ aim: 80 }, { aim: 80 }], box: [0, 30, 176, 170], floor: BRUTE_CANVAS.ay },
};
const R = RIGS[who] ?? RIGS.knight2;
const [X0, Y0, X1, Y1] = R.box;
const CW = X1 - X0;
const CH = Y1 - Y0;
const cv = document.createElement('canvas');
cv.width = (POSES.length * CW * S) / 2;
cv.height = (2 * CH * S) / 2;
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.imageSmoothingEnabled = false;
g.scale(S / 2, S / 2);
[false, true].forEach((back, j) => {
  POSES.forEach((q, i) => {
    const { B, ...both } = q;
    const pose = { ...REST, ...R.rest[j], ...both, ...(back ? B : {}) };
    const f = pose.out > 0.01 ? lightsOut(R.rig(pose, back), pose.out) : R.rig(pose, back);
    g.fillStyle = i % 2 ? '#201e50' : '#2a2866';
    g.fillRect(i * CW, j * CH, CW, CH);
    g.fillStyle = '#191740';
    g.fillRect(i * CW, j * CH + R.floor - Y0, CW, 1);
    g.drawImage(f.px.toCanvas(), X0, Y0, CW, CH, i * CW, j * CH, CW, CH);
  });
});
(window as unknown as { __ready: boolean }).__ready = true;
