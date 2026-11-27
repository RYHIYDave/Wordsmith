## HIS BARRIER'S LOOK, PICTURED (`--only=barrierlook --shots=<dir>`): no shell round him for a barrier, only his life globe; a glow
## round him when his barrier is more than his life, brighter with light rising off him at twice; a Guarding meld in front and a
## barrier, no bubble; Guarding's own shield, no barrier, its own bubble as before. His words, 27 Nov 2026: “I need barrier changed.
## Not the same shape as Guardian, so people just have 2 bubble shields on them for no reason. So I don't think there needs to be
## anything if you have barrier. It's around your health globe in the corner of the screen. But I do think that once barrier, the
## amount of barrier you have exceeds your health pool, you get like a blue glow around your character. And then once it's like
## double your health, you get something else.”
extends RefCounted

var M
var h
var dir := ""
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("BARRIERLOOK %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _piece(slot: String, base: String, imods: Array, implicit: Array) -> Dictionary:
	var icon: String = {"chest": "robe", "gloves": "gloves", "belt": "belt"}.get(slot, slot) + ":2"
	return {"name": base, "base": base, "icon": icon, "slot": slot, "ilvl": 20, "req": 20, "rarity": 0, "weapon": false, "hands": 0, "aps": 0,
		"imods": imods.duplicate(true), "mods": imods.duplicate(true), "implicit": implicit.duplicate(), "lines": [], "imbues": [], "affixes": 0, "has": []}


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor5", "start")
	# (the level's name over the screen gone first)
	await M._wait(5.0)
	if M.sight != null:
		M.sight.see_all()
	# (a Mage of level 20 in velvet: a barrier more than twice her life)
	M.set_class("mage", true)
	M.loot.level = 20
	M.loot.ring_lit = true
	M.loot.attrs["int"] = 14.0 + 5.0 * 19
	M.loot.gear["chest"] = _piece("chest", "Velvet Robe", [["maxMana", 87], ["armor", 32]], ["+8.7% Cooldown Recovery", "+32 Armour"])
	M.loot.gear["gloves"] = _piece("gloves", "Velvet Gloves", [["maxMana", 44]], ["+4.4% Cooldown Recovery"])
	M.loot.gear["belt"] = _piece("belt", "Velvet Sash", [["maxMana", 44]], ["+4.4% Cooldown Recovery"])
	M.loot.derive()
	h.life = h.max_life
	h.unhurt = true
	# (no monster near: nothing but her)
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and m.world.distance_to(h.world) < 12.0:
			m.world = h.world + Vector2(30.0, 30.0)
			m._place()
	_line(h.max_barrier >= 2.0 * h.max_life, "her barrier %d, her life %d" % [h.max_barrier, h.max_life])
	for k in [0.6, 1.3, 2.2]:
		h.barrier = minf(h.max_barrier, h.max_life * k)
		# (held where it is set: not filling again while the picture is taken)
		h._barrier_wait = 1e9
		await M._wait(0.5)
		await M._snap(dir + "/bl_%02d_barrier_%s.png" % [int(k * 10.0), str(k).replace(".", "_")])
		print("BARRIERLOOK barrier %d of life %d (%.1f times)" % [h.barrier, h.max_life, h.barrier / h.max_life])
	# (a Guarding meld in front, Sanctuary, and her barrier: a use tops it up; no bubble round her)
	M._w_put(h, 0, "front", ["sanctuary"])
	h.barrier = minf(h.max_barrier, h.max_life * 2.2)
	h.shield = 0.0
	h._boons(0)
	await M._wait(0.15)
	await M._snap(dir + "/bl_30_sanctuary_topup.png")
	await M._wait(1.2)
	await M._snap(dir + "/bl_31_sanctuary_after.png")
	_line(h.shield == 0.0, "Sanctuary in front with a barrier: no shield, so no shell (barrier %d)" % h.barrier)
	# (no barrier: Guarding's own shield, its own bubble, as before)
	M.loot.gear["chest"] = null
	M.loot.gear["gloves"] = null
	M.loot.gear["belt"] = null
	M.loot.derive()
	M._w_put(h, 0, "front", ["guarding"])
	h.shield = 0.0
	h._boons(0)
	await M._wait(0.3)
	await M._snap(dir + "/bl_40_guarding_shield.png")
	_line(h.max_barrier == 0.0 and h.shield > 0.0, "no barrier: Guarding's shield (%d), its own bubble" % h.shield)
	print("BARRIERLOOK: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
