## THE PALACE GUARD (floor 16, the Swan Gardens), as the game fights them with its new moves on (game/act1_rules/pguard.ts JAVELIN,
## spearOf, thrust9Strikes; art/action_f16_guard.ts THRUST9, JAV, PULL, STUCK, javFly; render/act1_fx/pguard.ts).
##   THEIR LOOKS (Monster.form, their pictures with it): 0 the partisan guard; 1 the sword guard; 2 the partisan guard, his partisan
##     thrown, his sword drawn; 3 the sword guard, his javelin thrown. A mixed squad: even numbers the partisan, odd the sword.
##   THE MARCH: 0.8 tiles a second, twelve frames round at ten a second, in step with the game's clock; they stop 1.3 tiles off.
##   THE THRUST (1.9 s, at 20/30 s): whoever is along the line it is thrust on is struck (0.2 behind him to his weapon's point and
##     0.9 more, 0.85 to either side of it: the partisan's reaches 2.69 tiles, the sword's 1.52), marked through its wind-up.
##   THE JAVELIN (from 2 to 7 tiles off, in sight; every 7 s, the first after 1.5): the partisan guard hurls his partisan (2.25 s,
##     away at 0.97 s), the sword guard his javelin (2.55 s, away at 1.23 s), at where the hero stands as it leaves the hand (no further
##     than 8 tiles, on open floor), its fall marked round him; in flight 0.22 + 0.035 s a tile; IT STICKS, whoever within 1.6 of it
##     struck, x1.2. The javelin lies 4.8 s and is gone; the partisan lies till he marches to it and WRENCHES IT OUT (2.65 s, free at
##     1.48), stood 1.12 short of it, facing it; held up 2.5 s on his way, he gives it up and it comes back to him. Dead, his partisan
##     lies 3 s more.
extends "res://scripts/act3/hc.gd"

const GAIT := {"pace": 0.8, "cycle": 0.6, "setOff": 0.0, "halt": 0.0, "stopAt": 1.3, "slack": 0.4, "trueBack": true}
const THRUST9 := {"hit": 20.0 / 30.0, "from": -0.2, "more": 0.9, "half": 0.85}
## (art/action_f16_guard.ts thrustReach: the partisan's point, the sword's, tiles before him and to his left)
const REACH := [Vector2(2.692645097783405, 0.07523800099021963), Vector2(1.5202337116674893, -0.20412414523193154)]
const JAV := {"partisan_hit": 0.9666666666666667, "sword_hit": 1.2333333333333334, "mark": 0.15, "r": 1.6, "far": 7.0, "quiver": 0.8}
const PULL_SHORT := 1.1226963
const PARTISAN := 0
const SWORD := 1
const PARTISAN_SWORD := 2
const SWORD_AFTER := 3
const ACTS := [
	{"id": "pguard:thrust", "clip": "attack", "long": 1.9, "hit": 20.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.8, "near": 0.0, "far": 4.5},
	{"id": "pguard:javelin", "clip": "javelin", "long": 2.25, "hit": 0.9666666666666667, "dmg": 1.2, "cooldown": 7.0, "first": 1.5, "after": 0.6, "near": 2.0, "far": 7.0},
	{"id": "pguard:javelin2", "clip": "javelin", "long": 2.55, "hit": 1.2333333333333334, "dmg": 1.2, "cooldown": 7.0, "first": 1.5, "after": 0.6, "near": 2.0, "far": 7.0},
	{"id": "pguard:pullout", "clip": "pullOut", "long": 2.65, "hit": 1.48, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 0.0, "forced": true},
]


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


static func reach_of(form: int) -> Vector2:
	return REACH[0] if form == PARTISAN else REACH[1]


## thrust9Strikes: whether the thrust of one of look `form` strikes a hero `x` before him and `y` to his left.
static func thrust_strikes(form: int, x: float, y: float) -> bool:
	var r := reach_of(form)
	return x >= float(THRUST9["from"]) and x <= r.x + float(THRUST9["more"]) and absf(y - r.y) <= float(THRUST9["half"])


## How far its thrust's line runs before him (render/act1_fx/pguard.ts: as far as it strikes).
static func thrust_to(form: int) -> float:
	var to := 1.0
	while to < 6.0 and thrust_strikes(form, to + 0.05, 0.0):
		to += 0.05
	return to


## spearOf: his partisan stuck in the turf (or flying to it), or null.
static func spear_of(m) -> Dictionary:
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == "pguard:jav" and p.get("src") == m and int(p["b"]) == 0:
			return p
	return {}


func spawned(m) -> void:
	# (a partisan or a sword, in turn: a mixed squad: the game's own form, kept as it came)
	pass


## His look now: his pictures change with it (monsters.gd look_to).
static func _form(m, f: int) -> void:
	m.form = f
	m.mgr.look_to(m, "pguard" if f == 0 else "pguard_%d" % f)


func can(m, a: Dictionary, dist: float, los: bool) -> bool:
	var form: int = m.form
	match str(a["id"]):
		"pguard:thrust":
			return dist <= reach_of(form).x + float(THRUST9["more"])
		"pguard:javelin":
			return form == PARTISAN and los
		"pguard:javelin2":
			return form == SWORD and los
	return false


func start(m, a: Dictionary, _hero) -> void:
	var form: int = m.form
	match str(a["id"]):
		"pguard:thrust":
			warn(m, "pguard:thrust", 0.1, THRUST9["hit"], [[THRUST9["from"], thrust_to(form), -float(THRUST9["half"]), float(THRUST9["half"])]], [])
		"pguard:javelin", "pguard:javelin2":
			warn(m, str(a["id"]), JAV["mark"], a["hit"], [], [[-PI, PI, JAV["r"]]], true)


func tick(m, dt: float, dist: float, hero) -> bool:
	if m.form != PARTISAN_SWORD or m.state == "act" or act != null or m.dead:
		return false
	var sp := spear_of(m)
	if sp.is_empty():
		# (it is gone: he is the partisan guard again)
		_form(m, PARTISAN)
		return false
	if int(sp["done"]) == 0:
		return false
	# (the hero right there and his sword ready: he fights)
	if dist <= reach_of(m.form).x + float(THRUST9["more"]) and m._cd <= 0.0:
		return false
	var spot := Vector2(sp["x"], sp["y"])
	var to: Vector2 = spot - m.world
	var d := maxf(to.length(), 1e-6)
	if d <= PULL_SHORT + 0.3:
		# STOOD SHORT OF IT, facing it: he wrenches it out (in his hands from here: taken off the floor)
		m.face = to / d
		var w: Vector2 = spot - m.face * PULL_SHORT
		if m.mgr.clear(w.x, w.y, minf(m.r, 0.42), false):
			m.world = w
		start_act(m, ACTS, 3, hero)
		m.face = to / d
		act["hand"] = hand_of(GAIT["trueBack"], m.face)
		sp["dur"] = sp["t"]
		a1["stuck"] = 0.0
		return true
	# MARCHING TO IT (where he cannot get on toward it a while, he gives up: it is called back to him)
	var was := d
	m.face = to / d
	m.state = "chase"
	if mode != "walk":
		_to("walk")
	slide(m, m.face * m.speed * dt)
	gt += dt * m.speed / float(GAIT["pace"])
	var now: float = m.world.distance_to(spot)
	a1["stuck"] = 0.0 if now < was - m.speed * dt * 0.3 else float(a1.get("stuck", 0.0)) + dt
	if float(a1["stuck"]) > 2.5:
		sp["dur"] = sp["t"]
		_form(m, PARTISAN)
		a1["stuck"] = 0.0
	return true


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var id := str(a["id"])
	if id == "pguard:thrust":
		if crossed(t0, t1, float(THRUST9["hit"]) - 0.08):
			sound(m, "swing", 0.6)
		if not crossed(t0, t1, float(THRUST9["hit"])):
			return
		var r := rel(m, hero)
		if thrust_strikes(m.form, r.x, r.y) and open_to(hero):
			blow(m, hero, float(a["dmg"]))
		return
	if id == "pguard:javelin" or id == "pguard:javelin2":
		if not crossed(t0, t1, float(a["hit"])):
			return
		# HURLED at where he stands as it leaves the hand (no further than it is thrown; on open floor)
		var to: Vector2 = hero.world - m.world
		var dl := maxf(to.length(), 1e-6)
		var u := to / dl
		var d := clampf(dl, 1.0, float(JAV["far"]) + 1.0)
		while d > 1.0 and not is_open(m, m.world + u * d):
			d -= 0.25
		var fly := 0.22 + 0.035 * d
		var q := peril(m, "pguard:jav", m.world + u * d, {"hit": fly, "dur": 1e9 if id == "pguard:javelin" else fly + float(JAV["quiver"]) + 4.0,
			"dmg": m._roll() * float(a["dmg"]), "b": 0 if id == "pguard:javelin" else 1, "c": d})
		q["fx"] = u.x
		q["fy"] = u.y
		sound(m, "swing", 0.8)


func end(m, a: Dictionary, _hero) -> void:
	match str(a["id"]):
		"pguard:javelin":
			_form(m, PARTISAN_SWORD)
		"pguard:javelin2":
			_form(m, SWORD_AFTER)
		"pguard:pullout":
			_form(m, PARTISAN)


func died(m) -> void:
	# (his partisan, stuck, lies a while and is gone)
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == "pguard:jav" and p.get("src") == m:
			p["dur"] = minf(float(p["dur"]), float(p["t"]) + 3.0)
