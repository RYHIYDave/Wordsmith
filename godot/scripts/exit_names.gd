## THE EXITS' NAMES (ways.gd EXIT_LABELS; game/exit_labels.ts; render.ts, the labels): over everything, as the town's services' names
## are drawn (town.gd _draw_names): the small letters on a dark strip; white when he is within 3 tiles, else the friend's pale cyan;
## only where he has seen. Its names: the floor's way out's (ways.gd), or its stairwell's (stairs.gd).
extends Node2D

const PF := preload("res://scripts/pixel_font.gd")
const Ways := preload("res://scripts/ways.gd")

var main


func _process(_dt: float) -> void:
	queue_redraw()


func _draw() -> void:
	if main == null or main.fx == null or not Ways.EXIT_LABELS["on"]:
		return
	var labels: Array = []
	if main.ways != null and is_instance_valid(main.ways):
		labels.append_array(main.ways.exit_labels())
	if main._stairs != null and is_instance_valid(main._stairs):
		labels.append_array(main._stairs.exit_labels())
	if labels.is_empty():
		return
	var h = main.hero
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	for e in labels:
		var at: Vector2 = e["at"]
		if main.sight != null and not main.sight.seen_at(at):
			continue
		var near: bool = h != null and h.world.distance_to(at) < 3.0
		var text: String = e["text"]
		var wd := PF.width(text, "small") + 4.0
		var x := roundf(main.fx.gx(at.x, at.y) - wd / 2.0)
		var y := roundf(main.fx.gy(at.x, at.y) - float(e["lift"]))
		draw_rect(Rect2(x, y - 1.0, wd, 7.0), Color(Color("#07050a"), 0.78))
		PF.draw(self, text, x + 2.0, y, Color.WHITE if near else Color("#b0f0dc"), {"font": "small"})
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
