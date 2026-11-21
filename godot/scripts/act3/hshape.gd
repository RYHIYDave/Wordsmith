## THE HUSH IN ITS OWN SHAPES (floor 20, the Quiet Tower), as the game fights them (game/act1_rules/hshape.ts; art/hush_shapes.ts,
## hush_shapes_moves.ts; render/act1_fx/hshape.ts). His pick for how they move, “Drifting, then darting (Recommended)”, and “Yes,
## that's them (Recommended)”; their rhythm after, the art chat's, brought in at his word of 2 Nov 2026, “All of it in this one”.
##   FAR OFF, THEY DRIFT in at a tile and a half a second; they come in swarms.
##   THEY CIRCLE HIM: within 6.5 tiles of him and in sight, each goes ROUND HIM ON A RING, facing him, a floor's swarm all the same way
##     round, its ring closing at 0.8 tiles a second down to the near ring (2.5 tiles), faster as it closes (3 to 6.5 tiles a second);
##     the slow glide outside 3.75 tiles, the fast one inside.
##   THE SWOOP, one at a time (none within 1.3 s of the last), from the near ring after a while on it: carried round him and in so that
##     its last turn ends square before him; the round its arms will shut on marked; its grip: whoever is in the round (1.15 tiles,
##     1.5 before it) struck, HELD a moment and HUSHED (his words dark, 3 s); it swirls off round him again, its ring growing out.
##   ONE NOT CIRCLING (too close in, or with no room to go round) GRIPS as before (1.7 s).
## Its coils round him and its warnings: act3/marks20.gd.
extends "res://scripts/act3/hc.gd"

const GRIP := {"at": 1.5, "r": 1.15, "hush": 3.0, "hold": 1.13 - 0.7333333333333333, "slow": 0.95}
const CIRCLE := {"from": 6.5, "least": 1.8, "slow_pace": 3.0, "slow_ring": 5.0, "fast_pace": 6.5, "fast_ring": 2.5, "closing": 0.8, "switchAt": 3.75, "grip": 1.5}
const SWOOP := {"wait": [0.6, 1.8], "gap": 1.3, "grow": 1.2, "out": 4.6, "turn": 0.36, "off": 1.27, "warn": 0.36, "hit": 0.7333333333333333}
const GRIP_WARN := 0.33 - 0.15
## (how far round him its swoop's last turn carries it, radians: hshape.ts SWOOP_TURN)
const SWOOP_TURN := 0.8702659090002607
const GLIDE_LONG := 12.0 / 10.0
const GAIT := {"pace": 1.5, "cycle": 12.0 / 10.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.9, "slack": 0.5, "trueBack": true}
const ACTS := [
	{"id": "hshape:grip", "clip": "attack", "long": 1.7, "hit": 0.7333333333333333, "dmg": 1.0, "cooldown": 0.0, "first": 0.4, "after": 0.4, "near": 0.0, "far": 1.5 + 1.15 - 0.2},
	{"id": "hshape:glideL", "clip": "circleLeft", "long": GLIDE_LONG * 60.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": {"at": 0.0, "span": GLIDE_LONG, "extra": GLIDE_LONG * 59.0}},
	{"id": "hshape:glideR", "clip": "circleRight", "long": GLIDE_LONG * 60.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": {"at": 0.0, "span": GLIDE_LONG, "extra": GLIDE_LONG * 59.0}},
	{"id": "hshape:glideLF", "clip": "circleLeftFast", "long": GLIDE_LONG * 60.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": {"at": 0.0, "span": GLIDE_LONG, "extra": GLIDE_LONG * 59.0}},
	{"id": "hshape:glideRF", "clip": "circleRightFast", "long": GLIDE_LONG * 60.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": {"at": 0.0, "span": GLIDE_LONG, "extra": GLIDE_LONG * 59.0}},
	{"id": "hshape:swoopL", "clip": "swoopLeft", "long": 1.7, "hit": 0.7333333333333333, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "hshape:swoopR", "clip": "swoopRight", "long": 1.7, "hit": 0.7333333333333333, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
]
const IDS := ["hshape:grip", "hshape:glideL", "hshape:glideR", "hshape:glideLF", "hshape:glideRF", "hshape:swoopL", "hshape:swoopR"]

## (each floor's way round, by its monsters' keeper; and when its last swoop began, by the perils' clock)
static var swirls := {}
static var last_swoop := {}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


static func is_glide(id: String) -> bool:
	return id.begins_with("hshape:glide")


static func is_swoop(id: String) -> bool:
	return id.begins_with("hshape:swoop")


## circlePace: its pace round him on a ring `r` tiles out: faster as it closes.
static func circle_pace(r: float) -> float:
	var k := clampf((float(CIRCLE["slow_ring"]) - r) / (float(CIRCLE["slow_ring"]) - float(CIRCLE["fast_ring"])), 0.0, 1.0)
	return float(CIRCLE["slow_pace"]) + (float(CIRCLE["fast_pace"]) - float(CIRCLE["slow_pace"])) * k


## Where its grip shuts: the middle of its round, before it as it faces.
static func grip_point(m) -> Vector2:
	return m.world + m.face * float(GRIP["at"])


static func _now(m) -> float:
	return float(m.mgr.perils._clock) if m.mgr != null and m.mgr.perils != null else 0.0


## The game's carrying it through its swoop (fx tables hs): [round, inward] tiles `t` seconds in; its pace along its ring.
static func _tab(m) -> Dictionary:
	return m.mgr.perils._fx["tables"].get("hs", {}) if m.mgr != null and m.mgr.perils != null else {}


static func swoop_carry(m, t: float) -> Vector2:
	var c: Array = _tab(m).get("carry", [])
	if c.is_empty():
		return Vector2.ZERO
	var x := clampf(t, 0.0, float(SWOOP["turn"])) * 200.0
	var i := mini(floori(x), c.size() - 2)
	var u := x - i
	return Vector2(c[i][0], c[i][1]).lerp(Vector2(c[i + 1][0], c[i + 1][1]), u)


static func swoop_pace(m, t: float) -> float:
	var c: Array = _tab(m).get("pace", [])
	if c.is_empty():
		return 0.0
	var x := clampf(t, 0.0, 1.7) * 100.0
	var i := mini(floori(x), c.size() - 2)
	return lerpf(float(c[i]), float(c[i + 1]), x - i)


## What it keeps: the way it goes round (1 its own left, -1 its right), its ring growing out after a swoop, how long on the near ring
## and how long it waits there, the way its swoop goes.
func _kept(m) -> void:
	if a1.has("side"):
		return
	# (a swarm all going round the same way reads as one swirl: the way of the floor's first)
	var key: int = m.mgr.get_instance_id()
	if not swirls.has(key):
		swirls[key] = 1 if randf() < 0.5 else -1
	a1["side"] = swirls[key]
	a1["out"] = 0
	a1["near"] = 0.0
	a1["wait"] = randf_range(SWOOP["wait"][0], SWOOP["wait"][1])
	a1["swoop"] = 0


## The glide for the way it goes round as its picture is turned (turned over, the same pictures go the mirror way), and its pace.
static func glide_for(side: int, f: Vector2, r: float) -> String:
	var left := (-side if f.x - f.y < 0.0 else side) > 0
	return "hshape:glide%s%s" % ["L" if left else "R", "F" if r < float(CIRCLE["switchAt"]) else ""]


## Carried to (ring `r`, angle `a` round him), if the floor there is open: true if it went.
static func carry_to(m, h: Vector2, r: float, a: float) -> bool:
	var p := h + Vector2(cos(a), sin(a)) * r
	if not is_open(m, p):
		return false
	m.world = p
	return true


func can(_m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (the glides and the swoop come only when the rules bring them)
	return not a.get("forced", false)


func forced(m) -> int:
	var hero = m.mgr.hero
	if hero == null or not hero.alive:
		return -1
	_kept(m)
	# (THE SWOOP, when its moment came on the near ring)
	if int(a1["swoop"]) != 0:
		return IDS.find("hshape:swoopL" if int(a1["swoop"]) > 0 else "hshape:swoopR")
	# (circling: in reach of its rings and in sight; too close in, it grips as before)
	var to: Vector2 = m.world - hero.world
	var r := maxf(to.length(), 1e-6)
	if r > float(CIRCLE["from"]) or r < float(CIRCLE["least"]) or not m.mgr.sees(m.world, hero.world):
		return -1
	m.face = -to / r
	return IDS.find(glide_for(int(a1["side"]), m.face, r))


func start(m, a: Dictionary, hero) -> void:
	var id := str(a["id"])
	if is_swoop(id):
		last_swoop[m.mgr.get_instance_id()] = _now(m)
		# (its picture held facing the way it will face, square before him, as its last turn ends: the swoop's pictures are of that)
		_kept(m)
		var side := int(a1["swoop"])
		a1["swoop"] = 0
		var u: Vector2 = (m.world - hero.world).normalized()
		var end := atan2(u.y, u.x) + side * SWOOP_TURN
		m.face = -Vector2(cos(end), sin(end))
		act["a"] = side
		act["fx"] = m.face.x
		act["fy"] = m.face.y
		warn(m, id, SWOOP["warn"], SWOOP["hit"], [], [[-PI, PI, GRIP["r"], GRIP["at"]]])
	elif id == "hshape:grip":
		warn(m, id, GRIP_WARN, a["hit"], [], [[-PI, PI, GRIP["r"], GRIP["at"]]])


func end(_m, a: Dictionary, _hero) -> void:
	if not is_swoop(str(a["id"])):
		return
	a1["out"] = 1
	a1["near"] = 0.0
	a1["wait"] = randf_range(SWOOP["wait"][0], SWOOP["wait"][1])


func acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	var id := str(a["id"])
	var h: Vector2 = hero.world
	if is_glide(id):
		# GOING ROUND HIM on its ring, facing him, its ring closing (or growing out again after a swoop)
		_kept(m)
		var to: Vector2 = m.world - h
		var r := maxf(to.length(), 1e-6)
		var r1 := r
		if int(a1["out"]) != 0:
			r1 = minf(float(SWOOP["out"]), r + float(SWOOP["grow"]) * dt)
			if r1 >= float(SWOOP["out"]) - 1e-6:
				a1["out"] = 0
		else:
			r1 = maxf(float(CIRCLE["fast_ring"]), r - float(CIRCLE["closing"]) * dt)
		var a0 := atan2(to.y, to.x)
		var ang := a0 + int(a1["side"]) * circle_pace(r1) * dt / maxf(0.5, r1)
		if not carry_to(m, h, r1, ang) and not carry_to(m, h, r, ang):
			# (no room that way round: it turns and goes round the other way)
			a1["side"] = -int(a1["side"])
		var now: Vector2 = m.world - h
		var nr := maxf(now.length(), 1e-6)
		m.face = -now / nr
		# (its pictures: the glide for the way it goes round as its picture is turned, and its pace; another, the act ends)
		var done: bool = glide_for(int(a1["side"]), m.face, nr) != id or nr > float(CIRCLE["from"]) + 0.5 or not m.mgr.sees(m.world, h)
		# (on the near ring, after a while, and none of the swarm swooping just now: its swoop, begun where its last turn will end
		# square before him)
		if not done and int(a1["out"]) == 0 and nr <= float(CIRCLE["fast_ring"]) + 0.2:
			a1["near"] = float(a1["near"]) + dt
			var last: float = last_swoop.get(m.mgr.get_instance_id(), -1e9)
			if float(a1["near"]) >= float(a1["wait"]) and _now(m) - last >= float(SWOOP["gap"]):
				var ends := atan2(now.y, now.x) + int(a1["side"]) * SWOOP_TURN
				var q := PI / 2.0
				var off := absf(ends - roundf(ends / q) * q)
				if off <= circle_pace(nr) * dt / nr + 0.02:
					a1["swoop"] = int(a1["side"])
					done = true
		if done:
			_end(m, a, hero)
		return
	if is_swoop(id):
		# CARRIED ROUND HIM AND IN through its last turn; still through its grip; swirling off round him again as it lets go
		var side := int(act.get("a", 1))
		var to: Vector2 = m.world - h
		var r := maxf(to.length(), 1e-6)
		var a0 := atan2(to.y, to.x)
		var turn: float = SWOOP["turn"]
		if t0 < turn:
			var c0 := swoop_carry(m, minf(t0, turn))
			var c1 := swoop_carry(m, minf(t1, turn))
			var r1 := maxf(float(CIRCLE["grip"]), r - (c1.y - c0.y))
			carry_to(m, h, r1, a0 + side * (c1.x - c0.x) / maxf(0.5, r1))
		elif t1 > float(SWOOP["off"]):
			var r1 := r + float(SWOOP["grow"]) * dt
			carry_to(m, h, r1, a0 + side * swoop_pace(m, t1) * dt / maxf(0.5, r1))
		# (its picture held facing the way it faces as its grip shuts, till it lets go)
		if t1 < float(SWOOP["off"]) and act.has("fx"):
			m.face = Vector2(act["fx"], act["fy"])
		else:
			var now: Vector2 = m.world - h
			if now.length() > 1e-6:
				m.face = -now.normalized()
	if id == "hshape:grip" or is_swoop(id):
		if not crossed(t0, t1, a["hit"]):
			return
		var P := grip_point(m)
		var caught: bool = h.distance_to(P) <= float(GRIP["r"]) and hero._act != "lunge" and hero.alive
		# (the coils where it shut: round him if it caught him)
		peril(m, "hshape:grip", h if caught else P, {"dur": 0.8, "a": 1.0 if caught else 0.0})
		if not caught:
			return
		blow(m, hero, float(a["dmg"]))
		hero.hush(GRIP["hush"])
		# (held: he cannot move until it lets go)
		hero.chill(GRIP["hold"], GRIP["slow"])
