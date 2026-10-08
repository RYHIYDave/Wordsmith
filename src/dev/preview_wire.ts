// Dev page: THE WIRE FIGURE. The skeleton (src/art/skeleton.ts) doing one of its moves
// (src/art/moves3.ts), drawn as bones, from the side and in the game's two views. The owner,
// 6 Oct 2026: "Or just create a wire frame and we can use that to make animations".
//   node tools/page_gif.mjs src/dev/preview_wire.ts "volley:film" previews/wire_volley.gif
//   node tools/preview.mjs src/dev/preview_wire.ts shots/wire.png 1600 1500 "volley:strip:0,3,6,7,13"
//   hash = <move>:<film | strip | still>:<for strip and still: the moments to show, in frames of a thirtieth of a second>:<screen pixels to one of the figure's; 6 if not given>
//     film:  the move slowed, with a pause on the moment its blow lands, then twice as the game plays it
//     strip: those moments side by side, a row for each view (for working a move out)
//     still: one moment, the three views side by side, as the film shows them
import { BOW_BRACE, BOW_HALF, GREAT_BLADE, GREAT_GRIP, MOVES3, STAFF_DOWN, STAFF_UP } from '../art/moves3';
import type { Held } from '../art/moves3';
import { add, bonesAt, cross, mul, project, solve } from '../art/skeleton';
import type { Posed, Skeleton, V3, View } from '../art/skeleton';

const raw = decodeURIComponent(location.hash.slice(1));
const [name = 'volley', mode = 'film', arg = '', scaleArg = ''] = raw.split(':');
const move = MOVES3[name] ?? MOVES3.volley;
/** Whose body it is: each hero has one of their own. */
const BODY = move.build;
const FRAME = 1 / 30;
const END = move.motion.keys[move.motion.keys.length - 1].at;
const poseAt = (t: number): Posed => bonesAt(move.motion.keys, move.rest, t);

// --- colours: a diagram, not the game's art. His right side is pale, his left blue; what he holds is the heroes' cyan. ---
const BG = '#17142e';
const PANEL = ['#221f52', '#1d1a47'];
const FLOOR = '#35316f';
const RIGHT = '#f4efff';
const LEFT = '#86a9ff';
const SPINE = '#cfc8ff';
const HELD = '#3fe3ea';
const HELD_DIM = '#1b9fb0';
const INK = '#fff3c4';
const DIM = '#9a94c8';

interface Stroke {
  pts: V3[];
  /** Thickness, in picture pixels of the figure. */
  w: number;
  color: string;
  /** A bone: it is drawn with a dark edge, so that it is seen to pass in front of what is behind it. */
  bone?: boolean;
  /** A dot at each end (a joint). */
  dots?: boolean;
  /**
   * A solid thing (the head, the ribs, the pelvis): an egg whose middle is `pts[0]` and whose
   * three half-lengths are these, each along its own line. It is filled, so that it hides what
   * is behind it, and edged.
   */
  egg?: readonly [V3, V3, V3];
  /** Drawn on the skin of the egg before it: seen only from the side it is on (the way this points). */
  on?: V3;
  /** Drawn this much nearer the eye than it is (what is on an egg goes over the egg). */
  lift?: number;
}

/** Part of a ring, as one line. */
function arc(c: V3, u: V3, v: V3, from: number, to: number, n = 12): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    out.push(add(c, add(mul(u, Math.cos(a)), mul(v, Math.sin(a)))));
  }
  return out;
}

/** Everything there is to draw of a posed figure. */
function strokesOf(s: Skeleton, held: Held, q: Posed): Stroke[] {
  const out: Stroke[] = [];
  const bone = (a: V3, b: V3, color: string, w: number): void => void out.push({ pts: [a, b], w, color, bone: true, dots: true });
  const B = BODY;
  // the spine, and the lines across the hips and the shoulders
  bone(s.pelvis, s.waist, SPINE, 1.5);
  bone(s.waist, s.ribs, SPINE, 1.5);
  bone(s.ribs, s.neck, SPINE, 1.5);
  bone(s.neck, s.skull, SPINE, 1.3);
  bone(s.hipL, s.hipR, SPINE, 1.4);
  bone(s.shoulderL, s.neck, LEFT, 1.4);
  bone(s.neck, s.shoulderR, RIGHT, 1.4);
  // the ribs and the pelvis: solid, each with a line down its front that shows which way it is turned
  const ribC = add(s.ribs, mul(s.chest[2], B.chest * 0.42));
  const ribUp = B.chest * 0.66;
  out.push({ pts: [ribC], w: 0.7, color: SPINE, egg: [mul(s.chest[0], B.ribDeep), mul(s.chest[1], B.ribHalf), mul(s.chest[2], ribUp)] });
  out.push({ pts: arc(ribC, mul(s.chest[0], B.ribDeep), mul(s.chest[2], ribUp), -58, 62, 8), w: 0.75, color: SPINE, on: s.chest[0], lift: B.ribDeep });
  const pelC = add(s.pelvis, mul(s.hips[2], B.waist * 0.3));
  out.push({ pts: [pelC], w: 0.7, color: SPINE, egg: [mul(s.hips[0], B.pelvisDeep), mul(s.hips[1], B.pelvisHalf), mul(s.hips[2], B.waist * 0.72)] });
  out.push({ pts: arc(pelC, mul(s.hips[0], B.pelvisDeep), mul(s.hips[2], B.waist * 0.72), -50, 50, 6), w: 0.75, color: SPINE, on: s.hips[0], lift: B.pelvisDeep });
  // arms and legs
  bone(s.shoulderL, s.elbowL, LEFT, 1.5);
  bone(s.elbowL, s.handL, LEFT, 1.3);
  bone(s.shoulderR, s.elbowR, RIGHT, 1.5);
  bone(s.elbowR, s.handR, RIGHT, 1.3);
  bone(s.hipL, s.kneeL, LEFT, 1.9);
  bone(s.kneeL, s.ankleL, LEFT, 1.6);
  bone(s.hipR, s.kneeR, RIGHT, 1.9);
  bone(s.kneeR, s.ankleR, RIGHT, 1.6);
  out.push({ pts: [s.ankleL, s.heelL, s.toeL, s.ankleL], w: 1.1, color: LEFT, bone: true });
  out.push({ pts: [s.ankleR, s.heelR, s.toeR, s.ankleR], w: 1.1, color: RIGHT, bone: true });
  // the head: solid, with the line of the brow across the face and a nose, so that it is seen where it looks
  const [hf, hl, hu] = s.face;
  const R = B.headR;
  out.push({ pts: [s.head], w: 0.7, color: SPINE, egg: [mul(hf, R[0]), mul(hl, R[1]), mul(hu, R[2])] });
  const brow = add(s.head, mul(hu, R[2] * 0.18));
  out.push({ pts: arc(brow, mul(hf, R[0] * 0.98), mul(hl, R[1] * 0.98), -68, 68, 10), w: 1.0, color: INK, on: hf, lift: R[0] });
  const tip = add(s.head, add(mul(hf, R[0] * 1.5), mul(hu, -R[2] * 0.16)));
  out.push({ pts: [add(s.head, add(mul(hf, R[0] * 0.96), mul(hu, R[2] * 0.2))), tip, add(s.head, add(mul(hf, R[0] * 0.93), mul(hu, -R[2] * 0.38)))], w: 0.9, color: INK, lift: R[0] * 0.6 });
  // what is held
  const p = s.point;
  const ac = s.across;
  if (held === 'bow') {
    const grip = s.handL;
    const tipOf = (side: 1 | -1): V3 => add(grip, add(mul(ac, side * BOW_HALF * (1 - 0.13 * q.draw)), mul(p, -(BOW_BRACE + 0.05 * B.tall * q.draw))));
    for (const side of [1, -1] as const) {
      const ctl = add(grip, add(mul(ac, side * BOW_HALF * 0.72), mul(p, 0.6)));
      const t = tipOf(side);
      const limb: V3[] = [];
      for (let i = 0; i <= 8; i++) {
        const k = i / 8;
        limb.push(add(add(mul(grip, (1 - k) * (1 - k)), mul(ctl, 2 * k * (1 - k))), mul(t, k * k)));
      }
      out.push({ pts: limb, w: 1.1, color: HELD, bone: true });
    }
    // (the arrow is on the string, and the string in the fingers, from the moment the draw has begun in earnest)
    const strung = q.draw >= 0.2;
    out.push({ pts: strung ? [tipOf(1), s.handR, tipOf(-1)] : [tipOf(1), tipOf(-1)], w: 0.45, color: HELD_DIM });
    if (strung) out.push({ pts: [s.handR, add(s.handR, mul(p, 0.43 * B.tall))], w: 0.6, color: '#ffffff' });
  } else if (held === 'greatsword') {
    const guard = add(s.handR, mul(p, 1.3));
    out.push({ pts: [add(s.handR, mul(p, -GREAT_GRIP * 0.78)), guard], w: 1.0, color: HELD_DIM, bone: true });
    out.push({ pts: [guard, add(guard, mul(p, GREAT_BLADE))], w: 1.4, color: HELD, bone: true });
    // (the guard: a bar across the blade, and a stub the other way so that it is seen from every side)
    const wide = cross(ac, p);
    out.push({ pts: [add(guard, mul(ac, 3.6)), add(guard, mul(ac, -3.6))], w: 1.1, color: HELD, bone: true });
    out.push({ pts: [add(guard, mul(wide, 1.4)), add(guard, mul(wide, -1.4))], w: 1.0, color: HELD });
  }
  else if (held === 'staff') {
    const head = add(s.handR, mul(p, STAFF_UP));
    out.push({ pts: [add(s.handR, mul(p, -STAFF_DOWN)), head], w: 1.0, color: HELD_DIM, bone: true });
    // (the crystal at its head)
    out.push({ pts: [head], w: 0.7, color: HELD, egg: [mul(p, 2.6), mul(ac, 1.9), mul(cross(ac, p), 1.9)] });
  }
  // an arrow in the fingers (the ranger, sighting along one)
  if (held === 'bow' && q.prop === 2) {
    const a = (q.pAz * Math.PI) / 180;
    const e = (q.pEl * Math.PI) / 180;
    const d: V3 = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
    out.push({ pts: [add(s.handR, mul(d, -4)), add(s.handR, mul(d, 13))], w: 0.6, color: '#ffffff' });
  }
  return out;
}

const VIEWS: { view: View; label: string }[] = [
  { view: 'side', label: 'From the side' },
  { view: 'front', label: 'In the game, facing you' },
  { view: 'back', label: 'In the game, facing away' },
];

/** How much of the picture's plane a move takes up, in each view (so that every frame is drawn at one size and nothing is cut off). */
function extent(): Record<View, [number, number, number, number]> {
  const box: Record<View, [number, number, number, number]> = { side: [0, 0, 0, 0], front: [0, 0, 0, 0], back: [0, 0, 0, 0] };
  for (let i = 0; i <= 60; i++) {
    const q = poseAt((END * i) / 60);
    const st = strokesOf(solve(BODY, q), move.held, q);
    for (const { view } of VIEWS) {
      const b = box[view];
      const tt = (END * i) / 60;
      const up = move.arc && tt < move.arc.until ? Math.sin((tt / move.arc.until) * Math.PI) * move.arc.high : 0;
      for (const s of st) for (const p0 of s.pts) {
        const p: V3 = [p0[0], p0[1], p0[2] + up];
        const [x, y] = project(p, view);
        const r = s.egg ? Math.max(...s.egg.map((e) => Math.hypot(e[0], e[1], e[2]))) : 0;
        b[0] = Math.min(b[0], x - r);
        b[1] = Math.min(b[1], y - r);
        b[2] = Math.max(b[2], x + r);
        b[3] = Math.max(b[3], y + r);
      }
    }
  }
  return box;
}
const BOX = extent();

function mixc(a: string, b: string, k: number): string {
  const h = (c: string, i: number): number => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const one = (i: number): string => Math.round(h(a, i) + (h(b, i) - h(a, i)) * k).toString(16).padStart(2, '0');
  return '#' + one(0) + one(1) + one(2);
}

/** One view of the figure at one moment, in a pane of the canvas. (ox, oy) is where the figure's place on the floor is drawn. */
function paintView(g: CanvasRenderingContext2D, t: number, view: View, ox: number, oy: number, S: number, bg: string): void {
  const q = poseAt(t);
  const s = solve(BODY, q);
  const strokes = strokesOf(s, move.held, q);
  // (a leap: the game lifts the whole figure; the floor stays where it is)
  const lift = move.arc && t < move.arc.until ? Math.sin((t / move.arc.until) * Math.PI) * move.arc.high : 0;
  const onFloor = (p: V3): [number, number, number] => {
    const [x, y, d] = project(p, view);
    return [ox + x * S, oy + y * S, d];
  };
  const at = (p: V3): [number, number, number] => onFloor([p[0], p[1], p[2] + lift]);
  // the floor: a line from the side; along the grid in the game's views, with a mark for the way the figure faces
  g.strokeStyle = FLOOR;
  g.lineWidth = 2;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const floorLine = (a: V3, b: V3): void => {
    const [x0, y0] = onFloor(a);
    const [x1, y1] = onFloor(b);
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  };
  if (view === 'side') floorLine([-60, 0, 0], [60, 0, 0]);
  else {
    for (const k of [-24, -12, 0, 12, 24]) {
      floorLine([-30, k, 0], [30, k, 0]);
      floorLine([k, -30, 0], [k, 30, 0]);
    }
  }
  // (the way they face: an arrowhead on the floor ahead of them)
  g.strokeStyle = DIM;
  g.lineWidth = 2;
  for (const [a, b] of [[[34, 0, 0], [40, 0, 0]], [[40, 0, 0], [37, 2, 0]], [[40, 0, 0], [37, -2, 0]]] as [V3, V3][]) floorLine(a, b);

  if (lift > 0.5) {
    const [sx, sy] = onFloor([s.pelvis[0], s.pelvis[1], 0]);
    g.fillStyle = 'rgba(0, 0, 0, 0.28)';
    g.beginPath();
    g.ellipse(sx, sy, 9 * S, (view === 'side' ? 1.2 : 4.5) * S, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Where a blade has just been: the air it came through in the last frame, as a pale fan (only
  // when it is moving fast: a cut, not a guard that stirs).
  if (move.held === 'greatsword') {
    const ends = (when: number): [V3, V3] => {
      const sk = solve(BODY, poseAt(Math.max(0, when)));
      const guard = add(sk.handR, mul(sk.point, 1.3));
      return [guard, add(guard, mul(sk.point, GREAT_BLADE))];
    };
    const N = 6;
    const trail: [V3, V3][] = [];
    for (let i = 0; i <= N; i++) trail.push(ends(t - (FRAME * i) / N));
    const moved = Math.hypot(trail[0][1][0] - trail[N][1][0], trail[0][1][1] - trail[N][1][1], trail[0][1][2] - trail[N][1][2]);
    if (moved > 9) {
      g.beginPath();
      trail.forEach((e, i) => {
        const [x, y] = at(e[0]);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      for (let i = N; i >= 0; i--) {
        const [x, y] = at(trail[i][1]);
        g.lineTo(x, y);
      }
      g.closePath();
      g.fillStyle = 'rgba(63, 227, 234, 0.2)';
      g.fill();
    }
  }

  // far things first; and the further a thing is, the dimmer
  const drawn = strokes
    // (what is drawn on an egg's skin is seen only from the side it is on)
    .filter((st) => !st.on || project(st.on, view)[2] > 0.02)
    .map((st) => {
      const pts = st.pts.map(at);
      return { st, pts, depth: pts.reduce((a, p) => a + p[2], 0) / pts.length + (st.lift ?? 0) };
    });
  let near = -Infinity;
  let far = Infinity;
  for (const d of drawn) {
    near = Math.max(near, d.depth);
    far = Math.min(far, d.depth);
  }
  drawn.sort((a, b) => a.depth - b.depth);
  for (const { st, pts, depth } of drawn) {
    const k = near > far ? (depth - far) / (near - far) : 1;
    // (what is held is never dimmed: it is what the eye should find first)
    const color = st.color === HELD || st.color === HELD_DIM || st.color === '#ffffff' ? st.color : mixc(bg, st.color, 0.58 + 0.42 * k);
    if (st.egg) {
      // An egg looked at from anywhere is an oval: its three half-lengths, as the eye sees them,
      // add up (as squares) to the oval's own two.
      const e = st.egg.map((v) => project(v, view));
      const a = e.reduce((t, v) => t + v[0] * v[0], 0);
      const b = e.reduce((t, v) => t + v[0] * v[1], 0);
      const d = e.reduce((t, v) => t + v[1] * v[1], 0);
      const mean = (a + d) / 2;
      const spread = Math.hypot((a - d) / 2, b);
      const tilt = Math.atan2(2 * b, a - d) / 2;
      g.beginPath();
      g.ellipse(pts[0][0], pts[0][1], Math.sqrt(mean + spread) * S, Math.sqrt(Math.max(0.01, mean - spread)) * S, tilt, 0, Math.PI * 2);
      g.fillStyle = mixc(bg, st.color, 0.2 + 0.1 * k);
      g.fill();
      g.strokeStyle = color;
      g.lineWidth = Math.max(1.5, st.w * S);
      g.stroke();
      continue;
    }
    const path = (): void => {
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    };
    if (st.bone) {
      g.strokeStyle = bg;
      g.lineWidth = st.w * S + 5;
      path();
      g.stroke();
    }
    g.strokeStyle = color;
    g.lineWidth = Math.max(1.5, st.w * S);
    path();
    g.stroke();
    if (st.dots) {
      g.fillStyle = color;
      for (const pt of pts) {
        g.beginPath();
        g.arc(pt[0], pt[1], st.w * S * 0.78, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
}

// --- the layout: three panes side by side, a heading over them ---
const PAD = 10;
const HEAD = 46;
const LABEL = 30;
const MARGIN = 3.5;
const top = Math.min(BOX.side[1], BOX.front[1], BOX.back[1]) - MARGIN;
const bottom = Math.max(BOX.side[3], BOX.front[3], BOX.back[3]) + MARGIN;
/**
 * How many screen pixels to a picture pixel of the figure: 6, or fewer for a move that takes a
 * great deal of room (a leap, a blade swung overhead), so that the big pane is never taller than
 * a phone shows comfortably.
 */
const S = Number(scaleArg) || Math.min(6, 640 / (bottom - top));
const paneW = (v: View): number => Math.ceil((BOX[v][2] - BOX[v][0] + MARGIN * 2) * S);
const paneH = Math.ceil((bottom - top) * S) + LABEL;

/**
 * Where the three panes go: the view from the side big, across the top (it is the one a movement
 * is judged by), and the game's two views under it, side by side and smaller. The whole is about
 * as wide as it is tall or taller, which is what a phone held upright shows best.
 */
const SMALL = 0.62;
const S2 = S * SMALL;
const smallW = (v: View): number => Math.ceil((BOX[v][2] - BOX[v][0] + MARGIN * 2) * S2);
const smallH = Math.ceil((bottom - top) * S2) + LABEL;
const colW = Math.max(...VIEWS.map((v) => paneW(v.view)));
const SHEET_IN = Math.max(paneW('side'), smallW('front') + PAD + smallW('back'));
const spare = SHEET_IN - (smallW('front') + PAD + smallW('back'));
const PANES: { view: View; label: string; x: number; y: number; w: number; h: number; s: number; shift: number }[] = [
  { view: 'side', label: VIEWS[0].label, x: PAD, y: PAD + HEAD, w: SHEET_IN, h: paneH, s: S, shift: (SHEET_IN - paneW('side')) / 2 },
  { view: 'front', label: VIEWS[1].label, x: PAD, y: PAD + HEAD + paneH + PAD, w: smallW('front') + spare / 2, h: smallH, s: S2, shift: spare / 4 },
  { view: 'back', label: VIEWS[2].label, x: PAD + smallW('front') + spare / 2 + PAD, y: PAD + HEAD + paneH + PAD, w: smallW('back') + spare / 2, h: smallH, s: S2, shift: spare / 4 },
];
const SHEET_W = PAD * 2 + SHEET_IN;
const SHEET_H = PAD + HEAD + paneH + PAD + smallH + PAD;

function frame(g: CanvasRenderingContext2D, t: number, note: string): void {
  PANES.forEach(({ view, label, x, y, w: wide, h, s: scale, shift }, i) => {
    g.fillStyle = PANEL[i % 2];
    g.fillRect(x, y, wide, h);
    g.save();
    g.beginPath();
    g.rect(x, y, wide, h);
    g.clip();
    paintView(g, t, view, x + shift + (MARGIN - BOX[view][0]) * scale, y + LABEL + -top * scale, scale, PANEL[i % 2]);
    g.restore();
    g.fillStyle = DIM;
    g.font = '600 15px system-ui, sans-serif';
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillText(label, x + 10, y + LABEL / 2 + 2);
  });
  if (note) {
    g.fillStyle = INK;
    g.font = '700 15px system-ui, sans-serif';
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    g.fillText(note, SHEET_W - PAD - 6, PAD + HEAD / 2 + 2);
  }
}

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
const heading = (g: CanvasRenderingContext2D, text: string): void => {
  g.fillStyle = '#ffd866';
  g.font = '700 18px system-ui, sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillText(text, PAD + 4, PAD + HEAD / 2);
};
const w = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (k: number) => string };

if (mode === 'strip') {
  // the moments asked for, side by side; a row of the three views for each would be too wide, so each moment is a column of them
  const times = (arg || '0').split(',').map((v) => Number(v) * FRAME);
  cv.width = PAD + times.length * (colW + PAD);
  cv.height = PAD + VIEWS.length * (paneH + PAD);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  times.forEach((t, c) => {
    VIEWS.forEach(({ view }, r) => {
      const x = PAD + c * (colW + PAD);
      const y = PAD + r * (paneH + PAD);
      g.fillStyle = PANEL[(c + r) % 2];
      g.fillRect(x, y, colW, paneH);
      g.save();
      g.beginPath();
      g.rect(x, y, colW, paneH);
      g.clip();
      paintView(g, t, view, x + (MARGIN - BOX[view][0]) * S, y + LABEL - top * S, S, PANEL[(c + r) % 2]);
      g.restore();
      g.fillStyle = DIM;
      g.font = '600 14px system-ui, sans-serif';
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText(`frame ${Math.round(t / FRAME)}`, x + 8, y + 6);
    });
  });
} else {
  cv.width = SHEET_W;
  cv.height = SHEET_H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  // what the film shows, frame by frame: [the moment of the move, the note at the top right]
  const shots: [number, string][] = [];
  if (mode === 'still') shots.push([(Number(arg) || 0) * FRAME, '']);
  else if (move.motion.loop !== undefined) {
    const from = move.motion.loop;
    if (END - from < 1) {
      // a quick thing that goes round and round: once slowly, then as the game plays it
      const SLOW = 5;
      for (let i = 0; i < Math.round((END - from) / FRAME) * SLOW; i++) shots.push([from + (i * FRAME) / SLOW, `slowed ${SLOW} times`]);
      for (let lap = 0; lap < 5; lap++) for (let t = from; t < END - 1e-6; t += FRAME) shots.push([t, 'as the game plays it']);
    } else {
      // a stance: twice round, as it is
      for (let lap = 0; lap < 2; lap++) for (let t = from; t < END - 1e-6; t += FRAME) shots.push([t, '']);
    }
  } else {
    const SLOW = 5;
    const hit = move.motion.hit ?? -1;
    for (let i = 0; i < 14; i++) shots.push([0, `slowed ${SLOW} times`]);
    for (let i = 0; i <= Math.round(END / FRAME) * SLOW; i++) {
      const t = (i * FRAME) / SLOW;
      shots.push([t, `slowed ${SLOW} times`]);
      // (a pause on the moment the blow lands: the pose that matters most)
      if (hit >= 0 && Math.abs(t - hit) < 1e-6) for (let k = 0; k < 34; k++) shots.push([t, move.at ?? 'the moment it lands']);
    }
    for (let i = 0; i < 12; i++) shots.push([END, `slowed ${SLOW} times`]);
    for (let lap = 0; lap < 3; lap++) {
      for (let i = 0; i <= Math.round(END / FRAME); i++) shots.push([i * FRAME, 'as the game plays it']);
      for (let i = 0; i < 14; i++) shots.push([END, 'as the game plays it']);
    }
  }
  // (on a narrow sheet the heading is said shortly, so that it does not run into the note beside it)
  g.font = '700 18px system-ui, sans-serif';
  const long = move.name + (mode === 'still' ? '' : ', on the skeleton');
  const title = g.measureText(long).width + 190 < SHEET_W ? long : move.name;
  const show = (k: number): string => {
    const [t, note] = shots[Math.max(0, Math.min(shots.length - 1, k))];
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    heading(g, title);
    frame(g, t, note);
    return cv.toDataURL('image/png');
  };
  w.__frames = shots.length;
  w.__tickMs = 1000 * FRAME;
  w.__frame = show;
  show(0);
}
w.__ready = true;
