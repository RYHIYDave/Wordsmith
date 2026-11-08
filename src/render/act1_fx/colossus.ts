// THE SWAMP COLOSSUS'S FIGHT DRAWN, STAND-INS (game/colossus_fight.ts, COLOSSUS on): until the art chat's pictures of him and his
// tentacles are baked, plain shapes show where everything is and when: him (a dark mound with his eye) at his place or at an end,
// his tentacles at their roots and lying along their lines, each slam's line laid on the stone (the game's warning: the enemy's
// pink, flaring to its gold), the water slams' warnings, the waves rolling across, the crash and its surge, the shovel's hooks
// scraping along the stone, his snap's reach as he twitches, the siege's bolts' circles. All drawn from one peril of his kind
// that keeps by the hero ('eye:fight'), so that it is drawn wherever he is. Nothing cyan (the friend's).

import { colossusOf, colossusOn } from '../../game/act1_rules/colossus';
import {
  ARM, CRASH, HERO_R, HIS_PLACE, HOOK, RAIN, SHOVEL, SLAM, SMASH, SNAP, STONE, WAVE,
  hookFront, rootAt, stoneToWorld, waveFront,
} from '../../game/colossus_fight';
import type { Act1Fx, Act1FxCtx } from './types';

const PINK = '#ff3d8b';
const GOLD = '#ffc23d';
const FLESH = '#2e3a2b';
const FLESH_LIT = '#4b5a3e';
const WATER = 'rgba(16, 30, 26, 0.85)';
const FOAM = 'rgba(214, 226, 214, 0.85)';

function draw(c: Act1FxCtx): void {
  const g = c.g;
  const S = c.game.level.land?.stone;
  const boss = colossusOf(c.game);
  const f = boss ? colossusOn(boss).fight : undefined;
  if (!g || !S || !f) return;
  const P = (u: number, v: number): readonly [number, number] => {
    const w = stoneToWorld(S, u, v);
    return c.at(w.x, w.y);
  };
  const poly = (pts: readonly (readonly [number, number])[], fill: string | null, stroke: string | null = null, dash: number[] = [], lw = 1): void => {
    g.beginPath();
    pts.forEach(([u, v], i) => {
      const [x, y] = P(u, v);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.closePath();
    if (fill) {
      g.fillStyle = fill;
      g.fill();
    }
    if (stroke) {
      g.setLineDash(dash);
      g.lineDashOffset = -c.t * 12;
      g.strokeStyle = stroke;
      g.lineWidth = lw;
      g.stroke();
      g.setLineDash([]);
    }
  };
  const disc = (u: number, v: number, r: number, fill: string | null, stroke: string | null = null, dash: number[] = []): void => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 28; i++) pts.push([u + Math.cos((i / 28) * Math.PI * 2) * r, v + Math.sin((i / 28) * Math.PI * 2) * r]);
    poly(pts, fill, stroke, dash);
  };
  const strip = (a: { u: number; v: number }, b: { u: number; v: number }, half: number): [number, number][] => {
    const l = Math.hypot(b.u - a.u, b.v - a.v) || 1;
    const nu = (-(b.v - a.v) / l) * half;
    const nv = ((b.u - a.u) / l) * half;
    return [[a.u + nu, a.v + nv], [b.u + nu, b.v + nv], [b.u - nu, b.v - nv], [a.u - nu, a.v - nv]];
  };
  const warnColor = (k: number): string => (k > 0.75 ? GOLD : PINK);

  // HIM: under the water in phase 1 (his eye's fire seen through it), risen from his entrance on; at an end in his shovel
  const sh = f.shovel;
  const risen = !(f.ph === 1 && (f.mode === 'fight' || f.mode === 'between' || f.mode === 'idle'));
  const himAt = (u: number, v: number, up: number): void => {
    const [x, y] = P(u, v);
    g.fillStyle = FLESH;
    g.beginPath();
    g.moveTo(x - 110, y + 6);
    g.lineTo(x - 140, y - 128 * up);
    g.lineTo(x - 30, y - 10 * up);
    g.lineTo(x + 30, y - 10 * up);
    g.lineTo(x + 136, y - 146 * up);
    g.lineTo(x + 110, y + 6);
    g.closePath();
    g.fill();
    g.fillStyle = FLESH_LIT;
    g.fillRect(x - 8, y - 150 * up, 16, 140 * up);
    g.fillStyle = PINK;
    g.beginPath();
    g.ellipse(x, y - 160 * up, 32, 12, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = GOLD;
    g.beginPath();
    g.ellipse(x, y - 160 * up, 8, 10, 0, 0, Math.PI * 2);
    g.fill();
  };
  if (sh) {
    const endU = sh.end === 'l' ? -SHOVEL.out : STONE.w + SHOVEL.out;
    if (sh.t >= SHOVEL.tell[0] && sh.t < SHOVEL.tell[1]) {
      // the tell: the water boiling off that end
      for (let i = 0; i < 6; i++) disc(endU + Math.sin(c.t * 7 + i) * 2, STONE.d / 2 + Math.cos(c.t * 5 + i * 2) * 4, 0.4 + 0.3 * Math.abs(Math.sin(c.t * 9 + i)), null, FOAM);
    }
    if (sh.t >= SHOVEL.burst && sh.t < SHOVEL.back + 0.47) himAt(endU, STONE.d / 2, 0.8);
    if (sh.t < fr(21)) himAt(HIS_PLACE.u, HIS_PLACE.v, 1 - sh.t / fr(21));
    if (sh.t >= SHOVEL.armsUp) himAt(HIS_PLACE.u, HIS_PLACE.v, Math.min(1, (sh.t - SHOVEL.armsUp) / 1));
    // his snap's reach as he twitches and shuts
    if (sh.snap !== null) {
      const u0 = sh.end === 'l' ? 0 : STONE.w - SNAP.deep;
      poly([[u0, SNAP.across[0]], [u0 + SNAP.deep, SNAP.across[0]], [u0 + SNAP.deep, SNAP.across[1]], [u0, SNAP.across[1]]], sh.snapped ? 'rgba(255,194,61,0.45)' : 'rgba(255,61,139,0.25)', sh.snapped ? GOLD : PINK, [4, 3]);
    }
    // the hooks scraping toward his maw
    SHOVEL.hooks.forEach((hk) => {
      const front = hookFront(sh.end, sh.t - hk.at);
      if (front === null) return;
      const back = sh.end === 'l' ? front + HOOK.thick : front - HOOK.thick;
      const v0 = hk.edge === 'back' ? -0.6 : STONE.d - HOOK.reach.near;
      const v1 = hk.edge === 'back' ? HOOK.reach.back : STONE.d + 0.6;
      poly([[front, v0], [back, v0], [back, v1], [front, v1]], FLESH, PINK, [], 1);
    });
  } else if (risen) himAt(HIS_PLACE.u, HIS_PLACE.v, f.mode === 'change' ? Math.min(1, f.phT / 3) : 1);
  else {
    const [x, y] = P(HIS_PLACE.u, HIS_PLACE.v + 3);
    g.fillStyle = `rgba(255, 61, 139, ${0.25 + 0.15 * Math.sin(c.t * 2)})`;
    g.beginPath();
    g.ellipse(x, y, 26, 9, 0, 0, Math.PI * 2);
    g.fill();
  }

  // HIS TENTACLES
  for (const a of f.arms) {
    if (a.state === 'dead' || a.state === 'under') continue;
    const r = rootAt(a.u);
    const [x, y] = P(r.u, r.v);
    const fade = a.state === 'dying' ? Math.max(0, 1 - a.t / ARM.death) : a.state === 'rise' ? Math.min(1, a.t / ARM.burst) : 1;
    g.globalAlpha = fade;
    // its slam's line, laid as it rears, and it lying along it after
    if (a.state === 'slam' && a.line) {
      if (a.t < SLAM.hit) poly(strip(a.line.a, a.line.b, SLAM.width / 2), 'rgba(30, 6, 24, 0.35)', warnColor(a.t / SLAM.hit), [5, 3], 1);
      else if (a.t < SLAM.lying[1]) poly(strip(r, a.line.b, SLAM.width / 2 * 0.8), FLESH, FLESH_LIT);
    }
    if (a.state === 'smash' && a.t < SMASH.hit) poly([[0, 0], [STONE.w, 0], [STONE.w, STONE.d], [0, STONE.d]], 'rgba(30, 6, 24, 0.18)', warnColor(a.t / SMASH.hit), [6, 4], 1);
    const up = a.state === 'slam' && a.t < SLAM.hit ? 1.3 : a.state === 'dying' ? 0.6 : 1;
    g.fillStyle = FLESH;
    g.fillRect(x - 9, y - 70 * up, 18, 70 * up);
    g.fillStyle = FLESH_LIT;
    g.fillRect(x - 9, y - 70 * up, 5, 70 * up);
    g.globalAlpha = 1;
  }

  // THE WAVES: a wall of black water across the whole depth, its face foaming
  for (const w of f.waves) {
    const back: [number, number][] = [];
    const face: [number, number][] = [];
    for (let v = -0.3; v <= STONE.d + 0.5; v += 0.5) {
      let fr0 = waveFront(w.from, w.t, v);
      if (w.meets) fr0 = w.from === 'l' ? Math.min(fr0, STONE.w / 2) : Math.max(fr0, STONE.w / 2);
      const d = w.from === 'l' ? -1 : 1;
      face.push([fr0, v]);
      back.push([fr0 + d * WAVE.face, v]);
    }
    poly([...face, ...back.reverse()], WATER, FOAM);
  }
  // THE CRASH: the plume where they meet, and its surge over the stone
  if (f.crash) {
    const k = f.crash.t;
    if (k < 0.6) disc(STONE.w / 2, CRASH.v, CRASH.r * Math.min(1, k / 0.15), 'rgba(214, 226, 214, 0.55)', FOAM);
    if (k >= CRASH.surge[0]) poly([[STONE.w / 2 - CRASH.half, 0], [STONE.w / 2 + CRASH.half, 0], [STONE.w / 2 + CRASH.half, STONE.d], [STONE.w / 2 - CRASH.half, STONE.d]], `rgba(40, 70, 60, ${0.35 * (1 - (k - CRASH.surge[0]) / (CRASH.surge[1] - CRASH.surge[0]))})`);
  }
  // THE SIEGE'S BOLTS: their circles, filling as they come
  for (const rn of f.rains) {
    const k = Math.min(1, rn.t / RAIN.warn);
    disc(rn.u, rn.v, RAIN.r, null, warnColor(k), [4, 3]);
    if (rn.t < RAIN.warn) disc(rn.u, rn.v, RAIN.r * k, 'rgba(255, 61, 139, 0.18)');
    else disc(rn.u, rn.v, RAIN.r, 'rgba(255, 194, 61, 0.5)');
  }
  void HERO_R;
}

const fr = (n: number): number => n / 30;

export const COLOSSUS_FX: Act1Fx = {
  // (his figure and his tentacles' are the stand-ins above, not his old pictures: nothing of the Drowned Eye's is drawn)
  hidden: () => true,
  ground(c, _m, p) {
    if (p && p.a1 === 'eye:fight') draw(c);
  },
};
