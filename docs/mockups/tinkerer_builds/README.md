# The Tinkerer's builds

Asked after the Warlock's builds whether to go on to the Tinkerer: “Yes, the Tinkerer next”. The plan (Tesla Fence, Coin Toss)
answered with: “I need the tinkerer to get vial changed to Bomb.  Her description at the selection screen has bomb in it yet she
deploys no bombs”; then “Bombs, then the plan (Recommended)”; after the film and the cards, “Yes, switch them on (Recommended)”
(by 14:25).

## What is in it (godot/scripts/heroes/tinkerer_builds.gd, on)

- **Bomb Toss** in the Vial Toss's place: the same throw and burst, a lit bomb in the air (her Contraption's, bigger from her hand)
  and a bomb's blast where it lands, a blast's sound. Every word of hers that said vial says bomb: the move, the VIALS path
  (BOMBS), Cluster Bombs, Tar, Mad Mixture, Alchemy, The Big One, Growth Serum, Contraption, the Contraption's card, the
  Tarwrench and the Foreman's Wrench.
- **Tesla Fence** (off Contraption): “Lightning arcs between your Contraptions, striking every enemy that crosses the line between
  two of them.”
- **Coin Toss** (off Fortune): “Your tap throws a fan of 5 gold coins instead of a bomb, each costing 1 gold. Coins hit harder the
  more gold you carry: +100% per 1,000 gold, up to +200%. (Contraption or Coin Toss: only one.)” With too little gold, a bomb as
  ever. A small stone, as Contraption is (his rule for the attacks changed: a twig off its path, leading nowhere).

## Checked

`xvfb-run -a godot --path godot --rendering-driver opengl3 -- --only=tbuilds --shots=<dir>`: 8 of 8 (her words, her tree's, her
uniques'; a lit bomb and a bomb's blast; the fence striking the one between two Contraptions and not one off the line; five coins
for five gold, twice as hard at 1,000 gold, three times at most, a bomb with too little gold; Contraption or Coin Toss, one).
`--only=talents`: 89 checks, two lines wrong, #22 Leaping Chop and #66 Minefield, both wrong the same way on the released game.

Pictures: tinkerer_builds_cards.png (her tree and the new cards), tinkerer_builds.mp4 (9 s).
