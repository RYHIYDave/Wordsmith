## THE CHECK OF WHAT THE MONSTERS' PICTURES GIVE OFF (--only=glows; render.ts monsterLit, light, MONSTER_LIGHT_MIN; engine/px.ts
## drawLights): on floor 2, in the dark, a cultist near: its picture's lights (its eyes, its fire) laid over the dark; a light of a
## picture 7 or more across cutting a pool in the dark round it; none while it is frozen; and the hero's own lights over the dark.
## Pictured. A line a thing; then the sum, GLOWS.
extends RefCounted

const BakedHero := preload("res://scripts/baked_hero.gd")

const Words := preload("res://scripts/words.gd")
const Iso := preload("res://scripts/iso.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("GLOWS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(0.5)
	var mons: Array = M._monsters.list.filter(func(m): return is_instance_valid(m) and not m.dead)
	var lit: Array = mons.filter(func(m): return not (m._lit_f.get("lights", []) as Array).is_empty())
	_line(not lit.is_empty(), "%d of the floor's %d monsters' pictures give off light (%s)" % [lit.size(), mons.size(), ", ".join(PackedStringArray(_kinds(lit)))])
	# (a cultist, and the hero set down a little way from it, in the dark)
	var c = null
	for m in lit:
		if m.kind == "cultist":
			c = m
			break
	if c == null:
		c = lit[0]
	h.world = M.loot.floor_near(c.world + Vector2(3.0, 3.0))
	h.home = h.world
	await M._wait(0.8)
	await M._snap(dir + "/g01_cultist_in_the_dark.png")
	var ls: Array = c._lit_f.get("lights", [])
	_line(not ls.is_empty() and c._lights.z_index > 50, "a %s: %d lights of its picture laid over the dark (its eyes%s)" % [c.kind, ls.size(), ", its fire" if ls.any(func(l): return float(l["r"]) > 3.0) else ""])
	# (one whose picture's light is 7 or more across cuts a pool in the dark round it)
	var big = null
	for m in mons:
		if (m._lit_f.get("lights", []) as Array).any(func(l): return float(l["r"]) >= 7.0):
			big = m
			break
	if big != null and M.look != null:
		var before: int = M.look._spots_at.size()
		big.cut_lights(M.look)
		_line(M.look._spots_at.size() > before, "a %s's light %.0f across cuts a pool in the dark round it" % [big.kind, (big._lit_f["lights"] as Array).map(func(l): return float(l["r"])).max()])
	else:
		_line(true, "(no monster here with a light 7 or more across in its picture just now)")
	# (frozen, it gives off none)
	c.frozen_t = 1.0
	c._lights.queue_redraw()
	var before2: int = M.look._spots_at.size() if M.look != null else 0
	c.cut_lights(M.look)
	_line((M.look == null or M.look._spots_at.size() == before2), "frozen, it gives off no light")
	c.frozen_t = 0.0
	_line(h._lights.z_index > 50, "the hero's own lights over the dark too (render.ts heroLit)")
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


func _kinds(list: Array) -> Array:
	var seen := {}
	for m in list:
		seen[m.kind] = true
	return seen.keys()


## THE TOWN'S SERVICES' NAMES (--only=townnames; render.ts STATION_NAME, NAME_LIFT): each over its service; the one he stands at
## in white. Pictured.
func town(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(0.8)
	var T = null
	for c in M._place.get_children():
		if c.get_script() == preload("res://scripts/town.gd"):
			T = c
	await M._snap(dir + "/g02_town_names.png")
	_line(T != null and T._names != null and T._names.z_index > 50 and (T.data["stations"] as Array).size() == 7, "the town's seven services named over them, over everything")
	var lex: Dictionary = (T.data["stations"] as Array).filter(func(s): return s["kind"] == "lexicon")[0]
	h.world = Vector2(lex["x"], lex["y"]) + Vector2(0.9, 0.9)
	await M._wait(0.4)
	await M._snap(dir + "/g03_town_near_lexicon.png")
	_line(T.prompt[1] == "lexicon", "by the Lexicon: its name in white, his use the Lexicon's (%s)" % T.prompt[0])
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE FIRST LEVELS (--only=openings; defs.ts FIRST_LEVELS, MOVE_OPENS; game.ts moveOpen, gainXp; ui/hud.ts OPENING, drawMoveToast): a
## new Warrior has his Strike alone, in the middle where the two plates would be, no dodge; the Whirlwind and the Lunge cannot be used.
## Level 2: the Whirlwind opens, its moment: the Strike's plate sliding over, the new one opening out from its middle with its
## flourish, NEW MOVE at the top, "A new move: WHIRLWIND."; then it can be used. Level 5: the Lunge's button, the same. Pictured.
func openings(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	var hud = M._hud
	await M._wait(0.6)
	await M._snap(dir + "/o01_level1_strike_alone.png")
	h.auto_whirl = true
	h.auto_lunge = h.world + h.face * 3.0
	await M._wait(0.3)
	var used: bool = h._act in ["whirl", "lunge"]
	h.auto_whirl = false
	_line(h.first_levels and hud._plates.size() == 1 and hud._lunge.size == Vector2.ZERO and not used,
		"level 1: his Strike alone in the middle, no Whirlwind's plate, no dodge's button; the Whirlwind and the Lunge asked for: nothing")
	await M._wait(0.6)
	loot.gain_xp(loot.xp_to_next(1) - loot.xp + 0.5)
	var said: bool = loot.msgs.any(func(m): return str(m["text"]) == "A new move: WHIRLWIND.")
	_line(loot.level == 2 and not M.move_toast.is_empty() and int(M.move_toast["skill"]) == 1 and said, "level 2: the Whirlwind opens: \"A new move: WHIRLWIND.\", its moment begun")
	while float(M.move_toast.get("t", 9.0)) < 0.42:
		await M.get_tree().process_frame
	await M._snap(dir + "/o02_whirlwind_opening.png")
	while float(M.move_toast.get("t", 9.0)) < 1.0:
		await M.get_tree().process_frame
	await M._snap(dir + "/o03_whirlwind_flourish.png")
	while not M.move_toast.is_empty():
		await M.get_tree().process_frame
	await M._snap(dir + "/o04_whirlwind_open.png")
	h.auto_whirl = true
	await M._wait(0.4)
	var whirled: bool = h._act == "whirl"
	h.auto_whirl = false
	_line(hud._plates.size() == 2 and whirled, "its plate beside the Strike's; held, he whirls")
	await M._wait(1.5)
	while loot.level < 5:
		loot.gain_xp(loot.xp_to_next(loot.level) - loot.xp + 0.5)
	_line(not M.move_toast.is_empty() and int(M.move_toast["skill"]) == 2, "level 5: the Lunge opens, its moment begun")
	while float(M.move_toast.get("t", 9.0)) < 0.5:
		await M.get_tree().process_frame
	await M._snap(dir + "/o05_lunge_opening.png")
	while not M.move_toast.is_empty():
		await M.get_tree().process_frame
	h.auto_lunge = h.world + h.face * 3.0
	await M._wait(0.1)
	_line(hud._lunge.size != Vector2.ZERO and h._act == "lunge", "its button at the right; pressed, he lunges")
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])



## SET BESIDE THE GAME (--only=compare): what setting Godot's pictures beside the game's turned up, each as the game has it.
##   THE QUEST MARKER over whoever has a quest for him, drawn last (render.ts questMarks, after the services' names): over the
##     place's dark (z 50) and the names (z 60). A new game: over the wordsmith. Pictured.
##   THE LIFE GLOBE as glass in an iron band (hud.ts globeGlass, ART_TWEAKS.globe on), its thin ring the colour of what ails him
##     (hud.ts lifeRim): burning, the fire's. Pictured.
##   COMING INTO A FLOOR he faces down and to the right, his face to the one playing (game.ts enterDungeon: fx 1, fy 0), and his
##     picture is the one that faces so (render.ts: the side read from fx, fy as he is drawn), whichever way he last faced. Pictured.
##   ON A FLOOR, carrying something back: the marker over the floor's waypoint home, 40 game pixels up. Pictured.
func compare(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(1.0)
	var q6 = M.quest610
	await M._snap(dir + "/c01_town_marker_over_the_wordsmith.png")
	_line(q6 != null and q6._marks.z_index > 60 and q6.givers().has("wordsmith"), "a new game: the marker over the wordsmith (%s), drawn over the dark and the names (z %d)" % [str(q6.givers()), q6._marks.z_index])
	var hud = M._hud
	h.burn_t = 2.0
	await M._wait(0.2)
	await M._snap(dir + "/c02_globe_burning.png")
	_line(not hud._globes.is_empty() and hud._life_rim() == hud.P["fr4"], "the life globe painted as glass in its iron band (%d kept); burning, its ring the fire's" % hud._globes.size())
	h.burn_t = 0.0
	h._turn(Vector2(-0.7071, -0.7071))
	var was: String = BakedHero.SIDES[h._side]
	M.go_to("floor3", "down")
	await M._wait(1.6)
	await M._snap(dir + "/c03_floor3_facing_in.png")
	_line(h.face.distance_to(Vector2(1, 0)) < 0.01 and BakedHero.SIDES[h._side] == "front", "facing %s in town, he comes into floor 3 facing down and to the right %s, his picture the one that faces so (%s)" % [was, str(h.face), BakedHero.SIDES[h._side]])
	M.loot.quest = "heart"
	await M._wait(0.6)
	await M._snap(dir + "/c04_marker_over_the_waypoint.png")
	_line(q6.turn_in_for() == "wordsmith" and M.map.waypoint != null, "carrying the stone, the marker over floor 3's waypoint home (he brings it back for the %s)" % q6.turn_in_for())
	M.loot.quest = ""
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE MENUS IN THE GAME'S OWN LETTERS AND FRAMES (--only=menus; ui/inventory.ts drawInventory, ui/town.ts vendorSide): a new
## Warrior in town, his gear screen opened on each of its pages, and the armourer's shelf beside it. Pictured.
func menus(main, hero, dir: String) -> void:
	M = main
	h = hero
	await M._wait(0.8)
	var inv = M._inv
	inv.toggle()
	await M._wait(0.4)
	await M._snap(dir + "/u01_gear.png")
	# (a level gained: its +5 asked on a row of its own under his numbers)
	M.loot.points = 5
	inv.queue_redraw()
	await M._wait(0.2)
	await M._snap(dir + "/u01b_points.png")
	M.loot.points = 0
	for pg in ["attacks", "stats", "talents"]:
		inv._page = pg
		inv.queue_redraw()
		await M._wait(0.3)
		await M._snap(dir + "/u02_%s.png" % pg)
	inv._page = "gear"
	# (his lexicon: a few words held, LEXICON pressed: every word on a panel over the game's half)
	var lt = M.loot
	lt.ring_lit = true
	# (no new player's lesson waiting: his first word is long set)
	lt.taught = true
	for w in ["fire", "frost", "swift", "leech", "poison"]:
		lt.words[w] = 1 + (1 if w == "frost" else 0)
	lt.derive()
	inv._press("lex", null)
	await M._wait(0.3)
	await M._snap(dir + "/u05_lexicon.png")
	_line(inv._lex and inv._lex_panel.has_area() and inv._pouch.filter(func(c): return c.get("lex", false)).size() == lt.held().size(), "LEXICON: every word he holds (%d) on a panel over the game's half" % lt.held().size())
	inv._press("lex", null)
	inv.toggle()
	await M._wait(0.3)
	inv.open_shop("armourer")
	await M._wait(0.4)
	await M._snap(dir + "/u03_armourer.png")
	_line(inv.visible and inv.shop == "armourer", "the gear screen and the armourer's shelf open")
	# (a piece sold to him: on his BUY BACK shelf for what he paid; one of his picked, its card and BUY under the cells)
	var loot = M.loot
	loot.gold = 60
	var stock: Array = loot.shops["armourer"]
	loot.bag.append(stock[0].duplicate(true))
	var before: int = loot.gold
	inv._press("bag", loot.bag.size() - 1)
	var paid: int = loot.gold - before
	inv._shelf_pick = ["buy", 1]
	await M._wait(0.3)
	await M._snap(dir + "/u04_sold_and_picked.png")
	_line(loot.sold.size() == 1 and paid == loot.sell_value(loot.sold[0]), "a piece sold for %d gold: on his BUY BACK shelf" % paid)
	var why: String = loot.buy_back(0)
	_line(why == "" and loot.sold.is_empty() and loot.gold == before, "bought back for the same: back in the bag, the gold as it was (%d)" % loot.gold)
	# (at a service, ALL: the bottom turned to every word, the bag not there)
	inv._shelf_pick = []
	inv._press("swap", null)
	await M._wait(0.3)
	await M._snap(dir + "/u06_all_words.png")
	_line(inv._all and inv._cells.filter(func(c): return not c["worn"]).is_empty(), "at the vendor's, ALL: every word in the bottom, the bag put by")
	inv._press("swap", null)
	# (the town's other services beside the gear screen, on the left half in the game's letters: the wordsmith, the stash, the
	# Lexicon, the stranger)
	inv.toggle()
	await M._wait(0.2)
	inv.open_wordsmith()
	await M._wait(0.3)
	await M._snap(dir + "/u07_wordsmith.png")
	inv.toggle()
	for k in ["stash", "lexicon", "stranger"]:
		await M._wait(0.2)
		inv.open_service(k)
		await M._wait(0.3)
		await M._snap(dir + "/u08_%s.png" % k)
		inv.toggle()
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE EFFECTS THAT WERE STAND-INS (--only=fxleft), each as the game draws it, on floor 2 by the hero, pictured:
##   a pot broken: its eight sparks (game.ts breakProps 'spark');
##   a monster's bone arrow in flight (render.ts: its bone shaft, its red head, its shadow);
##   one of the Warden's bolts (render.ts: a ball of light of its element, art/icons.ts orbFrame);
##   a red circle coming down: the game's own burst (game.ts updateZones 'burst', style 'blast');
##   the Headsman's vault: its mark, its slam on the floor and what flies from it (art/headsman2_shots.ts).
func fxleft(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	await M._wait(1.0)
	var fx = h.fx
	# (one plain monster lends its blow, held still and out of sight; the rest of the floor's taken off it, so that each effect is
	# seen alone)
	var src = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and (m.words as Array).is_empty() and str(m.blow().get("el", "phys")) == "phys":
			src = m
			break
	for m in M._monsters.list:
		if is_instance_valid(m) and m != src:
			m.queue_free()
	M._monsters.list.assign([src])
	src.process_mode = Node.PROCESS_MODE_DISABLED
	src.visible = false
	# (and what they had already set going on the floor, gone)
	for p in M._monsters.perils.list:
		M._monsters.perils._film_free(p)
	M._monsters.perils.list = []
	# (the pot farthest from every monster, in a quiet room)
	var far := func(w: Vector2) -> float:
		var d := INF
		for m in M._monsters.list:
			if is_instance_valid(m):
				d = minf(d, w.distance_to(m.world))
		return d
	var pot = null
	var in_boss := func(w: Vector2) -> bool:
		for r in M.map.rooms:
			if str(r.get("kind", "")) == "boss" and w.x >= float(r["x"]) - 4.0 and w.y >= float(r["y"]) - 4.0 and w.x < float(r["x"]) + float(r["w"]) + 4.0 and w.y < float(r["y"]) + float(r["h"]) + 4.0:
				return true
		var yard = M.look.data.get("zones", {}).get("yard") if M.look != null else null
		return yard != null and w.distance_to(Vector2(float(yard["x"]), float(yard["y"]))) < 22.0
	for p in M.map.props:
		if (p["kind"] == "urn" or p["kind"] == "barrel") and int(p["state"]) == 0 and not in_boss.call(Vector2(p["x"], p["y"])):
			if pot == null or far.call(Vector2(p["x"], p["y"])) > far.call(Vector2(pot["x"], pot["y"])):
				pot = p
	await M._wait(0.3)
	if pot != null and h.props != null:
		h.world = M.loot.floor_near(Vector2(pot["x"], pot["y"]) + Vector2(1.0, 1.0))
		await M._wait(0.5)
		var sparks: int = int(fx.seen.get("spark", 0))
		h.props.strike(Vector2(pot["x"], pot["y"]), 0.6)
		await M._wait(0.06)
		await M._snap(dir + "/x01_a_pot_broken.png")
		_line(int(fx.seen.get("spark", 0)) > sparks and int(pot["state"]) == 1, "a %s broken: its sparks (%d)" % [pot["kind"], int(fx.last.get("spark", {}).get("n", 0))])
	else:
		_line(false, "no pot on this floor to break")
	# (a bone arrow and a bolt, loosed at him by one of the floor's monsters from four tiles off)
	var at: Vector2 = h.world
	for look in ["arrow", "bolt"]:
		# (from a spot three or four tiles off with a clear line to him)
		var from: Vector2 = M.loot.floor_near(at + Vector2(-4.0, 0.0))
		for k in 8:
			var q: Vector2 = M.loot.floor_near(at + Vector2(3.5, 0.0).rotated(k * PI / 4.0))
			if q.distance_to(at) > 2.8 and M.sees(q, at):
				from = q
				break
		var was: Vector2 = src.world
		src.world = from
		M._monsters.shoot(src, (at - from).normalized(), 5.0, 8.0, 0.0, look)
		src.world = was
		await M._wait(0.15)
		var flying: bool = M._flying(look)
		await M._snap(dir + "/x02_%s_in_flight.png" % look)
		_line(flying, "a monster's %s in flight, as the game draws it" % ("bone arrow" if look == "arrow" else "bolt (its ball of light)"))
		await M._wait(1.2)
	# (a red circle coming down)
	var bursts: int = int(fx.seen.get("burst", 0))
	M._monsters.perils.warn(at.x + 1.5, at.y, 1.2, 0.6, 0.0, src)
	await M._wait(0.4)
	await M._snap(dir + "/x03_red_circle.png")
	await M._wait(0.28)
	await M._snap(dir + "/x04_red_circle_comes_down.png")
	_line(int(fx.seen.get("burst", 0)) == bursts + 1 and str(fx.last.get("burst", {}).get("style", "")) == "blast", "the red circle comes down: the game's own burst ('blast')")
	await M._wait(0.8)
	# (the vault: its mark, its slam)
	var spot: Vector2 = at + Vector2(2.0, 1.0)
	M._monsters.perils.vault_mark(spot.x, spot.y, 1.2, src)
	src.state = "act"
	await M._wait(0.9)
	await M._snap(dir + "/x05_vault_mark.png")
	src.state = "chase"
	M._monsters.perils.vault_slam(spot.x, spot.y)
	await M._wait(0.08)
	await M._snap(dir + "/x06_vault_slam.png")
	await M._wait(0.25)
	await M._snap(dir + "/x07_vault_what_flies.png")
	var slams: Array = M._monsters.perils.list.filter(func(p): return p["kind"] == "vault_slam")
	_line(slams.size() == 1, "the vault: its mark as wide as the slam, the slam's cracks, crater and ring of fire, what flies from it")
	h.unhurt = false
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE HEADSMAN'S YARD'S OWN GATE AS IT FALLS (--only=yardgate; art/yard_gate.ts, render.ts standDoors; look.gd yard_gate_fall):
## he walks into the yard, and its gate falls by its own beat behind him (held juddering, dropped, landed, a bounce), the mark on
## its keystone alight from the landing on, its slam's dust and sparks; then its frames one by one, pictured; the Headsman dead,
## it rises, its mark dark again.
func yardgate(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	await M._wait(1.0)
	var look = M.look
	var gi := -1
	for i in M.map.doors.size():
		if M.map.doors[i]["kind"] == "bossgate":
			gi = i
	_line(gi >= 0 and look != null and look.has_yard_gate(gi), "floor 2's boss gate (%d) has its own fall: %s" % [gi, look != null and gi >= 0 and look.has_yard_gate(gi)])
	if gi < 0 or look == null or not look.has_yard_gate(gi):
		return
	var d: Dictionary = M.map.doors[gi]
	var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
	var plane := float(d["plane"])
	var out := float(d["out"])
	var along: bool = d["alongX"]
	# (outside it, the gate up, its mark dark: then in, 3 tiles past it)
	var outside := Vector2(mid.x, plane + out * 2.5) if along else Vector2(plane + out * 2.5, mid.y)
	var inside := Vector2(mid.x, plane - out * 3.5) if along else Vector2(plane - out * 3.5, mid.y)
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.boss:
			m.queue_free()
	M._monsters.list.assign(M._monsters.list.filter(func(m): return is_instance_valid(m) and m.boss))
	h.world = M.loot.floor_near(outside)
	await M._wait(0.8)
	var yg: Dictionary = look._yg
	await M._snap(dir + "/y01_up.png")
	_line(int(d["want"]) == 1 and yg["f"] == -1 and not yg["lit"], "up as he comes: the look's own gate, its mark dark (want %d, its own frame %d)" % [int(d["want"]), yg["f"]])
	h.world = M.loot.floor_near(inside)
	await M._w_until(func(): return int(d["want"]) == 0, 3.0)
	await M._wait(0.15)
	var f1: int = yg["f"]
	var lit1: bool = yg["lit"]
	_line(int(d["want"]) == 0 and f1 >= 2 and f1 <= 10 and not lit1, "fallen behind him: held juddering at the top first (frame %d, its mark not yet alight)" % f1)
	await M._w_until(func(): return yg["lit"], 1.0)
	var sf: int = yg["slam_f"]
	_line(yg["lit"] and sf >= 0 and sf < 6, "landed: its mark alight, its slam playing (its frame %d)" % sf)
	await M._wait(1.0)
	_line(yg["f"] == 18 and yg["lit"] and yg["slam_f"] == -1 and not yg["slam"].visible, "down for good: its last frame (%d), its mark alight, its slam over" % yg["f"])
	# --- its beat, frame by frame, pictured (the doors held, the gate set to each frame)
	M._doors.process_mode = Node.PROCESS_MODE_DISABLED
	var raise: Array = yg["tune"]["raise"]
	var shown: Array = []
	for f in [3, 7, 10, 11, 12, 14, 17, 26]:
		look.yard_gate_fall((float(f) + 0.5) / 30.0)
		await M._wait(0.05)
		await M._snap("%s/y02_frame_%02d.png" % [dir, f])
		shown.append("%d: raise %d%s%s" % [f, int(raise[mini(f, raise.size() - 1)]), ", lit" if yg["lit"] else "", ", slam %d" % yg["slam_f"] if yg["slam_f"] >= 0 else ""])
	var bars_up: int = yg["bars"].filter(func(b): return b.visible).size()
	_line(shown.size() == 8, "its frames: %s (%d bars shown)" % [", ".join(shown), bars_up])
	M._doors.process_mode = Node.PROCESS_MODE_INHERIT
	look.yard_gate_fall(2.0)
	# --- the Headsman dead: it rises, the look's own again
	var boss = M._d_boss()
	if boss != null:
		boss.dead = true
	await M._w_until(func(): return int(d["want"]) == 1, 3.0)
	await M._wait(1.4)
	await M._snap(dir + "/y03_risen.png")
	var arch_on: int = yg["arch"].filter(func(a): return a.visible).size()
	_line(int(d["want"]) == 1 and yg["f"] == -1 and not yg["lit"] and arch_on == 0 and float(d["open"]) == 1.0, "the Headsman dead: it rises, the look's own gate again, its mark dark (open %.2f)" % float(d["open"]))
	h.unhurt = false
	print("YARDGATE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## FRENZIED ON THE PRISON'S BOSSES (--only=bossrage; game.ts updateMonsters `rage`, game/bosses.ts step): each of floors 2 to 5's
## that fights by its own script (the Headsman; the Chained One and the Stoker; the Amalgamation and the mini fleshmancers; the
## Fleshmancer and the keybearers), given Frenzied and brought to half its life, runs down its wait and its acts' waits faster
## by the game's rage (1 + FRENZY.monster x a half); the Fleshmancer, hurt, by his hurry on top; without it, at its plain pace.
func bossrage(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var fm: float = Words.data()["frenzy"]["monster"]
	var kinds := {"floor2": ["headsman"], "floor3": ["chained", "stoker"], "floor4": ["amalgam", "minifm"], "floor5": ["fleshmancer", "minifm", "keyblade", "keyflame"]}
	var dt := 0.1
	for place in kinds:
		M.way_depth = maxi(M.way_depth, int(place.substr(5)))
		await M.go_to(place, "down")
		await M._wait(0.8)
		for kind in kinds[place]:
			var m = null
			for q in M._monsters.list:
				if is_instance_valid(q) and not q.dead and q.kind == kind:
					m = q
					break
			if m == null or m.h2 == null:
				_line(false, "%s: no %s with its own script" % [place, kind])
				continue
			var ai = m.h2
			# (its own acts' waits begun, nothing under way, nothing ready: one step of it, its waits measured)
			var res := []
			# (the Fleshmancer at three tenths of his life, under his hurry's line; the rest at half)
			var share := 0.3 if kind == "fleshmancer" else 0.5
			for frenzied in [false, true]:
				m.words = ["frenzied"] if frenzied else []
				m.half = []
				m.life = m.max_life * share
				m.curse_t = 0.0
				if ai.get("cds") != null and (ai.cds as Array).is_empty():
					ai.step(m, 0.0, h)
				if ai.get("act") != null:
					ai.act = null
				m.state = "chase"
				m._cd = 100.0
				var has_cds: bool = ai.get("cds") != null and not (ai.cds as Array).is_empty()
				if has_cds:
					for k in ai.cds.size():
						ai.cds[k] = 100.0
				ai.step(m, dt, h)
				res.append([(100.0 - m._cd) / dt, (100.0 - float(ai.cds[0])) / dt if has_cds else -1.0])
			var want := 1.0 + fm * (1.0 - share)
			var hurry := 1.0
			if kind == "fleshmancer":
				hurry = float(ai.HURRY["by"]) if share < float(ai.HURRY["at"]) else 1.0
			var ok: bool = absf(res[0][0] - hurry) < 1e-3 and absf(res[1][0] - want * hurry) < 1e-3
			if res[0][1] >= 0.0:
				ok = ok and absf(res[0][1] - hurry) < 1e-3 and absf(res[1][1] - want * hurry) < 1e-3
			_line(ok, "%s's %s at %d%% of its life: its wait run down x%.3f, its acts' x%.3f; Frenzied, x%.3f and x%.3f (the game: x%.3f%s)" % [place, kind, roundi(share * 100.0), res[0][0], res[0][1], res[1][0], res[1][1], want * hurry, (", his hurry x%.2f in it" % hurry) if hurry != 1.0 else ""])
			m.words = []
	h.unhurt = false
	print("BOSSRAGE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## SEEN THROUGH ON FLOORS 1 TO 5 (--only=veil; render.ts veil): a big thing that stands (60 game pixels across and 70 high and
## more) drawn at SEEN_THROUGH while the hero is behind it and it covers his middle, his head or his feet; solid again once he is
## in front; and for him alone, not for a monster behind it (the game's seenFoes are the open ground's). On floor 4 and on
## floor 2 (the great bell, in the first kind of look). Pictured.
func veil(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	for place in ["floor3", "floor4", "floor5", "floor2"]:
		M.way_depth = maxi(M.way_depth, int(place.substr(5)))
		await M.go_to(place, "down")
		await M._wait(0.8)
		var look = M.look
		var tall: Array = look._tall
		# (the big things he can stand behind and in front of: open floor a tile behind it and a tile before it)
		var spots: Array = []
		for q in tall:
			var pic: Dictionary = look._pics[q["key"]]
			var at: Vector2 = ((q["box"] as Rect2).position + pic["anchor"]) / 2.0
			var dsum: float = q["d"]
			var dif: float = at.x / 16.0
			var w0 := Vector2((dsum + dif) / 2.0, (dsum - dif) / 2.0)
			var back: Vector2 = w0 - Vector2(0.7, 0.7)
			var front: Vector2 = w0 + Vector2(0.9, 0.9)
			if M.map.walkable(floori(back.x), floori(back.y)) and M.map.walkable(floori(front.x), floori(front.y)) and look.covering(back).has(tall.find(q)):
				spots.append([q, back, front])
		_line(not tall.is_empty(), "%s: %d big things to be seen through, %d he can stand behind" % [place, tall.size(), spots.size()])
		if spots.is_empty():
			continue
		var e: Dictionary = spots[0][0]
		for m in M._monsters.list:
			if is_instance_valid(m):
				m.process_mode = Node.PROCESS_MODE_DISABLED
		h.world = spots[0][1]
		await M._wait(0.4)
		var a_behind := _alpha_of(e)
		await M._snap("%s/v_%s_behind.png" % [dir, place])
		_line(look.seen_through() >= 1 and absf(a_behind - 0.38) < 1e-3, "%s: he behind %s, its picture over him: drawn at %.2f (the game's SEEN_THROUGH 0.38)" % [place, e["key"], a_behind])
		h.world = spots[0][2]
		await M._wait(0.2)
		var a_front := _alpha_of(e)
		await M._snap("%s/v_%s_in_front.png" % [dir, place])
		_line(absf(a_front - 1.0) < 1e-3, "%s: he in front of it: solid again (%.2f)" % [place, a_front])
		# (a monster in sight behind it, he away in front: not seen through, his alone)
		var mon = null
		for m in M._monsters.list:
			if is_instance_valid(m) and not m.dead:
				mon = m
				break
		if mon != null:
			mon.world = spots[0][1]
			mon.seen = true
			await M._wait(0.2)
			_line(absf(_alpha_of(e) - 1.0) < 1e-3, "%s: a monster behind it (%s), he in front: solid (%.2f), as the game's veil is his alone" % [place, mon.kind, _alpha_of(e)])
	h.unhurt = false
	print("VEIL: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


func _alpha_of(e: Dictionary) -> float:
	var node = e["node"]
	if int(e["k"]) >= 0:
		return float(node.alpha[int(e["k"])])
	return float(node.modulate.a) if e.get("mod", false) else float(node.self_modulate.a)


## FLOOR 9'S SIDE BOSSES' PICTURES FETCHED AS THEIR LAIRS ARE ENTERED (--only=lairfetch; monsters.gd FETCH_AT, baked_figure.gd
## fetch): as the Pinewood begins, none of the Troll Chieftain's nor the Mist Wolf's sheets are held; come to the camp, the
## chieftain's are taken in (off the game's thread) and he is drawn, the wolf's still not; come to the glade, the wolf's.
func lairfetch(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.way_depth = maxi(M.way_depth, 9)
	await M.go_to("floor9", "down")
	await M._wait(1.5)
	var who := {}
	for m in M._monsters.list:
		if is_instance_valid(m) and m.kind in ["warchief", "mistwolf"]:
			who[m.kind] = m
	var held := func(m) -> int:
		var k := 0
		for i in m.art.sheets.size():
			if m.art.sheets[i] != null or (m.art._asked.has(i) and ResourceLoader.load_threaded_get_status(m.art._paths[i]) == ResourceLoader.THREAD_LOAD_LOADED):
				k += 1
		return k
	var all_of := func(m) -> int:
		return m.art.sheets.size()
	_line(who.size() == 2, "floor 9's two side bosses: %s" % [who.keys()])
	if who.size() < 2:
		return
	var tc = who["warchief"]
	var mw = who["mistwolf"]
	_line(tc.art.deferred and mw.art.deferred and not tc.art.fetched and not mw.art.fetched and held.call(tc) == 0 and held.call(mw) == 0,
		"as the Pinewood begins (he %.0f tiles from the chieftain, %.0f from the wolf): none of their %d and %d sheets held" % [h.world.distance_to(tc.world), h.world.distance_to(mw.world), all_of.call(tc), all_of.call(mw)])
	# (to the camp's edge: the chieftain's taken in, the wolf's not)
	var camp = M.map.area("lair")
	var glade = M.map.area("side")
	for m in M._monsters.list:
		if is_instance_valid(m) and m != tc and m != mw:
			m.process_mode = Node.PROCESS_MODE_DISABLED
	var near_camp: Vector2 = M._free_near(Vector2(camp["blob"]["x"], camp["blob"]["y"]))
	h.world = near_camp
	M.sight.see_all()
	await M._w_until(func(): return held.call(tc) == all_of.call(tc), 10.0)
	await M._wait(0.6)
	await M._snap(dir + "/lf_the_camp.png")
	_line(tc.art.fetched and held.call(tc) == all_of.call(tc) and not mw.art.fetched and held.call(mw) == 0,
		"in the chieftain's camp: his %d sheets in hand (%d), the wolf's still none (%d)" % [all_of.call(tc), held.call(tc), held.call(mw)])
	h.world = M._free_near(Vector2(glade["blob"]["x"], glade["blob"]["y"]))
	await M._w_until(func(): return held.call(mw) == all_of.call(mw), 10.0)
	await M._wait(0.6)
	await M._snap(dir + "/lf_the_glade.png")
	_line(mw.art.fetched and held.call(mw) == all_of.call(mw), "in the wolf's glade: its %d sheets in hand (%d)" % [all_of.call(mw), held.call(mw)])
	h.unhurt = false
	print("LAIRFETCH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE BOSSES' CALLED LINES IN THEIR OWN VOICES (--only=voices; game/boss_calls.ts, engine/audio.ts speakBoss; tools/godot_voices.mjs):
## every take a sound the Godot side can play; the Warden (floor 1, his moves), the Chained One (floor 3, his own script), the Rat
## King (floor 12) and the King (floor 19, the act scripts) each begin a big move: its line over him and heard aloud; another
## within 5 s neither shown nor heard; the King's charge, his basic blow, not again within 20 s.
func voices(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var V: Dictionary = preload("res://scripts/monsters.gd").voices()
	var files := 0
	var bad_files: Array = []
	for kind in V["voices"]:
		for line in V["voices"][kind]:
			for f in V["voices"][kind][line]:
				files += 1
				var st = load("res://assets/voices/" + str(f))
				if not (st is AudioStream) or st.get_length() <= 0.2:
					bad_files.append(f)
	_line(files == 88 and bad_files.is_empty(), "%d bosses, %d takes of their lines, each a sound to play (%s)" % [V["voices"].size(), files, "all" if bad_files.is_empty() else str(bad_files)])
	var said := func() -> Array:
		return M._monsters.said_aloud.back() if not M._monsters.said_aloud.is_empty() else []
	for place in ["floor1", "floor3", "floor12", "floor19"]:
		M.way_depth = maxi(M.way_depth, int(place.substr(5)))
		await M.go_to(place, "down")
		await M._wait(0.8)
		var b = M._d_boss()
		if b == null:
			_line(false, "%s: no boss" % place)
			continue
		var before: int = M._monsters.said_aloud.size()
		var want := ""
		h.world = M._free_near(b.world + Vector2(3.0, 0.0))
		await M._wait(0.2)
		if b.kind == "warden":
			var i: int = b._moves.map(func(mv): return mv["id"]).find("bolts")
			b._start(i, h, b.world.distance_to(h.world))
			want = str(V["calls"]["warden"]["bolts"])
		elif b.kind == "chained":
			var i: int = b.h2.ACTS.map(func(a): return a["id"]).find("hook")
			b.h2._start(b, i, h)
			want = str(b.h2.CALLS["hook"])
		else:
			var A: Array = b.h2.acts()
			var id := "ratking:words" if b.kind == "ratking" else "gking:charge"
			var i: int = A.map(func(a): return a["id"]).find(id)
			b.h2.start_act(b, A, i, h)
			want = str(V["calls"][b.kind][id])
		await M._wait(0.1)
		var got: Array = said.call()
		_line(M._monsters.said_aloud.size() == before + 1 and got == [b.kind, want] and b._said == want,
			"%s: %s calls out \"%s\", over him (\"%s\") and aloud (%s)" % [place, b.kind, want, b._said, got])
		await M._snap("%s/vo_%s.png" % [dir, place])
		# (again within 5 s: nothing)
		if b.kind == "warden":
			var i: int = b._moves.map(func(mv): return mv["id"]).find("slam")
			b._start(i, h, b.world.distance_to(h.world))
		elif b.kind == "chained":
			b.h2.act = null
			b.h2._start(b, b.h2.ACTS.map(func(a): return a["id"]).find("whirl"), h)
		else:
			b.h2.act = {}
			var A: Array = b.h2.acts()
			var id2 := "ratking:roll" if b.kind == "ratking" else "gking:decree"
			b.h2.start_act(b, A, A.map(func(a): return a["id"]).find(id2), h)
		await M._wait(0.1)
		_line(M._monsters.said_aloud.size() == before + 1, "%s: another of his moves within 5 s: not called (%d heard)" % [place, M._monsters.said_aloud.size() - before])
		if b.kind == "gking":
			# (6 s on, his charge again: his basic blow's line not within 20 s; another big move's is)
			b._called_at -= 6.0
			var A: Array = b.h2.acts()
			b.h2.start_act(b, A, A.map(func(a): return a["id"]).find("gking:charge"), h)
			await M._wait(0.1)
			var n1: int = M._monsters.said_aloud.size()
			b.h2.start_act(b, A, A.map(func(a): return a["id"]).find("gking:decree"), h)
			await M._wait(0.1)
			_line(n1 == before + 1 and M._monsters.said_aloud.size() == before + 2 and said.call()[1] == V["calls"]["gking"]["gking:decree"],
				"the King, 6 s on: his charge (his basic blow) not called again within 20 s; his Decree is (\"%s\")" % [said.call()[1]])
	h.unhurt = false
	print("VOICES: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE WALLS SEEN THROUGH FOR THE MONSTERS BEHIND THEM (--only=wallsee; render.ts wallVeil): on floors 1 to 5 a wall between the eye
## and a monster in sight, near it on the screen, fades to faint as it does for him (narrower: 30 game pixels either side of it);
## out of sight, it does not, and the wall comes back whole. On floor 4, he in front of it; pictured.
func wallsee(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.way_depth = maxi(M.way_depth, 4)
	await M.go_to("floor4", "down")
	await M._wait(0.8)
	var st = M.look.stands if M.look != null else M._monsters.stands
	var mon = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			mon = m
			break
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.process_mode = Node.PROCESS_MODE_DISABLED
	# (a wall with open floor behind it and before it: the monster a tile and a half behind its face, he four tiles before it)
	var pick := -1
	var mw := Vector2.ZERO
	var hw := Vector2.ZERO
	for i in st._walls.size():
		var top: Vector2 = st._tops[i]
		var d: float = st._depths[i]
		var dif: float = top.x / 32.0
		var w := Vector2((d - 1.5 + dif) / 2.0, (d - 1.5 - dif) / 2.0)
		var f := w + Vector2(3.0, 3.0)
		if M.map.walkable(floori(w.x), floori(w.y)) and M.map.walkable(floori(f.x), floori(f.y)) and st._backs[i].z == 0:
			pick = i
			mw = w
			hw = f
			break
	_line(pick >= 0 and mon != null, "a wall with floor behind it (%d of %d walls), and a monster (%s)" % [pick, st._walls.size(), mon.kind if mon != null else "-"])
	if pick < 0 or mon == null:
		return
	var wall: Sprite2D = st._walls[pick]
	# (in sight, as it would be to him from beside it in the room behind the wall: his sight held still while he stands before it)
	if M.sight != null:
		M.sight.process_mode = Node.PROCESS_MODE_DISABLED
	h.world = hw
	mon.world = mw
	mon.position = Vector2((mw.x - mw.y) * 32.0, (mw.x + mw.y) * 16.0)
	mon.seen = true
	mon.visible = true
	await M._wait(0.6)
	var a_seen: float = wall.modulate.a
	await M._snap(dir + "/ws_behind_the_wall.png")
	_line(absf(a_seen - st.FAINT) < 1e-3, "the monster in sight behind it, he in front: the wall faint (%.2f; the game's 0.2)" % a_seen)
	mon.seen = false
	await M._wait(0.6)
	var a_unseen: float = wall.modulate.a
	_line(absf(a_unseen - 1.0) < 1e-3, "out of sight: the wall whole again (%.2f)" % a_unseen)
	h.unhurt = false
	print("WALLSEE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## WHAT STANDS BEHIND RAISED GROUND, CUT OFF BY IT (--only=behind; render.ts hide, blockPath; hide_clip.gd): on floor 4 (ledges and
## stairs) he stands on low floor just behind raised ground: his picture left out where the raised block before him is; out on
## open floor he is whole; a monster the same; and the floor's own standing things behind raised ground cut off as they stand.
func behind(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.way_depth = maxi(M.way_depth, 4)
	await M.go_to("floor4", "down")
	await M._wait(0.8)
	var map = M.map
	var HC := preload("res://scripts/hide_clip.gd")
	_line(HC.has_relief(map) and M.look.clipped > 0, "floor 4 has ledges; %d of its look's standing things are cut off behind them" % M.look.clipped)
	# (a place on the floor where the ground before it stands higher than it (raised ground, or the floor's edge before sunken
	# floor), and open floor a few tiles off where nothing hides him)
	var spot := Vector2.ZERO
	var open := Vector2.ZERO
	for i in map.w * map.h:
		var tx: int = i % map.w
		var ty: int = i / map.w
		if tx < 4 or ty < 4 or not map.walkable(tx, ty) or map.stair[i] != 0:
			continue
		var c := Vector2(tx + 0.5, ty + 0.5)
		if HC.blocks(map, c.x, c.y, map.lift_at(c.x, c.y)).is_empty():
			continue
		for o in [Vector2(-3, -3), Vector2(-3, 0), Vector2(0, -3), Vector2(3, 0), Vector2(0, 3)]:
			var q: Vector2 = c + o
			if map.walkable(floori(q.x), floori(q.y)) and HC.blocks(map, q.x, q.y, map.lift_at(q.x, q.y)).is_empty():
				spot = c
				open = q
				break
		if spot != Vector2.ZERO:
			break
	_line(spot != Vector2.ZERO, "a place where the ground before it stands higher (%.1f, %.1f, its ground %.0f), open floor beside it (%.1f, %.1f)" % [spot.x, spot.y, map.lift_at(spot.x, spot.y), open.x, open.y])
	if spot == Vector2.ZERO:
		return
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.process_mode = Node.PROCESS_MODE_DISABLED
	h.world = spot
	await M._wait(0.4)
	var hn: int = h.material.get_shader_parameter("n") if h.material is ShaderMaterial else 0
	await M._snap(dir + "/bh_behind_the_ledge.png")
	_line(hn > 0 and h._sprite.use_parent_material, "he behind it: cut off by %d block(s) of the raised ground before him" % hn)
	h.world = open
	await M._wait(0.4)
	var hn2: int = h.material.get_shader_parameter("n") if h.material is ShaderMaterial else 0
	_line(hn2 == 0, "out on open floor: whole (%d)" % hn2)
	var mon = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead:
			mon = m
			break
	if mon != null:
		mon.world = spot
		mon._place()
		var mn: int = mon._sprite.material.get_shader_parameter("n") if mon._sprite.material is ShaderMaterial else 0
		h.world = spot + Vector2(-1.5, 1.5)
		await M._wait(0.3)
		await M._snap(dir + "/bh_a_monster_behind.png")
		mon.world = open
		mon._place()
		var mn2: int = mon._sprite.material.get_shader_parameter("n") if mon._sprite.material is ShaderMaterial else 0
		_line(mn > 0 and mn2 == 0, "a %s behind it cut off by %d block(s); on open floor whole (%d)" % [mon.kind, mn, mn2])
	h.unhurt = false
	print("BEHIND: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## TOUCH, FOR A PHONE (--only=touch; touch.gd): fingers on the screen, as a phone gives them. The left thumb's stick walks him at full
## speed; a tap on the right strikes at the one the aim help locks onto (its gold ring); a hold whirls while it is held; a swipe
## lunges the way it goes; the pause button and the ATTACKS switch in the pause panel, pressed; in town a touch on a service
## walks him to it and uses it; the flask, pressed, drinks. Pictured.
func touch(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var T = M._touch
	T.set_mode("auto")
	var vp: Viewport = M.get_viewport()
	var win := func(p: Vector2) -> Vector2:
		return vp.get_final_transform() * (p * 2.0)
	var finger := func(i: int, p: Vector2, down: bool) -> void:
		var e := InputEventScreenTouch.new()
		e.index = i
		e.pressed = down
		e.position = win.call(p)
		Input.parse_input_event(e)
	var drag := func(i: int, p: Vector2) -> void:
		var e := InputEventScreenDrag.new()
		e.index = i
		e.position = win.call(p)
		Input.parse_input_event(e)
	M.way_depth = maxi(M.way_depth, 2)
	# (his Lunge open: moves open by level)
	h.practice = true
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	for m in M._monsters.list:
		if is_instance_valid(m):
			m.process_mode = Node.PROCESS_MODE_DISABLED
	# THE STICK: down on the left, pushed right
	var was: Vector2 = h.world
	finger.call(0, Vector2(70, 200), true)
	await M._wait(0.05)
	drag.call(0, Vector2(100, 200))
	await M._wait(0.6)
	var went: Vector2 = h.world - was
	var screen_way := Iso.to_screen(went.x, went.y)
	await M._snap(dir + "/t01_the_stick.png")
	_line(T.on and T.stick["active"] and h.auto_dir.distance_to(Vector2(1, 0)) < 0.01 and went.length() > 0.5 and screen_way.x > absf(screen_way.y) * 2.0,
		"the left thumb's stick, pushed right: he walks right on the screen at full speed (%.2f tiles in 0.6 s)" % went.length())
	finger.call(0, Vector2(100, 200), false)
	await M._wait(0.2)
	# A TAP on the right: the quick attack at the one locked onto (a monster set before him, awake)
	var mon = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			mon = m
			break
	mon.world = M._free_near(h.world + h.face * 1.4)
	mon.seen = true
	mon.state = "chase"
	mon.process_mode = Node.PROCESS_MODE_DISABLED
	await M._wait(0.2)
	finger.call(1, Vector2(380, 150), true)
	await M._wait(0.05)
	finger.call(1, Vector2(380, 150), false)
	await M._wait(0.12)
	var struck: bool = h._act == "strike" or (h.kit != null and not h.kit.attack.is_empty())
	await M._snap(dir + "/t02_a_tap.png")
	_line(T.lock == mon and str(T.asked[0]) == "quick" and struck, "a tap on the right: the quick attack, at the %s the aim help is locked onto (its ring)" % mon.kind)
	await M._wait(0.6)
	# A HOLD: the slow attack, kept going while held
	finger.call(1, Vector2(380, 150), true)
	await M._wait(0.45)
	var whirling: bool = h._act == "whirl"
	await M._snap(dir + "/t03_a_hold.png")
	finger.call(1, Vector2(380, 150), false)
	await M._wait(0.6)
	_line(whirling and h._act != "whirl", "a hold: the Whirlwind while held (%s), over once let go (%s)" % [whirling, h._act])
	# A SWIPE: the lunge, the way it goes (from open floor, 5 tiles of it to the right on the screen)
	await M._wait(0.5)
	var rw := Vector2(1, -1).normalized()
	for i in M.map.w * M.map.h:
		var c := Vector2(i % M.map.w + 0.5, i / M.map.w + 0.5)
		var ok := true
		for k in 6:
			var q: Vector2 = c + rw * float(k)
			if not M.map.walkable(floori(q.x), floori(q.y)):
				ok = false
				break
		if ok and c.distance_to(h.world) < 30.0:
			h.world = c
			break
	await M._wait(0.3)
	was = h.world
	finger.call(1, Vector2(330, 150), true)
	await M._wait(0.03)
	drag.call(1, Vector2(360, 150))
	await M._wait(0.03)
	drag.call(1, Vector2(390, 150))
	finger.call(1, Vector2(390, 150), false)
	var lunged := false
	for k in 12:
		await M._wait(0.02)
		lunged = lunged or h._act == "lunge"
	await M._wait(0.5)
	went = h.world - was
	screen_way = Iso.to_screen(went.x, went.y)
	var asked_at: Vector2 = T.asked[1] if T.asked.size() > 1 and T.asked[1] is Vector2 else Vector2.ZERO
	var meant := Iso.to_screen(asked_at.x - was.x, asked_at.y - was.y)
	_line(str(T.asked[0]) == "evade" and lunged and meant.x > absf(meant.y), "a swipe to the right: the Lunge, toward a point right of him on the screen (%.1f tiles gone)" % went.length())
	# THE PAUSE BUTTON, and the ATTACKS switch in its panel
	var W := floorf(M._mini.size.x / 2.0)
	finger.call(2, Vector2(W - 11, M._mini.MH + 13), true)
	await M._wait(0.05)
	finger.call(2, Vector2(W - 11, M._mini.MH + 13), false)
	await M._wait(0.2)
	var paused: bool = M._mini.open == "pause"
	var aim_hit := Rect2()
	for hh in M._mini._hits:
		if hh[1] == "aim":
			aim_hit = hh[0]
	await M._snap(dir + "/t04_the_pause_panel.png")
	var before: String = T.mode
	finger.call(2, aim_hit.get_center(), true)
	await M._wait(0.05)
	finger.call(2, aim_hit.get_center(), false)
	await M._wait(0.2)
	_line(paused and aim_hit.size.x > 0.0 and before == "auto" and T.mode == "tap" and T.label() == "ATTACKS: WHERE YOU TAP",
		"the pause button pressed: the panel, with ATTACKS: AUTO AIM on a phone; pressed, %s" % T.label())
	T.mode = "auto"
	M._mini.show_panel("")
	await M._wait(0.3)
	# THE FLASK, pressed: he drinks
	h.life = h.max_life * 0.4
	var pots: int = M.loot.potions
	var fl: Rect2 = M._hud._flask
	finger.call(3, fl.get_center(), true)
	await M._wait(0.05)
	finger.call(3, fl.get_center(), false)
	await M._wait(0.3)
	_line(fl.size.x == 26.0 and M.loot.potions == pots - 1, "the flask, drawn larger for a finger (%d), pressed: he drinks (%d left of %d)" % [int(fl.size.x), M.loot.potions, pots])
	# IN TOWN: a touch on a service walks him there and uses it
	await M.go_to("town", "start")
	await M._wait(1.0)
	var st: Dictionary = {}
	for s0 in M.town.data["stations"]:
		if str(s0["kind"]) == "armourer":
			st = s0
	var sw := Vector2(float(st["x"]), float(st["y"]))
	var cam: Camera2D = vp.get_camera_2d()
	var tl: Vector2 = cam.get_screen_center_position() - vp.get_visible_rect().size / 2.0
	var sp: Vector2 = (Iso.to_screen(sw.x, sw.y) - tl) / 2.0 - Vector2(0, 20)
	finger.call(0, sp, true)
	await M._wait(0.05)
	finger.call(0, sp, false)
	await M._wait(0.2)
	var walking: bool = not T.errand.is_empty()
	await M._w_until(func(): return T.errand.is_empty(), 10.0)
	await M._wait(0.5)
	await M._snap(dir + "/t05_the_armourer.png")
	_line(walking and str(T.asked[0]) == "used" and str(T.asked[1]) == "armourer" and M._inv.visible, "in town, a touch on the armourer: he walks there and uses him (his shelves open: %s)" % M._inv.visible)
	if M._inv.visible:
		M._inv.toggle()
	T.set_mode("auto")
	h.unhurt = false
	print("TOUCH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## WHAT THE HERO AND THE TOWN'S PEOPLE SAY (--only=speech; speech.gd): in town, walking up to the armourer, his greeting over him
## and heard (its chance made sure for the check); on floor 2, the Headsman killed by a Strike, the hero's word on it (a boss always
## earns one), one of the lines that fit; his line as he comes into a dungeon. Each shown on its slip and heard. Pictured.
func speech(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var S = M._speech
	var V: Dictionary = S.V
	_line(V.has("hero") and V["hero"].has(h.cls) and V.has("town"), "the voices' table: %d of %s's lines, %d of the town's" % [V.get("hero", {}).get(h.cls, {}).size(), h.cls, V.get("town", {}).values().reduce(func(n, t): return n + t.size(), 0)])
	await M.go_to("town", "start")
	await M._wait(1.0)
	S.V["tags"]["chance"] = 1.0
	var at = S._where(M.town, "armourer")
	# (from where he comes into town, far from him, up to him)
	var n0: int = S.heard.size()
	var far: bool = h.world.distance_to(at) > 3.2
	h.world = M._free_near(at + Vector2(1.6, 0.6))
	await M._wait(0.4)
	await M._snap(dir + "/sp01_the_armourer.png")
	var got: Array = S.heard.back() if S.heard.size() > n0 else []
	_line(far and not got.is_empty() and got[0] == "armourer" and V["tags"]["lines"]["armourer"].has(got[1]) and S.tag.get("who", "") == "armourer",
		"in town, walking up to the armourer: \"%s\" over him, and heard in his voice" % [got[1] if got.size() > 1 else "-"])
	# HIS WORD ON A BIG KILL
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	var b = M._d_boss()
	b.last_skill = 0
	n0 = S.heard.size()
	# (struck down as the game's checks strike a boss down, his wait over: the kill itself)
	b._die()
	await M._wait(0.3)
	await M._snap(dir + "/sp02_the_word_on_a_kill.png")
	got = S.heard.back() if S.heard.size() > n0 else []
	var fits: Array = (V["quips"]["boss"] as Array) + (V["quips"]["any"] as Array) + (V["quips"]["cls"][h.cls] as Array) + (V["quips"]["skill"].get(h.loadout.id(0), []) as Array)
	for l in V["quips"]["attr"].values():
		fits += l
	for l in V["quips"]["weapon"].values():
		fits += l
	for l in V["quips"]["word"].values():
		fits += l
	_line(b.dead and not got.is_empty() and fits.has(got[1]) and S.quip.get("text", "") == got[1], "the Headsman killed by a Strike: his word on it, \"%s\", over him and heard" % [got[1] if got.size() > 1 else "-"])
	# HIS LINE AS HE COMES INTO A DUNGEON
	await M._wait(3.0)
	n0 = S.heard.size()
	S.arrived()
	await M._wait(1.0)
	await M._snap(dir + "/sp03_coming_in.png")
	got = S.heard.back() if S.heard.size() > n0 else []
	_line(not got.is_empty() and V["arrival"][h.cls].has(got[1]), "coming into a dungeon: \"%s\", 0.75 s after he is there" % [got[1] if got.size() > 1 else "-"])
	h.unhurt = false
	print("SPEECH: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])



## UNIQUE ITEMS AND MAGIC FIND (loot.gd roll_gear, _rarity, _pool_unique, make_pool_unique, _boss_unique, gamble; inventory.gd _card):
## the odds as the game's, magic find moving them, his own only, a boss's own, the gamble's, and a unique's card.
func uniques(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var L = M.loot
	var U: Dictionary = L._uniques
	_line(U.has("defs") and U["defs"].size() == 88 and U.has("pieces"), "the uniques' table: %d of them, pieces for each" % U.get("defs", {}).size())
	M.way_depth = maxi(M.way_depth, 6)
	await M.go_to("floor6", "down")
	await M._wait(1.0)
	seed(1234)
	# THE RARITY ROLLED, AND MAGIC FIND MOVING IT (items.ts rollRarity): an ordinary monster's on floor 6, with none and with 100%
	var w: Array = U["chances"]["6"]
	var deep: float = float(U["loot2"]["deep"])
	var N := 20000
	for mf in [0.0, 100.0]:
		h.stats["magic_find"] = mf
		var got := [0, 0, 0]
		for i in N:
			got[L._rarity(0, mf)] += 1
		var b: float = 1.0 + float(mf) / 100.0
		var ws := [float(w[0]), float(w[1]) * b * deep, float(w[2]) * b * deep]
		var tot: float = ws[0] + ws[1] + ws[2]
		var ok := true
		var said := []
		for r in 3:
			var want: float = ws[r] / tot * N
			ok = ok and absf(got[r] - want) <= 4.0 * sqrt(maxf(want, 1.0)) + 2.0
			said.append("%d (%.0f)" % [got[r], want])
		_line(ok, "floor 6, an ordinary monster's piece, magic find %d%%: Normal, Magic, Rare %s (the game's odds in brackets)" % [mf, ", ".join(said)])
	# (a boss's first: from floor 6 a rare at the least; a hoard's luck)
	var least := true
	for i in 500:
		least = least and L._rarity(4, 0.0) == 2
	_line(least, "floor 6, a boss's first piece: always a rare")
	# HOW OFTEN A UNIQUE (uniques.ts poolChance, levelChance): ordinary pieces on floor 6, magic find 0 and 100%
	for mf in [0.0, 100.0]:
		var u := 0
		var M2 := 200000
		for i in M2:
			if L._pool_unique(0, mf) != null:
				u += 1
		var b: float = 1.0 + float(mf) / 100.0
		var p_pool: float = float(U["drops"]["pool"]["plain"]) * b
		var want: float = M2 * (p_pool + (1.0 - p_pool) * float(U["drops"]["level"]["plain"]) * b)
		_line(absf(u - want) <= 4.0 * sqrt(want) + 2.0, "floor 6, %d ordinary pieces, magic find %d%%: %d uniques (the game's odds: %.0f)" % [M2, mf, u, want])
	h.stats["magic_find"] = 0.0
	# (none of the pool's on floor 1: from floor 2)
	await M.go_to("floor1", "start")
	await M._wait(0.6)
	var on1 := 0
	for i in 20000:
		var it = L._pool_unique(2, 0.0)
		if it != null and U["defs"][it["unique"]]["from"] != "level":
			on1 += 1
	_line(on1 == 0, "floor 1: none of the pool's (%d), only the leveling ones of level 1" % on1)
	# HIS OWN ONLY: a Warrior with the battle axe, a Ranger
	var was_cls: String = L.cls
	var was_w: String = str(h.weapon)
	h.weapon = "battleaxe"
	var kinds := {}
	for i in 600:
		var it = L.make_pool_unique()
		var d: Dictionary = U["defs"][it["unique"]]
		kinds[str(d["weapon"])] = true
		if d["cls"] != null and d["cls"] != "warrior":
			kinds["another hero's"] = true
	_line(not kinds.has("greatsword") and not kinds.has("warhammer") and not kinds.has("another hero's") and kinds.has("battleaxe"),
		"a Warrior with the battle axe: the pool gives his axe's and everyone's, never the greatsword's, the hammer's or another hero's (%s)" % ", ".join(kinds.keys()))
	h.weapon = was_w
	# A BOSS'S OWN, AND HIS HOARD (game.ts dropLoot, dropBossUnique): the Headsman, his own forced
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	U["drops"]["boss"] = 1.0
	var gear0: int = L._drops.filter(func(d): return d["kind"] == "gear").size()
	var gold0: Array = L._drops.filter(func(d): return d["kind"] == "gold")
	var boss = M._d_boss()
	boss._die()
	await M._wait(0.3)
	U["drops"]["boss"] = 0.1
	var gears: Array = L._drops.filter(func(d): return d["kind"] == "gear")
	var golds: Array = L._drops.filter(func(d): return d["kind"] == "gold" and not gold0.has(d))
	var his: Array = gears.filter(func(d): return d["item"].get("unique") == "headsmanshood")
	var amount: int = int(golds[0]["amount"]) if not golds.is_empty() else 0
	_line(gears.size() - gear0 == 4 and his.size() == 1 and amount >= 50 and amount <= 90,
		"the Headsman falls on floor 2: three pieces and his own unique, %s (%d pieces in all); %d gold (25 to 45 times the floor's level, 2)" % [his[0]["item"]["name"] if not his.is_empty() else "-", gears.size() - gear0, amount])
	await M._snap(dir + "/un01_the_headsmans_hoard.png")
	# THE GAMBLE'S (game.ts gamble): one of the pool's of the kind thrown for, a helmet
	await M.go_to("town", "start")
	await M._wait(0.6)
	var odds: Dictionary = L._tune["gambleOdds"]
	var was_odds: float = float(odds["unique"])
	odds["unique"] = 1.0
	L.gold = 100000
	var k := -1
	for i in L.gamble_kinds().size():
		if L.gamble_kinds()[i]["slot"] == "helm":
			k = i
	var why: String = L.gamble(k)
	odds["unique"] = was_odds
	var won = L.bag[L.won] if why == "" else null
	_line(won != null and won.get("unique") != null and U["defs"][won["unique"]]["slot"] == "helm", "the stranger, a throw for a helmet: %s" % [won["name"] if won != null else why])
	# A UNIQUE'S CARD (ui/panels.ts itemCard; uniques.ts uniqueLines)
	var card = L.unique_piece("headsmanshood")
	L.bag.append(card)
	M._inv.toggle()
	await M._wait(0.3)
	M._inv._hover = {"item": card, "at": Vector2(300, 200)}
	M._inv.queue_redraw()
	await M._wait(0.2)
	await M._snap(dir + "/un02_a_uniques_card.png")
	_line(not (card["does"] as Array).is_empty(), "the Headsman's Hood's card: \"%s\"" % "; ".join(card["does"]))
	M._inv._hover = {}
	M._inv.toggle()
	h.unhurt = false
	print("UNIQUES: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## (the uniques' check: a unique of id `id` worn, made as the game makes it; every unique taken off)
func _wear(id: String) -> Dictionary:
	var L = M.loot
	var it: Dictionary = L.unique_piece(id)
	var slot: String = "ring1" if it["slot"] == "ring" else str(it["slot"])
	if slot == "ring1" and L.gear["ring1"] != null and L.gear["ring1"].get("unique") != null:
		slot = "ring2"
	L.gear[slot] = it
	L.derive()
	return it


func _bare() -> void:
	var L = M.loot
	for s in L.EQUIP:
		if L.gear[s] != null and L.gear[s].get("unique") != null:
			L.gear[s] = null
	L.derive()


## WHAT THE UNIQUES DO, the first of them (uniques.gd; game.ts “UNIQUE ITEMS”, uniques.ts bendWords): the ones that bend his words,
## and his own rules that need no picture of their own.
func uniquesdo(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var L = M.loot
	var U = M._uniques
	var lo = h.loadout
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	L.ring_lit = true
	L.level = 20
	L.derive()
	lo.front[0][0] = "power"
	lo.front[1][0] = "fire"
	lo.behind[0][0] = "swift"
	lo.refresh()
	var plain0: float = float(lo.r(0)["dmg_mult"])
	# THE HEADSMAN'S HOOD: CULLING in front of the tap, no slot used
	_wear("headsmanshood")
	_line(lo.wfronts(0).has("culling") and float(lo.r(0)["cull"]) > 0.0 and lo.front[0].size() == 2 and not lo.front[0].has("culling"), "the Headsman's Hood: CULLING in front of his Strike (cull %.2f), its slots as they were" % float(lo.r(0)["cull"]))
	_bare()
	# THE CENSOR'S SEAL: the tap's words half as strong again, the hold none
	var seal := _wear("censorsseal")
	var half: float = float(U.halves.get("censorsseal", 0.5))
	var held_none: bool = lo.wfronts(1).is_empty() and lo.wbehinds(1).is_empty()
	_line(float(lo.r(0)["dmg_mult"]) > plain0 and held_none and lo.r(1)["element"] == "phys", "the Censor's Seal (rolled %.2f): POWER on his Strike stronger (%.3f, was %.3f); his Whirlwind takes no words (no FLAME)" % [half, float(lo.r(0)["dmg_mult"]), plain0])
	_bare()
	# THE DOG-EARED PAGE: every slot open at level 1; taken off, the slots close and their words come back
	L.level = 1
	L.derive()
	for w in lo.trim():
		L.words[w] = int(L.words.get(w, 0)) + 1
	var n1: int = lo.front[0].size()
	_wear("dogearedpage")
	var all: int = lo.front[0].size()
	lo.front[0][all - 1] = "frost"
	var before: int = int(L.words.get("frost", 0))
	_bare()
	_line(all > n1 and lo.front[0].size() == n1 and int(L.words.get("frost", 0)) == before + 1, "the Dog-Eared Page at level 1: %d slots in front of the Strike (%d without); taken off, the last closes and its FROST goes back to his pouch" % [all, n1])
	L.level = 20
	L.derive()
	lo.front[0][0] = "power"
	lo.refresh()
	# THE POLYGLOT'S MANTLE: two damage words a side
	_wear("polyglotsmantle")
	var two: String = lo.problem(0, "front", "fire") if lo.front[0].has(null) else "full"
	_bare()
	var one: String = lo.problem(0, "front", "fire") if lo.front[0].has(null) else "full"
	_line(two == "" and one != "", "the Polyglot's Mantle: FLAME may go beside POWER (\"%s\"); without it, \"%s\"" % [two, one])
	# THE LONG ECHO, THE TWO-FACED MASK, THE CANTOR'S ECHO, THE UNDERTOW, THE HOLLOW CROWN, THE QUEEN'S GLASS
	_wear("longecho")
	var echo: bool = lo.wfronts(0).has("lasting") and lo.wfronts(1).has("lasting") and lo.wfronts(2).has("lasting")
	_bare()
	_wear("twofacedmask")
	var mask: bool = lo.wbehinds(0).has("power")
	_bare()
	_wear("cantorsecho")
	var cantor: bool = lo.wbehinds(1).has("twin")
	_bare()
	_line(echo and mask and cantor, "the Long Echo: LASTING on all three; the Two-Faced Mask: POWER behind his Strike as well; the Cantor's Echo: TWIN behind his Whirlwind")
	# THE CLOCKWORK SONGBIRD: stronger while his life is full; hurt, silent
	h.life = h.max_life
	_wear("clockworksongbird")
	await M._wait(0.1)
	var sings: float = float(lo.r(0)["dmg_mult"])
	h.unhurt = false
	h.hurt_by(5.0, "phys", [], {}, null, h.world + Vector2(1, 0), true)
	h.unhurt = true
	await M._wait(0.1)
	var silent: float = float(lo.r(0)["dmg_mult"])
	_bare()
	h.life = h.max_life
	_line(sings > silent and absf(silent - plain0) < 0.001, "the Clockwork Songbird: his Strike %.3f at full life, %.3f once hurt" % [sings, silent])
	# THE NETTLE SHIRT: her Vow grows unhit, and a hit starts it over
	_wear("nettleshirt")
	var every: float = float(U.ut["nettle"]["every"])
	await M._wait(every + 0.3)
	var vow: float = float(U.uq["vow"])
	h.hurt_by(5.0, "phys", [], {}, null, h.world + Vector2(1, 0), true)
	var after: float = float(U.uq["vow"])
	_bare()
	_line(vow > 0.0 and after == 0.0, "the Nettle Shirt: her Vow %.2f after %.1f s unhit, 0 after a hit" % [vow, every + 0.3])
	# THE MOTH'S WING: a third less from each hit, and a hit darkens one of his words
	_wear("mothswing")
	var k: float = U.hurt_k()
	var less: float = float(U.ut["moth"]["less"])
	h.hurt_by(5.0, "phys", [], {}, null, h.world + Vector2(1, 0), true)
	var dark = U.uq["dark"]
	var gone := false
	if dark != null:
		var side: Array = lo.wfronts(int(dark["skill"])) if dark["side"] == "front" else lo.wbehinds(int(dark["skill"]))
		var w = (lo.front if dark["side"] == "front" else lo.behind)[int(dark["skill"])][int(dark["idx"])]
		gone = not side.has(w)
	_bare()
	_line(absf(k - (1.0 - less)) < 0.001 and dark != null and gone, "the Moth's Wing: blows %.0f%% as hard; a hit darkened %s" % [k * 100.0, str(dark)])
	# THE KING'S KNOT: a monster with a word killed, his Strike carries it a while
	var m = null
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss:
			m = o
			break
	_wear("kingsknot")
	if m != null:
		m.words = ["frost"]
		h.killed(m)
	var lent: bool = lo.wfronts(0).has("frost")
	_bare()
	_line(lent, "the King's Knot: a monster carrying FROST killed: his Strike carries FROST too")
	# BLOODPRICE: a flask at full life heals nothing and makes him hit harder
	_wear("bloodprice")
	h.life = h.max_life
	L.potions = 3
	L.drink()
	var fury: float = U.hit_mult(m, 0) if m != null else 0.0
	_line(L.potions == 2 and float(U.uq["blood_t"]) > 0.0 and absf(fury - (1.0 + float(U.ut["bloodprice"]["more"]))) < 0.001, "Bloodprice: a flask drunk at full life: his hits x%.2f for %.1f s" % [fury, float(U.uq["blood_t"])])
	_bare()
	U.uq["blood_t"] = 0.0
	# THE HALF-CARVED HAND: below half his life, faster
	_wear("halfcarvedhand")
	var walk0: float = h.walk_pace()
	h.life = h.max_life * 0.4
	var quick: float = h.attack_pace()
	var feet: float = h.walk_pace() / walk0
	h.life = h.max_life
	_bare()
	_line(quick > 1.2 and feet > 1.1, "the Half-Carved Hand below half life: attacks x%.2f, feet x%.2f" % [quick, feet])
	# THE STANDING STONE: stood still, less harm and no shove
	_wear("standingstone")
	await M._wait(0.6)
	var stone: float = U.hurt_k()
	var at0: Vector2 = h.world
	h.knock(Vector2(1, 0), 1.0)
	await M._wait(0.2)
	_bare()
	_line(stone < 0.7 and h.world.distance_to(at0) < 0.05, "the Standing Stone: stood still, blows %.0f%% as hard, and a knock moves him %.2f tiles" % [stone * 100.0, h.world.distance_to(at0)])
	# BROKEN SHACKLES: the swipe with no cooldown, and he can be hit in it
	_wear("brokenshackles")
	_line(float(lo.r(2)["cooldown"]) == 0.0 and not h.move_safe(), "Broken Shackles: his Lunge's cooldown %.1f s; blows reach him in it" % float(lo.r(2)["cooldown"]))
	_bare()
	# THE DANCING SHOES: nothing slows him
	_wear("dancingshoes")
	h.chill(2.0, 0.5)
	h.chill_t = 2.0
	h.chill_k = 0.5
	await M._wait(0.1)
	var slowed: bool = h.chill_t > 0.0 or h._slow_t > 0.0
	_bare()
	_line(not slowed, "the Dancing Shoes: chilled and slowed, and at once not")
	# THE PHYSICIAN'S COAT: a flask from his hits on an elite or a boss; none from kills
	_wear("physicianscoat")
	L.potions = 0
	var boss = M._d_boss()
	var hits: int = int(U.ut["coat"]["hits"])
	for q in hits:
		U.landed(boss, false, false)
	var coat: int = L.potions
	_bare()
	_line(coat == 1, "the Physician's Coat: %d hits on the Headsman, %d flask back" % [hits, coat])
	L.potions = 3
	# THE KINDLING ROD, THE LAST WORD
	_wear("kindlingrod")
	var fire: bool = lo.r(0)["element"] != "fire" and not U.worn.has("kindlingrod")
	_bare()
	var cool0: float = float(lo.r(2)["cooldown"])
	_wear("lastword")
	var cool1: float = float(lo.r(2)["cooldown"])
	var lw: float = float(lo.r(0)["dmg_mult"])
	_bare()
	_line(fire and cool1 > cool0 * 1.4 and lw > plain0, "the Kindling Rod on a Warrior: the Mage's, its rule does nothing for him; the Last Word: Lunge's cooldown %.1f s (was %.1f), his Strike %.3f (was %.3f)" % [cool1, cool0, lw, plain0])
	# THE PACKSTRAP: Guarding's shield always on him
	h.shield = 0.0
	_wear("packstrap")
	U.uq["hurt_at"] = -1e9
	await M._wait(0.1)
	var shielded: float = h.shield
	_bare()
	h.shield = 0.0
	_line(shielded > 0.0, "the Packstrap: a shield of %.0f on him" % shielded)
	# THE CRIER'S HUSH: a monster close to him has its words darkened
	_wear("criershush")
	var near = null
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss:
			near = o
			break
	if near != null:
		near.words = ["fire"]
		near.state = "chase"
		h.world = M._free_near(near.world + Vector2(1.2, 0))
		await M._wait(0.2)
	var hushed: bool = near != null and (near.words as Array).is_empty() and (near.dark_words as Array).has("fire")
	_bare()
	await M._wait(0.1)
	var back: bool = near != null and (near.words as Array).has("fire")
	_line(hushed and back, "the Crier's Hush: a monster with FLAME close to him has it darkened; taken off, it is given back")
	await M._snap(dir + "/ud01_floor2.png")
	# THE WARDEN'S KEYS: the sealed door opens as he comes near
	var door = null
	for d in M.map.doors:
		if d["kind"] == "worddoor" and int(d["want"]) == 0:
			door = d
	_wear("wardenskeys")
	if door != null:
		h.world = M._free_near(Vector2(door["middle"]["x"], door["middle"]["y"]) + Vector2(0.8, 0.8))
		await M._wait(0.3)
	var opened: bool = door != null and int(door["want"]) == 1
	_bare()
	await M._snap(dir + "/ud02_the_wardens_keys.png")
	_line(opened, "the Warden's Keys: floor 2's sealed door opens as he comes near, without its word")
	h.unhurt = false
	print("UNIQUESDO: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## WHAT THE UNIQUES DO, with looks of their own (uniques.gd, fx_uniques.gd; game.ts stepArm, callBird, raise, stepRisen;
## render/unique_fx.ts): the Drowned Arm's tentacle, the Queen's Talons' birds, the Fleshmancer's Brand's risen elite, the beam over a
## unique lying on the floor.
func uniqueslook(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var L = M.loot
	var U = M._uniques
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	# (a few of floor 2's skeletons woken and brought to him, kept from hurting him)
	var foes: Array = []
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and foes.size() < 3:
			foes.append(o)
	var spot: Vector2 = h.world
	for k in foes.size():
		var o = foes[k]
		o.world = M._free_near(spot + Vector2(1.6 + k * 0.7, 0.4 * k))
		o.state = "chase"
		o.max_life = 100000.0
		o.life = 100000.0
	# THE DROWNED ARM: struck, the one he fights has a tentacle burst up under it and slam it, stunning it
	_wear("drownedarm")
	var m = foes[0]
	var life0: float = m.life
	h.hit_monster(m, 0, 1.0, false)
	var after_hit: float = m.life
	await M._wait(0.25)
	await M._snap(dir + "/ul01_the_drowned_arm_rising.png")
	await M._wait(0.45)
	await M._snap(dir + "/ul02_the_drowned_arm_slams.png")
	var slam: bool = U.told.any(func(e): return e["id"] == "drownedarm" and e["what"] == "slam" and int(e.get("n", 0)) >= 1)
	_line(slam and m.life < after_hit and m.stun_t > 0.0, "the Drowned Arm: a tentacle up under the one he struck, slamming it (%.0f to %.0f) and stunning it (%.2f s)" % [after_hit, m.life, m.stun_t])
	_bare()
	await M._wait(0.6)
	# THE QUEEN'S TALONS: a critical hit calls one of her birds onto the one nearest him
	_wear("queenstalons")
	var near_life: Array = foes.map(func(o): return o.life)
	h.hit_monster(foes[1], 0, 1.0, false, true)
	var hit_life: Array = foes.map(func(o): return o.life)
	await M._wait(0.2)
	await M._snap(dir + "/ul03_her_bird_diving.png")
	await M._wait(0.4)
	var dived: bool = U.told.any(func(e): return e["id"] == "queenstalons" and e["what"] == "struck")
	var lost := false
	for k in foes.size():
		if foes[k].life < hit_life[k]:
			lost = true
	_line(dived and lost, "the Queen's Talons: a critical hit, and her bird dives on the one nearest him and strikes it")
	_bare()
	# THE FLESHMANCER'S BRAND: an elite he kills rises and fights for him
	_wear("fleshmancersbrand")
	var e = foes[2]
	e.elite = true
	var e_at: Vector2 = e.world
	e.damage(e.life + 10.0, "phys", false, false, [], false, false, 0)
	await M._wait(0.1)
	var rose: bool = U.risen != null and U.risen["at"].distance_to(e_at) < 1.0
	await M._wait(0.5)
	await M._snap(dir + "/ul04_the_risen_elite.png")
	var struck := false
	for q in 60:
		await M._wait(0.1)
		if U.told.any(func(x): return x["id"] == "fleshmancersbrand" and x["what"] == "strike"):
			struck = true
			break
	await M._snap(dir + "/ul05_the_risen_strikes.png")
	_line(rose and struck, "the Fleshmancer's Brand: an elite killed rises where it fell (%s) and strikes for him" % (U.risen["kind"] if U.risen != null else "-"))
	_bare()
	await M._wait(1.2)
	_line(U.risen == null, "the brand taken off: the risen one falls")
	# A UNIQUE DROPPED: the beam of the uniques' orange over it
	var it = L.unique_piece("twofacedmask")
	L.lay_item(h.world + Vector2(1.5, -0.5), it)
	await M._wait(0.15)
	await M._snap(dir + "/ul06_a_unique_lands.png")
	await M._wait(0.8)
	await M._snap(dir + "/ul07_a_unique_lying.png")
	_line(M.fx != null and M.fx.uq._drops().size() >= 1, "a unique lying on the floor: its beam over it")
	h.unhurt = false
	print("UNIQUESLOOK: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE WARRIOR'S UNIQUES (uniques.gd; game.ts useBasic, release, windBlade, updateChannel, land; render/unique_fx.ts drawBlade): the
## greatsword's Millstone, Windcutter and Pivot.
func uniqueswar(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var U = M._uniques
	var L = M.loot
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	L.level = 20
	L.derive()
	var foes: Array = []
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and foes.size() < 3:
			foes.append(o)
	for k in foes.size():
		var o = foes[k]
		o.world = M._free_near(h.world + h.face * (2.5 + k * 1.2))
		o.state = "chase"
		o.max_life = 100000.0
		o.life = 100000.0
	# THE WINDCUTTER: three Strikes in a row, and a blade of wind flies on through everything in its line
	_wear("windcutter")
	var far = foes[foes.size() - 1]
	var life0: float = far.life
	var shot := false
	for k in 3:
		h._turn((foes[0].world - h.world).normalized())
		h._begin_strike()
		var waited := 0.0
		while waited < 1.0 / h.rate() + 0.02:
			await M._wait(0.03)
			waited += 0.03
			if not shot and not U.blades.is_empty():
				shot = true
				await M._wait(0.06)
				await M._snap(dir + "/uw01_the_windcutters_blade.png")
	await M._wait(0.6)
	var cut: bool = U.told.any(func(e): return e["id"] == "windcutter" and e["what"] == "cut")
	_line(U.told.any(func(e): return e["id"] == "windcutter" and e["what"] == "blade") and cut, "the Windcutter: his third Strike in a row sends a blade of wind on, cutting what is in its line")
	_bare()
	# MILLSTONE: the Whirlwind goes on for as long as it is held
	_wear("millstone")
	h._whirl_cd = 0.0
	Input.action_press("whirl")
	await M._wait(0.1)
	h._begin_whirl()
	var length: float = float(h.WHIRL["channel"]) * float(h.loadout.r(1)["last"])
	await M._wait(length + 1.5)
	var still_spinning: bool = h._act == "whirl" and not h._landed
	Input.action_release("whirl")
	await M._wait(0.6)
	_bare()
	_line(still_spinning, "Millstone: held %.1f s, past the Whirlwind's %.1f, and still spinning" % [length + 1.5, length])
	# THE PIVOT: Lunge ends in a free turn of Whirlwind where he lands
	_wear("pivot")
	h._lunge_cd = 0.0
	var n0: int = U.told.size()
	h._begin_lunge(h.world + Vector2(2.0, 1.0))
	await M._wait(0.8)
	_line(U.told.slice(n0).any(func(e): return e["id"] == "pivot"), "the Pivot: his Lunge lands and turns into a free turn of Whirlwind")
	_bare()
	# SET 1: THE BATTLE AXE
	h.talents = ["battleaxe"]
	h.talents_changed()
	await M._wait(0.3)
	var K = h.kit
	for o in foes:
		o.world = M._free_near(h.world + h.face * 3.0)
		o.life = o.max_life
	# GYRE: his thrown axe stops at the end of its flight and spins there, cutting what is round it
	_wear("gyre")
	var tgt: Vector2 = foes[0].world
	K.cd[1] = 0.0
	K.charges[1] = K.max_charges[1]
	K._use_skill(1, h.world + (tgt - h.world).normalized() * 6.0)
	var spun := false
	for q in 40:
		await M._wait(0.05)
		if not U.gyres.is_empty():
			spun = true
			break
	await M._wait(0.4)
	await M._snap(dir + "/uw02_gyre.png")
	await M._wait(1.0)
	var gyre_cut: bool = U.told.any(func(e): return e["id"] == "gyre" and e["what"] == "cut")
	_line(spun and gyre_cut, "Gyre: his thrown axe stops where its flight ends and spins there, cutting what is round it")
	_bare()
	await M._wait(0.5)
	# RED TITHE: one that dies bleeding throws its blood to the nearest other
	_wear("redtithe")
	var bleeder = foes[0]
	var other = foes[1]
	other.world = M._free_near(bleeder.world + Vector2(1.5, 0.3))
	other.bleed_t = 0.0
	bleeder.bleed_t = 3.0
	bleeder.bleed_dps = 5.0
	bleeder.max_life = 10.0
	bleeder.life = 10.0
	bleeder.damage(20.0, "phys", false, false, [], false, false, 0)
	await M._wait(0.12)
	await M._snap(dir + "/uw03_red_tithe.png")
	await M._wait(0.3)
	var bled: bool = U.told.any(func(e): return e["id"] == "redtithe" and e["what"] == "bleeds")
	_line(bleeder.dead and bled, "Red Tithe: one dies bleeding, and its blood flies to the nearest other, which bleeds")
	_bare()
	# WIDOWFALL: Leaping Chop lands with a Cleave all round him, and all it strikes bleed
	_wear("widowfall")
	other.bleed_t = 0.0
	K.cd[2] = 0.0
	K.charges[2] = K.max_charges[2]
	var n1: int = U.told.size()
	K._use_evasive(other.world - (other.world - h.world).normalized() * 0.8, (other.world - h.world).normalized())
	await M._wait(0.9)
	_line(U.told.slice(n1).any(func(e): return e["id"] == "widowfall") and other.bleed_t > 0.0, "Widowfall: Leaping Chop lands with a Cleave all round him, and what it strikes bleeds")
	_bare()
	# SET 1: THE WARHAMMER
	h.talents = ["warhammer"]
	h.talents_changed()
	await M._wait(0.3)
	K = h.kit
	var alive: Array = foes.filter(func(o): return is_instance_valid(o) and not o.dead)
	for o in alive:
		o.world = M._free_near(h.world + h.face * 1.6)
		o.life = o.max_life
		o.stun_t = 0.0
	# DEADWEIGHT: each Smash in a row heavier; the fifth an Earthquake of its own
	_wear("deadweight")
	# (quick hands: a hammer swung faster than the weight drains away, as a hero further on swings it)
	var dex0: float = L.attrs["dex"]
	L.attrs["dex"] = 400.0
	L.derive()
	var at0: Vector2 = alive[0].world
	for k in 5:
		K._use_basic(at0)
		await M._wait(K.swing_t)
		if k == 3:
			await M._snap(dir + "/uw04_deadweight.png")
	var quaked: bool = U.told.any(func(e): return e["id"] == "deadweight" and e["what"] == "quake")
	L.attrs["dex"] = dex0
	L.derive()
	_line(quaked, "Deadweight: five Smashes in a row, the fifth lands as an Earthquake of its own")
	_bare()
	await M._wait(1.5)
	# DEATH KNELL: what his hammer stuns rings; struck while it rings, it peals
	_wear("deathknell")
	for o in alive:
		o.stun_t = 0.0
		o.knell_t = 0.0
	K.cd[1] = 0.0
	K.charges[1] = K.max_charges[1]
	K._use_skill(1, alive[0].world)
	await M._wait(0.9)
	var ringing: Array = alive.filter(func(o): return is_instance_valid(o) and not o.dead and o.knell_t > 0.0)
	await M._snap(dir + "/uw05_death_knell_ringing.png")
	if not ringing.is_empty():
		h.hit_monster(ringing[0], 0, 0.1, false)
	await M._wait(0.15)
	await M._snap(dir + "/uw06_death_knell_peal.png")
	_line(not ringing.is_empty() and U.told.any(func(e): return e["id"] == "deathknell" and e["what"] == "peal"), "Death Knell: his Earthquake's stun sets %d ringing; struck, one peals" % ringing.size())
	_bare()
	await M._wait(1.0)
	# STARBREAKER: Earthquake pulls a meteor down out of the sky
	_wear("starbreaker")
	K.cd[1] = 0.0
	K.charges[1] = K.max_charges[1]
	K._use_skill(1, alive[0].world)
	await M._wait(0.15)
	await M._snap(dir + "/uw07_starbreaker_falling.png")
	var landed := false
	for q in 30:
		await M._wait(0.05)
		if U.told.any(func(e): return e["id"] == "starbreaker" and e["what"] == "land"):
			landed = true
			break
	await M._wait(0.05)
	await M._snap(dir + "/uw08_starbreaker_lands.png")
	_line(U.told.any(func(e): return e["id"] == "starbreaker" and e["what"] == "fall") and landed, "Starbreaker: his Earthquake calls a meteor down, landing as the hammer hits")
	_bare()
	h.talents = []
	h.talents_changed()
	h.unhurt = false
	print("UNIQUESWAR: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE OTHER HEROES' UNIQUES (uniques.gd and each hero's kit; game.ts, each where it acts), for the hero of --cls.
func uniquescls(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var U = M._uniques
	var L = M.loot
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	L.level = 20
	L.ring_lit = true
	L.derive()
	var K = h.kit
	var foes: Array = []
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and foes.size() < 3:
			foes.append(o)
	for k in foes.size():
		var o = foes[k]
		o.world = M._free_near(h.world + h.face * (2.5 + k * 0.8))
		o.state = "chase"
		o.max_life = 100000.0
		o.life = 100000.0
	var ahead: Vector2 = foes[0].world
	var ready := func(i: int) -> void:
		K.cd[i] = 0.0
		K.charges[i] = K.max_charges[i]
		K.windup = {}
	match h.cls:
		"ranger":
			_wear("fan")
			ready.call(0)
			var n0: int = K.shots.size()
			K._use_basic(ahead)
			var most := 0
			for q in 25:
				await M._wait(0.02)
				most = maxi(most, K.shots.size() - n0)
				if most >= 3:
					break
			await M._snap(dir + "/uc_ranger_fan.png")
			_line(most == 3, "the Fan: a Shot looses %d arrows in a fan" % most)
			_bare()
			_wear("rainwalker")
			ready.call(1)
			K._use_skill(1, ahead)
			await M._wait(0.8)
			var rains: bool = not K.volleys.is_empty() and K.volleys[0].get("walker", false) and Vector2(K.volleys[0]["x"], K.volleys[0]["y"]).distance_to(h.world) < 0.1
			await M._snap(dir + "/uc_ranger_rainwalker.png")
			_line(rains, "Rainwalker: his Volley rains round him")
			_bare()
			await M._wait(1.5)
			_wear("poachersbow")
			var t0: int = K.traps.size()
			ready.call(1)
			K._use_skill(1, ahead)
			await M._wait(1.2)
			_line(K.traps.size() > t0 or U.told.any(func(e): return e["id"] == "poachersbow"), "the Poacher's Bow: where the Volley falls it leaves one of his traps")
			_bare()
			await M._wait(1.5)
			K.traps.clear()
			_wear("hairtrigger")
			var spot: Vector2 = M._free_near(h.world + h.face * 1.6)
			K._lay_trap(2, spot, 1.0)
			K.traps.back()["arm"] = 99.0
			ready.call(0)
			K._use_basic(h.world + (spot - h.world).normalized() * 5.0)
			await M._wait(0.8)
			_line(U.told.any(func(e): return e["id"] == "hairtrigger"), "the Hair Trigger: an arrow over his trap sets it off")
			_bare()
		"mage":
			_wear("shepherdscrook")
			ready.call(1)
			K._use_skill(1, ahead)
			await M._wait(0.6)
			var orb_at: Vector2 = Vector2(K.orbs[0]["x"], K.orbs[0]["y"]) if not K.orbs.is_empty() else Vector2.INF
			h.world = M._free_near(h.world - h.face * 3.0)
			await M._wait(1.0)
			var follows: bool = not K.orbs.is_empty() and Vector2(K.orbs[0]["x"], K.orbs[0]["y"]).distance_to(orb_at) > 0.5
			await M._snap(dir + "/uc_mage_crook.png")
			_line(follows, "the Shepherd's Crook: the Orb comes after her")
			_bare()
			_wear("tuningstaff")
			ready.call(0)
			K._use_basic(Vector2(K.orbs[0]["x"], K.orbs[0]["y"]) if not K.orbs.is_empty() else ahead)
			await M._wait(0.8)
			_line(U.told.any(func(e): return e["id"] == "tuningstaff"), "the Tuning Staff: a Wave through her Orb makes it pulse at once")
			_bare()
			_wear("tide")
			ready.call(0)
			K._use_basic(ahead)
			await M._wait(1.2)
			_line(U.told.any(func(e): return e["id"] == "tide"), "the Tide: the Wave comes back to her")
			_bare()
			_wear("prism")
			h.loadout.front[0][0] = "fire"
			h.loadout.refresh()
			var pm = foes[1]
			pm.chill_t = 0.0
			pm.shock_t = 0.0
			h.hit_monster(pm, 0, 1.0, false)
			_line(pm.burn_t > 0.0 and pm.chill_t > 0.0 and pm.shock_t > 0.0, "the Prism: a fire hit burns, chills and shocks")
			h.loadout.front[0][0] = null
			h.loadout.refresh()
			_bare()
			_wear("shortway")
			var start: Vector2 = h.world
			ready.call(2)
			K._use_evasive(h.world + h.face * 4.0, h.face)
			await M._wait(0.3)
			var away: float = h.world.distance_to(start)
			K._use_evasive(h.world + h.face * 4.0, h.face)
			await M._wait(0.3)
			_line(away > 1.0 and h.world.distance_to(start) < 0.6, "the Short Way: warped %.1f tiles, warping again snaps her back" % away)
			_bare()
		"warlock":
			_wear("ledgerofdebts")
			for o in foes:
				o.curse_t = 5.0
			var bolt: float = U.hit_mult(foes[0], 0)
			_line(bolt > 1.1, "the Ledger of Debts: his Hellfire Bolt x%.2f with %d cursed near" % [bolt, foes.size()])
			_bare()
			_wear("restlesstome")
			await M._wait(2.5)
			await M._snap(dir + "/uc_warlock_tome.png")
			_line(U.told.any(func(e): return e["id"] == "restlesstome"), "the Restless Tome: it circles him and puts his hellfire on what it touches")
			_bare()
			_wear("burningverse")
			var bv = foes[0]
			bv.curse_t = 10.0
			bv.set_alight(1.0, 1.0)
			await M._wait(2.0)
			_line(bv.burn_t > 0.0, "the Burning Verse: a burn on a cursed one does not go out (%.1f s left after 2 s of 1)" % bv.burn_t)
			_bare()
		"tinkerer":
			_wear("secondwhistle")
			_line(K.golems_most() >= 2, "the Second Whistle: %d Golems at once" % K.golems_most())
			_bare()
			_wear("stickywrench")
			ready.call(0)
			K._use_basic(foes[0].world)
			await M._wait(0.9)
			await M._snap(dir + "/uc_tinkerer_sticky.png")
			_line(U.told.any(func(e): return e["id"] == "stickywrench"), "the Sticky Wrench: her vial sticks to what it hits")
			_bare()
			await M._wait(1.0)
			ready.call(1)
			K._use_skill(1, ahead)
			await M._wait(1.5)
			_wear("foremanswrench")
			ready.call(0)
			var v0: int = K.vials.size()
			K._use_basic(foes[0].world)
			await M._wait(0.45)
			_line(U.told.any(func(e): return e["id"] == "foremanswrench"), "the Foreman's Wrench: her Golem lobs a vial with hers")
			_bare()
			await M._wait(0.8)
			_wear("towline")
			ready.call(2)
			K._use_evasive(h.world - h.face * 4.0, -h.face)
			await M._wait(1.2)
			_line(U.told.any(func(e): return e["id"] == "towline"), "the Tow Line: her Golem rides her Blast Jump")
			_bare()
			_wear("companyscrip")
			L.gold = 5000
			ready.call(2)
			var open_to: Vector2 = M._free_near(h.world + Vector2(3.0, 0.5))
			K._use_evasive(open_to, (open_to - h.world).normalized())
			await M._wait(0.1)
			_line(K.cd[2] <= 0.0 and L.gold < 5000, "the Company Scrip: her Blast Jump with no cooldown, for %d gold" % (5000 - L.gold))
			_bare()
		"brawler":
			_wear("fourthglobe")
			_line(K.most() == 4, "the Fourth Globe: his combos hold %d globes" % K.most())
			_bare()
			_wear("lastround")
			K.globes = []
			K.queue = []
			K._press("tap", ahead)
			K._press("tap", ahead)
			K._press("tap", ahead)
			_line(K.globes.size() >= 3 and K.globes[2] == "punchFire", "the Last Round: the third globe sets itself in fire (%s)" % str(K.globes))
			await M._wait(2.5)
			_bare()
			_wear("winningstreak")
			for k in 3:
				K._press("tap", ahead)
			await M._wait(2.5)
			# (told as it grows: a blow on him meanwhile ends it, as in the game)
			_line(U.told.any(func(e): return e["id"] == "winningstreak"), "the Winning Streak: a combo finished, and his streak grows")
			_bare()
			_wear("sprungheels")
			_line(K.max_charges[2] == 2, "Sprung Heels: two jumps")
			_bare()
			_wear("receipt")
			var src = foes[0]
			src.world = M._free_near(h.world + h.face * 1.2)
			h._invuln = 0.0
			h.hurt_by(5.0, "phys", [], {}, src)
			_line(U.told.any(func(e): return e["id"] == "receipt"), "the Receipt: a blow from in front answered with a free punch")
			_bare()
	h.unhurt = false
	print("UNIQUESCLS: %s: %d checks, %d wrong%s" % [h.cls, n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE RANGER'S COMPANIONS (companions.gd; game.ts petsWanted, pickCompanion, pickCollarCompanion, stepPet, petBite): none without
## their talents; with each talent its first, kept by her; picked in town (on the talent's card) and not out of it; the Pack Collar's one more, of the
## others; on a floor each goes for a foe near her and its bite does its kind's word.
func companions(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var C = M._companions
	var L = M.loot
	L.level = 20
	L.derive()
	await M._wait(0.6)
	_line(h.cls == "ranger" and C.pets.is_empty(), "the Ranger, no companion talent taken: no companion (%d out)" % C.pets.size())
	h.talents.append("huntcompanion")
	h.talents_changed()
	await M._wait(0.6)
	var kinds := func() -> Array: return C.pets.map(func(p): return p["kind"])
	_line(kinds.call() == ["hawk"] and C.pets[0]["sprite"] != null and C.pets[0]["sprite"].texture != null, "the Hunting Companion taken: its first, the hawk, out and drawn (%s)" % [kinds.call()])
	# (on the TALENTS page: the Hunting Companion's card, a row of its three, the one out lit; a press on SNAKE picks it)
	M._inv.open_on(0)
	M._inv._press("tab", "talents")
	M._inv._tal.sel = "huntcompanion"
	await M._wait(0.4)
	await M._snap(dir + "/pets_talent_card.png")
	var row: Array = M._inv._tal_buttons.filter(func(b): return b[1] == "tal_pet")
	_line(row.map(func(b): return b[2]) == ["hawk", "snake", "wolf"], "the Hunting Companion's card on the TALENTS page: a row of %s" % [row.map(func(b): return b[2])])
	for b in row:
		if b[2] == "snake":
			M._inv._pressed(b[0].get_center())
	_line(C.picked_in("hunt") == "snake", "a press on SNAKE there: the snake picked (%s)" % C.picked_in("hunt"))
	M._inv._press("close", null)
	_line(C.pick("snake") == "" and C.pick("bat") == "Take its talent first", "in town the snake picked again; the bat (the wild list's) not till its talent is taken")
	await M._wait(0.4)
	h.talents.append("wildcompanion")
	h.talents_changed()
	_line(C.pick("fox") == "", "the Wild Companion taken, the fox picked")
	await M._wait(0.6)
	_line(kinds.call().has("snake") and kinds.call().has("fox") and kinds.call().size() == 2, "out now: %s" % [kinds.call()])
	_wear("packcollar")
	await M._wait(0.6)
	var choices: Array = C.collar_choices()
	_line(choices == ["hawk", "wolf", "bat", "tortoise"] and C.collar_pick() == "wolf" and kinds.call().size() == 3 and kinds.call().has("wolf"),
		"the Pack Collar worn: one more, of the others (%s), the next after her hunting pick until picked: %s; out %s" % [choices, C.collar_pick(), kinds.call()])
	_line(C.pick_collar("tortoise") == "" and C.pick_collar("snake") == "Not that one", "on the collar the tortoise picked; the snake, at her side already, not")
	await M._wait(0.6)
	_line(kinds.call().has("tortoise") and not kinds.call().has("wolf"), "out now: %s" % [kinds.call()])
	# (the gear screen: the collar's row, the tortoise lit)
	M._inv.open_on(0)
	M._inv._press("tab", "gear")
	await M._wait(0.4)
	await M._snap(dir + "/pets_collar_row.png")
	var rows: Array = M._inv._hits.filter(func(x): return x[1] == "collar")
	_line(rows.size() == 4, "the gear screen: the collar's %d companions in a row to pick from" % rows.size())
	M._inv._press("collar", "hawk")
	_line(C.collar_pick() == "hawk", "a press on HAWK in town: the collar brings the hawk")
	M._inv._press("close", null)
	await M._wait(0.6)
	await M._snap(dir + "/pets_town.png")
	# ON A FLOOR: each goes for a foe near her, and its bite does its kind's word
	M.way_depth = maxi(M.way_depth, 2)
	await M.go_to("floor2", "down")
	await M._wait(1.0)
	_line(C.pick("wolf") == "Choose companion in town" and C.pick_collar("bat") == "Choose companion in town", "out of town a pick says: Choose companion in town")
	var foes: Array = []
	for o in h.monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and foes.size() < 3:
			foes.append(o)
	for k in foes.size():
		var o = foes[k]
		o.world = M._free_near(h.world + h.face * (1.6 + k * 0.5))
		o.state = "chase"
		o.seen = true
		o.max_life = 100000.0
		o.life = 100000.0
		o.speed = 0.0
	var did := {}
	var rounds: Array = [{"hunt": "hawk", "wild": "bat", "collar": "wolf"}, {"hunt": "snake", "wild": "fox", "collar": "tortoise"}]
	var snapped := false
	for r in rounds:
		h.picks["pet:hunt"] = r["hunt"]
		h.picks["pet:wild"] = r["wild"]
		h.picks["pet:collar"] = r["collar"]
		var seen0: int = C.told.size()
		for q in 300:
			var life0: float = h.life
			var shield0: float = h.shield
			h.life = minf(h.life, h.max_life * 0.5)
			life0 = h.life
			await M._wait(0.02)
			for e in C.told.slice(seen0):
				if e["what"] != "bite" or did.has(e["kind"]):
					continue
				var ok := false
				match e["kind"]:
					"hawk":
						ok = foes.any(func(o): return o.mark_t > 0.0)
					"snake":
						ok = foes.any(func(o): return o.poison_t > 0.0)
					"wolf":
						ok = foes.any(func(o): return o.bind_t > 0.0 or o.bind_again > 0.0)
					"bat":
						ok = h.life > life0
					"fox":
						ok = h.haste_t > 0.0
					"tortoise":
						ok = h.shield > shield0 or h.shield > 0.0
				did[e["kind"]] = ok
				if not snapped:
					snapped = true
					await M._snap(dir + "/pets_bite.png")
			seen0 = C.told.size()
			if [r["hunt"], r["wild"], r["collar"]].all(func(k): return did.has(k)):
				break
	for k in ["hawk", "snake", "wolf", "bat", "fox", "tortoise"]:
		var what: String = {"hawk": "marks it (Precise)", "snake": "poisons it", "wolf": "holds it (Binding)", "bat": "heals her (Leeching)",
			"fox": "gives her a burst of speed (Swift)", "tortoise": "a brief shield (Guarding)"}[k]
		_line(did.get(k, false), "the %s bites%s and %s" % [k, "" if did.has(k) else " (no bite seen)", what])
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE FIRST DUNGEON'S FIGHT LESSON AND ITS GHOSTS (guide.gd; game.ts guideRows, updateGuide; ui/guide.ts guideBanner 'fight';
## main.ts hudIn.gesture; ui/hud.ts drawGesture): with a finger, the walking thumb pushed the way to go; in a fight a line for each
## move open, each ticked as it is done, the next one's gesture where it should be made; the flask's line once his life is low,
## the flask pointed at; kept in the save; with a mouse the keys and no ghost.
func lesson(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var G = M.guide
	var L = M.loot
	var T = M._touch
	L.taught = false
	h.practice = false
	L.level = 10
	h.loadout.set_level(10, L.ring_lit)
	T.on = true
	await M._wait(0.6)
	# (the floor's name across the screen gone: the prompt waits behind it)
	M._hud.floor_card = {}
	# (the floor's monsters far off and asleep, so that nothing is a fight yet)
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead:
			m.state = "sleep"
			m.seen = false
	h.walked = 0.0
	G.met = false
	await M._wait(0.3)
	var b: Dictionary = G.banner()
	_line(b.get("text", "") == "LEFT THUMB to MOVE" and G.gesture.get("kind", "") == "stick" and (G.gesture["dir"] as Vector2).length() > 0.0,
		"not walked yet: %s, and the walking thumb's ghost pushed %s" % [b.get("text", ""), G.gesture.get("dir")])
	await M._snap(dir + "/lesson_stick.png")
	h.walked = 5.0
	# A FIGHT: one awake, a little to his right on the screen
	var foe = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			foe = m
			break
	foe.world = M._free_near(h.world + Vector2(2.0, 0.0))
	foe.state = "chase"
	foe.seen = true
	foe.speed = 0.0
	foe.max_life = 100000.0
	foe.life = 100000.0
	h.uses = [0, 0, 0]
	await M._wait(0.4)
	b = G.banner()
	# (a lambda keeps the banner it was made with: each read is handed the one now)
	var ids := func(bn: Dictionary) -> Array: return (bn.get("lines", []) as Array).map(func(l): return [l["id"], l["how"], l["done"]])
	_line(G.met and ids.call(b).size() == 3 and str(ids.call(b)[0][1]) == "TAP" and str(ids.call(b)[1][1]) == "TAP + HOLD" and str(ids.call(b)[2][1]) == "SWIPE",
		"a fight: the lesson's lines %s (%s)" % [ids.call(b), (b.get("lines", []) as Array).map(func(l): return "%s %s" % [l["how"], l["what"]])])
	var on_foe: Vector2 = T.to_view(foe.world) - Vector2(0, 10)
	_line(G.gesture.get("kind", "") == "tap" and (G.gesture["at"] as Vector2).distance_to(on_foe) < 2.0, "its first line's ghost: a tap on the enemy (%s, the enemy at %s)" % [G.gesture, on_foe.round()])
	await M._wait(0.3)
	await M._snap(dir + "/lesson_tap.png")
	h.uses[0] = 1
	await M._wait(0.2)
	b = G.banner()
	_line(ids.call(b)[0][2] == true and G.gesture.get("kind", "") == "hold", "the quick attack used: its line ticked; the next one's ghost a hold (%s)" % G.gesture.get("kind", ""))
	await M._wait(0.5)
	await M._snap(dir + "/lesson_hold.png")
	h.uses[1] = 1
	await M._wait(0.2)
	b = G.banner()
	_line(G.gesture.get("kind", "") == "flick" and G.point == 2, "the slow one used: the swipe's ghost, the Lunge pointed at (%s, point %d)" % [G.gesture.get("kind", ""), G.point])
	await M._wait(0.15)
	await M._snap(dir + "/lesson_flick.png")
	# HIS LIFE LOW, a flask in hand: its line, the flask pointed at
	h.unhurt = false
	h.life = h.max_life * 0.3
	L.potions = maxi(1, L.potions)
	await M._wait(0.2)
	b = G.banner()
	_line(G.low and ids.call(b).size() == 4 and ids.call(b)[3][0] == "flask" and str(ids.call(b)[3][1]) == "TAP THE FLASK" and G.point == 3, "his life low: %s; pointed at: the flask (%d)" % [ids.call(b)[3] if ids.call(b).size() > 3 else null, G.point])
	await M._snap(dir + "/lesson_flask.png")
	L.drink()
	h.uses[2] = 1
	h.unhurt = true
	await M._wait(0.2)
	b = G.banner()
	_line(G.flask and not b.has("lines"), "the flask drunk and the Lunge made: the lesson's lines all done, gone (%s)" % b.get("text", "none"))
	# KEPT IN THE SAVE
	var run: Dictionary = preload("res://scripts/save.gd").run_of(M)
	_line(run.get("guide", {}) == {"met": true, "low": true, "quick": true, "slow": true, "evade": true, "flask": true}, "kept in the save: %s" % run.get("guide"))
	# WITH A MOUSE: the keys, and no ghost
	G.quick = false
	h.uses[0] = 0
	T.on = false
	b = G.banner()
	_line(not b.get("lines", []).is_empty() and str(b["lines"][0]["how"]) == "LEFT CLICK" and G.gesture.is_empty(), "with a mouse: %s, and no ghost" % [b.get("lines", []).map(func(l): return l["how"])])
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## PLAYING UPRIGHT (main.gd fit_screen, turn_label, flip_turn; engine/screen.ts; main.ts turnLabel, flipTurn): with a finger the pause
## panel offers PLAY UPRIGHT; pressed, the phone is held upright and the game laid out for it (about 270 game pixels wide): the
## prompt under the corners, the gear screen along the bottom with the game above it; PLAY SIDEWAYS turns it back.
func upright(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var T = M._touch
	T.on = true
	await M._wait(0.6)
	var size0: Vector2 = M.get_viewport().get_visible_rect().size
	M._mini.show_panel("pause")
	await M._wait(0.3)
	var turn = M._mini._hits.filter(func(x): return x[1] == "turn")
	_line(not turn.is_empty() and M.turn_label() == "PLAY UPRIGHT" and size0 == Vector2(960, 540), "sideways (%s game pixels): the pause panel with a finger offers %s" % [size0 / 2.0, M.turn_label()])
	await M._snap(dir + "/up_1_pause_sideways.png")
	M._mini._press("turn")
	await M._wait(0.5)
	var size1: Vector2 = M.get_viewport().get_visible_rect().size
	_line(M.upright and size1.y > size1.x and size1.x / 2.0 >= 270.0 and size1.x / 2.0 < 380.0 and M.turn_label() == "PLAY SIDEWAYS", "PLAY UPRIGHT pressed: held upright, the game %s game pixels; the switch now says %s" % [size1 / 2.0, M.turn_label()])
	var cf := ConfigFile.new()
	cf.load(M.SCREEN_KEEP)
	_line(cf.get_value("screen", "upright", false) == true, "kept with the device")
	await M._snap(dir + "/up_2_pause_upright.png")
	M._mini._press("resume")
	await M._wait(0.6)
	await M._snap(dir + "/up_3_playing.png")
	_line(M._hud._stacked == false and M._hud._notice_end >= 0.0, "the HUD laid out for it (the attacks side by side while they fit)")
	M._inv.open_on(0)
	M._inv._press("tab", "gear")
	await M._wait(0.4)
	await M._snap(dir + "/up_4_gear.png")
	_line(M._inv._tall() and M._inv._ph() >= 234.0 * 2.0 and M._inv._ph() <= 272.0 * 2.0, "the gear screen along the bottom, %d game pixels tall, the game above it" % [M._inv._ph() / 2.0])
	M._inv._press("close", null)
	await M._wait(0.3)
	M._mini.show_panel("pause")
	await M._wait(0.2)
	M._mini._press("turn")
	await M._wait(0.5)
	var size2: Vector2 = M.get_viewport().get_visible_rect().size
	_line(not M.upright and size2 == size0 and M.turn_label() == "PLAY UPRIGHT", "PLAY SIDEWAYS pressed: sideways again, %s game pixels" % [size2 / 2.0])
	M._mini._press("resume")
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## A GAME CONTROLLER (pad.gd; engine/gamepad.ts; main.ts padFrame, padControls): a pad of the check's own. The left stick walks
## him at one speed; the right stick aims at the enemy that way and turns him; RT strikes; A lunges the way he goes; the prompts
## name its buttons; Y opens the inventory and in a screen the stick moves a pointer and B goes back; START pauses; BACK the map;
## left idle 8 s, the prompts are the keyboard's again.
func pad(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var P = M._pad
	var frames := func(n: int) -> void:
		for i in n:
			await M.get_tree().process_frame
	var tap := func(b: String) -> void:
		P.fake = {"axes": [0, 0, 0, 0, 0, 0], "buttons": [b]}
		await frames.call(3)
		P.fake = {"axes": [0, 0, 0, 0, 0, 0], "buttons": []}
		await frames.call(3)
	M._hud.floor_card = {}
	M.loot.taught = false
	h.walked = 0.0
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead:
			m.state = "sleep"
	await M._wait(0.3)
	_line(not M.pad_live, "no pad played with: not live (%s)" % M.pad_live)
	var at0: Vector2 = h.world
	P.fake = {"axes": [0.9, 0.0, 0, 0, 0, 0], "buttons": []}
	await M._wait(0.6)
	var walked: float = h.world.distance_to(at0)
	var b: Dictionary = M.guide.banner()
	_line(M.pad_live and walked > 1.0 and b.get("text", "") == "LEFT STICK to MOVE" and M.guide.press_name(0) == "RT" and M.guide.press_name(2) == "A",
		"the left stick held: he walks (%.1f tiles in 0.6 s); the prompt %s / %s; the moves %s, %s, %s" % [walked, b.get("text", ""), b.get("sub", ""), M.guide.press_name(0), M.guide.press_name(1), M.guide.press_name(2)])
	await M._snap(dir + "/pad_1_walking.png")
	h.walked = 5.0
	# THE RIGHT STICK: at an enemy that way
	var foe = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			foe = m
			break
	foe.world = M._free_near(h.world + Iso.screen_dir_to_world(Vector2(1, 0)) * 3.0)
	foe.state = "chase"
	foe.seen = true
	foe.speed = 0.0
	foe.max_life = 100000.0
	foe.life = 100000.0
	var way: Vector2 = Iso.to_screen(foe.world.x, foe.world.y) - Iso.to_screen(h.world.x, h.world.y)
	P.fake = {"axes": [0, 0, way.normalized().x, way.normalized().y, 0, 0], "buttons": []}
	await frames.call(4)
	var aim0: Vector2 = h.touch_aim.get(0, Vector2.INF)
	_line(M._touch.lock == foe and aim0.distance_to(foe.world) < 1.5 and h.face.dot((foe.world - h.world).normalized()) > 0.9,
		"the right stick pushed toward the %s: locked onto it (its gold ring), the quick attack aimed at it, he faces it" % foe.kind)
	var uses0: int = h.uses[0]
	P.fake = {"axes": [0, 0, way.normalized().x, way.normalized().y, 0, 1.0], "buttons": []}
	await M._wait(0.8)
	await M._snap(dir + "/pad_2_aim_strike.png")
	_line(h.uses[0] > uses0, "RT held: he strikes (%d blows)" % (h.uses[0] - uses0))
	P.fake = {"axes": [0, 0, 0, 0, 0, 0], "buttons": []}
	await M._wait(0.6)
	var at1: Vector2 = h.world
	P.fake = {"axes": [-0.9, 0.0, 0, 0, 0, 0], "buttons": ["A"]}
	await M._wait(0.5)
	P.fake = {"axes": [0, 0, 0, 0, 0, 0], "buttons": []}
	_line(h.world.distance_to(at1) > 2.5, "A, walking left: the Lunge that way (%.1f tiles)" % h.world.distance_to(at1))
	await M._wait(0.4)
	_line(M._hud._pad() and M.guide.press_name(1).ends_with("LT"), "the HUD names its buttons: INVENTORY (Y), the flask X, the Lunge A, the attacks RT and %s" % M.guide.press_name(1))
	await M._snap(dir + "/pad_3_hud.png")
	# Y: the inventory; a pointer; B back
	await tap.call("Y")
	var opened: bool = M._inv.visible
	P.fake = {"axes": [0.8, 0.5, 0, 0, 0, 0], "buttons": []}
	await M._wait(0.3)
	P.fake = {"axes": [0, 0, 0, 0, 0, 0], "buttons": []}
	await frames.call(2)
	var ptr: bool = P.pointer
	await M._snap(dir + "/pad_4_inventory_pointer.png")
	await tap.call("B")
	await frames.call(4)
	_line(opened and ptr and not M._inv.visible, "Y: the inventory (%s); in it the stick moves a pointer (%s, at %s); B: closed (%s)" % [opened, ptr, Vector2(P.px, P.py).round(), not M._inv.visible])
	# START: pause; B back. BACK: the map; BACK again
	await tap.call("START")
	await frames.call(4)
	var paused: bool = M._mini.open == "pause"
	await M._snap(dir + "/pad_5_pause.png")
	await tap.call("B")
	await frames.call(6)
	var unpaused: bool = M._mini.open == ""
	await tap.call("BACK")
	await frames.call(4)
	var mapped: bool = M._mini.open == "map"
	await tap.call("BACK")
	await frames.call(6)
	_line(paused and unpaused and mapped and M._mini.open == "", "START: paused (%s), B: back to the game (%s); BACK: the map (%s), BACK: closed (%s)" % [paused, unpaused, mapped, M._mini.open == ""])
	# idle: the keyboard's names again
	P.fake = null
	P.idle = 9.0
	await frames.call(3)
	_line(not M.pad_live and M.guide.press_name(0) == "LEFT CLICK", "left idle: the prompts name the mouse's again (%s)" % M.guide.press_name(0))
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## EVERY WORD ON A DUNGEON (foe_words.gd; game/foe_melds.ts): the altar's rules for a melded and a ranked word, counted as two; a
## ranked word's word half as strong again on a monster; a melded word's two elements each on his blow; and every twist, one at a
## time, on a monster given its melded word.
func foewords(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var FW := preload("res://scripts/foe_words.gd")
	var F = M._foe
	await M._wait(0.6)
	# THE ALTAR'S RULES (static, as the game's layProblem)
	_line(FW.lay_problem(["swift"], "scald", "stronghold") == "" and FW.lay_problem(["swift", "scald"], "frost", "stronghold") == "Already on it"
		and FW.lay_problem(["swift", "scald"], "lightning", "stronghold") == "One element per stronghold" and FW.lay_problem(["swift", "scald"], "poison", "stronghold") == ""
		and FW.words_weight(["swift", "scald"]) == 3
		and FW.foe_words_of(["scald"]) == ["fire", "frost", "scald"] and FW.weight("fire2") == 2,
		"the altar (as the game's layProblem): Scald beside Swift; Frost not (it is in Scald); Lightning not (one element); Poison yes (no element); Swift and Scald worth 3 words; Scald on a monster: %s" % [FW.foe_words_of(["scald"])])
	# A MONSTER, given words one at a time
	var foes: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and not o.boss)
	var m = foes[0]
	m.world = M._free_near(h.world + Vector2(1.2, 0))
	m.state = "chase"
	m.speed = 0.0
	m.max_life = 100000.0
	m.life = 100000.0
	var give := func(ws: Array) -> void:
		m.words = ws.duplicate()
		m.half = []
	var clear_hero := func() -> void:
		h.burn_t = 0.0
		h.chill_t = 0.0
		h.poison_t = 0.0
		h.shock_t = 0.0
		h.held = 0.0
		h.siphon_less = 0.0
		h.blight_more = 0.0
		h.frostbite_dps = 0.0
		h.shield = 0.0
	give.call(["fire", "fire2"])
	_line(is_equal_approx(m.word_share("fire"), 1.5) and is_equal_approx(m.word_share("fire2"), 1.0), "Fire with its Rank II: its Fire half as strong again (%.2f)" % m.word_share("fire"))
	clear_hero.call()
	give.call(["fire", "frost", "scald"])
	h.hurt_by(20.0, "fire", m.words, {}, m)
	_line(h.burn_t > 0.0 and h.chill_t > 0.0, "Scald's blow, of Fire: half of it Frost too, and each leaves its own (burning %s, chilled %s)" % [h.burn_t > 0.0, h.chill_t > 0.0])
	# SIPHON
	clear_hero.call()
	give.call(["leech", "poison", "siphon"])
	h.hurt_by(20.0, "phys", m.words, {}, m)
	var life0: float = h.life
	h.life = h.max_life * 0.5
	var before: float = h.life
	h.heal_flat(20.0)
	_line(h.siphon_less > 0.0 and is_equal_approx(h.life - before, 20.0 * (1.0 - h.siphon_less)), "Siphon: its poison on him, he heals less (a heal of 20 gives %.1f)" % (h.life - before))
	h.life = life0
	# SHIVER (now and then a critical, freezing him)
	clear_hero.call()
	give.call(["precise", "frost", "shiver"])
	var froze := false
	for i in 60:
		h._invuln = 0.0
		h.held = 0.0
		h.hurt_by(10.0, "frost", m.words, {}, m)
		if h.held > 0.0:
			froze = true
			break
	_line(froze, "Shiver: now and then a critical, and he is frozen in place a moment")
	# SUNDER (its next blow soon after, harder)
	clear_hero.call()
	give.call(["heavy", "power", "sunder"])
	h._invuln = 0.0
	h.hurt_by(10.0, "phys", m.words, {}, m)
	var due: bool = m.foe_sunder_at > -1e8
	h._invuln = 0.0
	var n0: int = F.told.size()
	h.hurt_by(10.0, "phys", m.words, {}, m)
	_line(due and F.told.slice(n0).any(func(e): return e.get("text", "") == "Sundered"), "Sunder: its next blow soon after one, a follow-up, harder (Sundered)")
	# FORKING, ERUPTION, THUNDER: marks
	clear_hero.call()
	give.call(["twin", "lightning", "forking"])
	var w0: int = M._monsters.perils.list.size()
	h._invuln = 0.0
	h.hurt_by(10.0, "lightning", m.words, {}, m)
	_line(M._monsters.perils.list.size() > w0, "Forking: its lightning blow forks, a second bolt marked where he was")
	give.call(["power", "fire", "eruption"])
	m.foe_n = 0
	w0 = M._monsters.perils.list.size()
	for i in 4:
		h._invuln = 0.0
		h.hurt_by(5.0, "fire", m.words, {}, m)
	_line(M._monsters.perils.list.any(func(p): return p["kind"] == "warn" and Vector2(p["x"], p["y"]).distance_to(m.world) < 0.1), "Eruption: its fourth blow, its heat bursts round it (a ring)")
	# WILDFIRE, FROSTBITE, BLIGHT, AVALANCHE
	clear_hero.call()
	give.call(["fire", "lightning", "wildfire"])
	h._invuln = 0.0
	h.hurt_by(10.0, "fire", m.words, {}, m)
	_line(M.wakes.list.any(func(z): return z.get("foe") == "wildfire"), "Wildfire: a small fire where he stood")
	clear_hero.call()
	give.call(["frost", "poison", "frostbite"])
	h._invuln = 0.0
	h.hurt_by(10.0, "frost", m.words, {}, m)
	_line(h.frostbite_dps > 0.0, "Frostbite: chilled by it, he bleeds cold (%.1f a second)" % h.frostbite_dps)
	clear_hero.call()
	give.call(["power", "poison", "blight"])
	h._invuln = 0.0
	h.hurt_by(10.0, "phys", m.words, {}, m)
	var kb := func(w: String) -> float: return 0.0
	_line(h.blight_more > 0.0 and F.harder(kb, [["phys", 1.0]], null) > 1.0, "Blight: its poison on him, every blow harder (x%.2f)" % F.harder(kb, [["phys", 1.0]], null))
	clear_hero.call()
	h.chill_t = 2.0
	var ka := func(w: String) -> float: return 1.0 if w == "avalanche" else 0.0
	_line(F.harder(ka, [["frost", 1.0]], null) > 1.0, "Avalanche: on him chilled, harder (x%.2f)" % F.harder(ka, [["frost", 1.0]], null))
	# CAUTERIZE, HAILSTORM, FERVOR, RIME WARD
	give.call(["leech", "fire", "cauterize"])
	m.seared = false
	m.life = m.max_life * 0.2
	var low: float = m.life
	await M._wait(1.0)
	_line(m.seared and m.life > low, "Cauterize: low on life, it sears its wounds shut once (%.0f to %.0f)" % [low, m.life])
	give.call(["frost", "lightning", "hailstorm"])
	m.hail_t = 0.05
	w0 = M._monsters.perils.list.size()
	await M._wait(0.3)
	_line(M._monsters.perils.list.any(func(p): return p["kind"] == "warn" and Vector2(p["x"], p["y"]).distance_to(h.world) < 0.5), "Hailstorm: hail marked round him")
	give.call(["frenzied", "fire", "fervor"])
	m.fervor_n = 0
	var other = foes[1]
	other.world = M._free_near(m.world + Vector2(1.0, 0))
	other.words = []
	other.damage(other.life + 10.0, "phys", false, false, [], false, false, 0)
	await M._wait(0.1)
	_line(m.fervor_n == 1 and m.rage() > 1.0, "Fervor: an enemy dying near it feeds it, faster (x%.2f)" % m.rage())
	clear_hero.call()
	give.call(["guarding", "frost", "rimeward"])
	m.shield = 50.0
	m.rime_at = -1e9
	m.damage(10.0, "phys", false, false, [], false, false, 0)
	_line(h.chill_t > 0.0, "Rime Ward: a blow of his on its shield chills him")
	await M._snap(dir + "/foe_1_twists.png")
	# AS THEY DIE
	var die := func(o, ws: Array) -> void:
		o.words = ws.duplicate()
		o.half = []
		o.world = M._free_near(h.world + Vector2(1.5, 0.5))
		o.damage(o.life + 10.0, "phys", false, false, [], false, false, 0)
	var left: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and not o.boss and o != m)
	var grounds := func(id: String) -> bool: return M.wakes.list.any(func(z): return z.get("foe") == id)
	die.call(left[0], ["fire", "poison", "fumes"])
	die.call(left[1], ["lightning", "poison", "contagion"])
	die.call(left[2], ["poison", "volatile", "rupture"])
	await M._wait(0.1)
	_line(grounds.call("fumes") and grounds.call("contagion") and grounds.call("rupture"), "Fumes, Contagion, Rupture: each dies into its cloud")
	var a0: int = M._monsters._arrows.size()
	die.call(left[3], ["frost", "volatile", "shatter"])
	await M._wait(0.05)
	_line(M._monsters._arrows.size() - a0 >= 8, "Shatter: a ring of %d ice shards" % (M._monsters._arrows.size() - a0))
	die.call(left[4], ["fire", "volatile", "powderkeg"])
	await M._wait(0.05)
	var keg: Array = M.wakes.list.filter(func(z): return z.get("foe") == "powderkeg")
	_line(not keg.is_empty() and float(keg[0]["t"]) < 0.0, "Powderkeg: burning ground, waiting for its blast")
	w0 = M._monsters.perils.list.size()
	die.call(left[5], ["power", "volatile", "demolition"])
	await M._wait(0.05)
	var big: Array = M._monsters.perils.list.filter(func(p): return p["kind"] == "warn" and float(p["r"]) > 3.0)
	_line(not big.is_empty(), "Demolition: its blast wider (%.1f), slower and harder" % (float(big[0]["r"]) if not big.is_empty() else 0.0))
	var at0: Vector2 = h.world
	die.call(left[6], ["pulling", "volatile", "implode"])
	await M._wait(0.6)
	_line(grounds.call("implode") or h.world.distance_to(at0) > 0.05, "Implode: as it dies it pulls him in (moved %.2f)" % h.world.distance_to(at0))
	await M._snap(dir + "/foe_2_deaths.png")
	print("GLOWS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


## THE SOUND CHAT'S FOURTEENTH AND FIFTEENTH BATCHES (25.3.21, 25.3.22): fewer repeats (the enemies' grunts and deaths one time in
## three by a count, the hero's shouts and grunts one time in three, four takes of each family's cries and a new shout and grunt
## for each hero, never the same take twice running where there are three or more), the music about a minute round, and no
## constant sound but the music (each place's sounds now and then on their own countdowns).
func sounds14(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	var S = M.sfx
	await M._wait(0.4)
	# THE TAKES
	var fams := ["bat", "bones", "book", "bug", "deer", "devil", "flesh", "hound", "hshape", "hushed", "ink", "leech", "moth", "order", "rat", "rshade", "spirit", "stone", "swan", "troll", "vulture", "watch", "wolf"]
	var short: Array = []
	for f in fams:
		for k in ["aggro", "hurt", "death"]:
			if S._takes_of("%s_%s" % [f, k]).size() != 4:
				short.append("%s_%s" % [f, k])
	_line(short.is_empty() and S._takes_of("breeze").size() == 3, "four takes of each of the 23 voice families' cry on seeing him, grunt and death (%s); three of the breeze" % ("all" if short.is_empty() else str(short)))
	var hero_takes: Array = []
	for who in ["warrior", "ranger", "mage", "warlock", "tinkerer", "brawler"]:
		var a := 0
		for t in S.CRIES["attack"]:
			a += S._takes_of("%s_%s" % [who, t]).size()
		var g := 0
		for t in S.CRIES["grunt"]:
			g += S._takes_of("%s_%s" % [who, t]).size()
		hero_takes.append([who, a, g])
	_line(hero_takes.all(func(x): return x[1] == 6 and x[2] == 4), "each hero's new shout and grunt (attack_c, hurt_c): shouts and grunts %s" % [hero_takes])
	# NEVER THE SAME TAKE TWICE RUNNING (three takes or more), two still at random
	S.heard.clear()
	for i in 40:
		S.play("bat_hurt", -60.0)
	var twice := 0
	for i in range(1, S.heard.size()):
		if S.heard[i][1] == S.heard[i - 1][1]:
			twice += 1
	var kinds := {}
	for e in S.heard:
		kinds[e[1]] = true
	_line(twice == 0 and kinds.size() == 4, "40 of a bat's grunt: never the same take twice running (%d), all four heard" % twice)
	# THE ENEMIES' GRUNT AND DEATH ONE TIME IN THREE, BY A COUNT
	var mm = M._monsters
	mm.cry_count.clear()
	var kept: Array = []
	for i in 9:
		kept.append(mm.kept_cry("bones_death", 3))
	_line(kept == [true, false, false, true, false, false, true, false, false], "a family's deaths: its 1st, 4th and 7th cry out, the others not (%s)" % [kept])
	var foes: Array = mm.list.filter(func(o): return is_instance_valid(o) and not o.dead and not o.boss and o.VOICE.has(o.kind) and not o.champion)
	var died: Array = []
	if foes.size() >= 3:
		var fam: String = foes[0].VOICE[foes[0].kind]
		var same: Array = foes.filter(func(o): return o.VOICE[o.kind] == fam)
		mm.cry_count.clear()
		S.heard.clear()
		var k := 0
		for o in same.slice(0, 4):
			o.world = M._free_near(h.world + Vector2(1.5, 0))
			o.life = 1.0
			o._take(50.0, "phys", false, false, [], false, false)
			k += 1
		await M._wait(0.2)
		for e in S.heard:
			if e[0] == fam + "_death" or e[0] == "monster_die":
				died.append(e[0])
		_line(k >= 2 and died.size() == k and died[0] == fam + "_death" and (k < 2 or died[1] == "monster_die") and (k < 4 or died[3] == fam + "_death"), "%d of the %s family killed: %s" % [k, fam, died])
	else:
		_line(false, "not enough of one voice family here to kill (%d)" % foes.size())
	# THE HERO'S SHOUTS AND GRUNTS ONE TIME IN THREE
	S.passed_over = 0
	S.last_cry = []
	var cried := 0
	for i in 300:
		S._clock += 3.0
		S.last_cry = []
		S.voice("warrior", "hurt")
		if S.last_cry == ["warrior", "grunt"]:
			cried += 1
	_line(cried > 60 and cried < 140 and S.passed_over > 150, "300 hurts 3 s apart: %d grunts, %d passed over (one time in three, the lines aside)" % [cried, S.passed_over])
	# THE MUSIC ABOUT A MINUTE ROUND
	var mj: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/music/music.json"))
	var walk: Dictionary = mj["places"]["f1"]["walk"]
	var st: AudioStream = load("res://assets/music/" + str(walk["file"]))
	_line(str(walk["file"]) == "music_f1_walk_long.ogg" and absf(st.get_length() - float(walk["loop"])) < 0.05 and float(walk["loop"]) > 50.0, "floor 1's walk about a minute round: %s, %.2f s (its loop %.2f s)" % [walk["file"], st.get_length(), float(walk["loop"])])
	# NO CONSTANT SOUND BUT THE MUSIC
	var loops: Array = []
	for p in S.get_children():
		if p is AudioStreamPlayer and p.playing and p.stream != null and p.stream.resource_path.get_extension() == "wav":
			loops.append(p.stream.resource_path.get_file())
	_line(loops.is_empty() and S.ambient_names() == ["amb_f2"], "floor 2: no loop under it (%s); its sounds now and then %s, every 16 to 40 s" % [loops, S.ambient_names()])
	print("GLOWS: %d checks, %d wrong" % [n, bad.size()])
	for b in bad:
		print("  WRONG: ", b)

