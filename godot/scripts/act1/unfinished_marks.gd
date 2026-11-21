## WHAT THE UNFINISHED (floor 6's boss) LAYS ON THE FLOOR AND SENDS ACROSS IT: perils.gd's marks of kind "a1" named "unfinished:"
## (marks.gd hands them here), stepped as its rules step them (game/act1_rules/unfinished.ts stepPeril) and drawn as
## render/act1_fx/unfinished.ts draws them, in the game's own pictures (films `uf_` of tools/godot_fx.ts: art/unfinished.ts
## hurledBlock, boulderRolling, stompCracks; art/boss_shots.ts drawBallCrash) and the game's warning marks (perils.gd _sweep_ring,
## _aim_line: art/boss_shots.ts drawSweepRing, art/mob_shots.ts drawAimLine; drawSkullShadow, here).
##   unfinished:stomp   its ring of warning round where its foot will come down, while its knee is up (its act's own).
##   unfinished:cracks  the terrace cracked out from under its foot, growing, then lying; fading at the last (1.5 s).
##   unfinished:block   the hurled block: its shadow where it will come down from when it is aimed (`c`: when it is let go;
##                      `a`, `b` where from), faint as it is held up, darker and wider as it falls; tumbling end over end along its
##                      arc; landing (`hit`), the floor cracked there; then lying as cover, a block of the floor (`d`: its tile,
##                      and 1), crumbling at the last.
##   unfinished:lane    a lane of the rockslide (`a`, `b` its start at the cliff's foot, `fx`, `fy` its way, `c` its length): marked
##                      on the floor, its dots running the way the boulder will roll; its boulder dropping in at `hit` and rolling
##                      down it (`d` how far), breaking at its end (`done` 2).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const UFR := preload("res://scripts/act1/unfinished.gd")

## (art/new_mobs3.ts TILE3: a figure's own lengths to a tile)
const TILE3 := 39.191835884530846
## (render/act1_fx/unfinished.ts ROUND: how far round a boulder is rolled a tile; DROP_HIGH: how high it drops in from, game
## pixels; SHADOW_WIDE: the block's shadow as it lands, as wide as what it strikes, game pixels, half)
const ROUND := 2.0 * PI * 24.0 / TILE3
const DROP_HIGH := 40.0
const SHADOW_WIDE := 23.0
## (art/unfinished.ts BLOCK_H[2], BLOCK_FLY_Z: the block's middle as it lies, and the height its flying pictures are hung from,
## in its own lengths; art/boss_shots.ts BALL_CRASH_FOR)
const BLOCK_Z := 23.0
const BLOCK_FLY_Z := 44.0
const CRASH_FOR := 1.4
## (art/palette.ts P.black)
const BLACK := Color("#07050a")


static func step(P, p: Dictionary, dt: float) -> bool:
	var hero = P.hero
	var h: Vector2 = hero.world
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	match str(p["a1"]):
		"unfinished:stomp":
			if src == null or not is_instance_valid(src) or src.dead or src.state != "act" or src.h2.act == null:
				return false
			var a: Dictionary = src.h2.acts()[src.h2.act["i"]]
			if UFR.move_of(a) != "stomp" or float(src.h2.act["t"]) >= float(a["hit"]):
				return false
		"unfinished:block":
			var H: Dictionary = UFR.UF["hurl"]
			if int(p["done"]) == 0 and t >= float(p["hit"]):
				# (it lands: what is under it is struck, and thrown off)
				p["done"] = 1
				var hd := h.distance_to(at)
				if hd <= float(H["r"]) + A1.HERO_R * 0.5 and hero.alive:
					P._hurt(p, p["dmg"], at)
					A1.knock(hero, at, 1.0)
					# (and he is thrown out from under it, as far as the floor lets him)
					var out := float(H["half"]) + A1.HERO_R + 0.15 - hd
					if out > 0.0 and hero._act != "lunge":
						var u: Vector2 = (h - at) / hd if hd > 0.01 else -hero.face
						hero._slide(u * out)
				hero.kick(4.0)
				P.sfx.play("slam", linear_to_db(0.8))
				# (as many as may lie: the oldest crumbles)
				var lying: Array = []
				for q in P.list:
					if q["kind"] == "a1" and q["a1"] == "unfinished:block" and int(q["done"]) != 0 and float(q["dur"]) - float(q["t"]) > float(H["crumble"]):
						lying.append(q)
				if lying.size() > int(H["blocks"]):
					var old: Dictionary = lying[0]
					for q in lying:
						if float(q["t"]) > float(old["t"]):
							old = q
					old["dur"] = float(old["t"]) + float(H["crumble"])
			var map = P.map
			# (lying, it is a block of the floor: once nobody stands where it lies)
			if int(p["done"]) != 0 and int(p["d"]) == 0 and float(p["dur"]) - t > float(H["crumble"]):
				var tx := floori(at.x)
				var ty := floori(at.y)
				if map.walkable(tx, ty) and not _near(h, tx, ty, A1.HERO_R) and not _crowded(src, P, tx, ty):
					map.walk[ty * map.w + tx] = 0
					p["d"] = ty * map.w + tx + 1
			# (crumbling, it is floor again)
			if int(p["d"]) != 0 and float(p["dur"]) - t <= float(H["crumble"]):
				gone(P, p)
		"unfinished:lane":
			var S: Dictionary = UFR.UF["slide"]
			# (the boulder comes down off the cliff, then rolls: harming the hero once if it meets him; breaking where the floor ends,
			# on a wall or on a hurled block)
			if t >= float(p["hit"]) + float(S["drop"]) and int(p["done"]) != 2:
				var map = P.map
				var f := Vector2(p["fx"], p["fy"])
				var was: float = p["d"]
				var roll := minf(dt, t - float(p["hit"]) - float(S["drop"])) * float(S["speed"])
				var steps := maxi(1, ceili(roll / 0.2))
				for s in range(1, steps + 1):
					var d := was + roll * s / steps
					var q := Vector2(p["a"], p["b"]) + f * d
					var ahead := q + f * float(S["r"]) * 0.5
					var blocked: bool = d >= float(p["c"]) or not map.walkable(floori(ahead.x), floori(ahead.y)) or _on_block(P, q, float(S["r"]) + float(UFR.UF["hurl"]["half"]))
					p["x"] = q.x
					p["y"] = q.y
					p["d"] = d
					if blocked:
						p["done"] = 2
						p["hit"] = t
						p["dur"] = t + float(S["burst"])
						P.sfx.play("slam", linear_to_db(0.3))
						hero.kick(1.0)
						break
					if int(p["done"]) == 0 and h.distance_to(q) <= float(S["r"]) + A1.HERO_R * 0.6 and A1.open_to(hero):
						p["done"] = 1
						P._hurt(p, p["dmg"], q)
						A1.knock(hero, q + Vector2(-f.y, f.x) * 0.01, 1.0)
	return float(p["t"]) < float(p["dur"])


## Whether a body `r` round at `w` is over tile (tx, ty) (stepPeril `near`).
static func _near(w: Vector2, tx: int, ty: int, r: float) -> bool:
	return absf(w.x - (tx + 0.5)) < 0.5 + r and absf(w.y - (ty + 0.5)) < 0.5 + r


static func _crowded(src, P, tx: int, ty: int) -> bool:
	var mgr = src.mgr if src != null and is_instance_valid(src) else null
	if mgr == null:
		return false
	for o in mgr.list:
		if is_instance_valid(o) and not o.dead and _near(o.world, tx, ty, minf(o.r, 0.42)):
			return true
	return false


## Whether a hurled block lies within `r` of `q`.
static func _on_block(P, q: Vector2, r: float) -> bool:
	for o in P.list:
		if o["kind"] == "a1" and o["a1"] == "unfinished:block" and int(o["done"]) != 0 and Vector2(o["x"], o["y"]).distance_to(q) < r:
			return true
	return false


## A block lying no more: its tile floor again (it crumbles; or the hero has fallen and what was sent out is gone: perils.gd clear).
static func gone(P, p: Dictionary) -> void:
	if str(p.get("a1", "")) == "unfinished:block" and int(p.get("d", 0)) != 0:
		P.map.walk[int(p["d"]) - 1] = 1
		p["d"] = 0


# --- among the figures ---

static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	match str(p["a1"]):
		"unfinished:block":
			if not P.has_film("uf_block"):
				return
			if int(p["done"]) == 0:
				# (flying from its hands to where it comes down, tumbling end over end: its frames an eighth of a turn each)
				if t < float(p["c"]):
					_hide(p, "fx_stand")
					return
				var k := A1.clamp01((t - float(p["c"])) / maxf(0.01, float(p["hit"]) - float(p["c"])))
				var from := Vector3(float(p["a"]) * TILE3, float(p["b"]) * TILE3, float(UFR.UF["hurl"]["from"][2]) * TILE3)
				var to := Vector3(float(p["x"]) * TILE3, float(p["y"]) * TILE3, BLOCK_Z)
				var q := from.lerp(to, k)
				q.z += 70.0 * sin(PI * k)
				var w := Vector2(q.x, q.y) / TILE3
				P._film_one(p, "fx_stand", P._still("uf_block", "stand", floori((t - float(p["c"])) * 12.0) % 4), w, w.x + w.y, false, (q.z - BLOCK_FLY_Z) / 2.0)
			elif float(p["dur"]) - t > float(UFR.UF["hurl"]["crumble"]) * 0.5:
				# (lying where it fell: cover)
				P._film_one(p, "fx_stand", P._still("uf_block", "stand", 4), Vector2(p["x"], p["y"]), float(p["x"]) + float(p["y"]))
			else:
				_hide(p, "fx_stand")
		"unfinished:lane":
			if t < float(p["hit"]) or int(p["done"]) == 2 or not P.has_film("uf_boulder"):
				_hide(p, "fx_stand")
				return
			# (the boulder dropping off the cliff's foot, then rolling down its lane: painted rolling along the floor's y; along its x,
			# turned over)
			var u := A1.clamp01((t - float(p["hit"])) / float(UFR.UF["slide"]["drop"]))
			var i := floori(float(p["d"]) / ROUND * 8.0) % 8
			P._film_one(p, "fx_stand", P._still("uf_boulder", "stand", i), Vector2(p["x"], p["y"]), float(p["x"]) + float(p["y"]), float(p["fx"]) > 0.5, DROP_HIGH * (1.0 - u) * (1.0 - u))


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


# --- on the floor (in perils.gd _draw) ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	match str(p["a1"]):
		"unfinished:stomp":
			# THE STOMP'S WARNING: a ring round where its foot will come down, as far as it strikes, brightening as it holds its knee up
			if src == null or not is_instance_valid(src) or src.h2.act == null:
				return
			var a: Dictionary = src.h2.acts()[src.h2.act["i"]]
			var S: Dictionary = UFR.UF["stomp"]
			var T: float = src.h2.act["t"]
			var o := A1.beside(src.world, src.face, src.h2.act["hand"], S["at"][0], S["at"][1])
			P._sweep_ring(o.x, o.y, S["r"], A1.clamp01((T - float(S["warnFrom"])) / (float(a["hit"]) - float(S["warnFrom"]) - 0.05)), P._clock)
		"unfinished:cracks":
			# (the terrace cracked out from under its foot, growing, then lying; fading at the last)
			if P.has_film("uf_cracks"):
				_pic(P, P, "uf_cracks", "floor", mini(3, floori(t / 0.06)), at, A1.clamp01((float(p["dur"]) - t) / 1.5))
		"unfinished:block":
			if int(p["done"]) == 0:
				# (its shadow where it will come down: faint as it is held up, darker and wider as it falls)
				var c: float = p["c"]
				var k := 0.12 * A1.clamp01(t / 0.3) if t < c else 0.12 + 0.88 * A1.clamp01((t - c) / maxf(0.01, float(p["hit"]) - c))
				_shadow(P, at, 1.0 - k, 1.0, SHADOW_WIDE)
			elif t - float(p["hit"]) < CRASH_FOR:
				_crash(P, at, t - float(p["hit"]))
			if int(p["done"]) != 0 and float(p["dur"]) - t <= float(UFR.UF["hurl"]["crumble"]):
				_crash(P, at, 0.3 + float(UFR.UF["hurl"]["crumble"]) - (float(p["dur"]) - t))
		"unfinished:lane":
			# (the lane marked on the floor, the way the boulder will roll, till it has gone by; then where it broke)
			if int(p["done"]) != 2:
				var s := Vector2(p["a"], p["b"])
				P._aim_line(s, s + Vector2(p["fx"], p["fy"]) * float(p["c"]), A1.clamp01(t / 0.35), P._clock)
			else:
				_crash(P, at, 0.2 + (t - float(p["hit"])))


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func spots(_P, _p: Dictionary) -> void:
	pass


## A picture of a film's layer drawn with its floor point at `at` (tiles) on `c`, as faded as `alpha`.
static func _pic(P, c: CanvasItem, name: String, layer: String, i: int, at: Vector2, alpha := 1.0) -> void:
	var L: Array = P._fx["films"][name]["layers"].get(layer, [])
	if i < 0 or i >= L.size() or int(L[i]) < 0 or alpha <= 0.0:
		return
	var q: Array = P._fx["pics"][int(L[i])]
	var o := Iso.to_screen(at.x, at.y)
	c.draw_texture_rect_region(P._sheet(int(q[0])), Rect2(o + Vector2(q[5], q[6]), Vector2(q[3], q[4])), Rect2(q[1], q[2], q[3], q[4]), Color(1, 1, 1, alpha))


## WHERE THE BLOCK COMES DOWN, AND WHERE A BOULDER BREAKS (art/boss_shots.ts drawBallCrash, the game's own film), `t` seconds after.
static func _crash(P, at: Vector2, t: float) -> void:
	if t < 0.0 or t >= CRASH_FOR or not P.has_film("uf_crash"):
		return
	P._film_floor("uf_crash", t, at)


## (art/mob_shots.ts drawSkullShadow) A shadow on the floor at `at` under something `z` of `top` up, wider as it comes down (its half
## width `widest` game pixels as it lands).
static func _shadow(P, at: Vector2, z: float, top: float, widest: float) -> void:
	var near := 1.0 - A1.clamp01(z / maxf(1e-6, top))
	var rx := 3.0 + (widest - 3.0) * near
	var o := (Iso.to_screen(at.x, at.y) / 2.0).round() * 2.0
	var pts := PackedVector2Array()
	for i in 32:
		var ang := float(i) / 32.0 * TAU
		pts.append(o + Vector2(cos(ang) * rx, sin(ang) * rx / 2.0) * 2.0)
	P.draw_colored_polygon(pts, Color(BLACK, 0.25 + 0.5 * near))
