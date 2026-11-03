// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: ITS RULES (game.ts asks them each step on the floor: its update,
// the hero's pace, the monsters' pace). Its map-maker and dresser are game/act2/swangardens.ts.
//
// HIS DOC, level 16's hazards: "nettle beds that sting and slow whoever walks through them; the lake's deep water". The lake is
// the map-maker's (never walked: its tiles are not floor). The nettle beds are these rules':
//   WHOEVER WALKS THROUGH THEM: the hero, and every monster on foot (his "whoever": the swans waddle, the gardeners, the
//     grooms and the palace guard walk; none that flies over, and never the boss, whose ground has none);
//   STUNG: a moment after stepping in (NETTLES.first), and every NETTLES.every seconds while in them, a sting of NETTLES.share
//     of life (the hero's before his armour, as the spike floor's is, through game.ts hurtHero, so his roll and anything that
//     stops a blow stop it; a monster's own); stepping out and back in stings no sooner than the last sting's NETTLES.every;
//   SLOWED: by NETTLES.slow while in them, and for NETTLES.after seconds after (game.ts multiplies his pace and theirs by
//     `nettleSlow`); no chill, no frost on him (the ink's slow is the Censor's: this is the nettles' own, untinted);
//   AND THEY STIR: the art's `nettles` has two pictures, still and stirred (art/floor16.ts); a tile of them someone is in shows
//     stirred, and for NETTLES.stir seconds after.
// And HER VINE IN THE YEW (the art's README: “show the first; as the hero comes near, play the rest once and keep the last (as
// the nettles stir)”): `a yew cone, her vine reaching out of it` shows its first picture until he comes within YEW_VINE.near
// tiles, then its other three once at YEW_VINE.fps, and keeps the last (the vine gone back into the yew).

import type { Hero, Level, Monster, PropInst } from '../state';

/** THE NETTLE BEDS' NUMBERS (the main chat's: the doc leaves them to the game). */
export const NETTLES = {
  on: true,
  /** Seconds from stepping in to the first sting, and between stings while in them. */
  first: 0.15,
  every: 0.8,
  /** A sting: this share of life (the spike floor's is a sixth; this is a nuisance, a stand in them costs a tenth in two seconds). */
  share: 0.04,
  /** Slowed by this much while in them (the Censor's ink slows by 0.35), and this long after stepping out. */
  slow: 0.4,
  after: 0.5,
  /** A tile of them shows stirred this long after someone was in it. */
  stir: 0.45,
};
/** HER VINE IN THE YEW: how near he comes before it draws back, and its frames a second as it does. */
export const YEW_VINE = { near: 3.5, fps: 6 };

/** A sting the game deals (game.ts): to a monster (`m`), or to the hero (null), this much. */
export interface Sting {
  m: Monster | null;
  dmg: number;
}

/** What a body keeps of the nettles: when it may next be stung (the game's clock), how long it stays slowed, whether it was in them last step. */
interface Stung {
  ready: number;
  slow: number;
  was: boolean;
}
const STUNG = new WeakMap<object, Stung>();

/** The floor's nettle beds (a tile each), their pieces by tile, how long each tile stays stirred, and her vines in the yew. */
interface Beds {
  bed: Uint8Array;
  w: number;
  pieces: Map<number, PropInst[]>;
  stir: Map<number, number>;
  vines: { p: PropInst; t: number }[];
}
const BEDS = new WeakMap<Level, Beds | null>();

function bedsOf(L: Level): Beds | null {
  let b = BEDS.get(L);
  if (b !== undefined) return b;
  const G = L.land?.garden;
  if (!G) {
    BEDS.set(L, null);
    return null;
  }
  const W = L.floor.w;
  const bed = new Uint8Array(W * L.floor.h);
  for (const r of G.nettles) for (let y = r[1]; y < r[3]; y++) for (let x = r[0]; x < r[2]; x++) if (L.floor.tiles[y * W + x] !== 0) bed[y * W + x] = 1;
  const pieces = new Map<number, PropInst[]>();
  const vines: Beds['vines'] = [];
  for (const p of L.props) {
    if (p.kind !== 'piece') continue;
    if (p.name === 'nettles') {
      const i = p.ty * W + p.tx;
      const list = pieces.get(i) ?? [];
      list.push(p);
      pieces.set(i, list);
    } else if (p.name === 'a yew cone, her vine reaching out of it') vines.push({ p, t: -1 });
  }
  b = { bed, w: W, pieces, stir: new Map(), vines };
  BEDS.set(L, b);
  return b;
}

/** Is world (x, y) in a bed of nettles? */
export function inNettles(L: Level, x: number, y: number): boolean {
  const b = bedsOf(L);
  if (!b) return false;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return tx >= 0 && ty >= 0 && tx < b.w && ty < L.floor.h && b.bed[ty * b.w + tx] === 1;
}

/** How fast a body goes for the nettles: 1, or 1 - NETTLES.slow while in them and a moment after. */
export function nettleSlow(who: object): number {
  const s = STUNG.get(who);
  return s && s.slow > 0 ? 1 - NETTLES.slow : 1;
}

/**
 * A STEP OF THE GARDENS (game.ts, each step on floor 16): who is in the nettles is slowed, and stung when it is time (the stings
 * returned, for the game to deal); the nettles they are in stir; her vine in the yew draws back once he is near.
 */
export function stepGardens(L: Level, hero: Hero, monsters: readonly Monster[], now: number, dt: number): Sting[] {
  const b = bedsOf(L);
  if (!b || !NETTLES.on) return [];
  const out: Sting[] = [];
  const step = (who: object, x: number, y: number, m: Monster | null): void => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const i = ty * b.w + tx;
    const inBed = tx >= 0 && ty >= 0 && tx < b.w && ty < L.floor.h && b.bed[i] === 1;
    let s = STUNG.get(who);
    if (!inBed) {
      if (s) {
        s.slow = Math.max(0, s.slow - dt);
        s.was = false;
      }
      return;
    }
    if (!s) {
      s = { ready: 0, slow: 0, was: false };
      STUNG.set(who, s);
    }
    if (!s.was) s.ready = Math.max(s.ready, now + NETTLES.first);
    s.was = true;
    s.slow = NETTLES.after;
    b.stir.set(i, NETTLES.stir);
    if (now >= s.ready) {
      s.ready = now + NETTLES.every;
      const life = m ? m.maxLife : hero.d.maxLife;
      out.push({ m, dmg: m ? Math.max(1, Math.round(life * NETTLES.share)) : life * NETTLES.share });
    }
  };
  if (hero.life > 0 && !hero.move) step(hero, hero.x, hero.y, null);
  for (const m of monsters) {
    if (m.dead || m.boss || m.kind === 'bat') continue;
    step(m, m.x, m.y, m);
  }
  // (the nettles stirred where someone is, and a moment after)
  for (const [i, t] of b.stir) {
    const left = t - dt;
    for (const p of b.pieces.get(i) ?? []) p.variant = left > 0 ? 1 : 0;
    if (left > 0) b.stir.set(i, left);
    else b.stir.delete(i);
  }
  // (her vine in the yew: its first picture until he is near, then the rest once, and the last kept)
  for (const v of b.vines) {
    if (v.t < 0) {
      if (Math.hypot(hero.x - v.p.x, hero.y - v.p.y) > YEW_VINE.near) continue;
      v.t = 0;
    } else v.t += dt;
    v.p.variant = Math.min(3, Math.floor(v.t * YEW_VINE.fps) + 1);
  }
  return out;
}
