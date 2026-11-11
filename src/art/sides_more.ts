// THE TINKERER AND THE BRAWLER FROM ALL EIGHT SIDES (the Tinkerer chat, 11 Nov 2026; the queue's
// draw-tinkerer-and-brawler-eight-sides; docs/mockups/eight_sides/README.md).
//
// His words, 4 Nov 2026, 19:22: “Also, we talked a long time ago about 8 drawings per class.  I think I still want that.” And of
// the first heroes, 6 Nov: “Are you actually painting 8 drawings or flipping some?”, his pick “Paint all 8 (Recommended)”.
//
// NOTHING OF EITHER IS REPAINTED. Both are sculpted already (dev/sculpt_tinkerer.ts, dev/sculpt_veteran.ts: the Brawler is the
// Veteran, game/veteran.ts), and the Brawler is his measure for new art (9 Nov), so the two sides the game has of each (from in
// front, turned 0; truly from behind, turned 90 to the left) are the very same pictures with a switch on as with it off, to the
// pixel (tests/sides_more.test.ts). What is new is the SIX SIDES THE GAME MIRRORED OR NEVER DREW: the same figure, in the same
// pose at the same moment of the same move, truly turned before the game's camera 45 degrees apart (art/warrior_up.ts WuSide:
// the sides the Warrior, the Ranger and the Mage are painted from), so her wrench is on her right shoulder and his blind eye
// his left whichever way they face.
//
// OFF: the game is exactly as it is. On, art/tinkerer_art.ts and art/veteran_art.ts give eight sets where they gave two, and
// the game shows the side for the way the hero faces as it does the Warrior's (render/figure.ts, art/sides.ts); for the Brawler
// his moves, his action lines and his blows go the nearest of EIGHT ways where they went the nearest of four
// (render/veteran_fx.ts, game/veteran.ts: `brawler` is read there too).
//
// (NO IMPORTS AT ALL: the rules read this switch and must not pull the art in with it; and the Brawler's pictures must bring in
// nothing of the old Brawler, not even by a type's file: tests/veteran.test.ts, his “I don’t want anything reused from the
// original brawler”. So the sides are named here again, and a test holds them to the Warrior's.)

/** A side a hero is painted from: art/warrior_up.ts WuSide's own eight, by the same names. */
export type MoreSide = 'front' | 'toward' | 'frontL' | 'sideL' | 'backL' | 'away' | 'back' | 'side';

/** The switches: each hero's own. OFF until he has seen the pictures and said yes, and the main chat has baked them. */
export const EIGHT_MORE = { tinkerer: false, brawler: false };

/** The eight sides, the two the game has always had first (art/sides.ts EIGHT_ORDER's order). */
export const MORE_SIDES: readonly MoreSide[] = ['front', 'back', 'toward', 'frontL', 'sideL', 'backL', 'away', 'side'];

/**
 * How far each side turns a sculpted hero to their left (degrees) before the game's camera: art/warrior_up.ts WU_SPIN's own
 * numbers (a test holds them to it). `front` 0 and `back` 90 are what the game's two sides have always been turned.
 */
export const MORE_TURN: Readonly<Record<MoreSide, number>> = { front: 0, toward: -45, frontL: -90, sideL: -135, backL: 180, away: 135, back: 90, side: 45 };

/**
 * The way a side faces on the game's floor (a unit vector, tiles: +x is down the screen to the right, +y down to the left):
 * the eight ways a hero's picture can face, 45 degrees apart, as art/warrior_up_art.ts wuFacing chooses a side for a facing.
 */
export const MORE_WAY: Readonly<Record<MoreSide, readonly [number, number]>> = (() => {
  const r = Math.SQRT1_2;
  return { front: [1, 0], toward: [r, r], frontL: [0, 1], sideL: [-r, r], backL: [-1, 0], away: [-r, -r], back: [0, -1], side: [r, -r] };
})();

/** The side whose way is nearest a facing (fx, fy): wuFacing's own choice, without the art. */
export function moreSideOf(fx: number, fy: number): MoreSide {
  const a = (Math.atan2(fy, fx) * 180) / Math.PI;
  const k = ((Math.round(a / 45) % 8) + 8) % 8;
  return (['front', 'toward', 'frontL', 'sideL', 'backL', 'away', 'back', 'side'] as const)[k];
}
