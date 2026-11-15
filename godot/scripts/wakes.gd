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
##
## HOW IT LOOKS IS A STAND-IN, all of it in `_draw` at the foot of this file: the rules above draw nothing.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")

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
func add_ground(zone: Dictionary, skill: int, at: Vector2, rad: float, hit: float) -> void:
	if _again(zone["kind"], at, rad, 0.45) != null:
		return
	if not _room() or not _on_floor(at):
		return
	list.append({"kind": zone["kind"], "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": float(zone["dur"]), "element": zone["element"],
		"dmg": hit * float(zone["dps"]), "slow": float(zone["slow"]), "tick": 0.2, "skill": skill})
	_tell({"t": "zone", "kind": zone["kind"], "x": at.x, "y": at.y, "r": rad, "el": zone["element"]})


## POISON behind move `skill` (addCloud): a cloud `rad` round `at` that poisons for `dps` a second, 5 s (`dur`: LASTING longer,
## FLEETING shorter).
func add_cloud(skill: int, at: Vector2, rad: float, dps: float, dur := 5.0) -> void:
	if _again("venom", at, rad, 0.6) != null:
		return
	if not _room() or not _on_floor(at):
		return
	list.append({"kind": "venom", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": dur, "element": "phys", "dmg": dps, "slow": 0.0, "tick": 0.2, "skill": skill})
	_tell({"t": "zone", "kind": "venom", "x": at.x, "y": at.y, "r": rad, "el": "phys"})


## FLOORS 6 TO 10'S WORDS BEHIND A MOVE:
## VOLATILE behind move `skill` (addRune): a rune `rad` round `at`, written now, that goes off 1.2 s later for `dmg` on whatever
## is in it, of `el`, breaking what it reaches; never laid again over one, nor given way for others (roomForZone).
func add_rune(skill: int, at: Vector2, rad: float, dmg: float, el: String) -> void:
	if not _room() or not _on_floor(at):
		return
	list.append({"kind": "rune", "x": at.x, "y": at.y, "r": rad, "t": 0.0, "dur": 1.2, "element": el, "dmg": dmg, "slow": 0.0, "tick": 0.0, "skill": skill})
	_tell({"t": "zone", "kind": "rune", "x": at.x, "y": at.y, "r": rad, "el": el})
	if sfx != null:
		sfx.play("rune", linear_to_db(0.7))


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
		# (a ward does its work in hero.gd hurt_by, for as long as it lasts; a rune waits, and goes off)
		if z["kind"] == "ward":
			continue
		if z["kind"] == "rune":
			if z["t"] >= z["dur"]:
				_rune(z)
			continue
		z["tick"] -= dt
		if z["tick"] <= 0.0:
			z["tick"] += 0.5
			_bite(z)
	list = list.filter(func(z): return z["t"] < z["dur"])
	queue_redraw()


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
	_tell({"t": "burst", "x": at.x, "y": at.y, "r": z["r"], "el": z["element"], "style": "ruin", "words": ["volatile"]})
	if monsters == null:
		return
	if monsters.hero != null and is_instance_valid(monsters.hero):
		monsters.hero.kick(3.0)
		monsters.hero._break_props(int(z["skill"]), at, float(z["r"]))
	if sfx != null:
		sfx.play("explode", linear_to_db(0.8))
	for m in monsters.list.duplicate():
		if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(z["r"]) + m.r:
			m.damage(maxf(1.0, roundf(z["dmg"])), z["element"], false, false, [], false, false, int(z["skill"]))


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
			_tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": m.world.x, "y1": m.world.y, "sky": true})
			m.damage(maxf(1.0, roundf(z["dmg"])), "lightning", false, false, [], false, false, int(z.get("skill", -1)))
			if sfx != null:
				sfx.play("thunder", linear_to_db(0.5))
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
				if z["kind"] == "ice":
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
