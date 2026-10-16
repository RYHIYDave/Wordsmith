// Shared by the tests of the descent's own kinds (tests/act1_qgolem.test.ts, act1_rubbling, act1_chanter,
// act1_firepot). Not a test file: `tsx --test tests/*.test.ts` does not pick it up.
//
// A practice room with one of them in it, awake and facing the hero; the game stepped on with the hero's life
// put back each step, every hurt counted; a fake canvas that records what is drawn on it; the friend's cyan.

import { paintingOf } from './helpers';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import type { Sprite } from '../src/engine/px';
import { RNG } from '../src/engine/rng';
import { act1Rules } from '../src/game/act1_rules/index';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, GameEvent, Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}

/**
 * An empty practice room, a hero who stands still in it, and one of `kind` `far` tiles to the west of him,
 * awake, facing him, its words taken off and not to be killed; every act of its but `only` kept cooling (none:
 * as they come). A rubbling is out of its pile already (`pile`: as it comes, a pile).
 */
export function room(kind: MonsterKind, far: number, only: ActId | null = null, pile = false): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn(kind, h.x - far, h.y, -2, 0, false, new RNG(9));
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.cd = 0;
  m.fx = 1;
  m.fy = 0;
  if (!pile && m.a1 && m.a1.pile) m.a1.pile = 0;
  if (only) keep(m, only);
  g.events.length = 0;
  return { g, m };
}
/** Only this act of its is ready, now. */
export function keep(m: Monster, only: ActId): void {
  m.moveCd = act1Rules(m.kind)!.acts.map((a) => (a.id === only ? 0 : 1e9));
  m.cd = 0;
}

export interface Seen {
  /** Every time the hero was hurt: when (seconds from the start), and how much. */
  hurts: { t: number; n: number }[];
  /** When its act began (the first step it was in one), and which acts it made. */
  began: number;
  acts: string[];
  events: GameEvent[];
}
/** Steps the game on for `secs`, the hero's life put back each step (he stands, or goes where `move` says). */
export function watch(g: Game, m: Monster, secs: number, move?: (t: number) => { mx: number; my: number } | null, until?: () => boolean): Seen {
  const c = emptyControls();
  const h = g.hero;
  const seen: Seen = { hurts: [], began: -1, acts: [], events: [] };
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    const mv = move ? move(t) : null;
    c.mx = mv ? mv.mx : 0;
    c.my = mv ? mv.my : 0;
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) seen.hurts.push({ t: (k + 1) / 60, n: before - h.life });
    h.life = h.d.maxLife;
    // (only blows are counted: what fire leaves burning on him is put out)
    h.burnT = 0;
    h.shockT = 0;
    h.chillT = 0;
    if (m.state === 'act' && m.act) {
      if (seen.began < 0) seen.began = (k + 1) / 60;
      if (seen.acts[seen.acts.length - 1] !== `${m.act.id}#${m.act.n}`) seen.acts.push(`${m.act.id}#${m.act.n}`);
    }
    seen.events.push(...g.events);
    g.events.length = 0;
    if (until && until()) break;
  }
  return seen;
}
export const firstHurt = (s: Seen): number => (s.hurts.length ? s.hurts[0].t : -1);

/** True of a colour in the cyan family, bright and strong: a glow of the friend's side (as tests/new_mobs3.test.ts has it). */
export function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let hh: number;
  if (max === r) hh = ((g - b) / (max - min)) * 60;
  else if (max === g) hh = (2 + (b - r) / (max - min)) * 60;
  else hh = (4 + (r - g) / (max - min)) * 60;
  hh = (hh + 360) % 360;
  return hh >= 165 && hh <= 205;
}
const hex = (c: string): [number, number, number] => {
  const v = c.replace('#', '');
  const f = v.length === 3 ? v.split('').map((x) => x + x).join('') : v;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
};
/** How many of a sprite's pixels, and of its lights, are cyan (made under paintWithoutCanvas). */
export function cyanIn(s: Sprite): number {
  let n = cyanInPx(s.img);
  for (const l of s.lights ?? []) if (cyanGlow(...hex(l.color))) n++;
  if (s.aura && cyanGlow(...hex(s.aura.color))) n++;
  return n;
}
/** How many of a painting's pixels are cyan (a Sprite's picture, made under paintWithoutCanvas). */
export function cyanInPx(img: unknown): number {
  const p = paintingOf({ img } as unknown as Sprite);
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] > 0 && cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2])) n++;
  return n;
}

/** What was drawn through a fake context: each picture drawn (on the floor, standing, over), each colour filled, each light (in the dark, or a glow laid on). */
export interface Drawn {
  images: unknown[];
  fills: string[];
  spots: number;
  glows: number;
}
/** A context for render/act1_fx, its canvas a fake that records what is drawn (the floor laid out as the game's: a tile 32 by 16). */
export function fakeCtx(g: Game, t = 0): { c: Act1FxCtx; drawn: Drawn } {
  const drawn: Drawn = { images: [], fills: [], spots: 0, glows: 0 };
  const canvas = {
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    beginPath(): void {},
    ellipse(): void {},
    fill(): void {
      drawn.fills.push(String(canvas.fillStyle));
    },
    drawImage(img: unknown): void {
      // (a light is laid on as a glow, its colours added)
      if (canvas.globalCompositeOperation === 'lighter') drawn.glows++;
      else drawn.images.push(img);
    },
  };
  const at = (x: number, y: number): [number, number] => [(x - y) * 16, (x + y) * 8];
  const c: Act1FxCtx = {
    g: canvas as unknown as CanvasRenderingContext2D,
    at,
    game: g,
    t,
    bestiary: null as unknown as Act1FxCtx['bestiary'],
    stand: (_d, s) => void drawn.images.push(s.img),
    spot: () => void drawn.spots++,
  };
  return { c, drawn };
}

/** A document to make canvases on outside a browser (for the lights and the turned-over pictures the effects make): every canvas a fake that takes whatever is drawn on it. */
export function fakeDocument(): void {
  const ctx = new Proxy({}, { get: (_t, k) => (k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop(): void {} }) : () => undefined), set: () => true });
  (globalThis as unknown as { document: unknown }).document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
}
