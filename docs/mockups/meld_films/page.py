# Makes the films page (meld_films.html) of the melds at work, from the films the check makes
# (godot: --only=words --cases=m52film, each <id>.mp4 and <id>.jpg) and the approved stones.
#   python3 page.py <films dir> <out dir>        the first 52 (../meld_runes)
#   python3 page.py <films dir> <out dir> 46     the last 46 of floors 1-10 (../meld_runes2)
#   python3 page.py <films dir> <out dir> city   the city's 45 (../meld_runes3)
#   python3 page.py <films dir> <out dir> city2  the city's runes with the floor 6-10 runes, 44 (../meld_runes4), each with what it does
#   python3 page.py <films dir> <out dir> high   the High City's runes melded, 110 (../meld_runes6), each with what it does, and the five level 2
import json, sys, os, shutil, html
HERE = os.path.dirname(os.path.abspath(__file__))
films, out = sys.argv[1], sys.argv[2]
LAST = len(sys.argv) > 3 and sys.argv[3] == '46'
CITY = len(sys.argv) > 3 and sys.argv[3] == 'city'
CITY2 = len(sys.argv) > 3 and sys.argv[3] == 'city2'
HIGHG = len(sys.argv) > 3 and sys.argv[3] == 'high'
RUNES = HERE + ('/../meld_runes6' if HIGHG else '/../meld_runes4' if CITY2 else '/../meld_runes3' if CITY else '/../meld_runes2' if LAST else '/../meld_runes')
# (what each does, as the game has it: melds52.json, made from their designs, tools/meldscity/docs_city2.txt)
WORDS = json.load(open(HERE + '/../../../godot/assets/words/melds52.json'))['words'] if CITY2 or HIGHG else {}
R = json.load(open(RUNES + '/runes.json'))
os.makedirs(out + '/film', exist_ok=True)
os.makedirs(out + '/stones', exist_ok=True)
NAME = {'fire': 'Flame'}
def nm(w): return NAME.get(w, w.capitalize())
groups = {}
CW = ['pulling', 'splitting', 'hexing', 'stilling', 'binding']
for k, v in R.items():
    HC = ['piercing', 'bleeding', 'reaping', 'culling', 'surging']
    groups.setdefault('each' if (CITY and v['of'][1] in CW) or (HIGHG and v['of'][1] in HC) else v['of'][0], []).append(k)
secs = []
have = 0
for a, ks in groups.items():
    cards = []
    for k in ks:
        a0 = R[k]['of'][0]
        shutil.copy(RUNES + '/stones/%s.png' % k, out + '/stones/%s.png' % k)
        if os.path.exists(films + '/%s.mp4' % k):
            have += 1
            shutil.copy(films + '/%s.mp4' % k, out + '/film/%s.mp4' % k)
            shutil.copy(films + '/%s.jpg' % k, out + '/film/%s.jpg' % k)
            vid = '<video src="film/%s.mp4" poster="film/%s.jpg" controls muted playsinline loop preload="none"></video>' % (k, k)
        else:
            vid = '<div class="none">No film</div>'
        does = ''
        if CITY2 or HIGHG:
            w = WORDS[k]
            idea = w['about'].split('melded. ', 1)[-1]
            does = ('<p class="idea">%s</p><dl class="does"><dt>In front</dt><dd>%s</dd><dt>Behind</dt><dd>%s</dd><dt>On enemies</dt><dd>%s</dd></dl>'
                    % (html.escape(idea), html.escape(w['frontText']), html.escape(w['behindText']), html.escape(w['monsterText'])))
        cards.append('<article class="card"><header><img src="stones/%s.png" width="48" height="48" alt=""><div><b>%s</b><span>%s + %s</span></div></header>%s%s</article>'
                     % (k, html.escape(R[k]['name']), nm(a0), nm(R[k]['of'][1]), vid, does))
    secs.append('<section><h2>%s</h2><div class="cards">%s</div></section>' % (("The High City's runes with each other" if HIGHG else "The city's runes with each other") if a == 'each' else nm(a) + ' melds', ''.join(cards)))
if HIGHG:
    rk = []
    for w in ['piercing', 'bleeding', 'reaping', 'culling', 'surging']:
        x = WORDS[w + '2']
        rk.append('<article class="card"><header><div><b>%s</b><span>%s + %s</span></div></header><dl class="does"><dt>In front</dt><dd>%s</dd><dt>Behind</dt><dd>%s</dd><dt>On enemies</dt><dd>%s</dd></dl></article>'
                  % (html.escape(x['name']), nm(w), nm(w), html.escape(x['frontText']), html.escape(x['behindText']), html.escape(x['monsterText'])))
    secs.append('<section><h2>Level 2</h2><div class="cards">%s</div></section>' % ''.join(rk))
page = '''<title>@@TITLE@@</title>
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
.idea { color: #c9cdf2; font-style: italic; font-size: 14px; }
.does { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 13.5px; line-height: 1.45; }
.does dt { font-family: var(--mono); font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: #7af8f0; padding-top: 2px; }
.does dd { margin: 0; color: #e4e7ff; }
.how + .lead { margin-top: 12px; }
.ask { background: var(--panel); border: 1px solid var(--accent); border-radius: 8px; padding: 14px 16px; }
.ask b { font-family: var(--display); font-size: 17px; }
a { color: var(--accent); }
</style>

<div class="wrap">
  <header>
    <div class="eyebrow">Wordsmith · melds · films first</div>
    <h1>@@H1@@</h1>
    <p class="lead">Each meld filmed in the game. Tap a film to play it. Every film runs the same three steps:</p>
    <ol class="how">
      <li>The meld in front of the Strike, swung twice at a pack of skeletons.</li>
      <li>The meld behind the Strike, swung twice.</li>
      <li>A skeleton carrying the meld comes for the hero.</li>
    </ol>
    @@NOTES@@
    @@RULES@@
  </header>
  @@SECS@@
  <div class="ask"><b>Your call</b><p>Tell me in the chat to switch them on, or which ones to change. They stay switched off until you say yes.</p></div>
</div>
'''.replace('@@SECS@@', ''.join(secs))
RULES_98 = '<p class="lead">Checked against your Art Rulebook and fixed (shapes, size, the hero kept clear, the freeze on big blows, the colours you said yes to, and every film now shows the meld on a monster): <a href="https://claude.ai/artifact/QNsqwTYmHsxKbx4E9GHBzY">the rules check</a>.</p>'
if HIGHG:
    page = page.replace('@@TITLE@@', 'High City Melds').replace('@@H1@@', "The High City's runes melded: 110 melds and 5 level 2 runes").replace('@@RULES@@',
        '<p class="lead">Redone from the start, each meld on its own, as you asked: its own idea, its own stone, its own rules in front of a move, behind it and on '
        'a monster, and its own look. No stone is half of one rune and half of the other: each is a new symbol, checked against every stone before it so none repeats. '
        'Plundering and Greed never meld, as you said; Mirroring, now the rare copier of items, is left out. '
        'The looks follow your Art Rulebook: the big moments flash, throw their sparks wide, kick the screen and hold a tenth of a second; every shape is the thing it is '
        '(a lance, a hook, thorns, a gravestone, a guillotine\'s blade, a noose, a bell, a wave); nothing on a monster glows a friend\'s cyan, and what a monster lays on you is in the enemy\'s pink and gold.</p>'
        '<p class="lead">Then, at your word, the 20 least exciting were found and redone, and then 20 more: each of the 110 scored on how much '
        'each of its twists shows in play, the lowest given new twists you see happen, their names, ideas and stones kept. '
        'Round one: Impaler, Witchpin, Artery, Hemorrhage, Papercut, Gangrene, Bloodfeast, Thornshield, Bloodhex, Ghoul, Deadeye, Macabre, '
        'Gravewarden, Fetch, Bloodprice, Mercy, Last Rites, Heartbeat, Bastion, Bloodharvest. Round two: Bodkin, Coup, Massacre, Barrage, '
        'Bloodlance, Bloodrage, Dart, Harrow, Harvest, Lacerate, Spearwall, Thornspray, Undying, Wraithstep, Deathwatch, Flicker, Haunting, '
        'Spark, Purge, Stinger.</p>'
        '@@CHECKED@@').replace('@@NOTES@@',
        '<p class="lead">Each film shows the meld in front of the Strike, then behind it, then carried by a skeleton that comes for you. '
        'What each one waits on is set up: a kill for Reaping, skeletons brought low for Culling, a third use and a dodge for Surging, '
        'and for some their own moment (skeletons bleeding, burning, poisoned, cursed, chilled or slowed; his frenzy full; a critical; his shield up).</p>')
elif CITY2:
    page = page.replace('@@TITLE@@', 'City and Wilds Melds').replace('@@H1@@', "The city's runes with the floor 6–10 runes: 44 melds").replace('@@RULES@@',
        '<p class="lead">Each card is the whole meld for your yes in one place: its stone, its idea, what it does in front, behind and on enemies, and its film. '
        'Made by your Art Rulebook: big moments flash and throw their sparks wide, the blasts kick the screen and hold a tenth of a second, every shape the thing it is '
        '(a stagger\'s stars, drops of blood running to you, a sight on the marked, the frenzy\'s flames, a shield\'s face, the curse\'s thorns, a clock\'s hand, a cuff and chain, a net), '
        'and a curse or slow a monster lays on you in the enemy\'s pink and gold. Implode, Pulling and Volatile, is already in the game.</p>').replace('@@NOTES@@',
        '<p class="lead">Some melds wait on something, so their films set it up: the skeletons start cursed for the Hexing melds that need it, slowed for the Stilling ones, '
        'held for the Binding ones; his frenzy starts full for Riot, Quickening and Whirlpool; Evil Eye strikes certain criticals; Hexblast, Slow Fuse and Tripwire '
        'strike skeletons nearly dead so they burst. Behind, the film waits for each vortex to end and walks a skeleton onto each snare. For Talisman, his shield is up as the skeleton comes, so its curse on what strikes the shield shows.</p>')
elif CITY:
    page = page.replace('@@TITLE@@', 'City Meld Films').replace('@@H1@@', "The city's 45 melds at work").replace('@@RULES@@',
        '<p class="lead">Made by your Art Rulebook: as big and wild as they go, the heavy ones kick the screen and hold a tenth of a second, '
        'every shape the thing it is (thorns, chains, spikes, tongues of flame, swirling arms, a lump of amber), nothing on a monster in a friend\'s cyan '
        '(Frostlock and Constellation smoulder in Frost\'s deep blue there), and a curse a monster lays on you in the enemy\'s pink and gold.</p>').replace('@@NOTES@@',
        '<p class="lead">Some melds wait on something, so their films set it up: the skeletons start cursed for Doom, Plague, Hoarfrost, Brimstone, Whisper, Beckon, '
        'Torpor and Witchknot, slowed for Stasis, Frostlock, Slow Burn, Stormglass, Timeslip and Torpor, held for Shackle, Icebound, Firetrap, Tether and Witchknot, '
        'chilled for Drift and Icebound. Behind, the film waits for each vortex to collapse, and walks a skeleton onto each snare so it springs.</p>')
elif LAST:
    page = page.replace('@@RULES@@', RULES_98).replace('@@TITLE@@', 'Last Meld Films').replace('@@H1@@', 'The last 46 melds of floors 1 to 10 at work').replace('@@NOTES@@',
        '<p class="lead">Some melds only show in certain moments, so their films set those up: Glide, Firewalk, Quicksilver and Charge show while he moves, '
        'so he darts aside after each swing; Onrush, Hornet and the movers get a burst of speed; Lifeline runs at low life; Hair Trigger\'s skeletons are '
        'left nearly dead; Double Tap, Lancet, Detonator and Vendetta strike certain criticals; the frenzy melds start with a frenzy built up; for the Guarding melds his shield is up as the skeleton comes. Hourglass behind '
        'works on what a blow leaves on the ground, so in its film Guarding sits beside it and leaves a ward.</p>')
else:
    page = page.replace('@@RULES@@', RULES_98).replace('@@TITLE@@', 'Meld Films').replace('@@H1@@', 'The 52 melds at work').replace('@@NOTES@@',
        '<p class="lead">Blink and Tailwind show only while he moves, so in their films he darts aside after each swing. For the Guarding melds his shield is up as the skeleton comes.</p>')
open(out + '/meld_films.html', 'w').write(page)
print('films', have, 'of', len(R))
