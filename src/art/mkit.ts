// The monsters' side of the painter's kit (Version 14): the colours of what is hostile, and the
// two helpers every monster's art is put together with.
//
// The owner, 4 Oct 2026: "we need the dungeons and mobs brought up to the level of the character
// models". So the monsters are painted the way the heroes are (art/kit.ts: a rig that paints one
// frame from a Pose, at twice the grain of the first builds' art, flat colour in three tones, no
// outline, the seam between two parts the deep indigo of the world) and move the way the heroes
// do (a standing loop, a walk, and an attack that is a timeline of key poses).
//
// WHAT THEY LOOK LIKE IS NOT NEW. The owner chose this art style from a sheet that showed four of
// the monsters painted in it (previews/art_styles_1_and_6.png, "6 Bold and modern": the skeleton
// in src/dev/styles.ts, the cultist, the bat and the brute in src/dev/styles_cast.ts, each as one
// standing figure in the look called `neon`). Those paintings are the designs; the rigs here
// make them move, and give them a back.
//
// One rule sets them apart from the heroes at a glance, and it is the sheet's own: WHAT GLOWS ON
// A HERO IS CYAN (kit.ts: GLINT, SPARK, the lit blade); WHAT GLOWS ON AN ENEMY IS HOT PINK,
// BURNING TO GOLD (SOCKET in an eye, FLAME in a hand or on a rune).

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt, AnimSet } from './actor_types';
import type { Key, Timeline } from './clip';
import { CLIP_FPS, KAX, KAY, REST, animSet, edge, hash, paintedFrames } from './kit';
import type { Moves, Painted, Pose, Ramp, Rig, RigOpts } from './kit';

// ---------------------------------------------------------------------------------------------
// The colours, as the sheet has them (the look `neon`). A Ramp is five tones, dark to light; the
// style uses three ([0] = [1], [3] = [4]) unless a thing is lit from inside. kit.ts has the rest:
// BONE (the dead), TEAL (the rag a skeleton wears), PINK (a cultist's stole), PLUM (leather),
// INDIGO (wood, in this world), STEEL and MAIL, INK (the seam, and the dark inside a hood).

/** The light in an enemy's eye sockets (the heroes' is GLINT, cyan). */
export const SOCKET = '#ff4f8a';
/** Fire in an enemy's hand, a rune that burns, hot iron: lit from inside, so five tones. */
export const FLAME: Ramp = ['#7a1058', '#c0206a', '#ff4f8a', '#ffb070', '#fff0a0'];
/** A rusted blade, an old arrowhead, the bands on a club. */
export const RUST: Ramp = ['#3a1848', '#3a1848', '#7a3a78', '#c06aa0', '#c06aa0'];
/** A cultist's robe. */
export const GLOOM: Ramp = ['#1c0c34', '#1c0c34', '#3a1a5c', '#643a8c', '#643a8c'];
/** A brute's hide: slate blue. */
export const FLESH: Ramp = ['#34406a', '#34406a', '#5870a8', '#9ab0e0', '#9ab0e0'];
/** A guardian's hide (the brute at the end of a side path): the same beast, flushed red. */
export const GORE: Ramp = ['#5a1038', '#5a1038', '#b0244e', '#f0647c', '#f0647c'];
/** A bat's fur, and the skin of its wings. */
export const FUR: Ramp = ['#241c5c', '#241c5c', '#3c3490', '#6a62c8', '#6a62c8'];
export const WING: Ramp = ['#5a1050', '#5a1050', '#b0206a', '#f0508a', '#f0508a'];
/** Dark plate: the Warden's armour, a spike, a collar. Darker than a hero's STEEL. */
export const IRON: Ramp = ['#1c1a3a', '#1c1a3a', '#3e3a70', '#7672b0', '#7672b0'];
/** A wound, a scar, a ragged red cloth. */
export const BLOOD: Ramp = ['#4a0c24', '#4a0c24', '#a01838', '#e0485a', '#e0485a'];

/**
 * The pool of light behind a monster, in picture pixels: dimmer than a hero's and pink, so that
 * a dark thing still stands off a dark floor and reads as an enemy before its shape does.
 */
export const MENACE: Light = { x: KAX - 2, y: KAY - 28, r: 40, color: '#ff3a78', a: 0.13 };

/**
 * THE CRISP EDGE OF LIGHT ROUND A LIVING ENEMY (the owner, 6 Oct 2026: "Give the entities a subtle
 * neon glow or a loop crisp 1-pixel border so they pop against the dark dungeon"): one picture
 * pixel of the pink that is in their eyes, part seen through, as the heroes have one of cyan
 * (kit.ts, `edge`). Not on the dying or the dead: the light has gone out of them.
 */
export const ENEMY_RIM = SOCKET;

// ---------------------------------------------------------------------------------------------
// Animations

/**
 * A monster's attack as a timeline: from rest it winds up, HOLDS the wound-up pose (that hold is
 * the player's warning), delivers the blow at `hit`, follows through and comes back to rest.
 *
 * `hit` must be the monster's `windup` in game/defs.ts (MONSTERS): the game waits that long
 * between the start of the attack and its landing, and plays this picture to match (see
 * Renderer.monsterSprite). After the blow the game gives a monster 0.3 s before it does anything
 * else (TUNE.monsterRecover), so the timeline ends 0.3 s after `hit`. (monsterArt then puts the
 * blow on a frame: see onGrid.)
 */
export function strike(hit: number, wound: Partial<Pose>, blow: Partial<Pose>, after: Partial<Pose>): Timeline {
  const keys: Key[] = [
    { at: 0, pose: {} },
    { at: hit * 0.5, pose: wound, ease: 'out' },
    // (held, with the wind still moving in whatever cloth it wears)
    { at: hit * 0.86, pose: { ...wound, wind: (wound.wind ?? 0) + 0.2 }, ease: 'lin' },
    { at: hit, pose: blow, ease: 'in' },
    { at: hit + 0.1, pose: after, ease: 'out' },
    { at: hit + 0.3, pose: { wind: 1 }, ease: 'io' },
  ];
  return { keys, hit };
}

/**
 * The same timeline with its blow ON A FRAME.
 *
 * A clip's frames show the moments 0, 1/30, 2/30 ... of its timeline. A blow at 0.85 s falls
 * between two of them: the pose it was given would never be shown, only one a little short of it
 * and one a little past. So what comes before the blow is stretched or squeezed (by a sixtieth of
 * a second at the most) to put the blow on the nearest frame, and what comes after is moved along
 * with it. The game plays a wind-up by how much of it is done, not by the picture's clock
 * (render/figure.ts: attackFrame, monsterAttackAge), so the blow still lands when the rules say:
 * and now the frame shown in that step is the blow as it was posed.
 */
export function onGrid(t: Timeline, fps = CLIP_FPS): Timeline {
  const was = t.hit;
  if (was === undefined || was <= 0) return t;
  const hit = Math.max(1, Math.round(was * fps)) / fps;
  if (Math.abs(hit - was) < 1e-9) return t;
  return { hit, keys: t.keys.map((k) => ({ ...k, at: k.at <= was ? (k.at * hit) / was : k.at + (hit - was) })) };
}

/** What a monster does besides standing and walking. */
export interface MonsterMoves {
  /** Its attack (see strike). */
  attack: Timeline;
  /** A second attack, for the one monster that has two (the Warden's volley). */
  heavy?: Timeline;
  /** Its other moves, by name (AnimSet.clips.moves: the trolls' swing, the red troll's charge, ...). */
  more?: Readonly<Record<string, Timeline>>;
  /** CRAWLING OUT OF THE GROUND (CRAWL_OUT, crawlOut): its pose `k` (0..1) of the way out, and how tall it stands with its arms up (picture pixels). */
  crawl?: { pose: (k: number) => Partial<Pose>; tall: number };
  /**
   * Its death, seen this way round: what it looks like `k` of the way through, 0 (as it stood
   * when the blow fell) to 1 (its body, lying where it will lie). See DEATH_FPS, and
   * AnimSet.clips.die in actor_types.ts.
   */
  die?: (k: number) => Painted;
}

/**
 * CRAWLING OUT OF THE GROUND (the art chat, 9 Oct 2026). The owner, 9 Oct, of the dead the Warden
 * calls up, shown them putting themselves back together out of their bones: "I’d like them to crawl
 * out of the ground when summoned". So: the floor breaks open into a pit; its hands come up out of it
 * first, clawing (it is posed with its arms up: they are the first of it to come into the light),
 * then its skull; it hauls itself up onto the rim and heaves the rest of itself out, a foot stepping
 * up onto the floor; and the pit closes behind it. Stone is thrown up as the hands break through, and
 * pink motes rise out of the dark. Behind a switch that is off (the main chat turns it on with the
 * Warden's new moves): `CRAWL_OUT`; and made for a monster whose `MonsterMoves.crawl` says how it is
 * posed on the way out. Its clip is `AnimSet.clips.moves.crawl`, CRAWL_TIME long.
 */
export const CRAWL_OUT = { on: false };
export const CRAWL_TIME = 1.4;
export const CRAWL_FPS = 20;

/** The floor's stone, for the pit's rim and the stone thrown up (palette.ts st2, st3, st5, st6). */
const RIM_STONE: Ramp = ['#2a2331', '#2a2331', '#3a3040', '#655868', '#857888'];

function crawlOut(rig: Rig, back: boolean, base: Pose, crawl: { pose: (k: number) => Partial<Pose>; tall: number }, k: number, ax: number, ay: number, rim: string | null): Painted {
  const clamp = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (u: number): number => u * u * (3 - 2 * u);
  const part = (a: number, b: number): number => clamp((k - a) / (b - a));
  // how far down it still is: out of sight, then two heaves (the hands and the skull; the rest of it)
  const heave1 = ease(part(0.12, 0.42));
  const heave2 = ease(part(0.52, 0.82));
  // (between the heaves it struggles on the rim: a wobble)
  const struggle = Math.sin(part(0.42, 0.52) * Math.PI) * 2;
  const depth = Math.round(crawl.tall * (1 - 0.4 * heave1 - 0.6 * heave2) + struggle);
  // (and once out, it settles into its own standing pose)
  const settle = ease(part(0.84, 1));
  const posed: Pose = { ...base, ...crawl.pose(Math.min(k, 0.84)) };
  const numbers = posed as unknown as Record<string, unknown>;
  const rest = base as unknown as Record<string, unknown>;
  for (const f of Object.keys(numbers)) if (typeof numbers[f] === 'number' && typeof rest[f] === 'number') numbers[f] = (numbers[f] as number) + ((rest[f] as number) - (numbers[f] as number)) * settle;
  if (settle >= 1) Object.assign(posed, base);
  const fig = rig(posed, back);
  if (rim) edge(fig.px, rim);
  const W = fig.px.w;
  const H = fig.px.h;
  const out = new Px(W, H);
  // the pit: it opens, stays open while it comes up, and closes once it stands
  const open = ease(part(0, 0.12)) * (1 - ease(part(0.86, 1)));
  const rx = 17 * open;
  const ry = 7 * open;
  const front = (x: number): number => (Math.abs(x + 0.5 - ax) < rx ? ay + ry * Math.sqrt(Math.max(0, 1 - ((x + 0.5 - ax) / rx) ** 2)) : ay);
  if (open > 0.03) {
    // its dark, and its far rim
    for (let y = Math.floor(ay - ry - 1); y <= Math.ceil(ay + ry + 1); y++) {
      for (let x = Math.floor(ax - rx - 1); x <= Math.ceil(ax + rx + 1); x++) {
        const u = (x + 0.5 - ax) / rx;
        const v = (y + 0.5 - ay) / ry;
        const d = u * u + v * v;
        if (d > 1) continue;
        out.set(x, y, d > 0.72 && v < 0 ? RIM_STONE[2] : '#07050a');
      }
    }
  }
  // the figure, sunk `depth`, cut off by the pit's near edge (and by the floor beside it)
  for (let y = 0; y < H; y++) {
    const ny = y + depth;
    if (ny >= H) continue;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (fig.px.d[i + 3] === 0) continue;
      if (depth > 0 && ny > front(x)) continue;
      const j = (ny * W + x) * 4;
      out.d[j] = fig.px.d[i];
      out.d[j + 1] = fig.px.d[i + 1];
      out.d[j + 2] = fig.px.d[i + 2];
      out.d[j + 3] = fig.px.d[i + 3];
    }
  }
  if (open > 0.03) {
    // the pit's near rim, over it: broken stone
    for (let x = Math.floor(ax - rx); x <= Math.ceil(ax + rx); x++) {
      const y = Math.round(front(x));
      out.set(x, y, RIM_STONE[3]);
      if (hash(x, 3, 71) < 0.5) out.set(x, y + 1, RIM_STONE[2]);
      if (hash(x, 5, 72) < 0.25) out.set(x, y - 1, RIM_STONE[4]);
    }
    // stone thrown up as its hands break through, falling back
    const burst = part(0.14, 0.5);
    if (burst > 0 && burst < 1) {
      for (let n = 0; n < 9; n++) {
        const a = (hash(n, 1, 73) - 0.5) * 2.6 - Math.PI / 2;
        const sp = 18 + hash(n, 2, 73) * 22;
        const t = burst * 0.55;
        const x = Math.round(ax + Math.cos(a) * sp * t * 1.4);
        const y = Math.round(ay - 2 + Math.sin(a) * sp * t + 70 * t * t);
        if (y < ay + 4) {
          out.set(x, y, RIM_STONE[hash(n, 3, 73) < 0.5 ? 3 : 4]);
          if (hash(n, 4, 73) < 0.4) out.set(x + 1, y, RIM_STONE[2]);
        }
      }
    }
    // pink motes rising out of the dark
    for (let n = 0; n < 6; n++) {
      const ph = (k * 2.2 + n / 6) % 1;
      const x = Math.round(ax - rx * 0.7 + hash(n, 6, 74) * rx * 1.4);
      const y = Math.round(ay - ph * 26);
      if (open > 0.3) out.set(x, y, ph < 0.5 ? FLAME[3] : FLAME[2]);
    }
  }
  // its lights where they are now, if they are out of the ground
  const lights: Light[] = [];
  for (const l of fig.lights) {
    const ly = l.y + depth;
    if (depth > 0 && ly > front(Math.round(l.x))) continue;
    lights.push({ ...l, y: ly });
  }
  if (open > 0.3) lights.push({ x: ax, y: ay - 6, r: 18, color: FLAME[2], a: 0.25 * open });
  return { px: out, lights };
}

/** Frames a second of a death, and how long one takes unless its figure says otherwise (seconds). */
export const DEATH_FPS = 20;
export const DEATH_TIME = 0.8;

/**
 * A canvas of a figure's own, for one that does not fit the kit's 112 x 112 (the brute with its
 * club over its head, the Warden): its size, and the floor point under the figure on it. Such a
 * rig makes its layers with `new Px(w, h)` and measures from (ax, ay) where the kit's figures
 * measure from (KX, KAY); the kit's forms, lit and compose work on any size.
 */
export interface Canvas {
  w: number;
  h: number;
  ax: number;
  ay: number;
}

/** How a monster's art is put together, where it differs from the usual. */
export interface MonsterOpts {
  /** The rig paints on a canvas of its own (see Canvas). */
  canvas?: Canvas;
  /** The pose with nothing going on (where the weapon hangs). */
  rest?: Partial<Pose>;
  /** The pool of light behind it, in picture pixels on the canvas: MENACE unless given; null for none. */
  aura?: Light | null;
  /** The crisp edge of light round it while it lives: ENEMY_RIM unless given; null for none. */
  rim?: string | null;
  /**
   * Frames a second of the standing loop (twelve frames: ten a second unless given) and of the
   * walk (eight frames, two steps: sixteen a second unless given). Something heavy steps more
   * slowly; something that flaps does everything faster.
   */
  idleFps?: number;
  walkFps?: number;
  /** How long its death takes, in seconds (DEATH_TIME unless given: something big takes longer to fall). */
  dieTime?: number;
  /**
   * A walk of its own, in place of the kit's (eight poses, two steps: kit.ts, walkPoses). The
   * owner, 6 Oct 2026: "I want enemies to look natural. An undead skeleton is plodding and
   * brittle". How a thing moves says what it is before its shape does.
   */
  walk?: Partial<Pose>[];
}

/**
 * A monster's art from its rig: both facings, the standing loop and the walk from the kit's own
 * poses (kit.ts: idlePoses, walkPoses), the attack from its timeline.
 */
export function monsterArt(rig: Rig, front: MonsterMoves, back: MonsterMoves, opts: MonsterOpts = {}): ActorArt {
  const aura = opts.aura === undefined ? MENACE : opts.aura;
  const set = (m: MonsterMoves, away: boolean): AnimSet => {
    const moves: Moves = m.heavy ? { attack: onGrid(m.attack), heavy: onGrid(m.heavy) } : { attack: onGrid(m.attack) };
    if (m.more) {
      const more: Record<string, Timeline> = {};
      for (const [name, t] of Object.entries(m.more)) more[name] = onGrid(t);
      moves.more = more;
    }
    if (opts.walk) moves.walk = opts.walk;
    const rim = opts.rim === undefined ? ENEMY_RIM : opts.rim;
    const look: RigOpts = opts.canvas ? { aura, anchor: [opts.canvas.ax, opts.canvas.ay] } : { aura };
    if (rim) look.rim = rim;
    const s = animSet(rig, away, opts.rest ?? {}, moves, look);
    if (opts.idleFps !== undefined) s.idleFps = opts.idleFps;
    if (opts.walkFps !== undefined) s.walkFps = opts.walkFps;
    if (m.crawl && CRAWL_OUT.on) {
      const crawl = m.crawl;
      const [ax, ay] = opts.canvas ? [opts.canvas.ax, opts.canvas.ay] : [KAX, KAY];
      const base: Pose = { ...REST, ...(opts.rest ?? {}) };
      const rimC = opts.rim === undefined ? ENEMY_RIM : opts.rim;
      const frames = paintedFrames(Math.round(CRAWL_TIME * CRAWL_FPS) + 1, (k) => crawlOut(rig, away, base, crawl, k, ax, ay, rimC), { aura: null, anchor: [ax, ay] });
      s.clips = { ...s.clips, moves: { ...(s.clips?.moves ?? {}), crawl: { frames, fps: CRAWL_FPS } } };
    }
    if (m.die) {
      // (a dying thing has no pool of light behind it)
      const frames = paintedFrames(Math.max(2, Math.round((opts.dieTime ?? DEATH_TIME) * DEATH_FPS) + 1), m.die, opts.canvas ? { aura: null, anchor: [opts.canvas.ax, opts.canvas.ay] } : { aura: null });
      s.clips = { ...s.clips, die: { frames, fps: DEATH_FPS } };
    }
    return s;
  };
  return { front: set(front, false), back: set(back, true) };
}
