## What is shown over the game: his three attacks at the foot of the screen, each with its key and how soon it is ready
## again; his level, experience, gold and flasks (loot.gd); the guide's prompt at the top (guide.gd); what E would do
## where he stands (town.gd); and what is said to him, in a box till he presses E or clicks. In the heroes' colours
## (Version 13.0): deep blue panels, cyan for what is ready, pink for the one thing to press. A stand-in until the game's
## own lettering and frames are brought over.
extends Control

const PANEL := Color(0.06, 0.08, 0.24, 0.88)
const EDGE := Color(0.22, 0.28, 0.62)
const READY := Color(0.35, 0.9, 1.0)
const DIM := Color(0.55, 0.6, 0.8)
const PRESS := Color(0.96, 0.27, 0.47)

var main  # main.gd
var hero  # hero.gd
var loot  # loot.gd (may be null)
var words := ""
var words_frame := 0
var _font: Font


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	process_mode = Node.PROCESS_MODE_ALWAYS
	_font = ThemeDB.fallback_font


func _process(_dt: float) -> void:
	if words != "" and Engine.get_process_frames() > words_frame and not get_tree().paused and (Input.is_action_just_pressed("interact") or Input.is_action_just_pressed("attack")):
		words = ""
	queue_redraw()


func _draw() -> void:
	if hero == null:
		return
	var r: Dictionary = hero.readiness()
	var slots := [["STRIKE", "LMB", 1.0], ["WHIRLWIND", "HOLD RMB", r["whirl"]], ["LUNGE", "SPACE", r["lunge"]]]
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
		var name: String = s[0]
		if i == 0 and hero.strike_words["front"] == "power":
			name = "POWER STRIKE"
		draw_string(_font, box.position + Vector2(8, 15), name, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, READY if k >= 1.0 else DIM)
		draw_string(_font, box.position + Vector2(8, 29), s[1], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, DIM)
	if loot != null:
		loot.draw_hud(self, _font)
	if main == null:
		return
	# what E would do here
	var p: Array = main.prompt()
	if p[0] != "":
		_centred(p[0], size.y - h - 26.0, 13, PRESS if p[1] != "" else DIM)
	# the guide's prompt
	var b: Dictionary = main.guide.banner()
	if not b.is_empty():
		var bw := 420.0
		var bx := (size.x - bw) / 2.0
		draw_rect(Rect2(bx, 8, bw, 56 if b["sub"] != "" else 40), PANEL)
		draw_rect(Rect2(bx, 8, bw, 56 if b["sub"] != "" else 40), EDGE, false, 1.0)
		_centred(b["caption"], 22, 10, DIM)
		_centred(b["text"], 40, 15, READY)
		if b["sub"] != "":
			_centred(b["sub"], 56, 11, Color(0.8, 0.84, 0.95))
	# what is said to him
	if words != "":
		var lines := _wrap(words, 70)
		var bh := 20.0 + lines.size() * 16.0 + 14.0
		var box := Rect2((size.x - 560) / 2.0, size.y * 0.55, 560, bh)
		draw_rect(box, Color(0.03, 0.04, 0.13, 0.95))
		draw_rect(box, READY, false, 1.5)
		for i in lines.size():
			draw_string(_font, box.position + Vector2(14, 22 + i * 16), lines[i], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.86, 0.9, 1.0))
		draw_string(_font, box.position + Vector2(box.size.x - 70, box.size.y - 8), "E: ON", HORIZONTAL_ALIGNMENT_LEFT, -1, 10, PRESS)


func _centred(s: String, y: float, px: int, c: Color) -> void:
	var w := _font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
	draw_string(_font, Vector2((size.x - w) / 2.0, y), s, HORIZONTAL_ALIGNMENT_LEFT, -1, px, c)


func _wrap(s: String, n: int) -> Array:
	var out: Array = []
	var line := ""
	for word in s.split(" "):
		if line.length() + word.length() + 1 > n and line != "":
			out.append(line)
			line = word
		else:
			line = word if line == "" else line + " " + word
	if line != "":
		out.append(line)
	return out
