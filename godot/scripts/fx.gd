## WHAT THE FIGHT SHOWS OF A BLOW AND OF A WORD (render/fx.ts): the game's rules do not draw; they TELL what happened
## (game.ts `emit`), and its renderer makes of each telling what is seen: the swing's streak, the sparks and the number of a
## hit, a burst, flames catching, ice, an arc of lightning, a stun's stars. Here the same: the rules call `event` with the
## game's own telling (its `t` the game's name for it, its other keys the game's), and this node draws it.
##
## THE TELLINGS THE WORDS' RULES SEND (game.ts), each with the game's own keys (x, y: tiles on the floor):
##   swing     {x, y, dx, dy, reach, el, words, n, echo}     a blade swung from (x, y) the way (dx, dy), so far; its element
##             and the words in front of the move (what colours it)
##   hit       {x, y, amount, crit, el, heavy, words, poison} a blow landed on a monster at (x, y) for `amount`
##   burst     {x, y, r, el, style, words, n, echo}           an area struck: `style` "shock" (Power's splash, a shock through
##             the ground), "blast" (an explosion: Flame's and Frost's splash), "land" (a leap landing), "whirl" (one turn of
##             the Whirlwind)
##   ignite    {x, y}                 a monster catches fire
##   freeze    {x, y}                 a chilled monster struck again freezes
##   arc       {x0, y0, x1, y1, sky}  lightning: down out of the sky on the one struck (`sky`), then from it to another
##   poisoned  {x, y}                 the poison takes hold of a monster
##   stun      {id, x, y, secs}       a monster stunned
##   stagger   {id, x, y, fromX, fromY}   a monster staggered by cracked ground
##   heavy     {x, y, r, big}         a Heavy blow's weight coming down
##   buff      {kind, x, y, stacks}   the hero's own: "might" (Power behind, so many stacks), "haste" (Swift behind)
## WHAT IS DRAWN FROM THE STATE ITSELF, every frame, not from a telling: a monster burning, chilled, frozen, poisoned, stunned
## (monster.gd burn_t, chill_t, frozen_t, poison_t, stun_t) and the ground a move left (wakes.gd).
##
## NOT DRAWN YET: this is the place for it. Until the game's looks are brought over, a telling is only counted (`seen`), so
## that a check can say the rules told what they should.
extends Node2D

## How many of each telling there have been (by its `t`): for the checks.
var seen := {}
## The last of each telling, as it was sent.
var last := {}


func event(e: Dictionary) -> void:
	var t: String = e.get("t", "")
	seen[t] = int(seen.get(t, 0)) + 1
	last[t] = e
