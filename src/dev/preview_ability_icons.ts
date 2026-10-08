// Dev page: the twelve attacks' icons, as they were (sixteen by sixteen game pixels) and as they
// are (painted at the heroes' grain, two picture pixels to a game pixel: art/ability_icons.ts).
//   node tools/preview.mjs src/dev/preview_ability_icons.ts previews/icons_before_and_now.png 100 100
//   hash: `big` = the new ones alone, very big (for painting them); `only=<id>` with it, one of them
import { makeAbilityIcons } from '../art/ability_icons';
import { abilityIconsWas } from '../art/icons';
import type { Sprite } from '../engine/px';
import type { AbilityId } from '../game/types';

const now = makeAbilityIcons();
const was = abilityIconsWas();
const hash = decodeURIComponent(location.hash.slice(1));
const BIG = hash.startsWith('big');
const ONLY = /only=(\w+)/.exec(hash)?.[1] ?? '';

interface Row {
  hero: string;
  list: { id: AbilityId; name: string; was: string }[];
}
const ROWS: Row[] = [
  { hero: 'Warrior', list: [{ id: 'strike', name: 'Strike', was: 'strike' }, { id: 'slam', name: 'Slam', was: 'slam' }, { id: 'whirl', name: 'Whirlwind', was: 'whirl' }, { id: 'leap', name: 'Leap', was: 'dodge' }] },
  { hero: 'Ranger', list: [{ id: 'shot', name: 'Shot', was: 'shot' }, { id: 'volley', name: 'Volley', was: 'volley' }, { id: 'trap', name: 'Trap', was: 'trap' }] },
  { hero: 'Mage', list: [{ id: 'wave', name: 'Wave', was: 'wave' }, { id: 'orb', name: 'Orb', was: 'orb' }, { id: 'beam', name: 'Beam', was: 'beam' }, { id: 'familiar', name: 'Familiar', was: 'familiar' }, { id: 'warp', name: 'Warp', was: 'dodge' }] },
];

const BG = '#17142e';
const SLOT = '#0e0c24';
const EDGE = '#7a74c8';
const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = BG;
cv.style.position = 'static';
cv.style.display = 'block';
document.body.appendChild(cv);

/** A slot as the game draws one (ui.slot): a dark square with a rim, the icon in its middle. `s` screen pixels to a game pixel. */
function slot(g: CanvasRenderingContext2D, sp: Sprite, x: number, y: number, s: number, size = 20): void {
  g.fillStyle = EDGE;
  g.fillRect(x, y, size * s, size * s);
  g.fillStyle = SLOT;
  g.fillRect(x + s, y + s, (size - 2) * s, (size - 2) * s);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, x + Math.floor((size - sp.w) / 2) * s, y + Math.floor((size - sp.h) / 2) * s, sp.w * s, sp.h * s);
}

if (BIG) {
  const S = 12; // screen pixels to a picture pixel
  const all = ROWS.flatMap((r) => r.list).filter((a) => !ONLY || a.id === ONLY);
  const cols = Math.min(4, all.length);
  const cell = 32 * S + 24;
  cv.width = 12 + cols * cell;
  cv.height = 12 + Math.ceil(all.length / cols) * (cell + 26);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  all.forEach((a, i) => {
    const x = 12 + (i % cols) * cell;
    const y = 12 + Math.floor(i / cols) * (cell + 26);
    g.fillStyle = '#ffd866';
    g.font = '700 18px system-ui, sans-serif';
    g.textBaseline = 'top';
    g.fillText(a.name, x, y);
    g.fillStyle = SLOT;
    g.fillRect(x, y + 24, 32 * S, 32 * S);
    // (a grid of the game's pixels, faint)
    g.fillStyle = '#1a1740';
    for (let k = 0; k <= 16; k++) {
      g.fillRect(x + k * 2 * S, y + 24, 1, 32 * S);
      g.fillRect(x, y + 24 + k * 2 * S, 32 * S, 1);
    }
    g.imageSmoothingEnabled = false;
    g.drawImage(now[a.id].img, x, y + 24, 32 * S, 32 * S);
    // and at the size of the game on a phone, beside it
    slot(g, now[a.id], x + 32 * S - 60, y - 2, 1.5);
  });
} else {
  const S = 7; // screen pixels to a game pixel, in the big pictures
  const PAD = 14;
  const HEAD = 52;
  const cellW = 20 * S * 2 + 22;
  const cellH = 30 + 20 * S + 14 + 66;
  const cols = 5;
  cv.width = PAD * 2 + 110 + cols * (cellW + PAD);
  cv.height = HEAD + ROWS.length * (cellH + PAD) + PAD;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.textBaseline = 'middle';
  g.fillStyle = '#ffd866';
  g.font = '700 24px system-ui, sans-serif';
  g.fillText("The attacks' icons: before, and now", PAD, HEAD / 2);
  ROWS.forEach((row, r) => {
    const y0 = HEAD + r * (cellH + PAD);
    g.fillStyle = '#cfc8ff';
    g.font = '700 20px system-ui, sans-serif';
    g.fillText(row.hero, PAD, y0 + 30 + 10 * S);
    row.list.forEach((a, i) => {
      const x0 = PAD + 110 + i * (cellW + PAD);
      g.fillStyle = '#211e4b';
      g.fillRect(x0 - 6, y0, cellW + 8, cellH);
      g.fillStyle = '#ffd866';
      g.font = '700 19px system-ui, sans-serif';
      g.fillText(a.name, x0, y0 + 15);
      slot(g, was[a.was], x0, y0 + 30, S);
      slot(g, now[a.id], x0 + 20 * S + 10, y0 + 30, S);
      g.fillStyle = '#9c96dc';
      g.font = '600 14px system-ui, sans-serif';
      g.fillText('before', x0 + 2, y0 + 30 + 20 * S + 9);
      g.fillText('now', x0 + 20 * S + 12, y0 + 30 + 20 * S + 9);
      // the size they are on a phone's screen (about two screen points to a game pixel)
      slot(g, was[a.was], x0 + 2, y0 + 30 + 20 * S + 22, 2);
      slot(g, now[a.id], x0 + 20 * S + 12, y0 + 30 + 20 * S + 22, 2);
    });
  });
}

(window as unknown as { __ready: boolean }).__ready = true;
