// THE TINKERER'S THREE ICONS (the main chat, 28 Oct 2026; game/tinkerer.ts, behind TINKERER). Shown to the owner
// (tinkerer_icons.png), his pick by 15:45: “Yes, keep them (Recommended)”. On the buttons' canvas (art/ability_icons.ts: thirty-two picture pixels, two to a game
// pixel), made of the art chat's own pieces of her (src/dev/contraption_fx.ts, golem_pound_fx.ts, blast_fx.ts, demon_fx.ts):
// her cyan brew and its vials, the Golem's brass and its steam, the floor's cracks. What glows is the friend's cyan.
//   contraption   her little tripod mortar, a vial lobbed high out of its mouth, bursting where it comes down
//   golem         the Golem's giant brass fist hammered down, the floor cracked in a star round it, steam bursting out
//   blastjump     the bomb going off under her, a ball of her cyan fire, and the trail of her flung up and away

import { Px } from '../engine/px';
import { Light } from '../dev/warlock_fx';
import { BREW, CAP, VAPOUR, vialSprite } from '../dev/contraption_fx';
import { STEAM, burstSteam } from '../dev/golem_pound_fx';
import { GEARS } from '../dev/golem_down_fx';
import { STUFF, crackStar, drawCrack } from '../dev/demon_fx';

const N = 32;
/** Brass: the Golem's and the mortar's (dark to bright). */
const BRASS = GEARS;
const COPPER = ['#3a1a0c', '#7a3a18', '#b8642a', '#e8a060'];

/** A picture of lights on the icon's canvas, laid darkest first. */
function lay(paint: (l: { brass: Light; copper: Light; brew: Light; cap: Light; steam: Light; dark: Light; vapour: Light }) => void): Px {
  const p = new Px(N, N);
  const l = { brass: new Light(), copper: new Light(), brew: new Light(), cap: new Light(), steam: new Light(), dark: new Light(), vapour: new Light() };
  paint(l);
  l.dark.lay(p, STUFF);
  l.vapour.lay(p, VAPOUR);
  l.steam.lay(p, STEAM);
  l.brass.lay(p, BRASS);
  l.copper.lay(p, COPPER);
  l.cap.lay(p, CAP);
  l.brew.lay(p, BREW);
  return p;
}
/** A filled ellipse of one light, lit from the top left. */
function blob(l: Light, cx: number, cy: number, rx: number, ry: number): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (d > 1) continue;
      const lit = (cx - x) / rx + (cy - y) / ry;
      l.put(x, y, d > 0.82 ? 0 : lit > 0.5 ? 3 : lit > -0.3 ? 2 : 1);
    }
  }
}
/** A thick line of one light, `w` wide. */
function rod(l: Light, x0: number, y0: number, x1: number, y1: number, w: number, k: number): void {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = y0 + ((y1 - y0) * i) / n;
    for (let dy = -w / 2; dy <= w / 2; dy += 0.5) for (let dx = -w / 2; dx <= w / 2; dx += 0.5) l.put(x + dx, y + dy, dx + dy < -w / 3 ? Math.min(3, k + 1) : k);
  }
}

export function contraptionIcon(): Px {
  return lay((l) => {
    // (its three clawed legs splayed, its squat brass bell on them, its short copper mortar cocked up to the right, its lamp lit)
    rod(l.brass, 9, 24, 3, 30, 1.5, 1);
    rod(l.brass, 12, 25, 12, 31, 1.5, 1);
    rod(l.brass, 15, 24, 21, 30, 1.5, 1);
    blob(l.brass, 12, 21, 7, 5);
    rod(l.copper, 13, 19, 17, 14, 3.5, 1);
    blob(l.copper, 17.5, 13.5, 3, 2);
    blob(l.dark, 18, 13, 1.4, 1);
    l.brew.put(8, 21, 3);
    l.brew.put(9, 21, 2);
    l.brew.put(8, 22, 2);
    // (its vial lobbed high, the way it went in a line of its brew, bursting where it comes down)
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const x = 19 + u * 9;
      const y = 11 - 22 * u * (1 - u) + u * 13;
      if (i % 6 < 4) l.brew.put(x, y, 1);
    }
    vialSprite(l.brew, l.cap, 23, 4, 1.1);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = i % 2 ? 2.6 : 4.4;
      rod(l.brew, 27, 26, 27 + Math.cos(a) * r, 26 + Math.sin(a) * r * 0.7, 1, i % 2 ? 1 : 2);
    }
    blob(l.brew, 27, 26, 2, 1.6);
  });
}

export function golemIcon(): Px {
  return lay((l) => {
    // (the floor cracked in a star round where the fist comes down, its cyan in the cracks)
    const S = (p: readonly number[]): [number, number] => [16 + p[0], 27 + p[1] * 0.5];
    for (const c of crackStar(0, 0, 6, 15, 3, 21)) drawCrack(l.dark, l.brew, c, 1, 2, S);
    // (steam bursting out either side)
    burstSteam(l.steam, 7, 25, 10, 0.3, 0.42, 3);
    burstSteam(l.steam, 25, 25, 10, 0.7, 0.42, 9);
    // (its forearm down out of the top left, its piston along it, and the giant fist on the floor)
    rod(l.brass, 4, 1, 12, 13, 6, 1);
    rod(l.copper, 2, 4, 10, 15, 1.5, 1);
    blob(l.brass, 16, 19, 8, 6.5);
    for (const kx of [11, 15, 19]) rod(l.brass, kx, 15, kx + 2, 21, 1, 0);
    l.brew.put(16, 13, 3);
  });
}

export function blastjumpIcon(): Px {
  return lay((l) => {
    // (the trail of her flung up and away to the right, smoke billowing behind the spark at its head)
    for (let i = 0; i < 10; i++) {
      const u = i / 9;
      const x = 12 + u * 14;
      const y = 17 - 17 * u + 5 * u * u;
      blob(l.dark, x, y, 2.2 - u, 1.8 - u * 0.8);
    }
    // (the bomb gone off under her: a burst of her cyan fire, torn into points, white at its heart; a ring over the floor)
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + ((i - 4) / 9) * Math.PI * 1.6;
      const r = i % 2 ? 6 : 10;
      rod(l.brew, 10, 24, 10 + Math.cos(a) * r, 24 + Math.sin(a) * r * 0.9, 2, i % 2 ? 1 : 2);
    }
    blob(l.brew, 10, 24, 5.5, 4.5);
    blob(l.brew, 10, 23.5, 3, 2.4);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      if (Math.sin(a) < -0.3) continue;
      l.brew.put(10 + Math.cos(a) * 12, 28 + Math.sin(a) * 3, i % 3 === 0 ? 2 : 1);
    }
    for (const [dx, dy, k] of [[0, 0, 3], [1, 0, 3], [-1, 0, 2], [0, -1, 2], [0, 1, 2], [2, -2, 1], [-2, 2, 1], [2, 2, 1], [-2, -2, 1]] as const) l.brew.put(27 + dx, 5 + dy, k);
  });
}
