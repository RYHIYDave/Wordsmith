// THE FIVE WEAKEST FLOORS REMADE (his words, 25 Nov 2026: "And I'd like you to look at our level design, find the five weakest
// levels, and make changes"; his pick of the five and their changes, "Yes, these five (Recommended)"):
//   7  THE QUEEN'S EYRIE   two side ledges off the trail (a vultures' nest with its chests; a lookout held by a champion's pack),
//                          and more fights on the long trail (its outcrops more fought over, a pack on every long leg).
//   8  THE CANTOR'S GORGE  a side cave (a champion's pack in it), and a high way and a low way that part and meet again.
//   10 THE DROWNED EYE     a second way across the fen, meeting the first again before the Eye, and a sunken shrine (its chests).
//   1  THE WARDEN'S TOMB   more fights along its long corridors (still a first floor's), and a side crypt with a chest.
//   19 THE THRONE HALL     twice the fights, two more kinds of the High City's own, and an armoury wing off its hall.
// For the Godot game, which takes its floors from here (tools/godot_export.ts, tools/godot_record.mjs): the remade floors are
// written beside the old (godot/assets/floor<N>v2/, its look floor<N>v2) and the Godot game's LEVELS2 switch picks them, off until
// his yes to their pictures. Here, off: the browser game's floors as they were; WS_LEVELS2=1 puts it on for the export.
export const LEVELS2 = { on: false, floors: [1, 7, 8, 10, 19] };

/** Whether floor `depth` is laid as remade. */
export function levels2(depth: number): boolean {
  return LEVELS2.on && LEVELS2.floors.includes(depth);
}
