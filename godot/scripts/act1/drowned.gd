## THE DROWNED (floor 10), as the game fights them with their BOG RETCH and FROST GRAB, as the game starts (game/act1_rules/
## drowned.ts RULES, RETCH_ACTS, DROWNED, RIME_PERIL, SLICK_PERIL, SLICK_STING, axisOf, slickReach, underWater; art/action_f9_fen.ts
## GRAB9, GRAB_HIT, FROST, RETCH, RETCH_HIT, SLICK, inCone; render/act1_fx/drowned.ts; DROWNED_RETCH on: game/enemy_moves.ts). His
## doc's table: "Corpses that rise from the water and grab you, slowing you down."; his picks of 31 Oct 2026: the retch, “something
## that, like, takes away space”, and for frost, “The Drowned, 10”. A small mob.
##   UNDER THE WATER until it wakes: laid at the water's edge as it comes into the world (the nearest tile of ground beside the
##     water within 3.5 tiles, not taken by another of them), unseen and not to be struck (nothing of it drawn). Woken, it RISES
##     OUT OF THE WATER first (list `rise`, 1.9 s), to be struck from 1.05 s.
##   ITS SHAMBLE: 0.7 tiles a second, stopping at any frame; as near as 0.9 tiles, off again beyond 1.1.
##   THE FROST GRAB (its basic blow, within 1.7 tiles; list `attack`, 1.9 s): its hands clutch shut at 0.733 s: a hero in the
##     strip 0.05 to 1.85 tiles before it and 0.8 to either side is struck, x1, and slowed 40% for 2 s (the game's chill on him);
##     and a hero within 1.15 of where they close (1.15 tiles before it) is FROZEN IN PLACE for 0.8 s ("Frozen": he neither walks
##     nor dodges), the rime racing out there (drowned:rime, 1.6 s; ice round his feet while he is held).
##   THE BOG RETCH (1 to 3 tiles; list `retch`, 2.2 s; every 7 s, first 2 s after waking): turned straight along the way its
##     picture faces; from 0.3 s the cone it will cover marked before it (drowned:slick, its clock from the retch at 0.833 s); the
##     gush thrown out over it and down 0.12 s after: a hero in the cone (0.3 to 3.35 tiles out, 32 degrees to either side) is
##     struck, x1; it lies there as A SLICK for 5 s (spreading over 0.3 s, shrinking over its last 0.8): whoever wades in it is
##     slowed to half his pace and stung, x0.3, every 0.5 s. Stopped before it retches, the cone goes.
extends "res://scripts/act1/act1.gd"

## (RULES.gait)
const GAIT := {"pace": 0.7, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.9, "slack": 0.2, "trueBack": true}
## (RETCH_ACTS)
const ACTS := [
	{"id": "drowned:grab", "clip": "attack", "long": 1.9, "hit": 22.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 1.7},
	{"id": "drowned:retch", "clip": "retch", "long": 2.2, "hit": 25.0 / 30.0, "dmg": 1.0, "cooldown": 7.0, "first": 2.0, "after": 0.6, "near": 1.0, "far": 3.0},
	{"id": "drowned:rise", "clip": "rise", "long": 1.9, "hit": 1.05, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.2, "near": 0.0, "far": 0.0, "forced": true},
]
const RISE := 2
## (GRAB9, DROWNED.grab, FROST; RETCH, SLICK, SLICK_STING; DROWNED.water)
const GRAB := {"fwd": [0.2, 1.7], "half": 0.8, "slow": 0.4, "secs": 2.0}
const FROST := {"at": 1.15, "r": 1.0, "hold": 0.8, "seen": 1.6}
const RETCH := {"hit": 25.0 / 30.0, "mark": 0.3}
const SLICK := {"from": 0.3, "long": 3.2, "ang": 32.0, "lands": 0.12, "spread": 0.3, "stays": 5.0, "fade": 0.8, "slow": 0.5}
const STING := {"share": 0.3, "every": 0.5}
const WATER_NEAR := 3.5
## (the colour of "Frozen")
const FROZEN := Color("#ff8a80")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## As it comes into the world: under the water, by the water's edge where the floor has water near (one the floor's own already
## lies there, as the game laid it: kept).
func spawned(m) -> void:
	a1 = {"under": 1}
	var map = m.mgr.map
	var here := Vector2i(floori(m.world.x), floori(m.world.y))
	if _edge(map, here.x, here.y):
		return
	var best := Vector2.INF
	var bd := INF
	for ty in range(floori(m.world.y - WATER_NEAR), floori(m.world.y + WATER_NEAR) + 1):
		for tx in range(floori(m.world.x - WATER_NEAR), floori(m.world.x + WATER_NEAR) + 1):
			if not _edge(map, tx, ty):
				continue
			var q := Vector2(tx + 0.5, ty + 0.5)
			var d: float = q.distance_to(m.world)
			if d > WATER_NEAR or d >= bd or not m.mgr.clear(q.x, q.y, m.r):
				continue
			var taken := false
			for o in m.mgr.list:
				if is_instance_valid(o) and o != m and not o.dead and o.kind == "drowned" and o.world.distance_to(q) < 0.9:
					taken = true
			if taken:
				continue
			best = q
			bd = d
	if best != Vector2.INF:
		m.world = best


## A tile of the fen's ground with its water beside it.
static func _edge(map, tx: int, ty: int) -> bool:
	if map.tile(tx, ty) != map.FLOOR:
		return false
	return map.tile(tx + 1, ty) == map.PIT or map.tile(tx - 1, ty) == map.PIT or map.tile(tx, ty + 1) == map.PIT or map.tile(tx, ty - 1) == map.PIT


## underWater: not yet risen, or rising and not yet up.
func under_water() -> bool:
	return int(a1.get("under", 0)) > 0


## axisOf: the way its picture faces (one of the floor's four, as it is drawn): the way the cone is drawn.
static func axis_of(f: Vector2) -> Vector2:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	if back:
		return Vector2(-1, 0) if flip else Vector2(0, -1)
	return Vector2(0, 1) if flip else Vector2(1, 0)


## inCone: whether a point `x` tiles before it and `y` aside is in its cone.
static func in_cone(x: float, y: float, long: float = SLICK["long"]) -> bool:
	var d := Vector2(x, y).length()
	return x > 0.0 and d >= float(SLICK["from"]) and d <= long and absf(atan2(y, x)) <= deg_to_rad(SLICK["ang"])


## slickReach: how far the slick reaches `s` seconds after the gush came down: spread out, lying, shrinking.
static func slick_reach(s: float) -> float:
	if s < 0.0:
		return 0.0
	var grow := 1.0 - pow(1.0 - minf(1.0, s / float(SLICK["spread"])), 2.0)
	var k := clamp01((s - (float(SLICK["stays"]) - float(SLICK["fade"]))) / float(SLICK["fade"]))
	var shrink := 1.0 - k * k * (3.0 - 2.0 * k)
	return float(SLICK["long"]) * grow * (0.2 + 0.8 * shrink)


func forced(_m) -> int:
	return RISE if int(a1.get("under", 0)) == 1 else -1


func start(m, a: Dictionary, _hero) -> void:
	if a["id"] == "drowned:rise":
		a1["under"] = 2
	# (its retch straight along the way its picture faces)
	elif a["id"] == "drowned:retch":
		m.face = axis_of(m.face)


func end(_m, a: Dictionary, _hero) -> void:
	if a["id"] == "drowned:rise":
		a1["under"] = 0


func reachable(_m) -> bool:
	return not under_water()


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match a["id"]:
		"drowned:rise":
			# (up out of the water: from now it may be struck)
			if crossed(t0, t1, a["hit"]):
				a1["under"] = 0
		"drowned:retch":
			# (the cone marked before it, the gush, the slick: its clock from the retch)
			if crossed(t0, t1, RETCH["mark"]):
				peril(m, "drowned:slick", m.world, {"t": -(float(RETCH["hit"]) - float(RETCH["mark"])), "hit": SLICK["lands"], "dur": float(SLICK["lands"]) + float(SLICK["stays"]), "dmg": m._roll() * float(a["dmg"])})
			if crossed(t0, t1, a["hit"]):
				sound(m, "wave", 0.5)
		"drowned:grab":
			if not crossed(t0, t1, a["hit"]):
				return
			# (its hands clutch shut: whoever they close on is struck and slowed; whoever is in the rime as it races out, frozen in place)
			var r := rel(m, hero)
			var free := open_to(hero)
			if free and r.x >= float(GRAB["fwd"][0]) - HERO_R * 0.5 and r.x <= float(GRAB["fwd"][1]) + HERO_R * 0.5 and absf(r.y) <= float(GRAB["half"]):
				blow(m, hero, a["dmg"])
				hero.chill_k = maxf(hero.chill_k if hero.chill_t > 0.0 else 0.0, GRAB["slow"])
				hero.chill_t = maxf(hero.chill_t, GRAB["secs"])
			var at: Vector2 = m.world + m.face * float(FROST["at"])
			var frozen: bool = free and hero.world.distance_to(at) <= float(FROST["r"]) + HERO_R * 0.5
			if frozen:
				# (Hero.iceT: he neither walks nor dodges, as one held)
				hero.held = maxf(hero.held, FROST["hold"])
				hero.frozen_t = maxf(hero.frozen_t, FROST["hold"])
				word(m, hero, "Frozen", FROZEN)
			peril(m, "drowned:rime", at, {"dur": FROST["seen"], "d": 1 if frozen else 0, "b": hero.world.x, "c": hero.world.y})
			sound(m, "frost", 0.5)


## (render/act1_fx/drowned.ts hidden, sprite: under the water, not yet risen, nothing of it is seen)
func shown(_m) -> Dictionary:
	return {"hide": true} if int(a1.get("under", 0)) == 1 else {}


# --- its slick (drowned.ts peril; stepped by marks9.gd) ---

static func step_slick(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var hero = P.hero
	if t < 0.0:
		# (marked, not yet retched: gone if it is stopped first)
		var src = p.get("src")
		if src == null or not is_instance_valid(src) or src.dead or src.state != "act" or src.h2.act == null or src.h2.acts()[src.h2.act["i"]]["id"] != "drowned:retch":
			p["dur"] = t
		return
	var f := Vector2(p["fx"], p["fy"])
	var d: Vector2 = hero.world - Vector2(p["x"], p["y"])
	var along := d.dot(f)
	var aside := -d.x * f.y + d.y * f.x
	var free := open_to(hero)
	# (the gush comes down over the cone: whoever is in it is struck)
	if int(p["done"]) == 0 and t >= float(SLICK["lands"]):
		p["done"] = 1
		p["b"] = t + float(STING["every"])
		if free and in_cone(along, aside, float(SLICK["long"]) + HERO_R * 0.5):
			P._hurt(p, p["dmg"])
		return
	if int(p["done"]) == 0:
		return
	# (the slick: whoever wades in it is slowed, and stung)
	var reach := slick_reach(t - float(SLICK["lands"]))
	if reach <= float(SLICK["from"]) or not in_cone(along, aside, reach):
		return
	hero.chill(0.12, 1.0 - float(SLICK["slow"]))
	if t >= float(p["b"]) and free:
		p["b"] = t + float(STING["every"])
		P._hurt(p, float(p["dmg"]) * float(STING["share"]))
