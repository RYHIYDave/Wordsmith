## WHAT FLOORS 9 AND 10'S COMMON MONSTERS AND FLOOR 9'S TWO SIDE BOSSES LAY ON THE FLOOR AND THROW UP: perils.gd's marks of kind
## "a1", each named as the game names it, stepped as its kind's rules step it and drawn as render/act1_fx/deer.ts, drowned.ts and
## f9_bosses.ts draw it, in the game's own pictures (films `de_`, `dr_`, `wc_`, `mw_` of tools/godot_fx.ts, made by the art's own
## painters; the deer's lane by the golem's lane painter, brought over in marks.gd). Called from marks.gd (each of its parts hands
## its mark here first: `mine`).
##   deer:charge      the twisted deer's lane, marked as it is aimed and broken up behind it as it runs; and behind it its hedge
##                    of bramble, each clump bursting up, writhing and withering (among the figures at its foot; the torn earth
##                    under it), seen from behind when it runs up the screen, turned over when it runs to the left. Its wall and
##                    its thorns: deer.gd step_hedge. `d` how far it ran, `c` his side of it, `b` when it may sting again.
##   drowned:slick    the Drowned's cone marked, the gush over it, the slick lying: drowned.gd step_slick. Its clock from the
##                    retch (from less than 0, the cone marked).
##   drowned:rime     the rime racing out where its hands closed; round the feet of a hero it froze (`d` 1; `b`, `c` where he
##                    stood), the ice shot up, standing and shattering.
##   warchief:fx:<move>, mistwolf:fx:<move>  a side boss's move, laid where it began in the frame its picture is shown in (`a`),
##                    its clock its act's: its ground under what stands, what it throws up over it, its light, the screen
##                    flashed by a heavy blow, the screen darkened and the mist rolling in at the wolf's howl and cloud; its
##                    claws in its cloud where the hero is, each that struck him (`d`, one bit each).
##   warchief:rage    the Chieftain's rage while it lasts after his war cry: embers rising off him, its light, the screen's edges
##                    red, beating.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const DE := preload("res://scripts/act1/deer.gd")
const DR := preload("res://scripts/act1/drowned.gd")
const F9 := preload("res://scripts/act1/f9_boss.gd")
const Stoker := preload("res://scripts/stoker.gd")

## (art/act1_figs/drowned.ts SLICK_FPS, SLICK_MARK)
const SLICK_FPS := 10.0
const SLICK_MARK := 0.54
## (art/f9_bosses_fx.ts F9_FX_CANVAS: its floor point on the canvas the moves are painted on, picture pixels)
const F9_AX := 560.0
const F9_AY := 450.0
## (art/mkit.ts FLAME)
const FLAME := [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
## (render/act1_fx/f9_bosses.ts: the flash of each one's heavy blows; the screen darkened; the rage's red)
const FLASH := {"warchief": Color("#fff6e8"), "mistwolf": Color("#f2f0ff")}
const DARK := Color(14.0 / 255.0, 10.0 / 255.0, 30.0 / 255.0)
const RAGE_RED := Color(200.0 / 255.0, 24.0 / 255.0, 70.0 / 255.0)
## (the screen, game pixels)
const SCREEN := Vector2(480, 270)

## (marks.gd, fetched when first wanted: it holds this one)
static var _m6: GDScript = null
## (the mist's billows and the screen's edges, painted once: render/act1_fx/f9_bosses.ts mistIn, wash)
static var _billows: Array = []
static var _edges := {}


## Whether a mark is one of these.
static func mine(p: Dictionary) -> bool:
	var n := str(p.get("a1", ""))
	return n.begins_with("deer:") or n.begins_with("drowned:") or n.begins_with("warchief:") or n.begins_with("mistwolf:")


static func _boss(p: Dictionary) -> String:
	var n := str(p["a1"])
	return "warchief" if n.begins_with("warchief:fx:") else ("mistwolf" if n.begins_with("mistwolf:fx:") else "")


## The side boss's move a mark is, and its films' name: wc_<move>_<view> or mw_<move>_<view>.
static func _move(p: Dictionary) -> String:
	var n := str(p["a1"])
	return n.substr(n.rfind(":") + 1)


static func _film9(p: Dictionary) -> String:
	var k := int(p["a"])
	return "%s_%s_%s" % ["wc" if _boss(p) == "warchief" else "mw", _move(p), "front" if k < 2 else "rear"]


## (game/facing.ts backView, flipped)
static func _view(f: Vector2) -> String:
	return "back" if f.x + f.y < -0.2 else "front"


static func _flip(f: Vector2) -> bool:
	return f.x - f.y < 0.0


## A step of one (its clock has run on already); false: it is gone.
static func step(P, p: Dictionary, _dt: float) -> bool:
	var n := str(p["a1"])
	if n == "deer:charge":
		DE.step_hedge(P, p)
	elif n == "drowned:slick":
		DR.step_slick(P, p)
	elif n == "warchief:rage":
		var m = p.get("src")
		return m != null and is_instance_valid(m) and not m.dead and m.h2 != null and m.h2.raging()
	elif _boss(p) != "":
		F9.keep_time(p)
	return float(p["t"]) < float(p["dur"])


# --- among the figures ---

static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var f := Vector2(p["fx"], p["fy"])
	match str(p["a1"]):
		"deer:charge":
			# (each clump of the hedge standing now, at its foot)
			var pool: Array = p.get("fx_pool", [])
			p["fx_pool"] = pool
			var n := DE.hedge_to(p["d"])
			var view := _view(f)
			while pool.size() < n:
				pool.append(P._film_sprite())
			for j in pool.size():
				var name := "de_clump_%s_%d" % [view, j]
				var i := DE.clump_frame(j, t) if j < n else -1
				var at := Vector2(p["x"], p["y"]) + f * float(DE.hedge_at()[j]) if j < DE.hedge_at().size() else Vector2.ZERO
				var pi: int = P._still(name, "stand", i) if i >= 0 and P.has_film(name) else -1
				P._film_set(pool[j], pi, at, at.x + at.y, _flip(f))
		"drowned:slick":
			# (the gush over the cone, behind it and before it)
			var name := "dr_gush_%s" % _view(f)
			if not P.has_film(name):
				return
			var at := Vector2(p["x"], p["y"])
			var k := floori(t * 30.0) if t >= 0.0 and t <= 0.6 else -1
			for side in ["behind", "before"]:
				var pi := _pic(P, name, side, k)
				P._film_one(p, "fx_" + side, pi, at, at.x + at.y + (0.03 if side == "before" else -0.03), _flip(f))
		"drowned:rime":
			# (the ice round the feet of the hero it froze: behind him and before him)
			if int(p["d"]) != 1 or not P.has_film("dr_ice"):
				return
			var at := Vector2(p["b"], p["c"])
			var k := floori(t * 30.0)
			for side in ["behind", "before"]:
				P._film_one(p, "fx_" + side, _pic(P, "dr_ice", side, k), at, at.x + at.y + (0.05 if side == "before" else -0.05))


## A film's picture by its frame (counted from its own first), -1 where it has none.
static func _pic(P, name: String, layer: String, k: int) -> int:
	var F: Dictionary = P._fx["films"][name]
	var i := k - int(F.get("k0", 0))
	var L: Array = F["layers"].get(layer, [])
	return int(L[i]) if i >= 0 and i < L.size() else -1


# --- on the floor (in perils.gd _draw) ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var n := str(p["a1"])
	if n == "deer:charge":
		if t < float(DE.CHARGE["until"]):
			# (its lane, laid out as it is aimed, broken up behind it as it runs)
			if _m6 == null:
				_m6 = load("res://scripts/act1/marks.gd")
			var k := A1.clamp01((t - float(DE.CHARGE["aim"])) / 0.3)
			var long: float = DE.CHARGE["lane"] if float(p["d"]) >= DE.carried_most() - 0.01 else float(p["d"]) + 0.6
			_m6._dots(P, at, _m6._lane(f, k, minf(DE.carry(t), float(p["d"])), long, DE.CHARGE["half"]))
		# (the torn earth at each clump's foot)
		var view := _view(f)
		for j in DE.hedge_to(p["d"]):
			var name := "de_earth_%s_%d" % [view, j]
			if DE.clump_frame(j, t) >= 0 and P.has_film(name):
				var q: Vector2 = at + f * float(DE.hedge_at()[j])
				P._film_pic(P, name, "floor", 0, Iso.to_screen(q.x, q.y), _flip(f))
	elif n == "drowned:slick":
		var name := "dr_slick_%s" % _view(f)
		var i := floori((t + SLICK_MARK) * SLICK_FPS)
		if P.has_film(name) and i >= 0:
			P._film_pic(P, name, "floor", i, Iso.to_screen(at.x, at.y), _flip(f))
	elif n == "drowned:rime":
		if P.has_film("dr_rime"):
			P._film_pic(P, "dr_rime", "floor", _pic(P, "dr_rime", "floor", floori(t * 30.0)), Iso.to_screen(at.x, at.y))
	elif _boss(p) != "":
		var name := _film9(p)
		if _live9(p) and P.has_film(name):
			P._film_floor(name, t, at, bool(int(p["a"]) % 2 == 1))


## Whether a side boss's move is still to be seen (render/act1_fx/f9_bosses.ts layerOf).
static func _live9(p: Dictionary) -> bool:
	return float(p["t"]) < float(p["dur"]) - 0.02


# --- over what stands (in perils.gd _draw_air) ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	if str(p["a1"]) == "warchief:rage":
		_rage_on(P, c, p)
		return
	if _boss(p) == "" or not _live9(p):
		return
	var name := _film9(p)
	var flip := int(p["a"]) % 2 == 1
	if P.has_film(name):
		P._film_pic(c, name, "air", P._film_frame(name, t), Iso.to_screen(p["x"], p["y"]), flip)
	# (its claws flashing out of its cloud where the hero is, each of its blows that struck him)
	if _boss(p) == "mistwolf" and _move(p) == "cloud":
		var h: Vector2 = P.hero.world
		for i in 4:
			var claws := "mw_claws_%s_%d" % ["front" if int(p["a"]) < 2 else "rear", i]
			if (int(p["d"]) & (1 << i)) != 0 and P.has_film(claws):
				P._film_pic(c, claws, "air", P._film_frame(claws, t), Iso.to_screen(h.x, h.y), flip)


## THE RAGE on him (render/act1_fx/f9_bosses.ts rageOn): its embers rising off him.
static func _rage_on(P, c: CanvasItem, p: Dictionary) -> void:
	var m = p.get("src")
	if m == null or not is_instance_valid(m) or m.dead:
		return
	var s: Vector2 = Iso.to_screen(m.world.x, m.world.y) / 2.0 - Vector2(0.0, m._lift / 2.0)
	var left := minf(1.0, float(m.h2.a1.get("rage", 0.0)) / 1.5)
	var t: float = P._clock
	for i in 22:
		var h1 := sin(i * 127.1 + 31.7) * 43758.5453
		var r1 := h1 - floorf(h1)
		var h2 := sin(i * 311.7 + 74.7) * 43758.5453
		var r2 := h2 - floorf(h2)
		var ph := fposmod(t * (0.7 + r1 * 0.8) + r2, 1.0)
		if r1 > left:
			continue
		var x := s.x + (r2 - 0.5) * 40.0 + sin(t * 4.0 + i) * 1.5
		var y := s.y - 6.0 - ph * 80.0
		var col: Color = FLAME[4] if ph < 0.3 else (FLAME[3] if ph < 0.7 else FLAME[2])
		c.draw_rect(Rect2(roundf(x) * 2.0, roundf(y) * 2.0, 2.0, 4.0 if ph < 0.5 else 2.0), col)


# --- over the dark (perils.gd _draw_glow) ---

static func glow(P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) == "warchief:rage":
		# (THE RAGE: the screen's edges red while it is on him, beating)
		var m = p.get("src")
		if m != null and is_instance_valid(m) and not m.dead:
			_wash(c, RAGE_RED, (0.14 + 0.06 * sin(float(P._clock) * 9.0)) * minf(1.0, float(m.h2.a1.get("rage", 0.0)) / 1.5), true, P._clock)
		return
	var g := _glow_of(P, p)
	if g.is_empty():
		return
	# (the wolf's howl and its cloud: the screen darkened, the mist rolling in; a heavy blow: the screen flashed)
	var dark: float = g[5]
	if dark > 0.0:
		_wash(c, DARK, dark * 0.45, true, P._clock)
		_mist_in(c, dark, P._clock)
	_wash(c, FLASH[_boss(p)], g[4], false, P._clock)


## Its light, flash and darkening now: [x, y, r, a, flash, dark] (its canvas's picture pixels), or empty for none.
static func _glow_of(P, p: Dictionary) -> Array:
	if _boss(p) == "":
		return []
	var rows: Array = P._fx.get("tables", {}).get("f9glow", {}).get(_film9(p), [])
	var i := floori(float(p["t"]) * 30.0 + 1e-6)
	if i < 0 or i >= rows.size() or not (rows[i] is Array):
		return []
	return rows[i]


## The whole screen washed with `col` at `a` (render/act1_fx/f9_bosses.ts wash): `edges`, only at its edges, from clear within
## 0.32 of its height of its middle to all of it from 0.62 of its width out.
static func _wash(c: CanvasItem, col: Color, a: float, edges: bool, _t: float) -> void:
	if a <= 0.003:
		return
	_screen(c)
	if edges:
		var r0 := minf(SCREEN.x, SCREEN.y) * 0.32
		var r1 := maxf(SCREEN.x, SCREEN.y) * 0.62
		var key := col.to_html()
		if not _edges.has(key):
			var g := Gradient.new()
			g.offsets = PackedFloat32Array([0.0, r0 / r1, 1.0])
			g.colors = PackedColorArray([Color(col, 0.0), Color(col, 0.0), Color(col, 1.0)])
			var tex := GradientTexture2D.new()
			tex.gradient = g
			tex.fill = GradientTexture2D.FILL_RADIAL
			tex.fill_from = Vector2(0.5, 0.5)
			tex.fill_to = Vector2(1.0, 0.5)
			tex.width = 256
			tex.height = 256
			_edges[key] = tex
		var mid := SCREEN / 2.0
		c.draw_texture_rect(_edges[key], Rect2(mid - Vector2(r1, r1), Vector2(r1, r1) * 2.0), false, Color(1, 1, 1, minf(1.0, a)))
	else:
		c.draw_rect(Rect2(Vector2.ZERO, SCREEN), Color(col, minf(1.0, a)))
	c.draw_set_transform_matrix(Transform2D())


## (drawn from here in the screen's own game pixels)
static func _screen(c: CanvasItem) -> void:
	c.draw_set_transform_matrix(c.get_global_transform_with_canvas().affine_inverse() * Transform2D(0.0, Vector2(2, 2), 0.0, Vector2.ZERO))


## THE MIST rolling in from the screen's edges (render/act1_fx/f9_bosses.ts mistIn): great pale billows drifting along them, `a`
## of it, each soft all through, thinning to nothing at its edge.
static func _mist_in(c: CanvasItem, a: float, t: float) -> void:
	if a <= 0.01:
		return
	if _billows.is_empty():
		for pale in [false, true]:
			var g := Gradient.new()
			g.offsets = PackedFloat32Array([0.0, 0.55, 1.0])
			var tint := Color8(198, 194, 218) if pale else Color8(238, 236, 248)
			g.colors = PackedColorArray([Color(tint, 0.55 if pale else 0.5), Color(tint, 0.25 if pale else 0.22), Color8(238, 236, 248, 0)])
			var tex := GradientTexture2D.new()
			tex.gradient = g
			tex.fill = GradientTexture2D.FILL_RADIAL
			tex.fill_from = Vector2(0.5, 0.5)
			tex.fill_to = Vector2(1.0, 0.5)
			tex.width = 128
			tex.height = 128
			_billows.append(tex)
	_screen(c)
	var w := SCREEN.x
	var h := SCREEN.y
	for i in 18:
		var side := i % 4
		var u := fposmod(i * 0.618 + t * 0.05 * (1 + i % 3), 1.0) * (w if side < 2 else h)
		var r := minf(w, h) * (0.16 + 0.1 * float((i * 7) % 5) / 5.0) * (0.6 + 0.4 * a)
		var x := u if side < 2 else (-r * 0.2 + r * 0.5 * a if side == 2 else w + r * 0.2 - r * 0.5 * a)
		var y := (-r * 0.2 + r * 0.5 * a if side == 0 else h + r * 0.2 - r * 0.5 * a) if side < 2 else u
		c.draw_texture_rect(_billows[1 if i % 2 == 1 else 0], Rect2(x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6), false, Color(1, 1, 1, a))
	c.draw_set_transform_matrix(Transform2D())


# --- their lights in the dark (the game's c.spot; perils.gd _spots_of) ---

static func spots(P, p: Dictionary) -> void:
	if str(p["a1"]) == "warchief:rage":
		var m = p.get("src")
		if m != null and is_instance_valid(m) and not m.dead:
			var s: Vector2 = Iso.to_screen(m.world.x, m.world.y) / 2.0 - Vector2(0.0, m._lift / 2.0)
			P.look.spot(s + Vector2(0, -40), 46.0, 0.35 * minf(1.0, float(m.h2.a1.get("rage", 0.0)) / 1.5))
		return
	var g := _glow_of(P, p)
	if g.is_empty() or float(g[3]) <= 0.0:
		return
	# (where its blow lands, as its canvas has it, turned over with its frame)
	var s: Vector2 = P._px(Vector2(p["x"], p["y"]))
	var flip := -1.0 if int(p["a"]) % 2 == 1 else 1.0
	P.look.spot(s + Vector2((float(g[0]) - F9_AX) / 2.0 * flip, (float(g[1]) - F9_AY) / 2.0), float(g[2]) / 2.0, g[3])
