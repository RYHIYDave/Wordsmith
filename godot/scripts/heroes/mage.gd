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
	# ("of Echoes": the move made again a moment later, weaker, from where it was made)
	if primary and float(r["echo"]) > 0.0:
		var again := func() -> void: _deliver(i, from, to, float(h.loadout.r(i)["echo"]), false)
		h._echo_of(i, str(def["kind"]), from, way, again)


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
