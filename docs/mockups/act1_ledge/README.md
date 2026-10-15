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

## The Carrion Queen, floor 7's boss (src/art/carrion_queen.ts, behind `CARRION_QUEEN_ON`, off; her look and moves SUPERSEDED by "The Carrion Queen, redone" at the end of this file)

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

## The vulture's standing sheet (14 Oct; HIS YES, 10:34: "Yes"; behind `VULTURE_ON`, off)

Drawn as the brief asks (src/art/ledge_vultures.ts, `VULTURE`), on the heroes' bones at the knight's height, hunched: a
bird on a man's bones, its wings folded down its back like a ragged mantle; its bald head grey-tan (never pink), its
hooked beak dull horn; a dark ruff round the foot of its bare, wrinkled neck; its legs bare and scaled under feather
trousers, the great toes and the talons; the cult's shackle on its left leg, and the broken iron chain dragging out to
the side (in sight from in front and from behind); its eyes the enemy's pink, its edge the enemy's pink; nothing cyan.

Its pictures, for him: `shots/vulture_look.png` (beside the knight at the game's size; the close-ups from in front and
from behind, three times the top row's size) and `shots/vulture_head.png` (the head from in front and from behind,
eight times; the feet from in front, six times). Both come from src/dev/preview_vulture.ts (the hashes `look` and `head`).

Changed while drawing it, for the record: the ruff darkened (pale, it read as a crown and hid the bald head); the chain
set to drag out to its side (behind the leg it was hidden from in front); the eyes moved out to the head's sides (the
brow and the beak hid them). From in front one eye shows past the beak; the other is on the far side of the turned head.

Checks: tests/ledge_vultures.test.ts 6 of 6 (the switch off and nothing of the game imports it; crisp in every frame of
its stand, walk, attack, reel and dying, in both views; nothing cyan, every light the enemy's, nothing cut off at its
canvas's edge; two pink eye lights; about the knight's height standing; the bald head pale and the iron chain in sight
from both views). tests/new_mobs3.test.ts 8 of 8, its list of mock-ups now naming the vultures. tsc clean. NOT RUN: the
full unit suite and the full regression; a real phone.

Its walk is the next section.

## The vulture's walk and dive (14 Oct; his yes to both; behind `VULTURE_ON`, off)

**What he has said.** His yes to the standing sheet: "Yes" (10:34). His yes to the walk as first shown (the film of 10:48): "Yes" (11:41), read as yes to that walk.

**That walk was shown to him before it was checked against the art rulebook.** The rulebook asks for that check first (Animations 1: "Every animation is checked against this rule before you see it"). The check ran on 14 Oct, after his yes. It failed the walk in four places (the table below), so the walk has been revised. The revised walk and the dive are new pictures: his yes is asked again for both.

**The check, rule by rule** (docs/art/RULEBOOK.md; "as shown" means the pictures in this section):

| Rule | What the vulture does now | Result |
| --- | --- | --- |
| The numbers: monsters walk 16 | Walk at 16 frames a second, was 8: FAILED before, fixed (test) | Pass |
| The numbers: attacks and moves 30 | Dive at 30 frames a second, a key each frame (test) | Pass |
| Animations 1: as big, wild, kinetic and weighty as possible | Walk: wing stroke 0.95 of an arm's length each way (was 0.6), elbows fold on the way up and straighten on the way down, body heaves 8 picture pixels (was 5), pitch and roll swing, head dips with the beat. Dive: a stoop head first, its body pitched 130 degrees at the strike, wings up high then swept back, a wide pull-out. FAILED before (too calm), now bigger; whether it is "a notch too high" is his to judge | Pass by the numbers; his eye decides the notch |
| Animations 2: the Wave is the measure | Judged by eye on the films | Judged, not measured |
| Animations 3: wild in its own way | A flier; the dive is its own | Judged |
| Animations 4: the warning stays in sight | Nothing is drawn over the vulture, and its warning hold is clear | Pass |
| Animations 5: power you can see | Its eyes flare from pink toward gold through the warning and the stoop (the glow up to 2.5 times as strong) | Pass |
| Animations 6 to 8 | Nothing of it was animated before; no words and no effects on it | Not applicable |
| Movement 1: weight first | The stoop and strike are the blow: the body turns (its pitch), carries through into the pull-out, and the pull-out is slow to start | Pass by eye |
| Movement 3: every attack winds up and follows through | Warning from 0.25 s; the follow-through runs to 1.20 s (test) | Pass |
| Movement 4: loose things follow | Its chain and its tail stream back from the history of its foot and its pelvis, in flight. FAILED before (both static), now they trail | Pass by eye (no test) |
| Movement 5: slick | Walk and dive at their frame rates, no jerks between frames | Pass (tests) |
| Movement 6: alive when still | The standing picture is unchanged to the byte (checksum 1f9ac615...) | Pass |
| Movement 7: a heavy blow lands with a freeze | The strike is held for a tenth of a second, 0.70 s to 0.80 s (test). Counted as a heavy blow: the whole dive goes into the talons | Pass; his eye decides whether the dive counts as heavy |
| Movement 8: feet grip the floor | Its feet never land: in the air all the round, the lowest foot point 10.5 picture pixels above the floor at the strike (test) | Pass: a flier is the exception, by his yes ("Yes, add it (Recommended)"); Movement 8 now says so |
| Monsters 1: true to what it is | It flaps and circles, as his sound pick has it ("its wings flapping") | Pass (his pick) |
| Monsters 4: the warning is a pose | The hold at the top, 0.25 s to 0.50 s, wings up and trembling, body rearing back (test) | Pass |
| Monsters 6: pink is theirs | Pink eyes and pink edge; nothing cyan (tests) | Pass |
| Monsters 8: built on bones | On the heroes' bones | Pass |
| Pixels 1 and 2: crisp, 2D that looks solid | Every frame of the walk, the dive and the strike: crisp (test) | Pass |
| How art is approved 1: pictures first | Walk and dive behind `VULTURE_ON` (off) | Pass |
| How art is approved 6: checked at phone size | shots/vulture_phone.png, 844 by 390, the game's size: looked at | Pass (looked at; not on a real phone) |

**The walk, revised** (src/art/ledge_vultures.ts, `VULTURE_WALK`, `vultureWalkPose`): sixteen frames at sixteen a second; one round a second, one wing beat a round. Downstroke from the top (0.00 s) to the bottom (0.50 s), upstroke back to the top (1.00 s). Its hands sweep 35 to 61 picture pixels above the floor; its feet never come lower than 18.6. Its body heaves 8 picture pixels and pitches 5 degrees; it banks 13 degrees across the round. The chain and the tail follow the flight: each link and feather is where the foot or the pelvis was a little earlier (`trailOfFlight`, the mob's trail), so they stream back as it turns. Sound: the stroke still splits at 0.50 s, so the sound timings sent to the sound chat stand.

**The dive, new** (`VULTURE_DIVE`, `vultureDivePose`, `vultureDive`): 1.20 s, 36 frames at 30 a second. Starts on the walk's first pose. Climbs and rears back (0.00 to 0.25 s); holds at the top, wings up and trembling, the eyes burning (THE WARNING, from 0.25 s, held to 0.50 s); stoops head first (0.50 to 0.70 s), its body pitched 130 degrees at the strike (the head down), its wings swept back, its talons out before it; STRIKES at 0.70 s and is held for a tenth of a second (0.70 to 0.80 s, the same picture each frame); pulls out heavily (0.80 to 1.00 s), wings snapped wide, the tail trailing; comes back to the walk's first pose by 1.20 s, so the walk takes it up with no jump. The talons' lowest point is 10.5 picture pixels above the floor: the blow lands on its target's body, the feet never touch the floor.

**Its sound** (sound rule 7; the timings are the sound chat's to set): the walk's as before (a whoosh on the downstroke, 0.00 to 0.50 s; a soft thump at 0.50 s; a lighter swish on the upstroke, 0.50 to 1.00 s). The dive: the warning from 0.25 s, the stoop from 0.50 s, THE STRIKE at 0.70 s, held to 0.80 s, the pull-out 0.80 to 1.00 s, back to the walk by 1.20 s.

**Pictures, for him:** `shots/vulture_walk.gif` (sixteen frames a second, three seconds, from in front and from behind); `shots/vulture_dive.gif` (thirty a second, from in front and from behind); `shots/vulture_phone.png` (844 by 390, the game's size: the knight, the vulture circling, the vulture at its strike). From src/dev/preview_vulture.ts: the hashes `walkfilm`, `divefilm` and `phone:0.4`.

**Checks:** tests/ledge_vultures.test.ts 16 of 16 (the eight new are the rulebook checks: sixteen frames a second; thirty a second with a key each frame; the strike held a tenth of a second; the warning held and trembling; the stoop past upright at the strike; the wings swept back from the warning to the strike; the feet off the floor through the dive; the dive ends on the walk's first pose). tests/new_mobs3.test.ts 8 of 8. tsc clean. The standing picture unchanged (checksum 1f9ac615...). NOT RUN: the full unit suite, the full regression, a real phone.

**Not yet:** its flinch and its death are in the section below; his yes to both is recorded there.

**His answers, to the pop-up sent with the pictures:** the revised walk, "Yes, the walk as shown (Recommended)"; the dive, "Yes, the dive as shown (Recommended)"; a flier as an exception to "Feet grip the floor", "Yes, add it (Recommended)", now in Movement 8 of docs/art/RULEBOOK.md (the copy in this repo; his living doc not yet edited by this chat). His "Yes" at 11:41 was to the walk as first shown, before the rulebook check.

**Next:** his answers to the flinch and the death (the section below). Then the cliff crawlers' brief; then her eyrie peak with the city view; then floors 8 to 10.

## The vulture's flinch and death (14 Oct; his yes to both, as shown; behind `VULTURE_ON`, off)

**What it does.** Struck in the air, it holds for a tenth of a second (the blow's freeze), then is knocked back: its head snaps up, its wings fling out wider than on its walk, its feet kick up, its eyes flash gold and fade by 0.40 s; it is back on its circling by then, from its walk's first pose, with no jump. Six of its feathers and five drops of its blood come off at the blow and are gone by 0.50 s. Its death: the same freeze and knock; then it is thrown back and over, its wings spread and its feet kicked up; it falls backward and is on its back by 0.62 s; it rebounds a little, comes down flat, and is still from 0.733 s. Its feet stay in the air the whole time (it is a flier: they never land, Movement 8). Its eyes go out from 0.46 s and are dark by 0.72 s. A dead vulture has no pink edge: the rulebook's edge is for living monsters.

**The check, rule by rule** (docs/art/RULEBOOK.md; "as shown" means the films below):

| Rule | What it does now | Result |
| --- | --- | --- |
| The numbers: attacks and moves 30 | Flinch and death at 30 frames a second, a key on every frame (tests) | Pass |
| The numbers, and Monsters 6: the enemy's edge is for living monsters | Pink edge and pink eyes while it lives; the dying vulture drops its edge, as the game holds a dying monster (test) | Pass |
| Monsters 1: true to what it is | A bird knocked out of the air: wings spread, feet up, then over onto its back | Pass by eye |
| Hits 1: a splash, then gone | Five drops of its blood come off at the blow and are gone by 0.50 s (no stain drawn: the rule says "may") | Pass |
| Hits 3: every hit shows | Flashes gold at the blow, freezes, is knocked back and up (tests) | Pass |
| Hits 4: what flies off is the monster's | Six of its own feathers and its blood, not a weapon's | Pass |
| Hits 5: deaths are true to what died; small things die quick | Dies in 1.0 s, falling backward onto its back | Pass |
| Movement 1: weight first | The blow turns the body and carries through into the fall; the landing gives, then settles | Pass by eye |
| Movement 4: loose things follow | Its chain and tail stream during the flight and the fall; they stop as it lies, so nothing moves after 0.73 s (test) | Pass |
| Movement 5: slick | Thirty a second, a key on every frame, no jumps (tests) | Pass |
| Movement 7: a heavy blow lands with a freeze | Everything holds for 0.10 s from the blow (tests) | Pass |
| Movement 8: feet grip the floor (the flier's exception) | Its feet are in the air through the flinch and the death: never lower than 7.1 picture pixels above the floor from 0.67 s (test) | Pass: a flier is the exception, his yes (14 Oct) |
| Animations 1: as far as it will go | Head snaps up 40 degrees; the walk's pitch of 26.5 degrees snaps back 34 degrees; wings flung wider; a fall over backward to -90 degrees; a landing that rebounds a little (the numbers in the section below) | Pass by the numbers; his eye decides the notch |
| Animations 4: the warning and the hero stay in sight | The blood and feathers are small, for half a second, and cover nothing of the knight | Pass |
| Animations 5: power you can see | Its eyes flash gold at the blow and fade; they go out when it dies (tests) | Pass |
| How art is approved 1: pictures first | Behind `VULTURE_ON` (off) | Pass |
| How art is approved 6: checked at phone size | shots/vulture_phonedown.png, 844 by 390 (the game's size): the knight, the vulture struck, the vulture dead on its back | Pass (looked at; not on a real phone) |
| How art is approved 7: the boss review | A boss rule; the vulture is a small monster. Its tests cover the same points: feet, sinking, loose things, colours, crisp pixels | Not applicable |
| Movement 3 and 6; Animations 2, 3, 6 to 8 | Its flinch and death are not attacks, and a dead thing does not breathe; its standing picture is unchanged (checksum 1f9ac615...); the rest are judged by eye or do not apply | Pass or not applicable |

**The numbers, in seconds from the blow** (the picture's own clock; the game's speed for it is the main chat's to set):

- 0.00 to 0.10: the freeze. Its eyes flash gold; the shed feathers and blood begin.
- Flinch: 0.10 to 0.17, the snap (its head up 40 degrees; its pitch back 34 degrees, from 26.5 to -7.5); 0.17 to 0.40, back to its circling. The shed feathers and blood are gone by 0.50.
- Death: 0.10 to 0.20, thrown back and up (its body at its highest, 0.20, with its pelvis 40.8 picture pixels above the floor); 0.20 to 0.62, the fall: its pitch -20 at 0.20, -36 at 0.40, -56 at 0.50, -90 at 0.62 (on its back).
- Death, the ground: its eyes begin to go out at 0.46, half out at 0.64 and fully dark by 0.72; its shackle touches the floor at 0.59 and its beak at 0.61; it is on its back, pitched over, by 0.62; its body rebounds about one picture pixel at 0.67, then comes down flat at 0.733, and it is still from 0.733 (every part, the chain and the tail with it).

**Its sound** (sound rule 7; the timings sent to the sound chat): flinch: the blow at 0.00; the wings rustle and snap from 0.10 to 0.17; the feathers fall to 0.50. Death: the blow at 0.00; the wings beat wide from 0.10; the fall from 0.20 to 0.62 (a rasp of the body going over); the shackle touches the floor at 0.59 and the beak at 0.61; on its back at 0.62; the body rebounds at 0.67 and comes down flat at 0.733; still from 0.733.

**Pictures, for him:** `shots/vulture_reel.gif` (the flinch, thirty a second, from in front and from behind); `shots/vulture_death.gif` (the death, thirty a second, from in front and from behind); `shots/vulture_phonedown.png` (844 by 390, the game's size). From src/dev/preview_vulture.ts: the hashes `reelfilm`, `deathfilm` and `phonedown`.

**Checks:** tests/ledge_vultures.test.ts 30 of 30 (fourteen new, for the flinch and the death: the freeze holds 0.10 s; the head snaps back; the flinch ends on the walk's first pose; a key a thirtieth of a second and ends at 0.40 s; the eyes flash and fade; the shed lasts half a second and comes only in the flinch and the death; the death: a key each frame, ends at 1.00 s; ends on its back, feet up; never sinks; its feet stay in the air; its body only falls; its wings lie back, not over its head; still from 0.75 s to its end; no fire light at its end). tests/new_mobs3.test.ts 8 of 8. The other 11 test files that use the mob kit: 125 of 125. tsc clean. The standing checksum unchanged (1f9ac615...7faf). The standing, walk and dive pictures identical to HEAD on 190 frames, both views. NOT RUN: the full unit suite, the full regression, a real phone.

**Notes for the main chat** (not in the game; nothing of the vulture is):
1. The game's die clip runs at `DEATH_FPS`, 20 a second (src/art/mkit.ts, used for a monster's death clip; boss_checks.ts too). The vulture's death is drawn at 30 a second, by the rule "attacks and moves 30". A vulture that came in through the mob set's die path would play its death at 20. Nothing else is changed here: the other monsters keep their rate.
2. The flinch and the death start on the walk's first pose, which is in flight. The game must enter them from the walk's own phase (or blend in), or they will jump.
3. The death uses `deathOfMob` (no pink edge, no pool of light). `dyingMoment` (src/art/new_mobs3.ts) now sets `trails` when a dying move has a `trail`; no other monster sets one. `momentOf` is exported, with no change of behaviour.
4. The living rulebook (his claude.ai doc) is not edited by this chat; the copy in this repo carries the walk, dive and flier rules.

**His answers, to the pop-up sent with the pictures:** "Yes, the flinch as shown (Recommended)"; "Yes, the death as shown (Recommended)". Both are his yes to the pictures as shown: `shots/vulture_reel.gif`, `shots/vulture_death.gif`, and `shots/vulture_phonedown.png` (cropped to the game's 844 by 390 before they were sent; the file it replaced had a dark strip of 170 picture pixels to its right).

**Not yet:** nothing of the vulture is in the game. It stays behind `VULTURE_ON` (off), and comes into floor 7 whole, with its mobs and its films, once the main chat brings it in.

**Next:** the cliff crawler's brief (the section below, answered 14 Oct); then its standing sheet and films, for his yes; then her eyrie peak with the city view; then floors 8 to 10.

## The cliff crawler's brief (14 Oct; his picks, asked as pop-ups)

The Ledge Road's cliff crawlers (the plan's table: "Cliff Crawlers (medium, his pick in place of goats)"). A medium monster: two attacks (his rules of 9 Oct: "medium two"; a basic single-target blow, and one big move) and packs of 3 to 5. Asked as his art rulebook's questions for a new character, in two pop-ups, each his pick, the labels exactly as he tapped them:
- WHAT IT IS, AND WHERE IT LIVES, asked "The cliff crawler: what is it, and where does it live? (Floor 7, the Ledge Road. A medium monster, in packs of 3 to 5.)": "Low, many-legged beast on the cliff face (Recommended)".
- HOW BIG, AND HOW IT SHOULD FEEL, asked "The cliff crawler: how big, and how should it feel? (Fun to smash, or menacing? Medium, packs of 3 to 5.)": "Waist-high and wide, fun to smash (Recommended)".
- HOW IT MOVES, asked "The cliff crawler: how does it move? (Medium, packs of 3 to 5.)": "Wild and skittering, never still". Not the recommended pick; his pick stands. (Ours was "Scuttles in quick bursts, then freezes (Recommended)".)
- THE ONE THING TO KNOW IT BY, asked "The cliff crawler: what is the one thing you would know it by at a glance?": "Its many legs, splayed low on the rock (Recommended)".
- WHAT IT CARRIES, AND HOW IT ATTACKS, asked "The cliff crawler: what does it carry, and how does it attack? (Medium: a basic blow between its big moves, and one big move.)": "Nothing it carries; a claw swipe, then a leap onto you (Recommended)".
- HOW IT DIES, asked "The cliff crawler: how does it die?": "It curls up, and its shell cracks open". Not the recommended pick; his pick stands. (Ours was "Its legs give way; it slides down the cliff face (Recommended)".)
- WHAT IT MUST NEVER LOOK LIKE, asked "The cliff crawler: is there anything it must never look like?": "Not a cute or friendly creature (Recommended)".
- ITS SOUND (sound rule 7), asked "The cliff crawler: what does it sound like? (Sound rule 7: a sound brief with every new monster.)": "Clicking, scraping claws on stone (Recommended)".

**Read as, not asked** (stated plainly here; the pictures will show whether they are right):
- Friend or enemy: an enemy, as the cult's and the Ledge Road's monsters are. Its eyes and its edge are the enemy's pink while it lives; nothing cyan.
- Wild: no cult mark, no chain, no cult colour. It is not the cult's.
- "Never still": at rest it never settles. Its legs keep shifting and its body keeps a restless tremble, so its standing loop has motion in it, and no frozen pose. Its walk has no pause.
- Its legs: read as six, which is "many" without being a spider.
- Its size: waist-high to the knight, and wide; a pack of 3 to 5.
- Its attacks: the claw swipe is its basic blow; the leap, after a crouch, is its big move. Its reach and its cooldown are the main chat's to set, by the gameplay rulebook's rule: the bigger the hit, the longer the cooldown.
- Its death: its shell splits along its back and it lies curled up, its legs drawn in, where it fell.

**Not yet:** nothing of the crawler is drawn or in the game. Its standing sheet comes first, beside a hero, front and back; then its walk, its attack, its flinch and its death as films, each checked against docs/art/RULEBOOK.md before he sees it; behind a switch that is off.

**Next:** its standing sheet, for his yes; then her eyrie peak with the city view; then floors 8 to 10.

## The cliff crawler: its first standing sheet and films (14 Oct; SUPERSEDED by the revision at the end of this file)

**What is drawn.** src/art/ledge_crawlers.ts, painted in code (no art files), behind `CRAWLER_ON = { on: false }`; nothing of the game imports it. Tests: tests/ledge_crawlers.test.ts, 19 of 19. The dev page: src/dev/preview_crawler.ts (the command for each picture is in its header). Its canvas is 176 by 136 picture pixels, its feet on the point (88, 86) (`CR_CANVAS`).

**The look, as his brief has it** (`shots/crawler_look.png`: the top row at the game's size beside the knight, from in front and from behind; the bottom row close up, from both sides):
- One long, low, plated back, its top about 29 picture pixels up: waist-high to the knight, which stands 58 high. Wide, as the brief asks.
- A small head tucked under its front edge, with two jaw rods, and four eyes, pink burning to gold.
- Six legs, splayed low on the rock: a thigh, a knee, a shin and a claw at each foot.
- Nothing cyan. Its edge is the enemy's pink while it lives, and a faint pool of the enemy's pink lies under it.

**Its films** (in `shots/`; each is made at the speed it plays):
- `crawler_stand.gif`: the stand, ten frames a second, twelve frames in a 1.2 s loop. Never still: its legs shift and its body trembles; its feet stay put.
- `crawler_walk.gif`: the walk, sixteen frames a second, a 0.5 s cycle, at 1.4 tiles a second (its pace). Three legs are down at a time, and the two sets of three take turns every quarter second. A foot on the rock stays on its spot while it is down.
- `crawler_swipe.gif`: the claw swipe, its basic blow, thirty frames a second. Wind-up to 0.22 s, the claw cocked up; held and trembling to 0.30 s; THE BLOW at 0.38 s; the follow-through to 0.85 s, back on its stand. Shell flakes fly from the blow and are gone half a second later.
- `crawler_leap.gif`: the leap, its one big move, thirty frames a second. The crouch to 0.23 s, its warning held to 0.35 s; the spring, in the air to 0.72 s, carried 24 picture pixels forward; THE BLOW at 0.72 s, held a tenth of a second (to 0.82 s); the landing sinks (0.82 to 0.95 s); the hop back to where it stood, by 1.30 s. Flakes fly from the landing and are gone half a second later.
- `crawler_reel.gif`: its flinch, struck: frozen a tenth, knocked back and rocked, its eyes flash and fade, back on its feet by 0.30 s.
- `crawler_death.gif`: its death, thirty frames a second. Frozen a tenth; it buckles and its legs tuck in under it (0.10 to 0.55 s); its shell cracks open along its back (0.30 to 0.50 s); its eyes are out by 0.50 s; still from 0.80 s to its end at 1.00 s. Flakes fly from 0.30 s and are gone by 0.80 s.
- `crawler_phone.png` (walking, and at its leap's landing) and `crawler_phonedown.png` (struck, and dead with its shell cracked): 844 by 390, the game's size, beside the knight.

**The check, rule by rule** (docs/art/RULEBOOK.md; made before he sees the pictures):

| Rule | The crawler | Result |
| --- | --- | --- |
| Animations 1: as big, wild, kinetic and weighty as it will go | The leap is its big move: 24 picture pixels forward on a long arc, a held blow, a sinking landing. The swipe is wide and quick. The death buckles and cracks; it does not fade. Whether that is "a notch too high" is his to judge | Pass by the numbers; his eye decides the notch |
| Animations 4: the hero and every warning stay in sight | Its flakes are small, low on the rock, and gone half a second after the blow. Nothing of it covers the knight or its warning (tests) | Pass |
| Movement 1: weight first | The leap's crouch is slow to start; the blow carries through; the landing sinks and squashes | Pass by eye |
| Movement 3: every attack winds up and follows through | Wind-up: the swipe 0.22 s, the leap 0.35 s (tests). Follow-through: the swipe's blow at 0.38 s, then back on its stand at 0.85 s, about half a second. The rule's "a couple of frames" was set for a change to the hero's swipe, and the swipe's blow is quick. His vulture dive, approved as shown, has a pull-out of about the same length | Pass; one question for him (in the pop-up) |
| Movement 4: loose things follow | Nothing loose on it: no cloth, hair or chain | Not applicable |
| Movement 5: slick | Frames at their rates; nothing jumps from one frame to the next (test) | Pass |
| Movement 6: alive when still | Never still: its legs shift and its body trembles, its feet fixed (test) | Pass |
| Movement 7: a heavy blow lands with a freeze | The leap's blow holds a tenth of a second (0.72 to 0.82 s). Its flinch and its death also hold a tenth at the blow that struck it. The swipe is the light blow, with no freeze | Pass; his eye decides whether the swipe is light |
| Movement 8: feet grip the floor | Stand: feet fixed. Walk: a foot on the rock keeps its spot at its pace (test). Leap: the feet land where planned and stay; the hop back sets each foot where it stood. Death: each foot lifts only to move, then comes down where it lands (tests). It is not a flier, so the exception does not apply | Pass (tests) |
| Monsters 1: true to what it is | Its legs bend at the knee and the foot as a legged thing's do; its walk is a tripod | Pass by eye |
| Monsters 2: small ones are fun to smash | Medium, with his pick "fun to smash": a big reaction to a hit, knocked back and rocked, its head thrown back (test), flakes flying | Pass by eye |
| Monsters 4: the warning is a pose | The swipe's wind-up, the claw cocked up; the leap's crouch, held to 0.35 s (tests) | Pass |
| Monsters 5: weapons rest low | Its claw rests on the rock and rises only for its wind-up | Pass by eye |
| Monsters 6: pink is theirs | Eyes pink burning to gold; edge pink while it lives; nothing cyan; no blood (tests) | Pass |
| Monsters 7: equal to the heroes | Painted at the heroes' grain; bold plates, fine claws and eyes | Judged by eye |
| Monsters 8: built on bones | Not on the heroes' bones. The rule names the skeleton and the bone archer for that, and says other monsters "follow one at a time, each shown to you first": this one is shown to him first | Pass by the rule's own words |
| Pixels 1 and 2: crisp; 2D that looks solid | Every pixel there or not at all (test); painted in 3D in code, shown as flat pixels | Pass (test) |
| Pixels 3: one camera | Front and back, the two facings a monster has; the same isometric camera | Pass |
| Pixels 4: light from the upper left | The shading comes from the upper left | Pass by eye |
| Pixels 5: a one-pixel edge | The enemy's pink edge while it lives; none once dead (test) | Pass (test) |
| Pixels 7: soft shadows | The game's soft oval under it | Pass by eye |
| Colour 3: glows are reserved | Its eyes and its faint pool of light are the enemy's pink and gold. Its flakes and its crack give no light (tests) | Pass |
| Hits 1 and 2: no blood where there is none | No blood (test); its shell chips and crumbles | Pass (test) |
| Hits 3: every hit shows | Its eyes flash and fade on a hit; it is knocked back; a heavy blow rocks it (test) | Pass |
| Hits 4: what flies off is the monster's | Its flakes are its own shell, not the weapon's | Pass |
| Hits 5: small things die quick, big things die heavy | A medium monster: its death takes a full second, buckling, tucking, cracking, still from 0.80 s | Pass by eye |
| The numbers: standing 10 | The stand at ten frames a second | Pass |
| The numbers: monsters walk 16 | The walk at sixteen frames a second | Pass |
| The numbers: attacks and moves 30 | The swipe, the leap, the flinch and the death at thirty frames a second (the death: see note 2 below) | Pass |
| A new character | All eight questions answered (his brief); this sheet, front and back, beside the knight; its films | Pass |
| How art is made and approved: 1 pictures first; 5 painted in code; 6 checked at phone size; 8 your words, exactly | Behind the switch, which is off; no art files; the two phone pictures at 844 by 390 (looked at, not on a real phone); each quote in its brief is as he tapped it | Pass |

**Read as, not asked** (stated plainly; the pictures show whether they are right):
- An enemy, as the Ledge Road's monsters are: pink (its eyes, its edge, its pool of light); nothing cyan.
- No blood: it is a shell creature, and its hits throw its own shell flakes, as the skeletons' bone and dust do. His brief did not name blood either way.
- Wild: no cult mark, no chain, no cult colour.
- "Never still": at rest its legs shift and its body trembles; its walk has no pause.
- Six legs: "many" without being a spider.
- The swipe is its basic blow (light, quick, no freeze). The leap, after its crouch, is its one big move (heavy, with the tenth's freeze). Its reach and its cooldown are the main chat's to set, by the gameplay rulebook: the bigger the hit, the longer the cooldown.

**Notes for the main chat** (none of this is in the game; for when floor 7 comes in whole):
1. Behind `CRAWLER_ON` (off). Not for a version until floor 7 comes in whole, with its packs and its films.
2. Its death plays at thirty frames a second, by "attacks and moves 30". The game's die clip runs at `DEATH_FPS`, twenty a second (src/art/mkit.ts). Yours to decide, as for the vulture.
3. Its walk is timed for `CR_PACE`, 1.4 tiles a second. At any other speed its feet slide on the rock. The speed in the game is yours; the walk must match it.
4. The leap carries it 24 picture pixels forward inside the picture (`CR_LEAP_X`). Do not add a second forward move, or it will overshoot.
5. The swipe is light (no freeze); the leap is heavy (a tenth's freeze from 0.72 s). Reach, cooldown and pack behaviour are yours.
6. It is painted from its own solids (rods and balls), not on the heroes' bones. Monsters 8 names only the skeleton and the bone archer for that.
7. Its flakes are its own shell and last half a second. The canvas is `CR_CANVAS`, 176 by 136, its feet at (88, 86).

**Asked, not answered yet** (four pop-up questions, sent with the pictures; nothing goes live until he says yes; our pick is first and marked):
- The look: "Yes, the look as shown (Recommended)", or not yet.
- The walk: "Yes, the walk as shown (Recommended)", or not yet.
- The attacks, the swipe and the leap: "Yes, the attacks as shown (Recommended)", or not yet. The swipe's follow-through is the one line he may want shorter.
- The flinch and the death: "Yes, the flinch and the death as shown (Recommended)", or not yet.

**Checks:** tests/ledge_crawlers.test.ts 19 of 19; with tests/ledge_vultures.test.ts (30) and tests/new_mobs3.test.ts (8), 57 of 57; `tsc --noEmit` clean. tests/new_mobs3.test.ts now names this module among the mock-ups it does not count as a game file that draws the monsters, as it does the vultures: it was failing because the module imports the monster painters and was counted. The full unit suite was started on this tree and was still running as this was written (its count goes on the board). NOT RUN: the full regression, and a real phone.

**Superseded.** The four questions above were answered, and the first set was not approved as a whole: his answers, and the revised pictures, are in the revision below.

## The cliff crawler, revised (14 Oct; for his yes; behind `CRAWLER_ON`, off)

**His answers to the first set** (the pop-up, 14 Oct; each as recorded):
- The look: "These creatures have no pizzazz". Not approved.
- The walk: "Yes, the walk as shown (Recommended)". Approved.
- The attacks: "[No preference]". No choice made.
- The flinch and the death: "These are all very uninspired.  Does it not say in the art book that animations need to be wild and bold?". Not approved.

**Read as, not asked.** His question is answered yes. Animations 1 says "As far as it will go." and "When in doubt, a notch too high, never a notch too low." So the look is brighter, and the swipe, the leap, the flinch and the death are wilder. "No pizzazz" is read as the look needing more colour and contrast within Colour 5 ("Neon on dark"), not a new shape. The walk's motion is kept, as he approved it. Its colours changed, so it is shown again.

**What changed.** The code is src/art/ledge_crawlers.ts. The stand, the walk's motion and the painter are as before.
- **The look.** The first set was charcoal, #15171a to #687078, with brown-bone claws. It is now a neon violet shell, lit on its plates and along its ridge (#a064ff at its brightest) over a deep base (#140a26); violet legs; pale claws; four spines along its back with bone-pale tips, bigger than before; two bigger jaw horns with pale tips. Nothing cyan. No pink in the shell: pink stays the enemy's, for its eyes and its edge. Standing, its top is about 33 picture pixels: waist-high to the knight, which stands 58.
- **The claw swipe.** Its claw is cocked up to about 31 picture pixels for the warning, and whips from 0.26 s; the blow at 0.38 s; its body lunges 6 forward and turns with the claw; the follow-through runs out to the right, and it is back on its stand by 0.85 s.
- **The leap.** The spring carries its middle to about 47 picture pixels (the first set: about 39), with its legs flung out and forward and its knees lifted higher. The landing squashes and sinks, then it hops back. At the top of the spring it is as tall as the knight (59, its spines to their tips).
- **The flinch.** Knocked back 14 picture pixels (the first set: 7), up 12 (the first set: 4), rolled back by 0.6 radians (the first set: 0.25), its front legs kicking up to 14 (the first set: 7). It lasts 0.40 s (the first set: 0.30 s).
- **The death.** The first set only buckled. Now the blow freezes it for a tenth of a second; then it is thrown up 22 and back 16, rolled back over, its legs flailing as it goes (0.10 to 0.35 s); it crashes down (0.35 to 0.60 s); its shell cracks open wide along its back (0.30 to 0.50 s; 22 flakes, gone by 0.80 s); its legs snap in under it by 0.55 s; its eyes are out by 0.50 s; its body is still from 0.60 s. At its highest it is about 54 picture pixels up.
- **The canvas.** 176 by 144 picture pixels (was 176 by 136), its feet on the point (88, 94) (was (88, 86)). Only the canvas grew: the leap's peak, seen from behind, reached the top edge.

**The tests, and what moved** (tests/ledge_crawlers.test.ts; each change has its reason in a comment there):
- A fault of mine, fixed: the death's first tenth of a second kept the living pink edge. It is off from the blow, as in the first set.
- Three limits on the largest step from one frame to the next, raised because the wilder moves are faster. Each move is still one continuous arc, and none teleports. The leap, 10 to 14: its middle rises 37 picture pixels, at most about 13 a frame at its launch. The flinch, 6 to 9: its knock snaps back as the freeze ends, about 8 a frame. The death, 6 to 15: its throw snaps as the freeze ends, about 14.6 a frame at its head.
- The death's tuck is 0.2 s, done by 0.55 s, so the test "tucked, and no foot moves after" holds as before.
- The largest step, measured frame by frame at 30 a second, against its limit: stand 0.5 (2); walk 2.7 (4); leap 12.2 (14); flinch 8.1 (9); death 14.6 (15); the swipe's body 5.1 (6); its striking leg 28.1 (30).

**The check, rule by rule** (docs/art/RULEBOOK.md; made before he sees the pictures):

| Rule | The crawler | Result |
| --- | --- | --- |
| Animations 1: as far as it will go | Each move is wilder than the first set: the flinch, the death, the leap's spring and the swipe's whip. The swipe is the mildest; if he wants it wilder, its reach and its lunge are the dials | Pass by the numbers; his eye decides the notch |
| Animations 4: the warning stays in sight | The swipe's warning (the claw up, to 0.22 s) and the leap's crouch (to 0.35 s) have nothing over them. Its flakes come after the blow and are gone half a second later | Pass |
| Movement 1: weight first | The landing sinks and squashes; the death's crash drops it onto the rock; the flinch rocks it | Pass by eye |
| Movement 3: every attack winds up and follows through | Wind-up: the swipe to 0.22 s (trembling to 0.26 s); the leap's crouch to 0.35 s. Follow-through: the swipe's blow at 0.38 s, back on its stand at 0.85 s, which is 0.47 s (about fourteen frames) after the blow. The rule allows "a couple of frames" past the attack, "as long as the blow comes just as fast"; this is longer | OPEN: his question, in the pop-up |
| Movement 4: loose things follow | Nothing loose but its shell's flakes, which fall and go. Its jaws, legs and spines are jointed to it | Not applicable |
| Movement 5: slick | Continuous arcs, tested frame by frame at 30 a second. The three fastest moments (the leap's spring, the flinch's knock, the death's throw) are the bursts Animations 1 asks for, with their limits above | Pass by test; the bursts are his to judge |
| Movement 6: alive when still | Never still; its feet fixed (test) | Pass |
| Movement 7: a heavy blow lands with a freeze | The leap's blow holds from 0.72 s to 0.82 s. The flinch and the death freeze for a tenth at their blow. The swipe is light, with no freeze | Pass (tests) |
| Movement 8: feet grip the floor | Standing: fixed. Walking: a foot on the rock keeps its spot, at its pace. Leap: the landing, then the hop back to where it stood. Death: each foot lifts only to move, then comes down where it lands | Pass (tests) |
| Hits 2 and 3: no blood where there is none; every hit shows | No blood (test); its shell chips; on a hit its eyes flash and it is knocked back (test) | Pass |
| Hits 4: what flies off is the monster's | Its own shell, not the weapon's | Pass |
| Hits 5: small things die quick, big things die heavy | A medium monster: its death is a throw, a crash and a crack, then still | Pass by eye |
| Monsters 2: small ones are fun to smash | A big reaction to every hit: knocked back and rocked | Pass by eye |
| Monsters 4: the warning is a pose | The swipe's raised claw; the leap's crouch | Pass |
| Monsters 6: pink is theirs | Eyes pink burning to gold; edge pink while it lives, and none once dead (test); nothing cyan | Pass (test) |
| Monsters 7: equal to the heroes | Bold plates and spines; fine claws and eyes | Judged by eye |
| Monsters 8: built on bones | Not on the heroes' bones; shown to him first, as the rule asks of a monster that is not | Pass by the rule's words |
| Pixels 1, 2, 4 and 5: crisp; lit from the upper left; a one-pixel edge | Every pixel there or not at all (test); lit from the upper left; the enemy's pink edge (test) | Pass |
| Colour 3: glows are reserved | Its eyes and its pool of light: the enemy's pink and gold only | Pass (test) |
| Colour 5: neon on dark | Violet plates lit to #a064ff over a deep base (#140a26); pale claws. Never mud-brown all over | Pass by eye; his call |
| The numbers: standing 10, walking 16, attacks and moves 30 | The stand at ten, the walk at sixteen, the swipe, the leap, the flinch and the death at thirty (the death: note 2 below) | Pass |
| A new character | His eight answers; this sheet, front and back, beside the knight; its films | Pass |
| How art is made: pictures first; checked at phone size | Behind `CRAWLER_ON`, which is off; no art files; the phone pictures at 844 by 390 (looked at, not on a real phone) | Pass |

**Read as, not asked** (stated plainly; the pictures show whether they are right):
- The violet is the enemy's family (pink edge, pink eyes) without being pink. Its spines and claws are bone-pale: its own colour, not a glow.

**Its films and pictures** (in `shots/`; each is made at the speed it plays):
- `crawler_look.png`: standing, from in front and from behind, beside the knight, and close up.
- `crawler_walk.gif`, `crawler_stand.gif`, `crawler_swipe.gif`, `crawler_leap.gif`, `crawler_reel.gif` (the flinch), `crawler_death.gif`: the moves, thirty frames a second except the walk (sixteen) and the stand (ten).
- `crawler_phone.png` (walking, and at its leap's landing) and `crawler_phonedown.png` (struck, and dead with its shell cracked): 844 by 390, the game's size, beside the knight.
- `crawler_sheet_leap.png`, `crawler_sheet_dying.png`, `crawler_sheet_attack.png`, `crawler_sheet_reel.png`: frame by frame, for checking.

**Notes for the main chat** (none of this is in the game; for when floor 7 comes in whole):
1. Behind `CRAWLER_ON` (off). Not for a version until floor 7 comes in whole, with its packs and its films.
2. The death plays at thirty frames a second, by "attacks and moves 30". The game's die clip runs at `DEATH_FPS`, twenty a second (src/art/mkit.ts). Yours to decide, as for the vulture. Its snap is its fastest move: check it at the game's rate when it comes in.
3. The walk is timed for `CR_PACE`, 1.4 tiles a second. At any other speed its feet slide on the rock. The speed in the game is yours; the walk must match it.
4. The leap carries it `CR_LEAP_X` = 24 picture pixels forward inside the picture. Do not add a second forward move, or it will overshoot.
5. The swipe is light (no freeze); the leap is heavy (a tenth's freeze from 0.72 s). Reach, cooldown and pack behaviour are yours.
6. It is painted from its own solids (rods and balls), not on the heroes' bones. Monsters 8 names only the skeleton and the bone archer for that.
7. Its flakes are its own shell and last half a second. The canvas is `CR_CANVAS`, 176 by 144, its feet at (88, 94).

**Asked with the revision, not answered yet** (superseded by the upgrade below, which asks again with its own pictures):
- The look: "Yes, the look as shown (Recommended)", or not yet.
- The walk, in its new colours: "Yes, the walk as shown (Recommended)", or not yet.
- The attacks, the swipe and the leap: "Yes, the attacks as shown (Recommended)", or "Shorter follow-through, a couple of frames" (Movement 3's allowance). The follow-through is the one line that is longer than the rule's words.
- The flinch and the death: "Yes, the flinch and the death as shown (Recommended)", or not yet.

**Checks:** tests/ledge_crawlers.test.ts 19 of 19; `tsc --noEmit` clean; the full unit suite (`tsx --test tests/*.test.ts`), 1361 of 1361, run on this tree (it includes tests/ledge_vultures.test.ts and tests/new_mobs3.test.ts). Since that run only comments in src/art/ledge_crawlers.ts have changed; the crawler, vulture and new_mobs3 tests were run again on the final tree: 57 of 57. NOT RUN: the full regression (`tools/regress.sh`), and a real phone.

---

## The cliff crawler, upgraded: fluid, high-end, punchy (14 Oct, 18:09)

His words: "Act as an expert motion designer and creative coder. I want to upgrade the animations to make them feel fluid, high-end, and punchy." Read as: every move of the crawler, its walk included (its colours changed in the revision, so its walk is shown again). Not touched: the vulture and the Carrion Queen, which he approved as shown.

The key times stay as the sound chat has them, so the sound posts stand, with one correction: the death holds still from 0.80 s, not 0.60 s. Its body hits the rock at 0.60 s and rebounds a little until 0.80 s.

**What changed** (src/art/ledge_crawlers.ts; each move keeps its key times):
- **The curves.** Wind-ups overshoot and settle; knocks snap and give way; the death falls faster as it falls. No move is a straight line from one pose to the next.
- **The claw swipe.** The claw rears back past its warning, to about 34 picture pixels up, and settles on 30 by 0.22 s. The body lunges 8 into the blow and stretches out long on the whip. The blow squashes it flat for a tenth of a second, and it springs back out. The follow-through overshoots and settles, back on its stand by 0.85 s.
- **The leap.** Its shell stretches out as it launches: its middle is about 47 picture pixels up at the top (0.54 s), and its highest point is 59 (the knight stands 58). The landing squashes it flat and short, held for its tenth. The hop back overshoots and settles on its stand at 1.30 s.
- **The flinch.** The knock snaps as the freeze ends: at 0.16 s the body is back about 13 and the head about 14. Then it gives way, rocks once more, and is back on its stand by 0.4 s.
- **The death.** Thrown back 20 and up 26 (was 16 and 22). It falls faster and faster and hits the rock at 0.60 s, its middle then 8.8 up at its lowest; it rebounds about 2.5 and is still at 0.80 s. A burst of its shell flies off where it lands, gone by 0.80 s.
- **The walk.** Its middle rises and falls on a smooth curve, with no kink at each landing. Same height, same cycle, same feet.
- **The head** follows its body two frames late (0.07 s), so the whip, the knock and the throw carry on through it. Its stand has no lag, so every move still ends on exactly its stand.

**The limits** (tests/ledge_crawlers.test.ts; the reason is a comment there). The largest step from one frame to the next: the flinch's raised from 9 to 15, because its knock snaps as its freeze ends (14.6 picture pixels in the first frame of the knock, on one continuous arc). The others stand, with the measured values: stand 2 (0.5), walk 4 (2.7), leap 14 (11.2), death 15 (14.1), the swipe's body 6 (4.6), its striking leg 30 (28.1).

**The check, rule by rule** (docs/art/RULEBOOK.md; made before he sees the pictures):

| Rule | The crawler | Result |
| --- | --- | --- |
| Animations 1: as far as it will go | Every curve is wilder, with the same key times. The bursts are the flinch's snap and the death's throw | Pass by the numbers; his eye decides the notch |
| Movement 1: weight first | The landing squashes and sinks; the death falls faster as it falls and rebounds on the rock | Pass by eye |
| Movement 3: wind-up and follow-through | Wind-ups overshoot and settle. The swipe's blow at 0.38 s, back on its stand at 0.85 s: 0.47 s after the blow, longer than the rule's "a couple of frames" | OPEN: his answer, in the pop-up |
| Movement 5: slick, nothing jerky | Every curve continuous, tested frame by frame at 30 a second. The flinch's snap and the death's throw are the bursts Animations 1 asks for | Pass by test; the bursts are his to judge |
| Movement 6: alive when still | The stand is never still; its head sways | Pass |
| Movement 7: heavy blows freeze a tenth | The leap's blow holds 0.72 s to 0.82 s; the flinch and the death freeze a tenth at their blow; the swipe is light, no freeze | Pass (tests) |
| Movement 8: feet grip the floor | The feet are as they were: the walk's feet keep their spots; the swipe and the leap lift a foot only to move | Pass (tests) |
| Hits 3 and 5 | Every hit shows: a flash, a knock, a rock. The death is a throw, a fall and a rebound, then still | Pass by eye |
| Colour 5: neon on dark | Unchanged from the revision: violet, pale claws | Pass by eye; the look is asked below |
| The numbers: stand 10, walk 16, attacks and moves 30 | Unchanged | Pass |

**Checks:** tests/ledge_crawlers.test.ts 19 of 19; with tests/ledge_vultures.test.ts and tests/new_mobs3.test.ts, 57 of 57; `tsc --noEmit` clean. NOT RUN: the full unit suite and the full regression on this change; a real phone.

**Its pictures** (in `shots/`, re-made): `crawler_walk.gif`, `crawler_stand.gif`, `crawler_swipe.gif`, `crawler_leap.gif`, `crawler_reel.gif`, `crawler_death.gif`; `crawler_phone.png` and `crawler_phonedown.png` (844 by 390, beside the knight); `crawler_look.png`; `crawler_sheet_attack.png`, `crawler_sheet_leap.png`, `crawler_sheet_reel.png`, `crawler_sheet_dying.png` (frame by frame).

**His answers to these pictures** (the pop-up, 14 Oct; each as he tapped it):
- The look, unchanged in this upgrade: "[No preference]". No choice made; the look stays as shown, and is not approved.
- The walk: "Yes, the walk as shown (Recommended)". Approved as shown.
- The attacks, the swipe and the leap: "Yes, the attacks as shown (Recommended)". Approved as shown, with the follow-through as it is (his call on the rule's "a couple of frames").
- The flinch and the death: "Yes, the flinch and the death as shown (Recommended)". Approved as shown.

**Status:** the walk, the attacks, and the flinch and the death have his yes as shown. The look has no yes: it is the revision he said "Not yet" to, and it stays unapproved until he says so. Nothing is in the game (behind CRAWLER_ON, off), and the crawler is not for a version until floor 7 comes in whole.

**Next:** the look, when he gives a choice; then her eyrie peak with the city view (the section below); then floors 8 to 10.

---

## The Queen's eyrie: her peak, looking out over the city (14 Oct, for his yes)

His words, 13 Oct, 20:59: "Or we can just have the trail sort of work out one direction primarily, then have the boss area be on some peak where we can see the city.  I’ll wait for the new drawing and we can figure it out". Asked which way the Ledge Road goes, his pick: "Mostly one way, views at turns (Recommended)", offered as: the trail runs mostly one way; a few turns round the mountain open a view; the boss's peak looks out over the city. His go-ahead to this, 14 Oct, 19:08: "K go".

**Read as, not asked** (the picture shows whether it is right): the trail's end comes along a narrow ridge onto the mountain's top, a bare floor of rock jutting out over the drop, with nothing over it. Past its far edge there is only sky, and far below in the haze the town under the cult's dome, as in the reveal he said yes to ("Yes, the dome (Recommended)"). The Queen stands on her eyrie at the far edge, her nest and the great egg beside her, the flock's bones about, the cult's perch and feather standard at the ridge. The knight comes up onto the top from below.

**Made of what he has said yes to:** the Ledge Road's ground and sky (src/art/ledge.ts, painted by src/art/terrain.ts from tiles laid here); floor 7's pieces (src/art/floor7.ts: the crumbling ledge, cracks across the trail, a vulture's nest, the great egg, bones and feathers, a dead vulture, the cult's perch, the cult's feather standard, a perching rock); the Queen as she stands (src/art/carrion_queen.ts, `queenStanding`); the knight.

**New here:**
- The shape of the top: a ragged oval about 660 picture pixels across, its cliff face hanging under its near edge; the ridge in from the right. Laid in tiles, as the game would walk it (src/dev/preview_eyrie.ts).
- The town far below, painted crisp (two picture pixels to a game pixel) into the sky's land: its wall and roofs, its keep, smoke rising, the cult's violet tents ringing it with their orange cooking fires; the dome over it, see-through (every other pixel), its rim lit from the upper left, cracks of its power burning pink to gold; three thin lines of magic running to it from the swamp, which lies under its dark violet haze. The low clouds below the ledge pass in front of it.
- `cloudBelow` in src/art/ledge.ts: whether a low cloud covers a point of the sky, so that what is painted into the land is hidden behind it. It changes no picture by itself.
- The sky starts where its low clouds leave the town clearest. The game scrolls the sky, so every start is a true view.

**The check, rule by rule** (docs/art/RULEBOOK.md; before he sees it):

| Rule | The eyrie | Result |
| --- | --- | --- |
| Pixels 1 and 3: crisp; one camera | Every pixel there or not (the shadows are the game's soft ovals); the iso view of the game | Pass |
| Pixels 4: light from the upper left | The ground and the pieces by their painters; the dome's rim lit at its upper left | Pass |
| Colour 3: glows are reserved | Pink only on the enemy's: the cult's dome and its lines, the Queen's eyes and edge. The camps' fires are orange (honest fire). Nothing cyan but the knight's blade and the map's dot | Pass |
| Colour 5: neon on dark | The dome's pink against the haze; the Ledge Road's palette under it | Pass by eye; his call |
| Places 2 and 3: a step quieter; each place its own | The ground and sky are the Ledge Road's, quieter than the figures | Pass |
| Places 4: solid, not flat | The top's cliff face hangs under its edge; the pieces stand on it with soft shadows | Pass |
| Places 7: themed after its boss | Her nest and egg, the flock's leavings, the cult's perch and standard: floor 7's own pieces | Pass |
| Animations 4: the hero stays in sight | Nothing covers the knight; the Queen stands clear of him | Pass |

**Checks:** `tsc --noEmit` clean; tests/carrion_queen.test.ts, tests/floor7.test.ts, tests/ledge.test.ts, tests/ledge_crawlers.test.ts and tests/ledge_vultures.test.ts together, 77 of 77. Nothing of the game imports the new page or the new function. NOT RUN: the full unit suite, the full regression, a real phone.

**The pictures:** `shots/eyrie_world.png`, one phone screen (1014 by 468 picture pixels: the game's 507 by 234 at two to one), with the floor's name and its map as the game shows them; `shots/eyrie_city.png`, the town at four times, to check its pixels.

**Asked with the picture** (one pop-up; our pick first and marked): "Is this the Queen's eyrie, her peak looking out over the city?" (offered: "Yes, this is it (Recommended)", or "Bring the city closer").

**His answer, 14 Oct:** "Yes, this is it (Recommended)". The boss area goes in the plan as shown: the mountain's top over the drop, the town under the cult's dome far below past its far edge, the Queen's eyrie at the far edge. Nothing of it is in the game; the main chat lays the real floor when floor 7 comes in whole.

**Next:** floors 8 to 10.

---

## The Carrion Queen, redone (14 Oct; behind `CARRION_QUEEN_ON`, off; HER LOOK HAS HIS YES; her moves here were turned down and are SUPERSEDED by "The Carrion Queen's moves, rebuilt" at the end of this file)

His words, 19:22: "Hey can you redo the carrion queen.  She kinda looks like shit and the animations are uninspired". Asked as a pop-up which way her look should go, his pick, 19:23: "Black-violet, raw bald head, burning crown (Recommended)", offered as: deep black plumage with a violet sheen, ragged fingered wings, a bald wrinkled red head and neck, her bone crown and the cult's mark burning pink and gold. And, 19:23: "Make sure she hits all the checks in the art book rules including the wild and big animations".

**Read as** (told him so): all of her, her look and every move: stand, hop, rake, gust, dive, call, flinch, and the edge death he picked. Her brief stands: huge, hunched, the bone crown, the cult's chain and mark, ugly, never noble. Why she failed: grey-brown all over (Colour 5: "never mud-brown all over"), her body in stacked rings like a grub, her wings flat slabs, no bright point to catch the eye; her moves too small for Animations 1. Every key time is kept, so the sound chat's timings stand.

**Her look** (src/art/carrion_queen.ts):
- Plumage black with a violet sheen (`PLUMAGE`, #08060c to #58399a; was brown-grey, #1d1820 to #8c7a80), shaggy points hanging down her in loose columns (was tidy scalloped rings).
- Her bare head and neck raw red, wrinkled and warty (`BARE`, #3a0b12 to #dc5656; was grey-tan), the head bigger (`CQ_HEAD`: 1.55, 1.25 and 1.15 times the bones' head; was 1.3, 1.05 and 0.95), set further out from her crown, with loose wattles under the neck. The beak is kept at its old size, so the head, not the beak, is what you see.
- Her crown taller, its long points each burning with a tongue of the cult's fire, pink to gold, flickering (the bone stays bone: `CROWN`).
- The cult's mark bigger (0.56 by 0.52 of her chest; was 0.45 by 0.42), its glow stronger (66 across at 0.42; was 46 at 0.3); her eyes' glow stronger (16 at 0.6; was 10 at 0.4).
- Her wings held out and up from her hunched shoulders, a spread cloak (wrists 0.7 of the arm out and level with her shoulders; were 0.6 out and 0.2 below): the shape you dread. Six primaries 112 to 100 long (were seven, 88 to 78), fanned like fingers with a gap between each; seven broad secondaries (were nine thin ones); no shaft line on the small feathers (the streaks were what made them read as curtains).

**Her moves**, each on its old key times (the rake's blow at 28/30 s, the gust's at 0.8 s, the dive's strike at 1.25 s, the call 1.6 s, the flinch 0.4 s, the death 2.0 s):
- The hop: up 24 (was 13), a deeper crouch, wings flung up to 1.4 (was 1.0).
- The talon rake: leaps to 52 (was 36), reaches out 31 (was 23), lands 21 forward (was 15), wings up to 1.68 (was 1.32).
- The wing gust: wings thrown up to 1.75 (was 1.38) and held trembling, beaten down with her body pitched 28 forward (was 18); 14 feathers torn off her wingtips at the beat, flung forward on the wind (gone by 1.5 s).
- The dive: climbs to 66 (was 46), swoops 56 out along the line (was 40), pitched 60 into the strike (was 46).
- The call: rears up 22 (was 12), her head thrown back 52 (was 36), her wings beating to 1.75 (was 1.35).
- The flinch: knocked back 13 (was 5), her head flung back 30 (was 16), her wings thrown up 40 (was 22); 10 feathers burst from her breast (gone by 0.4 s).
- The edge death: she reels further and goes back 86 and down 100 (was 80 and 90), her wings beating four times as she goes over; 16 of her feathers burst from her at 0.35 s and swirl up after her (her brief's own words for this death).
- The stand: as big as the handover allows (the game may start any move from any frame of her stand, so it stays within a step of her rest): her heave 3 (was 2), her cloak of wings opening 5 (was 3), her head whipping round 24 (was 22).

**Kept clear of the rock** (new, and a test): her beaten-down wings' feathers, which would have reached 40 picture pixels under the rock, now bend out to lie along it; the cult's chain hangs from her leg in the air and lies back along the rock where it reaches it (it reached under the rock in the rake); her toes rest on the rock (they were drawn 7.8 into it). The test: nothing painted of her is more than half a picture pixel under the rock in any frame of any move (her deaths aside: she goes over the edge).

**Elsewhere:**
- Her canvas `CQ_CANVAS` 900 by 860, her feet at (490, 520) (was 820 by 780, feet at (410, 520)): her fall back off the edge reached its left and bottom edges.
- src/art/new_mobs3.ts: a moment now carries its move's name (`Moment.move`, set by `momentOf` and `dyingMoment`), so that she can throw feathers in her flinch, her gust and her death. It changes no picture by itself.
- The film panels in src/dev/preview_carrion_queen.ts are 840 by 760 (were 560 by 500), each film placing her to fit; the boss review's head (tests/carrion_queen_shape.ts) is `CQ_HEAD`.

**The check, rule by rule** (docs/art/RULEBOOK.md; How art is made 7, every boss through every check; made before he sees her):

| Rule | The Queen | Result |
| --- | --- | --- |
| Animations 1: as far as it will go | Every move bigger, on its old key times (the numbers above); feathers torn from her on the flinch, the gust and the death | Pass by the numbers; his eye decides the notch |
| Animations 4: warnings in sight | The rake's hang, the gust's held wings and the dive's hang are held and trembling; nothing covers them | Pass |
| Movement 1: weight first | Deep crouches, heavy landings that sink; she falls as a weight | Pass (review) |
| Movement 3: wind-up and follow-through | Each blow drawn back, held, and carried through | Pass (review: BLOW, HIPS) |
| Movement 4: loose things follow | Her feathers torn off fly, turn and fall; her chain hangs and lies on the rock | Pass by eye |
| Movement 5: slick | No frame leaps, stalls, turns back at speed, or starts or stops at its fastest; no jump from her stand into any move and back | Pass (review: JERK, JUMP) |
| Movement 6: alive when still | Her chest rises and her weight shifts | Pass (review: ALIVE) |
| Movement 7: heavy blows freeze | As before | Unchanged |
| Movement 8: feet grip | No foot slides while down | Pass (review: SLIDE) |
| Nothing below the rock | Bones (review: FLOOR) and everything painted of her (new test) | Pass |
| Hits 3 and 4: every hit shows; what flies off is hers | Knocked back, her feathers burst from her | Pass |
| Monsters 3: big ones are menacing | Wings spread wider than the trail, a dark cloak, a burning crown | Pass by eye; his call |
| Monsters 6 and Colour 3: pink is theirs; glows reserved | Her mark, eyes and crown's fire the cult's pink and gold; nothing cyan; every light the cult's fire | Pass (test) |
| Colour 5: neon on dark | Black with a violet sheen; raw red head; pink-gold fire | Pass by eye |
| Pixels 1 and 5: crisp; the pink edge | Every pixel crisp; her pink edge in every frame | Pass (test) |
| Never: cute, plastic | A ragged, ugly carrion eater; her plumage shaggy, matte | Pass by eye |
| Checked at phone size | `shots/eyrie_world.png`: her in her eyrie as a phone shows it | Looked at |

**Checks:** tests/carrion_queen.test.ts 9 of 9 (the whole boss review of every move and her three deaths, from in front and behind; crisp; nothing cyan; nothing cut off; her size; her crown and mark; nothing under the rock); `tsc --noEmit` clean; the full unit suite (`tsx --test tests/*.test.ts`), 1362 of 1362, on this tree. NOT RUN: the full regression; a real phone.

**The pictures** (in `shots/`): `cq_look.png` (standing, from in front and behind, beside the knight and the Unfinished); `eyrie_world.png` (her eyrie, one phone screen); films `cq_walkfilm.gif`, `cq_rakefilm.gif` (the rake, then struck), `cq_gustfilm.gif`, `cq_divefilm.gif`, `cq_callfilm.gif`, `cq_edgefilm.gif`, each with a contact sheet (`.sheet.png`).

**His answers, 14 Oct, to the pop-up sent with these pictures:** her look, "Yes, the look as shown (Recommended)"; her moves, "Absolutely not.  Scrap all the animations and do them differently.  Following the rules". Her look stands as shown here. Her moves were planned again from nothing (the next section).

---

## The Carrion Queen's moves, rebuilt (14 Oct; for his yes; behind `CARRION_QUEEN_ON`, off)

His words on the moves of the section above: "Absolutely not.  Scrap all the animations and do them differently.  Following the rules". A new plan for all eight moves went to him as a message, and the pop-up "Build the Carrion Queen's moves this way?" came back "Yes, build these (Recommended)". His standing word on her, 19:23: "Make sure she hits all the checks in the art book rules including the wild and big animations".

**Read as:** every move made new, its own shape, its own timing; none of the old key times kept, so the sound chat has new timings (below, and on the board). Her look is the one he said yes to and is unchanged.

**Her moves** (src/art/carrion_queen.ts; each a smooth curve through its key poses, a key every frame; the times are seconds into the move):
- **Stand** (`cqStand`, a 2.6 s round, ten frames a second): her head snakes low from side to side (20 degrees each way, at 0.65 and 1.95 s), her wings breathe like bellows and her bulk heaves with them (fullest at 1.3 s), her crown's fire flickers, and once a round she rouses, every feather shaken up and out (1.85 to 2.3 s).
- **Hop** (`cqWalk`, one hop a second, sixteen frames): she gathers low (to 0.24 s), bounds long and low from 0.3 s, her body level, her wings swept back like a cloak, talons first; lands heavy at 0.64 s, flaring her wings to brake, dust kicked off the rock (0.64 to 0.94 s); sinks (to 0.78 s); still a beat from 0.9 s. Her head is held level all the way, locked on you.
- **Talon rake** (`cqRake`, 1.8 s): bursts up off the rock in two great wingbeats (at about 0.3 and 0.72 s); hangs with her talons cocked up and forward, trembling (THE WARNING, from 0.42 s); drops and rakes both feet down and back through you at 0.9 s, three burning claw-streaks where her talons go; comes down on the spot at 1.0 s, rock chips and dust flying (to 1.6 s), and mantles over it, wings spread low and forward, head down; hops back to where she stood (1.4 to 1.7 s).
- **Wing gust** (`cqGust`, 1.6 s): rears to her full height, wings drawn far back and trembling, her crown flaring (THE WARNING, 0.35 to 0.66 s); claps them forward in one huge stroke at 0.82 s: a blast of grit, driven air, torn feathers off her wingtips and the cult's embers out before her, a ring of dust off the rock; her own blow rocks her back on her feet (to 0.98 s); settled by 1.6 s.
- **Dive** (`cqDive`, 2.3 s): launches straight up at 0.18 s, beating hard, a downdraft of dust off the rock; climbs out of sight above, 240 over the rock by 0.62 s, and hangs there (0.55 to 0.78 s; on a phone screen only her talons show at the top, so the warning is the game's mark on her line); plunges back in a stoop with her wings folded and a speed-streak behind her (0.78 s), striking talons-first 92 along the line at 1.08 s, held a tenth (to 1.18 s); rips free, her talons dragged on through the rock, a crater of chips and a ring of dust (from 1.18 s); beats back up (wingbeats at about 1.42 and 1.98 s) and home by 2.3 s.
- **Call** (`cqCall`, 2.0 s): rears to her full height, wings flung wide, head thrown back, beak to the sky (to 0.6 s); held trembling, screeching (0.6 to 1.5 s); her crown and mark blaze (from 0.2 s), embers rising off her crown; rings of the cult's fire pulse out over the rock at 0.45, 0.85 and 1.25 s; she folds her wings and settles (1.5 to 2.0 s). Her flock wheeling in is the game's.
- **Flinch** (`cqReel`, 0.45 s): her head whips back and her wings snap open (0.08 s), feathers bursting from her breast (to 0.4 s); her head snaps forward, low, to glare (0.22 s); back on her stand by 0.45 s.
- **Death, his pick: off the edge** (`cqDieEdge`, 2.0 s): she screams, head back, wings flung up (to 0.15 s); her mark flares and gutters out and her crown's fire goes out (0.15 to 0.8 s); she staggers back two steps (0.15 to 0.5 s) and claws at the rock, her feet scrabbling (to 0.85 s); topples backward off the edge from 0.85 s, wings flailing (beats at about 1.15 and 1.75 s), her feathers swirling up after her.

**Her effects** (Animations 3, her own way of being wild: grit, feathers and the cult's fire; each a crisp mote of whole pixels): dust rings and rock chips off the Ledge Road's rock in its own colours; the rake's three claw-streaks in the cult's fire; the gust's blast; the dive's speed-streak in her own quills; rings of the cult's fire; embers off her crown when it burns hot (each warning and the call); feathers torn from her in the flinch, the gust and the death.

**Elsewhere:**
- Her canvas `CQ_CANVAS` 900 by 1060, her feet at (490, 720) (was 900 by 860, feet at (490, 520)): her dive climbs 605 picture pixels over her feet.
- src/dev/preview_carrion_queen.ts: the dive's film and the death's are 800 tall (the others 760); new labels for the warnings. src/dev/preview_eyrie.ts: a hash `move:seconds` draws her at that moment of a move on the eyrie's screen (`dive:0.66`, her dive's hang).

**The check, rule by rule** (docs/art/RULEBOOK.md; How art is made 7, every boss through every check; made before he sees her):

| Rule | The Queen | Result |
| --- | --- | --- |
| Animations 1: as far as it will go | The rake bursts up 66 in two wingbeats; the gust rears 16, her wings drawn 28 back and clapped 28 forward; the dive climbs 240, out of sight, and strikes 92 along the line; the call rears 28, her head thrown back 58 degrees | Pass by the numbers; his eye decides the notch |
| Animations 3: wild in her own way | Grit, torn feathers and the cult's fire, nothing borrowed from the heroes | Pass by eye |
| Animations 4: warnings in sight | The rake's hang and the gust's held wings are in sight, and no effect covers them; the dive's hang is above a phone screen (only her talons show), so its warning is the game's mark on her line | Pass, the dive with the game's mark |
| Monsters 4: the warning is a pose | Each attack holds a wound-up pose, trembling: the rake 0.42 to 0.8 s, the gust 0.35 to 0.66 s, the dive 0.55 to 0.78 s | Pass (review: BLOW) |
| Movement 1: weight first | Deep gathers, heavy landings that sink, rocked back by her own blow | Pass (review) |
| Movement 3: wind-up and follow-through | Each blow drawn back, held, and carried through | Pass (review: BLOW, HIPS) |
| Movement 4: loose things follow | Her torn feathers fly, turn and fall; her chain hangs and lies on the rock | Pass by eye |
| Movement 5: slick | No frame leaps, stalls, turns back at speed, or starts or stops at its fastest; no jump from her stand into any move and back | Pass (review: JERK, JUMP) |
| Movement 6: alive when still | Head snaking, bellows, the rouse | Pass (review: ALIVE) |
| Movement 7: heavy blows freeze | The dive's strike held a tenth of a second (1.08 to 1.18 s) | Pass |
| Movement 8: feet grip | No foot slides while down | Pass (review: SLIDE) |
| Nothing below the rock | Bones (review: FLOOR) and everything painted of her (test) | Pass |
| Hits 3 and 4: every hit shows; what flies off is hers | Knocked back, her own feathers burst from her | Pass |
| Monsters 6 and Colour 3: pink is theirs; glows reserved | Her mark, eyes, crown's fire, streaks, embers and rings the cult's pink and gold; nothing cyan | Pass (test) |
| Pixels 1 and 5: crisp; the pink edge | Every pixel crisp; her pink edge in every frame | Pass (test) |
| Nothing cut off | No frame of any move or death touches her canvas's edge | Pass (test) |

**Checks:** tests/carrion_queen.test.ts 9 of 9 (the whole boss review of every move and her three deaths, from in front and behind; crisp; nothing cyan; nothing cut off; her size; her crown and mark; nothing under the rock); the full unit suite (`tsx --test tests/*.test.ts`), 1362 of 1362, on her final code (the two dev pages were changed after it started; no test imports them); `tsc --noEmit` clean, after. NOT RUN: the full regression; a real phone.

**The pictures** (in `shots/`): films `cq_walkfilm.gif` (sixteen frames a second), `cq_rakefilm.gif` (the rake, then struck), `cq_gustfilm.gif`, `cq_divefilm.gif`, `cq_callfilm.gif`, `cq_edgefilm.gif` (thirty a second), each with a contact sheet (`.sheet.png`); `eyrie_dive.png`, her dive's hang on the eyrie's phone screen; `cq_look.png` and `eyrie_world.png`, her look as approved.

**Next:** his answer to the moves; then floors 8 to 10.
