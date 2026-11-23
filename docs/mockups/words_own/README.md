# The melds use their words' own looks (23 Nov 2026)

After his question “Leech already had a nice animation for HP going from the enemy to the player.  Why are the new melds
different?”, asked “Want me to go through all 98 and make each one use its words' own looks where they exist?”, his answer:
“Yes go through them”.

A meld counts as both its words (words.gd `has`: `parts_of`), so each word's own look already plays for it: Precise behind
marks, and its sight closes (hero.gd `markOn`); Frenzied behind feeds the frenzy on a kill, and its spark leaps to him
(`frenzyFed`); Lightning's arcs strike (`arc`); a stun shows Heavy's stun (monster.gd `stun_for` tells `stun`); Volatile in
front blows up what it kills (hero.gd `_explode`, `burst` style "blast"); a freeze shows Frost's ice (`freeze`, and the
figures' frozen look); Guarding in front gives his shell (fx_words610.gd `_shell`, read off `shield_t`). Many of the 98 drew
their own copy of those on top, in their own colour.

All 98 painters were gone through (fx_m52paint.gd, fx_m52p_leech, _precise, _guard, _last, _vast, _last110.gd). With
fx_m52kit.gd `OWN` on:

- the copies are left out where the word's own look plays at that moment (`SAME`: the marks' sights, Berserk's and Fever's
  kill streaks, Jolt's and Fulgurite's bolts on top of the game's arcs, Charge's and Fulgurite's stun stars, Quickfuse's and
  Concussion's kill bursts, Flash Freeze's ice block and shards);
- what a meld draws of a word's own thing is drawn as that word draws it: every bolt is Lightning's (`_volt`, as fx.gd draws
  its ground bolts), every sight Precise's (`_sight_own`, as fx_words610.gd draws "of the Mark"'s), the Volatile melds' own
  blasts go off as Volatile's own (`_own_blast`: fx.gd `_burst`), Conduit's life comes as Leech's drain (`_drain`),
  Icebreaker's shatter is Frost's (fx.gd `shatter`), Mire's bubbles Poison's (fx.gd `bubbles`);
- his shell from a Guarding meld is Guarding's own (`_own_shell`: the game's where it is drawn, a copy of it where a barrier
  holds and it is not), dressed with the meld's twist (thorns, fire, stone, stud, wind, plates, spikes) in place of a second
  ring of the meld's own.

43 melds change; the eight Leech melds' drain is `LEECH_SAME` (docs/mockups/leech_drain). Each meld's own twist stays on top.
Off until his yes to the pictures: https://claude.ai/artifact/QyciotUBcRSzgrMunEh5M7 (words_own.html; its films are left out of the repository). `--wordsown=1` films it on, with `LEECH_SAME`.

ON at his yes to the pictures, 23 Nov 2026: “All good” (asked whether to switch on the damage looks, the melds' words' own looks, the Leech drain and the storm clouds).
