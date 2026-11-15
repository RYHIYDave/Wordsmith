## Something in flight at the hero (monsters.gd moves it): a bone arrow, one of the Warden's bolts (a pink glow: the enemy's),
## the marksman's great arrow, or the Boneward's spear. The great arrow and the spear are drawn as the game draws them
## (art/mob_shots.ts); the bone arrow and the bolt are stand-ins for the game's.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Perils := preload("res://scripts/perils.gd")
## (art/mkit.ts FLAME: the enemy's pink, gold and white-gold)
const F2 := Color("#ff4f8a")
const F3 := Color("#ffb070")
const F4 := Color("#fff0a0")

var dir := Vector2.RIGHT
var look := "arrow"
## (the Boneward's spear: how high it flies over the floor, the game's pixels: render/mob_world.ts spearHeight)
var high := 0.0
## (the great arrow's sparks go by the clock)
var _t := 0.0


func _process(dt: float) -> void:
	if look == "great":
		_t += dt
		queue_redraw()


## So many of the game's pixels laid at a point (game pixels from this node), `w` by `h`.
func _dot(at: Vector2, w: int, h: int, c: Color) -> void:
	draw_rect(Rect2(at.x * 2.0, at.y * 2.0, w * 2.0, h * 2.0), c)


## A line of the game's pixels from one point to another (game pixels from this node), every one of it (art/mob_shots.ts line).
func _px_line(from: Vector2, to: Vector2, c: Color) -> void:
	var x0 := roundi(from.x)
	var y0 := roundi(from.y)
	var x1 := roundi(to.x)
	var y1 := roundi(to.y)
	var dx := absi(x1 - x0)
	var dy := -absi(y1 - y0)
	var sx := 1 if x0 < x1 else -1
	var sy := 1 if y0 < y1 else -1
	var err := dx + dy
	for n in 600:
		draw_rect(Rect2(x0 * 2.0, y0 * 2.0, 2.0, 2.0), c)
		if x0 == x1 and y0 == y1:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			x0 += sx
		if e2 <= dx:
			err += dx
			y0 += sy


func _draw() -> void:
	var s := Iso.to_screen(dir.x, dir.y).normalized()
	var lift := Vector2(0, -36)
	match look:
		"bolt":
			draw_circle(lift, 7.0, Color(0.96, 0.27, 0.47, 0.35))
			draw_circle(lift, 4.0, Color(1.0, 0.55, 0.7))
			draw_line(lift - s * 14.0, lift, Color(0.96, 0.27, 0.47, 0.5), 3.0)
		"great":
			# (THE GAME'S OWN, art/mob_shots.ts drawGreatArrow: its head over this point of the floor, 14 game pixels up
			# (defs.ts AIM.z), flying the way it goes: its shadow on the floor; behind it a long streak of light, white-gold
			# to pink, fading; its dark shaft (GREAT_SHAFT), its pink fletching, its head burning gold; sparks shed behind it)
			var u := s
			var top := -14.0
			_px_line(-u * 14.0, Vector2.ZERO, Color(Color("#07050a"), 0.35))
			for d in 40:
				var k := d / 40.0
				_dot(Vector2(roundf(-u.x * (6 + d)), roundf(top - u.y * (6 + d))), 1, 2 if d < 14 else 1, Color(F4 if k < 0.25 else (F3 if k < 0.6 else F2), (1.0 - k) * 0.85))
			_px_line(-u * 13.0 + Vector2(0, top + 1.0), -u * 2.0 + Vector2(0, top + 1.0), Color("#16133a"))
			_px_line(-u * 13.0 + Vector2(0, top), -u * 2.0 + Vector2(0, top), Color("#4a4494"))
			_dot(Vector2(roundf(-u.x * 12.0), roundf(top - u.y * 12.0) - 1.0), 1, 1, F2)
			_dot(Vector2(roundf(-u.x * 11.0), roundf(top - u.y * 11.0) + 1.0), 1, 1, F2)
			_dot(Vector2(roundf(-u.x * 2.0), roundf(top - u.y * 2.0)), 2, 2, F3)
			_dot(Vector2(-1.0, roundf(top - 1.0)), 3, 2, F4)
			for i in 6:
				var life := fposmod(_t * 5.0 + Perils._hash(i, 1, 81), 1.0)
				var far := 8.0 + life * 26.0
				var off := (Perils._hash(i, 2, 81) - 0.5) * 6.0 * life
				_dot(Vector2(roundf(-u.x * far - u.y * off), roundf(top - u.y * far + u.x * off * 0.5 + life * 4.0)), 1, 1, Color(F4 if life < 0.4 else F3, 1.0 - life))
		"spear":
			# (THE GAME'S OWN, art/mob_shots.ts drawSpearShot: its middle over this point of the floor and `high` over it, flying
			# the way it goes: its shadow on the floor under it, a faint streak of air behind it, its shaft and its iron head,
			# its point bright)
			var h := Iso.to_screen(dir.x * 0.435, dir.y * 0.435) / 2.0
			var up := Vector2(0, -high)
			_px_line(-h, h, Color(Color("#07050a"), 0.4))
			_px_line(-h * 2.2 + up, -h + up, Color(Color("#6e68cc"), 0.35))
			_px_line(-h + up + Vector2(0, 1), h + up + Vector2(0, 1), Color("#2a2466"))
			_px_line(-h + up, h + up, Color("#6e68cc"))
			var hd := (-h).lerp(h, 0.78) + up
			_px_line(hd + Vector2(0, 1), h + up + Vector2(0, 1), Color("#1c1a3a"))
			_px_line(hd, h + up, Color("#7672b0"))
			draw_rect(Rect2(roundf(h.x + up.x) * 2.0, roundf(h.y + up.y) * 2.0, 2.0, 2.0), Color("#fff0a0"))
		_:
			draw_line(lift - s * 14.0, lift + s * 6.0, Color(0.78, 0.7, 0.55), 2.0)
			draw_line(lift + s * 6.0, lift + s * 10.0, Color(1.0, 0.85, 0.55), 2.0)
