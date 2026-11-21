## WHAT THE MAGE SENDS AND SETS DOWN, AS THE GAME DRAWS IT (render/render.ts, her waves and her orbs; render/wild.ts drawWildWave):
##   HER WAVE IN FLIGHT flows along the ground (big and wild: a crest of force stood up tall on a wall of its own light, its white edge
##     boiling a pixel or two up and down from moment to moment; behind it the body of the wave lying flat and streaming back, darker
##     and thinner the further back, with gaps that run along it so that it is seen to flow; two faint ripples left on the floor
##     behind it), swelling out of the staff in its first moments and thinning away over the end of its flight; in her element's
##     tones (art/spells.ts SPELL_TONES), the mirror's teal for the second of a Twin pair, Leeching's red; Volatile shaking it.
##   HER ORB, a large ball hanging over the floor, turning (art/spells.ts: its pictures, assets/heroes/spells.png), bobbing: it comes
##     in at a pop, swells as its next wave gathers, gutters in its last half second (shrinks, and blinks in its last moments); tinted
##     by the words on it (render.ts wordTint); its shadow under it; motes of its colours rising off it; it stands among the
##     figures, nearer or further as they are.
##   THE LIGHT THEY CAST IN THE DARK (render.ts spot): a wave 52 game pixels round, an orb 44.
## And each frame it tells her effects (fx_wild_mage.gd) where her crystal is and how hot it burns (her frame's `charge`), where her
## waves and orbs are, and where the monsters are.
extends Node2D

const L := preload("res://scripts/fx_looks.gd")
const Iso := preload("res://scripts/iso.gd")
const Figures := preload("res://scripts/fx_figures.gd")

var kit
var loot
var _t := 0.0
var _sheet: Texture2D
var _pics := {}
var _tones := {}
var _frames := 8
## (each orb's own nodes, standing among the figures: {id: {node, shadow, ball, tint}})
var _orbs := {}
var _sil: ShaderMaterial
static var _blot: Texture2D = null


func _ready() -> void:
	L.ready_up()
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/spells.json"))
	_pics = d["pics"]
	_frames = int(d["orbFrames"])
	for k in d["tones"]:
		var t: Array = []
		for c in d["tones"][k]:
			t.append(Color(c))
		_tones[k] = t
	_sheet = load("res://assets/heroes/spells.png")
	_sil = ShaderMaterial.new()
	_sil.shader = Shader.new()
	_sil.shader.code = Figures.SILHOUETTE


func _exit_tree() -> void:
	for id in _orbs:
		var o: Dictionary = _orbs[id]
		if is_instance_valid(o["node"]):
			o["node"].queue_free()
	_orbs.clear()


## (the game's events for her are fx.gd's and fx_wild_mage.gd's)
func on_event(_e: Dictionary, _fx) -> void:
	pass


## (render.ts shadow's blot: black, full at its middle, 0.85 at 0.4 of its reach, nothing at its edge)
static func blot() -> Texture2D:
	if _blot == null:
		var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
		for y in 64:
			for x in 64:
				var d := Vector2(x + 0.5 - 32.0, y + 0.5 - 32.0).length() / 32.0
				var a := 1.0 - 0.15 * d / 0.4 if d < 0.4 else (0.85 * (1.0 - (d - 0.4) / 0.6) if d < 1.0 else 0.0)
				img.set_pixel(x, y, Color(0, 0, 0, a))
		_blot = ImageTexture.create_from_image(img)
	return _blot


func _process(dt: float) -> void:
	_t += dt
	if kit == null:
		return
	var h = kit.h
	var fx = h.fx if h != null else null
	if fx != null and is_instance_valid(fx):
		var wm = fx.wild_mage
		wm.orbs = kit.orbs
		var mobs: Array = []
		if h.monsters != null:
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead:
					mobs.append(m.world)
		wm.mobs = mobs
		wm.follow(kit.shots, dt * 60.0 * fx.room())
		fx.follow_shots(kit.shots, dt * 60.0)
		# (where her crystal burns in the frame she is shown in, and how hot: render.ts, fig.charge(); not while she comes together)
		var f: Dictionary = h._shown
		if not f.is_empty() and h._coming <= 0.0 and h.alive:
			var p: Dictionary = f["part"]
			var ch = p.get("charge")
			if ch != null:
				var dx := float(ch["x"]) - float(p["ax"])
				var dy := float(ch["y"]) - float(p["ay"])
				wm.charge(h.world.x + dx / 32.0, h.world.y - dx / 32.0, -dy, float(ch["heat"]), h.face.x, h.face.y)
		# (motes of its colours rising off each orb)
		for o in kit.orbs:
			if randf() < 0.35 * dt * 60.0:
				var cs: Array = _tones.get(str(o["element"]), _tones["phys"])
				fx.mote(float(o["x"]) + randf_range(-0.35, 0.35), float(o["y"]) + randf_range(-0.35, 0.35), PackedColorArray(cs.slice(1)))
	_place_orbs()
	queue_redraw()


## Her orbs, each among the figures where it hangs (render.ts: stood at its depth, a hair nearer than a figure on its spot).
func _place_orbs() -> void:
	var holder = kit.h.get_parent()
	var seen := {}
	for o in kit.orbs:
		var id: int = o["id"]
		seen[id] = true
		var n: Dictionary = _orbs.get(id, {})
		if n.is_empty() or not is_instance_valid(n["node"]):
			var node := Node2D.new()
			var shadow := Sprite2D.new()
			shadow.texture = blot()
			node.add_child(shadow)
			var ball := Sprite2D.new()
			ball.centered = false
			ball.texture = AtlasTexture.new()
			ball.texture.atlas = _sheet
			node.add_child(ball)
			var tint := Sprite2D.new()
			tint.centered = false
			tint.texture = AtlasTexture.new()
			tint.texture.atlas = _sheet
			tint.material = _sil
			node.add_child(tint)
			holder.add_child(node)
			n = {"node": node, "shadow": shadow, "ball": ball, "tint": tint}
			_orbs[id] = n
		var x: float = o["x"]
		var y: float = o["y"]
		var lift: float = kit.h.map.lift_at(x, y) if kit.h.map != null else 0.0
		n["node"].position = Iso.to_screen(x, y) + Vector2(0, 0.16)
		var el := str(o["element"])
		var key := "orb:%s:%d" % [el if _pics.has("orb:%s:0" % el) else "phys", (floori(_t * 11.0 + id * 3)) % _frames]
		var pic: Array = _pics[key]
		var born := minf(1.0, float(o["t"]) / 0.12)
		var gather := 1.0 - clampf(float(o["next"]) / float(kit.T["tune"]["orbEvery"]), 0.0, 1.0)
		var left := float(o["life"]) - float(o["t"])
		var dying := maxf(0.0, left / 0.5) if left < 0.5 else 1.0
		var scale := (0.5 + 0.5 * born) * (0.9 + 0.18 * gather * gather) * (0.65 + 0.35 * dying)
		var bob := sin(_t * 2.6 + id) * 1.5
		# (it does not flicker out of sight as it goes: it shrinks, and blinks in its last moments)
		var shown := not (dying < 0.5 and floori(_t * 24.0) % 2 == 0)
		var region := Rect2(pic[0], pic[1], pic[2], pic[3])
		var at := Vector2(0, (-13.0 + bob) * 2.0 - lift)
		for s in [n["ball"], n["tint"]]:
			s.texture.region = region
			s.position = at
			s.offset = -Vector2(pic[4], pic[5])
			s.scale = Vector2(scale, scale)
		n["ball"].visible = shown
		var wt := _word_tint(int(o["skill"]))
		n["tint"].visible = shown and wt.a > 0.0
		n["tint"].modulate = wt
		# (its shadow under it: render.ts shadow, 0.42 tiles, 0.85 of a figure's)
		var w := 0.42 * 22.6 * 1.5 * 2.0
		var hh := 0.42 * 11.3 * 1.5 * 2.0
		n["shadow"].position = Vector2(0, -lift)
		n["shadow"].scale = Vector2(w * 2.0 / 64.0, hh * 2.0 / 64.0)
		n["shadow"].modulate = Color(1, 1, 1, 0.7 * 0.85)
	for id in _orbs.keys():
		if not seen.has(id):
			if is_instance_valid(_orbs[id]["node"]):
				_orbs[id]["node"].queue_free()
			_orbs.erase(id)


## (render.ts wordTint) What a thing she made is tinted by the words in front of the move: Leeching's red, Volatile's flicker, Swift's
## green, Poison's, Power's; nothing for the rest.
func _word_tint(i: int) -> Color:
	var P: Dictionary = L.P
	var words: Array = kit.h.loadout.wfronts(i)
	if words.has("leech"):
		return Color(P["bl4"], 0.55)
	if words.has("volatile"):
		return Color(P["white"] if floori(_t * 20.0) % 2 == 0 else P["pu5"], 0.5)
	if words.has("swift"):
		return Color(P["gn5"], 0.3)
	if words.has("poison"):
		return Color(P["vn4"], 0.4)
	if words.has("power"):
		return Color(P["fr6"], 0.35)
	return Color(0, 0, 0, 0)


## The light her waves and orbs cast in the dark (render.ts spot): `spot` takes a place on the screen (game pixels), a reach, a strength.
func lights(spot: Callable, fx) -> void:
	for p in kit.shots:
		if p.get("look", "") == "wave":
			spot.call(fx.gx(p["x"], p["y"]), fx.gy(p["x"], p["y"]) - 10.0, 52.0, 0.8)
	for o in kit.orbs:
		spot.call(fx.gx(o["x"], o["y"]), fx.gy(o["x"], o["y"]) - 12.0, 44.0, 0.85)


func _gx(x: float, y: float) -> float:
	var fx = kit.h.fx
	return fx.gx(x, y) if fx != null and is_instance_valid(fx) else (x - y) * 16.0


func _gy(x: float, y: float) -> float:
	var fx = kit.h.fx
	return fx.gy(x, y) if fx != null and is_instance_valid(fx) else (x + y) * 8.0


func _draw() -> void:
	if kit == null:
		return
	var P: Dictionary = L.P
	for p in kit.shots:
		if p.get("look", "") != "wave":
			continue
		var words: Array = p["words"]
		var twin := int(p["n"]) > 0
		var tones: Array = [P["tl2"], P["tl4"], P["tl5"], P["white"]] if twin else ([P["bl2"], P["bl4"], P["bl5"], P["white"]] if words.has("leech") else _tones.get(str(p["element"]), _tones["phys"]))
		var volatile := words.has("volatile")
		var jx := roundf((randf() - 0.5) * 2.0) if volatile else 0.0
		var jy := roundf((randf() - 0.5) * 2.0) if volatile else 0.0
		_wild_wave(p, tones, jx, jy)


## A WAVE IN FLIGHT, BIG AND WILD (render/wild.ts drawWildWave), point by point along its front, in the world, so that it lies right
## whichever way it goes.
func _wild_wave(p: Dictionary, tones: Array, jx: float, jy: float) -> void:
	var C: PackedColorArray = L.CRACKLE
	var v := Vector2(p["vx"], p["vy"]).length()
	if v <= 0.0:
		v = 1.0
	var fwx: float = float(p["vx"]) / v
	var fwy: float = float(p["vy"]) / v
	var span := 1.0
	var r := float(p["r"]) * 1.1
	var R := r / sin(span)
	var born := minf(1.0, float(p["age"]) / 0.09)
	var fade := clampf(float(p["dist"]) / 1.8, 0.0, 1.0)
	var layers := 10
	var run := floori(_t * 24.0)
	var px0: float = p["x"]
	var py0: float = p["y"]
	for j in range(layers + 2, -1, -1):
		var ripple := j > layers
		var back := layers + (j - layers) * 4 if ripple else j
		var rj := R - back * 0.08
		var sj := span * maxf(0.2, 1.0 - back * (0.04 if ripple else 0.07)) * (0.45 + 0.55 * born)
		var steps := maxi(8, ceili(sj * rj * 2.0 * 22.0))
		for k in steps + 1:
			if back >= 3 and posmod(k + run * (1 if j % 2 == 0 else -1) + j * 3, 3 if ripple else 5) == 0:
				continue
			var a := -sj + (2.0 * sj * k) / steps
			var ca := cos(a) * rj - R
			var sa := sin(a) * rj
			var qx := px0 + fwx * ca - fwy * sa
			var qy := py0 + fwy * ca + fwx * sa
			var mid := 1.0 - absf(a) / sj
			var sx := roundf(_gx(qx, qy)) + jx
			var sy := roundf(_gy(qx, qy)) + jy
			if back == 0:
				# THE CREST: stood up on a wall of its own light, its white edge boiling
				var up := 3 + roundi(9.0 * mid * born) + (1 if randf() < 0.35 else 0) + (2 if mid > 0.4 and randf() < 0.18 else 0)
				for hh in up:
					var col: Color = tones[0] if hh < up * 0.35 else (tones[1] if hh < up * 0.7 else tones[2])
					draw_rect(Rect2(sx * 2.0, (sy - hh) * 2.0, 4.0, 2.0), Color(col, fade * 0.55))
				draw_rect(Rect2(sx * 2.0, (sy - up) * 2.0, 4.0, (2.0 + roundf(mid)) * 2.0), Color(tones[3], fade))
				draw_rect(Rect2(sx * 2.0, (sy - up - 1) * 2.0, 4.0, 2.0), Color(C[1] if randf() < 0.5 else C[0], fade))
				continue
			var col: Color = tones[1] if ripple else (tones[2] if back <= 2 else (tones[1] if back <= 5 else tones[0]))
			var al := 0.32 * fade * born if ripple else fade * (1.0 if back < 3 else (0.85 if back < 6 else 0.55))
			var up := (2 + roundi(5.0 * mid * born)) if back == 1 else ((1 + roundi(2.0 * mid * born)) if back == 2 else (1 if back == 3 else 0))
			draw_rect(Rect2(sx * 2.0, (sy - up) * 2.0, 4.0, 4.0 if back <= 2 else 2.0), Color(col, al))
