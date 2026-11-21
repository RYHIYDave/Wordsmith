## THE UNFINISHED, FLOOR 6'S BOSS (the Quarry, "The Unfinished Cut"), as the game fights it (game/act1_rules/unfinished.ts RULES,
## UF, UF_GAIT, UF_ACTS, blockFly; render/act1_fx/unfinished.ts; game/boss_calls.ts). His doc: "A stone colossus the cult
## half-carved out of the quarry wall and woke with its chanting. It starts fused to the wall and tears itself free".
##   IN THE WALL (where its floor has it: its back in the quarry's far wall, assets/floor6/boss.json `perch`): it does not walk,
##     and nothing moves it; it turns to the hero no further than 0.7 radians from the way it was carved facing; from there it
##     makes its four moves, in its pictures in the wall (`fusedSlam`, ...). It stands and flinches in its own pictures there
##     (`fusedStand`, `fusedReel`), from in front only.
##   TEARING FREE: as its life falls below 85% of it, the rules bring it (list `tearFree`, 3.3 s): its roar, "The Unfinished tears
##     itself free of the wall"; at 1.4 s the wall rips: a hero within 2.6 of it (and not more than half a tile behind it) is
##     struck, x0.8, and knocked back a heavy blow's step; a burst round it, the screen kicked 8. Free, its moves cool as they
##     were in the wall, and it walks after the hero, grinding (0.9 tiles a second, its walk 3 s round, setting off and stopping a
##     second each, standing within 2.0 and off again beyond 2.8), making the same four:
##   THE FIST SLAM, its basic blow (within 2.9 tiles; 2.5 s): at 1.2 s its right fist comes down 2.04 before it, 0.66 to its
##     right, and skids on to 2.4, 0.71: a hero within 1.0 (and half his width) of that line is struck, x1, knocked back 0.7 of a
##     step from the fist; the screen kicked 4.
##   THE HURLED BLOCK (2.9 to 9.5 tiles; 3.2 s, every 7 s, the first 3 s in): "Catch."; torn up out of the floor at 0.85 s; at
##     1.4 s it is aimed where the hero stands (2.5 to 9 tiles off, turned no more than 0.7 radians off the way it faces, brought
##     back from a wall), its shadow there from then; let go at 2.0 s from over its head (1.79 before it, 6.02 tiles up), it
##     flies 0.5 s and 0.04 a tile, and lands: a hero within 1.0 (and half his width) is struck, x1.2, knocked back a step and
##     thrown out from under it; then it lies there 30 s as cover, a block of the floor (four at most: the oldest crumbles), on
##     which the rockslide's boulders break.
##   THE STOMP (within 3.2 tiles; 2.6 s, every 9 s, the first 5 s in): "Be still. Be stone."; its ring of warning round where its
##     right toe will come down (1.03 before it, 0.89 to its right), 2.8 round, from 0.5 s; at 1.3 s a hero within it is struck,
##     x1.3, knocked back a step; the terrace cracked there 7 s; the screen kicked 7.
##   THE ROCKSLIDE, its biggest (within 14 tiles; 3.4 s, every 14 s, the first 8 s in): "The mountain falls with me."; the
##     boulders roll along the floor's x or its y, whichever is more across the way to the hero; at 0.9 s the first wave's lanes
##     are marked through the hero and 6 tiles to either side, at 1.6 s the second's between them and beyond (none through the
##     Unfinished), each from the cliff's foot to where the floor ends; at each blow (1.6 s, 2.16 s) the screen kicked 6, and a
##     wave's boulders drop in off the cliff (0.25 s) and roll 4.6 tiles a second: a hero within 0.62 (and most of his width) is
##     struck once, x0.9, and knocked aside; it breaks where the floor ends, on a wall or on a hurled block.
##   FALLEN, what it threw and sent rolling is done with: its blocks crumble, its boulders break, what was coming does not come.
## Its marks: unfinished_marks.gd.
extends "res://scripts/act1/act1.gd"

const BG := preload("res://scripts/act1/boss_ground.gd")

## (UF_GAIT)
const GAIT := {"pace": 0.9, "cycle": 3.0, "setOff": 1.0, "halt": 1.0, "stopAt": 2.0, "slack": 0.8, "trueBack": false}
## (UF: its numbers, the pictures' own where they are; tiles before it and to its left)
const UF := {
	"freeAt": 0.85, "turn": 0.7,
	"slam": {"fist": [2.04, -0.66], "skid": [2.4, -0.71], "r": 1.0},
	"stomp": {"at": [1.03, -0.89], "r": 2.8, "warnFrom": 0.5, "cracks": 7.0},
	"hurl": {"tear": 0.85, "aim": 1.4, "from": [1.79, 0.0, 6.02], "least": 2.5, "most": 9.0, "wide": 0.7, "r": 1.0, "lies": 30.0, "blocks": 4, "crumble": 0.6, "half": 0.62},
	"slide": {"hits": [1.6, 2.16], "laid": [0.9, 1.6], "apart": 3.0, "waves": [[0, -2, 2], [-1, 1, -3, 3]], "speed": 4.6, "r": 0.62, "drop": 0.25, "back": 18.0, "far": 26.0, "burst": 0.6, "clear": 2.6},
	"tear": {"r": 2.6},
}
## (UF_ACTS: free, and the same in the wall; tearing free, which the rules bring)
const ACTS := [
	{"id": "unfinished:slam", "clip": "attack", "long": 2.5, "hit": 1.2, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.7, "near": 0.0, "far": 2.9},
	{"id": "unfinished:slamWall", "clip": "fusedSlam", "long": 2.5, "hit": 1.2, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.7, "near": 0.0, "far": 2.9},
	{"id": "unfinished:hurl", "clip": "hurl", "long": 3.2, "hit": 2.0, "dmg": 1.2, "cooldown": 7.0, "first": 3.0, "after": 0.6, "near": 2.9, "far": 9.5},
	{"id": "unfinished:hurlWall", "clip": "fusedHurl", "long": 3.2, "hit": 2.0, "dmg": 1.2, "cooldown": 7.0, "first": 3.0, "after": 0.6, "near": 2.9, "far": 9.5},
	{"id": "unfinished:stomp", "clip": "stomp", "long": 2.6, "hit": 1.3, "dmg": 1.3, "cooldown": 9.0, "first": 5.0, "after": 0.7, "near": 0.0, "far": 3.2},
	{"id": "unfinished:stompWall", "clip": "fusedStomp", "long": 2.6, "hit": 1.3, "dmg": 1.3, "cooldown": 9.0, "first": 5.0, "after": 0.7, "near": 0.0, "far": 3.2},
	{"id": "unfinished:rockslide", "clip": "rockslide", "long": 3.4, "hit": 1.6, "dmg": 0.9, "cooldown": 14.0, "first": 8.0, "after": 0.8, "near": 0.0, "far": 14.0},
	{"id": "unfinished:rockslideWall", "clip": "fusedRockslide", "long": 3.4, "hit": 1.6, "dmg": 0.9, "cooldown": 14.0, "first": 8.0, "after": 0.8, "near": 0.0, "far": 14.0},
	{"id": "unfinished:tear", "clip": "tearFree", "long": 3.3, "hit": 1.4, "dmg": 0.8, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 0.0, "forced": true},
]
## (game/boss_calls.ts BOSS_CALL_LINES.unfinished, BOSS_CALLS: a line over it as it begins a big move, never two within 5 s)
const CALLS := {
	"unfinished:hurl": "Catch.", "unfinished:stomp": "Be still. Be stone.", "unfinished:rockslide": "The mountain falls with me.", "unfinished:tear": "Tear me free!",
	"unfinished:hurlWall": "Catch.", "unfinished:stompWall": "Be still. Be stone.", "unfinished:rockslideWall": "The mountain falls with me.",
}
const CALL_GAP := 5.0
const SAY_FOR := 1.8
## (defs.ts MSG.foe)
const FOE := Color("#ff8a3a")
## (render/act1_fx/unfinished.ts UF_FUSED_CLIPS: its pictures while it is one with the wall)
const FUSED := {"stand": "fusedStand", "reel": "fusedReel"}

var _clock := 0.0
var _last_call := -1000.0


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## Is it still one with the wall? (Monster.form 0)
func in_wall() -> bool:
	return int(a1.get("form", 1)) == 0


## An act's move, whether made in the wall or free ("slam", "hurl", "stomp", "rockslide", "tear").
static func move_of(a: Dictionary) -> String:
	return str(a["id"]).trim_prefix("unfinished:").trim_suffix("Wall")


static func wall_act(a: Dictionary) -> bool:
	return str(a["id"]).ends_with("Wall")


## (spawned: where its floor has it, its back in the wall: one with it, facing out; anywhere else, free from the first)
func spawned(m) -> void:
	var g := BG.of(m.mgr.map.depth if m.mgr != null and m.mgr.map != null else 0)
	var p = g.get("perch")
	if p != null and m.world.distance_to(Vector2(p["x"], p["y"])) < 0.2:
		a1 = {"form": 0, "bfx": float(p["fx"]), "bfy": float(p["fy"]), "hx": m.world.x, "hy": m.world.y}
		m.face = Vector2(p["fx"], p["fy"])
	else:
		a1 = {"form": 1, "bfx": m.face.x, "bfy": m.face.y}


## Turned toward the hero; in the wall, no further than its picture there allows.
func _turn_to_hero(m, hero) -> void:
	var d: Vector2 = hero.world - m.world
	if d.length() < 0.01:
		return
	var ang := atan2(d.y, d.x)
	if in_wall():
		var base := atan2(float(a1["bfy"]), float(a1["bfx"]))
		var off := wrapf(ang - base, -PI, PI)
		ang = base + clampf(off, -float(UF["turn"]), float(UF["turn"]))
	m.face = Vector2(cos(ang), sin(ang))


func can(_m, a: Dictionary, _dist: float, _los: bool) -> bool:
	return wall_act(a) == in_wall()


func forced(m) -> int:
	if in_wall() and m.life < m.max_life * float(UF["freeAt"]):
		return ACTS.size() - 1
	return -1


## Would its rules have it make an act now (as BossRules.pickAct would choose one)?
func _any_ready(m, dist: float, hero) -> bool:
	if forced(m) >= 0:
		return true
	if m._cd > 0.0 or cds.size() != ACTS.size() or not hero.alive:
		return false
	var los: bool = dist < 16.0 and m.mgr.sees(m.world, hero.world)
	for i in ACTS.size():
		var a: Dictionary = ACTS[i]
		if not a.get("forced", false) and cds[i] <= 0.0 and dist >= float(a["near"]) and dist <= float(a["far"]) and can(m, a, dist, los) and los:
			return true
	return false


func tick(m, dt: float, dist: float, hero) -> bool:
	_clock += dt
	# FREE, it goes as the bosses go; IN THE WALL it stands where it is, turning only as far as the wall lets it, until one of its
	# acts is to be made (then the runner makes it)
	if not in_wall():
		return false
	# (nothing moves it from the wall: bodies kept apart, and out of the hero, by moving them; it is put back)
	var held := Vector2(a1["hx"], a1["hy"])
	if m.world != held:
		m.world = held
	if m.state == "act":
		return false
	# (never set off: the wall holds it)
	if mode != "stand":
		mode = "stand"
	if cds.size() != ACTS.size():
		cds = []
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	if _any_ready(m, dist, hero):
		return false
	m.state = "chase"
	gt += dt
	for k in cds.size():
		cds[k] -= dt
	_turn_to_hero(m, hero)
	return true


func start(m, a: Dictionary, hero) -> void:
	# (in the wall, turned no further than the wall lets it; and its left as its picture then has it)
	if in_wall():
		_turn_to_hero(m, hero)
		act["hand"] = hand_of(GAIT["trueBack"], m.face)
	var mv := move_of(a)
	if mv == "tear":
		sound(m, "boss_roar", 1.0)
		if m.mgr.loot != null:
			m.mgr.loot.say("%s tears itself free of the wall" % m.title, FOE)
	elif mv == "rockslide":
		sound(m, "boss_roar", 0.6)
		# (the boulders roll along the floor's y, or its x, as they are painted: of the two, the one more across the way to the
		# hero, so that they come across between it and him, not through it)
		var u: Vector2 = hero.world - m.world
		act["a"] = 1 if absf(u.x) > absf(u.y) else 0
	elif mv == "stomp":
		# (its ring of warning on the floor, while its knee is up: unfinished_marks.gd)
		peril(m, "unfinished:stomp", m.world, {"dur": 1e9})
	# (THE BOSSES CALL OUT THEIR BIG MOVES: the line over it)
	if CALLS.has(a["id"]) and _clock - _last_call >= CALL_GAP:
		_last_call = _clock
		m.call_line(CALLS[a["id"]], SAY_FOR)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var h: Vector2 = hero.world
	match move_of(a):
		"slam":
			if not crossed(t0, t1, a["hit"]):
				return
			# (its fist comes down and skids on: what is within reach of where it goes is struck)
			var S: Dictionary = UF["slam"]
			var r := rel(m, hero)
			var f := Vector2(S["fist"][0], S["fist"][1])
			var s := Vector2(S["skid"][0], S["skid"][1])
			var k := clamp01((r - f).dot(s - f) / (s - f).length_squared())
			if r.distance_to(f + (s - f) * k) <= float(S["r"]) + HERO_R * 0.5:
				blow(m, hero, a["dmg"])
				knock(hero, beside(m.world, m.face, act["hand"], f.x, f.y), 0.7)
			hero.kick(4.0)
			sound(m, "slam", 0.8)
		"stomp":
			if not crossed(t0, t1, a["hit"]):
				return
			var S: Dictionary = UF["stomp"]
			var c := beside(m.world, m.face, act["hand"], S["at"][0], S["at"][1])
			if h.distance_to(c) <= float(S["r"]) + HERO_R * 0.5:
				blow(m, hero, a["dmg"])
				knock(hero, c, 1.0)
			peril(m, "unfinished:cracks", c, {"dur": S["cracks"]})
			hero.kick(7.0)
			sound(m, "slam", 1.0)
		"hurl":
			var H: Dictionary = UF["hurl"]
			if crossed(t0, t1, H["tear"]):
				# (the block torn up out of the floor before it)
				hero.kick(2.0)
				sound(m, "slam", 0.4)
			if crossed(t0, t1, H["aim"]):
				# (where it will come down: its shadow is there from now)
				var to := _aim_of(m, hero)
				var from := beside(m.world, m.face, act["hand"], H["from"][0], H["from"][1])
				var lands: float = float(a["hit"]) - float(H["aim"]) + block_fly(to.distance_to(from))
				peril(m, "unfinished:block", to, {"t": 0.0, "hit": lands, "dur": lands + float(H["lies"]), "dmg": m._roll() * float(a["dmg"]), "a": from.x, "b": from.y, "c": float(a["hit"]) - float(H["aim"]), "d": 0})
			if crossed(t0, t1, a["hit"]):
				sound(m, "swing", 1.0)
		"rockslide":
			var S: Dictionary = UF["slide"]
			var way := Vector2(0, 1) if int(act["a"]) == 1 else Vector2(1, 0)
			for w in 2:
				var T: float = S["laid"][w]
				if crossed(t0, t1, T):
					_lay_lanes(m, hero, w, way, float(S["hits"][w]) - T, m._roll() * float(a["dmg"]))
			for T in S["hits"]:
				if crossed(t0, t1, T):
					hero.kick(6.0)
					sound(m, "slam", 1.0)
		"tear":
			if not crossed(t0, t1, a["hit"]):
				return
			# (it rips free with a lunge: the wall's stone breaks away behind it, and what is before it is thrown back)
			var r := rel(m, hero)
			if r.length() <= float(UF["tear"]["r"]) and r.x > -0.5:
				blow(m, hero, a["dmg"])
				knock(hero, m.world, 1.0)
			m._tell({"t": "burst", "x": m.world.x, "y": m.world.y, "r": UF["tear"]["r"], "el": "phys", "style": "shock"})
			hero.kick(8.0)
			sound(m, "explode", 0.9)


func end(_m, a: Dictionary, _hero) -> void:
	if move_of(a) != "tear":
		return
	# (free: and its moves cooling as they were in the wall)
	a1["form"] = 1
	for i in ACTS.size():
		if not wall_act(ACTS[i]):
			continue
		var want: String = str(ACTS[i]["id"]).trim_suffix("Wall")
		for j in ACTS.size():
			if ACTS[j]["id"] == want:
				cds[j] = cds[i]


## (died) What it threw and sent rolling is done with: its blocks crumble, its boulders break, what was coming does not come.
func died(m) -> void:
	for p in m.mgr.perils.list:
		if p["kind"] != "a1" or p.get("src") != m or not str(p["a1"]).begins_with("unfinished:"):
			continue
		if p["a1"] == "unfinished:block":
			p["dur"] = minf(float(p["dur"]), float(p["t"]) + float(UF["hurl"]["crumble"])) if int(p["done"]) != 0 else float(p["t"])
		elif p["a1"] == "unfinished:lane":
			if float(p["t"]) < float(p["hit"]):
				p["dur"] = p["t"]
			elif int(p["done"]) != 2:
				p["done"] = 2
				p["hit"] = p["t"]
				p["dur"] = float(p["t"]) + float(UF["slide"]["burst"])


## (render/act1_fx/unfinished.ts sprite) STILL ONE WITH THE WALL: its stand there, and struck there (its moves there are its acts'
## own pictures), from in front only.
func shown(m) -> Dictionary:
	if not in_wall() or m.state == "act" or m.dead:
		return {}
	if not m.art.has(FUSED["stand"]):
		return {}
	if m.frozen_t > 0.0:
		return {"list": FUSED["stand"], "i": 0}
	if m.art.has(FUSED["reel"]) and m.struck_t < m.art.length(FUSED["reel"]):
		return {"list": FUSED["reel"], "i": floori(m.struck_t * m.art.fps(FUSED["reel"]))}
	var n: int = m.art.count(0, FUSED["stand"])
	return {"list": FUSED["stand"], "i": floori(m._anim_t * m.art.fps(FUSED["stand"])) % n}


# --- its sums (game/act1_rules/unfinished.ts) ---

## blockFly: how long a hurled block is in the air, thrown `d` tiles.
static func block_fly(d: float) -> float:
	return 0.5 + 0.04 * d


## aimOf: where the block it holds will come down: where the hero stands, as near and far as it can throw, as far round as it
## turns, on the floor.
func _aim_of(m, hero) -> Vector2:
	var H: Dictionary = UF["hurl"]
	var d: Vector2 = hero.world - m.world
	var face := atan2(m.face.y, m.face.x)
	var ang := face + clampf(wrapf(atan2(d.y, d.x) - face, -PI, PI), -float(H["wide"]), float(H["wide"]))
	var far := clampf(d.length(), float(H["least"]), float(H["most"]))
	# (short of a wall: brought back toward it till it is on the floor)
	while far > float(H["least"]) and not _walk_at(m, m.world + Vector2(cos(ang), sin(ang)) * far):
		far -= 0.25
	return m.world + Vector2(cos(ang), sin(ang)) * far


static func _walk_at(m, p: Vector2) -> bool:
	return m.mgr.map.walkable(floori(p.x), floori(p.y))


## layLanes: THE ROCKSLIDE'S LANES of one wave, laid along `way` on the floor, each its boulder coming down `at` seconds from now.
func _lay_lanes(m, hero, wave: int, way: Vector2, at: float, dmg: float) -> void:
	var S: Dictionary = UF["slide"]
	var e := Vector2(-way.y, way.x)
	for k in S["waves"][wave]:
		var p: Vector2 = hero.world + e * (float(k) * float(S["apart"]))
		# (no lane through the Unfinished itself)
		if absf((m.world - p).dot(e)) < float(S["clear"]):
			continue
		# (a lane whose middle is not on the floor is looked for a little up and down its way)
		if not _walk_at(m, p):
			var found := false
			var s := 0.5
			while s <= 8.0 and not found:
				for sg in [-1.0, 1.0]:
					if _walk_at(m, p + way * s * sg):
						p += way * s * sg
						found = true
						break
				s += 0.5
			if not found:
				continue
		# (from the cliff's foot up its way, to where the floor ends down it)
		var back := 0.0
		while back < float(S["back"]) and _walk_at(m, p - way * (back + 0.25)):
			back += 0.25
		var st := p - way * back
		var long := 0.0
		while long < float(S["far"]) and _walk_at(m, st + way * (long + 0.25)):
			long += 0.25
		if long < 3.0:
			continue
		peril(m, "unfinished:lane", st, {"fx": way.x, "fy": way.y, "t": 0.0, "hit": at, "dur": at + long / float(S["speed"]) + float(S["drop"]) + 1.0, "dmg": dmg, "a": st.x, "b": st.y, "c": long, "d": 0.0})
