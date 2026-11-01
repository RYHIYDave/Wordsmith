// THE FLOOR 4 ACTION SHEET (docs/mockups/action_f4/pictures/action_f4_sheet.png): key frames of the Ossuary Golem's skeleton hurl,
// the skeleton in flight and its burst, the old skull lob beside the new hurl at the same scale, the club swing made by Movement 9,
// and the dagger cultist's frenzy. Raw panels are written here; tools/action_f4_captions.py lays them out with their captions.
// Nothing of the game imports it.
//   npx tsx tools/action_f4_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { BURST_CANVAS, HURL, HURL_HIT, SWING_HIT, burstPainted, hurlShadowPainted, paintHurled } from '../src/art/action_f4_fx';
import { FRENZY, FRENZY_CULTIST, FRENZY_HITS } from '../src/art/cultists';
import { GOLEM, TILE3, makeGolemArt3, paintSkullShot, posedOfMob } from '../src/art/new_mobs3';
import { tombFloor, laid } from '../src/dev/action_f1_scene';
import { frameAt } from '../src/dev/action_f3_scene';
import { figures, frenzyScene, frenzyTimes, hurlScene, hurlTimes } from '../src/dev/action_f4_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const { golem, cultist } = figures();
const old = makeGolemArt3();

/** A row of cells side by side, made `k` times as big, a dark line between them. */
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** A cell of floor `w` by `h`, with a figure standing at (x, y), and anything more laid over it. */
function cell(w: number, h: number, x: number, y: number, fig: Laid, sh = 9, more: Array<[Laid, number, number]> = []): Px {
  const p = new Px(w, h);
  p.d.set(tombFloor(w, h, x, y + 40).d);
  shadow(p, x, y, sh);
  lay(p, fig, x, y);
  for (const [l, mx, my] of more) lay(p, l, mx, my);
  return p;
}
const f = (n: number): number => n / 30;
// THE HURL: its fist down to the floor; the skeleton hauled up, dangling; held aloft (the warning); over the top (the strike's first
// frame, smeared); loosed (its second); bent over after it (twice as big)
const HURL_AT = [0.36, 0.78, 1.25, f(42), HURL_HIT, 1.75];
for (const view of ['front', 'back'] as const) {
  const cells = HURL_AT.map((t) => cell(200, 165, 118, 140, frameAt(golem, view, 'throw', t), 22));
  writeFileSync(`${out}/hurl_${view}_a.png`, png(row(cells.slice(0, 3), 2)));
  writeFileSync(`${out}/hurl_${view}_b.png`, png(row(cells.slice(3), 2)));
}
// THE SKELETON IN FLIGHT (cartwheeling, four moments of its tumble, over its shadow), and THE BURST (in the scene: the reach marked;
// the burst; the bones flung out; lying; crumbling)
const flying = [0, 0.25, 0.5, 0.75].map((turn, i) => {
  const p = new Px(90, 110);
  p.d.set(tombFloor(90, 110, 45, 95).d);
  lay(p, laid(hurlShadowPainted(0.3 + i * 0.2), 42, 22), 45, 98);
  lay(p, laid(paintHurled(turn, 'front'), 56, 56), 45, 46);
  return p;
});
writeFileSync(`${out}/flight.png`, png(row(flying, 2)));
const ht = hurlTimes();
const burst = (t: number): Px => cut(hurlScene('front', t, tombFloor(560, 300, 270, 140), 270, 140, 1, true), 247, 92, 200, 134);
writeFileSync(`${out}/burst_a.png`, png(row([burst(ht.aim + 0.25), burst(ht.land - 0.12), burst(ht.land + 0.02)], 2)));
writeFileSync(`${out}/burst_b.png`, png(row([burst(ht.land + 0.16), burst(ht.land + 0.7), burst(ht.land + 1.3)], 2)));
// THE OLD SKULL LOB BESIDE THE NEW HURL, AT THE SAME SCALE (three times as big): the old: the skull taken, cocked, its skull in
// flight; the new: the skeleton held aloft, the skeleton in flight
// (each thing in flight over its own shadow on the floor, as high as it flies at the middle of a throw of five tiles)
const inFlight = (l: Laid, sh: number): Px => {
  const p = new Px(150, 165);
  p.d.set(tombFloor(150, 165, 75, 180).d);
  lay(p, laid(hurlShadowPainted(sh), 42, 22), 75, 140);
  lay(p, l, 75, 80);
  return p;
};
const oldNew = [
  cell(150, 165, 80, 140, frameAt(old, 'front', 'throw', 0.8), 22),
  inFlight(laid(paintSkullShot(0.2, 'front'), 84, 132), 0.1),
  cell(150, 165, 110, 140, frameAt(golem, 'front', 'throw', 1.25), 22),
  inFlight(laid(paintHurled(0.1, 'front'), 56, 56), 0.5),
];
writeFileSync(`${out}/old_new.png`, png(row(oldNew, 2)));
void BURST_CANVAS;
void HURL;
// THE CLUB SWING BY MOVEMENT 9: gathered; wound and HELD; the strike's first frame; its blow (smeared); on round; held, bent (twice as big)
const SWING_AT = [0.3, 0.7, f(25), SWING_HIT, 1.1, 1.3];
writeFileSync(`${out}/swing.png`, png(row(SWING_AT.map((t) => cell(150, 150, 70, 128, frameAt(golem, 'front', 'attack', t), 22)), 2)));
// THE FRENZY: coiled, HELD; the first stab (its frame, smeared); drawn back; the fourth stab; WINDED, heaving (twice); up again (three times as big)
const FZ = [0.4, FRENZY_HITS[0], f(19), FRENZY_HITS[3], 1.6, 2.05, FRENZY.long];
// (each cell following him as his steps take him on: his floor point moved back by how far he has come in the picture)
const came = (t: number): number => (posedOfMob(FRENZY_CULTIST, 'attack', t).px - FRENZY_CULTIST.attack.rest.px) / TILE3;
for (const view of ['front', 'back'] as const) {
  const cells = FZ.map((t) => {
    const d = came(t);
    const [dx, dy] = view === 'front' ? [32 * d, 16 * d] : [32 * d, -16 * d];
    const p = new Px(84, 84);
    p.d.set(tombFloor(84, 84, 42, 110).d);
    shadow(p, 42, 68, 9);
    lay(p, frameAt(cultist, view, 'attack', t), 42 - dx, 68 - dy);
    return p;
  });
  writeFileSync(`${out}/frenzy_${view}_a.png`, png(row(cells.slice(0, 4), 3)));
  writeFileSync(`${out}/frenzy_${view}_b.png`, png(row(cells.slice(3), 3)));
}
// THE FRENZY WITH THE KNIGHT: a stab; the fourth; winded, the knight's opening (twice as big)
const ft = frenzyTimes();
const fz = (t: number): Px => cut(frenzyScene('front', t, tombFloor(400, 240, 160, 110), 160, 110), 95, 45, 200, 130);
writeFileSync(`${out}/frenzy_scene.png`, png(row([fz(ft.go + FRENZY_HITS[1]), fz(ft.go + FRENZY_HITS[3]), fz(ft.blow)], 2)));
void burstPainted;
void GOLEM;
console.log('panels in', out);
