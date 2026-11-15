## LASTING'S, FLEETING'S AND VAST'S LOOKS, HELD AGAINST THE GAME'S OWN PAINTER, DOT FOR DOT. Run from the repository's root:
##   npx tsx tools/godot_words10.ts check [dir]
##   godot --headless --path godot -s res://checks/looks10_check.gd [-- dir]
## The first paints a spread of moments of each look with the game's own render/words10.ts (floorW10, airW10) and writes
## assets/words/looks10_check.json: each moment (what the rules keep then, the looks' own clock, moments at work) and, of each of
## its two layers, how many pixels it lays and a sum of them all (each pixel's place and colour). This lays the same moments
## with scripts/fx_words10.gd and says, a line a moment, whether its pixels are the game's; then how many of all the moments'
## pixels differ. With `dir` (where the first wrote every pixel), how many pixels differ in each one that is not the same.
## (looks10_check.json is not kept in the repository: it is made when wanted.)
extends SceneTree

const W10 := preload("res://scripts/fx_words10.gd")


func _init() -> void:
	var path := "res://assets/words/looks10_check.json"
	if not FileAccess.file_exists(path):
		print("LOOKS10 CHECK: no looks10_check.json: run `npx tsx tools/godot_words10.ts check` first")
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
		var w := W10.new()
		w.clock = float(s["clock"])
		w.fx_clock = float(s["fxClock"])
		w.view = s["view"]
		for a: Dictionary in s["acts"]:
			w.play(a["word"], a["kind"], a)
		for k in s["since"]:
			w.since[k] = float(s["since"][k])
		w.trail = s["trail"]
		var said := PackedStringArray()
		var ok := true
		var want_px = null
		if dump != "" and FileAccess.file_exists(dump + "/" + str(s["name"]) + ".json"):
			want_px = JSON.parse_string(FileAccess.get_file_as_string(dump + "/" + str(s["name"]) + ".json"))
		for layer in ["floor", "air"]:
			w._rec = {}
			if layer == "floor":
				w.draw_floor(null)
			else:
				w.draw_air(null)
			var lines := PackedStringArray()
			var got := {}
			for p: Vector2i in w._rec:
				var hex: String = (w._rec[p] as Color).to_html(false).to_lower()
				lines.append("%d,%d,%s" % [p.x, p.y, hex])
				got["%d,%d" % [p.x, p.y]] = hex
			lines.sort()
			var md5 := "\n".join(lines).md5_text()
			var want: Dictionary = s[layer]
			var good: bool = md5 == want["md5"] and lines.size() == int(want["n"])
			px_all += int(want["n"])
			var off := ""
			if not good:
				ok = false
				if want_px != null:
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
		if ok:
			same += 1
		else:
			differ.append(s["name"])
		print("LOOKS10 %s: %s" % [s["name"], "; ".join(said)])
	var n: int = c["scenes"].size()
	# THE CLOCK (tickW10): frame by frame, what the game's own clock keeps (its moments at work, each with its own time, seed and
	# place; when each state began; his path), and every twentieth frame both layers' pixels
	var ck: Dictionary = c["clock"]
	var dt: float = ck["dt"]
	var w := W10.new()
	var frames: Array = ck["frames"]
	var clock_bad: Array = []
	var drawn := 0
	for k in frames.size():
		var f: Dictionary = frames[k]
		w.view = f["view"]
		w.fx_clock = float(f["fxClock"])
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
					if (x is String and str(y) != x) or (x is bool and bool(y) != x) or ((x is float or x is int) and absf(float(y) - float(x)) > 1e-9):
						why += " moment %d's %s %s, not %s;" % [j, key, y, x]
		var want_since: Dictionary = f["since"]
		if want_since.size() != w.since.size():
			why += " %d states, not %d;" % [w.since.size(), want_since.size()]
		for key in want_since:
			if not w.since.has(key) or absf(float(w.since[key]) - float(want_since[key])) > 1e-9:
				why += " state %s began %s, not %s;" % [key, w.since.get(key), want_since[key]]
		if int(f["trail"]) != w.trail.size():
			why += " his path %d long, not %d;" % [w.trail.size(), int(f["trail"])]
		if f.has("floor"):
			drawn += 1
			for layer in ["floor", "air"]:
				w._rec = {}
				if layer == "floor":
					w.draw_floor(null)
				else:
					w.draw_air(null)
				var lines := PackedStringArray()
				for p: Vector2i in w._rec:
					lines.append("%d,%d,%s" % [p.x, p.y, (w._rec[p] as Color).to_html(false).to_lower()])
				lines.sort()
				if "\n".join(lines).md5_text() != f[layer]["md5"]:
					why += " its %s %d pixels, not the game's %d;" % [layer, lines.size(), int(f[layer]["n"])]
		w._rec = null
		if why != "":
			clock_bad.append(k)
			if clock_bad.size() <= 5:
				print("LOOKS10 CLOCK frame %d (%.2f s):%s" % [k, (k + 1) * dt, why])
	print("LOOKS10 CLOCK: %d frames of the game's tickW10 (%.1f s, his patches, spin, boost and poisons coming and going), %d the same as the game's in what it keeps, %d of them drawn dot for dot%s" % [
		frames.size(), frames.size() * dt, frames.size() - clock_bad.size(), drawn, "" if clock_bad.is_empty() else "; NOT: %d frames, the first %d" % [clock_bad.size(), clock_bad[0]]])
	print("LOOKS10 CHECK: %d moments of the three words' looks, %d dot for dot the game's own%s; %d of the game's pixels laid in all%s; its clock %s (%.1f s)" % [
		n, same, "" if differ.is_empty() else ", NOT: " + ", ".join(differ), px_all, "" if dump == "" or differ.is_empty() else ", %d differing" % px_bad,
		"the game's" if clock_bad.is_empty() else "NOT the game's", (Time.get_ticks_usec() - t0) / 1e6])
	quit(0 if differ.is_empty() and clock_bad.is_empty() else 1)
