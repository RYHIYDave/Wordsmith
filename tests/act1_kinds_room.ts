// ACT 1, THE DESCENT: WHAT THE TESTS OF ITS OWN SMALL AND MEDIUM KINDS SHARE (tests/act1_deer.test.ts and the rest of
// floors 9 and 10's: the deer, the wolves, the Drowned, the leeches, the eyespawn). Not a test file.
//   - a practice room with one or more of a kind in it, awake, facing the hero, its words off and not to be killed;
//   - stepping the game on and seeing when the hero is hurt;
//   - a floor of the descent with a pack of the kind on it, fought over a long while;
//   - the checks every kind's pictures get as the game holds them (its clips by its acts' names, its size).

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import type { MonsterFigure } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { RNG } from '../src/engine/rng';
import { act1Pack } from '../src/game/act1_mobs';
import { actsOf } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Controls, GameEvent, Monster } from '../src/game/state';
import type { ClassId, MonsterKind } from '../src/game/types';
import { paintingOf, seasoned } from './helpers';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}

/**
 * An empty practice room, a hero who stands still in its middle facing east, and `n` of a kind `far` tiles east of
 * him (spread up and down the room), awake, facing him, its words taken off and not to be killed; every act of its
 * but `only` kept cooling (none: as they come).
 */
export function room(kind: MonsterKind, far: number, only: ActId | null = null, n = 1, cls: ClassId = 'warrior'): { g: Game; m: Monster; all: Monster[] } {
  const g = Game.forPractice(cls, 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x -= 3;
  h.fx = 1;
  h.fy = 0;
  const all: Monster[] = [];
  for (let i = 0; i < n; i++) {
    const m = g.spawn(kind, h.x + far, h.y + (i - (n - 1) / 2) * 0.9, -2, 0, false, new RNG(9 + i));
    hooks.wakeUp(m);
    m.words = [];
    m.shield = 0;
    m.life = m.maxLife = 1e9;
    m.cd = 0;
    m.fx = -1;
    m.fy = 0;
    if (only) keep(m, only);
    all.push(m);
  }
  g.events.length = 0;
  return { g, m: all[0], all };
}

/** Only this act of its is ready, now. */
export function keep(m: Monster, only: ActId): void {
  m.moveCd = actsOf(m)!.map((a) => (a.id === only ? 0 : 1e9));
  m.cd = 0;
}

export interface Seen {
  /** Every time the hero was hurt: when (seconds from the start), and how much. */
  hurts: { t: number; n: number }[];
  /** When its act began (the first step it was in one: seconds from the start), and the act. */
  began: number;
  act: ActId | null;
  events: GameEvent[];
}

/** Steps the game on for `secs`, the hero's life put back each step (he stands, or does what `drive` says). */
export function watch(g: Game, m: Monster, secs: number, drive?: (t: number, c: Controls) => void, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, act: null, events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    const fresh = emptyControls();
    Object.assign(c, fresh);
    if (drive) drive(t, c);
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    // (only blows are counted: what a blow leaves on him is put out)
    h.burnT = 0;
    h.shockT = 0;
    h.poisonT = 0;
    if (seen.began < 0 && m.state === 'act' && m.act) {
      seen.began = (k + 1) / 60;
      seen.act = m.act.id;
    }
    seen.events.push(...g.events);
    g.events.length = 0;
    if (until && until()) break;
  }
  return seen;
}

/** Steps it on until its act `id` has begun (false: it never did, in `secs`). */
export function untilAct(g: Game, m: Monster, id: ActId, secs = 8): boolean {
  watch(g, m, secs, undefined, () => m.state === 'act' && !!m.act && m.act.id === id);
  return m.state === 'act' && !!m.act && m.act.id === id;
}

/** A floor of the descent (`depth`), as a hero who has been down before comes to it. */
export function floor(depth: number, seed: number, cls: ClassId = 'warrior'): Game {
  const g = seasoned(new Game(cls, seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

/**
 * A LONG FIGHT on its own floor: a pack of the kind (as act1Pack would lay it) a few tiles from the hero, who walks
 * round, swings at the nearest and dodges now and then for `secs`; his life put back. Returns how many of them fell,
 * and what it saw. Throws if anything in the game does.
 */
export function longFight(kind: MonsterKind, depth: number, secs: number, seed = 3, cls: ClassId = 'warrior'): { g: Game; fell: number; acts: Set<string> } {
  const g = floor(depth, seed, cls);
  const h = g.hero;
  const hooks = g as unknown as Hooks;
  g.monsters = g.monsters.filter((m) => m.boss);
  // (a pack of it, as the floor lays one; then round the hero)
  let size = 0;
  const rng = new RNG(seed);
  for (let k = 0; k < 200 && size === 0; k++) {
    const p = act1Pack(depth, rng, 'normal');
    if (p.kind === kind) size = p.size;
  }
  const spots = g.spotsRound(h.x, h.y, 40).filter((s) => Math.hypot(s.x - h.x, s.y - h.y) > 3).slice(0, size);
  const them = spots.map((s) => g.spawn(kind, s.x, s.y, 77, 0, false, new RNG(seed + 1)));
  for (const m of them) {
    hooks.wakeUp(m);
    m.words = [];
  }
  const acts = new Set<string>();
  const c = emptyControls();
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    Object.assign(c, emptyControls());
    const live = g.monsters.filter((m) => !m.dead && !m.boss);
    const near = live.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
    // (he walks round a while, then stands and swings at the nearest; now and then he dodges)
    if (Math.floor(t / 3) % 2 === 0) {
      c.mx = Math.cos(t * 0.8);
      c.my = Math.sin(t * 0.8);
    } else if (near) {
      c.fire = true;
      c.aimX = near.x;
      c.aimY = near.y;
    }
    if (k % 233 === 100) {
      c.evade = true;
      c.evadeX = h.x - h.fx * 3;
      c.evadeY = h.y - h.fy * 3;
    }
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    for (const m of g.monsters) if (m.kind === kind && m.act) acts.add(m.act.id);
    g.events.length = 0;
    if (g.over) break;
  }
  return { g, fell: them.filter((m) => m.dead).length, acts };
}

/** Its size, as the game goes by it, measured off its stand as tests/first5_bosses.test.ts measures FIGURE_SIZE: the top over its floor point, and how far its picture reaches to either side. */
export function measuredSize(fig: MonsterFigure): { head: number; reach: number; size: { top: number; half: number } } {
  const art = makeBestiary();
  const s = art.of(fig).front.idle[0];
  const p = paintingOf(s);
  const ax = Math.round(s.ax * GRAIN);
  const ay = Math.round(s.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  return { head, reach: Math.max(s.ax, s.w - s.ax), size: FIGURE_SIZE[fig] };
}

/** Is a colour of the friend's glow, cyan (a hue between 165 and 205, not grey)? */
export function cyanish(col: string): boolean {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(col);
  if (!m) return false;
  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min || (max - min) / max < 0.25) return false;
  let hue: number;
  if (max === r) hue = ((g - b) / (max - min)) * 60;
  else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
  else hue = (4 + (r - g) / (max - min)) * 60;
  hue = (hue + 360) % 360;
  return hue >= 165 && hue <= 205;
}

/** A canvas that draws nothing and keeps every colour it is asked to draw in. */
export function colourCatcher(): { g: CanvasRenderingContext2D; colours: Set<string> } {
  const colours = new Set<string>();
  const target: Record<string, unknown> = {};
  const g = new Proxy(target, {
    get(t, k) {
      if (k in t) return t[k as string];
      return () => undefined;
    },
    set(t, k, v) {
      if ((k === 'fillStyle' || k === 'strokeStyle') && typeof v === 'string') colours.add(v);
      t[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { g, colours };
}
