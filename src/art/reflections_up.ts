// FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW (the queue's make-floor-18-reflections, 12 Nov 2026). Behind
// REFLECTIONS_UP, off: floor 18's figure (art/act1_figs/reflection.ts) takes these with it on, the first reflections' with it off
// (the queue's wire-floor-18-new-reflections, 12 Nov 2026). The switch is the rules' (game/act1_rules/reflection.ts), handed on.
//
// THE WARRIOR HOLDS WHAT HE HOLDS (his weapon tree, live since 25.3.11): with his war axe or his maul his copy is made from his own
// moves with it (art/warrior_up_axe_moves.ts, art/warrior_up_hammer_moves.ts, paintAxe): standing and running with it, its tap
// and its hold (Cleave and the thrown axe, braced while it flies and caught; Smash and the Earthquake), struck as he is with it
// (art/warrior_up_heavy_art.ts heavyMoves). What he holds is never seen through by its cracks, as a limb is not (`heldFrom`).
//
// The ask (the main chat's board post of 7 Nov and an older one; the Mage added by the Mage chat, 11 Nov): floor 18's mirror
// reflections are made from the OLD heroes' moves (art/reflections.ts, from art/heroes3.ts paintMove3); wanted, glass copies of
// the Warrior and the Ranger as they look now, of the Mage redrawn, and of the Warlock, the Tinkerer and the Brawler (whose
// reflections the game shows as the old Mage's, Ranger's and knight's until these come: art/act1_figs/reflection.ts).
//
// HOW IT IS MADE: FROM EACH HERO'S OWN PAINTER, the very function the game paints that hero with, at the same moment of the
// same move, from each side the hero has (eight for the Warrior, the Ranger, the Mage and the Tinkerer; two for the Warlock,
// and for the Brawler while his eight sides are off: art/sides_more.ts EIGHT_MORE), and then turned to glass by the same
// steps as the first reflections (art/reflections.ts: his yes, “Yes, that's them (Recommended)”, and “Pink, like enemies
// (Recommended)” for what glows on him):
//   1. SILVERED, on the two glasses (glassOfPainting): warm to grey-violet, cool to silver, the seams the style's indigo.
//   2. GLASS IS BRIGHT AT ITS EDGES (brightEdges).
//   3. FINE CRACKS, FIXED TO THE BODY: the same five (CRACKS), laid on the figure's own solids (its ribs, belly, pelvis and
//      skull, found by their names in its sculpture: dev/sculpt.ts), so they go where the body goes; seen only where that
//      solid is what the eye meets there (the drawing's own depth of every pixel), so an arm or what it holds in front hides
//      them, and those on the back are seen from behind.
//   4. A SHEEN (sheenOver), round with the move: a whole number of times in a loop, so it never jumps; once in a blow.
//   5. NOTHING CYAN LEFT: every friend's glow the enemy's pink, tone for tone: the kit's glows (FRIEND_TO_ENEMY), and every
//      cyan pixel of a material of his that glows (a ramp of the kit's bright cyan), of what is drawn of the old kind (a
//      string, an arrow, a crystal) and of a gem marked on him (a buckle). Cyan that is cloth (the Ranger's cloak, the Mage's
//      cape) is not a glow: it is glass, as the first reflections had it.
//   6. THE HUSH'S DULL PINK IN ITS EYES: each hero's own eye marks (his sculptor's), laid in the Hush's pink where they are
//      seen (the Warrior's glints in his visor; the Warlock's lit eyes under his hood; the Brawler's good eye and his milky one).
//   7. THE ENEMY'S PINK EDGE.
// The silhouette is the hero's own, pixel for pixel. Its stepping out of a mirror and its shattering are the first
// reflections' (art/reflections_fx.ts), made from these frames.
//
// WHAT A REFLECTION DOES IN THE GAME (game/act1_rules/reflection.ts): it stands, runs, makes its tap's blow and its hold's,
// steps out of a mirror and shatters. So these are its lists, from every side: `idle`, `walk`, `attack` and `heavy` (each the
// hero's own tap and hold), `clips.attack`, `clips.heavy`, `clips.die` (its shattering), and from in front
// `clips.moves.stepOut`. How the game uses each class's own blows (a punch, a vial thrown, a bolt) is the main chat's.

import { Px, rgba } from '../engine/px';
import type { Light, Sprite } from '../engine/px';
import type { ClassId } from '../game/types';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { RIM_ALPHA, edge, lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { ENEMY_RIM } from './mkit';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';
import type { Drawn, Prim, Sculpt } from '../dev/sculpt';
import { LAST } from '../dev/sculpt';
import { CRACKS, EYE, GLASS_TAIL, REFLECTION_POOL, asEnemy, brightEdges, glassColours, glassOfPainting, hueOf, isCyan, lightCracks, sheenOver } from './reflections';
import type { Silvered } from './reflections';
import { GALLERY_MIRROR, SHATTER, SHATTER_CANVAS, STEP_CANVAS, STEP_OUT, shatterPainted, stepOutPainted } from './reflections_fx';
import { WU_SIDES } from './warrior_up';
import { GLINT, INK } from './kit';
import { paintWu } from './warrior_up_art';
import { WU_LURCH3, WU_REAR3, WU_REEL3, WU_RUN3, WU_SLAM3, WU_STRIKE3 } from './warrior_up_moves';
import { paintRuMove } from './ranger_up_art';
import { RU_LURCH3, RU_REEL3, RU_RUN3, RU_SHOT3, RU_STAND3, RU_VOLLEY3 } from './ranger_up_moves';
import { paintMuMove } from './mage_up_art';
import { MU_MOVES } from './mage_up_moves';
import type { Move3 } from './moves3';
import { EIGHT_MORE, MORE_SIDES, MORE_TURN } from './sides_more';
import type { MoreSide } from './sides_more';
import { TAP_GRAB, TAP_LET_GO, TRUN_ROUND, TSTAND_LONG, drawTinkerAt, tinkerMoves } from '../dev/tinkerer_moves';
import type { TinkMove } from '../dev/tinkerer_moves';
import { tinkerLurch, tinkerReel } from '../dev/tinkerer_hits';
import { VET_CANVAS, paintVeteran } from '../dev/sculpt_veteran';
import { VET_RUN, VET_STAND, VFPS, motionById } from '../dev/veteran_moves';
import type { VetMotion } from '../dev/veteran_moves';
import { VET_RUN_STRIDE, vetPoseAt } from './veteran_art';
import { RUN_ROUND as WARLOCK_RUN, STAND_LONG as WARLOCK_STAND, drawWarlockAt, warlockMoves } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { BOLT_HIT, CURSE_HIT, warlockSpells } from '../dev/warlock_spells';
import { warlockLurch, warlockReel } from '../dev/warlock_hits';
import { GRIP_SPEED } from './moves3';
import { AXE_BRACED, AXE_CATCH, AXE_CLEAVE, AXE_FLIGHT, AXE_RUN, AXE_STAND, AXE_THROW, paintAxe } from './warrior_up_axe_moves';
import type { AxeMove } from './warrior_up_axe_moves';
import { HAMMER_QUAKE, HAMMER_RUN, HAMMER_SMASH, HAMMER_STAND } from './warrior_up_hammer_moves';
import { heavyMoves } from './warrior_up_heavy_art';
import type { HeavyWeapon } from './warrior_up_heavy_art';
import { FORMS, REFLECTIONS_UP, WEAPON_FORM } from '../game/act1_rules/reflection';

/** THE SWITCH, OFF: the rules' (game/act1_rules/reflection.ts), handed on. */
export { REFLECTIONS_UP };

// =============================================================================================
// ONE FRAME OF A SCULPTED HERO, TURNED TO GLASS

/** A frame of a sculpted hero as his painter made it: the painting, its drawing (each pixel's depth and stuff), his sculpture, and his floor point on it. */
export interface Sculpted {
  px: Px;
  lights: Light[];
  tails?: Painted['tails'];
  d: Drawn;
  sc: Sculpt;
  ax: number;
  ay: number;
  /** The stuffs (material numbers) of what his hands hold begin here (the Warrior's war axe and maul: ArmedFrame.firstMat). */
  heldFrom?: number;
}
/** A frame of his reflection: the glass, where its eyes and cracks were laid (for the checks), and its floor point. */
export interface Glassed extends Silvered {
  cracks: number;
  ax: number;
  ay: number;
}

/**
 * HOW A CRACK IS SEEN, as on the first reflections: only on the side of its solid that faces the eye; where that solid's skin is
 * what is drawn there, or lies within this of it (the figure's measure); and through cloth laid over the trunk (a coat, a
 * cape, a hood, a skirt) up to `THROUGH_CLOTH`, but never through a limb or what the hands hold.
 */
const CRACK_DEPTH = 2.4;
const THROUGH_CLOTH = 9;
/** The parts of a figure that pass in front of its trunk: its limbs and what they hold or wear (by their names in his sculpture). */
const LIMB = /^(arm|fore|hand|leg|shin|knee|foot|boot|cuff|bow|staff|wrench|book|braid|quiver|arrow|sword|blade|weapon|golem|gun|vial|pony)/i;

/** Whether a material of his glows the friend's cyan (a ramp of the kit's bright cyan: a vial, an arrow's head), not cyan cloth. */
function glowsCyan(ramp: readonly string[]): boolean {
  const [r, g, b] = rgba(ramp[2] ?? ramp[0]);
  return isCyan(r, g, b) && 0.299 * r + 0.587 * g + 0.114 * b > 140;
}

/** The solids the cracks lie on, by their names in his sculpture: [ribs, belly, pelvis, skull] (a missing one: none on it). */
function crackSolids(sc: Sculpt): (Prim | undefined)[] {
  const find = (...tags: string[]): Prim | undefined => {
    for (const t of tags) {
      const p = sc.prims.find((q) => q.tag === t && (q.k === 'ell' || q.k === 'box'));
      if (p) return p;
    }
    return undefined;
  };
  return [find('ribs', 'chest'), find('belly'), find('pelvis', 'seat', 'hips'), find('skull')];
}

/**
 * HIS FRAME TURNED TO GLASS (the head of this file says how). `eye`: which of his sculptor's marks are his eyes. `sheen`:
 * where the sheen has got to (0..1). Changes the frame's painting in place.
 */
export function glassUp(f: Sculpted, eye: (c: string, w: number, h: number) => boolean, sheen: number): Glassed {
  const { px, d, sc } = f;
  const W = px.w;
  const H = px.h;
  const same = d.px.w === W && d.px.h === H;
  // (what of him glows: his materials of the kit's bright cyan, what is drawn of the old kind, the gems marked on him)
  const glowMat = sc.mats.map((m) => glowsCyan(m.ramp));
  const markCyan = new Set<number>();
  for (const m of sc.marks) {
    const [r, g, b] = rgba(m.c);
    if (isCyan(r, g, b)) markCyan.add((r << 16) | (g << 8) | b);
  }
  const glow = (k: number, r: number, g: number, b: number): string | null => {
    if (!isCyan(r, g, b)) return null;
    const s = same ? d.stuff[k] : -1;
    if (s < 0 || s >= 1000 || glowMat[s] || markCyan.has((r << 16) | (g << 8) | b)) return asEnemy(`#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`);
    return null;
  };
  const { glass, tone } = glassOfPainting(px, glow);
  brightEdges(glass, tone, W, H);
  // THE CRACKS, on his own solids, where the eye meets that solid
  const cracked = new Set<number>();
  if (same) {
    const st = d.st;
    const solids = crackSolids(sc);
    // (which of his materials are worn only by his limbs and what they hold: a crack is never seen through one)
    const limbMat = sc.mats.map((_, i) => {
      if (f.heldFrom !== undefined && i >= f.heldFrom) return true;
      const pieces = sc.prims.filter((q) => q.mat === i).map((q) => q.piece);
      return pieces.length > 0 && pieces.every((pc) => LIMB.test(pc));
    });
    for (const c of CRACKS) {
      const o = solids[c.on];
      if (!o || (o.k !== 'ell' && o.k !== 'box')) continue;
      const onSkin = (u: V3): V3 => {
        const l = Math.hypot(u[0], u[1], u[2]) || 1;
        const n: V3 = [u[0] / l, u[1] / l, u[2] / l];
        const a = o.axes;
        return sc.at([o.c[0] + a[0][0] * n[0] + a[1][0] * n[1] + a[2][0] * n[2], o.c[1] + a[0][1] * n[0] + a[1][1] * n[1] + a[2][1] * n[2], o.c[2] + a[0][2] * n[0] + a[1][2] * n[1] + a[2][2] * n[2]]);
      };
      /** Whether the skin there faces the eye (its solid's way out at that point, as the figure is turned). */
      const ul = o.axes.map((v) => Math.hypot(v[0], v[1], v[2]) || 1e-6);
      const facing = (u0: V3, u1: V3, k: number): boolean => {
        const u: V3 = [u0[0] + (u1[0] - u0[0]) * k, u0[1] + (u1[1] - u0[1]) * k, u0[2] + (u1[2] - u0[2]) * k];
        const l = Math.hypot(u[0], u[1], u[2]) || 1;
        const w = [0, 0, 0];
        for (let i = 0; i < 3; i++) for (let c2 = 0; c2 < 3; c2++) w[c2] += (o.axes[i][c2] / ul[i]) * (u[i] / l / ul[i]);
        const t0 = sc.at(w as unknown as V3);
        const t1 = sc.at([0, 0, 0]);
        const e = st.eye;
        const n = Math.hypot(t0[0] - t1[0], t0[1] - t1[1], t0[2] - t1[2]) || 1;
        return ((t0[0] - t1[0]) * e[0] + (t0[1] - t1[1]) * e[1] + (t0[2] - t1[2]) * e[2]) / n > 0.18;
      };
      const run = (line: readonly V3[]): void => {
        for (let j = 0; j + 1 < line.length; j++) {
          const a = onSkin(line[j]);
          const b = onSkin(line[j + 1]);
          const [ax, ay] = st.at(a);
          const [bx, by] = st.at(b);
          const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 1.5));
          for (let i = 0; i <= n; i++) {
            const k = i / n;
            const p = onSkin([line[j][0] + (line[j + 1][0] - line[j][0]) * k, line[j][1] + (line[j + 1][1] - line[j][1]) * k, line[j][2] + (line[j + 1][2] - line[j][2]) * k]);
            const [x0, y0] = st.at(p);
            const x = Math.round(x0 - 0.5);
            const y = Math.round(y0 - 0.5);
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            const q = y * W + x;
            if (glass[q] < 0 || !(d.z[q] > -Infinity)) continue;
            if (!facing(line[j], line[j + 1], k)) continue;
            // (seen where that solid's skin is what is drawn there, or lies close over it; through cloth over the trunk; never through a limb)
            const gap = d.z[q] - st.near(p);
            const s0 = d.stuff[q];
            if (gap > CRACK_DEPTH && (gap > THROUGH_CLOTH || s0 < 0 || s0 >= 1000 || limbMat[s0])) continue;
            cracked.add(q);
          }
        }
      };
      run(c.line);
      if (c.fork) run([c.line[c.fork.at], ...c.fork.to]);
    }
  }
  lightCracks(cracked, glass, tone, W, H);
  sheenOver(glass, tone, W, H, sheen, f.ax, f.ay);
  glassColours(px, glass, tone);
  // THE EYES: his eye marks, in the Hush's dull pink, where they are seen (as his sculptor lays a mark: dev/sculpt.ts draw)
  const eyes: [number, number][] = [];
  if (same) {
    const st = d.st;
    const skull = crackSolids(sc)[3];
    const head = skull && (skull.k === 'ell' || skull.k === 'box') ? skull : undefined;
    const reach = head ? 1.8 * Math.max(...head.axes.map((a) => Math.hypot(a[0], a[1], a[2]))) : Infinity;
    for (const mk of sc.marks) {
      if (!eye(mk.c, mk.w, mk.h)) continue;
      if (head && Math.hypot(mk.p[0] - head.c[0], mk.p[1] - head.c[1], mk.p[2] - head.c[2]) > reach) continue;
      const p = sc.at(mk.p);
      const [mx, my] = st.at(p);
      const mz = st.near(p);
      const k0 = Math.floor(my) * W + Math.floor(mx);
      if (k0 < 0 || k0 >= W * H || d.stuff[k0] < 0 || d.z[k0] - mz > mk.through || (mk.on >= 0 && d.stuff[k0] !== mk.on)) continue;
      for (let yy = Math.floor(my) + mk.dy; yy < Math.floor(my) + mk.dy + mk.h; yy++) {
        for (let xx = Math.floor(mx) + mk.dx; xx < Math.floor(mx) + mk.dx + mk.w; xx++) {
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const k = yy * W + xx;
          if (d.stuff[k] !== d.stuff[k0] || px.d[k * 4 + 3] !== 255) continue;
          px.set(xx, yy, EYE);
          eyes.push([xx, yy]);
        }
      }
    }
  }
  // THE ENEMY'S EDGE
  edge(px, ENEMY_RIM, RIM_ALPHA);
  const lights = f.lights.map((l) => ({ ...l, color: asEnemy(l.color) }));
  const out: Glassed = { px, lights, eyes, cracks: cracked.size, ax: f.ax, ay: f.ay };
  if (f.tails) out.tails = f.tails.map((r) => ({ ...r, id: GLASS_TAIL + r.id }));
  return out;
}

// =============================================================================================
// EACH HERO: WHAT HE IS PAINTED BY, AND WHAT A REFLECTION OF HIM DOES

/** A move of his, as a reflection needs it: how long, whether it goes round (from when), when its blow lands, and him painted at a moment of it from a side. */
export interface Track {
  name: string;
  long: number;
  loops: boolean;
  from: number;
  hit?: number;
  /** A move of whole frames (the Brawler's: his art's frames, 30 a second): a blow played once is that many frames, not one more. */
  frames?: number;
  paint(t: number, side: string): Sculpted;
}
/** A hero, as his reflection is made from him. */
export interface HeroGlass {
  cls: ClassId;
  sides: readonly string[];
  stand: Track;
  run: Track;
  tap: Track;
  hold: Track;
  lurch: Track;
  reel: Track;
  idleFps: number;
  walkFps: number;
  clipFps: number;
  walkStride?: number;
  /** Which of his sculptor's marks are his eyes. */
  eye(c: string, w: number, h: number): boolean;
  /** Each frame a few tenths of a second to paint (art/kit.ts HEAVY): the side painter's, as his own lists are. */
  heavy: boolean;
}

const endOf = (m: Move3): number => (m.motion.keys.length ? m.motion.keys[m.motion.keys.length - 1].at : 0);
/** A move of the heroes brought up (art/warrior_up.ts and its fellows: Move3s), painted by `paint`. */
function move3(m: Move3, paint: (m: Move3, t: number, side: string) => Sculpted): Track {
  const loop = m.motion.loop;
  return { name: m.name, long: endOf(m), loops: loop !== undefined, from: loop ?? 0, hit: m.motion.hit, paint: (t, side) => paint(m, t, side) };
}
/** A frame of a hero brought up (his frame carries its drawing and his sculpture). */
const upFrame = (f: { px: Px; lights: Light[]; tails?: Painted['tails']; drawn: Drawn; sc: Sculpt; ax: number; ay: number }): Sculpted => ({ px: f.px, lights: f.lights, tails: f.tails, d: f.drawn, sc: f.sc, ax: f.ax, ay: f.ay });
/** A frame drawn by a painter that hands back only its drawing: his sculpture is the last one drawn (dev/sculpt.ts LAST). */
function lastDrawn(draw: () => Drawn, ax: number, ay: number): Sculpted {
  LAST.sc = null;
  const d = draw();
  const sc = LAST.sc as Sculpt | null;
  if (!sc) throw new Error('reflections_up: the painter drew no sculpture');
  return { px: d.px.clone(), lights: [], d, sc, ax, ay };
}

const isInk = (c: string): boolean => c.toLowerCase() === INK;
/** The Warrior's eyes: the glints in his visor. The Ranger's and the Mage's: their dark eyes (a mark two pixels tall). */
const eyesWarrior = (c: string): boolean => c.toLowerCase() === GLINT;
const eyesDark = (c: string, _w: number, h: number): boolean => isInk(c) && h === 2;

function warrior(): HeroGlass {
  const p = (m: Move3, t: number, side: string): Sculpted => upFrame(paintWu(m, t, side as never, null));
  return {
    cls: 'warrior',
    sides: WU_SIDES,
    stand: move3(WU_REAR3, p),
    run: move3(WU_RUN3, p),
    tap: move3(WU_STRIKE3, p),
    hold: move3(WU_SLAM3, p),
    lurch: move3(WU_LURCH3, p),
    reel: move3(WU_REEL3, p),
    idleFps: 30,
    walkFps: 30,
    clipFps: 30,
    walkStride: WU_RUN3.stride,
    eye: eyesWarrior,
    heavy: false,
  };
}
/**
 * THE WARRIOR WITH HIS WAR AXE OR HIS MAUL (what he holds: game/talents.ts heavyDrawn): his own moves with it. The thrown axe is his
 * throw, then braced while it flies, then the catch as it comes back (the art's flight: AXE_FLIGHT, a second out and back): the
 * rules' axe flies as long (game/act1_rules/reflection.ts UP).
 */
function warriorWith(weapon: HeavyWeapon): HeroGlass {
  const p = (m: AxeMove, t: number, side: string): Sculpted => {
    const f = paintAxe(m, t, side as never, null);
    return { ...upFrame(f), heldFrom: f.firstMat };
  };
  const endOfAxe = (m: AxeMove): number => (m.keys.length ? m.keys[m.keys.length - 1].at : 0);
  const axeMove = (m: AxeMove): Track => ({ name: m.name, long: endOfAxe(m), loops: m.loop !== undefined, from: m.loop ?? 0, hit: m.hit, paint: (t, side) => p(m, t, side) });
  const struck = heavyMoves(weapon);
  let hold: Track;
  if (weapon === 'axe') {
    // (thrown at its hit, out and back in AXE_FLIGHT.time: braced until then, then caught; the catch's moment is its start)
    const out = AXE_THROW.hit ?? 0;
    const throwEnd = endOfAxe(AXE_THROW);
    const back = out + AXE_FLIGHT.time;
    const braced = endOfAxe(AXE_BRACED);
    hold = {
      name: 'The thrown axe: thrown, braced while it flies, caught',
      long: back + endOfAxe(AXE_CATCH),
      loops: false,
      from: 0,
      hit: out,
      paint: (t, side) => {
        if (t < throwEnd) return p(AXE_THROW, t, side);
        if (t < back) return p(AXE_BRACED, braced > 1e-6 ? (t - throwEnd) % braced : 0, side);
        return p(AXE_CATCH, t - back, side);
      },
    };
  } else hold = axeMove(HAMMER_QUAKE);
  return {
    cls: 'warrior',
    sides: WU_SIDES,
    stand: axeMove(weapon === 'axe' ? AXE_STAND : HAMMER_STAND),
    run: axeMove(weapon === 'axe' ? AXE_RUN : HAMMER_RUN),
    tap: axeMove(weapon === 'axe' ? AXE_CLEAVE : HAMMER_SMASH),
    hold,
    lurch: axeMove(struck.lurch),
    reel: axeMove(struck.reel),
    idleFps: 30,
    walkFps: 30,
    clipFps: 30,
    eye: eyesWarrior,
    heavy: false,
  };
}
function ranger(): HeroGlass {
  const p = (m: Move3, t: number, side: string): Sculpted => upFrame(paintRuMove(m, t, side as never, null));
  return {
    cls: 'ranger',
    sides: WU_SIDES,
    stand: move3(RU_STAND3, p),
    run: move3(RU_RUN3, p),
    tap: move3(RU_SHOT3, p),
    hold: move3(RU_VOLLEY3, p),
    lurch: move3(RU_LURCH3, p),
    reel: move3(RU_REEL3, p),
    idleFps: 30,
    walkFps: 60,
    clipFps: 30,
    walkStride: RU_RUN3.stride,
    eye: eyesDark,
    heavy: false,
  };
}
function mage(): HeroGlass {
  const p = (m: Move3, t: number, side: string): Sculpted => upFrame(paintMuMove(m, t, side as never, null));
  const M = MU_MOVES;
  return {
    cls: 'mage',
    sides: WU_SIDES,
    stand: move3(M.mstand, p),
    run: move3(M.mrun, p),
    tap: move3(M.wave, p),
    hold: move3(M.orb, p),
    lurch: move3(M.mlurch, p),
    reel: move3(M.mreel, p),
    idleFps: 30,
    walkFps: 60,
    clipFps: 30,
    walkStride: M.mrun.stride,
    eye: eyesDark,
    heavy: false,
  };
}
function tinkerer(): HeroGlass {
  const moves = tinkerMoves();
  const named = (start: string): TinkMove => {
    const m = moves.find((x) => x.name.startsWith(start));
    if (!m) throw new Error(`reflections_up: no move of hers called ${start}`);
    return m;
  };
  const stand = named('Standing');
  const run = named('Running');
  const tap = named('Tap');
  // (her tap as the game shows it: the vial toss, a vial of hers in her fist from when it is off her belt to when she lets it go)
  const toss: TinkMove = { ...tap, name: 'Tap: a vial tossed', hold: (t) => ({ wrench: 0, twirl: false, spin: 0, vial: t >= TAP_GRAB && t < TAP_LET_GO ? 1 : 0, held: null }) };
  const track = (name: string, m: () => TinkMove, hit?: number, drawn = drawTinkerAt, round?: number): Track => ({
    name,
    get long() {
      return round ?? m().long;
    },
    get loops() {
      return m().loops;
    },
    from: 0,
    hit,
    paint: (t, side) => lastDrawn(() => drawn('front', m(), t, MORE_TURN[side as MoreSide]), CANVAS3.ax, CANVAS3.ay + (m().tall ?? 0)),
  });
  const reel = tinkerReel();
  const lurch = tinkerLurch();
  return {
    cls: 'tinkerer',
    sides: EIGHT_MORE.tinkerer ? MORE_SIDES : ['front', 'back'],
    stand: track(stand.name, () => stand, undefined, drawTinkerAt, TSTAND_LONG),
    run: track(run.name, () => run, undefined, drawTinkerAt, TRUN_ROUND),
    tap: track(toss.name, () => toss, TAP_LET_GO),
    // (HER HOLD IS HER VIALS TOO, his word of 12 Nov 2026, shown her copy whistling for a Golem that is not there: “I think just
    // have the tinkerer throw her vials if there’s no golem”: her toss, three vials thrown: game/act1_rules/reflection.ts UP)
    hold: track('Tap and hold: three vials tossed', () => toss, TAP_LET_GO),
    lurch: track(lurch.name, () => lurch),
    reel: track(reel.name, () => reel),
    idleFps: 10,
    walkFps: 60,
    clipFps: 30,
    walkStride: TRUN_ROUND * (run.travel ?? 0),
    eye: (c) => c.toLowerCase() === '#1a0c1a',
    heavy: true,
  };
}
function brawler(): HeroGlass {
  const track = (m: VetMotion, loops: boolean): Track => {
    const hit = m.strikes.length ? Math.min(...m.strikes.map((s) => s.at)) / VFPS : undefined;
    return {
      name: m.name,
      long: m.long / VFPS,
      loops,
      from: 0,
      hit,
      frames: m.long,
      paint: (t, side) => {
        // (his frames are whole frames of his art's moves: the nearest at or before the moment)
        const f = Math.min(m.long - 1, Math.max(0, Math.floor(t * VFPS + 1e-6)));
        const { pose, turn } = vetPoseAt(side as MoreSide, m, f);
        const d = paintVeteran(pose, turn);
        return { px: d.px.clone(), lights: [], d, sc: d.fig.sc, ax: VET_CANVAS.ax, ay: VET_CANVAS.ay };
      },
    };
  };
  return {
    cls: 'brawler',
    sides: EIGHT_MORE.brawler ? MORE_SIDES : ['front', 'back'],
    stand: track(VET_STAND, true),
    run: track(VET_RUN, true),
    tap: track(motionById('jab'), false),
    hold: track(motionById('roundkick'), false),
    lurch: track(motionById('hurt'), false),
    reel: track(motionById('hurt'), false),
    idleFps: VFPS,
    walkFps: VFPS,
    clipFps: VFPS,
    walkStride: VET_RUN_STRIDE,
    // (his good eye, and his milky one: both the Hush's pink in his glass)
    eye: (c) => ['#120a16', '#d4d6de', '#8c90a0'].includes(c.toLowerCase()),
    heavy: true,
  };
}
function warlock(): HeroGlass {
  const [stand, run] = warlockMoves();
  const spells = warlockSpells();
  const named = (start: string) => {
    const m = spells.find((x) => x.name.startsWith(start));
    if (!m) throw new Error(`reflections_up: no spell of his called ${start}`);
    return m;
  };
  const bolt = named('Tap: hellfire bolt');
  const curse = named('Tap and hold: the Curse');
  const reel = warlockReel();
  const lurch = warlockLurch();
  const track = (m: WarlockMove, hit?: number, round?: number): Track => ({
    name: m.name,
    long: round ?? m.long,
    loops: m.loops,
    from: 0,
    hit,
    paint: (t, side) => lastDrawn(() => drawWarlockAt(side as GameView, m, t), CANVAS3.ax, CANVAS3.ay),
  });
  return {
    cls: 'warlock',
    sides: ['front', 'back'],
    stand: track(stand, undefined, WARLOCK_STAND),
    run: track(run, undefined, WARLOCK_RUN),
    tap: track(bolt, BOLT_HIT),
    hold: track(curse, CURSE_HIT),
    lurch: track(lurch),
    reel: track(reel),
    idleFps: 10,
    walkFps: 60,
    clipFps: 30,
    walkStride: GRIP_SPEED * WARLOCK_RUN,
    // (his eyes lit under his hood: the kit's cyan, now the Hush's pink)
    eye: (c) => ['#b8fff8', '#0c6a80'].includes(c.toLowerCase()),
    heavy: true,
  };
}

/** Each hero, made the first time it is wanted. */
const HEROES: Record<ClassId, () => HeroGlass> = { warrior, ranger, mage, tinkerer, brawler, warlock };
const madeHero = new Map<ClassId, HeroGlass>();
export function heroGlass(cls: ClassId): HeroGlass {
  let h = madeHero.get(cls);
  if (!h) madeHero.set(cls, (h = HEROES[cls]()));
  return h;
}
/** The class of each of the rules' forms (game/act1_rules/reflection.ts FORM_OF, WEAPON_FORM). */
export const FORM_CLASS: readonly ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler', 'warrior', 'warrior'];
const madeForm = new Map<number, HeroGlass>();
/** The hero a reflection of a form is made from: his class's, and the Warrior with his war axe or his maul. */
export function formGlass(form: number): HeroGlass {
  if (form === WEAPON_FORM.axe || form === WEAPON_FORM.hammer) {
    let h = madeForm.get(form);
    if (!h) madeForm.set(form, (h = warriorWith(form === WEAPON_FORM.axe ? 'axe' : 'hammer')));
    return h;
  }
  return heroGlass(FORM_CLASS[form] ?? 'warrior');
}

// =============================================================================================
// ITS PICTURES

/** Where the sheen has got to at a moment of a move (0..1): a whole number of times round in a loop, so it never jumps; once over a blow. */
export function sheenOf(tr: Track, t: number): number {
  const long = tr.loops ? tr.long - tr.from : tr.long;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / 1.2));
  const k = ((t - (tr.loops ? tr.from : 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}
/** HIS REFLECTION AT A MOMENT OF A MOVE, from a side: his frame, turned to glass. */
export function glassAt(h: HeroGlass, tr: Track, t: number, side: string): Glassed {
  return glassUp(tr.paint(t, side), h.eye, sheenOf(tr, t));
}
/** Its pool of light: the enemy's pink one, where his is (a side that faces left has its floor point the other way). */
function poolAt(ax: number, ay: number): Light {
  const dx = REFLECTION_POOL.x - CANVAS3.ax;
  return { ...REFLECTION_POOL, x: ax + (ax === CANVAS3.ax || ax === VET_CANVAS.ax ? dx : -dx), y: ay + (REFLECTION_POOL.y - CANVAS3.ay) };
}
export function glassSprite(h: HeroGlass, tr: Track, t: number, side: string): Sprite {
  const g = glassAt(h, tr, t, side);
  return toSprite(g, poolAt(g.ax, g.ay), g.ax, g.ay);
}
/** A glass frame laid on the heroes' canvas (CANVAS3), its feet at that canvas's floor point (for its stepping out and its shattering, made on that canvas). */
export function onHeroCanvas(g: Glassed): Painted {
  const out = new Px(CANVAS3.w, CANVAS3.h);
  const ox = CANVAS3.ax - g.ax;
  const oy = CANVAS3.ay - g.ay;
  const s = g.px.d;
  const o = out.d;
  for (let y = 0; y < g.px.h; y++) {
    const Y = y + oy;
    if (Y < 0 || Y >= CANVAS3.h) continue;
    for (let x = 0; x < g.px.w; x++) {
      const X = x + ox;
      if (X < 0 || X >= CANVAS3.w) continue;
      const i = (y * g.px.w + x) * 4;
      if (s[i + 3] === 0) continue;
      const j = (Y * CANVAS3.w + X) * 4;
      o[j] = s[i];
      o[j + 1] = s[i + 1];
      o[j + 2] = s[i + 2];
      o[j + 3] = s[i + 3];
    }
  }
  return { px: out, lights: g.lights.map((l) => ({ ...l, x: l.x + ox, y: l.y + oy })) };
}

/** A REFLECTION'S PICTURES FROM ONE SIDE: what it does in the game (the head of this file), from the hero's own moves. */
export function glassSet(h: HeroGlass, side: string): AnimSet {
  const at = (tr: Track) => (t: number): Sprite => glassSprite(h, tr, t, side);
  const round = (tr: Track, fps: number): Sprite[] => {
    const n = Math.max(1, Math.round((tr.long - tr.from) * fps));
    return lazyFrames(n, (i) => at(tr)(tr.from + i / fps), h.heavy);
  };
  const clip = (tr: Track, fps: number): Clip => {
    const n = tr.frames ?? Math.max(1, Math.ceil(tr.long * fps - 1e-6) + 1);
    const c: Clip = { frames: lazyFrames(n, (i) => at(tr)(Math.min(tr.long, i / fps)), h.heavy), fps };
    if (tr.hit !== undefined) c.hit = tr.hit;
    return c;
  };
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(h.tap, h.clipFps);
  const heavy = clip(h.hold, h.clipFps);
  const set: AnimSet = { idle: round(h.stand, h.idleFps), walk: round(h.run, h.walkFps), attack: three(attack), heavy: three(heavy), idleFps: h.idleFps, walkFps: h.walkFps, clips: { attack, heavy } };
  if (h.walkStride !== undefined) set.walkStride = h.walkStride;
  const clips = set.clips as NonNullable<AnimSet['clips']>;
  // ITS SHATTERING (art/reflections_fx.ts), from its picture as it is struck
  const nDie = Math.round(SHATTER.time * SHATTER.fps) + 1;
  let from: Painted | null = null;
  const source = (): Painted => (from ??= onHeroCanvas(glassAt(h, h.reel, Math.min(0.1, h.reel.long), side)));
  clips.die = { frames: lazyFrames(nDie, (i) => toSprite(shatterPainted(source(), i / (nDie - 1)), null, SHATTER_CANVAS.ax, SHATTER_CANVAS.ay), h.heavy), fps: SHATTER.fps };
  // ITS STEPPING OUT OF A MIRROR, from in front (art/reflections_fx.ts): its stand, then its own stumble forward, played slower
  if (side === 'front') {
    const n = Math.round(STEP_OUT.time * STEP_OUT.fps) + 1;
    const src = { lurchLong: h.lurch.long, fig: (which: 'stand' | 'lurch', t: number): Painted => onHeroCanvas(glassAt(h, which === 'lurch' ? h.lurch : h.stand, which === 'lurch' ? Math.min(t, h.lurch.long) : t, 'front')) };
    const pool: Light = { ...REFLECTION_POOL, x: REFLECTION_POOL.x + STEP_CANVAS.ax - CANVAS3.ax, y: REFLECTION_POOL.y + STEP_CANVAS.ay - CANVAS3.ay };
    const step: Clip = { frames: lazyFrames(n, (i) => toSprite(stepOutPainted(h.cls, i / STEP_OUT.fps, GALLERY_MIRROR, src), i / STEP_OUT.fps >= STEP_OUT.until ? pool : null, STEP_CANVAS.ax, STEP_CANVAS.ay), h.heavy), fps: STEP_OUT.fps };
    clips.moves = { ...(clips.moves ?? {}), stepOut: step };
  }
  return set;
}

/**
 * YOUR REFLECTIONS' PICTURES, THE HEROES AS THEY LOOK NOW: `of(cls)` the glass copy of that hero, from every side he has (the
 * game shows the side for the way it faces, as it does the hero's: art/sides.ts).
 */
export function makeReflectionUpArt(): { of(cls: ClassId): ActorArt; ofForm(form: number): ActorArt } {
  const made = new Map<HeroGlass, ActorArt>();
  const art = (h: HeroGlass): ActorArt => {
    let a = made.get(h);
    if (!a) {
      const all: Record<string, AnimSet> = {};
      for (const side of h.sides) all[side] = glassSet(h, side);
      a = all as unknown as ActorArt;
      made.set(h, a);
    }
    return a;
  };
  return {
    of: (cls: ClassId): ActorArt => art(heroGlass(cls)),
    /** (THE RULES' FORMS, 0 to FORMS - 1: the six classes, and the Warrior with his war axe and his maul) */
    ofForm: (form: number): ActorArt => art(formGlass(Math.max(0, Math.min(FORMS - 1, form)))),
  };
}

/** (For the checks: a colour's hue and saturation, as the first reflections measure them.) */
export { hueOf };
