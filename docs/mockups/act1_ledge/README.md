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

NEXT: the Ledge Road's own pieces (a rope rail along the drop, the cult's things on the trail, and the rest of
its 25), then the Carrion Queen's brief (her peak looking out over the city).
