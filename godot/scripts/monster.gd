## A monster on the floor, as game.ts updateMonsters runs one:
##   SLEEP until it sees the hero within 9 tiles (TUNE.aggroRadius), and then its pack wakes with it (wakeUp: within 14).
##   CHASE: straight at him when it sees him and he is within 2.5 tiles, else down the flow field (nav.ts flowField). A
##     melee monster stops at reach * 0.8 + his radius; one that shoots stands once it sees him within keepMax.
##   ITS MOVES (THE MONSTERS' ATTACKS, game.ts pickMove / startMove / landMove; monster_moves.gd): when its wait is out, the
##     biggest of its moves that is ready and that he is in reach of (and it sees him, but for calling the dead): it winds
##     up, what it is about to do marked on the floor (a slam's circle, a charge's line, a line of aim, the Lockdown's
##     bars); it lands; it recovers; it waits `after`, the move its own cooldown. One without moves has its one blow.
##   WINDUP, then the blow if he is still within range + (r - 0.32) + 0.45 + his radius, or an arrow loosed.
##   RECOVER, its wait set (cooldown, or the move's `after`, times 0.9 to 1.2).
##   CHARGE (the red troll): down his line at 10 tiles a second; the hero met on it struck once and knocked aside; at the
##     line's end, or anything that stops him, he pulls up.
##   RISE (the dead the Warden calls): crawling out of the ground, no more than a picture, then into the fight.
##   Struck: it flashes (0.12 s), shows its life for 4 s, wakes. Killed: it falls (its die list) and lies 30 s, fading
##   over the last 1.5 (BODIES); its marks on the floor go with it.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const MM := preload("res://scripts/monster_moves.gd")
const Headsman := preload("res://scripts/headsman.gd")
## THE BOSSES THAT FIGHT BY THEIR OWN RULES (game/bosses.ts BossRules), each a script of its own with `step(m, dt, hero)`, handed
## the monster every frame it is awake in place of the common rules below (and `died(m)`, if it has one, as it falls): by kind.
const BOSS_AI := {
	"headsman": Headsman,
}

const AGGRO := 9.0
const WAKE_PACK := 14.0
const HERO_R := 0.3
const RECOVER := 0.3
const BODY_LIES := 30.0
const BODY_FADES := 1.5
const BAR_FOR := 4.0
## (game.ts: the voice of each kind, sound_families.ts VOICE, and its blow's sound, ATK; each name has two takes)
const VOICE := {"skeleton": "bones", "archer": "bones", "champion": "bones", "marksman": "bones", "brute": "troll", "bat": "bat", "shade": "spirit"}
const ATK := {"skeleton": "atkBones", "champion": "atkBones", "brute": "atkTroll", "bat": "atkBat", "cultist": "atkHex", "shade": "atkSpirit"}

var mgr  # monsters.gd
var art: BakedFigure
var def: Dictionary
var kind := ""
var world := Vector2.ZERO
var face := Vector2(0.7071, 0.7071)
var r := 0.32
var life := 1.0
var max_life := 1.0
var dmg_min := 1.0
var dmg_max := 1.0
var speed := 1.0
var pack_id := -1
var boss := false
var champion := false
var elite := false
## (one the Warden called up: it leaves nothing)
var summoned := false
var xp := 0.0
var state := "sleep"
var dead := false
## (its tile is in sight now: sight.gd; where there is no sight, always)
var seen := true
## (BOSS_INTRO: doors.gd) the boss waits: he stands looking at the hero and nothing harms him, until his gate has fallen and his
## line is said. `title` his name as the game gives it; what he says over his head, and for how long.
var waits := false
var title := ""
var _said := ""
var _said_t := 0.0
var _said_secs := 0.0
var _not_yet := 0.0
var _not_yet_t := 0.0

var _moves: Array = []
var _move_cd: Array = []
var _move := -1
var _charge := {}
var _aim := {}
var _t := 0.0
var _cd := 0.0
var _list := "idle"
var _anim_t := 0.0
var _flash := 0.0
var _bar := 0.0
var _dead_for := 0.0
var _weave := randf() * TAU
var _sprite: Sprite2D
## (how high the ground it stands on lifts it on the screen, picture pixels)
var _lift := 0.0
## (THE HEADSMAN MADE NEW: his prowl and his acts are his own: headsman.gd)
var h2 = null


func setup(m: Dictionary, kind_def: Dictionary, figure: BakedFigure) -> void:
	kind = m["kind"]
	def = kind_def
	art = figure
	world = Vector2(m["x"], m["y"])
	face = Vector2(m["fx"], m["fy"])
	r = m["r"]
	life = m["life"]
	max_life = m["maxLife"]
	dmg_min = m["dmgMin"]
	dmg_max = m["dmgMax"]
	speed = m["speed"]
	pack_id = int(m["packId"])
	boss = m["boss"]
	title = str(m.get("name", kind))
	champion = m.get("champion", false)
	elite = m.get("elite", false)
	summoned = not m.has("xp")
	xp = float(m.get("xp", kind_def.get("xp", 0)))
	_anim_t = m.get("animT", 0.0)
	_moves = MM.moves_of(kind, champion)
	if BOSS_AI.has(kind):
		h2 = BOSS_AI[kind].new()


## Called up out of the ground (the Warden's dead): `secs` till it is out.
func rise(secs: float) -> void:
	state = "rise"
	_t = secs
	_set_list("crawl")


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	_place()
	_show()


func step(dt: float, hero) -> void:
	if dead:
		_dead_for += dt
		_anim_t += dt
		if _dead_for > BODY_LIES - BODY_FADES:
			modulate.a = clampf((BODY_LIES - _dead_for) / BODY_FADES, 0.0, 1.0)
		if _dead_for >= BODY_LIES:
			queue_free()
		_show()
		return
	_anim_t += dt
	_flash = maxf(0.0, _flash - dt)
	_bar = maxf(0.0, _bar - dt)
	_said_t = maxf(0.0, _said_t - dt)
	_not_yet = maxf(0.0, _not_yet - dt)
	_not_yet_t = maxf(0.0, _not_yet_t - dt)
	# (BOSS_INTRO: until his gate has fallen and his line is said, the boss stands and looks at the hero)
	if waits:
		var d0: float = hero.world.distance_to(world)
		if state != "sleep" or (hero.alive and d0 <= 32.0 and mgr.sees(world, hero.world)):
			_turn_to(hero.world - world, d0)
		_set_list("idle")
		_place()
		_show()
		queue_redraw()
		return
	# (the Headsman, awake: his own prowl and acts)
	if h2 != null and state != "sleep" and state != "rise":
		h2.step(self, dt, hero)
		_place()
		_show()
		queue_redraw()
		return
	_cd -= dt
	for i in _move_cd.size():
		_move_cd[i] = maxf(0.0, _move_cd[i] - dt)
	var to: Vector2 = hero.world - world
	var dist := to.length()
	var sees: bool = hero.alive and dist <= 15.0 and mgr.sees(world, hero.world)
	var reach := float(def["range"]) + (r - 0.32)
	var moved := false
	match state:
		"rise":
			_t -= dt
			if _t <= 0.0:
				state = "chase"
				_cd = 0.8
		"sleep":
			if sees and dist <= AGGRO:
				mgr.wake(self)
		"chase":
			if not hero.alive:
				pass
			elif not _moves.is_empty() and _cd <= 0.0 and _pick(dist, sees) >= 0:
				_start(_pick(dist, sees), hero, dist)
			elif _moves.is_empty() and _cd <= 0.0 and sees and ((def["ranged"] and dist <= float(def["range"])) or (not def["ranged"] and dist <= reach + HERO_R)):
				_turn_to(to, dist)
				state = "windup"
				_t = float(def["windup"])
				_move = -1
				_set_list("attack", true)
			elif def["ranged"]:
				if sees:
					_turn_to(to, dist)
				if not (sees and dist <= float(def["keepMax"])):
					moved = _go(dt, to, dist, sees)
			elif dist > reach * 0.8 + HERO_R:
				moved = _go(dt, to, dist, sees)
			else:
				_turn_to(to, dist)
		"windup":
			var id: String = _moves[_move]["id"] if _move >= 0 else ""
			if id == "pierce":
				_hold_aim(hero)
			elif id != "charge" and id != "lockdown":
				_turn_to(to, dist)
			_t -= dt
			if _t <= 0.0:
				_land(hero, dist, reach)
		"charge":
			_run_charge(dt, hero)
		"recover":
			_t -= dt
			if _t <= 0.0:
				state = "chase"
	if state == "sleep" or state == "chase":
		_set_list("walk" if moved else "idle")
	_place()
	_show()
	queue_redraw()


# --- the moves ---

## pickMove: the biggest of its moves that is ready and in reach; -1 for none (it comes on).
func _pick(dist: float, sees: bool) -> int:
	if _move_cd.size() != _moves.size():
		_move_cd = []
		for mv in _moves:
			_move_cd.append(mv["first"] * randf_range(0.5, 1.5))
	var reach := float(def["range"]) if def["ranged"] else float(def["range"]) + (r - 0.32) + HERO_R
	for i in range(_moves.size() - 1, -1, -1):
		var mv: Dictionary = _moves[i]
		if _move_cd[i] > 0.0:
			continue
		if dist < mv["near"] or dist > (mv["far"] if mv["far"] > 0.0 else reach):
			continue
		if mv["id"] == "summon":
			if mgr.called(self) >= MM.SUMMON["most"]:
				continue
		elif not sees:
			continue
		# (the champion's cry is heard only by minions carrying his words: none on floor 1)
		if mv["id"] == "rally":
			continue
		if mv["id"] == "charge" and _lane(dist).is_empty():
			continue
		return i
	return -1


## startMove: it winds up, and what it is about to do is marked on the floor.
func _start(i: int, hero, dist: float) -> void:
	var mv: Dictionary = _moves[i]
	_move = i
	state = "windup"
	_t = mv["windup"]
	_turn_to(hero.world - world, dist)
	_set_list(MM.picture_of(art.name, mv["id"]), true)
	mgr.used[mv["id"]] = mgr.used.get(mv["id"], 0) + 1
	match mv["id"]:
		"slam":
			var at := minf(dist, float(def["range"]))
			mgr.perils.warn(world.x + face.x * at, world.y + face.y * at, float(def["aoe"]), mv["windup"], _roll() * mv["dmg"], self)
		"charge":
			var lane := _lane(dist)
			_charge = {"a": lane["a"], "b": lane["b"], "hit": false}
			mgr.perils.lane(self, lane["a"], lane["b"], MM.CHARGE["half"], mv["windup"])
			mgr.sfx.play("boss_roar", -8.0)
		"summon":
			mgr.sfx.play("boss_roar")
		"lockdown":
			mgr.perils.bars(self, world.x, world.y, _roll() * mv["dmg"], mv["windup"])
			mgr.sfx.play("boss_roar", -6.0)
		"pierce":
			_aim = mgr.perils.aim(self, world, _aim_end(face), mv["windup"])
		"sigil":
			# (FLOOR 2: the cultist's fire sigil, its ring under where the hero stands as it begins its cast: game/action_f2.ts)
			mgr.perils.sigil(hero.world.x, hero.world.y, _roll() * mv["dmg"], mv["windup"], self)
			mgr.sfx.play("fire", -8.0)


## landMove: the end of its wind-up.
func _land(hero, dist: float, reach: float) -> void:
	if _move < 0:
		# (its one blow, or its one shot)
		state = "recover"
		_t = RECOVER
		_cd = float(def["cooldown"]) * randf_range(0.9, 1.2)
		if def["ranged"]:
			mgr.shoot(self, (hero.world - world).normalized(), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll())
			mgr.sfx.play("shot", -6.0)
		else:
			_blow(hero, dist, reach, 1.0)
		return
	var mv: Dictionary = _moves[_move]
	state = "recover"
	_t = mv["recover"]
	_cd = mv["after"] * randf_range(0.9, 1.2)
	if mv["cooldown"] > 0.0:
		_move_cd[_move] = mv["cooldown"]
	match mv["id"]:
		"swing":
			_blow(hero, dist, reach, mv["dmg"])
		"shoot":
			mgr.shoot(self, (hero.world - world).normalized(), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll() * mv["dmg"])
			mgr.sfx.play("shot", -6.0)
		"rain":
			mgr.perils.rain(hero.world.x, hero.world.y, _roll() * mv["dmg"])
			mgr.sfx.play("shot", -4.0)
		"pierce":
			var way := face
			if not _aim.is_empty():
				way = (_aim["b"] - _aim["a"]).normalized()
			mgr.perils.drop(self, ["aim"])
			_aim = {}
			mgr.shoot(self, way, MM.AIM["speed"], MM.AIM["range"], _roll() * mv["dmg"], "great", MM.AIM["r"], true)
			mgr.sfx.play("shot")
			hero.shake()
		"bolts":
			var base := atan2(hero.world.y - world.y, hero.world.x - world.x)
			var n: int = MM.BOLTS["n"]
			for k in range(-(n / 2), n / 2 + 1):
				var a: float = base + k * MM.BOLTS["apart"]
				mgr.shoot(self, Vector2(cos(a), sin(a)), float(def["projSpeed"]), MM.BOLTS["range"], _roll() * mv["dmg"], "bolt")
			mgr.sfx.play("fire", -4.0)
		"slam":
			pass  # (the red circle does the harm: perils.gd)
		"lockdown":
			pass  # (its bars crash at the peril's own clock: perils.gd)
		"sigil":
			pass  # (its sigil erupts at the peril's own clock: perils.gd)
		"summon":
			mgr.summon(self)
		"charge":
			if not _charge.is_empty():
				state = "charge"
				_t = (_charge["b"] - _charge["a"]).length() / MM.CHARGE["speed"] + 0.5
				_set_list("charge", true)
				mgr.sfx.play("slam", -6.0)


func _blow(hero, dist: float, reach: float, share: float) -> void:
	mgr.sfx.play(ATK.get(kind, "atkBones"), -4.0)
	mgr.sfx.play("swing", -10.0)
	if hero.alive and dist <= reach + 0.45 + HERO_R:
		hero.hurt(_roll() * share)
	# (FLOOR 2: the Shade's rake, cold: a patch of rime before it as it lands: game/action_f2.ts)
	if kind == "shade":
		mgr.perils.rime(world.x + face.x * MM.RIME["ahead"], world.y + face.y * MM.RIME["ahead"], self)


## THE RED TROLL'S CHARGE: his line, from him through where the hero stands and 1.5 on, if he has a clear run there (no wall
## between, and long enough to get past the hero); empty if not (game.ts chargeLane).
func _lane(dist: float) -> Dictionary:
	if dist < 0.01:
		return {}
	var hero = mgr.hero
	var f: Vector2 = (hero.world - world) / dist
	var rr := minf(r, 0.42)
	var len := 0.0
	var a := 0.2
	while a <= dist + MM.CHARGE["past"] + 1e-6:
		var p: Vector2 = world + f * a
		if not mgr.clear(p.x, p.y, rr):
			break
		len = a
		a += 0.2
	if len < dist + 0.4:
		return {}
	return {"a": world, "b": world + f * len}


## He runs his line: the hero met on it is struck once and knocked aside, out of the line; at its end, or at anything that
## stops him, he pulls up, skidding, and stands a moment (game.ts runCharge, endCharge).
func _run_charge(dt: float, hero) -> void:
	var a: Vector2 = _charge["a"]
	var b: Vector2 = _charge["b"]
	var len := maxf((b - a).length(), 0.01)
	var f := (b - a) / len
	var step: float = MM.CHARGE["speed"] * dt
	var was := world
	var rr := minf(r, 0.42)
	if mgr.clear(world.x + f.x * step, world.y, rr):
		world.x += f.x * step
	if mgr.clear(world.x, world.y + f.y * step, rr):
		world.y += f.y * step
	face = f
	_t -= dt
	var along := (world - a).dot(f)
	for p in mgr.perils.list:
		if p["kind"] == "lane" and p.get("src") == self:
			p["gone"] = clampf(along / len, 0.0, 1.0)
	if not _charge["hit"] and hero.alive and hero.world.distance_to(world) <= r + HERO_R + 0.15:
		_charge["hit"] = true
		hero.hurt(_roll() * _moves[_move]["dmg"])
		var o := a + f * along
		var side := 1.0 if (hero.world - o).dot(Vector2(-f.y, f.x)) >= 0.0 else -1.0
		hero.knock(Vector2(-f.y, f.x) * side, MM.CHARGE["knock"])
		hero.shake()
		mgr.sfx.play("slam")
	if along >= len - 0.05 or world.distance_to(was) < step * 0.3 or _t <= 0.0:
		state = "recover"
		_t = _moves[_move]["recover"]
		_charge = {}
		mgr.perils.drop(self, ["lane"])
		_set_list("chargeStop", true)


## THE MARKSMAN DRAWS: his line of aim follows the hero until 0.4 s before he looses, then holds still (game.ts holdAim).
func _hold_aim(hero) -> void:
	if _aim.is_empty() or _t <= MM.AIM["lock"]:
		return
	var to: Vector2 = hero.world - world
	if to.length() < 0.01:
		return
	face = to.normalized()
	_aim["a"] = world
	_aim["b"] = _aim_end(face)


## Where a line of aim the way `f` ends: 14 tiles on, or at the first wall.
func _aim_end(f: Vector2) -> Vector2:
	var len := 0.0
	var a := 0.25
	while a <= MM.AIM["range"] + 1e-6:
		var p := world + f * a
		var t: int = mgr.map.tile(floori(p.x), floori(p.y))
		if t != 1 and t != 3:
			break
		len = a
		a += 0.25
	return world + f * len


# --- moving ---

## A step toward him: straight when it sees him close, else down the flow field; a bat weaves as it flies.
func _go(dt: float, to: Vector2, dist: float, sees: bool) -> bool:
	var way: Vector2 = to / dist if sees and dist < 2.5 else mgr.flow_dir(world)
	if way == Vector2.ZERO:
		return false
	if kind == "bat":
		_weave += dt * 7.0
		way = (way + Vector2(-way.y, way.x) * sin(_weave) * 0.6).normalized()
	face = way
	var step := way * speed * dt
	# (game.ts: a monster walks with a body no bigger than 0.42 round, so that a big one gets through a doorway)
	var rr := minf(r, 0.42)
	var fly := kind == "bat"
	if mgr.clear(world.x + step.x, world.y, rr, fly):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, rr, fly):
		world.y += step.y
	return true


func _turn_to(to: Vector2, dist: float) -> void:
	if dist > 0.01:
		face = to / dist


func _roll() -> float:
	return randf_range(dmg_min, dmg_max)


func wake_up() -> void:
	if state == "sleep":
		state = "chase"
		_cd = randf_range(0.2, 0.9)


func hurt(dmg: float) -> void:
	if dead or state == "rise":
		return
	# (nor is a boss who waits: game.ts damage, "Not yet")
	if waits:
		if _not_yet_t <= 0.0:
			_not_yet_t = 0.7
			_not_yet = 0.9
		queue_redraw()
		return
	life -= dmg
	_flash = 0.12
	_bar = BAR_FOR
	if state == "sleep":
		mgr.wake(self)
	if life <= 0.0:
		_die()


const PF := preload("res://scripts/pixel_font.gd")
const SAY_GOLD := Color("#ffd27a")
const SAY_INK := Color("#120d18")
## (render/fx.ts BOSS_SAY_LIFT: game pixels over where he stands)
const SAY_LIFT := 84.0


## His line on a dark slip over his head, a little tail pointing down at him (render/fx.ts, bossSay), in game pixels.
func _say_slip() -> void:
	var t := _said_secs - _said_t
	var a := minf(1.0, t / 0.15) if t < _said_secs - 0.4 else maxf(0.0, (_said_secs - t) / 0.4)
	var w := PF.width(_said) + 10.0
	var y := -SAY_LIFT - roundf(minf(1.0, t / 0.12) * 4.0)
	var foot := y + 1.0 + 10.0
	var ink := Color(SAY_INK, 0.8 * a)
	draw_rect(Rect2(-floorf(w / 2.0), y - 3.0, w, 14.0), ink)
	draw_rect(Rect2(-2, foot, 5, 1), ink)
	draw_rect(Rect2(-1, foot + 1, 3, 1), ink)
	draw_rect(Rect2(0, foot + 2, 1, 1), ink)
	PF.draw(self, _said, 0, y, Color(SAY_GOLD, a), {"align": "center", "shadow": Color(SAY_INK, a)})


## Say a line over his head for so many seconds (game.ts bossIntro, render/fx.ts bossSay).
func say(text: String, secs: float) -> void:
	_said = text
	_said_t = secs
	_said_secs = secs
	queue_redraw()


func _die() -> void:
	dead = true
	state = "dead"
	_bar = 0.0
	_set_list("die", true)
	mgr.perils.drop(self)
	if h2 != null and h2.has_method("died"):
		h2.died(self)
	if boss:
		mgr.boss_fell = true
		mgr.boss_at = world
	if mgr.loot != null:
		mgr.loot.on_kill(self)
	if VOICE.has(kind):
		mgr.sfx.play(VOICE[kind] + "_death", -4.0)
	elif boss:
		mgr.sfx.play("boss_roar")
	queue_redraw()


# --- its picture ---

func _set_list(list: String, again := false) -> void:
	if (_list != list or again) and art.has(list):
		_list = list
		_anim_t = 0.0


## Where it is on the screen; on raised or sunken ground and on stairs it is drawn as high as the ground is there
## (floor_map.gd lift_at).
func _place() -> void:
	position = Iso.to_screen(world.x, world.y)
	_lift = mgr.map.lift_at(world.x, world.y) if mgr != null and mgr.map != null else 0.0
	if _sprite != null:
		_sprite.position.y = -_lift


func _show() -> void:
	var n := art.count(0, _list)
	if n == 0:
		return
	var i := int(_anim_t * art.fps(_list))
	# (standing, walking and running go round; a blow, a fall, a call play once and hold their last frame)
	i = i % n if _list in ["idle", "walk", "charge"] else mini(i, n - 1)
	var f := art.frame(face.x, face.y, _list, i)
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.flip_h = f["flip"]
	_sprite.scale = Vector2.ONE * float(f["scale"])
	_sprite.self_modulate = Color(2.4, 2.4, 2.4) if _flash > 0.0 else Color.WHITE


## Its life over its head for a while after it is struck (game.ts barT).
func _draw() -> void:
	var top := _sprite.offset.y * _sprite.scale.y - 10.0 - _lift
	if (_said_t > 0.0 or _not_yet > 0.0) and not dead:
		# (in the game's letters, in game pixels: render/fx.ts)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		if _said_t > 0.0:
			_say_slip()
		if _not_yet > 0.0:
			var rise := roundf((0.9 - _not_yet) * 12.0)
			PF.draw(self, "Not yet", 0, top / 2.0 - 4 - rise, Color(SAY_GOLD, clampf(_not_yet / 0.3, 0.0, 1.0)), {"align": "center", "shadow": Color(SAY_INK, clampf(_not_yet / 0.3, 0.0, 1.0))})
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	if _bar <= 0.0 or dead:
		return
	var w := 36.0 if not boss else 80.0
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 6), Color(0.04, 0.04, 0.1, 0.85))
	draw_rect(Rect2(-w / 2, top, w * clampf(life / max_life, 0.0, 1.0), 4), Color(0.86, 0.18, 0.28))
