// A sheet of every frame of one figure's art, so that it can be checked by eye. For the monsters
// (and for anything else built with the painter's kit, art/kit.ts).
//
// A figure gets a three-line entry of its own, for instance src/dev/preview_m_bat.ts:
//     import { makeBatArt } from '../art/monster_bat';
//     import { showActor } from './actor_sheet';
//     showActor('bat', makeBatArt());
// (a figure painted on a canvas of its own, bigger than the kit's, gives that canvas as a third
// argument: see art/mkit.ts, Canvas)
// and is rendered with
//     node tools/preview.mjs src/dev/preview_m_bat.ts shots/art/bat.png 1900 1500 "all"
//   hash = <what>[:<scale>[:<per row>[:<every>[:canvas]]]]
//     what    = all (default: the line-up, then every animation) | lineup | front | back | idle |
//               walk | attack | heavy | <view>-<anim>, e.g. front-attack
//     scale   = screen pixels per picture pixel (default 2 for all, 4 otherwise; in `all` the
//               line-up is one more)
//     per row = cells in a row (default 8)
//     every   = show one frame in so many (default 1: every frame)
//     canvas  = the word "canvas": every cell shows the whole of the kit's canvas. Without it a
//               row's cells are cut down to the box that holds that row's frames, so that the
//               figure can be shown large.
// The picture saved is of the whole sheet, however big (the width and height given to
// tools/preview.mjs do not matter). The tool says how big it came out.
//
// Each cell shows the frame where the game would put it (by its anchor: the faint cross is the
// floor point under the figure), on the colour of the style's world and on the colour of the
// dungeon floor in turn, with the frame's own lights and its pool of light added.
//
// THE LINE-UP is the row to judge a figure by: the knight (a hero, for size and for style), then
// the figure standing facing the camera and facing away, then its attack wound up and at the
// blow for each facing, all at the same scale on the dungeon's floor.
//
// A RED FRAME round a cell means the figure touches the edge of the kit's canvas in that frame:
// it has probably been cut off there. The tool says so too.

import type { ActorArt, AnimSet } from '../art/actor_types';
import { makeWarriorArt } from '../art/hero_warrior';
import { GRAIN, KAX, KAY, KH, KW } from '../art/kit';
import type { Light, Sprite } from '../engine/px';

function tint(hex: string, a: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** A box in picture pixels, measured from the anchor (the floor point under the figure). */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * `canvas`: the figure's own canvas, for one painted on a bigger one than the kit's (art/mkit.ts,
 * Canvas): the sheet then checks its frames against that canvas's edges.
 */
export function showActor(who: string, art: ActorArt, canvas: { w: number; h: number; ax: number; ay: number } = { w: KW, h: KH, ax: KAX, ay: KAY }): void {
  const [what = 'all', scaleArg = '', rowArg = '', everyArg = '', boxArg = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
  const want = what === '' ? 'all' : what;
  const S = Number(scaleArg) || (want === 'all' ? 2 : 4);
  const perRow = Number(rowArg) || 8;
  const every = Math.max(1, Number(everyArg) || 1);
  const whole = boxArg === 'canvas';

  const GAP = 6;
  /** Room left round the figure in a cell that is cut down to it, in picture pixels. */
  const PAD = 8;

  interface Row {
    label: string;
    frames: Sprite[];
    step: number;
    /** Screen pixels per picture pixel for this row. */
    s: number;
    /** A caption under each cell, if any. */
    notes?: string[];
    /** Every cell on the dungeon floor's colour (the line-up). */
    floor?: boolean;
  }
  const rows: Row[] = [];
  const views: [string, AnimSet][] = [['front', art.front], ['back', art.back]];
  const knight = makeWarriorArt({ twoHanded: false }).front.idle[0];

  if (want === 'all' || want === 'lineup') {
    const frames: Sprite[] = [knight, art.front.idle[0], art.back.idle[0]];
    const notes = ['the knight (a hero)', `${who}, facing the camera`, `${who}, facing away`];
    for (const [vn, set] of views) {
      for (const an of ['attack', 'heavy'] as const) {
        const c = set.clips?.[an];
        if (!c) continue;
        const hit = c.hit ?? 0;
        const at = (sec: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(sec * c.fps)))];
        frames.push(at(hit * 0.7), at(hit + 0.034));
        notes.push(`${vn} ${an}: wound up`, `${vn} ${an}: the blow`);
      }
    }
    rows.push({ label: `${who}: the line-up`, frames, step: 1, s: S + (want === 'all' ? 1 : 0), notes, floor: true });
  }
  if (want !== 'lineup') {
    for (const [vn, set] of views) {
      const lists: [string, Sprite[] | undefined, number][] = [
        ['idle', set.idle, 1],
        ['walk', set.walk, 1],
        ['attack', set.clips?.attack?.frames ?? set.attack, every],
        ['heavy', set.clips?.heavy?.frames ?? set.heavy, every],
      ];
      for (const [an, frames, step] of lists) {
        const key = `${vn}-${an}`;
        if (want !== 'all' && want !== vn && want !== an && want !== key) continue;
        if (!frames) continue;
        const c = an === 'attack' ? set.clips?.attack : an === 'heavy' ? set.clips?.heavy : undefined;
        const timing = c ? `, ${c.fps} a second, the blow at ${(c.hit ?? 0).toFixed(2)} s = frame ${Math.round((c.hit ?? 0) * c.fps)}` : an === 'idle' ? `, ${set.idleFps ?? 2} a second` : an === 'walk' ? `, ${set.walkFps ?? 8} a second` : '';
        rows.push({ label: `${who} ${vn} ${an} (${frames.length} frames${timing}${step > 1 ? `, every ${step} shown` : ''})`, frames: Array.from(frames).filter((_, i) => i % step === 0), step, s: S });
      }
    }
  }

  /** What a frame covers, from its anchor, in picture pixels. (A frame is cut down to what is painted.) */
  const reach = (sp: Sprite): Box => ({ x: -sp.ax * GRAIN, y: -sp.ay * GRAIN, w: sp.w * GRAIN, h: sp.h * GRAIN });
  /** The box every cell of a row shows: the whole canvas, or what holds all of the row's frames. */
  const boxOf = (r: Row): Box => {
    if (whole) return { x: -canvas.ax, y: -canvas.ay, w: canvas.w, h: canvas.h };
    let x0 = -4;
    let y0 = -4;
    let x1 = 4;
    let y1 = 4;
    for (const sp of r.frames) {
      const b = reach(sp);
      x0 = Math.min(x0, b.x);
      y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.w);
      y1 = Math.max(y1, b.y + b.h);
    }
    return { x: x0 - PAD, y: y0 - PAD, w: x1 - x0 + PAD * 2, h: y1 - y0 + PAD * 2 };
  };
  const boxes = rows.map(boxOf);

  let H = GAP;
  let W = 0;
  rows.forEach((r, k) => {
    const n = Math.min(perRow, r.frames.length);
    W = Math.max(W, n * (boxes[k].w * r.s + GAP) + GAP);
    H += 22 + Math.ceil(r.frames.length / perRow) * (boxes[k].h * r.s + GAP + (r.notes ? 16 : 0));
  });

  const cv = document.createElement('canvas');
  cv.width = Math.max(W, 600);
  cv.height = H;
  cv.style.position = 'static';
  cv.style.display = 'block';
  // (the game's page is one screen high and does not scroll: a sheet is as big as it needs to be,
  // and the picture taken of it is of the whole page)
  for (const el of [document.documentElement, document.body]) {
    el.style.height = 'auto';
    el.style.overflow = 'visible';
  }
  document.body.style.margin = '0';
  document.body.style.width = `${cv.width}px`;
  document.body.style.background = '#16131c';
  document.body.appendChild(cv);
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#16131c';
  g.fillRect(0, 0, cv.width, cv.height);

  const glow = (l: Light, left: number, top: number, k: number): void => {
    const lx = left + l.x * k;
    const ly = top + l.y * k;
    const rr = l.r * k;
    const grd = g.createRadialGradient(lx, ly, 0, lx, ly, rr);
    grd.addColorStop(0, tint(l.color, l.a ?? 0.5));
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(lx - rr, ly - rr, rr * 2, rr * 2);
  };

  let y = GAP;
  let worst = '';
  rows.forEach((r, k) => {
    const s = r.s;
    const box = boxes[k];
    const CW = box.w * s;
    const CH = box.h * s;
    g.fillStyle = '#ffd866';
    g.font = 'bold 15px system-ui, sans-serif';
    g.textBaseline = 'top';
    g.fillText(r.label, GAP, y + 2);
    y += 22;
    const lineH = CH + GAP + (r.notes ? 16 : 0);
    r.frames.forEach((sp, i) => {
      const col = i % perRow;
      const line = Math.floor(i / perRow);
      const x0 = GAP + col * (CW + GAP);
      const y0 = y + line * lineH;
      // the dungeon's floor, or the style's own world and the floor, cell about
      g.fillStyle = r.floor || i % 2 === 1 ? '#2e2a36' : '#0b0a1e';
      g.fillRect(x0, y0, CW, CH);
      const ax = x0 - box.x * s;
      const ay = y0 - box.y * s;
      g.fillStyle = 'rgba(255,255,255,0.10)';
      g.fillRect(x0, ay, CW, 1);
      g.fillRect(ax, y0, 1, CH);
      g.save();
      g.beginPath();
      g.rect(x0, y0, CW, CH);
      g.clip();
      // (a frame is cut down to what is painted: it is laid down by its anchor, as the game does)
      const f = GRAIN * s;
      const left = ax - sp.ax * f;
      const top = ay - sp.ay * f;
      g.globalCompositeOperation = 'lighter';
      if (sp.aura) glow(sp.aura, left, top, f);
      g.globalCompositeOperation = 'source-over';
      g.drawImage(sp.img, left, top, sp.w * f, sp.h * f);
      g.globalCompositeOperation = 'lighter';
      for (const l of sp.lights ?? []) glow(l, left, top, f);
      g.globalCompositeOperation = 'source-over';
      g.restore();
      // a frame that touches the edge of the kit's canvas has probably been cut off by it
      const b = reach(sp);
      if (b.x <= -canvas.ax || b.y <= -canvas.ay || b.x + b.w >= canvas.w - canvas.ax || b.y + b.h >= canvas.h - canvas.ay) {
        g.strokeStyle = '#ff4060';
        g.lineWidth = 3;
        g.strokeRect(x0 + 1.5, y0 + 1.5, CW - 3, CH - 3);
        if (!worst) worst = `${r.label}, frame ${i * r.step}`;
      }
      g.fillStyle = '#8a84a0';
      g.font = '12px system-ui, sans-serif';
      g.fillText(String(i * r.step), x0 + 4, y0 + 3);
      if (r.notes) {
        g.fillStyle = '#c8c0e0';
        g.fillText(r.notes[i] ?? '', x0 + 2, y0 + CH + 2);
      }
    });
    y += Math.ceil(r.frames.length / perRow) * lineH;
  });
  // (said in the tool's output: a red frame round a cell means the figure reaches the edge of the canvas there)
  if (worst) console.warn(`${who}: THE FIGURE REACHES THE EDGE OF THE ${canvas.w}x${canvas.h} CANVAS (red frame). First seen: ${worst}`);
  // how big it is: the box that holds the figure standing, in picture pixels
  const st = art.front.idle[0];
  console.log(`${who}: standing, it is ${st.w * GRAIN} wide and ${st.h * GRAIN} tall in picture pixels (the knight is ${knight.w * GRAIN} wide and ${knight.h * GRAIN} tall); frames: idle ${art.front.idle.length}, walk ${art.front.walk.length}, attack ${art.front.clips?.attack?.frames.length ?? art.front.attack.length}${art.front.clips?.heavy ? `, heavy ${art.front.clips.heavy.frames.length}` : ''}`);
  console.log(`the sheet is ${cv.width} x ${cv.height}${Math.max(cv.width, cv.height) > 2000 ? ': MORE THAN 2000 ON A SIDE, so it will be shown to you reduced. For a close look ask for less at a time (one animation, fewer cells in a row, or one frame in two)' : ''}`);
  (window as unknown as { __ready: boolean }).__ready = true;
}
