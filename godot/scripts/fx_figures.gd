## WHAT THE FIGHT LAYS OVER A FIGURE'S OWN PICTURE (render.ts drawWorld, where it stands the monsters and the hero): the game
## draws a figure and then, over it, the same picture in one flat colour (art `silhouette`), as strong as its state says:
##   FROZEN solid: a block of pale ice, 0.78 of P.bu5; and round it icicles at its feet and glints on the block (its `marks`)
##   CHILLED: 0.34 of P.bu4
##   BURNING: it flickers orange under the flames, 0.16 to 0.30 of P.fr4
##   POISONED: a sick green, the sicker the more doses it carries, 0.2 and 0.04 a dose (0.5 at most) of P.vn4
## (in that order: the first that holds; none while it flashes white from a blow, which is monster.gd's own). The state is
## read off the monster: `frozen_t`, `chill_t`, `burn_t`, `poison_t`, `poison_n` (see `state`: a field monster.gd does not
## keep is not shown; the check fakes one as metadata of that name).
## And what moves a picture: a STAGGER's knock and a STUN's sway (fx_words3.gd shift_of).
## And THE ICE BREAKING: one seen frozen that is frozen no longer, or dies in its ice, sheds it (game.ts tells `shatter`).
## And THE HERO'S PHANTOMS (fx.ts ghostAsks, render.ts ghosts): his picture in one colour, standing where the effects ask,
## just behind what stands there, held and then fading: the blur behind a Swift cut (his attack's first picture), the
## afterimages he leaves while "of Swiftness" lasts (the picture he is in).
##
## A tint is a picture of its own, a child of the monster's node laid over its sprite, following it each frame once the
## monsters have stepped (fx.gd _late); a phantom is a picture among what stands, at its own depth.
## Left out: the drained grey of the cursed and the slowed (Hexing, Stilling), Twin's and an echo's phantoms.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const L := preload("res://scripts/fx_looks.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Hero := preload("res://scripts/hero.gd")

## A picture in one flat colour (art `silhouette`): the colour and strength it is given as its `modulate`.
const SILHOUETTE := """
shader_type canvas_item;
varying vec4 tint;
void vertex() {
	tint = COLOR;
}
void fragment() {
	COLOR = vec4(tint.rgb, tint.a * texture(TEXTURE, UV).a);
}
"""

## The states read off a monster each frame (monster.gd's fields), and the bit `read` gives each.
const STATES: Array[StringName] = [&"frozen_t", &"chill_t", &"burn_t", &"poison_t", &"stun_t", &"stagger_t"]
const FROZEN := 1
const CHILLED := 2
const BURNING := 4
const POISONED := 8
const STUNNED := 16
const STAGGERED := 32

static var _flat: ShaderMaterial

var fx
## The check fakes a state monster.gd does not keep as the monster's metadata of that name: read only when this says so.
var faked := false
## The hero's phantoms: {node, t, dur, alpha, color}.
var ghosts: Array = []
## Whether monster.gd keeps a field of each name (looked up once); and which of STATES it keeps, as bits (under 0: not
## looked up yet).
var _kept := {}
var _reads := -1
## The monsters in a state this frame, by instance id: [the monster, frozen, chilled, burning, poisoned].
var _touched := {}
var _tints := {}
var _moved := {}
var _frozen := {}
var _broke: Array = []
var _headroom := -1.0


## A monster's state by name (seconds left of it, or how many): the field monster.gd keeps; 0 where it keeps none.
func state(m: Object, name: String) -> float:
	var kept = _kept.get(name)
	if kept == null:
		kept = name in m
		_kept[name] = kept
	if kept:
		return float(m.get(name))
	return float(m.get_meta(name, 0.0)) if faked else 0.0


## A monster's states read at once, as bits (0: in none, as nearly all are): FROZEN, CHILLED, BURNING, POISONED, STUNNED,
## STAGGERED. Where monster.gd keeps none of the fields and none is faked, nothing is looked up at all.
func read(m: Object) -> int:
	if _reads < 0:
		_reads = 0
		for i in STATES.size():
			if STATES[i] in m:
				_reads |= 1 << i
	var bits := 0
	if faked:
		for i in STATES.size():
			if state(m, STATES[i]) > 0.0:
				bits |= 1 << i
		return bits
	if _reads == 0:
		return 0
	for i in STATES.size():
		if _reads & (1 << i) != 0 and float(m.get(STATES[i])) > 0.0:
			bits |= 1 << i
	return bits


static func _flat_material() -> ShaderMaterial:
	if _flat == null:
		_flat = ShaderMaterial.new()
		_flat.shader = Shader.new()
		_flat.shader.code = SILHOUETTE
	return _flat


func clear() -> void:
	for g: Dictionary in ghosts:
		if is_instance_valid(g["node"]):
			g["node"].queue_free()
	ghosts = []
	for id in _tints:
		if is_instance_valid(_tints[id]):
			_tints[id].queue_free()
	_tints = {}
	_touched = {}
	_moved = {}
	_frozen = {}
	_broke = []


func alive() -> bool:
	return not (ghosts.is_empty() and _frozen.is_empty() and _touched.is_empty())


## How far above the hero's feet things over his head begin, game pixels (render.ts: `fx.headroom`, the height of the
## picture he stands in).
func headroom() -> float:
	if _headroom < 0.0:
		var h = fx.hero()
		var art = h.get("art") if h != null else null
		if art == null:
			return 32.0
		var f: Dictionary = art.frame(BakedHero.SIDES.find("front"), BakedHero.IDLE, 0)
		_headroom = -float(f["offset"].y) * float(f["scale"]) / 2.0
	return _headroom


## Which swing of Strike the hero is in: 1 the second, the swipe back (the rules' Hero.combo; hero.gd `_combo_next`).
func hero_combo() -> int:
	var h = fx.hero()
	return 1 if h != null and h.get("_combo_next") == true else 0


# --- the monsters' states, as fx.gd `ambient` reads them each frame ---

## A frame's reading begins.
func begin() -> void:
	_touched.clear()


## A monster in a state this frame.
func touched(m: Object, frozen: bool, chilled: bool, burning: bool, poisoned: bool) -> void:
	var id := m.get_instance_id()
	_touched[id] = [m, frozen, chilled, burning, poisoned]
	if frozen:
		_frozen[id] = m.world


## The frame's reading done: one that was frozen and is so no longer, or has died in its ice, sheds it.
func thaws() -> void:
	for id in _frozen.keys():
		var q = _touched.get(id)
		if q != null and q[1]:
			continue
		var m = instance_from_id(id)
		if m == null or not is_instance_valid(m):
			_frozen.erase(id)
			continue
		# (frozen still, only out of sight)
		if not m.dead and state(m, "frozen_t") > 0.0:
			continue
		var at: Vector2 = _frozen[id]
		_frozen.erase(id)
		if not broke_lately(at.x, at.y):
			broke(at.x, at.y)
			fx.shatter(at.x, at.y)


## Ice broke here just now (so that a telling of it and its being seen do not both show it).
func broke(x: float, y: float) -> void:
	_broke.append(Vector3(x, y, fx.clock))


func broke_lately(x: float, y: float) -> bool:
	for b: Vector3 in _broke:
		if fx.clock - b.z < 0.3 and absf(b.x - x) < 0.5 and absf(b.y - y) < 0.5:
			return true
	return false


# --- what is laid over the monsters ---

## The colour laid over a monster's picture and how strongly (its alpha; none: 0), by its state (render.ts drawWorld):
## `q` as `touched` kept it.
func _tint(q: Array) -> Color:
	var m: Object = q[0]
	if m.dead:
		return Color(0, 0, 0, 0)
	# (struck: it flashes white, monster.gd's own)
	var struck = m.get("_flash")
	if struck != null and float(struck) > 0.0:
		return Color(0, 0, 0, 0)
	var base := _state_tint(q, m)
	# (m3: a melded word's mark, where it is stronger than its state's own: render.ts tintM3, `tn[1] > overA`)
	if fx.m3 != null:
		var t3: Color = fx.m3.tint(m)
		if t3.a > 0.0 and (base.a <= 0.0 or t3.a > base.a):
			base = t3
	# (v3: lit white as a blast, shard or arc of Volatile's five strikes it, crackling: render.ts tintV3, `tn[1] > overA`)
	# (the city's words: the cursed drained grey, the slowed mint, a held one white as its bands snap tight: fx_city3.gd)
	if fx.city3 != null:
		var tc: Color = fx.city3.tint(m, fx.wakes.list if fx.wakes != null and is_instance_valid(fx.wakes) else [])
		if tc.a > 0.0 and (base.a <= 0.0 or tc.a > base.a):
			base = tc
	if fx.v3 != null:
		var tv: Array = fx.v3.tint_of(m.id, fx.v3.clock)
		if not tv.is_empty() and float(tv[1]) > 0.0 and (base.a <= 0.0 or float(tv[1]) > base.a):
			base = Color(tv[0], float(tv[1]))
	return base


func _state_tint(q: Array, m: Object) -> Color:
	var t: float = fx.clock
	var id := float(m.get_instance_id() % 997)
	if q[1]:
		# frozen solid: a block of pale ice
		return Color(L.P["bu5"], 0.78)
	if q[2]:
		return Color(L.P["bu4"], 0.34)
	if q[3]:
		# on fire: it flickers orange under the flames
		return Color(L.P["fr4"], 0.16 + 0.14 * absf(sin(t * 17.0 + id)))
	if q[4]:
		# poisoned: it goes a sick green, the sicker the more doses it carries
		return Color(L.P["vn4"], minf(0.5, 0.2 + state(m, "poison_n") * 0.04) + 0.06 * sin(t * 6.0 + id))
	return Color(0, 0, 0, 0)


## Once the monsters have stepped: the picture of each the words have marked nudged by its stagger or its stun, and the
## tint of each in a state laid over its picture where it now is.
func follow() -> void:
	var marks: Dictionary = fx.words3.marks
	# (m3: and Avalanche's shove, the picture slid where the rules have put it: render.ts shiftM3)
	var slid := {}
	if fx.m3 != null and fx.m3.sliding():
		for s: Dictionary in fx.m3.slides:
			var o = instance_from_id(int(s["id"]))
			if o != null and is_instance_valid(o):
				slid[int(s["id"])] = o
	# (v3: and those a blast of Volatile's five has jolted, by the game's own id: render.ts shiftV3)
	var jolted := {}
	if fx.v3 != null and not fx.v3.jolts.is_empty() and fx.monsters != null and is_instance_valid(fx.monsters):
		var by_id := {}
		for j: Dictionary in fx.v3.jolts:
			by_id[j["id"]] = true
		for o in fx.monsters.list:
			if is_instance_valid(o) and by_id.has(o.id):
				jolted[o.get_instance_id()] = o
	var jolt := func(id: int) -> Vector2:
		return Vector2(fx.v3.shift_of(jolted[id].id)) if jolted.has(id) else Vector2.ZERO
	for id in marks:
		var m = marks[id]["m"]
		if is_instance_valid(m):
			_nudge(m, id, Vector2.ZERO if m.dead else (fx.words3.shift_of(m) + (fx.m3.shift_of(id) if slid.has(id) else Vector2.ZERO) + jolt.call(id)) * 2.0)
	for id in slid:
		var m = slid[id]
		if not marks.has(id):
			_nudge(m, id, Vector2.ZERO if m.dead else (fx.m3.shift_of(id) + jolt.call(id)) * 2.0)
	for id in jolted:
		var m = jolted[id]
		if not marks.has(id) and not slid.has(id):
			_nudge(m, id, Vector2.ZERO if m.dead else jolt.call(id) * 2.0)
	for id in _moved.keys():
		if not marks.has(id) and not slid.has(id) and not jolted.has(id):
			var m = instance_from_id(id)
			if m != null and is_instance_valid(m):
				_nudge(m, id, Vector2.ZERO)
			_moved.erase(id)
	for id in _touched:
		var q: Array = _touched[id]
		var m = q[0]
		if not is_instance_valid(m):
			continue
		var sp = m.get("_sprite")
		if not (sp is Sprite2D):
			continue
		var tint := _tint(q)
		var over = _tints.get(id)
		if tint.a <= 0.0:
			if over != null and is_instance_valid(over):
				over.visible = false
			continue
		if over == null or not is_instance_valid(over):
			over = Sprite2D.new()
			over.centered = false
			over.material = _flat_material()
			m.add_child(over)
			_tints[id] = over
		over.visible = true
		over.texture = sp.texture
		over.offset = sp.offset
		over.flip_h = sp.flip_h
		over.scale = sp.scale
		over.position = sp.position
		over.modulate = tint
	for id in _tints.keys():
		if not _touched.has(id):
			if is_instance_valid(_tints[id]):
				_tints[id].queue_free()
			_tints.erase(id)
	_hero_tint()


## WHAT THE MONSTERS' WORDS HAVE LEFT ON THE HERO, over his picture (render.ts drawWorld, the hero): CHILLED, 0.3 of P.bu4; else
## POISONED, 0.3 of P.vn4; nothing while a blow flashes him (hero.gd's own), nor once he has fallen. Read off his `chill_t`
## and `poison_t` (hero.gd). The tint is a picture of his, a child of his node named "StateTint", kept from place to place.
func _hero_tint() -> void:
	var h = fx.hero()
	if h == null:
		return
	var sp = h.get("_sprite")
	if not (sp is Sprite2D):
		return
	var tint := Color(0, 0, 0, 0)
	if h.alive and float(h.get("_flash")) <= 0.0:
		if float(h.get("chill_t")) > 0.0:
			tint = Color(L.P["bu4"], 0.3)
		elif float(h.get("poison_t")) > 0.0:
			tint = Color(L.P["vn4"], 0.3)
	var over = h.get_node_or_null("StateTint")
	if tint.a <= 0.0:
		if over != null:
			over.visible = false
		return
	if over == null:
		over = Sprite2D.new()
		over.name = "StateTint"
		over.centered = false
		over.material = _flat_material()
		h.add_child(over)
	over.visible = true
	over.texture = sp.texture
	over.offset = sp.offset
	over.flip_h = sp.flip_h
	over.scale = sp.scale
	over.position = sp.position
	over.modulate = Color(tint, tint.a * sp.modulate.a)


## A monster's picture moved `by` (picture pixels) from where it stands. monster.gd puts its picture in its place afresh
## each step: if it has not since the last nudge, that one is taken off again first.
func _nudge(m: Object, id: int, by: Vector2) -> void:
	var sp = m.get("_sprite")
	if not (sp is Sprite2D):
		return
	var was = _moved.get(id)
	if was != null and sp.position == was["at"]:
		sp.position -= was["by"]
	if by != Vector2.ZERO:
		sp.position += by
		_moved[id] = {"by": by, "at": sp.position}
	elif was != null:
		_moved.erase(id)


## Over the figures, under the dark: ice round the frozen, icicles at the feet and glints on the block (render.ts `marks`).
func draw_over(c: CanvasItem) -> void:
	var P: Dictionary = L.P
	for id in _touched:
		var q: Array = _touched[id]
		var m = q[0]
		if not q[1] or not is_instance_valid(m) or m.dead or not m.visible:
			continue
		var at: Vector2 = m.world
		var mx: float = floorf(fx.gx(at.x, at.y) + 0.5)
		var my: float = floorf(fx.gy(at.x, at.y) + 0.5)
		var seed: int = id % 100000
		for i in 5:
			var px := floorf(mx - 7.0 + i * 3.5 + L.hash2(i, seed, 1) * 2.0 + 0.5)
			var tall := 3.0 + floorf(L.hash2(i, seed, 2) * 4.0 + 0.5)
			fx.rect(c, px + 1.0, my - tall + 2.0, 1, tall, P["bu4"])
			fx.rect(c, px, my - tall + 1.0, 1, tall, P["white"])
		for i in 3:
			if L.hash2(i, seed, floori(fx.clock * 6.0)) > 0.5:
				continue
			fx.rect(c, floorf(mx - 5.0 + L.hash2(i, seed, 3) * 10.0 + 0.5), floorf(my - 6.0 - L.hash2(i, seed, 4) * 18.0 + 0.5), 2, 1, P["white"])


# --- the hero's phantoms ---

## A phantom of the hero at (x, y) facing (dx, dy), in his attack's first picture (fx.ts ghostAsks; render.ts: `actorSprite(
## heroArt, 'attack', 0, 1, a.dx, a.dy)`): `color`, for `dur` seconds after `delay`, `alpha` at its strongest.
func phantom(x: float, y: float, dx: float, dy: float, color: Color, dur: float, delay: float, alpha: float) -> void:
	var h = fx.hero()
	var art = h.get("art") if h != null else null
	if art == null:
		return
	var side: int = BakedHero.SIDES.find(Hero.FACING[posmod(roundi(rad_to_deg(atan2(dy, dx)) / 45.0), 8)])
	if art.count(side, BakedHero.ATTACK) == 0:
		return
	var f: Dictionary = art.frame(side, BakedHero.ATTACK, 0)
	_ghost(f["tex"], f["offset"], float(f["scale"]), Vector2(x, y), color, dur, delay, alpha)


## The hero as he is now, left behind him in one colour (render.ts: the afterimages of "of Swiftness").
func afterimage(h: Object, color: Color, dur: float, alpha: float) -> void:
	var sp = h.get("_sprite")
	if sp is Sprite2D and sp.texture != null:
		_ghost(sp.texture, sp.offset, sp.scale.x, h.world, color, dur, 0.0, alpha)


func _ghost(tex: Texture2D, offset: Vector2, scale: float, at: Vector2, color: Color, dur: float, delay: float, alpha: float) -> void:
	var stands = fx.monsters.get("stands") if fx.monsters != null and is_instance_valid(fx.monsters) else null
	if stands == null or not is_instance_valid(stands):
		return
	var s := Sprite2D.new()
	s.centered = false
	s.texture = tex
	s.scale = Vector2.ONE * scale
	s.material = _flat_material()
	# (among what stands, just behind one standing there: render.ts `this.stand(gh.x + gh.y - 0.02, ...)`. A fiftieth of a
	# tile is a third of a picture pixel, and what stands is put in order by whole pixels: one whole pixel behind, then)
	var scr := Iso.to_screen(at.x, at.y)
	var back := (at.x + at.y) * 16.0 - 1.0
	s.position = Vector2(scr.x, back)
	s.offset = offset + Vector2(0.0, (scr.y - back - fx.lift_at(at.x, at.y)) / scale)
	s.modulate = Color(color, 0.0)
	stands.add_child(s)
	ghosts.append({"node": s, "t": -delay, "dur": dur, "alpha": alpha, "color": color})
	if ghosts.size() > 24:
		var old: Dictionary = ghosts.pop_front()
		if is_instance_valid(old["node"]):
			old["node"].queue_free()


## The phantoms held, then fading over the last half of their time (render.ts ghosts); what is no longer there forgotten.
func tick(dt: float) -> void:
	for i in range(ghosts.size() - 1, -1, -1):
		var g: Dictionary = ghosts[i]
		g["t"] += dt
		var k: float = g["t"] / g["dur"]
		var node = g["node"]
		if k >= 1.0 or not is_instance_valid(node):
			if is_instance_valid(node):
				node.queue_free()
			ghosts.remove_at(i)
			continue
		node.modulate = Color(g["color"], 0.0 if k < 0.0 else g["alpha"] * (1.0 if k < 0.5 else 1.0 - (k - 0.5) / 0.5))
	for i in range(_broke.size() - 1, -1, -1):
		if fx.clock - _broke[i].z > 1.0:
			_broke.remove_at(i)
