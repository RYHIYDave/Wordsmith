// Item icons, ability icons, power-word runes, pickups, and the Orb / Trap sprites.
// Like all placeholder art, everything here is drawn in code at start-up (no image files).
//
// Most sprites are small character grids: one character = one pixel, '.' = transparent.
//   letters -> shared materials (see BASE below; the same letter always means the same colour)
//   digits  -> this sprite's own accent colours, in the order they are passed to grid()
// Round or curved things (bows, the slash, the nova, the orbs) are computed instead.
// Every sprite gets a 1 px ink outline as its last step, except the glowing orb projectile.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { P } from './palette';
import { WORD_IDS } from '../game/types';
import type { AbilityId, Element, IconKey, WordId } from '../game/types';
import { makeAbilityIcons } from './ability_icons';

export interface IconArt {
  /** 16x16, anchor (8, 8). */
  item: Record<IconKey, Sprite>;
  /** Sixteen game pixels square, anchor in the middle, painted two picture pixels to a game pixel (art/ability_icons.ts): draw them at their size in game pixels (`w` by `h`). The UI draws its own dark frame behind these. */
  ability: Record<AbilityId, Sprite>;
  /** 12x12 rune stone, anchor (6, 10). */
  word: Record<WordId, Sprite>;
  /** 16x16, anchor (8, 8). */
  potion: Sprite;
  /** 3 coin piles, small to large, lying on the floor; anchor bottom-centre. */
  gold: Sprite[];
  /** 8x8 glowing red orb lying on the floor, anchor (4, 7). */
  lifeOrb: Sprite;
  /** The Mage's Orb projectile: 3 looping frames, 10x10, anchor (5, 5). No outline. */
  orb: Record<Element, Sprite[]>;
  /** The Ranger's Trap lying on the floor: 2 frames (idle, armed blink), painted two picture pixels to a game pixel; its anchor is the floor point under its middle. */
  trap: Record<Element, Sprite[]>;
}

/** Each power word's glyph colour. The UI reuses these for word names and sockets. */
export const WORD_COLOR: Record<WordId, string> = {
  power: P.bl4,
  swift: P.gn4,
  twin: P.tl4,
  fire: P.fr4,
  frost: P.bu4,
  lightning: P.lt3,
  leech: P.bl5,
  volatile: P.pu4,
  poison: P.vn4,
};

// ---------------------------------------------------------------------------------------------
// Grid painter

type Legend = Record<string, string>;

/** Shared materials. Ramps run light -> dark, because light comes from the top-left. */
const BASE: Legend = {
  // steel
  T: P.sl5, t: P.sl4, S: P.sl3, s: P.sl2, z: P.sl1,
  // wood and leather
  E: P.wd5, d: P.wd4, c: P.wd3, b: P.wd2, a: P.wd1,
  // gold
  Y: P.gd5, G: P.gd4, g: P.gd3, h: P.gd2, k: P.gd1,
  // pure white glint
  W: P.white,
};

/**
 * Paint a sprite from rows of characters. Letters are looked up in BASE; the digits 1, 2, 3...
 * stand for the `accents` colours in order. Throws on a typo so a bad grid is caught at start-up.
 */
function grid(name: string, rows: readonly string[], ...accents: string[]): Px {
  const w = rows[0].length;
  const p = new Px(w, rows.length);
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    if (row.length !== w) throw new Error(`icons: "${name}" row ${y} is ${row.length} wide, expected ${w}`);
    for (let x = 0; x < w; x++) {
      const ch = row.charAt(x);
      if (ch === '.') continue;
      const digit = ch >= '1' && ch <= '9' ? ch.charCodeAt(0) - 49 : -1;
      const col: string | undefined = digit >= 0 ? accents[digit] : BASE[ch];
      if (col === undefined) throw new Error(`icons: "${name}" uses '${ch}', which has no colour`);
      p.set(x, y, col);
    }
  }
  return p;
}

/** Finish a 16x16 icon: ink outline, anchor in the middle. */
function icon(p: Px): Sprite {
  return p.outline(P.ink).sprite(8, 8);
}

/** Distance from a pixel's centre to a point given in pixel-edge coordinates. */
function dist(x: number, y: number, cx: number, cy: number): number {
  return Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
}

// ---------------------------------------------------------------------------------------------
// Item icons: weapons. They lie on the diagonal, grip bottom-left, business end top-right.

function swordIcon(): Sprite {
  return icon(grid('sword', [
    '................',
    '.............Tt.',
    '............TtS.',
    '...........TtS..',
    '..........TtS...',
    '.........TtS....',
    '........TtS.....',
    '.......TtS......',
    '...G..TtS.......',
    '...gGTtS........',
    '....gGS.........',
    '...ddgg.........',
    '..ddb.gh........',
    '.Gdb............',
    '.gh.............',
    '................',
  ]));
}

function axeIcon(): Sprite {
  return icon(grid('axe', [
    '................',
    '.........TTt....',
    '.......TTttS....',
    '......TtttttSdc.',
    '.....TtttttSSs..',
    '.....TttttSSSs..',
    '.....TtttSSss...',
    '.....TtS.dc.....',
    '......S.dc......',
    '.......dc.......',
    '......dc........',
    '.....dc.........',
    '....dc..........',
    '...dc...........',
    '..dc............',
    '................',
  ]));
}

function maceIcon(): Sprite {
  return icon(grid('mace', [
    '................',
    '......T...T...t.',
    '.......T.TTt.t..',
    '........TTTtS...',
    '.......TTtttSS..',
    '......TttttSSsS.',
    '.......tttSSss..',
    '........SSSss...',
    '........dsss.s..',
    '.......dc.s...s.',
    '......dc........',
    '.....dc.........',
    '....dc..........',
    '...dc...........',
    '..Ss............',
    '................',
  ]));
}

/**
 * A bow on the diagonal, bulging toward the top-left. `half` = how far each limb tip is from the
 * icon centre (pixels along x); `sag` = how far the grip bulges out from the string.
 * wood = [lit, main, shadow].
 */
function bowIcon(half: number, sag: number, wood: readonly [string, string, string], stringCol: string, gripCol: string, tipCol: string | null): Sprite {
  const p = new Px(16, 16);
  const u = Math.SQRT1_2;
  // The limbs are an arc of a circle through both tips and the grip.
  const chord = 2 * half * Math.SQRT2;
  const r = (chord * chord / 4 + sag * sag) / (2 * sag);
  const cx = 8 - sag * u + r * u;
  const cy = cx;
  const tip = Math.round(8 + half - 0.5);
  // string first, so the limbs paint over its ends
  p.line(tip, 15 - tip, 15 - tip, tip, stringCol);
  for (let y = 1; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      if (x + y > 15) continue; // only the side of the circle above the string
      const d = dist(x, y, cx, cy);
      if (Math.abs(d - r) > 0.8) continue;
      const nearGrip = Math.abs(x - y) <= 1;
      if (nearGrip) p.set(x, y, gripCol);
      else if (d < r) p.set(x, y, wood[2]);
      else p.set(x, y, Math.abs(x - y) <= 5 ? wood[0] : wood[1]);
    }
  }
  if (tipCol) {
    p.set(tip, 15 - tip, tipCol);
    p.set(15 - tip, tip, tipCol);
  }
  return icon(p);
}

function wandIcon(): Sprite {
  // ivory rod (4, 5), gold collar and cap, purple gem (1..3)
  return icon(grid('wand', [
    '................',
    '................',
    '................',
    '...........12...',
    '..........1W23..',
    '..........2233..',
    '..........g33...',
    '.........Gg.....',
    '........45......',
    '.......45.......',
    '......45........',
    '.....45.........',
    '....45..........',
    '...Gg...........',
    '................',
    '................',
  ], P.pu5, P.pu4, P.pu3, P.bn4, P.bn2));
}

function staffIcon(): Sprite {
  return icon(grid('staff', [
    '................',
    '...........112..',
    '..........1W223.',
    '..........12223.',
    '..........22233.',
    '..........d233..',
    '.........Gg.....',
    '........dc......',
    '.......dc.......',
    '......dc........',
    '.....dc.........',
    '....dc..........',
    '...dc...........',
    '..dc............',
    '.dc.............',
    '................',
  ], P.tl5, P.tl4, P.tl3));
}

// ---------------------------------------------------------------------------------------------
// Item icons: armour and jewellery (seen from the front).

function helmIcon(): Sprite {
  // 'z' is the dark T-shaped visor slit
  return icon(grid('helm', [
    '................',
    '......TTtt......',
    '....TTTttttS....',
    '...TTttttttSS...',
    '..TTtttttttSSs..',
    '..TttttttttSSs..',
    '..TSSSSSSSSSss..',
    '..TtzzzzzzzzSs..',
    '..TtttzzzzSSSs..',
    '..TttttzzSSSSs..',
    '..TttttzzSSSSs..',
    '..TttttzzSSSSs..',
    '..TtttSzzSSSss..',
    '...ttSS..SSss...',
    '................',
    '................',
  ]));
}

function hoodIcon(): Sprite {
  // green cloth (1..3), leather trim round the face opening (d, c), dark inside (4)
  return icon(grid('hood', [
    '................',
    '.......11.......',
    '......1122......',
    '.....112223.....',
    '....11222233....',
    '...112dddd233...',
    '...12d4444c33...',
    '..12d444444c33..',
    '..12d444444c33..',
    '..12d444444c33..',
    '..12d444444c33..',
    '..122d4444c233..',
    '.12222d44c22333.',
    '.122222dc222333.',
    '................',
    '................',
  ], P.gn4, P.gn3, P.gn2, P.wd1));
}

function armorIcon(): Sprite {
  return icon(grid('armor', [
    '................',
    '..TTt......ttS..',
    '.TTttt....tttSs.',
    '.Tttttt..ttttSs.',
    '.TtttttTSttttSs.',
    '..TttttTStttSs..',
    '..TttttTStttSs..',
    '...TSSSSSSSSs...',
    '...TtttTSttSs...',
    '...TtttTSttSs...',
    '...TtttTSttSs...',
    '...ccccGgcccb...',
    '..TtttttSttSSs..',
    '..tttttSSSSSss..',
    '................',
    '................',
  ]));
}

function robeIcon(): Sprite {
  // purple cloth (1..3) with gold trim
  return icon(grid('robe', [
    '................',
    '....11g..g22....',
    '..11122gg22233..',
    '.112222Gg222233.',
    '.122322Gg223233.',
    '.122.22Gg22.233.',
    '.122.22Gg22.233.',
    '.ggg.22Gg22.ggh.',
    '....122Gg223....',
    '....122Gg223....',
    '...1222Gg2223...',
    '...1222Gg2223...',
    '..12222Gg22233..',
    '..gggggGgggghh..',
    '................',
    '................',
  ], P.pu4, P.pu3, P.pu2));
}

function glovesIcon(): Sprite {
  // one steel gauntlet, fingers up, with a leather cuff
  return icon(grid('gloves', [
    '................',
    '.......TsTs.....',
    '.....TsTsTsTs...',
    '.....tstststs...',
    '.....tstststs...',
    '..T..TTTTTTTs...',
    '..Tt.tttttttS...',
    '..TttttttttSS...',
    '...ttttttttSS...',
    '....ttttttSS....',
    '....SSSSSSss....',
    '...ddddddddc....',
    '..Eddddddddcb...',
    '..Eddddddddcb...',
    '................',
    '................',
  ]));
}

function bootsIcon(): Sprite {
  return icon(grid('boots', [
    '................',
    '..EEdddc........',
    '..Eddddcb.......',
    '...Edddc........',
    '...Edddc........',
    '...Edddc........',
    '...Edddc........',
    '...Edddc........',
    '...bbGbbc.......',
    '...Edddddc......',
    '...Eddddddddc...',
    '...ddddddddddc..',
    '...ccccccccccc..',
    '...bbbb.bbbbbb..',
    '................',
    '................',
  ]));
}

function ringIcon(): Sprite {
  // gold band with a ruby (1..3)
  return icon(grid('ring', [
    '................',
    '.......12.......',
    '......1W23......',
    '......2233......',
    '......GGgg......',
    '....GGgggggh....',
    '....Gg....gh....',
    '...Gg......gh...',
    '...Gg......gh...',
    '...Gg......gh...',
    '...Gg......gh...',
    '....Gg....gh....',
    '....gggggghh....',
    '......hhhh......',
    '................',
    '................',
  ], P.bl5, P.bl4, P.bl3));
}

function amuletIcon(): Sprite {
  // gold chain loop with a sapphire pendant (1..3)
  return icon(grid('amulet', [
    '................',
    '.....GhGhGh.....',
    '...hG......hG...',
    '..h..........G..',
    '..G..........h..',
    '..h..........G..',
    '...G........G...',
    '....h......h....',
    '.....G....G.....',
    '......h..h......',
    '.......Gg.......',
    '......G12g......',
    '.....G1W23h.....',
    '......g23h......',
    '.......gh.......',
    '................',
  ], P.bu5, P.bu4, P.bu3));
}

// ---------------------------------------------------------------------------------------------
// Item icons: two-handed weapons, off-hand pieces and the belt.

function greatswordIcon(): Sprite {
  // broader blade than 'sword' (5 diagonals instead of 3), wide crossguard, long wrapped grip
  return icon(grid('greatsword', [
    '................',
    '.............Tt.',
    '...........TTtS.',
    '..........TTtS..',
    '.........TTtSS..',
    '........TTtSS...',
    '...G...TTtSS....',
    '...GG.TTtSS.....',
    '....gGTtSS......',
    '.....gGSS.......',
    '....ddgg........',
    '...dcb.gg.......',
    '..ddb...gh......',
    '.Gcb............',
    '.gh.............',
    '................',
  ]));
}

function maulIcon(): Sprite {
  // A heavy steel block set across a long haft, drawn as a 3D bar: lit striking face at the
  // top-left end, lighter upper side, darker under side. The haft pokes out past the head.
  return icon(grid('maul', [
    '................',
    '................',
    '.......TT.......',
    '......TTSt..dc..',
    '.....TTStttdc...',
    '.....TSStttt....',
    '......SSStttt...',
    '.......SSSttSs..',
    '.......dSSSSss..',
    '......dc.Ssss...',
    '.....dc...ss....',
    '....cb..........',
    '...cb...........',
    '..dc............',
    '.Ss.............',
    '................',
  ]));
}

function shieldIcon(): Sprite {
  // round wooden shield seen face-on: steel rim, plank seams, steel boss in the middle
  return icon(grid('shield', [
    '................',
    '................',
    '......TTtt......',
    '....TTddddtS....',
    '...TdcddddcdS...',
    '...TdcddddcdS...',
    '..TddcdTtdcddS..',
    '..TddcTttScddS..',
    '..tddctSSsbccs..',
    '..tddcdSscbccs..',
    '...tdcdddcbcs...',
    '...Sdcddccbcs...',
    '....SSccccss....',
    '......Ssss......',
    '................',
    '................',
  ]));
}

function quiverIcon(): Sprite {
  // A slender leather tube on the diagonal with a gold rim and a dark strap. Two arrows stick
  // out of it: pale shafts (5) with red (1, 2) and white (3, 4) fletching on either side.
  return icon(grid('quiver', [
    '................',
    '...........15...',
    '..........152...',
    '.........152.35.',
    '........G52.354.',
    '........Gg.354..',
    '.......Edgg54...',
    '......Eddchh....',
    '.....bddcb......',
    '....Edbcb.......',
    '...Eddcb........',
    '..Eddcb.........',
    '..cccb..........',
    '...bb...........',
    '................',
    '................',
  ], P.bl4, P.bl3, P.bn4, P.bn2, P.bn3));
}

function focusIcon(): Sprite {
  // teal crystal orb (1..3) gripped by a gold claw on a short stem
  return icon(grid('focus', [
    '................',
    '......1122......',
    '.....1W1222.....',
    '....11122223....',
    '....11222233....',
    '...G12222233h...',
    '...G22222333h...',
    '....G222333h....',
    '.....Gg33gh.....',
    '.....Gggggh.....',
    '......gggh......',
    '.......gh.......',
    '.......gh.......',
    '......Gggh......',
    '.....Gggghh.....',
    '................',
  ], P.tl5, P.tl4, P.tl3));
}

function beltIcon(): Sprite {
  // a belt lying in a loop: dark inside of the far half, lit outside of the near half, gold buckle
  return icon(grid('belt', [
    '................',
    '................',
    '................',
    '................',
    '....cccccccc....',
    '..ccbbbbbbbbcc..',
    '.dcbbbbbbbbbbcc.',
    '.Ecb........bcc.',
    '.Edd..GGgg..dcb.',
    '.dddEEGddhEddcb.',
    '..ddddGYYhdacc..',
    '....ccgcchcb....',
    '......ghhh......',
    '................',
    '................',
    '................',
  ]));
}

function makeItemIcons(): Record<IconKey, Sprite> {
  return {
    sword: swordIcon(),
    axe: axeIcon(),
    mace: maceIcon(),
    greatsword: greatswordIcon(),
    maul: maulIcon(),
    // short and deeply curved, light wood, red grip
    bow: bowIcon(4.5, 4.6, [P.wd5, P.wd4, P.wd3], P.bn2, P.bl4, null),
    // corner to corner and much flatter, dark wood, gold tips, bright string
    longbow: bowIcon(6.5, 2.7, [P.wd4, P.wd3, P.wd2], P.bn4, P.gn3, P.gd3),
    wand: wandIcon(),
    staff: staffIcon(),
    shield: shieldIcon(),
    quiver: quiverIcon(),
    focus: focusIcon(),
    helm: helmIcon(),
    hood: hoodIcon(),
    armor: armorIcon(),
    robe: robeIcon(),
    gloves: glovesIcon(),
    belt: beltIcon(),
    boots: bootsIcon(),
    ring: ringIcon(),
    amulet: amuletIcon(),
  };
}

// ---------------------------------------------------------------------------------------------
// The ability icons AS THEY WERE up to Version 15 (see abilityIconsWas, below). Today's are in art/ability_icons.ts.

/** strike: one white-hot sword slash. A thin tail at the top-left swells into a blade on the right. */
function strikeIcon(): Sprite {
  const p = new Px(16, 16);
  // The slash is part of a ring around (cx, cy): from A0 (tail, pointing up) to A1 (tip, lower right).
  const cx = 4;
  const cy = 11.5;
  const R = 10;
  const A0 = -100;
  const A1 = 10;
  for (let y = 1; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      const d = dist(x, y, cx, cy);
      const ang = (Math.atan2(y + 0.5 - cy, x + 0.5 - cx) * 180) / Math.PI;
      const t = (ang - A0) / (A1 - A0); // 0 at the tail, 1 at the tip
      if (t < 0 || t > 1 || d > R) continue;
      const thick = t < 0.7 ? 1.3 + 3 * (t / 0.7) : 4.3 * ((1 - t) / 0.3);
      const depth = R - d; // 0 on the leading (outer) edge
      if (depth > thick) continue;
      p.set(x, y, depth < 1.2 ? P.white : depth < 2.4 ? P.sl5 : P.sl3);
    }
  }
  return icon(p);
}

/** whirl: the path of a blade swung all the way round: two bright crescents chasing each other about a small hilt. */
function whirlIcon(): Sprite {
  const p = new Px(16, 16);
  const cx = 8;
  const cy = 8;
  const R = 6.6;
  for (let y = 1; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      const d = dist(x + 0.5, y + 0.5, cx, cy);
      if (d > R) continue;
      const ang = Math.atan2(y + 0.5 - cy, x + 0.5 - cx);
      for (const turn of [0, Math.PI]) {
        // each crescent covers a little under half the circle: thin at its tail, thick near its tip
        let t = (((ang - turn - 0.5) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / 2.5;
        if (t > 1) continue;
        const thick = t < 0.75 ? 0.6 + 2.6 * (t / 0.75) : 3.2 * ((1 - t) / 0.25);
        const depth = R - d;
        if (depth > thick) continue;
        p.set(x, y, depth < 1.1 ? P.white : depth < 2.1 ? P.sl5 : P.sl3);
      }
    }
  }
  // the hilt in the middle
  p.rect(7, 7, 2, 2, P.gd3).rect(7, 7, 1, 1, P.gd5);
  return icon(p);
}

/** slam: a hammer head hitting the ground, with a spiky impact burst flashing out under it. */
function slamIcon(): Sprite {
  const p = new Px(16, 16);
  // Burst: nested 8-point stars squashed flat along the ground, hottest in the middle.
  const star = (scale: number, col: string): void => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const spike = i % 2 === 0; // even corners are spike tips, odd ones the notches between
      pts.push([8 + Math.cos(a) * (spike ? 7 : 3.6) * scale, 11.5 + Math.sin(a) * (spike ? 3.5 : 1.7) * scale]);
    }
    p.poly(pts, col);
  };
  star(1, P.fr4);
  star(0.74, P.lt3);
  star(0.44, P.lt4);
  // the hammer, painted over the burst
  p.blit(grid('slam', [
    '................',
    '............dc..',
    '...........dc...',
    '..........dc....',
    '.........dc.....',
    '....TTTTTTtS....',
    '....TtttttSs....',
    '....TtttttSs....',
    '....TttttSSs....',
    '....tSSSSSss....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ]), 0, 0);
  return icon(p);
}

/** shot: an arrow flying to the top-right, green fletching, two speed streaks. */
function shotIcon(): Sprite {
  return icon(grid('shot', [
    '................',
    '..........TTTTT.',
    '...........TttS.',
    '............ttS.',
    '......W....EctS.',
    '.....W....Ec..S.',
    '....W....Ec.....',
    '........Ec......',
    '.......Ec.......',
    '......Ec........',
    '...11Ec....W....',
    '..11Ec2...W.....',
    '.11Ec22..W......',
    '.1Ec22..........',
    '...22...........',
    '................',
  ], P.gn4, P.gn3));
}

/** volley: three arrows coming straight down, one behind the other, green-fletched like the shot. */
function volleyIcon(): Sprite {
  return icon(grid('volley', [
    '................',
    '...1....1.......',
    '..121..121...1..',
    '...E...121..121.',
    '...c....E...121.',
    '...E....c....E..',
    '...c....E....c..',
    '...E....c....E..',
    '...c....E....c..',
    '..TtS...c....E..',
    '...t....E....c..',
    '...W...TtS...E..',
    '........t...TtS.',
    '........W....t..',
    '.............W..',
    '................',
  ], P.gn4, P.gn3));
}

/**
 * trap: an open jaw trap seen from the same angle as the trap on the floor. Two steel jaws lie
 * open, each with a row of white-tipped fangs pointing up, and a dark gap between them.
 */
function trapIcon(): Sprite {
  return icon(grid('trap', [
    '................',
    '................',
    '...W..W..W..W...',
    '...T..T..T..T...',
    '..TtSTtSTtSTtS..',
    '.TttttttttttSSs.',
    '.Ts.zzzzzzzz.Ss.',
    '.Ts.zzzzzzzz.Ss.',
    '.Ts.WzzWWzzW.Ss.',
    '.TsTtSTttSTtSSs.',
    '.TttttttttttSSs.',
    '..TttttttttSSs..',
    '...SSSSSSSSss...',
    '................',
    '................',
    '................',
  ]));
}

/** wave: three crescents of force, one behind the other, the leading one brightest. */
function waveIcon(): Sprite {
  const p = new Px(16, 16);
  // each is an arc of a circle centred off the lower left corner, so they bow toward the upper right
  const arcs: [number, number, string, string][] = [[6.2, 1.3, P.pu3, P.pu3], [9.6, 1.5, P.pu4, P.pu3], [13.2, 1.8, P.white, P.pu5]];
  for (let y = 1; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      const d = dist(x + 0.5, y + 0.5, 1.5, 14.5);
      // (only the quarter that faces up and to the right, and not the ends of it)
      const a = Math.atan2(14.5 - (y + 0.5), x + 0.5 - 1.5);
      if (a < 0.2 || a > 1.37) continue;
      for (const [r, w, hot, cool] of arcs) {
        if (Math.abs(d - r) <= w / 2) p.set(x, y, d >= r ? hot : cool);
      }
    }
  }
  return icon(p);
}

/** orb: a glowing arcane sphere, and a wave going out from it. */
function orbIcon(): Sprite {
  const p = new Px(16, 16);
  for (let y = 1; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      const d = dist(x, y, 8, 8);
      // the wave: a ring, brighter on the side the light comes from
      if (d > 5.7 && d <= 6.9) p.set(x, y, x + y < 13 ? P.pu5 : x + y < 20 ? P.pu4 : P.pu3);
    }
  }
  p.ellipse(8, 8, 3.6, 3.6, P.pu3);
  p.ellipse(7.6, 7.6, 2.8, 2.8, P.pu4);
  p.ellipse(7, 7, 1.6, 1.6, P.pu5);
  p.rect(6, 6, 1, 1, P.white);
  return icon(p);
}

/** beam: a hard line of light from corner to corner, white at its heart, with the flare it leaves the wand in. */
function beamIcon(): Sprite {
  const p = new Px(16, 16);
  // the line runs from (2.5, 13.5) to (14.5, 1.5)
  const ax = 2.5;
  const ay = 13.5;
  const ux = 12 / Math.hypot(12, 12);
  const uy = -12 / Math.hypot(12, 12);
  for (let y = 1; y < 15; y++) {
    for (let x = 1; x < 15; x++) {
      const px = x + 0.5 - ax;
      const py = y + 0.5 - ay;
      const along = px * ux + py * uy;
      if (along < 0 || along > 17) continue;
      const off = Math.abs(px * uy - py * ux);
      if (off < 0.75) p.set(x, y, P.white);
      else if (off < 1.6) p.set(x, y, P.bu5);
      else if (off < 2.3) p.set(x, y, P.bu4);
    }
  }
  // the flare at the near end
  p.rect(1, 12, 4, 3, P.bu5).rect(2, 11, 2, 5, P.bu5).rect(2, 12, 2, 3, P.white);
  return icon(p);
}

/** familiar: a small sprite of energy, round and bright, with two eyes and a wisp of a tail. */
function familiarIcon(): Sprite {
  const p = new Px(16, 16);
  // the tail, curling away below
  p.set(10, 11, P.tl3).set(11, 12, P.tl3).set(12, 12, P.tl4).set(13, 11, P.tl4).set(9, 10, P.tl4);
  p.ellipse(7, 7.5, 4.6, 4.6, P.tl3);
  p.ellipse(6.6, 7.1, 3.8, 3.8, P.tl4);
  p.ellipse(6.2, 6.4, 2.4, 2.2, P.tl5);
  // eyes
  p.rect(5, 7, 1, 2, P.ink).rect(8, 7, 1, 2, P.ink);
  p.set(4, 4, P.white);
  // two motes of light that go with it
  p.set(12, 3, P.tl5).set(13, 6, P.tl4);
  return icon(p);
}

/** nova: a bright ring bursting outward, with eight rays. Blue-white, to stand apart from the purple orb. */
function novaIcon(): Sprite {
  const p = new Px(16, 16);
  for (let y = 3; y < 13; y++) {
    for (let x = 3; x < 13; x++) {
      const d = dist(x, y, 8, 8);
      if (d > 4.4) continue;
      if (d < 2.6) p.set(x, y, P.bu2); // dark heart, so the ring reads as a ring
      else p.set(x, y, x + y < 12 ? P.white : x + y < 19 ? P.bu5 : P.bu4);
    }
  }
  // straight rays
  p.rect(7, 1, 2, 2, P.bu5).rect(1, 7, 2, 2, P.bu5).rect(13, 7, 2, 2, P.bu4).rect(7, 13, 2, 2, P.bu4);
  // diagonal rays
  p.set(3, 3, P.bu5).set(2, 2, P.bu5).set(12, 3, P.bu5).set(13, 2, P.bu5);
  p.set(3, 12, P.bu5).set(2, 13, P.bu5).set(12, 12, P.bu4).set(13, 13, P.bu4);
  return icon(p);
}

/** dodge: a teal boot dashing right, speed lines trailing behind it. */
function dodgeIcon(): Sprite {
  return icon(grid('dodge', [
    '................',
    '................',
    '................',
    '.......11223....',
    '........1223....',
    '.WWWW...1223....',
    '........1223....',
    '...WWWW.1223....',
    '........12223...',
    '.WWWWW..122223..',
    '........2222223.',
    '...WWW..3333333.',
    '........444.444.',
    '................',
    '................',
    '................',
  ], P.tl5, P.tl4, P.tl3, P.tl2));
}

/**
 * The attacks' icons as they were up to Version 15: grids of single game pixels, and one boot
 * (`dodge`) for both Leap and Warp. The game does not use them: they are kept for the
 * before-and-after picture (src/dev/preview_ability_icons.ts). The icons of today are painted in
 * art/ability_icons.ts.
 */
export function abilityIconsWas(): Record<string, Sprite> {
  return {
    strike: strikeIcon(),
    slam: slamIcon(),
    whirl: whirlIcon(),
    shot: shotIcon(),
    volley: volleyIcon(),
    trap: trapIcon(),
    wave: waveIcon(),
    orb: orbIcon(),
    beam: beamIcon(),
    familiar: familiarIcon(),
    nova: novaIcon(),
    dodge: dodgeIcon(),
  };
}

// ---------------------------------------------------------------------------------------------
// Power-word runes: a carved stone tablet carrying one glowing glyph.

/** Glyphs, 6x6 (frost is 7x7). 'X' = the word's colour (WORD_COLOR), 'o' = its lighter glowing core. */
const GLYPH: Record<WordId, readonly string[]> = {
  // two stacked chevrons pointing up
  power: ['..oo..', '.XXXX.', 'XX..XX', '..oo..', '.XXXX.', 'XX..XX'],
  // double arrow >>
  swift: ['X..X..', 'XX.XX.', '.Xo.Xo', '.Xo.Xo', 'XX.XX.', 'X..X..'],
  // two bars
  twin: ['oX..oX', 'oX..oX', 'oX..oX', 'oX..oX', 'oX..oX', 'oX..oX'],
  // flame
  fire: ['..X...', '..XX..', 'X.XXX.', 'XXXoXX', 'XXooXX', '.XooX.'],
  // snowflake (7x7 so that it has a centre pixel)
  frost: ['X..X..X', '.X.X.X.', '..XoX..', 'XXoooXX', '..XoX..', '.X.X.X.', 'X..X..X'],
  // bolt
  lightning: ['...XX.', '..XX..', '.XoooX', '...XX.', '..XX..', '.XX...'],
  // droplet
  leech: ['..XX..', '..XX..', '.XXXX.', 'XoXXXX', 'XoXXXX', '.XXXX.'],
  // starburst
  volatile: ['X.XX.X', '.XXXX.', 'XXooXX', 'XXooXX', '.XXXX.', 'X.XX.X'],
  // skull
  poison: ['.XXXX.', 'XXXXXX', 'X.XX.X', 'XXXXXX', '.XooX.', '.X..X.'],
};

/** The lighter tone used for each glyph's glowing core. */
const WORD_GLOW: Record<WordId, string> = {
  power: P.bl5,
  swift: P.gn5,
  twin: P.tl5,
  fire: P.fr6,
  frost: P.bu5,
  lightning: P.lt4,
  leech: P.white,
  volatile: P.pu5,
  poison: P.vn5,
};

function runeSprite(word: WordId): Sprite {
  // the blank tablet: lit top and left edge (1), face (2), shadowed bottom and right edge (3)
  const p = grid('rune', [
    '............',
    '..11111111..',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '..33333333..',
    '............',
  ], P.st6, P.st5, P.st3);
  const rows = GLYPH[word];
  const n = rows.length;
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < n && gx >= 0 && gx < n && rows[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      if (!on(gx, gy)) continue;
      // carved look: the groove's top and left walls are in shadow
      if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
      if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
    }
  }
  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      if (on(gx, gy)) p.set(3 + gx, 3 + gy, rows[gy].charAt(gx) === 'o' ? WORD_GLOW[word] : WORD_COLOR[word]);
    }
  }
  return p.outline(P.ink).sprite(6, 10);
}

function makeWordRunes(): Record<WordId, Sprite> {
  const out = {} as Record<WordId, Sprite>;
  for (const w of WORD_IDS) out[w] = runeSprite(w);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Pickups

function potionSprite(): Sprite {
  // round flask: cork (E, d, c), glass neck (T, t, S), red liquid (1..4)
  return icon(grid('potion', [
    '................',
    '......EEdd......',
    '......Eddc......',
    '.....TTttSS.....',
    '......TttS......',
    '......TttS......',
    '....TT2233SS....',
    '...1222223334...',
    '..12WW22233334..',
    '..12W222233334..',
    '..122222233344..',
    '..222222333344..',
    '...2222333344...',
    '.....333344.....',
    '................',
    '................',
  ], P.bl5, P.bl4, P.bl3, P.bl2));
}

/** Three coin piles, small to large. Anchor: bottom-centre of the pile. */
function goldPiles(): Sprite[] {
  const piles: ReadonlyArray<readonly string[]> = [
    [
      '.........',
      '...YGG...',
      '..ghhhg..',
      '.YGGgYGG.',
      '.ghhGghh.',
      '..kkhkk..',
      '.........',
    ],
    [
      '............',
      '....YGGg....',
      '...ghhhhYG..',
      '..YGGgYGghh.',
      '.YGghhgGGhG.',
      '.ghhYGGhhgh.',
      '..kkhhhhkk..',
      '............',
    ],
    [
      '...............',
      '......YGGg.....',
      '....YGghhhYG...',
      '...YGGhYGGghh..',
      '..ghhYGGhhYGGg.',
      '.YGGghhYGGhhhh.',
      '.ghhYGGghhYGGh.',
      '.kkghhhkYGhhhk.',
      '...kkkkkhhkkk..',
      '...............',
    ],
  ];
  return piles.map((rows, i) => {
    const p = grid('gold' + i, rows).outline(P.ink);
    return p.sprite(Math.floor(p.w / 2), p.h - 2);
  });
}

function lifeOrbSprite(): Sprite {
  return grid('lifeOrb', [
    '........',
    '..1122..',
    '.1W1223.',
    '.111223.',
    '.122233.',
    '.222333.',
    '..2333..',
    '........',
  ], P.bl5, P.bl4, P.bl3).outline(P.ink).sprite(4, 7);
}

// ---------------------------------------------------------------------------------------------
// The Mage's Orb projectile and the Ranger's Trap, one set per damage element.

const ELEMENTS: readonly Element[] = ['phys', 'fire', 'frost', 'lightning'];

/** Orb colours per element: [rim, body, glow, core]. 'phys' is arcane purple. */
const ORB_RAMP: Record<Element, readonly [string, string, string, string]> = {
  phys: [P.pu3, P.pu4, P.pu5, P.white],
  fire: [P.fr3, P.fr4, P.fr5, P.fr6],
  frost: [P.bu3, P.bu4, P.bu5, P.white],
  lightning: [P.lt2, P.lt3, P.lt4, P.white],
};

/** One of 3 looping frames: the hot centre circles inside the ball while three sparks orbit it. */
function orbFrame(el: Element, frame: number): Sprite {
  const [rim, body, glow, core] = ORB_RAMP[el];
  const p = new Px(10, 10);
  p.ellipse(5, 5, 4, 4, rim);
  p.ellipse(5, 5, 3, 3, body);
  const turn = (frame / 3) * Math.PI * 2;
  const hx = 5 + Math.cos(turn) * 0.7;
  const hy = 5 + Math.sin(turn) * 0.7;
  p.ellipse(hx, hy, 2, 2, glow);
  p.ellipse(hx, hy, 1, 1, core);
  // sparks sit 120 degrees apart and advance 40 degrees per frame, so 3 frames loop seamlessly
  for (let k = 0; k < 3; k++) {
    const a = (frame / 9 + k / 3) * Math.PI * 2;
    p.set(5 + Math.cos(a) * 4.5, 5 + Math.sin(a) * 4.5, glow);
  }
  return p.sprite(5, 5); // glowing, so no ink outline
}

/**
 * Glow on the trap's pressure plate per element: [core, edge] idle, then [core, edge] armed.
 * A trap with no element on it is plain steel until it is armed; armed, its plate is the heroes'
 * own cyan (kit.ts, CYAN: what glows on a friend is cyan), so that it can be SEEN to be armed.
 */
const TRAP_GLOW: Record<Element, readonly [string, string, string, string]> = {
  phys: [P.sl3, P.sl2, '#b8fff8', '#22d0e0'],
  fire: [P.fr5, P.fr4, P.fr6, P.fr5],
  frost: [P.bu5, P.bu4, P.white, P.bu5],
  lightning: [P.lt4, P.lt3, P.white, P.lt4],
};

/** The trap as it was painted until Version 15 (a grid of fourteen by ten game pixels). Kept for the before-and-after picture: src/dev/preview_trap.ts. */
export function trapFrameBefore(el: Element, armed: boolean): Sprite {
  const glow: Record<Element, readonly [string, string, string, string]> = { ...TRAP_GLOW, phys: [P.sl3, P.sl3, P.sl4, P.sl4] };
  const steel = armed ? [P.sl5, P.sl4, P.sl3, P.sl2] : [P.sl4, P.sl3, P.sl2, P.sl1];
  return grid('trapFloor', [
    '..............',
    '...1..11..1...',
    '..112.12.213..',
    '..1222222223..',
    '.12.465564.33.',
    '.12.465564.33.',
    '.121.4444.133.',
    '..2222222233..',
    '...33333333...',
    '..............',
  ], steel[0], steel[1], steel[2], steel[3], glow[el][armed ? 2 : 0], glow[el][armed ? 3 : 1]).outline(P.ink).sprite(7, 6);
}

/** The trap's canvas, in picture pixels (two to a game pixel, as the heroes are painted), and the floor point under its middle. */
const TRAP_W = 40;
const TRAP_H = 30;
const TRAP_X = 20;
const TRAP_Y = 18;

/**
 * The Ranger's trap, at the heroes' grain and turned to the grid (the owner, 6 Oct 2026: "look at
 * the rangers trap sprite and bring it up to the new standard"). A jaw trap lying open on the
 * floor: a ring of two steel jaws, round on the floor and so twice as wide as deep on the screen;
 * the hinge the jaws turn on runs ALONG THE GRID (down the screen to the right), a block at each
 * end of it; teeth stand up all round the ring, the far ones over its rim and the near ones in
 * front of the plate; and in the middle the pressure plate, which glows with the word the trap
 * was laid with. The armed frame is the same painting a step brighter, the plate lit.
 */
function trapFrame(el: Element, armed: boolean): Sprite {
  const glow = TRAP_GLOW[el];
  const p = new Px(TRAP_W, TRAP_H);
  const tones = [P.sl5, P.sl4, P.sl3, P.sl2, P.sl1];
  /** Steel, 0 the lightest of it to 3 the darkest; armed, every tone is a step brighter. */
  const steel = (i: number): string => tones[Math.max(0, Math.min(4, i + (armed ? 0 : 1)))];
  const cx = TRAP_X;
  const cy = TRAP_Y;
  const RX = 14;
  const RY = 7;
  const rx = 10;
  const ry = 5;
  // the ring of the jaws, and the dark under them; the light comes from the upper left
  for (let y = 0; y < TRAP_H; y++) {
    for (let x = 0; x < TRAP_W; x++) {
      const ox = x + 0.5 - cx;
      const oy = y + 0.5 - cy;
      const outer = (ox / RX) ** 2 + (oy / RY) ** 2;
      const inner = (ox / rx) ** 2 + (oy / ry) ** 2;
      if (outer > 1) continue;
      if (inner <= 1) {
        p.set(x, y, P.ink);
        continue;
      }
      const lit = (-ox / RX - oy / RY) / Math.SQRT2;
      // (a step darker than the teeth that stand on it, so that the teeth are what is seen first)
      p.set(x, y, lit > 0.3 ? steel(1) : lit > -0.3 ? steel(2) : steel(3));
    }
  }
  // the bar under the plate, hinge to hinge, along the grid
  for (let t = -11; t <= 11; t++) {
    const x = cx + t;
    const y = cy + Math.round(t / 2);
    p.set(x, y, steel(2)).set(x, y + 1, steel(3));
  }
  // where the two jaws meet, at either end of the bar: a seam across the ring, and the hinge's block
  for (const side of [-1, 1]) {
    const hx = cx + side * 12;
    const hy = cy + side * 6;
    for (let k = -3; k <= 3; k++) {
      const x = hx + k;
      const y = hy + Math.round(k / 2);
      if (p.has(x, y)) p.set(x, y, P.ink);
    }
    p.rect(hx - 2, hy - 2, 4, 3, steel(1)).hline(hx - 2, hy - 2, 4, steel(0)).set(hx + 1, hy, steel(2));
  }
  // the pressure plate, and what glows on it
  p.ellipse(cx, cy, 6, 3, steel(2));
  p.ellipse(cx, cy - 0.5, 5.4, 2.5, steel(1));
  p.ellipse(cx, cy - 0.5, 3.8, 1.8, glow[armed ? 3 : 1]);
  p.ellipse(cx, cy - 0.5, 2.1, 1, glow[armed ? 2 : 0]);
  // the teeth: one every thirty degrees round the ring, but for the two where the hinge is. Each
  // stands up from the middle of its jaw: lit on its left, in shade on its right.
  const teeth: number[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 + 15) * (Math.PI / 180);
    // (the hinge is along the grid: at 26.6 degrees below the level, either way)
    const off = Math.abs(((k * 30 + 15 - 26.6 + 540) % 180) - 90);
    if (off > 72) continue;
    teeth.push(a);
  }
  // (the far ones first: the near ones are painted over what is behind them)
  teeth.sort((a, b) => Math.sin(a) - Math.sin(b));
  for (const a of teeth) {
    const bx = Math.round(cx + Math.cos(a) * 12);
    const by = Math.round(cy + Math.sin(a) * 6);
    const tall = Math.sin(a) > 0 ? 5 : 4;
    for (let i = 0; i < tall; i++) {
      const y = by - i;
      const wide = i < 2 ? 3 : i < tall - 1 ? 2 : 1;
      for (let j = 0; j < wide; j++) p.set(bx - 1 + j + (wide === 1 ? 1 : 0), y, j === wide - 1 && wide > 1 ? steel(2) : steel(0));
    }
    p.set(bx, by - tall + 1, armed ? P.white : steel(0));
  }
  return p.outline(P.ink).sprite(TRAP_X, TRAP_Y, 2);
}

// ---------------------------------------------------------------------------------------------

/** Draw every icon and pickup sprite. Call once at start-up. */
export function makeIconArt(): IconArt {
  const orb = {} as Record<Element, Sprite[]>;
  const trap = {} as Record<Element, Sprite[]>;
  for (const el of ELEMENTS) {
    orb[el] = [0, 1, 2].map((f) => orbFrame(el, f));
    trap[el] = [trapFrame(el, false), trapFrame(el, true)];
  }
  return {
    item: makeItemIcons(),
    ability: makeAbilityIcons(),
    word: makeWordRunes(),
    potion: potionSprite(),
    gold: goldPiles(),
    lifeOrb: lifeOrbSprite(),
    orb,
    trap,
  };
}
