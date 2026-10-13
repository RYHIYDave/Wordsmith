# Act 1's other levels: how they could look (mock-up, 12 Oct 2026)

A picture for the owner, from the planning chat (the Chat Board's "plan"). Nothing of the game
imports it. His words, 12 Oct 2026, 18:56: "How bout a mock up of what the other levels would look
like?  I’d like the quarry and forest to be mostly open with minimal narrow paths between open
areas.  The forest and the swamp don’t really have walls".

`src/dev/preview_act1.ts` paints four of the doc "Wordsmith Act 1: The Descent" levels, each edge
made his way of 18:33 (today's tiles, the edge painted round over them; see
docs/mockups/ledge_road/README.md), the knight standing in each for scale:

- 6, THE QUARRY: three open pits, each joined to the next by a cut about a tile wide, sheer
  quarried walls (benches and drill marks), the mountain's grass and rock on top; cut blocks, the
  obelisk lying where it was cut, rails and a cart, a crane.
- 8, ECHO CANYON: the dry riverbed (sand, river-worn stones down the middle) between red layered
  walls 75 game pixels high; a broken cult wagon with an obelisk on it.
- 9, THE PINEWOOD: three clearings joined by paths a tile wide through the trees, no walls; a
  stream with a log bridge; the trees standing in front of ground the hero could be on drawn
  see-through; a late-afternoon light.
- 10, THE SUNKEN FEN: no walls; dark water, islands of mud, boardwalks, a sunken paved ruin with
  the cult's obelisk, the Eye's magic running out across the water in pink, mist, dusk.

THE NEAR WALLS (quarry and canyon) are left out as the game leaves out walls toward the eye: the
ground ends in its line of light, then a band of dark rock where the wall is cut, then the
rock's top.

The rock, ground, water, trees and light are rough mock-up paint to show the shapes and the
feel, not art for the game. Layouts are drawn on the screen (`at`, `area`) so that each open area
reads as one.

    node tools/preview.mjs src/dev/preview_act1.ts previews/act1_levels.png 1280 800

Sent to him by 19:06 as previews/act1_levels.png. His answer is not in yet.

## See-through walls (his question of 19:17)

His words, 19:17: "Can we do for the walls that would block the view of the character or enemies
the same thing that the mystic’s tent does where is becomes translucent when you pass by it?"

With the hash `see` the page paints Echo Canyon as the game does it today (the near wall left
out), then the canyon and the quarry with the near walls drawn whole, see-through in a window
round the knight and a dagger cultist (as the tent's roof is seen through, Version 14.5):

    node tools/preview.mjs src/dev/preview_act1.ts previews/act1_see_through.png 1280 800 see

What it shows: walls this tall (75 game pixels in the canyon, 50 in the quarry), drawn whole,
cover most of the ground behind them, so the windows show the figures but not the ground round
them (traps, loot, the danger marks of monsters' attacks), against his art rulebook's "The hero
and every warning stay in sight". The planning chat's pick, put to him: keep the near walls cut
away, and use the tent's see-through for tall things that stand in front (trees, pillars, the
crane, dead trees). Sent to him by 19:19 as previews/act1_see_through.png; his answer not in yet.

## Echo Canyon's walls on both sides (his word of 20:19)

His words, 20:19: "I feel like a canyon needs to feel that on both sides.  But I don’t like the
walls being up either.  So I don’t know what to do".

With the hash `canyon` the page paints two answers:

- A. THE CANYON RUN UP THE SCREEN, winding: its walls stand to the left and the right and none in
  front, so nothing is cut away; each wall's face shows where the canyon bends.
- B. ACROSS THE SCREEN, THE NEAR WALL FELT: cut away as now, but its shadow lies across the floor
  (`Way.shadow`, 1.6 tiles, its edge ragged), and rock spires stand out of it that go see-through,
  the tent's way, only while someone is behind them (`Prop.seeFor`).

    node tools/preview.mjs src/dev/preview_act1.ts previews/canyon_both_sides.png 1280 800 canyon

The planning chat's pick, put to him: both together (mostly up the screen; where it turns across,
B). Sent to him by 20:22 as previews/canyon_both_sides.png; his answer not in yet.

## Echo Canyon in the game's own frame (his ask after 20:22)

His words: "Can I get a shot of how it would actually look in game, just a little more detail?"

With the hash `shot` the page paints one phone screen (1014 x 468 picture pixels, the game's
507 x 234 at 2 picture pixels each) of the pick, both ways together: the canyon running up the
screen at the top and bottom, turning across in the middle, its near wall cut away with its
shadow on the floor; two hoodoos (round banded rock columns with a harder cap, `hoodoo()`) stand
out of the near wall, the one in front of the knight seen through at the game's own amount
(SEEN_THROUGH, 0.38), the other solid. More detail than the sheets: wind ripples in the sand, the
cult's wheel ruts, river stones, desert varnish down the far wall, scrub and cracks on the mesa,
a cult banner, the broken wagon and spilled crates, the mini fleshmancer leading two dagger
cultists. The place name and the map are painted by the page.

    node tools/preview.mjs src/dev/preview_act1.ts shots/canyon_world.png 1014 468 shot

(It ends with a thrown error, "shot painted", on purpose: the rest of the page is the sheets.)
The game's real HUD is then laid over it: two screenshots of the game on a phone held sideways
(844 x 390 at 3x) with the world painted black, then white, give the HUD and how see-through it
is pixel by pixel; the old place name, the NEW TALENT button and the inside of the map are taken
out. The result is previews/canyon_in_game.png, sent to him by 20:33.

For the main chat, if he says yes: the game sees through only things both wide and tall (60 x 70
game pixels, render/render.ts), so a hoodoo 26 game pixels wide would stay solid; a canyon's
spires would need their own rule.

His pick by 20:35, asked as a pop-up "Is this how Echo Canyon should look?": "Yes, this is it
(Recommended)", offered as: the canyon runs up the screen mostly, with the near wall's shadow and
see-through pillars where it turns; goes in the plan.

## The cliff tops dressed (his word of 20:35)

His words, 20:35: "If we really decorate the tops of the cliffs it will look really good"; to the
reading of it (junipers, sage, yucca, dead trees, boulders, small hoodoos, the cult's things up
there), 20:36: "Nice".

The `shot` page now dresses the tops (`topDecor()`): groves of junipers where a slow noise is
high, sagebrush, yucca (some in flower), shrubs, boulders, a few dead trees and small hoodoos, up to
three cairns and one bleached skull, spaced so bare ground shows between them; on the far top the
cult's lookout (a tent in the cult's violet, a watchfire burning the cult's pink, a banner, crates)
and a hoist whose crate hangs down the cliff over the road. The tops' ground has a rim of pale
caprock along every cliff edge and slabs of it out across the top, with irregular cracks. Nothing
is placed where it would stand over the canyon's floor (`clearOfFloor`), so the hero and every
warning stay in sight. A thing on a top is drawn at the top's height (`onTop`); its place in the
drawing order is its true place on the top.

The result with the HUD laid over it is previews/canyon_tops_in_game.png, sent to him by 20:41.
Asked as a pop-up "Are the cliff tops dressed the way you pictured?", his pick by 20:42: "Yes,
like this (Recommended)", offered as: this much dressing becomes the plan for the canyon's tops,
and the same idea for the other levels' tops.

## The Ledge Road's sky (his word of 18:34), and the near cliff's face

### The sky

With the hash `ledge` the page paints the Ledge Road as one screen of the game:

    node tools/preview.mjs src/dev/preview_act1.ts shots/ledge_world.png 1014 468 ledge

A first go looked down off the ledge: the mountain wall behind the road, the drop in front sinking
into clouds, the land far below (previews/ledge_sky_in_game.png). Asked as a pop-up "Is this the
Ledge Road's sky?", his answer: "Nah, I’m not a fan of the sky. I was thinking more like if we use
the same perspective as the canyon, the rear wall is gone and that where you see the sky".

So now: the mountain's slope is on the near side, cut away as the canyon's near cliff is, with firs
on it (never standing over the road); behind the road there is no wall: past its far edge (a line
of light) you look out at open sky, far snowy ranges, the valley far off in the haze, clouds
drifting below the ledge and vultures circling. A rope rail along the drop; the cult's lookouts on
an outcrop. In the game the sky would be a layer of its own, sliding slower than the ground.
Sent as previews/ledge_sky2_in_game.png; asked "Is this the Ledge Road's sky now?", his pick:
"Yes, this is it (Recommended)", offered as: mountain in front, cut away; open sky, far ranges and
clouds past the road's edge; goes in the plan. (previews/ledge_sky3_in_game.png is the same under
the near-cliff rule below.)

### The near cliff's face

His words: 20:50, "The black line at the edge of the foreground cliff doesn’t give the correct
perspective"; 21:01, "You just need to get the black shadow on the south east facing edges"; with
a picture of the canyon he painted black on, 21:24, "I painted black where I think the shadows would
be to force the perspective", and 21:25, "It shows the wall face as opposed to the top of mesa.
Light wouldn’t hit the wall so it’s shadowed". Tries in between (a lit rim with the floor's shadow
under it; black only on edges facing down-right; black only on the near-vertical stretches, then
thicker) each got "Still wrong" or "Close, but adjust", until by 21:40: "When the ridge line runs
back to the right any angle past straight down, you would see the sheer face of the cliff in
shadow.  So it’s not just a line on the ridge, it’s cliff face running vertically".

The rule now (`paintLevel`, `NEAR_FACE`): the floor runs to the near cliff's top with no line of
its own; where the near cliff's ridge, followed down the screen, slants back past straight down,
its side looks toward us and away from the light, so its sheer face shows, in shadow: rock hanging
straight down from the ridge to the floor, 40 picture pixels tall, narrow where the ridge only just
passes straight down and wider where it slants more. Sent as previews/canyon_face_in_game.png;
asked "...Is this the right idea?", his pick by 21:41: "Yes, that's it (Recommended)", offered as:
this becomes the rule for near cliffs on every level.

## The reveal from the Ledge Road

His words, 21:54, offered the town's first sight from the cliff next: "Okay let’s see it".
With the hash `reveal` the page paints the Ledge Road (his view, above) at the place where the town
first comes into view (`paintVista()`, laid over the view under the clouds; `TOWN`, `SWAMP`):

    node tools/preview.mjs src/dev/preview_act1.ts shots/reveal_world.png 1014 468 reveal

The clouds part; far below, the walled town, smoke rising inside it, a ring of the cult's violet
tents and their fires round it, and over it a dome of the cult's pink magic (rim bright, cracks of
power across it); off to the left the swamp under a dark violet glow, lines of magic running from it
to the dome. Pink, as pink and gold glows are the enemy's. Sent as previews/ledge_reveal_in_game.png;
asked "Is this the reveal, with the siege magic as a dome?", his pick by 21:57: "Yes, the dome
(Recommended)", offered as: settles the open question in your doc: the siege magic is a pink dome,
fed by lines from the swamp.

## The Sunken Fen, at the Drowned Eye's pool

His word, 13 Oct, 06:48, offered the Sunken Fen painted the same way, from the swamp's end of the
lines of magic, where the Drowned Eye waits: "Yep". With the hash `fen` the page paints it as one
screen of the game (`fenShot`, `paintFenVista()`, `fenWater()`):

    node tools/preview.mjs src/dev/preview_act1.ts shots/fen_world.png 1014 468 fen

No walls (his word of 18:56): dark water, mud islands with reeds and dead trees, boardwalks between,
mist low over everything. A sunken ruin, a ring of old paving round a deep pool; three of the
quarry's obelisks on it, their runes burning pink, cultists chanting at them; from each obelisk's tip
a line of magic arcs away over the water to the dome over the town, which glows on the far shore
under a murky sky (the far side opens as on the Ledge Road). Sent as previews/fen_in_game.png; asked
"Is this the Sunken Fen?", his pick: "More of the Eye", offered as: let more of the horror show under
the water: bigger, closer to surfacing. So the pool is bigger and the Eye risen close under its
surface (a pale veined eyeball, its iris burning gold, a slit of a pupil, the water rippling over
it), its arms coiling out under the water past the ruin, two of them curling up out of it with
ripples round them. Sent as previews/fen_eye_in_game.png; asked "Is this the Sunken Fen and the
Drowned Eye now?", his pick by 07:40: "Yes, this is it (Recommended)", offered as: the fen, the Eye
risen under its pool with its arms out, the obelisks and the town across the water go in the plan.
