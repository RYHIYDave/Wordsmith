# Mock-up: THREE BOSSES for dungeons 2 to 4: the Headsman, the Chained One and the Ossuary Amalgamation (NOT IN THE GAME until the main chat puts them there)

**What it is.** Three new bosses of the Warden's standing, one for each of dungeons 2, 3 and 4 (the
Warden keeps dungeon 1; a lair boss for dungeon 5 comes after them). They are monsters of
`src/art/new_mobs3.ts`'s kind, posed on the heroes' bones and dressed in the heroes' solids, each on a
canvas of its own. All three looks have his yes. THE HEADSMAN'S MOVES HAVE HIS YES; the Chained
One's and the amalgamation's are still to be made (until then each stands, or walks standing, in their
places).

Nothing of the game makes them: `src/art/bosses3.ts` (the three), `src/art/boss_shots.ts` (what they
draw on the floor, in the game's own pixels) and `src/dev/preview_bosses.ts` (the dev page that shows
them and makes their films) are imported by nothing of the game. Their order in the dungeons, and
every rule of what each move does, how far, how often and to whom, are the main chat's.

**Where:** the branch `mockup/bosses`, from `mockup/more-leaders` at `0ee8a14`.

## His words (9 Oct 2026, the art chat)

- At 16:29: "K I need 3 bosses"; at 16:30: "One I know I want is a bigger nastier ossuary
  amalgamation". Asked whether these were the first land's three, by 16:37: "No I need three more
  Warden level bosses for dungeon 2-4.  Then we’ll do the lair boss for dungeon 5". At 16:48: "I’d like
  the same principals for animations used for characters on the bosses".
- Their briefs (the art rulebook's "A new character"), each asked as a pop-up, our pick first:
  - THE HEADSMAN, by 16:46: a giant hooded executioner with a great axe, slow, terrible chops;
    "Headless, his hood empty"; his basic attack a chop, and "The sentence (Recommended)", "Wide sweep
    (Recommended)", "Whirling throw (Recommended)"; "His hood falls empty"; for the Sound chat, "A
    tolling bell (Recommended)".
  - THE CHAINED ONE, by 16:44: "A starved giant, muzzled (Recommended)" (grey skin over bone, rags, an
    iron cage bolted over his face, chains from his wrists, an iron ball dragged behind); he grows
    wilder as his chains break; his basic attack a lash of a chain, and "Hook and drag (Recommended)",
    "Chain whirl (Recommended)", "Ball throw (Recommended)"; "His chains drag him down (Recommended)";
    for the Sound chat, "Chains and a muffled roar (Recommended)".
  - THE OSSUARY AMALGAMATION, by 16:37 and 16:40: "A head over the Warden"; "Skulls and arms all over
    (Recommended)", "It eats the dead", "It bursts apart"; "Hauls itself on its arms (Recommended)";
    its basic attack a swipe of its nearest arms, and "Arms from the floor (Recommended)", "Skull swarm
    (Recommended)", "Devour (Recommended)"; bursting "As it's hurt (Recommended)"; for the Sound chat,
    "A hundred jaws grinding (Recommended)".
- Their looks: his yes to the amalgamation's by 17:44: "Yes, this is it (Recommended)". His yes to the
  Headsman's and the Chained One's looks was given in this chat earlier that afternoon; its words were
  not kept in this chat's record.
- THE HEADSMAN'S MOVES. The first films: "No, try again"; of his coat in them, "Yes, keep the split
  (Recommended)"; and by 18:23, in his own words: "His ex is doing some really weird things. I like the
  ax head down between his feet when he standing still or when he starts moving, you should bring it
  up to a two handed grip across his body. That way it makes it easier if we have to swing overhead and
  do all of his moves." The second films, before 19:01: "No, try again"; "The axe still looks weird";
  "All of them"; "Goes through his body,Held in the wrong place". At 19:01: "Look at his arms they’re
  all twisted weirdly and the axe is clipping through his shoulder.  It looks so bad.  When I say he
  should hold it naturally, what does that mean to you?"; at 19:05: "Like look up how to chop a log and
  you’ll see what an overhead swing should look like".
- So four stills of how he holds it were drawn first, from the woodsmen's guides (`more.holds`,
  `headsman_holds.png`): standing still, carrying it, raised to chop, the chop landed. By 19:31: "Close,
  change something"; by 19:32, of standing still: "You had standing still right the first time.  How
  did it change to something worse?" (it was put back as he was first painted); by 19:42: "Yes, animate
  them (Recommended)". At 19:47: "carrying it  and standing still facing away the axe is in his wrong
  hand" (so his back is now painted as the camera truly sees him: below).
- The third films (chop, sentence, sweep, throw, walk, death): by 21:24, "Some need work"; by 21:25,
  "Walk or death", "Looks unnatural"; by 21:28, "The death", "The elbows stick straight up.  No one
  falls over like that". The death redone: by 21:33, "Yes, keep it (Recommended)". The other five films
  stand as sent.

## The Headsman (`HEADSMAN` in `src/art/bosses3.ts`)

- **His look.** The Warden's height (`HS_BODY`, 112 tall). A long executioner's coat split at the
  sides (his yes: "Yes, keep the split"), an apron, a short cape, a tall pointed hood over nothing: the
  pink burning in its dark. A great axe: a haft of 82, bound in iron, a crescent of black steel with a
  bright edge.
- **How he holds it, as a woodsman does** (`woodsman`, `elbowsTo`): his LEFT HAND ON THE VERY END OF
  THE HAFT, always; his right hand up it, near the head, as he carries it and lifts it, and sliding
  down to meet the left as he swings, so that at the blow both are together at the end, arms out
  straight, knees dropped, hips back. His elbows bend as elbows do, and the axe never passes through
  him: `tests/bosses.test.ts` checks every frame of every move (the haft and the blade against his
  hood, neck, shoulders, chest, belly and hips; his left hand on the haft at its end).
- **Standing** (`stand`, `HS_REST`, 25 frames at 10 a second): as he was first painted: the axe
  upright on its head by his right foot, his right hand on the haft at his hip, his left arm hanging;
  he looks about, and now and then lifts the axe a little and sets it down with a thump.
- **Taking it up and setting it down** (`more.raise`, `more.lower`, 0.5 s each; the game plays `raise`
  as he starts to move and `lower` as he stops): his right hand lifts the axe off the floor and swings
  its head up and out to his right; his left hand takes its end as it comes across before him; up it
  comes into his carry. And back.
- **His walk** (`walk`, 10 frames at 8 a second, painted for 0.8 tiles a second, `HEADSMAN_PACE`):
  slow and heavy, the axe carried across him (`HS_READY`: his left hand at its end before his left
  hip, his right up it before his right breast, the head beside his right shoulder, the blade up),
  going with his chest and rocking with his steps.
- **His chop** (`attack`; its blow at 0.9 s, `HS_CHOP_HIT`; the clip 1.85 s): up and back over his
  right shoulder, his hands above his hood; held, trembling, the edge glinting and the fire in his hood
  flaring (the warning, from 0.38 s); over the top and down, his right hand sliding to his left, his
  knees dropping, his hips going back; the blade bites the floor 2.96 tiles ahead of him (`hsBite`),
  the game's freeze; wrenched out and back across him.
- **The sentence** (`more.sentence`; its blow at 1.35 s, `HS_SENTENCE_HIT`; the clip 2.65 s): raised
  higher and steeper, held long while the floor cracks along the line it will fall on
  (`drawSentenceLine`); down as his front foot stamps a stride forward into a deep lunge, the blade
  bitten deep 3.25 tiles ahead; the floor splits along the line and burns (`drawSentenceSplit`);
  wrenched out, his foot stepping back.
- **The wide sweep** (`more.sweep`; round him from 0.78 s to 1.32 s, `HS_SWEEP_FROM`, `HS_SWEEP_TO`;
  the clip 2.27 s): his hands at the haft's end, the axe hauled back to his right, low, and held (a
  ring burns on the floor as far as it reaches, 3.14 tiles, `hsSweepReach`, `drawSweepRing`); once all
  the way round him at the height of a man's knee, his feet stepping round under him; the blade skids
  on the floor; up and back across him.
- **The whirling throw** (`more.throw`; it leaves his hands at 0.8 s, `HS_THROW_HIT`, and is back in
  his right hand at 2.3 s, `HS_CATCH`; the clip 3.1 s): his hands at the haft's end, the axe swung out
  to his right, flat, and held (its way out and back drawn on the floor, `drawThrowPath`); slung, it
  whirls out across the room and back (`makeAxeShotArt`, `drawAxeShadow`); caught in his right hand,
  his left takes its end, and back across him.
- **Struck** (`reel`, 0.3 s): he barely gives; his axe goes with his chest.
- **His hood falls empty** (`dying`, 2.6 s): rocked back; the axe slips from his hands and falls
  (0.3 s); his knees give and he sinks onto them, swaying; he folds forward over his knees and slumps
  onto his chest, his arms limp, then his hips sink and his legs slide out and he lies flat, his arms
  limp at his sides (`limp`: no elbow points up); his hood slides off and falls by itself, empty
  (1.32 s).
- **FROM BEHIND, AS THE CAMERA TRULY SEES HIM** (`Mob.trueBack`; `PaintView` 'rear' in
  `src/art/skin.ts`, `project` in `src/art/skeleton.ts`; `paintViewOf` in `src/art/new_mobs3.ts`): his
  pictures facing away are seen over his right shoulder and not turned over, so that the axe stays in
  his right hand (his word of 19:47). The heroes and every other monster are seen from behind as
  before (over the left shoulder, turned over), pixel for pixel. For whatever is drawn on the floor
  under his back pictures: before him is up the screen and to the right, as for every figure facing
  away, and HIS LEFT IS UP AND TO THE LEFT (for the others it is down and to the right): the dev page's
  `floorOf(view, ...)` with 'rear'.

## The Chained One (`CHAINED`) and the Ossuary Amalgamation (`AMALGAM`)

Their looks have his yes. Their moves are next in this chat, by the same principles; until then each
stands, or walks standing, in their places.

## For the main chat

- Their order in dungeons 2 to 4, and every rule of every move, are yours. The numbers above are where
  the pictures put things; the floor drawings in `src/art/boss_shots.ts` take where and when from them.
- A boss's canvas is its own (`HS_CANVAS`, 380 by 340, the floor point at 190, 262).
- `MobMove.trail` is now given the posed bones too (`(s, q)`); `posedOfMob` reads a move's pose at a
  moment. Neither changes any other monster's frames.

## Tests and checks

- `tests/bosses.test.ts` (7): the switch is off and nothing of the game imports the bosses; the
  Headsman paints in every frame both ways round, nothing cyan, his edge while he lives and none as he
  dies; his axe never goes through him in any frame of any move (thirty frames a second); his left hand
  at the haft's very end whenever a pose puts it on the haft, and both hands there at each blow; the
  chop bites about three tiles ahead and the sentence further, both into the floor and not through it;
  facing away the axe is in his right hand (and every other figure is seen from behind as before); as
  he falls and lies, no elbow is above its shoulder.
- `tests/new_mobs3.test.ts`: the new monsters' "nothing of the game imports the mock-up" lets the
  bosses' two files (a mock-up of their own) import them.
- Every frame of the Shade, the Boneward, the Golem, the champion, the marksman, the skeleton, the
  archer, the high priest, the cultist and the troll chieftain (2748 frames) was painted on the base,
  `0ee8a14`, and on this branch, and is the same pixel for pixel.
