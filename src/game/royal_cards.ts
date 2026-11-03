// THE ROYAL CARDS, the High City's event (floors 16 to 20; game/act1.ts HIGH_CITY, off until he has played it and said yes).
//
// His idea, 28 Oct 2026, to the main chat, asked about the event of floors 16 to 20: “I had an idea for the four bosses, that
// there would be enemies that were influenced by one of the bosses, then they would drop cards.  The cards would then be used at
// the gambler.  You hand in a pair or three of a kind and then you get loot based on the difficulty of the hand.  Something like
// that.”; his picks then, the deck “Just the four royals (Recommended)” (the Princess, the Prince, the Queen and the King; the
// hands a pair, two pair, three of a kind, a full house and four of a kind; Kings the rarest, so three Kings pays more than three
// Princesses) and where, “Any of 16-20, mixed (Recommended)” (on every floor from 16 to 20 some packs carry one of the four
// royals' crests, any royal on any floor). And 29 Oct, his pick: built “With floor 16 (Recommended)”. His doc (the High City's,
// "The set's event") leaves what each hand pays “proposed when it is built, for you to try”.
//
// So (the main chat's, his to try and change):
//   TOUCHED PACKS: on a floor of the High City, a share of the packs (`touched`: not a lair's, not the boss) are touched by a
//     royal, drawn by `weight` (the Princess most often, the King least); every one of the pack wears that royal's crest over
//     its head (render: the royal swan in that royal's colours, the art chat's).
//   THEIR CARDS: each touched one drops its royal's card as it dies (the art chat's `a royal card`, lying face up). Walked over,
//     it is his, kept for good (Hero.cards; his save).
//   AT THE STRANGER (the one who already lets him gamble for gold), in town, a page of his cards: every hand they make, and
//     what it pays; one pressed, the cards are his no more and the pieces are in his bag.
//   WHAT A HAND PAYS (`handPays`): pieces of gear, rare or magic, at the hero's own level or above it: a pair, one magic piece
//     (of Queens or Kings, rare); two pair, two rares; three of a kind, two rares (of Kings, three); a full house, three rares;
//     four of a kind, four rares. And each the better for its royals: a piece's level one higher for each step up the deck from
//     the Princess (the Prince one, the Queen two, the King three; of two pair and a full house, its higher royal's), a full
//     house one more again, four of a kind two more. So a hand that holds another (three Queens hold a pair of them; a full
//     house holds three of a kind and two pair) always pays more than it. (There are no uniques in the game to give: every
//     piece is rolled.)

import { highFloor } from './act1';

/** The four royals, the deck's four cards, lowest to highest. */
export type Royal = 'princess' | 'prince' | 'queen' | 'king';
export const ROYALS: readonly Royal[] = ['princess', 'prince', 'queen', 'king'];
export const ROYAL_NAMES: Readonly<Record<Royal, { one: string; many: string }>> = {
  princess: { one: 'Princess', many: 'Princesses' },
  prince: { one: 'Prince', many: 'Princes' },
  queen: { one: 'Queen', many: 'Queens' },
  king: { one: 'King', many: 'Kings' },
};
/** How far up the deck a royal is (the Princess 0, the King 3). */
export const rankOf = (r: Royal): number => ROYALS.indexOf(r);

/** First numbers, his to try and change. */
export const ROYAL_TUNE = {
  /** The share of a floor's packs touched by a royal. */
  touched: 0.25,
  /** How often each royal touches a pack (Kings the rarest). */
  weight: { princess: 4, prince: 3, queen: 2, king: 1 } as Readonly<Record<Royal, number>>,
};

/** Whether this floor's packs may be touched by the royals: a floor of the High City. */
export function royalFloor(depth: number): boolean {
  return highFloor(depth) > 0;
}

/** The kinds of hand, lowest to highest. */
export type HandKind = 'pair' | 'twopair' | 'three' | 'fullhouse' | 'four';
/** A hand to hand in: its kind and its cards (`main` the royal of its biggest set; `kicker` the other's, for two pair and a full house). */
export interface Hand {
  kind: HandKind;
  main: Royal;
  kicker?: Royal;
}

/** What a hand pays: so many pieces, of this rarity (1 magic, 2 rare), so many levels over his own. */
export interface Pays {
  n: number;
  rarity: 1 | 2;
  plus: number;
}

/** The cards a hand takes. */
export function handCards(h: Hand): Royal[] {
  const k = h.kicker;
  switch (h.kind) {
    case 'pair':
      return [h.main, h.main];
    case 'three':
      return [h.main, h.main, h.main];
    case 'four':
      return [h.main, h.main, h.main, h.main];
    case 'twopair':
      return [h.main, h.main, k!, k!];
    case 'fullhouse':
      return [h.main, h.main, h.main, k!, k!];
  }
}

/** What a hand pays. */
export function handPays(h: Hand): Pays {
  const top = Math.max(rankOf(h.main), h.kicker ? rankOf(h.kicker) : 0);
  switch (h.kind) {
    case 'pair':
      return { n: 1, rarity: rankOf(h.main) >= 2 ? 2 : 1, plus: rankOf(h.main) };
    case 'twopair':
      return { n: 2, rarity: 2, plus: top };
    case 'three':
      return { n: h.main === 'king' ? 3 : 2, rarity: 2, plus: rankOf(h.main) };
    case 'fullhouse':
      return { n: 3, rarity: 2, plus: top + 1 };
    case 'four':
      return { n: 4, rarity: 2, plus: rankOf(h.main) + 2 };
  }
}

/** A hand's name, as the stranger's page says it. */
export function handName(h: Hand): string {
  const N = ROYAL_NAMES;
  switch (h.kind) {
    case 'pair':
      return `A pair of ${N[h.main].many}`;
    case 'three':
      return `Three ${N[h.main].many}`;
    case 'four':
      return `Four ${N[h.main].many}`;
    case 'twopair':
      return `Two pair: ${N[h.main].many} and ${N[h.kicker!].many}`;
    case 'fullhouse':
      return `Full house: ${N[h.main].many} over ${N[h.kicker!].many}`;
  }
}
/** What a hand pays, in words. */
export function paysName(p: Pays): string {
  const what = p.rarity === 2 ? 'rare' : 'magic';
  const n = p.n === 1 ? `A ${what} piece` : `${['', 'One', 'Two', 'Three', 'Four'][p.n] ?? p.n} ${what} pieces`;
  return p.plus > 0 ? `${n}, ${p.plus} level${p.plus === 1 ? '' : 's'} above you` : n;
}

/** How many of a royal's cards he holds. */
export function held(cards: Partial<Record<Royal, number>> | undefined, r: Royal): number {
  return Math.max(0, Math.floor(cards?.[r] ?? 0));
}

/** Every hand his cards make, best first (by what it pays: pieces, then rarity, then levels). */
export function handsFrom(cards: Partial<Record<Royal, number>> | undefined): Hand[] {
  const out: Hand[] = [];
  const n = (r: Royal): number => held(cards, r);
  for (const a of ROYALS) {
    if (n(a) >= 2) out.push({ kind: 'pair', main: a });
    if (n(a) >= 3) out.push({ kind: 'three', main: a });
    if (n(a) >= 4) out.push({ kind: 'four', main: a });
    for (const b of ROYALS) {
      if (b === a) continue;
      // (two pair named high over low, once)
      if (rankOf(a) > rankOf(b) && n(a) >= 2 && n(b) >= 2) out.push({ kind: 'twopair', main: a, kicker: b });
      if (n(a) >= 3 && n(b) >= 2) out.push({ kind: 'fullhouse', main: a, kicker: b });
    }
  }
  const worth = (h: Hand): number => {
    const p = handPays(h);
    return p.n * 100 + p.rarity * 10 + p.plus;
  };
  return out.sort((x, y) => worth(y) - worth(x));
}

/** Whether his cards make hand `h`. */
export function canMake(cards: Partial<Record<Royal, number>> | undefined, h: Hand): boolean {
  const need = new Map<Royal, number>();
  for (const r of handCards(h)) need.set(r, (need.get(r) ?? 0) + 1);
  return [...need].every(([r, k]) => held(cards, r) >= k);
}

/** What a save holds of the cards, made sound. */
export function cleanCards(v: unknown): Partial<Record<Royal, number>> {
  const out: Partial<Record<Royal, number>> = {};
  if (!v || typeof v !== 'object') return out;
  for (const r of ROYALS) {
    const k = (v as Record<string, unknown>)[r];
    if (typeof k === 'number' && Number.isFinite(k) && k >= 1) out[r] = Math.min(999, Math.floor(k));
  }
  return out;
}
