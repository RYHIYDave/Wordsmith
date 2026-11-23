# Makes meld_runes.html, the picture page of the 52 meld runes and the 11 level 2 runes, from runes.json and stones/.
import json, html
D = __file__.rsplit('/', 1)[0]
R = json.load(open(D + '/runes.json'))
NAME = {'fire': 'Flame'}
def nm(w): return NAME.get(w, w.capitalize())
SHOWS = {
 'onslaught': 'Two blows, one on the other', 'viper': 'Two fangs, two drops of venom', 'flashfreeze': 'Two shards of ice',
 'rekindle': 'A flame catching a second', 'flurry': 'Four quick slashes', 'aftershock': 'A blow, and its echo below',
 'bloodlust': 'A swollen blood tick', 'coldblood': 'A drop of blood, frost at its heart', 'conduit': 'A drop with a spark running through it',
 'secondwind': 'Breath drawn into a leaf', 'marrow': 'A bone, its marrow glowing',
 'quickfuse': 'A bomb on a short fuse', 'concussion': 'A burst ringing out over the ground',
 'duelist': 'Two crossed blades', 'needle': 'A needle, venom at its tip', 'brand': 'A burning mark in its frame',
 'seeker': 'An eye with a spark for a pupil', 'quickdraw': 'An arrow loosed', 'pressurepoint': 'One point, marked from four sides',
 'berserk': 'Claw marks over a roar', 'fever': 'A fever rising', 'whiteout': 'Snow driving sideways',
 'overcharge': 'A cell brimming with spark', 'blur': 'Speed, with afterimages', 'juggernaut': 'A heavy iron helm',
 'bulwark': 'A shield with a strong boss', 'hemlock': 'A sprig of hemlock', 'cinderward': 'A shield with a flame in it',
 'static': 'A shield crackling', 'windward': 'A shield with wind across it', 'fortress': 'A fortress gate',
 'momentum': 'A wedge that keeps growing', 'canker': 'An hourglass of venom', 'permafrost': 'Frost locked in a frame',
 'smoulder': 'Coals still glowing, smoke rising', 'tempest': 'A storm cloud that stays', 'tailwind': 'Wind at your back',
 'bedrock': 'Layers of stone',
 'haymaker': 'One huge fist', 'bloat': 'A swollen sac about to burst', 'coldsnap': 'Icicles snapping off',
 'flashfire': 'A flame flaring, sparks flying', 'jolt': 'A sudden bolt', 'blink': 'Gone from one spot, there in the next',
 'daze': 'Stars spinning',
 'cataclysm': 'A falling star and its crater', 'miasma': 'Poison drifting in waves', 'glacier': 'A mountain of ice',
 'inferno': 'A wide blaze', 'stormfront': 'A storm cloud, bolts falling', 'gale': 'A great wind', 'earthquake': 'The ground cracking open',
}
assert set(SHOWS) == set(R), set(R) ^ set(SHOWS)
groups = {}
for k, v in R.items(): groups.setdefault(v['of'][0], []).append(k)
RANKS = ['twin', 'leech', 'volatile', 'precise', 'frenzied', 'guarding', 'lasting', 'fleeting', 'vast', 'swift', 'heavy']

out = []
for a, ks in groups.items():
    cards = ''.join(
        f'<div class="card"><img src="stones/{k}.png" width="96" height="96" alt="The {html.escape(R[k]["name"])} rune">'
        f'<b>{html.escape(R[k]["name"])}</b><span class="of">{nm(a)} + {nm(R[k]["of"][1])}</span>'
        f'<span class="shows">{SHOWS[k]}</span></div>' for k in ks)
    out.append(f'<section><h2><img src="stones/base_{a}.png" width="48" height="48" alt="">{nm(a)} melds <small>{len(ks)}</small></h2>'
               f'<div class="cards">{cards}</div></section>')
ranks = ''.join(
    f'<div class="pair"><img src="stones/base_{w}.png" width="96" height="96" alt="{nm(w)}"><span class="arrow">→</span>'
    f'<img src="stones/{w}2.png" width="96" height="96" alt="{nm(w)} II"><b>{nm(w)} II</b></div>' for w in RANKS)

page = f'''<title>Meld Runes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* The game's night indigo and friendly cyan; the stones on the dark of the gear screen, pixel art crisp. */
:root {{
  --bg: #f2f3fb; --panel: #ffffff; --line: #d4d8ef; --fg: #161a3a; --muted: #5a618c; --accent: #0c8fa3; --stage: #0e0c24; --stagefg: #e4e7ff; --stagemuted: #a3abd8;
  --display: "Chakra Petch", "Trebuchet MS", system-ui, sans-serif;
  --body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #0d1030; --panel: #161a44; --line: #2c3274; --fg: #e9ecff; --muted: #a3abd8; --accent: #28dcf0; color-scheme: dark }} }}
:root[data-theme="dark"] {{ --bg: #0d1030; --panel: #161a44; --line: #2c3274; --fg: #e9ecff; --muted: #a3abd8; --accent: #28dcf0; color-scheme: dark }}
body {{ background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 15px; line-height: 1.5; }}
.wrap {{ max-width: 900px; margin: 0 auto; padding-block: 24px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px; }}
.wrap > * {{ min-width: 0; }}
.eyebrow {{ font-family: var(--mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }}
h1 {{ font-family: var(--display); font-weight: 700; font-size: clamp(28px, 7vw, 38px); line-height: 1.1; margin: 4px 0 8px; text-wrap: balance; }}
h2 {{ font-family: var(--display); font-weight: 600; font-size: 20px; margin: 0 0 12px; display: flex; align-items: center; gap: 10px; }}
h2 small {{ font-family: var(--mono); font-size: 12px; color: var(--muted); font-weight: 400; }}
p {{ margin: 0; max-width: 64ch; }}
.lead {{ color: var(--muted); }}
img {{ image-rendering: pixelated; display: block; max-width: 100%; height: auto; }}
.cards {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 10px; }}
.card {{ background: var(--stage); color: var(--stagefg); border-radius: 8px; padding: 14px 10px 12px; display: grid; justify-items: center; gap: 4px; text-align: center; min-width: 0; }}
.card img {{ margin-bottom: 6px; }}
.card b {{ font-family: var(--display); font-weight: 600; font-size: 17px; letter-spacing: .02em; }}
.of {{ font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #7af8f0; }}
.shows {{ font-size: 13px; color: var(--stagemuted); line-height: 1.35; }}
.pairs {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 10px; }}
.pair {{ background: var(--stage); color: var(--stagefg); border-radius: 8px; padding: 12px; display: grid; grid-template-columns: auto auto auto; justify-content: center; align-items: center; gap: 4px 10px; }}
.pair .arrow {{ color: #7af8f0; font-size: 20px; }}
.pair b {{ grid-column: 1 / -1; text-align: center; font-family: var(--display); font-weight: 600; font-size: 17px; }}
.ask {{ background: var(--panel); border: 1px solid var(--accent); border-radius: 8px; padding: 14px 16px; }}
.ask b {{ font-family: var(--display); font-size: 17px; }}
</style>

<div class="wrap">
  <header>
    <div class="eyebrow">Wordsmith · melds · pictures first</div>
    <h1>The 52 meld runes</h1>
    <p class="lead">A stone for every meld in Twin's Melds and the Floor 6–10 Melds, each with its own carved symbol, drawn the way the game draws its stones. The two coloured bars along each foot are the two runes that made it, like the melds you already have.</p>
  </header>
  {''.join(out)}
  <section>
    <h2>Level 2 runes <small>11</small></h2>
    <p class="lead" style="margin-bottom:12px">Two of the same rune meld into its level 2. These follow the rule the game already has for Power II and the rest: the rune's own symbol, with two bright marks along its foot.</p>
    <div class="pairs">{ranks}</div>
  </section>
  <div class="ask"><b>Your call</b><p>Tell me in the chat if these are good, or which ones to redraw. Animations come next.</p></div>
</div>
'''
open(D + '/meld_runes.html', 'w').write(page)
print('ok', len(page))
