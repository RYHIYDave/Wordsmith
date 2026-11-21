## WHAT FLOOR 19'S BOSS, THE KING, LAYS ACROSS THE HALL AND SENDS AT HIM (render/act1_fx/gking.ts), as his rules step them
## (game/act1_rules/gking.ts peril; act3/gking.gd). His charge's warning, `gking:warn`, is act3/marks16.gd's.
##   gking:sparks  THE LINE OF SPARKS his blade cuts in the stones 1.75 tiles behind him as he runs (the art's sparksPainted, drawn
##                 here as it paints it, laid where he set off, turned as his picture faces): glowing hotter, held white-hot with its
##                 sparks beaded on it, then shot off it, popping in shrapnel; smoke, the scar, nothing.
##   gking:weight  THE CROWN'S WEIGHT (gk_weight_*): its shadow, warning ring, slam and dust on the floor; the crown over him.
##   gking:decree  THE DECREE: each knight where he marches (gk_kn_*), faded in as he rises and out at the far wall.
##   gking:faces   THE CURTAINS: each face of his deeds where it flies, at its height (gk_face).
##   gking:fog     THE HUSH'S GREY FOG lying in a patch (where it will fall marked as the Hush breathes in).
##   gking:hush    THE HUSH at his side in his last phase (its figure, gking_2: its stand; unwinding as he dies); through its grab, the
##                 line its arms will shoot along, and its arms shooting out and dragging him.
##   gking:bird    THE CLOCKWORK SONGBIRD as he dies: winding itself up, then singing (gk_bird_*).
## Nothing cyan: the enemy's pink, the Hush's grey and fog, steel and stone, the bird's gold and silver.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const M16 := preload("res://scripts/act3/marks16.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const KG := preload("res://scripts/act3/gking.gd")

const TILE3 := 39.191835884530846
## (art/king_fx.ts CUT, SPARKS, SHARDS, GRIT, INK; FLAME, art/mkit.ts)
const CUT: Array[Color] = [Color("#fff4c8"), Color("#ffd27a"), Color("#ff4f8a"), Color("#c0206a"), Color("#4a1838")]
const SPARKS: Array[Color] = [Color("#fff4c8"), Color("#ffd27a"), Color("#ff9a3a"), Color("#ffb070")]
const SHARDS: Array[Color] = [Color("#fff4c8"), Color("#ffd27a"), Color("#ffb070"), Color("#ff4f8a"), Color("#c0206a")]
const GRIT: Array[Color] = [Color("#2c2a38"), Color("#45424f"), Color("#646070")]
const INK := Color("#0e0c24")
const FLAME2 := Color("#ff4f8a")
const SMOKE: Array[Color] = [Color("#8e8aa0"), Color("#5c586c")]
## (render/act1_fx/gking.ts FOG)
const FOG: Array[Color] = [Color("#2e2c36"), Color("#47454f"), Color("#666370"), Color("#8c8996"), Color("#b3b0bc")]
## (CHARGE_FX: the held beat, when its pops come, how high and how far off the line, a spark every, its shrapnel's reach and time,
## all gone at)
const CFX := {"hold": 0.35, "fly": [0.28, 0.4], "high": 1.5, "out": 1.6, "every": 0.33, "r": 1.0, "shards": 0.25, "long": 1.0}
const SHARD_N := 12


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


static func _view(p: Dictionary) -> String:
	return "back" if float(p["fx"]) + float(p["fy"]) < -0.2 else "front"


static func _flip(p: Dictionary) -> bool:
	return float(p["fx"]) - float(p["fy"]) < 0.0


# --- his rules, stepped (gking.ts peril) ---

static func step(P, p: Dictionary, dt: float) -> bool:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return M16.step(P, p, dt)
	var t: float = p["t"]
	var hero = P.hero
	match name:
		"gking:sparks":
			# (its sparks shoot off it a moment after he stops, and as they pop whoever is near the line is struck, once)
			if float(p["d"]) > 0.0 and float(p["c"]) == 0.0:
				var off := t - (float(p["d"]) + float(KG.CHARGE["burst"]))
				if off >= 0.0 and off - dt < 0.0:
					P.sfx.play("fire", linear_to_db(0.6))
				if off >= float(KG.CHARGE["pop"][0]) and off <= float(KG.CHARGE["pop"][1]):
					var L := KG.sparks_line(p)
					if KG.off_line(L[0], L[1], hero.world) <= float(KG.CHARGE["line"]) and hero._act != "lunge":
						p["c"] = 1.0
						P._hurt(p, float(p["dmg"]), hero.world)
		"gking:weight":
			_weight_step(P, p, dt)
		"gking:fog":
			# (standing in it, he goes slower, and for a moment after)
			if t > 0.25 and hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(KG.FOG["r"]):
				hero.chill(0.2, KG.FOG["slow"])
		"gking:decree":
			# (a knight walks into him: struck, once a second at most)
			if t - float(p["c"]) >= 1.0:
				var r := A1.from_figure(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), int(p["hand"]), hero.world)
				for k in KG.decree_knights(t, p["a"], p["b"]):
					if float(k["up"]) < 0.6 or float(k["whole"]) < 0.4:
						continue
					if absf(r.x - float(k["x"])) > float(KG.DECREE["fwd"]) or absf(r.y - float(k["y"])) > float(KG.DECREE["side"]):
						continue
					p["c"] = t
					P._hurt(p, float(p["dmg"]), hero.world)
					break
		"gking:faces":
			# (a face passes through him: struck, no oftener than the gap, no more than four a cast)
			if int(p["d"]) < int(KG.FACES["most"]) and t - float(p["c"]) >= float(KG.FACES["gap"]):
				for f in KG.faces_now(p):
					if float(f["k"]) > 0.95:
						continue
					var w: Vector2 = f["w"]
					if w.distance_to(hero.world) > float(KG.FACES["hit"]):
						continue
					p["c"] = t
					p["d"] = int(p["d"]) + 1
					P._hurt(p, float(p["dmg"]), w)
					break
	return t < float(p["dur"])


## THE CROWN'S WEIGHT: flying out over the hero, following him at its pace, held, dropped, lying, flying home (weightAt); the slam as
## it lands.
static func _weight_step(P, p: Dictionary, dt: float) -> void:
	var t: float = p["t"]
	var h: Vector2 = P.hero.world
	var W: Dictionary = KG.WEIGHT_FX
	if t < float(W["fly"]):
		# (off his head, out to over him)
		var e := KG.smooth_in(0.0, W["fly"], t)
		p["x"] = float(p["a"]) + (h.x - float(p["a"])) * e
		p["y"] = float(p["b"]) + (h.y - float(p["b"])) * e
	elif t < float(W["hold"]):
		var to := h - Vector2(p["x"], p["y"])
		var go := minf(to.length(), float(KG.WEIGHT["pace"]) * dt)
		if to.length() > 1e-6:
			p["x"] = float(p["x"]) + to.x / to.length() * go
			p["y"] = float(p["y"]) + to.y / to.length() * go
	elif t >= float(W["home"][0]) and t < float(W["home"][1]):
		# (home onto his head from where it lay, as far as its way home has come: `c`, how far it had come last step)
		var e := KG.smooth_in(W["home"][0], W["home"][1], t)
		var k := _c01((e - float(p["c"])) / maxf(1e-6, 1.0 - float(p["c"])))
		p["x"] = float(p["x"]) + (float(p["a"]) - float(p["x"])) * k
		p["y"] = float(p["y"]) + (float(p["b"]) - float(p["y"])) * k
		p["c"] = e
	if int(p["done"]) == 0 and t >= float(W["drop"][1]):
		# (it slams down)
		p["done"] = 1
		P.sfx.play("explode", linear_to_db(0.8))
		P.hero.kick(6.0)
		var at := Vector2(p["x"], p["y"])
		if h.distance_to(at) <= float(KG.WEIGHT["r"]) and P.hero._act != "lunge":
			P._hurt(p, float(p["dmg"]), at)


# --- on the floor ---

static func draw(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		M16.draw(P, p)
		return
	match name:
		"gking:sparks":
			_sparks(P, p)
		"gking:weight":
			var film := "gk_weight_floor_" + _view(p)
			if float(p["t"]) < float(KG.WEIGHT_FX["long"]) and P.has_film(film):
				P._film_floor(film, p["t"], Vector2(p["x"], p["y"]), _flip(p))
		"gking:fog":
			_fog(P, p)
		"gking:hush":
			if float(p["c"]) == 0.0 and int(p["b"]) == KG.GRABS and int(p["done"]) == 0:
				# (through its grab's warning, the line its arms will shoot along)
				var k := GW.warn_k(p["d"], 0.0, KG.GRAB["warn"])
				if k >= 0.0:
					var a := float(p["a"])
					GW.strip(P, Vector2(p["x"], p["y"]), Vector2(cos(a), sin(a)), 1, 0.3, KG.GRAB["reach"], -0.45, 0.45, k, P._clock)


## Where a point of the art's lengths (forward, to the left, up from where he set off) is from its floor point, picture pixels,
## seen from in front or behind, turned over or not (art/skin.ts stage: its rows).
static func _own(back: bool, flip: bool, q: Vector3) -> Vector2:
	var X := 0.816496580927726 * ((q.x - q.y) if back else (q.x + q.y))
	var Y := (-0.408248290463863 * (q.x + q.y) if back else 0.408248290463863 * (q.x - q.y)) - q.z
	return Vector2(-X if flip else X, Y)


## The art's lay: a `size` square of picture pixels round (x, y) from the floor point `o`.
static func _lay(c: CanvasItem, o: Vector2, at: Vector2, col: Color, size := 1) -> void:
	c.draw_rect(Rect2(o.x + GP.rnd(at.x - size / 2.0), o.y + GP.rnd(at.y - size / 2.0), size, size), col)


static func _wob(x: float) -> float:
	return 2.2 * sin(x * 0.11) + 1.2 * sin(x * 0.37 + 1.0)


static func _fr(v: float) -> float:
	return v - floorf(v)


## chargeSparks: its sparks for a line `lane` tiles long: [x, y, pop, at].
static func _charge_sparks(lane: float) -> Array:
	var T := TILE3
	var x0 := -float(KG.CHARGE["tail"]) * T
	var x1 := (lane - float(KG.CHARGE["tail"])) * T
	var n := maxi(2, GP.rnd(lane / float(CFX["every"])))
	var out: Array = []
	for i in n:
		var x := x0 + (x1 - x0) * (i + 0.15 + 0.7 * GP.hash(i, 1, 7910)) / n
		var y := _wob(x)
		var side := 1.0 if i % 2 == 1 else -1.0
		var o := float(CFX["out"]) * T * (0.35 + 0.65 * GP.hash(i, 2, 7910))
		var along := (GP.hash(i, 3, 7910) - 0.5) * 0.6 * T
		var z := float(CFX["high"]) * T * (0.55 + 0.45 * GP.hash(i, 4, 7910))
		var at := float(CFX["fly"][0]) + (float(CFX["fly"][1]) - float(CFX["fly"][0])) * GP.hash(i, 5, 7910)
		out.append([x, y, Vector3(x + along, y + side * o, z), at])
	return out


static func _spark_at(k: Array, s: float) -> Vector3:
	var u := _c01(s / float(k[3]))
	var e := 1.0 - pow(1.0 - u, 1.4)
	var z := 1.0 - pow(1.0 - u, 3.0)
	var pop: Vector3 = k[2]
	return Vector3(float(k[0]) + (pop.x - float(k[0])) * e, float(k[1]) + (pop.y - float(k[1])) * e, 0.5 + (pop.z - 0.5) * z)


static func _shard_at(k: Array, i: int, j: int, u: float) -> Vector3:
	var c := 2.0 * GP.hash(i, 40 + j, 7911) - 1.0
	var a := TAU * (float(j) / SHARD_N + 0.6 * GP.hash(i, 60 + j, 7911))
	var s := sqrt(1.0 - c * c)
	var d := float(CFX["r"]) * TILE3 * (1.0 - pow(1.0 - _c01(u), 2.0))
	var pop: Vector3 = k[2]
	return Vector3(pop.x + s * cos(a) * d, pop.y + s * sin(a) * d, maxf(0.5, pop.z + c * d - 0.3 * TILE3 * u * u))


## THE LINE OF SPARKS (the art's sparksPainted, frame by frame at thirty a second), laid where he set off.
static func _sparks(P, p: Dictionary) -> void:
	var t := floorf(float(p["t"]) * 30.0) / 30.0
	var lane := roundf(minf(float(KG.CHARGE["most"]), Vector2(float(p["a"]) - float(p["x"]), float(p["b"]) - float(p["y"])).length()) * 4.0) / 4.0
	var back := _view(p) == "back"
	var flip := _flip(p)
	var pace: float = KG.CHARGE["pace"]
	var ran := lane / pace
	var tb := ran + float(KG.CHARGE["burst"])
	if t < 0.0 or t >= tb + float(CFX["long"]):
		return
	var T := TILE3
	var g := GP.at(p["x"], p["y"])
	var o := Vector2(GP.rnd(g.x), GP.rnd(g.y)) * 2.0
	var at := func(q: Vector3) -> Vector2: return _own(back, flip, q)
	var tail := float(KG.CHARGE["tail"]) * T
	var x0 := -tail
	var x1 := minf(t, ran) * pace * T - tail
	var since := t - tb
	var sparks := _charge_sparks(lane)
	# (the held beat: from `hold` before it goes, brighter and brighter, flickering)
	var held := KG.smooth_in(-float(CFX["hold"]), -0.04, since) if since < 0.0 else 0.0
	var pulse := held * (0.6 + 0.4 * sin(t * 46.0))
	var scar := 1.0 if since < 0.0 else 1.0 - KG.smooth_in(0.12, float(CFX["long"]) - 0.05, since)
	# THE CUT: a groove scored along the stones, glowing
	var x := x0
	while x <= x1:
		var age := (x1 - x) / (pace * T) + maxf(0.0, t - ran)
		var y := _wob(x)
		var col := Color(0, 0, 0, 0)
		if since >= 0.0:
			if since < 0.08:
				col = CUT[0]
			elif GP.hash(GP.rnd(x), 3, 7901) < scar:
				col = CUT[2] if since < 0.25 else (CUT[3] if since < 0.5 else CUT[4])
		elif age < 0.05:
			col = CUT[0]
		elif age < 0.15:
			col = CUT[1]
		elif held > 0.7 and GP.hash(GP.rnd(x), floori(t * 20.0), 7902) < held - 0.25:
			col = CUT[0]
		elif pulse > 0.4 and GP.hash(GP.rnd(x), floori(t * 20.0) + 1, 7902) < pulse:
			col = CUT[1]
		else:
			col = CUT[2] if age < 0.4 else CUT[3]
		if col.a > 0.0:
			# (a groove two pixels wide: its hot core, its glowing lips, the stone cut dark at its edge)
			_lay(P, o, at.call(Vector3(x, y, 0.2)), col, 2)
			if since < 0.0:
				var lip := CUT[1] if age < 0.15 else (CUT[2] if pulse > 0.4 else CUT[3])
				_lay(P, o, at.call(Vector3(x, y - 2.4, 0.2)), lip, 1)
				_lay(P, o, at.call(Vector3(x, y + 2.4, 0.2)), INK if GP.hash(GP.rnd(x * 2.0), 1, 7903) < 0.5 else lip, 1)
		x += 0.7
	if since < 0.0:
		# (sparks fizzing up off it all along)
		var n := GP.rnd((x1 - x0) / 2.5)
		for i in n:
			var sx := x0 + (x1 - x0) * GP.hash(i, 1, 7904)
			var age := (x1 - sx) / (pace * T) + maxf(0.0, t - ran)
			var life := _fr(t * (2.2 + GP.hash(i, 2, 7904)) + GP.hash(i, 3, 7904))
			if GP.hash(i, 4, 7904) > 0.45 + 0.4 * held + (0.5 if age < 0.25 else 0.0):
				continue
			var q := Vector3(sx + (GP.hash(i, 5, 7904) - 0.5) * 6.0, _wob(sx) + (GP.hash(i, 6, 7904) - 0.5) * 12.0 * life, 0.5 + 26.0 * life * (1.0 - life) * (1.0 - 0.6 * held))
			_lay(P, o, at.call(q), SPARKS[i % 4], 2 if life < 0.35 else 1)
		# (THE HELD BEAT: the sparks that will go, gathered on the line as beads of light, swelling, trembling)
		if held > 0.0:
			for i in sparks.size():
				var k: Array = sparks[i]
				if float(k[0]) > x1:
					continue
				var shake := (GP.hash(i, floori(t * 30.0), 7912) - 0.5) * 2.5 if held > 0.3 else 0.0
				var s: Vector2 = at.call(Vector3(k[0], k[1], 2.0 + 4.0 * held + shake))
				var hot := (floori(t * 30.0) + i) % 3 != 0
				if held > 0.45:
					# (a bead: its white-hot heart, a gold rim round it, a pink glint under)
					_lay(P, o, s + Vector2(-2, 0), SPARKS[1])
					_lay(P, o, s + Vector2(2, 0), SPARKS[1])
					_lay(P, o, s + Vector2(0, -2), SPARKS[1])
					_lay(P, o, s + Vector2(0, 2), FLAME2)
				_lay(P, o, s, SPARKS[0] if held > 0.5 and hot else SPARKS[1], 3 if held > 0.45 else 2)
		return
	# THE RELEASE: (a flash along the line as they tear off it, narrow, and stone chips kicked up out of it)
	if since < 0.1:
		var H := 0.35 * T
		var fx := x0
		while fx <= x1:
			var fy := -H
			while fy <= H:
				if GP.hash(GP.rnd(fx), GP.rnd(fy * 3.0), 7906) <= 0.6 * (1.0 - since / 0.1) * (1.0 - absf(fy) / H):
					_lay(P, o, at.call(Vector3(fx, _wob(fx) + fy, 0.6)), SPARKS[0] if absf(fy) < H * 0.4 else FLAME2)
				fy += 2.2
			fx += 1.1
	var nc := GP.rnd((x1 - x0) / 4.0)
	for i in nc:
		var kk := since / (0.22 + 0.12 * GP.hash(i, 16, 7905))
		if kk >= 1.0:
			continue
		var gx := x0 + (x1 - x0) * GP.hash(i, 17, 7905)
		var side := (GP.hash(i, 18, 7905) - 0.5) * 2.0
		_lay(P, o, at.call(Vector3(gx, _wob(gx) + side * 0.45 * T * kk, maxf(0.5, 0.45 * T * (2.6 * kk - 2.6 * kk * kk)))), GRIT[i % 3], 2)
	for i in sparks.size():
		var k: Array = sparks[i]
		var kat: float = k[3]
		if since < kat:
			# THE SPARK SHOT OFF: its head white-hot, its streak back along the way it came
			var s: Vector2 = at.call(_spark_at(k, since))
			var st: Vector2 = at.call(_spark_at(k, maxf(0.0, since - 0.07)))
			var steps := maxi(1, ceili(s.distance_to(st)))
			for q in steps:
				var f := float(q) / steps
				_lay(P, o, st + (s - st) * f, SPARKS[2] if f < 0.4 else (SPARKS[1] if f < 0.75 else SPARKS[0]), 2 if f > 0.6 else 1)
			_lay(P, o, s + Vector2(-2, 0), SPARKS[1])
			_lay(P, o, s + Vector2(2, 0), SPARKS[1])
			_lay(P, o, s + Vector2(0, -2), SPARKS[1])
			_lay(P, o, s + Vector2(0, 2), SPARKS[1])
			_lay(P, o, s, SPARKS[0], 3)
			continue
		var a := since - kat
		var pop: Vector3 = k[2]
		var ps: Vector2 = at.call(pop)
		# ITS POP: a star of light, for a moment
		if a < 0.06:
			_lay(P, o, ps, SPARKS[0], 3)
			var L := 6 if a < 0.03 else 4
			for r in range(2, L + 1):
				var c := SPARKS[0] if r < 4 else SPARKS[1]
				for d in [Vector2(r, 0), Vector2(-r, 0), Vector2(0, r), Vector2(0, -r)]:
					_lay(P, o, ps + d, c)
				if r <= L - 2:
					for d in [Vector2(r, r), Vector2(-r, r), Vector2(r, -r), Vector2(-r, -r)]:
						_lay(P, o, ps + d, SPARKS[1])
		# ITS SHRAPNEL: hot fragments flung out every way, streaked, cooling, gone
		var u := a / float(CFX["shards"])
		if u < 1.0:
			var c := SHARDS[mini(4, floori(u * 5.0))]
			for j in SHARD_N:
				var sb: Vector2 = at.call(_shard_at(k, i, j, maxf(0.0, u - 0.16)))
				var sa: Vector2 = at.call(_shard_at(k, i, j, u))
				var steps := maxi(1, ceili(sa.distance_to(sb)))
				for q in steps:
					_lay(P, o, sb + (sa - sb) * float(q) / steps, SHARDS[mini(4, floori(u * 5.0) + 1)] if u < 0.5 else c)
				_lay(P, o, sa, c, 2 if u < 0.4 else 1)
		# (its smoke, a few puffs drifting up off where it popped)
		for q in 3:
			var life := _c01((a - 0.05 - 0.05 * q) / (float(CFX["long"]) - 0.08 - kat - 0.05 * q))
			if life <= 0.0 or life >= 1.0:
				continue
			var sp := Vector3(pop.x + (GP.hash(i, 20 + q, 7913) - 0.5) * 12.0 - 5.0 * life, pop.y + (GP.hash(i, 23 + q, 7913) - 0.5) * 12.0, pop.z + 16.0 * life)
			_lay(P, o, at.call(sp), SMOKE[0] if life < 0.4 else SMOKE[1], 2 if life < 0.5 else 1)


## THE HUSH'S GREY FOG, a patch where it lies (its clock below 0: where it will fall, marked as the Hush breathes in).
static func _fog(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var r0: float = KG.FOG["r"]
	if t < 0.0:
		GW.fan(P, at, Vector2(1, 0), 1, -PI, PI, r0, _c01(1.0 + t / float(KG.FOG["warn"])), P._clock)
		return
	var a := KG.smooth_in(0.0, 0.3, t) * (1.0 - KG.smooth_in(float(p["dur"]) - 1.0, float(p["dur"]), t))
	for i in 260:
		# (wisps drifting round in it, thicker in the middle)
		var r := r0 * sqrt(GP.hash(i, 1, 7921))
		var ang: float = GP.hash(i, 2, 7922) * TAU + P._clock * (0.3 + 0.4 * GP.hash(i, 3, 7923)) * (1.0 if i % 2 == 1 else -1.0)
		var s := GP.at(at.x + cos(ang) * r, at.y + sin(ang) * r)
		var up := 1.0 + 5.0 * GP.hash(i, 4, 7924)
		GP.dot(P, s.x, s.y - up, FOG[1 + floori(GP.hash(i, 5, 7925) * 4.0)], 2, 1, a * (0.35 + 0.4 * (1.0 - r / r0)))


# --- among what stands ---

## Several pictures of a mark among what stands, under `prefix` and a number each: [picture, at, depth, flip, high, seen]; those
## no longer wanted hidden.
static func _many(P, p: Dictionary, prefix: String, list: Array) -> void:
	for i in list.size():
		var q: Array = list[i]
		var key := "%s%d" % [prefix, i]
		P._film_one(p, key, q[0], q[1], q[2], q[3], q[4])
		var s = p.get(key)
		if s != null and is_instance_valid(s):
			s.modulate.a = float(q[5])
	var had := int(p.get(prefix + "n", 0))
	for i in range(list.size(), had):
		_hide(p, "%s%d" % [prefix, i])
	p[prefix + "n"] = maxi(had, list.size())


static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"gking:weight":
			var film := "gk_weight_crown_" + _view(p)
			var k: int = P._film_frame(film, t) if P.has_film(film) else -1
			P._film_one(p, "fx_crown", P._still(film, "stand", k) if k >= 0 else -1, at, at.x + at.y + 2.0, _flip(p))
		"gking:decree":
			var film := "gk_kn_" + _view(p)
			if not P.has_film(film):
				return
			var list: Array = []
			var f := Vector2(p["fx"], p["fy"])
			for k in KG.decree_knights(t, p["a"], p["b"]):
				var w := A1.beside(at, f, int(p["hand"]), k["x"], k["y"])
				var seen := minf(float(k["up"]), float(k["whole"]))
				if seen <= 0.02 or not P._kb_open(w):
					continue
				list.append([P._still(film, "stand", floori(float(k["step"])) % int(KG.DECREE_FX["frames"])), w, w.x + w.y, _flip(p), -(1.0 - float(k["up"])) * 6.0, seen])
			_many(P, p, "fx_kn", list)
		"gking:faces":
			if not P.has_film("gk_face"):
				return
			var list: Array = []
			for f in KG.faces_now(p):
				var w: Vector2 = f["w"]
				# (at its height: a length of the art's up is half a game pixel)
				list.append([P._still("gk_face", "stand", int(f["kind"])), w, w.x + w.y + 0.1, false, float(f["z"]) * 0.5, 1.0 - KG.smooth_in(0.85, 1.0, f["k"])])
			_many(P, p, "fx_face", list)
		"gking:hush":
			_hush(P, p)
		"gking:bird":
			var winding := t < float(KG.BIRD["wind"])
			var film := "gk_bird_winding" if winding else "gk_bird_singing"
			if not P.has_film(film):
				return
			var k := mini(floori(t * 15.0), floori(float(KG.BIRD["wind"]) * 15.0) - 1) if winding else floori(fmod(t - float(KG.BIRD["wind"]), KG.BIRD["song"]) * 15.0)
			P._film_one(p, "fx_bird", P._still(film, "stand", k), at, at.x + at.y)


## THE HUSH at his side: its stand; unwinding into nothing as he dies (its death); wrapped round him, shielding him, drawn over him.
static func _hush(P, p: Dictionary) -> void:
	var art = p.get("hfig")
	if art == null or P.stands == null:
		return
	var f := Vector2(p["fx"], p["fy"])
	var list := "idle"
	var i := 0
	if float(p["c"]) != 0.0:
		list = "die"
		i = floori(float(p["t"]) * art.fps("die"))
		if i >= art.count(0, "die"):
			_hide(p, "fx_hush")
			return
	else:
		var n: int = art.count(0, "idle")
		if n == 0:
			return
		i = floori(P._clock * art.fps("idle")) % n
	var fr: Dictionary = art.frame(f.x, f.y, list, i)
	var s = p.get("fx_hush")
	if s == null or not is_instance_valid(s):
		s = Sprite2D.new()
		s.centered = false
		P.stands.add_child(s)
		p["fx_hush"] = s
	var over := float(p["c"]) == 0.0 and int(p["b"]) == KG.SHIELDS
	var at := Vector2(p["x"], p["y"])
	var depth := at.x + at.y + (0.3 if over else 0.0)
	var scr := Iso.to_screen(at.x, at.y)
	var k: float = fr["scale"]
	s.visible = true
	s.texture = fr["tex"]
	s.flip_h = fr["flip"]
	s.scale = Vector2.ONE * k
	s.position = Vector2(scr.x, depth * 16.0)
	s.offset = fr["offset"] + Vector2(0.0, (scr.y - depth * 16.0) / k)
	s.modulate.a = 0.85 if over else 1.0


# --- over what stands ---

## THE HUSH'S ARMS: shooting out along its line, or holding the hero as it drags him.
static func air(P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "gking:hush" or float(p["c"]) != 0.0 or int(p["b"]) != KG.GRABS:
		return
	var a := float(p["a"])
	var way := Vector2(cos(a), sin(a))
	var out := KG.arms_out(p["d"])
	var done := int(p["done"]) != 0
	if not done and out <= 0.0:
		return
	var from := Vector2(p["x"], p["y"])
	var tip: Vector2 = P.hero.world if done else from + way * out
	var s0 := GP.at(from.x, from.y)
	var s1 := GP.at(tip.x, tip.y)
	var n := maxi(2, ceili(s0.distance_to(s1) / 1.5))
	for side in [-1.5, 1.5]:
		for i in n + 1:
			var u := float(i) / n
			var wob: float = sin(u * 9.0 + P._clock * 14.0 + side) * 1.2
			GP.dot(c, s0.x + (s1.x - s0.x) * u + side, s0.y - 26.0 + (s1.y - 8.0 - (s0.y - 26.0)) * u + wob, FOG[2] if u < 0.85 else FOG[4])
	# (its long fingers at the end)
	for k in 4:
		GP.dot(c, s1.x - 3.0 + k * 2.0, s1.y - 8.0 + (k % 2), FOG[4], 1, 3)


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
