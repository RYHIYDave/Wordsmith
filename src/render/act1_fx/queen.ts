// ACT 1: THE CARRION QUEEN, FLOOR 7'S BOSS: what she does to the floor, drawn, and her fall off the edge
// (render/act1_fx/types.ts).
//
// What her own pictures do not paint, where her rules put it (game/act1_rules/queen.ts), in the enemy's pink and gold
// as the floors 2 to 5 bosses' warnings are: HER DIVE'S MARK ON HER LINE, the art chat's own call ("she is up out of
// sight above the eyrie's screen from about 0.4 s to 0.8 s ... so its warning has to be the game's mark on her
// line"): the line run out along the floor from her, its dots running the way she will come (the great shot's line
// of aim, art/mob_shots.ts), and a ring where her talons will strike (the sweep's, art/boss_shots.ts), from when she
// leaves the rock till she strikes; and HER GUST'S fan before her, its two edges run out along the floor, while she
// rears with her wings drawn back. Her blast and her call's rings of fire are her pictures' own.
//
// HER DEATH, OFF THE EDGE (the art chat's post of 16 Oct, 11:32: "Draw the eyrie's near rock over what of her has
// gone below the edge (the films do it with a stand-in edge 1.7 tiles behind where she stood)"): her death's frames,
// the art's (art/act1_figs/queen.ts, `fall`), played where she went over, the way round with the drop at her back
// (game/act1_rules/queen.ts, `died`). From in front she falls away from the eye: from the moment she goes over, what
// of her is on this side of the films' edge, and has the ground under it, rock as the ground is drawn (render/
// outdoor.ts), is under the near rock, and is left out of her picture, so the rock drawn under her shows; where the
// ground there is the drop she is seen against the sky. From behind she falls toward the eye, past the near edge,
// and nothing hides her (as the films).

import { Q2_FALL, nearRockFrom } from '../../art/act1_figs/queen';
import { drawSweepRing } from '../../art/boss_shots';
import { drawAimLine } from '../../art/mob_shots';
import { Px, flipSprite } from '../../engine/px';
import { isPainted, leftToPainter } from '../left_to_painter';
import type { Sprite } from '../../engine/px';
import { HOME_AT, QN, viewIndex, BURST_PERIL, ECLIPSE_PERIL, VDIVE_PERIL, eclipsePools } from '../../game/act1_rules/queen';
import { QA_DIVE, QA_ECLIPSE, QUEEN_ACTION } from '../../art/carrion_queen_action';
import { paintDiveBurst, paintDiveMarks, paintGustMarks, paintPoolRims, paintRakeMarks, paintVultureLine } from '../../art/carrion_queen_action_fx';
import { drawSprite } from '../../engine/px';
import { livePicture, picAt } from './live';
import type { Act1FxCtx } from './types';
import { actDef } from '../../game/bosses';
import { flipped } from '../../game/facing';
import type { Peril } from '../../game/state';
import { SHOWN } from '../outdoor';
import type { Act1Fx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * LAY THE EYRIE'S ROCK OVER WHAT OF HER HAS GONE BELOW ITS EDGE, in one frame of her fall from in front: each pixel of
 * her on this side of the films' edge (nearRockFrom) with rock under it as the ground shows it (`rock`: at so many game
 * pixels from her floor point on the screen) is left out. `d`: the frame's pixels, RGBA, `w` by `h` picture pixels, her
 * floor point at (`ax`, `ay`) in them, as painted (from in front, not turned over); `flip`: it is drawn turned over.
 */
export function underRock(d: Uint8ClampedArray, w: number, h: number, ax: number, ay: number, flip: boolean, rock: (gx: number, gy: number) => boolean): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4 + 3;
      if (!d[i]) continue;
      const dx = x + 0.5 - ax;
      const dy = y + 0.5 - ay;
      if (!nearRockFrom(dx, dy)) continue;
      if (rock(Math.floor((flip ? -dx : dx) / 2), Math.floor(dy / 2))) d[i] = 0;
    }
  }
}

/** A frame of her fall with the rock laid over her (a copy: the art's frame is not touched). */
function buried(s: Sprite, flip: boolean, rock: (gx: number, gy: number) => boolean): Sprite {
  const k = s.density ?? 1;
  const img = s.img as unknown;
  let out: unknown;
  if (img instanceof Px) {
    // (where there is no canvas: the checks)
    const p = new Px(img.w, img.h);
    p.d.set(img.d);
    underRock(p.d, p.w, p.h, s.ax * k, s.ay * k, flip, rock);
    out = p;
  } else {
    const src = img as HTMLCanvasElement;
    const cv = document.createElement('canvas');
    cv.width = src.width;
    cv.height = src.height;
    const g = cv.getContext('2d') as CanvasRenderingContext2D;
    g.drawImage(src, 0, 0);
    const data = g.getImageData(0, 0, cv.width, cv.height);
    underRock(data.data, cv.width, cv.height, s.ax * k, s.ay * k, flip, rock);
    g.putImageData(data, 0, 0);
    out = cv;
  }
  return { ...s, img: out as HTMLCanvasElement };
}

/** Her fall's frames as drawn (by the art's frame each is made from), each made the first time it is shown; and what the ground shows round where she went over, asked once a game pixel. */
const falls = new WeakMap<Peril, { frames: Map<Sprite, Sprite>; rock: (gx: number, gy: number) => boolean }>();

// HER MOVES DONE THE ACTION WAY (QUEEN_ACTION: art/carrion_queen_action_fx.ts, his yes, 2 Nov 2026): while she acts, what she will
// strike marked on the rock (paintRakeMarks, paintGustMarks, paintDiveMarks); where her dive struck, the crater and its cracks and the
// rock bursting (paintDiveMarks after its hit, paintDiveBurst: its back half on the floor, its front half over the figures, the
// floor's own, 'queen:burst'); in her Eclipse, the pools' rims ('queen:eclipse'; the dark itself is the renderer's, render.ts light)
// and each dive of her flock, its line marked and the rock scored (paintVultureLine, 'queen:vdive'), a frame at a time.
const ROOM = { w: 2 * 360 + 24, h: 2 * 180 + 24 + 220, ax: 372, ay: 192 + 220 };
const POOL = { w: 2 * 110 + 24, h: 2 * 56 + 24, ax: 122, ay: 68 };
function marked(c: Act1FxCtx, key: string, x: number, y: number, t: number, paint: (px: Px, at: ReturnType<typeof picAt>) => void, R = ROOM): void {
  if (!c.g) return;
  const at = picAt(R.ax, R.ay);
  const s = livePicture(key, R.w, R.h, R.ax, R.ay, `${Math.floor(t * 30)}`, (px) => paint(px, at));
  if (!s) return;
  const [sx, sy] = c.at(x, y);
  drawSprite(c.g, s, sx, sy);
}
const ACTION_FX: Act1Fx = {
  ground(c, m, p) {
    if (m) {
      if (m.state !== 'act' || !m.act) return;
      const T = m.act.t;
      const aim = Math.atan2(m.fy, m.fx);
      const id = m.act.id;
      const paint = id === 'queen:rake' ? paintRakeMarks : id === 'queen:gust' ? paintGustMarks : id === 'queen:dive' || (id === 'queen:home' && T >= (QA_DIVE.up[0] + QA_DIVE.up[1]) / 2) ? paintDiveMarks : null;
      if (paint && T < QA_DIVE.hit + 0.05) marked(c, `queen:${m.id}`, m.x, m.y, T, (px, at) => paint(px, at, [0, 0], aim, T));
      return;
    }
    if (!p) return;
    if (p.a1 === BURST_PERIL) {
      const T = QA_DIVE.hit + p.t;
      marked(c, `queen:burst:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, p.x, p.y, T, (px, at) => {
        paintDiveMarks(px, at, [0, 0], p.b, T);
        paintDiveBurst(px, at, [0, 0], p.b, p.t, 'back');
      });
    } else if (p.a1 === ECLIPSE_PERIL) {
      // (each pool's rim on a picture of its own, where it is)
      eclipsePools(p).forEach((q, i) => marked(c, `queen:pool:${i}`, q.x, q.y, p.t, (px, at) => paintPoolRims(px, at, [{ ...q, x: 0, y: 0 }], p.t), POOL));
    } else if (p.a1 === VDIVE_PERIL) {
      const k = Math.min(1, (p.t + QA_ECLIPSE.warn) / QA_ECLIPSE.warn);
      marked(c, `queen:vdive:${p.b.toFixed(3)}:${p.c.toFixed(3)}`, p.x, p.y, p.t, (px, at) => paintVultureLine(px, at, [p.b - p.x, p.c - p.y], [0, 0], k, p.t >= 0 ? p.t : -1));
    }
  },
  air(c, m, p) {
    if (m || !p || !c.g) return;
    if (p.a1 === VDIVE_PERIL && p.t > -0.12 && p.t < 0.3) {
      // (one of her flock, down its line out of the dark, and pulled out up into it)
      const set = c.bestiary.of('vulture').front;
      const frames = set.clips?.attack?.frames ?? set.attack;
      if (!frames || !frames.length) return;
      const u = p.t < 0 ? (p.t + 0.12) / 0.12 : 1;
      const up = p.t < 0 ? (1 - u) * 70 : (p.t / 0.3) * 80;
      const x = p.b + (p.x - p.b) * u;
      const y = p.c + (p.y - p.c) * u;
      const [sx, sy] = c.at(x, y);
      const sp = frames[Math.min(frames.length - 1, Math.floor(frames.length * 0.6))];
      drawSprite(c.g, p.x < p.b ? flipSprite(sp) : sp, sx, sy - up);
      return;
    }
    if (p.a1 !== BURST_PERIL) return;
    const at = picAt(ROOM.ax, ROOM.ay);
    const s = livePicture(`queen:burstfront:${p.x.toFixed(3)}:${p.y.toFixed(3)}`, ROOM.w, ROOM.h, ROOM.ax, ROOM.ay, `${Math.floor(p.t * 30)}`, (px) => paintDiveBurst(px, at, [0, 0], p.b, p.t, 'front'));
    if (!s) return;
    const [sx, sy] = c.at(p.x, p.y);
    drawSprite(c.g, s, sx, sy);
  },
};

const OLD_FX: Act1Fx = {
  standing(c, m, p) {
    // HER FALL OFF THE EDGE, where she went over
    if (m || !p || p.a1 !== 'queen:fall') return;
    const v = viewIndex(p.fx, p.fy);
    const back = v >= 2;
    const flip = flipped(p.fx, p.fy);
    const art = c.bestiary.of('queen');
    const clip = (back ? art.back : art.front).clips?.moves?.fall;
    if (!clip || !clip.frames.length) return;
    const i = Math.min(clip.frames.length - 1, Math.floor(p.t * clip.fps + 1e-6));
    let made = falls.get(p);
    if (!made) {
      // (the rock as the ground is drawn: what is not the drop; where there is no ground to ask, all this side of the films' edge, as the films)
      const T = SHOWN.terrain;
      const seen = new Map<number, boolean>();
      const rock = (gx: number, gy: number): boolean => {
        if (!T) return true;
        const key = (gx + 4096) * 8192 + (gy + 4096);
        let r = seen.get(key);
        if (r === undefined) seen.set(key, (r = !T.drop(p.x + (gx / 16 + gy / 8) / 2, p.y + (gy / 8 - gx / 16) / 2)));
        return r;
      };
      falls.set(p, (made = { frames: new Map<Sprite, Sprite>(), rock }));
    }
    // (a frame of her fall the painter has not handed over yet: the nearest of it that is, never painted here as it is shown;
    // her fall is her death, painted first as she nears her end: render/left_to_painter.ts deathOf)
    const frames = clip.frames;
    const s = leftToPainter(!isPainted(frames, i) && !!c.paints?.('queen'), () => frames[i]);
    let sp = made.frames.get(s);
    if (!sp) {
      sp = back || p.t < Q2_FALL.over ? s : buried(s, flip, made.rock);
      made.frames.set(s, sp);
    }
    const [sx, sy] = c.at(p.x, p.y);
    c.stand(p.x + p.y, flip ? flipSprite(sp) : sp, sx, sy);
  },

  ground(c, m) {
    const g = c.g;
    if (!g || !m || m.state !== 'act' || !m.act) return;
    const a = actDef(m);
    if (!a) return;
    const T = m.act.t;
    // (her dive home, QUEEN_ROAM: its line marked once she is set down over her perch, up out of sight)
    if (a.id === 'queen:dive' || (a.id === 'queen:home' && T >= HOME_AT)) {
      const D = QN.dive;
      if (T < D.launch || T >= a.hit) return;
      const k = clamp01((T - D.launch) / (D.stoop - D.launch));
      const sx = m.x + m.fx * 0.6;
      const sy = m.y + m.fy * 0.6;
      const ex = m.x + m.fx * (D.at + D.r * 0.6);
      const ey = m.y + m.fy * (D.at + D.r * 0.6);
      drawAimLine(g, c.at, sx, sy, ex, ey, k, c.t);
      drawSweepRing(g, c.at, m.x + m.fx * D.at, m.y + m.fy * D.at, D.r, k, c.t);
    } else if (a.id === 'queen:gust') {
      const G = QN.gust;
      if (T < G.warnFrom || T >= a.hit) return;
      const k = clamp01((T - G.warnFrom) / (a.hit - G.warnFrom - 0.05));
      // (its fan's two edges, out from her as far as it drives)
      for (const side of [-1, 1]) {
        const w = G.wide + G.spread * G.far;
        const ex = m.x + m.fx * G.far + m.fy * side * w;
        const ey = m.y + m.fy * G.far - m.fx * side * w;
        const sx = m.x + m.fx * 0.4 + m.fy * side * G.wide;
        const sy = m.y + m.fy * 0.4 - m.fx * side * G.wide;
        drawAimLine(g, c.at, sx, sy, ex, ey, k, c.t);
      }
    }
  },
};

export const FX: Act1Fx | null = {
  standing: (c, m, p) => OLD_FX.standing!(c, m, p),
  ground: (c, m, p) => (QUEEN_ACTION.on ? ACTION_FX : OLD_FX).ground!(c, m, p),
  air: (c, m, p) => {
    if (QUEEN_ACTION.on) ACTION_FX.air!(c, m, p);
  },
};
