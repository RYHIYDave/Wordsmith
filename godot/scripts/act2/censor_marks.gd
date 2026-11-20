## WHAT THE CENSOR (FLOOR 15'S BOSS) LAYS ON THE FLOOR: perils.gd's marks of kind "a1" (marks.gd hands them here by the first word of
## their names), stepped as his rules step them (game/act1_rules/censor.ts peril) and drawn as render/act1_fx/censor.ts draws them, with
## his blows' own pictures made again (art/censor2_shots.ts: CENSOR2 on, as the game starts) in the game's own pixels:
##   censor:aim     Strike-Through's warning: the line he will draw, from him the way he faces (art/censor_shots.ts drawStrikeAim).
##   censor:slash   where his slash's bristles swept: a calligrapher's stroke of ink across the floor, his right to his left (drawSlashMark).
##   censor:bars    Redaction's bars, his ink's, the page's lines: marked out in pink, the slab's shadow darkening under it, the slab
##                  coming down; slammed, black, glinting, ink bursting up off its sides; lying wet (drawRedaction); LAID TO STAY, his ink
##                  on the floor, hurting whoever stands on it, drying away when there is more than his share. (The slab, and the
##                  shadow under it as it comes, are each painted once as a picture and laid down; what moves is drawn as it moves.)
##   censor:line    Strike-Through's line of ink, a burning head racing out from his brush's point (drawStrikeLine); censor:margin, a
##                  line run across the room from its wall, marked out first as his aim is.
##   censor:hush    the ring of silence rolling out across the room, the city's letters torn up on it, struck through; the veil of grey
##                  behind it, thinning away (drawRoomHush; the veil painted as a picture ten times a second while it spreads).
##   censor:book    as he dies, the book of stolen words bursting on its lectern: its words flying up and away, pink going pale.
## Nothing cyan: the Order's black, the enemy's pink, the Hush's grey.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const CE := preload("res://scripts/act2/censor.gd")

const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (art/censor2_shots.ts INK, DRY, PALE)
const INK: Array[Color] = [Color("#030306"), Color("#0d0c14"), Color("#262436"), Color("#4a4866"), Color("#7a78a0")]
const DRY := Color("#2a2830")
const PALE: Array[Color] = [Color("#3e3852"), Color("#625a7a"), Color("#9890b4"), Color("#c8c2dc"), Color("#ece8f6")]
## (render/act1_fx/censor.ts FREED)
const FREED: Array[Color] = [Color("#7a7468"), Color("#a49c8c"), Color("#cec6b2"), Color("#e8e2d2"), Color("#f6f2e6")]
## (art/censor_shots.ts SLASH_MARK_REACH, SLASH_MARK_HALF, SLASH_MARK_FOR, REDACT_WARN, REDACT_FOR, STRIKE_FOR, ROOM_HUSH_RING,
## ROOM_HUSH_FOR; render/act1_fx/censor.ts SETTLED)
const SLASH_REACH := 1.9
const SLASH_HALF := 55.0
const SLASH_FOR := 1.2
const WARN := 0.6
const LIE := 2.0
const STRIKE_FOR := 1.4
const SPEED := 16.0
const RING := 1.0
const VEIL := 3.0
const SETTLED := 0.45
const HUSHED := Color("#9890b4")


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


static func _acting(src, id: String) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null \
		and str(src.h2.acts()[src.h2.act["i"]]["id"]) == id


# --- stepped ---

static func step(P, p: Dictionary, dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	var hero = P.hero
	match str(p["a1"]):
		"censor:aim":
			if not _acting(src, "censor:strike"):
				p["dur"] = t
		"censor:margin", "censor:line":
			# THE LINE runs out from its start: whoever its head runs through is struck
			if str(p["a1"]) == "censor:margin" and t < 0.0:
				pass
			elif int(p["done"]) == 0:
				var a: float = p["a"]
				var b: float = p["b"]
				var head0 := minf(a, b + SPEED * maxf(0.0, t - dt))
				var head1 := minf(a, b + SPEED * t)
				var r := A1.from_figure(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), int(p["hand"]), hero.world)
				if r.x >= head0 - 0.3 and r.x <= head1 + 0.15 and r.x >= b - 0.2 and absf(r.y) <= float(CE.STRIKE["half"]) + A1.HERO_R * 0.5 and A1.open_to(hero):
					var was: float = hero.life
					P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
					if hero.life < was:
						p["done"] = 1
				if head1 >= a:
					p["done"] = 1
		"censor:bars":
			_bars(P, p, src)
		"censor:hush":
			# THE SILENCE: as its ring passes the hero, wherever he stands in the room, his words go dark
			if int(p["done"]) == 0:
				var reach: float = p["a"]
				var ring := 0.3 + (reach - 0.3) * _sm(t / RING)
				var d: float = hero.world.distance_to(Vector2(p["x"], p["y"]))
				if d > reach:
					if t >= RING:
						p["done"] = 1
				elif d <= ring:
					p["done"] = 1
					if hero.alive:
						hero.hush()
						if src != null and is_instance_valid(src):
							A1.word(src, hero, "Hushed", HUSHED)
	return t < float(p["dur"])


## The bars: his ink's and the page's lines slam down by themselves as their warning ends; laid to stay, whoever stands on them hurt
## every half second (once for all of it: the oldest's step does it); drying away, gone once dried; lying wet, slowing.
static func _bars(P, p: Dictionary, src) -> void:
	var t: float = p["t"]
	var hero = P.hero
	var map = P.hero.monsters.map if P.hero.monsters != null else null
	if int(p["done"]) == 0 and int(p["d"]) == 1 and t >= 0.0:
		p["done"] = 1
		if A1.open_to(hero):
			for b in p["bars"]:
				if CE.under_bar(b, hero.world.x, hero.world.y):
					P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
					break
		hero.kick(2.0 if int(p["c"]) == 2 else 1.0)
		P.sfx.play("slam", linear_to_db(0.6 if int(p["c"]) == 2 else 0.35))
		if src != null and is_instance_valid(src) and not src.dead and src.h2 != null:
			src.h2.lay(src, p)
	if int(p.get("lasting", 0)) == 1 and map != null:
		if float(p["dry"]) >= 0.0:
			if t - float(p["dry"]) >= float(CE.FILL["dry"]):
				p["dur"] = t
			return
		var k := CE._pool_of(map)
		if not k["list"].is_empty() and is_same(k["list"][0], p) and hero.alive and P._clock - float(k["hurt"]) >= float(CE.FILL["tick"]) \
				and CE.inked(map, hero.world.x, hero.world.y):
			k["hurt"] = P._clock
			P._hurt(p, k["dmg"], hero.world)
	# (lying wet: whoever walks in it is slowed by it, until it dries)
	if int(p["done"]) == 0 or t > LIE - 0.5:
		return
	for b in p["bars"]:
		if CE.under_bar(b, hero.world.x, hero.world.y):
			hero.chill_k = maxf(hero.chill_k if hero.chill_t > 0.0 else 0.0, CE.REDACT["slow"])
			hero.chill_t = maxf(hero.chill_t, 0.25)
			break


static func stands(_P, _p: Dictionary) -> void:
	pass


# --- on the floor, under the figures ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"censor:aim":
			if _acting(src, "censor:strike"):
				var W: Array = CE.STRIKE["warn"]
				var k := (float(src.h2.act["t"]) - float(W[0])) / (float(CE.STRIKE["hit"]) - float(W[0]))
				if k > 0.0 and k < 1.0:
					_aim(P, float(p["x"]), float(p["y"]), src.face.x, src.face.y, float(p["a"]), k)
		"censor:slash":
			_slash(P, p, t)
		"censor:bars":
			if int(p.get("lasting", 0)) == 1 and (t >= SETTLED or float(p["dry"]) >= 0.0):
				var fade := 1.0 - _c01((t - float(p["dry"])) / float(CE.FILL["dry"])) if float(p["dry"]) >= 0.0 else 1.0
				_slab(P, p, maxf(t, SETTLED), fade)
			else:
				_redaction(P, p, maxf(t, -WARN * 0.7) if int(p.get("c", 0)) == 2 else t)
		"censor:margin":
			if t < 0.0:
				_aim(P, float(p["x"]), float(p["y"]), float(p["fx"]), float(p["fy"]), float(p["a"]), 1.0 + t / float(CE.INKF["warn"]))
			else:
				_line(P, float(p["x"]), float(p["y"]), float(p["fx"]), float(p["fy"]), float(p["a"]), t)
		"censor:line":
			var b: float = p["b"]
			_line(P, float(p["x"]) + float(p["fx"]) * b, float(p["y"]) + float(p["fy"]) * b, float(p["fx"]), float(p["fy"]), maxf(0.0, float(p["a"]) - b), t)
		"censor:hush":
			_hush(P, p, t)


## drawStrikeAim: the line he will draw, dashes running out from him along it, in the enemy's pink.
static func _aim(c: CanvasItem, x: float, y: float, dx: float, dy: float, reach: float, k: float) -> void:
	if k <= 0.0 or k > 1.0:
		return
	var l := maxf(1e-6, Vector2(dx, dy).length())
	var ux := dx / l
	var uy := dy / l
	var n := ceili(reach / 0.06)
	for i in n:
		var s := (float(i) / n) * reach
		if (floori(s / 0.3 - k * 8.0) & 1) == 0:
			continue
		var q := GP.at(x + ux * s, y + uy * s)
		GP.dot(c, q.x, q.y, FLAME[3] if k > 0.75 else FLAME[2], 2, 1, (0.45 + 0.55 * k) * (1.0 - 0.4 * (s / reach)))


## drawSlashMark (censor2): from his right to his left as his picture has it (mirrored about the way he faced where he is drawn with
## his left the world's: render/act1_fx/censor.ts `mirrored`).
static func _slash(c: CanvasItem, p: Dictionary, t: float) -> void:
	if t < 0.0 or t >= SLASH_FOR:
		return
	var x: float = p["x"]
	var y: float = p["y"]
	var f := Vector2(p["fx"], p["fy"])
	var mirror := int(p["hand"]) == 1
	var at := func(wx: float, wy: float) -> Vector2:
		if mirror:
			var d := Vector2(wx - x, wy - y)
			var u := d.dot(f)
			return GP.at(x + 2.0 * u * f.x - d.x, y + 2.0 * u * f.y - d.y)
		return GP.at(wx, wy)
	var face := atan2(f.y, f.x)
	var half := deg_to_rad(SLASH_HALF + 8.0)
	var laid := _sm(t / 0.08)
	var dry := _sm((t - (SLASH_FOR - 0.5)) / 0.5)
	var N := 90
	for i in N + 1:
		var u := float(i) / N
		if u > laid:
			break
		var a := face - half + 2.0 * half * u
		var thick := 0.42 * sin(PI * minf(1.0, 0.15 + u * 0.95)) * (1.1 - u * 0.5) + 0.05
		var R := SLASH_REACH + 0.25 * sin(u * 3.0)
		for j in range(-6, 7):
			if u > 0.62 and GP.hash(i, j, 8611) < (u - 0.62) * 2.2:
				continue
			if GP.hash(i * 7, j, 8612) < dry:
				continue
			var r := R + (j / 6.0) * thick
			var q: Vector2 = at.call(x + cos(a) * r, y + sin(a) * r)
			var edge := absi(j) == 6
			var sheen := j == -3 and i % 9 < 5 and dry < 0.3
			GP.dot(c, q.x, q.y, FLAME[2] if (edge and t < 0.35) else (INK[3] if sheen else (DRY if dry > 0.5 else INK[(i + j) & 1])))
	# (drops flung beyond it)
	for i in 26:
		var u := GP.hash(i, 1, 8613)
		if u > laid or GP.hash(i, 2, 8613) < dry:
			continue
		var a := face - half + 2.0 * half * u
		var r := SLASH_REACH + 0.5 + 0.9 * GP.hash(i, 3, 8613)
		var q: Vector2 = at.call(x + cos(a) * r, y + sin(a) * r)
		GP.dot(c, q.x, q.y, INK[0], 2 if i % 3 == 0 else 1, 1)


## drawStrikeLine (censor2): a burning head racing out, a wet stroke behind it thinning to its end; drying away.
static func _line(c: CanvasItem, x: float, y: float, dx: float, dy: float, reach: float, t: float) -> void:
	if t < 0.0 or t >= STRIKE_FOR:
		return
	var l := maxf(1e-6, Vector2(dx, dy).length())
	var ux := dx / l
	var uy := dy / l
	var head := minf(reach, SPEED * t)
	var dry := _sm((t - (STRIKE_FOR - 0.5)) / 0.5)
	var n := ceili(head / 0.04)
	for i in n:
		var s := (float(i) / n) * head
		if GP.hash(i, 1, 8631) < dry:
			continue
		var w := 0.16 * (1.0 - (s / maxf(reach, 1.0)) * 0.6)
		for o in [-w, -w / 2.0, 0.0, w / 2.0, w]:
			var q := GP.at(x + ux * s - uy * o, y + uy * s + ux * o)
			var edge := absf(o) == w
			var col: Color
			if dry > 0.5:
				col = DRY
			elif edge and t < 0.6:
				col = FLAME[2] if GP.hash(i, 2, 8632) < 0.4 else INK[0]
			else:
				col = INK[3] if (o == -w / 2.0 and i % 11 < 6) else INK[0]
			GP.dot(c, q.x, q.y - 1.0, col)
	# (its head: burning, spitting sparks and drops as it races)
	if head < reach and t < reach / SPEED + 0.02:
		var h := GP.at(x + ux * head, y + uy * head)
		GP.dot(c, h.x - 2.0, h.y - 3.0, FLAME[3], 4, 3)
		GP.dot(c, h.x - 1.0, h.y - 3.0, FLAME[4], 2, 2)
		for i in 12:
			var back := 0.1 + 0.8 * GP.hash(i, floori(t * 40.0), 8633)
			var o := (GP.hash(i, floori(t * 40.0) + 1, 8633) - 0.5) * 0.7
			var q := GP.at(x + ux * (head - back) - uy * o, y + uy * (head - back) + ux * o)
			var up := 6.0 * GP.hash(i, 3, 8633) * (1.0 - back)
			GP.dot(c, q.x, q.y - 2.0 - up, INK[0] if i % 3 == 0 else (FLAME[3] if i % 3 == 1 else FLAME[2]))


# --- Redaction's bars (drawRedaction, censor2) ---

## A bar's point `u` along it and `v` across it, in game pixels.
static func _pt(b: Dictionary, u: float, v: float) -> Vector2:
	return GP.at(float(b["x"]) + u, float(b["y"]) + v) if int(b["along"]) == 0 else GP.at(float(b["x"]) + v, float(b["y"]) + u)


## Its outline, `lift` game pixels up, dashed and marching (`step`) or whole.
static func _outline(c: CanvasItem, b: Dictionary, n: int, t: float, lift: float, col: Color, alpha: float, step: bool) -> void:
	var long: float = b["long"]
	var wide: float = b["wide"]
	var L := long / 2.0
	var Wd := wide / 2.0
	var per := ceili((2.0 * (long + wide)) / 0.08)
	for i in per:
		var s := (float(i) / per) * 2.0 * (long + wide)
		if step and (floori(s / 0.24 + t * 6.0 + n) & 1) == 0:
			continue
		var u: float
		var v: float
		if s < long:
			u = -L + s
			v = -Wd
		elif s < long + wide:
			u = L
			v = -Wd + (s - long)
		elif s < 2.0 * long + wide:
			u = L - (s - long - wide)
			v = Wd
		else:
			u = -L
			v = Wd - (s - 2.0 * long - wide)
		var q := _pt(b, u, v)
		GP.dot(c, q.x, q.y - lift, col, 1, 1, alpha)


## The pictures of a set of bars, painted once (game pixels, then laid down at twice): `shade`, the floor darkening under the slab
## as it comes (its dither as full as it comes: drawn the more as the slam nears); `slab`, the slab slammed and settled, black, its
## sheen, its rim. {tex, at (top left, game pixels)}.
static func _picture(p: Dictionary, what: String) -> Dictionary:
	var key := "pic_" + what
	if p.has(key):
		return p[key]
	var bars: Array = p["bars"]
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for b in bars:
		for cu in [-1.0, 1.0]:
			for cv in [-1.0, 1.0]:
				var q := _pt(b, cu * (float(b["long"]) / 2.0 + 0.1), cv * (float(b["wide"]) / 2.0 + 0.2))
				lo = Vector2(minf(lo.x, q.x), minf(lo.y, q.y))
				hi = Vector2(maxf(hi.x, q.x), maxf(hi.y, q.y))
	if lo.x > hi.x:
		p[key] = {}
		return p[key]
	var o := Vector2(floorf(lo.x) - 2.0, floorf(lo.y) - 4.0)
	var img := Image.create_empty(int(hi.x - o.x) + 4, int(hi.y - o.y) + 4, false, Image.FORMAT_RGBA8)
	var W := img.get_width()
	var H := img.get_height()
	for n in bars.size():
		var b: Dictionary = bars[n]
		var L := float(b["long"]) / 2.0
		var Wd := float(b["wide"]) / 2.0
		var cols := ceili(float(b["long"]) * 18.0)
		if what == "shade":
			for i in cols:
				for j in ceili(float(b["wide"]) * 18.0):
					if GP.hash(i, j + n * 97, 8621) > 0.3:
						continue
					var q := _pt(b, -L + (i + 0.5) / 18.0, -Wd + (j + 0.5) / 18.0) - o
					var X := GP.rnd(q.x)
					var Y := GP.rnd(q.y)
					if X >= 0 and Y >= 0 and X < W and Y < H:
						img.set_pixel(X, Y, INK[1])
		else:
			for i in cols:
				var u := -L + (i + 0.5) / 18.0
				var rag := 0.07 * sin(i * 1.7 + n) + 0.04 * sin(i * 0.5 + n * 3)
				for j in range(-2, ceili(float(b["wide"]) * 18.0) + 2):
					var v := -Wd + (j + 0.5) / 18.0
					if absf(v) > Wd + rag:
						continue
					var q := _pt(b, u, v) - o
					var X := GP.rnd(q.x)
					var Y := GP.rnd(q.y)
					if X < 0 or Y < 0 or X >= W or Y >= H:
						continue
					var rim := absf(v) > Wd + rag - 0.07
					var band := absf(v + Wd * 0.35) < 0.05
					var col: Color = (FLAME[1] if GP.hash(i, j, 8623) < 0.25 else INK[0]) if rim else (INK[3] if band else INK[(i + j) & 1])
					img.set_pixel(X, Y, col)
	p[key] = {"tex": ImageTexture.create_from_image(img), "at": o, "size": Vector2(W, H)}
	return p[key]


static func _lay_picture(c: CanvasItem, pic: Dictionary, alpha: float) -> void:
	if pic.is_empty() or alpha <= 0.0:
		return
	c.draw_texture_rect(pic["tex"], Rect2(pic["at"] * 2.0, pic["size"] * 2.0), false, Color(1, 1, 1, minf(1.0, alpha)))


## REDACTION'S BARS, `t` seconds from their slam (from -WARN): marked, the slab coming down, slammed, wet, dried away.
static func _redaction(c: CanvasItem, p: Dictionary, t: float) -> void:
	if t < -WARN or t >= LIE:
		return
	var bars: Array = p["bars"]
	if t < 0.0:
		# THE WARNING: its place marked in pink, marching; the floor under it darkening, the slab's shadow; THE SLAB ITSELF coming down
		# from above, its edges a dim pink, nearer as the slam comes
		var k := 1.0 - (-t / WARN)
		_lay_picture(c, _picture(p, "shade"), 0.7 * k * k)
		for n in bars.size():
			var b: Dictionary = bars[n]
			_outline(c, b, n, t, 0.0, FLAME[3] if k > 0.7 else FLAME[2], 0.55 + 0.45 * k, true)
			_outline(c, b, n, t, (1.0 - k) * 46.0 + 6.0, FLAME[1] if k > 0.6 else Color("#4a1838"), 0.35 + 0.5 * k, false)
		return
	_slab(c, p, t, 1.0 - _sm((t - (LIE - 0.5)) / 0.5) if int(p.get("lasting", 0)) == 0 else 1.0)


## THE SLAB slammed down: its picture laid; while it is fresh its rim burning gold; its sheen's glint sliding along it; ink bursting
## up off its sides.
static func _slab(c: CanvasItem, p: Dictionary, t: float, alpha: float) -> void:
	_lay_picture(c, _picture(p, "slab"), alpha)
	var bars: Array = p["bars"]
	var dry_late := alpha < 0.999
	for n in bars.size():
		var b: Dictionary = bars[n]
		var L := float(b["long"]) / 2.0
		var Wd := float(b["wide"]) / 2.0
		var cols := ceili(float(b["long"]) * 18.0)
		# (the wet sheen's glint sliding along it)
		if not dry_late:
			for i in cols:
				var u := -L + (i + 0.5) / 18.0
				if absf(fmod((u + L) / float(b["long"]) + t * 0.35 + n * 0.3, 1.0) - 0.5) >= 0.06:
					continue
				for j in range(-2, ceili(float(b["wide"]) * 18.0) + 2):
					var v := -Wd + (j + 0.5) / 18.0
					if absf(v + Wd * 0.35) < 0.05:
						var q := _pt(b, u, v)
						GP.dot(c, q.x, q.y, INK[4])
		# (fresh: its rim burning)
		if t < 0.25:
			for i in cols:
				var u := -L + (i + 0.5) / 18.0
				var rag := 0.07 * sin(i * 1.7 + n) + 0.04 * sin(i * 0.5 + n * 3)
				for sd in [-1.0, 1.0]:
					var q := _pt(b, u, sd * (Wd + rag - 0.03))
					GP.dot(c, q.x, q.y, FLAME[3])
		# (the burst: a sheet of drops thrown up off its two long sides, arcing out and falling)
		if t < 0.55:
			var qq := t / 0.55
			for i in roundi(float(b["long"]) * 7.0):
				var side := 1.0 if i % 2 == 1 else -1.0
				var u := -L + float(b["long"]) * GP.hash(i, n, 8624)
				var out := Wd + 0.1 + (0.4 + 0.6 * GP.hash(i, n + 1, 8624)) * _sm(qq * 1.4)
				var q := _pt(b, u, side * out)
				var up := 14.0 * GP.hash(i, n + 2, 8624) * sin(PI * minf(1.0, qq * 1.3))
				var a := 1.0 - _sm((qq - 0.7) / 0.3)
				GP.dot(c, q.x, q.y - up, INK[0] if up > 6.0 else INK[1], 2 if i % 3 == 0 else 1, 2, a)
				if i % 5 == 0 and up > 4.0:
					GP.dot(c, q.x, q.y - up, FLAME[2], 1, 1, a)


# --- the Hush (drawRoomHush, censor2) ---

## The veil behind the ring: a sparse grey over the floor within `R` of (x, y), as a picture (painted again ten times a second while
## it spreads; laid down whole after).
static func _veil(p: Dictionary, x: float, y: float, R: float) -> Dictionary:
	var key := snappedf(R, 0.1)
	if p.has("veil") and float(p["veil"]["R"]) == key:
		return p["veil"]
	var cells := ceili(R * 10.0)
	var lo := GP.at(x, y) - Vector2(R * 23.0 + 4.0, R * 12.0 + 4.0)
	var W := int(R * 46.0) + 10
	var H := int(R * 24.0) + 10
	var img := Image.create_empty(maxi(1, W), maxi(1, H), false, Image.FORMAT_RGBA8)
	for i in range(-cells, cells + 1):
		for j in range(-cells, cells + 1):
			var u := i / 10.0
			var v := j / 10.0
			if u * u + v * v > R * R:
				continue
			if GP.hash(i, j, 8644) > 0.18:
				continue
			var q := GP.at(x + u, y + v) - lo
			var X := GP.rnd(q.x)
			var Y := GP.rnd(q.y)
			if X < 0 or Y < 0 or X + 1 >= W or Y >= H:
				continue
			var col: Color = PALE[0] if GP.hash(i, j, 8645) < 0.5 else PALE[1]
			img.set_pixel(X, Y, col)
			img.set_pixel(X + 1, Y, col)
	p["veil"] = {"R": key, "tex": ImageTexture.create_from_image(img), "at": lo, "size": Vector2(W, H)}
	return p["veil"]


static func _hush(c: CanvasItem, p: Dictionary, t: float) -> void:
	if t < 0.0 or t >= VEIL:
		return
	var x: float = p["x"]
	var y: float = p["y"]
	var reach: float = p["a"]
	var R := 0.3 + (reach - 0.3) * _sm(t / RING)
	var fade := 1.0 - _sm((t - (VEIL - 1.0)) / 1.0)
	# (the veil behind it: a sparse grey drifting over the floor)
	var veil := _veil(p, x, y, R if t < RING else reach)
	_lay_picture(c, veil, 0.55 * fade)
	if t < RING + 0.35:
		var out := _sm((t - RING) / 0.35)
		# (its front: a pale band)
		var n := ceili(R * 50.0)
		for k in 2:
			var r := R - k * 0.1
			for i in n:
				if GP.hash(i, k + floori(t * 24.0) * 3, 8641) < 0.2 + 0.7 * out:
					continue
				var a := (float(i) / n) * TAU
				var q := GP.at(x + cos(a) * r, y + sin(a) * r)
				GP.dot(c, q.x, q.y - 1.0, PALE[4 - k], 2, 1, 0.9 - 0.3 * k)
		# (the letters torn up and blown along on it, each struck through)
		var m := ceili(R * 7.0)
		for i in m:
			if GP.hash(i, 3, 8642) < out:
				continue
			var a := (float(i) / m) * TAU + GP.hash(i, 1, 8642) * 0.3
			var r := R - 0.15 - 0.45 * GP.hash(i, 2, 8642)
			var q := GP.at(x + cos(a) * r, y + sin(a) * r)
			var lift := 3.0 + 6.0 * GP.hash(i, 4, 8642)
			for cc in 3:
				for rr in 4:
					if GP.hash(i * 5 + cc, rr, 8643) > 0.45:
						GP.dot(c, q.x + cc - 1.0, q.y - lift - rr, PALE[3], 1, 1, 0.95)
			GP.dot(c, q.x - 2.0, q.y - lift - 2.0, INK[0], 5, 1, 0.95)


# --- over what stands ---

## As he dies: THE BOOK OF STOLEN WORDS BURSTING, its words flying up out of it and away, pink going pale.
static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "censor:book":
		return
	var t: float = p["t"]
	var s := GP.at(float(p["x"]), float(p["y"]))
	var oy := s.y - 22.0
	for i in 64:
		var life := (t - 0.012 * i) / (CE.BOOK_FLY - 0.8)
		if life <= 0.0 or life >= 1.0:
			continue
		var a := i * 2.39996
		var out := (6.0 + 30.0 * GP.hash(i, 1, 9151)) * _sm(life * 1.6)
		var up := (20.0 + 70.0 * GP.hash(i, 2, 9151)) * life + 10.0 * sin(PI * minf(1.0, life * 2.0))
		var X := s.x + cos(a + life * 1.5) * out
		var Y := oy - up + sin(a + life * 1.5) * out * 0.5
		var pale := life > 0.3 + 0.3 * GP.hash(i, 3, 9151)
		var col: Color = (FREED[4] if life > 0.8 else (FREED[3] if life > 0.6 else FREED[2])) if pale else (FLAME[3] if life < 0.15 else FLAME[2])
		GP.dot(c, X, Y, col, 2 if life < 0.4 else 1, 1, 1.0 - _sm((life - 0.75) / 0.25))


## (a flash of their light as the book bursts)
static func spots(P, p: Dictionary) -> void:
	if str(p["a1"]) != "censor:book":
		return
	var t: float = p["t"]
	if t < 0.6:
		var s: Vector2 = P._px(Vector2(p["x"], p["y"]))
		P.look.spot(Vector2(s.x, s.y - 22.0), 40.0 + 60.0 * t, 0.9 * (1.0 - t / 0.6))


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
