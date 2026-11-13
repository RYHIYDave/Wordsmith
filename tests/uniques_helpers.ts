// Shared by the tests of the unique items (game/uniques.ts). (Not a test file.)
import { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import type { ClassId, EquipSlot, Item, WordId } from '../src/game/types';
import { UNIQUES, makeUnique, uniqueSlot, uniqueDef } from '../src/game/uniques';

export const DT = 1 / 60;

/** UNIQUE ITEMS switched on for the length of `f`, and off again. */
export function on<T>(f: () => T): T {
  const was = UNIQUES.on;
  UNIQUES.on = true;
  try {
    return f();
  } finally {
    UNIQUES.on = was;
  }
}

/** UNIQUE ITEMS switched off for the length of `f`, and back as they were (on in the game since his yes of 12 Nov 2026). */
export function off<T>(f: () => T): T {
  const was = UNIQUES.on;
  UNIQUES.on = false;
  try {
    return f();
  } finally {
    UNIQUES.on = was;
  }
}

type Inner = { rng: RNG; waveT: number; power: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
export const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room for a hero of that class, emptied: no packs walk in. */
export function room(cls: ClassId, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

/** A skeleton set down by him that stands and does nothing (`dx`, `dy` from him), with life to spare. */
export function dummy(g: Game, dx: number, dy: number, life = 1e7, awake = true, kind = 'skeleton'): Monster {
  const a = inner(g);
  const m = a.spawn(kind, g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  if (awake) a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}
export const hurt = (m: Monster): number => m.maxLife - m.life;

/** Every ability of his ready again, his mana full. */
export function ready(g: Game): void {
  for (const s of g.hero.skills) {
    s.charges = s.maxCharges;
    s.cd = 0;
  }
  g.hero.swingT = 0;
  g.hero.mana = g.hero.d.maxMana;
}

/** His tap attack pressed once toward (dx, dy) from him, and let land; the events of it. */
export function tap(g: Game, dx = 1, dy = 0, after = 0): GameEvent[] {
  const c = emptyControls();
  c.fire = true;
  c.aimX = g.hero.x + dx;
  c.aimY = g.hero.y + dy;
  const ev: GameEvent[] = [];
  const take = (): void => {
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  };
  g.update(DT, c);
  c.fire = false;
  take();
  let n = 0;
  while (g.hero.windup !== null && n++ < 120) {
    g.update(DT, c);
    take();
  }
  return after > 0 ? ev.concat(wait(g, after)) : ev;
}

/** His hold attack pressed toward (dx, dy) and let land (held for `held` seconds, if it is one that is held). */
export function cast(g: Game, dx = 1, dy = 0, held = 0, after = 0): GameEvent[] {
  const c = emptyControls();
  c.cast = true;
  c.hold = held > 0;
  c.castX = c.aimX = g.hero.x + dx;
  c.castY = c.aimY = g.hero.y + dy;
  const ev: GameEvent[] = [];
  const take = (): void => {
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  };
  g.update(DT, c);
  c.cast = false;
  take();
  let n = 0;
  while (g.hero.windup !== null && n++ < 120) {
    g.update(DT, c);
    take();
  }
  if (held > 0) {
    for (let t = 0; t < held; t += DT) {
      c.castX = g.hero.x + dx;
      c.castY = g.hero.y + dy;
      g.update(DT, c);
      take();
    }
    c.hold = false;
    g.update(DT, c);
    take();
  }
  return after > 0 ? ev.concat(wait(g, after)) : ev;
}

/** His swipe toward (dx, dy), and `after` seconds of it. */
export function swipe(g: Game, dx: number, dy: number, after = 0.6): GameEvent[] {
  const c = emptyControls();
  c.evade = true;
  c.evadeX = g.hero.x + dx;
  c.evadeY = g.hero.y + dy;
  g.update(DT, c);
  const ev = [...g.events];
  g.events.length = 0;
  return ev.concat(wait(g, after));
}

/** A blow of `raw` physical harm on him from a monster (or from a spot `dx`, `dy` from him), his armour set aside; what it took off his life. */
export function strike(g: Game, raw: number, src: Monster | null = null, dx = 1, dy = 0): number {
  const h = g.hero;
  const armor = h.d.armor;
  h.d.armor = 0;
  h.d.stats.blockChance = 0;
  const was = h.life;
  g.hurtHero(raw, 'phys', [], src, 'a test', h.x + dx, h.y + dy);
  h.d.armor = armor;
  return was - h.life;
}

/** His hits made the same every time: no spread between his least and most, no criticals (unless `crit`: every one). */
export function steady(g: Game, hit = 100, crit = false): void {
  g.hero.d.dmgMin = g.hero.d.dmgMax = hit;
  g.hero.d.critChance = crit ? 100 : 0;
}

/** Unique `id` made and put on him (in its slot; a ring on the second finger where the first has a unique already). */
export function wear(g: Game, ...ids: string[]): Game {
  for (const id of ids) {
    const d = uniqueDef(id)!;
    const it = makeUnique(id, g.hero.level, new RNG(11)) as Item;
    if (!it) throw new Error(`no unique '${id}' (is the switch on?)`);
    it.reqLevel = 1;
    // (ITS NUMBERS ROLL: one of the 62 put on at the tune's own numbers, which its rules' tests go by; its rolls have their own test,
    // tests/uniques_rolls.test.ts. A leveling unique keeps what it rolled)
    if (d.from !== 'level') delete it.uroll;
    const s = uniqueSlot(d);
    const slot: EquipSlot = s === 'ring' ? (g.hero.gear.ring1 && g.hero.gear.ring1.rarity === 3 ? 'ring2' : 'ring1') : s;
    g.hero.gear[slot] = it;
    // (a two-handed weapon leaves no room for what was beside the old one)
    if (slot === 'mainhand' && it.hands === 2 && it.weapon !== 'bow') g.hero.gear.offhand = null;
  }
  g.refresh();
  g.hero.life = g.hero.d.maxLife;
  return g;
}

/** His sockets set as told (each list: in front, then behind), nothing asked of the pouch. */
export function words(g: Game, skill: number, front: (WordId | null)[], behind: (WordId | null)[] = []): void {
  const s = g.hero.skills[skill];
  s.front = [...front];
  s.behind = [...behind];
  while (s.front.length < 2) s.front.push(null);
  while (s.behind.length < 2) s.behind.push(null);
  g.refresh();
}

export function wait(g: Game, seconds: number, c: Controls = emptyControls(), each?: () => void): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    if (each) each();
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
  return ev;
}

/** The 'unique' events among these, of that unique and that moment. */
export function seen(ev: readonly GameEvent[], id: string, what?: string): Extract<GameEvent, { t: 'unique' }>[] {
  return ev.filter((e): e is Extract<GameEvent, { t: 'unique' }> => e.t === 'unique' && e.id === id && (what === undefined || e.what === what));
}
