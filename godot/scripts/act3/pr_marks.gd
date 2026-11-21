## WHAT THE PRINCESS (FLOOR 16'S BOSS) LAYS ON THE FLOOR AND SENDS OVER IT: perils.gd's marks of kind "a1" (marks.gd hands them here
## by the first word of their names), stepped as her rules step them (game/act1_rules/princess.ts peril, floorBlow) and drawn as
## render/act1_fx/princess.ts draws them, with the art chat's own pictures of her things (art/act1_figs/princess.ts, princess_fx.ts,
## garden_swans.ts: tools/godot_fx.ts, the films pr_*):
##   princess:warn    through her lash's warning, the wedge it will sweep dotted in the enemy's pink, the edge the vine comes from the
##                    brightest; through a leap of her steed, where its forehooves will come down, ringed (drawSweepRing): round her
##                    arena from the leap's start, at the hero from its spring. Read from her act each frame; gone with it.
##   princess:swans   her garden's swans circling her always (the art's `fly`; more each phase), out over her steed while she rides.
##   princess:snare   ringed where it will burst from the end of her warning; the cage bursting up, held, shaken by each blow, worn
##                    down a stage at a time, bursting apart, or withering (in two halves, behind whoever is inside it and before
##                    him); its life, a bar under it. Whoever is inside as it bursts struck and HELD IN; every blow of his that
##                    reaches it takes one of its three (no more than one in 0.2 s), and at the last it bursts apart.
##   princess:eleven  the lines of fallen feathers, scattered as their swans pass (the art's featherLine); the swans diving along them
##                    (the art's `dive`): whoever is on a line as its swan passes, struck.
##   princess:vow     her ring of silence round her, going with her (the art's vowPainted): his words dark while he stands in it.
##   princess:fall    as she falls: her swans flying off over the wall, and her one whisper over her.
## Nothing cyan: the enemy's pink and red, the Hush's grey, swan white.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const PR := preload("res://scripts/act3/princess.gd")

## (art/mkit.ts FLAME)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const HUSHED := Color("#9890b4")
## (art/palette.ts ink, bl1, bl4)
const INK := Color("#120d18")
const BL1 := Color("#3a0a12")
const BL4 := Color("#e03c44")
## (art/new_mobs3.ts TILE3: the art's units a tile)
const TILE3 := 32.0 / 0.816496580927726
## (render/act1_fx/princess.ts CIRCLE: her swans' round, seconds; how far out, tiles; a little further for each past three; out over
## her steed; how high, game pixels; their bob)
const CIRCLE := {"round": 3.4, "r": 50.0 / TILE3, "more": 0.15, "r_ride": 2.1, "high": 33.0, "high_ride": 52.0, "bob": 3.0}
const FLY_OFF := 2.8
## (art/act1_figs/princess.ts SWAN_FRAMES, SNARE_FRAMES, VOW_FRAMES; art/princess_fx.ts SNARE_FX, VOW_FX)
const SWAN_FPS := 20.0
const SNARE_F := {"rise": 4, "hold": 10, "from": 0.2, "loop": PI / 2.0, "struck": [0.03, 0.09], "wither": 6, "breaks": 14, "fps": 10.0, "break_fps": 15.0, "stages": 3}
const SNARE_FX := {"burst": [0.1, 0.1667], "sink": [6.0, 6.6], "hit": 0.14}
const VOW_F := {"burst": 2, "hold": 16, "from": 0.1, "loop": TAU / 3.0, "fade": 6, "fps": 10.0}
const VOW_FX := {"hold": 3.0, "fade": 0.6}


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _alive(src) -> bool:
	return src != null and is_instance_valid(src) and not src.dead


## (the act a warning is of, still being made)
static func _acting(src, p: Dictionary) -> bool:
	return _alive(src) and src.state == "act" and src.h2 != null and src.h2.act != null and is_same(src.h2.act, p["act"])


# --- her things' frames (art/act1_figs/princess.ts snareFrameAt, vowFrameAt) ---

## Which frame of the snare shows it `t` seconds after her blow, as much of it left as `hp` (1 to 0), struck `hit_ago` seconds ago
## (-1: not lately), broken `broken_ago` seconds ago (-1: not broken); -1 before it has begun to heave.
static func snare_frame(t: float, hp: float, hit_ago: float, broken_ago: float) -> int:
	var F := SNARE_F
	var per: int = int(F["hold"]) + 2 + int(F["wither"])
	var base: int = F["rise"]
	if broken_ago >= 0.0:
		return base + int(F["stages"]) * per + mini(int(F["breaks"]) - 1, maxi(0, floori(broken_ago * float(F["break_fps"]))))
	if t < 0.0:
		return -1
	var b: Array = SNARE_FX["burst"]
	if t < float(b[1]) - 1e-6:
		return 0 if t < 0.05 else (1 if t < float(b[0]) else (2 if t < (float(b[0]) + float(b[1])) / 2.0 else 3))
	var k := clampi(roundi((1.0 - hp) * int(F["stages"])), 0, int(F["stages"]) - 1)
	var at := base + k * per
	var sink: float = SNARE_FX["sink"][0]
	if t >= sink:
		return at + int(F["hold"]) + 2 + mini(int(F["wither"]) - 1, floori((t - sink) * float(F["fps"])))
	if hit_ago >= 0.0 and hit_ago < float(SNARE_FX["hit"]):
		return at + int(F["hold"]) + (0 if hit_ago < (float(F["struck"][0]) + float(F["struck"][1])) / 2.0 else 1)
	var lp: float = F["loop"]
	var u := fposmod(t - float(F["from"]), lp)
	return at + mini(int(F["hold"]) - 1, floori(u / lp * int(F["hold"])))


## Which frame of the Vow shows it `t` seconds after her blow (-1 before, and once thinned away).
static func vow_frame(t: float) -> int:
	var F := VOW_F
	var hold: float = VOW_FX["hold"]
	if t < 0.0 or t >= hold + float(VOW_FX["fade"]):
		return -1
	if t < float(F["from"]):
		return 0 if t < 0.05 else 1
	if t < hold:
		var u := fmod(t - float(F["from"]), float(F["loop"]))
		return int(F["burst"]) + mini(int(F["hold"]) - 1, floori(u / float(F["loop"]) * int(F["hold"])))
	return int(F["burst"]) + int(F["hold"]) + mini(int(F["fade"]) - 1, floori((t - hold) * float(F["fps"])))


## snareLook: how much of it is left, since when it was struck, since when broken (-1: not), and its clock (from its withering).
static func snare_look(p: Dictionary) -> Dictionary:
	var t: float = p["t"]
	var w: float = p["wither"]
	var tt := float(SNARE_FX["sink"][0]) + (t - w) if w >= 0.0 else t
	var life: int = int(SNARE_F["stages"])
	if float(p["broken"]) >= 0.0:
		return {"hp": (float(p["life"]) + 1.0) / life, "hit": -1.0, "broken": t - float(p["broken"]), "t": tt}
	var s: float = p["struck"]
	return {"hp": float(p["life"]) / life, "hit": t - s if s >= 0.0 and t - s < float(SNARE_FX["hit"]) else -1.0, "broken": -1.0, "t": tt}


# --- the step ---

static func step(P, p: Dictionary, dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	var hero = P.hero
	match str(p["a1"]):
		"princess:warn":
			if not _acting(src, p):
				p["dur"] = t
		"princess:swans":
			if _alive(src):
				p["x"] = src.world.x
				p["y"] = src.world.y
			else:
				p["dur"] = t
		"princess:snare":
			_snare(P, p, dt)
		"princess:eleven":
			_eleven(P, p, dt)
		"princess:vow":
			# (it goes with her)
			if _alive(src):
				p["x"] = src.world.x
				p["y"] = src.world.y
			if int(p["done"]) == 0 and t < float(PR.VOW["hold"]) and hero.alive:
				# HIS WORDS DARK while he stands in it
				if hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(PR.VOW["r"]):
					if hero.hush_t <= 0.0 and _alive(src):
						A1.word(src, hero, "Hushed", HUSHED)
					hero.hush(PR.VOW["dark"])
		"princess:fall":
			# AS SHE FALLS: her one whisper
			if int(p["done"]) & 1 == 0 and t >= float(PR.DIES["sink"]):
				p["done"] = int(p["done"]) | 1
				if src != null and is_instance_valid(src):
					src.say(PR.WHISPER, PR.DIES["say"], PR.DIES["lift"], true)
	return t < float(p["dur"])


static func _snare(P, p: Dictionary, dt: float) -> void:
	var t: float = p["t"]
	var hero = P.hero
	# (withering as she died: let go)
	if float(p["wither"]) >= 0.0:
		p["held"] = false
		return
	var b0: float = SNARE_FX["burst"][0]
	# THE BURST: whoever is inside its ring is struck by its thorns, and held in
	if t - dt < b0 and t >= b0 and float(p["broken"]) < 0.0:
		if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(PR.SNARE["r"]):
			p["held"] = true
			if A1.open_to(hero):
				P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
		hero.kick(2.0)
		P.sfx.play("slam", linear_to_db(0.35))
	# (left alone, it withers and lets him go)
	if t >= float(SNARE_FX["sink"][0]):
		p["held"] = false
	if p["held"] and hero.alive:
		_hold_in(hero, p)


## Keep the hero inside a cage that holds him: his walk, and his leap's ends, all kept within its ring.
static func _hold_in(hero, p: Dictionary) -> void:
	var c := Vector2(p["x"], p["y"])
	var most: float = float(PR.SNARE["r"]) - float(PR.SNARE["inside"])
	var inside := func(q: Vector2) -> Vector2:
		var d := q.distance_to(c)
		return q if d <= most else c + (q - c) * (most / d)
	var at: Vector2 = inside.call(hero.world)
	if at != hero.world:
		# (back inside, onto floor he may stand on)
		if hero._clear(at.x, at.y):
			hero.world = at
		else:
			hero.world = c + (at - c) * 0.9
	if hero._act == "lunge" and hero._lunge is Dictionary and not hero._lunge.is_empty():
		hero._lunge["to"] = inside.call(hero._lunge["to"])
		hero._lunge["from"] = inside.call(hero._lunge["from"])


static func _eleven(P, p: Dictionary, dt: float) -> void:
	var t: float = p["t"]
	if t < 0.0 or int(p["done"]) & 2 != 0:
		return
	var hero = P.hero
	if not hero.alive:
		return
	var sp: float = PR.ELEVEN["speed"]
	# (where the hero is from the lines: along them, and across)
	var d: Vector2 = hero.world - Vector2(p["x"], p["y"])
	var uh: float = d.x * float(p["fx"]) + d.y * float(p["fy"])
	var vh: float = d.x * -float(p["fy"]) + d.y * float(p["fx"])
	for l in p["lines"]:
		if l["done"] or t < float(l["go"]):
			continue
		var a := float(l["u0"]) + sp * maxf(0.0, t - dt - float(l["go"]))
		var b := float(l["u0"]) + sp * (t - float(l["go"]))
		if a > float(l["u1"]):
			l["done"] = true
			continue
		if absf(vh - float(l["v"])) > float(PR.ELEVEN["half"]) or uh < float(l["u0"]) - 0.3 or uh > float(l["u1"]) + 0.3:
			continue
		if uh < a - 0.35 or uh > b + 0.35 or not A1.open_to(hero):
			continue
		var was: float = hero.life
		P._hurt(p, p["dmg"], hero.world)
		if hero.life < was:
			l["done"] = true


## THE CAGE STRUCK (game.ts breakProps, princess.ts floorBlow): every blow of the hero's that reaches it takes a blow of its life (one
## in `gap` seconds at most); at the last it bursts apart and lets him go.
static func floor_blow(P, p: Dictionary, at: Vector2, rad: float) -> void:
	if str(p.get("a1", "")) != "princess:snare":
		return
	var t: float = p["t"]
	if float(p["broken"]) >= 0.0 or float(p["wither"]) >= 0.0 or t < float(SNARE_FX["burst"][1]) or t >= float(SNARE_FX["sink"][0]):
		return
	var c := Vector2(p["x"], p["y"])
	if at.distance_to(c) > float(PR.SNARE["r"]) + rad:
		return
	if float(p["struck"]) >= 0.0 and t - float(p["struck"]) < float(PR.SNARE["gap"]):
		return
	p["struck"] = t
	p["life"] = int(p["life"]) - 1
	var sp := at + (c - at) * 0.3
	P.hero._tell({"t": "spark", "x": sp.x, "y": sp.y, "el": "phys", "n": 6})
	P.sfx.play("hit", linear_to_db(0.4))
	if int(p["life"]) <= 0:
		# DESTROYED: it bursts apart, and lets him go
		p["life"] = 0
		p["broken"] = t
		p["held"] = false
		p["dur"] = t + float(PR.SNARE["breaks"])
		P.hero.kick(2.0)


# --- among what stands ---

static func _swan(P, which: String, f: Vector2, i: int) -> Array:
	var view := "back" if f.x + f.y < -0.2 else "front"
	var name := "pr_%s_%s" % [which, view]
	if not P.has_film(name):
		return [-1, false]
	return [P._still(name, "stand", i), f.x - f.y < 0.0]


static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"princess:swans":
			# HER SWANS CIRCLING HER, each among what stands at its own depth
			if not _alive(src):
				return
			var n: int = src.h2.swans()
			var ride: bool = src.h2.riding()
			var r: float = (float(CIRCLE["r_ride"]) if ride else float(CIRCLE["r"])) + float(CIRCLE["more"]) * maxi(0, n - 3)
			var time: float = P._clock
			for i in 5:
				var key := "fx_swan%d" % i
				if i >= n:
					var s = p.get(key)
					if s != null and is_instance_valid(s):
						s.visible = false
					continue
				var a := time * TAU / float(CIRCLE["round"]) + i * TAU / n
				var w: Vector2 = src.world + Vector2(cos(a), sin(a)) * r
				var z := (float(CIRCLE["high_ride"]) if ride else float(CIRCLE["high"])) + float(CIRCLE["bob"]) * sin(time * 2.1 + i * 1.7)
				var sw := _swan(P, "fly", Vector2(-sin(a), cos(a)), floori(time * SWAN_FPS) + i * 3)
				P._film_one(p, key, sw[0], w, w.x + w.y, sw[1], roundf(z))
		"princess:snare":
			var lk := snare_look(p)
			var i := snare_frame(lk["t"], lk["hp"], lk["hit"], lk["broken"])
			var at := Vector2(p["x"], p["y"])
			var r: float = PR.SNARE["r"]
			for half in ["far", "near"]:
				var name: String = "pr_snare_" + half
				if i < 0 or not P.has_film(name):
					var s = p.get("fx_" + half)
					if s != null and is_instance_valid(s):
						s.visible = false
					continue
				P._film_one(p, "fx_" + half, P._still(name, "stand", i), at, at.x + at.y + (r if half == "near" else -r), false)
		"princess:eleven":
			# THE ELEVEN'S SWANS diving along their lines: swooping down onto the line, low along it, up and away off its end
			var u := Vector2(p["fx"], p["fy"])
			var o := Vector2(p["x"], p["y"])
			var lines: Array = p["lines"]
			for k in lines.size():
				var l: Dictionary = lines[k]
				var key := "fx_dive%d" % k
				var at := PR.swan_at(l, t)
				if is_nan(at):
					var s = p.get(key)
					if s != null and is_instance_valid(s):
						s.visible = false
					continue
				var w := o + u * at + Vector2(-u.y, u.x) * float(l["v"])
				var u0: float = l["u0"]
				var u1: float = l["u1"]
				var z := 8.0 + 34.0 * _c01(1.0 - (at - u0) / 2.5) + 40.0 * _c01((at - (u1 - 1.5)) / 1.5)
				var sw := _swan(P, "dive", u, floori(t * SWAN_FPS) + k)
				P._film_one(p, key, sw[0], w, w.x + w.y, sw[1], roundf(z))


# --- on the floor, under the figures ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"princess:warn":
			if not _acting(src, p):
				return
			var id := str(src.h2.acts()[src.h2.act["i"]]["id"])
			var T: float = src.h2.act["t"]
			if id == "princess:lash":
				var hit: float = PR.LASH["hit"]
				if T >= 0.25 and T < hit:
					_lash_wedge(P, src, _c01((T - 0.25) / (float(PR.LASH["warn"][1]) - 0.25)))
			elif id == "princess:leap":
				# (where its forehooves will come down: round her arena from the start of the leap; at the hero from its spring)
				var R := PR.RIDE
				var from: float = float(R["spring"]) if int(src.h2.act.get("a", 0)) == 1 else 0.0
				if T >= from and T < float(R["hit"]):
					var f := PR.hoof_at(src.face, Vector2(src.h2.act["x"], src.h2.act["y"]))
					P._sweep_ring(f.x, f.y, float(R["r"]), _c01((T - from) / (float(R["hit"]) - from)), P._clock)
		"princess:snare":
			# (marked where it will burst, from the end of her warning to the heave)
			if t < 0.0:
				var lead: float = float(PR.SNARE["hit"]) - float(PR.SNARE["warn"][1])
				P._sweep_ring(float(p["x"]), float(p["y"]), float(PR.SNARE["r"]), _c01(1.0 + t / lead), P._clock)
		"princess:vow":
			var i := vow_frame(t)
			if i >= 0 and P.has_film("pr_vow"):
				P._film_pic(P, "pr_vow", "floor", i, Iso.to_screen(p["x"], p["y"]), false)
		"princess:eleven":
			_feathers(P, p)


## THE LASH'S WEDGE through its warning (`k`: how far through): its two edges and its far arc, dotted in the enemy's pink,
## brightening; the edge the vine comes from (her right) the brightest.
static func _lash_wedge(c: CanvasItem, m, k: float) -> void:
	var hand: int = m.h2.act["hand"] if m.h2.act != null else 1
	var reach: float = PR.LASH["reach"]
	var dot := func(fwd: float, left: float, col: Color, a: float) -> void:
		var w := A1.beside(m.world, m.face, hand, fwd, left)
		var q := GP.at(w.x, w.y)
		GP.dot(c, q.x, q.y, col, 1, 1, a)
	var run := fmod(float(c._clock) * 1.4, 1.0)
	for e in [[float(PR.LASH["from"]), true], [float(PR.LASH["to"]), false]]:
		var b := deg_to_rad(e[0])
		var hot: bool = e[1]
		var d := 0.6
		while d <= reach:
			var lead := fposmod(d / reach - run, 1.0)
			dot.call(cos(b) * d, sin(b) * d, FLAME[3] if hot else FLAME[2], minf(1.0, (0.45 if hot else 0.25) + 0.55 * k + (0.3 if lead > 0.9 else 0.0)))
			d += 0.2
	var deg: float = PR.LASH["from"]
	while deg <= float(PR.LASH["to"]) + 1e-6:
		var b := deg_to_rad(deg)
		dot.call(cos(b) * reach, sin(b) * reach, FLAME[2], minf(1.0, 0.3 + 0.6 * k))
		if roundi(deg / 1.5) % 2 == 0:
			dot.call(cos(b) * (reach - 0.12), sin(b) * (reach - 0.12), FLAME[0], 0.4 * k)
		deg += 1.5


## (art/princess_fx.ts featherLine) The feathers along a line from `a` to `b` (the art's units): falling onto it one after another
## through the warning, scattered up and out of the swan's way as it passes. [[u, v, z], colour, size]
static func feather_line(a: Vector2, b: Vector2, t: float, warn: float, swept: float) -> Array:
	var out: Array = []
	var L := a.distance_to(b)
	var n := GP.rnd(L / 3.2)
	var u := (b - a) / L
	for i in n + 1:
		var k := float(i) / n
		if k > t / (warn * 0.7):
			continue
		var off := (GP.hash(i, 1, 7561) - 0.5) * 3.0
		var p := Vector3(a.x + (b.x - a.x) * k - u.y * off, a.y + (b.y - a.y) * k + u.x * off, 0.4)
		if swept > k:
			var g := minf(1.0, (swept - k) * 3.0)
			var side := 1.0 if GP.hash(i, 2, 7561) > 0.5 else -1.0
			p = Vector3(p.x + u.x * 4.0 * g - u.y * side * 6.0 * g, p.y + u.y * 4.0 * g + u.x * side * 6.0 * g, 0.4 + 6.0 * sin(PI * minf(1.0, g)) * (1.0 - g * 0.5))
			if g >= 1.0 and GP.hash(i, 3, 7561) < 0.6:
				continue
		var col := Color("#ffffff") if i % 3 == 0 else (Color("#e6e4ee") if i % 3 == 1 else Color("#c6c4d2"))
		out.append([p, col, 2 if i % 4 == 0 else 1])
	return out


## THE ELEVEN'S FEATHERS on the floor along each line: falling through the warning, scattered as its swan passes.
static func _feathers(c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	var warn: float = p["a"]
	var tw := t + warn
	var u := Vector2(p["fx"], p["fy"])
	var o := Vector2(p["x"], p["y"])
	var fade := 1.0 - _c01((t - (float(p["dur"]) - 0.6)) / 0.6)
	for l in p["lines"]:
		var at := PR.swan_at(l, t)
		var swept := 0.0 if t < float(l["go"]) else (1.0 if is_nan(at) else (at - float(l["u0"])) / (float(l["u1"]) - float(l["u0"])))
		var v: float = l["v"]
		for f in feather_line(Vector2(float(l["u0"]) * TILE3, v * TILE3), Vector2(float(l["u1"]) * TILE3, v * TILE3), tw, warn, swept):
			var q: Vector3 = f[0]
			var fu := q.x / TILE3
			var fv := q.y / TILE3
			var w := o + u * fu + Vector2(-u.y, u.x) * fv
			var s := GP.at(w.x, w.y)
			GP.fill(c, GP.rnd(s.x), GP.rnd(s.y - q.z / 2.0), f[2], 1, f[1], fade)


# --- over what stands ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	match str(p["a1"]):
		"princess:snare":
			_snare_bar(c, p)
		"princess:fall":
			_flying_off(P, c, p)


## THE CAGE'S LIFE, a bar under it: while it holds, until it is broken or withers.
static func _snare_bar(c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	if float(p["broken"]) >= 0.0 or float(p["wither"]) >= 0.0 or t < float(SNARE_FX["burst"][1]) or t >= float(SNARE_FX["sink"][0]):
		return
	var s := GP.at(p["x"], p["y"])
	var w := 36
	var life: int = PR.SNARE["life"]
	var top := GP.rnd(s.y) + GP.rnd(float(PR.SNARE["r"]) * 8.0 * sqrt(2.0)) + 6
	var left := GP.rnd(s.x) - w / 2
	GP.fill(c, left - 1, top - 1, w + 2, 4, INK)
	GP.fill(c, left, top, w, 2, BL1)
	GP.fill(c, left, top, maxi(0, GP.rnd(float(w) * int(p["life"]) / life)), 2, BL4)
	# (its stages marked off on it)
	for k in range(1, life):
		GP.fill(c, left + GP.rnd(float(w) * k / life), top, 1, 2, INK)


## AS SHE FALLS, HER SWANS FLY OFF OVER THE WALL: up and out from their round, away up the screen, gone.
static func _flying_off(P, c: CanvasItem, p: Dictionary) -> void:
	var n: int = roundi(float(p["a"]))
	var k := _c01(float(p["t"]) / FLY_OFF)
	if k >= 1.0:
		return
	var time: float = P._clock
	var alpha := 1.0 - _c01((k - 0.7) / 0.3)
	for i in n:
		var a := time * TAU / float(CIRCLE["round"]) + i * TAU / n
		var r := float(CIRCLE["r"]) + float(CIRCLE["more"]) * maxi(0, n - 3) + 5.0 * k * k
		var drift := 12.0 * k * k
		var w := Vector2(p["x"], p["y"]) + Vector2(cos(a), sin(a)) * r - Vector2(drift, drift) * sqrt(0.5)
		var z := float(CIRCLE["high"]) + 150.0 * k * k
		# (the way it flies: round, and more and more away)
		var v := Vector2(-sin(a) * (1.0 - k) - k, cos(a) * (1.0 - k) - k)
		var sw := _swan(P, "fly", v, floori(time * SWAN_FPS * 1.4) + i * 3)
		if int(sw[0]) < 0:
			continue
		var q: Array = P._fx["pics"][int(sw[0])]
		var scr := Iso.to_screen(w.x, w.y) - Vector2(0, 2.0 * roundf(z))
		var flip: bool = sw[1]
		var rect := Rect2(scr.x - float(q[5]) - float(q[3]), scr.y + float(q[6]), -float(q[3]), float(q[4])) if flip else Rect2(scr + Vector2(q[5], q[6]), Vector2(q[3], q[4]))
		c.draw_texture_rect_region(P._sheet(int(q[0])), rect, Rect2(q[1], q[2], q[3], q[4]), Color(1, 1, 1, alpha))


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
