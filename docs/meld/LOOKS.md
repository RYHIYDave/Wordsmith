# Wordmelding's looks: the ten melded words at work, behind MELD3 (off)

The planning chat's branch `meld/looks`, from `meld/words` (at c1cd6e5). NOTHING OF IT IS SWITCHED
ON: `MELD3.on` (src/render/melds3.ts) is false, and with it off the game draws exactly as before.
It does not go to the main chat until he has seen the pictures and said yes.

## What he said

- 16 Oct 2026, 14:21 (in the planning chat): “I need designs and animations for all the new melded
  damage words”. Read as (told him so): all ten (Eruption, Avalanche, Thunder, Blight, Scald,
  Wildfire, Fumes, Hailstorm, Frostbite, Contagion), each its own rune stone and colour in place of
  the placeholders of `meld/words`, and its look at work, in front (the hit and its twist) and behind
  (what it leaves and its twist), big and wild by his art rulebook; filmed in the game, on one page,
  before anything goes anywhere; the art chat told, so that the two chats do not both draw them.
- The art chat was told on the Chat Board (16 Oct, 14:31). Runedust and the Meldstone lying on the
  floor stay the art chat's.
- Shown the review page (the ten rune stones and colours, and a film of each word in front and then
  behind) and asked as a pop-up “Are the ten melded words right as shown, their rune stones, colours
  and looks?”, by 16:29: “Yes, send to main (Recommended)”, offered as: the main chat puts them in
  the game behind their switch; they stay off until he says.

## What is in it

- THE SWITCH: `MELD3` in src/render/melds3.ts. Every call into it from the renderer, the effects
  and main.ts is behind it; the events' new `meld` tags change nothing with it off.
- COLOURS (`MELD_RAMP`): six tones a word, darkest to white-hot; the fourth is the word's colour,
  the fifth its glow. Each looks like the two words in it and is told apart from every other word,
  the friend's cyan and the enemy's pink and gold: the nearest any of the ten comes to another
  colour, as the eye sees colour (CIEDE2000), is 11.7; Swift and Poison, the nearest two of today's
  words, are 10.5. The nearest to the enemy's gold is Wildfire (13.8).
- RUNES (`MELD_GLYPH`, `MELD_GLYPH_IS`): 7 by 7, cut in the stone as the other words are, with the
  two words' colours along the stone's foot as on `meld/words`:
  Eruption a mountain blowing its top; Avalanche a mountainside shedding its snow; Thunder a storm
  cloud and its one great bolt; Blight a dead tree standing in rot; Scald steam rising off
  scalding water; Wildfire a flame with lightning at its heart; Fumes fumes billowing up off a fire;
  Hailstorm a storm cloud and its hail; Frostbite jaws of ice and a drop of venom; Contagion the
  sick, each passing it on. `useMeldArt` (src/art/icons.ts) puts them in place of the placeholders;
  only a page that throws the switch calls it.
- THE LOOKS, called up by what the rules say happened (src/game/game.ts tags its events with the
  melded word: 'burst', 'arc', 'zone' and 'stun' carry `meld`, and a new 'meldFx' event says when
  Avalanche shoves or crushes). A melded word's look stands in for its two words' looks on what it
  hits (`meldLookWords`): an Eruption hit is a volcano's, not Power's and Flame's side by side.
  - ERUPTION. In front: a volcano's blow (the game holds, white-hot light, molten rock flung high and
    cooling to black, stone thrown, smoke standing up; an area blow bursts in jets of lava all round
    its ring) and the pool of lava it leaves (crust plates drifting on it, glowing seams, bubbles
    bursting). Behind: an ember circling the hero's feet for each heat; at full heat they blaze, and
    the next hit ERUPTS: the ground splits in glowing fissures, a column of lava blasts up, lava
    bombs fly and come down burning, the screen kicks.
  - AVALANCHE. In front: a slab of snow and ice smashing down, snow blown out along the blow, blocks
    of ice tumbling; the one it shoves slides back; one stopped short freezes. Behind: snowdrift
    ground (mounds, blocks of ice, powder); a hit on the chilled crushes, ice bursting off it.
  - THUNDER. In front: one great bolt out of the sky, white at its heart, forking; the ground blasted
    into a burnt star; what it stuns crackles violet over its head. Behind: balls of violet
    lightning gather round the hero's chest, one a hit, crackling one short of the clap; every 4th
    hit a THUNDERCLAP, bolts down all round him; a thunderhead hangs where it strikes.
  - BLIGHT. In front: rot thrown down hard; while its poison works, dark veins climb what it struck,
    worse as its life runs out. Behind: a low cloud of rot, spores drifting down; what it poisons is
    branded on the floor under it.
  - SCALD. In front: fire and ice twisting round each other; a burning or chilled one CRACKS (its
    ice bursts, jets of steam, scalding drops). Behind: scalding steam boiling up off the ground;
    the hero standing in it is seen faint through it.
  - WILDFIRE. In front: burning lightning leaping from what it hits to the rest, setting them alight.
    Behind: burning ground crackling with lightning, throwing sparks of fire at what comes near.
  - FUMES. In front: sour smoke off what it hits; a burning, poisoned one gives off a toxic cloud.
    Behind: smouldering ground, and a cloud that EXPLODES in a fireball when fire walks into it.
  - HAILSTORM. In front: ice-white lightning and hail; the frozen pass it on. Behind: a slate-blue
    storm cloud driving hail down, striking and slowing.
  - FROSTBITE. In front: jaws of ice close on what it hits and bite, and keep biting while it is
    chilled. Behind: ice with venom frozen in it, under a cold, sick mist.
  - CONTAGION. In front: sick green lightning; everything it strikes is poisoned. Behind: a green
    storm, and a cloud with lightning crawling through it.
- ONE RULES FIX, found while filming (src/game/game.ts, `addGround`, `addCloud`): a patch laid again
  where one already was is refreshed rather than doubled, and until now it kept what it was. Now a
  melded word behind laying it again makes it that word's patch: a Fumes cloud laid over a plain
  poison cloud goes up in fire as his rule says. Only with a melded word behind, so only with MELD
  on. Its look follows the same way (`meldPatch`, the look only). tests/melds.test.ts holds it.
- HIS RULEBOOK, checked look by look: as big and wild as it will go (Animations 1); the hero and
  every warning in sight (Animations 4: every cloud and the steam thin round the hero; Eruption's
  jets never rise on him); every word its look, in front and behind (Animations 7); crisp pixels;
  nothing glows cyan or pink.

## Tested

- tools/scenarios/meld_looks.mjs: each word in the practice room, in front and then behind, with the
  switch thrown for its page only (`__dbg.melds3.switch`, `__dbg.melds3.paint`). STILLS=1 takes a
  few pictures at the game's speed; without it, a film, a picture each thirtieth of a second of the
  game's own clock (the game stands still while each picture is taken):
  `node tools/build_to.mjs dist/meld_looks.html`, then
  `WORD=eruption node tools/playtest.mjs --file dist/meld_looks.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/meld_looks.mjs --out shots/ml/eruption/eruption`
- tools/meld_films.py makes the films for his phone (MP4, cut round the hero, the word's name and
  what it does over them); tools/meld_runes.py the sheet of rune stones. Kept out of the
  repository, as all pictures are.
