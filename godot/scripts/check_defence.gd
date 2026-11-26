## THE THREE DEFENCES, SEEN (loot.gd DEFENCE_LAYERS, on at his yes to these pictures: `--only=defence --shots=<dir>`): a Mage of
## level 20 in cloth (her barrier), a Ranger in leather (his dodge), each on floor 5 among its monsters: the barrier round her life
## globe and over her life, its shimmer on her, a blow taking some of it, the barrier filling again; a blow he dodges; the cards of
## a cloth robe and a leather jerkin. Lines of what each comes to.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const Loot := preload("res://scripts/loot.gd")

var M
var h
var dir := ""
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("DEFENCE %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


## A plain piece of floor 20 as the game's tables make it (its base, what is built into it), worn in `slot`.
func _piece(slot: String, base: String, imods: Array, implicit: Array) -> Dictionary:
	var icon: String = {"chest": "robe" if base.ends_with("Robe") else "armor", "helm": "hood" if base.ends_with("Hood") else "helm"}.get(slot, slot) + ":2"
	return {"name": base, "base": base, "icon": icon, "slot": slot.trim_suffix("1").trim_suffix("2"), "ilvl": 20, "req": 20, "rarity": 0, "weapon": false, "hands": 0, "aps": 0,
		"imods": imods.duplicate(true), "mods": imods.duplicate(true), "implicit": implicit.duplicate(), "lines": [], "imbues": [], "affixes": 0, "has": []}


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	M.go_to("floor5", "start")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	# --- THE MAGE IN CLOTH ---
	M.set_class("mage", true)
	M.loot.level = 20
	M.loot.ring_lit = true
	M.loot.attrs["int"] = 14.0 + 5.0 * 19
	M.loot.gear["chest"] = _piece("chest", "Velvet Robe", [["maxMana", 87], ["armor", 32]], ["+8.7% Cooldown Recovery", "+32 Armour"])
	M.loot.gear["gloves"] = _piece("gloves", "Velvet Gloves", [["maxMana", 44]], ["+4.4% Cooldown Recovery"])
	M.loot.gear["belt"] = _piece("belt", "Velvet Sash", [["maxMana", 44]], ["+4.4% Cooldown Recovery"])
	M.loot.derive()
	h.life = h.max_life
	var robe: Array = M.loot.implicit_lines(M.loot.gear["chest"])
	_line(h.max_barrier > 0.0 and h.barrier == h.max_barrier and robe.any(func(l): return str(l).ends_with("Barrier")),
		"a Mage of level 20 (Intelligence %d) in a velvet robe, gloves and sash: barrier %d (life %d); the robe: %s; cooldown recovery %.1f%%" % [h.stats["int"], h.max_barrier, h.max_life, ", ".join(robe), h.stats["cdr"] * 100.0])
	# (among the floor's monsters, near enough for his bar over him to show)
	var m = M._monsters.nearest(h.world, 30.0)
	if m != null:
		m.world = h.world + Vector2(3.0, 0.0)
		m._place()
		m.speed = 0.0
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9
	await M._wait(0.6)
	await M._snap(dir + "/def01_mage_barrier_full.png")
	# (struck for real, for this: the checks keep him unhurt)
	h.unhurt = false
	h._invuln = 0.0
	var b0: float = h.barrier
	var l0: float = h.life
	h.hurt_by(40.0, "phys", [], {}, null, h.world + Vector2(1, 0))
	var b1: float = h.barrier
	var l1: float = h.life
	await M._wait(0.3)
	await M._snap(dir + "/def02_mage_barrier_struck.png")
	_line(b1 < b0 and l1 == l0, "a blow of 40 (less her armour) taken by her barrier, %d to %d; her life untouched, %d" % [b0, b1, l1])
	# (a blow bigger than what is left: the rest goes to her life)
	h.barrier = 10.0
	h.hurt_by(60.0, "phys", [], {}, null, h.world + Vector2(1, 0))
	_line(h.barrier == 0.0 and h.life < l1, "a blow bigger than the barrier left: the barrier gone, the rest from her life (%d)" % h.life)
	# (nothing touches her for three seconds: it fills again)
	var t := 0.0
	while t < 5.5:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	_line(h.barrier >= h.max_barrier - 0.5, "nothing touching her for 3 s, her barrier full again after (%d of %d)" % [h.barrier, h.max_barrier])
	await M._snap(dir + "/def03_mage_barrier_again.png")
	# (her robe's card)
	M._inv.toggle()
	await M._wait(0.3)
	M._inv._hover = {"item": M.loot.gear["chest"], "at": Vector2(300, 200)}
	M._inv.queue_redraw()
	await M._wait(0.2)
	await M._snap(dir + "/def04_card_robe.png")
	M._inv._hover = {}
	M._inv.toggle()
	await M._wait(0.2)
	# --- THE RANGER IN LEATHER ---
	M.set_class("ranger", true)
	M.loot.level = 20
	M.loot.ring_lit = true
	M.loot.attrs["dex"] = 14.0 + 5.0 * 19
	for s in ["chest", "gloves", "belt"]:
		M.loot.gear[s] = null
	M.loot.gear["chest"] = _piece("chest", "Studded Jerkin", [["armor", 81], ["moveSpeed", 4]], ["+81 Armour", "+4% Movement Speed"])
	M.loot.gear["helm"] = _piece("helm", "Mail Hood", [["armor", 48], ["maxLife", 56]], ["+48 Armour", "+56 Max Life"])
	M.loot.gear["boots"] = _piece("boots", "Studded Boots", [["moveSpeed", 8]], ["+8% Movement Speed"])
	M.loot.derive()
	h.life = h.max_life
	var on5: float = h.dodge_chance()
	var jerkin: Array = M.loot.implicit_lines(M.loot.gear["chest"])
	# (no barrier from his gear: with DEFENCE_EVEN on, only his Intelligence's own, 2.5 a point)
	var int_only: float = roundf(M.loot.attrs["int"] * Loot.EVEN_INT_BARRIER) if Loot.DEFENCE_EVEN else 0.0
	_line(on5 > 0.0 and h.max_barrier == int_only and jerkin.any(func(l): return str(l).ends_with("Dodge")),
		"a Ranger of level 20 (Dexterity %d) in a studded jerkin, a mail hood, studded boots: dodge %d, a %.0f%% chance on floor 5; barrier %d (his Intelligence's own); the jerkin: %s" % [h.stats["dex"], h.stats["dodge"], on5 * 100.0, h.max_barrier, ", ".join(jerkin)])
	h.unhurt = false
	h._invuln = 0.0
	var dodged := 0
	var shown := false
	for k in 200:
		h.life = h.max_life
		h.hurt_by(10.0, "phys", [], {}, null, h.world + Vector2(1, 0))
		if h.last_blow.get("dodged", false):
			dodged += 1
			if not shown:
				shown = true
				await M._wait(0.15)
				await M._snap(dir + "/def05_ranger_dodge.png")
	_line(absf(dodged / 200.0 - on5) < 0.08, "200 blows on him: %d dodged (%.0f%%, the chance %.0f%%)" % [dodged, dodged / 2.0, on5 * 100.0])
	M._inv.toggle()
	await M._wait(0.3)
	M._inv._hover = {"item": M.loot.gear["chest"], "at": Vector2(300, 200)}
	M._inv.queue_redraw()
	await M._wait(0.2)
	await M._snap(dir + "/def06_card_jerkin.png")
	M._inv._hover = {}
	M._inv._page = "stats"
	M._inv.queue_redraw()
	await M._wait(0.3)
	await M._snap(dir + "/def07_stats_ranger.png")
	M._inv._page = "gear"
	M._inv.toggle()
	# --- THE THREE DEFENCES' WORDS (words.gd DEFENCE_WORDS) ---
	# (Guarding on a chest and a ring: barrier in place of a chance to block; Swift on a chest: dodge in place of cooldown recovery,
	# on a ring as it was)
	var g_chest: Array = M.loot.imbue_options("guarding", {"slot": "chest", "ilvl": 20}).map(func(o): return o["range"])
	var g_ring: Array = M.loot.imbue_options("guarding", {"slot": "ring", "ilvl": 20}).map(func(o): return o["range"])
	var s_chest: Array = M.loot.imbue_options("swift", {"slot": "chest", "ilvl": 20}).map(func(o): return o["range"])
	var s_ring: Array = M.loot.imbue_options("swift", {"slot": "ring", "ilvl": 20}).map(func(o): return o["range"])
	_line(str(g_chest).contains("Barrier") and not str(g_chest).contains("Block") and str(g_ring).contains("Barrier") and str(s_chest).contains("Dodge") and not str(s_chest).contains("Cooldown") and str(s_ring).contains("Attack Speed"),
		"on gear: Guarding on a chest %s, on a ring %s; Swift on a chest %s, on a ring %s" % [g_chest, g_ring, s_chest, s_ring])
	# (Swift behind: while its haste lasts, his dodge is more)
	var d0: float = h.dodge_chance()
	h.haste = 30.0
	h.haste_t = 3.0
	var d1: float = h.dodge_chance()
	h.haste = 0.0
	h.haste_t = 0.0
	_line(d1 > d0, "Swift behind: his dodge chance with its haste on %.0f%% (without %.0f%%)" % [d1 * 100.0, d0 * 100.0])
	# (Guarding in front: the Mage's barrier topped up by each use; a hero with none has it as a shield, the cyan ring all the same)
	M.set_class("mage", true)
	M.loot.level = 20
	M.loot.ring_lit = true
	M.loot.attrs["int"] = 14.0 + 5.0 * 19
	M.loot.gear["chest"] = _piece("chest", "Velvet Robe", [["maxMana", 87], ["armor", 32]], ["+8.7% Cooldown Recovery", "+32 Armour"])
	M.loot.derive()
	h.loadout.front[0] = ["guarding", null]
	h.loadout._r = [null, null, null]
	h.barrier = 10.0
	h._boons(0)
	var topped: float = h.barrier
	var line: String = str(h.loadout.r(0)["lines"].filter(func(l): return str(l).begins_with("Guarding"))[0])
	_line(topped > 10.0 and h.shield == 0.0, "Guarding in front, with a barrier: each use tops it up (10 to %d of %d); \"%s\"" % [topped, h.max_barrier, line])
	M.loot.gear["chest"] = null
	M.loot.derive()
	h.shield = 0.0
	h._boons(0)
	# (with DEFENCE_EVEN on every hero has a barrier, his Intelligence's own: Guarding tops that up; without it, the shield as before)
	if Loot.DEFENCE_EVEN:
		var had: float = h.max_barrier
		var shield: float = h.shield
		Loot.DEFENCE_EVEN = false
		M.loot.derive()
		var without: float = h.max_barrier
		Loot.DEFENCE_EVEN = true
		M.loot.derive()
		_line(had > 0.0 and without == 0.0 and shield == 0.0, "with no barrier from his gear: his Intelligence's own, %d (none without it), topped up by Guarding, no shield" % had)
	else:
		_line(h.max_barrier == 0.0 and h.shield > 0.0, "with no barrier: a shield of %d for a while, as before" % h.shield)
	await M._wait(0.3)
	await M._snap(dir + "/def08_guarding_shield.png")
	# (a chance to block gone: one burned into gear before, barrier)
	M.loot.gear["ring1"] = {"name": "Old Ring", "base": "Ruby Ring", "icon": "ring:2", "slot": "ring", "ilvl": 20, "rarity": 1, "imods": [], "mods": [["blockChance", 10]], "implicit": [], "lines": ["+10% Chance to Block"], "imbues": []}
	M.loot.derive()
	_line(h.stats.get("block_chance", 0.0) == 0.0 and h.max_barrier > 0.0, "a ring with +10%% Chance to Block from before: no block, %d barrier" % h.max_barrier)
	M.loot.gear["ring1"] = null
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	M.loot.derive()
	print("DEFENCE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
