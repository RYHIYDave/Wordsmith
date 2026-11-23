# The Leech melds use Leech's own drain (23 Nov 2026)

His question: “Leech already had a nice animation for HP going from the enemy to the player.  Why are the new melds different?”
Each Leech meld (Lamprey, Bloodbloom, Lancet, Feeding Frenzy, Transfusion, Bloodtide, Coldblood, Marrow) had drawn its own drain in
its own colour (fx_m52kit.gd `_wisps`), on top of the game's own Leech drain, which plays for any blow with Leech in front
(hero.gd tells "leech"; fx_words610.gd siphon: red beads with red tails curving into him, his pulse as it lands).

Now, with fx_m52kit.gd `LEECH_SAME`, every Leech meld's drain is the game's own: `_drain` calls fx_words610.gd `siphon` into him,
or its new `drain_to` (the same wisps flowing into a monster drinking from him). Each meld's own twist stays on top. The
painters' DRAINS tables (fx_m52p_last110.gd, fx_m52p_leech.gd) say how many wisps each draws.

Off until his yes to the pictures: https://claude.ai/artifact/XcqVoEhtRoEdQHDqa6F6SP (leech_drain.html). `--leechsame=1` films it on.

ON at his yes to the pictures, 23 Nov 2026: “All good” (asked whether to switch on the damage looks, the melds' words' own looks, the Leech drain and the storm clouds).
