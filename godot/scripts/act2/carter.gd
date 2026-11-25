## THE CARTERS OF THE MILLRACE (floor 13), as the game fights them (game/act1_rules/carter.ts RULES, CARTER).
##   THEIR TRUDGE: 0.85 tiles a second, stopping at any frame; they stand off at the lash's length, 2 tiles, and 0.4 nearer.
##   THE LASH (their basic, within 2.64 tiles; list `attack`, 1.9 s): it cracks at 0.833 s and rolls on out to its whole length by
##     0.9 s: whoever is in its line, from 0.2 behind them out to where its end has come and 0.5 either side, struck x1, once; one
##     struck 1.5 tiles out or further is coiled round by its end ("Lashed") and dragged in as it is drawn back (1.15 to 1.75 s), 1.3
##     tiles at most, no nearer than 1.1; the floor scraped where he is dragged.
##   THE DRIVER'S LASH (from 0.8 to 2.8 tiles; every 7 s, the first 2 s in; list `lashes`, 3.05 s): three rings marked in a line before
##     them from 0.36 s, where the three cracks will fall (1.29, 1.93 and 2.5 tiles before them, a little to their right); the cracks at
##     1.1, 1.5 and 1.9 s, the cracker on the floor a frame after each: whoever is within 0.35 of one as it strikes struck x1.2.
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 0.85, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.0, "slack": 0.4, "trueBack": true}
const LASH := {"hit": 25.0 / 30.0, "full": 0.9, "crack": [1.787, -0.358], "out": [2.641, -0.269], "from": -0.2, "half": 0.5}
const WRAP := {"from": 1.5, "draw": [1.15, 1.75], "drag": 1.3, "near": 1.1}
const LASHES := {"long": 3.05, "warn": [0.36, 0.94], "cracks": [33.0 / 30.0, 45.0 / 30.0, 57.0 / 30.0], "floor": 1.0 / 30.0, "reach": [1.29, 1.93, 2.5], "right": 0.09, "r": 0.35, "mark": 0.8}
const ACTS := [
	{"id": "carter:lash", "clip": "attack", "long": 1.9, "hit": 25.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.9, "near": 0.0, "far": 2.641},
	{"id": "carter:lashes", "clip": "lashes", "long": 3.05, "hit": 33.0 / 30.0, "dmg": 1.2, "cooldown": 7.0, "first": 2.0, "after": 0.8, "near": 0.8, "far": 2.8},
]
const CAUGHT := Color("#ff8a80")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## crackSpot: where the driver's lash's `i`th crack strikes the floor, from one facing drawn with `hand`.
static func crack_spot(m, hand: int, i: int) -> Vector2:
	var r: float = LASHES["reach"][i]
	var right: float = LASHES["right"]
	return Vector2(m.world.x + m.face.x * r + m.face.y * hand * -right, m.world.y + m.face.y * r - m.face.x * hand * -right)


## lashReach: how far out the lash's end is `t` seconds into the crack.
static func lash_reach(t: float) -> Vector2:
	var k := clampf((t - float(LASH["hit"])) / (float(LASH["full"]) - float(LASH["hit"])), 0.0, 1.0)
	return Vector2(float(LASH["crack"][0]) + (float(LASH["out"][0]) - float(LASH["crack"][0])) * k, float(LASH["crack"][1]) + (float(LASH["out"][1]) - float(LASH["crack"][1])) * k)


func spawned(_m) -> void:
	a1 = {"grab": 0, "ox": 0.0, "oy": 0.0}


func start(m, a: Dictionary, _hero) -> void:
	a1["grab"] = 0
	if a["id"] == "carter:lashes":
		# (its three rings marked where the cracks will fall: act2/marks13.gd carter:warn)
		peril(m, "carter:warn", m.world, {"dur": float(LASHES["cracks"][2]) + float(LASHES["floor"])})



## (broken off: what its end puts right, put right: act1.gd broken)
func broken(m, a: Dictionary, hero) -> void:
	end(m, a, hero)

func end(_m, _a: Dictionary, hero) -> void:
	if int(a1.get("grab", 0)) != 0:
		a1["grab"] = 0
		hero.held = 0.0


func died(m) -> void:
	if int(a1.get("grab", 0)) != 0 and m.mgr.hero != null:
		m.mgr.hero.held = 0.0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "carter:lashes":
		# THE DRIVER'S LASH: each crack, as the cracker strikes the floor, strikes whoever is on it (each crack once)
		if crossed(t0, t1, float(LASHES["warn"][0])):
			sound(m, "swing", 0.5)
		for i in 3:
			if not crossed(t0, t1, float(LASHES["cracks"][i]) + float(LASHES["floor"])):
				continue
			var s := crack_spot(m, act["hand"], i)
			var b := int(act.get("b", 0))
			if (b & (1 << i)) == 0 and hero.world.distance_to(s) <= float(LASHES["r"]) + HERO_R * 0.5 and open_to(hero):
				act["b"] = b | (1 << i)
				blow(m, hero, float(a["dmg"]))
			peril(m, "carter:crack", s, {"dur": LASHES["mark"]})
			hero.kick(1.0)
			sound(m, "hit", 0.5)
		return
	if a["id"] != "carter:lash":
		return
	if crossed(t0, t1, 0.6):
		sound(m, "swing", 0.55)
	# THE CRACK, and the lash rolling on out to its whole length: what is in its line as far as its end has come is struck, once
	if int(act.get("b", 0)) == 0 and t1 >= float(LASH["hit"]) and t0 < float(LASH["full"]) + 1e-6:
		var end := lash_reach(minf(t1, LASH["full"]))
		var r := rel(m, hero)
		if r.x >= float(LASH["from"]) and r.x <= end.x + HERO_R * 0.5 and absf(r.y - end.y) <= float(LASH["half"]):
			act["b"] = 1
			blow(m, hero, float(a["dmg"]))
			# (caught by its end: coiled round)
			if r.x >= float(WRAP["from"]) and open_to(hero):
				a1["grab"] = 1
				a1["ox"] = hero.world.x
				a1["oy"] = hero.world.y
				hero.held = float(WRAP["draw"][1]) - t1 + 0.05
				word(m, hero, "Lashed", CAUGHT)
				peril(m, "carter:drag", hero.world, {"dur": float(WRAP["draw"][1]) - t1 + 0.05})
	if crossed(t0, t1, float(LASH["hit"])):
		sound(m, "hit", 0.5)
	# THE DRAG, as the lash is drawn back: in toward the carter, no nearer than its own length's start
	if int(a1.get("grab", 0)) != 0 and t1 > float(WRAP["draw"][0]):
		if not hero.alive:
			a1["grab"] = 0
			return
		var to: Vector2 = m.world - hero.world
		var d := maxf(to.length(), 1e-6)
		var share := (minf(t1, WRAP["draw"][1]) - maxf(t0, WRAP["draw"][0])) / (float(WRAP["draw"][1]) - float(WRAP["draw"][0]))
		var step := maxf(0.0, minf(float(WRAP["drag"]) * share, d - float(WRAP["near"])))
		if step > 0.0:
			hero._slide(to / d * step)
		hero.held = maxf(hero.held, 0.05)
		if t1 >= float(WRAP["draw"][1]):
			a1["grab"] = 0
			hero.held = 0.0
