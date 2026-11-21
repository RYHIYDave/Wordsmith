# Floor 5's boss, the Fleshmancer, brought up to par

Branch `design/fleshmancer-redo` (built on `design/moth-redo`, itself on `design/censor-redo` and `design/f9-side-bosses`). Behind
`FLESH2` (art/fm2_switch.ts), ON at his yes (below).

## His words

- 14 Nov 2026, of floors 5, 15 and 20's bosses: “Do you think the other main bosses (5, 15, and 20) are up to par?  The sunken eye got a big update.  Do the others need work?”. After the Censor and the Moth, asked to start a new task, his pick: “Yes, the Fleshmancer (Recommended)”, offered as the lighter pass of the three.
- His own brief of him, 9 Oct 2026: “Hes human sized, but He has crazy spells that fill the room and you have to dodge around to avoid them.” His look, his moves done the action way and his death all have his yes (docs/mockups/fleshmancer, docs/mockups/action_f5_fleshmancer).
- Told what was found in the game: his spells already fill the room as he asked, and stay; three things are off: his fire looks like pink spikes, not flames; he is hard to pick out in his dark hall (kept human sized, lit up instead); his death gets lost under the loot and his rings of hands.

## What is made

- **His fire as flames** (art/fleshmancer_action_fx.ts paintFire, with the switch on): the same stream and lanes, where and when they burn and strike unchanged; each lane a bed of embers with flames standing on it, round at their feet, licking up to forked tips, his pink at their rims and gold and white at their hearts, licks torn off their tips and embers rising; the stream a roaring river of tall flames. The char under the lanes as it was.
- **His light** (art/fm2_fx.ts; render/act1_fx/fm.ts): his ritual circle burns under him wherever he glides, its runes turning, his pink light pooled in it and lighting him in the dark; his power rising off him in motes. Not while he is gone under the floor in his teleport.
- **His death** (his pick, 11 Oct: “His own dead drag him down (Recommended)”, his own pictures as they were): his light bursts out over the floor and the floor cracks out from under him, lit; twelve hands of his dead burst up round him (the game's own hands) as his own pictures drag him under; as the skull goes down last, his power goes up out of the pit in a pillar of his pink fire and is gone in motes. His rings' hands sink at once, his fire dies down, and nothing of his harms the hero once he is dead (game/bosses.ts died; game/fm_action.ts stepFm).

## Pictures

- pictures/fm2_fight.mp4: his fight in the game at his phone's size, and his death (tools/scenarios/fm_fight.mjs; OLD=1 for him as he was).

## His yes

- Asked with pictures/fm2_fight.mp4, “Is the Fleshmancer in fm2_fight.mp4 (flames, his lit circle, his new death) up to par for the end of floors 1–5?”: “Yes, switch him on (Recommended)”. `FLESH2.on` is true.

## Checks

- tests/fm2.test.ts: the switch off; his flames drawn over their whole time, crisp, his pink, never cyan, nothing cut off, nothing after, the char under them as it was; his circle, power, burst and pillar never cyan; killed in the middle of his fire, nothing of his harms the hero after, his rings sinking, his death drawn; the game draws him and his death without a fault.
