## THE HUSHED TOWNSFOLK (floor 11, and the city's own common mob on every floor of the Hush), as the game fights them (game/
## act1_rules/hushed.ts RULES, HUSHED). His picks to the art chat, 18 Oct 2026: "The Hushed townsfolk (Recommended)"; how they
## fight, "Shuffle, then lunge and grab (Recommended)"; how they go down, "The Hush leaves them (Recommended)".
##   THEIR SHUFFLE: 0.9 tiles a second, stopping at any frame; as near as 0.85 tiles, off again beyond 1.05.
##   THE LUNGE AND GRAB (their one blow, within 1.05 tiles; list `attack`, 1.4 s): all at once they rear up, held trembling (the
##     warning); then a long step in, both hands driven at him and clutching shut at 0.6 s: a hero up to 0.944 tiles (and half his
##     body) before them and 0.55 to either side is struck, x1; heard as a rush of cloth and air, no sound out of their mouths.
##   A CROWD OF THREE LOOKS, the porter, the goodwife and the baker: given by the game as each comes into the world (its form; the
##     floor's monsters.json carries each one's figure).
extends "res://scripts/act1/act1.gd"

## (GAIT)
const GAIT := {"pace": 0.9, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.85, "slack": 0.2, "trueBack": true}
## (ACTS)
const ACTS := [
	{"id": "hushed:grab", "clip": "attack", "long": 1.4, "hit": 18.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 1.05},
]
## (HUSHED.grab)
const GRAB := {"reach": 0.944, "half": 0.55}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "hushed:grab" or not crossed(t0, t1, float(a["hit"])):
		return
	# (their hands clutch shut before them: whoever they close on is caught)
	var r := rel(m, hero)
	if r.x > -0.2 and r.x <= GRAB["reach"] + HERO_R * 0.5 and absf(r.y) <= GRAB["half"]:
		blow(m, hero, float(a["dmg"]))
	# (the lunge's rush of cloth and air: no sound out of their mouths, which make none)
	sound(m, "swing", 0.35)
