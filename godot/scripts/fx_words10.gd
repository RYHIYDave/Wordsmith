## LASTING, FLEETING AND VAST AS THE FIGHT SHOWS THEM (render/words10.ts: the art chat's looks of his three new words, on in the
## game as it starts, WORDS10_LOOK, at his yes to their film, 9 Nov 2026: “Yes, hand all ten to main (Recommended)”). fx.gd hands
## on to this. Every look is the game's own painter PORTED LINE FOR LINE (its brushes, its noise, its order of dots), drawn from
## what the rules keep and the time since, moving at 30 a second through its beats (W10_BEATS), and held against the game's own
## painter dot for dot (checks/looks10_check.gd). Each word's colours, beats and times are the game's, taken out of it by
## tools/godot_words10.ts into assets/words/looks10.json.
##   LASTING (old sand at dusk): on a patch of his (burning ground, ice, a storm, a cloud, cracks, a ward, a rune) a band of
##     sand-light crawling over it, and in the half again it gives, dunes drifting in from its edge, left to blow away as it ends
##     (`lasting_patch`, `dunes`); on his Whirlwind each blade's trail of sand-light hanging, sand sifting out of it, and a drift
##     round its edge (`lasting_spin`, `drift`); a boost it gave him, a ribbon of sand-light along his path (`ribbon`); his
##     poison or burning on a monster, and, in the enemy's pink and gold, a monster's on him: sand-light, a ring of grains, its
##     sand pouring into a heap (`lasting_on_it`, `heap`).
##   FLEETING (a lilac nearly white): a patch's edge licked up in quick tongues, sparks shooting off (`fleeting_patch`); his spin
##     a stutter of him in lilac, each blade traced twice, streaks whipping round (`fleeting_spin`, and the after-images); a
##     boost, lilac after-images of him a step behind and streaks round him; poison or burning ticking fast, little stars popping
##     (`ticks`), his lilac on a monster, the enemy's on him; and its last sparks as what it was on goes.
##   VAST (deep earth): IN FRONT, an area of his landing wider, the floor cracked where its edge was and a bank of dust rolled out
##     to the new edge (`dust_ring`, from the rules' `burst` and `zone`); BEHIND, from each hit a ring of earth and a rock thrown
##     to each one near, bursting on it (`splash`, from `vastSplash`); ON A MONSTER, its warning drawn wider (`wide_warn`).
## WHAT IT READS (`read`): his moves' words as resolved (words.gd `last`, `pace`, `size`, `wide`); the patches of the ground his
## moves leave (wakes.gd list: `skill`); his Whirlwind held (hero.gd channel()); the boosts on him and which move gave each
## (might_t, haste_t, frenzy_t, shield_t, boost_by); his poison, burning and chill, and whose (poison_t, burn_t, chill_t,
## dot_by); a monster's poison and burning and the move that last struck it (monster.gd poison_t, burn_t, last_skill); the
## monsters' warnings (perils.gd list, `warn`, its `by` words).
## WHAT IS LEFT OUT: the looks on what only the other classes make (an orb, a familiar, a turret: render/words10.ts's `thing`
## looks and `thingW10`), for the Warrior makes none of them. The game's grain of dust and its dither are taken where they lie
## on its screen (so they shift under a moving camera); here, where they lie on the floor.
## HOW IT IS KEPT QUICK ENOUGH IN GDSCRIPT, none of it changing a dot: the game's hash2 written out in place where it is asked
## most; what does not change along a row or over a patch's life worked out once (the dunes' pixels kept in the order their
## tongues reach them, the sand-light's grains a row at a time); a pixel that its noise cannot lift past its cut left at once;
## each layer's dots drawn in one call, painted afresh 30 times a second (or at once as a moment begins); what is wholly off the
## screen not painted. (What it costs a frame: `--only=looks10`, its line LOOKS10 COST.)
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const Words := preload("res://scripts/words.gd")
const Hero := preload("res://scripts/hero.gd")
const FILE := "res://assets/words/looks10.json"

## Each word's colours, darkest to brightest (W10_RAMP); the enemy's (W10_ENEMY); the floor's earth and dust, and the enemy's
## dust (render/words10.ts EARTH, DUST, ENEMY_DUST).
static var RAMP := {}
static var ENEMY := PackedColorArray()
static var EARTH := PackedColorArray()
static var DUST := PackedColorArray()
static var ENEMY_DUST := PackedColorArray()
## Each look's beats, seconds: {build, hit, fade} (W10_BEATS); its numbers (W10_TIME).
static var BEAT := {}
static var TIME := {}
## (a world radius laid on the floor, across and down, game pixels; how tall he stands; the rules' poison's time, and the three
## words' numbers: defs.ts LASTING, FLEETING, VAST)
static var RX := 22.6
static var RY := 11.3
static var HERO_TOP := 24.0
static var POISON_TIME := 4.0
static var LASTING := {}
static var FLEETING := {}
static var VAST := {}
static var T_CRAWL := 2.6
static var T_DRIFT := 5.0
static var T_WHIP := 9.0
static var T_FLARE := 0.09
static var T_RING := 0.34
static var T_RINGFADE := 0.3
static var T_SPLASH := 0.32
static var T_SPLASHFADE := 0.3
static var T_STUTTER := 0.05
static var T_RIBBON := 1.1

## His after-images in one colour, a little of their own light and shade kept (render/words10.ts `tinted`: the colour laid over
## the picture at 0.82); the colour and how strong as its `modulate`.
const TINT := """
shader_type canvas_item;
varying vec4 tint;
void vertex() {
	tint = COLOR;
}
void fragment() {
	vec4 t = texture(TEXTURE, UV);
	COLOR = vec4(mix(t.rgb, tint.rgb, 0.82), t.a * tint.a);
}
"""
var _tint_mat: ShaderMaterial

var fx
## THE RULES' STATE AS LAST READ (`read`), in the game's own names (render/words10.ts reads them off its Game):
##   hero: {x, y, fx, fy, speed, skills: [{id, kind, radius, channel, last, pace, size, wide, might, haste, frenzy, shield}],
##          channel: {skill, t} or null, mightT, hasteT, frenzyT, shieldT, boostBy (or null), poisonT, burnT, chillT, dotBy}
##   zones: his patches {key, x, y, r, t, dur, kind, skill} and the monsters' warnings {kind: "warn", x, y, r, t, dur, words, half}
##   monsters: those that may show, {id, x, y, r, dead, top, words, poisonT, burnT, lastSkill}
var view := {}
## The looks' own clock (W10.clock) and the effects' (fx.clock: the Whirlwind's blades go round with it).
var clock := 0.0
var fx_clock := 0.0
## Its moments at work (Act10): {id, word, kind: "ring" | "splash" | "after", t, dur, seed, x, y, r, r0, z, to, what, p, whirl,
## enemy, lead}.
var acts: Array = []
var _next := 1
## His path (world), newest last, for a boost's ribbon: {x, y, at}; and (for a still) a path laid by hand, or null.
var trail: Array = []
var laid_trail = null
## His pictures as drawn over the last moments, for Fleeting's after-images: {tex, offset, scale, flip, x, y, at}.
var seen: Array = []
## The held looks as last seen, by what made them; when each state began (a boost, a poison); the states as last seen.
var held := {}
var since := {}
var last_states := {}
## (recording, for the check: every dot laid, by where, its colour; null when drawing)
var _rec = null
## (his after-images, pictures among what stands, kept from frame to frame)
var _ghosts: Array = []
var _warns := 0


static func ready_up() -> void:
	if not RAMP.is_empty():
		return
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	for w in d["ramp"]:
		RAMP[w] = _colors(d["ramp"][w])
	ENEMY = _colors(d["enemy"])
	EARTH = _colors(d["earth"])
	DUST = _colors(d["dust"])
	ENEMY_DUST = _colors(d["enemyDust"])
	BEAT = d["beats"]
	TIME = d["time"]
	RX = float(d["rx"])
	RY = float(d["ry"])
	HERO_TOP = float(d["heroTop"])
	POISON_TIME = float(d["poisonTime"])
	T_CRAWL = float(TIME["crawl"])
	T_DRIFT = float(TIME["drift"])
	T_WHIP = float(TIME["whip"])
	T_FLARE = float(TIME["flare"])
	T_RING = float(TIME["ring"])
	T_RINGFADE = float(TIME["ringFade"])
	T_SPLASH = float(TIME["splash"])
	T_SPLASHFADE = float(TIME["splashFade"])
	T_STUTTER = float(TIME["stutter"])
	T_RIBBON = float(TIME["ribbon"])
	LASTING = Words.data()["lasting"]
	FLEETING = Words.data()["fleeting"]
	VAST = Words.data()["vast"]


static func _colors(list: Array) -> PackedColorArray:
	var out := PackedColorArray()
	for h in list:
		out.append(Color(h))
	return out


func _init() -> void:
	ready_up()


func clear() -> void:
	acts = []
	trail = []
	seen = []
	laid_trail = null
	held = {}
	since = {}
	last_states = {}
	view = {}
	_kept = [null, null]
	for g in _ghosts:
		if is_instance_valid(g):
			g.queue_free()
	_ghosts = []


func alive() -> bool:
	return not (acts.is_empty() and held.is_empty() and since.is_empty()) or _warns > 0


## The whole of a look made by an event: its build, its hit and its fade (w10Life).
static func life(key: String) -> float:
	var b: Dictionary = BEAT[key]
	return float(b["build"]) + float(b["hit"]) + float(b["fade"])


# =====================================================================================================================
# The game's own arithmetic: its noise (engine/rng.ts hash2, in 32-bit as Math.imul has it), its rounding, its easings.

## hash2(x, y, seed): a steady number from 0 to 1.
static func _h(x: int, y: int, s: int) -> float:
	var v := (x * 374761393 + y * 668265263 + s * 2246822519) & 0xffffffff
	v = ((v ^ (v >> 13)) * 1274126177) & 0xffffffff
	return float(v ^ (v >> 16)) / 4294967296.0


## Math.round.
static func _ri(v: float) -> int:
	return int(floorf(v + 0.5))


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _smooth(q: float) -> float:
	var k := _c01(q)
	return k * k * (3.0 - 2.0 * k)


static func _ease_out(q: float) -> float:
	return 1.0 - pow(1.0 - _c01(q), 3.0)


## Fast, then slow: a strike's run and its long wind-down.
static func _strike_out(q: float) -> float:
	return 1.0 - pow(1.0 - _c01(q), 4.0)


## Whether a pixel is in, for a see-through `a`: scattered as grain is (dith). (Its rounding and its hash2 written out.)
static func _dith(x: float, y: float, a: float, seed := 91) -> bool:
	var q := (int(floorf(x + 0.5)) * 374761393 + int(floorf(y + 0.5)) * 668265263 + seed * 2246822519) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	return a > float(q ^ (q >> 16)) / 4294967296.0


## The same for a grain that moves, by its own place in the look (grain).
static func _grain(i: float, j: float, a: float, seed := 91) -> bool:
	var q := (int(floorf(i + 0.5)) * 374761393 + int(floorf(j + 0.5)) * 668265263 + seed * 2246822519) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	return a > float(q ^ (q >> 16)) / 4294967296.0


## Smooth value noise, 0..1 (vnoise).
## (its four corners' hash2 written out in place: the same numbers, without four calls a time)
static func _vn(x: float, y: float, seed: int) -> float:
	var x0 := floorf(x)
	var y0 := floorf(y)
	# (smooth: what is past the floor is already 0..1)
	var fu := x - x0
	var fv := y - y0
	var u := fu * fu * (3.0 - 2.0 * fu)
	var v := fv * fv * (3.0 - 2.0 * fv)
	var xa := int(x0) * 374761393
	var xb := xa + 374761393
	var ya := int(y0) * 668265263
	var yb := ya + 668265263
	var sk := seed * 2246822519
	var q := (xa + ya + sk) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	var a := float(q ^ (q >> 16)) / 4294967296.0
	q = (xb + ya + sk) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	var b := float(q ^ (q >> 16)) / 4294967296.0
	q = (xa + yb + sk) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	var c := float(q ^ (q >> 16)) / 4294967296.0
	q = (xb + yb + sk) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	var d := float(q ^ (q >> 16)) / 4294967296.0
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v


## Where a place on the floor is on the screen, game pixels, `z` up (S: wx, wy).
func _sx(x: float, y: float) -> float:
	return (x - y) * 16.0


func _sy(x: float, y: float, z := 0.0) -> float:
	return ((x + y) * 8.0 if fx == null or not _lifted else fx.gy(x, y)) - z


## (whether the place's floor lifts what stands on it anywhere: fx.gd's, as last read)
var _lifted := false


## One dot of the game's pixels where it rounds it to (dot: its fillRect).
## (Each dot is kept, as a run two picture pixels high, and the layer's dots drawn at once: `_paint`.)
func _dot(_c: CanvasItem, x: float, y: float, col: Color, w := 1, h := 1) -> void:
	var px := floorf(x + 0.5)
	var py := floorf(y + 0.5)
	if _rec != null:
		for j in h:
			for i in w:
				_rec[Vector2i(int(px) + i, int(py) + j)] = col
		return
	for j in h:
		_pts.append(Vector2(px * 2.0, (py + j) * 2.0 + 1.0))
		_pts.append(Vector2((px + w) * 2.0, (py + j) * 2.0 + 1.0))
		_cols.append(col)


# =====================================================================================================================
# The brushes (render/words10.ts): every look is painted with these, pixel by pixel.

## A streak from its tail to its head: `w` across at its head, its tones dim to bright (streak).
func _streak(c: CanvasItem, x0: float, y0: float, x1: float, y1: float, C: PackedColorArray, w := 1, alpha := 1.0) -> void:
	var dx := x1 - x0
	var dy := y1 - y0
	var n := maxi(1, _ri(maxf(absf(dx), absf(dy))))
	var len := sqrt(dx * dx + dy * dy)
	if len == 0.0:
		len = 1.0
	var nx := -dy / len
	var ny := dx / len
	var cn := C.size()
	for s in n + 1:
		var q := float(s) / n
		var px := x0 + dx * q
		var py := y0 + dy * q
		if q < 0.3 and not _grain(n - s, 1, q / 0.3 + 0.2, 7):
			continue
		if alpha < 1.0 and not _grain(n - s, 2, alpha, 8):
			continue
		var ci := mini(cn - 1, int(floorf(q * cn)))
		var half := _ri(((w - 1) / 2.0) * q)
		for k in range(-half, half + 1):
			_dot(c, px + nx * k, py + ny * k, C[maxi(0, ci - (1 if half > 0 and absi(k) == half else 0))])


## Mist, smoke or dust: a soft cloud of uneven billows, thinning to grains at its edge (mist).
func _mist(c: CanvasItem, cx: float, cy: float, rx: float, ry: float, C: PackedColorArray, amount: float, seed: int, t: float, rise := 0.6) -> void:
	if amount <= 0.0:
		return
	var cn := C.size()
	var ryc := int(ceilf(ry))
	var rxc := int(ceilf(rx))
	var rx2 := rx * rx
	var ry2 := ry * ry
	var most := amount * 2.2
	var s1 := seed * 2246822519
	var s2 := (seed + 3) * 2246822519
	var s3 := (seed + 11) * 2246822519
	for dy in range(-ryc, ryc + 1):
		var ey := (dy * dy) / ry2
		if ey > 1.0:
			continue
		var y := floorf(cy + dy + 0.5)
		# (its two noises, vnoise(x * 0.18 + bend, y1) and vnoise(x * 0.45, y2): what of each is the row's, once a row)
		var bend := sin(y * 0.13 + t * 1.3) * 0.8
		var y1 := y * 0.22 + t * rise * 3.0
		var y2 := y * 0.5 + t * rise * 5.0
		var y10 := floorf(y1)
		var f1 := y1 - y10
		var v1 := f1 * f1 * (3.0 - 2.0 * f1)
		var y1a := int(y10) * 668265263
		var y1b := y1a + 668265263
		var y20 := floorf(y2)
		var f2 := y2 - y20
		var v2 := f2 * f2 * (3.0 - 2.0 * f2)
		var y2a := int(y20) * 668265263
		var y2b := y2a + 668265263
		var yc := int(y) * 668265263
		# (each noise's four corners, kept while it is in the same cell along the row)
		var k1 := 1 << 40
		var a1 := 0.0
		var b1 := 0.0
		var c1 := 0.0
		var d1 := 0.0
		var k2 := 1 << 40
		var a2 := 0.0
		var b2 := 0.0
		var c2 := 0.0
		var d2 := 0.0
		for dx in range(-rxc, rxc + 1):
			var e := (dx * dx) / rx2 + ey
			if e > 1.0:
				continue
			# (no more of it here than its least cut, whatever its noise: none; the same pixels as the game's, found sooner)
			var hi := pow(1.0 - e, 0.8)
			if hi * most < 0.2399:
				continue
			var x := floorf(cx + dx + 0.5)
			var x1 := x * 0.18 + bend
			var x10 := floorf(x1)
			var xi := int(x10)
			if xi != k1:
				k1 = xi
				var xa := xi * 374761393
				var xb := xa + 374761393
				var q := (xa + y1a + s1) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				a1 = float(q ^ (q >> 16)) / 4294967296.0
				q = (xb + y1a + s1) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				b1 = float(q ^ (q >> 16)) / 4294967296.0
				q = (xa + y1b + s1) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				c1 = float(q ^ (q >> 16)) / 4294967296.0
				q = (xb + y1b + s1) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				d1 = float(q ^ (q >> 16)) / 4294967296.0
			var g1 := x1 - x10
			var u1 := g1 * g1 * (3.0 - 2.0 * g1)
			var n1 := a1 + (b1 - a1) * u1 + (c1 - a1) * v1 + (a1 - b1 - c1 + d1) * u1 * v1
			var up := n1 * 0.7 + 0.3
			if hi * amount * up * up * 2.2 < 0.2399:
				continue
			var x2 := x * 0.45
			var x20 := floorf(x2)
			var xj := int(x20)
			if xj != k2:
				k2 = xj
				var xa := xj * 374761393
				var xb := xa + 374761393
				var q := (xa + y2a + s2) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				a2 = float(q ^ (q >> 16)) / 4294967296.0
				q = (xb + y2a + s2) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				b2 = float(q ^ (q >> 16)) / 4294967296.0
				q = (xa + y2b + s2) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				c2 = float(q ^ (q >> 16)) / 4294967296.0
				q = (xb + y2b + s2) & 0xffffffff
				q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
				d2 = float(q ^ (q >> 16)) / 4294967296.0
			var g2 := x2 - x20
			var u2 := g2 * g2 * (3.0 - 2.0 * g2)
			var n2 := a2 + (b2 - a2) * u2 + (c2 - a2) * v2 + (a2 - b2 - c2 + d2) * u2 * v2
			var n := n1 * 0.7 + n2 * 0.3
			var v := hi * amount * n * n * 2.2
			var q := (int(x) * 374761393 + yc + s3) & 0xffffffff
			q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
			var cut := 0.32 + (float(q ^ (q >> 16)) / 4294967296.0 - 0.5) * 0.16
			if v < cut:
				continue
			_dot(c, x, y, C[maxi(0, mini(cn - 1, int(floorf(((v - 0.32) / 0.6) * cn))))])


## A clod of earth flung: two by two, its top lit, its underside dark (clod).
func _clod(c: CanvasItem, x: float, y: float, C: PackedColorArray, big: bool) -> void:
	_dot(c, x, y, C[4])
	_dot(c, x + 1.0, y, C[3])
	_dot(c, x, y + 1.0, C[2])
	_dot(c, x + 1.0, y + 1.0, C[1])
	if big:
		_dot(c, x - 1.0, y + 1.0, C[3])
		_dot(c, x + 2.0, y + 1.0, C[1])
		_dot(c, x, y + 2.0, C[1], 2, 1)


## A rock of earth torn up and thrown (rock).
func _rock(c: CanvasItem, x: float, y: float, big := false) -> void:
	var C: PackedColorArray = RAMP["vast"]
	x = float(_ri(x) - 2)
	y = float(_ri(y) - 1)
	if big:
		_dot(c, x, y - 1.0, C[4], 3, 1)
		_dot(c, x - 1.0, y, C[5])
		_dot(c, x + 3.0, y, EARTH[3])
		_dot(c, x + 4.0, y + 1.0, EARTH[2])
		_dot(c, x + 3.0, y + 2.0, EARTH[1])
		_dot(c, x, y + 3.0, EARTH[1], 3, 1)
	_dot(c, x + 1.0, y, C[5])
	_dot(c, x + 2.0, y, C[4])
	_dot(c, x, y + 1.0, C[4])
	_dot(c, x + 1.0, y + 1.0, EARTH[4])
	_dot(c, x + 2.0, y + 1.0, EARTH[3])
	_dot(c, x + 3.0, y + 1.0, EARTH[2])
	_dot(c, x + 1.0, y + 2.0, EARTH[2])
	_dot(c, x + 2.0, y + 2.0, EARTH[1])
	_dot(c, x, y + 2.0, EARTH[3])


# =====================================================================================================================
# LASTING: a slow, heavy shimmer of sand-light crawling over what it holds; in the time it gave, its sand running out.

## A band of sand-light crawling slowly across an oval (sandOver).
func _sand_over(c: CanvasItem, cx: float, cy: float, rx: float, ry: float, t: float, seed: int, amount: float, C: PackedColorArray, base := 0.07) -> void:
	if amount <= 0.0:
		return
	var band := fmod(t / T_CRAWL + _h(seed, 1, 5), 1.0) * 3.4 - 1.7
	var fall := int(floorf(t * T_DRIFT))
	cx = float(_ri(cx))
	cy = float(_ri(cy))
	var ryc := int(ceilf(ry))
	var rxc := int(ceilf(rx))
	var rx2 := rx * rx
	var ry2 := ry * ry
	var c3 := C[3]
	var c4 := C[4]
	var c5 := C[5]
	var rows := _grain_rows(seed + 7, rxc, 2 * ryc + 1)
	for dy in range(-ryc, ryc + 1):
		var ey := (dy * dy) / ry2
		if ey > 1.0:
			continue
		var uy := (dy / ry) * 0.7
		var j := dy - fall
		var row = rows.get(j)
		if row == null:
			row = PackedFloat64Array()
			row.resize(2 * rxc + 1)
			for dx in range(-rxc, rxc + 1):
				row[dx + rxc] = _h(dx, j, seed + 7)
			rows[j] = row
		var hs: PackedFloat64Array = row
		# (the band's own pixels, and a pixel past it out by one, each looked at; past those none is in the band, and only a
		# grain under the least band's `base` can show there: those of the row, kept. The same pixels as the game's, each its own.)
		var lo := -rxc
		var hi := rxc
		if amount < 1.0:
			lo = maxi(-rxc, int(floorf((band - 0.36 - uy) * rx / 0.72)) - 1)
			hi = mini(rxc, int(ceilf((band + 0.36 - uy) * rx / 0.72)) + 1)
		for dx in range(lo, hi + 1):
			var e := (dx * dx) / rx2 + ey
			if e > 1.0:
				continue
			var u := (dx / rx) * 0.72 + uy
			var d := absf(u - band)
			var in_band := 1.0 - d / 0.36 if d < 0.36 else 0.0
			var p := (base + 0.85 * in_band) * amount * (1.0 - e * 0.35)
			if hs[dx + rxc] >= p:
				continue
			_dot(c, cx + dx, cy + dy, c5 if in_band > 0.7 else (c4 if in_band > 0.25 else c3))
		if amount >= 1.0:
			continue
		var few = rows.get("under:%d:%s" % [j, base])
		if few == null:
			few = PackedInt32Array()
			for dx in range(-rxc, rxc + 1):
				if hs[dx + rxc] < base:
					few.append(dx)
			rows["under:%d:%s" % [j, base]] = few
		for dx: int in few:
			if dx >= lo and dx <= hi:
				continue
			var e := (dx * dx) / rx2 + ey
			if e > 1.0:
				continue
			var p := base * amount * (1.0 - e * 0.35)
			if hs[dx + rxc] >= p:
				continue
			_dot(c, cx + dx, cy + dy, c3)


## (the grains of a band of sand-light, a row at a time, as they drift down a row at a time: hash2(dx, row, seed), kept)
var _rows := {}


func _grain_rows(seed: int, rxc: int, tall: int) -> Dictionary:
	var key := seed * 4096 + rxc
	var rows = _rows.get(key)
	if rows == null or rows.size() > tall * 6:
		if _rows.size() > 96:
			_rows.clear()
		rows = {}
		_rows[key] = rows
	return rows


## A heap of sand on the floor, `p` of the way to its whole size; `keep` as it blows away (heap).
func _heap(c: CanvasItem, x: float, y: float, p: float, C: PackedColorArray, keep := 1.0, seed := 5) -> void:
	if p <= 0.02:
		return
	var w := 3.0 + p * 8.0
	var h := 1.4 + p * 3.0
	for row in int(ceilf(h)):
		var q := row / h
		var half := (w / 2.0) * (1.0 - pow(q, 1.5))
		var hr := _ri(half)
		for dx in range(-hr, hr + 1):
			if keep < 1.0 and not _grain(dx, row, keep * (1.25 - q * 0.5 - (dx / maxf(1.0, half)) * 0.25), seed):
				continue
			var side := dx / maxf(1.0, half)
			var col: Color = ((C[1] if side > 0.3 else C[2]) if row == 0 else (C[4] if side < -0.3 else (C[2] if side > 0.45 else C[3])))
			_dot(c, x + dx, y - row, col)
	if keep > 0.6:
		_dot(c, x - 1.0, y - ceilf(h) + 1.0, C[5])


## A heap blowing away (`out` 0..1 of its going): its grains lifted off and carried away (blownSand).
func _blown_sand(c: CanvasItem, x: float, y: float, p: float, out: float, seed: int, C: PackedColorArray, n := 10) -> void:
	for i in n:
		var off := _h(i, 1, seed) * 0.5
		var k := _c01((out - off) / 0.5)
		if k <= 0.0 or k >= 1.0:
			continue
		var sx := x + (_h(i, 2, seed) - 0.5) * (3.0 + p * 8.0)
		var sy := y - 1.0 - _h(i, 3, seed) * (1.0 + p * 3.0)
		var gx := sx + k * (8.0 + _h(i, 4, seed) * 10.0)
		var gy := sy - sin(k * PI) * (3.0 + _h(i, 5, seed) * 4.0) + k * 2.0
		_dot(c, gx, gy, C[4] if k < 0.5 else C[3])


## A thread of sand pouring to the floor, splashing at its foot (pour).
func _pour(c: CanvasItem, x: float, y0: float, y1: float, t: float, seed: int, amount: float, C: PackedColorArray) -> void:
	var Ln := maxf(2.0, y1 - y0)
	var s := 0
	while s <= Ln:
		var q := s / Ln
		var run := fmod(s * 0.37 - t * 7.5 + _h(seed, 2, 2) * 9.0, 1.6)
		if q > 0.25 and not _dith(x, y0 + s + floorf(t * 30.0), (1.0 - q * 0.55) * amount * (1.0 if run < 0.9 else 0.35), seed):
			s += 1
			continue
		_dot(c, x + (1.0 if q > 0.6 and _h(s, int(floorf(t * 20.0)), seed) < 0.3 else 0.0), y0 + s, C[5] if q < 0.3 else C[4])
		s += 1
	for i in 4:
		var ph := fmod(t * 2.2 + i / 4.0, 1.0)
		var sx := x + (1.0 if i % 2 else -1.0) * (1.0 + ph * 3.0)
		var sy := y1 - 2.0 - sin(ph * PI) * 2.0
		if _dith(sx, sy, amount * (1.0 - ph), seed + i):
			_dot(c, sx, sy, C[4])


## A ring of sand turning slowly round a thing hanging at (cx, cy) of radius `rad` (sandRing).
func _sand_ring(c: CanvasItem, cx: float, cy: float, rad: float, t: float, seed: int, amount: float, C: PackedColorArray) -> void:
	var rx := rad + 5.0
	var ry := (rad + 5.0) * 0.36
	var n := _ri(rx * 9.0)
	for i in n:
		var a := (float(i) / n) * TAU + t * 0.55
		for band in 2:
			var sc := 1.0 if band == 0 else 0.84
			var x := cx + cos(a) * rx * sc
			var y := cy + 1.0 + sin(a) * ry * sc - cos(a) * 1.2
			var near := sin(a) > 0.0
			if not near:
				var ex := x - cx
				var ey := (y - cy) * 1.05
				if sqrt(ex * ex + ey * ey) < rad + 0.5:
					continue
			var v := _vn(i * 0.4 + band * 7, 1.0, seed)
			if not _grain(i, band, amount * (0.25 + v) * (1.0 if near else 0.6), seed + band):
				continue
			_dot(c, x, y, (C[5] if v > 0.6 else C[4]) if near else (C[4] if v > 0.6 else C[3]))


## Lasting on a patch of ground: the band of sand-light crawling over it; in the time Lasting gave it, dunes (lastingPatch).
func _lasting_patch(c: CanvasItem, cx: float, cy: float, r: float, t: float, seed: int, p: float, fade: float) -> void:
	_sand_over(c, cx, cy - 1.0, r * RX * 0.92, r * RY * 0.92, t, seed, 0.85 * fade, RAMP["lasting"], 0.04)
	if p <= 0.0:
		return
	_dunes(c, cx, cy, r, t, seed, p, 1.0)


## The dunes of Lasting's sand drifting in over a patch from its edge (`p` how far), rippled; `keep` as they blow away (dunes).
## (What of each pixel does not move with time is worked out once for the patch, the same numbers in the same order.)
func _dunes(c: CanvasItem, cx: float, cy: float, r: float, t: float, seed: int, p: float, keep: float) -> void:
	var C: PackedColorArray = RAMP["lasting"]
	cx = float(_ri(cx))
	cy = float(_ri(cy))
	var reach := 0.1 + 0.62 * p
	var f: Dictionary = _dune_field(r, seed)
	var dxs: PackedInt32Array = f["dx"]
	var dys: PackedInt32Array = f["dy"]
	var es: PackedFloat64Array = f["e"]
	var outs: PackedFloat64Array = f["outer"]
	var ins: PackedFloat64Array = f["inner"]
	var gs: PackedFloat64Array = f["grain"]
	var phs: PackedFloat64Array = f["ph"]
	var ends: PackedInt32Array = f["ends"]
	var c2 := C[2]
	var c3 := C[3]
	var c4 := C[4]
	var tt := t * 0.9
	# (none whose tongue has not come so far yet: those past `upto` are surely under it)
	var upto: int = ends[mini(ends.size() - 1, int((reach + 1e-9) / DUNE_STEP))]
	for k0 in upto:
		var e := es[k0]
		var outer := outs[k0]
		var inner := outer - reach * (0.35 + 1.1 * ins[k0])
		if e < inner:
			continue
		var k := (e - inner) / maxf(0.01, outer - inner)
		if not (minf(1.0, 0.15 + k * 1.5) * (_c01(keep * 1.6 - (1.0 - k) * 0.6) if keep < 1.0 else 1.0) > gs[k0]):
			continue
		var ph := fmod(fmod(phs[k0] - tt, 2.6) + 2.6, 2.6)
		_dot(c, cx + dxs[k0], cy + dys[k0], c4 if ph < 0.55 else (c2 if ph < 1.15 else c3))


var _fields := {}
const DUNE_STEP := 0.01


## The pixels of a patch's dunes that may show, and what of each does not move with time (dunes: its edge, its tongues' noise,
## its grain, its ripples' place): kept for the patch's size and seed.
func _dune_field(r: float, seed: int) -> Dictionary:
	var key := "%d:%.9f" % [seed, r]
	var f = _fields.get(key)
	if f != null:
		return f
	if _fields.size() > 64:
		_fields.clear()
	var rx := r * RX
	var ry := r * RY
	var dxs := PackedInt32Array()
	var dys := PackedInt32Array()
	var es := PackedFloat64Array()
	var outs := PackedFloat64Array()
	var ins := PackedFloat64Array()
	var gs := PackedFloat64Array()
	var phs := PackedFloat64Array()
	var ryc := int(ceilf(ry * 1.06))
	var rxc := int(ceilf(rx * 1.06))
	for dy in range(-ryc, ryc + 1):
		for dx in range(-rxc, rxc + 1):
			var e := sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry))
			var a := atan2(dy / ry, dx / rx)
			var outer := 1.0 + 0.05 * (_vn(a * 5.0 + 11.0, 0.0, seed) - 0.5)
			if e > outer:
				continue
			dxs.append(dx)
			dys.append(dy)
			es.append(e)
			outs.append(outer)
			ins.append(_vn(a * 3.1 + 7.0, 0.5, seed))
			gs.append(_h(dx, dy, seed + 3))
			phs.append((outer - e) * maxf(rx, 8.0) * 0.36 + _vn(a * 6.0, 1.0, seed + 1) * 1.8)
	# (in the order their tongues reach them: how far the dunes must have come in for each to show, `need`, in steps of
	# DUNE_STEP; `ends`: where each step's run ends. Those that never show, past its furthest, left out. Each is a pixel of its
	# own, so the order they are drawn in does not change the picture.)
	var most := int(0.73 / DUNE_STEP) + 1
	var bucket := PackedInt32Array()
	var counts := PackedInt32Array()
	counts.resize(most)
	for k in dxs.size():
		var need := (outs[k] - es[k]) / (0.35 + 1.1 * ins[k])
		var b := int(need / DUNE_STEP)
		bucket.append(b)
		if b < most:
			counts[b] += 1
	var ends := PackedInt32Array()
	ends.resize(most)
	var run := 0
	for b in most:
		run += counts[b]
		ends[b] = run
	var at := PackedInt32Array()
	at.resize(most)
	for b in most:
		at[b] = ends[b] - counts[b]
	var ndx := PackedInt32Array()
	var ndy := PackedInt32Array()
	var ne := PackedFloat64Array()
	var nout := PackedFloat64Array()
	var nin := PackedFloat64Array()
	var ng := PackedFloat64Array()
	var nph := PackedFloat64Array()
	ndx.resize(run)
	ndy.resize(run)
	ne.resize(run)
	nout.resize(run)
	nin.resize(run)
	ng.resize(run)
	nph.resize(run)
	for k in dxs.size():
		var b := bucket[k]
		if b >= most:
			continue
		var i := at[b]
		at[b] += 1
		ndx[i] = dxs[k]
		ndy[i] = dys[k]
		ne[i] = es[k]
		nout[i] = outs[k]
		nin[i] = ins[k]
		ng[i] = gs[k]
		nph[i] = phs[k]
	f = {"dx": ndx, "dy": ndy, "e": ne, "outer": nout, "inner": nin, "grain": ng, "ph": nph, "ends": ends}
	_fields[key] = f
	return f


## Lasting on his Whirlwind: a trail of sand-light behind each of its two blades, sand sifting down out of it; in the time
## Lasting gave the spin, a drift round its edge (lastingSpin). (hx, hy): where he is (world); `age`: how long it has spun.
func _lasting_spin(c: CanvasItem, hx: float, hy: float, r: float, t: float, clk: float, seed: int, p: float, floor: bool, age := 9.0) -> void:
	var C: PackedColorArray = RAMP["lasting"]
	if floor:
		if p > 0.0:
			_drift(c, hx, hy, r, p, seed, 1.0)
		return
	var lead0 := clk * TAU * 2.6
	var grown := _c01(age / float(BEAT["lasting:spin"]["build"]))
	for half in [0.0, PI]:
		var hv: float = half
		var u := 0.0
		while u < grown:
			var behind := 1.75 + u * 2.4
			var a := lead0 + hv - behind
			var rr := r * (0.97 + 0.05 * _vn(u * 30.0, 2.0, seed))
			var wx := hx + cos(a) * rr
			var wy := hy + sin(a) * rr
			var px := _sx(wx, wy)
			var py := _sy(wx, wy, 10.0) + u * u * 7.0
			if _grain(u * 200.0, hv, pow(1.0 - u, 0.8) * 1.1, seed + 2):
				_dot(c, px, py, C[5] if u < 0.22 else C[4])
				if u < 0.65:
					_dot(c, px, py + 1.0, C[4] if u < 0.3 else C[3])
			u += 0.005
		# sand sifting down out of it: each grain let go where the trail was, falling straight, then another
		for i in 22:
			var P := 0.9
			var ph := t / P + _h(i, seed, 4)
			var k := ph - floorf(ph)
			var gen := int(floorf(ph))
			var uu := _h(i, gen, 3) * 0.85
			if uu > grown or k * P > age:
				continue
			var a := lead0 - k * P * TAU * 2.6 + hv - (1.75 + uu * 2.4)
			var wx := hx + cos(a) * r
			var wy := hy + sin(a) * r
			_dot(c, _sx(wx, wy), _sy(wx, wy, 10.0 - k * 12.0) + uu * uu * 7.0, C[4] if k < 0.5 else C[3])


## Lasting's sand settled in a drift round a spin's edge (drift).
func _drift(c: CanvasItem, hx: float, hy: float, r: float, p: float, seed: int, keep: float) -> void:
	var C: PackedColorArray = RAMP["lasting"]
	var n := _ri(r * RX * 7.0)
	for i in n:
		var a := (float(i) / n) * TAU
		var thick := 1 + _ri((1.5 + 2.0 * _vn(a * 4.0, 0.0, seed)) * p)
		for j in thick:
			var rr := r * (1.02 - j * 0.035)
			var wx := hx + cos(a) * rr
			var wy := hy + sin(a) * rr
			if not _grain(i, j, (0.35 + 0.6 * p) * (_c01(keep * 1.5 - (float(j) / thick) * 0.5) if keep < 1.0 else 1.0), seed + j):
				continue
			_dot(c, _sx(wx, wy), _sy(wx, wy), C[4] if j == thick - 1 else (C[2] if j == 0 else C[3]))


## A boost Lasting gave him: its glow drawn out behind him in a long ribbon of sand-light along his path (ribbon). `xs`, `ys`:
## screen points from his back to its tail.
func _ribbon(c: CanvasItem, xs: PackedFloat64Array, ys: PackedFloat64Array, t: float, seed: int, grown: float, fray: float, C: PackedColorArray) -> void:
	if xs.size() < 2:
		return
	var Ln := 0.0
	for i in range(1, xs.size()):
		var ddx := xs[i] - xs[i - 1]
		var ddy := ys[i] - ys[i - 1]
		Ln = Ln + sqrt(ddx * ddx + ddy * ddy)
	var s := 0.0
	for i in range(1, xs.size()):
		var x0 := xs[i - 1]
		var y0 := ys[i - 1]
		var x1 := xs[i]
		var y1 := ys[i]
		var seg := sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
		var n := maxi(1, int(ceilf(seg)))
		for k in n:
			var at := s + (float(k) / n) * seg
			var q := at / maxf(1.0, Ln)
			# (it draws out from his back as the boost begins)
			if q > grown:
				return
			var x := x0 + ((x1 - x0) * k) / n
			var y := y0 + ((y1 - y0) * k) / n
			var wave := sin(at * 0.19 - t * 3.1) * 4.5 * minf(1.0, q * 2.5) + sin(at * 0.07 - t * 1.3) * 2.0 * q
			var twist := cos(at * 0.15 - t * 2.2)
			var wide := maxi(0, _ri(absf(twist) * 2.8 * (1.0 - q * 0.5)))
			var yy := y + wave
			var keep := (1.0 - (q - 0.6) / 0.4 if q > 0.6 else 1.0) * (_c01((1.0 - fray - q) / 0.3) if fray > 0.0 else 1.0)
			var A := _ri(at)
			var fraying := fray > 0.0 and keep < 0.9
			var loose := 0.2 if fraying else (0.08 if q > 0.35 else 0.0)
			if loose > 0.0 and _h(A, 3, seed + 4) < loose:
				var h1 := _h(A, 1, seed + 5)
				var h2 := _h(A, 7, seed + 5)
				var fallen := _c01(fray * 2.2 - q * 0.6 + h1 * 0.4) * (5.0 + h2 * 16.0) if fraying else fmod(t * 0.7 + h1, 1.0) * (6.0 + h2 * 8.0)
				var drift := (h2 - 0.5) * 8.0 * (fray if fraying else 0.4) + fallen * 0.3
				if _grain(A, 2, 1.0 - fray * 0.85 if fraying else keep, seed + 6):
					_dot(c, x + 1.0 + drift, yy + wide + 2.0 + fallen, C[4] if h1 < 0.5 else C[3])
			if keep <= 0.0 or (keep < 1.0 and not _grain(A, 0, keep, seed)):
				continue
			var top := twist > 0.0
			_dot(c, x, yy - wide, C[5] if top else C[4])
			for w in range(-wide + 1, wide + 1):
				if w > -wide + 1 and w < wide and not _grain(A, w + 10, 0.85 - q * 0.35, seed + 9):
					continue
				_dot(c, x, yy + w, ((C[3] if top else C[2]) if w == wide else ((C[5] if w <= -wide + 2 else C[4]) if top else C[3])))
		s += seg


## Lasting on what was left on one (its poison, its burning; or, in the enemy's colours, a monster's on him) (lastingOnIt).
func _lasting_on_it(c: CanvasItem, cx: float, cy: float, top: float, t: float, seed: int, p: float, C: PackedColorArray, amt := 1.0) -> void:
	_sand_over(c, cx, cy - top * 0.5, 6.0, top * 0.45, t, seed, 0.9 * amt, C, 0.03)
	_sand_ring(c, cx, cy - top * 0.42, 4.0, t, seed, 0.9 * amt, C)
	_pour(c, cx + 5.0, cy - top * 0.35, cy - float(_ri(1.4 + (0.3 + 0.7 * p) * 3.0)), t, seed, amt, C)
	_heap(c, cx + 5.0, cy + 1.0, 0.3 + 0.7 * p, C)


# =====================================================================================================================
# FLEETING: a quickening: speed-streaks whipping round what it makes, a stutter of after-images, burning out quick.

## Speed-streaks whipping round an oval (whips).
func _whips(c: CanvasItem, cx: float, cy: float, rx: float, ry: float, t: float, seed: int, n: int, fade: float, dir := 1.0, C = null) -> void:
	var CC: PackedColorArray = RAMP["fleeting"] if C == null else C
	for i in n:
		var head := dir * t * T_WHIP * (0.85 + 0.3 * _h(i, seed, 1)) + (float(i) / n) * TAU + _h(i, seed, 2)
		var len := 0.8 + _h(i, seed, 3) * 0.7
		var sc := 1.0 + (_h(i, seed, 4) - 0.5) * 0.3
		var steps := _ri(len * maxf(rx, ry) * sc * 1.4)
		for k in steps + 1:
			var q := float(k) / steps
			var a := head - dir * len * (1.0 - q)
			var x := cx + cos(a) * rx * sc
			var y := cy + sin(a) * ry * sc
			if not _grain(steps - k, i, (0.15 + 0.85 * q) * fade, seed + i):
				continue
			_dot(c, x, y, CC[5] if q > 0.9 else (CC[3] if q > 0.72 else (CC[2] if q > 0.35 else CC[1])))
			if q > 0.6:
				_dot(c, x, y + 1.0, CC[2] if q > 0.85 else CC[1])


## A tick of light popping: a star of uneven spikes, its core white-hot, `k` how far through its little life (tick).
func _tick(c: CanvasItem, x: float, y: float, k: float, seed: int, C: PackedColorArray) -> void:
	var r := 2.0 + k * 9.6 if k < 0.25 else 4.4 * (1.0 - (k - 0.25) / 0.75) + 0.6
	var n := 5
	for i in n:
		var a := (float(i) / n) * TAU + _h(i, seed, 1) * 0.7
		var Lk := r * (1.0 if i % 2 == 0 else 0.55) * (0.75 + 0.25 * _h(i, seed, 2))
		for s in range(1, _ri(Lk) + 1):
			_dot(c, x + cos(a) * s, y + sin(a) * s * 0.8, C[2] if s > Lk * 0.6 else (C[4] if k < 0.5 else C[3]))
	_dot(c, x, y, C[5] if k < 0.5 else C[4])
	if k < 0.35:
		_dot(c, x + 1.0, y, C[4])
		_dot(c, x, y - 1.0, C[4])


## Quick ticks: little stars of light popping on a thing one after another, a spark thrown off each (ticks).
func _ticks(c: CanvasItem, cx: float, cy: float, w: float, h: float, t: float, seed: int, n: int, C: PackedColorArray, from := -1e9) -> void:
	var beat := int(floorf(t / T_FLARE))
	for i in n:
		var b := beat - i
		# (only the stars of this poison: none from before it began)
		if b * T_FLARE < from - T_FLARE:
			continue
		var k := (t - b * T_FLARE) / (T_FLARE * n)
		if k < 0.0 or k >= 1.0:
			continue
		var x := float(_ri(cx + (_h(b, 3, seed) - 0.5) * w))
		var y := float(_ri(cy - _h(b, 4, seed) * h))
		_tick(c, x, y, k, seed + b, C)
		var ax := (_h(b, 5, seed) - 0.5) * 2.0
		var sx := x + ax * 12.0 * k
		var sy := y - 9.0 * k
		if k > 0.15:
			_streak(c, x + ax * 12.0 * (k - 0.15), y - 9.0 * (k - 0.15), sx, sy, PackedColorArray([C[2], C[3], C[5]]), 1)


## Fleeting on a patch of ground: quick tongues licking up round its edge, sparks shooting up (fleetingPatch).
func _fleeting_patch(c: CanvasItem, cx: float, cy: float, r: float, t: float, seed: int, fade: float, floor: bool, tall := 1.0) -> void:
	var C: PackedColorArray = RAMP["fleeting"]
	var rx := r * RX
	var ry := r * RY
	var n := _ri(rx * 1.4)
	for i in n:
		var a := (float(i) / n) * TAU + (_h(i, seed, 1) - 0.5) * 0.25
		# (the far half behind the figures, on the floor; the near half before them)
		if (sin(a) > 0.0) == floor:
			continue
		var d := 0.86 + 0.14 * _h(i, seed, 2)
		_licks(c, cx + cos(a) * rx * d, cy + sin(a) * ry * d, t, seed + i, fade, tall)
	if floor:
		return
	for i in _ri(16.0 * tall):
		var cyc := t * 3.6 + _h(i, seed, 1)
		var ph := fmod(cyc, 1.0)
		var gen := int(floorf(cyc))
		if ph > 0.7:
			continue
		var a := _h(i, seed + gen, 2) * TAU
		var d := sqrt(_h(i, seed + gen, 3)) * 0.85
		var slant := (_h(i, seed + gen, 4) - 0.5) * 6.0
		var x := cx + cos(a) * rx * d + slant * ph
		var y := cy + sin(a) * ry * d - 2.0 - ph * 20.0
		_streak(c, x - slant * 0.3, y + 6.0, x, y, PackedColorArray([C[1], C[2], C[2], C[3], C[5]]), 2, (1.0 - ph / 0.7) * fade)


## One quick tongue of flame on an edge, flickering with the quick clock (licks).
func _licks(c: CanvasItem, x: float, y: float, t: float, seed: int, fade: float, tall := 1.0) -> void:
	var C: PackedColorArray = RAMP["fleeting"]
	var h := _ri((-1.0 + 9.0 * _vn(seed * 0.7, t * 18.0, seed)) * tall)
	if h < 3:
		return
	var lean := (_vn(seed * 1.3, t * 14.0, seed + 1) - 0.5) * 5.0
	for s in h:
		var q := float(s) / h
		var px := x + lean * q * q
		if not _grain(s, 3, fade, seed):
			continue
		var wide := q < 0.45
		_dot(c, px, y - s, C[5] if s == h - 1 and h > 5 else (C[3] if q > 0.7 else C[2]))
		if wide:
			_dot(c, px + 1.0, y - s, C[1] if q < 0.2 else C[2])


## Fleeting on his whirlwind: each blade's leading edge traced twice behind it, streaks whipping round (fleetingSpin).
func _fleeting_spin(c: CanvasItem, hx: float, hy: float, r: float, clk: float, seed: int, amt := 1.0) -> void:
	var C: PackedColorArray = RAMP["fleeting"]
	var lead0 := clk * TAU * 2.6
	for half in [0.0, PI]:
		var hv: float = half
		for e in range(1, 3):
			var at := lead0 + hv - e * 0.7
			var u := 0.0
			while u < 1.0:
				var a := at - u * 0.9
				var wx := hx + cos(a) * r
				var wy := hy + sin(a) * r
				var px := _sx(wx, wy)
				var py := _sy(wx, wy, 10.0)
				if _grain(u * 83.0, e + (2 if hv != 0.0 else 0), (1.0 - u) * (1.0 if e == 1 else 0.65) * amt, seed + e):
					_dot(c, px, py, C[5] if u < 0.12 else (C[3] if u < 0.3 else C[2]))
					if u < 0.55:
						_dot(c, px, py + 1.0, C[2] if u < 0.25 else C[1])
				u += 0.012
	var cx := _sx(hx, hy)
	var cy := _sy(hx, hy, 10.0)
	_whips(c, cx, cy, r * RX * 1.08, r * RY * 1.08, clk * 1.6, seed, 8, amt)
	_whips(c, cx, cy + 4.0, r * RX * 0.72, r * RY * 0.72, clk * 1.3 + 0.4, seed + 5, 5, 0.9 * amt)


# =====================================================================================================================
# VAST: wider, a ring of dust rolled out at its edge; behind, a splash of earth from each hit to those near.

## Where an area's edge was before Vast widened it: broken cracks in the floor along it (oldEdge).
func _old_edge(c: CanvasItem, cx: float, cy: float, r0: float, fade: float, seed: int, back: bool, spread := 1.0) -> void:
	var n := _ri(r0 * RX * 6.5)
	var from := [_h(1, seed, 21) * TAU, _h(2, seed, 21) * TAU, _h(3, seed, 21) * TAU]
	for i in n:
		var a := (float(i) / n) * TAU
		if (sin(a) < 0.0) != back:
			continue
		if _vn(i * 0.09, 1.0, seed) < 0.48:
			continue
		if spread < 1.0:
			var off := INF
			for f in from:
				off = minf(off, absf(fmod(a - float(f) + TAU * 1.5, TAU) - PI))
			if off > spread * (PI / 3.0 + 0.2):
				continue
		var j := (_vn(i * 0.6, 3.0, seed + 1) - 0.5) * 3.0
		var x := cx + cos(a) * (r0 * RX + j)
		var y := cy + sin(a) * (r0 * RY + j * 0.5)
		if not _grain(i, 4, fade, seed):
			continue
		_dot(c, x, y, EARTH[0])
		if _h(i, seed, 5) < 0.5:
			_dot(c, x, y - 1.0, EARTH[3])
		if _h(i, seed, 6) < 0.06:
			var sx := cos(a) * (1.0 if _h(i, seed, 7) < 0.5 else -1.0)
			for s in range(1, 4):
				_dot(c, x + sx * s, y + sin(a) * s * 0.5 + (1.0 if s == 2 else 0.0), EARTH[0])


## Vast in front: a ring of dust rolled out to an area's new edge, `age` seconds in, by its beats (dustRing).
func _dust_ring(c: CanvasItem, cx: float, cy: float, r0: float, r: float, age: float, fade: float, seed: int, t: float, back: bool, z := 0.0, dust := 1.0) -> void:
	var B: Dictionary = BEAT["vast:front"]
	var C: PackedColorArray = RAMP["vast"]
	var build: float = B["build"]
	var crack := _c01(age / build)
	var k := 0.0 if age < build else _strike_out((age - build) / T_RING)
	var rr := r0 + (r - r0) * k
	if z == 0.0 and r0 > 0.3:
		_old_edge(c, cx, cy, r0, minf(1.0, fade * 1.4), seed, back, crack)
	if age < build:
		# (held: dust puffing up off the cracks as they run)
		_bank(c, cx, cy, r0, 0.0, crack * 0.75 * fade, seed, t, back, z, dust * (0.5 + 0.3 * crack), crack)
		return
	# the strike: smeared, the bank's path from the old edge out to where it is now streaked with its dust
	var smear := _c01(1.0 - (age - build) / float(B["hit"]))
	if smear > 0.0 and rr - r0 > 0.05:
		var n := maxi(16, _ri(rr * 16.0))
		for i in n:
			var a := (float(i) / n) * TAU + _h(i, seed, 31) * 0.3
			if (sin(a) < 0.0) != back:
				continue
			if not _grain(i, 5, smear * 0.9, seed + 31):
				continue
			var d0 := r0 + (rr - r0) * (0.25 + 0.3 * _h(i, seed, 32))
			_streak(c, cx + cos(a) * d0 * RX, cy + sin(a) * d0 * RY - 1.0 - z, cx + cos(a) * rr * RX * 0.97, cy + sin(a) * rr * RY * 0.97 - 1.0 - z, PackedColorArray([DUST[2], DUST[3], C[3], C[4]]), 2, smear)
	_bank(c, cx, cy, rr, k, fade, seed, t, back, z, dust, 1.0)


## The bank of dust at an area's edge: churned dust rolling at its front, a broken edge of lit dust, grit and clods (bank).
func _bank(c: CanvasItem, cx: float, cy: float, rr: float, k: float, fade: float, seed: int, t: float, back: bool, z: float, dust: float, front: float) -> void:
	var C: PackedColorArray = RAMP["vast"]
	var puffs := maxi(10, _ri(rr * 10.0))
	var mc := PackedColorArray([DUST[1], DUST[2], DUST[3], C[3], C[4]])
	for i in puffs:
		var a := (float(i) / puffs) * TAU + _h(i, seed, 1) * 0.25
		if (sin(a) < 0.0) != back:
			continue
		var big := 0.7 + _h(i, seed, 2) * 0.6
		# (settling: lower and flatter as its run ends)
		_mist(c, cx + cos(a) * rr * RX * 0.94, cy + sin(a) * rr * RY * 0.94 - 2.0 - z + k * 1.0, (4.0 + rr * 1.5) * big * dust * (1.0 + 0.15 * k), (2.0 + rr * 0.7) * big * dust * (1.0 - 0.2 * k), mc, (1.05 - 0.35 * k) * fade, seed + i, t, 0.35)
	if front <= 0.0:
		return
	# its front: a broken edge of lit dust, streaks of it shoved outward
	var n := maxi(30, _ri(rr * RX * 7.0))
	var sc := PackedColorArray([C[2], C[3], C[4]])
	for i in n:
		var a := (float(i) / n) * TAU
		if (sin(a) < 0.0) != back:
			continue
		var v := _vn(i * 0.15, t * 3.0, seed + 4)
		if v < 0.3:
			continue
		var x := cx + cos(a) * rr * RX
		var y := cy + sin(a) * rr * RY - z
		if not _grain(i, 6, fade * front, seed + 5):
			continue
		_dot(c, x, y, C[5] if v > 0.6 else C[4])
		_dot(c, x - cos(a), y - sin(a) * 0.5, C[3])
		if v > 0.72 and k < 0.85:
			_streak(c, x, y, x + cos(a) * 5.0, y + sin(a) * 2.5, sc, 1, fade)
	# grit and clods flung on past it, falling back
	var gc := PackedColorArray([EARTH[1], EARTH[2], EARTH[4]])
	for i in 20:
		var a := _h(i, seed, 6) * TAU
		if (sin(a) < 0.0) != back:
			continue
		var d := rr + 0.1 + _h(i, seed, 7) * 0.35 * (0.4 + k)
		var up := sin(_c01(k * 1.2 + _h(i, seed, 8) * 0.2) * PI) * (3.0 + _h(i, seed, 9) * 6.0)
		var x := cx + cos(a) * d * RX
		var y := cy + sin(a) * d * RY - up - z
		if not _grain(i, 7, fade * front, seed + 6):
			continue
		if i % 4 == 0:
			_clod(c, x, y, EARTH, i % 8 == 0)
		else:
			_streak(c, x - cos(a) * 4.0, y - sin(a) * 2.0 + 1.0, x, y, gc, 1)


## Vast behind: a quarter of a hit splashed onto those near it, by its beats (splash).
func _splash(c: CanvasItem, a: Dictionary, floor: bool) -> void:
	var B: Dictionary = BEAT["vast:behind"]
	var C: PackedColorArray = RAMP["vast"]
	var build: float = B["build"]
	var hit: float = B["hit"]
	var at: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var heave := _c01(at / build)
	var k := 0.0 if at < build else _strike_out((at - build) / T_SPLASH)
	var fly := _c01((at - build) / hit)
	var fade := _c01((float(a["dur"]) - at) / T_SPLASHFADE)
	var R := float(a["r"]) * k
	var back := floor
	if at < build:
		# held: the floor heaves under it, a mound of earth bulging up, cracks running out short from it
		if back:
			for i in 6:
				var an := (float(i) / 6.0) * TAU + _h(i, seed, 41) * 0.6
				var Lk := (3.0 + _h(i, seed, 42) * 5.0) * heave
				var s2 := 2
				while s2 < 2.0 + Lk:
					_dot(c, cx + cos(an) * s2 * 1.6 + (_h(i, s2, seed) - 0.5), cy + sin(an) * s2 * 0.8, EARTH[0])
					s2 += 1
		else:
			var hh := _ri(1.0 + heave * 2.0)
			for row in hh:
				var half := _ri((6.0 - row * 2.0) * (0.6 + 0.4 * heave))
				for dx in range(-half, half + 1):
					_dot(c, cx + dx, cy + 2.0 - row, ((C[5] if dx < 0 else C[4]) if row == hh - 1 else (EARTH[4] if dx < -half / 2.0 else EARTH[2])))
	# the ring of earth-coloured force heaving out from it (its dust lower, so the near ones stand clear in it)
	if at >= build:
		_bank(c, cx, cy, maxf(0.2, R), minf(1.0, k * 1.1), fade * (1.0 - 0.35 * k), seed, at, back, 0.0, 0.75, 1.0)
	# its front: a ridge of earth heaved up off the floor as it runs out, lit along its crest, clods popping up off it
	if R > 0.2:
		var n := maxi(30, _ri(R * RX * 7.0))
		for i in n:
			var an := (float(i) / n) * TAU
			if (sin(an) < 0.0) != back:
				continue
			var v := _vn(i * 0.22, 2.0, seed + 9)
			if v < 0.22:
				continue
			var x := cx + cos(an) * R * RX
			var y := cy + sin(an) * R * RY
			if not _grain(i, 8, fade * (1.0 - 0.3 * k) + 0.1, seed + 2):
				continue
			var up := 3 if v > 0.55 else 2
			_dot(c, x, y, EARTH[1])
			_dot(c, x, y - 1.0, EARTH[3])
			if up > 2:
				_dot(c, x, y - 2.0, EARTH[4])
			_dot(c, x, y - up, C[5] if v > 0.7 else C[4])
		for i in 12:
			var an := _h(i, seed, 11) * TAU
			if (sin(an) < 0.0) != back:
				continue
			var pop := sin(_c01(k * 1.3 - _h(i, seed, 12) * 0.3) * PI) * (3.0 + _h(i, seed, 13) * 5.0)
			_clod(c, cx + cos(an) * R * RX * 1.04, cy + sin(an) * R * RY * 1.04 - 2.0 - pop, EARTH, i % 3 == 0)
	var to: Array = a["to"]
	if floor:
		# the floor cracked out from where it was struck, and burst up along the way to each one near (as its rock flies)
		for j in to.size():
			var o: Dictionary = to[j]
			var tx := _sx(o["x"], o["y"])
			var ty := _sy(o["x"], o["y"])
			var Lk := sqrt((tx - cx) * (tx - cx) + (ty - cy) * (ty - cy))
			var s2 := 4.0
			while s2 < Lk * fly:
				var q := s2 / Lk
				var k0 := int(floorf(s2 / 5.0))
				var f := (s2 - k0 * 5) / 5.0
				var off0 := 0.0 if k0 <= 0 else (_h(k0, j, seed + 71) - 0.5) * 6.0
				var off1 := 0.0 if k0 + 1 <= 0 else (_h(k0 + 1, j, seed + 71) - 0.5) * 6.0
				var wob := off0 + (off1 - off0) * f
				if _h(k0, j, seed + 72) < 0.12:
					s2 += 1.0
					continue
				var x := cx + (tx - cx) * q - ((ty - cy) / Lk) * wob
				var y := cy + (ty - cy) * q + ((tx - cx) / Lk) * wob * 0.5
				if not _grain(s2, j + 20, fade, seed + j):
					s2 += 1.0
					continue
				_dot(c, x, y, EARTH[0])
				# the heave running along it: earth up at its head
				var head := Lk * fly - s2
				if head < 5.0 and fly < 1.0:
					_dot(c, x, y - 1.0, EARTH[3])
					_dot(c, x, y - 2.0, C[4])
				elif _h(_ri(s2), j, seed) < 0.3:
					_dot(c, x, y - 1.0, EARTH[2])
				s2 += 1.0
		return
	# a rock thrown to each one near (held: torn up out of the floor; the strike: arcing on a trail of lit dust); a burst of
	# dirt as it lands
	for j in to.size():
		var o: Dictionary = to[j]
		var tx := _sx(o["x"], o["y"])
		var ty := _sy(o["x"], o["y"], minf(10.0, float(o["top"]) * 0.35))
		if at < build:
			# (torn up out of the floor at its foot, rising)
			_rock(c, _arc_x(cx, tx, 0.04), _arc_y(cy, ty, 0.04) + 3.0 - heave * 3.0, true)
			continue
		if fly < 1.0:
			# its arc: a trail of lit dust behind it, smeared, crumbs shed off it, the rock at its head
			var tail := 0.55
			var q := maxf(0.0, fly - tail)
			while q < fly:
				var px := _arc_x(cx, tx, q)
				var py := _arc_y(cy, ty, q)
				var k2 := (q - (fly - tail)) / tail
				if _grain(_ri((fly - q) * 200.0), j + 30, (0.45 + 0.55 * k2) * fade, seed + j):
					_dot(c, px, py - 1.0, C[5] if k2 > 0.6 else C[4])
					_dot(c, px, py, C[5] if k2 > 0.75 else (C[4] if k2 > 0.4 else EARTH[4]))
					if k2 > 0.25:
						_dot(c, px, py + 1.0, C[4] if k2 > 0.7 else EARTH[3])
					if k2 > 0.55:
						_dot(c, px, py + 2.0, EARTH[2])
					if _h(_ri(q * 200.0), j, seed) < 0.15:
						_dot(c, px, py + 3.0 + (1.0 - k2) * 6.0, EARTH[4])
				q += 0.012
			_rock(c, _arc_x(cx, tx, fly), _arc_y(cy, ty, fly), true)
			if fly > 0.2:
				_rock(c, _arc_x(cx, tx, fly - 0.16) - 1.0, _arc_y(cy, ty, fly - 0.16) + 2.0, false)
			continue
		var since_ := at - build - hit
		var kk := _c01(since_ / 0.35)
		# it bursts on it: a fountain of dirt thrown up and out round it, lit, a puff of dust, clods falling back
		if kk < 0.55:
			var fc := PackedColorArray([EARTH[2], EARTH[4], C[4], C[5]])
			for i in 9:
				var an := -PI / 2.0 + ((i / 8.0) - 0.5) * 2.6 + (_h(i, seed + j, 6) - 0.5) * 0.3
				var L0 := 2.0 + kk * 9.0
				var L1 := L0 + (6.0 + _h(i, seed + j, 7) * 5.0) * (1.0 - kk / 0.55)
				_streak(c, tx + cos(an) * L0, ty + 2.0 + sin(an) * L0 * 0.8, tx + cos(an) * L1, ty + 2.0 + sin(an) * L1 * 0.8, fc, 2 if i % 2 else 1, fade)
		_mist(c, tx, ty + 3.0, 5.0 + kk * 5.0, 2.5 + kk * 2.0, PackedColorArray([DUST[1], DUST[2], DUST[3], C[4]]), 0.9 * fade * (1.0 - kk), seed + j, at, 0.8)
		for i in 9:
			var an := _h(i, seed + j, 3) * TAU
			var d := 2.0 + kk * 14.0 * (0.6 + 0.4 * _h(i, seed + j, 4))
			var up := sin(kk * PI) * (4.0 + _h(i, seed + j, 5) * 5.0)
			if kk >= 1.0 and not _grain(i, j + 40, fade, seed):
				continue
			_clod(c, tx + cos(an) * d, ty + 2.0 + sin(an) * d * 0.5 - up, EARTH, i == 0)


## (the arc a splash's rock flies along, from where it was struck to one near: splash `arc`)
static func _arc_x(cx: float, tx: float, q: float) -> float:
	return cx + (tx - cx) * q


static func _arc_y(cy: float, ty: float, q: float) -> float:
	return cy - 3.0 + (ty - cy + 3.0) * q - sin(q * PI) * 13.0


## Vast on a monster: its warning drawn wider, its old reach a broken ring of pink, pink dust shoved out, gold barbs (wideWarn).
func _wide_warn(c: CanvasItem, cx: float, cy: float, r0: float, r: float, t: float, seed: int, fade: float, back: bool) -> void:
	var E := ENEMY
	# its old reach: runs of bright pink, broken
	var n0 := _ri(r0 * RX * 6.5)
	for i in n0:
		var a := (float(i) / n0) * TAU
		if (sin(a) < 0.0) != back:
			continue
		if _vn(i * 0.12, 1.0, seed) < 0.42:
			continue
		var x := cx + cos(a) * r0 * RX
		var y := cy + sin(a) * r0 * RY
		if not _dith(x, y, fade, seed):
			continue
		_dot(c, x, y, E[4])
		_dot(c, x, y + 1.0, E[2])
	# the band, churning outward
	var puffs := maxi(12, _ri(r * 11.0))
	for i in puffs:
		var a := (float(i) / puffs) * TAU + _h(i, seed, 1) * 0.3
		if (sin(a) < 0.0) != back:
			continue
		var roll := fmod(t * 0.9 + _h(i, seed, 2), 1.0)
		var rr := r0 + (r - r0) * (0.2 + 0.7 * roll)
		_mist(c, cx + cos(a) * rr * RX, cy + sin(a) * rr * RY - 1.0, 3.0 + (r - r0) * 9.0, 1.6 + (r - r0) * 3.5, ENEMY_DUST, 1.15 * fade * sin(roll * PI), seed + i, t, 0.25)
	# streaks of it shoved outward across the band, from the old reach to the new
	var shoves := maxi(12, _ri(r * 10.0))
	var sc := PackedColorArray([E[2], E[3], E[4], E[5]])
	for i in shoves:
		var a := (float(i) / shoves) * TAU + _h(i, seed, 5) * 0.35
		if (sin(a) < 0.0) != back:
			continue
		var ph := fmod(t * 1.6 + _h(i, seed, 6), 1.0)
		var d0 := r0 + (r - r0) * ph * 0.8
		var d1 := d0 + (r - r0) * 0.45
		_streak(c, cx + cos(a) * d0 * RX, cy + sin(a) * d0 * RY, cx + cos(a) * d1 * RX, cy + sin(a) * d1 * RY, sc, 2, fade * sin(ph * PI) * 1.2)
	# its front: gold grit; barbs pointing out, beating
	var n := _ri(r * RX * 6.5)
	for i in n:
		var a := (float(i) / n) * TAU
		if (sin(a) < 0.0) != back:
			continue
		var v := _vn(i * 0.25, t * 2.5, seed + 3)
		if v < 0.35:
			continue
		var x := cx + cos(a) * r * RX
		var y := cy + sin(a) * r * RY
		if not _dith(x, y, fade, seed + 4):
			continue
		_dot(c, x, y, E[5] if v > 0.62 else E[4])
	var barbs := maxi(8, _ri(r * 6.0))
	var beat := 0.5 + 0.5 * sin(t * 7.0)
	for i in barbs:
		var a := (float(i) / barbs) * TAU + 0.2
		if (sin(a) < 0.0) != back:
			continue
		var ux := cos(a)
		var uy := sin(a)
		var tipx := cx + ux * (r * RX + 3.0 + beat * 2.0)
		var tipy := cy + uy * (r * RY + 1.5 + beat)
		for side in [-1.0, 1.0]:
			var bx: float = tipx - ux * 5.0 - uy * side * 4.0
			var by: float = tipy - uy * 2.5 + ux * side * 2.0
			_streak(c, bx, by, tipx, tipy, sc, 2, fade)
		_dot(c, tipx, tipy, E[5])
		_dot(c, tipx - ux, tipy - uy * 0.5, E[5])


# =====================================================================================================================
# What the rules say each of his moves carries, and what is going on (render/words10.ts: its hooks).

## Lasting or Fleeting on move `i` (the rules' `last`: more than 1, Lasting; less, Fleeting), or "".
func time_word(i) -> String:
	var skills: Array = view.get("hero", {}).get("skills", [])
	if i == null or int(i) < 0 or int(i) >= skills.size():
		return ""
	var last := float(skills[int(i)].get("last", 1.0))
	return "lasting" if last > 1.001 else ("fleeting" if last < 0.999 else "")


func _last_of(i: int) -> float:
	var skills: Array = view["hero"]["skills"]
	return float(skills[i].get("last", 1.0)) if i >= 0 and i < skills.size() else 1.0


## How far into the time Lasting gave it a thing is (lastStretch).
static func _last_stretch(t: float, lf: float, last: float) -> float:
	var own := lf / maxf(1.0, last)
	return 0.0 if lf - own < 0.05 else _c01((t - own) / (lf - own))


static func _zone_seed(x: float, y: float) -> int:
	return int(floorf(absf(x * 97.0 + y * 131.0))) % 100000


## What Lasting or Fleeting holds of his now: each patch a move of his left, and his spin (heldThings).
func held_things() -> Array:
	var out: Array = []
	if view.is_empty():
		return out
	for z: Dictionary in view["zones"]:
		var kind: String = z["kind"]
		if z.get("hostile", false) or int(z.get("skill", -1)) < 0 or kind == "warn" or kind == "mirror" or kind == "reaper":
			continue
		var w := time_word(int(z["skill"]))
		if w != "":
			out.append({"key": "zone:" + str(z["key"]), "word": w, "kind": "patch", "x": z["x"], "y": z["y"], "up": 0.0, "rad": 0.0, "r": z["r"], "t": z["t"], "life": z["dur"], "last": _last_of(int(z["skill"])), "seed": _zone_seed(z["x"], z["y"])})
	var H: Dictionary = view["hero"]
	var ch = H.get("channel")
	if ch != null:
		var i := int(ch["skill"])
		var s: Dictionary = H["skills"][i]
		if s.get("kind", "") == "whirl":
			var w := time_word(i)
			if w != "":
				out.append({"key": "spin", "word": w, "kind": "spin", "x": H["x"], "y": H["y"], "up": 10.0, "rad": 0.0, "r": float(s["radius"]) * float(s.get("size", 1.0)), "t": ch["t"], "life": float(s.get("channel", 2.4)) * _last_of(i), "last": _last_of(i), "seed": 77})
	return out


## The boost on him that a move with Lasting or Fleeting gave him (boosts): {word, left}, or {}.
func boosts() -> Dictionary:
	var H: Dictionary = view["hero"]
	var best := {}
	var by = H.get("boostBy")
	if by != null:
		for q in [["might", "mightT"], ["haste", "hasteT"], ["frenzy", "frenzyT"], ["shield", "shieldT"]]:
			var i = by.get(q[0])
			var left := float(H.get(q[1], 0.0))
			if i == null or not (left > 0.0):
				continue
			var w := time_word(int(i))
			if w != "" and (best.is_empty() or left > float(best["left"])):
				best = {"word": w, "left": left}
		return best
	var skills: Array = H["skills"]
	for i in skills.size():
		var w := time_word(i)
		if w == "":
			continue
		var r: Dictionary = skills[i]
		var left := maxf(maxf(float(H["mightT"]) if float(r.get("might", 0.0)) > 0.0 else 0.0, float(H["hasteT"]) if float(r.get("haste", 0.0)) > 0.0 else 0.0), maxf(float(H["frenzyT"]) if r.get("frenzy", false) else 0.0, float(H["shieldT"]) if float(r.get("shield", 0.0)) > 0.0 else 0.0))
		if left > 0.0 and (best.is_empty() or left > float(best["left"])):
			best = {"word": w, "left": left}
	return best


## A monster carrying `w` near him (nearCarrier), or null.
func _near_carrier(w: String):
	var H: Dictionary = view["hero"]
	var best = null
	var bd := 4.5
	for m: Dictionary in view["monsters"]:
		if m["dead"] or not (m.get("words", []) as Array).has(w):
			continue
		var dx: float = float(m["x"]) - float(H["x"])
		var dy: float = float(m["y"]) - float(H["y"])
		var d := sqrt(dx * dx + dy * dy)
		if d < bd:
			bd = d
			best = m
	return best


## What he left on a monster, its word by the move that last struck it (dotsOn): [{m, word, left}].
func dots_on() -> Array:
	var out: Array = []
	for m: Dictionary in view["monsters"]:
		if m["dead"]:
			continue
		var left := maxf(float(m.get("poisonT", 0.0)), float(m.get("burnT", 0.0)))
		if left <= 0.0:
			continue
		var w := time_word(int(m.get("lastSkill", -1)))
		if w != "":
			out.append({"m": m, "word": w, "left": left})
	return out


## A monster's poison, burning or chill on him, lingering or ticking fast (onHim): {word, left}, or {}.
func on_him() -> Dictionary:
	var H: Dictionary = view["hero"]
	var pb := maxf(float(H.get("poisonT", 0.0)), float(H.get("burnT", 0.0)))
	var left := maxf(pb, float(H.get("chillT", 0.0)))
	if left <= 0.0:
		return {}
	var by = H.get("dotBy")
	if by != null:
		if by.get("word", "") == "lasting":
			return {"word": "lasting", "left": left}
		if by.get("word", "") == "fleeting" and pb > 0.0:
			return {"word": "fleeting", "left": pb}
		return {}
	if _near_carrier("lasting") != null:
		return {"word": "lasting", "left": left}
	if _near_carrier("fleeting") != null and pb > 0.0:
		return {"word": "fleeting", "left": pb}
	return {}


func _since_of(key: String) -> float:
	return clock - float(since.get(key, clock))


func _draw_held(c: CanvasItem, floor: bool) -> void:
	var t := clock
	for it: Dictionary in held_things():
		var word: String = it["word"]
		var B: Dictionary = BEAT[word + ":" + str(it["kind"])]
		var sx := _sx(it["x"], it["y"])
		var sy := _sy(it["x"], it["y"])
		if _off(sx, sy, it["r"]):
			continue
		var itt: float = it["t"]
		var lf: float = it["life"]
		var p := _last_stretch(itt, lf, it["last"]) if word == "lasting" else 0.0
		var in_a := _c01(itt / float(B["build"]))
		var end_a := _c01((lf - itt) / 0.35)
		if it["kind"] == "patch":
			# (Lasting's lies on the floor under the figures; Fleeting's tongues stand round its edge, behind them and before)
			if word == "lasting":
				if floor:
					_lasting_patch(c, sx, sy, it["r"], t, it["seed"], p, in_a * end_a)
			else:
				_fleeting_patch(c, sx, sy, it["r"], t, it["seed"], in_a, floor, _c01((lf - itt) / float(B["fade"])))
		else:
			if word == "lasting":
				_lasting_spin(c, it["x"], it["y"], it["r"], t, fx_clock, it["seed"], p, floor, itt)
			elif not floor:
				_fleeting_spin(c, it["x"], it["y"], it["r"], fx_clock, it["seed"], in_a)


func _draw_states(c: CanvasItem, floor: bool) -> void:
	var t := clock
	var H: Dictionary = view["hero"]
	var hx := _sx(H["x"], H["y"])
	var hy := _sy(H["x"], H["y"])
	# his boost, drawn out behind him (Lasting), or quickened on him (Fleeting: its after-images are `follow`'s)
	var b := boosts()
	if not b.is_empty() and not floor:
		var B: Dictionary = BEAT[str(b["word"]) + ":boost"]
		var age := _since_of("boost")
		if b["word"] == "lasting":
			var pts := _ribbon_pts()
			_ribbon(c, pts[0], pts[1], t, 31, _c01(age / float(B["build"])), 1.0 - _c01(float(b["left"]) / float(B["fade"])), RAMP["lasting"])
		else:
			_whips(c, hx, hy - 12.0, 11.0, 14.0, t, 43, 4, _c01(age / float(B["build"])) * _c01(float(b["left"]) / float(B["fade"])))
	# what he left on monsters, Lasting or Fleeting by the move that last struck each
	if not floor:
		for d: Dictionary in dots_on():
			var m: Dictionary = d["m"]
			var mx := _sx(m["x"], m["y"])
			var my := _sy(m["x"], m["y"])
			var id := int(m["id"])
			if d["word"] == "lasting":
				var amt := _c01(_since_of("dot:%d" % id) / float(BEAT["lasting:dot"]["build"])) * _c01(float(d["left"]) / 0.3)
				_lasting_on_it(c, mx, my, m["top"], t, id * 7 + 1, _c01(1.0 - float(d["left"]) / (POISON_TIME * (1.0 + float(LASTING["longer"])))), RAMP["lasting"], amt)
			else:
				_ticks(c, mx, my - 3.0, 12.0, float(m["top"]) - 6.0, t, id * 7 + 2, 4, RAMP["fleeting"], float(since.get("dot:%d" % id, -1e9)))
	# a monster's poison, burning or chill on him: lingering (Lasting) or ticking fast (Fleeting), in the enemy's colours
	var sick := on_him() if not floor else {}
	if not sick.is_empty():
		if sick["word"] == "lasting":
			var amt := _c01(_since_of("him") / float(BEAT["lasting:monster"]["build"])) * _c01(float(sick["left"]) / 0.3)
			_lasting_on_it(c, hx, hy, HERO_TOP, t, 51, _c01(1.0 - float(sick["left"]) / (POISON_TIME * (1.0 + float(LASTING["monster"])))), ENEMY, amt)
		else:
			_ticks(c, hx, hy - 3.0, 13.0, HERO_TOP - 6.0, t, 53, 5, ENEMY, float(since.get("him", -1e9)))
	# a monster's warning drawn wider (Vast on it): widening out from its old reach over its build, held, snapping out as it lands
	for z: Dictionary in view["zones"]:
		if z["kind"] != "warn" or not (z.get("words", []) as Array).has("vast"):
			continue
		var B: Dictionary = BEAT["vast:monster"]
		var half = z.get("half")
		var share := 0.5 if half != null and (half.get("words", []) as Array).has("vast") else 1.0
		var cx := _sx(z["x"], z["y"])
		var cy := _sy(z["x"], z["y"])
		var zr: float = z["r"]
		if _off(cx, cy, zr):
			continue
		var zt: float = z["t"]
		var r0 := zr / (1.0 + float(VAST["monster"]) * share)
		var r_now := r0 + (zr - r0) * _ease_out(zt / float(B["build"]))
		var fade := _c01(zt / 0.08) * _c01((float(z["dur"]) - zt) / float(B["fade"]))
		_wide_warn(c, cx, cy, r0, r_now, t + zt, _zone_seed(z["x"], z["y"]), fade, floor)


## His back, and his path behind it (screen), for the ribbon (ribbonPts): [xs, ys].
func _ribbon_pts() -> Array:
	var H: Dictionary = view["hero"]
	var hxw: float = H["x"]
	var hyw: float = H["y"]
	var xs := PackedFloat64Array([_sx(hxw, hyw)])
	var ys := PackedFloat64Array([_sy(hxw, hyw, 13.0)])
	if laid_trail != null:
		for p: Dictionary in laid_trail:
			ys.append(_sy(p["x"], p["y"], 13.0 - (xs.size() - 1) * 0.6))
			xs.append(_sx(p["x"], p["y"]))
		return [xs, ys]
	# (as much of his path as he walks in W10_TIME.ribbon: when he stops, it lies on along the way he came)
	var most := T_RIBBON * float(H.get("speed", 4.6))
	var len := 0.0
	var walked := 0.0
	var wx0 := hxw
	var wy0 := hyw
	var i := trail.size() - 1
	while i >= 0:
		var p: Dictionary = trail[i]
		var px: float = p["x"]
		var py: float = p["y"]
		walked += sqrt((px - wx0) * (px - wx0) + (py - wy0) * (py - wy0))
		wx0 = px
		wy0 = py
		if walked > most:
			break
		var spx := _sx(px, py)
		var spy := _sy(px, py, 13.0)
		var lx := xs[xs.size() - 1]
		var ly := ys[ys.size() - 1]
		var gap := sqrt((spx - lx) * (spx - lx) + (spy - ly) * (spy - ly))
		len += gap
		if gap >= 2.0:
			xs.append(spx)
			ys.append(spy)
		i -= 1
	# (where he has stood still, it hangs back from him the way he faces, sagging)
	if len < 30.0:
		var bx := xs[xs.size() - 1]
		var by := ys[ys.size() - 1]
		var back := -1.0 if float(H["fx"]) - float(H["fy"]) >= 0.0 else 1.0
		var more := _ri((30.0 - len) / 4.0)
		for k in range(1, more + 1):
			xs.append(bx + back * k * 4.0)
			ys.append(by + k * 1.4 + k * k * 0.08)
	return [xs, ys]


## Under the figures (floorW10).
func draw_floor(c: CanvasItem) -> void:
	_paint(c, true)


## Over the figures, over the dark (airW10).
func draw_air(c: CanvasItem) -> void:
	_paint(c, false)


## Whether what lies at (sx, sy) on the screen, `r` tiles round, is wholly off it, by a margin (what is off the screen is not
## painted: nothing of it would be seen). Never while the check lays its dots.
func _off(sx: float, sy: float, r: float) -> bool:
	if fx == null or _rec != null or view.is_empty():
		return false
	var H: Dictionary = view["hero"]
	var hx := _sx(H["x"], H["y"])
	var hy := _sy(H["x"], H["y"])
	return absf(sx - hx) > 280.0 + r * RX or absf(sy - hy) > 200.0 + r * RY


## (the dots of each layer as last painted, and when: each look moves at 30 a second through its beats, W10_BEATS, and is
## painted afresh 30 times a second, or at once when a moment begins; between, the same dots are drawn again)
var _pts := PackedVector2Array()
var _cols := PackedColorArray()
var _kept := [null, null]
var _kept_at := [-1.0, -1.0]
var _kept_n := [-1, -1]
const REPAINT := 1.0 / 30.0


func _paint(c: CanvasItem, floor: bool) -> void:
	if view.is_empty():
		return
	var k := 0 if floor else 1
	if _rec == null and _kept[k] != null and clock >= float(_kept_at[k]) and clock < float(_kept_at[k]) + REPAINT - 1e-6 and int(_kept_n[k]) == _next:
		if not (_kept[k][0] as PackedVector2Array).is_empty():
			c.draw_multiline_colors(_kept[k][0], _kept[k][1], 2.0)
		return
	var t0 := Time.get_ticks_usec() if fx != null and fx.timing else 0
	_pts = PackedVector2Array()
	_cols = PackedColorArray()
	_draw_held(c, floor)
	_draw_states(c, floor)
	for a: Dictionary in acts:
		if not _off(_sx(a["x"], a["y"]), _sy(a["x"], a["y"]), float(a["r"]) + 2.0):
			_draw_act(c, a, floor)
	if _rec != null:
		return
	if t0 > 0:
		cost_paint += Time.get_ticks_usec() - t0
	_kept[k] = [_pts, _cols]
	_kept_at[k] = clock
	_kept_n[k] = _next
	if not _pts.is_empty():
		c.draw_multiline_colors(_pts, _cols, 2.0)


func _draw_act(c: CanvasItem, a: Dictionary, floor: bool) -> void:
	if a["kind"] == "splash":
		_splash(c, a, floor)
		return
	if a["kind"] == "after":
		_draw_after(c, a, floor)
		return
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var fade := _c01((float(a["dur"]) - float(a["t"])) / T_RINGFADE)
	_dust_ring(c, cx, cy, a["r0"], a["r"], a["t"], fade, a["seed"], a["t"], floor, a["z"])


## What a held look leaves as its thing goes, settling over its fade: Lasting's sand blowing away, Fleeting's last sparks
## (drawAfter).
func _draw_after(c: CanvasItem, a: Dictionary, floor: bool) -> void:
	var out := _c01(float(a["t"]) / float(a["dur"]))
	var keep := 1.0 - out
	var sx := _sx(a["x"], a["y"])
	var sy := _sy(a["x"], a["y"])
	var Lc: PackedColorArray = ENEMY if a["enemy"] else RAMP["lasting"]
	var seed: int = a["seed"]
	var ar: float = a["r"]
	var ap: float = a["p"]
	match str(a["what"]):
		"heap":
			# (r0: its place off the thing's foot, in pixels: under a thing 0, at a monster's or his feet 5)
			if floor:
				return
			var r0: float = a["r0"]
			_heap(c, sx + r0, sy + (1.0 if r0 != 0.0 else 0.0), ap, Lc, keep, seed)
			_blown_sand(c, sx + r0, sy + (1.0 if r0 != 0.0 else 0.0), ap, out, seed, Lc)
		"dunes":
			if floor:
				_dunes(c, sx, sy, ar, clock, seed, ap, keep)
			else:
				for i in 6:
					var an := _h(i, seed, 61) * TAU
					_blown_sand(c, sx + cos(an) * ar * RX * 0.9, sy + sin(an) * ar * RY * 0.9, 0.6, out, seed + i, Lc, 4)
		"drift":
			if floor:
				_drift(c, a["x"], a["y"], ar, maxf(0.3, ap), seed, keep)
			else:
				# the sand that hung in the blades' trails falls to the floor as the spin stops
				var C: PackedColorArray = RAMP["lasting"]
				for half in [0.0, PI]:
					for i in 26:
						var u := _h(i, seed, 62) * 0.9
						var k := _c01((float(a["t"]) - _h(i, seed, 63) * 0.1) / (0.3 + u * 0.15))
						if k >= 1.0:
							continue
						var an: float = float(a["lead"]) + half - (1.75 + u * 2.4)
						var wx: float = float(a["x"]) + cos(an) * ar
						var wy: float = float(a["y"]) + sin(an) * ar
						_dot(c, _sx(wx, wy), _sy(wx, wy, 10.0 * (1.0 - k * k)) + u * u * 7.0 * (1.0 - k), C[4] if k < 0.5 else C[3])
		"sparks":
			# Fleeting's last: a flick of lilac sparks flung off it as it goes, quick, burning out
			if floor:
				return
			var C: PackedColorArray = RAMP["fleeting"]
			var sc := PackedColorArray([C[1], C[2], C[3], C[5]])
			var n := maxi(8, _ri(ar * 8.0)) if ar > 0.0 else 8
			for i in n:
				var an := (float(i) / n) * TAU + _h(i, seed, 64) * 0.6
				var k := _strike_out(out)
				var x0: float
				var y0: float
				var dx: float
				var dy: float
				if ar > 0.0:
					x0 = sx + cos(an) * ar * RX
					y0 = sy + sin(an) * ar * RY - float(a["z"])
					dx = cos(an) * 4.0
					dy = -10.0 - _h(i, seed, 65) * 8.0
				else:
					x0 = sx + cos(an) * ap
					y0 = sy - float(a["z"]) + sin(an) * ap * 0.6
					dx = cos(an) * 14.0
					dy = sin(an) * 9.0 - 3.0
				_streak(c, x0 + dx * k * 0.55, y0 + dy * k * 0.55, x0 + dx * k, y0 + dy * k, sc, 1, keep * 1.2)


# =====================================================================================================================
# The clock (tickW10), and what the rules said happened (eventsW10).

## A moment begins (playW10).
func play(word: String, kind: String, o: Dictionary) -> Dictionary:
	var r := float(o.get("r", 1.0))
	var a := {
		"id": _next, "word": word, "kind": kind, "t": float(o.get("t", 0.0)),
		"dur": float(o.get("dur", life("vast:front") if kind == "ring" else (life("vast:behind") if kind == "splash" else 1.0))),
		"seed": int(o.get("seed", randi() % 1000000)), "x": float(o.get("x", 0.0)), "y": float(o.get("y", 0.0)), "r": r,
		"r0": float(o.get("r0", r / (1.0 + float(VAST["wider"])))), "z": float(o.get("z", 0.0)), "to": o.get("to", []),
		"what": str(o.get("what", "")), "p": float(o.get("p", 0.0)), "whirl": bool(o.get("whirl", false)),
		"enemy": bool(o.get("enemy", false)), "lead": float(o.get("lead", 0.0)),
	}
	_next += 1
	acts.append(a)
	return a


## A frame: the rules' state read, the looks' clock moved on, and what each held look leaves as its thing goes.
func update(dt: float) -> void:
	var t0 := Time.get_ticks_usec() if fx != null and fx.timing else 0
	read()
	fx_clock = fx.clock if fx != null else fx_clock
	_lifted = fx != null and bool(fx.get("_lifted"))
	if not view.is_empty():
		tick(dt)
	if t0 > 0:
		cost_update += Time.get_ticks_usec() - t0


## (what reading the rules, ticking and painting these looks have cost, microseconds, while fx.gd is `timing`: the check's)
var cost_update := 0
var cost_paint := 0


## tickW10.
func tick(dt: float) -> void:
	clock += dt
	for i in range(acts.size() - 1, -1, -1):
		var a: Dictionary = acts[i]
		a["t"] += dt
		if a["t"] >= a["dur"]:
			acts.remove_at(i)
	var H: Dictionary = view["hero"]
	var hxw: float = H["x"]
	var hyw: float = H["y"]
	var lastp = trail.back() if not trail.is_empty() else null
	if lastp == null or sqrt((hxw - float(lastp["x"])) * (hxw - float(lastp["x"])) + (hyw - float(lastp["y"])) * (hyw - float(lastp["y"]))) > 0.04:
		trail.append({"x": hxw, "y": hyw, "at": clock})
	# (his path kept as far back as the ribbon could want it)
	var kept := 0.0
	for i in range(trail.size() - 1, 0, -1):
		var ddx: float = float(trail[i]["x"]) - float(trail[i - 1]["x"])
		var ddy: float = float(trail[i]["y"]) - float(trail[i - 1]["y"])
		kept += sqrt(ddx * ddx + ddy * ddy)
		if kept > 12.0:
			trail = trail.slice(i)
			break
	# the held looks: what each leaves as its thing goes (its fade), and when each state began (its build)
	var now := {}
	for it: Dictionary in held_things():
		var p := _last_stretch(it["t"], it["life"], it["last"]) if it["word"] == "lasting" else 0.0
		now[it["key"]] = {"word": it["word"], "kind": it["kind"], "x": it["x"], "y": it["y"], "up": it["up"], "rad": it["rad"], "r": it["r"], "t": it["t"], "p": p, "seed": it["seed"]}
	var lead := fx_clock * TAU * 2.6
	for key in held:
		var was: Dictionary = held[key]
		if now.has(key) or float(was["t"]) < 0.15:
			continue
		var dur := float(BEAT[str(was["word"]) + ":" + str(was["kind"])]["fade"])
		if was["word"] == "lasting":
			if was["kind"] == "patch" and float(was["p"]) > 0.05:
				play("lasting", "after", {"what": "dunes", "x": was["x"], "y": was["y"], "r": was["r"], "p": was["p"], "dur": dur, "seed": was["seed"]})
			elif was["kind"] == "spin":
				play("lasting", "after", {"what": "drift", "x": was["x"], "y": was["y"], "r": was["r"], "p": was["p"], "lead": lead, "dur": dur, "seed": was["seed"]})
		else:
			play("fleeting", "after", {"what": "sparks", "x": was["x"], "y": was["y"], "r": 0.0 if was["kind"] == "thing" else was["r"], "p": float(was["rad"]) + 2.0, "z": was["up"], "dur": dur, "seed": was["seed"]})
	held = now
	# (a boost on him; his poison on each monster; a monster's on him: when each began, and what Lasting's leaves as it ends)
	var states := {}
	var b := boosts()
	if not b.is_empty():
		states["boost"] = {"word": b["word"], "x": hxw, "y": hyw, "p": 0.0, "enemy": false}
	for d: Dictionary in dots_on():
		var m: Dictionary = d["m"]
		states["dot:%d" % int(m["id"])] = {"word": d["word"], "x": m["x"], "y": m["y"], "p": 0.3 + 0.7 * _c01(1.0 - float(d["left"]) / (POISON_TIME * (1.0 + float(LASTING["longer"])))), "enemy": false}
	var sick := on_him()
	if not sick.is_empty():
		states["him"] = {"word": sick["word"], "x": hxw, "y": hyw, "p": 0.3 + 0.7 * _c01(1.0 - float(sick["left"]) / (POISON_TIME * (1.0 + float(LASTING["monster"])))), "enemy": true}
	for key in states:
		if not since.has(key):
			since[key] = clock
	for key in since.keys():
		if states.has(key):
			continue
		var was = last_states.get(key)
		if was != null and was["word"] == "lasting" and key != "boost":
			play("lasting", "after", {"what": "heap", "x": was["x"], "y": was["y"], "p": was["p"], "r0": 5.0, "enemy": was["enemy"], "dur": float(BEAT["lasting:monster" if was["enemy"] else "lasting:dot"]["fade"]), "seed": str(key).length() * 31 + _ri(float(was["x"]) * 7.0)})
		since.erase(key)
	last_states = states
	_warns = 0
	for z: Dictionary in view["zones"]:
		if z["kind"] == "warn" and (z.get("words", []) as Array).has("vast"):
			_warns += 1


## What the rules said happened (eventsW10): an area of his landing wider (Vast in front: `burst`, `zone`); a hit splashed
## (Vast behind: `vastSplash`).
func event(e: Dictionary) -> void:
	if view.is_empty():
		read()
		if view.is_empty():
			return
	match str(e.get("t", "")):
		"burst":
			if not e.has("x") or not e.has("y"):
				return
			# VAST in front: an area of his landing wider, its dust rolled out to its new edge (a whirlwind's turns come three or
			# four a second: a ring at a time, a new one as the last is winding down)
			var words: Array = e.get("words", []) if e.get("words") != null else []
			if words.has("vast") and float(e.get("r", 0.0)) > 0.3:
				var whirl: bool = e.get("style", "") == "whirl"
				if whirl:
					for a: Dictionary in acts:
						if a["kind"] == "ring" and a["whirl"] and float(a["t"]) < 0.45:
							return
				var r := float(e.get("r", 1.0))
				play("vast", "ring", {"x": e["x"], "y": e["y"], "r": r, "r0": float(e.get("r0", r / (1.0 + float(VAST["wider"])))), "whirl": whirl})
		"vastSplash":
			if e.has("x") and e.has("y"):
				play_splash(e["x"], e["y"], float(e.get("r", VAST["splashR"])), e.get("ids"))
		"zone":
			if not e.has("x") or not e.has("y") or fx == null or fx.wakes == null or not is_instance_valid(fx.wakes):
				return
			# a patch of his laid wider by Vast in front: its dust rolled out to its edge as it is laid
			var h = fx.hero()
			for z: Dictionary in fx.wakes.list:
				if absf(float(z["x"]) - float(e["x"])) < 1e-6 and absf(float(z["y"]) - float(e["y"])) < 1e-6:
					var i := int(z.get("skill", -1))
					if i >= 0 and h != null and h.loadout.fronts(i).has("vast"):
						play("vast", "ring", {"x": z["x"], "y": z["y"], "r": z["r"], "r0": float(z["r"]) / float(h.loadout.r(i)["wide"])})
					return


## Vast behind: a splash from (x, y) to each one near it (playSplash): those the rules name (`ids`), or those within its reach.
func play_splash(x: float, y: float, r: float, ids = null) -> Dictionary:
	var to: Array = []
	var list: Array = fx.monsters.list if fx != null and fx.monsters != null and is_instance_valid(fx.monsters) else []
	for m in list:
		if not is_instance_valid(m) or m.dead:
			continue
		var d: float = sqrt((m.world.x - x) * (m.world.x - x) + (m.world.y - y) * (m.world.y - y))
		if (ids.has(m.id) if ids != null else (d > 0.3 and d <= r + m.r)):
			to.append({"x": m.world.x, "y": m.world.y, "top": _top_of(m)})
	return play("vast", "splash", {"x": x, "y": y, "r": r, "to": to})


## How tall a monster stands, game pixels (topOf: art/bestiary.ts FIGURE_SIZE).
static func _top_of(m) -> float:
	var size = L.FIGURE_SIZE.get(m.art.name if m.art != null else m.kind, L.FIGURE_SIZE.get(m.kind))
	return float(size["top"]) if size != null else 22.0


## THE RULES' STATE, READ (what render/words10.ts reads off the game's Game, from hero.gd, words.gd, wakes.gd, monster.gd and
## perils.gd): `view`.
func read() -> void:
	var h = fx.hero() if fx != null else null
	if h == null:
		view = {}
		return
	var skills: Array = []
	for i in 3:
		var r: Dictionary = h.loadout.r(i)
		var def: Dictionary = Words.skill(Words.moves()[i])
		skills.append({"id": r["id"], "kind": def["kind"], "radius": float(def.get("radius", 0.0)), "channel": float(def.get("channel", 2.4)),
			"last": r["last"], "pace": r["pace"], "size": r["size"], "wide": r["wide"], "might": r["might"], "haste": r["haste"], "frenzy": r["frenzy"], "shield": r["shield"]})
	var ch: Dictionary = h.channel() if h.has_method("channel") else {}
	var by = h.get("boost_by")
	var dot = h.get("dot_by")
	var hero := {
		"x": h.world.x, "y": h.world.y, "fx": h.face.x, "fy": h.face.y,
		"speed": Hero.SPEED * (1.0 + float(h.stats.get("move_speed", 0.0)) / 100.0),
		"skills": skills, "channel": ch if not ch.is_empty() else null,
		"mightT": h.might_t, "hasteT": h.haste_t, "frenzyT": h.frenzy_t, "shieldT": h.shield_t,
		"boostBy": by if by != null and not by.is_empty() else (null if by == null else {}),
		"poisonT": h.poison_t, "burnT": h.burn_t, "chillT": h.chill_t,
		"dotBy": dot if dot != null and not dot.is_empty() else null,
	}
	var zones: Array = []
	if fx.wakes != null and is_instance_valid(fx.wakes):
		for z: Dictionary in fx.wakes.list:
			zones.append({"key": "%s:%s:%s" % [z["kind"], z["x"], z["y"]], "x": z["x"], "y": z["y"], "r": z["r"], "t": z["t"], "dur": z["dur"], "kind": z["kind"], "skill": int(z.get("skill", -1))})
	var perils = fx.monsters.get("perils") if fx.monsters != null and is_instance_valid(fx.monsters) else null
	if perils != null and is_instance_valid(perils):
		for p: Dictionary in perils.list:
			if p.get("kind", "") != "warn":
				continue
			var pby: Dictionary = p.get("by", {})
			var words: Array = pby.get("words", [])
			if not words.has("vast"):
				continue
			zones.append({"kind": "warn", "x": p["x"], "y": p["y"], "r": p["r"], "t": p["t"], "dur": p["dur"], "hostile": true, "words": words, "half": pby.get("half", {})})
	var monsters: Array = []
	for m in fx._near:
		if not is_instance_valid(m) or m.dead:
			continue
		var dotted: bool = m.poison_t > 0.0 or m.burn_t > 0.0
		var carries: bool = (m.words.has("lasting") or m.words.has("fleeting")) and m.world.distance_to(h.world) < 4.6
		if dotted or carries:
			monsters.append({"id": m.id, "x": m.world.x, "y": m.world.y, "r": m.r, "dead": false, "top": _top_of(m), "words": m.words,
				"poisonT": m.poison_t, "burnT": m.burn_t, "lastSkill": m.last_skill})
	view = {"hero": hero, "zones": zones, "monsters": monsters}


# =====================================================================================================================
# Light, and his after-images.

## Where these light the dark (lightsW10).
func lights() -> void:
	if view.is_empty() or fx == null or fx.look == null or not is_instance_valid(fx.look):
		return
	for it: Dictionary in held_things():
		fx.look.spot(Vector2(_sx(it["x"], it["y"]), _sy(it["x"], it["y"], it["up"])), 18.0 + float(it["r"]) * 16.0 if it["kind"] == "patch" else 44.0, 0.4 if it["word"] == "lasting" else 0.5)
	if not boosts().is_empty():
		var H: Dictionary = view["hero"]
		fx.look.spot(Vector2(_sx(H["x"], H["y"]), _sy(H["x"], H["y"], 12.0)), 26.0, 0.45)
	# (its moments: the dust of a ring or a splash lit as it goes; what a held look leaves, dimly)
	for a: Dictionary in acts:
		var fade := _c01((float(a["dur"]) - float(a["t"])) / 0.4)
		var after: bool = a["kind"] == "after"
		fx.look.spot(Vector2(_sx(a["x"], a["y"]), _sy(a["x"], a["y"]) - 4.0), 16.0 + float(a["r"]) * 14.0 if after else 24.0 + float(a["r"]) * 22.0, (0.3 if after else 0.55) * fade)


func _tint_material() -> ShaderMaterial:
	if _tint_mat == null:
		_tint_mat = ShaderMaterial.new()
		_tint_mat.shader = Shader.new()
		_tint_mat.shader.code = TINT
	return _tint_mat


## Once he has moved this frame (fx.gd _late): his picture kept, and his after-images stood where they are now (heroW10): while
## Fleeting's boost is on him, a stutter of him in its lilac where he was a moment ago (standing, a step back from him); while
## his spin is quickened, a stutter of him round where he turns.
func follow() -> void:
	if fx == null or view.is_empty():
		_ghosts_shown(0)
		return
	var h = fx.hero()
	var sp = h.get("_sprite") if h != null else null
	if not (sp is Sprite2D) or sp.texture == null:
		_ghosts_shown(0)
		return
	var me := {"tex": sp.texture, "offset": sp.offset, "scale": sp.scale.x, "flip": sp.flip_h, "x": h.world.x, "y": h.world.y, "at": clock}
	seen.append(me)
	while seen.size() > 240 or (seen.size() > 1 and clock - float(seen[0]["at"]) > 0.4):
		seen.pop_front()
	var H: Dictionary = view["hero"]
	var sx := _sx(H["x"], H["y"])
	var sy := _sy(H["x"], H["y"])
	var C: PackedColorArray = RAMP["fleeting"]
	var shown := 0
	var ch = H.get("channel")
	var spin: bool = ch != null and H["skills"][int(ch["skill"])].get("kind", "") == "whirl" and time_word(int(ch["skill"])) == "fleeting"
	if spin:
		# (his spin quickened: a stutter of him round where he turns, each a turn of the blade behind)
		var in_a := _c01(float(ch["t"]) / float(BEAT["fleeting:spin"]["build"]))
		for e in range(1, 3):
			var a := fx_clock * TAU * 2.6 - e * 1.1
			_ghost(shown, me, _ri(sx + cos(a) * 5.0), _ri(sy + sin(a) * 2.5), e, C[2] if e == 1 else C[1], (0.62 - e * 0.16) * in_a)
			shown += 1
		_ghosts_shown(shown)
		return
	var b := boosts()
	if b.is_empty() or b["word"] != "fleeting":
		_ghosts_shown(0)
		return
	var B: Dictionary = BEAT["fleeting:boost"]
	var amt := _c01(_since_of("boost") / float(B["build"])) * _c01(float(b["left"]) / float(B["fade"]))
	for e in range(1, 4):
		var was = null
		for k in range(seen.size() - 1, -1, -1):
			if clock - float(seen[k]["at"]) >= e * T_STUTTER - 1e-6:
				was = seen[k]
				break
		var x := _sx(was["x"], was["y"]) if was != null else sx
		var y := _sy(was["x"], was["y"]) if was != null else sy
		var d := sqrt((x - sx) * (x - sx) + (y - sy) * (y - sy))
		if d < e * 2.0:
			# (standing: a step back from him, the way he faces, each further)
			var back := -1.0 if float(H["fx"]) - float(H["fy"]) >= 0.0 else 1.0
			x = sx + back * e * 5.0
			y = sy + e * 0.5
		elif d < e * 9.0:
			# (walking: where he was, but at least a step back along his way, each further)
			x = sx + ((x - sx) / d) * e * 9.0
			y = sy + ((y - sy) / d) * e * 9.0
		_ghost(shown, was if was != null else me, _ri(x), _ri(y), e, C[2] if e == 1 else C[1], amt * (0.9 - e * 0.2))
		shown += 1
	_ghosts_shown(shown)


## After-image `k`: his picture `pic`, its foot at (x, y) on the screen (game pixels), just behind him (`e` pixels), in `col`.
func _ghost(k: int, pic: Dictionary, x: int, y: int, e: int, col: Color, alpha: float) -> void:
	var stands = fx.monsters.get("stands") if fx.monsters != null and is_instance_valid(fx.monsters) else null
	if stands == null or not is_instance_valid(stands):
		return
	while _ghosts.size() <= k:
		var s := Sprite2D.new()
		s.centered = false
		s.material = _tint_material()
		stands.add_child(s)
		_ghosts.append(s)
	var s: Sprite2D = _ghosts[k]
	if not is_instance_valid(s):
		s = Sprite2D.new()
		s.centered = false
		s.material = _tint_material()
		stands.add_child(s)
		_ghosts[k] = s
	var H: Dictionary = view["hero"]
	var scale: float = pic["scale"]
	# (among what stands, just behind him: put in order by whole picture pixels)
	var back := (float(H["x"]) + float(H["y"])) * 16.0 - e
	s.texture = pic["tex"]
	s.flip_h = pic["flip"]
	s.scale = Vector2.ONE * scale
	s.position = Vector2(x * 2.0, back)
	s.offset = pic["offset"] + Vector2(0.0, (y * 2.0 - back) / scale)
	s.modulate = Color(col, alpha)
	s.visible = alpha > 0.0


func _ghosts_shown(n: int) -> void:
	for k in range(n, _ghosts.size()):
		if is_instance_valid(_ghosts[k]):
			_ghosts[k].visible = false
