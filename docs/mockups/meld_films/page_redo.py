# Makes the films page of ALL MELDS: THE LEAST EXCITING REDONE (his "Next I want you to look at the larger pool of all melds, and
# redo the 20 weakest.  Then do it again.  Then do it a third time.", 24 Nov 2026): the 60 redone in three rounds, each with its
# stone (the game's own: loot/icons.png for the game's first melds, words/melds52.png for the rest), its film, its new texts and,
# folded, what it did before.
#   python3 page_redo.py <films dir> <out dir>
# The films: godot --fixed-fps 30 -- --only=words --cases=m52film:redo --shots=<films dir> (each <id>.mp4 and <id>.jpg in film/).
import json, sys, os, shutil, html
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
G = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'godot', 'assets'))
films, out = sys.argv[1], sys.argv[2]
T = json.load(open(G + '/words/melds52.json'))
W = json.load(open(G + '/words/words.json'))['words']
ICONS = {p['key']: p for p in json.load(open(G + '/loot/icons.json'))}
icons = Image.open(G + '/loot/icons.png').convert('RGBA')
sheet52 = Image.open(G + '/words/melds52.png').convert('RGBA')
os.makedirs(out + '/film', exist_ok=True)
os.makedirs(out + '/stones', exist_ok=True)
NAME = {'fire': 'Flame'}


def nm(w):
    return NAME.get(w, W[w]['name'] if w in W else w.capitalize())


def word(k):
    return T['words'][k] if k in T['words'] else W[k]


def parts(k):
    return T['of'].get(k) or W[k].get('of') or []


def stone(k):
    if 'word:' + k in ICONS:
        p = ICONS['word:' + k]
        im = icons.crop((p['x'], p['y'], p['x'] + p['w'], p['y'] + p['h']))
    else:
        x, y = T['stones'][k]
        im = sheet52.crop((x, y, x + 24, y + 24))
    im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(out + '/stones/%s.png' % k)


ROUND_NOTE = ['All 325 melds scored, the 20 least exciting redone.', 'Scored again, the next 20.', 'Scored a third time, the next 20.']
secs = []
have = 0
for r, ks in enumerate(T['redoRounds']):
    cards = []
    for k in ks:
        stone(k)
        w = word(k)
        new = T['redo'][k]
        if os.path.exists(films + '/film/%s.mp4' % k):
            shutil.copy(films + '/film/%s.mp4' % k, out + '/film/%s.mp4' % k)
            shutil.copy(films + '/film/%s.jpg' % k, out + '/film/%s.jpg' % k)
            vid = '<video controls muted loop playsinline preload="none" poster="film/%s.jpg"><source src="film/%s.mp4" type="video/mp4"></video>' % (k, k)
            have += 1
        else:
            vid = '<div class="none">No film</div>'
        idea = w.get('about', '').split('melded. ', 1)[-1]
        a, b = (parts(k) + ['', ''])[:2]
        before = ('<details><summary>What it did before</summary><dl class="does was"><dt>In front</dt><dd>%s</dd><dt>Behind</dt><dd>%s</dd><dt>On enemies</dt><dd>%s</dd></dl></details>'
                  % (html.escape(w.get('frontText', '')), html.escape(w.get('behindText', '')), html.escape(w.get('monsterText', '') or 'Its two runes’ own, and a twist of its own.')))
        cards.append('<article class="card"><header><img src="stones/%s.png" width="48" height="48" alt=""><div><b>%s</b><span>%s + %s</span></div></header>%s'
                     '%s<dl class="does"><dt>In front</dt><dd>%s</dd><dt>Behind</dt><dd>%s</dd><dt>On enemies</dt><dd>%s</dd></dl>%s</article>'
                     % (k, html.escape(w['name']), nm(a), nm(b), vid, ('<p class="idea">%s</p>' % html.escape(idea)) if idea else '',
                        html.escape(new['frontText']), html.escape(new['behindText']), html.escape(new['monsterText']), before))
    secs.append('<section><h2>Round %d</h2><p class="lead">%s</p><div class="cards">%s</div></section>' % (r + 1, ROUND_NOTE[r] if r < len(ROUND_NOTE) else '', ''.join(cards)))

page = '''<title>Melds Redone</title>
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
h2 { font-family: var(--display); font-weight: 600; font-size: 20px; margin: 0 0 4px; }
section > .lead { margin-bottom: 12px; }
p { margin: 0; max-width: 66ch; }
.lead { color: var(--muted); }
header .lead + .lead { margin-top: 10px; }
ol.how { margin: 10px 0 0; padding-left: 20px; color: var(--muted); display: grid; gap: 4px; }
img { image-rendering: pixelated; display: block; max-width: 100%; height: auto; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 12px; }
.card { background: var(--stage); color: var(--stagefg); border-radius: 8px; padding: 10px; display: grid; gap: 8px; min-width: 0; align-content: start; }
.card header { display: flex; align-items: center; gap: 10px; }
.card header div { display: grid; }
.card b { font-family: var(--display); font-weight: 600; font-size: 17px; }
.card span { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #7af8f0; }
video { width: 100%; height: auto; aspect-ratio: 10 / 7; border-radius: 4px; background: #05040f; display: block; }
.none { color: #a3abd8; font-size: 13px; padding: 20px 0; text-align: center; }
.idea { color: #c9cdf2; font-style: italic; font-size: 14px; }
.does { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 13.5px; line-height: 1.45; }
.does dt { font-family: var(--mono); font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: #7af8f0; padding-top: 2px; }
.does dd { margin: 0; color: #e4e7ff; }
details { font-size: 13px; color: #a3abd8; }
details summary { cursor: pointer; font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
.was { margin-top: 6px; }
.was dd { color: #a3abd8; }
.ask { background: var(--panel); border: 1px solid var(--accent); border-radius: 8px; padding: 14px 16px; }
.ask b { font-family: var(--display); font-size: 17px; }
</style>

<div class="wrap">
  <header>
    <div class="eyebrow">Wordsmith · melds · redone · films first</div>
    <h1>The 60 least exciting melds, redone</h1>
    <p class="lead">At your word: all 325 melds scored on how much each twist shows in play (a new thing you see happen, a change to something already there, or numbers only; in front counted twice), the 20 lowest redone, then scored again and the next 20, three times. Each keeps its name, its idea, its stone and what it did, and gains on every side a moment you see happen. They stay switched off until you say yes.</p>
    <p class="lead">Every film runs the same three steps:</p>
    <ol class="how">
      <li>The meld in front of the Strike, at a pack of skeletons.</li>
      <li>The meld behind the Strike.</li>
      <li>A skeleton carrying the meld, against the hero.</li>
    </ol>
    @@CHECKED@@
  </header>
  @@SECS@@
  <div class="ask"><b>Your call</b><p>Tell me in the chat to switch them on, or which ones to change.</p></div>
</div>
'''
page = page.replace('@@SECS@@', ''.join(secs)).replace('@@CHECKED@@', open(out + '/checked.html').read() if os.path.exists(out + '/checked.html') else '')
open(out + '/melds_redone.html', 'w').write(page)
print('films', have, 'of', sum(len(r) for r in T['redoRounds']))
