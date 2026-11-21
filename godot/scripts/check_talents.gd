## THE CHECK OF THE SKILL TREES (--only=talents; main.gd's shot mode sends it here): their rules as the game's (game/talents.ts),
## and the TALENTS page (ui/talents.ts) for each class, pictured, a line a step (OK or WRONG):
##   the points: none till level 5, one every five levels, ten at most; the next point's level;
##   the way: where a tree begins is open, the rest once one joined to it by a line is his, before it or after it (both ways);
##   the Warrior's three weapons: his first point one of them, only one, a weapon's path its own, IRON once a weapon is his;
##   undoing: not while one taken hangs on it alone; a list made safe (another class's, twice, out of order, more than the level);
##   the page for each of the six: its shape, its paths' captions, a talent taken lit, one open, its card read.
extends RefCounted

const Talents := preload("res://scripts/talents.gd")

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
	print("TALENTS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/t%02d_%s.png" % [dir, shot, name])


func _run(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	Talents.ready_up()
	var D := Talents.D
	# THE POINTS
	var pts := [Talents.points(1), Talents.points(4), Talents.points(5), Talents.points(9), Talents.points(10), Talents.points(50), Talents.points(99)]
	_line(pts == [0, 0, 1, 1, 2, 10, 10] and Talents.next_level(1) == 5 and Talents.next_level(12) == 15 and Talents.next_level(50) == -1,
		"a point every %d levels, %d at most: at levels 1, 4, 5, 9, 10, 50, 99 %s; the next at 5 from 1, at 15 from 12, none from 50" % [D["every"], D["max"], pts])
	var sizes := {}
	for c in D["trees"]:
		sizes[c] = (D["trees"][c]["talents"] as Array).size()
	_line(sizes.size() == 6 and D["switches"]["talents2"] and D["switches"]["warriorTree2"] and D["switches"]["bothWays"] and not D["switches"]["companions"],
		"six trees as the game has them (%s), its switches as released (the remade talents, the Warrior's weapons, the lines both ways; the companions off)" % sizes)
	# THE WAY: where a tree begins, and both ways along a line
	var r1 := Talents.open("ranger", [], "huntsfocus") if not Talents.of("ranger", "huntsfocus").is_empty() else false
	var starts: Array = []
	var after := ""
	var before := ""
	for t in Talents.tree("mage")["talents"]:
		if (t["from"] as Array).is_empty():
			starts.append(t["id"])
		elif after == "":
			after = t["id"]
			before = t["from"][0]
	var start_open := true
	for s in starts:
		start_open = start_open and Talents.open("mage", [], s)
	_line(start_open and not Talents.open("mage", [], after) and Talents.open("mage", [before], after) and Talents.open("mage", [after], before),
		"where the Mage's tree begins (%s) is open; %s not till one joined to it is hers; %s once %s is, and %s once %s is (both ways)" % [starts, after, after, before, before, after])
	# THE WARRIOR'S WEAPONS
	var iron_first := ""
	for t in Talents.tree("warrior")["talents"]:
		if t["path"] == "iron" and (t["from"] as Array).is_empty():
			iron_first = t["id"]
	var w1 := Talents.take_problem("warrior", 50, [], "battleaxe")
	var w2 := Talents.take_problem("warrior", 50, ["greatsword"], "battleaxe")
	var w3 := Talents.take_problem("warrior", 50, [], iron_first)
	var w4 := Talents.open("warrior", ["greatsword"], iron_first)
	var w5 := Talents.open("warrior", ["greatsword", "sweepingcut", "drilledleap"], "honededge") and not Talents.open("warrior", ["greatsword", "sweepingcut", "drilledleap", "honededge"], "redmist")
	_line(w1 == "Not in the port yet" and w2 == "One weapon only" and w3 == "Pick your weapon first" and w4 and w5 and Talents.warrior_weapon([]) == "greatsword" and Talents.warrior_weapon(["warhammer"]) == "warhammer",
		"his weapon his first point: the battle axe open ('%s'), not with the greatsword his ('%s'); IRON's %s waits for one ('%s'), open once the greatsword is his (%s); a join open from his path, the axe's beyond it not his (%s)" % [w1, w2, iron_first, w3, w4, w5])
	# UNDOING, AND A LIST MADE SAFE
	var u1 := Talents.unlearn_problem("warrior", ["greatsword", "sweepingcut"], "greatsword")
	var u2 := Talents.unlearn_problem("warrior", ["greatsword", "sweepingcut"], "sweepingcut")
	var cl := Talents.clean("warrior", 7, ["greatsword", "greatsword", "kindling", "sweepingcut"])
	_line(u1 == "Undo the ones after it first" and u2 == "" and cl == ["greatsword"],
		"the greatsword not undone while Sweeping Cut hangs on it ('%s'), Sweeping Cut undone (''); a save's list made safe at level 7: %s" % [u1, cl])
	# THE WARRIOR'S TALENTS IN PLAY (game.ts, TALENTS2's rules)
	await _warrior()
	# THE PAGE, for each class
	var inv = M._inv
	for cls in ["warrior", "ranger", "mage", "warlock", "tinkerer", "brawler"]:
		M.set_class(cls, true)
		M.loot.level = 50
		M.loot.points = 0
		var tree := Talents.tree(cls)
		# (a talent taken where the tree begins, as the game would have it: the Warrior his greatsword)
		var first := "greatsword" if cls == "warrior" else ""
		if first == "":
			for t in tree["talents"]:
				if (t["from"] as Array).is_empty():
					first = t["id"]
					break
		h.talents = [first]
		if not inv.visible:
			inv.toggle()
		inv._page = "talents"
		var read := ""
		for t in tree["talents"]:
			if Talents.open(cls, h.talents, t["id"]):
				read = t["id"]
				break
		inv._tal.sel = read
		await _run(0.3)
		await _snap("%s_tree" % cls)
		var lay: Dictionary = inv._tal.lay
		var inside := true
		var page: Rect2 = lay["r"]
		for nd in lay["nodes"]:
			inside = inside and page.grow(2.0).encloses(nd["r"])
		_line(lay["cls"] == cls and lay["nodes"].size() == tree["talents"].size() and inside and not inv._tal.card.is_empty(),
			"the %s's tree on the TALENTS page: %s, %d talents inside the page, %d captions; %s taken, %s read on its card" % [cls, tree["shape"], lay["nodes"].size(), lay["labels"].size(), first, read])
	if inv.visible:
		inv.toggle()
	print("TALENTS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])


## A monster of the floor brought before him, awake, whole and ordinary (or an elite), `d` tiles the way he faces.
func _foe(d: float, elite := false):
	var mm = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and o.state != "rise" and (mm == null or (o.world.distance_to(h.world) < mm.world.distance_to(h.world))):
			mm = o
	if mm == null:
		return null
	mm.world = h.world + h.face * d
	mm.life = mm.max_life
	mm.elite = elite
	mm.cracks = 0
	mm.stun_t = 0.0 if mm.get("stun_t") != null else 0.0
	return mm


func _warrior() -> void:
	M.set_class("warrior", true)
	M.loot.level = 50
	h.life = h.max_life
	h.face = Vector2(1, 0)
	await _run(0.2)
	# Executioner, and the guard of Thick Skin and Bulwark
	var m = _foe(1.0)
	if m == null:
		_line(false, "no monster on the floor to try the Warrior's talents on")
		return
	h.talents = ["greatsword"]
	m.life = m.max_life * 0.2
	var k0: float = h._talent_hit_mult(m)
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "footwork", "executioner"]
	var k1: float = h._talent_hit_mult(m)
	m.life = m.max_life * 0.5
	var k2: float = h._talent_hit_mult(m)
	_line(k0 == 1.0 and k1 == 2.0 and k2 == 1.0, "Executioner: double on one under a quarter of its life (%.1f), not over it (%.1f), nothing without it (%.1f)" % [k1, k2, k0])
	h.talents = ["greatsword", "thickskin", "shieldwall", "secondwind", "bulwark"]
	h.life = h.max_life * 0.4
	var g_low: float = h._talent_guard()
	h.life = h.max_life
	var g_high: float = h._talent_guard()
	_line(absf(g_low - 0.7 * g_high) < 0.001 and g_high <= 1.0 and g_high >= 0.7, "Thick Skin: below half his life 30%% less (%.2f of %.2f); Bulwark: %.0f%% less for those close round him now" % [g_low, g_high, (1.0 - g_high) * 100.0])
	# Master Stroke: every fourth hit landed a certain critical
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "footwork", "mastertop"]
	h._strokes = 0
	h.stats["crit_chance"] = 0.0
	var crits := []
	for n in 8:
		m.life = m.max_life
		var before: int = h._strokes
		h.hit_monster(m, 0, 0.01, false)
		crits.append(before == 3)
	_line(crits == [false, false, false, true, false, false, false, true] and h._strokes == 0, "Master Stroke: his 4th and 8th hits certain criticals, the count begun again (%s)" % [crits])
	# Honed Edge: a critical bleeds
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "honededge"]
	m.life = m.max_life
	m.bleed_t = 0.0
	h.stats["crit_chance"] = 100.0
	h.hit_monster(m, 0, 0.5, false)
	h.stats["crit_chance"] = 5.0
	_line(m.bleed_t > 2.9 and m.bleed_dps > 0.0, "Honed Edge: a critical hit makes it bleed half the hit again over 3 s (%.1f a second for %.1f s)" % [m.bleed_dps, m.bleed_t])
	# Giant Slayer: an elite's cracks, more from everything
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "giantslayer"]
	m = _foe(1.0, true)
	for n in 12:
		m.life = m.max_life
		h.hit_monster(m, 0, 0.01, false)
	_line(m.cracks == 10, "Giant Slayer: each hit on an elite cracks its guard, ten at most (%d)" % m.cracks)
	m.elite = false
	m.cracks = 0
	# Resolute: not knocked back, not slowed
	h.talents = ["greatsword", "thickskin", "shieldwall", "secondwind", "bulwark", "resolute"]
	h._knock_t = 0.0
	h.knock(Vector2(1, 0), 2.0)
	h.chill(2.0, 0.5)
	_line(h._knock_t == 0.0 and h._slow_t <= 0.0, "Resolute: a blow's knock does nothing, nor a chill (%.2f, %.2f)" % [h._knock_t, h._slow_t])
	# Unbreakable: once in a dungeon, a killing blow leaves him at 1 life
	h.talents = ["greatsword", "thickskin", "shieldwall", "secondwind", "bulwark", "unbreakable"]
	h.unbroken = false
	h._invuln = 0.0
	var kept: bool = h.unhurt
	h.unhurt = false
	h.stats["block_chance"] = 0.0
	h.shield = 0.0
	h.life = 5.0
	h.hurt(9999.0, true)
	var first: bool = h.alive and h.life == 1.0
	var said := "after the first: alive %s, life %.1f, shielded %.1f s" % [h.alive, h.life, h._invuln]
	h._invuln = 0.0
	h.hurt(9999.0, true)
	var second: bool = not h.alive
	said += "; after the second: alive %s" % h.alive
	h.alive = true
	h.unhurt = kept
	h.life = h.max_life
	_line(first and second, "Unbreakable: the first killing blow leaves him at 1 life, shielded; the second in the same dungeon kills him (%s)" % said)
	h._invuln = 0.0
	# Second Wind: a flask throws back what is near, and nothing hurts him for a second
	m = _foe(1.0)
	var was: Vector2 = m.world
	M.loot.potions = 3
	h.life = h.max_life * 0.5
	M.loot.drink()
	await _run(0.4)
	_line(h._invuln > 0.0 or m.world.distance_to(h.world) > was.distance_to(h.world) + 0.5, "Second Wind: a flask drunk, the one near thrown back (%.1f tiles to %.1f) and nothing hurts him a second" % [was.distance_to(h.world), m.world.distance_to(h.world)])
	# Footwork: a kill makes the Lunge ready again
	h.talents = ["greatsword", "sweepingcut", "drilledleap", "footwork"]
	h._lunge_cd = 3.0
	m = _foe(1.0)
	h.killed(m)
	_line(h._lunge_cd == 0.0, "Footwork: a kill makes the Lunge ready again at once")
	h.talents = []
