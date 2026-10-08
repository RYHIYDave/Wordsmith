# THE PUZZLES AND TRAPS: A PLAN ON PAPER (after 18.9; nothing built)

His words, 4 Oct 2026, 20:23: "And let's add some puzzles and traps in the dungeons when the dungeons
get overhauled". The list of six went to him with 14.1; he picked none, and was told that then the
first to be built are THE SPIKE FLOOR, THE DART WALL AND THE WORD DOOR. Pictures first: a hall laid
by hand for them (`#hall=traps`, as the mix's), stills and a short moving picture, ONE QUESTION; the
map-maker lays them in dungeons behind a switch (`TRAPS.on`), off until his yes.

(The ranger's own TRAP is another thing with the same name: in the code these are HAZARDS and the
WORD DOOR; on the screen, "spikes", "darts", "a sealed door".)

## 1. The spike floor
- A patch of floor (two by three in a corridor's width, up to four by four in a room) whose spikes
  come up on a beat: down 1.6 s, a warning 0.3 s (the holes glint), up 0.6 s.
- Up, they hurt whatever stands on the patch (hero and walkers; bats fly over): a share of the
  hero's life (about a sixth) once per rise, the hero's usual flash; monsters take the same share of
  theirs, so a pack can be led over them (his list: "They hurt monsters too").
- Seen from far enough to be read: the holes in the stones always; the spikes iron, catching the
  light (not a glow: glows are cyan for friends, pink and gold for enemies; this is the dungeon's).
- Rules: `Floor.hazards` (kind 'spikes', the tiles, the beat's offset), `Level` keeps the clock;
  `game.ts` steps them and hurts; the bot waits for the beat.
- Never in the first dungeon's lesson; never in a doorway; never under a lever.

## 2. The dart wall
- A plate in a corridor's floor (seen: a square stone, a hair raised) and a slot in the wall at the
  corridor's end; the hero steps on the plate and three darts leave the slot one after another along
  the corridor (hostile shots, as an archer's, a little faster), hurting what they meet; a roll or a
  leap gets past; a monster on the plate does not set it off (he chooses when).
- The plate re-arms after 3 s. The slot is painted into the wall's face.
- Rules: `Floor.hazards` (kind 'darts': the plate's tile, the slot's place and the way it shoots).

## 3. The word door
- A sealed door with a rune on it, in the way in of a small treasure room off the path (like the
  lever's nook): the rune is a word the hero may have (FLAME, FROST, LIGHTNING, POISON...), in that
  word's own colour; it opens only to a hit by an attack that carries that word ("FLAME on the
  door: hit it with a flame attack"); behind it a chest.
- Read back to him once: "The one puzzle only this game can have."
- Rules: a door kind 'worddoor' (doors.ts) with its word; `hitMonster`-like hits on its tile;
  it opens like a door and stays open; a line says "A sealed door. It wants FLAME." the first time.
- Never a word the hero cannot yet have had (the dungeon's depth decides which words it may ask).

## 4. Order
Hall and pictures (stills of each; a moving picture of the spikes' beat and the darts) → ONE
question → the map-maker (one or two of each in a dungeon from the second) behind `TRAPS.on` →
tests (rules, map-maker, the bot gets through) → his yes → a version tested as ever.
