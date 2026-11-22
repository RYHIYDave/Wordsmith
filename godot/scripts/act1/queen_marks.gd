## WHAT THE CARRION QUEEN (floor 7's boss) DOES TO HER EYRIE, AND HER FALL OFF ITS EDGE: perils.gd's marks of kind "a1" named
## "queen:" (marks.gd hands them here), stepped as her rules step them (game/act1_rules/queen.ts stepPeril) and drawn as
## render/act1_fx/queen.ts draws them (ACTION_FX, and her fall), in the game's own pictures: what of hers aims any way is painted
## here a frame at a time by the art's own painters brought over line for line (art/carrion_queen_action_fx.ts paintRakeMarks,
## paintGustMarks, paintDiveMarks while she is up, paintPoolRims, paintVultureLine), and what does not, the game's films (`qn_burst`
## of tools/godot_fx.ts: her crater and the rock bursting); her fall is her own figure's death (`fall`), and the dark of her
## Eclipse is the renderer's (render.ts: the ledge at a third of its light but for her pools and a little round him).
##   queen:marks    while she rakes, gusts or dives (and flies home, from when she is set down over her perch): what she will
##                  strike marked on the rock, as her move goes; the rake's gouges and the gust's blast after its blow.
##   queen:burst    where her dive struck (`b`: the way she faced): the crater, the dirt and dust flung up and hanging.
##   queen:eclipse  her Eclipse round where she stood (`b`: its pools' seed; `c`: when the next dive of her flock may come): the
##                  dark, its pools' rims; a dive of her flock sent at him while he is outside every pool.
##   queen:vdive    a dive of her flock (`x`, `y` where it strikes; `b`, `c` where it comes in from; its 0 its strike): its line
##                  marked, the vulture down it out of the dark and up into it, the rock scored where its talons went.
##   queen:fall     her death off the edge, the way round with the drop at her back (`fx`, `fy`).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const QR := preload("res://scripts/act1/queen.gd")
const BG := preload("res://scripts/act1/boss_ground.gd")
const FmPaint := preload("res://scripts/fm_paint.gd")

## (art/mkit.ts FLAME; the painters' white, scorched rock and ink)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const WHITE := Color("#fff6e0")
const CHAR: Array[Color] = [Color("#1a1218"), Color("#2a1c26"), Color("#3c2a36")]
const INK := Color("#120c14")
## (art/act1_figs/queen.ts Q2_EDGE, Q2_FALL.over: her death's films' edge behind her, tiles, and when she goes over it)
const EDGE := 60.0 * 1.12 / 39.191835884530846
const OVER := 0.85
## (render.ts: the Eclipse's dark, its colour; how much a pool of light and the hero's own cut it)
const DUSK := Color(10.0 / 255.0, 6.0 / 255.0, 22.0 / 255.0)


static func step(P, p: Dictionary, _dt: float) -> bool:
	var hero = P.hero
	var src = p.get("src")
	match str(p["a1"]):
		"queen:marks":
			if src == null or not is_instance_valid(src) or src.dead or src.state != "act" or src.h2.act == null or not is_same(src.h2.act, p.get("act")):
				return false
		"queen:eclipse":
			var E: Dictionary = QR.ECLIPSE
			# (her death ends it, his “Start all that”, 22 Nov 2026, to the list's “The Carrion Queen's Eclipse goes on after she dies”:
			# before its dark has fallen, gone; in its dark, the light coming back at once, and no more dives of her flock)
			if src == null or not is_instance_valid(src) or src.dead:
				if float(p["t"]) < float(E["hit"]):
					return false
				if float(p["t"]) < float(E["hit"]) + float(E["dark"]):
					p["t"] = float(E["hit"]) + float(E["dark"])
				p["c"] = INF
			_dark(P, p)
			var t: float = p["t"]
			# (`c`: when the next dive may come)
			if t >= float(p["c"]) and t <= float(E["hit"]) + float(E["dark"]) - float(E["warn"]) and hero.alive and hero._act != "lunge" and not QR.in_pool(QR.pools_of(p), hero.world):
				p["c"] = t + float(E["every"])
				# (from out of the dark, `from` tiles off, to where he stands now)
				var ang := randf_range(0.0, TAU)
				var h: Vector2 = hero.world
				P.list.append({"kind": "a1", "a1": "queen:vdive", "x": h.x, "y": h.y, "fx": 1.0, "fy": 0.0, "t": -float(E["warn"]), "hit": 0.0, "dur": 0.6, "dmg": p["dmg"],
					"done": 0, "a": 0.0, "b": h.x + cos(ang) * float(E["from"]), "c": h.y + sin(ang) * float(E["from"]), "d": 0.0, "hand": 1, "src": src, "by": p.get("by", {}), "fig": p.get("fig")})
		"queen:vdive":
			if int(p["done"]) == 0 and float(p["t"]) >= 0.0:
				p["done"] = 1
				# (it strikes where he stood, and along the last of its line)
				var E: Dictionary = QR.ECLIPSE
				var to := Vector2(p["x"], p["y"])
				var from := Vector2(p["b"], p["c"])
				var L := maxf(1e-9, to.distance_to(from))
				var u := (to - from) / L
				var rel: Vector2 = hero.world - from
				var along := rel.dot(u)
				var across := absf(-rel.x * u.y + rel.y * u.x)
				var struck: bool = hero.world.distance_to(to) <= float(E["hitR"]) or (along >= L - float(E["tail"]) and along <= L and across <= float(E["half"]))
				if struck and A1.open_to(hero):
					P._hurt(p, p["dmg"], to)
				P.sfx.play("swing", linear_to_db(0.6))
	return float(p["t"]) < float(p["dur"])


# --- among the figures ---

static func stands(P, p: Dictionary) -> void:
	if p["a1"] != "queen:fall" or P.stands == null:
		return
	# HER FALL OFF THE EDGE, where she went over: her death's frames, the way round with the drop at her back; from in front, once
	# she has gone over, what of her is on this side of the films' edge with rock under it is left out (render/act1_fx/queen.ts
	# underRock: the shader below)
	var fig = p.get("fig")
	if fig == null or not fig.has("fall"):
		return
	var f := Vector2(p["fx"], p["fy"])
	var t: float = p["t"]
	var back := QR.view_index(f) >= 2
	var n: int = fig.count(1 if back else 0, "fall")
	var i := mini(n - 1, floori(t * fig.fps("fall") + 1e-6))
	var fr: Dictionary = fig.frame(f.x, f.y, "fall", i)
	var s = p.get("fx_stand")
	if s == null or not is_instance_valid(s):
		s = Sprite2D.new()
		s.centered = false
		var mat := ShaderMaterial.new()
		mat.shader = _bury_shader()
		s.material = mat
		P.stands.add_child(s)
		p["fx_stand"] = s
	var at := Vector2(p["x"], p["y"])
	var scr := Iso.to_screen(at.x, at.y)
	var depth := at.x + at.y
	var tex: AtlasTexture = fr["tex"]
	s.texture = tex
	s.flip_h = fr["flip"]
	s.scale = Vector2.ONE * float(fr["scale"])
	s.position = Vector2(scr.x, depth * 16.0)
	s.offset = fr["offset"] + Vector2(0.0, (scr.y - depth * 16.0) / float(fr["scale"]))
	var m: ShaderMaterial = s.material
	var bury: bool = not back and t >= OVER
	m.set_shader_parameter("bury", bury)
	if bury:
		var g := BG.of(P.map.depth)
		var w: float = tex.region.size.x
		var off: Vector2 = fr["offset"]
		m.set_shader_parameter("sheet", Vector2(tex.atlas.get_width(), tex.atlas.get_height()))
		m.set_shader_parameter("region", Vector4(tex.region.position.x, tex.region.position.y, tex.region.size.x, tex.region.size.y))
		m.set_shader_parameter("anchor", Vector2(off.x + w if fr["flip"] else -off.x, -off.y))
		m.set_shader_parameter("flip", fr["flip"])
		m.set_shader_parameter("at", at)
		m.set_shader_parameter("edge", 64.0 * EDGE)
		var D = g.get("drop")
		if D != null:
			m.set_shader_parameter("box", Vector4(D["dx0"], D["dy0"], D["dw"], D["dh"]))
			m.set_shader_parameter("drop", _drop_tex(P.map.depth, D))
			m.set_shader_parameter("has_drop", true)
		else:
			m.set_shader_parameter("has_drop", false)


## (render/act1_fx/queen.ts underRock, nearRockFrom; render/outdoor.ts: the drop as the ground shows it) A pixel of her fall from in
## front, `dx`, `dy` picture pixels from her floor point as painted (not turned over), is left out where it is on this side of the
## films' edge (16 dx + 32 dy + 1024 Q2_EDGE > 0) and the ground under it, so many game pixels from her floor point on the screen,
## is rock: anything but the drop (where there is no drop to ask of, all of it).
static var _shader: Shader
static func _bury_shader() -> Shader:
	if _shader == null:
		_shader = Shader.new()
		_shader.code = """
shader_type canvas_item;
uniform bool bury = false;
uniform vec2 sheet;
uniform vec4 region;
uniform vec2 anchor;
uniform bool flip = false;
uniform vec2 at;
uniform float edge;
uniform bool has_drop = false;
uniform vec4 box;
uniform sampler2D drop : filter_nearest;
void fragment() {
	vec4 c = texture(TEXTURE, UV);
	if (bury && c.a > 0.0) {
		vec2 px = floor(UV * sheet) - region.xy;
		float dx = px.x + 0.5 - anchor.x;
		float dy = px.y + 0.5 - anchor.y;
		if (16.0 * dx + 32.0 * dy + 16.0 * edge > 0.0) {
			float gx = floor((flip ? -dx : dx) / 2.0);
			float gy = floor(dy / 2.0);
			vec2 w = at + vec2((gx / 16.0 + gy / 8.0) / 2.0, (gy / 8.0 - gx / 16.0) / 2.0);
			bool is_drop = false;
			if (has_drop) {
				vec2 cell = floor(w) - box.xy;
				if (cell.x >= 0.0 && cell.y >= 0.0 && cell.x < box.z && cell.y < box.w) {
					is_drop = texture(drop, (cell + 0.5) / box.zw).r > 0.5;
				}
			}
			if (!is_drop) {
				c.a = 0.0;
			}
		}
	}
	COLOR = c;
}
"""
	return _shader


static var _drops := {}
static func _drop_tex(depth: int, D: Dictionary) -> Texture2D:
	if not _drops.has(depth):
		var bytes := PackedByteArray()
		for v in D["cells"]:
			bytes.append(255 if int(v) == 1 else 0)
		_drops[depth] = ImageTexture.create_from_image(Image.create_from_data(int(D["dw"]), int(D["dh"]), false, Image.FORMAT_L8, bytes))
	return _drops[depth]


# --- the Eclipse's dark (render.ts light) ---

## The ledge dark but for its pools and a little round him: a layer over everything that stands, under what is drawn over the
## dark (`fx_air`, gone with the mark).
static func _dark(P, p: Dictionary) -> void:
	var d = p.get("fx_air")
	if d == null or not is_instance_valid(d):
		d = Dark.new()
		d.z_index = 50
		var mat := ShaderMaterial.new()
		mat.shader = Dark.shader()
		d.material = mat
		P.add_child(d)
		p["fx_air"] = d
	var e := QR.eclipse_dark(float(p["t"]))
	var hero = P.hero
	var spots := PackedVector4Array()
	var hs := Iso.to_screen(hero.world.x, hero.world.y)
	# (a little of his own, that he is seen; and the pools, fully lit: each the game's soft pool, `r` across its half, 0.62 of
	# that up and down; game pixels to the screen's two)
	spots.append(Vector4(hs.x, hs.y - 20.0, 80.0, 0.5 * e))
	for q in QR.pools_of(p):
		var s := Iso.to_screen(q["x"], q["y"])
		spots.append(Vector4(s.x, s.y, float(q["r"]) * 22.6 * 1.15 * 2.0, q["k"]))
	d.middle = hs
	var mat: ShaderMaterial = d.material
	mat.set_shader_parameter("dark", 0.72 * e)
	mat.set_shader_parameter("spot_n", spots.size())
	spots.resize(4)
	mat.set_shader_parameter("spots", spots)
	d.queue_redraw()


class Dark extends Node2D:
	var middle := Vector2.ZERO
	static var _sh: Shader

	static func shader() -> Shader:
		if _sh == null:
			_sh = Shader.new()
			_sh.code = """
shader_type canvas_item;
uniform float dark = 0.0;
uniform int spot_n = 0;
uniform vec4 spots[4];
varying vec2 at;
void vertex() {
	at = VERTEX;
}
void fragment() {
	float a = dark;
	for (int i = 0; i < 4; i++) {
		if (i >= spot_n) {
			break;
		}
		vec4 s = spots[i];
		vec2 q = (at - s.xy) / vec2(s.z, s.z * 0.62);
		float k = length(q);
		float g = k < 0.5 ? 1.0 - 0.6 * k : max(0.0, 1.4 * (1.0 - k));
		a *= 1.0 - clamp(s.w, 0.0, 1.0) * g;
	}
	COLOR = vec4(10.0 / 255.0, 6.0 / 255.0, 22.0 / 255.0, a);
}
"""
		return _sh

	func _draw() -> void:
		draw_rect(Rect2(middle - Vector2(4000, 2600), Vector2(8000, 5200)), Color.WHITE)


# --- on the floor (in perils.gd _draw) ---

static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	match str(p["a1"]):
		"queen:marks":
			# (while she acts, what she will strike marked on the rock: render/act1_fx/queen.ts ACTION_FX ground, as far as her dive's
			# blow and a little)
			if src == null or not is_instance_valid(src) or src.h2.act == null:
				return
			var a: Dictionary = src.h2.acts()[src.h2.act["i"]]
			var T: float = src.h2.act["t"]
			var aim := atan2(src.face.y, src.face.x)
			var id: String = a["id"]
			if T >= float(QR.DIVE["hit"]) + 0.05:
				return
			var out: Array = []
			if id == "queen:rake":
				_rake_marks(out, aim, T)
			elif id == "queen:gust":
				_gust_marks(out, aim, T)
			elif id == "queen:dive" or (id == "queen:home" and T >= (float(QR.DIVE["up"][0]) + float(QR.DIVE["up"][1])) / 2.0):
				_dive_marks(out, aim, T)
			_lay(P, src.world, out)
		"queen:burst":
			# (her crater, and the half of the rock's burst behind where she struck: the game's film, its floor point where her
			# talons struck)
			if P.has_film("qn_burst"):
				P._film_floor("qn_burst", t, at + Vector2(cos(float(p["b"])), sin(float(p["b"]))) * float(QR.DIVE["at"]))
		"queen:eclipse":
			# (each pool's rim, where it is)
			for q in QR.pools_of(p):
				var out: Array = []
				_pool_rims(out, q, t)
				_lay(P, Vector2(q["x"], q["y"]), out)
		"queen:vdive":
			var E: Dictionary = QR.ECLIPSE
			var k := minf(1.0, (t + float(E["warn"])) / float(E["warn"]))
			var out: Array = []
			_vulture_line(out, Vector2(float(p["b"]) - at.x, float(p["c"]) - at.y), Vector2.ZERO, k, t if t >= 0.0 else -1.0)
			_lay(P, at, out)


# --- over what stands (in perils.gd _draw_air) ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	match str(p["a1"]):
		"queen:burst":
			# (the half of the rock's burst before where she struck, over the figures)
			if P.has_film("qn_burst"):
				var at := Vector2(p["x"], p["y"]) + Vector2(cos(float(p["b"])), sin(float(p["b"]))) * float(QR.DIVE["at"])
				P._film_pic(c, "qn_burst", "air", P._film_frame("qn_burst", t), Iso.to_screen(at.x, at.y))
		"queen:vdive":
			# (one of her flock, down its line out of the dark, and pulled out up into it: its attack's picture three fifths through)
			if t <= -0.12 or t >= 0.3:
				return
			var src = p.get("src")
			if src == null or not is_instance_valid(src):
				return
			var fig = src.mgr._figures.get("vulture")
			if fig == null or not fig.has("attack"):
				return
			var u := (t + 0.12) / 0.12 if t < 0.0 else 1.0
			var up := (1.0 - u) * 70.0 if t < 0.0 else (t / 0.3) * 80.0
			var from := Vector2(p["b"], p["c"])
			var w := from.lerp(Vector2(p["x"], p["y"]), u)
			var n: int = fig.count(0, "attack")
			# (its picture from in front, turned over when it comes in from the right)
			var fr: Dictionary = fig.frame(1.0 if float(p["x"]) >= float(p["b"]) else -1.0, 0.0 if float(p["x"]) >= float(p["b"]) else 1.0, "attack", mini(n - 1, floori(n * 0.6)))
			var tex: Texture2D = fr["tex"]
			var size: Vector2 = tex.get_size() * float(fr["scale"])
			var o: Vector2 = Iso.to_screen(w.x, w.y) + Vector2(0.0, -2.0 * up) + fr["offset"] * float(fr["scale"])
			c.draw_texture_rect(tex, Rect2(o.x + size.x, o.y, -size.x, size.y) if fr["flip"] else Rect2(o, size), false)


static func spots(_P, _p: Dictionary) -> void:
	pass


## (taken away before its time: nothing of hers is left in the floor)
static func gone(_P, _p: Dictionary) -> void:
	pass


# --- her painters, brought over (art/carrion_queen_action_fx.ts): each lays whole game pixels, `out` [rect, colour] in picture
# pixels from the floor point it is painted round, in the order the painter lays them (each over what is under it) ---

## Laid on the floor (perils.gd _draw), round the floor point `at`.
static func _lay(P, at: Vector2, out: Array) -> void:
	var base := (Iso.to_screen(at.x, at.y) / 2.0).round() * 2.0
	for q in out:
		var r: Rect2 = q[0]
		P.draw_rect(Rect2(base + r.position, r.size), q[1])


## (JS Math.round: halves up)
static func _rnd(v: float) -> float:
	return floorf(v + 0.5)


## at: a floor point (tiles from the painter's floor point) and a height over it (picture pixels) to the picture.
static func _at(v: Vector2, z := 0.0) -> Vector2:
	return Vector2(32.0 * (v.x - v.y), 16.0 * (v.x + v.y) - z)


## dot: a whole game pixel (two of the picture's) at (x, y), or `size` of them.
static func _dot(out: Array, x: float, y: float, c: Color, size := 1) -> void:
	var X := 2.0 * _rnd(x / 2.0)
	var Y := 2.0 * _rnd(y / 2.0)
	out.append([Rect2(X - (size - 1), Y - (size - 1), 2 * size, 2 * size), c])


## floorLine: a line along the floor from a to b, its colour at each step (a Color, or a Callable of the step: null for a gap).
static func _line(out: Array, a: Vector2, b: Vector2, col, size := 1) -> void:
	var p0 := _at(a)
	var p1 := _at(b)
	var n := maxi(1, ceili(p0.distance_to(p1) / 2.0))
	for i in n + 1:
		var u := float(i) / n
		var c = col.call(u) if col is Callable else col
		if c != null:
			_dot(out, p0.x + (p1.x - p0.x) * u, p0.y + (p1.y - p0.y) * u, c, size)


## beating: a beat that quickens as the blow nears, from `a` to `b`.
static func _beating(t: float, a: float, b: float) -> bool:
	var k := A1.clamp01((t - a) / (b - a))
	var phase := (t - a) * (3.0 + 9.0 * k)
	return phase - floorf(phase) < 0.6


## from: a floor point from her spot (here its middle), `fwd` tiles the way she faces (`aim`) and `left` to her left.
static func _from(aim: float, fwd: float, left: float) -> Vector2:
	return Vector2(cos(aim) * fwd + cos(aim - PI / 2.0) * left, sin(aim) * fwd + sin(aim - PI / 2.0) * left)


static func _h(x: float, y: float, k: int) -> float:
	return FmPaint.hash3(int(x), int(y), k)


## paintRakeMarks: while she hangs, the wedge's edge dashed in her pink and its three claw lanes lit inside it, hotter and quicker;
## at her blow, three gouges of fire torn along the lanes out to its end in two frames, burning, then scorched.
static func _rake_marks(out: Array, aim: float, t: float) -> void:
	var R: Dictionary = QR.RAKE
	var warn0 := float(R["up"]) - 4.0 / 30.0
	var hit: float = R["hit"]
	var F: float = R["from"]
	var T: float = R["to"]
	var lane := func(j: int, fw: float) -> float: return (float(R["lanes"][j]) / 24.0) * (QR.rake_half(fw) - 0.35)
	if t >= warn0 and t < hit:
		var k := A1.clamp01((t - warn0) / (hit - warn0))
		var on := _beating(t, warn0, hit)
		var edge := FLAME[2] if on else FLAME[1]
		var dash14 := func(u: float): return edge if floori(u * 14.0) % 2 == 0 else null
		var dash8 := func(u: float): return edge if floori(u * 8.0) % 2 == 0 else null
		var dash4 := func(u: float): return edge if floori(u * 4.0) % 2 == 0 else null
		_line(out, _from(aim, F, -QR.rake_half(F)), _from(aim, T, -QR.rake_half(T)), dash14, 2)
		_line(out, _from(aim, F, QR.rake_half(F)), _from(aim, T, QR.rake_half(T)), dash14, 2)
		_line(out, _from(aim, T, -QR.rake_half(T)), _from(aim, T, QR.rake_half(T)), dash8, 2)
		_line(out, _from(aim, F, -QR.rake_half(F)), _from(aim, F, QR.rake_half(F)), dash4, 2)
		for j in 3:
			var c: Color = (FLAME[4] if k > 0.6 else FLAME[3]) if on else FLAME[2]
			for i in 41:
				var u := i / 40.0
				# (a claw's lane: thin at her end, widest two-thirds out)
				if u > k * 1.6:
					break
				var fw := F + 0.3 + (T - F - 0.3) * u
				var q := _at(_from(aim, fw, lane.call(j, fw)))
				_dot(out, q.x, q.y, c, 3 if u > 0.2 and u < 0.85 else 2)
		return
	var s := t - hit
	if s < 0.0 or s > 1.6:
		return
	var reach := A1.clamp01((s + 1.0 / 30.0) / (2.0 / 30.0))
	for j in 3:
		for i in 61:
			var u := i / 60.0
			if u > reach:
				break
			var fw := F + 0.3 + (T - F - 0.3) * u
			var wob := (FmPaint.hash3(i, j, 7101) - 0.5) * 0.12
			var q := _at(_from(aim, fw, lane.call(j, fw) + wob))
			var age := s / 1.1 + (1.0 - u) * 0.1
			var w := 3 if u > 0.15 and u < 0.9 else 2
			if age < 0.12:
				_dot(out, q.x, q.y, WHITE, w + 1)
			elif age < 0.35:
				_dot(out, q.x, q.y, FLAME[4], w)
			elif age < 0.6:
				_dot(out, q.x, q.y, FLAME[3] if FmPaint.hash3(i, j, 7102) > 0.5 else FLAME[2], w)
			elif age < 0.85:
				_dot(out, q.x, q.y, FLAME[1] if FmPaint.hash3(i, j, 7103) > 0.6 else CHAR[2], w)
			elif s < 1.6:
				_dot(out, q.x, q.y, CHAR[i % 2], w)
			# (flames licking up off a burning gouge)
			if age > 0.1 and age < 0.6 and FmPaint.hash3(i, j, 7104 + floori(s * 20.0)) > 0.8:
				_dot(out, q.x, q.y - 4.0 - 8.0 * FmPaint.hash3(i, j, 7105), FLAME[4] if age < 0.35 else FLAME[3])


## gustRays: the rays of her gust's cone, their ways (radians to her left of the way she faces) and how far each runs.
static func _rays() -> Array:
	var G: Dictionary = QR.GUST
	var n: int = G["rays"]
	var lim := atan(float(G["spread"])) + 0.12
	var out: Array = []
	for i in n:
		var a := -lim + (2.0 * lim * i) / (n - 1)
		out.append([a, float(G["far"]) / maxf(0.6, cos(a))])
	return out


## paintGustMarks: while she is reared, its cone in rays straight out from her, chevrons marching out along every other one, its
## far end an arc dashed across it, beating faster; at her clap, the blast racing out along every ray.
static func _gust_marks(out: Array, aim: float, t: float) -> void:
	var G: Dictionary = QR.GUST
	var warn0 := float(G["hold"]) - 6.0 / 30.0
	var hit: float = G["hit"]
	var far: float = G["far"]
	var rays := _rays()
	var chevron := func(r: float, a: float, size: float, c: Color) -> void:
		var tip := _from(aim + a, r, 0.0)
		for sd in [-1.0, 1.0]:
			_line(out, _from(aim + a, r - size, sd * size * 0.8), tip, c, 2)
	if t >= warn0 and t < hit:
		var k := A1.clamp01((t - warn0) / (hit - warn0))
		var on := _beating(t, warn0, hit)
		for i in rays.size():
			var a: float = rays[i][0]
			var reach := minf(rays[i][1], far * (0.25 + 0.75 * A1.clamp01(k * 1.5)))
			var rim := i == 0 or i == rays.size() - 1
			_line(out, _from(aim + a, 0.7, 0.0), _from(aim + a, reach, 0.0), ((FLAME[2] if on else FLAME[1]) if rim else FLAME[1]), 2 if rim else 1)
			if i % 2 == 1 or rim:
				continue
			var march := fmod((t - warn0) * (1.0 + 2.5 * k), 1.0)
			var r := 1.4 + march * 1.4
			while r < reach - 0.2:
				chevron.call(r, a, 0.45, (FLAME[4] if k > 0.6 else FLAME[3]) if on else FLAME[2])
				r += 1.4
		var lim := atan(float(G["spread"])) + 0.12
		var reach2 := far * (0.25 + 0.75 * A1.clamp01(k * 1.5))
		var arc_at := func(q: int) -> Vector2: return _from(aim - lim + (2.0 * lim * q) / 24.0, reach2, 0.0)
		for q in range(0, 24, 2):
			_line(out, arc_at.call(q), arc_at.call(q + 1), FLAME[2] if on else FLAME[1], 2)
		return
	var s := t - hit
	if s < 0.0 or s > 0.9:
		return
	var front := 18.0 * s + 0.8
	for ray in rays:
		var a: float = ray[0]
		var len: float = ray[1]
		var end := minf(len, front)
		var fade := s / 0.9
		var pale := Color("#d8d0dc") if fade < 0.3 else Color("#9a90a4")
		var streak := func(u: float): return pale if FmPaint.hash3(floori(u * 40.0), floori(a * 100.0), 7201) > 0.35 + 0.6 * fade else null
		_line(out, _from(aim + a, 0.7, 0.0), _from(aim + a, end, 0.0), streak)
		if front < len + 1.0:
			for q in 3:
				chevron.call(minf(len, front - q * 0.35), a, 0.4 - q * 0.08, WHITE if q == 0 else (FLAME[4] if q == 1 else FLAME[3]))


## paintDiveMarks, while she is up out of sight: her line, chevrons down it toward where she strikes; the area she strikes, its edge
## a thick ring closing in to its size as she stoops, beating faster, a fainter ring inside it; her shadow on the rock. (Its ground's
## hatching and her shadow are laid only where the painter's own sums come out whole, as in the game.)
static func _dive_marks(out: Array, aim: float, t: float) -> void:
	var D: Dictionary = QR.DIVE
	var hit: float = D["hit"]
	var launch: float = D["launch"]
	if t < launch or t >= hit:
		return
	var A: float = D["at"]
	var L: float = D["line"]
	var H: float = D["half"]
	var R: float = D["r"]
	var cxy := _from(aim, A, 0.0)
	var k := A1.clamp01((t - launch) / (hit - launch))
	var on := _beating(t, launch, hit)
	var c: Color = (FLAME[4] if k > 0.65 else FLAME[3]) if on else FLAME[2]
	var dim := FLAME[2] if on else FLAME[1]
	var line_end := A - sqrt(maxf(0.0, R * R - H * H))
	if line_end > L:
		var edged := func(u: float): return c if floori(u * 10.0) % 2 == 0 else dim
		for sd in [-1.0, 1.0]:
			_line(out, _from(aim, L, sd * H), _from(aim, line_end, sd * H), edged, 2)
	var march := fmod((t - launch) * (1.0 + 3.0 * k), 1.0)
	var r := L + 0.3 + march * 0.7
	while r < A - 0.4:
		for sd in [-1.0, 1.0]:
			_line(out, _from(aim, r - 0.4, sd * H * 0.75), _from(aim, r, 0.0), c, 2)
		r += 0.7
	var rr := R * (1.0 + 0.12 * (1.0 - k))
	var c0 := _at(cxy)
	var ce := _at(cxy + Vector2(rr * sqrt(0.5), -rr * sqrt(0.5)))
	var rx := absf(ce.x - c0.x) + 4.0
	var Y := -rx / 2.0
	while Y <= rx / 2.0:
		var X := -rx
		while X <= rx:
			var e := (X / rx) * (X / rx) + (Y / (rx / 2.0)) * (Y / (rx / 2.0))
			if e < 1.0:
				var band := fmod(fmod((X + 2.0 * Y) / 2.0 + floorf(t * 18.0), 6.0) + 6.0, 6.0)
				if band == 0.0 and _h(X, Y, 7311) < 0.9:
					_dot(out, c0.x + X, c0.y + Y, FLAME[1] if on else CHAR[2])
			X += 2.0
		Y += 2.0
	for i in 96:
		if i % 4 == 3:
			continue
		var a0 := float(i) / 96.0 * TAU
		var a1 := float(i + 1) / 96.0 * TAU
		_line(out, cxy + Vector2(cos(a0), sin(a0)) * rr, cxy + Vector2(cos(a1), sin(a1)) * rr, c, 3 if k > 0.6 else 2)
	for i in range(0, 64, 2):
		var a0 := float(i) / 64.0 * TAU
		var a1 := float(i + 1) / 64.0 * TAU
		_line(out, cxy + Vector2(cos(a0), sin(a0)) * rr * 0.55, cxy + Vector2(cos(a1), sin(a1)) * rr * 0.55, dim, 1)
	if t > float(D["hold"]):
		var sk := A1.clamp01((t - float(D["hold"])) / (hit - float(D["hold"])))
		var sx := 20.0 + 40.0 * sk
		var y2 := -sx / 2.0
		while y2 <= sx / 2.0:
			var x2 := -sx
			while x2 <= sx:
				if (x2 / sx) * (x2 / sx) + (y2 / (sx / 2.0)) * (y2 / (sx / 2.0)) < 1.0 and fmod(x2 + y2, 4.0) == 0.0:
					_dot(out, c0.x + x2, c0.y + y2, INK)
				x2 += 2.0
			y2 += 2.0


## paintPoolRims: a pool's rim of light on the rock, a ring of pale motes on its edge (each pool on a picture of its own, round its
## own middle, as the game paints it: so each is the first of its list).
static func _pool_rims(out: Array, q: Dictionary, t: float) -> void:
	if float(q["k"]) <= 0.2:
		return
	var r := float(q["r"]) * float(q["k"])
	var n := roundi(r * 30.0)
	for i in n:
		var a := float(i) / n * TAU + t * 0.15 * -1.0
		if FmPaint.hash3(i, 0, 7401) > 0.7:
			continue
		var p := _at(Vector2(cos(a), sin(a)) * r)
		_dot(out, p.x, p.y, Color("#e8dcc0") if FmPaint.hash3(i, 0, 7402) > 0.5 else Color("#bcae98"))


## paintVultureLine: a vulture's dive in the dark, its line on the rock from where it comes in (`a`) to where it strikes (`b`),
## marked from `k` 0 to 1 (drawn out, chevrons down it, a ring at its end, beating faster); `struck` from 0, after it strikes: the
## rock scored where its talons went, fading.
static func _vulture_line(out: Array, a: Vector2, b: Vector2, k: float, struck := -1.0, seed := 0) -> void:
	var E: Dictionary = QR.ECLIPSE
	var d := b - a
	var L := d.length() if d.length() > 0.0 else 1.0
	var u := d / L
	var P := func(s: float, l: float) -> Vector2: return Vector2(a.x + u.x * s - u.y * l, a.y + u.y * s + u.x * l)
	if struck < 0.0:
		var on := floori(k * (4.0 + 10.0 * k) * 2.0) % 2 == 0
		var c: Color = (FLAME[4] if k > 0.6 else FLAME[3]) if on else FLAME[2]
		var reach := L * A1.clamp01(k * 2.5)
		var dashed := func(v: float): return c if floori(v * reach * 3.0) % 2 == 0 else null
		_line(out, P.call(0.0, 0.0), P.call(reach, 0.0), dashed, 2)
		var s := 0.5
		while s < reach - 0.2:
			for sd in [-1.0, 1.0]:
				_line(out, P.call(s - 0.35, sd * float(E["half"])), P.call(s, 0.0), c, 2)
			s += 0.7
		if k > 0.3:
			var rr := float(E["hitR"]) * (1.0 + 0.3 * (1.0 - k))
			for i in 32:
				if i % 4 == 3:
					continue
				var a0 := float(i) / 32.0 * TAU
				var a1 := float(i + 1) / 32.0 * TAU
				_line(out, b + Vector2(cos(a0), sin(a0)) * rr, b + Vector2(cos(a1), sin(a1)) * rr, c, 2)
		return
	if struck > 0.8:
		return
	for l in [-0.18, 0.0, 0.18]:
		var hue := WHITE if struck < 0.1 else (FLAME[4] if struck < 0.3 else (FLAME[2] if struck < 0.55 else FLAME[1]))
		var scored := func(v: float): return hue if FmPaint.hash3(floori(v * 20.0), seed, 7501) > 0.2 else null
		_line(out, P.call(L - float(E["tail"]) * 0.5, l), P.call(L + 0.35, l * 1.4), scored, 2)
