// EVERY WORD ON A DUNGEON: a melded word and a ranked one laid on a stronghold's altar or the town's gate, and what each does on
// the monsters it is burned into. Behind FOE_WORDS (game/defs.ts), OFF.
//
// His words, 4 Nov 2026, 19:07: “And ALL words need to be craftable on items and put into strongholds.” Talked through with him
// 12 Nov 2026, 20:19 to 20:50 Eastern (the Crafting chat, by pop-up). Asked how a melded or ranked word should count on the altar,
// he asked: “Do we have enemy properties for melds or just attack and craft options?” (none: monsters carried single words only).
// His picks: “Both words plus a twist (Recommended)” (a melded word on a monster does what each of its two words does there, and a
// twist of its own); a ranked word “Yes, half as strong again (Recommended)” (defs.ts wordShare); “Counts as two words
// (Recommended)” (as hard and as rich as two words, so the altar's three hollows can come to six); and the gate too, “Yes, the gate
// too (Recommended)”. Each melded word's twist, his pick of two offered (his own words for Siphon, one of the eight not yet live):
// below, FOE_TEXT. The eight new melds' twists (Siphon to Implode) wait for those melds (branch melds8): docs/foe_melds/README.md.
//
// My readings, told him: a melded word on the altar or the gate brings its own elements, and no other word of an element may lie
// beside it (one element per dungeon, as before, or a melded word's two); nor a word already in a melded word on it (no Frost
// beside Hailstorm).

import type { Game } from './game';
import { FOE_WORDS, TUNE, WORDS, wordShare } from './defs';
import type { Monster, Zone } from './state';
import { MELD_OF, RANK_OF } from './types';
import type { Element, MeldId, RankId, WordId } from './types';

/** The numbers of the twists: starting points, to be tuned once he has played them. */
export const FOE_TUNE = {
  /** A melded or ranked word counts as this many words: how hard, how rich (his “Counts as two words”). */
  weight: 2,
  /** ERUPTION: blows that build its heat; at full heat a ring round it, this wide, after this long, this hard (times its blow). */
  eruption: { heat: 4, r: 2.2, wait: 0.8, k: 1.4 },
  /** AVALANCHE: how much harder it hits him while he is chilled. */
  avalanche: 0.35,
  /** THUNDER: every this many blows a thunderclap round it, after its warning ring. */
  thunder: { every: 3, r: 2.0, wait: 0.75, k: 1.0 },
  /** BLIGHT: while its poison is on him, how much more he takes from every blow. */
  blight: 0.2,
  /** SCALD: a fire blow on him chilled, or a frost one on him burning, cracks for this much more. */
  scald: 0.5,
  /** WILDFIRE: the small fire a blow leaves where he stood, how long it burns, how often it sparks at him, from how near, how hard (times the blow), and how many at once. */
  wildfire: { r: 0.6, secs: 4, every: 1.0, reach: 1.4, k: 0.25, gap: 1.5, most: 8 },
  /** FUMES: the cloud it dies in, its poison a tick (times its blow), and its blast if anything burning comes into it. */
  fumes: { r: 1.6, secs: 6, k: 0.15, blastR: 2.2, blastK: 2.0 },
  /** HAILSTORM: every this many seconds while he is near, hail on a marked circle round him. */
  hailstorm: { every: 5, near: 9, r: 1.4, wait: 1.1, k: 0.8 },
  /** FROSTBITE: while he is chilled by it, the life he loses a second, times its blow. */
  frostbite: 0.2,
  /** CONTAGION: the cloud where it dies, and its shock a tick (times its blow). */
  contagion: { r: 1.5, secs: 5, tick: 0.7, k: 0.12 },
  /** DEMOLITION: its dying blast, wider, slower to go off and harder than Volatile's (1.8 wide, 0.7 s, 1.5 times). */
  demolition: { r: 3.4, wait: 1.8, k: 2.2 },
  /** POWDERKEG: the burning ground its blast leaves, and its burn a tick (times its blow). */
  powderkeg: { r: 1.6, secs: 4, k: 0.2 },
  /** SHATTER: the shards it bursts into, how fast and far they fly, how hard (times its blow). */
  shatter: { n: 8, speed: 6, range: 6, k: 0.5 },
  /** CHAIN REACTION: as its blast goes off, an arc at him from it if he is this near, this hard (times its blow). */
  chain: { near: 4.5, k: 0.6 },
  /** RUPTURE: the poison it splashes over the ground, and its poison a tick (times its blow). */
  rupture: { r: 2.0, secs: 5, k: 0.15 },
};

/**
 * What each melded word does on a monster, on top of its two words' (his picks, 12 Nov 2026). The word's page shows it, after
 * its two words' (wordPage, ui/lexicon.ts).
 */
export const FOE_TEXT: Readonly<Partial<Record<MeldId, string>>> = {
  eruption: 'Builds heat as it fights; at full heat its next blow erupts around it.',
  avalanche: 'Hits harder while you are chilled.',
  thunder: 'Every few blows, a thunderclap bursts around it.',
  blight: 'While its poison is on you, you take more damage from everything.',
  scald: 'A fire hit while you are chilled, or a frost hit while you burn, cracks for more.',
  wildfire: 'Its blows leave small fires that throw sparks at you.',
  fumes: 'Dies in a poison cloud that explodes if anything burning walks in.',
  hailstorm: 'Calls hail down around you every few seconds.',
  frostbite: 'While you are chilled by it, you lose life.',
  contagion: 'Leaves a poison cloud that shocks you where it dies.',
  demolition: 'Its dying blast is huge, but slow to go off.',
  powderkeg: 'Its dying blast leaves the ground burning.',
  shatter: 'Bursts into a ring of ice shards when it dies.',
  chainreaction: 'Its dying blast throws lightning at you.',
  rupture: 'Bursts when it dies, splashing poison on the ground.',
};

const isMeld = (w: WordId): w is MeldId => w in MELD_OF;
const isRank = (w: WordId): w is RankId => w in RANK_OF;

/** How many words this word counts as, on an altar or the gate: a melded or ranked word two (FOE_WORDS on), any other one. */
export function wordWeight(w: WordId): number {
  return FOE_WORDS.on && (isMeld(w) || isRank(w)) ? FOE_TUNE.weight : 1;
}

/** How many words these come to (wordWeight each). */
export function wordsWeight(ws: readonly WordId[]): number {
  return ws.reduce((a, w) => a + wordWeight(w), 0);
}

/** The base words a word is made of: a melded word's two, a ranked word's own, any other itself. */
export function partsOf(w: WordId): WordId[] {
  if (isMeld(w)) return [...MELD_OF[w]];
  if (isRank(w)) return [RANK_OF[w].word];
  return [w];
}

/** The elements a word brings: a melded word's two words', a ranked word's word's. */
export function elementsOf(w: WordId): Element[] {
  return partsOf(w).flatMap((p) => (WORDS[p].element ? [WORDS[p].element as Element] : []));
}

/**
 * What the words laid on a dungeon or a stronghold come to on each of its monsters: every base word they are made of, and the
 * melded and ranked words themselves (their twist, their rank: wordShare). With FOE_WORDS off, as laid.
 */
export function foeWordsOf(ws: readonly WordId[]): WordId[] {
  if (!FOE_WORDS.on) return [...ws];
  const out: WordId[] = [];
  for (const w of ws) for (const p of [...partsOf(w), ...(isMeld(w) || isRank(w) ? [w] : [])]) if (!out.includes(p)) out.push(p);
  return out;
}

/**
 * Why `word` may not join `laid` on an altar or the gate (FOE_WORDS on), or null: the rules of a melded and a ranked word, and of
 * every word beside one. `where` names it in the refusal ('stronghold' or 'dungeon').
 */
export function layProblem(laid: readonly WordId[], word: WordId, where: string): string | null {
  const mine = partsOf(word);
  if (laid.some((w) => w === word || partsOf(w).some((p) => mine.includes(p)))) return 'Already on it';
  if (elementsOf(word).length && laid.some((w) => elementsOf(w).length)) return `One element per ${where}`;
  return null;
}

/** A melded word of two elements on these words, and the blow's element one of them: the other (its blow half of each). */
export function secondElement(words: readonly WordId[], el: Element): Element | null {
  for (const w of words) {
    if (!isMeld(w)) continue;
    const es = elementsOf(w);
    if (es.length === 2 && es.includes(el)) return es[0] === el ? es[1] : es[0];
  }
  return null;
}

/** A ranked word of this element on these words: its statuses on him half as strong again. */
export function rankOfElement(words: readonly WordId[], e: Element): number {
  if (!FOE_WORDS.on) return 1;
  for (const w of words) if (isRank(w) && RANK_OF[w].word === e) return 1.5;
  return 1;
}

/** A word's page, ON A DUNGEON, for a melded or ranked word: its two words' (or its word's) and its twist. */
export function foeText(w: WordId): string {
  const low = (t: string): string => t.charAt(0).toLowerCase() + t.slice(1);
  if (isRank(w)) return `${WORDS[RANK_OF[w].word].monsterText.replace(/\.$/, '')}, half as strong again.`;
  if (!isMeld(w)) return WORDS[w].monsterText;
  const [a, b] = MELD_OF[w];
  return `${WORDS[a].monsterText.replace(/\.$/, '')}; ${low(WORDS[b].monsterText).replace(/\.$/, '')}. ${FOE_TEXT[w] ?? ''}`.trim();
}

// ---------------------------------------------------------------------------------------------
// In play. Each takes the game and does its work; game.ts calls them where a blow lands, a monster thinks, dies, or its ground ticks.

/** Of what's laid on the blow: how much harder it lands on him (Avalanche, Blight's poison on him, Scald's crack). */
export function foeHarder(g: Game, s: (w: WordId) => number, parts: readonly (readonly [Element, number])[]): number {
  const h = g.hero;
  let k = 1;
  if (s('avalanche') > 0 && h.chillT > 0) k *= 1 + FOE_TUNE.avalanche * s('avalanche');
  if (s('scald') > 0 && ((h.chillT > 0 && parts.some(([e]) => e === 'fire')) || (h.burnT > 0 && parts.some(([e]) => e === 'frost')))) {
    k *= 1 + FOE_TUNE.scald * s('scald');
    g.emit({ t: 'text', x: h.x, y: h.y, text: 'Cracked', color: '#ff8a80' });
    g.emit({ t: 'burst', x: h.x, y: h.y, r: 0.7, el: 'frost', style: 'shock' });
  }
  // (Blight, laid by any blow: while that poison is on him, every blow is harder)
  if (h.poisonT > 0 && (h.blightMore ?? 0) > 0) k *= 1 + (h.blightMore ?? 0);
  return k;
}

/** After a blow from `by` (or a shot or warning of its) has hurt him `dmg`: what its words leave on him and round him. */
export function foeAfterBlow(g: Game, s: (w: WordId) => number, by: Monster | null, dmg: number): void {
  const h = g.hero;
  if (s('blight') > 0 && h.poisonT > 0) h.blightMore = Math.max(h.blightMore ?? 0, FOE_TUNE.blight * s('blight'));
  if (s('frostbite') > 0 && h.chillT > 0) h.frostbiteDps = Math.max((h.frostbiteDps ?? 0) > 0 ? h.frostbiteDps ?? 0 : 0, dmg * FOE_TUNE.frostbite * s('frostbite'));
  // (Wildfire: a small fire where he stood, sparking at him while he stays near it; not too many)
  if (s('wildfire') > 0 && by && !by.dead) {
    const fires = g.zones.filter((z) => z.foe === 'wildfire');
    const last = fires.find((z) => z.src === by.id && z.t < FOE_TUNE.wildfire.gap);
    if (!last && fires.length < FOE_TUNE.wildfire.most) {
      const W = FOE_TUNE.wildfire;
      g.zones.push(foeGround(h.x, h.y, W.r, W.secs, 'burn', 'fire', dmg * W.k * s('wildfire'), [], by, 'wildfire'));
    }
  }
  // (Eruption's heat, Thunder's clap: counted on its blows)
  if (!by || by.dead) return;
  const E = FOE_TUNE.eruption;
  const T = FOE_TUNE.thunder;
  if (wordShare(by, 'eruption') > 0 || wordShare(by, 'thunder') > 0) {
    by.foeN = (by.foeN ?? 0) + 1;
    const avg = (by.dmgMin + by.dmgMax) / 2;
    if (wordShare(by, 'eruption') > 0 && by.foeN % E.heat === 0) {
      g.addWarn(by.x, by.y, E.r, E.wait, avg * E.k * wordShare(by, 'eruption'), 'fire', ['fire'], `${by.name}'s eruption`, by.id, g.halfOf(by));
      g.emit({ t: 'text', x: by.x, y: by.y, text: 'Heat!', color: '#ff8a80' });
    }
    if (wordShare(by, 'thunder') > 0 && by.foeN % T.every === 0) g.addWarn(by.x, by.y, T.r, T.wait, avg * T.k * wordShare(by, 'thunder'), 'lightning', ['lightning'], `${by.name}'s thunderclap`, by.id, g.halfOf(by));
  }
}

/** A monster's turn, awake and near: Hailstorm's hail on a marked circle round him, every few seconds. */
export function foeTick(g: Game, m: Monster, dt: number, dist: number): void {
  const H = FOE_TUNE.hailstorm;
  const k = wordShare(m, 'hailstorm');
  if (k <= 0 || m.state === 'sleep') return;
  m.hailT = (m.hailT ?? H.every * 0.6) - dt;
  if (m.hailT > 0) return;
  m.hailT = H.every;
  if (dist > H.near || g.shutIn(m)) return;
  const h = g.hero;
  g.addWarn(h.x, h.y, H.r, H.wait, ((m.dmgMin + m.dmgMax) / 2) * H.k * k, 'frost', ['frost', 'lightning', 'hailstorm'], `${m.name}'s hail`, undefined, g.halfOf(m));
}

/** A monster carrying Volatile's blast, as Demolition makes it: wider, slower and harder; null, Volatile's own. */
export function foeBlast(m: Monster): { r: number; wait: number; k: number } | null {
  return wordShare(m, 'demolition') > 0 ? FOE_TUNE.demolition : null;
}

/** As a monster dies: what its melded word leaves (Fumes' and Contagion's clouds, Powderkeg's fire, Shatter's shards, Chain Reaction's arc, Rupture's splash). */
export function foeDeath(g: Game, m: Monster): void {
  const avg = (m.dmgMin + m.dmgMax) / 2;
  const s = (w: WordId): number => wordShare(m, w);
  if (s('fumes') > 0) g.zones.push(foeGround(m.x, m.y, FOE_TUNE.fumes.r, FOE_TUNE.fumes.secs, 'venom', 'phys', avg * FOE_TUNE.fumes.k * s('fumes'), ['poison'], m, 'fumes'));
  if (s('contagion') > 0) {
    const C = FOE_TUNE.contagion;
    g.zones.push(foeGround(m.x, m.y, C.r, C.secs, 'venom', 'lightning', avg * C.k * s('contagion'), ['poison'], m, 'contagion'));
  }
  if (s('rupture') > 0) g.zones.push(foeGround(m.x, m.y, FOE_TUNE.rupture.r, FOE_TUNE.rupture.secs, 'venom', 'phys', avg * FOE_TUNE.rupture.k * s('rupture'), ['poison'], m, 'rupture'));
  // (Powderkeg's burning ground and Chain Reaction's arc come as its blast goes off: Volatile's warning, 0.7 s)
  const wait = foeBlast(m)?.wait ?? 0.7;
  if (s('powderkeg') > 0) {
    const P = FOE_TUNE.powderkeg;
    const z = foeGround(m.x, m.y, P.r, P.secs + wait, 'burn', 'fire', avg * P.k * s('powderkeg'), [], m, 'powderkeg');
    // (not burning till the blast: its clock starts behind)
    z.t = -wait;
    g.zones.push(z);
  }
  if (s('chainreaction') > 0) {
    const C = FOE_TUNE.chain;
    const x = m.x;
    const y = m.y;
    const dmg = avg * C.k * s('chainreaction');
    g.after(wait, () => {
      const h = g.hero;
      if (Math.hypot(h.x - x, h.y - y) > C.near) return;
      g.emit({ t: 'arc', x0: x, y0: y, x1: h.x, y1: h.y });
      g.sfx('zap', 0.6);
      g.hurtHero(dmg, 'lightning', [], null, `${m.name}'s arc`, x, y);
    });
  }
  if (s('shatter') > 0) {
    const S = FOE_TUNE.shatter;
    for (let i = 0; i < S.n; i++) g.shootAt(m, (i / S.n) * Math.PI * 2, S.speed, avg * S.k * s('shatter'), 'frost', 'bolt', S.range);
  }
}

/** A monster's ground, hostile: it harms the hero (foeZone), not the monsters. */
function foeGround(x: number, y: number, r: number, secs: number, kind: 'burn' | 'venom', el: Element, dmg: number, words: WordId[], m: Monster, foe: MeldId): Zone {
  return { x, y, r, t: 0, dur: secs, kind, element: el, dmg, slow: 0, tick: 0.25, hostile: true, skill: -1, words, from: `${m.name}'s ${WORDS[foe].name.toLowerCase()}`, src: m.id, foe };
}

/** A monster's ground (`foe`) at `i` among the zones, as it ticks: true, it is dealt with here. */
export function foeZone(g: Game, z: Zone, i: number, dt: number): boolean {
  if (!z.foe) return false;
  const h = g.hero;
  if (z.t < 0) return true;
  const inside = Math.hypot(h.x - z.x, h.y - z.y) <= z.r + TUNE.heroRadius * 0.5;
  if (z.foe === 'wildfire') {
    // (it does not burn him to stand in; it throws a spark at him now and then while he is near)
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick += FOE_TUNE.wildfire.every;
      if (Math.hypot(h.x - z.x, h.y - z.y) <= z.r + FOE_TUNE.wildfire.reach) {
        g.emit({ t: 'arc', x0: z.x, y0: z.y, x1: h.x, y1: h.y, meld: 'wildfire' });
        g.sfx('zap', 0.4);
        g.hurtFrom(z);
      }
    }
  } else if (z.foe === 'fumes' && !z.blown && (((h.burnT > 0 && inside) || g.monsters.some((m) => !m.dead && m.burnT > 0 && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5)))) {
    // (Fumes: anything burning comes into the cloud, it goes off)
    z.blown = true;
    const F = FOE_TUNE.fumes;
    g.zones.splice(i, 1);
    g.emit({ t: 'burst', x: z.x, y: z.y, r: F.blastR, el: 'fire', style: 'blast' });
    g.emit({ t: 'shake', amount: 4 });
    g.sfx('explode', 0.8);
    if (Math.hypot(h.x - z.x, h.y - z.y) <= F.blastR + 0.1) g.hurtHero((z.dmg / F.k) * F.blastK, 'fire', [], null, z.from, z.x, z.y);
    for (const m of g.monsters) if (!m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= F.blastR + m.r) g.damageMonster(m, Math.max(1, Math.round((z.dmg / F.k) * F.blastK)), 'fire', false, -1);
    return true;
  } else {
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick += z.foe === 'contagion' ? FOE_TUNE.contagion.tick : 0.5;
      if (inside) g.hurtFrom(z);
    }
  }
  if (z.t >= z.dur) g.zones.splice(i, 1);
  return true;
}

/** A stronghold's table by words burned (1 to 3), run on past three by its last step: four, five and six words' worth (his “Counts as two words”). */
export function upTo(table: readonly number[], n: number): number {
  const last = table.length - 1;
  if (n <= last) return table[Math.max(0, n)];
  return table[last] + (table[last] - table[last - 1]) * (n - last);
}
