## THE CITY'S FIVE WORDS AT WORK, THEIR LOOKS (render/words3.ts, Pulling's, Splitting's, Hexing's and Stilling's share; render/binding3.ts,
## Binding's, BINDING3 on: "Bands of written words"), as fx.gd hands on to it what the rules say (city_words.gd, hero.gd, wakes.gd):
##   PULLING (pullHit): a ring closes on where it struck, streaks drawn in from all round, the middle dark an instant (a small vortex),
##     then a pale flash. Behind, its VORTEX on the floor (drawVortex): the floor stained the word's indigo, darkest in the middle, three
##     dashed arms winding in, turning; motes drawn in over it (air3).
##   SPLITTING (splitHit): the attack cracks like a crystal, splinters thrown; its copies fly on, each a small bright shard with a tail.
##     Behind, SHARDS (shards, drawShards) scatter out and lie glinting a moment.
##   HEXING (hexHit, hexFlare, drawSigil): six signs come down on what it curses, its sigil over its head while it lasts, flaring as it is
##     struck; the cursed drained grey (tint3). Behind, the HEX CIRCLE (drawHexCircle): a cold shadow, two rings written round as it is
##     cast, the signs between them, four hooks inside turning the other way; ash rising off it.
##   STILLING (stillHit): two rings out from what it slows, a flash; a clock's face of twelve ticks under it, its hand creeping round;
##     the slowed tinted mint. Behind, the BUBBLE (drawBubble): its floor, slow ripples, its rim lit at the upper left, the clock round it.
##   BINDING (bindOn, snareSprung, rootHero, drawHold, drawSnare, drawBurn): three bands of script leap up out of the floor round what it
##     holds, whip over, wrap it at its feet, its middle and its chest, snap tight, pegged to the floor by pegs of light; the script
##     crawls round them; they unravel as the hold runs out. Its SNARE: a ring of script round a coiled band, breathing, three pegs; sprung,
##     it flares and opens out. On a monster: its dark bands, written in the enemy's pink, bind the hero's legs.
## Every colour is the art's (NEW_RAMP, BIND_RAMP, BIND_ENEMY): the friend's words in their own colours, the enemy's Binding pink.
## (Stilling's echoes of a slowed figure, the pictures lingering where it was, are not drawn here.)
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const W3 := preload("res://scripts/fx_words3.gd")

## (render/words3.ts NEW_RAMP; render/binding3.ts BIND_RAMP, BIND_ENEMY)
const PULLING := [Color("#16123e"), Color("#2a2672"), Color("#4844ae"), Color("#7a76e0"), Color("#c4c2ff"), Color("#f4f2ff")]
const SPLITTING := [Color("#2e1844"), Color("#5a347c"), Color("#9466c0"), Color("#dcaaf6"), Color("#f2dcff"), Color("#ffffff")]
const HEXING := [Color("#14101c"), Color("#2c2436"), Color("#5c566c"), Color("#b8b4c8"), Color("#e6e2ee"), Color("#ffffff")]
const STILLING := [Color("#0c3024"), Color("#1a5e46"), Color("#3ea27a"), Color("#86eaae"), Color("#d0fce4"), Color("#ffffff")]
const BIND := [Color("#1e1810"), Color("#3e3424"), Color("#7a6a4e"), Color("#c8b48a"), Color("#f2e8cc"), Color("#ffffff")]
const BIND_ENEMY := [Color("#0e050a"), Color("#2a0c1c"), Color("#5a1438"), Color("#c02860"), Color("#ff4f8a"), Color("#ffd27a")]
const HEX_GLYPH := ["..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX..", "...X...", "..X...."]
const SIGNS := [["X.X", ".X.", "X.X"], ["XXX", "..X", ".X."], [".X.", "XXX", "X.."]]
const SCRIPT := [["X.X", "XXX"], ["XX.", ".XX"], ["X..", "XXX"], [".X.", "X.X"], ["XXX", "X.."], ["X.X", ".X."], ["XX.", "X.X"], [".XX", "XX."]]
const SPLIT_REACH := 3.2
const SPLIT_TIME := 0.36
const BIND_TIME := {"whip": 0.16, "wrap": 0.3, "unravel": 0.35, "sprung": 0.6}

var fx
## What the words have done to a monster, by its instance id: {m, hex, hex0, flare, still, still0}.
var marks := {}
## The signs of a hex coming down: {m, t, dur}. Splitting's copies flying: {x, y, vx, vy, t, dur}. The pull's own small vortex and the
## shards lying: {kind, x, y, r, t, dur, seed, pts}. Binding's holds: {who (a monster, or the hero), t, dur, enemy, bands, pegs}; its
## snares burning out: {x, y, r, t, dur}.
var snaps: Array = []
var copies: Array = []
var patches: Array = []
var holds: Array = []
var burns: Array = []
var later: Array = []


func clear() -> void:
	marks = {}
	snaps = []
	copies = []
	patches = []
	holds = []
	burns = []
	later = []


func alive() -> bool:
	return not (marks.is_empty() and snaps.is_empty() and copies.is_empty() and patches.is_empty() and holds.is_empty() and burns.is_empty() and later.is_empty())


static func _rnd(a: float, b: float) -> float:
	return a + randf() * (b - a)


static func _pick(cs: Array) -> Color:
	return cs[randi() % cs.size()]


func _mark(m) -> Dictionary:
	var id: int = m.get_instance_id()
	if not marks.has(id):
		marks[id] = {"m": m, "hex": 0.0, "hex0": 0.0, "flare": 0.0, "still": 0.0, "still0": 0.0}
	return marks[id]


## Lines that fly out from (x, y) (words3.ts streaks).
func _streaks(x: float, y: float, n: int, cs: Array, speed: float, length: float, z: float, life: float) -> void:
	for i in n:
		var a := randf() * TAU
		var s := _rnd(0.6, 1.0) * speed
		var d := _rnd(0.0, 0.2)
		fx.add(x + cos(a) * d, y + sin(a) * d, z + _rnd(-3, 3), cos(a) * s, sin(a) * s, 0.0, _rnd(0.6, 1.0) * life, _pick(cs), 1.0, 0.0, null, length)


## Little strokes of script flung off a place (binding3.ts letters).
func _letters(x: float, y: float, n: int, C: Array, speed := 2.0, up := 40.0, z := 10.0, r := 0.2, grav := 60.0, life := 0.6) -> void:
	var ramp := PackedColorArray([C[5], C[4], C[3], C[2]])
	for i in n:
		var a := randf() * TAU
		var d := sqrt(randf()) * r
		var s := _rnd(0.4, 1.0) * speed
		fx.add(x + cos(a) * d, y + sin(a) * d, z + _rnd(-3, 3), cos(a) * s, sin(a) * s, _rnd(0.4, 1.0) * up, _rnd(0.5, 1.0) * life, C[4], 1.0, grav, ramp, 2.0)


# --- what the rules say ---

func handle(e: Dictionary) -> bool:
	match str(e.get("t", "")):
		"pull":
			pull_hit(e["x"], e["y"], e["r"])
		"split":
			split_hit(e["x"], e["y"], e.get("dx", 1.0), e.get("dy", 0.0))
			for c in e.get("to", []):
				var secs: float = c["secs"]
				copies.append({"x": e["x"], "y": e["y"], "vx": (float(c["x"]) - float(e["x"])) / secs, "vy": (float(c["y"]) - float(e["y"])) / secs, "t": 0.0, "dur": secs})
		"shards":
			shards(e["x"], e["y"], e.get("r", 1.1))
		"hexOn":
			var m = e.get("m")
			if m != null and is_instance_valid(m):
				hex_hit(m, float(e.get("secs", 4.0)))
		"hexFlare":
			var m = e.get("m")
			if m != null and is_instance_valid(m):
				hex_flare(m)
		"stillOn":
			var m = e.get("m")
			if m != null and is_instance_valid(m):
				still_hit(m, float(e.get("secs", 2.0)))
		"bind":
			var m = e.get("m")
			if m != null and is_instance_valid(m):
				bind_on(m, float(e["secs"]), Vector2.INF, false)
		"snareSprung":
			var m = e.get("m")
			if m != null and is_instance_valid(m):
				snare_sprung(m, e["x"], e["y"], float(e["secs"]))
		"rooted":
			var h = fx.hero()
			if h != null:
				bind_on(h, float(e["secs"]), Vector2(e["x"], e["y"]), true)
		_:
			return false
	return true


## PULLING, on the hit at (x, y) (pullHit).
func pull_hit(x: float, y: float, r: float) -> void:
	var C := PULLING
	fx.ring(x, y, r * 1.05, 0.28, PackedColorArray([C[3], C[4], C[5]]), false, {"heavy": true, "closing": true})
	fx.ring(x, y, r * 0.8, 0.26, PackedColorArray([C[2], C[3], C[4]]), false, {"closing": true, "swirl": true, "delay": 0.05})
	var n := mini(26, roundi(10.0 + r * 6.0))
	for i in n:
		var a := (float(i) / n) * TAU + _rnd(-0.15, 0.15)
		var d := r * _rnd(0.75, 1.15)
		var sp := d / _rnd(0.18, 0.26)
		fx.add(x + cos(a) * d, y + sin(a) * d, _rnd(3, 12), -cos(a) * sp, -sin(a) * sp, 0.0, (d * 0.92) / sp, _pick([C[3], C[4], C[4], C[5]]), 1.0, 0.0, null, 6.0)
	patches.append({"kind": "vortex", "x": x, "y": y, "r": minf(0.9, r * 0.45), "t": 0.0, "dur": 0.34, "seed": randi() % 1000000})
	later.append({"t": 0.24, "fn": func():
		fx.flash(x, y, 6.0, 0.5, 0.12, PackedColorArray([C[5], C[4], C[3]]))
		_streaks(x, y, 8, [C[4], C[5]], 3.0, 3.0, 6.0, 0.2)})
	fx.glow(x, y, 30.0 + r * 14.0, 0.35)


## SPLITTING, on its first hit at (x, y), going along (dx, dy) (splitHit): the rules' copies fly on (`copies`, from the telling).
func split_hit(x: float, y: float, dx: float, dy: float) -> void:
	var C := SPLITTING
	var a0 := atan2(dy, dx)
	fx.flash(x, y, 10.0, 0.42, 0.1, PackedColorArray([C[5], C[4], C[3]]))
	fx.ring(x, y, 0.55, 0.16, PackedColorArray([C[5], C[4], C[3]]), false, {"double": true})
	for i in 7:
		var a := a0 + _rnd(-1.4, 1.4)
		var s := _rnd(1.2, 2.6)
		fx.add(x, y, _rnd(8, 13), cos(a) * s, sin(a) * s, _rnd(30, 70), _rnd(0.35, 0.55), _pick([C[3], C[4], C[5]]), 1.0, 300.0, null, 2.0)


## SPLITTING behind: shards scatter in every direction and lie glinting a moment (shards).
func shards(x: float, y: float, r := 1.1) -> void:
	var C := SPLITTING
	var seed := randi() % 1000000
	var n := 9
	var pts := PackedFloat32Array()
	for i in n:
		var a := (float(i) / n) * TAU + (L.hash2(seed, i, 1) - 0.5) * 0.5
		var d := r * (0.45 + L.hash2(seed, i, 2) * 0.55)
		pts.append(cos(a) * d)
		pts.append(sin(a) * d)
		var life := 0.3
		fx.add(x, y, 6.0, cos(a) * d / life, sin(a) * d / life, 55.0, life, _pick([C[4], C[5], C[3]]), 1.0, 360.0, null, 3.0)
	fx.flash(x, y, 6.0, 0.3, 0.08, PackedColorArray([C[5], C[4]]))
	patches.append({"kind": "shards", "x": x, "y": y, "r": r, "t": 0.0, "dur": 1.7, "seed": seed, "pts": pts})


## HEXING, on what it curses (hexHit).
func hex_hit(m, dur: float) -> void:
	var C := HEXING
	snaps.append({"m": m, "t": 0.0, "dur": 0.3})
	var k := _mark(m)
	k["hex"] = maxf(k["hex"], dur)
	k["hex0"] = 0.0
	fx.flash(m.world.x, m.world.y, 14.0, 0.38, 0.12, PackedColorArray([C[5], C[4], C[3]]))
	for i in 10:
		fx.add(m.world.x + _rnd(-0.3, 0.3), m.world.y + _rnd(-0.3, 0.3), _rnd(20, 30), _rnd(-0.2, 0.2), _rnd(-0.2, 0.2), _rnd(-30, -14), _rnd(0.5, 0.9), _pick([C[3], C[4], C[2]]), 1.0, 0.0)


## A cursed monster is struck: its sigil flares and ash bursts from it (hexFlare).
func hex_flare(m) -> void:
	var k = marks.get(m.get_instance_id())
	if k == null or k["hex"] <= 0.0:
		return
	k["flare"] = 0.22
	_streaks(m.world.x, m.world.y, 6, [HEXING[4], HEXING[5], HEXING[3]], 2.4, 3.0, 14.0, 0.22)


## STILLING, on what it slows (stillHit).
func still_hit(m, secs: float) -> void:
	var C := STILLING
	var k := _mark(m)
	if k["still"] <= 0.0:
		k["still0"] = 0.0
	k["still"] = maxf(k["still"], secs)
	fx.ring(m.world.x, m.world.y, 1.1, 0.6, PackedColorArray([C[4], C[3], C[2]]), false)
	fx.ring(m.world.x, m.world.y, 0.8, 0.6, PackedColorArray([C[4], C[3], C[2]]), false, {"delay": 0.16})
	fx.flash(m.world.x, m.world.y, 12.0, 0.32, 0.12, PackedColorArray([C[5], C[4], C[3]]))


## BINDING: `who` held for `secs` (bindOn): three bands (two, the enemy's, at the hero's legs) leap up round it, or out of `from` (a
## snare sprung).
func bind_on(who, secs: float, from: Vector2, enemy: bool) -> void:
	holds = holds.filter(func(h): return h["who"] != who)
	var C: Array = BIND_ENEMY if enemy else BIND
	var n := 2 if enemy else 3
	var heights := [0.08, 0.3] if enemy else [0.12, 0.45, 0.72]
	var a0 := randf() * TAU
	var bands: Array = []
	var pegs: Array = []
	var at: Vector2 = who.world
	for i in n:
		var a := a0 + (float(i) / n) * TAU
		var p := at + Vector2(cos(a), sin(a)) * 0.95
		pegs.append(p)
		bands.append({"from": from if from != Vector2.INF else p, "h": heights[i], "a0": a + PI, "delay": i * 0.04})
	holds.append({"who": who, "t": 0.0, "dur": maxf(BIND_TIME["wrap"] + BIND_TIME["unravel"], secs), "enemy": enemy, "bands": bands, "pegs": pegs})
	fx.ring(at.x, at.y, 1.0, 0.26, PackedColorArray([C[5], C[4], C[3]]), false, {"heavy": true})
	for p in pegs:
		_letters(p.x, p.y, 4, C, 1.0, 70.0, 2.0, 0.1)
	later.append({"t": BIND_TIME["wrap"] - 0.02, "fn": func():
		if not is_instance_valid(who):
			return
		var hh := _height(who)
		var w: Vector2 = who.world
		fx.flash(w.x, w.y, hh * 0.45, 0.45, 0.1, PackedColorArray([C[5], C[4], C[3]]))
		_letters(w.x, w.y, 14, C, 3.0, 60.0, hh * 0.45, 0.2)
		fx.kick(2.0 if enemy else 2.6)
		fx.hold(0.04)
		for p in pegs:
			fx.flash(p.x, p.y, 2.0, 0.18, 0.08, PackedColorArray([C[5], C[4]]))
			fx.add(p.x, p.y, 1.0, _rnd(-0.6, 0.6), _rnd(-0.6, 0.6), _rnd(30, 60), 0.35, Color("#6a5e50"), 1.0, 300.0)})
	fx.glow(at.x, at.y, 46.0, 0.35)


## BINDING BEHIND: the snare at (x, y) springs on `m` (snareSprung).
func snare_sprung(m, x: float, y: float, secs: float, r := 1.0) -> void:
	var C := BIND
	burns.append({"x": x, "y": y, "r": r, "t": 0.0, "dur": BIND_TIME["sprung"]})
	fx.flash(x, y, 3.0, minf(1.2, r * 0.6), 0.12, PackedColorArray([C[5], C[4], C[3]]))
	fx.ring(x, y, r * 1.15, 0.3, PackedColorArray([C[5], C[4], C[3]]), false, {"heavy": true})
	_letters(x, y, 22, C, 2.4, 90.0, 3.0, r * 0.6)
	bind_on(m, secs, Vector2(x, y), false)


func _height(who) -> float:
	return 32.0 if who.get("kind") == null else W3.top_of(who)


func _half(who) -> float:
	if who.get("kind") == null:
		return 8.0
	var art = who.get("art")
	var figure: String = str(art.name) if art != null else str(who.kind)
	return float(L.FIGURE_SIZE[figure].get("half", 9)) if L.FIGURE_SIZE.has(figure) else 9.0


# --- the clock ---

func tick(dt: float) -> void:
	for i in range(later.size() - 1, -1, -1):
		var q: Dictionary = later[i]
		q["t"] -= dt
		if q["t"] <= 0.0:
			later.remove_at(i)
			(q["fn"] as Callable).call()
	for list in [patches, snaps, holds, burns]:
		for i in range(list.size() - 1, -1, -1):
			list[i]["t"] += dt
			if list[i]["t"] >= list[i]["dur"]:
				list.remove_at(i)
	for i in range(copies.size() - 1, -1, -1):
		var c: Dictionary = copies[i]
		c["t"] += dt
		c["x"] += c["vx"] * dt
		c["y"] += c["vy"] * dt
		if c["t"] >= c["dur"]:
			copies.remove_at(i)
	for id in marks.keys():
		var k: Dictionary = marks[id]
		if not is_instance_valid(k["m"]) or k["m"].dead:
			marks.erase(id)
			continue
		if k["hex"] > 0.0:
			k["hex"] -= dt
			k["hex0"] += dt
		if k["flare"] > 0.0:
			k["flare"] -= dt
		if k["still"] > 0.0:
			k["still"] -= dt
			k["still0"] += dt
		if k["hex"] <= 0.0 and k["flare"] <= 0.0 and k["still"] <= 0.0:
			marks.erase(id)


# --- drawing helpers (game pixels) ---

func _dot(c: CanvasItem, x: float, y: float, col: Color, up := 0.0, w := 1.0, h := 1.0) -> void:
	fx.rect(c, floorf(fx.gx(x, y) + 0.5), floorf(fx.gy(x, y) + 0.5) - up, w, h, col)


static func _fade_of(p: Dictionary) -> float:
	return minf(1.0, minf(float(p["t"]) / 0.18, (float(p["dur"]) - float(p["t"])) / 0.5))


func _ring_of(c: CanvasItem, cx: float, cy: float, r: float, col: Color, gap := 1, from := 0.0, sweep := TAU) -> void:
	var n := maxi(16, roundi(r * 44.0))
	var i := 0
	while i < n:
		var a := from + (float(i) / n) * sweep
		fx.rect(c, floorf(cx + (cos(a) - sin(a)) * 16.0 * r + 0.5), floorf(cy + (cos(a) + sin(a)) * 8.0 * r + 0.5), 1, 1, col)
		i += gap


func _sign(c: CanvasItem, x: float, y: float, which: int, C: Array, a := 1.0) -> void:
	var s: Array = SIGNS[which % SIGNS.size()]
	for r in 3:
		for k in 3:
			if s[r][k] == "X":
				fx.rect(c, x - 1.0 + k, y - 1.0 + r + 1.0, 1, 1, Color("#05040a", a))
	for r in 3:
		for k in 3:
			if s[r][k] == "X":
				fx.rect(c, x - 1.0 + k, y - 1.0 + r, 1, 1, Color(C[4] if r == 0 else C[3], a))


func _clock_face(c: CanvasItem, cx: float, cy: float, r: float, t: float, alpha: float, C: Array, step := 0.55) -> void:
	var hand := floori(t / step) % 12
	for i in 12:
		var a := (i / 12.0) * TAU - PI * 0.75
		var px := floorf(cx + (cos(a) - sin(a)) * 16.0 * r + 0.5)
		var py := floorf(cy + (cos(a) + sin(a)) * 8.0 * r + 0.5)
		var col: Color = C[5] if i == hand else (C[4] if i % 3 == 0 else C[3])
		fx.rect(c, px, py, 2 if (i == hand or i % 3 == 0) else 1, 1, Color(col, alpha))


# --- on the floor ---

## (fx_wakes.gd hands on the hero's patches of the city's words: the vortex, the hex circle, the bubble, the snare) True if it drew it.
func draw_patch(c: CanvasItem, z: Dictionary) -> bool:
	var t: float = fx.clock
	var p := {"x": z["x"], "y": z["y"], "r": z["r"], "t": z["t"], "dur": z["dur"], "seed": int(absf(float(z["x"]) * 131.0 + float(z["y"]) * 977.0)) % 1000000}
	match str(z["kind"]):
		"vortex":
			_vortex(c, p, t)
		"hex":
			_hex_circle(c, p, t)
		"bubble":
			_bubble(c, p, t)
		"snare":
			_snare(c, p, t)
		_:
			return false
	return true


func draw_floor(c: CanvasItem) -> void:
	var t: float = fx.clock
	for p in patches:
		if p["kind"] == "vortex":
			_vortex(c, p, t)
		elif p["kind"] == "shards":
			_shards(c, p, t)
	for id in marks:
		var k: Dictionary = marks[id]
		var m = k["m"]
		if k["still"] > 0.0 and is_instance_valid(m) and not m.dead and m.visible:
			_clock_face(c, fx.gx(m.world.x, m.world.y), fx.gy(m.world.x, m.world.y), 0.42, t, minf(1.0, minf(k["still0"] / 0.2, k["still"] / 0.3)), STILLING)
	for b in burns:
		_burn(c, b)


## drawVortex.
func _vortex(c: CanvasItem, p: Dictionary, t: float) -> void:
	var C := PULLING
	var short: bool = float(p["dur"]) < 1.0
	var fade := _fade_of(p)
	var born := minf(1.0, float(p["t"]) / (0.08 if short else 0.3))
	var R: float = float(p["r"]) * ((1.0 - 0.5 * float(p["t"]) / float(p["dur"])) if short else (0.6 + 0.4 * born))
	var cx: float = fx.gx(p["x"], p["y"])
	var cy: float = fx.gy(p["x"], p["y"])
	fx.floor_oval(c, cx, cy, R, C[1], 0.34 * fade)
	fx.floor_oval(c, cx, cy, R * 0.66, C[0], 0.4 * fade)
	fx.floor_oval(c, cx, cy, R * 0.32, Color("#05040e"), 0.75 * fade)
	var arms := 4 if short else 3
	var spin := -t * (6.0 if short else 1.7)
	for a in arms:
		var steps := maxi(24, roundi(R * 70.0))
		for s in steps + 1:
			var u := float(s) / steps
			if fposmod(u * 4.0 - t * (4.0 if short else 1.25) + a * 0.37, 1.0) > 0.72:
				continue
			var rho := R * (1.0 - 0.7 * u)
			var th := (float(a) / arms) * TAU + spin + u * 3.1
			var col: Color = C[5] if u > 0.8 else (C[4] if u > 0.45 else (C[3] if u > 0.15 else C[2]))
			_dot(c, float(p["x"]) + cos(th) * rho, float(p["y"]) + sin(th) * rho, Color(col, fade), 0.0, 2 if u > 0.15 else 1, 1)
	_ring_of(c, cx, cy, R * 0.32, Color(C[5] if sin(t * 9.0 + float(p["seed"])) > 0.0 else C[4], fade), 1)
	_ring_of(c, cx, cy, R, Color(C[3], fade * 0.8), 3)


## drawShards.
func _shards(c: CanvasItem, p: Dictionary, t: float) -> void:
	var C := SPLITTING
	if float(p["t"]) < 0.28:
		return
	var fade := minf(1.0, (float(p["dur"]) - float(p["t"])) / 0.5)
	var pts: PackedFloat32Array = p["pts"]
	for i in range(0, pts.size() - 1, 2):
		var x := floorf(fx.gx(float(p["x"]) + pts[i], float(p["y"]) + pts[i + 1]) + 0.5)
		var y := floorf(fx.gy(float(p["x"]) + pts[i], float(p["y"]) + pts[i + 1]) + 0.5)
		fx.rect(c, x - 1.0, y + 1.0, 3, 1, Color("#0c0614", fade))
		fx.rect(c, x + 1.0, y - 1.0, 1, 2, Color(C[2], fade))
		fx.rect(c, x, y - 2.0, 1, 3, Color(C[3], fade))
		fx.rect(c, x, y - 2.0, 1, 1, Color(C[5], fade))
		if L.hash2(int(p["seed"]) + i, floori(t * 8.0), 3) < 0.12:
			fx.rect(c, x - 1.0, y - 3.0, 3, 1, Color(C[5], fade))
			fx.rect(c, x, y - 4.0, 1, 3, Color(C[5], fade))


## drawBubble.
func _bubble(c: CanvasItem, p: Dictionary, t: float) -> void:
	var C := STILLING
	var fade := _fade_of(p)
	var born := minf(1.0, float(p["t"]) / 0.25)
	var R: float = float(p["r"]) * (0.55 + 0.45 * born)
	var cx: float = fx.gx(p["x"], p["y"])
	var cy: float = fx.gy(p["x"], p["y"])
	fx.floor_oval(c, cx, cy, R, C[1], 0.2 * fade)
	for i in 2:
		var q := fmod(float(p["t"]) / 2.6 + i * 0.5, 1.0)
		_ring_of(c, cx, cy, R * (0.15 + 0.8 * q), Color(C[3], fade * 0.6 * (1.0 - q)), 2)
	_ring_of(c, cx, cy, R, Color(C[3], fade), 1)
	_ring_of(c, cx, cy, R, Color(C[5], fade), 1, PI * 1.05, PI * 0.45)
	_clock_face(c, cx, cy, R * 0.86, t, fade, C, 0.7)


## drawHexCircle.
func _hex_circle(c: CanvasItem, p: Dictionary, t: float) -> void:
	var C := HEXING
	var fade := _fade_of(p)
	var drawn := minf(1.0, float(p["t"]) / 0.3)
	var cx: float = fx.gx(p["x"], p["y"])
	var cy: float = fx.gy(p["x"], p["y"])
	var R: float = p["r"]
	fx.floor_oval(c, cx, cy, R, Color("#08060c"), 0.45 * fade)
	fx.floor_oval(c, cx, cy, R * 0.55, C[1], 0.2 * fade)
	var from := -PI / 2.0
	_ring_of(c, cx, cy, R * 1.015, Color(C[2], fade), 1, from, TAU * drawn)
	_ring_of(c, cx, cy, R, Color(C[4], fade), 1, from, TAU * drawn)
	_ring_of(c, cx, cy, R * 0.84, Color(C[3], fade), 2, from, TAU * drawn)
	var turn := t * 0.35
	for i in 8:
		var a := turn + (i / 8.0) * TAU
		if fposmod(a - from, TAU) > TAU * drawn:
			continue
		_sign(c, floorf(cx + (cos(a) - sin(a)) * 16.0 * R * 0.92 + 0.5), floorf(cy + (cos(a) + sin(a)) * 8.0 * R * 0.92 + 0.5), i % 3, C, fade)
	for i in 4:
		var a0 := -t * 0.5 + (i / 4.0) * TAU
		for s in 15:
			var u := s / 14.0
			if u > drawn:
				break
			var rho := R * (0.2 + 0.42 * u)
			var a := a0 + u * 1.1
			_dot(c, float(p["x"]) + cos(a) * rho, float(p["y"]) + sin(a) * rho, Color(C[4] if u > 0.8 else C[3], fade), 0.0, 2, 1)


# --- Binding's bands ---

## A band of script along screen points (game pixels): four deep, a dark ribbon, its upper edge lit, the words written on it crawling
## along (bandAlong).
func _band(c: CanvasItem, pts: PackedFloat32Array, C: Array, scroll: float, alpha := 1.0) -> void:
	if alpha <= 0.0:
		return
	var a := minf(1.0, alpha)
	var run := 0
	var sc := floori(scroll)
	for i in range(0, pts.size() - 3, 2):
		var x0 := pts[i]
		var y0 := pts[i + 1]
		var x1 := pts[i + 2]
		var y1 := pts[i + 3]
		var steps := maxi(1, roundi(maxf(absf(x1 - x0), absf(y1 - y0))))
		for s in steps:
			var x := floorf(x0 + (x1 - x0) * s / steps + 0.5)
			var y := floorf(y0 + (y1 - y0) * s / steps + 0.5)
			fx.rect(c, x, y - 1.0, 1, 1, Color(C[2], a))
			fx.rect(c, x, y, 1, 2, Color(C[0], a))
			fx.rect(c, x, y + 2.0, 1, 1, Color(C[1], a))
			var k := run + sc
			var ch := floori(k / 4.0)
			var col := posmod(k, 4)
			var word := L.hash2(floori(ch / 5.0), 3, 9)
			var gap := L.hash2(ch, 5, 11) < 0.18 or (posmod(ch, 5) == 4 and word > 0.4)
			if col < 3 and not gap:
				var glyph: Array = SCRIPT[floori(L.hash2(ch, 1, 13) * SCRIPT.size())]
				var bright: Color = C[5] if L.hash2(ch, 2, 17) > 0.7 else C[4]
				if glyph[0][col] == "X":
					fx.rect(c, x, y, 1, 1, Color(bright, a))
				if glyph[1][col] == "X":
					fx.rect(c, x, y + 1.0, 1, 1, Color(bright, a))
			run += 1


static func _front_arc(cx: float, cy: float, rx: float, ry: float, from := 0.0, to := PI) -> PackedFloat32Array:
	var pts := PackedFloat32Array()
	var n := maxi(6, roundi(rx * 1.2))
	for i in n + 1:
		var a := from + (to - from) * i / n
		pts.append(cx + cos(a) * rx)
		pts.append(cy + sin(a) * ry)
	return pts


static func _whip(x0: float, y0: float, x1: float, y1: float, lift: float, a: float, b: float, wob: float) -> PackedFloat32Array:
	var pts := PackedFloat32Array()
	for i in 15:
		var q := a + (b - a) * i / 14.0
		var mx := (x0 + x1) / 2.0
		var my := (y0 + y1) / 2.0 - lift
		var u := 1.0 - q
		pts.append(u * u * x0 + 2.0 * u * q * mx + q * q * x1 + sin(q * 9.0 + wob) * 2.0 * (1.0 - q))
		pts.append(u * u * y0 + 2.0 * u * q * my + q * q * y1)
	return pts


func _peg(c: CanvasItem, x: float, y: float, C: Array, a: float) -> void:
	var X := floorf(x + 0.5)
	var Y := floorf(y + 0.5)
	fx.rect(c, X - 1.0, Y - 4.0, 3, 5, Color(C[1], a))
	fx.rect(c, X, Y - 4.0, 1, 4, Color(C[3], a))
	fx.rect(c, X, Y - 5.0, 1, 1, Color(C[5], a))


## drawHold: the bands round what is held, and the bands leaping.
func _hold(c: CanvasItem, h: Dictionary) -> void:
	var who = h["who"]
	if not is_instance_valid(who) or (who.get("dead") == true):
		return
	var C: Array = BIND_ENEMY if h["enemy"] else BIND
	var top := _height(who)
	var half := _half(who)
	var sx := floorf(fx.gx(who.world.x, who.world.y) + 0.5)
	var sy := floorf(fx.gy(who.world.x, who.world.y) + 0.5)
	var left: float = float(h["dur"]) - float(h["t"])
	var going: float = 1.0 - left / float(BIND_TIME["unravel"]) if left < float(BIND_TIME["unravel"]) else 0.0
	var scroll: float = fx.clock * 14.0
	var strain := sin(fx.clock * 9.0 + float(who.get_instance_id() % 997)) > 0.92
	for bi in h["bands"].size():
		var b: Dictionary = h["bands"][bi]
		var t: float = float(h["t"]) - float(b["delay"])
		if t < 0.0:
			continue
		var by := sy - floorf(top * float(b["h"]) + 0.5)
		var tight := half * (0.8 if float(b["h"]) < 0.2 else 1.0) + 2.0
		var f: Vector2 = b["from"]
		var fx0: float = fx.gx(f.x, f.y)
		var fy0: float = fx.gy(f.x, f.y)
		if t < float(BIND_TIME["whip"]):
			var q := 1.0 - pow(1.0 - t / float(BIND_TIME["whip"]), 2.0)
			var pts := _whip(fx0, fy0, sx + cos(b["a0"]) * tight, by + sin(b["a0"]) * tight * 0.38, 26.0 + top * 0.4, maxf(0.0, q - 0.7), q, b["a0"])
			_band(c, pts, C, scroll)
			fx.rect(c, floorf(pts[pts.size() - 2] + 0.5) - 1.0, floorf(pts[pts.size() - 1] + 0.5) - 1.0, 3, 3, C[5])
			continue
		var w := minf(1.0, (t - float(BIND_TIME["whip"])) / (float(BIND_TIME["wrap"]) - float(BIND_TIME["whip"])))
		var ew := 1.0 - pow(1.0 - w, 2.0)
		var rx := tight * (1.9 - 0.9 * ew) + going * tight * 0.8 + (1.0 if strain else 0.0)
		var ry := rx * 0.38
		var alpha := 1.0 - going
		if w >= 1.0 and going < 0.6:
			var pg: Vector2 = h["pegs"][bi]
			var pxs: float = fx.gx(pg.x, pg.y)
			var pys: float = fx.gy(pg.x, pg.y)
			var ax := sx + cos(atan2(pys - sy, pxs - sx)) * rx
			_band(c, PackedFloat32Array([ax, by + ry * 0.6, pxs, pys - 2.0]), C, -scroll, alpha * 0.9)
		var wrap_at := PI * (0.35 + 0.65 * w) if w < 1.0 else PI
		_band(c, _front_arc(sx, by, rx, ry, 0.0, wrap_at), C, scroll + float(b["h"]) * 20.0, alpha)
		if w < 1.0 or strain:
			fx.rect(c, sx - floorf(rx + 0.5), by - 1.0, 1, 2, C[5])
			fx.rect(c, sx + floorf(rx + 0.5), by - 1.0, 1, 2, C[5])
	if float(h["t"]) > float(BIND_TIME["wrap"]) - 0.05:
		for pg in h["pegs"]:
			_peg(c, fx.gx(pg.x, pg.y), fx.gy(pg.x, pg.y), C, 1.0 - going)


## drawSnare: the snare lying in wait.
func _snare(c: CanvasItem, p: Dictionary, t: float) -> void:
	var C := BIND
	var cx: float = fx.gx(p["x"], p["y"])
	var cy: float = fx.gy(p["x"], p["y"])
	var r := minf(1.4, float(p["r"]))
	var born := minf(1.0, float(p["t"]) / 0.3)
	var fade := minf(1.0, (float(p["dur"]) - float(p["t"])) * 2.0) * born
	var breath := 0.75 + 0.25 * sin(t * 2.4 + float(p["x"]))
	var rw := roundf(r * 22.6)
	var rh := roundf(r * 11.3)
	for dy in range(-int(rh), int(rh) + 1):
		var hw := roundf(rw * sqrt(1.0 - (dy / rh) * (dy / rh)))
		fx.rect(c, floorf(cx + 0.5) - hw, floorf(cy + 0.5) + dy, hw * 2.0 + 1.0, 1, Color(C[3], 0.22 * fade * breath))
	var ring := PackedFloat32Array()
	var turn := t * 0.3
	for i in roundi(48.0 * born) + 1:
		var a := turn + (i / 48.0) * TAU
		ring.append(cx + cos(a) * rw)
		ring.append(cy + sin(a) * rh)
	_band(c, ring, C, t * 8.0, fade)
	for i in 64:
		var a := (i / 64.0) * TAU
		fx.rect(c, floorf(cx + cos(a) * (rw + 3.0) + 0.5), floorf(cy + sin(a) * (rh + 2.0) + 0.5), 1, 1, Color(C[3], 0.6 * fade * breath))
	var coil := PackedFloat32Array()
	for i in 41:
		var u := i / 40.0
		if u > born:
			break
		var a := -turn * 1.6 + u * TAU * 1.6
		var rho := 0.15 + 0.55 * u
		coil.append(cx + cos(a) * rw * rho)
		coil.append(cy + sin(a) * rh * rho - ((u - 0.85) * 40.0 * (0.5 + 0.5 * sin(t * 3.0)) if u > 0.85 else 0.0))
	_band(c, coil, C, -t * 10.0, fade)
	for i in 3:
		var a := (i / 3.0) * TAU + 0.5
		_peg(c, cx + cos(a) * rw * 1.08, cy + sin(a) * rh * 1.08, C, fade * breath)


## drawBurn: a snare sprung burns out.
func _burn(c: CanvasItem, b: Dictionary) -> void:
	var C := BIND
	var k: float = float(b["t"]) / float(b["dur"])
	var cx: float = fx.gx(b["x"], b["y"])
	var cy: float = fx.gy(b["x"], b["y"])
	var r := minf(1.4, float(b["r"])) * (1.0 + k * 0.4)
	var ring := PackedFloat32Array()
	for i in 49:
		var a := (i / 48.0) * TAU
		ring.append(cx + cos(a) * r * 22.6)
		ring.append(cy + sin(a) * r * 11.3)
	_band(c, ring, [C[2], C[3], C[4], C[5], C[5], C[5]] if k < 0.3 else C, fx.clock * 30.0, 1.0 - k)


# --- over what stands ---

func draw_air(c: CanvasItem, wakes: Array) -> void:
	var t: float = fx.clock
	# (the vortex's motes drawn in, the hex circle's ash rising: air3)
	for z in wakes:
		var kind := str(z["kind"])
		if kind != "vortex" and kind != "hex":
			continue
		var p := {"x": z["x"], "y": z["y"], "r": z["r"], "t": z["t"], "dur": z["dur"], "seed": int(absf(float(z["x"]) * 131.0 + float(z["y"]) * 977.0)) % 1000000}
		var fade := _fade_of(p)
		var R: float = p["r"]
		if kind == "vortex":
			var C := PULLING
			var n := roundi(8.0 + R * 6.0)
			for i in n:
				var q := L.hash2(p["seed"], i, 31)
				var u := fmod(t * 0.42 + q, 1.0)
				var up := roundf(1.0 + 7.0 * (1.0 - u) * L.hash2(p["seed"], i, 32))
				var th0 := q * TAU + u * 3.4 - t * 1.7
				var th1 := q * TAU + maxf(0.0, u - 0.05) * 3.4 - t * 1.7
				var r0 := R * (1.0 - u) * 0.98
				var r1 := R * (1.0 - maxf(0.0, u - 0.05)) * 0.98
				var x0: float = fx.gx(float(p["x"]) + cos(th0) * r0, float(p["y"]) + sin(th0) * r0)
				var y0: float = fx.gy(float(p["x"]) + cos(th0) * r0, float(p["y"]) + sin(th0) * r0)
				var x1: float = fx.gx(float(p["x"]) + cos(th1) * r1, float(p["y"]) + sin(th1) * r1)
				var y1: float = fx.gy(float(p["x"]) + cos(th1) * r1, float(p["y"]) + sin(th1) * r1)
				fx.pline(c, x0, y0 - up, x1, y1 - up, Color(C[5] if u > 0.7 else C[4], fade * (u / 0.15 if u < 0.15 else 1.0)))
		else:
			var C := HEXING
			var n := roundi(6.0 + R * 5.0)
			for i in n:
				var q := L.hash2(p["seed"], i, 41)
				var u := fmod(t * 0.7 + q, 1.0)
				var a := L.hash2(p["seed"], i, 42) * TAU
				var d := sqrt(L.hash2(p["seed"], i, 43)) * R * 0.85
				_dot(c, float(p["x"]) + cos(a) * d, float(p["y"]) + sin(a) * d, Color(C[4] if i % 3 == 0 else C[3], fade * (u / 0.2 if u < 0.2 else 1.0 - (u - 0.2) * 0.5)), roundf(22.0 * (1.0 - u)))
	# (the cursed's sigils over their heads)
	for id in marks:
		var k: Dictionary = marks[id]
		var m = k["m"]
		if not is_instance_valid(m) or m.dead or not m.visible or (k["hex"] <= 0.0 and k["flare"] <= 0.0):
			continue
		var sx := floorf(fx.gx(m.world.x, m.world.y) + 0.5)
		var top := floorf(fx.gy(m.world.x, m.world.y) + 0.5) - W3.top_of(m)
		_sigil(c, sx, top - 13.0 + floorf(sin(t * 2.6 + float(id % 997)) * 1.2 + 0.5), k, t)
	# (the signs coming down on the cursed)
	for s in snaps:
		var m = s["m"]
		if not is_instance_valid(m):
			continue
		var C := HEXING
		var k: float = float(s["t"]) / float(s["dur"])
		var R := 1.05 * (1.0 - k) + 0.22
		for i in 6:
			var a := (i / 6.0) * TAU + k * 2.4
			var px := floorf(fx.gx(m.world.x + cos(a) * R, m.world.y + sin(a) * R) + 0.5)
			var py := floorf(fx.gy(m.world.x + cos(a) * R, m.world.y + sin(a) * R) + 0.5) - roundf(8.0 + 18.0 * k)
			_sign(c, px, py, i % 3, [C[5], C[5], C[5], C[5], C[5], C[5]] if k > 0.7 else C)
	# (Splitting's copies flying on)
	for cp in copies:
		var C := SPLITTING
		var sp := maxf(1e-6, Vector2(cp["vx"], cp["vy"]).length())
		var u := Vector2(cp["vx"], cp["vy"]) / sp
		var x: float = cp["x"]
		var y: float = cp["y"]
		var x0: float = fx.gx(x, y)
		var y0: float = fx.gy(x, y) - 10.0
		var x1: float = fx.gx(x - u.x * 0.55, y - u.y * 0.55)
		var y1: float = fx.gy(x - u.x * 0.55, y - u.y * 0.55) - 10.0
		var x2: float = fx.gx(x - u.x * 0.25, y - u.y * 0.25)
		var y2: float = fx.gy(x - u.x * 0.25, y - u.y * 0.25) - 10.0
		fx.pline(c, x1, y1 + 1.0, x0, y0 + 1.0, C[1])
		fx.pline(c, x1, y1, x0, y0, C[2])
		fx.pline(c, x2, y2, x0, y0, C[3])
		fx.pline(c, x2, y2 + 1.0, x0, y0 + 1.0, C[2])
		fx.rect(c, floorf(x0 + 0.5) - 1.0, floorf(y0 + 0.5), 3, 2, C[5])
	# (Binding's bands)
	for h in holds:
		_hold(c, h)


## drawSigil: the hex over a cursed head; flaring as it is struck.
func _sigil(c: CanvasItem, sx: float, cy: float, k: Dictionary, t: float) -> void:
	var C := HEXING
	var n := HEX_GLYPH.size()
	var x0 := sx - floorf(n / 2.0)
	var y0 := cy - floorf(n / 2.0)
	var flare: bool = k["flare"] > 0.0
	var going := minf(1.0, minf(k["hex"] / 0.3, k["hex0"] / 0.12)) if k["hex"] > 0.0 else 1.0
	for r in n:
		for col in HEX_GLYPH[r].length():
			if HEX_GLYPH[r][col] == ".":
				continue
			fx.rect(c, x0 + col - 1.0, y0 + r, 3, 1, Color("#05040a", going))
			fx.rect(c, x0 + col, y0 + r - 1.0, 1, 3, Color("#05040a", going))
	for r in n:
		for col in HEX_GLYPH[r].length():
			var ch: String = HEX_GLYPH[r][col]
			if ch == ".":
				continue
			var cc: Color = C[5] if flare else ((C[5] if sin(t * 5.0) > -0.3 else C[4]) if ch == "o" else (C[4] if r < 2 else C[3]))
			fx.rect(c, x0 + col, y0 + r, 1, 1, Color(cc, going))
	if flare:
		var q: float = 1.0 - k["flare"] / 0.22
		for i in 10:
			var a := (i / 10.0) * TAU
			fx.rect(c, floorf(sx + cos(a) * (4.0 + q * 8.0) + 0.5), floorf(cy + sin(a) * (3.0 + q * 5.0) + 0.5), 1, 1, Color(C[4], going))


## A colour laid over a monster's picture (tint3, tintB3): the cursed and those in a hex circle drained grey; the slowed mint; a held one
## white an instant as its bands snap tight.
func tint(m, wakes: Array) -> Color:
	var t: float = fx.clock
	for h in holds:
		if h["who"] == m:
			var since: float = float(h["t"]) - float(BIND_TIME["wrap"])
			if since >= -0.02 and since < 0.08:
				return Color(BIND[4], 0.55)
	var k = marks.get(m.get_instance_id())
	var a := 0.0
	if k != null and k["hex"] > 0.0:
		a = 0.26 + 0.08 * sin(t * 4.0 + float(m.get_instance_id() % 997))
	var in_bubble := false
	for z in wakes:
		if z["kind"] == "hex" and m.world.distance_to(Vector2(z["x"], z["y"])) < float(z["r"]):
			a = maxf(a, 0.5 * _fade_of(z))
		if z["kind"] == "bubble" and m.world.distance_to(Vector2(z["x"], z["y"])) <= float(z["r"]):
			in_bubble = true
	if k != null and k["flare"] > 0.0:
		return Color(HEXING[5], 0.55)
	if a > 0.0:
		return Color(HEXING[3], a)
	if (k != null and k["still"] > 0.0) or in_bubble:
		return Color(STILLING[3], 0.24 + 0.05 * sin(t * 2.0 + float(m.get_instance_id() % 997)))
	return Color(0, 0, 0, 0)


## Light (lights3, lightsB3): the snares' glow; a hold's.
func lights(wakes: Array) -> void:
	var t: float = fx.clock
	for z in wakes:
		if z["kind"] == "snare":
			fx.look.spot(Vector2(fx.gx(z["x"], z["y"]), fx.gy(z["x"], z["y"]) - 2.0), 40.0 + float(z["r"]) * 22.0, (0.85 + 0.12 * sin(t * 2.4 + float(z["x"]))) * minf(1.0, (float(z["dur"]) - float(z["t"])) * 2.0))
	for h in holds:
		var who = h["who"]
		if not is_instance_valid(who):
			continue
		var left: float = float(h["dur"]) - float(h["t"])
		fx.look.spot(Vector2(fx.gx(who.world.x, who.world.y), fx.gy(who.world.x, who.world.y) - _height(who) * 0.4), 30.0, (0.4 if h["enemy"] else 0.55) * minf(1.0, left / float(BIND_TIME["unravel"])))
