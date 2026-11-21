## THE CROSSBOWMEN ON THE WALLS (floor 19, the Keep), as the game fights them (game/act1_rules/xbow.ts; art/keep_crossbowmen_moves.ts,
## keep_crossbowmen_fx.ts; render/act1_fx/xbow.ts). His pick, not the one recommended: “Stand and shoot” ("they plant and hold their
## spot"); then “Yes, that's them (Recommended)”.
##   TURRETS: planted at their posts behind their pavises, they HOLD THEIR SPOT: awake, they never walk; they turn to face him and shoot
##     when he is in their sight and within 11 tiles.
##   THE AIMED SHOT (2.1 s): the crank's two turns, raised to the shoulder; THE RED AIM LINE drawn out across the floor (0.62 to 0.76 s),
##     following him till then, and HELD at full length (the warning) to 41/30 s, steadied at its end; at 43/30 s the bolt down the
##     whole lane (from 0.69 before the pavise out to 12 tiles, cut short at a wall; 0.8 across): whoever is in it struck, x1.4.
##   THE RELOAD after every shot (2.2 s: five turns of the crank, a bolt laid in); no shot again until it is done.
extends "res://scripts/act3/hc.gd"

const SHOT := {"long": 2.1, "crank": 0.16, "line": 0.62, "strike": 1.3666666666666667, "hit": 1.4333333333333333}
const RELOAD := {"long": 2.2, "crank": [0.16, 1.3], "turns": 5}
const LANE := {"from": 0.69, "tiles": 12.0, "wide": 0.8}
const FAR := 11.0
const GAIT := {"pace": 2.0, "cycle": 12.0 / 20.0 / 2.0, "setOff": 0.0, "halt": 0.0, "stopAt": 8.0, "slack": 1.0, "trueBack": true}
const ACTS := [
	{"id": "xbow:shot", "clip": "attack", "long": 2.1, "hit": 1.4333333333333333, "dmg": 1.4, "cooldown": 0.0, "first": 0.6, "after": 0.35, "near": 0.0, "far": 11.0},
	{"id": "xbow:reload", "clip": "reload", "long": 2.2, "hit": 2.2, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 999.0, "forced": true},
]
const SHOT_I := 0
const RELOAD_I := 1


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## How far the lane runs along `f` from `at` before a wall stops it, at most its length.
static func lane_length(m, at: Vector2, f: Vector2) -> float:
	var d: float = LANE["from"]
	while d < float(LANE["tiles"]):
		if not is_open(m, at + f * d):
			break
		d += 0.1
	return minf(float(LANE["tiles"]), d)


## Whether `p` is in a lane from `at` along `f`, `len` long.
static func in_lane(at: Vector2, f: Vector2, len: float, p: Vector2) -> bool:
	var d := p - at
	var fwd := d.dot(f)
	var side := absf(-d.x * f.y + d.y * f.x)
	return fwd >= float(LANE["from"]) - 0.3 and fwd <= len + 0.3 and side <= float(LANE["wide"]) / 2.0 + 0.25


func tick(m, _dt: float, dist: float, hero) -> bool:
	if m.state == "act":
		return false
	# PLANTED: he holds his spot, never walks; turned to the hero; the reload after every shot; a shot when he may
	_to("stand")
	if int(a1.get("reload", 0)) == 1:
		a1["reload"] = 0
		start_act(m, ACTS, RELOAD_I, hero)
		return true
	if dist > 0.01:
		m.face = (hero.world - m.world) / dist
	if m._cd <= 0.0 and dist <= FAR and hero.alive and m.mgr.sees(m.world, hero.world):
		start_act(m, ACTS, SHOT_I, hero)
	return true


func start(m, a: Dictionary, _hero) -> void:
	if str(a["id"]) == "xbow:shot":
		act["a"] = lane_length(m, m.world, m.face)
		peril(m, "xbow:show", m.world, {"dur": 1e9, "act": act})


func end(_m, a: Dictionary, _hero) -> void:
	if str(a["id"]) == "xbow:shot":
		a1["reload"] = 1


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if str(a["id"]) == "xbow:reload":
		# (five turns of the crank, a click each; the bolt laid in)
		var c0: float = RELOAD["crank"][0]
		var c1: float = RELOAD["crank"][1]
		for k in int(RELOAD["turns"]):
			if crossed(t0, t1, c0 + (c1 - c0) * (k + 0.5) / float(RELOAD["turns"])):
				sound(m, "click", 0.25)
		return
	# (the crank's two turns)
	for T in [float(SHOT["crank"]) + 0.09, float(SHOT["crank"]) + 0.27]:
		if crossed(t0, t1, T):
			sound(m, "click", 0.3)
	# (the aim follows him till the line is drawn out; from then it is held)
	if t1 < float(SHOT["line"]):
		var to: Vector2 = hero.world - m.world
		if to.length() > 0.01:
			m.face = to.normalized()
		act["a"] = lane_length(m, m.world, m.face)
	if crossed(t0, t1, SHOT["strike"]):
		sound(m, "shot", 0.7)
	if crossed(t0, t1, a["hit"]) and in_lane(m.world, m.face, float(act["a"]), hero.world) and open_to(hero):
		blow(m, hero, float(a["dmg"]))
