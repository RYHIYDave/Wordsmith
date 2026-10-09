# Music try-out 1: Dream Thrash (NOT IN THE GAME)

Branch `sound/music-tryout`, from the sound chat, 9 Oct 2026. **Nothing here changes the game.**
`src/engine/music.ts` is imported by nothing, so it is not in `Play.html`; the game's 781 unit tests
were run on this branch and pass. It goes in only through the main chat, after the owner has heard
it and said yes (`docs/sound/RULEBOOK.md`, "Music" and "How sound is made and approved").

## What he asked for

- 9 Oct, by 14:04, asked what to make first: "Music first". The option read: "The Dream Thrash
  try-out alone: the dream half, then the thrash half punching in."
- The rulebook's Music section, from his answers: Dream Thrash, made with synths ("I was thinking more
  synth.  Light and airy in towns or exploring, punched way up during fights."); two halves, the dream
  half never stopping and the thrash half punching in when monsters wake; the measure is Astronoid's
  sound, for feel only. Samples come on "A page with play buttons".

## What he was sent (15:43)

The page "Dream Thrash Try-out", https://claude.ai/artifact/1ciciEsiJd1QiEotBHdEQb (its source is
`tools/sound/pages/dream_thrash_tryout.html`), and the same four clips as sound files:

1. **Exploring**: the dream half alone, once round the tune.
2. **A fight starts, and ends**: the thrash half punches in at 0:11 and falls away at 0:34.
3. **In the thick of it**: a fight for the whole tune, through the thrash half's four kinds of eight
   bars (gallop, racing, half-time, blast).
4. **The same fight, with a plain synth wall**: the chords, riff and bass as held saw waves instead of
   plucked strings, to set beside clip 3.

and, on the page only, eight bars of each part alone (the lead, the wash, the sparkle, the drums, the
wall, the riff), each turned up to the same loudness.

He was told at 14:07, at about 15:00 and at 15:43 that the sound chat cannot hear, and that nobody had
heard any of it.

## What he said

**In short: the dream half and the wall's sound were not it; the fight wants more; the four ways the
thrash half plays he liked, all of them. Next he hears a band made in code.**

Asked at 15:51 as a pop-up, answered by 15:56:

1. "Clip 1, exploring: are the tune and the feel right?" Yes, both (Recommended) ("Keep this tune and
   this light, airy feel, and polish from here."), The feel, not the tune ("Keep how it sounds. Write
   a different tune."), The tune, not the feel ("Keep the tune. Change how it sounds: say how, if you
   can."), Neither ("Start the dream half again."). **His answer: "Neither".**
2. "Clips 2 and 3, the fight: does the thrash half punch the way you want?" Yes, that's the punch
   (Recommended) ("Keep it at this size and polish from here."), More ("Heavier and wilder, and
   louder against the exploring."), Less ("It's too much. Pull it back."), It isn't thrash ("It
   doesn't sound like the music you meant. Say what's missing, if you can."). **His answer: "More".**
3. "The wall of chords and riffs: clip 3 or clip 4?" Strings, clip 3 (Recommended) ("Plucked strings
   pushed through an amp: nearer to guitars."), Plain synths, clip 4 ("Held synth notes: plainly a
   synthesizer."), Both together ("Layer the two."), Neither ("Say what you'd rather hear."). **His
   answer: "Neither".**
4. "In clip 3 the thrash half plays four ways, eleven seconds each. Which do you want in the game?
   Pick any." Half-time, 0:22 (Recommended), Gallop, 0:00, Racing, 0:11, Blast, 0:34. **His answer,
   in his own words:** "I liked them all, and interchanging them gives different opportunities for different attacks.  Half time for slams, racing for a barrage of shots, that kind of thing"

Read back to him at about 15:58: the tune and the feel of exploring both go; the fight is to be
heavier, wilder and a bigger jump in loudness; the wall needs a different sound; all four ways stay,
and the game picks which one plays by what the fight is doing, which sits beside bosses on the beat.
He was told the director's guess at where exploring went wrong (soft pads and a flute-like lead, no
beat and no band: nearer new-age music than indie pop or shoegaze), and asked for a song that sounds
right, if one came to mind. He named none.

Asked at 15:58 as a second pop-up, answered by 16:09:

1. "Exploring: what should it be instead?" A band playing softly (Recommended) ("Shimmering guitars
   with echo, a soft beat, a bass and a voice-like lead: the same band that thrashes in a fight,
   holding back."), Dark and moody ("Low and tense, in a minor key. More dungeon than daydream."),
   Big and bright ("A proud adventure theme with a beat, already half way to the fight."), Almost
   nothing ("Air, echoes and a few notes, so the fight hits harder."). **His answer: "A band playing
   softly (Recommended)".**
2. "What put you off clip 1 most? Pick any." Too soft and sleepy (Recommended) ("My guess: it floats
   and never moves."), The sounds felt cheap ("Thin, toy-like, or like an old keyboard."), The tune
   itself ("The melody, whatever plays it."), No beat ("No drums and no bass to drive it along.").
   **His answer: "Too soft and sleepy (Recommended)", "The sounds felt cheap" and "The tune itself".**
3. "The wall of chords and riffs: what should it sound like?" Real heavy guitars (Recommended) ("As
   near to a real band's guitars as code can get: thicker, dirtier, lower."), Huge dirty synths
   ("Thick, growling synths, like dark synthwave or an industrial track."), A shimmering haze ("More
   shoegaze than metal: a bright blur of sound that the drums punch through."). **His answer: "Real
   heavy guitars (Recommended)".**
4. "Your idea: the fight's music follows the attacks (half-time for slams, racing for a barrage of
   shots). Add it to the rulebook as a thing to try?" Yes, add it (Recommended) ("It goes in the
   Music section, beside bosses on the beat."), Not yet ("Leave the rulebook as it is for now.").
   **His answer: "Yes, add it (Recommended)".**

Read back to him at about 16:12, with what comes next: the rulebook has his idea as Music's rule 10
(his doc at rev 26); its rule 2 still says the music is made with synths, which his ears have now
overruled, and he will be asked about changing it once he has heard the band. The next try-out comes
in two steps: first the band's sounds on their own (heavy guitars, bass, drums, the soft shimmering
guitar and the lead), with one question, whether they sound real enough; then the music, exploring
and the fight played by that band, with two or three tunes to choose between.

So of this try-out: the tune (`LEAD`, `HARMONY`), the dream half's wash, lead and sparkle, and both
walls (plucked strings as they stand, and saws) are not wanted. The four kinds of eight bars
(`DRIVE_OF_EIGHT`), the two halves and the punching in stand.

## The tune

- D major. One beat is 0.35 s (171.4 beats a minute); a bar is 1.4 s; the tune is 32 bars (44.8 s)
  and comes round again.
- Chords, two bars each: G, D, A (its fourth hanging for a bar, then falling), B minor, twice; then
  the lift: G, A, B minor, D, and G, A, B minor, A.
- **The dream half**: a wash (four notes of each chord as pairs of saw waves, the top note the same
  A throughout); a lead that moves slowly and high, like a voice (a triangle wave, with a brighter
  saw edge that is turned down outside a fight and all the way up in one); a sparkle of plucked
  synth notes on the eighths with an echo a dotted eighth apart; a soft low note. A second voice
  joins the lead for the last eight bars.
- **The thrash half**: a drum kit (kick, snare, hat, ride, crash, toms) in four kinds of eight bars;
  a wall of chords and a bass under it (strings plucked in code by Karplus and Strong's method,
  pushed through a squashing curve and filters shaped like a guitar amp's box); a riff picked on
  every sixteenth in two voices. `plan.wall: 'saws'` makes the wall, riff and bass from held saw
  waves instead (clip 4).
- When a fight starts: a beat of drums, then everything at once with a crash; the lead goes to full
  voice and the wash steps back. When it ends: one last blow, and the thrash half is gone.

## How it is built (`src/engine/music.ts`)

- `song(ctx, out, t0, plan)` sets a stretch up on any Web Audio clock and hands back `write(bar)`;
  a player writes each bar a bar before it sounds, so a note is only made when its time comes.
  `playSong` writes a short stretch all at once.
- `plan`: how many bars, where in the tune to begin, the fights (in beats), and switches for
  measuring: `only` (parts), `kit` (single drums), `raw` (no limiter), `wet` (room and echo),
  `levels`, `wall`.
- The score is data at the top of the file (`CHORD_OF_BAR`, `LEAD`, `HARMONY`, `RIFF_HIGH`,
  `RIFF_LOW`, `DRIVE_OF_EIGHT`), so a tune can be changed without touching how it sounds.
- `LEVELS` holds each part's loudness, set by measuring each part alone.

## The tools (`tools/sound/`)

- `render_music.mjs <clips.mjs> <out dir> [names]`: runs the music code in the test browser on a
  clock with no speaker and writes each clip as a WAV file. `clips_tryout.mjs` lists this try-out's
  clips. `page.ts` is the page the browser runs.
- `measure.py`: peak, loudness (LUFS, from ffmpeg), what is left on a phone's speaker, the share of
  each octave, how alike the two sides are.
- `picture.py`: draws a file (loudness over time, and which pitches sound when) to look at.
- `check_score.ts`: reads the tune as written and checks it: in key, four beats a bar, held notes
  at home on their chords, no clashes between voices.
- `ear.py <model dir> <files>`: a borrowed ear. Runs CED-mini, an open listening model, which names
  what a sound would be taken for out of 527 kinds. The model is not in the repository (47 MB): its
  docstring says where it comes from.
- `pages/dream_thrash_tryout.html`: the page he was sent. Its clips are MP3 files made with ffmpeg
  from the WAVs (the four clips all 1.3 dB down; each part alone brought to the same loudness).

## How it was checked

- `tsc --noEmit` clean; the game's unit tests, 781 of 781.
- `check_score.ts`: clean. Its first run found six places where two voices sat a semitone or a
  tritone apart for a beat; the second voice and the riff's lower voice were mended there.
- Tuning: on the bars where the chords are left to ring, the strings measured within 1 cent of
  their notes (D3, G3, B2, F#3, A2); the two lowest (G2, D2) within what a 1.3 s window can tell.
- Loudness, as the code makes it: exploring -19.5 LUFS, the fight -13.2 LUFS, so the fight is 6.3
  louder. As MP3 files: -21.3 and -14.9 LUFS; no file's true peak is above -1.8 dBFS.
- The share of each octave in the fight, against its 1 kHz octave: 63 Hz +2.1, 125 +3.5, 250 +0.2,
  500 -1.7, 2 kHz -4.8, 4 kHz -7.5, 8 kHz -11.9 dB. Each part's share was measured too, to see who is
  loudest where (the kick and the bass at 125 Hz; the lead at 1 kHz; the riff at 2 kHz; the drums
  from 4 kHz up).
- A phone's speaker (nothing under about 350 Hz): the fight loses 5.1 dB, exploring 1.5 dB.
- Room and echo: 7.2 dB under the dry sound while exploring (bars 0 to 7), 12.9 dB under it in a
  fight (bars 16 to 23).
- No clicks: the largest step between two samples is a drum's own attack; every clip ends in
  silence (under -70 dBFS).
- The borrowed ear's top answers. Exploring: Music 0.85, New-age music 0.19, Background music 0.13,
  Tender music 0.10. The fight: Music 0.91, Video game music 0.54, Soundtrack music 0.16, Background
  music 0.10, Exciting music 0.07. It did not say heavy metal (under 0.005). A first version, with
  drums and a wall made of plain oscillators, it called techno and a drum machine; the kit and the
  strings were rebuilt for that reason.
- The page: opened as a phone 390 wide in the test browser inside the publisher's wrapper: no
  sideways scroll; play, pause, one clip at a time, winding along the strip; a clip whose file the
  player is refused is fetched and played another way; a clip that cannot be had says so.

## NOT CHECKED

- **Nobody has heard it.** The sound chat cannot hear.
- A real phone, and whether the page's players work inside the Claude app.
- How the music sits under the game's sounds.
- Whether the tune comes round on itself without a seam (it is written to).
- Bosses on the beat: not built.
- What it costs to make while the game runs. Here, in the test browser on two processors, 48.8 s of
  the fight took about 30 s to make, which is too dear to do note by note during play on a phone.

## For the main chat (nothing to do yet)

- Nothing here touches your files. When there is music with his yes, the likely way in is to make
  each half once, off to the side, when the game starts (an OfflineAudioContext, as the tool does),
  and play the two halves as two loops in step, the thrash one opened and shut by the fight. Then
  the game also knows where the beat is, which bosses on the beat will want.
- The speed was picked with bosses in mind: a beat is 0.35 s, so two beats are 0.7 s and three are
  1.05 s. On `main` the monsters' wind-ups are 0.22 (bat), 0.4 (skeleton), 0.55 (archer), 0.75
  (cultist), 0.85 (brute) and 0.95 s (Warden): none is a whole number of beats today.
