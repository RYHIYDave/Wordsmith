# THE STRONGHOLDS' FRONTS, A FLOOR'S OWN EACH

His words, 25 Nov 2026, 08:58 (Eastern), to the Skins chat of 13 Nov: **“Endless mode is adding strongholds to every level, and I
need the facades of the strongholds that you go into to match each of the levels.”**

Read as, and told him so: on every one of the twenty levels the stronghold's front is built in that level's own stone and style
(a crypt's sealed vault, a fort in the canyon's rock, the city's gatehouse, the palace's locked wing, and so on); today every
stronghold wears the Quarry's gatehouse but Echo Canyon's. Asked by pop-up, his picks by 10:04:

- on the levels outside the Wilds, whose stronghold: **“The cult's, in each level's building (Recommended)”** (each level's own
  kind of building, taken by the cult: its banners and its burning seal on the door, so it still reads as the same place to go in);
- levels 7, 9 and 10 in the story (they wear the Quarry's gatehouse): **“Yes, story and endless alike (Recommended)”**.

Branch `art/stronghold-fronts`, from `main` 41f47ac1 (25.3.22). Behind the switch `OWN_FRONTS` (`src/game/act1_dress.ts`), off
until his yes, on since (at its foot).

## What is in it

`src/art/hold_fronts.ts` (the eighteen fronts) and `src/art/hold_fronts_kit.ts` (what they are built with). Each is built in the
world as the Quarry's gatehouse is (`src/art/floor6.ts` `gatehouse`): its face along x looking out down the screen to the left,
the door's foot at its anchor (the gatehouse's canvas, 300 x 440 picture pixels, the door's foot at (100, 392): (50, 196) in the
game's pixels), so any of them stands where the gatehouse stands; a third again as big as measured; lit from the upper left; its
seams inked. Each a piece of kind `gate`: frames 0 to 3 its door sealed, the cult's mark cut huge in the floor's own door and
burning pink (four frames of its flicker, its light), frame 4 open (the dark of the way in, steps going down). On every one the
cult's banners and its pink fire in sconces, in the floor's own colours otherwise:

| Level | Its front |
|---|---|
| 1 The Warden's Tomb | the tomb's sealed vault: a royal mausoleum of the tomb's green-grey stone, a portico of two columns under a pediment with the king's crown, wings with dark niches, moss, the town's roots breaking over it |
| 2 The Headsman's Yard | the condemned's block: a cell block of the grounds' blue-grey stone under a steep slate gable, buttresses, barred windows lit within, a lower range of cells, a hanging cage |
| 3 The Chained One's Pit | the iron vault: a squat block of the prison's black stone, the door's bay cased in riveted iron with a grille, spiked iron piers with great rings and chains, the coals glowing through slits at its foot |
| 4 The Ossuary | the bone chapel's portal: a front faced with skulls and long bones, a pointed arch, columns of stacked skulls, a bone gable with a skull at its peak, candles in niches |
| 5 The Fleshmancer's Lair | the temple in the rock: the mine's rock face propped with its timbers, the temple's black doorway stepped into it, a lintel with the cult's skull, a miner's lantern, rails in under the door |
| 6 The Quarry | its gatehouse, as it is |
| 7 The Ledge Road | the cliff watch-fort: a squat tower of the ledge's grey rock, a timber hoarding under a snowy shingle roof, one of the queen's great nests on top |
| 8 Echo Canyon | its waystation's gate, as it is |
| 9 The Pinewood | the stockade gate: a palisade of sharpened pines on granite, two log towers with roofs of bark and needles, a gate of split logs under a walk of planks |
| 10 The Sunken Fen | the drowned shrine: an old shrine of the fen's ruin-stone in the mire, broken pillars, props of dead wood, hanging moss |
| 11 The Gate Ward | the watch-house: a stone ground floor, a jettied upper floor of oak and cream plaster with lit windows, a clay-tile roof, a round turret with a slate cone |
| 12 The Undercity | the sluice-house: a vaulted front of the cistern's brick, a low culvert arch, an iron sluice-frame, slime run down from the coping, rusted pipes, the channel's green water |
| 13 The Millrace | the mill-house: fieldstone below, timber framing and limewash above, a slate roof, a hoist-beam with a sack, the great water-wheel in the race |
| 14 The House of Quiet | the hospice's door: pale green-white limewash over the infirmary's green boarding, a marble porch, mahogany double doors, a faintly lit lunette, a slate roof behind a parapet |
| 15 The Great Library | the library's great door: shelves of books to the cornice, walnut pilasters, gilt, tall walnut doors, an open book carved over them with the cult's mark across its pages, a ladder |
| 16 The Swan Gardens | the garden pavilion, standing on its own in the gardens (his word on its first try, below): a small temple of the gardens' pale limestone on two steps, four columns across its front, its room behind them with its door sheeted in lead, a ribbed lead dome with a lantern, carved swans on plinths at its front corners, clipped box, roses up a column |
| 17 The Masque | the stage door: ebony and gilt over the masque's dark wine damask, velvet curtains drawn back and tied, a gilt mask over the door |
| 18 The Glass Gallery | the mirror door, built as a run of the gallery's own wall (his word on its first try, below): the wall either side at the gallery's height, violet damask over grey stone and a gilt rail, a great mirror in gilt on each; the door's bay higher, grey stone pilasters, a glazed fanlight, the door of mirror-glass, a gilt cornice with a broken pediment |
| 19 The Keep | the inner gatehouse: two square towers of the keep's cold stone with battlements, the portcullis drawn up, the king's arms in gold with the cult's skull painted across them |
| 20 The Quiet Tower | the tower's bell-door: a round tower of the tower's grey stone under a cone of oak shingles, a porch with a pointed door, buttresses, a little bell in an arch of grey oak, loose pages |

AND, FOUND ON THE WAY (the rule: what the task turns up is finished in it): the court of flagstones before the strongholds of 7, 9
and 10 was the Quarry's pale stone; with the switch on it is laid in each floor's own (`COURT_NAMES`, `holdCourtOf`: the Ledge's
grey rock, the Pinewood's granite, the Fen's ruin-stone).

## With the switch on (OWN_FRONTS)

- `HOLD.gate(floor)` is the floor's own front (`FRONT_NAMES`; 6 and 8 as they were), in the story as in endless; `HOLD.courtOf`
  the court's tiles on 7, 9 and 10.
- The floors' pieces hold their front: 6 to 20 in `src/render/act1_pieces.ts` (and on 11 to 20, which have no stronghold of the
  story's, the cult's altar, braziers and banners with it), 1 to 5 in `src/art/floors.ts` `lookPieces` (with the same). A front's
  frame: its mark's flicker while sealed, the fifth open (`src/render/act1_pieces.ts`, `src/render/pieces.ts`).
- Under the loading screen a front is made a frame a step (`holdFrontSteps`; a front at once took 0.15 to 0.86 s under node,
  a frame at most 0.25 s), and on 1 to 5 the Quarry's list a piece a step with it, the cult's things being its.
- Off, all as it was.

## For the Godot chat, which puts strongholds on every endless level

Each floor's front is the piece named `FRONT_NAMES[n]`, its five frames as above, anchored as the Quarry's gatehouse (the door's
foot at the yard's gate point, `gx, gy`, as `src/game/act1_dress.ts` lays it). Where the yard is laid in the open (the Wilds,
the Gate Ward, the Millrace, the Swan Gardens), as the gatehouse is; in a level of rooms, against a room's back wall (running
along x), the yard of about six tiles by three before it, as the pictures were taken. Their courts on 7, 9 and 10 are their own
stone; elsewhere the yard is the floor's own ground.

## The pictures

- `pictures/stronghold_fronts_levels_1-10.jpg`, `pictures/stronghold_fronts_levels_11-20.jpg`: IN THE GAME, the switch on, each
  level entered as an endless level (no story on it), its front with the cult's altar, braziers and banners before it (on 6 to 10
  its own stronghold's yard, as the game lays it; elsewhere at a room's back wall near where he comes in), sealed. Made with
  `tools/scenarios/hold_fronts.mjs` (a phone's screen, 844 x 390; the view leaned up by 60 of the game's pixels, render/render.ts
  `PICTURE_LEAN`, a playtest's alone, so that the whole front is in sight).
- `pictures/fronts_drawn_sealed.png` (sealed, labelled) and `pictures/fronts_drawn_sealed_and_open.jpg` (each sealed and open), on
  a plain floor: `npx tsx tools/hold_fronts_pics.ts <out.png> [floors] [scale]`.

LOOKED AT: every front drawn, sealed and open, three times as big as the game's; then every one in its own level in the game.
Mended on the way: floor 5's rock in narrow columns of their own heights (a flat slab of it floated over the door), its doorway
cleared of the rock's sides; floor 10's shrine roofed in its stone (its broken top read as stairs); floor 14's porch widened (its
pillars hid the door); floor 20's tower set back (its wall stood in front of the door); floor 3's vault rebuilt about an iron bay;
floor 1's roots thickened; the indoor fronts' tops darkened.

CHECKED: `tests/hold_fronts.test.ts` (new): 1. every floor a front by its own name, each once, painted for all but the Quarry and
Echo Canyon; 2. each on the gatehouse's canvas and anchor, sealed with the mark burning and its light, open with the way in dark,
the cult's fire on it either way; 3. off, the gate as it was; on, a floor's own, 6 and 8 unchanged; 4. on, the floors' pieces hold
their front and courts and the cult's yard; off, as they were; 5. under the loading screen a front made a frame a step, the same
frames as at once, nothing left put by, the floors' steps holding them. `tests/look_parts.test.ts` 6 allows for the Quarry's
list made already by floors 1 to 5 (the cult's things are taken from it), and counts the fronts' list's step. `tsc --noEmit -p tsconfig.json`: clean but for
`tests/relief.test.ts` line 378, which is on `main` as it is.

SHOWN HIM, 25 Nov 2026, after 10:51 (Eastern): the two sheets in the game; asked by pop-up whether they match their levels well enough to switch
on. HIS WORD: **“I like them except level 18 cause that is just in the middle of the flooor”**. Read as, and told him so: on 18
the mirror door stood out on the open floor like a cabinet, where it should be part of the gallery's wall. So 18 is rebuilt as a
run of the gallery's own wall (above), and pictured against the gallery's back wall (`WALL=4`, a place with four tiles of wall
behind it either way); the rest as they were.

Shown 18 so, asked whether it is right now. HIS WORD: **“16 doesn’t work as well”** (read as: 18 is right; 16 has the same trouble).
Read as, and told him so: on 16 the folly's yew hedges jammed against the gardens' own balustrades and steps, where a garden
building should stand on its own. So 16 is rebuilt as a garden pavilion standing free (above), named `the garden pavilion`, and
pictured on the gardens' open lawn by a path (`OPEN=1 PICK=3`, a place with open ground behind it as well as before it).

Shown 16 so, asked whether it works now. **HIS WORD, 25 Nov 2026, by 11:33 (Eastern): “Yes, switch them all on (Recommended)”.**
SO OWN_FRONTS IS ON (`src/game/act1_dress.ts`), and `tests/hold_fronts.test.ts` 1 says so. Handed back on the queue page's ship
list, `stronghold-fronts`, for the Godot chat to bring in (above, “For the Godot chat”).
