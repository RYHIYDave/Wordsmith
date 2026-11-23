# His damage, one look each (23 Nov 2026)

His words: “Okay, I want you to look at all lightning in the game and see if it's the gold bolts or Lightning's bolts.  Same with
fire, same with ice, same with poison, same with power.  I want consistency with my damage.  The damage melds are a little
different so they can have a different flair if it seems applicable.”

Every place his damage shows was gone through: the words (fx.gd, fx_words610.gd, fx_wakes.gd), Rank II words, all the melds
(the ten damage melds fx_melds3.gd, Volatile's five fx_volatile3.gd, the eight fx_melds8.gd, the 98 new ones), the five classes'
moves and talents (heroes/), the uniques (fx_uniques.gd), and monsters carrying his words (foe_words.gd). Lightning's own bolt
(fx.gd ground_bolt, sky_bolt: fx_looks.json VOLT, white at the heart, yellow-gold at the edges) is the measure.

Found and fixed, behind fx_m52kit.gd OWN (the same switch as docs/mockups/words_own), off until his yes:
- The damage melds' looks (fx_melds3.gd owns_event, event) took every arc and blast tagged with any meld (melds.gd tag; wakes.gd
  and monsters.gd _melded). An arc of a meld they did not know they drew in Thunder's violet (arc_look's fallback): all the arcs
  of the nine new Lightning melds (Static, Jolt, Fulgurite, Quicksilver, Conduit, Overcharge, Seeker, Tempest, Stormfront), from
  his moves, their storms and monsters carrying them. The blast of a rune a new Volatile meld leaves behind they took and drew
  not at all. With OWN on they take only their own melds' (`mine`: RAMP); the rest are their words' own.
- The new melds' own ice and fire (fx_m52kit.gd ICE, FIRE) are Frost's and Flame's own colours (`set_own`).

Already right, kept as flair, and his two calls (the Tinkerer's cyan lightning, the Warlock's cyan hellfire): damage_looks.html,
https://claude.ai/artifact/7TuEgfdHdxS5GRbr9LFq5Q

## The same whatever the source (his next words)

“Like bosses are probably unique cases.  But if a bolt of lightning is going to bounce between things from different sources,
I'd like them to be the same.  Or anything frozen should be frozen in the same way.  Burning same thing”. And “You said gold
bolts not me”: “gold bolts” was this chat's own word for Jolt's thick bolts.

With the same switch on (fx_m52kit.gd OWN; read anywhere through fx_looks.gd `same`):
- A bolt bouncing from one to the next is Lightning's own (fx.gd ground_bolt, sky_bolt) from every source: the damage melds'
  arcs (fx_melds3.gd arc_look `_bolt_or_own`; Wildfire's fire, Hailstorm's hail, Contagion's spores kept on it; Thunder's one
  bolt from the sky, not a bounce, its own), Forking (fx.gd `_m8_owns` gives its arc to fx.gd; fx_melds8.gd keeps the twins'
  after-image), Chain Reaction (fx_volatile3.gd `_chain_arc`, `_chain_link`), the Tinkerer's tesla coil and Contraption
  (heroes/tinkerer_look.gd); the damage melds' looks take an arc only of the ten (`mine`).
- Frozen: he has a frozen state (hero.gd `frozen_t`, set with `held` by a monster's Shiver, Flash Freeze, Icebreaker and the
  Drowned's rime) and shows it as a frozen monster does (fx_figures.gd _hero_tint); Flash Freeze's own shell on him is left
  out; Icebreaker's freeze on him tells Frost's ice burst.
- Burning: one the Warlock's hellfire burns (monster.gd hell_t) burns as anything burning does (fx_figures.gd read), his cyan
  tongues left out (heroes/warlock_look.gd); his bolt and its burst stay his.
- Bosses are left as they are. Pictured by the effects bench: `--only=fx --case=same --wordsown=0` and `=1`.
