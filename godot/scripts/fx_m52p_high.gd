## THE HIGH CITY'S RUNES MELDED AS THE FIGHT SHOWS THEM (behind melds52.gd HIGH_ON until his yes), painted with the melds' brushes
## (fx_m52kit.gd). The rules tell each carrying (meldshigh_rules.gd): what the High City rune's act carried to what it struck, shown on
## it in that rune's own way and colour: flames for Flame, shards for Frost, an arc to the next for Lightning, a puff for Poison, a
## shove's dust for Power, stars for a stun, a second slash for Twin, a burst for Volatile, a sight snapping shut for Precise, a ring
## going wide for Vast, a pull's wisps toward him, a split's lines to the next two, a curse's eye, a clock's hand for Stilling, a
## chain for Binding, drops of blood, a strike on through to the one behind, a soul's light held over it, the cull's burst, a
## shockwave; and what it gives him, over him: haste's streaks, life's drops coming to him, frenzy's flames, a shield's ring, a
## glint for time off his waits. Its act itself (the line, the lance, the wound, the thorns, the soul, the spirit, the cull, the
## shockwave) is drawn as Piercing's, Bleeding's, Reaping's, Culling's and Surging's own are.
## BY HIS ART RULEBOOK: every shape the thing it is, never a plain ball, box or ring alone; nothing on him in the enemy's pink.
extends "res://scripts/fx_m52kit.gd"

const LONG := {"carry": 0.45, "self": 0.5, "burst": 0.4}
static var LIGHT := PackedColorArray([Color("#2a2410"), Color("#6a5a18"), Color("#b09a28"), Color("#fff060"), Color("#fffbd0"), Color("#ffffff")])
static var VENOM := PackedColorArray([Color("#141c08"), Color("#3a5010"), Color("#6e8a18"), Color("#b4cc24"), Color("#e4f46a"), Color("#ffffc0")])
static var BLOOD := PackedColorArray([Color("#1a0204"), Color("#4a0610"), Color("#800818"), Color("#c0202c"), Color("#ff6060"), Color("#ffd0d0")])
static var SOUL := PackedColorArray([Color("#101a14"), Color("#2a3e32"), Color("#4a6a58"), Color("#6c8a78"), Color("#b8d8c4"), Color("#f0fff6")])
static var DUST6 := PackedColorArray([Color("#2a2420"), Color("#4a4038"), Color("#7a6a58"), Color("#a8967c"), Color("#c8b89c"), Color("#e8dcc4")])


func ids() -> Array:
	return M52.T().get("high", [])


## Its own colours by what it carries: an element's own (his "I want consistency with my damage"), else the meld's.
func _ramp_of(b: Dictionary) -> PackedColorArray:
	match str(b["e"].get("kind", "")):
		"fire":
			return PackedColorArray(FIRE)
		"frost":
			return PackedColorArray(ICE)
		"lightning":
			return LIGHT
		"poison":
			return VENOM
		"bleeding", "leech":
			return BLOOD
		"reaping":
			return SOUL
	return ramp(b["id"])


func begin(b: Dictionary, e: Dictionary) -> bool:
	var what: String = b["what"]
	if not LONG.has(what):
		return false
	b["end"] = float(LONG[what])
	var R := _ramp_of(b)
	var x: float = b["x"]
	var y: float = b["y"]
	var k: String = str(e.get("kind", ""))
	if fx == null:
		return true
	if what == "burst":
		fx.flash(x, y, 8.0, 1.2, 0.18, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
		fx.spray(x, y, 12, PackedColorArray([R[5], R[4], R[3]]), 3.0, 12.0)
		return true
	if what == "self":
		b["foe"] = true
		return true
	match k:
		"power":
			fx.flash(x, y, 10.0, 0.8, 0.14, PackedColorArray([Color.WHITE, R[5], R[4]]))
			for i in 6:
				_bit(x, y, 2.0, "stone", DUST6, 2.5, 0.5, 60, 10, 30)
		"poison":
			for i in 8:
				_bit(x, y, 8.0, "puff", R, 1.2, 0.7, 0, 2, 8)
		"frost", "volatile", "culling", "precise":
			fx.flash(x, y, 10.0, 0.9, 0.14, PackedColorArray([Color.WHITE, R[5], R[4]]))
			for i in 8:
				_bit(x, y, 10.0, "stone" if k == "frost" else "spark", R, 3.0, 0.5, 50, 10, 34)
		"fire":
			for i in 6:
				_bit(x, y, 6.0, "spark", R, 1.6, 0.6, 0, 14, 30)
		"lightning", "splitting", "piercing":
			fx.flash(float(e.get("x2", x)), float(e.get("y2", y)), 12.0, 0.7, 0.12, PackedColorArray([Color.WHITE, R[5], R[4]]))
		"twin", "heavy", "binding", "stilling", "hexing", "lasting", "vast", "pulling", "bleeding", "reaping", "surging":
			pass
	return true


func _stars(cx: float, cy: float, n: int, R: PackedColorArray, a: float, spin: float) -> void:
	for k in n:
		var ang := spin + k * TAU / n
		var sx := cx + cos(ang) * 7.0
		var sy := cy + sin(ang) * 3.0
		_ga(a)
		_fs(R[5])
		_fill(_ri(sx), _ri(sy) - 1, 1, 3)
		_fill(_ri(sx) - 1, _ri(sy), 3, 1)
	_ga(1.0)


func paint_floor(b: Dictionary) -> void:
	var R := _ramp_of(b)
	var u: float = _c01(float(b["t"]) / maxf(0.05, float(b["end"])))
	var fade := 1.0 - u
	var x: float = b["x"]
	var y: float = b["y"]
	var k: String = str(b["e"].get("kind", ""))
	if b["what"] != "carry":
		return
	match k:
		"vast", "surging", "culling":
			_ga(0.8 * fade)
			_fs(R[4])
			_ring(x, y, 0.3 + 1.0 * _ease(u), 2, u)
		"binding":
			# (a chain round its feet, its links)
			_ga(fade)
			for i in 10:
				var ang := float(i) / 10.0 * TAU
				var cx := _wx(x, y) + cos(ang) * 10.0
				var cy := _wy(x, y) + sin(ang) * 5.0
				_fs(R[4] if i % 2 == 0 else R[2])
				_fill(_ri(cx) - 1, _ri(cy), 3 if i % 2 == 0 else 2, 1)
		"stilling":
			# (a clock's face on the floor under it, its hand sweeping slow)
			_ga(0.7 * fade)
			_fs(R[3])
			_ring(x, y, 0.45, 3)
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			var ang := -PI * 0.5 + u * 1.2
			_fs(R[5])
			_line(cx, cy, cx + cos(ang) * 8.0, cy + sin(ang) * 4.0, 1)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := _ramp_of(b)
	var bt: float = b["t"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade := 1.0 - u
	var sd: int = b["seed"]
	var e: Dictionary = b["e"]
	var x: float = b["x"]
	var y: float = b["y"]
	var cx := _wx(x, y)
	var cy := _wy(x, y) - 14.0
	var k: String = str(e.get("kind", ""))
	if b["what"] == "self":
		var hx := _wx(x, y)
		var hy := _wy(x, y) - 22.0
		match k:
			"swift":
				for i in 4:
					var oy := -12.0 + i * 7.0
					_ga(fade)
					_fs(R[4])
					_line(hx - 14.0 - 6.0 * u, hy + oy, hx - 6.0 - 6.0 * u, hy + oy, 1)
			"leech":
				_drops(_wx(float(b["x1"]), float(b["y1"])), _wy(float(b["x1"]), float(b["y1"])) - 12.0, hx, hy, u, 4, R, fade, sd)
			"frenzied":
				_flames(hx, hy + 12.0, 3, 12.0, 10.0 * fade, fade, PackedColorArray([R[5], R[4], R[3], R[2]]), sd)
			"guarding":
				_ga(0.8 * fade)
				_fs(R[4])
				_ring(float(b["x"]), float(b["y"]), 0.7, 2, u * 2.0, 14.0)
				_glow(hx, hy, 14.0, R[3], 0.4 * fade)
			"fleeting":
				_glow(hx, hy - 10.0, 8.0, R[4], 0.6 * fade)
				_fs(R[5])
				_ga(fade)
				_fill(_ri(hx) - 3, _ri(hy - 10.0), 7, 1)
				_fill(_ri(hx), _ri(hy - 13.0), 1, 7)
		_ga(1.0)
		return
	if b["what"] != "carry":
		return
	match k:
		"fire":
			_flames(cx, cy + 12.0, 4, 10.0, 12.0 * fade, fade, PackedColorArray([R[5], R[4], R[3], R[2]]), sd)
		"frost":
			for i in 3:
				_shard(cx - 5.0 + i * 5.0, cy + 12.0, 3.0, 5.0 + 3.0 * fade, [R[0], R[1], R[2], R[3], R[4], R[5]], sd + i, fade)
		"lightning", "splitting":
			if e.has("x2"):
				_bolt(cx, cy, _wx(float(e["x2"]), float(e["y2"])), _wy(float(e["x2"]), float(e["y2"])) - 14.0, R, sd, fade, 2 if k == "lightning" else 1)
		"piercing":
			if e.has("x2"):
				var tx := _wx(float(e["x2"]), float(e["y2"]))
				var ty := _wy(float(e["x2"]), float(e["y2"])) - 14.0
				var v := _ease(minf(1.0, u * 2.5))
				_ga(fade)
				_fs(R[4])
				_line(cx, cy, cx + (tx - cx) * v, cy + (ty - cy) * v, 2)
				_fs(R[5])
				_line(cx, cy, cx + (tx - cx) * v, cy + (ty - cy) * v, 1)
		"heavy":
			_stars(cx, cy - 10.0, 3, R, fade, bt * 8.0)
		"twin":
			# (a second slash across it, a moment after the first)
			var v := _c01((bt - 0.12) / 0.2)
			if v > 0.0:
				_ga(1.0 - v * 0.6)
				_fs(R[5])
				_line(cx - 7.0, cy - 8.0 + 16.0 * v * 0.0, cx + 7.0 * (2.0 * v - 1.0), cy + 8.0 * (2.0 * v - 1.0), 1)
				_fs(R[4])
				_line(cx - 6.0, cy - 7.0, cx + 6.0 * (2.0 * v - 1.0), cy + 7.0 * (2.0 * v - 1.0), 2)
		"precise":
			_sight(cx, cy, u, R, fade)
		"hexing":
			# (a curse's eye opening over it)
			var ex := cx
			var ey := cy - 16.0
			var open := _c01(u * 3.0)
			_ga(fade)
			_fs(R[4])
			_fill(_ri(ex) - 5, _ri(ey), 11, 1)
			_fill(_ri(ex) - 3, _ri(ey) - _ri(2.0 * open), 7, 1)
			_fill(_ri(ex) - 3, _ri(ey) + _ri(2.0 * open), 7, 1)
			_fs(R[5])
			_fill(_ri(ex), _ri(ey), 1, 1)
		"pulling":
			_wisps(float(e["x1"]), float(e["y1"]), x, y, 1.0 - u, 3, R, sd, 1)
		"bleeding":
			for i in 4:
				var dy := fmod(bt * 40.0 + i * 5.0, 14.0)
				_ga(fade)
				_fs(R[3] if i % 2 == 0 else R[4])
				_fill(_ri(cx - 4.0 + i * 3.0), _ri(cy + dy - 4.0), 1, 2)
		"reaping":
			# (death's hold: a soul's light gathered over it)
			_glow(cx, cy - 10.0, 9.0, R[4], 0.5 * fade)
			for i in 5:
				var ph := fmod(bt * 2.0 + i * 0.2, 1.0)
				_ga(fade * (1.0 - ph))
				_fs(R[5])
				_fill(_ri(cx - 6.0 + i * 3.0), _ri(cy - 4.0 - ph * 14.0), 1, 1)
		"lasting":
			# (an hourglass over it, its sand still running)
			var hx := cx
			var hy := cy - 18.0
			_ga(fade)
			_fs(R[4])
			_fill(_ri(hx) - 3, _ri(hy) - 4, 7, 1)
			_fill(_ri(hx) - 3, _ri(hy) + 4, 7, 1)
			_line(hx - 3.0, hy - 3.0, hx + 3.0, hy + 3.0, 1)
			_line(hx + 3.0, hy - 3.0, hx - 3.0, hy + 3.0, 1)
			_fs(R[5])
			_fill(_ri(hx), _ri(hy) + 1 + _ri(2.0 * u), 1, 1)
		"volatile", "culling", "power":
			_glow(cx, cy, 12.0, R[4], 0.5 * fade)
	_ga(1.0)


## Drops running from (ax, ay) to (bx, by), `u` of the way.
func _drops(ax: float, ay: float, bx: float, by: float, u: float, n: int, R: PackedColorArray, a: float, sd: int) -> void:
	for i in n:
		var v := _c01(u * 1.3 - i * 0.08)
		var px := ax + (bx - ax) * v + (_rh(sd, i) - 0.5) * 6.0
		var py := ay + (by - ay) * v - sin(v * PI) * 10.0
		_ga(a)
		_fs(R[3])
		_fill(_ri(px), _ri(py), 2, 2)
		_fs(R[5])
		_fill(_ri(px), _ri(py), 1, 1)
	_ga(1.0)
