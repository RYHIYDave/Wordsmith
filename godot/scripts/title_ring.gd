## THE START SCREEN'S PICTURE, THE RING ON THE HILL, AND ITS LIFE (art/title_ring.ts makeRingTitle, life, flash): night, a hill,
## and on its crown the wordsmith's ring of standing stones, a rune burning in each; off his slab a column of light goes up into
## the sky and breaks there into an aurora, letters drifting in it; the river of stars over it all. His words to it, 21 Oct 2026:
## “I like the surge, take the wordsmith out”.
##   Laid up, as the game lays it, out of the layers it paints once (assets/title/ring_<layer>.png, ring.json: tools/godot_title.mjs,
## the game's own art/title_ring.ts ringPort), back to front: the sky; the light added over it (the stars twinkling, the two
## curtains of the aurora a column of pixels at a time stretched from its strips, the letters drifting in it, the light the land
## spills into the sky), laid afresh twelve times a second and every frame while the surge runs through it; the land, the back
## stones and the slab; the column's light; the letters climbing it; THE SURGE (every 8 s, the first 3 s in: a burst of light up
## the column, a wave of it out across the aurora from the middle, a ring of it across the hill, every rune flaring and dying
## back, a faint flash over the whole screen: flash()); the back stones' runes swelling in turn, a wave round the ring; the front
## stones and their light; theirs; motes of his light rising off the hill; the picture's foot and top sunk into the screen's dark.
##   Light is added as the game's canvas adds it ('lighter'): each layer of light its own CanvasItem drawn with an added blend.
## Its pixels are game pixels; the node is put where the screen wants the picture and scaled to the screen (title.gd).
extends Node2D

const DIR := "res://assets/title/"

var D := {}
var t := 0.0
var _tex := {}
var _layer := {}
var _sky_key := NAN
var _sp := -1.0
var _sky_t := 0.0
var _phs := []
var _cols := {}


static func _imul(a: int, b: int) -> int:
	a &= 0xffffffff
	b &= 0xffffffff
	var lo := (a & 0xffff) * (b & 0xffff)
	var mid := (((a >> 16) * (b & 0xffff) + (a & 0xffff) * (b >> 16)) & 0xffff) << 16
	var r := (lo + mid) & 0xffffffff
	return r - 0x100000000 if r >= 0x80000000 else r


## engine/rng.ts hash2: 0 to 1 from three whole numbers.
static func hash2(x: int, y: int, s := 0) -> float:
	var h := (_imul(x, 374761393) + _imul(y, 668265263) + _imul(s, 2246822519)) & 0xffffffff
	h = _imul(h ^ (h >> 13), 1274126177) & 0xffffffff
	return float((h ^ (h >> 16)) & 0xffffffff) / 4294967296.0


static func noise1(x: float, s := 0) -> float:
	var i := floori(x)
	var f := x - i
	var u := f * f * (3.0 - 2.0 * f)
	return hash2(i, 7, s) * (1.0 - u) + hash2(i + 1, 7, s) * u


static func _round(v: float) -> int:
	return floori(v + 0.5)


## The near hill: the row of its top at column x (its crown under the ring).
func hill_top(x: float) -> float:
	return 208.0 + pow(absf(x - float(D["cx"])) / 330.0, 1.8) * 120.0 + (noise1(x * 0.05, 71) - 0.5) * 3.0


## The game's css(c, k): the colour times k, each part rounded to a whole level.
static func css(c: Color, k := 1.0) -> Color:
	return Color8(_round(c.r8 * k), _round(c.g8 * k), _round(c.b8 * k))


func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	D = JSON.parse_string(FileAccess.get_file_as_string(DIR + "ring.json"))
	for k in ["sky", "lightA", "frontA", "column", "lightB", "frontB", "edges", "strips", "runeGlow", "surgeBlob"]:
		_tex[k] = load(DIR + "ring_%s.png" % k)
	for k in D["colors"]:
		_cols[k] = Color(D["colors"][k])
	for c in D["curtains"]:
		_phs.append(hash2(int(c["seed"]), 1, 3) * 6.28)
	var add := CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	# (back to front: [its name, added or laid over])
	for L in [["sky", false], ["skyLight", true], ["frontA", false], ["column", true], ["letters", false], ["surge", true],
			["backGlow", true], ["backRunes", false], ["frontB", false], ["lightB", true], ["frontGlow", true], ["frontRunes", false],
			["motes", true], ["edges", false]]:
		var n := Node2D.new()
		if L[1]:
			n.material = add
		n.draw.connect(_draw_layer.bind(L[0], n))
		add_child(n)
		_layer[L[0]] = n


## How far into a surge time t is (seconds; -1 before the first).
func surge_phase(tt: float) -> float:
	var S: Dictionary = D["surge"]
	return -1.0 if tt < float(S["first"]) else fmod(tt - float(S["first"]), float(S["every"]))


## How much the surge brightens the aurora at column x, sp into it: a wave running out from the middle.
func _surge_sky(sp: float, x: float) -> float:
	var S: Dictionary = D["surge"]
	if sp < float(S["up"]) or sp >= float(S["skyFor"]):
		return 0.0
	var d := sp - float(S["up"])
	return 1.4 * exp(-pow((absf(x - float(D["cx"])) - 480.0 * d) / 90.0, 2.0)) * exp(-d * 0.9)


static func _flare(sp: float) -> float:
	return 0.0 if sp < 0.0 or sp > 2.0 else (sp / 0.05 if sp < 0.05 else exp(-(sp - 0.05) * 2.2))


static func _pulse(i: int, tt: float) -> float:
	return clampf(0.5 + 0.5 * sin(tt * 1.6 - i * 0.63), 0.0, 1.0)


## The picture at time `tt` (seconds): what changes is drawn afresh.
func at(tt: float) -> void:
	t = tt
	var sp := surge_phase(tt)
	_sp = sp
	var surging := sp >= 0.0 and sp < float(D["surge"]["skyFor"])
	var key := tt if surging else floorf(tt * 12.0)
	if key != _sky_key:
		_sky_key = key
		_sky_t = tt if surging else key / 12.0
		_layer["skyLight"].queue_redraw()
	for k in ["letters", "surge", "backGlow", "backRunes", "frontGlow", "frontRunes", "motes"]:
		_layer[k].queue_redraw()


## A flash over the whole screen at time `tt` (the surge): its colour, and how strong (0, none).
func flash(tt: float) -> Array:
	var d := surge_phase(tt) - float(D["surge"]["up"])
	return [Color.BLACK, 0.0] if d < 0.0 or d > 0.4 else [css(_cols["cyHi"]), 0.14 * exp(-d * 8.0)]


func _rune(n: CanvasItem, x: float, y: float, i: int, c: Color, big := 1) -> void:
	var runes: Array = D["runes"]
	var r: Array = runes[((i % runes.size()) + runes.size()) % runes.size()]
	for j in r.size():
		var row: String = r[j]
		for q in 3:
			if row[q] == "x":
				n.draw_rect(Rect2(x + q * big, y + j * big, big, big), c)


func _draw_layer(name: String, n: Node2D) -> void:
	match name:
		"sky", "frontA", "column", "frontB", "lightB", "edges":
			n.draw_texture(_tex[name], Vector2.ZERO)
		"skyLight":
			_draw_sky_light(n)
		"letters":
			# (letters climbing the column)
			for i in 6:
				var y := floorf(float(D["slabY"]) - 26.0 - fmod(i * 22.0 + t * 18.0, 132.0))
				_rune(n, float(D["slabX"]) - 3.0, y, i * 3 + 1, _cols["cyLo"], 2)
		"surge":
			_draw_surge(n)
		"backGlow", "frontGlow", "backRunes", "frontRunes":
			var flare := _flare(_sp)
			var glow := name.ends_with("Glow")
			for st in D["back" if name.begins_with("back") else "front"]:
				var k := maxf(_pulse(int(st["i"]), t), flare)
				var rx := float(st["rune"][0])
				var ry := float(st["rune"][1])
				if glow:
					n.draw_texture(_tex["runeGlow"], Vector2(rx + 3.0 - 13.0, ry + 5.0 - 13.0), Color(1, 1, 1, k))
				elif k > 0.6:
					_rune(n, rx, ry, int(st["i"]) + 2, _cols["cyHi"], 2)
		"motes":
			var sx := float(D["slabX"])
			for i in 40:
				var x0 := sx + (hash2(i, 1, 97) - 0.5) * 360.0
				var age := fmod(hash2(i, 2, 97) + t * (0.06 + hash2(i, 3, 97) * 0.05), 1.0)
				var x := floorf(x0 + sin(t * 0.8 + i) * 4.0)
				var y := floorf(hill_top(x0) + 4.0 - age * 90.0)
				var k := sin(age * PI)
				n.draw_rect(Rect2(x, y, 1, 1), css(_cols["cyHi"], 0.7 * k))
				n.draw_rect(Rect2(x, y + 1, 1, 1), css(_cols["cy"], 0.35 * k))


## THE SKY'S LIGHT: the stars twinkling, the aurora, its letters, the light the land spills up into it.
func _draw_sky_light(n: Node2D) -> void:
	var tt := _sky_t
	var sp := _sp
	for s in D["stars"]:
		var i := int(s["i"])
		var more := 0.6 + 0.4 * sin(tt * (1.3 + hash2(i, 5, 41) * 2.0) + i) - 0.75
		if more <= 0.0:
			continue
		n.draw_rect(Rect2(float(s["x"]), float(s["y"]), 1, 1), css(_cols["white"] if s["white"] else _cols["star"], more * 1.6))
	var NS := int(D["ns"])
	var SH := int(D["sh"])
	var cx := float(D["cx"])
	for ci in (D["curtains"] as Array).size():
		var c: Dictionary = D["curtains"][ci]
		var ph: float = _phs[ci]
		var drift := float(c["drift"])
		var seed := int(c["seed"])
		var lowest := float(c["lowest"])
		var len := float(c["len"])
		var k0 := float(c["k0"])
		for x in 640:
			var near := clampf(1.0 - absf(x - cx) / 340.0, 0.0, 1.0)
			var bottom := lowest - 16.0 * sin(x * 0.011 + ph + tt * drift) - 7.0 * sin(x * 0.029 + ph * 2.0 - tt * drift * 1.7) - near * near * 22.0
			var tall := len * (0.7 + 0.3 * sin(x * 0.017 + ph * 3.0)) + near * 24.0
			var fold := 0.5 + 0.5 * sin(x * 0.021 + ph + tt * drift * 2.3)
			var ray := 0.55 + 0.45 * noise1(x * 0.22 + tt * drift * 5.0, seed + 3)
			var strong := k0 * (0.3 + 0.7 * fold) * ray * (0.5 + 0.5 * near)
			var boost := _surge_sky(sp, x)
			var k := clampi(floori(minf(1.0, strong * (1.0 + boost) + boost * 0.25) * NS), 0, NS - 1)
			var y0 := floorf(bottom - tall)
			n.draw_texture_rect_region(_tex["strips"], Rect2(x, y0, 1, floorf(bottom) + 2.0 - y0), Rect2(k, 0, 1, SH + 1))
	for i in 26:
		var x := floorf(30.0 + hash2(i, 1, 57) * 580.0)
		var y := floorf(180.0 - fmod(hash2(i, 2, 57) * 120.0 + tt * (3.0 + hash2(i, 3, 57) * 4.0), 130.0))
		var k := 0.3 + clampf(1.0 - absf(x - cx) / 330.0, 0.0, 1.0) * 0.35
		_rune(n, x, y, i, css(_cols["cy"], minf(1.0, k * (1.0 + _surge_sky(sp, x)))))
	n.draw_texture(_tex["lightA"], Vector2.ZERO)


## THE SURGE: a burst of light up the column; a ring of it out across the ground.
func _draw_surge(n: Node2D) -> void:
	var S: Dictionary = D["surge"]
	var sp := _sp
	var sx := float(D["slabX"])
	var sy := float(D["slabY"])
	if sp >= 0.0 and sp < float(S["up"]):
		var y := _round(sy - 12.0 - (sy - 60.0) * (sp / float(S["up"])))
		var b: Texture2D = _tex["surgeBlob"]
		n.draw_texture(b, Vector2(sx - floorf(b.get_width() / 2.0), y - floorf(b.get_height() / 2.0)))
	if sp >= 0.0 and sp < float(S["ringFor"]):
		var u := sp / float(S["ringFor"])
		var rx := 24.0 + 460.0 * u
		var ry := rx * (float(D["ringRY"]) / float(D["ringRX"]))
		for k in 3:
			var col := css(_cols["cyHi"] if k == 1 else _cols["cy"], (1.0 - u) * (0.7 if k == 1 else 0.4))
			var steps := ceili(rx * 2.0)
			for q in steps:
				var a := float(q) / steps * PI * 2.0
				var x := _round(sx + cos(a) * (rx + k - 1))
				var y := _round(sy + sin(a) * (ry + (k - 1) * 0.5))
				if y > hill_top(x) + 1.0:
					n.draw_rect(Rect2(x, y, 1, 1), col)
