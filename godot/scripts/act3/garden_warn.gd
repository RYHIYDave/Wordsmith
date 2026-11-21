## WHERE A BLOW OF THE HIGH CITY'S OWN WILL LAND, MARKED ON THE FLOOR through its wind-up (render/act1_fx/garden_warn.ts, brought
## over line for line): the swans' bite, the gardeners' lunge, the palace guard's thrust and the javelin's fall, so that one who
## sees it can step out of it. His rule of 28 Oct 2026 (“And bigger AOE to compensate for the extra time the player gets to
## evade”). In the game's own pixels: the edge of what will be struck a dashed line of the enemy's pink, its dashes marching on as
## the blow comes, brightening; the floor inside darkening, a sparse dither growing thicker. Nothing in it glows, nothing is cyan.
## A strip before one of them (`strip`) or a fan round them (`fan`), laid by where it stands, the way it faces and the hand it is
## drawn with (act1.gd beside: the same left as rel).
extends RefCounted

const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")

## (art/mkit.ts FLAME, the enemy's pink)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const SHADE := Color("#1a1016")
const STEP := 0.07
const DASH := 3


## warnK: how far through a wind-up a warning is, from `from` to the blow at `hit`: 0 to 1 (outside it, -1: not drawn).
static func warn_k(t: float, from: float, hit: float) -> float:
	if t < from or t > hit:
		return -1.0
	return clampf((t - from) / maxf(1e-6, hit - from), 0.0, 1.0)


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## Its edge, dashed and marching: `pts` a closed run of floor points; `k` how far through the warning; `t` the clock.
static func _edge(c: CanvasItem, pts: Array, k: float, t: float, shown: float) -> void:
	var j := 0
	for i in pts.size():
		var a: Vector2 = pts[i]
		var b: Vector2 = pts[(i + 1) % pts.size()]
		var n := maxi(1, GP.rnd(a.distance_to(b) / STEP))
		for s in n:
			var lit := (floori(float(j) / DASH - t * 9.0) & 1) != 0
			j += 1
			if not lit:
				continue
			var q := GP.at(a.x + (b.x - a.x) * float(s) / n, a.y + (b.y - a.y) * float(s) / n)
			GP.dot(c, q.x, q.y, FLAME[3] if k > 0.75 else FLAME[2], 2, 1, shown * (0.45 + 0.55 * k))


## The floor inside darkening: `n` points through it (`inside(i)`, null for none), more of them shown as `k` comes on.
static func _shade(c: CanvasItem, n: int, inside: Callable, k: float, shown: float) -> void:
	for i in n:
		if GP.hash(i, 1, 7721) > 0.3 + 0.5 * k:
			continue
		var p = inside.call(i)
		if p == null:
			continue
		var q := GP.at(p.x, p.y)
		GP.dot(c, q.x, q.y, SHADE, 2, 1, 0.35 * shown * (0.5 + 0.5 * k))


## A STRIP BEFORE ONE OF THEM: from `from` to `to` tiles before it, from `left0` to `left1` to the left it is drawn with (standing at
## `at`, facing `f`, drawn with `hand`); `k` how far through the warning (0 to 1), `t` the clock (seconds).
static func strip(c: CanvasItem, at: Vector2, f: Vector2, hand: int, from: float, to: float, left0: float, left1: float, k: float, t: float) -> void:
	if k < 0.0 or k > 1.0:
		return
	var p := func(fwd: float, left: float) -> Vector2: return A1.beside(at, f, hand, fwd, left)
	var shown := _sm(k / 0.25)
	var n := GP.rnd((to - from) * (left1 - left0) * 60.0)
	_shade(c, n, func(i: int): return p.call(from + (to - from) * GP.hash(i, 2, 7722), left0 + (left1 - left0) * GP.hash(i, 3, 7723)), k, shown)
	_edge(c, [p.call(from, left0), p.call(to, left0), p.call(to, left1), p.call(from, left1)], k, t, shown)


## A FAN ROUND ONE OF THEM: from bearing `b0` round to `b1` (radians to the left it is drawn with of the way it faces), `r` tiles out.
static func fan(c: CanvasItem, at: Vector2, f: Vector2, hand: int, b0: float, b1: float, r: float, k: float, t: float) -> void:
	if k < 0.0 or k > 1.0:
		return
	var p := func(b: float, d: float) -> Vector2: return A1.beside(at, f, hand, cos(b) * d, sin(b) * d)
	var shown := _sm(k / 0.25)
	var n := GP.rnd(0.5 * (b1 - b0) * r * r * 50.0)
	_shade(c, n, func(i: int): return p.call(b0 + (b1 - b0) * GP.hash(i, 4, 7724), r * (0.3 + 0.7 * sqrt(GP.hash(i, 5, 7725)))), k, shown)
	var pts: Array = [p.call(0.0, 0.0)]
	var arc := maxi(2, GP.rnd((b1 - b0) * r / STEP))
	for i in arc + 1:
		pts.append(p.call(b0 + (b1 - b0) * float(i) / arc, r))
	_edge(c, pts, k, t, shown)
