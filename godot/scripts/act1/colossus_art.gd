## THE SWAMP COLOSSUS'S BAKED PICTURES (render/colossus_baked.ts; tools/bake_colossus.ts baked them: the art chat's painter, each
## layer of him painted once and each frame laid as the art chat's tool lays it, packed in sheets with a manifest; the released
## game's, in assets/colossus). The manifest is read as his fight is first drawn; each group of pictures (his lurk, his stand, his
## entrance in parts, each tentacle's stand, burst, flinches and death, each slam, his shovel in parts, his phase 3) is fetched as it
## is wanted, behind the game, and let go when its phase is over, so that only what the fight wants now is held (of his slams, his
## eye's slams and gazes and his phase 2 gaze's aims, the last few wanted). Until a group is here, the fight's stand-ins
## (colossus_draw.gd). A frame of a move is one picture, its corner given from his middle at the water; at the shovel's right end,
## turned over about his middle (his “Mirror it”); a tentacle's slam turned about its root by what is left of its turn.
## Drawn in game pixels, on a canvas scaled two to one (picture pixels): the bake's pixels are `perGamePx` to a game pixel (1).
extends RefCounted

const DIR := "res://assets/colossus/"
## (ARM_BAKE: a burst begins on their stand's first frame; struck standing is baked from these frames of their stand; their slams on
## the stone every `turnEvery` degrees of turn; his entrance and his shovel in parts of `entrancePart` frames)
const ARM_BAKE := {"burstAt": 0, "flinchFrom": [0, 15, 30], "turnEvery": 15, "entrancePart": 90, "bodyAt": 24}
## (P2_BAKE.at: his phase 2 gaze aimed begun as his stand is on this frame)
const P2_AT := 24
## (COLOSSUS_BAKE.slamsKept and KEPT_GROUPS: the families of which only the last few wanted are kept)
const KEPT := {"arms": 6, "p3": 6, "p2": 2}
## Picture pixels to a game pixel (the canvas the fight is drawn on is scaled so).
const TWO := Vector2(2, 2)

static var man = null
static var _asked := false
## Each group asked for: {sheets: [Texture2D or null], paths, used}.
static var held := {}
static var _clock := 0
## Sheets asked for and let go before they came: taken as they come, and dropped.
static var _dropping: Array = []


## Read the manifest (once).
static func ask() -> void:
	if _asked:
		return
	_asked = true
	var path := DIR + "colossus.json"
	if FileAccess.file_exists(path):
		man = JSON.parse_string(FileAccess.get_file_as_string(path))


## The family a group is of, kept its last few: his tentacles' slams; his phase 3's eye slams and gazes; his phase 2 gaze's aims.
static func _family(g: String) -> String:
	if g.contains(".slam") and not g.begins_with("slam3."):
		return "arms"
	if g.begins_with("slam3.") or g.begins_with("gaze3."):
		return "p3"
	if g.begins_with("gaze2."):
		return "p2"
	return ""


## Fetch a group's sheets, behind the game, if not held already.
static func _want(group: String) -> void:
	if man == null or held.has(group):
		return
	var G = man["groups"].get(group)
	if G == null:
		return
	var h := {"sheets": [], "paths": [], "used": _clock}
	for n in G["sheets"]:
		var path: String = DIR + str(n)
		h["sheets"].append(null)
		h["paths"].append(path)
		_dropping.erase(path)
		if not ResourceLoader.has_cached(path):
			ResourceLoader.load_threaded_request(path)
	held[group] = h
	# (of a family, only the last few wanted kept)
	var fam := _family(group)
	if fam != "":
		var of: Array = []
		for g in held:
			if _family(g) == fam:
				of.append(g)
		of.sort_custom(func(a, b): return int(held[a]["used"]) > int(held[b]["used"]))
		for i in range(int(KEPT[fam]), of.size()):
			_let_go(of[i])


static func _let_go(group: String) -> void:
	var h = held.get(group)
	if h == null:
		return
	for i in h["paths"].size():
		if h["sheets"][i] == null:
			_dropping.append(h["paths"][i])
	held.erase(group)


## The moves now wanted: their groups fetched; every other group let go (but those of the families in `keep`, the last few of each).
static func want(moves: Array, keep: Array) -> void:
	ask()
	_take_dropped()
	if man == null:
		return
	_clock += 1
	var groups := {}
	for mv in moves:
		var M = man["moves"].get(mv)
		if M != null:
			groups[str(M["group"])] = true
	if moves.has("hooks"):
		groups["hooks"] = true
	for g in groups:
		_want(g)
	for g in held.keys():
		if not groups.has(g) and not keep.has(_family(g)):
			_let_go(g)


## Let every group go (his fight over, or the floor left).
static func let_go_all() -> void:
	for g in held.keys():
		_let_go(g)


## (sheets let go before they came: taken as each comes, so that it is not held)
static func _take_dropped() -> void:
	var still: Array = []
	for path in _dropping:
		var s := ResourceLoader.load_threaded_get_status(path)
		if s == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
			still.append(path)
		elif s == ResourceLoader.THREAD_LOAD_LOADED:
			ResourceLoader.load_threaded_get(path)
	_dropping = still


## Whether a move is baked.
static func baked(move: String) -> bool:
	ask()
	return man != null and man["moves"].has(move)


## How many frames a move has (30 a second); 0 if it is not baked.
static func frames(move: String) -> int:
	ask()
	if man == null or not man["moves"].has(move):
		return 0
	return man["moves"][move]["frames"].size()


## The slam turns baked for tentacle `w` (degrees).
static func slam_turns(w: int) -> Array:
	ask()
	var out: Array = []
	if man == null:
		return out
	var re := RegEx.create_from_string("^a(\\d)\\.slam(-?\\d+)$")
	for mv in man["moves"]:
		var r := re.search(str(mv))
		if r != null and int(r.get_string(1)) == w:
			out.append(int(r.get_string(2)))
	out.sort()
	return out


## A group's sheet `i`, once it is here (null while it comes).
static func _sheet(h: Dictionary, i: int) -> Texture2D:
	if h["sheets"][i] == null:
		var path: String = h["paths"][i]
		var s := ResourceLoader.load_threaded_get_status(path)
		if s == ResourceLoader.THREAD_LOAD_LOADED:
			h["sheets"][i] = ResourceLoader.load_threaded_get(path)
		elif s != ResourceLoader.THREAD_LOAD_IN_PROGRESS and ResourceLoader.has_cached(path):
			h["sheets"][i] = load(path)
	return h["sheets"][i]


## A frame's picture, if its group is here (asked for if not): {img, m}; empty: none.
static func _pic(move: String, k: int) -> Dictionary:
	ask()
	if man == null:
		return {}
	var mv = man["moves"].get(move)
	if mv == null:
		return {}
	var group := str(mv["group"])
	_want(group)
	var h = held.get(group)
	var G = man["groups"].get(group)
	if h == null or G == null:
		return {}
	h["used"] = _clock
	var fr: Array = mv["frames"]
	var m = G["pics"][int(fr[clampi(k, 0, fr.size() - 1)])]
	if m == null:
		return {}
	var img := _sheet(h, int(m["s"]))
	return {"img": img, "m": m} if img != null else {}


## Whether frame `k` of a move's picture is here to be drawn now.
static func has(move: String, k: int) -> bool:
	return not _pic(move, k).is_empty()


## Where his eye glows in frame `k` of `move` (game pixels from his middle at the water), if it shows; INF if not.
static func eye(move: String, k: int) -> Vector2:
	ask()
	if man == null or not man["moves"].has(move):
		return Vector2.INF
	var e = man["moves"][move].get("eyes")
	if e == null or e.is_empty():
		return Vector2.INF
	var p = e[clampi(k, 0, e.size() - 1)]
	var per := float(man["perGamePx"])
	return Vector2(float(p[0]) / per, float(p[1]) / per) if p != null else Vector2.INF


## Whether frame `k` of his shovel's `move` is at the stone's end (turned over at its right end).
static func at_end(move: String, k: int) -> bool:
	ask()
	if man == null or not man["moves"].has(move):
		return false
	var e = man["moves"][move].get("ends")
	return e != null and not e.is_empty() and bool(e[clampi(k, 0, e.size() - 1)])


## (the canvas's transform, scaled to picture pixels, with `t` after it in game pixels)
static func _xf(c: CanvasItem, t: Transform2D) -> void:
	c.draw_set_transform_matrix(Transform2D.IDENTITY.scaled(TWO) * t)


## His shovel's scraping tentacles in frame `k` of `move`, laid from his middle at the water at (sx, sy), game pixels; at the right end
## turned over.
static func hooks(c: CanvasItem, move: String, k: int, sx: float, sy: float, mirror := false) -> bool:
	ask()
	if man == null or not man["moves"].has(move):
		return false
	var hk = man["moves"][move].get("hooks")
	if hk == null:
		return false
	var list: Array = hk[clampi(k, 0, hk.size() - 1)] if not hk.is_empty() else []
	if list.is_empty():
		return true
	_want("hooks")
	var h = held.get("hooks")
	var G = man["groups"].get("hooks")
	if h == null or G == null:
		return false
	h["used"] = _clock
	var per := float(man["perGamePx"])
	var t := Transform2D(0.0, Vector2(roundf(sx), roundf(sy)))
	if mirror:
		t = t * Transform2D(Vector2(-1, 0), Vector2(0, 1), Vector2.ZERO)
	_xf(c, t)
	var all := true
	for q in list:
		var m = G["pics"][int(q[0])]
		var img: Texture2D = _sheet(h, int(m["s"])) if m != null else null
		if m == null or img == null:
			all = false
			continue
		c.draw_texture_rect_region(img, Rect2((float(q[1]) + float(m["ox"])) / per, float(m["oy"]) / per, float(m["w"]) / per, float(m["h"]) / per), Rect2(m["x"], m["y"], m["w"], m["h"]))
	_xf(c, Transform2D.IDENTITY)
	return all


## His body: frame `k` of `move` with his middle at the water at (sx, sy), game pixels; `mirror`, turned over about his middle.
static func body(c: CanvasItem, move: String, k: int, sx: float, sy: float, mirror := false, alpha := 1.0) -> bool:
	var p := _pic(move, k)
	if p.is_empty():
		return false
	var m: Dictionary = p["m"]
	var per := float(man["perGamePx"])
	var t := Transform2D(0.0, Vector2(roundf(sx), roundf(sy)))
	if mirror:
		t = t * Transform2D(Vector2(-1, 0), Vector2(0, 1), Vector2.ZERO)
	_xf(c, t)
	c.draw_texture_rect_region(p["img"], Rect2(float(m["ox"]) / per, float(m["oy"]) / per, float(m["w"]) / per, float(m["h"]) / per), Rect2(m["x"], m["y"], m["w"], m["h"]), Color(1, 1, 1, alpha))
	_xf(c, Transform2D.IDENTITY)
	return true


## A tentacle `w` (0 to 4): frame `k` of its `move`, laid from his middle at the water at (sx, sy) as he is, and turned `turn` degrees
## about its root (toward his right as it is more), as the ground turns seen from the game's camera.
static func arm(c: CanvasItem, w: int, move: String, k: int, sx: float, sy: float, turn := 0.0) -> bool:
	var p := _pic(move, k)
	if p.is_empty():
		return false
	var m: Dictionary = p["m"]
	var per := float(man["perGamePx"])
	var roots: Array = man["roots"]
	var r: Vector2 = Vector2(float(roots[w][0]), float(roots[w][1])) / per if w < roots.size() else Vector2.ZERO
	var t := Transform2D(0.0, Vector2(roundf(sx), roundf(sy)))
	if turn != 0.0:
		var a := deg_to_rad(turn)
		var co := cos(a)
		var s := sin(a)
		t = t * Transform2D(0.0, r) * Transform2D(Vector2(co, -s / 2.0), Vector2(2.0 * s, co), Vector2.ZERO) * Transform2D(0.0, -r)
	_xf(c, t)
	c.draw_texture_rect_region(p["img"], Rect2(float(m["ox"]) / per, float(m["oy"]) / per, float(m["w"]) / per, float(m["h"]) / per), Rect2(m["x"], m["y"], m["w"], m["h"]))
	_xf(c, Transform2D.IDENTITY)
	return true
