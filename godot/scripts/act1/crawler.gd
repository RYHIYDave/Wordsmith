## THE CLIFF CRAWLERS (floor 7), as the game fights them (game/act1_rules/crawler.ts RULES, CRAWLER, underLip, lipDepth, lipFor;
## render/act1_fx/crawler.ts). His doc's table: "A swipe; a grab that drags you toward the drop. They climb up over the lip of
## the ledge." His pick of 31 Oct 2026, “Yes, no drop-pushes (Recommended)”: its grab drags him back with it, not to the drop.
##   ITS WALK, a tripod: 1.4 tiles a second, half a second round, looping from its stand; as near as 1.1 tiles, off again
##     beyond 1.5.
##   THE CLAW SWIPE (its basic blow, within 1.7 tiles; list `attack`, 0.9 s): its front claw reared up at its left, whipped
##     across before it at 0.38 s: a hero in the strip -0.2 to 1.75 tiles before it and -0.45 to 1.2 to its left is struck, x1.
##   THE LEAP (within 1.6 tiles; list `leap`, 1.3 s; every 7 s, first 2.5 s after waking): its crouch, a ring on the floor where
##     it will come down (0.85 tiles before it, 0.8 round; the game's sweep ring), the spring, and at 0.72 s it lands ON him:
##     a hero within the ring (not in the air of his lunge) is struck, x1.3, and GRABBED ("Grabbed"): held, and as it hops back
##     from 0.82 s to 1.3 s dragged 1.6 tiles back the way it came, along the floor (the floor's edge stops him), the floor
##     scraped behind him.
##   IT CLIMBS UP OVER THE LIP: one that comes into the world within 5 tiles of the drop waits under the lip, on the floor at
##     the lip (a tile of the road with the drop beside it down the screen, the nearest, not where another waits), out of sight
##     and out of reach; woken, it waits its moment (up to 0.7 s, by its seed), then springs up over the lip onto the road (its
##     leap's picture, let down 18 game pixels under the floor's edge until it springs, from 0.35 s to 0.72 s), and fights.
extends "res://scripts/act1/act1.gd"

## (RULES.gait)
const GAIT := {"pace": 1.4, "cycle": 0.5, "setOff": 0.0, "halt": 0.0, "stopAt": 1.1, "slack": 0.4, "trueBack": true}
## (CRAWLER)
const SWIPE := {"fwd": [-0.2, 1.75], "left": [-0.45, 1.2]}
const LEAP := {"hit": 0.72, "at": 0.85, "r": 0.8, "from": 0.82, "to": 1.3, "drag": 1.6}
const LIP := {"near": 5.0, "below": 18.0, "spring": [0.35, 0.72], "stagger": 0.7}
const ACTS := [
	{"id": "crawler:swipe", "clip": "attack", "long": 0.9, "hit": 0.38, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 1.0, "near": 0.0, "far": 1.7},
	{"id": "crawler:leap", "clip": "leap", "long": 1.3, "hit": 0.72, "dmg": 1.3, "cooldown": 7.0, "first": 2.5, "after": 0.6, "near": 0.0, "far": 1.6},
	{"id": "crawler:climb", "clip": "leap", "long": 1.3, "hit": 0.72, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 0.0, "forced": true},
]
const CLIMB := 2
## (the colour of "Grabbed")
const GRABBED := Color("#ff8a80")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (keep: `hid` 1 while it waits under the lip, 2 as it climbs up; `wait` before it climbs; `ix`, `iy` the way in from the
## drop; `grab` 1 while it holds the hero, the way it drags him (`gx`, `gy`) and where it grabbed him (`ox`, `oy`))
func spawned(m) -> void:
	a1 = {"hid": 0, "wait": 0.0, "ix": 0.0, "iy": 0.0, "grab": 0, "gx": 0.0, "gy": 0.0, "ox": 0.0, "oy": 0.0}
	var lip := _lip_for(m)
	if lip.is_empty():
		return
	m.world = Vector2(lip["x"], lip["y"])
	m.face = Vector2(lip["ix"], lip["iy"])
	a1["hid"] = 1
	a1["ix"] = lip["ix"]
	a1["iy"] = lip["iy"]
	# (its pack comes up one after another: each its own moment, by its own seed)
	a1["wait"] = float(LIP["stagger"]) * fmod(m.own_seed * 7.31, 1.0)


## lipFor: where one that comes into the world near the drop waits: on the floor at the lip, a tile of the road with the drop
## beside it down the screen (so the cliff's face it springs up from faces the camera), the nearest to where it was put, and not
## where another of them waits. Empty: not near the drop. (On the Ledge Road every pit is the drop: act1_layout.ts.)
func _lip_for(m) -> Dictionary:
	var map = m.mgr.map
	var near: float = LIP["near"]
	var taken: Array = []
	for o in m.mgr.list:
		if is_instance_valid(o) and o != m and not o.dead and o.kind == "crawler" and o.h2 != null and int(o.h2.a1.get("hid", 0)) == 1:
			taken.append(o.world)
	var best := {}
	var bd := near
	for ty in range(floori(m.world.y - near), floori(m.world.y + near) + 1):
		for tx in range(floori(m.world.x - near), floori(m.world.x + near) + 1):
			if map.tile(tx, ty) != map.FLOOR or not map.walkable(tx, ty) or (not map.cut.is_empty() and map.cut[ty * map.w + tx] != 0):
				continue
			var px: bool = map.tile(tx + 1, ty) == map.PIT
			var py: bool = map.tile(tx, ty + 1) == map.PIT
			if not px and not py:
				continue
			var q := Vector2(tx + 0.5, ty + 0.5)
			var d: float = q.distance_to(m.world)
			if d >= bd or not m.mgr.clear(q.x, q.y, 0.42):
				continue
			var crowded := false
			for w in taken:
				crowded = crowded or w.distance_to(q) < 1.1
			if crowded:
				continue
			var i := Vector2(-1.0 if px else 0.0, -1.0 if py else 0.0).normalized()
			bd = d
			best = {"x": q.x, "y": q.y, "ix": i.x, "iy": i.y}
	return best


## (under the lip, awake: it waits its moment, then springs: `forced`)
func tick(_m, dt: float, _dist: float, _hero) -> bool:
	if int(a1.get("hid", 0)) != 1:
		return false
	a1["wait"] = float(a1["wait"]) - dt
	return float(a1["wait"]) > 0.0


func forced(_m) -> int:
	return CLIMB if int(a1.get("hid", 0)) == 1 and float(a1["wait"]) <= 0.0 else -1


func start(m, a: Dictionary, _hero) -> void:
	if a["id"] == "crawler:climb":
		# (it springs up the way in from the drop, not at the hero)
		m.face = Vector2(a1["ix"], a1["iy"])
		act["hand"] = hand_of(true, m.face)
		a1["hid"] = 2
	elif a["id"] == "crawler:leap":
		# (its ring where it will come down, and the scrape of what it drags: marks.gd)
		peril(m, "crawler:leap", m.world, {"dur": 1e9})
	a1["grab"] = 0


func end(_m, a: Dictionary, hero) -> void:
	if a["id"] == "crawler:climb":
		a1["hid"] = 0
	if int(a1["grab"]) != 0:
		a1["grab"] = 0
		hero.held = 0.0


func died(m) -> void:
	if int(a1.get("grab", 0)) != 0 and m.mgr.hero != null:
		m.mgr.hero.held = 0.0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match a["id"]:
		"crawler:swipe":
			if crossed(t0, t1, 0.26):
				sound(m, "swing", 0.6)
			if not crossed(t0, t1, a["hit"]):
				return
			var r := rel(m, hero)
			if r.x >= SWIPE["fwd"][0] and r.x <= SWIPE["fwd"][1] and r.y >= SWIPE["left"][0] and r.y <= SWIPE["left"][1]:
				blow(m, hero, a["dmg"])
			hero.kick(1.0)
		"crawler:leap":
			if crossed(t0, t1, 0.35):
				sound(m, "swing", 0.7)
			if crossed(t0, t1, a["hit"]):
				# IT COMES DOWN ON HIM, and grabs what it comes down on
				var p := beside(m.world, m.face, act["hand"], LEAP["at"], 0.0)
				if hero.world.distance_to(p) <= float(LEAP["r"]) and open_to(hero):
					blow(m, hero, a["dmg"])
					a1["grab"] = 1
					a1["ox"] = hero.world.x
					a1["oy"] = hero.world.y
					# (back with it as it hops back, never toward the drop)
					a1["gx"] = -m.face.x
					a1["gy"] = -m.face.y
					hero.held = float(LEAP["to"]) - t1 + 0.05
					word(m, hero, "Grabbed", GRABBED)
				hero.kick(4.0)
				sound(m, "slam", 0.6)
			if int(a1["grab"]) != 0 and t1 > float(LEAP["from"]):
				# THE DRAG, as it hops back, along the floor (the edge stops him: he cannot go over)
				if not hero.alive:
					a1["grab"] = 0
					return
				var step := float(LEAP["drag"]) * (minf(t1, LEAP["to"]) - maxf(t0, LEAP["from"])) / (float(LEAP["to"]) - float(LEAP["from"]))
				if step > 0.0:
					hero._slide(Vector2(a1["gx"], a1["gy"]) * step)
				hero.held = maxf(hero.held, 0.05)
				if t1 >= float(LEAP["to"]):
					a1["grab"] = 0
					hero.held = 0.0
		"crawler:climb":
			# (up over the lip: the scrape of its claws on the rock as it springs, and lands)
			if crossed(t0, t1, 0.35):
				sound(m, "swing", 0.4)
			if crossed(t0, t1, a["hit"]):
				hero.kick(1.0)


func reachable(_m) -> bool:
	return int(a1.get("hid", 0)) == 0


## (lipDepth: let down under the floor's edge until it springs up over the lip)
func lift(m) -> float:
	var hid := int(a1.get("hid", 0))
	if hid == 0:
		return 0.0
	if hid == 1:
		return -float(LIP["below"])
	var t: float = act["t"] if act != null and ACTS[act["i"]]["id"] == "crawler:climb" else 0.0
	return -float(LIP["below"]) * (1.0 - smooth((t - float(LIP["spring"][0])) / (float(LIP["spring"][1]) - float(LIP["spring"][0]))))


## (render/act1_fx/crawler.ts sprite: one waiting under the lip is not seen)
func shown(m) -> Dictionary:
	return {"hide": true} if int(a1.get("hid", 0)) == 1 and not m.dead else {}
