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
## (each of the look's glows, by its place in the list, as its node, or null where it has no picture; the dark's own picture
## and what it was made by, kept so that a hole in it can be taken out and put back: a furnace gone out)
var _glow_at: Array = []
var _dark_img: Image
var _dark_lo := Vector2.ZERO
var _dark_a := 0.0
var _dark_dirty := Rect2i()
var _fogged := false
## (the states playing by the clock: play_variant)
var _plays: Array = []
## (what he has seen of the floor, sight.gd: main.gd sets it; none, everything is seen)
var sight = null
## (a look of the first kind, what is seen when: each of its things by the tile it stands on, read off its place on the
## screen: tile -> [[0, its sprite] or [1, its drawer, which of its pictures]])
var _fog1 := {}
var _pics := {}
var _anim: Array = []  # {node, frames, fps, t0, secs, dy}
var _t := 0.0
var _add: CanvasItemMaterial
var _dark: Sprite2D
var _hero: Node2D
## (the moves' lights in the dark this frame: where, picture pixels; how wide and how strong: spot)
const SPOTS_MOST := 96
var _spots_at := PackedVector2Array()
var _spots_rs := PackedVector2Array()
var _spots_were := 0
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
## (SEEN THROUGH: the tall things of a recorded look, each a sprite or one picture of a group, by the cells of the screen they
## cover; each picture's solid pixels; those seen through now; and who may be behind one: the hero and the monsters (main.gd))
const SEE_CELL := 128.0
const SEE_TALL := 88.0  # picture pixels: act1_pieces.ts SEE_TALL, 44 game pixels
const SEEN_THROUGH := 0.38
var _see_cells := {}
var _tall: Array = []
var _see_masks := {}
var _seen_now := {}
var foes = null


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
		# (WHAT IS SEEN WHEN, on a floor: the tile this stands on, by its place on the screen; what is behind everything is always drawn)
		var tile := _tile1(it) if place != "town" and layer != "back" else -1
		if still.has(layer) and frames.size() == 1 and not it.has("stair") and not it.has("waypoint"):
			(still_yh if it.has("yh") else still)[layer].append([frames[0], at, tile])
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
		if tile >= 0:
			_fog_sprite1(s, tile)
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
			drawer.fog.resize(list.size())
			for i in list.size():
				var t := int(list[i][2])
				if t >= 0:
					drawer.fog[i] = 1
					if not _fog1.has(t):
						_fog1[t] = []
					_fog1[t].append([1, drawer, i])
			layers[layer].add_child(drawer)
			layers[layer].move_child(drawer, 1 if yh else 0)
			if yh:
				_yh_nodes.append(drawer)
	if place != "town":
		_fogged = true
		# (a door's leaf and a gate's bars wait on the tile they stand on too)
		for D in _doors:
			if D["steps"].is_empty() or D["steps"][0].is_empty():
				continue
			var p0: Array = D["steps"][0][0]
			var t := _tile_at1(float(p0[1]), float(p0[2]))
			for sp in D["sprites"]:
				_fog_sprite1(sp, t)
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
	# (a look recorded from the game has its waypoint awake as it stands: he comes in beside it)
	if _format == 2:
		return
	if _way_awake or _way_node == null or not data.has("waypoint"):
		return
	_way_awake = true
	var w: Dictionary = data["waypoint"]
	_anim.append({"node": _way_node, "frames": w["awake"], "fps": float(w["fps"]), "t0": 0.0, "secs": null, "dy": _way_node.offset.y + _pics[w["awake"][0]]["anchor"].y})
	_motes.visible = true


## A WARP on the waypoint (render.ts standWays): the column of light, its frames at 20 a second from `from` seconds in (0 as he
## goes; 0.25 as he comes out of it, its second half), in place of the motes while it plays.
func play_warp(from: float) -> void:
	if _format == 2:
		play_variant("warp", from)
		return
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


## THE MOVES' LIGHTS IN THE DARK (the game's `c.spot`, render.ts spot, as render/act1_fx gives them): a hole cut in the dark
## for this frame round a point of the screen (`at`, game pixels), `r` across its half and 0.62 of that up and down, as strong
## as `a`. Asked for afresh every frame by whatever shines (perils.gd); no more than SPOTS_MOST at once.
func spot(at: Vector2, r: float, a: float) -> void:
	if _dark == null or a <= 0.0 or r <= 0.0 or _spots_at.size() >= SPOTS_MOST:
		return
	_spots_at.append(at * 2.0)
	_spots_rs.append(Vector2(r * 2.0, minf(a, 1.0)))


## The frame's spots handed to the dark, and the list begun again.
func _send_spots() -> void:
	if _dark == null:
		return
	var n := _spots_at.size()
	if n > 0 or _spots_were > 0:
		_spots_at.resize(SPOTS_MOST)
		_spots_rs.resize(SPOTS_MOST)
		var m: ShaderMaterial = _dark.material
		m.set_shader_parameter("spot_n", n)
		m.set_shader_parameter("spot_at", _spots_at)
		m.set_shader_parameter("spot_rs", _spots_rs)
	_spots_were = n
	_spots_at = PackedVector2Array()
	_spots_rs = PackedVector2Array()


func _process(dt: float) -> void:
	_t += dt
	_send_spots()
	if _format == 2:
		_run2()
		_step_plays(dt)
		_see_through2()
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


func draw_still(c: CanvasItem, items: Array, fog := PackedByteArray()) -> void:
	for i in items.size():
		var it: Array = items[i]
		if i < fog.size() and fog[i] != 0:
			continue
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
uniform int spot_n = 0;
uniform vec2 spot_at[96];
uniform vec2 spot_rs[96];
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
	// (the moves' lights: each a hole round its point, as the lights of the place are cut)
	for (int i = 0; i < 96; i++) {
		if (i >= spot_n) {
			break;
		}
		vec2 q = (world - spot_at[i]) / vec2(spot_rs[i].x, spot_rs[i].x * 0.62);
		a *= 1.0 - spot_rs[i].y * (1.0 - smoothstep(0.3, 1.0, clamp(length(q), 0.0, 1.0)));
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
	_dark_img = img
	_dark_lo = lo
	_dark_a = a
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
		# (a glow is not seen until the tile it is over has been)
		if _fogged:
			var gp: Vector2 = g[0]
			_fog_sprite1(s, _tile_at1(gp.x, gp.y + 8.0))
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
		# (a run of still things at one depth side by side, the Pinewood's trees: one thing, its pictures drawn in their order)
		if it.has("g"):
			var grp := _Group.new()
			grp.look = self
			grp.parts = it["g"]
			grp.alpha.resize(grp.parts.size())
			grp.alpha.fill(1.0)
			grp.position = Vector2(float(it["x"]) * 2.0, float(it["d"]) * HH)
			_s_node.append(grp)
			stands.add_child(grp)
			for k in grp.parts.size():
				var q: Array = grp.parts[k]
				_see_add(str(q[0]), Vector2(float(q[1]), float(q[2])) * 2.0, float(it["d"]), grp, k)
			continue
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
		if (it["f"] as Array).size() == 1 and not it.has("wall") and not it.has("w"):
			_see_add(_first2(it["f"]), at, d, s, -1)
		if it.has("prop"):
			_props[int(it["prop"])] = {"node": s}
		if it.has("wall"):
			var w: Array = it["wall"]
			stands.add_wall(s, float(w[2]), Vector2(w[0], w[1]) * 2.0, int(w[3]) if w.size() > 3 else -1)
	_fog_begin()
	_see_pictures()
	if data.has("sky"):
		_make_sky(data["sky"])


## THE SKY (the Ledge Road's: render/outdoor.ts drawSky), behind everything and held to the screen (the look's `sky`).
func _make_sky(S: Dictionary) -> void:
	var layer := CanvasLayer.new()
	layer.layer = -10
	var sky := _Sky.new()
	sky.S = S
	sky.tex = load(DIR + str(S["pic"]))
	if S.has("town"):
		sky.town = load(DIR + str(S["town"]["pic"]))
	layer.add_child(sky)
	add_child(layer)


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


## (a look of the first kind) The tile a thing stands on, by its place on the screen: a floor tile's and a wall's anchor is their
## tile's top corner, a thing that stands has its anchor on the ground under it.
func _tile1(it: Dictionary) -> int:
	return _tile_at1(float(it["x"]), float(it["y"]))


func _tile_at1(x: float, y: float) -> int:
	var wx := (x / 16.0 + y / 8.0) / 2.0
	var wy := (y / 8.0 - x / 16.0) / 2.0
	var w: int = int(data.get("w", 0))
	if w <= 0:
		w = _width1()
	var tx := floori(wx + 0.01)
	var ty := floori(wy + 0.01)
	if tx < 0 or ty < 0 or tx >= w:
		return -1
	return ty * w + tx


## (a look of the first kind does not say how wide its level is: the floor's layout does)
func _width1() -> int:
	var path := "res://assets/%s/layout.json" % place
	if not data.has("_w"):
		data["_w"] = int(JSON.parse_string(FileAccess.get_file_as_string(path))["w"]) if FileAccess.file_exists(path) else 0
	return int(data["_w"])


## A sprite not drawn until its tile has been seen: by its own strength alone, so that what else shows and hides it (a door's
## steps, the yard's zones, a wall's fading) goes on as it does.
func _fog_sprite1(s: CanvasItem, tile: int) -> void:
	if tile < 0:
		return
	s.self_modulate.a = 0.0
	if not _fog1.has(tile):
		_fog1[tile] = []
	_fog1[tile].append([0, s])


## Whether a place on the floor has been seen (for what others draw there: the traps).
func seen_at(p: Vector2) -> bool:
	return sight == null or sight.seen_at(p)


## These tiles have been seen: what waited on them is drawn.
func reveal(tiles: PackedInt32Array) -> void:
	if not _fogged:
		return
	var redraw := {}
	for t in tiles:
		if _fog1.has(t):
			for e in _fog1[t]:
				if int(e[0]) == 0:
					if is_instance_valid(e[1]):
						e[1].self_modulate.a = 1.0
				else:
					e[1].fog[int(e[2])] = 0
					redraw[e[1]] = true
			_fog1.erase(t)
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
				n.set_meta("fog", false)
				n.visible = not n.get_meta("hid", false)
			_fog_glow.erase(t)
	for node in redraw:
		node.queue_redraw()


func reveal_all() -> void:
	var tiles := PackedInt32Array()
	for t in _fog1:
		tiles.append(t)
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
	# (him, for what is seen through as he goes behind it, whether or not the place is dark)
	_hero = hero
	var dk: Dictionary = data.get("dark", {"a": 0.0, "rgb": [0, 0, 0]})
	var a: float = dk["a"]
	var glows_root := Node2D.new()
	glows_root.z_index = 51
	root.add_child(glows_root)
	for g in data.get("glows", []):
		var key := str(g[0])
		if not _pics.has(key):
			_glow_at.append(null)
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
		_glow_at.append(s)
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
				_glow_nodes[k].set_meta("fog", true)
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
	_show_step(name, v, clampi(roundi(k * (steps.size() - 1)), 0, steps.size() - 1))


## A state played by the clock (the warp's column of light on the waypoint: its frames at its own pace from `from` seconds in);
## once, and then it is gone; or round and round (`loop`).
func play_variant(name: String, from := 0.0, loop := false) -> void:
	var V: Dictionary = data.get("variants", {})
	if not V.has(name):
		return
	for p in _plays:
		if p["name"] == name:
			p["t"] = from
			return
	_plays.append({"name": name, "t": from, "loop": loop, "fps": float(V[name].get("fps", 20.0))})
	_step_plays(0.0)


func _step_plays(dt: float) -> void:
	var keep: Array = []
	for p in _plays:
		p["t"] += dt
		var v: Dictionary = data["variants"][p["name"]]
		var n: int = v["steps"].size()
		var i := int(floorf(p["t"] * p["fps"]))
		if i >= n and not p["loop"]:
			clear_variant(p["name"])
			continue
		_show_step(p["name"], v, posmod(i, n))
		keep.append(p)
	_plays = keep


## A state taken away again: what it put in is taken out, what it hid is shown.
func clear_variant(name: String) -> void:
	var was: Dictionary = _shown.get(name, {})
	if was.is_empty():
		return
	for n in was["nodes"]:
		if is_instance_valid(n):
			n.queue_free()
	for gi in was["hg"]:
		_hide_ground(int(gi), -1)
	for si in was["hs"]:
		_hide_stand(int(si), -1)
	for li in was.get("hl", []):
		_hide_hole(int(li), -1)
	for wi in was.get("hw", []):
		_hide_glow(int(wi), -1)
	_flush_dark()
	_shown.erase(name)


func _show_step(name: String, v: Dictionary, si: int) -> void:
	var fi := int(v["steps"][si])
	var was: Dictionary = _shown.get(name, {"frame": -1, "nodes": [], "hg": [], "hs": []})
	if int(was["frame"]) == fi:
		return
	# what the last frame of it put in is taken out, and what it hid is shown again
	for n in was["nodes"]:
		if is_instance_valid(n):
			n.queue_free()
	for gi in was["hg"]:
		_hide_ground(int(gi), -1)
	for si2 in was["hs"]:
		_hide_stand(int(si2), -1)
	for li in was.get("hl", []):
		_hide_hole(int(li), -1)
	for wi in was.get("hw", []):
		_hide_glow(int(wi), -1)
	var F: Dictionary = v["frames"][fi]
	var now := {"frame": fi, "nodes": [], "hg": F["hg"], "hs": F["hs"], "hl": F.get("hl", []), "hw": F.get("hw", [])}
	for gi in F["hg"]:
		_hide_ground(int(gi), 1)
	for si2 in F["hs"]:
		_hide_stand(int(si2), 1)
	# (the lights that are not there in it: a furnace gone out, a fire gone from a doorway)
	for li in now["hl"]:
		_hide_hole(int(li), 1)
	for wi in now["hw"]:
		_hide_glow(int(wi), 1)
	_flush_dark()
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


## One of the look's glows hidden (by: 1) or shown again (-1): hidden while any state hides it.
func _hide_glow(wi: int, by: int) -> void:
	if wi < 0 or wi >= _glow_at.size() or _glow_at[wi] == null:
		return
	var key := "w%d" % wi
	var n: int = int(_hidden.get(key, 0)) + by
	_hidden[key] = n
	var node: Node2D = _glow_at[wi]
	node.set_meta("hid", n > 0)
	node.visible = n <= 0 and not node.get_meta("fog", false)


## One of the holes the look's lights cut in the dark taken out (by: 1) or put back (-1): the dark's picture is made again
## there, once for all that changed (_flush_dark).
func _hide_hole(li: int, by: int) -> void:
	var holes: Array = data.get("holes", [])
	if li < 0 or li >= holes.size() or _dark_img == null:
		return
	var key := "l%d" % li
	var was: int = int(_hidden.get(key, 0))
	var n := was + by
	_hidden[key] = n
	if (was > 0) == (n > 0):
		return
	var hole: Array = holes[li]
	var c: Vector2 = (Vector2(hole[0], hole[1]) - _dark_lo) / DARK_GRAIN
	var rx: float = float(hole[2]) / DARK_GRAIN
	var ry: float = float(hole[3]) / DARK_GRAIN
	var r := Rect2i(floori(c.x - rx) - 1, floori(c.y - ry) - 1, ceili(rx * 2.0) + 3, ceili(ry * 2.0) + 3)
	_dark_dirty = r if _dark_dirty.size == Vector2i.ZERO else _dark_dirty.merge(r)


## The dark's picture made again where its holes changed: every hole still there that reaches into it, as it was first made.
func _flush_dark() -> void:
	if _dark_dirty.size == Vector2i.ZERO or _dark_img == null or _dark == null:
		return
	var w := _dark_img.get_width()
	var h := _dark_img.get_height()
	var r := _dark_dirty.intersection(Rect2i(0, 0, w, h))
	_dark_dirty = Rect2i()
	if r.size.x <= 0 or r.size.y <= 0:
		return
	var holes: Array = data.get("holes", [])
	var near: Array = []
	for i in holes.size():
		if int(_hidden.get("l%d" % i, 0)) > 0:
			continue
		var hole: Array = holes[i]
		var c: Vector2 = (Vector2(hole[0], hole[1]) - _dark_lo) / DARK_GRAIN
		var rx: float = float(hole[2]) / DARK_GRAIN
		var ry: float = float(hole[3]) / DARK_GRAIN
		if rx <= 0.0 or ry <= 0.0:
			continue
		if c.x + rx < r.position.x or c.x - rx > r.end.x or c.y + ry < r.position.y or c.y - ry > r.end.y:
			continue
		near.append([c, rx, ry, clampf(float(hole[4]), 0.0, 1.0)])
	var col := _dark_img.get_pixel(0, 0)
	for y in range(r.position.y, r.end.y):
		for x in range(r.position.x, r.end.x):
			var alpha := 1.0
			for q in near:
				var dx: float = (x - q[0].x) / q[1]
				var dy: float = (y - q[0].y) / q[2]
				var k := sqrt(dx * dx + dy * dy)
				if k >= 1.0:
					continue
				var pool := 1.0 - 0.6 * k if k < 0.5 else 1.4 * (1.0 - k)
				alpha *= 1.0 - q[3] * clampf(pool, 0.0, 1.0)
			_dark_img.set_pixel(x, y, Color(col.r, col.g, col.b, clampf(_dark_a * alpha, 0.0, 1.0)))
	_dark.texture.update(_dark_img)


# --- seen through (render.ts seeThrough, veil) ---

## A tall thing of the look (a tree, a tall rock, a big piece) put down for SEEING THROUGH: its picture `key` with its anchor
## at `at` (picture pixels), its depth `d`, drawn by `node` (a sprite, or a group and which of its pictures, `k`).
func _see_add(key: String, at: Vector2, d: float, node, k: int) -> void:
	var pic: Dictionary = _pics.get(key, {})
	if pic.is_empty():
		return
	var r: Rect2 = pic["rect"]
	# (on the descent's open ground, as the game has it: render.ts openGround; elsewhere the walls fade, stands.gd)
	if r.size.y < SEE_TALL or int(data.get("depth", 0)) < 6:
		return
	var box := Rect2(at - pic["anchor"], r.size)
	var i := _tall.size()
	_tall.append({"key": key, "box": box, "d": d, "node": node, "k": k})
	for cy in range(floori(box.position.y / SEE_CELL), floori(box.end.y / SEE_CELL) + 1):
		for cx in range(floori(box.position.x / SEE_CELL), floori(box.end.x / SEE_CELL) + 1):
			var c := Vector2i(cx, cy)
			if not _see_cells.has(c):
				_see_cells[c] = PackedInt32Array()
			_see_cells[c].append(i)


## The tall things' pictures as pictures of their own, to read their pixels by: each sheet that has any read once, as the
## look is laid out, and let go of (a sheet's pixels are many; the tall pictures on it are few).
func _see_pictures() -> void:
	var by_sheet := {}
	for e in _tall:
		var key: String = e["key"]
		if _see_masks.has(key):
			continue
		_see_masks[key] = null
		var sheet: Texture2D = _pics[key]["sheet"]
		if not by_sheet.has(sheet):
			by_sheet[sheet] = []
		by_sheet[sheet].append(key)
	for sheet in by_sheet:
		var img: Image = sheet.get_image()
		if img == null:
			continue
		if img.is_compressed():
			img.decompress()
		for key in by_sheet[sheet]:
			_see_masks[key] = img.get_region(Rect2i(_pics[key]["rect"]))


## WHAT IS SEEN THROUGH NOW (render.ts seeThrough, on the descent's open ground; veil on any floor): a tall thing in front of
## the hero, or of a monster in sight, whose picture covers his middle, his head or his feet (3, 14 and 28 game pixels up from
## them) is drawn at SEEN_THROUGH; at once, as the game does it, frame by frame.
func _see_through2() -> void:
	if _tall.is_empty():
		return
	var who: Array = []
	if _hero != null and is_instance_valid(_hero):
		who.append(_hero.world)
	if foes != null and is_instance_valid(foes):
		var vp := get_viewport_rect()
		var cam := get_viewport().get_camera_2d()
		var mid: Vector2 = cam.get_screen_center_position() if cam != null else Vector2.ZERO
		for m in foes.list:
			if is_instance_valid(m) and not m.dead and m.seen:
				var w: Vector2 = m.world
				var sp := Vector2((w.x - w.y) * 32.0, (w.x + w.y) * 16.0)
				if absf(sp.x - mid.x) < vp.size.x and absf(sp.y - mid.y) < vp.size.y:
					who.append(w)
	var now := {}
	for w in who:
		for i in covering(w):
			now[i] = true
	for i in _seen_now:
		if not now.has(i):
			_see_alpha(_tall[i], 1.0)
	for i in now:
		if not _seen_now.has(i):
			_see_alpha(_tall[i], SEEN_THROUGH)
	_seen_now = now


## The tall things in front of a body standing at `w` (tiles) whose pictures cover his middle, his head or his feet.
func covering(w: Vector2) -> Array:
	var out: Array = []
	var feet := Vector2((w.x - w.y) * 32.0, (w.x + w.y) * 16.0)
	var dw: float = w.x + w.y
	for up in [3.0, 14.0, 28.0]:
		var pt: Vector2 = feet - Vector2(0, up * 2.0)
		var c := Vector2i(floori(pt.x / SEE_CELL), floori(pt.y / SEE_CELL))
		if not _see_cells.has(c):
			continue
		for i in _see_cells[c]:
			if out.has(i):
				continue
			var e: Dictionary = _tall[i]
			var box: Rect2 = e["box"]
			if dw >= float(e["d"]) or not box.has_point(pt):
				continue
			var m: Image = _see_masks.get(e["key"])
			if m == null:
				continue
			var lx := clampi(floori(pt.x - box.position.x), 0, m.get_width() - 1)
			var ly := clampi(floori(pt.y - box.position.y), 0, m.get_height() - 1)
			if m.get_pixel(lx, ly).a > 0.0:
				out.append(i)
	return out


## How many tall things are seen through now.
func seen_through() -> int:
	return _seen_now.size()


func _see_alpha(e: Dictionary, a: float) -> void:
	var node = e["node"]
	if not is_instance_valid(node):
		return
	if int(e["k"]) < 0:
		node.self_modulate.a = a
	else:
		node.alpha[int(e["k"])] = a
		node.queue_redraw()


## Still things that stand at one depth side by side, as one (tools/godot_record.mjs `g`: the Pinewood's trees, a row of them
## within a column of the screen): each picture drawn in its order, its anchor where it stands.
class _Group extends Node2D:
	var look
	var parts: Array = []
	## (how solid each is drawn: seen through while someone is behind it)
	var alpha := PackedFloat32Array()

	func _draw() -> void:
		for i in parts.size():
			var p: Array = parts[i]
			var pic: Dictionary = look._pics.get(str(p[0]), {})
			if pic.is_empty():
				continue
			var r: Rect2 = pic["rect"]
			draw_texture_rect_region(pic["sheet"], Rect2(Vector2(float(p[1]), float(p[2])) * 2.0 - position - pic["anchor"], r.size), r, Color(1, 1, 1, alpha[i] if i < alpha.size() else 1.0))


## THE SKY, drawn on the screen as the game draws it (render/outdoor.ts drawSky; the screen here is the game's, 480 by 270 game
## pixels, at two picture pixels to one): its colour over the whole screen; its picture laid across it from `horizon` picture
## pixels above the middle, sliding at half the ground's pace (the camera's) and coming round every `wrap`; the town far below
## in it, at its place in the sky's own measure; and under the picture, its haze.
class _Sky extends Node2D:
	var S: Dictionary
	var tex: Texture2D
	var town: Texture2D

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var vp := get_viewport()
		var size := vp.get_visible_rect().size
		var cam := vp.get_camera_2d()
		var cx: float = cam.get_screen_center_position().x if cam != null else 0.0
		# (the game's cam.ox, where world (0, 0) falls across the screen, here in picture pixels; the sky slides by half of it)
		var ox := size.x / 2.0 - cx
		draw_rect(Rect2(Vector2.ZERO, size), Color(str(S["fill"])))
		var wrap := float(S["wrap"])
		var h := float(S["h"])
		var top := roundf(size.y / 4.0 - float(S["horizon"]) / 2.0) * 2.0
		var x := -fposmod(-ox / 2.0, wrap)
		while x < size.x:
			draw_texture_rect(tex, Rect2(x, top, wrap, h), false)
			x += wrap
		if town != null:
			var tw: Dictionary = S["town"]
			draw_texture(town, Vector2(float(tw["x"]) + ox / 2.0, top + float(tw["y"]) + float(S["horizon"])))
		if top + h < size.y:
			draw_rect(Rect2(0, top + h, size.x, size.y - top - h), Color(str(S["haze"])))


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
	var fog := PackedByteArray()

	func _draw() -> void:
		look.draw_still(self, items, fog)


static func _num(v, otherwise: float) -> float:
	return otherwise if v == null else float(v)
