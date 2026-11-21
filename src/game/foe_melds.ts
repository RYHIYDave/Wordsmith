// EVERY WORD ON A DUNGEON: a melded word and a ranked one laid on a stronghold's altar or the town's gate, and what each does on
// the monsters it is burned into. Behind FOE_WORDS (game/defs.ts), OFF.
//
// His words, 4 Nov 2026, 19:07: “And ALL words need to be craftable on items and put into strongholds.” Talked through with him
// 12 Nov 2026, 20:19 to 20:50 Eastern (the Crafting chat, by pop-up). Asked how a melded or ranked word should count on the altar,
// he asked: “Do we have enemy properties for melds or just attack and craft options?” (none: monsters carried single words only).
// His picks: “Both words plus a twist (Recommended)” (a melded word on a monster does what each of its two words does there, and a
// twist of its own); a ranked word “Yes, half as strong again (Recommended)” (defs.ts wordShare); “Counts as two words
// (Recommended)” (as hard and as rich as two words, so the altar's three hollows can come to six); and the gate too, “Yes, the gate
// too (Recommended)”. Each melded word's twist, his pick of two offered (his own words for Siphon): below, FOE_TEXT.
// THE EIGHT NEW MELDS' TWISTS (Siphon to Implode), live since 25.3.17 and built here at his word (the queue's
// build-eight-melds-twists-on-monsters; asked to start it, “Yes, the melds' twists (Recommended)”), each his pick of 12 Nov 2026
// (docs/mockups/foe_melds/README.md): Siphon, his words “make it so you cant heal as much if youre poisoned”; Cauterize “Burns its
// wounds shut”; Forking “Forked bolt (Recommended)”; Shiver “Crits freeze briefly (Recommended)”; Sunder “Follow-up blow
// (Recommended)”; Fervor “Fed by deaths (Recommended)”; Rime Ward “Cold shield (Recommended)”; Implode “Pull, then burst
// (Recommended)”.
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
  /** SIPHON: while its poison is on him, how much less he heals (of every heal: a flask, an orb, his regeneration, life on hit). */
  siphon: 0.5,
  /** CAUTERIZE: below this share of its life it sears its wounds shut, once: a flash, then, this long after, this share of its life back. */
  cauterize: { below: 0.3, flash: 0.6, heal: 0.35 },
  /** FORKING: each of its lightning blows forks: a second bolt on where he was struck, this wide, after this long, this hard (times its blow). */
  forking: { r: 0.9, wait: 0.5, k: 0.45 },
  /** SHIVER: the chance a blow of its is a critical hit, how much harder, and how long it freezes him (seconds). */
  shiver: { chance: 0.22, crit: 1.5, freeze: 0.45 },
  /** SUNDER: its next blow within this long (seconds) after one has knocked him back, this much harder. */
  sunder: { window: 2.0, k: 0.8 },
  /** FERVOR: an enemy dying this near it feeds it (at most so many times; they last this long): each faster by this share, its fire hotter by this. */
  fervor: { near: 5, most: 5, secs: 8, speed: 0.1, fire: 0.12 },
  /** RIME WARD: a blow of his on its shield chills him this much, this long, and not again for so long. */
  rimeward: { chill: 0.4, secs: 1.5, every: 0.6 },
  /** IMPLODE: its dying blast (a warning ring first), and as it comes the pull drawing him toward it from this near, every so often. */
  implode: { r: 2.6, wait: 1.2, k: 1.8, pull: 4.5, every: 0.2, share: 0.55 },
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
  siphon: 'While its poison is on you, you heal less.',
  cauterize: 'When low on life, it sears its wounds shut and heals, once.',
  forking: 'Each lightning blow forks: a second bolt strikes where you were.',
  shiver: 'Its critical hits freeze you for a moment.',
  sunder: 'Its next blow after knocking you back hits much harder.',
  fervor: 'Each enemy dying near it makes it faster and its fire hotter.',
  rimeward: 'Hitting its shield chills you.',
  implode: 'When it dies it pulls you in, then bursts.',
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

/** A blow's twists decided as it lands, for what it leaves after (foeAfterBlow): a Shiver critical, a Sunder follow-up. */
const blow = { shiver: false, sunder: false };

/** Of what's laid on the blow: how much harder it lands on him (Avalanche, Blight's poison on him, Scald's crack; Shiver's
 * critical, Sunder's follow-up, Fervor's fire). `by`: the monster whose blow it is, if any. */
export function foeHarder(g: Game, s: (w: WordId) => number, parts: readonly (readonly [Element, number])[], by: Monster | null = null): number {
  const h = g.hero;
  let k = 1;
  blow.shiver = false;
  blow.sunder = false;
  // (SHIVER: now and then a critical hit, freezing him a moment: foeAfterBlow)
  if (s('shiver') > 0 && g.rng.chance(FOE_TUNE.shiver.chance * s('shiver'))) {
    blow.shiver = true;
    k *= FOE_TUNE.shiver.crit;
    g.emit({ t: 'text', x: h.x, y: h.y, text: 'Critical', color: '#ff8a80' });
  }
  // (SUNDER: its blow soon after one that knocked him back, much harder; that one does not make another due)
  if (by && s('sunder') > 0 && (by.sunderAt ?? -1e9) >= g.time - FOE_TUNE.sunder.window) {
    blow.sunder = true;
    by.sunderAt = undefined;
    k *= 1 + FOE_TUNE.sunder.k * s('sunder');
    g.emit({ t: 'text', x: h.x, y: h.y, text: 'Sundered', color: '#ff8a80' });
    g.emit({ t: 'burst', x: h.x, y: h.y, r: 0.8, el: 'phys', style: 'shock' });
  }
  // (FERVOR: fed by the deaths round it, its fire burns hotter)
  if (by && (by.fervorN ?? 0) > 0 && parts.some(([e]) => e === 'fire')) k *= 1 + FOE_TUNE.fervor.fire * (by.fervorN ?? 0) * Math.max(s('fervor'), wordShare(by, 'fervor'));
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

/** After a blow from `by` (or a shot or warning of its) has hurt him `dmg`: what its words leave on him and round him. `parts`:
 * the blow's elements. */
export function foeAfterBlow(g: Game, s: (w: WordId) => number, by: Monster | null, dmg: number, parts: readonly (readonly [Element, number])[] = []): void {
  const h = g.hero;
  // (SIPHON: while that poison is on him he heals less: Game.healHero)
  if (s('siphon') > 0 && h.poisonT > 0) {
    if (!(h.siphonLess ?? 0)) g.emit({ t: 'text', x: h.x, y: h.y, text: 'Healing cut', color: '#ff8a80' });
    h.siphonLess = Math.max(h.siphonLess ?? 0, Math.min(0.9, FOE_TUNE.siphon * s('siphon')));
  }
  // (SHIVER: a critical hit freezes him a moment)
  if (blow.shiver) {
    blow.shiver = false;
    h.iceT = Math.max(h.iceT ?? 0, FOE_TUNE.shiver.freeze);
    g.emit({ t: 'freeze', x: h.x, y: h.y });
    g.emit({ t: 'text', x: h.x, y: h.y, text: 'Frozen', color: '#a5d8ff' });
  }
  // (SUNDER: a blow of its that knocks him back makes its next, soon after, a follow-up)
  if (by && !by.dead && s('sunder') > 0) {
    if (!blow.sunder) by.sunderAt = g.time;
    blow.sunder = false;
  }
  // (FORKING: a lightning blow forks: a second bolt on where he was struck, a moment after, marked)
  if (by && !by.dead && s('forking') > 0 && parts.some(([e]) => e === 'lightning')) {
    const F = FOE_TUNE.forking;
    g.addWarn(h.x, h.y, F.r, F.wait, ((by.dmgMin + by.dmgMax) / 2) * F.k * s('forking'), 'lightning', ['lightning'], `${by.name}'s forked bolt`, by.id, g.halfOf(by));
  }
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

/** A monster's turn, awake and near: Hailstorm's hail on a marked circle round him, every few seconds; Cauterize searing its
 * wounds shut, once, low on life; Fervor's feeding wearing off. */
export function foeTick(g: Game, m: Monster, dt: number, dist: number): void {
  if ((m.fervorT ?? 0) > 0) {
    m.fervorT = Math.max(0, (m.fervorT ?? 0) - dt);
    if (m.fervorT <= 0) m.fervorN = 0;
  }
  const C = FOE_TUNE.cauterize;
  const ck = wordShare(m, 'cauterize');
  if (ck > 0 && !m.seared && m.life > 0 && m.life < m.maxLife * C.below) {
    // (a flash of its fire first, then its wounds seared shut: some of its life back)
    m.seared = true;
    g.emit({ t: 'burst', x: m.x, y: m.y, r: 1.0, el: 'fire', style: 'shock' });
    g.emit({ t: 'text', x: m.x, y: m.y, text: 'Searing', color: '#ffb070' });
    g.sfx('fire', 0.7);
    g.after(C.flash, () => {
      if (m.dead) return;
      const n = m.maxLife * C.heal * ck;
      m.life = Math.min(m.maxLife, m.life + n);
      g.emit({ t: 'burst', x: m.x, y: m.y, r: 1.4, el: 'fire', style: 'blast' });
      g.emit({ t: 'text', x: m.x, y: m.y, text: 'Seared shut', color: '#ffb070' });
    });
  }
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

/** A monster carrying Volatile's blast, as Demolition makes it (wider, slower and harder) or Implode (drawing him in first); null,
 * Volatile's own. */
export function foeBlast(m: Monster): { r: number; wait: number; k: number } | null {
  if (wordShare(m, 'demolition') > 0) return FOE_TUNE.demolition;
  if (wordShare(m, 'implode') > 0) return FOE_TUNE.implode;
  return null;
}

/** A monster's pace and the quickness of its blows, as Fervor's feeding hurries it (1: as it is). */
export function foeRage(m: Monster): number {
  return (m.fervorN ?? 0) > 0 ? 1 + FOE_TUNE.fervor.speed * (m.fervorN ?? 0) * Math.max(0.5, wordShare(m, 'fervor')) : 1;
}

/** A blow of his on a monster's shield (`soaked` of it): Rime Ward chills him. */
export function foeShield(g: Game, m: Monster, soaked: number): void {
  const k = wordShare(m, 'rimeward');
  if (k <= 0 || soaked <= 0 || (m.rimeAt ?? -1e9) > g.time - FOE_TUNE.rimeward.every) return;
  m.rimeAt = g.time;
  const h = g.hero;
  const R = FOE_TUNE.rimeward;
  h.chill = Math.max(h.chillT > 0 ? h.chill : 0, R.chill * k);
  h.chillT = Math.max(h.chillT, R.secs);
  g.emit({ t: 'burst', x: m.x, y: m.y, r: 1.0, el: 'frost', style: 'shock' });
  g.emit({ t: 'text', x: h.x, y: h.y, text: 'Chilled', color: '#a5d8ff' });
}

/** As a monster dies: what its melded word leaves (Fumes' and Contagion's clouds, Powderkeg's fire, Shatter's shards, Chain Reaction's arc, Rupture's splash). */
export function foeDeath(g: Game, m: Monster): void {
  const avg = (m.dmgMin + m.dmgMax) / 2;
  const s = (w: WordId): number => wordShare(m, w);
  // (FERVOR: each enemy dying near one feeds it: faster, its fire hotter)
  const F = FOE_TUNE.fervor;
  for (const o of g.monsters) {
    if (o === m || o.dead || wordShare(o, 'fervor') <= 0 || Math.hypot(o.x - m.x, o.y - m.y) > F.near) continue;
    o.fervorN = Math.min(F.most, (o.fervorN ?? 0) + 1);
    o.fervorT = F.secs;
    g.emit({ t: 'burst', x: o.x, y: o.y, r: 0.8, el: 'fire', style: 'shock' });
    g.emit({ t: 'text', x: o.x, y: o.y, text: `Fervor ${o.fervorN}`, color: '#ffb070' });
  }
  // (IMPLODE: as its blast comes (Volatile's warning, foeBlast), it draws him in)
  if (s('implode') > 0) {
    const I = FOE_TUNE.implode;
    const z = foeGround(m.x, m.y, I.r, I.wait, 'vortex', 'phys', 0, [], m, 'implode');
    z.tick = 0;
    g.zones.push(z);
  }
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
function foeGround(x: number, y: number, r: number, secs: number, kind: 'burn' | 'venom' | 'vortex', el: Element, dmg: number, words: WordId[], m: Monster, foe: MeldId): Zone {
  return { x, y, r, t: 0, dur: secs, kind, element: el, dmg, slow: 0, tick: 0.25, hostile: true, skill: -1, words, from: `${m.name}'s ${WORDS[foe].name.toLowerCase()}`, src: m.id, foe };
}

/** A monster's ground (`foe`) at `i` among the zones, as it ticks: true, it is dealt with here. */
export function foeZone(g: Game, z: Zone, i: number, dt: number): boolean {
  if (!z.foe) return false;
  const h = g.hero;
  if (z.t < 0) return true;
  const inside = Math.hypot(h.x - z.x, h.y - z.y) <= z.r + TUNE.heroRadius * 0.5;
  if (z.foe === 'implode') {
    // (drawing him in toward where it died, harming nothing itself: its blast is Volatile's warning's)
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick += FOE_TUNE.implode.every;
      if (Math.hypot(h.x - z.x, h.y - z.y) <= FOE_TUNE.implode.pull) g.pullHero(z.x, z.y, FOE_TUNE.implode.share);
    }
  } else if (z.foe === 'wildfire') {
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
