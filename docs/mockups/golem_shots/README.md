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
