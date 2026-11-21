## FLOOR 20'S BOSS, THE MOTH MADE GHOSTLY: HER ATTACKS' LOOKS, HELD AGAINST THE GAME'S OWN PAINTERS, fillRect FOR fillRect. Run from the
## repository's root:
##   npx tsx tools/godot_moth.ts check [dir]
##   godot --headless --path godot -s res://checks/moth_check.gd [-- dir]
## The first runs the game's own art/moth2_fx.ts on a spread of moments of each of her painters (the ghost wing, the moon, her shadow
## and what rises out of it, the phantoms gathering and gliding, the Hush's ground and its snow, the pages tearing loose, the ring of
## pages, her death's motes and lights) on a canvas that keeps every fillRect laid (where, how big, its colour, its alpha) and every
## light given off, and the words flying home as her death paints them (art/moth_fx.ts wordsPainted), pixel by pixel; and writes
## assets/act3/moth_check.json. This lays the same with scripts/act3/moth_paint.gd and says, a line a moment, whether it is the
## game's. With `dir` (where the first wrote every one), the first call of each that differs. (moth_check.json is not kept in the
## repository: it is made when wanted.)
extends SceneTree

const MP := preload("res://scripts/act3/moth_paint.gd")


static func _at(x: float, y: float) -> Array:
	return [(x - y) * 16.0 + 480.0, (x + y) * 8.0 + 40.0]


func _init() -> void:
	var path := "res://assets/act3/moth_check.json"
	if not FileAccess.file_exists(path):
		print("MOTH CHECK: no moth_check.json: run `npx tsx tools/godot_moth.ts check` first")
		quit(1)
		return
	var dump := ""
	var args := OS.get_cmdline_user_args()
	if args.size() > 0:
		dump = args[0]
	var C: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var at := Callable(self, "_at_c")
	var same := 0
	var all := 0
	for s: Dictionary in C["scenes"]:
		all += 1
		var g := MP.Pen.new()
		g.rec = []
		var spots: Array = []
		var spot := func(x: float, y: float, r: float, a: float) -> void: spots.append([x, y, r, a])
		var A: Array = s["args"]
		match str(s["painter"]):
			"ghost_wing":
				MP.draw_ghost_wing(g, at, A[0], A[1], A[2], A[3], A[4], spot)
			"moon":
				MP.draw_moon(g, A[0], A[1], A[2], A[3], spot)
			"eclipse":
				MP.draw_eclipse(g, at, A[0], A[1], A[2], A[3], A[4], A[5], A[6], A[7], spot, A[8])
			"phantoms_gather":
				MP.draw_phantoms_gather(g, at, A[0], A[1], A[2], A[3], A[4], A[5], A[6])
			"phantoms":
				MP.draw_phantoms(g, at, A[0], A[1], A[2], A[3], A[4], spot)
			"hush_ground":
				MP.draw_hush_ground(g, at, A[0], A[1], A[2], A[3], A[4], spot)
			"hush_snow":
				MP.draw_hush_snow(g, at, A[0], A[1], A[2], A[3], spot)
			"pages_loosing":
				MP.draw_pages_loosing(g, at, A[0], A[1], A[2], A[3], spot)
			"unwriting_ground":
				MP.draw_unwriting_ground(g, at, A[0], A[1], A[2], A[3], A[4])
			"unwriting_pages":
				MP.draw_unwriting_pages(g, at, A[0], A[1], A[2], A[3], A[4], spot)
			"death_motes":
				var x: float = A[0]
				var y: float = A[1]
				var fx: float = A[2]
				var fy: float = A[3]
				MP.draw_death_motes(g, A[4], func(i: int) -> Array:
					var q: Array = MP.data()["motes"][i]["q"]
					var w := MP.art_to_world(x, y, fx, fy, q)
					var p := _at(w[0], w[1])
					return [p[0], float(p[1]) - float(q[2]) / 2.0])
			"death_lights":
				MP.death_lights(A[0], A[1], A[2], A[3], spot)
		var calls: PackedStringArray = PackedStringArray(g.rec)
		var md5 := "\n".join(calls).md5_text()
		var sp_ok: bool = spots.size() == s["spots"].size()
		if sp_ok:
			for i in spots.size():
				for j in 4:
					if absf(float(spots[i][j]) - float(s["spots"][i][j])) > 1e-3:
						sp_ok = false
		var ok: bool = md5 == s["md5"] and calls.size() == int(s["n"]) and sp_ok
		if ok:
			same += 1
		var told := "%s %s: %d calls (the game's %d)%s" % ["SAME" if ok else "DIFFERENT", s["name"], calls.size(), int(s["n"]), "" if sp_ok else ", its lights differ"]
		if not ok and dump != "" and FileAccess.file_exists("%s/%s.txt" % [dump, s["name"]]):
			var theirs := FileAccess.get_file_as_string("%s/%s.txt" % [dump, s["name"]]).split("\n")
			for i in maxi(theirs.size(), calls.size()):
				var a := calls[i] if i < calls.size() else "-"
				var b := theirs[i] if i < theirs.size() else "-"
				if a != b:
					told += "; first differs at %d: ours %s, the game's %s" % [i, a, b]
					break
		print(told)
	for w: Dictionary in C["words"]:
		all += 1
		var px := {}
		for c in MP.words_at(w["t"], w["view"] == "back"):
			px["%d,%d" % [c[0], c[1]]] = str(c[2]).trim_prefix("#").to_lower()
		var lines := PackedStringArray()
		for k in px:
			lines.append("%s,%s" % [k, px[k]])
		lines.sort()
		var ok: bool = "\n".join(lines).md5_text() == w["md5"] and lines.size() == int(w["n"])
		if ok:
			same += 1
		print("%s words_%s_t%s: %d pixels (the game's %d)" % ["SAME" if ok else "DIFFERENT", w["view"], w["t"], lines.size(), int(w["n"])])
	print("MOTH CHECK: %d moments, %d the game's own" % [all, same])
	quit(0 if same == all else 1)


func _at_c(x: float, y: float) -> Array:
	return _at(x, y)
