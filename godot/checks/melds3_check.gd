## THE TEN MELDED WORDS' LOOKS, HELD AGAINST THE GAME'S OWN, DOT FOR DOT AND CALL FOR CALL. Run from the repository's root:
##   npx tsx tools/godot_melds3.ts check [dir]
##   godot --headless --path godot -s res://checks/melds3_check.gd [-- dir]
## The first runs the game's own render/melds3.ts and writes assets/words/melds3_check.json:
##   THE PAINTERS: moments of every look (what the rules keep then and what M3 keeps, laid by hand), and of each of the three
##     layers (floorM3, airM3, overM3) how many pixels it lays and a sum of them (each one's place, colour and strength), how many
##     ovals it fills and a sum of those; the lights (lightsM3); each monster's tint, slide and rot; how solid he is drawn.
##   THE TELLINGS: each of the rules' tellings the looks answer, through eventsM3 and then tickM3 frame by frame, with
##     Math.random a known run of chances: every call made on the effects with its numbers, what M3 keeps after the telling and
##     after the frames, and the three layers then painted.
## This lays the same with scripts/fx_melds3.gd (its chances the same run) and says, a line each, whether it is the game's; then a
## summing-up line. With `dir` (where the first wrote every pixel), how many pixels differ in a moment that is not the same.
## (melds3_check.json is not kept in the repository: it is made when wanted.)
extends SceneTree

const M3 := preload("res://scripts/fx_melds3.gd")


## The effects as fx_melds3.gd uses them, each call written down as the tool writes the game's.
class Stub extends RefCounted:
	var calls: Array = []
	var room_v := 1.0
	var spikes: Spikes
	var decals: Array = []

	func _init() -> void:
		spikes = Spikes.new()
		spikes.calls = calls

	static func hexes(list) -> Array:
		var out: Array = []
		if list != null:
			for c: Color in list:
				out.append(c.to_html(false))
		return out

	func gx(x: float, y: float) -> float:
		return (x - y) * 16.0

	func gy(x: float, y: float) -> float:
		return (x + y) * 8.0

	func add(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, col: Color, size: float, grav: float, ramp = null, streak := 0.0) -> void:
		calls.append(["add", x, y, z, vx, vy, vz, life, col.to_html(false), size, grav, hexes(ramp), streak])

	func ring(x: float, y: float, r: float, dur: float, colors: PackedColorArray, fill: bool, o := {}) -> void:
		calls.append(["ring", x, y, r, dur, hexes(colors), fill, o.get("heavy", false), o.get("closing", false), o.get("jag", false), o.get("delay", 0.0), o.get("double", false), o.get("swirl", false)])

	func flash(x: float, y: float, z: float, r: float, dur: float, colors: PackedColorArray) -> void:
		calls.append(["flash", x, y, z, r, dur, hexes(colors)])

	func glow(x: float, y: float, r: float, dur: float, _most := 24) -> void:
		calls.append(["glow", x, y, r, dur])

	func flames(x: float, y: float, r: float, n: int, up := 1.0) -> void:
		calls.append(["flames", x, y, r, n, up])

	func hold(s: float) -> void:
		calls.append(["hold", s])

	func kick(v: float) -> void:
		calls.append(["kick", v])

	func room() -> float:
		return room_v


class Spikes extends RefCounted:
	var calls: Array

	func append(d: Dictionary) -> void:
		calls.append(["spike", d["x0"], d["y0"], d["x1"], d["y1"], d["tall"], d["dur"]])


## Whether two things are the same, numbers to a millionth of their size.
static func same(a, b) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		return absf(float(a) - float(b)) <= 1e-6 * maxf(1.0, absf(float(b)))
	if a is bool or b is bool:
		return bool(a) == bool(b) if (a is bool and b is bool) else false
	if a is String or b is String:
		return str(a) == str(b)
	if a == null or b == null:
		return a == null and b == null
	if (a is Array) and (b is Array):
		if a.size() != b.size():
			return false
		for i in a.size():
			if not same(a[i], b[i]):
				return false
		return true
	if (a is Dictionary) and (b is Dictionary):
		for k in b:
			if not a.has(k) or not same(a[k], b[k]):
				return false
		return a.size() == b.size()
	return a == b


## Where two lists of calls first differ, said.
static func first_off(got: Array, want: Array) -> String:
	for i in mini(got.size(), want.size()):
		if not same(got[i], want[i]):
			return "call %d: %s, not the game's %s" % [i, str(got[i]).left(240), str(want[i]).left(240)]
	if got.size() != want.size():
		return "%d calls, not the game's %d" % [got.size(), want.size()]
	return ""


static func view_of(v: Dictionary) -> Dictionary:
	for m: Dictionary in v["monsters"]:
		m["key"] = int(m["key"])
		m["id"] = int(m["id"])
	return v


static func lay(w, l: Dictionary) -> void:
	w.clear()
	for b: Dictionary in l.get("bolts", []):
		w.bolts.append({"pts": PackedFloat64Array(b["pts"]), "t": b["t"], "dur": b["dur"], "C": M3.RAMP[b["C"]], "w": int(b["w"]), "kind": b["kind"], "z": float(b["z"])})
	for s: Dictionary in l.get("skies", []):
		var forks: Array = []
		for f: Dictionary in s["forks"]:
			forks.append({"at": int(f["at"]), "offs": PackedFloat64Array(f["offs"])})
		w.skies.append({"x": s["x"], "y": s["y"], "top": s["top"], "offs": PackedFloat64Array(s["offs"]), "forks": forks, "t": s["t"], "dur": s["dur"], "C": M3.RAMP[s["C"]], "w": int(s["w"])})
	for b: Dictionary in l.get("bombs", []):
		w.bombs.append(b.duplicate())
	for s: Dictionary in l.get("scars", []):
		var lines: Array = []
		for p in s["lines"]:
			lines.append(PackedFloat64Array(p))
		var d: Dictionary = s.duplicate()
		d["lines"] = lines
		d["seed"] = int(s["seed"])
		w.scars.append(d)
	for c: Dictionary in l.get("columns", []):
		w.columns.append(c.duplicate())
	for c: Dictionary in l.get("clamps", []):
		w.clamps.append({"id": int(c["id"]), "t": c["t"], "dur": c["dur"], "big": c["big"], "at": null})
	for s: Dictionary in l.get("slides", []):
		var d: Dictionary = s.duplicate()
		d["id"] = int(s["id"])
		w.slides.append(d)
	var marks: Dictionary = l.get("marks", {})
	for id in marks:
		var k: Dictionary = marks[id]
		w.marks[int(id)] = {"thunder": k["thunder"], "thunder0": k["thunder0"], "blight": k["blight"], "crush": k["crush"], "bite": int(k["bite"])}
	if l.has("flash"):
		var f: Dictionary = l["flash"]
		w.flash = {"t": f["t"], "dur": f["dur"], "color": Color(f["color"]), "a": f["a"]}
	w.heat = int(l.get("heat", 0))
	w.claps = int(l.get("claps", -1))
	w.hidden = bool(l.get("hidden", false))


## The three layers painted, and what the renderer asks besides, held against the game's: a list of what is not the same.
static func paint(w, s: Dictionary, dump: String, name: String) -> PackedStringArray:
	var bad := PackedStringArray()
	var want_px = null
	if dump != "" and FileAccess.file_exists(dump + "/" + name + ".json"):
		want_px = JSON.parse_string(FileAccess.get_file_as_string(dump + "/" + name + ".json"))
	for layer in ["floor", "air", "over"]:
		w._rec = {}
		w._ovals = []
		if layer == "floor":
			w.draw_floor(null)
		elif layer == "air":
			w.draw_air(null)
		else:
			w.draw_over(null)
		var lines := PackedStringArray()
		for p in w._rec:
			lines.append("%s,%s" % [p, w._rec[p]])
		lines.sort()
		var want: Dictionary = s[layer]
		if "\n".join(lines).md5_text() != want["md5"] or lines.size() != int(want["n"]):
			var off := ""
			if want_px != null:
				var theirs: Dictionary = want_px[layer]
				var n := 0
				var shown := ""
				for k in theirs:
					if w._rec.get(k, "") != theirs[k]:
						n += 1
						if shown == "":
							shown = " (%s: %s, not %s)" % [k, w._rec.get(k, "none"), theirs[k]]
				for k in w._rec:
					if not theirs.has(k):
						n += 1
						if shown == "":
							shown = " (%s: %s, the game's none)" % [k, w._rec[k]]
				off = ", %d differ%s" % [n, shown]
			bad.append("%s %d pixels, not the game's %d%s" % [layer, lines.size(), int(want["n"]), off])
		if "\n".join(w._ovals).md5_text() != want["omd5"] or w._ovals.size() != int(want["ovals"]):
			var off := ""
			if want_px != null:
				var theirs: Array = want_px["ovals"][layer]
				for i in mini(theirs.size(), w._ovals.size()):
					if theirs[i] != w._ovals[i]:
						off = " (oval %d: %s, not %s)" % [i, w._ovals[i], theirs[i]]
						break
			bad.append("%s %d ovals, not the game's %d%s" % [layer, w._ovals.size(), int(want["ovals"]), off])
	w._rec = null
	w._ovals = null
	var spots: Array = []
	w.lights_to(func(x: float, y: float, r: float, a: float): spots.append([x, y, r, a]))
	if not same(spots, s["spots"]):
		bad.append("lights %s, not the game's %s" % [str(spots).left(200), str(s["spots"]).left(200)])
	var mons: Array = s["mons"]
	var vm: Array = w.view["monsters"]
	for i in vm.size():
		var tn: Color = w.tint_of(vm[i], w.clock)
		var want: Dictionary = mons[i]
		var tint_ok: bool = (want["tint"] == null and tn.a <= 0.0) or (want["tint"] != null and tn.to_html(false) == want["tint"][0] and absf(tn.a - float(want["tint"][1])) < 1e-6)
		var sh: Vector2 = w.shift_of(vm[i]["key"])
		if not tint_ok or not same([sh.x, sh.y], want["shift"]) or w.rots(vm[i]) != bool(want["rots"]):
			bad.append("monster %d: tint %s, slid %s, rots %s; the game's %s" % [i, tn, sh, w.rots(vm[i]), want])
	if absf(w.hero_alpha() - float(s["alpha"])) > 1e-9:
		bad.append("he is drawn %.4f solid, not the game's %.4f" % [w.hero_alpha(), float(s["alpha"])])
	return bad


func _init() -> void:
	var path := "res://assets/words/melds3_check.json"
	if not FileAccess.file_exists(path):
		print("MELDS3 CHECK: no melds3_check.json: run `npx tsx tools/godot_melds3.ts check` first")
		quit(1)
		return
	var dump := ""
	var args := OS.get_cmdline_user_args()
	if not args.is_empty():
		dump = args[0]
	M3.ready_up()
	var c: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var t0 := Time.get_ticks_usec()
	# ---- THE PAINTERS ----
	var differ: Array = []
	var px_all := 0
	for s: Dictionary in c["scenes"]:
		var w := M3.new()
		var stub := Stub.new()
		w.fx = stub
		w._live = false
		w.view = view_of(s["view"])
		lay(w, s["lay"])
		w.clock = float(s["clock"])
		var bad := paint(w, s, dump, s["name"])
		px_all += int(s["floor"]["n"]) + int(s["air"]["n"]) + int(s["over"]["n"])
		if not bad.is_empty():
			differ.append(s["name"])
		print("MELDS3 %s: floor %d, air %d, over %d pixels; %d ovals; %s" % [s["name"], int(s["floor"]["n"]), int(s["air"]["n"]), int(s["over"]["n"]),
			int(s["floor"]["ovals"]) + int(s["air"]["ovals"]) + int(s["over"]["ovals"]), "the game's" if bad.is_empty() else "NOT THE SAME: " + "; ".join(bad)])
	# ---- THE TELLINGS ----
	var cdiff: Array = []
	var calls_all := 0
	for k: Dictionary in c["cases"]:
		var w := M3.new()
		var stub := Stub.new()
		stub.room_v = float(k["room"])
		for d: Dictionary in k["decals"]:
			stub.decals.append(d.duplicate())
		w.fx = stub
		w._live = false
		var v := view_of(k["view"])
		w.view = v
		w._seq = int(k["seed"])
		if k["name"] == "clock":
			w.marks[6] = {"thunder": 0.0, "thunder0": 0.0, "blight": true, "crush": 9.0, "bite": -1}
		var bad := PackedStringArray()
		var e = k["e"]
		if e != null:
			if M3.owns_event(e) != bool(k["owns"]):
				bad.append("the effects leave it to the look: %s, the game's %s" % [M3.owns_event(e), k["owns"]])
			if k["lookWords"] != null and not same(M3.look_words(e["words"]), k["lookWords"]):
				bad.append("its marks' words %s, not the game's %s" % [M3.look_words(e["words"]), k["lookWords"]])
			w.event(e)
		var k0 := w.kept()
		if not same(k0, k["kept"]):
			for key in k["kept"]:
				if not same(k0.get(key), k["kept"][key]):
					bad.append("kept after the telling, its %s %s, not the game's %s" % [key, str(k0.get(key)).left(200), str(k["kept"][key]).left(200)])
		for dt in k["ticks"]:
			stub.calls.append(["tick", dt])
			v["time"] = float(v["time"]) + float(dt)
			w.tick(float(dt))
		var k1 := w.kept()
		if not same(k1, k["kept1"]):
			for key in k["kept1"]:
				if not same(k1.get(key), k["kept1"][key]):
					bad.append("kept after its frames, its %s %s, not the game's %s" % [key, str(k1.get(key)).left(200), str(k["kept1"][key]).left(200)])
		var off := first_off(stub.calls, k["calls"])
		if off != "":
			bad.append(off)
		if stub.decals.size() != int(k["decalsLeft"]):
			bad.append("%d marks on the floor left, not the game's %d" % [stub.decals.size(), int(k["decalsLeft"])])
		w.clock = float(k["clock"])
		bad.append_array(paint(w, k, dump, k["name"]))
		calls_all += (k["calls"] as Array).size()
		if not bad.is_empty():
			cdiff.append(k["name"])
		print("MELDS3 TELLING %s: %d calls on the effects, %d frames, painted floor %d, air %d, over %d pixels; %s" % [k["name"], (k["calls"] as Array).size(), (k["ticks"] as Array).size(),
			int(k["floor"]["n"]), int(k["air"]["n"]), int(k["over"]["n"]), "the game's" if bad.is_empty() else "NOT THE SAME: " + "; ".join(bad)])
	var n: int = c["scenes"].size()
	var m: int = c["cases"].size()
	print("MELDS3 CHECK: %d moments of the ten melded words' looks, %d dot for dot the game's own%s (%d of the game's pixels); %d of the rules' tellings, %d call for call and dot for dot the game's%s (%d calls); %.1f s" % [
		n, n - differ.size(), "" if differ.is_empty() else ", NOT: " + ", ".join(differ), px_all, m, m - cdiff.size(), "" if cdiff.is_empty() else ", NOT: " + ", ".join(cdiff), calls_all, (Time.get_ticks_usec() - t0) / 1e6])
	quit(0 if differ.is_empty() and cdiff.is_empty() else 1)
