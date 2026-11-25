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
extends "res://scripts/heroes/kit.gd"

# (what he has laid and sent up: his volleys coming down, his traps)
var volleys: Array = []
var traps: Array = []
var _next_volley := 0


func _init(hero) -> void:
	super(hero, "ranger")
	# (THE RANGER'S TREE: Light Step, his roll holds three charges)
	if h.has("lightstep") and not h.by_mana():
		max_charges[2] = int(Talents.D["tune"]["lightStep"]["charges"])
		charges[2] = max_charges[2]


## (his tree, on a change of his talents: Light Step's charges, three; two without)
func talents_changed() -> void:
	# (the roll's charges are a thing of cooldowns: when mana is the limit, one: game.ts refresh)
	var most: int = 1 if h.by_mana() else (int(Talents.D["tune"]["lightStep"]["charges"]) if h.has("lightstep") else 2)
	if most != max_charges[2]:
		max_charges[2] = most
		charges[2] = mini(charges[2], most)


## (Steady Aim: how long he has stood still; Quick Draw: his arrows loosed)
var still_t := 0.0
var _draws := 0
var quick_n := 0
var _was := Vector2.INF


## (THE RALLY: its seconds left)
var rally_t := 0.0


## (THE RALLY, game.ts rallyNow) While it lasts: its seconds left, and since he called; {} after.
func rally_now() -> Dictionary:
	return {"left": rally_t, "since": float(T["swap"]["rally"]["secs"]) - rally_t} if rally_t > 0.0 else {}


## (THE SNIPE, game.ts snipeDraw) While he draws it: where he aims, how full the draw (0 to 1), how long he has held it, and how
## long since it came full (less than 0, not yet); {} while he is not drawing.
func snipe_draw() -> Dictionary:
	if channel.is_empty() or h.loadout.id(int(channel["skill"])) != "snipe":
		return {}
	var full: float = T["swap"]["snipe"]["full"]
	return {"tx": channel["tx"], "ty": channel["ty"], "power": minf(1.0, float(channel["t"]) / full), "held": channel["t"], "since_full": float(channel["t"]) - full}


func _step_own(dt: float) -> void:
	if rally_t > 0.0:
		rally_t = maxf(0.0, rally_t - dt)
	# (Steady Aim: how long he has stood still, not moving nor rolling: game.ts stillT)
	still_t = 0.0 if (_was != Vector2.INF and h.world.distance_to(_was) > 0.001) or not move.is_empty() else still_t + dt
	_was = h.world
	_step_volleys(dt)
	_step_traps(dt)


## A kill of his (game.ts talentKill): Windrunner, a roll back.
func on_kill(_m) -> void:
	if h.has("windrunner") and charges[2] < max_charges[2]:
		charges[2] += 1
		cd[2] = float(h.loadout.r(2)["cooldown"]) if charges[2] < max_charges[2] else 0.0


# =====================================================================================================================
# WHAT HIS MOVES SEND (game.ts deliver)

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
		# (THE RANGER'S TREE REMADE: Steady Aim, a second stood still and the next arrow goes through every enemy in its line)
		var steady: bool = primary and h.has("steadyaim") and still_t >= float(Talents.D["tune"]["steadyAim2"]["still"])
		if steady:
			still_t = 0.0
		# (UNIQUE ITEMS: the Fan, each Shot three arrows in a fan, each a little weaker; one enemy takes only one of them)
		var fanned: bool = primary and h.loadout.id(i) == "shot" and h.uniques != null and h.uniques.wears("fan")
		var fans: Array = [0.0]
		var share := 1.0
		if fanned:
			var F: Dictionary = h.uniques.ut["fan"]
			fans = []
			for q in int(F["arrows"]):
				fans.append((q - (int(F["arrows"]) - 1) / 2.0) * float(F["spread"]))
			share = float(F["share"])
		var loose := func(at: Vector2, hit: Array) -> void:
			var n: int = r["count"]
			for k in n:
				for f in fans:
					var a := base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 0.16) + float(f)
					var u := Vector2(cos(a), sin(a))
					shots.append({"x": at.x + u.x * 0.4, "y": at.y + u.y * 0.4, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
						"r": minf(0.6, float(def["radius"]) * float(r["size"]) * (1.5 if float(r["splash"]) >= 1.5 else 1.0)), "dist": float(def["range"]),
						"dmg": each * share, "element": r["element"], "pierce": bool(r["pierce"]) or steady, "hit": hit, "volley": n > 1 or fanned, "skill": i, "trail": 0.0,
						"words": words, "age": 0.0, "n": k, "flown": 0.0, "look": "arrow"})
		# (the shots of one use keep one list of who they have hit between them: an enemy before the bow takes one of a Twin pair)
		loose.call(from, [])
		# (THE RANGER'S TREE REMADE: Quick Draw, every fifth arrow fires twice: the second a moment after, from where he is then)
		if primary and h.has("quickdraw"):
			_draws += 1
			var Q: Dictionary = Talents.D["tune"]["quickDraw2"]
			if _draws % int(Q["every"]) == 0:
				_after(float(Q["gap"]), func() -> void:
					if h.alive and h.loadout.id(i) == "shot":
						quick_n += 1
						loose.call(h.world, []))
	elif def["kind"] == "snare":
		# (HIS MOVES TO LEARN, game/swap_moves.ts: THE SNARE, thrown where he aimed, no further than its reach; what walks in is held,
		# then it bursts; a few lie at once, one more taking the place of the oldest)
		if primary:
			var p := _reach_point(to, float(def["range"]))
			traps.append({"x": p.x, "y": p.y, "arm": float(T["tune"]["trapArm"]), "life": float(T["swap"]["snare"]["life"]), "skill": i, "frac": each,
				"element": r["element"], "snare": true, "from": h.world, "born": _clock})
			while traps.filter(func(q): return q.get("snare", false)).size() > int(T["swap"]["snare"]["max"]):
				for k in traps.size():
					if traps[k].get("snare", false):
						traps.remove_at(k)
						break
			h.sfx.play("trapSet")
	elif def["kind"] == "snipe":
		# (THE SNIPE: one arrow, through everything in its line, the harder, wider and faster the longer he drew, knocking back what
		# it hits)
		var S: Dictionary = T["swap"]["snipe"]
		var k: float = snipe_power
		var a := atan2(way.y, way.x)
		var sp: float = float(r["proj_speed"]) * (1.0 + float(S["fast"]) * k)
		var u := Vector2(cos(a), sin(a))
		shots.append({"x": from.x + u.x * 0.4, "y": from.y + u.y * 0.4, "vx": u.x * sp, "vy": u.y * sp, "r": float(def["radius"]) * float(r["size"]) * (1.0 + float(S["wide"]) * k),
			"dist": float(def["range"]), "dmg": each * (float(S["least"]) + (float(S["most"]) - float(S["least"])) * k), "element": r["element"], "pierce": true,
			"hit": [], "volley": false, "skill": i, "trail": 0.0, "words": words, "age": 0.0, "n": 0, "flown": 0.0, "look": "arrow", "snipe": k})
		h.sfx.play("shot", linear_to_db(0.9))
		if k >= 1.0:
			h.sfx.play("power", linear_to_db(0.6))
	elif def["kind"] == "rally":
		# (THE RALLY: his companions near him attack faster and harder for a few seconds)
		if primary:
			rally_t = float(T["swap"]["rally"]["secs"])
			h.sfx.play("equip", linear_to_db(0.9))
			h._tell({"t": "spark", "x": h.world.x, "y": h.world.y, "el": "phys", "n": 12})
	elif def["kind"] == "volley":
		# (up from the bow, and a moment later coming down round where it was aimed: as near there as he can see, within reach)
		# (UNIQUE ITEMS: Rainwalker, Volley rains round him and goes with him)
		var walker: bool = h.uniques != null and h.uniques.wears("rainwalker")
		var p: Vector2 = h.world if walker else _reach_point(to, float(def["range"]))
		var rad: float = float(def["radius"]) * float(r["size"])
		h.sfx.play("volley", linear_to_db(0.5 if echo else 0.9))
		_say({"t": "volleyUp", "x": from.x, "y": from.y, "tx": p.x, "ty": p.y, "r": rad, "el": r["element"], "words": words, "echo": echo})
		_next_volley += 1
		var vl := {"id": _next_volley, "x": p.x, "y": p.y, "r": rad, "t": -float(T["tune"]["volleyDelay"]), "n": 0,
			"total": maxi(1, roundi(float(T["tune"]["volleyLife"]) / float(T["tune"]["volleyEvery"]))), "told": 0, "next": 0.0,
			"skill": i, "frac": each, "count": r["count"], "element": r["element"], "echo": echo, "wake": primary, "walker": walker, "at": {}}
		# (THE RANGER'S TREE REMADE: Hail, the rain follows the enemy it was aimed at; not the Rainwalker's, which goes with him)
		if h.has("hail") and h.monsters != null and not walker:
			var bd: float = Talents.D["tune"]["hail2"]["pick"]
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and not h.monsters.shut_in(m) and m.world.distance_to(p) < bd:
					bd = m.world.distance_to(p)
					vl["follow"] = m
		volleys.append(vl)
	# ("of Echoes": the move made again a moment later, weaker, from where it was made)
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, str(def["kind"]), from, way, again)


# =====================================================================================================================
# THE TRAP: his roll and what it leaves (game.ts useEvasive, the roll; layTrap)

func _use_evasive(at: Vector2, way: Vector2) -> void:
	var def := _def(2)
	# (with no clear target, the way he goes or faces: a dodge asked for never fizzles)
	at = _evasive_at(at, way)
	if not _pay_evasive():
		return
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
	if h.move_safe():
		h._invuln = maxf(h._invuln, 0.06)
	# (his trap where the roll began; Twin, a second where it ends; "of Echoes", a weaker one a moment later)
	_lay_trap(2, x0, float(r["count_dmg"]))
	# (THE RANGER'S TREE: Minefield, two more in a fan behind where the roll began)
	if h.has("minefield"):
		var MF: Dictionary = Talents.D["tune"]["minefield"]
		for a in [-0.7, 0.7]:
			var b := x0 + Vector2(-dir.x * cos(a) - dir.y * sin(a), -dir.y * cos(a) + dir.x * sin(a)) * float(MF["spread"])
			if h._clear(b.x, b.y):
				_lay_trap(2, b, float(r["count_dmg"]))
	if int(r["count"]) > 1 and end.distance_to(x0) > 1.0:
		_lay_trap(2, end, float(r["count_dmg"]))
	if float(r["echo"]) > 0.0:
		var again := func() -> void: _lay_trap(2, x0, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]))
		h._echo_of(2, "roll", x0, dir, again)


func _move_step(dt: float) -> void:
	move["t"] = float(move["t"]) + dt
	if h.move_safe():
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
	while traps.size() > int(T["tune"]["trapMax"]) * int(r["count"]) * (int(Talents.D["tune"]["minefield"]["n"]) if h.has("minefield") else 1):
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
		# (UNIQUE ITEMS: the Hair Trigger, an arrow of his that crossed it has set it off)
		var go: bool = t.has("shot")
		if float(t["arm"]) <= 0.0 and not go:
			var at := Vector2(t["x"], t["y"])
			for m in h.monsters.list:
				if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(T["tune"]["trapTrigger"]) + m.r:
					go = true
					break
		if go and t.get("snare", false):
			# (THE SNARE: what is on it held fast, then it bursts)
			traps.remove_at(i)
			var S: Dictionary = T["swap"]["snare"]
			var rad: float = float(S["r"]) * float(h.loadout.r(int(t["skill"]))["size"])
			var sat := Vector2(t["x"], t["y"])
			h.sfx.play("trapSet")
			for m in h.monsters.list:
				if not is_instance_valid(m) or m.dead or m.world.distance_to(sat) > rad + m.r:
					continue
				# (a boss is not held, as no stun holds one (monster.gd stun_for): on it the Snare held the Headsman, the Fleshmancer and the
				# Cantor fourteen seconds of fifteen: the bug hunt's second round, 25 Nov 2026; its burst still strikes it)
				if m.boss:
					continue
				m.stun_t = maxf(m.stun_t, float(S["hold"]))
				h._tell({"t": "bind", "id": m.id, "m": m, "secs": S["hold"]})
			var sk: int = t["skill"]
			var fr: float = float(t["frac"]) * float(S["share"])
			_say({"t": "snareSprung", "x": sat.x, "y": sat.y, "r": rad, "secs": S["hold"]})
			_after(float(S["hold"]), func() -> void:
				h.sfx.play("trapBoom")
				h._blast(sk, sat, rad, fr, "blast", true, -4.0))
		elif go:
			traps.remove_at(i)
			h.sfx.play("trapBoom")
			h.kick(2.0)
			var rad: float = float(_def(int(t["skill"]))["radius"]) * float(h.loadout.r(int(t["skill"]))["size"])
			var tat := Vector2(t["x"], t["y"])
			# (THE RANGER'S TREE REMADE: Wide Traps, what is near is pulled in, and then it bursts)
			if h.has("widetraps"):
				var W: Dictionary = Talents.D["tune"]["wideTraps2"]
				for m in h.monsters.list:
					if not is_instance_valid(m) or m.dead:
						continue
					var dd: float = m.world.distance_to(tat)
					if dd > rad + float(W["reach"]) + m.r or dd <= float(W["to"]):
						continue
					m.throw_from(tat, -(dd - float(W["to"])), float(W["secs"]))
				var sk: int = t["skill"]
				var fr: float = float(t["frac"]) * float(t.get("shot", 1.0))
				_after(float(W["secs"]), func() -> void: h._blast(sk, tat, rad, fr, "blast", true, -4.0))
			else:
				h._blast(int(t["skill"]), tat, rad, float(t["frac"]) * float(t.get("shot", 1.0)), "blast", true, -4.0)
		elif float(t["life"]) <= 0.0:
			traps.remove_at(i)


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
		# (UNIQUE ITEMS: Rainwalker, the rain is where he is)
		if v.get("walker", false):
			v["x"] = h.world.x
			v["y"] = h.world.y
		# (Hail: the rain goes after the enemy it was aimed at)
		var fm = v.get("follow")
		if fm != null:
			if not is_instance_valid(fm) or fm.dead:
				v.erase("follow")
			else:
				var dd: float = fm.world.distance_to(Vector2(v["x"], v["y"]))
				var go := minf(dd, float(Talents.D["tune"]["hail2"]["speed"]) * dt)
				if dd > 0.01:
					var u: Vector2 = (fm.world - Vector2(v["x"], v["y"])) / dd
					v["x"] = float(v["x"]) + u.x * go
					v["y"] = float(v["y"]) + u.y * go
		# (each arrow told a moment ahead, so that it is seen coming down before it lands)
		while int(v["told"]) < int(v["total"]) and float(v["t"]) >= int(v["told"]) * every - float(T["volleySeen"]):
			for c in int(v["count"]):
				var at := _volley_spot(v, int(v["told"]), c)
				# (where it was told it comes down is where it comes down, the rain moving meanwhile)
				if v.get("walker", false):
					v["at"][int(v["told"]) * int(v["count"]) + c] = at
				_say({"t": "volleyDrop", "x": at.x, "y": at.y, "el": v["element"], "words": words, "n": c, "echo": v["echo"], "in": maxf(0.0, int(v["told"]) * every - float(v["t"]))})
			v["told"] = int(v["told"]) + 1
		while int(v["n"]) < int(v["total"]) and float(v["t"]) >= float(v["next"]) - 1e-9:
			if bool(v["wake"]):
				# (what the words behind it leave, it leaves once, as the first arrow lands)
				v["wake"] = false
				h._wake(i, Vector2(v["x"], v["y"]), float(v["r"]), float(v["frac"]))
			# (UNIQUE ITEMS: the Poacher's Bow, where a Volley falls it leaves one of his traps, once, as its first arrow lands)
			if not v.get("trapped", false) and not v["echo"] and h.uniques != null and h.uniques.wears("poachersbow"):
				v["trapped"] = true
				var tat := Vector2(v["x"], v["y"])
				if str(_def(2)["kind"]) == "roll" and _open(tat):
					_lay_trap(2, tat, float(h.loadout.r(2)["count_dmg"]) * float(h.uniques.ut["poacher"]["share"]))
					h.uniques._say({"id": "poachersbow", "what": "trap"})
			for c in int(v["count"]):
				var at: Vector2 = v["at"].get(int(v["n"]) * int(v["count"]) + c, _volley_spot(v, int(v["n"]), c))
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
# HIS PICTURES: his roll (render/figure.ts: the roll's own pictures, by how far through it he is)

func _own_picture(side: int) -> Array:
	if not move.is_empty():
		var n: int = h.art.count(side, 40)
		return [40, mini(n - 1, floori(float(move["t"]) / float(move["dur"]) * n))]
	return []


func _clear_own() -> void:
	volleys.clear()
	traps.clear()
	rally_t = 0.0
