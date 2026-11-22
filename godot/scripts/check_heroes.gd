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
	elif h.cls == "warlock":
		await _warlock()
	elif h.cls == "tinkerer":
		await _tinkerer()
	elif h.cls == "brawler":
		await _brawler()
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


## THE WARLOCK: his bolt (his hellfire on what it hits), his Curse (all near struck and cursed), a cursed one dying (its burns leaping
## to those near), his Smoke Step (through one, nothing reaching him, cursing it), his pact filled and his change (his arm blazing,
## then 2.4 s of the change, the demon roaring out, throwing back what is near), the demon's three (its rakes cursing, Damning paying
## out every burn and throwing, its smoke step bursting out), and its burning out.
func _warlock() -> void:
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
	for m in pack:
		m.max_life = 1000.0
		m.life = 1000.0
	# HELLFIRE BOLT: at the one before him; it burns in his hellfire; his pact fills
	put.call(A, home + way * 5.0)
	put.call(B, home + way * 6.0 + side * 1.5)
	put.call(C, home + way * 6.0 - side * 1.5)
	h._turn(way)
	await _run(0.4, Callable(), keep)
	var a0: float = A.life
	h.auto_attack = true
	var flew: bool = await _run(1.0, func(): return not K.shots.is_empty(), keep)
	var look_ok: bool = flew and K.shots[0].get("look", "") == "hellbolt"
	await _run(0.1, Callable(), keep)
	await _snap("warlock_bolt")
	var burning: bool = await _run(1.0, func(): return A.hell_t > 0.0, keep)
	var after_hit: float = A.life
	await _run(1.1, Callable(), keep)
	_line(look_ok and burning and A.hell_dps > 0.0 and A.life < after_hit and K.pact >= 1.0,
		"Hellfire Bolt: his bolt flies (%s) and strikes (%.0f to %.0f); it burns in his hellfire (%.1f a second, %.1f s left), and goes on burning (to %.0f); his pact %.0f of 30" % [look_ok, a0, after_hit, A.hell_dps, A.hell_t, A.life, K.pact])
	# CURSE: thrown where he aims (heroes/warlock.gd CURSE_RANGED; round him, 4.5 tiles, `--curse=round`): those within reach struck and cursed
	put.call(A, home + way * 2.0)
	put.call(B, home + way * 3.0 + side * 1.0)
	put.call(C, home + way * 9.0)
	await _run(0.3, Callable(), keep)
	var b0: float = B.life
	h.auto_whirl = true
	var cursed: bool = await _run(1.2, func(): return A.curse_t > 0.0 and B.curse_t > 0.0, keep)
	await _run(0.15, Callable(), keep)
	await _snap("warlock_curse")
	_line(cursed and B.life < b0 and C.curse_t <= 0.0 and K.charges[1] == 0,
		"Curse: the two within reach struck (%.0f to %.0f) and cursed (%.1f s, %.1f a second), the one 9 tiles off not; its wait begun" % [b0, B.life, B.curse_t, B.curse_dps])
	# A CURSED ONE DIES: its burns leap to those near it
	put.call(C, A.world + side * 2.0)
	C.hell_t = 0.0
	C.curse_t = 0.0
	A.hell_t = 4.0
	A.hell_dps = 6.0
	await _run(0.1, Callable(), keep)
	A.damage(A.life + 10.0, "phys")
	var leapt: bool = await _run(0.5, func(): return C.hell_t > 0.0 and C.curse_t > 0.0, keep)
	await _run(0.2, Callable(), keep)
	await _snap("warlock_spread")
	_line(A.dead and leapt, "a cursed one dying: its hellfire and its curse leap to the one 2 tiles from it (burning %.1f s, cursed %.1f s)" % [C.hell_t, C.curse_t])
	# SMOKE STEP: through B, nothing reaching him, cursing it
	var live: Array = pack.filter(func(m): return not m.dead)
	B.curse_t = 0.0
	put.call(B, home + way * 2.0)
	h.world = home
	h._place()
	await _run(0.3, Callable(), keep)
	b0 = B.life
	var start: Vector2 = h.world
	h.auto_lunge = home + way * 4.5
	var went: bool = await _run(0.2, func(): return not K.move.is_empty(), keep)
	var safe: bool = h._invuln > 0.0
	await _run(0.1, Callable(), keep)
	await _snap("warlock_smoke")
	await _run(0.4, Callable(), keep)
	_line(went and safe and h.world.distance_to(start) > 3.5 and B.life < b0 and B.curse_t > 0.0 and K.charges[2] == 0,
		"Smoke Step: %.1f tiles as smoke, nothing reaching him; the one he passed through struck (%.0f to %.0f) and cursed; its charge spent" % [h.world.distance_to(start), b0, B.life])
	# THE PACT FULL: his arm blazes; R: the change, then the demon roars out
	K.pact = 30.0
	await _run(0.2, Callable(), keep)
	var blaze: bool = K.look_key() == "blaze" and h.art == h.arts["blaze"]
	await _snap("warlock_blazing")
	put.call(B, h.world + way * 1.5)
	put.call(C, h.world + way * 6.0)
	h.auto_change = true
	var changing: bool = await _run(0.3, func(): return not K.change.is_empty(), keep)
	await _run(1.0, Callable(), keep)
	var pic: Array = K.picture(h._side)
	var untouched: bool = h._invuln > 0.0
	await _snap("warlock_changing")
	var b_at: Vector2 = B.world
	var formed: bool = await _run(2.0, func(): return K.form == "demon", keep)
	await _run(0.3)
	await _snap("warlock_demon")
	_line(blaze and changing and not pic.is_empty() and int(pic[0]) == 56 and untouched and formed and h.loadout.id(0) == "rake" and h.art == h.arts["demon"] and B.world.distance_to(b_at) > 0.5 and K.pact >= 29.0,
		"his pact full, his arm blazes (%s); R: he changes (his change's pictures, %s; nothing reaching him), and the demon roars out, throwing back the one beside him (%.1f tiles); its three: %s, %s, %s" % [blaze, pic, B.world.distance_to(b_at), h.loadout.r(0)["name"], h.loadout.r(1)["name"], h.loadout.r(2)["name"]])
	# THE DEMON: its rakes curse; Damning pays out every burn and throws
	for m in pack:
		if not m.dead:
			m.curse_t = 0.0
			m.hell_t = 0.0
	put.call(B, h.world + h.face * 1.4)
	await _run(0.2, Callable(), keep)
	b0 = B.life
	h.auto_attack = true
	var raked: bool = await _run(1.0, func(): return B.curse_t > 0.0, func():
		h.auto_attack = true
		for m in pack: _hold(m))
	await _snap("warlock_rake")
	h.auto_attack = false
	await _run(0.5, Callable(), keep)
	_line(raked and B.life < b0, "the demon's Claw Rake: struck (%.0f to %.0f) and cursed" % [b0, B.life])
	B.hell_t = 4.0
	B.hell_dps = 10.0
	var b1: float = B.life
	var b_was: Vector2 = B.world
	h.auto_whirl = true
	var erupted: bool = await _run(1.2, func(): return B.hell_t <= 0.0 and B.curse_t <= 0.0, keep)
	await _run(0.15)
	await _snap("warlock_damning")
	_line(erupted and B.life < b1 - 40.0 and B.world.distance_to(b_was) > 0.5,
		"Damning: under the cursed and burning one the ground erupts: struck, every burn paid out at once (%.0f to %.0f), and thrown (%.1f tiles)" % [b1, B.life, B.world.distance_to(b_was)])
	# THE DEMON'S SMOKE STEP: bursts out where it stops
	await _run(4.5, func(): return K.charges[2] >= 1, keep)
	put.call(B, h.world + h.face * 2.0)
	var landed_near: Vector2 = h.world + h.face * 4.5
	b0 = B.life
	h.auto_lunge = landed_near
	await _run(0.6, Callable(), keep)
	await _snap("warlock_demonstep")
	_line(B.life < b0 and B.curse_t > 0.0, "the demon's Smoke Step: raking and cursing the one it tore through (%.0f to %.0f), bursting out where it stopped" % [b0, B.life])
	# BURNING OUT: its pact dry, the demon burns out and he is a man again
	K.pact = 0.5
	var out: bool = await _run(1.0, func(): return not K.change.is_empty() and K.change["to"] == "man", keep)
	var back: bool = await _run(3.0, func(): return K.form == "man", keep)
	await _run(0.2)
	await _snap("warlock_man_again")
	_line(out and back and h.loadout.id(0) == "hellbolt" and K.pact == 0.0, "its pact run dry, the demon burns out (2 s) and he is a man again (%s)" % h.loadout.r(0)["name"])


## THE TINKERER: her Vial Toss (lobbed to where she aims, bursting where it comes down, hurting what stands within its reach and not
## what is further), her Golem (whistled out beside her, dropping in; standing off and firing its cannon at what is awake near her,
## never closing on it; her next whistle, held, braces it and charges its big shot, its shell fired as she lets go, the Golem thrown
## back; left far behind, whistled up beside her again; winding down), her Blast Jump (her bomb going off at her feet, hurting and throwing what is by her,
## she riding it 4 tiles and more, nothing reaching her; her leap's and her landing's pictures).
func _tinkerer() -> void:
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
	for m in pack:
		m.max_life = 1000.0
		m.life = 1000.0
	# HER VIAL TOSS: at the one before her; it bursts on it and the one beside it, not the one further off
	put.call(A, home + way * 5.0)
	put.call(B, home + way * 5.0 + side * 0.8)
	put.call(C, home + way * 5.0 + side * 3.5)
	h._turn(way)
	await _run(0.4, Callable(), keep)
	var a0: float = A.life
	var b0: float = B.life
	var c0: float = C.life
	h.auto_attack = true
	var lobbed: bool = await _run(1.0, func(): return not K.vials.is_empty(), keep)
	await _run(0.3, Callable(), keep)
	await _snap("tinkerer_vial")
	var burst: bool = await _run(1.0, func(): return K.vials.is_empty() and A.life < a0, keep)
	await _run(0.1, Callable(), keep)
	await _snap("tinkerer_vial_burst")
	_line(lobbed and burst and A.life < a0 and B.life < b0 and C.life == c0,
		"Vial Toss: her vial lobbed and bursting where she aimed: the one there struck (%.0f to %.0f) and the one beside it (%.0f to %.0f), the one 3.5 tiles off not (%.0f)" % [a0, A.life, b0, B.life, C.life])
	await _run(0.6, Callable(), keep)
	# HER GOLEM: whistled out beside her, dropping in
	put.call(A, home + way * 6.0)
	put.call(B, home + way * 6.0 + side * 1.2)
	put.call(C, home - way * 3.0 + side * 6.0)
	await _run(0.2, Callable(), keep)
	h.auto_whirl = true
	var out: bool = await _run(1.0, func(): return not K.golems.is_empty(), keep)
	await _run(0.12, Callable(), keep)
	await _snap("tinkerer_golem_drops_in")
	var g: Dictionary = K.golems[0] if out else {}
	var beside: bool = out and Vector2(g["x"], g["y"]).distance_to(h.world) < 2.0 and g["act"] == "arrive"
	_line(out and beside, "her whistle: her Golem dropped in beside her (%.1f tiles from her)" % (Vector2(g["x"], g["y"]).distance_to(h.world) if out else -1.0))
	# ITS SMALL SHOTS (his word of 21 Nov 2026: it only shoots): it stands off and fires its cannon at them, never closing to punch
	var acts := {}
	var lives := [A.life, B.life]
	var near := [1e9]
	var fired: bool = await _run(6.0, func(): return acts.has("cannon") and (A.life < lives[0] or B.life < lives[1]), func():
		for m in pack: _hold(m)
		acts[g["act"]] = true
		near[0] = minf(near[0], minf(A.world.distance_to(Vector2(g["x"], g["y"])), B.world.distance_to(Vector2(g["x"], g["y"])))))
	await _run(0.1, Callable(), keep)
	var shot_seen: bool = await _run(6.0, func(): return g["act"] == "cannon" and float(g["act_t"]) >= 0.55, keep)
	await _snap("tinkerer_golem_shot")
	_line(fired and shot_seen and not acts.has("punch") and not acts.has("pound") and near[0] > 2.0,
		"her Golem stood off and fired its cannon at them (%s), never closing on them (%.1f tiles at the nearest): struck (%.0f to %.0f, %.0f to %.0f)" % [acts.keys(), near[0], lives[0], A.life, lives[1], B.life])
	# ITS BIG SHOT: her whistle again, held: it braces and charges, and fires its shell as she lets go, thrown back by it
	await _run(5.5, func(): return K.charges[1] >= 1, keep)
	put.call(A, home + way * 14.0 + side * 3.0)
	put.call(B, home + way * 14.0 + side * 4.0)
	# (it out in the open before her, the one it fires at 6 tiles on)
	g["x"] = (home + way * 2.0).x
	g["y"] = (home + way * 2.0).y
	var aim_at: Vector2 = home + way * 8.0
	put.call(C, aim_at)
	await _run(0.3, Callable(), keep)
	c0 = C.life
	var g_from := Vector2(g["x"], g["y"])
	K.hold_auto = true
	K._use_skill(1, C.world)
	var braced: bool = await _run(1.0, func(): return g["act"] == "charge", keep)
	await _run(1.2, Callable(), keep)
	await _snap("tinkerer_golem_charging")
	K.hold_auto = false
	var shot: bool = await _run(1.0, func(): return bool(g["did"]), keep)
	var held: float = g["held"]
	var full: bool = held >= float(K.GT["charge"]["build"]) - 0.05
	await _run(0.12, Callable(), keep)
	await _snap("tinkerer_golem_shell")
	var hit: bool = await _run(1.5, func(): return C.life < c0, keep)
	await _run(0.1, Callable(), keep)
	await _snap("tinkerer_golem_shell_blast")
	await _run(1.2, func(): return g["act"] != "charge", keep)
	var g_to := Vector2(g["x"], g["y"])
	_line(braced and shot and full and hit and g_from.distance_to(g_to) > 0.5,
		"her whistle again, held: her Golem braced and charged (held %.1f s), and fired its shell as she let go: the one 6 tiles off struck (%.0f to %.0f), the Golem thrown back %.1f tiles" % [held, c0, C.life, g_from.distance_to(g_to)])
	# HER BLAST JUMP: her bomb at her feet, the one by her struck and thrown; she rides it, nothing reaching her
	for m in pack:
		if not m.dead:
			put.call(m, home + way * 12.0 + side * 2.0)
	h.world = home
	h._place()
	put.call(B, home + way * 0.9)
	await _run(0.3, Callable(), keep)
	b0 = B.life
	var b_at: Vector2 = B.world
	var start: Vector2 = h.world
	h.auto_lunge = home + way * 6.0
	var went: bool = await _run(0.2, func(): return not K.move.is_empty(), keep)
	var safe: bool = h._invuln > 0.0
	var mid: Array = K.picture(h._side)
	await _run(0.15, Callable(), keep)
	await _snap("tinkerer_blast_jump")
	var came: bool = await _run(1.0, func(): return K.move.is_empty(), keep)
	var down: Array = K.picture(h._side)
	await _run(0.1, Callable(), keep)
	await _snap("tinkerer_landed")
	_line(went and safe and came and h.world.distance_to(start) > 4.0 and B.life < b0 and B.world.distance_to(b_at) > 0.5 and not mid.is_empty() and int(mid[0]) == 39 and not down.is_empty() and int(down[0]) == 45 and K.charges[2] == 0,
		"Blast Jump: her bomb struck the one by her (%.0f to %.0f) and threw it (%.1f tiles); she rode it %.1f tiles, nothing reaching her (her leap's pictures %s, her landing's %s); its charge spent" % [b0, B.life, B.world.distance_to(b_at), h.world.distance_to(start), mid, down])
	# LEFT FAR BEHIND: whistled up beside her again
	g["x"] = float(g["x"]) + 30.0
	var back: bool = await _run(0.3, func(): return g["act"] == "arrive" and Vector2(g["x"], g["y"]).distance_to(h.world) < 2.5, keep)
	await _run(0.8, Callable(), keep)
	_line(back, "left far behind, her Golem is whistled up beside her again (%.1f tiles from her)" % Vector2(g["x"], g["y"]).distance_to(h.world))
	# SHE FALLS: it winds down where it stands, and is gone
	K.fallen(0.0)
	var winding: bool = g["act"] == "down"
	await _run(0.9, Callable(), keep)
	await _snap("tinkerer_golem_winds_down")
	var gone: bool = await _run(2.5, func(): return K.golems.is_empty(), keep)
	_line(winding and gone, "she falls: her Golem winds down where it stands (%s), and is gone (%s)" % [winding, gone])


## THE BRAWLER (THE VETERAN): three taps fill three green globes and lock the combo, played in turn, jab, cross, hook, each striking
## the one before him and driving it back, the globes going out after; a hold fills an orange globe, the round kick; a swipe and a
## tap set the globe in green fire, the flying uppercut throwing the one before him up in the air, stunned as it comes down; a
## swipe alone his dodging jump, nothing reaching him off the floor, the jump spent (another at once: "No jump"); R cancels a combo.
func _brawler() -> void:
	var K = h.kit
	var home: Vector2 = h.world
	var way := _open_way(home)
	var pack := _pack(home, way)
	if pack.size() < 3:
		_line(false, "floor 2 has no three skeletons to set out")
		return
	var A = pack[0]
	var put := func(m, at: Vector2) -> void:
		m.world = at
		m._place()
		_hold(m)
	var keep := func(): for m in pack: _hold(m)
	for m in pack:
		m.max_life = 1000.0
		m.life = 1000.0
	for m in pack.slice(1):
		put.call(m, home + way * 12.0)
	var press := func(what: String) -> void:
		if what == "tap":
			h.auto_attack = true
		elif what == "hold":
			h.auto_whirl = true
		elif what == "swipe":
			h.auto_lunge = h.world - way * 1.0
		await M.get_tree().process_frame
		await M.get_tree().process_frame
	# THREE TAPS: jab, cross, hook
	put.call(A, home + way * 1.6)
	h._turn(way)
	await _run(0.3, Callable(), keep)
	var a0: float = A.life
	var a_at: Vector2 = A.world
	await press.call("tap")
	await press.call("tap")
	await press.call("tap")
	var locked: bool = K.globes == ["punch", "punch", "punch"]
	var seen := {}
	var pics := {}
	await _run(0.5, Callable(), keep)
	await _snap("brawler_combo")
	var played: bool = await _run(4.0, func(): return K.mv.is_empty() and K.queue.is_empty(), func():
		for m in pack: _hold(m)
		if not K.mv.is_empty():
			seen[K.mv["id"]] = true
			var p: Array = K.picture(h._side)
			if not p.is_empty():
				pics[p[0]] = true)
	var out: bool = await _run(1.0, func(): return K.globes.is_empty(), keep)
	_line(locked and played and seen.has("jab") and seen.has("cross") and seen.has("hook") and pics.has(58) and pics.has(59) and pics.has(60) and A.life < a0 and out,
		"three taps: three green globes, locked (%s); played in turn, jab, cross, hook (%s), his pictures their own (%s); the one before him struck (%.0f to %.0f) and driven back (%.1f tiles); the globes out after" % [locked, seen.keys(), pics.keys(), a0, A.life, A.world.distance_to(a_at)])
	# A HOLD: the round kick
	h.world = home
	h._place()
	put.call(A, home + way * 1.6)
	await _run(0.3, Callable(), keep)
	a0 = A.life
	a_at = A.world
	await press.call("hold")
	var kicked: bool = K.globes == ["kick"] and not K.mv.is_empty() and K.mv["id"] == "roundkick"
	await _run(0.45, Callable(), keep)
	await _snap("brawler_roundkick")
	await _run(1.5, func(): return K.mv.is_empty(), keep)
	_line(kicked and A.life < a0 and A.world.distance_to(a_at) > 0.5, "a hold: an orange globe, the round kick: struck (%.0f to %.0f), knocked back %.1f tiles" % [a0, A.life, A.world.distance_to(a_at)])
	await _run(1.0, func(): return K.globes.is_empty(), keep)
	# A SWIPE AND A TAP: the flying uppercut, thrown up
	h.world = home
	h._place()
	put.call(A, home + way * 1.6)
	await _run(0.3, Callable(), keep)
	a0 = A.life
	await press.call("swipe")
	await press.call("tap")
	var fire: bool = K.globes == ["punchFire"]
	var upper: bool = not K.mv.is_empty() and K.mv["id"] == "uppercut"
	var popped: bool = await _run(1.5, func(): return A.pop > 0.0, keep)
	await _run(0.15)
	await _snap("brawler_uppercut")
	var top: float = A.pop
	var down: bool = await _run(1.5, func(): return A.pop == 0.0 and K.up.is_empty())
	_line(fire and upper and popped and down and A.stun_t > 0.5 and A.life < a0 and K.charges[2] == 0,
		"a swipe and a tap: the globe in green fire, the flying uppercut: struck (%.0f to %.0f) and thrown up (%.0f game pixels), stunned as it came down (%.1f s); the jump spent" % [a0, A.life, top, A.stun_t])
	await _run(1.6, func(): return K.mv.is_empty() and K.globes.is_empty(), keep)
	# A SWIPE: his dodging jump; another at once: "No jump"
	await _run(4.5, func(): return K.charges[2] >= 1, keep)
	h.world = home
	h._place()
	await _run(0.2, Callable(), keep)
	var start: Vector2 = h.world
	await press.call("swipe")
	var jumped: bool = not K.mv.is_empty() and K.mv["id"] == "dodge"
	var safe: bool = await _run(1.0, func(): return h._invuln > 0.0 and not K.mv.is_empty() and float(K.mv["f"]) >= 13.0, keep)
	await _snap("brawler_jump")
	await press.call("swipe")
	var denied: bool = K.globes.size() == 1
	await _run(1.6, func(): return K.mv.is_empty(), keep)
	_line(jumped and safe and denied and h.world.distance_to(start) > 0.5 and K.charges[2] == 0,
		"a swipe: his dodging jump, %.1f tiles, nothing reaching him off the floor; another at once goes in as nothing (No jump)" % h.world.distance_to(start))
	# R: the combo cancelled
	await _run(1.0, func(): return K.globes.is_empty(), keep)
	put.call(A, h.world + way * 1.6)
	await press.call("tap")
	await press.call("tap")
	var two: int = K.globes.size()
	h.auto_change = true
	await M.get_tree().process_frame
	await M.get_tree().process_frame
	_line(two == 2 and K.globes.is_empty() and K.queue.is_empty() and K.mv.is_empty(), "R: his combo cancelled (%d globes in, then none)" % two)


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
