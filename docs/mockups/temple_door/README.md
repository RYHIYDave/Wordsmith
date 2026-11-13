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

## Still to make

- The two key-bearers: their looks (standing, front and back, beside the Brawler), then each attack on film; then their rules, the keys
  dropping and picked up, the count on the bar; then a film of the whole event in play, for his yes.
