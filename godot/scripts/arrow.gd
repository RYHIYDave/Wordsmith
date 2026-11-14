## An arrow in flight (monsters.gd moves it): a short shaft along its way on the screen, its head lit. A stand-in for the
## game's own arrow picture.
extends Node2D

const Iso := preload("res://scripts/iso.gd")

var dir := Vector2.RIGHT


func _draw() -> void:
	var s := (Iso.to_screen(dir.x, dir.y)).normalized()
	var lift := Vector2(0, -36)
	draw_line(lift - s * 14.0, lift + s * 6.0, Color(0.78, 0.7, 0.55), 2.0)
	draw_line(lift + s * 6.0, lift + s * 10.0, Color(1.0, 0.85, 0.55), 2.0)
