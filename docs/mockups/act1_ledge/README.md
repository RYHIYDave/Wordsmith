# Floor 7, the Ledge Road

The art chat for floors 6 to 10 (13 Oct 2026), on the branch `mockup/act1-ledge` (from `mockup/act1-cult`,
ad3a389: floor 6 and the cult's two new kinds, each with his yes). NOTHING OF THE GAME IMPORTS ANY OF THIS.
Pictures to him first; the main chat puts it in.

## His Ledge Road

What began it, 13 Oct, by 19:26, asked “Are the Chanter's and the Firepot thrower's moves right?”: “Yes, send
them to main (Recommended)”, offered as: both go to the main chat; then floor 7, the Ledge Road, its ground and
sky first.

The first try followed the planning chat's mock-up with his yes of 12 Oct (the mountain's slope in front, cut
away; no wall behind the road, the sky past its far edge: his word then, “the rear wall is gone and that where
you see the sky”). Shown it (`first`, `bend` below) and asked “Is this the Ledge Road's ground and sky?”, he
answered:

- “My vision was it looks like your on a cliff side trail with cliff on top and bottom.  When you make a
  northwest turn, the sky would open up, it’s like your going around the mountain.  If that makes sense.”
  Read as, and told him so: along the trail the mountain rises in a cliff above it and falls away in a cliff
  below it; where the trail turns northwest (up-left on the screen) going round the mountain, the sky opens up.
- Shown that and asked “Is this the cliff-side trail you pictured?”: “Uh kind of but I’d like the road to
  kinda wrap around the mountain not just float off into space”. Read as: the trail stays against the
  mountain the whole way round the turn, the wall beside it.
- Shown that and asked “Is this the Ledge Road now, the trail wrapping round the mountain?”: “Not quite”;
  asked what should change: “Mountain looks like a mountain” (offered as: rocky slopes rising up to snowy
  heights above the wall, not a flat grassy top) and “The mountain side goes all the way to the ground you
  would never see the ground under the cliff.  Only off the side of cliff as you round the mountain.”
- Then, 20:59: “Or we can just have the trail sort of work out one direction primarily, then have the boss
  area be on some peak where we can see the city.  I’ll wait for the new drawing and we can figure it out”.
- Shown the new drawing (`shot` below), by 21:03: “You got it that’s perfect”; and asked “Which way should the
  Ledge Road go?”: “Mostly one way, views at turns (Recommended)”, offered as: the trail runs mostly one way,
  cliff above and below as drawn; a few turns round the mountain open a view like this one; the boss's peak
  looks out over the city.

This changes the look of the Ledge Road in his design doc (planning's “The look”): the planning chat is told.

## Its ground and sky

- THE GROUND, painted by the game-ready painter of the Quarry (src/art/terrain.ts) from the level's own tiles,
  in the Ledge Road's look (src/art/ledge.ts, `ledgeLook(drop)`): the trail of packed earth and gravel, slabs of
  the mountain's grey-violet rock breaking through, grass creeping in at its edges. ABOVE IT the mountain's wall
  (the rock tiles' faces, `rise` 110 picture pixels), natural rock in uneven strata with ledges and fissures,
  never on a grid; over the wall the mountainside climbing away (`mountainside`): broken rock at the brow, rock
  ribs and gullies streaking down, alpine grass and a few firs low down, snow lying higher up and more of it.
  BELOW IT the drop: the cliff's face hangs under the trail all the way down (`HANG_TALL` 600, more than a
  screen), turned to the light as its edge is, so no ground shows under it; off the side of the cliff, where
  the trail rounds the mountain, nothing is painted and the sky shows.
- WHAT THE PAINTER GAINED (src/art/terrain.ts), each only for a look that asks for it, so the Quarry paints
  exactly as before (checked pixel for pixel, and tests/terrain.test.ts):
  - `drop`: which tiles past the floor fall away (here the level's pit tiles, and past the floor's edge what
    the level says). Not floor and nearer a drop tile than a rock tile, the ground is the drop; a tile's middle
    is always what the tile is. There nothing is painted (clear pixels, `TK.Drop`). A near cliff across the floor
    is cut away over the drop too.
  - `hang`: the cliff's face under an edge that looks toward the eye over the drop (`TK.Hang`), as far down as
    `tall` (its foot wanders), turned to the light as its edge is (`hangShade`).
  - `lip`: the floor's edge over the drop catches the light.
  - `climb`: how far back from the floor the top climbs (a true distance from the floor, `climbAt`), given to
    `top` so a mountain's slopes can rise to snow.
  - `turnOver`: how far round a face's foot its turn to the light is judged (0.6 tiles here), so a ragged edge
    does not stripe the wall.
  - `clearOfFloor` also refuses a thing on a top over the drop.
- THE SKY (`paintSky(x0, y0, w, h)`), a picture of its own that comes round every `SKY_WRAP` (2048) picture
  pixels across, its y measured from its horizon: open sky in bands, high clouds flat underneath; the far snowy
  ranges on the horizon, lit on their left flanks, a nearer range; the land far below in the haze, its fields
  crowding toward the horizon, woods, a river; banks of clouds below the ledge. Its palette a step duller than
  any word's colour (its deepest blue saturation 0.48; the dullest word, leech, 0.50); nothing cyan or pink.
- FOR THE MAIN CHAT: lay the sky behind the ground and slide it slower than the ground (the page here slides it
  at half speed across, its horizon 232 picture pixels down the screen); paint it once for the level (all of
  it round, 2048 x 468: 415 and 418 ms in two runs here, a phone slower: in the painter's worker); the ground in
  pieces as the Quarry's (here the field 36 to 61 ms; a piece of 256 x 256, 76 to 211 ms: the cliff under the
  trail makes a piece dearer than the Quarry's). How the Ledge Road is laid (mostly one way, a few turns round
  the mountain, the boss's peak) is yours; his words above.
- The firs and boulders are the set's (art/floor6.ts), set low on the mountainside as the Quarry's tops are.

      node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_trail.png 1014 468 shot
      node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_trail_tiles.png 1014 468 tiles
      node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_trail_kinds.png 1014 468 kinds
      node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_close.png 1014 936 close
      node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_sky.png 1024 400 sky
      node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_cost.png 600 200 cost
      (the first try, as shown him: first, bend)

`tests/ledge.test.ts` (14): every tile's middle what the tile is; nothing over the floor; his trail, the wall
over it and the cliff under it all the way down, the view open off the side of the cliff past the turn; the
mountain's snow higher up and none at the brow; the first try's case (the drop past the far edge clear,
nothing of a near cliff over it); crisp, clear only over the drop; the hanging face only under an edge over the
drop, within its height; the lip lit; nothing on a top over the drop; pieces seamless; no cyan or pink, duller
than every word, ground and sky; the sky opaque, the same every time, seamless where it comes round and between
pieces; the sky's parts; light from the upper left.

## Its 25 pieces (src/art/floor7.ts, `ledgePieces()`)

Themed after the floor's boss, the Carrion Queen, and the cliff trail (his rule for a set of floors from the
second on: 25 for the set's theme, 25 for each boss). Nothing of them glows; nothing pink or red: what the flock
has picked is bone and dry hide, never raw.
- THE TRAIL: the rope rail along the drop (`railPost`, and `railSpan(dx, dy)` the rope between any two posts the
  game lays, about a tile apart), a post broken and leaning out, its ropes dangling; planks over a cleft (a floor
  tile, along x or y); cracks across the trail (a floor tile); a rockfall; a cairn.
- THE CARRION: a pack mule picked clean; bones and feathers (two); a vulture's nest; the great egg (a quest
  piece, no quest yet); a dead vulture; a perching rock where the flock sits, whitened (tall: see it through).
- THE CULT'S: its perch where its vultures are chained (tall), its feather standard (tall), its supply cart gone
  over, its cage for the flock broken open; THE GATE, its barricade across the trail (along x or y; closed and
  dragged open).
- ON THE WALL: iron rings and chains; a nest on a ledge; icicles under a lip.
- WHAT BREAKS: a water jar; a basket of the flock's feathers (each whole and broken).
- THE TRAP, the crumbling ledge (a floor tile laid over the trail): 0 hairline cracks; 1 its warning, the cracks
  opening round the place, grit trickling; 2 giving, the rock inside sinking; 3 gone, a ragged hole into the drop.
- THE HEIGHTS: snow drifts (two).

Shown the first 16 and asked “Are these the Ledge Road's first pieces?”: “Change some”; asked which: “The steps I
think can go.  It’ll probably just confuse the player that they can’t go up them” (steps cut in the wall,
dropped). Shown all 25 and asked “Are these the Ledge Road's 25 pieces?”: “Yes, on to the Queen (Recommended)”.

    node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_dressed.png 1014 468 dressed
    node tools/preview.mjs src/dev/preview_ledge.ts shots/ledge_pieces.png 1014 2210 pieces

`tests/floor7.test.ts` (6): nothing of the game imports them; their pictures, names, no light; crisp, no loose
pixels (the rail's spans too); no cyan, no pink or red, duller than every word; what stands on its foot, a floor
tile or the trap inside its diamond, a span from post head to post head; 25 of them, the steps gone.

## The Carrion Queen, floor 7's boss (src/art/carrion_queen.ts, behind `CARRION_QUEEN_ON`, off)

The planning chat's, with his yes (12 Oct, 18:07): a huge cult-bound vulture nesting on an outcrop over the
drop; the ledge crumbles section by section as the fight goes on; a talon rake (basic), a wing gust that shoves
you toward the edge, a dive along a marked line, a call that brings her flock. His brief, asked as his art
rulebook's questions (13 Oct, asked after 22:25): how big, “Wings wider than the trail (Recommended)”, offered as: huge:
perched, about the Unfinished's height; wings spread, wider than the trail is across; menacing. The one thing to
know her by, “Bone crown and cult chains (Recommended)”, offered as: a ruff of pale bone-white feathers like a
crown, a broken cult shackle and chain on one leg, the cult's mark burning pink on her breast. How she moves,
“Hunched hops, a blur in the air (Recommended)”, offered as: heavy and lurching on the ground, hopping and
dragging her wings; then terrifyingly fast once she takes off. How she dies: “All these are great.  I think I
want to see them all” (offered: she topples backwards off her eyrie into the drop, feathers bursting and
swirling up after her; the crumbling eyrie breaks under her and she falls with it; the cult's mark flares and
she comes apart in a storm of black feathers): all three to be drawn, for him to pick. Her sound, “A shrieking
screech, beating wings (Recommended)”, offered as: a harsh, rasping screech when she calls or dives; the heavy
whump of her wings; the chain on her leg clinking. What she must never look like, “Not like a phoenix or
eagle”, offered as: no proud, noble bird look: ugly, a carrion eater.

STANDING (the first look): a Mob on the heroes' bones (her wings his arms, her feathers hung from them as panels;
her legs his, the thighs in feathered trousers, the shanks bare and scaled, great taloned toes), about the
Unfinished's height (`CQ_TALL` 264), MANTLED: hunched, her wings held half open and drooping round her like a
ragged cloak; her small feathers scalloped in rows, matte; her crown of bone-white spikes round the root of her
bare grey neck, her head carried low and forward of it (`headOf`), her hooked beak, her eyes the cult's fire; the
cult's mark burning on her upper breast; the cult's shackle on her left leg, its chain broken and dragging. Her
breath (2.6 s): her bulk heaves and her weight goes over, her wings lift a little, her head jerks round to look
and holds. Canvas 820 x 600. Through the boss review (her stand).

    node tools/preview.mjs src/dev/preview_carrion_queen.ts shots/cq_look.png 1014 1000 look

Asked “Is this the Carrion Queen?”: “Yes, animate her (Recommended)”, offered as: next her hopping walk, the
talon rake and her flinch as films; then her three big moves, and all three deaths for him to pick.

HER HOP (`cqWalk`, 1 s a round, 16 frames): settled on both feet, carried back under her as she goes; she crouches
and her wings open and rise; she springs, both feet tucked and swung through under her, her wings held up; she
lands heavy on both and sinks. Her pace 0.8 tiles a second, carried over the floor as the game carries a boss. It
stops only at her stand. Film: `preview_carrion_queen.ts` hash `walkfilm`, 4 frames a second
(`node tools/page_gif.mjs src/dev/preview_carrion_queen.ts "walkfilm" shots/cq_walk.gif 4`).

HER TALON RAKE (`cqRake`, 1.7 s, the blow lands at 28/30 s, the warning from 0.56 s): a leap, not a stab. She
crouches, springs off both feet, hangs in the air with her wings high and wide and both feet thrust out before
her, talons spread (the warning, trembling); her body pitches forward, her wings beat down, and both feet rake
down and back through whoever is before her; she comes down heavy where she stood, hunched over what she struck,
and draws back into her mantle. (The first try, one foot raised, lost its talons under her bulk.) Her flinch
(`cqReel`, 0.4 s): her head snaps back, her wings jerk up, she is knocked back on her feet and hunches again.
Film: hash `rakefilm`, 30 frames a second (`shots/cq_rake.gif`). Both through the boss review
(`tests/carrion_queen_shape.ts`, `MADE`: stand, walk, attack, reel).

Asked “Are her hop and talon rake right?”: “Yes, on to her big moves (Recommended)”, offered as: her hop and rake
stay; next her wing gust, her dive and her call.

HER BIG MOVES (her three, as her own moves: `more.gust`, `more.dive`, `more.call`), drawn after his yes to the hop and
the rake, for him to see before anything is set in the game:
- HER WING GUST (`cqGust`, 1.5 s, the blow at 0.8 s, held from 0.3 s and trembling from 0.4 s): she puffs up on her feet and
  throws her wings wide and high; then beats them down and forward, hard, shoving the air before her; her wings
  sweep through and up, and she settles back into her mantle. The hips go first, then the chest, then the wings.
  Film: hash `gustfilm` (`shots/cq_gustfilm.gif`).
- HER DIVE (`cqDive`, 1.9 s, the strike at 1.25 s, hanging and trembling from 0.6 s): she springs off both feet and
  climbs; hangs at the top, feet tucked; folds her wings back and drops head first out along the marked line, talons
  thrust out before her, and strikes at the floor at the line's far end; pulls up out of it and climbs back to her
  perch (the body comes back where it began: a swoop, not a walk). Film: hash `divefilm` (`shots/cq_divefilm.gif`).
  The line is the game's floor marking; her travel along it is the game's to carry.
- HER CALL (`cqCall`, 1.6 s): she rears up tall, her head thrown back, her wings flung up and beating twice in the air;
  then folds them down. Film: hash `callfilm` (`shots/cq_callfilm.gif`). Her flock is theirs, not drawn here.

All three through the boss review (tests/carrion_queen_shape.ts: MADE is stand, walk, attack, reel, gust, dive,
call, dying) and every frame held to the crisp, the pink edge and the canvas (tests/carrion_queen.test.ts).
Asked “Are her three big moves right?” (cq_gustfilm.gif, cq_divefilm.gif, cq_callfilm.gif): “Yes, on to her deaths
(Recommended)”, offered as: the gust, dive and call stay; next her three deaths for him to pick.

HER THREE DEATHS (`CQ_DEATHS`: three variants of her, each with its own dying move, 2 s; one picked later into
`dying`). Shown in films for his pick. Each through the boss review (the floor rule set aside for the two falls
over the edge: her body is in the drop there, and the review has no drop) and every frame crisp, nothing cyan,
nothing cut off. As the game paints every monster's death, without the pink edge.
- A. TOPPLES OFF THE EDGE (`cqDieEdge`): struck, she staggers back, her feet losing their grip; she topples backward,
  wings flung out, off the edge of the eyrie into the drop. Film: hash `edgefilm` (`shots/cq_edgefilm.gif`).
- B. GOES DOWN WITH THE LEDGE (`cqDieLedge`): the eyrie's rock gives way under her; one foot lifts off the rock as it
  sinks, she lurches and rocks, and goes down with it. Film: hash `ledgefilm` (`shots/cq_ledgefilm.gif`).
- C. BURSTS INTO FEATHERS (`cqDieFeathers`): struck, she shudders; from 0.6 s a storm of her feathers flies out of her
  breast, turning, slowing, and lies on the floor where it lands (`cqBurst`, solids only in her death); she sinks to
  her knees, her wings collapsing round her. Film: hash `featherfilm` (`shots/cq_featherfilm.gif`).

HIS PICK OF HER DEATH (14 Oct), asked with the three films (cq_edgefilm.gif, cq_ledgefilm.gif,
cq_featherfilm.gif): “Topples off the edge (Recommended)”, offered as: she staggers back and goes off the edge of the
eyrie into the drop (the first of the three, as the most plainly a fall); the other two (goes down with the ledge;
bursts into feathers) stay as variants (CQ_DEATHS) for the record. CARRION_QUEEN's `dying` is now the edge death
(2 s). Her sound brief for it is for the sound chat (the board, 14 Oct). Its timings for her gust, dive and call went
to the sound chat too (the board, 14 Oct).

`tests/carrion_queen.test.ts` (8): the switch off, nothing imports her; crisp, her pink edge; nothing cyan, every
light the cult's fire, nothing cut off; her size (about the Unfinished's); her crown pale, the mark burning;
the boss review of what of her moves, and every frame of her stand, hop, rake and flinch held to the crisp, the pink
edge and the canvas. `tests/new_mobs3.test.ts` knows her among the mock-ups.

## The vultures (floor 7's small mobs): his brief, complete (14 Oct)

The Ledge Road's vultures (the plan's table: “Vultures (small)”): the flock that circles over the drop, and that the
cult chains on its perch. Asked as his art rulebook's questions for a new character, each his pick, the labels
exactly as he tapped them:
- HOW BIG: “About your height (Recommended)”, asked as “The floor 7 vulture: how big? (They circle over the drop,
  and the cult chains some on its perch.)”.
- THE ONE THING TO KNOW IT BY: “Bald head, hooked beak (Recommended)”.
- HOW IT MOVES: “Circling, then a sudden dive (Recommended)”.
- WHAT IT CARRIES, AND HOW IT ATTACKS, asked “The floor 7 vulture: what does it carry, and how does it attack?”:
  “A broken cult chain on one leg”, whose own words also say its attack is still the dive. Not the recommended pick;
  his pick stands. Small monsters have one attack (his rules of 9 Oct, in the gameplay rulebook): the dive.
- HOW IT DIES, asked “The floor 7 vulture: how does it die?”: “Knocked from the air, lands on its back (Recommended)”.
- WHAT IT MUST NEVER LOOK LIKE, asked “The floor 7 vulture: what must it never look like?”: “Not a cute or heroic
  bird (Recommended)”.
- ITS SOUND (sound rule 7), asked “The floor 7 vulture: what does it sound like?”: “A harsh shriek on the dive”, whose
  own words also say it is quiet while it circles and its wings flap. Not the recommended pick; his pick stands.

Read as, not asked: it is the cult's flock, so an enemy: pink (its eyes and its edge), nothing cyan.

NEXT: the vultures' standing sheet, front and back, beside a hero for size, for him to see first; then its walk, its
attack and its death as films; then his yes. After that the cliff crawlers' brief; then her eyrie peak with the city
view (the reveal); then floors 8 to 10.
