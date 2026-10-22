# Act 2's town hub in Vellum: the camp inside the gate (a mock-up, handed back to the main chat)

The art chat's branch `mockup/act2-hub`, from `v23` at d1327bc. Nothing here is in the game until the main chat puts it
there. Everything is behind `HUB2` (src/art/hub2.ts), off, and nothing of the game imports the hub's three files.

## What he said (all 22 Oct 2026, Pacific, in the art chat)

- 08:42, asking for it: “I’d like a new town hub for act 2.  So something matching the city vibe of Vellum”.
- Offered places for it, with the town's four keepers and the time of day: “I like the market square and the camp.  Can
  I see both?”; of the keepers, “Same four, moved in (Recommended)”; of the light, “Dusk, warm and alive
  (Recommended)”.
- Shown both (the lamplit market square round a fountain; the survivors' camp just inside the city's gate): “The camp
  yes.  Also some different looks for the shops”.
- Offered new looks for the two shops: the armourer's, “Field forge on a cart (Recommended)”; the mystic's, “Painted
  caravan wagon (Recommended)”; and of the rest (the wordsmith's ring, the Lexicon, the stash, the stranger): “I’d like
  to see all of them in a new style but more than likely we’ll stick to just the vendors for new looks”.
- By 09:35, shown the new shops and the rest camp-style: “Yes, these shops (Recommended)”, and “Just the shops
  (Recommended)”. So the ring, the Lexicon, the stash and the stranger stay as they are now; their camp-style looks are in
  the code (`campPlace(true)`), seen and let go.
- Offered people for the camp: who, “The Hushed, voices back (Recommended)” (offered as floor 11's porter, goodwife and
  baker as they were before the Hush, colour in their faces, talking); what they do, “Talking round the fire
  (Recommended)”; whether they notice the hero, “No, they keep to themselves”.
- By 11:30, shown the camp moving and asked whether it is right as the Act 2 hub, the camp, its shops, its people and how
  it moves: “Yes, send to main (Recommended)”.

What he saw: previews/hub2/1 to 10 on the art chat's machine (the square and the camp, whole and as a phone shows them;
the new shops; the rest camp-style; the others now and in the camp; the camp moving, an MP4; the three round the fire).
The dev page makes them all again (below).

## What it is

**THE CAMP INSIDE THE GATE.** The yard just inside Vellum's gate, 20 tiles by 18, where the siege's survivors camp, at
dusk, warm. The gatehouse at the end of a short street in from the left (the gate, the way on; the waypoint at its mouth);
tents of patched canvas along the back, bedrolls before them; the cooking fire in the middle, three logs round it, a
person sat on each; THE ARMOURER'S FIELD FORGE ON ITS CART against the back row on the right, his anvil on its stump
before it; THE MYSTIC'S PAINTED CARAVAN at the back, its side let down, he before it, his trestle of wares before him;
the wordsmith's ring at the front on the left, the Lexicon by the gate's street, the stash by a handcart, the stranger in
the gatehouse's shadow, all as they are in the game now; crates, sacks, hay, a cart barricade across a street off to the
right, braziers, lamps, washing and paper lanterns on the house fronts. All laid in `src/art/hub2_camp.ts`
`campPlace(false)`, tile by tile.

**Files.**
- `src/art/hub2.ts`: `HUB2 = { on: false }`; `CITY`, the town's things (art/town.ts `makeTownProps(CITY)`) and the
  waypoint in the city's grey stone; `hubPieces()`, the hub's own pieces, each a `Piece` of the Act 2 kit: the camp's
  (a tent ×16, the cooking fire ×4 moving, a log to sit on ×2, a bedroll ×8), the two shops ("the armourer's field
  forge" ×4 moving, "the armourer's anvil, on its stump", "the mystic's caravan", "the mystic's trestle" ×4), the city
  gate held, the square's fountain and ward arch (the square he let go), and the rest camp-style (seen and let go).
- `src/art/hub2_camp.ts`: the camp's layout (`Place`): the open yard and its streets (every other tile a house, as the
  Gate Ward paints them), every piece by name, frame and place (`anim`: frames a second of those that move), the town's
  own things and its four keepers, the three by the fire, where each service's name is written, where the hero starts.
- `src/art/hub2_folk.ts`: the camp's three people, `CAMP_FOLK` and `campFolkFrame(who, t, view)`: the Hushed of floor 11
  painted with `HUSH_FREED` on (colour back in their faces and hands, their own eyes, no Hush breathing out of them, no
  ink), no edge of light (his rulebook: townsfolk have none), sat on a log, hands out to the fire, talking in turn, a
  laugh at the end of each turn; a round of `TALK_LONG` 6 s, `TALK_FRAMES` 60 at `TALK_FPS` 10. They keep to
  themselves: nothing about them answers the hero.
- `src/dev/preview_hub2.ts`: the dev page that lays both places by hand and paints them as the game paints the Gate Ward.

**Three switches in the game's own files, all off by default, the game as it was while off** (tests/hub2.test.ts 2):
- `art/floor11.ts` `cityGate(k, held = false)`: held, the Order's banner down and the city's slate-blue one with its
  cream book up, the ink off the arms, the dome's shard pulled out and its light gone.
- `art/gateward.ts` `GateWardLand.swept`: the ground as the city's people keep it: no scorch of the siege, no leaflets,
  only the deepest hollows holding water.
- `art/hushed.ts` `HUSH_FREED`: the Hushed with their voices back (above); `campFolkFrame` sets it while it paints and
  puts it back.

## For the main chat: what the game needs to have it

The rules and the flow are the main chat's (and the planning chat's): when the hero is in this hub, how the gate takes
him on to floor 11 and onward. What the art asks:
1. A hub level for Act 2 laid as `campPlace(false)`: the ground painted from `gateWardPaintFloor(land, 'open')` with
   `gateWardLook(land, 'open')`, `land.swept = true`, the houses its walls; the Gate Ward's pieces and the hub's by
   name where `dress` puts them, the moving ones at their `anim`.
2. The stations where `town` and `labels` put them: GATE at the held city gate (its name written higher, 150, the gate
   being tall), ARMOURER at the field forge (his figure stands at its side), MYSTIC at the caravan's trestle (96), and the
   ring, Lexicon, stash and stranger as the Act 1 town has them (`ring()` is level.ts TOWN's ring). The two shops REPLACE
   the old forge, anvil, rack and trough and the mystic's tent, rug and table; the keepers are the same four, painted as
   now.
3. The three by the fire, each a picture from `campFolkFrame` at the camp's `folk` places (front or back, mirrored or
   not), cycling with the talk; nothing to say to the hero, nothing to click.
4. The light: dusk, warm, the fires lit. The dev page lays a warm orange over everything with a little violet and a dark
   edge (`dusk()` there) and each light at half as wide again; the real thing is the renderer's, as warm as the films.

## Checks

- `tests/hub2.test.ts` (5): the switch off and nothing of the game importing the hub; the three switches off change
  nothing, on each does what it says; every hub piece its own name, every frame painted, none of the enemy's pink on it,
  every light it gives an honest fire or the friend's cyan; the camp's people with no pink, no Hush's breath, sat (their
  picture under 85% of the Hushed standing); the camp as he said yes to it: every piece one there is, every service named,
  everything on open ground.
- `tests/floor11.test.ts`, `tests/hushed.test.ts`, `tests/new_mobs3.test.ts`: their lists of mock-ups allowed to import
  floor 11's art, the Hushed and the mob painter take in hub2 and hub2_folk.
- Not run: the browser playtests (nothing of the game changed while the switches are off); the full regression.

## The dev page

```
node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp.png 2000 1150 camp          (camp-phone: 1014 468)
node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/camp_all.png 2000 1150 camp-all  (the rest camp-style too)
node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/square.png 2000 1150 square      (the square he let go)
node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/pieces.png 1400 1750 pieces
node tools/preview.mjs src/dev/preview_hub2.ts shots/hub/folk.png 2000 1150 folk
node tools/page_gif.mjs src/dev/preview_hub2.ts camp-film shots/hub/camp_film.gif         (the camp moving; MP4 with ffmpeg)
```
