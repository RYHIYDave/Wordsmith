# Every meld not yet checked, against his Art Rulebook; the weakest brought up (26 Nov 2026)

His ask, to the Skins chat, 26 Nov 2026: “I’d like you to look at all our melds and find which are weakest compared to our art and
animation ruleset.  Then bring them up to our standard”; “There are like 300 melds”; “Almost every word has already been melded and
put in the game.  Keep looking”. Queued as “Check every meld against the art and animation rules, and bring the weakest up (needs
Godot)”, done in a cloud chat with Godot 4.7.2. Read: his living doc “Wordsmith Art Rulebook”
(https://claude.ai/artifact/Dq343Th9FFbpt9EiKfNyYe, rev 88) and docs/art/RULEBOOK.md.

## What was checked

All 263 melds the check of 23 Nov (../meld_rules_check) did not cover: the game's first 23 (the ten, Volatile's five, the eight), the
city's 45 and 44, the High City's 110, the Reaping creatures' 5 and the 60 redone on 24 Nov (melds52.json `redo`, whose new moments came
after 23 Nov). The `extra` five (Greed, Chains, Siege, Toll, Crown) never meld: door runes, nothing to film.

## How

- Each filmed with the game's own tools, as before: `xvfb-run -a godot --path godot --rendering-driver opengl3 --fixed-fps 30 --
  --only=words --cases=m52film:<ids> --shots=<dir>` (in front of the Strike, behind it, carried by a monster). The film now also writes
  `<id>.json` beside each film: the frame each side starts on and the frame each moment its rules told was first seen
  (check_melds52.gd `_marks`, `_told_at`).
- A plain Strike filmed the same way with no meld on it (`--cases=m52film:plainstrike`; the name is no word, so none goes on).
- `measure.py`: each film set frame by frame beside the plain one from each side's start; what is counted is what is bright and strong in
  colour in the meld's film and not in the plain one (grown a pixel): per side its peak and its sum over time, and how much of the hero's
  box it covers and for how long. `rank.py`: each scored against the first 23's median (half its sum, half its peak; in front and behind
  counted twice, on a monster once, capped at twice). `sheet.py`: frames of films side by side, to look at.
- The painters read for the rest of the rulebook: plain balls, boxes and rings (How art is made 9), the freeze on heavy blows (Movement 7),
  the screen's kick, the hero kept in sight (Animations 4: none covered him), each look in front, behind and on a monster (Animations 7),
  a friend's cyan on a monster (Pillar 4).

## What it found

- THE WEAKEST BY FAR ARE THE CITY'S MELDS THAT SLOW, CURSE OR HOLD (Stilling, Hexing, Binding): what they do is real, but all that showed
  was a small mark (a dial of twelve dots five pixels across, three short thorns, one thin rope loop), and the ground they lay appeared
  with a soft glow. The 30 lowest: see report.json (`weakest`, in order, each with why and what was done).
- The High City's and the redone melds' screen kick was a fraction of a pixel (0.2 to 0.55; the game's own melds kick 1.5 to 11).
- No freeze on the High City's Heavy and Volatile melds' landings (Battering Ram, Fuse, Mangle, Bloodburst, Tombstone, Soulburst,
  Crusher, Deathburst, Seismic, Overload), nor on Standstill's pulse.
- The redone melds' own things were plain boxes and rings: Doom's hammer and weight, Transfusion's orb (a square) and pool (rings),
  Amber's block, Bedrock's stone, Sunder's plates, Bullseye's target rings, the roars and Windward's whirl (dotted rings), Burden's weight.
- The marks the High City's painter shares (stun stars, the curse's eye, the skull, the dial, the chain, drops, the shield's face, the
  bell) 3 to 8 pixels across; a cloud three soft balls of light; after-images a few grey boxes; the wail and the flood plain rings.
- A monster carrying a city meld of Splitting (and some others) laid only a soft ball of light on him.
- Near a friend's cyan on a monster: Haven and Hydra (cyan-grey), Pitchfork, Tremor, Last Rites, Revenants, Rewind, Scissors (sea green).
- Near the enemy's pink on his side: Doom (#a03850) and Rimeblood (#c83c50). His call, asked 26 Nov 2026: “Keep them as they are
  (Recommended)”: not changed.
- Faults: Bedrock on a monster never burst its rock under him (foe_melds52.gd's stagger on each blow had already set his wait before
  foe_meldsredo.gd's hold, so “every second blow, rock bursts up” never came); Pin's spike and Amber's seal on a monster never came
  either (since commit e17f49a4 monster melds root him with a wait, hero.gd root_by_meld, and their Binding's own root had set it). Talisman's and Respite's films never struck his shield in
  front, so their moment in front was never filmed.

## What was done (all behind nothing new: these melds are already on; their looks change, so it waits on his yes to the page)

- fx_m52p_high.gd (the High City's 110 and, through it, the redone 60): KICK in game pixels as the game's (1.2 to 3.3); the Heavy and
  Volatile melds' landings hold (`_heavy`); the shared marks redrawn bigger and shaped (`_stars`, `_eye`, `_skull`, `_hand`, `_chain`,
  `_drop`, `_shield_face`, `_bell`); clouds as rolling curls, speed as streaks with bright heads, life drawn as six bigger drops, the
  frenzy's flames bigger, souls rising bigger; after-images his own picture pixel for pixel as Blink's (`_catch_ghost`, `_afterimage`);
  the named things bigger (`_fork`, `_scissors`, `_fangs`, `_stake`, `_needle`, `_maw`, `_spikes`, `_whirl`, `_hood`, `_scythe`,
  `_slashes`, `_spear_row`, `_barb`); the wail and the flood as breaking waves and rays (`_wail`, `_flood`); a thrown shard bigger.
- fx_m52p_redo.gd: each thing of its own drawn as the thing and bigger (`_maul`, `_weight`, `_sword`, `_planted_blade`, `_dagger`,
  `_plate`, `_boil`, `_globe`, `_amber`, `_target`, `_clock`; Ambush's closing sight `_reticle`, the roars and Windward's whirl, the
  pool of blood, the standing stones, the darts); the things that fall land with a kick and a hold and throw dust (`tick`).
- fx_m52p_city.gd and fx_m52p_city2.gd: a curse, a slow or a hold laid is a moment of its own (STATUS, STATUS2: a flash in its colour,
  its sparks thrown wide, two fronts of its kind rolling out under its mark, and the meld's own symbol, its stone's, flaring over what
  it struck and rising off it: `_glyph`, his Pillar 5, wordsmithing glows; pushed a notch higher after the first films); the marks bigger (the dial `_hand` a real dial, at least 11
  pixels; thorns longer; stun stars; rope loops and snares doubled; anchors); the ground laid (`leave`) a flash and its edge rolling
  out, not a soft glow; on him from a monster, its sparks and a front, and its own mark (shards for Splitting, a dial for Stilling)
  where it was a soft glow, the dial lifted clear of his head.
- fx_m52kit.gd SEA (and ICY with Haven and Hydra): on a monster, a deep green (#2a8a5c) or Frost's deep blue; fx_melds52.gd the
  carriers' smoulder the same; HOLDS `standstill:pulse`.
- foe_meldsredo.gd: Bedrock's rock bursts up on every second blow, as its words say; Pin's spike and Amber's seal work on the root
  their Binding has just laid. check_melds52.gd: Talisman's and Respite's films have a skeleton strike his shield in front.
- fx_m52p_high.gd: Pitchfork's fork is driven down ahead of him, where its second prong goes (it stood over him, Animations 4);
  fx_m52p_redo.gd: Bedrock's rock on him from a monster heaves up as three stones round his feet, not one over him.

## The films and the page

Before: every film of the 263 (not kept in the repository). After: the 30 weakest and 14 more, filmed again. The page of before and
after for his yes, “Weakest Melds, Brought Up”: https://claude.ai/artifact/Btyxz18G72p7ZHf1kVU6rp, made by `page.py <before films>
<after films> <out>` from report.json (`report.py ranking_before.json measure_after.json report.json` makes it from the ranking and the
after films' measures). Measured again, the 30 weakest rose from 57% of the first 23 to 62% on average (on a monster 66% to 75%); the
measure counts every bright pixel, so fire and blasts score highest and a curse or a slow moves it less than the films show.

## Checks

- `--only=words --cases=m52:<the 44 filmed again>`: 9 checks, 0 wrong (86 cases).
- `--only=words --cases=high`: 9 checks, 2 wrong: Thornshield in front (its burst as his shield breaks) and Artery on a monster. Both
  were run again alone on this branch and on claude/sharp-lamport-ey7q0l as it was: Thornshield in front fails on both (not from this
  work: the check's blow on his shield no longer breaks it into the burst); Artery passes alone on both (it fails only after the
  cases before it).
- `--only=words --cases=redo`: 5 checks, 2 wrong: Lancet and Bullseye behind, Momentum on a monster. The same full run on the base
  branch as it was: 3 wrong (Riposte in front; Lancet and Bullseye behind; Haymaker, Lancet, Needle, Pin, Amber, Bedrock, Cataclysm on
  a monster). Lancet, Bullseye and Momentum pass when run alone on both: they fail only after the cases before them. Pin and Amber on a
  monster failed alone on the base branch and pass now (foe_meldsredo.gd).
- No script errors in any film or check.

## The second pass (26 Nov 2026)

His words, asked whether to start another task: “Go back over and check again vs our rules.  Don’t create changes if they don’t need
them but check again for weak melds”. Every meld filmed again with the fixes in (the city's 45 and 44, the High City's 110, the 60 redone,
the Reaping 5, and this time the 98 of 23 Nov too: 308 films; the first 23 as filmed before), measured and ranked as before
(`ranking_pass2.json`, 325), and the painters read again. Changed only what still broke a rule:

- Plain rings on the floor (How art is made 9): the Reaping creatures' rising, burst and the spot their slam falls on
  (fx_m52p_reap.gd: `_front`, `_reticle`), and the floor edges of Tailwind's gust, Bloat's burst, Coldsnap's melt, Flashfire's
  flare, Jolt's jolt and Daze's thud (fx_m52p_last.gd: `_front` of each one's kind).
- Shellburst's blast did not freeze (Movement 7): fx_melds52.gd HOLDS `shellburst:pop`.

Not changed: no film covers him for more than a blink (the hero's box at most 40% covered, never for two frames running). Still the
smallest by the measure: the city's slow, curse and hold melds already brought up (their moments in place), and of the 98 Lifeline,
Second Wind, Juggernaut, Marrow, Hornet and Aftermath (no rule broken; small).

Open, asked of him: in 26 films (Aftershock, Bloat, Carapace, Cinderward, Coldsnap, Firewalk, Flashfire, Flurry, Glacier, Hemlock,
Inferno, Jolt, Mayhem, Miasma, Minefield, Overcharge, Permafrost, Quickfuse, Rekindle, Smoulder, Spree, Static, Tempest, Timebomb,
Whiteout; Papercut) the meld's own moment never plays while a monster carries it (MELDS52 FOE ... NOT SHOWN). The same on the base
branch (filmed there: Coldsnap, Rekindle, Quickfuse), so not from this work. Some show only their runes' own look on a monster (a warned
shockwave, a burn made worse, its dying blast), some tell no moment at all on a monster (Coldsnap), some wait on what the film does not
set up (him burning for Rekindle and Flashfire).

The page has a second-pass section with the twelve changed, before and after.
