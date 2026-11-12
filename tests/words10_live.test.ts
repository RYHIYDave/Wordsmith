// THE TEN NEW WORDS, LIVE (queue item put-ten-new-words-live, 11 Nov 2026): Piercing, Bleeding, Reaping, Culling, Surging,
// Plundering and Mirroring (from floor 16), Lasting, Fleeting and Vast (from floor 6), with the art chat's looks, the sound
// chat's sixth batch and the Lexicon in five pages. The rules of the words are held by tests/last_words.test.ts and
// tests/three_words.test.ts, their looks by tests/words7*.test.ts and tests/words10*.test.ts. THIS file holds what joins them:
// - the switches are on;
// - each sound of the sixth batch is in the game, in its pack, fetched with its word, and asked for at its moment, no more
//   often than its gap;
// - the rules say what the looks asked to be told (chat board, 9 Nov 14:11 and 19:01): where gold sprays, who is culling,
//   whom a splash reaches, how wide a ring was before Vast, whose poison is on him, which ability made a boost;
// - the rules and the looks are of one mind where they must be: where his reflection stands, when a pane breaks, when a body
//   begins to rise, which of the Hushed are not shown cut in two;
// - a word newly found has its stud in the Lexicon until its page has been opened, and that is kept in his save.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { existsSync } from 'node:fs';
import type { RNG } from '../src/engine/rng';
import { CULL, HUSH_LEAVES, MIRRORING, PIERCE, REAP, SURGE, VAST, mirrorSide } from '../src/game/defs';
import { Game, cleanMeta } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Meta, Monster, Zone } from '../src/game/state';
import { LAST_WORD_IDS, WORD_IDS } from '../src/game/types';
import type { ClassId, MonsterKind, WordId } from '../src/game/types';
import { PAGE_TURN, WORD_AT, WORD_SOUND, WORD_SOUNDS, WORD_SOUND_NAMES, WORD_SOUND_SOFT, wordSoundsOf } from '../src/game/word_sounds';
import type { WordSound } from '../src/game/word_sounds';
import { W7_TIME, WORDS7_LOOK, ownsEventW7 } from '../src/render/words7';
import { WORDS10_LOOK, ownsEventW10 } from '../src/render/words10';
import { LEX28, lexSeen, wordFresh } from '../src/ui/lexicon28';
// @ts-ignore - a plain script of the build's
import { packOf } from '../tools/sound_packs.mjs';
import { land } from './helpers';

const DT = 1 / 30;
const TEN: readonly WordId[] = [...LAST_WORD_IDS, 'lasting', 'fleeting', 'vast'];

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  kill(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean, sure?: boolean): void;
  boons(i: number): void;
}

interface Room {
  g: Game;
  a: Inside;
  seen: GameEvent[];
}

function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][] = []): Room {
  const g = Game.forPractice(cls, 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const [i, side, w] of words) {
    h.words[w] = (h.words[w] ?? 0) + 1;
    assert.equal(g.socket(i, side, w), null, `${w} goes ${side} of ability ${i}`);
  }
  g.events.length = 0;
  return { g, a, seen: [] };
}

function put(R: Room, kind: MonsterKind, dx: number, dy: number, life = 1e6): Monster {
  const h = R.g.hero;
  const m = R.a.spawn(kind, h.x + dx, h.y + dy, 1, 0, false, R.a.rng);
  R.a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.maxLife = Math.max(life, 1);
  m.life = life;
  return m;
}

function take(R: Room): void {
  R.seen.push(...R.g.events);
  R.g.events.length = 0;
}

function run(R: Room, secs: number, c: Controls = emptyControls()): void {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    R.g.update(DT, c);
    take(R);
  }
}

function swing(R: Room, at: { x: number; y: number }, skill: 0 | 1 = 0): void {
  const h = R.g.hero;
  h.swingT = 0;
  for (const s of h.skills) {
    s.cd = 0;
    s.charges = s.maxCharges;
  }
  const c = emptyControls();
  c.aimX = c.castX = at.x;
  c.aimY = c.castY = at.y;
  if (skill === 0) c.fire = true;
  else c.cast = true;
  R.g.update(DT, c);
  take(R);
  c.fire = false;
  c.cast = false;
  land(R.g, c, DT, () => take(R));
}

const of = <T extends GameEvent['t']>(seen: readonly GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: T }>[];
/** The recordings asked for, by name. */
const recs = (seen: readonly GameEvent[], name: WordSound): Extract<GameEvent, { t: 'rec' }>[] => of(seen, 'rec').filter((e) => e.name === name);
const near = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) < eps;
/** Asked for once, at its own level (times `soft`). */
function heard(seen: readonly GameEvent[], name: WordSound, what: string, soft = 1): void {
  const r = recs(seen, name);
  assert.ok(r.length >= 1, `${what}: ${name} asked for (heard: ${[...new Set(of(seen, 'rec').map((e) => e.name))].join(', ') || 'nothing'})`);
  assert.ok(near(r[0].vol ?? 1, WORD_SOUND[name].vol * soft), `${what}: ${name} at ${WORD_SOUND[name].vol * soft} (${r[0].vol})`);
}

test('the switches are on: the seven\'s looks, the three\'s, the Lexicon in its five pages, the words\' sounds', () => {
  assert.equal(WORDS7_LOOK.on, true);
  assert.equal(WORDS10_LOOK.on, true);
  assert.equal(LEX28.way, 'groups');
  assert.equal(WORD_SOUNDS.on, true);
});

test('the sixth batch: 25 sounds of the words and the page turn, two takes each, in the game; the words\' in a pack of their own, the page turn in the town\'s; each fetched with its word', () => {
  assert.equal(WORD_SOUND_NAMES.length, 25);
  for (const n of [...WORD_SOUND_NAMES, PAGE_TURN.name]) {
    for (const k of [1, 2]) assert.ok(existsSync(`assets/sound/${n}_${k}.mp3`), `assets/sound/${n}_${k}.mp3`);
  }
  for (const n of WORD_SOUND_NAMES) {
    assert.equal(packOf(n), 'words', `${n} in the words' pack`);
    assert.ok(TEN.includes(WORD_SOUND[n].word), `${n}: one of the ten's`);
    assert.ok(WORD_SOUND[n].vol > 0 && WORD_SOUND[n].vol <= 1 && WORD_SOUND[n].gap > 0, `${n}: a level and a gap`);
  }
  assert.equal(packOf(PAGE_TURN.name), 'town');
  // (every one of the ten has a sound; none of the other words has; a word's sounds are fetched with it and no others)
  for (const w of TEN) assert.ok(wordSoundsOf([w]).length > 0, `${w} has its sounds`);
  for (const w of WORD_IDS) if (!TEN.includes(w)) assert.deepEqual(wordSoundsOf([w]), [], `${w} has none`);
  assert.deepEqual(wordSoundsOf(['piercing', null, undefined, 'piercing']), ['pierce_shot', 'pierce_lance']);
  assert.equal(wordSoundsOf(TEN).length, 25);
  assert.deepEqual(wordSoundsOf([]), []);
});

test('the rules and the looks of one mind: where his reflection stands, when a pane breaks, when a body begins to rise', () => {
  assert.equal(MIRRORING.side, W7_TIME.mirrorStep, 'his reflection as far to his side in the rules as in its picture');
  assert.equal(WORD_AT.mirrorBreak, W7_TIME.cast, 'the pane breaks as its picture does');
  assert.ok(near(WORD_AT.riseLead, 0.2 + W7_TIME.rise), 'a body begins to rise as its picture does');
  assert.ok(REAP.riseAfter >= WORD_AT.riseLead, 'and not before it has fallen');
  // (to his side: square to the way he faces, a tile long, and the same side whichever way he turns round)
  for (const [fx, fy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [Math.SQRT1_2, Math.SQRT1_2], [-Math.SQRT1_2, Math.SQRT1_2]] as const) {
    const [sx, sy] = mirrorSide(fx, fy);
    assert.ok(near(sx * fx + sy * fy, 0), `square to (${fx}, ${fy})`);
    assert.ok(near(Math.hypot(sx, sy), 1), 'a tile long');
  }
  // (the rules stand it there: the reflection's event is at that place)
  const R = room('ranger', [[0, 'front', 'mirroring']]);
  const m = put(R, 'skeleton', 4, 0);
  swing(R, m);
  const e = of(R.seen, 'reflection')[0];
  assert.ok(e, 'his reflection');
  const [sx, sy] = mirrorSide(R.g.hero.fx, R.g.hero.fy);
  assert.ok(near(e.x, R.g.hero.x + sx * MIRRORING.side, 0.01) && near(e.y, R.g.hero.y + sy * MIRRORING.side, 0.01), `at his side (${e.x}, ${e.y})`);
});

test('PIERCING heard and told: the shot; the lance, from a step in front of him', () => {
  const R = room('warrior', [[0, 'front', 'piercing']]);
  swing(R, put(R, 'skeleton', 1.25, 0));
  heard(R.seen, 'pierce_shot', 'in front');
  const B = room('warrior', [[0, 'behind', 'piercing']]);
  swing(B, put(B, 'skeleton', 1.25, 0));
  heard(B.seen, 'pierce_lance', 'behind');
  const lance = of(B.seen, 'lance')[0];
  assert.ok(lance, 'the lance thrown');
  assert.ok(near(Math.hypot(lance.x0 - B.g.hero.x, lance.y0 - B.g.hero.y), PIERCE.lanceLead, 0.05), `its picture begins ${PIERCE.lanceLead} tiles in front of him`);
  assert.ok(Math.hypot(lance.x1 - B.g.hero.x, lance.y1 - B.g.hero.y) >= PIERCE.line - 1e-6, 'and ends where it did');
});

test('BLEEDING heard: a wound opened (once while it bleeds), the thorns, their cut; his own wound', () => {
  const R = room('warrior', [[0, 'front', 'bleeding']]);
  const m = put(R, 'skeleton', 1.25, 0);
  swing(R, m);
  heard(R.seen, 'bleed_open', 'in front');
  const n = recs(R.seen, 'bleed_open').length;
  swing(R, m);
  assert.equal(recs(R.seen, 'bleed_open').length, n, 'not again on one already bleeding');
  const B = room('warrior', [[0, 'behind', 'bleeding']]);
  const t = put(B, 'skeleton', 1.25, 0);
  swing(B, t);
  heard(B.seen, 'bleed_thorns', 'behind');
  const th = B.a.zones.find((z) => z.kind === 'thorns');
  assert.ok(th, 'thorns laid');
  if (th) {
    t.x = th.x;
    t.y = th.y;
    run(B, 1.2);
    heard(B.seen, 'bleed_cut', 'one in the thorns');
  }
  // (on him)
  const g = new Game('warrior', 4);
  const a = g as unknown as Inside;
  g.monsters.length = 0;
  const mm = a.spawn('skeleton', g.hero.x + 2, g.hero.y, 1, 0, false, a.rng);
  g.hero.invuln = 0;
  g.events.length = 0;
  g.hurtHero(5, 'phys', ['bleeding'], mm);
  heard(g.events, 'bleed_open', 'a monster\'s');
});

test('REAPING heard: the soul; the spirit rising, raking, and going (softer); a monster\'s body beginning to rise, before it stands', () => {
  const R = room('warrior', [[0, 'front', 'reaping']]);
  swing(R, put(R, 'skeleton', 1.25, 0, 1));
  heard(R.seen, 'reap_soul', 'in front');
  const B = room('warrior', [[0, 'behind', 'reaping']]);
  swing(B, put(B, 'skeleton', 1.25, 0, 1));
  heard(B.seen, 'reap_spirit', 'behind');
  put(B, 'skeleton', 3, 0);
  run(B, 2);
  heard(B.seen, 'reap_rake', 'the spirit\'s blow');
  const hit = of(B.seen, 'spiritHit')[0];
  assert.ok(hit && typeof hit.id === 'number', 'and whom it struck is told');
  B.seen.length = 0;
  run(B, REAP.spiritSecs);
  heard(B.seen, 'reap_spirit', 'the spirit going', WORD_SOUND_SOFT.spiritAway);
  // (on a monster)
  const C = room('warrior');
  const r = put(C, 'skeleton', 3, 0);
  r.words = ['reaping'];
  C.a.kill(r);
  take(C);
  C.seen.length = 0;
  run(C, REAP.riseAfter - WORD_AT.riseLead - 0.1);
  assert.equal(recs(C.seen, 'reap_rise').length, 0, 'not yet');
  run(C, 0.2);
  heard(C.seen, 'reap_rise', 'its body begins to rise');
  assert.equal(C.g.monsters.filter((o) => !o.dead && o.risen).length, 0, 'before the rules stand it up');
  run(C, WORD_AT.riseLead);
  assert.equal(C.g.monsters.filter((o) => !o.dead && o.risen).length, 1, 'then it stands');
});

test('CULLING heard and told: the kill, the mark\'s; one of the Hushed left whole; who is culling him', () => {
  const R = room('warrior', [[0, 'front', 'culling']]);
  const r = R.g.hero.skills[0].r;
  const m = put(R, 'skeleton', 1.25, 0);
  m.life = m.maxLife * (r.cull * 0.5);
  swing(R, m);
  assert.ok(m.dead, 'culled');
  heard(R.seen, 'cull_kill', 'in front');
  assert.ok(!of(R.seen, 'culled')[0].whole, 'a skeleton is cut in two');
  // (one of the Hushed)
  assert.equal(CULL.hushedWhole, true);
  for (const k of ['hushed', 'watch', 'fieldhand', 'carter', 'patient', 'orderly', 'gardener', 'groom', 'pguard', 'footman', 'dancer', 'lady', 'kknight', 'xbow'] as MonsterKind[]) assert.ok(HUSH_LEAVES.has(k), `${k} one of the Hushed`);
  assert.ok(!HUSH_LEAVES.has('skeleton') && !HUSH_LEAVES.has('brute'));
  const H = room('warrior', [[0, 'front', 'culling']]);
  const hu = put(H, 'hushed', 1.25, 0);
  hu.life = hu.maxLife * (H.g.hero.skills[0].r.cull * 0.5);
  swing(H, hu);
  const c = of(H.seen, 'culled')[0];
  assert.ok(hu.dead && c, 'it dies of it all the same');
  assert.equal(c.whole, true, 'and is not shown cut in two');
  // (behind: the mark's)
  const B = room('warrior', [[0, 'behind', 'culling']]);
  swing(B, put(B, 'skeleton', 1.25, 0));
  const mark = B.a.zones.find((z) => z.kind === 'reaper');
  assert.ok(mark, 'a mark laid');
  if (mark) {
    const weak = put(B, 'skeleton', 0, 3);
    weak.life = weak.maxLife * CULL.markUnder * 0.5;
    weak.x = mark.x;
    weak.y = mark.y;
    run(B, 0.1);
    heard(B.seen, 'cull_mark', 'the mark');
    assert.equal(recs(B.seen, 'cull_kill').length, 0, 'not the kill\'s as well');
  }
  // (on a monster: its harder blow on him while he is low tells which monster)
  const g = new Game('warrior', 4);
  const a = g as unknown as Inside;
  g.monsters.length = 0;
  const h = g.hero;
  const mm = a.spawn('skeleton', h.x + 2, h.y, 1, 0, false, a.rng);
  h.invuln = 0;
  h.shield = 0;
  h.life = Math.round(h.d.maxLife * CULL.low * 0.9);
  g.events.length = 0;
  g.hurtHero(10, 'phys', ['culling'], mm);
  const blow = of(g.events, 'cullBlow')[0];
  assert.ok(blow && blow.id === mm.id, 'who is culling him');
});

test('SURGING heard: his shockwave; a monster\'s warning, then its wave', () => {
  const R = room('warrior', [[0, 'front', 'surging']]);
  const m = put(R, 'skeleton', 1.25, 0);
  for (let k = 0; k < SURGE.every; k++) {
    swing(R, m);
    run(R, 0.6);
  }
  assert.equal(of(R.seen, 'surge').filter((e) => !e.dodge).length, 1);
  heard(R.seen, 'surge_wave', 'in front');
  const C = room('warrior');
  const mm = put(C, 'skeleton', 2, 0);
  mm.words = ['surging'];
  run(C, SURGE.monsterEvery + 0.2);
  heard(C.seen, 'surge_warn', 'a monster\'s warning');
  assert.equal(recs(C.seen, 'surge_foe').length, 0, 'its wave not yet');
  run(C, 2.5);
  heard(C.seen, 'surge_foe', 'its wave');
});

test('PLUNDERING heard and told: where the gold sprays; the stream to his purse; a monster\'s theft, and its gold spilt as it dies', () => {
  const R = room('warrior', [[0, 'front', 'plundering']]);
  const k = put(R, 'skeleton', 1.25, 0, 1);
  swing(R, k);
  const spray = of(R.seen, 'goldSpray')[0];
  assert.ok(k.dead && spray, 'the spray told');
  assert.ok(near(spray.x, k.x) && near(spray.y, k.y) && typeof spray.item === 'boolean', 'where, and whether an item with it');
  heard(R.seen, 'plunder_spray', 'in front');
  const B = room('warrior', [[0, 'behind', 'plundering']]);
  swing(B, put(B, 'skeleton', 1.25, 0, 1));
  if (of(B.seen, 'goldBurst').length) heard(B.seen, 'plunder_stream', 'behind');
  // (on a monster, out of the practice room)
  const g = new Game('warrior', 4);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  g.hero.gold = 1000;
  g.hero.invuln = 0;
  const thief = a.spawn('skeleton', g.hero.x + 2, g.hero.y, 1, 0, false, a.rng);
  thief.words = ['plundering'];
  g.events.length = 0;
  g.hurtHero(1, 'phys', ['plundering'], thief);
  assert.ok((thief.stolen ?? 0) > 0);
  heard(g.events, 'plunder_steal', 'a monster\'s theft');
  g.events.length = 0;
  a.kill(thief);
  heard(g.events, 'plunder_spray', 'its gold spilt');
});

test('MIRRORING heard: his reflection\'s swing and its forming (softer); a pane\'s attack, then its breaking; harm sent back', () => {
  const R = room('ranger', [[0, 'front', 'mirroring']]);
  swing(R, put(R, 'skeleton', 4, 0));
  heard(R.seen, 'mirror_swing', 'in front');
  heard(R.seen, 'mirror_rise', 'his reflection forming', WORD_SOUND_SOFT.reflection);
  const B = room('ranger', [[0, 'behind', 'mirroring']]);
  const t = put(B, 'skeleton', 4, 0);
  swing(B, t);
  assert.ok(B.a.zones.some((z) => z.kind === 'mirror'), 'a mirror left');
  assert.equal(recs(B.seen, 'mirror_rise').length, 0, 'its pane\'s sound is its picture\'s, as he steps clear (render/words7.ts soundsW7)');
  B.g.hero.x -= 1;
  B.seen.length = 0;
  swing(B, t);
  assert.equal(of(B.seen, 'mirrorCast').length, 1);
  heard(B.seen, 'mirror_swing', 'the pane\'s attack');
  run(B, WORD_AT.mirrorBreak + 0.1);
  heard(B.seen, 'mirror_break', 'and its breaking');
  const C = room('warrior');
  const mm = put(C, 'skeleton', 1.25, 0);
  mm.words = ['mirroring'];
  C.g.hero.invuln = 0;
  swing(C, mm);
  assert.equal(of(C.seen, 'mirrorBack').length, 1);
  heard(C.seen, 'mirror_back', 'on a monster');
});

test('LASTING and FLEETING heard, where the ability makes or gives something that lasts, and not where it does not', () => {
  const L = room('mage', [[1, 'front', 'lasting']]);
  put(L, 'skeleton', 3, 0);
  swing(L, { x: L.g.hero.x + 3, y: L.g.hero.y }, 1);
  assert.equal(L.g.orbs.length, 1, 'its orb');
  heard(L.seen, 'word_lasting', 'Lasting on the orb');
  assert.equal(recs(L.seen, 'word_fleeting').length, 0);
  const F = room('mage', [[1, 'front', 'fleeting']]);
  put(F, 'skeleton', 3, 0);
  swing(F, { x: F.g.hero.x + 3, y: F.g.hero.y }, 1);
  heard(F.seen, 'word_fleeting', 'Fleeting on the orb');
  // (a plain blow with Lasting on it makes nothing that lasts: not heard)
  const P = room('warrior', [[0, 'front', 'lasting']]);
  swing(P, put(P, 'skeleton', 1.25, 0));
  assert.equal(recs(P.seen, 'word_lasting').length, 0, 'not on a plain blow');
  // (a boost it gives: heard)
  const G = room('warrior', [[0, 'front', 'guarding'], [0, 'behind', 'lasting']]);
  swing(G, put(G, 'skeleton', 1.25, 0));
  heard(G.seen, 'word_lasting', 'Lasting on a shield given');
});

test('VAST heard and told: a ring says how wide it was before; a splash says whom it reaches; a monster\'s wider warning (softer)', () => {
  // (in front: an ability with an area)
  const W = room('warrior', [[1, 'front', 'vast']]);
  put(W, 'skeleton', 1.2, 0);
  swing(W, { x: W.g.hero.x + 1.2, y: W.g.hero.y }, 1);
  const wide = W.g.hero.skills[1].r.wide;
  assert.ok(wide > 1, `Vast in front makes it ${wide} times as wide`);
  const ring = of(W.seen, 'burst').find((e) => e.r0 !== undefined);
  if (of(W.seen, 'burst').length) {
    assert.ok(ring, 'its ring says how wide it was before');
    if (ring) assert.ok(near(ring.r0 as number, ring.r / wide), `${ring.r0} of ${ring.r}`);
    heard(W.seen, 'word_vast', 'in front');
  }
  // (a plain one says nothing of it)
  const P = room('warrior');
  put(P, 'skeleton', 1.2, 0);
  swing(P, { x: P.g.hero.x + 1.2, y: P.g.hero.y }, 1);
  assert.ok(of(P.seen, 'burst').every((e) => e.r0 === undefined), 'no old edge without Vast');
  assert.equal(recs(P.seen, 'word_vast').length, 0);
  // (behind: the splash, and whom it reaches)
  const B = room('warrior', [[0, 'behind', 'vast']]);
  const a = put(B, 'skeleton', 2, 0, 1e7);
  const b = put(B, 'skeleton', 2, 0.8, 1e7);
  const far = put(B, 'skeleton', 2, 4, 1e7);
  B.a.hitMonster(a, 0, 1, false);
  take(B);
  const sp = of(B.seen, 'vastSplash')[0];
  assert.ok(sp, 'the splash told');
  assert.ok(near(sp.x, a.x) && near(sp.y, a.y) && near(sp.r, VAST.splashR), 'where and how far');
  assert.deepEqual(sp.ids, [b.id], 'whom it reaches: the one beside it, not the one struck, not the one far off');
  assert.ok(!sp.ids.includes(far.id));
  heard(B.seen, 'word_vast', 'behind');
  // (the looks own the splash; the stand-in's ring is not drawn on top of it)
  assert.ok(ownsEventW10(sp), 'the three\'s looks own it');
  assert.ok(!of(B.seen, 'burst').some((e) => e.style === 'shock' && near(e.r, VAST.splashR) && near(e.x, a.x)), 'no ring of the stand-in\'s beside it');
  // (on a monster: its warned blow)
  const g = room('warrior');
  g.g.addWarn(g.g.hero.x, g.g.hero.y, 1, 1, 10, 'phys', ['vast'], 'a vast one');
  heard(g.g.events, 'word_vast', 'a monster\'s', WORD_SOUND_SOFT.vastWarn);
});

test('a blow\'s sound once a blow; a state\'s sound once: the cull\'s kindling as he falls low beside one that culls, not again while he stays low', () => {
  const R = room('warrior', [[0, 'front', 'piercing']]);
  const m = put(R, 'skeleton', 1.25, 0);
  swing(R, m);
  const n = recs(R.seen, 'pierce_shot').length;
  assert.equal(n, 1);
  // (the cull's kindling, a state: once as he falls low beside one that culls, not again while he stays low)
  const g = new Game('warrior', 4);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const mm = a.spawn('skeleton', h.x + 2, h.y, 1, 0, false, a.rng);
  a.wakeUp(mm);
  mm.words = ['culling'];
  mm.speed = 0;
  mm.cd = 1e9;
  h.life = h.d.maxLife;
  const seen: GameEvent[] = [];
  const go = (secs: number): void => {
    for (let t = 0; t < secs; t += DT) {
      g.update(DT, emptyControls());
      seen.push(...g.events);
      g.events.length = 0;
    }
  };
  go(0.5);
  assert.equal(recs(seen, 'cull_kindle').length, 0, 'not while he is well');
  h.life = Math.round(h.d.maxLife * CULL.low * 0.8);
  go(0.5);
  assert.equal(recs(seen, 'cull_kindle').length, 1, 'as he falls low beside it');
  go(2);
  assert.equal(recs(seen, 'cull_kindle').length, 1, 'once, while he stays low');
});

test('told to the looks: whose poison is on him and with which word; which ability made a boost', () => {
  const g = room('warrior').g;
  const a = g as unknown as Inside;
  const h = g.hero;
  h.life = h.d.maxLife = 1e6;
  const m = a.spawn('skeleton', h.x + 1, h.y, 1, 0, false, a.rng);
  m.words = ['poison', 'lasting'];
  h.invuln = 0;
  g.hurtHero(100, 'phys', m.words, m);
  assert.deepEqual(h.dotBy, { id: m.id, word: 'lasting' });
  h.poisonT = 0;
  h.invuln = 0;
  m.words = ['poison', 'fleeting'];
  g.hurtHero(100, 'phys', m.words, m);
  assert.deepEqual(h.dotBy, { id: m.id, word: 'fleeting' });
  h.poisonT = 0;
  h.invuln = 0;
  m.words = ['poison'];
  g.hurtHero(100, 'phys', m.words, m);
  assert.deepEqual(h.dotBy, { id: m.id, word: null });
  // (a boost's maker)
  const b = room('warrior', [[0, 'front', 'guarding'], [0, 'front', 'frenzied'], [0, 'behind', 'lasting']]);
  (b.g as unknown as Inside).boons(0);
  assert.equal(b.g.hero.boostBy?.shield, 0, 'the shield was the first ability\'s');
  assert.equal(b.g.hero.boostBy?.frenzy, 0, 'and the frenzy');
});

test('the stand-ins leave what the looks draw: each of the seven\'s events is the looks\' own, and the splash the three\'s', () => {
  const ev = (t: string): GameEvent => ({ t } as unknown as GameEvent);
  for (const t of ['pierceLine', 'lance', 'reapSoul', 'culled', 'surge', 'goldBurst', 'reflection', 'mirrorCast', 'mirrorBack']) assert.ok(ownsEventW7(ev(t)), `${t} is the seven's looks'`);
  assert.ok(!ownsEventW7(ev('burst')) && !ownsEventW7(ev('hit')), 'not what is everyone\'s');
  assert.ok(ownsEventW10(ev('vastSplash')) && !ownsEventW10(ev('burst')));
});

test('a word newly found has its stud in the Lexicon until its page is opened; kept in his save; an old save\'s words all seen', () => {
  // (an old save, from before this: every word it had found is seen, so that no stud is lit on all 18 at once)
  const old = cleanMeta({ known: { fire: { found: true }, frost: { found: true } } } as unknown as Partial<Meta>);
  assert.ok(old.seen, 'a save has its seen words');
  assert.equal(wordFresh(old, 'fire'), false, 'an old save\'s word is seen');
  // (a word found after: fresh until its page is opened)
  const meta = cleanMeta({ known: { fire: { found: true } }, seen: { fire: true } } as unknown as Partial<Meta>);
  (meta.known as Record<string, { found?: boolean }>).piercing = { ...(meta.known as Record<string, object>).piercing, found: true };
  assert.equal(wordFresh(meta, 'piercing'), true, 'newly found: its stud');
  assert.equal(wordFresh(meta, 'bleeding'), false, 'not one not yet found');
  lexSeen(meta, ['piercing', 'bleeding']);
  assert.equal(wordFresh(meta, 'piercing'), false, 'its page opened: seen');
  assert.ok(meta.seen && meta.seen.bleeding !== true, 'one not found is not marked seen by its page being opened');
  // (kept through a save and back)
  const back = cleanMeta(JSON.parse(JSON.stringify(meta)) as Partial<Meta>);
  assert.equal(wordFresh(back, 'piercing'), false, 'kept in his save');
});
