## WHAT THE CANTOR LAYS ON THE FLOOR AND SENDS ACROSS IT (floor 8's boss: act1/cantor.gd), stepped as his rules step it
## (game/act1_rules/cantor.ts `peril`) and drawn as render/act1_fx/cantor.ts draws it: only what his own pictures do not paint
## (his baked figure paints his bell's rings and cracks, his shout's waves, his copies as they tear away, his six rocks and their
## shadows). Called from act1/marks.gd for a mark whose name begins "cantor:".
##   ON THE FLOOR: the echo's spot glowing after his strike, until its echo comes (the bosses' warning ring: art/boss_shots.ts
##     drawSweepRing, perils.gd _sweep_ring); his shout's reach marked as he swells, and where its wave will come back from
##     (drawReach); the rocks his voice shakes loose, in floor 8's own rockfall's pictures (art/floor8.ts: its warning shadow,
##     the rock come down, the rubble; film `cn_rock` of tools/godot_fx.ts), its shadow darkening as it comes (drawBallShadow);
##     and his copies' doings, which no picture of theirs paints: the rings of their bell on the rock, their shout's waves, their
##     ringing out as they go (drawSound).
##   AMONG THE FIGURES: his copies, as figures of their own once torn away from him (his baked figure's lists `echoCopies`,
##     `echoAttack`, `echoShout`, `echoRockfall`: the art chat's cantorEchoPainted, see-through, in the cult's pink).
## Every colour is the cult's: the bosses' warning's fire, and his sound's own pinks (art/cantor.ts SOUND). Never cyan.
## (Painters that draw on the game's canvas lay game pixels: here each is two picture pixels square.)
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const CN := preload("res://scripts/act1/cantor.gd")

## (art/mkit.ts FLAME: the bosses' warning's fire; art/cantor.ts SOUND: FLAME[1], SOCKET, PINK[3]; art/palette.ts P.black)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const SOUND: Array[Color] = [Color("#c0206a"), Color("#ff4f8a"), Color("#ff7aa8")]
const BLACK := Color("#07050a")


## A step of one (its clock has run on already); false: it is gone.
static func step(P, p: Dictionary, dt: float) -> bool:
	var hero = P.hero
	var h: Vector2 = hero.world
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	var here: bool = src != null and is_instance_valid(src) and not src.dead
	match str(p["a1"]):
		"cantor:sing":
			# (drawn only, while he makes the move it warns of)
			if not here or src.state != "act" or src.h2 == null or src.h2.act == null:
				return false
			var id: String = src.h2.acts()[src.h2.act["i"]]["id"]
			return id == ("cantor:strike" if int(p["a"]) == 0 else "cantor:shout")
		"cantor:rock":
			if int(p["done"]) == 0 and t >= float(p["hit"]):
				# (one of floor 8's rockfall's, on its tile; one of his picture's, round where it lands)
				p["done"] = 1
				var r: float = CN.ROCKFALL["heroR"]
				var under := absf(h.x - at.x) <= r and absf(h.y - at.y) <= r if int(p["a"]) == 1 else h.distance_to(at) <= float(CN.ROCKFALL["r"])
				if under and hero.alive:
					var was: float = hero.life
					P._hurt(p, p["dmg"], at)
					if hero.life < was:
						CN.knock(hero, at, 0.5)
				hero.kick(2.0)
				P.sfx.play("slam", linear_to_db(0.35))
		"cantor:copy":
			_copy_step(P, p, dt)
	return float(p["t"]) < float(p["dur"])


## ONE OF HIS COPIES: its end of his move (its tail, `d` long), then his last move, on a clock of its own.
static func _copy_step(P, p: Dictionary, dt: float) -> void:
	var hero = P.hero
	if int(p["done"]) & CN.FADING:
		return
	var T1: float = float(p["t"]) - float(p["d"])
	if T1 < 0.0:
		return
	var which := int(p["a"])
	var move: Dictionary = CN.ECHO_MOVES[which]
	var at := Vector2(p["x"], p["y"])
	if not (int(p["done"]) & CN.BEGUN):
		# (its tail played out: it turns to the hero, and begins)
		p["done"] = int(p["done"]) | CN.BEGUN
		var to: Vector2 = hero.world - at
		if to.length() > 0.01:
			p["fx"] = to.normalized().x
			p["fy"] = to.normalized().y
		p["hand"] = CN.hand_of(true, Vector2(p["fx"], p["fy"]))
		P.sfx.play("echo", linear_to_db(0.4))
	var T0 := maxf(0.0, T1 - dt)
	if T0 >= float(move["long"]):
		# (its move made: it rings out)
		p["done"] = int(p["done"]) | CN.FADING
		return
	var s := CN.singer(at, Vector2(p["fx"], p["fy"]), int(p["hand"]))
	if which == 2:
		# (its rockfall: the six round it, drawn with floor 8's rockfall's pictures)
		if CN.crossed(T0, T1, CN.ROCKFALL["sing"]):
			CN.rocks_round(P, p.get("src"), p.get("by", {}), s, p["dmg"], false)
		return
	var hurt := func(mult: float, from: Vector2) -> bool:
		var was: float = hero.life
		P._hurt(p, float(p["dmg"]) * mult, from)
		return hero.life < was
	var seen := {"v": int(p["done"]) & 3}
	CN.sing(P, hero, which, s, T0, minf(float(move["long"]), T1), seen, hurt, true)
	p["done"] = (int(p["done"]) & ~3) | int(seen["v"])


# --- among the figures ---

## One of his copies seen now: its picture, among his (the end of his move, a beat behind him; then his last move).
static func stands(P, p: Dictionary) -> void:
	if p["a1"] != "cantor:copy" or P.stands == null:
		return
	var s = p.get("fx_stand")
	var fig = p.get("fig")
	if int(p["done"]) & CN.FADING or fig == null:
		if s != null and is_instance_valid(s):
			s.visible = false
		return
	var T: float = float(p["t"]) - float(p["d"])
	var move: Dictionary = CN.ECHO_MOVES[int(p["a"])]
	var list: String = "echoCopies" if T < 0.0 else str(move["clip"])
	if not fig.has(list):
		return
	var secs: float = float(p["b"]) + float(p["t"]) - CN.ECHO_FROM if T < 0.0 else minf(T, float(move["long"]))
	var i := clampi(floori(maxf(0.0, secs) * CN.ECHO_FPS + 1e-6), 0, fig.count(0, list) - 1)
	if s == null or not is_instance_valid(s):
		s = Sprite2D.new()
		s.centered = false
		P.stands.add_child(s)
		p["fx_stand"] = s
	var f: Dictionary = fig.frame(float(p["fx"]), float(p["fy"]), list, i)
	s.visible = true
	s.texture = f["tex"]
	s.flip_h = f["flip"]
	s.scale = Vector2.ONE * float(f["scale"])
	s.position = Iso.to_screen(p["x"], p["y"])
	s.offset = f["offset"]


# --- on the floor (in perils.gd _draw) ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"cantor:sing":
			# HIM, as he makes a move
			var src = p.get("src")
			if src == null or not is_instance_valid(src) or src.h2 == null or src.h2.act == null:
				return
			var a: Dictionary = src.h2.act
			_warnings(P, int(p["a"]), CN.singer(src.world, src.face, int(a["hand"])), float(a["t"]), false)
		"cantor:rock":
			# (his own six are his picture's; those his voice shakes loose, and his copies', are floor 8's rockfall's)
			if int(p["a"]) != 1 or not P.has_film("cn_rock"):
				return
			var T: float = t - float(p["hit"])
			if T < -0.8:
				return
			var alpha := clampf((float(p["dur"]) - t) / 0.5, 0.0, 1.0) if T >= 0.35 else 1.0
			_still(P, "cn_rock", 1 if T < 0.0 else (2 if T < 0.35 else 3), Iso.to_screen(floorf(at.x), floorf(at.y)), alpha)
			# (and, as his own rocks have, its shadow darkening as it comes: the bosses' falling ball's)
			if T < 0.0:
				_ball_shadow(P, at, clampf(1.0 + T / 0.8, 0.0, 1.0))
		"cantor:copy":
			var s := CN.singer(at, Vector2(p["fx"], p["fy"]), int(p["hand"]))
			var T: float = t - float(p["d"])
			# (ringing out as it goes)
			var fade: float = float(p["dur"]) - float(CN.COPIES["fade"])
			if t >= fade:
				var u: float = (t - fade) / float(CN.COPIES["fade"])
				_sound(P, at, 0.2 + 1.1 * u, u, Vector2.ZERO, 0.0, 31 + int(p["c"]))
				return
			if T >= 0.0 and int(p["a"]) < 2:
				_warnings(P, int(p["a"]), s, T, true)


## What one who sings warns of and leaves, `T` seconds into one of the moves that strike (0 his strike, 1 his shout); `copy`: a
## copy's, whose picture paints none of it.
static func _warnings(P, which: int, s: Dictionary, T: float, copy: bool) -> void:
	if which == 0:
		var S: Dictionary = CN.STRIKE
		var p := CN.strike_spot(s)
		# (a copy's held overhead: where its bell will come down)
		if copy and T >= 0.45 and T < 1.0:
			P._sweep_ring(p.x, p.y, S["echoR"], clampf((T - 0.45) / 0.45, 0.0, 1.0), P._clock)
		# (its echo's spot glowing, until the echo comes)
		if T >= 1.0 + float(S["glow"]) and T < 1.0 + float(S["echo"]):
			P._sweep_ring(p.x, p.y, S["echoR"], clampf((T - 1.0 - float(S["glow"])) / (float(S["echo"]) - float(S["glow"]) - 0.05), 0.0, 1.0), P._clock)
		if copy:
			# (its bell on the rock, and its echo after)
			for q in [[1.0, 1], [1.0 + float(S["echo"]), 2]]:
				var u: float = (T - float(q[0])) / 0.5
				if u >= 0.0 and u < 1.0:
					_sound(P, p, 0.15 + (1.6 if int(q[1]) == 1 else 1.1) * (1.0 - (1.0 - u) * (1.0 - u)), u, Vector2.ZERO, 0.0, 11 + int(q[1]))
		return
	var H: Dictionary = CN.SHOUT
	var o := CN.shout_from(s)
	var f: Vector2 = s["f"]
	if T >= float(H["warnFrom"]) and T < 1.0:
		_reach(P, o, f, H["r0"], float(H["r0"]) + float(H["reach"]), H["half"], clampf((T - float(H["warnFrom"])) / (1.0 - float(H["warnFrom"]) - 0.08), 0.0, 1.0))
	# (and where it will come back from: beyond the hero, off the far wall)
	if T >= 1.0 and T < float(H["back"]):
		_reach(P, o, f, float(H["r0"]) + float(H["reach"]), float(H["r0Back"]) + float(H["reach"]), H["halfBack"], 0.35 + 0.5 * clampf((T - 1.0) / (float(H["back"]) - 1.0), 0.0, 1.0))
	if copy:
		var r1 := CN.shout_out(T)
		if r1 >= 0.0:
			_sound(P, o, r1, (T - 1.0) / float(H["out"]), f, H["half"], 21)
		var r2 := CN.shout_back(T)
		if r2 >= 0.0:
			_sound(P, o, r2, (T - float(H["back"])) / float(H["out"]), f, H["halfBack"], 23)


## A pixel of the game's, rounded, in a colour (two picture pixels square; `w` game pixels across).
static func _dot(P, x: float, y: float, c: Color, alpha: float, w := 1) -> void:
	P.draw_rect(Rect2(roundf(x) * 2.0, roundf(y) * 2.0, 2.0 * w, 2.0 * w), Color(c, alpha))


## A place on the floor as the game's canvas has it (game pixels).
static func _gp(w: Vector2) -> Vector2:
	return Iso.to_screen(w.x, w.y) / 2.0


## drawReach: HOW FAR HIS SHOUT WILL ROLL, as he swells (`k` 0 to 1): its far edge on the floor, `r` tiles from `c` and `half`
## radians to either side of `f`, and its two sides, in the bosses' warning's fire, a light running along its edge.
static func _reach(P, c: Vector2, f: Vector2, r0: float, r: float, half: float, k: float) -> void:
	if k <= 0.0:
		return
	var base := atan2(f.y, f.x)
	var n := maxi(24, roundi(r * half * 2.0 * 12.0))
	var run := fmod(P._clock * 1.3, 1.0)
	for i in n + 1:
		var a := base - half + 2.0 * half * i / n
		var q := _gp(c + Vector2(cos(a), sin(a)) * r)
		var lead := 1.0 - fposmod(float(i) / n - run, 1.0)
		var hot := (lead - 0.85) / 0.15 if lead > 0.85 else 0.0
		var al := minf(1.0, 0.2 + 0.6 * k + 0.4 * hot)
		_dot(P, q.x, q.y, FLAME[3] if hot > 0.5 else FLAME[2], al)
		if i % 2 == 0:
			_dot(P, q.x, q.y + 1.0, FLAME[0], al)
	for sd in [-1.0, 1.0]:
		var a := base + float(sd) * half
		var d := r0
		while d <= r:
			var q := _gp(c + Vector2(cos(a), sin(a)) * d)
			_dot(P, q.x, q.y, FLAME[1], 0.15 + 0.45 * k)
			d += 0.18


## drawSound: A RING OF HIS SOUND ON THE FLOOR (a copy's bell on the rock, its shout's wave, its ringing out): `r` tiles round
## `c`, all round (`way` zero) or `half` to either side of `way`, thinning as `u` goes from 0 to 1.
static func _sound(P, c: Vector2, r: float, u: float, way: Vector2, half: float, seed: int) -> void:
	if u < 0.0 or u >= 1.0 or r <= 0.02:
		return
	var round_all := way == Vector2.ZERO
	var base := 0.0 if round_all else atan2(way.y, way.x)
	var span := TAU if round_all else 2.0 * half
	var n := maxi(12, mini(260, roundi(r * span * 14.0)))
	for row in (1 if round_all else 3):
		var rr := r - row * 0.1
		if rr <= 0.02:
			continue
		for i in n:
			var hh := fmod(absf(sin(i * 12.9898 + seed * 78.233 + row * 3.1) * 43758.5453), 1.0)
			if hh < u * 0.8:
				continue
			var a := base - span / 2.0 + span * (i + 0.5) / n
			var q := _gp(c + Vector2(cos(a), sin(a)) * rr)
			var col := SOUND[0] if row > 1 else (SOUND[1] if row > 0 else (SOUND[2] if hh > 0.85 else SOUND[1]))
			_dot(P, q.x, q.y, col, 1.0 - u * 0.5, 2 if u < 0.35 and row == 0 else 1)


## drawBallShadow: a shadow on the floor under what is coming down at `at`, darker and bigger as it comes (`k`).
static func _ball_shadow(P, at: Vector2, k: float) -> void:
	var s := _gp(at).round()
	var rx := 3.0 + 6.0 * k
	var pts := PackedVector2Array()
	for i in 24:
		var a := TAU * i / 24.0
		pts.append((s + Vector2(cos(a) * rx, sin(a) * rx / 2.0)) * 2.0)
	P.draw_colored_polygon(pts, Color(BLACK, 0.2 + 0.55 * k))


## A still of one of the films (its floor layer's `i`th picture) drawn with its floor point at `scr` (picture pixels), see-through
## by `alpha`.
static func _still(P, name: String, i: int, scr: Vector2, alpha: float) -> void:
	var L: Array = P._fx["films"][name]["layers"].get("floor", [])
	if i < 0 or i >= L.size() or int(L[i]) < 0:
		return
	var q: Array = P._fx["pics"][int(L[i])]
	P.draw_texture_rect_region(P._sheet(int(q[0])), Rect2(scr + Vector2(q[5], q[6]), Vector2(q[3], q[4])), Rect2(q[1], q[2], q[3], q[4]), Color(1, 1, 1, alpha))


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func spots(_P, _p: Dictionary) -> void:
	pass


## (none of his lies on the floor as its own: nothing to undo when one is taken away before its time)
static func gone(_P, _p: Dictionary) -> void:
	pass
