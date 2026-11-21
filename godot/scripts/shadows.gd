## THE SHADOW UNDER A FIGURE (render.ts shadow; the owner, 6 Oct 2026: "Draw a soft, semi-transparent black oval/circle on
## the floor directly beneath the Player and the Monsters to anchor them into the 3D space"). One soft oval (mage_look.gd blot:
## black, full at its middle, gone at its rim), stretched to each figure: `r` tiles round as the game has it, reaching half as
## far again, since its outer half is nearly nothing.
##   UNDER EVERY MONSTER in sight and not dead: m.r * 0.75 round, at SHADOW (0.7). One hidden (an inkling going about as a pool
##     of ink, the Fleshmancer between his two pits) has none, as its picture is not shown either.
##   UNDER THE HERO: 0.36 round; a hero in the air is further from his shadow, so it is smaller and fainter at the top of a
##     leap (the Warrior's Lunge, 9 pixels at its middle: wild.ts leapLiftOf) and in the Veteran's moves that lift him off the
##     floor (as high as the art has him: veteran_fx.ts liftOf, 40 pixels his highest).
## And THE RING THAT MARKS ONE NAMED (render.ts ringDots, under it before its shadow): round the feet of an elite (a yellow
## pack's leader is one), of each of a blue pack and of a boss, a ring of single dots m.r x 1.5 round, breathing a little, in its
## first word's colour (orange, P.fr4, for one with none). (The game's pack marks, PACK_MARKS, are off; the ring round the one
## locked onto is the touch screen's.)
## On the floor where the figure stands, lifted with the ground there, over the floor's marks and under every figure. (The
## Golem's and the Mage's orbs' are their own looks'.)
extends Node2D

const MageLook := preload("res://scripts/heroes/mage_look.gd")
const Looks := preload("res://scripts/fx_looks.gd")
const Iso := preload("res://scripts/iso.gd")
const SHADOW := 0.7
## (wild.ts THRUST_LIFT, LEAP_LIFT: how high the Warrior's Lunge lifts him at its middle, and the height a shadow is measured by)
const THRUST_LIFT := 9.0
const LEAP_LIFT := 40.0

## (art/palette.ts P.fr4: a named one's ring with no word)
const FR4 := Color("#ff8a2a")

var hero
var monsters
var _t := 0.0


func _process(dt: float) -> void:
	_t += dt
	queue_redraw()


func _draw() -> void:
	var tex := MageLook.blot()
	if monsters != null:
		for m in monsters.list:
			if not is_instance_valid(m) or m.dead or not m.seen or not m.is_visible_in_tree():
				continue
			if m._sprite == null or not m._sprite.visible:
				continue
			if m.named() or m.boss:
				Looks.ready_up()
				var col: Color = Looks.WORD.get(str(m.words[0]), FR4) if not m.words.is_empty() else FR4
				_ring_dots(m.world, m.r * (1.5 + 0.12 * sin(_t * 5.0)), col)
			_shadow(tex, m.world, m.r * 0.75, SHADOW)
	if hero != null and is_instance_valid(hero) and hero.is_visible_in_tree():
		var up := hero_up()
		_shadow(tex, hero.world, 0.36 * (1.0 - 0.3 * up), SHADOW * (1.0 - 0.35 * up))


## How far up in the air the hero is, 0 to 1 (render.ts: `up`).
func hero_up() -> float:
	var kit = hero.kit
	if kit != null and kit.has_method("lift_now"):
		var v: float = kit.lift_now()
		if v > 0.0:
			return minf(1.0, v / LEAP_LIFT)
	if hero.cls == "warrior" and hero._act == "lunge" and not hero._lunge.is_empty():
		var k := minf(1.0, hero._act_t / maxf(0.01, float(hero._lunge["dur"])))
		return sin(PI * k) * (THRUST_LIFT / LEAP_LIFT)
	return 0.0


func _shadow(tex: Texture2D, at: Vector2, r: float, alpha: float) -> void:
	var p := _floor_at(at)
	var w := r * 22.6 * 1.5 * 2.0
	var hh := r * 11.3 * 1.5 * 2.0
	draw_texture_rect(tex, Rect2(p.x - w, p.y - hh, w * 2.0, hh * 2.0), false, Color(1, 1, 1, clampf(alpha, 0.0, 1.0)))


## (render.ts ringDots) A ring of single game pixels `r` tiles round where `at` stands, as the floor lies.
func _ring_dots(at: Vector2, r: float, col: Color, gap := 1) -> void:
	var p := _floor_at(at) / 2.0
	var n := maxi(16, roundi(r * 44.0))
	for i in range(0, n, gap):
		var a := float(i) / n * TAU
		var x := roundf(p.x + (cos(a) - sin(a)) * 16.0 * r)
		var y := roundf(p.y + (cos(a) + sin(a)) * 8.0 * r)
		draw_rect(Rect2(x * 2.0, y * 2.0, 2.0, 2.0), col)


## Where `at` is on the floor, picture pixels, lifted with the ground there.
func _floor_at(at: Vector2) -> Vector2:
	var p := Iso.to_screen(at.x, at.y)
	var map = hero.map if hero != null else null
	if map != null:
		p.y -= map.lift_at(at.x, at.y)
	return p
