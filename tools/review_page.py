#!/usr/bin/env python3
# review_page.py : writes previews/review/index.html, one page of the moving pictures the owner
# is to look at (6 Oct 2026: a night of animations, none of them live), each with a line saying
# what it is. The pictures themselves are published beside the page as g/<name>.
#   python3 tools/review_page.py
import html, os
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'previews')
# (group, [(file, heading, his words or None, what changed)])
PAGE = [
  ("The heroes' attacks", [
    ('weight_strike_great_sword.gif', 'Strike, great sword', 'right now it has 0 weight', 'He steps into the cut now and lands a pace nearer, low. The blade leaves a streak of its own light, and he holds the finish for a beat while his scarf catches up. What he hits is knocked back a little as it flashes.'),
    ('weight_strike_sword_and_shield.gif', 'Strike, sword and shield', None, 'The same cut with one hand. The sword arm now comes across in front of the shield.'),
    ('weight_slam.gif', 'Slam', None, 'Up onto his toes with the sword as high as it goes, then down a pace ahead, deep in his knees, the point driven into the floor.'),
    ('weight_whirlwind.gif', 'Whirlwind', None, 'My pick. Held, it used to freeze on one frame of the Strike. Now he spins for as long as you hold it, leaning back against the pull of the sword.'),
    ('weight_shot.gif', 'Shot', 'Same boat as strike', 'He steps into the draw and leans back against it; at the loose the bow kicks and the drawing hand flies back past his ear.'),
    ('weight_volley.gif', 'Volley', 'The rogue drops to a knee when he fires Volley', 'Down onto one knee, braced with the bow at the sky, the arrows gone in a fan of light.'),
    ('weight_wave.gif', 'Wave', 'Have the wave flow on the ground', 'The staff is swung over and down with the body turning into it. The wave itself runs along the floor now: a crest in front, the body of it streaming back.'),
    ('weight_orb.gif', 'Orb', 'Slam the staff down on the ground', 'Both hands take the staff overhead, a beat at the top, and it is driven onto the floor with the mage dropping into a crouch round it.'),
    ('weight_beam.gif', 'Beam', 'the mage fires his beam and it blows his cloak back', 'The blast drives the mage back a step. They stand braced with the staff levelled in both hands for as long as it burns, coat and scarf flying out behind.'),
  ]),
  ('Getting about', [
    ('weight_runs.gif', 'How the heroes run', None, 'A small one. All three had the same walk. Now the knight drives forward, the ranger runs low and light, the mage takes short quick steps.'),
    ('weight_leap.gif', 'Leap', None, 'My pick. Left standing where he lands, he goes deep into his knees over the sword and gets up.'),
    ('weight_roll.gif', "The ranger's roll", None, 'My pick. It was his walk played fast. Now he goes over in a tucked ball and comes up off a knee.'),
    ('weight_warp.gif', 'Warp', 'I want to see and feel the wizard phase out and phase back in', 'The mage comes apart in thin slices where they stood and comes together out of slices where they arrive.'),
  ]),
  ('Magic', [
    ('weight_familiar.gif', 'Familiar', 'Something more ethereal. More magic, more elemental. And a different sprite for all damage types', "A wisp for the mage's own magic, a flame for fire, a shard of ice for frost, a knot of lightning. None has eyes."),
    ('familiars_before_and_now.png', 'The four familiars, side by side', None, 'Before and now, for each kind of damage.'),
    ('weight_storm_cloud.gif', 'Storm cloud', 'I like the idea of the Storm cloud but it needs some work', 'It billows as it forms, the puffs turn and swell, and the lightning is inside it.'),
    ('weight_power_embers.gif', "Power's embers", 'Can we get the animation for the orbs stacked up actually spin around the character?', 'They go round the hero on a tilted ring: small and dull behind, big and bright in front, faster the more stacks you hold.'),
  ]),
  ('Monsters', [
    ('walk_the_dead.gif', 'How skeletons walk', 'An undead skeleton is plodding and brittle', 'A skeleton lurches now: one long step it falls onto, then the stiff leg dragged up after. The archer does the same more lightly. Same speed over the ground.'),
    ('death_cultist_empty_cloak.gif', "The cultist's death", "have the cloaks just crumple to the ground like they're empty", 'A shudder, and then nobody is in it: the robe folds down on itself, the cowl settles on the heap, the knife lies beside it.'),
    ('death_brute_and_guardian.gif', "The brutes' death", 'the brutes and the cloak guys arent very good', 'Done again. Struck, he rocks back; the club drops; his knees go; he sags; then his weight takes him forward into a heap.'),
  ]),
  ('New', [
    ('hero_falls.gif', "When a hero's life runs out", None, 'My pick, and it changes how a death goes, not only how it looks. A hero used to stand there behind YOU DIED. Now they fall to a knee and the light goes out of them, in a world that has stopped. YOU DIED comes up two seconds after the blow; a tap brings it at once.'),
    ('hero_struck.gif', 'When a hero is hit hard', None, 'My pick. A hero who was hit flashed red and did not move. Now a blow that takes a tenth of their life or more rocks them back on their heels, or throws them forward a step if it comes from behind. A quarter of a second, and only while they stand or walk. Small blows only flash, as before.'),
  ]),
]
out = []
out.append('''<title>Wordsmith New Animations</title>
<style>
:root { color-scheme: dark; --bg: #0f0d22; --panel: #17153a; --ink: #e9e6ff; --dim: #a9a3cc; --gold: #ffd866; --line: #2c2966; --cyan: #7af8f0; --pic: #16131c; }
html { background: var(--bg); }
body { background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; padding-inline: 16px; padding-block: 24px 56px; }
main { max-width: 920px; margin: 0 auto; display: flex; flex-direction: column; gap: 36px; min-width: 0; }
h1 { font-size: 1.5rem; line-height: 1.2; margin: 0; color: var(--gold); text-wrap: balance; }
h2 { font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cyan); margin: 0; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
h3 { font-size: 1.1rem; line-height: 1.25; margin: 0; }
p { margin: 0; }
.top { display: flex; flex-direction: column; gap: 10px; }
.top p { color: var(--dim); max-width: 62ch; }
.top strong { color: var(--ink); }
.group { display: flex; flex-direction: column; gap: 28px; min-width: 0; }
.item { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.say { color: var(--gold); }
.what { color: var(--dim); max-width: 62ch; }
.pic { margin-top: 6px; border: 1px solid var(--line); border-radius: 6px; background: var(--pic); overflow: hidden; cursor: zoom-in; max-width: 100%; }
.pic img { display: block; width: 100%; height: auto; image-rendering: pixelated; }
.pic.big { overflow-x: auto; cursor: zoom-out; }
.pic.big img { width: auto; max-width: none; }
.hint { font-size: 0.85rem; }
</style>
<main>
<div class="top">
<h1>A night of animations</h1>
<p><strong>None of this is in the live game.</strong> All of it was filmed in the game. Where a move was there before, the picture shows it before and now. Tell me which to keep, which to change, and which to drop.</p>
<p class="hint">Tap a picture to see it full size. Tap again to shrink it.</p>
</div>''')
for group, items in PAGE:
    out.append(f'<section class="group">\n<h2>{html.escape(group)}</h2>')
    for name, head, said, what in items:
        w, h = Image.open(os.path.join(ROOT, name)).size
        out.append('<article class="item">')
        out.append(f'<h3>{html.escape(head)}</h3>')
        if said: out.append(f'<p class="say">You: &ldquo;{html.escape(said)}&rdquo;</p>')
        out.append(f'<p class="what">{html.escape(what)}</p>')
        out.append(f'<div class="pic"><img loading="lazy" decoding="async" src="g/{name}" width="{w}" height="{h}" alt="{html.escape(head)}"></div>')
        out.append('</article>')
    out.append('</section>')
out.append('''</main>
<script>
for (const pic of document.querySelectorAll('.pic')) pic.addEventListener('click', () => pic.classList.toggle('big'));
</script>''')
os.makedirs(os.path.join(ROOT, 'review'), exist_ok=True)
with open(os.path.join(ROOT, 'review', 'index.html'), 'w') as f: f.write('\n'.join(out) + '\n')
print('written', sum(len(i) for _, i in PAGE), 'pictures')
