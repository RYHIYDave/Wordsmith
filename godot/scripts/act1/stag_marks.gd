## WHAT THE HOLLOW STAG MAKES OF THE CLEARING (floor 9's boss, his fight done the action way: act1/stag.gd), drawn as
## render/act1_fx/stag.ts ACTION draws it (art/stag_action_fx.ts). Called from act1/marks.gd for a mark whose name begins "stag:".
##   ON THE FLOOR: his charge's lane (the golem's, art/action_f6_golem.ts lanePainted: act1/marks.gd _lane), laid out from its aim
##     and broken up behind him, at his charge's length and width; his gore's sweep marked while it is held, and its gouges torn
##     along it (paintGoreMark); the new edge marked as the wood closes in, round from the side the hero is on (paintEdgeMark);
##     the torn earth at the foot of each clump of his wall (film `sg_earth_<kind>` of tools/godot_fx.ts).
##   AMONG THE FIGURES: his wall's clumps round the clearing's middle (wallAt), bursting up rippling round, standing, the one
##     inside sinking away, splintered where his charge struck it and growing back (films `sg_clump_<kind>`: the game's own
##     clumps, art/act1_figs/stag.ts clump9Sprite, picked by clump9Frame).
## The two marks that aim any way are painted here as the art paints them, a frame at a time, on picture pixels. Nothing cyan.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const FmPaint := preload("res://scripts/fm_paint.gd")
const SG := preload("res://scripts/act1/stag.gd")

## (art/stag_action_fx.ts PINK; art/mkit.ts FLAME)
const PINK: Array[Color] = [Color("#7a1058"), Color("#e0287a"), Color("#ff7aa8"), Color("#ffd0e0")]
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (art/act1_figs/stag.ts CLUMP9: a clump's frames: bursting up from 0, standing at `stand`, sinking from `sink` (`sinkN` of
## them), splintered and growing back from `broken` (`brokenN`))
const CLUMP9 := {"stand": 16, "sink": 17, "sinkN": 11, "broken": 28, "brokenN": 24}
## (the clumps of the wall round the edge at each share across, as wallAt lays them: made when first wanted)
static var _walls := {}


static func step(P, p: Dictionary, _dt: float) -> bool:
	var src = p.get("src")
	var here: bool = src != null and is_instance_valid(src) and not src.dead
	match str(p["a1"]):
		"stag:gore", "stag:edge":
			# (drawn only, while he makes the move it marks)
			if not here or src.state != "act" or src.h2 == null or src.h2.act == null:
				return false
			var id: String = src.h2.acts()[src.h2.act["i"]]["id"]
			if id != ("stag:gore" if p["a1"] == "stag:gore" else "stag:close"):
				return false
	return float(p["t"]) < float(p["dur"])


# --- among the figures: his wall ---

static func stands(P, p: Dictionary) -> void:
	if p["a1"] != "stag:wall" or P.stands == null or not P.has_film("sg_clump_0"):
		return
	var pool: Array = p.get("fx_pool", [])
	p["fx_pool"] = pool
	var used := 0
	for q in _clumps(p):
		var L: Array = P._fx["films"]["sg_clump_%d" % int(q["kind"])]["layers"]["stand"]
		var pi := int(L[clampi(int(q["i"]), 0, L.size() - 1)])
		if used >= pool.size():
			pool.append(P._film_sprite())
		var at := Vector2(q["x"], q["y"])
		P._film_set(pool[used], pi, at, at.x + at.y)
		used += 1
	for j in range(used, pool.size()):
		pool[j].visible = false


# --- on the floor (in perils.gd _draw) ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	match str(p["a1"]):
		"stag:lane":
			var C: Dictionary = SG.CHARGE9
			if t < float(C["aim"]) or t >= float(C["crash"]):
				return
			var k := minf(1.0, (t - float(C["aim"])) / 0.3)
			var d: float = p["d"]
			var long: float = float(C["lane"]) if d >= SG.CHARGE9_CARRIED - 0.05 else d + 1.5
			var A1M = load("res://scripts/act1/marks.gd")
			A1M._dots(P, at, A1M._lane(Vector2(p["fx"], p["fy"]), k, minf(SG.carry(t), d), long, C["half"]))
		"stag:wall":
			if not P.has_film("sg_earth_0"):
				return
			for q in _clumps(p):
				var w := Vector2(q["x"], q["y"])
				P._film_pic(P, "sg_earth_%d" % int(q["kind"]), "floor", 0, Iso.to_screen(w.x, w.y))
		"stag:gore":
			if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
				return
			var T: float = src.h2.act["t"]
			if T < float(SG.GORE9["hit"]) + 1.2:
				_gore_mark(P, src.world, T, atan2(src.face.y, src.face.x))
		"stag:edge":
			if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
				return
			var T: float = src.h2.act["t"]
			if T > float(SG.CLOSE["hit"]) + 0.05:
				return
			var a1: Dictionary = src.h2.a1
			var stages: Array = SG.CLOSE["stages"]
			var k: float = stages[mini(stages.size() - 1, int(a1.get("stage", 0)) + 1)]
			var h: Vector2 = P.hero.world
			var to := atan2(h.y - at.y, h.x - at.x)
			var from := atan2(sin(to) / float(SG.CLEARING["ry"]), cos(to) / float(SG.CLEARING["rx"]))
			_edge_mark(P, at, k, T, from)


# --- the wall (render/act1_fx/stag.ts clumpsOf; art/stag_action_fx.ts wallAt, wallUp; art/act1_figs/stag.ts clump9Frame) ---

## Each clump of his wall seen now: where, which kind, which frame.
static func _clumps(p: Dictionary) -> Array:
	var out := []
	var t: float = p["t"]
	var since := t - float(p["hit"])
	var W: Dictionary = SG.WALL
	var c: float = p["c"]
	var b: float = p["b"]
	# (the wall now: bursting up rippling round, standing, splintered where his antlers struck it)
	if c > 0.0 and c < 1.0:
		var struck := float(p["fy"]) >= 0.0
		var sp := Vector2(cos(float(p["fx"])) * float(SG.CLEARING["rx"]) * c, sin(float(p["fx"])) * float(SG.CLEARING["ry"]) * c) if struck else Vector2.ZERO
		for q in wall_at(c):
			var s := since - _wall_up(q["a"], p["d"])
			var broken := t - float(p["fy"]) if struck and Vector2(q["x"], q["y"]).distance_to(sp) <= 1.3 else -1.0
			var i := _frame(s, -1.0, broken)
			if i >= 0:
				out.append({"x": float(p["x"]) + float(q["x"]), "y": float(p["y"]) + float(q["y"]), "kind": q["kind"], "i": i})
	# (the one inside it sinking away, once the new one is up)
	if b > 0.0 and b < 1.0:
		var gone := since - (float(W["rise"]) + float(W["ripple"]) + SG.WALL_SINK_AFTER)
		for q in wall_at(b):
			var i := _frame(2.0, maxf(0.0, gone))
			if i >= 0:
				out.append({"x": float(p["x"]) + float(q["x"]), "y": float(p["y"]) + float(q["y"]), "kind": q["kind"], "i": i})
	return out


## wallAt: the clumps of the wall round the edge at `k`, spaced evenly along it: each its floor point (from the middle), its angle
## round the middle, and its kind.
static func wall_at(k: float) -> Array:
	var key := roundi(k * 1000.0)
	if _walls.has(key):
		return _walls[key]
	var N := 720
	var pts: Array[Vector2] = []
	for i in N + 1:
		pts.append(SG.edge(float(i) / N * TAU, k))
	var along: Array[float] = [0.0]
	for i in range(1, N + 1):
		along.append(along[i - 1] + pts[i].distance_to(pts[i - 1]))
	var L := along[N]
	var n := maxi(8, roundi(L / float(SG.WALL["step"])))
	var out := []
	var j := 0
	for c in n:
		var want := float(c) / n * L
		while j < N and along[j + 1] < want:
			j += 1
		var u := (want - along[j]) / maxf(1e-9, along[j + 1] - along[j])
		var a := (j + u) / N * TAU
		var e := SG.edge(a, k)
		out.append({"x": e.x, "y": e.y, "a": a, "kind": floori(FmPaint.hash3(c, roundi(k * 10.0), 811) * int(SG.WALL["kinds"]))})
	_walls[key] = out
	return out


## wallUp: when a clump at angle `a` bursts up, seconds after the blow, the blow's way from the middle being `from` (the nearest
## first, rippling round both ways).
static func _wall_up(a: float, from: float) -> float:
	var d := absf(fposmod(a - from, TAU))
	if d > PI:
		d = TAU - d
	return float(SG.WALL["ripple"]) * d / PI


## clump9Frame: which of a clump's frames is seen: `s` seconds after it burst up, sinking `gone` seconds, splintered `broken`
## seconds since (-1 none).
static func _frame(s: float, gone := -1.0, broken := -1.0) -> int:
	if s < 0.0:
		return -1
	if gone >= 0.0:
		return -1 if gone >= float(SG.WALL["sink"]) else int(CLUMP9["sink"]) + mini(int(CLUMP9["sinkN"]) - 1, floori(gone * 15.0))
	if s < 0.3:
		return floori(s * 30.0)
	if s < 1.0:
		return 9 + mini(6, floori((s - 0.3) * 10.0))
	if broken >= 0.0 and broken < float(SG.WALL["regrow"]):
		return int(CLUMP9["broken"]) + mini(int(CLUMP9["brokenN"]) - 1, floori(broken * 10.0))
	return CLUMP9["stand"]


# --- the marks that aim any way (art/stag_action_fx.ts), whole picture pixels laid on the floor ---

## pen: a whole picture pixel at the floor point `w` (tiles), shifted (dx, dy) picture pixels.
static func _pen(P, w: Vector2, dx: int, dy: int, c: Color) -> void:
	var q := Iso.to_screen(w.x, w.y).round()
	P.draw_rect(Rect2(q.x + dx, q.y + dy, 1.0, 1.0), c)


## beat: a beat that quickens from `a` to `b` (seconds), from three a second to twelve: on or off.
static func _beat(m: float, a: float, b: float) -> bool:
	var k := clampf((m - a) / maxf(1e-6, b - a), 0.0, 1.0)
	var ph := (m - a) * (3.0 + 9.0 * k * k)
	return ph - floorf(ph) < 0.55


## paintEdgeMark: THE NEW EDGE MARKED ON THE FLOOR, `m` seconds into the move that closes the wood (gone as the wall bursts up):
## two dashed lines of the enemy's pink either side of where the wall will stand, chevrons on its inner side pointing in, at the
## edge at `k` of the clearing round `o`; drawn round from the side nearest him (`from`); beating faster as his bellow is held.
static func _edge_mark(P, o: Vector2, k: float, m: float, from: float) -> void:
	var C: Dictionary = SG.CLOSE
	if m < float(C["mark"]) or m > float(C["hit"]) + 0.05:
		return
	var band: float = SG.WALL["band"]
	var laid := SG.smooth((m - float(C["mark"])) / 0.35)
	var on := _beat(m, C["mark"], C["hit"])
	var hot := m > float(C["hit"]) - 0.35
	var N := 900
	for i in N:
		var u := float(i) / N - 0.5
		if absf(u) > laid / 2.0:
			continue
		var e := SG.edge(from + u * TAU, k)
		var r := e.length()
		for j in 2:
			if (i + j * 3) % 9 >= 6:
				continue
			var w := o + e * ((r + (band if j == 0 else -band)) / r)
			_pen(P, w, 0, 0, (PINK[3] if hot else PINK[2]) if on else PINK[1])
			_pen(P, w, 1, 0, PINK[1])
			_pen(P, w, 0, 1, PINK[0])
	# (chevrons inside it, every so far round, pointing in)
	var n := roundi(TAU * Vector2(SG.CLEARING["rx"], SG.CLEARING["ry"]).length() * k / 1.6)
	for c in n:
		var u := float(c) / n - 0.5
		if absf(u) > laid / 2.0:
			continue
		var e := SG.edge(from + u * TAU, k)
		var r := e.length()
		var ux := e / r
		var tx := Vector2(-ux.y, ux.x)
		var d0 := r - band - 0.55
		var s := -1.0
		while s <= 1.0:
			var d := d0 - 0.35 + absf(s) * 0.35
			var w := o + ux * d + tx * (s * 0.42)
			_pen(P, w, 0, 0, PINK[2] if on else PINK[1])
			_pen(P, w, 0, 1, PINK[0])
			s += 0.06


## paintGoreMark: HIS GORE'S SWEEP ON THE FLOOR, `m` seconds into it, him at `B` facing `aim`: the arc before him from GORE9.near to
## GORE9.reach tiles, GORE9.arc degrees across, marked from his head going down (0.1 s) to the blow, beating; at the blow, three
## gouges of his gold torn along it, the pink at their edges, cooling to dark earth.
static func _gore_mark(P, B: Vector2, m: float, aim: float) -> void:
	var G: Dictionary = SG.GORE9
	var half := deg_to_rad(float(G["arc"]) / 2.0)
	var near: float = G["near"]
	var reach: float = G["reach"]
	var hit: float = G["hit"]
	var at := func(r: float, a: float) -> Vector2: return B + Vector2(cos(aim + a), sin(aim + a)) * r
	if m > 0.1 and m < hit:
		var k := SG.smooth((m - 0.1) / 0.2)
		var on := _beat(m, 0.1, hit)
		for i in 161:
			if i % 6 >= 4:
				continue
			var a := -half + 2.0 * half * i / 160.0
			if absf(a) > half * k:
				continue
			for r in [reach, near + 0.25]:
				var w: Vector2 = at.call(r, a)
				_pen(P, w, 0, 0, PINK[2] if on else PINK[1])
				_pen(P, w, 1, 0, PINK[1])
				_pen(P, w, 0, 1, PINK[0])
		for sd in [-1.0, 1.0]:
			var r := near + 0.25
			while r <= reach:
				if not (roundi(r * 20.0) % 6 >= 4 or k < 0.98):
					var w: Vector2 = at.call(r, sd * half)
					_pen(P, w, 0, 0, PINK[2] if on else PINK[1])
					_pen(P, w, 0, 1, PINK[0])
				r += 0.05
		# (inside it, hatched faintly, so that it reads as a place to be out of)
		var i := 0
		while i < 260.0 * k:
			var a := (FmPaint.hash3(i, 1, 891) - 0.5) * 2.0 * half * k
			var r := near + 0.3 + (reach - near - 0.4) * sqrt(FmPaint.hash3(i, 2, 891))
			var w: Vector2 = at.call(r, a)
			var q := Iso.to_screen(w.x, w.y).round()
			if (int(q.x) + int(q.y)) % 2 == 0:
				_pen(P, w, 0, 0, PINK[1] if on else PINK[0])
			i += 1
	var s := m - hit
	if s >= 0.0 and s < 1.2:
		for g in [[0, 1.3], [1, 2.15], [2, 2.85]]:
			for i in 141:
				var a := -half + 2.0 * half * i / 140.0
				if FmPaint.hash3(i, int(g[0]), 893) > 1.0 - s * 0.5:
					continue
				var w: Vector2 = at.call(float(g[1]) + 0.06 * sin(i * 0.7 + int(g[0])), a)
				var c := (FLAME[4] if i % 3 != 0 else FLAME[3]) if s < 0.25 else (FLAME[2] if s < 0.6 else Color("#2a1a14"))
				_pen(P, w, 0, 0, c)
				_pen(P, w, 1, 0, FLAME[2] if s < 0.4 else Color("#1e140e"))
				_pen(P, w, 0, 1, FLAME[1] if s < 0.25 else Color("#160e0a"))


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func spots(_P, _p: Dictionary) -> void:
	pass
