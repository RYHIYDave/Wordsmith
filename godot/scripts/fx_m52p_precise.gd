## PRECISE'S SIX AND FRENZIED'S SIX, PAINTED (the Floor 6–10 Meld Animations, approved 23 Nov 2026), with the kit's brushes
## (fx_m52kit.gd), as the game paints its own melds. Precise's needle of white light and its sight, Frenzied's ring of five and
## the spark leaping from the fallen, stay as the game draws them (fx_words610.gd). Each meld's own moment, here:
##   DUELIST    one alone: a dueling circle drawn round it on the floor, its hit a white needle and a hot flash; its mark, a small
##              crest of crossed blades over its head; on a monster, a circle round them both in the enemy's pink and gold.
##   NEEDLE     a critical driving three lime needles into it, three drops of venom falling; its mark spent, the poison swelling
##              and bubbling over.
##   BRAND      a critical burning a brand into it, its own symbol, glowing as long as it lasts.
##   SEEKER     a small sight snapping onto each one an arc strikes; its mark, a thin rod of light standing over it.
##   QUICKDRAW  rested, a white glint on his weapon: ready; the draw a long white needle and a snap of wind.
##   PRESSURE POINT  four small white needles closing in on a stunned one from four sides.
##   BERSERK    each use another mark of the five lit in red at his feet, flames licking up them; at five, red steam off him; a
##              kill's spark streaming to him red.
##   FEVER      each use while frenzied another drip of venom falling onto what it hits; a poisoned kill, the ring at his feet
##              sweating green.
##   WHITEOUT   snow whipped round what it hits, the faster the thicker; a kill, a star of frost bursting out from the fallen.
##   OVERCHARGE each use the marks at his feet crackling, one arc more; a kill, a bolt thrown from the fallen to the nearest.
##   BLUR       at a full frenzy, streaks of him trailing a step behind; a kill, a gust lifting him.
##   JUGGERNAUT at a full frenzy, each step shaking dust from the floor; on a monster, its shock ring the bigger the more hurt.
## On a monster carrying one: Quickdraw's glint on its weapon after a pause; Whiteout's snow, Overcharge's crackle and Berserk's
## steam the thicker the more it is hurt; Blur's streaks while it is a blur. And (the check of 26 Nov 2026: these never played on a
## monster) Whiteout's blow whipping snow round him, the thicker the more hurt it is; Overcharge's bolt reaching out to him from it,
## its sparks spattering round his feet.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["duelist", "needle", "brand", "seeker", "quickdraw", "pressurepoint", "berserk", "fever", "whiteout", "overcharge", "blur", "juggernaut"]
const FOE := [Color("#3a0c24"), Color("#7a1c48"), Color("#c83c78"), Color("#ff6aa8"), Color("#ffd27a"), Color("#fff4d8")]
const SNOW := [Color("#1c2c48"), Color("#4c6c98"), Color("#a8c8e8"), Color("#dceeff"), Color("#f4faff"), Color("#ffffff")]
var _step := 0.0


func ids() -> Array:
	return IDS


func begin(b: Dictionary, e: Dictionary) -> bool:
	var R := ramp(b["id"])
	var mid := _mid(b["m"])
	match "%s:%s" % [b["id"], b["what"]]:
		"duelist:alone":
			b["end"] = 0.9
		"duelist:mark", "needle:mark", "brand:mark", "seeker:mark", "quickdraw:mark":
			b["end"] = 0.3
		"needle:three":
			b["end"] = 1.2
			b["a"] = randf() * TAU
		"needle:double":
			b["end"] = 0.6
			for i in 14:
				_bit(b["x"], b["y"], mid, "bubble", PackedColorArray([R[4], R[5], R[3]]), 0.6, 0.6, -10, 10, 30)
		"brand:brand":
			b["end"] = 0.4
			for i in 10:
				_bit(b["x"], b["y"], mid, "streak", PackedColorArray([FIRE[3], FIRE[4], FIRE[5]]), 2.0, 0.35, 120, 20, 80)
		"seeker:seek":
			b["end"] = 0.3
		"quickdraw:draw":
			b["end"] = 0.35
		"quickdraw:crack":
			b["end"] = 0.3
			for i in 10:
				_bit(b["x"], b["y"], 10, "streak", PackedColorArray([R[4], R[5], Color.WHITE]), 4.2, 0.25, 0, 0, 10)
		"pressurepoint:point":
			b["end"] = 0.45
		"duelist:foe", "needle:foe", "brand:foe", "seeker:foe", "quickdraw:foe", "pressurepoint:foe":
			b["end"] = 0.7
		"berserk:stack", "overcharge:charge":
			b["end"] = 0.5
		"berserk:kill", "fever:kill":
			b["end"] = 0.45
		"fever:dose":
			b["end"] = 0.8
		"whiteout:snow":
			b["end"] = 0.7
		"whiteout:foe":
			b["end"] = 0.7
			b["n"] = 1 + int(4.0 * clampf(float(b["r"]), 0.0, 1.0))
			for i in 10 + 4 * int(b["n"]):
				_bit(b["x"], b["y"], 6.0 + randf() * 16.0, "streak", PackedColorArray([SNOW[3], SNOW[4], SNOW[5]]), 2.6, 0.5, 10, 0, 10)
		"overcharge:foe":
			b["end"] = 0.35
			for i in 10:
				_bit(b["x"], b["y"], 2, "streak", PackedColorArray([R[3], R[4], R[5], Color.WHITE]), 2.6, 0.3, 140, 20, 70)
		"whiteout:burst":
			b["end"] = 1.0
			for i in 20:
				_bit(b["x"], b["y"], 6, "streak", PackedColorArray([SNOW[3], SNOW[4], SNOW[5]]), 3.4, 0.6, 120, 20, 80)
		"overcharge:bolt":
			b["end"] = 0.3
		"blur:gust":
			b["end"] = 0.5
		"juggernaut:foe":
			b["end"] = 0.5
			for i in 10:
				_bit(b["x"], b["y"], 2, "puff", PackedColorArray(DUST), 1.4, 0.7, -6, 4, 10)
		_:
			return false
	return true


func ongoing(dt: float) -> void:
	var h = fx.hero()
	if h == null:
		return
	var most := int(preload("res://scripts/words.gd").data()["frenzy"]["max"])
	var full: bool = h.frenzy >= most
	# (Berserk at a full frenzy: red steam off him)
	if full and h.m52.any_has("berserk") and randf() < dt * 16.0:
		var R := ramp("berserk")
		bits.append({"x": h.world.x + (randf() - 0.5) * 0.4, "y": h.world.y + (randf() - 0.5) * 0.4, "z": 6.0 + randf() * 14.0, "vx": 0.0, "vy": 0.0, "vz": 22.0, "fall": 0.0,
			"t": 0.0, "life": 0.8, "ramp": PackedColorArray([R[1], R[2], R[3], R[4]]), "kind": "puff", "size": 2.0})
	# (Blur at a full frenzy: streaks of him trailing behind)
	if full and h.m52.any_has("blur"):
		var R := ramp("blur")
		var back: Vector2 = -h.face
		for n in 2:
			if randf() < dt * 40.0:
				bits.append({"x": h.world.x + back.x * 0.3, "y": h.world.y + back.y * 0.3, "z": 4.0 + randf() * 20.0, "vx": back.x * 2.5, "vy": back.y * 2.5, "vz": 0.0, "fall": 0.0,
					"t": 0.0, "life": 0.35, "ramp": PackedColorArray([R[2], R[3], R[4], R[5]]), "kind": "streak", "size": 1.0})
		if randf() < dt * 12.0:
			bits.append({"x": h.world.x + back.x * 0.5, "y": h.world.y + back.y * 0.5, "z": 8.0 + randf() * 12.0, "vx": back.x * 0.8, "vy": back.y * 0.8, "vz": 0.0, "fall": 0.0,
				"t": 0.0, "life": 0.3, "ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "puff", "size": 3.0})
	# (Juggernaut at a full frenzy: each step shaking dust from the floor)
	if full and h.m52.any_has("juggernaut"):
		_step -= dt
		if _step <= 0.0:
			_step = 0.35
			for i in 5:
				_bit(h.world.x, h.world.y, 1, "puff", PackedColorArray(DUST), 0.9, 0.6, -4, 2, 6)
			beats.append({"id": "juggernaut", "what": "step", "t": 0.0, "x": h.world.x, "y": h.world.y, "m": null, "seed": seeds, "n": 1, "r": 0.6, "dx": 0.0, "dy": 0.0, "done": false, "foe": false, "end": 0.35})
			seeds += 1
	# (the monsters carrying them)
	if h.monsters == null or not is_instance_valid(h.monsters) or randf() > dt * 12.0:
		return
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead or o.words.is_empty():
			continue
		var hurt := clampf(1.0 - float(o.life) / maxf(1.0, float(o.max_life)), 0.0, 1.0)
		if o.words.has("whiteout") and randf() < 0.3 + hurt:
			var a := randf() * TAU
			bits.append({"x": o.world.x + cos(a) * 0.4, "y": o.world.y + sin(a) * 0.4, "z": 4.0 + randf() * 20.0, "vx": -sin(a) * 1.6, "vy": cos(a) * 1.6, "vz": -4.0, "fall": 0.0,
				"t": 0.0, "life": 0.5, "ramp": PackedColorArray(SNOW), "kind": "dot", "size": 1.0})
		if o.words.has("overcharge") and randf() < 0.2 + hurt:
			var R := ramp("overcharge")
			bits.append({"x": o.world.x, "y": o.world.y, "z": _mid(o) + (randf() - 0.5) * 10.0, "vx": (randf() - 0.5) * 3.0, "vy": (randf() - 0.5) * 3.0, "vz": 0.0, "fall": 0.0,
				"t": 0.0, "life": 0.15, "ramp": PackedColorArray([R[4], R[5], Color.WHITE]), "kind": "streak", "size": 1.0})
		if o.words.has("berserk") and randf() < hurt:
			var R := ramp("berserk")
			bits.append({"x": o.world.x, "y": o.world.y, "z": 8.0 + randf() * 12.0, "vx": 0.0, "vy": 0.0, "vz": 18.0, "fall": 0.0, "t": 0.0, "life": 0.7,
				"ramp": PackedColorArray([R[1], R[2], R[3]]), "kind": "puff", "size": 2.0})
		if o.m52.has("foe_blur_t"):
			var R := ramp("blur")
			bits.append({"x": o.world.x, "y": o.world.y, "z": 4.0 + randf() * 16.0, "vx": -o.face.x * 3.0, "vy": -o.face.y * 3.0, "vz": 0.0, "fall": 0.0, "t": 0.0, "life": 0.25,
				"ramp": PackedColorArray([R[3], R[4], R[5]]), "kind": "streak", "size": 1.0})


func paint_floor(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	match "%s:%s" % [b["id"], b["what"]]:
		"overcharge:foe":
			# (its shock thrown out round his feet as the bolt lands, the wider the more hurt it is)
			var v := _ease(bt / 0.25)
			_front(b["x"], b["y"], (0.4 + 0.9 * float(b["r"])) * v, PackedColorArray([R[1], R[2], R[3], R[4], R[5]]), int(b["seed"]), 0.9 * (1.0 - v), "shock")
		"duelist:alone":
			# (a dueling circle drawn round it: dashes going round, two crossed blades at its ends)
			var u := _ease(bt / 0.2)
			var fade := _c01((0.9 - bt) / 0.35)
			_ga(0.95 * fade)
			_fs(R[4])
			_ring(b["x"], b["y"], 1.1 * u, 3, bt * 1.5)
			_ga(0.5 * fade)
			_fs(R[2])
			_ring(b["x"], b["y"], 1.15 * u, 2, -bt * 1.5)
			for s in [-1.0, 1.0]:
				var x: float = float(b["x"]) + s * 1.1 * u * 0.7
				var y: float = float(b["y"]) - s * 1.1 * u * 0.7
				var cx := _wx(x, y)
				var cy := _wy(x, y)
				_ga(fade)
				_fs(R[5])
				_line(cx - 3, cy - 2, cx + 3, cy + 2, 1)
				_line(cx - 3, cy + 2, cx + 3, cy - 2, 1)
		"duelist:foe":
			# (in the enemy's pink and gold: a circle round the two of them)
			var mx := (float(b["x"]) + float(b["x1"])) * 0.5
			var my := (float(b["y"]) + float(b["y1"])) * 0.5
			var rr := Vector2(b["x"], b["y"]).distance_to(Vector2(b["x1"], b["y1"])) * 0.5 + 0.6
			var fade := _c01((0.7 - bt) / 0.3) * _ease(bt / 0.15)
			_ga(0.9 * fade)
			_fs(FOE[3])
			_ring(mx, my, rr, 3, bt * 2.0)
			_ga(0.6 * fade)
			_fs(FOE[4])
			_ring(mx, my, rr + 0.06, 4, -bt * 2.0)
		"berserk:stack", "overcharge:charge":
			# (the five marks at his feet, as many lit as the frenzy; Berserk's flames licking up them, Overcharge's crackling)
			var hh := _hero_at(b)
			var n: int = b["n"]
			var fade := _c01((0.5 - bt) / 0.25)
			for i in 5:
				var a := float(i) / 5.0 * TAU - PI * 0.5
				var x := hh.x + cos(a) * 0.55
				var y := hh.y + sin(a) * 0.55
				var cx := _wx(x, y)
				var cy := _wy(x, y)
				var lit := i < n
				_ga(fade * (1.0 if lit else 0.4))
				_fs(R[4] if lit else R[1])
				_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 3)
				if lit and b["id"] == "berserk":
					_flames(cx, cy, 2, 4.0, 8.0 + 2.0 * n, fade, PackedColorArray([R[5], R[4], R[3], R[2]]), int(b["seed"]) + i)
				elif lit:
					var j := (_rh(int(b["seed"]), i * 7 + int(t * 20.0)) - 0.5) * 8.0
					_fs(R[5])
					_line(cx, cy, cx + j, cy - 7.0, 1)
					_glow(cx, cy, 8.0, R[4], 0.6 * fade)
		"fever:kill":
			var hh := _hero_at(b)
			var fade := _c01((0.45 - bt) / 0.2)
			for i in 8:
				var a := float(i) / 8.0 * TAU
				var x := hh.x + cos(a) * 0.55
				var y := hh.y + sin(a) * 0.55
				_ga(fade)
				_fs(R[4])
				_fill(_ri(_wx(x, y)), _ri(_wy(x, y) + bt * 10.0), 1, 2)
		"whiteout:burst":
			# (a star of frost needles shot out over the floor from the fallen, crystals standing on them)
			var u := _ease(bt / 0.18)
			var fade := _c01((1.0 - bt) / 0.4)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			for i in 8:
				var a := float(i) / 8.0 * TAU + _rh(int(b["seed"]), i) * 0.3
				var len := 40.0 * (0.65 if i % 2 else 1.0) * u
				var ex := cx + cos(a) * len
				var ey := cy + sin(a) * len * 0.5
				_ga(0.9 * fade)
				_fs(SNOW[2])
				_line(cx, cy + 1.0, ex, ey + 1.0, 3)
				_fs(SNOW[4])
				_line(cx, cy, ex, ey, 1)
				for s in range(1, 3):
					var v := s / 3.0
					var px := _ri(lerpf(cx, ex, v))
					var py := _ri(lerpf(cy, ey, v))
					var hh := _ri((3 - s) * 4 * u)
					_fs(SNOW[3])
					_fill(px, py - hh, 1, hh)
					_fs(Color.WHITE)
					_fill(px, py - hh, 1, 1)
			_glow(cx, cy, 30.0, SNOW[4], 0.6 * fade)
		"juggernaut:step", "juggernaut:foe":
			var sd: int = b["seed"]
			# (each heavy step kicking the floor's grit out in a wave, cracks running out ahead of it)
			var u := _ease(bt / 0.3)
			var rr: float = float(b["r"]) * u
			_front(b["x"], b["y"], rr, [DUST[0], DUST[1], DUST[3], R[4], R[5]], sd, 0.95 * (1.0 - u), "shock")
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"])
			for k in 6:
				var a := float(k) / 6.0 * TAU + _rh(sd, k) * 0.6
				var px := cx
				var py := cy
				for j in 4:
					var v := float(j + 1) / 4.0
					var qa := a + (_rh(sd, k * 7 + j) - 0.5) * 0.6
					var qx := cx + cos(qa) * rr * 22.6 * v
					var qy := cy + sin(qa) * rr * 11.3 * v
					_ga(0.9 * (1.0 - u * 0.6))
					_fs(DUST[0])
					_line(px, py, qx, qy, 2)
					_fs(R[3])
					_line(px, py - 1.0, qx, qy - 1.0, 1)
					px = qx
					py = qy
		"blur:gust":
			var sd: int = b["seed"]
			# (his burst of speed: gusts tearing out from him, curling as they go, each a tapering stroke of wind)
			var hh := _hero_at(b)
			var u := _ease(bt / 0.4)
			var cx := _wx(hh.x, hh.y)
			var cy := _wy(hh.x, hh.y)
			for g in 5:
				var a0 := float(g) / 5.0 * TAU + _rh(sd, g) * 0.8
				var r0 := 10.0 + 34.0 * u
				for i in 8:
					var v := float(i) / 8.0
					var a := a0 + v * 1.1
					var r := r0 * (0.7 + 0.3 * v)
					var a2 := a0 + (v + 0.125) * 1.1
					var r2 := r0 * (0.7 + 0.3 * (v + 0.125))
					_ga((1.0 - u) * (1.0 - v * 0.6))
					_fs(R[4] if i < 4 else R[3])
					_line(cx + cos(a) * r, cy + sin(a) * r * 0.5, cx + cos(a2) * r2, cy + sin(a2) * r2 * 0.5, 2 if i < 4 else 1)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := ramp(b["id"])
	var bt: float = b["t"]
	var sd: int = b["seed"]
	var p := _mid_px(b)
	match "%s:%s" % [b["id"], b["what"]]:
		"duelist:alone":
			if bt < 0.25 and not b.get("minor", false):
				var u := bt / 0.25
				_ga(1.0 - u)
				_fs(Color.WHITE)
				_line(p.x - 14, p.y + 7, p.x + 14, p.y - 7, 1)
				_glow(p.x, p.y, 30.0, R[4], 0.9 * (1.0 - u))
				_glow(p.x, p.y, 16.0, Color.WHITE, 0.7 * (1.0 - u))
		"duelist:mark", "needle:mark", "brand:mark", "seeker:mark", "quickdraw:mark":
			_sight(p.x, p.y, _c01(bt / 0.18), R, _c01((0.3 - bt) / 0.12))
		"seeker:seek":
			_sight(p.x, p.y, _c01(bt / 0.12), R, _c01((0.3 - bt) / 0.12))
			if bt > 0.1:
				_glow(p.x, p.y, 20.0, Color.WHITE, 0.7 * (1.0 - _c01((bt - 0.1) / 0.2)))
		"needle:three":
			# (three lime needles standing out of it where they went in, venom dripping off them)
			var fade := _c01((1.2 - bt) / 0.3)
			var a0: float = b["a"]
			for k in 3:
				var a := a0 + (k - 1) * 0.5
				var inx := p.x + cos(a) * 3.0
				var iny := p.y + sin(a) * 2.0 - 2.0 + k * 2.0
				var u := _ease(bt / 0.08 - k * 0.5)
				var ox := inx + cos(a) * 12.0 * (2.0 - u)
				var oy := iny + sin(a) * 6.0 * (2.0 - u) - 4.0
				_ga(fade)
				_fs(R[1])
				_line(inx + 1, iny + 1, ox + 1, oy + 1, 1)
				_fs(R[4])
				_line(inx, iny, ox, oy, 1)
				_fs(Color.WHITE)
				_fill(_ri(ox), _ri(oy), 1, 1)
			if bt < 0.15:
				_glow(p.x, p.y, 22.0, R[5], 0.8 * (1.0 - bt / 0.15))
		"needle:double":
			_glow(p.x, p.y, 26.0, R[4], 0.8 * (1.0 - _c01(bt / 0.5)))
		"brand:brand":
			_glow(p.x, p.y, 28.0, FIRE[4], 0.9 * (1.0 - _c01(bt / 0.35)))
		"quickdraw:draw":
			var hh := _hero_at(b)
			_glint(_wx(hh.x, hh.y) + 7.0, _wy(hh.x, hh.y) - 18.0, 1.0 + 2.0 * (1.0 - _c01(bt / 0.35)), R)
		"quickdraw:crack":
			# (the draw: a long white needle out along the way he faces)
			var hh := _hero_at(b)
			var h = fx.hero()
			var f: Vector2 = h.face if h != null else Vector2(1, 0)
			var sx := _wx(hh.x, hh.y)
			var sy := _wy(hh.x, hh.y) - 14.0
			var ex := _wx(hh.x + f.x * 3.0, hh.y + f.y * 3.0)
			var ey := _wy(hh.x + f.x * 3.0, hh.y + f.y * 3.0) - 12.0
			var u := _c01(bt / 0.3)
			_ga(1.0 - u)
			_fs(R[4])
			_line(sx, sy + 1, ex, ey + 1, 2)
			_fs(Color.WHITE)
			_line(sx, sy, ex, ey, 1)
			_glow(ex, ey, 18.0, Color.WHITE, 0.8 * (1.0 - u))
		"pressurepoint:point":
			# (four small white needles closing in on it from four sides, then a pin of light)
			var u := _ease(bt / 0.14)
			var fade := _c01((0.45 - bt) / 0.2)
			for k in 4:
				var a := float(k) * PI * 0.5 + PI * 0.25
				var d := lerpf(26.0, 5.0, u)
				var x0 := p.x + cos(a) * d
				var y0 := p.y + sin(a) * d * 0.8
				var x1 := p.x + cos(a) * (d + 13.0)
				var y1 := p.y + sin(a) * (d + 13.0) * 0.8
				_ga(fade)
				_fs(R[1])
				_line(x0, y0, x1, y1, 3)
				_fs(R[4])
				_line(x0, y0, x1, y1, 2)
				_fs(Color.WHITE)
				_line(x0, y0, lerpf(x0, x1, 0.5), lerpf(y0, y1, 0.5), 1)
			if u >= 1.0:
				_glow(p.x, p.y, 18.0, Color.WHITE, 0.8 * fade)
				_ga(fade)
				_fs(Color.WHITE)
				_fill(_ri(p.x) - 1, _ri(p.y) - 1, 3, 3)
		"duelist:foe", "needle:foe", "brand:foe", "seeker:foe", "quickdraw:foe", "pressurepoint:foe":
			if b["id"] != "duelist":
				var hh := _hero_at(b)
				_sight(_wx(hh.x, hh.y), _wy(hh.x, hh.y) - 14.0, _c01(bt / 0.18), PackedColorArray(FOE), _c01((0.7 - bt) / 0.25))
		"berserk:kill", "fever:kill":
			_wisps(b["x"], b["y"], b["x1"], b["y1"], _c01(bt / 0.4), 1, R, sd, 2, 10.0, 6.0)
		"fever:dose":
			# (drips of venom falling onto it from above, one more for each step of the frenzy)
			var n: int = b["n"]
			var fade := _c01((0.8 - bt) / 0.3)
			for k in n:
				var u := _c01((bt - k * 0.06) / 0.3)
				var x := p.x + (k - (n - 1) * 0.5) * 4.0
				var y := p.y - 26.0 + 26.0 * u * u
				_ga(fade)
				_fs(R[1])
				_fill(_ri(x) - 1, _ri(y) - 1, 3, 4)
				_fs(R[4])
				_fill(_ri(x), _ri(y), 1, 2)
				_fs(R[5])
				_fill(_ri(x), _ri(y), 1, 1)
			_glow(p.x, p.y, 16.0, R[3], 0.5 * fade)
		"whiteout:foe":
			# (a monster's, on him: a squall of snow whipped round him, the thicker the more hurt it is, in swirling bands, flakes
			# big and small; round him, not over him)
			var n: int = b["n"]
			var fade := _c01((0.7 - bt) / 0.3) * _c01(bt / 0.08)
			var cx := _wx(b["x"], b["y"])
			var cy := _wy(b["x"], b["y"]) - 12.0
			for band in 4:
				var a0 := bt * (8.0 + band) + float(band) * TAU / 4.0
				var rr := 15.0 + 5.0 * band + bt * 10.0
				var m := 16 + 4 * n
				for i in m:
					var v := float(i) / float(m)
					var a := a0 - v * 2.6
					var x := cx + cos(a) * rr
					var y := cy + sin(a) * rr * 0.45 + float(band - 1) * 5.0 + (_rh(sd, band * 40 + i) - 0.5) * 5.0
					var big := 2 if (i + band) % 2 == 0 else 1
					_ga(fade * (1.0 - v * 0.6))
					_fs(SNOW[1])
					_fill(_ri(x), _ri(y) + 1, big, 1)
					_fs(SNOW[5] if i % 3 == 0 else SNOW[4])
					_fill(_ri(x), _ri(y), big, big)
			_glow(cx, cy + 12.0, 24.0 + 6.0 * n, SNOW[4], 0.5 * fade)
		"whiteout:snow":
			# (snow whipped round what it hits, the more the faster he goes)
			var n: int = 8 + 5 * int(b["n"])
			var fade := _c01((0.7 - bt) / 0.3)
			for k in n:
				var a := float(k) / n * TAU + bt * 9.0 + _rh(sd, k)
				var rr := 8.0 + 10.0 * _rh(sd, k + 50) + bt * 10.0
				var x := p.x + cos(a) * rr
				var y := p.y + sin(a) * rr * 0.5 - 4.0 + _rh(sd, k + 9) * 10.0
				_ga(fade)
				_fs(SNOW[5] if k % 3 == 0 else SNOW[3])
				_fill(_ri(x), _ri(y), 2 if k % 4 == 0 else 1, 1)
			_glow(p.x, p.y, 20.0, SNOW[4], 0.4 * fade)
		"overcharge:bolt":
			var ax := _wx(b["x"], b["y"])
			var ay := _wy(b["x"], b["y"]) - 10.0
			var bx := _wx(b["x1"], b["y1"])
			var by := _wy(b["x1"], b["y1"]) - 12.0
			_bolt(ax, ay, bx, by, R, sd, 1.0 - _c01((bt - 0.15) / 0.15), 3)
		"overcharge:foe":
			# (its bolt reaching out from it to him, the farther the more it is hurt, its amber flash at his feet, not over him)
			var fade := 1.0 - _c01((bt - 0.15) / 0.2)
			var hx := _wx(b["x"], b["y"])
			var hy := _wy(b["x"], b["y"])
			var ax := _wx(b["x1"], b["y1"])
			var ay := _wy(b["x1"], b["y1"]) - 14.0
			_bolt(ax, ay, hx, hy - 4.0, R, sd, fade, 3)
			# (and forks of it striking the floor round him, the more hurt it is, the farther)
			for k in 2 + int(3.0 * float(b["r"])):
				var a := _rh(sd, k + 3) * TAU
				var reach := 20.0 + 26.0 * float(b["r"]) * _rh(sd, k + 9)
				_bolt(lerpf(ax, hx, 0.6), lerpf(ay, hy - 4.0, 0.6), hx + cos(a) * reach, hy + sin(a) * reach * 0.5, R, sd + 17 * k, fade, 2)
				_glow(hx + cos(a) * reach, hy + sin(a) * reach * 0.5, 9.0, R[4], 0.7 * fade)
			_glow(hx, hy, 22.0 + 14.0 * float(b["r"]), R[4], 0.7 * fade)
			_glow(_wx(b["x1"], b["y1"]), _wy(b["x1"], b["y1"]) - 14.0, 16.0, R[4], 0.6 * fade)
	_ga(1.0)


## A glint of light, four points, `s` long.
func _glint(x: float, y: float, s: float, R: PackedColorArray) -> void:
	var tw := 0.6 + 0.4 * sin(t * 12.0)
	var l := _ri(s * 3.0 * tw)
	_ga(1.0)
	_fs(Color.WHITE)
	_fill(_ri(x) - l, _ri(y), l * 2 + 1, 1)
	_fill(_ri(x), _ri(y) - l, 1, l * 2 + 1)
	_fs(R[4])
	_fill(_ri(x) - 1, _ri(y) - 1, 3, 3)
	_fs(Color.WHITE)
	_fill(_ri(x), _ri(y), 1, 1)
	_glow(x, y, 10.0 + s * 3.0, R[4], 0.7)


func paint_air_more() -> void:
	var h = fx.hero()
	if h == null:
		return
	# (Quickdraw rested: the glint on his weapon: ready)
	for i in 3:
		if h.m52.fid(i) == "quickdraw" and h.m52.time - float(h.m52.last_use[i]) >= float(M52.tune("quickdraw")["rest"]):
			_glint(_wx(h.world.x, h.world.y) + 7.0, _wy(h.world.x, h.world.y) - 18.0, 2.0, ramp("quickdraw"))
			break
	if h.monsters == null or not is_instance_valid(h.monsters):
		return
	var F = h.monsters.main.get("_foe") if h.monsters.main != null else null
	for o in h.monsters.list:
		if not is_instance_valid(o) or o.dead:
			continue
		var top := _mid(o) * 2.0
		var cx := _wx(o.world.x, o.world.y)
		var cy := _wy(o.world.x, o.world.y)
		# (the marks of his melds behind, over what they marked)
		if o.mark_t > 0.0:
			match str(o.m52.get("mark", "")):
				"duelist":
					var R := ramp("duelist")
					_ga(1.0)
					_fs(R[4])
					_line(cx - 3, cy - top - 9, cx + 3, cy - top - 3, 1)
					_line(cx - 3, cy - top - 3, cx + 3, cy - top - 9, 1)
					_glow(cx, cy - top - 6, 8.0, R[4], 0.6)
				"needle":
					var R := ramp("needle")
					_fs(R[4])
					_fill(_ri(cx), _ri(cy - top - 12), 1, 8)
					_fs(Color.WHITE)
					_fill(_ri(cx), _ri(cy - top - 4), 1, 1)
				"seeker":
					# (a thin rod of light standing over it)
					var R := ramp("seeker")
					var fl := 0.6 + 0.4 * sin(t * 20.0)
					_ga(fl)
					_fs(R[4])
					_fill(_ri(cx), _ri(cy - top - 26), 1, 22)
					_fs(Color.WHITE)
					_fill(_ri(cx), _ri(cy - top - 26), 1, 3)
					_glow(cx, cy - top - 16, 10.0, R[4], 0.5 * fl)
				"quickdraw":
					var R := ramp("quickdraw")
					_fs(R[4])
					_fill(_ri(cx) - 2, _ri(cy - top - 6), 5, 1)
					_fill(_ri(cx) - 1, _ri(cy - top - 5), 3, 1)
					_fill(_ri(cx), _ri(cy - top - 4), 1, 1)
		# (Brand: its own symbol burnt into it, glowing as long as the brand lasts)
		if o.m52.has("brand") or (o.mark_t > 0.0 and str(o.m52.get("mark", "")) == "brand"):
			var fl := 0.7 + 0.3 * sin(t * 14.0)
			_glyph("brand", cx + 1, cy - top * 0.5 + 1, 2, FIRE[0], FIRE[1], 0.8 * fl)
			_glyph("brand", cx, cy - top * 0.5, 2, FIRE[4], FIRE[5], fl)
			_glow(cx, cy - top * 0.5, 20.0, FIRE[3], 0.7 * fl)
		# (Quickdraw on a monster: a glint on its weapon after a pause)
		if F != null and o.words.has("quickdraw") and F.clock - float(o.m52.get("foe_last", -99.0)) >= float(M52.tune("quickdraw")["foeRest"]):
			_glint(cx + 6.0, cy - top * 0.6, 1.0, PackedColorArray(FOE))
	_ga(1.0)
