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
## FLOOR 2, THE PRISON'S GROUNDS AT NIGHT (`zones`): the dark and the vignette go by where the hero is (under the open sky the
## yard's, indoors in the gaoler's room the Crypt's); in a courtyard the night sky and the tower are behind what lies past its
## two far walls, and the dark over those walls is taken down by the sky's own light (render/grounds.ts skyOver, drawSky,
## skyLift); in the Headsman's yard its own sky, and what lies beyond its walls (the items marked `yh`) is not drawn
## (render/yard.ts). The yard's scaffold and gallows (`see`) are seen through while he is behind them.
## THE WAYPOINT (`waypoint`): its dais asleep, or awake with the motes rising over it (wake_waypoint).
##
## TWO WAYS A LOOK IS WRITTEN DOWN. The first two places (tools/godot_looks.ts, by a copy of the renderer's rules) are as
## above. Every other place is RECORDED FROM THE GAME ITSELF as it draws it (tools/godot_record.mjs: "format": 2, its head
## says what is in it): the ground's pictures in the renderer's own order (still ones drawn in one go, runs of pictures each
## a sprite), what stands (walls marked that fade between the eye and the hero), the holes in the dark and the glows over
## it. Laid out by `_ready2` and `_lighting2`, below.
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
## (a recorded look: its sheets, and which each picture is on)
var _sheets: Array[Texture2D] = []
var _format := 1
## (a recorded look's things, by their places in its lists: the ground's (the drawer or the sprite each is in, and where in
## the drawer), what stands; and its states as they are shown now)
var _g_node: Array = []
var _g_at := PackedInt32Array()
var _s_node: Array = []
var _shown := {}
var _hidden := {}
## (what is seen when: the look's things by the tile each waits on, tools/godot_record.mjs `fog`; its glows, as they are in
## the look's list)
var _fog_g := {}
var _fog_s := {}
var _fog_glow := {}
var _glow_nodes: Array = []
var _fogged := false
var _pics := {}
var _anim: Array = []  # {node, frames, fps, t0, secs, dy}
var _t := 0.0
var _add: CanvasItemMaterial
var _dark: Sprite2D
var _hero: Node2D
var _doors: Array = []  # for each door: {steps, sprites, shown}
var _props := {}  # a chest's, barrel's or urn's place in the level's props -> {node, open, broken}
var _under := {}  # a place the stairwell may open -> the sprites of what lies there (gone down it as it opens)
# (floor 2's zones: what is not drawn from in the Headsman's yard; the skies; the big pieces seen through; where he is now)
var _yh_nodes: Array = []
var _skies: Array = []  # a Node2D for each of zones.skies, then the yard's
var _see := {}  # a big piece's name -> its strips [{node, d, rect}]
var _zone := {"yard": false, "indoors": false, "sky": -1}
var _zone_set := false
## The vignette where the hero is (main.gd lays it over the screen).
var vignette_now := -1.0
var _way_node: Sprite2D
var _motes: Sprite2D
var _way_awake := false
var _warp_node: Sprite2D
var _warp_t := -1.0


## Whether a place has a recorded look.
static func has_look(where: String) -> bool:
	return FileAccess.file_exists(DIR + where + ".json")


func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string(DIR + place + ".json"))
	_format = int(data.get("format", 1))
	_add = CanvasItemMaterial.new()
	_add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	var pics: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + place + "_pics.json"))
	if _format == 2:
		for name in data["sheets"]:
			_sheets.append(load(DIR + name))
		_sheet = _sheets[0]
		for k in pics:
			var p: Array = pics[k]
			_pics[k] = {"rect": Rect2(p[0], p[1], p[2], p[3]), "anchor": Vector2(p[4], p[5]), "sheet": _sheets[int(p[6])]}
		_ready2()
		return
	_sheet = load(DIR + place + ".png")
	for k in pics:
		var p: Array = pics[k]
		_pics[k] = {"rect": Rect2(p[0], p[1], p[2], p[3]), "anchor": Vector2(p[4], p[5])}
	var still := {"back": [], "floor": [], "flat": []}
	var still_yh := {"back": [], "floor": [], "flat": []}
	var layers := {"back": back_layer, "floor": floor_layer, "flat": flat_layer, "flat_add": flat_layer}
	for it in data["items"]:
		var layer: String = it["layer"]
		var frames: Array = it["frames"]
		var at := Vector2(it["x"], it["y"]) * 2.0
		if frames.is_empty() or not _pics.has(frames[0]) or it.has("door"):
			continue
		# (the fallen wordsmith is loot.gd's own: searched, or not there at all once his stone is found)
		if it.get("what", "") == "the fallen wordsmith":
			continue
		if still.has(layer) and frames.size() == 1 and not it.has("stair") and not it.has("waypoint"):
			(still_yh if it.has("yh") else still)[layer].append([frames[0], at])
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
		if it.has("stair"):
			var k := int(it["stair"])
			if not _under.has(k):
				_under[k] = []
			_under[k].append(s)
		if it.has("yh"):
			_yh_nodes.append(s)
		if it.has("waypoint"):
			_way_node = s
		if it.has("see"):
			var name: String = it["see"]
			if not _see.has(name):
				_see[name] = []
			var p: Dictionary = _pics[frames[0]]
			_see[name].append({"node": s, "d": float(it["d"]), "rect": Rect2(at - p["anchor"], p["rect"].size)})
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
		for yh in [false, true]:
			var list: Array = still_yh[layer] if yh else still[layer]
			if yh and list.is_empty():
				continue
			var drawer := _Still.new()
			drawer.look = self
			drawer.items = list
			layers[layer].add_child(drawer)
			layers[layer].move_child(drawer, 1 if yh else 0)
			if yh:
				_yh_nodes.append(drawer)
	_make_skies()
	if data.has("waypoint") and _way_node != null:
		var w: Dictionary = data["waypoint"]
		_motes = Sprite2D.new()
		_motes.texture = _sheet
		_motes.region_enabled = true
		_motes.centered = false
		_motes.visible = false
		var wat := Vector2(float(w["x"]), float(w["y"])) * 2.0
		var wd := float(w["d"])
		_pic_on(_motes, w["motes"][0])
		_motes.position = Vector2(wat.x, wd * HH)
		_motes.offset.y += wat.y - wd * HH
		stands.add_child(_motes)
		_anim.append({"node": _motes, "frames": w["motes"], "fps": float(w["fps"]), "t0": 0.0, "secs": null, "dy": _motes.offset.y + _pics[w["motes"][0]]["anchor"].y})
		# (a warp's column of light, stood a little in front of him on the dais: render.ts standWays)
		_warp_node = Sprite2D.new()
		_warp_node.texture = _sheet
		_warp_node.region_enabled = true
		_warp_node.centered = false
		_warp_node.visible = false
		_warp_node.position = Vector2(wat.x, (wd + 0.05) * HH)
		stands.add_child(_warp_node)


## THE WAYPOINT WAKES (game.ts: as he first comes near it): its dais awake, its loop at 10 a second, the motes rising over it.
func wake_waypoint() -> void:
	if _way_awake or _way_node == null or not data.has("waypoint"):
		return
	_way_awake = true
	var w: Dictionary = data["waypoint"]
	_anim.append({"node": _way_node, "frames": w["awake"], "fps": float(w["fps"]), "t0": 0.0, "secs": null, "dy": _way_node.offset.y + _pics[w["awake"][0]]["anchor"].y})
	_motes.visible = true


## A WARP on the waypoint (render.ts standWays): the column of light, its frames at 20 a second from `from` seconds in (0 as he
## goes; 0.25 as he comes out of it, its second half), in place of the motes while it plays.
func play_warp(from: float) -> void:
	if _warp_node == null:
		return
	_warp_t = from
	_step_warp(0.0)


func _step_warp(dt: float) -> void:
	if _warp_t < 0.0 or _warp_node == null:
		return
	_warp_t += dt
	var frames: Array = data["waypoint"]["warp"]
	var f := int(floor(_warp_t * 20.0))
	if f >= frames.size():
		_warp_t = -1.0
		_warp_node.visible = false
		_motes.visible = _way_awake
		return
	_motes.visible = false
	_warp_node.visible = true
	var w: Dictionary = data["waypoint"]
	var wat := Vector2(float(w["x"]), float(w["y"])) * 2.0
	_pic_on(_warp_node, frames[f])
	_warp_node.offset.y += wat.y - (float(w["d"]) + 0.05) * HH


## The skies of floor 2 (`zones`): for each courtyard, then the yard, its pictures under a clip of the region above the line of its
## far walls (render/grounds.ts drawSky, render/yard.ts back), behind everything; shown only while the hero is under it.
func _make_skies() -> void:
	var Z = data.get("zones")
	if Z == null:
		return
	var all: Array = Z["skies"].duplicate()
	if Z["yard"] != null:
		all.append(Z["yard"])
	for sk in all:
		var line: Array = sk["line"]
		var l0 := Vector2(line[0][0], line[0][1]) * 2.0
		var l1 := Vector2(line[1][0], line[1][1]) * 2.0
		var l2 := Vector2(line[2][0], line[2][1]) * 2.0
		var clip := Polygon2D.new()
		clip.polygon = PackedVector2Array([l0, l1, l2, Vector2(l2.x, l1.y - 6000.0), Vector2(l0.x, l1.y - 6000.0)])
		clip.clip_children = CanvasItem.CLIP_CHILDREN_ONLY
		clip.visible = false
		for p in sk["pics"]:
			var s := Sprite2D.new()
			s.texture = _sheet
			s.region_enabled = true
			s.centered = false
			_pic_on(s, p[0])
			s.position = Vector2(float(p[1]), float(p[2])) * 2.0
			clip.add_child(s)
		back_layer.add_child(clip)
		_skies.append(clip)


## Where the hero is, for floor 2's zones (render/grounds.ts skyOver; render/yard.ts heroIn): in the yard; else indoors; else the
## courtyard he is in, or the last he was in while he is in the ways on its near side.
func _step_zone(at: Vector2) -> void:
	var Z: Dictionary = data["zones"]
	var Y = Z["yard"]
	var was: Dictionary = _zone.duplicate()
	var in_yard := false
	if Y != null:
		var r: Dictionary = Y["in"]
		in_yard = at.x >= float(r["x0"]) and at.x < float(r["x1"]) and at.y >= float(r["y0"]) and at.y < float(r["y1"])
	var x := floori(at.x)
	var y := floori(at.y)
	var indoors := false
	if not in_yard:
		for r in Z["indoors"]["rects"]:
			if x >= int(r["x"]) and x < int(r["x"]) + int(r["w"]) and y >= int(r["y"]) and y < int(r["y"]) + int(r["h"]):
				indoors = true
	var sky: int = _zone["sky"]
	if in_yard or indoors:
		sky = -1
	else:
		var here := -1
		var skies: Array = Z["skies"]
		for k in skies.size():
			var r: Dictionary = skies[k]["rect"]
			if x >= int(r["x"]) and x < int(r["x"]) + int(r["w"]) and y >= int(r["y"]) and y < int(r["y"]) + int(r["h"]):
				here = k
				break
		if here >= 0:
			sky = here
		elif sky >= 0:
			var r: Dictionary = skies[sky]["rect"]
			var T := int(Z["through"])
			var near := x >= int(r["x"]) - T and x < int(r["x"]) + int(r["w"]) + T and y >= int(r["y"]) - T and y < int(r["y"]) + int(r["h"]) + T
			if not near or _behind_of(r, x, y):
				sky = -1
	_zone = {"yard": in_yard, "indoors": indoors, "sky": sky}
	var first := not _zone_set
	if not first and _zone == was:
		return
	_zone_set = true
	# (what lies beyond the yard's walls, not drawn from in it)
	if first or was["yard"] != in_yard:
		for n in _yh_nodes:
			if is_instance_valid(n):
				n.visible = not in_yard
	for k in _skies.size():
		_skies[k].visible = (k == sky) if k < Z["skies"].size() else in_yard
	# (the dark, its sky's light, and the vignette)
	var dark: float = float(Z["yard"]["dark"]) if in_yard else float(Z["indoors"]["dark"]) if indoors else float(Z["out"]["dark"])
	vignette_now = float(Z["yard"]["vignette"]) if in_yard else float(Z["indoors"]["vignette"]) if indoors else float(Z["out"]["vignette"])
	if _dark != null:
		var m: ShaderMaterial = _dark.material
		m.set_shader_parameter("dark_a", dark)
		var lifted = Z["yard"] if in_yard else (Z["skies"][sky] if sky >= 0 else null)
		if lifted == null:
			m.set_shader_parameter("lift", 0.0)
		else:
			var line: Array = lifted["line"]
			var up := float(lifted["up"])
			m.set_shader_parameter("lift", float(lifted["lift"]))
			m.set_shader_parameter("l0", Vector2(line[0][0], float(line[0][1]) - up) * 2.0)
			m.set_shader_parameter("l1", Vector2(line[1][0], float(line[1][1]) - up) * 2.0)
			m.set_shader_parameter("l2", Vector2(line[2][0], float(line[2][1]) - up) * 2.0)


## render/grounds.ts behindOf: does tile (tx, ty) lie behind courtyard `r`'s far walls on the screen?
static func _behind_of(r: Dictionary, tx: int, ty: int) -> bool:
	var x0 := int(r["x"])
	var y0 := int(r["y"])
	var x1 := int(r["x"]) + int(r["w"]) - 1
	var u := tx - ty
	return (tx < x0 - 1 and u >= x0 - (int(r["y"]) + int(r["h"]) - 1) - 1 and u <= x0 - y0) or (ty < y0 - 1 and u >= x0 - y0 and u <= x1 - y0 + 1)


## The yard's scaffold and gallows seen through (render.ts SEEN_THROUGH, 0.38) while the hero is behind one and it covers his
## middle, his head or his feet.
func _see_through(at: Vector2) -> void:
	var hd := at.x + at.y
	var feet := Vector2((at.x - at.y) * 16.0, (at.x + at.y) * 8.0) * 2.0
	for name in _see:
		var covers := false
		for st in _see[name]:
			if hd < float(st["d"]):
				var r: Rect2 = st["rect"]
				for up in [3.0, 14.0, 28.0]:
					if r.has_point(feet - Vector2(0, up * 2.0)):
						covers = true
		for st in _see[name]:
			st["node"].modulate.a = 0.38 if covers else 1.0

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
	if _format == 2:
		show_variant("door%d" % i, open)
		return
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
	if _format == 2:
		show_variant("prop%d" % i, 1.0)
		return
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
	if _format == 2:
		show_variant("prop%d" % i, 1.0)
		return
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


## The stairwell opened at its place `k`: what lay there gone down it (game.ts openStair).
func stair_opened(k: int) -> void:
	for s in _under.get(k, []):
		if is_instance_valid(s):
			s.visible = false


func _pic_on(s: Sprite2D, key: String) -> void:
	var p: Dictionary = _pics[key]
	if p.has("sheet"):
		s.texture = p["sheet"]
	s.region_rect = p["rect"]
	s.offset = -p["anchor"]


func _process(dt: float) -> void:
	_t += dt
	if _format == 2:
		_run2()
		if _dark != null and _hero != null:
			_dark.material.set_shader_parameter("hero", _hero.position)
		return
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
	_step_warp(dt)
	if _hero != null and data.has("zones"):
		_step_zone(_hero.world)
		if _zone["yard"] and not _see.is_empty():
			_see_through(_hero.world)


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
uniform float dark_a = 0.8;
uniform float lift = 0.0;
uniform vec2 l0;
uniform vec2 l1;
uniform vec2 l2;
void fragment() {
	vec2 world = origin + UV * extent;
	vec2 d = (world - hero) / vec2(pool, pool * 0.62);
	float k = clamp(length(d), 0.0, 1.0);
	float cut = 1.0 - smoothstep(0.35, 1.0, k);
	vec4 c = texture(TEXTURE, UV);
	float a = c.a * dark_a * (1.0 - cut);
	// (floor 2: the sky's own light over a courtyard's far walls, above the line `up` over them)
	if (lift > 0.0 && world.x >= l0.x && world.x <= l2.x) {
		float ly = world.x <= l1.x ? mix(l0.y, l1.y, (world.x - l0.x) / max(1.0, l1.x - l0.x)) : mix(l1.y, l2.y, (world.x - l1.x) / max(1.0, l2.x - l1.x));
		if (world.y <= ly) {
			a *= 1.0 - lift;
		}
	}
	COLOR = vec4(c.rgb, a);
}
"""


## Put the place's dark over it: its veil with every light's hole cut, the hero's pool cut round him as he goes, the glows
## added over it. `hero_pool`: the hero's pool's radius, game px (render.ts: 165 in the dungeon, 170 in town).
func lighting(root: Node2D, hero: Node2D, hero_pool: float) -> Node:
	if _format == 2:
		return _lighting2(root, hero, hero_pool)
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
		bytes[i * 4 + 3] = int(clampf(alpha[i], 0.0, 1.0) * 255.0)
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
	mat.set_shader_parameter("dark_a", a)
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


# --- a look recorded from the game itself (tools/godot_record.mjs, "format": 2) ---

## Lay the recorded place out: the ground's runs in the renderer's order on the floor's layer (a stretch of still pictures is
## one drawer; a run of pictures is a sprite of its own, in its place among them), then what stands, by depth.
func _ready2() -> void:
	# (where a state draws something on the ground after one of the ground's things, the drawers part there, so that it can
	# be put in its place)
	var split := {}
	for name in data.get("variants", {}):
		for f in data["variants"][name]["frames"]:
			for e in f["g"]:
				split[int(e[7])] = true
	var gi := 0
	for run in data["ground"]:
		var added: bool = int(run["op"]) == 1
		var pending: Array = []
		var first := gi
		for e in run["list"]:
			if e is Array:
				var key: String = str(e[0])
				var size := Vector2.ZERO
				var alpha := 1.0
				if e.size() >= 6:
					size = Vector2(e[4], e[5]) * 2.0
				if e.size() >= 4:
					alpha = float(e[3])
				if pending.is_empty():
					first = gi
				pending.append([key if _pics.has(key) else "", Vector2(e[1], e[2]) * 2.0, alpha, size])
				if split.has(gi) or pending.size() >= 400:
					_flush2(pending, added, first)
					pending = []
				gi += 1
				continue
			_flush2(pending, added, first)
			pending = []
			var s := _sprite2(e, added)
			if s != null:
				s.position = Vector2(e["x"], e["y"]) * 2.0
				floor_layer.add_child(s)
			_g_node.append(s)
			_g_at.append(-1)
			gi += 1
		_flush2(pending, added, first)
	for it in data["items"]:
		var s := _sprite2(it, int(it.get("add", 0)) == 1)
		_s_node.append(s)
		if s == null:
			continue
		var at := Vector2(it["x"], it["y"]) * 2.0
		var d: float = it["d"]
		s.position = Vector2(at.x, d * HH)
		s.set_meta("dy", at.y - d * HH)
		_place2(s, _first2(it["f"]))
		stands.add_child(s)
		if it.has("prop"):
			_props[int(it["prop"])] = {"node": s}
		if it.has("wall"):
			var w: Array = it["wall"]
			stands.add_wall(s, float(w[2]), Vector2(w[0], w[1]) * 2.0, int(w[3]) if w.size() > 3 else -1)
	_fog_begin()


## WHAT IS SEEN WHEN (the look's `fog`): every thing that waits on a tile is not drawn until that tile has been seen
## (sight.gd calls `reveal` with the tiles newly seen).
func _fog_begin() -> void:
	var F: Dictionary = data.get("fog", {})
	if F.is_empty():
		return
	_fogged = true
	var g: Array = F["g"]
	for gi in mini(g.size(), _g_node.size()):
		var t := int(g[gi])
		if t < 0 or _g_node[gi] == null:
			continue
		if not _fog_g.has(t):
			_fog_g[t] = PackedInt32Array()
		_fog_g[t].append(gi)
		if _g_at[gi] < 0:
			_g_node[gi].set_meta("fog", true)
			_g_node[gi].visible = false
		else:
			_g_node[gi].fog[_g_at[gi]] = 1
	var st: Array = F["s"]
	for si in mini(st.size(), _s_node.size()):
		var t := int(st[si])
		if t < 0 or _s_node[si] == null:
			continue
		if not _fog_s.has(t):
			_fog_s[t] = PackedInt32Array()
		_fog_s[t].append(si)
		_s_node[si].set_meta("fog", true)
		_s_node[si].visible = false


## These tiles have been seen: what waited on them is drawn.
func reveal(tiles: PackedInt32Array) -> void:
	if not _fogged:
		return
	var redraw := {}
	for t in tiles:
		if _fog_g.has(t):
			for gi in _fog_g[t]:
				var node = _g_node[gi]
				if _g_at[gi] < 0:
					node.set_meta("fog", false)
					node.visible = not node.get_meta("hid", false) and not node.get_meta("blank", false)
				else:
					node.fog[_g_at[gi]] = 0
					redraw[node] = true
			_fog_g.erase(t)
		if _fog_s.has(t):
			for si in _fog_s[t]:
				var node: Node2D = _s_node[si]
				node.set_meta("fog", false)
				node.visible = not node.get_meta("hid", false) and not node.get_meta("blank", false)
			_fog_s.erase(t)
		if _fog_glow.has(t):
			for n in _fog_glow[t]:
				n.visible = true
			_fog_glow.erase(t)
	for node in redraw:
		node.queue_redraw()


func reveal_all() -> void:
	var tiles := PackedInt32Array()
	for t in _fog_g:
		tiles.append(t)
	for t in _fog_s:
		if not _fog_g.has(t):
			tiles.append(t)
	for t in _fog_glow:
		if not _fog_g.has(t) and not _fog_s.has(t):
			tiles.append(t)
	reveal(tiles)


## A stretch of still pictures of the ground, as one drawer.
func _flush2(items: Array, added: bool, _first := 0) -> void:
	if items.is_empty():
		return
	var drawer := _Still2.new()
	drawer.look = self
	drawer.items = items
	drawer.gone.resize(items.size())
	drawer.fog.resize(items.size())
	if added:
		drawer.material = _add
	floor_layer.add_child(drawer)
	for i in items.size():
		_g_node.append(drawer)
		_g_at.append(i)


func draw_still2(c: CanvasItem, items: Array, gone: PackedByteArray, fog: PackedByteArray) -> void:
	for i in items.size():
		var it: Array = items[i]
		if it[0] == "" or gone[i] != 0 or fog[i] != 0:
			continue
		var p: Dictionary = _pics[it[0]]
		var r: Rect2 = p["rect"]
		var size: Vector2 = it[3] if it[3] != Vector2.ZERO else r.size
		c.draw_texture_rect_region(p["sheet"], Rect2(it[1], size), r, Color(1, 1, 1, it[2]))


## The first of a run's pictures that is one.
func _first2(frames: Array) -> String:
	for f in frames:
		if str(f) != "" and _pics.has(str(f)):
			return str(f)
	return ""


## A sprite for one recorded thing ({f, fps, a, w, h}): its picture, how solid, its size if it is drawn at another than its
## own; one with a run of pictures goes on the list of those that play.
func _sprite2(e: Dictionary, added: bool) -> Sprite2D:
	var frames: Array = e["f"]
	var key := _first2(frames)
	if key == "":
		return null
	var s := Sprite2D.new()
	s.region_enabled = true
	s.centered = false
	if added:
		s.material = _add
	s.modulate.a = float(e.get("a", 1.0))
	if e.has("w"):
		s.set_meta("size", Vector2(e["w"], e["h"]) * 2.0)
	s.set_meta("dy", 0.0)
	_place2(s, key)
	if frames.size() > 1:
		_anim.append({"node": s, "frames": frames, "fps": float(e.get("fps", 30.0)), "shown": key})
	return s


## Put a picture on a recorded thing's sprite: by its anchor, lifted to its depth's line (`dy`), stretched if it is drawn
## at a size not its own.
func _place2(s: Sprite2D, key: String) -> void:
	var p: Dictionary = _pics[key]
	s.texture = p["sheet"]
	s.region_rect = p["rect"]
	var r: Rect2 = p["rect"]
	if s.has_meta("size"):
		var size: Vector2 = s.get_meta("size")
		s.scale = Vector2(size.x / r.size.x, size.y / r.size.y)
		s.offset = Vector2(-p["anchor"].x, (float(s.get_meta("dy")) - p["anchor"].y) / maxf(s.scale.y, 0.0001))
	else:
		s.offset = Vector2(-p["anchor"].x, float(s.get_meta("dy")) - p["anchor"].y)


## The runs of pictures, each at its own pace (frame floor(t * fps) mod n; "" shows nothing).
func _run2() -> void:
	for a in _anim:
		var frames: Array = a["frames"]
		var key := str(frames[posmod(int(floorf(_t * a["fps"])), frames.size())])
		if key == a["shown"]:
			continue
		a["shown"] = key
		var s: Sprite2D = a["node"]
		if key == "" or not _pics.has(key):
			s.set_meta("blank", true)
			s.visible = false
			continue
		s.set_meta("blank", false)
		s.visible = not s.get_meta("hid", false) and not s.get_meta("fog", false)
		_place2(s, key)


## The recorded dark: its veil with every hole cut (each an ellipse r by ry, its own strength), the hero's pool cut round him
## as he goes (the shader), and the glows, the game's own pictures of them, added over it.
func _lighting2(root: Node2D, hero: Node2D, hero_pool: float) -> Node:
	var dk: Dictionary = data.get("dark", {"a": 0.0, "rgb": [0, 0, 0]})
	var a: float = dk["a"]
	var glows_root := Node2D.new()
	glows_root.z_index = 51
	root.add_child(glows_root)
	for g in data.get("glows", []):
		var key := str(g[0])
		if not _pics.has(key):
			continue
		var p: Dictionary = _pics[key]
		var s := Sprite2D.new()
		s.texture = p["sheet"]
		s.region_enabled = true
		s.region_rect = p["rect"]
		s.material = _add
		s.position = Vector2(g[1], g[2]) * 2.0
		s.scale = Vector2(float(g[3]) * 2.0 / p["rect"].size.x, float(g[4]) * 2.0 / p["rect"].size.y)
		s.modulate.a = clampf(float(g[5]), 0.0, 1.0)
		s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		glows_root.add_child(s)
		_glow_nodes.append(s)
	if _fogged:
		var gl: Array = data["fog"].get("glows", [])
		var k := 0
		for g in data.get("glows", []):
			if not _pics.has(str(g[0])):
				continue
			var t := int(gl[k]) if k < gl.size() else -1
			if t >= 0 and k < _glow_nodes.size():
				if not _fog_glow.has(t):
					_fog_glow[t] = []
				_fog_glow[t].append(_glow_nodes[k])
				_glow_nodes[k].visible = false
			k += 1
	if a <= 0.0:
		return glows_root
	var rgb: Array = dk["rgb"]
	var col := Color(rgb[0] / 255.0, rgb[1] / 255.0, rgb[2] / 255.0)
	# (the dark's picture: over the whole place and a margin, a quarter of a game pixel to its pixel)
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for it in data["items"]:
		var q := Vector2(it["x"], it["y"])
		lo = lo.min(q)
		hi = hi.max(q)
	if lo.x == INF:
		lo = Vector2.ZERO
		hi = Vector2.ZERO
	lo -= Vector2(400, 600)
	hi += Vector2(400, 300)
	var w := int(ceil((hi.x - lo.x) / DARK_GRAIN))
	var h := int(ceil((hi.y - lo.y) / DARK_GRAIN))
	var alpha := PackedFloat32Array()
	alpha.resize(w * h)
	alpha.fill(1.0)
	for hole in data.get("holes", []):
		var c: Vector2 = (Vector2(hole[0], hole[1]) - lo) / DARK_GRAIN
		var rx: float = float(hole[2]) / DARK_GRAIN
		var ry: float = float(hole[3]) / DARK_GRAIN
		var strength: float = clampf(float(hole[4]), 0.0, 1.0)
		if rx <= 0.0 or ry <= 0.0:
			continue
		for y in range(maxi(0, floori(c.y - ry)), mini(h, ceili(c.y + ry) + 1)):
			for x in range(maxi(0, floori(c.x - rx)), mini(w, ceili(c.x + rx) + 1)):
				var dx := (x - c.x) / rx
				var dy := (y - c.y) / ry
				var k := sqrt(dx * dx + dy * dy)
				if k >= 1.0:
					continue
				# (the game's pool: solid to half way out, 0.7 there, none at its edge: render.ts light)
				var pool := 1.0 - 0.6 * k if k < 0.5 else 1.4 * (1.0 - k)
				alpha[y * w + x] *= 1.0 - strength * clampf(pool, 0.0, 1.0)
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
	return glows_root


## One of the look's STATES shown so far along (0 to 1): a way opening, a door swinging, a chest open ("variants" in a recorded
## look: what of the place is hidden and what is drawn in its stead, frame by frame). Nothing where the look has none of it.
func show_variant(name: String, k: float) -> void:
	var V: Dictionary = data.get("variants", {})
	if not V.has(name):
		return
	_show_variant(name, V[name], k)


func has_variant(name: String) -> bool:
	return data.get("variants", {}).has(name)


func _show_variant(name: String, v: Dictionary, k: float) -> void:
	var steps: Array = v["steps"]
	var fi := int(steps[clampi(roundi(k * (steps.size() - 1)), 0, steps.size() - 1)])
	var was: Dictionary = _shown.get(name, {"frame": -1, "nodes": [], "hg": [], "hs": []})
	if int(was["frame"]) == fi:
		return
	# what the last frame of it put in is taken out, and what it hid is shown again
	for n in was["nodes"]:
		if is_instance_valid(n):
			n.queue_free()
	for gi in was["hg"]:
		_hide_ground(int(gi), -1)
	for si in was["hs"]:
		_hide_stand(int(si), -1)
	var F: Dictionary = v["frames"][fi]
	var now := {"frame": fi, "nodes": [], "hg": F["hg"], "hs": F["hs"]}
	for gi in F["hg"]:
		_hide_ground(int(gi), 1)
	for si in F["hs"]:
		_hide_stand(int(si), 1)
	# what it draws on the ground, each after the ground's thing it was drawn after (those after the same one in their order)
	var after_n := {}
	for e in F["g"]:
		var key := str(e[0])
		if not _pics.has(key):
			continue
		var s := Sprite2D.new()
		s.region_enabled = true
		s.centered = false
		if int(e[6]) == 1:
			s.material = _add
		s.modulate.a = float(e[3])
		if float(e[4]) != 0.0 or float(e[5]) != 0.0:
			s.set_meta("size", Vector2(e[4], e[5]) * 2.0)
		s.set_meta("dy", 0.0)
		_place2(s, key)
		s.position = Vector2(e[1], e[2]) * 2.0
		floor_layer.add_child(s)
		var after := int(e[7])
		var at := 0
		if after >= 0 and after < _g_node.size() and _g_node[after] != null:
			at = _g_node[after].get_index() + 1
		at += int(after_n.get(after, 0))
		after_n[after] = int(after_n.get(after, 0)) + 1
		floor_layer.move_child(s, mini(at, floor_layer.get_child_count() - 1))
		now["nodes"].append(s)
	for it in F["s"]:
		var s := _sprite2(it, int(it.get("add", 0)) == 1)
		if s == null:
			continue
		var p := Vector2(it["x"], it["y"]) * 2.0
		var d: float = it["d"]
		s.position = Vector2(p.x, d * HH)
		s.set_meta("dy", p.y - d * HH)
		_place2(s, _first2(it["f"]))
		stands.add_child(s)
		now["nodes"].append(s)
	_shown[name] = now


## One of the ground's things hidden (by: 1) or shown again (-1): hidden while any state hides it.
func _hide_ground(gi: int, by: int) -> void:
	if gi < 0 or gi >= _g_node.size() or _g_node[gi] == null:
		return
	var key := "g%d" % gi
	var n: int = int(_hidden.get(key, 0)) + by
	_hidden[key] = n
	var node = _g_node[gi]
	if _g_at[gi] < 0:
		node.set_meta("hid", n > 0)
		node.visible = n <= 0 and not node.get_meta("fog", false) and not node.get_meta("blank", false)
	else:
		node.gone[_g_at[gi]] = 1 if n > 0 else 0
		node.queue_redraw()


func _hide_stand(si: int, by: int) -> void:
	if si < 0 or si >= _s_node.size() or _s_node[si] == null:
		return
	var key := "s%d" % si
	var n: int = int(_hidden.get(key, 0)) + by
	_hidden[key] = n
	_s_node[si].set_meta("hid", n > 0)
	_s_node[si].visible = n <= 0 and not _s_node[si].get_meta("fog", false) and not _s_node[si].get_meta("blank", false)


## A stretch of the recorded ground's still pictures, drawn in one go in the renderer's order.
class _Still2 extends Node2D:
	var look
	var items: Array = []
	var gone := PackedByteArray()
	var fog := PackedByteArray()

	func _draw() -> void:
		look.draw_still2(self, items, gone, fog)


## What is still on a layer, drawn in one go in the renderer's order (a floor of thousands of tiles is one draw list).
class _Still extends Node2D:
	var look
	var items: Array = []

	func _draw() -> void:
		look.draw_still(self, items)


static func _num(v, otherwise: float) -> float:
	return otherwise if v == null else float(v)
