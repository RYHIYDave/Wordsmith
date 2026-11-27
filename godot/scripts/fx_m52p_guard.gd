## GUARDING'S SIX, PAINTED (the Floor 6–10 Meld Animations, approved 23 Nov 2026), with the kit's brushes (fx_m52kit.gd). Guarding's
## own shell round him, flaring where a blow strikes, and its ward circle with a shield at each quarter, stay as the game draws them
## (fx_words610.gd); each meld dresses them in its own colour and its own way, and has its moment:
##   BULWARK    his shell with a boss at its front, glowing; his hits while it holds landing with a hot flash; its ward pulsing red
##              as the might builds in it.
##   HEMLOCK    his shell bristling with thorns; what strikes it spattered with venom; its ward's floor slick and bubbling.
##   CINDERWARD his shell with embers drifting in it, bursting outward in a ring of flame as it breaks; its ward ringed in low flames.
##   STATIC     his shell crackling; what strikes it struck back by a bolt; its ward's edge crackling.
##   WINDWARD   his shell with wind streaming over it, streaks trailing his steps; its ward with wind swirling in it.
##   FORTRESS   his shell thick as stone, in blocks; blows clanging off it in sparks; its ward with a standing stone at each quarter.
## On a monster carrying one, its shield dressed the same while it holds; and (the check of 26 Nov 2026: these never played on a
## monster) Hemlock's thorns lashing out of it at him as he strikes it, venom spattering him; Static's bolt out of it into him, its
## shell flaring; Cinderward's shell bursting outward in a ring of flame as it breaks.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["bulwark", "hemlock", "cinderward", "static", "windward", "fortress"]
const ROCK := [Color("#1a1c16"), Color("#3a3e30"), Color("#5c6248"), Color("#8e9868"), Color("#b8c094"), Color("#e4ecc8")]


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var R := ramp(b["id"])
	match "%s:%s" % [b["id"], b["what"]]:
		"bulwark:hot":
			b["end"] = 0.25
		"hemlock:thorns":
			b["end"] = 0.4
			for i in 12:
				_bit(b["x"], b["y"], 12, "dot", PackedColorArray([R[3], R[4], R[5]]), 1.8, 0.5, 120, 20, 60)
		"hemlock:foe":
			b["end"] = 0.45
			for i in 12:
				_bit(b["x"], b["y"], 12, "dot", PackedColorArray([R[3], R[4], R[5]]), 1.6, 0.5, 120, 20, 60)
		"cinderward:burst", "cinderward:foe":
			b["end"] = 0.6
			for i in 22:
				_bit(b["x"], b["y"], 8, "streak", PackedColorArray([FIRE[2], FIRE[3], FIRE[4], FIRE[5]]), 4.0, 0.5, -20, 30, 90)
			fx.kick(2.0)
		"static:zap", "static:foe":
			b["end"] = 0.25
		"fortress:clang":
			b["end"] = 0.3
			for i in 10:
				_bit(b["x"], b["y"], 14, "streak", PackedColorArray([Color("#ffd060"), Color("#fff4c8"), Color.WHITE]), 3.6, 0.3, 160, 20, 90)
		_:
			return false
	return true


## The shell round one (on the screen, its middle at cx, cy; rx, ry its size), dressed as meld `id` dresses it.
func _shell(id: String, cx: float, cy: float, rx: float, ry: float, sd: int) -> void:
	var R := ramp(id)
	var n := 28
	for i in n:
		var a := float(i) / n * TAU
		var x := cx + cos(a) * rx
		var y := cy + sin(a) * ry
		var lit := 0.55 + 0.45 * sin(a + PI * 0.75)
		match id:
			"fortress":
				# (thick as stone, in blocks)
				_ga(0.9)
				_fs(ROCK[2] if i % 3 else ROCK[1])
				_fill(_ri(x) - 1, _ri(y) - 1, 3, 3)
				_fs(ROCK[4] if lit > 0.7 else ROCK[3])
				_fill(_ri(x) - 1, _ri(y) - 1, 2, 2)
			_:
				# (under OWN, on him: Guarding's own shell is the ring)
				if not _on_his:
					_ga(0.55 + 0.35 * lit)
					_fs(R[4] if lit > 0.7 else R[3])
					_fill(_ri(x), _ri(y), 1, 1)
		match id:
			"hemlock":
				if i % 2 == 0:
					# (a thorn standing out of it)
					_ga(1.0)
					_fs(R[1])
					_line(x, y, cx + cos(a) * (rx + 7.0), cy + sin(a) * (ry + 7.0), 2)
					_fs(R[4])
					_line(x, y, cx + cos(a) * (rx + 6.0), cy + sin(a) * (ry + 6.0), 1)
					_fs(R[5])
					_fill(_ri(cx + cos(a) * (rx + 7.0)), _ri(cy + sin(a) * (ry + 7.0)), 1, 1)
			"static":
				if _rh(sd + int(t * 20.0), i) < 0.35:
					var j := (_rh(sd + int(t * 30.0), i + 50) - 0.5) * 12.0
					var x2 := x + j
					var y2 := y - 5.0
					_ga(1.0)
					_fs(R[3])
					_line(x, y, x2, y2, 2)
					_fs(Color.WHITE)
					_line(x, y, x2, y2, 1)
					_line(x2, y2, x2 - j * 0.5, y2 - 4.0, 1)
					_glow(x, y, 9.0, R[4], 0.7)
	match id:
		"bulwark":
			# (the boss at its front: a riveted iron stud, a spike at its heart, glowing)
			# (on the shell's rim, low at its front corner, beside him, not on him: his Art Rulebook's Animations 4)
			var bx := cx + rx * 0.62
			var by := cy + ry * 0.62
			_glow(bx, by, 9.0, R[4], 0.5)
			_disc(bx, by, 3.0, [R[0], R[2], R[3], R[4], R[5]])
			for k in 4:
				var ka := float(k) * PI * 0.5 + PI * 0.25
				_fs(R[1])
				_fill(_ri(bx + cos(ka) * 5.0) - 1, _ri(by + sin(ka) * 5.0) - 1, 2, 2)
				_fs(R[4])
				_fill(_ri(bx + cos(ka) * 5.0) - 1, _ri(by + sin(ka) * 5.0) - 1, 1, 1)
			_fs(R[5])
			_fill(_ri(bx) - 1, _ri(by) - 2, 1, 2)
			_fs(R[5])
			_fill(_ri(cx) - 2, _ri(cy + ry * 0.2) - 2, 2, 2)
			_glow(cx, cy + ry * 0.2, 14.0, R[4], 0.6)
			_glow(cx, cy, rx + 6.0, R[3], 0.35)
		"cinderward":
			# (embers drifting in it)
			for k in 12:
				var u := fmod(t * 0.6 + _rh(sd, k), 1.0)
				var x := cx + (_rh(sd, k + 9) - 0.5) * rx * 1.4
				var y := cy + ry * 0.7 - u * ry * 1.6
				_ga(1.0 - u)
				_fs(FIRE[4] if k % 2 else FIRE[3])
				_fs(FIRE[2])
				_fill(_ri(x) - 1, _ri(y) - 1, 4, 4)
				_fs(FIRE[5] if k % 2 else FIRE[4])
				_fill(_ri(x), _ri(y), 2, 2)
				_glow(x, y, 8.0, FIRE[3], 0.6 * (1.0 - u))
			# (and the fire in it licking up from its foot)
			_flames(cx, cy + ry * 0.9, 5, rx * 1.4, 9.0, 0.85, PackedColorArray([FIRE[5], FIRE[4], FIRE[3], FIRE[2]]), sd)
			_glow(cx, cy, rx + 4.0, FIRE[3], 0.3)
		"windward":
			# (wind streaming over it)
			for k in 3:
				var a0 := t * 7.0 + float(k) * TAU / 3.0
				for i in 12:
					var a := a0 - i * 0.14
					var x := cx + cos(a) * (rx + 3.0)
					var y := cy + sin(a) * (ry + 3.0) * 0.6 + float(k - 1) * 6.0
					_ga(1.0 - i / 14.0)
					_fs(R[1])
					_fill(_ri(x) - 2, _ri(y) - 1, 5, 3)
					_fs(R[3])
					_fill(_ri(x) - 1, _ri(y), 4, 2)
					_fs(R[5] if i < 4 else R[4])
					_fill(_ri(x), _ri(y), 3, 1)
				_glow(cx + cos(a0) * (rx + 3.0), cy + sin(a0) * (ry + 3.0) * 0.6, 10.0, R[4], 0.6)
		"fortress":
			_glow(cx, cy, rx + 4.0, ROCK[4], 0.2)
	_ga(1.0)


func paint_floor(b: Dictionary) -> void:
	if b["id"] == "cinderward" and b["what"] in ["burst", "foe"]:
		var u := _ease(float(b["t"]) / 0.45)
		var fade := _c01((0.6 - float(b["t"])) / 0.25)
		var r: float = b["r"]
		var n := 18
		for i in n:
			var a := float(i) / n * TAU
			var x: float = float(b["x"]) + cos(a) * r * u * 0.7
			var y: float = float(b["y"]) + sin(a) * r * u * 0.7
			_flames(_wx(x, y), _wy(x, y), 1, 2.0, 12.0 * (1.0 - u * 0.5), fade, PackedColorArray([FIRE[5], FIRE[4], FIRE[3], FIRE[2]]), int(b["seed"]) + i)
		_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]), r * 22.0 * u + 10.0, FIRE[3], 0.6 * fade)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	match "%s:%s" % [b["id"], b["what"]]:
		"bulwark:hot":
			if not b.get("minor", false):
				var p := _mid_px(b)
				_glow(p.x, p.y, 26.0, FIRE[4], 0.8 * (1.0 - bt / 0.25))
				_glow(p.x, p.y, 14.0, Color.WHITE, 0.6 * (1.0 - bt / 0.25))
		"static:zap":
			_bolt(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 14.0, _wx(b["x1"], b["y1"]), _wy(b["x1"], b["y1"]) - 12.0, R, int(b["seed"]), 1.0 - _c01((bt - 0.12) / 0.13), 2)
		"static:foe":
			# (out of its shell into him: the bolt, and its shell flaring where it leapt from)
			var fade := 1.0 - _c01((bt - 0.12) / 0.13)
			var sx := _wx(b["x1"], b["y1"])
			var sy := _wy(b["x1"], b["y1"]) - 14.0
			_bolt(sx, sy, _wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 8.0, R, int(b["seed"]), fade, 2)
			_glow(sx, sy, 22.0, R[4], 0.8 * fade)
			_glow(sx, sy, 10.0, Color.WHITE, 0.6 * fade)
			for k in 5:
				var a := _rh(int(b["seed"]), k + int(bt * 30.0)) * TAU
				_ga(fade)
				_fs(R[5])
				_line(sx + cos(a) * 6.0, sy + sin(a) * 5.0, sx + cos(a) * 12.0, sy + sin(a) * 9.0, 1)
		"hemlock:foe":
			# (thorns lashing out of its shell at him, venom dripping off their points)
			var u := _ease(bt / 0.15)
			var fade := _c01((0.45 - bt) / 0.2)
			var sx := _wx(b["x1"], b["y1"])
			var sy := _wy(b["x1"], b["y1"]) - 14.0
			var hx := _wx(b["x"], b["y"])
			var hy := _wy(b["x"], b["y"]) - 8.0
			for k in 3:
				var side := (float(k) - 1.0) * 6.0
				var ex := lerpf(sx, hx, 0.75 * u) + side
				var ey := lerpf(sy, hy, 0.75 * u) + side * 0.4
				_ga(fade)
				_fs(R[1])
				_line(sx + side * 0.5, sy + 1.0, ex, ey + 1.0, 3)
				_fs(R[3])
				_line(sx + side * 0.5, sy, ex, ey, 2)
				_fs(R[5])
				_line(lerpf(sx, ex, 0.6), lerpf(sy, ey, 0.6), ex, ey, 1)
				_glow(ex, ey, 7.0, R[4], 0.6 * fade)
				# (a drop of venom falling from its point)
				var dy := 10.0 * _c01((bt - 0.15 - k * 0.04) / 0.25)
				_fs(R[4])
				_fill(_ri(ex), _ri(ey + dy), 2, 2)
			_glow(sx, sy, 18.0, R[4], 0.5 * fade)
		"fortress:clang":
			var hh := _hero_at(b)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, 26.0, Color("#fff4c8"), 0.8 * (1.0 - bt / 0.3))
	_ga(1.0)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	# (his shell, a Guarding meld in front, while it holds)
	# (only while a shield holds: a barrier is shown on his life globe, no shell round him; his words, 27 Nov 2026)
	if h.shield > 0.0:
		for i in 3:
			var f: String = h.m52.fid(i)
			if IDS.has(f):
				if OWN:
					_own_shell(func(cx: float, cy: float, rx: float, ry: float) -> void: _shell(f, cx, cy, rx, ry, 7))
				else:
					_shell(f, _wx(h.world.x, h.world.y), _wy(h.world.x, h.world.y) - 17.0, 17.0, 23.0, 7)
				break
	# (a monster's, carrying one, while its shield holds)
	if h.monsters != null and is_instance_valid(h.monsters):
		for o in h.monsters.list:
			if is_instance_valid(o) and not o.dead and o.shield > 0.0:
				for id in IDS:
					if o.words.has(id):
						_shell(id, _wx(o.world.x, o.world.y), _wy(o.world.x, o.world.y) - _mid(o), _half(o) + 4.0, _mid(o) + 3.0, o.id)
						break


func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id: String = str(z.get("m52", ""))
		if not IDS.has(id) or str(z["kind"]) != "ward":
			continue
		var R := ramp(id)
		var x: float = z["x"]
		var y: float = z["y"]
		var r: float = z["r"]
		var sd := _hash(_ri(x * 100.0), _ri(y * 100.0))
		match id:
			"bulwark":
				var pulse := fmod(t * 1.2, 1.0)
				_ga(0.7 * (1.0 - pulse))
				_fs(ramp("bulwark")[4])
				_ring(x, y, r * pulse, 0)
				_fs(Color("#ff6a4a"))
				_ring(x, y, r * pulse * 0.97, 3)
			"hemlock":
				# (its floor slick with poison, bubbling)
				_ga(0.3)
				_fs(R[2])
				var rows := _ri(r * 11.0)
				for j in range(-rows, rows + 1, 2):
					var w := r * 22.6 * sqrt(maxf(0.0, 1.0 - pow(float(j) / maxf(1.0, rows), 2.0)))
					_fill(_ri(_wx(x, y) - w), _ri(_wy(x, y) + j), _ri(w * 2.0), 1)
				if randf() < 0.3:
					var a := randf() * TAU
					var d := sqrt(randf()) * r
					bits.append({"x": x + cos(a) * d, "y": y + sin(a) * d, "z": 0.0, "vx": 0.0, "vy": 0.0, "vz": 8.0, "fall": 0.0, "t": 0.0, "life": 0.6,
						"ramp": PackedColorArray([R[4], R[5], R[3]]), "kind": "bubble", "size": 2.0})
			"cinderward":
				# (ringed in low flames)
				var n := maxi(10, _ri(r * 12.0))
				for i in n:
					var a := float(i) / n * TAU
					var px := _wx(x + cos(a) * r * 0.7, y + sin(a) * r * 0.7)
					var py := _wy(x + cos(a) * r * 0.7, y + sin(a) * r * 0.7)
					_flames(px, py, 1, 2.0, 7.0, 0.9, PackedColorArray([FIRE[5], FIRE[4], FIRE[3], FIRE[2]]), sd + i)
			"static":
				# (its edge crackling)
				var n := 14
				for i in n:
					if _rh(sd + int(t * 15.0), i) > 0.35:
						continue
					var a := float(i) / n * TAU
					var px := _wx(x + cos(a) * r * 0.7, y + sin(a) * r * 0.7)
					var py := _wy(x + cos(a) * r * 0.7, y + sin(a) * r * 0.7)
					_ga(1.0)
					_fs(R[5])
					_line(px, py, px + (_rh(sd, i + int(t * 30.0)) - 0.5) * 10.0, py - 6.0, 1)
					_glow(px, py, 8.0, R[4], 0.6)
			"windward":
				# (wind swirling in it)
				for k in 3:
					var a0 := t * 3.0 + float(k) * TAU / 3.0
					for i in 12:
						var a := a0 - i * 0.12
						var rr := r * 0.55 * (0.6 + 0.4 * sin(float(k) + t))
						_ga(0.8 * (1.0 - i / 12.0))
						_fs(R[5] if i < 2 else R[4])
						_fill(_ri(_wx(x + cos(a) * rr, y + sin(a) * rr)), _ri(_wy(x + cos(a) * rr, y + sin(a) * rr)), 1, 1)
			"fortress":
				# (a standing stone at each quarter)
				for k in 4:
					var a := float(k) * PI * 0.5 + PI * 0.25
					var px := _wx(x + cos(a) * r * 0.72, y + sin(a) * r * 0.72)
					var py := _wy(x + cos(a) * r * 0.72, y + sin(a) * r * 0.72)
					_stone(px, py, 7.0, 14.0, ROCK, sd + k)
					# (its ward-rune cut in it, glowing)
					_ga(1.0)
					_fs(R[4])
					_fill(_ri(px) - 1, _ri(py) - 9, 1, 4)
					_fill(_ri(px), _ri(py) - 8, 1, 1)
					_glow(px, py - 8.0, 5.0, R[4], 0.5)
	_ga(1.0)
