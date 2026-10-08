// Power word combinations, tested exhaustively.
//
// An attack ability holds up to two words in front and two behind. A side may hold any one word or
// any two different words, except two elements ("one element per side"): 43 ways to fill a side,
// 43 x 43 = 1,849 loadouts for an ability, and there are twelve abilities that take words (since
// Version 12.2: the nine attacks the weapons give, Strike, Slam, Whirlwind, Shot, Volley, Wave,
// Orb, Familiar and Beam, and the three evasive moves, Leap, Trap and Warp). Every one of those
// 22,188 loadouts is built and used here, on monsters, in the practice room:
//   - its numbers must be exactly what its words give one at a time (no word disturbs another);
//   - when used, every word on it must be seen to act (the hit, the wake, the echo, the rune...);
//   - nothing may go wrong: no error, no number that is not a number, nothing past its cap,
//     nothing of the hero's own that harms the hero, nothing left running afterwards.
// A second test puts random four-word loadouts on both abilities at once in a live fight.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SKILLS, TUNE, WORDS } from '../src/game/defs';
import type { SkillDef } from '../src/game/defs';
import { Game } from '../src/game/game';
import { RNG } from '../src/engine/rng';
import { emptyControls } from '../src/game/state';
import type { Derived, GameEvent, Monster, Resolved } from '../src/game/state';
import { CLASS_IDS, WORD_IDS } from '../src/game/types';
import type { ClassId, Element, WeaponKind, WordId } from '../src/game/types';
import { resolveSkill, skillName, socketProblem } from '../src/game/words';
import { land } from './helpers';

const ELEMENTS: readonly WordId[] = ['fire', 'frost', 'lightning'];
const isElement = (w: WordId): boolean => ELEMENTS.includes(w);
const DT = 1 / 30;
const near = (a: number, b: number, what: string): void => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${what}: ${a} is not ${b}`);

/** Every legal way to fill one side of an ability: empty, one word, or two different words that are not both elements. */
function sides(): WordId[][] {
  const out: WordId[][] = [[]];
  for (const w of WORD_IDS) out.push([w]);
  for (let i = 0; i < WORD_IDS.length; i++) {
    for (let j = i + 1; j < WORD_IDS.length; j++) {
      if (isElement(WORD_IDS[i]) && isElement(WORD_IDS[j])) continue;
      out.push([WORD_IDS[i], WORD_IDS[j]]);
    }
  }
  return out;
}

const tag = (cls: ClassId, def: SkillDef, front: readonly WordId[], behind: readonly WordId[]): string => `${cls}: ${skillName(def, front, behind)}`;

// ---------------------------------------------------------------------------------------------
// The numbers

/**
 * What the loadout's numbers must be, put together from what each of its words gives on its own.
 * (So this test survives any retuning of a word, and fails if one word ever disturbs another.)
 */
function checkNumbers(def: SkillDef, front: readonly WordId[], behind: readonly WordId[], cls: ClassId, d: Derived, r: Resolved, name: string): void {
  const bare = resolveSkill(def, [], [], cls, d);
  const solos: Resolved[] = [...front.map((w) => resolveSkill(def, [w], [], cls, d)), ...behind.map((w) => resolveSkill(def, [], [w], cls, d))];
  const inFront = (w: WordId): Resolved | null => (front.includes(w) ? resolveSkill(def, [w], [], cls, d) : null);
  const atBack = (w: WordId): Resolved | null => (behind.includes(w) ? resolveSkill(def, [], [w], cls, d) : null);
  const scaled = (pick: (x: Resolved) => number): number => solos.reduce((v, s) => (pick(bare) !== 0 ? (v * pick(s)) / pick(bare) : v), pick(bare));

  near(r.dmgMult, scaled((x) => x.dmgMult), `${name} damage`);
  near(r.size, scaled((x) => x.size), `${name} size`);
  near(r.cooldown, scaled((x) => x.cooldown), `${name} cooldown`);
  near(r.rate, scaled((x) => x.rate), `${name} attack rate`);
  near(r.projSpeed, scaled((x) => x.projSpeed), `${name} shot speed`);
  assert.equal(r.mana, bare.mana, `${name} mana`);
  for (const v of [r.dmgMult, r.size, r.cooldown, r.rate, r.projSpeed]) assert.ok(Number.isFinite(v) && v >= 0, `${name}: a number went wrong`);
  assert.ok(r.dmgMult > 0 && r.size > 0 && r.rate > 0, `${name}: damage, size and rate are above nothing`);

  // in front
  const twin = inFront('twin');
  assert.equal(r.count, twin ? 2 : 1, `${name} count`);
  assert.equal(r.countDmg, twin ? twin.countDmg : 1, `${name} damage of each of the pair`);
  assert.equal(r.ignite, inFront('fire')?.ignite ?? 0, `${name} burn`);
  assert.equal(r.chill, inFront('frost')?.chill ?? 0, `${name} chill`);
  assert.equal(r.arcs, inFront('lightning')?.arcs ?? 0, `${name} arcs`);
  assert.equal(r.arcDmg, inFront('lightning')?.arcDmg ?? 0, `${name} arc damage`);
  assert.equal(r.leech, inFront('leech')?.leech ?? 0, `${name} leech`);
  assert.equal(r.volatile, inFront('volatile')?.volatile ?? 0, `${name} volatile`);
  assert.equal(r.poison, inFront('poison')?.poison ?? 0, `${name} poison`);
  assert.equal(r.splash, Math.max(0, ...front.map((w) => resolveSkill(def, [w], [], cls, d).splash)), `${name} splash`);
  assert.equal(r.splashDmg, Math.max(0, ...front.map((w) => resolveSkill(def, [w], [], cls, d).splashDmg)), `${name} splash damage`);
  // behind
  assert.equal(r.might, atBack('power')?.might ?? 0, `${name} might`);
  assert.equal(r.haste, atBack('swift')?.haste ?? 0, `${name} haste`);
  assert.equal(r.echo, atBack('twin')?.echo ?? 0, `${name} echo`);
  assert.equal(r.orbChance, atBack('leech')?.orbChance ?? 0, `${name} orb chance`);
  assert.equal(r.rune, atBack('volatile')?.rune ?? 0, `${name} rune`);
  assert.equal(r.cloud, atBack('poison')?.cloud ?? 0, `${name} cloud`);
  const ground = behind.find(isElement);
  assert.deepEqual(r.zone, ground ? resolveSkill(def, [], [ground], cls, d).zone : null, `${name} ground`);
  assert.equal(r.pierce, !!ground, `${name} passes through`);
  // the element is the one in front, failing that the one behind
  const el = (front.find(isElement) ?? behind.find(isElement)) as WordId | undefined;
  assert.equal(r.element, el ? (WORDS[el].element as Element) : 'phys', `${name} element`);
  // every word says what it does, and is in the name
  assert.equal(r.lines.length, 1 + front.length + behind.length, `${name}: one line of description for each word`);
  assert.equal(r.name, skillName(def, front, behind));
  for (const w of front) assert.ok(r.name.includes(WORDS[w].front), `${name} names ${w} in front`);
  for (const w of behind) assert.ok(r.name.includes(WORDS[w].behind.replace(/^of /, '')), `${name} names ${w} behind`);
}

/** What each word must do on its own: checked once per ability, so the composition above means something. */
function checkWordAlone(def: SkillDef, cls: ClassId, d: Derived): void {
  const bare = resolveSkill(def, [], [], cls, d);
  // (one enemy at a time: a blade, a shot, a familiar's bolt)
  const single = def.kind === 'melee' || def.kind === 'projectile' || def.kind === 'summon';
  const f = (w: WordId): Resolved => resolveSkill(def, [w], [], cls, d);
  const b = (w: WordId): Resolved => resolveSkill(def, [], [w], cls, d);
  const n = `${cls} ${def.name}`;
  assert.ok(f('power').dmgMult > bare.dmgMult && f('power').size > bare.size, `${n}: Power is more damage and more size`);
  if (single) assert.ok(f('power').splash > 0, `${n}: Power splashes`);
  if (def.cooldown > 0) assert.ok(f('swift').cooldown < bare.cooldown, `${n}: Swift is a shorter cooldown`);
  else assert.ok(f('swift').rate > bare.rate, `${n}: Swift is a faster attack`);
  if (def.speed > 0) assert.ok(f('swift').projSpeed > bare.projSpeed, `${n}: Swift is a faster shot`);
  assert.ok(f('twin').count === 2 && f('twin').countDmg > 0 && f('twin').countDmg <= 0.8, `${n}: Twin is two, each weaker than one`);
  assert.ok(f('poison').poison > 0 && f('poison').dmgMult < bare.dmgMult, `${n}: Poison poisons, and its hit is softer`);
  assert.ok(b('poison').cloud > 0 && b('poison').dmgMult === bare.dmgMult, `${n}: of Venom leaves a cloud`);
  assert.equal(bare.mana, 0, `${n}: with cooldowns as the limit, nothing costs mana`);
  assert.ok(f('fire').ignite > 0 && f('fire').element === 'fire', `${n}: Flame burns`);
  assert.ok(f('frost').chill > 0 && f('frost').element === 'frost', `${n}: Frost chills`);
  assert.ok(f('lightning').arcs >= 2 && f('lightning').arcDmg > 0 && f('lightning').element === 'lightning', `${n}: Lightning arcs`);
  if (single) assert.ok(f('fire').splash > 0 && f('frost').splash > 0, `${n}: Flame and Frost burst on contact`);
  assert.ok(f('leech').leech > 0, `${n}: Leeching heals`);
  assert.ok(f('volatile').volatile > 0, `${n}: Volatile makes its kills explode`);
  assert.ok(b('power').might > 0, `${n}: of Power gives might`);
  assert.ok(b('swift').haste > 0, `${n}: of Swiftness gives haste`);
  assert.ok(b('twin').echo > 0 && b('twin').echo <= 1, `${n}: of Echoes repeats, no stronger than the first`);
  for (const [w, kind] of [['fire', 'burn'], ['frost', 'ice'], ['lightning', 'storm']] as const) {
    const z = b(w).zone;
    assert.ok(z && z.kind === kind && z.dps > 0 && z.dur > 0, `${n}: of ${w} leaves ${kind} ground`);
    assert.ok(b(w).dmgMult < bare.dmgMult, `${n}: of ${w} hits a little softer`);
    assert.equal(b(w).element, WORDS[w].element, `${n}: of ${w} alone decides the element`);
  }
  assert.ok(b('leech').orbChance > 0 && b('leech').orbChance <= 1, `${n}: of Leeching has a chance of a life orb`);
  assert.ok(b('volatile').rune > 0, `${n}: of Ruin leaves a rune`);
}

// ---------------------------------------------------------------------------------------------
// The use

/** Where the test monsters stand (relative to the hero, who faces +x), and where the ability is aimed. */
function layout(kind: SkillDef['kind']): { spots: [number, number][]; aim: [number, number] } {
  switch (kind) {
    case 'melee': return { spots: [[1.1, 0], [1.6, 0.8], [1.6, -0.8]], aim: [1.1, 0] };
    case 'burst': return { spots: [[1.4, 0], [2.2, 0.7], [2.2, -0.7]], aim: [1.4, 0] };
    // a whirlwind cuts all round the hero
    case 'whirl': return { spots: [[1.2, 0], [-1.0, 0.8], [0.3, -1.3]], aim: [1.2, 0] };
    case 'projectile': return { spots: [[3, 0], [3.9, 0.5], [3.9, -0.5]], aim: [3, 0] };
    // a wave passes over them; an orb is set down among them; a beam runs along them
    case 'wave': return { spots: [[2.5, 0], [3.5, 0.6], [4.5, -0.6]], aim: [3, 0] };
    case 'orb': return { spots: [[3, 0], [3.9, 0.5], [3.9, -0.5]], aim: [3, 0] };
    case 'beam': return { spots: [[2.5, 0], [3.5, 0.3], [4.5, -0.3]], aim: [3, 0] };
    // (Version 12.2) a volley rains on them
    case 'volley': return { spots: [[3, 0], [3.8, 0.5], [3.8, -0.5]], aim: [3, 0] };
    // the evasive moves: a leap comes down among them; a roll leaves its trap under their feet
    // (they stand round where it begins); a warp bursts among two of them where it arrives, and
    // the third stands where it began, in whatever the words behind it leave there
    case 'leap': return { spots: [[4.9, 0], [4.2, 0.9], [4.2, -0.9]], aim: [4, 0] };
    case 'roll': return { spots: [[0.9, 0.3], [-0.5, 0.8], [0.1, -1.0]], aim: [-4, 0] };
    case 'warp': return { spots: [[4.9, 0], [4.2, 0.9], [0.7, 0.6]], aim: [4, 0] };
    default: return { spots: [[2.5, 0], [3.1, 0.5], [3.1, -0.5]], aim: [2.5, 0] };
  }
}

interface Seen {
  events: GameEvent[];
  /** Right after the ability was used. */
  shots: number;
  shotTwins: number;
  traps: number;
  /** At any time during the run: the most of the hero's shots in the air at once, and whether a mirror's shot was among them. */
  mostShots: number;
  twinSeen: boolean;
  might: number;
  haste: number;
  /** At any time during the run. */
  burned: boolean;
  chilled: boolean;
  poisoned: boolean;
  orbDrops: number;
  g: Game;
}

/** A practice character of a class, carrying a weapon of that kind (their own, or one out of the practice bag: any character can use any weapon). */
function practice(cls: ClassId, weapon: WeaponKind, seed = 5): Game {
  const g = Game.forPractice(cls, seed);
  if (g.weapon() !== weapon) {
    const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
    assert.ok(i >= 0, `the practice bag holds a ${weapon}`);
    assert.equal(g.equipFromBag(i), null, `a ${cls} can put on a ${weapon}`);
  }
  assert.equal(g.weapon(), weapon);
  return g;
}

/** A practice room with three monsters that stand still and never strike; the hero uses ability `skill` once. */
function useOnce(cls: ClassId, weapon: WeaponKind, skill: number, front: readonly WordId[], behind: readonly WordId[], weak: boolean, name: string): Seen {
  const g = practice(cls, weapon);
  const a = g as unknown as { waveT: number; rng: RNG; later: unknown[]; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
  a.waveT = 1e9; // no packs of its own
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const w of front) assert.equal(g.socket(skill, 'front', w), null, `${name}: ${w} goes in front`);
  for (const w of behind) assert.equal(g.socket(skill, 'behind', w), null, `${name}: ${w} goes behind`);
  const s = h.skills[skill];
  const def = SKILLS[s.id];
  checkNumbers(def, front, behind, cls, h.d, s.r, name);
  // (a life orb is a matter of chance; here the chance is made certain so the rule itself is tested)
  if (weak && s.r.orbChance > 0) s.r.orbChance = 1;
  const lay = layout(def.kind);
  for (const [dx, dy] of lay.spots) {
    assert.equal(g.level.walk[Math.floor(h.y + dy) * g.level.floor.w + Math.floor(h.x + dx)], 1, 'the test monsters stand on open floor');
    const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
    a.wakeUp(m);
    m.speed = 0;
    m.cd = 1e9;
    if (weak) m.life = 1;
    else m.life = m.maxLife = 1e7;
  }
  g.events.length = 0;
  h.mana = h.d.maxMana;
  const c = emptyControls();
  c.aimX = h.x + lay.aim[0];
  c.aimY = h.y + lay.aim[1];
  c.castX = c.aimX;
  c.castY = c.aimY;
  if (skill === 0) c.fire = true;
  else if (skill === 1) c.cast = true;
  else {
    c.evade = true;
    c.evadeX = c.aimX;
    c.evadeY = c.aimY;
  }
  const seen: Seen = { events: [], shots: 0, shotTwins: 0, traps: 0, mostShots: 0, twinSeen: false, might: 0, haste: 0, burned: false, chilled: false, poisoned: false, orbDrops: 0, g };
  const life0 = h.life;
  /** What is looked at after every step of the game, from the press to the end. */
  const look = (): void => {
    for (const e of g.events) seen.events.push(e);
    g.events.length = 0;
    for (const m of g.monsters) {
      if (m.burnT > 0) seen.burned = true;
      if (m.chillT > 0 || m.frozenT > 0) seen.chilled = true;
      for (const v of [m.x, m.y, m.life, m.burnDps, m.chill]) assert.ok(Number.isFinite(v), `${name}: a monster's numbers stay numbers`);
    }
    seen.orbDrops = Math.max(seen.orbDrops, g.drops.filter((dr) => dr.kind === 'orb').length);
    for (const m of g.monsters) if (m.poisonT > 0) seen.poisoned = true;
    for (const v of [h.x, h.y, h.life, h.mana, h.might, h.haste]) assert.ok(Number.isFinite(v), `${name}: the hero's numbers stay numbers`);
    // (might comes from what LANDS, since Version 12.2: an arrow in flight, a volley still in the air, a trap not yet stepped on have given none yet)
    seen.might = Math.max(seen.might, h.might);
    for (const p of g.projectiles) for (const v of [p.x, p.y, p.vx, p.vy, p.dmg]) assert.ok(Number.isFinite(v), `${name}: a shot's numbers stay numbers`);
    seen.mostShots = Math.max(seen.mostShots, g.projectiles.filter((p) => !p.hostile).length);
    if (g.projectiles.some((p) => !p.hostile && p.n > 0)) seen.twinSeen = true;
    assert.ok(g.orbs.length <= 1, `${name}: one use sets one orb`);
    assert.ok(g.familiars.length <= TUNE.familiarMax, `${name}: no more familiars than there may be`);
    for (const o of g.orbs) for (const v of [o.x, o.y, o.t, o.next, o.frac]) assert.ok(Number.isFinite(v), `${name}: an orb's numbers stay numbers`);
    for (const q of g.familiars) for (const v of [q.x, q.y, q.t, q.next, q.frac]) assert.ok(Number.isFinite(v), `${name}: a familiar's numbers stay numbers`);
    for (const z of g.zones) for (const v of [z.x, z.y, z.r, z.dmg, z.t]) assert.ok(Number.isFinite(v), `${name}: the ground's numbers stay numbers`);
    assert.ok(g.zones.length <= TUNE.maxZones, `${name}: ground patches stay under their cap`);
    assert.ok(g.projectiles.length <= 8 && g.traps.length <= 6, `${name}: one use does not flood the room`);
    assert.ok(h.life >= life0 && h.burnT <= 0 && h.chillT <= 0 && h.poisonT <= 0, `${name}: nothing of the hero's own harms the hero`);
  };
  // The ability is asked for, and (since Version 11) lands when its wind-up is over. What it
  // looses is counted in the step it lands in, which used to be the step it was pressed in; and
  // the time allowed for everything it sets going runs from there, as it always did.
  // (An attack that goes on while it is held, Whirlwind or Beam, is held for a good second: long
  // enough for it to leave twice what the words behind it leave, short of its whole length.)
  const held = def.channel ? Math.min(def.channel * 0.6, TUNE.channelWake + 0.25) : 0;
  c.hold = held > 0;
  g.update(DT, c);
  c.fire = false;
  c.cast = false;
  c.evade = false;
  look();
  land(g, c, DT, look);
  assert.equal(s.uses, 1, `${name}: the ability was used`);
  if (held > 0) {
    assert.ok(h.channel, `${name}: it is going on`);
    for (let t = 0; t < held; t += DT) {
      g.update(DT, c);
      look();
    }
    c.hold = false;
    g.update(DT, c);
    look();
    assert.equal(h.channel, null, `${name}: let go, it is over`);
  }
  const mine = g.projectiles.filter((p) => !p.hostile);
  seen.shots = mine.length;
  seen.shotTwins = mine.filter((p) => p.n > 0).length;
  seen.traps = g.traps.length;
  seen.haste = h.hasteT > 0 ? h.haste : 0;
  // (long enough for everything it set going to be over: an orb's time and its last wave; a
  // familiar's time, the one "of Echoes" calls after it, its last bolt and what that bolt leaves)
  // (a volley: the arrows in the air, the rain, and the same again for the one "of Echoes" looses)
  const until = def.kind === 'orb' ? TUNE.orbLife + 1.8 : def.kind === 'summon' ? TUNE.familiarLife + 3.2 : def.kind === 'volley' ? (TUNE.volleyDelay + TUNE.volleyLife) * 2 + 3 : 3.6;
  for (let step = 1; step * DT < until; step++) {
    g.update(DT, c);
    look();
  }
  for (const e of seen.events) {
    if (e.t === 'hit') assert.ok(Number.isInteger(e.amount) && e.amount >= 1 && e.amount < 1e6, `${name}: every hit is a sane whole number (${e.amount})`);
    if (e.t === 'burst' || e.t === 'zone') assert.ok(Number.isFinite(e.r) && e.r > 0 && e.r < 12, `${name}: every area is a sane size (${e.r})`);
  }
  assert.equal(g.over, false);
  assert.equal(a.later.length, 0, `${name}: nothing is still waiting to happen`);
  assert.equal(g.projectiles.length, 0, `${name}: no shot is still flying`);
  assert.ok(!g.zones.some((z) => z.kind === 'rune'), `${name}: no rune is still waiting`);
  assert.equal(g.orbs.length + g.familiars.length + g.volleys.length, 0, `${name}: no orb, no familiar and no volley is still about`);
  return seen;
}

/** Every word on the loadout must have been seen to act. */
function checkActed(def: SkillDef, front: readonly WordId[], behind: readonly WordId[], seen: Seen, weak: boolean, name: string): void {
  const ev = seen.events;
  const any = (p: (e: GameEvent) => boolean): boolean => ev.some(p);
  const count = (p: (e: GameEvent) => boolean): number => ev.filter(p).length;
  const r = seen.g.hero.skills.find((s) => s.id === def.id)!.r;
  const hits = ev.filter((e) => e.t === 'hit' && !e.onHero);
  assert.ok(hits.length > 0, `${name}: it hit something`);
  if (front.length || behind.length) {
    const casts = ev.filter((e) => e.t === 'cast' && !e.echo);
    assert.equal(casts.length, 1, `${name}: the effects are told of the use`);
    const cast = casts[0] as Extract<GameEvent, { t: 'cast' }>;
    assert.deepEqual([...cast.words].sort(), [...front].sort(), `${name}: ...with its words in front`);
    assert.deepEqual([...cast.behind].sort(), [...behind].sort(), `${name}: ...and its words behind`);
    assert.equal(cast.el, r.element);
  }
  const first = hits[0] as Extract<GameEvent, { t: 'hit' }>;
  assert.equal(first.el, r.element, `${name}: the hit is of the ability's element`);
  if (front.length) assert.deepEqual([...(first.words ?? [])].sort(), [...front].sort(), `${name}: the hit carries the words in front`);

  // ---- in front: the hit
  if (front.includes('power')) assert.ok(any((e) => e.t === 'hit' && !e.onHero && e.heavy === true), `${name}: Power lands heavily`);
  if (front.includes('twin')) {
    if (def.kind === 'melee') assert.ok(any((e) => e.t === 'swing' && !e.echo && e.n === 0) && any((e) => e.t === 'swing' && !e.echo && e.n === 1), `${name}: Twin cuts twice`);
    else if (def.kind === 'burst' || def.kind === 'orb' || def.kind === 'whirl' || def.kind === 'leap' || def.kind === 'warp') assert.ok(any((e) => e.t === 'burst' && !e.echo && e.n === 0) && any((e) => e.t === 'burst' && !e.echo && e.n === 1), `${name}: Twin bursts twice`);
    else if (def.kind === 'volley') assert.ok(any((e) => e.t === 'volleyFall' && !e.echo && e.n === 0) && any((e) => e.t === 'volleyFall' && !e.echo && e.n === 1) && count((e) => e.t === 'volleyUp' && !e.echo) === 1, `${name}: Twin brings the arrows down in pairs`);
    else if (def.kind === 'projectile') assert.ok(seen.shots === 2 && seen.shotTwins === 1, `${name}: Twin looses two shots, one of them the mirror's`);
    else if (def.kind === 'wave') assert.ok(seen.shots === 2 && seen.shotTwins === 1 && count((e) => e.t === 'wave' && !e.echo) === 1, `${name}: Twin sends two waves, one of them the mirror's`);
    else if (def.kind === 'beam') assert.ok(any((e) => e.t === 'beamBite' && e.n === 0) && any((e) => e.t === 'beamBite' && e.n === 1), `${name}: Twin fires two beams`);
    else if (def.kind === 'summon') assert.ok(seen.twinSeen && seen.mostShots >= 2, `${name}: Twin makes every familiar shoot two bolts, one of them the mirror's`);
    else assert.equal(seen.traps, 2, `${name}: Twin lays two traps`);
  } else if (def.kind === 'projectile') assert.equal(seen.shots, 1, `${name}: one shot`);
  else if (def.kind === 'wave') assert.ok(seen.shots === 1 && count((e) => e.t === 'wave' && !e.echo) === 1, `${name}: one wave`);
  else if (def.kind === 'roll') assert.equal(seen.traps, 1, `${name}: one trap`);
  else if (def.kind === 'volley') assert.ok(count((e) => e.t === 'volleyUp' && !e.echo) === 1 && !any((e) => e.t === 'volleyFall' && e.n > 0), `${name}: one volley, its arrows one at a time`);
  else if (def.kind === 'beam') assert.ok(any((e) => e.t === 'beamBite' && e.n === 0) && !any((e) => e.t === 'beamBite' && e.n > 0), `${name}: one beam`);
  else if (def.kind === 'summon') assert.ok(!seen.twinSeen, `${name}: one bolt at a time`);
  if (def.kind === 'orb') assert.equal(count((e) => e.t === 'orbSet'), 1, `${name}: one orb is set`);
  if (def.channel) {
    assert.deepEqual([count((e) => e.t === 'channel'), count((e) => e.t === 'channelEnd')], [1, 1], `${name}: it began once and ended once`);
    assert.ok(count((e) => (e.t === 'burst' && e.style === 'whirl' && !e.echo && (e.n ?? 0) === 0) || (e.t === 'beamBite' && e.n === 0)) >= 3, `${name}: held a second, it bit several times`);
  }
  if (def.kind === 'summon') assert.equal(count((e) => e.t === 'familiar' && !e.echo), 1, `${name}: one familiar is called`);
  // (what dies at a touch is gone before it can be seen burning or chilled)
  if (front.includes('fire')) assert.ok(any((e) => e.t === 'ignite') && (weak || seen.burned), `${name}: Flame sets it burning`);
  if (front.includes('frost') && !weak) assert.ok(seen.chilled, `${name}: Frost chills it`);
  if (front.includes('lightning')) assert.ok(any((e) => e.t === 'arc' && e.sky === true) && any((e) => e.t === 'arc' && !e.sky), `${name}: Lightning comes down and jumps on`);
  if (front.includes('leech')) assert.ok(any((e) => e.t === 'leech' && e.n > 0), `${name}: Leeching draws life`);
  if (front.includes('volatile') && weak) assert.ok(any((e) => e.t === 'burst' && e.style === 'blast' && e.r === 1.8 && !!e.words && e.words.length === 1 && e.words[0] === 'volatile'), `${name}: what Volatile kills explodes`);
  // (poison takes hold of what lives through the hit, and then works on it)
  if (front.includes('poison') && !weak) assert.ok(any((e) => e.t === 'poisoned') && seen.poisoned && any((e) => e.t === 'hit' && !e.onHero && e.poison === true), `${name}: Poison takes hold, and works`);
  if (!front.includes('poison') && !behind.includes('poison')) assert.ok(!any((e) => e.t === 'poisoned' || (e.t === 'hit' && e.poison === true)) && !seen.poisoned, `${name}: no poison without the word`);

  // ---- behind: the wake
  if (behind.includes('power')) assert.ok(any((e) => e.t === 'buff' && e.kind === 'might' && e.stacks === 1) && seen.might > 0, `${name}: of Power gives might`);
  else assert.equal(seen.might, 0);
  if (behind.includes('swift')) assert.ok(any((e) => e.t === 'buff' && e.kind === 'haste') && seen.haste > 0, `${name}: of Swiftness gives haste`);
  else assert.equal(seen.haste, 0);
  if (behind.includes('twin')) {
    assert.ok(any((e) => e.t === 'echo' && e.delay > 0), `${name}: of Echoes is announced`);
    assert.equal(count((e) => e.t === 'cast' && e.echo), 1, `${name}: ...and repeats once, and only once`);
    if (def.kind === 'melee') assert.ok(any((e) => e.t === 'swing' && e.echo === true), `${name}: the echo cuts`);
    if (def.kind === 'burst' || def.kind === 'orb' || def.kind === 'whirl' || def.kind === 'leap' || def.kind === 'warp') assert.ok(any((e) => e.t === 'burst' && e.echo === true), `${name}: the echo bursts`);
    if (def.kind === 'volley') assert.ok(any((e) => e.t === 'volleyUp' && e.echo === true) && any((e) => e.t === 'volleyFall' && e.echo === true), `${name}: the echo is a second rain`);
    if (def.kind === 'roll') assert.equal(count((e) => e.t === 'trapSet'), front.includes('twin') ? 3 : 2, `${name}: the echo lays one more trap`);
    if (def.kind === 'beam') assert.ok(any((e) => e.t === 'beam' && e.echo === true), `${name}: the echo is a second beam`);
    if (def.kind === 'wave') assert.ok(any((e) => e.t === 'wave' && e.echo === true), `${name}: the echo is a second wave`);
    if (def.kind === 'summon') assert.ok(any((e) => e.t === 'familiar' && e.echo === true), `${name}: the echo is a second familiar`);
    // (haste is given by the use, once: the echo is not a use. Might is given by every blow that
    // lands, and the echo's blow is one: see tests/power.test.ts.)
    assert.equal(count((e) => e.t === 'buff' && e.kind === 'haste'), behind.includes('swift') ? 1 : 0, `${name}: the echo does not give haste again`);
  } else assert.ok(!any((e) => (e.t === 'cast' && e.echo) || e.t === 'echo'), `${name}: no echo without of Echoes`);
  const ground = behind.find(isElement);
  for (const [w, kind] of [['fire', 'burn'], ['frost', 'ice'], ['lightning', 'storm']] as const) {
    if (ground === w) assert.ok(any((e) => e.t === 'zone' && e.kind === kind), `${name}: of ${w} leaves ${kind} ground`);
    else assert.ok(!any((e) => e.t === 'zone' && e.kind === kind), `${name}: no ${kind} ground without of ${w}`);
  }
  if (behind.includes('poison')) assert.ok(any((e) => e.t === 'zone' && e.kind === 'venom'), `${name}: of Venom leaves its cloud`);
  else assert.ok(!any((e) => e.t === 'zone' && e.kind === 'venom'), `${name}: no cloud without of Venom`);
  if (behind.includes('poison') && !weak) assert.ok(seen.poisoned, `${name}: ...and what stands in the cloud is poisoned`);
  if (behind.includes('leech')) {
    assert.ok(any((e) => e.t === 'mark'), `${name}: of Leeching marks what it hits`);
    if (weak) assert.ok(any((e) => e.t === 'orb') && seen.orbDrops > 0, `${name}: of Leeching tears a life orb out of a kill`);
  } else assert.ok(!any((e) => e.t === 'mark' || e.t === 'orb'), `${name}: no mark without of Leeching`);
  if (behind.includes('volatile')) {
    const runes = count((e) => e.t === 'zone' && e.kind === 'rune');
    assert.ok(runes >= 1, `${name}: of Ruin writes a rune`);
    assert.equal(count((e) => e.t === 'burst' && e.style === 'ruin'), runes, `${name}: ...and every rune goes off`);
  } else assert.ok(!any((e) => (e.t === 'zone' && e.kind === 'rune') || (e.t === 'burst' && e.style === 'ruin')), `${name}: no rune without of Ruin`);
  if (weak) assert.ok(seen.g.kills > 0, `${name}: weak monsters die to it`);
}

// ---------------------------------------------------------------------------------------------

test('the rule of the sockets: any word or any two different words to a side, but never two elements', () => {
  const all = sides();
  assert.equal(all.length, 43);
  for (const a of WORD_IDS) {
    for (const b of WORD_IDS) {
      const why = socketProblem([a, null], b);
      if (a === b) assert.equal(why, 'Already there');
      else if (isElement(a) && isElement(b)) assert.equal(why, 'One element per side');
      else assert.equal(why, null, `${a} and ${b} share a side`);
    }
    assert.equal(socketProblem([a, 'power' === a ? 'swift' : 'power'], 'leech' === a ? 'twin' : 'leech'), 'No free socket');
  }
});

/**
 * Every ability that takes words, and a character who has it: each class with the weapon it
 * begins with (its quick attack, its slow one and, since Version 12.2, its evasive move), the
 * warrior with the one-handed sword for Slam, and the mage with a wand for Familiar and Beam.
 */
const CASES: readonly { cls: ClassId; weapon: WeaponKind; skill: 0 | 1 | 2 }[] = [
  { cls: 'warrior', weapon: 'greatsword', skill: 0 },
  { cls: 'warrior', weapon: 'greatsword', skill: 1 },
  { cls: 'warrior', weapon: 'sword', skill: 1 },
  { cls: 'ranger', weapon: 'bow', skill: 0 },
  { cls: 'ranger', weapon: 'bow', skill: 1 },
  { cls: 'mage', weapon: 'staff', skill: 0 },
  { cls: 'mage', weapon: 'staff', skill: 1 },
  { cls: 'mage', weapon: 'wand', skill: 0 },
  { cls: 'mage', weapon: 'wand', skill: 1 },
  { cls: 'warrior', weapon: 'greatsword', skill: 2 },
  { cls: 'ranger', weapon: 'bow', skill: 2 },
  { cls: 'mage', weapon: 'staff', skill: 2 },
];

test('between them the cases use every ability that takes words, once each', () => {
  const used = CASES.map((k) => practice(k.cls, k.weapon).hero.skills[k.skill].id).sort();
  const all = Object.values(SKILLS).filter((d) => d.sockets).map((d) => d.id).sort();
  assert.deepEqual(used, all);
});

for (const { cls, weapon, skill } of CASES) {
  const def = SKILLS[practice(cls, weapon).hero.skills[skill].id];
  test(`every loadout of ${def.name} (a ${cls} with a ${weapon}): each word acts, the numbers add up, nothing goes wrong`, () => {
    checkWordAlone(def, cls, practice(cls, weapon).hero.d);
    const all = sides();
    let loadouts = 0;
    let uses = 0;
    for (const front of all) {
      for (const behind of all) {
        const name = tag(cls, def, front, behind);
        loadouts++;
        // against monsters that can take it: every word that acts on a hit must act
        checkActed(def, front, behind, useOnce(cls, weapon, skill, front, behind, false, name), false, name);
        uses++;
        // against monsters that die at a touch: the words that act on a kill
        if (front.includes('volatile') || behind.includes('leech')) {
          checkActed(def, front, behind, useOnce(cls, weapon, skill, front, behind, true, `${name} (kills)`), true, `${name} (kills)`);
          uses++;
        }
      }
    }
    assert.equal(loadouts, 43 * 43);
    console.log(`${cls} ${def.name}: ${loadouts} loadouts, ${uses} uses, all in order`);
  });
}

test('a swing that meets nothing still leaves its wake, as a shot does where it ends', () => {
  for (const [w, kind] of [['fire', 'burn'], ['frost', 'ice'], ['lightning', 'storm'], ['volatile', 'rune'], ['poison', 'venom']] as const) {
    const g = Game.forPractice('warrior', 3);
    (g as unknown as { waveT: number }).waveT = 1e9;
    g.monsters.length = 0;
    const h = g.hero;
    h.x = 14.5;
    h.y = 15.5;
    assert.equal(g.socket(0, 'behind', w), null);
    g.events.length = 0;
    const c = emptyControls();
    c.aimX = h.x + 2;
    c.aimY = h.y;
    c.fire = true;
    g.update(DT, c);
    c.fire = false;
    // (the blade passes a moment after the Strike is asked for: its wind-up, since Version 11)
    land(g, c, DT);
    assert.ok(g.events.some((e) => e.t === 'zone' && e.kind === kind), `a Strike of ${w} into thin air leaves its ${kind}`);
    const z = g.zones.find((o) => o.kind === kind)!;
    assert.ok(z.x > h.x + 0.5 && Math.abs(z.y - h.y) < 0.2, 'ahead of the hero, where the blade passed');
  }
});

test('random four-word loadouts on all three abilities at once hold up in a live fight', () => {
  const rng = new RNG(20261003);
  const all = sides().filter((s) => s.length === 2);
  let fights = 0;
  let kills = 0;
  let mostZones = 0;
  let mostShots = 0;
  // (each class with its own weapon, the mage with a wand as well, and three with a weapon that
  // is not their class's own: any character can use any weapon, and both attacks come with it)
  const fighters: [ClassId, WeaponKind][] = [['warrior', 'greatsword'], ['ranger', 'bow'], ['mage', 'staff'], ['mage', 'wand'], ['warrior', 'staff'], ['ranger', 'wand'], ['mage', 'sword']];
  for (const [cls, weapon] of fighters) {
    for (let k = 0; k < 24; k++) {
      const g = practice(cls, weapon, 100 + k);
      const h = g.hero;
      const names: string[] = [];
      for (const skill of [0, 1, 2]) {
        const front = rng.pick(all);
        const behind = rng.pick(all);
        for (const w of front) assert.equal(g.socket(skill, 'front', w), null);
        for (const w of behind) assert.equal(g.socket(skill, 'behind', w), null);
        names.push(h.skills[skill].r.name);
      }
      const name = `${cls} with a ${weapon}: ${names.join(' + ')}`;
      const c = emptyControls();
      try {
        for (let t = 0; t < 25; t += DT) {
          // fight the nearest thing with everything, all the time
          let best: Monster | null = null;
          let bd = Infinity;
          for (const m of g.monsters) {
            if (m.dead) continue;
            const d = Math.hypot(m.x - h.x, m.y - h.y);
            if (d < bd) {
              bd = d;
              best = m;
            }
          }
          c.fire = c.cast = c.approach = !!best;
          // (and the evasive move, with its words, every second or so: toward the enemy for a
          // leap or a warp, away from it for a roll, which leaves its trap behind)
          c.evade = !!best && Math.floor(t / DT) % 31 === 0;
          if (best) {
            c.aimX = c.castX = best.x;
            c.aimY = c.castY = best.y;
            const away = SKILLS[h.skills[2].id].kind === 'roll' ? -1 : 1;
            c.evadeX = h.x + (best.x - h.x) * away;
            c.evadeY = h.y + (best.y - h.y) * away;
          }
          g.update(DT, c);
          for (const e of g.events) if (e.t === 'hit') assert.ok(Number.isFinite(e.amount) && e.amount >= 1 && e.amount < 1e6, `a sane hit (${e.amount})`);
          g.events.length = 0;
          for (const v of [h.x, h.y, h.life, h.mana, h.might, h.haste]) assert.ok(Number.isFinite(v), 'the hero stays in one piece');
          for (const m of g.monsters) assert.ok(Number.isFinite(m.x) && Number.isFinite(m.y) && Number.isFinite(m.life), 'the monsters stay in one piece');
          assert.ok(g.zones.length <= TUNE.maxZones, 'ground patches stay under their cap');
          assert.ok(g.projectiles.length < 150 && g.traps.length <= 6 && g.volleys.length <= 4 && g.monsters.length < 400, 'the room does not flood');
          mostZones = Math.max(mostZones, g.zones.length);
          mostShots = Math.max(mostShots, g.projectiles.length);
        }
      } catch (err) {
        throw new Error(`${name}: ${(err as Error).message}`);
      }
      assert.equal(g.over, false, `${name}: the practice room never ends the run`);
      assert.ok(g.kills > 0, `${name}: it killed something in 25 seconds`);
      kills += g.kills;
      fights++;
    }
  }
  console.log(`${fights} fights of 25 s, ${kills} kills; most ground patches at once ${mostZones} (cap ${TUNE.maxZones}), most shots in the air ${mostShots}`);
});
