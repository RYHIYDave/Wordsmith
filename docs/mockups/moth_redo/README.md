# Floor 20's boss, the Moth, made ghostly

Branch `design/moth-redo` (built on `design/censor-redo`, itself on `design/f9-side-bosses`). Behind `MOTH2` (art/moth2_switch.ts), ON at
his yes (below).

## His words

- 14 Nov 2026, 13:34 (Eastern), of floors 5, 15 and 20's bosses: “Do you think the other main bosses (5, 15, and 20) are up to par?  The sunken eye got a big update.  Do the others need work?”. The Censor done first; asked to start a new task, his pick: “The Moth next (Recommended)”.
- 16:13: “as of right now the moth is the end boss of the compaign so it needs to be good.  dont make mistakes, make some cool original attacks.  very ethereal”.
- Read back to him: she is the last boss of the whole campaign, so attacks of her own that nothing else in the game has, and all of her ghostly: pale light, see-through, drifting. Her look and body moves stay (his yes of before). The set offered him, his pick: “Yes, build these (Recommended)”:
  - **Ghost Wing** (her basic): as her wing comes down, a see-through ghost of it, eye and all, breaks away and sweeps the ground in front of her.
  - **Eclipse** (new, replaces the eye beams): a pale moon rises behind her and throws her shadow huge across the tower top; the eyes on her wings open inside the shadow; then the whole shadow strikes. Get out into the moonlight to dodge it.
  - **Phantoms** (new, replaces the swarm): three see-through copies of her peel away and glide across the top in long passes, one after another.
  - **The Hush** (her dust): glowing scales drift down like slow snow; inside it your words still go dark.
  - **The Unwriting** (on the book, replaces the wind ring): she beats down, and the last chapter's pages tear loose and wheel out around her as a ring of pale burning pages that covers the whole top.
  - **Her death** keeps her scream and every word flying home; at the end she comes apart into drifting light instead of grey dust.

## What is made

- **Where each strikes** (art/moth2.ts): Eclipse's shadow is her own wings' outlines laid flat (art/moth.ts wingRim), cast from her at him: about eleven tiles across, six deep, beginning under her; out of it at the blow, or rolling, he is not struck. Phantoms: three lanes, the first at him and the others 40 degrees either side, each phantom 0.42 s after the one before, gliding 11 tiles a second, striking him once each where its body passes over him (four tiles wide).
- **Her rules** (game/act1_rules/moth.ts, with the switch on): Eclipse and Phantoms aim at him as she begins (her other blows still go her picture's way); she casts Eclipse only from 1.5 to 6 tiles off him; their perils `moth:eclipse` and `moth:phantoms`. Ghost Wing, the Hush and the Unwriting keep their old rules exactly (the buffet's cone, the dust's haze, the beat's ring).
- **What she draws** (art/moth2_fx.ts; render/act1_fx/moth.ts): straight onto the game's own pixels each frame, none of it a painting held in memory. Her phantoms, her glowing scales and the burning pages are drawn over the dark, so they shine.
- **Her pictures** (art/moth_moves.ts, with the switch on): no little moths crawl on her as she wraps her wings round herself (her copies shimmer off her instead); her scales glow as they fall; as she crumbles, her flakes rise as light and nothing of her is left lying on the top. The painter's workers are told of the switch (render/painter.ts, as for the Censor).

## Pictures

- pictures/moth2_fight.mp4: her fight in the game, at his phone's size (tools/scenarios/moth2_fight.mjs; OLD=1 for her old moves).

## His yes

- Asked with pictures/moth2_fight.mp4, “Is the ghostly Moth in moth2_fight.mp4 good enough for the last boss of the campaign?”: “Yes, switch her on (Recommended)”. `MOTH2.on` is true (art/moth2_switch.ts). tests/moth.test.ts holds the art chat's pictures of her as they were (MOTH2 off there).

## Checks

- tests/moth2.test.ts: the switch off; Eclipse's shape; Eclipse and Phantoms in play (struck in it, not out of it or rolling; each phantom once); everything she draws, never cyan; her pictures made ghostly; a fight on the top with the switch on.
