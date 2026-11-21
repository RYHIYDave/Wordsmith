## THE PLAGUE RATS OF THE UNDERCITY (floor 12, and the city's), as the game fights them (game/act1_rules/rat.ts RULES, RAT).
##   THEIR SCURRY: 2.8 tiles a second, stopping at any quarter second; as near as 1 tile, off again beyond 1.3.
##   THE LEAP AND BITE (their one blow, within 1.45 tiles; list `attack`, 1 s): a crouch, a spring (a scrabble of claws at 0.36),
##     the snap at 0.5 s: whoever's middle is within 0.5 of the way its jaws go, from 0.568 to 1.187 tiles before it, is bitten x1.
##   LOOKING ROUND (list `look`, 1.3 s): one not yet woken rears up on its hind legs to look round now and then (every 4.5 to 8 s, its
##     own by its seed); woken in the middle of it, it finishes its look before it comes.
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 2.8, "cycle": 0.25, "setOff": 0.0, "halt": 0.0, "stopAt": 1.0, "slack": 0.3, "trueBack": true}
const ACTS := [
	{"id": "rat:bite", "clip": "attack", "long": 1.0, "hit": 0.5, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 1.45},
]
## (RAT.bite, RAT.look)
const BITE := {"from": 0.568, "to": 1.187, "r": 0.5}
const LOOK := {"long": 1.3, "every": [4.5, 8.0]}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(_m) -> void:
	a1 = {"look": -1.0, "woke": 0}


## lookPhase: where one not yet woken is in its own round of looking round (seconds into its look).
static func look_phase(m) -> float:
	var every: float = float(LOOK["every"][0]) + (float(LOOK["every"][1]) - float(LOOK["every"][0])) * m.own_seed
	var t: float = m._anim_t + m.own_seed * 11.3
	return t - floorf(t / every) * every


## looking: seconds into its look now, or -1.
func looking(m) -> float:
	if m.state == "act":
		return -1.0
	if m.state == "sleep":
		var p := look_phase(m)
		return p if p < float(LOOK["long"]) else -1.0
	return float(a1.get("look", -1.0))


func tick(m, dt: float, _dist: float, _hero) -> bool:
	# (woken in the middle of looking round: it finishes its look, its head up, before it comes)
	if int(a1.get("woke", 0)) == 0:
		a1["woke"] = 1
		var p := look_phase(m)
		if p < float(LOOK["long"]):
			a1["look"] = p
	if float(a1.get("look", -1.0)) < 0.0:
		return false
	a1["look"] = float(a1["look"]) + dt
	if float(a1["look"]) >= float(LOOK["long"]):
		a1["look"] = -1.0
		return false
	return true


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "rat:bite":
		return
	# (the spring: a scrabble of claws)
	if crossed(t0, t1, 0.36):
		sound(m, "swing", 0.2)
	if not crossed(t0, t1, float(a["hit"])):
		return
	# THE SNAP: whoever is where its jaws have gone, from its crouch to its snap
	var r := from_figure(m.world, m.face, 1, hero.world)
	var along := clampf(r.x, BITE["from"], BITE["to"])
	if Vector2(r.x - along, r.y).length() <= float(BITE["r"]):
		blow(m, hero, float(a["dmg"]))
	sound(m, "hit", 0.25)


## render/act1_fx/rat.ts sprite: looking round, its look's picture.
func shown(m) -> Dictionary:
	var t := looking(m)
	if t < 0.0 or not m.art.has("look"):
		return {}
	return {"list": "look", "i": floori(t * m.art.fps("look") + 1e-6)}
