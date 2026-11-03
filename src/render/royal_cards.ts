// THE ROYAL CARDS IN PLAY (game/royal_cards.ts; on the High City's floors, behind HIGH_CITY, off until he has played them and
// said yes). Two things are drawn on the floor:
//   - over an enemy a royal has touched, that royal's crest (art/royal_crest.ts, the main chat's: the art chat's royal swan in
//     the royal's colours), over its head, a little bob; above the word it carries, if it carries one;
//   - a royal's card lying where a touched one died (the art chat's `a royal card`, art/high_city_set.ts), named in its
//     royal's colour.

import { royalCard, ROYAL_LOOK } from '../art/high_city_set';
import { royalCrests } from '../art/royal_crest';
import type { Sprite } from '../engine/px';
import type { Royal } from '../game/royal_cards';

let CARDS: Partial<Record<Royal, Sprite>> = {};
/** A royal's card lying face up (the art chat's; 52 x 34, at its middle). Made the first time it is asked for. */
export function royalCardSprite(r: Royal): Sprite {
  return (CARDS[r] ??= royalCard(r));
}

/** The colour a royal's card is named in on the floor: its royal's trim, lit. */
export function royalLabelColor(r: Royal): string {
  return ROYAL_LOOK[r].trim[4];
}

/** The four cards' faces only (no floor round them), for the stranger's page: where on the card's picture the face lies. */
export const CARD_FACE = { x: 11, y: 6, w: 31, h: 22 };

/**
 * A royal's crest over a touched enemy: its foot `foot` pixels over the figure's top (sx, top in the game's pixels). The
 * crest stands still but for a slow bob of one pixel.
 */
export function drawRoyalCrest(g: CanvasRenderingContext2D, r: Royal, sx: number, top: number, t: number, id: number): void {
  const c = royalCrests()[r];
  const bob = Math.round(Math.sin(t * 2.4 + id * 1.7));
  g.drawImage(c.img, Math.round(sx - c.ax), Math.round(top - c.ay + bob));
}

/** Forget the cards made (a test's painting without a canvas). */
export function forgetRoyalCards(): void {
  CARDS = {};
}
