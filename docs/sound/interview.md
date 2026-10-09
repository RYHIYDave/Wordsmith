# The sound and music rulebook: the interview (NOT IN THE GAME)

Branch `sound/rulebook`, from the sound chat. Nothing here changes the game. This file is the record
of how the sound and music rulebook was found: every question put to the owner, his answers in his
exact words, and how each was read. The rulebook is his doc "Wordsmith Sound and Music Rulebook"
(https://claude.ai/code/artifact/cee027fe-87c9-4b63-aaf7-8180b913ca11); `docs/sound/RULEBOOK.md` on
this branch is a copy of it. It was made the way the art and gameplay rulebooks were
(`docs/art/interview.md`, `docs/gameplay/interview.md`): rounds of four questions as pop-ups with
options, our pick first and marked, his own words always possible; each round read back to him in
plain words; then a first draft for his yes.

Times are the machine's clock (his own time, America/Detroit). "Asked just after 13:10" means the
clock read 13:10 just before the pop-up went out; "answered by 13:13" means his answers were there
when the clock was next read, at 13:13.

## What he asked (9 Oct 2026, to the sound chat)

12:48, his first message to this chat, which set it up: "You are the SOUND chat for Wordsmith, a
browser action RPG that I (the owner) direct and playtest. I don't code: you write and test
everything. Several chats work on the game; this one makes its sounds." Two of its six points are
this chat's standing rules:

"5. How you work: on branches of your own (sound/...), never on main. Nothing new is heard in the
game until I have listened to it and said yes; until then it sits behind a switch that is off. Make
samples I can play on my phone (sound files rendered from the recipes). When a branch is ready and
has my yes, post it on the board for the main chat, saying what it is and what I said."

"6. With me: plain words, short messages. Every question goes as a pop-up with options to tap, your
pick first and marked "(Recommended)". News and finished work go as plain messages. Tell me how you
read every idea I send. Quote me only in my exact words. Never state a number or a time without
checking it. Original sounds only."

Asked just after 12:55, as a pop-up, "What should the Sound chat do first?" Pick the style by ear
(Recommended) ("A sword hit, a spell, a monster's death and a word found, each in three styles. You
listen on your phone and pick one. Everything after follows it."), Monsters' own sounds ("Each
monster gets sounds of its own, starting with the trolls' and the Warden's new attacks."), Hear
today's 50 sounds ("All of today's sounds on one page for your phone. You tell me which to keep and
which to redo."), A first piece of music ("The game has none. One piece for the dungeon, as a sample
to listen to."). **His answer, by 13:08, in his own words:**

"You are now the Director of sound and music for Wordsmith.  I’d like you to ask a bunch of questions to drill down what we want and how to get it.  I’ve found I very particular about what I like and don’t like and the sooner we are on the same page the better."

He was told just after 13:10: that this chat is now the Director of sound and music, and owns how
the game sounds, music included; that it would ask in rounds of four, about seven rounds, each read
back to him, and then write a Sound and Music Rulebook from his answers for his yes; that
everything is made in code, with no recordings ("That suits punchy hits, magic and synth music. Real
instruments can only be imitated, and a real human voice is out of reach."); and that samples to
show each rule would follow the rulebook, to be tuned by ear.

## What he had already said about sound (from the docs on `main`)

- 4 Oct 2026, 09:42 (`docs/NEXT_VERSION.md`): "and while we're on sound id like distinct music for
  each dungeon type. if youre fighting though the jungle youd want kind of a tribal sound, but if
  your in a victorian city for dracula you would want something of the time". The game has no music.
- 4 Oct 2026, 09:23 (`docs/NEXT_VERSION.md`), of the shield going up at the end of CHARGE, which is
  not built: "and get a SHHHING metal sound cue as well".
- The heroes' voices (`docs/DESIGN_NOTES.md`, section 5): the warrior "very deep and gruff"; the
  ranger hushed ("a hunter in woods that doesnt want to spook anything"); the mage's "british
  accent", which a mumble cannot carry and which lives in her lines.
- What sound follows where it can, from the other two rulebooks: "I want things to have weight.
  That's very important"; effects and animations "big and wild" (8 Oct); the freeze on a heavy blow;
  "Tense early, godlike late".
- Open with the main chat since 7 Oct, and settled here in round 6: the mage's voice, and with it
  the VOICE button on the class cards.
- 9 Oct, 12:40, to the main chat, as the main chat posted it on the Chat Board: “I’d like to have
  another agent on sound.”

## Where sound stood when it began (the code of Version 19.7, `main` at `e1fa92c`)

50 sounds, each a recipe in code (`src/engine/audio.ts`); no music; no sound added or changed since
Version 18.5 (`0881939`); monsters' attacks borrow the heroes' sounds, and every monster but a boss
or a champion dies with the same crunch; a wind-up is silent; 8 of 13 words have a sound of their
own; the heroes' lines are a mumble, a note for each syllable; one switch, SOUND: ON or OFF. The
sound chat cannot hear: he was told so at about 12:55 ("I can't hear. I check a sound by measuring
it and looking at a picture of it. Your ears are the real test.").

## Round 1: the feel (asked just after 13:10, answered by 13:13)

The questions, as put to him:

1. "Round 1 of the sound and music rulebook: the feel. Which of these games sound closest to the
   Wordsmith in your head? Pick any, or name others. (I'd pick Dead Cells for the fight and Hyper
   Light Drifter for the mood.)" (several could be picked) Dead Cells (Recommended) ("Punchy,
   crunchy hits. Quick and lively. Music that drives you on."), Hyper Light Drifter ("Soft, glowing
   synths. Lonely and moody. Few sounds, each one clear."), Diablo / Path of Exile ("Dark and
   heavy. Meaty hits, loot you know by its sound, brooding music."), Hades ("Big, bold and loud.
   Rock guitars and drums, lots of voices.").
2. "How real should things sound? Everything is made in code, with no recordings." Real, with extra
   punch (Recommended) ("Steel rings, bone cracks, fire roars: like the thing itself, larger than
   life. Magic hums and crackles like glowing energy."), Retro ("Bleeps and buzzes, like an old
   console. Today's sounds lean this way."), Halfway ("Real hits and monsters; retro bleeps for
   loot, menus and level-ups.").
3. "What is the mood of the whole game, by ear?" Cool and dangerous (Recommended) ("Dark places,
   but a fight is a thrill: confident, punchy, lively. Never gloomy for the sake of it, as the art
   rulebook says."), Dark and eerie ("Lonely and tense. The dungeon itself unsettles you."), Bold
   and heroic ("An adventure: bright, warm, stirring.").
4. "What must the sound never be? Pick any. (I'd pick the first two.)" (several could be picked)
   Cartoony (Recommended) ("No boings, slide-whistles or comedy sounds."), Harsh or piercing
   ("Nothing shrill or painful, however loud, even on a phone's small speaker."), Wet and gory ("No
   squelches or splatter. A hit is a crack and a thud."), A wall of noise ("Even in the biggest
   fight you can still pick out what matters.").

His answers:

- **Sounds like:** "Dead Cells (Recommended)" and "Diablo / Path of Exile".
- **How real:** "Halfway".
- **Mood:** "Cool and dangerous (Recommended)".
- **Never:** "Cartoony (Recommended)" and "Harsh or piercing".

**How they were read, and told to him:**

1. Dead Cells and Diablo / Path of Exile. The fight is punchy and crunchy, quick and lively. Under
   it sits weight and darkness: meaty hits, loot you know by its sound, music that drives in a
   fight and broods between. Not soft, lonely synths; not rock guitars or lots of talking.
2. Halfway. The world is real: hits, monsters and places sound like the things themselves. The
   game's own voice is retro: loot, menus and level-ups bleep like an old console.
3. Cool and dangerous. Dark places, but a fight is a thrill. Never gloomy for the sake of it.
4. Never cartoony, never harsh or piercing. He left "Wet and gory" and "A wall of noise" unpicked,
   so neither is assumed: round 2 asks.

## Round 2: the fight (asked just after 13:13, answered by 13:19)

The questions, as put to him:

1. "Round 2: the fight. What should a hit that lands sound like?" A crack, then weight
   (Recommended) ("A sharp crack you can't miss, then a heavy thud behind it. Light for small hits,
   heavy for big ones."), Short and snappy ("Quick, light ticks. A flurry of hits becomes a
   rhythm."), Huge every time ("Every hit booms and rings.").
2. "How wet should a hit on flesh sound? (For blood to look at, you chose "A little".)" A little
   (Recommended) ("A small wet edge when a hit draws blood: a troll, a cultist. Bones only crack
   and clatter."), Dry ("No wet sounds at all."), Juicy ("Squelch and splatter. You hear every
   wound.").
3. "Late on you mow packs down: ten hits in one second. What should that sound like?" One bigger
   crunch (Recommended) ("Hits that land together merge into one heavier hit. It gets bigger, not
   messier."), Every hit heard ("A rattle of separate hits, like hail on a roof."), Glorious chaos
   ("Let it pile up into a roar. That is the reward for being strong.").
4. "Do monsters have voices?" Yes, true to each (Recommended) ("Bones clack and rattle, bats
   screech, trolls grunt and bellow, cultists hiss and chant, the Warden roars."), Only the big
   ones ("Trolls and bosses have voices. Small monsters are just bones, wings and weapons."), No
   voices ("Bodies, weapons and magic only.").

His answers:

- **Hits:** "A crack, then weight (Recommended)".
- **Wet hits:** "A little (Recommended)".
- **Big fights:** "Glorious chaos".
- **Monsters:** "Yes, true to each (Recommended)".

**How they were read, and told to him:**

1. A crack, then weight. Every hit that lands has a sharp crack you can't miss and a heavy thud
   behind it: light for small hits, heavy for big ones.
2. A little wet. A small wet edge when a hit draws blood: a troll, a cultist. Bones only crack and
   clatter.
3. Glorious chaos. In a big fight the hits pile up into a roar, and that roar is the reward for
   being strong. It is the same climb as "Tense early, godlike late": early on you hear every hit;
   late on it roars. The roar may be huge, but it is never harsh or piercing (his own never).
4. Monsters have voices, true to each: bones clack and rattle, bats screech, trolls grunt and
   bellow, cultists hiss and chant, the Warden roars.
5. Taken as given, and told to him as his to overrule: magic in a fight is real too. Fire roars and
   raw power crackles; it does not bleep.

## Round 3: your hero in the fight (asked just after 13:20, answered by 13:22)

The questions, as put to him:

1. "Round 3: your hero in the fight. A big attack winds up: a slam, a charge, a boss's blow. Should
   you be able to dodge it by ear?" Yes, and it cuts through (Recommended) ("Each big attack has a
   sound of its own as it winds up. Even in the roar of a big fight it is heard."), Yes, but it may
   drown ("Wind-ups have sounds, with no special treatment in a big fight."), No, eyes only ("The
   pose and the red circle are the warning. Sound comes with the blow.").
2. "A heavy blow freezes the picture for a tenth of a second (you chose that on 8 Oct). What should
   the sound do in that instant?" Cut out, then boom (Recommended) ("Everything drops away for that
   instant and the blow lands in the gap. The silence makes it hit harder."), Just the boom
   ("Nothing cuts out. The blow is simply the loudest thing.").
3. "When your own hero is hit, what do you hear?" A hard thud and a short grunt (Recommended) ("You
   always know you were hit, even in the roar. Bigger hits, bigger sounds. The voice is
   wordless."), The thud only ("No voice sound."), A retro alarm on top ("A bright old-console blip
   with every hit you take.").
4. "When your life is low, how do you hear it?" A heartbeat, and the world dulls (Recommended) ("A
   slow heartbeat comes in and everything else goes a little muffled until you heal."), A retro
   warning blip ("A soft, repeating old-console beep."), Nothing ("The life bar is enough.").

His answers:

- **Warnings:** "Yes, and it cuts through (Recommended)".
- **The freeze:** "Cut out, then boom (Recommended)".
- **Getting hit:** "A hard thud and a short grunt (Recommended)".
- **Low life:** "A heartbeat, and the world dulls (Recommended)".

**How they were read, and told to him:**

1. Warnings cut through. Every big attack (a slam, a charge, a boss's blow) has a wind-up sound of
   its own, and it is heard even in the roar: he can dodge by ear. The director's rule beside it,
   told to him: never by ear alone. The pose and the red circle stay, so the game plays fine with
   the sound off.
2. The freeze cuts the sound out. In the tenth of a second the picture holds, everything drops
   away, and the blow lands in the gap.
3. His hero hit: a hard thud and a short, wordless grunt, bigger with bigger hits, heard even in
   the roar.
4. Low life: a slow heartbeat comes in and the world dulls until he heals.
5. So two things always cut through the roar: a big attack's warning, and his own hero being hit.

## Round 4: words and rewards (asked just after 13:22, answered by 13:26)

The questions, as put to him:

1. "Round 4: words and rewards. A word drops: the biggest moment in the game. What do you hear?" A
   deep bell, then a retro run (Recommended) ("One low, ringing strike you feel, then a rising run
   of old-console notes. The fight dips under it for a moment. Nothing else sounds like it."),
   Retro only ("The grandest old-console fanfare in the game."), Real only ("A deep bell and a
   shimmer of power. No bleeps.").
2. "An attack with a word in it: how do you hear the word in a fight?" Real, with a small shine
   (Recommended) ("Flame roars, Frost cracks like ice. On top, a short bright sparkle in that
   word's own note: the sound of a word at work, as its glow is to the eye."), Real only ("Flame
   roars, Frost cracks like ice. Nothing added."), Retro ("Each word has its own old-console sound
   on the hit.").
3. "Loot bleeps like an old console (your pick in round 1). Should you know what dropped by its
   sound alone?" Yes, by rarity (Recommended) ("White: one soft blip. Blue: two notes. Yellow: a
   bright run. Gold coins have a jingle of their own. A word tops them all."), Rare and better only
   ("Plain white gear drops silently."), One drop sound ("The same blip for everything but
   words.").
4. "Level up, a new move opening, a boss falling: how big by ear?" A proud fanfare, the world dips
   (Recommended) ("A short old-console victory tune. The music and the fight duck under it for a
   second."), Quick and small ("A brief chime. Nothing else changes."), Huge ("A long fanfare, and
   the game holds still for it.").

His answers:

- **A word found:** "A deep bell, then a retro run (Recommended)".
- **Word at work:** "Real, with a small shine (Recommended)".
- **Loot:** "Yes, by rarity (Recommended)".
- **Big moments:** "A proud fanfare, the world dips (Recommended)".

**How they were read, and told to him:**

1. A word found: a deep bell, then a retro run. One low, ringing strike you feel, then a rising run
   of old-console notes, and the fight dips under it for a moment. Nothing else in the game sounds
   like it. It is the third thing that always cuts through the roar.
2. A word at work: real, with a small shine. Flame roars and Frost cracks like ice, and on top sits
   a short bright sparkle in that word's own note. So every word has a note of its own, as it has a
   colour of its own.
3. Loot is known by ear, by rarity: white one soft blip, blue two notes, yellow a bright run; gold
   coins a jingle of their own; a word tops them all.
4. Level up, a new move, a boss falling: a short, proud old-console fanfare, and the music and the
   fight duck under it for a second.
5. The shape that has come out of rounds 1 to 4, told to him: the world sounds real, the game
   speaks retro, and words are where the two meet.

## Round 5: music (asked just after 13:27, answered by 13:36)

The questions, as put to him:

1. "Round 5: music. The game has none yet. On 4 Oct you asked for "distinct music for each dungeon
   type". Where should there be music?" Everywhere, each its own (Recommended) ("A theme on the
   start screen, calm music in town, each land's own music in its dungeons, and a piece for
   bosses."), Not in ordinary dungeons ("Dungeons have only their own sounds. Music is for the
   start screen, town and bosses."), Bosses and start screen only ("Everything else is the world's
   own sound.").
2. "What is the music made of? It is all made in code, so real instruments are imitations, a little
   stylised." Old instruments, dark and driving (Recommended) ("Low drums, plucked strings, bells,
   pipes and deep drones. Brooding while you explore, driving in a fight."), Old instruments, retro
   lead ("The same, but the tune is carried by an old-console voice, to match the loot and the
   fanfares."), Retro chip music ("Old-console music throughout.").
3. "Should dungeon music change when a fight starts?" Yes: brooding, then driving (Recommended)
   ("Low and tense while you explore. Drums and drive come in when monsters wake, and fall away
   when the room is clear."), One steady piece ("The same music, fight or no fight."), Fights only
   ("Only the dungeon's own sounds until a fight starts.").
4. "Tunes you can hum, or mood?" One theme, then mood (Recommended) ("A Wordsmith tune you'd know
   anywhere: on the start screen, in town and in the big moments. Dungeons are mostly mood and
   rhythm."), Tunes everywhere ("Every place has a melody you remember."), Mood only ("No melodies.
   Texture, pulse and atmosphere.").

His answers:

- **Where:** "Everywhere, each its own (Recommended)".
- **Made of:** "I was thinking more synth.  Light and airy in towns or exploring, punched way up
  during fights." (his own words).
- **In a fight:** "Yes: brooding, then driving (Recommended)".
- **Tunes:** "One theme, then mood (Recommended)".

**How they were read, and told to him:**

1. Music everywhere, each its own: a theme on the start screen, music in town, each land's own
   music in its dungeons, and a piece for bosses.
2. THE MUSIC IS SYNTH (his own words). Not old instruments imitated, and not chip music: synth.
   Light and airy in town and while exploring; punched way up in a fight. Told to him: synth is the
   one kind of music that code makes for real, not as an imitation.
3. The music changes with the fight: the punch comes in when monsters wake and falls away when the
   room is clear. Where the option he tapped said "brooding", his own words win: exploring is light
   and airy, not low and tense.
4. One theme, then mood: a Wordsmith tune he would know anywhere, on the start screen, in town and
   in the big moments; dungeons are mostly mood and rhythm.
5. A correction to the reading of round 1, told to him: between fights the music is light and airy,
   not brooding (that had been read from "Diablo / Path of Exile").

## Round 6: the synth, then voices (asked just after 13:36, answered by 13:45)

The questions, as put to him:

1. "Round 6: the synth, then voices. What kind of synth is in your head? Name a game, film, show or
   band if one comes to mind: that helps most." 80s neon (Recommended) ("Warm, glowing pads and
   sparkling runs of notes, like an 80s film score. In a fight: a driving bass line and big, punchy
   drums."), Dreamy and floating ("Slow, soft, bell-like notes with lots of space. In a fight: a
   strong pulse and drums come in under the same dreamy sound."), Hard and modern ("Clean, glassy
   and crisp. In a fight: aggressive bass and hard electronic drums, like a club track."),
   Old-console synth ("The waves of a 16-bit game's soundtrack: the same voice as the loot and the
   fanfares.").
2. "Voices. Made in code, a voice can't say real words. Today the heroes mumble in tones when they
   say a line. What do you want?" A better mumble (Recommended) ("Wordless babble shaped like
   speech, each hero in a voice of their own: deep and gruff, hushed, plummy. The words are on the
   screen."), Retro talk-blips ("Quick old-console blips as the words appear, at each hero's own
   pitch."), No speech sounds ("Lines appear as text only."), The phone's own voice ("Real words
   read out by the phone. Robotic, different on every phone, and I can't send you samples of it.").
3. "The VOICE button makes all three heroes male or female. But the warrior and the ranger are
   drawn as men and the mage as a woman. What now?" One voice each, no button (Recommended) ("The
   warrior and the ranger have men's voices, the mage a woman's. The VOICE button goes."), Hers
   always a woman's ("The button stays, but only for the warrior and the ranger."), Keep it as it
   is ("The button sets all three.").
4. "Should heroes make voice sounds when they attack? (When hurt, you chose a short grunt.)" No:
   weapon and magic only (Recommended) ("A voice only when hurt or falling. Attacks are the
   weapon's own sound, so no grunt repeats in your ear."), On the big moves ("A grunt or a shout on
   a slam, a leap, a big cast. Never on an ordinary swing."), On every attack ("A voice sound with
   each swing, shot and cast.").

His answers:

- **Synth:** "I’d like to try "Dream Thrash".  seamlessly fuse the absolute aggression of extreme
  metal with the weightless euphoria of indie pop and shoegaze, creating a sound that feels
  simultaneously massive and entirely airborne" (his own words).
- **Speech:** "A better mumble (Recommended)".
- **VOICE button:** "One voice each, no button (Recommended)".
- **Effort:** "No: weapon and magic only (Recommended)".

**How they were read, and told to him:**

1. THE MUSIC IS TO TRY "DREAM THRASH" (his own words): the aggression of extreme metal fused with
   the weightless euphoria of indie pop and shoegaze, "simultaneously massive and entirely
   airborne". Read with round 5: the dream half alone is the light and airy music of town and
   exploring; the thrash half punches in when a fight starts, on top of it, and falls away after.
   Made with synths, in code. He said "try", so the first piece of music is a try-out, tuned by
   ear.
2. A better mumble: wordless babble shaped like speech, each hero in a voice of their own: the
   warrior deep and gruff, the ranger hushed, the mage plummy. The words are on the screen. The
   director's call beside it, told to him as his to overrule: the four people in town get the same
   kind of mumble, each a voice of their own (today they borrow the heroes').
3. One voice each, no button: the warrior and the ranger have men's voices, the mage a woman's, and
   the VOICE button leaves the class cards. That answers the main chat's open question about the
   mage's voice. The button is the main chat's to remove.
4. No voice in an attack: a hero's voice is heard only when hurt, when falling, and when saying a
   line. Attacks are the weapon's and the magic's own sound.

## Round 7: dream thrash, the world, and how we work (asked just after 13:45, answered by 13:49)

The questions, as put to him:

1. "Round 7, the last: Dream Thrash, then the world. "Dream Thrash" is what the band Astronoid call
   their own sound. What should I take as the measure?" Astronoid's sound (Recommended) ("Racing
   drums and fast, bright riffs under high, floating, layered melodies. Joyful, not grim. For feel
   only: nothing is copied."), Your description only ("No band in mind. I make my best try from
   your words and you steer by ear."), Someone else ("Name the band, song or game and I'll take
   that as the measure.").
2. "Apart from the music, how alive should a place sound?" Alive, but under everything
   (Recommended) ("Fires crackle as you pass, water drips, the gate hums; in town the hammer rings.
   Your own steps are soft on stone, and you hear a troll's tread coming. All of it sits under the
   fight and the music."), Rich and loud ("A thick bed of the place's own sounds, always there."),
   Still ("No sounds of the place. Only what you and the monsters do.").
3. "What should I tune the sound for first? (Tell me how you play, too: speaker or headphones.)"
   The phone's own speaker (Recommended) ("Most players will hear it there. It has no deep bass, so
   weight has to come from the crack and the body of a sound. Then I check it for headphones."),
   Headphones first ("Deep bass, and sounds placed left and right. The phone's speaker gets what it
   gets."), Both the same ("Neither wins. Every sound must work on both from the start.").
4. "How do you want to hear my work?" Films with sound, and a page (Recommended) ("The big things
   as short films from the game with their sound, so you judge eye and ear together. Everything
   else on one page with play buttons, old beside new."), A page with play buttons ("Every sound on
   a page, old beside new. No films."), Sound files in the chat ("Files you tap to play, a few at a
   time.").

His answers:

- **The measure:** "Astronoid's sound (Recommended)".
- **Places:** "Alive, but under everything (Recommended)".
- **Tuned for:** "The phone's own speaker (Recommended)".
- **Samples:** "A page with play buttons".

**How they were read, and told to him:**

1. The measure for Dream Thrash is Astronoid's sound: racing drums and fast, bright riffs under
   high, floating, layered melodies; joyful, not grim. For feel only: the music itself is the
   game's own.
2. Places are alive, but under everything: fires crackle as he passes, water drips, the gate hums,
   the hammer rings in town; his own steps are soft on stone and a troll's tread is heard coming.
   All of it sits under the fight and the music.
3. Tuned for the phone's own speaker first. It has no deep bass, so weight comes from the crack and
   the body of a sound; then it is checked for headphones. (He was asked how he plays, speaker or
   headphones, and did not say.)
4. Samples come on a page with play buttons, every sound on it, old beside new. No films with sound
   (the recommended option had them).

## A fact looked up for round 7

"Dream Thrash" is what the band Astronoid (from Lowell, Massachusetts) and its label have called the
band's sound since 2016, the year of its album Air (https://en.wikipedia.org/wiki/Astronoid, opened
on 9 Oct 2026 at about 13:45). It was put to him as the measure for the music, for feel only, and he
chose it. Nothing of theirs is copied: the music is the game's own, and made in code.

## A new idea while the draft was being written (13:53)

His message, 13:53: "Do you think it would be possible to make the boss battles and the music sync up?  Like get the bosses to attack on beat to the music?"

Read, and told to him at about 13:54: in a boss fight the boss's blows land on the beat of the
music, so the fight feels like part of the song. It is thought possible, because the music is made
live in code and the game always knows where the beat is. It takes three things: the boss holds back
a moment before each wind-up, so that the blow lands on a beat (a change to the boss's rules, which
is the main chat's); the music's speed is set so that each wind-up is a whole number of beats; and
his wind-up sound becomes part of the music, rising into the beat. Nobody has built it, and how it
feels cannot be promised yet. It went into the rulebook's music section as a thing to try, beside the
Dream Thrash try-out, and he was told to say so if he would rather it stayed out.

## The first draft (written into his doc between 13:49 and 14:00)

His doc "Wordsmith Sound and Music Rulebook"
(https://claude.ai/code/artifact/cee027fe-87c9-4b63-aaf7-8180b913ca11) was written section by section
while he could watch; `docs/sound/RULEBOOK.md` on this branch is a copy of it. Its sections: the lead;
Pillars; Two voices; The fight; Monsters; Your hero; Words; Loot and big moments; Music (with one
picture: the music's two halves, and bosses on the beat); Voices; Places; The mix; Menus and
settings; How sound is made and approved; The numbers; What this changes in the game; Still open.

- A rule that is the director's suggestion and not his answer says "(director)".
- Every quotation in it was checked by machine against this file and against `docs/DESIGN_NOTES.md`,
  `docs/NEXT_VERSION.md`, `docs/art/RULEBOOK.md` and `docs/gameplay/interview.md`.
- Every number in "The numbers" was read from the code of Version 19.7 by a script.
- The sound chat has heard none of today's sounds, and has made no sound yet.

FOR THE MAIN CHAT, from his answers (each is also on the Chat Board):

- THE VOICE BUTTON GOES (round 6, "One voice each, no button (Recommended)"): the warrior and the
  ranger have men's voices, the mage a woman's. It answers the question open since 7 Oct, whether
  her voice should always be a woman's. The class cards and `meta.voice` are yours to change.
- BOSSES ON THE BEAT, TO TRY (his idea of 13:53): when there is music, a boss fight will want a rule
  of yours by which the boss begins a wind-up so that its blow lands on a beat the music gives.
- What the sound will ask of the rules as it is built, each to be agreed with you on the board
  first: a moment for the start of a big attack's wind-up (today the first sound comes with the
  blow); what a hit landed on (bone, iron, flesh); the freeze on a heavy blow; life falling under
  the life bar's own low mark; a drop's rarity as it falls; a fight beginning and a room cleared.
- TWO VOLUMES, music and sounds, is the director's suggestion in the draft, and waits for his yes
  with the rest.
