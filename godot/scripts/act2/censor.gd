## THE CENSOR, FLOOR 15'S BOSS (the Great Library's Reading Room), as the game fights him (game/act1_rules/censor.ts RULES, CENSOR,
## CENSOR_FIGHT on: "I'd like the ink to fill the floor as you fight and you take damage if you stand on the ink spots"; art/censor.ts,
## censor_moves.ts, censor2_shots.ts). The leader of the Silent Order, robed in black, with a great ink brush.
##   HIS WALK: 0.8 tiles a second, stopping at any frame; 2 tiles off, and 0.6 nearer.
##   THE BRUSH SLASH (his basic, within 2.7 tiles; list `attack`, 1.8 s): down and across before him at 0.8 s, its point 2.55 tiles out,
##     from 40 degrees to his right to 35 to his left: struck x1; an arc of ink lies there 1.2 s (censor:slash).
##   STRIKE-THROUGH (within 11 tiles; every 7 s, the first 3 s in; list `strike`, 2.2 s), TWICE IN A ROW, the second where the hero is
##     heading: the line he will draw marked from 0.26 s; the thrust at 0.9 s: the brush itself strikes whoever is along it (x1.5), and
##     a line of ink runs from its point at 16 tiles a second to the first wall (12 tiles at most): whoever its head runs through is
##     struck x1.5 (censor:line).
##   REDACTION (within 9 tiles; every 9 s, the first 5 s in; list `redact`, 2.6 s), by turns: five bars one way, a tile wide and up to
##     7 long, a tile's gap between each; both ways at once (the squares between to stand in); the page struck out (nine lines a tile
##     apart across his room, each with a gap 2 tiles wide near the hero, one after another 0.3 s apart). Marked out 0.6 s before they
##     slam at 1 s: whoever is under one is struck x1.2 (censor:bars).
##   THE HUSH (within 12 tiles; every 15 s, the first 9 s in, not while the hero is hushed; list `hush`, 2.6 s): at 1.06 s a ring of
##     silence rolls out across his whole room in 1 s: as it passes the hero his words go dark (censor:hush).
##   HIS INK, all the while (not through his Redaction): every 1.8 s a cross of two bars 5 tiles long slams down where the hero is
##     heading (x0.8), every third time with a line of ink run across the room through him from the wall behind him (x1).
##   WHAT HE LAYS STAYS: every bar and every line of ink lies where it fell; whoever stands on it is hurt every 0.5 s (x0.25); the floor
##     fills as the fight goes (from 8% of his room at his full life to 32% at his end), the oldest drying away past that. Standing
##     with three of the nine tiles round him inked, or a big move over, HE WALKS OFF TO CLEAN FLOOR, 3 to 6.5 tiles off, nearer the
##     hero the better, at 1.2 tiles a second.
##   AS HE DIES what of his is still to come does not; his ink dries away; the book of stolen words bursts, its words flying home
##     (censor:book).
extends "res://scripts/act1/act1.gd"

const GAIT := {"pace": 0.8, "cycle": 1.0 / 8.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.0, "slack": 0.6, "trueBack": true}
const SLASH := {"long": 1.8, "hit": 24.0 / 30.0, "reach": 2.55, "from": -40.0, "to": 35.0, "mark": 1.2}
const STRIKE := {"long": 2.2, "warn": [0.26, 0.78], "hit": 27.0 / 30.0, "point": Vector2(2.457, -0.186), "speed": 16.0, "most": 12.0, "half": 0.4, "lie": 1.4}
const REDACT := {"long": 2.6, "hit": 1.0, "warn": 0.6, "lay": 0.12, "lie": 2.0, "n": 5, "apart": 2.0, "bar": 7.0, "wide": 1.0, "half": 0.55, "slow": 0.35}
const HUSH := {"long": 2.6, "hit": 1.06, "ring": 1.0, "veil": 3.0, "least": 6.0, "most": 20.0}
const BOOK_FLY := 3.0
const INKF := {"every": 1.8, "bar": 5.0, "dmg": 0.8, "line": 3, "warn": 0.8, "lineDmg": 1.0, "lineLeast": 5.0}
const LEAD := {"lead": 0.5, "most": 2.2}
const ROW := 2
const PAGE := {"n": 9, "apart": 0.3, "long": 13.0, "gap": 2.0, "wander": 3.0}
const REDACT_CD := 9.0
const HUSH_CD := 15.0
const REST := 0.85
const FILL := {"least": 0.08, "most": 0.32, "tick": 0.5, "dmg": 0.25, "dry": 0.8}
const WALK := {"speed": 1.2, "crowd": 3, "near": 3.0, "far": 6.5, "again": 2.5, "most": 7.0}
const FOE := Color("#ff8a3a")
const ACTS := [
	{"id": "censor:slash", "clip": "attack", "long": 1.8, "hit": 24.0 / 30.0, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 2.7},
	{"id": "censor:strike", "clip": "strike", "long": 2.2, "hit": 27.0 / 30.0, "dmg": 1.5, "cooldown": 7.0, "first": 3.0, "after": 0.6, "near": 0.0, "far": 11.0},
	{"id": "censor:redact", "clip": "redact", "long": 2.6, "hit": 1.0, "dmg": 1.2, "cooldown": 10.0, "first": 5.0, "after": 0.6, "near": 0.0, "far": 9.0},
	{"id": "censor:hush", "clip": "hush", "long": 2.6, "hit": 1.06, "dmg": 0.0, "cooldown": 18.0, "first": 9.0, "after": 0.6, "near": 0.0, "far": 12.0},
]
const I_STRIKE := 1
const I_REDACT := 2
const I_HUSH := 3

## WHAT OF HIS INK LIES ON THE FLOOR (censor.ts Pool): the marks laid to stay, oldest first (each keeps its own `tiles`); how many lie
## on each tile, how many tiles have any; when it last hurt the hero (the perils' clock), and how hard it hurts. One floor's at a time.
static var pool := {}

var _mask := PackedByteArray()
var _laying = null


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(m) -> void:
	a1 = {"hx": m.world.x, "hy": m.world.y, "rp": 0}
	_pool_of(m.mgr.map)


# --- his ground (censorGround: monsters.json `censor`) ---

## His ground, a tile to each: 1 for his.
func _ground(m) -> PackedByteArray:
	if _mask.is_empty():
		var map = m.mgr.map
		_mask.resize(map.w * map.h)
		for i in m.mgr.censor.get("ground", []):
			_mask[int(i)] = 1
	return _mask


## Whether (x, y) is on his ground and can be walked on.
func on_ground(m, x: float, y: float) -> bool:
	var map = m.mgr.map
	var tx := floori(x)
	var ty := floori(y)
	if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h:
		return false
	var i: int = ty * map.w + tx
	return _ground(m)[i] == 1 and map.walk[i] == 1


## hushReach: how far the Hush reaches from (x, y): to the far side of his ground, 6 to 20 tiles.
func hush_reach(m, at: Vector2) -> float:
	var W: int = m.mgr.map.w
	var far := 0.0
	for i in m.mgr.censor.get("ground", []):
		var tx := int(i) % W
		far = maxf(far, Vector2(tx + 0.5, int(i) / W + 0.5).distance_to(at))
	return maxf(float(HUSH["least"]), minf(float(HUSH["most"]), far + 0.5))


# --- the bars and the lines (censor.ts redactBars, barThrough, pageLines, strikeFrom, strikeLine) ---

static func _bar(x: float, y: float, along: int, long: float) -> Dictionary:
	return {"x": x, "y": y, "along": along, "long": long, "wide": REDACT["wide"]}


## underBar: (x, y) under bar `b` (its middle within `half` of the bar's line, and within its ends).
static func under_bar(b: Dictionary, x: float, y: float, half: float = REDACT["half"]) -> bool:
	var u: float = x - float(b["x"]) if int(b["along"]) == 0 else y - float(b["y"])
	var v: float = y - float(b["y"]) if int(b["along"]) == 0 else x - float(b["x"])
	return absf(u) <= float(b["long"]) / 2.0 + 0.05 and absf(v) <= minf(half, float(b["wide"]) / 2.0 + 0.05)


## redactBars: `n` bars side by side round (cx, cy), `apart` middle to middle, each up to `bar` long, trimmed back to the floor.
static func redact_bars(map, cx: float, cy: float, along: int, n: int = REDACT["n"]) -> Array:
	var floor_at := func(x: float, y: float) -> bool: return map.tile(floori(x), floori(y)) == map.FLOOR
	var out: Array = []
	var ux := 1.0 if along == 0 else 0.0
	var uy := 0.0 if along == 0 else 1.0
	for k in n:
		var off := (k - (n - 1) / 2.0) * float(REDACT["apart"])
		var mx := cx + (0.0 if along == 0 else off)
		var my := cy + (off if along == 0 else 0.0)
		if not floor_at.call(mx, my):
			continue
		var lo := 0.0
		var hi := 0.0
		var s := 0.25
		while s <= float(REDACT["bar"]) / 2.0 + 1e-6:
			if not floor_at.call(mx + ux * s, my + uy * s):
				break
			hi = s
			s += 0.25
		s = 0.25
		while s <= float(REDACT["bar"]) / 2.0 + 1e-6:
			if not floor_at.call(mx - ux * s, my - uy * s):
				break
			lo = s
			s += 0.25
		var long := lo + hi + 0.2
		if long < 1.5:
			continue
		var mid := (hi - lo) / 2.0
		out.append(_bar(mx + ux * mid, my + uy * mid, along, long))
	return out


## barThrough: a bar through (x, y) along `along`, at most `long`, over floor that can be walked on; {} where shorter than `least`.
static func bar_through(map, x: float, y: float, along: int, long: float, least := 1.5, lo := INF, hi := INF) -> Dictionary:
	if lo == INF:
		lo = -long / 2.0
	if hi == INF:
		hi = long / 2.0
	var walk := func(px: float, py: float) -> bool:
		var tx := floori(px)
		var ty := floori(py)
		return tx >= 0 and ty >= 0 and tx < map.w and ty < map.h and map.walk[ty * map.w + tx] == 1
	var ux := 1.0 if along == 0 else 0.0
	var uy := 0.0 if along == 0 else 1.0
	var s0 := maxf(lo, minf(hi, 0.0))
	if not walk.call(x + ux * s0, y + uy * s0):
		return {}
	var a := s0
	var b := s0
	var s := s0 + 0.25
	while s <= hi + 1e-6:
		if not walk.call(x + ux * s, y + uy * s):
			break
		b = s
		s += 0.25
	s = s0 - 0.25
	while s >= lo - 1e-6:
		if not walk.call(x + ux * s, y + uy * s):
			break
		a = s
		s -= 0.25
	var len := b - a + 0.2
	if len < least:
		return {}
	var mid := (a + b) / 2.0
	return _bar(x + ux * mid, y + uy * mid, along, len)


## pageLines: the page struck out round the hero, from his side: lines a tile apart, each with its gap; each line its bars.
static func page_lines(map, h: Vector2, m: Vector2, along: int) -> Array:
	var cx := floorf(h.x) + 0.5
	var cy := floorf(h.y) + 0.5
	var toward: float = signf(h.y - m.y) if along == 0 else signf(h.x - m.x)
	if toward == 0.0:
		toward = 1.0
	var n: int = PAGE["n"]
	var K := (n - 1) / 2.0
	var out: Array = []
	for k in n:
		var off := (k - K) * toward
		var x := cx if along == 0 else cx + off
		var y := cy + off if along == 0 else cy
		var g0 := float(GP_rnd((randf() * 2.0 - 1.0) * float(PAGE["wander"]))) - float(PAGE["gap"]) / 2.0 + 0.5
		var line: Array = []
		var a := bar_through(map, x, y, along, PAGE["long"], 0.6, -float(PAGE["long"]) / 2.0, g0 - 0.1)
		var b := bar_through(map, x, y, along, PAGE["long"], 0.6, g0 + float(PAGE["gap"]) + 0.1, float(PAGE["long"]) / 2.0)
		if not a.is_empty():
			line.append(a)
		if not b.is_empty():
			line.append(b)
		out.append(line)
	return out


static func GP_rnd(v: float) -> int:
	return floori(v + 0.5)


## strikeFrom: where the Strike-Through's line is measured from: on his brush's line, level with him.
static func strike_from(m, hand: int) -> Vector2:
	return beside(m.world, m.face, hand, 0.0, STRIKE["point"].y)


## strikeLine: how far it can go from there along the way he faces: to the first wall, or `most`.
static func strike_reach(m, hand: int) -> float:
	var o := strike_from(m, hand)
	var reach: float = STRIKE["point"].x
	var s: float = STRIKE["point"].x
	while s <= float(STRIKE["most"]) + 1e-6:
		if not is_open(m, o + m.face * s):
			break
		reach = s
		s += 0.1
	return reach


# --- his ink (CENSOR_FIGHT) ---

static func _pool_of(map) -> Dictionary:
	if pool.get("map") != map:
		var on := PackedInt32Array()
		on.resize(map.w * map.h)
		pool = {"map": map, "list": [], "on": on, "n": 0, "hurt": -1e9, "dmg": 0.0}
	return pool


## inked: whether the tile (x, y) is on lies under his ink, laid to stay and not drying.
static func inked(map, x: float, y: float) -> bool:
	var k := _pool_of(map)
	var tx := floori(x)
	var ty := floori(y)
	if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h:
		return false
	return int(k["on"][ty * map.w + tx]) > 0


static func inked_count(map) -> int:
	return int(_pool_of(map)["n"])


## The whole tiles bars cover (their middle lines', on floor that can be walked on).
static func bar_tiles(map, bars: Array) -> PackedInt32Array:
	var seen := {}
	for b in bars:
		var c: float = float(b["x"]) if int(b["along"]) == 0 else float(b["y"])
		var lo := c - float(b["long"]) / 2.0 + 0.15
		var hi := c + float(b["long"]) / 2.0 - 0.15
		for u in range(floori(lo), floori(hi) + 1):
			var tx: int = u if int(b["along"]) == 0 else floori(float(b["x"]))
			var ty: int = floori(float(b["y"])) if int(b["along"]) == 0 else u
			if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h or map.walk[ty * map.w + tx] != 1:
				continue
			seen[ty * map.w + tx] = true
	return PackedInt32Array(seen.keys())


## Its tiles no longer under it (it dries, or is gone).
static func lift_ink(map, p: Dictionary) -> void:
	var k := _pool_of(map)
	if not p.has("tiles"):
		return
	var on: PackedInt32Array = k["on"]
	for i in p["tiles"]:
		if on[i] > 0:
			on[i] -= 1
			if on[i] == 0:
				k["n"] = int(k["n"]) - 1
	k["on"] = on
	p.erase("tiles")
	var list: Array = k["list"]
	for j in list.size():
		if is_same(list[j], p):
			list.remove_at(j)
			break


## It begins to dry away: it hurts no more, and is gone once dried.
static func dry_away(map, p: Dictionary) -> void:
	if int(p.get("lasting", 0)) != 1 or float(p.get("dry", 0.0)) >= 0.0:
		return
	p["dry"] = p["t"]
	lift_ink(map, p)


## THE BARS LAID TO STAY, as they slam: on the tiles they cover; while more of his ground lies under his ink than his share now (the
## more the more of his life is gone), the oldest dries away.
func lay(m, p: Dictionary) -> void:
	var map = m.mgr.map
	var tiles := bar_tiles(map, p["bars"])
	if tiles.is_empty():
		return
	var k := _pool_of(map)
	p["dur"] = 1e18
	p["lasting"] = 1
	p["dry"] = -1.0
	p["tiles"] = tiles
	k["list"].append(p)
	var on: PackedInt32Array = k["on"]
	for i in tiles:
		if on[i] == 0:
			k["n"] = int(k["n"]) + 1
		on[i] += 1
	k["on"] = on
	k["dmg"] = m._roll() * float(FILL["dmg"])
	# (his share: of his ground's floor, `least` at his full life to `most` at his end)
	var mask := _ground(m)
	var room := 0
	for i in mask.size():
		if mask[i] == 1 and map.walk[i] == 1:
			room += 1
	var gone := 1.0 - clamp01(m.life / m.max_life)
	var most := roundi(room * (float(FILL["least"]) + (float(FILL["most"]) - float(FILL["least"])) * gone))
	while int(k["n"]) > most and k["list"].size() > 1 and not is_same(k["list"][0], p):
		dry_away(map, k["list"][0])


## As he dies: all his ink dries away.
static func dry_all(map) -> void:
	var k := _pool_of(map)
	for p in k["list"].duplicate():
		dry_away(map, p)


static func _ink_around(map, x: float, y: float) -> int:
	var n := 0
	for dy in range(-1, 2):
		for dx in range(-1, 2):
			if inked(map, x + dx, y + dy):
				n += 1
	return n


## Where the hero is heading: where he will be `lead` seconds on at his pace, on his ground; INF if he stands, or nowhere to stand.
func _ahead(m) -> Vector2:
	var v := Vector2(float(a1.get("vx", 0.0)), float(a1.get("vy", 0.0)))
	var sp := v.length()
	if sp < 0.8:
		return Vector2.INF
	var k := minf(float(LEAD["lead"]), float(LEAD["most"]) / sp)
	var p: Vector2 = m.mgr.hero.world + v * k
	return p if on_ground(m, p.x, p.y) else Vector2.INF


## Is a bar of his yet to slam (`page`: the page's)?
func _bars_to_come(m, page := false) -> bool:
	for p in m.mgr.perils.list:
		if p.get("kind") == "a1" and p.get("a1") == "censor:bars" and int(p["done"]) == 0 and p.get("src") == m and (not page or int(p["c"]) == 2):
			return true
	return false


## Bars of ink marked out now and slamming down by themselves `wait` seconds after their warning (`c`: 1 his ink, 2 the page's).
func _ink_bars(m, bars: Array, dmg: float, c: int, wait := 0.0) -> void:
	if bars.is_empty():
		return
	var b: Dictionary = bars[0]
	peril(m, "censor:bars", Vector2(b["x"], b["y"]), {"t": -float(REDACT["warn"]) - wait, "hit": 0.0, "dur": REDACT["lie"], "dmg": m._roll() * dmg,
		"a": b["along"], "c": c, "d": 1, "bars": bars})


## A LINE OF INK RUN ACROSS THE ROOM through (x, y) from the wall behind it, along a way of eight (the one it runs furthest along):
## marked out first, then run out as Strike-Through's line is.
func _margin_line(m, at: Vector2) -> void:
	var best := {}
	var first := randi() % 8
	for k in 8:
		var a := float((first + k * 3) % 8) * (PI / 4.0)
		var u := Vector2(roundf(cos(a) * 1e6) / 1e6, roundf(sin(a) * 1e6) / 1e6)
		var back := 0.0
		var s := 0.1
		while s <= 30.0:
			if not is_open(m, at - u * s):
				break
			back = s
			s += 0.1
		var on := 0.0
		s = 0.1
		while s <= 30.0:
			if not is_open(m, at + u * s):
				break
			on = s
			s += 0.1
		if back < 2.0:
			continue
		var reach := minf(back + on, float(STRIKE["most"]) + 14.0)
		if best.is_empty() or reach > float(best["reach"]):
			best = {"o": at - u * back, "u": u, "reach": reach}
		if k >= 2 and float(best["reach"]) >= float(INKF["lineLeast"]) + 4.0:
			break
	if best.is_empty() or float(best["reach"]) < float(INKF["lineLeast"]):
		return
	var u: Vector2 = best["u"]
	peril(m, "censor:margin", best["o"], {"t": -float(INKF["warn"]), "hit": 0.0, "dur": STRIKE["lie"], "dmg": m._roll() * float(INKF["lineDmg"]),
		"a": best["reach"], "b": 0.0, "fx": u.x, "fy": u.y, "hand": 1})


## HIS INK, all the while: a cross of bars where the hero is heading, every third time a line across the room through him.
func _ink(m, dt: float, hero) -> void:
	if not a1.has("iw"):
		a1["iw"] = INKF["every"]
	if not hero.alive:
		return
	if m.state == "act" and act != null and str(ACTS[act["i"]]["id"]) == "censor:redact":
		return
	if _bars_to_come(m, true) or not on_ground(m, hero.world.x, hero.world.y):
		return
	a1["iw"] = float(a1["iw"]) - dt
	if float(a1["iw"]) > 0.0:
		return
	a1["iw"] = float(a1["iw"]) + float(INKF["every"])
	if float(a1["iw"]) < 0.0:
		a1["iw"] = INKF["every"]
	a1["ik"] = int(a1.get("ik", 0)) + 1
	var at := _ahead(m)
	if at == Vector2.INF:
		at = hero.world
	var bars: Array = []
	for along in [0, 1]:
		var b := bar_through(m.mgr.map, floorf(at.x) + 0.5, floorf(at.y) + 0.5, along, INKF["bar"])
		if not b.is_empty():
			bars.append(b)
	_ink_bars(m, bars, INKF["dmg"], 1)
	if int(a1["ik"]) % int(INKF["line"]) == 0:
		_margin_line(m, hero.world)


## Clean floor to walk off to: none of his ink within a tile of it; 3 to 6.5 tiles from him, the nearer the hero the better.
func _clean_spot(m) -> Vector2:
	var map = m.mgr.map
	var h: Vector2 = m.mgr.hero.world
	var r := minf(m.r, 0.42)
	var best := Vector2.INF
	var bs := INF
	var R0 := ceili(float(WALK["far"]))
	for dy in range(-R0, R0 + 1):
		for dx in range(-R0, R0 + 1):
			var p := Vector2(floorf(m.world.x) + dx + 0.5, floorf(m.world.y) + dy + 0.5)
			var d: float = p.distance_to(m.world)
			if d < float(WALK["near"]) or d > float(WALK["far"]) or not on_ground(m, p.x, p.y) or _ink_around(map, p.x, p.y) > 0 or not map.fits(p.x, p.y, r):
				continue
			var clear := true
			var s := 0.25
			while s < d and clear:
				var q: Vector2 = m.world + (p - m.world) * (s / d)
				if not map.fits(q.x, q.y, r):
					clear = false
				s += 0.25
			if not clear:
				continue
			var score := absf(p.distance_to(h) - 2.5) + 0.3 * absf(d - (float(WALK["near"]) + float(WALK["far"])) / 2.0) + randf_range(0.0, 0.6)
			if score < bs:
				bs = score
				best = p
	return best


## HE WALKS OFF TO CLEAN FLOOR, standing in his ink or his big move over: straight there, his walk's frames as far apart on the floor
## as they are painted for. True while he goes (the step is all he does: his cooldowns run on).
func _walk_off(m, dt: float) -> bool:
	if m.state == "act":
		return false
	var map = m.mgr.map
	a1["ww"] = float(a1.get("ww", 0.0)) - dt
	if int(a1.get("wk", 0)) == 0:
		var want: bool = int(a1.get("wo", 0)) == 1 or (float(a1["ww"]) <= 0.0 and _ink_around(map, m.world.x, m.world.y) >= int(WALK["crowd"]))
		if not want or float(a1["ww"]) > 0.0:
			return false
		a1["wo"] = 0
		a1["ww"] = WALK["again"]
		var to := _clean_spot(m)
		if to == Vector2.INF:
			return false
		a1.merge({"wk": 1, "wx": to.x, "wy": to.y, "wt": 0.0, "sn": 0}, true)
	var d: Vector2 = Vector2(a1["wx"], a1["wy"]) - m.world
	var n := d.length()
	a1["wt"] = float(a1["wt"]) + dt
	if n < 0.12 or float(a1["wt"]) > float(WALK["most"]):
		return _stop_walk()
	var sp: float = float(WALK["speed"]) * m.slow()
	m.face = d / n
	var step := minf(n, sp * dt)
	var x0: Vector2 = m.world
	slide(m, m.face * step)
	var moved: float = m.world.distance_to(x0)
	# (held up: he stands, and looks again in a while)
	if moved < step * 0.2:
		return _stop_walk()
	if mode != "walk":
		_to("walk")
	gt += moved / float(GAIT["pace"])
	m.state = "chase"
	for k in cds.size():
		cds[k] -= dt
	return true


func _stop_walk() -> bool:
	a1["wk"] = 0
	a1["ww"] = WALK["again"]
	_to("stand")
	return false


# --- his rules ---

func tick(m, dt: float, _dist: float, hero) -> bool:
	# (the hero's pace, for where he is heading)
	if a1.has("lx") and dt > 0.0:
		var iv: Vector2 = (hero.world - Vector2(a1["lx"], a1["ly"])) / dt
		# (a leap or a warp is not a pace)
		var ok := iv.length() < 12.0
		a1["vx"] = float(a1.get("vx", 0.0)) * 0.75 + (iv.x if ok else 0.0) * 0.25
		a1["vy"] = float(a1.get("vy", 0.0)) * 0.75 + (iv.y if ok else 0.0) * 0.25
	a1["lx"] = hero.world.x
	a1["ly"] = hero.world.y
	_ink(m, dt, hero)
	# (he moves: off his ink to clean floor)
	return _walk_off(m, dt)


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	# (the Hush: not while the hero's words are dark still)
	if a["id"] == "censor:hush":
		return m.mgr.hero.hush_t <= 0.5
	return true


func forced(m) -> int:
	# (Strike-Through in a row: the next straight after, while the hero is in its reach and his sight)
	if int(a1.get("sn", 0)) > 0:
		var hero = m.mgr.hero
		if m.world.distance_to(hero.world) <= float(ACTS[I_STRIKE]["far"]) and m.mgr.sees(m.world, hero.world):
			return I_STRIKE
		a1["sn"] = 0
	return -1


func start(m, a: Dictionary, _hero) -> void:
	match str(a["id"]):
		"censor:strike":
			# (a row begun, or the next of it; the second where the hero is heading)
			if int(a1.get("sn", 0)) == 0:
				a1["sn"] = ROW
				a1["sk"] = 0
			else:
				a1["sk"] = int(a1.get("sk", 0)) + 1
			if int(a1["sk"]) == 1:
				var to := _ahead(m)
				if to != Vector2.INF and to.distance_to(m.world) > 0.5:
					m.face = (to - m.world).normalized()
					act["hand"] = hand_of(GAIT["trueBack"], m.face)
			# (the line he will draw: from his brush's line, the way he faces now, to the first wall)
			act["a"] = strike_reach(m, act["hand"])
			# (its aim marked through its warning: act2/censor_marks.gd)
			peril(m, "censor:aim", strike_from(m, act["hand"]), {"dur": STRIKE["hit"], "a": act["a"]})
			sound(m, "swing", 0.3)
		"censor:redact":
			a1["rp"] = (int(a1.get("rp", 0)) + 1) % 2
			# (by turns, his bars one way (0), both ways at once (1), the page struck out (2))
			a1["rn"] = (int(a1.get("rn", -1)) + 1) % 3
			act["b"] = a1["rn"]
			if int(act["b"]) == 2:
				m.mgr.loot.say("%s strikes out the page" % m.title, FOE)


func acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	match str(a["id"]):
		"censor:slash":
			if crossed(t0, t1, 0.6):
				sound(m, "swing", 0.9)
			if not crossed(t0, t1, a["hit"]):
				return
			# (down and across before him, from his right to his left: whoever the stroke comes down through)
			var r := rel(m, hero)
			var bearing := rad_to_deg(atan2(r.y, r.x))
			if r.x > 0.2 and r.length() <= float(SLASH["reach"]) + HERO_R * 0.5 and bearing >= float(SLASH["from"]) and bearing <= float(SLASH["to"]) and open_to(hero):
				blow(m, hero, a["dmg"])
			peril(m, "censor:slash", m.world, {"dur": SLASH["mark"], "done": 1})
			hero.kick(2.0)
		"censor:strike":
			if not crossed(t0, t1, a["hit"]):
				return
			# THE THRUST: the brush itself strikes whoever is along it; then the line runs out from its point
			var o := strike_from(m, act["hand"])
			var r := from_figure(o, m.face, act["hand"], hero.world)
			var hit: bool = r.x > 0.3 and r.x <= float(STRIKE["point"].x) + 0.15 and absf(r.y) <= float(STRIKE["half"]) + HERO_R * 0.5 and open_to(hero)
			if hit:
				blow(m, hero, a["dmg"])
			peril(m, "censor:line", o, {"dur": STRIKE["lie"], "dmg": m._roll() * float(a["dmg"]), "a": act["a"], "b": STRIKE["point"].x, "done": 1 if hit else 0})
			hero.kick(3.0)
			sound(m, "swing", 1.0)
		"censor:redact":
			# (the bars marked out on the floor from 0.6 s before the slam, about the hero as it begins)
			if crossed(t0, t1, float(a["hit"]) - float(REDACT["warn"])):
				var along := int(a1.get("rp", 0)) % 2
				var cx := floorf(hero.world.x) + 0.5
				var cy := floorf(hero.world.y) + 0.5
				if int(act.get("b", 0)) == 2:
					# THE PAGE STRUCK OUT: every line of it marked out now; its first slams as his brush comes down, the rest one after
					# another after it, by themselves
					var lines := page_lines(m.mgr.map, hero.world, m.world, along)
					for k in lines.size():
						var line: Array = lines[k]
						if line.is_empty():
							continue
						if k == 0:
							_laying = peril(m, "censor:bars", Vector2(line[0]["x"], line[0]["y"]), {"t": -float(REDACT["warn"]), "hit": 0.0, "dur": REDACT["lie"],
								"a": along, "c": 2, "bars": line})
						else:
							_ink_bars(m, line, a["dmg"], 2, k * float(PAGE["apart"]))
				else:
					var bars: Array
					if int(act.get("b", 0)) == 1:
						bars = redact_bars(m.mgr.map, cx, cy, 0) + redact_bars(m.mgr.map, cx, cy, 1)
					else:
						bars = redact_bars(m.mgr.map, cx, cy, along)
					_laying = peril(m, "censor:bars", hero.world, {"t": -float(REDACT["warn"]), "hit": 0.0, "dur": REDACT["lie"], "a": along, "bars": bars})
			var p = _laying
			if p == null or int(p["done"]) != 0:
				return
			# (the bars' clock is his slam's: what is drawn of them keeps time with his picture; the perils' step adds this step after)
			p["t"] = t1 - float(a["hit"]) - dt
			if not crossed(t0, t1, a["hit"]):
				return
			p["done"] = 1
			if open_to(hero):
				for b in p["bars"]:
					if under_bar(b, hero.world.x, hero.world.y):
						blow(m, hero, a["dmg"])
						break
			hero.kick(5.0)
			sound(m, "slam", 1.0)
			lay(m, p)
		"censor:hush":
			if not crossed(t0, t1, a["hit"]):
				return
			# HE LETS THE SILENCE GO: its ring rolls out across the room
			peril(m, "censor:hush", m.world, {"dur": HUSH["veil"], "a": hush_reach(m, m.world)})
			hero.kick(1.0)


func end(m, a: Dictionary, _hero) -> void:
	_laying = null
	# (Strike-Through in a row: the next straight after)
	if a["id"] == "censor:strike":
		a1["sn"] = maxi(0, int(a1.get("sn", 0)) - 1)
		if int(a1["sn"]) > 0:
			m._cd = 0.0
			return
	# (he moves: his big move over, he walks off to clean floor)
	if a["id"] in ["censor:strike", "censor:redact", "censor:hush"]:
		a1["wo"] = 1
		a1["ww"] = 0.0
	# (his rests, and his cooldowns)
	m._cd *= REST
	if a["id"] == "censor:redact":
		cds[I_REDACT] *= REDACT_CD / float(a["cooldown"])
	elif a["id"] == "censor:hush":
		cds[I_HUSH] *= HUSH_CD / float(a["cooldown"])


func died(m) -> void:
	# (what of his is still to come does not; what is laid stays, and dries away)
	for p in m.mgr.perils.list:
		if p.get("kind") != "a1" or not str(p.get("a1", "")).begins_with("censor:") or p.get("src") != m:
			continue
		var t: float = p["t"]
		match str(p["a1"]):
			"censor:bars":
				if int(p["done"]) == 0:
					p["dur"] = minf(float(p["dur"]), t)
			"censor:margin", "censor:line":
				if str(p["a1"]) == "censor:margin" and t < 0.0:
					p["dur"] = t
				else:
					# (a line still running stops where its head is, harming no more, and dries there)
					p["done"] = 1
					p["a"] = minf(float(p["a"]), float(p["b"]) + float(STRIKE["speed"]) * maxf(0.0, t))
			"censor:hush":
				p["done"] = 1
				p["dur"] = minf(float(p["dur"]), t + 0.6)
			"censor:aim":
				p["dur"] = t
	_laying = null
	dry_all(m.mgr.map)
	# THE BOOK OF STOLEN WORDS BURSTS, where it lies on its lectern: the words fly home
	var book = m.mgr.censor.get("book")
	if book is Dictionary:
		peril(m, "censor:book", Vector2(book["x"], book["y"]), {"dur": BOOK_FLY, "done": 1})
		m.mgr.hero.kick(4.0)
		sound(m, "explode", 0.6)
