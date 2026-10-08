# Your monsters: THE SKELETON and THE BONE ARCHER (one file, two figures)

File: `src/art/monster_bones.ts`. It exports `paintSkeleton(q, back)` and `paintArcher(q, back)` (both of type `Rig`; let them share everything they can share, for example one function that paints the bones with a switch for what is carried), `makeSkeletonArt()` and `makeArcherArt()`. Previews: `src/dev/preview_m_skeleton.ts` and `src/dev/preview_m_archer.ts`.

Concept painting: `skeleton(L)` in `src/dev/styles.ts`, with the look `NEON` at the bottom of that file (it is the first monster on the lower half of the style sheet). NOTE: the concept faces screen-LEFT (it was painted facing the hero). Yours faces screen-RIGHT: mirror it. `previews/monsters.png` shows both as the game has them today (old, coarse art).

## The skeleton

It is the most common enemy in the game: the player sees a hundred of them in an evening. It has to be the best of the set.

What the owner said yes to: a skull of pale lavender bone (`BONE`) with two square sockets of `INK` and a point of `SOCKET` pink deep in each, a nose hole, a row of teeth and a jaw; a rib cage painted AS RIBS (rows of bone with dark between them, you can see through it), a spine, a pelvis; thin arm and leg bones with a knob at every joint; three finger bones on the hanging hand; long feet; a ragged scrap of cloth at the hips in `TEAL`; a notched, rusted sword (`RUST`, with a few lighter specks) in the raised hand.

- Size: a little shorter and much thinner than the knight. The crown of the skull about 52 picture pixels above the floor.
- Standing: never quite still. The jaw hangs and clacks shut now and then, the rib cage rises and falls (`bob`), the rag stirs (`wind`), the sword hand drifts. The sword is held up and ready, as on the sheet.
- Walking: a loose, rattling shamble. Knees and elbows bend a little too far, the skull nods a beat behind the body, the free arm swings, the rag trails (`drag`).
- Attack: `hit` = 0.4. A chop. Wound up: the sword high above and behind the skull, the whole frame leaning back, the jaw wide open. Blow: the blade down in front at the height of the knight's chest, the body thrown forward over the front foot. After: the blade low, the skull dipped; then back to rest.
- From behind: the back of the skull (no sockets: a round cranium, a crack, the notch where the spine goes in), shoulder blades, the spine running down between the ribs, the rag's knot. Think about which side the sword arm is on.

## The bone archer

The same bones, told apart AT A GLANCE at phone size (it behaves differently: it keeps its distance and shoots, so the player has to know which is which before it fires). It carries a tall bow of `INDIGO` wood with a pale string (see how the ranger's bow is built and drawn in `src/art/hero_ranger.ts`) and wears a ragged RED hood and short mantle (`BLOOD`) over the skull and shoulders, the sockets glowing under it: in the game today the archer is the skeleton in the red hood (`previews/monsters.png`), and players know it by that. A quiver on its back (arrows fletched in `PINK`), so that from behind the hood and the quiver are what you see. No rag at the hips.

- Standing: the bow held low in front, an arrow on the string pointing at the floor. Walking: the bow carried across the body.
- Attack: `hit` = 0.55. Wound up: the bow raised and DRAWN FULL, the string hand at the jaw, the arrow levelled at the hero (to screen-right: a little downward in the front view, a little upward in the back view), the arrowhead a spark of `SOCKET` with a small light. The draw builds over the first half of the wind-up and is then HELD. Use `act` for how far the bow is drawn. Blow: the string snapped straight, the arrow GONE (the game draws the arrow that flies). After: the bow arm still out, the string hand open by the jaw; then it lowers.
