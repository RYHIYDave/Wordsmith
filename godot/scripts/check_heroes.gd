## THE CHECK OF THE OTHER HEROES (--only=heroes --cls=<class>; main.gd's shot mode sends it here): on floor 2, a few of its skeletons
## held where they stand, the hero of that class makes each of his three moves at them, and what the game's rules make of it is seen:
## a line a step (OK or WRONG), pictured as it goes; then the sum, HEROES.
##   THE RANGER: his Shot (an arrow loosed at the nearest, flying, striking it; again by his attack rate), his Volley (the arrows up,
##   coming down round where he aimed, each striking what stands within its reach), his Trap (his roll, nothing reaching him; the
##   trap left where it began, armed, bursting as one comes onto it), and his pictures through each.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var shot := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("HEROES %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/h%02d_%s.png" % [dir, shot, name])


func _run(secs: float, until := Callable(), keep := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		if keep.is_valid():
			keep.call()
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


## A monster held where it stands, awake, doing nothing (and not moving: what is aimed at it goes where it is, game/lock.ts
## leadPoint).
static func _hold(m) -> void:
	if not is_instance_valid(m) or m.dead:
		return
	m.speed = 0.0
	m.state = "recover"
	m._t = 1e9
	m._cd = 1e9


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor2", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	h.walked = 5.0
	print("HEROES: the %s, %s; his moves %s" % [h.cls, "his own kit" if h.kit != null else "the Warrior's", h.loadout.r(0)["name"] + ", " + h.loadout.r(1)["name"] + ", " + h.loadout.r(2)["name"]])
	if h.cls == "ranger":
		await _ranger()
	elif h.cls == "mage":
		await _mage()
	# (every hero: what is drawn with him, the pool of light behind him and his scarf, feather or braids; and in town his own look)
	await _looks()
	print("HEROES: the %s, %d steps, %d as the game's%s" % [h.cls, n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## Three skeletons of the floor, the rest gone, set out before him: [A (5 tiles before him), B and C beside each other further on].
func _pack(at: Vector2, way: Vector2) -> Array:
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "skeleton" and not m.elite and not m.boss:
			near.append(m)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(at) < b.world.distance_to(at))
	var keep := near.slice(0, 3)
	for o in M._monsters.list:
		if is_instance_valid(o) and not keep.has(o):
			o.queue_free()
	return keep


func _ranger() -> void:
	var K = h.kit
	# (a hall with room: before him, open floor 7 tiles on)
	var home: Vector2 = h.world
	var way := Vector2(1, 0)
	for a in 16:
		var w := Vector2(cos(a * PI / 8.0), sin(a * PI / 8.0))
		var clear := true
		for s in range(1, 9):
			var p: Vector2 = home + w * s
			if not h._clear(p.x, p.y):
				clear = false
				break
		if clear:
			way = w
			break
	var pack := _pack(home, way)
	if pack.size() < 3:
		_line(false, "floor 2 has no three skeletons to set out")
		return
	var A = pack[0]
	var B = pack[1]
	var C = pack[2]
	var put := func(m, at: Vector2) -> void:
		m.world = at
		m._place()
		_hold(m)
	put.call(A, home + way * 5.0)
	put.call(B, home + way * 30.0)
	put.call(C, home + way * 31.0 + Vector2(-way.y, way.x))
	h._turn(way)
	await _run(0.3, Callable(), func(): for m in pack: _hold(m))
	# SHOT: at the nearest, again and again by his attack rate
	var life0: float = A.life
	var shots_seen := 0
	var list_seen := -1
	h.auto_attack = true
	var flew: bool = await _run(1.0, func(): return not K.shots.is_empty(), func():
		h.auto_attack = true
		for m in pack: _hold(m))
	shots_seen = K.shots.size()
	var pic: Array = K.picture(h._side)
	list_seen = int(pic[0]) if not pic.is_empty() else -1
	await _snap("ranger_shot_flying")
	await _run(1.6, Callable(), func():
		h.auto_attack = true
		for m in pack: _hold(m))
	var used: int = h.uses[0]
	var rate: float = float(h.loadout.r(0)["rate"])
	await _snap("ranger_shot_struck")
	_line(flew and A.life < life0 and used >= 2 and (list_seen == 14 or (list_seen >= 15 and list_seen <= 18)),
		"Shot: an arrow loosed at the nearest (%d in flight; his picture list %d), striking it (%.0f to %.0f life); %d loosed in about 2.6 s at %.2f a second" % [shots_seen, list_seen, life0, A.life, used, rate])
	# VOLLEY: the arrows up, and down round where he aimed
	h.auto_attack = false
	put.call(A, home + way * 30.0 + Vector2(way.y, -way.x))
	put.call(B, home + way * 6.0)
	put.call(C, home + way * 6.5 + Vector2(-way.y, way.x) * 0.8)
	await _run(0.6, Callable(), func(): for m in pack: _hold(m))
	var b0: float = B.life
	var c0: float = C.life
	h.auto_whirl = true
	var up: bool = await _run(1.0, func(): return not K.volleys.is_empty(), func(): for m in pack: _hold(m))
	await _run(0.7, Callable(), func(): for m in pack: _hold(m))
	await _snap("ranger_volley_falling")
	await _run(2.4, Callable(), func(): for m in pack: _hold(m))
	await _snap("ranger_volley_after")
	var falls: int = roundi(float(K.T["tune"]["volleyLife"]) / float(K.T["tune"]["volleyEvery"]))
	_line(up and B.life < b0 and C.life < c0 and K.volleys.is_empty() and K.charges[1] == 0,
		"Volley: up from the bow, coming down round where he aimed (%d arrows over %.1f s): both there struck (%.0f to %.0f, %.0f to %.0f); its wait begun" % [falls, float(K.T["tune"]["volleyLife"]), b0, B.life, c0, C.life])
	# TRAP: his roll, nothing reaching him; the trap where it began, bursting as one comes onto it
	put.call(B, home + way * 30.0 + Vector2(-way.y, way.x) * 2.0)
	put.call(C, home + way * 30.0 + Vector2(-way.y, way.x) * 3.0)
	h.world = home
	h._place()
	await _run(0.3)
	var start: Vector2 = h.world
	var charges0: int = K.charges[2]
	h.auto_lunge = home + way * 3.0
	var rolled: bool = await _run(0.1, func(): return not K.move.is_empty())
	var pic2: Array = K.picture(h._side)
	var untouchable: bool = h._invuln > 0.0 and h._act == "lunge"
	await _snap("ranger_rolling")
	await _run(0.4)
	var laid: bool = K.traps.size() == 1 and Vector2(K.traps[0]["x"], K.traps[0]["y"]).distance_to(start) < 0.05
	var away: float = h.world.distance_to(start)
	await _run(0.3)
	await _snap("ranger_trap_lying")
	var a0: float = A.life
	put.call(A, start + way * 0.6)
	var burst: bool = await _run(1.0, func(): return K.traps.is_empty(), func(): _hold(A))
	await _run(0.15)
	await _snap("ranger_trap_burst")
	_line(rolled and untouchable and not pic2.is_empty() and int(pic2[0]) == 40 and away > 2.0 and laid and burst and A.life < a0 and K.charges[2] == charges0 - 1,
		"Trap: his roll (%.1f tiles, nothing reaching him, his rolling picture); the trap left where it began; one come onto it, it bursts (%.0f to %.0f); a charge spent (%d of 2 left) [rolled %s, untouchable %s, picture %s, laid %s, burst %s]" % [away, a0, A.life, K.charges[2], rolled, untouchable, pic2, laid, burst])


## A clear way out from where he stands (a hall with room: open floor 8 tiles on).
func _open_way(home: Vector2) -> Vector2:
	for a in 16:
		var w := Vector2(cos(a * PI / 8.0), sin(a * PI / 8.0))
		var clear := true
		for st in range(1, 9):
			var p: Vector2 = home + w * st
			if not h._clear(p.x, p.y):
				clear = false
				break
		if clear:
			return w
	return Vector2(1, 0)


## THE MAGE: her Wave (through two in a line, each once), her Orb (set where she aims, its waves striking what is round it, gone when
## its time is up, its wait begun), her Warp (out where she aims, at once, nothing reaching her, a burst there hurting what stands
## round; nowhere to go: "No room", nothing spent), her crystal crackling and her power's arcs.
func _mage() -> void:
	var K = h.kit
	var home: Vector2 = h.world
	var way := _open_way(home)
	var side := Vector2(-way.y, way.x)
	var pack := _pack(home, way)
	if pack.size() < 3:
		_line(false, "floor 2 has no three skeletons to set out")
		return
	var A = pack[0]
	var B = pack[1]
	var C = pack[2]
	var put := func(m, at: Vector2) -> void:
		m.world = at
		m._place()
		_hold(m)
	var keep := func(): for m in pack: _hold(m)
	# (the three made hard to kill, that each move may be seen striking them all through)
	for m in pack:
		m.max_life = 1000.0
		m.life = 1000.0
	# WAVE: two in a line before her, the third well aside
	put.call(A, home + way * 2.5)
	put.call(B, home + way * 4.0)
	put.call(C, home + way * 4.0 + side * 6.0)
	h._turn(way)
	await _run(0.4, Callable(), keep)
	var a0: float = A.life
	var b0: float = B.life
	var c0: float = C.life
	h.auto_attack = true
	var went: bool = await _run(1.0, func(): return not K.shots.is_empty(), keep)
	var is_wave: bool = went and K.shots[0].get("look", "") == "wave"
	var pic: Array = K.picture(h._side)
	await _run(0.12, Callable(), keep)
	await _snap("mage_wave_flying")
	var arcs: int = h.fx.wild_mage.arcs.size() if h.fx != null else 0
	await _run(0.8, Callable(), keep)
	_line(went and is_wave and A.life < a0 and B.life < b0 and C.life == c0 and not pic.is_empty() and int(pic[0]) == 14 and arcs > 0,
		"Wave: a wave of force out of the staff (her picture list %s), through the two in its way (%.0f to %.0f, %.0f to %.0f), the one aside untouched (%.0f); her power crackling (%d arcs)" % [pic, a0, A.life, b0, B.life, C.life, arcs])
	# ORB: two together 5 tiles on; set there, its waves strike them, out 4 s, then gone; its wait begun
	put.call(A, home + way * 5.0 + side * 6.0)
	put.call(B, home + way * 5.0)
	put.call(C, home + way * 5.0 + side * 0.9)
	await _run(0.9, Callable(), keep)
	b0 = B.life
	c0 = C.life
	var a1: float = A.life
	h.auto_whirl = true
	var set_down: bool = await _run(1.0, func(): return not K.orbs.is_empty(), keep)
	var o: Dictionary = K.orbs[0] if set_down else {}
	var near_aim: bool = set_down and Vector2(o["x"], o["y"]).distance_to(B.world) < 1.0
	await _run(0.05, Callable(), keep)
	var b1: float = B.life
	await _run(1.3, Callable(), keep)
	await _snap("mage_orb")
	var waves_sent: int = int(o.get("waves", 0))
	var waited: bool = K.charges[1] == 0
	var gone: bool = await _run(4.0, func(): return K.orbs.is_empty(), keep)
	_line(set_down and near_aim and b1 < b0 and B.life < b1 and C.life < c0 and A.life == a1 and waves_sent >= 2 and gone and waited,
		"Orb: set where she aimed (%.2f tiles from it); its first wave struck as it landed (%.0f to %.0f), its next ones after (to %.0f; the other beside it %.0f to %.0f; %d waves by 1.3 s); the one aside untouched; gone when its time was up (%s); its wait begun" % [Vector2(o.get("x", 0.0), o.get("y", 0.0)).distance_to(B.world) if set_down else -1.0, b0, b1, B.life, c0, C.life, waves_sent, gone])
	# WARP: out where she aims, at once, beside the pair; nothing reaching her; the burst hurting them
	put.call(B, home + way * 4.5)
	put.call(C, home + way * 4.5 + side * 0.9)
	h.world = home
	h._place()
	await _run(5.5, func(): return K.charges[2] >= 1, keep)
	await _run(0.2, Callable(), keep)
	b0 = B.life
	c0 = C.life
	var start: Vector2 = h.world
	h.auto_lunge = home + way * 4.0
	var warped: bool = await _run(0.2, func(): return h.world.distance_to(start) > 2.0, keep)
	var at: Vector2 = h.world
	var safe: bool = h._invuln > 0.0
	var phasing: bool = not h._was.is_empty() and h._coming > 0.0
	await _snap("mage_warp")
	await _run(0.4, Callable(), keep)
	_line(warped and at.distance_to(home + way * 4.0) < 0.6 and safe and phasing and B.life < b0 and C.life < c0 and K.charges[2] == 0,
		"Warp: out %.1f tiles on, at once (%.2f from where she aimed), nothing reaching her, coming apart where she was and together there; the burst struck the two round her (%.0f to %.0f, %.0f to %.0f); its charge spent" % [at.distance_to(start), at.distance_to(home + way * 4.0), b0, B.life, c0, C.life])
	# NO ROOM: stood against a wall (a tile that is not floor), aimed through it: nothing happens, nothing spent
	await _run(5.5, func(): return K.charges[2] >= 1)
	var wall := Vector2.INF
	for st in 150:
		var p: Vector2 = home + way * (st * 0.2)
		if not h.map.open_at(floori(p.x), floori(p.y)):
			h.world = p - way * 0.45
			h._place()
			wall = h.world + way * 3.0
			break
	var here: Vector2 = h.world
	h.auto_lunge = wall
	await _run(0.3)
	var said: bool = false
	for f in h.fx.floaters if h.fx != null else []:
		if str(f.get("text", "")) == "No room":
			said = true
	_line(wall != Vector2.INF and h.world.distance_to(here) < 0.01 and K.charges[2] >= 1,
		"Warp into a wall beside her: she stays where she is, nothing spent (\"No room\" %s) [wall %s, from %s to %s, charges %d]" % ["shown" if said else "said", wall, here, h.world, K.charges[2]])
	# HER CRYSTAL: where it burns in her frame, told to the effects (fx_wild_mage.gd charge)
	var held: bool = h.fx != null and not h.fx.wild_mage.held.is_empty()
	_line(held, "her crystal told to her effects each frame, where it burns in her picture and how hot (%s)" % (str(h.fx.wild_mage.held.get("heat", "-")) if held else "none"))


## WHAT IS DRAWN WITH HIM (render.ts: drawAura, the tails): the pool of light behind him, his scarf (the Warrior), feather (the
## Ranger) or braids (the Mage) hanging from where his frame fixes them and moving; standing, striking, walking; then in his town,
## his weapon on his back (the bake's `town` pictures).
func _looks() -> void:
	var want := {"warrior": ["w-scarf-a", "w-scarf-b"], "ranger": ["r-feather"], "mage": ["m-braid-a", "m-braid-b"]}
	h.world = h.home
	h._place()
	var ids: Array = want.get(h.cls, [])
	h.auto_attack = false
	h.auto_whirl = false
	await _run(0.5)
	var hung := true
	for id in ids:
		hung = hung and h.tails.chains.has(id)
	var before: Array = []
	for id in ids:
		before.append(h.tails.chains[id]["p"].duplicate() if h.tails.chains.has(id) else PackedFloat32Array())
	await _snap("%s_standing" % h.cls)
	h.auto_dir = Vector2(1, 0)
	await _run(0.6)
	h.auto_dir = Vector2.ZERO
	await _snap("%s_walked" % h.cls)
	var moved := ids.is_empty()
	for k in ids.size():
		if h.tails.chains.has(ids[k]) and h.tails.chains[ids[k]]["p"] != before[k]:
			moved = true
	var glow: bool = h._aura.visible and h._aura.modulate.a > 0.0
	_line(hung and moved and glow, "the %s's pool of light behind him (%s); his %s hanging where his frames fix them and moving as he walks" % [h.cls, "on" if glow else "OFF", ", ".join(ids) if not ids.is_empty() else "(none of his own)"])
	M.go_to("town", "start")
	await M._wait(1.0)
	await _run(0.3)
	await _snap("%s_town" % h.cls)
	_line(h.art == h.arts["town"], "in his town, his town pictures (his weapon on his back)")
