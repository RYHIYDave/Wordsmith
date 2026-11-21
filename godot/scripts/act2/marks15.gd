## WHAT FLOOR 15'S INKLINGS AND BOOKWARDENS LAY ON THE FLOOR AND FLING OVER IT: perils.gd's marks of kind "a1" (marks.gd hands them
## here by the first word of their names), stepped as their rules step them (game/act1_rules/bookwarden.ts peril) and drawn as
## render/act1_fx/inkling.ts and bookwarden.ts draw them:
##   inkling:pool        an inkling going about as a pool of ink (its clock its own): a ragged pool of the Order's ink, lengthened the
##                       way it goes, rippling, two pink eyes surfacing in it now and then, a trail of wet ink drying behind it (art/
##                       inkling_shots.ts drawInkPool, in the game's pixels, line for line); gone as it rises.
##   bookwarden:mark     where the tome came down flat on the floor: the dust shoved out from under it, the cracks, the loose pages
##                       (art/bookwarden_shots.ts drawTomeSlam).
##   bookwarden:barrage  the nine books (its clock the barrage's, `aims` where the hero was as each went): torn up and wheeling round
##                       him, flung at the hero one after another, each turning over (the game's films wb_book_<c>_<l>_<g>), its
##                       streak behind it (bookStreak), coming down, lying a moment; whoever a book flies through is struck.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const WB := preload("res://scripts/act2/bookwarden.gd")

const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (art/inkling_shots.ts INK, IK_POOL_R, IK_TRAIL)
const INK: Array[Color] = [Color("#040306"), Color("#0c0a11"), Color("#18151f"), Color("#3a3548")]
const POOL_R := 0.42
const TRAIL := 1.4
## (art/bookwarden_shots.ts DUST, PAGE, SEAM, TOME_REACH, TOME_DUST_FOR, TOME_MARK_FOR, BOOK_L, BOOK_W)
const DUST: Array[Color] = [Color("#8a8472"), Color("#aaa48e"), Color("#c6bfa8"), Color("#ddd6c0")]
const PAGE: Array[Color] = [Color("#cfc5ab"), Color("#e6dcc4"), Color("#9c927a")]
const SEAM := Color("#120e0c")
const TOME_REACH := 1.2
const DUST_FOR := 0.6
const MARK_FOR := 1.8
const BOOK_L := 0.36
const BOOK_W := 0.28
## (art/action_f11_warden.ts PINK; bookStreak's)
const STREAK_PINK := Color("#ff7aa8")


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


static func step(P, p: Dictionary, _dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"inkling:pool":
			if src == null or not is_instance_valid(src) or src.dead or src.h2 == null or int(src.h2.a1.get("sunk", 0)) != 2:
				p["dur"] = t
		"bookwarden:barrage":
			_barrage(P, p, src)
	return t < float(p["dur"])


## THE BARRAGE (bookwarden.ts peril): wheeling round him, not yet flung, gone if he is stopped first; then each book as it goes aimed
## at where the hero is, and whoever one flies through struck by it, once each.
static func _barrage(P, p: Dictionary, src) -> void:
	var t: float = p["t"]
	if t < WB.BARRAGE_HIT:
		if src == null or not is_instance_valid(src) or src.dead or src.state != "act" or src.h2 == null or src.h2.act == null \
				or str(src.h2.acts()[src.h2.act["i"]]["id"]) != "bookwarden:barrage":
			p["dur"] = t
		return
	var hero = P.hero
	var r := A1.from_figure(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), int(p["hand"]), hero.world)
	var aims: Array = p["aims"]
	var n: int = WB.BARRAGE["n"]
	for i in n:
		if aims[i] == null and t >= WB.book_goes(i):
			aims[i] = r
	if not A1.open_to(hero):
		return
	for i in n:
		if int(p["done"]) & (1 << i) or t < WB.book_goes(i):
			continue
		var b := WB.book_at(i, t, aims, r)
		if b["flying"] and r.distance_to(Vector2(b["x"], b["y"])) <= float(WB.BARRAGE["r"]):
			p["done"] = int(p["done"]) | (1 << i)
			P._hurt(p, p["dmg"], hero.world)


## Among the figures: the barrage's books, each at the floor point under it.
static func stands(P, p: Dictionary) -> void:
	if str(p["a1"]) != "bookwarden:barrage":
		return
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var hand := int(p["hand"])
	var r := A1.from_figure(at, f, hand, P.hero.world)
	for i in int(WB.BARRAGE["n"]):
		var b := WB.book_at(i, float(p["t"]), p["aims"], r)
		var w := A1.beside(at, f, hand, b["x"], b["y"])
		var name := "wb_book_%d_%d_%d" % [int(b["cover"]), 1 if b["lying"] else 0, 0 if b["flying"] else 1]
		if not P.has_film(name):
			continue
		var q := posmod(GP.rnd((float(b["spin"]) / TAU) * 24.0), 24)
		P._film_one(p, "fx_b%d" % i, P._still(name, "stand", q), w, w.x + w.y, false, float(b["z"]) / 2.0)


# --- on the floor, under the figures ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"inkling:pool":
			if src != null and is_instance_valid(src) and not src.dead and src.h2 != null:
				var s: Dictionary = src.h2.a1
				_pool(P, src.world.x, src.world.y, float(s.get("vx", 0.0)), float(s.get("vy", 0.0)), float(s.get("pt", 0.0)))
		"bookwarden:mark":
			_tome(P, float(p["x"]), float(p["y"]), float(p["fx"]), float(p["fy"]), t)


## drawInkPool (game pixels: the screen's two).
static func _pool(c: CanvasItem, x: float, y: float, dx: float, dy: float, t: float) -> void:
	var sp := Vector2(dx, dy).length()
	var ux := dx / sp if sp > 0.0 else 1.0
	var uy := dy / sp if sp > 0.0 else 0.0
	# THE TRAIL behind it: wet next to it, broken and drying further back
	if sp > 0.0:
		var n := ceili(TRAIL / 0.05)
		for i in n:
			var s := POOL_R * 0.6 + (float(i) / n) * TRAIL
			var k := s / (TRAIL + POOL_R)
			if GP.hash(i, floori(t * 4.0), 8701) < k * 1.1:
				continue
			var o := (GP.hash(i, 2, 8701) - 0.5) * POOL_R * (1.0 - k)
			var q := GP.at(x - ux * s - uy * o, y - uy * s + ux * o)
			GP.dot(c, q.x, q.y, INK[2] if k > 0.6 else INK[0], 2 if k < 0.4 else 1, 1)
	# THE POOL: a ragged round of ink, the edge creeping, lengthened along the way it goes
	var stretch := 1.0 + 0.35 * _c01(sp / 2.0)
	var N := 22
	for i in range(-N, N + 1):
		for j in range(-N, N + 1):
			var u := (float(i) / N) * POOL_R * 1.3 * stretch
			var v := (float(j) / N) * POOL_R * 1.3
			var a := atan2(v, u / stretch)
			var rag := POOL_R * (1.0 + 0.14 * sin(a * 5.0 + t * 6.0) + 0.07 * sin(a * 9.0 - t * 9.0))
			var d := Vector2(u / stretch, v).length()
			if d > rag:
				continue
			var q := GP.at(x + ux * u - uy * v, y + uy * u + ux * v)
			# its surface: rippling rings, a cold sheen across its front
			var ring := absf(fmod((d / POOL_R) * 3.0 - t * 2.0, 1.0)) < 0.12
			var sheen := absf(u * 0.4 - v - POOL_R * 0.3) < 0.03
			GP.dot(c, q.x, q.y, INK[3] if sheen else (INK[2] if ring else (INK[1] if d > rag - 0.05 else INK[0])))
	# TWO PINK EYES surfacing in it now and then, blinking
	var phase := fmod(t * 0.7 + GP.hash(floori(x * 3.0), floori(y * 3.0), 8702), 1.0)
	if phase < 0.45:
		var open := sin((phase / 0.45) * PI)
		for s in [-1.0, 1.0]:
			var q := GP.at(x + ux * POOL_R * 0.25 - uy * s * 0.08, y + uy * POOL_R * 0.25 + ux * s * 0.08)
			GP.dot(c, q.x, q.y, FLAME[1] if open > 0.5 else FLAME[3])
			if open > 0.6:
				GP.dot(c, q.x, q.y - 1.0, FLAME[0])


## drawTomeSlam: the dust shoved out from under it, the floor cracked under it, loose pages flung up and fluttering down round it.
static func _tome(c: CanvasItem, x: float, y: float, fx: float, fy: float, t: float) -> void:
	if t < 0.0 or t >= MARK_FOR:
		return
	var fl := maxf(1e-6, Vector2(fx, fy).length())
	var ux := fx / fl
	var uy := fy / fl
	var W := func(a: float, b: float) -> Vector2: return GP.at(x + ux * a - uy * b, y + uy * a + ux * b)
	var fade := 1.0 - _sm((t - (MARK_FOR - 0.6)) / 0.6)
	# the cracks: out from under the book's edges, run out at once, fading
	for i in 9:
		var side := i % 4
		var along := (GP.hash(i, 1, 9101) - 0.5) * 2.0
		var a: float = along * BOOK_L if side < 2 else (1.0 if side == 2 else -1.0) * BOOK_L
		var b: float = (1.0 if side == 0 else -1.0) * BOOK_W if side < 2 else along * BOOK_W
		var ang := atan2(b, a) + (GP.hash(i, 2, 9101) - 0.5) * 0.8
		var long := 0.25 + 0.3 * GP.hash(i, 3, 9101)
		for k in 7:
			ang += (GP.hash(i, k, 9102) - 0.5) * 0.7
			a += (cos(ang) * long) / 7.0
			b += (sin(ang) * long) / 7.0
			var q: Vector2 = W.call(a, b)
			GP.dot(c, q.x, q.y, SEAM, 1, 1, fade)
	if t < DUST_FOR:
		var q := t / DUST_FOR
		# the dust shoved out from under it: a ring, longest out of its sides, thinning as it goes
		var R := 0.3 + (TOME_REACH - 0.3) * _sm(q * 1.4)
		var n := ceili(30.0 + R * 60.0)
		for j in 3:
			var r := R * (1.0 - 0.12 * j)
			for i in n:
				if GP.hash(i, j + floori(t * 20.0) * 3, 9103) < 0.25 + 0.6 * q:
					continue
				var a := (float(i) / n) * TAU
				var s: Vector2 = W.call(cos(a) * r * 0.8, sin(a) * r * 1.15)
				GP.dot(c, s.x, s.y - 1.0 - 2.0 * sin(PI * q) * GP.hash(i, j, 9104), DUST[3 - j], 2 if j == 0 else 1, 1, (0.9 - 0.25 * j) * (1.0 - q))
	# the loose pages: knocked out of it, flung up, fluttering down round it, and lying there
	for i in 7:
		var a := i * 2.39996 + GP.hash(i, 4, 9105)
		var r := 0.35 + 0.55 * GP.hash(i, 5, 9105)
		var fly := 0.5 + 0.35 * GP.hash(i, 6, 9105)
		var u := _c01(t / fly)
		var s: Vector2 = W.call(cos(a) * r * _sm(u), sin(a) * r * _sm(u))
		var h := 26.0 * sin(PI * minf(1.0, u * 1.1)) * (0.6 + 0.4 * GP.hash(i, 7, 9105)) * (1.0 - 0.3 * u)
		var flap := sin(t * 22.0 + i) > 0.0
		if u >= 1.0:
			GP.dot(c, s.x - 1.0, s.y, PAGE[0], 3, 1, fade)
			GP.dot(c, s.x - 1.0, s.y + 1.0, PAGE[2], 3, 1, fade)
		else:
			GP.dot(c, s.x, s.y - h, PAGE[1] if flap else PAGE[2], 2 if flap else 1, 1 if flap else 2, fade)


# --- over what stands ---

## The books' streaks in flight: after-images along the way each came (bookStreak, picture pixels).
static func air(P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "bookwarden:barrage":
		return
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var hand := int(p["hand"])
	var t: float = p["t"]
	var r := A1.from_figure(at, f, hand, P.hero.world)
	for i in int(WB.BARRAGE["n"]):
		var b := WB.book_at(i, t, p["aims"], r)
		if not b["flying"] or float(b["since"]) <= 0.02:
			continue
		var b0 := WB.book_at(i, t - 1.0 / 30.0, p["aims"], r)
		var w := A1.beside(at, f, hand, b["x"], b["y"])
		var w0 := A1.beside(at, f, hand, b0["x"], b0["y"])
		var s := Iso.to_screen(w.x, w.y) - Vector2(0, float(b["z"]))
		var s0 := Iso.to_screen(w0.x, w0.y) - Vector2(0, float(b0["z"]))
		var d := s - s0
		var L := d.length()
		if L < 1.0:
			continue
		var n := ceili(L * 1.6)
		for k in range(2, n):
			var u := float(k) / n
			for off in [-4, -2, 0, 2, 4]:
				if u > 0.6 and (k + off) % 2 != 0:
					continue
				var X: float = s.x - (d.x / L) * k + (-d.y / L) * off
				var Y: float = s.y - (d.y / L) * k + (d.x / L) * off
				var col: Color
				if u < 0.25:
					col = STREAK_PINK if off == -1 else Color("#e2d8c0")
				elif u < 0.55:
					col = Color("#a69c88")
				else:
					col = Color("#5e5850") if GP.hash(k, off, i) > 0.5 else Color("#3a3630")
				c.draw_rect(Rect2(GP.rnd(X), GP.rnd(Y), 1, 1), col)


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
