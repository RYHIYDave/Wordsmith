# The Contraption's two new kinds: little bombs and energy bolts (the art chat's helper, 31 Oct 2026)

Branch `art/golem-shots`, after the Golem's charged shots (5e8be5a). PICTURES AND MOVES ONLY: nothing of the game imports any
of it, and the game's Contraption is unchanged: it still lobs her vials (a test proves both). Her own Vial Toss stays vials.
The main chat brings it in, on his yes.

## His words (exact, with their times, from the art chat)

- 31 Oct, 00:00, on the Golem's charged shot, asked which (the braced huge shell or the charged beam): “Damn I want both.  Can
  we get a way to have the constructs have a solid shot(more dex based) or energy weapons(more int based). Or is all that too
  much for a single character”. Told: one pick on her tree, the Golem's arm chosen as the Ranger chooses a companion; asked
  “Is that it?”: “Yes, one pick, two arms (Recommended)”.
- 31 Oct, 00:04: “And have the same option when swapping vial to contraption”. Read as (told him so): the same choice for the
  Contraption when it takes the place of her Vial Toss on her tree: a solid shot (Dexterity) or energy (Intelligence).
- Asked what the energy one should do (offered: “Tesla turret, chain zap (Recommended)”: the walking Contraption with a
  crackling tesla coil in place of its vial hopper, zapping the nearest enemy, the arc jumping on to two more; or “Energy
  bolts”: cyan energy bolts at range, one at a time): “Energy bolts, and let’s make the contraption throw little bombs.  She’s
  marketed as a demolitionist and we need to fit that in better”.

So: its solid kind throws LITTLE BOMBS (in place of vials); its energy kind fires CYAN ENERGY BOLTS at range, one at a time.
Both drawn here, on the tripod mortar he picked (24 Oct, “1. Tripod mortar”).

## The pictures (`pictures/`)

- `contraption_shots.mp4` (1200 wide, captioned, 25.6 s): each kind at game scale beside the Tinkerer and three cultists, from
  in front and from behind (two bombs thrown, each bursting among them; three bolts, one at each cultist in turn, the
  Contraption turning to each); then each throw at half speed (in front); then a closer look at each (six times as big), in
  front and from behind.
- `contraption_shots_sheet.png` (1200 wide): each kind's throw close up (four times as big), in front and from behind, and two
  frames of each at game scale (the bomb lobbed and going off among them; the bolt, and its hit).

## What each is (`src/dev/sculpt_contraption.ts`, ammo `'bombs'` or `'energy'`; frames are 30 a second)

THE BOMB CONTRAPTION: the tripod mortar as he picked it, its magazine of vials on its back swapped for a brass tray with
three LITTLE BOMBS piled in it (two, and one on them): round black iron, each with a brass cap and a short fuse.

THE ENERGY CONTRAPTION: the same tripod, its copper mortar swapped for a little TESLA COIL on its trunnions, as the Golem's
(a brass housing, a steel collar, a coil of copper wound tight, a steel collar round it, a steel ring at its tip and a ball of
the friend's cyan in it), aimed lower than the mortar (a bolt flies straight); its vials swapped for a DYNAMO (a drum of copper
windings in a brass cradle, brass caps, a steel axle). Its coil's windings, and the dynamo's, light from foot to tip as it charges.

Both open, stand, are kicked and break exactly as the vial Contraption does (its springing open and its end are the same moves).

## The throws (`src/dev/contraption_shots.ts`), by his rulebook's Movement 9

1. THE BOMB THROW (`CBOMB`, `bombShot(f)`, 36 frames, the same picture at both ends as it stands):
   - WIND-UP, frames 0 to 18 (0.6 s): a bomb fed up its bore into its mouth (frames 0 to 6), its fuse lit and spitting her
     cyan sparks (from frame 5); it SQUATS down on its legs, its knees splayed, its mortar tipped back up 28 degrees, its crank
     wound round once (frames 2 to 13); it holds there low, trembling (13 to 18). Its feet never move.
   - THE THROW, frame 19 (and 20): in one frame it SPRINGS UP past standing and THUMPS the bomb out, its mortar tipped over
     forward and kicked down its barrel, a flash of cyan and a puff of smoke out of its mouth; smeared (the bomb's
     after-images, and in the film an after-image of it as it was, in dark cyan, for two frames).
   - WIND-DOWN, 20 to 36: it rocks down (frame 26) and up (31) and settles (36), smoke curling out of its mouth.
   - THE BOMB (`BOMB_FX`, `bombAt`): lobbed high (1.8 tiles over the line), tumbling, its fuse spitting, a thin smoke trail
     behind it; it flies 16 frames however far (as her vials do), comes down 0.35 tiles short with a puff of dust, hops on to
     where it was thrown (6 frames) and sits there fizzing a beat; IT GOES OFF 28 frames after the throw (`BOMB_FX.boom`), 47
     frames (1.57 s) after its wind-up began. It throws as far as her vials, 7 tiles (`BOMB_FX.reach`).
   - THE BLAST (`bombBlast`): radius 2.0 tiles (`BOMB_FX.blast`; her vials' 1.1). A white flash; a ball of the friend's cyan
     fire boiling up; a ring of light racing out over the floor to its full 2 tiles in 4 frames, its dust rolling after it;
     cyan shards and sparks flung out; stone chips and scraps of its iron casing flung up, falling and lying; tongues of cyan
     fire; a column of smoke; a scorch left, its cracks glowing and cooling. All gone 36 frames after it goes off
     (`BOMB_FX.long`). Cyan and white, black iron, grey smoke and stone: no pink, no gold.
2. THE ENERGY SHOT (`CBOLT`, `boltShot(f)`, 24 frames, the same picture at both ends):
   - CHARGE, frames 0 to 9 (0.3 s): it crouches a little and tips its coil back, its crank wound round, its coil's windings
     and its dynamo's lighting from foot to tip, arcs crawling up the coil, light drawn into its ball; A GLINT at its full
     (frames 9 and 10: a star of light).
   - THE SHOT, frame 11 (and 12): in one frame the bolt is out, a flash at its ball, its coil kicked back down its housing,
     its body jolted up.
   - WIND-DOWN, 12 to 24: it rocks and settles, its windings dimming, its ball spitting and smoking.
   - THE BOLT (`BOLT_FX`, `boltFlight`, `boltSprite`): a spindle of cyan light, white at its heart, little jags of lightning
     flicking off it, smeared back along its way with a fading trail; straight and fast, 30 tiles a second (one tile a frame:
     6 tiles in 6 frames), reaching 8 tiles (`BOLT_FX.reach`). One at a time, one enemy each.
   - ITS HIT: a flash on what it hits, shards and sparks flung off it, and it crawls with crackling lightning for 14 frames
     (`BOLT_FX.crackle`).

Everything is drawn from in front and truly from behind (the Contraption turned 315 and 45, as the game draws it).

## Bringing it in (the main chat)

- New: `src/dev/contraption_shots.ts` (the throws and what they throw off, painted at the picture's grain as
  `contraption_fx.ts` is: `CBOMB`, `CBOLT`, `CBOMB_STRIKE`, `CBOLT_STRIKE`, `bombShot`, `boltShot`, `ShotFrame`; `BOMB_FX`,
  `BOLT_FX`, `bombAt`, `bombSprite`, `bombBlast`, `bombFx`, `bombFxLong`, `boltFlight`, `boltSprite`, `boltFx`, `boltFxLong`;
  `ShotAt`, `shotLayers`, `layShotFloor` (laid under what stands), `layShotAir` (over it), `BOMB_IRON`, `BOMB_BRASS`,
  `BOMB_PX`); `tests/contraption_shots.test.ts`.
- `src/dev/sculpt_contraption.ts`: `sculptContraptionBuild` takes two more, last and optional: `ammo` (`'vials'`, `'bombs'`
  or `'energy'`; `ContraptionAmmo`, `CONTRAPTION_AMMO`) and `shot` (`ShotPose`: squat, tip, load, fuse, charge, wind; pass
  `bombShot(f).shot` or `boltShot(f).shot`, with its `.pose` in `CONTRAPTION_POSE`). Left out (`'vials'`, `NO_SHOT`), every
  picture is as it was, to the pixel (checked: 992 pictures, the tripod shut, opening, set up, kicked and broken and all the
  other builds, eight turns, both views, hashed before and after). Also new: `CONTRAPTION_SHOT_AT` (where the loaded bomb's
  fuse is, and the coil's foot and tip, set as `CONTRAPTION_MOUTH` is).
- In the game (art/tinkerer_art.ts `contraptionSet`), with the pick on her tree: `contraptionAt` passes the ammo; its `shot`
  clip becomes the frames of `bombShot` (0 to 36, the hit at `CBOMB.fire`) or `boltShot` (0 to 24, the hit at `CBOLT.fire`);
  its tumble, opening and broken clips pass the ammo too. What it throws leaves `CONTRAPTION_MOUTH` (turned) at that frame:
  a bomb (`bombAt`, `bombSprite`) that goes off `BOMB_FX.boom` frames later (`bombBlast`, the damage then, within
  `BOMB_FX.blast` tiles), or a bolt (`boltSprite`) that hits `boltFlight` frames later. The game's Contraption fires every 38
  frames now (TINKER_TUNE.contraption.every); both throws fit in that (36 and 24). The numbers above are where the art is
  drawn to; what they do (damage, Dexterity or Intelligence) is the main chat's and his.

## The checks (`tests/contraption_shots.test.ts`, all passing)

- Every frame of each throw, from in front and behind, turned eight ways: crisp, the friend's cyan edge, no pixel alone,
  nothing pink, nothing cut off; nothing sunk into the floor and standing on it; its feet where they bit the floor, every frame.
- Each kind thrown down (shut), springing open, set up, kicked and broken: the same checks, eight turns, both views.
- Slick through the wind-up and wind-down (its mouth and its body never leap), but for the strike, which is one frame (two at
  the most) and moves it; its first and last frames the very picture of it standing.
- What they throw off, every frame, from in front and behind: crisp, nothing pink or gold, nothing cut off, a great flash of
  the friend's cyan as it throws, all gone when done.
- Their numbers: the bomb down at the end of its flight, gone off where it was thrown, its blast as wide as 2.0 tiles; the
  bolt's flight by its speed, within its reach.
- Every picture of the Contraption as it was, to the pixel; and nothing of the game imports any of it or asks the
  Contraption for anything but its vials.

## For him to decide

- The bomb's beat: it sits fizzing about a fifth of a second before it goes off (28 frames from the throw to the blast; 47 from
  the start of its wind-up). Shorter makes it surer to hit; the 2-tile blast is there to make up for it.
- Its fire: her bombs burst in her cyan fire, as her blast jump's bomb does (a friend's blast: no gold). An orange fire is
  possible if he would rather.
- From in front, its coil points at the eye and is seen end on (its ball and its dynamo); from behind it is seen side on.
- How fast the energy kind fires: drawn to fire every 24 frames at the quickest; the game's Contraption fires every 38.
