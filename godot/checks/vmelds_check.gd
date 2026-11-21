## VOLATILE'S FIVE MELDS' AND THE EIGHT MELDS ACROSS THE GROUPS' LOOKS, HELD AGAINST THE GAME'S OWN PAINTERS, DOT FOR DOT. Run
## from the repository's root:
##   npx tsx tools/godot_vmelds.ts check [dir]
##   godot --headless --path godot -s res://checks/vmelds_check.gd [-- dir]
## The first runs a spread of scenes through the game's own render/volatile3.ts (eventsV3, tickV3, floorV3, airV3, overV3,
## lightsV3, shiftV3, tintV3) and render/melds8.ts (M8Fx), frame by frame on a fake game, their chance a sequence of the check's own,
## and writes assets/words/vmelds_check.json: each scene and, of each painted frame, each layer's fills (place, size, colour,
## strength, in order) summed, its lights, what it lays over the monsters, and what it has thrown into the effects. This runs the
## same scenes through scripts/fx_volatile3.gd and fx_melds8.gd, the same chance, and says a line a scene whether every one of its
## frames is the game's; then the sum, VMELDS CHECK. With `dir` (where the first wrote every line), where the first two differ.
## (vmelds_check.json is not kept in the repository: it is made when wanted.)
extends SceneTree

const V3 := preload("res://scripts/fx_volatile3.gd")
const M8 := preload("res://scripts/fx_melds8.gd")


## THE EFFECTS, the check's: what is thrown into them taken down as the game's check takes it (its lists' limits from empty).
class Rec:
	var lines: Array = []
	var parts := 0
	var lit := 0

	func q(v: float) -> String:
		return str(int(floorf(v * 10000.0 + 0.5)))

	func hex(c: Color) -> String:
		return c.to_html(false).to_lower()

	func cols(list) -> String:
		if list == null:
			return "-"
		var out := PackedStringArray()
		for c in list:
			out.append(hex(c))
		return "/".join(out)

	func gx(x: float, y: float) -> float:
		return (x - y) * 16.0

	func gy(x: float, y: float) -> float:
		return (x + y) * 8.0

	func room() -> float:
		return 1.0

	func add(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, col: Color, size: float, grav: float, ramp = null, streak := 0.0) -> void:
		if parts >= 900:
			return
		parts += 1
		lines.append("p,%s,%s,%s,%s,%s,%s,%s,%s,%d,%s,%s,%s" % [q(x), q(y), q(z), q(vx), q(vy), q(vz), q(life), hex(col), int(size), q(grav), cols(ramp), q(streak)])

	func ring(x: float, y: float, r: float, dur: float, colors: PackedColorArray, fill: bool, o := {}) -> void:
		lines.append("o,%s,%s,%s,%s,%s,%d,%d,%d,%d,%s,%d" % [q(x), q(y), q(r), q(dur), cols(colors), 1 if fill else 0, 1 if o.get("heavy", false) else 0,
			1 if o.get("closing", false) else 0, 1 if o.get("jag", false) else 0, q(float(o.get("delay", 0.0))), 1 if o.get("double", false) else 0])

	func flash(x: float, y: float, z: float, r: float, dur: float, colors: PackedColorArray) -> void:
		lines.append("l,%s,%s,%s,%s,%s,%s" % [q(x), q(y), q(z), q(r), q(dur), cols(colors)])

	func glow(x: float, y: float, r: float, dur: float) -> void:
		if lit >= 24:
			return
		lit += 1
		lines.append("w,%s,%s,%s,%s" % [q(x), q(y), q(r), q(dur)])

	func flames(x: float, y: float, r: float, n: int, up := 1.0) -> void:
		lines.append("f,%s,%s,%s,%d,%s" % [q(x), q(y), q(r), n, q(up)])

	func bubbles(x: float, y: float, r: float, n: int) -> void:
		lines.append("b,%s,%s,%s,%d" % [q(x), q(y), q(r), n])

	func hold(s: float) -> void:
		lines.append("h,%s" % q(s))

	func kick(v: float) -> void:
		lines.append("k,%s" % q(v))


func _init() -> void:
	var path := "res://assets/words/vmelds_check.json"
	if not FileAccess.file_exists(path):
		print("VMELDS CHECK: no vmelds_check.json: run `npx tsx tools/godot_vmelds.ts check` first")
		quit(1)
		return
	var dump := ""
	var args := OS.get_cmdline_user_args()
	if not args.is_empty():
		dump = args[0]
	var c: Dictionary = _exact(JSON.parse_string(FileAccess.get_file_as_string(path)))
	var dt: float = c["dt"]
	var same := 0
	var differ: Array = []
	var frames_all := 0
	var lines_all := 0
	var t0 := Time.get_ticks_usec()
	for s: Dictionary in c["scenes"]:
		var rec := Rec.new()
		var v3 := V3.new()
		v3.fx = rec
		v3.seeded = true
		v3.seed = 7
		var m8 := M8.new()
		m8.fx = rec
		var mons: Array = []
		for m: Dictionary in s["pack"]:
			mons.append({"id": int(m["id"]), "x": float(m["x"]), "y": float(m["y"]), "dead": false, "vx": 0.0, "vy": 0.0})
		var hx: float = s["hero0"]["x"]
		var hy: float = s["hero0"]["y"]
		var zones: Array = []
		var clock := 0.37
		var paint: Array = s["paint"]
		var want: Array = s["frames"]
		var wi := 0
		var bad := ""
		for f in int(s["count"]):
			if s.has("hero"):
				hx += float(s["hero"]["vx"])
				hy += float(s["hero"]["vy"])
			for a: Dictionary in s["acts"]:
				if int(a["at"]) == f:
					for w in a.get("walk", []):
						for m in mons:
							if m["id"] == int(w[0]):
								m["vx"] = float(w[1])
								m["vy"] = float(w[2])
			for m in mons:
				m["x"] = float(m["x"]) + float(m["vx"])
				m["y"] = float(m["y"]) + float(m["vy"])
			for z: Dictionary in zones:
				z["t"] = float(z["t"]) + dt
			for a: Dictionary in s["acts"]:
				if int(a["at"]) != f:
					continue
				for id in a.get("kill", []):
					for m in mons:
						if m["id"] == int(id):
							m["dead"] = true
				for i in a.get("lift", []):
					zones.remove_at(int(i))
				for z: Dictionary in a.get("lay", []):
					zones.append(z.duplicate(true))
			for i in range(zones.size() - 1, -1, -1):
				if zones[i]["kind"] != "rune" and float(zones[i]["t"]) >= float(zones[i]["dur"]):
					zones.remove_at(i)
			# (what the looks read: the monsters as they are now, the same things from frame to frame)
			var alive: Array = []
			for m in mons:
				if not m["dead"]:
					if not m.has("top"):
						m["top"] = float(s["top"])
						m["half"] = float(s["half"])
					alive.append(m)
			v3.mons = alive
			v3.zones = zones
			v3.hero_x = hx
			v3.hero_y = hy
			m8.mons = alive
			m8.hero_x = hx
			m8.hero_y = hy
			for a: Dictionary in s["acts"]:
				if int(a["at"]) != f:
					continue
				for e: Dictionary in a.get("v3", []):
					v3.event(e)
				for e: Dictionary in a.get("m8", []):
					var t := e.duplicate()
					t["t"] = "meld8"
					m8.handle(t)
			m8.update(dt)
			v3.tick(dt)
			clock += dt
			if not paint.has(float(f)) and not paint.has(f):
				continue
			var got := {}
			for layer in ["floor", "air", "over", "ground8", "air8"]:
				var lines: Array = []
				if layer.ends_with("8"):
					m8._rec = lines
					if layer == "ground8":
						m8.draw_ground(null)
					else:
						m8.draw_air(null)
					m8._rec = null
				else:
					v3._rec = lines
					if layer == "floor":
						v3.draw_floor(null, clock)
					elif layer == "air":
						v3.draw_air(null, clock)
					else:
						v3.draw_over(null, clock)
					v3._rec = null
				got[layer] = lines
			var lights: Array = []
			v3.lights(func(x: float, y: float, r: float, a: float) -> void: lights.append("%s,%s,%s,%s" % [rec.q(x), rec.q(y), rec.q(r), rec.q(a)]), clock)
			got["lights"] = lights
			var figs: Array = []
			for m: Dictionary in alive:
				var sh: Vector2i = v3.shift_of(m["id"])
				var tn: Array = v3.tint_of(m["id"], clock)
				figs.append("%d,%d,%d,%s" % [int(m["id"]), sh.x, sh.y, ("%s,%s" % [rec.hex(tn[0]), rec.q(tn[1])]) if not tn.is_empty() else "-"])
			got["figs"] = figs
			got["fx"] = rec.lines.duplicate()
			frames_all += 1
			var w: Dictionary = want[wi]
			wi += 1
			for k in got:
				var lines: Array = got[k]
				lines_all += lines.size()
				var md5 := "\n".join(PackedStringArray(lines)).md5_text()
				var sum: Dictionary = w["sums"][k]
				if md5 != sum["md5"] or lines.size() != int(sum["n"]):
					var at := ""
					var file: String = "%s/%s_%d.json" % [dump, s["name"], f]
					if dump != "" and FileAccess.file_exists(file):
						var theirs: Array = JSON.parse_string(FileAccess.get_file_as_string(file))[k]
						for j in maxi(theirs.size(), lines.size()):
							var a: String = theirs[j] if j < theirs.size() else "(none)"
							var b: String = lines[j] if j < lines.size() else "(none)"
							if a != b:
								at = " first at line %d: the game's %s, here %s" % [j, a, b]
								break
					if bad == "":
						bad = "frame %d, %s: %d lines, the game's %d%s" % [f, k, lines.size(), int(sum["n"]), at]
						if dump != "":
							var mine := FileAccess.open("%s/%s_%d_%s.here.txt" % [dump, s["name"], f, k], FileAccess.WRITE)
							mine.store_string("\n".join(PackedStringArray(lines)))
							mine.close()
		if bad == "":
			same += 1
			print("VMELDS %s: %d frames painted, every one the game's" % [s["name"], want.size()])
		else:
			differ.append(s["name"])
			print("VMELDS %s: NOT THE SAME: %s" % [s["name"], bad])
	print("VMELDS CHECK: %d scenes of the five's and the eight's looks, %d of them dot for dot the game's own%s; %d frames, %d lines of the game's held (%.1f s)" % [
		c["scenes"].size(), same, "" if differ.is_empty() else ", NOT: " + ", ".join(differ), frames_all, lines_all, (Time.get_ticks_usec() - t0) / 1e6])
	quit(0 if differ.is_empty() else 1)


## The game's numbers as they were: one not whole is written as '~' and its exact bits (Godot reads decimals back a little off).
static func _exact(v):
	if v is String and v.begins_with("~") and v.length() == 17:
		return v.substr(1).hex_decode().decode_double(0)
	if v is Array:
		for i in v.size():
			v[i] = _exact(v[i])
	elif v is Dictionary:
		for k in v.keys():
			v[k] = _exact(v[k])
	return v
