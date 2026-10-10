# The sound lab

Where the band is tried out before anything is built for the game. It plays recordings of real
instruments from lists of notes, in Python, with tools that each have a twin among the game's own
(Web Audio's filters, squashing curves, delays, convolver and compressor), so that what is found here
can be built there the same way. Nothing in the game loads any of this.

The record of what was made with it, and what the owner said: `docs/sound/music_tryout2.md`.

## To make the sound check again

```
tools/sound/fetch_packs.sh dist/sound/packs                       # about 1 GB, from github.com/sfzinstruments
python3 tools/sound/make_bank.py dist/sound/packs dist/sound/bank # 1547 recordings, and their tuning measured
python3 tools/sound/lab/sounds.py                                 # the seven clips, into dist/sound/lab/sounds/
```

Then each WAV to an MP3 (`ffmpeg -i x.wav -c:a libmp3lame -b:a 160k -ar 48000 x.mp3`) beside the page,
`tools/sound/pages/band_sound_check.html`, in a folder `clips/`.

`dist/` is not in the repository. The bank, the listening models and what the lab makes can each be
put somewhere else: see `where.py`.

The listening models (the "borrowed ears") are the three sizes of CED from the release
"audio-tagging-models" of github.com/k2-fsa/sherpa-onnx, unpacked into `dist/sound/ear/`:
`sherpa-onnx-ced-mini-audio-tagging-2024-04-19`, `...-small-...` and `...-base-...`.

## What is where

| File | What it is |
| --- | --- |
| `dsp.py` | Web Audio's filters and squashing in numpy; loading a recording; `tuned()` (how sharp a recording is for a note held so long); `fresh()` (never the same take twice running) |
| `gtr.py` | The guitar: strokes (chug, ring, pick, stab, stop), a lead line, the heavy amp and its speaker, the clean amp and the one on the edge of breaking up |
| `strings.py` | The guitar's six strings for clean playing: a string struck again stops its last note; strums |
| `bass.py` | The bass: short and long notes, and its amp |
| `drums.py` | The kit: each hit through its close microphone and the pair overhead; the mix; the four ways of the thrash half and the light beat |
| `fx.py` | Rooms, echo, shimmer (chorus), compressor, limiter, and the rounding-off of the drums' tallest peaks |
| `mixing.py` | Loudness (LUFS, by ffmpeg) and setting parts against each other |
| `ear.py` | The listening models |
| `pitch.py` | How far a note is from true pitch: a comb of its partials fitted to the sound (tested on made-up notes: `python3 pitch.py`) |
| `sounds.py` | Try-out 2, step 1: the seven clips |
| `synth.py` | The band's synth, made in code: soft held chords (warm for exploring, thin and bright for a fight) |
| `tunes.py` | Try-out 2, step 2: three tunes, each played exploring, in a fight and exploring again; `check` tests every note against its chord; the parts are kept on disk and `remake` makes some again |
| `extras.py` | Step 2's two small clips: the heavy guitars before and heavier, and the synth alone |
| `check_music.py` | The checks on a tune's clip, stretch by stretch |
| `check_play.py` | Are the notes the lab plays in tune? (`tunes`: the notes step 2 plays; slow, give it twenty minutes) |
| `check_clips.py` | The checks on the finished MP3s: loudness, true peak, clicks, and what the models hear |
| `search_amp.py` | The climb that found the heavy amp's settings |

## Things found out here, worth keeping

- **A string struck hard is sharp at first.** The guitar's low notes at their loudest are 20 to 30
  cents sharp over their first tenth of a second, and settle; the bass's lowest short notes (its E
  string tuned down to C sharp) are 80 to 150 cents sharp and not steady, so they are not used.
  `make_bank.py` measures every note early and late, and the players move each note by the measure
  that fits how long it is held.
- **A guitar plugged straight in is taken for an electric piano.** What makes it a guitar to the
  listening models: a speaker box, a little breaking up, strums, and one note at a time on each
  string. Its lower notes (up to about the F above middle C) are far more plainly a guitar to them
  than the octave above.
- **The kick drum's close microphone hears only its thump** (from the 250 Hz octave up, everything
  is 24 dB or more under it). The beater's tick is there, far down: a high shelf of 18 dB at 2 kHz brings it up,
  and with it the kick is 1.5 dB under the snare on a phone's speaker in place of 7, and the band
  reads more as heavy metal to the models, not less.
- **More grit on the bass reads as a synthesizer.**
- **The listening models stop naming instruments once three or four play together.** Pairs they
  name; a whole soft band is "music". So a whole mix is judged by what kind of music they call it,
  and its parts are judged alone.
- **Weight is in the low octaves.** Against the usual slope of a heavy record, the sound check's
  band was thin from 100 to 300 Hz; the wall's lows were brought up to match. A phone's speaker plays
  none of that, so there the weight has to come from the guitars' body (350 to 900 Hz): less scoop.
- **A note picked fast must not be cut at each stroke** (it sounds like a machine): each stroke dips
  and dies away under the next (`gtr.tremolo`).
- **A tune plucked on one string, each note cutting off the last, is taken for a keyboard.** On two
  strings turn about, each note rings on under the next.
- **Do not mix by the listening models alone.** Lower or duller drums make a fight read as video
  game music; a buried lead pleases them and hides the tune.
