## FLOOR 17'S BOSS: THE PRINCE (the Black Room), as the game fights him (game/act1_rules/prince.ts; art/prince_moves.ts, prince_fx.ts;
## render/act1_fx/prince.ts). His doc: "A tall young man in a long velvet coat and a smiling gilt mask, with a rapier, dancing the whole
## fight." His picks: “Yes, this brief (Recommended)”, “Yes, that's the Prince (Recommended)”, his step and darts “Keep it as it is”.
##   NEVER STILL: between his blows he DARTS (0.8 s: carried 4 tiles while in the air, 0.17 to 0.6 s) across and about the hero,
##     keeping 2.6 to 6.5 tiles off; every 1.3, 1.0, 0.75 s by his phase. His walk, the dance-step, 4.5 tiles a second.
##   THE THRUST (his basic blow, 2.0 s): its line marked (4.6 tiles before him, 0.75 either side); the lunge lands at 26/30 s.
##   MASKS (every 6 s, the first after 2; 1.85 s, from 2.5 to 11 tiles off): their five ways marked; five smiling masks flung at 26/30 s,
##     a fan 72 degrees wide, 15 tiles a second, 12 tiles; each strikes the hero where it passes him, once, x0.8; each bursts at its end.
##   THE DANCE (every 10 s, the first after 4; 1.5 s, within 9): at 26/30 s eight masked partners rise round where the hero stands,
##     waltz round him closing in, and snap shut 1.73 s after: the hero still within 2.5 tiles caught, x1.4. Then he waltzes away round
##     the room (1.6 s at 4 tiles a second).
##   MIDNIGHT (every 20 s, the first after 6; 2.6 s): at 29/30 s the great ebony clock strikes twelve: a ring rolling out from the
##     clock at each chime, out to 20 tiles, 0.75 deep, each with a gap 2.4 tiles across (wandering round from chime to chime); a ring
##     rolling over him outside its gap strikes him, x0.7. A chime every 1.0, 0.75, 0.5 s by his phase, rolling at 5, 6.5, 8 tiles a
##     second. The clock's own picture strikes (act3/masque.gd).
##   HIS PHASES at two thirds and a third of his life: his waits shorter (x0.8, x0.65), his darts quicker.
##   HIS DEATH: the art's own; what of his was still to come does not come; the chimes still rolling stop.
## What he sends out: act3/marks17.gd (prince:mask, prince:dance, prince:chime).
extends "res://scripts/act3/hc.gd"

const THRUST := {"warn": [0.45, 0.7666666666666667], "hit": 0.8666666666666667, "reach": 4.6, "half": 0.75}
const MASKS := {"warn": [0.45, 0.7666666666666667], "hit": 0.8666666666666667, "n": 5, "flight": 0.8, "burst": 0.3, "hit_r": 0.6, "reach": 12.0}
const DANCE := {"warn": [0.45, 0.7666666666666667], "hit": 0.8666666666666667, "long": 2.35, "snap": 1.7333, "close": 0.4, "caught": 2.5, "r0": 4.5}
const MIDNIGHT := {"hit": 0.9666666666666667}
const CHIME := {"rings": 12, "every": [1.0, 0.75, 0.5], "speed": [5.0, 6.5, 8.0], "reach": 20.0, "band": 0.75, "gap": 2.4, "hit": 0.35}
const DART := {"long": 0.8, "air": [0.17, 0.6], "carry": 4.0, "every": [1.3, 1.0, 0.75], "keep": [2.6, 6.5]}
const WALTZ := {"long": 1.6, "pace": 4.0}
const CD := [1.0, 0.8, 0.65]
const GAIT := {"pace": 4.5, "cycle": 12.0 / 30.0 / 2.0, "setOff": 0.0, "halt": 0.0, "stopAt": 3.2, "slack": 0.6, "trueBack": true}
const ACTS := [
	{"id": "prince:thrust", "clip": "attack", "long": 2.0, "hit": 0.8666666666666667, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 4.3},
	{"id": "prince:masks", "clip": "masks", "long": 1.85, "hit": 0.8666666666666667, "dmg": 0.8, "cooldown": 6.0, "first": 2.0, "after": 0.3, "near": 2.5, "far": 11.0},
	{"id": "prince:dance", "clip": "dance", "long": 1.5, "hit": 0.8666666666666667, "dmg": 1.4, "cooldown": 10.0, "first": 4.0, "after": 0.0, "near": 0.0, "far": 9.0},
	{"id": "prince:midnight", "clip": "midnight", "long": 2.6, "hit": 0.9666666666666667, "dmg": 0.7, "cooldown": 20.0, "first": 6.0, "after": 0.3, "near": 0.0, "far": 30.0},
	{"id": "prince:dart", "clip": "dart", "long": 0.8, "hit": 0.6, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 999.0, "forced": true},
	{"id": "prince:waltz", "clip": "waltz", "long": 1.6, "hit": 1.6, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.2, "near": 0.0, "far": 999.0, "forced": true},
]
const DART_I := 4
const WALTZ_I := 5


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## His phase: 0, 1 or 2, by his life (two thirds, a third).
static func phase_of(m) -> int:
	var k: float = m.life / maxf(1.0, m.max_life)
	return 0 if k > 2.0 / 3.0 else (1 if k > 1.0 / 3.0 else 2)


func _keep() -> Dictionary:
	if not a1.has("dart_cd"):
		a1 = {"dart_cd": 1.0, "waltz": 0, "wx": 0.0, "wy": 0.0, "cx": 0.0}
	return a1


static func _open(m, p: Vector2) -> bool:
	return m.mgr.map.walkable(floori(p.x), floori(p.y))


## Carried by `d` in small steps, so far as the floor lets him.
static func carry(m, d: Vector2) -> void:
	var n := maxi(1, ceili(d.length() / 0.1))
	for i in n:
		var p: Vector2 = m.world + d / n
		if not _open(m, p):
			return
		m.world = p


## A way to dart: across the hero and round him, keeping his distance; one whose four tiles are all floor. Vector2.ZERO: none.
func _dart_way(m, hero) -> Vector2:
	var to: Vector2 = hero.world - m.world
	var d := maxf(to.length(), 1.0)
	var ways: Array = []
	for k in 12:
		var a := k / 12.0 * TAU
		var w := Vector2(cos(a), sin(a))
		# (across him, not straight at or away: never more than 0.75 of it toward or from him)
		if absf(w.dot(to) / d) > 0.75:
			continue
		var e: Vector2 = m.world + w * float(DART["carry"])
		var de: float = hero.world.distance_to(e)
		if de < float(DART["keep"][0]) or de > float(DART["keep"][1]):
			continue
		var ok := true
		for s in range(1, 9):
			if not _open(m, m.world + w * float(DART["carry"]) * s / 8.0):
				ok = false
				break
		if ok:
			ways.append(w)
	return ways[randi() % ways.size()] if not ways.is_empty() else Vector2.ZERO


func tick(m, dt: float, _dist: float, _hero) -> bool:
	var k := _keep()
	k["dart_cd"] = float(k["dart_cd"]) - dt
	# (his waits shorter each phase: the time to his next blows runs the faster)
	var ph := phase_of(m)
	if ph > 0 and cds.size() == ACTS.size():
		for i in range(1, cds.size()):
			cds[i] = float(cds[i]) - dt * (1.0 / float(CD[ph]) - 1.0)
	return false


func forced(m) -> int:
	var k := _keep()
	if int(k["waltz"]) == 1:
		return WALTZ_I
	if float(k["dart_cd"]) > 0.0:
		return -1
	var hero = m.mgr.hero
	if hero.world.distance_to(m.world) > 10.0:
		return -1
	var w := _dart_way(m, hero)
	if w == Vector2.ZERO:
		k["dart_cd"] = 0.3
		return -1
	k["wx"] = w.x
	k["wy"] = w.y
	return DART_I


func start(m, a: Dictionary, hero) -> void:
	var k := _keep()
	var id := str(a["id"])
	match id:
		"prince:dart":
			k["dart_cd"] = float(DART["every"][phase_of(m)]) * randf_range(0.85, 1.25)
		"prince:waltz":
			k["waltz"] = 0
			# (away round the room: round the ring's middle, the way he faces turned a quarter)
			var s := 1.0 if randf() < 0.5 else -1.0
			k["wx"] = -m.face.y * s
			k["wy"] = m.face.x * s
			k["cx"] = s
		"prince:thrust":
			warn(m, id, float(THRUST["warn"][0]) - 0.2, THRUST["hit"], [[0.0, THRUST["reach"], -float(THRUST["half"]), THRUST["half"]]], [])
		"prince:masks":
			var strips: Array = []
			for w in m.mgr.perils._fx["tables"].get("pc_ways", []):
				strips.append([0.5, float(MASKS["reach"]) * 0.6, -0.3, 0.3, w[0], w[1]])
			warn(m, id, float(MASKS["warn"][0]) - 0.2, MASKS["hit"], strips, [])
		"prince:dance":
			warn(m, id, float(DANCE["warn"][0]) - 0.2, DANCE["hit"], [], [[-PI, PI, DANCE["r0"]]], true, {"kmul": 0.6})
	pass


func end(_m, a: Dictionary, _hero) -> void:
	if str(a["id"]) == "prince:dance":
		_keep()["waltz"] = 1


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var k := _keep()
	match str(a["id"]):
		"prince:dart":
			# (carried while in the air: 4 tiles from 0.17 to 0.6 s)
			var a0: float = DART["air"][0]
			var a1_: float = DART["air"][1]
			var u := func(t: float) -> float: return clampf((t - a0) / (a1_ - a0), 0.0, 1.0)
			var d: float = float(DART["carry"]) * (u.call(t1) - u.call(t0))
			if d > 0.0:
				carry(m, Vector2(k["wx"], k["wy"]) * d)
			if crossed(t0, t1, a0):
				sound(m, "dodge", 0.35)
		"prince:waltz":
			# (round an arc at its pace, the way turning as he goes: a quarter of a circle of the room)
			var turn: float = float(k["cx"]) * (PI / 2.0) * ((t1 - t0) / float(WALTZ["long"]))
			var w := Vector2(k["wx"], k["wy"]).rotated(turn)
			k["wx"] = w.x
			k["wy"] = w.y
			carry(m, w * float(WALTZ["pace"]) * (t1 - t0))
		"prince:thrust":
			if crossed(t0, t1, float(THRUST["hit"]) - 0.05):
				sound(m, "swing", 0.5)
			if crossed(t0, t1, a["hit"]):
				var r := rel(m, hero)
				if r.x >= -0.3 and r.x <= float(THRUST["reach"]) and absf(r.y) <= float(THRUST["half"]) and open_to(hero):
					blow(m, hero, float(a["dmg"]))
		"prince:masks":
			if not crossed(t0, t1, a["hit"]):
				return
			sound(m, "whirl", 0.5)
			var dmg: float = m._roll() * float(a["dmg"])
			for i in int(MASKS["n"]):
				peril(m, "prince:mask", m.world, {"a": i, "dur": float(MASKS["flight"]) + float(MASKS["burst"]), "hit": 0.0, "dmg": dmg})
		"prince:dance":
			if crossed(t0, t1, a["hit"]):
				peril(m, "prince:dance", hero.world, {"dur": DANCE["long"], "hit": DANCE["snap"], "dmg": m._roll() * float(a["dmg"])})
		"prince:midnight":
			if not crossed(t0, t1, a["hit"]):
				return
			# (the great ebony clock strikes twelve: a ring from its place at each chime, faster each phase, each with its gap)
			var masque = m.mgr.main.masque if m.mgr.main != null else null
			var cp: Vector2 = masque.at if masque != null and masque.on() else m.world
			var ph := phase_of(m)
			var dmg: float = m._roll() * float(a["dmg"])
			var gap0 := randf_range(0.0, TAU)
			for i in int(CHIME["rings"]):
				var delay: float = i * float(CHIME["every"][ph])
				peril(m, "prince:chime", cp, {"a": i, "b": ph, "c": gap0 + i * randf_range(0.5, 1.1) * (1.0 if i % 2 == 1 else -1.0), "d": delay,
					"dur": delay + float(CHIME["reach"]) / float(CHIME["speed"][ph]) + 0.2, "dmg": dmg, "hit": delay})
			if masque != null:
				masque.strike(true)
			sound(m, "echo", 1.0)


func died(m) -> void:
	# (what of his was still to come does not come; the chimes still rolling stop)
	for p in m.mgr.perils.list:
		if p.get("src") != m or not str(p.get("a1", "")).begins_with("prince:"):
			continue
		p["done"] = 1
		if str(p["a1"]) == "prince:chime":
			p["dur"] = minf(float(p["dur"]), float(p["t"]) + 0.3)
	var masque = m.mgr.main.masque if m.mgr.main != null else null
	if masque != null:
		masque.strike(false)


## Whether `at` is in a chime's ring's gap, its front `r` tiles out (the gap 2.4 tiles across, facing `c` radians).
static func chime_gap(p: Dictionary, at: Vector2, r: float) -> bool:
	if r < 0.5:
		return false
	var a := atan2(at.y - float(p["y"]), at.x - float(p["x"]))
	var half: float = float(CHIME["gap"]) / 2.0 / r
	var d := absf(fposmod(a - float(p["c"]) + PI, TAU) - PI)
	return d < half
