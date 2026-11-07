// THE QUEST LINE OF FLOORS 6 TO 10 (QUESTS610: ON at his word, shown its pictures and its read-back and asked “Put it in?”, by
// 06:41, 7 Nov 2026: “Yes, put it in (Recommended)”; its pillars, PILLARS below, OFF at his word then, “Wait for the new Eye fight”).
//
// His words, 7 Nov 2026, 00:18 (Eastern): “and questing through 6-10.  i need at least a guarenteed camera shot of the town over the
// vulture nest.  even if its a little in game cut scene where the character walks to the edge and the camera pans over the edge and
// shows the town.  and a line from the character.  beofre that we needa reason to go the eyre.  then a reason to go to the forest,
// that will have two side areas.  collect 2 pieces of something from the side areas and a third piece from the deer.  maybe you use
// them on three pillars during the swamp fight to deactive the seige magic”; 00:23: “lets have the mystic ask for a Queen vulture
// feather or something so you have to go back to town after you kill the boss and see the city”. Read back to him (plain, by
// 00:57), its gaps filled as guesses, “Tell me if any step is wrong”; he went to bed at 00:26 (“k im going to bed”).
//
// So:
// 1. THE MYSTIC'S ASK: once the gate down the mountain is open (the Meldstone brought), the mystic, used, asks for a feather of the
//    Queen vulture, floor 7's boss (the Queen's Eyrie, on the Ledge Road).
// 2. THE EYRIE: the first time the Queen falls, the hero plucks a feather from her; and, a moment after, A SHORT SCENE: the hero
//    walks to the eyrie's edge, the picture pans out over the drop to the town far below under the cult's dome (render/outdoor.ts
//    paints it there), the hero says a line of their own, and the picture comes back. (EYRIE_SCENE; Game.scene; render.ts sceneLean.)
// 3. THE FEATHER BROUGHT: the mystic reads the dome in it: the cult's siege magic, fed from three pillars in the Sunken Fen; only a
//    ward-stone can put them out, and the cult broke theirs in three: two pieces in the Pinewood's two side areas, the third with the
//    Stag (floor 9). (TO COME: the two side areas, the pieces, and the pillars in the Fen's fight, which the art chat is redrawing at
//    his word of 7 Nov, 00:07 to 00:13: a swamp colossus, its third phase his siege magic.)

import type { ClassId } from './types';

export const QUESTS610 = { on: true };

/** Where the hero stands in the mystic's feather quest: asked; carrying the feather; brought. */
export type FeatherStep = 'asked' | 'got' | 'given';

/** THE EYRIE SCENE: the most it walks him (seconds), how long the picture takes to pan out and back, how long it holds on the town. */
export const EYRIE_SCENE = {
  /** Seconds after the Queen falls before it begins (her death played out). */
  after: 2.2,
  /** He walks to the edge at this share of his speed, for at most `walk` seconds. */
  pace: 0.7,
  walk: 4,
  /** How far short of the drop he stops (tiles). */
  short: 0.9,
  /** The pan out, the hold on the town, the pan back (seconds). */
  out: 1.6,
  hold: 3.4,
  back: 1.2,
  /** Seconds into the hold his line is said. */
  say: 0.5,
  /** How far the picture pans: a share of the screen's width, at most (pixels). */
  share: 0.24,
  most: 230,
};

/** His line at the edge, by class (the main chat's, for him to change). */
export const EYRIE_LINES: Readonly<Record<ClassId, string>> = {
  warrior: 'So that is what they did to the town.',
  ranger: 'The whole town, caught under their dome.',
  mage: 'Siege magic. That dome is drinking the town dry.',
  warlock: 'Their dome. I can taste its magic from here.',
  tinkerer: 'That is no storm. That is a machine made of spells.',
  brawler: 'They have caged the whole town.',
};

export const QUEST610_TEXT = {
  featherAsk: 'The mystic: "No word has come up from the town below in weeks, and the stars will not say why. The Queen vulture nests on the Ledge Road and sees everything. Bring me one of her feathers, and I will see what she has seen."',
  featherAskPrompt: 'Mystic: a task',
  featherGot: 'You pluck a long black FEATHER from the Queen. Bring it to the mystic.',
  featherGivePrompt: 'Mystic: the Queen\'s feather',
  featherGiven: 'The mystic: "A dome of the cult\'s siege magic, fed from three pillars in the Sunken Fen. Only a ward-stone can put them out, and the cult broke theirs in three. Two pieces are hidden in the Pinewood. The Stag carries the third."',
  piecesHere: 'The mystic said two pieces of the ward-stone lie in the Pinewood\'s side areas, and the Stag carries the third.',
  pieceGot: (k: number) => `You take a piece of the WARD-STONE (${k} of 3).`,
  piecesWhole: 'All three pieces of the WARD-STONE. The pillars in the Sunken Fen wait.',
  pieceLabel: 'Ward-stone piece',
  pillarsLit: 'The cult\'s three obelisks blaze with the siege. While one burns, the Drowned Eye cannot be hurt.',
  pillarsLitNoPiece: 'The cult\'s three obelisks blaze with the siege. While one burns, the Drowned Eye cannot be hurt. Strike them down.',
  pillarPrompt: 'Obelisk: set a ward-stone piece',
  pillarSet: (left: number) => (left > 0 ? `The ward-stone piece flares, and the obelisk goes dark. ${left} still burn${left === 1 ? 's' : ''}.` : 'The ward-stone piece flares, and the last obelisk goes dark.'),
  pillarBroken: (left: number) => (left > 0 ? `The obelisk cracks and goes dark. ${left} still burn${left === 1 ? 's' : ''}.` : 'The last obelisk cracks and goes dark.'),
  siegeBroken: 'THE SIEGE IS BROKEN. The Drowned Eye can be hurt.',
  shielded: 'Shielded',
};

/**
 * THE PILLARS (his 00:18, “maybe you use them on three pillars during the swamp fight to deactive the seige magic”). Behind
 * PILLARS.on, OFF, and apart from QUESTS610's own switch: pictures to him first. Built on the Drowned Eye's fight as it stands
 * (game/act1_rules/eye.ts), the cult's three obelisks round his ring as the pillars, to be carried to his new fight (the art
 * chat's swamp colossus, his 7 Nov 00:07 to 00:13) when that is built. So:
 * - AS HIS LAST PHASE BEGINS (the siege pulled into him), the three obelisks BLAZE with it, and while any one burns he cannot be
 *   hurt ("Shielded");
 * - beside a burning one, the use button SETS A PIECE of the ward-stone into it, and it goes out (the friend's cyan at its foot);
 * - a hero with no piece left to set (one who skipped the Pinewood's side areas, or a save from before) can still BREAK one, by
 *   `blows` blows struck at its foot (no more than one counted each `gap` seconds), a slow way while the fight goes on round him;
 * - with all three out THE SIEGE IS BROKEN: his call of the siege's bolts, and the bolts in his swell, no more; he can be hurt.
 * The numbers are the main chat's, for him to change. Shown its pictures, asked “Put them in now on his current fight?”, his
 * answer by 06:41, 7 Nov 2026: “Wait for the new Eye fight”. So OFF, to go into the art chat's new fight with it; until then the
 * pieces taken stay in his bag.
 */
export const PILLARS = {
  on: false,
  /** How near the hero stands to a burning one to set a piece (tiles from its foot). */
  near: 1.8,
  /** Blows that break one with no piece set, and the least time between two that count (seconds). */
  blows: 12,
  gap: 0.3,
  /** How near its foot a blow must land to count (tiles, beyond the blow's own reach). */
  reach: 0.8,
};

/** One of the pillars, as it stands: where its foot is; whether it burns; how it was put out; blows taken. */
export interface Pillar {
  x: number;
  y: number;
  lit: boolean;
  by?: 'piece' | 'blows';
  hits: number;
  /** When it last took a blow that counted (Game.time). */
  last: number;
}

/** Pillars standing at these feet, all burning. */
export function lightPillars(at: readonly { x: number; y: number }[]): Pillar[] {
  return at.map((p) => ({ x: p.x, y: p.y, lit: true, hits: 0, last: -99 }));
}

/** How many burn. */
export function pillarsBurning(ps: readonly Pillar[] | undefined): number {
  return ps ? ps.filter((p) => p.lit).length : 0;
}

/** Whether the siege is broken: the pillars stood and every one is out. */
export function siegeBroken(ps: readonly Pillar[] | undefined): boolean {
  return PILLARS.on && !!ps && ps.length > 0 && ps.every((p) => !p.lit);
}

/** The pieces a hero still has in hand: taken, less those set into a pillar here. */
export function piecesInHand(bits: number | undefined, ps: readonly Pillar[] | undefined): number {
  return Math.max(0, piecesTaken(bits) - (ps ? ps.filter((p) => p.by === 'piece').length : 0));
}

/** How many of the ward-stone's pieces a hero has taken (Hero.pieces, a bit each). */
export function piecesTaken(bits: number | undefined): number {
  const b = bits ?? 0;
  return (b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1);
}
