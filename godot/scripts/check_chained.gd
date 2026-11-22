## THE CHAINED RARE (chained_rare.gd): `--only=chained --shots=<dir>`. Floors 1 to 6 of the story, the ring lit: none on 1 or 6, one
## on each of 2 to 5, a rare alone (his yellow name, his words, a bonus word not one of his over his head, in an ordinary room, three
## stakes). On floor 4: left alone he never wakes, beside the hero or as the floor round him wakes, and nothing of the hero's reaches
## him; by him the prompt; a touch on him is no blow but an errand, which walks the hero to him and breaks his chains; then he fights,
## is struck, and killed leaves the bonus word. Before the ring is lit, none. Endless levels on floors 1 and 3: one each (three words
## at an endless level's depth), and on floor 1 his word falls too; endless on floor 6, none. Pictures: held, heaving, snapping, free.
extends RefCounted

const CR := preload("res://scripts/chained_rare.gd")
const FloorMap := preload("res://scripts/floor_map.gd")

var M
var h
var dir := ""
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CHAINED %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _go(where: String) -> void:
	await M.go_to(where, "start")
	await _wait(0.8)
	if M.sight != null:
		M.sight.see_all()


## The hero set down `r` tiles from `at`, on floor, toward where he can see it.
func _beside(at: Vector2, r: float) -> bool:
	for rr in [r, r + 0.5, r - 0.4, r + 1.0]:
		for k in 16:
			var p: Vector2 = at + Vector2(cos(k * TAU / 16.0 + 0.4), sin(k * TAU / 16.0 + 0.4)) * rr
			if h._clear(p.x, p.y) and M._monsters.sees(at, p):
				h.world = p
				h.face = (at - p).normalized()
				h._place()
				return true
	return false


## The floor's other monsters put away (for the pictures and the fight), but those named in `keep`.
func _clear_floor(keep: Array) -> void:
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not keep.has(o):
			o.world = Vector2(-400, -400)
			o.state = "sleep"
			o._place()


func _about(cr) -> String:
	var r = cr.m
	return "%s (%s), words %s, over his head %s, life %d, at (%.1f, %.1f)" % [r.title, r.kind, r.words, r.carries, int(r.max_life), r.world.x, r.world.y]


func _room_of(p: Vector2) -> Dictionary:
	for q in M.map.rooms:
		if FloorMap.in_room(q, p):
			return q
	return {}


func _words_dropped() -> Array:
	var out: Array = []
	for d in M.loot._drops:
		if str(d.get("kind", "")) == "word":
			out.append(str(d["word"]))
	return out


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	M.loot.ring_lit = true
	M.chained_seed = 7
	# THE STORY'S FLOORS
	for f in [1, 2, 3, 4, 5, 6]:
		await _go("floor%d" % f)
		var cr = M.chained_rare
		if f == 1 or f == 6:
			_line(cr == null, "floor %d of the story: %s" % [f, "no chained rare" if cr == null else "one: " + _about(cr)])
			continue
		if cr == null:
			_line(false, "floor %d: no chained rare laid" % f)
			continue
		var r = cr.m
		var els: Array = r.words.filter(func(w): return w in ["fire", "frost", "lightning"])
		var q := _room_of(r.world)
		_line(r.chained == 1 and r.state == "sleep" and r.elite and r.rarity == "leader" and r.pack_id == CR.PACK and r.words.size() == 2 and els.size() <= 1,
			"floor %d: %s; held %s, a rare alone (elite %s, %s, pack %d)" % [f, _about(cr), r.chained == 1, r.elite, r.rarity, r.pack_id])
		_line(r.carries == [cr.bonus] and not r.words.has(cr.bonus) and M.loot.words_found_at(M.loot.power()).has(cr.bonus),
			"floor %d: the bonus word %s, one of the floor's own, not one of his" % [f, cr.bonus])
		_line(str(q.get("kind", "")) == "normal" and cr.stakes.size() == 3 and r.world.distance_to(M.map.start) >= 12.0,
			"floor %d: in room %s (%s, %s), %.1f tiles from where he comes in; stakes %s" % [f, q.get("id", "-"), q.get("kind", "-"), "off the way" if int(q.get("path", 0)) < 0 else "on the way", r.world.distance_to(M.map.start), cr.stakes])
		# (his life an elite's alone: his kind's leader's on this floor, times 4 / 3, Power's made his)
		var lead = null
		for o in M._monsters.list:
			if is_instance_valid(o) and o != r and o.kind == r.kind and o.rarity == "leader":
				lead = o
				break
		if lead != null:
			var k: float = (1.3 if r.words.has("power") else 1.0) / (1.3 if lead.words.has("power") else 1.0)
			var want: float = lead.max_life * 4.0 / 3.0 * k
			_line(absf(r.max_life - want) <= 1.0, "floor %d: his life %d, a %s leader's here %d (%s): times 4/3 and his Power, %.0f" % [f, int(r.max_life), lead.kind, int(lead.max_life), lead.words, want])
		if f == 2:
			_clear_floor([r])
			_beside(r.world, 3.0)
			await _wait(1.0)
			await M._snap(dir + "/chained_floor2.png")
	# FLOOR 4 IN DETAIL
	await _go("floor4")
	var cr = M.chained_rare
	if cr == null:
		_line(false, "floor 4 again: none")
		_end()
		return
	var r = cr.m
	var life0: float = r.life
	# (left alone: the hero beside him 3 s, the floor round him woken)
	_beside(r.world, 1.6)
	for o in M._monsters.list:
		if is_instance_valid(o) and o != r and not o.dead and o.world.distance_to(r.world) < 14.0:
			M._monsters.wake(o)
	M._monsters.wake(r)
	r.wake_up()
	await _wait(3.0)
	_line(r.chained == 1 and r.state == "sleep" and cr.held(), "beside him 3 s, the floor round him woken, called to wake: still held, %s" % r.state)
	_clear_floor([r])
	await _wait(0.3)
	# (nothing of his reaches him)
	_beside(r.world, 1.2)
	var face: Vector2 = (r.world - h.world).normalized()
	var picked = M._monsters.strike_target(h.world, face, 2.0)
	var blasted: int = M._monsters.blast(r.world, 2.0, func(): return 1.0)
	r.damage(50.0)
	r.hurt(50.0)
	for i in 3:
		h.face = face
		h.auto_attack = true
		await _wait(0.9)
	_line(picked != r and blasted == 0 and r.life == life0 and M._monsters.shut_in(r), "out of reach while held: a blow at him picks %s, a blast round him strikes %d, three Strikes and a blow on him: life %d of %d" % ["him" if picked == r else "none", blasted, int(r.life), int(life0)])
	# (the prompt by him, and none further off)
	_beside(r.world, 2.0)
	await _wait(0.2)
	var near: Array = M.prompt()
	_beside(r.world, 4.0)
	await _wait(0.2)
	var far: Array = M.prompt()
	_line(near == ["E: Break the chains", "chained"] and far[0] != "E: Break the chains", "by him (2 tiles) the prompt %s; 4 tiles off %s" % [near, far])
	# (pictures: held, and heaving at his chains)
	_beside(r.world, 3.0)
	await _wait(0.6)
	await M._snap(dir + "/chained_held.png")
	cr._heave = CR.HEAVE * 0.5
	await M._snap(dir + "/chained_heave.png")
	_line(r.tug.length() > 0.0, "heaving at his chains, his picture pulled %s toward the hero" % r.tug)
	# (a touch on him: no blow, an errand to him)
	await _wait(0.8)
	var T = M._touch
	var p: Vector2 = T.to_view(r.world) + Vector2(0, -14)
	var on_him = T._monster_at(p)
	var spot: Dictionary = T._spot_at(p)
	_line(on_him == null and str(spot.get("kind", "")) == "chained", "a touch on him: the monster under it %s, what is used there '%s'" % ["him" if on_him == r else str(on_him), spot.get("kind", "")])
	_beside(r.world, 5.5)
	await _wait(0.3)
	var was_on: bool = T.on
	T.on = true
	p = T.to_view(r.world) + Vector2(0, -14)
	T._poke = p
	T._tap = p
	await M.get_tree().process_frame
	var asked: Array = T.asked.duplicate()
	var t := 0.0
	while cr.phase == "held" and t < 8.0:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	var walked: float = h.world.distance_to(r.world)
	_line(asked.size() > 0 and asked[0] == "errand" and cr.phase == "breaking", "touched from 5.5 tiles: %s; walked to %.1f tiles of him in %.1f s, his chains %s" % [asked, walked, t, cr.phase])
	await _wait(0.12)
	await M._snap(dir + "/chained_snap.png")
	T.on = was_on
	await _wait(CR.BREAK)
	_line(cr.phase == "free" and r.chained == 2 and r.state != "sleep" and not M._monsters.shut_in(r), "his chains broken: %s, %s, in the fight %s" % [cr.phase, r.state, not M._monsters.shut_in(r)])
	await _wait(0.6)
	await M._snap(dir + "/chained_free.png")
	var before: float = r.life
	r.damage(10.0)
	_line(r.life < before, "free, a blow reaches him: life %d to %d" % [int(before), int(r.life)])
	var dropped0 := _words_dropped().size()
	r.damage(r.life + r.shield + 10.0)
	await _wait(0.4)
	var dropped := _words_dropped()
	_line(r.dead and dropped.size() == dropped0 + 1 and dropped.has(cr.bonus), "killed, he leaves %s (the word over his head %s)" % [dropped.slice(dropped0), cr.bonus])
	# BEFORE THE RING IS LIT: none
	M.loot.ring_lit = false
	await _go("floor3")
	_line(M.chained_rare == null, "floor 3 before the ring is lit: %s" % ("none" if M.chained_rare == null else "one"))
	M.loot.ring_lit = true
	# ENDLESS LEVELS
	for f in [1, 3, 6]:
		M.endless = 1
		M.endless_floor = f
		M.in_endless = true
		await _go("floor%d" % f)
		var ce = M.chained_rare
		if f == 6:
			_line(ce == null, "endless on floor 6: %s" % ("none" if ce == null else "one"))
			continue
		if ce == null:
			_line(false, "endless on floor %d: none" % f)
			continue
		var e = ce.m
		_line(e.chained == 1 and e.words.size() >= 3 and e.carries == [ce.bonus], "endless on floor %d (depth %d): %s" % [f, M.loot.power(), _about(ce)])
		if f == 1:
			_beside(e.world, 1.8)
			ce.unchain()
			await _wait(CR.BREAK + 0.2)
			var w0 := _words_dropped().size()
			e.damage(e.life + e.shield + 10.0)
			await _wait(0.4)
			var w1 := _words_dropped()
			_line(e.dead and w1.size() == w0 + 1 and w1.has(ce.bonus) and not M.loot.words_fall(), "endless floor 1, where no other word falls (%s): freed and killed he leaves %s" % [M.loot.words_fall(), w1.slice(w0)])
	M.in_endless = false
	_end()


func _end() -> void:
	print("CHAINED: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE FILM (`--only=chained_film --shots=<dir>`, run with `--fixed-fps 30`): floor 4's rare, seen, heaving at his chains, touched,
## his chains snapping, free and fighting, killed and his word falling and taken; each frame to <dir>/film/NNNN.png.
func film(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d + "/film"
	DirAccess.make_dir_recursive_absolute(dir)
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	M.loot.ring_lit = true
	M.chained_seed = 7
	await _go("floor4")
	var cr = M.chained_rare
	if cr == null:
		print("CHAINED FILM: none on floor 4")
		return
	var r = cr.m
	_clear_floor([r])
	_beside(r.world, 6.5)
	cr.told = false
	cr._heave_in = 1.2
	await _wait(0.4)
	var k := 0
	k = await _frames(k, 2.6)
	var T = M._touch
	var was_on: bool = T.on
	T.on = true
	var p: Vector2 = T.to_view(r.world) + Vector2(0, -14)
	T._poke = p
	T._tap = p
	var t := 0.0
	while cr.phase == "held" and t < 3.0:
		k = await _frames(k, 1.0 / 30.0)
		t += 1.0 / 30.0
	k = await _frames(k, 2.4)
	T.on = was_on
	r.damage(r.life + r.shield + 10.0)
	k = await _frames(k, 2.6)
	print("CHAINED FILM: %d frames, the word now his: %s" % [k, M.loot.words.get(cr.bonus, 0)])


func _frames(k: int, secs: float) -> int:
	var t := 0.0
	while t < secs - 0.001:
		await M.get_tree().process_frame
		await RenderingServer.frame_post_draw
		M.get_viewport().get_texture().get_image().save_png("%s/%04d.png" % [dir, k])
		k += 1
		t += M.get_process_delta_time()
	return k
