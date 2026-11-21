## THE CHECK OF WHAT THE MONSTERS' PICTURES GIVE OFF (--only=glows; render.ts monsterLit, light, MONSTER_LIGHT_MIN; engine/px.ts
## drawLights): on floor 2, in the dark, a cultist near: its picture's lights (its eyes, its fire) laid over the dark; a light of a
## picture 7 or more across cutting a pool in the dark round it; none while it is frozen; and the hero's own lights over the dark.
## Pictured. A line a thing; then the sum, GLOWS.
extends RefCounted

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

