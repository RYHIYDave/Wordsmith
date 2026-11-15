## A PLACE'S LOOK AS THE GAME DRAWS IT, recorded from the game's own renderer and painters by tools/godot_looks.ts
## (assets/looks/<place>.json, <place>.png, <place>_pics.json): floor 1 as THE KING'S TOMB, the town as THE CASTLE'S HALL
## (the first five floors' new looks, game/floor_looks.ts, on as the game starts).
## Every item is a picture (or a run of them) with its anchor put on a screen point (game px, from world (0, 0):
## ((x - y) * 16, (x + y) * 8)), on one of these layers, in the renderer's order:
##   back       drawn before the floor (the hall's roof)
##   floor      the floor's tiles, their shades and edges, in the floor loop's order
##   flat, flat_add   what lies on the floor (stairs, the gate's beyond; daylight pools and sun, added)
##   stand, stand_add what stands among the figures, sorted by its depth `d` (walls, pieces, props, strips; shafts of
##                    daylight and sun in the air, added)
## A run of pictures plays at its fps from t0, or by each picture's own seconds (`secs`: the owl).
## THE DOORS (`doors`, one for each of the level's doors and gates, in its order): what moves of each as it opens, step by
## step from shut to open (a door's leaf, a gate's portcullis), each step [picture, x, y, depth] for each of its pictures;
## the items of a door's moving part (`door`: which) are left to it, and shown by `show_door` as doors.gd opens it.
## THE DARK (render.ts light): the place under its veil (how much, what colour); a HOLE cut in it for each of its lights
## (an ellipse 2r across and 1.24r high: render's `spot`), for each light a burning picture carries (`pic_lights`: a
## brazier, a torch), and round the hero (his pool, 165 or 170); then each GLOW added over it. Drawn here as one picture
## of the dark over the whole place, a quarter of a game pixel to its pixel, its holes cut once; the hero's carried with him.
extends Node2D

const DIR := "res://assets/looks/"
const HH := 16.0  # picture pixels in half a tile's height: a depth of d sorts at y = d * 16
const DARK_GRAIN := 4.0  # game pixels to a pixel of the dark's picture

var place := ""
var back_layer: Node2D
var floor_layer: Node2D
var flat_layer: Node2D
var stands  # stands.gd (y-sorted; it fades the walls round the hero)
var data: Dictionary = {}

var _sheet: Texture2D
var _pics := {}
var _anim: Array = []  # {node, frames, fps, t0, secs, dy}
var _t := 0.0
var _add: CanvasItemMaterial
var _dark: Sprite2D
var _hero: Node2D
var _doors: Array = []  # for each door: {steps, sprites, shown}
var _props := {}  # a chest's, barrel's or urn's place in the level's props -> {node, open, broken}


## Whether a place has a recorded look.
static func has_look(where: String) -> bool:
	return FileAccess.file_exists(DIR + where + ".json")


func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string(DIR + place + ".json"))
	_sheet = load(DIR + place + ".png")
	var pics: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + place + "_pics.json"))
	for k in pics:
		var p: Array = pics[k]
		_pics[k] = {"rect": Rect2(p[0], p[1], p[2], p[3]), "anchor": Vector2(p[4], p[5])}
	_add = CanvasItemMaterial.new()
	_add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	var still := {"back": [], "floor": [], "flat": []}
	var layers := {"back": back_layer, "floor": floor_layer, "flat": flat_layer, "flat_add": flat_layer}
	for it in data["items"]:
		var layer: String = it["layer"]
		var frames: Array = it["frames"]
		var at := Vector2(it["x"], it["y"]) * 2.0
		if frames.is_empty() or not _pics.has(frames[0]) or it.has("door"):
			continue
		if still.has(layer) and frames.size() == 1:
			still[layer].append([frames[0], at])
			continue
		var s := Sprite2D.new()
		s.texture = _sheet
		s.region_enabled = true
		s.centered = false
		_pic_on(s, frames[0])
		if layer.ends_with("_add"):
			s.material = _add
		if layers.has(layer):
			s.position = at
			layers[layer].add_child(s)
		else:
			var d: float = it["d"] if it["d"] != null else at.y / (2.0 * HH)
			s.position = Vector2(at.x, d * HH)
			s.offset.y += at.y - d * HH
			stands.add_child(s)
			if it.has("prop"):
				_props[int(it["prop"])] = {"node": s}
			if it.get("kind", "") == "wall":
				stands.add_wall(s, d, at)
		if frames.size() > 1:
			_anim.append({"node": s, "frames": frames, "fps": _num(it.get("fps"), 30.0), "t0": _num(it.get("t0"), 0.0),
				"secs": it.get("secs", null), "dy": s.offset.y + _pics[frames[0]]["anchor"].y})
	_make_doors()
	for p in data.get("props", []):
		var q: Dictionary = _props.get(int(p["i"]), {})
		q["open"] = p["open"]
		q["broken"] = p["broken"]
		_props[int(p["i"])] = q
	for layer in still:
		var drawer := _Still.new()
		drawer.look = self
		drawer.items = still[layer]
		layers[layer].add_child(drawer)
		layers[layer].move_child(drawer, 0)


## Each door's sprites, as many as the most pictures any step of it has, stood among the figures; shown at its first step.
func _make_doors() -> void:
	for d in data.get("doors", []):
		var steps: Array = d["steps"]
		var most := 0
		for st in steps:
			most = maxi(most, st.size())
		var sprites: Array = []
		for k in most:
			var s := Sprite2D.new()
			s.texture = _sheet
			s.region_enabled = true
			s.centered = false
			stands.add_child(s)
			sprites.append(s)
		_doors.append({"steps": steps, "sprites": sprites, "shown": -1})
		show_door(_doors.size() - 1, float(d.get("open", 0.0)) if d.has("open") else (1.0 if d["kind"] == "bossgate" else 0.0))


## Show door `i` so far open (0 shut, 1 open), at the nearest of its steps (render.ts: the leaf's turn in SWING_STEPS).
func show_door(i: int, open: float) -> void:
	if i < 0 or i >= _doors.size():
		return
	var D: Dictionary = _doors[i]
	var steps: Array = D["steps"]
	if steps.is_empty():
		return
	var k := clampi(roundi(open * (steps.size() - 1)), 0, steps.size() - 1)
	if k == D["shown"]:
		return
	D["shown"] = k
	var step: Array = steps[k]
	var sprites: Array = D["sprites"]
	for j in sprites.size():
		var s: Sprite2D = sprites[j]
		s.visible = j < step.size()
		if not s.visible:
			continue
		var p: Array = step[j]
		var at := Vector2(float(p[1]), float(p[2])) * 2.0
		var dd := float(p[3])
		_pic_on(s, p[0])
		s.position = Vector2(at.x, dd * HH)
		s.offset.y += at.y - dd * HH


## A chest opened: shown standing open (look's `props`).
func prop_opened(i: int) -> void:
	var q: Dictionary = _props.get(i, {})
	if not q.has("node") or q.get("open") == null:
		return
	var o: Array = q["open"]
	var s: Sprite2D = q["node"]
	var at := Vector2(float(o[1]), float(o[2])) * 2.0
	var dd := float(o[3])
	_pic_on(s, o[0])
	s.position = Vector2(at.x, dd * HH)
	s.offset.y += at.y - dd * HH


## A barrel or an urn broken: gone from where it stood, its leavings lying on the floor.
func prop_broken(i: int) -> void:
	var q: Dictionary = _props.get(i, {})
	if q.has("node"):
		q["node"].visible = false
	if q.get("broken") == null:
		return
	var b: Array = q["broken"]
	var s := Sprite2D.new()
	s.texture = _sheet
	s.region_enabled = true
	s.centered = false
	_pic_on(s, b[0])
	s.position = Vector2(float(b[1]), float(b[2])) * 2.0
	flat_layer.add_child(s)


func _pic_on(s: Sprite2D, key: String) -> void:
	var p: Dictionary = _pics[key]
	s.region_rect = p["rect"]
	s.offset = -p["anchor"]


func _process(dt: float) -> void:
	_t += dt
	for a in _anim:
		var frames: Array = a["frames"]
		var i := 0
		var u: float = _t - a["t0"]
		if a["secs"] != null:
			var secs: Array = a["secs"]
			var total := 0.0
			for s in secs:
				total += float(s)
			u = fposmod(u, total)
			while i < secs.size() - 1 and u >= float(secs[i]):
				u -= float(secs[i])
				i += 1
		else:
			i = posmod(int(floorf(u * a["fps"])), frames.size())
		var p: Dictionary = _pics[frames[i]]
		a["node"].region_rect = p["rect"]
		a["node"].offset = Vector2(-p["anchor"].x, a["dy"] - p["anchor"].y)
	if _dark != null and _hero != null:
		_dark.material.set_shader_parameter("hero", _hero.position)


func draw_still(c: CanvasItem, items: Array) -> void:
	for it in items:
		var p: Dictionary = _pics[it[0]]
		var r: Rect2 = p["rect"]
		c.draw_texture_rect_region(_sheet, Rect2(it[1] - p["anchor"], r.size), r)


# --- the dark and its lights ---

const DARK_SHADER := """
shader_type canvas_item;
uniform vec2 origin;
uniform vec2 extent;
uniform vec2 hero;
uniform float pool;
void fragment() {
	vec2 world = origin + UV * extent;
	vec2 d = (world - hero) / vec2(pool, pool * 0.62);
	float k = clamp(length(d), 0.0, 1.0);
	float cut = 1.0 - smoothstep(0.35, 1.0, k);
	vec4 c = texture(TEXTURE, UV);
	COLOR = vec4(c.rgb, c.a * (1.0 - cut));
}
"""


## Put the place's dark over it: its veil with every light's hole cut, the hero's pool cut round him as he goes, the glows
## added over it. `hero_pool`: the hero's pool's radius, game px (render.ts: 165 in the dungeon, 170 in town).
func lighting(root: Node2D, hero: Node2D, hero_pool: float) -> Node:
	var dk: Dictionary = data.get("dark", {"a": 0.0, "rgb": [0, 0, 0]})
	var a: float = dk["a"]
	if a <= 0.0:
		return null
	var rgb: Array = dk["rgb"]
	var col := Color(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0)
	# (every light there is: the look's own, and those the burning pictures carry where they stand)
	var holes: Array = []
	var glows: Array = []
	for l in data.get("lights", []):
		if l.get("of", "") == "ring":
			continue
		(holes if l["type"] == "hole" else glows).append([Vector2(l["x"], l["y"]), float(l["r"]), float(l["a"]), l.get("color")])
	var carried: Dictionary = data.get("pic_lights", {})
	for it in data["items"]:
		var f: Array = it["frames"]
		if f.is_empty() or not carried.has(f[0]):
			continue
		for pl in carried[f[0]]:
			var at := Vector2(float(it["x"]) + float(pl[0]), float(it["y"]) + float(pl[1]))
			holes.append([at, float(pl[2]) * 2.0, float(pl[3]), null])
			glows.append([at, float(pl[2]), float(pl[3]), pl[4]])
	# (the dark's picture: over the whole place and a margin, a quarter of a game pixel to its pixel)
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for it in data["items"]:
		var p := Vector2(it["x"], it["y"])
		lo = lo.min(p)
		hi = hi.max(p)
	lo -= Vector2(400, 600)
	hi += Vector2(400, 300)
	var w := int(ceil((hi.x - lo.x) / DARK_GRAIN))
	var h := int(ceil((hi.y - lo.y) / DARK_GRAIN))
	var alpha := PackedFloat32Array()
	alpha.resize(w * h)
	alpha.fill(1.0)
	for hole in holes:
		var c: Vector2 = (hole[0] - lo) / DARK_GRAIN
		var rx: float = hole[1] / DARK_GRAIN
		var ry: float = hole[1] * 0.62 / DARK_GRAIN
		var strength: float = clampf(hole[2], 0.0, 1.0)
		for y in range(maxi(0, floori(c.y - ry)), mini(h, ceili(c.y + ry) + 1)):
			for x in range(maxi(0, floori(c.x - rx)), mini(w, ceili(c.x + rx) + 1)):
				var dx := (x - c.x) / rx
				var dy := (y - c.y) / ry
				var k := sqrt(dx * dx + dy * dy)
				if k >= 1.0:
					continue
				alpha[y * w + x] *= 1.0 - strength * (1.0 - smoothstep(0.3, 1.0, k))
	var bytes := PackedByteArray()
	bytes.resize(w * h * 4)
	var r8 := int(col.r * 255.0)
	var g8 := int(col.g * 255.0)
	var b8 := int(col.b * 255.0)
	for i in w * h:
		bytes[i * 4] = r8
		bytes[i * 4 + 1] = g8
		bytes[i * 4 + 2] = b8
		bytes[i * 4 + 3] = int(clampf(a * alpha[i], 0.0, 1.0) * 255.0)
	var img := Image.create_from_data(w, h, false, Image.FORMAT_RGBA8, bytes)
	_dark = Sprite2D.new()
	_dark.texture = ImageTexture.create_from_image(img)
	_dark.centered = false
	_dark.position = lo * 2.0
	_dark.scale = Vector2.ONE * DARK_GRAIN * 2.0
	_dark.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_dark.z_index = 50
	var mat := ShaderMaterial.new()
	mat.shader = Shader.new()
	mat.shader.code = DARK_SHADER
	mat.set_shader_parameter("origin", lo * 2.0)
	mat.set_shader_parameter("extent", Vector2(w, h) * DARK_GRAIN * 2.0)
	mat.set_shader_parameter("pool", hero_pool * 2.0)
	_dark.material = mat
	root.add_child(_dark)
	_hero = hero
	# the glows, added over the dark
	var tex := _glow_texture()
	for g in glows:
		var s := Sprite2D.new()
		s.texture = tex
		s.material = _add
		s.position = g[0] * 2.0
		s.scale = Vector2(1.0, 0.62) * (g[1] * 2.0 * 2.0 / 128.0)
		s.modulate = Color(g[3]) if g[3] != null else Color(1, 1, 1)
		s.modulate.a = clampf(g[2], 0.0, 1.0)
		s.z_index = 51
		root.add_child(s)
	return null


func _glow_texture() -> GradientTexture2D:
	var g := Gradient.new()
	g.set_color(0, Color(1, 1, 1, 1))
	g.set_color(1, Color(1, 1, 1, 0))
	var t := GradientTexture2D.new()
	t.gradient = g
	t.fill = GradientTexture2D.FILL_RADIAL
	t.fill_from = Vector2(0.5, 0.5)
	t.fill_to = Vector2(1.0, 0.5)
	t.width = 128
	t.height = 128
	return t


## What is still on a layer, drawn in one go in the renderer's order (a floor of thousands of tiles is one draw list).
class _Still extends Node2D:
	var look
	var items: Array = []

	func _draw() -> void:
		look.draw_still(self, items)


static func _num(v, otherwise: float) -> float:
	return otherwise if v == null else float(v)
