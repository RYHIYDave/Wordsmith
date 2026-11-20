## THE DREDGERS OF THE UNDERCITY (floor 12), as the game fights them (game/act1_rules/dredger.ts RULES, DREDGER).
##   THEIR WADE: 0.85 tiles a second, stopping only as their walk comes round (1.5 s); 1.9 tiles off, and 0.5 nearer.
##   THE HOOK AND HAUL (their basic, within 2.5 tiles; list `attack`, 2 s): the pole thrust out at 0.733 s: whoever is before them
##     from 0.6 to 2.75 tiles, 0.55 to either side, is struck x1; one struck 1.4 tiles out or more is CAUGHT on the hook ("Hooked"):
##     it bites at 0.993 s, and he is hauled in with it as it comes in (never nearer them than 1.1), held, to 1.393 s; the floor
##     scraped where he is dragged.
##   THE CAST NET (from 2 to 3.8 tiles; every 7 s, the first 2 s in; list `net`, 2.5 s): where it will fall marked from 0.6 s
##     (3 tiles before them, 0.85 round); let go of at 1.267 s, it flies 0.5 s and falls spread: whoever is under it is struck x1.2
##     and NETTED, held 1 s; it lies 1.6 s (dredger:net).
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 0.85, "cycle": 1.5, "setOff": 0.0, "halt": 0.0, "stopAt": 1.9, "slack": 0.5, "trueBack": true}
const ACTS := [
	{"id": "dredger:hook", "clip": "attack", "long": 2.0, "hit": 22.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.0, "near": 0.0, "far": 2.5},
	{"id": "dredger:net", "clip": "net", "long": 2.5, "hit": 38.0 / 30.0, "dmg": 1.2, "cooldown": 7.0, "first": 2.0, "after": 0.8, "near": 2.0, "far": 3.8},
]
## (DREDGER.haul, hook, strike, net)
const HAUL := {"hit": 22.0 / 30.0, "bite": 22.0 / 30.0 + 0.26, "haul": 22.0 / 30.0 + 0.52, "held": 22.0 / 30.0 + 0.52 + 0.14}
const HOOK := [[22.0 / 30.0, 2.279], [0.85, 2.447], [22.0 / 30.0 + 0.26, 2.44], [1.1, 2.119], [1.2, 1.637], [22.0 / 30.0 + 0.52, 1.535]]
const STRIKE := {"from": 0.6, "reach": 2.75, "half": 0.55, "catchFrom": 1.4, "least": 1.1}
const NET := {"long": 2.5, "warn": [0.6, 1.12], "hit": 38.0 / 30.0, "from": [0.76, 0.41, 12.4], "flies": 0.5, "reach": 3.0, "r": 0.85, "hold": 1.0, "lies": 1.6}
const CAUGHT := Color("#ff8a80")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## hookAt: where the hook is (tiles before them) `t` seconds into the hook and haul, from the thrust on.
static func hook_at(t: float) -> float:
	if t <= float(HOOK[0][0]):
		return HOOK[0][1]
	for i in range(1, HOOK.size()):
		if t <= float(HOOK[i][0]):
			var t0: float = HOOK[i - 1][0]
			var t1: float = HOOK[i][0]
			return float(HOOK[i - 1][1]) + (float(HOOK[i][1]) - float(HOOK[i - 1][1])) * (t - t0) / maxf(1e-9, t1 - t0)
	return HOOK[HOOK.size() - 1][1]


## netFalls: where the cast net falls, from one facing: its middle, 3 tiles before them.
static func net_falls(m) -> Vector2:
	return m.world + m.face * float(NET["reach"])


func spawned(_m) -> void:
	a1 = {"hooked": 0, "ox": 0.0, "oy": 0.0}


func _let_go(hero) -> void:
	if int(a1.get("hooked", 0)) == 0:
		return
	a1["hooked"] = 0
	hero.held = 0.0


func start(m, a: Dictionary, _hero) -> void:
	a1["hooked"] = 0
	if a["id"] == "dredger:net":
		# (where it will fall marked through its warning: render/act1_fx/dredger.ts ground, the dredger making its net)
		var at := net_falls(m)
		peril(m, "dredger:aim", at, {"t": 0.0, "hit": NET["hit"], "dur": NET["hit"]})


func end(_m, _a: Dictionary, hero) -> void:
	_let_go(hero)


func died(m) -> void:
	if m.mgr.hero != null:
		_let_go(m.mgr.hero)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] == "dredger:net":
		# THE CAST NET: let go of at its blow, it flies to where it falls
		if crossed(t0, t1, float(NET["warn"][0])):
			sound(m, "swing", 0.35)
		if not crossed(t0, t1, float(NET["hit"])):
			return
		var hand: int = act["hand"]
		var F: Array = NET["from"]
		var o := Vector2(m.world.x + m.face.x * F[0] + m.face.y * hand * F[1], m.world.y + m.face.y * F[0] - m.face.x * hand * F[1])
		peril(m, "dredger:net", net_falls(m), {"hit": NET["flies"], "dur": float(NET["flies"]) + float(NET["lies"]), "dmg": m._roll() * float(a["dmg"]), "a": o.x, "b": o.y, "c": F[2]})
		sound(m, "swing", 0.6)
		return
	if a["id"] != "dredger:hook":
		return
	if crossed(t0, t1, float(HAUL["hit"]) - 0.08):
		sound(m, "swing", 0.6)
	if crossed(t0, t1, float(a["hit"])):
		# THE THRUST: whoever is before them along the pole is struck; one out where the hook is, caught on it
		var r := rel(m, hero)
		if r.x >= float(STRIKE["from"]) and r.x <= float(STRIKE["reach"]) and absf(r.y) <= float(STRIKE["half"]) and open_to(hero):
			var was: float = hero.life
			blow(m, hero, float(a["dmg"]))
			if r.x >= float(STRIKE["catchFrom"]) and hero.life < was:
				a1["hooked"] = 1
				a1["ox"] = hero.world.x
				a1["oy"] = hero.world.y
				hero.held = float(HAUL["held"]) - t1 + 0.05
				word(m, hero, "Hooked", CAUGHT)
				# (the floor scraped where he is dragged: render/act1_fx/dredger.ts ground)
				peril(m, "dredger:haul", hero.world, {"dur": float(HAUL["held"]) - t1 + 0.05})
		hero.kick(1.0)
	if crossed(t0, t1, float(HAUL["bite"])):
		sound(m, "hit", 0.35)
	if int(a1.get("hooked", 0)) == 0:
		return
	if not hero.alive:
		_let_go(hero)
		return
	# THE HAUL: from the bite he is drawn in with the hook, as far as the hook comes in (never nearer them than `least`)
	if t1 > float(HAUL["bite"]):
		var step := hook_at(maxf(t0, HAUL["bite"])) - hook_at(minf(t1, HAUL["held"]))
		var r := rel(m, hero)
		var room := maxf(0.0, r.x - float(STRIKE["least"]))
		var pull := minf(maxf(0.0, step), room)
		if pull > 0.0:
			hero._slide(-m.face * pull)
	hero.held = maxf(hero.held, 0.05)
	if t1 >= float(HAUL["held"]):
		_let_go(hero)
