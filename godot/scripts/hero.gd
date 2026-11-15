## The hero on the floor, as the game moves him (game/game.ts): 4.6 tiles a second (defs.ts TUNE.heroSpeed), a body 0.3
## of a tile round (TUNE.heroRadius) that slides along walls (game.ts slide: the step along x kept if the body is clear
## there, then the step along y), on the walk grid. The keys or stick give a way on the SCREEN, turned to the floor
## (iso.ts screenDirToWorld), always at full speed.
## He faces one of his eight painted sides (art/warrior_up_art.ts wuFacing) and plays his baked lists: his stand and his
## run, his swings, his slam, his leap and its landing at 30 frames a second (art/warrior_up_art.ts).
##
## THE WARRIOR'S THREE ATTACKS with the greatsword (talents.ts: strike, whirl, leap), as main.ts takes them:
##   STRIKE (left button; a controller's RT): lands 0.333 s in on the one monster before him within 1.7 tiles that is
##     nearest and most in front (game.ts strike); again every 1 / his attack rate; pressed again soon enough, the second
##     swing of the combo; a step forward each.
##   WHIRLWIND (right button, held; LT): at his pick of 14 Nov 2026, "Give him the Whirlwind spin", the greatsword's
##     Whirlwind (in the game a talent of the tree, talents.ts gswhirlwind: "Whirl becomes WHIRLWIND: you spin round and
##     round, more hits, each for less"; defs.ts SKILLS.whirlwind, game.ts updateChannel): 0.12 s's wind-up, then for as
##     long as it is held, 2.4 s at most, he spins (1.6 turns a second), cutting everything within 2 tiles every 0.3 s for
##     x0.55, walking at 90% and through enemies; let go or run out, it is ready again after 3.5 s (less after a short
##     spin, never less than 35% of it). His spinning picture (art/warrior_up.ts WU_WHIRL3) seen from the front.
##   LUNGE, his swipe (Space; A): flung up to 6 tiles toward the pointer (or the way he goes), untouchable in the air,
##     through monsters and the Lockdown's bars; landing, a blow 1.6 round a tile before him, x0.5; ready again after 4 s
##     (defs.ts SKILLS.leap, LUNGE; game.ts useEvasive, land).
## (In the game Whirl opens at level 2 and the Lunge at 5, MOVE_OPENS; here all three are open, to try them.)
## A HIT (game.ts): a roll of the weapon's damage x the move's share x (1 + Str / 100) x (1 + his damage bonuses / 100);
## a critical (5% + 0.1% a point of Dex) x1.5.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Sfx := preload("res://scripts/sfx.gd")

const SPEED := 4.6
const RADIUS := 0.3
const IDLE_FPS := 30.0
const RUN_FPS := 30.0
const CLIP_FPS := 30.0
## (wuFacing: k = round(angle / 45 degrees), 0 down and to the right on the screen, then round)
const FACING := ["front", "toward", "frontL", "sideL", "backL", "away", "back", "side"]
const STEP_EVERY := 0.25
const AIM_REACH := 2.4
const BACK_AFTER := 2.5
const Loadout := preload("res://scripts/loadout.gd")

const STRIKE := {"share": 1.0, "reach": 1.7, "windup": 0.333, "follow": 0.3, "combo": 0.5, "step": 0.33}
const WHIRL := {"share": 0.55, "radius": 2.0, "windup": 0.12, "channel": 2.4, "tick": 0.3, "cooldown": 3.5, "min_cool": 0.35, "follow": 0.25, "walk": 0.9, "spin": 1.6}
const WHIRL_LIST := 44
const LUNGE := {"share": 0.5, "range": 6.0, "radius": 1.6, "ahead": 1.0, "cooldown": 4.0, "invuln": 0.06}
const LEAP_LIST := 39
const LAND_LIST := 45

var map: FloorMap
var art: BakedHero
var sfx: Sfx
var monsters  # monsters.gd
var doors  # doors.gd, on a floor that has them (null in town)
var props  # props.gd, on a floor that has chests, barrels or urns (null in town)
var world := Vector2.ZERO
var home := Vector2.ZERO
var face := Vector2(1, 0)
var alive := true
## how far he has walked (the guide's first prompt goes once he has walked 3 tiles)
var walked := 0.0

## HIS STATS (game/stats.ts derive), as a new Warrior has them (defs.ts CLASSES.warrior) with the Iron Greatsword (7 to 11,
## 1.05 a second, his Dex making it 1.09); his gear, his levels and his words change them (loot.gd derive).
var stats := {"str": 14.0, "dex": 8.0, "int": 6.0, "level": 1, "dmg_min": 7.0, "dmg_max": 11.0, "aps": 1.092, "dmg_pct": 0.0,
	"crit_chance": 5.8, "crit_mult": 50.0, "life_regen": 0.6, "life_on_hit": 0.0, "life_on_kill": 0.0, "armor": 0.0,
	"move_speed": 0.0, "area": 1.0, "gold_find": 0.0}
var max_life := 102.0
var life := 102.0
## THE WORDS SET IN HIS THREE MOVES (loadout.gd; game/words.ts resolveSkill): which word is in which slot, and what each
## move comes to with them (`loadout.r(i)`). The gear screen sets them; loot.gd gives it his level, the lit ring and his
## numbers.
var loadout := Loadout.new()
## (Strike's first word in front and behind, "" for none: as the screens that came before the loadout read it)
var strike_words: Dictionary:
	get:
		var f: Array = loadout.fronts(0)
		var b: Array = loadout.behinds(0)
		return {"front": f[0] if not f.is_empty() else "", "behind": b[0] if not b.is_empty() else ""}
var _might := 0
var _might_t := 0.0

## Shot mode (main.gd): a screen direction held as if pressed, attacks asked for, and blows that flash but do not harm.
var auto_dir := Vector2.ZERO
var auto_attack := false
var auto_whirl := false
var auto_lunge := Vector2.INF
var unhurt := false

var _knock := Vector2.ZERO
var _knock_t := 0.0
var _invuln := 0.0
var _sprite: Sprite2D
var _cam: Camera2D
## (how high the ground he stands on lifts him on the screen, picture pixels: floor_map.gd lift_at)
var _lift := 0.0
var _side := 0
var _list := BakedHero.IDLE
var _t := 0.0
## the attack he is in: "", "strike", "whirl", "lunge", and how far into it
var _act := ""
var _act_t := 0.0
var _landed := false
var _last_swing := -10.0
var _combo_next := false
var _whirl_cd := 0.0
## (the Whirlwind: its wait in full, how many cuts it has made, the next one's time, how long it has spun, when let go)
var _whirl_full := 3.5
var _bites := 0
var _next_bite := 0.0
var _spun := -1.0
var _stopped_at := 0.0
var _lunge_cd := 0.0
var _lunge := {}
var _landing := false
var _clock := 0.0
var _step_in := 0.0
var _flash := 0.0
var _shake := 0.0
## (render/fx.ts shake: the screen kicked so many game pixels, falling off 22 a second; a film's jolts kick it: kick())
var _kick := 0.0
## (game.ts slowT, slowBy: the Shade's rime underfoot, a while and how much slower he walks)
var _slow_t := 0.0
var _slow_by := 0.0
## (game.ts held: hooked by the Chained One, for so many seconds more he cannot walk or dodge: he goes where he is dragged.
## chained.gd sets it)
var held := 0.0
var _down_for := 0.0


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	_cam = Camera2D.new()
	# (render.ts: the hero stands 12 game pixels below the middle of the screen)
	_cam.offset = Vector2(0, -24)
	add_child(_cam)
	_cam.make_current()
	home = world
	_turn(face)
	_place()
	_show()


## His most life (loot.gd derive): what he had more of comes with it, as the game's derive does.
func set_max_life(v: float) -> void:
	var was := max_life
	max_life = v
	life = minf(life + maxf(0.0, v - was), v)


func rate() -> float:
	return stats["aps"]


## One hit of a move with share `share` of the weapon's damage (game.ts, words.ts resolveSkill): a roll of his damage x the
## move's share x (1 + Str / 100) x (1 + his damage bonuses and Power's might / 100); a critical x(1 + crit_mult / 100).
func roll_hit(share: float) -> float:
	var might: float = _might * float(loadout.r(0)["might"])
	var dmg: float = randf_range(stats["dmg_min"], stats["dmg_max"]) * share * (1.0 + stats["str"] / 100.0) * (1.0 + (stats["dmg_pct"] + might) / 100.0)
	if randf() * 100.0 < stats["crit_chance"]:
		dmg *= 1.0 + stats["crit_mult"] / 100.0
	return maxf(1.0, roundf(dmg))


## Strike's share and reach with the words in it.
func _strike_share() -> float:
	# (the move's share with its words: roll_hit lays his Strength on it, which the game's dmgMult already carries)
	return float(loadout.r(0)["dmg_mult"]) / (1.0 + stats["str"] / 100.0)


func _strike_reach() -> float:
	return STRIKE["reach"] * float(loadout.r(0)["size"])


func heal_flat(n: float) -> void:
	if n > 0.0 and alive:
		life = minf(max_life, life + n)


func _process(dt: float) -> void:
	_clock += dt
	_flash = maxf(0.0, _flash - dt)
	_shake = maxf(0.0, _shake - dt)
	_kick = maxf(0.0, _kick - dt * 22.0)
	_slow_t = maxf(0.0, _slow_t - dt)
	_invuln = maxf(0.0, _invuln - dt)
	_whirl_cd = maxf(0.0, _whirl_cd - dt)
	_lunge_cd = maxf(0.0, _lunge_cd - dt)
	_cam.offset = Vector2(0, -24 - _lift) + (Vector2(randf_range(-3, 3), randf_range(-3, 3)) if _shake > 0.0 else Vector2.ZERO)
	if _kick > 0.3:
		_cam.offset += Vector2(roundf(randf_range(-_kick, _kick)), roundf(randf_range(-_kick, _kick) * 0.6)) * 2.0
	if not alive:
		_down_for += dt
		_sprite.modulate.a = clampf(1.0 - _down_for, 0.0, 1.0)
		if _down_for >= BACK_AFTER:
			_back()
		return
	life = minf(max_life, life + stats["life_regen"] * dt)
	_might_t -= dt
	if _might_t <= 0.0:
		_might = 0
	_t += dt
	var d := Input.get_vector("move_left", "move_right", "move_up", "move_down") + auto_dir
	var way := Iso.screen_dir_to_world(d)
	# (HOOKED by the Chained One: he cannot walk or dodge, he goes where he is dragged; he may strike still)
	var hooked := held > 0.0
	if hooked:
		held = maxf(0.0, held - dt)
		way = Vector2.ZERO

	# THE LUNGE: whatever he is doing, it breaks off (useEvasive), and he is in the air till he lands
	var lunge_at := auto_lunge
	auto_lunge = Vector2.INF
	if Input.is_action_just_pressed("lunge"):
		lunge_at = _pointer(way, LUNGE["range"])
	if lunge_at != Vector2.INF and _lunge_cd <= 0.0 and _act != "lunge" and not hooked:
		_begin_lunge(lunge_at)
	if _act == "lunge":
		_fly(dt)
		_place()
		_show()
		queue_redraw()
		return

	# (knocked: carried the way he was struck over 0.12 s, walls stopping him: game.ts knockHero, his `step`)
	if _knock_t > 0.0:
		_slide(_knock * (minf(dt, _knock_t) / 0.12))
		_knock_t -= dt

	var strike_asked := Input.is_action_just_pressed("attack") or auto_attack
	var whirl_held := Input.is_action_pressed("whirl") or auto_whirl
	auto_attack = false
	if whirl_held and _whirl_cd <= 0.0 and (_act == "" or (_act == "strike" and _landed)):
		_begin_whirl()
	elif strike_asked and (_act == "" or (_act == "strike" and _act_t >= 1.0 / rate())):
		_begin_strike()

	var slow := 1.0
	var can_walk := _act == ""
	if _act != "":
		_act_t += dt
	match _act:
		"strike":
			if not _landed and _act_t >= STRIKE["windup"]:
				_land_strike()
			var done := int(_t * CLIP_FPS) >= art.count(_side, _list)
			if done or (_landed and _act_t >= STRIKE["windup"] + STRIKE["follow"] and way != Vector2.ZERO):
				_end_act()
				can_walk = true
		"whirl":
			_spin(dt, whirl_held)
			# (he walks on while he spins, at 90%, not turning to his way: he is turning on the spot)
			can_walk = true
			slow = WHIRL["walk"]

	if can_walk and way != Vector2.ZERO:
		if _act == "":
			_turn(way)
		var was := world
		var walk_was := world
		if _slow_t > 0.0:
			slow *= 1.0 - _slow_by
		_slide(way * SPEED * (1.0 + stats["move_speed"] / 100.0) * slow * dt)
		walked += world.distance_to(walk_was)
		# (the Lockdown's bars, standing, keep him on his side of them as he walks: action_f1.ts cageHero)
		if monsters != null and monsters.perils != null:
			world = monsters.perils.cage(was, world, RADIUS)
		_landing = false
		if _act == "":
			_set_list(BakedHero.WALK)
		_step_in -= dt
		if _step_in <= 0.0:
			_step_in = STEP_EVERY
			sfx.play("step_stone", -8.0)
	elif _act == "":
		_step_in = 0.0
		if _landing and int(_t * CLIP_FPS) < art.count(_side, LAND_LIST):
			pass
		else:
			_landing = false
			_set_list(BakedHero.IDLE)
	_place()
	_show()
	queue_redraw()


# --- Strike ---

func _begin_strike() -> void:
	_aim_at_foe()
	var combo := _clock - _last_swing <= 1.0 / rate() + STRIKE["combo"] and not _combo_next
	_combo_next = combo
	_last_swing = _clock
	_start(BakedHero.ATTACK2 if combo and art.count(_side, BakedHero.ATTACK2) > 0 else BakedHero.ATTACK, "strike")
	_slide(face * STRIKE["step"])


func _land_strike() -> void:
	_landed = true
	sfx.play("swing", -6.0)
	# (what it reaches of the barrels and urns: game.ts, breakProps a little way before him)
	if props != null and is_instance_valid(props):
		props.strike(world + face * _strike_reach() * 0.6, 0.9)
	# (and a sealed door there opens to it if it carries the door's word: game.ts unseal)
	if doors != null and is_instance_valid(doors):
		doors.unseal(strike_words, world + face * _strike_reach() * 0.6, 0.9)
	if monsters == null:
		return
	var m = monsters.strike_target(world, face, _strike_reach())
	if m != null:
		var at: Vector2 = m.world
		var hit := roll_hit(_strike_share())
		m.hurt(hit)
		heal_flat(stats["life_on_hit"])
		sfx.play("hit", -4.0)
		if strike_words["front"] == "power":
			# (POWER in front: half of the blow splashes 1.2 round what it struck)
			monsters.blast(at, 1.2, func(): return roundf(hit * 0.5), m)
			sfx.play("power", -6.0)
		if strike_words["behind"] == "power":
			_might = mini(_might + 1, 5)
			_might_t = 5.0


# --- Whirl ---

func _begin_whirl() -> void:
	_whirl_cd = WHIRL["cooldown"]
	_whirl_full = WHIRL["cooldown"]
	_bites = 0
	_next_bite = 0.0
	_spun = -1.0
	_start(WHIRL_LIST, "whirl")


## game.ts updateChannel: is it over (let go after its first cut, or run its length)? then its cut, if one is due; then
## time passes; he turns on the spot. Over, its wait is all of it after a whole length, less after a shorter one.
func _spin(dt: float, held: bool) -> void:
	if _spun >= 0.0 and _spun >= WHIRL["channel"] + WHIRL["follow"]:
		_end_act()
		return
	if _act_t < WHIRL["windup"]:
		return
	if _spun < 0.0:
		_spun = 0.0
	if _landed:
		# (let go: the rest of its follow-through, standing out of the spin)
		_spun += dt
		if _spun >= _stopped_at + WHIRL["follow"]:
			_end_act()
		return
	if _bites > 0 and (not held or _spun >= WHIRL["channel"]):
		_landed = true
		_stopped_at = _spun
		var k := clampf(_spun / WHIRL["channel"], WHIRL["min_cool"], 1.0)
		_whirl_cd = WHIRL["cooldown"] * k
		_whirl_full = _whirl_cd
		return
	if _next_bite <= 1e-9:
		sfx.play("whirl", -6.0)
		if props != null and is_instance_valid(props):
			props.strike(world, WHIRL["radius"] * stats["area"])
		if monsters != null and monsters.blast(world, WHIRL["radius"] * stats["area"], func(): return roll_hit(WHIRL["share"])) > 0:
			sfx.play("hit", -8.0)
		_bites += 1
		_next_bite += WHIRL["tick"]
	_spun += dt
	_next_bite -= dt
	var a := atan2(face.y, face.x) + WHIRL["spin"] * TAU * dt
	face = Vector2(cos(a), sin(a))


# --- Lunge ---

## Where the pointer means him to go, in tiles: the mouse's point on the floor; or, if the mouse is on him or there is no
## mouse, as far as `reach` the way he goes (or faces).
func _pointer(way: Vector2, reach: float) -> Vector2:
	var at := Iso.to_world(get_global_mouse_position())
	if Input.get_connected_joypads().size() > 0 and Input.get_joy_axis(0, JOY_AXIS_LEFT_X) != 0.0:
		at = world
	if at.distance_to(world) < 0.9:
		var dir := way if way != Vector2.ZERO else face
		at = world + dir * reach
	return at


## game.ts useEvasive and reachPoint: no further than 6 tiles, stepped back 0.2 at a time till the spot is open floor in
## sight of him; less than half a tile and there is no room.
func _begin_lunge(target: Vector2) -> void:
	var to := target - world
	var dist := minf(to.length(), LUNGE["range"])
	if dist < 0.01:
		return
	var dir := to / to.length()
	var land := Vector2.INF
	while dist >= 0.5:
		var p := world + dir * dist
		if _clear(p.x, p.y) and (monsters == null or monsters.sees(world, p)):
			land = p
			break
		dist -= 0.2
	if land == Vector2.INF:
		return
	_end_act()
	_combo_next = false
	_turn(dir)
	_lunge_cd = LUNGE["cooldown"]
	_lunge = {"from": world, "to": land, "dur": 0.26 + dist * 0.03}
	_act = "lunge"
	_act_t = 0.0
	_list = LEAP_LIST
	_t = 0.0
	sfx.play("dodge", -4.0)
	sfx.play("lunge", -6.0)


func _fly(dt: float) -> void:
	_act_t += dt
	_invuln = maxf(_invuln, LUNGE["invuln"])
	var k := clampf(_act_t / _lunge["dur"], 0.0, 1.0)
	world = _lunge["from"].lerp(_lunge["to"], k)
	if k >= 1.0:
		# (landing: a blow 1.6 round, a tile before him; then his landing, if he stands)
		sfx.play("slam", -4.0)
		_shake = 0.15
		if props != null and is_instance_valid(props):
			props.strike(world + face * LUNGE["ahead"], LUNGE["radius"] * stats["area"])
		if monsters != null and monsters.blast(world + face * LUNGE["ahead"], LUNGE["radius"] * stats["area"], func(): return roll_hit(LUNGE["share"])) > 0:
			sfx.play("hit", -4.0)
		_act = ""
		_landing = true
		_list = LAND_LIST
		_t = 0.0


# --- the rest ---

## A blow made from the keys goes at the nearest monster awake close by; with the mouse, where it points.
func _aim_at_foe() -> void:
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		var to := Iso.to_world(get_global_mouse_position()) - world
		if to.length() > 0.01:
			_turn(to.normalized())
	elif monsters != null:
		var m = monsters.nearest(world, AIM_REACH)
		if m != null:
			_turn((m.world - world).normalized())


func _start(list: int, act: String) -> void:
	_act = act
	_act_t = 0.0
	_landed = false
	_list = list
	_t = 0.0
	_landing = false


func _end_act() -> void:
	_act = ""
	_landed = false


## Knocked `dist` tiles the way `way` (a unit vector on the floor).
func knock(way: Vector2, dist: float) -> void:
	if _act == "lunge":
		return
	_knock = way * dist
	_knock_t = 0.12


func shake() -> void:
	_shake = 0.18


## Slowed for `secs` by `by` (a share of his pace): the Shade's rime while he stands in it (game/action_f2.ts).
func chill(secs: float, by: float) -> void:
	_slow_by = maxf(_slow_by if _slow_t > 0.0 else 0.0, by)
	_slow_t = maxf(_slow_t, secs)


## The screen kicked `amount` game pixels (render/fx.ts: fx.shake = max(fx.shake, amount)).
func kick(amount: float) -> void:
	_kick = maxf(_kick, amount)


## `raw`: before his armour (a trap's share of his life: game.ts stepSpikes, a dart).
func hurt(dmg: float, raw := false) -> void:
	if not alive or _invuln > 0.0:
		return
	# (armour takes its share: armour / (armour + 40 + 20 a floor), at most 75%: stats.ts)
	var cut := minf(0.75, stats["armor"] / (stats["armor"] + 40.0 + 20.0 * map.depth)) if stats["armor"] > 0.0 and not raw else 0.0
	if not unhurt:
		life -= dmg * (1.0 - cut)
	_flash = 0.15
	_shake = 0.15
	sfx.play("hurt", -6.0)
	if life <= 0.0:
		life = 0.0
		alive = false
		_down_for = 0.0
		_end_act()


func heal(share: float) -> void:
	life = minf(max_life, life + max_life * share)


## Fallen: back where he came in, whole again, and the monsters that were after him gone back to sleep.
func _back() -> void:
	world = home
	life = max_life
	alive = true
	held = 0.0
	_sprite.modulate.a = 1.0
	_set_list(BakedHero.IDLE)
	if monsters != null:
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "sleep":
				m.state = "sleep"
		monsters.perils.clear()
	if doors != null and is_instance_valid(doors):
		doors.reset()
	_place()
	_show()


func _set_list(list: int) -> void:
	if _list != list:
		_list = list
		_t = 0.0


func _turn(way: Vector2) -> void:
	face = way
	var k := posmod(roundi(rad_to_deg(atan2(way.y, way.x)) / 45.0), 8)
	_side = BakedHero.SIDES.find(FACING[k])


## The game's slide: the step along x kept if the body is clear there, then the step along y.
func _slide(step: Vector2) -> void:
	var was := world
	# (game.ts slide: along walls and slanting walls; a ledge is as solid as a wall, stairs are entered at their ends)
	world = map.slide(world, RADIUS, step)
	_into_door(step, was)


## DOORS (game.ts intoDoor): a door is one tile wide in a hallway of three, and no direction he walks in runs along a hallway:
## so where his step along x (or y) was refused by the stone beside a door, he is moved sideways, at the pace of that step,
## toward the nearest place within DOOR_HELP from which the step can be taken: into line with the opening.
const DOOR_HELP := 1.05


func _into_door(step: Vector2, was: Vector2) -> void:
	if map == null or map.doors.is_empty():
		return
	for along_x in [true, false]:
		var want: float = step.x if along_x else step.y
		if want == 0.0 or (world.x != was.x if along_x else world.y != was.y):
			continue
		var ax: float = world.x + want if along_x else world.x
		var ay: float = world.y if along_x else world.y + want
		var stone := false
		for ty in range(floori(ay - RADIUS), floori(ay + RADIUS) + 1):
			for tx in range(floori(ax - RADIUS), floori(ax + RADIUS) + 1):
				stone = stone or map.pier_at(tx, ty)
		if not stone:
			continue
		var best := 0.0
		var best_s := INF
		for side in [1.0, -1.0]:
			var k := 1
			while k * 0.05 <= DOOR_HELP + 1e-9:
				var s := k * 0.05
				if _clear(ax + (0.0 if along_x else side * s), ay + (side * s if along_x else 0.0)):
					if s < best_s:
						best_s = s
						best = side * minf(absf(want), s)
					break
				k += 1
		if best == 0.0:
			continue
		var to := world + (Vector2(0.0, best) if along_x else Vector2(best, 0.0))
		if _clear(to.x, to.y):
			world = to


## Every tile the body's box overlaps is one a body may stand on (game.ts free).
func _clear(x: float, y: float) -> bool:
	return map.fits(x, y, RADIUS)


## Where he is on the screen; on raised or sunken ground and on stairs he is drawn as high as the ground is there, and the
## picture follows him up (render.ts heroLift; floor_map.gd lift_at).
func _place() -> void:
	position = Iso.to_screen(world.x, world.y)
	_lift = map.lift_at(world.x, world.y) if map != null else 0.0
	if _sprite != null:
		_sprite.position.y = -_lift


func _show() -> void:
	# (a whirlwind is seen from the front for as long as it goes round: the picture turns him itself, figure.ts `spins`)
	var side := BakedHero.SIDES.find("front") if _act == "whirl" else _side
	var n := art.count(side, _list)
	if n == 0:
		return
	var i := 0
	if _act == "lunge":
		# (the leap's pictures go by how far through the flight he is)
		i = mini(int(_act_t / _lunge["dur"] * n), n - 1)
	elif _act == "whirl":
		# (his spin goes round at 30 frames a second, from its first frame as the wind-up begins)
		i = int(_act_t * CLIP_FPS) % n
	elif _act == "strike" or _landing:
		i = mini(int(_t * CLIP_FPS), n - 1)
	else:
		i = int(_t * (IDLE_FPS if _list == BakedHero.IDLE else RUN_FPS)) % n
	var f := art.frame(side, _list, i)
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.scale = Vector2.ONE * float(f["scale"])
	_sprite.self_modulate = Color(2.0, 0.7, 0.7) if _flash > 0.0 else Color.WHITE


## His life over his head in a fight or when he is hurt (Version 11.2).
func _draw() -> void:
	if not alive:
		return
	var fighting: bool = monsters != null and monsters.nearest(world, 9.0) != null
	if not fighting and life >= max_life - 0.01:
		return
	var w := 44.0
	var top := -104.0 - _lift
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 7), Color(0.04, 0.04, 0.1, 0.85))
	draw_rect(Rect2(-w / 2, top, w * clampf(life / max_life, 0.0, 1.0), 5), Color(0.86, 0.16, 0.24))


## How soon each attack is ready again, 0 to 1 (the HUD).
func readiness() -> Dictionary:
	return {"whirl": 1.0 - _whirl_cd / maxf(0.01, _whirl_full), "lunge": 1.0 - _lunge_cd / LUNGE["cooldown"]}
