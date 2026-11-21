## A hero as the game bakes him (tools/bake_heroes.mjs; render/baked.ts BakeFile), read straight from the released
## game's files: `<group>.json` and its sheets `<group>-N.png`.
##   frames: [sheet, x, y, w, h, part] in sheet pixels.  parts: {w, h, ax, ay, density} in GAME pixels, the anchor the
##   ground point under his feet; `density` picture pixels to a game pixel.  keys: one per place (town, dungeon) and
##   veteran or not: `lens[side][list]` how many frames each list has, `at` = [side, list, frame, frame index, ...].
## The lists are known by their place only (art/heroes3.ts bakeLists); the eight sides are in the bake's order
## (art/sides.ts EIGHT_ORDER), each truly painted, never mirrored.
## A HERO KEPT IN PACKS (render/baked.ts PACKS: the Warlock, the Brawler): what `frames` and the keys' `at` hold is what he always
## holds (each list's first frame); the rest are in `packs`, each one move from one side on a sheet of its own ({name, sheet, frames:
## [x, y, w, h, part], at: [key, side, list, frame, frame's index in the pack]}). Here a pack's sheet is taken in when a frame of it is
## first wanted, and let go of when none of it has been wanted for a while, as the game holds his packs (all of them at once would be
## hundreds of megabytes).
extends RefCounted

const SIDES := ["front", "back", "toward", "frontL", "sideL", "backL", "away", "side"]
const IDLE := 0
const WALK := 2
const ATTACK := 14
const ATTACK2 := 19
const HEAVY := 20

var sheets: Array[Texture2D] = []
var _frames: Array = []
var _parts: Array = []
var _lists: Array = []  # [side][list] -> PackedInt32Array of frame indices (-1: in a pack)
var _cache := {}
var _dir := ""
## (his packs: their sheets' files and frames; where each frame in a pack is, by side, list and frame; the sheets taken in, and when
## each was last wanted)
var _packs: Array = []
var _packed := {}
var _ptex := {}
var _pcache := {}
var _pused := {}
var _ptrim := 0
## (how long a pack not wanted is kept, milliseconds)
const PACK_KEEP := 6000


## `cls`: of a group that holds several heroes (the class cards, `cards`), which. The Brawler is baked only as the veteran
## (game/veteran.ts VETERAN, on): a place with no other key takes its veteran's.
func _init(dir: String, group: String, place := "dungeon", cls := "") -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("%s/%s.json" % [dir, group]))
	for s in data["sheets"]:
		sheets.append(load("%s/%s" % [dir, s]))
	_frames = data["frames"]
	_parts = data["parts"]
	_dir = dir
	var key: Dictionary = {}
	var ki := -1
	var keys: Array = data["keys"]
	for n in keys.size():
		var k: Dictionary = keys[n]
		if k["place"] == place and (cls == "" or k.get("cls", "") == cls) and (key.is_empty() or (key["vet"] and not k["vet"])):
			key = k
			ki = n
	var lens: Array = key["lens"]
	for side in lens.size():
		var per: Array = []
		for n in lens[side]:
			var a := PackedInt32Array()
			a.resize(int(n))
			per.append(a)
		_lists.append(per)
	var at: Array = key["at"]
	for i in range(0, at.size(), 4):
		_lists[int(at[i])][int(at[i + 1])][int(at[i + 2])] = int(at[i + 3])
	var packs: Array = data.get("packs", [])
	for pi in packs.size():
		var pk: Dictionary = packs[pi]
		_packs.append({"sheet": pk["sheet"], "frames": pk["frames"]})
		var pat: Array = pk["at"]
		for n in range(0, pat.size(), 5):
			if int(pat[n]) != ki:
				continue
			var side := int(pat[n + 1])
			var list := int(pat[n + 2])
			var fr := int(pat[n + 3])
			_lists[side][list][fr] = -1
			_packed[_key(side, list, fr)] = Vector2i(pi, int(pat[n + 4]))


static func _key(side: int, list: int, fr: int) -> int:
	return (side * 256 + list) * 4096 + fr


## How many sides he is painted from: eight, or two (the front and the back, mirrored when he faces left: the Warlock's demon).
func sides() -> int:
	return _lists.size()


func count(side: int, list: int) -> int:
	return _lists[side][list].size()


## The frame: its picture, and where to hang it from his anchor (Sprite2D offset and scale, in picture pixels at two
## to a game pixel).
func frame(side: int, list: int, i: int) -> Dictionary:
	var idx: int = _lists[side][list][i]
	if idx < 0:
		return _pack_frame(_packed[_key(side, list, i)])
	if _cache.has(idx):
		return _cache[idx]
	var f: Array = _frames[idx]
	var p: Dictionary = _parts[int(f[5])]
	var d := float(p.get("density", 1))
	var tex := AtlasTexture.new()
	tex.atlas = sheets[int(f[0])]
	tex.region = Rect2(f[1], f[2], f[3], f[4])
	# (`part`: the frame's own numbers, game pixels: its anchor (ax, ay), where its scarf or feather is fixed (`tails`), the pool of
	# light behind it (`aura`))
	var out := {"tex": tex, "offset": -Vector2(p["ax"], p["ay"]) * d, "scale": 2.0 / d, "part": p}
	_cache[idx] = out
	return out


## A frame from a pack (PACKS): its sheet taken in if it is not yet; packs not wanted for PACK_KEEP let go of.
func _pack_frame(at: Vector2i) -> Dictionary:
	var pi := at.x
	var now := Time.get_ticks_msec()
	_pused[pi] = now
	if now - _ptrim > 1000:
		_ptrim = now
		for q in _ptex.keys():
			if now - int(_pused.get(q, 0)) > PACK_KEEP:
				_ptex.erase(q)
				_pcache.erase(q)
	var cache: Dictionary = _pcache.get(pi, {})
	if cache.has(at.y):
		return cache[at.y]
	if not _ptex.has(pi):
		_ptex[pi] = load("%s/%s" % [_dir, _packs[pi]["sheet"]])
	var f: Array = _packs[pi]["frames"][at.y]
	var p: Dictionary = _parts[int(f[4])]
	var d := float(p.get("density", 1))
	var tex := AtlasTexture.new()
	tex.atlas = _ptex[pi]
	tex.region = Rect2(f[0], f[1], f[2], f[3])
	var out := {"tex": tex, "offset": -Vector2(p["ax"], p["ay"]) * d, "scale": 2.0 / d, "part": p}
	cache[at.y] = out
	_pcache[pi] = cache
	return out
