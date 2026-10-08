# Your monster: THE CAVE BAT

File: `src/art/monster_bat.ts`. It exports `paintBat(q, back)` (a `Rig`) and `makeBatArt()`. Preview: `src/dev/preview_m_bat.ts`.

Concept painting: `bat(L)` in `src/dev/styles_cast.ts`, in the look `NEON` at the bottom of `src/dev/styles.ts`. It is the third monster on the lower half of the style sheet. (It is painted square-on. Yours faces screen-RIGHT: turn the head and body a little that way, and make the wing nearer the camera the bigger of the two.) `previews/monsters.png` shows the bat as the game has it today (old, coarse art).

What the owner said yes to: a small furry body and head of deep indigo (`FUR`) with two tall pointed ears, two eyes of `SOCKET`, a dark mouth with two white fangs (`BONE`), tiny feet; wings of magenta skin (`WING`, the far wing in `dim(WING)`) stretched over an arm and finger bones drawn in the fur's light tone, with scalloped trailing edges.

- IT FLIES. Nothing touches the floor: the centre of the body is about 26 picture pixels above KAY when it hovers. The game draws its shadow on the floor: paint none.
- Size: small. Body and head together about 20 pixels tall; the wings about 44 from tip to tip at full stretch.
- It has no legs, so the walk's numbers are yours to reinterpret (say how in a comment). The wings beat with `wind`. Standing (hovering): the loop is twelve frames in which `wind` goes once round; give `idleFps: 20` in `monsterArt`'s options so that it lasts 0.6 seconds, and beat TWICE in it (six frames to a beat). Flying along (the "walk"): eight frames in which `wind` goes twice round, in half a second: beat once per round of `wind` (four frames to a beat), and tilt the body forward with `drag`. A wing beat is not a hinge flapping. On the down-stroke the wing is spread wide and the body RISES; on the up-stroke the wing folds at the wrist with the tip trailing, and the body SINKS. Every frame of a beat should be a different wing shape (raised, spreading, level, down and cupped, folding, rising).
- Attack: `hit` = 0.22 (very fast: the whole thing is half a second). A bite. Wound up: reared up and back, the wings thrown high in a V, the mouth wide open with the fangs showing, the eyes flared (a bigger light). Blow: a dart forward and down (to screen-right, about 10 pixels, at the hero's throat), wings swept right back, fangs first. After: wings spread wide to brake, the body swinging back up to where it hovers.
- From behind: the back of the head and the ears, no eyes or fangs, the fur of the back, and the wings seen from above with their bones more marked.
- The pool of light behind a monster (`MENACE` in mkit.ts) sits at a standing figure's waist. Give your own `aura` in `monsterArt`'s options, smaller (r about 26) and placed behind the bat's body where it hovers.
