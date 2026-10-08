// Concept art, not part of the game: a SECOND sheet of ten wordsmiths, for the owner to pick from.
//
// The owner, 5 Oct 2026 (18:07), of the first ten (options_wordsmith.ts): "Can I get more like 5,
// 2, and 7? Some slight changes and some combinations". 5 is the skald, 2 the old scribe, 7 the
// marked one. So each of those three is taken apart into what it is made of (a head, a trunk, what
// is on the shoulders, what is in each hand, what glows) and put together again ten ways: each of
// the three with one thing changed, each pair mixed, and one that is all three. They are numbered
// 11 to 20, so that "the beard of 2 on 14" still says what it means.
//
// Same rules as the first sheet: the game's own kit, the heroes' grain, SEEN FROM A CORNER (facing
// down the screen and to the right); what glows on a friend is cyan.

import type { Light } from '../engine/px';
import { BONE, CYAN, HI, INDIGO, INK, KAY, KX, LO, MAIL, PINK, PLUM, SPARK, STAND, STEEL, TEAL, along, ball, bezAt, compose, dim, hash, inEllipse, layer, leg, limb, lit, shear, stroke } from '../art/kit';
import type { LegStyle, Painted, Ramp, V } from '../art/kit';
import { IRON } from '../art/mkit';
import { DUSK, GOLDEN, HOT, SKIN, WOOD, armTo, beard, boots, build, crown, face, glowGreat, glowRune, hand, legs, mark, rune, scrollEnd, turned } from './options_wordsmith';
import type { Option } from './options_wordsmith';

/** What he is made of. */
interface Mix {
  /** The body: the skald's tunic and boots, the scribe's robe to the floor, or the marked one's bare chest and wrap. */
  trunk: 'skald' | 'scribe' | 'marked';
  /** The scribe stoops, unless he is told to stand straight. */
  straight?: boolean;
  /** His skin: where it is written on it is the darker one, so that the writing stands off it. */
  skin?: Ramp;
  /** Hair to the shoulders, a skullcap, a shaved head with a knot and a tail, or nothing. */
  hair: 'long' | 'cap' | 'knot' | 'bald';
  hairRamp?: Ramp;
  /** The skald's band of steel with a stone in it. */
  band?: boolean;
  /** Two plaits tied with beads, a beard to the belt, a beard to the chest, or none. */
  beard: 'plaits' | 'long' | 'mid' | 'none';
  beardRamp?: Ramp;
  /** How long the plaits are, in rows; and (`forked`) whether they hang from the end of a full beard, not from the jaw. */
  plait?: number;
  forked?: boolean;
  /** The scribe's two round lenses with the light in them. */
  lenses?: boolean;
  /** The marked one's line down the brow and the marks under his eyes. */
  brow?: boolean;
  /** The skald's cloak down the back, and the pale pelt across the shoulders. */
  cloak?: boolean;
  pelt?: boolean;
  /** The pelt's colour: pale, unless his hair and beard are (then it is a brown one, or all three run together). */
  peltRamp?: Ramp;
  /** The scribe's two scroll cases on the back. */
  cases?: boolean;
  /** The arms are bare, and written on. */
  bare?: boolean;
  /** In the further hand: nothing (it is open, as a man's is who is telling a thing), the great quill, a small brush, a brush as tall as he is, or a word standing over the palm. */
  far: 'open' | 'quill' | 'brush' | 'greatBrush' | 'word';
  /** In the nearer hand: the rune stave, a scroll run out to the floor, or a word standing over the palm. */
  near: 'stave' | 'scroll' | 'word';
  /** The skald's song: runes that leave his mouth and rise. */
  song?: boolean;
}

function mixed(o: Mix): Painted {
  const b = o.trunk === 'skald' ? build(42, 25, 14, 8, 6) : o.trunk === 'scribe' ? (o.straight ? build(40, 22, 2, 7, 6) : build(37, 21, 2, 7, 6)) : build(43, 26, 6, 6.5, 5.5);
  if (o.trunk === 'scribe' && !o.straight) {
    // (he stoops: the head is carried forward and low)
    b.cx += 1;
    b.cy += 2;
    b.fx += 1;
  }
  const { X, sy, beltY, hem } = b;
  const skin = o.skin ?? SKIN;
  const bare = o.bare === true || o.trunk === 'marked';
  const hairRamp = o.hairRamp ?? (o.hair === 'knot' ? IRON : o.hair === 'cap' ? PLUM : GOLDEN);
  const beardRamp = o.beardRamp ?? hairRamp;
  const lights: Light[] = [];
  const back = layer();
  const tall = layer();
  const body = layer();
  const mantle = layer();
  const head = layer();
  const front = layer();
  const hands = layer();
  const over = layer();

  // --- behind him ---
  if (o.cloak) {
    // a cloak down his back to the calf (it hangs behind him: its hem runs the way his shoulders do)
    const end = KAY - 7;
    const t = layer();
    lit(t, TEAL, HI, LO, (l) => {
      for (let y = sy + 2; y <= end; y++) {
        const half = 10 + ((y - sy) * 5) / (end - sy);
        for (let x = Math.round(X - half); x < Math.round(X + half); x++) if (y <= end - 1 - Math.floor(hash(x, 3) * 3)) l.set(x, y, INK);
      }
    });
    for (const dx of [-11, 10]) for (let y = sy + 12; y < end - 3; y++) mark(t, X + dx + Math.round(((y - sy) * dx) / 90), y, TEAL[1]);
    shear(t, along(X, -1), back);
  }
  if (o.cases) {
    // two scroll cases, their ends over the nearer shoulder
    limb(back, X - 4, sy + 9, X - 12, sy - 6, 2.7, 2.7, PLUM);
    scrollEnd(back, X - 12.5, sy - 7);
    limb(back, X + 1, sy + 7, X - 5, sy - 9, 2.5, 2.5, dim(PLUM));
    scrollEnd(back, X - 5.5, sy - 10, 2.1);
  }
  if (o.hair === 'knot') {
    // a long tail of hair down his back, from the knot on his crown
    lit(back, hairRamp, HI, LO, (l) => stroke(l, [[b.cx - 3, b.cy - 4], [b.cx - 9, b.cy + 2], [b.cx - 8, b.cy + 12], [b.cx - 11, b.cy + 22]], (t) => 1.8 - t * 0.9));
    back.rect(Math.round(b.cx) - 12, Math.round(b.cy) + 21, 2, 2, CYAN[2]);
  }

  // --- the legs ---
  if (o.trunk === 'skald') legs(body, boots(INDIGO, PLUM, 5, 0.5, BONE), KAY - 17);
  else if (o.trunk === 'marked') {
    // bare feet under the hem of the wrap
    const feet: LegStyle = { w: 3, upper: skin, lower: skin, share: 0.3, cuff: false, knee: null, band: null };
    leg(body, KX + 1, hem - 3, KAY - 3, true, feet, STAND, 3, 1);
    leg(body, KX - 4, hem - 2, KAY - 1, false, feet, STAND, 3, 1);
  }

  // --- what stands on the floor at his further side: behind his arm ---
  const tx = X + 15;
  if (o.far === 'quill') {
    // the quill, held like a staff: its nib on the floor, its feather over his head
    limb(tall, tx, KAY - 6, tx, sy + 4, 0.9, 0.9, BONE);
    tall.line(tx - 1, KAY - 6, tx, KAY - 2, INDIGO[1]).line(tx, KAY - 6, tx, KAY - 2, INDIGO[2]);
    // (the feather: a narrow web on the side of the spine nearer him, a broad one on the other, cut into barbs)
    const spine: [V, V, V, V] = [[tx, sy + 5], [tx - 1.5, sy - 7], [tx + 0.5, sy - 18], [tx + 5, sy - 28]];
    lit(tall, BONE, HI, LO, (l) => {
      for (let k = 0; k <= 80; k++) {
        const t = k / 80;
        const [x, y] = bezAt(spine, t);
        const swell = Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.75;
        for (let d = -1 - 1.6 * swell; d <= 1 + 4.6 * swell; d += 0.5) l.set(Math.round(x + d), Math.round(y - Math.max(0, d) * 0.55), INK);
      }
    });
    for (const t of [0.24, 0.42, 0.6, 0.76]) {
      const [x, y] = bezAt(spine, t);
      for (let i = 2; i <= 6; i++) tall.erase(Math.round(x + i), Math.round(y - i * 0.55 + 1));
    }
    for (let k = 1; k <= 30; k++) {
      const [x, y] = bezAt(spine, k / 31);
      mark(tall, x, y, TEAL[3]);
    }
    over.set(tx, KAY - 2, SPARK[3]);
    lights.push({ x: tx + 0.5, y: KAY - 2, r: 7, color: SPARK[2], a: 0.4 });
  } else if (o.far === 'greatBrush') {
    // a brush as tall as he is, held like a staff, its head up: dark hair bound in steel, the tip of it wet with light
    limb(tall, tx, KAY - 2, tx, sy - 9, 1.3, 1.3, PLUM);
    // (the binding: three turns of steel)
    tall.rect(tx - 3, sy - 14, 6, 5, STEEL[2]);
    for (const dy of [-14, -12, -10]) tall.hline(tx - 3, sy + dy, 6, dy === -12 ? STEEL[1] : STEEL[3]);
    // (the hair: a fat teardrop standing on the binding, pale, coming to a point that leans over)
    const tuft = 19;
    const halfAt = (i: number): number => {
      const t = i / (tuft - 1);
      return t < 0.35 ? 3 + (t / 0.35) * 2.2 : 5.2 * (1 - (t - 0.35) / 0.65) ** 0.85 + 0.5;
    };
    const bendAt = (i: number): number => Math.round(((i / (tuft - 1)) ** 2) * 3);
    lit(tall, BONE, HI, LO, (l) => {
      for (let i = 0; i < tuft; i++) for (let x = Math.round(tx - halfAt(i)); x < Math.round(tx + halfAt(i)); x++) l.set(x + bendAt(i), sy - 15 - i, INK);
    });
    // (the strokes of the hairs)
    for (const dx of [-2, 1]) for (let i = 1; i < 9; i++) mark(tall, tx + dx, sy - 15 - i, BONE[1]);
    // (the upper half of it is wet with light, and a drop has run down the handle)
    for (let i = 8; i < tuft; i++) {
      for (let x = tx - 7; x <= tx + 9; x++) {
        if (!tall.has(x, sy - 15 - i)) continue;
        if (i > 12 || (i + x) % 2 === 0) over.set(x, sy - 15 - i, i > 14 ? SPARK[4] : SPARK[3]);
      }
    }
    over.set(tx + 2, sy - 7, SPARK[3]).set(tx + 2, sy - 6, SPARK[3]).set(tx + 2, sy, SPARK[2]);
    lights.push({ x: tx + 2, y: sy - 29, r: 14, color: SPARK[2], a: 0.55 });
  }

  // --- the further arm ---
  const fHand: V = o.far === 'open' ? [X + 13, sy + 11] : o.far === 'brush' ? [X + 10, beltY + 4] : o.far === 'word' ? [X + 13, sy + 12] : [tx - 1, sy + 12];
  const farSkin = dim(skin);
  const fElbow = bare
    ? armTo(body, b.far, fHand, farSkin, farSkin, 2.6, 1, 8, 8)
    : o.trunk === 'scribe'
      ? armTo(body, b.far, fHand, dim(INDIGO), dim(INDIGO), 3.2, 1, 7, 7)
      : armTo(body, b.far, fHand, dim(MAIL), dim(PLUM), 3, 1, 7.5, 7.5);
  if (bare) {
    for (const k of [0.3, 0.6]) {
      mark(body, b.far[0] + (fElbow[0] - b.far[0]) * k + 1, b.far[1] + (fElbow[1] - b.far[1]) * k, CYAN[2]);
      mark(body, fElbow[0] + (fHand[0] - fElbow[0]) * k, fElbow[1] + (fHand[1] - fElbow[1]) * k, CYAN[2]);
    }
  }

  // --- the trunk ---
  if (o.trunk === 'skald') {
    // a tunic to the knee with a woven border, a belt, a horn hung from it
    turned(body, b, false, (t) => {
      lit(t, MAIL, HI, LO, (l) => l.poly([[X - 8, sy + 1], [X - 6, sy - 1], [X + 6, sy - 1], [X + 8, sy + 1], [X + 8, KAY - 15], [X - 8, KAY - 15]], INK));
      for (let x = X - 8; x < X + 8; x++) {
        mark(t, x, KAY - 16, (x - X + 40) % 4 < 2 ? TEAL[3] : BONE[2]);
        mark(t, x, KAY - 17, (x - X + 40) % 4 < 2 ? BONE[2] : TEAL[3]);
      }
      t.rect(X - 8, beltY, 16, 3, PLUM[1]);
      t.hline(X - 8, beltY, 16, PLUM[2]);
      t.rect(b.mid - 1, beltY, 3, 3, STEEL[3]);
      t.set(b.mid, beltY + 1, CYAN[2]);
    });
    lit(body, BONE, HI, LO, (l) => stroke(l, [[X + 3, beltY + 4], [X + 8, beltY + 5], [X + 9, beltY + 10], [X + 6, beltY + 14]], (t) => 2.5 - 1.9 * t));
    body.set(X + 3, beltY + 3, STEEL[3]).set(X + 2, beltY + 4, STEEL[3]);
  } else if (o.trunk === 'scribe') {
    // the robe: ink blue, to the floor, a rope round it; a line of his own writing along the hem
    turned(body, b, true, (t) => {
      lit(t, INDIGO, HI, [LO[0], LO[1] + 1], (l) => l.poly([[X - 7, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 7, sy + 1], [X + 6, beltY], [X + 10, hem], [X - 10, hem], [X - 6, beltY]], INK));
      for (const [dx, from] of [[-5, 6], [3, 10], [6, 14]] as const) for (let y = beltY + from; y < hem - 4; y++) mark(t, X + dx + Math.round(((y - beltY) * dx) / 40), y, INDIGO[1]);
      t.rect(X - 6, beltY, 12, 2, BONE[2]);
      t.hline(X - 6, beltY + 1, 12, BONE[1]);
      for (let i = 0; i < 6; i++) t.set(b.mid - 2, beltY + 2 + i, BONE[i < 5 ? 2 : 3]);
    });
    for (let x = X - 9; x <= X + 9; x++) if ((x - X + 30) % 4 !== 3) mark(body, x, hem - 3, (x - X + 30) % 8 < 4 ? TEAL[3] : CYAN[2]);
  } else {
    // the chest is bare; from the waist a long wrap of ink blue, a sash with one end hanging
    turned(body, b, true, (t) => {
      lit(t, skin, HI, LO, (l) => l.poly([[X - 6.5, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 6.5, sy + 1], [X + 5, beltY + 1], [X - 5, beltY + 1]], INK));
      lit(t, INDIGO, HI, [LO[0], LO[1] + 1], (l) => l.poly([[X - 5.5, beltY], [X + 5.5, beltY], [X + 8, hem], [X - 8, hem]], INK));
      for (let y = beltY + 5; y < hem - 1; y++) mark(t, b.mid + 2 + Math.round((y - beltY) / 9), y, INDIGO[1]);
      t.rect(X - 6, beltY - 1, 12, 3, PINK[2]);
      t.hline(X - 6, beltY - 1, 12, PINK[3]);
      t.hline(X - 6, beltY + 1, 12, PINK[1]);
      for (let i = 0; i < 11; i++) t.rect(X - 4, beltY + 2 + i, 3, 1, i > 8 ? PINK[3] : PINK[2]);
      for (let x = X - 8; x <= X + 8; x++) mark(t, x, hem - 2, (x + 40) % 3 ? CYAN[2] : INDIGO[3]);
    });
    // the writing: down the breastbone, and in lines round the ribs (a pelt, or a beard, hides the top of it)
    const from = o.beard === 'mid' || o.beard === 'long' ? 2 : o.pelt ? 1 : 0;
    for (let k = from; k < 3; k++) glowRune(over, lights, k + 1, b.mid - 2, sy + 2 + k * 6 + b.lean(b.mid), k === 1 ? 0.4 : 0.26, k === 1 ? SPARK[4] : SPARK[3]);
    const hid = from === 2 ? 10 : from === 1 ? 8 : 0;
    for (const [dx, dy, n] of [[-5, 5, 3], [-6, 8, 4], [-5, 11, 3], [3, 4, 3], [3, 7, 4], [2, 10, 4]] as const) {
      if (dy < hid) continue;
      for (let i = 0; i < n; i++) if (i !== 1 || n === 3) over.set(X + dx + i, sy + dy + b.lean(X + dx + i), CYAN[2]);
    }
  }

  // --- on the shoulders ---
  if (o.pelt) {
    // the pelt: pale, across both shoulders, ragged below
    const fur = o.peltRamp ?? BONE;
    turned(mantle, b, false, (t) => {
      lit(t, fur, HI, LO, (l) => {
        for (let x = X - 13; x <= X + 13; x++) {
          const e = Math.abs(x + 0.5 - X) / 13.5;
          const y0 = sy - 2 + Math.round(e * e * 4);
          const y1 = sy + 5 + Math.round(e * 7) - (hash(x, 9) < 0.4 ? 2 : 0) + (hash(x, 11) < 0.3 ? 1 : 0);
          for (let y = y0; y <= y1; y++) l.set(x, y, INK);
        }
      });
      for (let x = X - 12; x <= X + 12; x += 2) mark(t, x, sy + 2 + Math.floor(hash(x, 13) * 4), fur[1]);
      for (let x = X - 12; x <= X + 12; x += 3) mark(t, x, sy + 6 + Math.floor(hash(x, 17) * 4), fur[1]);
    });
  }

  // --- the head ---
  if (o.hair === 'long') {
    // (the hair that hangs to the shoulders, either side of the face)
    for (const [x0, y0, n] of [[b.cx - b.r - 1.5, b.cy - 1, 11], [b.cx + b.r - 1.5, b.cy + 1, 8]] as const) lit(head, dim(hairRamp), HI, LO, (l) => l.rect(Math.round(x0), Math.round(y0), 3, n, INK));
  }
  const ey = face(head, b, skin);
  if (o.beard === 'long' || o.beard === 'mid') beard(head, b, ey, beardRamp, o.beard === 'long' ? 22 : 14, o.beard === 'long' ? 1 : 0);
  // (a beard that is full to the chest, and forks there into two plaits)
  if (o.beard === 'plaits' && o.forked) beard(head, b, ey, beardRamp, 13, 1);
  if (o.hair === 'long') crown(head, b, hairRamp, -2, 0.8, 4);
  else if (o.hair === 'cap') crown(head, b, hairRamp, -3, 0.7, 2);
  else if (o.hair === 'knot') ball(head, b.cx - 1, b.cy - b.r - 1.5, 2.4, 2.2, hairRamp);
  if (o.band) {
    const cy = Math.round(b.cy) - 3;
    for (const [x, y] of inEllipse(b.cx, b.cy, b.r + 0.8, b.r + 0.8)) if (y === cy) head.set(x, y, STEEL[x < b.cx ? 3 : 2]);
    head.set(b.fx, cy, CYAN[2]);
    over.set(b.fx, cy, SPARK[3]);
  }
  if (o.beard === 'plaits') {
    // full under the nose and round the jaw, then the two plaits, each tied with a bead
    const n = o.plait ?? 10;
    const from = o.forked ? ey + 10 : ey + 8;
    if (!o.forked) lit(head, beardRamp, HI, LO, (l) => l.poly([[b.fx - 6, ey + 1], [b.fx - 2, ey + 3], [b.fx + 2, ey + 3], [b.fx + 5, ey + 1], [b.fx + 5, ey + 6], [b.fx + 3, ey + 8], [b.fx - 4, ey + 8], [b.fx - 6, ey + 6]], INK));
    else for (const [dx, y0, k] of [[-2, 6, 4], [2, 7, 3]] as const) for (let i = 0; i < k; i++) mark(head, b.cx + 1.5 + dx, ey + y0 + i, beardRamp[2]);
    for (const x0 of [b.fx - 4, b.fx + 2]) {
      // (a plait: two pixels wide, its turns light and dark)
      for (let i = 0; i < n; i++) head.rect(x0, from + i, 2, 1, beardRamp[Math.floor(i / 2) % 2 ? 2 : 3]);
      head.rect(x0, from + n, 2, 2, CYAN[2]);
      over.set(x0, from + n, SPARK[3]);
    }
  } else if (o.beard === 'long') {
    // (the locks of the beard)
    for (const [dx, y0, n] of [[-2, 7, 9], [2, 8, 8], [0, 12, 8]] as const) for (let i = 0; i < n; i++) mark(head, b.cx + 1.5 + dx, ey + y0 + i, beardRamp[2]);
  } else if (o.beard === 'mid') {
    for (const [dx, y0, n] of [[-2, 6, 5], [2, 7, 4]] as const) for (let i = 0; i < n; i++) mark(head, b.cx + 1.5 + dx, ey + y0 + i, beardRamp[2]);
  } else {
    head.hline(b.fx - 2, ey + 4, 4, skin[1]);
  }
  if (o.lenses) {
    // two round lenses with the light in them, and brows like his beard over them
    for (const x0 of [b.fx - 4, b.fx]) {
      head.rect(x0, ey - 1, 3, 3, STEEL[1]);
      head.set(x0 + 1, ey, SPARK[3]);
      over.set(x0 + 1, ey, HOT);
      head.hline(x0, ey - 3, 3, beardRamp[3]);
    }
    head.set(b.fx - 1, ey, STEEL[2]);
    lights.push({ x: b.fx, y: ey + 0.5, r: 6, color: SPARK[2], a: 0.34 });
  }
  if (o.brow) {
    // a line drawn from the crown down the brow (as much of it as hair and lenses leave), and a mark under each eye
    const top = o.hair === 'long' ? Math.round(b.cy) - 2 : o.hair === 'cap' ? Math.round(b.cy) - 3 : Math.round(b.cy - b.r) + 1;
    for (let y = top; y <= ey - (o.lenses ? 4 : 2); y++) over.set(b.fx - 1, y, y % 2 ? SPARK[3] : SPARK[4]);
    over.set(b.fx - 5, ey + 2, SPARK[3]).set(b.fx + 4, ey + 2, SPARK[3]);
    if (o.beard === 'none') over.set(b.fx - 5, ey + 3, CYAN[2]).set(b.fx + 4, ey + 3, CYAN[2]);
    if (o.hair === 'bald') {
      // (shaved: a line of small marks round the skull too)
      for (const [x, y] of inEllipse(b.cx, b.cy, b.r, b.r + 0.3)) if (y === Math.round(b.cy) - 3 && (x + 40) % 2 === 0 && Math.abs(x - (b.fx - 1)) > 1) over.set(x, y, CYAN[2]);
    }
    lights.push({ x: b.fx, y: ey - 3, r: 7, color: SPARK[2], a: 0.34 });
  }

  // --- the nearer arm, and what is in its hand ---
  const nHand: V = o.near === 'stave' ? [X - 14, sy + 14] : o.near === 'scroll' ? [X - 11, beltY + 1] : [X - 12, sy + 13];
  if (o.near === 'stave') {
    // the stave: taller than he is, a ring at its head, runes cut all down it
    const stx = X - 15;
    limb(front, stx, KAY - 1, stx, sy - 22, 1.35, 1.35, PLUM);
    lit(front, STEEL, HI, LO, (l) => {
      for (const [x, y] of inEllipse(stx, sy - 27, 5, 5)) if (Math.hypot(x + 0.5 - stx, y + 0.5 - (sy - 27)) > 2.6) l.set(x, y, INK);
    });
    glowRune(over, lights, 4, stx - 2, sy - 30, 0.5, SPARK[4]);
    lights.push({ x: stx, y: sy - 27, r: 12, color: SPARK[2], a: 0.3 });
    for (let k = 0; k < 9; k++) {
      const y = sy - 16 + k * 6;
      if (y > KAY - 4) break;
      const on = k === 2 || k === 5;
      front.set(stx - 1, y, on ? SPARK[3] : CYAN[1]).set(stx, y + 1, on ? SPARK[3] : CYAN[1]);
      if (on) lights.push({ x: stx, y: y + 0.5, r: 5, color: SPARK[2], a: 0.3 });
    }
  }
  const nElbow = bare
    ? armTo(front, b.near, nHand, skin, skin, 2.7, -1, 8, 8)
    : o.trunk === 'scribe'
      ? armTo(front, b.near, nHand, INDIGO, INDIGO, 3.2, -1, 7, 7)
      : armTo(front, b.near, nHand, MAIL, PLUM, 3, -1, 7.5, 7.5);
  if (bare) {
    for (const k of [0.25, 0.5, 0.75]) {
      const x = b.near[0] + (nElbow[0] - b.near[0]) * k;
      const y = b.near[1] + (nElbow[1] - b.near[1]) * k;
      over.set(Math.round(x), Math.round(y), SPARK[3]);
      mark(front, x + 1, y, CYAN[2]);
    }
    for (const k of [0.3, 0.6]) over.set(Math.round(nElbow[0] + (nHand[0] - nElbow[0]) * k), Math.round(nElbow[1] + (nHand[1] - nElbow[1]) * k), SPARK[3]);
  }
  if (o.near === 'scroll') {
    // a scroll he has let run out to the floor
    lit(front, BONE, HI, LO, (l) => {
      l.rect(X - 16, beltY + 2, 7, KAY - 8 - beltY, INK);
      l.ellipse(X - 12.5, KAY - 5, 3.6, 2.2, INK);
    });
    front.set(X - 13, KAY - 5, BONE[1]).set(X - 12, KAY - 5, BONE[1]);
    for (let y = beltY + 5; y < KAY - 8; y += 2) front.hline(X - 15, y, y % 3 === 0 ? 4 : 5, INDIGO[2]);
    for (const y of [beltY + 9, beltY + 11]) over.hline(X - 15, y, 5, SPARK[3]);
    lights.push({ x: X - 12.5, y: beltY + 10, r: 8, color: SPARK[2], a: 0.34 });
  }
  hand(front, nHand[0], nHand[1], skin);
  if (o.near === 'word') {
    // the hand is held out, palm up, and the word he has just made stands over it
    glowGreat(over, lights, 5, nHand[0] - 3, nHand[1] - 13, 0.6, 15);
    for (const [dx, dy] of [[-6, -6], [5, -10], [4, -3]] as const) over.set(Math.round(nHand[0] + dx), Math.round(nHand[1] + dy), SPARK[2]);
  }

  // --- the further hand, and what is in it ---
  if (o.far === 'brush') {
    // a brush, its tip wet with light
    limb(front, fHand[0], fHand[1] - 5, fHand[0] + 1, fHand[1] + 8, 0.9, 0.9, PLUM);
    over.rect(Math.round(fHand[0]), Math.round(fHand[1]) + 8, 2, 3, SPARK[3]);
    over.set(Math.round(fHand[0]) + 1, Math.round(fHand[1]) + 13, SPARK[2]);
    lights.push({ x: fHand[0] + 1, y: fHand[1] + 10, r: 7, color: SPARK[2], a: 0.4 });
  }
  hand(hands, fHand[0] + (o.far === 'quill' || o.far === 'greatBrush' ? 1 : 0), fHand[1], bare ? farSkin : skin);
  if (o.far === 'word') {
    glowGreat(over, lights, 2, fHand[0] - 1, fHand[1] - 13, 0.6, 15);
    for (const [dx, dy] of [[-5, -5], [6, -9], [5, -2]] as const) over.set(Math.round(fHand[0] + dx), Math.round(fHand[1] + dy), SPARK[2]);
  }

  // --- the song: three runes leave his mouth and rise, each fainter than the last ---
  if (o.song) {
    for (const [k, dx, dy, c, a] of [[1, 8, -1, SPARK[4], 0.5], [6, 12, -9, SPARK[3], 0.36], [7, 13, -18, CYAN[2], 0.2]] as const) {
      rune(over, k, b.fx + dx, ey + dy, c);
      lights.push({ x: b.fx + dx + 1.5, y: ey + dy + 2.5, r: 7, color: SPARK[2], a });
    }
  }

  return { px: compose(null, [back, tall, body, front, mantle, head, hands], over), lights };
}

/** White hair: the old scribe's. */
const WHITE: Ramp = BONE;
/** A brown pelt, for the shoulders of a man whose hair and beard are white. */
const BROWN: Ramp = WOOD;

export const WORDSMITHS2: Option[] = [
  {
    n: 11,
    name: 'Skald who writes',
    note: '5, with the tools of 2: the yellow hair, plaits, pelt and cloak, but the great quill in place of the stave, and a scroll run out to the floor.',
    paint: () => mixed({ trunk: 'skald', hair: 'long', band: true, beard: 'plaits', cloak: true, pelt: true, far: 'quill', near: 'scroll' }),
  },
  {
    n: 12,
    name: 'Old skald',
    note: "5, grown old: white hair and the beard of 2, down to his belt. Still the pelt, the stave, and the song rising.",
    paint: () => mixed({ trunk: 'skald', hair: 'long', hairRamp: WHITE, band: true, beard: 'long', cloak: true, pelt: true, peltRamp: BROWN, far: 'open', near: 'stave', song: true }),
  },
  {
    n: 13,
    name: 'Marked skald',
    note: '5, with the skin of 7: bare arms written with light, marks under his eyes, and a word standing over his open hand.',
    paint: () => mixed({ trunk: 'skald', skin: DUSK, bare: true, hair: 'long', band: true, beard: 'plaits', brow: true, cloak: true, pelt: true, far: 'word', near: 'stave' }),
  },
  {
    n: 14,
    name: 'Scribe, plaited',
    note: '2, standing straight, his white beard in the two long plaits of 5, each tied with a bead. Lenses, quill and scroll as before.',
    paint: () => mixed({ trunk: 'scribe', straight: true, cases: true, hair: 'cap', beard: 'plaits', beardRamp: WHITE, forked: true, plait: 11, lenses: true, far: 'quill', near: 'scroll' }),
  },
  {
    n: 15,
    name: 'Scribe who sings',
    note: "2, with the things of 5: the pelt on his shoulders, the rune stave to lean on, and runes rising as he speaks.",
    paint: () => mixed({ trunk: 'scribe', hair: 'cap', beard: 'long', beardRamp: WHITE, lenses: true, pelt: true, peltRamp: BROWN, far: 'open', near: 'stave', song: true }),
  },
  {
    n: 16,
    name: 'Marked scribe',
    note: '2, with the skin of 7: a shaved head and bare arms written with light. The white beard, the lenses, the quill and the scroll stay.',
    paint: () => mixed({ trunk: 'scribe', skin: DUSK, bare: true, cases: true, hair: 'bald', beard: 'long', beardRamp: WHITE, lenses: true, brow: true, far: 'quill', near: 'scroll' }),
  },
  {
    n: 17,
    name: 'Marked one, great brush',
    note: '7, with one change: his brush is as tall as he is and held like a staff, its tip wet with light. The word still stands over his palm.',
    paint: () => mixed({ trunk: 'marked', skin: DUSK, hair: 'knot', beard: 'none', brow: true, far: 'greatBrush', near: 'word' }),
  },
  {
    n: 18,
    name: 'Marked one in furs',
    note: "7, in the things of 5: the pelt and the cloak over his bare shoulders, and the rune stave. The word stands over his other hand.",
    paint: () => mixed({ trunk: 'marked', skin: DUSK, hair: 'knot', beard: 'none', brow: true, cloak: true, pelt: true, far: 'word', near: 'stave' }),
  },
  {
    n: 19,
    name: 'Marked one, old',
    note: '7, grown old, with the face of 2: a white knot and tail, a white beard to his chest, and the lenses. Brush and word as before.',
    paint: () => mixed({ trunk: 'marked', skin: DUSK, hair: 'knot', hairRamp: WHITE, beard: 'mid', lenses: true, brow: true, far: 'brush', near: 'word' }),
  },
  {
    n: 20,
    name: 'All three',
    note: "The pelt and cloak of 5; the white beard (in 5's plaits), the lenses and the quill of 2; the written arms and the word over the palm of 7.",
    paint: () => mixed({ trunk: 'skald', skin: DUSK, bare: true, hair: 'long', hairRamp: WHITE, band: true, beard: 'plaits', forked: true, plait: 9, lenses: true, brow: true, cloak: true, pelt: true, peltRamp: BROWN, far: 'quill', near: 'word' }),
  },
];
