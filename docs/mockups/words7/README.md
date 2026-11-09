# The seven new words' looks: the stills (step 1) and the film of them at work (step 2, made right in 2b)

A mock-up on `art/words7` (from `origin/work-f4` at 68cb71c2, the live game, 25.2.13), behind `WORDS7_LOOK` in
`src/render/words7.ts`, **off**. With it off nothing of it is drawn, lit or ticked, and the game is as it was (a test).
Their rules are the main chat's (its branch `words7`); this is only how each one looks.

## His words

From the main chat's board post of 8 Nov 2026, 07:55: “I want 6 more words for the last levels”, “At least 6”, “Add
mirroring as well”; and of the new words, “And those all craftable as well”. Read as: seven new words, found from floor 16
down, each with a rune stone, a colour and a look for each of its three sides (in front, behind, on a monster).

Shown `words7_looks.png` and asked “Are the seven new words' looks right (words7_looks.png)?”, by 07:20 on 9 Nov: “Yes,
animate them (Recommended)” (offered as: next, a film of all seven at work, then hand them to the main chat).

## The picture

`pictures/words7_looks.png` (1200 by 4706): a row for each word: its rune stone (big, and at the game's size), its name in
its colour, its six tones; then a still of each of its three sides in the practice room, at the game's size (a game pixel two
of the sheet's, as on his other sheets) and again at twice. Stills only: the films are the next step, of the same drawings.

## The seven

Each colour is its word's own (`W7_RAMP`, six tones darkest to white-hot; index 3 its colour, 4 its glow). As the eye sees
colour (CIEDE2000, Binding's check), each is at least 12 from every other word, every meld (their art and their stand-ins),
Binding, the friend's cyan, the enemy's pink and gold, and one another. The space is crowded (the reds, blues, golds and
silvers are taken), so Bleeding is a deep red, Surging a deep storm blue, Plundering an old dark brass, Culling a grey dusk
violet with a bone glow. Nearest to each: Piercing 13.2 (Mirroring), Bleeding 13.0 (Powderkeg), Reaping 15.3 (Rupture's
stand-in), Culling 12.6 (Demolition), Surging 12.9 (Shatter), Plundering 12.6 (Heavy), Mirroring 13.2 (Piercing).
Plundering is kept clear of the enemy's gold: its colour 28.1 from it, its glow 12.8, its white-hot 16.2.

| Word | Colour | Rune (7 by 7) | In front | Behind | On a monster (the enemy's pink and gold) |
|---|---|---|---|---|---|
| **Piercing** (Dex) | polished steel `#b4b4ae`, white light | a needle through a ring | a bolt of white light, tapered, its head blazing, its edges flickering, its trail fading, punching through every one in a line; at each, light blows out of the far side in a burst of rays, sparks flung on | half a second after, a spear of light slams down out of the air at a slant onto the line, and its point is driven along it (0.16 s), tearing a narrow crack of light in the floor, stone chips and dust flung up where it goes; the crack left glowing, fading | its shot, a bolt of pink fire, comes through the wall: the stone lit pink where it passes, rings of light running out over it, cracks of light in it; inside the stone only a ghost of the bolt |
| **Bleeding** (Str) | deep arterial red `#800818` | a drop split by a cut | the wound, its lips lit; a spurt of drops flung the way the blow went; drips; splashes left on the floor where it walks, older ones darker | dark red briars burst up out of the torn floor, arching over, thorned, their points pale; half stand in front of what walks in them; it is cut, drops flicked off | its blow cuts him: a crescent of pink fire burning to gold across him, dark blood glinting pink flung off him and dripping at his feet |
| **Reaping** (Int) | grave moss `#6c8a78`, pale soul-light | a sickle | the kill's soul torn out of it (grave-mist rising off the body) flies to him: a flame of soul-light with two hollow eyes, its tail streaming back, motes shed | the kill rises as a pale see-through copy of itself (its own picture remade in soul-light, its legs trailing into mist), **its edge his cyan**, striking for him; a thread of mist back to the body | dead, it lurches up out of its fall (its own death played backwards), the enemy's fire licking up round it, pink mist, sparks of pink and gold |
| **Culling** (Str) | dusk violet `#787890`, bone | an executioner's axe over a line | a great crescent slash of bone light swept through its middle; it is split along the cut, its top sliding off, the cut lit bone; splinters of bone-light flung | the reaper's mark, written on the floor: a ring of bone light, an inscription round it; in it a hooded cowl (its face a deep hollow under a lit brim, folds falling to a ragged hem) and the great curved blade of a scythe over it, its edge bone, its haft beside it; the weak one crossing it is taken by a blade rising out of it | while he is low its blows flare: the enemy's fire licking up round it, its eyes flaring, its blow a heavy smear of fire bursting on him |
| **Surging** (Int) | storm blue `#2a4a9a`, white | three arcs rising | a ring of force bursting out round him: its front a broken edge of white-blue light, dust rolling behind it, grit flung ahead, crackles of the storm along it, rays at his feet | the same burst where his dodge left the floor, streaks of wind along his roll, dust kicked to either side | a pink ring burned on the floor where its wave will reach, barbed inward, beating faster, the floor in it smouldering; then its shockwave in pink and gold |
| **Plundering** (Dex) | old coin `#907806`, rubbed brass | a coin in a grasping hand | coins spray from the kill, spinning up and falling, some lying on the floor; an extra piece thrown with them (a ring with a red stone); glints | gold bursts from the kill and streams to his purse, each coin on its own arc with a streak of brass, glinting as it goes in | its blow snatches his coins: each torn off him on a hook of pink light and pulled to it; they glint pink and gold at its belt (dropped when it dies) |
| **Mirroring** (Int) | silver glass `#b4d2c6`, a mirror's green edge | two facing halves | his reflection in glass, a long step off beside him, makes the same swing (his own picture remade in glass, a sheen across it), **its edge his cyan**; its arc of glass | a standing pane of mirror where he stood (arched top, bevelled edge glinting cyan, a heap of its own glass at its foot); in it his reflection makes his next attack again; (then it cracks and shatters, in the code, for the film) | struck, it cracks like a mirror where he hit it, and shards of pink-edged glass fly back into him |

What fights for him shows it by his cyan (the spirit's edge, the reflection's edge, the pane's edge). Every monster's side
is in the enemy's pink and gold; the coins Plundering snatches are his own brass, on pink hooks.

## The moments in the stills, and their numbers

Each is held at a moment of its own clock (`Act.t`, seconds); everything is a drawing of that clock, so the films will
be the same drawings run on.

- Piercing in front: the bolt 26 tiles a second, at 0.15 s (through three, 1.15, 2.5, 3.9 tiles out). Behind: the spear
  waits 0.5 s (the rules'), comes down in 0.06 s, its point driven along the line in 0.16 s; still at 0.66 s, the point
  six tenths along a line 3.8 tiles long. On a monster: its bolt 11 tiles a second, 1.1 tiles out of the wall.
- Bleeding in front: 0.32 s after the blow. Behind: the briars burst up over 0.22 s; still at 0.9 s, a patch 1.35 tiles
  round. On a monster: 0.12 s after its blow.
- Reaping in front: the soul's flight 0.55 s, still at 0.3 s. Behind: the spirit's 6 s (the rules'), still 0.04 s into its
  blow. On a monster: rising over 0.8 s, still at 0.62 s.
- Culling in front: the slash sweeps through in 0.06 s (two pictures at 30 a second), still at 0.09 s. Behind: a mark 1.2
  tiles round, still 0.1 s after it takes. On a monster: 0.1 s into its blow, the hero at 12% of his life.
- Surging in front: a ring 2.2 tiles round, run out in 0.42 s, still at 0.17 s. Behind: 1.5 tiles round, still at 0.15 s.
  On a monster: its warning 1.0 s, then a wave 2.3 tiles round, still 0.15 s into the wave.
- Plundering: in front, still at 0.3 s (16 coins); behind, at 0.3 s (12 coins, the stream 0.45 s); on a monster, at
  0.24 s (8 coins).
- Mirroring: in front and behind 0.06 to 0.07 s into the swing; on a monster, the shards' flight 0.28 s, still at 0.17 s.

## Step 2: at work, and the film

`pictures/words7_film.mp4` (66.3 s, 1266 by 540, 30 a second, H.264 yuv420p, 7.7 MB; made again in step 2b): in the practice room with the Warrior, as the player sees it,
each word in turn: a card with its stone and colours; in front, behind and on a monster at full speed (the whole screen);
then its best moment again at twice the size and half speed. Captioned. Every look moves at 30 pictures a second, each with
its beats (`W7_BEATS`, seconds):

| Look | Build | Hit | Fade | What happens |
|---|---|---|---|---|
| Piercing in front | 0.03 | 0.2 | 0.35 | the bolt kindles at his hand; flies the line at 26 tiles a second, light blowing out of each it goes through; at the line's end (or on a wall or a pillar in its way, never through it) its head bursts into motes and its trail runs in after it to a point; the motes wink out |
| Piercing behind | 0.5 | 0.22 | 1.9 | light seeping along a crack that breaks jagged along the floor's stones, forking, quickening, the spear gathering high over it (the rules' `delay`); it slams down (0.06) and tears along the crack (0.16); pulled up, it goes as one spear of light, rising and dimming; the crack glows, cools to dark stone, gone |
| Piercing on a monster | 0.1 | 0.15 | 0.45 | the stone lit pink where its shot comes through, rings of light running out over it |
| Bleeding in front | 0.05 | 0.5 | 0.15 | the wound opens; the spurt; then drips while it bleeds, a splash where it walks (one every fifth of a tile walking, one every 0.8 s standing), each drying in 3 s |
| Bleeding behind | 0.22 | (while it lies) | 0.5 | the briars burst up; stand swaying, cutting what walks in them; sink back |
| Bleeding on a monster | 0.05 | 0.3 | 0.3 | the slash across him, his blood flung off; then drips and splashes while he bleeds |
| Reaping in front | 0.15 | 0.55 | 0.25 | the soul torn out of the body; it streaks to him; a flare as he takes it in |
| Reaping behind | 0.45 | (its 6 s) | 0.6 | the spirit rises out of the body in a stream of soul-light, hovering; fights, its edge his cyan; rises away; each blow 0.05 / 0.06 / 0.24 |
| Reaping on a monster | 0.2 | 0.8 | 0.4 | the enemy's fire kindles round the body; it lurches up out of its fall; the fire dies |
| Culling in front | 0.16 (held) | 0.07 | 0.3 | his blow lands; an instant held, the one it takes stopped, a violet glint on it; the scythe's crescent sweeps through it in two pictures, smeared, dusk violet and bone; it is cut in two, its halves sliding apart as it falls (and it lies so); the crescent sweeps on, dimming and thinning away |
| Culling behind | 0.3 | (while it lies) | 0.3 | the mark written in, breathing, gone over its last 0.3 s; taking one: it flares 0.05, a blade rises through it 0.2, it burns out 0.4 |
| Culling on a monster | 0.3 | 0.05 | 0.3 | while he is low (under 35% of his life) it kindles with the enemy's fire; its blow bursts on him; the fire dies when he is not low |
| Surging in front, behind | 0.05 | 0.42 | 0.13 | a flash at his feet; the ring runs out, the dust shoved before it (behind: where his dodge began, wind along his roll to its end, 0.55) |
| Surging on a monster | 1.0 (held) | 0.42 | 0.13 | its warning ring, beating faster (the game's own, or ours: `surgeWarn`); then its wave |
| Plundering in front | 0.05 | 0.5 | 2.0 | a burst of glints; coins spray, the extra piece thrown higher; they lie and fade |
| Plundering behind | 0.1 | 0.89 | 0.12 | gold bursts from the kill; coin after coin arcs into his purse, a glint as each goes in |
| Plundering on a monster | 0.04 | 0.58 | 0.15 | his coins torn off on pink hooks; at its belt till it dies; then they burst out of it (0.05 / 0.5 / 1.5) |
| Mirroring in front | 0.08 | 0.3 | 0.25 | his reflection forms beside him (2.4 tiles off, on the side of him ahead on the screen), facing as he faces; as he swings it swings, its cut in glass the same shape as his (0.24), landing on those in front of it in little bursts of glass; it dissolves |
| Mirroring behind | 0.25 | (while it stands) | 0.2 | once he has stepped off where he stood (and is clear of it on the screen), the pane grows up out of its glass there, and sinks over its last 0.2 s; when he attacks next: 0.05 / 0.33 / 0.9, it makes his attack again, his cut in glass the same shape as his (0.24), landing; it cracks (0.3), shatters (0.6) |
| Mirroring on a monster | 0.12 (held) | 0.38 | 0.1 | it cracks like a mirror where he hit it, held a beat after his blow; then it bursts, and shards of pink glass fly back into him on a high arc, each a little after the last |

## For the main chat: the events and fields it reads

All of it only while `WORDS7_LOOK.on` (off). main.ts calls `eventsW7(g.events, g, fx)` (beside Binding's); render.ts calls
`tickW7`, `floorW7`, `airW7`, `lightsW7`, `lookW7` (a monster's picture: a spirit, one cut down, a flash), `fallenW7` (one
culled falls split), `heroW7` (his reflection), and leaves the three zones to it (`ownsZoneW7`). Drawn to the names of the
main chat's board post of 8 Nov 07:55 (its branch `words7` was not to be seen): every field is read gently, with a fallback.

| Event | Fields read (fallback) | Look |
|---|---|---|
| `pierceLine` | `from`, `to` (`{x, y}` or `[x, y]`; or `x, y, x1, y1`; to: 6 tiles the way he faces); `ids` (optional: those it went through; else every monster within 0.7 tiles of the line); the line stops at stone: **level.open** (a wall) and **level.props** that are `solid` (a pillar, within 0.42 of its middle) | Piercing in front |
| `lance` | `from`, `to`, `width` (tiles, 1), `delay` (s, 0.5) | Piercing behind, from the event on (it waits the delay itself) |
| (none) | the game's own hostile shots: each one going into or out of a wall (`level.open`) | Piercing on a monster |
| `bleedOn` | `id` | the wound and spurt; **Monster.bleedT** (> 0 while it bleeds): drips and splashes |
| zone `thorns` | `x, y, r, t, dur` (kind or `look` 'thorns') | Bleeding behind; what walks in it is cut |
| `heroBleed` | `id` (the monster) or `x, y` (where it stood) | the slash on him; **Hero.heroBleedT** (> 0): drips and splashes |
| `reapSoul` | `x, y` (the kill) | Reaping in front |
| `spirit` | `id` (the spirit, a monster drawn by the game), `x, y` (the body it rose from), `secs` (6) | Reaping behind; any monster carrying `spirit: true` is drawn as a spirit too |
| `spiritHit` | `target` (the struck monster's id) or `x, y` | its blow |
| `rise` | `x, y` (or `id`): the body there (fx.fallen) lurches up | Reaping on a monster |
| `culled` | `id`, `x, y` (where it was: by then it is gone from the list); `mark` (`{x, y}`, or true: the nearest zone 'reaper'); its body in **fx.fallen** near `x, y` is held still an instant, then falls split, and lies split | Culling in front, or the mark taking it |
| zone `reaper` | `x, y, r, t, dur` | the mark as it lies |
| (none) | **Monster.words** including 'culling', while his life is under 35% | its fire |
| `surge` | `x, y` (him), `r` (2.2); `dodge` with `x0, y0` (else his roll's start), its wind to his roll's end (**Hero.move** `x1, y1`; none when he has not moved); `id` (a monster's: its wave, `r` 2.3) | Surging, each side |
| `goldBurst` | `x, y` | Plundering behind |
| `goldStolen` | `id` | the snatch; **Monster.stolen** (> 0): his coins at its belt; when it dies (or is gone from the list) still carrying them, they burst out of it where it was |
| `reflection` | `secs` (0.63) | Mirroring in front (the reflection copies his own picture as he attacks) |
| `swing` (the game's own) | `x, y, dx, dy, reach` of his blow (not one marked `hostile`) | his reflection's cut and the mirror's repeat: as he swings, the same way, as far |
| zone `mirror` | `x, y, t, dur`; **Hero.x, y**: it rises once he is off it and clear of it | the pane as it stands |
| `mirrorCast` | `x, y` (or the nearest zone 'mirror') | the repeat, the cracking and the shattering |
| `mirrorBack` | `id` | Mirroring on a monster |

WHAT THE MAIN CHAT MUST ADD, or say otherwise:
1. **`goldSpray { x, y, item }`** for Plundering in front (its post names no event for it): the spray, the extra piece when `item`.
2. **Spirits drawn as monsters**: put each in the game's monster list (or draw it with the monster loop) carrying `spirit: true`,
   or send `spirit` with its `id`; the look paints its own picture in soul-light with his cyan edge, hovering.
3. **`rise` as the body begins to rise** (0.2 s of fire, then 0.8 s lurching up out of its fall), the risen monster standing
   1.0 s after it.
4. **`cullBlow { id }`** (optional) when a monster with Culling strikes him while he is low: its blow's burst. Its fire burns
   from its `words` and his life, under 35% (`W7_TIME.low`: the rules' number to say).
5. **`surgeWarn { id, secs, r }`** (optional): our pink ring; or keep the game's usual warning ring and send only `surge`.
6. A **Hushed** one culled: the split may be too much for his rule (never gory); the main chat may leave `culled` out of the
   split for them (the scythe's blade still shows).
7. **`culled` with the `x, y` of the one taken** (it is gone from the monster list when the event is read), sent as it dies.
8. The mirror's pane is drawn over the figures (with the other looks, after the dark, so it glows): it waits to rise till he
   is clear of it, but if he (or a monster) walks in front of a standing pane later, the pane is drawn over him. The main
   chat may want it stood among the figures by its depth instead.
9. **`lance` from a step in front of him** (the film's starts 1.5 tiles out): its spear comes down at a slant from over the
   line's start, so a line starting at his feet would bring it down across him.

## How it was made and checked

- `tools/scenarios/words7_looks.mjs`: the practice room, each side staged with its monsters, the world stopped and the
  look's clock set to its moment, a picture of the game's own screen (844 by 360 at three to a pixel: four screen pixels a
  game pixel). `tools/words7_sheet.py` makes the sheet from them.
- `tests/words7.test.ts` (7): the switch off and every hook behind it, nothing else of the game importing it; with it off
  nothing drawn, lit, changed or ticked; the colours (six tones each, each word at least 12 from all the rest, Plundering
  clear of the gold, nothing glowing cyan or pink); the runes (7 by 7, each its own); every side of every word drawing at
  its moment, every pixel on a whole pixel; every monster's side in the enemy's colours, the spirit and the reflection
  showing his cyan; its times; forgotten on a new level.
- Step 2: `tools/scenarios/words7_film.mjs` plays each side by the events above in the practice room (the Warrior), a picture
  every thirtieth of a second of the game's clock (a sixtieth for the close ones), the whole screen at two screen pixels a
  game pixel; `tools/words7_film.py` makes the film. `tests/words7_beats.test.ts` (5): each event's look drawn through its
  beats and gone, every pixel, when its time is up; what the rules keep drawn while kept and gone after; nothing with the
  switch off; nothing cyan on a monster's side, its pink there; each look's beats written down.
- Step 2b (a close look at the film found what follows; made right before he sees it): the bolt never a flat end, never
  through a wall or a pillar; the lance's crack a real one; the spear going up whole; the cull's own blade after a held
  instant; no tick left by the dodge's surge; the reflection beside him, its cut landing in front of it; the mirror rising
  only once he is off it, its repeat a cut of glass; the shards a beat after his blow; and the film's monsters spaced so
  nothing stands in anything (they stand at least 1.6 across from him: his swing steps him a third of a tile on).
  `tests/words7_fixes.test.ts` (7) holds each of these a test can; the film's scenario checks every picture for a monster
  standing in him, in his reflection, in the mirror or in a pillar, and for him in the mirror or a pillar (`crowd`), and for
  the pictures in the film reported none. The Warrior blinking out on alternate
  pictures as he dodges is the game's own roll (render.ts: a hero with no tumble of his own is drawn every other picture),
  left as it is.
- Not run: the regression; a real phone; the looks with real rules.
