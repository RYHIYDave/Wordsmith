## FLOOR 13'S DOUBLE BOSS, ITS SECOND HALF: THE QUILL, as the game fights it (game/act1_rules/quill.ts RULES; pair.ts). A heron of
## pages; it makes no sound at all. It wades after the hero (1.1 tiles a second) and makes its two, and the Scraper's moments:
##   THE NIB STAB (its basic, within 3.2 tiles; list `attack`, 1.3 s): a ring closing where its nib will strike (2.4 tiles before it);
##     at 0.6 s: within 1.05, struck x1.
##   INK LINES (every 9 s, the first 5 s in; from 1 to 5.6 tiles; list `lines`, 2.6 s): three strokes (0.7, 1.02, 1.34 s) each laying a
##     line of ink across the floor before it (1.8, 3.3 and 4.8 tiles out, 5.2 long, a little slanted); each bursts 0.6 s after its
##     stroke: whoever is on it struck x0.9.
##   SENT BY THE SCRAPER: it takes off, flies (9 tiles a second) and lands where it is sent: beside the Scraper to write over its
##     wounds (healing it 2% of its life a second, until it is struck, the Scraper burns, or 6 s), or at a strip's far end, to swoop
##     down it writing it (their Palimpsest: act2/scraper.gd). In the air or skimming down the strip it is not felled.
extends "res://scripts/act1/act1.gd"

const FOE := Color("#ff8a3a")

## (pair.ts QL_PACE, QL_STAB, STAB_AT, QL_LINES, QL_TAKEOFF, QL_LAND, QL_SWOOP, LINES_AT, LINE_*, STAB_*; PAIR_TUNE.quick, fly)
const GAIT := {"pace": 1.1, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.5, "slack": 0.6, "trueBack": true}
const STAB_HIT := 0.6
const STAB_AT := 2.4
const STAB_R := 1.05
const STAB_FOR := 1.0
const STROKES := [[0.7, 0.92], [1.02, 1.24], [1.34, 1.56]]
const SWOOP := {"long": 2.6, "spring": 0.55, "go": 0.7, "stop": 1.8}
const LINES_AT := [1.8, 3.3, 4.8]
const LINE_LONG := 5.2
const LINE_HALF := 0.45
const LINE_BURST_AFTER := 0.6
const LINE_BURST_FOR := 0.5
const LINE_STAIN_FOR := 1.4
const LINE_STROKE := 0.22
const QUICK := 2.0
const FLY := 9.0
const SWOOP_TILES := 8.0
const WRITE_AHEAD := 1.85
const COMBO_RATE := 2.0
const OVERWRITE := {"heal": 0.02, "most": 6.0}
## (QMODE: its moments with the Scraper)
const MODE := {"free": 0, "going": 1, "writing": 2, "waiting": 4, "swooping": 5, "between": 6}
## (QL_ACTS)
const ACTS := [
	{"id": "quill:stab", "clip": "attack", "long": 1.3, "hit": STAB_HIT, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": STAB_AT + 0.8},
	{"id": "quill:lines", "clip": "lines", "long": 2.6, "hit": 0.7, "dmg": 0.9, "cooldown": 9.0, "first": 5.0, "after": 0.6, "near": 1.0, "far": 4.8 + 0.8},
	{"id": "quill:takeoff", "clip": "takeoff", "long": 0.9, "hit": 0.34, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "quill:fly", "clip": "fly", "long": 60.0, "hit": 0.0, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "quill:land", "clip": "land", "long": 0.8, "hit": 0.45, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "quill:write", "clip": "write", "long": 60.0, "hit": 0.0, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 99.0, "forced": true},
	{"id": "quill:swoop", "clip": "swoop", "long": 2.6, "hit": 0.7, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 99.0, "forced": true},
]
const I_TAKEOFF := 2
const I_FLY := 3
const I_LAND := 4
const I_WRITE := 5
const I_SWOOP := 6


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(_m) -> void:
	a1 = {"mode": 0, "what": 0, "tx": 0.0, "ty": 0.0, "tfx": 1.0, "tfy": 0.0, "ox": 0.0, "oy": 0.0, "carry": 0.0, "wrote": 0.0, "told": -1}


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


## aloft: in the air, or skimming down the strip (not felled; it does not jostle).
func aloft(m) -> bool:
	var id := _id() if m.state == "act" else ""
	return id == "quill:takeoff" or id == "quill:fly" or id == "quill:land" or id == "quill:swoop"


## lifeFloor: in the air it is not felled (its death is painted from the floor).
func life_floor(m) -> float:
	return 1.0 if aloft(m) else 0.0


static func _partner(m):
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o != m and o.kind == "scraper" and o.pack_id == m.pack_id:
			return o
	return null


## breakOff: whatever it is making, left off; it stands.
func break_off(m) -> void:
	act = null
	m.state = "chase"
	_to("stand")
	m._set_list("idle", true)


## It stops writing over the Scraper (struck, the writing burned, the Scraper gone, or written long enough).
func stop_writing(m, why: String) -> void:
	a1["mode"] = MODE["free"]
	var s = _partner(m)
	if s != null:
		s.h2.a1["written"] = 0
	if why != "":
		m.mgr.loot.say(why, FOE)
	break_off(m)


## onLine: is the hero on ink line `i` of the Quill at `at` facing `u`, as the art lays it (a little slanted)?
static func on_line(at: Vector2, u: Vector2, i: int, h: Vector2) -> bool:
	var d := h - at
	var f := d.x * u.x + d.y * u.y
	var s := d.x * u.y - d.y * u.x
	var half := LINE_LONG / 2.0
	var slant := 0.25 * (i - 1)
	var e := HERO_R * 0.5
	if absf(s) > half + e:
		return false
	var mid: float = float(LINES_AT[i]) + (slant * clampf(s, -half, half)) / half
	return absf(f - mid) <= LINE_HALF + e


func tick(m, dt: float, _dist: float, hero) -> bool:
	if m.state == "act" or act != null:
		return false
	var s = _partner(m)
	var qm := int(a1["mode"])
	# SENT: it takes off, toward where it is going
	if qm == MODE["going"]:
		start_act(m, ACTS, I_TAKEOFF, hero)
		return true
	# BETWEEN TWO OF THE ULTIMATE'S STRIPS: it stands, facing him, until the Scraper sends it to the next
	if qm == MODE["between"]:
		if s == null or int(s.h2.a1["ult"]) == 0:
			a1["mode"] = MODE["free"]
			return false
		m.state = "chase"
		var d: float = hero.world.distance_to(m.world)
		if d > 0.01:
			m.face = (hero.world - m.world) / d
		if mode != "stand":
			_to("stand")
		gt += dt
		return true
	# WAITING AT THE STRIP'S FAR END, facing back down it: it swoops as the Scraper's strip runs out
	if qm == MODE["waiting"]:
		var stripping: bool = s != null and s.h2.act != null and s.h2.acts()[s.h2.act["i"]]["id"] == "scraper:strip"
		if s == null or (int(s.h2.a1["plan"]) != 1 and not stripping):
			a1["mode"] = MODE["free"]
			return false
		if s.h2.swoop_due():
			a1["mode"] = MODE["swooping"]
			start_act(m, ACTS, I_SWOOP, hero)
			return true
		m.state = "chase"
		m.face = Vector2(a1["tfx"], a1["tfy"])
		if mode != "stand":
			_to("stand")
		gt += dt
		return true
	# (out of whatever it was making: free again)
	if qm != MODE["free"]:
		if (qm == MODE["writing"] or int(a1["what"]) == 2) and s != null:
			s.h2.a1["written"] = 0
		a1["mode"] = MODE["free"]
	return false


func start(m, a: Dictionary, _hero) -> void:
	act["a"] = 0
	act["b"] = 0
	var id: String = a["id"]
	var to := Vector2(a1["tx"], a1["ty"])
	if id == "quill:takeoff" or id == "quill:fly":
		if to.distance_to(m.world) > 1e-6:
			m.face = (to - m.world).normalized()
	elif id == "quill:land":
		# (it lands where it was sent: there, facing as it is to stand; landing beside the Scraper to write over it, the Scraper holds
		# its ground from now)
		m.world = to
		var s = _partner(m) if int(a1["what"]) == 2 else null
		if s != null:
			s.h2.a1["written"] = 1
	elif id == "quill:write" or id == "quill:swoop":
		var f := Vector2(a1["tfx"], a1["tfy"])
		if f.length() > 1e-6:
			m.face = f.normalized()
	# (QUICK: its flight twice as fast as painted, taking off and landing too; its swoop as fast as their ultimate goes)
	if id == "quill:takeoff" or id == "quill:fly" or id == "quill:land":
		act["rate"] = QUICK
	elif id == "quill:swoop":
		act["rate"] = COMBO_RATE
	if id == "quill:takeoff":
		sound(m, "gust", 0.5)
	if id == "quill:write":
		a1["wrote"] = 0.0
		a1["told"] = -1
		var s = _partner(m)
		if s != null:
			s.h2.a1["written"] = 1
			# (the fresh writing over its back: act2/pair_marks.gd)
			peril(s, "quill:overwrite", s.world, {"dur": OVERWRITE["most"] + 1.0, "src": s, "q": m})
	if id == "quill:stab":
		peril(m, "quill:aim", m.world, {"dur": STAB_HIT})


func acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	match a["id"]:
		"quill:stab":
			if not crossed(t0, t1, float(a["hit"])):
				return
			# THE STAB: whoever is in its mark is struck
			var c: Vector2 = m.world + m.face * STAB_AT
			if open_to(hero) and hero.world.distance_to(c) <= STAB_R + HERO_R * 0.5:
				blow(m, hero, float(a["dmg"]))
			peril(m, "quill:stab", m.world, {"dur": STAB_FOR})
			hero.kick(2.0)
			sound(m, "hit", 0.5)
		"quill:lines":
			# EACH STROKE lays a line across the floor before it: each bursts after
			for i in 3:
				if not crossed(t0, t1, float(STROKES[i][0])):
					continue
				peril(m, "quill:line", m.world, {"c": i, "dur": LINE_STROKE + LINE_BURST_AFTER + LINE_STAIN_FOR, "dmg": m._roll() * float(a["dmg"])})
				sound(m, "swing", 0.5)
		"quill:fly":
			# FLYING, straight to where it is sent; there, it lands. Sent to write over the Scraper, where it is going follows the
			# Scraper as it moves (where the floor lets it stand: the nearest side round it that has room)
			var s = _partner(m) if int(a1["what"]) == 2 else null
			if s != null:
				var r := Vector2(a1["ox"], a1["oy"]).length()
				if r <= 0.0:
					r = WRITE_AHEAD
				var a0 := atan2(float(a1["oy"]), float(a1["ox"]))
				for da in [0.0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6, PI]:
					var p: Vector2 = s.world + Vector2(cos(a0 + da), sin(a0 + da)) * r
					if not m.mgr.clear(p.x, p.y, 0.35):
						continue
					a1["tx"] = p.x
					a1["ty"] = p.y
					a1["ox"] = p.x - s.world.x
					a1["oy"] = p.y - s.world.y
					a1["tfx"] = (s.world.x - p.x) / r
					a1["tfy"] = (s.world.y - p.y) / r
					break
			var to: Vector2 = Vector2(a1["tx"], a1["ty"]) - m.world
			var d := to.length()
			# (its act's clock runs `rate` times the game's: the flight's pace is in the game's seconds)
			var step := FLY * (t1 - t0) / float(act.get("rate", 1.0))
			if d <= step + 1e-6:
				start_act(m, ACTS, I_LAND, hero)
				return
			m.world += to / d * step
			m.face = to / d
		"quill:write":
			# WRITING OVER THE SCRAPER: it heals while it writes; stopped by a blow on the Quill, the Scraper burning, or in time
			var s = _partner(m)
			if s == null or s.world.distance_to(m.world) > 3.0:
				stop_writing(m, "")
				return
			if _struck < t1 - t0 + 1e-6:
				stop_writing(m, "%s is struck from its writing" % m.title)
				return
			if s.burn_t > 0.0:
				stop_writing(m, "The fresh writing burns on %s" % (("the " + s.title.substr(4)) if s.title.begins_with("The ") else s.title))
				return
			a1["wrote"] = float(a1["wrote"]) + (t1 - t0)
			if float(a1["wrote"]) >= float(OVERWRITE["most"]):
				stop_writing(m, "")
				return
			s.life = minf(s.max_life, s.life + s.max_life * float(OVERWRITE["heal"]) * (t1 - t0))
			var sec := floori(float(a1["wrote"]))
			if sec != int(a1["told"]):
				a1["told"] = sec
				var w := Chained.Word.new()
				w.text = "heals"
				w.color = Color("#ff8a80")
				w.position = Iso.to_screen(s.world.x, s.world.y)
				m.mgr.stands.add_child(w)
		"quill:swoop":
			# CARRIED DOWN THE STRIP, its nib writing it, SWOOP_TILES along the way it faces
			if crossed(t0, t1, float(SWOOP["spring"])):
				sound(m, "gust", 0.6)
			if t1 <= float(SWOOP["go"]) or t0 >= float(SWOOP["stop"]):
				return
			var carry: float = float(a1["carry"]) if float(a1["carry"]) > 0.0 else SWOOP_TILES
			var b := func(t: float) -> float: return carry * (minf(t, SWOOP["stop"]) - float(SWOOP["go"])) / (float(SWOOP["stop"]) - float(SWOOP["go"]))
			m.world += m.face * (b.call(t1) - b.call(maxf(t0, SWOOP["go"])))


func end(m, a: Dictionary, hero) -> void:
	var id: String = a["id"]
	if id == "quill:takeoff":
		start_act(m, ACTS, I_FLY, hero)
	elif id == "quill:land":
		# (there: to write over the Scraper, or to wait at the strip's far end)
		var s = _partner(m)
		if int(a1["what"]) == 2 and s != null:
			a1["mode"] = MODE["writing"]
			start_act(m, ACTS, I_WRITE, hero)
		elif int(a1["what"]) == 3 and s != null and (int(s.h2.a1["plan"]) == 1 or (s.h2.act != null and s.h2.acts()[s.h2.act["i"]]["id"] == "scraper:strip")):
			a1["mode"] = MODE["waiting"]
			m.face = Vector2(a1["tfx"], a1["tfy"])
		else:
			a1["mode"] = MODE["free"]
			if s != null and int(a1["what"]) == 2:
				s.h2.a1["written"] = 0
	elif id == "quill:swoop":
		# (down from it: the next of the ultimate's strips to come, it waits to be sent; else free)
		var s = _partner(m)
		var sk = s.h2.a1 if s != null else null
		a1["mode"] = MODE["between"] if (sk != null and int(sk["ult"]) == 1 and int(sk["round"]) < 5) else MODE["free"]


## (its lines not yet burst lie and dry without bursting; the Scraper is no longer written over)
func died(m) -> void:
	for p in m.mgr.perils.list:
		if p.get("kind") != "a1" or p.get("src") != m or p.get("a1") != "quill:line":
			continue
		if float(p["t"]) < LINE_STROKE + LINE_BURST_AFTER:
			p["done"] = 2
	var s = _partner(m)
	if s != null:
		s.h2.a1["written"] = 0
	a1["mode"] = MODE["free"]
