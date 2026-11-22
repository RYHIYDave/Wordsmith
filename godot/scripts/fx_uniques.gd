## WHAT THE UNIQUE ITEMS SHOW IN PLAY (render/unique_fx.ts UniqueFx, its switches all on: render/unique_play.ts UNIQUE_PLAY), the
## game's own pictures (art/unique_play_art.ts, unique_play_art2.ts, baked by tools/godot_unique_fx.ts: assets/uniques/fx.png) laid
## where the rules (uniques.gd) have things happen. fx.gd hands on to this.
##   THE DROWNED ARM        on its 'warn', black water welling up there, the tentacle bursting up out of it a little behind the
##                          enemy, towering, cocking back and whipping down across it on the 'slam', the water thrown out round it;
##                          it lies there a moment and is pulled back under.
##   THE QUEEN'S TALONS     on its 'dive', one of her flock coming down out of the air over him onto the enemy in its own stoop, its
##                          shadow under it; on the blow a burst of her feathers; then it beats away up and fades.
##   THE FLESHMANCER'S BRAND the risen elite in its kind's own pictures, drained, glowing the friend's cyan (art risenLook, here a
##                          shader): pulled up off the floor where it fell (its fall played backward), standing, walking, striking;
##                          the brand under it, turning, its ring burning away as its seconds run out; the floor cracked with light
##                          where it rose; a burst on the one it strikes; at its end it falls again and fades.
##   THE CRIER'S HUSH       on its 'dark', a ring of the Hush's dead grey closing on it and its dead air puffed up off it; while it is
##                          hushed, wisps of the Hush drifting up off it; on its 'light', a flash of its word's colour.
##   A UNIQUE DROPPED       a beam of the uniques' orange standing on it, its core white, breathing, motes rising up it; as it lands
##                          the beam shoots up out of the floor, white at first, and a ring runs out on the floor round it.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const L := preload("res://scripts/fx_looks.gd")
const DIR := "res://assets/uniques"
const RISEN_SHADER := """
shader_type canvas_item;
// (art/unique_play_art.ts risenPixel: what glowed the enemy's pink glows the friend's cyan, as bright as it was; the gold at its
// fire's tip goes the cyan's white; all the rest drained, cold and a little darker)
vec3 risen(vec3 c) {
	float r = c.r * 255.0; float g = c.g * 255.0; float b = c.b * 255.0;
	float mx = max(r, max(g, b)); float mn = min(r, min(g, b));
	float l = (mx + mn) / 510.0; float dl = mx - mn;
	float den = 1.0 - abs(2.0 * l - 1.0);
	float s = dl == 0.0 ? 0.0 : dl / 255.0 / (den == 0.0 ? 1.0 : den);
	float h = 0.0;
	if (dl > 0.0) {
		if (mx == r) h = mod((g - b) / dl + 6.0, 6.0);
		else if (mx == g) h = (b - r) / dl + 2.0;
		else h = (r - g) / dl + 4.0;
		h *= 60.0;
	}
	bool pink = s >= 0.42 && l >= 0.15 && h >= 296.0 && h <= 349.0;
	bool gold = s >= 0.85 && l >= 0.68 && dl >= mx * 0.3 && h >= 18.0 && h <= 58.0;
	if (pink || gold) {
		float k = gold ? min(1.0, l + 0.1) : l;
		vec3 a; vec3 e; float k0; float k1;
		if (k <= 0.27) { k0 = 0.0; k1 = 0.27; a = vec3(4.0, 40.0, 52.0); e = vec3(12.0, 106.0, 128.0); }
		else if (k <= 0.5) { k0 = 0.27; k1 = 0.5; a = vec3(12.0, 106.0, 128.0); e = vec3(34.0, 208.0, 224.0); }
		else if (k <= 0.85) { k0 = 0.5; k1 = 0.85; a = vec3(34.0, 208.0, 224.0); e = vec3(184.0, 255.0, 248.0); }
		else { k0 = 0.85; k1 = 1.0; a = vec3(184.0, 255.0, 248.0); e = vec3(255.0); }
		return floor(a + (e - a) * (k - k0) / (k1 - k0) + 0.5) / 255.0;
	}
	float y = 0.3 * r + 0.59 * g + 0.11 * b;
	vec3 v = vec3(r, g, b);
	vec3 o = (y + (v - y) * 0.26) * vec3(0.72, 0.84, 1.02);
	return clamp(floor(o + 0.5), 0.0, 255.0) / 255.0;
}
void fragment() {
	vec4 c = texture(TEXTURE, UV);
	COLOR = vec4(risen(c.rgb), c.a * COLOR.a);
}
"""

static var D := {}
static var _sheet: Texture2D
static var _tex := {}
static var _glow: ImageTexture
static var _shader: Shader

var fx
var t := 0.0
var _seeds := 0
var arms: Array = []
var birds: Array = []
var cracks: Array = []
var blows: Array = []
var falls: Array = []
var _wisp_t := 0.0
## SET 1 IN PLAY (render/set1_fx.ts Set1Fx, SET1_LOOK on): the meteor falling and its strikes, the blood thrown and its splash, the
## peals, the axe's dust as it falls
const S1 := {
	"rock": ["#1c1824", "#322a3a", "#544658"], "fire": ["#7a1a06", "#d04810", "#ff8a2a", "#ffd27a", "#fff4d6"],
	"blood": ["#6a0a16", "#b01c2c", "#e8444e"], "bell": ["#7a5a2a", "#c8a46a", "#f2e4c2"], "wind": ["#9aa6c8", "#d4dcf0"],
	"iron": ["#16141e", "#3a3848", "#7a788a"],
}
const METEOR := {"high": 230.0, "right": 80.0, "size": 11, "trail": 10, "strike": 0.55, "rocks": 11}
const TX := 22.6
const TY := 11.3
var s1_falls: Array = []
var s1_strikes: Array = []
var s1_bloods: Array = []
var s1_splashes: Array = []
var s1_peals: Array = []
var s1_dusts: Array = []
var s1_clock := 0.0
var _grit_t := 0.0
## (what stands, each frame laid again: Sprite2Ds among the figures, made as wanted and hidden when not)
var _sprites: Array[Sprite2D] = []
var _used := 0
var _risen_mat: ShaderMaterial
## (what gives off light: added over what is there, render engine/px.ts drawGlow)
var _add: Node2D
var _lights: Array = []


static func ready_up() -> void:
	if not D.is_empty():
		return
	D = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/fx.json"))
	_sheet = load(DIR + "/fx.png")
	_shader = Shader.new()
	_shader.code = RISEN_SHADER
	var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	for j in 64:
		for i in 64:
			var d := sqrt((i + 0.5 - 32.0) * (i + 0.5 - 32.0) + (j + 0.5 - 32.0) * (j + 0.5 - 32.0)) / 32.0
			var a := 0.0
			if d < 0.45:
				a = 1.0 - (d / 0.45) * 0.55
			elif d < 1.0:
				a = 0.45 * (1.0 - (d - 0.45) / 0.55)
			img.set_pixel(i, j, Color(1, 1, 1, a))
	_glow = ImageTexture.create_from_image(img)


func _init() -> void:
	ready_up()
	_risen_mat = ShaderMaterial.new()
	_risen_mat.shader = _shader


static func col(s: String) -> Color:
	return Color(s)


static func cols(list: Array) -> PackedColorArray:
	var out := PackedColorArray()
	for c in list:
		out.append(Color(c))
	return out


## A picture of the sheet by its key: {tex, ax, ay, w, h}, or {} where it is blank.
static func pic(key: String) -> Dictionary:
	if _tex.has(key):
		return _tex[key]
	var q: Array = D["pics"].get(key, [])
	var out := {}
	if q.size() == 6 and int(q[2]) > 0:
		var a := AtlasTexture.new()
		a.atlas = _sheet
		a.region = Rect2(q[0], q[1], q[2], q[3])
		out = {"tex": a, "ax": float(q[4]), "ay": float(q[5]), "w": float(q[2]), "h": float(q[3])}
	_tex[key] = out
	return out


func clear() -> void:
	arms = []
	birds = []
	cracks = []
	blows = []
	falls = []
	for s in _sprites:
		if is_instance_valid(s):
			s.queue_free()
	_sprites = []
	if _add != null and is_instance_valid(_add):
		_add.queue_free()
	_add = null


func _uq():
	var mons = fx.monsters if fx != null else null
	if mons == null or not is_instance_valid(mons) or mons.main == null:
		return null
	return mons.main.get("_uniques")


func _gx(x: float, y: float) -> float:
	return fx.gx(x, y)


func _gy(x: float, y: float) -> float:
	return fx.gy(x, y)


# --- what the rules tell ---

func handle(e: Dictionary) -> void:
	if e.get("t") != "unique":
		return
	var id: String = e.get("id", "")
	var what: String = e.get("what", "")
	var x: float = float(e.get("x", 0.0))
	var y: float = float(e.get("y", 0.0))
	var C: Dictionary = D["colors"]
	if id == "criershush":
		var m = _mon(e.get("mid"))
		var top: float = _top_of(m)
		if what == "dark":
			# THE HUSH CLOSES ON IT: a ring of its dead grey closing in, its dead air puffed up off it
			var H: Array = C["HUSH"]
			fx.ring(x, y, 1.4, 0.34, cols([H[4], H[3], H[2]]), false, {"closing": true})
			fx.spray(x, y, 12, cols([H[4], H[3], H[2]]), 0.7, 55.0, roundf(top * 0.6))
		elif what == "light" and m != null and not (m.words as Array).is_empty():
			# ITS WORDS COME BACK: a flash of its word's own colour
			var c: Color = fx.monsters.main.loot.word_color(m.words[0]) if fx.monsters.main.loot != null else Color.WHITE
			fx.ring(x, y, 1.1, 0.26, PackedColorArray([Color.WHITE, c, c]), false)
			fx.spray(x, y, 8, PackedColorArray([c, Color.WHITE]), 1.1, 70.0, roundf(top * 0.6))
	elif id == "windcutter" and what == "blade":
		# A GUST OFF HIS SWORD as the blade leaves it: hoops of air thrown out the way it goes, a puff of grit round his feet
		var AIR: Array = C["AIR"]
		var d := Vector2(float(e["x1"]) - x, float(e["y1"]) - y)
		var u := d / maxf(0.0001, d.length())
		fx.ring(x + u.x * 0.7, y + u.y * 0.7, 0.75, 0.18, cols([AIR[0], AIR[1], AIR[2], AIR[3]]), false)
		fx.ring(x + u.x * 1.3, y + u.y * 1.3, 0.5, 0.15, cols([AIR[1], AIR[2], AIR[3]]), false)
		fx.spray(x, y, 8, PackedColorArray([L.P["st6"], L.P["st5"], L.P["st4"]]), 1.4, 40.0, 1.0)
		fx.kick(1.2)
	elif id == "starbreaker":
		if what == "fall":
			s1_falls.append({"x": x, "y": y, "t": 0.0, "dur": maxf(0.2, float(e.get("secs", 0.6)))})
		elif what == "land" or what == "shake":
			s1_falls = s1_falls.filter(func(f): return Vector2(f["x"], f["y"]).distance_to(Vector2(x, y)) > 0.6)
			s1_strikes.append({"x": x, "y": y, "r": float(e.get("r", 1.6)), "t": 0.0, "big": what == "land"})
	elif id == "redtithe" and what == "throw":
		s1_bloods.append({"x0": x, "y0": y, "x1": float(e.get("x1", x)), "y1": float(e.get("y1", y)), "t": 0.0, "dur": maxf(0.1, float(e.get("secs", 0.25)))})
	elif id == "deathknell" and what == "peal":
		s1_peals.append({"x": x, "y": y, "r": float(e.get("r", 2.6)), "t": 0.0})
	elif id == "gyre" and what == "fall":
		s1_dusts.append({"x": x, "y": y, "r": 0.6, "t": 0.0})
	elif id == "queenstalons" and what == "dive":
		# (from in front or behind, and which way round on the screen, by the way it flies: as a monster is shown)
		var x1: float = float(e["x1"])
		var y1: float = float(e["y1"])
		var dx := x1 - x
		var dy := y1 - y
		var l := maxf(0.0001, sqrt(dx * dx + dy * dy))
		birds.append({"x0": x, "y0": y, "x1": x1, "y1": y1, "secs": float(e.get("secs", 0.35)), "t": 0.0, "back": (dx + dy) / l < -0.2, "flip": dx - dy < 0.0, "struck": false})
		if birds.size() > 6:
			birds.pop_front()
	elif id == "drownedarm":
		if what == "warn":
			# (it comes up on the far side of the enemy from him, as the screen has it, and whips down across it toward him)
			var h = fx.hero_at()
			arms.append({"x": x, "y": y, "t": 0.0, "flip": h.x - h.y < x - y})
			if arms.size() > 3:
				arms.pop_front()
		elif what == "slam":
			# (the black water thrown out round it as it lands)
			var W: Array = C["ARM_WATER"]
			fx.ring(x, y, float(e.get("r", 1.3)) * 1.05, 0.4, cols([W[4], W[3], W[2], W[1]]), false, {"heavy": true})
			fx.spray(x, y, 26, cols([W[4], W[3], W[2], "#687c46"]), 2.1, 150.0, 2.0)
	elif id == "fleshmancersbrand":
		var RC: Array = C["RISEN_CYAN"]
		if what == "rise":
			_seeds += 1
			cracks.append({"x": x, "y": y, "t": 0.0, "seed": _seeds})
			if cracks.size() > 4:
				cracks.pop_front()
			fx.ring(x, y, 1.7, 0.36, cols(["#ffffff", RC[2], RC[1], RC[0]]), false, {"heavy": true})
			fx.spray(x, y, 22, cols([RC[3], RC[2], RC[1]]), 1.5, 150.0, 3.0)
		elif what == "strike":
			var m = _mon(e.get("mid"))
			var top: float = _top_of(m)
			_seeds += 1
			blows.append({"x": float(e["x1"]), "y": float(e["y1"]), "z": minf(20.0, top * 0.5), "t": 0.0, "seed": _seeds})
			fx.spray(float(e["x1"]), float(e["y1"]), 8, cols([RC[3], RC[2], RC[1]]), 2.2, 70.0, 12.0)
		elif what == "fall":
			var p = _last
			if p != null and Vector2(p["x"], p["y"]).distance_to(Vector2(x, y)) < 1.5:
				var f: Dictionary = p.duplicate()
				f["t"] = 0.0
				falls.append(f)
			_last = null
			fx.spray(x, y, 14, cols([RC[2], RC[1], RC[0]]), 0.9, 110.0, 10.0)


## (the risen one as last drawn: for its fall, which the rules tell of once it is gone)
var _last = null


func _mon(id):
	if id == null or fx.monsters == null:
		return null
	for m in fx.monsters.list:
		if is_instance_valid(m) and m.id == id:
			return m
	return null


## (art/bestiary.ts FIGURE_SIZE top: how tall it stands, game pixels; from its picture where there is one)
func _top_of(m) -> float:
	if m == null or not is_instance_valid(m):
		return 28.0
	var sp = m.get("_sprite")
	if sp != null and sp.texture != null:
		return minf(60.0, absf(sp.offset.y * sp.scale.y) / 2.0)
	return 28.0


# --- each step ---

## (render/unique_fx.ts talonsAt) Where her bird is `tt` seconds after it is called: {along, high, move, at, alpha}, or {} once gone.
static func talons_at(tt: float, secs: float) -> Dictionary:
	var T: Dictionary = D["tune"]["TALONS"]
	if tt < secs:
		var u := tt / secs
		return {"along": u * u, "high": float(T["high"]) * (1.0 - u * u), "move": "dive", "at": float(T["from"]) + (float(T["hit"]) - float(T["from"])) * u, "alpha": minf(1.0, 0.35 + u * 3.0)}
	var after := tt - secs
	if after < float(T["end"]) - float(T["hit"]):
		return {"along": 1.0, "high": 0.0, "move": "dive", "at": float(T["hit"]) + after, "alpha": 1.0}
	var u := (after - (float(T["end"]) - float(T["hit"]))) / float(T["away"])
	if u >= 1.0:
		return {}
	return {"along": 1.0 + u * 0.8, "high": u * 30.0, "move": "fly", "at": u * float(T["away"]), "alpha": 1.0 - u * u}


func update(dt: float) -> void:
	t += dt
	var C: Dictionary = D["colors"]
	var TU: Dictionary = D["tune"]
	for c in cracks:
		c["t"] += dt
	cracks = cracks.filter(func(c): return c["t"] < float(TU["RISEN_SHOWN"]["cracks"]))
	for f in falls:
		f["t"] += dt
	falls = falls.filter(func(f): return f["t"] < float(TU["RISEN_SHOWN"]["fall"]))
	for b in birds:
		b["t"] += dt
		if not b["struck"] and b["t"] >= b["secs"]:
			b["struck"] = true
			# (a burst of her feathers off the one it strikes)
			var R: Array = C["BIRD_RAVEN"]
			fx.spray(b["x1"], b["y1"], 12, cols([R[5], R[4], R[3], R[2]]), 1.6, 90.0, 14.0)
	birds = birds.filter(func(b): return not talons_at(b["t"], b["secs"]).is_empty())
	for a in arms:
		a["t"] += dt
	arms = arms.filter(func(a): return a["t"] * 30.0 < float(TU["ARM"]["frames"]))
	for b in blows:
		b["t"] += dt
	blows = blows.filter(func(b): return b["t"] * 30.0 < float(TU["RISEN_BLOW_FRAMES"]))
	# SET 1
	s1_clock += dt
	for f in s1_falls:
		f["t"] += dt
	s1_falls = s1_falls.filter(func(f): return f["t"] < f["dur"] + 0.3)
	for q in s1_strikes:
		q["t"] += dt
	s1_strikes = s1_strikes.filter(func(q): return q["t"] < float(METEOR["strike"]))
	for b in s1_bloods:
		b["t"] += dt
		if b["t"] >= b["dur"] and b["t"] - dt < b["dur"]:
			s1_splashes.append({"x": b["x1"], "y": b["y1"], "r": 0.5, "t": 0.0})
	s1_bloods = s1_bloods.filter(func(b): return b["t"] < b["dur"])
	for r in s1_splashes + s1_peals + s1_dusts:
		r["t"] += dt
	s1_splashes = s1_splashes.filter(func(r): return r["t"] < 0.4)
	s1_peals = s1_peals.filter(func(r): return r["t"] < 0.5)
	s1_dusts = s1_dusts.filter(func(r): return r["t"] < 0.5)
	# THE WINDCUTTER: grit kicked up off the floor under its blade as it goes
	_grit_t += dt
	var U = _uq()
	if U != null and _grit_t >= float(TU["BLADE"]["grit"]):
		_grit_t = 0.0
		for bl in U.blades:
			if float(bl["left"]) > 0.3:
				fx.spray(bl["at"].x, bl["at"].y, 1, PackedColorArray([L.P["st6"], L.P["st5"], L.P["st4"]]), 0.9, 35.0, 1.0)
	# THE CRIER'S HUSH: wisps of the Hush drifting up off each it has hushed, a few a second
	_wisp_t += dt
	if _wisp_t >= 0.2 and fx.monsters != null and is_instance_valid(fx.monsters):
		_wisp_t = 0.0
		var H: Array = C["HUSH"]
		for m in fx.monsters.list:
			if is_instance_valid(m) and not m.dead and not (m.dark_words as Array).is_empty():
				fx.spray(m.world.x, m.world.y, 1, cols([H[4], H[3]]), 0.25, 22.0, roundf(_top_of(m) * 0.85))


# --- what stands among the figures ---

func _stands():
	var s = fx.monsters.get("stands") if fx != null and fx.monsters != null and is_instance_valid(fx.monsters) else null
	return s if s != null and is_instance_valid(s) else null


func _sprite() -> Sprite2D:
	if _used < _sprites.size() and is_instance_valid(_sprites[_used]):
		_used += 1
		return _sprites[_used - 1]
	var st = _stands()
	if st == null:
		return null
	var s := Sprite2D.new()
	s.centered = false
	st.add_child(s)
	if _used < _sprites.size():
		_sprites[_used] = s
	else:
		_sprites.append(s)
	_used += 1
	return s


## A picture among what stands at depth `d` (x + y, tiles), its anchor at screen point (sx, sy) (picture pixels).
func _stand(p: Dictionary, sx: float, sy: float, d: float, alpha: float, flip := false) -> void:
	if p.is_empty():
		return
	var s := _sprite()
	if s == null:
		return
	s.visible = true
	s.material = null
	s.scale = Vector2.ONE
	s.texture = p["tex"]
	s.flip_h = flip
	s.position = Vector2(roundf(sx), d * 16.0)
	var ax: float = float(p["w"]) - float(p["ax"]) if flip else float(p["ax"])
	s.offset = Vector2(-ax, roundf(sy) - d * 16.0 - float(p["ay"]))
	s.modulate = Color(1, 1, 1, alpha)


## After everything else in the frame (fx.gd _late): what stands laid where it now is.
func follow() -> void:
	_used = 0
	var TU: Dictionary = D["tune"]
	var U = _uq()
	# THE QUEEN'S TALONS: her bird where it is on its way, its floor point lifted as high as it flies
	for b in birds:
		var at := talons_at(b["t"], b["secs"])
		if at.is_empty():
			continue
		var x: float = b["x0"] + (b["x1"] - b["x0"]) * float(at["along"])
		var y: float = b["y0"] + (b["y1"] - b["y0"]) * float(at["along"])
		var key := "bird|%s|%d|%s" % [at["move"], roundi(float(at["at"]) * float(TU["TALONS"]["fps"])), "back" if b["back"] else "front"]
		_stand(pic(key), _gx(x, y) * 2.0, (_gy(x, y) - float(at["high"])) * 2.0, x + y + (1.5 if float(at["high"]) > 8.0 else 0.05), float(at["alpha"]), b["flip"])
	# THE DROWNED ARM: from a little behind the enemy, behind it as it rises, over it once it has whipped down across it
	var A: Dictionary = TU["ARM"]
	for a in arms:
		var f := mini(int(A["frames"]) - 1, floori(a["t"] * 30.0))
		var fr: Array = A["from"]
		var fx0: float = float(fr[1]) if a["flip"] else float(fr[0])
		var fy0: float = float(fr[0]) if a["flip"] else float(fr[1])
		var bx: float = a["x"] + fx0
		var by: float = a["y"] + fy0
		_stand(pic("arm|%d" % f), _gx(bx, by) * 2.0, _gy(bx, by) * 2.0, bx + by if f < int(A["slam"]) else a["x"] + a["y"] + 0.4, 1.0, a["flip"])
	# THE RISEN ELITE, and one whose time is up falling as its kind falls, fading
	var p = U.risen if U != null else null
	if p != null:
		_last = {"x": p["at"].x, "y": p["at"].y, "f": p["f"], "art": p["art"]}
		_risen(p["art"], p["f"], p["act"], float(p["act_t"]), float(p["walked"]), p["at"], 1.0)
	for f in falls:
		var RS: Dictionary = TU["RISEN_SHOWN"]
		var alpha: float = 1.0 if f["t"] < float(RS["fades"]) else maxf(0.0, 1.0 - (f["t"] - float(RS["fades"])) / (float(RS["fall"]) - float(RS["fades"])))
		_risen(f["art"], f["f"], "fall", float(f["t"]), 0.0, Vector2(f["x"], f["y"]), alpha)
	for i in range(_used, _sprites.size()):
		if is_instance_valid(_sprites[i]):
			_sprites[i].visible = false
	if _add != null and is_instance_valid(_add):
		_add.queue_redraw()


## The risen one's picture for what it is doing: its kind's own frames (and its fall backward as it rises), drained to the cyan.
func _risen(art, f: Vector2, act: String, act_t: float, walked: float, at: Vector2, alpha: float) -> void:
	if art == null:
		return
	var list := "idle"
	var i := 0
	var RS: Dictionary = D["tune"]["RISEN_SHOWN"]
	if act == "rise" and art.has("die") and art.count(0, "die") > 1:
		# (pulled up off the floor: slow to start, then snapped upright)
		var k := clampf(act_t / float(RS["rise"]), 0.0, 1.0)
		var u := k * k * (3.0 - 2.0 * k) * k
		list = "die"
		i = roundi((1.0 - u) * (art.count(0, "die") - 1))
	elif act == "strike" and art.has("attack"):
		list = "attack"
		i = mini(art.count(0, "attack") - 1, floori(act_t / 0.6 * art.count(0, "attack")))
	elif act == "walk" and art.has("walk"):
		list = "walk"
		i = floori(act_t * art.fps("walk")) % maxi(1, art.count(0, "walk"))
	elif act == "fall" and art.has("die"):
		list = "die"
		i = mini(art.count(0, "die") - 1, floori(act_t * art.fps("die")))
	else:
		i = floori(t * art.fps("idle")) % maxi(1, art.count(0, "idle"))
	var fr: Dictionary = art.frame(f.x, f.y, list, i)
	if fr.is_empty() or fr.get("tex") == null:
		return
	var s := _sprite()
	if s == null:
		return
	var sc: Vector2 = Iso.to_screen(at.x, at.y)
	s.visible = true
	s.texture = fr["tex"]
	s.flip_h = fr["flip"]
	s.scale = Vector2.ONE * float(fr["scale"])
	s.position = Vector2(sc.x, (at.x + at.y + 0.01) * 16.0)
	s.offset = fr["offset"] + Vector2(0.0, (sc.y - s.position.y) / float(fr["scale"]))
	s.material = _risen_mat
	s.modulate = Color(1, 1, 1, alpha)


# --- on the floor ---

func _oval(c: CanvasItem, x: float, y: float, r: float, a: float) -> void:
	if a <= 0.0:
		return
	var pts := PackedVector2Array()
	var cx := _gx(x, y) * 2.0
	var cy := _gy(x, y) * 2.0
	for k in 20:
		var an := TAU * k / 20.0
		pts.append(Vector2(cx + cos(an) * r * 45.2, cy + sin(an) * r * 22.6))
	c.draw_colored_polygon(pts, Color(0, 0, 0, a))


func _draw_pic(c: CanvasItem, p: Dictionary, sx: float, sy: float, alpha := 1.0) -> void:
	if p.is_empty():
		return
	c.draw_texture(p["tex"], Vector2(roundf(sx) - float(p["ax"]), roundf(sy) - float(p["ay"])), Color(1, 1, 1, alpha))


## WHAT LIES ON THE FLOOR (fx.gd's ground pass): her bird's shadow; a unique's ring as it lands; the arm's black water; the cracks
## where the elite rose, its shadow, the brand under it.
func draw_ground(c: CanvasItem) -> void:
	var TU: Dictionary = D["tune"]
	for b in birds:
		var at := talons_at(b["t"], b["secs"])
		if at.is_empty():
			continue
		var x: float = b["x0"] + (b["x1"] - b["x0"]) * float(at["along"])
		var y: float = b["y0"] + (b["y1"] - b["y0"]) * float(at["along"])
		var hi: float = float(at["high"])
		_oval(c, x, y, 0.42 - minf(0.2, hi / 160.0), 0.22 * float(at["alpha"]) * (1.0 - minf(0.6, hi / 60.0)))
	# A UNIQUE DROPPED: as it lands, a ring of its orange running out on the floor round it
	var DB: Dictionary = TU["DROP_BEAM"]
	for dr in _drops():
		var k: float = maxf(0.0, float(dr["age"])) / float(DB["ring"])
		if k >= 1.0:
			continue
		var rr: float = float(DB["reach"]) * (0.2 + 0.8 * sqrt(k))
		var colr: Color = Color.WHITE if k < 0.3 else Color("#ff8a3a")
		colr.a = 0.85 * (1.0 - k)
		var cx := _gx(dr["at"].x, dr["at"].y)
		var cy := _gy(dr["at"].x, dr["at"].y)
		var n := roundi(rr * 44.0)
		for i in n:
			var an := float(i) / n * TAU
			c.draw_rect(Rect2(roundf(cx + (cos(an) - sin(an)) * 16.0 * rr) * 2.0, roundf(cy + (cos(an) + sin(an)) * 8.0 * rr) * 2.0, 2, 2), colr)
	# THE DROWNED ARM'S BLACK WATER, between where it comes up and the enemy
	var A: Dictionary = TU["ARM"]
	for a in arms:
		var f := mini(int(A["frames"]) - 1, floori(a["t"] * 30.0))
		var fr: Array = A["from"]
		var fx0: float = float(fr[1]) if a["flip"] else float(fr[0])
		var fy0: float = float(fr[0]) if a["flip"] else float(fr[1])
		var px: float = a["x"] + fx0 * 0.45
		var py: float = a["y"] + fy0 * 0.45
		_draw_pic(c, pic("armpool|%d" % f), roundf(_gx(px, py)) * 2.0, roundf(_gy(px, py)) * 2.0)
	_s1_ground(c)
	var RS: Dictionary = TU["RISEN_SHOWN"]
	var RC: Dictionary = TU["RISE_CRACKS"]
	for q in cracks:
		var grow := mini(int(RC["grow"]) - 1, floori(q["t"] * 30.0 * 0.8))
		var cool := clampi(floori((q["t"] - 0.15) / 1.3 * (int(RC["cool"]) - 1)), 0, int(RC["cool"]) - 1)
		var al: float = maxf(0.0, (float(RS["cracks"]) - q["t"]) / float(RS["cracksFade"])) if q["t"] > float(RS["cracks"]) - float(RS["cracksFade"]) else 1.0
		_draw_pic(c, pic("cracks|%d|%d|%d" % [grow, cool, int(q["seed"]) % 4]), roundf(_gx(q["x"], q["y"])) * 2.0, roundf(_gy(q["x"], q["y"])) * 2.0, al)
	var U = _uq()
	var p = U.risen if U != null else null
	if p == null:
		return
	var at: Vector2 = p["at"]
	_oval(c, at.x, at.y, maxf(0.3, float(p["r"]) * 0.95), 0.3 * minf(1.0, float(p["act_t"]) / float(RS["rise"])) if p["act"] == "rise" else 0.3)
	# THE BRAND: stamped down white-hot as it rises, then turning under it, its ring burning away with its seconds (its last two
	# seconds, guttering)
	var r: float = roundf(maxf(0.5, float(p["r"]) + 0.26) * 45.25 / 2.0) * 2.0
	var BR: Dictionary = TU["BRAND"]
	var turn := floori(t * 8.0) % int(BR["turns"])
	var left := clampi(ceili(float(p["t"]) / float(U.ut["brand"]["secs"]) * float(BR["steps"])), 0, int(BR["steps"]))
	var hot: bool = p["act"] == "rise" and float(p["act_t"]) < 0.1
	var a: float = 0.55 if float(p["t"]) < 2.0 and floori(t * 10.0) % 2 == 0 else 0.95
	_brand(c, roundf(_gx(at.x, at.y)) * 2.0, roundf(_gy(at.x, at.y)) * 2.0, r, turn, left, hot, a)


## (art/unique_play_art.ts paintBrand) THE BRAND under it on the floor, the floor's own slant: a ring and a stroke through it, a bar
## across each end, in the friend's cyan; the ring burnt away from its top round as its time runs out (a few dim embers left);
## `hot`, white. Picture pixels, its middle at (sx, sy).
func _brand(c: CanvasItem, sx: float, sy: float, r: float, turn: int, left: int, hot: bool, alpha: float) -> void:
	var reach := r + 7.0
	var h := reach + 3.0
	var cx := reach
	var cy := floorf(h / 2.0)
	var RC: Array = D["colors"]["RISEN_CYAN"]
	var dim := Color(RC[0])
	var body := Color(RC[1])
	var light := Color(RC[2])
	var white := Color(RC[3])
	var px := {}
	var put := func(x: float, y: float, colr: Color) -> void:
		px[Vector2i(roundi(cx + x), roundi(cy + y * 0.5))] = colr
	var BR: Dictionary = D["tune"]["BRAND"]
	var share := float(left) / float(BR["steps"])
	var n := ceili(r * 7.0)
	for i in n:
		var u := float(i) / n
		var an := -PI / 2.0 + u * TAU
		var lit := u < share
		var tip := lit and share < 1.0 and u > share - 0.035
		for pair in [[r, white if hot or tip else (body if lit else dim)], [r - 1.1, white if hot or tip else (light if lit else dim)]]:
			var rr: float = pair[0]
			if not lit and not hot and (i % 7 > 1 or rr < r):
				continue
			put.call(cos(an) * rr, sin(an) * rr, pair[1])
	var a := float(turn) / float(BR["turns"]) * PI
	var ux := cos(a)
	var uy := sin(a)
	var R := r + 4.5
	var tt := -R
	while tt <= R:
		put.call(ux * tt, uy * tt, white if hot else (light if absf(tt) < r * 0.5 else body))
		put.call(ux * tt - uy * 0.9, uy * tt + ux * 0.9, white if hot else body)
		tt += 0.4
	for e in [-R, R]:
		var q := -2.6
		while q <= 2.6:
			put.call(ux * e - uy * q, uy * e + ux * q, white if hot else light)
			q += 0.4
	for k in px:
		var colr: Color = px[k]
		colr.a = alpha
		c.draw_rect(Rect2(sx - cx + k.x, sy - cy + k.y, 1, 1), colr)


# --- in the air ---

## The uniques lying on the floor, as loot.gd keeps them.
func _drops() -> Array:
	var L = fx.monsters.main.loot if fx.monsters != null and is_instance_valid(fx.monsters) and fx.monsters.main != null else null
	if L == null:
		return []
	return L._drops.filter(func(d): return d["kind"] == "gear" and int(d["item"].get("rarity", 0)) == 3)


## WHAT IS OVER EVERYTHING (fx.gd's air pass): the beam over each unique lying on the floor; the burst of the risen one's blow.
func draw_air(c: CanvasItem) -> void:
	_lights = []
	var TU: Dictionary = D["tune"]
	var DB: Dictionary = TU["DROP_BEAM"]
	var orange := Color("#ff8a3a")
	for dr in _drops():
		var sx := roundf(_gx(dr["at"].x, dr["at"].y))
		var sy := roundf(_gy(dr["at"].x, dr["at"].y))
		var age: float = maxf(0.0, float(dr["age"]))
		var grow := minf(1.0, age / float(DB["rises"]))
		var hot := age < float(DB["white"])
		var tall := float(DB["tall"]) * grow
		var half := (float(DB["wide"]) - 1.0) / 2.0 + (2.0 if hot else 0.0)
		var i := 0.0
		while i < tall:
			# (brightest at its foot, thinning to nothing at its top; it breathes)
			var k := 1.0 - i / float(DB["tall"])
			var beat := 0.82 + 0.18 * sin(t * 5.0 + dr["at"].x * 3.0 - i * 0.12)
			var cc: Color = Color.WHITE if hot else orange
			c.draw_rect(Rect2((sx - half) * 2.0, (sy - 6.0 - i) * 2.0, (half * 2.0 + 1.0) * 2.0, 4.0), Color(cc, 0.4 * k * beat))
			c.draw_rect(Rect2((sx - 1.0) * 2.0, (sy - 6.0 - i) * 2.0, 6.0, 4.0), Color(cc, 0.65 * k * beat))
			c.draw_rect(Rect2(sx * 2.0, (sy - 6.0 - i) * 2.0, 2.0, 4.0), Color(1, 1, 1, 0.8 * k))
			i += 2.0
		# (motes of it rising up the beam)
		if grow >= 1.0:
			for m in int(DB["motes"]):
				var u := fmod(t * 0.55 + float(m) / float(DB["motes"]) + dr["at"].x * 0.37, 1.0)
				var mc: Color = Color.WHITE if m % 2 else orange
				c.draw_rect(Rect2((sx - 3.0 + float((m * 5 + floori(dr["at"].y * 7.0)) % 7)) * 2.0, roundf(sy - 8.0 - u * float(DB["tall"]) * 0.8) * 2.0, 2, 2), Color(mc, 0.9 * (1.0 - u)))
	for b in blows:
		var age := floori(b["t"] * 30.0)
		if age >= int(TU["RISEN_BLOW_FRAMES"]):
			continue
		_draw_pic(c, pic("blow|%d|%d" % [age, int(b["seed"]) % 4]), roundf(_gx(b["x"], b["y"])) * 2.0, roundf(_gy(b["x"], b["y"]) - b["z"]) * 2.0)
	var U = _uq()
	if U != null:
		for bl in U.blades:
			_blade(c, bl)
	_s1_air(c)
	_lit(c)


## (render/unique_fx.ts drawBlade) THE WINDCUTTER'S BLADE in flight: a crescent of rushing air standing at the height of his swing,
## bowed the way it flies, tallest in its middle, drawn point by point in the world; its shadow on the floor; wind streaming back off
## it in broken lines that run as it flies; its body a sheet of air, white at its front thinning back into the air's greys; its top
## his cyan. It spreads off his sword in its first moments and frays into wind over the end of its flight.
func _blade(c: CanvasItem, p: Dictionary) -> void:
	var B: Dictionary = D["tune"]["BLADE"]
	var AIR: Array = D["colors"]["AIR"]
	var air: Array = AIR.map(func(h): return Color(h))
	var sp: float = maxf(0.0001, (p["v"] as Vector2).length())
	var fxv: float = p["v"].x / sp
	var fyv: float = p["v"].y / sp
	var born := minf(1.0, float(p["age"]) / float(B["spreads"]))
	var fade := clampf(float(p["left"]) / float(B["frays"]), 0.0, 1.0)
	var span := float(B["span"]) * (0.45 + 0.55 * born)
	var R := float(p["r"]) * float(B["wide"]) / sin(float(B["span"]))
	var run := floori(t * 30.0)
	var px: float = p["at"].x
	var py: float = p["at"].y
	var at := func(a: float, back: float) -> Vector2:
		var rj := R - back
		var ca := cos(a) * rj - R
		var sa := sin(a) * rj
		return Vector2(px + fxv * ca - fyv * sa, py + fyv * ca + fxv * sa)
	var steps := maxi(12, ceili(span * R * 2.0 * 24.0))
	var tall := func(mid: float) -> float:
		return maxf(1.0, roundf((float(B["low"]) + (float(B["tall"]) - float(B["low"])) * pow(mid, 0.7)) * (0.5 + 0.5 * born) * (0.55 + 0.45 * fade)))
	var dot := func(x: float, y: float, w: float, h: float, col: Color, a: float) -> void:
		c.draw_rect(Rect2(x * 2.0, y * 2.0, w * 2.0, h * 2.0), Color(col, clampf(a, 0.0, 1.0)))
	var high: float = float(B["high"])
	# ITS SHADOW on the floor under it
	var k := 0
	while k <= steps:
		var q: Vector2 = at.call(-span + 2.0 * span * k / steps, 0.1)
		dot.call(roundf(_gx(q.x, q.y)), roundf(_gy(q.x, q.y)), 2.0, 1.0, Color.BLACK, 0.22 * fade * born)
		k += 2
	# THE WIND STREAMING BACK OFF IT
	for i in 7:
		var a: float = span * 0.85 * (-1.0 + 2.0 * i / 6.0)
		var mid: float = 1.0 - absf(a) / span
		var h: float = tall.call(mid)
		for lr in [[0.85, 0], [0.5, 1], [0.15, 2]]:
			var lvl: float = lr[0]
			var row: int = lr[1]
			var long: float = float(B["streams"]) * (0.3 + 0.7 * mid) * (1.0 if row == 1 else 0.7) * (1.0 + 0.8 * (1.0 - fade)) * born
			var z: float = high - h / 2.0 + h * lvl
			var bk := 0.1
			var n := 0
			while bk < long:
				if (n + run + i * 3 + row * 2) % 6 >= 2:
					var kk: float = bk / long
					var q: Vector2 = at.call(a, bk)
					dot.call(roundf(_gx(q.x, q.y)), roundf(_gy(q.x, q.y)) - roundf(z), 1.0, 1.0, air[1] if kk < 0.35 else (air[2] if kk < 0.7 else air[3]), (1.0 - kk) * (0.8 if row == 1 else 0.6) * (0.45 + 0.55 * fade))
				bk += 0.05
				n += 1
	# ITS BODY, back to front
	for j in [2, 1, 0]:
		var sj: float = span * (1.0 - j * 0.1) * (0.65 + 0.35 * fade if fade < 1.0 else 1.0)
		for kb in steps + 1:
			var a: float = -sj + 2.0 * sj * kb / steps
			var mid: float = 1.0 - absf(a) / sj
			if fade < 1.0 and (kb * 7 + run * 3 + j) % 10 >= roundi(10.0 * fade):
				continue
			var q: Vector2 = at.call(a, 0.04 + j * 0.1)
			var h: float = maxf(1.0, roundf(tall.call(mid) * (1.0 - j * 0.2)))
			var X := roundf(_gx(q.x, q.y))
			var top := roundf(_gy(q.x, q.y)) - roundf(high + h / 2.0)
			for r in int(h):
				if j > 0 and (r + j + ((kb + run * 2) >> 1)) % 3 == 0:
					continue
				var col: Color = (air[0] if r < h / 2.0 else air[1]) if j == 0 else (air[2] if j == 1 else air[3])
				dot.call(X, top + r, 2.0, 1.0, col, (0.85 if j == 0 else (0.4 if j == 1 else 0.22)) * (0.4 + 0.6 * fade))
	# ITS EDGE, along its top, his cyan
	var edge := Color(B["edge"])
	for ke in steps + 1:
		var a: float = -span + 2.0 * span * ke / steps
		var mid: float = 1.0 - absf(a) / span
		if mid <= 0.15:
			continue
		var q: Vector2 = at.call(a, -0.03)
		var h: float = tall.call(mid)
		dot.call(roundf(_gx(q.x, q.y)), roundf(_gy(q.x, q.y)) - roundf(high + h / 2.0) - 1.0, 2.0, 1.0, edge, fade * born)


## (engine/px.ts drawGlow) The risen one's cold light, added over what is there.
func _lit(c: CanvasItem) -> void:
	if _add == null or not is_instance_valid(_add):
		_add = _AddLayer.new()
		_add.owner_fx = self
		var mat := CanvasItemMaterial.new()
		mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		_add.material = mat
		_add.z_index = c.z_index
		c.get_parent().add_child(_add)


func draw_add(c: CanvasItem) -> void:
	for l in _lights:
		var r: float = l[2]
		c.draw_texture_rect(_glow, Rect2((l[0] - r) * 2.0, (l[1] - r) * 2.0, r * 4.0, r * 4.0), false, Color(l[3], clampf(l[4], 0.0, 1.0)))
	_lights = []
	var U = _uq()
	var p = U.risen if U != null else null
	if p == null:
		return
	var RS: Dictionary = D["tune"]["RISEN_SHOWN"]
	var a: float = 0.2 + 0.25 * (1.0 - minf(1.0, float(p["act_t"]) / float(RS["rise"]))) if p["act"] == "rise" else 0.17
	var x := _gx(p["at"].x, p["at"].y) * 2.0
	var y := (_gy(p["at"].x, p["at"].y) - 12.0) * 2.0
	c.draw_texture_rect(_glow, Rect2(x - 60.0, y - 60.0, 120.0, 120.0), false, Color(Color("#28dcf0"), a))


class _AddLayer extends Node2D:
	var owner_fx

	func _draw() -> void:
		owner_fx.draw_add(self)


# --- SET 1's looks (render/set1_fx.ts), drawn in game pixels at twice ---

static func _h(i: int, k: int) -> float:
	var v := sin(i * 127.1 + k * 311.7) * 43758.5453
	return v - floorf(v)


func _px(c: CanvasItem, x: float, y: float, w: float, h: float, col: Color, a := 1.0) -> void:
	c.draw_rect(Rect2(roundf(x) * 2.0, roundf(y) * 2.0, w * 2.0, h * 2.0), Color(col, clampf(a, 0.0, 1.0) * col.a))


## An ellipse's arc from `a0` to `a1`, its middle (cx, cy), `rx` by `ry` (game pixels), `w` wide.
func _ell(c: CanvasItem, cx: float, cy: float, rx: float, ry: float, a0: float, a1: float, col: Color, w: float, fill := false) -> void:
	var pts := PackedVector2Array()
	var n := maxi(12, ceili((a1 - a0) * maxf(rx, ry) * 0.5))
	for k in n + 1:
		var a := a0 + (a1 - a0) * k / n
		pts.append(Vector2((cx + cos(a) * rx) * 2.0, (cy + sin(a) * ry) * 2.0))
	if fill:
		c.draw_colored_polygon(pts, col)
	else:
		c.draw_polyline(pts, col, w * 2.0)


func _glow_add(x: float, y: float, r: float, col: Color, a: float) -> void:
	_lights.append([x, y, r, col, a])


func _s1_ground(c: CanvasItem) -> void:
	# STARBREAKER: the shadow of what is falling, growing and darkening as it comes
	for f in s1_falls:
		var k := minf(1.0, f["t"] / f["dur"])
		_ell(c, roundf(_gx(f["x"], f["y"])), roundf(_gy(f["x"], f["y"])), (0.4 + 0.9 * k) * TX * 0.5, (0.4 + 0.9 * k) * TY * 0.5, 0.0, TAU, Color(0, 0, 0, 0.25 + 0.4 * k), 1.0, true)
	var U = _uq()
	if U != null:
		# GYRE: wind streaming round each spinning axe, as far as it cuts
		var G: Dictionary = U.ut["gyre"]
		for q in U.gyres:
			var cx := _gx(q["at"].x, q["at"].y)
			var cy := _gy(q["at"].x, q["at"].y)
			var fade := minf(1.0, float(q["t"]) / 0.4)
			for k in 3:
				var a0 := -s1_clock * 9.0 + k * TAU / 3.0
				for st in 10:
					var a := a0 + st * 0.09
					var rr := 0.75 + 0.25 * (st / 10.0)
					_px(c, cx + cos(a) * float(G["r"]) * TX * rr, cy + sin(a) * float(G["r"]) * TY * rr, 2.0, 1.0, Color(S1["wind"][1] if st < 3 else S1["wind"][0]), (0.55 - st * 0.045) * fade)
		# DEADWEIGHT: an iron stud on the floor round his feet for each Smash in a row
		var n: int = int(U.uq["weight"]) if U.wears("deadweight") else 0
		if n > 0:
			var hw: Vector2 = fx.hero_at()
			var cx := _gx(hw.x, hw.y)
			var cy := _gy(hw.x, hw.y)
			for k in n:
				var a := PI / 2.0 + (k - (n - 1) / 2.0) * 0.55
				var x := roundf(cx + cos(a) * 13.0)
				var y := roundf(cy + sin(a) * 6.5)
				_px(c, x - 2.0, y - 1.0, 4.0, 3.0, Color(S1["iron"][0]))
				_px(c, x - 1.0, y - 1.0, 2.0, 1.0, Color(S1["iron"][2]))
	# DEATH KNELL: a peal's shock, a great ring going out over the floor
	for r in s1_peals:
		var k: float = r["t"] / 0.5
		var cx := roundf(_gx(r["x"], r["y"]))
		var cy := roundf(_gy(r["x"], r["y"]))
		_ell(c, cx, cy, r["r"] * TX * (0.3 + 0.7 * k), r["r"] * TY * (0.3 + 0.7 * k), 0.0, TAU, Color(Color(S1["bell"][2]), 0.95 * (1.0 - k)), 3.0)
		_ell(c, cx, cy, r["r"] * TX * (0.2 + 0.6 * k), r["r"] * TY * (0.2 + 0.6 * k), 0.0, TAU, Color(Color(S1["bell"][0]), 0.95 * (1.0 - k)), 1.0)
	# STARBREAKER: where it struck, the ground thrown up in a ring
	for q in s1_strikes:
		var k: float = q["t"] / float(METEOR["strike"])
		_ell(c, roundf(_gx(q["x"], q["y"])), roundf(_gy(q["x"], q["y"])), q["r"] * TX * (0.4 + 0.8 * k), q["r"] * TY * (0.4 + 0.8 * k), 0.0, TAU,
			Color(Color(S1["fire"][2] if q["big"] else S1["fire"][1]), 0.7 * (1.0 - k)), 2.0 if q["big"] else 1.0)


func _s1_air(c: CanvasItem) -> void:
	var F: Array = S1["fire"].map(func(h): return Color(h))
	var rock: Array = S1["rock"].map(func(h): return Color(h))
	# STARBREAKER: the meteor falling, its fire streaming back up the way it came
	for f in s1_falls:
		var k := minf(1.0, f["t"] / f["dur"])
		var e := k * k
		var gx := _gx(f["x"], f["y"])
		var gy := _gy(f["x"], f["y"])
		var at := func(q: float) -> Vector2: return Vector2(gx + float(METEOR["right"]) * (1.0 - q), gy - 6.0 - float(METEOR["high"]) * (1.0 - q))
		for i in range(int(METEOR["trail"]), 0, -1):
			var q := maxf(0.0, e - i * 0.03)
			var p: Vector2 = at.call(q)
			var sz := maxf(2.0, roundf(float(METEOR["size"]) * 1.1 * (1.0 - float(i) / (int(METEOR["trail"]) + 2))))
			_px(c, p.x - sz / 2.0, p.y - sz / 2.0, sz, sz, F[3] if i < 3 else (F[2] if i < 5 else F[1]), 0.85 * (1.0 - float(i) / (int(METEOR["trail"]) + 1)))
		var p: Vector2 = at.call(e)
		_glow_add(p.x, p.y, 26.0 + 14.0 * k, F[2], 0.65)
		var S: float = float(METEOR["size"])
		var x0 := roundf(p.x - S / 2.0)
		var y0 := roundf(p.y - S / 2.0)
		_px(c, x0 + 2.0, y0, S - 4.0, S, rock[0])
		_px(c, x0, y0 + 2.0, S, S - 4.0, rock[0])
		_px(c, x0 + 1.0, y0 + 1.0, S - 2.0, S - 2.0, rock[0])
		_px(c, x0 + 3.0, y0 + 2.0, S - 6.0, 3.0, rock[1])
		_px(c, x0 + 4.0, y0 + 2.0, 3.0, 1.0, rock[2])
		_px(c, x0, y0 + 3.0, 2.0, S - 5.0, F[2])
		_px(c, x0 + 2.0, y0 + S - 2.0, S - 5.0, 2.0, F[2])
		_px(c, x0 + 1.0, y0 + S - 3.0, 3.0, 2.0, F[3])
		_px(c, x0 + 1.0, y0 + S - 2.0, 1.0, 1.0, F[4])
	# STARBREAKER: its strike, a flash and rocks thrown up
	for q in s1_strikes:
		var k: float = q["t"] / float(METEOR["strike"])
		var gx := _gx(q["x"], q["y"])
		var gy := _gy(q["x"], q["y"])
		_glow_add(gx, gy - 6.0, (46.0 if q["big"] else 26.0) * (0.6 + 0.6 * k), F[2], (0.9 if q["big"] else 0.5) * (1.0 - k))
		if k < 0.2 and q["big"]:
			_glow_add(gx, gy - 6.0, 22.0, F[4], 1.0 - k * 5.0)
		var n: int = int(METEOR["rocks"]) if q["big"] else 4
		for i in n:
			var a := float(i) / n * TAU + _h(i, 1)
			var v := 40.0 + 50.0 * _h(i, 2)
			var up := 70.0 + 60.0 * _h(i, 3)
			var tt: float = q["t"]
			_px(c, gx + cos(a) * v * tt, gy - 4.0 + sin(a) * v * tt * 0.5 - up * tt + 260.0 * tt * tt, 2.0, 2.0, F[2] if i % 3 == 0 else rock[1], 1.0 - k)
	# RED TITHE: the blood thrown in an arc, drops trailing it
	var BL: Array = S1["blood"].map(func(h): return Color(h))
	for b in s1_bloods:
		var k := minf(1.0, b["t"] / b["dur"])
		var x0 := _gx(b["x0"], b["y0"])
		var y0 := _gy(b["x0"], b["y0"]) - 10.0
		var x1 := _gx(b["x1"], b["y1"])
		var y1 := _gy(b["x1"], b["y1"]) - 10.0
		var lift := 18.0 + Vector2(x1 - x0, y1 - y0).length() * 0.25
		for i in 6:
			var q := maxf(0.0, k - i * 0.05)
			var x := x0 + (x1 - x0) * q
			var y := y0 + (y1 - y0) * q - lift * 4.0 * q * (1.0 - q)
			var sz := 4.0 if i == 0 else (3.0 if i < 3 else 2.0)
			_px(c, x - sz / 2.0, y - sz / 2.0, sz, sz, BL[2] if i == 0 else (BL[1] if i < 3 else BL[0]))
	for r in s1_splashes:
		var k: float = r["t"] / 0.4
		var x := _gx(r["x"], r["y"])
		var y := _gy(r["x"], r["y"]) - 10.0
		for i in 8:
			var a := float(i) / 8.0 * TAU
			_px(c, x + cos(a) * 12.0 * k, y + sin(a) * 6.0 * k + 10.0 * k * k, 3.0, 3.0, BL[1] if i % 2 else BL[2], 1.0 - k)
	# DEATH KNELL: the rings of a struck bell going out from each enemy still ringing
	var U = _uq()
	if U != null and U.wears("deathknell") and fx.monsters != null and is_instance_valid(fx.monsters):
		var B: Array = S1["bell"].map(func(h): return Color(h))
		for m in fx.monsters.list:
			if not is_instance_valid(m) or m.dead or m.knell_t <= 0.0:
				continue
			var cx := roundf(_gx(m.world.x, m.world.y))
			var cy := roundf(_gy(m.world.x, m.world.y) - 14.0)
			var strong := minf(1.0, m.knell_t / 1.2)
			for w in 2:
				var k := fmod(s1_clock * 1.6 + w * 0.5, 1.0)
				var col: Color = Color(B[1] if w else B[2], 0.95 * (1.0 - k) * strong)
				_ell(c, cx, cy, 5.0 + 12.0 * k, 3.0 + 6.0 * k, PI * 1.05, PI * 1.95, col, 1.0 if w else 2.0)
				_ell(c, cx, cy, 5.0 + 12.0 * k, 3.0 + 6.0 * k, PI * 0.05, PI * 0.95, col, 1.0 if w else 2.0)
	# GYRE: the dust it throws up as it falls
	for r in s1_dusts:
		var k: float = r["t"] / 0.5
		var x := _gx(r["x"], r["y"])
		var y := _gy(r["x"], r["y"])
		for i in 6:
			var a := float(i) / 6.0 * TAU + 0.3
			_px(c, x + cos(a) * 12.0 * k, y + sin(a) * 6.0 * k - 4.0 * k, 2.0, 2.0, Color(S1["wind"][i % 2]), 0.7 * (1.0 - k))
