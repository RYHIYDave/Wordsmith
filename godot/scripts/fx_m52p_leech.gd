## LEECH'S FIVE AND VOLATILE'S TWO, PAINTED (the Floor 6–10 Meld Animations, approved 23 Nov 2026), with the kit's brushes
## (fx_m52kit.gd), as the game paints its own melds. Leech's own red wisps of life curving into him stay as the game draws them
## (fx_words610.gd); Volatile's violet sparks and blasts too. Each meld's own moment, here:
##   BLOODLUST  at full life, the wisps that cannot go in wrapping his weapon as red fire, and what he hits flashing red-hot; an
##              orb taken, a red pulse through him; on a monster at full life, its fists glowing red-hot.
##   COLDBLOOD  a chilled or frozen one giving up twice the wisps, pale blue, with a puff of cold; one dying on the ice giving up
##              its orb in a blue column of frost; on a monster, twice the wisps out of him into it.
##   CONDUIT    a bright bead of life running back along each bolt into him; on a monster, beads into the monsters near him.
##   SECOND WIND  each heal landing with a gust of green wind round him; an orb taken, green wind wrapping him; on a monster, a gust
##              whipping round it as it speeds up.
##   MARROW     three thick bone-white wisps drawn out of the stunned one; the cracks staggering one, a thin wisp along them to him;
##              on a monster, a thick wisp torn out of him into it.
##   QUICKFUSE  no pause before the pop: what it kills blowing apart at once in a violet star, wind streaks flung out of it; its
##              rune behind, a fuse of sparks racing round its edge; on a monster, a fuse fizzing on it.
##   CONCUSSION a violet blast with a heavy bronze shock ring; its rune behind leaving cracks glowing violet; on a monster, its
##              dying blast's ring round him.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["bloodlust", "coldblood", "conduit", "secondwind", "marrow", "quickfuse", "concussion"]
const PALE := [Color("#0c1428"), Color("#1c2c58"), Color("#4c64b8"), Color("#a8b8f8"), Color("#d8e0ff"), Color("#ffffff")]
const BONE := [Color("#2a241c"), Color("#5a4c3c"), Color("#a8967c"), Color("#ead6bc"), Color("#f8eedc"), Color("#ffffff")]
const BRONZE := [Color("#1a1208"), Color("#3a2a16"), Color("#7a5a30"), Color("#b89a62"), Color("#e8cc90"), Color("#fff4d8")]


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var R := ramp(b["id"])
	var mid := _mid(b["m"])
	match "%s:%s" % [b["id"], b["what"]]:
		"bloodlust:fury":
			b["end"] = 0.6
			for i in 8:
				_bit(b["x"], b["y"], mid, "streak", PackedColorArray([R[3], R[4], R[5]]), 2.4, 0.35, 120, 20, 90)
		"bloodlust:orb":
			b["end"] = 0.7
			for i in 10:
				_bit(b["x"], b["y"], 6, "dot", PackedColorArray([R[3], R[4], R[5]]), 0.4, 0.8, -20, 20, 40)
		"bloodlust:foe":
			b["end"] = 0.5
		"coldblood:drink":
			b["end"] = 0.75
			for i in 6:
				_bit(b["x"], b["y"], mid, "puff", PackedColorArray([PALE[5], PALE[4], PALE[3]]), 0.6, 0.6, -4, 4, 12)
		"coldblood:orb":
			b["end"] = 1.0
			for i in 10:
				_bit(b["x"], b["y"], 30, "streak", PackedColorArray([PALE[4], PALE[5]]), 0.6, 0.7, 60, -30, 0)
		"coldblood:foe", "marrow:foe", "conduit:foe":
			b["end"] = 0.6
		"conduit:bead":
			b["end"] = 0.42
		"secondwind:wind":
			b["end"] = 0.6
			for i in 8:
				_bit(b["x"], b["y"], 6, "streak", PackedColorArray([R[3], R[4], R[5]]), 2.6, 0.35, 0, 4, 12)
		"secondwind:orb":
			b["end"] = 0.9
		"secondwind:foe":
			b["end"] = 0.5
		"marrow:drink":
			b["end"] = 0.6
		"marrow:drain":
			b["end"] = 0.5
		"quickfuse:pop":
			b["end"] = 0.5
			for i in 16:
				_bit(b["x"], b["y"], 10, "streak", PackedColorArray([R[3], R[4], R[5]]), 4.4, 0.35, 120, 20, 110)
			for i in 8:
				_bit(b["x"], b["y"], 4, "streak", PackedColorArray([Color("#b0e08c"), Color("#e8fff0")]), 5.0, 0.3, 0, 0, 8)
			fx.kick(1.5)
		"concussion:boom", "concussion:foe":
			b["end"] = 0.7
			for i in 12:
				_bit(b["x"], b["y"], 3, "puff", PackedColorArray(DUST), 1.6, 0.8, -6, 4, 12)
			for i in 14:
				_bit(b["x"], b["y"], 10, "streak", PackedColorArray([R[3], R[4], R[5]]), 3.6, 0.35, 120, 20, 100)
			fx.kick(2.5)
		_:
			return false
	return true


func ongoing(dt: float) -> void:
	var h = fx.hero()
	if h == null or h.monsters == null or not is_instance_valid(h.monsters):
		return
	# (Quickfuse on a monster: a fuse fizzing on it)
	if randf() < dt * 14.0:
		var R := ramp("quickfuse")
		for o in h.monsters.list:
			if is_instance_valid(o) and not o.dead and o.words.has("quickfuse"):
				bits.append({"x": o.world.x + (randf() - 0.5) * 0.2, "y": o.world.y, "z": _mid(o) * 1.6, "vx": (randf() - 0.5) * 0.8, "vy": (randf() - 0.5) * 0.8, "vz": 30.0,
					"fall": 160.0, "t": 0.0, "life": 0.3, "ramp": PackedColorArray([Color("#ffd060"), R[4], R[5]]), "kind": "streak", "size": 1.0})


func paint_floor(b: Dictionary) -> void:
	match "%s:%s" % [b["id"], b["what"]]:
		"bloodlust:orb", "secondwind:wind":
			var R := ramp(b["id"])
			var bt: float = b["t"]
			for k in 2:
				var u := _ease((bt - k * 0.12) / 0.4)
				if u <= 0.0:
					continue
				_ga(0.9 * (1.0 - u))
				_fs(R[4] if k == 0 else R[3])
				var hh := _hero_at(b)
				_ring(hh.x, hh.y, 0.2 + 0.9 * u, 0 if b["id"] == "bloodlust" else 3, bt * 6.0)
		"concussion:boom", "concussion:foe":
			_shock(b)
		"coldblood:orb":
			var bt: float = b["t"]
			_ga(0.8 * _c01(1.0 - bt))
			_fs(PALE[4])
			_ring(b["x"], b["y"], 0.35 + 0.3 * _ease(bt * 3.0), 2)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var hh := _hero_at(b)
	match "%s:%s" % [b["id"], b["what"]]:
		"bloodlust:fury":
			# (the life he cannot take in: red fire wrapping his weapon; what he struck flashing red-hot)
			var fade := _c01((0.6 - bt) / 0.3)
			var hx := _wx(hh.x, hh.y) + 6.0
			var hy := _wy(hh.x, hh.y) - 14.0
			_flames(hx, hy + 6.0, 4, 10.0, 14.0, fade, PackedColorArray([R[5], R[4], R[3], R[2]]), sd)
			_glow(hx, hy, 16.0, R[4], 0.6 * fade)
			if bt < 0.2 and not b.get("minor", false):
				var p := _mid_px(b)
				_glow(p.x, p.y, 30.0, R[5], 0.9 * (1.0 - bt / 0.2))
				_glow(p.x, p.y, 18.0, Color.WHITE, 0.6 * (1.0 - bt / 0.2))
		"bloodlust:orb":
			var u := _c01(bt / 0.7)
			_glow(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 12.0, 34.0, R[4], 0.7 * (1.0 - u))
		"bloodlust:foe":
			var p := _mid_px(b)
			var fade := _c01((0.5 - bt) / 0.25)
			_flames(p.x, p.y + 8.0, 3, 12.0, 12.0, fade, PackedColorArray([R[5], R[4], R[3]]), sd)
			_glow(p.x, p.y, 22.0, R[4], 0.7 * fade)
		"coldblood:drink":
			_wisps(b["x"], b["y"], hh.x, hh.y, _c01(bt / 0.55), 4, PackedColorArray(PALE), sd, 2, _mid(b["m"]), 14.0)
			var p := _mid_px(b)
			_glow(p.x, p.y, 22.0, PALE[4], 0.7 * (1.0 - _c01(bt / 0.3)))
		"coldblood:foe":
			_wisps(b["x"], b["y"], b["x1"], b["y1"], _c01(bt / 0.5), 4, PackedColorArray(PALE), sd, 1, 14.0, 14.0)
		"coldblood:orb":
			# (a column of frost going up where it fell, its orb torn out in it)
			var u := _c01(bt / 1.0)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var hgt := 54.0 * _ease(bt / 0.2)
			var fade := 1.0 - _c01((u - 0.5) / 0.5)
			for j in range(0, int(hgt), 2):
				var v := float(j) / maxf(1.0, hgt)
				var w := lerpf(7.0, 2.0, v)
				_ga(fade * (0.85 - v * 0.5))
				_fs(PALE[3] if j % 6 else PALE[4])
				_fill(_ri(cx - w), _ri(cy - j), _ri(w * 2.0), 2)
				_fs(PALE[5])
				_fill(_ri(cx), _ri(cy - j), 1, 2)
			_glow(cx, cy - hgt * 0.5, 30.0, PALE[4], 0.7 * fade)
		"conduit:bead", "conduit:foe":
			# (a bright bead of life running back along the bolt)
			var u := _c01(bt / 0.38)
			var ax := _wx(b["x"], b["y"])
			var ay := _wy(b["x"], b["y"]) - 12.0
			var ex := _wx(b["x1"], b["y1"])
			var ey := _wy(b["x1"], b["y1"]) - 14.0
			var fade := 1.0 - _c01((u - 0.7) / 0.3)
			_bolt(ax, ay, ex, ey, PackedColorArray([R[0], R[1], R[2], R[3], R[4], R[5]]), sd, 0.6 * fade, 2)
			var bx := lerpf(ax, ex, u)
			var by := lerpf(ay, ey, u) - sin(u * PI) * 6.0
			_ga(1.0)
			_fs(R[4])
			_fill(_ri(bx) - 2, _ri(by) - 2, 5, 5)
			_fs(R[5])
			_fill(_ri(bx) - 1, _ri(by) - 1, 3, 3)
			_fs(Color.WHITE)
			_fill(_ri(bx), _ri(by), 1, 1)
			_glow(bx, by, 20.0, R[4], 1.0)
			_glow(bx, by, 10.0, Color.WHITE, 0.6)
		"secondwind:wind", "secondwind:orb", "secondwind:foe":
			# (a gust of green wind whipping round him, or round it)
			var at: Vector2 = Vector2(b["x"], b["y"]) if b["what"] == "foe" else hh
			var dur: float = b["end"]
			var fade := _c01((dur - bt) / (dur * 0.5))
			var cx := _wx(at.x, at.y)
			var cy := _wy(at.x, at.y) - 10.0
			var rise := 1.0 if b["what"] != "orb" else 1.0 + bt * 2.0
			for k in 4:
				var a0 := bt * 10.0 + float(k) * TAU / 4.0
				var rr := 14.0 + 4.0 * k
				for i in 14:
					var v := float(i) / 13.0
					var a := a0 - v * 1.8
					var x := cx + cos(a) * rr
					var y := cy + sin(a) * rr * 0.45 - float(k) * 4.0 * rise + 2.0
					_ga(fade * (1.0 - v * 0.8))
					_fs(R[2])
					_fill(_ri(x) - 1, _ri(y), 3, 2)
					_fs(R[5] if i < 3 else R[4])
					_fill(_ri(x), _ri(y), 2, 1)
			_glow(cx, cy, 30.0, R[4], 0.5 * fade)
		"marrow:drink":
			_wisps(b["x"], b["y"], hh.x, hh.y, _c01(bt / 0.5), 3, PackedColorArray(BONE), sd, 3, _mid(b["m"]), 14.0)
			var p := _mid_px(b)
			_glow(p.x, p.y, 24.0, BONE[4], 0.7 * (1.0 - _c01(bt / 0.3)))
		"marrow:drain":
			_wisps(b["x"], b["y"], b["x1"], b["y1"], _c01(bt / 0.45), 1, PackedColorArray(BONE), sd, 2, 4.0, 14.0)
		"marrow:foe":
			_wisps(b["x"], b["y"], b["x1"], b["y1"], _c01(bt / 0.5), 1, PackedColorArray(BONE), sd, 2, 14.0, 14.0)
		"quickfuse:pop":
			# (a violet star blown apart at once, its spikes thrown out)
			var u := _c01(bt / 0.3)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - 10.0
			var fade := 1.0 - u
			for i in 10:
				var a := float(i) / 10.0 * TAU + _rh(sd, i) * 0.3
				var len := (10.0 + 18.0 * _rh(sd, i + 10)) * _ease(u * 2.0)
				_ga(fade)
				_fs(R[3])
				_line(cx, cy, cx + cos(a) * len, cy + sin(a) * len * 0.7, 2)
				_fs(R[5])
				_line(cx, cy, cx + cos(a) * len * 0.6, cy + sin(a) * len * 0.42, 1)
			_glow(cx, cy, 34.0, R[4], 0.9 * fade)
			_glow(cx, cy, 18.0, Color.WHITE, 0.7 * fade)
		"concussion:boom", "concussion:foe":
			var u := _c01(bt / 0.25)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - 8.0
			_glow(cx, cy, 40.0, R[4], 0.8 * (1.0 - u))
			_glow(cx, cy, 22.0, Color.WHITE, 0.6 * (1.0 - u))
	_ga(1.0)


## Concussion's heavy bronze shock ring, thick, two behind it, the violet of its blast inside.
func _shock(b: Dictionary) -> void:
	var R := ramp("concussion")
	var bt: float = b["t"]
	var r: float = b["r"]
	var u := _ease(bt / 0.32)
	var fade := _c01((0.7 - bt) / 0.35)
	for k in 3:
		var rt := r * u - k * 0.08
		if rt <= 0.0:
			continue
		_ga(fade * (1.0 - k * 0.25))
		_fs(BRONZE[4 - k])
		_ring(b["x"], b["y"], rt, 0)
	_ga(0.6 * fade)
	_fs(R[3])
	_ring(b["x"], b["y"], r * u * 0.6, 2, bt * 5.0)
	_ga(1.0)


func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id: String = str(z.get("m52", ""))
		if id == "quickfuse" and str(z["kind"]) == "rune":
			# (a fuse of sparks racing round the rune's edge)
			var R := ramp("quickfuse")
			var u := _c01(float(z["t"]) / maxf(0.05, float(z["dur"])))
			var a := u * TAU * 1.5
			for k in 6:
				var aa := a - k * 0.18
				var x: float = float(z["x"]) + cos(aa) * float(z["r"]) * 0.7
				var y: float = float(z["y"]) + sin(aa) * float(z["r"]) * 0.7
				_ga(1.0 - k * 0.15)
				_fs(Color("#ffd060") if k == 0 else R[4])
				_fill(_ri(_wx(x, y)) - (1 if k == 0 else 0), _ri(_wy(x, y)) - (1 if k == 0 else 0), 3 if k == 0 else 1, 3 if k == 0 else 1)
				if k == 0:
					_glow(_wx(x, y), _wy(x, y), 10.0, Color("#ffd060"), 0.8)
		elif id == "concussion" and str(z["kind"]) == "cracks":
			# (the cracks its blast left, glowing violet)
			var R := ramp("concussion")
			var sd := _hash(_ri(float(z["x"]) * 100.0), _ri(float(z["y"]) * 100.0))
			var cx := _wx(z["x"], z["y"])
			var cy := _wy(z["x"], z["y"])
			var pulse := 0.6 + 0.4 * sin(t * 4.0)
			for i in 6:
				var a := float(i) / 6.0 * TAU + _rh(sd, i) * 0.6
				var len := float(z["r"]) * 22.6 * (0.5 + 0.4 * _rh(sd, i + 6))
				_ga(0.7 * pulse)
				_fs(R[4])
				_line(cx, cy, cx + cos(a) * len, cy + sin(a) * len * 0.5, 1)
			_glow(cx, cy, float(z["r"]) * 16.0, R[3], 0.35 * pulse)
	_ga(1.0)
