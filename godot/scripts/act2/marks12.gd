## WHAT FLOOR 12'S DREDGERS LAY ON THE FLOOR AND THROW OVER IT: perils.gd's marks of kind "a1" named "dredger:" (marks.gd hands them
## here), stepped as their rules step them (game/act1_rules/dredger.ts peril) and drawn as render/act1_fx/dredger.ts draws them, the
## art's own painters brought over line for line (art/dredger_shots.ts drawNetWarn, drawNetFlying, drawNetLying; boss_shots.ts
## drawScrape, as the cliff crawler's: perils.gd _scrape).
##   dredger:aim   where the cast net will fall, marked through its warning (the ring of the enemy's pink, the net's lattice faint
##                 in it), until it is let go of; gone if the dredger is stopped first.
##   dredger:net   the net in flight from where it is let go of (`a`, `b`, `c` the game's pixels up) to its spot, and fallen spread
##                 over it (`hit` its flight): whoever is under it as it falls struck and NETTED, held 1 s.
##   dredger:haul  the scrape of the hero hauled in on the hook, from where he was caught.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const DR := preload("res://scripts/act2/dredger.gd")

## (art/mkit.ts FLAME; dredger_shots.ts CORD, LEAD, DUST, NET_R, NET_FLIES, NET_ARC, NET_LIES, WEIGHTS, MESH)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const CORD: Array[Color] = [Color("#2a2016"), Color("#6a5538"), Color("#9a845c")]
const LEAD: Array[Color] = [Color("#2c2e36"), Color("#5a5e6a"), Color("#9a9eaa")]
const DUST: Array[Color] = [Color("#8a8472"), Color("#aaa48e"), Color("#c6bfa8")]
const NET_R := 0.85
const NET_FLIES := 0.5
const NET_ARC := 22.0
const NET_LIES := 1.6
const WEIGHTS := 9
const MESH := 0.27
const NETTED := Color("#ff8a80")


static func gone(_P, _p: Dictionary) -> void:
	pass


static func step(P, p: Dictionary, _dt: float) -> bool:
	var hero = P.hero
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"dredger:aim":
			# (gone if it is stopped before it lets go)
			if src == null or not is_instance_valid(src) or src.dead or src.state != "act":
				p["dur"] = t
		"dredger:haul":
			if src == null or not is_instance_valid(src) or src.dead or src.h2 == null or int(src.h2.a1.get("hooked", 0)) == 0:
				p["dur"] = t
		"dredger:net":
			# THE CAST NET falls: whoever is under it is struck and caught in it, held where he is
			if int(p["done"]) != 0 or t < float(p["hit"]):
				return t < float(p["dur"])
			p["done"] = 1
			hero.kick(1.0)
			P.sfx.play("hit", linear_to_db(0.4))
			var at := Vector2(p["x"], p["y"])
			if hero.world.distance_to(at) > float(DR.NET["r"]) + A1.HERO_R * 0.5 or not A1.open_to(hero):
				return true
			var was: float = hero.life
			P._hurt(p, p["dmg"], at)
			if hero.life < was and hero.alive:
				hero.held = maxf(hero.held, float(DR.NET["hold"]))
				if src != null and is_instance_valid(src):
					A1.word(src, hero, "Netted", NETTED)
	return t < float(p["dur"])


static func stands(_P, _p: Dictionary) -> void:
	pass


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	match str(p["a1"]):
		"dredger:aim":
			_net_warn(P, x, y, _warn_k(t), P._clock)
		"dredger:net":
			if t < NET_FLIES:
				_net_warn(P, x, y, _warn_k(float(DR.NET["hit"]) + t), P._clock)
			else:
				_net_lying(P, x, y, t - NET_FLIES)
		"dredger:haul":
			var src = p.get("src")
			if src != null and is_instance_valid(src) and src.h2 != null and int(src.h2.a1.get("hooked", 0)) != 0:
				P._scrape(P.hero.world, Vector2(src.h2.a1["ox"], src.h2.a1["oy"]), 1.0)


## Over what stands: the net in flight.
static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "dredger:net" or float(p["t"]) >= NET_FLIES:
		return
	_net_flying(c, Vector3(p["a"], p["b"], p["c"]), float(p["x"]), float(p["y"]), float(p["t"]))


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


## (render/act1_fx/dredger.ts warnK: how far through its warning, by the dredger's clock, from 0.6 s to its fall)
static func _warn_k(t: float) -> float:
	var N: Dictionary = DR.NET
	return clampf((t - float(N["warn"][0])) / (float(N["hit"]) + float(N["flies"]) - float(N["warn"][0])), 0.0, 1.0)


# --- art/dredger_shots.ts, line for line ---

static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## line: a line a pixel wide between two points of the screen (game pixels).
static func _line(c: CanvasItem, x0: float, y0: float, x1: float, y1: float, col: Color, alpha: float) -> void:
	var X0 := GP.rnd(x0)
	var Y0 := GP.rnd(y0)
	var X1 := GP.rnd(x1)
	var Y1 := GP.rnd(y1)
	var dx := absi(X1 - X0)
	var dy := -absi(Y1 - Y0)
	var sx := 1 if X0 < X1 else -1
	var sy := 1 if Y0 < Y1 else -1
	var err := dx + dy
	for _n in 400:
		GP.fill(c, X0, Y0, 1, 1, col, alpha)
		if X0 == X1 and Y0 == Y1:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			X0 += sx
		if e2 <= dx:
			err += dx
			Y0 += sy


## mesh: the net's mesh on a disc of radius `r` at (cx, cy), turned `spin`, `z` over the floor; its knots; the cord round its edge.
static func _mesh(c: CanvasItem, cx: float, cy: float, r: float, spin: float, z: float, col: Color, knot, alpha: float) -> void:
	var cs := cos(spin)
	var sn := sin(spin)
	var to := func(u: float, v: float) -> Vector2:
		return GP.at(cx + u * cs - v * sn, cy + u * sn + v * cs) - Vector2(0.0, z)
	var stp := MESH * (r / NET_R)
	var n := floori(r / stp)
	for j in range(-n, n + 1):
		var off := j * stp
		var half := sqrt(maxf(0.0, r * r - off * off))
		var a: Vector2 = to.call(-half, off)
		var b: Vector2 = to.call(half, off)
		_line(c, a.x, a.y, b.x, b.y, col, alpha)
		var p: Vector2 = to.call(off, -half)
		var q: Vector2 = to.call(off, half)
		_line(c, p.x, p.y, q.x, q.y, col, alpha)
	if knot != null:
		for i in range(-n, n + 1):
			for j in range(-n, n + 1):
				if pow(i * stp, 2.0) + pow(j * stp, 2.0) > r * r:
					continue
				var k: Vector2 = to.call(i * stp, j * stp)
				GP.dot(c, k.x, k.y, knot, 1, 1, alpha)
	for i in 40:
		var a := (float(i) / 40.0) * PI * 2.0
		var e: Vector2 = to.call(cos(a) * r, sin(a) * r)
		GP.dot(c, e.x, e.y, col, 1, 1, alpha)


## weights: the lead round its edge, `r` out, turned `spin`, `z` over the floor (hanging `sag` lower), `lit` how pink they glint.
static func _weights(c: CanvasItem, cx: float, cy: float, r: float, spin: float, z: float, sag: float, lit: float, alpha: float) -> void:
	for i in WEIGHTS:
		var a := spin + (float(i) / WEIGHTS) * PI * 2.0
		var s := GP.at(cx + cos(a) * r, cy + sin(a) * r)
		var y := s.y - z + sag
		GP.dot(c, s.x - 1.0, y, LEAD[1], 2, 2, alpha)
		var col: Color = (FLAME[4] if (i + floori(spin * 3.0)) % 3 == 0 else FLAME[3]) if lit > 0.5 else (FLAME[2] if lit > 0.15 else LEAD[2])
		GP.dot(c, s.x - 1.0, y, col, 1, 1, alpha)


## drawNetWarn: THE WARNING, `k` of the way through it, at the net's spot: a ring of the enemy's pink as wide as the net, its
## dashes marching round and brightening; the net's lattice faint inside it, darkening the floor.
static func _net_warn(c: CanvasItem, x: float, y: float, k: float, t: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var shown := _sm(k / 0.3)
	_mesh(c, x, y, NET_R * 0.97, 0.0, 0.0, Color("#1a1016"), null, 0.32 * shown)
	var n := 44
	for j in n:
		if (floori(j / 2.0 + t * 10.0) & 1) == 0:
			continue
		var a := (float(j) / n) * PI * 2.0
		var s := GP.at(x + cos(a) * NET_R, y + sin(a) * NET_R)
		GP.dot(c, s.x, s.y, FLAME[3] if k > 0.75 else FLAME[2], 2, 1, shown * (0.45 + 0.55 * k))


## drawNetFlying: THE NET IN FLIGHT, `t` seconds after it is let go of: rising in an arc and coming down, opening from a ball to its
## whole width, spinning, its weights flung out round its edge, glinting; its shadow under it, growing as it comes down.
static func _net_flying(c: CanvasItem, from: Vector3, x: float, y: float, t: float) -> void:
	if t < 0.0 or t >= NET_FLIES:
		return
	var k := t / NET_FLIES
	var cx := from.x + (x - from.x) * k
	var cy := from.y + (y - from.y) * k
	var z := from.z * (1.0 - k) + 4.0 * NET_ARC * k * (1.0 - k)
	var r := 0.08 + (NET_R - 0.08) * _sm(k / 0.85)
	var spin := (PI / 2.0) * 1.5 * (1.0 - k) * (1.0 - k)
	for i in 24:
		var a := i * 2.39996
		var q := sqrt((i + 0.5) / 24.0) * r
		var s := GP.at(cx + cos(a) * q, cy + sin(a) * q)
		GP.dot(c, s.x - 1.0, s.y, Color("#0a0810"), 3, 1, 0.2 + 0.35 * k)
	if r < 0.2:
		var s := GP.at(cx, cy)
		GP.dot(c, s.x - 2.0, s.y - z - 2.0, CORD[0], 5, 4)
		GP.dot(c, s.x - 1.0, s.y - z - 2.0, CORD[1], 3, 2)
		GP.dot(c, s.x, s.y - z - 2.0, CORD[2])
	else:
		var m := GP.at(cx, cy)
		for i in WEIGHTS:
			var a := spin + (float(i) / WEIGHTS) * PI * 2.0
			for j in range(1, 5):
				var u := j / 5.0
				var s := GP.at(cx + cos(a) * r * u, cy + sin(a) * r * u)
				GP.dot(c, s.x, s.y - z - 2.0 * (1.0 - u), CORD[0])
		_mesh(c, cx, cy, r, spin, z, CORD[1], CORD[2], 1.0)
		GP.dot(c, m.x - 1.0, m.y - z - 2.0, CORD[2], 2, 1)
	_weights(c, cx, cy, maxf(0.12, r), spin, z, 1.0 + 2.0 * (1.0 - k), 1.0, 1.0)


## drawNetLying: THE NET FALLEN, `t` seconds after: its weights striking the floor in a ring of dust, flashing pink; then lying,
## its mesh dark on the floor, its weights' glint going out; fading at the end.
static func _net_lying(c: CanvasItem, x: float, y: float, t: float) -> void:
	if t < 0.0 or t >= NET_LIES + 0.3:
		return
	var fade := 1.0 - _sm((t - NET_LIES) / 0.3)
	var z := 2.0 * (1.0 - _sm(t / 0.12))
	_mesh(c, x, y, NET_R, 0.0, z, CORD[1], CORD[2], fade)
	_weights(c, x, y, NET_R, 0.0, 0.0, 0.0, 1.0 - _sm(t / 0.6), fade)
	if t < 0.5:
		var q := t / 0.5
		for i in 30:
			var a := (float(i) / 30.0) * PI * 2.0 + GP.hash(i, 1, 8211) * 0.2
			var r := NET_R * (1.0 + 0.25 * _sm(q * 1.4) * (0.5 + GP.hash(i, 2, 8211)))
			if GP.hash(i, floori(t * 20.0), 8212) < q * 0.8:
				continue
			var s := GP.at(x + cos(a) * r, y + sin(a) * r)
			GP.dot(c, s.x, s.y - 1.0 - 3.0 * sin(PI * q), DUST[i % 3], 1, 1, fade * 0.85 * (1.0 - q))
	if t < 0.18:
		for i in WEIGHTS:
			var a := (float(i) / WEIGHTS) * PI * 2.0
			var s := GP.at(x + cos(a) * NET_R, y + sin(a) * NET_R)
			GP.dot(c, s.x - 1.0, s.y - 2.0 - 6.0 * (t / 0.18), FLAME[4], 1, 1, fade * (1.0 - t / 0.18))
			GP.dot(c, s.x + 1.0, s.y - 1.0 - 4.0 * (t / 0.18), FLAME[3], 1, 1, fade * (1.0 - t / 0.18))
