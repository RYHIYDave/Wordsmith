You are repainting ONE monster (or one pair of monsters) of a pixel-art action RPG ("Wordsmith") so that it stands beside the game's heroes as their equal. All of the game's art is painted by code (TypeScript); nothing is an image file. The project is at /home/claude/arpg. Work there. You will write code, render it to a picture, LOOK at the picture, and improve it, round after round. The owner's words for this job: "we need the dungeons and mobs brought up to the level of the character models".

## What exists (read these first, carefully, in this order)

1. `previews/art_styles_1_and_6.png`: the sheet the game's owner chose his art style from. He chose "6 Bold and modern": flat colour in three tones per material, NO black outlines (the seam between two parts is a deep indigo), glowing accents on deep blue. The lower half of the sheet shows four monsters in that style (skeleton, cultist, bat, brute). THOSE PAINTINGS ARE THE DESIGNS HE SAID YES TO. `previews/heroes_chosen.png` and `previews/v11_warrior_in_game.png` show the finished heroes. `previews/monsters.png` and `previews/boss.png` show the monsters as the game has them today (the old art, half as fine as yours): a player who knows them must still know each one at a glance.
2. `src/art/kit.ts`: the painter's kit the heroes are built with. A figure is a "rig": a function that paints ONE frame from a `Pose` (a handful of numbers), facing the camera or facing away. Learn `layer`, `lit`, `ball`, `limb`, `arm`, `joint`, `leg`, `footOf`, `stamp`, `stroke`, `flutter`, `compose`, `dim`, `dir`, `hash`, the fields of `Pose`, `idlePoses`, `walkPoses`, and the ramps (STEEL, MAIL, PINK, TEAL, PLUM, CYAN, INDIGO, BONE, INK ...).
3. `src/art/clip.ts`: an animation is a timeline of key poses; the frames between are worked out, thirty to the second.
4. `src/art/mkit.ts`: the monsters' colours (SOCKET, FLAME, RUST, GLOOM, FLESH, GORE, FUR, WING, IRON, BLOOD) and the two helpers you must use: `strike(hit, wound, blow, after)` builds an attack's timeline, and `monsterArt(rig, frontMoves, backMoves, opts)` turns a rig into the game's art.
5. `src/art/hero_warrior.ts`: a finished hero, start to finish. THIS IS YOUR MODEL for how a rig is written, how its parts are layered, how the two facings differ, and how animations are given as poses. (`src/art/hero_mage.ts` shows a robe and cloth in the wind; `src/art/hero_ranger.ts` a bow being drawn.)
6. The concept painting of your monster, named in your own brief below: one standing figure, in code. It is painted with older helpers that work like the kit's. Port its shapes and colours; do not copy its code blindly.

## The rules of the picture

- Canvas: 112 x 112 picture pixels (`KW`, `KH`). The floor point under the figure (the anchor) is at x = `KAX` = 52, y = `KAY` = 102; the body's centre line is `KX` = 52. Two picture pixels make one game pixel.
- For scale: the knight standing is 44 wide and 66 tall (to the point of his helm).
- EVERY frame faces screen-RIGHT (the game mirrors it for screen-left). `back = false`: facing the camera (down and to the right; we see the face). `back = true`: facing away (up and to the right; we see the back). The two must be clearly different pictures: a back is not a front with the face rubbed out.
- The whole figure, weapon and all, must stay inside the canvas in every frame of every animation. The sheet tool draws a red frame round any cell that touches the edge and says so in its output.
- The near foot's sole stands on the row above KAY (y = KAY - 1), the far foot a row or two higher, as the heroes' do. Something that flies has its body well above KAY and nothing on the floor. The game draws the shadow on the floor: paint none.
- Light comes from the upper left. Three tones per material. No outlines: stack your layers with `compose(under, layers, over)`, which puts the indigo seam between them.
- Colour: use the ramps in kit.ts and mkit.ts (if you need one more, define it in your own file, in the same manner: three tones, in the sheet's family of colours). WHAT GLOWS ON AN ENEMY IS HOT PINK BURNING TO GOLD: eyes are `SOCKET` in a socket of `INK`; fire and hot runes are `FLAME`. Nothing on a monster glows cyan (that is the heroes'). For anything that truly gives off light, add a `Light` to the frame's `lights` (in picture pixels on the canvas; an eye: r about 5, a about 0.5; a flame: bigger and brighter as it grows).
- No "tails": the heroes' scarves and feathers are moved by a little physics engine every frame of the game, and monsters do not have that. Whatever cloth your figure wears is painted in the frame, from `wind` and `drag`.
- Read it small: on a phone the figure is drawn at HALF the picture's size. Big clear shapes, a silhouette that says what it is, no pixel noise.
- A frame is painted the first time the game shows it, in the middle of play: keep the painting of one frame about as cheap as the knight's (a dozen layers, a couple of dozen `lit` calls at the most; no loops over the whole canvas of your own).

## The animations

The game asks for a standing loop, a walk, and an attack, each for both facings.

- The standing loop and the walk are NOT yours to time: `monsterArt` takes them from the kit (`idlePoses()`: 12 frames, `wind` goes once round and `bob` is 0 or 1; `walkPoses()`: 8 frames, two steps, with `near`, `far`, `nearLift`, `farLift`, `bob`, `lean`, `swing`, `wind`, `drag`). Your rig must READ those numbers so that the figure breathes, its cloth and loose parts move with `wind`, its legs stride and its arms swing. What a number means for a creature without legs is your business (say so in a comment). The standing loop plays at 10 frames a second and the walk at 16 unless you give `idleFps` or `walkFps` in `monsterArt`'s options (something heavy steps more slowly).
- The attack is `strike(hit, wound, blow, after)`. `hit` is the moment the blow lands, in seconds, and MUST be the number given in your brief (it is how long the game waits between the start of the attack and its landing). `wound` is the wound-up pose, which is HELD for a moment: it is the player's warning, so it must read at a glance as "this is about to hit me" and look nothing like standing. `blow` is the instant of the hit; `after` the follow-through. Give front and back their own poses where the arm or weapon would cross the body differently (see how the knight's back attack differs from his front one). If your attack needs more key poses than those three, build the `Timeline` yourself as `strike` does (clip.ts), keeping its rules: it starts from rest, `hit` is the number given, and it ends 0.3 seconds after the hit, back at rest (with `wind: 1`).

## What you deliver

Exactly these new files, and NOTHING ELSE. Other painters are working on other monsters in the same folders at the same time: do not edit kit.ts, mkit.ts, actor_sheet.ts or any file that is not yours. If you think a shared file needs a change, say so in your report.

- the art file named in your brief, exporting the functions named there: each `make...Art()` returns `ActorArt` (use `monsterArt`), each `paint...` is a `Rig` (it paints one frame, as `paintWarrior` does);
- one small preview entry per figure, `src/dev/preview_m_<name>.ts`, three lines:

      import { make<Name>Art } from '../art/<your file>';
      import { showActor } from './actor_sheet';
      showActor('<name>', make<Name>Art());

## How to look at your work (do this constantly)

    cd /home/claude/arpg
    node tools/preview.mjs src/dev/preview_m_<name>.ts shots/art/<name>_lineup.png 600 400 "lineup:4:4"
    node tools/preview.mjs src/dev/preview_m_<name>.ts shots/art/<name>_idle.png 600 400 "front-idle:4:6"
    node tools/preview.mjs src/dev/preview_m_<name>.ts shots/art/<name>_walk.png 600 400 "front-walk:4:4"
    node tools/preview.mjs src/dev/preview_m_<name>.ts shots/art/<name>_attack.png 600 400 "front-attack:4:6"
    node tools/preview.mjs src/dev/preview_m_<name>.ts shots/art/<name>.png 600 400 "all"

then open the PNG with the Read tool and look hard. The last argument is `<what>:<zoom>:<cells in a row>:<show one frame in so many>`. `lineup` is the row to judge the figure by: the knight, then your figure from the front and from behind, then its attack wound up and at the blow for each facing, all at one scale. Other views: `front`, `back`, `idle`, `walk`, `attack`, `heavy`, and `<view>-<animation>` such as `back-attack`. `all` is everything at once, small: good for the flow of a movement, useless for detail. (The top of `src/dev/actor_sheet.ts` says more.) The tool prints the standing figure's size, warns if a frame touches the canvas edge, and tells you how big the sheet came out: A PICTURE MORE THAN 2000 PIXELS ON A SIDE IS SHOWN TO YOU REDUCED, and reduced pixel art cannot be judged, so for a close look ask for less at a time (one animation, fewer cells in a row, or every second frame). `src/dev/preview_m_test.ts` is a working example of an entry (the knight put through this pipeline).

Type-check your own files with

    /opt/npm-tools/node_modules/.bin/tsc --noEmit -p tsconfig.json 2>&1 | grep -E "<your art file's name>|preview_m_<name>"

(other painters' unfinished files may show errors of their own: ignore those). Strict TypeScript: no `any`, nothing unused left behind.

DO NOT run the unit tests, the browser playtests, `tools/regress.sh` or `node tools/build.mjs`: the machine has two processors and others are using it. Rendering your previews is fine.

## The bar

Put your line-up beside the knight and ask: would the owner believe the same hand painted both? Go round at least SIX times (render, look, fix): proportions and silhouette first, then the forms and their three tones, then the face, then each animation frame by frame (no part popping from one place to another between two frames, no limb coming away from its joint, no stray pixels, cloth that moves), then the back view with the same care, then the whole thing once more at the size of a phone in your mind's eye. Compare your figure with its concept painting on the style sheet: the owner should know it at once.

## Your report (your final message)

Plain and short: the files you wrote and what they export; what the figure looks like and how each animation plays; the size of the standing figure (the tool prints it); anything you know is still rough; anything you wished the kit had. Do not paste code.
