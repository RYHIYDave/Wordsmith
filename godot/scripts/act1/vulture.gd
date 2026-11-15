## THE VULTURES (floor 7), as the game fights them (game/act1_rules/vulture.ts RULES, VULTURE, liftOf; render/act1_fx/vulture.ts;
## render/render.ts fallenLift, FALL; game.ts kill). His doc's table: "They circle overhead, then dive."
##   ON ITS PERCH (its stand) until it wakes; then it takes off (0.8 s) and goes up over the hero.
##   IT CIRCLES OVERHEAD, 26 game pixels up, round the hero 2.4 tiles out (making for a point 0.35 radians further round its
##     ring; from further off than 4.9 tiles, straight at him), out over the drop as much as over the road (it flies by the
##     open grid), its wing beat one a second; struck, its flinch plays and its wing beat begins again. Held against the rock,
##     it turns its way round the other way. Up there it is struck as anywhere; up in the air (higher than 9 game pixels) it
##     neither jostles nor is jostled by what is on the ground (act1.gd away).
##   THEN IT DIVES (its one attack, list `attack`, 1.2 s), when it has circled long enough (1.8 to 3.4 s), is up at its height,
##     the hero is 1.0 to 4.2 tiles off and in its sight, none of its flock is diving, and where its talons will strike is
##     floor to come down on: its warning held at the top (its cry, 0.25 s), the line it will stoop along laid on the floor
##     (vulture:line, the game's line of aim, gold as it nears); from 0.5 s it stoops down the line onto where the hero stood
##     as it began, faster and faster, out of the air to the floor; at 0.7 s its talons strike 0.77 tiles before it: a hero
##     within 0.55 of there is struck, x1; it pulls out low past where it struck (carried on 0.71 tiles) and climbs back (1 s).
##   KILLED UP THERE, it falls from its height as its death plays (from 0.1 s to 0.62 s, faster and faster); over the drop it
##     falls on past the floor into it, fading out by 0.8 s, and what it leaves lands on the nearest floor.
extends "res://scripts/act1/act1.gd"

## (RULES.gait: its walk painted for 1.2 tiles a second, but a flier: the rules fly it at its own speed)
const GAIT := {"pace": 1.2, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.4, "slack": 0.6, "trueBack": true}
## (VULTURE)
const V := {"high": 26.0, "ring": 2.4, "lead": 0.35, "chase": 2.5, "takeOff": 0.8, "fall": 70.0, "arrive": 0.9, "climb": 1.0,
	"circle": [1.8, 3.4], "called": [0.3, 0.8], "callNear": 6.0, "low": 9.0}
const DIVE := {"long": 1.2, "hit": 0.7, "warn": 0.25, "stoop": 0.5, "reach": 0.77, "r": 0.55, "from": 1.0, "to": 1.2, "back": 28.0 / 39.19, "out": 3.0, "near": 1.0, "far": 4.2}
const ACTS := [
	{"id": "vulture:dive", "clip": "attack", "long": 1.2, "hit": 0.7, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 1.0, "far": 4.2},
]
## (render.ts FALL: its fall from the air as its death plays; over the drop, its fading)
const FALL := {"from": 0.1, "to": 0.62, "fade": 0.35, "gone": 0.8}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `lift` how high it is now, game pixels; a climb from `from` over `dur` seconds, `k` of the way; `next` seconds of
## circling before its next dive; `spin` its way round; `born`, when it came into the world, and `near` 1 if beside the hero
## then; `sx`, `sy` where its dive began)
func spawned(m) -> void:
	a1 = {"lift": 0.0, "k": 1.0, "from": 0.0, "dur": 1.0, "next": 0.0, "spin": 0, "born": Time.get_ticks_msec() / 1000.0, "near": 0, "sx": 0.0, "sy": 0.0}
	var h = m.mgr.hero
	# (one put into the world beside the hero, as the Queen's call brings her flock, is called in; the floor's own sit on their
	# perches until he comes)
	if h != null and m.world.distance_to(h.world) < float(V["callNear"]):
		a1["near"] = 1


func _climb_from(from: float, dur: float) -> void:
	a1["from"] = from
	a1["lift"] = from
	a1["k"] = 0.0
	a1["dur"] = dur


func aloft(_m) -> bool:
	return float(a1.get("lift", 0.0)) > float(V["low"])


func tick(m, dt: float, dist: float, hero) -> bool:
	# (its dive runs by the rules' clock)
	if m.state == "act":
		return false
	if int(a1["spin"]) == 0:
		# ITS FIRST STEP AWAKE: off its perch, or (just come into the world, awake: called in) down out of the sky
		a1["spin"] = 1 if randf() < 0.5 else -1
		var called: bool = int(a1["near"]) == 1 and Time.get_ticks_msec() / 1000.0 - float(a1["born"]) < 0.3
		if called:
			_climb_from(float(V["high"]) + float(V["fall"]), V["arrive"])
			a1["next"] = randf_range(V["called"][0], V["called"][1]) + float(V["arrive"])
		else:
			_climb_from(0.0, V["takeOff"])
			a1["next"] = randf_range(V["circle"][0], V["circle"][1])
		_to("walk")
	if mode != "walk":
		_to("walk")
	m.state = "chase"
	# ITS HEIGHT: climbing (from its perch, out of a dive) or coming down to it (called in)
	if float(a1["k"]) < 1.0:
		a1["k"] = minf(1.0, float(a1["k"]) + dt / float(a1["dur"]))
		a1["lift"] = float(a1["from"]) + (float(V["high"]) - float(a1["from"])) * smooth(a1["k"])
	else:
		a1["lift"] = V["high"]
	# ITS WING BEAT, one a second, as painted; struck, its flinch plays from the walk's first pose and hands back to it
	if m.struck_t < 0.4:
		gt = 0.0
	else:
		gt += dt
	# ROUND THE HERO: the point a little further round its ring, or straight at him from far off
	var sp: float = m.speed * m.slow()
	var o: Vector2 = m.world - hero.world
	var v: Vector2
	if dist > float(V["ring"]) + float(V["chase"]):
		v = -o / (dist if dist > 0.0 else 1.0)
	else:
		var ang := atan2(o.y, o.x) + int(a1["spin"]) * float(V["lead"])
		var p: Vector2 = hero.world + Vector2(cos(ang), sin(ang)) * float(V["ring"]) - m.world
		v = p / (p.length() if p.length() > 0.0 else 1.0)
	var was: Vector2 = m.world
	slide(m, v * sp * dt, 0.3, true)
	# (it faces the way it goes; held against the rock, it turns its way round the other way)
	var moved: Vector2 = m.world - was
	if moved.length() > 1e-4:
		m.face = moved.normalized()
	elif dist <= float(V["ring"]) + float(V["chase"]):
		a1["spin"] = -int(a1["spin"])
	# ITS DIVE, when it has circled long enough, is up at its height, and he is in its sight; its flock take turns
	a1["next"] = float(a1["next"]) - dt
	if float(a1["next"]) <= 0.0 and float(a1["k"]) >= 1.0 and hero.alive:
		var ok: bool = dist >= float(DIVE["near"]) and dist <= float(DIVE["far"]) and m.mgr.sees(m.world, hero.world) and not _flock_diving(m)
		# (where its floor point will be at the strike must be floor to come down on: the road, not the drop)
		var u: Vector2 = (hero.world - m.world) / (dist if dist > 0.0 else 1.0)
		var down: Vector2 = hero.world - u * float(DIVE["reach"])
		if ok and m.mgr.clear(down.x, down.y, 0.3):
			start_act(m, ACTS, 0, hero)
			return true
		a1["next"] = 0.25
	return true


## Does another of its flock dive now? (They take turns.)
func _flock_diving(m) -> bool:
	for o in m.mgr.list:
		if is_instance_valid(o) and o != m and not o.dead and o.kind == "vulture" and o.pack_id == m.pack_id and o.state == "act":
			return true
	return false


func start(m, _a: Dictionary, _hero) -> void:
	a1["sx"] = m.world.x
	a1["sy"] = m.world.y
	# (the line it will stoop along, on the floor from its warning to its strike: marks.gd)
	peril(m, "vulture:line", m.world, {"dur": 1e9})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var h: Vector2 = hero.world
	# the line it stoops along: from where it began to where the hero stood as it began
	var s := Vector2(a1["sx"], a1["sy"])
	var l := Vector2(act["x"], act["y"]) - s
	var u := l / (l.length() if l.length() > 0.0 else 1.0)
	if crossed(t0, t1, DIVE["warn"]):
		sound(m, "gust", 0.35)
	if crossed(t0, t1, DIVE["stoop"]):
		sound(m, "swing", 0.6)
	if t1 <= float(DIVE["stoop"]):
		a1["lift"] = V["high"]
	elif t0 < float(a["hit"]):
		# THE STOOP: down the line onto where he stood, faster and faster, out of the air to the floor
		var k := clamp01((t1 - float(DIVE["stoop"])) / (float(a["hit"]) - float(DIVE["stoop"])))
		var e := k * k
		var end := Vector2(act["x"], act["y"]) - u * float(DIVE["reach"])
		m.world = s + (end - s) * e
		a1["lift"] = float(V["high"]) * (1.0 - e)
	if crossed(t0, t1, a["hit"]):
		# THE STRIKE: its talons, `reach` before it
		var tal: Vector2 = m.world + m.face * float(DIVE["reach"])
		if h.distance_to(tal) <= float(DIVE["r"]):
			blow(m, hero, a["dmg"])
			hero.kick(2.0)
		sound(m, "hit", 0.4)
	if t1 > float(a["hit"]):
		# THE PULL-OUT, low: its body comes back to its floor point in the picture, and the rules carry it on as much
		var step := _back(t1) - _back(t0)
		if step > 0.0 and is_open(m, m.world + u * step):
			m.world += u * step
		a1["lift"] = float(DIVE["out"]) * smooth((t1 - (float(a["hit"]) + 0.1)) / (float(a["long"]) - float(a["hit"]) - 0.1))


## (the picture's pull-out, slow at both ends as the art's own curves are)
func _back(t: float) -> float:
	var v := clamp01((t - float(DIVE["from"])) / (float(DIVE["to"]) - float(DIVE["from"])))
	return float(DIVE["back"]) * (1.0 - cos(PI * v)) / 2.0


## (out of its dive: climbing back, circling on from its walk's first pose, where its dive ends)
func end(_m, _a: Dictionary, _hero) -> void:
	_climb_from(a1["lift"], V["climb"])
	a1["next"] = randf_range(V["circle"][0], V["circle"][1])
	_to("walk")


## KILLED, it falls from where it was (game.ts kill: its height kept; over the drop, `away`, and what it leaves lands on the
## nearest floor: the body is put there, falling away and fading as it goes).
func died(m) -> void:
	a1["fell"] = maxf(0.0, float(a1.get("lift", 0.0)))
	if float(a1["fell"]) > 0.0 and m.mgr.map.tile(floori(m.world.x), floori(m.world.y)) == m.mgr.map.PIT:
		a1["away"] = true
		m.world = _floor_near(m, m.world)


func _floor_near(m, at: Vector2) -> Vector2:
	for r in range(0, 12):
		var best := Vector2.INF
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var tx := floori(at.x) + dx
				var ty := floori(at.y) + dy
				var q := Vector2(tx + 0.5, ty + 0.5)
				if m.mgr.map.walkable(tx, ty) and (best == Vector2.INF or q.distance_to(at) < best.distance_to(at)):
					best = q
		if best != Vector2.INF:
			return best
	return at


## (liftOf, and fallenLift as it falls dead)
func lift(m) -> float:
	if not m.dead:
		if m.state == "sleep":
			# (put back on its perch, as the hero fell: it takes off again as it wakes)
			a1["spin"] = 0
			a1["lift"] = 0.0
		return float(a1.get("lift", 0.0))
	var L: float = a1.get("fell", 0.0)
	var t: float = m._dead_for
	var k := maxf(0.0, (t - float(FALL["from"])) / (float(FALL["to"]) - float(FALL["from"])))
	if not a1.get("away", false):
		return L * (1.0 - minf(1.0, k) * minf(1.0, k))
	m._sprite.modulate.a = clamp01(1.0 - (t - float(FALL["fade"])) / (float(FALL["gone"]) - float(FALL["fade"])))
	return L * (1.0 - k * k)


## (render/act1_fx/vulture.ts sprite: frozen in the air, held in its flight's first pose, not its perch's)
func shown(m) -> Dictionary:
	if m.frozen_t > 0.0 and m.state != "sleep" and not m.dead:
		return {"list": "walk", "i": 0}
	return {}
