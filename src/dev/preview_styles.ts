// Dev preview: the warrior and a skeleton in several art styles, for the owner to choose from.
//   node tools/preview.mjs src/dev/preview_styles.ts shots/styles.png 1100 2000
// Add #zoom for the scenes alone, large (used while drawing).

import { FAX, FAY, FH, FW, LOOKS, figure, groundPatch, skeleton } from './styles';
import { LIGHTS, bat, brute, cultist, mage, ranger } from './styles_cast';
import type { Px } from '../engine/px';
import type { Look } from './styles';

/** A scene's size in art pixels. */
const SW = 128;
const SH = 104;

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  return [cv, g];
}

/** A steady pseudo-random number in 0..1. */
function rnd(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** One style's scene: backdrop, a lit patch of floor, the hero and a foe. `s` = screen pixels per art pixel. */
function scene(L: Look, s: number): HTMLCanvasElement {
  const w = SW * s;
  const h = SH * s;
  const [cv, g] = canvas(w, h);
  g.fillStyle = L.backdrop;
  g.fillRect(0, 0, w, h);
  const cx = Math.round(w / 2);
  const floorY = (SH - 27) * s;
  if (L.finish === 'engrave') {
    // old paper: foxing, and a ruled frame
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(120,90,50,${0.05 + rnd(i) * 0.08})`;
      g.fillRect(Math.floor(rnd(i + 500) * SW) * s, Math.floor(rnd(i + 900) * SH) * s, s, s);
    }
    g.fillStyle = L.ink;
    for (const [inset, t] of [[3, 1], [5, 1]] as const) {
      g.fillRect(inset * s, inset * s, w - inset * 2 * s, t * s);
      g.fillRect(inset * s, h - (inset + t) * s, w - inset * 2 * s, t * s);
      g.fillRect(inset * s, inset * s, t * s, h - inset * 2 * s);
      g.fillRect(w - (inset + t) * s, inset * s, t * s, h - inset * 2 * s);
    }
  }
  // floor
  const rx = SW / 2 - 10;
  const ry = 17;
  const patch = groundPatch(L, rx, ry).toCanvas();
  g.drawImage(patch, cx - (patch.width * s) / 2, floorY - (patch.height * s) / 2 - 3 * s, patch.width * s, patch.height * s);
  // darkness closing in from the edges
  if (L.dark > 0) {
    const grad = g.createRadialGradient(cx - 14 * s, floorY - 22 * s, 12 * s, cx - 6 * s, floorY - 22 * s, w * 0.6);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${L.dark})`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
  // a pool of light around the hero
  const glow = g.createRadialGradient(cx - 18 * s, floorY - 26 * s, 0, cx - 18 * s, floorY - 26 * s, 50 * s);
  glow.addColorStop(0, L.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = glow;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';

  const heroX = 40 * s;
  const foeX = 92 * s;
  const foeY = floorY - 3 * s;
  const shadow = L.finish === 'engrave' ? 'rgba(42,27,18,0.28)' : L.dark === 0 ? 'rgba(40,60,70,0.22)' : 'rgba(0,0,0,0.4)';
  g.fillStyle = shadow;
  for (const [x, y, r] of [[heroX, floorY, 13], [foeX, foeY, 10]] as const) {
    g.beginPath();
    g.ellipse(x, y, r * s, r * 0.4 * s, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.drawImage(skeleton(L).toCanvas(), foeX - FAX * s, foeY - FAY * s, FW * s, FH * s);
  g.drawImage(figure(L).toCanvas(), heroX - FAX * s, floorY - FAY * s, FW * s, FH * s);
  if (L.bladeRamp) {
    // a blade that gives off light
    const bx = heroX + 17 * s;
    const by = floorY - 46 * s;
    const bloom = g.createRadialGradient(bx, by, 0, bx, by, 20 * s);
    bloom.addColorStop(0, 'rgba(60,230,240,0.3)');
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = bloom;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  }
  return cv;
}

/** Who stands where in a line-up: a painter, the floor point in art pixels from the scene's left, a name, a lift. */
type Slot = readonly [(L: Look) => Px, number, string, number?];

const HEROES: ReadonlyArray<Slot> = [
  [figure, 40, 'Warrior'],
  [ranger, 104, 'Ranger'],
  [mage, 166, 'Mage'],
];
const FOES: ReadonlyArray<Slot> = [
  [skeleton, 30, 'Skeleton'],
  [cultist, 84, 'Cultist'],
  [bat, 126, 'Bat', 14],
  [brute, 176, 'Brute'],
];
/** A line-up's size in art pixels (heroes need less headroom than a brute with its club up). */
const LW = 216;
const HERO_H = 108;
const FOE_H = 128;

/** rgba() from '#rrggbb' and an alpha. */
function tint(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Several figures side by side on one strip of floor, in one look. */
function lineup(L: Look, slots: ReadonlyArray<Slot>, s: number, LH: number): HTMLCanvasElement {
  const w = LW * s;
  const h = LH * s;
  const [cv, g] = canvas(w, h);
  g.fillStyle = L.backdrop;
  g.fillRect(0, 0, w, h);
  const cx = Math.round(w / 2);
  const floorY = (LH - 24) * s;
  const patch = groundPatch(L, LW / 2 - 12, 15).toCanvas();
  g.drawImage(patch, cx - (patch.width * s) / 2, floorY - (patch.height * s) / 2 - 2 * s, patch.width * s, patch.height * s);
  if (L.dark > 0) {
    // darkness above and to the sides; the floor in the middle keeps its light
    const grad = g.createRadialGradient(cx, floorY - 26 * s, 30 * s, cx, floorY - 26 * s, w * 0.62);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${L.dark * 0.85})`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }
  const figs = slots.map(([paint, x, , lift]) => ({ px: paint(L), x: x * s, lift: (lift ?? 0) * s }));
  // light: a pool round each figure, and the glow of anything that burns or shines
  g.globalCompositeOperation = 'lighter';
  for (const f of figs) {
    const pool = g.createRadialGradient(f.x, floorY - 28 * s, 0, f.x, floorY - 28 * s, 40 * s);
    pool.addColorStop(0, L.glow);
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = pool;
    g.fillRect(0, 0, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = L.dark === 0 ? 'rgba(40,60,70,0.22)' : 'rgba(0,0,0,0.4)';
  for (const f of figs) {
    g.beginPath();
    g.ellipse(f.x, floorY, (f.lift ? 8 : 12) * s, (f.lift ? 3 : 4.6) * s, 0, 0, Math.PI * 2);
    g.fill();
  }
  for (const f of figs) g.drawImage(f.px.toCanvas(), f.x - FAX * s, floorY - f.lift - FAY * s, FW * s, FH * s);
  g.globalCompositeOperation = 'lighter';
  for (const f of figs) {
    for (const li of LIGHTS.get(f.px) ?? []) {
      const lx = f.x + (li.x - FAX) * s;
      const ly = floorY - f.lift + (li.y - FAY) * s;
      const glow = g.createRadialGradient(lx, ly, 0, lx, ly, li.r * s);
      glow.addColorStop(0, tint(li.color, 0.5));
      glow.addColorStop(0.35, tint(li.color, 0.16));
      glow.addColorStop(1, tint(li.color, 0));
      g.fillStyle = glow;
      g.fillRect(0, 0, w, h);
    }
  }
  g.globalCompositeOperation = 'source-over';
  return cv;
}

const BG = '#17131c';
const GOLD = '#ffe070';
const TEXT = '#f0e8f0';
const DIM = '#a89cab';
const FONT = 'Inter, "DejaVu Sans", sans-serif';

/** A numbered badge that shows up on dark and light scenes alike. */
function badge(g: CanvasRenderingContext2D, x: number, y: number, r: number, n: number): void {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = BG;
  g.fill();
  g.lineWidth = Math.max(2, r * 0.14);
  g.strokeStyle = GOLD;
  g.stroke();
  g.fillStyle = GOLD;
  g.font = `800 ${Math.round(r * 1.2)}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(String(n), x, y + r * 0.06);
  g.textAlign = 'left';
  g.textBaseline = 'top';
}

/** The sheet: six numbered scenes, then all six again at the size they have on a phone. */
function sheet(): HTMLCanvasElement {
  const S = 4;
  const pad = 28;
  const gap = 24;
  const cw = SW * S;
  const ch = SH * S;
  const capH = 112;
  const headH = 176;
  const rows = Math.ceil(LOOKS.length / 2);
  const W = pad * 2 + cw * 2 + gap;
  const gridH = rows * (ch + capH);
  const M = 2; // phone size: screen pixels per art pixel on this sheet
  const mw = SW * M;
  const mh = SH * M;
  const smallTop = headH + gridH + 8;
  const smallH = 70 + 2 * (mh + 44);
  const H = smallTop + smallH + 96;
  const [cv, g] = canvas(W, H);
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'top';

  g.fillStyle = GOLD;
  g.font = `800 46px ${FONT}`;
  g.fillText('Pick an art style', pad, 26);
  g.fillStyle = TEXT;
  g.font = `500 23px ${FONT}`;
  g.fillText('The same knight and skeleton, drawn six ways.', pad, 88);
  g.fillStyle = DIM;
  g.font = `400 21px ${FONT}`;
  g.fillText('1 to 4 run from the darkest to the brightest. 5 and 6 are something different.', pad, 124);

  LOOKS.forEach((L, i) => {
    const x = pad + (i % 2) * (cw + gap);
    const y = headH + Math.floor(i / 2) * (ch + capH);
    g.drawImage(scene(L, S), x, y);
    g.strokeStyle = '#3a3242';
    g.lineWidth = 2;
    g.strokeRect(x - 1, y - 1, cw + 2, ch + 2);
    badge(g, x + 36, y + 36, 24, i + 1);
    g.fillStyle = TEXT;
    g.font = `700 28px ${FONT}`;
    g.fillText(L.name, x, y + ch + 12);
    g.fillStyle = DIM;
    g.font = `400 19px ${FONT}`;
    L.blurb.forEach((line, k) => g.fillText(line, x, y + ch + 50 + k * 24));
  });

  // the same six at the size they would have while playing on a phone
  g.fillStyle = TEXT;
  g.font = `700 26px ${FONT}`;
  g.fillText('About the size you would see on a phone', pad, smallTop + 8);
  g.fillStyle = DIM;
  g.font = `400 19px ${FONT}`;
  g.fillText('Small details vanish at this size. Shape and colour are what is left.', pad, smallTop + 44);
  const mgap = Math.floor((W - pad * 2 - mw * 3) / 2);
  LOOKS.forEach((L, i) => {
    const x = pad + (i % 3) * (mw + mgap);
    const y = smallTop + 86 + Math.floor(i / 3) * (mh + 44);
    g.drawImage(scene(L, M), x, y);
    g.strokeStyle = '#3a3242';
    g.lineWidth = 2;
    g.strokeRect(x - 1, y - 1, mw + 2, mh + 2);
    badge(g, x + 20, y + 20, 14, i + 1);
  });

  g.fillStyle = GOLD;
  g.font = `700 24px ${FONT}`;
  g.fillText('Tell me a number.', pad, H - 86);
  g.fillStyle = DIM;
  g.font = `400 20px ${FONT}`;
  g.fillText('You can also mix: "the shapes of 2 with the colours of 3", or "4, but darker".', pad, H - 50);
  return cv;
}

/** The two short-listed looks, one above the other: heroes, then monsters, then both at phone size. */
function pairSheet(): HTMLCanvasElement {
  const S = 5;
  const pad = 28;
  const pair = LOOKS.filter((L) => L.id === 'grim' || L.id === 'neon');
  const num = (L: Look): number => LOOKS.indexOf(L) + 1;
  const W = pad * 2 + LW * S;
  const headH = 150;
  const secH = 54;
  const gap = 18;
  const groups: ReadonlyArray<readonly [string, ReadonlyArray<Slot>, number]> = [
    ['Heroes', HEROES, HERO_H],
    ['Monsters', FOES, FOE_H],
  ];
  const M = 2;
  let H = headH;
  for (const [, , lh] of groups) H += secH + pair.length * (lh * S + gap);
  const smallTop = H;
  H += 96 + pair.length * (FOE_H * M + gap) + 104;
  const [cv, g] = canvas(W, H);
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'top';
  g.fillStyle = GOLD;
  g.font = `800 46px ${FONT}`;
  g.fillText('Styles 1 and 6', pad, 26);
  g.fillStyle = TEXT;
  g.font = `500 23px ${FONT}`;
  g.fillText('The three heroes and four monsters, in both.', pad, 88);

  const frame = (x: number, y: number, w: number, h: number): void => {
    g.strokeStyle = '#3a3242';
    g.lineWidth = 2;
    g.strokeRect(x - 1, y - 1, w + 2, h + 2);
  };
  let y = headH;
  for (const [title, slots, lh] of groups) {
    g.fillStyle = TEXT;
    g.font = `700 30px ${FONT}`;
    g.fillText(title, pad, y + 8);
    y += secH;
    for (const L of pair) {
      g.drawImage(lineup(L, slots, S, lh), pad, y);
      frame(pad, y, LW * S, lh * S);
      badge(g, pad + 36, y + 36, 24, num(L));
      g.fillStyle = TEXT;
      g.font = `700 24px ${FONT}`;
      g.fillText(L.name, pad + 70, y + 22);
      // who is who
      g.font = `500 19px ${FONT}`;
      g.textAlign = 'center';
      g.fillStyle = 'rgba(240,232,240,0.6)';
      for (const [, x, name] of slots) g.fillText(name, pad + x * S, y + lh * S - 34);
      g.textAlign = 'left';
      y += lh * S + gap;
    }
  }

  g.fillStyle = TEXT;
  g.font = `700 26px ${FONT}`;
  g.fillText('About the size you would see on a phone', pad, smallTop + 14);
  g.fillStyle = DIM;
  g.font = `400 19px ${FONT}`;
  g.fillText('This is the real test: which one can you still read at a glance?', pad, smallTop + 50);
  const mgap = W - pad * 2 - LW * M * 2;
  pair.forEach((L, r) => {
    const sy = smallTop + 96 + r * (FOE_H * M + gap);
    groups.forEach(([, slots], c) => {
      const sx = pad + c * (LW * M + mgap);
      g.drawImage(lineup(L, slots, M, FOE_H), sx, sy);
      frame(sx, sy, LW * M, FOE_H * M);
      badge(g, sx + 20, sy + 20, 14, num(L));
    });
  });

  g.fillStyle = GOLD;
  g.font = `700 24px ${FONT}`;
  g.fillText('1 or 6?', pad, H - 88);
  g.fillStyle = DIM;
  g.font = `400 20px ${FONT}`;
  g.fillText('A mix works too: "6, but grimmer", or "1, with the glowing magic of 6".', pad, H - 52);
  return cv;
}

function main(): void {
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.body.style.background = '#17131c';
  const zoom = location.hash.includes('zoom');

  if (zoom) {
    const S = 6;
    const [cv, g] = canvas(3 * SW * S, 2 * SH * S);
    cv.style.position = 'static';
    LOOKS.forEach((L, i) => g.drawImage(scene(L, S), (i % 3) * SW * S, Math.floor(i / 3) * SH * S));
    document.body.appendChild(cv);
    console.log(`sheet ${cv.width}x${cv.height}`);
    return;
  }

  if (location.hash.includes('pair')) {
    const cv = pairSheet();
    cv.style.position = 'static';
    document.body.appendChild(cv);
    console.log(`sheet ${cv.width}x${cv.height}`);
    return;
  }
  if (location.hash.includes('cast')) {
    const S = 6;
    const pair = LOOKS.filter((L) => L.id === 'grim' || L.id === 'neon');
    const [cv, g] = canvas(2 * LW * S, 2 * FOE_H * S);
    cv.style.position = 'static';
    pair.forEach((L, i) => {
      g.drawImage(lineup(L, HEROES, S, FOE_H), i * LW * S, 0);
      g.drawImage(lineup(L, FOES, S, FOE_H), i * LW * S, FOE_H * S);
    });
    document.body.appendChild(cv);
    console.log(`sheet ${cv.width}x${cv.height}`);
    return;
  }

  const cv = sheet();
  cv.style.position = 'static';
  document.body.appendChild(cv);
  console.log(`sheet ${cv.width}x${cv.height}`);
}

// Text is drawn with a font the page has to load first.
void document.fonts.load('800 46px Inter').then(() => {
  main();
  (window as unknown as { __ready: boolean }).__ready = true;
});

