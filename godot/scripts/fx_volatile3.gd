## VOLATILE'S FIVE MELDS AT WORK, AS THE FIGHT SHOWS THEM (render/volatile3.ts: the art chat's looks of Demolition, Powderkeg,
## Shatter, Chain Reaction and Rupture, on in the game as it starts, VOLATILE3, his yes of 22 Oct 2026 by 07:46: “Yes, put them live
## (Recommended)”). fx.gd hands on to this. THE GAME'S OWN LOOKS PORTED LINE FOR LINE: its makers (each one's kill's blast, its
## hit, its rune going off, its moments of its own), its painters (the runes as they wait, the marks the blasts leave, Powderkeg's
## burning ground, Rupture's slick and cloud, Shatter's sheet of ice, the domes of light, the pillars, the spikes of ice, what
## flies, the bolts, the screen's flash), its clock (tickV3: what each rune and patch gives off), and what it lays over a monster
## (shiftV3, tintV3) and its light (lightsV3); each dot where the game lays it, in its order, held against the game's own painter
## (checks/vmelds_check.gd). Its colours and times are the game's, taken out of it by tools/godot_vmelds.ts into
## assets/words/vmelds.json; what it throws into the effects (sparks, rings, flashes, flames, bubbles, glows, the hold, the shake)
## goes into fx.gd's own, as the game's goes into its Fx.
## CALLED UP BY WHAT THE RULES SAY HAPPENED (eventsV3), as melds.gd and wakes.gd tell it: a kill's explosion, a `burst` (style
## "blast") with `meld` one of the five; a rune going off, a `burst` (style "ruin") with `meld`; a hit carrying one, a `hit`'s
## `words`, and a Lunge's landing's (`burst`, "land"); their own moments, `volFx` (half, catch, shard, freeze, arc, link, splash).
## THE RUNES AND PATCHES ARE READ OFF THE RULES' OWN LIST (wakes.gd list: a patch's `meld` or `look`): a rune of the five, Powderkeg's
## burning ground and Rupture's cloud are drawn here and left out of the plain ground's (owns_zone), as render.ts leaves them.
## LEFT OUT: the playtest's hands (V3.demo, demoV3): nothing in the game calls them.
## HOW IT IS KEPT QUICK ENOUGH, not a dot changed: a line's dots along a row laid as one block; each layer's blocks drawn in one
## call; what is wholly off the screen not painted. (What it costs: `--only=looks_volatile`, its line VMELDS COST.)
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const FILE := "res://assets/words/vmelds.json"

## The five (VMELD_IDS), their colours darkest to brightest (VMELD_RAMP: 3 the word's own, 4 its glow), their runes' waits and
## Shatter's and Chain Reaction's times (VRUNE).
const IDS := ["demolition", "powderkeg", "shatter", "chainreaction", "rupture"]
static var RAMP := {}
static var WAIT := {}
static var FREEZE_AT := 0.4
static var LINK_GAP := 0.12
static var LINK_REACH := 6.0
static var VIOLET := PackedColorArray()
static var P := {}

var fx
## (the check's: every fill laid, a line each, while it records; null when drawing)
var _rec = null
## The rules' state as last read (`read`): where he stands; the monsters ({id, x, y, dead, top}); the patches (wakes.gd list).
var hero_x := 0.0
var hero_y := 0.0
var mons: Array = []
var zones: Array = []

# --- what is going on (V3) ---
var clock := 0.0
var later: Array = []
var lobs: Array = []
var domes: Array = []
var arcs: Array = []
var spears: Array = []
var spikes: Array = []
var scars: Array = []
var jolts: Array = []
## What one of the five has done to a monster, by its id: {white, crackle}.
var marks := {}
var pillars: Array = []
var freezes: Array = []
var flash := {"t": 9.0, "dur": 0.1, "color": Color.WHITE, "a": 0.0}

## The chance: the game's Math.random (randf), or the check's own sequence (`seeded`, from `seed`).
var seeded := false
var seed := 0


static func ready_up() -> void:
	if not RAMP.is_empty():
		return
	L.ready_up()
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	for w in d["vramp"]:
		RAMP[w] = L.ramp_of(d["vramp"][w])
	var v: Dictionary = d["vrune"]
	WAIT = v["wait"]
	FREEZE_AT = float(v["freezeAt"])
	LINK_GAP = float(v["linkGap"])
	LINK_REACH = float(v["linkReach"])
	P = L.P
	VIOLET = PackedColorArray([P["white"], P["pu5"], P["pu4"], P["pu3"]])


func _init() -> void:
	ready_up()


static func is_meld(w) -> bool:
	return w is String and IDS.has(w)


## Forget everything (clearV3).
func clear() -> void:
	later = []
	lobs = []
	domes = []
	arcs = []
	spears = []
	spikes = []
	scars = []
	jolts = []
	pillars = []
	freezes = []
	marks = {}
	flash["t"] = 9.0


func alive() -> bool:
	if not (later.is_empty() and lobs.is_empty() and domes.is_empty() and arcs.is_empty() and spears.is_empty() and spikes.is_empty()
			and scars.is_empty() and jolts.is_empty() and pillars.is_empty() and freezes.is_empty() and marks.is_empty()) or float(flash["t"]) < float(flash["dur"]):
		return true
	for z in zones:
		if _owns(z):
			return true
	return false


# =====================================================================================================================
# The game's own arithmetic

func _r() -> float:
	if not seeded:
		return randf()
	seed = (L.imul(seed, 1664525) + 1013904223) & 0xffffffff
	return float((seed >> 8) & 0xffffff) / 16777216.0


func _rnd(a: float, b: float) -> float:
	return a + _r() * (b - a)


func _pick(list: PackedColorArray) -> Color:
	return list[int(floorf(_r() * list.size()))]


## Math.round.
static func _ri(v: float) -> int:
	return int(floorf(v + 0.5))


static func _smooth(q: float) -> float:
	return q * q * (3.0 - 2.0 * q)


static func _ease_out(q: float) -> float:
	return 1.0 - (1.0 - q) * (1.0 - q) * (1.0 - q)


## Math.hypot of two, as V8 works it out (each over the larger, squared and summed by Kahan's rule, its root times the larger):
## the very same number, to its last bit.
static func _hyp(a: float, b: float) -> float:
	var x := absf(a)
	var y := absf(b)
	var most := maxf(x, y)
	if most == 0.0:
		return 0.0
	var sum := 0.0
	var comp := 0.0
	for v in [x, y]:
		var n: float = v / most
		var summand := n * n - comp
		var pre := sum + summand
		comp = (pre - sum) - summand
		sum = pre
	return sqrt(sum) * most


static func _h(x: int, y: int, s: int) -> float:
	return L.hash2(x, y, s)


## A colour of a list, or none past its end (the game's C[4] of a list of four: the canvas takes nothing, its colour stays).
static func _c(C: PackedColorArray, i: int):
	return C[i] if i < C.size() else null


func _wx(x: float, y: float) -> float:
	return fx.gx(x, y)


func _wy(x: float, y: float) -> float:
	return fx.gy(x, y)


# =====================================================================================================================
# THE CANVAS: what the game's painter sets and lays (fillStyle, globalAlpha, fillRect), laid as the canvas lays it

var _style := Color.BLACK
var _alpha := 1.0
var _pts := PackedVector2Array()
var _cols := PackedColorArray()
var _idx := PackedInt32Array()
## (a premultiplied layer's colours: fx_melds8.gd's own, where its light is added in among the dots)
var premul := false


func _fs(c) -> void:
	if c != null:
		_style = c


func _ga(a: float) -> void:
	if a >= 0.0 and a <= 1.0:
		_alpha = a


static func _q(v: float) -> String:
	return str(int(floorf(v * 10000.0 + 0.5)))


func _fill(x: float, y: float, w: float, h: float) -> void:
	if w < 0.0:
		x += w
		w = -w
	if h < 0.0:
		y += h
		h = -h
	if w == 0.0 or h == 0.0:
		return
	if _rec != null:
		_rec.append("r,%s,%s,%s,%s,%s,%s" % [_q(x), _q(y), _q(w), _q(h), _style.to_html(false).to_lower(), _q(_alpha)])
		return
	if _alpha <= 0.0:
		return
	var n := _pts.size()
	_pts.append(Vector2(x * 2.0, y * 2.0))
	_pts.append(Vector2((x + w) * 2.0, y * 2.0))
	_pts.append(Vector2((x + w) * 2.0, (y + h) * 2.0))
	_pts.append(Vector2(x * 2.0, (y + h) * 2.0))
	var col := Color(_style.r * _alpha, _style.g * _alpha, _style.b * _alpha, _alpha) if premul else Color(_style, _alpha)
	_cols.append(col)
	_cols.append(col)
	_cols.append(col)
	_cols.append(col)
	_idx.append(n)
	_idx.append(n + 1)
	_idx.append(n + 2)
	_idx.append(n)
	_idx.append(n + 2)
	_idx.append(n + 3)


## The whole screen (overV3's flash: g.canvas whole).
func _fill_screen() -> void:
	if _rec != null:
		_rec.append("s,%s,%s" % [_style.to_html(false).to_lower(), _q(_alpha)])
		return
	var r: Rect2 = fx.view_rect() if fx != null and fx.has_method("view_rect") else Rect2(-4000, -4000, 8000, 8000)
	_fill(r.position.x / 2.0, r.position.y / 2.0, r.size.x / 2.0, r.size.y / 2.0)


## What has been laid, drawn on `c` at once.
func _flush(c: CanvasItem) -> void:
	if _rec != null or c == null:
		_pts = PackedVector2Array()
		_cols = PackedColorArray()
		_idx = PackedInt32Array()
		return
	if not _idx.is_empty():
		RenderingServer.canvas_item_add_triangle_array(c.get_canvas_item(), _idx, _pts, _cols)
	_pts = PackedVector2Array()
	_cols = PackedColorArray()
	_idx = PackedInt32Array()


# =====================================================================================================================
# Bits the looks are made of (volatile3.ts: copied there from fx.ts and melds3.ts, and so here)

func _pline(x0f: float, y0f: float, x1f: float, y1f: float, color) -> void:
	var x0 := _ri(x0f)
	var y0 := _ri(y0f)
	var x1 := _ri(x1f)
	var y1 := _ri(y1f)
	var dx := absi(x1 - x0)
	var dy := -absi(y1 - y0)
	var sx := 1 if x0 < x1 else -1
	var sy := 1 if y0 < y1 else -1
	var err := dx + dy
	_fs(color)
	if _rec != null or _alpha <= 0.0:
		for n in 600:
			_fill(x0, y0, 1, 1)
			if x0 == x1 and y0 == y1:
				break
			var e2 := 2 * err
			if e2 >= dy:
				err += dy
				x0 += sx
			if e2 <= dx:
				err += dx
				y0 += sy
		return
	# (drawing: a row's run of dots laid as one block, the same dots)
	var rx := x0
	var ry := y0
	var run := 0
	for n in 600:
		if run > 0 and y0 != ry:
			_fill(rx, ry, run, 1)
			run = 0
		if run == 0:
			rx = x0
			ry = y0
			run = 1
		elif x0 == rx + run:
			run += 1
		elif x0 == rx - 1:
			rx -= 1
			run += 1
		else:
			_fill(rx, ry, run, 1)
			rx = x0
			run = 1
		if x0 == x1 and y0 == y1:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			x0 += sx
		if e2 <= dx:
			err += dx
			y0 += sy
	if run > 0:
		_fill(rx, ry, run, 1)


func _thick(x0: float, y0: float, x1: float, y1: float, color, w: int) -> void:
	for i in w:
		var o := i - int(floorf((w - 1) / 2.0))
		_pline(x0 + o, y0, x1 + o, y1, color)


## A flat ellipse on the floor, r in tiles (squash < 1: flatter).
func _ellipse(cx: float, cy: float, r: float, color: Color, alpha: float, squash := 1.0) -> void:
	if alpha <= 0.0 or r <= 0.0:
		return
	_oval(cx, cy, maxf(1.0, r * 22.6), maxf(1.0, r * 11.3 * squash), color, alpha)


## A filled oval, crisp, a row of whole pixels at a time; `rag` its edge torn row by row, `hole` its middle cut out.
func _oval(cx: float, cy: float, rx: float, ry: float, color: Color, alpha := 1.0, rag := 0.0, sd := 0, hole := 0.0) -> void:
	if alpha <= 0.0 or rx < 0.5 or ry < 0.5:
		return
	_ga(minf(1.0, alpha))
	_fs(color)
	var x0 := _ri(cx)
	var y0 := _ri(cy)
	var h := int(ceilf(ry))
	for dy in range(-h, h + 1):
		var q := dy / ry
		if q * q > 1.0:
			continue
		var torn := (_h(sd, dy + 999, 5) - 0.5) * 2.0 * rag if rag != 0.0 else 0.0
		var half := _ri(rx * sqrt(1.0 - q * q) + torn)
		if half < 0:
			continue
		var ih := -1
		if hole > 0.0 and (q / hole) * (q / hole) < 1.0:
			ih = _ri(rx * hole * sqrt(1.0 - (q / hole) * (q / hole)) + ((_h(sd, dy + 333, 6) - 0.5) * rag if rag != 0.0 else 0.0))
		if ih < 0:
			_fill(x0 - half, y0 + dy, half * 2 + 1, 1)
		elif ih < half:
			_fill(x0 - half, y0 + dy, half - ih, 1)
			_fill(x0 + ih + 1, y0 + dy, half - ih, 1)
	_ga(1.0)


## Dots round a ring of radius r tiles on the floor.
func _rim(cx: float, cy: float, r: float, color: Color, gap := 2, from := 0.0, sweep := TAU, size := 1) -> void:
	var n := maxi(8, _ri((r * 22.6 * TAU) / (gap + 1)))
	_fs(color)
	var i := 0
	while i <= n * (sweep / TAU):
		var a := from + (float(i) / n) * TAU
		_fill(_ri(cx + cos(a) * r * 22.6), _ri(cy + sin(a) * r * 11.3), size, size)
		i += 1


static func _on_floor(cx: float, cy: float, a: float, r: float) -> PackedFloat64Array:
	return PackedFloat64Array([cx + cos(a) * r * 22.6, cy + sin(a) * r * 11.3])


## (fx.ts add: the particle made whatever, kept if there is room: fx.gd's own add keeps to its 900)
func _add(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, col: Color, size: float, grav: float, ramp = null, streak := 0.0) -> void:
	fx.add(x, y, z, vx, vy, vz, life, col, size, grav, ramp, streak)


## Things flung out from (x, y): along (dx, dy) if given, otherwise all round.
func _fling(x: float, y: float, n: int, colors: PackedColorArray, o: Dictionary) -> void:
	var has_base: bool = o.has("dx") and o.has("dy")
	var base := atan2(float(o["dy"]), float(o["dx"])) if has_base else 0.0
	var speed: float = o["speed"]
	for i in n:
		var a: float = (_r() * TAU) if not has_base else base + _rnd(-1, 1) * float(o.get("spread", 0.5))
		var s := _rnd(0.45, 1) * speed
		var d := _rnd(0, float(o.get("r", 0.15)))
		var life := _rnd(0.6, 1) * float(o.get("life", 0.5))
		var z := float(o.get("z", 8.0)) + _rnd(-2, 2)
		var vz := _rnd(0.5, 1) * float(o.get("up", 0.0))
		var col := _pick(colors)
		var size: float = float(o["size"]) if o.has("size") else (2.0 if _r() < 0.35 else 1.0)
		_add(x + cos(a) * d, y + sin(a) * d, z, cos(a) * s, sin(a) * s, vz, life, col, size, float(o.get("grav", 0.0)), o.get("ramp"), float(o.get("streak", 0.0)))


## Soft puffs that rise and darken, from (x, y) within `r`; `out` pushes them out from the middle.
func _puffs(x: float, y: float, r: float, n: int, ramp: PackedColorArray, o := {}) -> void:
	for i in n:
		var a := _r() * TAU
		var d := sqrt(_r()) * r
		var life := _rnd(0.7, 1.2) * float(o.get("life", 0.9))
		var out := float(o.get("out", 0.0)) * _rnd(0.6, 1.1)
		var z := float(o.get("z", 4.0)) + _rnd(0, 6)
		var drift := float(o.get("drift", 0.3))
		var vx := cos(a) * out + _rnd(-1, 1) * drift
		var vy := sin(a) * out + _rnd(-1, 1) * drift
		var vz := _rnd(0.5, 1) * float(o.get("up", 26.0))
		_add(x + cos(a) * d, y + sin(a) * d, z, vx, vy, vz, life, ramp[0], float(o.get("size", 3.0)), -4.0, ramp)


func _ring(x: float, y: float, r: float, dur: float, colors: PackedColorArray, o := {}) -> void:
	fx.ring(x, y, r, dur, colors, o.get("fill", false), o)


func _flash(x: float, y: float, z: float, r: float, dur: float, colors: PackedColorArray) -> void:
	fx.flash(x, y, z, r, dur, colors)


func _glow(x: float, y: float, r: float, dur: float) -> void:
	fx.glow(x, y, r, dur)


func _later(t: float, fn: Callable) -> void:
	later.append({"t": t, "fn": fn})


## The whole screen lit for an instant.
func _screen_flash(color: Color, a: float, dur := 0.09) -> void:
	if float(flash["t"]) < float(flash["dur"]) and float(flash["a"]) > a:
		return
	flash = {"t": 0.0, "dur": dur, "color": color, "a": a}


## A jagged way from (x0, y0) to (x1, y1), world points.
func _jagged(x0: float, y0: float, x1: float, y1: float, wob := 0.3) -> PackedFloat64Array:
	var pts := PackedFloat64Array([x0, y0])
	var segs := maxi(3, mini(10, _ri(_hyp(x1 - x0, y1 - y0) * 2.2)))
	for i in range(1, segs):
		var k := float(i) / segs
		var px := x0 + (x1 - x0) * k + _rnd(-wob, wob)
		var py := y0 + (y1 - y0) * k + _rnd(-wob, wob)
		pts.append(px)
		pts.append(py)
	pts.append(x1)
	pts.append(y1)
	return pts


## A bolt along the ground from (x0, y0) to (x1, y1), growing out along it over `grow` seconds.
func _arc(x0: float, y0: float, x1: float, y1: float, C: PackedColorArray, o := {}) -> void:
	var pts := _jagged(x0, y0, x1, y1, float(o.get("wob", 0.3)))
	var forks: Array = []
	var n := pts.size() / 2.0
	for f in int(o.get("forks", 0)):
		var at := 1 + int(floorf(_r() * maxf(1.0, n - 2.0)))
		var sgn := -1.0 if _r() < 0.5 else 1.0
		var a := atan2(y1 - y0, x1 - x0) + sgn * _rnd(0.6, 1.3)
		var len := _rnd(0.4, 0.9)
		forks.append({"at": at, "pts": _jagged(pts[at * 2], pts[at * 2 + 1], pts[at * 2] + cos(a) * len, pts[at * 2 + 1] + sin(a) * len, 0.12)})
	arcs.append({"pts": pts, "t": 0.0, "dur": float(o.get("dur", 0.22)), "grow": float(o.get("grow", 0.0)), "w": int(o.get("w", 1)), "z": float(o.get("z", 10.0)), "C": C, "forks": forks})
	if arcs.size() > 60:
		arcs.pop_front()


func _lob(word: String, kind: String, x0: float, y0: float, x1: float, y1: float, dur: float, h: float, size: int, hit = null, delay := 0.0) -> void:
	lobs.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "t": -delay, "dur": dur, "h": h, "kind": kind, "spin": _r() * 4.0, "size": size, "word": word, "hit": hit})
	if lobs.size() > 120:
		lobs.pop_front()


func _scar(word: String, kind: String, x: float, y: float, r: float, dur: float, n := 7) -> Dictionary:
	var sd := int(floorf(_r() * 1e6))
	var lines: Array = []
	var a0 := _r() * TAU
	for k in n:
		var a := a0 + (float(k) / n) * TAU + (_h(sd, k, 1) - 0.5) * 0.6
		var len := r * (0.6 + _h(sd, k, 2) * 0.5)
		var pts := PackedFloat64Array([cos(a) * r * 0.1, sin(a) * r * 0.1])
		for i in range(1, 4):
			var d := (len * i) / 3.0
			var j := (_h(sd, k * 4 + i, 3) - 0.5) * r * 0.25
			pts.append(cos(a) * d - sin(a) * j)
			pts.append(sin(a) * d + cos(a) * j)
		lines.append(pts)
	var s := {"x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "kind": kind, "seed": sd, "lines": lines, "word": word}
	scars.append(s)
	if scars.size() > 40:
		scars.pop_front()
	return s


## Every monster within `r` of (x, y) jolts away from it, its picture only.
func _jolt_round(x: float, y: float, r: float, px: float) -> void:
	for m: Dictionary in mons:
		if m["dead"]:
			continue
		var d := _hyp(float(m["x"]) - x, float(m["y"]) - y)
		if d > r or d < 0.05:
			continue
		jolts.append({"id": m["id"], "dx": (float(m["x"]) - x) / d, "dy": (float(m["y"]) - y) / d, "t": 0.0, "dur": 0.32, "px": px * (1.0 - (d / r) * 0.6)})
	if jolts.size() > 40:
		jolts = jolts.slice(jolts.size() - 40)


func _mark_of(id) -> Dictionary:
	var key := int(id)
	if not marks.has(key):
		marks[key] = {"white": 9.0, "crackle": 0.0}
	return marks[key]


func _mon(id) -> Variant:
	for m: Dictionary in mons:
		if m["id"] == id:
			return m
	return null


## Volatile's own: violet crackle jumping about the place, popping.
func _crackle(x: float, y: float, r: float, n: int) -> void:
	for i in n:
		var a := _r() * TAU
		var d := sqrt(_r()) * r
		var b := a + _rnd(1.2, 2.6)
		var x1 := x + cos(b) * d * _rnd(0.4, 1)
		var y1 := y + sin(b) * d * _rnd(0.4, 1)
		var z := _rnd(4, 14)
		_arc(x + cos(a) * d, y + sin(a) * d, x1, y1, VIOLET, {"w": 1, "dur": 0.12, "wob": 0.12, "z": z})
	_fling(x, y, n * 2, PackedColorArray([P["white"], P["pu5"], P["pu4"]]), {"speed": 3.0, "up": 30.0, "grav": 60.0, "life": 0.22, "z": 10.0, "r": r * 0.8, "size": 1, "streak": 2.0})


func _pop_later(x: float, y: float, r: float, n: int) -> void:
	for k in range(1, n + 1):
		_later(0.08 * k + _rnd(0, 0.06), func() -> void:
			var a := _r() * TAU
			var d := sqrt(_r()) * r
			_flash(x + cos(a) * d, y + sin(a) * d, 8.0, 0.25, 0.07, VIOLET)
			_crackle(x + cos(a) * d, y + sin(a) * d, 0.25, 1))


# =====================================================================================================================
# DEMOLITION (Power + Volatile): the biggest blast there is.

func _demolition_blast(x: float, y: float, r: float, scale := 1.0) -> void:
	var C: PackedColorArray = RAMP["demolition"]
	var big := scale > 1.1
	fx.hold(0.13 if big else 0.09)
	fx.kick(11.0 if big else 8.0)
	_screen_flash(C[4], 0.34 if big else 0.24, 0.12 if big else 0.09)
	_flash(x, y, 10.0, minf(2.0, r * 0.45), 0.14, PackedColorArray([C[5], C[5], C[4], C[3]]))
	domes.append({"x": x, "y": y, "r": r * 0.72, "t": 0.0, "dur": 0.42 if big else 0.34, "kind": "blast", "word": "demolition", "rise": 0.0})
	# the shockwave: a white ring racing out over the floor, a ring of dust rolling after it
	_ring(x, y, r * 1.15, 0.3, PackedColorArray([C[5], C[4], C[3], C[2]]), {"heavy": true})
	_ring(x, y, r * 1.45, 0.48, PackedColorArray([C[3], C[2], C[1]]), {"delay": 0.06, "heavy": true})
	var rollers := _ri(14 * scale)
	for i in rollers:
		var a := (float(i) / rollers) * TAU + _rnd(-0.15, 0.15)
		var vz := _rnd(4, 14)
		_add(x + cos(a) * r * 0.3, y + sin(a) * r * 0.3, 2.0, cos(a) * r * 2.6, sin(a) * r * 2.6, vz, 0.6, C[3], 3.0, -4.0, PackedColorArray([C[4], C[3], C[2], C[1]]))
	# rubble: flagstones and stones thrown high, tumbling, coming down hard
	var chunks := _ri(13 * scale)
	for i in chunks:
		var a := _r() * TAU
		var d := r * _rnd(0.6, 1.5)
		var dur := _rnd(0.5, 0.85)
		var h := _rnd(40, 95) * sqrt(scale)
		var size := 3 if _r() < 0.4 else 2
		var delay := _rnd(0, 0.04)
		_lob("demolition", "rubble", x, y, x + cos(a) * d, y + sin(a) * d, dur, h, size, null, delay)
	# grit, and red-hot sparks (Power's red) streaking out
	_fling(x, y, _ri(16 * scale), PackedColorArray([C[2], C[1], Color("#3a2e44")]), {"speed": 4.5, "up": 120.0, "grav": 520.0, "life": 0.7, "z": 4.0, "size": 2})
	_fling(x, y, _ri(20 * scale), PackedColorArray([P["white"], P["bl5"], P["bl4"]]), {"speed": 8.0, "up": 50.0, "grav": 160.0, "life": 0.32, "z": 10.0, "streak": 4.0, "size": 1})
	# the violet crackle of Volatile through it, and it pops again
	_crackle(x, y, r * 0.7, _ri(4 * scale))
	_pop_later(x, y, r * 0.8, 4 if big else 2)
	# the mushroom of dust standing up off it, the low cloud rolling out
	_later(0.08, func() -> void:
		_puffs(x, y, 0.35, _ri(12 * scale), PackedColorArray([C[4], C[3], C[3], C[2], C[1]]), {"up": 70.0 * sqrt(scale), "z": 8.0, "life": 1.5, "drift": 0.25, "size": 3.0})
		_puffs(x, y, r * 0.5, _ri(12 * scale), PackedColorArray([C[3], C[2], C[2], C[1]]), {"up": 8.0, "z": 1.0, "life": 1.2, "out": 1.6, "drift": 0.2}))
	_scar("demolition", "crater", x, y, r * 0.5 * sqrt(scale), 5.0 if big else 3.5, 9)
	_jolt_round(x, y, r * 1.6, 5.0 if big else 3.5)
	_glow(x, y, 80.0 + r * 22.0 * scale, 0.4)


func _demolition_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["demolition"]
	fx.kick(4.5 if big else 3.0)
	_flash(x, y, 10.0, minf(1.2, r * 0.4) if big else 0.5, 0.1, PackedColorArray([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.85, 0.24, PackedColorArray([C[5], C[4], C[3]]), {"heavy": true})
	_fling(x, y, 12 if big else 7, PackedColorArray([C[3], C[2], Color("#3a2e44")]), {"speed": 2.6, "up": 90.0, "grav": 480.0, "life": 0.5, "z": 6.0, "size": 2})
	_fling(x, y, 10 if big else 6, PackedColorArray([P["white"], P["bl5"], P["bl4"]]), {"speed": 6.0, "up": 40.0, "grav": 160.0, "life": 0.24, "z": 10.0, "streak": 3.0, "size": 1})
	_puffs(x, y, r * 0.5 if big else 0.3, 7 if big else 4, PackedColorArray([C[3], C[2], C[1]]), {"up": 18.0, "z": 2.0, "life": 0.8, "out": 0.8})
	_crackle(x, y, 0.4, 2)


## An elite or a boss goes off at half its life: light bursts out of it in rays, then the blast, bigger still.
func _demolition_half(e: Dictionary) -> void:
	var mk := _mark_of(e["id"])
	mk["white"] = 0.0
	mk["crackle"] = 0.5
	var C: PackedColorArray = RAMP["demolition"]
	var ex: float = e["x"]
	var ey: float = e["y"]
	var er: float = e["r"]
	for i in 8:
		var a := (float(i) / 8.0) * TAU + _rnd(-0.2, 0.2)
		spears.append({"x": ex, "y": ey, "dx": cos(a), "dy": sin(a), "len": er * _rnd(0.9, 1.3), "t": 0.0, "dur": 0.3, "word": "demolition"})
	pillars.append({"x": ex, "y": ey, "w": 10.0, "t": 0.0, "dur": 0.36, "word": "demolition"})
	_demolition_blast(ex, ey, er, 1.25)
	_fling(ex, ey, 10, PackedColorArray([C[5], C[4]]), {"speed": 1.2, "up": 160.0, "grav": 200.0, "life": 0.6, "z": 20.0, "size": 2})


# =====================================================================================================================
# POWDERKEG (Flame + Volatile): a fireball.

func _powderkeg_blast(x: float, y: float, r: float, scale := 1.0) -> void:
	var C: PackedColorArray = RAMP["powderkeg"]
	fx.hold(0.07 * scale)
	fx.kick(6.5 * scale)
	_screen_flash(Color("#ffb060"), 0.2 * scale, 0.09)
	_flash(x, y, 12.0, minf(1.8, r * 0.5), 0.13, PackedColorArray([C[5], C[5], C[4], Color("#ff8a2a")]))
	domes.append({"x": x, "y": y, "r": r * 0.62 * scale, "t": 0.0, "dur": 0.62 * sqrt(scale), "kind": "fireball", "word": "powderkeg", "rise": 26.0 * scale})
	_ring(x, y, r * 1.1, 0.3, PackedColorArray([C[5], C[4], Color("#ff8a2a"), C[3]]), {"heavy": true})
	_ring(x, y, r * 1.35, 0.42, PackedColorArray([Color("#3a2a2a"), Color("#2a1e1e"), Color("#1a1212")]), {"delay": 0.06})
	# burning pieces of the keg thrown out, landing and burning
	var n := _ri(9 * scale)
	for i in n:
		var a := _r() * TAU
		var d := r * _rnd(0.5, 1.4)
		var ex := x + cos(a) * d
		var ey := y + sin(a) * d
		var dur := _rnd(0.4, 0.7)
		var h := _rnd(36, 70)
		_lob("powderkeg", "ember", x, y, ex, ey, dur, h, 2, func() -> void:
			fx.flames(ex, ey, 0.12, 2, 0.9)
			_fling(ex, ey, 3, PackedColorArray([C[5], C[4]]), {"speed": 1.2, "up": 50.0, "grav": 300.0, "life": 0.3, "z": 2.0, "size": 1}))
	# the powder spits: sparks of white, gold and violet streaking out
	_fling(x, y, _ri(26 * scale), PackedColorArray([P["white"], C[5], C[4], P["pu5"], P["pu4"]]), {"speed": 8.0, "up": 70.0, "grav": 200.0, "life": 0.34, "z": 10.0, "streak": 3.0, "size": 1})
	fx.flames(x, y, r * 0.5, _ri(10 * scale), 1.6)
	_crackle(x, y, r * 0.6, 3)
	# and it pops again: little blasts of powder about it, one after another
	for k in range(1, _ri(3 * scale) + 1):
		_later(0.1 * k + _rnd(0, 0.07), func() -> void:
			var a := _r() * TAU
			var d := r * _rnd(0.3, 0.8)
			var px := x + cos(a) * d
			var py := y + sin(a) * d
			domes.append({"x": px, "y": py, "r": 0.38, "t": 0.0, "dur": 0.3, "kind": "fireball", "word": "powderkeg", "rise": 8.0})
			_flash(px, py, 8.0, 0.3, 0.07, PackedColorArray([C[5], C[4], P["pu5"]]))
			_fling(px, py, 6, PackedColorArray([C[5], C[4], P["pu5"]]), {"speed": 4.0, "up": 40.0, "grav": 160.0, "life": 0.25, "z": 8.0, "streak": 2.0, "size": 1}))
	_scar("powderkeg", "scorch", x, y, r * 0.55, 3.2, 9)
	_glow(x, y, 70.0 + r * 20.0, 0.45)


func _powderkeg_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["powderkeg"]
	_flash(x, y, 10.0, minf(1.1, r * 0.4) if big else 0.45, 0.1, PackedColorArray([C[5], C[4], Color("#ff8a2a")]))
	_ring(x, y, r if big else 0.75, 0.22, PackedColorArray([C[5], C[4], C[3]]), {"heavy": big})
	fx.flames(x, y, r * 0.5 if big else 0.2, 6 if big else 3, 1.1)
	_fling(x, y, 14 if big else 8, PackedColorArray([P["white"], C[5], C[4], P["pu5"]]), {"speed": 6.0, "up": 50.0, "grav": 180.0, "life": 0.26, "z": 10.0, "streak": 2.0, "size": 1})
	_puffs(x, y, 0.2, 4 if big else 2, PackedColorArray([Color("#4a3a36"), Color("#33282a"), Color("#221c1e")]), {"up": 24.0, "z": 10.0, "life": 0.8})
	_crackle(x, y, 0.35, 1)


## The blast sets one alight: a burning piece flies at it and bursts into flame on it.
func _powderkeg_catch(e: Dictionary) -> void:
	var C: PackedColorArray = RAMP["powderkeg"]
	var x0: float = e["x0"]
	var y0: float = e["y0"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	var id = e["id"]
	var d := _hyp(x1 - x0, y1 - y0)
	_lob("powderkeg", "ember", x0, y0, x1, y1, 0.12 + d * 0.06, 18.0 + d * 6.0, 3, func() -> void:
		_flash(x1, y1, 12.0, 0.5, 0.1, PackedColorArray([C[5], C[4], Color("#ff8a2a")]))
		fx.flames(x1, y1, 0.3, 7, 1.5)
		_ring(x1, y1, 0.7, 0.24, PackedColorArray([C[5], C[4], Color("#ff8a2a"), C[3]]))
		_fling(x1, y1, 8, PackedColorArray([C[5], C[4], P["pu5"]]), {"speed": 3.5, "up": 70.0, "grav": 200.0, "life": 0.3, "z": 12.0, "streak": 2.0, "size": 1})
		var mk := _mark_of(id)
		mk["white"] = 0.05)


# =====================================================================================================================
# SHATTER (Frost + Volatile): the frozen one bursts.

func _shatter_blast(x: float, y: float, r: float, scale := 1.0) -> void:
	var C: PackedColorArray = RAMP["shatter"]
	fx.hold(0.08 * scale)
	fx.kick(6.0 * scale)
	_screen_flash(C[4], 0.22 * scale, 0.08)
	_flash(x, y, 12.0, minf(1.6, r * 0.45), 0.12, PackedColorArray([C[5], C[5], C[4], C[3]]))
	domes.append({"x": x, "y": y, "r": r * 0.5 * scale, "t": 0.0, "dur": 0.24, "kind": "pop", "word": "shatter", "rise": 0.0})
	_ring(x, y, r * 1.1, 0.28, PackedColorArray([C[5], C[4], C[3]]), {"heavy": true, "jag": true})
	_ring(x, y, r * 1.3, 0.4, PackedColorArray([C[4], C[3], C[2]]), {"delay": 0.05})
	# spears of ice racing out over the floor
	var n := _ri(9 * scale)
	var a0 := _r() * TAU
	for i in n:
		var a := a0 + (float(i) / n) * TAU + _rnd(-0.18, 0.18)
		spears.append({"x": x, "y": y, "dx": cos(a), "dy": sin(a), "len": r * _rnd(0.7, 1.15) * scale, "t": 0.0, "dur": 0.5, "word": "shatter"})
	# shards flung every way, glinting; chunks of ice coming down hard
	_fling(x, y, _ri(30 * scale), PackedColorArray([P["white"], C[5], C[4], C[4], C[3]]), {"speed": 8.5, "up": 70.0, "grav": 260.0, "life": 0.42, "z": 12.0, "streak": 5.0, "size": 1})
	for i in _ri(12 * scale):
		var a := _r() * TAU
		var s := _rnd(1.4, 4.2)
		var z := _rnd(10, 20)
		var vz := _rnd(90, 170)
		var life := _rnd(0.5, 0.8)
		var col := _pick(PackedColorArray([C[5], C[4], C[3]]))
		var size := 3.0 if _r() < 0.5 else 2.0
		_add(x, y, z, cos(a) * s, sin(a) * s, vz, life, col, size, 560.0)
	_puffs(x, y, r * 0.5, _ri(10 * scale), PackedColorArray([C[5], C[4], C[4], C[3]]), {"up": 10.0, "z": 2.0, "life": 0.9, "out": 1.2, "drift": 0.2})
	_crackle(x, y, r * 0.6, 3)
	_pop_later(x, y, r * 0.6, 2)
	_scar("shatter", "frost", x, y, r * 0.75 * scale, 3.0, 8)
	_glow(x, y, 60.0 + r * 20.0, 0.3)


func _shatter_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["shatter"]
	_flash(x, y, 12.0, minf(1.1, r * 0.4) if big else 0.45, 0.1, PackedColorArray([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.75, 0.22, PackedColorArray([C[5], C[4], C[3]]), {"jag": true})
	_fling(x, y, 16 if big else 9, PackedColorArray([P["white"], C[5], C[4]]), {"speed": 6.0, "up": 50.0, "grav": 220.0, "life": 0.3, "z": 12.0, "streak": 3.0, "size": 1})
	_fling(x, y, 6 if big else 3, PackedColorArray([C[4], C[3]]), {"speed": 2.0, "up": 90.0, "grav": 520.0, "life": 0.5, "z": 12.0, "size": 2})
	_crackle(x, y, 0.35, 1)


## A shard from the burst flies straight at one near it and bursts on it.
func _shatter_shard(e: Dictionary) -> void:
	var C: PackedColorArray = RAMP["shatter"]
	var x0: float = e["x0"]
	var y0: float = e["y0"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	var id = e["id"]
	var d := _hyp(x1 - x0, y1 - y0)
	_lob("shatter", "shard", x0, y0, x1, y1, 0.06 + d * 0.035, 0.0, 3, func() -> void:
		_flash(x1, y1, 14.0, 0.45, 0.09, PackedColorArray([C[5], C[4], C[3]]))
		_ring(x1, y1, 0.6, 0.2, PackedColorArray([C[5], C[4], C[3]]), {"jag": true})
		_fling(x1, y1, 10, PackedColorArray([P["white"], C[5], C[4]]), {"speed": 4.5, "up": 60.0, "grav": 240.0, "life": 0.3, "z": 14.0, "streak": 3.0, "size": 1, "dx": x1 - x0, "dy": y1 - y0, "spread": 0.9})
		var mk := _mark_of(id)
		mk["white"] = 0.0
		mk["crackle"] = maxf(float(mk["crackle"]), 0.25))


## Its rune freezes what is near: a sheet of ice sweeps out over the floor, and what it reaches is lit white.
func _shatter_freeze(e: Dictionary) -> void:
	var C: PackedColorArray = RAMP["shatter"]
	var ex: float = e["x"]
	var ey: float = e["y"]
	var er: float = e["r"]
	freezes.append({"x": ex, "y": ey, "r": er, "t": 0.0, "dur": 9.0, "seed": int(floorf(_r() * 1e6))})
	_ring(ex, ey, er, 0.32, PackedColorArray([C[5], C[4], C[3]]), {"heavy": true, "fill": true})
	_flash(ex, ey, 4.0, minf(1.6, er * 0.45), 0.1, PackedColorArray([C[5], C[4], C[3]]))
	_puffs(ex, ey, er * 0.8, 14, PackedColorArray([C[5], C[4], C[3]]), {"up": 8.0, "z": 1.0, "life": 1.0, "out": 0.6})
	for id in e.get("ids", []):
		var m = _mon(id)
		if m == null:
			continue
		_mark_of(id)["white"] = 0.0
		var dict: Dictionary = m
		_later(_hyp(float(m["x"]) - ex, float(m["y"]) - ey) * 0.05, func() -> void:
			# (where it is now)
			var now = _mon(id)
			var mm: Dictionary = now if now != null else dict
			_flash(mm["x"], mm["y"], 14.0, 0.5, 0.1, PackedColorArray([C[5], C[4]]))
			_fling(mm["x"], mm["y"], 8, PackedColorArray([P["white"], C[5], C[4]]), {"speed": 1.5, "up": 60.0, "grav": 120.0, "life": 0.4, "z": 8.0, "size": 1}))
	_glow(ex, ey, 50.0 + er * 20.0, 0.3)


## Its rune going off: ice spikes burst up out of the floor all over it, stand a moment, and break into shards.
func _shatter_rune_go(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["shatter"]
	var n := _ri(10 + r * 6)
	for i in n:
		var a := _r() * TAU
		var d := sqrt(_r()) * r * 0.95
		var sx := x + cos(a) * d
		var sy := y + sin(a) * d
		var delay := (d / maxf(0.1, r)) * 0.12
		var tall := _rnd(14, 30) * (1.0 - (d / r) * 0.35)
		spikes.append({"x": sx, "y": sy, "tall": tall, "w": 3 if tall > 22.0 else 2, "t": -delay, "dur": 0.55})
		_later(delay + 0.4, func() -> void:
			_fling(sx, sy, 5, PackedColorArray([P["white"], C[5], C[4], C[3]]), {"speed": 3.5, "up": 80.0, "grav": 300.0, "life": 0.4, "z": tall * 0.5, "streak": 3.0, "size": 1})
			var vx := _rnd(-1, 1)
			var vy := _rnd(-1, 1)
			var vz := _rnd(40, 90)
			_add(sx, sy, tall * 0.6, vx, vy, vz, 0.5, C[4], 2.0, 520.0))
	_later(0.4, func() -> void:
		_shatter_blast(x, y, r * 0.8, 1.15)
		pillars.append({"x": x, "y": y, "w": 8.0, "t": 0.0, "dur": 0.26, "word": "shatter"}))
	fx.kick(5.0)
	_flash(x, y, 4.0, minf(1.6, r * 0.5), 0.1, PackedColorArray([C[5], C[4], C[3]]))
	_glow(x, y, 60.0 + r * 20.0, 0.6)


# =====================================================================================================================
# CHAIN REACTION (Lightning + Volatile): an explosion of lightning.

func _chain_blast(x: float, y: float, r: float, scale := 1.0) -> void:
	var C: PackedColorArray = RAMP["chainreaction"]
	fx.hold(0.06 * scale)
	fx.kick(5.5 * scale)
	_screen_flash(C[3], 0.2 * scale, 0.07)
	_flash(x, y, 12.0, minf(1.6, r * 0.45), 0.12, PackedColorArray([C[5], C[4], C[3]]))
	domes.append({"x": x, "y": y, "r": r * 0.55 * scale, "t": 0.0, "dur": 0.3, "kind": "storm", "word": "chainreaction", "rise": 0.0})
	_ring(x, y, r * 1.1, 0.26, PackedColorArray([C[5], C[4], C[3], C[2]]), {"heavy": true, "jag": true})
	_ring(x, y, r * 0.7, 0.2, PackedColorArray([C[5], C[4], C[3]]), {"jag": true, "delay": 0.08})
	var n := _ri(9 * scale)
	for i in n:
		var a := (float(i) / n) * TAU + _rnd(-0.25, 0.25)
		var d := r * _rnd(0.7, 1.15) * scale
		_arc(x, y, x + cos(a) * d, y + sin(a) * d, C, {"w": 2, "dur": 0.24, "grow": 0.06, "wob": 0.22, "z": 4.0, "forks": 1})
	# a second crack a breath after: it goes off twice
	_later(0.09, func() -> void:
		for i in 4:
			var a := _r() * TAU
			_arc(x, y, x + cos(a) * r * 0.8, y + sin(a) * r * 0.8, C, {"w": 1, "dur": 0.16, "wob": 0.2, "z": 6.0})
		_flash(x, y, 10.0, 0.6, 0.07, PackedColorArray([C[5], C[4]])))
	_fling(x, y, _ri(26 * scale), PackedColorArray([P["white"], C[4], C[4], C[3]]), {"speed": 8.0, "up": 40.0, "grav": 120.0, "life": 0.3, "z": 10.0, "streak": 4.0, "size": 1})
	_crackle(x, y, r * 0.7, 3)
	_scar("chainreaction", "star", x, y, r * 0.75, 2.6, 9)
	_glow(x, y, 80.0 + r * 20.0, 0.3)


func _chain_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["chainreaction"]
	_flash(x, y, 12.0, minf(1.1, r * 0.4) if big else 0.45, 0.1, PackedColorArray([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.75, 0.2, PackedColorArray([C[5], C[4], C[3]]), {"jag": true, "heavy": big})
	for i in (5 if big else 3):
		var a := _r() * TAU
		var d := r * _rnd(0.5, 1) if big else _rnd(0.5, 0.9)
		_arc(x, y, x + cos(a) * d, y + sin(a) * d, C, {"w": 1, "dur": 0.14, "wob": 0.15})
	_fling(x, y, 14 if big else 8, PackedColorArray([P["white"], C[4], C[3]]), {"speed": 5.5, "up": 40.0, "grav": 120.0, "life": 0.24, "z": 12.0, "streak": 3.0, "size": 1})


## An arc from the explosion races out to one near it and strikes with a crack; it crackles after.
func _chain_arc(e: Dictionary) -> void:
	var C: PackedColorArray = RAMP["chainreaction"]
	var x0: float = e["x0"]
	var y0: float = e["y0"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	var id = e["id"]
	var d := _hyp(x1 - x0, y1 - y0)
	var grow := 0.05 + d * 0.012
	# (with the switch on, the bolt it sends is Lightning's own, as every bolt bouncing from one to the next is: fx_looks.gd same;
	# its crack where it strikes stays its own)
	if L.same():
		fx.ground_bolt(x0, y0, x1, y1)
	else:
		_arc(x0, y0, x1, y1, C, {"w": 3, "dur": 0.34, "grow": grow, "wob": 0.35, "z": 12.0, "forks": 2})
		_later(grow * 0.5, func() -> void: _arc(x0, y0, x1, y1, C, {"w": 1, "dur": 0.2, "grow": grow * 0.5, "wob": 0.45, "z": 14.0}))
	_later(grow, func() -> void:
		_flash(x1, y1, 14.0, 0.55, 0.1, PackedColorArray([C[5], C[4], C[3]]))
		_ring(x1, y1, 0.7, 0.2, PackedColorArray([C[5], C[4], C[3]]), {"jag": true, "heavy": true})
		_fling(x1, y1, 12, PackedColorArray([P["white"], C[4], C[3]]), {"speed": 5.0, "up": 50.0, "grav": 140.0, "life": 0.26, "z": 14.0, "streak": 3.0, "size": 1})
		fx.kick(3.0)
		var mk := _mark_of(id)
		mk["white"] = 0.0
		mk["crackle"] = maxf(float(mk["crackle"]), 0.6))


## Behind: a rune going off sends a bolt along its link to the next, which flares as it is struck.
func _chain_link(e: Dictionary) -> void:
	var C: PackedColorArray = RAMP["chainreaction"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	if L.same():
		fx.ground_bolt(e["x0"], e["y0"], x1, y1)
	else:
		_arc(e["x0"], e["y0"], x1, y1, C, {"w": 2, "dur": 0.24, "grow": LINK_GAP * 0.8, "wob": 0.25, "z": 3.0, "forks": 2})
	_later(LINK_GAP * 0.8, func() -> void: _flash(x1, y1, 6.0, 0.7, 0.08, PackedColorArray([C[5], C[4], C[3]])))


# =====================================================================================================================
# RUPTURE (Poison + Volatile): the poisoned one bursts like a sac.

func _rupture_blast(x: float, y: float, r: float, scale := 1.0) -> void:
	var C: PackedColorArray = RAMP["rupture"]
	fx.hold(0.06 * scale)
	fx.kick(5.0 * scale)
	_flash(x, y, 12.0, minf(1.5, r * 0.45), 0.12, PackedColorArray([C[5], C[4], C[3]]))
	domes.append({"x": x, "y": y, "r": r * 0.5 * scale, "t": 0.0, "dur": 0.28, "kind": "pop", "word": "rupture", "rise": 4.0})
	_ring(x, y, r * 1.05, 0.32, PackedColorArray([C[4], C[3], C[2]]), {"heavy": true, "fill": true})
	_ring(x, y, r * 0.6, 0.24, PackedColorArray([C[5], C[4], Color("#b4cc24")]), {"delay": 0.05})
	# the gout: bile flung high, falling back
	_fling(x, y, _ri(24 * scale), PackedColorArray([C[5], C[4], C[4], Color("#b4cc24"), C[3]]), {"speed": 3.0, "up": 200.0, "grav": 520.0, "life": 0.8, "z": 10.0, "size": 2, "r": 0.2})
	# globs flung out, splashing where they land
	var n := _ri(9 * scale)
	for i in n:
		var a := _r() * TAU
		var d := r * _rnd(0.4, 1.2)
		var gx := x + cos(a) * d
		var gy := y + sin(a) * d
		var dur := _rnd(0.4, 0.7)
		var h := _rnd(30, 70)
		var size := 3 if _r() < 0.5 else 2
		_lob("rupture", "glob", x, y, gx, gy, dur, h, size, func() -> void:
			_scar("rupture", "splat", gx, gy, _rnd(0.25, 0.42), 2.6, 5)
			_fling(gx, gy, 4, PackedColorArray([C[4], Color("#b4cc24")]), {"speed": 1.4, "up": 40.0, "grav": 320.0, "life": 0.3, "z": 1.0, "size": 1})
			fx.bubbles(gx, gy, 0.15, 2))
	# a breath of sick gas, plum and bile, and bubbles
	_puffs(x, y, r * 0.45, _ri(12 * scale), PackedColorArray([C[4], C[3], C[3], C[2], C[1]]), {"up": 22.0, "z": 4.0, "life": 1.1, "out": 0.8, "drift": 0.25})
	fx.bubbles(x, y, r * 0.5, _ri(8 * scale))
	_crackle(x, y, r * 0.5, 2)
	_pop_later(x, y, r * 0.6, 2)
	_scar("rupture", "splat", x, y, r * 0.55 * scale, 3.0, 8)
	_glow(x, y, 50.0 + r * 18.0, 0.3)


func _rupture_hit(x: float, y: float, r: float, big: bool) -> void:
	var C: PackedColorArray = RAMP["rupture"]
	_flash(x, y, 10.0, minf(1.1, r * 0.4) if big else 0.45, 0.1, PackedColorArray([C[5], C[4], C[3]]))
	_ring(x, y, r if big else 0.75, 0.24, PackedColorArray([C[4], C[3], C[2]]), {"fill": big})
	_fling(x, y, 12 if big else 7, PackedColorArray([C[5], C[4], Color("#b4cc24"), C[3]]), {"speed": 2.4, "up": 90.0, "grav": 420.0, "life": 0.5, "z": 10.0, "size": 2})
	fx.bubbles(x, y, r * 0.6 if big else 0.3, 6 if big else 3)
	_crackle(x, y, 0.35, 1)


## A glob of the burst's poison flies onto one near it and splashes over it.
func _rupture_splash(e: Dictionary) -> void:
	var C: PackedColorArray = RAMP["rupture"]
	var x0: float = e["x0"]
	var y0: float = e["y0"]
	var x1: float = e["x1"]
	var y1: float = e["y1"]
	var id = e["id"]
	var d := _hyp(x1 - x0, y1 - y0)
	_lob("rupture", "glob", x0, y0, x1, y1, 0.16 + d * 0.06, 24.0 + d * 8.0, 3, func() -> void:
		_flash(x1, y1, 14.0, 0.45, 0.1, PackedColorArray([C[5], C[4], C[3]]))
		_ring(x1, y1, 0.6, 0.26, PackedColorArray([C[4], C[3], C[2]]), {"fill": true})
		_fling(x1, y1, 12, PackedColorArray([C[5], C[4], Color("#b4cc24")]), {"speed": 2.5, "up": 70.0, "grav": 380.0, "life": 0.45, "z": 18.0, "size": 2})
		fx.bubbles(x1, y1, 0.3, 5)
		_scar("rupture", "splat", x1, y1, 0.4, 2.4, 5)
		_mark_of(id)["white"] = 0.04)


## Behind, going off: the blister bursts, and the cloud boils up out of it.
func _rupture_rune_go(x: float, y: float, r: float) -> void:
	var C: PackedColorArray = RAMP["rupture"]
	_rupture_blast(x, y, r * 0.75, 1.2)
	_puffs(x, y, r * 0.5, 22, PackedColorArray([C[4], C[3], C[3], C[2], C[1]]), {"up": 30.0, "z": 4.0, "life": 1.4, "out": 1.4, "drift": 0.3})


# =====================================================================================================================
# THE RUNES, going off.

func _demolition_rune_go(x: float, y: float, r: float) -> void:
	pillars.append({"x": x, "y": y, "w": 16.0, "t": 0.0, "dur": 0.42, "word": "demolition"})
	_demolition_blast(x, y, r * 0.85, 1.6)
	# every stone of the ring goes up with it
	var C: PackedColorArray = RAMP["demolition"]
	for i in 10:
		var a := (float(i) / 10.0) * TAU
		_later(0.03 * i, func() -> void:
			var sx := x + cos(a) * r * 0.9
			var sy := y + sin(a) * r * 0.9
			_flash(sx, sy, 6.0, 0.35, 0.08, PackedColorArray([C[5], C[4]]))
			var ex := sx + cos(a) * _rnd(0.6, 1.4)
			var ey := sy + sin(a) * _rnd(0.6, 1.4)
			var dur := _rnd(0.4, 0.6)
			var h := _rnd(30, 60)
			_lob("demolition", "rubble", sx, sy, ex, ey, dur, h, 2))


func _powderkeg_rune_go(x: float, y: float, r: float) -> void:
	_powderkeg_blast(x, y, r * 0.8, 1.35)
	# a column of smoke and fire standing up off it
	_puffs(x, y, 0.3, 14, PackedColorArray([Color("#ff9a50"), Color("#a83c28"), Color("#4a3a36"), Color("#33282a"), Color("#221c1e")]), {"up": 80.0, "z": 10.0, "life": 1.4, "drift": 0.2})


func _chain_rune_go(x: float, y: float, r: float) -> void:
	_chain_blast(x, y, r * 0.75, 1.25)
	# a bolt out of the sky onto it
	pillars.append({"x": x, "y": y, "w": 3.0, "t": 0.0, "dur": 0.26, "word": "chainreaction"})


## The look of one of the five going off: a kill's explosion (`rune` false) or a rune's.
func blast_look(word: String, x: float, y: float, r: float, rune: bool) -> void:
	match word:
		"demolition":
			if rune:
				_demolition_rune_go(x, y, r)
			else:
				_demolition_blast(x, y, r)
		"powderkeg":
			if rune:
				_powderkeg_rune_go(x, y, r)
			else:
				_powderkeg_blast(x, y, r)
		"shatter":
			if rune:
				_shatter_rune_go(x, y, r)
			else:
				_shatter_blast(x, y, r)
		"chainreaction":
			if rune:
				_chain_rune_go(x, y, r)
			else:
				_chain_blast(x, y, r)
		_:
			if rune:
				_rupture_rune_go(x, y, r)
			else:
				_rupture_blast(x, y, r)
	if not rune and word != "demolition":
		_jolt_round(x, y, r * 1.3, 2.5)


## Each one's hit (an attack carrying it striking something): a little of what its blast will be.
func hit_look(word: String, x: float, y: float, r: float, big: bool) -> void:
	match word:
		"demolition":
			_demolition_hit(x, y, r, big)
		"powderkeg":
			_powderkeg_hit(x, y, r, big)
		"shatter":
			_shatter_hit(x, y, r, big)
		"chainreaction":
			_chain_hit(x, y, r, big)
		_:
			_rupture_hit(x, y, r, big)


# =====================================================================================================================
# ON THE FLOOR: the runes as they wait, the patches they leave, the marks of the blasts.

## Which of the five a patch belongs to, if any (its `look`, its `meld`; a patch of his carries no words: game.ts's [] ).
static func meld_of(z: Dictionary):
	var lk = z.get("look")
	if is_meld(lk):
		return lk
	var m = z.get("meld")
	if is_meld(m):
		return m
	for w in z.get("words", []):
		if is_meld(w):
			return w
	return null


## Whether the plain ground's looks should leave this patch to these (a rune of the five, Powderkeg's burning ground, Rupture's
## cloud: ownsZoneV3).
static func owns_zone(z: Dictionary) -> bool:
	var w = meld_of(z)
	if w == null:
		return false
	return z.get("kind") == "rune" or (w == "powderkeg" and z.get("kind") == "burn") or (w == "rupture" and z.get("kind") == "venom")


func _owns(z) -> bool:
	return z is Dictionary and owns_zone(z)


## Whether the effects should leave this telling to these (ownsEventV3): a blast or a rune going off of one of the five.
static func owns_event(e: Dictionary) -> bool:
	return e.get("t") == "burst" and is_meld(e.get("meld"))


## How far a rune has got toward going off, 0 to 1.
static func _rune_k(z: Dictionary) -> float:
	return maxf(0.0, minf(1.0, float(z["t"]) / maxf(0.01, float(z["dur"]))))


## A patch's own shape (shapeOf: its seed and ten lines out from its middle, steady from frame to frame).
static func _shape_of(z: Dictionary) -> Dictionary:
	var sd := int(floorf(float(z["x"]) * 131.0 + float(z["y"]) * 71.0)) & 0xffff
	var zr: float = z["r"]
	var lines: Array = []
	var n := 10
	for k in n:
		var a := (float(k) / n) * TAU + (L.hash2(sd, k, 1) - 0.5) * 0.5
		var pts := PackedFloat64Array([0.0, 0.0])
		for i in range(1, 5):
			var d := (zr * 0.95 * i) / 4.0
			var j := (L.hash2(sd, k * 5 + i, 2) - 0.5) * zr * 0.18
			pts.append(cos(a) * d - sin(a) * j)
			pts.append(sin(a) * d + cos(a) * j)
		lines.append(pts)
	return {"seed": sd, "lines": lines}


## A line of the rune's own drawing, world offsets from its middle, drawn `up_to` of its way.
func _stroke_on(x: float, y: float, pts: PackedFloat64Array, color, up_to := 1.0, w := 1) -> void:
	var n := pts.size() / 2 - 1
	var stop := up_to * n
	var i := 0
	while i < n and i < stop:
		var q := minf(1.0, stop - i)
		var ax := x + pts[i * 2]
		var ay := y + pts[i * 2 + 1]
		var bx := x + pts[i * 2] + (pts[i * 2 + 2] - pts[i * 2]) * q
		var by := y + pts[i * 2 + 1] + (pts[i * 2 + 3] - pts[i * 2 + 1]) * q
		_thick(_wx(ax, ay), _wy(ax, ay), _wx(bx, by), _wy(bx, by), color, w)
		i += 1


static func _poly(n: int, r: float, a0: float) -> PackedFloat64Array:
	var pts := PackedFloat64Array()
	for i in n + 1:
		pts.append(cos(a0 + (float(i) / n) * TAU) * r)
		pts.append(sin(a0 + (float(i) / n) * TAU) * r)
	return pts


static func _circle(r: float, a0 := -PI / 2.0) -> PackedFloat64Array:
	return _poly(40, r, a0)


## The beat of a rune near going off: on and off, faster and faster.
static func _beat_of(k: float, t: float) -> bool:
	return sin(t * (8.0 + k * k * 46.0)) > 0.0


func _draw_rune(t: float, z: Dictionary, word: String) -> void:
	var C: PackedColorArray = RAMP[word]
	var zx: float = z["x"]
	var zy: float = z["y"]
	var cx := _wx(zx, zy)
	var cy := _wy(zx, zy)
	var k := _rune_k(z)
	var write := minf(1.0, float(z["t"]) / 0.3)
	var beat := _beat_of(k, t)
	var hot := k > 0.75
	var lit: Color = (C[5] if beat else C[4]) if hot else (C[4] if beat else C[3])
	var R: float = z["r"]
	var s := _shape_of(z)
	if word == "demolition":
		_ellipse(cx, cy, R, C[0], 0.3 + 0.25 * k)
		_ellipse(cx, cy, R * 0.55, C[1], 0.2 + 0.3 * k)
		_stroke_on(zx, zy, _circle(R * 0.98), C[2], write, 2)
		_stroke_on(zx, zy, _circle(R * 0.9), lit, write)
		_stroke_on(zx, zy, _poly(4, R * 0.62, PI / 4.0 + t * 0.15), lit, maxf(0.0, write * 1.3 - 0.3))
		_stroke_on(zx, zy, _poly(4, R * 0.62, t * 0.15), C[2], maxf(0.0, write * 1.3 - 0.3))
		_stroke_on(zx, zy, _circle(R * 0.3), lit, maxf(0.0, write * 1.5 - 0.5))
		# the floor cracking out from its heart, red-hot at the cracks' ends as they go
		for ln: PackedFloat64Array in s["lines"]:
			_stroke_on(zx, zy, ln, C[1], minf(1.0, k * 1.3), 2)
			_stroke_on(zx, zy, ln, P["bl5"] if hot and beat else C[3], minf(1.0, k * 1.3))
		# the ten charges round the rim, lit in turn
		var charges := 10
		for i in charges:
			var a := -PI / 2.0 + (float(i) / charges) * TAU
			var p: PackedFloat64Array = _on_floor(cx, cy, a, R * 0.9)
			var on := k * charges > i + 0.0001
			var fresh := on and k * charges < i + 1
			_fs(C[1])
			_fill(_ri(p[0]) - 2, _ri(p[1]) - 2, 5, 4)
			_fs(((P["white"] if beat else C[4]) if fresh or hot else P["bl4"]) if on else C[2])
			_fill(_ri(p[0]) - 1, _ri(p[1]) - 1, 3, 2)
			if on:
				_fs(P["white"])
				_fill(_ri(p[0]), _ri(p[1]) - 1, 1, 1)
		# the heart: a diamond, burning
		_fs(C[2])
		_fill(_ri(cx) - 3, _ri(cy) - 1, 7, 3)
		_fill(_ri(cx) - 1, _ri(cy) - 2, 3, 5)
		_fs(lit)
		_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 3)
		# closing in at the end: a ring from its edge to its heart
		if k > 0.8:
			_rim(cx, cy, R * (1.0 - (k - 0.8) / 0.2), P["white"] if beat else C[4], 1)
	elif word == "powderkeg":
		_ellipse(cx, cy, R, Color("#1a1210"), 0.35)
		_rim(cx, cy, R * 0.92, Color("#2a2020"), 1, 0.0, TAU, 2)
		var head := -PI / 2.0 + k * TAU
		var steps := 64
		for i in steps:
			var a := -PI / 2.0 + (float(i) / steps) * TAU
			if a > head:
				break
			var p: PackedFloat64Array = _on_floor(cx, cy, a, R * 0.92)
			var ago := (head - a) / TAU
			_fs(C[5] if ago < 0.06 else (C[4] if ago < 0.16 else (C[3] if ago < 0.3 else C[1])))
			_fill(_ri(p[0]), _ri(p[1]), 2, 2)
		# the keg's sigil: a flame in a ring, three strokes
		_stroke_on(zx, zy, _circle(R * 0.55), C[2], write, 2)
		_stroke_on(zx, zy, _circle(R * 0.55), lit, write)
		for i in 3:
			var a := -PI / 2.0 + (float(i) / 3.0) * TAU + t * 0.6
			_stroke_on(zx, zy, PackedFloat64Array([cos(a) * R * 0.55, sin(a) * R * 0.55, cos(a + 2.2) * R * 0.2, sin(a + 2.2) * R * 0.2]), P["pu5"] if i == 0 and hot else lit, write)
		_fs(P["white"] if hot and beat else C[4])
		_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 2)
		# the spark itself, fizzing
		var hp: PackedFloat64Array = _on_floor(cx, cy, head, R * 0.92)
		_fs(P["white"])
		_fill(_ri(hp[0]) - 1, _ri(hp[1]) - 2, 3, 3)
		_fs(C[5])
		_fill(_ri(hp[0]) - 2, _ri(hp[1]) - 1, 5, 1)
	elif word == "shatter":
		_ellipse(cx, cy, R, C[1], 0.22 + 0.2 * k)
		_stroke_on(zx, zy, _circle(R * 0.95), C[2], write)
		for i in 6:
			var a := -PI / 2.0 + (float(i) / 6.0) * TAU
			var arm := PackedFloat64Array([0.0, 0.0, cos(a) * R * 0.8, sin(a) * R * 0.8])
			_stroke_on(zx, zy, arm, C[2], write, 2)
			_stroke_on(zx, zy, arm, lit, write)
			# barbs on each arm
			for f: float in [0.45, 0.65]:
				var bx := cos(a) * R * 0.8 * f
				var by := sin(a) * R * 0.8 * f
				for side: float in [-1.0, 1.0]:
					var b := a + side * 0.7
					_stroke_on(zx, zy, PackedFloat64Array([bx, by, bx + cos(b) * R * 0.16, by + sin(b) * R * 0.16]), lit, maxf(0.0, write * 1.4 - 0.4))
		_stroke_on(zx, zy, _poly(6, R * 0.32, -PI / 2.0), lit, maxf(0.0, write * 1.5 - 0.5))
		# cracks running through it once it has frozen what is near
		var after := maxf(0.0, (k - FREEZE_AT) / (1.0 - FREEZE_AT))
		if after > 0.0:
			var ls: Array = s["lines"]
			for j in mini(7, ls.size()):
				_stroke_on(zx, zy, ls[j], P["white"] if beat else C[4], after)
		_fs(P["white"] if hot and beat else C[4])
		_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 3)
	elif word == "chainreaction":
		_ellipse(cx, cy, R, C[1], 0.2 + 0.15 * k)
		_stroke_on(zx, zy, _circle(R * 0.85), C[2], write, 2)
		_stroke_on(zx, zy, _circle(R * 0.85), lit, write)
		var bolt := PackedFloat64Array([-R * 0.55, -R * 0.35, -R * 0.05, -R * 0.12, -R * 0.15, R * 0.12, R * 0.55, R * 0.35])
		_stroke_on(zx, zy, bolt, C[2], maxf(0.0, write * 1.4 - 0.4), 3)
		_stroke_on(zx, zy, bolt, P["white"] if hot and beat else C[4], maxf(0.0, write * 1.4 - 0.4))
		# little bolts jumping round its ring
		if int(floorf(t * 14.0 + zx * 3.0)) % 3 == 0:
			var a := _r() * TAU
			var pa: PackedFloat64Array = _on_floor(cx, cy, a, R * 0.85)
			var pb: PackedFloat64Array = _on_floor(cx, cy, a + _rnd(0.4, 0.9), R * 0.85)
			var mx := (pa[0] + pb[0]) / 2.0 + _rnd(-3, 3)
			var my := (pa[1] + pb[1]) / 2.0 + _rnd(-3, 3)
			_pline(pa[0], pa[1], mx, my, C[4])
			_pline((pa[0] + pb[0]) / 2.0, (pa[1] + pb[1]) / 2.0, pb[0], pb[1], C[5])
		# the links, to every other of its kind in reach (drawn once, from the first of the two)
		var zi := -1
		for j in zones.size():
			if is_same(zones[j], z):
				zi = j
				break
		for oi in zones.size():
			var o = zones[oi]
			if not (o is Dictionary) or is_same(o, z) or o.get("kind") != "rune" or meld_of(o) != "chainreaction":
				continue
			var d := _hyp(float(o["x"]) - zx, float(o["y"]) - zy)
			if d > LINK_REACH or oi < zi:
				continue
			var ox := _wx(o["x"], o["y"])
			var oy := _wy(o["x"], o["y"])
			var segs := maxi(4, _ri(d * 3.0))
			var tick := int(floorf(t * 12.0))
			var px := cx
			var py := cy
			for i in range(1, segs + 1):
				var q := float(i) / segs
				var jx := 0.0 if i == segs else (_h(tick, i, 7) - 0.5) * 7.0
				var jy := 0.0 if i == segs else (_h(tick, i, 8) - 0.5) * 4.0
				var nx := cx + (ox - cx) * q + jx
				var ny := cy + (oy - cy) * q + jy
				_ga(0.55 + 0.3 * minf(k, _rune_k(o)))
				_pline(px, py, nx, ny, C[3])
				_ga(1.0)
				px = nx
				py = ny
			# a spark running along it, there and back
			var run := (sin(t * 5.0 + zx) + 1.0) / 2.0
			_fs(P["white"])
			_fill(_ri(cx + (ox - cx) * run) - 1, _ri(cy + (oy - cy) * run) - 1, 2, 2)
		_fs(P["white"] if hot and beat else C[4])
		_fill(_ri(cx) - 1, _ri(cy) - 1, 3, 2)
	else:
		# A BLISTER ON THE FLOOR: a plum ring, and in its middle a swelling of poison, growing and trembling as its time runs out
		_ellipse(cx, cy, R, C[1], 0.3)
		_stroke_on(zx, zy, _circle(R * 0.9), C[2], write, 2)
		_stroke_on(zx, zy, _circle(R * 0.9), lit, write)
		for i in 5:
			var a := -PI / 2.0 + (float(i) / 5.0) * TAU
			_stroke_on(zx, zy, PackedFloat64Array([cos(a) * R * 0.9, sin(a) * R * 0.9, cos(a + 0.4) * R * 0.45, sin(a + 0.4) * R * 0.45]), C[3], maxf(0.0, write * 1.4 - 0.4))
		var swell := 0.12 + 0.24 * _smooth(k)
		var shake := _ri(sin(t * 60.0) * (k - 0.6) * 4.0) if k > 0.6 else 0
		var bx := _ri(cx) + shake
		var by := _ri(cy)
		var rw := _ri(swell * R * 22.6)
		var rh := _ri(swell * R * 11.3)
		var up := _ri(rh * 1.6 + 2.0)
		_oval(bx, by - up + 1, rw + 1, rh + up * 0.6 + 1, C[1])
		_oval(bx, by - up, rw, rh + up * 0.6, C[3])
		_oval(bx, by - up + 1, maxf(1.0, rw - 3), maxf(1.0, rh + up * 0.6 - 3.0), C[5] if hot and beat else C[4])
		# its veins, and the shine on it
		_fs(C[2])
		for i in 4:
			var a := i * 1.7 + 0.4
			_pline(bx, by - up, bx + cos(a) * (rw - 1), by - up + sin(a) * (rh + up * 0.5 - 1.0), C[2])
		_fs(P["white"])
		_fill(bx - _ri(rw * 0.4), by - up - _ri((rh + up * 0.6) * 0.5), 2, 1)


func _scar_line(sx: float, sy: float, ln: PackedFloat64Array, i: int, k: float, color) -> void:
	var ax := sx + ln[i] * k
	var ay := sy + ln[i + 1] * k
	var bx := sx + ln[i + 2] * k
	var by := sy + ln[i + 3] * k
	_pline(_wx(ax, ay), _wy(ax, ay), _wx(bx, by), _wy(bx, by), color)


func _draw_scar(s: Dictionary) -> void:
	var C: PackedColorArray = RAMP[s["word"]]
	var sx: float = s["x"]
	var sy: float = s["y"]
	var cx := _wx(sx, sy)
	var cy := _wy(sx, sy)
	var st: float = s["t"]
	var sr: float = s["r"]
	var sd: int = s["seed"]
	var fade := minf(1.0, (float(s["dur"]) - st) / 0.8)
	var grow := minf(1.0, st / 0.1)
	match str(s["kind"]):
		"crater":
			_ellipse(cx, cy, sr * grow * 1.15, C[2], 0.55 * fade)
			_ellipse(cx, cy, sr * grow, C[0], 0.75 * fade)
			_ellipse(cx, cy + 1.0, sr * grow * 0.6, Color("#06040a"), 0.6 * fade)
			var hot := maxf(0.0, 1.0 - st / 1.4)
			for ln: PackedFloat64Array in s["lines"]:
				_ga(fade)
				var i := 0
				while i + 3 < ln.size():
					_scar_line(sx, sy, ln, i, 1.7, P["bl5"] if hot > 0.5 else (P["bl4"] if hot > 0.15 else C[1]))
					i += 2
			_ga(fade)
			_rim(cx, cy, sr * grow * 1.1, C[3], 3, sd, TAU, 2)
			_ga(1.0)
		"scorch":
			_ellipse(cx, cy, sr * grow, Color("#140c0a"), 0.7 * fade)
			var hot := maxf(0.0, 1.0 - st / 1.6)
			for ln: PackedFloat64Array in s["lines"]:
				_ga(fade)
				var i := 0
				while i + 3 < ln.size():
					_scar_line(sx, sy, ln, i, 1.4, C[4] if hot > 0.5 else (C[3] if hot > 0.1 else Color("#2a1a14")))
					i += 2
			_ga(1.0)
			# embers glowing in it
			if hot > 0.05:
				_fs(C[4])
				for i in 6:
					if _h(sd, i, int(floorf(st * 6.0))) > 0.6 + (1.0 - hot) * 0.3:
						continue
					var e: PackedFloat64Array = _on_floor(cx, cy, _h(sd, i, 4) * TAU, sr * _h(sd, i, 5) * 0.8)
					_fill(_ri(e[0]), _ri(e[1]), 1, 1)
		"frost":
			_ellipse(cx, cy, sr * grow * 0.6, C[3], 0.25 * fade)
			for ln: PackedFloat64Array in s["lines"]:
				_ga(0.85 * fade)
				var i := 0
				while i + 3 < ln.size():
					_scar_line(sx, sy, ln, i, grow, P["white"] if i == 0 else C[4])
					i += 2
				var ex := _wx(sx + ln[ln.size() - 2] * grow, sy + ln[ln.size() - 1] * grow)
				var ey := _wy(sx + ln[ln.size() - 2] * grow, sy + ln[ln.size() - 1] * grow)
				_fs(C[5])
				_fill(_ri(ex) - 1, _ri(ey), 3, 1)
				_fill(_ri(ex), _ri(ey) - 1, 1, 3)
			_ga(1.0)
		"star":
			var hot := maxf(0.0, 1.0 - st / 0.8)
			_ellipse(cx, cy, sr * 0.4 * grow, Color("#100a14"), 0.6 * fade)
			for ln: PackedFloat64Array in s["lines"]:
				_ga(fade)
				var i := 0
				while i + 3 < ln.size():
					_scar_line(sx, sy, ln, i, 1.0, C[4] if hot > 0.4 else (C[3] if hot > 0.05 else Color("#1a1220")))
					i += 2
			_ga(1.0)
		_:
			# a splat of poison: a wet patch, plum at its edge, bile in it
			_ellipse(cx, cy, sr * grow * 1.1, C[2], 0.5 * fade)
			_ellipse(cx, cy, sr * grow * 0.85, Color("#7c9416"), 0.55 * fade)
			_ellipse(cx, cy - 1.0, sr * grow * 0.5, C[4], 0.45 * fade)
			_ga(fade)
			for ln: PackedFloat64Array in s["lines"]:
				var ex := _wx(sx + ln[ln.size() - 2] * 1.1, sy + ln[ln.size() - 1] * 1.1)
				var ey := _wy(sx + ln[ln.size() - 2] * 1.1, sy + ln[ln.size() - 1] * 1.1)
				_fs(C[3])
				_fill(_ri(ex), _ri(ey), 2, 1)
			_ga(1.0)


## Powderkeg's burning ground: the floor scorched black, cracked and glowing.
func _draw_powder_ground(t: float, z: Dictionary) -> void:
	var C: PackedColorArray = RAMP["powderkeg"]
	var zx: float = z["x"]
	var zy: float = z["y"]
	var zr: float = z["r"]
	var cx := _wx(zx, zy)
	var cy := _wy(zx, zy)
	var fade := minf(1.0, minf(float(z["t"]) / 0.15, (float(z["dur"]) - float(z["t"])) * 1.5))
	var s := _shape_of(z)
	_ellipse(cx, cy, zr, Color("#120a08"), 0.55 * fade)
	_ellipse(cx, cy, zr * 0.75, C[1], 0.35 * fade)
	for ln: PackedFloat64Array in s["lines"]:
		_ga(fade)
		var i := 0
		while i + 3 < ln.size():
			var glowing := sin(t * 6.0 + i + int(s["seed"])) > -0.2
			_scar_line(zx, zy, ln, i, 0.9, C[4] if glowing else C[3])
			i += 2
	_ga(fade)
	_rim(cx, cy, zr, C[3], 3, s["seed"], TAU, 1)
	_ga(1.0)


## Shatter's sheet of ice, laid by its rune as it freezes what is near.
func _draw_freeze(f: Dictionary) -> void:
	var C: PackedColorArray = RAMP["shatter"]
	var cx := _wx(f["x"], f["y"])
	var cy := _wy(f["x"], f["y"])
	var fr: float = f["r"]
	var sd: int = f["seed"]
	var out := _ease_out(minf(1.0, float(f["t"]) / 0.25))
	var fade := minf(1.0, (float(f["dur"]) - float(f["t"])) / 1.0)
	_ellipse(cx, cy, fr * out, C[3], 0.28 * fade)
	_ellipse(cx, cy, fr * out * 0.7, C[4], 0.14 * fade)
	_ga(0.8 * fade)
	_rim(cx, cy, fr * out, C[5], 2, sd, TAU, 1)
	# crystals standing up out of it
	for i in 14:
		var a := _h(sd, i, 1) * TAU
		var d := sqrt(_h(sd, i, 2)) * fr * out * 0.95
		var p: PackedFloat64Array = _on_floor(cx, cy, a, d)
		var tall := 2 + int(floorf(_h(sd, i, 3) * 5.0))
		_fs(C[4])
		_fill(_ri(p[0]), _ri(p[1]) - tall, 1, tall)
		_fs(P["white"])
		_fill(_ri(p[0]), _ri(p[1]) - tall, 1, 1)
	_ga(1.0)


## Whether what lies at (x, y) is wholly off the screen (render.ts `here`: then it is not painted). Never while the check records.
func _off(x: float, y: float) -> bool:
	if _rec != null or fx == null or not fx.has_method("hero_at"):
		return false
	return absf((x - y) * 16.0 - (hero_x - hero_y) * 16.0) > 420.0 or absf((x + y) * 8.0 - (hero_x + hero_y) * 8.0) > 300.0


## Under the figures (floorV3): the five's runes, their patches, the marks of their blasts.
func draw_floor(c: CanvasItem, t: float) -> void:
	for s: Dictionary in scars:
		if not _off(s["x"], s["y"]):
			_draw_scar(s)
	for f: Dictionary in freezes:
		if not _off(f["x"], f["y"]):
			_draw_freeze(f)
	for z in zones:
		if not (z is Dictionary):
			continue
		var w = meld_of(z)
		if w == null or _off(z["x"], z["y"]):
			continue
		if z["kind"] == "rune":
			_draw_rune(t, z, w)
		elif w == "powderkeg" and z["kind"] == "burn":
			_draw_powder_ground(t, z)
		elif w == "rupture" and z["kind"] == "venom":
			# the slick under Rupture's cloud
			var C: PackedColorArray = RAMP["rupture"]
			var fade := minf(1.0, minf(float(z["t"]) / 0.3, (float(z["dur"]) - float(z["t"])) * 1.5))
			_ellipse(_wx(z["x"], z["y"]), _wy(z["x"], z["y"]), z["r"], C[2], 0.35 * fade)
			_ellipse(_wx(z["x"], z["y"]), _wy(z["x"], z["y"]), float(z["r"]) * 0.7, Color("#4c5e10"), 0.3 * fade)
	# the spears of ice and the rays of light lying out over the floor from a burst
	for sp: Dictionary in spears:
		if _off(sp["x"], sp["y"]):
			continue
		var C: PackedColorArray = RAMP[sp["word"]]
		var k: float = float(sp["t"]) / float(sp["dur"])
		var len: float = sp["len"]
		var out := _ease_out(minf(1.0, k / 0.25)) * len
		var back := ((k - 0.55) / 0.45) * len if k > 0.55 else 0.0
		var spx: float = sp["x"]
		var spy: float = sp["y"]
		var dx: float = sp["dx"]
		var dy: float = sp["dy"]
		var x0 := _wx(spx + dx * back, spy + dy * back)
		var y0 := _wy(spx + dx * back, spy + dy * back)
		var x1 := _wx(spx + dx * out, spy + dy * out)
		var y1 := _wy(spx + dx * out, spy + dy * out)
		if back >= out:
			continue
		if sp["word"] == "shatter":
			_thick(x0, y0 + 1.0, x1, y1 + 1.0, C[2], 3)
			_thick(x0, y0, x1, y1, C[4], 2)
			_pline(x0, y0 - 1.0, x1, y1 - 1.0, P["white"])
			# its point: a crystal standing up
			_fs(P["white"])
			_fill(_ri(x1), _ri(y1) - 4, 1, 4)
			_fs(C[5])
			_fill(_ri(x1) - 1, _ri(y1) - 2, 3, 2)
		else:
			# light breaking out of a thing about to go off, laid along the floor
			_thick(x0, y0, x1, y1, C[4], 2)
			_pline(x0, y0, x1, y1, P["white"])
	_flush(c)


# =====================================================================================================================
# IN THE AIR (after the darkness, so it glows): Rupture's cloud, the domes, the pillars.

func _draw_cloud(t: float, z: Dictionary) -> void:
	var C: PackedColorArray = RAMP["rupture"]
	var zx: float = z["x"]
	var zy: float = z["y"]
	var zr: float = z["r"]
	var zt: float = z["t"]
	var fade := minf(1.0, minf(zt / 0.3, (float(z["dur"]) - zt) * 1.2))
	var born := _ease_out(minf(1.0, zt / 0.5))
	var sd: int = _shape_of(z)["seed"]
	var n := _ri(14 + zr * 9)
	var hx := _wx(hero_x, hero_y)
	var hy := _wy(hero_x, hero_y) - 12.0
	var looks := [
		[C[1], C[3], C[4]],
		[C[0], C[2], C[3]],
		[Color("#26300c"), Color("#7c9416"), C[4]],
	]
	for i in n:
		var a := (float(i) / n) * TAU + t * (0.2 + _h(i, sd, 1) * 0.3) * (1.0 if i % 2 == 0 else -1.0)
		var d := zr * (0.15 + _h(i, sd, 2) * 0.7) * (0.4 + 0.6 * born)
		var rise := fmod(t * 0.35 + _h(i, sd, 6), 1.0)
		var qx := zx + cos(a) * d
		var qy := zy + sin(a) * d
		var px := _ri(_wx(qx, qy))
		var py := _ri(_wy(qx, qy)) - 6 - _ri(_h(i, sd, 3) * 10.0 + sin(t * 1.4 + i) * 2.0 + rise * 18.0)
		var rr := (4.0 + _h(i, sd, 4) * 5.0 + rise * 4.0) * (0.5 + 0.5 * born)
		var alpha := (0.55 + _h(i, sd, 5) * 0.2) * fade * minf(minf(1.0, (1.0 - rise) * 2.5), 0.35 + rise * 4.0)
		if _hyp(px - hx, (py - hy) * 1.6) < 30.0:
			alpha *= 0.3
		var lk: Array = looks[i % 3]
		_oval(px + 1, py + 2, rr * 1.5, rr * 0.75, lk[0], alpha, 0.8, sd + i)
		_oval(px, py, rr * 1.4, rr * 0.75, lk[1], alpha, 0.8, sd + i + 40)
		_oval(px - rr * 0.35, py - rr * 0.3, rr * 0.8, rr * 0.4, lk[2], alpha, 0.5, sd + i + 80)


func _draw_dome(d: Dictionary) -> void:
	var C: PackedColorArray = RAMP[d["word"]]
	var dt: float = d["t"]
	var k: float = dt / float(d["dur"])
	var dr: float = d["r"]
	var cx := _ri(_wx(d["x"], d["y"]))
	var cy := _ri(_wy(d["x"], d["y"]))
	var sd := _ri(float(d["x"]) * 977.0 + float(d["y"]) * 313.0) + int(floorf(dt * 24.0))
	match str(d["kind"]):
		"blast":
			# A DOME OF LIGHT swelling over the floor, hollowing out into a shell that thins to a ring of dust
			var q := _ease_out(minf(1.0, k / 0.4))
			var rw := dr * 22.6 * q
			var rh := dr * 11.3 * q + dr * 14.0 * q
			var y := cy - _ri(dr * 7.0 * q)
			var hole := 0.0 if k < 0.22 else minf(0.96, _smooth((k - 0.22) / 0.78) * 1.05)
			var fade := 1.0 if k < 0.6 else 1.0 - (k - 0.6) / 0.4
			_oval(cx, y, rw + 2.0, rh + 2.0, C[1], 0.9 * fade, 2.5, sd, hole * 0.98)
			_oval(cx, y, rw, rh, C[2], fade, 2.0, sd + 1, hole)
			_oval(cx, y, rw - 2.0, rh - 2.0, C[4] if k < 0.35 else C[3], fade, 1.5, sd + 2, minf(0.99, hole * 1.04))
			if k < 0.5:
				_oval(cx, y, (rw - 3.0) * (1.0 - hole), (rh - 3.0) * (1.0 - hole), P["white"] if k < 0.18 else C[5], 1.0 - k / 0.5, 1.0, sd + 3, 0.4 if hole > 0.0 else 0.0)
			# dust in it: dark specks torn off its edge
			_fs(C[1])
			var i := 0
			while i < 18.0 * fade:
				var a := _h(sd, i, 7) * TAU
				var rr := 0.85 + _h(sd, i, 8) * 0.25
				_fill(_ri(cx + cos(a) * rw * rr), _ri(y + sin(a) * rh * rr), 2, 1)
				i += 1
		"fireball":
			# A BALL OF FIRE rising as it swells, rolling over into black smoke from the outside in
			var q := _ease_out(minf(1.0, k / 0.3))
			var r := dr * 16.0 * q * (1.0 + k * 0.35)
			var y := _ri(cy - 6.0 - float(d["rise"]) * _smooth(k))
			var smoke := _smooth(maxf(0.0, (k - 0.35) / 0.65))
			var shrink := 1.0 - smoke
			var end := 1.0 - maxf(0.0, (k - 0.82) / 0.18)
			_oval(cx, y, r + 2.0, r * 0.85 + 2.0, Color("#1e1616") if smoke > 0.4 else C[1], minf(1.0, 0.7 + smoke) * end, 2.0, sd)
			if smoke > 0.2:
				_oval(cx, y - 2, r * 0.9, r * 0.7, Color("#3a2e2e"), smoke * 0.8 * end, 2.0, sd + 9)
			_oval(cx, y, (r + 1.0) * shrink, (r * 0.85 + 1.0) * shrink, P["pu4"] if int(floorf(dt * 30.0)) % 2 != 0 else C[3], 1.0, 2.0, sd + 1)
			_oval(cx, y, r * 0.86 * shrink, r * 0.72 * shrink, Color("#ff8a2a"), 1.0, 1.5, sd + 2)
			_oval(cx, y + 1, r * 0.62 * shrink, r * 0.52 * shrink, C[4], 1.0, 1.0, sd + 3)
			_oval(cx, y + 1, r * 0.34 * shrink, r * 0.28 * shrink, P["white"] if k < 0.25 else C[5], 1.0, 0.5, sd + 4)
		"storm":
			# A BALL OF LIGHTNING: a white heart, a lilac glow, bolts thrashing out of it
			var q := _ease_out(minf(1.0, k / 0.3))
			var r := dr * 18.0 * q
			var y := cy - 8
			var fade := 1.0 - maxf(0.0, (k - 0.5) / 0.5)
			_oval(cx, y, r, r * 0.75, C[2], 0.4 * fade, 2.0, sd, 0.5)
			_oval(cx, y, r * 0.6, r * 0.45, C[3], 0.55 * fade, 1.5, sd + 1)
			_oval(cx, y, r * 0.32, r * 0.26, P["white"], fade, 0.5, sd + 2)
			_ga(fade)
			for i in 7:
				var a := _r() * TAU
				var px := float(cx)
				var py := float(y)
				for j in range(1, 4):
					var nx := cx + cos(a) * r * 1.1 * (j / 3.0) + _rnd(-3, 3)
					var ny := y + sin(a) * r * 0.8 * (j / 3.0) + _rnd(-3, 3)
					_pline(px, py, nx, ny, P["white"] if j == 1 else C[4])
					px = nx
					py = ny
			_ga(1.0)
		_:
			# A WET POP: a skin swelling and bursting, torn open from the middle
			var q := _ease_out(minf(1.0, k / 0.4))
			var r := dr * 16.0 * q
			var y := _ri(cy - 8.0 - float(d["rise"]) * k)
			var hole := 0.0 if k < 0.3 else minf(0.95, (k - 0.3) / 0.6)
			var fade := 1.0 - maxf(0.0, (k - 0.55) / 0.45)
			_oval(cx, y, r + 1.0, r * 0.8 + 1.0, C[2], fade, 2.0, sd, hole)
			_oval(cx, y, r, r * 0.8, C[3], fade, 2.0, sd + 1, hole)
			_oval(cx, y, r * 0.7, r * 0.56, C[4], fade, 1.5, sd + 2, hole)
			if hole < 0.5:
				_oval(cx, y, r * 0.3, r * 0.24, P["white"], fade, 0.5, sd + 3)


## (airV3)
func draw_air(c: CanvasItem, t: float) -> void:
	for z in zones:
		if z is Dictionary and z.get("kind") == "venom" and meld_of(z) == "rupture" and not _off(z["x"], z["y"]):
			_draw_cloud(t, z)
	for d: Dictionary in domes:
		if float(d["t"]) >= 0.0 and not _off(d["x"], d["y"]):
			_draw_dome(d)
	for p: Dictionary in pillars:
		# light thrown straight up off a rune going off (or out of an elite going off)
		var C: PackedColorArray = RAMP[p["word"]]
		var pt: float = p["t"]
		var k: float = pt / float(p["dur"])
		var cx := _ri(_wx(p["x"], p["y"]))
		var cy := _ri(_wy(p["x"], p["y"]))
		if p["word"] == "chainreaction":
			# a bolt out of the sky: jagged, white at its heart, lilac round it, flickering
			if k > 0.35 and k < 0.45:
				continue
			var sd := _ri(float(p["x"]) * 31.0 + float(p["y"]) * 17.0)
			var px := cx
			var py := cy
			for j in range(1, 13):
				var nx := cx + _ri((_h(sd, j, 3) - 0.5) * 22.0 * minf(1.0, j / 3.0))
				var ny := cy - j * 18
				_thick(px, py, nx, ny, C[2], 5)
				_thick(px, py, nx, ny, C[4], 3)
				_pline(px, py, nx, ny, P["white"])
				px = nx
				py = ny
			continue
		var w := maxi(1, _ri(float(p["w"]) * (1.0 - k * 0.75)))
		var top := _ri(220.0 * minf(1.0, k / 0.12))
		var band := 6
		var j := 0
		while j < top:
			var q := j / 220.0
			var a := (1.0 - k) * (1.0 - q * 0.85)
			var wob := int(floorf(pt * 40.0 + j * 0.3)) % 2
			var ww := maxi(1, _ri(w * (1.0 - q * 0.5)))
			_ga(0.55 * a)
			_fs(C[2])
			_fill(cx - ww - 2 - wob, cy - j - band, ww * 2 + 5 + wob * 2, band)
			_ga(0.9 * a)
			_fs(C[4])
			_fill(cx - ww, cy - j - band, ww * 2 + 1, band)
			_ga(a)
			_fs(P["white"])
			_fill(cx - int(floorf(ww / 2.0)), cy - j - band, int(floorf(ww / 2.0)) * 2 + 1, band)
			j += band
		_ga(1.0)
	_flush(c)


## Over the effects' sparks (overV3): what flies, the bolts, the spikes of ice, the screen's flash.
func draw_over(c: CanvasItem, t: float) -> void:
	for s: Dictionary in spikes:
		if float(s["t"]) < 0.0:
			continue
		var C: PackedColorArray = RAMP["shatter"]
		var k: float = float(s["t"]) / float(s["dur"])
		var cx := _ri(_wx(s["x"], s["y"]))
		var cy := _ri(_wy(s["x"], s["y"]))
		var up := _ri(float(s["tall"]) * _ease_out(minf(1.0, k / 0.18)))
		if k > 0.72:
			continue
		# a spike of ice, its lit face, its shade, a white edge
		var sw: int = s["w"]
		for j in up:
			var half := maxi(0, _ri(sw * (1.0 - float(j) / maxi(1, up))))
			_fs(C[2])
			_fill(cx - half - 1, cy - j, 1, 1)
			_fs(C[3])
			_fill(cx - half, cy - j, half + 1, 1)
			_fs(C[4])
			_fill(cx + 1, cy - j, half, 1)
		_fs(P["white"])
		_fill(cx, cy - up, 1, maxi(1, _ri(up * 0.6)))
	for b: Dictionary in lobs:
		var bt: float = b["t"]
		if bt < 0.0:
			continue
		var C: PackedColorArray = RAMP[b["word"]]
		var k := minf(1.0, bt / float(b["dur"]))
		var bx0: float = b["x0"]
		var by0: float = b["y0"]
		var bx1: float = b["x1"]
		var by1: float = b["y1"]
		var bh: float = b["h"]
		var kind: String = b["kind"]
		var size: int = b["size"]
		var x := bx0 + (bx1 - bx0) * k
		var y := by0 + (by1 - by0) * k
		var lift := 14.0 if kind == "shard" else bh * 4.0 * k * (1.0 - k) + 8.0 * (1.0 - k)
		var px := _ri(_wx(x, y))
		var py := _ri(_wy(x, y) - lift)
		var q := maxf(0.0, k - 0.1)
		var qx := bx0 + (bx1 - bx0) * q
		var qy := by0 + (by1 - by0) * q
		var tx := _ri(_wx(qx, qy))
		var ty := _ri(_wy(qx, qy) - (14.0 if kind == "shard" else bh * 4.0 * q * (1.0 - q) + 8.0 * (1.0 - q)))
		if kind == "rubble":
			# a stone tumbling: its face turning lit and dark as it goes
			var turn := int(floorf(float(b["spin"]) + bt * 14.0)) % 4
			_fs(C[0])
			_fill(px - 2, py - 1, size + 2, size + 1)
			_fs(C[3] if turn < 2 else C[2])
			_fill(px - 1, py - 1, size, size - (turn % 2))
			_fs(C[4] if turn == 0 else C[2])
			_fill(px - 1, py - 1, 1, 1)
		elif kind == "ember":
			_pline(px, py, tx, ty, C[4])
			_fs(C[1])
			_fill(px - 1, py - 1, size + 1, size)
			_fs(C[5] if int(floorf(bt * 30.0)) % 2 != 0 else C[4])
			_fill(px, py - 1, size - 1, size - 1)
		elif kind == "glob":
			_pline(px, py, tx, ty, C[3])
			_fs(C[2])
			_fill(px - 1, py - 1, size + 1, size + 1)
			_fs(C[4])
			_fill(px - 1, py - 1, size, size)
			_fs(C[5])
			_fill(px - 1, py - 1, 1, 1)
		else:
			# a shard of ice in flight: long, pointed along its way, a white edge, a trail of glints
			var ex := _ri(_wx(bx1, by1)) - px
			var ey := _ri(_wy(bx1, by1) - 14.0) - py
			var len := _hyp(ex, ey)
			if len == 0.0:
				len = 1.0
			var ux := ex / len
			var uy := ey / len
			_thick(px - ux * 9.0, py - uy * 9.0, px, py, C[3], 3)
			_thick(px - ux * 8.0, py - uy * 8.0, px + ux * 2.0, py + uy * 2.0, C[4], 2)
			_pline(px - ux * 6.0, py - uy * 6.0 - 1.0, px + ux * 3.0, py + uy * 3.0 - 1.0, P["white"])
			_fs(C[5])
			_fill(_ri(px - ux * 14.0), _ri(py - uy * 14.0), 1, 1)
			_fill(_ri(px - ux * 18.0), _ri(py - uy * 18.0), 1, 1)
	for a: Dictionary in arcs:
		var at: float = a["t"]
		var grow: float = a["grow"]
		var k: float = at / float(a["dur"])
		# (it flickers: on, a beat off, on again, then gone)
		if at > grow and k > 0.45 and k < 0.55:
			continue
		var C: PackedColorArray = a["C"]
		var pts: PackedFloat64Array = a["pts"]
		var aw: int = a["w"]
		var az: float = a["z"]
		var n := pts.size() / 2 - 1
		var up_to: float = minf(1.0, at / grow) * n if grow > 0.0 else float(n)
		var core = _c(C, 5) if k < 0.3 else (_c(C, 4) if k < 0.65 else _c(C, 3))
		var i := 0
		while i < n and i < up_to:
			var q := minf(1.0, up_to - i)
			var ax := pts[i * 2]
			var ay := pts[i * 2 + 1]
			var bx := ax + (pts[i * 2 + 2] - ax) * q
			var by := ay + (pts[i * 2 + 3] - ay) * q
			var x0 := _wx(ax, ay)
			var y0 := _wy(ax, ay) - az
			var x1 := _wx(bx, by)
			var y1 := _wy(bx, by) - az
			if k < 0.65:
				_thick(x0, y0 + 1.0, x1, y1 + 1.0, C[2], aw + 1)
			_thick(x0, y0, x1, y1, core, aw)
			if aw > 1 and k < 0.5:
				_pline(x0, y0, x1, y1, P["white"])
			i += 1
		# its head, while it races out: a ball of white
		if grow > 0.0 and at < grow:
			var hi := mini(n, int(floorf(up_to)))
			var hx := _wx(pts[hi * 2], pts[hi * 2 + 1])
			var hy := _wy(pts[hi * 2], pts[hi * 2 + 1]) - az
			_fs(_c(C, 4))
			_fill(_ri(hx) - 2, _ri(hy) - 2, 5, 5)
			_fs(P["white"])
			_fill(_ri(hx) - 1, _ri(hy) - 1, 3, 3)
		if k < 0.7 and up_to >= n:
			for f: Dictionary in a["forks"]:
				var fp: PackedFloat64Array = f["pts"]
				var j := 0
				while j + 3 < fp.size():
					_pline(_wx(fp[j], fp[j + 1]), _wy(fp[j], fp[j + 1]) - az, _wx(fp[j + 2], fp[j + 3]), _wy(fp[j + 2], fp[j + 3]) - az, _c(C, 4) if j == 0 else _c(C, 3))
					j += 2
	if float(flash["t"]) < float(flash["dur"]):
		_ga(float(flash["a"]) * (1.0 - float(flash["t"]) / float(flash["dur"])))
		_fs(flash["color"])
		_fill_screen()
		_ga(1.0)
	_flush(c)


# =====================================================================================================================
# The renderer's hooks.

## Where a monster's picture is moved to, game pixels: a blast going off beside it jolts it away, and it settles back (shiftV3).
func shift_of(id) -> Vector2i:
	var ox := 0.0
	var oy := 0.0
	for j: Dictionary in jolts:
		if j["id"] != id:
			continue
		var k: float = float(j["t"]) / float(j["dur"])
		var amt: float = float(j["px"]) * (k / 0.15 if k < 0.15 else maxf(0.0, 1.0 - (k - 0.15) / 0.85)) * (cos((k - 0.15) * 18.0) if k > 0.15 else 1.0)
		ox += (float(j["dx"]) - float(j["dy"])) * amt
		oy += (float(j["dx"]) + float(j["dy"])) * amt * 0.5
	return Vector2i(_ri(ox), _ri(oy))


## A colour laid over a monster's picture and how strongly: white for a moment as a blast, a shard or an arc strikes it (tintV3);
## [] for none.
func tint_of(id, t: float) -> Array:
	var k = marks.get(int(id))
	if k == null:
		return []
	if float(k["white"]) < 0.1:
		return [Color(1, 1, 1), 0.75 * (1.0 - float(k["white"]) / 0.1)]
	if float(k["crackle"]) > 0.0:
		var C: PackedColorArray = RAMP["chainreaction"]
		var on := int(floorf(t * 20.0)) % 3 == 0
		return [C[5] if on else C[3], 0.5 if on else 0.22]
	return []


## Light (lightsV3): `spot` (x, y, r, a), the screen's game pixels.
func lights(spot: Callable, t: float) -> void:
	for z in zones:
		if not (z is Dictionary):
			continue
		var w = meld_of(z)
		if w == null:
			continue
		var x := _wx(z["x"], z["y"])
		var y := _wy(z["x"], z["y"])
		var zr: float = z["r"]
		if z["kind"] == "rune":
			var k := _rune_k(z)
			spot.call(x, y - 2.0, 24.0 + zr * 16.0, (0.4 + 0.45 * k) * (1.0 if _beat_of(k, t) else 0.75))
		elif z["kind"] == "burn":
			spot.call(x, y - 4.0, 20.0 + zr * 16.0, (0.6 + 0.15 * sin(t * 11.0 + float(z["x"]))) * minf(1.0, (float(z["dur"]) - float(z["t"])) * 2.0))
		else:
			spot.call(x, y - 6.0, 18.0 + zr * 14.0, 0.35 * minf(1.0, (float(z["dur"]) - float(z["t"])) * 2.0))
	for d: Dictionary in domes:
		if float(d["t"]) >= 0.0:
			spot.call(_wx(d["x"], d["y"]), _wy(d["x"], d["y"]) - 10.0, 40.0 + float(d["r"]) * 40.0, maxf(0.0, 1.0 - float(d["t"]) / float(d["dur"])))
	for p: Dictionary in pillars:
		spot.call(_wx(p["x"], p["y"]), _wy(p["x"], p["y"]) - 30.0, 70.0, 1.0 - float(p["t"]) / float(p["dur"]))
	for s: Dictionary in scars:
		var hot := maxf(0.0, 1.0 - float(s["t"]) / (1.4 if s["kind"] == "crater" or s["kind"] == "scorch" else 0.6))
		if hot > 0.0 and s["kind"] != "splat":
			spot.call(_wx(s["x"], s["y"]), _wy(s["x"], s["y"]) - 2.0, 20.0 + float(s["r"]) * 18.0, 0.7 * hot)
	for b: Dictionary in lobs:
		if float(b["t"]) < 0.0 or b["kind"] == "rubble":
			continue
		var k := minf(1.0, float(b["t"]) / float(b["dur"]))
		var x := float(b["x0"]) + (float(b["x1"]) - float(b["x0"])) * k
		var y := float(b["y0"]) + (float(b["y1"]) - float(b["y0"])) * k
		spot.call(_wx(x, y), _wy(x, y) - 16.0, 14.0, 0.5)
	for m: Dictionary in mons:
		if m["dead"]:
			continue
		var k = marks.get(int(m["id"]))
		if k != null and (float(k["white"]) < 0.1 or float(k["crackle"]) > 0.0):
			spot.call(_wx(m["x"], m["y"]), _wy(m["x"], m["y"]) - float(m["top"]) * 0.5, 22.0, 0.55)


# =====================================================================================================================
# The clock, and what the rules said happened.

static func _age(list: Array, dt: float) -> Array:
	var gone: Array = []
	for i in range(list.size() - 1, -1, -1):
		var q: Dictionary = list[i]
		q["t"] = float(q["t"]) + dt
		if float(q["t"]) >= float(q["dur"]):
			list.remove_at(i)
			gone.append(q)
	return gone


## (tickV3)
func tick(dt: float) -> void:
	clock += dt
	var i := later.size() - 1
	while i >= 0:
		if i >= later.size():
			i = later.size() - 1
			continue
		var q: Dictionary = later[i]
		q["t"] = float(q["t"]) - dt
		if float(q["t"]) <= 0.0:
			later.remove_at(i)
			(q["fn"] as Callable).call()
		i -= 1
	_age(domes, dt)
	_age(arcs, dt)
	_age(spears, dt)
	_age(spikes, dt)
	_age(scars, dt)
	_age(jolts, dt)
	_age(pillars, dt)
	_age(freezes, dt)
	# (what flies lands: the look the rules asked for, or a stone coming down hard)
	var j := lobs.size() - 1
	while j >= 0:
		if j >= lobs.size():
			j = lobs.size() - 1
			continue
		var b: Dictionary = lobs[j]
		b["t"] = float(b["t"]) + dt
		if float(b["t"]) >= float(b["dur"]):
			lobs.remove_at(j)
			if b["hit"] != null:
				(b["hit"] as Callable).call()
			elif b["kind"] == "rubble":
				var C: PackedColorArray = RAMP["demolition"]
				_fling(b["x1"], b["y1"], 3, PackedColorArray([C[3], C[2]]), {"speed": 1.2, "up": 40.0, "grav": 400.0, "life": 0.3, "z": 1.0, "size": 1})
				_puffs(b["x1"], b["y1"], 0.05, 1, PackedColorArray([C[3], C[2], C[1]]), {"up": 10.0, "z": 1.0, "life": 0.6})
		j -= 1
	if float(flash["t"]) < 9.0:
		flash["t"] = float(flash["t"]) + dt
	for id in marks.keys():
		var k: Dictionary = marks[id]
		k["white"] = float(k["white"]) + dt
		if float(k["crackle"]) > 0.0:
			k["crackle"] = float(k["crackle"]) - dt
		var m = _mon(id)
		if m == null or m["dead"]:
			marks.erase(id)
		elif float(k["crackle"]) > 0.0 and _r() < 20.0 * dt:
			var top: float = m["top"]
			var C: PackedColorArray = RAMP["chainreaction"]
			var z := _rnd(4, top * 0.8)
			var x0: float = float(m["x"]) + _rnd(-0.25, 0.25)
			var y0: float = float(m["y"]) + _rnd(-0.25, 0.25)
			var x1: float = float(m["x"]) + _rnd(-0.25, 0.25)
			var y1: float = float(m["y"]) + _rnd(-0.25, 0.25)
			_arc(x0, y0, x1, y1, C, {"w": 1, "dur": 0.08, "wob": 0.1, "z": z})
	var room: float = fx.room()
	for z in zones:
		if not (z is Dictionary):
			continue
		var w = meld_of(z)
		if w == null:
			continue
		var zr: float = z["r"]
		var rate := func(n: float, r: float) -> bool: return _r() < n * dt * room * minf(1.6, 0.5 + r * 0.6)
		var at := func(f := 0.85) -> PackedFloat64Array:
			var a := _r() * TAU
			var d := sqrt(_r()) * zr * f
			return PackedFloat64Array([float(z["x"]) + cos(a) * d, float(z["y"]) + sin(a) * d])
		if z["kind"] == "rune":
			var k := _rune_k(z)
			var C: PackedColorArray = RAMP[w]
			if w == "demolition":
				# dust trickling up off it, grit hopping on the floor, more as its time runs out
				if rate.call(3.0 + k * 14.0, zr):
					var p: PackedFloat64Array = at.call(0.9)
					_add(p[0], p[1], 1.0, 0.0, 0.0, _rnd(10, 30) * (0.5 + k), 0.6, C[3], 1.0, 200.0 if k > 0.6 else -10.0, PackedColorArray([C[4], C[3], C[2]]))
				if k > 0.5 and rate.call(4.0 * k, zr):
					var p: PackedFloat64Array = at.call(0.6)
					_crackle(p[0], p[1], 0.3, 1)
			elif w == "powderkeg":
				# the fuse's spark throwing sparks and a wisp of smoke
				var fp: PackedFloat64Array = _fuse_at(z, k)
				if rate.call(18.0, 1.0):
					var vx := _rnd(-1.6, 1.6)
					var vy := _rnd(-1.6, 1.6)
					var vz := _rnd(40, 90)
					var col := _pick(PackedColorArray([P["white"], C[5], C[4], P["pu5"]]))
					_add(fp[0], fp[1], 2.0, vx, vy, vz, 0.25, col, 1.0, 300.0)
				if rate.call(4.0, 1.0):
					_puffs(fp[0], fp[1], 0.02, 1, PackedColorArray([Color("#6a5a5a"), Color("#4a3e3e"), Color("#2a2222")]), {"up": 20.0, "z": 3.0, "life": 0.7})
			elif w == "shatter":
				if rate.call(2.5, zr):
					var p: PackedFloat64Array = at.call(0.9)
					var pz := _rnd(1, 6)
					var vz := _rnd(4, 12)
					var col := _pick(PackedColorArray([C[5], C[4], P["white"]]))
					_add(p[0], p[1], pz, 0.0, 0.0, vz, 0.7, col, 1.0, 0.0)
			elif w == "chainreaction":
				if rate.call(3.0 + k * 6.0, zr):
					var p: PackedFloat64Array = at.call(0.8)
					var x1 := p[0] + _rnd(-0.5, 0.5)
					var y1 := p[1] + _rnd(-0.5, 0.5)
					var az := _rnd(2, 8)
					_arc(p[0], p[1], x1, y1, C, {"w": 1, "dur": 0.1, "wob": 0.15, "z": az})
			elif rate.call(3.0 + k * 10.0, zr):
				var p: PackedFloat64Array = at.call(0.4)
				fx.bubbles(p[0], p[1], 0.1, 1)
		elif w == "powderkeg" and z["kind"] == "burn":
			# little flames all over it; the powder in it popping, orange and violet
			if rate.call(3.2, zr):
				var p: PackedFloat64Array = at.call()
				fx.flames(p[0], p[1], 0.1, 1, 1.1)
			if rate.call(2.6, zr):
				var p: PackedFloat64Array = at.call()
				var C: PackedColorArray = RAMP["powderkeg"]
				domes.append({"x": p[0], "y": p[1], "r": 0.18, "t": 0.0, "dur": 0.18, "kind": "fireball", "word": "powderkeg", "rise": 4.0})
				_fling(p[0], p[1], 4, PackedColorArray([P["white"], C[5], P["pu5"]]), {"speed": 2.6, "up": 50.0, "grav": 200.0, "life": 0.2, "z": 3.0, "streak": 2.0, "size": 1})
		elif w == "rupture" and z["kind"] == "venom":
			if rate.call(1.2, zr):
				var p: PackedFloat64Array = at.call()
				fx.bubbles(p[0], p[1], 0.1, 1)
			if rate.call(0.8, zr):
				var p: PackedFloat64Array = at.call(0.7)
				var fz := _rnd(8, 18)
				_flash(p[0], p[1], fz, 0.2, 0.06, PackedColorArray([RAMP["rupture"][5], RAMP["rupture"][4], P["pu5"]]))


## The point on Powderkeg's ring where its fuse's spark has got to, world (x, y).
static func _fuse_at(z: Dictionary, k: float) -> PackedFloat64Array:
	var a := -PI / 2.0 + k * TAU
	var sx := cos(a) * float(z["r"]) * 0.92 * 22.6
	var sy := sin(a) * float(z["r"]) * 0.92 * 11.3
	return PackedFloat64Array([float(z["x"]) + sx / 32.0 + sy / 16.0, float(z["y"]) + sy / 16.0 - sx / 32.0])


## The looks, called up by what the rules say happened (eventsV3): one telling.
func event(e: Dictionary) -> void:
	var t: String = e.get("t", "")
	if t == "volFx":
		match str(e.get("what", "")):
			"half":
				_demolition_half(e)
			"catch":
				_powderkeg_catch(e)
			"shard":
				_shatter_shard(e)
			"freeze":
				_shatter_freeze(e)
			"arc":
				_chain_arc(e)
			"link":
				_chain_link(e)
			"splash":
				_rupture_splash(e)
	elif t == "burst" and is_meld(e.get("meld")):
		blast_look(e["meld"], float(e.get("x", 0.0)), float(e.get("y", 0.0)), float(e.get("r", 1.8)), e.get("style") == "ruin")
	elif t == "hit" and not e.get("onHero", false) and not e.get("poison", false):
		for w in e.get("words", []):
			if is_meld(w):
				hit_look(w, float(e.get("x", 0.0)), float(e.get("y", 0.0)), 0.8, false)
	elif t == "burst" and not e.get("echo", false) and e.get("style") in ["slam", "nova", "land"]:
		for w in e.get("words", []):
			if is_meld(w):
				hit_look(w, float(e.get("x", 0.0)), float(e.get("y", 0.0)), float(e.get("r", 1.0)), true)


# =====================================================================================================================
# What the rules keep, read (in the game, off its Game: here off fx.gd's monsters and the rules' patches)

## How tall a monster stands and half how wide, game pixels (art/bestiary.ts FIGURE_SIZE: the game's 24 and 9 where it has none).
static func size_of(m) -> Array:
	var size = L.FIGURE_SIZE.get(m.art.name if m.get("art") != null else m.kind, L.FIGURE_SIZE.get(m.kind))
	return [float(size["top"]), float(size.get("half", 9.0))] if size != null else [24.0, 9.0]


## Where he stands, the monsters and the patches, as they are now (fx.gd: before each frame's tellings and clock).
func read() -> void:
	var h: Vector2 = fx.hero_at()
	hero_x = h.x
	hero_y = h.y
	mons = []
	var ms = fx.monsters
	if ms != null and is_instance_valid(ms):
		for m in ms.list:
			if is_instance_valid(m) and not m.dead:
				var sz := size_of(m)
				mons.append({"id": m.id, "x": m.world.x, "y": m.world.y, "dead": false, "top": sz[0], "half": sz[1]})
	var wk = fx.wakes
	zones = wk.list if wk != null and is_instance_valid(wk) else []
