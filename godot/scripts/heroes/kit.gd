## WHAT EVERY HERO BUT THE WARRIOR HAS IN COMMON IN HIS MOVES (the Warrior's are hero.gd's own), as the game makes them: game.ts
## updateHero (his waits running down, a charge back as each runs out; a dodge asked for; the wind-up running out; the hold; the
## tap), useBasic, useSkill, begin, release (TRACK_AIM: an attack pressed at an enemy follows it, and goes where it will be),
## reachPoint, updateProjectiles, projectileHit, endProjectile; and his pictures as render/figure.ts picks them for a hero painted
## from eight sides (an attack's own pictures, made walking the way he goes; his run by how far he has gone; his stand).
## Each hero's own script (heroes/<class>.gd) extends this with what is his: what his moves deliver (_deliver), his evasive move
## (_use_evasive, and his own movement, _move_step), what he leaves and keeps up (_step_own), his own pictures (_own_picture).
## He walks through his attacks, slowed to 40% for 0.18 s as each begins.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const Words := preload("res://scripts/words.gd")

var h  # hero.gd
var cls := ""
var C := {}  # assets/heroes/clips.json: his pictures' times; T the moves' numbers
var T := {}
var walked_way := Vector2.ZERO

# (the game's Hero for his moves: swingT, windup, attackSkill/Age/Wind/T, queued, each move's charges and cooldown, his own move)
var swing_t := 0.0
var windup := {}
var attack := {}
var queued := {}
var cd := [0.0, 0.0, 0.0]
var full := [0.01, 0.01, 0.01]
var charges := [1, 1, 1]
var max_charges := [1, 1, 1]
var move := {}
## (what he has sent flying: game.ts projectiles, his own: {x, y, vx, vy, r, dist, dmg, element, look, pierce, hit, volley, skill,
## trail, words, age, n, flown})
var shots: Array = []
var look  # heroes/<class>_look.gd, in the place he is in
var _later: Array = []
var _clock := 0.0
var _anim_t := 0.0


func _init(hero, c := "") -> void:
	h = hero
	cls = c if c != "" else str(hero.cls)
	var all: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))
	C = all[cls]
	T = {"tune": all["tune"]}
	for k in ["rangerArrow", "volleySeen", "trackAim", "palette", "ramps", "crackle"]:
		T[k] = all[k]
	# (game.ts refresh: a roll holds two charges while the moves wait their turns; anything else one)
	for i in 3:
		max_charges[i] = 2 if str(_def(i)["kind"]) == "roll" else 1
		charges[i] = max_charges[i]


func _def(i: int) -> Dictionary:
	return Words.data()["skills"][Words.data()["classes"][cls]["moves"][i]]


## (game.ts after) `fn` a while from now, while he is in this place.
func _after(t: float, fn: Callable) -> void:
	_later.append({"t": t, "fn": fn})


# =====================================================================================================================
# EACH STEP (game.ts updateHero)

## A step of him; true while what he does is all he does (his own move: a roll, a jump).
func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_clock += dt
	_anim_t += dt
	swing_t = maxf(0.0, swing_t - dt)
	if not attack.is_empty():
		attack["age"] = float(attack["age"]) + dt
		attack["t"] = maxf(0.0, float(attack["t"]) - dt)
		if float(attack["t"]) <= 0.0:
			attack = {}
			_anim_t = 0.0
	for i in range(_later.size() - 1, -1, -1):
		_later[i]["t"] = float(_later[i]["t"]) - dt
		if float(_later[i]["t"]) <= 0.0:
			var fn: Callable = _later[i]["fn"]
			_later.remove_at(i)
			fn.call()
	# (his waits come round: a charge back as each runs out, the next begun if he lacks more: game.ts updateHero)
	var pace: float = h.cd_pace()
	for i in 3:
		if charges[i] < max_charges[i]:
			cd[i] -= dt * pace
			if cd[i] <= 0.0:
				charges[i] += 1
				cd[i] = float(h.loadout.r(i)["cooldown"]) if charges[i] < max_charges[i] else 0.0
	_step_shots(dt)
	_step_own(dt)
	if not move.is_empty():
		_move_step(dt)
		return true
	if not h.alive or h.scene_pace > 0.0:
		return false
	# (a dodge: whatever he was doing breaks off)
	var dodge: Vector2 = h.auto_lunge
	h.auto_lunge = Vector2.INF
	if Input.is_action_just_pressed("lunge"):
		dodge = h._pointer(way, float(_def(2)["range"]))
	if dodge != Vector2.INF and not hooked:
		_use_evasive(dodge, way)
		if not move.is_empty():
			return true
	# (an attack that was begun lands when its wind-up is over)
	if not windup.is_empty():
		windup["t"] = float(windup["t"]) - dt
		if float(windup["t"]) <= 0.0:
			_release()
	if Input.is_action_just_pressed("whirl") or h.auto_whirl:
		h.auto_whirl = false
		var at := _aim(float(_def(1)["range"]), str(_def(1)["kind"]))
		_use_skill(1, at)
	elif not queued.is_empty():
		queued["t"] = float(queued["t"]) - dt
		if float(queued["t"]) <= 0.0:
			queued = {}
		elif windup.is_empty():
			var q := queued
			queued = {}
			_use_skill(1, Vector2(q["tx"], q["ty"]))
	var fire: bool = Input.is_action_pressed("attack") or h.auto_attack
	h.auto_attack = false
	if fire:
		# (not in another attack's wind-up, nor on top of a slow attack only just landed: its follow-through seen out, all but the
		# last moment of it)
		var busy: bool = not windup.is_empty() or (not attack.is_empty() and int(attack["skill"]) != 0 and float(attack["t"]) > float(T["tune"]["attackCut"]))
		if swing_t <= 0.0 and not busy:
			_use_basic(_aim(float(_def(0)["range"]), str(_def(0)["kind"])))
	return false


## (his own) What he keeps up each step besides his shots: a volley coming down, traps, orbs.
func _step_own(_dt: float) -> void:
	pass


## (his own) A step of his own move (a roll, a jump), while there is one.
func _move_step(_dt: float) -> void:
	move = {}


## How his walk is slowed now: an attack slows him for a moment from when it is begun (game.ts updateHero).
func walk_slow() -> float:
	if not attack.is_empty() and float(attack["age"]) < float(T["tune"]["attackSlowTime"]):
		return float(T["tune"]["attackSlow"])
	return 1.0


## Whether he turns the way he walks: not while he looses or winds up (he faces his mark).
func turns_to_walk() -> bool:
	return attack.is_empty() and windup.is_empty()


## Where he aims: where the pointer is while a button is held, else the nearest enemy awake within `reach` (game/lock.ts placedAim:
## a volley put where it is going, that it walks into the rain), else before him.
func _aim(reach: float, kind := "") -> Vector2:
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		return Iso.to_world(h.get_global_mouse_position())
	if h.monsters != null:
		var m = h.monsters.nearest(h.world, reach)
		if m != null:
			if kind == "volley":
				return _lead(m, float(_def(1)["windup"]) + float(T["tune"]["volleyDelay"]) + float(T["tune"]["volleyLead"]))
			return m.world
	return h.world + h.face * 3.0


## (game/lock.ts leadPoint) Where a monster coming at him will be in `seconds`: no nearer than it means to stand to strike; where
## it is, if it shoots, sleeps or cannot move.
func _lead(m, seconds: float) -> Vector2:
	var d: float = h.world.distance_to(m.world)
	var def: Dictionary = m.def
	if bool(def.get("ranged", false)) or m.state == "sleep" or m.speed <= 0.0 or d < 0.01:
		return m.world
	var go := maxf(0.0, minf(d - float(def.get("range", 0.0)) * 0.8, m.speed * seconds))
	return m.world + (h.world - m.world) / d * go


## What the fight tells (fx.gd event), and his own look of it (heroes/<class>_look.gd).
func _say(e: Dictionary) -> void:
	h._tell(e)
	if look != null and is_instance_valid(look):
		look.on_event(e, h.fx)


func _face(at: Vector2) -> void:
	var to: Vector2 = at - h.world
	if to.length() > 0.01:
		h._turn(to.normalized())


# =====================================================================================================================
# HIS MOVES (game.ts useBasic, useSkill, begin, release)

func _use_basic(at: Vector2) -> void:
	var r: Dictionary = h.loadout.r(0)
	# (Frenzied: the frenzy makes the quick attack faster; a chill on him, slower)
	var rate: float = maxf(0.3, float(r["rate"])) * h.frenzy_pace()
	if h.chill_t > 0.0:
		rate *= 1.0 - h.chill_k * 0.5
	swing_t = 1.0 / rate
	_face(at)
	# (a fast weapon's wind-up is never more than two fifths of the time between its blows)
	var wind := minf(float(_def(0)["windup"]), 0.4 / rate)
	_begin(0, at, wind)


func _use_skill(i: int, at: Vector2) -> void:
	if charges[i] < 1:
		return
	if not windup.is_empty():
		# (another attack is being made: this one waits its turn, briefly; it is not lost)
		queued = {"tx": at.x, "ty": at.y, "t": 0.4}
		return
	_face(at)
	_begin(i, at, float(_def(i)["windup"]))


func _begin(i: int, at: Vector2, wind: float) -> void:
	# (his voice, now and then, as he attacks: game.ts begin, engine/audio.ts heroVoice)
	h.sfx.voice(h.cls, "attack")
	var def := _def(i)
	attack = {"skill": i, "age": 0.0, "wind": wind, "t": wind + float(def["follow"])}
	_anim_t = 0.0
	windup = {"skill": i, "tx": at.x, "ty": at.y, "t": wind}
	# (the bow drawn for a shot or a volley)
	if wind > 0.05 and (str(Words.data()["classes"][cls]["moves"][i]) == "shot" or def["kind"] == "volley"):
		h.sfx.play("bowDraw", linear_to_db(0.5))
	# (TRACK_AIM: a quick attack pressed at an enemy follows it through the wind-up)
	if i == 0 and h.monsters != null:
		var m = h.monsters.nearest(at, float(T["trackAim"]["near"]))
		if m != null:
			windup["tid"] = m
	if wind <= 0.0:
		_release()


func _release() -> void:
	var w := windup
	if w.is_empty():
		return
	windup = {}
	var i: int = w["skill"]
	var def := _def(i)
	var r: Dictionary = h.loadout.r(i)
	if i == 0 and float(def["cooldown"]) <= 0.0:
		h.uses[0] += 1
		_release_sound(def)
		# (TRACK_AIM: pressed at an enemy, he turns to where it is as it goes off, and what flies to where it will be as it gets there)
		var m = w.get("tid")
		if m != null and is_instance_valid(m) and not m.dead:
			var far: float = h.world.distance_to(m.world)
			var speed: float = float(r["proj_speed"]) if float(r.get("proj_speed", 0.0)) > 0.0 else float(def.get("speed", 0.0))
			var at: Vector2 = m.world if def["kind"] == "melee" or speed <= 0.0 else _lead(m, far / speed)
			if at.distance_to(h.world) > 0.05:
				_face(at)
		_deliver(0, h.world, h.world + h.face, 1.0, true)
		return
	# (what it needs may have gone in the meantime: then nothing happens, and nothing is paid)
	if charges[i] < 1:
		return
	charges[i] -= 1
	h.uses[i] += 1
	if cd[i] <= 0.0:
		cd[i] = float(r["cooldown"])
		full[i] = maxf(0.01, cd[i])
	_deliver(i, h.world, Vector2(w["tx"], w["ty"]), 1.0, true)


## (game.ts release) What is heard as a quick attack goes: a melee swing, a shot, a wave.
func _release_sound(def: Dictionary) -> void:
	match str(def["kind"]):
		"melee":
			h.sfx.play("swing", linear_to_db(0.8))
		"projectile":
			h.sfx.play("shot", linear_to_db(0.8))
		"wave":
			h.sfx.play("wave", linear_to_db(0.8))


## (his own: game.ts deliver) The attack lands: what it sends, where.
func _deliver(_i: int, _from: Vector2, _to: Vector2, _frac: float, _primary: bool) -> void:
	pass


## (his own: game.ts useEvasive) His evasive move, asked for toward `at`.
func _use_evasive(_at: Vector2, _way: Vector2) -> void:
	pass


## (game.ts useEvasive, its start) Whether the move may be made, and if so paid for and everything else broken off: its charge, its
## wait begun; an attack being made broken off, and costing nothing, not even its turn.
func _pay_evasive() -> bool:
	if charges[2] < 1:
		return false
	charges[2] -= 1
	h.uses[2] += 1
	if cd[2] <= 0.0:
		cd[2] = float(h.loadout.r(2)["cooldown"])
		full[2] = maxf(0.01, cd[2])
	if not windup.is_empty() and int(windup["skill"]) == 0:
		swing_t = 0.0
	windup = {}
	queued = {}
	attack = {}
	return true


## (game.ts useEvasive) With no clear target, the way he goes or faces, as far as it reaches: a dodge asked for never fizzles.
func _evasive_at(at: Vector2, way: Vector2) -> Vector2:
	if at.distance_to(h.world) < 0.9:
		var dir: Vector2 = way if way != Vector2.ZERO else h.face
		return h.world + dir.normalized() * float(_def(2)["range"])
	return at


## (game.ts reachPoint) As near `to` as he can see, no further than `reach`.
func _reach_point(to: Vector2, reach: float) -> Vector2:
	var d: Vector2 = to - h.world
	var far := minf(d.length(), reach)
	if far < 0.01:
		return h.world
	var u := d / d.length()
	while far > 0.2:
		var p: Vector2 = h.world + u * far
		if h._clear(p.x, p.y) and (h.monsters == null or h.monsters.sees(h.world, p)):
			return p
		far -= 0.2
	return h.world


# =====================================================================================================================
# WHAT HE SENDS FLYING (game.ts updateProjectiles, projectileHit, endProjectile): an arrow, a wave of force

func _step_shots(dt: float) -> void:
	for i in range(shots.size() - 1, -1, -1):
		var p: Dictionary = shots[i]
		p["age"] = float(p["age"]) + dt
		var v := Vector2(p["vx"], p["vy"])
		var sp := v.length() if v.length() > 0.0 else 1.0
		var travel := sp * dt
		var dead := false
		while travel > 0.0 and not dead:
			var stp := minf(0.25, travel)
			travel -= stp
			var n := Vector2(float(p["x"]) + v.x / sp * stp, float(p["y"]) + v.y / sp * stp)
			if not h._clear(n.x, n.y):
				# (what the hero shoots may meet a sealed door, and open it)
				if h.doors != null:
					h.doors.unseal({"front": h.loadout.wfronts(int(p["skill"])), "behind": h.loadout.wbehinds(int(p["skill"]))}, n, 0.1)
				_end_shot(p)
				dead = true
				break
			p["x"] = n.x
			p["y"] = n.y
			p["dist"] = float(p["dist"]) - stp
			p["flown"] = float(p["flown"]) + stp
			var r: Dictionary = h.loadout.r(int(p["skill"]))
			# (whatever he sends flying breaks the barrels and urns it passes, and flies on)
			h._break_props(int(p["skill"]), n, float(p["r"]))
			if h.monsters != null:
				for m in h.monsters.list:
					if not is_instance_valid(m) or m.dead or (p["hit"] as Array).has(m) or m.state == "rise":
						continue
					if m.world.distance_to(n) > float(p["r"]) + m.r:
						continue
					(p["hit"] as Array).append(m)
					_shot_hit(p, m)
					if not bool(p["pierce"]):
						dead = true
						break
			if not dead and r["zone"] != null:
				p["trail"] = float(p["trail"]) + stp
				if float(p["trail"]) >= 0.8:
					p["trail"] = 0.0
					h.wakes.add_ground(r["zone"], int(p["skill"]), n, 0.8, h.avg_hit(int(p["skill"]), float(p["dmg"])), r["meld_behind"])
			if not dead and float(p["dist"]) <= 0.0:
				_end_shot(p)
				dead = true
		if dead:
			shots.remove_at(i)


func _shot_hit(p: Dictionary, m) -> void:
	var i: int = p["skill"]
	var r: Dictionary = h.loadout.r(i)
	var at: Vector2 = m.world
	if p.get("look", "") == "arrow":
		h.sfx.play("arrowHit", linear_to_db(0.5))
	h.hit_monster(m, i, float(p["dmg"]), false)
	# (what goes through several is still one blow)
	if not p.get("mighted", false):
		p["mighted"] = true
		h._landed_on(i)
		if (p["words"] as Array).has("heavy"):
			h._tell({"t": "heavy", "x": at.x, "y": at.y, "r": 1.1, "big": false})
	h.sfx.play("power" if (p["words"] as Array).has("power") else "hit", linear_to_db(0.6))
	if float(r["splash"]) > 0.0:
		var rad: float = float(r["splash"]) * float(r["size"])
		h._tell(h._vast_edge(r, rad, {"t": "burst", "x": at.x, "y": at.y, "r": rad, "el": r["element"], "style": "blast" if float(r["splash_dmg"]) >= 1.0 else "shock", "words": p["words"]}))
		if float(r["splash_dmg"]) >= 1.0:
			h.sfx.play("frost" if r["element"] == "frost" else "explode", linear_to_db(0.6))
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead or o == m:
				continue
			# (one of a volley: what another of them has hurt is left alone)
			if bool(p["volley"]) and (p["hit"] as Array).has(o):
				continue
			if o.world.distance_to(at) > rad + o.r or h.monsters.shut_in(o):
				continue
			if bool(p["volley"]):
				(p["hit"] as Array).append(o)
			h.hit_monster(o, i, float(p["dmg"]) * float(r["splash_dmg"]), true)
		h._break_props(i, at, rad)
	# (what the words behind it leave, once: the rune, the cloud, the ground)
	if not p.get("left", false):
		p["left"] = true
		h._wake(i, at, 1.0, float(p["dmg"]))
	h.city.pull_in(i, at, float(r["splash"]) * float(r["size"]) if float(r["splash"]) > 0.0 else 0.0, true)
	h._tell({"t": "spark", "x": at.x, "y": at.y, "el": r["element"], "n": 6})


func _end_shot(p: Dictionary) -> void:
	h._tell({"t": "spark", "x": p["x"], "y": p["y"], "el": p["element"], "n": 4})
	var at := Vector2(p["x"], p["y"])
	if not p.get("left", false) and h._clear(at.x, at.y):
		p["left"] = true
		h._wake(int(p["skill"]), at, 1.0, float(p["dmg"]))


# =====================================================================================================================
# HIS PICTURES (render/figure.ts, for a hero painted from eight sides)

## The way he goes as he faces another (figure.ts wayOf): 0 ahead, then round; -1 standing.
func _way_of() -> int:
	if walked_way.length() <= 1e-4:
		return -1
	var world := atan2(walked_way.y, walked_way.x) - atan2(h.face.y, h.face.x)
	var to_left := -world
	return roundi(fposmod(rad_to_deg(to_left), 360.0) / 90.0) % 4


## (figure.ts attackFrame) The frame of an attack `age` seconds after it was begun, its wind-up `wind`: the picture's own wind-up
## played to end when the rules' does, then at its own pace.
static func attack_frame(c: Dictionary, age: float, wind: float) -> int:
	var hit: float = float(c["hit"]) if c.get("hit") != null else 0.0
	var t := ((age / wind) * hit if wind > 0.0 else hit) if age < wind else hit + (age - wind)
	return floori(t * float(c["fps"]) + 1e-6)


## (his own) [list, frame] for a move of his own (a roll), or [] for the rest.
func _own_picture(_side: int) -> Array:
	return []


## [list, frame] he is seen in now (hero.gd _show), [] for its own choice.
func picture(side: int) -> Array:
	var own := _own_picture(side)
	if not own.is_empty():
		return own
	var L: Dictionary = C["lists"]
	var way := _way_of()
	if not attack.is_empty():
		var s: int = attack["skill"]
		var list := 14 if s == 0 else 20
		if way >= 0:
			list = (15 if s == 0 else 35) + way
		var c = L.get(str(list))
		if c == null:
			list = 14 if s == 0 else 20
			c = L.get(str(list))
		if c != null:
			return [list, mini(int(c["n"]) - 1, attack_frame(c, float(attack["age"]), float(attack["wind"])))]
	if way >= 0:
		# (his walk by how far he has gone, to the nearest picture: figure.ts, a walk whose feet grip the floor)
		var list := 2 if way == 0 else 2 + way
		var n: int = h.art.count(side, list)
		if n == 0:
			list = 2
			n = h.art.count(side, 2)
		var stride = C.get("walkStride")
		var at := roundi(h.walked / float(stride) * n) if stride != null else floori(_anim_t * float(C["walkFps"]))
		return [list, posmod(at, maxi(1, n))]
	var n0: int = h.art.count(side, 0)
	return [0, floori(_anim_t * float(C["idleFps"])) % maxi(1, n0)]


## How soon each of his moves is ready again, 0 to 1, by its place (the HUD: "whirl" the hold, "lunge" the dodge), and their charges.
func readiness() -> Dictionary:
	var k := func(i: int) -> float: return 1.0 if charges[i] >= 1 else 1.0 - cd[i] / maxf(0.01, full[i])
	return {"whirl": k.call(1), "lunge": k.call(2), "charges": charges[2], "have": charges.duplicate(), "max": max_charges.duplicate()}


## (his own) What he left in the place he is leaving.
func _clear_own() -> void:
	pass


## A new place: what he sent and laid is gone with the old one.
func clear() -> void:
	shots.clear()
	_later.clear()
	windup = {}
	attack = {}
	queued = {}
	move = {}
	_clear_own()
