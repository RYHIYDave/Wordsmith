// THE SWAMP COLOSSUS'S FIGHT DRAWN (game/colossus_fight.ts, COLOSSUS on): him and his tentacles in the art chat's own pictures where
// they are baked (render/colossus_baked.ts: his lurk, stand and entrance; each tentacle's stand, burst, slams, water slam, flinch and
// death); elsewhere, until they are, plain stand-ins show where everything is and when: him (a dark mound with his eye) at his place or at an end,
// his tentacles at their roots and lying along their lines, each slam's line laid on the stone (the game's warning: the enemy's
// pink, flaring to its gold), the water slams' warnings, the waves rolling across, the crash and its surge, the shovel's hooks
// scraping along the stone, his snap's reach as he twitches, the siege's bolts' circles. All drawn from one peril of his kind
// that keeps by the hero ('eye:fight'), so that it is drawn wherever he is. Nothing cyan (the friend's).

import { colossusOf, colossusOn } from '../../game/act1_rules/colossus';
import {
  ARM, BODY2, CHANGE3, CRASH, DEATH, EYE_SLAM, FORWARD, GAZE, HERO_R, HIS_PLACE, HOOK, RAIN, SHOVEL, SLAM, SMASH, SNAP, STONE, WAKE, WAVE,
  eyeSpotNear, gazeAimNear, hookFront, poolR, rootAt, stoneToWorld, waveFront, worldToStone,
} from '../../game/colossus_fight';
import type { Arm, ColossusFight } from '../../game/colossus_fight';
import type { Peril } from '../../game/state';
import { drawColossusAir, drawColossusDeath, drawColossusGround, drawColossusP3, drawColossusRings, drawColossusWard, keepColossusFx } from './colossus_fx';
import type { Act1Fx, Act1FxCtx } from './types';
import { ARM_BAKE, colossusAtEnd, colossusBakeAsk, colossusBaked, colossusEye, colossusFrames, colossusSlamTurns, colossusWant, drawColossusArm, drawColossusBody, drawColossusHooks } from '../colossus_baked';

/** His phase 3's tongue now (game/colossus_fight.ts; render/colossus_baked.ts P3_BAKE): his eye's attack, his eye struck, or his droop;
 *  and its frame. */
export function colossusTongue3(f: ColossusFight): [string, number] {
  const F30 = (t: number): number => Math.floor(t * 30 + 1e-6);
  const E = f.eye;
  if (E && E.kind === 'slam') return [`slam3.${E.pic}`, F30(E.t)];
  if (E && E.kind === 'gaze') return [`gaze3.${E.pic}`, F30(E.t)];
  if (f.struck) return [`struck3.${f.struck.from}`, F30(f.struck.t)];
  return ['p3tongue', F30(f.body) % 90];
}

/** Each tentacle struck: its hit's flash last seen, and when (the fight's clock) and from what frame of its stand it was struck. */
const STRUCK = new Map<number, { flash: number; at: number; stand: number }>();

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

  // HIM: under the water in phase 1 (his eye's fire seen through it), risen from his entrance on; at an end in his shovel. His own
  // pictures where they are baked (render/colossus_baked.ts), else the stand-ins.
  colossusBakeAsk();
  keepColossusFx(f);
  // (what the fight leaves on the stone and the water: render/act1_fx/colossus_fx.ts)
  drawColossusGround(g, P, f, c.t);
  // (what this part of the fight wants held: his phase's pictures and his tentacles'; the rest let go)
  // (his entrance in parts: the one playing and the next; his stand and phase 2's tentacles from its last part; phase 1's tentacles
  // while they die)
  const base = (ws: number[]): string[] => ws.flatMap((w) => [`a${w}.stand`, ...(w === 0 || w === 2 ? [`a${w}.smash`] : [])]);
  const part = Math.floor((f.phT * 30) / ARM_BAKE.entrancePart);
  const dying = f.arms.some((a) => a.state === 'dying') ? base([3, 4]) : [];
  // (his shovel: the part playing and the next, his snap, his hooks; the first part fetched as it comes due)
  const shk = f.shovel ? Math.floor(f.shovel.t * 30) : -1;
  const shPart = Math.floor(shk / ARM_BAKE.entrancePart);
  // (in his shovel only what it wants: him at the end, his snap and hooks, his tentacles going down and up; his stand from its last part)
  const shovelWants = f.shovel ? [`shovel.${shPart}`, `shovel.${shPart + 1}`, 'shovel.snap', 'hooks', ...base([0, 1, 2]).filter((m) => !m.includes('smash')), ...(shPart >= 3 ? ['stand'] : [])] : f.ph === 2 && f.mode === 'fight' && f.shovelIn < 4 ? ['shovel.0', 'shovel.snap', 'hooks'] : [];
  // (phase 3: his body and droop; his eye's attack under way, and the one coming where the hero is now)
  const hs = worldToStone(S, c.game.hero.x, c.game.hero.y);
  const p3Wants = (): string[] => ['p3body', colossusTongue3(f)[0], ...(f.eye ? [] : [f.eyeNext === 'slam' ? `slam3.${eyeSpotNear(hs)}` : `gaze3.${gazeAimNear(hs)}`]), ...(f.siege ? [] : ['death'])];
  colossusWant(
    f.shovel ? shovelWants
      : f.ph === 1 && f.mode === 'between' ? ['lurk', 'entrance.0', ...dying]
        : f.ph === 1 && f.mode === 'change' ? [`entrance.${part}`, `entrance.${part + 1}`, ...(part >= 2 ? ['stand', ...base([0, 1, 2])] : [])]
          : f.ph === 1 ? ['lurk', ...base([3, 4])]
            : f.ph === 2 && f.mode === 'change' ? ['stand', 'slide', 'p3body']
              : f.ph === 2 ? ['stand', ...base([0, 1, 2]), ...shovelWants, ...(f.body2 || (f.body2In < 3 && f.shovelIn > 4) ? ['bile', 'gaze'] : []), ...(f.mode === 'between' ? ['slide'] : [])]
                : p3Wants(),
    f.shovel ? [] : f.ph === 3 ? ['p3'] : ['arms'],
  );
  const standK = (f.body * 30) % Math.max(1, colossusFrames('stand') || 90);
  const bodyAt = (u: number, v: number, move: string, k: number, otherwise: () => void): void => {
    const [x, y] = P(u, v);
    if (!drawColossusBody(g, move, k, x, y)) otherwise();
  };
  // (his own light in the swamp's dark: the art's pictures of him are lit as he is, his eye's fire on him; none before he wakes, coming
  // up with his eye's fire as he does)
  {
    const [lx, ly] = P(HIS_PLACE.u, HIS_PLACE.v);
    const up = f.mode === 'idle' ? 0 : f.wakeT === null ? 1 : Math.max(0, Math.min(1, (f.wakeT - WAKE.lurk[0]) / (WAKE.lurk[1] - WAKE.lurk[0])));
    if (up > 0) c.spot(lx, ly - 60, 190, 0.75 * up);
  }
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
  // (his shovel in his own pictures: him at the end, flipped at the right end where at the end; his snap whenever it comes; his hooks)
  const [hx, hy] = P(HIS_PLACE.u, HIS_PLACE.v);
  const shMove = `shovel.${shPart}`;
  const shK = shk - shPart * ARM_BAKE.entrancePart;
  const shovelBaked = !!sh && colossusBaked(shMove) && (sh.snap === null ? drawColossusBody(g, shMove, shK, hx, hy, sh.end === 'r' && colossusAtEnd(shMove, shK)) : drawColossusBody(g, 'shovel.snap', Math.floor(sh.snap * 30), hx, hy, sh.end === 'r'));
  if (sh && shovelBaked) drawColossusHooks(g, shMove, shK, hx, hy, sh.end === 'r');
  if (sh && shovelBaked) {
    // the tell: the water boiling off that end (the game's effect)
    if (sh.t >= SHOVEL.tell[0] && sh.t < SHOVEL.tell[1]) {
      const endU = sh.end === 'l' ? -SHOVEL.out : STONE.w + SHOVEL.out;
      for (let i = 0; i < 6; i++) disc(endU + Math.sin(c.t * 7 + i) * 2, STONE.d / 2 + Math.cos(c.t * 5 + i * 2) * 4, 0.4 + 0.3 * Math.abs(Math.sin(c.t * 9 + i)), null, FOAM);
    }
    // his snap's reach as he twitches and shuts (the game's warning)
    if (sh.snap !== null) {
      const u0 = sh.end === 'l' ? 0 : STONE.w - SNAP.deep;
      poly([[u0, SNAP.across[0]], [u0 + SNAP.deep, SNAP.across[0]], [u0 + SNAP.deep, SNAP.across[1]], [u0, SNAP.across[1]]], sh.snapped ? 'rgba(255,194,61,0.45)' : 'rgba(255,61,139,0.25)', sh.snapped ? GOLD : PINK, [4, 3]);
    }
  } else if (sh) {
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
  } else if (f.ph === 2 && f.mode === 'change') {
    // (his slide forward: his stand at his place to its frame 24, then the art's slide from there, its pictures laid from his middle at
    // his place as all of his are)
    const k = Math.floor((f.phT - CHANGE3.slide) * 30 + 1e-6);
    const slid = Math.max(0, Math.min(1, (f.phT - CHANGE3.slide) / (CHANGE3.long - CHANGE3.slide)));
    const v = HIS_PLACE.v + (FORWARD.v - HIS_PLACE.v) * slid;
    // (the water heaped and foaming before him as he heaves forward, settling between: the art's lunges)
    const heave = [[4, 30], [42, 68], [78, 104]].reduce((m, [a, b]) => Math.max(m, k >= a && k < b ? Math.sin((Math.PI * (k - a)) / (b - a)) : 0), 0);
    if (k >= 0 && k < 120) drawColossusRings(g, P, { u: HIS_PLACE.u, v: v + 2.2 }, 6.4, 1.3, c.t * 1.6, 8, 0.6 + 1.4 * heave);
    if (k < 0) bodyAt(HIS_PLACE.u, HIS_PLACE.v, 'stand', standK, () => himAt(HIS_PLACE.u, HIS_PLACE.v, 1));
    else bodyAt(HIS_PLACE.u, HIS_PLACE.v, 'slide', k, () => himAt(FORWARD.u, v, 1));
  } else if (f.ph === 3) {
    // (at his new place: his ward round him while a pillar burns; his body; his tongue over it (cut where his jaws are before it): his
    // droop, his eye's attack, his eye struck)
    const [mv, k] = colossusTongue3(f);
    const tongueMv = colossusBaked(mv) ? mv : 'p3tongue';
    const tongueK = tongueMv === mv ? k : standK;
    const him3 = (gg: CanvasRenderingContext2D, x: number, y: number): boolean => {
      if (!drawColossusBody(gg, 'p3body', standK, x, y)) return false;
      if (!drawColossusBody(gg, tongueMv, tongueK, x, y)) drawColossusBody(gg, 'p3tongue', standK, x, y);
      return true;
    };
    const eye = colossusEye(tongueMv, tongueK);
    const over = drawColossusWard(g, f, colossusOn(boss!), c.game.time, him3, hx, hy, eye ? [hx + eye[0], hy + eye[1]] : null, c.t);
    if (!him3(g, hx, hy)) himAt(FORWARD.u, FORWARD.v, 1);
    over();
  } else if (risen && f.ph === 1 && f.mode === 'change') {
    const k = Math.floor(f.phT * 30);
    bodyAt(HIS_PLACE.u, HIS_PLACE.v, `entrance.${Math.floor(k / ARM_BAKE.entrancePart)}`, k % ARM_BAKE.entrancePart, () => himAt(HIS_PLACE.u, HIS_PLACE.v, Math.min(1, f.phT / 3)));
  }
  else if (risen && f.body2) bodyAt(HIS_PLACE.u, HIS_PLACE.v, f.body2.kind, Math.floor(f.body2.t * 30), () => bodyAt(HIS_PLACE.u, HIS_PLACE.v, 'stand', standK, () => himAt(HIS_PLACE.u, HIS_PLACE.v, 1)));
  else if (risen) bodyAt(HIS_PLACE.u, HIS_PLACE.v, 'stand', standK, () => himAt(HIS_PLACE.u, HIS_PLACE.v, 1));
  else {
    // (under the water, his lurk; or his eye's fire seen through it. Before the hero steps onto the stone nothing of him is seen; as he
    // wakes, his eye's fire comes up under the water: WAKE)
    const lurkA = f.mode === 'idle' ? 0 : f.wakeT === null ? 1 : Math.max(0, Math.min(1, (f.wakeT - WAKE.lurk[0]) / (WAKE.lurk[1] - WAKE.lurk[0])));
    if (lurkA > 0) {
      const [lx, ly] = P(HIS_PLACE.u, HIS_PLACE.v);
      if (!drawColossusBody(g, 'lurk', (f.body * 30) % Math.max(1, colossusFrames('lurk') || 90), lx, ly, false, lurkA * lurkA * (3 - 2 * lurkA))) {
        const [x, y] = P(HIS_PLACE.u, HIS_PLACE.v + 3);
        g.fillStyle = `rgba(255, 61, 139, ${(0.25 + 0.15 * Math.sin(c.t * 2)) * lurkA})`;
        g.beginPath();
        g.ellipse(x, y, 26, 9, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  // PHASE 2, HIS BODY'S OWN ATTACKS (the game's parts of them, in the enemy's colours, the art's bile): the bile arc's warning where it
  // will land; the glob arcing over from his throat; its splash; the burning pools; the gaze as phase 3's, below
  const B = f.body2;
  if (B && B.kind === 'bile') {
    const L = BODY2.bile;
    if (B.t < L.land) {
      const k = B.t / L.land;
      disc(B.at.u, B.at.v, L.splash, null, warnColor(k), [4, 3]);
      disc(B.at.u, B.at.v, L.splash * k, 'rgba(255, 61, 139, 0.16)');
    }
  }
  // PHASE 3, HIS EYE: the gaze's arc laid and its beam swept; the eye slam's circle, and the eye lying where it came down (phase 2's
  // gaze the same, from the water under his eye at his place)
  const E = f.eye ?? (B && B.kind === 'gaze' ? B : null);
  if (E && E.kind === 'gaze') {
    const ray = (deg: number, len: number): [number, number] => [E.at.u + Math.sin((deg * Math.PI) / 180) * len, E.at.v + Math.cos((deg * Math.PI) / 180) * len];
    if (E.t < GAZE.warn) {
      const pts: [number, number][] = [[E.at.u, E.at.v]];
      for (let i = 0; i <= 12; i++) pts.push(ray(E.a0 + ((E.a1 - E.a0) * i) / 12, 16));
      poly(pts, 'rgba(30, 6, 24, 0.22)', warnColor(E.t / GAZE.warn), [5, 3]);
    }
  }
  if (E && E.kind === 'slam') {
    if (!E.landed) {
      const k = E.t / EYE_SLAM.hit;
      disc(E.at.u, E.at.v, EYE_SLAM.r, null, warnColor(k), [4, 3]);
      disc(E.at.u, E.at.v, EYE_SLAM.r * Math.min(1, k), 'rgba(255, 61, 139, 0.18)');
    } else if (E.t < EYE_SLAM.up && !colossusBaked(`slam3.${E.pic}`)) {
      const [x, y] = P(E.at.u, E.at.v);
      g.fillStyle = PINK;
      g.beginPath();
      g.ellipse(x, y - 6, 30, 11, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = GOLD;
      g.beginPath();
      g.ellipse(x, y - 6, 7, 9, 0, 0, Math.PI * 2);
      g.fill();
    }
  }

  // (the rings on the water round him where he breaks it, at his place risen, or at his new place; round each tentacle standing)
  if (risen && !sh && f.ph < 3 && !(f.ph === 2 && f.mode === 'change')) drawColossusRings(g, P, { u: HIS_PLACE.u, v: HIS_PLACE.v + 1.2 }, 6.5, 1.6, c.t, 3);
  if (f.ph === 3) drawColossusRings(g, P, { u: FORWARD.u, v: FORWARD.v + 1.6 }, 6.2, 1.2, c.t, 5);
  // (phase 3, the game's parts on the stone: his grip's cracks, his eye's, the bolts' scorches, the pieces set)
  if ((f.ph === 2 && f.mode === 'change') || f.ph === 3) drawColossusP3(g, P, f, colossusOn(boss!), c.game, [hx, hy], eyeAt3(f, hx, hy), c.t, 'ground');
  for (const a of f.arms) if (a.state === 'stand' || a.state === 'slam' || a.state === 'smash') drawColossusRings(g, P, rootAt(a.u), 0.5, 0.3, c.t + a.k * 0.4, 11 + a.k, 0.7);

  // HIS TENTACLES: each its own pictures, laid from his middle as he is (his entrance's in his entrance's pictures)
  const [mx, my] = P(HIS_PLACE.u, HIS_PLACE.v);
  const F = (t: number): number => Math.floor(t * 30 + 1e-6);
  const inEntrance = f.ph === 1 && f.mode === 'change' && colossusBaked('entrance.0');
  const armPic = (a: Arm): boolean => {
    const w = f.ph === 1 && f.mode !== 'change' ? 3 + a.k : a.k;
    const stand = (): boolean => drawColossusArm(g, w, `a${w}.stand`, F(f.armClock) % 45, mx, my);
    if (inEntrance) return true;
    // (his shovel: they go down with him and come up with him at his place, in his shovel's own frames; under the water between)
    if (f.shovel && shovelBaked && a.state !== 'dying') {
      const down = colossusFrames(`a${w}.sink`);
      const upAt = Math.round(SHOVEL.back * 30);
      if (shk < down) return drawColossusArm(g, w, `a${w}.sink`, shk, mx, my);
      if (shk >= upAt) return drawColossusArm(g, w, `a${w}.up`, shk - upAt, mx, my);
      return true;
    }
    if (a.state === 'rise') return drawColossusArm(g, w, `a${w}.burst`, F(a.t), mx, my);
    if (a.state === 'duck') return drawColossusArm(g, w, `a${w}.duck`, F(a.t), mx, my);
    if (a.state === 'stand') {
      // (struck: its flinch from the nearest point of its stand it is baked from)
      const m = c.game.monsters.find((q) => !q.dead && (q.a1 as { arm?: number } | undefined)?.arm === a.id);
      const s = STRUCK.get(a.id) ?? { flash: 0, at: -9, stand: 0 };
      if (m && m.flash > s.flash + 0.01) {
        s.at = f.time;
        s.stand = F(f.armClock) % 45;
      }
      s.flash = m ? m.flash : 0;
      STRUCK.set(a.id, s);
      const since = F(f.time - s.at);
      if (since >= 0 && since < 14) {
        const from = ARM_BAKE.flinchFrom.reduce((b, q) => (Math.min(Math.abs(q - s.stand), 45 - Math.abs(q - s.stand)) < Math.min(Math.abs(b - s.stand), 45 - Math.abs(b - s.stand)) ? q : b));
        if (drawColossusArm(g, w, `a${w}.flinch${from}`, since, mx, my)) return true;
      }
      return stand();
    }
    if (a.state === 'slam') {
      const turns = colossusSlamTurns(w);
      const d = turns.length ? turns.reduce((b, q) => (Math.abs(q - a.turn) < Math.abs(b - a.turn) ? q : b)) : NaN;
      // (only a turn baked near enough: the game turns a picture no further than half the bake's step)
      if (Math.abs(a.turn - d) <= ARM_BAKE.turnEvery / 2 + 0.01) {
        // (its slam's pictures still coming: its stand a moment, its wind-up begun from it)
        return drawColossusArm(g, w, `a${w}.slam${d}`, F(a.t), mx, my, a.turn - d) || stand();
      }
      return false;
    }
    if (a.state === 'smash') return drawColossusArm(g, w, `a${w}.smash`, F(a.t), mx, my) || stand();
    if (a.state === 'dying') return drawColossusArm(g, w, `a${w}.death`, F(a.t), mx, my);
    return false;
  };
  for (const a of f.arms) {
    if (a.state === 'dead') continue;
    if (a.state === 'under' && !(f.shovel && shovelBaked)) continue;
    if (a.state === 'under') {
      armPic(a);
      continue;
    }
    const r = rootAt(a.u);
    const [x, y] = P(r.u, r.v);
    const fade = a.state === 'dying' ? Math.max(0, 1 - a.t / ARM.death) : a.state === 'rise' ? Math.min(1, a.t / ARM.burst) : 1;
    g.globalAlpha = fade;
    // its slam's line, laid as it rears (the game's warning, drawn under its pictures)
    if (a.state === 'slam' && a.line && a.t < SLAM.hit) poly(strip(a.line.a, a.line.b, SLAM.width / 2), 'rgba(30, 6, 24, 0.35)', warnColor(a.t / SLAM.hit), [5, 3], 1);
    if (a.state === 'smash' && a.t < SMASH.hit) poly([[0, 0], [STONE.w, 0], [STONE.w, STONE.d], [0, STONE.d]], 'rgba(30, 6, 24, 0.18)', warnColor(a.t / SMASH.hit), [6, 4], 1);
    g.globalAlpha = 1;
    if (armPic(a)) continue;
    g.globalAlpha = fade;
    // (the stand-in: lying along its line after its slam, or standing at its root)
    if (a.state === 'slam' && a.line && a.t >= SLAM.hit && a.t < SLAM.lying[1]) poly(strip(r, a.line.b, SLAM.width / 2 * 0.8), FLESH, FLESH_LIT);
    const up = a.state === 'slam' && a.t < SLAM.hit ? 1.3 : a.state === 'dying' ? 0.6 : 1;
    g.fillStyle = FLESH;
    g.fillRect(x - 9, y - 70 * up, 18, 70 * up);
    g.fillStyle = FLESH_LIT;
    g.fillRect(x - 9, y - 70 * up, 5, 70 * up);
    g.globalAlpha = 1;
  }

  // (the waves, the crash and what flies: over the hero, render/act1_fx/colossus_fx.ts, from COLOSSUS_FX.air)
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

/** Where his eye glows now in phase 3 (the screen), from his middle at his place at (hx, hy). */
function eyeAt3(f: ColossusFight, hx: number, hy: number): [number, number] | null {
  const [mv, k] = colossusTongue3(f);
  const e = colossusBaked(mv) ? colossusEye(mv, k) : colossusEye('p3tongue', Math.floor(f.body * 30 + 1e-6) % 90);
  return e ? [hx + e[0], hy + e[1]] : null;
}

/**
 * HIS DEATH (game/colossus_fight.ts DEATH; the art's eye_death.ts, baked as `death`): played on his fight's peril from the killing blow
 * (its clock then `p.c`, game/act1_rules/colossus.ts), his own pictures from his middle at his place, the game's parts of it round them.
 */
function drawDeath(c: Act1FxCtx, p: Peril, pass: 'ground' | 'air'): void {
  const g = c.g;
  const S = c.game.level.land?.stone;
  if (!g || !S) return;
  const P = (u: number, v: number): readonly [number, number] => {
    const w = stoneToWorld(S, u, v);
    return c.at(w.x, w.y);
  };
  const s = p.t - p.c;
  const k = Math.floor(s * 30 + 1e-6);
  if (pass === 'air') {
    drawColossusDeath(g, P, s, c.t, 'air');
    return;
  }
  colossusBakeAsk();
  colossusWant(['death'], []);
  const [hx, hy] = P(HIS_PLACE.u, HIS_PLACE.v);
  const lit = 1 - Math.max(0, Math.min(1, (k - DEATH.melt[0]) / (DEATH.gone - DEATH.melt[0])));
  if (lit > 0) c.spot(hx, hy - 60, 190, 0.75 * lit);
  drawColossusDeath(g, P, s, c.t, 'ground');
  if (k < colossusFrames('death')) drawColossusBody(g, 'death', k, hx, hy);
}

export const COLOSSUS_FX: Act1Fx = {
  // (his figure and his tentacles' are the stand-ins above, not his old pictures: nothing of the Drowned Eye's is drawn)
  hidden: () => true,
  // (and so nothing of them is painted ahead: render/act1_fx/types.ts)
  noFigure: true,
  ground(c, _m, p) {
    if (p && p.a1 === 'eye:fight') {
      if (p.a === 1) drawDeath(c, p, 'ground');
      else draw(c);
    }
  },
  air(c, _m, p) {
    if (p && p.a1 === 'eye:fight' && p.a === 1) {
      drawDeath(c, p, 'air');
      return;
    }
    if (!p || p.a1 !== 'eye:fight' || !c.g) return;
    const S = c.game.level.land?.stone;
    const boss = colossusOf(c.game);
    const f = boss ? colossusOn(boss).fight : undefined;
    if (!S || !f) return;
    const P = (u: number, v: number): readonly [number, number] => {
      const w = stoneToWorld(S, u, v);
      return c.at(w.x, w.y);
    };
    const [hx, hy] = P(HIS_PLACE.u, HIS_PLACE.v);
    const eye = f.ph === 3 ? eyeAt3(f, hx, hy) : null;
    drawColossusAir(c.g, P, f, c.t, eye);
    // (phase 3 over the hero: the pillars' fire and lines, the bolts, what flies, his eye's ichor)
    if ((f.ph === 2 && f.mode === 'change') || f.ph === 3) drawColossusP3(c.g, P, f, colossusOn(boss!), c.game, [hx, hy], eye, c.t, 'air');
  },
};
