## THE 52 DESIGNED MELDS, PAINTED (his two animation docs, approved 23 Nov 2026), in the way the game's own melds are painted
## (fx_melds8.gd, fx_melds3.gd, fx_volatile3.gd: each moment a run of beats, painted dot by dot in game pixels on the floor and in
## the air, its light added among them, the bits it throws flying and cooling): what the rules tell (melds52_rules.gd `m52`) begins
## a beat here, which follows what it is on and is painted from the time since. Each meld in its own colours, darkest to brightest
## from its stone's (melds52.json `color`).
## Painted so far: TWIN'S SIX.
##   ONSLAUGHT  in front, the second blow solid: a white-hot star where it lands, ember-red sparks, the screen jolted, and what it
##              hit skidding a step back, two scuffs burnt into the floor behind it; behind, a ring of ember red closing on the
##              phantom left where he stood, then red sparks as it strikes; on a monster, a red shock ring knocking him back.
##   VIPER      in front, two fangs of green light snapping shut from either side, two punctures left dripping, the poison on it
##              bubbling up in pairs; behind, the second cloud slithering off like a snake, a wet green trail behind it; on a
##              monster, the fangs on him.
##   FLASH FREEZE  in front, frost creeping up what the first blow hits; the second, ice closing over it in a white flash, a crack
##              and shards, and a thin blue ring at its feet while it cannot be flash-frozen again; behind, the second sheet
##              flashing across the ice from the middle out; on a monster, ice closing over him.
##   REKINDLE   in front, a burn gone out sinking to embers on it, then flaring back up in tongues of flame; behind, the burning
##              ground lying dark a breath, then flaring up again in a ring from the middle out; on a monster, on him.
##   FLURRY     in front, each quick use another green crescent fanned round the blow, up to four, and four marks at his feet
##              lighting as the blows stack, fading if he waits; behind, green wind whipping round him; on a monster, wind
##              trailing it while its blows land.
##   AFTERSHOCK in front, a beat after the blow the floor under what it hit bulging, cracks running white-hot out of it, then
##              bursting in a ring of dust and thrown stones; behind, the cracks glowing white-hot again and the ground heaving.
extends "res://scripts/fx_m52kit.gd"

## (which of the 52 are painted here)
const PAINTED := ["onslaught", "viper", "flashfreeze", "rekindle", "flurry", "aftershock"]


static func painted(id: String) -> bool:
	return PAINTED.has(id)


# --- the moments ---

func handle(e: Dictionary) -> void:
	var id: String = e.get("id", "")
	var what: String = e.get("what", "")
	var m = e.get("m")
	if m != null and not is_instance_valid(m):
		m = null
	var b := {"id": id, "what": what, "t": 0.0, "x": float(e.get("x", 0.0)), "y": float(e.get("y", 0.0)), "m": m, "seed": seeds,
		"n": int(e.get("n", 1)), "r": float(e.get("r", 1.5)), "dx": float(e.get("dx", 0.0)), "dy": float(e.get("dy", 0.0)), "done": false,
		"foe": e.get("foe", false), "end": 1.0}
	seeds += 1
	if m != null:
		b["x"] = m.world.x
		b["y"] = m.world.y
	# (one blow through a pack: its great flash on the first it struck; on the rest, a lesser one)
	for q: Dictionary in beats:
		if q["id"] == id and q["what"] == what and float(q["t"]) < 0.08 and not q.get("minor", false):
			b["minor"] = true
			break
	var R := ramp(id)
	var mid := _mid(m) if m != null else 12.0
	match "%s:%s" % [id, what]:
		"onslaught:second":
			if not b.get("minor", false):
				var hv: Vector2 = fx.hero_at()
				var a := atan2(float(b["y"]) - hv.y, float(b["x"]) - hv.x)
				fx.slash(b["x"], b["y"], a + PI * 0.5, 1.1, 0.22, PackedColorArray([R[5], R[4], R[3], R[2]]), true, {"fast": true})
			var h: Vector2 = fx.hero_at()
			var d := Vector2(b["x"], b["y"]) - h
			if d.length() > 0.01:
				b["dx"] = d.normalized().x
				b["dy"] = d.normalized().y
			b["x0"] = b["x"]
			b["y0"] = b["y"]
			b["end"] = 1.3
			for i in 20:
				_bit(b["x"], b["y"], mid, "streak", PackedColorArray([R[2], R[3], R[4], R[5]]), 3.6, 0.45, 160, 40, 110)
			for i in 5:
				_bit(b["x"], b["y"], 3, "puff", PackedColorArray(DUST), 1.0, 0.7, -6, 4, 10)
			fx.kick(2.5)
		"onslaught:echo":
			b["end"] = 0.85
		"onslaught:foe":
			b["end"] = 0.55
			for i in 14:
				_bit(b["x"], b["y"], 8, "streak", PackedColorArray([R[2], R[3], R[4]]), 3.0, 0.4, 120, 20, 70)
		"viper:bite", "viper:foe":
			b["end"] = 1.5
			if not b.get("minor", false):
				for i in 10:
					_bit(b["x"], b["y"], mid + 2.0, "streak", PackedColorArray([R[3], R[4], R[5]]), 2.2, 0.35, 160, 10, 60)
			if what == "viper:foe":
				b["m"] = null
		"flashfreeze:frost":
			b["end"] = 0.7
		"flashfreeze:freeze":
			b["end"] = 1.4 + 4.0
			for i in 16:
				_bit(b["x"], b["y"], mid, "streak", PackedColorArray([ICE[3], ICE[4], ICE[5]]), 3.6, 0.5, 200, 40, 120)
		"flashfreeze:sheet":
			b["end"] = 0.9
			for i in 10:
				_bit(b["x"], b["y"], 2, "streak", PackedColorArray([ICE[4], ICE[5]]), float(b["r"]) * 2.4, 0.35, 0, 10, 40)
		"flashfreeze:foe":
			b["end"] = 0.9
		"rekindle:relight":
			b["end"] = 1.1
		"rekindle:flare":
			b["end"] = 1.0
		"flurry:stack":
			b["end"] = 1.1
			for q: Dictionary in beats:
				if q["id"] == "flurry" and q["what"] == "stack":
					q["done"] = true
		"flurry:gust":
			b["end"] = 0.7
		"aftershock:burst":
			b["end"] = 1.4
		"aftershock:quake":
			b["end"] = 0.9
			for i in 8:
				_bit(b["x"], b["y"], 2, "puff", PackedColorArray(DUST), 1.2, 0.8, -4, 6, 14)
			fx.kick(1.5)
		_:
			return
	beats.append(b)


func update(dt: float) -> void:
	t += dt
	var h = fx.hero()
	for b: Dictionary in beats:
		b["t"] = float(b["t"]) + dt
		var m = b["m"]
		if m != null and is_instance_valid(m) and not m.dead:
			b["x"] = m.world.x
			b["y"] = m.world.y
		if b["foe"] and h != null:
			b["x"] = h.world.x
			b["y"] = h.world.y
		var bt: float = b["t"]
		var R := ramp(b["id"])
		match "%s:%s" % [b["id"], b["what"]]:
			"onslaught:echo":
				if bt > 0.26 and not b.has("burst"):
					b["burst"] = true
					for i in 22:
						_bit(b["x"], b["y"], 14, "streak", PackedColorArray([R[2], R[3], R[4], R[5]]), 3.4, 0.5, 140, 30, 120)
			"viper:bite", "viper:foe":
				# (the punctures dripping)
				if bt > 0.14 and bt < 1.2 and randf() < dt * 9.0:
					var z := (_mid(m) if m != null else 12.0) - 2.0
					var side := -3.0 if randf() < 0.5 else 3.0
					bits.append({"x": float(b["x"]) + side / 32.0, "y": float(b["y"]) - side / 32.0, "z": z, "vx": 0.0, "vy": 0.0, "vz": -6.0, "fall": 110.0, "t": 0.0, "life": 0.45,
						"ramp": PackedColorArray([R[2], R[3], R[4]]), "kind": "dot", "size": 1.0})
				# (the poison on it bubbling up in pairs)
				if m != null and is_instance_valid(m) and m.poison_t > 0.0 and randf() < dt * 5.0:
					for s in [-1.0, 1.0]:
						bits.append({"x": float(b["x"]) + s * 0.08, "y": float(b["y"]) - s * 0.08, "z": 4.0 + randf() * 6.0, "vx": 0.0, "vy": 0.0, "vz": 14.0, "fall": 0.0, "t": 0.0, "life": 0.6,
							"ramp": PackedColorArray([R[4], R[5], R[3]]), "kind": "bubble", "size": 2.0})
					b["end"] = maxf(float(b["end"]), bt + 0.3)
			"flashfreeze:freeze":
				# (held while it is frozen; then the ring of its rest)
				if m != null and is_instance_valid(m) and m.frozen_t > 0.0:
					b["thaw"] = bt
			"rekindle:relight":
				if bt > 0.35 and not b.has("puff"):
					b["puff"] = true
					for i in 12:
						_bit(b["x"], b["y"], 6, "streak", PackedColorArray([FIRE[2], FIRE[3], FIRE[4], FIRE[5]]), 1.6, 0.5, -40, 30, 80)
			"aftershock:burst":
				if bt > 0.16 and not b.has("blown"):
					b["blown"] = true
					for i in 14:
						_bit(b["x"], b["y"], 3, "puff", PackedColorArray(DUST), 1.6 * float(b["r"]) / 1.8, 0.9, -6, 4, 12)
					for i in 12:
						_bit(b["x"], b["y"], 4, "stone", PackedColorArray(STONE), 2.0, 0.8, 300, 70, 130)
					for i in 10:
						_bit(b["x"], b["y"], 4, "streak", PackedColorArray([STONE[3], STONE[4], STONE[5]]), 3.4, 0.35, 160, 30, 90)
					fx.kick(3.0)
		if bt >= float(b["end"]):
			b["done"] = true
	beats = beats.filter(func(q): return not q["done"])
	# (Flurry on a monster: wind trailing it while its blows land)
	if h != null and h.monsters != null and is_instance_valid(h.monsters) and randf() < dt * 10.0:
		for o in h.monsters.list:
			if is_instance_valid(o) and not o.dead and o.m52.has("foe_flurry"):
				var R := ramp("flurry")
				bits.append({"x": o.world.x, "y": o.world.y, "z": 4.0 + randf() * 14.0, "vx": (randf() - 0.5) * 0.6, "vy": (randf() - 0.5) * 0.6, "vz": 0.0, "fall": 0.0,
					"t": 0.0, "life": 0.35, "ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "streak", "size": 1.0})
	# (Viper behind: the creeping cloud's trail)
	if h != null and h.wakes != null and is_instance_valid(h.wakes):
		for z in h.wakes.list:
			if z.get("creep", false):
				var tr: Array = z.get("trail", [])
				var at := Vector2(z["x"], z["y"])
				if tr.is_empty() or (tr[tr.size() - 1] as Vector2).distance_to(at) > 0.12:
					tr.append(at)
					if tr.size() > 40:
						tr.pop_front()
				z["trail"] = tr
	for p: Dictionary in bits:
		p["t"] = float(p["t"]) + dt
		p["x"] = float(p["x"]) + float(p["vx"]) * dt
		p["y"] = float(p["y"]) + float(p["vy"]) * dt
		p["vz"] = float(p["vz"]) - float(p["fall"]) * dt
		p["z"] = maxf(0.0, float(p["z"]) + float(p["vz"]) * dt)
		if p["kind"] == "stone" and float(p["z"]) <= 0.0:
			p["vx"] = float(p["vx"]) * 0.5
			p["vy"] = float(p["vy"]) * 0.5
	bits = bits.filter(func(p): return float(p["t"]) < float(p["life"]))


# --- the painting ---

## On the floor, under what stands.
func draw_floor(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		match "%s:%s" % [b["id"], b["what"]]:
			"onslaught:second":
				_onslaught_scuff(b)
			"onslaught:echo":
				_onslaught_close(b)
			"onslaught:foe":
				_shock_ring(b, ramp("onslaught"))
			"flashfreeze:sheet":
				_ice_sheet(b)
			"flashfreeze:freeze":
				_ice_rest_ring(b)
			"rekindle:flare":
				_fire_ring(b)
			"flurry:stack":
				_flurry_pips(b)
			"aftershock:burst":
				_aftershock_floor(b)
			"aftershock:quake":
				_cracks(b, float(b["r"]), _c01(1.0 - float(b["t"]) / 0.9), 0.0)
	# (Viper behind: the wet green trail the snake leaves)
	var h = fx.hero()
	if h != null and h.wakes != null and is_instance_valid(h.wakes):
		for z in h.wakes.list:
			if z.get("creep", false):
				_viper_trail(z)
	_ga(1.0)
	_flush()


## In the air, over what stands and the dark.
func draw_air(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		match "%s:%s" % [b["id"], b["what"]]:
			"onslaught:second":
				_impact_star(b, ramp("onslaught"))
			"viper:bite", "viper:foe":
				_fangs(b)
			"flashfreeze:frost":
				_frost_creep(b)
			"flashfreeze:freeze":
				_ice_shell(b)
			"flashfreeze:foe":
				_ice_shell(b)
			"rekindle:relight":
				_rekindle(b)
			"flurry:stack":
				_crescents(b)
			"flurry:gust":
				_wind(b)
			"aftershock:burst":
				_aftershock_air(b)
	var h = fx.hero()
	if h != null and h.wakes != null and is_instance_valid(h.wakes):
		for z in h.wakes.list:
			if z.get("creep", false):
				_viper_head(z)
	for p: Dictionary in bits:
		_draw_bit(p)
	_ga(1.0)
	_flush()


# ---- ONSLAUGHT
## The second blow's light: a white-hot star where it lands, its long arms flat, a ring of its heat round it.
func _impact_star(b: Dictionary, R: PackedColorArray) -> void:
	var bt: float = b["t"]
	if bt > 0.3:
		return
	var u := bt / 0.3
	var m = b["m"]
	var cx := _ri(_wx(b["x"], b["y"]))
	var cy := _ri(_wy(b["x"], b["y"]) - _mid(m))
	var minor: bool = b.get("minor", false)
	_glow(cx, cy, 20.0 if minor else 40.0, Color.WHITE, (0.5 if minor else 0.9) * (1.0 - u))
	_glow(cx, cy, 16.0 if minor else 28.0, R[4], 0.8 * (1.0 - u))
	_ga(1.0 - u)
	_fs(Color.WHITE)
	var w := _ri(lerpf(9.0 if minor else 22.0, 4.0, _ease(u)))
	_fill(cx - w, cy, w * 2 + 1, 1)
	_fill(cx, cy - _ri(w * 0.6), 1, _ri(w * 1.2) + 1)
	_fill(cx - 2, cy - 1, 5, 3)
	_fs(R[5])
	_fill(cx - _ri(w * 0.6), cy - _ri(w * 0.6), 1, 1)
	_fill(cx + _ri(w * 0.6), cy + _ri(w * 0.6), 1, 1)
	_fill(cx + _ri(w * 0.6), cy - _ri(w * 0.6), 1, 1)
	_fill(cx - _ri(w * 0.6), cy + _ri(w * 0.6), 1, 1)
	# (its heat in a ring round the blow, flat to the eye)
	var rr := _ri(lerpf(6.0, 18.0, _ease(u)))
	_fs(R[4])
	for i in 24:
		var a := float(i) / 24.0 * TAU
		_fill(_ri(cx + cos(a) * rr), _ri(cy + sin(a) * rr * 0.7), 1, 1)
	_ga(1.0)


## What it hit skidding a step back: two scuffs burnt into the floor along the way it went, ember-bright at their heads, cooling.
func _onslaught_scuff(b: Dictionary) -> void:
	var R := ramp("onslaught")
	var bt: float = b["t"]
	var u := _c01(bt / 0.18)
	var fade := _c01((1.3 - bt) / 0.6)
	var x0: float = b["x0"]
	var y0: float = b["y0"]
	var dx: float = b["dx"]
	var dy: float = b["dy"]
	var px := -dy
	var py := dx
	for s in [-1.0, 1.0]:
		var ax: float = x0 + px * s * 0.12
		var ay: float = y0 + py * s * 0.12
		var ex: float = ax + dx * 0.9 * u
		var ey: float = ay + dy * 0.9 * u
		_ga(0.75 * fade)
		_fs(Color("#120a08"))
		_line(_wx(ax, ay), _wy(ax, ay) + 1.0, _wx(ex, ey), _wy(ex, ey) + 1.0, 2)
		_ga(0.9 * fade)
		_fs(R[2])
		_line(_wx(ax, ay), _wy(ax, ay), _wx(ex, ey), _wy(ex, ey), 1)
		_fs(R[4] if bt < 0.5 else R[3])
		_fill(_ri(_wx(ex, ey)) - 1, _ri(_wy(ex, ey)) - 1, 2, 2)
		_glow(_wx(ex, ey), _wy(ex, ey), 8.0, R[3], 0.5 * fade)
	_ga(1.0)


## Behind: a ring of ember red closing on the phantom left where he stood, and its heat as it strikes.
func _onslaught_close(b: Dictionary) -> void:
	var R := ramp("onslaught")
	var bt: float = b["t"]
	var u := _c01(bt / 0.26)
	var rt := lerpf(1.5, 0.35, _ease(u))
	var fade := _c01((0.85 - bt) / 0.3)
	_ga(0.5 * fade)
	_fs(R[2])
	_ring(b["x"], b["y"], rt + 0.06, 0, bt * 3.0)
	_ga(0.95 * fade)
	_fs(R[4] if u < 1.0 else R[5])
	_ring(b["x"], b["y"], rt, 3, -bt * 4.0)
	if u >= 1.0:
		_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 8.0, 26.0, R[4], 0.7 * fade)
	_ga(1.0)


## On a monster: a red shock ring bursting out round him where its second blow lands, knocking him back.
func _shock_ring(b: Dictionary, R: PackedColorArray) -> void:
	var bt: float = b["t"]
	var u := _c01(bt / 0.35)
	var fade := 1.0 - _c01((bt - 0.25) / 0.3)
	for k in 2:
		var rt := lerpf(0.25, 1.3 - k * 0.35, _ease(u))
		_ga((0.9 - k * 0.35) * fade)
		_fs(R[4] if k == 0 else R[2])
		_ring(b["x"], b["y"], rt, 0)
		_ring(b["x"], b["y"], rt + 0.04, 2)
	_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]), 30.0, R[3], 0.5 * fade)
	_ga(1.0)


# ---- VIPER
## Two fangs of green light snapping shut on it from either side, then the two punctures they leave.
func _fangs(b: Dictionary) -> void:
	var R := ramp("viper")
	var bt: float = b["t"]
	var m = b["m"]
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"]) - (_mid(m) if m != null else 12.0)
	var close := 0.13
	if bt < close + 0.08:
		var u := _c01(bt / close)
		var big := 1.0 if b.get("minor", false) else 1.6
		var gap := lerpf(24.0, 3.0, _ease(u)) * big
		var fade := 1.0 - _c01((bt - close) / 0.08)
		for s in [-1.0, 1.0]:
			# (a fang: a curved tooth of light, thick at its root above, its point curving in and down to the other's)
			var rx: float = cx + s * gap
			var ry := cy - 12.0 * big
			for pass_ in 2:
				for i in 11:
					var v := float(i) / 10.0
					var fx0: float = rx - s * v * v * 7.0 * big
					var fy0 := ry + v * 16.0 * big
					var w := _ri(lerpf(5.0, 1.0, v) * big) + (2 if pass_ == 0 else 0)
					_ga((0.7 if pass_ == 0 else 1.0) * fade)
					_fs(R[0] if pass_ == 0 else (R[3] if v < 0.5 else R[4]))
					_fill(_ri(fx0) - (w - 1 if s > 0 else 0) - (1 if pass_ == 0 else 0), _ri(fy0) - (1 if pass_ == 0 else 0), w, 2 + (2 if pass_ == 0 else 0))
					if pass_ == 1:
						_fs(R[5])
						_fill(_ri(fx0) - (0 if s > 0 else w - 1), _ri(fy0), 1, 1)
			_ga(fade)
			_fs(Color.WHITE)
			_fill(_ri(rx - s * 7.0 * big), _ri(ry + 16.0 * big), 1, 2)
		_glow(cx, cy, 18.0, R[4], 0.5 * fade)
		if bt >= close:
			_glow(cx, cy, 30.0, R[5], 0.9 * fade)
	# (the two punctures, dark at their middles, bright at their rims, following it)
	if bt > close and bt < 1.5:
		var fade := _c01((1.5 - bt) / 0.4)
		for s in [-1.0, 1.0]:
			var px := _ri(cx + s * 3.0)
			var py := _ri(cy + 1.0)
			_ga(fade)
			_fs(R[4])
			_fill(px - 1, py - 1, 3, 3)
			_fs(R[0])
			_fill(px, py, 1, 1)
			_fs(R[5])
			_fill(px - 1, py - 1, 1, 1)
	_ga(1.0)


## Behind: the second cloud gone off like a snake toward the nearest, the floor wet where it went.
func _viper_trail(z: Dictionary) -> void:
	var R := ramp("viper")
	var tr: Array = z.get("trail", [])
	var n := tr.size()
	for i in range(1, n):
		var a: Vector2 = tr[i - 1]
		var c: Vector2 = tr[i]
		var age := float(n - i) / maxf(1.0, n)
		var wob := sin(float(i) * 1.3) * 2.0
		_ga(0.55 * (1.0 - age))
		_fs(R[1])
		_line(_wx(a.x, a.y), _wy(a.x, a.y) + 1.0 + wob, _wx(c.x, c.y), _wy(c.x, c.y) + 1.0 + wob, 3)
		_ga(0.8 * (1.0 - age))
		_fs(R[4])
		_line(_wx(a.x, a.y), _wy(a.x, a.y) + wob, _wx(c.x, c.y), _wy(c.x, c.y) + wob, 1)
	_ga(1.0)


func _viper_head(z: Dictionary) -> void:
	var R := ramp("viper")
	var tr: Array = z.get("trail", [])
	if tr.size() < 2:
		return
	var a: Vector2 = tr[tr.size() - 2]
	var c: Vector2 = tr[tr.size() - 1]
	var hx := _wx(c.x, c.y)
	var hy := _wy(c.x, c.y) - 3.0
	var dx := hx - _wx(a.x, a.y)
	var dy := hy - (_wy(a.x, a.y) - 3.0)
	var d := maxf(0.01, sqrt(dx * dx + dy * dy))
	dx /= d
	dy /= d
	# (a body of mist in an S behind its head, and the head)
	for i in 10:
		var v := float(i) / 9.0
		var wob := sin(v * PI * 2.0 + t * 10.0) * 2.5
		var bx := hx - dx * v * 14.0 - dy * wob
		var by := hy - dy * v * 14.0 + dx * wob
		_ga(0.85 - v * 0.5)
		_fs(R[3] if i % 2 == 0 else R[2])
		_fill(_ri(bx) - 1, _ri(by) - 1, 3, 2)
	_ga(1.0)
	_fs(R[4])
	_fill(_ri(hx) - 2, _ri(hy) - 1, 4, 3)
	_fs(Color("#ffe060"))
	_fill(_ri(hx - dy * 1.5), _ri(hy + dx * 1.5) - 1, 1, 1)
	_fill(_ri(hx + dy * 1.5), _ri(hy - dx * 1.5) - 1, 1, 1)
	_glow(hx, hy, 12.0, R[4], 0.5)


# ---- FLASH FREEZE
## Frost creeping up what the first blow struck: jagged rime climbing from its feet.
func _frost_creep(b: Dictionary) -> void:
	var bt: float = b["t"]
	var m = b["m"]
	var u := _ease(bt / 0.25)
	var fade := _c01((0.7 - bt) / 0.3)
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"])
	var half := _half(m)
	var top := _mid(m) * 1.4
	var sd: int = b["seed"]
	for i in 7:
		var x := cx - half + (2.0 * half) * float(i) / 6.0
		var h := top * u * (0.55 + 0.45 * _rh(sd, i))
		var y := cy
		_ga(0.8 * fade)
		var k := 0
		while y > cy - h:
			var jx := (_rh(sd, i * 31 + k) - 0.5) * 3.0
			_fs(ICE[4] if k % 3 == 0 else ICE[3])
			_fill(_ri(x + jx), _ri(y), 1, 2)
			y -= 2.0
			k += 1
		_fs(ICE[5])
		_fill(_ri(x), _ri(y), 1, 1)
	_ga(1.0)


## Ice closing over it in one white flash: a block of facets round it, a crack of light, held while it is frozen, cracking off.
func _ice_shell(b: Dictionary) -> void:
	var bt: float = b["t"]
	var m = b["m"]
	var cx := _ri(_wx(b["x"], b["y"]))
	var cy := _ri(_wy(b["x"], b["y"]))
	var half := _half(m) + 3.0
	var top := _mid(m) * 2.0 + 4.0
	var held: float = float(b.get("thaw", 0.6 if b["foe"] else 0.0))
	var gone := maxf(0.25, held) + 0.25
	if bt > gone:
		return
	var grow := _ease(bt / 0.08)
	var fade := _c01((gone - bt) / 0.25)
	var h := top * grow
	# (its body, half seen through; its facets; its light down its left side)
	_ga(0.38 * fade)
	_fs(ICE[3])
	_fill(cx - half, cy - h, half * 2.0, h)
	_ga(0.55 * fade)
	_fs(ICE[4])
	_line(cx - half, cy - h + 4.0, cx - half + 4.0, cy - h, 1)
	_line(cx - half + 4.0, cy - h, cx + half - 4.0, cy - h, 1)
	_line(cx + half - 4.0, cy - h, cx + half, cy - h + 4.0, 1)
	_line(cx - half, cy - h + 4.0, cx - half, cy, 1)
	_line(cx + half, cy - h + 4.0, cx + half, cy, 1)
	_ga(0.35 * fade)
	_line(cx - half + 3.0, cy - h * 0.7, cx + 2.0, cy - h * 0.2, 1)
	_line(cx + half - 2.0, cy - h * 0.8, cx + 1.0, cy - h * 0.45, 1)
	_ga(0.8 * fade)
	_fs(ICE[5])
	_fill(cx - half + 1.0, cy - h + 5.0, 1, h * 0.6)
	# (the white crack of light as it closes)
	if bt < 0.28:
		var u := bt / 0.28
		var mid := cy - top * 0.5
		var minor: bool = b.get("minor", false)
		_glow(cx, mid, 22.0 if minor else 44.0, Color.WHITE, (0.5 if minor else 0.9) * (1.0 - u))
		_glow(cx, mid, 18.0 if minor else 30.0, ICE[4], 0.7 * (1.0 - u))
		_ga(1.0 - u)
		_fs(Color.WHITE)
		var w := _ri(lerpf(8.0 if minor else 24.0, 4.0, u))
		_fill(cx - w, mid, w * 2 + 1, 1)
		_fill(cx, mid - _ri(w * 0.6), 1, _ri(w * 1.2) + 1)
		_fill(cx - 2, mid - 1, 5, 3)
	_ga(1.0)


## While it cannot be flash-frozen again: a thin blue ring at its feet.
func _ice_rest_ring(b: Dictionary) -> void:
	var bt: float = b["t"]
	var start := float(b.get("thaw", 0.0)) + 0.2
	if bt < start:
		return
	var fade := _c01((float(b["end"]) - bt) / 0.5) * _c01((bt - start) / 0.2)
	_ga(0.75 * fade)
	_fs(ICE[3])
	_ring(b["x"], b["y"], 0.42, 3, t * 1.5)
	_ga(0.4 * fade)
	_fs(ICE[4])
	_ring(b["x"], b["y"], 0.46, 4, -t * 1.5)
	_ga(1.0)


## Behind: the second sheet flashing across the ice from the middle out, its edge white, cracks running in it.
func _ice_sheet(b: Dictionary) -> void:
	var bt: float = b["t"]
	var r: float = b["r"]
	var u := _ease(bt / 0.22)
	var fade := _c01((0.9 - bt) / 0.5)
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"])
	var rx := r * 22.6 * u
	var sd: int = b["seed"]
	# (the sheet, a glaze over the ice already there)
	var rows := _ri(rx * 0.5)
	_ga(0.35 * fade)
	_fs(ICE[4])
	for j in range(-rows, rows + 1):
		var w := rx * sqrt(maxf(0.0, 1.0 - pow(float(j) / maxf(1.0, rows), 2.0)))
		_fill(_ri(cx - w), _ri(cy + j), _ri(w * 2.0), 1)
	# (its white edge going out)
	_ga(0.95 * fade)
	_fs(ICE[5])
	_ring(b["x"], b["y"], r * u, 0)
	# (cracks run in it from the middle)
	_ga(0.8 * fade)
	_fs(ICE[5])
	for i in 7:
		var a := float(i) / 7.0 * TAU + _rh(sd, i) * 0.6
		var len := rx * (0.55 + 0.4 * _rh(sd, i + 9))
		var ex: float = cx + cos(a) * len
		var ey: float = cy + sin(a) * len * 0.5
		var mx := (cx + ex) * 0.5 + (_rh(sd, i + 20) - 0.5) * 6.0
		var my := (cy + ey) * 0.5 + (_rh(sd, i + 30) - 0.5) * 3.0
		_line(cx, cy, mx, my, 1)
		_line(mx, my, ex, ey, 1)
	_glow(cx, cy, rx * 0.8 + 10.0, ICE[4], 0.6 * fade)
	_ga(1.0)


# ---- REKINDLE
## A burn gone out sinking to embers on it, a breath, then flaring back up in tongues of flame.
func _rekindle(b: Dictionary) -> void:
	var bt: float = b["t"]
	var m = b["m"]
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"])
	var half := _half(m)
	var top := _mid(m) * 2.0
	var sd: int = b["seed"]
	if bt < 0.35:
		# (embers, dimming and brightening as if breathed on)
		var pulse := 0.5 + 0.5 * sin(bt * 30.0)
		for i in 7:
			var ex: float = cx + (_rh(sd, i) - 0.5) * half * 1.6
			var ey: float = cy - _rh(sd, i + 7) * top * 0.8
			_ga(0.6 + 0.4 * pulse)
			_fs(FIRE[2] if pulse < 0.5 else FIRE[3])
			_fill(_ri(ex), _ri(ey), 1, 1)
			_glow(ex, ey, 4.0, FIRE[3], 0.3 * pulse)
		return
	var u := (bt - 0.35) / 0.75
	var rise := _ease(u * 3.0)
	var fade := _c01((1.0 - u) / 0.4)
	# (tongues of flame up off it, leaping by turns)
	for i in 6:
		var fx0: float = cx - half + (2.0 * half) * float(i) / 5.0
		var hgt := top * (0.55 + 0.45 * _rh(sd, i + 40)) * rise * (0.75 + 0.25 * sin(t * 18.0 + i * 1.7))
		var w := 3 if i % 2 == 0 else 2
		var yy := 0.0
		while yy < hgt:
			var v := yy / maxf(1.0, hgt)
			_ga(fade)
			_fs(_tone(PackedColorArray([FIRE[5], FIRE[4], FIRE[3], FIRE[2], FIRE[1]]), v))
			var sway := sin(t * 14.0 + i + v * 4.0) * v * 2.0
			_fill(_ri(fx0 + sway) - (1 if w == 3 else 0), _ri(cy - yy), _ri(w * (1.0 - v * 0.6)) + 1, 2)
			yy += 2.0
	_glow(cx, cy - top * 0.4, 30.0, FIRE[3], 0.7 * fade)
	_glow(cx, cy - top * 0.4, 16.0, FIRE[5], 0.6 * fade * (1.0 - u))
	_ga(1.0)


## Behind: the burnt ground flaring up again in a ring from the middle out.
func _fire_ring(b: Dictionary) -> void:
	var bt: float = b["t"]
	var r: float = b["r"]
	var u := _ease(bt / 0.6)
	var fade := _c01((1.0 - bt) / 0.4)
	var rt := r * u
	var n := maxi(8, _ri(rt * 10.0))
	for i in n:
		var a := float(i) / n * TAU + bt
		var x: float = float(b["x"]) + cos(a) * rt * 0.7
		var y: float = float(b["y"]) + sin(a) * rt * 0.7
		var sx := _wx(x, y)
		var sy := _wy(x, y)
		var hgt := (12.0 - 8.0 * u) * (0.6 + 0.4 * sin(t * 20.0 + i))
		var yy := 0.0
		while yy < hgt:
			var v := yy / maxf(1.0, hgt)
			_ga(fade)
			_fs(_tone(PackedColorArray([FIRE[5], FIRE[4], FIRE[3], FIRE[2]]), v))
			_fill(_ri(sx), _ri(sy - yy), 2, 2)
			yy += 2.0
	_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]), rt * 22.0 + 12.0, FIRE[3], 0.6 * fade)
	_ga(1.0)


# ---- FLURRY
## Each quick use another green crescent fanned round the blow, up to four, one after another.
func _crescents(b: Dictionary) -> void:
	var R := ramp("flurry")
	var n: int = b["n"]
	var bt: float = b["t"]
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"]) - 12.0
	var face := atan2(float(b["dy"]) + float(b["dx"]), float(b["dx"]) - float(b["dy"])) if absf(float(b["dx"])) + absf(float(b["dy"])) > 0.01 else 0.0
	for k in n:
		var s := bt - 0.045 * k
		if s < 0.0 or s > 0.26:
			continue
		var u := s / 0.26
		var a0 := face + (float(k) - (n - 1) * 0.5) * 0.7
		var rr := 20.0 + 5.0 * k
		var sweep := 1.8 * _ease(u * 2.0)
		var fade := 1.0 - _c01((u - 0.5) / 0.5)
		for i in 16:
			var v := float(i) / 15.0
			var a := a0 - 0.9 + sweep * v
			var x := cx + cos(a) * rr
			var y := cy + sin(a) * rr * 0.55
			var thick := sin(v * PI)
			_ga(fade * (0.4 + 0.6 * thick))
			_fs(R[2])
			_fill(_ri(x) - 2, _ri(y) - 1, 4, 3)
			_fs(R[3])
			_fill(_ri(x) - 1, _ri(y) - 1, 3, 2)
			_fs(R[5] if thick > 0.6 else R[4])
			_fill(_ri(x), _ri(y) - 1, 2, 1)
		_glow(cx + cos(a0) * rr, cy + sin(a0) * rr * 0.55, 12.0, R[4], 0.4 * fade)
	_ga(1.0)


## Four marks at his feet lighting as the blows stack, fading if he waits.
func _flurry_pips(b: Dictionary) -> void:
	var R := ramp("flurry")
	var n: int = b["n"]
	var bt: float = b["t"]
	var fade := _c01((1.1 - bt) / 0.4)
	var h = fx.hero()
	var hx: float = h.world.x if h != null else float(b["x"])
	var hy: float = h.world.y if h != null else float(b["y"])
	var cx := _wx(hx, hy)
	var cy := _wy(hx, hy) + 5.0
	for i in 4:
		var x := cx + (float(i) - 1.5) * 7.0
		var lit := i < n
		_ga((1.0 if lit else 0.5) * fade)
		_fs(R[4] if lit else R[1])
		_fill(_ri(x) - 1, _ri(cy), 3, 1)
		_fill(_ri(x), _ri(cy) - 1, 1, 3)
		if lit:
			_fs(R[5])
			_fill(_ri(x), _ri(cy), 1, 1)
			_glow(x, cy, 7.0, R[4], 0.5 * fade)
	_ga(1.0)


## Behind: green wind whipping round him as the speed takes him.
func _wind(b: Dictionary) -> void:
	var R := ramp("flurry")
	var bt: float = b["t"]
	var h = fx.hero()
	var hx: float = h.world.x if h != null else float(b["x"])
	var hy: float = h.world.y if h != null else float(b["y"])
	var cx := _wx(hx, hy)
	var cy := _wy(hx, hy) - 10.0
	var fade := _c01((0.7 - bt) / 0.3)
	for k in 4:
		var a0 := bt * 9.0 + float(k) * TAU / 4.0
		var rr := 12.0 + 3.0 * k
		for i in 10:
			var v := float(i) / 9.0
			var a := a0 - v * 1.4
			_ga(fade * (1.0 - v))
			_fs(R[5] if i < 2 else R[4])
			_fill(_ri(cx + cos(a) * rr), _ri(cy + sin(a) * rr * 0.5 + float(k) * 3.0 - 4.0), 1, 1)
	_ga(1.0)


# ---- AFTERSHOCK
## A beat after the blow: the floor under it bulging, cracks running white-hot out of it, then bursting in dust and stones.
func _aftershock_floor(b: Dictionary) -> void:
	var bt: float = b["t"]
	var r: float = b["r"]
	if bt < 0.16:
		var u := _ease(bt / 0.16)
		var cx := _wx(b["x"], b["y"])
		var cy := _wy(b["x"], b["y"])
		# (the floor swelling: rings of it rising one inside another)
		for k in 3:
			var rt := r * (0.25 + 0.2 * k) * u
			_ga(0.8)
			_fs(STONE[3 + (k % 2)])
			_ring(b["x"], b["y"], rt, 0, 0.0, (3 - k) * 2.0 * u)
		_glow(cx, cy, 20.0 * u + 6.0, STONE[4], 0.5 * u)
	_cracks(b, r, 1.0 - _c01((bt - 0.2) / 1.2), _c01(bt / 0.16))
	if bt >= 0.16:
		var u := _ease((bt - 0.16) / 0.3)
		var fade := _c01((1.0 - (bt - 0.16)) / 0.5)
		_ga(0.9 * fade)
		_fs(STONE[4])
		_ring(b["x"], b["y"], r * u, 0)
		_ga(0.5 * fade)
		_fs(DUST[3])
		_ring(b["x"], b["y"], r * u * 0.85, 2)
	_ga(1.0)


func _aftershock_air(b: Dictionary) -> void:
	var bt: float = b["t"]
	if bt < 0.16 or bt > 0.45:
		return
	var u := (bt - 0.16) / 0.29
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"])
	_glow(cx, cy - 6.0, 40.0 * float(b["r"]) / 1.8, STONE[5], 0.8 * (1.0 - u))
	_glow(cx, cy - 6.0, 24.0, Color.WHITE, 0.6 * (1.0 - u))


## Cracks run out over the floor from the middle, white-hot as they open (`hot`), cooling to bronze.
func _cracks(b: Dictionary, r: float, fade: float, grow: float) -> void:
	if fade <= 0.0:
		return
	var sd: int = b["seed"]
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"])
	var bt: float = b["t"]
	var hot := 1.0 - _c01(bt / 0.5)
	for i in 8:
		var a := float(i) / 8.0 * TAU + _rh(sd, i) * 0.5
		var len := r * 22.6 * (0.55 + 0.45 * _rh(sd, i + 8)) * maxf(grow, 0.0)
		var px := cx
		var py := cy
		for s in 4:
			var v := float(s + 1) / 4.0
			var jx := (_rh(sd, i * 13 + s) - 0.5) * 5.0
			var nx := cx + cos(a) * len * v + jx
			var ny := cy + sin(a) * len * v * 0.5 + jx * 0.3
			_ga(0.85 * fade)
			_fs(Color("#120c08"))
			_line(px, py + 1.0, nx, ny + 1.0, 2)
			_fs(_tone(PackedColorArray([STONE[3], STONE[4], STONE[5], Color.WHITE]), hot * (1.0 - v * 0.5)))
			_line(px, py, nx, ny, 1)
			px = nx
			py = ny
	_ga(1.0)
