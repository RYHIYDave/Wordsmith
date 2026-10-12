# The start screen, made new for the new wordsmith

Made by the art chat, 11 Oct 2026, on the branch `mockup/title-wordsmith` (from main, 7fdb6f9).
Behind `TITLE_SMITH3` (off) in `src/art/title_smith3.ts`. With the switch off, the start screen is
the old one (`art/title_smith2.ts`) exactly as now.

## What he said

- 19:46: “Can you reimagine the title screen art to reflect the new wordsmith design”
- Shown the first version on the page "New Start Screen", asked whether it was right: “I’d like it
  to pass all the checks we have for animations.  And to just be drawn better.  The arms are too
  thin and the hands look weird”. Read back to him as: put the start screen through every
  animation check in his art rulebook, draw it better overall, and give him thick, strong arms and
  properly drawn hands.
- Shown it again on the same page, asked as a pop-up, “The start screen has been drawn again, as
  shown on the New Start Screen page. He has thick arms and properly drawn hands, and the big moment
  now winds up, bursts and follows through. It passes every animation check in your rulebook. Is it
  right?”, by 21:27: “Yes, send it to main (Recommended)”, offered as: it goes to the main chat to
  switch on in the game.

## What it is

The picture he chose on 5 Oct (from the floor in front of the wordsmith's table, looking up), with
the wordsmith as he is now (Version 19.6, `art/smith3.ts`): a teal cowl and mantle, a night-blue
robe, a white beard, eyes burning cyan, runes burning on him; his ring big and wild (a great rune in
each standing stone with light licking up it, letters of light swirling round him, a column of light
off the word on his table). Kept from 5 Oct: the power running through the runes, his breath, the
table's top pulsing and lighting his face, the same 8-second round (`SMITH3_CYCLE`, as
`SMITH2_CYCLE`).

Drawn again after his 19:46 answer:

- His forearms are thick, swelling below the elbow, with a raised vein and one rune burning in each
  (`foreArm`, `ARM`). His hands are drawn pixel by pixel (`HAND`, a character map of the right
  hand; the left is it turned over): wrist, the back of the hand with tendons and a rune, knuckles
  along the edge, four fingers curled over the table's edge with a nail at each end, a thumb along
  the top. There is no line between the hand and the forearm it comes out of (`handBare`).
- His beard ends in locks with pointed ends.

## Every animation check

- **The big moment** (`SMITH3_GREAT`, 5.6 s into each round, where the two runs meet in the middle,
  at the top of his breath):
  - WIND-UP, `SMITH3_GATHER` = 1.2 s before (`smith3Gather`): the letters drawn in close and whipped
    round faster and faster (`letterSpread`, `whipAngle`, which adds up round after round so
    nothing jumps where a round ends); streaks of light pulled in to the word; the column of light
    thin and bright; his eyes burning up.
  - BURST: the screen flashes four frames (`smith3Flash`, the word's cyan, at most 0.32 strong) and
    kicks (`smith3Kick`: down 6 game pixels, ringing out in 0.42 s); two rings of light burst out
    over the vault behind him; 64 sparks spray up off the word and fall (behind the table's edge if
    they get so far); the letters are flung far out, smearing.
  - FOLLOW-THROUGH: the blast blows his beard (lifted, flared, parted in the middle) and his mantle
    (its points flung up) for 0.56 s, a flutter, then they drop back (`smith3Blow`, 0, 1 or 2: the
    frames `frame(rise, blow)`); the letters come home by about 1.8 s; grit shaken loose falls
    from the vault behind him for up to 2.4 s.
- **Alive when still**: he breathes as before; he glances aside and back twice a round
  (`smith3Glance`, 3 pixels, a pixel a frame); the fingers of his right hand (our right) drum on the
  edge, the little finger first, from 2.43 s to 2.92 s, each up 0.1 s and a fleck of light flying
  off as it comes down (`smith3Drum`, `SMITH3_DRUM`; the pictures `Smith3Painted.drum`). Only while
  the power is quiet.
- **Slick**: everything at 30 frames a second (the letters no longer step at 12); where a letter
  goes fast it smears along its way.
- **Nothing passes through**: letters behind him are hidden by him; in front they keep off his face.
- **Every pixel crisp**: no lone pixel in anything that moves (checked over a whole round), the
  column of light in flat steps, the licks up the stones and the runes' light cut cleanly.
- **Only a friend's cyan glows**: nothing warm, pink or gold.

## For the main chat

- To switch it on: `TITLE_SMITH3.on = true` (main.ts already picks `makeSmith3Title()` when it is
  on; `__dbg.titleLook('smith3')` shows it).
- `ui/panels.ts`: `SmithPicture` may have `kick(t)` and `flash(t)`; when the picture has them the
  start screen throws the picture (not the name or the buttons) and lays the flash over it. The old
  picture has neither, so nothing changes with the switch off.
- Cost, measured here: painting the picture about 0.35 to 0.5 s (the old one about 0.33 s); then 8
  frames painted one a call to `life` at about 60 to 75 ms each (his breath, 4, and the blast, 4;
  the old one 4); its life about 2.2 ms a frame (the old one 1.4 ms). The start screen in the game,
  phone-sized, two rounds: 56 frames a second (the old one 59); with the processor slowed four
  times, 49 (the old one 53).
- Sound moments, if the sound chat wants them: the burst at 5.6 s into each round (the flash and
  the kick, the rings and the sparks); the fingers' taps at 2.53, 2.66, 2.79 and 2.92 s.

## Checks

- `tests/titlesmith3.test.ts`, 18 (the eleven of the first version, and 12 to 18: the wind-up, the
  burst, the follow-through, nothing jumps, no lone pixel and no soft fade, his habits, his arms and
  hands); `tests/smithmenu.test.ts`.
- The unit suite 963 of 963 on the branch; tsc clean.
- In the game: `node tools/build_to.mjs dist/title3.html`, then
  `node tools/playtest.mjs --file dist/title3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/title_smith3.mjs --out shots/title3/phone`.
- Films: `node tools/page_gif.mjs src/dev/preview_smith3_film.ts "new:8:2" previews/title3.gif`
  (a phone held sideways, laid out as the game lays it, the kick and the flash as the screen draws
  them); stills: `src/dev/preview_title_smith3.ts` (`look=runes`, `t=`, `crop=`, `still`).
