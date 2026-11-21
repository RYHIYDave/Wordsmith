## THE SHADOW UNDER A FIGURE (render.ts shadow; the owner, 6 Oct 2026: "Draw a soft, semi-transparent black oval/circle on
## the floor directly beneath the Player and the Monsters to anchor them into the 3D space"). One soft oval (mage_look.gd blot:
## black, full at its middle, gone at its rim), stretched to each figure: `r` tiles round as the game has it, reaching half as
## far again, since its outer half is nearly nothing.
##   UNDER EVERY MONSTER in sight and not dead: m.r * 0.75 round, at SHADOW (0.7). One hidden (an inkling going about as a pool
##     of ink, the Fleshmancer between his two pits) has none, as its picture is not shown either.
##   UNDER THE HERO: 0.36 round; a hero in the air is further from his shadow, so it is smaller and fainter at the top of a
##     leap (the Warrior's Lunge, 9 pixels at its middle: wild.ts leapLiftOf) and in the Veteran's moves that lift him off the
##     floor (as high as the art has him: veteran_fx.ts liftOf, 40 pixels his highest).
## On the floor where the figure stands, lifted with the ground there, over the floor's marks and under every figure. (The
## Golem's and the Mage's orbs' are their own looks'.)
extends Node2D

const MageLook := preload("res://scripts/heroes/mage_look.gd")
const Iso := preload("res://scripts/iso.gd")
const SHADOW := 0.7
## (wild.ts THRUST_LIFT, LEAP_LIFT: how high the Warrior's Lunge lifts him at its middle, and the height a shadow is measured by)
const THRUST_LIFT := 9.0
const LEAP_LIFT := 40.0

var hero
var monsters


func _process(_dt: float) -> void:
	queue_redraw()


func _draw() -> void:
	var tex := MageLook.blot()
	if monsters != null:
		for m in monsters.list:
			if not is_instance_valid(m) or m.dead or not m.seen or not m.is_visible_in_tree():
				continue
			if m._sprite == null or not m._sprite.visible:
				continue
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
	var p := Iso.to_screen(at.x, at.y)
	var map = hero.map if hero != null else null
	if map != null:
		p.y -= map.lift_at(at.x, at.y)
	var w := r * 22.6 * 1.5 * 2.0
	var hh := r * 11.3 * 1.5 * 2.0
	draw_texture_rect(tex, Rect2(p.x - w, p.y - hh, w * 2.0, hh * 2.0), false, Color(1, 1, 1, clampf(alpha, 0.0, 1.0)))
