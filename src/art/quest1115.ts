// THE QUEST LINE OF FLOORS 11 TO 15 (game/quests1115.ts, QUESTS1115, OFF): what it lays on the floor, painted here until the art
// chat draws them, and shown him first (his rule: pictures first). An UNSTRUCK PAGE: an old leaf of the city's paper lying on
// the floor, its lines of plain dark ink whole (none struck through), a rim of the friend's cyan (his rulebook's Colour 3:
// what glows on a friend is cyan). THE CLAPPER: a bell's iron tongue, its ring at one end and its swollen bob at the other,
// lying on its side. The Crier's jar is the art chat's own (art/floor12.ts criersJar); the camp's bell is floor 11's wayside
// shrine's bell, the art chat's (art/floor11.ts shrineBellFrames).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { BLACK, IRON, PAPER, lying } from './act2_kit';
import { CYAN, mix } from './kit';

let PAGE: Sprite | null = null;
let CLAPPER: Sprite | null = null;

/** An unstruck page lying on the floor (anchored at its middle). */
export function pageSprite(): Sprite {
  if (PAGE) return PAGE;
  const turn = 0.35;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const HU = 0.3;
  const HV = 0.22;
  PAGE = lying(40, 22, 20, 11, (u, v) => {
    // (the page's own axes, turned a little on the floor)
    const a = u * c + v * s;
    const b = -u * s + v * c;
    const ea = HU - Math.abs(a);
    const eb = HV - Math.abs(b);
    if (ea < -0.035 || eb < -0.035) return null;
    // its rim: the friend's cyan, just outside the paper
    if (ea < 0 || eb < 0) return mix(CYAN[2], PAPER[4], 0.25);
    // the paper's edge, a shade darker; one corner turned up
    if (ea < 0.025 || eb < 0.025) return PAPER[2];
    if (a > HU - 0.09 && b > HV - 0.09 && a + b > HU + HV - 0.1) return PAPER[1];
    // its lines of writing, whole: rows of dark ink with gaps where the words part
    const row = (b + HV) / 0.055;
    const inRow = row - Math.floor(row);
    const n = Math.floor(row);
    if (n >= 1 && n <= 6 && inRow > 0.45 && inRow < 0.8 && Math.abs(a) < HU - 0.05) {
      const word = Math.floor((a + HU) / 0.07 + n * 1.7);
      if (word % 4 !== 3 && !(n === 6 && a > 0.05)) return BLACK[3];
    }
    return (Math.floor((a + b) * 40) & 7) === 0 ? PAPER[3] : PAPER[4];
  });
  return PAGE;
}

/** The clapper, lying on its side (anchored where it touches the floor's middle). */
export function clapperSprite(): Sprite {
  if (CLAPPER) return CLAPPER;
  const W = 26;
  const H = 18;
  const p = new Px(W, H);
  const put = (x: number, y: number, t: number): void => {
    const k = Math.max(0, Math.min(4, Math.round(t)));
    p.set(Math.round(x), Math.round(y), IRON[k]);
  };
  // the shaft: from its ring (up left) to the bob (down right), lit along its top
  const x0 = 6;
  const y0 = 6;
  const x1 = 17;
  const y1 = 11;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    put(x, y, 3);
    put(x, y + 1, 1);
  }
  // its ring
  for (let a = 0; a < Math.PI * 2; a += 0.15) {
    const x = x0 - 2 + Math.cos(a) * 2.6;
    const y = y0 - 1 + Math.sin(a) * 1.8;
    put(x, y, Math.sin(a) < 0 ? 3 : 2);
  }
  // the bob: a swollen weight, round, lit from the upper left
  for (let y = -4; y <= 4; y++) {
    for (let x = -4; x <= 4; x++) {
      const d = Math.hypot(x, y * 1.1);
      if (d > 3.9) continue;
      const lit = (-x - y) / 6 + 0.3 * (1 - d / 4);
      put(x1 + 3 + x, y1 + 1 + y, d > 3.2 ? 0 : 1.5 + lit * 2.2);
    }
  }
  // a glint of the friend's cyan on the bob: the Bells' metal, rung
  p.set(x1 + 1, y1 - 2, CYAN[3]);
  // its shadow on the floor
  for (let x = 4; x < 24; x++) if (!p.get(x, 14)) p.set(x, 14, '#00000040');
  CLAPPER = p.sprite(13, 13);
  return CLAPPER;
}

/** Forget what was made (a test's painting without a canvas). */
export function forgetQuest1115Art(): void {
  PAGE = null;
  CLAPPER = null;
}
