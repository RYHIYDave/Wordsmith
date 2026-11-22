## A monster figure as the game bakes it (tools/bake_monsters.mjs; render/monsters_bake_list.ts MonsterBakeFile), its pack
## unpacked by tools/godot_unpack_monsters.mjs: `<name>.json` and its sheets `<name>-N.png`.
##   frames: [sheet, x, y, w, h, part] in sheet pixels.  parts: {w, h, ax, ay, density} in GAME pixels.
##   lens[side][list]: how many frames each list has; at = [side, list, frame, frame index, ...].
## The lists' names and paces (idle, walk, attack, heavy, die, reel, then its own moves) come from lists.json
## (tools/godot_monster_lists.ts, from the game's own art/bestiary.ts framesOf).
## Seen from two sides, the front (0) and the back (1), MIRRORED for the other two (render/figure.ts: `left` when
## fx - fy < 0, `away` when fx + fy < -0.2); a figure painted from eight sides is numbered as the heroes are.
## A FIGURE TOO BIG TO HOLD WHOLE (the Moth, floor 20's boss: render/monsters_bake_list.ts TOO_BIG; baked for Godot a move at a time
## by tools/godot_bake_moth.mjs) has `groups` in its file, the sheets each side's list lies on: only the sheets of what it is
## playing are taken in (`want` reads a move's ahead, off the game's thread), and those not shown for KEEP_MS are let go of.
extends RefCounted

var name := ""
var sides := 2
var sheets: Array[Texture2D] = []
var _frames: Array = []
var _parts: Array = []
var _lists: Array = []  # [side][list] -> PackedInt32Array
var _names := {}  # list name -> list index
var _fps := PackedFloat32Array()
var _cache := {}
## (a figure taken in a move at a time: its sheets' paths, the sheets each "side:list" lies on, when each was last shown or asked
## for (ms), those asked for off the game's thread and not yet taken)
const KEEP_MS := 4000
var lazy := false
var _paths: Array[String] = []
var _groups := {}
var _used := PackedInt64Array()
var _asked := {}
var _trimmed := 0
## A FIGURE FETCHED WHEN IT IS WANTED (floor 9's two side bosses, the Troll Chieftain and the Mist Wolf, eight big sheets each):
## none of its sheets taken in as the floor begins; all of them asked for off the game's thread as its lair is entered (`fetch`,
## monsters.gd); one wanted before then is taken in at once.
var deferred := false
var fetched := false


func _init(dir: String, figure: String, lists_info: Dictionary, defer := false) -> void:
	name = figure
	# (a figure the game draws in pictures of its own, not baked as a monster's: the Swamp Colossus, figure "eye", whose fight draws
	# him and his tentacles (act1/colossus_draw.gd): a figure with no lists)
	if not FileAccess.file_exists("%s/%s.json" % [dir, figure]) or not lists_info.has(figure):
		_lists = [[]]
		return
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("%s/%s.json" % [dir, figure]))
	lazy = data.has("groups")
	deferred = defer and not lazy
	for s in data["sheets"]:
		var path := "%s/%s" % [dir, s]
		_paths.append(path)
		sheets.append(null if lazy or deferred else load(path))
	if lazy or deferred:
		_groups = data.get("groups", {})
		_used.resize(_paths.size())
		_used.fill(0)
	_frames = data["frames"]
	_parts = data["parts"]
	var lens: Array = data["lens"]
	sides = lens.size()
	for side in lens.size():
		var per: Array = []
		for n in lens[side]:
			var a := PackedInt32Array()
			a.resize(int(n))
			per.append(a)
		_lists.append(per)
	var at: Array = data["at"]
	for i in range(0, at.size(), 4):
		_lists[int(at[i])][int(at[i + 1])][int(at[i + 2])] = int(at[i + 3])
	var info: Array = lists_info[figure]["lists"]
	for i in info.size():
		_names[info[i]["name"]] = i
		# (a list it has no pictures of has no pace: the King's Hush, which never walks)
		_fps.append(float(info[i]["fps"]) if info[i]["fps"] != null else 0.0)


func has(list: String) -> bool:
	return _names.has(list) and count(0, list) > 0


func count(side: int, list: String) -> int:
	return _lists[side][_names[list]].size() if _names.has(list) else 0


func fps(list: String) -> float:
	return _fps[_names[list]]


## How long a list takes to play once, seconds.
func length(list: String) -> float:
	return count(0, list) / fps(list)


## Of a figure painted from all eight sides, the one it is seen from facing (fx, fy), as the game numbers them (art/sides.ts
## EIGHT_ORDER; art/warrior_up_art.ts wuFacing: the nearest eighth, round from down and to the right).
const EIGHT_ORDER := ["front", "back", "toward", "frontL", "sideL", "backL", "away", "side"]
const EIGHT_ROUND := ["front", "toward", "frontL", "sideL", "backL", "away", "back", "side"]


static func eight_side(fx: float, fy: float) -> int:
	var a := rad_to_deg(atan2(fy, fx))
	var k := ((int(floorf(a / 45.0 + 0.5)) % 8) + 8) % 8
	return EIGHT_ORDER.find(EIGHT_ROUND[k])


## The frame: its picture, where to hang it from the figure's anchor, and whether it is mirrored; `fx`, `fy` the way
## the figure faces on the floor; `eight`: a figure painted from all eight sides seen truly from the one it faces.
func frame(fx: float, fy: float, list: String, i: int, eight := false) -> Dictionary:
	var left := fx - fy < 0.0
	var side := 1 if fx + fy < -0.2 else 0
	if eight and sides == 8:
		# (one painted truly from each of the eight, never mirrored: the endless boss, art/act1_figs/wsboss.ts)
		side = eight_side(fx, fy)
		left = false
	var n := count(side, list)
	if n == 0:
		side = 0
		n = count(0, list)
	var idx: int = _lists[side][_names[list]][clampi(i, 0, n - 1)]
	var key := idx * 2 + (1 if left else 0)
	if not lazy and _cache.has(key):
		return _cache[key]
	var f: Array = _frames[idx]
	if lazy:
		_used[int(f[0])] = Time.get_ticks_msec()
		_trim()
		if _cache.has(key):
			return _cache[key]
		want(list, side)
	elif _cache.has(key):
		return _cache[key]
	var p: Dictionary = _parts[int(f[5])]
	var d := float(p.get("density", 1))
	var tex := AtlasTexture.new()
	tex.atlas = _sheet(int(f[0]))
	tex.region = Rect2(f[1], f[2], f[3], f[4])
	var anchor := Vector2(p["ax"], p["ay"]) * d
	# (mirrored about its anchor: what was ax from the left edge is ax from the right)
	var offset := Vector2(anchor.x - float(f[3]), -anchor.y) if left else -anchor
	# (what its picture gives off, the bake's part `lights` ({x, y, r, color, a}, game pixels from its top left), each as far from its
	# anchor as it is in the picture, mirrored with it: engine/px.ts flipped, its lights at `w - x` and its anchor at `w - 1/d - ax`)
	var lights: Array = []
	for l in p.get("lights", []):
		var dx: float = float(p["ax"]) - float(l["x"]) + 1.0 / d if left else float(l["x"]) - float(p["ax"])
		lights.append({"dx": dx, "dy": float(l["y"]) - float(p["ay"]), "r": float(l["r"]), "color": l["color"], "a": l.get("a", 0.5)})
	var out := {"tex": tex, "offset": offset, "flip": left, "scale": 2.0 / d, "sheet": int(f[0]), "lights": lights}
	_cache[key] = out
	return out


# --- a figure taken in a move at a time ---

## A sheet, taken in now if it is not in hand (waited for, if it was asked for off the game's thread).
func _sheet(i: int) -> Texture2D:
	if sheets[i] != null:
		return sheets[i]
	_used[i] = Time.get_ticks_msec()
	if _asked.has(i):
		_asked.erase(i)
		sheets[i] = ResourceLoader.load_threaded_get(_paths[i])
	else:
		sheets[i] = load(_paths[i])
	return sheets[i]


## (a figure fetched when it is wanted) All its sheets asked for off the game's thread now, to be in hand when it is first seen.
func fetch() -> void:
	if not deferred or fetched:
		return
	fetched = true
	for n in _paths.size():
		if sheets[n] != null or _asked.has(n):
			continue
		if ResourceLoader.load_threaded_request(_paths[n], "Texture2D") == OK:
			_asked[n] = true


## The sheets of a list asked for off the game's thread, to be in hand when it is played: seen from `side` (0 its front, 1 its
## back: as `frame` has it, fx + fy < -0.2), or from both (-1).
func want(list: String, side := -1) -> void:
	if not lazy or not _names.has(list):
		return
	var now := Time.get_ticks_msec()
	for v in sides:
		if side >= 0 and v != side:
			continue
		for i in _groups.get("%d:%d" % [v, _names[list]], []):
			var n := int(i)
			_used[n] = maxi(_used[n], now)
			if sheets[n] != null or _asked.has(n):
				continue
			if ResourceLoader.load_threaded_request(_paths[n], "Texture2D") == OK:
				_asked[n] = true


## Whether every sheet of a list is in hand (or asked for and come in), from `side` or from both (-1).
func ready(list: String, side := -1) -> bool:
	if not lazy or not _names.has(list):
		return true
	for v in sides:
		if side >= 0 and v != side:
			continue
		for i in _groups.get("%d:%d" % [v, _names[list]], []):
			var n := int(i)
			if sheets[n] == null and not (_asked.has(n) and ResourceLoader.load_threaded_get_status(_paths[n]) == ResourceLoader.THREAD_LOAD_LOADED):
				return false
	return true


## How many of its sheets are in hand now (for the checks).
func held() -> int:
	var n := 0
	for s in sheets:
		if s != null:
			n += 1
	return n


## Those not shown nor asked for these KEEP_MS let go of (once a second at most): the frames cut from them forgotten with them.
func _trim() -> void:
	var now := Time.get_ticks_msec()
	if now - _trimmed < 1000:
		return
	_trimmed = now
	var gone := {}
	for i in sheets.size():
		if now - _used[i] <= KEEP_MS:
			continue
		if sheets[i] != null:
			sheets[i] = null
			gone[i] = true
		elif _asked.has(i):
			_asked.erase(i)
			ResourceLoader.load_threaded_get(_paths[i])
	if gone.is_empty():
		return
	for k in _cache.keys():
		if gone.has(int(_cache[k]["sheet"])):
			_cache.erase(k)
