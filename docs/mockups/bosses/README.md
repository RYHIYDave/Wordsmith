# Mock-up: THREE BOSSES for dungeons 2 to 4: the Headsman, the Chained One and the Ossuary Amalgamation (NOT IN THE GAME until the main chat puts them there)

**What it is.** Three new bosses of the Warden's standing, one for each of dungeons 2, 3 and 4 (the
Warden keeps dungeon 1; a lair boss for dungeon 5 comes after them). They are monsters of
`src/art/new_mobs3.ts`'s kind, posed on the heroes' bones and dressed in the heroes' solids, each on a
canvas of its own. All three looks have his yes. **ALL THREE ARE READY TO GO IN, WITH HIS YES** (10 Oct,
01:58: "I’m going to trust you that these are sick after all the tests and just throw them in.  Finish the
amalgamation and throw that in to.  AFTER the checks tho."). Every move of all three, and of the bone beast
that bursts out of the amalgamation, has been through every check the heroes had (`src/art/boss_checks.ts`;
the art rulebook's How art is made 7), every frame, from in front and from behind, and nothing is found.

Nothing of the game makes them: `src/art/bosses3.ts` (the three), `src/art/boss_shots.ts` (what they
draw on the floor, in the game's own pixels), `src/art/boss_chains.ts` (the Chained One's chains),
`src/art/boss_checks.ts` (the review) and `src/dev/preview_bosses.ts` (the dev page that shows them and
makes their films) are imported by nothing of the game. Their order in the dungeons, and every rule of
what each move does, how far, how often and to whom, are the main chat's.

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
- THE CHAINED ONE'S MOVES. His answers: "Yes, keep them (Recommended)" (of his moves as offered) and,
  by 23:08, of his chains breaking, "One at a time (Recommended)" (offered as: "First he stamps on his
  left chain and rips his arm free; later he tears the ball's chain off his collar. Each time a roar,
  sparks and links flying, and he's quicker after."). At 23:09: "Did you apply the animation ruleset to
  the chained one?"
- THE CHECKS, A RULE NOW. At 23:35: "I need all bosses ran through all checks from now on.  These boss
  fights are important"; at 23:44: "Add it to the rulebook.  All checks must be made."; at 23:56: "And
  every boss gets the same treatment as characters". So the art rulebook has How art is made 7 (his doc
  at rev 41), and every boss gets the whole review the heroes had on 8 Oct (`docs/requests/hero_moves_review.md`),
  in every frame of every move, from in front and from behind, before he sees it.
- HIS YES, 10 Oct, at 01:58: "I’m going to trust you that these are sick after all the tests and just
  throw them in.  Finish the amalgamation and throw that in to.  AFTER the checks tho.  Going to bed.
  Work on the environments after.  Apply the checks." Read as: the Headsman and the Chained One go into
  the game as they are, on the strength of the checks, without his seeing the last films; the
  amalgamation the same way, once it has been through every check; then the environments.

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
- **Taking it up and setting it down** (`more.raise`, `more.lower`, 0.6 s each, `HS_RAISE`; they were
  0.5 s when he said yes to them, and are eased now so that nothing leaps and his left hand keeps out of
  his thigh; the game plays `raise` as he starts to move and `lower` as he stops): his right hand lifts
  the axe off the floor and swings its head up and out to his right; his left hand takes its end as it
  comes across before him; up it comes into his carry. And back.
- **Setting off and stopping** (`more.setOff`, 0.41 s; `more.halt`, 0.53 s; new, for the checks: the
  picture jumped from a standstill into his walk and out of it). The game carries him on at his pace
  from setting off's first moment to stopping's last (`ground`, as his walk's): setting off, his right
  foot is lifted and set down a stride ahead, his left stays where it stood, and he is in his walk's
  first frame; stopping begins from his walk's first frame (the game lets the walk come round to it: at
  most 1.25 s), his left foot comes through and is set down beside his right, and he stands with the
  axe across him, where the game stops him (then `lower`, or a blow).
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
- **His hood falls empty** (`dying`, 2.6 s; it begins from his carry, the axe across him in his hands,
  as the one he said yes to did: the game plays it when he is struck down as he fights): rocked back,
  his left foot stepping back level with his right; the axe slips from his opening hands and falls
  (0.3 s); his knees give and he sinks onto them (0.8 s), both feet coming up onto their toes where they
  stand, swaying; he folds forward over his knees and slumps onto his chest (1.56 s), his arms limp, and
  goes over flat on his face (2.1 s), his knees where they knelt, his arms limp at his sides (`limp`: no
  elbow points up); his hood slides off and falls by itself, empty (1.32 s). (Mended for the checks:
  his feet slid back across the floor as he went down, up to 24 game pixels, and his toes and knees
  went into it; his left hand went into his thigh and the haft through his leg as the axe fell.)
- **Standing** breathes, and now shifts his weight slowly onto one foot and back (the checks: his
  weight never shifted).
- **FROM BEHIND, AS THE CAMERA TRULY SEES HIM** (`Mob.trueBack`; `PaintView` 'rear' in
  `src/art/skin.ts`, `project` in `src/art/skeleton.ts`; `paintViewOf` in `src/art/new_mobs3.ts`): his
  pictures facing away are seen over his right shoulder and not turned over, so that the axe stays in
  his right hand (his word of 19:47). The heroes and every other monster are seen from behind as
  before (over the left shoulder, turned over), pixel for pixel. For whatever is drawn on the floor
  under his back pictures: before him is up the screen and to the right, as for every figure facing
  away, and HIS LEFT IS UP AND TO THE LEFT (for the others it is down and to the right): the dev page's
  `floorOf(view, ...)` with 'rear'.

## The Chained One (`CHAINED`, `CHAINED_FREED[1]`, `CHAINED_FREED[2]`)

- **His look.** A starved giant, grey skin over bone, rags, an iron cage bolted over his face, the
  pink burning behind it; a chain from each wrist (the right one ending in a hook), and from the ring
  at the back of his collar a chain to an iron ball dragged behind. Seen from behind as the camera truly
  sees him (`trueBack`, as the Headsman). A canvas of his own, 420 by 340 (the floor point at 210, 236).
- **He grows wilder as his chains break, one at a time** (`CoFreed`): `CHAINED` has all three; after
  `more.breakL` he is `CHAINED_FREED[1]` (his left chain gone, a stub on the cuff); after
  `more.breakBall` he is `CHAINED_FREED[2]` (the ball's chain torn off too, a stub on the ring). Each has
  the same moves, but what he no longer has (no `breakL` after the first, no ball throw or `breakBall`
  after the second). When each breaks, and how much quicker he is after, are the rules'.
- **His chains swing as chains do** (`src/art/boss_chains.ts`): worked out through every move from his
  bones (they whip, fly out, drag on the floor, lie, settle), kept out of his body and of the floor.
- **Standing** (`stand`, 25 frames at 10 a second): hunched, breathing, shifting his weight, his chains
  hanging. **Setting off** (`more.setOff`, 0.39 s), **his walk** (`walk`, 8 frames at 8 a second,
  painted for 1.1 tiles a second, `CHAINED_PACE`: a lurching shamble, each foot coming down flat and
  heavy, his long arms swinging low, his chains dragging, the ball scraping behind on its chain) and
  **stopping** (`more.halt`, 0.39 s, from the walk's first frame: at most 1 s to come round to it), as
  the Headsman's.
- **His lash** (`attack`, 1.74 s; the chain slams the floor at 0.86 s, `CO_LASH_HIT`): he rears up and
  back, his right arm raised high behind him, the chain hanging from his fist, and holds it, his eyes
  flaring (the warning); his arm comes over and snaps down as a whip is cracked, and the chain slams
  down before him (sparks, dust: the game's freeze); dragged back as he rises.
- **Hook and drag** (`more.hook`, 3.15 s): the hook whirled round on its chain, faster and faster, as he
  points (the warning); flung at 1.2 s (`CO_HOOK_LET`), it bites 4.5 tiles out at 1.52 s (`CO_HOOK_BITE`,
  `CO_HOOK_REACH`); from its leaving his hand until it is back the hook and its chain are the game's to
  draw (`coHookOut`, `coHookPath`, `makeHookShotArt`, `drawChainOut`); hauled in hand over hand until
  2.6 s (`CO_HOOK_BACK`), dragging whatever it caught (the rules'); it falls at his feet.
- **The chain whirl** (`more.whirl`, 2.6 s): crouched, wound round to his right and held (a ring on the
  floor as far as his chains reach, `coWhirlReach`, `drawSweepRing`); three times round from 0.8 s to
  1.85 s (`CO_WHIRL_FROM`, `CO_WHIRL_TO`), his chains flying out flat round him, a streak of fire behind
  their ends, his feet stepping round under him; staggering out of it.
- **The ball throw** (`more.ball`, 4.11 s): he turns to the ball behind him with a hop, squats over it
  and takes it up in both hands, heaves it to his chest turning back, presses it up over his head and
  holds it, trembling (its shadow on the floor where it will fall, `drawBallShadow`); hurled at 1.78 s
  (`CO_BALL_LET`), it crashes down 4 tiles out at 2.22 s (`CO_BALL_LAND`, `CO_BALL_REACH`,
  `drawBallCrash`); hauled back by 3.26 s (`CO_BALL_BACK`) and dragged round behind him (`coBallOut`,
  `coBallPath`, `makeBallShotArt`).
- **His left chain breaks** (`more.breakL`, 2.3 s, `CO_BREAK_TIME`): he stamps on it and wrenches his arm
  up against it, roaring; it snaps at the cuff at 0.8 s (`CO_SNAP_L`), sparks and links flying; he
  roars, arms wide, and hunches again, wilder: he is `CHAINED_FREED[1]` from its end. The broken chain
  lies where it fell (`makeLeftBehindArt`, the game's to leave there).
- **The ball's chain breaks** (`more.breakBall`, from `CHAINED_FREED[1]`, 2.3 s): he takes hold of his
  collar and strides away from the ball until the chain stands taut, straining, roaring; it tears from
  the ring at 0.8 s (`CO_SNAP_BALL`); he lurches free and roars: `CHAINED_FREED[2]` from its end. The
  ball and its chain lie where they were.
- **Struck** (`reel`, 0.3 s): he jerks back from it, his chains rattling.
- **His chains drag him down** (`dying`, 2.6 s): he rears back and roars (0.14 to 0.3 s); but his chains
  hold where their ends lie by his feet and drag his arms down after them, and him after his arms: bent
  double, onto his knees (1.1 s), his feet up on their toes where they stood; the ends let go (1.14 s)
  and he goes over onto his face (by 1.76 s), his arms dragged back along his sides; the fire in his
  cage goes out.
- **What the checks caught while he was being made, all mended:** his left chain flung up when he
  lifted his foot off it; his right arm akimbo as his chains broke; his right chain whipping up at the
  end of a break; his feet sliding round in the whirl; turned, his body leaning the wrong way; reaching
  for the ball, his hands short of it and an arm in his hips; in his death, his knees and toes in the
  floor and his feet sliding; at the end of a move, a chain drawn back through his body.

## The Ossuary Amalgamation (`AMALGAM`)

- **Its look** (his yes by 17:44, "Yes, this is it (Recommended)"; of the shapes offered he had picked "A
  heap that crawls low"): a heap of the dead, low and wide, slumped on the floor (its top 34 game pixels up
  on its centre line, the Warden's 61; 92 across): dark packed bone, the fire in its cracks, skulls all over
  it with the pink in their sockets, rib cages and broken bones jutting from its hump, the dead's own arms
  reaching up out of it; no face, but a maw low in its front, a ragged split full of fangs with the fire
  inside, a crowd of skulls staring over it; behind, it trails off into the floor. SIX GREAT ARMS OF BONE
  out of its front and sides reach out along the ground, elbows out, hands spread on the floor. A canvas
  of its own, 320 by 256 (the floor point at 156, 190).
- **It hauls itself on its arms, and its hands grip the floor as feet do** (his pick by 16:40, "Hauls
  itself on its arms (Recommended)"): a hand that is down stays where it came down while the heap slides
  on over the floor, and moves only lifted (`handwork`, `AM_GAIT`, `amGaitAt`). Its heap and its arms are its own
  (`amFrame`, `amArms`, `amGeometry`): the bones only say where it is, which way it faces, how it heaves
  (`pz`), leans (`pitch`) and twists (`yaw`), how wide its maw gapes (`draw`), how wild the arms on its
  top are (`pt`), how far it has burst apart (`gale`) and the fire in it (`out`).
- **Standing** (`stand`, 30 frames at 10 a second): it heaves as if it breathed, its bulk shifting from
  side to side, its maw working, the arms on its top grabbing at the air; its right front hand shifts its
  grip and back.
- **Setting off** (`more.setOff`, 0.7 s), **its haul** (`walk`, 8 frames at 10 a second, painted for 0.8
  tiles a second, `AMALGAM_PACE`: its six hands three at a time, each reaching out ahead, gripping,
  the heap dragged up to it, surging on at each pull) and **stopping** (`more.halt`, 0.5 s, from the
  walk's first frame: at most 0.8 s to come round to it), as the other two's. Its hands go three at a time,
  crosswise: its right front, left side and right hind together, then the other three.
- **Its swipe** (`attack`, 1.5 s; the blow at 0.82 s, `AM_SWIPE_HIT`): it twists away to its right,
  rearing, its right front arm up and back, claws spread, maw gaping; held, trembling (the warning); the
  heap twists hard round to its left, its hips first, and the arm rakes across the floor before it, low,
  and on round past, a streak of the enemy's fire along its claws; the heap crashes forward into it (the
  game's freeze); the hand back down where it gripped. Where the hand is, moment by moment: `amSwipeAt(t)`.
- **Arms from the floor** (`more.floorArms`, 2.3 s; his pick, "Arms from the floor (Recommended)"): it
  rears up high, its front arms raised over it, maw gaping, its fire flaring, and holds there, trembling
  (the warning); it crashes down, both great hands slammed flat on the floor before it at 1.0 s
  (`AM_SLAM_HIT`; at `AM_SLAM_SPOTS`, 1.5 tiles ahead and half a tile to either side: stone and dust fly,
  the floor cracks under them, `drawBallCrash`), squashing flat against the floor, and presses there,
  shuddering, while OUT ACROSS THE ROOM ARMS OF THE DEAD BURST UP OUT OF THE FLOOR, where the rules put
  them: each place cracks and glows first (`drawArmCrack`, 0.5 s before, `ARM_CRACK_WARN`); then the floor
  bursts open, its stone flung up, and three arms of the dead thrust up out of the dark, clawing, sway and
  grab at the air, and sink back, the broken stone settling back over the hole after them, nothing left of
  it by its last frame (`makeFloorArmArt`: 13 frames at 10 a second, 1.3 s, `FLOOR_ARM_TIME`; up by 0.15 s,
  `FLOOR_ARM_UP`; sinking from 1.0 s, `FLOOR_ARM_SINK`); the cracks stay a moment after (0.8 s,
  `ARM_CRACK_AFTER`). In the film, five places in a fan 2.7 to 4.4 tiles ahead, coming up from 0.5 s after
  the slam to 1.0 s after: the rules' own in the game.
- **The skull swarm** (`more.swarm`, 2.0 s; his pick, "Skull swarm (Recommended)"): it swells, the arms on
  its top flailing, every skull on it burning, its maw gaping wider and wider (the warning); at 1.0 s
  (`AM_SWARM_HIT`) it heaves forward and spews fourteen burning skulls (`AM_SWARM_N`) out of its maw, each
  tumbling, its jaw chattering, a tail of fire behind it; and sags back. Each is in its own picture for its
  first 0.34 s (`AM_SWARM_LIFE`); THEN IT IS THE GAME'S, from where and when `amSwarmSkulls()` says (2.1 to
  2.5 tiles ahead, up to 0.8 tiles to either side, 4 to 7.5 game pixels up, 0.34 to 0.57 s after the blow, headed
  from 30 degrees to its right to 34 to its left), going 4 tiles a second along its way (`AM_SWARM_SPEED`:
  the pictures are drawn for it). In flight it is `makeSwarmSkullArt` (6 frames at 13 a second,
  `SWARM_SKULL_FPS`, flying along its own forward: turned as a monster is for the way it goes), its shadow
  `drawSkullShadow`, where it lands `drawSkullBurst` (the Golem's skull's, in `src/art/mob_shots.ts`). How
  far each flies, whether they seek the hero, and what they hurt are the rules'; in the film each flies 4 to
  5.5 tiles and dives to the floor. As it swells every skull on it burns, and its cracks flare (`burn`, a
  rope of the move's: its skulls' sockets all alight, more of its cracks aglow).
- **Devour** (`more.devour`, 2.8 s; his pick, "Devour (Recommended)": it drags the bones off the floor into
  itself, and a hero with them if close): its maw opens wide, wider, the fire in it roaring, and its front
  arms spread out wide, low over the floor (the warning, 0.5 to 0.92 s); they rake in along the floor from
  0.92 to 1.56 s, gouging it (`drawClawRake`; where the hands are, `amRakeAt(t)`), tearing the dead up out
  of it, bones and skulls and stone, in puffs of dust, and dragging all of it in to its maw, faster and
  faster, tumbling, gone into it; the maw snaps shut at 1.6 s (`AM_DEVOUR_HIT`: the blow); it gulps,
  swelling, its skulls burning bright (`burn`), and lets go. A hero dragged in with it is the rules'; in the
  film a bone beast near it is dragged in by the rake, clawing at the floor (its `more.dragged`), and is
  gone into the maw as it snaps shut.
- **A bone beast bursts out of it** (`more.burst`, 1.5 s; his pick, "As it's hurt (Recommended)": bone
  beasts break off it as it takes damage, and any left alive, it eats back): the back of its right flank
  swells and bulges, shuddering, as something works its way out; at 0.6 s (`AM_BURST_AT`) it bursts there
  (`AM_BURST_FROM`), bone flying, and a bone beast is flung out of it to land behind its right side, clear of
  all six of its arms and of its heap, whichever way it is turned, at `AM_BURST_SPOT` (1.2 tiles behind it,
  1.4 to its right), facing `AM_BURST_WAY`, away from it: the game makes the beast there at that moment and
  plays its `more.emerge` (below); the heap reels from it, and the wound closes. How often, and when, are the
  rules'.
- **Struck** (`reel`, 0.3 s): the heap shudders, its skulls rattling, the arms on its top jerking; its hands
  keep their grip.
- **It bursts apart** (`dying`, 2.8 s, `AM_DIE_TIME`; his words by 16:37, "It bursts apart"): struck down,
  it roars with all its jaws; it swells, shuddering, every skull on it burning and the fire in its cracks
  flaring (`burn`), and holds; at 1.0 s (`AM_BURSTS`) it bursts: its heap slumps and spreads flat over the
  floor, its bones flung out all round, skulls tumbling, its arms falling still where their hands gripped;
  the fire goes out, in its cracks and in its maw (flat by 2.1 s).

## The bone beast (`BONE_BEAST`)

- **What it is** (his pick by 16:40, "As it's hurt (Recommended)"): a piece of the amalgamation's heap gone
  off on its own: a knot of the same dark packed bone, the fire in its cracks, two small skulls sunk in its
  sides; a skull at its front, a jaw full of fangs under it and the fire in its sockets; four arms of the
  dead out of its sides, on which it scuttles low over the floor, elbows up, as a crab does. Small (on the
  bones' canvas, `CANVAS3`), quick, and it bites. Its hands grip the floor as feet do, as its maker's.
- **Standing** (`stand`, 16 frames at 10 a second): it bobs and shifts on its hands, its skull turning this
  way and that, its jaw working; its right front hand shifts its grip.
- **Setting off** (`more.setOff`, 0.3 s), **its scuttle** (`walk`, 8 frames at 20 a second, painted for 1.5
  tiles a second, `BB_PACE`: its hands two by two crosswise) and **stopping** (`more.halt`, 0.3 s, from the
  walk's first frame: at most 0.4 s), carried at its pace as the bosses' are.
- **Its bite** (`attack`, 1.12 s; the blow at 0.62 s, `BB_BITE_HIT`): it rears back on its hind hands, its
  front claws raised and spread, its jaw gaping, its sockets flaring, and holds there, trembling (the
  warning, from 0.28 s); its body tips forward and it pounces, its claws raking down before it, and its jaw
  snaps shut on what is there (a streak of fire behind its fangs); it lands on its front hands, carried on
  by it, and draws back to its crouch.
- **It bursts out** (`more.emerge`, 1.0 s, `BB_EMERGE_TIME`; from the moment its maker's flank bursts, at
  `AM_BURST_SPOT`, facing `AM_BURST_WAY`): it is flung out of the flank curled up (it starts where the flank
  bursts: 34 of the figure's lengths behind its floor point, toward the flank, and 7 up), lands on the floor
  at 0.3 s, its arms unfold and grip, it rears with its jaw gaping, and crouches, ready.
- **Dragged back in to be eaten** (`more.dragged`, going round, 8 frames at 20 a second; "any left alive,
  it eats back"): low on its belly, its skull turned back, shrieking, its claws scrabbling at the floor,
  skittering over it without a grip (held just off it, so they never stand on it), while the game drags it
  in to its maker's maw (the devour); gone into it as the maw snaps shut. When it is eaten is the rules'.
- **Struck** (`reel`, 0.3 s): it jerks back, its jaw flying open, and crouches again.
- **It falls apart** (`dying`, 1.3 s, `BB_DIE_TIME`): it rears, shrieking, its front claws up; it crashes
  down on its belly, its front arms thrown out wide; its knot slumps and spreads, its arms fall flat along
  the floor, and its skull rolls off its front onto its side; the fire goes out of it.

## The review (`src/art/boss_checks.ts`; the art rulebook, How art is made 7)

Every boss through every check the heroes had, on every frame the game would show (his stand at its
own frames a second, his walk at its own, a death at 20, every other move at 30), from in front and from
behind (the camera's true view of his back), in game pixels: **SLIDE** (a heel or toe that is down
stays where it came down, the floor going by under a walk counted; it may only lift, turn on its toe or
rock on its heel), **FLOOR** (nothing of him below it: toes, heels, knees, elbows, hands, his trunk
lying down), **ARM** (no arm in his head, neck, trunk or what he wears on them; no hand in a thigh),
**THROUGH** (what he carries or drags, an axe, a chain, a ball, never through him but where it is held
or hangs from), **JERK** (no frame that leaps, no stall, no snap back at speed, no start or stop at full
speed; a loop's last frame into its first), **JUMP** (where one move hands over to the next: from any
frame of his stand into each move, and back; into his walk and out of it; a chain as well as his body),
**BLOW** (the end he strikes with drawn back, held still a moment, and carried on after the blow),
**HIPS** (the hips get going first, then the chest, then the blow) and **ALIVE** (standing, his chest
rises and his hips sway). The painting (nothing cyan, the enemy's pink edge while he lives and none as
he dies, every pixel whole or empty) is asked of every frame by `tests/bosses.test.ts`. Each boss says
what he is to it (`BossShape`: `HS_SHAPE`, `coShape(mob)`): his outside as solids, what he carries, the
end he strikes with, and where his moves hand over to each other.

- **The Headsman:** 12 moves, 469 frames, each both ways round: nothing found. As he was when he said
  yes to his films (`2328249`), the same review found faults in nine of his moves and where they
  handed over: the worst, his feet sliding as he died (24 game pixels); his left hand leaping 21 game
  pixels in one frame of the throw; the blade leaping 11 in a frame of the chop; his feet sliding round
  in the sweep and his chest turning before his hips; his front foot in the floor in the sentence; his
  toes creeping at every step; his left hand in his thigh taking up and setting down the axe; the
  picture jumping into his walk and out of it; his weight never shifting standing. All mended.
- **The Chained One:** 11 moves as he is chained (546 frames), 11 with his left chain off (546), 9 free
  of the ball (352), each both ways round: nothing found.
- **The Ossuary Amalgamation:** 11 moves (stand, walk, attack, reel, dying, setOff, halt, floorArms, swarm,
  devour, burst), 453 frames, each both ways round: nothing found. As it is not built as a man, it tells the review
  what of it grips the floor (its six hands, in place of heels and toes), its arms (six, in place of two),
  the lumps of its heap (which rest in the floor as it is made), and the points of it followed (its hands,
  its hump, its brow with the maw in it, its middle) and where it strikes from (its swipe's hand; slamming,
  its hump; spewing and snapping, its brow): `AM_SHAPE`. What the review caught while it was being made, all
  mended: its hands put beyond its arms' reach at rest and in the swipe (so they slid); its swipe's arm
  through its own brow; its side hands sliding as it twisted; its elbows into the floor as it died; its
  burst leaping; its slam's hands leaping down; its big moves not drawn back or carried through far enough.
- **The bone beast:** 9 moves (stand, walk, attack, reel, dying, setOff, halt, emerge, dragged), 158 frames,
  each both ways round: nothing found (`BB_SHAPE`). Caught and mended: its skull lunging before its body
  in the bite (now its body tips first, its skull after).
- **A second look, with fresh eyes** (another check of the amalgamation and the beast, its films and this
  record, by one who had not made them, before the hand-over, 10 Oct): it found the beast landing on its
  maker's right hind hand (now it lands clear of all six arms, and `tests/bosses.test.ts` 14 holds it so);
  its maw still glowing after it died (its fire goes out with it now); its skulls not burning, nor its
  cracks flaring, where this record said they did (they do now: `burn`); the broken stone round the arms
  from the floor vanishing all at once (it settles away now); and slips in this record, put right.

`npx tsx shots/boss_report.ts <headsman|chained|chained1|chained2|amalgam|beast|all> [move]` prints the review
(`shots/` is kept out of git; `tests/bosses.test.ts`, test 8, runs the same and wants nothing found).

## For the main chat

- **His yes is given** for all three to go in as they are (01:58, above), the amalgamation once it had
  been through every check (it has, with its bone beast). Their order in dungeons 2 to 4 (his outline of
  22:47, on the board: the Headsman floor 2, the prisoner floor 3, the amalgamation floor 4), and every rule
  of every move, are yours. The numbers above are where the
  pictures put things; the floor drawings in `src/art/boss_shots.ts` take where and when from them.
- **How the moves hand over, as the checks hold them** (play them so, and nothing jumps):
  - The Headsman: `stand` (any frame) into `raise`; `raise` into `setOff`, any blow or `reel`; `setOff`
    into `walk`; `walk` (at its first frame) into `halt`; `halt` into `lower`, any blow or `reel`; a blow
    or `reel` into `lower` or `setOff`; `lower` into `stand` (its first frame). His death begins from his
    carry: from the end of `raise`, `halt`, a blow or `reel`. (If you would have him struck down while
    he stands with the axe planted, say so and I will give his death a way in from there too.)
  - The Chained One: `stand` (any frame) into `setOff`, any move, `reel` or his death; `setOff` into
    `walk`; `walk` (at its first frame) into `halt`; `halt` and every move into `stand` (its first
    frame); `breakL` ends in `CHAINED_FREED[1]`'s stand, `breakBall` in `CHAINED_FREED[2]`'s.
  - The amalgamation: `stand` (any frame) into `setOff`, any move, `reel` or its death; `setOff`
    into `walk`; `walk` (at its first frame) into `halt`; `halt` and every move into `stand` (its first
    frame).
  - The bone beast: made at `more.emerge`'s first frame where its maker's flank bursts; `emerge` into
    `stand` (its first frame); `stand` (any frame) into `setOff`, `attack`, `reel`, `dragged` or its
    death; `setOff` into `walk`; `walk` (at its first frame) into `halt`; `halt`, `attack` and `reel` into
    `stand` (its first frame).
  - `setOff`, `walk` and `halt` are carried by the game at the boss's pace from start to end
    (`MobMove.ground`).
- **His chains cost time to work out** (the Chained One): each move's, the first time it is asked for;
  all of them, in all three of his states, about 15 s on the machine they were made on, a phone several
  times that. `workOutChained(ms)` does a little at a time (his stands first, then his walks, then the
  rest) and says when all is done; call it with a few milliseconds a frame from the start of dungeon 3
  (each step is under 14 ms on this machine), and he costs nothing more when he is met. Whatever is
  asked for before then is worked out then, all at once. The chains come out the same either way.
- **Painting a frame** takes about 21 ms (the Headsman) and 23 ms (the Chained One) on this machine,
  once the chains are worked out: the Headsman has 469 frames each way round (and `holds`, pictures
  only, never played), the Chained One 546, 546 and 352. THE AMALGAMATION IS THE HEAVIEST: about 50 ms a
  frame on average here (42 to 58 by move; a check run while other work was going measured up to 80), its
  heap of packed bone; 451 frames each way round (394 living, 57 dying); worth painting ahead from the start
  of dungeon 4. The bone beast about 3 ms, 155 frames each way round (128 living, 27 dying).
- **What the amalgamation sends out, for you to draw where your rules put them** (pictures in
  `src/art/bosses3.ts`; floor drawings in `src/art/boss_shots.ts`, but the skull's shadow and burst, which
  are the Golem's in `src/art/mob_shots.ts`; all in the enemy's pink and gold): the arms of the dead from the floor,
  `makeFloorArmArt(view)` (its hole on the anchor), with `drawArmCrack` before and after; its swarm's
  skulls in flight, `makeSwarmSkullArt(view)`, taken over from `amSwarmSkulls()`, with `drawSkullShadow`
  and `drawSkullBurst`; where its hands slam, `drawBallCrash` at `AM_SLAM_SPOTS`; its claws' gouges as it
  devours, `drawClawRake` along `amRakeAt(t)`; the bone beast, `makeBoneBeastArt3(pace)`, made at
  `AM_BURST_SPOT` facing `AM_BURST_WAY` at `AM_BURST_AT` into its maker's `burst`.
- **The sizes, measured as `tests/monsters.test.ts` measures `FIGURE_SIZE`** (yours to set): the
  amalgamation, the top of its head on its centre line 34 game pixels up (its highest point 38.5), half
  its width 46; the bone beast 14, and 17.
- **New on `MobMove`** (`src/art/new_mobs3.ts`; no other monster's frames change): `feet` (the
  footwork, laid over a move's bones: planted feet, steps, pivots, a knee on the floor), `ropes` (the
  chains at a moment). A boss's canvas is its own (`HS_CANVAS`, 380 by 340, the floor point at 190,
  262; the Chained One's 420 by 340, at 210, 236). `MobMove.trail` is given the posed bones too
  (`(s, q)`); `posedOfMob` reads a move's pose at a moment.

## Tests and checks

- `tests/bosses.test.ts` (14): 1, the switch is off and nothing of the game imports the bosses; 2, the
  Headsman paints in every frame both ways round, nothing cyan, his edge while he lives and none as he
  dies; 3, his axe never goes through him in any frame of any move; 4, his left hand at the haft's very
  end whenever a pose puts it on the haft, and both hands there at each blow; 5, the chop bites about
  three tiles ahead and the sentence further, both into the floor and not through it; 6, facing away the
  axe is in his right hand (and every other figure is seen from behind as before); 7, as he falls and
  lies, no elbow is above its shoulder; 8, EVERY BOSS THROUGH EVERY CHECK (the whole review, every frame
  of every move, both ways round, nothing found: the Headsman, the Chained One in all three of his
  states, the amalgamation and the bone beast); 9, the Chained One paints in every frame both ways round,
  as free as he is; 10, every pixel of both is whole or empty but the edge of light; 11, his chains hang
  from his cuffs and his collar, a broken one is gone from him, and his throws leave and come back to his
  hands; 12, nothing of the game imports the chains or the checks either; 13, the amalgamation and the
  bone beast paint in every frame both ways round, nothing cyan, their edge while they live and none as
  they die, every pixel whole or empty but the edge; 14, what the amalgamation sends out paints in the
  enemy's colours (the arms from the floor, a skull of its swarm), its swarm leaves its picture out before
  its maw and goes on out, and the beast lands clear of its hands, flung out of its flank.
- `tests/new_mobs3.test.ts`: the new monsters' "nothing of the game imports the mock-up" lets the
  bosses' files (a mock-up of their own) import them.
- The whole unit suite passes on the branch; `tsc` is clean.
- Every frame of the Shade, the Boneward, the Golem, the champion, the marksman, the skeleton, the
  archer, the high priest, the cultist and the troll chieftain (2748 frames) was painted on the base,
  `0ee8a14`, and on this branch at `2328249`, and is the same pixel for pixel (9 Oct). Since then only
  `src/art/new_mobs3.ts` of what they share has changed (`MobMove.feet` and `ropes`, which change only
  a move that has them): the 1388 frames `shots/hash_all3.ts` paints of the heroes, the skeleton, the
  archer, the Shade, the Boneward, the Golem, the champion, the marksman and the Golem's skull are the
  same at `2328249` and now (10 Oct). The Headsman and the Chained One are as they were handed over
  (`1f6eeb6`): every fourth frame of every move of both, in all three of his states, both ways round
  (1048 frames, `shots/hs_co_hash.ts`), the same pixel for pixel after the amalgamation's work.
