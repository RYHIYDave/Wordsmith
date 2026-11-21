## FLOOR 18, THE GLASS GALLERY: ITS TALL MIRRORS (game/act2/gallery_rules.ts; game.ts mirrorsStruck, updateMirrors). His doc: "mirrors
## that crack and burst into shards when anything strikes near them". (Its other hazard, the skylights, is the floor's trap: traps.gd.)
##   A tall mirror on a gallery's wall CRACKS at a blow landing near it (within 1.3 tiles of the floor before it, besides the blow's own
##   reach): his blows (hero.gd _break_props), a monster's blow landing on him (hero.gd hurt_by), another mirror's shards. At the next
##   it BURSTS 0.3 s after, its shards flying out across the floor before it (2.6 tiles out, 1.6 to either side): him struck, 14% of
##   his life, every monster in them (not a boss) 30% of its own; a burst cracks the mirrors beside it (within 0.9). A burst mirror
##   stays burst, its frame empty, its glass on the floor (the look's states `mirror<i>`: whole, cracked, burst).
## The reflections step out of these mirrors (act3/reflection.gd: `taken`).
extends Node

const MIRROR := {"near": 1.3, "warn": 0.3, "reach": 2.6, "half": 1.6, "hero": 0.14, "mob": 0.3, "chain": 2.2}
const WHOLE := 0
const CRACKED := 1
const BURST := 2

var main
## [{x, y, fx, fy, frame, pending, state: the look's state's name, taken}]
var mirrors: Array = []


func on() -> bool:
	return not mirrors.is_empty()


func enter(where: String) -> void:
	mirrors = []
	if main.is_home(where) or main.map == null or main.map.land == null or main.map.land.get("gallery") == null:
		return
	var names := {}
	if main.look != null:
		var V: Dictionary = main.look.data.get("variants", {})
		for name in V:
			if str(V[name].get("kind", "")) == "mirror":
				names[Vector2i(int(V[name]["at"]["tx"]), int(V[name]["at"]["ty"]))] = name
	for q in main.map.land["gallery"].get("mirrors", []):
		var tx: int = q["tx"]
		var ty: int = q["ty"]
		var v: int = q["variant"]
		# (its face: along x, on a wall of the room's far side, facing +y; else facing +x)
		var m := {"x": tx + 0.5, "y": float(ty), "fx": 0.0, "fy": 1.0} if v & 1 == 0 else {"x": float(tx), "y": ty + 0.5, "fx": 1.0, "fy": 0.0}
		m["frame"] = v >> 1
		m["pending"] = 0.0
		m["taken"] = false
		m["state"] = names.get(Vector2i(tx, ty), "")
		mirrors.append(m)


func _show(m: Dictionary) -> void:
	if str(m["state"]) == "" or main.look == null:
		return
	if int(m["frame"]) == WHOLE:
		main.look.clear_variant(m["state"])
	else:
		main.look.show_variant(m["state"], float(m["frame"]) / 2.0)


## A blow lands within `rad` of `at`: the mirrors near it crack, or, cracked already, are set to burst (strikeMirrors; mirrorsStruck).
func strike(at: Vector2, rad: float) -> void:
	var cracked: Array = []
	for m in mirrors:
		if int(m["frame"]) == BURST or float(m["pending"]) > 0.0:
			continue
		var c := Vector2(float(m["x"]) + float(m["fx"]) * 0.5, float(m["y"]) + float(m["fy"]) * 0.5)
		if c.distance_to(at) > rad + float(MIRROR["near"]):
			continue
		if int(m["frame"]) == WHOLE:
			m["frame"] = CRACKED
			_show(m)
			cracked.append(m)
		else:
			m["pending"] = MIRROR["warn"]
	if cracked.is_empty():
		return
	main.sfx.play("mirror_crack", linear_to_db(0.7))
	for m in cracked:
		main.fx.event({"t": "spark", "x": float(m["x"]) + float(m["fx"]) * 0.4, "y": float(m["y"]) + float(m["fy"]) * 0.4, "el": "phys", "n": 5})


## Whether `p` is in a burst mirror's shards: on the floor before it, out to 2.6 and 1.6 to either side.
static func in_shards(m: Dictionary, p: Vector2) -> bool:
	var a := p - Vector2(m["x"], m["y"])
	var along := a.x * float(m["fx"]) + a.y * float(m["fy"])
	var across := absf(a.x * float(m["fy"]) - a.y * float(m["fx"]))
	return along > -0.2 and along <= float(MIRROR["reach"]) and across <= float(MIRROR["half"])


func _process(dt: float) -> void:
	if mirrors.is_empty() or main == null or get_tree().paused:
		return
	for m in mirrors:
		if float(m["pending"]) <= 0.0:
			continue
		m["pending"] = float(m["pending"]) - dt
		if float(m["pending"]) > 0.0:
			continue
		m["pending"] = 0.0
		m["frame"] = BURST
		_show(m)
		# (its shards across the floor before it, hurting all in them; it cracks those beside it)
		var f := Vector2(float(m["x"]) + float(m["fx"]) * 0.6, float(m["y"]) + float(m["fy"]) * 0.6)
		main.sfx.play("break_glass", linear_to_db(0.85))
		main.fx.event({"t": "spark", "x": f.x, "y": f.y, "el": "phys", "n": 16})
		main.fx.event({"t": "spark", "x": f.x + float(m["fx"]) * 1.2, "y": f.y + float(m["fy"]) * 1.2, "el": "phys", "n": 10})
		var h = main.hero
		if h.alive and in_shards(m, h.world) and h._act != "lunge" and h._invuln <= 0.0:
			h.hurt_by(h.max_life * float(MIRROR["hero"]), "phys", [], {}, null, f)
		if main._monsters != null:
			for q in main._monsters.list:
				if is_instance_valid(q) and not q.dead and not q.boss and in_shards(m, q.world):
					q.hurt(maxf(1.0, roundf(q.max_life * float(MIRROR["mob"]))))
		strike(f, float(MIRROR["chain"]) - float(MIRROR["near"]))
