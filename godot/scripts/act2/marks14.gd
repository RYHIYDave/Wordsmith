## WHAT FLOOR 14'S PATIENTS AND ORDERLIES LAY ON THE FLOOR AND SEND OVER IT: perils.gd's marks of kind "a1" (marks.gd hands them here
## by the first word of their names), stepped as their rules step them (game/act1_rules/orderly.ts peril) and drawn as render/act1_fx/
## patient.ts and orderly.ts draw them:
##   patient:scream  the silent scream's burst, rolling out over the floor from the mouth (art/patient_shots.ts drawScreamBurst, in the
##                   game's pixels, brought over line for line).
##   orderly:slam    where the mallet went into the floor (the game's film og_slam: drawMalletSlam).
##   orderly:gurney  the gurney charge (its clock from the slam): its lane marked from the orderly, broken up behind it (the quarry
##                   golem's lane: marks.gd _lane); the gurney careering down it (og_gurney_<v>); its crash (`hit` when, `b`, `c` where:
##                   og_crash), striking whoever it crashes on.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const PT := preload("res://scripts/act2/patient.gd")
const OD := preload("res://scripts/act2/orderly.gd")

## (art/patient_shots.ts HUSH, DUST, MOUTH_UP)
const HUSH: Array[Color] = [Color("#262234"), Color("#3e3852"), Color("#625a7a"), Color("#9890b4"), Color("#b6b0cc")]
const DUST: Array[Color] = [Color("#4a4438"), Color("#6e6656"), Color("#958c78")]
const MOUTH_UP := 22.0

static var _m6 = null


static func gone(_P, _p: Dictionary) -> void:
	pass


static func step(P, p: Dictionary, _dt: float) -> bool:
	if str(p["a1"]) == "orderly:gurney":
		_gurney(P, p)
	return float(p["t"]) < float(p["dur"])


## THE GURNEY (orderly.ts peril): not yet slammed, gone if he is stopped; careering down its lane, it crashes on the hero or at its end.
static func _gurney(P, p: Dictionary) -> void:
	var hero = P.hero
	var t: float = p["t"]
	if t < 0.0:
		var src = p.get("src")
		if src == null or not is_instance_valid(src) or src.dead or src.state != "act" or src.h2 == null or src.h2.act == null \
				or str(src.h2.acts()[src.h2.act["i"]]["id"]) != "orderly:gurney":
			p["dur"] = t
		return
	if float(p["hit"]) < 1e9:
		return
	var d := OD.gurney_down(p)
	var f := Vector2(p["fx"], p["fy"])
	var rel: Vector2 = hero.world - Vector2(p["x"], p["y"])
	var x := rel.dot(f)
	var y := -rel.x * f.y + rel.y * f.x
	var on_him: bool = A1.open_to(hero) and OD.gurney_strikes(d, x, y)
	if not on_him and d < float(p["d"]) - 1e-6:
		return
	# (it crashes: on him, or at its end)
	p["hit"] = t
	p["dur"] = t + float(OD.GURNEY["lies"])
	var at := Vector2(p["x"], p["y"]) + f * (float(OD.GURNEY["at"]) + d)
	p["b"] = at.x
	p["c"] = at.y
	if hero.world.distance_to(at) <= float(OD.GURNEY["r"]) + A1.HERO_R * 0.5 and A1.open_to(hero):
		P._hurt(p, p["dmg"], at)
		A1.knock(hero, at, float(OD.GURNEY["knock"]))
	hero.kick(4.0)
	P.sfx.play("slam", linear_to_db(0.9))


static func _view(f: Vector2) -> String:
	return "back" if f.x + f.y < -0.2 else "front"


static func _flip(f: Vector2) -> bool:
	return f.x - f.y < 0.0


## Among the figures: the gurney, and its crash's dust and splinters by halves.
static func stands(P, p: Dictionary) -> void:
	if str(p["a1"]) != "orderly:gurney":
		return
	var f := Vector2(p["fx"], p["fy"])
	var name := "og_gurney_" + _view(f)
	if not P.has_film(name):
		return
	var t: float = p["t"]
	var crashed := float(p["hit"]) < 1e9
	var start := Vector2(p["x"], p["y"])
	var d: float = (Vector2(p["b"], p["c"]).distance_to(start) - float(OD.GURNEY["at"])) if crashed else OD.gurney_down(p)
	var at: Vector2 = start + f * (float(OD.GURNEY["at"]) + d)
	# (gurneyFrame: standing before the slam; careering on 30 a second; crashed 15 a second)
	var i := 0
	if crashed:
		i = 1 + 40 + mini(24 - 1, floori((t - float(p["hit"])) * 15.0))
	elif t > 0.0:
		i = 1 + mini(40 - 1, floori(t * 30.0))
	P._film_one(p, "fx_stand", P._still(name, "stand", i), at, at.x + at.y, _flip(f))
	if crashed and P.has_film("og_crash"):
		P._film_stands(p, "og_crash", t - float(p["hit"]), Vector2(p["b"], p["c"]))


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	match str(p["a1"]):
		"orderly:slam":
			if P.has_film("og_slam"):
				P._film_floor("og_slam", t, Vector2(p["x"], p["y"]))
		"orderly:gurney":
			if float(p["hit"]) >= 1e9:
				# (its lane, laid out as it is aimed, broken up behind it)
				if _m6 == null:
					_m6 = load("res://scripts/act1/marks.gd")
				var k := minf(1.0, (t + (OD.GURNEY_HIT - float(OD.GURNEY["aim"]))) / 0.3)
				var G: Dictionary = OD.GURNEY
				_m6._dots(P, Vector2(p["x"], p["y"]), _m6._lane(Vector2(p["fx"], p["fy"]), k, float(G["at"]) + OD.gurney_down(p) if t > 0.0 else 0.0, float(G["at"]) + float(p["d"]) + float(G["long"]) / 2.0, float(G["half"])))
			elif P.has_film("og_crash"):
				P._film_floor("og_crash", t - float(p["hit"]), Vector2(p["b"], p["c"]))


## Over what stands: the patient's silent scream.
static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "patient:scream":
		return
	_scream(c, float(p["x"]), float(p["y"]), Vector2(p["fx"], p["fy"]), float(p["t"]))


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## drawScreamBurst: the fan from the mouth out to its front, thicker toward its front, falling to the floor as it goes; its front a
## ragged wave of the Hush rolling out and a fainter one behind it; the dust thrown back where the front passes.
static func _scream(c: CanvasItem, x: float, y: float, d: Vector2, t: float) -> void:
	var S: Dictionary = PT.SCREAM
	var long: float = S["long"]
	if t < 0.0 or t >= long:
		return
	var q := t / long
	var u := d.normalized() if d.length() > 0.0 else Vector2(1, 0)
	var half: float = S["half"]
	var reach: float = S["reach"]
	var front := 0.15 + (reach - 0.15) * _sm(q * 1.25)
	var fade := 1.0 - _sm((q - 0.55) / 0.45)
	var along := func(a: float, rr: float) -> Vector2:
		var s := GP.at(x + (u.x * cos(a) - u.y * sin(a)) * rr, y + (u.y * cos(a) + u.x * sin(a)) * rr)
		return Vector2(s.x, s.y - MOUTH_UP * (1.0 - _sm(rr / (reach * 0.55))))
	var rows := 30
	for i in rows:
		var r := front * (0.22 + 0.78 * (float(i) / (rows - 1)))
		var edge := 1.0 - (front - r) / maxf(0.2, front)
		var n := ceili(10.0 + r * 30.0)
		for j in n:
			var a := -half + (2.0 * half * (j + 0.5)) / n + 0.06 * sin(i * 1.7 + j)
			var rr := r + 0.08 * sin(a * 9.0 + t * 22.0 + i) * edge
			var s: Vector2 = along.call(a, rr)
			var want := (0.5 + 0.5 * edge * edge) * fade
			if GP.hash(i * 31 + j, floori(t * 30.0), 7801) > want:
				continue
			var tone := 4 if edge > 0.85 else (3 if edge > 0.6 else (2 if edge > 0.35 else 1))
			GP.dot(c, s.x, s.y, HUSH[tone], 2 if edge > 0.7 else 1, 1, 0.85)
	for band in [[1.0, 4, 0.95], [0.72, 3, 0.6]]:
		var r: float = front * float(band[0])
		var n := ceili(16.0 + r * 40.0)
		for j in n:
			var a := -half * 1.05 + (2.1 * half * (j + 0.5)) / n
			if GP.hash(j, floori(t * 30.0) + roundi(float(band[0]) * 7.0), 7803) < 0.15 + 0.5 * q:
				continue
			var s: Vector2 = along.call(a, r + 0.05 * sin(a * 13.0 + t * 30.0))
			GP.dot(c, s.x, s.y - 1.0, HUSH[int(band[1])], 2, 1, float(band[2]) * fade)
			GP.dot(c, s.x, s.y, HUSH[int(band[1]) - 2], 2, 1, float(band[2]) * fade)
	for i in 18:
		var a := -half + 2.0 * half * GP.hash(i, 1, 7802)
		var r := front * (0.85 + 0.15 * GP.hash(i, 2, 7802))
		var s := GP.at(x + (u.x * cos(a) - u.y * sin(a)) * r, y + (u.y * cos(a) + u.x * sin(a)) * r)
		GP.dot(c, s.x + u.x * 3.0 * q, s.y - 3.0 * GP.hash(i, 3, 7802) * q, DUST[i % 3], 1, 1, 0.7 * (1.0 - q))
