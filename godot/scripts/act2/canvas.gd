## A PICTURE PAINTED HERE, AS THE ART PAINTS ONE (engine/px.ts Px; art/action_f6_fx.ts pen, blob, tileAt, markRing): a canvas of
## picture pixels (two to a game pixel, the grain the art is painted at), its floor point at (ax, ay) from its top left, for the
## painters of what aims any way (the floor a halberd splits, along the way he faced), brought over line for line and painted a
## frame at a time; then put on the screen whole, as one texture.
extends RefCounted

const GP := preload("res://scripts/act2/gp.gd")

## (art/action_f6_fx.ts markRing's colours: the enemy's pink)
const PINK3: Array[Color] = [Color("#e0287a"), Color("#ff7aa8"), Color("#7a1058")]

var w: int
var h: int
var ax: float
var ay: float
var img: Image


func _init(W: int, H: int, AX: float, AY: float) -> void:
	w = W
	h = H
	ax = AX
	ay = AY
	img = Image.create_empty(W, H, false, Image.FORMAT_RGBA8)


## pen: a whole pixel laid where asked (Math.round), none on the canvas's own edge; `under`: only where nothing is yet.
func pen(x: float, y: float, c: Color, under := false) -> void:
	var X := GP.rnd(x)
	var Y := GP.rnd(y)
	if X < 1 or Y < 1 or X >= w - 1 or Y >= h - 1:
		return
	if under and img.get_pixel(X, Y).a8 != 0:
		return
	img.set_pixel(X, Y, c)


## dot (art/crier_action_fx.ts dot): a `bw` by `bh` block of pixels at (x, y) (Math.round), what of it is on the canvas.
func dot(x: float, y: float, c: Color, bw := 1, bh := 1) -> void:
	var r := Rect2i(GP.rnd(x), GP.rnd(y), bw, bh).intersection(Rect2i(0, 0, w, h))
	if r.size.x > 0 and r.size.y > 0:
		img.fill_rect(r, c)


## blob: a round speck `r` across, thinned by `thin` (by the art's hash of its pixels and `seed`), each pixel by `pen`.
func blob(x: float, y: float, r: float, c: Color, thin := 0.0, seed := 0, under := false) -> void:
	var n := ceili(r)
	for j in range(-n, n + 1):
		for i in range(-n, n + 1):
			if i * i + j * j > r * r + 0.3:
				continue
			if thin > 0.0 and GP.hash(GP.rnd(x) + i, GP.rnd(y) + j, seed) < thin:
				continue
			pen(x + i, y + j, c, under)


## tileAt: where a floor point `x`, `y` tiles from the canvas's floor point is on it.
func tile(x: float, y: float) -> Vector2:
	return Vector2(ax + 32.0 * (x - y), ay + 16.0 * (x + y))


## markRing: a dashed ring of the enemy's pink round the floor point (`r` tiles), `k` (0 to 1) how much of it is laid.
func mark_ring(r: float, k: float, colour: Array = PINK3, spin := 0.0) -> void:
	var n := GP.rnd(r * 120.0)
	for i in n:
		var dash := i % 6
		if dash >= 2 + GP.rnd(3.0 * k):
			continue
		var a := (float(i) / n) * TAU + spin
		var p := tile(cos(a) * r, sin(a) * r)
		pen(p.x, p.y, colour[1] if (k > 0.6 and dash == 1) else colour[0], true)
		pen(p.x, p.y + 1.0, colour[2], true)
		if i % 3 == 0 and k > 0.3:
			var q := tile(cos(a) * r * 0.94, sin(a) * r * 0.94)
			pen(q.x, q.y, colour[2], true)


## The picture, cut to what is painted of it: {tex, at: where its top left lies from its floor point}; {} if nothing is.
func cut() -> Dictionary:
	var used := img.get_used_rect()
	if used.size.x <= 0 or used.size.y <= 0:
		return {}
	return {"tex": ImageTexture.create_from_image(img.get_region(used)), "at": Vector2(used.position) - Vector2(ax, ay)}
