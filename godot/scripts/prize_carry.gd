## A MONSTER CARRYING PLUNDERING OR GREED STANDS OUT (his words, 24 Nov 2026: “And I want finding a monster with quality or
## plundering to be pretty cool, like that's going to make your next floor super exciting to run”; offered a glow of its own and
## a sound as it comes into view, “Yeah that's cool”). On an endless level now and then one carries the prize (loot.gd
## RARE_CARRY, main.gd); with ON:
##   A PILLAR OF LIGHT rising from it high over the floor, seen over the dark and over walls from anywhere on the level (as a
##     great drop's beam is in the games he knows), Plundering's gold, Greed's magenta, motes of coin or gem rising in it, its
##     glints circling its feet: the way to it shown before it is seen.
##   As it first comes into sight near him: the rare find's chime, its rune named over it, and a line at the top, "A monster
##     here carries GREED!".
##   On entering the level, a line: "Something on this level carries PLUNDERING." (main.gd).
##   Its name over it in the prize's colour; on the maps, a larger mark in the prize's colour.
##   As it dies: a fountain of coins or gems, a flash, the chime.
## Its colours the enemy's gold and pink family (his Art Rulebook: what glows on an enemy is pink burning to gold). OFF until his
## yes to its pictures.
extends Node2D

static var ON := false
## (each prize's colours, darkest to brightest)
const COL := {"plundering": [Color("#6a3c08"), Color("#d08a18"), Color("#ffd24a"), Color("#fff4b8")],
	"greed": [Color("#4a0c38"), Color("#a62a6e"), Color("#f060c8"), Color("#ffd4f4")]}
const NAME := {"plundering": "PLUNDERING", "greed": "GREED"}
## (how near, tiles, it is when its finding is told)
const NEAR := 11.0
## (the pillar: how tall, game pixels; how wide at its foot)
const TALL := 130.0
const WIDE := 10.0

var mgr
var _told := {}
var t := 0.0


## The prize `m` carries, or "".
static func prize_of(m) -> String:
	if m == null or not is_instance_valid(m):
		return ""
	for w in ["plundering", "greed"]:
		if (m.carries as Array).has(w):
			return w
	return ""


static func color_of(m) -> Color:
	var p := prize_of(m)
	return COL[p][2] if p != "" else Color.WHITE


func _ready() -> void:
	z_index = 59
	# (light, added to what is under it, as the game's glows are)
	var mat := CanvasItemMaterial.new()
	mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = mat


func _process(dt: float) -> void:
	t += dt
	visible = ON
	if not ON or mgr == null or not is_instance_valid(mgr):
		return
	var h = mgr.hero
	for m in mgr.list:
		if not is_instance_valid(m) or m.dead:
			continue
		var p := prize_of(m)
		if p == "" or _told.has(m.get_instance_id()):
			continue
		if m.seen and h != null and is_instance_valid(h) and m.world.distance_to(h.world) <= NEAR:
			_told[m.get_instance_id()] = true
			found(m, p)
	queue_redraw()


## It has come into sight near him: the chime, its rune named over it, a line at the top.
func found(m, p: String) -> void:
	mgr.sfx.play("rare", linear_to_db(1.0))
	mgr.sfx.play("coin", linear_to_db(0.7))
	m._tell({"t": "text", "x": m.world.x, "y": m.world.y, "text": NAME[p].capitalize() + "!", "color": "#" + COL[p][3].to_html(false)})
	if mgr.loot != null:
		mgr.loot.say("A monster here carries %s!" % NAME[p], COL[p][2])


## As it dies: a fountain of coins or gems, a flash, the chime.
static func burst(m) -> void:
	var p := prize_of(m)
	if not ON or p == "" or m.mgr == null:
		return
	var C: Array = COL[p]
	var fx = m.mgr.fx
	if fx != null and is_instance_valid(fx):
		fx.flash(m.world.x, m.world.y, 14.0, 1.6, 0.3, PackedColorArray([Color.WHITE, C[3], C[2], C[1]]))
		fx.spray(m.world.x, m.world.y, 40, PackedColorArray([C[3], C[2], C[2], C[1]]), 4.5, 30.0, 14.0)
		fx.glow(m.world.x, m.world.y, 3.5, 0.8)
		if fx.has_method("kick"):
			fx.kick(2.0)
	m.mgr.sfx.play("rare", linear_to_db(1.0))
	m.mgr.sfx.play("gold", linear_to_db(0.9))


static func _hash(a: int, b: int) -> float:
	var h := (a * 374761393 + b * 668265263) & 0x7fffffff
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return float((h ^ (h >> 16)) % 10000) / 10000.0


func _draw() -> void:
	if not ON or mgr == null or not is_instance_valid(mgr):
		return
	for m in mgr.list:
		if not is_instance_valid(m) or m.dead:
			continue
		var p := prize_of(m)
		if p == "":
			continue
		_pillar(m, p)


## THE PILLAR: a shaft of the prize's light from its feet up past the walls, brightest at its heart and its foot, its edges
## shimmering, thinning and fading as it rises; motes of coin or gem drifting up in it; glints circling its feet. In game pixels
## (two of ours to one), crisp.
func _pillar(m, p: String) -> void:
	var C: Array = COL[p]
	var id: int = m.get_instance_id() & 0xffff
	draw_set_transform(m.position, 0.0, Vector2(2, 2))
	var pulse := 0.85 + 0.15 * sin(t * 4.0 + id)
	# (it rises from over its head and the rune it carries, so the monster itself is seen clear under it; its light pools at its
	# feet)
	var base := -float(m._head()) - 32.0 - float(m._lift) / 2.0
	var rows := int(TALL)
	for yy in range(0, rows, 2):
		var v := float(yy) / TALL
		var a := (1.0 - v) * (1.0 - v * 0.6) * pulse
		var fade_in := minf(1.0, float(yy) / 10.0)
		a *= fade_in
		if a <= 0.02:
			continue
		var wob := sin(t * 6.0 + yy * 0.35 + id) * 0.8
		var half := WIDE * 0.5 * (1.0 - v * 0.6) + wob * 0.5
		var y := base - float(yy)
		draw_rect(Rect2(roundf(-half - 2.0), y, roundf(half * 2.0 + 4.0), 2.0), Color(C[1].r, C[1].g, C[1].b, 0.35 * a))
		draw_rect(Rect2(roundf(-half), y, roundf(half * 2.0), 2.0), Color(C[2].r, C[2].g, C[2].b, 0.6 * a))
		draw_rect(Rect2(roundf(-half * 0.35) - 1.0, y, roundf(half * 0.7) + 2.0, 2.0), Color(C[3].r, C[3].g, C[3].b, 0.85 * a))
	# (a starburst where it springs from, over its head)
	var sp := 3.0 + 1.5 * sin(t * 5.0 + id)
	draw_rect(Rect2(-roundf(sp) - 2.0, base - 1.0, roundf(sp) * 2.0 + 4.0, 2.0), Color(C[3].r, C[3].g, C[3].b, 0.8))
	draw_rect(Rect2(-1.0, base - roundf(sp) - 2.0, 2.0, roundf(sp) * 2.0 + 4.0), Color(C[3].r, C[3].g, C[3].b, 0.8))
	# (motes rising in it)
	for k in 12:
		var u := fmod(t * (0.25 + 0.1 * _hash(id, k)) + _hash(id, k + 20), 1.0)
		var x := roundf((_hash(id, k + 40) - 0.5) * WIDE * 1.2 + sin(t * 3.0 + k) * 1.0)
		var y := base - roundf(u * TALL * 0.8) - 4.0
		var a := (1.0 - u) * 0.95
		draw_rect(Rect2(x, y, 1.0, 1.0), Color(C[3].r, C[3].g, C[3].b, a))
		if k % 3 == 0:
			draw_rect(Rect2(x - 1.0, y, 3.0, 1.0), Color(C[2].r, C[2].g, C[2].b, a * 0.6))
			draw_rect(Rect2(x, y - 1.0, 1.0, 3.0), Color(C[2].r, C[2].g, C[2].b, a * 0.6))
	# (glints circling its feet, on the floor's slant)
	for k in 6:
		var ang := t * 1.6 + k * TAU / 6.0
		var gx := roundf(cos(ang) * 10.0)
		var gy := roundf(sin(ang) * 5.0)
		var tw := 0.5 + 0.5 * sin(t * 9.0 + k * 2.0)
		draw_rect(Rect2(gx, gy, 1.0, 1.0), Color(C[3].r, C[3].g, C[3].b, 0.9 * tw))
		if tw > 0.7:
			draw_rect(Rect2(gx - 1.0, gy, 3.0, 1.0), Color(C[2].r, C[2].g, C[2].b, 0.7 * tw))
			draw_rect(Rect2(gx, gy - 1.0, 1.0, 3.0), Color(C[2].r, C[2].g, C[2].b, 0.7 * tw))
	# (a soft pool of its light on the floor round its feet)
	for r: float in [12.0, 8.0]:
		var a := 0.10 if r > 10.0 else 0.16
		for row in range(-int(r * 0.5), int(r * 0.5) + 1):
			var hw: float = r * sqrt(maxf(0.0, 1.0 - pow(float(row) / (r * 0.5), 2.0)))
			draw_rect(Rect2(roundf(-hw), float(row), roundf(hw * 2.0), 1.0), Color(C[2].r, C[2].g, C[2].b, a * pulse))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
