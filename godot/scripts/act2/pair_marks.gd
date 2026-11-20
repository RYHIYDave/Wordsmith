## WHAT FLOOR 13'S PAIR LAY ON THE PULPING FLOOR: perils.gd's marks of kind "a1" named "scraper:" and "quill:" (marks.gd hands them
## here), stepped as their rules step them (game/act1_rules/scraper.ts and quill.ts `peril`) and drawn as render/act1_fx/scraper.ts and
## quill.ts draw them, the art's own painters brought over line for line (art/pair_shots.ts: drawn in the game's pixels):
##   scraper:aim    the warning of the move the Scraper is making (`c`: 0 the snap's ring closing, 1 the rush's lane, 2 the scour's
##                  fan, 3 the strip), until its blow; gone if it is stopped.
##   scraper:snap   where its claw snapped: the splash of ink and the burst of grit.
##   scraper:scour  the fan scraped raw, its gouges, the shreds thrown up.
##   scraper:rush   its wake, the floor ploughed up along the lane behind it.
##   scraper:strip  the strip scraped bare (`d` 0 bare, 1 written, 2 written to its end at `a`; `b` how much is written; `done` 0
##                  lying, 1 bursting from `c`, 2 fading; `hit` once the burst struck), all at their ultimate's speed.
##   quill:aim      the stab's ring closing; quill:stab: the splash where its nib struck.
##   quill:line     a line of its ink lines (`c` which): laid, wet and burning, bursting, its stain drying.
##   quill:overwrite  the Quill's fresh writing crawling over the Scraper's back while it writes over its wounds.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const SR := preload("res://scripts/act2/scraper.gd")
const QL := preload("res://scripts/act2/quill.gd")

const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (pair_shots.ts INK, RAW, GOUGE)
const INK: Array[Color] = [Color("#06050a"), Color("#16131d"), Color("#3a3448"), Color("#2a2830")]
const RAW: Array[Color] = [Color("#6e6858"), Color("#8c8572"), Color("#aaa28c"), Color("#c8bfa6")]
const GOUGE := Color("#24211c")
const SWEEP := 0.5
const STRIP_RUN := 0.5
## (render/act1_fx/scraper.ts BACK: how high its back is, game pixels)
const BACK := 18.0
const MOVE_OF := ["scraper:snap", "scraper:rush", "scraper:scour", "scraper:strip"]


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _acting(src, id: String) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null \
		and str(src.h2.acts()[src.h2.act["i"]]["id"]) == id


static func step(P, p: Dictionary, _dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"scraper:aim":
			if not _acting(src, MOVE_OF[int(p["c"])]):
				p["dur"] = t
		"quill:aim":
			if not _acting(src, "quill:stab"):
				p["dur"] = t
		"quill:overwrite":
			if src == null or not is_instance_valid(src) or src.dead or src.h2 == null or int(src.h2.a1.get("written", 0)) == 0:
				p["dur"] = t
		"scraper:strip":
			_strip(P, p)
		"quill:line":
			_line_step(P, p)
	return t < float(p["dur"])


## THE STRIP (scraper.ts peril), at the ultimate's speed: written as the Quill swoops down it; bursting after, from its far end in.
static func _strip(P, p: Dictionary) -> void:
	var hero = P.hero
	var rate: float = SR.COMBO["rate"]
	var t: float = p["t"]
	var m = p.get("src")
	var q = SR.partner_of(m) if m != null and is_instance_valid(m) and not m.dead else null
	if int(p["done"]) == 0:
		var swoop = q.h2.act if q != null and q.h2.act != null and q.h2.acts()[q.h2.act["i"]]["id"] == "quill:swoop" else null
		if int(p["d"]) == 0 and swoop != null:
			p["d"] = 1
		if int(p["d"]) == 1 and swoop != null:
			p["b"] = SR.written_at(swoop["t"])
		if int(p["d"]) == 1 and float(p["b"]) >= 1.0:
			p["d"] = 2
			p["a"] = t
		if int(p["d"]) == 2 and t - float(p["a"]) >= SR.STRIP_BURST_AFTER / rate:
			# (written to its near end: it bursts after)
			p["done"] = 1
			p["c"] = t
			p["dur"] = t + (SR.STRIP_BURST_RUN + SR.STRIP_STAIN_FOR) / rate
			P.sfx.play("slam", linear_to_db(0.9))
			hero.kick(5.0)
		elif int(p["d"]) != 2 and (q == null or (int(p["d"]) == 1 and swoop == null) or (int(p["d"]) == 0 and t > 3.0)):
			# (the Quill felled before it had written it, or never coming: it lies and fades)
			p["done"] = 2
			p["c"] = t
			p["dur"] = minf(float(p["dur"]), t + 1.2)
		return
	if int(p["done"]) != 1 or int(p["hit"]) != 0:
		return
	# THE BURST runs along it from its far end: whoever is on it as it passes him is struck
	var f := Vector2(p["fx"], p["fy"])
	var r := SR.rel_of(Vector2(p["x"], p["y"]), f, hero.world)
	var e := A1.HERO_R * 0.5
	if r.x < SR.STRIP_FROM - e or r.x > SR.STRIP_FROM + SR.STRIP_TILES + e or absf(r.y) > SR.STRIP_HALF + e:
		return
	var since := (t - float(p["c"])) * rate
	var when := SR.burst_reaches(clampf(r.x, SR.STRIP_FROM, SR.STRIP_FROM + SR.STRIP_TILES))
	if since >= when and since <= when + SR.STRIP_BURST_FOR and A1.open_to(hero):
		p["hit"] = 1
		P._hurt(p, p["dmg"], hero.world)
		A1.knock(hero, hero.world - f, 0.5)


## ITS LINE BURSTS LINE_BURST_AFTER its stroke: whoever is on it as it bursts is struck (quill.ts peril).
static func _line_step(P, p: Dictionary) -> void:
	if int(p["done"]) != 0:
		return
	var since := float(p["t"]) - QL.LINE_STROKE - QL.LINE_BURST_AFTER
	if since < 0.0 or since > QL.LINE_BURST_FOR:
		return
	var hero = P.hero
	if not A1.open_to(hero) or not QL.on_line(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), int(p["c"]), hero.world):
		return
	p["done"] = 1
	P._hurt(p, p["dmg"], hero.world)


static func stands(_P, _p: Dictionary) -> void:
	pass


## (through: how far through a warning from `from` to its blow `to`, `t` seconds in)
static func _through(t: float, from: float, to: float) -> float:
	return clampf((t - from) / maxf(1e-6, to - from), 0.0, 1.0)


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	var f := Vector2(p["fx"], p["fy"])
	var src = p.get("src")
	match str(p["a1"]):
		"scraper:aim":
			if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
				return
			var T: float = src.h2.act["t"]
			var w: Vector2 = src.world
			match int(p["c"]):
				0:
					_snap_warn(P, w.x, w.y, src.face, maxf(0.02, _through(T, 0.04, SR.SNAP_HIT)))
				2:
					_scour_warn(P, w.x, w.y, src.face, maxf(0.02, _through(T, 0.1, SR.SCOUR["slam"])))
				1:
					_rush_warn(P, float(src.h2.act["x"]), float(src.h2.act["y"]), src.face, maxf(0.02, _through(T, 0.05, SR.RUSH["go"])))
				3:
					_strip_warn(P, w.x, w.y, src.face, maxf(0.02, _through(T, 0.1, SR.STRIP_SLAM)))
		"scraper:snap":
			_snap(P, x, y, f, t)
		"scraper:scour":
			_scour(P, x, y, f, t)
		"scraper:rush":
			var run: float = float(SR.RUSH["stop"]) - float(SR.RUSH["go"])
			_rush_wake(P, x, y, f, t, SR.RUSH_TILES * _sm(minf(t, run) / run))
		"scraper:strip":
			var rate: float = SR.COMBO["rate"]
			if int(p["done"]) == 1:
				var since := (t - float(p["c"])) * rate
				if since < SR.STRIP_BURST_RUN:
					_strip_lies(P, x, y, f, t * rate, 1.0, 1.0)
				_strip_burst(P, x, y, f, since)
			elif int(p["done"]) == 2:
				# (the game draws it at its own strength as it fades: its painters set their own)
				_strip_lies(P, x, y, f, t * rate, float(p["b"]), 1.0)
			else:
				_strip_lies(P, x, y, f, t * rate, float(p["b"]), 1.0)
		"quill:aim":
			if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
				return
			_stab_warn(P, src.world.x, src.world.y, src.face, QL.STAB_AT, maxf(0.02, _through(float(src.h2.act["t"]), 0.04, QL.STAB_HIT)))
		"quill:stab":
			_stab(P, x, y, f, QL.STAB_AT, t)
		"quill:line":
			# (its Quill felled before it burst: it dries where it lies, and does not burst)
			if int(p["done"]) == 2 and t > QL.LINE_STROKE + QL.LINE_BURST_AFTER:
				return
			_ink_line(P, x, y, f, int(p["c"]), t)


## Over what stands: the Quill's fresh writing over the Scraper's back.
static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "quill:overwrite":
		return
	var s = p.get("src")
	if s == null or not is_instance_valid(s) or s.dead:
		return
	var q = p.get("q")
	var t := 0.0
	if q != null and is_instance_valid(q) and q.h2 != null and q.h2.act != null and q.h2.acts()[q.h2.act["i"]]["id"] == "quill:write":
		t = q.h2.act["t"]
	var at := GP.at(s.world.x, s.world.y)
	_overwriting(c, at.x, at.y - BACK, t)


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


# --- art/pair_shots.ts, line for line (drawn in the game's pixels) ---

static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## frame: its facing and its left on the floor, as unit vectors.
static func _frame(d: Vector2) -> Array:
	var l := d.length()
	if l == 0.0:
		l = 1.0
	return [d / l, Vector2(d.y / l, -d.x / l)]


## onFloor: a point `f` tiles ahead and `s` to its left of (x, y), on the screen (game pixels).
static func _on(x: float, y: float, F: Array, f: float, s: float) -> Vector2:
	return GP.at(x + F[0].x * f + F[1].x * s, y + F[0].y * f + F[1].y * s)


## fillFloor: a shape on the floor given by its outline (ahead, left), in `col` at `alpha`.
static func _fill(c: CanvasItem, x: float, y: float, F: Array, outline: Array, col: Color, alpha: float) -> void:
	if alpha <= 0.0 or outline.size() < 3:
		return
	var pts := PackedVector2Array()
	for o in outline:
		pts.append(_on(x, y, F, o[0], o[1]) * 2.0)
	var area := 0.0
	for i in pts.size():
		area += pts[i].cross(pts[(i + 1) % pts.size()])
	if absf(area) < 1.0:
		return
	c.draw_colored_polygon(pts, Color(col, col.a * minf(1.0, alpha)))


## dashFloor: the outline of a shape on the floor as a dashed line of the enemy's pink, its dashes running along it with `k`.
static func _dash(c: CanvasItem, x: float, y: float, F: Array, outline: Array, k: float, alpha: float) -> void:
	var run := 0.0
	for i in outline.size():
		var a: Array = outline[i]
		var b: Array = outline[(i + 1) % outline.size()]
		var L := Vector2(b[0] - a[0], b[1] - a[1]).length()
		var n := maxi(1, ceili(L / 0.05))
		for j in n:
			var u := float(j) / n
			var d := run + u * L
			if (floori(d / 0.22 - k * 6.0) & 1) == 0:
				continue
			var s := _on(x, y, F, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)
			GP.dot(c, s.x, s.y, FLAME[3] if k > 0.75 else FLAME[2], 2, 2, alpha)
		run += L


## ringAt: a ring on the floor round (f, s), radius `r`.
static func _ring(f: float, s: float, r: float, n := 40) -> Array:
	var out: Array = []
	for i in n:
		out.append([f + cos((float(i) / n) * PI * 2.0) * r, s + sin((float(i) / n) * PI * 2.0) * r])
	return out


## burst: ink and grit bursting out round (f, s), `t` seconds after, out to `reach`; black and the enemy's pink.
static func _burst(c: CanvasItem, x: float, y: float, F: Array, f: float, s: float, t: float, reach: float, n: int, seed: int, life := 0.5) -> void:
	if t < 0.0 or t > life:
		return
	var k := t / life
	for i in n:
		var a := GP.hash(i, 1, seed) * PI * 2.0
		var r := reach * (0.25 + 0.75 * GP.hash(i, 2, seed)) * _sm(k * 1.8)
		var up := 26.0 * sin(PI * minf(1.0, k * 1.3)) * (0.4 + 0.6 * GP.hash(i, 3, seed))
		var q := _on(x, y, F, f + cos(a) * r, s + sin(a) * r)
		GP.dot(c, q.x, q.y - up, FLAME[2] if i % 5 == 0 else (INK[0] if i % 3 != 0 else INK[2]), 2, 2, 1.0 - _sm((k - 0.6) / 0.4))


## splash: a splash of ink lying on the floor round (f, s), radius `r`, drying over `life`.
static func _splash(c: CanvasItem, x: float, y: float, F: Array, f: float, s: float, r: float, t: float, life: float, seed: int) -> void:
	if t < 0.0 or t > life:
		return
	var dry := _sm((t - life * 0.4) / (life * 0.6))
	var out: Array = []
	for i in 28:
		var a := (float(i) / 28.0) * PI * 2.0
		var rr := r * (0.55 + 0.45 * GP.hash(i, 4, seed)) * _sm(t / 0.08)
		out.append([f + cos(a) * rr, s + sin(a) * rr])
	_fill(c, x, y, F, out, INK[0], 0.8 * (1.0 - dry))
	for i in 26:
		var a := GP.hash(i, 5, seed) * PI * 2.0
		var rr := r * (1.0 + 0.5 * GP.hash(i, 6, seed))
		if GP.hash(i, 7, seed) < dry:
			continue
		var q := _on(x, y, F, f + cos(a) * rr, s + sin(a) * rr)
		GP.dot(c, q.x, q.y, INK[1], 2, 2, 0.9)
	for i in 7:
		var a := (float(i) / 7.0) * PI * 2.0 + GP.hash(i, 8, seed)
		for j in 14:
			var rr := r * (0.2 + 0.08 * j)
			var q := _on(x, y, F, f + cos(a + 0.1 * sin(j)) * rr, s + sin(a + 0.1 * sin(j)) * rr)
			GP.dot(c, q.x, q.y, GOUGE, 1, 1, 0.7 * (1.0 - dry))


static func _snap_warn(c: CanvasItem, x: float, y: float, d: Vector2, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var F := _frame(d)
	var r := SR.SNAP_R * (1.6 - 0.6 * _sm(k))
	_fill(c, x, y, F, _ring(SR.SNAP_AT.x, SR.SNAP_AT.y, SR.SNAP_R), FLAME[0], 0.18 + 0.2 * k)
	_dash(c, x, y, F, _ring(SR.SNAP_AT.x, SR.SNAP_AT.y, r), k, 0.5 + 0.5 * k)


static func _snap(c: CanvasItem, x: float, y: float, d: Vector2, t: float) -> void:
	var F := _frame(d)
	_splash(c, x, y, F, SR.SNAP_AT.x, SR.SNAP_AT.y, SR.SNAP_R * 0.75, t, SR.SNAP_FOR, 6101)
	_burst(c, x, y, F, SR.SNAP_AT.x, SR.SNAP_AT.y, t, SR.SNAP_R, 30, 6102, 0.45)


static func _fan(reach: float, half: float, from := 0.0) -> Array:
	var out: Array = [[from, 0.0]]
	var h := deg_to_rad(half)
	for i in 33:
		var a := -h + (2.0 * h * i) / 32.0
		out.append([cos(a) * reach, sin(a) * reach])
	return out


static func _scour_warn(c: CanvasItem, x: float, y: float, d: Vector2, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var F := _frame(d)
	var fan := _fan(SR.SCOUR_REACH, SR.SCOUR_HALF)
	_fill(c, x, y, F, fan, FLAME[0], 0.14 + 0.22 * k)
	_dash(c, x, y, F, fan, k, 0.5 + 0.5 * k)


static func _scour(c: CanvasItem, x: float, y: float, d: Vector2, t: float) -> void:
	if t < 0.0 or t > SR.SCOUR_FOR:
		return
	var F := _frame(d)
	var swept := _sm(t / SWEEP)
	var fade := 1.0 - _sm((t - SR.SCOUR_FOR * 0.45) / (SR.SCOUR_FOR * 0.55))
	var h := deg_to_rad(SR.SCOUR_HALF)
	for side in [1.0, -1.0]:
		var out: Array = [[0.0, 0.0]]
		for i in 17:
			var a: float = side * (h - h * swept * (i / 16.0))
			out.append([cos(a) * SR.SCOUR_REACH, sin(a) * SR.SCOUR_REACH])
		_fill(c, x, y, F, out, RAW[2], 0.7 * fade)
	for side in [1.0, -1.0]:
		for k in 4:
			var r := SR.SCOUR_REACH * (0.62 + 0.11 * k)
			var n := 60
			var i := 0
			while i <= n * swept:
				var a: float = side * (h - (h * i) / n)
				var q := _on(x, y, F, cos(a) * r, sin(a) * r)
				GP.dot(c, q.x, q.y, GOUGE if k % 2 != 0 else INK[1], 2, 1, 0.85 * fade)
				i += 1
		if t < SWEEP + 0.2:
			var a: float = side * (h - h * swept)
			for i in 16:
				var r := SR.SCOUR_REACH * (0.55 + 0.45 * GP.hash(i, 1, 6201 + int(side)))
				var a2: float = a - side * 0.12 * GP.hash(i, 2, 6201)
				var up := 30.0 * GP.hash(i, 3, 6201) * (1.0 - _sm((t - SWEEP) / 0.2))
				var q := _on(x, y, F, cos(a2) * r, sin(a2) * r)
				GP.dot(c, q.x, q.y - up, RAW[3] if i % 3 != 0 else INK[0], 2, 2)


static func _rush_warn(c: CanvasItem, x: float, y: float, d: Vector2, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var F := _frame(d)
	var lane := [[0.0, -SR.RUSH_HALF], [0.0, SR.RUSH_HALF], [-SR.RUSH_LANE, SR.RUSH_HALF], [-SR.RUSH_LANE, -SR.RUSH_HALF]]
	_fill(c, x, y, F, lane, FLAME[0], 0.14 + 0.22 * k)
	_dash(c, x, y, F, lane, k, 0.5 + 0.5 * k)


static func _rush_wake(c: CanvasItem, x: float, y: float, d: Vector2, t: float, gone: float) -> void:
	if t < 0.0 or t > SR.RUSH_WAKE_FOR + 0.5:
		return
	var F := _frame(d)
	var fade := 1.0 - _sm((t - 0.5) / SR.RUSH_WAKE_FOR)
	var back := gone + 2.0
	var h := SR.RUSH_HALF * 0.75
	_fill(c, x, y, F, [[-0.6, -h], [-0.6, h], [-back, h], [-back, -h]], RAW[0], 0.5 * fade)
	for s in [-0.85, -0.3, 0.3, 0.85]:
		var f := -0.6
		while f > -back:
			var q := _on(x, y, F, f, s * SR.RUSH_HALF + 0.05 * sin(f * 7.0))
			GP.dot(c, q.x, q.y, GOUGE if absf(s) > 0.5 else INK[1], 2, 1, 0.85 * fade)
			f -= 0.04


static func _box(from: float, to: float, half := SR.STRIP_HALF) -> Array:
	return [[from, -half], [from, half], [to, half], [to, -half]]


static func _strip_warn(c: CanvasItem, x: float, y: float, d: Vector2, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var F := _frame(d)
	var box := _box(SR.STRIP_FROM, SR.STRIP_FROM + SR.STRIP_TILES)
	_fill(c, x, y, F, box, FLAME[0], 0.12 + 0.2 * k)
	_dash(c, x, y, F, box, k, 0.5 + 0.5 * k)


## drawStrip: the strip scraped bare, its edges gouged; shreds at its head as it runs out; the Quill's writing down its middle
## (`written` of it, from its far end), its ink burning pink. `fade`: the whole of it, as a picture drawn fainter.
static func _strip_lies(c: CanvasItem, x: float, y: float, d: Vector2, t: float, written: float, fade: float) -> void:
	if t < 0.0 or fade <= 0.0:
		return
	var F := _frame(d)
	var run := _sm(t / STRIP_RUN)
	var to := SR.STRIP_FROM + SR.STRIP_TILES * run
	_fill(c, x, y, F, _box(SR.STRIP_FROM, to), RAW[1], 0.6 * fade)
	for s in [-1.0, -0.55, 0.0, 0.55, 1.0]:
		var f := SR.STRIP_FROM
		while f < to:
			var j := floori(f * 25.0)
			if not (absf(s) < 0.9 and GP.hash(j, GP.rnd(s * 10.0), 6301) < 0.35):
				var q := _on(x, y, F, f, s * SR.STRIP_HALF * ((1.0 + 0.06 * GP.hash(j, 2, 6302)) if absf(s) > 0.9 else 1.0))
				GP.dot(c, q.x, q.y, GOUGE if absf(s) > 0.9 else RAW[0], 2, 1, 0.9 * fade)
			f += 0.04
	if t < STRIP_RUN + 0.2:
		for i in 18:
			var s := (GP.hash(i, 1, 6303) - 0.5) * 2.0 * SR.STRIP_HALF
			var up := 34.0 * GP.hash(i, 2, 6303) * (1.0 - _sm((t - STRIP_RUN) / 0.2))
			var q := _on(x, y, F, to - 0.3 * GP.hash(i, 3, 6303), s)
			GP.dot(c, q.x, q.y - up, RAW[3] if i % 3 != 0 else INK[0], 2, 2, fade)
	if written > 0.0:
		var w0 := SR.STRIP_FROM + SR.STRIP_TILES * (1.0 - clampf(written, 0.0, 1.0))
		var end := SR.STRIP_FROM + SR.STRIP_TILES
		var pulse := 0.5 + 0.5 * sin(t * 18.0)
		var f := w0
		while f < end:
			var j := floori(f * 33.0)
			var wob := 0.18 * sin(f * 9.0) + 0.08 * sin(f * 23.0)
			var s := -0.16
			while s <= 0.16 + 1e-9:
				var q := _on(x, y, F, f, wob + s)
				GP.dot(c, q.x, q.y, INK[0], 2, 2, fade)
				s += 0.08
			if GP.hash(j, 1, 6304) < 0.4:
				var s2 := (-1.0 if GP.hash(j, 2, 6304) < 0.5 else 1.0) * (0.3 + 0.35 * GP.hash(j, 3, 6304))
				var q := _on(x, y, F, f, wob + s2)
				GP.dot(c, q.x, q.y, INK[1], 2, 2, fade)
			if GP.hash(j, 4, 6304) < 0.25 * pulse + 0.1:
				var q := _on(x, y, F, f, wob)
				GP.dot(c, q.x, q.y - 1.0, FLAME[2] if GP.hash(j, 5, 6304) < 0.5 else FLAME[3], 2, 2, fade)
			f += 0.03


## drawStripBurst: the burst running along it from its far end, a wall of ink up out of it, its stain drying.
static func _strip_burst(c: CanvasItem, x: float, y: float, d: Vector2, t: float) -> void:
	if t < 0.0 or t > SR.STRIP_BURST_RUN + SR.STRIP_STAIN_FOR:
		return
	var F := _frame(d)
	var run := SR.STRIP_TILES * _sm(t / SR.STRIP_BURST_RUN)
	var far := SR.STRIP_FROM + SR.STRIP_TILES
	var dry := _sm((t - SR.STRIP_BURST_RUN - 0.3) / (SR.STRIP_STAIN_FOR - 0.3))
	_fill(c, x, y, F, _box(far - run, far, SR.STRIP_HALF * 1.05), INK[0], 0.5 * (1.0 - dry))
	_wall(c, x, y, F, far, SR.STRIP_FROM, SR.STRIP_HALF, t, SR.STRIP_BURST_RUN, SR.STRIP_BURST_FOR, 6401)


## wall: a wall of ink up out of the floor from `from` to `to` ahead, `half` either side, running along it in `run_for`.
static func _wall(c: CanvasItem, x: float, y: float, F: Array, from: float, to: float, half: float, t: float, run_for: float, life: float, seed: int) -> void:
	for i in 160:
		var u := GP.hash(i, 1, seed)
		var f := from + u * (to - from)
		var s := t - run_for * u
		if s < 0.0 or s > life:
			continue
		var k := s / life
		var side := (GP.hash(i, 2, seed) - 0.5) * 2.0 * half
		var up := (24.0 + 30.0 * GP.hash(i, 3, seed)) * sin(PI * minf(1.0, k * 1.2))
		var q := _on(x, y, F, f, side)
		var al := 1.0 - _sm((k - 0.6) / 0.4)
		for n in 4:
			GP.dot(c, q.x, q.y - up * (n / 3.0), FLAME[2] if (n == 3 and i % 4 == 0) else (INK[2] if n == 3 else INK[0]), 2, 3, al)
		if i % 6 == 0:
			GP.dot(c, q.x + (GP.hash(i, 4, seed) - 0.5) * 10.0, q.y - up - 6.0 * k, FLAME[3], 2, 2, al)


static func _stab_warn(c: CanvasItem, x: float, y: float, d: Vector2, ahead: float, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var F := _frame(d)
	_fill(c, x, y, F, _ring(ahead, 0.0, QL.STAB_R), FLAME[0], 0.18 + 0.2 * k)
	_dash(c, x, y, F, _ring(ahead, 0.0, QL.STAB_R * (1.6 - 0.6 * _sm(k))), k, 0.5 + 0.5 * k)


static func _stab(c: CanvasItem, x: float, y: float, d: Vector2, ahead: float, t: float) -> void:
	var F := _frame(d)
	_splash(c, x, y, F, ahead, 0.0, QL.STAB_R * 0.8, t, QL.STAB_FOR, 6501)
	_burst(c, x, y, F, ahead, 0.0, t, QL.STAB_R, 34, 6502, 0.45)


## drawInkLine: line `i` of its ink lines, `t` seconds after its stroke: laid, wet and burning; then its burst; its stain drying.
static func _ink_line(c: CanvasItem, x: float, y: float, d: Vector2, i: int, t: float) -> void:
	if t < 0.0:
		return
	var F := _frame(d)
	var ahead: float = QL.LINES_AT[i] if i >= 0 and i < 3 else QL.LINES_AT[0]
	var laid := _sm(t / QL.LINE_STROKE)
	var bursts := t - QL.LINE_STROKE - QL.LINE_BURST_AFTER
	if bursts > QL.LINE_STAIN_FOR:
		return
	var dir := -1.0 if i % 2 != 0 else 1.0
	var half := QL.LINE_LONG / 2.0
	var slant := 0.25 * (i - 1)
	var along0 := -dir * half
	var along1 := along0 + dir * QL.LINE_LONG * laid
	var lo := minf(along0, along1)
	var hi := maxf(along0, along1)
	var box := [[ahead - QL.LINE_HALF + slant * lo / half, lo], [ahead + QL.LINE_HALF + slant * lo / half, lo], [ahead + QL.LINE_HALF + slant * hi / half, hi], [ahead - QL.LINE_HALF + slant * hi / half, hi]]
	var dry := _sm((bursts - 0.2) / (QL.LINE_STAIN_FOR - 0.2)) if bursts > 0.0 else 0.0
	_fill(c, x, y, F, box, INK[0], 0.82 * (1.0 - dry))
	if bursts < 0.0:
		var k := clampf((t - QL.LINE_STROKE) / QL.LINE_BURST_AFTER, 0.0, 1.0)
		var s := lo
		while s < hi:
			for e in [-1, 1]:
				if GP.hash(floori(s * 20.0), e + 2, 6601 + i) > 0.55 + 0.4 * k:
					continue
				var q := _on(x, y, F, ahead + e * QL.LINE_HALF + slant * s / half, s)
				GP.dot(c, q.x, q.y, FLAME[3] if k > 0.7 else FLAME[2], 2, 2, 0.6 + 0.4 * k)
			s += 0.05
		if t < QL.LINE_STROKE + 0.05:
			for n in 10:
				var q := _on(x, y, F, ahead + (GP.hash(n, 1, 6602) - 0.5) * 1.2, along1 + (GP.hash(n, 2, 6602) - 0.5) * 0.6)
				GP.dot(c, q.x, q.y - 8.0 * GP.hash(n, 3, 6602), INK[0], 2, 2)
	else:
		# (the burst: a wall of ink up out of it, end to end, in the line's own frame)
		var G := [F[1], -F[0]]
		_wall(c, x + F[0].x * ahead, y + F[0].y * ahead, G, -half, half, QL.LINE_HALF, bursts, 0.12, QL.LINE_BURST_FOR, 6603 + i)


## drawOverwriting: letters written at the nib's side crawling round over the Scraper's back and sinking in (`sx`, `sy` game pixels).
static func _overwriting(c: CanvasItem, sx: float, sy: float, t: float) -> void:
	if t < 0.0:
		return
	for i in 26:
		var t0 := (i / 26.0) * 1.3
		var s := fmod(fmod(t - t0, 1.3) + 1.3, 1.3)
		if t < t0:
			continue
		var k := s / 1.3
		var a := GP.hash(i, 1, 6701) * PI * 2.0
		var r := 26.0 * (1.0 - 0.5 * k) * (0.5 + 0.5 * GP.hash(i, 2, 6701))
		var lx := sx + cos(a + k * 2.0) * r * 1.3
		var ly := sy + sin(a + k * 2.0) * r * 0.55 - 6.0 * sin(PI * k)
		var al := sin(PI * k)
		var kind := floori(GP.hash(i, 3, 6701) * 3.0)
		var col: Color = FLAME[3] if k < 0.5 else FLAME[2]
		if kind == 0:
			GP.dot(c, lx, ly, col, 2, 1, al)
			GP.dot(c, lx + 2.0, ly - 1.0, col, 1, 2, al)
			GP.dot(c, lx, ly - 2.0, col, 2, 1, al)
		elif kind == 1:
			GP.dot(c, lx, ly, col, 1, 3, al)
			GP.dot(c, lx + 1.0, ly - 2.0, col, 2, 1, al)
		else:
			GP.dot(c, lx, ly, col, 3, 1, al)
			GP.dot(c, lx + 3.0, ly - 1.0, col, 1, 1, al)
