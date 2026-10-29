# Floor 16, the Swan Gardens: its art (mock-ups; the art chat's branch `mockup/swan-gardens`)

The art chat's branch, from `origin/v23` at 457661b. Nothing here is in the game until the main chat puts it there. Nothing of the
game imports any of it.

The measure is his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat, 28 Oct
2026), level 16, THE SWAN GARDENS: "Through the shut gates and up the hill through the palace's terraced gardens."; its layout
"open, like the Millrace: terraces stepping up the hill joined by stairs, clipped hedges and a hedge maze, rose arbours, still
fountains, and a long lake with a pavilion on an island"; its hazards "nettle beds that sting and slow whoever walks through
them; the lake's deep water"; its enemies "the Hushed gardeners and grooms, the palace guard, and the swans"; its palette "Dawn
rose, swan white, deep hedge green"; its boss the Princess, on the Swan Pavilion. Its story from Andersen's "The Wild Swans"
(1838), drawn only from the book.

## His words, in order

- 28 Oct, to the art chat, asked where to start the High City: “Level 16 in full”.
- The first look, painted (`src/dev/garden_paint.ts`, `src/dev/preview_garden.ts`), asked "is this the place?": “Yes, go on
  (Recommended)”, offered as: next, make the ground and its pieces game-ready, then the swans as enemies.
- The ground and its 25 pieces, game-ready, built into a corner of the gardens (`src/dev/preview_swangardens.ts`): “Good, on
  to the swans (Recommended)”.
- The swans' brief (his art rulebook, "A new character", and sound rule 7), his answers: what they are, “Plain swans gone
  wild”; their size, “Knee-high, in flocks”; how they move, “Waddle and charge”; the one thing to know them by, “Wings raised
  in threat”; their attack, “Hissing lunge, a bite”; their death, “Bursts into feathers (Recommended)”; what they must never
  look like, “Not a goose or duck”; their sound, “Hiss and honk”. Read as: plain wild swans, the court's own, no crowns and
  nothing of the story (so the eleven on the lake lose their crowns too); knee-high, in flocks, fun to smash; on foot,
  waddling, charging heavily, the neck forward, the wings always arched over the back; small, so one attack.
- The swans' sheet and film, asked "are these your swans?": “Close, change something”; then, asked what: “The wings are weird
  looking, like they’re in two separate pieces?”. Read as: each wing looked broken into chunks (three lumps and a bar of
  flight feathers under them); so each wing is now one curved sail of feathers from its root on the body up over the back,
  its rows of feathers running unbroken along it, and the pair raised higher.
- The new wings (before and now, the sheet, the film), asked "are these your swans now?": “Yes, they're the swans
  (Recommended)”, offered as: next, the Hushed gardeners and grooms.
- The Hushed gardeners and grooms' brief, his answers: who, “A gardener and a groom (Recommended)”; size, “Knight's size, in
  crowds (Recommended)”; how they move, “Rush at you”; their attack, “Shears snap, fork jab (Recommended)”; what marks them,
  “Grey breath leaking out (Recommended)”; their death, “The Hush leaves them (Recommended)”; never, “Not undead or gory
  (Recommended)”; their sound, “Silent but their tools (Recommended)”. Read as: two kinds mixed in a crowd, a gardener in a
  leather apron with hedge shears and a stable groom in palace livery with a pitchfork; small, one attack each; they run
  at you rather than shuffle; the gardener snaps his shears shut on you, the groom jabs with his fork; grey breath as all
  the Hushed; the Hush leaves them and they slump down, people again; no voices, only their tools, their running feet and
  a gasp at the end.
- Their sheet and film, asked "are these your Hushed gardeners and grooms?": “Yes, they're right (Recommended)”, offered
  as: next, the palace guard.
- The palace guard's brief, his answers: who and what they carry, “1 and 2” (of “Royal guards, partisans (Recommended)”
  and “Royal guards, sword and shield”); size, “A head taller, fewer (Recommended)”; how they move, “March in step
  (Recommended)”; their two attacks, “Long thrust, wide sweep (Recommended)”; what marks them, “Grey breath through visors
  (Recommended)”; their death, “To one knee, then a crash (Recommended)”; never, “Not the city watch (Recommended)”;
  their sound, “Clank and stamp (Recommended)”. Read as (told him so): two kinds of royal guard mixed in a squad, one
  with a partisan and one with a sword and a tall crested shield; polished breastplates, tall plumed helmets, the royal
  colours, grander than the watch; a head taller, fewer, two attacks each (a quick long thrust; a wide sweep wound up
  high); marching stiffly in step; closed visors, grey breath from the slits, dull pink eyes behind; the Hush leaves them
  in a gasp, the weapon drops, to one knee, then a clatter; clanking armour and stamping boots, a ring of steel, no voices.
- The guard's sheet and film, asked "is this your palace guard?": “Kinda bland aren’t they?”. Asked what to add: “Bold
  tabard and crest (Recommended)” (offered as: a wine tabard over the breastplate with a big white swan crest on the
  chest, sleeves striped wine and white, and brighter polished steel), and “Also, what’s the thing that flips around like
  crazy on the death animation?”. Told him: the puffed breeches, which folded flat into a sheet and spun round the thigh
  as he went down on one knee (a drawing fault; the sleeves and thigh plates had the same weak spot). Done: the tabard,
  front and back, its edges piped white; the royal crest (an original white swan, wings raised) on its breast and back;
  sleeves and breeches striped wine and white; brighter steel, a fuller plume; and every round thing they wear built
  about its own limb so that it cannot fold flat (and a check for it).
- The new guard (before and now, and the film), asked "is this your palace guard?": “Yes, that's the guard
  (Recommended)”, offered as: that finishes the garden's enemies; next, the Princess, the boss of the Swan Pavilion.
- His question, 28 Oct, 20:01: “Are the enemies under the same rules for long wind ups and lightning hits?”. Told him:
  yes, his rule of 24 Oct (Movement 9, “All attacks, melee most (Recommended)”) covers them, but today's garden enemies
  have big held wind-ups and strikes of 3 to 5 frames (the boss review's jerk check, written before his rule, slowed
  them). Asked what to bring under it: “Start from now on, but every enemy is going to need that change eventually.
  And bigger AOE to compensate for the extra time the player gets to evade”. Read as: every new enemy and boss from the
  Princess on is made with a 1-2 frame strike; every older one needs it later; the area each attack hits is bigger (the
  main chat's), and the art drawn to match.
- THE PRINCESS's brief, his answers: her look, “The shirt is dumb, but I like the nettle, viney vibe from the gardeners,
  and maybe a spectral”, and at 20:29, “I was gonna say a spectral steed from the guys with pitchforks to kinda tie it
  all together.  Maybe one of her moves a spectral steed forms under her and she does like dressage jumps all over the
  arena that you have to dodge”; her size, “A head taller than the knight (Recommended)”; how she moves, “Glides without
  a sound (Recommended)”; her mark, “Swans circling her”; her basic attack, “Nettle vine lash (Recommended)”; in place of
  his doc's Shirt, “Vine snare (Recommended)”; her swans, “The garden's swans”; the steed, “It’s her ultimate ability so
  it can slot into whatever that might have been.  I want it to last a while and you have to really dodge around a bit
  to not get hit.”; her death, “Steed fades, vines wither (Recommended)”; never, “Not a child, not a corpse
  (Recommended)”; her sound, “Silent, but vines and hooves (Recommended)”. And at 20:34: “And remember this is a boss so
  follow the rules and run the checks”. Read as (told him so): a pale young woman a head taller than the knight, in a
  court gown gone grey, wound with the gardens' stinging nettle vines; alive, never a child or a corpse; gliding without a
  sound, the garden's wild swans always circling her; a nettle vine lash; a vine snare bursting from the floor round you;
  her ultimate, a spectral steed of the palace stables forming under her, long dressage leaps all over the arena; dying,
  the steed fading to mist, the vines withering, her swans flying off over the wall, she sinking to her knees; silent but
  for vines, wings, ghostly hooves and one whisper when she falls. No nettle shirt anywhere.
- Her first pictures, 28 Oct (by 21:10): her standing beside the knight, front and back, and at the game's size with her
  swans circling; and her on the steed mid-leap. Changed from the brief as read, and told him why: her gown a royal violet
  faded by the Hush, trimmed silver-white (grey, she was lost against her white swans and her pale steed); the steed
  rebuilt as a true horse (the first looked like a goat). Asked "is that the Princess?": “Yes, that's her
  (Recommended)”; "is that her spectral steed?": “Yes, that's the steed (Recommended)”.
- Her moves, the first film, asked "are those her moves?": “Close, change something”; what, his picks “The lash”,
  “Snare, Eleven or Vow”, “The steed's leaps”, and his words: “The size of these hits needs to be so much bigger.  Like
  imagine the size of the boss arena.  The swipe of the vine should cover a 90 degree swing and cover maybe 1/6 of the
  entire arena.  The swans should go the full length of the arena.  When I say the horse should run around the arena I
  meant do two full laps jumping maybe 15 times in 15 seconds.  It’s all too slow and too narrow and too small.  I could
  dodge anything you’ve put in these moves with my eyes closed”. Then at 22:23, of the lash's first reach (told him
  “almost two tiles”): “Two tiles long?  For the vine swing?  Triple that at least”; at 22:27: “Not faster for the wind
  up, like faster moving.  Her move speed is shit, the horse moved like what, 3 tiles?  That’s all I have to dodge?
  Everything is always so plodding when you first animate them.  I could tell you I want a cheetah boss and it would walk
  around like an old dog.”; and at 22:34: “There are big bosses that can be slow.  But like the prince with a rapier,
  dancing is going to need to be fast and constantly moving”. Read as (told him so): on the scale of a boss arena
  (about 17 by 20 tiles), the lash a quarter-turn sweep 7.5 tiles long (a sixth of the arena); eleven swans each the
  arena's whole length; the snare 5 tiles across, the Vow's ring 10 (his to change); the steed 15 leaps in 15 seconds,
  two laps, about 4.5 tiles a leap; the wind-ups kept big and held, but her glide four times as fast (4 tiles a second);
  and from now on bosses made fast and big from their first pass, a nimble one (the Prince) fast and never still.
  At 22:43: “Put in a rule, enemies and bosses movement style is a question asked during creation”: in his art rulebook
  (his doc at rev 87, and the project's copy), A new character's question 4 now asks it.
- The arena-sized film, asked "are those her moves now?": “Close, change something”; what, “The lash sweep”, “The steed's
  laps”, and: “The vine lash is weirdly connected to the ground.  Just have it be a long whip so it doesn’t ride along the
  ground.  I like the steed but we also want the steed to attack the player so have a few actually aim at the player.
  Or maybe all of them?”; asked how many, “Every other one”; then at 23:01: “How about the first half go around and the
  second half go for the player”. Read as (told him so): the lash a long whip flying through the air at knee to waist
  height, never on the floor; the steed's first 8 leaps one lap of the arena, its last 7 straight at you, each landing
  where you stood as it sprang.
- That film, asked how to decide: “The whip is better but still needs work.  The cage could have a HP bar and you can
  destroy it but it stays longer if you don’t destroy it.  The horse is perfect”; what of the whip, “Too stiff”, “Hard to
  see”. At 23:22: “Can you put some of these vines into the map as well?  Around where the hushed gardeners are at.  So
  you’re like “huh those vines are weird” then the boss has the big vine”; at 23:23: “Once we lock in the look.  So they
  match”. Read as (told him so): the whip ripples to a crack at its tip, writhes while held, thicker and a brighter
  green with pink-tipped thorns; the cage breakable in stages, lasting longer left alone; the horse as it is; and, once
  he says yes to the whip's look, a few of her vines as pieces of the gardens round the gardeners, one twitching back
  into a hedge as you pass.
- The next film, asked whether that was the whip and the cage: “Close, change something”; what, “The whip,I thought it
  was a long green snake.  Didn’t really read as vine”. Read as (told him so): a vine, not a snake: woody strands twisted
  round each other and knotted, big leaves in pairs all down it, curling tendrils, fewer and sharper thorns; held back it
  hangs and sways with its weight instead of slithering; the cage the same vine.

## The first look (src/dev/garden_paint.ts)

A painting of one corner of the gardens, the terraces true to their heights: three terraces up the hill to the upper right,
each faced in pale dressed stone with a balustrade and a stair up the middle between piers with urns; the hedge maze on the
top one; on the middle one a parterre (four beds of roses edged in box, the near right gone over to nettles), the still
fountain with its stone swan, rose arbours over the cross walk, yew cones; on the lowest the lake walk, a rose arbour, a bed
of nettles, the long lake at dawn with mist on it, the Swan Pavilion on its island, eleven swans with golden crowns (her
brothers, the book's). Dawn light from the upper left, long shadows.

## Its ground, game-ready (src/art/swangardens.ts; painted by src/art/terrain.ts)

- `swanGardensTerrain(floor, land)`: the ground for a floor, from what only the level knows (`SwanLand`, each optional):
  `lake(tx, ty)` (its tiles, not floor), `walk(x, y)` (gravel), `paved(x, y)` (flags: a terrace wall's row, a fountain's
  apron), `bed(x, y)` (bare earth), `nettles(x, y)` (how far into a bed of nettles; the painter rags its edge). The hedges
  throw their shadows across the floor away from the low sun. (`swanGardensLook(land)` is the look alone, without the
  shadows.)
- `paintSwanGardens(T, x0, y0, w, h)`: a piece of it as `paintTerrain` paints it, the lake's water painted into the drop:
  every pixel opaque, two pieces side by side one picture. (The game's hook is as floor 15's stacks: this in place of
  `paintTerrain` for floor 16.)
- THE FLOOR: clipped lawn mown in broad stripes; gravel; flags; earth; the nettles (dark, toothed, wine-stemmed, their
  stinging hairs pale); a kerb of stone along the lake, its lit lip over the water.
- ITS WALLS ARE YEW: every tile neither floor nor lake is clipped yew `HEDGE_H` (60) high, its faces close and dark, lit to
  the lower left; its top clipped flat; a tile and more back from the floor, the woods. Near hedges cut away as the game cuts
  them (his rule for every outdoor floor). A hedge maze is laid as tiles of it.
- THE LAKE is the ground's drop: the lawn ends at the kerb, its face standing out of the still water (`LAKE_DOWN`, 10, under
  the lawn); the water the dawn's one colour, faint stirs, lines of light, the kerb's likeness, wisps of mist.

## Its 25 pieces, game-ready (src/art/floor16.ts `swanGardensPieces()`, the Princess's)

His rule of 10 Oct, 14:54: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” These are
the Princess's; the High City's own 25 (the set for floors 16 to 20) are not made yet. Built in the Act 2 kit
(`src/art/act2_kit.ts`) as floors 11 to 15's are.

a terrace wall (along x or y), a stair's pier (along x or y), the terrace stair (along x or y; laid as what lies on the floor),
a yew cone, box edging (along x or y), a rose bush (breakable: whole, trampled), a bay tree in its tub, a topiary swan, the
still fountain (three tiles across), a stone swan on its plinth, a sundial, a stone bench (along x or y), an urn of roses
(breakable), a rose arbour (along x or y; whole, and half there while someone is under it), the Swan Pavilion on its island
(it stands in the lake; the island is its own; its likeness in the water before it), nettles (the trap: still, stirred),
trodden nettles, for their flax (on the floor), a nettle shirt, half woven (the quest; on the floor), a garden gate (shut and
open, across x or y), a lantern on a post, a boat at the landing, a swan's nest, a gardener's barrow (breakable), clippings and
shears (on the floor), swan feathers (on the floor).

WHAT GLOWS (Colour 3): only the lantern's candle (an honest flame, burning on into the dawn) and the quest's own pale light.

HOW THE TERRACES GO IN (the game walks on one level): a terrace's wall is a row of tiles that are floor, `a terrace wall` on
each, its face on the tile's near edge filling the row (32 high), its coping and balustrade over the row behind. The stair
is built true: laid with its feet on tiles (tx, R + 1) and (tx + 1, R + 1) of a wall's row R, it climbs one tile and a man's
waist, and on the picture its head lands one tile toward -x (a climb in this camera goes straight up the screen). So the
wall's row is open from tx - 1 to tx + 1, `a stair's pier` on (tx - 2, R) and (tx + 2, R), and the walk off it on (tx - 1,
R - 1) and (tx, R - 1). `src/dev/swan_lay.ts` lays it so; `src/dev/swan_level.ts` is a corner of the gardens laid by hand.

## The swans, floor 16's small mob (src/art/garden_swans.ts; behind `SWAN_ON`, off)

Built on the creature rig as the fog wolves are: its own pose and solids, painted from in front and from behind
(`makeSwanArt()` gives `{ front, back }`: idle, walk, attack, clips attack, die, reel). `SWAN_SIZE` 1.15 of its own measures;
on the floor about knee-high to the knight with its neck up.

- STANDING: its neck up in its S, its wings arched over its back; it breathes, its wings ruffle, it glances aside, now and
  then it hisses, the bill open.
- THE CHARGE (`SWAN_PACE` tiles a second): a heavy waddle, rocking foot to foot, its neck forward and its wings up; its
  feet carried back under it at its pace, so on the floor they grip.
- ITS BITE (`SWAN_BITE`): the warning (to `lunge`, 0.36 s) a crouch, the neck drawn back, the bill open, a hiss; the lunge,
  the neck thrown out and the bill shut at `hit` (0.5 s), its near foot stepping in; back on its stand by its end (1.05 s).
- STRUCK (`SWAN_REEL`): knocked back on its heels, its wings flung up, a few feathers torn off.
- ITS DEATH (`SWAN_DIE`): struck, then knocked over onto its side, the wing under it laid flat, its neck along the floor;
  its feathers burst from it and drift down to the floor.
- ITS WINGS: each one sail, laid as eleven slices side by side from the shoulder back to the tail, each from the wing's
  root on the body up to its arched top edge; its two rows of feathers' ends scalloped and unbroken along it; the inside,
  turned to the back, a step into shade.
- NO GLOW: white plumage greyed to the dawn, an orange bill with its black knob, black legs; the enemy's rim.

## The Hushed gardeners and grooms, a small mob (src/art/palace_hands.ts, palace_hands_moves.ts; behind `PALACE_HANDS_ON`, off)

Floor 11's Hushed (art/hushed.ts), whose body, skin and breath they share, built as floor 13's fieldhands are; held to every
check the bosses have (art/boss_checks.ts). `PALACE_GARDENER`, `PALACE_GROOM`; `makePalaceArt3(mob)` gives `{ front, back }`.

- THE GARDENER: a broad-brimmed felt hat, grey side-whiskers, shirtsleeves rolled, a waistcoat of hedge green, a long bib
  apron of leather, cord breeches, leather gaiters; HEDGE SHEARS in both fists (`shearsOf`: the pivot a handle's length
  from each fist, each blade on past it, so as the fists part the blades open and as they meet the blades snap shut).
- THE GROOM: the palace's livery, a short coat of faded madder with buff collar and cuffs and dull brass buttons, buff
  breeches, tall black boots with tan tops, his hair tied back in a queue; a PITCHFORK (`forkOf`, three tines).
- STANDING, at their work till they see you: the gardener snipping at a hedge that is not there; the groom leaning on his
  fork stood at his side. Both breathe and shift their weight; their mouths work.
- THE RUSH (`PH_PACE` 1.6 tiles a second, the city's Hushed shuffle 0.9): leaning into it, the shears held shut before
  him, the fork carried upright.
- THE SHEARS SNAP (`PH_BLOW`, its blow at 0.6 s): lifted before his face, raised high over his head and opened wide, the
  blades glinting pink, held shaking (the warning); hips first, a step in, driven down and out and snapped shut; carried
  through low; back to his work.
- THE FORK JAB (the same timing): brought down level in both hands and drawn back, the tines glinting pink, held shaking
  (the warning); hips first, a lunge, jabbed out its whole length; carried through; drawn back and stood again.
- STRUCK; and THE HUSH LEAVES THEM (`PH_DIES`): a gasp, the Hush pouring out in one great grey breath, the tool dropping
  clear of them, the knees giving, slumped forward on the floor.

## The palace guard, a medium mob (src/art/palace_guard.ts, palace_guard_moves.ts; behind `GUARD_ON`, off)

The city watch's body (a head taller than the knight), held to every check the bosses have, both blows. `GUARD_PARTISAN`,
`GUARD_SWORD`; `makeGuardArt3(mob)` gives `{ front, back }`; the second blow is `more.sweep`.

- THEIR LOOK: a doublet of the royal wine; puffed sleeves and breeches striped wine and white; a polished breastplate
  (back and breast) under A TABARD of the royal wine, front and back, its edges piped white, THE ROYAL CREST on its
  breast and its back (an original mark: a white swan, its wings raised, its neck in its S); pauldrons, a gorget, steel
  tassets; tall black boots; leather gloves; a closed helmet, its visor down, a dark
  slit across the eyes with the dull pink behind it, breaths pierced on the cheek, a tall white plume that flops over
  once they lie down. The Hush curls up out of the visor and seeps from the slit's ends, harder as they wind up a blow.
- THE PARTISAN (`PARTISAN`, `partisanOf`): an ash shaft, a broad leaf blade with two curled flukes, a wine-and-white
  tassel. THE SWORD AND SHIELD (`SWORD`, `swordOf`; `SHIELD`, `shieldOf`): an arming sword; a heater shield quartered wine
  and white, rimmed in steel, a boss at its middle.
- STANDING at attention; THE MARCH (`GD_PACE` 0.8, stiff and upright, the knees brought up, the boots stamped down).
- THE LONG THRUST (`GD_THRUST`, its blow at 0.67 s): brought down level and drawn back, the point glinting pink, held
  shaking; hips first, a lunge, thrust out; carried on; drawn back and stood again (the sword guard's past his shield's
  edge, the shield swung aside).
- THE WIDE SWEEP (`GD_SWEEP`, its blow at 0.8 s): heaved up high over the right shoulder, wound round, held shaking, the
  blade glinting pink; hips first, a step in, swept round low before them from their right to their left; carried on;
  brought back up (the partisan's as the city watch's halberd sweep; the sword guard's shield held out of its way).
- TO ONE KNEE, THEN A CRASH (`GD_DIES`): a gasp, the Hush pouring out of the slit; the weapon drops; the right foot steps
  back and that knee goes down, the left foot planted before him, held a moment, swaying; then the left leg folds under
  him and he crashes forward and lies still.

## The Princess, floor 16's boss (src/art/princess.ts, princess_moves.ts, princess_ride.ts, spectral_steed.ts, princess_fx.ts; behind `PRINCESS_ON`, off)

On the heroes' bones, a head taller than the knight. `PRINCESS`; `makePrincessArt3(mob)` gives `{ front, back }`; her
other moves are `more.snare`, `more.eleven`, `more.vow`, and her ultimate's three, `more.rideForm`, `more.rideLeap` and
`more.rideEnd`. Her review: `PR_SHAPE` (art/boss_checks.ts). Every blow of hers strikes as his Movement 9 asks (big
wind-up held, a strike of two frames smeared with its after-images, big wind-down): `PR_STRIKES` says where.

- HER LOOK (his yes): a pale young woman, long dark hair, the dull pink in her eyes; a court gown of royal violet faded
  by the Hush, its hem, cuffs and trim silver-white (the swans' colour), long hanging over-sleeves; the gardens' nettles
  wound round her (a nettle crown on a thin silver circlet, vines up her arms and her skirt, one knotted at her waist);
  a long nettle vine in her right hand, her lash. No nettle shirt anywhere. Her mark, the garden's swans circling her,
  is the game's to fly round her (art/garden_swans.ts `fly`).
- HOVERING (her stand, `PR_STAND_LONG` 2.8 s) and THE GLIDE (her walk, `PR_PACE` 4 tiles a second, 12 frames at 20): her
  feet never down; she darts about the arena leaning hard into her way, skimming the floor, her gown and vine streaming.
- THE NETTLE VINE LASH (her attack, `PR_LASH`, 1.6 s, the blow at 0.8 s), A WHIP'S SWEEP: she turns away to her right,
  her arm swung back low, and the vine grows out its whole length in the air to her right (`LASH_REACH`, 7.5 tiles),
  hanging and swaying with its weight, its thorns glinting pink, her left hand pointing (held 0.4 to 0.7 s): the warning shows where
  it will come from; hips first; the strike: in two frames the whip lashes a quarter turn round her front through the
  air at knee to waist height (`WHIP_H`), from 45 degrees to her right to 45 to her left (a sixth of a boss arena), the
  whole wedge it crosses smeared; it carries on a little while a ripple runs down it from her hand and ends in a crack of
  thorns and pink sparks at its tip; it recoils into her hand. It never touches the floor. HER WHIP'S LOOK (his “Too
  stiff”, “Hard to see”, then “I thought it was a long green snake.  Didn’t really read as vine”): a vine, thick: a dark
  olive-brown wood (`WOOD`) with a paler strand (`WOOD_PALE`) twisted round it so the twist shows, knotted every few
  lengths; big bright leaves (`LEAFY`) in pairs all down it, each pair turned from the last, hanging; curling tendrils on
  stalks; a few hooked pale thorns under it, some tipped pink; her snare's
  vines are the same, and the gardens' own will be, once he has said yes to it (his: “Once we lock in the look.  So they
  match”).
- THE VINE SNARE (`PR_SNARE`, the blow at 0.83 s): hands lifted high, held; slammed down (two frames). Where you stand
  (`snarePainted`, `SNARE_FX`, from her blow): the floor heaves, and a thicket of her whip's vines 5 tiles across bursts
  up round you in two frames, tall ones arching in from its edge and a tangle all through it. THE CAGE CAN BE BROKEN
  (his, by 23:22: “The cage could have a HP bar and you can destroy it but it stays longer if you don’t destroy it”;
  `SnareState`): struck, it shudders and sheds thorns and leaves; worn down, its vines snap one by one to stumps, the
  tall edge last; destroyed, it bursts apart, its vines snapped in three and flung out, gone in under a second. Left
  alone it holds 6 seconds, writhing, then withers and sinks. Its HP bar, and how many blows, are the game's.
- THE ELEVEN (`PR_ELEVEN`, the blow at 0.97 s): arms spread like wings, held; flung forward (two frames). Eleven lines
  across the whole arena, a tile and a half apart, are first marked by falling white feathers through her warning
  (`featherLine`), then a swan swoops along each, the length of the arena in under a second (art/garden_swans.ts `dive`),
  the feathers scattering behind it: you stand between the lines.
- THE VOW (`PR_VOW`, the blow at 1.0 s): a finger to her lips, a hand on her heart, her head bowed, held; then her arms
  thrown wide (two frames) and the ring of silence bursts out round her (`vowPainted`, `VOW_FX`: 10 tiles across, out in
  two frames, held 3 s, its edge breathing grey, the floor inside it dimmed; drawn to the size the game gives it).
- HER STEED (her ultimate): THE STEED FORMS (`rideForm`, 1.4 s): she spreads her arms (the warning), the grey breath
  gathers on the floor, and a horse of it surges up out of the floor beneath her and lifts her, side-saddle. A LEAP
  (`rideLeap`, one second, `RIDE_LEAP`; fifteen of them, two laps of the arena): it gathers onto its haunches, forelegs
  folded (held 0.17 to 0.27 s); springs; at the top of the leap its hind legs kick out, she whirling her vine; it comes
  down in a flash onto its forehooves (two frames, smeared, the blow at 0.87 s), the fog bursting out over the floor
  round them; it settles square, ready for the next. THE GAME CARRIES HER while it is in the air (`RIDE_LEAP.air`, 0.36
  to 0.87 s), about 4.5 tiles a leap (`RIDE_LEAP.carry`); where it lands the blow falls. HIS PATTERN (the game's to
  play): the first 8 leaps one lap of the arena, the last 7 each at you, landing where you stood as it sprang (so you
  have its half second in the air to get out). THE STEED FADES (`rideEnd`,
  1.4 s): it sinks back into the floor, thinning to nothing, and sets her down.
- STRUCK (`PR_REEL` 0.4 s): jolted back, arms flung out, head thrown back.
- HER DEATH (his pick, “Steed fades, vines wither (Recommended)”; “Not a child, not a corpse (Recommended)”; `PR_DIES`,
  3.2 s): she clutches her breast and the Hush leaves her in a grey breath; she drops her vine and sinks out of the air
  to her knees while every nettle on her browns and falls; she sits back on her heels, head bowed, the pink gone from
  her eyes: alive, freed, still. (If she dies on her steed, the game plays `rideEnd` first: the steed fades.)
- Her picture (`PR_CANVAS`) is 570 by 510, for the sweep's whole reach; the game cuts each frame to what is in it.

For the main chat: her blows' areas are bigger than the old enemies' (his “And bigger AOE to compensate for the extra
time the player gets to evade”); the art is drawn to that (the lash's long line, the snare's cage round you, the Vow's
ring as big as the game makes it, the steed's landing).

## The dev pages

- `src/dev/preview_garden.ts` (the painting): `overview`, `phone`, `close:X:Y`.
- `src/dev/preview_swangardens.ts` (built from the game-ready ground and pieces, the knight on the lake walk; the swans the
  painting's, not yet enemies): `overview`, `phone`, `tiles`, `close:X:Y`.
- `src/dev/preview_floor16.ts` (the pieces): `all`, `range=A-B@K`, `look=<name>@K`, `show`.
- `src/dev/preview_palace_hands.ts` (the gardeners and grooms): `sheet` (both, from in front and behind beside the knight,
  three times as big; a crowd at the game's size), `big:<gardener|groom>:<move>:<t>`.
- `src/dev/preview_palace_guard.ts` (the palace guard): `sheet`, `big:<partisan|sword>:<move>:<t>`.
- `src/dev/preview_princess.ts` (the Princess): `sheet` (front and back beside the knight, three times as big; at the
  game's size with her swans circling), `ride:<rideForm|rideLeap|rideEnd>:<t>` (on her steed), `grid:<move>:<t>,<t>,...`
  (a move at several moments, both ways round), `big:<move>:<t>`.
- `src/dev/preview_swans.ts` (the swans): `sheet` (from in front and behind beside the knight, three times as big; a flock at
  the game's size), `big:<move>:<t>`, `strip:<move>:<view>:<n>`.

## The checks

- `tests/swangardens.test.ts` (7): nothing of the game imports it; walkable tiles floor, the lake's the drop, every other
  yew; pieces side by side one picture; every pixel opaque; no cyan, no pink, every colour under the dullest word's; green
  the most of what is walked on, the dawn's lavender in the lake; the yew's shadow falls away from the sun; the nettles show,
  the kerb's stone.
- `tests/floor16.test.ts` (8): nothing of the game imports them; 25, each its own name; pictures as many as each says; only
  the lantern and the quest give light; crisp; no cyan, no pink, under the dullest word's; each stands on its foot; nothing
  cut off; a terrace wall's face fills its row.
- `tests/garden_swans.test.ts` (13): nothing of the game imports it, its switch off; crisp, the enemy's rim; no cyan, no
  pink, no light, nothing cut off; its size; FLOOR (nothing under it in any frame); FEET GRIP; nothing THROUGH its body;
  JERK and JUMP; ALIVE; its bite; its death; its pictures.
- `tests/palace_hands.test.ts` (9): nothing of the game imports them, their switch off; every move of both through every
  boss check, from in front and behind, and every handover; no cyan, the pink edge while they live; nothing cut off;
  nothing in the floor; the Hush leaking and leaving; the pink eyes; the tool lying clear; the rush, the shears' warning
  and snap, the fork's warning and jab.
- `tests/palace_guard.test.ts` (10): as the gardeners' and grooms', both blows; and his picks: the thrust's reach, the
  sweep crossing from their right to their left, the march, to one knee (the right knee down, the left up), then down;
  and nothing they wear folds flat (his “thing that flips around like crazy”).
- `tests/princess.test.ts` (10): nothing of the game imports her, her switch off; every move through every boss check,
  from in front and behind, and every handover (her steed's three moves into each other); HIS LIGHTNING STRIKES (each
  blow two frames, landing on the second, smeared then and only then); no cyan, the pink edge while she lives; nothing cut
  off; nothing of her in the floor; his brief (no shirt, she glides, pink eyes, withered, on her knees and not lying);
  her steed (forms and fades, she sits its back, off the floor while carried, square once it lands); what her casting
  leaves (the snare and the ring out in two frames, nothing cyan); his sizes and speeds (the quarter-turn sweep 7 tiles
  and more out, the glide 4 tiles a second, a leap a second carrying her 4.5 tiles, the snare 5 tiles across, the ring 10).
- `src/art/boss_checks.ts` knows his Movement 9 now, for a boss that says where it strikes (`strikes`, `smeared`): the
  strike one or two frames, far faster than its wind-up and wind-down, smeared, and not held to JERK. Every boss
  reviewed before is reviewed as before.
