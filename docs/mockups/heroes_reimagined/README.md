# Mock-up: THE THREE HEROES REIMAGINED (NOT IN THE GAME until the main chat puts it there)

**HIS ANSWER: NOT WANTED.** By 05:24 on 9 Oct, asked whether he liked the three: "No, try again";
and by 05:26, asked which way to try again: "Leave the heroes as they are". So the heroes keep
today's looks; this branch is kept only as a record, and nothing of it goes into the game.

**What it is.** A new outfit for each hero over the same bones and moves (the art rulebook: "built
for skins"), made while the owner slept, for him to judge. Behind switches that are off:
`REIMAGINED = { ranger, knight, mage }` in `src/art/reimagined.ts`. With them off every frame of
every hero is exactly today's (tests check it, byte for byte).

**Where:** the branch `mockup/heroes-reimagined`, from `main` at Version 19.4 (`9e148f3`).

## His words

- 9 Oct, 00:05: "And let’s see what you think a reimagined ranger skin would look like".
- 00:20: "I’m going to bed so just keep working on new animations, then rework the ranger, then go
  into new mob types".
- 00:25: "And give me a reimagine of the warrior and mage while you’re at it.  I just want to keep
  the pig helmet for sure on the warrior".

## What they are

- **The ranger, "the Wind-runner"** (`src/art/hero3_ranger2.ts`, `paintRanger3b`): a hood joined
  to a short capelet with a dagged hem, in his bright green; from the hood's crown a long tail of
  cloth (a liripipe) that streams back on the wind and his motion (his element is wind); his long
  glowing feather kept, tucked into the hood; his face in its shadow, eyes with a cyan glint over a
  dark wrap; a dark teal jerkin with a quiver strap across it, a belt and pouch, a bracer on the bow
  arm; pale leg wraps and soft brown boots; the quiver on his back. The bow, arrows and squirrel as
  today.
- **The warrior, "the Boar Knight"** (`src/art/hero3_knight2.ts`, `paintKnight3b`): HIS PIG
  HELMET EXACTLY AS TODAY (his rule; a test compares its lines); big pauldrons of plate (domes over
  two flaring lames); a dark fur collar round his neck and shoulders; a long deep-crimson cloak with
  a ragged hem; a breastplate under a short red tabard with a cream boar's head on it; a heavy belt
  with a bronze buckle, a mail skirt, steel on his arms and legs. The great sword as today.
- **The mage, "the Storm-witch"** (`src/art/hero3_mage2.ts`, `paintMage3b`): her pointed hat
  taller, its tip bent and twisted, a wider floppy brim with a torn notch, the band of cyan light
  kept, small rune charms hanging from the brim; her pink braids longer and flying; a long
  high-collared coat in deep violet, open below the waist into two long coat-tails that flare, a
  line of small cyan runes at its hem; a plum bodice with straps, a belt with pouches and a small
  grimoire; long gloves with steel bracers; her boots and her staff as today.

Nothing on them glows but the friend's cyan.

## What it touches beyond the art

- `src/art/heroes3.ts`: `paintMove3` uses the new painter for a hero while its switch is on.
- `src/art/hero_ranger.ts`, `src/art/hero_mage.ts`: the new cloth's tails added to their tables
  (unused while the switches are off).
- `src/engine/tails.ts`: three opt-in fields for the new cloth (`wave`, `across`, `inside`); a
  test holds that every one of today's tails moves exactly as before.
- When the big-and-wild work (`WILD`, on `art/wild-skills`) comes in, `hero3_mage2.ts` must take
  the crystal's glow and charge from `hero3_mage.ts` as it has them there.

## How it is checked

- `tests/reimagined.test.ts` (14): every switch off; with each off, every move's frame identical to
  today's painter's; with each on, every move painted whole, its tails tied on, nothing in the
  enemy's colours, the other heroes unchanged; the warrior's head unchanged. With the switches off
  and on, the hero, combo, tails and figure tests pass; tsc clean.
- The pictures: `node tools/preview.mjs src/dev/preview_reimagined.ts previews/reimagined/<hero>_sheet.png ...`
  and `src/dev/preview_reimagined_gif.ts` (through `tools/page_gif.mjs`) for `<hero>_moving.gif`.

## To make one the game's own

Turn its switch on (or put its painter in place of today's in `heroes3.ts`). Each is a skin: the
moves do not change.
