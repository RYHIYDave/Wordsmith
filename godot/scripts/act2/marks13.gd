## WHAT FLOOR 13'S FIELDHANDS AND CARTERS LAY ON THE FLOOR AND THROW OVER IT: perils.gd's marks of kind "a1" (marks.gd hands them here
## by the first word of their names), drawn as render/act1_fx/fieldhand.ts and carter.ts draw them:
##   fieldhand:boom  while a fieldhand throws its sickle (its clock the throw's): the way it will fly marked on the ground, laid out and
##                   gone behind it; the sickle in flight, spinning (the game's films fh_curve_<v>, fh_sickle_<v>, as it is seen from in
##                   front or from behind, turned over as the game turns it); its glint in the dark.
##   carter:warn     the driver's lash's three rings marked in a line before the carter, where its cracks will fall (art/
##                   carter_shots.ts drawLashesWarn); gone if it is stopped.
##   carter:crack    where a crack struck: its sparks, its dust and its scuff (drawLashCrack).
##   carter:drag     the scrape of the hero dragged in on the lash, from where he was caught.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const FH := preload("res://scripts/act2/fieldhand.gd")
const CT := preload("res://scripts/act2/carter.gd")

const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const DUST: Array[Color] = [Color("#8a8472"), Color("#aaa48e"), Color("#c6bfa8")]
const SCUFF := Color("#2a2420")
## (carter_shots.ts LASH_MARK_R, LASH_SPARKS_FOR, LASH_CRACK_FOR, LASH_REACH, LASH_RIGHT)
const MARK_R := 0.2
const SPARKS_FOR := 0.3
const CRACK_FOR := 0.8
const REACH := [1.3, 1.95, 2.55]
const RIGHT := 0.10206207261596577


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _acting(src, id: String) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null \
		and str(src.h2.acts()[src.h2.act["i"]]["id"]) == id


static func step(_P, p: Dictionary, _dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"fieldhand:boom":
			if not _acting(src, "fieldhand:boom"):
				p["dur"] = t
		"carter:warn":
			if not _acting(src, "carter:lashes"):
				p["dur"] = t
		"carter:drag":
			if src == null or not is_instance_valid(src) or src.dead or src.h2 == null or int(src.h2.a1.get("grab", 0)) == 0:
				p["dur"] = t
	return t < float(p["dur"])


static func _view(f: Vector2) -> String:
	return "back" if f.x + f.y < -0.2 else "front"


static func _flip(f: Vector2) -> bool:
	return f.x - f.y < 0.0


## Among the figures: the sickle in flight.
static func stands(P, p: Dictionary) -> void:
	if str(p["a1"]) != "fieldhand:boom":
		return
	var src = p.get("src")
	if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
		var s = p.get("fx_stand")
		if s != null and is_instance_valid(s):
			s.visible = false
		return
	var t: float = src.h2.act["t"]
	var i := FH.sickle_frame(t)
	var q = FH.boom_at(t)
	var name := "fh_sickle_" + _view(src.face)
	if i < 0 or q == null or not P.has_film(name):
		var s = p.get("fx_stand")
		if s != null and is_instance_valid(s):
			s.visible = false
		return
	var w := A1.beside(src.world, src.face, src.h2.act["hand"], q.x, q.y)
	P._film_one(p, "fx_stand", P._still(name, "stand", i), w, w.x + w.y, _flip(src.face))


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"fieldhand:boom":
			if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
				return
			var i := FH.curve_frame(src.h2.act["t"])
			var name := "fh_curve_" + _view(src.face)
			if i >= 0 and P.has_film(name):
				P._film_pic(P, name, "floor", i, Iso.to_screen(src.world.x, src.world.y), _flip(src.face))
		"carter:warn":
			if not _acting(src, "carter:lashes"):
				return
			var D: Dictionary = CT.LASHES
			var T: float = src.h2.act["t"]
			if T >= float(D["warn"][0]):
				var o := _warn_from(src, src.h2.act["hand"])
				_lashes_warn(P, o, src.face, minf(1.0, (T - float(D["warn"][0])) / (float(D["cracks"][0]) - float(D["warn"][0]))))
		"carter:crack":
			_lash_crack(P, float(p["x"]), float(p["y"]), t)
		"carter:drag":
			if src != null and is_instance_valid(src) and src.h2 != null and int(src.h2.a1.get("grab", 0)) != 0:
				P._scrape(P.hero.world, Vector2(src.h2.a1["ox"], src.h2.a1["oy"]), 1.0)


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


## The sickle's glint in the dark (render/act1_fx/fieldhand.ts c.spot).
static func spots(P, p: Dictionary) -> void:
	if str(p["a1"]) != "fieldhand:boom":
		return
	var src = p.get("src")
	if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
		return
	var q = FH.boom_at(src.h2.act["t"])
	if q == null:
		return
	var w := A1.beside(src.world, src.face, src.h2.act["hand"], q.x, q.y)
	P.look.spot(P._px(w) + Vector2(0, -16), 14.0, 0.4)


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


# --- art/carter_shots.ts, line for line ---

static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## lashSpots: the art's three rings, from one at `at` facing `f`.
static func _spots(at: Vector2, f: Vector2) -> Array:
	var u := f.normalized() if f.length() > 0.0 else Vector2(1, 0)
	var out: Array = []
	for r in REACH:
		out.append(Vector2(at.x + u.x * r - u.y * RIGHT, at.y + u.y * r + u.x * RIGHT))
	return out


## lashesWarnFrom: where the warning is drawn from, so that its rings lie where the cracks will fall (crackSpot).
static func _warn_from(m, hand: int) -> Vector2:
	var want := CT.crack_spot(m, hand, 0)
	var a: Vector2 = _spots(m.world, m.face)[0]
	return m.world + want - a


## drawLashesWarn: three rings of the enemy's pink in a line before them, one after another, its middle darkening.
static func _lashes_warn(c: CanvasItem, at: Vector2, f: Vector2, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var spots := _spots(at, f)
	for i in spots.size():
		var cxy: Vector2 = spots[i]
		var shown := _sm((k - i * 0.22) / 0.3)
		if shown <= 0.0:
			continue
		for j in 10:
			var a := j * 2.39996
			var r := MARK_R * 0.55 * sqrt((j + 0.5) / 10.0)
			var s := GP.at(cxy.x + cos(a) * r, cxy.y + sin(a) * r)
			GP.dot(c, s.x, s.y, Color("#1a1016"), 2, 1, 0.4 * shown)
		var n := 28
		for j in n:
			if (floori(j / 2.0 + k * 8.0) & 1) == 0:
				continue
			var a := (float(j) / n) * PI * 2.0
			var s := GP.at(cxy.x + cos(a) * MARK_R, cxy.y + sin(a) * MARK_R)
			GP.dot(c, s.x, s.y, FLAME[3] if k > 0.75 else FLAME[2], 2, 1, shown * (0.45 + 0.55 * k))


## drawLashCrack: the scuff where the cracker struck; the dust puffed out and settling; the sparks flung up and out and falling.
static func _lash_crack(c: CanvasItem, x: float, y: float, t: float) -> void:
	if t < 0.0 or t >= CRACK_FOR:
		return
	var a0 := 1.0 - _sm((t - (CRACK_FOR - 0.4)) / 0.4)
	for i in 14:
		var a := i * 2.39996
		var r := 0.04 + 0.14 * GP.hash(i, 1, 7811)
		var s := GP.at(x + cos(a) * r, y + sin(a) * r * 0.6)
		GP.dot(c, s.x, s.y, SCUFF, 2 if i % 3 == 0 else 1, 1, a0)
	if t < 0.5:
		var q := t / 0.5
		for i in 18:
			var a := (float(i) / 18.0) * PI * 2.0
			var r := 0.1 + (MARK_R - 0.1) * _sm(q * 1.4)
			if GP.hash(i, floori(t * 20.0), 7812) < q * 0.8:
				continue
			var s := GP.at(x + cos(a) * r, y + sin(a) * r)
			GP.dot(c, s.x, s.y - 1.0 - 2.0 * sin(PI * q), DUST[i % 3], 1, 1, 0.85 * (1.0 - q))
	if t < SPARKS_FOR:
		var q := t / SPARKS_FOR
		for i in 16:
			var a := i * 2.39996 + GP.hash(i, 2, 7813)
			var r := (0.1 + 0.3 * GP.hash(i, 3, 7813)) * sqrt(q)
			var s := GP.at(x + cos(a) * r, y + sin(a) * r)
			var col: Color = FLAME[4] if i % 3 == 0 else (FLAME[3] if i % 3 == 1 else FLAME[2])
			GP.dot(c, s.x, s.y - 18.0 * 4.0 * q * (1.0 - q) * (0.4 + GP.hash(i, 4, 7813)), col, 2 if q < 0.4 else 1, 1, 1.0 - q * q)
