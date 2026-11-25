## THE RANGER'S COMPANIONS (game/companions.ts; game.ts petsWanted, petBeside, pickCompanion, pickCollarCompanion, updatePets, stepPet,
## petBite; render/render.ts drawPets): on in the released game. Two talents on his tree, one on each feather: the HUNTING COMPANION
## (a hawk, a snake or a wolf) and the WILD COMPANION (a bat, a fox or a tortoise); each brings one of its three, the one picked (in
## town, on its card on the TALENTS page; the first of the three until then). It keeps by him, goes for an enemy awake near him and
## bites it, and each bite does what one of his words does: the hawk's marks it (Precise: his next hit on it a certain critical),
## the snake's poisons it, the wolf's holds it in place a moment (Binding), the bat's heals him a little (Leeching), the fox's gives
## him a burst of speed (Swift), the tortoise's a brief shield (Guarding; it keeps close by him). A bite is a share of his own hit.
## Nothing fights them. Left far behind, one is at his side again. His Rally, faster and harder while it lasts. THE PACK COLLAR (a
## unique, the Ranger's own amulet): one more, of a list of his companion talents' (the hunting list with neither), never one he
## has out, picked on its card in town; until picked the next in the list after his own.
## Their pictures the art chat's, baked by the game's own baker (tools/godot_companions.mjs: assets/companions); drawn as the game
## draws them: from in front or behind as it faces, mirrored for the screen's left, standing, going (frames by the ground covered),
## biting; a soft shadow; coming in over a third of a second.
## The picks are kept with his talents' picks (hero.gd `picks`: "pet:hunt", "pet:wild", "pet:collar"), so a save keeps them.
extends Node

const Iso := preload("res://scripts/iso.gd")
const Words := preload("res://scripts/words.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const DIR := "res://assets/companions"
const GROUPS := ["hunt", "wild"]

var main
var hero
var D := {}
var _figures := {}
## Those out: {kind, group, at, f, act, act_t, did, target, cd, walked, seat, sprite}
var pets: Array = []
var _clock := 0.0
var told: Array = []


func _ready() -> void:
	D = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/companions.json"))


func _art(kind: String):
	if not _figures.has(kind):
		_figures[kind] = BakedFigure.new(DIR, kind, D["lists"])
	return _figures[kind]


func _says(e: Dictionary) -> void:
	told.append(e)
	if told.size() > 64:
		told.pop_front()


# --- the picks ---

## (companions.ts pickedIn) The kind picked for a group: the one picked if it is of that group, else the first of its three.
func picked_in(group: String) -> String:
	var kinds: Array = D["groups"][group]["kinds"]
	var p = hero.picks.get("pet:" + group)
	return str(p) if p != null and kinds.has(p) else str(kinds[0])


func groups_taken() -> Array:
	return GROUPS.filter(func(g): return hero.talents.has(D["groups"][g]["talent"]))


## (companions.ts collarChoices) What the Pack Collar's companion may be: of the lists of his companion talents (none: the hunting
## list), never one of his own picks.
func collar_choices() -> Array:
	if hero.cls != "ranger":
		return []
	var gs := groups_taken()
	var own: Array = gs.map(func(g): return picked_in(g))
	var out: Array = []
	for g in (gs if not gs.is_empty() else ["hunt"]):
		for k in D["groups"][g]["kinds"]:
			if not own.has(k):
				out.append(k)
	return out


## (companions.ts collarPick) The Pack Collar's companion: the one picked on it while it may be; else the next after his first pick.
func collar_pick() -> String:
	var can := collar_choices()
	var c = hero.picks.get("pet:collar")
	if c != null and can.has(c):
		return str(c)
	var gs := groups_taken()
	if gs.is_empty():
		return str(D["groups"]["hunt"]["kinds"][0])
	var kinds: Array = D["groups"][gs[0]]["kinds"]
	return str(kinds[(kinds.find(picked_in(gs[0])) + 1) % kinds.size()])


func _group_of(kind: String) -> String:
	return "hunt" if (D["groups"]["hunt"]["kinds"] as Array).has(kind) else "wild"


## (game.ts pickCompanion) Pick `kind` for its group: in town only, the talent that brings it taken. "" if picked, else why not.
func pick(kind: String) -> String:
	if hero.cls != "ranger":
		return "Not yours"
	if not _in_town():
		return "Choose companion in town"
	var g := _group_of(kind)
	if not hero.talents.has(D["groups"][g]["talent"]):
		return "Take its talent first"
	hero.picks["pet:" + g] = kind
	# (the one let go goes, its picture with it: left, it stood frozen where it was till he left, one more with each pick; the bug
	# hunt's fourth round, 25 Nov 2026)
	for p in pets:
		if p["group"] == g and p["seat"] < 2 and p["sprite"] != null and is_instance_valid(p["sprite"]):
			p["sprite"].queue_free()
	pets = pets.filter(func(p): return p["group"] != g or p["seat"] >= 2)
	hero.sfx.play("trapSet", linear_to_db(0.4))
	return ""


## (game.ts pickCollarCompanion) The Pack Collar's companion picked (in town only).
func pick_collar(kind: String) -> String:
	if not _in_town():
		return "Choose companion in town"
	if not collar_choices().has(kind):
		return "Not that one"
	hero.picks["pet:collar"] = kind
	hero.sfx.play("trapSet", linear_to_db(0.4))
	return ""


func _in_town() -> bool:
	return main != null and main.is_home(main.place)


# --- each step ---

## (game.ts petsWanted) The kinds he should have out now: one for each companion talent taken; the Pack Collar's, one more.
func wanted() -> Array:
	if hero.cls != "ranger":
		return []
	var want: Array = []
	for g in groups_taken():
		want.append({"group": g, "kind": picked_in(g)})
	if hero.uniques != null and hero.uniques.wears("packcollar"):
		var k := collar_pick()
		want.append({"group": _group_of(k), "kind": k})
	return want


## (game.ts petSpot) Where companion `seat` keeps by him, `back` behind: the hunting one at his right, the wild at his left, the
## Pack Collar's behind him.
func _spot(seat: int, back: float) -> Vector2:
	var near: float = D["tune"]["near"]
	var side := (1.0 if seat == 0 else (-1.0 if seat == 1 else 0.0)) * near
	if seat >= 2:
		back += near
	var f: Vector2 = hero.face
	return Vector2(hero.world.x - f.y * side - f.x * back, hero.world.y + f.x * side - f.y * back)


func _beside(kind: String, group: String, seat: int) -> Dictionary:
	var s := _spot(seat, 0.4)
	var at: Vector2 = s if hero.monsters != null and hero.monsters.clear(s.x, s.y, 0.25) else hero.world
	hero._tell({"t": "petArrive", "kind": kind, "x": at.x, "y": at.y})
	_says({"what": "arrive", "kind": kind})
	return {"kind": kind, "group": group, "at": at, "f": hero.face, "act": "arrive", "act_t": 0.0, "did": false, "target": null, "cd": 0.0,
		"walked": 0.0, "seat": seat, "sprite": null}


func _process(dt: float) -> void:
	_clock += dt
	if hero == null:
		return
	var out: bool = hero.alive and hero.map != null and hero.monsters != null and is_instance_valid(hero.monsters)
	var want: Array = wanted() if out else []
	var keep: Array = []
	for p in pets:
		if want.any(func(w): return w["group"] == p["group"] and w["kind"] == p["kind"]):
			keep.append(p)
		elif p["sprite"] != null and is_instance_valid(p["sprite"]):
			p["sprite"].queue_free()
	pets = keep
	# (each wanted one its place, those kept moved to theirs: the collar's wolf picked as his hunting companion kept the place behind
	# him, the collar's new one took it too, the two on one spot and his right side empty; the bug hunt's fourth round)
	var placed: Array = []
	for n in want.size():
		var w: Dictionary = want[n]
		# (the Pack Collar's may be a second of the same group: it keeps the third place)
		var first := -1
		for q in want.size():
			if want[q]["group"] == w["group"]:
				first = q
				break
		var seat: int = 2 if n >= 2 or first != n else (0 if w["group"] == "hunt" else 1)
		var found := -1
		for k in pets.size():
			if not placed.has(k) and pets[k]["group"] == w["group"] and pets[k]["kind"] == w["kind"]:
				found = k
				break
		if found >= 0:
			pets[found]["seat"] = seat
			placed.append(found)
			continue
		pets.append(_beside(w["kind"], w["group"], seat))
		placed.append(pets.size() - 1)
	for p in pets:
		_step(p, dt)
		_show(p)


## (game.ts stepPet) Companion `p`, each step.
func _step(p: Dictionary, dt: float) -> void:
	var C: Dictionary = D["tune"]
	var K: Dictionary = C["kinds"][p["kind"]]
	p["act_t"] = float(p["act_t"]) + dt
	# (THE RANGER'S RALLY: his companions' waits run out faster while it lasts)
	var rally: bool = hero.kit != null and float(hero.kit.get("rally_t") if hero.kit.get("rally_t") != null else 0.0) > 0.0
	p["cd"] = maxf(0.0, float(p["cd"]) - dt * (1.0 + float(D["rally"]["atk"]) / 100.0 if rally else 1.0))
	# (left far behind, or somewhere it may not stand: at his side again)
	var at: Vector2 = p["at"]
	if at.distance_to(hero.world) > float(C["lost"]) or not hero.monsters.clear(at.x, at.y, 0.2):
		var q := _beside(p["kind"], p["group"], int(p["seat"]))
		p["at"] = q["at"]
		p["act"] = "arrive"
		p["act_t"] = 0.0
		return
	if p["act"] == "arrive":
		if float(p["act_t"]) >= 0.3:
			p["act"] = "stand"
		return
	if p["act"] == "bite":
		if not p["did"] and float(p["act_t"]) >= float(C["bite"]["hit"]):
			p["did"] = true
			var m = p["target"]
			if m != null and is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(K["reach"]) + m.r + 0.6:
				_bite(p, m)
		if float(p["act_t"]) >= float(C["bite"]["long"]):
			p["act"] = "stand"
			p["act_t"] = 0.0
			p["cd"] = float(K["every"])
		return
	# STANDING OR GOING: what to go for (awake, near him, seen by it; the tortoise only what is near him)
	var leash: float = float(C["tortoiseLeash"]) if p["kind"] == "tortoise" else float(C["leash"])
	var best = null
	var bd := 1e9
	for m in hero.monsters.list:
		if not is_instance_valid(m) or m.dead or not m.seen or m.state == "sleep" or hero.monsters.shut_in(m):
			continue
		if m.world.distance_to(hero.world) > leash:
			continue
		var d: float = m.world.distance_to(at) - m.r
		if d < bd and hero.monsters.sees(at, m.world):
			bd = d
			best = m
	if best != null and bd <= float(K["reach"]) and float(p["cd"]) <= 0.0:
		_face(p, best.world)
		p["act"] = "bite"
		p["act_t"] = 0.0
		p["did"] = false
		p["target"] = best
		return
	var goal: Vector2
	var stop: float
	if best != null and bd > float(K["reach"]) * 0.8:
		goal = best.world
		stop = float(K["reach"]) * 0.6 + best.r
	elif best != null:
		_face(p, best.world)
		goal = at
		stop = 1.0
	else:
		goal = _spot(int(p["seat"]), 0.5)
		stop = 0.35
	var d := goal.distance_to(at)
	if d > stop:
		var to: Vector2 = at + (goal - at) / d * minf(d - stop, float(C["speed"]) * dt)
		var moved := 0.0
		if hero.map != null:
			to = hero.map.slide(at, 0.25, to - at)
		moved = to.distance_to(at)
		if moved > 0.001:
			p["f"] = (to - at) / moved
		p["at"] = to
		p["walked"] = float(p["walked"]) + moved
		p["act"] = "walk" if moved > 0.001 else "stand"
	else:
		p["act"] = "stand"
		if best == null:
			p["f"] = hero.face


func _face(p: Dictionary, to: Vector2) -> void:
	var d: Vector2 = to - p["at"]
	if d.length() > 0.05:
		p["f"] = d.normalized()


## (game.ts petBite) A companion's bite landing on `m`: a share of his own hit (none of his words), and what its kind's word does.
func _bite(p: Dictionary, m) -> void:
	var K: Dictionary = D["tune"]["kinds"]
	var st: Dictionary = hero.stats
	var rally: bool = hero.kit != null and float(hero.kit.get("rally_t") if hero.kit.get("rally_t") != null else 0.0) > 0.0
	var dmg: float = randf_range(float(st["dmg_min"]), float(st["dmg_max"])) * float(K[p["kind"]]["share"]) * (1.0 + (float(st["dmg_pct"]) + float(st["phys_pct"]) + hero.might) / 100.0) * (1.0 + float(D["rally"]["dmg"]) / 100.0 if rally else 1.0)
	var crit: bool = randf() * 100.0 < float(st["crit_chance"])
	if crit:
		dmg *= 1.0 + float(st["crit_mult"]) / 100.0
	dmg = hero.side(m, maxf(1.0, roundf(dmg)))
	var mat: Vector2 = m.world
	hero._tell({"t": "petBite", "kind": p["kind"], "id": m.id, "x": mat.x, "y": mat.y, "dx": p["f"].x, "dy": p["f"].y})
	hero.sfx.play("hit", linear_to_db(0.45))
	m.damage(dmg, "phys", crit, false, [], false, false, 0)
	_says({"what": "bite", "kind": p["kind"]})
	match p["kind"]:
		"hawk":
			if not m.dead:
				m.mark_t = float(D["mark"])
				hero._tell({"t": "markOn", "id": m.id, "x": mat.x, "y": mat.y, "secs": D["mark"]})
		"snake":
			m.dose(dmg * float(K["snake"]["dose"]))
		"wolf":
			var held: float = hero.city.bind_monster(m, float(K["wolf"]["hold"])) if hero.city != null else 0.0
			if held > 0.0:
				hero._tell({"t": "bind", "id": m.id, "m": m, "secs": held})
		"bat":
			var n: float = dmg * float(K["bat"]["heal"])
			hero.heal_flat(n)
			hero._tell({"t": "leech", "x": mat.x, "y": mat.y, "n": n})
		"fox":
			hero.haste = maxf(hero.haste if hero.haste_t > 0.0 else 0.0, float(K["fox"]["haste"]))
			hero.haste_t = maxf(hero.haste_t, float(K["fox"]["secs"]))
			hero._tell({"t": "buff", "kind": "haste", "x": hero.world.x, "y": hero.world.y, "stacks": 1})
		_:
			hero.shield = maxf(hero.shield, roundf(hero.max_life * float(K["tortoise"]["shield"])))
			hero.shield_t = maxf(hero.shield_t, float(D["guard"]))
			hero._tell({"t": "shield", "x": hero.world.x, "y": hero.world.y, "secs": D["guard"]})


# --- its picture (render/render.ts drawPets) ---

func _show(p: Dictionary) -> void:
	var st = hero.monsters.get("stands") if hero.monsters != null else null
	if st == null or not is_instance_valid(st):
		return
	var s = p["sprite"]
	if s == null or not is_instance_valid(s) or s.get_parent() != st:
		s = _PetSprite.new()
		s.centered = false
		s.shadow = float(D["shadow"][p["kind"]]) / 45.0
		st.add_child(s)
		p["sprite"] = s
	var art = _art(p["kind"])
	var f: Vector2 = p["f"]
	var list := "idle"
	var i := 0
	if p["act"] == "bite" and art.has("attack"):
		list = "attack"
		i = clampi(floori(float(p["act_t"]) * art.fps("attack") + 1e-6), 0, art.count(0, "attack") - 1)
	elif p["act"] == "walk" and art.has("walk"):
		list = "walk"
		var n: int = art.count(0, "walk")
		i = floori(float(p["walked"]) / float(D["stride"][p["kind"]]) * n) % maxi(1, n)
	else:
		i = floori(_clock * art.fps("idle")) % maxi(1, art.count(0, "idle"))
	var fr: Dictionary = art.frame(f.x, f.y, list, i)
	if fr.is_empty() or fr.get("tex") == null:
		return
	var at: Vector2 = p["at"]
	var come := clampf(float(p["act_t"]) / 0.3, 0.0, 1.0) if p["act"] == "arrive" else 1.0
	s.texture = fr["tex"]
	s.offset = fr["offset"]
	s.flip_h = fr["flip"]
	s.scale = Vector2.ONE * float(fr["scale"])
	s.position = Iso.to_screen(at.x, at.y) + Vector2(0.0, 0.015 * 16.0)
	s.offset.y -= 0.015 * 16.0 / float(fr["scale"])
	s.modulate = Color(1, 1, 1, come)
	s.come = come


## A companion's picture, a soft shadow under it (render.ts ellipse, COMP_SHADOW), drawn behind it.
class _PetSprite extends Sprite2D:
	var shadow := 0.2
	var come := 1.0
	var _under: _Shadow

	func _ready() -> void:
		_under = _Shadow.new()
		_under.pet = self
		_under.show_behind_parent = true
		add_child(_under)

	func _process(_dt: float) -> void:
		if _under != null:
			_under.queue_redraw()


class _Shadow extends Node2D:
	var pet

	func _draw() -> void:
		var sc: Vector2 = pet.scale
		var y0: float = -0.015 * 16.0 / sc.y
		var pts := PackedVector2Array()
		for k in 16:
			var a := TAU * k / 16.0
			pts.append(Vector2(cos(a) * pet.shadow * 45.2 / sc.x, y0 + sin(a) * pet.shadow * 22.6 / sc.y))
		draw_colored_polygon(pts, Color(0, 0, 0, 0.26 * pet.come))
