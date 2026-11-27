## THE WARLOCK'S BUILDS, CHECKED AND PICTURED (heroes/warlock_builds.gd: `--only=wbuilds --wbuilds=1 --shots=<dir>`). On floor 2,
## skeletons held where they are set: his tree laid out as a claw with Embrace, Devour and Soul Link in it, read on the TALENTS page;
## Soul Link, a hit on one cursed dealt in part to every other cursed, none to one uncursed; Devour, the demon's rake on one low
## killing it outright, healing him, the pact given time back, a boss struck three times over instead; Embrace, the demon's kill
## filling the pact back to full. A line a step (OK or WRONG), pictures, and marks for a film of it.
extends "res://scripts/check_brawler2.gd"

const WB := preload("res://scripts/heroes/warlock_builds.gd")


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("WBUILDS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/w%02d_%s.png" % [dir, shot, name])


func _mark(name: String) -> void:
	print("WBUILDS FILM %s %d" % [name, Engine.get_frames_drawn()])


func _page(id: String, taken: Array, name: String) -> void:
	h.talents = taken.duplicate()
	var inv = M._inv
	if not inv.visible:
		inv.toggle()
	inv._page = "talents"
	inv._tal.sel = id
	inv.queue_redraw()
	await _run(0.35)
	await _snap(name)
	inv.toggle()
	await _run(0.2)


## The pack set out (ahead, to his left) of home along his way, whole, uncursed, unburnt; the rest far off. Him home, a man, whole.
func _lay(at: Array) -> void:
	h.world = home
	h._place()
	h._turn(way)
	K.clear()
	K.swing_t = 0.0
	if K.form != "man":
		K.turn_man()
	K.pact = 0.0
	h.life = h.max_life
	var left := Vector2(way.y, -way.x)
	for k in pack.size():
		var m = pack[k]
		if m.dead:
			continue
		m.boss = false
		m.waits = false
		m.max_life = 2000.0
		m.life = 2000.0
		m.curse_t = 0.0
		m.curse_dps = 0.0
		m.hell_t = 0.0
		m.burn_t = 0.0
		if k < at.size():
			_put(m, home + way * float(at[k][0]) + left * float(at[k][1]))
		else:
			_put(m, home - way * (6.0 + k) + left * 6.0)


## (his own _run keeps him whole and his mana full; for Devour, his life left as it is set)
func _wait(secs: float, until := Callable()) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.mana = h.max_mana
		_keep()
		if until.is_valid() and until.call():
			return


## His quick attack at `m` (the demon's rake), pressed again till it lands or a second has gone by: a press made while the last
## swing is still out is let go, as a player's is.
func _rake_at(m) -> void:
	var l0: float = m.life
	for k in 12:
		if not is_instance_valid(m) or m.dead or m.life < l0:
			return
		h._turn((m.world - h.world).normalized())
		h.auto_attack = true
		await _wait(0.1)
	await _wait(0.2)


func _demon() -> void:
	K.pact = float(K.W["pact"]["full"])
	K._become("demon")


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	WB.on = true
	Talents.D = {}
	Talents.ready_up()
	M.set_class("warlock", true)
	M.loot.level = 30
	M.go_to("floor2", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	M.loot.level = 50
	M.loot.derive()
	K = h.kit
	h.walked = 5.0
	home = h.world
	way = _open_way(home)
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.elite and not m.boss and m.kind == "skeleton":
			near.append(m)
	if near.size() < 5:
		for m in M._monsters.list:
			if is_instance_valid(m) and not m.dead and not m.elite and not m.boss and not near.has(m):
				near.append(m)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(home) < b.world.distance_to(home))
	pack = near.slice(0, 5)
	for o in M._monsters.list:
		if is_instance_valid(o) and not pack.has(o):
			o.queue_free()
	if pack.size() < 5:
		_line(false, "floor 2 has no five to set out (%d)" % pack.size())
		return
	var A = pack[0]
	var B = pack[1]
	var C = pack[2]
	var D = pack[3]
	var full: float = float(K.W["pact"]["full"])
	# --- HIS TREE ---
	for id in WB.NODES:
		var N: Dictionary = WB.NODES[id]
		var t: Dictionary = Talents.of("warlock", id)
		var joined := true
		for f in N["from"]:
			joined = joined and (Talents.of("warlock", f)["joined"] as Array).has(id)
		_line(not t.is_empty() and t["text"] == N["text"] and joined and Talents.ported("warlock", id),
			"%s in his tree, off %s, joined to it: \"%s\"" % [N["name"], " or ".join(N["from"]), t.get("text", "")])
	var placed := true
	for id in WB.AT:
		var t: Dictionary = Talents.of("warlock", id)
		placed = placed and (t.is_empty() or t["at"] == WB.AT[id])
	_line(placed and Talents.tree("warlock")["figures"].size() == WB.FIGURES.size(), "his tree laid out as a claw: every stone where the claw puts it (%s), its talons drawn (%d)" % [placed, Talents.tree("warlock")["figures"].size()])
	await _page("embrace", ["hunger", "terribleroar", "blazingarm", "souldebt", "lastrites"], "tree_embrace")
	await _page("devour", ["hunger", "terribleroar", "blazingarm", "bloodlust"], "tree_devour")
	await _page("soullink", ["branded", "hexchain", "blazingarm", "withering"], "tree_soul_link")
	await _page("blazingarm", [], "tree_whole")
	# --- SOUL LINK: a hit on one cursed, a share to every other cursed ---
	h.talents = ["withering", "soullink"]
	_lay([[2.0, 0.0], [3.5, 1.0], [4.0, -1.0], [3.0, 2.5]])
	await _wait(0.2)
	for m in [A, B, C]:
		m.curse_t = 6.0
		m.curse_dps = 0.0
	var lives: Array = [A.life, B.life, C.life, D.life]
	h.hit_monster(A, 0, 1.0, false)
	await _wait(0.05)
	var la: float = float(lives[0]) - A.life
	var lb: float = float(lives[1]) - B.life
	var lc: float = float(lives[2]) - C.life
	var ld: float = float(lives[3]) - D.life
	_line(la > 0.0 and lb > 0.0 and lc > 0.0 and ld == 0.0 and lb / la > 0.15 and lb / la < 0.35,
		"Soul Link: a bolt's hit on one cursed (%.0f lost); the two other cursed took a share (%.0f, %.0f: %.0f%%); the one uncursed none (%.0f)" % [la, lb, lc, lb / la * 100.0, ld])
	h.talents = ["withering"]
	for m in [A, B, C]:
		m.curse_t = 6.0
		m.curse_dps = 0.0
		m.hell_t = 0.0
		m.burn_t = 0.0
	await _wait(0.1)
	lives = [A.life, B.life]
	h.hit_monster(A, 0, 1.0, false)
	await _wait(0.05)
	_line(float(lives[1]) - B.life == 0.0, "without Soul Link, nothing passes to the others (%.0f lost)" % [float(lives[1]) - B.life])
	# (its picture and film: his Curse thrown on the pack, then bolts at the first)
	h.talents = ["branded", "hexchain", "blazingarm", "withering", "soullink"]
	_lay([[3.0, 0.0], [4.5, 1.2], [5.0, -1.1], [6.0, 0.4]])
	await _wait(0.3)
	_mark("link_in")
	await _press("hold", home + way * 4.5)
	h.auto_whirl = false
	await _wait(1.2)
	for k in 4:
		h._turn((A.world - h.world).normalized())
		await _press("tap", A.world)
		await _wait(0.35)
		if k == 1:
			await _snap("soul_link")
	await _wait(0.8)
	_mark("link_out")
	# --- DEVOUR: the demon's rake on one low ---
	h.talents = ["hunger", "terribleroar", "blazingarm", "bloodlust", "devour"]
	_lay([[1.3, 0.0], [6.0, 2.0]])
	_demon()
	await _wait(0.3)
	A.life = A.max_life * 0.15
	h.life = h.max_life * 0.5
	var life0: float = h.life
	K.pact = full * 0.5
	var pact0: float = K.pact
	await _rake_at(A)
	await _wait(0.3)
	var healed: float = h.life - life0
	_line(A.dead and healed >= h.max_life * float(WB.DEVOUR["heal"]) - 1.0 and K.pact > pact0,
		"Devour: the demon's rake on one at 15%% life killed it (%s), healed him %.0f (5%% of %.0f), the pact %.1f to %.1f" % [A.dead, healed, h.max_life, pact0, K.pact])
	# (not one above a fifth of its life)
	_lay([[1.3, 0.0], [6.0, 2.0]])
	_demon()
	await _wait(0.3)
	B.max_life = 2000.0
	_put(B, home + way * 1.3)
	B.life = B.max_life * 0.6
	var b0: float = B.life
	await _rake_at(B)
	_line(not B.dead and B.life < b0, "Devour: one at 60%% life only raked (%.0f to %.0f)" % [b0, B.life])
	# (a boss: not devoured, its rake three times over: the rule itself, on one made a boss for the moment)
	var Cb = C
	Cb.boss = true
	Cb.life = Cb.max_life * 0.15
	var c0: float = Cb.life
	K._devour(Cb, 0, 100.0)
	var low: float = c0 - Cb.life
	Cb.boss = false
	Cb.waits = false
	_line(not Cb.dead and low >= 150.0, "Devour on a boss at 15%% life: not devoured (%s dead), a rake of 100 struck %.0f more (twice over again: three in all)" % [Cb.dead, low])
	# --- EMBRACE: the demon's kill fills the pact back to full ---
	h.talents = ["hunger", "terribleroar", "blazingarm", "souldebt", "lastrites", "embrace"]
	_lay([[1.3, 0.0], [6.0, 2.0]])
	var alive: Array = pack.filter(func(m): return not m.dead)
	var V = alive[0]
	_put(V, home + way * 1.3)
	_demon()
	await _wait(0.3)
	K.pact = full * 0.2
	V.life = 1.0
	await _rake_at(V)
	await _wait(0.2)
	var after: float = K.pact
	_line(V.dead and after >= full - 0.5, "Embrace: as the demon, a kill filled the pact back to full (%.1f of %.0f)" % [after, full])
	h.talents = ["hunger", "terribleroar", "blazingarm", "souldebt", "lastrites"]
	alive = pack.filter(func(m): return not m.dead)
	if alive.size() >= 1:
		var V2 = alive[0]
		_lay([])
		_put(V2, home + way * 1.3)
		_demon()
		await _wait(0.3)
		K.pact = full * 0.2
		V2.life = 1.0
		await _rake_at(V2)
		await _wait(0.2)
		_line(V2.dead and K.pact < full * 0.5, "without Embrace, a kill as the demon puts back only Hunger's time (%.1f of %.0f)" % [K.pact, full])
	# --- THE FILM: the demon devouring a pack set low, and the pact filled with each kill ---
	h.talents = ["hunger", "terribleroar", "feast", "blazingarm", "bloodlust", "devour", "souldebt", "lastrites", "embrace"]
	alive = pack.filter(func(m): return not m.dead)
	_lay([])
	var left := Vector2(way.y, -way.x)
	var spots: Array = [[1.3, 0.0], [1.1, 0.9], [1.1, -0.9], [2.0, 0.3]]
	for k in mini(alive.size(), spots.size()):
		_put(alive[k], home + way * float(spots[k][0]) + left * float(spots[k][1]))
		alive[k].life = alive[k].max_life * 0.18
	await _wait(0.3)
	K.pact = full
	_mark("demon_in")
	h.auto_change = true
	await _wait(3.0, func(): return K.form == "demon" and K.change.is_empty())
	K.pact = full * 0.3
	for k in 4:
		var left_alive: Array = alive.filter(func(m): return is_instance_valid(m) and not m.dead)
		if left_alive.is_empty():
			break
		var tgt = left_alive[0]
		await _rake_at(tgt)
		await _wait(0.3)
		if k == 0:
			await _snap("devour")
	await _wait(0.8)
	await _snap("embrace_pact_full")
	_mark("demon_out")
	K.turn_man()
	print("WBUILDS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else ": " + str(bad)])
