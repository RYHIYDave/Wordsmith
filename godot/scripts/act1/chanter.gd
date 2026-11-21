## THE CHANTER (the cult, floors 6 to 10), as the game fights it with its chain lightning, as the game starts (game/act1_rules/
## chanter.ts RULES, CHANTER, wardOf, CHAIN_PERIL; art/action_f6_cult.ts CHAIN, CAST_HIT, castFrom; CHANTER_LIGHTNING on:
## game/enemy_moves.ts). His doc's mob table: "A bolt of cursed words. Nearby cultists take less damage while it lives, so kill
## it first" (small: one attack).
##   ITS PROCESSION: a tile a second, its walk a second round, looping from its stand; it stands off as near as 5 tiles and
##     sets off again beyond 6.
##   THE CHAIN LIGHTNING (within 7 tiles; list `attack`, 1.8 s): its book heaved up, crackling; at 0.4 s where the hero stands
##     is taken, and a ring crackles there, closing in (chanter:chain); at 0.967 s the lightning leaps from its pages to the
##     ring: a hero within a tile of its middle is struck, x1, of Lightning whatever its words, the static crackling round him
##     0.8 s after. It would jump on to other players; with one hero, never. If the chanter falls, or is stopped, before it
##     strikes, the ring goes.
##   ITS WARD (act1.gd warded): while it lives and is awake, each of the cult's other kinds within 4.5 tiles of it (the dagger
##     cultist, the cultist, the firepot thrower, the mini fleshmancer, the high priest) takes 40% less harm from everything,
##     its ring of the cult's pink marks turning at their feet (chanter:ward; once under each, however many shield it). Not
##     another chanter, nor itself: it is the one to kill first.
extends "res://scripts/act1/act1.gd"

## (art/new_mobs3.ts TILE3)
const TILE3 := 39.191835884530846
## (RULES.gait)
const GAIT := {"pace": 1.0, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 5.0, "slack": 1.0, "trueBack": true}
const ACTS := [
	{"id": "chanter:cast", "clip": "attack", "long": 1.8, "hit": 29.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.4, "near": 0.0, "far": 7.0},
]
## (CHAIN: its aim taken at `aim`; a hero within `r` struck; the static round him `crackle`; the bolt seen `seen`, fading)
const CHAIN := {"aim": 0.4, "r": 1.0, "crackle": 0.8, "seen": 0.22}
## (castFrom: where the lightning leaves its pages as it strikes, its own lengths before it, to its left, and up: worked out
## there from its bones and copied here)
const CAST_FROM := [24.705187493482477, 0.0, 31.884268181544428]

## (its ward's mark, laid as it wakes, and laid again should the hero's fall sweep it away)
var _ward = null


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func tick(m, _dt: float, _dist: float, _hero) -> bool:
	var there := false
	if _ward != null:
		for q in m.mgr.perils.list:
			if is_same(q, _ward):
				there = true
				break
	if not there:
		_ward = peril(m, "chanter:ward", m.world, {"dur": 1e9})
	return false


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	# (its ring where the hero stands as it takes its aim; at its strike, the lightning from its pages: marks.gd)
	if crossed(t0, t1, CHAIN["aim"]):
		peril(m, "chanter:chain", hero.world, {"t": -(float(a["hit"]) - float(CHAIN["aim"])), "dur": 0.8 + float(CHAIN["crackle"]), "dmg": m._roll() * float(a["dmg"]), "el": "lightning"})
		sound(m, "zap", 0.35)


## Where its pages are as it strikes: over the floor, and how high (game pixels).
func pages(m) -> Vector3:
	var at := beside(m.world, m.face, act["hand"] if act != null else 1, float(CAST_FROM[0]) / TILE3, float(CAST_FROM[1]) / TILE3)
	return Vector3(at.x, at.y, float(CAST_FROM[2]) / 2.0)
