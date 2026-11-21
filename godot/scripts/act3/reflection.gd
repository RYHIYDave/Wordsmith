## YOUR REFLECTIONS (floor 18, the Glass Gallery; and the Queen's, out of her hall's pier glasses), as the game fights them with the heroes
## as they look now (game/act1_rules/reflection.ts, REFLECTIONS_UP on; art/reflections_up.ts; render/act1_fx/reflection.ts). His doc:
## "your own reflections, which step out of the mirrors and fight with your class's moves"; his picks, “Glassy copy of you
## (Recommended)”, and what glows on you pink on them, “Pink, like enemies (Recommended)”.
##   A COPY OF HIS CLASS: in the Godot version, the Warrior's, with his great sword (form 0, the game's own as it is exported): its
##     tap the Strike, a cut before it (1.9 tiles, 1.2 radians either side); its hold the Slam, brought down 1.3 tiles before it, 1.5
##     round, every 6 s. Each held first a moment (0.45 s, the hold's 0.7), its picture's first frame held through it and its warning
##     in the enemy's pink, then his own move played, the blow where his picture's lands.
##   IT STEPS OUT OF A MIRROR: as it wakes, the nearest tall mirror not taken (within 9, not burst) is its way in: it is put before
##     that glass and steps out of it (1.6 s), not to be struck until it is through (0.72 s).
## (The other classes' copies' blows are the game's own here too (UP), against the day the Godot version has them: what they send is
## stepped as the game steps it, a shot, a wave, a lob.)
extends "res://scripts/act3/hc.gd"

const STEP := {"near": 9.0, "long": 1.6, "through": 0.72, "out": 0.85}
const WARN := {"tap": 0.45, "hold": 0.7}
## (UP: each form's tap and hold, its blow, where its picture's blow lands and how long it plays)
const UP := [
	{"tap": {"blow": {"k": "fan", "reach": 1.9, "half": 1.2, "sfx": "swing", "near": 0.0, "far": 2.1}, "hit": 0.333, "play": 1.2},
		"hold": {"blow": {"k": "ring", "r": 1.5, "at": "ahead", "ahead": 1.3, "sfx": "slam", "near": 0.0, "far": 2.4}, "hit": 0.5, "play": 1.133}},
	{"tap": {"blow": {"k": "shot", "n": 1, "spread": 0.0, "speed": 12.0, "far": 8.0, "hit": 0.45, "back": false, "look": "arrow", "dmg": 1.0, "sfx": "shot", "near": 0.0}, "hit": 0.333, "play": 0.867},
		"hold": {"blow": {"k": "shot", "n": 5, "spread": 0.5, "speed": 12.0, "far": 8.0, "hit": 0.45, "back": false, "look": "arrow", "dmg": 0.8, "sfx": "volley", "near": 2.0}, "hit": 0.4, "play": 1.067}},
	{"tap": {"blow": {"k": "wave", "sfx": "wave", "near": 0.0, "far": 7.0}, "hit": 0.167, "play": 0.467},
		"hold": {"blow": {"k": "lob", "n": 1, "spread": 0.0, "burst": 1.7, "speed": 5.0, "after": 0.35, "look": "orb", "dmg": 1.5, "sfx": "orb", "boom": "explode", "near": 2.0, "far": 7.0}, "hit": 0.267, "play": 0.667}},
	{"tap": {"blow": {"k": "shot", "n": 1, "spread": 0.0, "speed": 11.0, "far": 8.0, "hit": 0.5, "back": false, "look": "bolt", "dmg": 1.1, "sfx": "fire", "near": 0.0}, "hit": 0.533, "play": 1.467},
		"hold": {"blow": {"k": "ring", "r": 2.6, "at": "self", "ahead": 0.0, "sfx": "curse", "near": 0.0, "far": 2.6}, "hit": 0.8, "play": 2.2}},
	{"tap": {"blow": {"k": "lob", "n": 1, "spread": 0.0, "burst": 1.2, "speed": 7.0, "after": 0.15, "look": "vial", "dmg": 1.0, "sfx": "vial", "boom": "explode", "near": 0.0, "far": 7.0}, "hit": 0.5, "play": 1.2},
		"hold": {"blow": {"k": "lob", "n": 3, "spread": 1.6, "burst": 1.2, "speed": 7.0, "after": 0.15, "look": "vial", "dmg": 0.8, "sfx": "vial", "boom": "explode", "near": 0.0, "far": 7.0}, "hit": 0.5, "play": 1.2}},
	{"tap": {"blow": {"k": "fan", "reach": 1.5, "half": 0.6, "sfx": "punchWhoosh", "near": 0.0, "far": 1.6}, "hit": 0.4, "play": 0.933},
		"hold": {"blow": {"k": "fan", "reach": 1.9, "half": 1.9, "sfx": "swing", "near": 0.0, "far": 2.0}, "hit": 0.533, "play": 1.2}},
	{"tap": {"blow": {"k": "fan", "reach": 1.7, "half": 75.0 * PI / 180.0, "sfx": "swing", "near": 0.0, "far": 1.9}, "hit": 0.333, "play": 1.2},
		"hold": {"blow": {"k": "shot", "n": 1, "spread": 0.0, "speed": 12.0, "far": 6.0, "hit": 0.55, "back": true, "look": "axe", "dmg": 1.0, "sfx": "whirl", "near": 0.0}, "hit": 0.367, "play": 1.967}},
	{"tap": {"blow": {"k": "ring", "r": 1.1, "at": "ahead", "ahead": 1.1, "sfx": "slam", "near": 0.0, "far": 1.9}, "hit": 0.433, "play": 1.267},
		"hold": {"blow": {"k": "ring", "r": 2.3, "at": "self", "ahead": 0.0, "sfx": "slam", "near": 0.0, "far": 2.3}, "hit": 0.633, "play": 1.633}},
]
const WAVE := {"speed": 7.0, "long": 0.9, "half": 0.7}
const GAIT := {"pace": 4.0, "cycle": 0.45, "setOff": 0.0, "halt": 0.0, "stopAt": 1.6, "slack": 0.5, "trueBack": true}
static var ACTS: Array = _acts()
const OUT_I := 16


static func _acts() -> Array:
	var out: Array = []
	for f in UP.size():
		var u: Dictionary = UP[f]
		out.append({"id": "reflection:tap%d" % f, "clip": "attack", "long": float(WARN["tap"]) + float(u["tap"]["play"]), "hit": float(WARN["tap"]) + float(u["tap"]["hit"]),
			"dmg": 1.0, "cooldown": 0.0, "first": 0.3, "after": 0.4, "near": 0.0, "far": 8.0})
		out.append({"id": "reflection:hold%d" % f, "clip": "heavy", "long": float(WARN["hold"]) + float(u["hold"]["play"]), "hit": float(WARN["hold"]) + float(u["hold"]["hit"]),
			"dmg": 1.4, "cooldown": 6.0, "first": 2.5, "after": 0.5, "near": 0.0, "far": 8.0})
	out.append({"id": "reflection:out", "clip": "stepOut", "long": STEP["long"], "hit": STEP["through"], "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.2, "near": 0.0, "far": 99.0, "forced": true})
	return out


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


static func is_hold(id: String) -> bool:
	return id.begins_with("reflection:hold")


static func act_form(id: String) -> int:
	if id.begins_with("reflection:tap"):
		return int(id.substr(14))
	if id.begins_with("reflection:hold"):
		return int(id.substr(15))
	return -1


## The blow act `id` makes for this one: its form's own.
static func blow_of(m, id: String) -> Dictionary:
	var u: Dictionary = UP[clampi(int(m.form), 0, UP.size() - 1)]
	return u["hold"]["blow"] if is_hold(id) else u["tap"]["blow"]


## Where a ring blow is round: itself, or a spot before it.
static func ring_at(m, b: Dictionary) -> Vector2:
	return m.world + m.face * float(b["ahead"]) if str(b["at"]) == "ahead" else m.world


## Where each of a lob's things comes down: where the hero stood as it began, and the others `spread` apart across its way.
func lob_marks(m, b: Dictionary) -> Array:
	var t := Vector2(a1.get("tx", m.world.x), a1.get("ty", m.world.y))
	if int(b["n"]) <= 1:
		return [t]
	var d := maxf(t.distance_to(m.world), 1.0)
	var s := Vector2(-(t.y - m.world.y) / d, (t.x - m.world.x) / d)
	var out: Array = []
	for i in int(b["n"]):
		out.append(t + s * ((i - (int(b["n"]) - 1) / 2.0) * float(b["spread"])))
	return out


## How far out a shot is `t` seconds after it was sent (one that comes back, back after `far`).
static func shot_out(b: Dictionary, t: float) -> float:
	var d := float(b["speed"]) * t
	return maxf(0.0, 2.0 * float(b["far"]) - d) if b["back"] and d > float(b["far"]) else d


## (its picture through a blow: its first frame held through the warning, then the hero's own clip played: render/act1_fx/reflection.ts)
func shown(m) -> Dictionary:
	if act == null or act_form(_id()) < 0:
		return {}
	var hold := is_hold(_id())
	var list := "heavy" if hold else "attack"
	if not m.art.has(list):
		return {}
	var w: float = WARN["hold"] if hold else WARN["tap"]
	var t: float = act["t"]
	return {"list": list, "i": 0 if t < w else floori((t - w) * m.art.fps(list))}


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


## Have `m` step out of a glass at `at` on a wall facing `f` (the Queen's Reflections out of her hall's pier glasses).
func step_out_at(at: Vector2, f: Vector2) -> void:
	a1["out_done"] = 1
	a1["out"] = 1
	a1["ox"] = at.x
	a1["oy"] = at.y
	a1["ofx"] = f.x
	a1["ofy"] = f.y


func tick(m, _dt: float, _dist: float, _hero) -> bool:
	# (as it wakes: the nearest mirror not taken, its way in)
	if int(a1.get("out_done", 0)) == 1:
		return false
	a1["out_done"] = 1
	var G = m.mgr.main.gallery if m.mgr.main != null else null
	if G == null or not G.on():
		return false
	var best = null
	var bd: float = STEP["near"]
	for q in G.mirrors:
		if q["taken"] or int(q["frame"]) == 2:
			continue
		var d: float = Vector2(q["x"], q["y"]).distance_to(m.world)
		if d < bd:
			bd = d
			best = q
	if best != null:
		best["taken"] = true
		step_out_at(Vector2(best["x"], best["y"]), Vector2(best["fx"], best["fy"]))
	return false


func forced(_m) -> int:
	return OUT_I if int(a1.get("out", 0)) == 1 else -1


func can(m, a: Dictionary, dist: float, _los: bool) -> bool:
	if str(a["id"]) == "reflection:out":
		return true
	# (a form makes only its own)
	if act_form(str(a["id"])) != int(m.form):
		return false
	var b := blow_of(m, str(a["id"]))
	return dist >= float(b.get("near", 0.0)) and dist <= float(b.get("far", 8.0))


func reachable(_m) -> bool:
	return not (_id() == "reflection:out" and float(act["t"]) < float(STEP["through"]))


func start(m, a: Dictionary, hero) -> void:
	var id := str(a["id"])
	if id == "reflection:out":
		# (put before the glass, facing out of it, where the art's step-out ends)
		a1["out"] = 2
		var f := Vector2(a1.get("ofx", 0.0), a1.get("ofy", 1.0))
		m.world = Vector2(a1.get("ox", m.world.x), a1.get("oy", m.world.y)) + f * float(STEP["out"])
		m.face = f
		return
	# (where it aims: the hero as the blow is begun)
	a1["tx"] = hero.world.x
	a1["ty"] = hero.world.y
	# ITS WARNING through its hold, in the enemy's pink
	var b := blow_of(m, id)
	var hit: float = a["hit"]
	match str(b["k"]):
		"fan":
			warn(m, id, 0.0, hit, [], [[-float(b["half"]), b["half"], b["reach"]]])
		"ring":
			if str(b["at"]) == "self":
				warn(m, id, 0.0, hit, [], [[-PI, PI, b["r"]]])
			else:
				warn(m, id, 0.0, hit, [], [[-PI, PI, b["r"], b["ahead"]]])
		"shot":
			if int(b["n"]) > 1:
				warn(m, id, 0.0, hit, [], [[-float(b["spread"]) - 0.08, float(b["spread"]) + 0.08, float(b["far"]) * 0.75]])
			else:
				warn(m, id, 0.0, hit, [[0.4, float(b["far"]) * 0.75, -0.25, 0.25]], [])
		"wave":
			warn(m, id, 0.0, hit, [[0.4, float(WAVE["speed"]) * float(WAVE["long"]), -float(WAVE["half"]), WAVE["half"]]], [])


func end(_m, a: Dictionary, _hero) -> void:
	if str(a["id"]) == "reflection:out":
		a1["out"] = 0


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var id := str(a["id"])
	if id == "reflection:out" or not crossed(t0, t1, a["hit"]):
		return
	var b := blow_of(m, id)
	sound(m, str(b["sfx"]), 0.5)
	match str(b["k"]):
		"fan":
			var r := rel(m, hero)
			if r.length() <= float(b["reach"]) and absf(atan2(r.y, r.x)) <= float(b["half"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		"ring":
			var at := ring_at(m, b)
			# (a blow brought down, or the floor heaving: the ring it leaves, as the game's slams leave theirs)
			m._tell({"t": "burst", "x": at.x, "y": at.y, "r": b["r"], "el": "phys", "style": "nova" if str(b["sfx"]) == "curse" else "slam"})
			if hero.world.distance_to(at) <= float(b["r"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		"shot":
			var dmg: float = m._roll()
			for i in int(b["n"]):
				var turn: float = 0.0 if int(b["n"]) == 1 else -float(b["spread"]) + 2.0 * float(b["spread"]) * i / (int(b["n"]) - 1)
				var dur: float = (2.0 * float(b["far"]) if b["back"] else float(b["far"])) / float(b["speed"])
				var f: Vector2 = m.face.rotated(turn)
				var q := peril(m, "reflection:" + str(b["look"]), m.world + m.face * 0.5, {"dur": dur, "dmg": dmg * float(b["dmg"]), "blow": b})
				q["fx"] = f.x
				q["fy"] = f.y
		"wave":
			peril(m, "reflection:wave", m.world + m.face * 0.5, {"dur": WAVE["long"], "dmg": m._roll()})
		"lob":
			var dmg: float = m._roll()
			for t in lob_marks(m, b):
				var d := maxf(0.5, t.distance_to(m.world))
				peril(m, "reflection:" + str(b["look"]), m.world, {"dur": d / float(b["speed"]) + float(b["after"]) + 0.3, "dmg": dmg * float(b["dmg"]),
					"a": t.x, "b": t.y, "c": d / float(b["speed"]), "blow": b})
