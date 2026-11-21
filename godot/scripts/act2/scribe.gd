## THE SILENT ORDER'S SCRIBES (floor 11, and the city's own), as the game fights them (game/act1_rules/scribe.ts RULES, SCRIBE,
## poolAt; render/act1_fx/scribe.ts; art/scribe_shots.ts). His picks to the art chat, 18 Oct 2026: "... Silent Order scribes".
##   THEIR GLIDE: a tile a second, stopping at any frame; they stand off, as near as 4.5 tiles, off again beyond 5.5.
##   THEY KEEP THEIR DISTANCE: a hero who comes within 2.2 of one in its sight is backed away from, gliding, for 1.2 s at the most
##     (not where the floor holds it); then it stands its ground 2.5 s before it backs away again.
##   THE INK FLICK (their one blow, up to 6.5 tiles; list `attack`, 1.36 s): from 0.16 s a pink ring closes on the spot the ink will
##     land on (where the hero stands, no further than 6.5, followed until 0.5 s and then held: scribe:mark); the ink leaves the nib
##     at 19/30 s (0.622 tiles before it, 0.275 to its right, 19.08 game pixels up) and is 0.36 s in the air (scribe:ink); landing,
##     it strikes whoever is within 0.77 of the spot, x1; and lies there as a pool 2.4 s, spread in 0.12 s and drying from 55% of
##     its while to 55% of its size: whoever stands in it is slowed 35% while he does and 0.3 s after (no harm). Stopped before the
##     flick, the ring goes.
extends "res://scripts/act1/act1.gd"

## (GAIT)
const GAIT := {"pace": 1.0, "cycle": 1.0 / 10.0, "setOff": 0.0, "halt": 0.0, "stopAt": 4.5, "slack": 1.0, "trueBack": true}
## (ACTS)
const ACTS := [
	{"id": "scribe:flick", "clip": "attack", "long": 1.36, "hit": 19.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.3, "near": 0.0, "far": 6.5},
]
## (SCRIBE)
const FLICK := {"mark": 0.16, "lock": 0.5, "most": 6.5, "from": [0.622, -0.275, 19.08], "flight": 0.36, "arc": 26.0}
const SPLASH_R := 0.62 + 0.3 * 0.5
const POOL := {"r": 0.62, "last": 2.4, "spread": 0.12, "dries": 0.55, "least": 0.55, "slow": 0.35, "linger": 0.3}
const KEEP := {"near": 2.2, "most": 1.2, "rest": 2.5}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## poolAt: how wide (its half-width) a pool of ink is `t` seconds after it landed, as its picture is: 0 before and after.
static func pool_at(t: float) -> float:
	if t < 0.0 or t >= POOL["last"]:
		return 0.0
	var grow := minf(1.0, t / float(POOL["spread"]))
	var last: float = POOL["last"]
	var dry := 1.0 if t < last * float(POOL["dries"]) else 1.0 - (t - last * float(POOL["dries"])) / (last * (1.0 - float(POOL["dries"])))
	return float(POOL["r"]) * grow * (float(POOL["least"]) + (1.0 - float(POOL["least"])) * dry)


## aimed: the spot the ink is aimed at now: where the hero is, no further than it throws.
static func aimed(m, hero) -> Vector2:
	var d: Vector2 = hero.world - m.world
	var n := d.length()
	return m.world + d * (float(FLICK["most"]) / n if n > float(FLICK["most"]) else 1.0)


func tick(m, dt: float, dist: float, hero) -> bool:
	if m.state == "act" or act != null:
		return false
	if not a1.has("back"):
		a1 = {"back": 0.0, "rest": 0.0}
	a1["rest"] = maxf(0.0, float(a1["rest"]) - dt)
	if not hero.alive or float(a1["rest"]) > 0.0 or dist >= KEEP["near"] or dist < 0.01 or not m.mgr.sees(m.world, hero.world):
		return _done()
	a1["back"] = float(a1["back"]) + dt
	if float(a1["back"]) > KEEP["most"]:
		return _done()
	# BACK AWAY FROM HIM, gliding
	var v: Vector2 = (m.world - hero.world) / dist
	var sp: float = m.speed * m.slow()
	var was: Vector2 = m.world
	slide(m, v * sp * dt)
	var moved: float = m.world.distance_to(was)
	# (the floor holds it: it stands its ground)
	if moved < sp * dt * 0.3:
		a1["back"] = maxf(float(a1["back"]), dt)
		return _done()
	m.face = v
	m.state = "chase"
	if mode != "walk":
		_to("walk")
	gt += moved / float(GAIT["pace"])
	return true


## (backed off far enough, or for long enough: it stands its ground a while, at once, as its glide may stop at any frame)
func _done() -> bool:
	if float(a1.get("back", 0.0)) > 0.0:
		a1["rest"] = KEEP["rest"]
		if mode == "walk":
			_to("stand")
	a1["back"] = 0.0
	return false


func start(m, a: Dictionary, hero) -> void:
	if a["id"] != "scribe:flick":
		return
	var s := aimed(m, hero)
	act["x"] = s.x
	act["y"] = s.y
	# (the ring where it will land: laid now, shown from as the quill is dipped: render/act1_fx/scribe.ts ground with the monster)
	act["mark"] = peril(m, "scribe:mark", s, {"hit": float(a["hit"]), "dur": float(a["hit"])})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "scribe:flick":
		return
	var mark: Dictionary = act.get("mark", {})
	# (the spot follows him through the warning, and is held after it)
	if t0 < FLICK["lock"]:
		var s := aimed(m, hero)
		act["x"] = s.x
		act["y"] = s.y
		if not mark.is_empty():
			mark["x"] = s.x
			mark["y"] = s.y
	if not crossed(t0, t1, float(a["hit"])):
		return
	# (flicked: the ink leaves the nib for the spot)
	var f: Array = FLICK["from"]
	var o := beside(m.world, m.face, act["hand"], f[0], f[1])
	peril(m, "scribe:ink", Vector2(act["x"], act["y"]), {"hit": FLICK["flight"], "dur": float(FLICK["flight"]) + float(POOL["last"]), "dmg": m._roll() * float(a["dmg"]), "a": o.x, "b": o.y, "c": f[2]})
	sound(m, "swing", 0.3)
