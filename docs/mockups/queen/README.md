# Floor 18's boss, the Queen (mock-ups; branch `mockup/queen`)

A helper's branch for the art chat, from `origin/mockup/swan-gardens` (floor 16, the Swan Gardens, finished, with the
Princess, who is the Queen's model: her bones, her checks and her dev page). Nothing here is in the game until the main
chat puts it there, on his yes. Nothing of the game imports any of it, and her switch, `QUEEN_ON`, is off.

## The brief, as he picked it

Floor 18, THE GLASS GALLERY: the queen's wing, long galleries of mirrors and a great glasshouse on the roof; its palette
silver, cold blue glass, dark violet. Her mirror from the Grimms' "Snow White" (1812), only from the book: there the queen
asks her looking-glass who is fairest, and she tries to kill with a laced bodice, a poisoned comb and a poisoned apple.
Her story: "the queen gave the Hush every voice in her court in return for her mirror's. It is the last thing in the
palace that still speaks, and it says only what she wants to hear." When she falls: "her mirror cracks across and, for
the first time, tells the truth: the king is dying, and something sits on his chest."

Her brief was offered to him as a pop-up. His pick for how she moves: “Cold and slow, then sudden (Recommended)”. The rest
is the brief as offered: tall and cold in silver and violet, a crown of glass spikes, her poisoned comb in her hand; her
mirror hanging at the end of the hall and talking to her the whole fight; a head and a half taller than the knight; a
cold, slow glide, then sudden, stepping into one mirror and out of another behind you; her mark the crown of glass spikes;
her moves a stab of the poisoned comb (her basic), Looking Glass, Reflections (copies of you stepping out of the mirrors)
and Shatter (every mirror bursting at once in a storm of shards, with gaps to stand in); each phase another mirror wakes;
her death, her mirror cracking across and for the first time telling the truth; never a cartoon witch, never gory; her
sound glass, her gown and her mirror's whisper.

Read as: everything about her is slow and stately but what she does with glass, which is sudden; and every blow by his
Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; for enemies, 28 Oct:
“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra
time the player gets to evade”): a big held wind-up, a strike of two frames smeared with its after-images, a big
wind-down, and what it covers on the scale of the arena.

## The pictures and the film (docs/mockups/queen/pictures/)

- `queen_sheet.png`: her standing, from in front and from behind, beside the knight, three times as big; below, at the
  game's size (as the Princess's sheet had it) beside the knight, with her mirror speaking and as it tells the truth.
- `queen_mirror.png`: her mirror close: still, speaking, cracked across and telling the truth.
- `queen_shatter.png`: the Mirror Hall at Shatter's warning and at its burst: the lanes and the gaps.
- `queen_moves.mp4`: every move from in front and from behind, at the scale of the arena with the knight in it, captioned,
  each strike again at half speed (see "The film").

## Her look (src/art/queen.ts)

On the heroes' bones, as the Princess is (`QUEEN_BODY`: 73 tall; the knight 58, his head 9.8 from chin to crown, so a head
and a half taller is 72.7; the crown of her head stands 75.8 off the floor, her crown of glass higher still). Slender,
very upright, her chin a little raised.

- HER GOWN: deep violet (`QN_GOWN`). A fitted bodice LACED down its front (the book's laced bodice): a stomacher of silver,
  broad at the neckline and narrowing to the waist, laced across with dark violet; a square neckline, a silver chain at her
  throat with a drop of glass; a silver girdle, its end hanging down her skirt to a drop of glass. An open overskirt of the
  violet over a silver underskirt, falling straight to the floor, its hem edged silver. Fitted sleeves, a band of silver at
  the shoulder, flaring at the wrist into long hanging points that trail as she moves.
- HER MANTLE: the violet, lined a pale grey lavender, from her shoulders down her back into a long TRAIN on the floor
  behind her, its hem edged silver; it trails as she glides and pools round her when she kneels.
- HER HEAD: a pale face, fine-boned, high in the cheek; thin dark brows; lips a dark plum; the dull pink of the Hushed in
  her eyes; her hair blue-black drawn back hard into a high coil with a silver pin, nothing loose.
- HER MARK, A CROWN OF GLASS SPIKES (`QN_GLASS`, pale lavender glass, no glow: glass, not fire): on a silver circlet, nine
  tall spikes and nine short, uneven as ice, the middle one at the front the tallest, splayed out from her head; each tall
  one with a glint down it; a drop of dark violet glass at its front.
- HER POISONED COMB (`combAt`, `COMB`): held by its back across her fist, its curled silver ends out past her knuckles, a
  violet gem at its middle, its six long pale teeth out past her knuckles like a claw, stained violet-black toward their
  tips. At rest it hangs at her side, its teeth down (Monsters 5, “Weapons rest low”).
- SHE GLIDES: her feet never touch the floor under the gown (`QN_HOVER`, 1.6: a flier, his rule of 14 Oct), and they float
  with her, carried and turned as her hips are.
- NOTHING CYAN: her glass is lavender and silver, her mirrors' glass a cold slate blue (`QN_MIRROR`, its hue about 228),
  never the friend's hue (160 to 205) at his saturation. NOT A CARTOON WITCH: no hood, no hooked nose, nothing of any
  film's queen (no standing collar, no black cape, no wimple): an original queen.
- Her picture (`QN_CANVAS`) is 372 by 300, its floor point at (150, 232): room for her lunge and her comb at its reach,
  for her looking-glass beside her, and for her arms flung up.

## Her moves (src/art/queen_moves.ts; `QUEEN`, `makeQueenArt3()` gives `{ front, back }`)

Every blow: a big, held wind-up (its warning: the comb's teeth glint the enemy's pink, glass gathers round her hand, her
eyes show in the glass); a strike of two frames, smeared with its after-images (`QN_STRIKES`, `smearedAt`); a big
wind-down. Times are seconds; lengths are her own (a tile is `TILE3`, about 39.2 of them).

- HER STAND (`stand`, 2.8 s round, 28 frames at 10): cold and still, but breathing; rising and sinking a hair on the air,
  her weight shifting, her head turning as if listening to her mirror; her comb low at her side, its teeth down.
- THE GLIDE (`walk`, 16 frames at 12, `QN_PACE` 2.0 tiles a second; the knight walks 2.5): slow and stately, upright, a
  little lean into her way, bobbing a hair; no steps; her train and her sleeves' points trailing.
- THE COMB (`attack`, `QN_COMB`, 1.5 s, the blow at 0.8 s): she rises and turns away, drawing the comb up high over her
  right shoulder, its teeth toward you, glinting pink and gold by turns and dripping violet poison, her left hand reaching
  out at you, leaning back (held 0.36 to 0.7 s: the warning); her hips turn first; THE STAB in two frames (0.733 to 0.8):
  she lunges 1.34 tiles and drives the comb out at full reach, its teeth 2.54 tiles from where she stood, at your head
  and shoulders, smeared (the comb's way in an arc, her arm's after-images); a burst of violet and pink at its teeth; it
  carries on; she draws herself up where she has come to, 1.6 tiles on (`QN_LUNGE`). FOR THE MAIN CHAT: the move ends
  with her 1.6 tiles forward of where it began: move her floor point there as it ends (the checks' handover says so).
  THE POISON where it struck (art/queen_fx.ts `cloudPainted`, `CLOUD_FX`): out in two frames, three tiles across, low over
  the floor, billowing and held to 1.3 s, thinning and gone by 2.2 s; laid UNDER the figures so it never hides the hero
  (Animations 4). Its area and what it does are the game's; the art is drawn to three tiles.
- LOOKING GLASS, INTO THE GLASS (`more.glassIn`, `QN_IN`, 1.4 s, the blow at 0.867 s): a tall mirror (her looking-glass,
  `QN_GLASS_AT`: floor 18's tall wall mirror's glass, 58 across, 84 high to its arch and the arch 22 higher, at her left,
  facing her) gathers out of flying shards beside her, pane by
  pane, its silver-gilt frame drawn up from its foot (0 to 0.42 s); she turns to it and lays her fingers on its glass, the
  glass rippling where she touches it (held 0.46 to 0.767 s: the warning); in two frames (0.8 to 0.867) she is through it,
  nearly a tile (0.94) in two frames, her train whipped in after her, streaks of her going, a ripple bursting across it;
  the glass settles and bursts back into shards (1.02 to 1.38 s). From in front and from behind alike she goes away from
  the eye into it and its glass hides what of her has gone through.
- LOOKING GLASS, OUT OF THE GLASS (`more.glassOut`, `QN_OUT`, 1.5 s, the blow at 0.667 s): FOR THE MAIN CHAT: play it with
  her put far across the arena, behind you, facing you. A mirror gathers out of its shards at her left (0 to 0.36 s); its
  glass stirs and HER EYES show in it, the dull pink coming nearer (from 0.32 s; held 0.38 to 0.6 s: the warning); in two
  frames (0.6 to 0.667) she is out, 0.97 tiles, her comb up by her shoulder, smeared; she glides on and turns to you,
  standing again by 1.5 s; the mirror behind her crazes and bursts into shards (0.95 to 1.34 s). Through the glass (from
  the end of the one to the start of the other) none of her is painted: only her looking-glass.
- REFLECTIONS (`more.reflect`, `QN_REFLECT`, 1.8 s, the blow at 1.0 s): she lifts her left hand high, fingers spread, rising,
  a ring of glass gathering and whirling round it, a point of pink in her palm (held 0.5 to 0.867 s); her hips turn first;
  she sweeps it down at you in two frames (0.933 to 1.0); carried on; drawn up. WHERE THE COPIES STEP OUT (art/queen_fx.ts
  `emergePainted`, `EMERGE_FX`): a looking-glass (the same tall wall mirror's glass) gathers out of its shards (0 to 0.3 s from her sweep), its glass ripples
  hard and bulges toward the eye with a spray of glass as something steps out (about 0.55 s), and it bursts back into
  shards (0.95 to 1.35 s). The copies themselves are another helper's (`mockup/reflections`).
- SHATTER (`more.shatter`, `QN_SHATTER`, 2.5 s, the blow at 1.367 s): she flings both arms up and wide, rising high on the
  air, her head thrown back, shards lifting off the floor and whirling round her; she holds it, shivering (0.5 to 1.267 s:
  the warning, three quarters of a second); hips first; she slams her arms down and out in two frames (1.3 to 1.367),
  the shards round her flung out; carried on; drawn up. THE STORM (art/queen_fx.ts `shatterPainted`, `SHATTER_FX`, times
  from her move's start): from 0.3 s every mirror of the hall trembles and crazes and the LANE of floor before each lights
  up with its cold glints, brighter as the burst nears; at her blow all of them burst at once (two frames), and their
  glass flies straight across the hall in its lane in 0.45 s, each piece a sliver with its streak; it falls and glitters on
  the floor until 3.0 s; the mirrors' glass grows back (2.6 to 3.4 s). THE LANES (`SHATTER_LANES`): six, across the whole
  hall, each as wide as its mirror's glass (58 across, 1.48 tiles), at 1.5, 4.5 and 7.5 tiles either side of the hall's
  middle; THE GAPS between them, 1.52 tiles, safe to stand in (the middle of the hall is a gap).
- STRUCK (`reel`, `QN_REEL`, 0.4 s): jolted back, her arms flung out, her head thrown back.
- HER DEATH (`dying`, `QN_DIES`, 3.4 s): struck; her hand goes up to her crown as it cracks, the Hush leaving her in a grey
  breath; her comb falls from her hand (0.62 s) and lies on the floor before her; she sinks out of the air to her knees
  (1.0 to 1.85 s) while the spikes of her crown crack, snap one by one and fall (0.18 to 2.7 s), their glass lying round
  her; she sits back on her heels, her head bowed, the pink gone from her eyes (by 2.7 s). Not lying, no blood.
  HER MIRROR AS SHE DIES (art/queen_fx.ts `talkingMirrorPainted('truth', t)`, `TALK_FX`, from her death's start): it cracks
  across in a flash (0.55 to 0.62 s, as her crown cracks), its face clears to a clear silver and loses the pink from its
  eyes (0.8 to 2.6 s), and it speaks (from 1.6 s): for the first time, the truth.

## What her moves leave in the hall, and her mirror (src/art/queen_fx.ts)

- `ARENA`: the Mirror Hall as a boss arena, an ellipse 20 tiles along and 17 across.
- `HALL_MIRRORS` (12) and `hallMirrorPainted(i, t, awake)`: tall pier glasses (`HALL_GLASS`: floor 18's tall wall mirror's
  glass, 58 across, about a tile and a half, 84 to its arch, the arch 22 higher)
  along both long sides of the hall, just inside its edge, facing in; the far ones show their glass, the near ones their
  backs, cut away above `HALL_CUT` (34) as the game cuts what stands between the eye and the fight. `awake`: its glass
  stirring (each phase another wakes: which, and when, are the game's). With `t` (seconds into her Shatter): trembling and
  crazing, burst (its frame left), growing back.
- `shatterPainted(t, 'floor' | 'air', between)`: an arena-sized picture (900 by 620, the hall's middle at (450, 380)): the
  lanes lit and the glass lying (`floor`, under the figures); the glass flying (`air`), only the pieces whose nearness to
  the eye (along the hall less across it) is `between` the two given, so that it is laid among the figures as the game
  sorts them. `shardsAt(t)` says where every piece in flight is, and in which lane.
- `cloudPainted(t)` (the poison), `emergePainted(t)` (where a reflection steps out), as above.
- HER MIRROR, `talkingMirrorPainted(mode, t)` (`TALK_CANVAS` 190 by 260, its foot's middle at (95, 236); it faces along the
  hall): a great pier glass (its glass 60 wide and 136 tall) in a thick frame of silver-gilt, a bead of silver round the
  glass, on a plinth with curled feet; its crest a crown of glass spikes like hers on a silver band, scrolls either side.
  `still`: dark glass, a grey fog drifting in it. `speaking`: the fog gathers into a faint face of grey fog that speaks, its
  edge thinning into the glass, the dull pink in its eyes, its mouth moving, its words a grey whisper drifting out. `truth`:
  as above. No cyan; no pink edge (a prop of the hall).

## How to bring her in (for the main chat, on his yes)

- Her pictures: `makeQueenArt3()` (front and behind; `trueBack`, so her comb stays in her right hand from behind). Her
  moves by name: `attack`, `more.glassIn`, `more.glassOut`, `more.reflect`, `more.shatter`, `reel`, the death `die`.
- THE COMB moves her: as it ends, put her 1.6 tiles on (`QN_COMB.lunge`) along her facing. The poison at its teeth (2.54
  tiles out) as it lands, laid under the figures.
- LOOKING GLASS: play `glassIn` where she is; when it ends, put her behind the player (her left to the side where her
  mirror forms: it is in her own picture), facing the player, and play `glassOut`.
- REFLECTIONS: as her sweep lands, `emergePainted` where each copy comes out (the copies are another helper's).
- SHATTER: her hall's mirrors are hers to show (`hallMirrorPainted`); play `shatterPainted` from her move's start, `floor`
  under the figures and `air` among them; what is hit is whatever stands in a lane (`SHATTER_LANES`) as the glass passes.
- HER MIRROR at the hall's end: `still` before the fight, `speaking` through it, `truth` from her death's start.
- Her switch, `QUEEN_ON`, is off; nothing of the game imports her.

## The film (src/dev/queen_film.ts; tools/queen_film.mjs)

A stand-in Mirror Hall at the scale of a boss arena: its floor dark polished stone (floor 18's own ground is another
helper's: `mockup/glass-gallery`), the hall's mirrors, her mirror at its end, the knight in it, as the game would lay
them. Captioned above (what it is, from in front or behind, half speed) and below (what it does). Every move from in
front and from behind; each strike again at half speed. `node tools/queen_film.mjs <out.mp4> [every]` makes it.

## The checks (tests/queen.test.ts)

1. Her switch is off, and nothing of the game imports her.
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`, as the Princess: `QN_SHAPE`): every frame, from
   in front and from behind, and every handover (her stand from any frame into each move and back; the comb's end where
   the game has moved her; into the glide and out of it at any step); and through the glass, where she is seen at
   neither end, nothing of her painted to leap.
3. HIS LIGHTNING STRIKES: her five blows strike in two frames each and land on the last; the strike's frames and the one
   after carry its smear, and no other frame of any move does.
4. Every frame paints both ways round: nothing cyan (no colour of the friend's, nothing at his hue at his saturation),
   the pink edge while she lives and none as she dies, every pixel whole or empty but the edge; through the glass, none
   of her.
5. Nothing cut off.
6. Nothing of her in the floor (her comb where it falls, her looking-glass on its feet, every grain).
7. His brief: a head and a half taller than the knight, and not two; she glides; her crown of glass spikes, its circlet,
   her comb, its teeth down at rest; the dull pink in her eyes while she is here, gone at the end; her crown's tall spikes
   all snapped by the end and their glass on the floor; her comb on the floor; on her knees, not lying; no blood.
8. Her mirror: a face of fog with the pink in its eyes as it speaks; it cracks across in a flash; its face clears and the
   pink leaves its eyes; nothing cyan; no edge.
9. What her moves leave: the poison out in two frames and gone; the hall's mirrors burst at her blow (their frames left)
   and grow back; nothing cyan in the poison, the mirrors, the storm or where the reflections step out.
10. Her sizes and speeds: the comb's lunge (1.34 tiles in two frames) and reach (more than two tiles); the poison three
   tiles across; her glide slower than the knight's walk and not a crawl; through the glass and out of it about a tile in
   two frames; the arena 20 by 17; six lanes each 1.48 tiles wide with gaps of 1.52; its warning held three quarters of a
   second and more; every piece of flying glass in its own lane in every frame, never in a gap; each lane's glass across
   the whole hall.

`tools/queen_check.ts` prints her review, shortly (`tsx tools/queen_check.ts [move ...]`).

`tests/bosses.test.ts`: its two import checks (what imports the bosses' files, what imports the checks) told of her three
files, as they were told of the Princess's (`^art\/queen(_moves|_fx)?\.ts$`, her files only).

All her mirrors (her looking-glass, the hall's, where the reflections step out) have the glass of floor 18's tall wall
mirror (`mockup/glass-gallery`, his yes): 58 across, 84 to the arch, the arch 22 higher. Her own mirror at the hall's end
is grander: its glass 60 across and 136 tall.

## His word on the pictures

The sheet, Shatter and the film (`queen_sheet.png`, `queen_shatter.png`, `queen_moves.mp4`), asked “The Queen
(queen_sheet.png, queen_shatter.png and the film): is this her? She glides slower than you walk; the sudden part is the
mirrors.”: “Yes, that's the Queen (Recommended)”.
