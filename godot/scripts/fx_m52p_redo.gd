## ALL MELDS: THE LEAST EXCITING REDONE, AS THE FIGHT SHOWS THEM (behind melds52.gd REDO_ON until his yes): the new moments each
## redone meld tells (meldsredo_rules.gd; on a monster, foe_meldsredo.gd), painted with the High City painter's brushes
## (fx_m52p_high.gd, fx_m52kit.gd). What each meld showed before stays drawn by its own painter; fx_melds52.gd hands this one only the
## moments these add (`knows`). Each is drawn as a look the melds already share where one fits (a burst's flash and spray, a stun's
## stars, a curse's eye, a cloud's haze, a drag's wisps: MOMENTS, its first) and, where the moment is a thing of its own, as that
## thing (its second): Doom's falling hammer, Duelist's crossed blades, Eternity's clock, the Hourglass, Manacle's chain, Lamprey's
## red tether, Fury's ring of flame. BY HIS ART RULEBOOK: every shape the thing it is; the heavy ones kick and hold; on his side
## never the enemy's pink and gold, and what a monster lays on him in them.
extends "res://scripts/fx_m52p_high.gd"

## "id:what" -> [the shared look it is drawn as ("" none), the thing of its own ("" none)]
const MOMENTS := {
	"ambush:reel": ["stun", ""], "ambush:flinch": ["push", ""], "ambush:ring": ["", "closing"], "ambush:snap": ["burst", ""],
	"ambush:lunge": ["lunge", ""],
	"berserk:quake": ["quake", ""], "berserk:roar": ["slam", "roar"], "berserk:swell": ["frenzy", ""], "berserk:throw": ["stun", ""],
	"blight:wither": ["rot", ""], "blight:puff": ["cloud", ""], "blight:boil": ["cloud", ""],
	"bulwark:shove": ["wide", ""], "bulwark:wall": ["ward", "shieldring"], "bulwark:bash": ["shield", ""], "bulwark:charge": ["dash", ""],
	"bulwark:shove2": ["stun", ""],
	"canker:sore": ["cloud", "sore"], "canker:rot": ["rot", ""], "canker:burst": ["cloud", "sore"],
	"delirium:mad": ["curse", "spiral"], "delirium:flail": ["blade", ""], "delirium:shriek": ["curse", "roar"], "delirium:rave": ["dash", ""],
	"doom:hammer": ["", "hammer"], "doom:fall": ["slam", ""], "doom:crush": ["slam", "weight"], "doom:shadow": ["", "shadow"],
	"duelist:challenge": ["", "blades"], "duelist:ring": ["", "duelring"], "duelist:out": ["push", ""], "duelist:salute": ["", "blades"],
	"duelist:lunge": ["lunge", ""],
	"eternity:stop": ["", "clock"], "eternity:clock": ["", "clockzone"],
	"evileye:open": ["eye", "eyelong"], "evileye:stare": ["sight", ""], "evileye:mark": ["", "eyelong"], "evileye:burst": ["burst", "eyelong"],
	"evileye:gaze": ["beam", ""],
	"fervor:flare": ["pyre", ""], "fervor:sparks": ["hurl", ""], "fervor:fed": ["ablaze", ""], "fervor:blaze": ["pyre", ""],
	"fever:haze": ["cloud", ""], "fever:pulse": ["stream", ""], "fever:sweat": ["cloud", ""],
	"fury:aura": ["", "furyring"], "fury:ember": ["", "ember"], "fury:take": ["frenzy", ""], "fury:roar": ["frenzy", "roar"],
	"fury:charge": ["dash", ""],
	"glide:skate": ["rush", ""], "glide:aside": ["freeze", ""], "glide:strip": ["freeze", ""],
	"grudge:mark": ["", "redmark"], "grudge:pay": ["slam", ""], "grudge:seal": ["", "sigil"], "grudge:again": ["cut", ""],
	"grudge:chain": ["", "chainline"],
	"haymaker:fly": ["thrown", ""], "haymaker:crash": ["slam", ""], "haymaker:crack": ["quake", ""], "haymaker:down": ["stun", ""],
	"hourglass:turn": ["", "hourglass"], "hourglass:fall": ["burst", ""], "hourglass:stand": ["", "hourstand"],
	"hourglass:flare": ["surge", ""], "hourglass:hang": ["", "hourglass"],
	"lamprey:latch": ["", "tether"], "lamprey:drain": ["drink", ""], "lamprey:bite": ["bite", ""], "lamprey:drip": ["drink", ""],
	"lancet:lance": ["seek", ""], "lancet:drive": ["cut", "dagger"], "lancet:blade": ["", "dagger"], "lancet:drain": ["drink", ""],
	"lancet:cut": ["seek", ""],
	"manacle:chain": ["bind", "chainline"], "manacle:link": ["", "chainline"], "manacle:snap": ["", "chainline"],
}
## (how long a thing of its own stands, where its moment says not)
const LASTS := {"hammer": 0.45, "shadow": 0.9, "blades": 0.9, "clock": 1.2, "roar": 0.6, "weight": 0.5, "spiral": 0.9, "sore": 0.6,
	"redmark": 1.2, "dagger": 0.8, "tether": 1.5, "chainline": 0.5, "furyring": 0.5, "shieldring": 5.0}
## (the redone ones whose moments are their blood's, fire's or ice's)
const BLOOD_IDS := ["lamprey", "lancet"]
const FIRE_IDS := ["fervor"]
const ICE_IDS := ["glide"]


## (not found by its id: fx_melds52.gd hands it only the moments these add)
func ids() -> Array:
	return []


func knows(id: String, what: String) -> bool:
	return M52.REDO_ON and MOMENTS.has(id + ":" + what)


func _R(b: Dictionary) -> PackedColorArray:
	if b.get("foe", false):
		return ENEMY
	var id := str(b["id"])
	if id in BLOOD_IDS:
		return BLOOD
	if id in FIRE_IDS:
		return PackedColorArray(FIRE)
	if id in ICE_IDS:
		return PackedColorArray(ICE)
	return super._R(b)


func begin(b: Dictionary, e: Dictionary) -> bool:
	var key := str(b["id"]) + ":" + str(b["what"])
	var mo: Array = MOMENTS.get(key, ["burst", ""])
	b["own"] = mo[1]
	b["told"] = b["what"]
	if e.get("minor", false):
		b["minor"] = true
	if e.get("stay", false):
		b["stay"] = true
	if e.has("m") and e["m"] != null and is_instance_valid(e["m"]):
		b["m"] = e["m"]
	var alias: String = mo[0]
	if alias != "":
		b["what"] = alias
		super.begin(b, e)
	else:
		b["what"] = "own"
		b["line"] = absf(float(b["x1"]) - float(b["x"])) + absf(float(b["y1"]) - float(b["y"])) > 0.05
		b["end"] = 0.6
		if fx != null:
			var R := _R(b)
			fx.flash(b["x"], b["y"], 10.0, 0.6, 0.14, PackedColorArray([Color.WHITE, R[5], R[4]]))
	var own: String = b["own"]
	if LASTS.has(own):
		b["end"] = maxf(float(b["end"]), float(LASTS[own]))
	if e.has("secs"):
		b["end"] = maxf(float(b["end"]), float(e["secs"]))
	if own == "hammer" and fx != null:
		fx.kick(0.2)
	return true


func paint_floor(b: Dictionary) -> void:
	if b["what"] != "own":
		super.paint_floor(b)
	var own: String = b.get("own", "")
	if own == "":
		return
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var fade := 1.0 - u
	var R := _R(b)
	var x: float = b["x"]
	var y: float = b["y"]
	match own:
		"closing":
			# (Ambush's mark: a ring of light closing in round it; strike before it closes)
			_fs(R[4])
			_ga(0.9)
			_ring(x, y, 1.6 - 1.2 * u, 0, t * 2.0)
			_fs(R[5])
			_ring(x, y, 1.62 - 1.2 * u, 3, -t * 2.0)
		"duelring":
			_fs(R[4])
			_ga(0.7 * minf(1.0, fade * 4.0))
			_ring(x, y, float(b["r"]), 0, t)
			_fs(R[5])
			_ring(x, y, float(b["r"]) + 0.05, 4, -t)
		"shieldring":
			# (Bulwark's ward: raised shields round its edge)
			var r: float = float(b["r"])
			_fs(R[3])
			_ga(0.6 * minf(1.0, fade * 4.0))
			_ring(x, y, r, 0, 0.0)
		"clockzone":
			# (Eternity's bubble: a clock's face on the floor, its hand sweeping round as the rules' does)
			var r: float = float(b["r"])
			_fs(R[4])
			_ga(0.7 * minf(1.0, fade * 4.0))
			_ring(x, y, r, 0, 0.0)
			for k in 12:
				var a := k * TAU / 12.0
				var p0 := Vector2(x, y) + Vector2(cos(a), sin(a)) * r * 0.85
				var p1 := Vector2(x, y) + Vector2(cos(a), sin(a)) * r
				_line(_wx(p0.x, p0.y), _wy(p0.x, p0.y), _wx(p1.x, p1.y), _wy(p1.x, p1.y), 2)
			var ang := fmod(1.4 * float(b["t"]), TAU)
			var tip := Vector2(x, y) + Vector2(cos(ang), sin(ang)) * r
			_fs(R[5])
			_ga(0.9 * minf(1.0, fade * 4.0))
			_line(_wx(x, y), _wy(x, y), _wx(tip.x, tip.y), _wy(tip.x, tip.y), 3)
		"shadow":
			# (Doom on him: the shadow gathering where the blow will fall)
			var cx := _wx(x, y)
			var cy := _wy(x, y)
			var rx: float = 1.1 * 22.6 * (0.3 + 0.7 * minf(1.0, u * 1.4))
			_fs(Color(0.05, 0.0, 0.05))
			_ga(0.55)
			for k in 5:
				var f := float(k) / 5.0
				_fill(cx - rx * (1.0 - f), cy - rx * 0.5 * (1.0 - f) * 0.5, rx * 2.0 * (1.0 - f), rx * 0.5 * (1.0 - f))
			_fs(R[3])
			_ga(0.8)
			_ring(x, y, 1.1 * (0.3 + 0.7 * minf(1.0, u * 1.4)), 2, t * 3.0)
		"hourstand":
			_hourglass(_wx(x, y), _wy(x, y) - 20.0, 9.0, R, minf(1.0, fade * 4.0), u)
		"furyring":
			for k in 8:
				var a := k * TAU / 8.0 + t * 2.0
				var p := Vector2(x, y) + Vector2(cos(a), sin(a)) * 1.4
				_flames(_wx(p.x, p.y), _wy(p.x, p.y), 1, 4.0, 10.0 * fade, fade, R, int(b["seed"]) + k)
	_ga(1.0)


func paint_air(b: Dictionary) -> void:
	if b["what"] != "own":
		super.paint_air(b)
	var own: String = b.get("own", "")
	if own == "":
		return
	var u: float = clampf(float(b["t"]) / maxf(0.01, float(b["end"])), 0.0, 1.0)
	var fade := 1.0 - u
	var R := _R(b)
	var sd: int = int(b["seed"])
	var cx := _wx(b["x"], b["y"])
	var cy := _wy(b["x"], b["y"]) - 12.0
	var x1 := _wx(b["x1"], b["y1"])
	var y1 := _wy(b["x1"], b["y1"]) - 12.0
	match own:
		"hammer":
			# (Doom: a great dark hammer dropping from above onto it, striking at the moment the rules' blow lands)
			var drop: float = minf(1.0, u / 0.78)
			var hy := cy - 70.0 * (1.0 - drop * drop) - 6.0
			_fs(Color(0.12, 0.04, 0.14))
			_ga(minf(1.0, fade * 3.0))
			_fill(cx - 2.0, hy - 26.0, 4.0, 24.0)
			_fs(R[1])
			_fill(cx - 10.0, hy - 6.0, 20.0, 10.0)
			_fs(R[3])
			_fill(cx - 10.0, hy - 6.0, 20.0, 2.0)
			_glow(cx, hy, 16.0, R[4], 0.5 * fade)
			if drop >= 1.0:
				_stars(cx, cy - 10.0, 5, R, fade, t * 6.0)
		"weight":
			var drop: float = minf(1.0, u / 0.5)
			var wy := cy - 50.0 * (1.0 - drop)
			_fs(R[1])
			_ga(fade)
			_fill(cx - 9.0, wy - 8.0, 18.0, 12.0)
			_fs(R[3])
			_fill(cx - 4.0, wy - 12.0, 8.0, 4.0)
		"roar":
			# (a roar: arcs rolling out from it)
			for k in 3:
				var rr: float = (0.6 + k * 0.5) * (0.6 + u)
				_fs(R[4])
				_ga(fade * (1.0 - k * 0.25))
				_ring(b["x"], b["y"], rr, 3, t * 1.5 + k, 10.0)
		"blades":
			# (Duelist: two crossed blades flashing over it)
			var by := cy - 24.0 - (1.0 - fade) * 4.0
			_ga(fade)
			for s in [-1.0, 1.0]:
				_fs(R[4])
				_line(cx - 9.0 * s, by + 9.0, cx + 9.0 * s, by - 9.0, 2)
				_fs(Color.WHITE)
				_line(cx - 6.0 * s, by + 6.0, cx + 8.0 * s, by - 8.0, 1)
				_fs(R[2])
				_line(cx - 11.0 * s, by + 6.0, cx - 6.0 * s, by + 11.0, 2)
			_glow(cx, by, 12.0, R[5], 0.6 * fade)
		"clock":
			_clock(cx, cy - 24.0, 9.0, R, fade, u)
		"eyelong":
			_eye(cx, cy - 18.0, R, minf(1.0, fade * 3.0))
		"spiral":
			for k in 10:
				var a := k * 0.7 + t * 6.0
				var rr := 2.0 + k * 0.9
				_fs(R[4 if k % 2 == 0 else 3])
				_ga(fade)
				_fill(cx + cos(a) * rr, cy - 22.0 + sin(a) * rr * 0.5, 2.0, 2.0)
		"sore":
			for k in 4:
				var dx := (_rh(sd, k) - 0.5) * 16.0
				var rr := 2.0 + u * 5.0 * _rh(sd, k + 5)
				_fs(R[3])
				_ga(fade)
				_ring(b["x"] + dx / 22.6, b["y"], rr / 22.6, 0, 0.0, 10.0 + _rh(sd, k + 2) * 6.0)
				_glow(cx + dx, cy - _rh(sd, k + 2) * 6.0, 4.0, R[4], fade * 0.6)
		"redmark":
			# (Grudge on him: a red mark over him, its next blow twice as hard)
			_fs(R[3])
			_ga(minf(1.0, fade * 3.0))
			_line(cx - 6.0, cy - 30.0, cx + 6.0, cy - 18.0, 2)
			_line(cx + 6.0, cy - 30.0, cx - 6.0, cy - 18.0, 2)
			_glow(cx, cy - 24.0, 10.0, R[4], 0.5 * fade)
		"sigil":
			_glyph(str(b["id"]), cx, cy - 26.0, 2, R[2], R[4], minf(1.0, fade * 3.0))
		"hourglass":
			_hourglass(cx, cy - 26.0, 7.0, R, minf(1.0, fade * 3.0), u)
		"dagger":
			# (Lancet: a small blade hanging over it, then driven in)
			var dy := -26.0 + (14.0 * u if b.get("told", "") == "drive" else sin(t * 4.0) * 2.0)
			_fs(R[4])
			_ga(minf(1.0, fade * 3.0))
			_line(cx, cy + dy - 8.0, cx, cy + dy + 4.0, 2)
			_fs(Color.WHITE)
			_line(cx, cy + dy - 8.0, cx, cy + dy + 2.0, 1)
			_fs(R[2])
			_fill(cx - 3.0, cy + dy - 10.0, 6.0, 2.0)
		"tether":
			# (Lamprey: a red line latched from it to him, pulsing as it drinks)
			_ga(fade)
			_fs(R[2])
			_line(cx, cy, x1, y1, 3)
			var pulse: float = fmod(t * 2.0, 1.0)
			_drop(cx + (x1 - cx) * pulse, cy + (y1 - cy) * pulse, R, fade)
		"chainline":
			# (Manacle and Grudge: a chain of links from where it holds to what it holds)
			var n := maxi(3, int(Vector2(x1 - cx, y1 - cy).length() / 6.0))
			for k in n + 1:
				var f := float(k) / n
				var px := cx + (x1 - cx) * f
				var py := cy + 8.0 + (y1 - cy) * f + sin(f * PI) * 4.0
				_fs(R[3] if k % 2 == 0 else R[4])
				_ga(minf(1.0, fade * 3.0))
				if k % 2 == 0:
					_fill(px - 2.0, py - 1.0, 4.0, 2.0)
				else:
					_fill(px - 1.0, py - 2.0, 2.0, 4.0)
		"ember":
			_flames(cx, cy + 10.0, 2, 6.0, 10.0, minf(1.0, fade * 4.0), R, sd)
		"shieldring":
			# (Bulwark's ward: raised shields standing round its edge)
			var r: float = float(b["r"])
			for k in 8:
				var a := k * TAU / 8.0
				var p := Vector2(b["x"], b["y"]) + Vector2(cos(a), sin(a)) * r
				_shield_face(_wx(p.x, p.y), _wy(p.x, p.y) - 8.0, 6.0, R, minf(1.0, fade * 4.0))
	_ga(1.0)


## A clock's face: its rim, its twelve hours, its hands standing still.
func _clock(cx: float, cy: float, r: float, R: PackedColorArray, a: float, _u: float) -> void:
	_ga(a)
	_fs(R[1])
	for k in 24:
		var ang := k * TAU / 24.0
		_fill(cx + cos(ang) * r - 1.0, cy + sin(ang) * r - 1.0, 2.0, 2.0)
	_fs(R[4])
	for k in 12:
		var ang := k * TAU / 12.0
		_fill(cx + cos(ang) * (r - 2.0), cy + sin(ang) * (r - 2.0), 1.0, 1.0)
	_fs(Color.WHITE)
	_line(cx, cy, cx, cy - r + 3.0, 1)
	_line(cx, cy, cx + r * 0.5, cy, 1)
	_glow(cx, cy, r * 1.4, R[4], 0.4 * a)


## An hourglass: its two bulbs, the sand falling from the top into the bottom as `u` runs.
func _hourglass(cx: float, cy: float, s: float, R: PackedColorArray, a: float, u: float) -> void:
	_ga(a)
	_fs(R[1])
	_fill(cx - s, cy - s * 1.4, s * 2.0, 2.0)
	_fill(cx - s, cy + s * 1.4 - 2.0, s * 2.0, 2.0)
	for k in int(s * 1.2):
		var f := float(k) / (s * 1.2)
		var w := s * (1.0 - f) + 1.0
		_fs(R[2])
		_fill(cx - w, cy - s * 1.2 + k, 1.0, 1.0)
		_fill(cx + w - 1.0, cy - s * 1.2 + k, 1.0, 1.0)
		_fill(cx - w, cy + s * 1.2 - k - 1.0, 1.0, 1.0)
		_fill(cx + w - 1.0, cy + s * 1.2 - k - 1.0, 1.0, 1.0)
		# (the sand: the top emptying, the bottom filling)
		_fs(R[4])
		if f > u:
			_fill(cx - w + 1.0, cy - s * 1.2 + k + s * 0.2, w * 2.0 - 2.0, 1.0)
		if f < u:
			_fill(cx - w + 1.0, cy + s * 1.2 - k - 1.0, w * 2.0 - 2.0, 1.0)
	_fs(R[5])
	_fill(cx, cy - 1.0, 1.0, 2.0 + u * s)
