# The Warlock's builds

Asked after the Brawler's builds whether to go on to the Warlock, the second weakest: “Yes, the Warlock next”.

His words on the plan:
- “Well you can also go all in on burns, then take the talent that gives you more damage when your pact is full and never
  transform.  Thats a play style.  We need an all in demon play style.”: Embrace added.
- Blood Pact (attacks paid in life): “attacks don’t cost. Okay, so what is the cost for blood pact?”, then his pick “Drop Blood
  Pact”.
- Embrace made not to be what the Unsigned Pact (his unique) already does: “Yes, build those three (Recommended)”.
- “And I’d like his talent tree to look a little better”: his tree laid out again as a claw.
- After the tree's before and after, the cards and the film: “Yes, switch them on (Recommended)” (by 13:54).

## What is in it (godot/scripts/heroes/warlock_builds.gd, on)

| Path | Talent | Card |
|---|---|---|
| Pact | Embrace | As the demon, every kill fills the pact back to full: the demon lasts as long as you keep killing. |
| Demon | Devour | As the demon, your rake devours an enemy below 20% life: it dies at once, you heal 5% of your life and the pact gets 2 seconds back. A boss takes triple damage instead. |
| Man | Soul Link | Cursed enemies are linked: 25% of the damage you deal to one is dealt to every other cursed enemy. |

The all-in demon build: Embrace, Devour, Feast, Hellhide (and with the Unsigned Pact, the demon feeds on his life when the
killing stops). His tree: a palm (Blazing Arm), a thumb above and below (the demon's and the man's first talents), three talons
fanning out (demon, pact, man), each ending in its biggest talent; the twigs off the outside of their own.

## Checked

`xvfb-run -a godot --path godot --rendering-driver opengl3 -- --only=wbuilds --shots=<dir>`: 11 of 11 (the three in his tree and
the claw's layout; Soul Link's share to the other cursed, none to one uncursed, none without it; Devour killing one at 15%, the
heal and the pact's time, one at 60% only raked, a boss struck three times over; Embrace filling the pact, only Hunger's time
without it). `--only=deftal` (the defence talents, the Warlock's among them): 27 of 27.

Pictures: tree_before_after.png, warlock_builds_cards.png, warlock_builds.mp4 (9 s).
