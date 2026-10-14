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

## The vulture's walk and dive (14 Oct; his yes to both, by 12:17; behind `VULTURE_ON`, off)

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
| Movement 8: feet grip the floor | Its feet never land: in the air all the round, the lowest foot point 10.5 picture pixels above the floor at the strike (test) | Pass: a flier is the exception, by his yes ("Yes, add it (Recommended)", by 12:17); Movement 8 now says so |
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

**Not yet:** its flinch and its death: drawn now, in the section below, for his yes.

**His answers, to the pop-up sent with the pictures (by 12:17):** the revised walk, "Yes, the walk as shown (Recommended)"; the dive, "Yes, the dive as shown (Recommended)"; a flier as an exception to "Feet grip the floor", "Yes, add it (Recommended)", now in Movement 8 of docs/art/RULEBOOK.md (the copy in this repo; his living doc not yet edited by this chat). His "Yes" at 11:41 was to the walk as first shown, before the rulebook check.

**Next:** his answers to the flinch and the death (the section below). Then the cliff crawlers' brief; then her eyrie peak with the city view; then floors 8 to 10.

## The vulture's flinch and death (14 Oct; drawn for his yes; behind `VULTURE_ON`, off)

**What it does.** Struck in the air, it holds for a tenth of a second (the blow's freeze), then is knocked back: its head snaps up, its wings fling out wider than on its walk, its feet kick up, its eyes flash gold and fade by 0.40 s; it is back on its circling by then, from its walk's first pose, with no jump. Six of its feathers and five drops of its blood come off at the blow and are gone by 0.50 s. Its death: the same freeze and knock; then it is thrown back and over, its wings spread and its feet kicked up; it falls backward and lies on its back by 0.63 s; it gives a little on the landing and is still from 0.73 s. Its feet stay in the air the whole time (it is a flier: they never land, Movement 8). Its eyes go dark as it falls. A dead vulture has no pink edge: the rulebook's edge is for living monsters.

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
| Animations 1: as far as it will go | Head snaps up 40 degrees; the walk's pitch of 26.5 degrees snaps back 34 degrees; wings flung wider; a fall over backward to -90 degrees; a landing that bounces (tests on the numbers) | Pass by the numbers; his eye decides the notch |
| Animations 4: the warning and the hero stay in sight | The blood and feathers are small, for half a second, and cover nothing of the knight | Pass |
| Animations 5: power you can see | Its eyes flash gold at the blow and fade; they go out when it dies (tests) | Pass |
| How art is approved 1: pictures first | Behind `VULTURE_ON` (off) | Pass |
| How art is approved 6: checked at phone size | shots/vulture_phonedown.png, 844 by 390 (the game's size): the knight, the vulture struck, the vulture dead on its back | Pass (looked at; not on a real phone) |
| How art is approved 7: the boss review | A boss rule; the vulture is a small monster. Its tests cover the same points: feet, sinking, loose things, colours, crisp pixels | Not applicable |
| Movement 3 and 6; Animations 2, 3, 6 to 8 | Its flinch and death are not attacks, and a dead thing does not breathe; its standing picture is unchanged (checksum 1f9ac615...); the rest are judged by eye or do not apply | Pass or not applicable |

**The numbers, in seconds from the blow** (the picture's own clock; the game's speed for it is the main chat's to set):

- 0.00 to 0.10: the freeze. Its eyes flash gold; the shed feathers and blood begin.
- Flinch: 0.10 to 0.17, the snap (its head up 40 degrees; its pitch back 34 degrees, from 26.5 to -7.5); 0.17 to 0.40, back to its circling. The shed feathers and blood are gone by 0.50.
- Death: 0.10 to 0.20, thrown back and up (its body at its highest, 0.20, with its pelvis 40.8 picture pixels above the floor); 0.20 to 0.63, the fall: its pitch -20 at 0.20, -36 at 0.40, -56 at 0.50, -90 at 0.63 (on its back).
- Death, the ground: its eyes begin to go out at 0.46 and are dark by 0.68; its body first touches the floor at 0.59; the landing at 0.63; a bounce up 2.5 picture pixels at 0.68; still from 0.73 (every part, the chain and the tail with it).

**Its sound** (sound rule 7; the timings sent to the sound chat): flinch: the blow at 0.00; the wings rustle and snap from 0.10 to 0.17; the feathers fall to 0.50. Death: the blow at 0.00; the wings beat wide from 0.10; the fall from 0.20 to 0.63 (a rasp of the body going over); the landing at 0.63 (a soft heavy thud, the body gives); the bounce at 0.68; still from 0.73.

**Pictures, for him:** `shots/vulture_reel.gif` (the flinch, thirty a second, from in front and from behind); `shots/vulture_death.gif` (the death, thirty a second, from in front and from behind); `shots/vulture_phonedown.png` (844 by 390, the game's size). From src/dev/preview_vulture.ts: the hashes `reelfilm`, `deathfilm` and `phonedown`.

**Checks:** tests/ledge_vultures.test.ts 30 of 30 (fourteen new, for the flinch and the death: the freeze holds 0.10 s; the head snaps back; the flinch ends on the walk's first pose; a key a thirtieth of a second and ends at 0.40 s; the eyes flash and fade; the shed lasts half a second and comes only in the flinch and the death; the death: a key each frame, ends at 1.00 s; ends on its back, feet up; never sinks; its feet stay in the air; its body only falls; its wings lie back, not over its head; still from 0.75 s to its end; no fire light at its end). tests/new_mobs3.test.ts 8 of 8. The other 11 test files that use the mob kit: 125 of 125. tsc clean. The standing checksum unchanged (1f9ac615...7faf). The standing, walk and dive pictures identical to HEAD on 190 frames, both views. NOT RUN: the full unit suite, the full regression, a real phone.

**Notes for the main chat** (not in the game; nothing of the vulture is):
1. The game's die clip runs at `DEATH_FPS`, 20 a second (src/art/mkit.ts, used for a monster's death clip; boss_checks.ts too). The vulture's death is drawn at 30 a second, by the rule "attacks and moves 30". A vulture that came in through the mob set's die path would play its death at 20. Nothing else is changed here: the other monsters keep their rate.
2. The flinch and the death start on the walk's first pose, which is in flight. The game must enter them from the walk's own phase (or blend in), or they will jump.
3. The death uses `deathOfMob` (no pink edge, no pool of light). `dyingMoment` (src/art/new_mobs3.ts) now sets `trails` when a dying move has a `trail`; no other monster sets one. `momentOf` is exported, with no change of behaviour.
4. The living rulebook (his claude.ai doc) is not edited by this chat; the copy in this repo carries the walk, dive and flier rules.

**His answers:** not yet. The pictures are sent with the pop-up.

**Not yet:** nothing of the vulture is in the game. Its flinch and death wait for his yes; then the vulture comes into floor 7 whole, with its mobs and its films.

**Next:** his yes to the flinch and the death; then the cliff crawlers' brief; then her eyrie peak with the city view; then floors 8 to 10.
