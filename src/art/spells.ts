// The pictures of the spells that came with Version 12: the orb the staff sets down, the familiar,
// and the familiar's bolt. Painted at the finer grain in the chosen art style (style 6): flat
// tones, no outline, a heart that glows.
//
// The owner, 4 Oct 2026: Orb is "a large stationary ball that pulses waves of damage"; Familiar
// "a small energy sprite for a few seconds that shoots small projectiles".
//
// Each comes in the colours of the damage it deals: the mage's own violet with no element word,
// fire, frost, or lightning. (The other words show on what the spell does: its waves, its bolts,
// its beam. See render/fx.ts.)

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import type { Element } from '../game/types';
import { GRAIN } from './kit';
import { P } from './palette';

/** A spell's tones: shade, body, light, heart. */
export type Tones = readonly [string, string, string, string];

export const SPELL_TONES: Record<Element, Tones> = {
  // (the mage's robe, and the violet their untyped magic has always been drawn in)
  phys: ['#3a1a7a', '#7a3ae0', '#b890ff', '#ffffff'],
  fire: [P.fr3, P.fr4, P.fr5, P.fr6],
  frost: [P.bu3, P.bu4, P.bu5, P.white],
  lightning: [P.lt2, P.lt3, P.lt4, P.white],
};

const ELEMENTS: readonly Element[] = ['phys', 'fire', 'frost', 'lightning'];

export const ORB_FRAMES = 8;
export const FAMILIAR_FRAMES = 6;

export interface SpellArt {
  /** The orb, turning: its anchor is its centre. About 20 game pixels across. */
  orb: Record<Element, Sprite[]>;
  /** A familiar, one kind for each kind of damage (see familiarFrame): anchor at the middle of its body. About 11 game pixels across. */
  familiar: Record<Element, Sprite[]>;
  /** A familiar's bolt: anchor at its centre. */
  mote: Record<Element, Sprite>;
}

/**
 * The orb: a ball in three flat tones, lit from the upper left, with a white-hot heart that
 * circles inside it and four sparks that go round it.
 */
function orbFrame(tones: Tones, frame: number): Sprite {
  const [shade, body, light, heart] = tones;
  const S = 22 * GRAIN;
  const c = S / 2;
  const p = new Px(S, S);
  const turn = (frame / ORB_FRAMES) * Math.PI * 2;
  // sparks first, so the ball is drawn over the ones behind it
  for (let k = 0; k < 4; k++) {
    const a = turn + (k / 4) * Math.PI * 2;
    // (their path is a ring seen a little from above, as the floor is)
    const sx = c + Math.cos(a) * 10 * GRAIN;
    const sy = c + Math.sin(a) * 4.2 * GRAIN;
    if (Math.sin(a) < 0) p.rect(Math.round(sx) - 1, Math.round(sy) - 1, 2, 2, k % 2 === 0 ? light : heart);
  }
  p.ellipse(c, c, 8.5 * GRAIN, 8.5 * GRAIN, shade);
  p.ellipse(c - 1.2 * GRAIN, c - 1.2 * GRAIN, 7 * GRAIN, 7 * GRAIN, body);
  p.ellipse(c - 2.6 * GRAIN, c - 2.8 * GRAIN, 4.2 * GRAIN, 4 * GRAIN, light);
  // the heart goes round inside the light
  const hx = c - 2.6 * GRAIN + Math.cos(turn) * 1.6 * GRAIN;
  const hy = c - 2.8 * GRAIN + Math.sin(turn) * 1.4 * GRAIN;
  p.ellipse(hx, hy, 1.9 * GRAIN, 1.8 * GRAIN, heart);
  // a rim of light along the lower right edge: the glow coming back off the floor
  for (let i = 0; i < 9; i++) {
    const a = 0.25 + (i / 8) * 1.05;
    p.set(Math.round(c + Math.cos(a) * 7.9 * GRAIN), Math.round(c + Math.sin(a) * 7.9 * GRAIN), light);
  }
  for (let k = 0; k < 4; k++) {
    const a = turn + (k / 4) * Math.PI * 2;
    const sx = c + Math.cos(a) * 10 * GRAIN;
    const sy = c + Math.sin(a) * 4.2 * GRAIN;
    if (Math.sin(a) >= 0) p.rect(Math.round(sx) - 1, Math.round(sy) - 1, 2, 2, k % 2 === 0 ? light : heart);
  }
  return p.sprite(c, c, GRAIN);
}

/** A soft edge: every other pixel of a ring round a body, so that it seems made of light and not of stuff. */
function haze(p: Px, cx: number, cy: number, rx: number, ry: number, col: string, phase: number): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      if (d <= 1 && d > 0.5 && (x + y + phase) % 2 === 0 && !p.has(x, y)) p.set(x, y, col);
    }
  }
}

/** A little diamond, `rx` by `ry` from its middle to its points. */
function gem(p: Px, cx: number, cy: number, rx: number, ry: number, col: string): void {
  p.poly([[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], col);
}

/**
 * A familiar. From Version 15.1 each kind of damage has a spirit of its own, and none of them is a
 * solid little creature with eyes any more (the owner, on his page of notes: "more ethereal, a
 * sprite per damage type"; up to 15.0 all four were one round body with two dark eyes and a tail,
 * in four colours). Each is a thing made of its element, with a haze of light round it:
 *   the mage's own magic   a wisp: a ball of violet light with a heart that turns from a diamond
 *                          to a cross and back, a tail that curls under it and comes apart into
 *                          motes, and two motes going round it
 *   fire                   a flame standing on nothing: a round foot, a tongue that leans one way
 *                          and the other, and embers thrown up off its tip
 *   frost                  a shard of ice, turning: a tall diamond lit down one side, a glint
 *                          that comes and goes, two slivers going round it and snow falling from it
 *   lightning              a knot of lightning: a white heart and five crooked arms that are
 *                          never in the same place twice
 * The anchor is the middle of the body, as it was; they are a little bigger (about 11 across).
 */
function familiarFrame(el: Element, tones: Tones, frame: number): Sprite {
  const [shade, body, light, heart] = tones;
  const G = GRAIN;
  const W = 16 * G;
  const H = 22 * G;
  const cx = W / 2;
  const cy = 9 * G;
  const p = new Px(W, H);
  const k = frame / FAMILIAR_FRAMES;
  const turn = k * Math.PI * 2;
  const wave = Math.sin(turn);
  const dot = (x: number, y: number, c: string, big = true): void => {
    if (big) p.rect(Math.round(x) - 1, Math.round(y) - 1, 2, 2, c);
    else p.set(Math.round(x), Math.round(y), c);
  };
  if (el === 'fire') {
    // the tip of the tongue first, then the tongue, then the foot over them
    p.ellipse(cx + wave * 1.9 * G, cy - 6.6 * G, 0.8 * G, 1.2 * G, shade);
    p.ellipse(cx + wave * 1.3 * G, cy - 4.6 * G, 1.5 * G, 1.9 * G, body);
    p.ellipse(cx + wave * 0.6 * G, cy - 2.2 * G, 2.5 * G, 2.5 * G, body);
    p.ellipse(cx, cy + 0.9 * G, 3.5 * G, 3.3 * G, body);
    p.ellipse(cx + wave * 0.5 * G, cy - 1.7 * G, 1.3 * G, 1.9 * G, light);
    p.ellipse(cx, cy + 1.1 * G, 2.3 * G, 2.2 * G, light);
    p.ellipse(cx, cy + 1.5 * G, 1.1 * G, 1.1 * G, heart);
    haze(p, cx, cy + 0.4 * G, 5 * G, 5 * G, shade, frame);
    // embers off the tip: each climbs, and is gone
    dot(cx - 2.8 * G - wave * G, cy - 5.5 * G - (frame % 3) * 1.4 * G, light);
    dot(cx + 3.2 * G, cy - 3.6 * G - ((frame + 1) % 3) * 1.6 * G, body);
    dot(cx + wave * 2.4 * G, cy - 8.4 * G - ((frame + 2) % 3) * 0.8 * G, heart, false);
  } else if (el === 'frost') {
    const tall = 5.8 * G;
    const wide = (2.3 + 0.7 * Math.abs(wave)) * G;
    // the slivers that are behind it, the shard, the slivers in front
    const sliver = (front: boolean): void => {
      for (const side of [0, Math.PI]) {
        const a = turn + side;
        if (Math.sin(a) >= 0 !== front) continue;
        gem(p, cx + Math.cos(a) * 5.6 * G, cy + 1 * G + Math.sin(a) * 2 * G, 1 * G, 1.9 * G, front ? light : body);
      }
    };
    sliver(false);
    gem(p, cx, cy, wide, tall, body);
    // (the faces on the side the light comes from, and the edge between them and the others)
    p.poly([[cx, cy - tall], [cx, cy + tall], [cx - wide, cy]], light);
    p.line(cx, cy - tall + G, cx, cy + tall - G, heart);
    p.poly([[cx + 1, cy - tall + 2 * G], [cx + wide - G, cy], [cx + 1, cy + 1.5 * G]], shade);
    haze(p, cx, cy, 5 * G, 7 * G, shade, frame);
    sliver(true);
    // a glint on its upper face that comes and goes
    if (frame % 3 === 0) {
      const gx = Math.round(cx - wide * 0.45);
      const gy = Math.round(cy - tall * 0.42);
      p.rect(gx - 2, gy, 5, 1, heart).rect(gx, gy - 2, 1, 5, heart);
    }
    // snow falling from its foot
    dot(cx - 1.5 * G + wave * G, cy + tall + (1 + (frame % 3) * 1.3) * G, light, false);
    dot(cx + 1.8 * G, cy + tall + (0.5 + ((frame + 2) % 3) * 1.5) * G, heart, false);
  } else if (el === 'lightning') {
    // the arms: each two strokes with a kink between, re-thrown every frame
    for (let i = 0; i < 5; i++) {
      const seed = (i * 7 + frame * 5) % 11;
      const a = (i / 5) * Math.PI * 2 + frame * 1.9 + seed * 0.21;
      const len = (3.6 + (seed % 4) * 0.9) * G;
      const kink = (seed % 2 === 0 ? 1 : -1) * 1.4 * G;
      const mx = cx + Math.cos(a) * len * 0.55 - Math.sin(a) * kink;
      const my = cy + Math.sin(a) * len * 0.55 + Math.cos(a) * kink;
      const ex = cx + Math.cos(a) * len;
      const ey = cy + Math.sin(a) * len;
      p.line(cx, cy, mx, my, light);
      p.line(mx, my, ex, ey, body);
      dot(ex, ey, heart, false);
    }
    haze(p, cx, cy, 4.6 * G, 4.6 * G, shade, frame);
    p.ellipse(cx, cy, 2.5 * G, 2.5 * G, body);
    p.ellipse(cx, cy, 1.7 * G, 1.7 * G, light);
    p.ellipse(cx, cy, (0.8 + 0.3 * (frame % 2)) * G, (0.8 + 0.3 * (frame % 2)) * G, heart);
  } else {
    // the tail: it curls under the body and comes apart into motes
    p.ellipse(cx + wave * 0.7 * G, cy + 4.3 * G, 2 * G, 1.9 * G, shade);
    p.ellipse(cx - wave * 1.4 * G, cy + 6.4 * G, 1.3 * G, 1.3 * G, shade);
    dot(cx + wave * 1.9 * G, cy + 8.3 * G, body);
    dot(cx - wave * 1.2 * G, cy + 10 * G, shade, false);
    // the motes that go round it: the one behind first
    const mote = (front: boolean): void => {
      for (const side of [0, Math.PI]) {
        const a = turn + side;
        if (Math.sin(a) >= 0 !== front) continue;
        dot(cx + Math.cos(a) * 5.6 * G, cy + Math.sin(a) * 2.2 * G, front ? heart : light, front);
      }
    };
    mote(false);
    p.ellipse(cx, cy, 3.6 * G, 3.6 * G, body);
    p.ellipse(cx - 0.4 * G, cy - 0.5 * G, 2.5 * G, 2.5 * G, light);
    haze(p, cx, cy, 5 * G, 5 * G, shade, frame);
    // the heart: a diamond that turns to a cross and back
    if (frame % 2 === 0) gem(p, cx - 0.2 * G, cy - 0.3 * G, 1.5 * G, 1.5 * G, heart);
    else {
      p.rect(Math.round(cx - 0.2 * G) - 3, Math.round(cy - 0.3 * G) - 1, 6, 2, heart);
      p.rect(Math.round(cx - 0.2 * G) - 1, Math.round(cy - 0.3 * G) - 3, 2, 6, heart);
    }
    mote(true);
  }
  return p.sprite(cx, cy, G);
}

/** The familiar as it was up to Version 15.0, in whatever tones: for the art tools, showing before and after. */
export function familiarWas(tones: Tones, frame: number): Sprite {
  const [shade, body, light, heart] = tones;
  const W = 12 * GRAIN;
  const H = 15 * GRAIN;
  const cx = W / 2;
  const cy = 5.5 * GRAIN;
  const p = new Px(W, H);
  const wave = Math.sin((frame / FAMILIAR_FRAMES) * Math.PI * 2);
  // the tail: three pieces, each smaller and further to one side
  p.ellipse(cx + wave * 0.6 * GRAIN, cy + 4.6 * GRAIN, 2.2 * GRAIN, 1.8 * GRAIN, shade);
  p.ellipse(cx - wave * 1.2 * GRAIN, cy + 6.6 * GRAIN, 1.5 * GRAIN, 1.3 * GRAIN, shade);
  p.ellipse(cx + wave * 1.6 * GRAIN, cy + 8.3 * GRAIN, 0.9 * GRAIN, 0.9 * GRAIN, body);
  // the body
  p.ellipse(cx, cy, 4.6 * GRAIN, 4.4 * GRAIN, shade);
  p.ellipse(cx - 0.5 * GRAIN, cy - 0.6 * GRAIN, 3.9 * GRAIN, 3.7 * GRAIN, body);
  p.ellipse(cx - 1.3 * GRAIN, cy - 1.5 * GRAIN, 2.3 * GRAIN, 2 * GRAIN, light);
  p.rect(Math.round(cx - 2.6 * GRAIN), Math.round(cy - 2.6 * GRAIN), 2, 2, heart);
  // the eyes: it looks where it is going
  const ink = '#0e0c24';
  p.rect(Math.round(cx - 2.2 * GRAIN), Math.round(cy + 0.1 * GRAIN), 2, 3, ink);
  p.rect(Math.round(cx + 1.0 * GRAIN), Math.round(cy + 0.1 * GRAIN), 2, 3, ink);
  return p.sprite(cx, cy, GRAIN);
}

function moteSprite(tones: Tones): Sprite {
  const [, body, light, heart] = tones;
  const S = 5 * GRAIN;
  const c = S / 2;
  const p = new Px(S, S);
  p.ellipse(c, c, 2.4 * GRAIN, 2.4 * GRAIN, body);
  p.ellipse(c - 0.3 * GRAIN, c - 0.3 * GRAIN, 1.5 * GRAIN, 1.5 * GRAIN, light);
  p.rect(Math.round(c - 0.8 * GRAIN), Math.round(c - 0.8 * GRAIN), 2, 2, heart);
  return p.sprite(c, c, GRAIN);
}

export function makeSpellArt(): SpellArt {
  const orb = {} as Record<Element, Sprite[]>;
  const familiar = {} as Record<Element, Sprite[]>;
  const mote = {} as Record<Element, Sprite>;
  for (const el of ELEMENTS) {
    const tones = SPELL_TONES[el];
    orb[el] = Array.from({ length: ORB_FRAMES }, (_, f) => orbFrame(tones, f));
    familiar[el] = Array.from({ length: FAMILIAR_FRAMES }, (_, f) => familiarFrame(el, tones, f));
    mote[el] = moteSprite(tones);
  }
  return { orb, familiar, mote };
}
