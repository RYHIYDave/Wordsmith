# Your monster: THE WARDEN (the boss at the bottom of the dungeon)

File: `src/art/monster_warden.ts`. It exports `paintWarden(q, back)` (a `Rig`), `makeWardenArt()` and `WARDEN_CANVAS`. Preview: `src/dev/preview_m_warden.ts`.

There is NO concept painting of the Warden in the new style: you are designing him, inside the style of the sheet and of the knight (`src/art/hero_warrior.ts`), whose dark mirror he is. What he is in the game today is painted in `src/art/boss.ts` and shown in `previews/boss.png` (the old, coarse art: take the idea and what makes him recognisable, do not port its pixels): "a towering skeletal knight in cracked, ember-lit iron, with a two-handed maul": a horned helm open over a skull's face, fire showing through cracks in the plate, a tattered crimson cape, a maul whose head carries a burning rune.

## A canvas of your own

He does not fit the kit's 112 x 112 canvas. Paint him on a bigger one of your own, which the kit allows (read `Canvas` in `src/art/mkit.ts` and `RigOpts.anchor` in `src/art/kit.ts`):

    export const WARDEN_CANVAS: Canvas = { w: 184, h: 176, ax: 80, ay: 162 };

- make every layer with `new Px(WARDEN_CANVAS.w, WARDEN_CANVAS.h)` (NOT the kit's `layer()`, which is 112 x 112); `lit`, `ball`, `limb`, `stamp`, `compose` and the rest work on any size;
- measure from (ax, ay) where the kit's figures measure from (KX, KAY): the floor point under him is (80, 162), so there are 162 pixels of height above the floor, 80 to the left of the centre line and 104 to the right;
- pass `canvas: WARDEN_CANVAS` in `monsterArt`'s options, and give it to the sheet as its third argument: `showActor('warden', makeWardenArt(), WARDEN_CANVAS)`.

## The design

- A dead king's jailer. TOWERING: the top of the helm about 108 picture pixels above the floor, the horns higher (the knight's helm comes to 66), broad in the shoulder (about 56 across the pauldrons), narrow in the waist, long in the arm.
- Plate of dark `IRON`, with cracks in the breastplate and the helm through which fire shows (`FLAME`: a line of tone [2] with a pixel or two of [3]; they give off small lights). A horned helm, open at the front over a SKULL (`BONE`) with sockets of `INK` and eyes of `SOCKET` (each a small light). Where the plate gapes there is bone under it: rib ends at the waist, bone fingers on the shaft.
- A long tattered cape in `BLOOD`, ragged at the hem, moving with `wind` and `drag` (see how the heroes' cloth is painted). From the front it frames the legs; from behind it is most of the picture.
- A two-handed MAUL: a long shaft (`INDIGO` wood bound in `IRON`) and a huge block of a head in `IRON` with a rune cut in its face. The rune smoulders in `FLAME` at rest; when the maul is "hot" (below) the rune and the edges of the head burn bright and it gives off a big light.

## The animations

He has TWO attacks, so give `monsterArt` both an `attack` and a `heavy`, for each facing:

1. `attack`, `hit` = 0.95: THE SLAM. The maul comes down on the ground in front of him (the game draws a warning circle on the floor there, and shakes the screen when it lands). Wound up: the maul swung up and back in both hands until its head is high over the helm, the body coiled, the cape thrown out, the cracks and the maul's head going HOT (use `act`, 0..1, for how hot: brighter cracks, bigger lights). It is held for a third of a second. Blow: the head on the floor in front of his feet (screen-right, at about the floor line), the body driven down over it. After: he leans on it while the heat dies; then he draws it back to rest.
2. `heavy`, `hit` = 0.7: THE VOLLEY. He looses a fan of seven bolts of fire from his open hand (the game draws the bolts). It must look NOTHING like the slam from its first frame: he plants the maul head down on the floor beside him with one hand, and raises the other hand, open, high in front of him; fire gathers in the palm (a flame growing, a light growing: `prop` and `pt`, or `act`, as you choose). Blow: the hand swept forward and out toward the hero, empty. After: the arm falls, and he takes the maul up again.

- Standing: the maul held across the body or planted beside him, its head low, both hands on the shaft. He breathes slowly (`bob`), the cape stirs, the cracks pulse faintly with `wind`.
- Walking: a slow heavy stride (give `walkFps: 10` or so in `monsterArt`'s options), the maul carried across him, the cape dragging behind.
- From behind: the cape from the shoulders to the heels, the back of the horned helm above it, a pauldron either side, the maul seen past the body on the side it is held.

The pool of light behind him: give your own `aura` in `monsterArt`'s options, bigger than `MENACE` and hotter (r about 70, a about 0.18, centred behind his chest, in picture pixels on YOUR canvas).

Check every frame of both attacks against the canvas edge (the sheet tool marks such frames in red).
