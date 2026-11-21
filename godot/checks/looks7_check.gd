## THE SEVEN LAST WORDS' LOOKS, HELD AGAINST THE GAME'S OWN PAINTER, DOT FOR DOT. Run from the repository's root:
##   npx tsx tools/godot_words7.ts check [dir]
##   godot --headless --path godot -s res://checks/looks7_check.gd [-- dir]
## The first paints a spread of moments of each look with the game's own render/words7.ts (floorW7, airW7, lightsW7) and writes
## assets/words/looks7_check.json: each moment (what the rules keep then, the looks' own clock and state, moments at work) and,
## of each of its two layers, how many pixels it lays and a sum of them all (each pixel's place and colour), and its lights; and
## a run of its clock (tickW7). This lays the same with scripts/fx_words7.gd and says, a line a moment, whether its pixels are the
## game's; then whether its clock keeps what the game's keeps. With `dir` (where the first wrote every pixel), how many pixels
## differ in each one that is not the same. (looks7_check.json is not kept in the repository: it is made when wanted.)
extends SceneTree

const W7 := preload("res://scripts/fx_words7.gd")


static func _view(v: Dictionary) -> Dictionary:
	var out := v.duplicate(true)
	for z: Dictionary in out["zones"]:
		z["key"] = "%s:%s:%s" % [z["kind"], z["x"], z["y"]]
	return out


static func _layer(w, floor: bool) -> PackedStringArray:
	w._rec = {}
	if floor:
		w.draw_floor(null)
	else:
		w.draw_air(null)
	var lines := PackedStringArray()
	for p: Vector2i in w._rec:
		lines.append("%d,%d,%s" % [p.x, p.y, (w._rec[p] as Color).to_html(false).to_lower()])
	lines.sort()
	return lines


func _init() -> void:
	var path := "res://assets/words/looks7_check.json"
	if not FileAccess.file_exists(path):
		print("LOOKS7 CHECK: no looks7_check.json: run `npx tsx tools/godot_words7.ts check` first")
		quit(1)
		return
	var dump := ""
	var args := OS.get_cmdline_user_args()
	if not args.is_empty():
		dump = args[0]
	var c: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var same := 0
	var differ: Array = []
	var px_all := 0
	var px_bad := 0
	var t0 := Time.get_ticks_usec()
	for s: Dictionary in c["scenes"]:
		var w := W7.new()
		w.clock = float(s["clock"])
		w.view = _view(s["view"])
		for a: Dictionary in s["acts"]:
			w.play(a["word"], a["side"], a)
		for sp: Dictionary in s["splashes"]:
			w.splashes.append(sp.duplicate())
		for b: Array in s["bleeders"]:
			w.bleeders[int(b[0])] = (b[1] as Dictionary).duplicate()
		for hk: Array in s["hot"]:
			w.hot[int(hk[0])] = float(hk[1])
		w.swing = (s["swing"] as Dictionary).duplicate() if s["swing"] != null else null
		var zs: Array = w.view["zones"]
		var pn: Array = s["panes"]
		for i in zs.size():
			if i < pn.size() and pn[i] != null:
				w.panes[zs[i]["key"]] = float(pn[i])
		var said := PackedStringArray()
		var ok := true
		var want_px = null
		if dump != "" and FileAccess.file_exists(dump + "/" + str(s["name"]) + ".json"):
			want_px = JSON.parse_string(FileAccess.get_file_as_string(dump + "/" + str(s["name"]) + ".json"))
		for layer in ["floor", "air"]:
			var lines := _layer(w, layer == "floor")
			var md5 := "\n".join(lines).md5_text()
			var want: Dictionary = s[layer]
			var good: bool = md5 == want["md5"] and lines.size() == int(want["n"])
			px_all += int(want["n"])
			var off := ""
			if not good:
				ok = false
				if want_px != null:
					var got := {}
					for ln in lines:
						var parts := ln.split(",")
						got[parts[0] + "," + parts[1]] = parts[2]
					var theirs: Dictionary = want_px[layer]
					var bad := 0
					for k in theirs:
						if got.get(k, "") != theirs[k]:
							bad += 1
					for k in got:
						if not theirs.has(k):
							bad += 1
					px_bad += bad
					off = ", %d pixels differ" % bad
			said.append("%s %d pixels (the game's %d)%s %s" % [layer, lines.size(), int(want["n"]), off, "the same" if good else "NOT THE SAME"])
		# its lights
		w._rec = null
		var spots: Array = w.spots()
		var want_spots: Array = s["spots"]
		var lit := spots.size() == want_spots.size()
		if lit:
			for i in spots.size():
				for j in 4:
					if absf(float(spots[i][j]) - float(want_spots[i][j])) > 1e-6:
						lit = false
		if not lit:
			ok = false
			said.append("its lights NOT the game's (%s, not %s)" % [str(spots), str(want_spots)])
		if ok:
			same += 1
		else:
			differ.append(s["name"])
		print("LOOKS7 %s: %s" % [s["name"], "; ".join(said)])
	var n: int = c["scenes"].size()
	# THE CLOCK (tickW7): frame by frame, what the game's own clock keeps, and every twentieth frame both layers' pixels
	var ck: Dictionary = c["clock"]
	var dt: float = ck["dt"]
	var w := W7.new()
	var frames: Array = ck["frames"]
	var clock_bad: Array = []
	var drawn := 0
	for k in frames.size():
		var f: Dictionary = frames[k]
		w.view = _view(f["view"])
		w.tick(dt)
		var why := ""
		var want_acts: Array = f["acts"]
		if want_acts.size() != w.acts.size():
			why += " %d moments at work, not %d;" % [w.acts.size(), want_acts.size()]
		else:
			for j in want_acts.size():
				var a: Dictionary = want_acts[j]
				var b: Dictionary = w.acts[j]
				for key in a:
					var x = a[key]
					var y = b[key]
					if key == "ids":
						if str((y as Array).map(func(q): return int(q))) != str((x as Array).map(func(q): return int(q))):
							why += " moment %d's ids %s, not %s;" % [j, y, x]
					elif (x is String and str(y) != x) or ((x is float or x is int) and absf(float(y) - float(x)) > 1e-9):
						why += " moment %d's %s %s, not %s;" % [j, key, y, x]
		if int(f["splashes"]) != w.splashes.size():
			why += " %d splashes, not %d;" % [w.splashes.size(), int(f["splashes"])]
		var want_hot: Dictionary = f["hot"]
		if want_hot.size() != w.hot.size():
			why += " %d kindled, not %d;" % [w.hot.size(), want_hot.size()]
		for key in want_hot:
			if absf(float(w.hot.get(int(key), -1.0)) - float(want_hot[key])) > 1e-9:
				why += " %s kindled %s, not %s;" % [key, w.hot.get(int(key)), want_hot[key]]
		var want_sp: Dictionary = f["spirits"]
		if want_sp.size() != w.spirit_was.size():
			why += " %d spirits, not %d;" % [w.spirit_was.size(), want_sp.size()]
		for key in want_sp:
			var g = w.spirit_was.get(int(key))
			var s2: Dictionary = want_sp[key]
			if g == null or absf(float(g["fx"]) - float(s2["fx"])) > 1e-9 or absf(float(g["fy"]) - float(s2["fy"])) > 1e-9 or absf(float(g["walkT"]) - float(s2["walkT"])) > 1e-9 or bool(g["moving"]) != bool(s2["moving"]):
				why += " spirit %s %s, not %s;" % [key, g, s2]
		var want_car: Array = f["carriers"]
		if want_car.size() != w.carriers.size():
			why += " %d carrying, not %d;" % [w.carriers.size(), want_car.size()]
		if f.has("floor"):
			drawn += 1
			var kept: Array = w.splashes
			w.splashes = []
			# (each look's seed the game's chance gave it)
			var seeds: Array = f["seeds"]
			if seeds.size() == w.acts.size():
				for j in seeds.size():
					w.acts[j]["seed"] = int(seeds[j])
			w.clock = float(f["clock"])
			for layer in ["floor", "air"]:
				var lines := _layer(w, layer == "floor")
				if "\n".join(lines).md5_text() != f[layer]["md5"]:
					why += " its %s %d pixels, not the game's %d;" % [layer, lines.size(), int(f[layer]["n"])]
			w._rec = null
			w.splashes = kept
		if why != "":
			clock_bad.append(k)
			if clock_bad.size() <= 6:
				print("LOOKS7 CLOCK frame %d (%.2f s):%s" % [k, (k + 1) * dt, why])
	print("LOOKS7 CLOCK: %d frames of the game's tickW7 (%.1f s), %d the same as the game's in what it keeps, %d of them drawn dot for dot%s" % [
		frames.size(), frames.size() * dt, frames.size() - clock_bad.size(), drawn, "" if clock_bad.is_empty() else "; NOT: %d frames, the first %d" % [clock_bad.size(), clock_bad[0]]])
	print("LOOKS7 CHECK: %d moments of the seven words' looks, %d dot for dot the game's own%s; %d of the game's pixels laid in all%s; its clock %s (%.1f s)" % [
		n, same, "" if differ.is_empty() else ", NOT: " + ", ".join(differ), px_all, "" if dump == "" or differ.is_empty() else ", %d differing" % px_bad,
		"the game's" if clock_bad.is_empty() else "NOT the game's", (Time.get_ticks_usec() - t0) / 1e6])
	quit(0 if differ.is_empty() and clock_bad.is_empty() else 1)
