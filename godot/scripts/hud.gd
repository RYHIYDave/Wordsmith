## What is shown over the game: his three attacks at the foot of the screen, each with its key and how soon it is ready
## again; his level, experience and gold (loot.gd fills them in). In the heroes' colours (Version 13.0): deep blue
## panels, cyan for what is ready. A stand-in until the game's own lettering and frames are brought over.
extends Control

const PANEL := Color(0.06, 0.08, 0.24, 0.88)
const EDGE := Color(0.22, 0.28, 0.62)
const READY := Color(0.35, 0.9, 1.0)
const DIM := Color(0.55, 0.6, 0.8)

var hero  # hero.gd
var loot  # loot.gd (may be null)
var _font: Font


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_font = ThemeDB.fallback_font


func _process(_dt: float) -> void:
	queue_redraw()


func _draw() -> void:
	if hero == null:
		return
	var r: Dictionary = hero.readiness()
	var slots := [["STRIKE", "LMB", 1.0], ["WHIRL", "RMB", r["whirl"]], ["LUNGE", "SPACE", r["lunge"]]]
	var w := 104.0
	var h := 34.0
	var gap := 8.0
	var x0 := (size.x - (w * 3 + gap * 2)) / 2.0
	var y := size.y - h - 10.0
	for i in slots.size():
		var s: Array = slots[i]
		var box := Rect2(x0 + i * (w + gap), y, w, h)
		draw_rect(box, PANEL)
		var k: float = s[2]
		if k < 1.0:
			draw_rect(Rect2(box.position, Vector2(box.size.x * k, box.size.y)), Color(0.12, 0.16, 0.4, 0.9))
		draw_rect(box, READY if k >= 1.0 else EDGE, false, 2.0)
		draw_string(_font, box.position + Vector2(8, 15), s[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 13, READY if k >= 1.0 else DIM)
		draw_string(_font, box.position + Vector2(8, 29), s[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, DIM)
	if loot != null:
		loot.draw_hud(self, _font)
