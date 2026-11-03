// Dev page: THE VETERAN'S THREE ICONS (art/veteran_icons.ts), for the owner: the three large, and his three beside the other
// heroes' three at the game's size (three screen pixels to a game pixel, as on a phone). The picture's middle, the game's own
// buttons on a phone, is a screenshot laid in by tools/veteran_icons_picture.py.
//   node tools/preview.mjs src/dev/preview_veteran_icons.ts docs/mockups/veteran_icons/pictures/veteran_icons_page.png 1200 400
import { makeAbilityIcons } from '../art/ability_icons';
import type { Sprite } from '../engine/px';
import type { AbilityId } from '../game/types';

const icons = makeAbilityIcons();

const W = 1200;
const BG = '#17142e';
const SLOT = '#0e0c24';
const EDGE = '#7a74c8';
const GOLDEN = '#ffd866';
const TEXT = '#e8e4ff';
const DIM = '#a8a2dc';
/** Where the screenshot of the game's buttons goes (tools/veteran_icons_picture.py reads it from the page). */
export const STRIP = { y: 0, h: 196 };

const cv = document.createElement('canvas');
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
document.body.style.margin = '0';
document.body.style.background = BG;
cv.style.display = 'block';
document.body.appendChild(cv);

const BIG = 10;
const big: { id: AbilityId; name: string; how: string; lines: string[] }[] = [
  { id: 'vetpunch', name: 'Punch', how: 'TAP', lines: ['His big wrapped fist, driven', 'straight at you, knuckles first.', 'His green bursting behind it.'] },
  { id: 'vetkick', name: 'Kick', how: 'HOLD', lines: ['His wrapped shin and foot', 'whipping round from the knee,', 'a hot orange crescent behind.'] },
  { id: 'vetjump', name: 'Jump', how: 'SWIPE', lines: ['His two wrapped feet springing', 'up out of a white burst of dust,', 'the air streaking past.'] },
];
const heroes: { hero: string; ids: [AbilityId, AbilityId, AbilityId]; mine?: boolean }[] = [
  { hero: 'The Veteran (new)', ids: ['vetpunch', 'vetkick', 'vetjump'], mine: true },
  { hero: 'Warrior', ids: ['strike', 'whirl', 'leap'] },
  { hero: 'Ranger', ids: ['shot', 'volley', 'trap'] },
  { hero: 'Mage', ids: ['wave', 'orb', 'warp'] },
  { hero: 'Warlock', ids: ['hellbolt', 'curse', 'smokestep'] },
  { hero: 'Tinkerer', ids: ['vialtoss', 'golem', 'blastjump'] },
];

const HEAD = 104;
const BIGH = 34 + 32 * BIG + 16 + 3 * 26 + 18;
const STRIP_TITLE = 46;
STRIP.y = HEAD + BIGH + STRIP_TITLE;
const S = 3; // screen pixels to a game pixel at the phone's size
const SLOTPX = 20 * S;
const GROUP_H = 34 + SLOTPX + 30;
const COMP_TITLE = 56;
const H = STRIP.y + STRIP.h + COMP_TITLE + 2 * (GROUP_H + 14) + 54;
cv.width = W;
cv.height = H;
const g = cv.getContext('2d') as CanvasRenderingContext2D;
g.fillStyle = BG;
g.fillRect(0, 0, W, H);
g.textBaseline = 'top';
const text = (s: string, x: number, y: number, size: number, col: string, weight = 700, align: CanvasTextAlign = 'left'): void => {
  g.font = `${weight} ${size}px system-ui, sans-serif`;
  g.fillStyle = col;
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
};
/** A slot as the game draws one: a dark square with a rim, the icon in its middle. */
function slot(sp: Sprite, x: number, y: number, s: number, rim = EDGE): void {
  g.fillStyle = rim;
  g.fillRect(x, y, 20 * s, 20 * s);
  g.fillStyle = SLOT;
  g.fillRect(x + s, y + s, 18 * s, 18 * s);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, x + Math.floor((20 - sp.w) / 2) * s, y + Math.floor((20 - sp.h) / 2) * s, sp.w * s, sp.h * s);
}

// THE TITLE
text("The Veteran's three buttons", 24, 20, 36, GOLDEN, 800);
text("All new, nothing of the old Brawler's. In his globes' colours: green his punch, hot orange his kick, white his jump.", 24, 68, 19, TEXT, 500);

// THE THREE, LARGE
big.forEach((b, i) => {
  const cell = 32 * BIG;
  const x = 24 + i * (cell + 56);
  const y = HEAD;
  text(b.name, x, y, 26, GOLDEN, 800);
  g.font = '800 26px system-ui, sans-serif';
  text(`(${b.how.toLowerCase()})`, x + g.measureText(b.name).width + 10, y + 2, 22, DIM, 600);
  g.fillStyle = SLOT;
  g.fillRect(x, y + 34, cell, cell);
  g.imageSmoothingEnabled = false;
  g.drawImage(icons[b.id].img, x, y + 34, cell, cell);
  b.lines.forEach((l, j) => text(l, x, y + 34 + cell + 16 + j * 26, 19, TEXT, 500));
});

// THE GAME'S BUTTONS ON A PHONE (the screenshot goes in below this title)
text('In the game, on a phone: his three on the buttons, at their real size', 24, HEAD + BIGH + 8, 24, GOLDEN, 800);

// BESIDE THE OTHER HEROES'
const cy = STRIP.y + STRIP.h;
text("Beside the other heroes' buttons, at the game's size", 24, cy + 12, 24, GOLDEN, 800);
heroes.forEach((h, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 24 + col * 392;
  const y = cy + COMP_TITLE + row * (GROUP_H + 14);
  g.fillStyle = h.mine ? '#2a2466' : '#211e4b';
  g.fillRect(x - 10, y - 6, 370, GROUP_H);
  text(h.hero, x, y, 20, h.mine ? GOLDEN : '#cfc8ff', 800);
  h.ids.forEach((id, k) => {
    const sx = x + k * (SLOTPX + 44);
    slot(icons[id], sx, y + 32, S, h.mine ? '#b8b2f0' : EDGE);
    text(['TAP', 'HOLD', 'SWIPE'][k], sx + SLOTPX / 2, y + 32 + SLOTPX + 6, 14, DIM, 700, 'center');
  });
});
text('A first pass, to show him: in the game only once he says yes.', 24, H - 40, 18, DIM, 500);

console.log(`strip ${STRIP.y} ${STRIP.h}`);
(window as unknown as { __ready: boolean }).__ready = true;
