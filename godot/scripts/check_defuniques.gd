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
	_line(absf(h.stats["dodge"] - want_t) <= 1.0 and h.stats["dodge"] > d1 and _built(tw).contains("Dodge"), "Slipstream (%s): movement speed %d%%, dodge %d (without it %d)" % [_built(tw), h.stats["move_speed"], h.stats["dodge"], d1])
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
	_line(missing.is_empty() and own == (88 if not art_was else 103) and own15 == 15, "their pictures: %d uniques each with a picture of its own in the sheet (none missing: %s); the fifteen with their switch on, %d of 15 their own" % [own, str(missing), own15])
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

	# ================= THE CHANGED ONES' CARDS =================
	await _card(sc, "du16_shortcut")
	await _card(pr, "du17_prismheart")
	await _card(pc, "du18_packcollar")
	await _card(tl, "du19_towline")
	await _card(qc, "du20_quiltedcoat")
	if M._inv.visible:
		M._inv.toggle()
	print("DEFUNIQUES: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
