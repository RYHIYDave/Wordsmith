# Floor 5: the temple's door and its two key-bearers

Made by the Brawler switch chat (13 Nov 2026) on its branch design/f5-temple-door, cut from main 2a3f5119 (25.3.16). Everything is behind
`TEMPLE_DOOR` (art/temple_door.ts), off, until his yes to it in play.

## His words

- His idea, 13 Nov 2026 (asked whether to start a new task): “I want The the moment when you enter the temple from the line in level five
  to be an event when there’s a gate, the gate is locked. There’s two many bosses with keys you kill both of them you collect the two keys
  and then you unlock two chains across the door that then open the way into the temple”. Read as: “the line” is the mine; two mini-bosses.
- Who carries the keys: “I think just like a souped up version of the dagger cultist and a super version of the plane cult that makes
  sense flame fire cultist”. The door: “Great black stone doors (Recommended)”.
- The dagger key-bearer's attacks: “The leap and the stab, a thrown dagger ranged attack”. The fire key-bearer's: “Fire fan and fire
  ring, plus a bigger version of the regular mob attack” (the cultist's fire sigil, bigger).
- Their brief: “Head taller, broad, menacing (Recommended)”; “Bone mask / burning robe (Recommended)” (offered as: the dagger one a bone
  mask and a bandolier of throwing knives, the fire one his robe's hem always burning and a crown of flame, both the key on a chain at the
  hip); “Key rings to the floor (Recommended)” (offered as: each falls as their cultists do, the key's chain snaps and it drops ringing to
  the floor, glinting until picked up).

## Made so far

- THE DOOR (art/temple_door.ts): two leaves of the temple's black stone in the threshold's way, sculpted as solids that turn truly as they
  swing into the temple; the way's head closed over them with dressed stone; two chains crossed over them, each from a ring high in one
  jamb to a staple low in the other, a padlock on each, its keyhole the enemy's pink; the door glowing the cult's pink while barred so it
  is seen across the mine's dark. Unlocked: each key turns, the keyhole flares, the shackle springs, the chain falls link by link into a
  heap at the door's foot, the lock with it; then the leaves swing open, the floor shaking.
- ITS RULES (game/temple_door.ts): set in floor 5's threshold (a floor with none is laid again from the next seed); its three tiles wall
  to everything until it opens; the first time he comes near, a line: “Two chains bar the temple's door. Its keys are carried in the
  mine.” (or how many he holds); with both keys, the unlocking (TEMPLE_TIMES: the chains at 0 and 1.1 s, 1.5 s each; the leaves from 2.9 s
  for 1.6 s); then the way is open.
- Pictures from the game itself (tools/scenarios/temple_door_look.mjs): pictures/door_barred.png, pictures/door_opening.mp4.

- THE TWO KEY-BEARERS' LOOKS (art/key_bearers.ts), his yes 13 Nov 2026 (“Yes, film their attacks (Recommended)”) to
  pictures/key_bearers_look.png: the dagger cultist and the fire cultist each a head taller (KEY_K, 1.24, the whole figure from its floor
  point), beside the Brawler. THE KEYBEARER OF THE KNIFE: a bone mask in his cowl, its eye slits pink; a bandolier of throwing knives over
  his shoulder, front and back; a heavier wavy blade of bone; the brass key on its chain at his hip. THE KEYBEARER OF THE FLAME: the
  cultist's rig in a long robe to the floor, its hem always burning, embers going up; a crown of flame over his cowl; fire over his open
  hand; his sleeves to his wrists; the brass key at his hip.
- THEIR MOVES (art/key_bearers.ts), each by Movement 9 (a big wind-up held, the blow in a frame or two, a big wind-down):
  - The Knife: THE STAB (the dagger cultist's frenzy, grown: his basic blow); THE LEAP (the dagger cultist's leap and plunge, grown); THE
    THROW, his own (KB_THROW): a knife drawn from the bandolier, held back by his ear glinting (the warning), flung in a frame.
  - The Flame: THE GREAT SIGIL (his basic blow): he traces the ring in the air with his burning hand as it burns onto the floor under you,
    raises both hands, the fire between them swelling, and flings it down: the fire cultist's sigil at a ring of 2.5 tiles (his is 1.75).
    THE FAN: the fire in his left hand swells to a ball as he draws it back, and he sweeps it across: three balls of fire, 22° apart. THE
    RING: both hands high, a ball of fire swelling over his head (its reach marked round him in pink, pulsing faster), then down on one
    knee striking the floor: a ring of fire runs out from him to 5 tiles, striking as its edge passes (a roll goes through it).
  - Each falls as his cultist does; the key is torn off as he is struck dead and tumbles ringing to the floor beside him, glinting, its
    light on the floor, until he walks onto it.
- THEIR RULES (game/act1_rules/keybearers.ts; pictures as the game holds them, art/act1_figs/keybearers.ts; what they throw and drop,
  art/key_bearers_fx.ts drawn by render/act1_fx/keybearers.ts): in the two rooms of the mine farthest from the start and from each other
  (side branches, guardians' and elites' first: game/temple_door.ts keyBearerSpots), the Knife in one, the Flame in the other, each a
  mini-boss as hard for its floor as the Stoker is for his (game.ts keyBearers); a room's guardian gives way to him, its others stay. The
  key taken: “A key to the temple door. 1 of 2.”, “Both keys. The temple door awaits.”; at the top of the screen once he knows of them,
  TEMPLE KEYS n / 2 and a key for each, brass if held.
- Films from the game itself (tools/scenarios/key_bearers_film.mjs, cut by tools/key_bearers_cut.py): pictures/key_bearers_film.mp4.

## Still to make

- His yes to their moves in play; then the whole event filmed, from the first bearer to the temple opening; then the switch on.
