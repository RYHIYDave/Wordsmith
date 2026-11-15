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
## THE BOSS'S NAME ACROSS THE SCREEN (ui/cards.ts drawBossCard): {name, t, secs}, empty when none.
var card := {}
var _font: Font


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	process_mode = Node.PROCESS_MODE_ALWAYS
	_font = ThemeDB.fallback_font


func _process(dt: float) -> void:
	if not card.is_empty():
		if not get_tree().paused:
			card["t"] += dt
		if card["t"] > card["secs"]:
			card = {}
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
	if not card.is_empty():
		_boss_card()
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


## (ui/cards.ts) In the enemy's colours, large, dropped in with a flash from 1 s into his line, a rule running out to either
## side with a diamond at its end, a band of dark behind it; gone as he begins to fight.
const ENEMY_EDGE := Color("#ff4f8a")
const ENEMY_DEEP := Color("#7a1058")
const ENEMY_GOLD := Color("#ffd27a")
const ENEMY_LIGHT := Color("#fff0a0")
const ENEMY_INK := Color("#0d0716")
const NAME_AT := 1.0


func _boss_card() -> void:
	var n: String = card["name"]
	var name := n.to_upper() if n.to_lower().begins_with("the ") else "THE " + n.to_upper()
	var t: float = card["t"] - NAME_AT
	var left: float = card["secs"] - card["t"]
	if t < 0.0:
		return
	var a := clampf(t / 0.12, 0.0, 1.0) if left > 0.5 else clampf(left / 0.5, 0.0, 1.0)
	if a <= 0.0:
		return
	var px := 44
	var w := _font.get_string_size(name, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
	var h := float(px)
	var ease := func(v: float) -> float: return 1.0 - (1.0 - v) * (1.0 - v)
	var drop := roundf((1.0 - ease.call(clampf(t / 0.15, 0.0, 1.0))) * -16.0)
	var y := roundf(size.y * 0.62) + drop
	draw_rect(Rect2(0, y - h * 0.45, size.x, h * 1.9), Color(ENEMY_INK, 0.55 * a))
	var cx := size.x / 2.0
	var out: float = ease.call(clampf((t - 0.08) / 0.45, 0.0, 1.0)) * minf(140.0, (size.x - w) / 2.0 - 24.0)
	var ry := y + h * 0.5
	for side in [-1.0, 1.0]:
		var x0: float = cx + side * (w / 2.0 + 12.0)
		var x1: float = x0 + side * out
		if absf(x1 - x0) >= 4.0:
			draw_rect(Rect2(minf(x0, x1), ry, absf(x1 - x0), 2), Color(ENEMY_EDGE, a))
			var tip := Vector2(x1, ry + 1)
			draw_colored_polygon(PackedVector2Array([tip + Vector2(0, -5), tip + Vector2(5, 0), tip + Vector2(0, 5), tip + Vector2(-5, 0)]), Color(ENEMY_GOLD, a))
	var at := Vector2(cx - w / 2.0, y + h * 0.8)
	var flash := t < 0.2
	draw_string(_font, at + Vector2(3, 4), name, HORIZONTAL_ALIGNMENT_LEFT, -1, px, Color(ENEMY_DEEP, a))
	draw_string_outline(_font, at, name, HORIZONTAL_ALIGNMENT_LEFT, -1, px, 6, Color(ENEMY_EDGE, a))
	draw_string(_font, at, name, HORIZONTAL_ALIGNMENT_LEFT, -1, px, Color(Color.WHITE if flash else ENEMY_LIGHT, a))


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
