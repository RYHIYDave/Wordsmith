## THE HIGH CITY'S SEVEN LAST WORDS AS THE FIGHT SHOWS THEM (render/words7.ts: the art chat's looks of Piercing, Bleeding, Reaping,
## Culling, Surging, Plundering and Mirroring, on in the game as it starts, WORDS7_LOOK, at his yes to their films, 9 Nov 2026:
## “Yes, hand all ten to main (Recommended)”). fx.gd hands on to this. Every look is the game's own painter PORTED LINE FOR LINE (its
## brushes, its noise, its order of dots), drawn from what the rules keep and the time since, and held against the game's own
## painter dot for dot (checks/looks7_check.gd). Each word's colours, beats and times are the game's, taken out of it by
## tools/godot_words7.ts into assets/words/looks7.json.
##   PIERCING: in front, a bolt of white light punching through each in its line, light blown out the far side of each, bursting
##     at its end (on stone, splashed back off it); behind, the line scratched in light, a spear of light slamming down onto it and
##     driven along it, tearing a crack that glows and cools; on a monster, its shot ghosting through a wall, the stone lit pink.
##   BLEEDING: in front, the wound torn open and the spurt; while anything bleeds, its wound, drips, and splashes where it walks,
##     drying; behind, briars bursting up out of the floor, cutting what walks in them; on a monster, a slash of the enemy's fire
##     across him and his blood flung off.
##   REAPING: in front, the kill's soul torn out and flying into him; behind, its spirit (the little grey Shade) rising in
##     soul-light, fighting, its claws raking, rising away; on a monster, the enemy's fire as it lurches up again.
##   CULLING: in front, an instant held, the scythe's crescent sweeping through; behind, the reaper's mark (a hooded blade)
##     written on the floor, a blade rising out of it through the one it takes; on a monster, the enemy's fire round it while he
##     is low, its blow bursting on him.
##   SURGING: a shockwave out round him (in front), where his dodge began with wind along his roll (behind), and a monster's,
##     its warning ring burned in first (on a monster).
##   PLUNDERING: coins sprayed up off the kill (in front), streaming into his purse (behind), torn off him on hooks of pink light,
##     glinting at its belt, bursting out of it as it dies (on a monster).
##   MIRRORING: his reflection beside him in glass making his cut (in front), the pane where he stood making his next again,
##     cracking and shattering (behind), shards of the enemy's glass flung back into him (on a monster).
## WHAT IT READS (`read`): his place, facing, life, bleeding (hero.gd bleed_t) and his dodge; the monsters near him (monster.gd
## bleed_t, stolen, words); the rules' zones of these words (last_words.gd zones), their spirits (last_words.gd spirits); the
## monsters' surges' warnings (perils.gd `warn`, their sound "surge_foe"); their shots that fly through walls (monsters.gd
## _arrows, `walls`).
## The pictures these looks make of pictures (his reflection in glass, the grey Shade, one cut down in two) are fx_words7's too:
## below, at the foot (`Pictures`).
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const Words := preload("res://scripts/words.gd")
const LastWords := preload("res://scripts/last_words.gd")
const FILE := "res://assets/words/looks7.json"

## Each word's colours, darkest to brightest (W7_RAMP); the enemy's (W7_ENEMY), its fire and blood (ENEMY_FIRE, ENEMY_BLOOD); the
## friend's cyan (W7_FRIEND); dust, dust in the dark, briars, the thorns' points, broken stone, the claws' gashes.
static var RAMP := {}
static var ENEMY := PackedColorArray()
static var ENEMY_FIRE := PackedColorArray()
static var ENEMY_BLOOD := PackedColorArray()
static var FRIEND := PackedColorArray()
static var DUST := PackedColorArray()
static var DUSK_DUST := PackedColorArray()
static var BRIAR := PackedColorArray()
static var THORN := Color("#e0b4a4")
static var STONE := PackedColorArray()
static var CLAW := PackedColorArray()
## Each look's beats (W7_BEATS), its times (W7_TIME); a world radius on the floor (RX, RY); a cut in glass's time (GLASS_CUT);
## when a cut body's halves come to rest (CUT_REST); the Shade's wind-up (defs.ts MONSTERS.shade.windup); the rules' numbers
## (defs.ts REAP, MIRRORING: words.json `last`).
static var BEAT := {}
static var TIME := {}
static var RX := 22.6
static var RY := 11.3
static var GLASS_CUT := 0.24
static var CUT_REST := 0.75
static var SHADE_WINDUP := 0.5
static var REAP := {}
static var MIRRORING := {}
## (W7_TIME's, read once)
static var T_PIERCE := 26.0
static var T_LANCE_WAIT := 0.5
static var T_LANCE_FALL := 0.06
static var T_LANCE_RUN := 0.16
static var T_CRACK := 1.9
static var T_GHOST := 11.0
static var T_THORNS_GROW := 0.22
static var T_THORNS_SINK := 0.5
static var T_SPLASH := 3.0
static var T_SOUL := 0.55
static var T_SPIRIT := 6.0
static var T_SPIRIT_BUILD := 0.45
static var T_SPIRIT_FADE := 0.6
static var T_RAKE_STRIKE := 0.06
static var T_RAKE_FADE := 0.26
static var T_RAKE_FOLLOW := 0.4
static var T_RISE := 0.8
static var T_CULL_HOLD := 0.16
static var T_CULL_SWEEP := 0.07
static var T_LOW := 0.35
static var T_SURGE := 0.42
static var T_WARN := 1.0
static var T_PURSE := 0.45
static var T_SHARDS := 0.28
static var T_REFLECTION := 0.63
static var T_MIRROR_BEAT := 0.12
static var T_PANE := 0.25
static var T_PANE_CLEAR := 0.75
static var T_CAST := 0.38
static var T_BREAKING := 0.3
static var T_SHATTER := 0.6

var fx
## THE RULES' STATE AS LAST READ (`read`), in the game's own names (render/words7.ts reads them off its Game):
##   hero: {x, y, fx, fy, heroBleedT, life, maxLife, move: {x0, y0, x1, y1} or null}
##   monsters: those that may show, {id, x, y, r, dead, top, fx, fy, words, bleedT, stolen, spirit}
##   zones: the rules' zones of these words {key, kind, x, y, r, t, dur}, and the monsters' surges' warnings {key, kind: "warn",
##          from, src, x, y, r, t, dur}
##   spirits: the rules' spirits {id, x, y, t, life, next}
var view := {}
## The looks' own clock (W7.clock), its moments at work (Act: {id, word, side, part, t, dur, seed, x, y, x1, y1, dx, dy, ids, pts,
## r, delay, width, stone, dieT, whole, rules}), and what it keeps (W7): the blood on the floor ({x, y, age, size, seed, ex, ey,
## hero}), who bleeds ({x, y, since} by id), who carries his gold (by id), how kindled each with Culling is, each mirror's rising
## (by its zone's key), his last swing, the sounds only the pictures know, the rules' spirits as last seen, risings waiting, the
## surges' warnings, shots in walls.
var clock := 0.0
var acts: Array = []
var _next := 1
var splashes: Array = []
var bleeders := {}
var carriers := {}
var hot := {}
var panes := {}
var swing = null
var sounds: Array = []
var spirit_was := {}
var rising: Array = []
var surge_warns := {}
var in_wall := {}
## (recording, for the check: every dot laid, by where, its colour; null when drawing)
var _rec = null


static func ready_up() -> void:
	if not RAMP.is_empty():
		return
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	for w in d["ramp"]:
		RAMP[w] = _colors(d["ramp"][w])
	ENEMY = _colors(d["enemy"])
	ENEMY_FIRE = _colors(d["enemyFire"])
	ENEMY_BLOOD = _colors(d["enemyBlood"])
	FRIEND = _colors(d["friend"])
	DUST = _colors(d["dust"])
	DUSK_DUST = _colors(d["duskDust"])
	BRIAR = _colors(d["briar"])
	THORN = Color(d["thorn"])
	STONE = _colors(d["stone"])
	CLAW = _colors(d["claw"])
	BEAT = d["beats"]
	TIME = d["time"]
	RX = float(d["rx"])
	RY = float(d["ry"])
	GLASS_CUT = float(d["glassCut"])
	CUT_REST = float(d["cutRest"])
	SHADE_WINDUP = float(d["shadeWindup"])
	REAP = Words.data()["last"]["reap"]
	MIRRORING = Words.data()["last"]["mirroring"]
	T_PIERCE = float(TIME["pierceSpeed"])
	T_LANCE_WAIT = float(TIME["lanceWait"])
	T_LANCE_FALL = float(TIME["lanceFall"])
	T_LANCE_RUN = float(TIME["lanceRun"])
	T_CRACK = float(TIME["crack"])
	T_GHOST = float(TIME["ghostSpeed"])
	T_THORNS_GROW = float(TIME["thornsGrow"])
	T_THORNS_SINK = float(TIME["thornsSink"])
	T_SPLASH = float(TIME["splash"])
	T_SOUL = float(TIME["soulFlight"])
	T_SPIRIT = float(TIME["spirit"])
	T_SPIRIT_BUILD = float(TIME["spiritBuild"])
	T_SPIRIT_FADE = float(TIME["spiritFade"])
	T_RAKE_STRIKE = float(TIME["rakeStrike"])
	T_RAKE_FADE = float(TIME["rakeFade"])
	T_RAKE_FOLLOW = float(TIME["rakeFollow"])
	T_RISE = float(TIME["rise"])
	T_CULL_HOLD = float(TIME["cullHold"])
	T_CULL_SWEEP = float(TIME["cullSweep"])
	T_LOW = float(TIME["low"])
	T_SURGE = float(TIME["surge"])
	T_WARN = float(TIME["warn"])
	T_PURSE = float(TIME["purse"])
	T_SHARDS = float(TIME["shards"])
	T_REFLECTION = float(TIME["reflection"])
	T_MIRROR_BEAT = float(TIME["mirrorBeat"])
	T_PANE = float(TIME["pane"])
	T_PANE_CLEAR = float(TIME["paneClear"])
	T_CAST = float(TIME["cast"])
	T_BREAKING = float(TIME["breaking"])
	T_SHATTER = float(TIME["shatter"])


static func _colors(list: Array) -> PackedColorArray:
	var out := PackedColorArray()
	for h in list:
		out.append(Color(h))
	return out


func _init() -> void:
	ready_up()


func clear() -> void:
	acts = []
	splashes = []
	bleeders = {}
	carriers = {}
	hot = {}
	panes = {}
	swing = null
	sounds = []
	spirit_was = {}
	rising = []
	surge_warns = {}
	in_wall = {}
	view = {}
	_kept = [null, null]
	_pics_clear()


func alive() -> bool:
	return not (acts.is_empty() and splashes.is_empty() and hot.is_empty()) or (not view.is_empty() and (not view["zones"].is_empty() or not view["spirits"].is_empty() or _states_on()))


## (anything the looks keep on those they touch: one bleeding, one carrying his gold)
func _states_on() -> bool:
	if float(view["hero"]["heroBleedT"]) > 0.0:
		return true
	for m: Dictionary in view["monsters"]:
		if not m["dead"] and (float(m["bleedT"]) > 0.0 or float(m["stolen"]) > 0.0):
			return true
	return false


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


## Math.hypot, in doubles (a Vector2 is single).
static func _hyp(a: float, b: float) -> float:
	return sqrt(a * a + b * b)


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _ease_out(q: float) -> float:
	return 1.0 - pow(1.0 - _c01(q), 3.0)


static func _smooth(q: float) -> float:
	var k := _c01(q)
	return k * k * (3.0 - 2.0 * k)


## Math.sign.
static func _sign(v: float) -> float:
	return 1.0 if v > 0.0 else (-1.0 if v < 0.0 else 0.0)


## Whether a pixel is in, for a see-through `a` (0..1): scattered as grain is (dith).
static func _dith(x: float, y: float, a: float, seed := 77) -> bool:
	var q := (int(floorf(x + 0.5)) * 374761393 + int(floorf(y + 0.5)) * 668265263 + seed * 2246822519) & 0xffffffff
	q = ((q ^ (q >> 13)) * 1274126177) & 0xffffffff
	return a > float(q ^ (q >> 16)) / 4294967296.0


## Smooth value noise, 0..1 (vnoise).
static func _vn(x: float, y: float, seed: int) -> float:
	var x0 := floorf(x)
	var y0 := floorf(y)
	var u := _smooth(x - x0)
	var v := _smooth(y - y0)
	var ix := int(x0)
	var iy := int(y0)
	var a := _h(ix, iy, seed)
	var b := _h(ix + 1, iy, seed)
	var c := _h(ix, iy + 1, seed)
	var d := _h(ix + 1, iy + 1, seed)
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v


## A point on a quadratic curve.
static func _quad(x0: float, y0: float, cx: float, cy: float, x1: float, y1: float, q: float) -> Array:
	var u := 1.0 - q
	return [u * u * x0 + 2.0 * u * q * cx + q * q * x1, u * u * y0 + 2.0 * u * q * cy + q * q * y1]


## Where a place on the floor is on the screen, game pixels, `z` up (S: wx, wy).
func _sx(x: float, y: float) -> float:
	return (x - y) * 16.0


func _sy(x: float, y: float, z := 0.0) -> float:
	return ((x + y) * 8.0 if fx == null or not _lifted else fx.gy(x, y)) - z


## (whether the place's floor lifts what stands on it anywhere: fx.gd's, as last read)
var _lifted := false


## One dot of the game's pixels where it rounds it to (dot: its fillRect).
## (Each dot is kept, as a run two picture pixels high, and the layer's dots drawn at once: `_paint`.)
func _dot(x: float, y: float, col: Color, w := 1, h := 1) -> void:
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


static func _pc(list: Array) -> PackedColorArray:
	return PackedColorArray(list)


# =====================================================================================================================
# The brushes: every look is painted with these, pixel by pixel, never a flat shape.

## A streak from its tail (x0, y0) to its head (x1, y1): `w` across at its head, one at its tail; its tones from the ramp's `from`
## at the tail to its brightest at the head, its edges a tone darker (streak).
func _streak(x0: float, y0: float, x1: float, y1: float, C: PackedColorArray, w := 1, from := 0.0, alpha := 1.0) -> void:
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
		if q < 0.25 and not _dith(px, py, q / 0.25 + 0.15):
			continue
		if alpha < 1.0 and not _dith(px, py, alpha):
			continue
		var ci := mini(cn - 1, int(floorf(from + q * (cn - from))))
		var half := _ri(((w - 1) / 2.0) * q)
		for k in range(-half, half + 1):
			var edge := half > 0 and absi(k) == half
			_dot(px + nx * k, py + ny * k, C[maxi(0, ci - (1 if edge else 0))])


## A blade's smear: swept along an ellipse (rx, ry) from angle `a0` (its tail) to `a1` (its head), `w` across at its head (smear).
func _smear(cx: float, cy: float, rx: float, ry: float, a0: float, a1: float, w: int, C: PackedColorArray, tilt := 0.0, fade := 1.0, sheen := false) -> void:
	var n := maxi(10, _ri(absf(a1 - a0) * maxf(rx, ry) * 1.6))
	for i in n + 1:
		var q := float(i) / n
		var an := a0 + (a1 - a0) * q
		var ox := cos(an)
		var oy := sin(an)
		var wq := maxi(1, _ri(1.0 + (w - 1) * pow(q, 0.8)))
		for j in wq:
			var px := cx + ox * (rx - j)
			var py := cy + oy * (ry - (j * ry) / rx) + ox * (rx - j) * tilt
			if q < 0.4 and not _dith(px, py, q / 0.4):
				continue
			if fade < 1.0 and not _dith(px, py, fade):
				continue
			var c: Color = ((C[5] if q > 0.75 else C[4]) if j == 0 else ((C[4] if q > 0.55 else C[3]) if j == 1 else (C[3] if j < wq - 1 else C[2])))
			if sheen and j > 0 and (i + j * 4) % 11 < 2:
				c = C[5]
			_dot(px, py, c)


## A sharp star of light: spikes of uneven length, never a disc (star).
func _star(x: float, y: float, r: float, C: PackedColorArray, seed: int, n := 6, rot := 0.0, flat := 0.75) -> void:
	for i in n:
		var a := rot + (i * TAU) / n + (_h(i, seed, 3) - 0.5) * 0.5
		var Ln := r * (1.0 if i % 2 == 0 else 0.5) * (0.7 + 0.3 * _h(i, seed, 4))
		_streak(x + cos(a) * Ln, y + sin(a) * Ln * flat, x, y, C, 2 if i % 2 == 0 else 1, float(maxi(0, C.size() - 4)))
	_dot(x - 1, y, C[C.size() - 1], 3, 1)
	_dot(x, y - 1, C[C.size() - 1], 1, 3)


## A little four-pointed glint (glint).
func _glint(x: float, y: float, r: int, c: Color, core := Color("#ffffff")) -> void:
	for k in range(1, r + 1):
		_dot(x - k, y, c)
		_dot(x + k, y, c)
		_dot(x, y - k, c)
		_dot(x, y + k, c)
	_dot(x, y, core)


## A tongue of fire licking up from (x, y): `h` tall, `w` wide at its root (flame).
func _flame(x: float, y: float, h: float, w: float, C: PackedColorArray, seed: int, t: float) -> void:
	var H := maxi(2, _ri(h))
	var cn := C.size()
	for r in H:
		var q := float(r) / H
		var sway := sin(q * 3.2 + t * 8.0 + seed * 7.0) * q * 2.4 + sin(t * 13.0 + seed + r * 0.7) * q * 0.8
		var half := (w / 2.0) * pow(1.0 - q, 0.55) * (0.8 + 0.4 * _vn(r * 0.5, t * 6.0, seed))
		if half < 0.35:
			continue
		var cx := x + sway
		var hc := int(ceilf(half))
		for dx in range(-hc, hc + 1):
			var d := absi(dx) / half
			if d > 1.0:
				continue
			if q > 0.45 and _vn((cx + dx) * 0.7, r * 0.5 - t * 12.0, seed + 9) < (q - 0.45) * 1.5:
				continue
			var heat := (1.0 - q) * 0.6 + (1.0 - d) * 0.6 - 0.15 + (_vn(dx * 0.6 + seed, r * 0.4 - t * 10.0, seed + 5) - 0.5) * 0.4
			_dot(cx + dx, y - r, C[maxi(0, mini(cn - 1, int(floorf(heat * cn))))])


## Mist, smoke or dust: a soft cloud of uneven billows, curling as it rises, thinning to scattered grains at its edge (mist).
func _mist(cx: float, cy: float, rx: float, ry: float, C: PackedColorArray, amount: float, seed: int, t: float, rise := 0.9) -> void:
	var cn := C.size()
	var ryc := int(ceilf(ry))
	var rxc := int(ceilf(rx))
	for dy in range(-ryc, ryc + 1):
		for dx in range(-rxc, rxc + 1):
			var e := (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry)
			if e > 1.0:
				continue
			var x := _ri(cx + dx)
			var y := _ri(cy + dy)
			var n := _vn(x * 0.16 + sin(y * 0.13 + t * 1.3) * 0.8, y * 0.2 + t * rise * 3.0, seed) * 0.7 + _vn(x * 0.45, y * 0.5 + t * rise * 5.0, seed + 3) * 0.3
			var v := pow(1.0 - e, 0.8) * amount * n * n * 2.2
			var cut := 0.32 + (_h(x, y, seed + 11) - 0.5) * 0.16
			if v < cut:
				continue
			_dot(x, y, C[maxi(0, mini(cn - 1, int(floorf(((v - 0.32) / 0.6) * cn))))])


## A splash of blood on the floor: a ragged pool, darker at its rim, a wet glint, flecks thrown on along (ex, ey) (splat).
func _splat(x: float, y: float, size: float, C: PackedColorArray, seed: int, ex := 1.0, ey := 0.0, wet := 1.0) -> void:
	var rx := size * 1.5
	var ry := size * 0.75
	var ryc := int(ceilf(ry))
	var rxc := int(ceilf(rx))
	for dy in range(-ryc, ryc + 1):
		for dx in range(-rxc, rxc + 1):
			var e := (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) + (_h(dx + 9, dy + 9, seed) - 0.5) * 0.7
			if e > 1.0:
				continue
			_dot(x + dx, y + dy, C[1] if e > 0.55 else C[2])
	if wet > 0.3:
		_dot(x - _ri(rx * 0.3), y - _ri(ry * 0.3), C[4])
	# flecks thrown on the way it was going
	for i in 3:
		var d := rx + 1.5 + i * 1.6 + _h(i, seed, 7) * 1.5
		var s := (_h(i, seed, 8) - 0.5) * 2.5
		if _h(i, seed, 9) < 0.25:
			continue
		_dot(x + ex * d - ey * s, y + ey * d * 0.5 + ex * s * 0.5, C[1 + (1 if i == 0 else 0)])


## A drop of blood in the air, drawn out along the way it falls, its top catching the light (drop).
func _drop(x: float, y: float, vx: float, vy: float, C: PackedColorArray, big := false) -> void:
	var sp := sqrt(vx * vx + vy * vy)
	if sp == 0.0:
		sp = 1.0
	var ux := vx / sp
	var uy := vy / sp
	var tail := 3 if big else 1
	for k in range(tail, 0, -1):
		_dot(x - ux * k, y - uy * k, C[1] if k == tail else C[2])
	_dot(x, y, C[3])
	if big:
		_dot(x + 1, y, C[3])
		_dot(x, y + 1, C[2])
		_dot(x + 1, y + 1, C[2])
	_dot(x, y - (0 if big else 1), C[4])


## A coin: a disc of metal, its rim dark, its face lit, seen as it turns (`spin`); `lying` flat on the floor (coin).
func _coin(x: float, y: float, spin: float, C: PackedColorArray, lying := false) -> void:
	x = _ri(x)
	y = _ri(y)
	if lying:
		_dot(x - 1, y - 1, C[4], 3, 1)
		_dot(x - 2, y, C[3])
		_dot(x - 1, y, C[5])
		_dot(x, y, C[4], 2, 1)
		_dot(x + 2, y, C[2])
		_dot(x - 1, y + 1, C[1], 3, 1)
		return
	var c := absf(cos(spin))
	var face := cos(spin) > 0.0
	if c < 0.3:
		_dot(x, y - 1, C[5])
		_dot(x, y, C[4])
		_dot(x, y + 1, C[2])
		return
	if c < 0.75:
		_dot(x - 1, y - 1, C[4], 2, 1)
		_dot(x - 1, y, C[5] if face else C[4])
		_dot(x, y, C[3])
		_dot(x - 1, y + 1, C[2], 2, 1)
		_dot(x - 2, y, C[3])
		_dot(x + 1, y, C[2])
		return
	_dot(x - 1, y - 1, C[4], 3, 1)
	_dot(x - 2, y, C[3])
	_dot(x - 1, y, C[5] if face else C[4])
	_dot(x, y, C[3])
	_dot(x + 1, y, C[4])
	_dot(x + 2, y, C[2])
	_dot(x - 1, y + 1, C[2], 3, 1)
	_dot(x - 1, y - 1, C[5])


## A sliver of glass, tumbling (sliver).
func _sliver(x: float, y: float, ang: float, len: float, C: PackedColorArray) -> void:
	var ux := cos(ang)
	var uy := sin(ang)
	var n := maxi(2, _ri(len))
	for k in n:
		var q := float(k) / n
		var px := x + ux * k
		var py := y + uy * k
		if q < 0.6:
			_dot(px - uy, py + ux, C[1])
			_dot(px + uy, py - ux, C[4])
		_dot(px, py, C[5] if q > 0.7 else C[3])


# =====================================================================================================================
# PIERCING

## The live monster an act is about (live), or null; by id among those as last read, dead or not (`any`).
func _mon(id, any := false) -> Variant:
	if id == null:
		return null
	for m: Dictionary in view["monsters"]:
		if int(m["id"]) == int(id) and (any or not m["dead"]):
			return m
	return null


func _live(a: Dictionary, i := 0) -> Variant:
	var ids: Array = a["ids"]
	return _mon(ids[i], false) if i < ids.size() else null


## In front: a bolt of white light punching through every one in a line; at each it goes through, light blows out the far side
## with sparks; at the line's end (or on stone) its head bursts (pierceFront).
func _pierce_front(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["piercing"]
	var z := 14.0
	var t: float = a["t"]
	var seed: int = a["seed"]
	var head := t * T_PIERCE
	var reach: float = a["r"]
	var ax: float = a["x"]
	var ay: float = a["y"]
	var adx: float = a["dx"]
	var ady: float = a["dy"]
	var front := minf(head, reach)
	var tail := maxf(0.0, head - 2.6)
	var over := head - reach
	var hx := _sx(ax + adx * front, ay + ady * front)
	var hy := _sy(ax + adx * front, ay + ady * front, z)
	var qx := _sx(ax + adx * (front - 1.0), ay + ady * (front - 1.0))
	var qy := _sy(ax + adx * (front - 1.0), ay + ady * (front - 1.0), z)
	var ul := sqrt((hx - qx) * (hx - qx) + (hy - qy) * (hy - qy))
	if ul == 0.0:
		ul = 1.0
	var ux := (hx - qx) / ul
	var uy := (hy - qy) / ul
	var nx := -uy
	var ny := ux
	if front > tail:
		# its body: drawn out behind its head and thinning to nothing, its edges flickering, a waver in its trail
		var Ln := _ri((front - tail) * ul)
		var tone := [C[1], C[2], C[3], C[4], C[5], C[5]]
		for i in Ln + 1:
			var q := float(i) / maxi(1, Ln)
			var back := Ln - i
			var wob := sin(i * 0.33 + t * 45.0) * 1.8 * pow(1.0 - q, 1.3) + (_vn(i * 0.4, t * 30.0, seed) - 0.5) * 2.2 * (1.0 - q)
			var cx := hx - ux * back + nx * wob
			var cy := hy - uy * back + ny * wob
			if q < 0.45 and not _dith(cx, cy, q / 0.45 + 0.05):
				continue
			var half := 0.3 + 2.3 * pow(q, 1.6) * (0.75 + 0.5 * _vn(i * 0.6, t * 40.0, seed + 1))
			# at the end of its line it is drawn in to a point, never a flat end
			if over > 0.0:
				half *= minf(1.0, (back + 0.5) / 6.0)
			var reach_k := int(ceilf(half)) + 1
			for k in range(-reach_k, reach_k + 1):
				var d := absi(k) / half
				if d > 1.0:
					# flickering at its edges: a pixel of light licking off it now and then
					if d < 1.9 and over <= 0.0 and _h(i * 7 + k, int(floorf(t * 60.0)), seed) < 0.14 * q:
						_dot(cx + nx * k, cy + ny * k, C[3])
					continue
				var v := q * 0.75 + (1.0 - d) * 0.55
				_dot(cx + nx * k, cy + ny * k, tone[mini(5, int(floorf(v * 5.0)))])
	if over <= 0.0:
		# its head: a blazing teardrop of white, rimmed with light, flickering tongues of it ahead (none of it past its end)
		var room := -over * ul
		var prof := [1.2, 1.9, 2.4, 2.6, 2.5, 2.1, 1.6, 1.0, 0.5]
		for j in prof.size():
			var w: float = prof[j]
			var along := j - 5
			if along > room:
				continue
			var wc := int(ceilf(w))
			for k in range(-wc, wc + 1):
				var d := absi(k) / w
				if d > 1.05:
					continue
				_dot(hx + ux * along + nx * k, hy + uy * along + ny * k, C[5] if d < 0.55 else (C[4] if d < 0.9 else C[3]))
		for j in 3:
			var sp := (j - 1) * 0.45 + (_h(j, int(floorf(t * 60.0)), seed) - 0.5) * 0.3
			var len := minf(2.0 + _h(j, int(floorf(t * 60.0)) + 1, seed) * 3.0, room - 4.0)
			if len < 1.0:
				continue
			var ex := ux * cos(sp) - uy * sin(sp)
			var ey := uy * cos(sp) + ux * sin(sp)
			_streak(hx + ex * (4.0 + len), hy + ey * (4.0 + len), hx + ex * 3.0, hy + ey * 3.0, _pc([C[3], C[4], C[5]]), 1)
	else:
		_pierce_end(hx, hy, ux, uy, over / T_PIERCE, a["stone"], seed)
	# each one it went through
	var endX := _sx(ax + adx * reach, ay + ady * reach)
	var endY := _sy(ax + adx * reach, ay + ady * reach, z)
	var ids: Array = a["ids"]
	var pts: Array = a["pts"]
	for i in ids.size():
		var s: float = float(pts[i]) if i < pts.size() else 0.0
		var since := (head - s) / T_PIERCE
		if since < 0.0 or since > 0.5:
			continue
		var m = _mon(ids[i], true)
		if m == null:
			continue
		# where it went in: a flare for an instant
		if since < 0.08:
			var ix := _sx(ax + adx * (s - 0.28), ay + ady * (s - 0.28))
			var iy := _sy(ax + adx * (s - 0.28), ay + ady * (s - 0.28), z)
			_dot(ix - 1, iy - 1, C[4], 3, 3)
			_dot(ix, iy, C[5])
		# out of the far side: light blown out in a fan of rays, ragged, fading as they lengthen
		var ex := _sx(ax + adx * (s + 0.3), ay + ady * (s + 0.3))
		var ey := _sy(ax + adx * (s + 0.3), ay + ady * (s + 0.3), z)
		if since < 0.32:
			var k := since / 0.32
			var grow := minf(1.0, since / 0.05)
			for j in 9:
				var sp := (j / 8.0 - 0.5) * 2.3 + (_h(j, seed + i, 4) - 0.5) * 0.3
				var ddx := ux * cos(sp) - uy * sin(sp)
				var ddy := uy * cos(sp) + ux * sin(sp)
				var len := (8.0 + _h(j, seed + i, 5) * 13.0) * (1.0 - absf(sp) * 0.3) * grow * (1.0 - k * 0.4)
				var from := 2.0 + k * 7.0
				if len > from + 1.0:
					_streak(ex + ddx * len, ey + ddy * len * 0.8, ex + ddx * from, ey + ddy * from * 0.8, _pc([C[1], C[2], C[3], C[4], C[5]]), 2 if j % 2 == 0 else 1, 0.0, 1.0 - k * 0.7)
			if since < 0.14:
				# the puncture itself: a blaze of white where it tears out, rimmed with steel
				for yy in range(-4, 5):
					for xx in range(-4, 5):
						var d := absi(xx) * 0.8 + absi(yy) + (_h(xx + 9, yy + 9, seed + i) - 0.5) * 1.2
						if d > 4.2:
							continue
						_dot(ex + xx, ey + yy, C[5] if d < 1.8 else (C[4] if d < 3.0 else C[3]))
		# sparks flung on out of it, arcing down, each leaving its streak
		for j in 12:
			var sp := (_h(j, seed + i, 1) - 0.5) * 2.2
			var v := 70.0 + _h(j, seed + i, 2) * 100.0
			var vx := (ux * cos(sp) - uy * sin(sp)) * v
			var vy := (uy * cos(sp) + ux * sin(sp)) * v * 0.7 - 30.0 * _h(j, seed + i, 3)
			var px := ex + vx * since
			var py := ey + vy * since + 160.0 * since * since
			var tx := px - vx * 0.03
			var ty := py - (vy + 320.0 * since) * 0.03
			if py > ey + 16.0:
				continue
			# (nor past the face of the stone its line ended on, across the screen: what falls, falls down its face)
			if a["stone"] and ((px - endX) * _sign(ux) if absf(ux) > 0.3 else (py - endY) * _sign(uy)) > -2.0:
				continue
			_streak(tx, ty, px, py, _pc([C[2], C[3], C[4], C[5]]), 1, 0.0, _c01(1.2 - since / 0.5))


## Its head bursting at the end of its line (`since` seconds after it got there): a white flare, motes of light flung on (back off
## the stone, with chips of it, when it struck stone) (pierceEnd).
func _pierce_end(x: float, y: float, ux: float, uy: float, since: float, stone: bool, seed: int) -> void:
	var C: PackedColorArray = RAMP["piercing"]
	if since > 0.42:
		return
	if since < 0.07:
		var r := 3.0 + 5.0 * (1.0 - since / 0.07)
		if not stone:
			_star(x, y, r, _pc([C[3], C[4], C[5], C[5]]), seed + 41, 8, 0.3)
		else:
			# on stone: splashed back off its face, a fan of rays, none into it
			for j in 7:
				var sp := (j / 6.0 - 0.5) * 2.8
				var dx := -(ux * cos(sp) - uy * sin(sp))
				var dy := -(uy * cos(sp) + ux * sin(sp))
				var Ln := r * (1.0 if j % 2 == 0 else 0.6)
				_streak(x + dx * Ln, y + dy * Ln * 0.8, x - ux, y - uy, _pc([C[3], C[4], C[5], C[5]]), 2 if j % 2 == 0 else 1)
	var way := -1.0 if stone else 1.0
	for i in 18:
		var life := 0.22 + _h(i, seed, 42) * 0.2
		if since > life:
			continue
		# fanned about the way it flew (thrown back off stone), a few all round (not into stone)
		var spread := (_h(i, seed, 43) - 0.5) * 2.6 if i < 13 or stone else _h(i, seed, 43) * TAU
		var dx := way * (ux * cos(spread) - uy * sin(spread))
		var dy := way * (uy * cos(spread) + ux * sin(spread))
		var v := 40.0 + _h(i, seed, 44) * 80.0
		var go := (v * (1.0 - exp(-since * 7.0))) / 7.0
		var px := x + dx * go
		var py := y + dy * go * 0.7 - 18.0 * since
		# (none past the face of stone, across the screen)
		if stone and ((px - x) * _sign(ux) if absf(ux) > 0.3 else (py - y) * _sign(uy)) > -2.0:
			continue
		var c: Color = C[5] if since < 0.1 else (C[4] if since < life * 0.7 else C[3])
		_dot(px, py, c)
		# the bigger motes: a glint of four points while they are fresh
		if i % 4 == 0 and since < life * 0.5:
			_dot(px - 1, py, C[3])
			_dot(px + 1, py, C[3])
			_dot(px, py - 1, C[3])
			_dot(px, py + 1, C[3])
	if not stone:
		return
	# chips of the stone it struck, knocked off and falling
	for i in 6:
		if since > 0.35:
			break
		var sp := (_h(i, seed, 45) - 0.5) * 2.2
		var dx := -(ux * cos(sp) - uy * sin(sp))
		var dy := -(uy * cos(sp) + ux * sin(sp))
		var v := 30.0 + _h(i, seed, 46) * 40.0
		var px := x + dx * v * since
		var py := y + dy * v * since * 0.6 - 25.0 * since + 220.0 * since * since
		# (down on the floor, 14 below the bolt, they are gone among its stones)
		if py > y + 13.0:
			continue
		_dot(px, py, STONE[3])
		if i % 2 == 0:
			_dot(px + 1, py, STONE[2])


## Behind: half a second after, a spear of light comes slamming down onto the line, its point driven along it, tearing a narrow
## crack of light in the floor; the crack left glowing, fading (pierceBehind).
func _pierce_behind(a: Dictionary, floor: bool) -> void:
	var C: PackedColorArray = RAMP["piercing"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var x0 := _sx(a["x"], a["y"])
	var y0 := _sy(a["x"], a["y"])
	var x1 := _sx(a["x1"], a["y1"])
	var y1 := _sy(a["x1"], a["y1"])
	var len := sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
	if len == 0.0:
		len = 1.0
	var ux := (x1 - x0) / len
	var uy := (y1 - y0) / len
	var delay: float = a["delay"]
	var strike := t - delay
	var fall := T_LANCE_FALL
	var run := T_LANCE_RUN
	var tip := _c01((strike - fall) / run) * len
	var ck := _crack_of(x0, y0, ux, uy, len, seed)
	var cxs: PackedFloat64Array = ck["x"]
	var cys: PackedFloat64Array = ck["y"]
	var css: PackedFloat64Array = ck["s"]
	var cfk: Array = ck["fork"]
	if floor:
		if strike < 0.0:
			# waiting: its light seeping along the crack it will come down on, quickening
			var k := _c01(t / maxf(0.01, delay))
			var lit := len * 1.05 * _smooth(k)
			for i in cxs.size():
				var s := css[i]
				if s > lit - (5.0 if cfk[i] else 0.0):
					continue
				var pulse := 0.5 + 0.5 * sin(t * (12.0 + 30.0 * k) - s * 0.3)
				var fresh := lit - s < 6.0
				_dot(cxs[i], cys[i], C[4] if fresh else (C[2] if cfk[i] else (C[3] if pulse > 0.55 else C[2])))
			return
		var dark := Color("#0c0a10")
		for i in cxs.size():
			var s := css[i]
			if s > tip:
				continue
			var age := (strike - fall - (s / len) * run) - (0.04 if cfk[i] else 0.0)
			if age < 0.0:
				continue
			var px := cxs[i]
			var py := cys[i]
			var glow := _c01(1.0 - age / 0.4)
			# white-hot where it has just torn, cooling to steel; then dark, the stone's own; then gone
			if age > 1.65:
				continue
			var c: Color = C[5] if glow > 0.6 else (C[4] if glow > 0.3 else (C[3] if glow > 0.0 else (dark if age < 1.35 else STONE[0])))
			_dot(px, py, c)
			# its lips: in shadow below, the broken stone's edge catching the light above here and there
			if not cfk[i] and age < 1.35:
				_dot(px, py + 1, C[2] if glow > 0.5 else dark)
				if _h(i, seed, 9) < 0.3:
					_dot(px, py - 1, C[3] if glow > 0.3 else STONE[2])
			# the stone lit either side while it is hot
			if glow > 0.2 and not cfk[i]:
				var wd := maxi(2, _ri(float(a["width"]) * 2.0))
				for off in range(-wd, wd + 1):
					if absi(off) < 2:
						continue
					var gx2 := px - uy * off
					var gy2 := py + ux * off * 0.5
					if _dith(gx2, gy2, glow * (0.7 / absi(off))):
						_dot(gx2, gy2, C[2])
		return
	# in the air
	if strike < 0.0:
		# high over the line's start, the spear gathering out of the dark
		var k := t / maxf(0.01, delay)
		if k > 0.5:
			var bx := x0 - ux * 30.0
			var by := y0 - 90.0
			_spear(bx, by, bx + ux * 22.0, by + 40.0, C, (k - 0.5) * 1.4, seed, t)
		return
	var out := strike - fall - run
	if out > 0.18:
		return
	# where its point is: falling onto the line's start, then driven along the line, then pulled up and gone
	var fk := _c01(strike / fall)
	var tx: float
	var ty: float
	if strike < fall:
		tx = x0 - ux * 18.0 * (1.0 - fk)
		ty = y0 - 64.0 * (1.0 - fk * fk)
	else:
		tx = x0 + ux * tip
		ty = y0 + uy * tip - (out * 120.0 if out > 0.0 else 0.0)
	# its shaft slants up and back from its point, the way it came in
	var bl := sqrt(ux * 0.55 * ux * 0.55 + 1.0)
	var bx := -ux * 0.55 / bl
	var by := -1.0 / bl
	var Ls := 60.0
	var alpha := _c01(1.0 - out / 0.18) if out > 0.0 else 1.0
	# speed lines behind it, the way it is driven (not as it goes)
	if out <= 0.0:
		for j in range(1, 5):
			var off := j * 5.0
			var sx0 := tx - ux * off + bx * (8.0 + j * 3.0)
			var sy0 := ty - uy * off + by * (8.0 + j * 3.0)
			_streak(sx0 + bx * (24.0 - j * 3.0), sy0 + by * (24.0 - j * 3.0), sx0, sy0, _pc([C[1], C[2], C[3]]), 1, 0.0, 0.75 - j * 0.12)
	_spear(tx + bx * Ls, ty + by * Ls, tx, ty, C, alpha, seed, t)
	if out > 0.0:
		# motes of its light, shed where it was, drifting up after it
		for i in 10:
			var q := 0.15 + 0.85 * _h(i, seed, 51)
			var mx := tx + bx * Ls * q + (_h(i, seed, 52) - 0.5) * 6.0
			var my := ty + by * Ls * q + out * 120.0 - out * (30.0 + _h(i, seed, 53) * 40.0)
			if out < 0.06 + 0.12 * _h(i, seed, 54):
				_dot(mx, my, C[5] if out < 0.08 else C[4])
	# where its point bites: a flare, sparks, stone chips and dust thrown up off the tear
	if strike >= fall and out < 0.05:
		_dot(tx - 2, ty - 1, C[4], 5, 2)
		_dot(tx - 1, ty - 2, C[5], 3, 2)
		for j in 5:
			var sp := -PI / 2.0 + (_h(j, int(floorf(t * 60.0)), seed) - 0.5) * 2.2
			var lenS := 4.0 + _h(j, int(floorf(t * 60.0)) + 3, seed) * 6.0
			_streak(tx + cos(sp) * lenS + ux * 2.0, ty + sin(sp) * lenS, tx, ty - 1.0, _pc([C[2], C[3], C[4], C[5]]), 1)
	# chips of the floor flung up out of the tear as it passes, tumbling, falling back; dust rising behind
	var N := 26
	var w2: float = a["width"]
	for i in N:
		var s := ((i + _h(i, seed, 31)) / N) * len
		if s > tip:
			continue
		var age := strike - fall - (s / len) * run
		if age < 0.0 or age > 0.5:
			continue
		var sd := 1.0 if _h(i, seed, 32) < 0.5 else -1.0
		var vs := (25.0 + _h(i, seed, 33) * 45.0) * maxf(0.6, minf(1.6, w2))
		var vx := ux * (20.0 + _h(i, seed, 34) * 40.0) - uy * sd * vs
		var vy := uy * 20.0 + ux * sd * vs * 0.45 - (55.0 + _h(i, seed, 35) * 75.0)
		var px := x0 + ux * s + vx * age
		var py := y0 + uy * s + vy * age + 300.0 * age * age
		if py > y0 + uy * s + 3.0:
			continue
		var sh := int(floorf(_h(i, seed, 36) * 4.0))
		# its trail, then the chip itself (each a broken bit of stone, lit along its top)
		_streak(px - vx * 0.025, py - (vy + 600.0 * age) * 0.025, px, py, _pc([STONE[0], STONE[1]]), 1, 0.0, 0.8)
		_dot(px, py, STONE[3])
		if sh >= 1:
			_dot(px + sd, py, STONE[2])
		if sh >= 2:
			_dot(px, py + 1, STONE[1])
		if sh == 3:
			_dot(px - sd, py + 1, STONE[0])
	for i in 6:
		var s := ((i + 0.5) / 6.0) * len
		if s > tip:
			continue
		var age := strike - fall - (s / len) * run
		if age < 0.02 or age > 0.6:
			continue
		_mist(x0 + ux * s, y0 + uy * s - 2.0 - age * 14.0, 3.0 + age * 10.0, 2.0 + age * 5.0, DUSK_DUST, 1.1 * (1.0 - age / 0.6), seed + i, t, 0.5)


## A crack in the floor from (x0, y0) along (ux, uy) for `len` pixels, as stone breaks: short runs along the joints of the floor's
## stones and along the way it is driven, forks breaking off it; every pixel of it in order, how far along each is, whether a
## fork's (crackOf). (Kept: the same crack is asked for every frame.)
var _cracks := {}


func _crack_of(x0: float, y0: float, ux: float, uy: float, len: float, seed: int) -> Dictionary:
	var key := "%s:%s:%s:%s:%s:%d" % [x0, y0, ux, uy, len, seed]
	if _cracks.has(key):
		return _cracks[key]
	var out := {"x": PackedFloat64Array(), "y": PackedFloat64Array(), "s": PackedFloat64Array(), "fork": []}
	var seen := {}
	var nx := -uy
	var ny := ux
	var r5 := sqrt(5.0)
	var turn := func(an: float) -> Array: return [ux * cos(an) - uy * sin(an), uy * cos(an) + ux * sin(an)]
	var ways: Array = [[2.0 / r5, 1.0 / r5], [2.0 / r5, -1.0 / r5], [-2.0 / r5, 1.0 / r5], [-2.0 / r5, -1.0 / r5], [ux, uy], turn.call(0.75), turn.call(-0.75)]
	var put := func(px: float, py: float, s: float, fork: bool) -> void:
		var rx := _ri(px)
		var ry := _ri(py)
		var k := rx * 4096 + ry
		if seen.has(k):
			return
		seen[k] = true
		out["x"].append(rx)
		out["y"].append(ry)
		out["s"].append(s)
		out["fork"].append(fork)
	var along := func(px: float, py: float) -> float: return (px - x0) * ux + (py - y0) * uy
	var off := func(px: float, py: float) -> float: return (px - x0) * nx + (py - y0) * ny
	# one run of it: `n` pixels the way (wx, wy), a pixel at a time along its longer axis
	var run := func(px: float, py: float, wx: float, wy: float, n: int, s0, fork: bool) -> Array:
		var st := 1.0 / maxf(absf(wx), absf(wy))
		for i in n:
			px += wx * st
			py += wy * st
			put.call(px, py, float(s0) if s0 != null else along.call(px, py), fork)
		return [px, py]
	var px := x0
	var py := y0
	put.call(px, py, 0.0, false)
	var j := 0
	var next_fork := 5.0 + _h(1, seed, 60) * 6.0
	var side := 1.0 if _h(0, seed, 70) < 0.5 else -1.0
	var fwd: Array = []
	for w: Array in ways:
		if w[0] * ux + w[1] * uy > 0.3:
			fwd.append(w)
	while along.call(px, py) < len and j < 400:
		j += 1
		# it zigzags as stone breaks: toward a little way off its line on one side, then the other, by the stones' joints
		var o: float = off.call(px, py)
		var tgt := side * (1.0 + _h(j, seed, 61) * 2.5)
		var want_out := _sign(tgt - o)
		if want_out == 0.0:
			want_out = side
		var pick: Array = fwd[0]
		var best := -9.0
		for i in fwd.size():
			var w: Array = fwd[i]
			var score: float = (w[0] * nx + w[1] * ny) * want_out + (0.3 if i < 4 else 0.0) + _h(j * 7 + i, seed, 62) * 0.35
			if score > best:
				best = score
				pick = w
		if _h(j, seed, 69) < 0.12:
			pick = ways[4]
		var n := 2 + int(floorf(_h(j, seed, 63) * 4.0))
		var p: Array = run.call(px, py, pick[0], pick[1], n, null, false)
		px = p[0]
		py = p[1]
		if absf(float(off.call(px, py)) - tgt) < 1.0 or _h(j, seed, 64) < 0.5:
			side = -side
		var here: float = along.call(px, py)
		if here > next_fork and here < len - 5.0:
			# a fork breaking off along a joint, kinked once
			next_fork = here + 6.0 + _h(j, seed, 65) * 9.0
			var fs := 1.0 if _h(j, seed, 66) < 0.5 else -1.0
			var fw: Array = []
			for w: Array in ways:
				if (w[0] * nx + w[1] * ny) * fs > 0.3 and w[0] * ux + w[1] * uy > -0.2:
					fw.append(w)
			if not fw.is_empty():
				var w1: Array = fw[int(floorf(_h(j, seed, 67) * fw.size()))]
				var f: Array = run.call(px, py, w1[0], w1[1], 2 + int(floorf(_h(j, seed, 68) * 4.0)), here, true)
				if _h(j, seed, 71) < 0.6:
					run.call(f[0], f[1], ux, uy, 1 + int(floorf(_h(j, seed, 72) * 3.0)), here, true)
	_cracks[key] = out
	if _cracks.size() > 24:
		_cracks.erase(_cracks.keys()[0])
	return out


## A spear of light from its butt (bx, by) to its point (px, py); `a` how bright it is, drawn whole, dimmer as it gathers or goes
## (spear).
func _spear(bx: float, by: float, px: float, py: float, C: PackedColorArray, a: float, seed: int, t: float) -> void:
	if a <= 0.0:
		return
	var dx := px - bx
	var dy := py - by
	var len := sqrt(dx * dx + dy * dy)
	if len == 0.0:
		len = 1.0
	var ux := dx / len
	var uy := dy / len
	var nx := -uy
	var ny := ux
	var n := _ri(len)
	var dim := 0 if a > 0.75 else (1 if a > 0.45 else (2 if a > 0.2 else 3))
	for s in n + 1:
		var q := float(s) / n
		var cx := bx + ux * s
		var cy := by + uy * s
		# its butt: a thread of light only, dimmer toward its end
		if q < 0.3:
			_dot(cx, cy, C[maxi(0, (2 if q < 0.12 else 3) - dim)])
			continue
		var half: float
		if q < 0.74:
			half = 0.6 + q * 1.6
		else:
			var u := (q - 0.74) / 0.26
			half = 1.8 + (u / 0.3) * 1.8 if u < 0.3 else 3.6 * pow(1.0 - (u - 0.3) / 0.7, 0.9)
		var r := int(ceilf(half)) + 2
		for k in range(-r, r + 1):
			var d := absi(k) / maxf(0.3, half)
			if d > 1.0:
				# its light round it: a pixel of glow at its edge, flickering further out
				if dim > 1:
					continue
				if absi(k) <= int(ceilf(half)) + 1 and q > 0.2:
					_dot(cx + nx * k, cy + ny * k, C[maxi(0, 2 - dim)])
				elif dim == 0 and d < 2.4 and _h(s * 5 + k, int(floorf(t * 60.0)), seed) < 0.14:
					_dot(cx + nx * k, cy + ny * k, C[3])
				continue
			var ti := 5 if d < 0.4 else (4 if d < 0.8 else (4 if k < 0 else 3))
			_dot(cx + nx * k, cy + ny * k, C[maxi(0, ti - dim)])


## On a monster: its shot ghosts through a wall, the stone lit pink where it comes out (pierceMonster).
func _pierce_monster(a: Dictionary) -> void:
	var C := ENEMY
	var z := 16.0
	var t: float = a["t"]
	var seed: int = a["seed"]
	var head := t * T_GHOST
	var wall: float = a["r"]
	var ax: float = a["x"]
	var ay: float = a["y"]
	var dx: float = float(a["x1"]) - ax
	var dy: float = float(a["y1"]) - ay
	var Ln := sqrt(dx * dx + dy * dy)
	if Ln == 0.0:
		Ln = 1.0
	var passing: bool = a["part"] == "pass"
	var since := t - 0.1 if passing else (head - wall) / T_GHOST
	var wxp := _sx(ax, ay) if passing else _sx(ax + (dx / Ln) * wall, ay + (dy / Ln) * wall)
	var wyp := _sy(ax, ay, z) if passing else _sy(ax + (dx / Ln) * wall, ay + (dy / Ln) * wall, z)
	if since > -0.1 and since < 0.7:
		var k := _c01((since + 0.1) / 0.8)
		_mist(wxp, wyp, 14.0, 18.0, _pc([C[1], C[2], C[2], C[3]]), 0.9 * (1.0 - k), seed, t, 0.2)
		for ring in 3:
			var rr := 3.0 + ring * 5.0 + k * 9.0
			var n := _ri(rr * 7.0)
			for i in n:
				var an := (float(i) / n) * TAU
				if _vn(i * 0.5, ring * 3.0, seed) < 0.3:
					continue
				var px := wxp + cos(an) * rr * 0.55
				var py := wyp + sin(an) * rr
				if k > 0.5 and not _dith(px, py, (1.0 - k) * 2.0):
					continue
				_dot(px, py, C[5] if ring == 0 else (C[4] if ring == 1 else C[3]))
		for i in 6:
			var px := wxp
			var py := wyp
			var an := (i / 6.0) * TAU + _h(i, seed, 2)
			var s := 0
			while s < 7.0 + _h(i, seed, 3) * 6.0:
				px += cos(an) * 0.55 + (_h(s, i, seed) - 0.5) * 0.9
				py += sin(an) * 1.2 + (_h(s, i, seed + 1) - 0.5) * 0.9
				if k < 0.6 or _dith(px, py, (1.0 - k) * 2.5):
					_dot(px, py, C[5] if s < 3 else C[4])
				s += 1
		if since > 0.0 and since < 0.15:
			_star(wxp, wyp, 9.0, C, seed, 8)
	# (a passage only: the shot itself is the game's)
	if passing:
		return
	# it strikes him: a burst of the enemy's fire on him, and it is gone
	if head >= Ln:
		var since2 := (head - Ln) / T_GHOST
		if since2 < 0.18:
			_star(_sx(ax + dx, ay + dy), _sy(ax + dx, ay + dy, z), 4.0 + 7.0 * (1.0 - since2 / 0.18), C, seed + 3, 8)
		return
	# the shot: a bolt of pink fire, gold-white at its heart, its tail licking out behind it; inside the stone only a ghost of it
	var hh := minf(head, Ln)
	var n := 34
	for i in range(n, -1, -1):
		var s := hh - (float(i) / n) * 1.5
		if s < 0.0:
			continue
		var px := _sx(ax + (dx / Ln) * s, ay + (dy / Ln) * s)
		var py := _sy(ax + (dx / Ln) * s, ay + (dy / Ln) * s, z)
		var q := 1.0 - float(i) / n
		var inside := s < wall
		var wob := (_vn(i * 0.7, t * 20.0, seed) - 0.5) * 3.0 * (1.0 - q)
		if inside and not _dith(px, py, 0.45):
			continue
		var half := 1.5 if q > 0.8 else (1.0 if q > 0.45 else 0.0)
		var rh := _ri(half)
		for j in range(-rh, rh + 1):
			var edge := absi(j) == rh and half > 0.0
			var c: Color = C[3] if inside else (((C[4] if edge else C[5]) if q > 0.88 else ((C[3] if edge else C[4]) if q > 0.6 else (C[3] if q > 0.3 else C[2]))))
			_dot(px, py + j + wob, c)
	if hh > wall:
		var hx := _sx(ax + (dx / Ln) * hh, ay + (dy / Ln) * hh)
		var hy := _sy(ax + (dx / Ln) * hh, ay + (dy / Ln) * hh, z)
		_dot(hx - 2, hy - 1, C[4], 4, 3)
		_dot(hx - 1, hy, C[5], 3, 1)
		_glint(_ri(hx + 2.0), _ri(hy), 2, C[4], C[5])


# =====================================================================================================================
# BLEEDING

## In front, as it is struck (bleedOn): the wound opens and its blood spurts out the way the blow went (bleedFront).
func _bleed_front(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["bleeding"]
	var m = _live(a)
	if m == null:
		return
	var t: float = a["t"]
	var seed: int = a["seed"]
	var top: float = m["top"]
	var mx := _sx(m["x"], m["y"])
	var my := _sy(m["x"], m["y"])
	var wx0 := mx
	var wy0 := my - _ri(top * 0.58)
	# the wound tearing open (its first pictures)
	var open := _c01(t / 0.05)
	for k in _ri(2.0 + 4.0 * open):
		_dot(wx0 - 3 + k, wy0 - 2 + _ri(k * 0.7), C[1])
		_dot(wx0 - 3 + k, wy0 - 3 + _ri(k * 0.7), C[4])
	if t < 0.12:
		_glint(wx0, wy0 - 1, 2, C[4], C[5])
	# the spurt, flung on the way the blow went
	var away := 1.0 if float(a["dx"]) - float(a["dy"]) >= 0.0 else -1.0
	for i in 9:
		var tt := t - 0.02 - i * 0.025
		if tt <= 0.0 or tt > 0.6:
			continue
		var vx := away * (35.0 + _h(i, seed, 2) * 45.0)
		var vy := -(35.0 + _h(i, seed, 3) * 40.0)
		var px := wx0 + vx * tt
		var py := wy0 + vy * tt + 170.0 * tt * tt
		if py > my + 3.0:
			continue
		_drop(px, py, vx, vy + 340.0 * tt, C, i < 4)


## While anything bleeds (monster.gd bleed_t, hero.gd bleed_t): its wound, drips running off it, and the splashes on the floor
## where it walks, drying and fading; the hero's blood, a monster's doing, dark, its wet glint the enemy's pink (drawBleeding).
func _draw_bleeding(floor: bool) -> void:
	if floor:
		var dry_tone := _pc([Color("#0a0002"), RAMP["bleeding"][1], RAMP["bleeding"][1], RAMP["bleeding"][2], RAMP["bleeding"][2], RAMP["bleeding"][3]])
		var dry_hero := _pc([Color("#0a0002"), ENEMY_BLOOD[1], ENEMY_BLOOD[1], ENEMY_BLOOD[2], ENEMY_BLOOD[2], ENEMY_BLOOD[3]])
		for sp: Dictionary in splashes:
			var C: PackedColorArray = ENEMY_BLOOD if sp["hero"] else RAMP["bleeding"]
			var px := _sx(sp["x"], sp["y"])
			var py := _sy(sp["x"], sp["y"])
			var age: float = sp["age"]
			var dry := _c01(age / T_SPLASH)
			var fade := _c01((T_SPLASH - age) / 0.8)
			if fade <= 0.0:
				continue
			# fresh, it is wet and red; drying, it darkens; going, it thins to nothing
			var tone: PackedColorArray = (dry_hero if sp["hero"] else dry_tone) if dry > 0.5 else C
			if fade < 1.0 and not _dith(px, py, fade, int(sp["seed"])):
				continue
			_splat(px, py, sp["size"], tone, sp["seed"], sp["ex"], sp["ey"], 1.0 - dry)
		return
	for m: Dictionary in view["monsters"]:
		var left: float = m["bleedT"]
		if m["dead"] or left <= 0.0:
			continue
		var C: PackedColorArray = RAMP["bleeding"]
		var top: float = m["top"]
		var mx := _sx(m["x"], m["y"])
		var my := _sy(m["x"], m["y"])
		var wy0 := my - _ri(top * 0.58)
		for k in 6:
			_dot(mx - 3 + k, wy0 - 2 + _ri(k * 0.7), C[1])
			_dot(mx - 3 + k, wy0 - 3 + _ri(k * 0.7), C[4])
		var b = bleeders.get(int(m["id"]))
		var walking: bool = b != null and float(b["since"]) < 0.0
		var nd := 4 if walking else 2
		for i in nd:
			var ph := fmod(clock * (3.4 if walking else 1.7) + float(i) / nd + (int(m["id"]) % 7) * 0.13, 1.0)
			var py := wy0 + 1 + ph * ph * top * 0.58
			if py < my:
				_drop(mx - 2 + i * 1.5, py, 0.0, 1.0, C, i == 1)
	var h: Dictionary = view["hero"]
	if float(h["heroBleedT"]) > 0.0:
		var C := ENEMY_BLOOD
		var hx := _sx(h["x"], h["y"])
		var hy := _sy(h["x"], h["y"])
		for k in 6:
			_dot(hx - 3 + k, hy - 20 + k, C[4])
			_dot(hx - 3 + k, hy - 19 + k, C[2])
		for i in 2:
			var ph := fmod(clock * 2.2 + i * 0.5, 1.0)
			_drop(hx - 2 + i * 4, hy - 15 + ph * ph * 15.0, 0.0, 1.0, C, true)


## The briars of a patch of thorns (the rules' zone `thorns`): bursting up over its first 0.22 s, swaying, sinking back over its
## last 0.5 s; half of them stand in front of what walks there; what walks in them is cut (thorns).
func _thorns(zx: float, zy: float, zr: float, zt: float, zdur: float, seed: int, floor: bool) -> void:
	var ar := minf(2.2, zr)
	var t := zt
	var grow := _ease_out(t / T_THORNS_GROW) * _ease_out((zdur - zt) / T_THORNS_SINK)
	var over := sin((t / T_THORNS_GROW) * PI) * 0.15 if t < T_THORNS_GROW else 0.0
	var fade := _c01((zdur - zt) / 0.25)
	var walkers: Array = []
	for m: Dictionary in view["monsters"]:
		if not m["dead"] and _hyp(float(m["x"]) - zx, float(m["y"]) - zy) < ar:
			walkers.append(m)
	var cx := _sx(zx, zy)
	var cy := _sy(zx, zy)
	var foot_y := _sy(walkers[0]["x"], walkers[0]["y"]) if not walkers.is_empty() else cy
	if floor:
		# the floor torn where they came up: dark earth, broken stone at the edges
		_mist(cx, cy, ar * RX * 0.95, ar * RY * 0.95, _pc([Color("#0c0406"), Color("#160609"), Color("#22080c")]), 1.2 * fade * minf(1.0, t / 0.1), seed, 0.0, 0.0)
	var N := 10
	for i in N:
		var an := (float(i) / N) * TAU + (_h(i, seed, 3) - 0.5) * 0.6
		var d := (0.25 + 0.7 * _h(i, seed, 4)) * ar
		var bx := _ri(cx + cos(an) * d * RX)
		var by := _ri(cy + sin(an) * d * RY)
		# in front of what walks there, or behind it
		var front := by > foot_y
		if (not floor) != front:
			continue
		var tall := (13.0 + _h(i, seed, 5) * 12.0) * (grow + over)
		var way := 1.0 if cos(an) >= 0.0 else -1.0
		var reach := (7.0 + _h(i, seed, 7) * 9.0) * way
		var sway := sin(t * 2.2 + i) * 0.8
		# a stem: up out of the floor, arching over, its end hooked back down
		_briar([float(bx), float(by)], [bx + reach * 0.25 + sway, by - tall * 1.4], [bx + reach + sway * 1.5, by - tall * 0.35], seed + i * 31, fade)
		# a second, thinner, off its root the other way
		if i % 2 == 0:
			_briar([float(bx), float(by)], [bx - reach * 0.3, by - tall * 0.9], [bx - reach * 0.7, by - tall * 0.5], seed + i * 37, fade, true)
		# the stone broken round its root
		_dot(bx - 2, by, Color("#2a2024"))
		_dot(bx + 1, by + 1, DUST[1])
		_dot(bx + 2, by, DUST[0])
	# what walks in them is cut: small slashes on its legs, blood flicked off
	if not floor and t > T_THORNS_GROW and fade > 0.5:
		var C: PackedColorArray = RAMP["bleeding"]
		for w: Dictionary in walkers:
			var mx := _sx(w["x"], w["y"])
			var my := _sy(w["x"], w["y"])
			for i in 3:
				var lx := mx - 3 + i * 3
				var ly := my - 5 - i * 3
				_dot(lx, ly, C[4], 2, 1)
				_dot(lx + 1, ly + 1, C[3])
				var ph := fmod(t * 3.0 + i * 0.37 + int(w["id"]) * 0.21, 1.0)
				_drop(lx + (i - 1) * ph * 7.0, ly - ph * 7.0 + ph * ph * 16.0, i - 1, ph * 2.0 - 1.0, C, i == 1)


## One briar: a stem up out of the floor along a curve, thick at its root, thin at its end, lit along its top; thorns on alternate
## sides, swept back, pale at their points (briar).
func _briar(p0: Array, pc: Array, p1: Array, seed: int, fade: float, thin := false) -> void:
	var n := maxi(8, _ri((_hyp(pc[0] - p0[0], pc[1] - p0[1]) + _hyp(p1[0] - pc[0], p1[1] - pc[1])) * 1.2))
	var last = null
	for s in n + 1:
		var q := float(s) / n
		var p: Array = _quad(p0[0], p0[1], pc[0], pc[1], p1[0], p1[1], q)
		var x: float = p[0]
		var y: float = p[1]
		if fade < 1.0 and not _dith(x, y, fade):
			continue
		var thick := not thin and q < 0.3
		_dot(x, y, BRIAR[3] if q > 0.9 else BRIAR[2])
		_dot(x, y - 1, BRIAR[4] if q > 0.85 else BRIAR[3])
		if thick:
			_dot(x + 1, y, BRIAR[1])
		# thorns, every four pixels, on alternate sides, swept back toward the root
		if last != null and s % 4 == 2 and q > 0.12 and q < 0.95:
			var tx: float = x - float(last[0])
			var ty: float = y - float(last[1])
			var tl := sqrt(tx * tx + ty * ty)
			if tl == 0.0:
				tl = 1.0
			var sd := 1.0 if s % 8 == 2 else -1.0
			var ox := (-ty / tl) * sd
			var oy := (tx / tl) * sd
			_dot(x + ox, y + oy, BRIAR[3])
			_dot(x + ox * 2.0 - tx / tl, y + oy * 2.0 - ty / tl, THORN if _h(s, seed, 1) < 0.7 else BRIAR[4])
		last = [x, y]


## On a monster, its blow landing (heroBleed): a slash of the enemy's fire across him, his blood flung off (bleedMonster).
func _bleed_monster(a: Dictionary) -> void:
	var h: Dictionary = view["hero"]
	var hx := _sx(h["x"], h["y"])
	var hy := _sy(h["x"], h["y"])
	var C := ENEMY_BLOOD
	var t: float = a["t"]
	var seed: int = a["seed"]
	var away := 1.0 if float(a["dx"]) - float(a["dy"]) >= 0.0 else -1.0
	if t < 0.35:
		var k := _c01(t / 0.05)
		var fade := _c01(1.0 - (t - 0.08) / 0.27)
		var a0 := PI * 1.15 if away > 0.0 else -PI * 0.15
		var a1 := a0 + away * -PI * 1.0 * k
		_smear(hx, hy - 17, 15.0, 11.0, a0, a1, 4, _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[3], ENEMY[4], ENEMY[5]]), -0.25 * away, fade)
	# the cut on him, opening
	var open := _c01((t - 0.03) / 0.05)
	for k in _ri(6.0 * open):
		_dot(hx - 3 + k, hy - 20 + k, C[4])
		_dot(hx - 3 + k, hy - 19 + k, C[2])
	# his blood flung off him the way the blow went
	for i in 10:
		var tt := t - 0.04 - i * 0.012
		if tt <= 0.0 or tt > 0.6:
			continue
		var vx := away * (30.0 + _h(i, seed, 3) * 50.0)
		var vy := -(30.0 + _h(i, seed, 4) * 45.0)
		var px := hx + vx * tt
		var py := hy - 17.0 + vy * tt + 180.0 * tt * tt
		if py > hy + 2.0:
			continue
		_drop(px, py, vx, vy + 360.0 * tt, C, i < 4)


# =====================================================================================================================
# REAPING

## In front: the kill's soul is torn out of it and flies to the hero, a wisp of pale soul-light, its tail streaming (reapFront).
func _reap_front(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["reaping"]
	var h: Dictionary = view["hero"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"], 6.0)
	var hx := _sx(h["x"], h["y"])
	var hy := _sy(h["x"], h["y"], 20.0)
	# (it goes up out of the body and comes down into him: the nearer the kill, the higher it loops, so its flight is seen)
	var near := sqrt((hx - cx) * (hx - cx) + (hy - cy) * (hy - cy))
	var mx := (cx + hx) / 2.0 + (10.0 if cx >= hx else -10.0) * _c01(1.0 - near / 60.0)
	var my := minf(cy, hy) - maxf(30.0, 64.0 - near * 0.5)
	var fl := T_SOUL
	var torn := 0.15
	var soft := _pc([C[2], C[3], C[4], C[4], C[5], C[5]])
	# torn out of the body: a column of grave-mist rising off it, thinning
	if t < torn + fl + 0.3:
		var k := _c01(t / (torn + fl + 0.3))
		_mist(cx, cy - 8.0 - k * 8.0, 7.0, 12.0, _pc([C[2], C[3], C[4]]), 0.8 * (1.0 - k) * minf(1.0, t / 0.08 + 0.3), seed, t, 1.2)
	if t < torn:
		# the soul coming up out of it, a flame of soul-light swelling
		var k := t / torn
		_flame(cx, cy + 2.0, 3.0 + 8.0 * k, 3.0 + 5.0 * k, soft, seed, t)
		return
	var q := _c01((t - torn) / fl)
	if q >= 1.0:
		# taken in: a flare of soul-light round his hands
		var k := _c01((t - torn - fl) / 0.25)
		if k < 1.0:
			_star(hx, hy, 4.0 + 7.0 * (1.0 - k), C, seed, 6, 0.3)
		return
	var qq := _smooth(q)
	# its tail along the way it came: a ragged ribbon of soul-light, thinning and torn into motes at its end
	var n := 40
	for i in range(n, -1, -1):
		var back := (float(i) / n) * 0.5
		var u := qq - back
		if u < 0.0:
			continue
		var p: Array = _quad(cx, cy, mx, my, hx, hy, u)
		var k := 1.0 - float(i) / n
		var half := 0.4 + k * k * 3.2
		var wob := (_vn(i * 0.35, t * 12.0, seed) - 0.5) * 5.0 * (1.0 - k)
		var rh := _ri(half)
		for j in range(-rh, rh + 1):
			var d := absi(j) / (half + 0.01)
			var v := k * 0.8 + (1.0 - d) * 0.45 - 0.05
			var yy: float = float(p[1]) + j + wob
			if k < 0.35 and not _dith(p[0], yy, k / 0.35 + 0.1):
				continue
			_dot(p[0], yy, C[maxi(1, mini(5, int(floorf(v * 5.4))))])
	# its head: a flame of soul-light, two hollows of eyes in it
	var s: Array = _quad(cx, cy, mx, my, hx, hy, qq)
	_flame(s[0], s[1] + 4.0, 11.0, 8.0, soft, seed, t)
	_dot(s[0] - 2, s[1] - 1, C[2])
	_dot(s[0] + 1, s[1] - 1, C[2])
	_dot(s[0] - 1, s[1] + 1, C[3], 2, 1)
	# motes shed off it, drifting up
	for i in 9:
		var u := qq - 0.08 - _h(i, seed, 1) * 0.35
		if u < 0.0:
			continue
		var p: Array = _quad(cx, cy, mx, my, hx, hy, u)
		var age := (qq - u) * 2.0
		_dot(p[0] + (_h(i, seed, 2) - 0.5) * 10.0, p[1] - age * 12.0, C[5] if age < 0.4 else C[4])


## How far a spirit has risen (0..1) and how much of it is left as it goes (1..0) (spiritK).
static func _spirit_k(a: Dictionary) -> Array:
	return [_c01(float(a["t"]) / T_SPIRIT_BUILD), _c01((float(a["dur"]) - float(a["t"])) / T_SPIRIT_FADE)]


## A spirit an act is about: the rules' own (last_words.gd spirits), or a monster drawn as one (spiritOf).
func _spirit_of(a: Dictionary) -> Variant:
	var ids: Array = a["ids"]
	if ids.is_empty():
		return null
	if a["rules"]:
		for q: Dictionary in view["spirits"]:
			if int(q["id"]) == int(ids[0]):
				return q
		return null
	return _live(a, 0)


## Behind: a kill raises its spirit to fight for him: rising out of the body in a stream of grave-mist, motes of soul-light rising
## off it; at the end of its time it rises away and is gone (reapBehind). (Its picture: `Pictures`.)
func _reap_behind(a: Dictionary, floor: bool) -> void:
	var C: PackedColorArray = RAMP["reaping"]
	if a["part"] == "hit":
		_spirit_blow(a, floor)
		return
	var sp = _spirit_of(a)
	if sp == null:
		return
	var t: float = a["t"]
	var seed: int = a["seed"]
	var kk := _spirit_k(a)
	var build: float = kk[0]
	var going: float = kk[1]
	var k := build * going
	var sx := _sx(sp["x"], sp["y"])
	var sy := _sy(sp["x"], sp["y"])
	var bx := _sx(a["x"], a["y"])
	var by := _sy(a["x"], a["y"])
	if floor:
		# a pool of pale light under it, and a thread of mist back to the body it rose from while it rises
		_mist(sx, sy, 12.0, 5.0, _pc([C[1], C[2], C[3]]), 0.45 * (1.0 - build) + 0.2 * k, seed, t, 0.2)
		var thread := _c01(1.0 - (t - T_SPIRIT_BUILD) / 0.8)
		if thread > 0.0:
			for i in 13:
				var q := i / 12.0
				_mist(bx + (sx - bx) * q, by + (sy - by) * q - 2.0, 3.0, 2.0, _pc([C[2], C[3]]), 0.8 * thread * (1.0 - absf(q - 0.5)), seed + i, t, 0.6)
		return
	# rising: soul-light streaming up off the body into it
	if build < 1.0:
		for i in 10:
			var ph := fmod(t * 3.0 + _h(i, seed, 9), 1.0)
			var px := bx + (sx - bx) * ph + sin(ph * 8.0 + i) * 2.0
			var py := by - 2.0 + (sy - 12.0 - by + 2.0) * ph
			_dot(px, py, C[5] if ph > 0.6 else C[4])
		_mist(bx, by - 3.0, 8.0, 5.0, _pc([C[2], C[3], C[4]]), 1.1 * (1.0 - build), seed + 2, t, 1.4)
	# grave-mist curling up round its feet, motes of soul-light rising off it (faster as it goes)
	_mist(sx, sy - 4.0, 9.0, 5.0, _pc([C[2], C[3], C[4]]), 0.55 * (1.0 - build) + 0.5 * (1.0 - going), seed + 1, t, 1.2)
	for i in 7 + _ri(8.0 * (1.0 - going)):
		var ph := fmod(t * (0.8 + 1.5 * (1.0 - going)) + _h(i, seed, 1), 1.0)
		_dot(sx - 9.0 + _h(i, seed, 2) * 18.0 + sin(ph * 6.0 + i) * 2.0, sy - 4.0 - ph * 34.0, C[5] if ph < 0.5 else C[4])
	# (a blow at a moment of its own, as the stills had it)
	var foe = _live(a, 1)
	var pts: Array = a["pts"]
	if foe != null and not pts.is_empty() and t >= float(pts[0]) and t - float(pts[0]) < 0.32:
		var way := _sign(_sx(foe["x"], foe["y"]) - _sx(sp["x"], sp["y"]))
		_claw_rake(foe["x"], foe["y"], foe["top"], t - float(pts[0]), way if way != 0.0 else 1.0, seed)


## A spirit's blow (spiritHit): its claw rake across what it strikes (spiritBlow).
func _spirit_blow(a: Dictionary, floor: bool) -> void:
	if floor:
		return
	var foe = _live(a, 0)
	var fxw: float = foe["x"] if foe != null else a["x"]
	var fyw: float = foe["y"] if foe != null else a["y"]
	var way := _sign(_sx(fxw, fyw) - _sx(a["x1"], a["y1"]))
	_claw_rake(fxw, fyw, foe["top"] if foe != null else 26.0, a["t"], way if way != 0.0 else 1.0, a["seed"])


## A CLAW RAKE across what it strikes (`since` seconds after the blow): four curved gashes side by side, slashed down across it the
## way the rake went, grey-white, his cyan glinting at their points; then they close up from their tails, dimming (clawRake).
func _claw_rake(x: float, y: float, top: float, since: float, way: float, seed: int) -> void:
	var strike := T_RAKE_STRIKE
	var fade := T_RAKE_FADE
	if since < 0.0 or since >= strike + fade:
		return
	var cx := _sx(x, y)
	var cy := _sy(x, y, top * 0.55)
	var k := _c01(since / strike)
	var after := _c01((since - strike) / fade)
	var dim := 0 if after < 0.35 else (1 if after < 0.6 else (2 if after < 0.85 else 3))
	var dx := way * 19.0
	var dy := 14.0
	var Ln := sqrt(dx * dx + dy * dy)
	var nx := -dy / Ln
	var ny := dx / Ln
	for j in 4:
		var off := (j - 1.5) * 5.0
		var len := 1.0 - absf(j - 1.4) * 0.12
		var x0 := cx - dx * 0.5 * len + nx * off
		var y0 := cy - dy * 0.5 * len + ny * off - j * 0.6
		var x2 := cx + dx * 0.5 * len + nx * off
		var y2 := cy + dy * 0.5 * len + ny * off - j * 0.6
		# bowed: its middle pushed out the way a claw's sweep curves
		var bow := 3.6 + _h(j, seed, 3) * 1.4
		var x1 := (x0 + x2) / 2.0 - nx * bow
		var y1 := (y0 + y2) / 2.0 - ny * bow
		var q0 := after
		var q1 := k
		var n := int(ceilf(Ln * len * 1.4))
		var tip = null
		for i in n + 1:
			var q := float(i) / n
			if q < q0 or q > q1:
				continue
			var p: Array = _quad(x0, y0, x1, y1, x2, y2, q)
			# thickest a little past its start, drawn to a point at both ends: a bright line, edged dark where it is widest
			var w := sin(PI * minf(1.0, pow(maxf(0.0, q), 0.75))) * (1.0 - 0.4 * after)
			_dot(p[0], p[1], CLAW[maxi(0, (4 if w > 0.45 else 3) - dim)])
			if w > 0.7:
				_dot(p[0] + nx, p[1] + ny, CLAW[maxi(0, 2 - dim)])
				_dot(p[0] - nx, p[1] - ny, CLAW[maxi(0, 1 - dim)])
			tip = p
		if tip != null and since < strike + 0.05:
			_dot(tip[0], tip[1], FRIEND[3])


## On a monster: once dead it rises again, lurching up out of its fall, the enemy's fire licking up round it (reapMonster).
func _reap_monster(a: Dictionary, floor: bool) -> void:
	var t: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var k := _c01((t - 0.2) / T_RISE)
	var kindle := _c01(t / 0.2)
	var dying := _c01((float(a["dur"]) - t) / 0.4)
	if floor:
		_mist(cx, cy, 20.0, 9.0, _pc([ENEMY[1], ENEMY[1], ENEMY[2], ENEMY[3]]), 1.0 * kindle * dying, seed, t, 0.3)
		return
	# tongues of the enemy's fire up out of the floor round it, before it
	for i in 6:
		var an := (i / 6.0) * PI + 0.25 + _h(i, seed, 1) * 0.3
		var px := cx + cos(an) * (8.0 + _h(i, seed, 2) * 5.0)
		var py := cy + sin(an) * (2.0 + _h(i, seed, 3) * 3.0)
		_flame(px, py, (9.0 + _h(i, seed, 4) * 9.0) * (0.4 + 0.6 * k) * kindle * dying, (5.0 + _h(i, seed, 5) * 3.0) * maxf(0.4, dying), ENEMY_FIRE, seed + i, t)
	# sparks of pink and gold rising off it
	for i in _ri(10.0 * kindle * dying):
		var ph := fmod(t * 1.2 + _h(i, seed, 6), 1.0)
		_dot(cx - 12.0 + _h(i, seed, 7) * 24.0 + sin(ph * 7.0 + i) * 2.0, cy - 4.0 - ph * 36.0, ENEMY[5] if ph < 0.4 else ENEMY[4])


# =====================================================================================================================
# CULLING

## In front: his blow lands; an instant held, a violet glint on the one it takes; then the scythe's own crescent sweeps through it,
## smeared, dusk violet and bone; it is cut in two (`Pictures`); the crescent sweeps on, dimming and thinning away (cullFront).
func _cull_front(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["culling"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var m = _live(a, 0)
	var mx := _sx(m["x"], m["y"]) if m != null else _sx(a["x"], a["y"])
	var my := _sy(m["x"], m["y"]) if m != null else _sy(a["x"], a["y"])
	var top: float = m["top"] if m != null else float(a.get("fallTop", 26.0))
	var cy := my - _ri(top * 0.45)
	var way := 1.0 if float(a["dx"]) - float(a["dy"]) >= 0.0 else -1.0
	var hold := T_CULL_HOLD
	var sweep := T_CULL_SWEEP
	if t < hold:
		# held: a glint of violet light on it, swelling, pinched out as the blade comes
		var q := t / hold
		var r := 4.0 + 7.0 * sin(PI * minf(1.0, 0.25 + q * 0.85))
		var gx := mx - way * 2.0
		var gy := cy - 9.0
		_star(gx, gy, r * 1.6, _pc([C[1], C[2], C[3]]), seed + 2, 4, 0.0, 1.0)
		_star(gx, gy, r, _pc([C[2], C[3], C[4], C[5]]), seed, 4, 0.0, 1.0)
		_star(gx, gy, r * 0.45, _pc([C[2], C[3], C[4]]), seed + 1, 4, PI / 4.0, 1.0)
		_dot(gx - 1, gy, C[4], 3, 1)
		_dot(gx, gy - 1, C[4], 1, 3)
		_dot(gx, gy, C[5])
		return
	var after := t - hold - sweep
	var fade := _c01(1.0 - after / 0.3)
	if fade <= 0.0:
		return
	var u := (t - hold) / sweep
	var lead := u if u <= 1.0 else 1.0 + 0.25 * _ease_out(after / 0.3)
	var H := _ri(34.0 * (0.55 + 0.45 * fade))
	var T := maxi(2, _ri(6.0 * (0.4 + 0.6 * fade)))
	var dim_f := 0 if fade > 0.7 else (1 if fade > 0.45 else (2 if fade > 0.2 else 3))
	var ghosts := 5 if u <= 1.0 else maxi(0, int(floorf(5.0 * fade - 1.0)))
	for j in range(ghosts, 0, -1):
		var v := lead - j * 0.075
		if v < 0.0:
			continue
		_scythe(mx + way * (-8.0 + 38.0 * v), cy + (-8.0 + 38.0 * v) * 0.35, H - j * 2, maxi(2, T - int(ceilf(j / 2.0))), way, C, mini(3, dim_f + int(ceilf(j / 2.0))))
	# speed lines off its points, the way it went
	if u <= 1.4:
		for tip_side in [-1.0, 1.0]:
			var lx := mx + way * (-8.0 + 38.0 * lead)
			var ly := cy + (-8.0 + 38.0 * lead) * 0.35
			var ty2: float = ly + float(tip_side) * (H / 2.0 - 2.0)
			var v2 := maxf(-0.05, lead - 0.55)
			var sx := mx + way * (-8.0 + 38.0 * v2)
			var sy := cy + (-8.0 + 38.0 * v2) * 0.35
			_streak(sx - way * 2.0, sy + tip_side * (H / 2.0 - 4.0), lx - way * 3.0, ty2, _pc([C[1], C[2], C[3]]), 1)
	_scythe(mx + way * (-8.0 + 38.0 * lead), cy + (-8.0 + 38.0 * lead) * 0.35, H, T, way, C, dim_f)
	# chips of bone knocked off along the cut as it goes through, falling
	if u > 0.5:
		var since := t - hold - sweep * 0.5
		for i in 7:
			if since > 0.18 + _h(i, seed, 1) * 0.2:
				continue
			var v := 40.0 + _h(i, seed, 2) * 60.0
			var an := -0.6 + (_h(i, seed, 3) - 0.5) * 1.4
			var px := mx + way * (cos(an) * v * since)
			var py := cy + sin(an) * v * since * 0.6 + 160.0 * since * since
			_dot(px, py, C[5] if since < 0.1 else C[4])
			if i % 3 == 0:
				_dot(px - way, py, C[3])


## The scythe's blade: a crescent `H` tall and `T` thick at its middle, drawn to a point at both ends, its back bulging the way it
## sweeps (`way`); bone along its leading edge, dusk violet in its body; `dim` whole tones darker (scythe).
func _scythe(cx: float, cy: float, H: int, T: int, way: float, C: PackedColorArray, dim: int) -> void:
	if H < 4:
		return
	var R := maxf(H * 0.62, 8.0)
	var half := int(ceilf(H / 2.0))
	for y in range(-half, half + 1):
		var q := (2.0 * y) / H
		if absf(q) > 1.0:
			continue
		var lead := cx - way * (R - sqrt(R * R - y * y))
		var thick := T * pow(1.0 - q * q, 0.8)
		if thick < 0.5:
			continue
		for k in int(ceilf(thick)) + 1:
			if k > thick:
				break
			var px := lead - way * k
			var ti := 5 if k < 1.2 else (4 if k < 2.3 else (2 if thick - k < 1.0 else 3))
			_dot(px, cy + y, C[maxi(0, ti - dim)])


## A crescent blade: the part of a disc (radius R about (cx, cy)) outside another a little off it, its points along `ang`
## (crescent).
func _crescent(cx: float, cy: float, R: int, ang: float, off: float, C: PackedColorArray, fade: float, squash := 1.0) -> void:
	var ox := cos(ang + PI / 2.0) * off
	var oy := sin(ang + PI / 2.0) * off
	for y in range(-R - 1, R + 2):
		for x in range(-R - 1, R + 2):
			var d1 := sqrt(float(x * x + y * y))
			var d2 := sqrt((x - ox) * (x - ox) + (y - oy) * (y - oy))
			if d1 > R or d2 < R:
				continue
			var px := cx + x
			var py := cy + y * squash
			if fade < 1.0 and not _dith(px, py, fade):
				continue
			var to_edge := d2 - R
			var to_back := R - d1
			_dot(px, py, C[5] if to_edge < 1.2 else (C[4] if to_edge < 2.2 else (C[1] if to_back < 1.0 else C[3])))


## (the hooded blade's peak: how far a place is inside its drooping tip, less is in: cullBehind's peakAt)
static func _peak_at(u: float, v: float) -> float:
	var best := INF
	for q in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]:
		var p: Array = _quad(0.0, -0.66, -0.26, -0.86, -0.46, -0.6, q)
		best = minf(best, sqrt((u - p[0]) * (u - p[0]) + (v - p[1]) * (v - p[1])) - (0.09 - q * 0.07))
	return best


static func _seg_d(u: float, v: float, u0: float, v0: float, u1: float, v1: float) -> float:
	var du := u1 - u0
	var dv := v1 - v0
	var k2 := _c01(((u - u0) * du + (v - v0) * dv) / (du * du + dv * dv))
	var a := u - u0 - du * k2
	var b := v - v0 - dv * k2
	return sqrt(a * a + b * b)


## Behind: the reaper's mark on the floor (a sigil of a hooded blade); the first weak one to cross it is taken by a blade rising
## out of it (cullBehind).
func _cull_behind(a: Dictionary, floor: bool) -> void:
	var C: PackedColorArray = RAMP["culling"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var ar: float = a["r"]
	var rx := ar * RX
	var ry := ar * RY
	var pts: Array = a["pts"]
	var taken := t if a["part"] == "mark" else (t - float(pts[0]) if not pts.is_empty() else -1.0)
	var written := _c01(t / 0.3) * _c01((float(a["dur"]) - t) / 0.3) if a["part"] == "zone" else 1.0
	var burn := (_c01(1.0 - (taken - 0.5) / 0.4) if taken >= 0.0 else 1.0) * written
	var flare := 1.0 - taken / 0.5 if taken >= 0.0 and taken < 0.5 else 0.0
	if floor:
		if burn <= 0.0:
			return
		# a ring of bone light written on the floor, an inscription between its two lines, the light spilling a little outside
		for i in _ri(rx * 9.0):
			var an := _h(i, seed, 40) * TAU
			var d := 1.02 + _h(i, seed, 41) * 0.12
			var px := cx + cos(an) * rx * d
			var py := cy + sin(an) * ry * d
			if _dith(px, py, burn * (1.14 - d) * 4.0):
				_dot(px, py, C[2])
		_mark_ring(cx, cy, rx, ry, 1.0, C[5] if flare > 0.3 else C[4], C[1], burn, seed)
		_mark_ring(cx, cy, rx, ry, 0.8, C[5] if flare > 0.3 else C[3], C[1], burn, seed)
		var nn := _ri(rx * 0.9 * 6.3 / 3.0)
		for i in nn:
			if _h(i, seed, 42) < 0.15 or i % 6 == 5:
				continue
			var an := (float(i) / nn) * TAU
			var px := cx + cos(an) * rx * 0.9
			var py := cy + sin(an) * ry * 0.9
			var sh := int(floorf(_h(i, seed, 43) * 4.0))
			var c: Color = C[5] if flare > 0.0 else C[4]
			if burn < 1.0 and not _dith(px, py, burn):
				continue
			_dot(px, py - 1, c)
			if sh != 1:
				_dot(px, py, c)
			if sh == 2 or sh == 3:
				_dot(px + 1, py - 1, c)
			if sh == 0:
				_dot(px - 1, py, c)
		# in it, the hooded blade, written on the floor: a cowl, its face a deep hollow under a lit brim, its cloth falling in folds
		# to a ragged hem; over it, out of it, the great curved blade of a scythe, its haft beside it
		var bone: Color = C[5] if flare > 0.0 else C[4]
		var S0 := rx * 0.72
		var SQ := 0.72
		for py in range(int(floorf(cy - S0 * SQ * 1.05)), int(ceilf(cy + S0 * SQ * 0.95)) + 1):
			for px in range(int(floorf(cx - S0 * 1.05)), int(ceilf(cx + S0 * 1.05)) + 1):
				var u := (px - cx) / S0
				var v := (py - cy) / (S0 * SQ)
				if burn < 1.0 and not _dith(px, py, burn):
					continue
				# the cowl
				var cu := u - 0.04
				var w: float
				if v < -0.4:
					var e := (v + 0.4) / 0.3
					w = -1.0 if e < -1.0 else 0.27 * sqrt(1.0 - e * e)
				else:
					w = 0.27 + 0.21 * pow((v + 0.4) / 0.95, 1.3)
				var hem := 0.55 + 0.05 * sin(u * 21.0 + 1.0) + 0.03 * sin(u * 47.0)
				var pk := _peak_at(u, v)
				var in_cowl := (w > 0.0 and absf(cu) <= w and v <= hem) or pk < 0.0
				if in_cowl:
					var face := sqrt(((u - 0.07) / 0.13) * ((u - 0.07) / 0.13) + ((v + 0.12) / 0.22) * ((v + 0.12) / 0.22))
					var edge := true if (pk > -0.035 and pk < 0.0) else (w - absf(cu) < 0.05 or hem - v < 0.06)
					if face < 1.0:
						_dot(px, py, C[0] if face < 0.55 else (C[1] if face < 0.8 else C[2]))
						continue
					if face < 1.28 and v < 0.12:
						# the brim round its face, lit
						_dot(px, py, bone)
						continue
					var fold := false
					if v > 0.12:
						for f in [-0.2, -0.05, 0.12, 0.27]:
							if absf(cu - f * (0.55 + 0.7 * _c01((v - 0.1) / 0.45))) < 0.022:
								fold = true
								break
					var lit := cu < -0.08 and v > -0.3 and absf(cu) > w - 0.13
					_dot(px, py, bone if edge else (C[2] if fold else (C[4] if lit else C[3])))
					continue
				# the blade, out over it: inside one disc and outside another, its point hooking down on the far side
				var dO := sqrt((u + 0.12) * (u + 0.12) + (v - 0.14) * (v - 0.14))
				var dI := sqrt((u - 0.06) * (u - 0.06) + (v - 0.36) * (v - 0.36))
				if dO <= 0.98 and dI >= 0.86 and v < 0.26 and u < 0.62:
					_dot(px, py, ((C[5] if flare > 0.0 else Color("#fffaf0")) if dI - 0.86 < 0.07 else (C[4] if dI - 0.86 < 0.14 else (C[2] if 0.98 - dO < 0.06 else C[3]))))
					continue
				# its haft, down from the blade's heel past the cowl
				var dh := _seg_d(u, v, 0.56, -0.48, 0.88, 0.82)
				if dh < 0.055:
					_dot(px, py, C[4] if dh < 0.022 else C[2])
		# wisps of dusk curling up off its rim
		for i in 7:
			var an := (i / 7.0) * TAU + 0.4
			var bx := cx + cos(an) * rx
			var by := cy + sin(an) * ry
			var ph := fmod(t * 0.7 + _h(i, seed, 20), 1.0)
			for s2 in 10:
				var nx := bx + sin(ph * 6.0 + s2 * 0.6 + i) * 2.0
				var ny := by - s2 * 1.3 - ph * 4.0
				if _dith(nx, ny, (1.0 - s2 / 10.0) * burn * 0.9):
					_dot(nx, ny, C[3] if s2 < 3 else C[2])
		return
	# in the air: the blade rising up out of the mark through the one it takes, sweeping up, the arc of it smeared behind
	if taken < 0.0 or taken > 0.55:
		return
	var vm = _live(a, 0)
	var vx: float
	var vy: float
	if vm != null:
		vx = _sx(vm["x"], vm["y"])
		vy = _sy(vm["x"], vm["y"])
	elif a["part"] == "mark":
		vx = _sx(a["x1"], a["y1"])
		vy = _sy(a["x1"], a["y1"])
	else:
		vx = cx
		vy = cy
	var k := _ease_out(taken / 0.2)
	var fade := _c01(1.0 - (taken - 0.2) / 0.35)
	var ang := PI * 0.62 - k * PI * 0.95
	var R := 26.0
	_smear(vx - 4.0, vy - 2.0, R - 4.0, R - 4.0, PI * 0.62, ang, 5, C, 0.0, fade)
	var bx := vx - 4.0 + cos(ang) * (R - 10.0)
	var by := vy - 2.0 + sin(ang) * (R - 10.0)
	_crescent(_ri(bx), _ri(by), 11, ang + PI / 2.0, 5.0, C, fade)


## (the mark's two lines of bone light, cut by hand, never ruled: cullBehind's ring)
func _mark_ring(cx: float, cy: float, rx: float, ry: float, k: float, c: Color, under: Color, burn: float, seed: int) -> void:
	var n := _ri(rx * k * 7.0)
	for i in n:
		var an := (float(i) / n) * TAU
		var wob := 1.0 + (_vn(i * 0.09, k * 7.0, seed) - 0.5) * 0.05
		var px := cx + cos(an) * rx * k * wob
		var py := cy + sin(an) * ry * k * wob
		if burn < 1.0 and not _dith(px, py, burn):
			continue
		_dot(px, py + 1, under)
		_dot(px, py, c)


## On a monster: while the hero is low its blows flare: it burns with the enemy's fire (cullAura), and its blow on him bursts
## (cullMonster).
func _cull_monster(a: Dictionary) -> void:
	var m = _mon(a["ids"][0] if not a["ids"].is_empty() else null, true)
	if m == null:
		return
	var t: float = a["t"]
	var seed: int = a["seed"]
	if a["part"] == "" and not m["dead"]:
		_cull_aura(m, 1.0, t, seed)
	var h: Dictionary = view["hero"]
	var mx := _sx(m["x"], m["y"])
	var my := _sy(m["x"], m["y"])
	var top: float = m["top"]
	var F := _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[4], ENEMY[5], Color("#fff2c8")])
	var hx := _sx(h["x"], h["y"])
	var hy := _sy(h["x"], h["y"], 16.0)
	var way := -1.0 if hx < mx else 1.0
	var since := t - 0.05
	if t < 0.35:
		var fade := _c01(1.0 - since / 0.3)
		var a0 := -0.1 if way < 0.0 else -PI + 0.1
		var a1 := -PI + 0.1 if way < 0.0 else -0.1
		_smear((mx + hx) / 2.0, minf(my - top * 0.6, hy) + 4.0, absf(mx - hx) / 2.0 + 6.0, 14.0, a0, a1, 5, F, 0.0, fade)
	if since > 0.0 and since < 0.3:
		var k := 1.0 - since / 0.3
		_star(hx, hy, 6.0 + 11.0 * k, F, seed, 10)


## A monster with Culling while he is low: the enemy's fire licking up round its feet and its sides, its eyes flaring; `hot` how
## kindled (cullAura).
func _cull_aura(m: Dictionary, hotk: float, t: float, seed: int) -> void:
	if hotk <= 0.0:
		return
	var mx := _sx(m["x"], m["y"])
	var my := _sy(m["x"], m["y"])
	var top: float = m["top"]
	var F := _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[4], ENEMY[5], Color("#fff2c8")])
	for i in 5:
		var px := mx - 9.0 + i * 4.5
		_flame(px, my + 1.0, (8.0 + _h(i, seed, 2) * 9.0 + (4.0 if i == 0 or i == 4 else 0.0)) * hotk, 6.0 * maxf(0.5, hotk), F, seed + i, t)
	if hotk > 0.5:
		_dot(mx - 2, my - top + 6, ENEMY[5])
		_dot(mx + 1, my - top + 6, ENEMY[5])
		_glint(mx - 2, my - top + 6, 1, ENEMY[4], ENEMY[5])


# =====================================================================================================================
# SURGING

## A shockwave on the floor at radius r (tiles): its front a broken edge of white-blue light, a band of churned dust rolling
## behind it, grit flung on ahead, crackles of the storm along it; only the half behind (`back`) or before the figures (shock).
func _shock(cx: float, cy: float, r: float, C: PackedColorArray, fade: float, seed: int, t: float, back: bool) -> void:
	var rx := r * RX
	var ry := r * RY
	# the dust churned up behind its front, rolling outward
	var puffs := maxi(8, _ri(r * 9.0))
	for i in puffs:
		var an := (float(i) / puffs) * TAU + _h(i, seed, 1) * 0.3
		if (sin(an) < 0.0) != back:
			continue
		_mist(cx + cos(an) * rx * 0.84, cy + sin(an) * ry * 0.84 - 3.0, 6.0 + r * 1.8, 2.5 + r * 0.9, DUSK_DUST, 1.0 * fade, seed + i, t, 0.3)
	# its front: two pixels deep, white at its edge, broken where the force is less
	var n := maxi(24, _ri(rx * 7.0))
	for i in n:
		var an := (float(i) / n) * TAU
		if (sin(an) < 0.0) != back:
			continue
		var bright := _vn(i * 0.12, t * 4.0, seed)
		if bright < 0.22:
			continue
		var px := cx + cos(an) * rx
		var py := cy + sin(an) * ry
		if fade < 1.0 and not _dith(px, py, fade):
			continue
		_dot(px, py, C[5] if bright > 0.5 else C[4])
		_dot(px - cos(an) * 1.1, py - sin(an) * 0.7, C[4])
		_dot(px - cos(an) * 2.2, py - sin(an) * 1.4, C[3])
		if bright > 0.6:
			_dot(px, py - 1, C[5])
	# grit flung on ahead of it
	for i in 22:
		var an := _h(i, seed, 3) * TAU
		if (sin(an) < 0.0) != back:
			continue
		var d := r + 0.12 + _h(i, seed, 4) * 0.4
		var px := cx + cos(an) * d * RX
		var py := cy + sin(an) * d * RY - _h(i, seed, 5) * 5.0
		_streak(px - cos(an) * 6.0, py - sin(an) * 3.0, px, py, _pc([DUST[0], DUST[1], DUST[2], DUST[3]]), 1, 0.0, fade)
	# crackles of the storm running along its front
	for i in 7:
		var an0 := _h(i, seed + int(floorf(t * 20.0)), 6) * TAU
		if (sin(an0) < 0.0) != back:
			continue
		var px := cx + cos(an0) * rx
		var py := cy + sin(an0) * ry - 1.0
		for s in range(1, 7):
			var an := an0 + (s * 3.2) / maxf(rx, 8.0)
			var nx := cx + cos(an) * rx + (_h(s, i, seed + 7) - 0.5) * 3.0
			var ny := cy + sin(an) * ry - 1.0 - _h(s, i, seed + 8) * 3.0
			_streak(px, py, nx, ny, _pc([C[4], C[5]]), 1)
			px = nx
			py = ny


## In front, every third use: a ring of force bursting out round him (surgeFront).
func _surge_front(a: Dictionary, floor: bool, C = null) -> void:
	if C == null:
		C = RAMP["surging"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var k := t / T_SURGE
	if k >= 1.3:
		return
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var r := float(a["r"]) * _ease_out(minf(1.0, k))
	var fade := _c01(1.3 - k)
	_shock(cx, cy, maxf(0.15, r), C, fade, seed, t, floor)
	if floor:
		# the floor round his feet lit by the burst, fading: a scatter of light, thicker near him
		var rr := minf(r, 0.9)
		for i in 90:
			var an := _h(i, seed, 23) * TAU
			var d := _h(i, seed, 24) * rr
			var px := cx + cos(an) * d * RX
			var py := cy + sin(an) * d * RY
			if _dith(px, py, (1.0 - k) * (1.0 - d / maxf(0.01, rr)) * 0.9):
				_dot(px, py, C[4] if d < rr * 0.4 else C[3])
		return
	# the burst at his feet: rays of the storm's light
	if k < 0.5:
		var q := k / 0.5
		for i in 12:
			var an := (i / 12.0) * TAU + _h(i, seed, 11) * 0.4
			var L0 := 5.0 + q * 12.0
			var L1 := L0 + (5.0 + _h(i, seed, 12) * 6.0) * (1.0 - q)
			_streak(cx + cos(an) * L0, cy - 8.0 + sin(an) * L0 * 0.55, cx + cos(an) * L1, cy - 8.0 + sin(an) * L1 * 0.55, _pc([C[3], C[4], C[5]]), 1 if i % 2 else 2, 0.0, 1.0 - q)


## Behind: his dodge lets out a surge: a burst where he left the floor, and a wake of wind along his roll (surgeBehind).
func _surge_behind(a: Dictionary, floor: bool) -> void:
	var C: PackedColorArray = RAMP["surging"]
	_surge_front(a, floor, C)
	if floor:
		return
	var t: float = a["t"]
	var seed: int = a["seed"]
	var x0 := _sx(a["x"], a["y"])
	var y0 := _sy(a["x"], a["y"])
	var x1 := _sx(a["x1"], a["y1"])
	var y1 := _sy(a["x1"], a["y1"])
	var fade := _c01(1.0 - t / 0.55)
	var len := sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
	# (no roll to follow, no wind: never a tick left standing where he stood)
	if len < 8.0:
		return
	var ux := (x1 - x0) / len
	var uy := (y1 - y0) / len
	# streaks of wind along the way he rolled, curling up at their ends
	for i in 6:
		var off := (i - 2.5) * 4.0 + (_h(i, seed, 1) - 0.5) * 2.0
		var z := 3.0 + (i % 3) * 7.0
		var s0 := len * (0.02 + _h(i, seed, 2) * 0.15 + (1.0 - fade) * 0.5)
		var s1 := len * (0.65 + _h(i, seed, 3) * 0.3)
		if s1 <= s0:
			continue
		var ax := x0 + ux * s0 - uy * off
		var ay := y0 + uy * s0 + ux * off * 0.5 - z
		var bx := x0 + ux * s1 - uy * off
		var by := y0 + uy * s1 + ux * off * 0.5 - z
		_streak(ax, ay, bx, by, _pc([C[2], C[3], C[4], C[5]]), 1 if i % 2 else 2)
		_streak(bx, by, bx + ux * 3.0, by - 3.0, _pc([C[4], C[5]]), 1)
	# dust kicked off the floor to either side of it
	for i in 8:
		var s := (0.1 + 0.8 * _h(i, seed, 4)) * len
		var sd := 1.0 if i % 2 == 0 else -1.0
		var px := x0 + ux * s - uy * sd * (5.0 + t * 24.0)
		var py := y0 + uy * s + ux * sd * (3.0 + t * 12.0) - 2.0
		_mist(px, py, 5.0, 3.0, DUSK_DUST, 1.0 * fade, seed + i, t, 0.4)


## On a monster: a warning ring on the floor, pink, filling; then its shockwave, in the enemy's colours (surgeMonster).
func _surge_monster(a: Dictionary, floor: bool) -> void:
	var m = _live(a, 0)
	var cx := _sx(m["x"], m["y"]) if m != null else _sx(a["x"], a["y"])
	var cy := _sy(m["x"], m["y"]) if m != null else _sy(a["x"], a["y"])
	var C := ENEMY
	var t: float = a["t"]
	var seed: int = a["seed"]
	var R: float = a["r"]
	var part: String = a["part"]
	var pts: Array = a["pts"]
	var warn := (float(pts[0]) if not pts.is_empty() else T_WARN) if part == "warn" else T_WARN
	var wave := t if part == "wave" else (-1.0 if part == "warn" else t - warn)
	var ring_fade := 0.0 if part == "wave" else ((_c01((float(a["dur"]) - t) / 0.15) if part == "warn" else 1.0) if wave < 0.0 else _c01(1.0 - wave / 0.35))
	if floor and ring_fade > 0.0:
		# the ring: a band of pink light burned on the floor where the wave will reach, beating faster as it comes
		var k := _c01(t / warn)
		var beat := 0.75 + 0.25 * sin(t * (6.0 + 18.0 * k))
		# inside it the floor smoulders, more as it fills
		for i in 220:
			var an := _h(i, seed, 21) * TAU
			var d := sqrt(_h(i, seed, 22)) * R * 0.97
			var px := cx + cos(an) * d * RX
			var py := cy + sin(an) * d * RY
			if _dith(px, py, 0.55 * k * ring_fade):
				_dot(px, py, C[3] if d > R * 0.8 else C[2])
		var n := _ri(R * RX * 7.0)
		for i in n:
			var an := (float(i) / n) * TAU
			var wob := 1.0 + (_vn(i * 0.1, 3.0, seed) - 0.5) * 0.05
			var px := cx + cos(an) * R * RX * wob
			var py := cy + sin(an) * R * RY * wob
			if ring_fade * beat < 1.0 and not _dith(px, py, ring_fade * beat + 0.2):
				continue
			_dot(px, py - 1, C[3])
			_dot(px, py, C[4])
			_dot(px, py + 1, C[2])
			if i % 18 == 0:
				# barbs pointing in
				_streak(px, py, px - cos(an) * 4.0, py - sin(an) * 2.0, _pc([C[2], C[3], C[4]]), 1)
	if wave >= 0.0:
		var fake := a.duplicate()
		fake["t"] = wave
		fake["r"] = R
		_surge_front(fake, floor, _pc([C[0], C[1], C[2], C[3], C[4], C[5]]))
	elif not floor and m != null:
		# it gathers: sparks of pink crackling round it
		var top: float = m["top"]
		for i in 5:
			var an := _h(i, seed + int(floorf(t * 15.0)), 3) * TAU
			var px := cx + cos(an) * 9.0
			var py := cy - top * 0.5 + sin(an) * 11.0
			for s in 5:
				var nx := px + (_h(s, i, seed) - 0.5) * 5.0
				var ny := py + (_h(s, i, seed + 1) - 0.5) * 5.0
				_streak(px, py, nx, ny, _pc([C[4], C[5]]), 1)
				px = nx
				py = ny


# =====================================================================================================================
# PLUNDERING

## In front: coins spray from the kill, spinning up and falling, an extra piece thrown with them sometimes (plunderFront).
func _plunder_front(a: Dictionary, floor: bool) -> void:
	var C: PackedColorArray = RAMP["plundering"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var n := 16
	for i in n:
		var an := (float(i) / n) * TAU + _h(i, seed, 1) * 0.6
		var sp := 22.0 + _h(i, seed, 2) * 30.0
		var vz := 80.0 + _h(i, seed, 3) * 70.0
		var tt := maxf(0.0, t - _h(i, seed, 4) * 0.06)
		var land := (2.0 * vz) / 300.0
		var t1 := minf(tt, land)
		var px := cx + cos(an) * sp * t1
		var py := cy + sin(an) * sp * t1 * 0.5
		var z := 10.0 + vz * t1 - 150.0 * t1 * t1
		if tt >= land:
			if floor:
				_coin(px, py, 0.0, C, true)
		elif not floor:
			# a short trail of glints behind it
			for k in range(1, 3):
				var tb := maxf(0.0, t1 - k * 0.025)
				var bz := 10.0 + vz * tb - 150.0 * tb * tb
				_dot(cx + cos(an) * sp * tb, cy + sin(an) * sp * tb * 0.5 - bz, C[3] if k == 1 else C[2])
			_coin(px, py - z, tt * 16.0 + i, C)
	if floor:
		return
	# the extra piece: a ring with a red stone, thrown higher, turning (when there is one)
	var pts: Array = a["pts"]
	if pts.is_empty() or float(pts[0]) != 0.0:
		var tt := t
		var vz := 130.0
		var land := (2.0 * vz) / 300.0
		var t1 := minf(tt, land)
		var px := _ri(cx - 34.0 * t1)
		var py := cy + 8.0 * t1
		var y := _ri(py - (12.0 + vz * t1 - 150.0 * t1 * t1))
		_dot(px - 1, y - 2, C[5], 3, 1)
		_dot(px - 2, y - 1, C[4])
		_dot(px + 2, y - 1, C[3])
		_dot(px - 2, y, C[3])
		_dot(px + 2, y, C[2])
		_dot(px - 1, y + 1, C[2], 3, 1)
		_dot(px - 1, y - 4, Color("#800818"), 3, 2)
		_dot(px, y - 4, Color("#d0182c"))
		_dot(px - 1, y - 4, Color("#ff8a7a"))
		if tt < land:
			_glint(px + 3, y - 5, 2, C[4], C[5])
	# the burst as it falls: glints of brass
	if t < 0.25:
		var q := t / 0.25
		for i in 6:
			var an := (i / 6.0) * TAU + seed
			_glint(cx + cos(an) * (4.0 + q * 12.0), cy - 10.0 + sin(an) * (3.0 + q * 7.0), 2 if q < 0.5 else 1, C[4], C[5])


## Behind: gold bursts from the kill and flies in a stream into his purse, glinting where it goes in (plunderBehind).
func _plunder_behind(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["plundering"]
	var h: Dictionary = view["hero"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"], 8.0)
	var hx := _sx(h["x"], h["y"])
	var hy := _sy(h["x"], h["y"], 12.0)
	var mx := (cx + hx) / 2.0
	var my := minf(cy, hy) - 28.0
	var n := 12
	for i in n:
		var t0 := i * 0.04
		var u := (t - t0) / T_PURSE
		if u < 0.0:
			continue
		if u >= 1.0:
			# in: a glint at his belt
			var since := (u - 1.0) * T_PURSE
			if since < 0.12:
				_glint(hx + (i % 3) - 1, hy, 3, C[4], C[5])
			continue
		# each coin on its own arc, a little apart, a streak of brass behind it
		var q := _smooth(u)
		var spread := (_h(i, seed, 1) - 0.5) * 16.0
		var p: Array = _quad(cx, cy, mx + spread, my + spread * 0.5, hx, hy, q)
		var b: Array = _quad(cx, cy, mx + spread, my + spread * 0.5, hx, hy, maxf(0.0, q - 0.1))
		_streak(b[0], b[1], p[0], p[1], _pc([C[1], C[2], C[3], C[4]]), 1, 0.0, 0.9)
		_coin(p[0], p[1], t * 18.0 + i * 1.3, C)
	# the burst out of the kill
	if t < 0.3:
		var q := t / 0.3
		for i in 7:
			var an := (i / 7.0) * TAU
			var r := 3.0 + q * 12.0
			_coin(cx + cos(an) * r, cy + sin(an) * r * 0.6 - q * 6.0, t * 20.0 + i, C)
		_star(cx, cy, 4.0 + 5.0 * (1.0 - q), _pc([C[1], C[2], C[3], C[4], C[5]]), seed, 6)
	# his purse at his belt, swelling with it
	if t > T_PURSE * 0.8:
		_dot(hx - 2, hy - 1, C[3], 4, 3)
		_dot(hx - 1, hy - 1, C[5], 2, 1)
		_glint(hx + 3, hy - 3, 1, C[4], C[5])


## On a monster: its blow snatches coins off the hero, pulled to it on hooks of the enemy's light (plunderMonster).
func _plunder_monster(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["plundering"]
	var m = _live(a, 0)
	if m == null:
		return
	var h: Dictionary = view["hero"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var hx := _sx(h["x"], h["y"])
	var hy := _sy(h["x"], h["y"], 14.0)
	var mx := _sx(m["x"], m["y"])
	var my := _sy(m["x"], m["y"], 12.0)
	var n := 8
	for i in n:
		var u := (t - 0.04 - i * 0.025) / 0.4
		if u < 0.0:
			continue
		if u >= 1.0:
			var since := (u - 1.0) * 0.4
			if since < 0.15:
				_glint(mx + (i % 3) - 1, my + (i % 2), 2, ENEMY[4], ENEMY[5])
			continue
		var q := _smooth(u)
		var up := 22.0 + _h(i, seed, 1) * 22.0
		var side := (_h(i, seed, 2) - 0.5) * 26.0
		var ctlx := (hx + mx) / 2.0 + side
		var ctly := minf(hy, my) - up
		var p: Array = _quad(hx, hy, ctlx, ctly, mx, my, q)
		# the hook of pink light that has it: a thread trailing back the way it was torn, curled round the coin at its end
		var b: Array = _quad(hx, hy, ctlx, ctly, mx, my, maxf(0.0, q - 0.18))
		_streak(b[0], b[1], p[0], p[1], _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[4]]), 2, 0.0, 0.95)
		var w := 1.0 if mx > hx else -1.0
		_dot(p[0] + w * 3.0, p[1] - 2.0, ENEMY[4])
		_dot(p[0] + w * 3.0, p[1] - 1.0, ENEMY[4])
		_dot(p[0] + w * 3.0, p[1], ENEMY[3])
		_dot(p[0] + w * 2.0, p[1] + 1.0, ENEMY[3])
		_coin(p[0], p[1], t * 20.0 + i, C)
	# the blow on him: a burst of the enemy's light
	if t < 0.25:
		var k := 1.0 - t / 0.25
		_star(hx, hy, 4.0 + 7.0 * k, _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[4], ENEMY[5]]), seed, 8)
	# in it, the coins it has: glinting at its belt (the rules' stolen: stolenBelt)
	if t > 0.3 and not float(m["stolen"]) > 0.0:
		_stolen_belt(m, t)


## One carrying his stolen gold (monster.gd stolen): his coins at its belt, clinking, glinting pink and gold (stolenBelt).
func _stolen_belt(m: Dictionary, t: float) -> void:
	var C: PackedColorArray = RAMP["plundering"]
	var mx := _sx(m["x"], m["y"])
	var my := _sy(m["x"], m["y"], 12.0)
	var id: int = m["id"]
	var jig := 1.0 if sin(t * 14.0 + id) > 0.6 else 0.0
	_coin(mx - 2.0, my + 1.0 - jig, t * 3.0, C)
	_coin(mx + 2.0, my + 2.0, 1.2 + t * 2.0, C)
	if sin(t * 9.0 + id) > 0.3:
		_glint(mx, my - 1.0, 1, ENEMY[4], ENEMY[5])


## It dies carrying his gold: the coins burst out of it, spinning, and scatter on the floor (plunderDrop).
func _plunder_drop(a: Dictionary, floor: bool) -> void:
	var C: PackedColorArray = RAMP["plundering"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var cx := _sx(a["x"], a["y"])
	var cy := _sy(a["x"], a["y"])
	var n := 10
	for i in n:
		var an := (float(i) / n) * TAU + _h(i, seed, 1) * 0.6
		var sp := 16.0 + _h(i, seed, 2) * 22.0
		var vz := 70.0 + _h(i, seed, 3) * 60.0
		var tt := maxf(0.0, t - 0.05)
		var land := (2.0 * vz) / 300.0
		var t1 := minf(tt, land)
		var px := cx + cos(an) * sp * t1
		var py := cy + sin(an) * sp * t1 * 0.5
		var z := 12.0 + vz * t1 - 150.0 * t1 * t1
		var fade := _c01((float(a["dur"]) - t) / 0.6)
		if tt >= land:
			if floor and _dith(px, py, fade, seed + i):
				_coin(px, py, 0.0, C, true)
		elif not floor:
			_coin(px, py - z, tt * 16.0 + i, C)
	if not floor and t < 0.15:
		_star(cx, cy - 12.0, 4.0 + 8.0 * (1.0 - t / 0.15), _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[4], ENEMY[5]]), seed, 8)


# =====================================================================================================================
# MIRRORING

## Where his reflection stands from him (world): beside him, a long step off, on the side of him square to the way he faces that
## is the more ahead of him on the screen (mirrorOffset: the rules' own, last_words.gd mirror_side and MIRRORING.side).
static func mirror_offset(fxw: float, fyw: float) -> Array:
	var l := _hyp(fxw, fyw)
	if l == 0.0:
		l = 1.0
	var ux := fxw / l
	var uy := fyw / l
	var sfx := (ux - uy) * 16.0
	var sfy := (ux + uy) * 8.0
	var ahead := (-uy - ux) * 16.0 * sfx + (-uy + ux) * 8.0 * sfy
	var side := 1.0 if ahead >= 0.0 else -1.0
	var k := float(MIRRORING["side"])
	return [-uy * side * k, ux * side * k]


## In front: his reflection beside him, in glass, making the same swing as he does, its cut landing on those in front of it
## (mirrorFront). (It stands: `Pictures`.)
func _mirror_front(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["mirroring"]
	var h: Dictionary = view["hero"]
	var o := mirror_offset(h["fx"], h["fy"])
	var rx: float = float(h["x"]) + float(o[0])
	var ry: float = float(h["y"]) + float(o[1])
	# its swing is his: when he swings, the way he swings, as far; or, none seen, as it forms
	var born: float = clock - float(a["t"])
	var sw = swing if swing != null and float(swing["at"]) >= born - 0.3 else null
	var since: float = clock - float(sw["at"]) if sw != null else float(a["t"])
	var ang := atan2(float(sw["dy"]), float(sw["dx"])) if sw != null else atan2(float(h["fy"]), float(h["fx"]))
	var reach: float = float(sw["reach"]) if sw != null else 1.5
	_glass_cut(rx, ry, ang, reach, since)
	_glass_hits(rx, ry, ang, reach, since)
	# glints running over the glass of it
	var sx := _sx(rx, ry)
	var sy := _sy(rx, ry, 14.0)
	_glint(sx - 3, sy - 8, 1, C[4])
	_glint(sx + 2, sy + 4, 1, FRIEND[3])


## A swing in glass, the same shape as his (the game's own cut: a crescent on the floor round whoever makes it), made at (x, y)
## about `ang`, `reach` tiles; `since` seconds into it (glassCut).
func _glass_cut(x: float, y: float, ang: float, reach: float, since: float) -> void:
	var C: PackedColorArray = RAMP["mirroring"]
	var k := since / GLASS_CUT
	if k < 0.0 or k >= 1.0:
		return
	var sweep := 2.5
	var from := ang - sweep / 2.0
	var lead := minf(1.0, k * 2.2 + 0.2)
	var tail := maxf(0.0, k * 1.6 - 0.6)
	var sx0 := _sx(x, y)
	var sy0 := _sy(x, y)
	var r := reach * 1.15
	var tip = null
	var u := tail
	while u < lead:
		var an := from + sweep * u
		var edge := (u - tail) / maxf(0.01, lead - tail)
		var mid := 1.0 - absf(u - 0.5) * 2.0
		for band in 5:
			if band > 1.0 + mid * 3.5:
				continue
			var rr := r * (1.02 - band * 0.075)
			var px := x + cos(an) * rr
			var py := y + sin(an) * rr
			# (the part of it beyond the one making it is left out where it stands, as the game leaves his out)
			if px + py < x + y:
				var hdx := _sx(px, py) - sx0
				var hdy := _sy(px, py) - 10.0 - sy0
				if absf(hdx) < 9.0 and hdy > -38.0 and hdy < 2.0:
					continue
			var X := _ri(_sx(px, py))
			var Y := _ri(_sy(px, py)) - 10
			var c: Color = ((C[5] if edge > 0.55 and k < 0.6 else C[4]) if band == 0 else (C[4] if band == 1 else (C[3] if band == 2 else C[2])))
			if k > 0.6 and band > 0:
				c = C[3] if band == 1 else C[2]
			if band > 0 and band < 4 and int(floorf(u * 60.0 + band * 2)) % 9 == 0:
				c = C[5]
			_dot(X, Y, c, 2, 2 if band == 0 else 1)
			if band == 0:
				tip = Vector2(X, Y)
		u += 0.012
	if tip != null and k < 0.75:
		_glint(tip.x + 1, tip.y, 2, FRIEND[3])


## Where a cut in glass lands on those in front of it: a little burst of glass on each as its edge passes (glassHits).
func _glass_hits(x: float, y: float, ang: float, reach: float, since: float) -> void:
	var C: PackedColorArray = RAMP["mirroring"]
	for m: Dictionary in view["monsters"]:
		if m["dead"] or m["spirit"]:
			continue
		var d := _hyp(float(m["x"]) - x, float(m["y"]) - y)
		if d > reach * 1.3 or d < 0.2:
			continue
		var off := atan2(float(m["y"]) - y, float(m["x"]) - x) - ang
		off = atan2(sin(off), cos(off))
		if absf(off) > 1.25:
			continue
		var at := maxf(0.0, ((off + 1.25) / 2.5 - 0.2) / 2.2) * GLASS_CUT
		var hit := since - at
		if hit < 0.0 or hit > 0.14:
			continue
		var mx := _sx(m["x"], m["y"])
		var my := _sy(m["x"], m["y"], float(m["top"]) * 0.5)
		var q := hit / 0.14
		var id: int = m["id"]
		_star(mx, my, 3.0 + 4.0 * (1.0 - q), _pc([C[2], C[3], C[4], C[5]]), id * 13 + 5, 6, 0.4)
		for i in 3:
			var an := ang + (_h(i, id, 7) - 0.5) * 1.6
			_sliver(mx + cos(an) * (3.0 + 22.0 * q), my + sin(an) * (2.0 + 10.0 * q) - 4.0 * q + 30.0 * q * q, an + q * 9.0, 3.0, C)


## The pane's shape: whether (x, y), on the screen, is inside a pane standing at (bx, by), its top at `top`, `Ht` tall
## (mirrorBehind's inside).
static func pane_inside(x: float, y: float, bx: float, top: float, Ht: float) -> bool:
	var Wd := 18.0
	var lean := 4.0
	var v := (y - top) / Ht
	if v < 0.0 or v > 1.0:
		return false
	var half := Wd / 2.0 - (1.0 - v) * 1.5
	var mid := bx + (v - 0.5) * -lean * 0.3
	# its top cut to an arch
	if v < 0.18:
		var u := (x - mid) / half
		if u * u + ((0.18 - v) / 0.18) * ((0.18 - v) / 0.18) > 1.0:
			return false
	return absf(x - mid) <= half


## Behind: a standing pane of mirror where he stood; in it his reflection makes his next attack again; then it cracks and
## shatters (mirrorBehind). (His reflection in it: `Pictures`, _pane_picture.)
func _mirror_behind(a: Dictionary) -> void:
	var C: PackedColorArray = RAMP["mirroring"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var bx := _sx(a["x"], a["y"])
	var by := _sy(a["x"], a["y"])
	var pts: Array = a["pts"]
	var crack := t - T_CAST if a["part"] == "cast" else (t - float(pts[0]) if not pts.is_empty() else -1.0)
	var shatter := crack > T_BREAKING
	if shatter:
		# shattered: its pieces flung out and falling, catching the light
		var since := crack - T_BREAKING
		if since > T_SHATTER:
			return
		for i in 16:
			var an := _h(i, seed, 1) * TAU
			var sp := 30.0 + _h(i, seed, 2) * 40.0
			var px := bx + cos(an) * sp * since
			var py := by - 18.0 + _h(i, seed, 3) * 20.0 - 40.0 * since + 200.0 * since * since
			if py > by + 4.0:
				continue
			_sliver(px, py, an + since * 12.0, 3.0 + _h(i, seed, 4) * 3.0, C)
		return
	var Wd := 18.0
	# (laid: it grows up out of its glass)
	var grow := _ease_out(t / T_PANE) * _c01((float(a["dur"]) - t) / 0.2) if a["part"] == "zone" else 1.0
	if grow <= 0.05:
		return
	var Ht := float(maxi(3, _ri(38.0 * grow)))
	var left := bx - Wd / 2.0
	var top := by - Ht
	# its glass: dark in its depths, a sheen of light slanting across it
	for y in range(int(floorf(top)), int(floorf(by)) + 1):
		if float(y) > by:
			break
		for x in range(int(floorf(left - 2.0)), int(ceilf(left + Wd + 2.0)) + 1):
			if not pane_inside(x, y, bx, top, Ht):
				continue
			var v := (y - top) / Ht
			var band := (x - left) * 0.9 + (y - top) * 0.55
			var sheen := 2 if fmod(band, 17.0) < 2.2 else (1 if fmod(band, 17.0) < 3.5 else 0)
			_dot(x, y, C[mini(4, (1 if v > 0.8 else 2) + sheen)])
	# his reflection in it, making the attack again (his own picture, in glass), held within it
	_pane_picture(bx, by, top, Ht)
	# its edge: a bevel of light, and the friend's cyan glinting along it (it is his)
	for y in range(int(floorf(top)), int(floorf(by)) + 1):
		if float(y) > by:
			break
		for x in range(int(floorf(left - 2.0)), int(ceilf(left + Wd + 2.0)) + 1):
			if not pane_inside(x, y, bx, top, Ht):
				continue
			if not pane_inside(x - 1, y, bx, top, Ht) or not pane_inside(x, y - 1, bx, top, Ht):
				_dot(x, y, FRIEND[3] if (x + y) % 7 == 0 else C[4])
			elif not pane_inside(x + 1, y, bx, top, Ht) or not pane_inside(x, y + 1, bx, top, Ht):
				_dot(x, y, FRIEND[2] if (x + y) % 5 == 0 else C[1])
	# the heap of glass at its foot: shards standing up out of the floor
	for i in 7:
		var px := bx - 9.0 + i * 3 + _h(i, seed, 5) * 2.0
		var tall := 2.0 + _h(i, seed, 6) * 4.0
		var k := 0
		while k < tall:
			_dot(px + ((1.0 if i % 2 else -1.0) if k > tall / 2.0 else 0.0), by + 1 - k, C[5] if k == int(floorf(tall)) - 1 else C[3])
			k += 1
		_dot(px + 1, by + 1, C[1])
	# its attack again: his cut, in glass, the same shape as his, coming out of it and landing (not while it only stands)
	if a["part"] != "zone" and t < GLASS_CUT:
		var ang := atan2(float(a["dy"]), float(a["dx"]))
		var reach: float = float(swing["reach"]) if swing != null else 1.5
		_glass_cut(a["x"], a["y"], ang, reach, t)
		_glass_hits(a["x"], a["y"], ang, reach, t)
	# cracks running through it before it goes
	if crack >= 0.0:
		var k := _c01(crack / 0.3)
		for i in 4:
			var px := bx + (_h(i, seed, 7) - 0.5) * 8.0
			var py := top + Ht * (0.3 + _h(i, seed, 8) * 0.4)
			var s := 0
			while s < 12.0 * k:
				px += (_h(s, i, seed) - 0.5) * 3.0
				py += (_h(s, i, seed + 3) - 0.5) * 3.0
				if pane_inside(px, py, bx, top, Ht):
					_dot(px, py, C[5])
				s += 1


## On a monster: part of the harm he does it comes back at him: it cracks like a mirror where he hit it, then shards of the
## enemy's glass fly back into him (mirrorMonster).
func _mirror_monster(a: Dictionary) -> void:
	var m = _live(a, 0)
	if m == null:
		return
	var h: Dictionary = view["hero"]
	var t: float = a["t"]
	var seed: int = a["seed"]
	var top: float = m["top"]
	var mx := _sx(m["x"], m["y"])
	var my := _sy(m["x"], m["y"], top * 0.5)
	var hx := _sx(h["x"], h["y"])
	var hy := _sy(h["x"], h["y"], 16.0)
	var GL := _pc([Color("#0e050a"), Color("#2a0c1c"), Color("#5a1438"), Color("#ffc8dc"), Color("#ff4f8a"), Color("#ffffff")])
	var beat := T_MIRROR_BEAT
	if t < beat + 0.2:
		var fade := _c01(1.0 - (t - beat) / 0.2)
		var grow := _c01(t / 0.05)
		for i in 7:
			var px := mx
			var py := my
			var an := (i / 7.0) * TAU + _h(i, seed, 9) * 0.5
			var Ln := (4.0 + _h(i, seed, 10) * 5.0) * grow * fade
			var s2 := 0
			while s2 < Ln:
				px += cos(an) + (_h(s2, i, seed + 4) - 0.5) * 0.7
				py += sin(an) * 0.9 + (_h(s2, i, seed + 5) - 0.5) * 0.7
				_dot(px, py, GL[5] if s2 < Ln * 0.6 else GL[3])
				_dot(px + 1, py + 1, GL[4])
				s2 += 1
	# the burst as they leave it
	if t >= beat and t < beat + 0.06:
		_star(mx, my, 4.0 + 4.0 * (1.0 - (t - beat) / 0.06), _pc([ENEMY[2], ENEMY[3], ENEMY[4], ENEMY[5]]), seed + 77, 8)
	var n := 11
	for i in n:
		var u := (t - beat - i * 0.01) / T_SHARDS
		if u < 0.0:
			continue
		var spread := (_h(i, seed, 1) - 0.5) * 26.0
		var up := (_h(i, seed, 2) - 0.4) * 20.0
		if u >= 1.0:
			# in him: a little burst of the enemy's light
			var since := (u - 1.0) * T_SHARDS
			if since < 0.1:
				_star(hx + spread * 0.2, hy + up * 0.2, 4.0, _pc([ENEMY[2], ENEMY[3], ENEMY[4], ENEMY[5]]), seed + i, 6)
			continue
		var q := _ease_out(u)
		var ctlx := (mx + hx) / 2.0 + spread
		var ctly := (my + hy) / 2.0 - 18.0 + up
		var p: Array = _quad(mx, my, ctlx, ctly, hx + spread * 0.2, hy + up * 0.2, q)
		var b: Array = _quad(mx, my, ctlx, ctly, hx + spread * 0.2, hy + up * 0.2, maxf(0.0, q - 0.16))
		_streak(b[0], b[1], p[0], p[1], _pc([ENEMY[1], ENEMY[2], ENEMY[3], ENEMY[4]]), 1, 0.0, 0.8)
		_sliver(p[0], p[1], seed + i * 1.7 + t * 18.0, 5.0 + _h(i, seed, 3) * 4.0, GL)


# =====================================================================================================================
# The hooks fx.gd calls.

## Which layers each look is in (LAYERS).
const LAYERS := {
	"piercing:front": [false, true], "piercing:behind": [true, true], "piercing:monster": [false, true],
	"bleeding:front": [false, true], "bleeding:behind": [true, true], "bleeding:monster": [false, true],
	"reaping:front": [false, true], "reaping:behind": [true, true], "reaping:monster": [true, true],
	"culling:front": [false, true], "culling:behind": [true, true], "culling:monster": [false, true],
	"surging:front": [true, true], "surging:behind": [true, true], "surging:monster": [true, true],
	"plundering:front": [true, true], "plundering:behind": [false, true], "plundering:monster": [true, true],
	"mirroring:front": [false, true], "mirroring:behind": [false, true], "mirroring:monster": [false, true],
}


func _draw_act(a: Dictionary, floor: bool) -> void:
	var key := "%s:%s" % [a["word"], a["side"]]
	var on: Array = LAYERS.get(key, [false, false])
	if not on[0 if floor else 1]:
		return
	match key:
		"piercing:front": _pierce_front(a)
		"piercing:behind": _pierce_behind(a, floor)
		"piercing:monster": _pierce_monster(a)
		"bleeding:front": _bleed_front(a)
		"bleeding:behind": _thorns(a["x"], a["y"], a["r"], a["t"], a["dur"], a["seed"], floor)
		"bleeding:monster": _bleed_monster(a)
		"reaping:front": _reap_front(a)
		"reaping:behind": _reap_behind(a, floor)
		"reaping:monster": _reap_monster(a, floor)
		"culling:front": _cull_front(a)
		"culling:behind": _cull_behind(a, floor)
		"culling:monster": _cull_monster(a)
		"surging:front": _surge_front(a, floor)
		"surging:behind": _surge_behind(a, floor)
		"surging:monster": _surge_monster(a, floor)
		"plundering:front": _plunder_front(a, floor)
		"plundering:behind": _plunder_behind(a)
		"plundering:monster":
			if a["part"] == "drop":
				_plunder_drop(a, floor)
			elif not floor:
				_plunder_monster(a)
		"mirroring:front": _mirror_front(a)
		"mirroring:behind": _mirror_behind(a)
		"mirroring:monster": _mirror_monster(a)


## The rules' zones these words lie in: `thorns` (Bleeding), `reaper` (Culling), `mirror` (Mirroring) (zoneW7).
static func zone_w7(z: Dictionary) -> String:
	var k := str(z.get("look", z.get("kind", "")))
	return k if k == "thorns" or k == "reaper" or k == "mirror" else ""


static func _zone_seed(z: Dictionary) -> int:
	return int(floorf(absf(float(z["x"]) * 97.0 + float(z["y"]) * 131.0))) % 100000


## An act standing for a zone as it lies (its own clock the zone's) (zoneAct).
static func _zone_act(z: Dictionary, word: String, side: String) -> Dictionary:
	return {"id": -1, "word": word, "side": side, "part": "zone", "t": float(z["t"]), "dur": float(z["dur"]), "seed": _zone_seed(z), "x": float(z["x"]), "y": float(z["y"]),
		"x1": float(z["x"]), "y1": float(z["y"]), "dx": 1.0, "dy": 0.0, "ids": [], "pts": [], "r": float(z["r"]), "delay": 0.0, "width": 1.0, "stone": false,
		"dieT": 0.0, "rules": false, "whole": false}


## A mirror rises where he stood only once he has stepped off it, and clear of it: the zone's time when he was first clear of it
## (0 when he never stood on it), or -1 while he is still there (paneUp).
func _pane_up(z: Dictionary) -> float:
	var h: Dictionary = view["hero"]
	var dx: float = float(h["x"]) - float(z["x"])
	var dy: float = float(h["y"]) - float(z["y"])
	var sdx := (dx - dy) * 16.0
	var sdy := (dx + dy) * 8.0
	var clear := sqrt(dx * dx + dy * dy) > T_PANE_CLEAR and (absf(sdx) >= 24.0 or sdy >= 40.0 or sdy < 0.0)
	var key: String = z["key"]
	var up = panes.get(key)
	if up == null:
		up = 0.0 if clear else -1.0
		panes[key] = up
		if clear:
			sounds.append("mirror_rise")
	if float(up) < 0.0 and clear:
		up = float(z["t"])
		panes[key] = up
		# (the pane begins to grow up now: its sound's moment, which only the picture knows)
		sounds.append("mirror_rise")
	return float(up)


## Whether an act of this word's is already at work where a zone lies (takenOver).
func _taken_over(z: Dictionary, word: String, part: String) -> bool:
	for a: Dictionary in acts:
		if a["word"] == word and a["part"] == part and _hyp(float(a["x"]) - float(z["x"]), float(a["y"]) - float(z["y"])) < 0.6:
			return true
	return false


func _draw_zones(floor: bool) -> void:
	for z: Dictionary in view["zones"]:
		var k := zone_w7(z)
		if k == "" or (floor and _off(_sx(z["x"], z["y"]), _sy(z["x"], z["y"]), float(z["r"]) + 2.0)):
			continue
		if k == "thorns":
			_thorns(z["x"], z["y"], z["r"], z["t"], z["dur"], _zone_seed(z), floor)
		elif k == "reaper" and not _taken_over(z, "culling", "mark"):
			_cull_behind(_zone_act(z, "culling", "behind"), floor)
		elif k == "mirror" and not floor and not _taken_over(z, "mirroring", "cast"):
			var up := _pane_up(z)
			if up < 0.0:
				continue
			var a := _zone_act(z, "mirroring", "behind")
			a["t"] = float(z["t"]) - up
			a["dur"] = float(z["dur"]) - up
			_mirror_behind(a)


## What lasts on those the words touch: the bleeding, his gold carried off, a monster with Culling while he is low (drawStates).
func _draw_states(floor: bool) -> void:
	_draw_bleeding(floor)
	if floor:
		return
	for m: Dictionary in view["monsters"]:
		if m["dead"]:
			continue
		if float(m["stolen"]) > 0.0:
			_stolen_belt(m, clock)
		var hk: float = hot.get(int(m["id"]), 0.0)
		if hk > 0.0:
			_cull_aura(m, hk, clock, int(m["id"]) * 7 + 3)


## Under the figures (floorW7).
func draw_floor(c: CanvasItem) -> void:
	_paint(c, true)


## Over the figures, over the dark (airW7).
func draw_air(c: CanvasItem) -> void:
	_paint(c, false)


## Whether what lies at (sx, sy) on the screen, `r` tiles round, is wholly off it, by a margin. Never while the check lays its
## dots.
func _off(sx: float, sy: float, r: float) -> bool:
	if fx == null or _rec != null or view.is_empty():
		return false
	var H: Dictionary = view["hero"]
	var hx := _sx(H["x"], H["y"])
	var hy := _sy(H["x"], H["y"])
	return absf(sx - hx) > 280.0 + r * RX or absf(sy - hy) > 200.0 + r * RY


## (the dots of each layer as last painted, and when; and its pictures laid among them (his reflection in a mirror): each layer
## is painted afresh 30 times a second, or at once when a moment begins; between, the same is drawn again)
var _pts := PackedVector2Array()
var _cols := PackedColorArray()
var _segs: Array = []
var _kept := [null, null]
var _kept_at := [-1.0, -1.0]
var _kept_n := [-1, -1]
const REPAINT := 1.0 / 30.0


## (the dots laid so far, as one of the layer's pieces, before a picture laid over them)
func _flush() -> void:
	if not _pts.is_empty():
		_segs.append([_pts, _cols])
	_pts = PackedVector2Array()
	_cols = PackedColorArray()


func _paint(c: CanvasItem, floor: bool) -> void:
	if view.is_empty():
		return
	var k := 0 if floor else 1
	if _rec == null and _kept[k] != null and clock >= float(_kept_at[k]) and clock < float(_kept_at[k]) + REPAINT - 1e-6 and int(_kept_n[k]) == _next:
		_draw_segs(c, _kept[k])
		return
	_pts = PackedVector2Array()
	_cols = PackedColorArray()
	_segs = []
	_draw_zones(floor)
	_draw_states(floor)
	for a: Dictionary in acts:
		if not floor or not _off(_sx(a["x"], a["y"]), _sy(a["x"], a["y"]), float(a["r"]) + 2.0):
			_draw_act(a, floor)
	if _rec != null:
		return
	_flush()
	_kept[k] = _segs
	_kept_at[k] = clock
	_kept_n[k] = _next
	_draw_segs(c, _segs)


func _draw_segs(c: CanvasItem, segs: Array) -> void:
	for s in segs:
		if s is Array:
			c.draw_multiline_colors(s[0], s[1], 2.0)
		else:
			c.draw_texture_rect(s["tex"], s["rect"], false, s["mod"])


## Light: where these light the dark (lightsW7), as [screen x, y (game pixels), radius, strength].
func spots() -> Array:
	var out: Array = []
	if view.is_empty():
		return out
	for a: Dictionary in acts:
		var x := _sx(a["x"], a["y"])
		var y := _sy(a["x"], a["y"])
		var x1 := _sx(a["x1"], a["y1"])
		var y1 := _sy(a["x1"], a["y1"])
		var fade := _c01((float(a["dur"]) - float(a["t"])) / 0.4)
		if a["word"] == "piercing" and a["side"] == "behind":
			out.append([(x + x1) / 2.0, (y + y1) / 2.0, 50.0, 0.8 * fade])
		elif a["word"] == "piercing" and a["part"] != "pass":
			out.append([(x + x1) / 2.0, (y + y1) / 2.0 - 14.0, 60.0, 0.6 * fade])
		elif a["word"] == "surging" or a["word"] == "culling":
			out.append([x, y - 4.0, 30.0 + float(a["r"]) * 22.0, 0.7 * fade])
		else:
			out.append([x, y - 10.0, 36.0, 0.6 * fade])
	for z: Dictionary in view["zones"]:
		var k := zone_w7(z)
		if k == "":
			continue
		# (a mirror lights only once it has risen)
		var up := _pane_up(z) if k == "mirror" else 0.0
		if up < 0.0:
			continue
		var fade := _c01((float(z["t"]) - up) / 0.25) * _c01((float(z["dur"]) - float(z["t"])) / 0.4)
		out.append([_sx(z["x"], z["y"]), _sy(z["x"], z["y"]) - (18.0 if k == "mirror" else 4.0), 34.0 if k == "mirror" else 30.0 + float(z["r"]) * 20.0, (0.5 if k == "thorns" else 0.7) * fade])
	return out


func lights() -> void:
	if fx == null or fx.look == null or not is_instance_valid(fx.look):
		return
	for s: Array in spots():
		fx.look.spot(Vector2(s[0], s[1]), s[2], s[3])


## The sounds of moments only the pictures know, since last asked (soundsW7): a mirror's pane beginning to grow up.
func take_sounds() -> Array:
	var said := sounds
	sounds = []
	return said


# =====================================================================================================================
# The clock (tickW7), and what the rules said happened (eventsW7).

## A look begins (playW7).
func play(word: String, side: String, o: Dictionary) -> Dictionary:
	var a := {
		"id": _next, "word": word, "side": side, "part": str(o.get("part", "")), "t": float(o.get("t", 0.0)), "dur": float(o.get("dur", 2.0)),
		"seed": int(o.get("seed", randi() % 1000000)), "x": float(o.get("x", 0.0)), "y": float(o.get("y", 0.0)),
		"x1": float(o.get("x1", o.get("x", 0.0))), "y1": float(o.get("y1", o.get("y", 0.0))), "dx": float(o.get("dx", 1.0)), "dy": float(o.get("dy", 0.0)),
		"ids": (o.get("ids", []) as Array).duplicate(), "pts": (o.get("pts", []) as Array).duplicate(), "r": float(o.get("r", 1.0)),
		"delay": float(o.get("delay", T_LANCE_WAIT)), "width": float(o.get("width", 1.0)), "stone": bool(o.get("stone", false)),
		"dieT": float(o.get("dieT", 0.0)), "rules": bool(o.get("rules", false)), "whole": bool(o.get("whole", false)),
	}
	if o.has("fallTop"):
		a["fallTop"] = float(o["fallTop"])
	_next += 1
	acts.append(a)
	return a


## A frame: the rules' state read, the looks' clock moved on.
func update(dt: float) -> void:
	read()
	_lifted = fx != null and bool(fx.get("_lifted"))
	if not view.is_empty():
		tick(dt)
		_pics_tick(dt)


## tickW7.
func tick(dt: float) -> void:
	clock += dt
	for i in range(acts.size() - 1, -1, -1):
		var a: Dictionary = acts[i]
		a["t"] += dt
		if a["t"] >= a["dur"]:
			acts.remove_at(i)
	# the bleeding: where they walk, a splash every so far (twice as often walking), and one now and then where they stand
	for sp: Dictionary in splashes:
		sp["age"] += dt
	while not splashes.is_empty() and float(splashes[0]["age"]) > T_SPLASH:
		splashes.pop_front()
	var bl: Array = []
	for m: Dictionary in view["monsters"]:
		if not m["dead"] and float(m["bleedT"]) > 0.0:
			bl.append({"id": int(m["id"]), "x": float(m["x"]), "y": float(m["y"]), "hero": false})
	var h: Dictionary = view["hero"]
	if float(h["heroBleedT"]) > 0.0:
		bl.append({"id": -1, "x": float(h["x"]), "y": float(h["y"]), "hero": true})
	var now := {}
	for b: Dictionary in bl:
		var id: int = b["id"]
		now[id] = true
		var was = bleeders.get(id)
		if was == null:
			bleeders[id] = {"x": b["x"], "y": b["y"], "since": 0.0}
			continue
		var mdx: float = float(b["x"]) - float(was["x"])
		var mdy: float = float(b["y"]) - float(was["y"])
		var moved := sqrt(mdx * mdx + mdy * mdy)
		if moved >= 0.2:
			# walking: a splash every fifth of a tile, drawn out the way it went
			var ex := (mdx - mdy) / moved
			var ey := (mdx + mdy) / moved
			var el := sqrt(ex * ex + ey * ey)
			if el == 0.0:
				el = 1.0
			splashes.append({"x": b["x"], "y": b["y"], "age": 0.0, "size": 1.0 + randf() * 1.2, "seed": randi() % 100000, "ex": ex / el, "ey": ey / el, "hero": b["hero"]})
			bleeders[id] = {"x": b["x"], "y": b["y"], "since": -0.4}
		else:
			was["since"] = float(was["since"]) + dt
			if float(was["since"]) >= 0.8:
				splashes.append({"x": float(b["x"]) + (randf() - 0.5) * 0.25, "y": float(b["y"]) + (randf() - 0.5) * 0.25, "age": 0.0, "size": 0.8 + randf(), "seed": randi() % 100000, "ex": 1.0, "ey": 0.0, "hero": b["hero"]})
				was["since"] = 0.0
	for id in bleeders.keys():
		if not now.has(id):
			bleeders.erase(id)
	while splashes.size() > 80:
		splashes.pop_front()
	# his gold carried off: when one carrying it dies (or is gone), it bursts out of it where it was
	for m: Dictionary in view["monsters"]:
		if not m["dead"] and float(m["stolen"]) > 0.0:
			carriers[int(m["id"])] = {"x": m["x"], "y": m["y"]}
	for id in carriers.keys():
		var at: Dictionary = carriers[id]
		var m = _mon(id, true)
		if m != null and not m["dead"] and float(m["stolen"]) > 0.0:
			continue
		carriers.erase(id)
		if m != null and not m["dead"]:
			continue
		play("plundering", "monster", {"part": "drop", "x": m["x"] if m != null else at["x"], "y": m["y"] if m != null else at["y"], "dur": 2.05})
	# a monster with Culling, while he is low: its fire kindles over 0.3 s, and dies down over 0.3 when he is not
	var low := float(h["life"]) / maxf(1.0, float(h["maxLife"])) < T_LOW
	for m: Dictionary in view["monsters"]:
		var culls: bool = not m["dead"] and (m["words"] as Array).has("culling")
		var id: int = m["id"]
		var was: float = hot.get(id, 0.0)
		var kk := maxf(0.0, minf(1.0, was + (dt if culls and low else -dt) / 0.3))
		if kk > 0.0:
			hot[id] = kk
		else:
			hot.erase(id)
	# the rules' spirits: where each goes, the way it faces, whether it glides
	var sps: Array = view["spirits"]
	for s: Dictionary in sps:
		var sid: int = s["id"]
		var was = spirit_was.get(sid)
		if was == null:
			var near = null
			var nd := INF
			for m: Dictionary in view["monsters"]:
				if m["dead"]:
					continue
				var d := _hyp(float(m["x"]) - float(s["x"]), float(m["y"]) - float(s["y"]))
				if d < nd:
					nd = d
					near = m
			var d0 := nd if near != null and nd > 0.0 else 1.0
			spirit_was[sid] = {"x": s["x"], "y": s["y"], "fx": (float(near["x"]) - float(s["x"])) / d0 if near != null else 1.0, "fy": (float(near["y"]) - float(s["y"])) / d0 if near != null else 0.0, "walkT": 0.0, "moving": false}
			continue
		var d := _hyp(float(s["x"]) - float(was["x"]), float(s["y"]) - float(was["y"]))
		if dt > 0.0:
			was["moving"] = d / dt > 0.4
		if d > 1e-4:
			was["fx"] = (float(s["x"]) - float(was["x"])) / d
			was["fy"] = (float(s["y"]) - float(was["y"])) / d
			was["walkT"] = float(was["walkT"]) + dt
		was["x"] = s["x"]
		was["y"] = s["y"]
	for sid in spirit_was.keys():
		var still := false
		for s: Dictionary in sps:
			if int(s["id"]) == int(sid):
				still = true
				break
		if not still:
			spirit_was.erase(sid)
	# risings the rules told of as the monster died: begun once its body has lain long enough
	for i in range(rising.size() - 1, -1, -1):
		var r: Dictionary = rising[i]
		r["left"] = float(r["left"]) - dt
		if float(r["left"]) > 0.0:
			continue
		rising.remove_at(i)
		_start_rise(r["x"], r["y"], r.get("id"))
	# a monster's surge (its warning, "...'s surge"): when its warning runs out, its wave
	var warned := {}
	for z: Dictionary in view["zones"]:
		if z["kind"] != "warn" or not str(z.get("from", "")).ends_with("'s surge"):
			continue
		warned[z["key"]] = true
		surge_warns[z["key"]] = {"x": z["x"], "y": z["y"], "r": z["r"], "src": z.get("src"), "t": z["t"], "dur": z["dur"]}
	for key in surge_warns.keys():
		if warned.has(key):
			continue
		var w: Dictionary = surge_warns[key]
		surge_warns.erase(key)
		# (broken off before its time, by a stun or a stagger: no wave)
		if float(w["t"]) < float(w["dur"]) - 0.12:
			continue
		play("surging", "monster", {"part": "wave", "x": w["x"], "y": w["y"], "ids": [w["src"]] if w["src"] != null else [], "r": w["r"], "dur": T_SURGE * 1.3})
	# a monster's shot through a wall (Piercing on a monster): where it goes into the stone and where it comes out
	for p: Dictionary in view.get("shots", []):
		var key = p["key"]
		var inw: bool = p["inWall"]
		var was = in_wall.get(key)
		in_wall[key] = inw
		if was == null or was == inw:
			continue
		play("piercing", "monster", {"part": "pass", "x": p["x"], "y": p["y"], "dx": p["dx"], "dy": p["dy"], "dur": 0.7})
	if in_wall.size() > 64:
		var live_keys := {}
		for p: Dictionary in view.get("shots", []):
			live_keys[p["key"]] = true
		for key in in_wall.keys():
			if not live_keys.has(key):
				in_wall.erase(key)


## Reaping on a monster: its body lying at (x, y) lurches up out of its fall (startRise).
func _start_rise(x: float, y: float, id = null) -> void:
	var o := {"x": x, "y": y, "dur": 0.2 + T_RISE + 0.4}
	_pics_rise(x, y, id, o)
	play("reaping", "monster", o)


## Stone at a place (world): a wall (off the floor's open tiles), or a pillar or anything solid standing there (stoneAt).
func stone_at(x: float, y: float) -> bool:
	var map = fx.monsters.get("map") if fx != null and fx.monsters != null and is_instance_valid(fx.monsters) else null
	if map == null:
		return false
	var tx := floori(x)
	var ty := floori(y)
	if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h:
		return true
	if not map.open_at(tx, ty):
		return true
	for p: Dictionary in map.props:
		if p.get("solid", false) and _hyp(float(p["x"]) - x, float(p["y"]) - y) < 0.42:
			return true
	return false


## The live monster nearest (x, y) within `within` tiles that passes `ok` (nearestTo).
func _nearest_to(x, y, within: float, ok := Callable()) -> Variant:
	if x == null or y == null:
		return null
	var best = null
	var bd := within
	for m: Dictionary in view["monsters"]:
		if m["dead"] or (ok.is_valid() and not ok.call(m)):
			continue
		var d := _hyp(float(m["x"]) - float(x), float(m["y"]) - float(y))
		if d < bd:
			bd = d
			best = m
	return best


## What the rules said happened (eventsW7). Everything is read gently: a field missing has a fallback.
func event(e: Dictionary) -> void:
	if view.is_empty():
		read()
		if view.is_empty():
			return
	var h: Dictionary = view["hero"]
	var hxw: float = h["x"]
	var hyw: float = h["y"]
	match str(e.get("t", "")):
		"swing":
			# (his own blow: the reflection and the mirror make it again, the same way, as far)
			if not e.get("hostile", false):
				swing = {"x": float(e.get("x", hxw)), "y": float(e.get("y", hyw)), "dx": float(e.get("dx", h["fx"])), "dy": float(e.get("dy", h["fy"])), "reach": float(e.get("reach", 1.5)), "at": clock}
		"pierceLine":
			var x := float(e.get("x0", e.get("x", hxw)))
			var y := float(e.get("y0", e.get("y", hyw)))
			var x1 := float(e.get("x1", x + float(h["fx"]) * 6.0))
			var y1 := float(e.get("y1", y + float(h["fy"]) * 6.0))
			var Ln := _hyp(x1 - x, y1 - y)
			if Ln == 0.0:
				Ln = 1.0
			var dx := (x1 - x) / Ln
			var dy := (y1 - y) / Ln
			# (it never goes through stone: a wall or a pillar in its line, and it bursts there)
			var stone := false
			var s := 0.3
			while s <= Ln:
				if stone_at(x + dx * s, y + dy * s):
					Ln = maxf(0.3, s - 0.05)
					stone = true
					break
				s += 0.05
			# those along it, in order, and how far along each stands
			var on: Array = []
			var ids = e.get("ids")
			for m: Dictionary in view["monsters"]:
				if m["dead"] or (ids != null and not (ids as Array).has(m["id"])):
					continue
				var ms := (float(m["x"]) - x) * dx + (float(m["y"]) - y) * dy
				var off := absf(-(float(m["x"]) - x) * dy + (float(m["y"]) - y) * dx)
				if ms > 0.0 and ms <= Ln + (0.0 if stone else 0.5) and off < 0.7:
					on.append([ms, m["id"]])
			on.sort_custom(func(p, q): return p[0] < q[0])
			play("piercing", "front", {"x": x, "y": y, "x1": x + dx * Ln, "y1": y + dy * Ln, "dx": dx, "dy": dy, "r": Ln, "stone": stone,
				"ids": on.map(func(q): return q[1]), "pts": on.map(func(q): return q[0]), "dur": Ln / T_PIERCE + 0.55})
		"lance":
			var x := float(e.get("x0", e.get("x", hxw)))
			var y := float(e.get("y0", e.get("y", hyw)))
			var x1 := float(e.get("x1", x))
			var y1 := float(e.get("y1", y))
			var delay := float(e.get("delay", T_LANCE_WAIT))
			var width := float(e.get("width", e.get("w", 1.0)))
			var Ln := _hyp(x1 - x, y1 - y)
			if Ln == 0.0:
				Ln = 1.0
			var ids: Array = []
			for m: Dictionary in view["monsters"]:
				if not m["dead"] and absf(-(float(m["x"]) - x) * (y1 - y) + (float(m["y"]) - y) * (x1 - x)) / Ln < width:
					ids.append(m["id"])
			play("piercing", "behind", {"x": x, "y": y, "x1": x1, "y1": y1, "delay": delay, "width": width, "ids": ids, "dur": delay + T_LANCE_FALL + T_LANCE_RUN + T_CRACK})
		"bleedOn":
			var m = _mon(e.get("id"), true)
			if m != null:
				play("bleeding", "front", {"x": m["x"], "y": m["y"], "ids": [m["id"]], "dx": float(m["x"]) - hxw, "dy": float(m["y"]) - hyw, "dur": 0.7})
		"heroBleed":
			# (cut by a monster: `id` it, or where it stood; the rules send where HE stands, and no id: then the nearest one)
			var at: bool = e.has("x") and e.has("y") and _hyp(float(e["x"]) - hxw, float(e["y"]) - hyw) > 0.3
			var m = _mon(e.get("id"), true)
			if m == null and not at:
				m = _nearest_to(hxw, hyw, 3.0)
			var fx0: float = float(m["x"]) if m != null else (float(e["x"]) if at else hxw - 1.0)
			var fy0: float = float(m["y"]) if m != null else (float(e["y"]) if at else hyw)
			play("bleeding", "monster", {"x": hxw, "y": hyw, "dx": hxw - fx0, "dy": hyw - fy0, "dur": 0.65})
		"reapSoul":
			play("reaping", "front", {"x": float(e.get("x", hxw)), "y": float(e.get("y", hyw)), "dur": 0.15 + T_SOUL + 0.3})
		"spirit":
			# (the rules' spirit is one of last_words.gd's spirits, its id there, its time `life`; or a monster drawn as one)
			var rules := false
			if e.has("id"):
				for q: Dictionary in view["spirits"]:
					if int(q["id"]) == int(e["id"]):
						rules = true
			var m = null if rules else _mon(e.get("id"), true)
			play("reaping", "behind", {"x": float(e.get("x", m["x"] if m != null else hxw)), "y": float(e.get("y", m["y"] if m != null else hyw)),
				"ids": [e["id"]] if e.has("id") else [], "dur": float(e.get("secs", e.get("life", T_SPIRIT))), "rules": rules})
		"spiritHit":
			var m = _mon(e.get("target"), true)
			if m == null:
				m = _nearest_to(e.get("x1"), e.get("y1"), 0.6)
			var sp = null
			if e.has("id"):
				for q: Dictionary in view["spirits"]:
					if int(q["id"]) == int(e["id"]):
						sp = q
				if sp == null:
					sp = _mon(e["id"], true)
			play("reaping", "behind", {"part": "hit", "x": m["x"] if m != null else float(e.get("x1", e.get("x", hxw))), "y": m["y"] if m != null else float(e.get("y1", e.get("y", hyw))),
				"x1": sp["x"] if sp != null else float(e.get("x0", hxw)), "y1": sp["y"] if sp != null else float(e.get("y0", hyw)),
				"ids": [m["id"] if m != null else -1, sp["id"] if sp != null else -1], "dur": T_RAKE_FOLLOW + 0.02})
		"rise":
			# its body lurches up out of its fall. (The rules send `rise` as it dies, and raise it REAP.riseAfter later: its look then
			# waits, so that it stands as the rules raise it.)
			var m = _mon(e.get("id"), true)
			var x := float(e.get("x", m["x"] if m != null else hxw))
			var y := float(e.get("y", m["y"] if m != null else hyw))
			var wait := float(REAP["riseAfter"]) - (0.2 + T_RISE)
			if wait > 0.0:
				rising.append({"x": x, "y": y, "id": e.get("id"), "left": wait})
			else:
				_start_rise(x, y, e.get("id"))
		"culled":
			var m = _mon(e.get("id"), true)
			var x := float(e.get("x", m["x"] if m != null else hxw))
			var y := float(e.get("y", m["y"] if m != null else hyw))
			if e.get("mark", false):
				# taken by the reaper's mark: where it lies (the zone nearest it)
				var mx := x
				var my := y
				var mr := 1.1
				var bd := 3.0
				for z: Dictionary in view["zones"]:
					if zone_w7(z) != "reaper":
						continue
					var d := _hyp(float(z["x"]) - x, float(z["y"]) - y)
					if d < bd:
						bd = d
						mx = z["x"]
						my = z["y"]
						mr = z["r"]
				play("culling", "behind", {"part": "mark", "x": mx, "y": my, "r": minf(1.6, mr), "x1": x, "y1": y, "ids": [e["id"]] if e.has("id") else [], "dur": 0.95})
			else:
				var a := play("culling", "front", {"x": x, "y": y, "ids": [e["id"]] if e.has("id") else [], "dx": x - hxw, "dy": y - hyw, "dur": 0.95, "whole": bool(e.get("whole", false)),
					"fallTop": float(m["top"]) if m != null else 26.0})
				_pics_cull(a, e.get("m"))
		"cullBlow":
			var m = _mon(e.get("id"), true)
			if m != null:
				play("culling", "monster", {"part": "blow", "x": m["x"], "y": m["y"], "ids": [m["id"]], "dur": 0.36})
		"surge":
			# (the Colossus's own surge, on and off, is not one of these)
			if e.has("on"):
				return
			var m = _mon(e.get("id"), true)
			if m != null and int(e.get("id", -1)) >= 0:
				play("surging", "monster", {"part": "wave", "x": m["x"], "y": m["y"], "ids": [m["id"]], "r": float(e.get("r", 2.3)), "dur": T_SURGE * 1.3})
			elif e.get("dodge", false):
				# let out by his dodge, where it began; its wind along his roll, to where it ends
				var mv = h.get("move")
				var x0 := float(e.get("x0", mv["x0"] if mv != null else e.get("x", hxw)))
				var y0 := float(e.get("y0", mv["y0"] if mv != null else e.get("y", hyw)))
				play("surging", "behind", {"x": x0, "y": y0, "x1": mv["x1"] if mv != null else hxw, "y1": mv["y1"] if mv != null else hyw, "r": float(e.get("r", 1.5)), "dur": 0.6})
			else:
				play("surging", "front", {"x": float(e.get("x", hxw)), "y": float(e.get("y", hyw)), "r": float(e.get("r", 2.2)), "dur": T_SURGE * 1.3})
		"goldSpray":
			play("plundering", "front", {"x": float(e.get("x", hxw)), "y": float(e.get("y", hyw)), "pts": [1 if e.get("item", false) else 0], "dur": 2.55})
		"goldBurst":
			play("plundering", "behind", {"x": float(e.get("x", hxw)), "y": float(e.get("y", hyw)), "dur": 1.15})
		"goldStolen":
			var m = _mon(e.get("id"), true)
			if m == null:
				m = _nearest_to(float(e.get("x", hxw)), float(e.get("y", hyw)), 3.5, func(q): return float(q["stolen"]) > 0.0)
			if m != null:
				play("plundering", "monster", {"x": m["x"], "y": m["y"], "ids": [m["id"]], "dur": 0.8})
		"reflection":
			play("mirroring", "front", {"x": hxw, "y": hyw, "dur": float(e.get("secs", T_REFLECTION))})
		"mirrorCast":
			var x := float(e.get("x", hxw))
			var y := float(e.get("y", hyw))
			if not e.has("x"):
				var bd := 99.0
				for z: Dictionary in view["zones"]:
					if zone_w7(z) != "mirror":
						continue
					var d := _hyp(float(z["x"]) - hxw, float(z["y"]) - hyw)
					if d < bd:
						bd = d
						x = z["x"]
						y = z["y"]
			play("mirroring", "behind", {"part": "cast", "x": x, "y": y, "dx": float(e.get("dx", h["fx"])), "dy": float(e.get("dy", h["fy"])), "dur": T_CAST + T_BREAKING + T_SHATTER})
		"mirrorBack":
			var m = _mon(e.get("id"), true)
			if m == null:
				m = _nearest_to(e.get("x0"), e.get("y0"), 0.6)
			if m != null:
				play("mirroring", "monster", {"x": m["x"], "y": m["y"], "ids": [m["id"]], "dur": T_MIRROR_BEAT + T_SHARDS + 0.2})


## The plain looks the effects would draw of these are the seven's to draw (fx.ts handle, ownsEventW7).
const OWN := ["pierceLine", "lance", "bleedOn", "heroBleed", "reapSoul", "spirit", "spiritHit", "rise", "culled", "cullBlow", "surge", "goldSpray", "goldBurst", "goldStolen", "reflection", "mirrorCast", "mirrorBack"]


static func owns_event(e: Dictionary) -> bool:
	if e.get("t") == "surge" and e.has("on"):
		return false
	return OWN.has(str(e.get("t", ""))) or (e.get("t") == "zone" and zone_w7(e) != "")


## THE RULES' STATE, READ (what render/words7.ts reads off the game's Game, from hero.gd, monster.gd, last_words.gd, perils.gd and
## monsters.gd): `view`.
func read() -> void:
	var h = fx.hero() if fx != null else null
	if h == null:
		view = {}
		return
	var lunge: Dictionary = h.get("_lunge") if h.get("_lunge") != null else {}
	var mv = null
	if not lunge.is_empty() and lunge.has("from") and lunge.has("to"):
		mv = {"x0": lunge["from"].x, "y0": lunge["from"].y, "x1": lunge["to"].x, "y1": lunge["to"].y}
	var hero := {"x": h.world.x, "y": h.world.y, "fx": h.face.x, "fy": h.face.y, "heroBleedT": float(h.get("bleed_t")) if h.get("bleed_t") != null else 0.0,
		"life": h.life, "maxLife": h.max_life, "move": mv}
	var monsters: Array = []
	var list: Array = fx.monsters.list if fx.monsters != null and is_instance_valid(fx.monsters) else []
	for m in list:
		if not is_instance_valid(m) or m.world.distance_to(h.world) > 22.0:
			continue
		monsters.append({"id": m.id, "x": m.world.x, "y": m.world.y, "r": m.r, "dead": m.dead, "top": _top_of(m), "fx": m.face.x, "fy": m.face.y,
			"words": m.words, "bleedT": float(m.get("bleed_t")) if m.get("bleed_t") != null else 0.0, "stolen": float(m.get("stolen")) if m.get("stolen") != null else 0.0, "spirit": false})
	var zones: Array = []
	var last = h.get("_last") if h.has_method("get") else null
	if last != null:
		for z: Dictionary in last.zones:
			zones.append({"key": "%s:%s:%s" % [z["kind"], z["x"], z["y"]], "kind": z["kind"], "x": z["x"], "y": z["y"], "r": z["r"], "t": z["t"], "dur": z["dur"]})
	var perils = fx.monsters.get("perils") if fx.monsters != null and is_instance_valid(fx.monsters) else null
	if perils != null and is_instance_valid(perils):
		for p: Dictionary in perils.list:
			if p.get("kind", "") != "warn" or p.get("by", {}).get("sound", "") != "surge_foe":
				continue
			zones.append({"key": "warn:%s:%s:%s" % [p["x"], p["y"], p.get("by", {}).get("src", -1)], "kind": "warn", "from": "'s surge", "src": p.get("by", {}).get("src"),
				"x": p["x"], "y": p["y"], "r": p["r"], "t": p["t"], "dur": p["dur"]})
	var spirits: Array = []
	if last != null:
		for s: Dictionary in last.spirits:
			spirits.append({"id": s["id"], "x": s["x"], "y": s["y"], "t": s["t"], "life": s["life"], "next": s["next"],
				"kind": s.get("kind", ""), "atk": s.get("atk", -1.0), "fx": s.get("fx", 1.0), "fy": s.get("fy", 0.0), "foe": false})
		# (REAPING WITH A DAMAGE RUNE: the creatures risen out of his enemies against him, drawn as his are, in the enemy's pink)
		if last.reap != null:
			for s: Dictionary in last.reap.foes:
				spirits.append({"id": s["id"], "x": s["x"], "y": s["y"], "t": s["t"], "life": s["life"], "next": s["next"],
					"kind": s["kind"], "atk": s["atk"], "fx": s["fx"], "fy": s["fy"], "foe": true})
	var shots: Array = []
	if fx.monsters != null and is_instance_valid(fx.monsters):
		var map = fx.monsters.get("map")
		for a: Dictionary in fx.monsters._arrows:
			if not a.get("walls", false) or map == null:
				continue
			var p: Vector2 = a["pos"]
			shots.append({"key": a["node"].get_instance_id() if is_instance_valid(a["node"]) else 0, "x": p.x, "y": p.y, "dx": a["dir"].x, "dy": a["dir"].y,
				"inWall": not map.open_at(floori(p.x), floori(p.y))})
	view = {"hero": hero, "monsters": monsters, "zones": zones, "spirits": spirits, "shots": shots}


## How tall a monster stands, game pixels (topOf: art/bestiary.ts FIGURE_SIZE).
static func _top_of(m) -> float:
	var size = L.FIGURE_SIZE.get(m.art.name if m.art != null else m.kind, L.FIGURE_SIZE.get(m.kind))
	return float(size["top"]) if size != null else 22.0


# =====================================================================================================================
# PICTURES: what these looks make of pictures, among what stands: his reflection in glass beside him (heroW7, remade 'glass'),
# and in a mirror where he stood (mirrorBehind); the rules' spirits, the little grey Shade (spiritsW7: the pictures made by
# tools/godot_words7.ts, assets/words/spirit7.png); a monster's own picture tinted by a word (lookW7: as Piercing goes through
# it, as the reaper's mark takes it, as it flashes like a mirror); one Culling cut down, held an instant, then falling in its two
# halves and lying so (fallenW7, lyingW7, halvesOf, cutFall); one Reaping raises, its fall played backwards (tickW7).

const SPIRIT_PNG := "res://assets/words/spirit7.png"
const SPIRIT_JSON := "res://assets/words/spirit7.json"
static var _spirit_tex: Texture2D
static var _spirit_info := {}

## (the pictures stood among the figures, kept from frame to frame: his reflection, and each spirit by its id)
var _refl: Sprite2D
var _spirit_sprites := {}
## (a picture's sheet as an image, by its texture; glass made of each picture, by its texture; the pictures of panes)
var _sheets := {}
var _glass := {}
var _pane_made := {}
## (each one Culling cut down: {m (its node), way, a (its look), src (its picture as it was held: {img, ax, ay, dn}), halves,
## node}, by the node's id)
var _cuts := {}
## (each one Reaping raises: {m (its body's node), t, dur, die (its fall's length)} )
var _risings: Array = []

const TINT := """
shader_type canvas_item;
varying vec4 tint;
void vertex() {
	tint = COLOR;
}
void fragment() {
	vec4 t = texture(TEXTURE, UV);
	COLOR = vec4(mix(t.rgb, tint.rgb, tint.a), t.a);
}
"""
static var _tint_mat: ShaderMaterial


func _pics_clear() -> void:
	if _refl != null and is_instance_valid(_refl):
		_refl.queue_free()
	_refl = null
	for k in _spirit_sprites:
		if is_instance_valid(_spirit_sprites[k]):
			_spirit_sprites[k].queue_free()
	_spirit_sprites = {}
	for k in _cuts:
		var c: Dictionary = _cuts[k]
		if c.get("node") != null and is_instance_valid(c["node"]):
			c["node"].queue_free()
	_cuts = {}
	_risings = []
	_glass = {}
	_pane_made = {}


func _stands() -> Variant:
	var s = fx.monsters.get("stands") if fx != null and fx.monsters != null and is_instance_valid(fx.monsters) else null
	return s if s != null and is_instance_valid(s) else null


## A picture's pixels: its sheet's image, cut to its region (kept by sheet).
func _image_of(tex: Texture2D) -> Image:
	if tex is AtlasTexture:
		var at: AtlasTexture = tex
		var sheet: Texture2D = at.atlas
		var key := sheet.get_instance_id()
		if not _sheets.has(key):
			var im := sheet.get_image()
			if im.is_compressed():
				im.decompress()
			if im.get_format() != Image.FORMAT_RGBA8:
				im.convert(Image.FORMAT_RGBA8)
			_sheets[key] = im
		var img: Image = _sheets[key]
		return img.get_region(Rect2i(at.region))
	var one := tex.get_image()
	if one.is_compressed():
		one.decompress()
	one.convert(Image.FORMAT_RGBA8)
	return one


## A copy of a picture remade in glass (remade 'glass'): its own shading carried over into silver glass, a sheen across it, its
## edge the friend's cyan. `dn` its grain (picture pixels a game pixel); `flip` as it is shown.
func _glass_image(img: Image, dn: int) -> Image:
	var W := img.get_width()
	var H := img.get_height()
	var out := Image.create(W, H, false, Image.FORMAT_RGBA8)
	var R: PackedColorArray = RAMP["mirroring"]
	var rim: Color = FRIEND[2]
	var rim2: Color = FRIEND[3]
	var solid := func(x: int, y: int) -> bool: return x >= 0 and y >= 0 and x < W and y < H and img.get_pixel(x, y).a8 > 60
	for y in H:
		for x in W:
			if not solid.call(x, y):
				continue
			var gx := floori(float(x) / dn)
			var gy := floori(float(y) / dn)
			var edge: bool = not solid.call(x - dn, y) or not solid.call(x + dn, y) or not solid.call(x, y - dn) or not solid.call(x, y + dn)
			var c: Color
			if edge:
				c = rim2 if (gx + gy) % 3 == 0 else rim
			else:
				var p := img.get_pixel(x, y)
				var lum := (p.r8 * 0.3 + p.g8 * 0.59 + p.b8 * 0.11) / 255.0
				var k := mini(4, int(floorf(1.0 + lum * 4.2)))
				var band := fmod(gx * 0.7 + gy * 1.0, 13.0)
				if band < 1.5:
					k = mini(5, k + 2)
				elif band < 3.0:
					k = mini(5, k + 1)
				c = R[k]
			out.set_pixel(x, y, Color(c, 1.0))
	return out


## His picture as he is shown now: {tex, offset, scale, flip, img (as shown, flipped if he is), dn, key}.
func _hero_pic() -> Variant:
	var h = fx.hero() if fx != null else null
	var sp = h.get("_sprite") if h != null else null
	if not (sp is Sprite2D) or sp.texture == null:
		return null
	var dn := maxi(1, _ri(2.0 / maxf(0.01, sp.scale.x)))
	var key := "%d:%s" % [sp.texture.get_instance_id(), sp.flip_h]
	if not _glass.has(key):
		var img := _image_of(sp.texture)
		if sp.flip_h:
			img.flip_x()
		var g := _glass_image(img, dn)
		_glass[key] = {"img": g, "tex": ImageTexture.create_from_image(g)}
		if _glass.size() > 96:
			_glass.erase(_glass.keys()[0])
	var anchor: Vector2 = -sp.offset
	if sp.flip_h:
		anchor.x = float(sp.texture.get_width()) + sp.offset.x
	return {"glass": _glass[key], "anchor": anchor, "dn": dn, "key": key}


## His reflection in a mirror where he stood: his picture in glass, its foot 3 above the pane's, held within the pane, at 0.85
## (mirrorBehind). Laid among the layer's dots, over the glass and under its edge.
func _pane_picture(bx: float, by: float, top: float, Ht: float) -> void:
	if _rec != null or fx == null:
		return
	var hp = _hero_pic()
	if hp == null:
		return
	var dn: int = hp["dn"]
	var anchor: Vector2 = hp["anchor"]
	# (where its corner is, game pixels: Math.round(bx - sp.ax), Math.round(by - 3 - sp.ay))
	var x0 := _ri(bx - anchor.x / dn)
	var y0 := _ri(by - 3.0 - anchor.y / dn)
	var key := "%s:%d:%d:%s:%s:%s" % [hp["key"], x0, y0, bx, top, Ht]
	if not _pane_made.has(key):
		var g: Image = hp["glass"]["img"]
		var W := g.get_width()
		var H := g.get_height()
		var out := Image.create(W, H, false, Image.FORMAT_RGBA8)
		for y in H:
			var Y := floori(y0 + float(y) / dn)
			for x in W:
				var c := g.get_pixel(x, y)
				if c.a8 == 0:
					continue
				var X := floori(x0 + float(x) / dn)
				if pane_inside(X, Y, bx, top, Ht):
					out.set_pixel(x, y, c)
		_pane_made[key] = {"tex": ImageTexture.create_from_image(out), "w": W, "h": H}
		if _pane_made.size() > 64:
			_pane_made.erase(_pane_made.keys()[0])
	var made: Dictionary = _pane_made[key]
	_flush()
	_segs.append({"tex": made["tex"], "rect": Rect2(x0 * 2.0, y0 * 2.0, float(made["w"]) * 2.0 / dn, float(made["h"]) * 2.0 / dn), "mod": Color(1, 1, 1, 0.85)})


## A picture among what stands at depth `depth` (x + y, tiles), its anchor at (x, y) on the screen (game pixels): `pic` {tex,
## anchor (picture pixels), dn, flip, w}.
func _stand(s: Sprite2D, tex: Texture2D, anchor: Vector2, dn: int, flip: bool, x: float, y: float, depth: float, alpha: float) -> void:
	var scale := 2.0 / dn
	var back := depth * 16.0
	s.texture = tex
	s.flip_h = flip
	s.scale = Vector2.ONE * scale
	s.position = Vector2(x * 2.0, back)
	var off := -anchor
	if flip:
		off.x = anchor.x - float(tex.get_width())
	s.offset = off + Vector2(0.0, (y * 2.0 - back) / scale)
	s.modulate = Color(1, 1, 1, alpha)
	s.visible = alpha > 0.0


func _new_stand() -> Variant:
	var stands = _stands()
	if stands == null:
		return null
	var s := Sprite2D.new()
	s.centered = false
	stands.add_child(s)
	return s


## After everything else in the frame: what stands with him follows him where he now is (heroW7, spiritsW7).
func follow() -> void:
	if fx == null or view.is_empty():
		return
	# HIS REFLECTION beside him in glass (Mirroring in front), forming over its first 0.08 s and dissolving over its last 0.25
	var shown := 0.0
	for a: Dictionary in acts:
		if a["word"] == "mirroring" and a["side"] == "front":
			shown = 0.86 * _c01(float(a["t"]) / 0.08) * _c01((float(a["dur"]) - float(a["t"])) / 0.25)
	if shown > 0.0:
		var hp = _hero_pic()
		if hp != null:
			if _refl == null or not is_instance_valid(_refl):
				_refl = _new_stand()
			if _refl != null:
				var h: Dictionary = view["hero"]
				var o := mirror_offset(h["fx"], h["fy"])
				var rx: float = float(h["x"]) + float(o[0])
				var ry: float = float(h["y"]) + float(o[1])
				_stand(_refl, hp["glass"]["tex"], hp["anchor"], hp["dn"], false, _sx(rx, ry), _sy(rx, ry), rx + ry, shown)
	elif _refl != null and is_instance_valid(_refl):
		_refl.visible = false
	# THE RULES' SPIRITS, the little grey Shade: each faces the way it glides (or the one it fights), glides while it moves, draws
	# its claws back as its next blow comes, rakes as its blow lands, rises in and goes
	var seen := {}
	for s: Dictionary in view["spirits"]:
		var sid: int = s["id"]
		seen[sid] = true
		var sp: Sprite2D = _spirit_sprites.get(sid)
		if sp == null or not is_instance_valid(sp):
			sp = _new_stand()
			if sp == null:
				continue
			_spirit_sprites[sid] = sp
		var pic := _reap_frame(s) if str(s.get("kind", "")) != "" else _spirit_frame(s)
		var build := _c01(float(s["t"]) / T_SPIRIT_BUILD)
		var going := _c01((float(s["life"]) - float(s["t"])) / T_SPIRIT_FADE)
		var lift := _ri(2.0 * build + 8.0 * (1.0 - going))
		_stand(sp, pic["tex"], pic["anchor"], pic["dn"], pic["flip"], _ri(_sx(s["x"], s["y"])), _ri(_sy(s["x"], s["y"])) - lift, float(s["x"]) + float(s["y"]), (1.0 if str(s.get("kind", "")) != "" else 0.92) * build * going)
	for sid in _spirit_sprites.keys():
		if not seen.has(sid):
			if is_instance_valid(_spirit_sprites[sid]):
				_spirit_sprites[sid].queue_free()
			_spirit_sprites.erase(sid)


## REAPING WITH A DAMAGE RUNE (meldsreap_rules.gd): the picture its creature shows now, his (its edge his cyan) or risen against him
## (the enemy's pink): its stand, its walk, or its attack played from the rules' own clock of it (`atk`, seconds into it); facing
## the one it strikes as it strikes, else the way it goes (tools/reap5, assets/words/reap5_<kind>.png): {tex, anchor, dn, flip}.
static var _reap_tex := {}
static var _reap_info := {}


func _reap_frame(s: Dictionary) -> Dictionary:
	var kind: String = s["kind"]
	if not _reap_tex.has(kind):
		_reap_tex[kind] = load("res://assets/words/reap5_%s.png" % kind)
		_reap_info[kind] = JSON.parse_string(FileAccess.get_file_as_string("res://assets/words/reap5_%s.json" % kind))
	var info: Dictionary = _reap_info[kind]
	var was = spirit_was.get(int(s["id"]))
	var atk: float = float(s["atk"])
	var mfx: float = float(s["fx"]) if atk >= 0.0 or was == null else float(was["fx"])
	var mfy: float = float(s["fy"]) if atk >= 0.0 or was == null else float(was["fy"])
	var sides: Array = info["foe" if s.get("foe", false) else "friend"]
	var side: Dictionary = sides[1 if mfx + mfy < -0.2 else 0]
	var pick: int
	if atk >= 0.0:
		var clip: Array = side["attack"]
		pick = int(clip[mini(clip.size() - 1, int(floorf(atk * float(side["attackFps"]) + 1e-6)))])
	elif was != null and was["moving"]:
		var wl: Array = side["walk"]
		pick = int(wl[int(floorf(float(was["walkT"]) * float(side["walkFps"]))) % wl.size()])
	else:
		var il: Array = side["idle"]
		pick = int(il[(int(floorf(clock * float(side["idleFps"]))) + int(s["id"]) * 3) % il.size()])
	var p: Dictionary = info["pics"][pick]
	var key := "reap5:%s:%d" % [kind, pick]
	if not _glass.has(key):
		var at := AtlasTexture.new()
		at.atlas = _reap_tex[kind]
		at.region = Rect2(p["x"], p["y"], p["w"], p["h"])
		_glass[key] = at
	return {"tex": _glass[key], "anchor": Vector2(p["ax"], p["ay"]), "dn": int(p["dn"]), "flip": mfx - mfy < 0.0}


## The grey Shade's picture a rules' spirit shows now (spiritsW7, shadeFrameOf, spiritPicture): {tex, anchor, dn, flip}.
func _spirit_frame(s: Dictionary) -> Dictionary:
	if _spirit_tex == null:
		_spirit_tex = load(SPIRIT_PNG)
		_spirit_info = JSON.parse_string(FileAccess.get_file_as_string(SPIRIT_JSON))
	var sid: int = s["id"]
	var was = spirit_was.get(sid)
	var mfx: float = float(was["fx"]) if was != null else 1.0
	var mfy: float = float(was["fy"]) if was != null else 0.0
	var anim := "walk" if was != null and was["moving"] else "idle"
	var anim_t: float = float(was["walkT"]) if was != null else 0.0
	var windup := -1.0
	var foe = null
	var bd := float(REAP["spiritReach"]) + 0.6
	for o: Dictionary in view["monsters"]:
		if o["dead"]:
			continue
		var d := _hyp(float(o["x"]) - float(s["x"]), float(o["y"]) - float(s["y"]))
		if d < bd:
			bd = d
			foe = o
	var W := SHADE_WINDUP
	if foe != null and not (was != null and was["moving"]) and float(s["next"]) > 0.0 and float(s["next"]) < W:
		var d := _hyp(float(foe["x"]) - float(s["x"]), float(foe["y"]) - float(s["y"]))
		if d == 0.0:
			d = 1.0
		anim = "attack"
		windup = float(s["next"])
		mfx = (float(foe["x"]) - float(s["x"])) / d
		mfy = (float(foe["y"]) - float(s["y"])) / d
	var side: Dictionary = _spirit_info["sides"][1 if mfx + mfy < -0.2 else 0]
	var clip: Array = side["attack"]
	var pick: int
	var hit = null
	for a: Dictionary in acts:
		if a["word"] == "reaping" and a["part"] == "hit" and (a["ids"] as Array).size() > 1 and int(a["ids"][1]) == sid:
			hit = a
			break
	var at_of := func(t: float) -> int: return int(clip[maxi(0, mini(clip.size() - 1, int(floorf(t * float(side["attackFps"]) + 1e-6))))])
	if not clip.is_empty() and hit != null:
		pick = at_of.call(float(side["attackHit"]) + float(hit["t"]))
	elif not clip.is_empty() and anim == "attack":
		pick = at_of.call((1.0 - _c01(windup / maxf(0.01, W))) * float(side["attackHit"]))
	elif anim == "walk":
		var wl: Array = side["walk"]
		pick = int(wl[int(floorf(anim_t * float(side["walkFps"]))) % wl.size()])
	else:
		var il: Array = side["idle"]
		pick = int(il[int(floorf(clock * float(side["idleFps"]))) % il.size()])
	var p: Dictionary = _spirit_info["pics"][pick]
	var key := "spirit:%d" % pick
	if not _glass.has(key):
		var at := AtlasTexture.new()
		at.atlas = _spirit_tex
		at.region = Rect2(p["x"], p["y"], p["w"], p["h"])
		_glass[key] = at
	return {"tex": _glass[key], "anchor": Vector2(p["ax"], p["ay"]), "dn": int(p["dn"]), "flip": mfx - mfy < 0.0}


## A monster's own picture changed by a word (lookW7), as monster.gd shows it: tinted (a colour laid over it), or held, or cut.
func look_on(m, sprite: Sprite2D) -> void:
	if view.is_empty() or sprite == null:
		return
	var tint = null
	if not m.dead:
		for a: Dictionary in acts:
			var ids: Array = a["ids"]
			if a["word"] == "culling" and a["side"] == "front" and not ids.is_empty() and int(ids[0]) == m.id:
				if float(a["t"]) < T_CULL_HOLD:
					tint = [RAMP["culling"][3], 0.25]
				break
			if a["word"] == "culling" and a["side"] == "behind" and not ids.is_empty() and int(ids[0]) == m.id and not (a["pts"] as Array).is_empty() and float(a["t"]) - float(a["pts"][0]) >= 0.0 and float(a["t"]) - float(a["pts"][0]) < 0.3:
				tint = [RAMP["culling"][4], 0.35]
				break
			if a["word"] == "piercing" and a["side"] == "front" and ids.has(m.id):
				var s: float = float(a["pts"][ids.find(m.id)]) if ids.find(m.id) < (a["pts"] as Array).size() else 0.0
				var since := (float(a["t"]) * T_PIERCE - s) / T_PIERCE
				if since >= 0.0 and since < 0.05:
					tint = [RAMP["piercing"][5], 0.35]
					break
			if a["word"] == "piercing" and a["side"] == "behind" and ids.has(m.id):
				var Ln := _hyp(float(a["x1"]) - float(a["x"]), float(a["y1"]) - float(a["y"]))
				if Ln == 0.0:
					Ln = 1.0
				var along: float = ((m.world.x - float(a["x"])) * (float(a["x1"]) - float(a["x"])) + (m.world.y - float(a["y"])) * (float(a["y1"]) - float(a["y"]))) / Ln
				var passed: float = float(a["t"]) - float(a["delay"]) - T_LANCE_FALL - (along / Ln) * T_LANCE_RUN
				if passed >= 0.0 and passed < 0.06:
					tint = [RAMP["piercing"][5], 0.3]
					break
			if a["word"] == "mirroring" and a["side"] == "monster" and not ids.is_empty() and int(ids[0]) == m.id and float(a["t"]) < 0.15:
				tint = [Color("#ffd8e8"), 0.4 * (1.0 - float(a["t"]) / 0.15)]
				break
	if tint != null:
		if _tint_mat == null:
			var sh := Shader.new()
			sh.code = TINT
			_tint_mat = ShaderMaterial.new()
			_tint_mat.shader = sh
		sprite.material = _tint_mat
		sprite.self_modulate = Color(tint[0], tint[1])
	elif sprite.material == _tint_mat and _tint_mat != null:
		sprite.material = null
	# ONE CULLING CUT DOWN: held whole an instant, then in its two halves
	var c = _cuts.get(m.get_instance_id())
	if c != null:
		_cut_show(c, sprite)


## One Culling cuts down (its `culled`): its body held whole and still an instant, till the blade is through it; then it falls in
## two (tickW7, fallenW7). One of the Hushed is held so, and falls as it always does.
func _pics_cull(a: Dictionary, m) -> void:
	if m == null or not is_instance_valid(m):
		return
	_cuts[m.get_instance_id()] = {"m": m, "way": 1.0 if float(a["dx"]) - float(a["dy"]) >= 0.0 else -1.0, "a": a, "whole": a["whole"], "src": null, "since": -1.0, "node": null}


## When the cull's blade is through the middle of the one it takes (cullThrough); how far its halves have slid apart.
static func _cull_through() -> float:
	return T_CULL_HOLD + T_CULL_SWEEP * 0.5


func _cut_show(c: Dictionary, sprite: Sprite2D) -> void:
	var m = c["m"]
	var a: Dictionary = c["a"]
	var since: float = float(a["t"]) - _cull_through() if acts.has(a) else 99.0
	# (held: the body's fall stopped at its first picture, its picture kept)
	if float(a["t"]) < T_CULL_HOLD + T_CULL_SWEEP and acts.has(a):
		m.set("_anim_t", 0.0)
	if c["whole"]:
		return
	if since < 0.0 or c["src"] == null:
		if sprite.texture != null:
			var img := _image_of(sprite.texture)
			if sprite.flip_h:
				img.flip_x()
			var dn := maxi(1, _ri(2.0 / maxf(0.01, sprite.scale.x)))
			var anchor: Vector2 = -sprite.offset
			if sprite.flip_h:
				anchor.x = float(sprite.texture.get_width()) + sprite.offset.x
			c["src"] = {"img": img, "ax": anchor.x / dn, "ay": anchor.y / dn, "w": float(img.get_width()) / dn, "h": float(img.get_height()) / dn, "dn": dn}
		if since < 0.0:
			return
	if c.get("halves") == null:
		c["halves"] = _halves_of(c["src"], c["way"])
	sprite.visible = false
	var node = c["node"]
	if node == null or not is_instance_valid(node):
		node = _CutNode.new()
		node.owner_w7 = self
		node.cut = c
		m.add_child(node)
		c["node"] = node
	node.position = sprite.position
	var step := CUT_REST if since >= CUT_REST else _ri(since * 60.0) / 60.0
	node.at = cut_fall(step, c["way"], c["halves"]["top"]["box"], c["halves"]["bot"]["box"])
	node.modulate = sprite.self_modulate if sprite.material != _tint_mat else Color.WHITE
	node.queue_redraw()


## One cut down's two halves, as it stood: each its own picture (the cut along it lit bone), and its box (game pixels from the
## anchor) (halvesOf).
func _halves_of(src: Dictionary, way: float) -> Dictionary:
	var img: Image = src["img"]
	var dn: int = src["dn"]
	var W := img.get_width()
	var H := img.get_height()
	var sax: float = src["ax"]
	var say: float = src["ay"]
	var sh: float = src["h"]
	var cut_y := func(x: float) -> float: return (say - sh * 0.42) * dn + (x - sax * dn) * 0.35 * way
	var bone: Color = RAMP["culling"][4]
	var make := func(above: bool) -> Dictionary:
		var mine := func(x: int, y: int) -> bool: return x >= 0 and y >= 0 and x < W and y < H and img.get_pixel(x, y).a8 > 60 and ((y < float(cut_y.call(x))) == above)
		var x0 := W
		var y0 := H
		var x1 := -1
		var y1 := -1
		for y in H:
			for x in W:
				if not mine.call(x, y):
					continue
				x0 = mini(x0, x)
				y0 = mini(y0, y)
				x1 = maxi(x1, x)
				y1 = maxi(y1, y)
		if x1 < 0:
			return {"tex": null, "w": 1, "h": 1, "box": {"x0": 0.0, "y0": -1.0, "x1": 0.0, "y1": 0.0}}
		var out := Image.create(x1 - x0 + 1, y1 - y0 + 1, false, Image.FORMAT_RGBA8)
		for y in range(y0, y1 + 1):
			for x in range(x0, x1 + 1):
				if mine.call(x, y):
					out.set_pixel(x - x0, y - y0, img.get_pixel(x, y))
		# the cut lit bone along its lip, wherever there is body
		for x in range(x0, x1 + 1):
			for y in range(y0, y1 + 1):
				if not mine.call(x, y):
					continue
				var lip: bool = (not mine.call(x, y + dn) and y + dn >= float(cut_y.call(x))) if above else (not mine.call(x, y - dn) and y - dn < float(cut_y.call(x)))
				if lip:
					out.set_pixel(x - x0, y - y0, Color(bone, 1.0))
		var ax := sax * dn
		var ay := say * dn
		return {"tex": ImageTexture.create_from_image(out), "w": out.get_width(), "h": out.get_height(),
			"box": {"x0": (x0 - ax) / dn, "y0": (y0 - ay) / dn, "x1": (x1 + 1 - ax) / dn, "y1": (y1 + 1 - ay) / dn}}
	return {"top": make.call(true), "bot": make.call(false), "dn": dn}


## How low a piece's box reaches, turned `ang` about its middle at height `y` (lowOf).
static func _low_of(y: float, ang: float, hw: float, hh: float) -> float:
	return y + absf(sin(ang)) * hw + absf(cos(ang)) * hh


## Where the two halves of one cut down are, `since` seconds after the blade went through it (cutFall): its legs fold back,
## turning on their foot; its top slides off down the cut, falls, tipping, and lands on its side beside them.
static func cut_fall(since: float, way: float, top: Dictionary, bot: Dictionary) -> Dictionary:
	var quarter := PI / 2.0
	var bhw := (float(bot["x1"]) - float(bot["x0"])) / 2.0
	var bhh := (float(bot["y1"]) - float(bot["y0"])) / 2.0
	var px := (float(bot["x0"]) + float(bot["x1"])) / 2.0
	var bk := _c01((since - 0.06) / 0.16)
	var ba := -way * quarter * bk * bk
	var by0 := (float(bot["y0"]) + float(bot["y1"])) / 2.0
	var bx := px - by0 * sin(ba)
	var by := by0 * cos(ba)
	var bl := _low_of(by, ba, bhw, bhh)
	if bl > 0.0:
		by -= bl
	var thw := (float(top["x1"]) - float(top["x0"])) / 2.0
	var thh := (float(top["y1"]) - float(top["y0"])) / 2.0
	var tx := (float(top["x0"]) + float(top["x1"])) / 2.0
	var ty := (float(top["y0"]) + float(top["y1"])) / 2.0
	var ta := 0.0
	var slide := 0.12
	var vx := 0.0
	var vy := 0.0
	var down := -1.0
	var dt := 1.0 / 120.0
	var x00 := tx
	var y00 := ty
	var u := 0.0
	var end := minf(since, CUT_REST) - 1e-9
	while u < end:
		if u < slide:
			# (the cut opens at once, a pixel and a half; then it slides off down it)
			var s := 1.5 + 3.5 * pow((u + dt) / slide, 2.0)
			tx = x00 + way * s
			ty = y00 + 0.35 * s
			vx = way * 50.0
			vy = 20.0
		elif down < 0.0:
			tx += vx * dt
			ty += vy * dt
			vy += 330.0 * dt
			ta = way * minf(quarter, absf(ta) + (quarter / 0.3) * dt)
			var lo := _low_of(ty, ta, thw, thh)
			if lo >= 0.0:
				ty -= lo
				down = u
		else:
			ta = way * minf(quarter, absf(ta) + (quarter / 0.12) * dt)
			ty -= _low_of(ty, ta, thw, thh)
		u += dt
	return {"top": Vector3(tx, ty, ta), "bot": Vector3(bx, by, ba), "botDown": 0.22, "topDown": 99.0 if down < 0.0 else down}


## (the two halves drawn about the body's foot, where they are: cutFallen, its steps of a sixtieth, at rest from CUT_REST)
class _CutNode extends Node2D:
	var owner_w7
	var cut: Dictionary
	var at := {}

	func _draw() -> void:
		var hv = cut.get("halves")
		if hv == null or at.is_empty():
			return
		var dn: int = hv["dn"]
		for pair in [[hv["bot"], at["bot"]], [hv["top"], at["top"]]]:
			var piece: Dictionary = pair[0]
			var pose: Vector3 = pair[1]
			if piece["tex"] == null:
				continue
			# (game pixels from the anchor to picture pixels, and a picture pixel is one of ours)
			var k := 2.0 / dn
			draw_set_transform(Vector2(floorf(pose.x * dn + 0.5) * k, floorf(pose.y * dn + 0.5) * k), pose.z, Vector2(k, k))
			draw_texture(piece["tex"], Vector2(-floorf(float(piece["w"]) / 2.0 + 0.5), -floorf(float(piece["h"]) / 2.0 + 0.5)))
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## One Reaping raises (startRise): its body, lying where it fell, plays its fall backwards over the rise and is let go at its top.
func _pics_rise(x: float, y: float, _id, o: Dictionary) -> void:
	var best = null
	var bd := 0.8
	var list: Array = fx.monsters.list if fx != null and fx.monsters != null and is_instance_valid(fx.monsters) else []
	for m in list:
		if not is_instance_valid(m) or not m.dead:
			continue
		var d: float = m.world.distance_to(Vector2(x, y))
		if d < bd:
			bd = d
			best = m
	if best == null:
		return
	var die: float = best.art.length("die") if best.art != null and best.art.has("die") else 1.0
	o["dieT"] = minf(float(best.get("_anim_t")), 1.0)
	_risings.append({"m": best, "t": 0.0, "dieT": o["dieT"], "die": die})


func _pics_tick(dt: float) -> void:
	# (Reaping on a monster: its fall played backwards, held on its own pictures of it; at the top of it the body is the risen
	# monster's again, and the fallen one is let go)
	for i in range(_risings.size() - 1, -1, -1):
		var r: Dictionary = _risings[i]
		r["t"] = float(r["t"]) + dt
		var m = r["m"]
		if not is_instance_valid(m):
			_risings.remove_at(i)
			continue
		var k := _c01((float(r["t"]) - 0.2) / T_RISE)
		m.set("_anim_t", float(r["dieT"]) * (1.0 - k))
		if k >= 1.0:
			m.visible = false
			_risings.remove_at(i)
	for key in _cuts.keys():
		var c: Dictionary = _cuts[key]
		if not is_instance_valid(c["m"]):
			_cuts.erase(key)
