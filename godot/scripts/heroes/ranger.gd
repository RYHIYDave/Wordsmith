## THE RANGER (game/defs.ts CLASSES.ranger: "Fast, sharp and far away."; Dexterity his own), his three moves as the game makes them
## (game.ts useBasic, useSkill, begin, release, deliver, useEvasive, updateProjectiles, projectileHit, endProjectile, updateVolleys,
## volleySpot, updateTraps, layTrap; defs.ts SKILLS shot, volley, trap; TUNE), his words in them as for every hero (hero.gd's own:
## hit_monster, _blast, _wake, _landed_on, _boons, _cast), and his pictures through them as render/figure.ts picks them:
##   SHOT (left button held, or tapped): an arrow loosed at where he aims, 16 tiles a second, 11 tiles at most, one enemy hit (a
##     Twin pair fans a little, an enemy taking only one of them); again every 1 / his attack rate, the wind-up two fifths of that
##     at most. Pressed at an enemy, he follows it through the wind-up and looses where it will be (TRACK_AIM).
##   VOLLEY (right button; 5 s, 14 mana's worth): the arrows go up from the bow, and 0.45 s later come down round where he aimed
##     (as near there as he can see, 9 tiles at most), ten a second for 2.4 s, each hurting what stands within 0.8 of where it lands,
##     every part of the patch in its turn (a sunflower's seeds taken out of order); what the words behind leave, left as the first
##     lands.
##   TRAP (Space; 3 s, two charges): a quick roll, 3.4 tiles along the floor (over a ledge or a pit to where he can stand), nothing
##     reaching him; a trap left where it began (Twin, another where it ends; "of Echoes", a weaker one a moment later), armed in
##     0.12 s, bursting 2 tiles round when an enemy comes within 1.2 of it; three lie at most, the oldest going.
## He walks through his attacks, slowed to 40% for 0.18 s as each begins.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const Words := preload("res://scripts/words.gd")

var h  # hero.gd
var C := {}  # assets/heroes/clips.json: his pictures' times; T the moves' numbers
var T := {}
var walked_way := Vector2.ZERO

# (the game's Hero for his moves: swingT, windup, attackSkill/Age/Wind/T, queued, each move's charges and cooldown, his roll)
var swing_t := 0.0
var windup := {}
var attack := {}
var queued := {}
var cd := [0.0, 0.0, 0.0]
var full := [0.01, 0.01, 0.01]
var charges := [1, 1, 2]
var max_charges := [1, 1, 2]
var move := {}
# (what he has sent and laid: his arrows in flight, his volleys coming down, his traps)
var shots: Array = []
var volleys: Array = []
var traps: Array = []
var look  # heroes/ranger_look.gd, in the place he is in
var _clock := 0.0
var _anim_t := 0.0
var _walked := 0.0
var _was_walking := false


func _init(hero) -> void:
	h = hero
	var all: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/clips.json"))
	C = all["ranger"]
	T = {"tune": all["tune"]}
	for k in ["rangerArrow", "volleySeen", "trackAim", "palette", "ramps", "crackle"]:
		T[k] = all[k]


func _def(i: int) -> Dictionary:
	return Words.data()["skills"][Words.data()["classes"]["ranger"]["moves"][i]]


# =====================================================================================================================
# EACH STEP (game.ts updateHero: his waits run down; his roll; a dodge asked for; the wind-up running out; the hold; the tap)

## A step of him; true while what he does is all he does (his roll).
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
	# (his waits come round: a charge back as each runs out, the next begun if he lacks more: game.ts updateHero)
	var pace: float = h.cd_pace()
	for i in 3:
		if charges[i] < max_charges[i]:
			cd[i] -= dt * pace
			if cd[i] <= 0.0:
				charges[i] += 1
				cd[i] = float(h.loadout.r(i)["cooldown"]) if charges[i] < max_charges[i] else 0.0
	_step_shots(dt)
	_step_volleys(dt)
	_step_traps(dt)
	if not move.is_empty():
		_roll_step(dt)
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
		var at := _aim(float(_def(1)["range"]), true)
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
			_use_basic(_aim(float(_def(0)["range"]), false))
	return false


## How his walk is slowed now: an attack slows him for a moment from when it is begun (game.ts updateHero).
func walk_slow() -> float:
	if not attack.is_empty() and float(attack["age"]) < float(T["tune"]["attackSlowTime"]):
		return float(T["tune"]["attackSlow"])
	return 1.0


## Whether he turns the way he walks: not while he looses or winds up (he faces his mark).
func turns_to_walk() -> bool:
	return attack.is_empty() and windup.is_empty()


## Where he aims: where the pointer is while a button is held, else the nearest enemy awake within `reach`, else before him.
func _aim(reach: float, volley: bool) -> Vector2:
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		return Iso.to_world(h.get_global_mouse_position())
	if h.monsters != null:
		var m = h.monsters.nearest(h.world, reach)
		if m != null:
			# (game/lock.ts aimFor: a volley put where the monster is going, that it walks into the rain)
			if volley and m.state != "sleep" and m.speed > 0.0:
				var d: float = h.world.distance_to(m.world)
				if d > 0.01:
					return m.world + (h.world - m.world) / d * minf(d, m.speed * float(T["tune"]["volleyLead"]))
			return m.world
	return h.world + h.face * 3.0


## What the fight tells (fx.gd event), and his own look of it (ranger_look.gd).
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
	var def := _def(i)
	attack = {"skill": i, "age": 0.0, "wind": wind, "t": wind + float(def["follow"])}
	_anim_t = 0.0
	windup = {"skill": i, "tx": at.x, "ty": at.y, "t": wind}
	# (the bow drawn for a shot or a volley)
	if wind > 0.05:
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
	if i == 0:
		h.uses[0] += 1
		h.sfx.play("shot", linear_to_db(0.8))
		# (TRACK_AIM: pressed at an enemy, he turns to where it is as it goes)
		var m = w.get("tid")
		if m != null and is_instance_valid(m) and not m.dead:
			_face(m.world)
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


## (game.ts deliver) The attack lands: the arrows leave, the volley goes up.
func _deliver(i: int, from: Vector2, to: Vector2, frac: float, primary: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var way := to - from
	way = way / way.length() if way.length() >= 0.01 else h.face
	var each: float = frac * float(r["count_dmg"])
	var words: Array = h.loadout.wfronts(i)
	var echo := not primary
	h._cast(i, str(def["kind"]), from, way, echo)
	if primary:
		h._time_word_sound(i)
	if def["kind"] == "projectile":
		var base := atan2(way.y, way.x)
		# (the shots of one use keep one list of who they have hit between them: an enemy before the bow takes one of a Twin pair)
		var hit: Array = []
		var n: int = r["count"]
		for k in n:
			var a := base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 0.16)
			var u := Vector2(cos(a), sin(a))
			shots.append({"x": from.x + u.x * 0.4, "y": from.y + u.y * 0.4, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
				"r": minf(0.6, float(def["radius"]) * float(r["size"]) * (1.5 if float(r["splash"]) >= 1.5 else 1.0)), "dist": float(def["range"]),
				"dmg": each, "element": r["element"], "pierce": bool(r["pierce"]), "hit": hit, "volley": n > 1, "skill": i, "trail": 0.0,
				"words": words, "age": 0.0, "n": k, "flown": 0.0})
	elif def["kind"] == "volley":
		# (up from the bow, and a moment later coming down round where it was aimed: as near there as he can see, within reach)
		var p := _reach_point(to, float(def["range"]))
		var rad: float = float(def["radius"]) * float(r["size"])
		h.sfx.play("volley", linear_to_db(0.5 if echo else 0.9))
		_say({"t": "volleyUp", "x": from.x, "y": from.y, "tx": p.x, "ty": p.y, "r": rad, "el": r["element"], "words": words, "echo": echo})
		volleys.append({"x": p.x, "y": p.y, "r": rad, "t": -float(T["tune"]["volleyDelay"]), "n": 0,
			"total": maxi(1, roundi(float(T["tune"]["volleyLife"]) / float(T["tune"]["volleyEvery"]))), "told": 0, "next": 0.0,
			"skill": i, "frac": each, "count": r["count"], "element": r["element"], "echo": echo, "wake": primary})
	# ("of Echoes": the move made again a moment later, weaker, from where it was made)
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, str(def["kind"]), from, way, again)


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
# THE TRAP: his roll and what it leaves (game.ts useEvasive, the roll; layTrap)

func _use_evasive(at: Vector2, way: Vector2) -> void:
	if charges[2] < 1:
		return
	var def := _def(2)
	# (with no clear target, the way he goes or faces: a dodge asked for never fizzles)
	if at.distance_to(h.world) < 0.9:
		var dir: Vector2 = way if way != Vector2.ZERO else h.face
		at = h.world + dir.normalized() * float(def["range"])
	charges[2] -= 1
	h.uses[2] += 1
	if cd[2] <= 0.0:
		cd[2] = float(h.loadout.r(2)["cooldown"])
		full[2] = maxf(0.01, cd[2])
	# (an attack being made is broken off, and costs nothing, not even its turn)
	if not windup.is_empty() and int(windup["skill"]) == 0:
		swing_t = 0.0
	windup = {}
	queued = {}
	attack = {}
	_face(at)
	h.sfx.play("dodge", -4.0)
	var r: Dictionary = h.loadout.r(2)
	var x0: Vector2 = h.world
	var dir: Vector2 = (at - h.world).normalized()
	h._cast(2, "roll", x0, dir)
	h._boons(2)
	h._time_word_sound(2)
	h.last.dodge_surge(x0)
	# (along the floor, stopping at the first thing in the way)
	var end := x0
	var go := 0.0
	while go < float(def["range"]):
		var n: Vector2 = end + dir * 0.15
		if not h._clear(n.x, n.y):
			break
		end = n
		go += 0.15
	move = {"from": x0, "to": end, "t": 0.0, "dur": 0.24}
	# (nothing reaches him while he rolls: game.ts, h.move)
	h._act = "lunge"
	h._invuln = maxf(h._invuln, 0.06)
	# (his trap where the roll began; Twin, a second where it ends; "of Echoes", a weaker one a moment later)
	_lay_trap(2, x0, float(r["count_dmg"]))
	if int(r["count"]) > 1 and end.distance_to(x0) > 1.0:
		_lay_trap(2, end, float(r["count_dmg"]))
	if float(r["echo"]) > 0.0:
		var again := func() -> void: _lay_trap(2, x0, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]))
		h._echo_of(2, "roll", x0, dir, again)


func _roll_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
	h._invuln = maxf(h._invuln, 0.06)
	var k := clampf(float(move["t"]) / float(move["dur"]), 0.0, 1.0)
	h.world = (move["from"] as Vector2).lerp(move["to"], k)
	if k >= 1.0:
		move = {}
		h._act = ""
		_anim_t = 0.0


func _lay_trap(i: int, at: Vector2, frac: float) -> void:
	var r: Dictionary = h.loadout.r(i)
	traps.append({"x": at.x, "y": at.y, "arm": float(T["tune"]["trapArm"]), "life": float(T["tune"]["trapLife"]), "skill": i, "frac": frac, "element": r["element"]})
	while traps.size() > int(T["tune"]["trapMax"]) * int(r["count"]):
		traps.pop_front()
	h.sfx.play("trapSet")
	_say({"t": "trapSet", "x": at.x, "y": at.y, "el": r["element"]})


func _step_traps(dt: float) -> void:
	if h.monsters == null:
		return
	for i in range(traps.size() - 1, -1, -1):
		var t: Dictionary = traps[i]
		t["life"] = float(t["life"]) - dt
		if float(t["arm"]) > 0.0:
			t["arm"] = float(t["arm"]) - dt
		var go := false
		if float(t["arm"]) <= 0.0:
			var at := Vector2(t["x"], t["y"])
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(T["tune"]["trapTrigger"]) + m.r:
					go = true
					break
		if go:
			traps.remove_at(i)
			h.sfx.play("trapBoom")
			h.kick(2.0)
			var rad: float = float(_def(int(t["skill"]))["radius"]) * float(h.loadout.r(int(t["skill"]))["size"])
			h._blast(int(t["skill"]), Vector2(t["x"], t["y"]), rad, float(t["frac"]), "blast", true, -4.0)
		elif float(t["life"]) <= 0.0:
			traps.remove_at(i)


# =====================================================================================================================
# HIS ARROWS IN FLIGHT (game.ts updateProjectiles, projectileHit, endProjectile)

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
	h.sfx.play("arrowHit", linear_to_db(0.5))
	h.hit_monster(m, i, float(p["dmg"]), false)
	# (an arrow that goes through several is still one blow)
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
			# (one of a volley of arrows: what another of them has hurt is left alone)
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
# HIS VOLLEYS COMING DOWN (game.ts volleySpot, updateVolleys)

func _volley_spot(v: Dictionary, n: int, c: int) -> Vector2:
	var total: int = v["total"]
	var stp := 1
	for q in [5, 7, 11, 13]:
		if total % q != 0:
			stp = q
			break
	var far: float = float(v["r"]) * sqrt((float((n * stp) % total) + 0.5) / total)
	var a := n * 2.39996 + c * PI
	return Vector2(float(v["x"]) + cos(a) * far, float(v["y"]) + sin(a) * far)


func _step_volleys(dt: float) -> void:
	for k in range(volleys.size() - 1, -1, -1):
		var v: Dictionary = volleys[k]
		v["t"] = float(v["t"]) + dt
		var i: int = v["skill"]
		var r: Dictionary = h.loadout.r(i)
		var words: Array = h.loadout.wfronts(i)
		var reach: float = float(T["tune"]["volleyHit"]) * float(r["size"])
		var every: float = T["tune"]["volleyEvery"]
		# (each arrow told a moment ahead, so that it is seen coming down before it lands)
		while int(v["told"]) < int(v["total"]) and float(v["t"]) >= int(v["told"]) * every - float(T["volleySeen"]):
			for c in int(v["count"]):
				var at := _volley_spot(v, int(v["told"]), c)
				_say({"t": "volleyDrop", "x": at.x, "y": at.y, "el": v["element"], "words": words, "n": c, "echo": v["echo"], "in": maxf(0.0, int(v["told"]) * every - float(v["t"]))})
			v["told"] = int(v["told"]) + 1
		while int(v["n"]) < int(v["total"]) and float(v["t"]) >= float(v["next"]) - 1e-9:
			if bool(v["wake"]):
				# (what the words behind it leave, it leaves once, as the first arrow lands)
				v["wake"] = false
				h._wake(i, Vector2(v["x"], v["y"]), float(v["r"]), float(v["frac"]))
			for c in int(v["count"]):
				var at := _volley_spot(v, int(v["n"]), c)
				var hits := 0
				if h.monsters != null:
					for m in h.monsters.list:
						if not is_instance_valid(m) or m.dead or m.state == "rise":
							continue
						if m.world.distance_to(at) > reach + m.r or h.monsters.shut_in(m):
							continue
						h.hit_monster(m, i, float(v["frac"]), hits >= 3)
						hits += 1
				if hits > 0:
					h._landed_on(i)
					if float(r["pull"]) > 0.0:
						h.city.pull_in(i, at, reach, false)
				h._break_props(i, at, reach * 0.6)
				_say({"t": "volleyFall", "x": at.x, "y": at.y, "el": v["element"], "words": words, "n": c, "echo": v["echo"], "hits": hits})
				# (ten arrows a second: the ones that hit are heard, and every other one that does not)
				if hits > 0:
					h.sfx.play("hit", linear_to_db(0.45))
				elif c == 0 and int(v["n"]) % 2 == 0:
					h.sfx.play("arrowLand", linear_to_db(0.3))
			v["n"] = int(v["n"]) + 1
			v["next"] = float(v["next"]) + every
		if int(v["n"]) >= int(v["total"]):
			h._tell({"t": "volleyEnd", "x": v["x"], "y": v["y"], "el": v["element"]})
			volleys.remove_at(k)


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


## [list, frame] he is seen in now (hero.gd _show), [] for its own choice.
func picture(side: int) -> Array:
	var L: Dictionary = C["lists"]
	if not move.is_empty():
		var n: int = h.art.count(side, 40)
		return [40, mini(n - 1, floori(float(move["t"]) / float(move["dur"]) * n))]
	var way := _way_of()
	if not attack.is_empty():
		var s: int = attack["skill"]
		var list := 14 if s == 0 else 20
		if way >= 0:
			list = (15 if s == 0 else 35) + way
		var c = L.get(str(list))
		if c == null:
			c = L.get(str(14 if s == 0 else 20))
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


## How soon each of his moves is ready again, 0 to 1, by its place (the HUD: "whirl" the hold, "lunge" the dodge).
func readiness() -> Dictionary:
	var k := func(i: int) -> float: return 1.0 if charges[i] >= 1 else 1.0 - cd[i] / maxf(0.01, full[i])
	return {"whirl": k.call(1), "lunge": k.call(2), "charges": charges[2]}


## A new place: what he sent and laid is gone with the old one.
func clear() -> void:
	shots.clear()
	volleys.clear()
	traps.clear()
	windup = {}
	attack = {}
	queued = {}
	move = {}
