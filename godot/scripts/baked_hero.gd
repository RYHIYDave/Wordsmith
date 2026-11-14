## A hero as the game bakes him (tools/bake_heroes.mjs; render/baked.ts BakeFile), read straight from the released
## game's files: `<group>.json` and its sheets `<group>-N.png`.
##   frames: [sheet, x, y, w, h, part] in sheet pixels.  parts: {w, h, ax, ay, density} in GAME pixels, the anchor the
##   ground point under his feet; `density` picture pixels to a game pixel.  keys: one per place (town, dungeon) and
##   veteran or not: `lens[side][list]` how many frames each list has, `at` = [side, list, frame, frame index, ...].
## The lists are known by their place only (art/heroes3.ts bakeLists); the eight sides are in the bake's order
## (art/sides.ts EIGHT_ORDER), each truly painted, never mirrored.
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
var _lists: Array = []  # [side][list] -> PackedInt32Array of frame indices
var _cache := {}


func _init(dir: String, group: String, place := "dungeon") -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("%s/%s.json" % [dir, group]))
	for s in data["sheets"]:
		sheets.append(load("%s/%s" % [dir, s]))
	_frames = data["frames"]
	_parts = data["parts"]
	var key: Dictionary = {}
	for k in data["keys"]:
		if k["place"] == place and not k["vet"]:
			key = k
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


func count(side: int, list: int) -> int:
	return _lists[side][list].size()


## The frame: its picture, and where to hang it from his anchor (Sprite2D offset and scale, in picture pixels at two
## to a game pixel).
func frame(side: int, list: int, i: int) -> Dictionary:
	var idx: int = _lists[side][list][i]
	if _cache.has(idx):
		return _cache[idx]
	var f: Array = _frames[idx]
	var p: Dictionary = _parts[int(f[5])]
	var d := float(p.get("density", 1))
	var tex := AtlasTexture.new()
	tex.atlas = sheets[int(f[0])]
	tex.region = Rect2(f[1], f[2], f[3], f[4])
	var out := {"tex": tex, "offset": -Vector2(p["ax"], p["ay"]) * d, "scale": 2.0 / d}
	_cache[idx] = out
	return out
