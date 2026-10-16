// Shared by the tests of four of the descent's own kinds, the Ledge Road's and Echo Canyon's (the vultures, the cliff
// crawlers, the canyon scorpions and the dust devils: tests/act1_vulture.test.ts and its three fellows). Not a test file.
//   room:    an empty practice room, a hero who stands still, and one of the kind awake `far` tiles to his west.
//   watch:   the game stepped on, the hero's life put back each step, every blow on him counted.
//   ledge:   floor 7 itself, as the game makes it.
//   cyanIn:  what a drawing on the floor lays down, its colours, for "nothing cyan".
//   measure: a figure's size off its standing picture, as tests/new_monsters.test.ts and first5_bosses measure FIGURE_SIZE.

import { GRAIN } from '../src/art/kit';
import type { Sprite } from '../src/engine/px';
import { RNG } from '../src/engine/rng';
import { actsOf } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';
import { paintingOf, seasoned } from './helpers';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
  damageMonster(m: Monster, dmg: number, el: string, crit: boolean, skill: number): void;
}
export const hooks = (g: Game): Hooks => g as unknown as Hooks;

/** An empty practice room, a hero who stands still, and one of `kind` `far` tiles to his west, awake, facing him, its words off and not to be killed. */
export function room(kind: MonsterKind, far: number, seed = 9): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  hooks(g).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn(kind, h.x - far, h.y, -2, 0, false, new RNG(seed));
  hooks(g).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  m.fx = 1;
  m.fy = 0;
  g.events.length = 0;
  return { g, m };
}

/** Only this act of its is ready, now (the others kept cooling). */
export function only(m: Monster, id: string): void {
  const acts = actsOf(m) ?? [];
  m.moveCd = acts.map((a) => (a.id === id ? 0 : 1e9));
  m.cd = 0;
}

export interface Seen {
  /** Every blow on the hero: when (seconds from the start), how much, and the act it came in and how far into it. */
  hurts: { t: number; n: number; act: string; at: number }[];
  /** Each act it began: which, and when. */
  acts: { id: string; t: number }[];
  events: GameEvent[];
}
/** Steps the game on for `secs` (sixty steps a second), the hero's life put back each step; `each` is called every step with the time. */
export function watch(g: Game, m: Monster, secs: number, each?: (t: number) => void, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], acts: [], events: [] };
  let was = '';
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = (k + 1) / 60;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t, n: before - h.life, act: m.act ? m.act.id : '', at: m.act ? m.act.t : -1 });
    h.life = h.d.maxLife;
    h.burnT = 0;
    const a = m.act ? `${m.act.id}#${m.act.n}` : '';
    if (a && a !== was) seen.acts.push({ id: m.act!.id, t });
    was = a;
    seen.events.push(...g.events);
    g.events.length = 0;
    if (each) each(t);
    if (until && until()) break;
  }
  return seen;
}

/** Floor `depth` of the descent, as the game makes it, for a character who has been down before. */
export function floorOf(seed: number, depth: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

/** A canvas that only notes the colours laid on it (for "nothing cyan"). */
export function noteColours(): { ctx: CanvasRenderingContext2D; colours: Set<string> } {
  const colours = new Set<string>();
  const ctx = new Proxy({} as Record<string | symbol, unknown>, {
    get(target, k) {
      if (k in target) return target[k];
      return () => undefined;
    },
    set(target, k, v) {
      if ((k === 'fillStyle' || k === 'strokeStyle') && typeof v === 'string') colours.add(v);
      target[k] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, colours };
}

/** Is a colour the hero's cyan (a hue between green-blue and blue, and not grey)? */
export function cyan(c: string): boolean {
  const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0 || (max - min) / max < 0.3) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 160 && h <= 210;
}

/** Its size off its standing picture, as the game's figures' sizes are held to theirs: the top of its head (on its middle line), and how far its picture reaches to either side. */
export function measure(s: Sprite): { head: number; reach: number } {
  const p = paintingOf(s);
  const ax = Math.round(s.ax * GRAIN);
  const ay = Math.round(s.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  return { head, reach: Math.max(s.ax, s.w - s.ax) };
}
