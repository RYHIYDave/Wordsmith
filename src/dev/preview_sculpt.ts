// Dev page: THE NEW CLASSES SCULPTED (dev/sculpt_classes.ts; his brief, docs/mockups/classes/BRIEF.md). NOT IN THE GAME.
//   node tools/preview.mjs src/dev/preview_sculpt.ts previews/sculpt.png 100 100 "brawler:5:4"
//   hash = <sheet>:<screen pixels to a picture pixel>:<panes in a row>
import { paintMove3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { CANVAS3 } from '../art/skin';
import type { Px } from '../engine/px';
import { paintClassLook } from './options_classes';
import { BRAWLER_BUILD, BRAWLER_LOOKS, OUTFITS, OUTFITS_2, sculptBrawler } from './sculpt_classes';
import { GOLEM_BUILDS, sculptGolemBuild } from './sculpt_golem';
import { sculptWarlock } from './sculpt_warlock';
import { sculptContraption, sculptGolem, sculptTinkerer } from './sculpt_tinkerer';
import { DEMON_LOOKS, sculptDemon } from './sculpt_demon';
import { HULK_CANVAS } from './demon_hulk';
import { sculptWarlock as warlockFor } from './sculpt_warlock';

const [whatArg = 'brawler', scaleArg = '5', colsArg = '4'] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 5;
const COLS = Number(colsArg) || 4;

interface Pane {
  name: string;
  px: Px;
  ax?: number;
  ay?: number;
}
let heading = '';
const panes: Pane[] = [];
let HALF = 32;
void HALF;
let UP = 80;
let DOWN = 8;
// (painted after the page has loaded: a sheet of the demon takes longer than the page's load is given)
const build = (): void => {
  if (whatArg === 'brawler') {
    heading = 'The brawler, sculpted · a sketch · not in the game';
    panes.push({ name: 'The knight, for size', px: paintMove3(MOVES3.ktown, 0, 'front').px });
    panes.push({ name: 'Before (the sketch)', px: paintClassLook('brawler3', 0, 'front').px });
    panes.push({ name: 'Now, front', px: sculptBrawler('front').px });
    panes.push({ name: 'Now, back', px: sculptBrawler('back').px });
  } else if (whatArg === 'brawlers') {
    heading = 'The brawler: four builds · sculpted sketches · not in the game';
    BRAWLER_LOOKS.forEach((l, k) => panes.push({ name: `${'ABCD'[k]}. ${l.name}`, px: sculptBrawler('front', undefined, k).px }));
    BRAWLER_LOOKS.forEach((l, k) => panes.push({ name: `${'ABCD'[k]}, from behind`, px: sculptBrawler('back', undefined, k).px }));
  } else if (whatArg === 'warlock') {
    heading = 'The warlock, sculpted · a sketch · not in the game';
    panes.push({ name: 'The brawler, for size', px: sculptBrawler('front').px });
    panes.push({ name: 'Before (the sketch)', px: paintClassLook('warlock3', 0, 'front').px });
    panes.push({ name: 'Now, front', px: sculptWarlock('front').px });
    panes.push({ name: 'Now, back', px: sculptWarlock('back').px });
    UP = 88;
  } else if (whatArg === 'tinkerer') {
    heading = 'The Tinkerer, her Contraption and her Golem · sculpted sketches · not in the game';
    panes.push({ name: 'The knight, for size', px: paintMove3(MOVES3.ktown, 0, 'front').px });
    panes.push({ name: 'The Tinkerer, front', px: sculptTinkerer('front').px });
    panes.push({ name: 'The Tinkerer, back', px: sculptTinkerer('back').px });
    panes.push({ name: 'Contraption (tap)', px: sculptContraption('front').px });
    panes.push({ name: 'Golem (tap and hold), front', px: sculptGolem('front').px });
    panes.push({ name: 'Golem, back', px: sculptGolem('back').px });
    UP = 96;
    HALF = 34;
  } else if (whatArg === 'demon') {
    heading = "The warlock's demon, sculpted · feral · a sketch · not in the game";
    panes.push({ name: 'The warlock, for size', px: warlockFor('front').px });
    panes.push({ name: 'No word: ash black, smoke', px: sculptDemon('front', 'smoke', 0).px, ax: HULK_CANVAS.ax, ay: HULK_CANVAS.ay });
    panes.push({ name: 'From behind', px: sculptDemon('back', 'smoke', 0).px, ax: HULK_CANVAS.ax, ay: HULK_CANVAS.ay });
    for (const d of DEMON_LOOKS.slice(1)) panes.push({ name: d.name, px: sculptDemon('front', d.aura, d.hide).px, ax: HULK_CANVAS.ax, ay: HULK_CANVAS.ay });
    HALF = 100;
    UP = 196;
    DOWN = 12;
  } else if (whatArg === 'turns') {
    heading = 'Truly turned, eight ways (one of the checks) · sculpted sketches · not in the game';
    for (const t of [0, 45, 90, 135, 180, 225, 270, 315]) panes.push({ name: `Brawler, ${t}°`, px: sculptBrawler('front', undefined, BRAWLER_BUILD, undefined, t).px });
    for (const t of [0, 45, 90, 135, 180, 225, 270, 315]) panes.push({ name: `Tinkerer, ${t}°`, px: sculptTinkerer('front', undefined, t).px });
  } else if (whatArg === 'lineup') {
    heading = 'The new classes, side by side · sculpted sketches · not in the game';
    panes.push({ name: 'The knight', px: paintMove3(MOVES3.ktown, 0, 'front').px });
    panes.push({ name: 'The brawler', px: sculptBrawler('front').px });
    panes.push({ name: 'The warlock', px: sculptWarlock('front').px });
    panes.push({ name: 'The Tinkerer', px: sculptTinkerer('front').px });
    panes.push({ name: 'Her Golem', px: sculptGolem('front').px });
    panes.push({ name: 'Her Contraption', px: sculptContraption('front').px });
    UP = 98;
  } else if (whatArg === 'outfits2') {
    heading = 'The brawler: four new outfits · sculpted sketches · not in the game';
    OUTFITS_2.forEach((o, k) => panes.push({ name: `${k + 1}. ${o.name}`, px: sculptBrawler('front', undefined, BRAWLER_BUILD, o.id).px }));
    OUTFITS_2.forEach((o, k) => panes.push({ name: `${k + 1}, from behind`, px: sculptBrawler('back', undefined, BRAWLER_BUILD, o.id).px }));
  } else if (whatArg === 'golems') {
    heading = 'The Golem, not a man in armour: four builds · sculpted sketches · not in the game';
    panes.push({ name: 'The Tinkerer', px: sculptTinkerer('front').px });
    GOLEM_BUILDS.forEach((g, k) => panes.push({ name: `${'ABCD'[k]}. ${g.name}`, px: sculptGolemBuild('front', g.id).px }));
    panes.push({ name: 'Before', px: sculptGolem('front').px });
    GOLEM_BUILDS.forEach((g, k) => panes.push({ name: `${'ABCD'[k]}, from behind`, px: sculptGolemBuild('back', g.id).px }));
    UP = 104;
    HALF = 46;
    DOWN = 18;
  } else if (whatArg === 'outfits') {
    heading = 'The brawler (B): four outfits · sculpted sketches · not in the game';
    OUTFITS.forEach((o, k) => panes.push({ name: `${k + 1}. ${o.name}`, px: sculptBrawler('front', undefined, BRAWLER_BUILD, o.id).px }));
    OUTFITS.forEach((o, k) => panes.push({ name: `${k + 1}, from behind`, px: sculptBrawler('back', undefined, BRAWLER_BUILD, o.id).px }));
  }
  const CW = HALF * 2;
  const CH = UP + DOWN;
  const PAD = 10;
  const HEADING = 46;
  const NAME = 34;
  const BG = '#17142e';
  const PANEL = ['#262354', '#211e4b'];

  const cv = document.createElement('canvas');
  for (const el of [document.documentElement, document.body]) {
    el.style.height = 'auto';
    el.style.overflow = 'visible';
  }
  document.body.style.margin = '0';
  document.body.style.background = BG;
  cv.style.display = 'block';
  document.body.appendChild(cv);
  const paneW = CW * S;
  const paneH = CH * S;
  const rows = Math.ceil(panes.length / COLS);
  cv.width = PAD + Math.min(COLS, panes.length) * (paneW + PAD);
  cv.height = PAD + HEADING + rows * (NAME + paneH + PAD);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#ffd866';
  g.font = '700 22px system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.fillText(heading, PAD + 4, PAD + HEADING / 2);
  panes.forEach((pane, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (paneW + PAD);
    const top = PAD + HEADING + row * (NAME + paneH + PAD);
    g.fillStyle = '#cfc8ff';
    g.font = '600 17px system-ui, sans-serif';
    g.fillText(pane.name, x + 4, top + NAME / 2 + 1);
    const y = top + NAME;
    g.fillStyle = PANEL[(row + col) % 2];
    g.fillRect(x, y, paneW, paneH);
    const ax = pane.ax ?? CANVAS3.ax;
    const ay = pane.ay ?? CANVAS3.ay;
    const feetX = x + HALF * S;
    const feetY = y + UP * S;
    g.save();
    g.beginPath();
    g.rect(x, y, paneW, paneH);
    g.clip();
    g.strokeStyle = '#34306c';
    g.lineWidth = 1;
    for (const way of [1, -1]) {
      g.beginPath();
      g.moveTo(feetX - 60 * S, feetY - 30 * way * S);
      g.lineTo(feetX + 60 * S, feetY + 30 * way * S);
      g.stroke();
    }
    g.imageSmoothingEnabled = false;
    g.drawImage(pane.px.toCanvas(), feetX - ax * S, feetY - ay * S, pane.px.w * S, pane.px.h * S);
    g.restore();
  });
  (window as unknown as { __ready: boolean }).__ready = true;
};
if (document.readyState === 'complete') setTimeout(build, 50);
else window.addEventListener('load', () => setTimeout(build, 50));
