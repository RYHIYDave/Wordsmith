## WHAT A MOVE OPENING WITH A LEVEL IS CALLED (his words, 27 Nov 2026: “when i have the hammer selected form lvl1, when i level up it
## says "unlocked whirlwind" when earthquake is unlocked and whirlwind isnt even what it unlocks with sword at lvl2”):
## `--only=movenames`. A new Warrior on floor 1, at level 1, with each of his three weapons taken in turn, brought to level 2: the
## news and the HUD's NEW MOVE name the move his weapon has in that place.
extends RefCounted

const Talents := preload("res://scripts/talents.gd")
const Words := preload("res://scripts/words.gd")

var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("MOVENAMES %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(M, h, _dir: String) -> void:
	h.unhurt = true
	M.go_to("floor1", "stairs")
	await M._wait(0.8)
	var L = M.loot
	for w in ["greatsword", "battleaxe", "warhammer"]:
		h.first_levels = true
		L.level = 1
		L.xp = 0
		h.loadout.level = 1
		h.talents = [] if w == "greatsword" else [w]
		h.talents_changed()
		h.arm()
		L.msgs.clear()
		M.move_toast = {}
		var need: float = float(L.xp_to_next(1))
		L.gain_xp(need + 1.0)
		await M._wait(0.2)
		var said := ""
		for m in L.msgs:
			if str(m["text"]).begins_with("A new move"):
				said = str(m["text"])
		var opened: Array = []
		var opens: Array = Words.data()["moveOpens"]
		for i in range(1, opens.size()):
			if int(opens[i]) == 2:
				opened.append(i)
		var want := ""
		if not opened.is_empty():
			want = str(Words.skill(h.loadout.id(int(opened[0])))["name"]).to_upper()
		var toast_name := ""
		if not M.move_toast.is_empty():
			toast_name = str(Words.skill(h.own_move_id(int(M.move_toast["skill"])))["name"]).to_upper()
		_line(want != "" and said.contains(want) and toast_name == want, "%s at level 2: \"%s\", NEW MOVE %s (his move there: %s)" % [w, said, toast_name, want])
	print("MOVENAMES: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
