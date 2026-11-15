## THE GAME'S LETTERS (engine/font.ts drawText, textWidth, wrapText), from assets/font (tools/godot_font.ts): its two pixel
## fonts, 'normal' (capitals 7 game pixels tall) and 'small' (3 by 5 capitals), each glyph as the screen draws it, at two
## picture pixels to a game pixel, its diagonals smoothed and the normal font's stems thickened.
## Everything here is in GAME pixels: draw on a canvas item whose transform puts two picture pixels to a game pixel
## (hud.gd draws so; a node in the world sets draw_set_transform(Vector2.ZERO, 0, Vector2(2, 2)) first). Text is laid as the
## game lays it: y the top of the glyph cell, a game pixel between letters, its left edge and top rounded to whole game
## pixels; a shadow one font pixel down and right; `scale` whole game pixels to a font pixel.
extends RefCounted

const DIR := "res://assets/font/"

static var _data := {}
static var _tex := {}


static func _ready_up() -> void:
	if not _data.is_empty():
		return
	_data = JSON.parse_string(FileAccess.get_file_as_string(DIR + "font.json"))
	_tex["normal"] = load(DIR + "normal.png")
	_tex["small"] = load(DIR + "small.png")


## [x in the font's own pixels, width, inked] for a character code ('?' for one the font lacks).
static func _glyph(f: Dictionary, code: int) -> Array:
	var g: Dictionary = f["glyphs"]
	var key := str(code)
	if g.has(key):
		return g[key]
	if f["caps_only"] and code >= 97 and code <= 122 and g.has(str(code - 32)):
		return g[str(code - 32)]
	var alike: Dictionary = _data["look_alikes"]
	if alike.has(key) and g.has(str(int(alike[key]))):
		return g[str(int(alike[key]))]
	return g[str(int(f["unknown"]))]


static func _is_letter(code: int) -> bool:
	var lower := code | 32
	return lower >= 97 and lower <= 122


## Width in game pixels that `draw` would draw (0 for an empty string).
static func width(text: String, font := "normal", scale := 1) -> float:
	_ready_up()
	var f: Dictionary = _data[font]
	if text.is_empty():
		return 0.0
	var w := -1
	for i in text.length():
		w += int(_glyph(f, text.unicode_at(i))[1]) + 1
	return float(w * maxi(1, scale))


## The line advance in game pixels (9 normal, 6 small).
static func line(font := "normal") -> int:
	_ready_up()
	return int(_data[font]["line"])


## Draw one line. `opts`: align ("left", "center", "right"), font ("normal", "small"), shadow (a Color, or null), scale (1, 2,
## 3...), from (only the letters' rows this many game pixels and more below the top: ui/cards.ts, the lower half of a name in
## a second colour). Returns the width drawn, game pixels.
static func draw(ci: CanvasItem, text: String, x: float, y: float, color: Color, opts := {}) -> float:
	_ready_up()
	var font: String = opts.get("font", "normal")
	var f: Dictionary = _data[font]
	var scale: int = maxi(1, int(opts.get("scale", 1)))
	var w := width(text, font, scale)
	if w <= 0.0:
		return w
	var align: String = opts.get("align", "left")
	var left := roundf(x - w / 2.0 if align == "center" else (x - w if align == "right" else x))
	var top := roundf(y)
	var shadow = opts.get("shadow", null)
	var from := float(opts.get("from", 0.0))
	if shadow != null:
		_blit(ci, f, font, text, left + scale, top + scale, scale, shadow, from)
	_blit(ci, f, font, text, left, top, scale, color, from)
	return w


static func _blit(ci: CanvasItem, f: Dictionary, font: String, text: String, x: float, y: float, scale: int, color: Color, from := 0.0) -> void:
	var tex: Texture2D = _tex[font]
	var h := float(f["h"])
	var cut := clampf(from / scale, 0.0, h)
	var prev := 0
	var n := text.length()
	for i in n:
		var code := text.unicode_at(i)
		var g := _glyph(f, code)
		# (the small font: an x that is not part of a word, "x3", is a multiply sign)
		if code == 120 and f.has("times") and not _is_letter(prev) and not (i + 1 < n and _is_letter(text.unicode_at(i + 1))):
			g = f["glyphs"][str(int(f["times"]))]
		var gw := float(g[1])
		if int(g[2]) == 1:
			# (a fine glyph may be a picture pixel wider than its cell: a font pixel more is copied, out of the sheet's padding)
			var src := Rect2(float(g[0]) * 2.0, cut * 2.0, (gw + 1.0) * 2.0, (h - cut) * 2.0)
			if src.size.y > 0.0:
				ci.draw_texture_rect_region(tex, Rect2(x, y + cut * scale, (gw + 1.0) * scale, (h - cut) * scale), src, color)
		x += (gw + 1.0) * scale
		prev = code


## Greedy word wrap to a width in game pixels, as the game's wrapText: honours line breaks, runs of spaces made one, a word too
## wide for a line split across lines; never empty.
static func wrap(text: String, max_width: float, font := "normal") -> Array:
	var out: Array = []
	for para in text.replace("\r\n", "\n").split("\n"):
		var indent := ""
		while indent.length() < para.length() and para[indent.length()] == " ":
			indent += " "
		var words: Array = []
		for wd in para.replace("\t", " ").split(" "):
			if wd != "":
				words.append(wd)
		var ln := ""
		for i in words.size():
			var first: String = indent + words[i] if i == 0 else words[i]
			var joined: String = first if ln == "" else ln + " " + words[i]
			if width(joined, font) <= max_width:
				ln = joined
				continue
			if ln != "":
				out.append(ln)
			var rest: String = first
			while width(rest, font) > max_width and rest.length() > 1:
				var k := 1
				while k < rest.length() and width(rest.substr(0, k + 1), font) <= max_width:
					k += 1
				out.append(rest.substr(0, k))
				rest = rest.substr(k)
			ln = rest
		out.append(ln)
	return out
