## Something in flight at the hero (monsters.gd moves it): a bone arrow, one of the Warden's bolts (a pink glow: the enemy's),
## the marksman's great arrow (longer, its gold trail), or the Boneward's spear. Stand-ins for the game's own pictures of them.
extends Node2D

const Iso := preload("res://scripts/iso.gd")

var dir := Vector2.RIGHT
var look := "arrow"
## (the Boneward's spear: how high it flies over the floor, the game's pixels: render/mob_world.ts spearHeight)
var high := 0.0


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
			draw_line(lift - s * 40.0, lift - s * 10.0, Color(1.0, 0.78, 0.35, 0.45), 4.0)
			draw_line(lift - s * 22.0, lift + s * 10.0, Color(0.85, 0.78, 0.62), 3.0)
			draw_line(lift + s * 10.0, lift + s * 16.0, Color(1.0, 0.9, 0.6), 3.0)
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
