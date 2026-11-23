# Makes the films page (meld_films.html) of the 52 melds at work, from the films the check makes
# (godot: --only=words --cases=m52film, each <id>.mp4 and <id>.jpg) and the approved stones (../meld_runes/stones).
#   python3 page.py <films dir> <out dir>
import json, sys, os, shutil, html
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(HERE + '/../meld_runes/runes.json'))
films, out = sys.argv[1], sys.argv[2]
os.makedirs(out + '/film', exist_ok=True)
os.makedirs(out + '/stones', exist_ok=True)
NAME = {'fire': 'Flame'}
def nm(w): return NAME.get(w, w.capitalize())
groups = {}
for k, v in R.items():
    groups.setdefault(v['of'][0], []).append(k)
secs = []
have = 0
for a, ks in groups.items():
    cards = []
    for k in ks:
        shutil.copy(HERE + '/../meld_runes/stones/%s.png' % k, out + '/stones/%s.png' % k)
        if os.path.exists(films + '/%s.mp4' % k):
            have += 1
            shutil.copy(films + '/%s.mp4' % k, out + '/film/%s.mp4' % k)
            shutil.copy(films + '/%s.jpg' % k, out + '/film/%s.jpg' % k)
            vid = '<video src="film/%s.mp4" poster="film/%s.jpg" controls muted playsinline loop preload="none"></video>' % (k, k)
        else:
            vid = '<div class="none">No film</div>'
        cards.append('<article class="card"><header><img src="stones/%s.png" width="48" height="48" alt=""><div><b>%s</b><span>%s + %s</span></div></header>%s</article>'
                     % (k, html.escape(R[k]['name']), nm(a), nm(R[k]['of'][1]), vid))
    secs.append('<section><h2>%s melds</h2><div class="cards">%s</div></section>' % (nm(a), ''.join(cards)))
page = '''<title>Meld Films</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* The game's night indigo and friendly cyan; each film on the dark it was shot on. */
:root {
  --bg: #f2f3fb; --panel: #ffffff; --line: #d4d8ef; --fg: #161a3a; --muted: #5a618c; --accent: #0c8fa3; --stage: #0e0c24; --stagefg: #e4e7ff;
  --display: "Chakra Petch", "Trebuchet MS", system-ui, sans-serif;
  --body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #0d1030; --panel: #161a44; --line: #2c3274; --fg: #e9ecff; --muted: #a3abd8; --accent: #28dcf0; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #0d1030; --panel: #161a44; --line: #2c3274; --fg: #e9ecff; --muted: #a3abd8; --accent: #28dcf0; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 15px; line-height: 1.5; }
.wrap { max-width: 980px; margin: 0 auto; padding-block: 24px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px; }
.wrap > * { min-width: 0; }
.eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
h1 { font-family: var(--display); font-weight: 700; font-size: clamp(28px, 7vw, 38px); line-height: 1.1; margin: 4px 0 8px; text-wrap: balance; }
h2 { font-family: var(--display); font-weight: 600; font-size: 20px; margin: 0 0 12px; }
p { margin: 0; max-width: 66ch; }
.lead { color: var(--muted); }
ol.how { margin: 10px 0 0; padding-left: 20px; color: var(--muted); display: grid; gap: 4px; }
img { image-rendering: pixelated; display: block; max-width: 100%; height: auto; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 12px; }
.card { background: var(--stage); color: var(--stagefg); border-radius: 8px; padding: 10px; display: grid; gap: 8px; min-width: 0; }
.card header { display: flex; align-items: center; gap: 10px; }
.card header div { display: grid; }
.card b { font-family: var(--display); font-weight: 600; font-size: 17px; }
.card span { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #7af8f0; }
video { width: 100%; height: auto; aspect-ratio: 10 / 7; border-radius: 4px; background: #05040f; display: block; }
.none { color: #a3abd8; font-size: 13px; padding: 20px 0; text-align: center; }
.how + .lead { margin-top: 12px; }
.ask { background: var(--panel); border: 1px solid var(--accent); border-radius: 8px; padding: 14px 16px; }
.ask b { font-family: var(--display); font-size: 17px; }
</style>

<div class="wrap">
  <header>
    <div class="eyebrow">Wordsmith · melds · films first</div>
    <h1>The 52 melds at work</h1>
    <p class="lead">Each meld filmed in the game. Tap a film to play it. Every film runs the same three steps:</p>
    <ol class="how">
      <li>The meld in front of the Strike, swung twice at a pack of skeletons.</li>
      <li>The meld behind the Strike, swung twice.</li>
      <li>A skeleton carrying the meld comes for the hero.</li>
    </ol>
    <p class="lead">Blink and Tailwind show only while he moves, so in their films he darts aside after each swing. For the Guarding melds his shield is up as the skeleton comes.</p>
  </header>
  @@SECS@@
  <div class="ask"><b>Your call</b><p>Tell me in the chat to switch them on, or which ones to change. They stay switched off until you say yes.</p></div>
</div>
'''.replace('@@SECS@@', ''.join(secs))
open(out + '/meld_films.html', 'w').write(page)
print('films', have, 'of', len(R))
