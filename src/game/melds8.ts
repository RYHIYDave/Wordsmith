// THE EIGHT MELDS ACROSS THE GROUPS (behind MELDS8, off until their looks are drawn and he has seen them at work). His words, 4 Nov
// 2026, 19:08: “Maybe the groups are meldable with each other.  I’m not sure.”; offered a draft of 6 to 8, 8 Nov: “Yes, draft 6–8
// (Recommended)”; of the eight drafted he took all eight (by 12:09): Siphon, Cauterize, Forking, Shiver, Sunder, Fervor, Rime Ward,
// Implode. Each is made at the wordsmith from its two words, as every melded word is (game/melds.ts meldOf), and does the work of
// both (withParts) with a twist of its own, in front (the attack's damage word) and, smaller, behind. On gear, a property of each of
// its two words (items.ts, EVERY WORD ON GEAR). Their looks are the art chat's (stand-ins until then); every number here the main
// chat's, for him to change.
//
// THE DRAFT HE TOOK (8 Nov):
//   SIPHON     Leech + Poison      your poison heals you while it eats them
//   CAUTERIZE  Leech + Fire        killing a burning enemy heals you a chunk
//   FORKING    Twin + Lightning    every hit arcs to a second enemy nearby
//   SHIVER     Precise + Frost     critical hits freeze the target for a moment
//   SUNDER     Heavy + Power       stunned enemies take extra damage
//   FERVOR     Frenzied + Fire     each kill makes you attack faster and burn hotter for a few seconds
//   RIME WARD  Guarding + Frost    blocking a hit chills the attacker
//   IMPLODE    Pulling + Volatile  drags enemies together, then the spot bursts


/** THE SWITCH: ON (Version 25.3.17: his take of all eight of the draft, 8 Nov 2026; their looks' yes of 12 Nov, render/melds8.ts). */
export const MELDS8 = { on: true };

export type Meld8Id = 'siphon' | 'cauterize' | 'forking' | 'shiver' | 'sunder' | 'fervor' | 'rimeward' | 'implode';
// (their ids and their two words: game/types.ts MELD8_IDS, MELD_OF)
export const MELD8_NAME: Readonly<Record<Meld8Id, { name: string; front: string; behind: string }>> = {
  siphon: { name: 'Siphon', front: 'Siphon', behind: 'of Siphoning' },
  cauterize: { name: 'Cauterize', front: 'Cauterizing', behind: 'of Cautery' },
  forking: { name: 'Forking', front: 'Forking', behind: 'of Forks' },
  shiver: { name: 'Shiver', front: 'Shivering', behind: 'of Shivers' },
  sunder: { name: 'Sunder', front: 'Sundering', behind: 'of Sundering' },
  fervor: { name: 'Fervor', front: 'Fervent', behind: 'of Fervor' },
  rimeward: { name: 'Rime Ward', front: 'Rime', behind: 'of the Rime Ward' },
  implode: { name: 'Implode', front: 'Imploding', behind: 'of Implosion' },
};

/**
 * WHAT EACH DOES, in front and behind (`behind` the share of the front's twist it gives from the other side).
 *   siphon:    each tick of the hero's poison heals him `heal` of the harm it does.
 *   cauterize: killing a burning enemy heals him `heal` of his life.
 *   forking:   each hit arcs to the nearest other enemy within `reach` tiles for `share` of the hit.
 *   shiver:    a critical hit freezes the one it strikes for `secs`.
 *   sunder:    a stunned enemy takes `more` more from every hit while stunned.
 *   fervor:    each kill gives `speed` more attack speed and `burn` more fire harm for `secs`, up to `most` at once.
 *   rimeward:  a hit he blocks chills its maker (`slow`, for `secs`); in front also `block` more chance to block.
 *   implode:   the hit pulls enemies within `reach` of where it lands `pull` toward it, then `wait` later bursts there, `r` round,
 *              for `share` of the hit.
 */
export const MELD8_TUNE = {
  behind: 0.5,
  siphon: { heal: 0.3 },
  cauterize: { heal: 0.06 },
  forking: { reach: 3.0, share: 0.5 },
  shiver: { secs: 0.8 },
  sunder: { more: 0.3 },
  fervor: { speed: 0.06, burn: 0.1, secs: 4, most: 5 },
  rimeward: { slow: 0.4, secs: 2, block: 5 },
  implode: { reach: 3.0, pull: 1.6, wait: 0.4, r: 2.2, share: 0.8 },
} as const;
