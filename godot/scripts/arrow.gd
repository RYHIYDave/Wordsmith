## Something in flight at the hero (monsters.gd moves it): a bone arrow, one of the Warden's bolts (a pink glow: the enemy's),
## or the marksman's great arrow (longer, its gold trail). Stand-ins for the game's own pictures of them.
extends Node2D

const Iso := preload("res://scripts/iso.gd")

var dir := Vector2.RIGHT
var look := "arrow"


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
		_:
			draw_line(lift - s * 14.0, lift + s * 6.0, Color(0.78, 0.7, 0.55), 2.0)
			draw_line(lift + s * 6.0, lift + s * 10.0, Color(1.0, 0.85, 0.55), 2.0)
