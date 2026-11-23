## VAST'S SEVEN MELDS AS THE FIGHT SHOWS THEM, painted beat by beat as the game's own melds are (fx_melds8.gd), from the Floor 6–10
## Meld Animations he approved (23 Nov 2026: “Good”). The rules tell the moments (melds52_rules.gd, foe_melds52.gd).
##   CATACLYSM  into a crowd of three or more: a star falling into the thick of them, a crater flash, stones and a ring rolling out.
##   MIASMA     the haze of its poison rolling out from what it struck; behind, its ground's haze swelling at the rim.
##   GLACIER    a freeze spreading: ice creeping over the floor to each one touching the frozen, frost bursting on each.
##   INFERNO    what burns leaves fire where it walks: flames along the trail; behind, its fire licking outward.
##   STORMFRONT threads of storm between the ones it struck, lightning flicking along them; behind, its storm a cloud drifting
##              to the nearest, rain under it.
##   GALE       each it strikes blown out on a gust; behind, a wide wind sweeping round him and his allies.
##   EARTHQUAKE the stun rolling out as a wave: the floor heaving up in slabs at its front, cracks and dust behind it.
## On a monster carrying one: its ground under him swelling (Miasma, Glacier, Inferno), a storm gathering over him (Stormfront),
## a gust throwing him back (Gale), the floor heaving round him (Earthquake).
extends "res://scripts/fx_m52kit.gd"

const IDS := ["cataclysm", "miasma", "glacier", "inferno", "stormfront", "gale", "earthquake"]
const EARTH := [Color("#1c140c"), Color("#3e2c1c"), Color("#6a4e32"), Color("#a27a50"), Color("#d0aa7c"), Color("#f0dcb8")]
var _ember := 0.0


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var R := ramp(b["id"])
	match "%s:%s" % [b["id"], b["what"]]:
		"cataclysm:star":
			b["end"] = 1.2
		"miasma:haze":
			b["end"] = 1.4
			for i in 10:
				_bit(b["x"], b["y"], 6, "bubble", PackedColorArray([R[4], R[5], R[3]]), 1.2, 0.7, -10, 10, 30)
		"glacier:spread":
			b["end"] = 0.9
		"gale:blow":
			b["end"] = 0.45
			for i in (2 if b.get("minor", false) else 4):
				_bit(b["x"], b["y"], 2, "puff", PackedColorArray(DUST), 1.6, 0.5, 0, 4, 10)
		"gale:gust":
			b["end"] = 0.8
		"earthquake:wave":
			var sp: float = float(e.get("speed", 7.0))
			b["sp"] = sp
			b["end"] = b["r"] / maxf(1.0, sp) + 0.7
			fx.kick(3.0)
		"stormfront:foe":
			b["end"] = 0.8
		"gale:foe":
			b["end"] = 0.45
			for i in 4:
				_bit(b["x"], b["y"], 2, "puff", PackedColorArray(DUST), 1.6, 0.5, 0, 4, 10)
		"earthquake:foe":
			b["end"] = 0.6
			fx.kick(2.0)
			for i in 8:
				_bit(b["x"], b["y"], 2, "puff", PackedColorArray(DUST), 1.8, 0.7, 0, 4, 14)
		_:
			return false
	return true


func tick(b: Dictionary, dt: float) -> void:
	var bt: float = b["t"]
	match "%s:%s" % [b["id"], b["what"]]:
		"cataclysm:star":
			# (the star strikes: stones and sparks thrown, the floor kicked)
			if bt >= 0.3 and not b.get("hit", false):
				b["hit"] = true
				fx.kick(3.0)
				fx.hold(0.12)
				var R := ramp("cataclysm")
				for i in 12:
					_bit(b["x"], b["y"], 4, "stone", PackedColorArray(EARTH), 2.6, 0.9, 160, 30, 90)
				for i in 16:
					_bit(b["x"], b["y"], 6, "streak", PackedColorArray([R[3], R[4], R[5], Color.WHITE]), 4.0, 0.45, 120, 30, 110)
				for i in 8:
					_bit(b["x"], b["y"], 4, "puff", PackedColorArray(DUST), 1.4, 0.9, 0, 6, 18)
		"earthquake:wave":
			# (dust thrown up along the wave's front as it goes)
			var front: float = minf(b["r"], float(b["sp"]) * bt)
			if front < b["r"] and randf() < dt * 40.0:
				var a := randf() * TAU
				_bit(b["x"] + cos(a) * front, b["y"] + sin(a) * front, 2, "puff", PackedColorArray(DUST), 0.4, 0.7, 0, 6, 16)
				if randf() < 0.5:
					_bit(b["x"] + cos(a) * front, b["y"] + sin(a) * front, 2, "stone", PackedColorArray(EARTH), 1.0, 0.6, 160, 20, 50)


func ongoing(dt: float) -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	_ember += dt
	if _ember < 0.08:
		return
	_ember = 0.0
	# (what its grounds give off: embers, bubbles, frost, dust)
	for z in h.wakes.list:
		var id := _ground_of(z)
		if id == "":
			continue
		var a := randf() * TAU
		var d: float = sqrt(randf()) * float(z["r"])
		var px: float = float(z["x"]) + cos(a) * d
		var py: float = float(z["y"]) + sin(a) * d
		var R := ramp(id)
		match id:
			"inferno":
				_bit(px, py, 4, "dot", PackedColorArray([FIRE[3], FIRE[4], FIRE[5]]), 0.3, 0.8, -20, 10, 30)
			"miasma":
				_bit(px, py, 2, "bubble", PackedColorArray([R[4], R[5], R[3]]), 0.2, 0.6, -10, 5, 14)
			"glacier":
				_bit(px, py, 3, "dot", PackedColorArray([ICE[3], ICE[4], ICE[5]]), 0.2, 0.5, -10, 4, 10)
			"earthquake":
				if randf() < 0.5:
					_bit(px, py, 1, "puff", PackedColorArray(DUST), 0.2, 0.8, 0, 4, 10)


## Which of Vast's grounds `z` is (his behind, a monster's, Inferno's trail), or "".
func _ground_of(z: Dictionary) -> String:
	for k in ["m52", "look", "foe"]:
		var v: String = str(z.get(k, ""))
		if IDS.has(v):
			return v
	return ""


func paint_floor(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	match "%s:%s" % [b["id"], b["what"]]:
		"cataclysm:star":
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			if bt < 0.3:
				# (its shadow on the crowd, growing as it comes)
				var u := bt / 0.3
				var s := lerpf(4.0, 18.0, u)
				_ga(0.35 * u)
				_fs(Color("#0a0606"))
				_fill(_ri(cx - s), _ri(cy - s * 0.5), _ri(s * 2.0), _ri(s))
			else:
				# (the crater: scorched, its rim glowing and cooling; cracks out of it; a ring rolling away)
				var v := (bt - 0.3) / 0.9
				var fade := 1.0 - _c01((v - 0.5) / 0.5)
				_ga(0.7 * fade)
				_fs(EARTH[0])
				_fill(_ri(cx - 18.0), _ri(cy - 7.0), 36, 14)
				_fill(_ri(cx - 13.0), _ri(cy - 9.0), 26, 18)
				for i in 10:
					var a := float(i) / 10.0 * TAU + _rh(sd, i) * 0.4
					var len := 22.0 + 16.0 * _rh(sd, i + 10)
					_ga(0.9 * fade)
					_fs(EARTH[1])
					_line(cx + cos(a) * 12.0, cy + sin(a) * 6.0, cx + cos(a) * len, cy + sin(a) * len * 0.5, 2)
					_fs(_tone(PackedColorArray([R[2], R[3], R[4]]), 1.0 - v))
					_line(cx + cos(a) * 12.0, cy + sin(a) * 6.0, cx + cos(a) * (len - 4.0), cy + sin(a) * (len - 4.0) * 0.5, 1)
				for i in 40:
					var a := float(i) / 40.0 * TAU
					_ga(fade)
					_fs(_tone(PackedColorArray([R[2], R[3], R[4], R[5]]), (1.0 - v) * (0.6 + 0.4 * _rh(sd, i + 30))))
					_fill(_ri(cx + cos(a) * 17.0), _ri(cy + sin(a) * 8.0), 2, 1)
				var rr := _ease(v * 2.5) * 2.4
				_ga(0.8 * (1.0 - _c01(v * 2.5)))
				_fs(R[4])
				_ring(b["x"], b["y"], rr)
				_fs(DUST[3])
				_ring(b["x"], b["y"], rr * 0.85, 3)
		"miasma:haze":
			# (its haze rolling out, puff on puff, to the edge of the blow)
			var u := _ease(bt / 0.9)
			var fade := 1.0 - _c01((bt - 0.8) / 0.6)
			var rr: float = b["r"] * u
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var n := 36
			for i in n:
				var a := float(i) / n * TAU + _rh(sd, i) * 0.3 + t * 0.4
				var d := rr * (0.7 + 0.3 * _rh(sd, i + 20))
				var x := cx + cos(a) * d * 22.6
				var y := cy + sin(a) * d * 11.3
				_puff(x, y, 3.0 + 2.5 * _rh(sd, i + 40) + 1.5 * u, R, 0.5 * fade)
			_ga(0.25 * fade)
			_fs(R[2])
			_ring(b["x"], b["y"], rr * 0.6, 2, t)
		"glacier:spread":
			# (ice creeping over the floor to each one touching the frozen; frost bursting on each as it gets there)
			var u := _c01(bt / 0.35)
			var fade := 1.0 - _c01((bt - 0.55) / 0.35)
			var sx := _wx(b["x"], b["y"])
			var sy := _wy(b["x"], b["y"])
			var k := 0
			for p in b["e"].get("to", []):
				var ex := _wx(p.x, p.y)
				var ey := _wy(p.x, p.y)
				var n := 10
				for i in n:
					var v := float(i + 1) / float(n)
					if v > u:
						break
					var x := lerpf(sx, ex, v) + (_rh(sd, k * 20 + i) - 0.5) * 6.0
					var y := lerpf(sy, ey, v) + (_rh(sd, k * 20 + i + 7) - 0.5) * 3.0
					var hh := 3.0 + 6.0 * _rh(sd, k * 20 + i + 11)
					_ga(0.9 * fade)
					_fs(ICE[1])
					_fill(_ri(x) - 2, _ri(y) - 1, 5, 3)
					_fs(ICE[3])
					_fill(_ri(x) - 1, _ri(y - hh), 2, _ri(hh))
					_fs(ICE[5])
					_fill(_ri(x) - 1, _ri(y - hh), 1, 2)
				if bt >= 0.35:
					var w := _c01((bt - 0.35) / 0.3)
					_ga(0.9 * (1.0 - w))
					_fs(ICE[4])
					_ring(p.x, p.y, 0.3 + 0.6 * _ease(w))
					_fs(ICE[3])
					_ring(p.x, p.y, 0.2 + 0.4 * _ease(w), 2)
				k += 1
		"gale:gust":
			# (a wide wind sweeping round him and his allies)
			var hh := _hero_at(b)
			var u := _ease(bt / 0.6)
			var fade := 1.0 - _c01((bt - 0.5) / 0.3)
			var rr: float = lerpf(0.6, b["r"] * 0.55, u)
			var cx := _wx(hh.x, hh.y)
			var cy := _wy(hh.x, hh.y)
			for k in 3:
				var a0 := float(k) / 3.0 * TAU + bt * 7.0
				for i in 22:
					var a := a0 + float(i) * 0.07
					var d := rr * (1.0 - float(i) * 0.012)
					var x := cx + cos(a) * d * 22.6
					var y := cy + sin(a) * d * 11.3
					var v := float(i) / 21.0
					_ga(fade * (1.0 - v * 0.6))
					_fs(R[1])
					_fill(_ri(x) - 1, _ri(y), 4, 2)
					_fs(R[5] if i < 3 else (R[4] if i < 10 else R[3]))
					_fill(_ri(x), _ri(y), 2, 1)
			_ga(0.3 * fade)
			_fs(R[3])
			_ring(hh.x, hh.y, rr * 0.7, 3, -bt * 5.0)
		"earthquake:wave":
			# (the floor heaving up in slabs at the wave's front, cracks and dust behind it)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var front: float = minf(b["r"], float(b["sp"]) * bt)
			var ends: float = b["r"] / maxf(1.0, float(b["sp"]))
			var fade := 1.0 - _c01((bt - ends) / 0.7)
			for i in 12:
				var a := float(i) / 12.0 * TAU + _rh(sd, i) * 0.4
				var len: float = front * 22.6 * (0.7 + 0.3 * _rh(sd, i + 12))
				var px := cx
				var py := cy
				for j in 4:
					var v := float(j + 1) / 4.0
					var qa := a + (_rh(sd, i * 8 + j) - 0.5) * 0.5
					var qx := cx + cos(qa) * len * v
					var qy := cy + sin(qa) * len * v * 0.5
					_ga(0.9 * fade)
					_fs(EARTH[0])
					_line(px, py, qx, qy, 2)
					_fs(EARTH[4])
					_line(px, py - 1.0, qx, qy - 1.0, 1)
					px = qx
					py = qy
			if front < b["r"]:
				var n := maxi(14, _ri(front * 22.6 * 0.8))
				for i in n:
					var a := float(i) / n * TAU + _rh(sd, i + 50) * 0.2
					var x := cx + cos(a) * front * 22.6
					var y := cy + sin(a) * front * 11.3
					var lift := 4.0 + 5.0 * _rh(sd, i + 70)
					_shard(x, y, 6.0, lift, EARTH, sd + i)
		"earthquake:foe":
			var u := _ease(bt / 0.35)
			var fade := 1.0 - _c01((bt - 0.3) / 0.3)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			var rr: float = b["r"] * u
			# (the floor round him heaving up in jagged slabs, cracks running out between them)
			for i in 22:
				var a := float(i) / 22.0 * TAU + _rh(sd, i + 40) * 0.25
				var x := cx + cos(a) * rr * 22.6
				var y := cy + sin(a) * rr * 11.3
				var lift := 4.0 + 6.0 * _rh(sd, i)
				_shard(x, y, 5.0 + 3.0 * _rh(sd, i + 60), lift * (0.4 + 0.6 * u), EARTH, sd + i, fade)
				var px := cx + cos(a) * rr * 22.6 * 0.4
				var py := cy + sin(a) * rr * 11.3 * 0.4
				_ga(0.8 * fade)
				_fs(EARTH[0])
				_line(px, py, x, y, 1)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	match "%s:%s" % [b["id"], b["what"]]:
		"cataclysm:star":
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - 10.0
			if bt < 0.3:
				# (the star falling into the thick of them, its trail behind it)
				var u := bt / 0.3
				var sx := cx - 40.0
				var sy := cy - 120.0
				var k := pow(u, 1.5)
				var hx := lerpf(sx, cx, k)
				var hy := lerpf(sy, cy, k)
				for i in 14:
					var v := float(i) / 14.0
					var x := lerpf(hx, sx, v * 0.6)
					var y := lerpf(hy, sy, v * 0.6)
					var w := _ri(lerpf(6.0, 1.0, v))
					_ga(0.9 * (1.0 - v))
					_fs(_tone(PackedColorArray([R[2], R[3], R[4], R[5]]), 1.0 - v))
					_fill(_ri(x) - int(w / 2.0), _ri(y) - int(w / 2.0), w, w)
				# (its head a four-pointed star, glinting)
				_ga(1.0)
				_fs(R[3])
				_fill(_ri(hx) - 9, _ri(hy) - 1, 18, 3)
				_fill(_ri(hx) - 1, _ri(hy) - 9, 3, 18)
				_fs(R[4])
				_fill(_ri(hx) - 4, _ri(hy) - 3, 9, 7)
				_fill(_ri(hx) - 3, _ri(hy) - 4, 7, 9)
				_fs(Color.WHITE)
				_fill(_ri(hx) - 2, _ri(hy) - 2, 5, 5)
				_fill(_ri(hx) - 6, _ri(hy), 13, 1)
				_fill(_ri(hx), _ri(hy) - 6, 1, 13)
				_glow(hx, hy, 30.0, R[4], 1.0)
				_glow(hx, hy, 14.0, Color.WHITE, 0.6)
			else:
				# (the strike: a white flash, a column of light up out of it)
				var v := (bt - 0.3) / 0.9
				if v < 0.35:
					var w := v / 0.35
					_glow(cx, cy, lerpf(30.0, 60.0, w), R[4], 1.0 - w)
					_glow(cx, cy, 24.0, Color.WHITE, (1.0 - w) * 0.9)
					var tall := 80.0 * (1.0 - w)
					_ga(0.6 * (1.0 - w))
					_fs(R[3])
					_fill(_ri(cx) - 6, _ri(cy - tall), 12, _ri(tall))
					_ga(1.0 - w)
					_fs(R[5])
					_fill(_ri(cx) - 4, _ri(cy - tall), 8, _ri(tall))
					_fs(Color.WHITE)
					_fill(_ri(cx) - 2, _ri(cy - tall), 4, _ri(tall))
					for g in 3:
						_glow(cx, cy - tall * (0.2 + 0.3 * g), 20.0, R[4], 0.7 * (1.0 - w))
				_glow(cx, cy + 10.0, 18.0, R[3], 0.5 * (1.0 - v))
		"glacier:spread":
			if bt >= 0.35:
				var w := _c01((bt - 0.35) / 0.3)
				for p in b["e"].get("to", []):
					_glow(_wx(p.x, p.y), _wy(p.x, p.y) - 10.0, 18.0, ICE[4], 0.8 * (1.0 - w))
					for i in 6:
						var a := float(i) / 6.0 * TAU
						var x := _wx(p.x, p.y) + cos(a) * (4.0 + 10.0 * w)
						var y := _wy(p.x, p.y) - 10.0 + sin(a) * (4.0 + 10.0 * w) * 0.7
						_ga(1.0 - w)
						_fs(ICE[5])
						_fill(_ri(x), _ri(y), 2, 2)
		"gale:blow":
			# (it blown out on a gust: streaks of wind past it, outward from him)
			var hh := _hero_at(b)
			var dir := Vector2(b["x"] - hh.x, b["y"] - hh.y)
			dir = dir.normalized() if dir.length() > 0.01 else Vector2(1, 0)
			var u := _c01(bt / 0.45)
			var fade := 1.0 - u
			var n := 3 if b.get("minor", false) else 5
			for k in n:
				var side := (float(k) - (n - 1) * 0.5) * 0.3
				var off := Vector2(-dir.y, dir.x) * side
				var a: Vector2 = Vector2(b["x"], b["y"]) + off - dir * (1.0 - u * 0.8)
				var c: Vector2 = a + dir * (1.1 + 0.4 * _rh(sd, k))
				var ax := _wx(a.x, a.y)
				var ay := _wy(a.x, a.y) - 6.0 - k * 4.0
				var cx := _wx(c.x, c.y)
				var cy := _wy(c.x, c.y) - 6.0 - k * 4.0
				_ga(0.9 * fade)
				_fs(R[0])
				_line(ax, ay + 1.0, cx, cy + 1.0, 4)
				_fs(R[4] if k % 2 == 0 else R[5])
				_line(ax, ay, cx, cy, 2)
				# (its end curling up)
				_fs(R[5])
				_line(cx, cy, cx + 3.0, cy - 3.0, 2)
				_fs(Color.WHITE)
				_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 2)
			_glow(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - 10.0, 16.0, R[4], 0.5 * fade)
		"gale:foe":
			# (a gust throwing him back)
			var dir := Vector2(b["dx"], b["dy"])
			dir = dir.normalized() if dir.length() > 0.01 else Vector2(1, 0)
			var u := _c01(bt / 0.45)
			for k in 4:
				var side := (float(k) - 1.5) * 0.3
				var a: Vector2 = Vector2(b["x"], b["y"]) + Vector2(-dir.y, dir.x) * side - dir * (1.2 - u)
				var c: Vector2 = a + dir * 0.9
				_ga(0.8 * (1.0 - u))
				_fs(ramp("gale")[1])
				_line(_wx(a.x, a.y), _wy(a.x, a.y) - 10.0 - k * 3.0 + 1.0, _wx(c.x, c.y), _wy(c.x, c.y) - 10.0 - k * 3.0 + 1.0, 2)
				_fs(ramp("gale")[4])
				_line(_wx(a.x, a.y), _wy(a.x, a.y) - 10.0 - k * 3.0, _wx(c.x, c.y), _wy(c.x, c.y) - 10.0 - k * 3.0, 1)
		"stormfront:foe":
			# (a storm gathering over him: dark cloud, a flicker in it, rain)
			var u := _ease(bt / 0.3)
			var fade := 1.0 - _c01((bt - 0.6) / 0.2)
			_cloud(b["x"], b["y"], 36.0, b["r"] * u, R, sd, fade)
	_ga(1.0)


## A puff of haze at (x, y) on the screen, `s` px: a rounded heap, dark under, lit on top.
func _puff(x: float, y: float, s: float, R: PackedColorArray, a: float) -> void:
	_ga(a)
	_fs(R[2])
	_fill(_ri(x - s), _ri(y - s * 0.3), _ri(s * 2.0), _ri(s * 0.6) + 1)
	_fill(_ri(x - s * 0.7), _ri(y - s * 0.6), _ri(s * 1.4), _ri(s * 0.3) + 1)
	_fill(_ri(x - s * 0.75), _ri(y + s * 0.3), _ri(s * 1.5), 1)
	_fs(R[3])
	_fill(_ri(x - s * 0.6), _ri(y - s * 0.5), _ri(s * 1.2), _ri(s * 0.45) + 1)
	_fs(R[4])
	_fill(_ri(x - s * 0.3), _ri(y - s * 0.55), _ri(s * 0.6), 1)


## A storm cloud `z` px over (x, y), `rt` tiles across: heaped puffs, dark under and lit on top, lightning flickering in it and
## lighting it, rain slanting down from it.
const STORM := [Color("#181a28"), Color("#262a40"), Color("#3a3e5a"), Color("#565c7e"), Color("#7c82a6")]


func _cloud(x: float, y: float, z: float, rt: float, R: PackedColorArray, sd: int, fade: float) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y) - z
	var w := clampf(rt * 16.0, 10.0, 30.0)
	var lit := _rh(sd, int(t * 12.0)) < 0.35
	# (rain)
	for i in 16:
		var rx := cx + (_rh(sd, i) - 0.5) * w * 2.0
		var v := fmod(t * 2.2 + _rh(sd, i + 30), 1.0)
		_ga(0.55 * fade * (1.0 - v * 0.5))
		_fs(R[3] if i % 3 else ICE[4])
		_fill(_ri(rx - v * 5.0), _ri(cy + 5.0 + v * (z - 6.0)), 1, 4)
	# (the cloud: each puff a rounded heap, its underside dark, its top lit)
	var puffs: Array = []
	for i in 8:
		var px := cx + (float(i) / 7.0 - 0.5) * w * 2.0 + (_rh(sd, i + 60) - 0.5) * 6.0
		var py := cy - sin(float(i) / 7.0 * PI) * 6.0 + (_rh(sd, i + 70) - 0.5) * 3.0 + sin(t * 1.5 + i) * 0.8
		var s := 5.0 + 4.0 * _rh(sd, i + 80) + sin(float(i) / 7.0 * PI) * 3.0
		puffs.append(Vector3(px, py, s))
	for layer in 3:
		for p: Vector3 in puffs:
			var s := p.z
			var col: Color = [STORM[0], STORM[2], STORM[3]][layer]
			if lit and layer > 0:
				col = col.lerp(R[4], 0.35)
			var dy: float = [2.0, 0.0, -s * 0.45][layer]
			var k: float = [1.0, 0.9, 0.5][layer]
			_ga(0.92 * fade)
			_fs(col)
			_fill(_ri(p.x - s * k), _ri(p.y + dy - s * 0.35 * k), _ri(s * 2.0 * k), _ri(s * 0.7 * k) + 1)
			_fill(_ri(p.x - s * 0.7 * k), _ri(p.y + dy - s * 0.6 * k), _ri(s * 1.4 * k), _ri(s * 0.3 * k) + 1)
	# (a flicker in it, now and then a bolt out of the bottom)
	if lit:
		var fx0 := cx + (_rh(sd + 1, int(t * 12.0)) - 0.5) * w * 1.4
		_glow(fx0, cy - 2.0, 26.0, R[4], 0.8 * fade)
		_ga(fade)
		_fs(Color.WHITE)
		_line(fx0, cy + 2.0, fx0 + 3.0, cy + 7.0, 1)
		_line(fx0 + 3.0, cy + 7.0, fx0 - 1.0, cy + 12.0, 1)
		_fs(R[5])
		_line(fx0 - 1.0, cy + 12.0, fx0 + 2.0, cy + 17.0, 1)
	_ga(1.0)


func paint_floor_more() -> void:
	var h = fx.hero()
	if h == null or h.wakes == null or not is_instance_valid(h.wakes):
		return
	for z in h.wakes.list:
		var id := _ground_of(z)
		if id == "":
			continue
		var x: float = z["x"]
		var y: float = z["y"]
		var r: float = z["r"]
		var life := 1.0 - _c01((float(z["t"]) - float(z["dur"]) + 0.6) / 0.6)
		var sd := _hash(_ri(x * 100.0), _ri(y * 100.0))
		var R := ramp(id)
		var cx := _wx(x, y)
		var cy := _wy(x, y)
		match id:
			"miasma":
				# (its haze swelling at the rim, rolling)
				var n := maxi(10, _ri(r * 10.0))
				for i in n:
					var a := float(i) / n * TAU + t * 0.3 + _rh(sd, i) * 0.4
					var px := cx + cos(a) * r * 22.6 * (0.85 + 0.1 * sin(t * 2.0 + i))
					var py := cy + sin(a) * r * 11.3 * (0.85 + 0.1 * sin(t * 2.0 + i))
					_puff(px, py, 3.0 + 3.0 * _rh(sd, i + 20), R, 0.5 * life)
			"glacier":
				# (ice creeping out at its rim: crystals standing up all round it)
				var n := maxi(10, _ri(r * 12.0))
				for i in n:
					var a := float(i) / n * TAU + _rh(sd, i) * 0.3
					var px := cx + cos(a) * r * 22.6
					var py := cy + sin(a) * r * 11.3
					var hh := (3.0 + 6.0 * _rh(sd, i + 20)) * (0.7 + 0.3 * sin(t * 1.5 + i))
					_ga(0.9 * life)
					_fs(ICE[1])
					_fill(_ri(px) - 2, _ri(py) - 1, 4, 2)
					_fs(ICE[3])
					_fill(_ri(px) - 1, _ri(py - hh), 2, _ri(hh))
					_fs(ICE[5])
					_fill(_ri(px) - 1, _ri(py - hh), 1, 1)
			"earthquake":
				# (its cracks heaving: slabs along them rising and settling)
				for i in 8:
					var a := float(i) / 8.0 * TAU + _rh(sd, i) * 0.6
					var d := r * (0.3 + 0.6 * _rh(sd, i + 10))
					var px := cx + cos(a) * d * 22.6
					var py := cy + sin(a) * d * 11.3
					var lift := maxf(0.0, sin(t * 3.0 + float(i) * 1.3)) * 4.0
					_ga(0.6 * life)
					_fs(EARTH[0])
					_fill(_ri(px) - 3, _ri(py), 7, 2)
					_ga(life)
					_fs(EARTH[2])
					_fill(_ri(px) - 3, _ri(py - lift) - 1, 6, 2 + _ri(lift))
					_fs(EARTH[4])
					_fill(_ri(px) - 3, _ri(py - lift) - 1, 6, 1)
	_ga(1.0)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	# (Stormfront: threads of storm between the ones it struck, a bead of lightning running along each)
	for L in h.m52.links:
		var ids: Array = (L["ids"] as Array).filter(func(o): return is_instance_valid(o) and not o.dead)
		var R := ramp("stormfront")
		var fade := _c01(float(L["t"]) / 0.5)
		for j in range(1, ids.size()):
			var a = ids[j - 1]
			var b = ids[j]
			var ax := _wx(a.world.x, a.world.y)
			var ay := _wy(a.world.x, a.world.y) - _mid(a)
			var bx := _wx(b.world.x, b.world.y)
			var by := _wy(b.world.x, b.world.y) - _mid(b)
			var n := maxi(6, _ri(Vector2(bx - ax, by - ay).length() / 2.0))
			var sd := int(a.id) * 31 + int(b.id)
			for i in n + 1:
				var v := float(i) / n
				var sag := sin(v * PI) * 6.0
				var jit := (_rh(sd, int(t * 15.0) * 50 + i) - 0.5) * 3.0
				var x := lerpf(ax, bx, v)
				var y := lerpf(ay, by, v) + sag + jit
				_ga(0.8 * fade)
				_fs(STORM[0])
				_fill(_ri(x) - 1, _ri(y) - 1, 4, 4)
				_ga(fade * (0.75 + 0.25 * sin(t * 20.0 + i * 0.7)))
				_fs(R[4] if (i + int(t * 20.0)) % 5 else Color.WHITE)
				_fill(_ri(x), _ri(y), 2, 2)
			var bead := fmod(t * 1.8 + _rh(sd, 3), 1.0)
			var qx := lerpf(ax, bx, bead)
			var qy := lerpf(ay, by, bead) + sin(bead * PI) * 6.0
			_ga(fade)
			_fs(Color.WHITE)
			_fill(_ri(qx) - 2, _ri(qy) - 2, 4, 4)
			_glow(qx, qy, 14.0, R[4], 0.8 * fade)
			_glow(ax, ay, 10.0, R[3], 0.4 * fade)
	if h.wakes == null or not is_instance_valid(h.wakes):
		_ga(1.0)
		return
	for z in h.wakes.list:
		var id := _ground_of(z)
		if id == "":
			continue
		var x: float = z["x"]
		var y: float = z["y"]
		var r: float = z["r"]
		var life := 1.0 - _c01((float(z["t"]) - float(z["dur"]) + 0.6) / 0.6)
		var sd := _hash(_ri(x * 100.0), _ri(y * 100.0))
		match id:
			"inferno":
				# (its fire licking up all over it)
				var cx := _wx(x, y)
				var cy := _wy(x, y)
				var n := maxi(3, _ri(r * 6.0))
				_flames(cx, cy + 2.0, n, r * 30.0, 10.0 + r * 6.0, 0.85 * life, PackedColorArray([FIRE[1], FIRE[2], FIRE[3], FIRE[4], FIRE[5]]), sd)
				_glow(cx, cy - 4.0, 12.0 + r * 10.0, FIRE[3], 0.45 * life)
			"stormfront":
				if str(z.get("kind", "")) == "storm":
					_cloud(x, y, 40.0, r * 0.8, ramp("stormfront"), sd, life)
	_ga(1.0)
