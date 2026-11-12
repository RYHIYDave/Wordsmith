// THE SWAMP COLOSSUS'S BAKED PICTURES (tools/bake_colossus.ts: the art chat's painter, each layer of him painted once and each frame
// laid as the art chat's tool lays it, packed in sheets beside the page with a manifest). The manifest is fetched as his fight is first
// drawn; each group of pictures (his lurk, his stand, his entrance, each tentacle's stand, burst, flinches and death, each slam) is
// fetched as it is wanted and let go when its phase is over, so that a phone holds only what the fight wants now (his slams the few
// last wanted). Until a group is here (or where it is not baked), the stand-ins (render/act1_fx/colossus.ts). A frame of a move is one
// picture, its corner given from his middle at the water; at the shovel's right end, flipped about his middle (his “Mirror it”); a
// tentacle's slam turned about its root by what is left of its turn.

import { BODY2, EYE3 } from '../game/colossus_fight';

declare const __COLOSSUS_BAKE__: string | undefined;

/**
 * HIS TENTACLES AS BAKED (tools/bake_colossus.ts): a burst begins on their stand's first frame (the fight's tentacle clock is set
 * then: game/colossus_fight.ts armClock), so that its 32 frames end on its 32nd; struck standing is baked from these frames of their
 * stand (the nearest taken); their slams on the stone every `turnEvery` degrees of turn, the game turning each the rest of the way.
 * His entrance in parts of `entrancePart` frames (`entrance.0` on), each its own sheets. His body's own attacks in phase 2 (the bile arc,
 * the gaze) baked as the art's takes begin them, on frame `bodyAt` of his stand (game/colossus_fight.ts begins them there).
 */
export const ARM_BAKE = { burstAt: 0, flinchFrom: [0, 15, 30] as readonly number[], turnEvery: 15, entrancePart: 90, bodyAt: 24 } as const;

/**
 * HIS PHASE 3 AS BAKED (tools/bake_colossus.ts): his slide (`slide`) begun as his stand is on frame `slideAt` (the art's take's); at his
 * new place his body (`p3body`) and his tongue apart, each frame of his stand: his tongue as it droops (`p3tongue`), his eye slam at
 * each of the rules' spots (`slam3.<i>`), his gaze at each of their aims (`gaze3.<j>`), each begun on his stand's first frame; his eye
 * struck from each of their stand frames (`struck3.<c>`). His tongue's pictures are cut where his jaws or drool are before it, so that
 * each is laid over his body's.
 */
export const P3_BAKE = { slideAt: 24, slams: EYE3.spots, aims: EYE3.aims, struckFrom: EYE3.struckFrom } as const;

/**
 * HIS PHASE 2 GAZE AIMED AS BAKED (tools/bake_colossus.ts; game/colossus_fight.ts GAZE2_AIMED, on at his yes of 12 Nov): his body and his
 * tongue apart, as phase 3's: his body (`p2body`: his stand's jaws and drool, each frame of his stand at his place), and his tongue
 * and eye alone at each of the rules' aims (`gaze2.<j>`: the art's bodyFrame aimed so, degrees), begun as his stand is on frame `at`
 * (the game begins the gaze there), each cut where his jaws or drool are before it, so that it is laid over his body's.
 */
export const P2_BAKE = { at: BODY2.at, aims: BODY2.aims } as const;

/** Where the bakes lie beside the page, each in a folder named by its mark (tools/colossus_ship.mjs). */
export const COLOSSUS_BAKE = { dir: 'colossus', slamsKept: 6 };

/** The bake this build of the game was made with ('' : none, and his stand-ins are drawn). */
export function colossusBakeMark(): string {
  return typeof __COLOSSUS_BAKE__ === 'string' ? __COLOSSUS_BAKE__ : '';
}

interface Placed {
  s: number;
  x: number;
  y: number;
  w: number;
  h: number;
  ox: number;
  oy: number;
}
interface Manifest {
  /** The bake's pixels to a game pixel (2 as the art chat paints; 1 halved). */
  perGamePx: number;
  /** Each group's sheets and its pictures (each: its sheet, its place on it, its corner from his middle at the water). */
  groups: Record<string, { sheets: string[]; pics: Placed[] }>;
  /** Each move's group and its frames (30 a second) as its group's pictures; his shovel's, which are at the stone's end (flipped at
   *  its right end), and its scraping tentacles in each (each a picture of the group `hooks` and how far across it lies, the bake's
   *  pixels). */
  moves: Record<string, { group: string; frames: number[]; ends?: boolean[]; hooks?: [number, number][][]; eyes?: ([number, number] | null)[] }>;
  /** Each tentacle's root from his middle at the water (the bake's pixels). */
  roots: [number, number][];
}

let man: Manifest | null = null;
let asked = false;
/** Each group asked for: its sheets once here (null while coming), and when it was last drawn. */
const held = new Map<string, { sheets: (ImageBitmap | null)[]; used: number; gone: boolean }>();
let clock = 0;

const dirOf = (): string => `${COLOSSUS_BAKE.dir}/${colossusBakeMark()}`;

/** Fetch the manifest (once). */
export function colossusBakeAsk(): void {
  if (asked) return;
  asked = true;
  if (!colossusBakeMark() || typeof fetch !== 'function' || typeof createImageBitmap !== 'function') return;
  void (async () => {
    try {
      const r = await fetch(`${dirOf()}/colossus.json`);
      if (r.ok) man = (await r.json()) as Manifest;
    } catch {
      // (the stand-ins stay)
    }
  })();
}

/** Groups kept a while after they were last wanted, each family its last few: his tentacles' slams; his phase 3's eye slams and gazes; his phase 2 gaze's aims. */
const KEPT_GROUPS: Record<'arms' | 'p3' | 'p2', { is: (g: string) => boolean; n: number }> = {
  arms: { is: (g) => g.includes('.slam'), n: COLOSSUS_BAKE.slamsKept },
  p3: { is: (g) => /^(slam3|gaze3)\./.test(g), n: 6 },
  p2: { is: (g) => /^gaze2\./.test(g), n: 2 },
};

/** Fetch a group's sheets, if not held already. */
function want(group: string): void {
  if (!man || held.has(group)) return;
  const G = man.groups[group];
  if (!G) return;
  const h = { sheets: G.sheets.map((): ImageBitmap | null => null), used: clock, gone: false };
  held.set(group, h);
  // (his slams: only the last few wanted kept)
  for (const K of Object.values(KEPT_GROUPS)) {
    if (!K.is(group)) continue;
    const fam = [...held.entries()].filter(([g]) => K.is(g)).sort((a, b) => b[1].used - a[1].used);
    for (const [g] of fam.slice(K.n)) letGo(g);
  }
  G.sheets.forEach((n, i) => {
    void (async () => {
      try {
        const rs = await fetch(`${dirOf()}/${n}`);
        if (!rs.ok) return;
        const bm = await createImageBitmap(await rs.blob(), { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
        if (h.gone) bm.close();
        else h.sheets[i] = bm;
      } catch {
        // (the stand-ins stay for it)
      }
    })();
  });
}
function letGo(group: string): void {
  const h = held.get(group);
  if (!h) return;
  h.gone = true;
  for (const s of h.sheets) s?.close();
  held.delete(group);
}

/** The moves now wanted: fetch their groups; let every other group go (but those of the families in `keep`, the last few of each kept:
 *  his tentacles' slams in phases 1 and 2, not in his shovel; his eye's slams and gazes in phase 3; his gaze's aims in phase 2). */
export function colossusWant(moves: readonly string[], keep: readonly ('arms' | 'p3' | 'p2')[] = ['arms']): void {
  if (!man) return;
  clock += 1;
  const groups = new Set(moves.map((mv) => man?.moves[mv]?.group).filter((g): g is string => !!g));
  if (moves.includes('hooks')) groups.add('hooks');
  for (const g of groups) want(g);
  for (const g of [...held.keys()]) if (!groups.has(g) && !keep.some((k) => KEPT_GROUPS[k].is(g))) letGo(g);
}
/** Let every group go (his fight over, or left). */
export function colossusLetGoAll(): void {
  for (const g of [...held.keys()]) letGo(g);
}

/** Whether a move is baked (in the manifest). */
export function colossusBaked(move: string): boolean {
  return !!man?.moves[move];
}
/** Whether frame `k` of a move's picture is here to be drawn now (its group asked for if not). */
export function colossusHas(move: string, k: number): boolean {
  return !!picOf(move, k);
}
/** How many frames a move has (30 a second); 0 if it is not baked. */
export function colossusFrames(move: string): number {
  return man?.moves[move]?.frames.length ?? 0;
}
/** The slam turns baked for a tentacle (degrees). */
export function colossusSlamTurns(w: number): number[] {
  if (!man) return [];
  const out: number[] = [];
  for (const mv of Object.keys(man.moves)) {
    const m = /^a(\d)\.slam(-?\d+)$/.exec(mv);
    if (m && Number(m[1]) === w) out.push(Number(m[2]));
  }
  return out.sort((a, b) => a - b);
}

/** A frame's picture, if its group is here (asked for if not). */
function picOf(move: string, k: number): { img: ImageBitmap; m: Placed; per: number } | null {
  if (!man) return null;
  const mv = man.moves[move];
  if (!mv) return null;
  want(mv.group);
  const h = held.get(mv.group);
  const G = man.groups[mv.group];
  if (!h || !G) return null;
  h.used = clock;
  const m = G.pics[mv.frames[Math.max(0, Math.min(mv.frames.length - 1, Math.floor(k)))]];
  const img = m ? h.sheets[m.s] : null;
  return m && img ? { img, m, per: man.perGamePx } : null;
}

/** Where his eye glows in frame `k` of `move` (his phase 3's tongue: game pixels from his middle at the water), if it shows. */
export function colossusEye(move: string, k: number): [number, number] | null {
  const e = man?.moves[move]?.eyes;
  if (!man || !e || !e.length) return null;
  const p = e[Math.max(0, Math.min(e.length - 1, Math.floor(k)))];
  return p ? [p[0] / man.perGamePx, p[1] / man.perGamePx] : null;
}

/** Whether frame `k` of his shovel's `move` is at the stone's end (flipped at its right end). */
export function colossusAtEnd(move: string, k: number): boolean {
  const e = man?.moves[move]?.ends;
  return !!e && !!e[Math.max(0, Math.min(e.length - 1, Math.floor(k)))];
}

/** His shovel's scraping tentacles in frame `k` of `move`, laid from his middle at the water at (sx, sy); at the right end flipped. */
export function drawColossusHooks(g: CanvasRenderingContext2D, move: string, k: number, sx: number, sy: number, mirror = false): boolean {
  const hk = man?.moves[move]?.hooks;
  if (!man || !hk) return false;
  const list = hk[Math.max(0, Math.min(hk.length - 1, Math.floor(k)))] ?? [];
  if (!list.length) return true;
  want('hooks');
  const h = held.get('hooks');
  const G = man.groups.hooks;
  if (!h || !G) return false;
  h.used = clock;
  const per = man.perGamePx;
  g.save();
  g.translate(Math.round(sx), Math.round(sy));
  if (mirror) g.scale(-1, 1);
  let all = true;
  for (const [id, dx] of list) {
    const m = G.pics[id];
    const img = m ? h.sheets[m.s] : null;
    if (!m || !img) {
      all = false;
      continue;
    }
    g.drawImage(img, m.x, m.y, m.w, m.h, (dx + m.ox) / per, m.oy / per, m.w / per, m.h / per);
  }
  g.restore();
  return all;
}

/** His body: frame `k` of `move` with his middle at the water at (sx, sy), game pixels; `mirror`, flipped about his middle. */
export function drawColossusBody(g: CanvasRenderingContext2D, move: string, k: number, sx: number, sy: number, mirror = false, alpha = 1): boolean {
  const p = picOf(move, k);
  if (!p) return false;
  const { img, m, per } = p;
  g.save();
  g.globalAlpha *= alpha;
  g.translate(Math.round(sx), Math.round(sy));
  if (mirror) g.scale(-1, 1);
  g.drawImage(img, m.x, m.y, m.w, m.h, m.ox / per, m.oy / per, m.w / per, m.h / per);
  g.restore();
  return true;
}

/**
 * A tentacle `w` (0 to 4): frame `k` of its `move`, laid from his middle at the water at (sx, sy) as he is, and turned `turn`
 * degrees about its root (toward his right as it is more), as the ground turns seen from the game's camera.
 */
export function drawColossusArm(g: CanvasRenderingContext2D, w: number, move: string, k: number, sx: number, sy: number, turn = 0): boolean {
  const p = picOf(move, k);
  if (!p || !man) return false;
  const { img, m, per } = p;
  const [rx, ry] = man.roots[w] ?? [0, 0];
  g.save();
  g.translate(Math.round(sx), Math.round(sy));
  if (turn) {
    const a = (turn * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    g.translate(rx / per, ry / per);
    g.transform(c, -s / 2, 2 * s, c, 0, 0);
    g.translate(-rx / per, -ry / per);
  }
  g.drawImage(img, m.x, m.y, m.w, m.h, m.ox / per, m.oy / per, m.w / per, m.h / per);
  g.restore();
  return true;
}
