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

