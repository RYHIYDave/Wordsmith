## LASTING'S SEVEN AND FLEETING'S SEVEN, PAINTED (the Floor 6–10 Meld Animations, approved 23 Nov 2026), with the kit's brushes
## (fx_m52kit.gd). Lasting's old sand-light and Fleeting's flicker stay as the game draws them (fx_words10.gd); each meld's own:
##   MOMENTUM   a band round his weapon, hotter with each hit that lands; three seconds without, it pours away as sand.
##   CANKER     sand-light crawling through the poison on what it hits; its cloud behind, dunes drifting in from its edge.
##   PERMAFROST frost thick and slow to melt on what it chills, crusted with sand; its ice behind, drifts over its edge.
##   SMOULDER   one dying burning leaving a bed of glowing coals where it fell, smoke curling off; its ground behind, coals.
##   TEMPEST    what it shocks crackling; its storm behind, its rim gone to sand-light.
##   TAILWIND   a ribbon of green wind trailing him while he keeps using it.
##   BEDROCK    the stun's ring over the head turning slowly in sand; its cracks behind, sand drifting into them.
##   HAYMAKER   the blow snapping out, a flicker of its after-image, a hot flash.
##   BLOAT      what it poisoned swelling and bursting in a small cloud.
##   COLD SNAP  the chill snapping off in a crack of shards; its ice behind melting fast, flashing solid on what is on it.
##   FLASHFIRE  a burn ending in a white-hot flare.
##   JOLT       all of a shock going off in one blinding jolt; its storm behind letting every bolt loose at once.
##   BLINK      after-images of him, a step behind each other, as he darts.
##   DAZE       a heavy thud on the stunned, its stars spinning fast.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["momentum", "canker", "permafrost", "smoulder", "tempest", "tailwind", "bedrock", "haymaker", "bloat", "coldsnap", "flashfire", "jolt", "blink", "daze"]
const SAND := [Color("#2a1c10"), Color("#5a4024"), Color("#9a7a4c"), Color("#d8b878"), Color("#f0dcac"), Color("#fff4dc")]
var _mom := 0
var _was_blink := Vector2.INF
## (where he has been while Blink or Tailwind holds, newest first: {at, xf, tex, off, t, blink, tail})
var _trail: Array = []
## (his pictures made ready to be drawn as after-images: by the picture, [its own colours, its shape in white])
var _ghosts := {}


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var R := ramp(b["id"])
	var mid := _mid(b["m"])
	match "%s:%s" % [b["id"], b["what"]]:
		"smoulder:coals":
			b["end"] = 4.0
		"tailwind:gust":
			b["end"] = 0.5
		"haymaker:snap":
			b["end"] = 0.3
		"bloat:burst":
			b["end"] = 0.6
			for i in 14:
				_bit(b["x"], b["y"], 10, "bubble", PackedColorArray([R[4], R[5], R[3]]), 1.4, 0.6, -10, 10, 30)
		"coldsnap:snap":
			b["end"] = 0.35
			for i in 12:
				_bit(b["x"], b["y"], mid, "streak", PackedColorArray([ICE[3], ICE[4], ICE[5]]), 3.0, 0.4, 160, 20, 80)
		"coldsnap:melt":
			b["end"] = 0.6
		"flashfire:flare":
			b["end"] = 0.5
			for i in 16:
				_bit(b["x"], b["y"], 8, "streak", PackedColorArray([FIRE[3], FIRE[4], FIRE[5]]), 3.6, 0.4, -40, 40, 110)
		"jolt:jolt":
			b["end"] = 0.3
		"jolt:all":
			b["end"] = 0.45
			fx.kick(2.0)
		"blink:blink":
			b["end"] = 0.6
			b["x0"] = b["x"]
			b["y0"] = b["y"]
		"daze:thud":
			b["end"] = 0.5
		_:
			return false
	return true


func ongoing(dt: float) -> void:
	var h = fx.hero()
	if h == null:
		return
	# (Momentum's build-up poured away as sand when it lapses)
	var mom: int = h.m52.momentum if h.m52.time - h.m52.momentum_at <= float(M52.tune("momentum")["hold"]) else 0
	if _mom > 0 and mom == 0:
		for i in 18:
			_bit(h.world.x, h.world.y, 14, "dot", PackedColorArray([SAND[2], SAND[3], SAND[4]]), 0.4, 0.8, 80, -10, 10)
	_mom = mom
	# (where he has been, for Blink's after-images and Tailwind's ribbon)
	for p: Dictionary in _trail:
		p["t"] = float(p["t"]) + dt
	_trail = _trail.filter(func(p): return float(p["t"]) < 0.5)
	var sp = h.get("_sprite")
	if (h.m52.blink_t > 0.0 or h.m52.tail_t > 0.0) and sp != null and sp.texture != null:
		_trail.push_front({"at": h.world, "xf": sp.get_global_transform(), "tex": sp.texture, "off": sp.offset, "t": 0.0,
			"blink": h.m52.blink_t > 0.0, "tail": h.m52.tail_t > 0.0})
	# (Tailwind: a ribbon of wind trailing him while it holds)
	if h.m52.tail_t > 0.0 and randf() < dt * 70.0:
		var R := ramp("tailwind")
		var back: Vector2 = -h.face
		bits.append({"x": h.world.x + back.x * 0.25, "y": h.world.y + back.y * 0.25, "z": 6.0 + randf() * 6.0, "vx": back.x * 1.2, "vy": back.y * 1.2, "vz": 0.0, "fall": 0.0,
			"t": 0.0, "life": 0.6, "ramp": PackedColorArray([SAND[3], R[3], R[4], R[5]]), "kind": "streak", "size": 1.0})
	# (Blink: after-images of him, a step behind each other, while he darts)
	if h.m52.blink_t > 0.0 and randf() < dt * 90.0:
		var R := ramp("blink")
		bits.append({"x": h.world.x, "y": h.world.y, "z": 4.0 + randf() * 22.0, "vx": 0.0, "vy": 0.0, "vz": 0.0, "fall": 0.0, "t": 0.0, "life": 0.3,
			"ramp": PackedColorArray([R[2], R[3], R[4], R[5]]), "kind": "puff", "size": 3.0})


func paint_floor(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	match "%s:%s" % [b["id"], b["what"]]:
		"smoulder:coals":
			_coals(b["x"], b["y"], 0.8, _c01((4.0 - bt) / 1.5), int(b["seed"]))
		"tailwind:gust":
			var hh := _hero_at(b)
			var u := _ease(bt / 0.4)
			_ga(0.8 * (1.0 - u))
			_fs(R[4])
			_ring(hh.x, hh.y, 0.3 + 0.9 * u, 2, bt * 8.0)
		"bloat:burst":
			# (it swells, then bursts)
			var r := 0.4 + 1.1 * _ease((bt - 0.1) / 0.2) if bt > 0.1 else 0.3 + bt
			_ga(0.6 * _c01((0.6 - bt) / 0.3))
			_fs(R[3])
			_ring(b["x"], b["y"], r, 0)
			_fs(R[4])
			_ring(b["x"], b["y"], r * 0.9, 2)
		"coldsnap:melt":
			var u := _ease(bt / 0.3)
			_ga(0.9 * _c01((0.6 - bt) / 0.3))
			_fs(ICE[5])
			_ring(b["x"], b["y"], float(b["r"]) * (1.0 - u * 0.6), 0)
			_fs(ICE[4])
			_ring(b["x"], b["y"], float(b["r"]) * (1.0 - u * 0.6) * 0.9, 2)
		"flashfire:flare":
			var u := _ease(bt / 0.3)
			_ga(0.8 * (1.0 - u))
			_fs(FIRE[5])
			_ring(b["x"], b["y"], float(b["r"]) * u, 0)
		"jolt:all":
			var u := _ease(bt / 0.3)
			_ga(0.9 * (1.0 - u))
			_fs(R[5])
			_ring(b["x"], b["y"], float(b["r"]) * u, 0)
		"daze:thud":
			var u := _ease(bt / 0.25)
			_ga(0.8 * (1.0 - u))
			_fs(R[4])
			_ring(b["x"], b["y"], 0.3 + 0.7 * u, 0)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var p := _mid_px(b)
	match "%s:%s" % [b["id"], b["what"]]:
		"haymaker:snap":
			# (the blow snapping out: a flicker of its after-image, a hot flash where it lands)
			var u := _c01(bt / 0.3)
			var hh := _hero_at(b)
			var hx := _wx(hh.x, hh.y)
			var hy := _wy(hh.x, hh.y) - 14.0
			for k in 3:
				var off := 2.0 + k * 5.0
				_ga((0.9 - k * 0.25) * (1.0 - u))
				_fs(R[2])
				_line(hx + off, hy - 8.0, p.x + off * 0.5, p.y + 2.0, 4)
				_fs(R[5] if k == 0 else R[4])
				_line(hx + off, hy - 8.0, p.x + off * 0.5, p.y + 2.0, 2)
			if not b.get("minor", false):
				_glow(p.x, p.y, 30.0, R[5], 0.9 * (1.0 - u))
				_glow(p.x, p.y, 16.0, Color.WHITE, 0.7 * (1.0 - u))
		"coldsnap:snap":
			# (the chill snapping off it: cracks of white across it)
			var u := _c01(bt / 0.35)
			_ga(1.0 - u)
			_fs(Color.WHITE)
			for k in 4:
				var a := _rh(sd, k) * TAU
				_line(p.x, p.y, p.x + cos(a) * 10.0, p.y + sin(a) * 8.0, 1)
			_glow(p.x, p.y, 22.0, ICE[4], 0.8 * (1.0 - u))
		"flashfire:flare":
			# (a white-hot flare going up)
			var u := _c01(bt / 0.4)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var hgt := 64.0 * _ease(u * 2.0)
			for j in range(0, int(hgt), 2):
				var v := float(j) / maxf(1.0, hgt)
				_ga((1.0 - u) * (1.0 - v * 0.6))
				_fs(_tone(PackedColorArray([Color.WHITE, FIRE[5], FIRE[4], FIRE[3]]), v))
				var w := lerpf(9.0, 1.5, v)
				_fill(_ri(cx - w), _ri(cy - j), _ri(w * 2.0), 2)
			_glow(cx, cy - 10.0, 34.0, FIRE[4], 0.9 * (1.0 - u))
		"jolt:jolt":
			# (all of the shock in one blinding jolt: white bolts out of it every way)
			var u := _c01(bt / 0.3)
			for k in 6:
				var a := float(k) / 6.0 * TAU + _rh(sd, k)
				_bolt(p.x, p.y, p.x + cos(a) * 22.0, p.y + sin(a) * 16.0, R, sd + k, 1.0 - u, 1)
			_glow(p.x, p.y, 40.0, Color.WHITE, 0.9 * (1.0 - u))
		"jolt:all":
			# (every bolt of the storm at once, down out of the sky)
			var u := _c01(bt / 0.4)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			for k in 5:
				var tx := cx + (_rh(sd, k) - 0.5) * float(b["r"]) * 36.0
				var ty := cy + (_rh(sd, k + 5) - 0.5) * float(b["r"]) * 16.0
				_bolt(tx + 6.0, ty - 80.0, tx, ty, R, sd + k, 1.0 - u, 2)
			_glow(cx, cy, 60.0, Color.WHITE, 0.7 * (1.0 - u))
		"blink:blink":
			var u := _c01(bt / 0.4)
			_glow(_wx(b["x0"], b["y0"]), _wy(b["x0"], b["y0"]) - 14.0, 24.0, R[5], 0.8 * (1.0 - u))
		"daze:thud":
			# (its stars spinning fast over its head)
			var top := _mid(b["m"]) * 2.0 + 4.0
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - top
			var fade := _c01((0.5 - bt) / 0.2)
			for k in 4:
				var a := bt * 22.0 + float(k) * TAU / 4.0
				var x := cx + cos(a) * 8.0
				var y := cy + sin(a) * 3.0
				_ga(fade)
				_fs(R[5])
				_fill(_ri(x) - 1, _ri(y), 3, 1)
				_fill(_ri(x), _ri(y) - 1, 1, 3)
			if bt < 0.15:
				_glow(p.x, p.y, 26.0, R[4], 0.9 * (1.0 - bt / 0.15))
	_ga(1.0)


## A bed of glowing coals on the floor round (x, y), `r` tiles, breathing, smoke curling off it.
func _coals(x: float, y: float, r: float, fade: float, sd: int) -> void:
	var n := _ri(r * 18.0)
	for i in n:
		var a := _rh(sd, i) * TAU
		var d := sqrt(_rh(sd, i + 100)) * r
		var cx := _wx(x + cos(a) * d, y + sin(a) * d)
		var cy := _wy(x + cos(a) * d, y + sin(a) * d)
		var pulse := 0.5 + 0.5 * sin(t * 3.0 + i)
		_ga(fade)
		_fs(FIRE[1])
		_fill(_ri(cx) - 1, _ri(cy), 3, 2)
		_fs(FIRE[3] if pulse > 0.5 else FIRE[2])
		_fill(_ri(cx), _ri(cy), 2, 1)
		if pulse > 0.8:
			_fs(FIRE[4])
			_fill(_ri(cx), _ri(cy), 1, 1)
	_glow(_wx(x, y), _wy(x, y), r * 22.0, FIRE[2], 0.5 * fade)
	if randf() < 0.15 * fade:
		bits.append({"x": x + (randf() - 0.5) * r, "y": y + (randf() - 0.5) * r, "z": 2.0, "vx": 0.0, "vy": 0.0, "vz": 14.0, "fall": 0.0, "t": 0.0, "life": 1.0,
			"ramp": PackedColorArray([Color("#3a3438"), Color("#5a5458"), Color("#8a8488")]), "kind": "puff", "size": 2.0})
	_ga(1.0)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	_blink_ghosts(h)
	_tail_ribbon(h)
	# (Momentum: a band round his weapon, hotter with each hit that lands)
	if _mom > 0:
		var R := ramp("momentum")
		var k := float(_mom) / float(M52.tune("momentum")["most"])
		var cx := _wx(h.world.x, h.world.y) + 6.0
		var cy := _wy(h.world.x, h.world.y) - 16.0
		# (a glowing coil wound up his arm and weapon, turning, more turns and hotter with each hit: its near strands bright, its
		# far ones dark behind him)
		var turns := 1.5 + 2.0 * k
		var px := cx + 6.0
		var py := cy + 10.0
		for i in 36:
			var v := float(i) / 35.0
			var ang := v * TAU * turns + t * 6.0
			var x := cx + cos(ang) * (6.0 - 2.0 * v)
			var y := cy + 10.0 - 22.0 * v + sin(ang) * 2.0
			var near := sin(ang) > 0.0
			if i > 0:
				_ga(0.9 if near else 0.5)
				_fs(R[0] if not near else R[1])
				_line(px, py + 1.0, x, y + 1.0, 2)
				_fs(_tone(PackedColorArray([R[3], R[4], R[5], Color.WHITE]), clampf(k * 1.4, 0.0, 1.0) * (0.6 + 0.4 * v)) if near else R[2])
				_line(px, py, x, y, 2 if near else 1)
			px = x
			py = y
		_glow(cx, cy, 14.0 + 14.0 * k, R[4], 0.6 + 0.4 * k)
	if h.monsters == null or not is_instance_valid(h.monsters):
		return
	var now: float = h.m52.time
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead or o.m52.is_empty():
			continue
		var cx := _wx(o.world.x, o.world.y)
		var cy := _wy(o.world.x, o.world.y)
		var top := _mid(o) * 2.0
		var sd := int(o.id)
		# (Canker: sand-light crawling through the poison on it)
		if o.m52.has("canker") and o.poison_t > 0.0:
			for i in 12:
				var u := fmod(t * 0.7 + _rh(sd, i), 1.0)
				var gx := cx + (_rh(sd, i + 9) - 0.5) * _half(o) * 1.6
				var gy := cy - u * top
				_ga(1.0)
				_fs(SAND[1])
				_fill(_ri(gx) - 1, _ri(gy) - 1, 3, 4)
				_fs(SAND[4] if i % 2 else ramp("canker")[4])
				_fill(_ri(gx), _ri(gy), 2, 2)
			_glow(cx, cy - top * 0.5, 16.0, SAND[3], 0.5)
		# (Permafrost: frost thick on it, crusted with sand, while it is chilled)
		if o.m52.has("permafrost") and o.chill_t > 0.0:
			for i in 9:
				var x := cx - _half(o) - 2.0 + (2.0 * _half(o) + 4.0) * float(i) / 8.0
				var hh := 7.0 + 10.0 * _rh(sd, i)
				_ga(0.95)
				_fs(ICE[2])
				_fill(_ri(x) - 1, _ri(cy - hh), 4, _ri(hh))
				_fs(ICE[4])
				_fill(_ri(x), _ri(cy - hh), 2, _ri(hh) - 1)
				_fs(ICE[5])
				_fill(_ri(x), _ri(cy - hh), 1, 2)
				_fs(SAND[3])
				_fill(_ri(x) - 1, _ri(cy - 2), 4, 2)
			_glow(cx, cy - 6.0, 18.0, ICE[4], 0.5)
		# (Tempest: what it shocked crackling while the shock lasts)
		if o.m52.has("tempest") and o.shock_t > 0.0 and _rh(sd, int(t * 20.0)) < 0.5:
			var R := ramp("tempest")
			var a := _rh(sd + 3, int(t * 20.0)) * TAU
			_ga(1.0)
			_fs(R[5])
			_line(cx, cy - top * 0.5, cx + cos(a) * 9.0, cy - top * 0.5 + sin(a) * 7.0, 1)
			_glow(cx, cy - top * 0.5, 10.0, R[4], 0.5)
		# (Bedrock: the stun's ring over it turning slowly, in sand)
		if o.m52.has("bedrock") and o.stun_t > 0.0:
			for i in 14:
				var a := float(i) / 14.0 * TAU + t * 1.2
				var x := cx + cos(a) * 12.0
				var y := cy - top - 5.0 + sin(a) * 4.0
				_ga(1.0)
				_fs(SAND[1])
				_fill(_ri(x) - 1, _ri(y) - 1, 4, 3)
				_fs(SAND[4] if i % 2 else SAND[3])
				_fill(_ri(x), _ri(y), 2, 1)
			_glow(cx, cy - top - 5.0, 14.0, SAND[3], 0.5)
	_ga(1.0)


func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id: String = str(z.get("m52", z.get("look", "")))
		var x: float = z["x"]
		var y: float = z["y"]
		var r: float = z["r"]
		var sd := _hash(_ri(x * 100.0), _ri(y * 100.0))
		match id:
			"canker", "permafrost", "bedrock":
				# (dunes of sand drifting in from its edge; for Bedrock, into its cracks)
				for i in 10:
					var a := float(i) / 10.0 * TAU + _rh(sd, i) * 0.5
					var u := fmod(t * 0.15 + _rh(sd, i + 20), 1.0)
					var d := r * (1.0 - u * (0.6 if id != "bedrock" else 0.9))
					var px := _wx(x + cos(a) * d, y + sin(a) * d)
					var py := _wy(x + cos(a) * d, y + sin(a) * d)
					_ga(0.9 * (1.0 - u * 0.4))
					_fs(SAND[1])
					_fill(_ri(px) - 5, _ri(py) + 1, 11, 1)
					_fs(SAND[3])
					_fill(_ri(px) - 4, _ri(py), 9, 1)
					_fs(SAND[4])
					_fill(_ri(px) - 2, _ri(py) - 1, 5, 1)
			"smoulder":
				if str(z["kind"]) == "burn":
					_coals(x, y, r * 0.8, 1.0, sd)
			"tempest":
				# (its rim gone to sand-light)
				_ga(0.8)
				_fs(SAND[4])
				_ring(x, y, r, 3, t * 0.5)
				_fs(SAND[3])
				_ring(x, y, r * 1.04, 4, -t * 0.5)
	_ga(1.0)


## His picture `tex` made ready to be drawn as an after-image: its pixels in runs along each row, each run one of three tones by
## how light it is, flat [row, first, last, tone, ...] (drawn pixel for pixel, as crisp as he is).
func _ghost_of(tex: Texture2D) -> PackedInt32Array:
	var key := tex.get_instance_id()
	if _ghosts.has(key):
		return _ghosts[key]
	var runs := PackedInt32Array()
	var img := tex.get_image()
	if img != null:
		if img.is_compressed():
			img.decompress()
		img.convert(Image.FORMAT_RGBA8)
		var w := img.get_width()
		for y in img.get_height():
			var x := 0
			while x < w:
				var c := img.get_pixel(x, y)
				if c.a < 0.5:
					x += 1
					continue
				var lv := _tone_of(c)
				var x1 := x
				while x1 + 1 < w:
					var d := img.get_pixel(x1 + 1, y)
					if d.a < 0.5 or _tone_of(d) != lv:
						break
					x1 += 1
				runs.append_array([y, x, x1, lv])
				x = x1 + 1
	_ghosts[key] = runs
	return runs


static func _tone_of(c: Color) -> int:
	var l := c.r * 0.3 + c.g * 0.59 + c.b * 0.11
	return 0 if l < 0.22 else (1 if l < 0.45 else 2)


## A box on the screen in the layer's own units (two to a game pixel), from `a` to `b`.
func _box(a: Vector2, b: Vector2) -> void:
	if _alpha <= 0.0:
		return
	var x0 := minf(a.x, b.x)
	var x1 := maxf(a.x, b.x)
	var y0 := minf(a.y, b.y)
	var y1 := maxf(a.y, b.y)
	var n := _pts.size()
	_pts.append_array([Vector2(x0, y0), Vector2(x1, y0), Vector2(x1, y1), Vector2(x0, y1)])
	var col := Color(_style.r * _alpha, _style.g * _alpha, _style.b * _alpha, _alpha)
	_cols.append_array([col, col, col, col])
	_idx.append_array([n, n + 1, n + 2, n, n + 2, n + 3])


## BLINK: after-images of him, a step behind each other, in its pale light, fading the further back they are.
func _blink_ghosts(h) -> void:
	if _trail.is_empty() or _canvas == null:
		return
	var R := ramp("blink")
	var tones := [R[2], R[4], R[5]]
	var inv := _canvas.get_global_transform().affine_inverse()
	var now: Vector2 = h.world
	# (oldest first, so the nearest lies over the rest)
	var picks: Array = []
	for i in range(2, _trail.size(), 2):
		var p: Dictionary = _trail[i]
		if not bool(p["blink"]):
			continue
		var dx := _wx(p["at"].x, p["at"].y) - _wx(now.x, now.y)
		var dy := _wy(p["at"].x, p["at"].y) - _wy(now.x, now.y)
		if dx * dx + dy * dy < 16.0:
			continue
		picks.append(p)
		if picks.size() >= 4:
			break
	picks.reverse()
	for p: Dictionary in picks:
		var runs := _ghost_of(p["tex"])
		var xf: Transform2D = inv * (p["xf"] as Transform2D)
		var off: Vector2 = p["off"]
		var fade := 1.0 - float(p["t"]) / 0.5
		for k in range(0, runs.size(), 4):
			var y := float(runs[k])
			_ga((0.55 if runs[k + 3] == 0 else 0.75) * fade)
			_fs(tones[runs[k + 3]])
			_box(xf * (off + Vector2(float(runs[k + 1]), y)), xf * (off + Vector2(float(runs[k + 2]) + 1.0, y + 1.0)))
	_ga(1.0)


## TAILWIND: a ribbon of wind streaming back from him along where he has gone, and a gust curling round his legs.
func _tail_ribbon(h) -> void:
	if h.m52.tail_t <= 0.0:
		return
	var R := ramp("tailwind")
	var hold := clampf(h.m52.tail_t / 0.3, 0.0, 1.0)
	var pts: Array = []
	for p: Dictionary in _trail:
		if bool(p["tail"]):
			pts.append(Vector2(_wx(p["at"].x, p["at"].y), _wy(p["at"].x, p["at"].y)))
	for s in 2:
		var lift := 9.0 + s * 7.0
		for i in range(1, pts.size()):
			var u := float(i) / float(maxi(1, pts.size() - 1))
			var a: Vector2 = pts[i - 1]
			var b: Vector2 = pts[i]
			var wa := sin(t * 9.0 + float(i - 1) * 0.9 + s * 2.0) * 2.5 * (float(i - 1) / float(maxi(1, pts.size() - 1)))
			var wb := sin(t * 9.0 + float(i) * 0.9 + s * 2.0) * 2.5 * u
			_ga(0.8 * (1.0 - u) * hold)
			_fs(R[1])
			_line(a.x, a.y - lift + wa + 1.0, b.x, b.y - lift + wb + 1.0, 3)
			_fs(R[4] if s == 0 else R[3])
			_line(a.x, a.y - lift + wa, b.x, b.y - lift + wb, 2)
	# (a gust curling round his legs)
	var cx := _wx(h.world.x, h.world.y)
	var cy := _wy(h.world.x, h.world.y) - 5.0
	for k in 2:
		for i in 9:
			var ang := t * 11.0 + float(k) * PI + float(i) * 0.22
			var x := cx + cos(ang) * 11.0
			var y := cy + sin(ang) * 4.0 - float(k) * 6.0
			var v := float(i) / 8.0
			_ga((0.35 + 0.65 * v) * hold)
			_fs(R[1])
			_fill(_ri(x) - 1, _ri(y), 3, 2)
			_fs(_tone(PackedColorArray([R[3], R[4], R[5]]), v))
			_fill(_ri(x), _ri(y), 2, 1)
	_glow(cx, cy - 4.0, 14.0, R[4], 0.35 * hold)
	_ga(1.0)
