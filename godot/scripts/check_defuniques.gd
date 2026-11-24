## THE UNIQUES' DEFENCES AND THE FIFTEEN OF THE THREE DEFENCES, CHECKED (`--only=defuniques --shots=<dir>`; loot.gd THE UNIQUES'
## DEFENCES, DEFENCE_UNIQUES; uniques.gd THE FIFTEEN OF THE THREE DEFENCES; game/uniques.ts). On floor 5, among its monsters:
##   the uniques we had whose defence is now their hero's own (Shortcut, Prismheart, the Pack Collar, the Tow Line, the Quilted
##   Coat), the ones left as they were, a leveling unique carrying nothing of its base;
##   the fifteen: that none drops with the switch off; each one's rule, by its numbers; each one's card pictured.
extends RefCounted

var M
var h
var L
var U
var dir := ""
var n := 0
var bad: Array = []
var foe = null


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("DEFUNIQUES %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


## A plain piece of level 20 as the game's tables make it, worn in `slot`.
func _piece(slot: String, base: String, imods: Array) -> void:
	L.gear[slot] = {"name": base, "base": base, "icon": slot + ":2", "slot": slot, "ilvl": 20, "req": 20, "rarity": 0, "weapon": false, "hands": 0, "aps": 0,
		"imods": imods.duplicate(true), "mods": imods.duplicate(true), "implicit": [], "lines": [], "imbues": [], "affixes": 0, "has": []}


## A hero of `cls`, level 20, in nothing but his weapon; then `kit` ("heavy", "leather", "cloth": a chest, gloves and a belt of it).
func _hero(cls: String, kit := "") -> void:
	M.set_class(cls, true)
	L.level = 20
	L.ring_lit = true
	for k in ["str", "dex", "int"]:
		L.attrs[k] = 30.0
	for s in L.EQUIP:
		if s != "mainhand":
			L.gear[s] = null
	match kit:
		"heavy":
			_piece("chest", "War Plate", [["armor", 103]])
			_piece("gloves", "War Gauntlets", [["armor", 41]])
			_piece("belt", "War Belt", [["armor", 41]])
		"leather":
			_piece("chest", "Studded Jerkin", [["armor", 62], ["moveSpeed", 4]])
			_piece("gloves", "Studded Gloves", [["atkSpeed", 5]])
			_piece("belt", "Studded Belt", [["maxLife", 40]])
		"cloth":
			_piece("chest", "Velvet Robe", [["maxMana", 87], ["armor", 32]])
			_piece("gloves", "Velvet Gloves", [["maxMana", 44]])
			_piece("belt", "Velvet Sash", [["maxMana", 44]])
	L.derive()
	_fresh()


func _fresh() -> void:
	h.life = h.max_life
	h.barrier = h.max_barrier
	h.unhurt = false
	h._invuln = 0.0
	h.shield = 0.0
	h.haste = 0.0
	h.haste_t = 0.0
	U.uq["temper"] = 0
	U.uq["temper_t"] = 0.0
	U.uq["feint_t"] = 0.0
	if foe != null and is_instance_valid(foe):
		foe.life = foe.max_life


## The unique `id` worn in its slot (in place of what was there), as the game makes it for this floor.
func _wear(id: String) -> Dictionary:
	var it: Dictionary = L.unique_piece(id)
	L.gear["ring1" if it["slot"] == "ring" else str(it["slot"])] = it
	L.derive()
	_fresh()
	return it


func _built(it: Dictionary) -> String:
	return ", ".join(L.lines_of(it, "implicit") + L.lines_of(it, "lines"))


## A blow of `raw` on him from the monster beside him; what it took (his barrier's part and his life's).
func _blow(raw: float, el := "phys") -> float:
	var b0: float = h.barrier
	var l0: float = h.life
	h._invuln = 0.0
	h.hurt_by(raw, el, [], {}, foe, h.world + Vector2(1, 0))
	return (b0 - h.barrier) + (l0 - h.life)


func _card(it: Dictionary, name: String) -> void:
	if dir == "":
		return
	if not M._inv.visible:
		M._inv.toggle()
		await M._wait(0.3)
	M._inv._hover = {"item": it, "at": Vector2(300, 120)}
	M._inv.queue_redraw()
	await M._wait(0.2)
	await M._snap(dir + "/" + name + ".png")
	M._inv._hover = {}
	# (shut again: the game stands still while it is open)
	M._inv.toggle()
	await M._wait(0.2)


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	L = M.loot
	U = h.uniques
	var defs: Dictionary = L._uniques["defs"]
	M.go_to("floor5", "start")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and o.state != "rise" and (foe == null or o.world.distance_to(h.world) < foe.world.distance_to(h.world)):
			foe = o
	if foe != null:
		foe.world = h.world + Vector2(1.2, 0.0)
		foe._place()
		foe.speed = 0.0
		foe.state = "recover"
		foe._t = 1e9
		foe._cd = 1e9
		foe.max_life = 1e6
		foe.life = 1e6
	_line(foe != null, "floor 5, a monster beside him to strike and be struck by")

	# ================= THE UNIQUES WE HAD =================
	_hero("mage")
	var sc: Dictionary = _wear("shortway")
	var sc_l: String = _built(sc)
	_line(sc_l.contains("Barrier") and not sc_l.contains("Dodge") and sc_l.contains("Movement Speed") and h.max_barrier > 0.0 and h.stats["dodge"] == 0.0,
		"Shortcut (the Mage's leather boots): %s; on her, barrier %d, dodge %d" % [sc_l, h.max_barrier, h.stats["dodge"]])
	_hero("mage")
	var pr: Dictionary = _wear("prism")
	var pr_l: String = _built(pr)
	_line(pr_l.contains("Barrier") and not pr_l.contains("Mana") and not pr_l.contains("Cooldown") and h.max_barrier > 0.0, "Prismheart (the Mage's amulet): %s; on her, barrier %d" % [pr_l, h.max_barrier])
	_hero("ranger")
	var pc: Dictionary = _wear("packcollar")
	var pc_l: String = _built(pc)
	_line(pc_l.contains("Dodge") and h.stats["dodge"] > 0.0 and h.dodge_chance() > 0.0, "The Pack Collar (the Ranger's amulet): %s; on him, dodge %d, a %.0f%% chance here" % [pc_l, h.stats["dodge"], h.dodge_chance() * 100.0])
	_hero("tinkerer")
	var tl: Dictionary = _wear("towline")
	var tl_l: String = _built(tl)
	_line(tl_l.contains("Dodge") and not tl_l.contains("Armour") and h.stats["armor"] == 0.0 and h.stats["dodge"] > 0.0, "The Tow Line (the Tinkerer's heavy belt): %s; on her, armour %d, dodge %d" % [tl_l, h.stats["armor"], h.stats["dodge"]])
	_hero("ranger")
	var qc: Dictionary = _wear("quiltedcoat")
	var qc_l: String = _built(qc)
	_line(qc_l.contains("Dodge") and not qc_l.contains("Armour") and h.stats["armor"] == 0.0 and h.stats["dodge"] >= 96.0 and not L.implicit_lines(qc).size() > 0,
		"The Quilted Coat (a jerkin, level 14): %s; on him, armour %d, dodge %d" % [qc_l, h.stats["armor"], h.stats["dodge"]])
	# (a leveling unique: nothing of its base, so none of its base's kind's defence either)
	_hero("ranger")
	var eb: Dictionary = _wear("errandboots")
	_line(L.lines_of(eb, "implicit").is_empty() and h.stats["dodge"] == 0.0 and _built(eb).contains("Movement Speed"), "The Errand Boots (leather, level 1), nothing but: %s; dodge %d" % [_built(eb), h.stats["dodge"]])
	_hero("warrior")
	var vd: Dictionary = _wear("vaultdoor")
	_line(_built(vd).contains("Armour") and h.stats["armor"] >= 240.0, "The Vault Door (plate, level 25), as it was: armour %d" % h.stats["armor"])
	# (left as they were: each its base's kind's)
	var same := []
	var same_ok := true
	for pair in [["nettleshirt", "Dodge"], ["queenstalons", "Movement Speed"], ["twofacedmask", "Dodge"], ["mothswing", "Barrier"], ["freehand", "Barrier"], ["kingsknot", "Barrier"], ["press", "Armour"], ["receipt", "Armour"], ["clovenboots", "Armour"], ["longodds", "Armour"]]:
		var it: Dictionary = L.unique_piece(pair[0])
		var bl: String = ", ".join(L.lines_of(it, "implicit"))
		same_ok = same_ok and bl.contains(pair[1])
		same.append("%s: %s" % [it["name"], bl])
	_line(same_ok, "left as they were, each its base's kind's: %s" % "; ".join(same))

	# ================= THE FIFTEEN: THE POOL =================
	var fifteen: Array = defs.keys().filter(func(id): return defs[id].get("set") == "defence")
	_line(fifteen.size() == 15 and fifteen.all(func(id): return defs[id]["from"] == "pool" and defs[id]["cls"] == null and not (L._uniques["pieces"][id] as Array).is_empty()),
		"the fifteen: %d of them, the pool's, anyone's, pieces made for each" % fifteen.size())
	_hero("warrior")
	var was_on: bool = L.DEFENCE_UNIQUES
	L.DEFENCE_UNIQUES = false
	var got := 0
	for i in 3000:
		var it = L.make_pool_unique()
		if it != null and fifteen.has(it["unique"]):
			got += 1
	L.DEFENCE_UNIQUES = true
	var seen := {}
	for i in 6000:
		var it = L.make_pool_unique()
		if it != null and fifteen.has(it["unique"]):
			seen[it["unique"]] = true
	L.DEFENCE_UNIQUES = was_on
	_line(got == 0 and seen.size() == 15, "the switch off, 3,000 of the pool's uniques: %d of the fifteen; on, 6,000: all %d of them come" % [got, seen.size()])

	# ================= ARMOUR =================
	var T: Dictionary = L._uniques["tune"]
	# ANVILHEART
	_hero("warrior", "heavy")
	var fire0: float = _blow(200.0, "fire")
	var an: Dictionary = _wear("anvilheart")
	var cut: float = h.armour_cut()
	var share: float = float(U.ut["anvil"]["share"])
	var fire1: float = _blow(200.0, "fire")
	_line(fire0 == 200.0 and absf(fire1 - roundf(200.0 * (1.0 - cut * share))) <= 1.0, "Anvilheart: a blow of 200 fire without it %d; with it %d (his armour turns %.0f%% of a plain blow, %.0f%% of that of fire)" % [fire0, fire1, cut * 100.0, share * 100.0])
	await _card(an, "du01_anvilheart")
	# THE BURR
	_hero("warrior", "heavy")
	var bu: Dictionary = _wear("theburr")
	var f0: float = foe.life
	_blow(50.0)
	var pricked: float = f0 - foe.life
	_line(absf(pricked - roundf(h.stats["armor"] * float(U.ut["burr"]["share"]))) <= 1.0 and pricked > 0.0, "The Burr: struck, the monster that struck him takes %d (%.0f%% of his armour, %d)" % [pricked, float(U.ut["burr"]["share"]) * 100.0, h.stats["armor"]])
	await _card(bu, "du02_theburr")
	# BALLAST
	_hero("warrior", "heavy")
	var ms0: float = h.stats["move_speed"]
	var ba: Dictionary = _wear("ballast")
	var want_b: float = 1.0 + minf(float(T["ballast"]["most"]), h.stats["armor"] / float(T["ballast"]["per"]) * float(U.ut["ballast"]["more"]))
	_line(absf(U.hit_mult(foe, 0) - want_b) < 0.001 and want_b > 1.0 and absf(h.stats["move_speed"] - (ms0 - float(T["ballast"]["slow"]))) < 0.01,
		"Ballast: armour %d, his hits x%.2f; his movement speed %d%% (without it %d%%)" % [h.stats["armor"], U.hit_mult(foe, 0), h.stats["move_speed"], ms0])
	await _card(ba, "du03_ballast")
	# THE UNBOWED
	_hero("warrior", "heavy")
	var ub: Dictionary = _wear("unbowed")
	L.gear["boots"] = L.unique_piece("queenstalons")
	L.derive()
	_fresh()
	var most: float = roundf(h.max_life * float(U.ut["unbowed"]["most"]))
	var big: float = _blow(100000.0)
	_line(big == most and h.life > 0.0 and h.stats["dodge"] > 0.0 and h.dodge_chance() == 0.0, "The Unbowed: a blow of 100,000 takes %d of his %d life (%.0f%%); with dodge %d on him, his chance to dodge %.0f%%" % [big, h.max_life, float(U.ut["unbowed"]["most"]) * 100.0, h.stats["dodge"], h.dodge_chance() * 100.0])
	await _card(ub, "du04_unbowed")
	# WORKHARDENED
	_hero("warrior", "heavy")
	var wh: Dictionary = _wear("workhardened")
	var c0: float = h.armour_cut()
	for i in 7:
		h.life = h.max_life
		_blow(20.0)
	var c1: float = h.armour_cut()
	var k1: float = U.armour_k()
	var t := 0.0
	while t < float(T["temper"]["secs"]) + 0.5:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	_line(absf(k1 - (1.0 + float(T["temper"]["most"]) * float(U.ut["temper"]["each"]))) < 0.001 and c1 > c0 and U.armour_k() == 1.0,
		"Workhardened: seven blows taken, his armour x%.2f (the most, %d times; it turns %.0f%% of a plain blow, %.0f%% before); %d s unhit, x%.2f" % [k1, T["temper"]["most"], c1 * 100.0, c0 * 100.0, T["temper"]["secs"], U.armour_k()])
	await _card(wh, "du05_workhardened")

	# ================= BARRIER =================
	# QUICKGLASS
	_hero("mage", "cloth")
	_blow(30.0)
	var w0: float = h._barrier_wait
	var qg: Dictionary = _wear("quickglass")
	_blow(30.0)
	var w1: float = h._barrier_wait
	_line(w0 == h.BARRIER_WAIT and absf(w1 - float(U.ut["quick"]["wait"])) < 0.001 and w1 < w0, "Quickglass: struck, her barrier begins to fill after %.1f s (without it %.1f)" % [w1, w0])
	await _card(qg, "du06_quickglass")
	# THE DECANTER
	_hero("mage", "cloth")
	var dc: Dictionary = _wear("decanter")
	h.barrier = 0.0
	h.life = h.max_life * 0.5
	L.potions = 2
	L.drink()
	_line(h.barrier == h.max_barrier and h.max_barrier > 0.0 and L.potions == 1, "The Decanter: her barrier gone, a flask drunk: barrier %d of %d" % [h.barrier, h.max_barrier])
	await _card(dc, "du07_decanter")
	# SHATTERGLASS
	_hero("mage", "cloth")
	var sg: Dictionary = _wear("shatterglass")
	h.barrier = 5.0
	var f1: float = foe.life
	_blow(60.0)
	var burst: float = f1 - foe.life
	_line(h.barrier == 0.0 and absf(burst - roundf(h.max_barrier * float(U.ut["shatter"]["share"]))) <= 1.0, "Shatterglass: her barrier broken, the monster beside her takes %d (%.0f%% of her full barrier, %d)" % [burst, float(U.ut["shatter"]["share"]) * 100.0, h.max_barrier])
	await M._wait(0.15)
	if dir != "":
		await M._snap(dir + "/du08_shatterglass_burst.png")
	await _card(sg, "du08_shatterglass")
	# HALO
	_hero("mage", "cloth")
	var ha: Dictionary = _wear("halo")
	var full: float = U.hit_mult(foe, 0)
	h.barrier = h.max_barrier * 0.5
	var part: float = U.hit_mult(foe, 0)
	_line(absf(full - (1.0 + float(U.ut["halo"]["more"]))) < 0.001 and part == 1.0 and _built(ha).contains("Barrier"), "Halo (%s): her barrier full, her hits x%.2f; half gone, x%.2f" % [_built(ha), full, part])
	await _card(ha, "du09_halo")
	# THE GLAZIER'S RING
	_hero("warlock", "heavy")
	var a0: float = h.stats["armor"]
	var gr: Dictionary = _wear("glaziersring")
	var want_g: float = roundf(a0 * float(U.ut["glazier"]["per"]) * (1.0 + M.loot.Words.eff_attr(h.stats["int"]) * L.INT_BARRIER / 100.0))
	_line(a0 > 0.0 and h.stats["armor"] == 0.0 and absf(h.max_barrier - want_g) <= 1.0, "The Glazier's Ring: a Warlock in plate, armour %d: with it armour %d, barrier %d (%.1f a point, and his Intelligence's share)" % [a0, h.stats["armor"], h.max_barrier, float(U.ut["glazier"]["per"])])
	await _card(gr, "du10_glaziersring")

	# ================= DODGE =================
	# FEINT (and that a blow he really dodges sets it off)
	_hero("ranger", "leather")
	var fe: Dictionary = _wear("feint")
	var before: float = U.hit_mult(foe, 0)
	var dodged := 0
	for i in 60:
		h.life = h.max_life
		_blow(5.0)
		if h.last_blow.get("dodged", false):
			dodged += 1
			break
	var edge: float = U.hit_mult(foe, 0)
	t = 0.0
	while t < float(T["feint"]["secs"]) + 0.3:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	_line(before == 1.0 and dodged == 1 and absf(edge - (1.0 + float(U.ut["feint"]["more"]))) < 0.001 and U.hit_mult(foe, 0) == 1.0, "Feint: a blow dodged (a %.0f%% chance), his hits x%.2f; %d s on, x%.2f" % [h.dodge_chance() * 100.0, edge, T["feint"]["secs"], U.hit_mult(foe, 0)])
	await _card(fe, "du11_feint")
	# AFTERIMAGE
	_hero("ranger", "leather")
	var af: Dictionary = _wear("afterimage")
	var ch0: float = h.dodge_chance()
	U.dodged()
	_line(h.haste == float(T["after"]["haste"]) and absf(h.haste_t - float(U.ut["after"]["secs"])) < 0.001 and h.dodge_chance() > ch0, "Afterimage: a blow dodged, %d%% faster for %.1f s (and, Swift's haste being dodge too, his chance %.0f%% from %.0f%%)" % [h.haste, h.haste_t, h.dodge_chance() * 100.0, ch0 * 100.0])
	await _card(af, "du12_afterimage")
	# FEATHERWEIGHT
	_hero("ranger", "leather")
	_piece("helm", "War Helm", [["armor", 62]])
	L.derive()
	var d0: float = h.stats["dodge"]
	var ar0: float = h.stats["armor"]
	var plain_jerkin: Dictionary = L.gear["chest"]
	var fw: Dictionary = _wear("featherweight")
	var gear_dodge := 0.0
	for s in L.EQUIP:
		if L.gear[s] != null:
			for m in L.mods_of(L.gear[s]):
				if m[0] == "dodge":
					gear_dodge += float(m[1])
	var plain_f: float = roundf(gear_dodge * (1.0 + M.loot.Words.eff_attr(h.stats["dex"]) * L.DEX_DODGE / 100.0))
	var want_f: float = roundf(gear_dodge * (1.0 + M.loot.Words.eff_attr(h.stats["dex"]) * L.DEX_DODGE / 100.0) * (1.0 + float(U.ut["feather"]["more"])))
	_line(ar0 > 0.0 and d0 > 0.0 and h.stats["armor"] == 0.0 and absf(h.stats["dodge"] - want_f) <= 1.0 and want_f > plain_f and plain_jerkin != fw, "Featherweight: in leather and a war helm, armour %d; in it, dodge %d (its gear's alone %d: %.0f%% more), armour %d" % [ar0, h.stats["dodge"], plain_f, float(U.ut["feather"]["more"]) * 100.0, h.stats["armor"]])
	await _card(fw, "du13_featherweight")
	# CLOSE CALL
	_hero("ranger", "leather")
	var cc: Dictionary = _wear("closecall")
	h.life = roundf(h.max_life * 0.5)
	var l0: float = h.life
	U.dodged()
	_line(absf((h.life - l0) - h.max_life * float(U.ut["close"]["heal"])) < 0.01, "Close Call: at half his life, a blow dodged heals him %.1f (%.1f%% of his %d life)" % [h.life - l0, float(U.ut["close"]["heal"]) * 100.0, h.max_life])
	await _card(cc, "du14_closecall")
	# TAILWIND
	_hero("ranger", "leather")
	var d1: float = h.stats["dodge"]
	var tw: Dictionary = _wear("tailwind")
	gear_dodge = 0.0
	for s in L.EQUIP:
		if L.gear[s] != null:
			for m in L.mods_of(L.gear[s]):
				if m[0] == "dodge":
					gear_dodge += float(m[1])
	var want_t: float = roundf((gear_dodge + h.stats["move_speed"] * float(U.ut["tail"]["per"])) * (1.0 + M.loot.Words.eff_attr(h.stats["dex"]) * L.DEX_DODGE / 100.0))
	_line(absf(h.stats["dodge"] - want_t) <= 1.0 and h.stats["dodge"] > d1 and _built(tw).contains("Dodge"), "Tailwind (%s): movement speed %d%%, dodge %d (without it %d)" % [_built(tw), h.stats["move_speed"], h.stats["dodge"], d1])
	await _card(tw, "du15_tailwind")

	# ================= THEIR OWN PICTURES =================
	# (every unique's piece shows a picture that is in the sheet; the 88 each their own; the fifteen their own with DEFENCE_ART on)
	var own := 0
	var missing := []
	for id in defs:
		var it = L.unique_piece(id)
		if it == null or not L.pics.has(str(it["icon"])):
			missing.append(id)
		elif str(it["icon"]) == "u:" + str(id):
			own += 1
	var art_was: bool = L.DEFENCE_ART
	L.DEFENCE_ART = true
	var own15 := 0
	for id in fifteen:
		var it = L.unique_piece(id)
		if it != null and str(it["icon"]) == "u:" + str(id) and L.pics.has(str(it["icon"])):
			own15 += 1
	_line(missing.is_empty() and own == (115 if not art_was else 130) and own15 == 15, "their pictures: %d uniques each with a picture of its own in the sheet (none missing: %s); the fifteen with their switch on, %d of 15 their own" % [own, str(missing), own15])
	# (a bag of them, pictured: the fifteen in their own pictures, then nine of the ones we had)
	_hero("warrior")
	L.bag.clear()
	for id in fifteen + ["prism", "shortway", "packcollar", "towline", "quiltedcoat", "nettleshirt", "mothswing", "longodds", "vaultdoor"]:
		L.bag.append(L.unique_piece(id))
	L.DEFENCE_ART = art_was
	if dir != "":
		M._inv.toggle()
		await M._wait(0.4)
		await M._snap(dir + "/du21_bag_of_uniques.png")
		M._inv.toggle()
		await M._wait(0.2)
	L.bag.clear()

	# ================= FIFTEEN MORE LEVELING UNIQUES (loot.gd LEVEL2_UNIQUES; uniques.ts LEVEL2_DEFS) =================
	var more: Array = defs.keys().filter(func(id): return defs[id].get("set") == "level2")
	var bare_ok := true
	var rows := []
	for id in more:
		var it: Dictionary = L.unique_piece(id)
		bare_ok = bare_ok and defs[id]["from"] == "level" and it.get("bare", false) == true and (L.lines_of(it, "implicit").is_empty() or it["weapon"] == true) and int(it["req"]) == int(defs[id]["level"]) \
			and not L.lines_of(it, "lines").is_empty() and (defs[id].get("udef") == null or not ", ".join(L.lines_of(it, "lines")).contains("Armour"))
		rows.append("%s (level %d): %s" % [it["name"], int(defs[id]["level"]), ", ".join(L.lines_of(it, "lines"))])
	_line(more.size() == 15 and bare_ok, "fifteen more leveling uniques, each its level's own, nothing of its base (a weapon, its base's damage alone): %s" % "; ".join(rows))
	# (the switch: none drops with it off; on, on a floor of level 30, all of them a hero may find come)
	_hero("warrior")
	var l2_was: bool = L.LEVEL2_UNIQUES
	var drops: Dictionary = L._uniques["drops"]
	var pool_was = drops["pool"].duplicate(true)
	var level_was = drops["level"].duplicate(true)
	for kk in ["plain", "elite", "hoard"]:
		drops["pool"][kk] = 0.0
		drops["level"][kk] = 1.0
	var lvl_was: int = L.level
	var seen_off := 0
	var seen_on := {}
	for on in [false, true]:
		L.LEVEL2_UNIQUES = on
		for i in 4000:
			var it = L._pool_unique(0, 0.0)
			if it != null and more.has(it["unique"]):
				if on:
					seen_on[it["unique"]] = true
				else:
					seen_off += 1
	L.LEVEL2_UNIQUES = l2_was
	drops["pool"] = pool_was
	drops["level"] = level_was
	var here: int = L.power()
	var due: Array = more.filter(func(id): return int(defs[id]["level"]) <= here and (defs[id]["cls"] == null or defs[id]["cls"] == "warrior"))
	_line(seen_off == 0 and seen_on.size() == due.size() and due.size() >= 1, "their switch off, 4,000 leveling drops here (level %d): %d of them; on: %d of the %d of this level or below" % [here, seen_off, seen_on.size(), due.size()])
	# (three of them worn: barrier on an amulet; dodge and every resistance less; armour and less Intelligence)
	_hero("mage")
	var pch: Dictionary = _wear("papercharm")
	var b_p: float = h.max_barrier
	_hero("ranger")
	var gco: Dictionary = _wear("greasedcoat")
	var d_g: float = h.stats["dodge"]
	var r_g: float = h.stats["res_fire"]
	_hero("warrior")
	var int0: float = h.stats["int"]
	var tsk: Dictionary = _wear("thickskull")
	_line(b_p >= 20.0 and d_g >= 300.0 and r_g <= -20.0 and h.stats["armor"] >= 120.0 and h.stats["int"] <= int0 - 14.0,
		"worn: the Paper Charm, barrier %d; the Greased Coat, dodge %d, fire resistance %d%%; the Thick Skull, armour %d, Intelligence %d (from %d)" % [b_p, d_g, r_g, h.stats["armor"], h.stats["int"], int0])
	# (THE BARN DOOR IN HIS HANDS: skins.gd; the Warrior holding it is drawn holding it, in a dungeon and in town; another hero, not)
	_hero("warrior")
	h.talents = []
	h.arm()
	L.gear["mainhand"] = L.unique_piece("barndoor")
	L.derive()
	await M._wait(0.4)
	var path_of := func(a) -> String:
		if a == null or a.count(0, 0) == 0:
			return ""
		var f: Dictionary = a.frame(0, 0, 0)
		return f["tex"].atlas.resource_path.get_file() if f["tex"] is AtlasTexture else f["tex"].resource_path.get_file()
	var in_dungeon: String = path_of.call(h.arts["dungeon"])
	var in_town: String = path_of.call(h.arts["town"])
	_line(h.skin == "warrior-barndoor" and in_dungeon.begins_with("warrior-barndoor-") and in_town.begins_with("warrior-barndoor-") and h.art == h.arts["dungeon"],
		"the Warrior holding The Barn Door: drawn as %s (in a dungeon %s, in town %s)" % [h.skin, in_dungeon, in_town])
	if dir != "":
		for f in [Vector2(1, 0), Vector2(0, 1), Vector2(-1, 0), Vector2(0, -1)]:
			h._turn(f)
			await M._wait(0.25)
			await M._snap(dir + "/bd_%d_%d.png" % [int(f.x), int(f.y)])
	# (their cards, and a bag of them)
	if dir != "":
		var k := 0
		for id in more:
			k += 1
			await _card(L.unique_piece(id), "lv%02d_%s" % [k, id])
		L.bag.clear()
		for id in more:
			L.bag.append(L.unique_piece(id))
		M._inv.toggle()
		await M._wait(0.4)
		await M._snap(dir + "/lv16_bag.png")
		M._inv.toggle()
		await M._wait(0.2)
		L.bag.clear()

	# ================= TWELVE LEVELING WEAPONS (loot.gd LEVEL3_UNIQUES; uniques.ts LEVEL3_DEFS; skins.gd) =================
	var arms12: Array = defs.keys().filter(func(id): return defs[id].get("set") == "level3")
	var w_ok := true
	var w_rows := []
	for id in arms12:
		var it: Dictionary = L.unique_piece(id)
		w_ok = w_ok and defs[id]["from"] == "level" and defs[id]["cls"] != null and it["weapon"] == true and it.get("bare", false) == true and int(it["req"]) == int(defs[id]["level"]) and str(it["icon"]) == "u:" + str(id)
		w_rows.append("%s (%s, level %d): %s" % [it["name"], defs[id]["cls"], int(defs[id]["level"]), ", ".join(L.lines_of(it, "lines"))])
	_line(arms12.size() == 12 and w_ok, "twelve leveling weapons, each its hero's, its level's own, its own picture: %s" % "; ".join(w_rows))
	# (how many leveling weapons each hero has now: three, the Warrior four)
	var per := {}
	for id in defs:
		if defs[id]["from"] == "level" and defs[id]["weapon"] != null and defs[id]["cls"] != null:
			per[defs[id]["cls"]] = int(per.get(defs[id]["cls"], 0)) + 1
	_line(per.size() == 6 and per.values().all(func(v): return v >= 3) and per.get("warrior") == 4, "leveling weapons for each hero: %s" % str(per))
	# (their switch: none drops with it off; on, a hero of level 20's floor finds both of his)
	var l3_was: bool = L.LEVEL3_UNIQUES
	for kk in ["plain", "elite", "hoard"]:
		drops["pool"][kk] = 0.0
		drops["level"][kk] = 1.0
	var off3 := 0
	var on3 := {}
	var depth_was = L.map.depth
	L.map.depth = 20
	for c in ["warrior", "ranger", "mage", "warlock", "tinkerer", "brawler"]:
		M.set_class(c, true)
		for on in [false, true]:
			L.LEVEL3_UNIQUES = on
			for i in 1500:
				var it = L._pool_unique(0, 0.0)
				if it != null and arms12.has(it["unique"]):
					if on:
						on3[it["unique"]] = defs[it["unique"]]["cls"] == c
					else:
						off3 += 1
	L.LEVEL3_UNIQUES = l3_was
	L.map.depth = depth_was
	drops["pool"] = pool_was
	drops["level"] = level_was
	_line(off3 == 0 and on3.size() == 12 and on3.values().all(func(v): return v), "their switch off, 9,000 leveling drops across the six heroes: %d of them; on: %d of the 12 come, each to its own hero only" % [off3, on3.size()])
	# (THE ICICLE: every hit frost; the Runner's Bow's dodge; the Walking Stick's barrier)
	_hero("mage")
	L.gear["mainhand"] = L.unique_piece("icicle")
	L.derive()
	var el: String = str(h.loadout.r(0)["element"])
	L.gear["mainhand"] = L.unique_piece("walkingstick")
	L.derive()
	var ws_b: float = h.max_barrier
	_hero("ranger")
	L.gear["mainhand"] = L.unique_piece("runnersbow")
	L.derive()
	_line(el == "frost" and ws_b >= 60.0 and h.stats["dodge"] >= 8.0, "the Icicle in her hand: her tap attack's element %s; the Walking Stick: barrier %d; the Runner's Bow: dodge %d, movement speed %d%%" % [el, ws_b, h.stats["dodge"], h.stats["move_speed"]])
	# (EACH IN ITS HERO'S HANDS: skins.gd; the Tenderizer with his tree's warhammer)
	var skins_ok := true
	var skin_rows := []
	for id in arms12:
		var c: String = defs[id]["cls"]
		_hero(c)
		if c == "warrior":
			h.talents = ["warhammer"] if id == "tenderizer" else []
			h.arm()
		L.gear["mainhand"] = L.unique_piece(id)
		L.derive()
		await M._wait(0.5)
		var file: String = path_of.call(h.arts["dungeon"])
		var good: bool = h.skin == "%s-%s" % [c, id] and file.begins_with("%s-%s-" % [c, id])
		skins_ok = skins_ok and good
		skin_rows.append("%s: %s" % [id, file if good else "NOT (%s, %s)" % [h.skin, file]])
		if dir != "":
			h._turn(Vector2(1, 0))
			await M._wait(0.25)
			await M._snap(dir + "/hold_%s.png" % id)
	h.talents = []
	_line(skins_ok, "each of the twelve in its hero's hands: %s" % "; ".join(skin_rows))
	if dir != "":
		var k3 := 0
		for id in arms12:
			k3 += 1
			_hero(defs[id]["cls"])
			await _card(L.unique_piece(id), "lw%02d_%s" % [k3, id])

	# ================= FLAT DAMAGE OF AN ELEMENT ON EVERY HIT (hero.gd hit_monster, _flat_extras) =================
	# (a Warrior with no words, a ring of flat fire, frost and lightning: his plain Strike carries each beside itself)
	_hero("warrior")
	h.talents = []
	h.arm()
	foe.tracing = true
	foe.trace = {}
	h.hit_monster(foe, 0, 1.0, false)
	var bare_keys: Array = foe.trace.keys().filter(func(k): return str(k).begins_with("move 0"))
	_piece("ring1", "Ruby Ring", [["fireMin", 10], ["fireMax", 10], ["frostMin", 6], ["frostMax", 6], ["lightMin", 4], ["lightMax", 4]])
	L.derive()
	foe.life = foe.max_life
	foe.trace = {}
	h.hit_monster(foe, 0, 1.0, false)
	var tr: Dictionary = foe.trace.duplicate()
	var fl_fire: float = float(tr.get("move 0 fire", 0.0))
	var fl_frost: float = float(tr.get("move 0 frost", 0.0))
	var fl_light: float = float(tr.get("move 0 lightning", 0.0))
	_line(bare_keys == ["move 0 phys"] and str(h.loadout.r(0)["element"]) == "phys" and fl_fire > 0.0 and fl_frost > 0.0 and fl_light > 0.0 and fl_fire > fl_frost and fl_frost > fl_light and float(tr.get("move 0 phys", 0.0)) > 0.0,
		"a Warrior with no words: his Strike alone is %s; with a ring of 10 fire, 6 frost and 4 lightning it is %d plain and beside it %d fire, %d frost, %d lightning" % [str(bare_keys), tr.get("move 0 phys", 0.0), fl_fire, fl_frost, fl_light])
	# (flat poison: poison on a hit that does not poison of itself)
	_hero("warrior")
	_piece("ring1", "Ruby Ring", [["poisonMin", 8], ["poisonMax", 8]])
	L.derive()
	foe.poison_t = 0.0
	foe.poison_dps = 0.0
	foe.poison_n = 0
	h.hit_monster(foe, 0, 1.0, false)
	_line(float(h.loadout.r(0)["poison"]) == 0.0 and foe.poison_dps > 0.0 and foe.poison_t > 0.0, "the same Strike with a ring of 8 flat poison and no Poison word: it is poisoned, %.1f a second for %.0f s" % [foe.poison_dps, foe.poison_t])
	foe.poison_t = 0.0
	foe.poison_dps = 0.0
	foe.poison_n = 0
	# (a weapon that can deal no other type: the Kindling Rod's hits carry none of the others)
	_hero("mage")
	L.gear["mainhand"] = L.unique_piece("kindlingrod")
	_piece("ring1", "Ruby Ring", [["frostMin", 6], ["frostMax", 6], ["poisonMin", 8], ["poisonMax", 8]])
	L.derive()
	foe.life = foe.max_life
	foe.trace = {}
	h.hit_monster(foe, 0, 1.0, false)
	var rod_keys: Array = foe.trace.keys().filter(func(k): return str(k).begins_with("move 0"))
	_line(rod_keys == ["move 0 fire"] and foe.poison_dps == 0.0, "the Kindling Rod (can deal no other type of damage) with a ring of flat frost and poison: its hit is %s, no poison" % str(rod_keys))
	foe.tracing = false
	foe.trace = {}
	# (the lines say what they add)
	var kr: Dictionary = L.unique_piece("kindlingrod")
	var pl: Dictionary = L.unique_piece("poisonerslocket")
	var said: String = ", ".join(L.lines_of(kr, "lines") + L.lines_of(pl, "lines"))
	_line(not said.contains("Hits") and said.contains("Fire Damage") and said.contains("Poison Damage"), "the lines: %s" % said)

	# ================= THE CHANGED ONES' CARDS =================
	await _card(sc, "du16_shortcut")
	await _card(pr, "du17_prismheart")
	await _card(pc, "du18_packcollar")
	await _card(tl, "du19_towline")
	await _card(qc, "du20_quiltedcoat")
	if M._inv.visible:
		M._inv.toggle()
	print("DEFUNIQUES: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
