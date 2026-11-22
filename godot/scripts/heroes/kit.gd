## WHAT EVERY HERO BUT THE WARRIOR HAS IN COMMON IN HIS MOVES (the Warrior's are hero.gd's own), as the game makes them: game.ts
## updateHero (his waits running down, a charge back as each runs out; a dodge asked for; the wind-up running out; the hold; the
## tap), useBasic, useSkill, begin, release (TRACK_AIM: an attack pressed at an enemy follows it, and goes where it will be),
## reachPoint, updateProjectiles, projectileHit, endProjectile; and his pictures as render/figure.ts picks them for a hero painted
## from eight sides (an attack's own pictures, made walking the way he goes; his run by how far he has gone; his stand).
## Each hero's own script (heroes/<class>.gd) extends this with what is his: what his moves deliver (_deliver), his evasive move
## (_use_evasive, and his own movement, _move_step), what he leaves and keeps up (_step_own), his own pictures (_own_picture).
## He walks through his attacks, slowed to 40% for 0.18 s as each begins.
extends RefCounted

## (a shot's burst hitting what is round what it struck: those are not struck by the shot itself, and set off none of what a hit
## of the shot's own does; the Warlock's Hex Chain and Blazing Arm: heroes/warlock.gd on_hit)
var splashing := false

const Iso := preload("res://scripts/iso.gd")
const Words := preload("res://scripts/words.gd")
## (THE SKILL TREES: talents.gd, its numbers for every class's tree)
const Talents := preload("res://scripts/talents.gd")

var h  # hero.gd
var cls := ""
var C := {}  # assets/heroes/clips.json: his pictures' times; T the moves' numbers
var clips := {}  # (all of clips.json: a look of his own, the Warlock's demon, has its own times there)
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
## (a melee quick attack's combo: which swing (1, the second), how long a next may follow as the second; and its small step forward)
var combo := 0
var combo_t := 0.0
var swing_step := {}
var _clock := 0.0
var _anim_t := 0.0


func _init(hero, c := "") -> void:
	h = hero
	cls = c if c != "" else str(hero.cls)
	var all: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))
	clips = all
	C = all[cls]
	T = {"tune": all["tune"]}
	for k in ["rangerArrow", "volleySeen", "trackAim", "palette", "ramps", "crackle", "swap"]:
		T[k] = all[k]
	# (game.ts refresh: a roll holds two charges while the moves wait their turns; anything else one)
	limit_changed()


## (game.ts refresh: a roll holds two charges while the moves wait their turns, cooldowns the limit; anything else one)
func limit_changed() -> void:
	for i in 3:
		max_charges[i] = 2 if str(_def(i)["kind"]) == "roll" and not h.by_mana() else 1
		charges[i] = max_charges[i]
	if has_method("talents_changed"):
		call("talents_changed")


func _def(i: int) -> Dictionary:
	return Words.data()["skills"][h.loadout.id(i)]


## (game.ts after) `fn` a while from now, while he is in this place.
func _after(t: float, fn: Callable) -> void:
	_later.append({"t": t, "fn": fn})


# =====================================================================================================================
# EACH STEP (game.ts updateHero)

## A step of him; true while what he does is all he does (his own move: a roll, a jump).
func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_tick(dt)
	return _act(dt, way, hooked)


## (game.ts updateHero, its first part) What runs down whatever he is doing: his swing's wait, his attack, what was put off, his
## moves' waits and charges, what he has sent flying and laid.
func _tick(dt: float) -> void:
	_clock += dt
	_anim_t += dt
	if let_go_t >= 0.0:
		let_go_t += dt
	swing_t = maxf(0.0, swing_t - dt)
	combo_t = maxf(0.0, combo_t - dt)
	if not swing_step.is_empty():
		var k := minf(dt, float(swing_step["left"]))
		swing_step["left"] = float(swing_step["left"]) - dt
		var mv: Vector2 = swing_step["v"] * (k / float(swing_step["t"]))
		if h._clear(h.world.x + mv.x, h.world.y):
			h.world.x += mv.x
		if h._clear(h.world.x, h.world.y + mv.y):
			h.world.y += mv.y
		if float(swing_step["left"]) <= 0.0:
			swing_step = {}
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


## (game.ts updateHero, the rest) His own move going on; a dodge asked for; the wind-up running out; the hold; the tap.
func _act(dt: float, way: Vector2, hooked: bool) -> bool:
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
	if dodge != Vector2.INF and not hooked and h.move_open(2):
		_use_evasive(dodge, way)
		if not move.is_empty():
			return true
	# (an attack that was begun lands when its wind-up is over)
	if not windup.is_empty():
		windup["t"] = float(windup["t"]) - dt
		if float(windup["t"]) <= 0.0:
			_release()
	# (one held goes on while it is held: the Mage's Beam, the Ranger's Snipe)
	if not channel.is_empty():
		_update_channel(dt)
	if (Input.is_action_just_pressed("whirl") or h.auto_whirl) and channel.is_empty():
		h.auto_whirl = false
		var at := _aim(float(_def(1)["range"]), str(_def(1)["kind"]), 1)
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
		var busy: bool = not windup.is_empty() or not channel.is_empty() or (not attack.is_empty() and int(attack["skill"]) != 0 and float(attack["t"]) > float(T["tune"]["attackCut"]))
		if swing_t <= 0.0 and not busy:
			_use_basic(_aim(float(_def(0)["range"]), str(_def(0)["kind"]), 0))
	return false


## (his own) What he keeps up each step besides his shots: a volley coming down, traps, orbs.
func _step_own(_dt: float) -> void:
	pass


## (his own) A step of his own move (a roll, a jump), while there is one.
func _move_step(_dt: float) -> void:
	move = {}


## How his walk is slowed now: an attack slows him for a moment from when it is begun (game.ts updateHero).
func walk_slow() -> float:
	# (one being held slows him for as long as it is: a beam to a walk: game.ts, TUNE.beamWalk)
	if not channel.is_empty():
		return float(T["tune"]["beamWalk"])
	# (THE RANGER'S TREE: Fleet, he shoots on the run: loosing an arrow no longer slows him)
	if h.has("fleet") and not attack.is_empty() and str(_def(int(attack.get("skill", 0)))["kind"]) in ["projectile", "volley"]:
		return 1.0
	if not attack.is_empty() and float(attack["age"]) < float(T["tune"]["attackSlowTime"]):
		return float(T["tune"]["attackSlow"])
	return 1.0


## Whether he turns the way he walks: not while he looses or winds up (he faces his mark).
func turns_to_walk() -> bool:
	return attack.is_empty() and windup.is_empty()


## Where he aims: where the pointer is while a button is held, else the nearest enemy awake within `reach` (game/lock.ts placedAim:
## a volley put where it is going, that it walks into the rain), else before him.
func _aim(reach: float, kind := "", which := -1) -> Vector2:
	# (on a phone: where the aim help, the thumb or his facing put the move `which`: touch.gd; -2: the aim help's own)
	if which >= 0 and h.touch_aim.has(which):
		return h.touch_aim[which]
	if which == -1 and h.touch_aim.has(0):
		return h.touch_aim[0]
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
	var rate: float = maxf(0.3, float(r["rate"])) * h.attack_pace()
	if h.chill_t > 0.0:
		rate *= 1.0 - h.chill_k * 0.5
	swing_t = 1.0 / rate
	_face(at)
	# (a fast weapon's wind-up is never more than two fifths of the time between its blows)
	var wind := minf(float(_def(0)["windup"]), 0.4 / rate)
	# (A TWO-HIT COMBO, defs.ts COMBO: a melee quick attack's second swing if this one comes soon enough after a first, else the first;
	# and a small step forward with either: game.ts useBasic)
	if str(_def(0)["kind"]) == "melee":
		combo = 1 if combo == 0 and combo_t > 0.0 else 0
		combo_t = 1.0 / rate + float(T["tune"]["comboWindow"])
		swing_step = {"v": h.face * float(T["tune"]["swingStep"]), "t": float(T["tune"]["swingStepTime"]), "left": float(T["tune"]["swingStepTime"])}
	else:
		combo = 0
	_begin(0, at, wind)


func _use_skill(i: int, at: Vector2) -> void:
	# (THE FIRST LEVELS: not before its level)
	if not h.move_open(i):
		return
	# (one that is being held is already being made: the button held down does not ask for another)
	if not channel.is_empty() or charges[i] < 1:
		return
	# (ABILITIES: MANA: not without the mana to begin it: game.ts useSkill, noMana)
	if h.mana < h.mana_to_begin(i):
		h.no_mana()
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
	attack = {"skill": i, "age": 0.0, "wind": wind, "t": wind + float(def["follow"]), "second": i == 0 and combo == 1}
	let_go_t = -1.0
	_anim_t = 0.0
	windup = {"skill": i, "tx": at.x, "ty": at.y, "t": wind}
	# (the bow drawn for a shot or a volley)
	if wind > 0.05 and (h.loadout.id(i) == "shot" or def["kind"] == "volley"):
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
		if m != null and is_instance_valid(m) and not m.dead and def["kind"] in ["projectile", "wave", "melee"]:
			var far: float = h.world.distance_to(m.world)
			var speed: float = float(r["proj_speed"]) if float(r.get("proj_speed", 0.0)) > 0.0 else float(def.get("speed", 0.0))
			var at: Vector2 = m.world if def["kind"] == "melee" or speed <= 0.0 else _lead(m, far / speed)
			if at.distance_to(h.world) > 0.05:
				_face(at)
		# (the quick attack goes the way he faces, from wherever he has got to; THE TINKERER's vial, thrown, to where it was aimed)
		var to: Vector2 = Vector2(w["tx"], w["ty"]) if def["kind"] in ["vialtoss", "contraption", "snare"] else h.world + h.face
		_deliver(0, h.world, to, 1.0, true)
		return
	# (what it needs may have gone in the meantime: then nothing happens, and nothing is paid)
	if charges[i] < 1 or h.mana < h.mana_to_begin(i):
		return
	# (an attack that goes on while it is held begins here: it is paid for when it ends)
	if float(def.get("channel", 0.0)) > 0.0:
		_begin_channel(i, Vector2(w["tx"], w["ty"]))
		return
	h.mana -= float(r["mana"])
	charges[i] -= 1
	h.uses[i] += 1
	if cd[i] <= 0.0:
		cd[i] = float(r["cooldown"])
		full[i] = maxf(0.01, cd[i])
	_deliver(i, h.world, Vector2(w["tx"], w["ty"]), 1.0, true)


# =====================================================================================================================
# A MOVE HELD (game.ts beginChannel, updateChannel, endChannel, channelBite): the Mage's Beam, the Ranger's Snipe

## {skill, t, next, bites, tx, ty, wake} while one is held; {} none.
var channel := {}
## (a check's hand on the button: held without it)
var hold_auto := false
## (his picture: how long since the one held was let go; -1, none since the last attack began)
var let_go_t := -1.0
## (game.ts CHANNEL_POSE: the pose of the blow held while it goes on)
const CHANNEL_POSE := 0.05
## (THE RANGER'S SNIPE: the draw of the arrow being loosed now, 0 to 1)
var snipe_power := 0.0


func _holding() -> bool:
	return Input.is_action_pressed("whirl") or hold_auto


## (game.ts beginChannel) It begins: from now on _update_channel keeps it going, its first bite in this same step. It counts as
## used now; its wait begins when it ends.
func _begin_channel(i: int, at: Vector2) -> void:
	var def := _def(i)
	var r: Dictionary = h.loadout.r(i)
	h.uses[i] += 1
	h._time_word_sound(i)
	channel = {"skill": i, "t": 0.0, "next": 0.0, "bites": 0, "tx": at.x, "ty": at.y, "wake": 0.0}
	var to: Vector2 = at - h.world
	var way: Vector2 = to / to.length() if to.length() >= 0.01 else h.face
	h._cast(i, str(def["kind"]), h.world, way)
	_say({"t": "channel", "kind": def["kind"], "x": h.world.x, "y": h.world.y, "el": r["element"]})
	if def["kind"] == "beam":
		h.sfx.play("beam", linear_to_db(0.8))
	h._boons(i)
	let_go_t = -1.0


## (game.ts updateChannel) Is it over (let go, run its length)? then its bite, if one is due; then time passes. So one let go the
## moment it began has still bitten once. THE SNIPE draws while it is held, aimed where he points; let go, or drawn its longest,
## the arrow flies, the harder the longer he drew.
func _update_channel(dt: float) -> void:
	var ch := channel
	var i: int = ch["skill"]
	var def := _def(i)
	var r: Dictionary = h.loadout.r(i)
	var length: float = float(def.get("channel", 0.0)) * float(r["last"])
	var hold := _holding()
	if def["kind"] == "snipe":
		if hold:
			var at := _aim(float(def["range"]), "", i)
			ch["tx"] = at.x
			ch["ty"] = at.y
		_face(Vector2(ch["tx"], ch["ty"]))
		ch["t"] = float(ch["t"]) + dt
		_hold_pose(i, def)
		if not hold or float(ch["t"]) >= length:
			snipe_power = minf(1.0, float(ch["t"]) / float(T["swap"]["snipe"]["full"]))
			var to := Vector2(ch["tx"], ch["ty"])
			_end_channel(false)
			_deliver(i, h.world, to, 1.0, true)
			snipe_power = 0.0
		return
	var tick: float = float(def.get("tick", 0.25)) / float(r["pace"])
	# (ABILITIES: MANA: it goes on while he has the mana for it, paid as it goes: game.ts updateChannel)
	var by_m: bool = float(r["mana"]) > 0.0
	if int(ch["bites"]) > 0 and (not hold or (h.mana <= 0.0 if by_m else float(ch["t"]) >= length - 1e-6)):
		_end_channel(true)
		return
	if hold:
		var at := _aim(float(def["range"]), "", i)
		ch["tx"] = at.x
		ch["ty"] = at.y
	_face(Vector2(ch["tx"], ch["ty"]))
	if float(ch["next"]) <= 1e-9:
		# (what the words behind it leave, it leaves as it begins and now and then as it goes on)
		var leaves: bool = float(ch["t"]) >= float(ch["wake"]) - 1e-9
		if leaves:
			ch["wake"] = float(ch["wake"]) + float(T["tune"]["channelWake"])
		_channel_bite(i, h.world, h.face, 1.0, false, leaves, int(ch["bites"]) == 0)
		ch["next"] = float(ch["next"]) + tick
		ch["bites"] = int(ch["bites"]) + 1
	ch["t"] = float(ch["t"]) + dt
	ch["next"] = float(ch["next"]) - dt
	if by_m and length > 0.0:
		h.mana = maxf(0.0, h.mana - float(r["mana"]) / length * dt)
	_hold_pose(i, def)


## (the picture: he holds the pose of the blow for as long as it goes on)
func _hold_pose(i: int, def: Dictionary) -> void:
	if attack.is_empty() or int(attack["skill"]) != i:
		attack = {"skill": i, "age": 0.0, "wind": 0.0, "t": 0.0, "second": false}
	attack["t"] = maxf(float(attack["t"]), float(def["follow"]))
	attack["age"] = float(attack["wind"]) + CHANNEL_POSE


## (game.ts endChannel) It is over. Its wait begins: all of it after a whole length, less after a shorter one (never less than
## TUNE.channelMinCool of it). "of Echoes": a phantom carries it on a moment from where it stopped, weaker (`echoes`: not when it
## was cut off by something else).
func _end_channel(echoes: bool) -> void:
	var ch := channel
	if ch.is_empty():
		return
	channel = {}
	var i: int = ch["skill"]
	var def := _def(i)
	var r: Dictionary = h.loadout.r(i)
	var length: float = float(def.get("channel", 0.0)) * float(r["last"])
	var part: float = clampf(float(ch["t"]) / length, 0.0, 1.0) if length > 0.0 else 1.0
	if charges[i] > 0:
		charges[i] -= 1
	# (when mana is the limit the wait is only a moment, whatever the length)
	cd[i] = float(r["cooldown"]) if float(r["mana"]) > 0.0 else float(r["cooldown"]) * maxf(float(T["tune"]["channelMinCool"]), part)
	full[i] = maxf(0.01, cd[i])
	if not attack.is_empty():
		attack["t"] = float(def["follow"])
	let_go_t = 0.0
	_say({"t": "channelEnd", "kind": def["kind"], "x": h.world.x, "y": h.world.y, "el": r["element"], "part": part})
	if echoes and float(r["echo"]) > 0.0 and int(ch["bites"]) > 0:
		var o: Vector2 = h.world
		var way: Vector2 = h.face
		var id: String = h.loadout.id(i)
		var delay: float = Words.data()["echo"]["delay"]
		h._tell({"t": "echo", "x": o.x, "y": o.y, "dx": way.x, "dy": way.y, "kind": def["kind"], "delay": delay})
		_after(delay, func() -> void: h._cast(i, str(def["kind"]), o, way, true))
		for k in int(Words.data()["echo"]["bites"]):
			_after(delay + k * float(def.get("tick", 0.25)), func() -> void:
				if h.loadout.id(i) == id:
					_channel_bite(i, o, way, float(h.loadout.r(i)["echo"]), true, false, k == 0))


## (his own: game.ts channelBite) One bite of the move being held, from `from` the way `way`.
func _channel_bite(_i: int, _from: Vector2, _way: Vector2, _frac: float, _echo: bool, _leaves: bool, _first: bool) -> void:
	pass


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
	# (ABILITIES: MANA: the evasive move costs its mana too: game.ts useEvasive, noMana)
	if h.mana < float(h.loadout.r(2)["mana"]):
		h.no_mana()
		return false
	h.mana -= float(h.loadout.r(2)["mana"])
	charges[2] -= 1
	h.uses[2] += 1
	if cd[2] <= 0.0:
		cd[2] = float(h.loadout.r(2)["cooldown"])
		full[2] = maxf(0.01, cd[2])
	if not windup.is_empty() and int(windup["skill"]) == 0:
		swing_t = 0.0
	# (one being held ends here, and its wait begins)
	if not channel.is_empty():
		_end_channel(true)
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


## (game.ts isOpen) Whether there is open floor at `p`.
func _open(p: Vector2) -> bool:
	return h.map != null and h.map.open_at(floori(p.x), floori(p.y))


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
				# (THE RANGER'S TREE REMADE: Ricochet, his arrow bounces off the wall once, and flies on)
				if p.get("look", "") == "arrow" and not p.get("bounced", false) and h.has("piercing"):
					p["bounced"] = true
					var bx: bool = not h._clear(n.x, float(p["y"]))
					var by: bool = not h._clear(float(p["x"]), n.y)
					var corner: bool = not bx and not by
					if bx or corner:
						p["vx"] = -float(p["vx"])
					if by or corner:
						p["vy"] = -float(p["vy"])
					v = Vector2(p["vx"], p["vy"])
					h._tell({"t": "spark", "x": p["x"], "y": p["y"], "el": p["element"], "n": 4})
					continue
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
			# (UNIQUE ITEMS: what a shot of his crosses on its way: the Hair Trigger's traps, the Tuning Staff's Orb: uniques.gd)
			if h.uniques != null and not h.uniques.worn.is_empty():
				h.uniques.crossings(p, self)
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
	var arrow: bool = p.get("look", "") == "arrow"
	if arrow:
		h.sfx.play("arrowHit", linear_to_db(0.5))
	# (THE RANGER'S TREE REMADE: Far Sight, an arrow flown past eight tiles a certain critical)
	var far: bool = arrow and float(p.get("flown", 0.0)) > float(Talents.D["tune"]["farSight2"]["at"]) and h.has("farsight")
	h.hit_monster(m, i, float(p["dmg"]), false, far)
	# (THE MAGE'S BALL: it stops on what it hits and bursts there, hurting all round it: game.ts ballBurst)
	if p.get("look", "") == "ball":
		_ball_burst(p, m)
	# (THE RANGER'S SNIPE: drawn, it knocks back what it hits, the harder the fuller the draw)
	if arrow and not m.dead and float(p.get("snipe", 0.0)) > 0.05:
		m.throw_from(m.world - Vector2(p["vx"], p["vy"]), float(T["swap"]["snipe"]["push"]) * float(p["snipe"]))
	# (Long Shot, the arrow knocks back what it hits; Split Shot, one that kills splits into three, flying on)
	if arrow and not m.dead and h.has("longshot"):
		m.throw_from(m.world - Vector2(p["vx"], p["vy"]).normalized(), float(Talents.D["tune"]["longShot2"]["far"]))
	if arrow and m.dead and not p.get("split", false) and h.has("splitshot"):
		_split_arrow(p, m)
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
			splashing = true
			h.hit_monster(o, i, float(p["dmg"]) * float(r["splash_dmg"]), true)
			splashing = false
		h._break_props(i, at, rad)
	# (what the words behind it leave, once: the rune, the cloud, the ground)
	if not p.get("left", false):
		p["left"] = true
		h._wake(i, at, 1.0, float(p["dmg"]))
	h.city.pull_in(i, at, float(r["splash"]) * float(r["size"]) if float(r["splash"]) > 0.0 else 0.0, true)
	h._tell({"t": "spark", "x": at.x, "y": at.y, "el": r["element"], "n": 6})


## (THE MAGE'S BALL, game.ts ballBurst) Its burst where it struck `m`: the others round it take a share of the hit.
func _ball_burst(p: Dictionary, m) -> void:
	var i: int = p["skill"]
	var r: Dictionary = h.loadout.r(i)
	var B: Dictionary = T["swap"]["ball"]
	var rad: float = float(B["r"]) * float(r["size"])
	_say(h._vast_edge(r, rad, {"t": "burst", "x": m.world.x, "y": m.world.y, "r": rad, "el": r["element"], "style": "blast", "words": p["words"], "comet": true}))
	h.sfx.play("frost" if r["element"] == "frost" else "explode", linear_to_db(0.55))
	if h.monsters != null:
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead or o == m or o.world.distance_to(m.world) > rad + o.r or h.monsters.shut_in(o):
				continue
			h.hit_monster(o, i, float(p["dmg"]) * float(B["share"]), true)
	h._break_props(i, m.world, rad)


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


## (figure.ts heldFrame) The frame of a held clip `t` seconds into it: round and round from its loop.
static func held_frame(c: Dictionary, t: float) -> int:
	var n: int = c["n"]
	var from := clampi(roundi(float(c["loop"] if c.get("loop") != null else 0.0) * float(c["fps"])), 0, n - 1)
	var i := floori(maxf(0.0, t) * float(c["fps"]) + 1e-6)
	if i < from:
		return mini(i, n - 1)
	return from + (i - from) % maxi(1, n - 1 - from)


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
	# (A MOVE HELD, figure.ts: its beginning while it winds up, held round and round while it goes on, let go after; where his
	# pictures have them)
	if not channel.is_empty() and L.has("41"):
		return [41, held_frame(L["41"], float(channel["t"]))]
	if let_go_t >= 0.0 and not attack.is_empty() and L.has("43"):
		var c: Dictionary = L["43"]
		if let_go_t < (int(c["n"]) - 1) / float(c["fps"]):
			return [43, clampi(floori(let_go_t * float(c["fps"]) + 1e-6), 0, int(c["n"]) - 1)]
	if not windup.is_empty() and float(_def(int(windup["skill"])).get("channel", 0.0)) > 0.0 and L.has("42") and not attack.is_empty():
		return [42, mini(int(L["42"]["n"]) - 1, attack_frame(L["42"], float(attack["age"]), float(attack["wind"])))]
	if not attack.is_empty():
		var s: int = attack["skill"]
		# (THE MAGE'S AND THE RANGER'S MOVES TO LEARN: a move with pictures of its own is those, standing or walking: figure.ts,
		# clips.moves; the bake's 129 to 132)
		var mine: int = {"snare": 129, "rally": 130, "ball": 131, "spear": 132}.get(h.loadout.id(s), -1)
		if mine > 0 and L.has(str(mine)):
			return [mine, mini(int(L[str(mine)]["n"]) - 1, attack_frame(L[str(mine)], float(attack["age"]), float(attack["wind"])))]
		# (a combo's second swing: its own pictures, made walking too: figure.ts attackSkill 2, clips.attack2, attack2Walk)
		var second: bool = attack.get("second", false) and L.has("19")
		var list := (19 if second else 14) if s == 0 else 20
		if way >= 0:
			list = ((125 if second else 15) if s == 0 else 35) + way
		var c = L.get(str(list))
		if c == null:
			list = (19 if second else 14) if s == 0 else 20
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
	channel = {}
	shots.clear()
	_later.clear()
	windup = {}
	attack = {}
	queued = {}
	move = {}
	swing_step = {}
	_clear_own()


# --- THE RANGER'S TREE, on any hero's arrows (game.ts splitArrow) ---


## (Split Shot) An arrow that killed `m` splits into three where it fell, flying on in a fan; they split no more.
func _split_arrow(p: Dictionary, m) -> void:
	var S: Dictionary = Talents.D["tune"]["splitShot2"]
	var base := atan2(float(p["vy"]), float(p["vx"]))
	var sp := Vector2(p["vx"], p["vy"]).length()
	var n: int = S["n"]
	for k in n:
		var a := base + (k - (n - 1) / 2.0) * float(S["fan"])
		var u := Vector2(cos(a), sin(a))
		var at: Vector2 = m.world + u * (m.r + 0.15)
		shots.append({"x": at.x, "y": at.y, "vx": u.x * sp, "vy": u.y * sp, "r": p["r"], "dist": float(S["far"]), "dmg": p["dmg"], "element": p["element"],
			"pierce": false, "hit": [m], "volley": true, "skill": p["skill"], "trail": 0.0, "words": p["words"], "age": 0.0, "n": 0,
			"flown": float(p.get("flown", 0.0)), "look": "arrow", "split": true, "mighted": true, "left": true})
