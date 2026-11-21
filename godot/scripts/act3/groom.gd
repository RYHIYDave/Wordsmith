## THE HUSHED GROOMS (floor 16, the Swan Gardens), as the game fights them with its new moves on (game/act1_rules/groom.ts
## WHISTLER, lineRun, horseOn; art/action_f16_groom.ts LOOSE, WHISTLE_HIT; render/act1_fx/groom.ts). His pick of 31 Oct 2026: LOOSE
## THE HORSE.
##   THE RUSH: as the gardeners' (1.6 tiles a second); he stops 3.4 tiles off.
##   THE WHISTLE (from 1.5 to 7 tiles off; 2.1 s, every 5 s, the first after 0.5): at 0.3 s THE LINE is marked from behind him at his
##     left (2.6 back, 1.3 to his left) through where the hero stands then, on to the first wall or hedge, 14 tiles at most; at
##     25/30 s THE HORSE bursts out of the mist at its start and gallops down it at 11 tiles a second, going into the mist at its end:
##     a hero on its line (0.95 to either side) within 0.9 of its middle is struck once, x1.1, and knocked aside (act3/marks16.gd).
extends "res://scripts/act3/hc.gd"

const GAIT := {"pace": 1.6, "cycle": 1.0 / 3.0, "setOff": 0.0, "halt": 0.0, "stopAt": 3.4, "slack": 0.3, "trueBack": true}
const LOOSE := {"aim": 0.3, "long": 2.1, "from": Vector2(-2.6, 1.3), "lane": 14.0, "pace": 11.0, "near": 1.5, "far": 7.0}
const WHISTLE_HIT := 25.0 / 30.0
const ACTS := [
	{"id": "groom:whistle", "clip": "attack", "long": 2.1, "hit": 25.0 / 30.0, "dmg": 1.1, "cooldown": 5.0, "first": 0.5, "after": 0.7, "near": 1.5, "far": 7.0},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## lineRun: how long its line runs from (x, y) along `d`, through the point `to` tiles along it: on past there to the first wall or
## hedge, or its whole length.
static func line_run(m, at: Vector2, d: Vector2, to: float) -> float:
	var map = m.mgr.map
	var k := maxf(0.0, to)
	while k < float(LOOSE["lane"]):
		var p := at + d * k
		var tx := floori(p.x)
		var ty := floori(p.y)
		if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h or map.walk[ty * map.w + tx] != 1:
			return maxf(to + 1.0, k)
		k += 0.2
	return LOOSE["lane"]


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if crossed(t0, t1, float(LOOSE["aim"])):
		# THE LINE marked: from behind him at his left, through where the hero stands now
		var f: Vector2 = LOOSE["from"]
		var s := beside(m.world, m.face, act["hand"], f.x, f.y)
		var to: Vector2 = hero.world - s
		var d := maxf(to.length(), 1e-6)
		var u := to / d
		var long := line_run(m, s, u, d)
		var q := peril(m, "groom:horse", s, {"t": -(WHISTLE_HIT - float(LOOSE["aim"])), "dur": WHISTLE_HIT - float(LOOSE["aim"]) + long / float(LOOSE["pace"]) + 1.0,
			"dmg": m._roll() * float(a["dmg"]), "a": long, "d": 0.0})
		q["fx"] = u.x
		q["fy"] = u.y
		sound(m, "gust", 0.5)
	if crossed(t0, t1, WHISTLE_HIT):
		sound(m, "swing", 0.5)
