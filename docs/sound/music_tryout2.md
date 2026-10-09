# Music try-out 2: the band (NOT IN THE GAME)

Branch `sound/music-tryout`, from the sound chat, 9 Oct 2026. **Nothing here changes the game.**
Nothing the game loads was touched: the band is played by a lab in Python (`tools/sound/lab/`) on
recordings that are not in the repository. It goes into the game only through the main chat, after
the owner has heard the music and said yes.

Try-out 2 has two steps. **Step 1, the band's sound check, is done and has his yes** (below).
Step 2, the music itself, is being made.

## Why a band, and why real instruments

- Try-out 1 (`docs/sound/music_tryout.md`) was all made in code. Of it he said, by 16:09: exploring
  should be “A band playing softly (Recommended)”; what put him off was
  “Too soft and sleepy (Recommended)”, “The sounds felt cheap”, “The tune itself”; and the wall of
  chords should be “Real heavy guitars (Recommended)”.
- His idea, 16:13:
  “Is there a way I can get you better instruments?  Like a midi sound pack or something?”
  Asked as a pop-up, "Real recorded instruments for the next music try-out?", he answered
  by 16:31: “Yes, the free ones (Recommended)”. That option read: "Public-domain recordings of a real
  electric guitar, bass and drum kit. I fetch them myself, and the next try-out is played on them."
- He was told then that it would come in two steps (the band's sounds alone, then the music), and
  that recordings would be sound files inside the game, which is for him and the main chat to decide
  once he has heard them.

## The instruments

Three packs, all by Karoryfer Samples, all CC0 1.0 (each repository's LICENSE; the readmes say
"Royalty-free for all commercial and non-commercial use"), from github.com/sfzinstruments:

| Pack | At | What it is (its own readme or guide) | What is used |
| --- | --- | --- | --- |
| `karoryfer.emilyguitar` | b4920dc | An Epiphone Emily the Strange electric guitar, recorded direct (no amp), both pickups. Standard tuning; the low E string also sampled tuned down to Db | Every note: 18 pitches, four loudnesses, three takes of each; and the muted strokes |
| `karoryfer.growlybass` | 4f48326 | A Squier Jazz Bass, recorded direct. EADG; the low E string also sampled tuned down to C# | The held notes (four loudnesses, four takes) and the short ones (five takes) |
| `karoryfer.big-rusty-drums` | f07ce00 | "a kit made by Zygmunt Szpaderski in Poland decades ago", with modern cymbals; each hit through a close microphone and overheads | Kick, snare (centre, rimshot, sidestick), hi-hat (five ways), ride and its bell, two crashes, china, four toms |

`tools/sound/fetch_packs.sh` fetches them (about 1 GB) and `tools/sound/make_bank.py` copies what is
used into a bank of 1547 recordings (48 kHz WAVs, 499 MB; not in the repository) and measures the
tuning of every guitar and bass note. Nothing else is recorded: the amps and their speakers, the
rooms, the echo, the shimmer and the playing are code (`tools/sound/lab/`).

## Step 1: what he was sent (18:00)

The page "Band Sound Check", https://claude.ai/artifact/WWaRPJbg36m8Z5GjwzmugJ (its source is
`tools/sound/pages/band_sound_check.html`; the clips are `tools/sound/lab/sounds.py`'s, as MP3s at
160 kbps). Seven clips, a little over two minutes in all (130 s). It says it is a sound check and not
the music: the notes are only there to show the sounds (D minor: Dm, Bb, F, C; a beat 0.35 s).

1. **The band at full** (19.8 s): two heavy guitars, bass, drums and a lead guitar. Four bars
   galloping; four of ringing chords over half-time drums, where the lead comes in; four of a line
   picked fast over racing drums, then a blast; one last chord.
2. **The band holding back** (14.2 s): one guitar strummed, one picked with an echo, bass, a light
   brisk beat, the lead.
3. **The heavy guitars** (18.8 s), 4. **The bass** (18.5 s), 5. **The drums** (31.0 s: the four ways
   of try-out 1, then the light beat), 6. **The soft guitars** (14.2 s), 7. **The lead** (13.7 s: the
   same notes held back, then at full).

He was told on the page and in the message with it that the sound chat cannot hear, that nobody had
heard any of it, and that the band holding back and the lead were what it was least sure of.

## What he said

**In short: the instruments are real enough to write the music on. The lead guitar needs work, the
heavy guitars should be heavier, exploring should be calmer and dreamier, and a synth joins the band
for the air.**

Asked as a pop-up after the page went out at 18:00, answered by 18:12:

| Question | The options, the sound chat's pick first | His answer |
| --- | --- | --- |
| Do these sound like real instruments, good enough to write the music on? | "Yes, write the music (Recommended)": They sound real. Next come the tunes: exploring and the fight. / "Nearly: fix some first" / "No, still not real" | “Yes, write the music (Recommended)” |
| Which need work, if any? Pick any. | "None, all fine (Recommended)" / "The lead guitar": Clip 7. My own guess at the weakest. / "The heavy guitars" / "The drums" | “The lead guitar” |
| Clip 1, the band at full: are the guitars heavy enough? | "Yes, heavy enough (Recommended)" / "Heavier": More weight and more bite. / "Too harsh": Smoother, less fizz. | “Heavier” |
| Clip 2, the band holding back: is that the feel for exploring? | "Yes, about that (Recommended)": Light and brisk, the band holding back. / "Calmer and dreamier": More air and echo, less beat. / "Livelier": More drive, nearer the fight. | “Calmer and dreamier” |

His own idea, 18:12: “Get a synth in the band as well”. Asked as a pop-up, answered by 18:14:

| Question | The options | His answer |
| --- | --- | --- |
| What should the synth do in the band? Pick any. | "The air (Recommended)": Soft held chords behind the band: the dreamy glow while you explore, the lift in a fight. / "The tune (Recommended)": A voice-like lead that sings the melody, in place of the lead guitar's long notes. / "Sparkle on top" / "Deep weight" | “The air (Recommended)” (that one only) |
| The rulebook's music rule 2 says "Made with synths". Change it to a real band with a synth in it? | "Yes, change it (Recommended)": Rule 2 becomes: played by a band of real recorded guitars, bass and drums, with a synth in the band. / "Not yet" | “Yes, change it (Recommended)” |

How the sound chat read these, as he was told at 18:13:

- The music is next, played on these instruments.
- The lead guitar: a recorded guitar cannot sing a long note the way a player does, so in a fight it
  picks the tune fast, which it does well. He did not pick the synth for the tune, so the tune stays
  a guitar's: picked, never held long.
- Heavier: more weight and more bite in the heavy guitars.
- Calmer and dreamier: more air and echo, a slower and softer beat; still a band, so that it does not
  go sleepy as try-out 1 did.
- The synth: made in code, the air only; and it has to sound good, since try-out 1's synth sounds
  were what "felt cheap".

The rulebook was changed with that yes (`docs/sound/RULEBOOK.md`; his doc at rev 37; the project's
copy): Music, rule 2, and the four places that said synths; "Made in code" now names the band's
recordings as its one exception; "Still open" has a ninth thing, how the recordings get into the
game.

## How step 1 was built

`tools/sound/lab/README.md` says what each file is and what was found out. In short:

- **Heavy guitars**: two of them, one to each side, each playing a different recording of every note
  (one reaches up from the recorded note below, the other down from the one above), through an amp
  of filters and three squashing stages and a speaker box of filters (`gtr.RHYTHM`). A palm-muted
  stroke is the open note dulled and cut short, with a recording of a muted stroke under it.
- **Bass**: short and long notes, split into lows kept clean and highs with a little grit.
- **Drums**: every hit through its close microphone and the pair overhead, mixed as a rock record's
  are; the kick's tick brought up by 18 dB above 2 kHz so that a phone's speaker has something of it.
- **Soft guitars**: the same guitar through a clean amp and one on the edge of breaking up, each
  with a speaker box; one strummed, one picked a string at a time with shimmer, echo and a hall.
- **Lead**: one note at a time through a singing amp, with echo and a hall.
- Levels, before each clip was set to the same loudness: at full, guitars -19, bass -21, drums -16.5,
  lead -20 LUFS; holding back, the two guitars -22 together, drums -22, bass -24, lead -22.

## How it was checked

The sound chat cannot hear. What it measured, on the seven MP3s as sent (`tools/sound/lab/check_clips.py`,
`tools/sound/measure.py`):

| Clip | Loudness | True peak | Clicks | A phone's speaker keeps | What three listening models hear (the average, strongest first) |
| --- | --- | --- | --- | --- | --- |
| The band at full | -16.5 LUFS | -2.0 dBFS | 0 | -5.5 dB | Music 0.83, Musical instrument 0.46, Guitar 0.33, Heavy metal 0.30, Plucked string instrument 0.27, Electric guitar 0.19 |
| The band holding back | -16.5 | -1.9 | 0 | -3.9 | Music 0.84, Background music 0.12, Musical instrument 0.11, Video game music 0.09, Soundtrack music 0.06, Exciting music 0.05 |
| The heavy guitars | -16.4 | -8.3 | 0 | -2.7 | Music 0.93, Musical instrument 0.55, Guitar 0.54, Plucked string instrument 0.44, Electric guitar 0.32, Distortion 0.23 |
| The bass | -16.5 | -3.8 | 0 | -7.8 | Music 0.89, Bass guitar 0.64, Musical instrument 0.58, Guitar 0.54, Effects unit 0.50, Plucked string instrument 0.43 |
| The drums | -16.7 | -1.4 | 0 | -9.1 | Drum 0.75, Drum kit 0.72, Bass drum 0.55, Music 0.55, Musical instrument 0.47, Snare drum 0.40 |
| The soft guitars | -16.5 | -2.2 | 0 | -1.6 | Music 0.87, Musical instrument 0.41, Guitar 0.41, Effects unit 0.29, Plucked string instrument 0.27, Distortion 0.24 |
| The lead | -16.5 | -7.3 | 0 | -0.1 | Music 0.89, Musical instrument 0.62, Guitar 0.40, Plucked string instrument 0.32, Effects unit 0.19, Electric guitar 0.14 |

- **The listening models** are the three sizes of CED (527 kinds of sound), as in try-out 1. The most
  any of the three gave to "Synthesizer" on any clip was 0.09 (the bass), to "Drum machine" 0.02 (the
  drums), to "Keyboard (musical)" 0.06 (the lead). Try-out 1's fight never got "Heavy metal"; this
  one does.
- **The band holding back** they call music and name no instrument in it. Each of its parts alone
  they name: the light drums Drum kit 0.70, its bass Bass guitar 0.64, the strummed guitar Guitar
  0.60, the picked one Guitar 0.50, the soft lead Guitar 0.41. Taking parts away showed why: they
  name instruments in pairs, and stop once three or four play together.
- **Tuning.** As recorded, the guitar's notes are from 8 cents flat to 30 sharp in their first tenth
  of a second and from 14 flat to 14 sharp as they ring on; the bass's held notes from 46 flat to 81
  sharp at first and from 12 flat to 50 sharp as they ring; its short notes from 95 flat to 154
  sharp. Each note is moved by its own measure (`make_bank.py`, `dsp.tuned`), and the bass's lowest
  short notes are left out. Played and measured again (`check_play.py`): ringing chords and the bass's
  long loud notes within 4 cents of true; muted strokes up to 15 sharp, picked notes up to 20, the
  bass's short notes up to 21, each measured over its first moments, where a string is sharpest; the
  bass's soft eighth-notes within 6, but for three takes that are 10 to 24 flat.
- **Takes.** The same recording is never played twice running (`dsp.fresh`).
- **On a phone's speaker** (nothing under about 350 Hz): the bass keeps about a sixth of its sound
  (-7.8 dB); a kick drum hit is 1.5 dB under a snare hit there (it was 7 dB under before its tick was
  brought up).
- **The limiter** took off at most 1.9 dB (the drums), watching the sound between the samples too.
- **The page**, as a phone shows it (390 and 320 px wide): no sideways scroll, no label cut short,
  each clip plays, winds along its strip, stops the others, goes back to the top at its end; a clip
  refused to the player is fetched another way, and one that cannot be had says so.
- The repository's copy of the lab makes the seven clips again, sample for sample the same as the
  ones sent.

## NOT CHECKED

- **How any of it sounds.** He is the only one who has heard it.
- A real phone.
- The lead, which he says needs work: nothing measured said so plainly (one model gave "keyboard"
  0.20 to the soft lead alone).
- `fetch_packs.sh` from nothing: its commands are the ones that fetched the packs, put into one
  script afterwards and run again only as far as reaching the three repositories.

## Step 2, being made

The music: exploring and the fight, played by this band with the synth for the air, with two or
three tunes for him to choose between. By his answers: heavier guitars; a tune the guitar picks and
never has to hold; exploring calmer and dreamier; the fight "More" than try-out 1's (his word then:
“More”, of the option "Heavier and wilder, and louder against the exploring."); the four ways kept
(his words:
“I liked them all, and interchanging them gives different opportunities for different attacks.  Half time for slams, racing for a barrage of shots, that kind of thing”).

## For the main chat (nothing to do yet)

- Nothing of yours is touched, and nothing here is in `Play.html`.
- **The one thing that will need you: the band's instruments are recordings.** The game has no sound
  files today. Two ways in, to settle with him once he has said yes to a piece of music:
  1. **The music as finished sound files**, made by the lab and carried by the game. The clips on the
     page are MP3s at 160 kbps, which is 1.2 MB a minute. Try-out 1's design (two halves in step, the
     thrash one opened and shut by the fight) works the same with files: two loops played together.
  2. **A small bank of the recordings, and the music played from notes in the game**, as the lab
     plays it. The whole bank is 499 MB as WAVs, so this needs a much smaller bank and has not been
     sized.
  The first is far the simpler, and gives the rules the beat just the same.
- The rulebook's rule 5 of "How sound is made and approved" now reads that the band's recordings are
  the one exception to "Made in code". If you would rather the game stayed without sound files, say
  so on the board before he is asked to choose.
