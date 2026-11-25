## THE SWAMP COLOSSUS'S STONE, floor 10 (game/act1_layout.ts stoneOn lays it: an island of its own beyond the halls, the water all round
## it but for a jetty down from the middle of its near edge; game.ts updateStone, acrossToStone, meetOutdoorBoss; main.ts zoomWanted;
## render.ts mothLean):
##   ACROSS TO IT: walking to within 0.8 of the landing on the boss's ground (the middle of his ground) carries the hero across, the
##     curtain drawn as for any way: set down 2.4 tiles out along the jetty from the stone's near edge, at its middle, facing the stone;
##     the boss woken. BACK: walking out past 3.2 tiles along the jetty carries him back to the landing (set down 1.4 tiles each way off
##     it, facing away from it), before the fight begins or once it is won, not in the middle of it.
##   HIS GROUND COME INTO (meetOutdoorBoss, BOSS_INTRO): the boss woken, his roar, his line said and his name across the screen.
##   THE PICTURE DRAWN BACK (his 9 Nov 07:48: “The camera needs to zoom out during the fight, you can’t really see anything from where
##     it is currently.”): on the stone and its jetty the world drawn larger than the screen and shrunk to it, so that at least 500 by
##     330 game pixels are seen, eased in and out (2.5 a second); and the picture leaning up toward him in the water, 55 game pixels;
##     as his phase ends and he changes, nothing hurting the hero, the picture turned on him, all of him on the screen, his middle at
##     the water 0.6 of the way down it. The lean glides 3 a second.
## (Left out: the game's boss's ground is a blob of its own shape; here "come into" is "well inside the boss's room", its bounding
## box less a tile and a half each side.)
extends Node

const F := preload("res://scripts/act1/colossus_fight.gd")
const Colossus := preload("res://scripts/act1/colossus.gd")
const Art := preload("res://scripts/act1/colossus_art.gd")

## (game.ts STONE_LANDING: how near the landing carries him across)
const LANDING := 0.8
## (main.ts COLOSSUS_VIEW; render.ts COLOSSUS_LEAN, COLOSSUS_SHOW, MOTH_LEAN.glide)
const VIEW := {"h": 330.0, "w": 500.0, "ease": 2.5}
const LEAN := 55.0
const SHOW := 0.6
const GLIDE := 3.0
## (the game's screen, game pixels)
const SCREEN := Vector2(480, 270)
## (main.gd CURTAIN: the curtain drawn as he goes, and lifted)
const CURTAIN := 0.35

var main
var map
var hero
var monsters
var stone := Vector2.INF
var landing := Vector2.INF
var met := false
var zoom := 1.0
var lean := Vector2.ZERO
var _going := false


func _ready() -> void:
	# (after the hero's own step, which sets his camera: the picture drawn back and leaned over it)
	process_priority = 100
	if map.stone != null:
		stone = Vector2(float(map.stone["cx"]), float(map.stone["cy"]))
	if map.landing != null:
		landing = Vector2(float(map.landing["x"]), float(map.landing["y"]))


func _boss():
	for m in monsters.list:
		if is_instance_valid(m) and m.boss and not m.dead:
			return m
	return null


func _process(dt: float) -> void:
	if stone == Vector2.INF or hero == null:
		return
	_meet()
	_ways()
	_camera(dt)


## (meetOutdoorBoss) His ground come into: he wakes, roars, says his line, and his name comes up across the screen.
func _meet() -> void:
	if met or not hero.alive:
		return
	var b = _boss()
	if b == null:
		return
	var inside := false
	for r in map.rooms:
		if r.get("kind", "") == "boss":
			var pad := 1.5
			inside = hero.world.x >= float(r["x"]) + pad and hero.world.y >= float(r["y"]) + pad and hero.world.x <= float(r["x"]) + float(r["w"]) - pad and hero.world.y <= float(r["y"]) + float(r["h"]) - pad
	if not inside and b.world.distance_to(hero.world) > 6.0:
		return
	met = true
	if b.state == "sleep":
		monsters.wake(b)
	b.call_line(Colossus.LINES.pick_random(), Colossus.INTRO["sayFor"])
	if main != null:
		main.boss_card(b.title, Colossus.INTRO["secs"])


## (updateStone) Across to the stone from the landing; back from the far end of its jetty, before his fight begins or once it is won.
func _ways() -> void:
	if _going or (main != null and main._going) or not hero.alive:
		return
	if landing != Vector2.INF and hero.world.distance_to(landing) < LANDING:
		_carry(true)
		return
	var p := F.world_to_stone(stone, hero.world.x, hero.world.y)
	if p.y > F.STONE["d"] + F.JETTY["out"] and absf(p.x - F.STONE["w"] / 2.0) < F.JETTY["half"] + 0.5:
		var b = _boss()
		var f = b.h2.a1.get("fight") if b != null and b.h2 != null else null
		if f == null or f.mode == "idle" or f.mode == "won":
			_carry(false)


## (leave 'stoneIn' / 'stoneOut', acrossToStone) The curtain drawn, him carried across, the curtain lifted.
func _carry(inward: bool) -> void:
	_going = true
	var curtain: ColorRect = main._curtain if main != null else null
	if curtain != null:
		var tw := create_tween()
		tw.tween_property(curtain, "color:a", 1.0, CURTAIN)
		await tw.finished
	hero._knock_t = 0.0
	if inward:
		hero.world = F.stone_to_world(stone, F.STONE["w"] / 2.0, F.STONE["d"] + F.JETTY["in"])
		hero._turn(Vector2(-sqrt(0.5), -sqrt(0.5)))
		var b = _boss()
		if b != null and b.state == "sleep":
			monsters.wake(b)
	else:
		hero.world = landing + Vector2(1.4, 1.4)
		hero._turn(Vector2(sqrt(0.5), sqrt(0.5)))
	if curtain != null:
		var back := create_tween()
		back.tween_property(curtain, "color:a", 0.0, CURTAIN)
		await back.finished
	_going = false


## Whether the hero is on the stone or its jetty.
func on_stone() -> bool:
	return F.on_stone_or_jetty(F.world_to_stone(stone, hero.world.x, hero.world.y))


## (zoomWanted, mothLean) The picture drawn back on the stone and leaned toward him.
func _camera(dt: float) -> void:
	var cam: Camera2D = hero._cam
	if cam == null:
		return
	var here := on_stone()
	var want := minf(1.0, minf(SCREEN.y / VIEW["h"], SCREEN.x / VIEW["w"])) if here else 1.0
	zoom += (want - zoom) * (1.0 - exp(-dt * VIEW["ease"]))
	if absf(want - zoom) < 0.004:
		zoom = want
	cam.zoom = Vector2(zoom, zoom)
	# (the world's picture as the renderer's camera sees it, game pixels)
	var H := SCREEN.y / zoom
	var to := Vector2.ZERO
	if here:
		to.y = -minf(LEAN, H * 0.24)
		var b = _boss()
		var f = b.h2.a1.get("fight") if b != null and b.h2 != null else null
		if f != null and (f.mode == "between" or f.mode == "change"):
			var at := F.stone_to_world(stone, F.HIS_PLACE.x, F.HIS_PLACE.y)
			to.x = (at.x - at.y - (hero.world.x - hero.world.y)) * 16.0
			to.y = (at.x + at.y - (hero.world.x + hero.world.y)) * 8.0 + (0.5 - SHOW) * H
	var k := 1.0 - exp(-dt * GLIDE)
	lean += (to - lean) * k
	# (the picture leaned: what was drawn so far toward him is seen; picture pixels, two to a game pixel)
	cam.offset += lean * 2.0


## Gone with its floor: the picture as ever, and his pictures let go (a phone holds only what the fight wants while it is on).
func _exit_tree() -> void:
	if hero != null and is_instance_valid(hero) and hero._cam != null:
		hero._cam.zoom = Vector2.ONE
	Art.let_go_all()
