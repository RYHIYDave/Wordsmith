## THE SIX ENEMIES MADE LIVELIER (the browser art's ENEMIES8, baked into assets/monsters at his yes, 26 Nov 2026: “Yes, put
## them in (Recommended)”): `--only=enemies8 --shots=<dir>`. Each of the six (the marksman, the shade, the cultist, the high
## priest, the scribe, the swan) taken in as the game takes a monster (baked_figure.gd), its lists as many frames as the art
## names (lists.json), every frame a picture on its sheet; and one picture of all six, standing, walking and dying, drawn by
## the game's own frames over a plain ground.
extends RefCounted

const BakedFigure := preload("res://scripts/baked_figure.gd")
const DIR := "res://assets/monsters"
const SIX := ["marksman", "shade", "cultist", "priest", "scribe", "swan"]
## (the lens the art gives each, front and back alike: idle, walk, attack, die, then its own; tools/godot_monster_lists.ts)
const LENS := {
	"marksman": [24, 8, 39, 39, 10, 81], "shade": [12, 8, 27, 21, 11], "cultist": [12, 8, 60, 20],
	"priest": [12, 8, 33, 31, 43], "scribe": [30, 10, 42, 49, 12], "swan": [36, 12, 33, 49, 15],
}

var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("ENEMIES8 %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(M, _hero, dir: String) -> void:
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/lists.json"))
	var layer := CanvasLayer.new()
	layer.layer = 100
	M.add_child(layer)
	var ground := ColorRect.new()
	ground.color = Color("#2a2838")
	ground.size = Vector2(4000, 4000)
	layer.add_child(ground)
	var shows := [["idle", 0.4], ["walk", 0.25], ["walk", 0.6], ["die", 0.5], ["die", 1.0]]
	for r in SIX.size():
		var name: String = SIX[r]
		var f = BakedFigure.new(DIR, name, info)
		var lists: Array = info[name]["lists"]
		var want: Array = LENS[name]
		var counts: Array = []
		for l in lists:
			counts.append(f.count(0, str(l["name"])))
		_line(counts == want, "%s: lists %s, frames %s (the art's: %s)" % [name, str(lists.map(func(l): return l["name"])), str(counts), str(want)])
		# every frame of every list a picture on its sheet
		var empty := 0
		for l in lists:
			for i in f.count(0, str(l["name"])):
				var fr: Dictionary = f.frame(1.0, 1.0, str(l["name"]), i)
				var tex: AtlasTexture = fr["tex"]
				if tex.atlas == null or tex.region.size.x < 1.0 or tex.region.size.y < 1.0:
					empty += 1
		_line(empty == 0, "%s: every frame of every list has its picture (%d without)" % [name, empty])
		for c in shows.size():
			var list: String = shows[c][0]
			var i := int(float(f.count(0, list) - 1) * float(shows[c][1]))
			var fr: Dictionary = f.frame(1.0, 1.0, list, i)
			var s := Sprite2D.new()
			s.texture = fr["tex"]
			s.centered = false
			s.offset = fr["offset"]
			s.flip_h = fr["flip"]
			s.scale = Vector2.ONE * float(fr["scale"]) * 0.5
			s.position = Vector2(90 + c * 120, 110 + r * 100)
			layer.add_child(s)
	await M._snap(dir + "/enemies8_in_app.png")
	layer.queue_free()
	print("ENEMIES8: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
