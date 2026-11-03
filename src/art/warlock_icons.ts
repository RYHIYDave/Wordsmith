// THE WARLOCK'S SIX ICONS (the main chat, 28 Oct 2026; game/warlock.ts, behind WARLOCK). A FIRST PASS, TO BE SHOWN TO THE
// OWNER BEFORE IT GOES LIVE. On the buttons' canvas (art/ability_icons.ts: thirty-two picture pixels, two to a game pixel),
// made of the art chat's own pieces of him (src/dev/warlock_fx.ts, demon_fx.ts): his hellfire's shape, his smoke, its cracks
// and jets. What glows is his cyan; his smoke is black.
//   hellbolt   his fire laid on its side, flying up and away
//   curse      three chains of black smoke whipping out from a claw's fire, a brand at each tip
//   smokestep  a river of black smoke along the floor, an ember in it, the way he went
//   rake       three claw-cuts of his cyan across
//   damning    the floor torn open in a star of glowing cracks, a jet of his fire out of its hole
//   demonstep  a comet of smoke tearing along, four gouges glowing behind it

import { Px } from '../engine/px';
import { HELL, fireAt, fireFoot } from '../dev/sculpt_warlock';
import { Light, SMOKE, cloud, fire } from '../dev/warlock_fx';
import { STUFF, crackStar, drawCrack, drawHole, jet } from '../dev/demon_fx';

const N = 32;

/** A picture of lights and smoke on the icon's canvas. */
function lay(paint: (fl: Light, sm: Light, dk: Light) => void): Px {
  const p = new Px(N, N);
  const fl = new Light();
  const sm = new Light();
  const dk = new Light();
  paint(fl, sm, dk);
  dk.lay(p, STUFF);
  sm.lay(p, SMOKE);
  fl.lay(p, HELL);
  return p;
}
const steps = (a: readonly [number, number], b: readonly [number, number], n: number): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);

export function hellboltIcon(): Px {
  return lay((fl) => {
    // (THE BOLT as the art chat draws it in flight, dev/warlock_fx.ts: his fire laid on its side, its tail streaming back,
    // drawn out by its speed; here flying up and to the right)
    const wx = Math.SQRT1_2;
    const wy = -Math.SQRT1_2;
    const cx = 23;
    const cy = 9;
    const size = 4.4;
    const heart = fireFoot(size) * 0.9;
    for (let dy = -30; dy <= 30; dy++) {
      for (let dx = -30; dx <= 30; dx++) {
        const back = -(dx * wx + dy * wy) - heart;
        const across = dx * -wy + dy * wx;
        const k = fireAt(Math.round(across), Math.round(-back / 2.0), size, 0.35);
        if (k >= 0) fl.put(cx + dx, cy + dy, k);
      }
    }
  });
}

export function curseIcon(): Px {
  return lay((fl, sm) => {
    // (the claw's fire, low on the left)
    fire(fl, 7, 27, 3.2, 0.5, 0);
    // (three chains of smoke whipping out, slack, to their brands)
    const tips: [number, number][] = [[27, 6], [29, 17], [22, 28]];
    tips.forEach(([tx, ty], j) => {
      const n = 14;
      for (let i = 1; i <= n; i++) {
        const u = i / n;
        const x = 8 + (tx - 8) * u;
        const y = 22 + (ty - 22) * u + Math.sin(u * Math.PI * 2 + j) * 2.4 * Math.sin(Math.PI * u);
        // (a link of black smoke, its lit top a little lighter)
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0]] as const) sm.put(x + dx, y + dy, i % 2 === 0 ? 0 : 1);
        sm.put(x, y - 1, 3);
      }
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 2) fl.put(tx + dx, ty + dy, Math.abs(dx) + Math.abs(dy) === 0 ? 3 : Math.abs(dx) + Math.abs(dy) === 1 ? 2 : 1);
    });
  });
}

export function smokestepIcon(): Px {
  return lay((fl, sm) => {
    // (a river of smoke along the floor, rolling the way he went, thinning toward where he left)
    const pts = steps([6, 26], [25, 14], 4);
    pts.forEach(([x, y], i) => cloud(sm, x, y + 3, 9 + i * 2, 8 + i * 1.6, 0.4 + i * 0.3, Math.max(0, 0.35 - i * 0.08), 3 + i, 1));
    // (embers in it, and the way he went)
    for (const [x, y, k] of [[12, 19, 1], [17, 16, 2], [22, 12, 2], [26, 9, 3], [9, 22, 0]] as const) {
      fl.put(x, y, k);
      fl.put(x, y - 1, k);
    }
  });
}

export function rakeIcon(): Px {
  return lay((fl) => {
    // (three claw-cuts across, each a curved streak, thin at its ends, white-hot in its middle)
    for (let c = 0; c < 3; c++) {
      // (side by side, across the way they cut)
      const ox = 1 + c * 4;
      const oy = 11 - c * 4.5;
      const n = 24;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = ox + u * 20;
        const y = oy + u * 16 - Math.sin(Math.PI * u) * 3;
        const w = Math.sin(Math.PI * u);
        const k = w > 0.75 ? 3 : w > 0.45 ? 2 : w > 0.2 ? 1 : 0;
        fl.put(x, y, k);
        fl.put(x, y + 1, Math.max(0, k - 1));
        if (w > 0.4) {
          fl.put(x + 1, y, k);
          fl.put(x - 1, y + 1, Math.max(0, k - 1));
          fl.put(x, y + 2, Math.max(0, k - 2));
        }
      }
    }
  });
}

export function damningIcon(): Px {
  return lay((fl, _sm, dk) => {
    const S = (p: readonly number[]): [number, number] => [16 + p[0], 25 + p[1] * 0.5];
    for (const c of crackStar(0, 0, 7, 19, 4, 9)) drawCrack(dk, fl, c, 1, 3, S);
    drawHole(dk, fl, 0, 0, 6, 3, 9, S);
    jet(fl, 16, 25, 6.4, 0.2, 0, 27);
  });
}

export function demonstepIcon(): Px {
  return lay((fl, sm) => {
    // (four gouges glowing behind it, along the floor)
    for (let g = 0; g < 4; g++) {
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = 2 + u * 16;
        const y = 23 + g * 2 - u * 7;
        fl.put(x, y, u > 0.7 ? 2 : u > 0.35 ? 1 : 0);
        fl.put(x + 1, y, u > 0.7 ? 2 : u > 0.35 ? 1 : 0);
      }
    }
    // (the comet of smoke, its head ahead, its fire churning in it)
    cloud(sm, 22, 16, 17, 15, 0.6, 0, 5, 1);
    cloud(sm, 13, 21, 10, 9, 0.9, 0.25, 6, 1);
    fire(fl, 23, 12, 2.8, 0.4, 0.6);
    for (const [x, y] of [[20, 13], [26, 12]] as const) {
      fl.put(x, y, 3);
      fl.put(x + 1, y, 3);
    }
  });
}
