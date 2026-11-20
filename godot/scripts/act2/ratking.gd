## FLOOR 12'S BOSS, THE RAT KING (the Undercity; his floor "The King's Cistern"), as the game fights him with his fight done the
## action way (game/act1_rules/ratking.ts ACTION: RATKING_ACTION on; art/ratking_action.ts, ratking_action_fx.ts). His doc: "A knot of
## rats tied at the tails, swollen on jars it broke into, squeaking in a hundred stolen voices." His fix of 2 Nov 2026, 07:32: "The
## sluice gates should just open periodically in the rat king fight, I don't think it needs to be one of his moves.  Just an arena
## hazard."; in its place, by 07:36, "His roll, back and bigger (Recommended)".
##   HIS SCUTTLE: 1.2 tiles a second; 1.9 tiles off, and 0.5 nearer.
##   THE BITE (his basic, within 3.1 tiles; list `attack`, 2.2 s): the front rats reared and held, the wedge marked (130 degrees,
##     0.6 to 3.4 tiles); they leap out and snap shut at 0.967 s: a hero in the wedge bitten x1.
##   STOLEN WORDS (from 2.2 to 12 tiles; every 6 s, the first 3 s in; list `words`, 2.6 s): a word of the hero's own (Flame, Frost,
##     Lightning or Poison, if he carries one; else any of them) gathers, its line following him until 1 s, then LOCKED; spat at
##     1.367 s down it at 14 tiles a second, bursting on whoever it meets (0.7) or where it ends (2 round): x0.9, that word's harm.
##   THE ROLL (from 3 tiles to where it stops; every 9 s, the first 5 s in; list `roll`, 3.2 s): curled into a ball and held, his lane
##     marked; off the line at 1.367 s, barrelling down it (to a wall), skidding to a stop at 2.2 s and BURSTING OPEN: a hero the ball
##     passes over (1.2 to either side) struck x1.4 once and thrown aside; at the burst, within 2.2, struck x0.84.
##   UNKNOT (every 13 s, the first 7 s in; list `unknot`, 3.55 s): swollen and held; THEY BURST OUTWARD at 1.067 s: within 2.6, struck
##     x0.7; gone into the cracks (out of reach), the swarm streams past the hero (1.5 to either side, biting x0.35 every 0.25 s) and
##     they knot again on his far side (list `knot`).
##   THE SLUICES, his cistern's own: every 14 s of his fight, the first 9 s in, its lanes marked, the gates grinding open, then the
##     flood down every lane from the gates to the drain: a hero in a lane as its front passes struck (x0.6, frost); then carried with
##     the water (5 tiles a second) while in it, struck x0.3 every 0.5 s. The dry ledges between stay dry; he is not struck by it.
extends "res://scripts/act1/act1.gd"

const FloorMap := preload("res://scripts/floor_map.gd")
const GAIT := {"pace": 1.2, "cycle": 0.25, "setOff": 0.0, "halt": 0.0, "stopAt": 1.9, "slack": 0.5, "trueBack": true}
## (art/ratking_action.ts BITE9, ROLL9, WORDS9, UNKNOT9; their hits)
const BITE9 := {"mark": 3.0 / 30.0, "rear": 12.0 / 30.0, "hit": 29.0 / 30.0, "long": 66.0 / 30.0, "near": 0.6, "reach": 3.4, "arc": 130.0}
const ROLL9 := {"mark": 3.0 / 30.0, "curl": 15.0 / 30.0, "rocked": 24.0 / 30.0, "hit": 41.0 / 30.0, "strike": [39.0 / 30.0, 41.0 / 30.0], "back": 0.5, "burst": 2.2,
	"pace": 13.0, "brake": 60.0 / 30.0, "stop": 66.0 / 30.0, "long": 96.0 / 30.0, "half": 1.2, "endR": 2.2}
const WORDS9 := {"aim": 6.0 / 30.0, "lock": 30.0 / 30.0, "hit": 41.0 / 30.0, "long": 78.0 / 30.0, "speed": 14.0, "reach": 12.0, "r": 0.7, "burst": 2.0, "burstFor": 0.7}
const UNKNOT9 := {"hit": 32.0 / 30.0, "land": 36.0 / 30.0, "out": 48.0 / 30.0, "ring": 2.6}
## (RK.words, RK.roll.knock, RK.unknot)
const WORDS := {"from": 0.572, "rise": 40.8, "reach": 10.0}
const KNOCK := 1.4
const UNKNOT := {"knot": 0.95, "formed": 0.55, "near": 2.5, "far": 4.5, "apart": 3.5, "room": 1.0, "across": 0.5, "every": 0.25}
## (SWARM9; SLUICES; FLOOD; LANE)
const SWARM9 := {"rats": 36, "for": 1.0, "half": 1.5, "late": 0.3}
const SLUICES := {"mark": 0.0, "gates": 0.6, "burst": 2.0, "every": 14.0, "first": 9.0}
const FLOOD := {"front": 80.0, "stagger": 0.033, "runs": 3.0, "drain": 0.8, "flow": 7.0, "rats": 6.0, "carry": 5.0, "every": 0.5, "gateLift": 0.3}
const LANE := {"w": 3.0, "ledge": 1.75}
## (RK9_ACTS)
const ACTS := [
	{"id": "ratking:bite", "clip": "attack", "long": 66.0 / 30.0, "hit": 29.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 3.4 - 0.3},
	{"id": "ratking:words", "clip": "words", "long": 78.0 / 30.0, "hit": 41.0 / 30.0, "dmg": 0.9, "cooldown": 6.0, "first": 3.0, "after": 0.5, "near": 2.2, "far": 12.0},
	{"id": "ratking:roll", "clip": "roll", "long": 96.0 / 30.0, "hit": 41.0 / 30.0, "dmg": 1.4, "cooldown": 9.0, "first": 5.0, "after": 0.6, "near": 3.0, "far": 0.0},
	{"id": "ratking:unknot", "clip": "unknot", "long": 48.0 / 30.0 + 1.0 + 0.95, "hit": 32.0 / 30.0, "dmg": 0.35, "cooldown": 13.0, "first": 7.0, "after": 0.5, "near": 0.0, "far": 9.0},
]
## The four words he steals (STOLEN), in the art's order.
const STOLEN := ["fire", "frost", "lightning", "poison"]
const FOE := Color("#ff8a3a")

static var _acts9 := []


func gait() -> Dictionary:
	return GAIT


## (his roll's reach is where its run stops: ROLL9_FAR)
func acts() -> Array:
	if _acts9.is_empty():
		_acts9 = ACTS.duplicate(true)
		_acts9[2]["far"] = roll9_along(ROLL9["stop"])
	return _acts9


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## roll9Along: how far the game has carried him along the way he faces, `t` seconds into his roll (tiles).
static func roll9_along(t: float) -> float:
	var s0: float = ROLL9["strike"][0]
	var s1: float = ROLL9["strike"][1]
	var B: float = ROLL9["back"]
	if t <= float(ROLL9["curl"]):
		return 0.0
	if t <= float(ROLL9["rocked"]):
		return -B * _sm((t - float(ROLL9["curl"])) / (float(ROLL9["rocked"]) - float(ROLL9["curl"])))
	if t <= s0:
		return -B
	var go := float(ROLL9["burst"]) - B
	if t <= s1:
		return -B + float(ROLL9["burst"]) * ((t - s0) / (s1 - s0))
	var run := minf(t, ROLL9["brake"]) - s1
	var at := go + float(ROLL9["pace"]) * run
	if t <= float(ROLL9["brake"]):
		return at
	var u := minf(t, ROLL9["stop"]) - float(ROLL9["brake"])
	var L := float(ROLL9["stop"]) - float(ROLL9["brake"])
	return at + float(ROLL9["pace"]) * u - (float(ROLL9["pace"]) * u * u) / (2.0 * L)


## swarm9Span: where the swarm's stream has come along its way (0 to 1), `tau` seconds from when they burst away: back, front.
static func swarm9_span(tau: float) -> Vector2:
	var run := float(SWARM9["for"]) - float(SWARM9["late"])
	return Vector2(clampf((tau - float(SWARM9["late"])) / run, 0.0, 1.0), clampf(tau / (run * 0.75), 0.0, 1.0))


## Is he gone into the cracks now (between unknotting and knotting again: out of reach)?
func unknotted() -> bool:
	return act != null and acts()[act["i"]]["id"] == "ratking:unknot" and float(act["t"]) >= float(UNKNOT9["land"]) and float(act["t"]) < float(UNKNOT9["out"]) + float(SWARM9["for"]) + float(UNKNOT["formed"])


## Is he nowhere to be seen now (his swarm running)?
func swarming() -> bool:
	return act != null and acts()[act["i"]]["id"] == "ratking:unknot" and float(act["t"]) >= float(UNKNOT9["out"]) and float(act["t"]) < float(UNKNOT9["out"]) + float(SWARM9["for"])


func reachable(_m) -> bool:
	return not unknotted()


func spawned(_m) -> void:
	a1 = {"word": 0, "run": 0.0, "sx": 0.0, "sy": 0.0, "bx": 0.0, "by": 0.0, "bit": -1.0, "fight": 0.0}


# --- the sluices (ratking_action_fx.ts lanesFor, sluiceAt, floodSpan, flooded, gateUp) ---

## The lanes across a cistern `across` tiles wide: [{y, half}].
static func lanes_for(across: float) -> Array:
	var n := maxi(1, floori((across - float(LANE["ledge"])) / (float(LANE["w"]) + float(LANE["ledge"]))))
	var ledge := (across - n * float(LANE["w"])) / (n + 1)
	var out: Array = []
	for i in n:
		out.append({"y": -across / 2.0 + ledge * (i + 1) + float(LANE["w"]) * (i + 0.5), "half": float(LANE["w"]) / 2.0})
	return out


static func sluice_at(fight: float):
	if fight < float(SLUICES["first"]):
		return null
	var s := fmod(fight - float(SLUICES["first"]), float(SLUICES["every"]))
	return s if s < float(SLUICES["burst"]) + float(FLOOD["runs"]) + float(FLOOD["drain"]) + 0.3 else null


static func flood_span(m: float, i: int, len: float) -> Vector2:
	var s := m - float(SLUICES["burst"]) - i * float(FLOOD["stagger"])
	if s <= 0.0:
		return Vector2.ZERO
	var front := minf(len, float(FLOOD["front"]) * s)
	var tail := 0.0 if s < float(FLOOD["runs"]) else minf(len, len * (s - float(FLOOD["runs"])) / float(FLOOD["drain"]))
	return Vector2(tail, front)


static func flooded(x: float, y: float, m: float, half: float, lanes: Array) -> bool:
	var i := -1
	for k in lanes.size():
		if absf(y - float(lanes[k]["y"])) < float(lanes[k]["half"]):
			i = k
			break
	if i < 0 or x < -half or x > half:
		return false
	var sp := flood_span(m, i, 2.0 * half)
	var d := x + half
	return sp.y > sp.x and d >= sp.x and d <= sp.y


static func gate_up(m: float, i: int) -> float:
	var s0 := float(SLUICES["gates"]) + i * 0.05
	if m < s0:
		return 0.0
	if m < float(SLUICES["burst"]):
		return float(FLOOD["gateLift"]) * _sm((m - s0) / (float(SLUICES["burst"]) - s0 - 0.1)) + 0.02 * sin(m * 40.0) * (1.0 if m < float(SLUICES["burst"]) - 0.1 else 0.0)
	var s := m - float(SLUICES["burst"]) - i * float(FLOOD["stagger"])
	if s < 2.0 / 30.0:
		return float(FLOOD["gateLift"]) + (1.0 - float(FLOOD["gateLift"])) * clampf(s / (2.0 / 30.0), 0.0, 1.0)
	if s < float(FLOOD["runs"]):
		return 1.0
	return 1.0 - _sm((s - float(FLOOD["runs"])) / 0.35)


## cisternOf: the King's Cistern, from the floor's boss room: the gates on its longer wall, the water running across to the other.
static func cistern_of(m) -> Dictionary:
	for r in m.mgr.map.rooms:
		if str(r.get("kind", "")) == "boss":
			var along_y: bool = int(r["w"]) >= int(r["h"])
			return {"x": float(r["x"]) + float(r["w"]) / 2.0, "y": float(r["y"]) + float(r["h"]) / 2.0, "alongY": along_y,
				"half": (float(r["h"]) if along_y else float(r["w"])) / 2.0, "across": float(r["w"]) if along_y else float(r["h"])}
	return {"x": m.world.x, "y": m.world.y, "alongY": false, "half": 8.0, "across": 16.0}


## A floor point in the cistern's own frame (along the water from the gates at -half, across it), and back.
static func in_cistern(c: Dictionary, x: float, y: float) -> Vector2:
	return Vector2(y - float(c["y"]), x - float(c["x"])) if c["alongY"] else Vector2(x - float(c["x"]), y - float(c["y"]))


static func from_cistern(c: Dictionary, u: float, v: float) -> Vector2:
	return Vector2(float(c["x"]) + v, float(c["y"]) + u) if c["alongY"] else Vector2(float(c["x"]) + u, float(c["y"]) + v)


## (the sluice peril's cistern: `a` half its length, `b` across, `c` 1 along y)
static func cistern_of_peril(p: Dictionary) -> Dictionary:
	return {"x": float(p["x"]), "y": float(p["y"]), "alongY": int(p["c"]) == 1, "half": float(p["a"]), "across": float(p["b"])}


func tick(m, dt: float, _dist: float, _hero) -> bool:
	# THE SLUICES: on the cistern's own clock, from his fight's start (the hero come in and his line said)
	if m.dead:
		return false
	var was := float(a1.get("fight", 0.0))
	a1["fight"] = was + dt
	var s = sluice_at(a1["fight"])
	var before = sluice_at(was)
	if s != null and (before == null or float(s) < float(before)):
		var c := cistern_of(m)
		peril(m, "ratking:sluice", Vector2(c["x"], c["y"]), {"t": s, "hit": 0.0, "dur": float(SLUICES["burst"]) + float(FLOOD["runs"]) + float(FLOOD["drain"]) + 0.3,
			"dmg": m._roll() * 0.6, "el": "frost", "a": c["half"], "b": c["across"], "c": 1 if c["alongY"] else 0, "d": 0})
	return false


# --- his fight ---

## clearFor: how far the floor is clear from `at` along `f` for something of radius `r`, up to `most` tiles.
static func clear_for(m, at: Vector2, f: Vector2, r: float, most: float) -> float:
	var d := 0.0
	var s := 0.3
	while s <= most + 1e-6:
		if not m.mgr.clear(at.x + f.x * s, at.y + f.y * s, r):
			break
		d = s
		s += 0.3
	return d


## flightOf: how far a word flies from `at` along `f`: to the first of what stops a shot, or its reach (RK.words.reach).
static func flight_of(m, at: Vector2, f: Vector2) -> float:
	var d := 0.0
	var s := 0.2
	while s <= float(WORDS["reach"]) + 1e-6:
		if not is_open(m, at + f * s):
			break
		d = s
		s += 0.2
	return d


## wordFrom: where his word flies from now, and its way: toward his aim (act x, y).
func word_from(m) -> Array:
	var o := beside(m.world, m.face, act["hand"], WORDS["from"], 0.0)
	var to := Vector2(act["x"], act["y"]) - o
	return [o, to / to.length() if to.length() > 0.05 else m.face]


## HIS STOLEN WORD: one of the hero's own, if he carries any of the four; else any of them.
static func steal_word(hero) -> int:
	var own: Array = []
	for i in 3:
		for w in hero.loadout.wfronts(i) + hero.loadout.wbehinds(i):
			var k := STOLEN.find(w)
			if k >= 0 and not own.has(k):
				own.append(k)
	return own.pick_random() if not own.is_empty() else randi_range(0, STOLEN.size() - 1)


## harmOf: a stolen word's harm: its element, and the words its blow carries (Poison poisons).
static func harm_of(word: int, words: Array) -> Dictionary:
	var w: String = STOLEN[word] if word >= 0 and word < STOLEN.size() else "fire"
	if w == "poison":
		var ws: Array = words.filter(func(x): return x != "poison")
		ws.append("poison")
		return {"el": "phys", "words": ws}
	return {"el": w, "words": words.duplicate()}


## knotSpot: where they knot again: past the hero, on his far side, 2.5 to 4.5 tiles beyond him, with room for the heap, in his
## ground where the floor has one, in a clear line from where he was and in the hero's sight; failing that, anywhere about far
## enough and clear; failing that, where he was.
func knot_spot(m, hero) -> Vector2:
	var mgr = m.mgr
	var area = mgr.map.area("boss") if mgr.map.has_method("area") else null
	var h: Vector2 = hero.world
	var w0: Vector2 = m.world
	var ok := func(p: Vector2, mine: bool) -> bool:
		return mgr.clear(p.x, p.y, UNKNOT["room"]) and p.distance_to(w0) >= float(UNKNOT["apart"]) and mgr.sees(w0, p) and mgr.sees(h, p) \
			and (not mine or area == null or FloorMap.blob_dist(area["blob"], p) < 0.95)
	var across := func(p: Vector2) -> bool:
		var l: Vector2 = p - w0
		var len := maxf(l.length(), 1e-6)
		return absf((h.x - w0.x) * l.y - (h.y - w0.y) * l.x) / len <= float(UNKNOT["across"])
	var base: float = (h - w0).angle()
	for mine in [true, false]:
		for _tries in 60:
			var a := base + randf_range(-0.7, 0.7)
			var d := randf_range(UNKNOT["near"], UNKNOT["far"])
			var p := h + Vector2(cos(a), sin(a)) * d
			if ok.call(p, mine) and across.call(p):
				return p
	for r in range(4, 12):
		for k in 16:
			var p: Vector2 = w0 + Vector2(cos(k * TAU / 16.0), sin(k * TAU / 16.0)) * r * 0.5
			if ok.call(p, false):
				return p
	return w0


func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if a["id"] != "ratking:roll":
		return true
	var hero = m.mgr.hero
	var f: Vector2 = (hero.world - m.world) / maxf(0.01, dist)
	return clear_for(m, m.world, f, 0.6, 4.0) >= 3.6


func start(m, a: Dictionary, hero) -> void:
	match a["id"]:
		"ratking:bite":
			# (the wedge marked before him: render/act1_fx/ratking.ts ground, as he bites)
			peril(m, "ratking:wedge", m.world, {"dur": float(BITE9["hit"]) + 0.6})
		"ratking:words":
			a1["word"] = steal_word(hero)
			peril(m, "ratking:aim", m.world, {"dur": WORDS9["hit"]})
			var o: Array = word_from(m)
			act["a"] = minf(WORDS9["reach"], flight_of(m, o[0], o[1]) * (float(WORDS9["reach"]) / float(WORDS["reach"])))
			m.mgr.voice("ratking_roar", 0.0, linear_to_db(0.35))
		"ratking:roll":
			act["x"] = m.world.x
			act["y"] = m.world.y
			var far := roll9_along(ROLL9["stop"])
			a1["run"] = clear_for(m, m.world, m.face, 0.6, far + 0.6)
			peril(m, "ratking:roll9", m.world, {"hit": ROLL9["hit"], "dur": float(ROLL9["stop"]) + 0.6, "d": minf(a1["run"], far)})
		"ratking:unknot":
			a1["sx"] = m.world.x
			a1["sy"] = m.world.y
			a1["bit"] = -1.0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var free: bool = open_to(hero)
	match a["id"]:
		"ratking:bite":
			if crossed(t0, t1, BITE9["rear"]):
				m.mgr.voice("ratking_roar", 0.0, linear_to_db(0.3))
			if not crossed(t0, t1, float(a["hit"])):
				return
			var r := rel(m, hero)
			var d := r.length()
			if free and d >= float(BITE9["near"]) - HERO_R and d <= float(BITE9["reach"]) + HERO_R * 0.5 and absf(atan2(r.y, r.x)) <= deg_to_rad(float(BITE9["arc"]) / 2.0):
				blow(m, hero, float(a["dmg"]))
			hero.kick(2.0)
			sound(m, "hit", 0.6)
		"ratking:words":
			if t0 < float(WORDS9["lock"]):
				act["x"] = hero.world.x
				act["y"] = hero.world.y
			var o: Array = word_from(m)
			if t1 < float(a["hit"]):
				act["a"] = minf(WORDS9["reach"], flight_of(m, o[0], o[1]) * (float(WORDS9["reach"]) / float(WORDS["reach"])))
			if not crossed(t0, t1, float(a["hit"])):
				return
			var harm := harm_of(int(a1["word"]), m.words)
			var by: Dictionary = m.blow().duplicate()
			by["el"] = harm["el"]
			by["words"] = harm["words"]
			peril(m, "ratking:word", o[0], {"fx": o[1].x, "fy": o[1].y, "a": act["a"], "b": a1["word"], "c": 0.0, "d": 1, "hit": 1e9, "dur": 1e9,
				"dmg": m._roll() * float(a["dmg"]), "el": harm["el"], "by": by})
			sound(m, "fire", 0.7)
			hero.kick(1.0)
		"ratking:roll":
			if crossed(t0, t1, ROLL9["mark"]):
				m.mgr.voice("ratking_roar", 0.0, linear_to_db(0.5))
			var run := minf(float(a1.get("run", roll9_along(ROLL9["stop"]))), roll9_along(ROLL9["stop"]))
			var c0 := clampf(roll9_along(t0), -float(ROLL9["back"]), run)
			var c1 := clampf(roll9_along(t1), -float(ROLL9["back"]), run)
			var from := Vector2(act["x"], act["y"])
			if t1 > float(ROLL9["curl"]) and t0 < float(ROLL9["stop"]):
				m.world = from + m.face * c1
				if floori(t1 * 4.0) != floori(t0 * 4.0) and t1 > float(ROLL9["hit"]):
					hero.kick(1.0)
			# (run down as the ball comes by: once, thrown aside)
			var b := int(act.get("b", 0))
			if free and (b & 1) == 0 and c1 > c0 and t1 > float(ROLL9["strike"][0]):
				var along: float = (hero.world - from).dot(m.face)
				var aside: float = -(hero.world.x - from.x) * m.face.y + (hero.world.y - from.y) * m.face.x
				if absf(aside) <= float(ROLL9["half"]) + HERO_R * 0.5 and along >= c0 - 0.6 and along <= c1 + 0.6:
					act["b"] = b | 1
					var was: float = hero.life
					blow(m, hero, float(a["dmg"]))
					if hero.life < was:
						var s := 1.0 if aside >= 0.0 else -1.0
						knock(hero, hero.world + Vector2(m.face.y * s * 0.05, -m.face.x * s * 0.05), KNOCK)
			if crossed(t0, t1, ROLL9["stop"]):
				# (he bursts open at its end)
				b = int(act.get("b", 0))
				if free and (b & 2) == 0 and hero.world.distance_to(m.world) <= float(ROLL9["endR"]) + HERO_R * 0.5:
					act["b"] = b | 2
					blow(m, hero, float(a["dmg"]) * 0.6)
					knock(hero, m.world, 0.8)
				hero.kick(3.0)
				sound(m, "slam", 0.7)
		"ratking:unknot":
			if crossed(t0, t1, 0.12):
				m.mgr.voice("ratking_roar", 0.0, linear_to_db(0.45))
			if crossed(t0, t1, UNKNOT9["hit"]):
				# (THEY BURST OUTWARD: whoever is within its ring)
				if free and hero.world.distance_to(m.world) <= float(UNKNOT9["ring"]) + HERO_R * 0.5:
					blow(m, hero, float(a["dmg"]) * 2.0)
				hero.kick(3.0)
				a1["bx"] = m.world.x
				a1["by"] = m.world.y
				peril(m, "ratking:ring", m.world, {"dur": 0.6})
			if crossed(t0, t1, UNKNOT9["out"]):
				a1["sx"] = m.world.x
				a1["sy"] = m.world.y
				m.world = knot_spot(m, hero)
				var to: Vector2 = hero.world - m.world
				if to.length() > 0.01:
					m.face = to.normalized()
				m.mgr.loot.say("%s comes apart into a swarm" % m.title, FOE)
				peril(m, "ratking:swarm", Vector2(a1["sx"], a1["sy"]), {"dur": SWARM9["for"], "a": m.world.x, "b": m.world.y})
			# THE SWARM, twice as wide, as it runs over the hero: it bites, a little, now and then
			var out := float(UNKNOT9["out"])
			if t1 > out and t0 < out + float(SWARM9["for"]) and free:
				var sp := swarm9_span(t1 - out)
				var s0 := Vector2(a1["sx"], a1["sy"])
				var l: Vector2 = m.world - s0
				var len := l.length()
				if len > 0.05:
					var r := from_figure(s0, l / len, 1, hero.world)
					var q := r.x / len
					if q >= sp.x - 0.05 and q <= sp.y + 0.05 and absf(r.y) <= float(SWARM9["half"]) + HERO_R * 0.5 and (float(a1["bit"]) < 0.0 or t1 - float(a1["bit"]) >= float(UNKNOT["every"])):
						a1["bit"] = t1
						blow(m, hero, float(a["dmg"]))
			if crossed(t0, t1, out + float(SWARM9["for"])):
				m.mgr.voice("ratking_roar", 0.0, linear_to_db(0.3))


## (a word of his still in the air goes out with him)
func died(m) -> void:
	for p in m.mgr.perils.list:
		if p.get("kind") == "a1" and p.get("a1") == "ratking:word" and p.get("src") == m and int(p["done"]) == 0:
			p["dur"] = minf(float(p["dur"]), float(p["t"]))


## render/act1_fx/ratking.ts sprite: unknotting, its pictures; while his swarm runs, none of him; knotting again, the knot's.
func shown(m) -> Dictionary:
	if m.dead or act == null or acts()[act["i"]]["id"] != "ratking:unknot":
		return {}
	var t: float = act["t"]
	var out := float(UNKNOT9["out"])
	if t < out:
		return {}
	if t < out + float(SWARM9["for"]):
		return {"hide": true}
	if not m.art.has("knot"):
		return {}
	return {"list": "knot", "i": floori((t - out - float(SWARM9["for"])) * m.art.fps("knot") + 1e-6)}
