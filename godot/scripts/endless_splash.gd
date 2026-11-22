## ENDLESS MODE'S FANFARE (ui/endless_fanfare.ts, ui/endless_splash_draw.ts; the art chat's STAIR WITH NO BOTTOM, art/endless_stair.ts,
## his pick: “2 The stair with no bottom”). His words, 7 Nov 2026: “I’d like a little more fanfare for endless mode.  Like a big
## splash screen and a pop up description of what endless mode is.” As the last floor is beaten and endless mode opens (main.gd
## endless_fanfare, once he is in his town), the game waits under both:
##   THE SPLASH, the whole screen, for 3.2 s (a press after 0.8 s goes on at once): out of the dark the storeys of the shaft wake one
##     after another down it, each with a flash, a kick of the screen and dust off its ledge; the far fire takes; ENDLESS falls onto
##     the top of the shaft with its whole weight; THE WAY GOES ON comes up, and HARDCORE strikes, gold for a blink, then the enemy's
##     pink. Then it lives quietly: the torches, the waypoint's light going round and its motes rising, the far fire breathing.
##   THE CARD, what endless mode is, in plain words, the game darkened behind it, until GO ON (Enter or Space once it has been up
##     half a second).
## The picture and its pieces from the game itself (assets/endless: tools/godot_splash.ts); laid up here as the game lays them, each
## light added as the game's canvas adds it ('lighter'), what is still asleep covered by the stage map's own shader.
extends Control

signal done

const PF := preload("res://scripts/pixel_font.gd")
const Ring := preload("res://scripts/title_ring.gd")
const DIR := "res://assets/endless/"
const NIGHT := Color("#05040f")
const FACE := Color("#ece8ff")
const UNDER := Color("#b0a4e0")
const EDGE := Color("#2a2466")
const PINK := Color("#ff4f8a")
const GOLD := Color("#ffd27a")
const WORD := "ENDLESS"
const WAY := "THE WAY GOES ON"
const HARD := "HARDCORE"
const SUB_GAP := 10.0

const COVER := """shader_type canvas_item;
uniform float awake;
uniform vec4 night : source_color;
void fragment() {
	float s = floor(texture(TEXTURE, UV).r * 255.0 + 0.5);
	COLOR = s >= awake ? night : vec4(0.0);
}
"""
const FLASH := """shader_type canvas_item;
render_mode blend_add;
uniform vec3 fj;
uniform vec3 fa;
uniform vec4 col : source_color;
void fragment() {
	float s = floor(texture(TEXTURE, UV).r * 255.0 + 0.5);
	vec3 c = vec3(0.0);
	for (int i = 0; i < 3; i++) {
		if (fa[i] > 0.0 && s >= fj[i]) c += col.rgb * fa[i];
	}
	COLOR = vec4(c, 1.0);
}
"""

var main
var sfx
## (where the pointer is taken to be in shot mode, game pixels; null: the mouse)
var pointer = null
var D := {}
var T := {}
var P := {}
## Seconds since the splash came up; when the card came up (-1: not yet).
var t := 0.0
var card_at := -1.0
## (for pictures: its clock held where it is set)
var hold := false
var _still: Texture2D
var _stage: Texture2D
var _sheet: Texture2D
var _L := {}
var _kick := Vector2.ZERO
var _layers := {}
var _flash_mat: ShaderMaterial
var _cover_mat: ShaderMaterial
var _go := Rect2()


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	D = JSON.parse_string(FileAccess.get_file_as_string(DIR + "splash.json"))
	var H: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/hud/hud.json"))
	for k in H["theme"]:
		T[k] = Color(H["theme"][k])
	for k in H["palette"]:
		var v = H["palette"][k]
		if v is String and v.begins_with("#"):
			P[k] = Color(v)
	_still = load(DIR + "still.png")
	_stage = load(DIR + "stage.png")
	_sheet = load(DIR + "pieces.png")
	var add := CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	_flash_mat = ShaderMaterial.new()
	_flash_mat.shader = Shader.new()
	_flash_mat.shader.code = FLASH
	_cover_mat = ShaderMaterial.new()
	_cover_mat.shader = Shader.new()
	_cover_mat.shader.code = COVER
	# (laid up back to front, as the game lays them: each light its own layer, added)
	for spec in [["base", null], ["light", add], ["flash", _flash_mat], ["cover", _cover_mat], ["dust", null], ["far", add],
			["over", null], ["white", add], ["subs", null], ["card", null]]:
		var c := Control.new()
		c.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		c.mouse_filter = Control.MOUSE_FILTER_IGNORE
		c.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		if spec[1] != null:
			c.material = spec[1]
		add_child(c)
		var name_of: String = spec[0]
		c.draw.connect(func() -> void: _draw_layer(name_of))
		_layers[name_of] = c


func _W() -> float:
	return floorf(size.x / 2.0)


func _H() -> float:
	return floorf(size.y / 2.0)


func _pointer() -> Vector2:
	return pointer if pointer != null else get_local_mouse_position() / 2.0


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


## (Math.round)
static func _rd(v: float) -> float:
	return floorf(v + 0.5)


func _process(dt: float) -> void:
	if not hold:
		t += dt
	if card_at < 0.0 and t >= float(D["fanfare"]["splash"]):
		_to_card()
	_L = lettering(_W(), _H())
	_kick = kick_at(t)
	for c in _layers.values():
		c.queue_redraw()


func _to_card() -> void:
	card_at = t


func _input(event: InputEvent) -> void:
	var press := (event is InputEventMouseButton or event is InputEventScreenTouch) and event.is_pressed()
	var key := false
	if event is InputEventKey and event.is_pressed() and not event.is_echo():
		var kc := (event as InputEventKey).keycode
		key = kc == KEY_ENTER or kc == KEY_KP_ENTER or kc == KEY_SPACE
	if card_at < 0.0:
		if (press or key) and t >= float(D["fanfare"]["skip"]):
			_to_card()
		get_viewport().set_input_as_handled()
		return
	var armed := t - card_at >= float(D["fanfare"]["armed"])
	var on_go := false
	if press:
		var at: Vector2 = ((event as InputEventScreenTouch).position if event is InputEventScreenTouch else get_local_mouse_position()) / 2.0
		on_go = _go.has_point(at)
	if armed and (on_go or key):
		go_on()
	get_viewport().set_input_as_handled()


## GO ON: the card down, the game on.
func go_on() -> void:
	done.emit()


# --- THE SPLASH (ui/endless_splash_draw.ts drawEndlessSplashArt) ---

func _wake(j: int) -> float:
	return float(D["wake"][j])


func _awake() -> int:
	var n := 0
	var G := int(D["gates"])
	while n <= G and t >= _wake(n):
		n += 1
	return n


## (the stair's lettering: art/endless_stair.ts) Where the letters go across the top of the shaft, on this screen.
func lettering(w: float, h: float) -> Dictionary:
	var word_w := PF.width(WORD)
	var sub_w := PF.width(WAY) + SUB_GAP + PF.width(HARD)
	var vy := _rd(h * float(D["vyAt"]))
	var one := sub_w <= w - 16.0
	var scale := 6
	while scale > 2 and (word_w * scale > w * 0.66 or 7.0 * scale > h * 0.2):
		scale -= 1
	var word_y := maxf(scale, _rd(h * 0.045)) + (scale >> 1)
	var sub_y := word_y + 7.0 * scale + scale + 3.0
	return {"ox": floorf(w / 2.0) - float(D["esW"]) / 2.0, "oy": vy - float(D["stair"]["VY"]) / 2.0, "lintel": sub_y + (7.0 if one else 16.0) + 3.0,
		"scale": scale, "wordY": word_y, "subY": sub_y, "oneLine": one}


## The kick of the screen (game pixels, halves): each stage as it wakes, the word landing the heaviest.
func kick_at(tt: float) -> Vector2:
	var M: Dictionary = D["moment"]
	var G := int(D["gates"])
	var sx := 0.0
	var sy := 0.0
	for j in G + 1:
		var dt := tt - _wake(j)
		if dt < 0.0 or dt >= 0.14:
			continue
		var amp := (3.5 if j == G else (2.0 if j == 0 else 3.0 * sqrt(float(D["near"][j])))) * (1.0 - dt / 0.14)
		sy += amp * cos(dt * 80.0)
		sx += amp * 0.6 * sin(dt * 97.0 + j)
	var dl := tt - float(M["land"])
	if dl >= 0.0 and dl < 0.28:
		sy += 6.0 * (1.0 - dl / 0.28) * cos(dl * 62.0)
	var dh := tt - float(M["hard"])
	if dh >= 0.0 and dh < 0.1:
		sx += 1.5 * (1.0 - dh / 0.1) * cos(dh * 90.0)
	return Vector2(_rd(sx * 2.0) / 2.0, _rd(sy * 2.0) / 2.0)


## (art/endless_stair.ts dust) Grain i of the dust off storey k, `a` seconds after it wakes (`land`: after the word lands): where,
## how big (picture pixels), how much of it is left; [] when it is gone.
func dust_grain(k: int, i: int, a: float, land: bool) -> Array:
	var S: Dictionary = D["stair"]
	var s := 977 if land else 0
	var life := 0.6 + Ring.hash2(i, k, 307 + s) * 0.5
	var age := a - Ring.hash2(i, k, 301 + s) * 0.08
	if age < 0.0 or age > life:
		return []
	var th := Ring.hash2(i, k, 311 + s) * TAU
	var z := float(S["Z0"]) + float(S["DZ"]) * k + 0.2 + (9.0 if land else 5.0) * age + 30.0 * age * age
	var rr := (float(S["F"]) * (float(S["RW"]) - 0.12 - Ring.hash2(i, k, 313 + s) * 0.5)) / z
	return [float(S["VX"]) + rr * cos(th), float(S["VY"]) + rr * sin(th), 2.0 if z < 9.0 and Ring.hash2(i, k, 317 + s) > 0.5 else 1.0, ceilf((1.0 - age / life) * 4.0) / 4.0]


func _dust_n(k: int, land: bool) -> int:
	return 44 if land else int(_rd(6.0 + 16.0 * float(D["near"][k])))


func _dust(c: CanvasItem, born: float, k: int, land: bool, color: Color, o: Vector2) -> void:
	var a := t - born
	if a < 0.0 or a > 1.4:
		return
	for i in _dust_n(k, land):
		var d := dust_grain(k, i, a, land)
		if d.is_empty():
			continue
		c.draw_rect(Rect2(o.x * 2.0 + _rd(d[0]), o.y * 2.0 + _rd(d[1]), d[2], d[2]), Color(color, float(d[3])))


## A piece of the picture (its pixels as painted, at their own place in it), the picture's corner at `o`.
func _piece(c: CanvasItem, key: String, o: Vector2, a := 1.0) -> void:
	var q: Array = D["pieces"][key]
	c.draw_texture_rect_region(_sheet, Rect2(o.x * 2.0 + float(q[4]), o.y * 2.0 + float(q[5]), q[2], q[3]), Rect2(q[0], q[1], q[2], q[3]), Color(1, 1, 1, a))


## (add) A light painted by glowOf added with its middle at (cx, cy), at its own size.
func _glow(c: CanvasItem, key: String, cx: float, cy: float, a: float) -> void:
	if a <= 0.0:
		return
	var q: Array = D["pieces"][key]
	c.draw_texture_rect_region(_sheet, Rect2(_rd(cx * 2.0) - float(q[2]) / 2.0, _rd(cy * 2.0) - float(q[3]) / 2.0, q[2], q[3]), Rect2(q[0], q[1], q[2], q[3]), Color(1, 1, 1, minf(1.0, a)))


## (burst) The same light at any size: its bands laid on row by row, each a row of the picture's own pixels.
func _burst(c: CanvasItem, cx: float, cy: float, rx: float, ry: float, color: Color, a: float, bands: int, h: float) -> void:
	if a <= 0.0:
		return
	for i in range(1, bands + 1):
		var al := minf(1.0, a * (pow(float(i) / bands, 2.0) - pow(float(i - 1) / bands, 2.0)))
		var f := float(bands - i + 1) / bands
		var by := _rd(ry * f * 2.0) / 2.0
		var y := -by
		while y < by:
			if cy + y >= -1.0 and cy + y <= h:
				var hw := _rd(rx * f * sqrt(maxf(0.0, 1.0 - pow((y + 0.25) / by, 2.0))) * 2.0) / 2.0
				if hw > 0.0:
					c.draw_rect(Rect2((cx - hw) * 2.0, (cy + y) * 2.0, hw * 4.0, 1.0), Color(color, al))
			y += 0.5


func _text(c: CanvasItem, s: String, x: float, y: float, col: Color, opts := {}) -> float:
	return PF.draw(c, s, x, y, col, opts)


## The game's letters with a dark edge round them.
func _edged(c: CanvasItem, s: String, cx: float, y: float, scale: int, face: Color, edge: Color) -> void:
	var e := ceilf(scale / 2.0)
	for d in [Vector2(-1, 0), Vector2(1, 0), Vector2(0, -1), Vector2(0, 1)]:
		_text(c, s, cx + d.x * e, y + d.y * e, edge, {"align": "center", "scale": scale})
	_text(c, s, cx, y, face, {"align": "center", "scale": scale})


func _draw_layer(name: String) -> void:
	var c: Control = _layers[name]
	if name == "card":
		if card_at >= 0.0:
			_draw_card(c)
		return
	if card_at >= 0.0:
		return
	var w := _W()
	var h := _H()
	if _L.is_empty():
		_L = lettering(w, h)
		_kick = kick_at(t)
	var L := _L
	var M: Dictionary = D["moment"]
	var G := int(D["gates"])
	var awake := _awake()
	var o := Vector2(float(L["ox"]) + _kick.x, float(L["oy"]) + _kick.y)
	var cx := floorf(w / 2.0) + _kick.x
	var ky := _kick.y
	match name:
		"base":
			# (the dark coming up over the game; the picture, once its first stage wakes, and what lives in it)
			c.draw_rect(Rect2(Vector2.ZERO, c.size), Color(NIGHT, _c01(t / 0.1)))
			if awake <= 0:
				return
			c.draw_texture(_still, o * 2.0)
			var torches: Array = D["torches"]
			for site in int(D["flames"]):
				if int(torches[site][2]) >= awake:
					continue
				_piece(c, "flame|%d|%d" % [site, (floori(t * 11.0) + site * 2) % int(D["flameN"])], o)
			if awake > int(D["wayStage"]):
				_piece(c, "way|%d" % (floori(t * 9.0) % int(D["wayN"])), o)
			if awake > G:
				_piece(c, "fire|%d" % (floori(t * 8.0) % int(D["fireN"])), o)
		"light":
			if awake <= 0:
				return
			var torches: Array = D["torches"]
			for i in torches.size():
				var tc: Array = torches[i]
				if int(tc[2]) >= awake:
					continue
				var flick := Ring.hash2(floori(t * 12.0), 3 + i, 401)
				_glow(c, "glow|torch%d" % int(tc[3]), o.x + float(tc[0]) / 2.0, o.y + float(tc[1]) / 2.0, 0.2 + flick * 0.08)
			if awake > int(D["wayStage"]):
				_glow(c, "glow|cyan", o.x + float(D["wayAt"][0]) / 2.0, o.y + float(D["wayAt"][1]) / 2.0, 0.3 + 0.07 * sin(t * 4.2))
		"flash":
			# (a flash on each stage as it wakes, the last three still dying down, over itself and all that is seen beyond it)
			var fj := Vector3(-1, -1, -1)
			var fa := Vector3.ZERO
			var n := 0
			for j in range(maxi(0, awake - 3), mini(awake, G)):
				var dt := t - _wake(j)
				if dt >= 0.16:
					continue
				fj[n] = j
				fa[n] = (0.4 if j == 0 else 0.45) * (1.0 - dt / 0.16)
				n += 1
			if awake <= 0 or n == 0:
				return
			_flash_mat.set_shader_parameter("fj", fj)
			_flash_mat.set_shader_parameter("fa", fa)
			_flash_mat.set_shader_parameter("col", Color("#ffb060"))
			c.draw_texture(_stage, o * 2.0)
		"cover":
			# (what is still asleep, in the dark)
			if awake <= 0 or awake > G:
				return
			_cover_mat.set_shader_parameter("awake", float(awake))
			_cover_mat.set_shader_parameter("night", NIGHT)
			c.draw_texture(_stage, o * 2.0)
		"dust":
			if awake <= 0:
				return
			for j in mini(awake, G):
				_dust(c, _wake(j), j, false, Color("#d0c0b0"), o)
		"far":
			# (the far fire takes: a burst of its light, then it breathes; the screen flashes the enemy's pink)
			var df := t - float(M["far"])
			if awake <= 0 or df < 0.0:
				return
			var big := df / 0.1 if df < 0.1 else pow(maxf(0.0, 1.0 - (df - 0.1) / 0.4), 2.0)
			var fx := o.x + float(D["fireAt"][0]) / 2.0
			var fy := o.y + float(D["fireAt"][1]) / 2.0
			if big > 0.02:
				var r := float(D["fireR"]) + 130.0 * big
				_burst(c, fx, fy, r, r * 0.9, PINK, 0.42 + 0.45 * big, 6, h)
				_burst(c, fx, fy, r * 0.36, r * 0.33, GOLD, 0.5 + 0.4 * big, 4, h)
			else:
				_glow(c, "glow|pink", fx, fy, 0.42 + 0.06 * sin(t * 3.1))
				_glow(c, "glow|gold", fx, fy, 0.5 + 0.08 * sin(t * 3.1 + 1.0))
			if df < 0.22:
				c.draw_rect(Rect2(Vector2.ZERO, c.size), Color(PINK, 0.26 * (1.0 - df / 0.22)))
		"over":
			c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
			if awake > 0:
				# (motes of the waypoint's light, rising off it)
				if awake > int(D["wayStage"]):
					var since := (t - _wake(int(D["wayStage"]))) / 1.9
					for i in 11:
						var age := fposmod(since + i * 0.137, 1.0)
						if since + i * 0.137 < 1.0 and age > since:
							continue
						var mx := float(D["wayAt"][0]) / 2.0 + (Ring.hash2(i, 5, 409) - 0.5) * 60.0 + sin(age * 6.0 + i) * 3.0
						var my := float(D["wayAt"][1]) / 2.0 - 3.0 - age * 14.0 + (Ring.hash2(i, 9, 409) - 0.5) * 60.0
						var s := 1.0 if i % 4 == 0 else 0.5
						c.draw_rect(Rect2(o.x + _rd(mx * 2.0) / 2.0, o.y + _rd(my * 2.0) / 2.0, s, s), Color(Color("#b8fff8") if i % 3 == 0 else Color("#22d0e0"), ceilf((1.0 - age) * 4.0) / 4.0))
				# (the stair's picture made quieter under the letters: the dark laid over its top in flat bands)
				var lin := float(L["lintel"])
				c.draw_rect(Rect2(0, 0, w, lin), Color(NIGHT, 0.5))
				for i in 8:
					c.draw_rect(Rect2(0, lin + i * 3.0, w, 3.0), Color(NIGHT, 0.5 * (1.0 - (i + 1.0) / 9.0)))
			# THE LETTERS: ENDLESS falls from above the screen and lands on the top of the shaft
			if t >= float(M["drop"]):
				var scale := int(L["scale"])
				var wy := float(L["wordY"])
				var u := _c01((t - float(M["drop"])) / (float(M["land"]) - float(M["drop"])))
				var fall := _rd((1.0 - u * u) * (wy + 7.0 * scale + 8.0))
				var dl := t - float(M["land"])
				var sink := _rd(3.0 * (1.0 - dl / 0.09)) if dl >= 0.0 and dl < 0.09 else 0.0
				if u < 1.0:
					# (smeared as it falls)
					for ba in [[0.3, 0.3], [0.55, 0.14]]:
						var ub: float = u - float(ba[0])
						if ub <= 0.0:
							continue
						_text(c, WORD, cx, wy - _rd((1.0 - ub * ub) * (wy + 7.0 * scale + 8.0)) + ky, Color(UNDER, float(ba[1])), {"align": "center", "scale": scale})
				_edged(c, WORD, cx, wy - fall + sink + ky, scale, Color.WHITE if dl >= 0.0 and dl < 0.08 else FACE, EDGE)
				if dl >= 0.0:
					# (the top of the shaft shakes its dust down)
					c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
					_dust(c, float(M["land"]), 0, true, Color("#d0c0b0"), o)
		"white":
			var dl := t - float(M["land"])
			if dl >= 0.0 and dl < 0.1:
				c.draw_rect(Rect2(Vector2.ZERO, c.size), Color(FACE, 0.22 * (1.0 - dl / 0.1)))
		"subs":
			# (THE WAY GOES ON comes up; HARDCORE strikes, gold for a blink, then the enemy's pink)
			if t < float(M["way"]):
				return
			c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
			var wa := PF.width(WAY)
			var wb := PF.width(HARD)
			var one: bool = L["oneLine"]
			var ax := cx - floorf((wa + SUB_GAP + wb) / 2.0) + floorf(wa / 2.0) if one else cx
			var bx := cx - floorf((wa + SUB_GAP + wb) / 2.0) + wa + SUB_GAP + floorf(wb / 2.0) if one else cx
			var al := ceilf(_c01((t - float(M["way"])) / 0.16) * 4.0) / 4.0
			var sy := float(L["subY"])
			_text(c, WAY, ax, sy + ky, Color(UNDER, al), {"align": "center", "shadow": Color(EDGE, al)})
			if t >= float(M["hard"]):
				_text(c, HARD, bx, sy + (0.0 if one else 9.0) + ky, GOLD if t - float(M["hard"]) < 0.09 else PINK, {"align": "center", "shadow": EDGE})


# --- THE CARD (ui/endless_fanfare.ts drawEndlessCard) ---

## Broken into lines no wider than `room` (the card's own wrap).
static func card_wrap(text: String, room: float) -> Array:
	var out: Array = []
	var line := ""
	for word in text.split(" "):
		var next := line + " " + word if line != "" else word
		if line != "" and PF.width(next) > room:
			out.append(line)
			line = word
		else:
			line = next
	if line != "":
		out.append(line)
	return out


func _rect(c: CanvasItem, x: float, y: float, w: float, h: float, col: Color) -> void:
	if w > 0.0 and h > 0.0:
		c.draw_rect(Rect2(x, y, w, h), col)


func _block(c: CanvasItem, x: float, y: float, w: float, h: float, col: Color) -> void:
	if w < 4.0 or h < 4.0:
		_rect(c, x, y, w, h, col)
		return
	_rect(c, x + 1, y, w - 2, h, col)
	_rect(c, x, y + 1, w, h - 2, col)
	_rect(c, x + 0.5, y + 0.5, w - 1, h - 1, col)


func _box(c: CanvasItem, x: float, y: float, w: float, h: float, fill: Color, edge: Color) -> void:
	_block(c, x, y, w, h, edge)
	if w < 4.0 or h < 4.0:
		_rect(c, x + 0.5, y + 0.5, w - 1, h - 1, fill)
		return
	_rect(c, x + 1, y + 0.5, w - 2, h - 1, fill)
	_rect(c, x + 0.5, y + 1, w - 1, h - 2, fill)


func _draw_card(c: CanvasItem) -> void:
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var W := _W()
	var Hh := _H()
	_rect(c, 0, 0, W, Hh, Color(P.get("black", Color.BLACK), 0.7))
	var w := minf(300.0, W - 24.0)
	var x := floorf((W - w) / 2.0)
	var lines: Array = []
	var rows := 0
	for l in D["card"]:
		var ws: Array = card_wrap(str(l), w - 24.0)
		lines.append(ws)
		rows += ws.size()
	var warn: Array = card_wrap(str(D["warn"]), w - 24.0)
	rows += warn.size()
	var h := minf(Hh - 16.0, 34.0 + rows * 9.0 + lines.size() * 3.0 + 34.0)
	var y := maxf(8.0, floorf((Hh - h) / 2.0))
	# (ui.ts panel: a deep blue block with a soft shadow under it and a line of light along its top)
	_block(c, x + 2, y + 2, w, h, Color(P.get("black", Color.BLACK), 0.55))
	_box(c, x, y, w, h, T["bg"], T["edge"])
	_rect(c, x + 2, y + 0.5, w - 4, 0.5, T["accentLo"])
	_text(c, "ENDLESS MODE", x + floorf(w / 2.0), y + 8.0, FACE, {"align": "center", "shadow": P.get("ink", Color("#120d18")), "scale": 2})
	var ly := y + 30.0
	for l in lines:
		for i in l.size():
			if i == 0:
				_rect(c, x + 12, ly + 3, 2, 2, UNDER)
			_text(c, str(l[i]), x + 18.0, ly, T["text"])
			ly += 9.0
		ly += 3.0
	for row in warn:
		_text(c, str(row), x + 18.0, ly, PINK)
		ly += 9.0
	# GO ON (ui.ts drawButton, the one to press: pink)
	var bw := 72.0
	_go = Rect2(x + floorf((w - bw) / 2.0), y + h - 24.0, bw, 16.0)
	var hot := _go.has_point(_pointer())
	_box(c, _go.position.x, _go.position.y, bw, 16.0, T["callHi"] if hot else T["call"], P.get("white", Color.WHITE) if hot else T["callHi"])
	_text(c, "GO ON", _go.position.x + floorf(bw / 2.0), _go.position.y + floorf((16.0 - 8.0) / 2.0) + 1.0, P.get("white", Color.WHITE), {"align": "center"})
