# Your monsters: THE BRUTE and THE GUARDIAN (one file, one rig, two figures)

File: `src/art/monster_brute.ts`. It exports `paintBrute(q, back)` and `paintGuardian(q, back)` (both of type `Rig`, both made from ONE painter with a switch), `makeBruteArt()` and `makeGuardianArt()`, and `BRUTE_CANVAS`. Previews: `src/dev/preview_m_brute.ts` and `src/dev/preview_m_guardian.ts`.

Concept painting: `brute(L)` in `src/dev/styles_cast.ts`, in the look `NEON` at the bottom of `src/dev/styles.ts`. It is the last monster on the lower half of the style sheet. NOTE: the concept faces screen-LEFT (it was painted facing the hero). Yours faces screen-RIGHT: mirror it. `previews/monsters.png` shows the brute as the game has it today (old, coarse art, in green): the same beast.

## A canvas of your own

These two do not fit the kit's 112 x 112 canvas (a club held over the head, a guardian a third bigger). Paint them on a bigger one of your own, which the kit allows (read `Canvas` in `src/art/mkit.ts` and `RigOpts.anchor` in `src/art/kit.ts`):

    export const BRUTE_CANVAS: Canvas = { w: 176, h: 160, ax: 76, ay: 146 };

- make every layer with `new Px(BRUTE_CANVAS.w, BRUTE_CANVAS.h)` (NOT the kit's `layer()`, which is 112 x 112); `lit`, `ball`, `limb`, `stamp`, `compose` and the rest work on any size;
- measure from (ax, ay) where the kit's figures measure from (KX, KAY): the floor point under the figure is (76, 146), so there are 146 pixels of height above the floor, 76 to the left of the centre line and 100 to the right;
- pass `canvas: BRUTE_CANVAS` in `monsterArt`'s options, and give it to the sheet as its third argument: `showActor('brute', makeBruteArt(), BRUTE_CANVAS)`.

## The brute

What the owner said yes to: a hulking ogre with a hide of slate blue (`FLESH`; the arm and leg further from the camera in `dim(FLESH)`). A barrel of a body, as wide as it is tall; a TINY head sunk between boulder shoulders, with a heavy brow, two eyes of `SOCKET` under it, a slit of a mouth and two tusks (`BONE`); short thick legs planted wide, with flat feet; a ragged hide round the hips and a strap across the chest (`PLUM`); a navel, and the line under the chest; one arm hanging with its fist near the knee; the other holding a great club high: `INDIGO` wood, thick at the far end, studded with `STEEL`.

- Size: a little bigger than on the sheet. The top of the head about 54 picture pixels above the floor (the knight's helm comes to 66: the brute is lower than the knight, and TWICE his width): the body about 32 across, more with the arms. He must look as if he weighs a ton.
- Standing: he breathes with his whole belly (`bob` moves the chest AND swells the belly a pixel), the head turns a little, the club's weight shifts, the hanging fist opens and closes.
- Walking: a heavy waddle (give `walkFps: 11` or so in `monsterArt`'s options: he steps slowly). The body rolls from side to side over each planted foot (`lean`), the feet come down flat, the fist swings low, the club rides at the shoulder and bounces a beat behind the body.
- Attack: `hit` = 0.85. An overhead smash that hits the GROUND in front of him (the game draws a warning circle on the floor there, and shakes the screen when it lands). Wound up: reared right up on his toes, the club in BOTH hands straight up and back over the head, the belly thrust out, the mouth open in a roar (show the dark of the mouth and the tusks). This pose is held for a third of a second: it should be the biggest, clearest warning in the game. Blow: the head of the club ON THE FLOOR in front of his feet (to screen-right, its end at about the floor line), the whole body folded over it, arms straight. After: stuck there, shoulders heaving; then he hauls it back up.
- From behind: the huge slab of the back with the strap crossing it and the groove of the spine, the back of the tiny head between the shoulders (ears, no face), the hide over the rump, the club seen past the shoulder.

## The guardian

The powerful beast at the end of a side path: rarer, far tougher, and it must look it. The same rig with a switch, and NOT only a change of colour:

- about 1.3 times the brute in every direction (the head stays small): the top of its head about 70 above the floor, higher than the knight;
- a hide of `GORE` (flushed red) instead of slate;
- armed and armoured in `IRON`: a spiked collar or one great shoulder plate, a band or two on the forearms; the club bound with iron bands whose edges glow in `FLAME` (and give off a small light);
- one broken tusk, and a scar (`BLOOD`) across the chest or the brow.

Its attack is the brute's (the same `hit`, 0.85). It reaches further in every direction: check EVERY frame of it against the canvas edge (the sheet tool marks such frames in red).
