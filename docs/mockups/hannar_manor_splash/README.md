# The Hannar Manor Games splash, before the start screen

## What he said (26 Nov 2026)

- Hannar Manor is his family's name for their house; the company is Hannar Manor Games LLC. Its logo: his own sketch, a house whose
  walls spell H and M (“Something this?  With the H and the M incorporated in the drawing”), drawn as variants; his pick, 17:02: “We
  like C.  Can you put it in icon form” (the rounded house, an orange H and a teal M), then, 17:07: “We still like cream but night is
  good.”
- 17:07: “I’d like a title splash screen before the wordsmith title screen.  I’d like it to fade up from black.  The smoke line is
  squiggling above the chimney.  The door opens I guess to black, and you zoom fly through the door to a black screen then to the
  wordsmith title screen.  You can try it with Night and white.  I’d like to see both”.
- Shown both films, asked which goes in the game: “White”.
- 17:24: “Can we change the color inside the door to the line color of the door frame or vise versa?”: the doorway's inside is the
  navy of its frame and of every line; the flight goes into the navy, which goes to black.

## What it is

`hannar-manor-splash-white.mp4` (his pick) and `hannar-manor-splash-night.mp4` (the other look, its doorway black): 9.3 s, 1280x720,
ending on the start screen's backdrop (a still of `godot/assets/title`'s layers, standing for the start screen).

- 0.3–1.8 s up from black: the house (cream ground, navy lines, the H orange, the M teal, the windows lit) and HANNAR MANOR GAMES
  (Poppins: the font of the name in the game's film; the canvas's logo used Baloo 2, not on this machine).
- the smoke: one line rising off the chimney, its wave climbing, wider and leaning as it rises, fading at its top.
- 3.4–4.3 s the door swings in (hinged on its left); 4.2–4.6 s the name fades; 4.5–5.9 s the flight through the doorway, speeding
  up (70 times nearer at its end), the doorway drawn to the middle of the screen; 5.9–6.4 s its navy to black.

## In the game (branch `art/hannar-manor-splash`, from the Godot game's `claude/sharp-lamport-ey7q0l`)

- `godot/assets/splash/hannar_manor_splash.ogv`: the White film at the game's size (960x540), Theora, 6.6 s, ending on black.
- `godot/scripts/splash.gd`: plays it over everything (layer 60) on black, the game held still; when it ends (or a tap, a click or
  a key skips it) it says `done`, and its black fades away over 1.3 s, so the start screen comes up from black. No film: straight on.
- `godot/scripts/main.gd`: `SPLASH` (on), `_splash_up(first)` where the game raised the start screen as it begins for him (not in
  the checks' runs: `--only` set; `--splash=0` to begin without it); `done` raises the start screen (`title_up`).
- `godot/checks/splash_check.gd`: the film loads, plays, ends at about 6.6 s, its black fades and it is gone, a tap skips it.

## Made by

`tools/hannar_manor_splash.py <title still> <out dir>` (both films; `--look white` one; `--frames 2.6,4.1` stills) and `--game`
(the game's .ogv). Needs `rsvg-convert`, `ffmpeg` (libx264, libtheora) and the Poppins font.
