# THE REAPING CREATURES' PAGE, for his yes (his "Yes and work on reaping", 24 Nov 2026): each of the five melds of Reaping with a
# damage rune, its stone, its creature close up (stood, mid-attack, from behind, and risen against him in the enemy's pink), its
# film at work in the game, and what it does; and all ten standing in the game.
#   python3 docs/mockups/reap5/page.py <films dir> <lineup png> <out dir>
import sys, os, json, shutil, html
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(HERE + '/../../..')
sys.path.insert(0, ROOT + '/tools/reap5')
from sculpt import render, crop, FRIEND, ENEMY
from creatures import CREATURES
films, lineup, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out + '/film', exist_ok=True)
os.makedirs(out + '/pics', exist_ok=True)
W52 = json.load(open(ROOT + '/godot/assets/words/melds52.json'))
R5 = json.load(open(ROOT + '/docs/mockups/meld_runes5/runes.json'))
KIND = {"cinderbrood": "imp", "wintergrave": "rimeling", "stormwake": "stormwisp", "bogborn": "toad", "charnel": "bonebrute"}
CNAME = {"imp": "Imp", "rimeling": "Rimeling", "stormwisp": "Stormwisp", "toad": "Blight Toad", "bonebrute": "Bonebrute"}
RUNE = {"fire": "Flame", "frost": "Frost", "lightning": "Lightning", "poison": "Poison", "power": "Power"}

def pic(kind, an, frac, side, face, path, z=5):
    C = CREATURES[kind]
    W, H = C['canvas']; ox, oy = C['origin']
    n = C['frames'][an]
    res = C['make'](an, int(frac * n) / n, side)
    yaw = C['yaw_front'] if face == 'f' else C['yaw_back']
    im = render(res[0], yaw, res[1], W, H, ox, oy, side=FRIEND if side == 'friend' else ENEMY, post=res[2] if len(res) > 2 else None, scale=C.get('scale', 1.0))
    im = Image.fromarray(im)
    im.resize((im.width * z, im.height * z), Image.NEAREST).save(path)

cards = []
for k in W52['reap']:
    kind = KIND[k]
    w = W52['words'][k]
    shutil.copy(ROOT + '/docs/mockups/meld_runes5/stones/%s.png' % k, out + '/pics/%s_stone.png' % k)
    hit = CREATURES[kind]['hit']
    shots = []
    for tag, an, fr, side, face, cap in (('stand', 'idle', 0.0, 'friend', 'f', 'Fighting for you'), ('attack', 'attack', hit - 0.12, 'friend', 'f', 'Winding up'),
                                         ('back', 'walk', 0.25, 'friend', 'b', 'From behind'), ('foe', 'idle', 0.0, 'foe', 'f', 'Risen against you')):
        p = 'pics/%s_%s.png' % (kind, tag)
        pic(kind, an, fr, side, face, out + '/' + p)
        shots.append('<figure><img src="%s" alt="%s, %s"><figcaption>%s</figcaption></figure>' % (p, CNAME[kind], cap.lower(), cap))
    vid = '<div class="none">No film</div>'
    if os.path.exists(films + '/%s.mp4' % k):
        shutil.copy(films + '/%s.mp4' % k, out + '/film/%s.mp4' % k)
        shutil.copy(films + '/%s.jpg' % k, out + '/film/%s.jpg' % k)
        vid = '<video src="film/%s.mp4" poster="film/%s.jpg" controls muted playsinline loop preload="none"></video>' % (k, k)
    idea = w['about'].split('melded. ', 1)[-1]
    cards.append('''<article class="meld">
<header><img class="stone" src="pics/%s_stone.png" width="48" height="48" alt=""><div><h2>%s</h2><span>Reaping + %s &middot; the %s</span></div></header>
<p class="idea">%s</p>
<div class="beasts">%s</div>
<div class="film">%s<p class="cap">In the game: in front of the Strike, then behind it, then carried by an enemy that comes for him.</p></div>
<dl class="does"><dt>In front</dt><dd>%s</dd><dt>Behind</dt><dd>%s</dd><dt>On enemies</dt><dd>%s</dd></dl>
</article>''' % (k, html.escape(w['name']), RUNE[w['of'][1]], CNAME[kind], html.escape(idea), ''.join(shots), vid,
                 html.escape(w['frontText']), html.escape(w['behindText']), html.escape(w['monsterText'])))

li = Image.open(lineup)
wl, hl = li.size
li.crop((wl // 2 - 260, hl // 2 - 330, wl // 2 + 520, hl // 2 + 170)).save(out + '/pics/lineup.png')

page = '''<title>Reaping Creatures</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
/* The game's night indigo, the friend's cyan; each creature on the dark it fights on. */
:root {
  --bg: #f2f3fb; --panel: #ffffff; --line: #d4d8ef; --fg: #161a3a; --muted: #5a618c; --accent: #0c8fa3; --stage: #0e0c24; --stagefg: #e4e7ff;
  --display: "Chakra Petch", "Trebuchet MS", system-ui, sans-serif;
  --body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0b0a1c; --panel: #141230; --line: #2a2752; --fg: #e4e7ff; --muted: #9aa0d0; --accent: #28dcf0; color-scheme: dark } }
:root[data-theme="dark"] { --bg: #0b0a1c; --panel: #141230; --line: #2a2752; --fg: #e4e7ff; --muted: #9aa0d0; --accent: #28dcf0; color-scheme: dark }
body { background: var(--bg); color: var(--fg); font: 15px/1.55 var(--body); }
main { max-width: 980px; margin: 0 auto; padding-block: 28px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1 { font: 700 30px/1.15 var(--display); letter-spacing: .02em; margin: 0 0 6px; text-wrap: balance; }
.lede { color: var(--muted); max-width: 64ch; margin: 0 0 8px; }
.quote { border-left: 3px solid var(--accent); padding: 2px 0 2px 12px; margin: 14px 0 22px; max-width: 64ch; }
.status { display: inline-block; font: 600 12px var(--body); letter-spacing: .06em; text-transform: uppercase; color: var(--accent); margin-bottom: 18px; }
.stage { background: var(--stage); color: var(--stagefg); border-radius: 10px; overflow: hidden; }
.stage img { display: block; width: 100%; height: auto; image-rendering: pixelated; }
.stage p { margin: 0; padding: 10px 14px; font-size: 13px; color: #b8bde8; }
.meld { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 18px; margin: 22px 0; }
.meld header { display: flex; gap: 12px; align-items: center; }
.meld header h2 { font: 700 22px/1.1 var(--display); margin: 0; letter-spacing: .02em; }
.meld header span { color: var(--muted); font-size: 13px; }
.stone { image-rendering: pixelated; flex: none; }
.idea { font-style: italic; color: var(--muted); margin: 10px 0 12px; }
.beasts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.beasts figure { margin: 0; background: var(--stage); border-radius: 8px; padding: 8px 4px 6px; text-align: center; }
.beasts img { max-width: 100%; height: auto; image-rendering: pixelated; }
.beasts figcaption { color: #b8bde8; font-size: 12px; }
.film { margin-top: 12px; background: var(--stage); border-radius: 8px; overflow: hidden; }
.film video { display: block; width: 100%; height: auto; }
.film .cap { margin: 0; padding: 8px 12px; font-size: 12px; color: #b8bde8; }
.none { color: #b8bde8; padding: 30px; text-align: center; }
.does { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 14px; margin: 14px 0 0; }
.does dt { font-weight: 600; color: var(--accent); }
.does dd { margin: 0; }
@media (max-width: 640px) { .beasts { grid-template-columns: repeat(2, minmax(0, 1fr)); } .does { grid-template-columns: minmax(0, 1fr); } .does dd { margin-bottom: 6px; } }
</style>
<main>
<h1>Reaping Creatures</h1>
<div class="status">Third pass &middot; built and switched off &middot; waiting for your yes</div>
<p class="lede">The third pass, at your word: the Rimeling made one smooth hooded wraith, no lumps; the Stormwisp a true wisp, a crackling ball of storm-light with no body or face. The others as in the second pass: bigger, facing you, in bold tones with purple shadows, with the deep outline and the soft edge of light the game's own monsters have.</p>
<p class="quote">“Like reaping and fire makes little imps that throw fireballs instead of the shades.  What would the others be?”</p>
<p class="lede">Five new melds put Reaping together with Flame, Frost, Lightning, Poison and Power. Behind an attack, what you kill rises as that rune's own creature in place of the grey spirit, with a cyan edge because it fights for you. An enemy carrying one rises as the same creature against you, with a pink edge, and every blow it throws is marked on the floor first so you can step out of it.</p>
<section class="stage"><img src="pics/lineup.png" alt="All five creatures standing in the game: his in cyan beside him, the five risen against him in pink"><p>All ten in the game: the five fighting for you (cyan) beside the knight, and the five risen against you (pink) behind them.</p></section>
@@CARDS@@
</main>
'''
open(out + '/index.html', 'w').write(page.replace('@@CARDS@@', '\n'.join(cards)))
print('page', out)
