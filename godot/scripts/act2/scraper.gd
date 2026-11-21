## FLOOR 13'S DOUBLE BOSS, ITS FIRST HALF: THE SCRAPER (the Millrace; its floor "The Pulping Floor"), as the game fights it (game/
## act1_rules/scraper.ts RULES; what the two share, pair.ts). A giant crayfish of sodden pages, about four tiles from its claws to its
## tail fan. It scuttles after the hero (1 tile a second) and makes its three, and its half of their combo:
##   CLAW SNAP (its basic, within 4 tiles; list `attack`, 1 s): a ring closing on where it will snap (3.4 tiles before it, 0.3 to its
##     right); its claw snaps shut at 0.5 s: within 1.15, struck x1.
##   THE SCOUR (every 8 s, the first 4 s in; within 3.7; list `scour`, 2.6 s): the fan before it marked (4 tiles out, 82 degrees either
##     side); its claws slam down at its edges at 1 s and drag in to its middle by 1.5: whoever is in the fan struck x1.4 as a claw
##     comes across him.
##   THE BACKWARD RUSH (every 11 s, the first 8 s in; from 1.2 to 6.5 tiles; list `rush`, 1.9 s): its tail turned on him, the lane
##     behind it marked (7.4 tiles back, 1.3 either side); it shoots back 5 tiles down it from 0.7 to 1.2 s: whoever is in the lane
##     struck x1.3 and thrown aside. Made only where the lane is floor all the way.
##   THE PALIMPSEST, their ultimate (every 30 s, the first 12 s after they wake), five strips in a row and twice as fast: the Quill sent
##     to stand at a strip's far end (9.4 tiles before it, at the hero or as near as the floor lets it); it slams both claws down and
##     scrapes the strip bare (from 3 to 9 tiles before it, 0.85 either side); the Quill swoops down it writing it; it bursts after,
##     from its far end in: whoever is on it as the burst passes struck x2.2 and knocked back.
##   OVERWRITE (every 20 s, the first 16 s in, below 80% of its life): the Quill flies to stand beside it and writes over its wounds:
##     healed 2% of its life a second, 6 s at the longest; it holds its ground meanwhile, striking from where it stands.
## (Its marks on the floor: act2/pair_marks.gd. Its line, the clack of its claws: doors.gd.)
extends "res://scripts/act1/act1.gd"

const QL := preload("res://scripts/act2/quill.gd")
const FOE := Color("#ff8a3a")

## (pair.ts SR_PACE, SR_SNAP, SR_SCOUR, SR_RUSH, RUSH_TILES, SR_STRIP; the marks')
const GAIT := {"pace": 1.0, "cycle": 1.0 / 12.0, "setOff": 0.0, "halt": 0.0, "stopAt": 3.2, "slack": 0.7, "trueBack": true}
const SNAP_HIT := 0.5
const SCOUR := {"long": 2.6, "slam": 1.0, "sweep": [1.0, 1.5]}
const RUSH := {"long": 1.9, "flip": 0.66, "go": 0.7, "stop": 1.2}
const RUSH_TILES := 5.0
const STRIP_SLAM := 1.0
const SNAP_AT := Vector2(3.4, -0.3)
const SNAP_R := 1.15
const SNAP_FOR := 0.9
const SCOUR_REACH := 4.0
const SCOUR_HALF := 82.0
const SCOUR_FOR := 1.8
const RUSH_LANE := 7.4
const RUSH_HALF := 1.3
const RUSH_WAKE_FOR := 1.4
const STRIP_FROM := 3.0
const STRIP_TILES := 6.0
const STRIP_HALF := 0.85
const STRIP_BURST_RUN := 0.35
const STRIP_BURST_AFTER := 0.45
const STRIP_BURST_FOR := 0.5
const STRIP_STAIN_FOR := 1.6
const SWOOP_TILES := 8.0
const WRITE_AHEAD := 1.85
## (PAIR_TUNE.combo, overwrite)
const COMBO := {"every": 30.0, "first": 12.0, "near": 2.5, "far": 8.5, "turn": 0.9, "stand": STRIP_FROM + 0.4 + SWOOP_TILES, "short": 1.5, "start": 0.9, "dmg": 2.2, "wait": 6.0, "times": 5, "rate": 2.0}
const OVERWRITE := {"every": 20.0, "first": 16.0, "below": 0.8, "heal": 0.02, "most": 6.0}
const ROOM := 0.42
## (SR_ACTS)
const ACTS := [
	{"id": "scraper:snap", "clip": "attack", "long": 1.0, "hit": SNAP_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.55, "near": 0.0, "far": 3.4 + 0.6},
	{"id": "scraper:rush", "clip": "rush", "long": 1.9, "hit": 0.7, "dmg": 1.3, "cooldown": 11.0, "first": 8.0, "after": 0.6, "near": 1.2, "far": 6.5},
	{"id": "scraper:scour", "clip": "scour", "long": 2.6, "hit": 1.0, "dmg": 1.4, "cooldown": 8.0, "first": 4.0, "after": 0.7, "near": 0.0, "far": SCOUR_REACH - 0.3},
	{"id": "scraper:strip", "clip": "strip", "long": 2.6, "hit": STRIP_SLAM, "dmg": 2.2, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 99.0, "forced": true},
]
const I_SNAP := 0
const I_RUSH := 1
const I_SCOUR := 2
const I_STRIP := 3


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(_m) -> void:
	a1 = {"combo": COMBO["first"], "heal": OVERWRITE["first"], "ult": 0, "round": 0, "plan": 0, "ux": 1.0, "uy": 0.0, "waited": 0.0, "written": 0}


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


# --- what the pair share (pair.ts) ---

## partnerOf: the other of the pair, alive: the Quill for the Scraper, the Scraper for the Quill; null if it has fallen.
static func partner_of(m):
	var want := "quill" if m.kind == "scraper" else ("scraper" if m.kind == "quill" else "")
	if want == "":
		return null
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o != m and o.kind == want and o.pack_id == m.pack_id:
			return o
	return null


## free: awake, not acting, not frozen or stunned, not waiting on its line.
static func is_free(m) -> bool:
	return not m.dead and m.state != "sleep" and m.state != "act" and m.state != "rise" and not m.waits and m.frozen_t <= 0.0 and m.stun_t <= 0.0


## ahead: a point `f` tiles ahead of `at` along `u` and `s` to its left (the art's left: (uy, -ux)).
static func ahead(at: Vector2, u: Vector2, f: float, s := 0.0) -> Vector2:
	return Vector2(at.x + u.x * f + u.y * s, at.y + u.y * f - u.x * s)


## relOf: where `p` is from `at` facing `u`: how far ahead, and how far to the art's left.
static func rel_of(at: Vector2, u: Vector2, p: Vector2) -> Vector2:
	var d := p - at
	return Vector2(d.x * u.x + d.y * u.y, d.x * u.y - d.y * u.x)


## writtenAt: how much of the strip the Quill's nib has written, from its far end (0 to 1), `t` seconds into its swoop.
static func written_at(t: float) -> float:
	return clampf((t - float(QL.SWOOP["go"])) / (float(QL.SWOOP["stop"]) - float(QL.SWOOP["go"])), 0.0, 1.0)


## burstReaches: when the strip's burst reaches `f` tiles before the Scraper, seconds after it began to burst.
static func burst_reaches(f: float) -> float:
	var far := STRIP_FROM + STRIP_TILES
	var u := clampf((far - f) / STRIP_TILES, 0.0, 1.0)
	var lo := 0.0
	var hi := 1.0
	for _i in 24:
		var mid := (lo + hi) / 2.0
		if mid * mid * (3.0 - 2.0 * mid) < u:
			lo = mid
		else:
			hi = mid
	return ((lo + hi) / 2.0) * STRIP_BURST_RUN


# --- the Scraper ---

## Is the floor walkable all the way from `from` to `to` tiles along `u` from `at`, every quarter tile, with room for a body where
## `room` is given?
static func clear_along(m, at: Vector2, u: Vector2, from: float, to: float, room := 0.0) -> bool:
	var d := minf(from, to)
	while d <= maxf(from, to) + 1e-6:
		var p := at + u * d
		if room > 0.0:
			if not m.mgr.clear(p.x, p.y, room):
				return false
		elif not m.mgr.map.walkable(floori(p.x), floori(p.y)):
			return false
		d += 0.25
	return true


## comboLine: the Palimpsest's line, if the floor lets them make it now: {ux, uy, stand}; {} nowhere.
func combo_line(m, hero, any := false) -> Dictionary:
	var d: float = hero.world.distance_to(m.world)
	if not any and (d < float(COMBO["near"]) or d > float(COMBO["far"])):
		return {}
	var a0: float = (hero.world - m.world).angle()
	var steps := roundi(float(COMBO["turn"]) / 0.15)
	var angles: Array = []
	for n in steps + 1:
		for sgn in ([1.0] if n == 0 else [1.0, -1.0]):
			angles.append(sgn * n * 0.15)
	for da in angles:
		if absf(sin(da)) * d > STRIP_HALF * 0.8:
			continue
		var u := Vector2(cos(a0 + da), sin(a0 + da))
		if not clear_along(m, m.world, u, STRIP_FROM, STRIP_FROM + STRIP_TILES):
			continue
		var near := ahead(m.world, u, float(COMBO["stand"]) - SWOOP_TILES)
		if not m.mgr.clear(near.x, near.y, ROOM):
			continue
		var stand: float = COMBO["stand"]
		while stand >= float(COMBO["stand"]) - float(COMBO["short"]) - 1e-6:
			var far := ahead(m.world, u, stand)
			if m.mgr.clear(far.x, far.y, ROOM):
				return {"ux": u.x, "uy": u.y, "stand": stand}
			stand -= 0.25
	for da in angles:
		var u := Vector2(cos(a0 + da), sin(a0 + da))
		if not clear_along(m, m.world, u, STRIP_FROM, STRIP_FROM + STRIP_TILES):
			continue
		if not clear_along(m, m.world, u, STRIP_FROM + 0.4, COMBO["stand"], ROOM):
			continue
		return {"ux": u.x, "uy": u.y, "stand": COMBO["stand"]}
	return {}


## The Quill's half of the combo is to begin: the Scraper's strip `combo.start` in.
func swoop_due() -> bool:
	return act != null and acts()[act["i"]]["id"] == "scraper:strip" and float(act["t"]) >= float(COMBO["start"])


## It holds its ground now (the ultimate under way, or written over by the Quill): it goes nowhere.
func holds() -> bool:
	return int(a1["ult"]) == 1 or int(a1["plan"]) != 0 or int(a1["written"]) == 1


## strikeInPlace: holding its ground, the biggest ready that he is in reach of, but the rush.
func strike_in_place(m, hero, dist: float) -> bool:
	if m._cd > 0.0 or not m.mgr.sees(m.world, hero.world):
		return false
	for i in [I_SCOUR, I_SNAP]:
		var a: Dictionary = ACTS[i]
		if (i < cds.size() and cds[i] > 0.0) or dist < float(a["near"]) or dist > float(a["far"]):
			continue
		start_act(m, ACTS, i, hero)
		return true
	return false


## inBox: is the hero within the box `f0` to `f1` ahead of `at` along `u`, `half` either side?
static func in_box(hero, at: Vector2, u: Vector2, f0: float, f1: float, half: float) -> bool:
	var r := rel_of(at, u, hero.world)
	var e := HERO_R * 0.5
	return r.x >= minf(f0, f1) - e and r.x <= maxf(f0, f1) + e and absf(r.y) <= half + e


func tick(m, dt: float, dist: float, hero) -> bool:
	if cds.size() != ACTS.size():
		cds = []
		for a in ACTS:
			cds.append(float(a["first"]) * randf_range(0.7, 1.2))
	var q = partner_of(m)
	a1["combo"] = float(a1["combo"]) - dt
	a1["heal"] = float(a1["heal"]) - dt
	if q == null:
		a1["plan"] = 0
		a1["written"] = 0
		a1["ult"] = 0
	var qk = q.h2.a1 if q != null and q.h2 != null else null
	# THE ULTIMATE BETWEEN TWO STRIPS: a strip made (or broken off), the next once the Quill is down from its swoop; the last made,
	# it is over
	var stripping: bool = act != null and ACTS[act["i"]]["id"] == "scraper:strip"
	if int(a1["ult"]) == 1 and int(a1["plan"]) == 0 and not stripping:
		if int(a1["round"]) < int(COMBO["times"]):
			a1["plan"] = 2
			a1["waited"] = 0.0
		else:
			a1["ult"] = 0
	if int(a1["plan"]) == 2:
		var ready: bool = q != null and qk != null and (int(qk["mode"]) == QL.MODE["between"] or (int(qk["mode"]) == QL.MODE["free"] and is_free(q)))
		var line := combo_line(m, hero, true) if ready else {}
		if q != null and not line.is_empty():
			plan_strip(m, q, line)
		elif q == null or not (q.h2.act != null and q.h2.acts()[q.h2.act["i"]]["id"] == "quill:swoop"):
			a1["waited"] = float(a1["waited"]) + dt
			if float(a1["waited"]) > float(COMBO["wait"]):
				a1["plan"] = 0
				a1["ult"] = 0
				if qk != null:
					qk["mode"] = QL.MODE["free"]
	# A STRIP UNDER WAY: it waits for the Quill to come down at the strip's far end, then makes its strip along the line
	if int(a1["plan"]) == 1 and m.state != "act":
		a1["waited"] = float(a1["waited"]) + dt
		if q == null or qk == null or float(a1["waited"]) > float(COMBO["wait"]):
			a1["plan"] = 0
			a1["ult"] = 0
			if qk != null:
				qk["mode"] = QL.MODE["free"]
		elif int(qk["mode"]) == QL.MODE["waiting"] or (int(a1["ult"]) == 1 and int(qk["what"]) == 3 and q.h2.act != null and q.h2.acts()[q.h2.act["i"]]["id"] == "quill:land"):
			start_act(m, ACTS, I_STRIP, hero)
			return true
	# THE PAIR'S MOMENTS, made by the Scraper: their ultimate, or the Quill sent to write over it
	if q != null and qk != null and is_free(m) and int(a1["plan"]) == 0 and int(a1["ult"]) == 0 and int(a1["written"]) == 0 and int(qk["mode"]) == QL.MODE["free"] and is_free(q):
		if float(a1["combo"]) <= 0.0:
			var line := combo_line(m, hero)
			if not line.is_empty():
				a1["ult"] = 1
				a1["round"] = 0
				a1["combo"] = COMBO["every"]
				plan_strip(m, q, line)
				m.mgr.loot.say("%s and %s make their Palimpsest" % [m.title, ("the " + q.title.substr(4)) if q.title.begins_with("The ") else q.title], FOE)
				m.mgr.voice("scraper_roar", 0.0, linear_to_db(0.6))
			else:
				a1["combo"] = 2.0
		elif float(a1["heal"]) <= 0.0 and m.life < m.max_life * float(OVERWRITE["below"]):
			# (the Quill flies to stand beside it, facing it, and writes over its wounds)
			var side := write_spot(m, q)
			if not side.is_empty():
				a1["heal"] = OVERWRITE["every"]
				send_quill(q, side["at"], side["face"], 2, m)
				m.mgr.loot.say("%s comes to write over %s's wounds" % [q.title, ("the " + m.title.substr(4)) if m.title.begins_with("The ") else m.title], FOE)
			else:
				a1["heal"] = 2.0
	# HOLDING ITS GROUND: it strikes from where it stands, and goes nowhere
	if holds() and m.state != "act":
		m.state = "chase"
		if mode != "stand":
			_to("stand")
		gt += dt
		if dist > 0.01 and int(a1["plan"]) != 1:
			m.face = (hero.world - m.world) / dist
		if int(a1["ult"]) == 0:
			strike_in_place(m, hero, dist)
		return true
	return false


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	if a["id"] == "scraper:rush":
		if holds():
			return false
		var hero = m.mgr.hero
		var d: float = maxf(hero.world.distance_to(m.world), 1e-6)
		return clear_along(m, m.world, (hero.world - m.world) / d, 0.25, RUSH_TILES, ROOM)
	return true


func start(m, a: Dictionary, hero) -> void:
	act["a"] = 0
	act["b"] = 0
	if a["id"] == "scraper:rush":
		# (its tail on him: it faces away from him, and goes back toward him)
		var d: float = hero.world.distance_to(m.world)
		m.face = -(hero.world - m.world) / d if d > 0.01 else -m.face
		act["x"] = m.world.x
		act["y"] = m.world.y
		sound(m, "gust", 0.4)
		peril(m, "scraper:aim", m.world, {"dur": RUSH["go"], "c": I_RUSH})
	elif a["id"] == "scraper:strip":
		m.face = Vector2(a1["ux"], a1["uy"])
		act["x"] = m.world.x
		act["y"] = m.world.y
		act["rate"] = COMBO["rate"]
		a1["round"] = int(a1["round"]) + 1
		peril(m, "scraper:aim", m.world, {"dur": STRIP_SLAM / float(COMBO["rate"]), "c": I_STRIP})
	elif a["id"] == "scraper:snap":
		peril(m, "scraper:aim", m.world, {"dur": SNAP_HIT, "c": I_SNAP})
	elif a["id"] == "scraper:scour":
		peril(m, "scraper:aim", m.world, {"dur": SCOUR["slam"], "c": I_SCOUR})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match a["id"]:
		"scraper:snap":
			if not crossed(t0, t1, float(a["hit"])):
				return
			# THE SNAP: whoever is in its mark is struck
			var c := ahead(m.world, m.face, SNAP_AT.x, SNAP_AT.y)
			if open_to(hero) and hero.world.distance_to(c) <= SNAP_R + HERO_R * 0.5:
				blow(m, hero, float(a["dmg"]))
			peril(m, "scraper:snap", m.world, {"dur": SNAP_FOR})
			hero.kick(3.0)
			sound(m, "slam", 0.7)
		"scraper:scour":
			if crossed(t0, t1, float(SCOUR["slam"])):
				peril(m, "scraper:scour", m.world, {"dur": SCOUR_FOR})
				hero.kick(4.0)
				sound(m, "slam", 0.9)
			if t1 < float(SCOUR["sweep"][0]) or int(act["a"]) != 0:
				return
			# THE SWEEP: its claws come in from the fan's edges to its middle; whoever is in the fan struck as a claw comes across him
			var r := rel_of(m.world, m.face, hero.world)
			if r.length() > SCOUR_REACH + HERO_R * 0.5:
				return
			var half := deg_to_rad(SCOUR_HALF)
			var angle := absf(atan2(r.y, r.x))
			if angle > half + 0.05:
				return
			var claw := half * (1.0 - _sm((t1 - float(SCOUR["sweep"][0])) / (float(SCOUR["sweep"][1]) - float(SCOUR["sweep"][0]))))
			if angle + 0.02 >= claw and open_to(hero):
				act["a"] = 1
				blow(m, hero, float(a["dmg"]))
				sound(m, "hit", 0.5)
		"scraper:rush":
			if crossed(t0, t1, float(RUSH["flip"])):
				sound(m, "swing", 1.0)
			var from := Vector2(act["x"], act["y"])
			if crossed(t0, t1, float(RUSH["go"])):
				peril(m, "scraper:rush", from, {"dur": RUSH_WAKE_FOR + 0.5, "a": RUSH_TILES})
			if t1 <= float(RUSH["go"]) or t0 >= float(RUSH["stop"]):
				return
			# CARRIED BACK down its lane, as its picture shoots back
			var b := func(t: float) -> float: return RUSH_TILES * _sm((minf(t, RUSH["stop"]) - float(RUSH["go"])) / (float(RUSH["stop"]) - float(RUSH["go"])))
			var step: float = b.call(t1) - b.call(maxf(t0, RUSH["go"]))
			var to: Vector2 = m.world - m.face * step
			if m.mgr.clear(to.x, to.y, ROOM):
				m.world = to
			# WHOEVER IS IN ITS LANE as it goes is struck, and thrown aside
			if int(act["a"]) == 0 and open_to(hero) and in_box(hero, from, -m.face, 0.0, RUSH_LANE, RUSH_HALF):
				act["a"] = 1
				blow(m, hero, float(a["dmg"]))
				var r := rel_of(from, m.face, hero.world)
				var side := ahead(hero.world, m.face, 0.0, -1.0 if r.y >= 0.0 else 1.0)
				knock(hero, side, 0.9)
				hero.kick(4.0)
		"scraper:strip":
			if not crossed(t0, t1, STRIP_SLAM):
				return
			# THE STRIP, scraped bare before it: it lies for the Quill to write, and bursts after it
			a1["plan"] = 0
			peril(m, "scraper:strip", Vector2(act["x"], act["y"]), {"dur": 30.0, "dmg": m._roll() * float(a["dmg"]), "a": 0.0, "b": 0.0, "c": 0.0, "d": 0, "hit": 0, "done": 0})
			hero.kick(5.0)
			sound(m, "slam", 1.0)


func end(_m, a: Dictionary, _hero) -> void:
	if a["id"] == "scraper:strip":
		a1["plan"] = 0


## (what it scraped lies and fades without bursting)
func died(m) -> void:
	for p in m.mgr.perils.list:
		if p.get("kind") != "a1" or p.get("src") != m or p.get("a1") != "scraper:strip" or int(p["done"]) != 0:
			continue
		p["done"] = 2
		p["c"] = p["t"]
		p["dur"] = minf(float(p["dur"]), float(p["t"]) + 1.2)


## One of the ultimate's strips planned along `line`: the Quill sent to its far end, to stand there facing back down it.
func plan_strip(m, q, line: Dictionary) -> void:
	a1["plan"] = 1
	a1["waited"] = 0.0
	a1["ux"] = line["ux"]
	a1["uy"] = line["uy"]
	var u := Vector2(line["ux"], line["uy"])
	send_quill(q, ahead(m.world, u, line["stand"]), -u, 3)
	# (its swoop carries it down to short of the Scraper's claws: so much less, standing nearer)
	q.h2.a1["carry"] = SWOOP_TILES - (float(COMBO["stand"]) - float(line["stand"]))


## writeSpot: where the Quill stands to write over the Scraper: beside it, on the side nearer the Quill if it can, facing it.
static func write_spot(m, q) -> Dictionary:
	var a0: float = (q.world - m.world).angle()
	for da in [0.0, 0.6, -0.6, 1.2, -1.2, PI]:
		var p: Vector2 = m.world + Vector2(cos(a0 + da), sin(a0 + da)) * WRITE_AHEAD
		if not m.mgr.clear(p.x, p.y, 0.35):
			continue
		return {"at": p, "face": (m.world - p) / WRITE_AHEAD}
	return {}


## sendQuill: it flies to `at` and lands there facing `face`, to do `what` (2 write over the Scraper, 3 wait at the strip's far end);
## sent to write over the Scraper `by`, where it is going kept from the Scraper, that it follows it as it flies.
static func send_quill(q, at: Vector2, face: Vector2, what: int, by = null) -> void:
	var k: Dictionary = q.h2.a1
	k["mode"] = QL.MODE["going"]
	k["what"] = what
	k["tx"] = at.x
	k["ty"] = at.y
	k["tfx"] = face.x
	k["tfy"] = face.y
	k["ox"] = at.x - by.world.x if by != null else 0.0
	k["oy"] = at.y - by.world.y if by != null else 0.0
