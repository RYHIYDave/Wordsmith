## THE CITY'S PAINTERS' OWN BITS (art/kit.ts hash; the art's dotAt): what the art draws the city's marks with, brought over so its
## painters can be brought over line for line. A painter's pixels are the game's (half a picture pixel's scale): each is drawn as
## two by two of the Godot version's picture pixels, at the game pixel `at` gives for a floor point (Iso.to_screen halved).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")


## Math.imul: the low 32 bits of a x b, signed.
static func imul(a: int, b: int) -> int:
	a &= 0xffffffff
	b &= 0xffffffff
	var lo := (a & 0xffff) * (b & 0xffff)
	var mid := (((a >> 16) * (b & 0xffff) + (a & 0xffff) * (b >> 16)) & 0xffff) << 16
	var r := (lo + mid) & 0xffffffff
	return r - 0x100000000 if r >= 0x80000000 else r


## art/kit.ts hash: 0 to 1 from three whole numbers.
static func hash(x: int, y: int, k := 0) -> float:
	var h := (imul(x, 374761393) + imul(y, 668265263) + imul(k, 2147483647)) & 0xffffffff
	h = imul(h ^ (h >> 13), 1274126177) & 0xffffffff
	return float((h ^ (h >> 16)) & 0xffffffff) / 4294967296.0


## Where a floor point is on the screen, game pixels (the art's `at`).
static func at(x: float, y: float) -> Vector2:
	return Iso.to_screen(x, y) / 2.0


## (JS Math.round: halves up)
static func rnd(v: float) -> int:
	return floori(v + 0.5)


## dotAt: a `w` by `h` block of game pixels at (x, y), rounded as the art rounds, in `color` at `alpha`.
static func dot(c: CanvasItem, x: float, y: float, color: Color, w := 1.0, h := 1.0, alpha := 1.0) -> void:
	if alpha <= 0.0:
		return
	c.draw_rect(Rect2(rnd(x) * 2.0, rnd(y) * 2.0, w * 2.0, h * 2.0), Color(color, color.a * minf(1.0, alpha)))


## g.fillRect at (x, y) whole game pixels already rounded by the art itself.
static func fill(c: CanvasItem, x: float, y: float, w: float, h: float, color: Color, alpha := 1.0) -> void:
	if alpha <= 0.0 or w <= 0.0 or h <= 0.0:
		return
	c.draw_rect(Rect2(x * 2.0, y * 2.0, w * 2.0, h * 2.0), Color(color, color.a * minf(1.0, alpha)))
