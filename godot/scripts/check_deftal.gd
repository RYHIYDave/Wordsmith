## DEFENCE IN EVERY TREE, CHECKED AND PICTURED (talents.gd DEFENCE_TALENTS: `--only=deftal --deftal=1 --shots=<dir>`): each class's
## new talents in its tree, a twig off the one it hangs on, read on the TALENTS page; and each doing what its card says, in the
## game: the Ranger's Evasive and Counter Shot, the Mage's Ice Shell and Warding Warp, the Warlock's Soul Ward and Hellhide, the
## Tinkerer's Bodyguard and Smoke Screen; the Warrior's Thick Skin and Bulwark on his armour, Shieldwall's words; the Brawler's
## Guard Up answering a blow dodged. A line a step (OK or WRONG), and pictures.
extends "res://scripts/check_talents.gd"


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("DEFTAL %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


## His class `c`, at level 50, wearing nothing (no defence from his gear), whole, open to blows.
func _bare(c: String) -> void:
	M.set_class(c, true)
	M.loot.level = 50
	for s in ["chest", "gloves", "belt", "helm", "boots"]:
		M.loot.gear[s] = null
	M.loot.derive()
	h.life = h.max_life
	h.unhurt = false
	h._invuln = 0.0
	h.barrier = h.max_barrier
	h.evasive_t = 0.0
	h.counter_ready = false
	_open_ground()


## The TALENTS page of his class, talent `id` read on its card, the way to it taken.
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


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor5", "start")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	_line(Talents.DEFENCE_TALENTS, "the defence talents are on for this check (--deftal=1)")
	# --- THE TREES ---
	for cls in Talents.DEFENCE:
		var ids: Array = []
		for t in Talents.DEFENCE[cls]:
			var got: Dictionary = Talents.of(cls, t["id"])
			var main_t: Dictionary = Talents.of(cls, t["from"])
			_line(not got.is_empty() and got["text"] == t["text"] and got["from"] == [t["from"]] and (main_t["joined"] as Array).has(t["id"]) and Talents.PORTED[cls].has(t["id"]),
				"the %s's %s: a twig off %s, joined to it; its card: \"%s\"" % [cls, t["name"], t["from"], got.get("text", "")])
			ids.append(t["id"])
	for cls in Talents.DEFENCE_WORDS:
		for id in Talents.DEFENCE_WORDS[cls]:
			_line(Talents.of(cls, id)["text"] == Talents.DEFENCE_WORDS[cls][id], "the %s's %s, its card now: \"%s\"" % [cls, id, Talents.of(cls, id)["text"]])
	# --- THE RANGER: EVASIVE, COUNTER SHOT ---
	_bare("ranger")
	await _page("evasive", ["fleet", "windrunner"], "ranger_tree_evasive")
	_take(["fleet", "windrunner", "evasive", "countershot"])
	var kit = h.kit
	var c0: float = h.dodge_chance()
	kit.charges[2] = 1
	kit._use_evasive(h.world + h.face * 3.0, Vector2.ZERO)
	await _run(0.05)
	var c1: float = h.dodge_chance()
	# (the roll over: while he rolls nothing touches him anyway)
	await _run(0.6)
	var dodged := 0
	for k in 300:
		h.evasive_t = 2.0
		h.life = h.max_life
		h._invuln = 0.0
		h.hurt_by(10.0, "phys", [], {}, null, h.world + Vector2(1, 0))
		if h.last_blow.get("dodged", false):
			dodged += 1
	_line(c0 < 0.05 and c1 >= 0.5 and absf(dodged / 300.0 - 0.5) < 0.08,
		"Evasive: with no dodge of his own (%.0f%%), after a roll one blow in two misses him (%.0f%%): 300 blows in that while, %d dodged" % [c0 * 100.0, c1 * 100.0, dodged])
	h.evasive_t = 0.1
	await _run(0.3)
	_line(h.dodge_chance() < 0.05, "Evasive: two seconds after the roll, his dodge as it was (%.0f%%)" % [h.dodge_chance() * 100.0])
	# (a blow dodged readies Counter Shot)
	h.counter_ready = false
	for k in 40:
		if h.counter_ready:
			break
		h.evasive_t = 2.0
		h.life = h.max_life
		h._invuln = 0.0
		h.hurt_by(10.0, "phys", [], {}, null, h.world + Vector2(1, 0))
	await _run(0.15)
	await _snap("ranger_counter_ready")
	var m = _foes([[3.0, 0.0]], false)[0]
	m.state = "recover"
	m._t = 1e9
	m._cd = 1e9
	m.speed = 0.0
	var at0: Vector2 = m.world
	var l0: float = m.life
	var ready_was: bool = h.counter_ready
	h.stats["crit_chance"] = 0.0
	h.hit_monster(m, 0, 0.02, false)
	var crit: bool = M.fx.last.get("hit", {}).get("crit", false) if M.fx != null else false
	var thrown: Dictionary = (m.thrown as Dictionary).duplicate() if m.thrown is Dictionary else {}
	h.stats["crit_chance"] = 5.0
	await _run(0.5)
	var push: float = Vector2(float(thrown.get("vx", 0.0)), float(thrown.get("vy", 0.0))).length() * float(thrown.get("t", 0.0))
	_line(ready_was and not h.counter_ready and crit and m.life < l0 and push > 1.0,
		"Counter Shot: a blow dodged readied it (%s); his next arrow a certain critical (%s, %.0f to %.0f), spent it, and threw the enemy back %.1f tiles" % [ready_was, crit, l0, m.life, push])
	await _snap("ranger_counter_shot")
	# --- THE MAGE: ICE SHELL, WARDING WARP ---
	_bare("mage")
	var b0: float = h.max_barrier
	await _page("iceshell", ["bittercold", "deepfreeze", "aura", "frostwarp"], "mage_tree_ice_shell")
	_take(["bittercold", "deepfreeze", "aura", "frostwarp", "iceshell", "wardingwarp"])
	M.loot.derive()
	h.barrier = h.max_barrier
	_line(b0 == 0.0 and absf(h.max_barrier - roundf(h.max_life * 0.2)) < 1.0,
		"Ice Shell: in no cloth, no barrier (%d); with it, a barrier of a fifth of her life (%d of %d)" % [b0, h.max_barrier, h.max_life])
	var ring: Array = _foes([[1.5, 0.0], [0.0, 1.5], [-1.5, 0.0]], false)
	for o in ring:
		o.state = "recover"
		o.frozen_t = 0.0
		o.freeze_immune = 0.0
	await _run(0.2)
	await _snap("mage_ice_shell_whole")
	h.barrier = 5.0
	h.hurt_by(40.0, "phys", [], {}, null, h.world + Vector2(1, 0))
	await _run(0.15)
	await _snap("mage_ice_shell_breaks")
	var frozen: int = ring.filter(func(o): return o.frozen_t > 1.0).size()
	_line(h.barrier <= 0.0 and frozen == ring.size(), "Ice Shell: her barrier broken, the %d near her frozen (%d of them, for 2 s)" % [ring.size(), frozen])
	await _run(0.6)
	h.barrier = 0.0
	kit = h.kit
	kit._talent_warp(h.world, h.world + Vector2(2.0, 0.0))
	_line(absf(h.barrier - h.max_barrier * 0.25) < 1.0, "Warding Warp: a warp filled a quarter of her barrier (%d of %d)" % [h.barrier, h.max_barrier])
	# --- THE WARLOCK: SOUL WARD, HELLHIDE ---
	_bare("warlock")
	await _page("soulward", ["hunger", "terribleroar", "blazingarm", "souldebt"], "warlock_tree_soul_ward")
	_take(["hunger", "terribleroar", "blazingarm", "souldebt", "soulward", "feast", "hellhide"])
	kit = h.kit
	h.barrier = 0.0
	var base: float = maxf(h.max_barrier, roundf(h.max_life * 0.2))
	m = _foes([[2.0, 0.0]], true)[0]
	m.curse_t = 3.0
	kit.on_kill(m)
	var one: float = h.barrier
	for k in 30:
		kit.on_kill(m)
	_line(absf(one - base * 0.1) < 1.0 and absf(h.barrier - base * 1.5) < 1.0,
		"Soul Ward: in no cloth, a fifth of his life his barrier's measure (%d); a cursed one dying gave him %d; thirty more, %d (half again past full, %d)" % [base, one, h.barrier, base * 1.5])
	await _run(0.2)
	await _snap("warlock_soul_ward")
	h.stats["armor"] = 120.0
	var form_was: String = kit.form
	kit.form = "man"
	var a0: float = h.armour_cut()
	kit.form = "demon"
	var a1: float = h.armour_cut()
	h._knock = Vector2.ZERO
	h.knock(Vector2(1, 0), 1.0)
	var knocked: bool = h._knock != Vector2.ZERO
	kit.form = form_was
	_line(a1 > a0 and not knocked, "Hellhide: 120 armour takes %.0f%% of a blow as a man, %.0f%% as the demon (it counts double); the demon not knocked back" % [a0 * 100.0, a1 * 100.0])
	await _page("hellhide", ["hunger", "terribleroar", "feast"], "warlock_tree_hellhide")
	# --- THE TINKERER: BODYGUARD, SMOKE SCREEN ---
	_bare("tinkerer")
	await _page("bodyguard", ["bombsaway", "lightningrod", "shrapnel", "markii", "prospector", "overdrive"], "tinkerer_tree_bodyguard")
	_take(["bombsaway", "lightningrod", "shrapnel", "markii", "prospector", "overdrive", "bodyguard"])
	kit = h.kit
	kit.golems = []
	kit._whistle(1, h.world + Vector2(3, 0), 0.01, 1)
	var g: Dictionary = kit.golems[0]
	g["act"] = "stand"
	g["x"] = h.world.x + 1.5
	g["y"] = h.world.y
	await _run(0.3)
	h.barrier = 0.0
	h.life = h.max_life
	var lb: float = h.life
	h.hurt_by(100.0, "phys", [], {}, null, h.world + Vector2(1, 0))
	var guarded: float = lb - h.life
	await _run(0.1)
	await _snap("tinkerer_bodyguard")
	_take(["bombsaway"])
	h.life = h.max_life
	h._invuln = 0.0
	lb = h.life
	h.hurt_by(100.0, "phys", [], {}, null, h.world + Vector2(1, 0))
	var whole: float = lb - h.life
	_line(guarded > 0.0 and absf(guarded - roundf(whole * 0.5)) <= 1.0, "Bodyguard: her Golem by her, a blow took %d of her life; without the talent, %d (half went to the Golem)" % [guarded, whole])
	kit.golems = []
	await _page("smokescreen", ["bombsaway", "clustervials", "tar", "madmixture", "alchemy", "thebigone", "growthserum"], "tinkerer_tree_smoke_screen")
	_take(["bombsaway", "smokescreen"])
	kit = h.kit
	h.life = h.max_life
	var s0: float = h.dodge_chance()
	kit.charges[2] = 1
	kit._use_evasive(h.world + h.face * 3.0, Vector2.ZERO)
	var waited := 0.0
	while not kit.move.is_empty() and waited < 2.0:
		await _run(0.05)
		waited += 0.05
	await _run(0.5)
	var in_smoke: bool = h.wakes.patch_at("smoke", h.world) != null
	var s1: float = h.dodge_chance()
	await _snap("tinkerer_smoke_screen")
	await _run(0.6)
	await _snap("tinkerer_smoke_screen_later")
	_line(in_smoke and s0 < 0.05 and s1 >= 0.5, "Smoke Screen: where her Blast Jump came down, smoke (%s); in it one blow in two misses her (%.0f%%, before %.0f%%)" % [in_smoke, s1 * 100.0, s0 * 100.0])
	await _run(2.6)
	_line(h.wakes.patch_at("smoke", h.world) == null and h.dodge_chance() < 0.05, "Smoke Screen: three seconds on, the smoke gone and her dodge as it was (%.0f%%)" % [h.dodge_chance() * 100.0])
	# --- THE WARRIOR: THICK SKIN, BULWARK ---
	_bare("warrior")
	_take(["greatsword", "thickskin", "bulwark", "shieldwall"])
	h.stats["armor"] = 100.0
	h.life = h.max_life
	var full: float = h.armour_cut()
	h.life = h.max_life * 0.4
	var low: float = h.armour_cut()
	var guard_low: float = h._talent_guard()
	h.life = h.max_life
	_line(low > full and guard_low == 1.0, "Thick Skin: 100 armour takes %.0f%% of a blow at full life, %.0f%% below half (counting double); no other cut (%.2f)" % [full * 100.0, low * 100.0, guard_low])
	var near: Array = _foes([[1.0, 0.0], [0.0, 1.0], [-1.0, 0.0], [0.0, -1.0], [0.7, 0.7]], true)
	for o in near:
		o.state = "recover"
	var five: float = h.armour_cut()
	_line(five > full, "Bulwark: five close round him, 100 armour takes %.0f%% (as 200: double, the most), alone %.0f%%" % [five * 100.0, full * 100.0])
	await _page("thickskin", ["greatsword"], "warrior_tree_thick_skin")
	# --- THE BRAWLER: GUARD UP ---
	_bare("brawler")
	_take(["vstiffjab", "vguardup"])
	kit = h.kit
	kit.answer = false
	kit.dodged()
	_line(kit.answer, "Guard Up: a blow he dodges is answered: his next punch readied to land twice as hard")
	await _page("vguardup", ["vstiffjab"], "brawler_tree_guard_up")
	print("DEFTAL DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else ": " + str(bad)])
