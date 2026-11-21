## THE RUBBLINGS (floor 6), as the game fights them (game/act1_rules/rubbling.ts RULES, RUBBLING; render/act1_fx/rubbling.ts).
## His doc's mob table: "A bite. Fist-sized stone mites that swarm out of rock piles" (tiny: one attack).
##   OUT OF ITS PILE: it lies on the floor as a low pile of chips (the first picture of its rise, list `emerge`) until it is
##     woken; then each waits a moment of its own (up to 0.6 s, by its seed: no draw of the game's dice) and climbs up out of
##     its pile (its rise, 0.7 s), and they swarm.
##   ITS SCUTTLE: two tiles a second, its walk a third of a second round, looping from its stand; it comes as near as 0.6 tiles
##     and sets off again beyond 0.9.
##   THE BITE (within 0.85 tiles; list `attack`, 0.8 s): the top of its heap hinged open on its blazing spark, and its spring
##     forward, snapping shut at 0.42 s 0.408 tiles before where it stood: a hero whose middle is within 0.6 of there is
##     bitten, x1.
extends "res://scripts/act1/act1.gd"

## (RULES.gait)
const GAIT := {"pace": 2.0, "cycle": 1.0 / 3.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.6, "slack": 0.3, "trueBack": false}
## (RUBBLING.bite, RUBBLING.rise)
const BITE := {"ahead": 0.408, "r": 0.6}
const RISE_MOST := 0.6
const ACTS := [
	{"id": "rubbling:bite", "clip": "attack", "long": 0.8, "hit": 0.42, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 0.85},
	{"id": "rubbling:emerge", "clip": "emerge", "long": 0.7, "hit": 0.7, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.1, "near": 0.0, "far": 0.0, "forced": true},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (it lies as a pile of chips until it is woken; its moment, its own)
func spawned(m) -> void:
	a1 = {"pile": 1, "wait": m.own_seed * RISE_MOST}


## (woken, it waits its moment, still a pile)
func tick(_m, dt: float, _dist: float, _hero) -> bool:
	if int(a1.get("pile", 0)) == 0 or float(a1["wait"]) <= 0.0:
		return false
	a1["wait"] = float(a1["wait"]) - dt
	return true


func forced(_m) -> int:
	return 1 if int(a1.get("pile", 0)) == 1 else -1


func start(_m, a: Dictionary, _hero) -> void:
	if a["id"] == "rubbling:emerge":
		a1["pile"] = 0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "rubbling:bite" or not crossed(t0, t1, a["hit"]):
		return
	# (it springs and snaps shut where it has sprung to)
	var r := from_figure(m.world, m.face, 1, hero.world)
	if Vector2(r.x - float(BITE["ahead"]), r.y).length() <= float(BITE["r"]):
		blow(m, hero, a["dmg"])
	sound(m, "hit", 0.25)


## (render/act1_fx/rubbling.ts sprite: until it climbs out, the pile, its rise's first picture)
func shown(m) -> Dictionary:
	if int(a1.get("pile", 0)) == 1 and m.state != "act" and not m.dead and m.art.has("emerge"):
		return {"list": "emerge", "i": 0}
	return {}
