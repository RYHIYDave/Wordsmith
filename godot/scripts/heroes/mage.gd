## THE MAGE (game/defs.ts CLASSES.mage: "Raw power. Handle with care."; Intelligence her own), her three moves as the game makes
## them (game.ts deliver, orbWave, updateOrbs, useEvasive's warp; defs.ts SKILLS wave, orb, warp; TUNE), on what every hero's moves
## have in common (heroes/kit.gd), her words in them as for every hero:
##   WAVE (left button held, or tapped): a swing of the staff, and a wide wave of force goes out the way she faces, 9 tiles a second,
##     6 tiles at most, a tile wide, through every enemy in its way, each hit once (a Twin pair fans apart, an enemy taking only one
##     of them); again by her attack rate.
##   ORB (right button; 5 s, 14 mana's worth): she slams the staff down, and an orb hangs where she points (as near there as she can
##     see, 6.5 tiles at most), sending out a wave of force 2.2 tiles round the moment it lands and every 1.1 s after for 4 s (its
##     waves faster or slower, out longer or shorter, by its words); two at most, a third taking the oldest's place. "Of Echoes"
##     sends one more, weaker, from the orb she set.
##   WARP (Space; 5 s): she is gone, and out again where she points (as near there as she can see, 6 tiles at most), at once, in a
##     burst 1.6 tiles round that hurts what stands there; nothing reaches her for 0.3 s. Nowhere to go (less than half a tile):
##     "No room", and nothing spent.
## Her pictures: the staff swung (the quick attack's), the staff slammed down (the slow one's), as the game plays them; the warp as
## the game draws it, her figure coming apart where she was and together where she comes out (hero.gd warp_out, phase_in).
extends "res://scripts/heroes/kit.gd"

## (her orbs: game.ts orbs, {id, x, y, t, life, next, waves, skill, frac, element})
var orbs: Array = []
var _next_id := 0


func _init(hero) -> void:
	super(hero, "mage")


func _step_own(dt: float) -> void:
	_step_orbs(dt)
	_step_tree(dt)


# =====================================================================================================================
# WHAT HER MOVES SEND (game.ts deliver: the wave, the orb)

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
	if def["kind"] == "wave":
		# (a wide front of force: it travels a short way and goes through everything it meets, each enemy hit once; a Twin pair fans
		# apart, and one enemy takes only one of them)
		var base := atan2(way.y, way.x)
		var hit: Array = []
		var n: int = r["count"]
		for k in n:
			var a := base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 2.0 * float(T["tune"]["waveFan"]))
			var u := Vector2(cos(a), sin(a))
			shots.append({"x": from.x + u.x * 0.5, "y": from.y + u.y * 0.5, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
				"r": float(def["radius"]) * float(r["size"]), "dist": float(def["range"]), "dmg": each, "element": r["element"], "look": "wave",
				"pierce": true, "hit": hit, "volley": n > 1, "skill": i, "trail": 0.0, "words": words, "age": 0.0, "n": k, "flown": 0.0})
		_say({"t": "wave", "x": from.x, "y": from.y, "dx": way.x, "dy": way.y, "w": float(def["radius"]) * float(r["size"]), "el": r["element"], "words": words, "echo": echo})
	elif def["kind"] == "orb":
		var rad: float = float(def["radius"]) * float(r["size"])
		if primary:
			# (set down where it was aimed: as near there as she can see, within its range; it sends out a wave the moment it lands; no
			# more than two at once, one more taking the place of the oldest)
			var p := _reach_point(to, float(def["range"]))
			h.sfx.play("orbSet", linear_to_db(0.9))
			var mine: Array = orbs.filter(func(o): return int(o["skill"]) == i)
			while mine.size() >= int(T["tune"]["orbMax"]):
				var old: Dictionary = mine.pop_front()
				_say({"t": "orbEnd", "x": old["x"], "y": old["y"], "el": old["element"]})
				orbs.erase(old)
			# (LASTING and FLEETING: out longer or shorter, and Fleeting's waves coming faster, as many in all)
			_next_id += 1
			orbs.append({"id": _next_id, "x": p.x, "y": p.y, "t": 0.0, "life": float(T["tune"]["orbLife"]) * float(r["last"]),
				"next": float(T["tune"]["orbEvery"]) / float(r["pace"]), "waves": 1, "skill": i, "frac": each, "element": r["element"]})
			_say({"t": "orbSet", "x": p.x, "y": p.y, "r": rad, "el": r["element"], "words": words})
			_orb_wave(i, p, rad, each, false, true)
		else:
			# ("of Echoes": the orb that was set sends one more wave, a weaker one)
			var last := {}
			for o in orbs:
				if int(o["skill"]) == i:
					last = o
			if not last.is_empty():
				_orb_wave(i, Vector2(last["x"], last["y"]), rad, each, true, false)
	elif def["kind"] == "projectile":
		# (HER MOVES TO LEARN, game/swap_moves.ts: BALL, a comet that bursts on the first enemy it hits; SPEAR, a crystal lance through
		# every enemy in its line: game.ts deliver, a projectile; one list of who they have hit between a Twin pair)
		var base := atan2(way.y, way.x)
		var hit: Array = []
		var n: int = r["count"]
		var id: String = h.loadout.id(i)
		for k in n:
			var a := base + (0.0 if n == 1 else (k - (n - 1) / 2.0) * 0.16)
			var u := Vector2(cos(a), sin(a))
			shots.append({"x": from.x + u.x * 0.4, "y": from.y + u.y * 0.4, "vx": u.x * float(r["proj_speed"]), "vy": u.y * float(r["proj_speed"]),
				"r": minf(0.6, float(def["radius"]) * float(r["size"]) * (1.5 if float(r["splash"]) >= 1.5 else 1.0)), "dist": float(def["range"]),
				"dmg": each, "element": r["element"], "pierce": bool(r["pierce"]) or id == "spear", "hit": hit, "volley": n > 1, "skill": i,
				"trail": 0.0, "words": words, "age": 0.0, "n": k, "flown": 0.0, "look": "ball" if id == "ball" else "mspear"})
	# ("of Echoes": the move made again a moment later, weaker, from where it was made)
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, str(def["kind"]), from, way, again)


## HER BEAM (game.ts channelBite, beamLine), one bite of it while it is held: a line from her to the first wall (or the end of its
## reach), and everything along it struck, the nearest first; a Twin pair side by side, one enemy taking only one of them. What it
## leaves, it leaves where it first struck (or near its far end) and along the line.
func _channel_bite(i: int, from: Vector2, way: Vector2, frac: float, echo: bool, leaves: bool, first: bool) -> void:
	var r: Dictionary = h.loadout.r(i)
	var def := _def(i)
	var each: float = frac * float(r["count_dmg"])
	var words: Array = h.loadout.wfronts(i)
	var behind: Array = h.loadout.wbehinds(i)
	var half: float = float(def["radius"]) * float(r["size"])
	var taken: Array = []
	var hits := 0
	h.sfx.play("beamHum", linear_to_db(0.3 if echo else 0.5))
	var n: int = r["count"]
	for k in n:
		var off: float = 0.0 if n == 1 else (k - (n - 1) / 2.0) * (half * 2.0 + 0.3)
		var st := Vector2(from.x - way.y * off, from.y + way.x * off)
		if off != 0.0 and not h._clear(st.x, st.y):
			st = from
		var end := _beam_end(st, way, float(def["range"]))
		var len: float = end.distance_to(st)
		var line: Array = []
		if h.monsters != null:
			for m in h.monsters.list:
				if not is_instance_valid(m) or m.dead or taken.has(m) or m.state == "rise":
					continue
				var at: float = (m.world - st).dot(way)
				if at < -m.r or at > len + m.r:
					continue
				if absf((m.world.y - st.y) * way.x - (m.world.x - st.x) * way.y) > half + m.r:
					continue
				line.append([m, at])
		line.sort_custom(func(a, b): return a[1] < b[1])
		if echo:
			_say({"t": "beam", "x0": st.x, "y0": st.y, "x1": end.x, "y1": end.y, "w": half, "el": r["element"], "words": words, "behind": behind, "n": k, "echo": true})
		else:
			_say({"t": "beamBite", "x0": st.x, "y0": st.y, "x1": end.x, "y1": end.y, "w": half, "el": r["element"], "words": words, "n": k, "hits": line.size(), "first": first})
		for q in line:
			taken.append(q[0])
			h.hit_monster(q[0], i, each, hits >= 3)
			hits += 1
		if not line.is_empty():
			h._landed_on(i)
			if float(r["pull"]) > 0.0:
				h.city.pull_in(i, line[0][0].world, 0.0, true)
		var d := 0.5
		while d < len:
			h._break_props(i, st + way * d, half + 0.25)
			d += 1.0
		if k == 0 and leaves:
			# (where it first struck, or failing that near its far end: the rune, the cloud, the cracks and the ward; ground along it)
			var far := maxf(0.0, len - 0.8)
			var w_at: Vector2 = line[0][0].world if not line.is_empty() else st + way * far
			h._wake(i, w_at, 1.0, each, false)
			if r["zone"] != null:
				var gd := 1.3
				var gn := 0
				while gn < int(T["tune"]["beamPatches"]) and gd < len:
					h.wakes.add_ground(r["zone"], i, st + way * gd, 1.0, h.avg_hit(i, each), r["meld_behind"])
					gn += 1
					gd += float(T["tune"]["beamPatchGap"])
	if hits > 0:
		h.sfx.play({"fire": "fire", "frost": "frost", "lightning": "zap"}.get(r["element"], "hit"), linear_to_db(0.6))


## (game.ts beamEnd) Where a beam from `from` the way `way` stops: the first wall, or the end of its reach.
func _beam_end(from: Vector2, way: Vector2, reach: float) -> Vector2:
	var len := 0.0
	var d := 0.2
	while d <= reach + 1e-6:
		var p := from + way * d
		if not _open(p):
			break
		len = d
		d += 0.2
	return from + way * len


## (game.ts orbWave) One wave from an orb (two, with Twin in front: the second a moment after the first). `leaves`: the wave it sends
## as it lands, which leaves what the words behind it leave.
func _orb_wave(i: int, at: Vector2, rad: float, frac: float, echo: bool, leaves: bool) -> void:
	var count: int = h.loadout.r(i)["count"]
	h.sfx.play("nova", linear_to_db(0.3 if echo else 0.5))
	for k in count:
		if k == 0:
			h._blast(i, at, rad, frac, "nova", leaves, linear_to_db(0.8), 0, echo)
		else:
			_after(0.22 * k, func() -> void: h._blast(i, at, rad, frac, "nova", false, linear_to_db(0.8), k, echo))


## (game.ts updateOrbs) Every orb that is out sends its waves, and goes when its time is up.
func _step_orbs(dt: float) -> void:
	for k in range(orbs.size() - 1, -1, -1):
		var o: Dictionary = orbs[k]
		var i: int = o["skill"]
		o["t"] = float(o["t"]) + dt
		# (its time is up a hair early, so that a wave due at that very moment is not sent after all)
		if float(o["t"]) >= float(o["life"]) - 1e-6 or str(_def(i)["kind"]) != "orb":
			_say({"t": "orbEnd", "x": o["x"], "y": o["y"], "el": o["element"]})
			orbs.remove_at(k)
			continue
		o["next"] = float(o["next"]) - dt
		if float(o["next"]) <= 0.0:
			var r: Dictionary = h.loadout.r(i)
			o["next"] = float(o["next"]) + float(T["tune"]["orbEvery"]) / float(r["pace"])
			o["waves"] = int(o["waves"]) + 1
			_orb_wave(i, Vector2(o["x"], o["y"]), float(_def(i)["radius"]) * float(r["size"]), float(o["frac"]), false, false)


# =====================================================================================================================
# THE WARP (game.ts useEvasive, kind warp)

func _use_evasive(at: Vector2, way: Vector2) -> void:
	var def := _def(2)
	at = _evasive_at(at, way)
	if charges[2] < 1:
		return
	# (ABILITIES: MANA: not without the mana for it: game.ts useEvasive, noMana)
	if h.mana < float(h.loadout.r(2)["mana"]):
		h.no_mana()
		return
	# (where she comes out: as near there as she can see; nowhere (less than half a tile), and nothing is spent)
	var land := _reach_point(at, float(def["range"]))
	if land.distance_to(h.world) < 0.5:
		if _deny <= 0.0:
			_deny = 0.8
			h.sfx.play("deny")
			h._tell({"t": "text", "x": h.world.x, "y": h.world.y, "text": "No room", "color": "#8c8090"})
		return
	_pay_evasive()
	_face(at)
	h.sfx.play("warp")
	var r: Dictionary = h.loadout.r(2)
	var x0: Vector2 = h.world
	var dir: Vector2 = (at - x0).normalized() if at.distance_to(x0) > 0.0 else h.face
	h._cast(2, "warp", x0, dir)
	h._boons(2)
	h._time_word_sound(2)
	h.last.dodge_surge(x0)
	_say({"t": "burst", "x": x0.x, "y": x0.y, "r": 0.8, "el": "frost", "style": "warp"})
	# (her figure comes apart where she was, and together where she comes out: render.ts PHASE_OUT, PHASE_IN)
	h.warp_out()
	h.world = land
	h._place()
	h.phase_in(0.22)
	h._invuln = maxf(h._invuln, 0.3)
	_say({"t": "burst", "x": land.x, "y": land.y, "r": 0.8, "el": "frost", "style": "warp"})
	# (HER TREE: Frost Warp, Flame Warp; Storm Warp where she arrives)
	_talent_warp(x0, land)
	var rad: float = float(def["radius"]) * float(r["size"])
	h._wake(2, x0, rad, float(r["count_dmg"]))
	for k in int(r["count"]):
		if k == 0:
			h._blast(2, land, rad, float(r["count_dmg"]), "nova", false, linear_to_db(0.8), 0, false)
		else:
			_after(0.22 * k, func() -> void: h._blast(2, land, rad, float(r["count_dmg"]), "nova", false, linear_to_db(0.8), k, false))
	if float(r["echo"]) > 0.0:
		var again := func() -> void: h._blast(2, land, rad, float(h.loadout.r(2)["count_dmg"]) * float(h.loadout.r(2)["echo"]), "nova", false, linear_to_db(0.8), 0, true)
		h._echo_of(2, "warp", land, dir, again)


## (game.ts denyT: "No room" said no more than once in 0.8 s)
var _deny := 0.0


func _move_step(_dt: float) -> void:
	move = {}


func step(dt: float, way: Vector2, hooked: bool) -> bool:
	_deny = maxf(0.0, _deny - dt)
	return super(dt, way, hooked)


func _clear_own() -> void:
	orbs.clear()
	aura = {"on": 0.0, "wait": 0.0, "tick": 0.0, "shield_back": 0.0}
	charge = 0.0


# =====================================================================================================================
# HER TREE (game/talents.ts MAGE2, TALENTS2's remade cards; game.ts talentWarp, updateTalents, releaseCharge, spreadFire, talentKill,
# passShock, rimeShatter, stepAura; TALENT_TUNE, SWAP_TUNE.aura)

## (Charged: the charge she has gathered walking, 0 to 1, and its sparks' clock; Stormcaller's clock; her Aura: its seconds on, its
## wait, the time to its next bite, the time to Lasting's shield coming back; where she was a moment ago)
var charge := 0.0
var _spark_t := 0.0
var _storm_t := 0.0
var aura := {"on": 0.0, "wait": 0.0, "tick": 0.0, "shield_back": 0.0}
var _was_at := Vector2.INF


func _TT() -> Dictionary:
	return Talents.D["tune"]


func _step_tree(dt: float) -> void:
	var walked: float = 0.0 if _was_at == Vector2.INF else h.world.distance_to(_was_at)
	_was_at = h.world
	var town: bool = h.in_town
	# (Charged: a charge gathered as she moves; full, it sparks round her)
	if h.has("charged") and not town:
		var C: Dictionary = _TT()["charged2"]
		if charge < 1.0:
			charge = minf(1.0, charge + walked / float(C["full"]))
			_spark_t = 0.0
		else:
			_spark_t -= dt
			if _spark_t <= 0.0:
				_spark_t = float(C["spark"])
				h._tell({"t": "spark", "x": h.world.x, "y": h.world.y, "el": "lightning", "n": 3})
	# (Stormcaller: every two seconds, lightning strikes an enemy near her)
	if h.has("stormcaller") and not town and h.monsters != null:
		_storm_t -= dt
		if _storm_t <= 0.0:
			var T: Dictionary = _TT()["stormcaller"]
			var best = null
			var bd: float = T["reach"]
			for m in h.monsters.list:
				if not is_instance_valid(m) or m.dead or m.state == "sleep" or h.monsters.shut_in(m):
					continue
				var dd: float = m.world.distance_to(h.world)
				if dd < bd and h.monsters.sees(h.world, m.world):
					bd = dd
					best = m
			if best != null:
				h._tell({"t": "arc", "x0": best.world.x, "y0": best.world.y, "x1": best.world.x, "y1": best.world.y, "sky": true})
				h.sfx.play("thunder", linear_to_db(0.5))
				best.shock_t = float(_TT()["shockSecs"])
				best.damage(h.talent_hit("lightning", float(T["share"])), "lightning", false, false, [], false, false, -1)
				_storm_t = float(T["every"])
			else:
				_storm_t = 0.3
	# (Searing: fire spreads from a burning enemy to any it touches)
	if h.has("searing") and h.monsters != null:
		var touch: float = _TT()["searing2"]["touch"]
		var burning: Array = h.monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead and m.burn_t > 0.0)
		for b in burning:
			for o in h.monsters.list:
				if not is_instance_valid(o) or o == b or o.dead or o.burn_t > 0.0 or h.monsters.shut_in(o):
					continue
				if o.world.distance_to(b.world) > b.r + o.r + touch:
					continue
				h._tell({"t": "ignite", "x": o.world.x, "y": o.world.y})
				o.burn_dps = b.burn_dps
				o.burn_t = 3.0
				o.last_skill = b.last_skill
	# (Hearth: standing in fire she made, nothing burns her; her mana's part is the mana mode's, which this port has not)
	if h.has("fuel") and h.wakes != null and h.burn_t > 0.0:
		for z in h.wakes.list:
			if z["kind"] == "burn" and h.world.distance_to(Vector2(z["x"], z["y"])) <= float(z["r"]):
				h.burn_t = 0.0
				break
	_step_aura(dt, town)


## (Charged) Her next hit lets the charge go: a bolt from the one struck, leaping between up to five.
func release_charge(m, at: Vector2) -> void:
	if charge < 1.0 or not h.has("charged") or h.monsters == null:
		return
	var C: Dictionary = _TT()["charged2"]
	charge = 0.0
	var hit: float = h.talent_hit("lightning", float(C["share"]))
	var done: Array = [m]
	var p := at
	h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": at.x, "y1": at.y, "sky": true})
	if not m.dead:
		m.shock_t = float(_TT()["shockSecs"])
		m.damage(hit, "lightning", false, false, [], false, false, -1)
	for n in range(1, int(C["n"])):
		var best = null
		var bd: float = C["reach"]
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead or done.has(o) or h.monsters.shut_in(o):
				continue
			var dd: float = o.world.distance_to(p)
			if dd < bd:
				bd = dd
				best = o
		if best == null:
			break
		done.append(best)
		h._tell({"t": "arc", "x0": p.x, "y0": p.y, "x1": best.world.x, "y1": best.world.y})
		p = best.world
		best.shock_t = float(_TT()["shockSecs"])
		best.damage(hit, "lightning", false, false, [], false, false, -1)
	h.sfx.play("thunder", linear_to_db(0.6))


## (game.ts talentWarp) Her Warp from `x0` to `x1`, with her talents: Frost Warp's burst of cold where she leaves; Flame Warp's fire
## along the way; Storm Warp's lightning where she arrives.
func _talent_warp(x0: Vector2, x1: Vector2) -> void:
	var T := _TT()
	if h.has("frostwarp") and h.monsters != null:
		var rr: float = T["frostWarp"]["r"]
		_say({"t": "burst", "x": x0.x, "y": x0.y, "r": rr, "el": "frost", "style": "nova"})
		h.sfx.play("frost", linear_to_db(0.8))
		for m in h.monsters.list:
			if is_instance_valid(m) and not m.dead and not m.boss and not h.monsters.shut_in(m) and m.world.distance_to(x0) <= rr + m.r:
				m.freeze_now()
	if h.has("flamewarp") and h.wakes != null:
		var F: Dictionary = T["flameWarp"]
		var len := x0.distance_to(x1)
		var d := 0.0
		while d <= len + 0.01:
			var at := x0 + (x1 - x0) * (d / maxf(0.01, len))
			h.wakes.add_patch(-1, "burn", at, float(F["r"]), float(F["secs"]), h.talent_hit("fire", float(F["share"])), "fire")
			d += float(F["every"])
	if h.has("stormwarp") and h.monsters != null:
		var S: Dictionary = T["stormWarp"]
		var near: Array = h.monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead and not h.monsters.shut_in(m) and m.world.distance_to(x1) <= float(S["reach"]))
		near.sort_custom(func(a, b): return a.world.distance_to(x1) < b.world.distance_to(x1))
		for m in near.slice(0, int(S["n"])):
			h._tell({"t": "arc", "x0": m.world.x, "y0": m.world.y, "x1": m.world.x, "y1": m.world.y, "sky": true})
			m.shock_t = float(T["shockSecs"])
			m.damage(h.talent_hit("lightning", float(S["share"])), "lightning", false, false, [], false, false, 2)
		if not near.is_empty():
			h.sfx.play("thunder", linear_to_db(0.7))


## A kill of hers (game.ts talentKill): Overload's shock passed on; Rime's ice shattering; Inferno's blast; Shatter's burst of cold.
func on_kill(m) -> void:
	var T := _TT()
	var at: Vector2 = m.world
	if h.has("overload") and m.shock_t > 0.0:
		var O: Dictionary = T["overload2"]
		var near: Array = h.monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and o != m and not h.monsters.shut_in(o) and o.world.distance_to(at) <= float(O["reach"]))
		near.sort_custom(func(a, b): return a.world.distance_to(at) < b.world.distance_to(at))
		near = near.slice(0, int(O["n"]))
		var jolt: float = h.talent_hit("lightning", float(O["share"]))
		for o in near:
			h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y})
			o.shock_t = float(T["shockSecs"])
		for o in near:
			o.damage(jolt, "lightning", false, false, [], false, false, -1)
		if not near.is_empty():
			h.sfx.play("zap", linear_to_db(0.6))
	if h.has("rime") and h.wakes != null:
		for k in h.wakes.list.size():
			var z: Dictionary = h.wakes.list[k]
			if z["kind"] == "ice" and at.distance_to(Vector2(z["x"], z["y"])) <= float(z["r"]) + m.r * 0.5:
				h.wakes.list.remove_at(k)
				h.wakes.queue_redraw()
				_say({"t": "burst", "x": z["x"], "y": z["y"], "r": z["r"], "el": "frost", "style": "nova"})
				h.sfx.play("shatter", linear_to_db(0.8))
				for o in h.monsters.list:
					if is_instance_valid(o) and not o.dead and o != m and not h.monsters.shut_in(o) and o.world.distance_to(Vector2(z["x"], z["y"])) <= float(z["r"]) + o.r * 0.5:
						o.freeze_now()
				break
	if h.has("inferno") and m.burn_t > 0.0:
		var boom := maxf(1.0, roundf(m.max_life * float(T["inferno"])))
		var br: float = T["burstR"]
		_after(0.1, func() -> void:
			_say({"t": "burst", "x": at.x, "y": at.y, "r": br, "el": "fire", "style": "blast"})
			h.sfx.play("explode", linear_to_db(0.6))
			for o in h.monsters.list:
				if not is_instance_valid(o) or o.dead or h.monsters.shut_in(o) or o.world.distance_to(at) > br + o.r:
					continue
				o.damage(boom, "fire", false, false, [], false, false, -1)
				if o.dead:
					continue
				if o.burn_t <= 0.0:
					h._tell({"t": "ignite", "x": o.world.x, "y": o.world.y})
				o.burn_dps = maxf(o.burn_dps if o.burn_t > 0.0 else 0.0, boom / 3.0)
				o.burn_t = 3.0)
	if h.has("shatter") and m.frozen_t > 0.0:
		var br2: float = T["burstR"]
		_say({"t": "burst", "x": at.x, "y": at.y, "r": br2, "el": "frost", "style": "shock"})
		for o in h.monsters.list:
			if not is_instance_valid(o) or o.dead or o == m or h.monsters.shut_in(o) or o.world.distance_to(at) > br2 + o.r:
				continue
			o.chill = maxf(o.chill if o.chill_t > 0.0 else 0.0, float(T["shatterChill"]))
			o.chill_t = 2.5


## (THE MAGE'S AURA, game.ts stepAura; SWAP_TUNE.aura) Her tap on herself (R) turns it on round her, six seconds, then a wait of ten
## (Lasting Aura: on at once and for good). FIRE burns every enemy in it; LIGHTNING a bolt to each every 0.8 s; FROST shields her
## (a quarter of her life while it is on; Lasting: back a wait after it breaks) and chills each to half its pace.
func aura_kind() -> String:
	if not h.has("aura"):
		return ""
	var p = h.picks.get("aura")
	return str(p) if p in ["fire", "lightning", "frost"] else "fire"


func _step_aura(dt: float, town: bool) -> void:
	var A: Dictionary = Talents.D["swapTune"]["aura"]
	var kind := aura_kind()
	var asked: bool = Input.is_action_just_pressed("change") or h.get("auto_change") == true
	if kind != "" and h.get("auto_change") == true:
		h.auto_change = false
	if kind == "" or town or not h.alive:
		aura["on"] = 0.0
		return
	var lasting: bool = h.has("lasting")
	if float(aura["wait"]) > 0.0:
		aura["wait"] = maxf(0.0, float(aura["wait"]) - dt)
	if float(aura["on"]) <= 0.0 and (lasting or (asked and float(aura["wait"]) <= 0.0)):
		aura["on"] = float(A["secs"])
		aura["tick"] = 0.0
		h.sfx.play("explode" if kind == "fire" else ("thunder" if kind == "lightning" else "frost"), linear_to_db(0.5))
		h._tell({"t": "spark", "x": h.world.x, "y": h.world.y, "el": kind, "n": 10})
		if kind == "frost":
			_aura_shield()
	if float(aura["on"]) <= 0.0:
		return
	if lasting:
		aura["on"] = float(A["secs"])
	else:
		aura["on"] = float(aura["on"]) - dt
		if float(aura["on"]) <= 0.0:
			aura["on"] = 0.0
			aura["wait"] = float(A["wait"])
			return
	if kind == "frost" and lasting and h.shield <= 0.0:
		aura["shield_back"] = float(aura["shield_back"]) - dt
		if float(aura["shield_back"]) <= 0.0:
			_aura_shield()
	aura["tick"] = float(aura["tick"]) - dt
	if float(aura["tick"]) > 0.0:
		return
	aura["tick"] = float(A["every"]) if kind == "lightning" else 0.5
	if h.monsters == null:
		return
	for m in h.monsters.list:
		if not is_instance_valid(m) or m.dead or m.state == "sleep" or h.monsters.shut_in(m) or m.world.distance_to(h.world) > float(A["r"]) + m.r:
			continue
		if kind == "fire":
			m.damage(h.talent_hit("fire", float(A["burn"]) * 0.5), "fire", false, false, [], false, true, -1)
		elif kind == "lightning":
			h._tell({"t": "arc", "x0": h.world.x, "y0": h.world.y, "x1": m.world.x, "y1": m.world.y})
			m.shock_t = float(_TT()["shockSecs"])
			m.damage(h.talent_hit("lightning", float(A["bolt"])), "lightning", false, false, [], false, false, -1)
		else:
			m.chill = maxf(m.chill if m.chill_t > 0.0 else 0.0, float(A["chill"]))
			m.chill_t = maxf(m.chill_t, 0.7)


func _aura_shield() -> void:
	var A: Dictionary = Talents.D["swapTune"]["aura"]
	h.shield = maxf(h.shield, roundf(h.max_life * float(A["shield"])))
	h.shield_t = maxf(h.shield_t, 1e6 if h.has("lasting") else float(A["secs"]))
	aura["shield_back"] = float(A["wait"])


## (game.ts auraNow) What is round her now, for the picture: {kind, r, t}; empty, nothing.
func aura_now() -> Dictionary:
	var kind := aura_kind()
	if kind == "" or float(aura["on"]) <= 0.0:
		return {}
	var A: Dictionary = Talents.D["swapTune"]["aura"]
	return {"kind": kind, "r": float(A["r"]), "t": float(A["secs"]) - float(aura["on"])}
