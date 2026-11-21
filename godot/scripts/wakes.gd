## THE GROUND A MOVE LEAVES (game.ts: the hero's own zones; wake, addGround, addCloud, addPatch, roomForZone, updateZones).
## A word BEHIND one of his moves changes what the move leaves where it struck (hero.gd _wake lays it here), and this is what
## that ground does to the monsters on it, for as long as it lies:
##   burn    FLAME behind: burning ground, 4 s. Every half second whatever stands in it takes half of what it burns a second.
##   ice     FROST behind: ice, 4 s. Every half second what stands on it is chilled (slowed by the ice's share, 0.7 s: it
##           wears off once it is off the ice) and takes half of what the ice bites a second.
##   storm   LIGHTNING behind: a storm, 4 s. Every half second its lightning comes down on one of those in it, whichever.
##   venom   POISON behind: a cloud, 5 s. Every half second what stands in it is poisoned as hard as the cloud, for 2 s more:
##           they carry it out with them.
##   cracks  HEAVY behind: cracked ground, 4 s. What walks onto it awake is staggered (monster.gd stagger_from: not a boss,
##           and not again for a while); a bat flies over it.
## Burning, iced or storming ground and a cloud bite first 0.2 s after they are laid, then every half second. Laid again where
## one of its kind already lies (as near as 0.45 of a tile for ground, 0.6 for a cloud or cracks, and that one no smaller),
## the one lying begins its time again: they do not pile up. No more than 90 lie at once: the one nearest its end gives way
## to a new one. Nothing is laid where there is no floor to stand on.
##
## `list`: a dictionary for each patch: {kind, x, y, r: tiles; t: seconds it has lain; dur: seconds it lies; element; dmg:
## what it does (burn, ice: a second; storm: a strike; venom: its poison a second); slow: the ice's share; tick: seconds to
## its next bite; skill: which of his moves left it (0 Strike, 1 Whirlwind, 2 Lunge)}.
## WORDMELDING (melds.gd; game.ts addGround, addCloud, addRune, meldPatch, meldZone, runeTwist, updateZones): a patch laid by a move
## with a melded word behind is that word's (`meld`), and laid again by one, becomes it, twist and all: Wildfire's burning ground
## throws sparks, Fumes' cloud explodes as anything burning comes into it, Frostbite's ice poisons, Contagion's cloud shocks;
## Hailstorm's storm of ice slows what is in it (`slow`); Scald's STEAM bites and slows as ice does, and hides him (monsters.gd
## hero_hidden). VOLATILE'S MELDS behind: Demolition's one huge rune at a time, slow to go off; each rune waits its meld's own time;
## Shatter's freezes what is in it 40% through its wait (`froze`); Powderkeg's leaves burning ground and Rupture's a poison cloud as
## it goes off; Chain Reaction's sets off the nearest other of its kind (`linked`). Eruption's pool and Fumes' cloud in front are
## laid by add_patch (`look`: the melded word whose they are, for their looks; they do what any burning ground or cloud does).
##
## HOW IT LOOKS IS A STAND-IN, all of it in `_draw` at the foot of this file: the rules above draw nothing.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const Words := preload("res://scripts/words.gd")

## (defs.ts TUNE.maxZones)
const MOST := 90

var map: FloorMap
var monsters  # monsters.gd
var sfx
## (what the fight shows: the rules tell it of each patch as it is laid, and of the storm's bolts: fx.gd)
var fx
var list: Array = []


## FLAME, FROST or LIGHTNING behind move `skill` (addGround): its ground `zone` (words.gd resolve's: {kind, element, dps, slow,
## dur}) laid `rad` round `at`; `hit`: one hit of the move as his numbers stand, of which the ground does its share.
func add_ground(zone: Dictionary, skill: int, at: Vector2, rad: float, hit: float, meld = null) -> void:
	var o = _again(zone["kind"], at, rad, 0.45)
	if o != null:
		# (WORDMELDING: laid again by a melded word behind, it is that word's patch from now, its twist and all)
		if meld != null:
			o["meld"] = meld
		return
	if not _room() or not _on_floor(at):
		return
	var z := {"kind": zone["kind"], "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": float(zone["dur"]), "element": zone["element"],
		"dmg": hit * float(zone["dps"]), "slow": float(zone["slow"]), "tick": 0.2, "skill": skill}
	if meld != null:
		z["meld"] = meld
	list.append(z)
	_tell(_melded({"t": "zone", "kind": zone["kind"], "x": at.x, "y": at.y, "r": rad, "el": zone["element"]}, meld))


## POISON behind move `skill` (addCloud): a cloud `rad` round `at` that poisons for `dps` a second, 5 s (`dur`: LASTING longer,
## FLEETING shorter).
func add_cloud(skill: int, at: Vector2, rad: float, dps: float, dur := 5.0, meld = null) -> void:
	var o = _again("venom", at, rad, 0.6)
	if o != null:
		# (WORDMELDING: as for the ground: a cloud laid again by Fumes behind is Fumes' cloud, and goes up in fire)
		if meld != null:
			o["meld"] = meld
		return
	if not _room() or not _on_floor(at):
		return
	var z := {"kind": "venom", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "element": "phys", "dmg": dps, "slow": 0.0, "tick": 0.2, "skill": skill}
	if meld != null:
		z["meld"] = meld
	list.append(z)
	_tell(_melded({"t": "zone", "kind": "venom", "x": at.x, "y": at.y, "r": rad, "el": "phys"}, meld))


## FLOORS 6 TO 10'S WORDS BEHIND A MOVE:
## VOLATILE behind move `skill` (addRune): a rune `rad` round `at`, written now, that goes off 1.2 s later for `dmg` on whatever
## is in it, of `el`, breaking what it reaches; never laid again over one, nor given way for others (roomForZone).
## (VOLATILE'S MELDS behind, `meld`: the rune carries its twist and waits its own time; Demolition's, one at a time for the move,
## its rune wider and harder)
func add_rune(skill: int, at: Vector2, rad: float, dmg: float, el: String, meld = null) -> void:
	var M: Dictionary = Words.data()["melds"]
	if meld != null and not M["volt"].has(meld):
		meld = null
	var huge: bool = meld == "demolition"
	if huge:
		for z in list:
			if z["kind"] == "rune" and int(z["skill"]) == skill and z.get("meld") == "demolition":
				return
	if not _room() or not _on_floor(at):
		return
	var D: Dictionary = M["tune"]["demolition"]
	if huge:
		rad *= float(D["runeWide"])
		dmg *= float(D["runeHard"])
	var z := {"kind": "rune", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": float(M["tune"][meld]["wait"]) if meld != null else 1.2, "element": el, "dmg": dmg, "slow": 0.0, "tick": 0.0, "skill": skill}
	if meld != null:
		z["meld"] = meld
	list.append(z)
	_tell(_melded({"t": "zone", "kind": "rune", "x": at.x, "y": at.y, "r": rad, "el": el}, meld))
	if sfx != null:
		sfx.play("rune", linear_to_db(0.7))


## WORDMELDING: a patch a melded word's twist in front leaves (game.ts meldPatch: Eruption's molten pool, `kind` "burn"; Fumes'
## cloud, "venom"), `rad` round `at` for `dur` seconds, harming for `dps` a second. Laid where one of its kind lies (as near as 0.6,
## and no smaller), that one begins its time again, as hard as the harder, and looks like the pool or cloud it now is.
func add_patch(skill: int, kind: String, at: Vector2, rad: float, dur: float, dps: float, el: String, look = null) -> void:
	for o in list:
		if o["kind"] == kind and Vector2(o["x"], o["y"]).distance_to(at) < 0.6 and o["r"] >= rad - 0.1:
			o["t"] = 0.0
			o["dmg"] = maxf(float(o["dmg"]), dps)
			if look != null and o.get("meld") == null:
				o["look"] = look
			return
	if not _room() or not _on_floor(at):
		return
	var z := {"kind": kind, "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "element": el, "dmg": dps, "slow": 0.0, "tick": 0.2, "skill": skill}
	if look != null:
		z["look"] = look
	list.append(z)
	_tell(_melded({"t": "zone", "kind": kind, "x": at.x, "y": at.y, "r": rad, "el": el}, look))


## (a telling marked with the melded word it is of, where it is of one)
static func _melded(e: Dictionary, meld) -> Dictionary:
	if meld != null:
		e["meld"] = meld
	return e


## GUARDING behind move `skill` (addPatch 'ward'): a ward circle `rad` round `at` for `dur` seconds; inside it the hero takes
## `share` less harm (hero.gd hurt_by). Laid again where one lies, that one lasts as long again from now, and wards as well as
## the better of the two.
func add_ward(skill: int, at: Vector2, rad: float, dur: float, share: float) -> void:
	var o = _again("ward", at, rad, 0.6)
	if o != null:
		o["dur"] = dur
		o["dmg"] = maxf(float(o["dmg"]), share)
		_tell({"t": "zone", "kind": "ward", "x": o["x"], "y": o["y"], "r": o["r"], "el": "phys", "dur": dur})
		return
	if not _room() or not _on_floor(at):
		return
	list.append({"kind": "ward", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "element": "phys", "dmg": share, "slow": 0.0, "tick": 0.0, "skill": skill})
	_tell({"t": "zone", "kind": "ward", "x": at.x, "y": at.y, "r": rad, "el": "phys", "dur": dur})


## THE CITY'S WORDS behind move `skill` (game.ts addPatch 'vortex', 'hex', 'bubble'): PULLING's vortex (it keeps drawing what is in it
## in to its middle, 0.9 tiles a second, an elite half as fast, a boss not at all), HEXING's circle (enemies in it deal `share` less:
## hero.gd hurt_by), STILLING's bubble (enemies and their shots in it `share` slower: monster.gd time_of), `rad` round `at` for `dur`.
## Laid again where one lies, that one lasts as long again from now, as strong as the stronger.
func add_zone(kind: String, skill: int, at: Vector2, rad: float, dur: float, share: float) -> void:
	var o = _again(kind, at, rad, 0.6)
	if o != null:
		o["dur"] = dur
		o["dmg"] = maxf(float(o["dmg"]), share)
		_tell({"t": "zone", "kind": kind, "x": o["x"], "y": o["y"], "r": o["r"], "el": "phys", "dur": dur})
		return
	if not _room() or not _on_floor(at):
		return
	list.append({"kind": kind, "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "element": "phys", "dmg": share, "slow": 0.0, "tick": 0.0, "skill": skill})
	_tell({"t": "zone", "kind": kind, "x": at.x, "y": at.y, "r": rad, "el": "phys", "dur": dur})


## BINDING behind move `skill` (game.ts addSnare): a snare at `at`, lying BIND.snareLife seconds, for the next enemy to cross it (held
## `secs`). Laid again where one lies, that one lies as long again from now. What stands on it as it is laid is let be until it steps
## off.
func add_snare(skill: int, at: Vector2, secs: float) -> void:
	var B: Dictionary = Words.data()["city"]["bind"]
	for o in list:
		if o["kind"] == "snare" and Vector2(o["x"], o["y"]).distance_to(at) < 0.6:
			o["t"] = 0.0
			o["dmg"] = maxf(float(o["dmg"]), secs)
			return
	if not _room() or not _on_floor(at):
		return
	var on_it: Array = []
	if monsters != null:
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(B["reach"]) + m.r * 0.5:
				on_it.append(m.id)
	list.append({"kind": "snare", "x": at.x, "y": at.y, "r": B["reach"], "t": 0.0, "dur": B["snareLife"], "element": "phys", "dmg": secs, "slow": 0.0,
		"tick": 0.0, "skill": skill, "words": ["binding"], "on_it": on_it})
	_tell({"t": "zone", "kind": "snare", "x": at.x, "y": at.y, "r": B["reach"], "el": "phys", "dur": B["snareLife"]})


## patchAt: the strongest of the hero's patches of `kind` that `at` is inside, or null.
func patch_at(kind: String, at: Vector2):
	var best = null
	for z in list:
		if z["kind"] == kind and Vector2(z["x"], z["y"]).distance_to(at) <= float(z["r"]) and (best == null or float(z["dmg"]) > float(best["dmg"])):
			best = z
	return best


## HEAVY behind move `skill` (addPatch 'cracks'): cracked ground `rad` round `at` for `dur` seconds. Laid again where some
## lies, that lasts as long again from now.
func add_cracks(skill: int, at: Vector2, rad: float, dur: float) -> void:
	var o = _again("cracks", at, rad, 0.6)
	if o != null:
		o["dur"] = dur
		_tell({"t": "zone", "kind": "cracks", "x": o["x"], "y": o["y"], "r": o["r"], "el": "phys", "dur": dur})
		return
	if not _room() or not _on_floor(at):
		return
	list.append({"kind": "cracks", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "element": "phys", "dmg": 0.0, "slow": 0.0, "tick": 0.0, "skill": skill})
	_tell({"t": "zone", "kind": "cracks", "x": at.x, "y": at.y, "r": rad, "el": "phys", "dur": dur})


## A patch of that kind lying within `near` of `at`, and no smaller than `rad`: it begins its time again, and is given back
## (null: none lies there).
func _again(kind: String, at: Vector2, rad: float, near: float):
	for o in list:
		if o["kind"] == kind and Vector2(o["x"], o["y"]).distance_to(at) < near and o["r"] >= rad - 0.1:
			o["t"] = 0.0
			return o
	return null


## roomForZone: is there room for one more? When 90 lie, the one nearest the end of its time gives way, so that what was
## just done always shows.
func _room() -> bool:
	if list.size() < MOST:
		return true
	var oldest := -1
	var left := INF
	for k in list.size():
		var o: Dictionary = list[k]
		# (a rune is never taken away)
		if o["kind"] == "rune":
			continue
		if o["dur"] - o["t"] < left:
			left = o["dur"] - o["t"]
			oldest = k
	if oldest < 0:
		return false
	list.remove_at(oldest)
	return true


## onFloor: is this place floor that can be stood on (not a pit, not a wall, nor the wall half of a tile cut corner to corner)?
func _on_floor(at: Vector2) -> bool:
	if map == null:
		return false
	return map.tile(floori(at.x), floori(at.y)) == FloorMap.FLOOR and not map.in_wall(at.x, at.y)


## Every patch's time passes, and it does what it does (updateZones).
func _process(dt: float) -> void:
	if list.is_empty():
		return
	for z in list.duplicate():
		z["t"] += dt
		if z["kind"] == "cracks":
			_crack(z)
			continue
		# (a ward does its work in hero.gd hurt_by, for as long as it lasts; so do Hexing's circle, there, and Stilling's bubble, in the
		# monsters' time: monster.gd time_of; a rune waits, and goes off)
		if z["kind"] == "ward" or z["kind"] == "hex" or z["kind"] == "bubble":
			continue
		if z["kind"] == "vortex":
			_vortex(z, dt)
			continue
		if z["kind"] == "snare":
			_snare(z)
			continue
		if z["kind"] == "rune":
			# (VOLATILE'S MELDS: Shatter's rune freezes what is in it, part way through its wait)
			if z.get("meld") == "shatter" and not z.get("froze", false) and z["t"] >= z["dur"] * float(Words.data()["melds"]["tune"]["shatter"]["freezeAt"]):
				_shatter_freeze(z)
			if z["t"] >= z["dur"]:
				_rune(z)
			continue
		# (WORDMELDING: the twists of what a melded word behind leaves; Fumes' cloud, set off, is gone)
		if z.get("meld") != null and _meld_zone(z, dt):
			continue
		z["tick"] -= dt
		if z["tick"] <= 0.0:
			z["tick"] += 0.5
			_bite(z)
	list = list.filter(func(z): return z["t"] < z["dur"])
	queue_redraw()


## (THE CITY'S WORDS: Pulling behind) The vortex keeps drawing what is in it in to its middle; a boss stands firm, and one making an
## act of its own.
func _vortex(z: Dictionary, dt: float) -> void:
	if monsters == null:
		return
	var P: Dictionary = Words.data()["pull"]
	var mid := Vector2(z["x"], z["y"])
	for m in monsters.list:
		if not is_instance_valid(m) or m.dead or m.boss or m.state == "sleep" or m.state == "act" or monsters.shut_in(m):
			continue
		var d: float = m.world.distance_to(mid)
		if d > float(z["r"]) + m.r * 0.5 or d <= float(P["middle"]):
			continue
		var step := minf(d - float(P["middle"]), float(P["pace"]) * (0.5 if m.elite else 1.0) * dt)
		var rr := minf(m.r, 0.42)
		var s: Vector2 = (mid - m.world) / d * step
		var fly: bool = m.kind == "bat"
		if monsters.clear(m.world.x + s.x, m.world.y, rr, fly):
			m.world.x += s.x
		if monsters.clear(m.world.x, m.world.y + s.y, rr, fly):
			m.world.y += s.y


## (THE CITY'S WORDS: Binding behind) The first enemy to come onto the snare is held, and the snare is spent (bats fly over it; a boss,
## or one held not long since, crosses it as if it were not there).
func _snare(z: Dictionary) -> void:
	if monsters == null or monsters.hero == null:
		return
	var at := Vector2(z["x"], z["y"])
	var on := func(o) -> bool: return o.world.distance_to(at) <= float(z["r"]) + o.r * 0.5
	var kept: Array = []
	for id in z["on_it"]:
		for o in monsters.list:
			if is_instance_valid(o) and o.id == id and not o.dead and on.call(o):
				kept.append(id)
	z["on_it"] = kept
	for o in monsters.list:
		if not is_instance_valid(o) or o.dead or o.state == "sleep" or o.kind == "bat" or o.boss or o.bind_again > 0.0 or not on.call(o) or z["on_it"].has(o.id):
			continue
		var held: float = monsters.hero.city.bind_monster(o, z["dmg"])
		if held > 0.0:
			_tell({"t": "snareSprung", "id": o.id, "x": at.x, "y": at.y, "secs": held})
			z["dur"] = z["t"]
		return


## Cracked ground: what walks onto it awake is staggered; a bat flies over it.
func _crack(z: Dictionary) -> void:
	if monsters == null:
		return
	var at := Vector2(z["x"], z["y"])
	for m in monsters.list:
		if not is_instance_valid(m) or m.dead or m.state == "sleep" or m.state == "rise" or m.kind == "bat":
			continue
		if m.world.distance_to(at) <= z["r"] + m.r * 0.5:
			m.stagger_from(at)


## A rune goes off (game.ts updateZones 'rune'): everything in it struck for what it carries, what it reaches broken.
func _rune(z: Dictionary) -> void:
	var at := Vector2(z["x"], z["y"])
	_tell(_melded({"t": "burst", "x": at.x, "y": at.y, "r": z["r"], "el": z["element"], "style": "ruin", "words": ["volatile"]}, z.get("meld")))
	if monsters == null:
		return
	if monsters.hero != null and is_instance_valid(monsters.hero):
		# (Demolition's huge rune shakes the screen twice as hard)
		monsters.hero.kick(6.0 if z.get("meld") == "demolition" else 3.0)
		monsters.hero._break_props(int(z["skill"]), at, float(z["r"]))
	if sfx != null:
		sfx.play("explode", linear_to_db(0.8))
	for m in monsters.list.duplicate():
		if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(z["r"]) + m.r:
			m.damage(maxf(1.0, roundf(z["dmg"])), z["element"], false, false, [], false, false, int(z["skill"]))
	if z.get("meld") != null:
		_rune_twist(z)


# --- WORDMELDING: what a melded word behind leaves does (game.ts meldZone, runeTwist, updateZones) ---

## Zone `z`'s melded word's twist (game.ts meldZone). True if it is gone by it (Fumes' cloud, exploding).
func _meld_zone(z: Dictionary, dt: float) -> bool:
	if monsters == null:
		return false
	var T: Dictionary = Words.data()["melds"]["tune"]
	var at := Vector2(z["x"], z["y"])
	var meld: String = z["meld"]
	var due: bool = float(z["tick"]) - dt <= 0.0
	var near := func(reach: float) -> Array:
		var out: Array = []
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "rise" and m.world.distance_to(at) <= reach:
				out.append(m)
		return out
	if meld == "wildfire" and z["kind"] == "burn":
		# (the burning ground throws a spark at an enemy near it, every so often)
		z["meld_t"] = float(z.get("meld_t", 0.0)) - dt
		if z["meld_t"] <= 0.0:
			z["meld_t"] = float(T["wildfire"]["every"])
			var by: Array = near.call(float(z["r"]) + float(T["wildfire"]["reach"]))
			if not by.is_empty():
				var m = by.pick_random()
				_tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": m.world.x, "y1": m.world.y, "meld": "wildfire"})
				m.damage(maxf(1.0, roundf(float(z["dmg"]) * (float(T["wildfire"]["spark"]) / 0.25))), "fire", false, false, [], false, false, int(z["skill"]))
				if sfx != null:
					sfx.play("zap", linear_to_db(0.4))
	elif meld == "fumes" and z["kind"] == "venom":
		# (anything burning that comes into the cloud sets it off)
		var lit := false
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.burn_t > 0.0 and m.world.distance_to(at) <= float(z["r"]) + m.r * 0.5:
				lit = true
		if lit:
			z["t"] = z["dur"]
			var boom := maxf(1.0, roundf(float(z["dmg"]) * float(T["fumes"]["blast"])))
			_tell({"t": "burst", "x": at.x, "y": at.y, "r": float(z["r"]) + 0.5, "el": "fire", "style": "blast", "meld": "fumes"})
			_tell({"t": "shake", "amount": 3})
			if monsters.hero != null and is_instance_valid(monsters.hero):
				monsters.hero.kick(3.0)
			if sfx != null:
				sfx.play("explode", linear_to_db(0.7))
			for m in monsters.list.duplicate():
				if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(z["r"]) + 0.5 + m.r:
					m.damage(boom, "fire", false, false, [], false, false, int(z["skill"]))
			return true
	elif meld == "frostbite" and z["kind"] == "ice" and due:
		# (the ice poisons what crosses it)
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "rise" and m.world.distance_to(at) <= float(z["r"]) + m.r * 0.5:
				m.dose(float(z["dmg"]))
				m.last_skill = int(z["skill"])
	elif meld == "contagion" and z["kind"] == "venom" and due:
		# (the cloud shocks one that stands in it)
		var inside: Array = []
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "rise" and m.world.distance_to(at) <= float(z["r"]) + m.r * 0.5:
				inside.append(m)
		if not inside.is_empty():
			var m = inside.pick_random()
			_tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": m.world.x, "y1": m.world.y, "meld": "contagion"})
			m.damage(maxf(1.0, roundf(float(z["dmg"]) * float(T["contagion"]["shock"]))), "lightning", false, false, [], false, false, int(z["skill"]))
			if sfx != null:
				sfx.play("zap", linear_to_db(0.4))
	return false


## SHATTER behind: its rune, part way through its wait, freezes what is in it (game.ts updateZones 'rune').
func _shatter_freeze(z: Dictionary) -> void:
	z["froze"] = true
	if monsters == null or monsters.hero == null or not is_instance_valid(monsters.hero):
		return
	var at := Vector2(z["x"], z["y"])
	var ids: Array = []
	for m in monsters.list:
		if not is_instance_valid(m) or m.dead or monsters.shut_in(m) or m.world.distance_to(at) > float(z["r"]) + m.r:
			continue
		monsters.hero.melds.freeze(m)
		if m.frozen_t > 0.0:
			ids.append(m.id)
	_tell({"t": "volFx", "meld": "shatter", "what": "freeze", "x": at.x, "y": at.y, "r": z["r"], "ids": ids})


## VOLATILE'S MELDS behind, as rune `z` goes off (game.ts runeTwist): Powderkeg's leaves burning ground; Rupture's bursts into a
## poison cloud; Chain Reaction's sets off the hero's other linked runes, one after another.
func _rune_twist(z: Dictionary) -> void:
	var T: Dictionary = Words.data()["melds"]["tune"]
	var at := Vector2(z["x"], z["y"])
	match z["meld"]:
		"powderkeg":
			if _room() and _on_floor(at):
				var P: Dictionary = T["powderkeg"]
				list.append({"kind": "burn", "x": at.x, "y": at.y, "r": float(z["r"]) * 0.7, "t": 0.0, "dur": float(P["groundSecs"]), "element": "fire", "dmg": float(z["dmg"]) * float(P["ground"]) * 0.2, "slow": 0.0, "tick": 0.2, "skill": z["skill"], "meld": "powderkeg"})
				_tell({"t": "zone", "kind": "burn", "x": at.x, "y": at.y, "r": float(z["r"]) * 0.7, "el": "fire", "meld": "powderkeg"})
		"rupture":
			if _room() and _on_floor(at):
				list.append({"kind": "venom", "x": at.x, "y": at.y, "r": float(z["r"]) * 0.75, "t": 0.0, "dur": 5.0, "element": "phys", "dmg": float(z["dmg"]) * float(T["rupture"]["cloud"]) * 0.2, "slow": 0.0, "tick": 0.2, "skill": z["skill"], "meld": "rupture"})
				_tell({"t": "zone", "kind": "venom", "x": at.x, "y": at.y, "r": float(z["r"]) * 0.75, "el": "phys", "meld": "rupture"})
		"chainreaction":
			# (the nearest of his own in reach, not yet set off, goes off a moment after; it in its turn sets off the next)
			var C: Dictionary = T["chainreaction"]
			var next = null
			var best: float = C["linkReach"]
			for o in list:
				if o == z or o["kind"] != "rune" or o.get("meld") != "chainreaction" or o.get("linked", false) or o["t"] >= o["dur"]:
					continue
				var d: float = Vector2(o["x"], o["y"]).distance_to(at)
				if d <= best:
					best = d
					next = o
			if next != null:
				next["linked"] = true
				next["dur"] = minf(float(next["dur"]), float(next["t"]) + float(C["next"]))
				_tell({"t": "volFx", "meld": "chainreaction", "what": "link", "x0": at.x, "y0": at.y, "x1": next["x"], "y1": next["y"]})


## A bite of burning, iced or storming ground, or of a cloud, on those standing in it (within its radius and half their own).
func _bite(z: Dictionary) -> void:
	if monsters == null:
		return
	var at := Vector2(z["x"], z["y"])
	var inside: Array = []
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead and m.state != "rise" and m.world.distance_to(at) <= z["r"] + m.r * 0.5:
			inside.append(m)
	match z["kind"]:
		"storm":
			if inside.is_empty():
				return
			var m = inside.pick_random()
			_tell(_melded({"t": "arc", "x0": at.x, "y0": at.y, "x1": m.world.x, "y1": m.world.y, "sky": true}, z.get("meld")))
			m.damage(maxf(1.0, roundf(z["dmg"])), "lightning", false, false, [], false, false, int(z.get("skill", -1)))
			if sfx != null:
				sfx.play("thunder", linear_to_db(0.5))
			# (WORDMELDING: Hailstorm's storm of ice slows what is in it)
			if float(z["slow"]) > 0.0:
				for o in inside:
					o.chill = maxf(o.chill if o.chill_t > 0.0 else 0.0, z["slow"])
					o.chill_t = maxf(o.chill_t, 0.7)
		"venom":
			# (the cloud poisons whatever stands in it, and they carry it out with them)
			for m in inside:
				if m.poison_t <= 0.0:
					m.poison_n = 1
					m.poison_dps = 0.0
					_tell({"t": "poisoned", "x": m.world.x, "y": m.world.y})
				m.poison_dps = maxf(m.poison_dps, z["dmg"])
				m.poison_t = maxf(m.poison_t, 2.0)
				if int(z.get("skill", -1)) >= 0:
					m.last_skill = int(z["skill"])
		_:
			for m in inside:
				# (WORDMELDING: Scald behind's steam slows as ice does)
				if z["kind"] == "ice" or z["kind"] == "steam":
					m.chill = maxf(m.chill if m.chill_t > 0.0 else 0.0, z["slow"])
					m.chill_t = 0.7
				m.damage(maxf(1.0, roundf(z["dmg"] * 0.5)), z["element"], false, false, [], false, true, int(z.get("skill", -1)))


## Told as it is laid (fx.gd `zone`); and it is to be drawn from now.
func _tell(e: Dictionary) -> void:
	if e["t"] == "zone":
		queue_redraw()
	if fx != null:
		fx.event(e)


# ===========================================================================================================================
# A STAND-IN, NOT THE GAME'S LOOKS: everything that is drawn of the ground is drawn here, and only here. Each patch is shown
# plainly, a flat ring on the floor tinted by its kind with the hero's own cyan round its edge (what glows on a friend is
# cyan), fading as its time runs out. The game's own pictures of burning ground, ice, a storm, a cloud and cracked ground
# (render/fx.ts and render.ts, 'zone') are to take its place: replace this one function, and leave the rules above alone.
# ===========================================================================================================================
const STAND_IN := {
	"burn": Color(1.0, 0.36, 0.14), "ice": Color(0.62, 0.86, 1.0), "storm": Color(0.45, 0.5, 1.0),
	"venom": Color(0.42, 0.86, 0.3), "cracks": Color(0.6, 0.55, 0.5),
}
const STAND_IN_EDGE := Color(0.35, 0.9, 1.0)


func _draw() -> void:
	# (THE GAME'S OWN LOOKS of each patch, its floor: fx.gd draw_wake, fx_wakes.gd; what it sends up, its cloud and its light
	# are tended there from this list. The plain rings below only where there is no fx.)
	if fx != null and is_instance_valid(fx) and fx.has_method("draw_wake"):
		for z in list:
			fx.draw_wake(self, z)
		return
	for z in list:
		var a := clampf((z["dur"] - z["t"]) / 0.5, 0.0, 1.0)
		var lift: float = map.lift_at(z["x"], z["y"]) if map != null else 0.0
		var ring := PackedVector2Array()
		for k in 33:
			var ang := TAU * k / 32.0
			ring.append(Iso.to_screen(z["x"] + cos(ang) * z["r"], z["y"] + sin(ang) * z["r"]) - Vector2(0.0, lift))
		var tint: Color = STAND_IN.get(z["kind"], Color.WHITE)
		var fill := ring.duplicate()
		fill.remove_at(fill.size() - 1)
		draw_colored_polygon(fill, Color(tint, 0.4 * a))
		draw_polyline(ring, Color(STAND_IN_EDGE, 0.9 * a), 2.0)
