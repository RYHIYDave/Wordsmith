## REAPING WITH THE DAMAGE RUNES AS THE FIGHT SHOWS THEM (his “Yes and work on reaping”, 24 Nov 2026; behind melds52.gd REAP_ON until
## his yes to their pictures and films), painted with the melds' brushes (fx_m52kit.gd). The rules tell the moments
## (meldsreap_rules.gd); the creatures themselves are pictures among what stands (fx_words7.gd _reap_frame, assets/words/reap5_*):
## here is what they throw and what it does where it lands, each in its damage rune's own colours (his “I want consistency with
## my damage”): the imp's fireball and its burst, the rimeling's icicle and its splinters, the stormwisp's zap jumping on, the
## toad's spit of venom and its cloud, the bonebrute's slam cracking the floor; and the twists in front (fire passed on, a
## shatter, a soul's bolt, a puff of poison, his might). One risen against him throws the same, its landing marked first in the
## enemy's pink by the perils' warning; nothing of his side's cyan on it.
## BY HIS ART RULEBOOK: every shape the thing it is (a fireball a tongue of flame with its tail, an icicle a shard, venom a glob that
## drips), never a plain ball, box or ring; the landings flash and throw their bits, the slam kicks the screen.
extends "res://scripts/fx_m52kit.gd"

const IDS := ["cinderbrood", "wintergrave", "stormwake", "bogborn", "charnel"]
## (each one's damage colours, darkest to brightest)
static var LIGHT := PackedColorArray([Color("#2a2410"), Color("#6a5a18"), Color("#b09a28"), Color("#fff060"), Color("#fffbd0"), Color("#ffffff")])
static var VENOM := PackedColorArray([Color("#141c08"), Color("#3a5010"), Color("#6e8a18"), Color("#b4cc24"), Color("#e4f46a"), Color("#ffffc0")])
static var BONE := PackedColorArray([Color("#1a1410"), Color("#3a3228"), Color("#6e665a"), Color("#a89c88"), Color("#d8d0bc"), Color("#f4eee0")])
static var DUST6 := PackedColorArray([Color("#2a2420"), Color("#4a4038"), Color("#7a6a58"), Color("#a8967c"), Color("#c8b89c"), Color("#e8dcc4")])
static var MIGHT := PackedColorArray([Color("#2a0608"), Color("#701018"), Color("#b02430"), Color("#e03c44"), Color("#ff8a8a"), Color("#ffe0e0")])
## (how long each moment shows, seconds)
const LONG := {"rise": 0.55, "spread": 0.55, "shatter": 0.55, "bolt": 0.3, "puff": 0.8, "might": 0.6, "land": 0.4, "zap": 0.28,
	"slam": 0.65, "cloud": 3.0, "charge": 0.7, "throw": 0.6}


func ids() -> Array:
	return IDS


func _el(id: String) -> PackedColorArray:
	match id:
		"cinderbrood":
			return PackedColorArray(FIRE)
		"wintergrave":
			return PackedColorArray(ICE)
		"stormwake":
			return LIGHT
		"bogborn":
			return VENOM
	return BONE


func begin(b: Dictionary, e: Dictionary) -> bool:
	var what: String = b["what"]
	if not LONG.has(what):
		return false
	b["end"] = float(LONG[what])
	if what in ["throw", "cloud", "charge"]:
		b["end"] = float(e.get("secs", b["end"])) + (0.2 if what == "charge" else 0.0)
	var R := _el(b["id"])
	var x: float = b["x"]
	var y: float = b["y"]
	if fx == null:
		return true
	match what:
		"rise":
			fx.flash(x, y, 8.0, 1.0, 0.2, PackedColorArray([Color.WHITE, R[5], R[4], R[3]]))
			fx.spray(x, y, 14, PackedColorArray([R[5], R[4], R[3]]), 3.0, 16.0)
			fx.glow(x, y, 2.2, 0.5)
		"land":
			var k: String = str(e.get("kind", ""))
			fx.flash(x, y, 8.0, 0.8, 0.16, PackedColorArray([Color.WHITE, R[5], R[4]]))
			for i in 8:
				_bit(x, y, 8.0, "stone" if k == "rimeling" else ("bubble" if k == "toad" else "spark"), R, 2.5, 0.45, 50 if k != "imp" else 0, 8, 24)
		"shatter":
			fx.flash(x, y, 10.0, 1.2, 0.18, PackedColorArray([Color.WHITE, R[5], R[4]]))
			for i in 14:
				_bit(x, y, 10.0, "stone", R, 4.0, 0.6, 60, 14, 40)
		"spread":
			fx.flash(x, y, 10.0, 1.0, 0.18, PackedColorArray([Color.WHITE, R[5], R[4]]))
		"puff":
			for i in 12:
				_bit(x, y, 6.0, "puff", R, 1.6, 0.8, 0, 2, 8)
		"slam":
			fx.kick(2.5)
			fx.flash(x, y, 4.0, float(b["r"]), 0.16, PackedColorArray([Color.WHITE, R[5], R[4]]))
			for i in 16:
				_bit(x, y, 2.0, "stone", DUST6, 3.5, 0.7, 70, 16, 46)
			for i in 6:
				_bit(x, y, 2.0, "puff", DUST6, 1.4, 0.8, 0, 2, 6)
		"zap", "bolt":
			fx.flash(float(b["x1"]), float(b["y1"]), 12.0, 0.7, 0.12, PackedColorArray([Color.WHITE, R[5], R[4]]))
		"might":
			b["foe"] = true
	return true


## A fireball: a tongue of flame pointed the way it flies, its tail streaming back, at (cx, cy) on the screen.
func _fireball(cx: float, cy: float, dx: float, dy: float, R: PackedColorArray, a: float, sd: int) -> void:
	var d := sqrt(dx * dx + dy * dy)
	if d < 1e-3:
		dx = 1.0
		dy = 0.0
		d = 1.0
	dx /= d
	dy /= d
	_glow(cx, cy, 10.0, R[3], 0.55 * a)
	for k in 9:
		var v := float(k) / 8.0
		var w := 4.0 * (1.0 - v) + 1.0
		var px := cx - dx * v * 10.0 + sin(t * 30.0 + k + sd) * v * 1.5
		var py := cy - dy * v * 10.0 + cos(t * 26.0 + k) * v * 1.0 - v * 2.0
		_ga(a * (1.0 - v * 0.6))
		_fs(_tone(R, 1.0 - v * 0.85))
		_fill(_ri(px - w * 0.5), _ri(py - w * 0.5), _ri(w), _ri(w))
	_ga(a)
	_fs(R[5])
	_fill(_ri(cx - 1), _ri(cy - 1), 2, 2)
	_ga(1.0)


## An icicle: a shard flying point first.
func _icicle(cx: float, cy: float, dx: float, dy: float, R: PackedColorArray, a: float) -> void:
	var d := sqrt(dx * dx + dy * dy)
	if d < 1e-3:
		dx = 1.0
		dy = 0.0
		d = 1.0
	dx /= d
	dy /= d
	_glow(cx, cy, 7.0, R[3], 0.35 * a)
	_ga(a)
	_fs(R[2])
	_line(cx - dx * 7.0, cy - dy * 7.0 + 1.0, cx, cy + 1.0, 2)
	_fs(R[4])
	_line(cx - dx * 7.0, cy - dy * 7.0, cx + dx * 2.0, cy + dy * 2.0, 2)
	_fs(R[5])
	_line(cx - dx * 2.0, cy - dy * 2.0, cx + dx * 3.0, cy + dy * 3.0, 1)
	# (frost trailing off it)
	for k in 3:
		_ga(a * (0.6 - k * 0.15))
		_fs(R[4])
		_fill(_ri(cx - dx * (9.0 + k * 3.0) + sin(t * 20.0 + k) * 1.5), _ri(cy - dy * (9.0 + k * 3.0)), 1, 1)
	_ga(1.0)


## Venom: a glob dripping as it flies.
func _glob(cx: float, cy: float, R: PackedColorArray, a: float, sd: int) -> void:
	_glow(cx, cy, 7.0, R[3], 0.4 * a)
	_disc(cx, cy, 2.6, [R[1], R[2], R[3], R[4], R[5]], a)
	for k in 3:
		var dy := fmod(t * 30.0 + k * 4.0 + sd, 10.0)
		_ga(a * (1.0 - dy / 10.0))
		_fs(R[3])
		_fill(_ri(cx - 1.0 + k), _ri(cy + 2.0 + dy), 1, 1)
	_ga(1.0)


func paint_floor(b: Dictionary) -> void:
	var R := _el(b["id"])
	var u: float = _c01(float(b["t"]) / maxf(0.05, float(b["end"])))
	var fade := 1.0 - u
	var what: String = b["what"]
	var x: float = b["x"]
	var y: float = b["y"]
	match what:
		"rise":
			# (the ground giving way as it rises: its edge breaking open and rolling out, not a plain ring: his Art Rulebook's How art
			# is made 9, the check of 26 Nov 2026)
			_front(x, y, 0.3 + 0.8 * _ease(u), Array(R), int(b["seed"]), 0.9 * fade, "shock")
			_front(x, y, 0.2 + 0.5 * _ease(u), Array(R), int(b["seed"]) + 3, 0.7 * fade, "water")
		"shatter", "puff", "spread":
			# (its burst rolling out: jagged for a shatter, billowing for a puff or a spread)
			_front(x, y, float(b["r"]) * _ease(u), Array(R), int(b["seed"]), 0.8 * fade, "shock" if what == "shatter" else "water")
		"slam":
			# the floor cracked out from where the fists came down, and the wave of it going out
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			var rr := float(b["r"]) * 22.6
			for k in 7:
				var ang := float(k) / 7.0 * TAU + _rh(int(b["seed"]), k) * 0.6
				var ln := rr * (0.55 + 0.45 * _rh(int(b["seed"]), k + 9)) * _ease(minf(1.0, u * 3.0))
				var mx := cx + cos(ang) * ln * 0.5 + (_rh(int(b["seed"]), k + 20) - 0.5) * 4.0
				var my := cy + sin(ang) * ln * 0.25
				_ga(0.9 * fade)
				_fs(BONE[0])
				_line(cx, cy, mx, my, 2)
				_line(mx, my, cx + cos(ang) * ln, cy + sin(ang) * ln * 0.5, 1)
			_ga(0.7 * fade)
			_front(x, y, float(b["r"]) * (0.4 + 0.8 * _ease(u)), DUST + [Color("#d8d0bc")], int(b["seed"]), 0.8 * fade, "shock")
		"cloud":
			# a low cloud of poison rolling where the toad burst, thinning as it goes
			var a := minf(1.0, float(b["t"]) / 0.25) * minf(1.0, (float(b["end"]) - float(b["t"])) / 0.6)
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			var rr := float(b["r"]) * 22.6
			for k in 9:
				var ang := float(k) / 9.0 * TAU + t * 0.4 + _rh(int(b["seed"]), k)
				var dist := rr * (0.25 + 0.55 * _rh(int(b["seed"]), k + 3))
				_curl(cx + cos(ang) * dist, cy + sin(ang) * dist * 0.5 - 3.0 - sin(t * 2.0 + k) * 1.5, 9.0 + 3.0 * _rh(int(b["seed"]), k + 6), [R[1], R[2], R[3]], int(b["seed"]) + k, 0.55 * a)
		"charge":
			# (where its blow will fall: a sight closing on the spot)
			_reticle(float(b["x1"]), float(b["y1"]), 0.25 + 0.3 * (1.0 - minf(1.0, float(b["t"]) * 2.0)), Array(R), 0.6 * minf(1.0, float(b["t"]) * 4.0))
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	var R := _el(b["id"])
	var bt: float = b["t"]
	var u: float = _c01(bt / maxf(0.05, float(b["end"])))
	var fade := 1.0 - u
	var sd: int = b["seed"]
	var what: String = b["what"]
	var x: float = b["x"]
	var y: float = b["y"]
	var e: Dictionary = b["e"]
	match what:
		"throw":
			var k: String = str(e.get("kind", ""))
			var ax := _wx(x, y)
			var ay := _wy(x, y) - 18.0
			var bx := _wx(float(b["x1"]), float(b["y1"]))
			var by := _wy(float(b["x1"]), float(b["y1"])) - 8.0
			var arc := 22.0 if k != "imp" else 10.0
			var px := ax + (bx - ax) * u
			var py := ay + (by - ay) * u - sin(u * PI) * arc
			var u2 := _c01(u + 0.05)
			var qx := ax + (bx - ax) * u2
			var qy := ay + (by - ay) * u2 - sin(u2 * PI) * arc
			match k:
				"imp":
					_fireball(px, py, qx - px, qy - py, R, 1.0, sd)
				"rimeling":
					_icicle(px, py, qx - px, qy - py, R, 1.0)
				_:
					_glob(px, py, R, 1.0, sd)
		"land":
			var k: String = str(e.get("kind", ""))
			var cx := _wx(x, y)
			var cy := _wy(x, y) - 6.0
			if k == "imp":
				_flames(cx, cy + 6.0, 5, 12.0, 14.0 * fade, fade, PackedColorArray([R[5], R[4], R[3], R[2]]), sd)
			elif k == "rimeling":
				for i in 4:
					_shard(cx - 6.0 + i * 4.0, cy + 6.0, 3.0, 6.0 * fade + 2.0, [R[0], R[1], R[2], R[3], R[4], R[5]], sd + i, fade)
			else:
				_glow(cx, cy, 10.0, R[3], 0.5 * fade)
		"spread":
			var cx := _wx(x, y)
			var cy := _wy(x, y) - 6.0
			_flames(cx, cy + 6.0, 4, 10.0, 12.0 * fade, fade, PackedColorArray([R[5], R[4], R[3], R[2]]), sd)
			for p in e.get("to", []):
				var tx := _wx(p.x, p.y)
				var ty := _wy(p.x, p.y) - 10.0
				var v := _ease(minf(1.0, u * 2.0))
				_fireball(cx + (tx - cx) * v, cy + (ty - cy) * v - sin(v * PI) * 10.0, tx - cx, ty - cy, R, fade, sd)
		"zap":
			var ax := _wx(x, y)
			var ay := _wy(x, y) - 20.0
			var bx := _wx(float(b["x1"]), float(b["y1"]))
			var by := _wy(float(b["x1"]), float(b["y1"])) - 12.0
			_bolt(ax, ay, bx, by, R, sd, fade, 2)
			if e.has("x2"):
				var cx := _wx(float(e["x2"]), float(e["y2"]))
				var cy := _wy(float(e["x2"]), float(e["y2"])) - 12.0
				_bolt(bx, by, cx, cy, R, sd + 5, fade * 0.8, 1)
		"bolt":
			var ax := _wx(x, y)
			var ay := _wy(x, y) - 16.0
			_bolt(ax, ay, _wx(float(b["x1"]), float(b["y1"])), _wy(float(b["x1"]), float(b["y1"])) - 12.0, R, sd, fade, 2)
		"charge":
			# (one risen against him: its spark crackling at it as its warning runs, and the zap at the end)
			var ax := _wx(x, y)
			var ay := _wy(x, y) - 20.0
			var end: float = float(e.get("secs", 0.5))
			if bt < end:
				_glow(ax, ay, 6.0 + 6.0 * bt / maxf(0.05, end), R[4], 0.6)
			else:
				_bolt(ax, ay, _wx(float(b["x1"]), float(b["y1"])), _wy(float(b["x1"]), float(b["y1"])) - 12.0, R, sd, 1.0 - (bt - end) / 0.2, 2)
		"might":
			var cx := _wx(x, y)
			var cy := _wy(x, y) - 34.0
			_flames(cx, cy + 22.0, 3, 14.0, 10.0 * fade, fade * 0.8, PackedColorArray([MIGHT[5], MIGHT[4], MIGHT[3], MIGHT[2]]), sd)
		"shatter":
			var cx := _wx(x, y)
			var cy := _wy(x, y) - 10.0
			_glow(cx, cy, 14.0, R[4], 0.5 * fade)
	_ga(1.0)
