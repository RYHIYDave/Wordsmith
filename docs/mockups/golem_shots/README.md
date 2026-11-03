# The Golem's charged shots (the art chat's helper, 31 Oct 2026)

Branch `art/golem-shots`, from `origin/heroes6` at 2739a49 (the main chat's Golem: as fast as she runs, always closing to
fight up close, its cannon off). PICTURES AND MOVES ONLY: nothing of the game imports any of it (a test proves it). The
main chat brings it in, on his yes.

## His words (exact, with their times, from the art chat)

- 30 Oct, 23:55: “The golem needs work.  It’s too slow and not aggressive enough.  It needs to run at the enemies.  Maybe
  scrap the ranged shot for now, but hold onto it because maybe we want a passive that makes him ranged where his hold
  becomes a big charged shot.  And maybe his look needs a little work.  I don’t know.  His hold currently has a hard time
  hitting because he’s so far back.  I’m going to test him first with the new speed and aggression but we may need to add
  his own bomb jump with the slam for hold to really get him in range”
- 31 Oct, 00:00: “Also draw a hold for the big charged shot.  And get that to the game chat with the new passive”
- Asked which shot (offered: “Brace, charge, huge blast (Recommended)” or “A charged beam”): “Damn I want both.  Can we get
  a way to have the constructs have a solid shot(more dex based) or energy weapons(more int based). Or is all that too
  much for a single character”
- Told: one talent on her tree makes the Golem ranged, its arm picked as the Ranger picks a companion: the CANNON (solid
  shot, Dexterity), its hold the braced huge shell; the TESLA COIL (energy, Intelligence), its hold the charged beam.
  Asked “Is that it?”: “Yes, one pick, two arms (Recommended)”.

So: two holds, one for each arm. Both drawn here.

On the first pictures (4545823), asked “Are those the two?”: “Close, change something”; asked what: “I don’t like the steam coming from the gun.  I like it from the stove pipes that’s nice”. So the steam out of the gun's vents is off (`GUN_STEAM.on` false in `src/dev/golem_charge_fx.ts`): its stove pipes still hiss as it charges and burst as it fires; the smoke out of the cannon's mouth after the shot, and off the coil after the beam, is kept. The pictures made again (and the sheet's close-ups framed to show its braced fist).

On those (75c15cd), asked “Are those the two charged shots?”: “Yes, that's them (Recommended)”.

## The pictures (`pictures/`)

- `golem_shots.mp4` (1200 wide, captioned): each charged shot at game scale with the Tinkerer beside it and three cultists,
  from in front and from behind (the shell bursting among them; the beam through a line of them), her hold held a second
  at full charge before it fires; then each strike at half speed; then a closer look at each charge (four times as big).
- `golem_shots_sheet.png`: key frames of both, close up, and each at game scale.

## The moves (`src/dev/golem_moves.ts`, after the main chat's own moves; frames are 30 a second)

THE WIND-UP, THE SAME FOR BOTH (`GCHARGE`), by his rulebook's Movement 9 (a big wind-up held and readable, the strike a
flash, a big wind-down). It heaves its giant fist up and slams it down on the floor before it (planted at frame 8); its
giant arm's foot steps back and its gun side's foot forward, one at a time, and dig in (by frame 12); its boiler body sinks
and hunches into the shot; its gun arm comes down DEAD LEVEL at what it fires at (frame 12). Then it CHARGES (frames 12 to
27): the cannon's two hoops and its muzzle's band light up one by one in the friend's cyan, breech to muzzle; the coil's
windings light up from its foot to its tip, arcs crawling up it; light gathers at the gun's mouth, motes of cyan spiralling
into it from further and further out; steam jets from vents either side of the breech (or housing) and hisses up out of its
stacks, harder and harder; a ring of cyan runs round it on the floor and grit hops up off the floor round its feet; the
whole Golem shudders harder and harder. At frame 27 a flash at its full (the hoops and coil white-hot).

THE LOOP (frames 30 to 35, `GCHARGE.loop`, `GCHARGE.round` = 6): at its full it shudders on (a heave and a rattle), the gun
pulsing white-hot, the light gathering, the steam jetting. Pose and effects are the same each round, whatever the time;
the game plays these six frames round and round as long as her hold lasts. Its first hold-able frame is 30: the build-up
is 1.0 s.

LET GO: it fires at frame 36 (`GCHARGE.fire` = loop + round). Frame 36 shows the same body as frame 30, so the game may
go to 36 from any frame of the loop the moment she lets go (the loop's frames differ only by the shudder, a pixel or two).
`chargeFrame(t, held)` gives the frame to show `t` frames after her hold began, let go after `held` frames.

1. THE CANNON'S CHARGED SHOT (`GCHARGE_SHELL`, `golemChargeShell`, the cannon arm).
   - STRIKE, frames 36 to 38: one HUGE shell out in a great cyan burst (a white heart, long cyan tongues, a ring of air
     blown out round the muzzle), the recoil throwing its body back in two frames, its cannon kicked back up its arm.
     Smeared: the shell's after-images and trail, and (in the film) an after-image of the Golem in dark cyan where it
     stood, for two frames.
   - RECOIL SKID: 1.0 tile straight back from what it fired at (`CHARGE_SKID.shell`), from frame 36 to frame 48, all at
     once and easing out (`chargeSkid('shell', f)`: 0.23 tiles after one frame, 0.42 after two, 0.70 after four). THE GAME
     MOVES IT; its picture stands where it stands, its fist and feet skidding with it (dust kicked up off them).
   - WIND-DOWN: rocked back (frame 38), it rocks forward (53) and settles (58); smoke rolls out of the barrel and then
     curls up off it; the vents cool and the hoops go dark again from the muzzle back (by about frame 66); it steps its
     feet back under it (58 to 69), lifts its fist (62), raises its cannon and stands as it was (72). Done at 76.
   - THE SHELL (`dev/golem_charge_fx.ts`, `SHELL_FX`): 20 tiles a second (`SHELL_FX.speed`; the old shot's was 16), straight
     out of the level barrel and dropping as it goes, landing where it was aimed: frames of flight = round(tiles / 20 x 30);
     5 tiles is 8 frames. Iron, long, banded in cyan, a cyan trail behind it.
   - THE BLAST where it lands: radius 2.5 tiles (`SHELL_FX.blast`; the ground pound's ability radius is 2.4). A white-hot
     flash; a dome of cyan fire boiling up; a ring of light and dust racing out over the floor to its full 2.5 tiles in 5
     frames; stone flung up; tongues of cyan fire; a column of smoke; a scorch on the floor with glowing cracks, cooling and
     fading. All gone 40 frames after it lands (`SHELL_FX.long`). Cyan and white, grey smoke and stone: no pink, no gold.
2. THE TESLA COIL'S CHARGED BEAM (`GCHARGE_BEAM`, `golemChargeBeam`, the tesla coil arm).
   - STRIKE, frames 36 to 38: a THICK cyan BEAM blazes out of the coil's ball, two-thirds of its length on frame 36, all of
     it on frame 37; its body rocked back in two frames.
   - THE BEAM (`BEAM_FX`): 8 tiles long from the ball (`BEAM_FX.long`); it strikes a band of the floor 1.0 tile wide
     (`BEAM_FX.wide`); drawn 0.55 tiles thick at its full (white-hot heart, cyan body, writhing edge, arcs coiling along it,
     a splash of light where it ends). AT ITS FULL from frame 36 to 46 (one third of a second), every enemy along it
     struck; it thins to threads of lightning from 46 and is gone at 54.
   - PUSHED BACK: 0.5 tile straight back while it pours (`CHARGE_SKID.beam`, frames 36 to 54, easing out; the game moves
     it), shuddering against it.
   - WIND-DOWN: as it thins it rocks forward (58) and settles (62); the coil spits and smokes as it cools (to about frame
     80); its feet step back under it (60 to 71), it lifts its fist (64), raises its coil and stands as it was (74). Done
     at 78.

Everything is drawn from in front and truly from behind (turned 45 and 135, as the game draws the Golem).

## Bringing it in (the main chat)

- New: `src/dev/golem_charge_fx.ts` (what the shots throw off, painted at the picture's grain as `golem_gun_fx.ts` is:
  `chargeFx(kind, layers, at, frame, time)`, laid with `layFloor` under what stands and `layAir` over it);
  `tests/golem_charge.test.ts`.
- Added to `src/dev/golem_moves.ts` (after the main chat's moves, nothing of theirs changed): `GCHARGE`, `GCHARGE_SHELL`,
  `GCHARGE_BEAM`, `GCHARGE_STRIKE`, `CHARGE_SKID`, `chargeSkid`, `chargeOf`, `chargeFrame`, `golemChargeShell`,
  `golemChargeBeam`. Each pose carries `aim`, `kick` (as `golemCannon`'s do) and `charge`, `gunLevel`.
- `src/dev/sculpt_golem.ts`: `sculptGolemBuild` takes two more, last and optional: `charge` (0 to 1: the hoops or windings
  lit) and `level` (0 to 1: the gun brought down dead level); pass the pose's `charge` and `gunLevel`. Both default to 0,
  and then every picture is as it was, to the pixel (checked: the cannon, the coil and the pincer arm, eight turns, both
  views, through its cannon attack and its walk, the same before and after). Also new: `GOLEM_VENTS` (where its gun's
  vents are, for the steam), set as `GOLEM_MUZZLE` is.
- `src/dev/preview_golem_moves.ts`: `#shell:45:4:2` and `#beam:45:4:2` show them frame by frame.
- In the game (art/tinkerer_art.ts `golemClip`), each would be a clip of its frames with the loop's six played while her
  hold is held (`chargeFrame`), the game moving the Golem back by `chargeSkid` after it fires; the shell's flight and
  blast, or the beam, from `chargeFx`. The numbers above (speed, radius, length, width, skid, timings) are where the art
  is drawn to; what they do (damage, Dexterity or Intelligence) is the main chat's and his.

## The checks (`tests/golem_charge.test.ts`, all passing)

- Every frame of each, from in front and behind, turned eight ways: crisp, the friend's cyan edge, no pixel alone, nothing
  pink, nothing cut off; nothing sunk into the floor and standing on it (one foot or its fist always down); its giant arm
  and its gun arm never through the rest of it.
- Slick (nothing leaps, stalls or turns straight back at speed: its fist, its eye, its gun's mouth) through the wind-up,
  the loop played round twice and let go part way round, and the wind-down, but for the fist's slam and the strike (each a
  flash, Movement 9). Its fist braced still on the floor from its slam to its lift; its feet still from frame 12 till they
  step back. The loop's body the same each round.
- Its effects, every frame, from in front and behind: crisp, nothing pink or gold, nothing cut off, the friend's cyan at
  the full flash and at the strike, the loop's the same each round, all gone when done.
- Its numbers: the skids exactly 1.0 and 0.5 tiles, never faster than the frame before; the blast's ring as wide as 2.5
  tiles round where it lands; the beam out to its 8 tiles.
- Nothing of the game imports it.

## For him to decide

- Whether the charged shot should fire early if she lets go before it is full (here it must reach frame 30, 1.0 s).
- The skid: 1 tile for the shell, half a tile for the beam.
- The blast's 2.5 tiles and the beam's 8 by 1 tile: numbers for the main chat to try in the game.

## Game-ready pieces (`src/art/golem_shots_fx.ts`, the art chat's helper, 31 Oct 2026)

Asked for by the main chat (its words: “If you would make game-ready pieces of them (sprites a frame, a shell's blast at
its place, the beam along a line of any length), I lay them in.”). THE SAME PICTURES AS THE FILMS, nothing redesigned: each
piece is painted by the art's own strokes (`dev/golem_charge_fx.ts`, `dev/contraption_shots.ts`; four of the former's
painters, `charging`, `bigBurst`, `shellFlightFx` and `beamFx`, are now exported, nothing in them changed), on a canvas of
its own at the game's grain (2 picture pixels a game pixel, as `render/tinkerer_fx.ts` lays her effects), its anchor a point
of the floor the game already knows. Every list is `lazyFrames` (painted when first asked for), frame `k` = the k-th
thirtieth of a second. Lay each with `drawSprite(g, s, Math.round(wx(c, x, y)), Math.round(wy(c, x, y)))` at its anchor.
`floor` lists go under what stands (drawGround), the rest over it (drawAir).

`view` is the Golem's picture's (`'back'` when `g.fx + g.fy < -0.2`, as render.ts picks it) and `flip` is render.ts's
`turned` (`g.fx - g.fy < 0`); for the Contraption the same with its own `c.fx, c.fy`. Tiles are the game's; `up` is game
pixels.

| Function | Arguments | Anchor | Frames |
|---|---|---|---|
| `golemChargeFx(view, gun)` → `{ floor, air }` | `gun` `'cannon'` or `'tesla'` | THE GOLEM'S OWN FLOOR POINT, as its picture (`golemCharge(view, gun)`); flip it with `turned(g.fx, g.fy, s)` as its picture is | index = `chargeFrame`'s frame `f` (the same number render.ts already shows the Golem at), 0 to `CHARGE_FX_LAST[gun]` (82; past the move's end, 76 or 78, only the last wisps of smoke). Nothing before frame 12 (aimed). The loop's frames 30–35 are the same each round. |
| `golemShellFlightFx(view, flip, dx, dy, frames?)` → `{ frames, n }` | landing `dx = e.x1 - e.x0`, `dy = e.y1 - e.y0` (the `golemCharged` event); `frames` = `Math.round(e.flight * 30)` so it lands as the game's blast goes off (left out: the art's 20 tiles a second from the mouth) | the Golem's floor point AS IT FIRED (`e.x0, e.y0`) | `n + 4`: k = 0 the frame it fires; it lands at k = n − 1; its trail gone by n + 3. Out of the cannon's mouth (its point at the shot baked in), turned to its heading, smeared, its cyan trail. |
| `golemShellBlastFx(r?)` → `{ floor, air }` | `r` tiles (2.5 as approved; the game's weaker shots' `e.r` painted to the half tile, 0.5 to 2.5) | where it lands (`e.x1, e.y1`) | `SHELL_FX.long` = 40 from landing: flash, dome, the ring out to `r` in 5 frames, tongues of fire, stone, smoke column; `floor` its scorch and glowing cracks, cooling. |
| `golemBeamFx(view, flip, dx, dy, up?)` → `Sprite[]` | its end `dx = e.x1 - e.x0`, `dy = e.y1 - e.y0` (any heading, any length, up to 8 tiles from the coil's ball); `up` its end's height (11 game px, as the film) | THE GOLEM'S FLOOR POINT AS IT IS DRAWN THAT FRAME (it skids back half a tile as the beam pours, and the beam with it, as in the film; with only the event's point, add `golemSkid('tesla', k)` tiles back along `-g.fx, -g.fy`) | `BEAM_FRAMES` = 18 from the shot: two-thirds out at k = 0, all of it at k = 1, at its full to k = 10, thinning to threads, gone at k = 18. Drawn 0.55 tiles thick, from the coil's ball (its point each frame baked in). |
| `contraptionBombBlastFx(r?)` → `{ floor, air }` | `r` tiles (2.0 as approved) | where the bomb goes off | `BOMB_FX.long` = 36. |
| `contraptionBoltFx(view, flip, dx, dy, up?)` → `{ frames, n }` | what it hits, `dx = e.x1 - e.x0`, `dy = e.y1 - e.y0` (`contraptionBolt`); `up` 12 game px (a chest, as the film) | the Contraption's floor point (`e.x0, e.y0`) | from its firing: the flash at its ball, the bolt (30 tiles a second) at what it hits at k = n, crackling 14 frames, its ball spitting and smoking; `frames.length` all of it. |

Also: `golemMuzzle(view, gun, f, flip)` (its gun's mouth from its floor point: `x`, `y` tiles, `up` game pixels, at any
frame), `golemSkid(gun, k)`, and `paintAhead(lists, ms)` (paints frames not yet painted, within `ms`).

LAYING THEM AS THE FILM DOES: floors first; the Golem; its `air`; the shell's flight over it, but for the shot's first two
frames (k 0 and 1, the shell still inside the great burst at its mouth: lay the flight under the Golem's air then); the
blast's air last. The beam over the Golem's air.

PAINTING COST (node, one CPU): everything at the Golem about 10 ms a frame; the shell's blast about 60 ms a frame (some
2.5 s for its 40 frames), the bomb's about 33 ms (1.2 s for 36): the art's own blast is that heavy. Each is kept once
painted (the blast per half tile of radius). Paint the blast ahead, e.g. `paintAhead([b.floor, b.air], 6)` each frame
while the Golem charges or once her pick is made, so that none is painted as it is shown. The flight, the beam and the
bolt are painted per shot (their line is the shot's own), a few ms a frame.

WHERE THE POINTS COME FROM: the Golem's gun's mouth and way, its coil's foot and tip, its stacks, its feet and fist at
every frame from 12 to its end, and the energy Contraption's ball as it fires, are baked into
`src/art/golem_shots_points.ts` by `tools/bake_golem_shots.ts` (from the sculpture, as the films measured them:
`tests/golem_shots_measure.ts`), so the game does not sculpt the Golem twice. The test sculpts them again and checks every
number; if its moves change, run `npx tsx tools/bake_golem_shots.ts`.

WHAT IS NOT QUITE THE FILM:
- The grain of the steam, the smoke, the blast's dome and tongues of fire and its scorch: the art draws them from where on
  the picture (and the floor) they are, so a piece painted on its own canvas has its own grain (the same size, shape,
  colours and timing). Every light of every piece is the art's own, light for light (checked against `chargeFx` at every
  frame).
- Where two pieces cross, the later laid is on top; in the film all was one picture, its light over all its smoke (the
  shot's two frames are handled by the order above; the shell's trail running into its blast's smoke is the one left).
- The energy bolt's ball: its smoke and spitting come from the ball as it fired (in the film from the ball as drawn each
  frame, a pixel or two as the mortar kicks). The game draws the Contraption without its shot pose; the ball is the art's.
- The gun's own vents' steam is off by his word (`GUN_STEAM`); none is drawn (the test fails if it is turned on).

THE CHECKS (`tests/golem_shots_fx.test.ts`, all passing): the baked points the sculpture's own; everything at the Golem,
every frame of both guns from in front and behind, crisp (no pixel half there, none alone), only the friend's cyan glowing
(no pink, no gold), nothing cut off, nothing before it aims, gone after its last, a great flash at its full and at the
shot, the loop's frames the same each round (and as the art paints them ten rounds on); from the shot on, its pieces with
the shell's flight and blast or the beam are `chargeFx` light for light at every frame; laid as the game lays them, the
pictures are the film's at the same moment (the cyan where the film's is, as many pixels); the beam, the shell and the bolt
at 16 headings and every length from 1 to 8 tiles, in front and behind, every frame crisp, cyan, not cut off, gone when
done, turned over the mirror of itself, the beam out to its end, the shell landing where aimed, the bolt crackling on what
it hits; the blasts (2.5, 1.5 and the bomb's 2.0) every frame, their ring as wide as their tiles, the shell's pixel for
pixel the art's; the numbers the game's (`TINKER_TUNE`: shell 20 tiles/s and 2.5, beam 8 by 1, bolt 30 tiles/s) and the
Golem and Contraption turned as the game turns them. `tests/golem_charge.test.ts` and `tests/contraption_shots.test.ts`
list `src/art/golem_shots_fx.ts` among the game's files that may take them.

`pictures/golem_shots_gameready_sheet.png`: each piece's key moments, the film's picture beside the game-ready pieces laid
as the game lays them; and the pieces at other headings (the Golem turned over, from behind, the bolt up and to the left).
