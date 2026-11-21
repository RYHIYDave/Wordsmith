## WHAT THE PHYSICIAN (FLOOR 14'S BOSS) LAYS ON THE FLOOR, SENDS OVER IT AND TAKES: perils.gd's marks of kind "a1" (marks.gd hands
## them here by the first word of their names), stepped as his rules step them (game/act1_rules/physician.ts peril) and drawn as
## render/act1_fx/physician.ts ACTION draws them, with the art's own painters (art/physician_action_fx.ts, physician_shots.ts)
## brought over line for line, each pixel straight onto the screen:
##   physician:rapmark     while he raps (its clock his act's): the line and the star marked as the cane is held up; the ferrule
##                         cracking the boards, its star of cracks, dust and chips (paintRap).
##   physician:drawmark    the Draw's lane marked down the floor, the needle of pink light thrust down it, the word's light pulled
##                         back up it (paintDraw).
##   physician:roundsmark  the reach of his rings marked round him; the great rings of the Hush rolling out (paintRounds).
##   physician:look        through his Diagnosis: the mark round the hero, filling (paintMark); over the dark, the lens's beam over
##                         the floor, cut off behind what cannot be walked through, its edges brass-gold; its shaft to the hero;
##                         the dial over the hero's head (paintDial).
##   physician:op          HE OPERATES (`hit` the strike): the field marked, burnt in, scorched (paintField); THE THEATRE PLUNGED
##                         DARK, one hard spotlight on the field (render.ts light: opDark); over the dark its cone from his lens and
##                         its hard edge, his instruments flung out, held round it glinting, closing in smeared, stuck in the boards
##                         and flown home (toolsAt: the game's films ph_tool_<k>, ph_glint_<k>), the burst where they meet, the light
##                         burnt down through the lens; struck at `hit`, whoever is within the field.
##   physician:held        THE WORD HE HOLDS of the hero's, over his head from as he pushed the plunger home (drawHeldWord), a light of
##                         it in the dark; gone as it goes back.
##   physician:freed       the word beaten back out of him, flying home to the hero (drawWordFreed).
## Every colour is the art's: the enemy's pink and gold, warm brass and pale light, the Hush's greys. Never cyan: a word of the
## hero's takes its own colour only as it comes home to him.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const PH := preload("res://scripts/act2/physician.gd")
const Perils := preload("res://scripts/perils.gd")

const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (art/physician_action.ts LIGHT)
const PALE_L := Color("#f4ecd2")
const WARM := Color("#ffe4a6")
const WHITE := Color("#fff8e6")
## (art/physician_action_fx.ts HUSH, PALE, SCORCH, DUST, INK)
const HUSH: Array[Color] = [Color("#14121e"), Color("#262234"), Color("#3e3852"), Color("#625a7a"), Color("#9890b4")]
const PALE := Color("#c8c2dc")
const SCORCH: Array[Color] = [Color("#0a0608"), Color("#2a1410"), Color("#5a2a18")]
const DUST: Array[Color] = [Color("#4a4438"), Color("#6e6656"), Color("#958c78"), Color("#b4ab94")]
const INK := Color("#0b0910")
## (art/physician_shots.ts INK, HELD_CELL)
const SEAM := Color("#0e0c24")
const CELL := 2.0
const NEEDLE_TIP := Color("#fff4e8")
const DIAL_BRASS: Array[Color] = [Color("#38280f"), Color("#a07a36"), Color("#ecca7c")]
## (art/physician_action_fx.ts OPERATION; TOOL_LONG)
const OP := {"count": 12, "out": 0.12, "high": 30.0, "size": 1.35, "fly": [0.1, 0.45], "draw": 1.0, "back": 0.3, "meet": 0.3, "stuck": 0.1,
	"sink": 0.62, "pull": 60.0 / 30.0, "home": 70.0 / 30.0}
const TOOL_LONG := 38.0
const TOOL_KINDS := 5
## (render/act1_fx/physician.ts STONES: the held word hung clear of the rune stones of the words his death will leave)
const STONES := 35.0 + 6.0 + 13.0 + 1.0 + 1.5 + 8.0 + 2.0


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _acting(src, id: String) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null \
		and str(src.h2.acts()[src.h2.act["i"]]["id"]) == id


static func step(P, p: Dictionary, _dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"physician:rapmark":
			if not _acting(src, "physician:rap"):
				p["dur"] = t
		"physician:drawmark":
			if not _acting(src, "physician:draw"):
				p["dur"] = t
		"physician:roundsmark":
			if not _acting(src, "physician:rounds"):
				p["dur"] = t
		"physician:look":
			if not _acting(src, "physician:diagnose"):
				p["dur"] = t
		"physician:held":
			if src == null or not is_instance_valid(src) or src.dead or src.h2 == null or src.h2.held_word() != str(p["w"]):
				p["dur"] = t
		"physician:op":
			_dark(P, p)
			if int(p["done"]) == 0 and t >= float(p["hit"]):
				# THE ONE HUGE STRIKE: his instruments close in on the field from all round
				p["done"] = 1
				var hero = P.hero
				if hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(PH.FIELD["r"]) and A1.open_to(hero):
					P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
				hero.kick(8.0)
				P.sfx.play("slam", 0.0)
	return t < float(p["dur"])


static func stands(_P, _p: Dictionary) -> void:
	pass


# --- the art's `at` ---

## (the painters' frame: one at `_O` facing `_F`, drawn with `_H` (picAtFacing); or the floor itself, world points (picAt))
static var _O := Vector2.ZERO
static var _F := Vector2(1, 0)
static var _H := 1
static var _face := false


static func _facing(src, hand: int) -> void:
	_O = src.world
	_F = src.face
	_H = hand
	_face = true


static func _world() -> void:
	_face = false


## Where a floor point (tiles: the art's, before him along x, his left along -y; or the floor's own) and a height over it (picture
## pixels) is on the screen.
static func _at(x: float, y: float, z := 0.0) -> Vector2:
	var s: Vector2
	if _face:
		s = Iso.to_screen(_O.x + _F.x * x - _F.y * _H * y, _O.y + _F.y * x + _F.x * _H * y)
	else:
		s = Iso.to_screen(x, y)
	return Vector2(s.x, s.y - z)


## spot: a floor point `fwd` tiles before him and `left` to his left, as the art writes it (seen from in front).
static func _sp(fwd: float, left: float) -> Vector2:
	return Vector2(fwd, -left)


## dot: a `w` by `h` block of picture pixels at (x, y), whole.
static func _dot(c: CanvasItem, x: float, y: float, col: Color, w := 1.0, h := 1.0) -> void:
	c.draw_rect(Rect2(GP.rnd(x), GP.rnd(y), w, h), col)


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _sm(v: float) -> float:
	var k := clampf(v, 0.0, 1.0)
	return k * k * (3.0 - 2.0 * k)


static func _run(t: float, until: float) -> float:
	return t * (2.0 + 3.0 * _c01(t / maxf(0.1, until)))


## A dashed line on the floor from a to b: dashes running along it by `run`, lit by `lit`.
static func _dashes(c: CanvasItem, a: Vector2, b: Vector2, lit: float, run: float, hot: bool, step := 0.04) -> void:
	var L := a.distance_to(b)
	var d := 0.0
	while d <= L:
		if fposmod(d * 2.2 - run, 1.0) <= 0.6:
			var u := d / maxf(1e-6, L)
			var P := _at(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u)
			if not (lit < 0.5 and GP.hash(GP.rnd(P.x), GP.rnd(P.y), 7901) > lit * 2.0):
				_dot(c, P.x, P.y, FLAME[3] if hot else FLAME[2], 2, 2)
				_dot(c, P.x, P.y + 2.0, FLAME[0], 2, 1)
		d += step


## A dashed circle on the floor round (cx, cy), `r` tiles.
static func _ring(c: CanvasItem, cx: float, cy: float, r: float, lit: float, run: float, hot: bool) -> void:
	var n := maxi(24, GP.rnd(r * 60.0))
	for i in n:
		var u := float(i) / n
		if fposmod(u * maxf(12.0, r * 9.0) + run, 1.0) > 0.55:
			continue
		var P := _at(cx + cos(u * TAU) * r, cy + sin(u * TAU) * r)
		if lit < 0.5 and GP.hash(i, 3, 7903) > lit * 2.0:
			continue
		_dot(c, P.x, P.y, FLAME[3] if hot else FLAME[2], 2, 2)
		_dot(c, P.x, P.y + 2.0, FLAME[0], 2, 1)


# --- on the floor, under the figures ---

static func draw(P, p: Dictionary) -> void:
	var src = p.get("src")
	match str(p["a1"]):
		"physician:rapmark":
			if _acting(src, "physician:rap"):
				_facing(src, src.h2.act["hand"])
				_rap(P, float(src.h2.act["t"]))
		"physician:drawmark":
			if _acting(src, "physician:draw"):
				_facing(src, src.h2.act["hand"])
				_draw_lane(P, float(src.h2.act["t"]))
		"physician:roundsmark":
			if _acting(src, "physician:rounds"):
				_facing(src, src.h2.act["hand"])
				_rounds(P, float(src.h2.act["t"]))
		"physician:look":
			if _acting(src, "physician:diagnose") and int(src.h2.a1.get("dOn", 0)) == 1:
				# THE MARK round the hero, filling
				var h: Vector2 = P.hero.world
				_world()
				_mark(P, h.x, h.y, float(src.h2.a1.get("dFill", 0.0)), int(src.h2.a1.get("dLit", 0)) == 1, floorf(float(p["t"]) * 15.0) / 15.0)
		"physician:op":
			_world()
			_field(P, float(p["x"]), float(p["y"]), float(p["t"]), int(p["c"]))


## paintRap.
static func _rap(c: CanvasItem, m: float) -> void:
	var R: Dictionary = PH.RAP
	var S := _sp(R["ahead"], R["left"])
	var hold0: float = PH.RAP9_HOLD[0]
	var hit := PH.RAP9_HIT
	if m >= hold0 - 0.15 and m < hit:
		var k := _c01((m - hold0 + 0.15) / 0.2)
		var run := _run(m - hold0, hit - hold0)
		var hot := m > hit - 0.2
		_dashes(c, _sp(0.3, R["left"]), S, k, run, hot)
		_ring(c, S.x, S.y, float(R["r"]) * (0.4 + 0.6 * k), k, run, hot)
		_ring(c, S.x, S.y, 0.35, k, -run, true)
	var s := m - hit
	if s < 0.0 or s > float(R["lie"]):
		return
	var fade := 1.0 - s / float(R["lie"])
	# the star of cracks, run out to the star's edge in a tenth of a second
	for i in 9:
		var a := (i / 9.0) * TAU + GP.hash(i, 0, 7911) * 0.5
		var reach := float(R["r"]) * (0.75 + 0.25 * GP.hash(i, 1, 7911)) * _c01(s / 0.1)
		var x := S.x
		var y := S.y
		var n := ceili(reach / 0.04)
		for k in n:
			var jog := (GP.hash(i, k >> 2, 7912) - 0.5) * 0.9
			x += cos(a + jog) * 0.04
			y += sin(a + jog) * 0.04
			if GP.hash(i, k, 7913) > fade + 0.15:
				continue
			var Q := _at(x, y)
			_dot(c, Q.x, Q.y, FLAME[3] if s < 0.15 else INK, 2 if k < n * 0.4 else 1, 1)
			if s < 0.25 and k < n * 0.6:
				_dot(c, Q.x, Q.y - 1.0, FLAME[2])
	# a ring of dust rolling out to the star's edge
	if s < 0.4:
		var r := float(R["r"]) * _sm(s / 0.25)
		var n := GP.rnd(r * 70.0) + 12
		for i in n:
			if GP.hash(i, floori(s * 30.0), 7914) < s * 1.8:
				continue
			var a := (float(i) / n) * TAU
			var Q := _at(S.x + cos(a) * r, S.y + sin(a) * r)
			_dot(c, Q.x, Q.y - 2.0, DUST[2 + (i % 2)], 2, 1)
			_dot(c, Q.x, Q.y - 1.0, DUST[1], 2, 1)
	# chips and dust thrown up and down again
	if s < 0.5:
		var q := s / 0.5
		for i in 26:
			var a := i * 2.39996
			var sp := 0.4 + 0.6 * GP.hash(i, 2, 7915)
			var r := 0.1 + 0.9 * sqrt(q) * sp
			var Q := _at(S.x + cos(a) * r, S.y + sin(a) * r, 26.0 * sp * 4.0 * q * (1.0 - q))
			_dot(c, Q.x, Q.y, FLAME[3] if i % 5 == 0 else DUST[i % 4], 2 if i % 3 == 0 else 1, 1)


## paintDraw.
static func _draw_lane(c: CanvasItem, m: float) -> void:
	var U: Dictionary = PH.LUNGE
	var to: float = U["to"]
	var half: float = U["half"]
	var E := _sp(to, 0.0)
	var hold0: float = PH.DRAW9_HOLD[0]
	var hit := PH.DRAW9_HIT
	if m >= hold0 - 0.2 and m < hit:
		var k := _c01((m - hold0 + 0.2) / 0.25)
		var run := _run(m - hold0, hit - hold0)
		var hot := m > hit - 0.2
		var L := to * (0.3 + 0.7 * k)
		for side in [-1.0, 1.0]:
			_dashes(c, _sp(0.4, side * half), _sp(L, side * half), k, run, hot)
		_dashes(c, _sp(L, -half), _sp(L, half), k, run, true)
		# its point: a diamond at the lane's end
		var e := _sp(L, 0.0)
		var Q := _at(e.x, e.y)
		_dot(c, Q.x - 3.0, Q.y, FLAME[3], 7, 1)
		_dot(c, Q.x - 1.0, Q.y - 1.0, FLAME[3], 3, 3)
	var s := m - hit
	# THE NEEDLE: thrust out down the lane in two frames (from the quill, 2 tiles out, to its end), then thinning
	if s >= -1.0 / 30.0 and s < float(U["needle"]):
		var out := _c01((s + 1.0 / 30.0) / (2.0 / 30.0))
		var fade := 1.0 - _c01(s / float(U["needle"]))
		var from := _sp(1.0, 0.0)
		var end := from + (E - from) * out
		var L := from.distance_to(end)
		var d := 0.0
		while d <= L:
			if GP.hash(GP.rnd(d * 50.0), 1, 7921) <= fade + 0.2:
				var u := d / maxf(1e-6, L)
				var w := from + (end - from) * u
				var Q := _at(w.x, w.y, 34.0 * (1.0 - 0.35 * (d / to)))
				_dot(c, Q.x, Q.y, NEEDLE_TIP if u > 0.92 else (FLAME[3] if u > 0.6 else FLAME[2]), 2, 1)
				_dot(c, Q.x, Q.y + 1.0, FLAME[1], 2, 1)
			d += 0.02
		# the lane flashes along the floor under it
		d = 0.0
		while d <= L:
			if GP.hash(GP.rnd(d * 20.0), 2, 7922) <= 0.6 * fade:
				var u := d / maxf(1e-6, L)
				for side in [-1.0, 1.0]:
					var q := _sp(1.0 + (to - 1.0) * out * u, side * half * (0.6 + 0.4 * GP.hash(GP.rnd(d * 20.0), 3, 7922)))
					var Q := _at(q.x, q.y)
					_dot(c, Q.x, Q.y, FLAME[2])
			d += 0.05
	# THE WORD'S LIGHT pulled back up the lane to him while he draws
	var f0: float = PH.DRAW9["fill"][0]
	var f1: float = PH.DRAW9["fill"][1]
	if m > f0 - 0.1 and m < f1:
		var k := (m - f0 + 0.1) / (f1 - f0 + 0.1)
		for i in 14:
			var life := fmod(k * 2.2 + i / 14.0, 1.0)
			var q := _sp(2.3 + (to - 2.3) * (1.0 - life), (GP.hash(i, 4, 7923) - 0.5) * 0.3)
			var Q := _at(q.x, q.y, 30.0 + 6.0 * sin(life * 9.0 + i))
			_dot(c, Q.x, Q.y, NEEDLE_TIP if life > 0.7 else (FLAME[3] if life > 0.35 else FLAME[2]), 2, 2)


## paintRounds.
static func _rounds(c: CanvasItem, m: float) -> void:
	var G: Dictionary = PH.RINGS
	var S := _sp(G["ahead"], G["left"])
	var hits: Array = PH.ROUNDS9_HITS
	var hold0: float = PH.ROUNDS9_HOLD[0]
	# while he holds the cane up: the reach marked round him
	if m >= hold0 - 0.2 and m < float(hits[2]):
		var k := _c01((m - hold0 + 0.2) / 0.3)
		_ring(c, S.x, S.y, G["reach"], k * 0.9, _run(m, hits[0]), m > float(hits[0]) - 0.2)
	var band: float = G["band"]
	for i in 3:
		var r := PH.ring_at(i, m)
		if r < 0.0:
			continue
		var s := m - float(hits[i])
		var q := s / float(G["out"])
		var n := GP.rnd(r * 90.0) + 20
		var fr := floori(s * 30.0) * 7
		for j in n:
			var a := (float(j) / n) * TAU
			var ca := cos(a)
			var sa := sin(a)
			for b in 5:
				var rr := r - band * (b / 4.0)
				if GP.hash(j, b + fr, 7951) < q * 0.6 + b * 0.08:
					continue
				var Q := _at(S.x + ca * rr, S.y + sa * rr)
				_dot(c, Q.x, Q.y - (2.0 if b == 0 else 0.0), PALE if b == 0 else (HUSH[4] if b == 1 else (HUSH[3] if b < 4 else HUSH[2])), 2, 2 if b == 0 else 1)
			if j % 7 == 0 and GP.hash(j, 9, 7952) > q:
				var Q := _at(S.x + ca * (r - 0.1), S.y + sa * (r - 0.1), 3.0 + 6.0 * GP.hash(j, 10, 7952))
				_dot(c, Q.x, Q.y, FLAME[3] if i == 2 else FLAME[2])
		# (the boards cracked where it struck, as the rap's)
		if s < 0.3:
			for j in 7:
				var a := (j / 7.0) * TAU + GP.hash(j, i, 7953)
				var d := 0.0
				while d < 0.5 * _c01(s / 0.06):
					var Q := _at(S.x + cos(a) * d, S.y + sin(a) * d)
					_dot(c, Q.x, Q.y, FLAME[3] if s < 0.1 else INK)
					d += 0.04


## paintMark: the mark round the hero at (x, y): a ring, its reticle's four ticks, a dial filling in his pink to gold; bright and
## turning while he stands in the light, dim and dashed while he is hid.
static func _mark(c: CanvasItem, x: float, y: float, fill: float, lit: bool, t: float) -> void:
	var R: float = PH.BEAM["ring"]
	var n := 72
	for i in n:
		var u := float(i) / n
		var a := u * TAU - PI / 2.0
		var Q := _at(x + cos(a) * R, y + sin(a) * R)
		var filled := u < fill
		if not lit and not filled and i % 3 == 2:
			continue
		var col: Color = (FLAME[4] if u > 0.85 else (FLAME[3] if u > 0.5 else FLAME[2])) if filled else (PALE_L if lit else HUSH[3])
		_dot(c, Q.x, Q.y, col, 2, 2)
		_dot(c, Q.x, Q.y + 2.0, FLAME[0] if filled else INK, 2, 1)
	# the reticle's ticks, turning slowly while lit
	var spin := t * 1.2 if lit else 0.0
	for k in 4:
		var a := spin + k * PI / 2.0
		var d := R * 1.12
		while d <= R * 1.5:
			var Q := _at(x + cos(a) * d, y + sin(a) * d)
			_dot(c, Q.x, Q.y, (FLAME[3] if fill > 0.7 else WARM) if lit else HUSH[3], 2, 2)
			d += 0.03


## paintDial: the little brass-ringed dial over the hero's head (its middle X, Y, picture pixels), filling round from the top.
static func _dial(c: CanvasItem, X: float, Y: float, fill: float, lit: bool, r := 7) -> void:
	for j in range(-r - 2, r + 3):
		for i in range(-r - 2, r + 3):
			var d := sqrt(float(i * i + j * j))
			if d > r + 1.5:
				continue
			if d > r - 0.5:
				_dot(c, X + i, Y + j, DIAL_BRASS[0] if d > r + 0.5 else ((DIAL_BRASS[2] if j < 0 else DIAL_BRASS[1]) if lit else HUSH[3]))
				continue
			var a := atan2(float(i), float(-j)) / TAU
			if a < 0.0:
				a += 1.0
			var col: Color
			if a <= fill:
				col = WHITE if fill >= 1.0 else (FLAME[4] if a > 0.7 else (FLAME[3] if a > 0.4 else FLAME[2]))
			else:
				col = Color("#2a1e24") if lit else HUSH[1]
			_dot(c, X + i, Y + j, col)


static func _dial_over(P, c: CanvasItem, fill: float, lit: bool) -> void:
	var s := Iso.to_screen(P.hero.world.x, P.hero.world.y)
	_dial(c, s.x, s.y - 92.0, fill, lit)


## The field's cuts: a cross of two long cuts, turned a little (as a surgeon marks them), each from and to (tiles from its middle).
static func _cuts(seed: int) -> Array:
	var a0 := 0.35 + 0.2 * GP.hash(seed, 1, 7941)
	var r: float = float(PH.FIELD["r"]) * 0.95
	var out: Array = []
	for k in 2:
		var a := a0 + k * PI / 2.0
		out.append([Vector2(cos(a) * r, sin(a) * r), Vector2(-cos(a) * r, -sin(a) * r)])
	return out


## paintField: marked and beating through the wind-up; burnt in at the strike; the scorch after.
static func _field(c: CanvasItem, x: float, y: float, t: float, seed: int) -> void:
	var FR: float = PH.FIELD["r"]
	var cuts := _cuts(seed)
	if t < float(PH.OP_STRIKE[0]) + 1.0 / 30.0:
		# MARKED: the ring and the cross dashed, beating ever faster, hot as the strike comes
		var k := _c01(t / 0.3)
		var run := _run(t, PH.OP_HIT)
		var hot: bool = t > float(PH.OP_HOLD[1]) - 0.3 or floori(t * (4.0 + 10.0 * _c01(t / PH.OP_HIT))) % 2 == 0
		for dr in [0.0, -0.06]:
			_ring(c, x, y, FR * (0.5 + 0.5 * _sm(k)) + dr, k, run, hot)
		for cut in cuts:
			var a: Vector2 = cut[0]
			var b: Vector2 = cut[1]
			for o in [0.0, 0.05]:
				_dashes(c, Vector2(x + a.x * k + o, y + a.y * k - o), Vector2(x + b.x * k + o, y + b.y * k - o), k, -run, hot)
		return
	var s := t - PH.OP_HIT
	if s > float(PH.FIELD["lie"]):
		return
	# THE STRIKE: the field blinding for its two frames and the one after, then the burnt cuts glowing white to gold to scorch
	if s < 2.0 / 30.0 + 1e-6:
		var n := GP.rnd(FR * 46.0)
		for j in n + 1:
			var r := (FR * j) / n
			var m := maxi(8, GP.rnd(r * 50.0))
			for i in m:
				if r > FR * 0.7 and GP.hash(i, j, 7943) < (r / FR - 0.7) * 2.5:
					continue
				var a := (float(i) / m) * TAU
				var Q := _at(x + cos(a) * r, y + sin(a) * r)
				_dot(c, Q.x, Q.y, WHITE if r < FR * 0.45 else (WARM if r < FR * 0.8 else FLAME[3]), 2, 1)
	var glow := _c01(1.0 - s / float(PH.FIELD["lie"]))
	var col: Color = WHITE if s < 0.12 else (FLAME[4] if s < 0.35 else (FLAME[3] if s < 0.7 else (FLAME[2] if s < 1.0 else SCORCH[2])))
	var lines: Array = cuts.duplicate()
	var N := 40
	for i in N:
		var a0 := (float(i) / N) * TAU
		var a1 := (float(i + 1) / N) * TAU
		lines.append([Vector2(cos(a0) * FR, sin(a0) * FR), Vector2(cos(a1) * FR, sin(a1) * FR)])
	for ln in lines:
		var a: Vector2 = ln[0]
		var b: Vector2 = ln[1]
		var L := a.distance_to(b)
		var d := 0.0
		while d <= L:
			var u := d / maxf(1e-6, L)
			var Q := _at(x + a.x + (b.x - a.x) * u, y + a.y + (b.y - a.y) * u)
			_dot(c, Q.x - 1.0, Q.y, SCORCH[0], 3, 2)
			if GP.hash(GP.rnd(Q.x), GP.rnd(Q.y), 7944) < glow + 0.2:
				_dot(c, Q.x, Q.y, col, 2, 1)
			d += 0.03
	# sparks and smoke going up off the cuts
	for i in 40:
		var life := fmod(s * 1.4 + GP.hash(i, 6, 7945), 1.0)
		if s + 0.05 < life * 0.5:
			continue
		var ln: Array = lines[i % lines.size()]
		var a: Vector2 = ln[0]
		var b: Vector2 = ln[1]
		var u := GP.hash(i, 7, 7945)
		var Q := _at(x + a.x + (b.x - a.x) * u, y + a.y + (b.y - a.y) * u, life * 40.0)
		var smoke := s > 0.4
		_dot(c, Q.x, Q.y, ((HUSH[2] if life > 0.5 else HUSH[3]) if smoke else (WHITE if life < 0.3 else FLAME[3])), 2 if smoke else 1, 2 if smoke else 1)


# --- over what stands ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	var src = p.get("src")
	match str(p["a1"]):
		"physician:held":
			if src == null or not is_instance_valid(src) or src.dead:
				return
			var s: Vector2 = P._px(src.world)
			var up := maxf(float(PH.HELD["up"]), STONES) if not src.carries.is_empty() else float(PH.HELD["up"])
			_held(c, s.x, s.y - up, str(p["w"]), float(p["t"]))
		"physician:freed":
			# (beaten out of him: from over his head home to the hero)
			var s0: Vector2 = P._px(Vector2(p["x"], p["y"]))
			var up := maxf(float(PH.HELD["up"]), STONES) if int(p["b"]) == 1 else float(PH.HELD["up"])
			var s1: Vector2 = P._px(P.hero.world)
			_freed(c, s0.x, s0.y - up, s1.x, s1.y - 18.0, str(p["w"]), float(p["t"]))


static func _glyph(w: String) -> Array:
	var T: Dictionary = Perils._fx.get("tables", {}).get("ph", {})
	return T.get("glyph", {}).get(w, ["..oo..", ".XXXX.", "XX..XX", ".XXXX.", "..oo.."])


## drawHeldWord: its own rune, burning the enemy's pink (game pixels: the screen's two), a ring of pink round it slowly turning,
## its dark seam under it, motes of it drifting up.
static func _held(c: CanvasItem, sx: float, sy: float, w: String, t: float) -> void:
	if t < 0.0:
		return
	var rows := _glyph(w)
	var H := rows.size()
	var W: int = str(rows[0]).length()
	var grow := _sm(t / 0.25)
	var pulse := 0.5 + 0.5 * sin(t * 6.0)
	var bob := float(GP.rnd(sin(t * 2.2) * 1.5))
	var R := (maxi(W, H) * CELL) / 2.0 + 4.0
	for i in 24:
		if i % 3 == 2:
			continue
		var a := (i / 24.0) * TAU + t * 1.4
		GP.dot(c, sx + cos(a) * R * grow, sy + bob + sin(a) * R * 0.8 * grow, FLAME[1], 1, 1, (0.45 + 0.35 * pulse) * grow)
	for r in H:
		var row: String = rows[r]
		for k in W:
			var ch := row[k]
			if ch == ".":
				continue
			GP.dot(c, sx + (k - W / 2.0) * CELL * grow, sy + bob + (r - H / 2.0) * CELL * grow, (FLAME[4] if pulse > 0.5 else FLAME[3]) if ch == "o" else FLAME[2], CELL, CELL, grow)
	GP.dot(c, sx - (W * CELL) / 2.0, sy + bob + (H * CELL) / 2.0 + 1.0, SEAM, W * CELL, 1, 0.7 * grow)
	for i in 6:
		var life := fmod(t * 0.8 + i / 6.0, 1.0)
		GP.dot(c, sx + (GP.hash(i, floori(t * 0.8 + i / 6.0), 7711) - 0.5) * W * CELL, sy + bob - (H * CELL) / 2.0 - life * 14.0, FLAME[2] if i % 2 == 1 else FLAME[3], 1, 1, (1.0 - life) * 0.8 * grow)


## drawWordFreed: its rune breaks apart over his head and its pieces fly home to the hero, the enemy's pink going out of them and
## the word's own colour coming into them as they come.
static func _freed(c: CanvasItem, sx0: float, sy0: float, sx1: float, sy1: float, w: String, t: float) -> void:
	var long: float = PH.HELD["flight"]
	if t < 0.0 or t >= long:
		return
	var q := t / long
	var rows := _glyph(w)
	var H := rows.size()
	var W: int = str(rows[0]).length()
	var T: Dictionary = Perils._fx.get("tables", {}).get("ph", {})
	var own := Color(str(T.get("colour", {}).get(w, "#e8e4d8")))
	var i := 0
	for r in H:
		var row: String = rows[r]
		for k in W:
			if row[k] == ".":
				continue
			i += 1
			var e := _sm((q - 0.25 * GP.hash(i, 0, 7721)) / 0.75)
			var ox := (k - W / 2.0) * CELL * (1.0 + 1.5 * sin(PI * e))
			var oy := (r - H / 2.0) * CELL * (1.0 + 1.5 * sin(PI * e))
			var px := sx0 + (sx1 - sx0) * e + ox * (1.0 - e)
			var py := sy0 + (sy1 - sy0) * e + oy * (1.0 - e) - 18.0 * sin(PI * e)
			GP.dot(c, px, py, FLAME[2].lerp(own, _c01(e * 1.3)), 2, 2, 1.0 - 0.5 * e)


# --- their lights in the dark ---

static func spots(P, p: Dictionary) -> void:
	var src = p.get("src")
	match str(p["a1"]):
		"physician:held":
			if src != null and is_instance_valid(src) and not src.dead:
				var s: Vector2 = P._px(src.world)
				var up := maxf(float(PH.HELD["up"]), STONES) if not src.carries.is_empty() else float(PH.HELD["up"])
				P.look.spot(Vector2(s.x, s.y - up), 22.0, 0.7)
		"physician:op":
			# (the spotlight, lit hard through the dark)
			var d := PH.op_dark(float(p["t"]))
			if d > 0.0:
				P.look.spot(P._px(Vector2(p["x"], p["y"])), float(PH.FIELD["r"]) * 16.0 * sqrt(2.0) * 1.3, d)


# --- over the dark ---

static func glow(P, c: CanvasItem, p: Dictionary) -> void:
	var src = p.get("src")
	match str(p["a1"]):
		"physician:look":
			if _acting(src, "physician:diagnose") and int(src.h2.a1.get("dOn", 0)) == 1:
				_beam(P, c, src)
		"physician:op":
			_operation(P, c, p)


## A line on the screen, `width` game pixels wide.
static func _line(c: CanvasItem, a: Vector2, b: Vector2, col: Color, width: float, alpha: float) -> void:
	if alpha <= 0.0:
		return
	c.draw_line(a, b, Color(col, alpha), maxf(1.0, width * 2.0))


## Where his lens is on the screen, `t` seconds into his `move`: its floor point, and the point itself.
static func _lens_on_screen(src, hand: int, move: String, t: float) -> Vector2:
	var L := PH.lens_at(move, t)
	var f := A1.beside(src.world, src.face, hand, L.x, L.y)
	var s := Iso.to_screen(f.x, f.y)
	return Vector2(s.x, s.y - L.z)


## THE BEAM over the floor, from the lens to the first of what it cannot cross along each way, its edges brass-gold; its shaft
## through the air from the lens to the hero; the dial over the hero's head.
static func _beam(P, c: CanvasItem, src) -> void:
	var s: Dictionary = src.h2.a1
	var act: Dictionary = src.h2.act
	var on := minf(1.0, (float(act["t"]) - float(PH.DIAG["up"]) + 0.1) / 0.25 + float(s.get("dLook", 0.0)) * 4.0)
	var hand: int = act["hand"]
	var L := PH.lens_spot(src.world, src.face, hand)
	var aim := float(s.get("dAim", 0.0))
	var half: float = PH.BEAM["half"]
	var n := 28
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := aim - half + (2.0 * half * i) / n
		var d := PH.beam_run(src.mgr.map, L, a)
		pts.append(Iso.to_screen(L.x + cos(a) * d, L.y + sin(a) * d))
	var L0 := Iso.to_screen(L.x, L.y)
	var warm := Color(WARM, 0.16 * on)
	for i in n:
		c.draw_colored_polygon(PackedVector2Array([L0, pts[i], pts[i + 1]]), warm)
	_line(c, L0, pts[0], FLAME[3], 1.0, 0.55 * on)
	_line(c, L0, pts[n], FLAME[3], 1.0, 0.55 * on)
	var lens := _lens_on_screen(src, hand, "diagnose", minf(float(act["t"]), float(PH.DIAG["loop"][1])))
	var h := Iso.to_screen(P.hero.world.x, P.hero.world.y)
	var lit := int(s.get("dLit", 0)) == 1
	_line(c, lens, Vector2(h.x, h.y - 14.0), PALE_L, 1.0, 0.3 * on * (1.0 if lit else 0.35))
	_dial_over(P, c, float(s.get("dFill", 0.0)), lit)


## A filled ellipse on the screen.
static func _ellipse(c: CanvasItem, m: Vector2, rx: float, ry: float, col: Color) -> void:
	var pts := PackedVector2Array()
	for i in 24:
		var a := (i / 24.0) * TAU
		pts.append(m + Vector2(cos(a) * rx, sin(a) * ry))
	c.draw_colored_polygon(pts, col)


## An ellipse's outline on the screen; `dash`: every other step of it left out.
static func _outline(c: CanvasItem, m: Vector2, rx: float, ry: float, col: Color, dash := false) -> void:
	var n := maxi(48, ceili((rx + ry) * 1.6))
	var prev := m + Vector2(rx, 0)
	for i in range(1, n + 1):
		var a := (float(i) / n) * TAU
		var q := m + Vector2(cos(a) * rx, sin(a) * ry)
		if not dash or i % 2 == 0:
			c.draw_line(prev, q, col, 2.0)
		prev = q


## HE OPERATES, over the dark: the spotlight's cone down through the dark from his lens, and its hard edge; his instruments; the
## strike's burst where they meet; the light burnt down through the lens; the dial over the hero, full and white, while the field
## is marked.
static func _operation(P, c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	var dark := PH.op_dark(t)
	var src = p.get("src")
	var him: bool = src != null and is_instance_valid(src) and not src.dead
	var hand: int = (src.h2.act["hand"] if (him and src.h2.act != null) else int(p.get("hand", 1)))
	var lens := _lens_on_screen(src, hand, "operate", minf(t, PH.OP_LONG)) if him else Vector2.INF
	var mid := Iso.to_screen(float(p["x"]), float(p["y"]))
	var FR: float = PH.FIELD["r"]
	var A := FR * 16.0 * sqrt(2.0) * 2.0
	var B := FR * 8.0 * sqrt(2.0) * 2.0
	if dark >= 0.5:
		# THE SPOTLIGHT'S CONE down through the dark from his lens, and its hard edge
		if lens != Vector2.INF:
			var dv := mid - lens
			var Ln := maxf(1e-6, dv.length())
			var nx := -dv.y / Ln
			var ny := dv.x / Ln
			var k := maxf(1e-6, sqrt(A * A * nx * nx + B * B * ny * ny))
			var e := Vector2((A * A * nx) / k, (B * B * ny) / k)
			c.draw_colored_polygon(PackedVector2Array([lens, mid + e, mid - e]), Color(WHITE, 0.1 * dark))
			_line(c, lens, mid + e, WHITE, 0.5, 0.3 * dark)
			_line(c, lens, mid - e, WHITE, 0.5, 0.3 * dark)
		_outline(c, mid, A, B, Color(WHITE, dark))
		_outline(c, mid, (FR - 0.1) * 16.0 * sqrt(2.0) * 2.0, (FR - 0.1) * 8.0 * sqrt(2.0) * 2.0, Color(PALE_L, 0.6 * dark), true)
	# HIS INSTRUMENTS
	var coat := (Iso.to_screen(src.world.x, src.world.y) if him else mid) - Vector2(0, 58)
	var coat_floor: Vector2 = src.world if him else Vector2(p["x"], p["y"])
	var tools := _tools(float(p["x"]), float(p["y"]), t, coat, coat_floor)
	for i in tools.size():
		var tl: Dictionary = tools[i]
		if tl["smear"] != null:
			# (smeared through the close: lines of his pink and gold and the light's white from where it was)
			var a: Vector2 = tl["smear"][0]
			var b: Vector2 = tl["smear"][1]
			if t > PH.OP_HIT + 1e-6:
				_line(c, a + (b - a) * 0.45, b, PALE_L, 0.5, 1.0)
			else:
				_line(c, a, b, FLAME[2], 2.5, 0.7)
				_line(c, a, b, FLAME[3], 1.5, 1.0)
				_line(c, a, b, WHITE, 0.5, 1.0)
		_laid(P, c, int(tl["kind"]), tl["P"], tl["dir"], float(tl["glint"]))
		# (a glint at its point now and then as it is held: a four-pointed star of his gold)
		if float(tl["glint"]) > -99.0 and t < float(PH.OP_STRIKE[0]) and GP.hash(i, floori(t * 10.0), 7967) < 0.22:
			var dir: Vector2 = tl["dir"]
			var Ld := maxf(1e-6, dir.length())
			var X := float(GP.rnd((tl["P"].x + (dir.x / Ld) * 19.0 * float(OP["size"])) / 2.0)) * 2.0
			var Y := float(GP.rnd((tl["P"].y + (dir.y / Ld) * 19.0 * float(OP["size"])) / 2.0)) * 2.0
			c.draw_rect(Rect2(X - 3.0, Y - 1.0, 6.0, 2.0), FLAME[3])
			c.draw_rect(Rect2(X - 1.0, Y - 3.0, 2.0, 6.0), FLAME[3])
			c.draw_rect(Rect2(X - 1.0, Y - 1.0, 2.0, 2.0), FLAME[4])
	# THE STRIKE: where they meet, a burst of white, his gold and his pink flung out; and the light burnt down through the lens
	var s := t - PH.OP_HIT
	if s >= -1e-6 and s < 0.14:
		var X := mid.x
		var Y := mid.y - float(OP["high"]) * 0.8
		var k := 1.0 - s / 0.14
		for i in 48:
			if GP.hash(i, 3, 7969) > k + 0.2:
				continue
			var a := GP.hash(i, 1, 7969) * TAU
			var r := (6.0 + 46.0 * GP.hash(i, 2, 7969)) * (0.4 + 0.6 * (1.0 - k))
			var col: Color = FLAME[2] if i % 3 == 0 else (FLAME[3] if i % 3 == 1 else WHITE)
			c.draw_rect(Rect2(GP.rnd((X + cos(a) * r) / 2.0) * 2.0, GP.rnd((Y + sin(a) * r * 0.7) / 2.0) * 2.0, 2.0, 2.0), col)
		if s < 0.07:
			_ellipse(c, Vector2(X, Y), 9.0, 7.0, FLAME[4])
			_ellipse(c, Vector2(X, Y), 5.6, 4.4, WHITE)
	if lens != Vector2.INF and s >= -1.0 / 30.0 - 1e-6 and s <= 0.17:
		var k := 1.0 - _c01(s / 0.17)
		_line(c, lens, mid, FLAME[3], 2.5 * (0.4 + 0.6 * k), 1.0)
		_line(c, lens, mid, WHITE, 1.2 * (0.4 + 0.6 * k), 1.0)
	# (the dial over the hero, full and white, while the field is marked)
	if t < float(PH.OP_STRIKE[0]):
		_dial_over(P, c, 1.0, true)


## toolsAt: where each of his instruments is `t` seconds into his operation, round the spotlight at (x, y) (picture pixels: the
## art's own), the way its point faces, its glint along it (or none, -99), its smear (from, to) or null.
static func _tools(x: float, y: float, t: float, coat: Vector2, coat_floor: Vector2) -> Array:
	var out: Array = []
	var fly0: float = OP["fly"][0]
	var fly1: float = OP["fly"][1]
	if t < fly0 or t >= float(OP["home"]):
		return out
	_world()
	var R0: float = float(PH.FIELD["r"]) + float(OP["out"])
	var high: float = OP["high"]
	var mid := _at(x, y, high)
	var fr := floori(t * 30.0 + 1e-6)
	var strike0: float = PH.OP_STRIKE[0]
	var size: float = OP["size"]
	for i in int(OP["count"]):
		var kind := i % TOOL_KINDS
		var a := (float(i) / int(OP["count"])) * TAU + 0.26
		var ca := cos(a)
		var sa := sin(a)
		var glint := -19.0 + fmod(t * 46.0 + i * 9.3, 58.0)
		var start := fly0 + i * 0.012
		# (flung out of his coat, spinning, over in an arc to its place)
		if t < start:
			continue
		if t < fly1:
			var u := _sm((t - start) / (fly1 - start))
			var endP := _at(x + ca * R0, y + sa * R0, high)
			var Pp := Vector2(coat.x + (endP.x - coat.x) * u, coat.y + (endP.y - coat.y) * u - 60.0 * sin(PI * u))
			var spin := (1.0 - u) * PI * 5.0 * (1.0 if i % 2 == 1 else -1.0)
			var d0 := mid - endP
			var ang := atan2(d0.y, d0.x) + spin
			out.append({"kind": kind, "P": Pp, "dir": Vector2(cos(ang), sin(ang)), "glint": -99.0, "smear": null})
			continue
		# HELD round the edge of the light, trembling, glinting; drawn back before the strike
		if t <= strike0 + 1e-6:
			var back := float(OP["back"]) * _sm((t - float(OP["draw"])) / (strike0 - float(OP["draw"])))
			var rP := _at(x + ca * (R0 + back), y + sa * (R0 + back), high)
			var shake := 0.6 + 1.6 * _c01((t - fly1) / (strike0 - fly1))
			var Pp := Vector2(rP.x + GP.rnd((GP.hash(i, fr, 7961) - 0.5) * 2.0 * shake), rP.y + GP.rnd((GP.hash(i, fr, 7963) - 0.5) * 2.0 * shake))
			out.append({"kind": kind, "P": Pp, "dir": mid - rP, "glint": glint, "smear": null})
			continue
		# THE CLOSE: in two frames from all round to the middle, smeared (and the frame after it)
		var rb := R0 + float(OP["back"])
		var from := _at(x + ca * rb, y + sa * rb, high)
		if t <= PH.OP_HIT + 1e-6:
			var u := _c01((t - strike0) / (PH.OP_HIT - strike0))
			var rr := rb + (float(OP["meet"]) - rb) * u
			var rP := _at(x + ca * rr, y + sa * rr, high * (1.0 - 0.25 * u))
			out.append({"kind": kind, "P": rP, "dir": mid - from, "glint": 0.0, "smear": [from, rP]})
			continue
		# (slammed point-down into the boards round the middle, leaning out, quivering)
		var s := t - PH.OP_HIT
		var sink: float = OP["sink"]
		var tip := _at(x + ca * sink, y + sa * sink, 0.0)
		var handle := _at(x + ca * (sink + 0.4), y + sa * (sink + 0.4), 40.0)
		var lean0 := atan2(tip.y - handle.y, tip.x - handle.x)
		var lean := lean0 + 0.2 * sin(s * 44.0 + i) * exp(-s * 3.5)
		var dirS := Vector2(cos(lean), sin(lean))
		var stuck_mid := tip - dirS * TOOL_LONG * size * 0.4
		var met := _at(x + ca * float(OP["meet"]), y + sa * float(OP["meet"]), high * 0.75)
		if t < float(OP["pull"]):
			var u := _sm(s / float(OP["stuck"]))
			var Pp := met + (stuck_mid - met) * u
			var d0 := met - from
			var n0 := maxf(1e-6, d0.length())
			var dir := (d0 / n0) * (1.0 - u) + dirS * u
			out.append({"kind": kind, "P": Pp, "dir": dir, "glint": glint if s < 0.3 else -99.0, "smear": [from, met] if t <= PH.OP_HIT + 1.0 / 30.0 + 1e-6 else null})
			continue
		# (plucked out and flown back into his coat, spinning)
		var u := _sm((t - float(OP["pull"])) / (float(OP["home"]) - float(OP["pull"])))
		if u > 0.95:
			continue
		var Pp := Vector2(stuck_mid.x + (coat.x - stuck_mid.x) * u, stuck_mid.y + (coat.y - stuck_mid.y) * u - 50.0 * sin(PI * u))
		var ang := lean + u * PI * 4.0 * (1.0 if i % 2 == 1 else -1.0)
		out.append({"kind": kind, "P": Pp, "dir": Vector2(cos(ang), sin(ang)), "glint": -99.0, "smear": null})
	return out


## One of his instruments on the screen: its middle `at` (picture pixels), the way its point faces, its glint (along it, or
## none): the game's picture of it turned the nearest way round; the glint running along its blade, its blade in his gold seen
## only in a band across it.
static func _laid(P, c: CanvasItem, kind: int, at: Vector2, dir: Vector2, glint: float) -> void:
	var name := "ph_tool_%d" % kind
	if not P.has_film(name):
		return
	var turns := 24
	var k := posmod(GP.rnd((atan2(dir.y, dir.x) / TAU) * turns), turns)
	var X := Vector2(GP.rnd(at.x / 2.0) * 2.0, GP.rnd(at.y / 2.0) * 2.0)
	P._film_pic(c, name, "stand", k, X)
	if glint <= -99.0 or not P.has_film("ph_glint_%d" % kind):
		return
	var pi: int = P._still("ph_glint_%d" % kind, "stand", k)
	if pi < 0:
		return
	var q: Array = Perils._fx["pics"][pi]
	var tex: Texture2D = P._sheet(int(q[0]))
	var a := (float(k) / turns) * TAU
	var sz: float = OP["size"]
	var u0 := (glint - 1.6) * sz
	var u1 := (glint + 1.6) * sz
	var rot := func(u: float, v: float) -> Vector2: return Vector2(u * cos(a) - v * sin(a), u * sin(a) + v * cos(a))
	var band := PackedVector2Array([rot.call(u0, -40.0), rot.call(u1, -40.0), rot.call(u1, 40.0), rot.call(u0, 40.0)])
	var x0 := float(q[5])
	var y0 := float(q[6])
	var box := PackedVector2Array([Vector2(x0, y0), Vector2(x0 + float(q[3]), y0), Vector2(x0 + float(q[3]), y0 + float(q[4])), Vector2(x0, y0 + float(q[4]))])
	var ts := tex.get_size()
	for poly in Geometry2D.intersect_polygons(band, box):
		var pts := PackedVector2Array()
		var uvs := PackedVector2Array()
		for v in poly:
			pts.append(X + v)
			uvs.append(Vector2((float(q[1]) + v.x - x0) / ts.x, (float(q[2]) + v.y - y0) / ts.y))
		c.draw_colored_polygon(pts, Color.WHITE, uvs, tex)


# --- the theatre plunged dark (render.ts light: opDark) ---

## The dark laid over everything that stands, one hard spotlight cut in it on the field, its edge a thin band a step down: a layer
## over what stands, under what is drawn over the dark (`fx_air`, gone with the mark).
static func _dark(P, p: Dictionary) -> void:
	var d = p.get("fx_air")
	if d == null or not is_instance_valid(d):
		d = OpDark.new()
		d.z_index = 50
		var mat := ShaderMaterial.new()
		mat.shader = OpDark.shader()
		d.material = mat
		P.add_child(d)
		p["fx_air"] = d
	var mid := Iso.to_screen(float(p["x"]), float(p["y"]))
	var FR: float = PH.FIELD["r"]
	d.middle = mid
	var mat: ShaderMaterial = d.material
	mat.set_shader_parameter("dark", PH.op_dark(float(p["t"])))
	mat.set_shader_parameter("mid", mid)
	mat.set_shader_parameter("r1", FR * 16.0 * sqrt(2.0) * 2.0)
	mat.set_shader_parameter("r2", (FR + 0.08) * 16.0 * sqrt(2.0) * 2.0)
	d.queue_redraw()


class OpDark extends Node2D:
	var middle := Vector2.ZERO
	static var _sh: Shader

	static func shader() -> Shader:
		if _sh == null:
			_sh = Shader.new()
			_sh.code = """
shader_type canvas_item;
uniform float dark = 0.0;
uniform vec2 mid;
uniform float r1 = 100.0;
uniform float r2 = 104.0;
varying vec2 at;
void vertex() {
	at = VERTEX;
}
void fragment() {
	vec2 q = at - mid;
	float e = length(vec2(q.x, q.y * 2.0));
	float a = 0.8 * dark;
	if (e < r2) {
		a *= 1.0 - 0.5 * dark;
	}
	if (e < r1) {
		a *= 1.0 - dark;
	}
	COLOR = vec4(10.0 / 255.0, 8.0 / 255.0, 18.0 / 255.0, a);
}
"""
		return _sh

	func _draw() -> void:
		draw_rect(Rect2(middle - Vector2(4000, 2600), Vector2(8000, 5200)), Color.WHITE)
