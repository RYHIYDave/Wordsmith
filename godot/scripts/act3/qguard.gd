## THE QUEEN'S GUARD (floor 18, the Glass Gallery), as the game fights them (game/act1_rules/qguard.ts; art/queens_guard_moves.ts;
## render/act1_fx/qguard.ts). His pick, “Mirror duellists (Recommended)”, then “Yes, that's them (Recommended)”.
##   THEY GLIDE at 1.2 tiles a second, never charging; farther off than 4 tiles (and nearer than 14), seen, they STEP INTO THE GLASS
##     (0.6 s: gone from 0.35 s, nothing reaching them) and out of another beside him (1.6 tiles off, a quarter turn round from the
##     way he faces), every 6 s at the most.
##   THE DOUBLE SLASH (their basic, 1.7 s, within 2.2): the X before them marked (0.4 to 2 tiles out, 1.8 across); the first blade at
##     29/30 s, the second at 32/30 s, each striking whoever is in the X, x0.6; two bright cuts crossing, out and gone.
##   THE SHARD FAN (every 5 s, the first after 2; 1.75 s, from 3 to 7 tiles): its five ways marked; five slivers of glass thrown in a
##     fan 60 degrees wide, 16 tiles a second out to 8; each strikes the first it meets, x0.5.
extends "res://scripts/act3/hc.gd"

const SLASH := {"warn": [0.48, 0.9], "hit": 0.9666666666666667, "second": 1.0666666666666667, "from": 0.4, "reach": 2.0, "wide": 1.8}
const FAN := {"warn": [0.36, 0.8], "hit": 0.8666666666666667, "count": 5, "spread": 60.0, "range": 8.0, "speed": 16.0, "from": 0.9, "flight": 0.44375, "ways": [-30.0, -15.0, 0.0, 15.0, 30.0]}
const TUNE := {"step": 4.0, "every": 6.0, "beside": 1.6, "shard_hit": 0.55}
## (awayAt: from when in stepping into the glass, and until when in stepping out of it, they are not there)
const AWAY := {"in": 0.35, "out": 0.3}
const GAIT := {"pace": 1.2, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.6, "slack": 0.5, "trueBack": true}
const ACTS := [
	{"id": "qguard:slash", "clip": "attack", "long": 1.7, "hit": 0.9666666666666667, "dmg": 0.6, "cooldown": 0.0, "first": 0.4, "after": 0.5, "near": 0.0, "far": 2.2},
	{"id": "qguard:fan", "clip": "fan", "long": 1.75, "hit": 0.8666666666666667, "dmg": 0.5, "cooldown": 5.0, "first": 2.0, "after": 0.5, "near": 3.0, "far": 7.0},
	{"id": "qguard:stepIn", "clip": "stepIn", "long": 0.6, "hit": 0.3333333333333333, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 999.0, "forced": true},
	{"id": "qguard:stepOut", "clip": "stepOut", "long": 0.6, "hit": 0.3333333333333333, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.2, "near": 0.0, "far": 999.0, "forced": true},
]
const STEP_IN := 2
const STEP_OUT := 3


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## inX: whether `p` is in the X a slash lays from `s`, facing `f`.
static func in_x(s: Vector2, f: Vector2, p: Vector2) -> bool:
	var d := p - s
	var fwd := d.dot(f)
	var side := absf(-d.x * f.y + d.y * f.x)
	return fwd >= float(SLASH["from"]) - 0.3 and fwd <= float(SLASH["reach"]) + 0.3 and side <= float(SLASH["wide"]) / 2.0 + 0.2


## shardAt: where shard `i` of a fan thrown from `s` facing `f` is `t` seconds after it is thrown, or INF once it has flown its range.
static func shard_at(s: Vector2, f: Vector2, i: int, t: float) -> Vector2:
	if t > float(FAN["flight"]):
		return Vector2.INF
	var a := atan2(f.y, f.x) + deg_to_rad(float(FAN["ways"][i]))
	var d := float(FAN["from"]) + float(FAN["speed"]) * maxf(0.0, t)
	return s + Vector2(cos(a), sin(a)) * d


## Where one steps out beside the hero: a quarter turn round from the way he faces, either side, on open floor (INF: nowhere).
static func beside_hero(m) -> Vector2:
	var h = m.mgr.hero
	var hf: Vector2 = h.face if h.face.length() > 0.0001 else Vector2(0.0001, 0.0001)
	var base := atan2(hf.y, hf.x)
	var side := 1 if m.id % 2 == 1 else -1
	for turn in [side * 90, -side * 90, side * 135, -side * 135, 180, side * 45]:
		var a := base + deg_to_rad(float(turn))
		var p: Vector2 = h.world + Vector2(cos(a), sin(a)) * float(TUNE["beside"])
		# (room for its body, and none of the others standing there: they stepped into walls, and three onto one spot; the bug hunt's
		# fifth round, 25 Nov 2026)
		if is_open(m, p) and m.mgr.clear(p.x, p.y, m.r) and not m.mgr.list.any(func(o): return o != m and is_instance_valid(o) and not o.dead and o.world.distance_to(p) < o.r + m.r):
			return p
	return Vector2.INF


func tick(_m, dt: float, _dist: float, _hero) -> bool:
	a1["clock"] = float(a1.get("clock", 0.0)) + dt
	return false


func forced(m) -> int:
	# (out of the glass, at once, once they have gone into it)
	if int(a1.get("out", 0)) == 1:
		return STEP_OUT
	# (farther off than they like, and seen: into the glass, no oftener than every 6 s)
	var h = m.mgr.hero
	var d: float = h.world.distance_to(m.world)
	if d > float(TUNE["step"]) and d < 14.0 and float(a1.get("clock", 0.0)) >= float(a1.get("next", 0.0)) and m.mgr.sees(m.world, h.world) and beside_hero(m) != Vector2.INF:
		return STEP_IN
	return -1


func reachable(_m) -> bool:
	# (through the glass: not here)
	var id := _id()
	if id == "qguard:stepIn":
		return float(act["t"]) < float(AWAY["in"])
	if id == "qguard:stepOut":
		return float(act["t"]) >= float(AWAY["out"])
	return true


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


func start(m, a: Dictionary, _hero) -> void:
	match str(a["id"]):
		"qguard:stepIn":
			sound(m, "shatter", 0.2)
		"qguard:slash":
			warn(m, "qguard:slash", float(SLASH["warn"][0]) - 0.15, SLASH["hit"], [[SLASH["from"], SLASH["reach"], -float(SLASH["wide"]) / 2.0, float(SLASH["wide"]) / 2.0]], [])
		"qguard:fan":
			var half := deg_to_rad(float(FAN["spread"]) / 2.0) + 0.05
			warn(m, "qguard:fan", float(FAN["warn"][0]) - 0.15, FAN["hit"], [], [[-half, half, minf(float(FAN["range"]), 5.0)]])


func end(m, a: Dictionary, hero) -> void:
	match str(a["id"]):
		"qguard:stepIn":
			# (out of another glass beside him, facing him)
			var p := beside_hero(m)
			if p != Vector2.INF:
				m.world = p
			var to: Vector2 = hero.world - m.world
			if to.length() > 0.0:
				m.face = to.normalized()
			a1["out"] = 1
			sound(m, "shatter", 0.25)
		"qguard:stepOut":
			a1["out"] = 0
			a1["next"] = float(a1.get("clock", 0.0)) + float(TUNE["every"])


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match str(a["id"]):
		"qguard:slash":
			# (the two blades, one after the other, each striking whoever is in the X)
			for T in [float(SLASH["hit"]), float(SLASH["second"])]:
				if not crossed(t0, t1, T):
					continue
				sound(m, "swing", 0.6)
				if in_x(m.world, m.face, hero.world) and open_to(hero):
					blow(m, hero, float(a["dmg"]))
				if T == float(SLASH["hit"]):
					peril(m, "qguard:x", m.world, {"dur": 0.6, "hit": 0.0})
		"qguard:fan":
			if crossed(t0, t1, a["hit"]):
				sound(m, "shatter", 0.5)
				peril(m, "qguard:fan", m.world, {"dur": float(FAN["flight"]) + 0.1, "hit": 0.0, "a": 0, "dmg": m._roll() * float(a["dmg"])})
