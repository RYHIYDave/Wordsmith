## THE DUST DEVILS (floor 8), as the game fights them with their twister, as the game starts (game/act1_rules/devil.ts RULES,
## DEVIL, TWISTER; art/action_f6_canyon.ts TW, TW_HIT, TW_BOLTS; DEVIL_TWISTER on: game/enemy_moves.ts; render/act1_fx/devil.ts).
## His doc's table: "Small whirlwinds that spin into you, knock you about, then scatter."
##   IT WEAVES AS IT COMES: 2.4 tiles a second, a swerve of 0.22 tiles to either side of its way and back every 1.6 s. It has
##     no feet: within 2.2 tiles of a hero in its sight it stops where it is.
##   ITS TWISTER (its one attack, within 2.6 tiles; list `attack`, 5.2 s; every 3 s): it spins up and holds; in two frames at
##     0.867 s it bursts up into a sand twister taller than the knight, and till 4.4 s it wanders at him at 1.4 tiles a second,
##     DRAGGING him toward its foot within 2.6 tiles at 1.6 tiles a second (not while he is in the air of his lunge), SCOURING
##     him within 0.8 of its foot every 0.3 s (x0.35), and THROWING LIGHTNING onto the floor round its foot at the places its
##     pictures have them, each crackling 0.3 s first: a hero within 0.6 of one as it strikes is struck, x1. Then it collapses
##     back into the dust devil. Under it, the sand swirling in over the floor as far as it drags (devil:twister).
##   THEN IT SCATTERS: off away from him for 0.6 to 1.0 s, up to 0.9 radians off straight away, weaving, before it comes back.
extends "res://scripts/act1/act1.gd"

## (RULES.gait: the pace its weave is painted for, DD_PACE)
const GAIT := {"pace": 2.4, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.1, "slack": 0.3, "trueBack": true}
const ACTS := [
	{"id": "devil:twister", "clip": "attack", "long": 5.2, "hit": 26.0 / 30.0, "dmg": 1.0, "cooldown": 3.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 2.6},
]
## (TW; TWISTER: it begins it from `near` tiles off; its scouring's share of its blow)
const TW := {"until": 4.4, "pace": 1.4, "pull": 2.6, "drag": 1.6, "r": 0.8, "tick": 0.3, "bolt": 0.6}
const TWISTER := {"near": 2.2, "scour": 0.35}
## (TW_BOLTS: when each bolt strikes (seconds into the twister), the way from its foot (radians, on the floor) and how far
## (tiles): the art's own, worked out there and copied here)
const BOLTS := [
	[1.1166666666666667, 4.878659642545164, 1.2757369427010417], [1.5666666666666667, 2.98147058198851, 1.3865982764866203],
	[2.0166666666666666, 2.2512511138052, 1.9016633355524393], [2.466666666666667, 1.823571263108466, 1.2831775793340057],
	[2.916666666666667, 1.072766240768482, 1.6756196355447175], [3.366666666666667, 2.886292138430013, 1.9991832306142898],
	[3.8166666666666673, 2.539756523670697, 1.2423022327013313],
]
## (DEVIL.weave, DEVIL.scatter)
const WEAVE := {"wide": 0.22, "period": 1.6}
const SCATTER := {"secs": [0.6, 1.0], "turn": 0.9}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `go` seconds of scattering still to go, the way it scatters (`sx`, `sy`); `w` its weave's clock)
func spawned(m) -> void:
	a1 = {"go": 0.0, "sx": 0.0, "sy": 0.0, "w": m.own_seed * float(WEAVE["period"]), "scour": 0.0}


func tick(m, dt: float, dist: float, hero) -> bool:
	if m.state == "act":
		return false
	var sp: float = m.speed * m.slow()
	if float(a1["go"]) > 0.0:
		# SCATTERING: off away from him at its pace, its weave playing on
		a1["go"] = float(a1["go"]) - dt
		if mode != "walk":
			_to("walk")
		m.face = Vector2(a1["sx"], a1["sy"])
		slide(m, m.face * sp * dt)
		gt += dt * sp / float(GAIT["pace"])
		return true
	if mode == "walk" and dist <= float(TWISTER["near"]) and m.mgr.sees(m.world, hero.world):
		# (it has no feet: in its reach it stops where it is, not where its weave comes round, as a walker's must)
		_to("stand")
		return false
	if mode == "walk":
		# ITS WEAVE: a swerve to one side of its way and the other as it comes (the step carries it on along its way)
		a1["w"] = float(a1["w"]) + dt
		var side := (TAU * float(WEAVE["wide"]) / float(WEAVE["period"])) * cos(TAU * float(a1["w"]) / float(WEAVE["period"]))
		slide(m, Vector2(m.face.y * side * dt, -m.face.x * side * dt))
	return false


func start(m, _a: Dictionary, _hero) -> void:
	# (the sand swirling in under it, and its lightning on the floor: marks.gd)
	peril(m, "devil:twister", m.world, {"dur": 1e9})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if crossed(t0, t1, 0.3):
		sound(m, "gust", 0.6)
	if crossed(t0, t1, a["hit"]):
		sound(m, "thunder", 0.4)
		hero.kick(2.0)
	var from := maxf(t0, a["hit"])
	var to := minf(t1, TW["until"])
	if to <= from:
		return
	var dt := to - from
	var h: Vector2 = hero.world
	var lunging: bool = hero._act == "lunge"
	# (it wanders at him, the game carrying it)
	var d: Vector2 = h - m.world
	if d.length() > 0.3:
		m.face = d.normalized()
		slide(m, m.face * float(TW["pace"]) * dt)
	# (it drags him in, as long as he is within its pull and not evading)
	var d2: float = hero.world.distance_to(m.world)
	if d2 <= float(TW["pull"]) and d2 > 0.25 and not lunging and hero.alive:
		hero._slide((m.world - hero.world) / d2 * float(TW["drag"]) * dt)
	# (it scours him at its foot)
	a1["scour"] = float(a1["scour"]) - dt
	if d2 <= float(TW["r"]) and float(a1["scour"]) <= 0.0 and not lunging:
		a1["scour"] = TW["tick"]
		blow(m, hero, float(a["dmg"]) * float(TWISTER["scour"]))
	# (its lightning, round its foot as its pictures throw it)
	for b in BOLTS:
		if not crossed(t0, t1, b[0]):
			continue
		var at: Vector2 = m.world + Vector2(cos(b[1]), sin(b[1])) * float(b[2])
		if hero.world.distance_to(at) <= float(TW["bolt"]) and not lunging:
			blow(m, hero, a["dmg"])
		sound(m, "zap", 0.3)


## THEN IT SCATTERS: off away from him, a little to one side (its weave, from its twister's last pose, which is its stand's)
func end(m, _a: Dictionary, hero) -> void:
	var d: Vector2 = m.world - hero.world
	var ang := atan2(d.y, d.x) + randf_range(-float(SCATTER["turn"]), float(SCATTER["turn"]))
	a1["sx"] = cos(ang)
	a1["sy"] = sin(ang)
	a1["go"] = randf_range(SCATTER["secs"][0], SCATTER["secs"][1])
	_to("walk")
