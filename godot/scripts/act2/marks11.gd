## WHAT FLOOR 11'S KINDS LAY ON THE FLOOR AND SEND OVER IT (and the city's own: the scribes are on every floor of the Hush): perils.gd's
## marks of kind "a1", stepped as their kinds' rules step them (game/act1_rules/<kind>.ts `peril`) and drawn as render/act1_fx/
## <kind>.ts draws them, the art's own painters brought over line for line (act2/gp.gd). marks.gd hands these here by the first word
## of their names.
##   scribe:mark   the ring closing on the spot the ink will land on, from as the quill is dipped until the ink leaves the nib
##                 (art/scribe_shots.ts drawInkMark); gone if the scribe is stopped before.
##   scribe:ink    the gob of ink in its arc from the nib (`a`, `b`, `c` game pixels up) to the spot (drawInkFlight); landing (`hit`),
##                 its splash and the pool of wet black ink, shrinking and drying away (drawInkSplat); its blow as it lands, and
##                 the pool's slowing.
##   watch:bite    where the Watchman's chop bit: the floor split on along the way he faced, the grit and sparks thrown up (painted
##                 here a frame at a time: act2/watch_paint.gd; render/act1_fx/watch.ts LANTERN_FX).
##   watch:lantern his lantern lobbed (`a`, `b` where from, `c` how high, `d` how high its arc rises; `hit` its flight): where it
##                 will smash marked, filling as it comes, its shadow under it, the lantern tumbling; its smash and the oil
##                 burning on the floor (the game's films, wa_*); its blow as it smashes, and the oil's burning, tick by tick.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const SCR := preload("res://scripts/act2/scribe.gd")
const WA := preload("res://scripts/act2/watch.gd")
const WP := preload("res://scripts/act2/watch_paint.gd")
const A1 := preload("res://scripts/act1/act1.gd")

## (art/mkit.ts FLAME; art/scribes.ts INK_BLACK, INK_SHEEN)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const INK_BLACK := Color("#050408")
const INK_SHEEN := Color("#3a3448")


static func gone(_P, _p: Dictionary) -> void:
	pass


## The watch's lantern, stepped (game/act1_rules/watch.ts peril): it smashes, then its oil burns.
static func _lantern(P, p: Dictionary) -> void:
	var hero = P.hero
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	if t < float(p["hit"]):
		return
	var up: bool = hero._act != "lunge"
	if int(p["done"]) == 0:
		# (it smashes: whoever is near is struck)
		p["done"] = 1
		if up and hero.world.distance_to(at) <= float(WA.POOL["burst"]) + A1.HERO_R * 0.5:
			P._hurt(p, p["dmg"], at, "fire")
		hero.kick(1.0)
		P.sfx.play("fire", linear_to_db(0.7))
		return
	# (the oil burns: whoever is in it is burned, tick by tick)
	var s := t - float(p["hit"])
	var next := float(WA.POOL["smash"]) + float(WA.OIL_BURN["tick"]) * (int(p["done"]) - 1)
	if s >= next and s < float(WA.POOL["burn"]) - float(WA.POOL["fade"]) * 0.5:
		p["done"] = int(p["done"]) + 1
		if up and WA.in_oil(hero.world - at, s):
			P._hurt(p, float(p["dmg"]) * float(WA.OIL_BURN["share"]), at, "fire")


static func step(P, p: Dictionary, _dt: float) -> bool:
	var hero = P.hero
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	match str(p["a1"]):
		"watch:lantern":
			_lantern(P, p)
		"scribe:mark":
			# (the scribe stopped before it flicks: the ring goes)
			if src == null or not is_instance_valid(src) or src.dead or src.state != "act":
				p["dur"] = t
		"scribe:ink":
			if t < float(p["hit"]):
				return true
			if int(p["done"]) == 0:
				# (it lands and bursts: whoever it lands on is struck)
				p["done"] = 1
				if hero.world.distance_to(at) <= SCR.SPLASH_R and hero._act != "lunge":
					P._hurt(p, p["dmg"], at)
				return true
			# (the pool: whoever stands in it is slowed, while he does and a moment after)
			if hero.alive and hero._act != "lunge" and hero.world.distance_to(at) <= SCR.pool_at(t - float(p["hit"])):
				hero.chill_k = maxf(hero.chill_k if hero.chill_t > 0.0 else 0.0, float(SCR.POOL["slow"]))
				hero.chill_t = maxf(hero.chill_t, float(SCR.POOL["linger"]))
	return true


## Among the figures (render/act1_fx/watch.ts standing).
static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"watch:bite":
			# (the flash, the sparks, the stones and the dust thrown up: behind and before one standing at the bite, 30 a second)
			var k := floori(t * 30.0) if t <= 1.0 else -1
			if k == int(p.get("wb_k", -2)):
				return
			p["wb_k"] = k
			for side in ["behind", "before"]:
				var pic: Dictionary = WP.bite(t, "air", Vector2(p["fx"], p["fy"]), side) if k >= 0 else {}
				_live_one(P, p, "fx_" + side, pic, at, at.x + at.y + (0.03 if side == "before" else -0.03))
		"watch:lantern":
			if t < float(p["hit"]):
				# (in flight, tumbling, its flame streaming)
				if P.has_film("wa_fly"):
					var w := WA.lantern_at(p)
					P._film_one(p, "fx_stand", P._still("wa_fly", "stand", floori(t * 30.0)), Vector2(w.x, w.y), w.x + w.y, false, w.z)
			else:
				var s = p.get("fx_stand")
				if s != null and is_instance_valid(s):
					s.visible = false
				if P.has_film("wa_smash"):
					P._film_stands(p, "wa_smash", t - float(p["hit"]), at)


## A picture painted here standing among the figures for a mark, kept with it under `key` (and gone with it): its floor point
## over `at`, at a depth of its own; hidden where there is none.
static func _live_one(P, p: Dictionary, key: String, pic: Dictionary, at: Vector2, depth: float) -> void:
	if P.stands == null:
		return
	var s = p.get(key)
	if s == null or not is_instance_valid(s):
		if pic.is_empty():
			return
		s = Sprite2D.new()
		s.centered = false
		P.stands.add_child(s)
		p[key] = s
	s.visible = not pic.is_empty()
	if pic.is_empty():
		return
	var scr := (Iso.to_screen(at.x, at.y) / 2.0).round() * 2.0
	s.texture = pic["tex"]
	s.position = Vector2(scr.x, depth * 16.0)
	s.offset = Vector2(pic["at"].x, pic["at"].y + scr.y - depth * 16.0)


## On the floor, under the figures (render/act1_fx/scribe.ts ground).
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"watch:bite":
			# (the floor split on along the way he faced, 10 a second)
			var k := floori(t * 10.0)
			if k != int(p.get("wf_k", -2)):
				p["wf_k"] = k
				p["wf"] = WP.bite(t, "floor", Vector2(p["fx"], p["fy"]))
			var pic: Dictionary = p["wf"]
			if not pic.is_empty():
				P.draw_texture(pic["tex"], (Iso.to_screen(at.x, at.y) / 2.0).round() * 2.0 + pic["at"])
		"watch:lantern":
			if t < float(p["hit"]):
				# (where it will smash marked, filling as it comes; its shadow under it)
				var k := A1.clamp01(t / float(p["hit"]))
				if P.has_film("wa_mark"):
					P._film_pic(P, "wa_mark", "floor", floori(k * 24.0), Iso.to_screen(at.x, at.y))
					var w := WA.lantern_at(p)
					P._film_pic(P, "wa_shadow", "floor", roundi(k * 20.0), Iso.to_screen(w.x, w.y))
			elif P.has_film("wa_oil"):
				P._film_floor("wa_oil", t - float(p["hit"]), at)
		"scribe:mark":
			var k := (t - float(SCR.FLICK["mark"])) / (float(p["hit"]) - float(SCR.FLICK["mark"]))
			if t > float(SCR.FLICK["mark"]):
				_ink_mark(P, float(p["x"]), float(p["y"]), k, P._clock)
		"scribe:ink":
			if t < float(p["hit"]):
				_ink_mark(P, float(p["x"]), float(p["y"]), 1.0, P._clock)
			else:
				_ink_splat(P, float(p["x"]), float(p["y"]), t - float(p["hit"]))


## Over what stands (render/act1_fx/scribe.ts air).
static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "scribe:ink" or float(p["t"]) >= float(p["hit"]):
		return
	_ink_flight(c, float(p["a"]), float(p["b"]), float(p["c"]), float(p["x"]), float(p["y"]), float(p["t"]))


## Their lights in the dark (the game's c.spot): the lantern in flight, and its oil burning.
static func spots(P, p: Dictionary) -> void:
	if str(p["a1"]) != "watch:lantern":
		return
	var t: float = p["t"]
	if t < float(p["hit"]):
		var w := WA.lantern_at(p)
		P.look.spot(P._px(Vector2(w.x, w.y)) + Vector2(0, -w.z), 12.0, 0.5)
	elif t - float(p["hit"]) <= float(WA.POOL["burn"]):
		P.look.spot(P._px(Vector2(p["x"], p["y"])) + Vector2(0, -4), 44.0, 0.6)


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


# --- art/scribe_shots.ts, line for line ---

static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


## drawInkMark: the ring closing in from wide to the pool's own size, `k` of the way through the warning.
static func _ink_mark(c: CanvasItem, x: float, y: float, k: float, t: float) -> void:
	if k <= 0.0:
		return
	var r: float = float(SCR.POOL["r"]) * (1.0 + 1.4 * (1.0 - _c01(k)))
	var n := 40
	for i in n:
		var a := (float(i) / n) * TAU + t * 1.5
		if i % 5 == 4:
			continue
		var s := GP.at(x + cos(a) * r, y + sin(a) * r)
		GP.dot(c, s.x, s.y, FLAME[2] if k > 0.7 else FLAME[1], 2, 1, 0.35 + 0.55 * _c01(k))
	for i in 4:
		var a := (float(i) / 4.0) * TAU + PI / 4.0
		var s := GP.at(x + cos(a) * r * 0.7, y + sin(a) * r * 0.7)
		GP.dot(c, s.x - 1.0, s.y, FLAME[1], 3, 1, 0.5 + 0.4 * _c01(k))


## drawInkFlight: the gob `t` s after it left the nib, from (x0, y0) `rise` up, to (x1, y1), on its arc, droplets trailing.
static func _ink_flight(c: CanvasItem, x0: float, y0: float, rise: float, x1: float, y1: float, t: float) -> void:
	var F: float = SCR.FLICK["flight"]
	if t < 0.0 or t >= F:
		return
	var u := t / F
	var arc: float = SCR.FLICK["arc"]
	var pos := func(v: float) -> Vector2:
		var a := GP.at(x0 + (x1 - x0) * v, y0 + (y1 - y0) * v)
		return Vector2(a.x, a.y - rise * (1.0 - v) - arc * 4.0 * v * (1.0 - v))
	for i in range(1, 7):
		var v := u - i * 0.035
		if v < 0.0:
			continue
		var d: Vector2 = pos.call(v)
		GP.dot(c, d.x + (GP.hash(i, 3, 2501) - 0.5) * 3.0, d.y + (GP.hash(i, 4, 2501) - 0.5) * 3.0, INK_BLACK if i < 3 else INK_SHEEN, 2 if i < 3 else 1, 2 if i < 3 else 1)
	var p: Vector2 = pos.call(u)
	var r := 2 + GP.rnd(2.0 * minf(1.0, u * 2.0))
	GP.fill(c, GP.rnd(p.x - r), GP.rnd(p.y - r + 1), r * 2, r * 2 - 1, INK_BLACK)
	GP.fill(c, GP.rnd(p.x - r + 1), GP.rnd(p.y - r), r * 2 - 2, r * 2 + 1, INK_BLACK)
	GP.dot(c, p.x - 1.0, p.y - r + 1, INK_SHEEN, 2, 1)
	GP.dot(c, p.x, p.y - r + 1, FLAME[1])


## drawInkSplat: `t` s after it landed: the pool, ragged, spreading at once and drying from its edge; a pink glint moving on it;
## the splash's star of droplets in the first fifth of a second.
static func _ink_splat(c: CanvasItem, x: float, y: float, t: float) -> void:
	var last: float = SCR.POOL["last"]
	if t < 0.0 or t >= last:
		return
	var grow := _c01(t / 0.12)
	var dry := 1.0 if t < last * 0.55 else 1.0 - (t - last * 0.55) / (last * 0.45)
	var R: float = float(SCR.POOL["r"]) * grow * (0.55 + 0.45 * dry)
	var step := 0.06
	var a_all := 0.92 * ((0.5 + 0.5 * dry) if dry < 1.0 else 1.0)
	var fx := -R
	while fx <= R:
		var fy := -R
		while fy <= R:
			var a := atan2(fy, fx)
			var edge := R * (0.82 + 0.18 * sin(a * 5.0 + 1.3) * cos(a * 3.0))
			var d := sqrt(fx * fx + fy * fy)
			if d <= edge:
				var s := GP.at(x + fx, y + fy)
				GP.dot(c, s.x, s.y, INK_SHEEN if d > edge - 0.06 else INK_BLACK, 1, 1, a_all)
			fy += step
		fx += step
	var ga := t * 1.7
	var g := GP.at(x + cos(ga) * R * 0.4, y + sin(ga) * R * 0.3)
	GP.dot(c, g.x - 1.0, g.y, FLAME[1], 3, 1, 0.8 * dry)
	GP.dot(c, g.x, g.y - 1.0, FLAME[2], 1, 1, 0.8 * dry)
	if t < 0.32:
		for i in 16:
			var a := (float(i) / 16.0) * TAU + GP.hash(i, 1, 2503) * 0.4
			var out := (0.4 + 0.9 * GP.hash(i, 2, 2503)) * (t / 0.32)
			var up := 14.0 * GP.hash(i, 3, 2503) * 4.0 * (t / 0.32) * (1.0 - t / 0.32)
			var s := GP.at(x + cos(a) * out, y + sin(a) * out)
			GP.dot(c, s.x, s.y - up, INK_SHEEN if i % 4 == 0 else INK_BLACK, 2, 2)
