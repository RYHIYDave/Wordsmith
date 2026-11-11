// THE WARRIOR'S BATTLE AXE AND WARHAMMER, THE LAST PIECES (the art chat's helper, 11 Nov 2026; docs/mockups/warrior_weapons/
// README.md, step 3). A MOCK-UP BEHIND A SWITCH THAT IS OFF (art/warrior_up_weapons.ts WARRIOR_WEAPONS): nothing of the game
// imports this file (tests/warrior_weapons.test.ts holds it).
//
// All the bake takes of him with either weapon, in the shape the game holds his great sword's (art/warrior_up_art.ts
// makeWarriorUpArt: a dungeon, town, his card), the weapon in place of the sword:
//   IN A DUNGEON  his moves with it (art/warrior_up_axe_moves.ts makeWarriorAxeArt, art/warrior_up_hammer_moves.ts
//                 makeWarriorHammerArt); STRUCK from in front and from behind and HIS FALL: the game's own (WU_REEL3, WU_LURCH3,
//                 WU_FALL3), his body and legs frame for frame, both hands keeping it in his guard as he is struck, and in his
//                 right hand alone as he falls, where his sword is; with the axe, his run empty-handed while it flies and the
//                 catch on the run (his word of 9 Nov, 22:37: “Yes he can move.  Yes leaping chop can”)
//   IN TOWN AND ON HIS CARD  the game's own (WU_TOWN3, WU_TOWN_RUN3, and on his card's front WU_LOOK3 and WU_DRAW3), the weapon
//                 ON HIS BACK as step 1 drew it (art/warrior_up_weapons.ts TOWN_HEAVY), and drawn from there into his guard

import type { Light, Sprite } from '../engine/px';
import type { AnimSet, Clip } from './actor_types';
import { lazyFrames, lightsOut, toSprite } from './kit';
import type { Move3 } from './moves3';
import { CANVAS3 } from './skin';
import type { Bones, Posed } from './skeleton';
import { WU_SIDES } from './warrior_up';
import type { WuSide } from './warrior_up';
import { WU_GAME_FPS, wuPosed } from './warrior_up_art';
import { WU_DRAW3, WU_FALL3, WU_LOOK3, WU_LURCH3, WU_REEL3, WU_TOWN3, WU_TOWN_RUN3 } from './warrior_up_moves';
import { leftHandOn } from './warrior_up_weapons';
import type { WeaponTake } from './warrior_up_weapons';
import { AXE, AXE_RUN_CATCH, AXE_RUN_EMPTY, AXE_TWIN_RUN_CATCH, armsOn, axePosed, heavyKit, heavyRest, makeWarriorAxeArt, paintAxe } from './warrior_up_axe_moves';
import type { AxeMove } from './warrior_up_axe_moves';
import { MAUL, makeWarriorHammerArt } from './warrior_up_hammer_moves';

const FPS = 30;
/** The pool of light behind him, as behind every hero (art/warrior_up_art.ts AURA). */
const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
/** How long his draw is shown standing ready at least, and held after (art/warrior_up_art.ts READY_LEAST, READY_HELD). */
const READY_LEAST = 1;
const READY_HELD = 0.3;
/** In his fall his left hand leaves the haft and goes to his left knee (from his left shoulder: forward, to his left, up). */
const FALL_LEFT: Partial<Bones> = { lhIn: 1, lhx: 7, lhy: 3, lhz: -15, le: -10 };

/** Which heavy weapon. */
export type HeavyWeapon = 'axe' | 'hammer';
const TAKE: Record<HeavyWeapon, WeaponTake> = { axe: AXE, hammer: MAUL };

/**
 * ONE OF THE GAME'S OWN MOVES OF HIS, with a heavy weapon in place of his sword: his bones as the game's move has them, frame for
 * frame; `guard`: his arms keep it in his guard (both hands, as he stands with it) as his body is thrown about; `own`: his arms
 * as the game's move has them, the weapon in his right hand where the sword is, or on his back where it is put away.
 */
export function heavyOf(m: Move3, take: WeaponTake, arms: 'guard' | 'own' | 'fall' | 'draw', elbow = 0): AxeMove {
  const rest = heavyRest(take);
  const guard = { ...rest } as unknown as Posed;
  const kit = heavyKit(take, rest, take.kind === 'axe');
  const butt = leftHandOn(take);
  /** (the moment the game's draw has the sword off his back) */
  let drawn = Infinity;
  if (arms === 'draw') for (let f = 0; f < 120; f++) if (wuPosed(m, f / FPS).q.stow <= 0.5) { drawn = f / FPS; break; }
  const loop = m.motion.loop;
  return {
    name: `${m.name}, with ${take.kind === 'axe' ? 'the war axe' : 'the maul'}`,
    take,
    rest,
    keys: m.motion.keys.map((k) => ({ at: k.at, ease: k.ease, pose: {} as Partial<Bones>, grip: arms === 'fall' ? butt + 0 : 0 })),
    hit: m.motion.hit,
    loop,
    pose: (t) => {
      const q = wuPosed(m, t).q;
      // (struck: his guard kept, his right elbow swung `elbow` degrees from where it is in his guard, so that his forearm comes to
      // the haft across it as his body is thrown about)
      if (arms === 'guard') return armsOn(q, { ...guard, re: guard.re + elbow } as Posed);
      // (drawn: off his back and straight into his guard, both hands on it, from the moment his hand is at it, two frames
      // before the game's sword leaves his back: his hand would else go into its head there)
      if (arms === 'draw' && t >= drawn - 2 / FPS) return armsOn({ ...q, stow: 0 }, { ...guard, re: guard.re + 45 } as Posed);
      if (arms === 'own' || arms === 'draw' || q.stow > 0.5) return q;
      // (his fall: his arms and his great sword's way as the game's fall has them, both hands on the weapon, his left at its butt
      // as in his guard, its edge or face turned as near down as it will go)
      return { ...q, ...(q.lhIn === 3 ? FALL_LEFT : {}), ...kit.aim(q.wAz + 25, q.wEl + 35, [0, 0, -1], q.wRoll) } as Posed;
    },
  };
}

/** The game's moves of his, made with each weapon. */
export function heavyMoves(weapon: HeavyWeapon): Record<string, AxeMove> {
  const take = TAKE[weapon];
  return {
    reel: heavyOf(WU_REEL3, take, 'guard', 15),
    lurch: heavyOf(WU_LURCH3, take, 'guard', -15),
    fall: heavyOf(WU_FALL3, take, 'fall'),
    town: heavyOf(WU_TOWN3, take, 'own'),
    townRun: heavyOf(WU_TOWN_RUN3, take, 'own'),
    look: heavyOf(WU_LOOK3, take, 'own'),
    draw: heavyOf(WU_DRAW3, take, 'draw'),
  };
}

/** A frame as the game holds it, his lights put out as the game's fall puts them out (art/warrior_up_art.ts wuSprite). */
export function heavySprite(m: AxeMove, t: number, side: WuSide): Sprite {
  let f = paintAxe(m, t, side);
  const out = axePosed(m, t).q.out ?? 0;
  if (out > 0.01) f = { ...f, ...lightsOut(f, out) };
  const aura = { ...AURA, x: f.ax + (f.ax === CANVAS3.ax ? AURA.x - CANVAS3.ax : CANVAS3.ax - AURA.x) };
  const pool = out >= 0.98 ? null : out > 0.01 ? { ...aura, a: (aura.a ?? 1) * (1 - out) } : aura;
  return toSprite(f, pool, f.ax, f.ay);
}

function lists(side: WuSide) {
  const at = (m: AxeMove, t: number): Sprite => heavySprite(m, t, side);
  const end = (m: AxeMove): number => m.keys[m.keys.length - 1].at;
  const round = (m: AxeMove, fps: number): Sprite[] => {
    const t0 = m.loop ?? 0;
    const n = Math.max(1, Math.round((end(m) - t0) * fps));
    return lazyFrames(n, (i) => at(m, t0 + i / fps));
  };
  const clip = (m: AxeMove, fps = FPS, t0 = 0, t1 = end(m)): Clip => {
    const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
    const c: Clip = { frames: lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / fps))), fps };
    if (m.hit !== undefined && m.hit >= t0 && m.hit <= t1) c.hit = m.hit - t0;
    if (m.loop !== undefined) c.loop = m.loop - t0;
    return c;
  };
  return { round, clip };
}

/**
 * HIS PICTURES WITH A HEAVY WEAPON, for a place (a dungeon, town, his card), from all eight of his sides, in the shape the game
 * holds his great sword's (art/warrior_up_art.ts makeWarriorUpArt). In a dungeon: his moves with it, and `clips.reel`,
 * `clips.lurch` and `clips.fall` (and with the axe, under `clips.moves`: `runEmpty`, `runCatch`, `twinRunCatch`). In town and on
 * his card: `idle` and `walk` with it on his back, and on the front side `clips.idleA` (he looks about him) and `clips.ready`
 * (he draws it into his guard).
 */
export function makeWarriorHeavyArt(weapon: HeavyWeapon, place: 'dungeon' | 'town' | 'card'): Record<WuSide, AnimSet> {
  const moves = heavyMoves(weapon);
  const fights = place === 'dungeon' ? (weapon === 'axe' ? makeWarriorAxeArt() : makeWarriorHammerArt()) : null;
  const out = {} as Record<WuSide, AnimSet>;
  for (const side of WU_SIDES) Object.defineProperty(out, side, { enumerable: true, configurable: true, get: () => {
    const { round, clip } = lists(side);
    let set: AnimSet;
    if (fights) {
      const own = fights[side];
      const clips = { ...(own.clips ?? {}), reel: clip(moves.reel), lurch: clip(moves.lurch), fall: clip(moves.fall) } as NonNullable<AnimSet['clips']>;
      if (weapon === 'axe') {
        clips.moves = { ...(clips.moves ?? {}), runEmpty: { frames: round(AXE_RUN_EMPTY, FPS), fps: FPS, loop: 0 }, runCatch: clip(AXE_RUN_CATCH), twinRunCatch: clip(AXE_TWIN_RUN_CATCH) };
      }
      set = { ...own, clips };
    } else {
      set = { idle: round(moves.town, WU_GAME_FPS.idle), walk: round(moves.townRun, WU_GAME_FPS.run), attack: [], heavy: [], idleFps: WU_GAME_FPS.idle, walkFps: WU_GAME_FPS.run, clips: {} };
      if (WU_TOWN_RUN3.stride !== undefined) set.walkStride = WU_TOWN_RUN3.stride;
      if (side === 'front') {
        const drawEnd = moves.draw.keys[moves.draw.keys.length - 1].at;
        const clips = set.clips as NonNullable<AnimSet['clips']>;
        clips.idleA = clip(moves.look, WU_GAME_FPS.gesture);
        clips.ready = clip(moves.draw, FPS, 0, Math.min(drawEnd, Math.max(READY_LEAST, (WU_DRAW3.ready ?? drawEnd) + READY_HELD)));
      }
    }
    Object.defineProperty(out, side, { value: set, enumerable: true });
    return set;
  } });
  return out;
}
