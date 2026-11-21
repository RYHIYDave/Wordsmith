## WHAT FLOOR 18'S OWN LAY ON THE FLOOR AND SEND OVER IT (the Glass Gallery: render/act1_fx/lady.ts, qguard.ts, reflection.ts, gqueen.ts),
## as their rules step them (game/act1_rules/qguard.ts, reflection.ts, gqueen.ts peril, floorBlow). Their warnings, `<kind>:warn`, are
## act3/marks16.gd's.
##   lady:show       the flash's light on the floor before her, from the spot skittering through her warning to the cone held and gone
##                   (ld_flash_<view>).
##   qguard:x        THE X: two bright cuts crossing before him, out and gone in a moment.
##   qguard:fan      THE SHARDS: slivers of mirror glass flying out along the fan's five ways, glinting; each strikes the first it meets.
##   reflection:*    what a copy sends, in the enemy's pink: an arrow, a hellfire bolt, a thrown axe, a wave, an orb or a vial lobbed
##                   (where it will burst ringed the whole way).
##   gqueen:hall     HER HALL: its twelve pier glasses (still; awake, one more each phase; trembling, burst and growing back through her
##                   Shatter: qn_glass_<i>) and her talking mirror at the hall's end (still, speaking, the truth: qn_talk_<mode>), each
##                   at its place among the figures; through Shatter's warning its six lanes lit, its glass flying across the hall
##                   and lying glittering; her mirror's words over it.
##   gqueen:cloud    her poison where the comb struck (qn_cloud), under the figures; biting whoever stands in it.
##   gqueen:ring     THE RING OF MIRRORS: six pier glasses round him, her in every one, each its bar of life; forming, trembling as its
##                   time runs out, burst; their glass flung at him if the time runs out.
## Nothing cyan: the enemy's pink, glass and silver.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const M16 := preload("res://scripts/act3/marks16.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const LD := preload("res://scripts/act3/lady.gd")
const QG := preload("res://scripts/act3/qguard.gd")
const RF := preload("res://scripts/act3/reflection.gd")
const QN := preload("res://scripts/act3/gqueen.gd")
const PF := preload("res://scripts/pixel_font.gd")

const GLASS: Array[Color] = [Color("#6a7086"), Color("#b8c0d8"), Color("#eef2ff"), Color("#ffffff")]
const PINK: Array[Color] = [Color("#7a1640"), Color("#ff3a78"), Color("#ff9cc4"), Color("#fff0f6")]
const QG_PINK := Color("#ff9ac6")
## (render/act1_fx/gqueen.ts SHATTER_KEYS: the moments of Shatter its pier glasses are painted at; and how long it is)
const KEYS := [0.45, 0.8, 1.1, 1.3, 1.4, 1.9, 2.7, 3.0, 3.3]
const SHATTER_LONG := 3.4
const BURST0 := 1.3666666666666667
const FLY := 0.45
const LIE1 := 3.0
const SPEAK_LONG := 3.8
const TRUTH_LONG := 3.4
## (render/fx.ts bossSay: its ink, its gold)
const SAY_INK := Color("#120d18")
const SAY_GOLD := Color("#ffd27a")


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _alive(src) -> bool:
	return src != null and is_instance_valid(src) and not src.dead


static func _view(f: Vector2) -> String:
	return "back" if f.x + f.y < -0.2 else "front"


static func _flip(f: Vector2) -> bool:
	return f.x - f.y < 0.0


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


static func _main(P):
	return P.hero.monsters.main if P.hero != null and P.hero.monsters != null else null


# --- the step ---

static func step(P, p: Dictionary, dt: float) -> bool:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return M16.step(P, p, dt)
	var t: float = p["t"]
	var src = p.get("src")
	var hero = P.hero
	match name:
		"lady:show":
			if not _alive(src) or src.state != "act" or src.h2 == null or not is_same(src.h2.act, p["act"]):
				p["dur"] = t
		"qguard:fan":
			# (each shard strikes the first it meets: the hero, once a shard; `a` the shards that have struck, as bits)
			var f := Vector2(p["fx"], p["fy"])
			var s := Vector2(p["x"], p["y"])
			for i in int(QG.FAN["count"]):
				if int(p["a"]) & (1 << i):
					continue
				var q := QG.shard_at(s, f, i, t)
				if q == Vector2.INF:
					continue
				var q0 := QG.shard_at(s, f, i, maxf(0.0, t - dt))
				if not P.hero.monsters.map.open_at(floori(q.x), floori(q.y)):
					p["a"] = int(p["a"]) | (1 << i)
					continue
				if hero.alive and _seg(hero.world, q0, q) <= float(QG.TUNE["shard_hit"]) and hero._act != "lunge" and A1.open_to(hero):
					p["a"] = int(p["a"]) | (1 << i)
					P._hurt(p, p["dmg"], q)
		"reflection:arrow", "reflection:bolt", "reflection:axe":
			if int(p["done"]) == 0:
				var b: Dictionary = p["blow"]
				var f := Vector2(p["fx"], p["fy"])
				var at: Vector2 = Vector2(p["x"], p["y"]) + f * RF.shot_out(b, t)
				var at0: Vector2 = Vector2(p["x"], p["y"]) + f * RF.shot_out(b, maxf(0.0, t - dt))
				if not P.hero.monsters.map.open_at(floori(at.x), floori(at.y)):
					p["done"] = 1
				elif hero.alive and _seg(hero.world, at0, at) <= float(b["hit"]) and A1.open_to(hero):
					p["done"] = 1
					P._hurt(p, p["dmg"], at)
		"reflection:wave":
			if int(p["done"]) == 0 and hero.alive:
				var along := float(RF.WAVE["speed"]) * t
				var a: Vector2 = hero.world - Vector2(p["x"], p["y"])
				var f := Vector2(p["fx"], p["fy"])
				var fw := a.dot(f)
				var side := absf(a.x * f.y - a.y * f.x)
				if absf(fw - along) <= 0.5 and side <= float(RF.WAVE["half"]) + along * 0.25 and A1.open_to(hero):
					p["done"] = 1
					P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]) + f * along)
		"reflection:orb", "reflection:vial":
			var b: Dictionary = p["blow"]
			if int(p["done"]) == 0 and t >= float(p["c"]) + float(b["after"]):
				p["done"] = 1
				var at := Vector2(p["a"], p["b"])
				P.sfx.play(str(b["boom"]), linear_to_db(0.5))
				P.hero._tell({"t": "burst", "x": at.x, "y": at.y, "r": b["burst"], "el": "phys", "style": "blast"})
				if hero.alive and hero.world.distance_to(at) <= float(b["burst"]) and A1.open_to(hero):
					P._hurt(p, p["dmg"], at)
		"gqueen:hall":
			if p.has("say_t"):
				p["say_t"] = maxf(0.0, float(p["say_t"]) - dt)
		"gqueen:cloud":
			# (her poison: who stands in it, a little each half second)
			if hero.alive and t >= float(p["a"]) and hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(QN.CLOUD["r"]) and A1.open_to(hero):
				p["a"] = t + float(QN.CLOUD["every"])
				P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
		"gqueen:ring":
			# (time run out: every mirror still whole hurls its glass at him at once)
			if int(p["c"]) == 0 and t >= float(QN.RING["long"]):
				var n := QN.ring_spots(P.hero.monsters.map, p).size()
				var whole := 0
				for i in n:
					if not (int(p["b"]) & (1 << i)):
						whole += 1
				p["c"] = 2
				p["d"] = t
				p["dur"] = t + 0.8
				P.sfx.play("shatter", 0.0)
				if whole > 0 and hero.alive and A1.open_to(hero):
					P._hurt(p, float(p["dmg"]) * whole, Vector2(p["x"], p["y"]))
	return t < float(p["dur"])


## How near `q` comes to the way from `a` to `b`.
static func _seg(q: Vector2, a: Vector2, b: Vector2) -> float:
	var d := b - a
	var l2 := d.length_squared()
	if l2 < 1e-9:
		return q.distance_to(a)
	return q.distance_to(a + d * clampf((q - a).dot(d) / l2, 0.0, 1.0))


## THE RING STRUCK (game.ts breakProps; gqueen.ts floorBlow): every blow of his on one of its mirrors takes one of its three (no more
## than one in 0.3 s); broken, the one she is in throws her out stunned, and the rest burst harmlessly.
static func floor_blow(P, p: Dictionary, at: Vector2, rad: float) -> void:
	if str(p.get("a1", "")) != "gqueen:ring" or int(p["c"]) != 0:
		return
	var spots := QN.ring_spots(P.hero.monsters.map, p)
	var t: float = p["t"]
	for i in spots.size():
		var q: Vector2 = spots[i]
		if int(p["b"]) & (1 << i) or q.distance_to(at) > rad + float(QN.RING["hit"]):
			continue
		if t - float(p["last"][i]) < float(QN.RING["gap"]):
			continue
		p["last"][i] = t
		p["left"][i] = int(p["left"][i]) - 1
		P.hero._tell({"t": "spark", "x": q.x, "y": q.y, "el": "phys", "n": 4})
		if int(p["left"][i]) > 0:
			P.sfx.play("hit", linear_to_db(0.4))
			continue
		p["b"] = int(p["b"]) | (1 << i)
		P.sfx.play("shatter", linear_to_db(0.6))
		P.hero._tell({"t": "spark", "x": q.x, "y": q.y, "el": "phys", "n": 10})
		if i != int(p["a"]):
			continue
		# (found: she is thrown out of it, stunned; the rest burst harmlessly)
		p["c"] = 1
		p["d"] = t
		p["b"] = (1 << spots.size()) - 1
		p["dur"] = t + 0.8
		var src = p.get("src")
		if _alive(src):
			src.h2.found(src, q, P.hero)
			A1.word(src, P.hero, "Found!", Color("#7af8f0"))
		return


# --- among what stands ---

static func stands(P, p: Dictionary) -> void:
	match str(p["a1"]):
		"gqueen:hall":
			_stand_hall(P, p)
		"gqueen:ring":
			_stand_ring(P, p)


static func _stand_hall(P, p: Dictionary) -> void:
	var F := QN.hall_frame(_main(P))
	if F.is_empty():
		return
	var flip: bool = not F["along_x"]
	var now: float = P._clock
	var since: float = now - float(p["b"]) if float(p["b"]) >= 0.0 else -1.0
	var ki := -1
	if since >= float(KEYS[0]) and since <= SHATTER_LONG:
		for j in KEYS.size():
			if float(KEYS[j]) <= since:
				ki = j
	var awake: int = int(p["a"])
	for i in 12:
		var name := "qn_glass_%d" % i
		if not P.has_film(name):
			continue
		var g := QN.pier_glass(F, i)
		var w: Vector2 = g[0]
		var k := 2 + ki if ki >= 0 else (1 if QN.AWAKE_ORDER.slice(0, awake).has(i) else 0)
		P._film_one(p, "fx_glass%d" % i, P._still(name, "stand", k), w, w.x + w.y, flip)
	# HER MIRROR at the hall's end
	var mir: Vector2 = F["mirror"]
	var c: int = p["c"]
	var d: float = now - float(p["d"])
	var tname := "qn_talk_still"
	var k := floori(now * 8.0) % 32
	if c == 2:
		tname = "qn_talk_truth"
		k = mini(floori(minf(TRUTH_LONG, d) * 8.0), int(P._fx["films"].get(tname, {"n": 1})["n"]) - 1)
	elif c == 1:
		tname = "qn_talk_speaking"
		k = mini(floori(d * 8.0), roundi(SPEAK_LONG * 8.0) - 1)
	if P.has_film(tname):
		P._film_one(p, "fx_talk", P._still(tname, "stand", k), mir, mir.x + mir.y, flip)


static func _stand_ring(P, p: Dictionary) -> void:
	var spots := QN.ring_spots(P.hero.monsters.map, p)
	var t: float = p["t"]
	var src = p.get("src")
	for i in spots.size():
		var q: Vector2 = spots[i]
		var gi := (i * 2) % 12
		var name := "qn_glass_%d" % gi
		if not P.has_film(name):
			continue
		var broken: bool = (int(p["b"]) & (1 << i)) != 0 or int(p["c"]) != 0
		var key := -1.0
		if broken:
			key = 1.9
		elif t < 0.45:
			key = 2.7 if t < 0.15 else (3.0 if t < 0.3 else 3.3)
		elif t > float(QN.RING["long"]) - float(QN.RING["warn"]):
			key = [0.8, 1.1, 1.3][floori(P._clock * 12.0) % 3]
		var k := 0 if key < 0 else 2 + KEYS.find(key)
		P._film_one(p, "fx_ring%d" % i, P._still(name, "stand", k), q, q.x + q.y, false)
		# (her in it, cold and faint, only in its glass)
		if k == 0 and _alive(src):
			_her_in_glass(P, p, "fx_her%d" % i, gi, q, src)
		else:
			_hide(p, "fx_her%d" % i)


## Her standing picture laid in pier glass `gi`'s glass, cold and faint, nowhere else (render/act1_fx/gqueen.ts herInGlass): its glass
## a mask (qn_mask_<gi>), her picture clipped by it.
static func _her_in_glass(P, p: Dictionary, key: String, gi: int, w: Vector2, queen) -> void:
	var node = p.get(key)
	if node == null or not is_instance_valid(node):
		node = Node2D.new()
		P.stands.add_child(node)
		var mask := Sprite2D.new()
		mask.centered = false
		mask.region_enabled = true
		mask.clip_children = CanvasItem.CLIP_CHILDREN_ONLY
		node.add_child(mask)
		var her := Sprite2D.new()
		her.centered = false
		mask.add_child(her)
		p[key] = node
	node.visible = true
	var depth := w.x + w.y + 0.01
	var scr := Iso.to_screen(w.x, w.y)
	node.position = Vector2(scr.x, depth * 16.0)
	var mask: Sprite2D = node.get_child(0)
	var pi: int = P._still("qn_mask_%d" % gi, "stand", 0)
	var q: Array = P._fx["pics"][pi]
	mask.texture = P._sheet(int(q[0]))
	mask.region_rect = Rect2(q[1], q[2], q[3], q[4])
	mask.offset = Vector2(float(q[5]), float(q[6]) + scr.y - depth * 16.0)
	var spot: Array = P._fx["tables"].get("qn_spots", [])[gi] if gi < P._fx["tables"].get("qn_spots", []).size() else [0, 0]
	var her: Sprite2D = mask.get_child(0)
	var n: int = queen.art.count(0, "idle")
	var f: Dictionary = queen.art.frame(0.0, 1.0, "idle", floori(P._clock * 10.0) % maxi(1, n))
	her.texture = f["tex"]
	her.flip_h = f["flip"]
	her.scale = Vector2.ONE * float(f["scale"])
	her.position = Vector2(float(spot[0]), scr.y - depth * 16.0 + float(spot[1]))
	her.offset = f["offset"]
	her.modulate = Color(0.88, 0.9, 0.98, 0.7)


# --- on the floor, under the figures ---

static func draw(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		M16.draw(P, p)
		return
	var t: float = p["t"]
	var src = p.get("src")
	match name:
		"lady:show":
			if not _alive(src) or src.h2 == null or not is_same(src.h2.act, p["act"]):
				return
			var f: Vector2 = src.face
			var fname := "ld_flash_" + _view(f)
			if not P.has_film(fname):
				return
			var k: int = P._film_frame(fname, float(src.h2.act["t"]) - float(LD.FLASH["hit"]))
			if k >= 0:
				P._film_pic(P, fname, "floor", k, Iso.to_screen(src.world.x, src.world.y), _flip(f))
		"reflection:orb", "reflection:vial":
			# (on its way: where it will burst, ringed the whole way)
			if int(p["done"]) == 0:
				var b: Dictionary = p["blow"]
				var k := minf(1.0, t / maxf(0.1, float(p["c"]) + float(b["after"])))
				GW.fan(P, Vector2(p["a"], p["b"]), Vector2(1, 0), 1, -PI, PI, b["burst"], k, P._clock)
		"gqueen:cloud":
			if P.has_film("qn_cloud"):
				var n: int = P._fx["films"]["qn_cloud"]["n"]
				P._film_pic(P, "qn_cloud", "floor", mini(floori(t * 8.0), n - 1), Iso.to_screen(p["x"], p["y"]), false)
		"gqueen:ring":
			# (as its time runs out: where his blow will fall, round him)
			if int(p["c"]) == 0:
				var k := GW.warn_k(t, float(QN.RING["long"]) - float(QN.RING["warn"]), QN.RING["long"])
				if k >= 0.0:
					GW.fan(P, P.hero.world, Vector2(1, 0), 1, -PI, PI, 1.0, k, P._clock)
		"gqueen:hall":
			var F := QN.hall_frame(_main(P))
			if F.is_empty() or float(p["b"]) < 0.0:
				return
			var since: float = P._clock - float(p["b"])
			# (Shatter's six lanes across the hall, lit through its warning)
			var k := GW.warn_k(since, float(QN.SHATTER["warn"][0]) - 0.2, QN.SHATTER["hit"])
			if k >= 0.0:
				var half: float = QN.SHATTER["half"]
				var across := 2.0 * QN.ARENA_B / QN.TILE3
				var v: Vector2 = F["v"]
				for a in QN.HALL_AT:
					var from := QN.hall_at(F, float(a) * QN.TILE3, QN.ARENA_B)
					GW.strip(P, from, -v, 1, 0.0, across, -half, half, k, P._clock)
			if since > BURST0 + FLY:
				_shatter_glass(P, P, F, since, false)


## Shatter's glass: in flight across the hall in its lanes (the art's own pieces), then lying and glittering.
static func _shatter_glass(P, c: CanvasItem, F: Dictionary, since: float, air: bool) -> void:
	var tab: Array = P._fx["tables"].get("qn_shards", [])
	if since < BURST0 or since > LIE1 or tab.is_empty():
		return
	var flying := since < BURST0 + FLY + 0.15
	if flying != air:
		return
	var pieces: Array = tab[clampi(floori((since - BURST0) * 15.0), 0, tab.size() - 1)]
	var step := 1 if flying else 3
	var n := 0
	while n < pieces.size():
		var q: Array = pieces[n]
		var w := QN.hall_at(F, float(q[0]), float(q[1]))
		var s := GP.at(w.x, w.y)
		var up := float(q[2]) / 2.0
		var glint := ((n * 7 + floori(P._clock * 12.0)) & 3) == 0
		var col := Color("#f5f7ff") if glint else (Color("#9ea4bf") if n % 3 != 0 else Color("#cdd2e6"))
		if flying:
			GP.fill(c, GP.rnd(s.x) - 1, GP.rnd(s.y - up) - 1, 3, 2, col)
		elif glint:
			GP.fill(c, GP.rnd(s.x), GP.rnd(s.y), 1, 1, col)
		n += step


# --- over what stands ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	match str(p["a1"]):
		"qguard:x":
			_cross(c, p)
		"qguard:fan":
			_shards(P, c, p)
		"reflection:arrow", "reflection:bolt", "reflection:axe":
			if int(p["done"]) == 0:
				var b: Dictionary = p["blow"]
				var f := Vector2(p["fx"], p["fy"])
				var d := RF.shot_out(b, t)
				var a := GP.at(float(p["x"]) + f.x * maxf(0.0, d - 0.7), float(p["y"]) + f.y * maxf(0.0, d - 0.7))
				var e := GP.at(float(p["x"]) + f.x * d, float(p["y"]) + f.y * d)
				c.draw_line(Vector2(a.x, a.y - 14.0) * 2.0, Vector2(e.x, e.y - 14.0) * 2.0, PINK[1], 4.0)
				GP.fill(c, GP.rnd(e.x) - 1, GP.rnd(e.y) - 15, 3, 3, PINK[3])
		"reflection:wave":
			var along := float(RF.WAVE["speed"]) * t
			var half := float(RF.WAVE["half"]) + along * 0.25
			var fade := maxf(0.0, 1.0 - t / float(RF.WAVE["long"]))
			var f := Vector2(p["fx"], p["fy"])
			for i in range(-6, 7):
				var s := i / 6.0 * half
				var bow := 0.25 * (1.0 - pow(i / 6.0, 2))
				var w := Vector2(p["x"], p["y"]) + f * (along + bow) + Vector2(-f.y, f.x) * s
				var q := GP.at(w.x, w.y)
				GP.fill(c, GP.rnd(q.x) - 2, GP.rnd(q.y) - 6, 4, 4, PINK[2] if absi(i) < 3 else PINK[1], 0.35 + 0.5 * fade)
		"reflection:orb", "reflection:vial":
			if int(p["done"]) == 0:
				var k := clampf(t / maxf(0.05, float(p["c"])), 0.0, 1.0)
				var w := Vector2(p["x"], p["y"]).lerp(Vector2(p["a"], p["b"]), k)
				var q := GP.at(w.x, w.y)
				var up := 20.0 * sin(PI * k)
				GP.fill(c, GP.rnd(q.x) - 2, GP.rnd(q.y - up) - 2, 4, 4, PINK[1])
				GP.fill(c, GP.rnd(q.x) - 1, GP.rnd(q.y - up) - 1, 2, 2, PINK[3])
		"gqueen:ring":
			_ring_air(P, c, p)
		"gqueen:hall":
			var F := QN.hall_frame(_main(P))
			if not F.is_empty() and float(p["b"]) >= 0.0:
				_shatter_glass(P, c, F, P._clock - float(p["b"]), true)
			if float(p.get("say_t", 0.0)) > 0.0:
				_say(c, p)


## THE X: two cuts crossing before him, `t` seconds after the first blade.
static func _cross(c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	var fade := 1.0 - minf(1.0, t / 0.6)
	if fade <= 0.0:
		return
	var half: float = float(QG.SLASH["wide"]) / 2.0
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	for s in [-1, 1]:
		# (one cut from near-left to far-right, the other across it; the second a moment later)
		if s > 0 and t < float(QG.SLASH["second"]) - float(QG.SLASH["hit"]):
			continue
		var u := 0.0
		while u <= 1.0:
			var fwd := float(QG.SLASH["from"]) + (float(QG.SLASH["reach"]) - float(QG.SLASH["from"])) * u
			var q := A1.beside(at, f, int(p["hand"]), fwd, s * half * (1.0 - 2.0 * u))
			var sc := GP.at(q.x, q.y)
			var lift := 10.0 + 8.0 * sin(u * PI)
			GP.dot(c, sc.x, sc.y - lift, GLASS[3] if u > 0.15 and u < 0.85 else GLASS[2], 2, 1, fade)
			if GP.hash(roundi(u * 50.0), s + 2, 9401) < 0.3:
				GP.dot(c, sc.x, sc.y - lift + 1.0, QG_PINK, 1, 1, fade)
			u += 0.02


## THE SHARDS of the fan, each where it flies (till it has struck or met a wall).
static func _shards(P, c: CanvasItem, p: Dictionary) -> void:
	var f := Vector2(p["fx"], p["fy"])
	var s0 := Vector2(p["x"], p["y"])
	for i in int(QG.FAN["count"]):
		if int(p["a"]) & (1 << i):
			continue
		var s := QG.shard_at(s0, f, i, float(p["t"]))
		if s == Vector2.INF:
			continue
		var a := GP.at(s.x, s.y)
		var b := GP.at(s.x - f.x * 0.35, s.y - f.y * 0.35)
		var n := 6
		for k in n + 1:
			var u := float(k) / n
			var col: Color = GLASS[3] if k == n or floori(P._clock * 20.0 + i) % n == k else GLASS[1]
			GP.dot(c, b.x + (a.x - b.x) * u, b.y - 18.0 + (a.y - b.y) * u, col)


static func _ring_air(P, c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	var spots := QN.ring_spots(P.hero.monsters.map, p)
	if int(p["c"]) == 0 and t > 0.45:
		# (each mirror's bar of life over it, as a monster's: his word, “give each mirror a HP bar”)
		for i in spots.size():
			if int(p["b"]) & (1 << i):
				continue
			var q: Vector2 = spots[i]
			var s := GP.at(q.x, q.y)
			var w := 20
			var x := GP.rnd(s.x - w / 2.0)
			var y := GP.rnd(s.y - 62.0)
			var left := maxi(0, int(p["left"][i]))
			GP.fill(c, x - 1, y - 1, w + 2, 5, Color("#100c18"))
			GP.fill(c, x, y, w, 3, Color("#3a1428"))
			GP.fill(c, x, y, GP.rnd(float(w) * left / float(QN.RING["life"])), 3, Color("#ff3a78"))
			GP.fill(c, x, y, GP.rnd(float(w) * left / float(QN.RING["life"])), 1, Color("#ffd0e4"))
		return
	if int(p["c"]) == 2:
		# (time run out: the glass of every mirror still whole flung at him)
		var k := (t - float(p["d"])) / float(QN.RING["fly"])
		if k > 1.2:
			return
		var h: Vector2 = P.hero.world
		for i in spots.size():
			if int(p["b"]) & (1 << i):
				continue
			var q: Vector2 = spots[i]
			for j in 7:
				var u := minf(1.0, k + j * 0.04)
				var w := q.lerp(h, u)
				var s := GP.at(w.x, w.y)
				var col := Color("#f5f7ff") if j == 0 else (Color("#cdd2e6") if j % 2 == 1 else Color("#ff9cc4"))
				GP.fill(c, GP.rnd(s.x) - 1, GP.rnd(s.y) - 22 + j, 2, 2, col)


## HER MIRROR'S WORDS on a dark slip over it, a little tail pointing down (render/fx.ts bossSay), in the game's pixels.
static func _say(c: CanvasItem, p: Dictionary) -> void:
	var text := str(p["say"])
	var secs: float = p["say_secs"]
	var left: float = p["say_t"]
	var t := secs - left
	var a := minf(1.0, t / 0.15) if t < secs - 0.4 else maxf(0.0, left / 0.4)
	var at: Vector2 = p["say_at"]
	var scr := Iso.to_screen(at.x, at.y)
	c.draw_set_transform(scr, 0.0, Vector2(2, 2))
	var w := PF.width(text) + 10.0
	var y := -float(p["say_lift"]) - roundf(minf(1.0, t / 0.12) * 4.0)
	var foot := y + 1.0 + 10.0
	var ink := Color(SAY_INK, 0.8 * a)
	c.draw_rect(Rect2(-floorf(w / 2.0), y - 3.0, w, 14.0), ink)
	c.draw_rect(Rect2(-2, foot, 5, 1), ink)
	c.draw_rect(Rect2(-1, foot + 1, 3, 1), ink)
	c.draw_rect(Rect2(0, foot + 2, 1, 1), ink)
	PF.draw(c, text, 0, y, Color(SAY_GOLD, a), {"align": "center", "shadow": Color(SAY_INK, a)})
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
