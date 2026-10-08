// Animations as timelines.
//
// Until Version 11 an attack was three poses. The owner asked for more ("I want the animations to
// be really slick ... attacks swinging, bows drawing and firing"), so an animation is now a short
// list of KEYS: the poses that matter (rest, wound up, the blow, followed through, rest again) and
// the moment each is reached. The frames between the keys are worked out here, thirty to the
// second, by moving every number of the pose from one key toward the next, each segment with its
// own easing (a wind-up slows into its key; a blow speeds out of it).
//
// The rigs still paint one frame from one Pose; this file only decides which Poses.

import type { Pose } from './kit';

/** How a segment is travelled. */
export type Ease =
  /** At an even pace. */
  | 'lin'
  /** Starting slowly and speeding up: a blow leaving its wind-up. */
  | 'in'
  /** Starting fast and slowing: settling into a pose. */
  | 'out'
  /** Slow at both ends. The default. */
  | 'io'
  /** Not at all: the old pose is held until the key's moment, then it jumps. */
  | 'hold'
  /** Past the key and back to it: a little overshoot (a tenth too far, a little over half way), for things that stop hard. */
  | 'back';

export interface Key {
  /** Seconds from the start of the animation. */
  at: number;
  /** The pose reached at that moment. What it does not name is as the rest pose has it. */
  pose: Partial<Pose>;
  /** How the figure gets here from the key before. */
  ease?: Ease;
}

/** A whole animation. */
export interface Timeline {
  keys: ReadonlyArray<Key>;
  /** For an attack: the moment the blow lands (the arrow leaves, the spell goes off), in seconds from the start. */
  hit?: number;
  /** For a move that is held: the moment its loop begins. What comes before is played once; from here to the end goes round and round. */
  loop?: number;
}

export function easeOf(kind: Ease | undefined, k: number): number {
  const v = k < 0 ? 0 : k > 1 ? 1 : k;
  switch (kind) {
    case 'lin':
      return v;
    case 'in':
      return v * v;
    case 'out':
      return 1 - (1 - v) * (1 - v);
    case 'hold':
      return v >= 1 ? 1 : 0;
    case 'back': {
      // (reaches 1.1 a little past half way, and is back at 1 at the end)
      const s = 1.70158;
      const u = v - 1;
      return 1 + u * u * ((s + 1) * u + s);
    }
    default:
      return v * v * (3 - 2 * v);
  }
}

/** The numbers of a pose that move smoothly from key to key. */
const SMOOTH = ['bob', 'lean', 'near', 'far', 'nearLift', 'farLift', 'swing', 'hx', 'hy', 'aim', 'act', 'wind', 'drag', 'ohx', 'ohy', 'pt', 'sweep', 'step', 'gale', 'out'] as const;

/**
 * The pose at a moment of a timeline. `rest` is the figure's pose with nothing going on; every
 * key starts from it. `stepped` says the rig reads `off` as one of a few named positions of the
 * free hand rather than as an amount: between two keys the pose then carries where the hand was
 * (`off`), where it is going (`off2`) and how far along it is (`offK`), and the rig blends the two
 * places. Otherwise `off` moves smoothly like the other numbers.
 */
export function poseAt(keys: ReadonlyArray<Key>, rest: Pose, t: number, stepped = false): Pose {
  const full = (k: Key): Pose => ({ ...rest, ...k.pose });
  if (keys.length === 0) return { ...rest };
  if (t <= keys[0].at) return settle(full(keys[0]));
  const last = keys[keys.length - 1];
  if (t >= last.at) return settle(full(last));
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].at) i++;
  const a = full(keys[i]);
  const b = full(keys[i + 1]);
  const span = keys[i + 1].at - keys[i].at;
  const k = easeOf(keys[i + 1].ease, span > 0 ? (t - keys[i].at) / span : 1);
  const out: Pose = { ...a };
  for (const f of SMOOTH) out[f] = a[f] + (b[f] - a[f]) * k;
  if (stepped) {
    out.off = a.off;
    out.off2 = b.off;
    out.offK = k;
  } else {
    out.off = a.off + (b.off - a.off) * k;
    out.off2 = out.off;
    out.offK = 0;
  }
  // a weapon passes behind the body, and a thing is taken in hand or put away, at the middle of a segment
  out.behind = k < 0.5 ? a.behind : b.behind;
  out.prop = a.prop !== 0 && b.prop !== 0 ? (k < 0.5 ? a.prop : b.prop) : a.prop !== 0 ? a.prop : b.prop;
  return out;
}

/** A pose that is not between keys: the free hand is where it is, and going nowhere. */
function settle(q: Pose): Pose {
  q.off2 = q.off;
  q.offK = 0;
  return q;
}

/** How many frames a timeline has at a frame rate: one at its start, one at its end, and those between. */
export function frameCount(keys: ReadonlyArray<Key>, fps: number): number {
  if (keys.length === 0) return 1;
  // (the last frame is at or after the last key, never short of it: an animation must end where it says it ends)
  return Math.max(1, Math.ceil((keys[keys.length - 1].at - keys[0].at) * fps - 1e-6) + 1);
}

/** Every frame's pose. Frame i shows the moment i / fps after the first key. */
export function clipPoses(keys: ReadonlyArray<Key>, rest: Pose, fps: number, stepped = false): Pose[] {
  const n = frameCount(keys, fps);
  const t0 = keys.length ? keys[0].at : 0;
  const out: Pose[] = [];
  for (let i = 0; i < n; i++) out.push(poseAt(keys, rest, t0 + i / fps, stepped));
  return out;
}
