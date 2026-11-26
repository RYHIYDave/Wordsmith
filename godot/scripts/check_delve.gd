## DELVE DEEPER, ITS CHECK AND PICTURES (--only=delve --delve=1 --shots=<dir>; main.gd DELVE): endless by the hero's depth, a line a
## step (OK or WRONG):
##   an endless level no harder than the one before it (Endless 12 and Endless 40 the same, at a depth); each depth a third stronger,
##   its finds three levels deeper and 15 more magic find; the Shaft's Rim's record stone naming the depth; the gate's page with the
##   depth and DELVE DEEPER (his words, 26 Nov 2026: “a delve deeper button on the door?”), pressed once (asked), let go (nothing),
##   pressed twice (a depth deeper, for good, kept in the save, on his hero's record); a level cleared there on his record; the record
##   stone's page, his deepest with each hero; the shards still only the bosses' of floors 5, 10, 15, 20.
extends RefCounted

const Save := preload("res://scripts/save.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("DELVE %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _hit(action: String):
	for x in M._inv._hits:
		if x[1] == action:
			return x
	return null


func _said(start: String) -> String:
	for m in M.loot.msgs:
		if str(m["text"]).begins_with(start):
			return str(m["text"])
	return ""


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	# (no lessons across the pictures: walked enough, shown the game)
	M.loot.taught = true
	M.loot.ring_lit = true
	h.walked = 500.0
	await M._wait(0.6)
	M.open_endless(20)
	_line(M.delve_on() and M.delve == 1 and _said("Endless mode is open: the waypoint leads on. For harder levels") != "", "endless open, at Depth 1; its line names the record stone")
	# THE LEVEL ALONE MAKES IT NO HARDER
	M.endless = 12
	var t12: float = M.endless_tough()
	var p12: int = M.endless_power()
	M.endless = 40
	var t40: float = M.endless_tough()
	var p40: int = M.endless_power()
	_line(is_equal_approx(t12, 1.0) and t12 == t40 and p12 == p40 and p12 == M.last_built() + 1, "Depth 1: Endless 12 and Endless 40 the same (%.2fx, finds of depth %d and %d)" % [t12, p12, p40])
	# EACH DEPTH: A THIRD STRONGER, FINDS THREE LEVELS DEEPER, 15 MORE MAGIC FIND
	M.in_endless = true
	var mf1: float = M.loot.magic_find()
	var s1: Dictionary = M.endless_strength(5)
	M.delve = 3
	var t3: float = M.endless_tough()
	var mf3: float = M.loot.magic_find()
	var s3: Dictionary = M.endless_strength(5)
	_line(is_equal_approx(t3, 16.0 / 9.0) and M.endless_power() == M.last_built() + 7 and is_equal_approx(mf3 - mf1, 30.0)
		and is_equal_approx(float(s3["life"]) / float(s1["life"]), 16.0 / 9.0) and is_equal_approx(float(s3["dmg"]) / float(s1["dmg"]), 16.0 / 9.0) and float(s3["xp"]) > float(s1["xp"]),
		"Depth 3: monsters %.2fx (life %.2fx, damage %.2fx the depth 1's), finds of depth %d, magic find +%.0f, more experience (%.2f to %.2f)" % [t3, float(s3["life"]) / float(s1["life"]), float(s3["dmg"]) / float(s1["dmg"]), M.endless_power(), mf3 - mf1, float(s1["xp"]), float(s3["xp"])])
	M.in_endless = false
	M.delve = 1
	M.endless = 12
	# THE RECORD STONE AT THE SHAFT'S RIM
	M.go_to(M.home_place(), "start")
	await M._wait(2.0)
	var T = M.town
	var R = T.rim_node if T != null else null
	var st: Array = (T.data["stations"] as Array).filter(func(s): return str(s["kind"]) == "record") if T != null else []
	_line(M.place == "rim" and R != null and R.record_line() == "DEPTH 1, ENDLESS 12" and st.size() == 1, "the Shaft's Rim: the record stone's name '%s', and it is used (%d)" % [R.record_line() if R != null else "", st.size()])
	# (beside the stone, to its right, looking at it: the stone seen)
	h.world = Vector2(float(st[0]["x"]) + 0.8, float(st[0]["y"]) + 0.5)
	h.face = (Vector2(float(st[0]["x"]), float(st[0]["y"])) - h.world).normalized()
	M.loot.msgs.clear()
	M.guide._speak = {}
	M._hud.card = {}
	await M._wait(0.5)
	var near: String = T.station_near()
	_line(near == "record" and str(T.prompt[0]) == "E: Record stone", "beside it: '%s'" % T.prompt[0])
	# THE GATE: THE DEPTH CHOSEN WHERE THE WORDS ARE BURNED IN (his words: “a delve deeper button on the door?”)
	var I = M._inv
	M.loot.give_word("frost")
	M.loot.give_word("twin")
	T._do("gate")
	await M._wait(0.3)
	M.plan_word("frost")
	await M._wait(0.4)
	await M._snap(dir + "/delve_1_gate.png")
	_line(I.visible and I.svc == "gate" and _hit("gate_delve") != null, "the gate's page: its depth and DELVE DEEPER")
	# PRESSED ONCE: ASKED; LET GO: NOTHING
	I._gate_press("gate_delve", null)
	await M._wait(0.4)
	await M._snap(dir + "/delve_2_asked.png")
	_line(M.delve == 1 and _said("Delve deeper, to Depth 2?") != "" and M.delve_ask > 0.0, "pressed once: asked ('%s'), still Depth 1" % _said("Delve deeper"))
	await M._wait(float(M.DELVE["confirm"]) + 0.3)
	_line(M.delve == 1 and M.delve_ask == 0.0, "let go %.0f s: nothing, still Depth 1" % float(M.DELVE["confirm"]))
	# PRESSED TWICE: A DEPTH DEEPER, FOR GOOD
	M.loot.msgs.clear()
	I._gate_press("gate_delve", null)
	await M._wait(0.3)
	I._gate_press("gate_delve", null)
	await M._wait(0.5)
	await M._snap(dir + "/delve_3_deeper.png")
	var run: Dictionary = Save.run_of(M)
	var rec: Dictionary = M.delve_best_by.get(str(h.cls), {})
	_line(M.delve == 2 and M.best_delve == 2 and R.record_line() == "DEPTH 2, ENDLESS 12" and _said("Depth 2.") != "" and int(run.get("delve", 0)) == 2 and int(Save.meta_of(M).get("bestDelve", 0)) == 2 and int(rec.get("depth", 0)) == 2,
		"pressed twice: Depth 2 ('%s'), the stone '%s', saved (run %d, best %d), his hero's record Depth %d" % [_said("Depth 2."), R.record_line(), int(run.get("delve", 0)), int(Save.meta_of(M).get("bestDelve", 0)), int(rec.get("depth", 0))])
	# A LEVEL CLEARED AT IT: ON HIS HERO'S RECORD
	M.delve_note(14)
	var meta: Dictionary = Save.meta_of(M)
	M.delve_best_by = {}
	Save.restore_meta(M, meta)
	_line(int(M.delve_best_by.get(str(h.cls), {}).get("endless", 0)) == 14 and int(M.delve_best_by[str(h.cls)]["depth"]) == 2, "Endless 14 cleared at Depth 2: on his record, and read back from the save (%s)" % [M.delve_best_by.get(str(h.cls), {})])
	I.toggle()
	await M._wait(0.3)
	# THE RECORD STONE: HIS DEEPEST WITH EACH HERO (for the picture, some heroes' records as if played)
	var keep: Dictionary = M.delve_best_by.duplicate(true)
	M.delve_best_by["warlock"] = {"depth": 4, "endless": 31}
	M.delve_best_by["mage"] = {"depth": 2, "endless": 19}
	M.delve_best_by["ranger"] = {"depth": 3, "endless": 22}
	T._do("record")
	await M._wait(0.5)
	await M._snap(dir + "/delve_4_stone.png")
	_line(I.visible and I.svc == "record", "the record stone used: its page, his deepest with each hero")
	I.toggle()
	M.delve_best_by = keep
	M.delve = 1
	Save.restore_run(M, run)
	_line(M.delve == 2, "the save read back: Depth %d" % M.delve)
	# THE SHARDS: STILL ONLY THE BOSSES OF FLOORS 5, 10, 15 AND 20 (his word)
	var S = M.shards
	var was_q: int = M.quarters
	var was_depth: int = int(M.map.depth)
	M.in_endless = true
	var drops := {}
	for d in [7, 5, 12, 10]:
		M.map.depth = d
		M.quarters = 0
		S._things = []
		S.boss_down(_Boss.new(h.world))
		drops[d] = not S._things.is_empty()
		for t in S._things:
			if is_instance_valid(t["node"]):
				t["node"].queue_free()
	S._things = []
	M.map.depth = was_depth
	M.quarters = was_q
	M.in_endless = false
	_line(drops == {7: false, 5: true, 12: false, 10: true}, "a shard falls only from the bosses of floors 5, 10, 15 and 20 (floors 7, 5, 12, 10: %s)" % [drops])
	print("DELVE: %d checks, %s" % [n, "all OK" if bad.is_empty() else "WRONG: %s" % [bad]])


## (a boss fallen, for the shards' roll)
class _Boss:
	var boss := true
	var world := Vector2.ZERO
	func _init(at: Vector2) -> void:
		world = at
