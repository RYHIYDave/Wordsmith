// THE EXITS' NAMES (behind EXIT_LABELS, off until his yes to the game's pictures of them). The owner, 23 Oct 2026, 11:37
// (Pacific): “I’d like the exits to be labeled like the stash once they open when the boss dies.” Asked what a label
// says, by 11:38: “What it is”, offered as: e.g. STAIRS, CAVE, CAGE, CAUSEWAY. So once a floor's way out has opened as its
// boss died, its name stands over it as the town's services' names stand over them (render/render.ts, the labels):
//   floors 1 to 3: the stairwell, STAIRS, once it has broken open;
//   floor 4: the cave in the wall, CAVE, once the wall has fallen;
//   floor 5: the cage come down the shaft, CAGE;
//   floors 6 to 15 (the art chat's ways on, game/ways.ts ONWARD): STAIRS (the quarry's cut), CHIMNEY (the crack down the
//     ledge), SLOT (the canyon's), TRAIL (the pinewood's), CAUSEWAY (the fen's), GRATE (the Crier's), OUTFALL (the Rat King's),
//     POSTERN (the Millrace's), DOOR (the Physician's), GREAT DOORS (the library's), once each film is over;
//   elsewhere, a way on that is a column of light: WAY ON, once awake.
// Where each stands (the rules know it) and how high over its foot the name is, in game pixels.

import { doorMiddle } from './doors';
import type { Level } from './state';
import { EXITS, ONWARD, stairMiddle, STAIR_OPENING } from './ways';

/** THE SWITCH. */
export const EXIT_LABELS = { on: true };

/** Floors 6 to 10's ways on, what each is. */
export const ONWARD_NAME: Readonly<Record<number, string>> = { 6: 'STAIRS', 7: 'CHIMNEY', 8: 'SLOT', 9: 'TRAIL', 10: 'CAUSEWAY', 11: 'GRATE', 12: 'OUTFALL', 13: 'POSTERN', 14: 'DOOR', 15: 'GREAT DOORS' };

/** An open exit's name: where its foot is (tiles), the name, and how high over its foot it stands (game pixels). */
export interface ExitLabel {
  x: number;
  y: number;
  text: string;
  lift: number;
}

/** The names of this level's open exits (none in town, none before its boss has fallen). */
export function exitLabels(L: Level): ExitLabel[] {
  const W = L.ways;
  if (!W || L.town) return [];
  const out: ExitLabel[] = [];
  const st = W.stair;
  if (st && st.open && (st.t ?? STAIR_OPENING) >= STAIR_OPENING) {
    const m = stairMiddle(st);
    out.push({ x: m.x, y: m.y, text: 'STAIRS', lift: 18 });
  }
  if (EXITS.on && W.cave && W.cave.state === 'open') {
    const m = doorMiddle(W.cave.spot);
    out.push({ x: m.x, y: m.y, text: 'CAVE', lift: 52 });
  }
  if (W.shaft && W.shaft.state === 'down') out.push({ x: W.shaft.x + 0.5, y: W.shaft.y + 0.5, text: 'CAGE', lift: 56 });
  const on = W.onward;
  if (on && on.awake) {
    const a1 = W.a1;
    if (a1) {
      if (a1.open) out.push({ x: a1.way.at.x, y: a1.way.at.y, text: ONWARD_NAME[a1.floor] ?? 'WAY ON', lift: ONWARD[a1.floor]?.place === 'square' ? 16 : 44 });
    } else out.push({ x: on.x, y: on.y, text: 'WAY ON', lift: 50 });
  }
  return out;
}
