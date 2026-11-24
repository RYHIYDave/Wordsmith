## CHECKS: THE LEXICON IN THE STASH (town.gd LEXICON_IN_STASH, his words, 24 Nov 2026: “I'd also like to get rid of the lexicon in the
## middle of town and add it to the stash chest”), `--only=lexstash`: switched on, the town has no Lexicon of its own (no station, no
## book on its stand), the stash's half has a LEXICON button that opens the Lexicon's shelf, and the Lexicon's a STASH button back;
## pictured for his yes: the town where the Lexicon stood, the stash, the Lexicon opened from it.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("LEXSTASH %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var Town := preload("res://scripts/town.gd")
	var was: bool = Town.LEXICON_IN_STASH
	Town.LEXICON_IN_STASH = true
	var loot = M.loot
	var inv = M._inv
	M.last_floor = 5
	loot.cleared = 4
	await M.go_to("town", "gate")
	await M._wait(0.8)
	loot.ring_lit = true
	loot.taught = true
	loot.lexicon = {"twin": 2, "frost": 1}
	var kinds: Array = M.town.data["stations"].map(func(s): return str(s["kind"]))
	var props: Array = M.town.data["props"].filter(func(p): return str(p["kind"]) == "lexicon")
	_line(not kinds.has("lexicon") and kinds.has("stash") and props.is_empty(), "the town without a Lexicon of its own: its services %s, no book on its stand" % [kinds])
	# (where it stood, pictured)
	h.world = M._spot_near(Vector2(13.5, 12.5), 1.2, h.world)
	await M._wait(0.6)
	await M._snap(dir + "/town_no_lexicon.png")
	var at := Vector2.ZERO
	for s in M.town.data["stations"]:
		if str(s["kind"]) == "stash":
			at = Vector2(s["x"], s["y"])
	h.world = M._spot_near(at, 1.4, h.world)
	await M._wait(0.5)
	var p0: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.4)
	_line(p0 == "E: Stash" and inv.visible and inv.svc == "stash", "'%s': the stash's half" % p0)
	await M._snap(dir + "/stash_with_lexicon.png")
	var btn = null
	for hit in inv._hits:
		if str(hit[1]) == "svc_swap":
			btn = hit
	_line(btn != null and str(btn[2]) == "lexicon", "on it, a LEXICON button")
	if btn != null:
		inv._press("svc_swap", btn[2])
	await M._wait(0.4)
	_line(inv.svc == "lexicon" and inv.visible, "pressed: the Lexicon's shelf, opened from the stash (%s)" % inv.svc)
	await M._snap(dir + "/lexicon_from_stash.png")
	var back = null
	for hit in inv._hits:
		if str(hit[1]) == "svc_swap":
			back = hit
	if back != null:
		inv._press("svc_swap", back[2])
	await M._wait(0.3)
	_line(back != null and inv.svc == "stash", "and its STASH button back to the stash (%s)" % inv.svc)
	Town.LEXICON_IN_STASH = was
	print("LEXSTASH: %d checks, %d wrong" % [n, bad.size()])
