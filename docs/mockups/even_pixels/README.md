# Even pixels on his iPhone (12 Nov 2026)

The Pixels chat (session ...VetztYx), a chat of his working from the queue (the item `check-pixel-size-on-his-iphone`; his words,
12 Nov, asked whether to start it: “Yes, start it (Recommended)”). Branch `build/even-pixels`, cut from main 40c62c8d. Main is
untouched; nothing is published.

## What was wrong, from his own phone

The picture holds two picture pixels to a game pixel (`engine/screen.ts` RES); the screen gives a whole number of screen pixels to
a game pixel. Odd, each picture pixel is 2.5 screen pixels at 5: 2 and 3 wide by turns, outlines thick and thin (the art review,
9 Nov). His phone check runs of 12 Nov (the “Wordsmith phone check” page's database, collection `runs`: an iPhone, iOS 18.7, 3 to
a point, in the Claude app) give his sizes:

- the page upright and the game turned for him: 393 by 723 points: **5** to a game pixel (uneven); three of his five runs;
- the page sideways: 734 by 315: **4** (even).

Played at his size here (`tools/scenarios/even_pixels_look.mjs`, 393x723 at 3, a finger): 5 as the game is, 4 with the switch.
The project's own phone size, 844x390 at 3, was at 5 too: it is 4 now.

## What it is

`engine/screen.ts` EVEN_PIXELS (ON) and MAX_H: on a touch screen an odd number of screen pixels to a game pixel is made one fewer,
even, where the view that gives is no taller than 324 game pixels. At his upright size that is 4: things the size they are when
the page turns with him, the view 543 by 295 game pixels where 434 by 236, the buttons as much smaller. A desktop is untouched.
`main.ts` `__dbg.evenPixels(on)` for pictures.

## His word

Shown `pictures/floor11_now_vs_even.png` (the Gate Ward at his size, as now and even, and a close-up of the Brawler at 5x) and
told that way of holding it things would be about 20% smaller, the buttons too, 12 Nov 2026: “Yes, make them even
(Recommended)”. So the switch is on.

## Checked

tsc clean. Playtests on a page of the branch, a finger: `even_pixels_look.mjs` at 393x723 x3 (5 off, 4 on: checked);
`towntap.mjs`, `guide.mjs` (the Warrior), `items_look_phone.mjs` (852x393 x3): finished clean. No unit test imports the screen.

FOUND, NOT OF THIS: `guide.mjs` as the Mage fails the same way on main 40c62c8d, at a phone's size and at a desk's: the ring's word
does not come within its 10 s. On a page with no heroes' bake beside it her frames are painted as she is shown and the game's
own time runs at about a third in town (the ring's 4.7 s took about 13 s here); the release carries the bake. Not looked at
with the bake.

## For the main chat

Merge it (two lines of the screen's sizing, one `__dbg` hook; nothing to bake). It changes how the game looks on phones whose
number comes out odd (his upright, and 844x390 x3): with his yes above. The published page's playtests at a phone's size will
take the new size (the scenarios go by marks).
